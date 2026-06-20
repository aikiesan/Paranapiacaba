"""Shared helpers for the Paranapiacaba WebGIS conversion pipeline.

All outputs are RFC 7946 GeoJSON in EPSG:4326 with coordinates rounded to keep
the files small enough to serve statically from GitHub Pages.
"""
from __future__ import annotations

import glob
import json
import math
import os
import re
import unicodedata
import warnings

import geopandas as gpd
import numpy as np
from shapely import make_valid
from shapely.geometry import LineString, Point, mapping

warnings.filterwarnings("ignore")

WGS84 = 4326
# Most source layers are SIRGAS 2000 geographic (EPSG:4674); when a layer has no
# CRS we assume that rather than guessing.
DEFAULT_SRC_EPSG = 4674


def read_vector(path, columns=None):
    """Read a shapefile.

    The source DBFs ship a ``.cpg`` claiming UTF-8 while the bytes are actually
    Latin-1/ISO-8859-1. GDAL/pyogrio's default read decodes them correctly
    (byte 0xE1 -> U+00E1 'á'), so no override is needed — accented names like
    "São Paulo"/"Jundiaí" come through as proper UTF-8 in the output GeoJSON.
    """
    return gpd.read_file(path, columns=columns)


def to_wgs84(gdf):
    """Ensure the GeoDataFrame is in EPSG:4326, assuming SIRGAS 2000 if unset."""
    if gdf.crs is None:
        gdf = gdf.set_crs(DEFAULT_SRC_EPSG, allow_override=True)
    if gdf.crs.to_epsg() != WGS84:
        gdf = gdf.to_crs(WGS84)
    return gdf


def repair_crs(gdf, assume_epsg):
    """Force a (wrong/missing) CRS to ``assume_epsg`` then reproject to 4326.

    Used for the SIRGAS_SHP_* layers whose coordinates are UTM (EPSG:31983) but
    are mislabelled as geographic.
    """
    gdf = gdf.set_crs(assume_epsg, allow_override=True)
    return gdf.to_crs(WGS84)


def fix_geometry(gdf):
    """Repair invalid geometries (common in the CAD-derived polygon layers)."""
    gdf = gdf[gdf.geometry.notna() & ~gdf.geometry.is_empty].copy()
    invalid = ~gdf.geometry.is_valid
    if invalid.any():
        name = gdf.geometry.name
        gdf.loc[invalid, name] = gdf.loc[invalid, name].apply(make_valid)
        gdf = gdf[gdf.geometry.notna() & ~gdf.geometry.is_empty]
    return gdf


def clip_to(gdf, mask_geom):
    """Keep only features intersecting ``mask_geom`` (a shapely geometry in 4326)."""
    if mask_geom is None:
        return gdf
    gdf = fix_geometry(to_wgs84(gdf))
    try:
        return gpd.clip(gdf, mask_geom)
    except Exception:
        return gdf[gdf.intersects(mask_geom)]


def slim(gdf, keep=None, extra=None):
    """Rename/keep a subset of columns; attach constant ``extra`` columns.

    ``keep`` maps source column -> output column. Missing source columns are
    skipped silently (schemas vary across the SIGA families).
    """
    out = gpd.GeoDataFrame(geometry=gdf.geometry.values, crs=gdf.crs)
    if keep:
        for src, dst in keep.items():
            if src in gdf.columns:
                out[dst] = gdf[src].values
    if extra:
        for k, v in extra.items():
            out[k] = v
    return out


def simplify_geom(gdf, tol):
    if not tol:
        return gdf
    gdf = gdf.copy()
    gdf["geometry"] = gdf.geometry.simplify(tol, preserve_topology=True)
    gdf = gdf[gdf.geometry.notna() & ~gdf.geometry.is_empty]
    return gdf


_REGION_KW = [
    ("funicular", "funicular"), ("quilomb", "quilombo"), ("mogi", "rio_mogi"),
    ("quatinga", "quatinga"), ("pedra grande", "quatinga"),
    ("cachoeira", "cachoeiras"), ("carvoeiro", "cachoeiras"),
    ("anhangab", "cachoeiras"), ("perdidos", "cachoeiras"),
    ("campainha", "cachoeiras"), ("escorrega", "cachoeiras"),
    ("formoso", "cachoeiras"), ("banheira", "cachoeiras"),
]


def _strip_accents(s):
    return "".join(c for c in unicodedata.normalize("NFKD", s or "")
                   if not unicodedata.combining(c)).lower()


def _classify_trail(nome, fname):
    text = _strip_accents(nome) + " " + _strip_accents(os.path.basename(fname))
    for kw, region in _REGION_KW:
        if kw in text:
            return region
    return "geral"


def read_kml_tracks(kml_dir, simplify_tol=1e-5):
    """Parse Wikiloc KML exports into a trilhas GeoDataFrame (EPSG:4326).

    Each KML holds one track <LineString> with lon,lat,elevation. We extract
    the track, the human name, total length (km, via UTM 31983) and positive
    elevation gain (m, from the Z values), and classify region for styling.
    """
    rows = []
    for f in sorted(glob.glob(os.path.join(kml_dir, "*.kml"))):
        # The folder mixes encodings: some KMLs are UTF-8, some cp1252.
        data = open(f, "rb").read()
        raw = None
        for enc in ("utf-8", "cp1252", "latin-1"):
            try:
                raw = data.decode(enc)
                break
            except UnicodeDecodeError:
                continue
        if raw is None:
            continue
        m = re.search(r"<LineString>.*?<coordinates>(.*?)</coordinates>", raw, re.S)
        if not m:
            continue
        pts = []
        for tok in m.group(1).split():
            c = tok.split(",")
            if len(c) >= 2:
                try:
                    pts.append((float(c[0]), float(c[1]),
                                float(c[2]) if len(c) > 2 else 0.0))
                except ValueError:
                    pass
        if len(pts) < 2:
            continue
        nome = None
        for n in re.findall(r"<name>(.*?)</name>", raw, re.S):
            n = n.strip()
            if n and n not in ("Trails", "Path", "Waypoints") and not n.startswith("Track "):
                nome = n
                break
        if not nome:
            nome = os.path.splitext(os.path.basename(f))[0].replace("-", " ").strip().title()
        gain = sum(max(0.0, pts[i][2] - pts[i - 1][2]) for i in range(1, len(pts)))
        rows.append({
            "nome": nome,
            "desnivel_m": round(gain),
            "regiao": _classify_trail(nome, f),
            "tipo": "Trilha",
            "geometry": LineString([(p[0], p[1]) for p in pts]),
        })
    gdf = gpd.GeoDataFrame(rows, crs="EPSG:4326")
    gdf["distancia_km"] = (gdf.to_crs(31983).length / 1000).round(2)
    if simplify_tol:
        gdf["geometry"] = gdf.geometry.simplify(simplify_tol, preserve_topology=False)
    return gdf


# Keyword -> attraction type (matches the app's icon/palette keys, no accents).
_ATRATIVO_KW = [
    ("cachoeira", "cachoeira"), ("cascata", "cachoeira"), ("salto", "cachoeira"),
    ("poco", "poco"), ("poca", "poco"),
    ("mirante", "mirante"), ("vista", "mirante"),
    ("pedra", "pedra"), ("nascente", "nascente"),
    ("ruina", "ruina"), ("gruta", "gruta"), ("caverna", "gruta"),
]


def _read_kml_text(path):
    data = open(path, "rb").read()
    for enc in ("utf-8", "cp1252", "latin-1"):
        try:
            return data.decode(enc)
        except UnicodeDecodeError:
            continue
    return None


def read_kml_waypoints(kml_dir, snap=0.0003):
    """Extract natural-attraction waypoints (Points) from the Wikiloc KMLs.

    Keeps only recognized attraction types (cachoeira/poço/mirante/pedra/
    nascente/ruína/gruta — the categories the app already styles), drops
    navigation points, and de-duplicates near-identical points (~33 m grid)
    that repeat across overlapping trails.
    """
    seen = {}
    for f in sorted(glob.glob(os.path.join(kml_dir, "*.kml"))):
        raw = _read_kml_text(f)
        if not raw:
            continue
        for pm in re.findall(r"<Placemark>(.*?)</Placemark>", raw, re.S):
            if "<Point>" not in pm:
                continue
            cm = re.search(r"<Point>.*?<coordinates>(.*?)</coordinates>", pm, re.S)
            nm = re.search(r"<name>(.*?)</name>", pm, re.S)
            if not cm or not nm:
                continue
            c = cm.group(1).strip().split(",")
            if len(c) < 2:
                continue
            try:
                lon, lat = float(c[0]), float(c[1])
            except ValueError:
                continue
            nome = re.sub(r"\s+", " ", nm.group(1)).strip()
            t = _strip_accents(nome)
            tipo = next((tp for kw, tp in _ATRATIVO_KW if kw in t), None)
            if tipo is None:
                continue
            key = (tipo, round(lon / snap), round(lat / snap))
            if key in seen:
                if len(nome) > len(seen[key]["nome"]):
                    seen[key]["nome"] = nome
                continue
            seen[key] = {"nome": nome, "tipo": tipo,
                         "regiao": _classify_trail(nome, f),
                         "geometry": Point(lon, lat)}
    return gpd.GeoDataFrame(list(seen.values()), crs="EPSG:4326")


def _round(obj, p):
    if isinstance(obj, (list, tuple)):
        return [_round(o, p) for o in obj]
    if isinstance(obj, float):
        return round(obj, p)
    return obj


def _clean_val(v):
    if v is None:
        return None
    if isinstance(v, np.generic):          # numpy scalar -> native python
        v = v.item()
    if isinstance(v, bool):                # before int (bool subclasses int)
        return v
    if isinstance(v, int):
        return v
    if isinstance(v, float):
        return None if (math.isnan(v) or math.isinf(v)) else v
    s = str(v).strip()
    return None if s in ("", "None", "nan", "NaN", "<NA>") else s


def write_geojson(gdf, out_path, precision=6):
    """Write a compact RFC 7946 FeatureCollection (4326, rounded coords)."""
    gdf = to_wgs84(gdf)
    geom_name = gdf.geometry.name
    features = []
    for _, row in gdf.iterrows():
        geom = row[geom_name]
        if geom is None or geom.is_empty:
            continue
        props = {}
        for k, v in row.items():
            if k == geom_name:
                continue
            cv = _clean_val(v)
            if cv is not None:
                props[k] = cv
        features.append({
            "type": "Feature",
            "properties": props,
            "geometry": _round_geometry(mapping(geom), precision),
        })
    fc = {"type": "FeatureCollection", "features": features}
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(fc, f, ensure_ascii=False, separators=(",", ":"))
    return len(features), os.path.getsize(out_path)


def _round_geometry(geom, p):
    geom = dict(geom)
    if "coordinates" in geom:
        geom["coordinates"] = _round(geom["coordinates"], p)
    if "geometries" in geom:
        geom["geometries"] = [_round_geometry(g, p) for g in geom["geometries"]]
    return geom
