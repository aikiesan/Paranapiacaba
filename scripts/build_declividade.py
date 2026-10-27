"""Build the relief layers (Classes de Declividade + Hipsometria) for the WebGIS.

Source: Copernicus DEM GLO-30 (tile S24/W047, ~30 m, EPSG:4326), downloaded
once to scripts/.cache/. The analysis window runs from the Paranapiacaba
escarpment west to the Parque Andreense (lon -46.481 to -46.453), all inside
the same tile.

  * Declividade: slope % with Horn's 3x3 method using metric cell sizes at the
    AOI latitude, reclassified into the 5 FAPESP classes.
  * Hipsometria: elevation reclassified into 8 altitude bands (sequential
    single-hue ramp, light = low, dark = high).

Both are cleaned of tiny patches (sieve) and published two ways:

  * public/data/<layer>.geojson  — vector classes for the layer catalog
  * public/data/rasters/<layer>.png + manifest["<layer>"] — raster overlay

Note: GLO-30 is a surface model (DSM); in closed forest the canopy smooths the
terrain slightly and adds ~10–20 m to the elevation. It is adequate for the
1:25.000–1:100.000 escarpment/plateau reading, not for lot-scale analysis.

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

# lon_min, lat_min, lon_max, lat_max. East/north/south edges are the MapBiomas
# coverage window; the west edge reaches past the Parque Andreense (-46.481).
AOI = (-46.50, -23.8188, -46.2623, -23.7388)

SLOPE_BREAKS = [8, 20, 30, 45]
SLOPE_CLASSES = [
    ("#1a9850", "0–8% (Plano/Suave)"),
    ("#a6d96a", "8–20% (Moderado)"),
    ("#fee08b", "20–30% (Forte ondulado)"),
    ("#fdae61", "30–45% (Declivoso)"),
    ("#d73027", ">45% (Escarpado)"),
]

# Altitude bands: 200 m steps down the escarpment (0–750 m spread evenly), finer
# steps on the plateau where ~80% of the window sits between 700 and 850 m.
# Sepia ramp (OKLCH hue 55, L 0.78 → 0.32), validated as an ordinal ramp.
HYPSO_BREAKS = [200, 400, 600, 750, 800, 850, 950]
HYPSO_CLASSES = [
    ("#e5a67b", "< 200 m"),
    ("#d48f60", "200–400 m"),
    ("#c37944", "400–600 m"),
    ("#b0652a", "600–750 m"),
    ("#9a5111", "750–800 m"),
    ("#824103", "800–850 m"),
    ("#693300", "850–950 m"),
    ("#4f2704", "> 950 m"),
]

SIEVE_CELLS = 6          # patches smaller than ~0.5 ha are merged into neighbours
SIMPLIFY_DEG = 0.00004   # ~4 m
RASTER_OUT = os.path.join(C.OUT_DIR, "rasters")
SOURCE = "Copernicus DEM GLO-30 (ESA/Airbus)"


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


def publish_classes(name, klass, transform, classes, label_key):
    """Write <name>.geojson + rasters/<name>.png and register it in the manifest."""
    feats = []
    for geom, value in features.shapes(klass, transform=transform, connectivity=8):
        k = int(value)
        poly = shape(geom).simplify(SIMPLIFY_DEG, preserve_topology=True)
        if poly.is_empty:
            continue
        color, label = classes[k]
        feats.append({
            "type": "Feature",
            "properties": {"classe": k + 1, label_key: label, "cor": color},
            "geometry": {"type": poly.geom_type,
                         "coordinates": _round(mapping(poly)["coordinates"])},
        })
    fc = {"type": "FeatureCollection", "features": feats}
    with open(os.path.join(C.OUT_DIR, f"{name}.geojson"), "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))

    rgba = np.zeros((*klass.shape, 4), np.uint8)
    for k, (color, _) in enumerate(classes):
        rgba[klass == k] = (*_hex_rgb(color), 200)
    os.makedirs(RASTER_OUT, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(os.path.join(RASTER_OUT, f"{name}.png"))

    west, north = transform.c, transform.f
    east = west + transform.a * klass.shape[1]
    south = north + transform.e * klass.shape[0]
    manifest_path = os.path.join(RASTER_OUT, "manifest.json")
    manifest = {}
    if os.path.exists(manifest_path):
        with open(manifest_path, encoding="utf-8") as fh:
            manifest = json.load(fh)
    manifest[name] = {
        "bounds": [[south, west], [north, east]],
        "legend": [{"color": c, "label": l} for c, l in classes],
        "source": SOURCE,
    }
    with open(manifest_path, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False)

    counts = np.bincount(klass.ravel(), minlength=len(classes)) / klass.size * 100
    print(f"  {name}: {len(feats)} polygons")
    for (_, label), pct in zip(classes, counts):
        print(f"    {label:28s} {pct:5.1f}%")


def main():
    print("Building declividade + hipsometria (Copernicus GLO-30)")
    dem, transform = load_dem()
    print(f"  DEM {dem.shape}, elev {dem.min():.0f}–{dem.max():.0f} m, AOI {AOI}")

    slope = horn_slope_pct(dem, transform)
    klass = np.digitize(slope, SLOPE_BREAKS).astype("uint8")  # 0..4
    klass = features.sieve(klass, size=SIEVE_CELLS, connectivity=8)
    publish_classes("declividade", klass, transform, SLOPE_CLASSES, "faixa")

    klass = np.digitize(dem, HYPSO_BREAKS).astype("uint8")  # 0..7
    klass = features.sieve(klass, size=SIEVE_CELLS, connectivity=8)
    publish_classes("hipsometria", klass, transform, HYPSO_CLASSES, "faixa")


def _round(coords):
    """Round nested coordinates to 6 decimals (~0.1 m) to keep the file small."""
    if isinstance(coords[0], (int, float)):
        return [round(coords[0], 6), round(coords[1], 6)]
    return [_round(c) for c in coords]


if __name__ == "__main__":
    main()
