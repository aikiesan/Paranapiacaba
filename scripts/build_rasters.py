"""Build raster overlays for the WebGIS:

1. MapBiomas land-cover (2008–2024): colorize each coverage GeoTIFF to a PNG
   (transparent background) for a year-slider image overlay.
2. Orthophoto 2010: publish the georeferenced GeoTIFF as a WebP overlay.

Declividade (raster + vector) is built by build_declividade.py from the
Copernicus DEM GLO-30; the old contour-interpolated DEM produced a single class.

Outputs to public/data/rasters/ + a manifest.json consumed by RasterControl.
Run:  python build_rasters.py
"""
import glob
import json
import os
import re
import warnings

import numpy as np
import rasterio
from PIL import Image
from pyproj import Transformer

import config as C

warnings.filterwarnings("ignore")
RASTER_OUT = os.path.join(C.OUT_DIR, "rasters")

# MapBiomas Collection colours (subset of classes present locally) -> label.
MAPBIOMAS = {
    3:  ("#1f8d49", "Formação Florestal"),
    9:  ("#7a5900", "Silvicultura"),
    11: ("#519799", "Campo Alagado"),
    12: ("#d6bc74", "Formação Campestre"),
    15: ("#edde8e", "Pastagem"),
    21: ("#ffefc3", "Mosaico de Usos"),
    24: ("#d4271e", "Área Urbanizada"),
    30: ("#9c0027", "Mineração"),
    33: ("#2532e4", "Rio, Lago e Oceano"),
    39: ("#f5b3c8", "Soja"),
    41: ("#f54ca9", "Outras Lavouras"),
}

def _hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def build_coverage():
    tifs = sorted(glob.glob(os.path.join(C.SOURCE_ROOT, "09_RASTERS_COBERTURA",
                                          "*coverage_[0-9][0-9][0-9][0-9].tif")))
    years, bounds, present = [], None, set()
    for t in tifs:
        m = re.search(r"coverage_(\d{4})", t)
        if not m:
            continue
        yr = int(m.group(1))
        with rasterio.open(t) as ds:
            a = ds.read(1)
            if bounds is None:
                b = ds.bounds
                bounds = [[b.bottom, b.left], [b.top, b.right]]
        rgba = np.zeros((*a.shape, 4), np.uint8)
        for code, (hexc, _) in MAPBIOMAS.items():
            mask = a == code
            if mask.any():
                rgba[mask] = (*_hex_rgb(hexc), 255)
                present.add(code)
        Image.fromarray(rgba, "RGBA").save(os.path.join(RASTER_OUT, f"coverage_{yr}.png"))
        years.append(yr)
    legend = [{"color": MAPBIOMAS[c][0], "label": MAPBIOMAS[c][1]}
              for c in sorted(present)]
    if not years:
        print("  coverage: sources not found, preserving existing manifest entry")
        return None
    print(f"  coverage: {len(years)} years {min(years)}–{max(years)}")
    return {"years": sorted(years), "bounds": bounds, "legend": legend}


def build_orthophoto():
    """Publish the full-resolution 2010 orthophoto as a browser-efficient WebP."""
    candidates = glob.glob(os.path.join(C.ORTHOPHOTO_ROOT, "Ortofoto_Paranapiacaba_2010.tif"))
    if not candidates:
        print("  orthophoto: source not found, skipping")
        return None

    with rasterio.open(candidates[0]) as ds:
        rgb = np.moveaxis(ds.read([1, 2, 3]), 0, -1)
        b = ds.bounds
        source_crs = str(ds.crs) if ds.crs else None
        source_resolution = [abs(float(ds.res[0])), abs(float(ds.res[1]))]
        if ds.crs and ds.crs.to_epsg() != 4326:
            tr = Transformer.from_crs(ds.crs, 4326, always_xy=True)
            west, south = tr.transform(b.left, b.bottom)
            east, north = tr.transform(b.right, b.top)
        else:
            west, south, east, north = b.left, b.bottom, b.right, b.top

    filename = "ortofoto_paranapiacaba_2010.webp"
    Image.fromarray(rgb, "RGB").save(
        os.path.join(RASTER_OUT, filename), "WEBP", quality=92, method=6
    )
    print(f"  orthophoto: {rgb.shape[1]}x{rgb.shape[0]} full-resolution WebP")
    return {
        "file": filename,
        "bounds": [[south, west], [north, east]],
        "year": 2010,
        "sourceCrs": source_crs,
        "resolution": source_resolution,
        "attribution": "Ortofoto Paranapiacaba 2010",
    }


def main():
    os.makedirs(RASTER_OUT, exist_ok=True)
    print("Building raster overlays ->", os.path.relpath(RASTER_OUT, C.REPO))
    manifest_path = os.path.join(RASTER_OUT, "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as existing:
            manifest = json.load(existing)
    coverage = build_coverage()
    if coverage:
        manifest["coverage"] = coverage
    orthophoto = build_orthophoto()
    if orthophoto:
        manifest["orthophoto"] = orthophoto
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False)
    print("  manifest.json written")


if __name__ == "__main__":
    main()
