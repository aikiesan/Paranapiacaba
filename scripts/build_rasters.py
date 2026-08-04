"""Build raster overlays for the WebGIS:

1. MapBiomas land-cover (2008–2024): colorize each coverage GeoTIFF to a PNG
   (transparent background) for a year-slider image overlay.
2. Declividade: interpolate a DEM from the detailed contour lines (which carry
   an Elevation field), compute slope %, reclassify into 5 classes per the
   FAPESP proposal, and render to a PNG overlay.

Outputs to public/data/rasters/ + a manifest.json consumed by RasterControl.
Run:  python build_rasters.py
"""
import glob
import json
import os
import re
import warnings

import geopandas as gpd
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

# Declividade — 5 classes (% slope) and colours (green -> red).
SLOPE_BREAKS = [8, 20, 30, 45]
SLOPE_CLASSES = [
    ("#1a9850", "0–8% (Plano/Suave)"),
    ("#a6d96a", "8–20% (Moderado)"),
    ("#fee08b", "20–30% (Forte ondulado)"),
    ("#fdae61", "30–45% (Declivoso)"),
    ("#d73027", ">45% (Escarpado)"),
]


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


def build_declividade(res=12.0, max_vertices=120000):
    cv = glob.glob(C.src("11_CADASTRO_VILA_GEOREF", "*curvas*.shp"))
    if not cv:
        print("  declividade: contour shapefile not found, skipping")
        return None
    from scipy.interpolate import griddata
    g = gpd.read_file(cv[0])  # EPSG:31983, has 'Elevation' + Z
    src_epsg = g.crs.to_epsg() or 31983

    xs, ys, zs = [], [], []
    for geom, elev in zip(g.geometry, g.get("Elevation", [None] * len(g))):
        if geom is None or geom.is_empty:
            continue
        parts = geom.geoms if geom.geom_type.startswith("Multi") else [geom]
        for part in parts:
            for c in part.coords:
                z = c[2] if (len(c) > 2 and c[2]) else elev
                if z is None:
                    continue
                xs.append(c[0]); ys.append(c[1]); zs.append(float(z))
    if len(xs) < 100:
        print("  declividade: not enough elevation points, skipping")
        return None
    xs, ys, zs = np.array(xs), np.array(ys), np.array(zs)
    if len(xs) > max_vertices:                       # downsample for speed
        idx = np.linspace(0, len(xs) - 1, max_vertices).astype(int)
        xs, ys, zs = xs[idx], ys[idx], zs[idx]

    xmin, xmax, ymin, ymax = xs.min(), xs.max(), ys.min(), ys.max()
    gx = np.arange(xmin, xmax, res)
    gy = np.arange(ymin, ymax, res)
    GX, GY = np.meshgrid(gx, gy)
    dem = griddata((xs, ys), zs, (GX, GY), method="linear")
    dzdy, dzdx = np.gradient(dem, res, res)
    slope = np.sqrt(dzdx ** 2 + dzdy ** 2) * 100.0
    klass = np.digitize(slope, SLOPE_BREAKS)          # 0..4

    rgba = np.zeros((*slope.shape, 4), np.uint8)
    for i, (hexc, _) in enumerate(SLOPE_CLASSES):
        mask = (klass == i) & np.isfinite(slope)
        rgba[mask] = (*_hex_rgb(hexc), 200)
    rgba = np.flipud(rgba)                             # grid is south->north; PNG north on top
    Image.fromarray(rgba, "RGBA").save(os.path.join(RASTER_OUT, "declividade.png"))

    tr = Transformer.from_crs(src_epsg, 4326, always_xy=True)
    w, s = tr.transform(xmin, ymin)
    e, n = tr.transform(xmax, ymax)
    legend = [{"color": c, "label": l} for c, l in SLOPE_CLASSES]
    print(f"  declividade: DEM {dem.shape} from {len(xs)} contour vertices")
    return {"bounds": [[s, w], [n, e]], "legend": legend}


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
    decl = build_declividade()
    if decl:
        manifest["declividade"] = decl
    orthophoto = build_orthophoto()
    if orthophoto:
        manifest["orthophoto"] = orthophoto
    with open(manifest_path, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False)
    print("  manifest.json written")


if __name__ == "__main__":
    main()
