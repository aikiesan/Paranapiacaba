"""Prepare a readable 5 m display subset of the published Vila contours.

The legacy published GeoJSON was dissolved after its elevation field had been
discarded, and contains many exact duplicate CAD line strings. This utility
explodes that geometry, removes direction-insensitive duplicates and keeps one
line in every five in the original CAD order. It is a display cadence for the
WebGIS; the source GeoJSON does not support elevation labels.

When the original shapefile is available, ``build_data.py`` applies the same
``deduplicate_geometry`` and ``feature_stride`` settings before dissolving.
"""
from __future__ import annotations

import json
from pathlib import Path

from shapely.geometry import MultiLineString, mapping, shape


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "public" / "data" / "curvas_nivel.geojson"
STRIDE = 5


def canonical_key(line):
    return line.normalize().wkb


def main() -> None:
    payload = json.loads(TARGET.read_text(encoding="utf-8"))
    lines = []
    seen = set()

    for feature in payload.get("features", []):
        geometry = shape(feature["geometry"])
        parts = geometry.geoms if geometry.geom_type == "MultiLineString" else [geometry]
        for line in parts:
            key = canonical_key(line)
            if key in seen:
                continue
            seen.add(key)
            lines.append(line)

    selected = lines[::STRIDE]
    result = {
        "type": "FeatureCollection",
        "features": [{
            "type": "Feature",
            "properties": {
                "tipo": "Curvas de nível (Vila)",
                "intervalo_exibicao_m": 5,
                "metodo": "cadência 1:5 da base CAD de 1 m, após deduplicação",
            },
            "geometry": mapping(MultiLineString(selected)),
        }],
    }
    TARGET.write_text(
        json.dumps(result, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(
        f"curvas_nivel.geojson: {len(lines):,} unique source lines -> "
        f"{len(selected):,} display lines ({STRIDE} m nominal cadence)"
    )


if __name__ == "__main__":
    main()
