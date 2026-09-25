"""Build the slope-class layer (Classes de Declividade) for the WebGIS.

Source: Copernicus DEM GLO-30 (tile S24/W047, ~30 m, EPSG:4326), downloaded
once to scripts/.cache/. Slope % is computed with Horn's 3x3 method using
metric cell sizes at the AOI latitude, reclassified into the 5 FAPESP classes,
cleaned of tiny patches (sieve) and published two ways:

  * public/data/declividade.geojson  — vector classes for the layer catalog
  * public/data/rasters/declividade.png + manifest["declividade"] — raster overlay

Note: GLO-30 is a surface model (DSM); in closed forest the canopy smooths the
terrain slightly. It is adequate for the 1:25.000–1:50.000 escarpment reading,
not for lot-scale geotechnical analysis.

Run:  python build_declividade.py
"""
import json
import os
import urllib.request

import numpy as np
import rasterio
from PIL import Image
from rasterio import features
from rasterio.windows import from_bounds
from shapely.geometry import mapping, shape

import config as C

DEM_URL = ("https://copernicus-dem-30m.s3.amazonaws.com/"
           "Copernicus_DSM_COG_10_S24_00_W047_00_DEM/"
           "Copernicus_DSM_COG_10_S24_00_W047_00_DEM.tif")
DEM_CACHE = os.path.join(C.CACHE_DIR, "copernicus_glo30_S24_W047.tif")

# Same analysis window used by the MapBiomas coverage overlays.
AOI = (-46.3423, -23.8188, -46.2623, -23.7388)  # lon_min, lat_min, lon_max, lat_max

SLOPE_BREAKS = [8, 20, 30, 45]
SLOPE_CLASSES = [
    ("#1a9850", "0–8% (Plano/Suave)"),
    ("#a6d96a", "8–20% (Moderado)"),
    ("#fee08b", "20–30% (Forte ondulado)"),
    ("#fdae61", "30–45% (Declivoso)"),
    ("#d73027", ">45% (Escarpado)"),
]
SIEVE_CELLS = 6          # patches smaller than ~0.5 ha are merged into neighbours
SIMPLIFY_DEG = 0.00004   # ~4 m
RASTER_OUT = os.path.join(C.OUT_DIR, "rasters")


def _hex_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def load_dem():
    if not os.path.exists(DEM_CACHE):
        os.makedirs(C.CACHE_DIR, exist_ok=True)
        print("  downloading Copernicus GLO-30 tile ...")
        urllib.request.urlretrieve(DEM_URL, DEM_CACHE)
    with rasterio.open(DEM_CACHE) as ds:
        win = from_bounds(*AOI, transform=ds.transform).round_offsets().round_lengths()
        dem = ds.read(1, window=win).astype("float64")
        transform = ds.window_transform(win)
    return dem, transform


def horn_slope_pct(dem, transform):
    lat_c = transform.f + transform.e * dem.shape[0] / 2
    dx = abs(transform.a) * 111320.0 * np.cos(np.radians(lat_c))
    dy = abs(transform.e) * 110574.0
    z = np.pad(dem, 1, mode="edge")
    a, b, c = z[:-2, :-2], z[:-2, 1:-1], z[:-2, 2:]
    d, f = z[1:-1, :-2], z[1:-1, 2:]
    g, h, i = z[2:, :-2], z[2:, 1:-1], z[2:, 2:]
    dzdx = ((c + 2 * f + i) - (a + 2 * d + g)) / (8 * dx)
    dzdy = ((g + 2 * h + i) - (a + 2 * b + c)) / (8 * dy)
    return np.hypot(dzdx, dzdy) * 100.0


def main():
    print("Building declividade (Copernicus GLO-30)")
    dem, transform = load_dem()
    slope = horn_slope_pct(dem, transform)
    klass = np.digitize(slope, SLOPE_BREAKS).astype("uint8")  # 0..4
    klass = features.sieve(klass, size=SIEVE_CELLS, connectivity=8)

    feats = []
    for geom, value in features.shapes(klass, transform=transform, connectivity=8):
        k = int(value)
        poly = shape(geom).simplify(SIMPLIFY_DEG, preserve_topology=True)
        if poly.is_empty:
            continue
        color, label = SLOPE_CLASSES[k]
        feats.append({
            "type": "Feature",
            "properties": {"classe": k + 1, "faixa": label, "cor": color},
            "geometry": {"type": poly.geom_type,
                         "coordinates": _round(mapping(poly)["coordinates"])},
        })
    fc = {"type": "FeatureCollection", "features": feats}
    out = os.path.join(C.OUT_DIR, "declividade.geojson")
    with open(out, "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))

    rgba = np.zeros((*klass.shape, 4), np.uint8)
    for k, (color, _) in enumerate(SLOPE_CLASSES):
        rgba[klass == k] = (*_hex_rgb(color), 200)
    os.makedirs(RASTER_OUT, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(os.path.join(RASTER_OUT, "declividade.png"))

    west, north = transform.c, transform.f
    east = west + transform.a * klass.shape[1]
    south = north + transform.e * klass.shape[0]
    manifest_path = os.path.join(RASTER_OUT, "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as fh:
            manifest = json.load(fh)
    manifest["declividade"] = {
        "bounds": [[south, west], [north, east]],
        "legend": [{"color": c, "label": l} for c, l in SLOPE_CLASSES],
        "source": "Copernicus DEM GLO-30 (ESA/Airbus)",
    }
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False)

    counts = np.bincount(klass.ravel(), minlength=5) / klass.size * 100
    print(f"  DEM {dem.shape}, {len(feats)} polygons, elev {dem.min():.0f}–{dem.max():.0f} m")
    for (_, label), pct in zip(SLOPE_CLASSES, counts):
        print(f"    {label:28s} {pct:5.1f}%")


def _round(coords):
    """Round nested coordinates to 6 decimals (~0.1 m) to keep the file small."""
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], 6), round(coords[1], 6)]
    return [_round(c) for c in coords]


if __name__ == "__main__":
    main()
