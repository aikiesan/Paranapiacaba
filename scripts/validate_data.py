"""Validate the generated public/data/*.geojson files.

Checks each file is a non-empty RFC 7946 FeatureCollection whose bounding box
falls within the broad project region. Exits non-zero on any failure so it can
gate CI.
"""
import glob
import json
import os
import sys

import config as C

# Generous sanity envelope (state of São Paulo-ish): lon, lat.
REGION = (-48.5, -25.5, -45.5, -22.5)


def bbox_of(features):
    xs, ys = [], []

    def walk(coords):
        if coords and isinstance(coords[0], (int, float)):
            xs.append(coords[0]); ys.append(coords[1])
        else:
            for c in coords:
                walk(c)

    for f in features:
        g = f.get("geometry") or {}
        if "coordinates" in g:
            walk(g["coordinates"])
        for sub in g.get("geometries", []):
            walk(sub.get("coordinates", []))
    if not xs:
        return None
    return (min(xs), min(ys), max(xs), max(ys))


def main():
    files = sorted(glob.glob(os.path.join(C.OUT_DIR, "*.geojson")))
    if not files:
        print("No GeoJSON files found in public/data/.")
        sys.exit(1)

    failures = 0
    print(f"Validating {len(files)} file(s):\n")
    for path in files:
        name = os.path.basename(path)
        errs = []
        try:
            with open(path, encoding="utf-8") as f:
                fc = json.load(f)
        except Exception as e:
            print(f"  FAIL {name}: not valid JSON ({e})")
            failures += 1
            continue
        if fc.get("type") != "FeatureCollection":
            errs.append("not a FeatureCollection")
        feats = fc.get("features", [])
        if not feats:
            errs.append("zero features")
        bb = bbox_of(feats)
        if bb:
            if not (REGION[0] <= bb[0] and bb[2] <= REGION[2]
                    and REGION[1] <= bb[1] and bb[3] <= REGION[3]):
                errs.append(f"bbox out of region: {tuple(round(v, 3) for v in bb)}")
        elif feats:
            errs.append("no coordinates")

        if errs:
            failures += 1
            print(f"  FAIL {name}: {'; '.join(errs)}")
        else:
            print(f"  ok   {name}: {len(feats)} features")

    print()
    if failures:
        print(f"{failures} file(s) failed validation.")
        sys.exit(1)
    print("All files valid.")


if __name__ == "__main__":
    main()
