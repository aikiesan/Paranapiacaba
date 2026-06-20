"""Fetch OpenStreetMap railway lines for the Jundiaí->Santos corridor.

Cached to scripts/.cache/osm_rail.geojson and merged (best-effort) by
build_data.py to backstop continuity of the corridor where the national
BaseFerro layer is generalized (notably the Serra do Mar descent to Santos).

Run once:  python fetch_osm_railway.py
"""
import json
import os

import requests
from shapely.geometry import LineString, MultiLineString, mapping

import config as C

OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]
HEADERS = {"User-Agent": "paranapiacaba-webgis/1.0 (FAPESP PUC-Campinas research)"}


def query():
    s, w, n, e = C.CORRIDOR_BBOX[1], C.CORRIDOR_BBOX[0], C.CORRIDOR_BBOX[3], C.CORRIDOR_BBOX[2]
    # rail + narrow_gauge (the SPR/Funicular were metre/narrow gauge in part)
    return f"""
    [out:json][timeout:120];
    (
      way["railway"~"^(rail|narrow_gauge|light_rail)$"]({s},{w},{n},{e});
    );
    out geom tags;
    """


def main():
    os.makedirs(C.CACHE_DIR, exist_ok=True)
    out = os.path.join(C.CACHE_DIR, "osm_rail.geojson")
    print("Querying Overpass for corridor railways...")
    data = None
    for url in OVERPASS_MIRRORS:
        try:
            r = requests.post(url, data={"data": query()}, headers=HEADERS, timeout=180)
            r.raise_for_status()
            data = r.json()
            break
        except Exception as e:
            print(f"  {url} failed: {e}")
    if data is None:
        print("  All Overpass mirrors failed (build_data.py falls back to BaseFerro only).")
        return

    feats = []
    for el in data.get("elements", []):
        if el.get("type") != "way" or "geometry" not in el:
            continue
        coords = [(p["lon"], p["lat"]) for p in el["geometry"]]
        if len(coords) < 2:
            continue
        tags = el.get("tags", {})
        feats.append({
            "type": "Feature",
            "properties": {"name": tags.get("name"), "railway": tags.get("railway"),
                           "usage": tags.get("usage")},
            "geometry": mapping(LineString(coords)),
        })
    fc = {"type": "FeatureCollection", "features": feats}
    with open(out, "w", encoding="utf-8") as f:
        json.dump(fc, f, ensure_ascii=False)
    print(f"  Saved {len(feats)} OSM rail ways -> {os.path.relpath(out, C.REPO)}")


if __name__ == "__main__":
    main()
