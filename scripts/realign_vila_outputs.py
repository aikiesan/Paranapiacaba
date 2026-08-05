"""Apply the Ortofoto 2010 calibration to existing published Vila GeoJSONs.

Use this migration when the original Palazzi/PAC/CAD shapefiles are not locally
available. Fresh builds should use the named nudges in config.py instead. A
versioned manifest prevents the translation from being applied twice.
"""

from __future__ import annotations

import json
from pathlib import Path

import config as C


VERSION = 1
LEGACY_NUDGE = (-0.0000316, -0.0000303)
MANIFEST = Path(C.OUT_DIR) / "vila_alignment.json"
LAYER_CALIBRATIONS = {
    "ferrovia_local.geojson": "cad_linework",
    "patrimonio_ferroviario.geojson": "palazzi_buildings",
    "hidrografia.geojson": "palazzi_buildings",
    "edificacoes_vila.geojson": "palazzi_buildings",
    "pac_lotes.geojson": "pac_lots",
    "edificacoes_cad.geojson": "cad_linework",
    "sistema_viario.geojson": "road_system",
    "caminhos_vila.geojson": "palazzi_paths",
    "curvas_nivel.geojson": "cad_linework",
}


def translate_coordinates(value, dx: float, dy: float):
    if not isinstance(value, list):
        return value
    if value and isinstance(value[0], (int, float)):
        shifted = list(value)
        shifted[0] = round(shifted[0] + dx, 10)
        shifted[1] = round(shifted[1] + dy, 10)
        return shifted
    return [translate_coordinates(item, dx, dy) for item in value]


def translate_geojson(path: Path, dx: float, dy: float) -> int:
    document = json.loads(path.read_text(encoding="utf-8"))
    features = document.get("features", [])
    for feature in features:
        geometry = feature.get("geometry")
        if geometry and geometry.get("coordinates") is not None:
            geometry["coordinates"] = translate_coordinates(geometry["coordinates"], dx, dy)
    path.write_text(
        json.dumps(document, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )
    return len(features)


def main() -> None:
    if MANIFEST.exists():
        existing = json.loads(MANIFEST.read_text(encoding="utf-8"))
        if existing.get("version", 0) >= VERSION:
            raise SystemExit(
                f"Alignment version {existing['version']} is already applied ({MANIFEST})."
            )

    results = []
    for filename, calibration in LAYER_CALIBRATIONS.items():
        path = Path(C.OUT_DIR) / filename
        if not path.exists():
            print(f"skip missing: {filename}")
            continue
        target = C.VILA_ALIGNMENT_NUDGES_DEG[calibration]
        delta = (target[0] - LEGACY_NUDGE[0], target[1] - LEGACY_NUDGE[1])
        count = translate_geojson(path, *delta)
        results.append(
            {
                "file": filename,
                "calibration": calibration,
                "translationFromPublished2026": [round(delta[0], 10), round(delta[1], 10)],
                "targetNudgeFromRawSource": [target[0], target[1]],
                "features": count,
            }
        )
        print(f"aligned {filename}: {count} feature(s), delta={delta}")

    manifest = {
        "version": VERSION,
        "reference": "Ortofoto Paranapiacaba 2010",
        "method": "Independent edge-to-image calibration with visual inspection",
        "legacyNudge": list(LEGACY_NUDGE),
        "layers": results,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {MANIFEST}")


if __name__ == "__main__":
    main()
