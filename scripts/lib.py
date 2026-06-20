"""Shared helpers for the Paranapiacaba WebGIS conversion pipeline.

All outputs are RFC 7946 GeoJSON in EPSG:4326 with coordinates rounded to keep
the files small enough to serve statically from GitHub Pages.
"""
from __future__ import annotations

import json
import math
import os
import warnings

import geopandas as gpd
import numpy as np
from shapely import make_valid
from shapely.geometry import mapping

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


def _round(obj, p):
    if isinstance(obj, (list, tuple)):
        return [_round(o, p) for o in obj]
    if isinstance(obj, float):
        return round(obj, p)
    return obj


def _clean_val(v):
    if v is None:
        return None
    if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
        return None
    if isinstance(v, (np.integer,)):
        return int(v)
    if isinstance(v, (np.floating,)):
        f = float(v)
        return None if math.isnan(f) else f
    if isinstance(v, (np.bool_,)):
        return bool(v)
    s = v if isinstance(v, str) else str(v)
    s = s.strip()
    return None if s in ("", "None", "nan", "<NA>") else s


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
