"""Convert the organized source shapefiles into web GeoJSON for the WebGIS.

Usage:  python build_data.py [job_out ...]
With no args, builds every job in config.JOBS. Pass one or more output file
names (e.g. ``ferrovia_corredor.geojson``) to build just those.
"""
import glob
import json
import os
import subprocess
import sys
from collections import defaultdict

import geopandas as gpd
import pandas as pd
from shapely.geometry import box
from shapely.strtree import STRtree

import config as C
import lib


# --- masks -------------------------------------------------------------------
def corridor_mask():
    return box(*[C.CORRIDOR_BBOX[i] for i in (0, 1, 2, 3)])


def vila_reference_geometry():
    source = C.VILA_MASK_SRC
    if not os.path.exists(source):
        source = os.path.join(C.OUT_DIR, "limite_sitio.geojson")
    if not os.path.exists(source):
        raise FileNotFoundError("Vila mask source and public fallback are both missing")
    return lib.to_wgs84(lib.read_vector(source))


def vila_mask():
    g = vila_reference_geometry()
    return g.geometry.unary_union.buffer(C.VILA_BUFFER_DEG)


MASKS = {}


def serra_mask():
    g = vila_reference_geometry()
    return g.geometry.unary_union.buffer(C.SERRA_BUFFER_DEG)


def get_mask(name):
    if name not in MASKS:
        MASKS[name] = {"corridor": corridor_mask, "serra": serra_mask}.get(
            name, vila_mask)()
    return MASKS[name]


# --- helpers -----------------------------------------------------------------
GEOM_SUFFIXES = ("MPoint", "Point", "MPolygon", "Polygon", "MLine", "Line", "Polyline")


def resolve(src_list, root=None):
    paths = []
    for s in src_list:
        full = os.path.join(root, *s.split("/")) if root else C.src(*s.split("/"))
        hits = sorted(glob.glob(full))
        paths.extend(hits if hits else [full])
    return paths


def category_from_filename(path, prefix=""):
    base = os.path.splitext(os.path.basename(path))[0]
    if prefix and base.startswith(prefix):
        base = base[len(prefix):]
    for suf in GEOM_SUFFIXES:
        if base.endswith(suf):
            base = base[: -len(suf)]
            break
    return base.strip("_").replace("_", " ").strip() or "Outro"


def auto_name(gdf, out):
    lower = {c.lower(): c for c in gdf.columns}
    for cand in C.NAME_CANDIDATES:
        col = lower.get(cand.lower())
        if col and col != gdf.geometry.name:
            out["nome"] = gdf[col].values
            break
    for srccol, dst in (("ENDERECO", "endereco"), ("BAIRRO", "bairro"),
                        ("DSC_ENDERE", "endereco")):
        c = lower.get(srccol.lower())
        if c and dst not in out.columns:
            out[dst] = gdf[c].values
    return out


def process(gdf, job, category=None):
    if job.get("repair_epsg"):
        gdf = lib.repair_crs(gdf, job["repair_epsg"])
    else:
        gdf = lib.to_wgs84(gdf)

    flt = job.get("filter")
    if flt:
        col, vals = flt
        if col in gdf.columns:
            gdf = gdf[gdf[col].astype(str).str.strip().isin(vals)]

    out = lib.slim(gdf, keep=job.get("keep"), extra=job.get("extra"))
    if job.get("name_auto"):
        out = auto_name(gdf, out)
    if category is not None:
        out[job["family"]] = category
    return out


def run_mapshaper(path, pct):
    """Topology-aware simplify via mapshaper, writing to a temp file first.

    Only replace the original if mapshaper still produced a non-empty
    FeatureCollection (it emits a bare GeometryCollection when features lack
    properties, which would break the app's popups)."""
    import json
    tmp = path + ".ms.json"
    cmd = ["npx", "--yes", "mapshaper", path, "-simplify", pct, "keep-shapes",
           "-o", "force", tmp, "format=geojson"]
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True,
                       shell=os.name == "nt", timeout=300)
        with open(tmp, encoding="utf-8") as f:
            fc = json.load(f)
        if fc.get("type") == "FeatureCollection" and fc.get("features"):
            os.replace(tmp, path)
            return True
        print("      (mapshaper output not a FeatureCollection; kept geopandas version)")
    except Exception as e:
        print(f"      (mapshaper skipped: {e})")
    finally:
        if os.path.exists(tmp):
            os.remove(tmp)
    return False


RAIL_BUFFER = {}


def corridor_rail_buffer(deg):
    if deg not in RAIL_BUFFER:
        rail = lib.read_vector(C.src("04_FERROVIA_MOBILIDADE", "BaseFerro.shp"))
        rail = lib.clip_to(lib.to_wgs84(rail), corridor_mask())
        RAIL_BUFFER[deg] = rail.geometry.unary_union.buffer(deg)
    return RAIL_BUFFER[deg]


def read_palazzi_classification(root, filename, repair_epsg=None):
    path = os.path.join(root, filename)
    gdf = lib.read_vector(path)
    if repair_epsg:
        gdf = lib.repair_crs(gdf, repair_epsg)
    else:
        gdf = lib.to_wgs84(gdf)
    return lib.fix_geometry(gdf)


def match_palazzi_categories(base, root, sources, combine=False):
    """Match Palazzi hatch/footprint polygons back to the common building base."""
    projected = lib.fix_geometry(base).to_crs(31983)
    projected_geometries = list(projected.geometry)
    tree = STRtree(projected_geometries)
    scores = defaultdict(lambda: defaultdict(float))

    for filename, label, repair_epsg in sources:
        source = read_palazzi_classification(root, filename, repair_epsg).to_crs(31983)
        for geometry in source.geometry:
            candidates = tree.query(geometry)
            intersections = []
            for candidate in candidates:
                index = int(candidate)
                try:
                    area = geometry.intersection(projected_geometries[index]).area
                except Exception:
                    area = geometry.buffer(0).intersection(projected_geometries[index].buffer(0)).area
                if area > 0:
                    intersections.append((area, index))
            if intersections:
                area, index = max(intersections)
                scores[index][label] += area

    values = []
    for index in range(len(projected)):
        category_scores = scores.get(index)
        if not category_scores:
            values.append(None)
        elif combine:
            maximum = max(category_scores.values())
            labels = sorted(label for label, score in category_scores.items() if score >= maximum * 0.9)
            values.append(" / ".join(labels))
        else:
            values.append(max(category_scores, key=category_scores.get))
    return values


def build_palazzi_buildings(job):
    base_path = resolve(job["src"], job["root"])[0]
    base = lib.fix_geometry(lib.to_wgs84(lib.read_vector(base_path))).reset_index(drop=True)
    result = gpd.GeoDataFrame(
        {
            "uso": match_palazzi_categories(base, job["root"], job["usage_sources"], combine=True),
            "estado_conservacao": match_palazzi_categories(
                base, job["root"], job["conservation_sources"], combine=False
            ),
            "fonte": "Mapas Palazzi (catálogo MAPEAMENTO E SHAPEFILES_R01)",
        },
        geometry=base.geometry,
        crs="EPSG:4326",
    )
    result["uso"] = result["uso"].fillna("Sem dados")
    result["estado_conservacao"] = result["estado_conservacao"].fillna("Não avaliado")

    # The Palazzi common footprint file itself contains a small number of exact
    # duplicate geometries. Consolidate those records after category matching so
    # that a classified duplicate enriches the shared footprint instead of
    # drawing/counting the same building twice.
    consolidated = {}
    for row in result.itertuples(index=False):
        key = row.geometry.wkb
        if key not in consolidated:
            consolidated[key] = {
                "uso": row.uso,
                "estado_conservacao": row.estado_conservacao,
                "fonte": row.fonte,
                "geometry": row.geometry,
            }
            continue

        current = consolidated[key]
        for field, fallback in (("uso", "Sem dados"), ("estado_conservacao", "Não avaliado")):
            incoming = getattr(row, field)
            if current[field] == fallback and incoming != fallback:
                current[field] = incoming
            elif incoming != fallback and incoming not in current[field].split(" / "):
                current[field] = f"{current[field]} / {incoming}"

    base_count = len(result)
    result = gpd.GeoDataFrame(list(consolidated.values()), geometry="geometry", crs="EPSG:4326")
    print(
        "      Palazzi: "
        f"{len(result)} unique footprints ({base_count - len(result)} duplicate base records consolidated); "
        f"{(result['uso'] != 'Sem dados').sum()} with use; "
        f"{(result['estado_conservacao'] != 'Não avaliado').sum()} with conservation"
    )
    return result


def build_job(job):
    # Special case: layers built from Wikiloc KML (tracks or attraction waypoints).
    if job.get("kml_dir"):
        if job.get("kml_mode") == "waypoints":
            merged = lib.read_kml_waypoints(job["kml_dir"])
        else:
            merged = lib.read_kml_tracks(job["kml_dir"], job.get("simplify", 1e-5))
        if merged.empty:
            return None, 0, 0
        mask = get_mask(job["aoi"]) if job.get("aoi") else None
        if mask is not None:
            merged = lib.clip_to(merged, mask)
        out_path = os.path.join(C.OUT_DIR, job["out"])
        n, size = lib.write_geojson(merged, out_path)
        return out_path, n, size

    if job.get("palazzi_buildings"):
        merged = build_palazzi_buildings(job)
    else:
        paths = resolve(job["src"], job.get("root"))
        parts = []
        for p in paths:
            if not os.path.exists(p):
                print(f"      ! missing source: {os.path.relpath(p, C.SOURCE_ROOT)}")
                continue
            gdf = lib.read_vector(p)
            if gdf.empty:
                continue
            cat = category_from_filename(p, job.get("family_prefix", "")) if job.get("family") else None
            parts.append(process(gdf, job, category=cat))

        if not parts:
            return None, 0, 0
        merged = gpd.GeoDataFrame(pd.concat(parts, ignore_index=True), crs="EPSG:4326")

    mask = get_mask(job["aoi"]) if job.get("aoi") else None
    if mask is not None:
        merged = lib.clip_to(merged, mask)

    if job.get("rail_buffer_deg"):
        merged = lib.fix_geometry(merged)
        merged = merged[merged.intersects(corridor_rail_buffer(job["rail_buffer_deg"]))]

    if job.get("osm_rail_fill"):
        merged = add_osm_rail(merged, mask)

    merged = lib.simplify_geom(merged, job.get("simplify", 0))
    if merged.empty:
        return None, 0, 0

    if job.get("dissolve"):
        # Collapse many attribute-less segments (e.g. contour lines) into a single
        # (Multi)geometry feature — kills the per-feature GeoJSON overhead that
        # dominates file size when there are thousands of tiny parts. For lines we
        # just flatten into a MultiLineString (no unary_union: that would node at
        # every crossing and balloon the vertex count).
        from shapely.geometry import MultiLineString
        from shapely.ops import unary_union
        geoms = [g for g in merged.geometry.values if g is not None and not g.is_empty]
        if geoms and "Line" in geoms[0].geom_type:
            parts = []
            for g in geoms:
                parts.extend(g.geoms if g.geom_type == "MultiLineString" else [g])
            geom = MultiLineString(parts)
        else:
            geom = unary_union(geoms)
        merged = gpd.GeoDataFrame([{**(job.get("extra") or {}), "geometry": geom}],
                                  geometry="geometry", crs="EPSG:4326")

    if job.get("nudge"):
        nudge_name = job["nudge"]
        if nudge_name not in C.VILA_ALIGNMENT_NUDGES_DEG:
            raise ValueError(f"Unknown Vila alignment calibration: {nudge_name}")
        dlon, dlat = C.VILA_ALIGNMENT_NUDGES_DEG[nudge_name]
        merged["geometry"] = merged.geometry.translate(xoff=dlon, yoff=dlat)

    out_path = os.path.join(C.OUT_DIR, job["out"])
    n, size = lib.write_geojson(merged, out_path)
    if job.get("mapshaper"):
        if run_mapshaper(out_path, job["mapshaper"]):
            size = os.path.getsize(out_path)
    return out_path, n, size


def add_osm_rail(rail_gdf, mask):
    """Optionally merge cached OSM rail (run fetch_osm_railway.py first).

    Off by default: the national BaseFerro layer already covers Jundiaí->Santos
    continuously, and a wholesale OSM merge would duplicate geometry and pull in
    metro/yard track. Set OSM_FILL=1 to merge for coverage cross-checks."""
    cache = os.path.join(C.CACHE_DIR, "osm_rail.geojson")
    if "fonte" not in rail_gdf.columns:
        rail_gdf["fonte"] = "IBGE/BaseFerro"
    if not os.environ.get("OSM_FILL") or not os.path.exists(cache):
        return rail_gdf
    try:
        osm = lib.to_wgs84(gpd.read_file(cache))
        osm = lib.slim(osm, keep={"name": "nome"}, extra={"fonte": "OpenStreetMap"})
        if mask is not None:
            osm = lib.clip_to(osm, mask)
        return gpd.GeoDataFrame(pd.concat([rail_gdf, osm], ignore_index=True),
                                crs="EPSG:4326")
    except Exception as e:
        print(f"      (OSM fill skipped: {e})")
        return rail_gdf


def main():
    wanted = set(sys.argv[1:])
    jobs = [j for j in C.JOBS if not wanted or j["out"] in wanted]
    os.makedirs(C.OUT_DIR, exist_ok=True)

    print(f"Building {len(jobs)} layer(s) -> {os.path.relpath(C.OUT_DIR, C.REPO)}\n")
    print(f"{'layer':<32}{'features':>10}{'size':>12}")
    print("-" * 54)
    total = 0
    for job in jobs:
        try:
            path, n, size = build_job(job)
        except Exception as e:
            print(f"{job['out']:<32}{'ERROR':>10}   {e}")
            continue
        if path is None:
            print(f"{job['out']:<32}{'(empty)':>10}")
            continue
        total += size
        print(f"{job['out']:<32}{n:>10}{size/1024:>9.0f} KB")
    print("-" * 54)
    print(f"{'TOTAL':<32}{'':>10}{total/1024/1024:>9.2f} MB")


if __name__ == "__main__":
    main()
