"""Build web-ready historical and legislation map overlays.

The supplied GeoTIFFs are large working files (about 2.4 GB in total). This
script keeps those sources outside Git and publishes compact WebP derivatives
plus a manifest consumed by RasterControl.

Every raster is warped to EPSG:4326 before export so a Leaflet ImageOverlay can
use its geographic bounds. The maps retain their supplied georeferencing; this
script does not invent or alter control points.
"""

from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

import numpy as np
import rasterio
from PIL import Image
from rasterio.enums import Resampling
from rasterio.transform import Affine
from rasterio.warp import calculate_default_transform, reproject


REPO = Path(__file__).resolve().parents[1]
SOURCE_ROOT = REPO / "Mapas_Layers_Extras"
OUTPUT_ROOT = REPO / "public" / "data" / "reference_maps"
TARGET_CRS = "EPSG:4326"
MAX_DIMENSION = 2600
WEBP_QUALITY = 82


MUNICIPALITY_NAMES = {
    "cubatao": "Cubatão",
    "mogi das cruzes": "Mogi das Cruzes",
    "ribeirao pires": "Ribeirão Pires",
    "rio grande da serra": "Rio Grande da Serra",
    "santo andre": "Santo André",
    "santos": "Santos",
    "suzano": "Suzano",
}


def ascii_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch)).lower()


def slug(value: str) -> str:
    value = re.sub(r"[^a-z0-9]+", "-", ascii_key(value)).strip("-")
    return value[:96]


def classify(path: Path) -> dict[str, str]:
    relative = path.relative_to(SOURCE_ROOT)
    parts = [ascii_key(part) for part in relative.parts]
    filename = path.stem
    key = ascii_key(filename)
    words = re.sub(r"[^a-z0-9]+", " ", key).strip()

    if "mapas historicos" in parts:
        archive_match = re.search(r"_s_(\d{4})_", key)
        archive_code = archive_match.group(1) if archive_match else "arquivo"
        place = "Ribeirão Pires" if "ribeirao pires" in key else "Paranapiacaba"
        return {
            "group": "historical",
            "municipality": place,
            "label": f"{place} — Carta histórica {archive_code}",
            "id": f"historico-{slug(place)}-{archive_code}",
        }

    municipality_key = next(
        (candidate for candidate in MUNICIPALITY_NAMES if candidate in parts),
        "legislacao regional",
    )
    municipality = MUNICIPALITY_NAMES.get(municipality_key, "Legislação regional")

    if municipality_key == "mogi das cruzes":
        annex = re.search(r"anexo-(\d+)", key)
        title = f"LC 150/2019 — Anexo {annex.group(1)}" if annex else "LC 150/2019"
    elif municipality_key == "ribeirao pires":
        annex = re.search(r"anexo\s+([ivx]+)", key)
        title = f"Lei 5.907/2014 — Anexo {annex.group(1).upper()}" if annex else "Lei 5.907/2014"
    elif municipality_key == "cubatao":
        title = "Zoneamento — Anexo I"
    elif municipality_key == "santo andre":
        title = "Zoneamento — Anexo 1"
    elif municipality_key == "santos":
        subject = "Perímetro urbano" if "perimetro urbano" in words else "Zoneamento"
        title = f"{subject} — LC 1.314/2025"
    elif municipality_key == "suzano":
        if "macrozoneamento" in key:
            title = "Macrozoneamento"
        elif "interesse social" in key:
            title = "Zonas Especiais de Interesse Social"
        else:
            title = "Zonas Especiais de Localidades Urbanas"
    elif municipality_key == "rio grande da serra":
        titles = {
            "crescimento vetores": "Vetores de crescimento",
            "interesse turistico": "Áreas de interesse turístico",
            "mov gravt massa": "Movimentos gravitacionais de massa",
            "uso do solo": "Uso do solo",
        }
        title = next((label for token, label in titles.items() if token in key), filename)
    else:
        title = filename.replace("_modificado", "").replace("_", " ")

    return {
        "group": "legislation",
        "municipality": municipality,
        "label": f"{municipality} — {title}",
        "id": f"legislacao-{slug(municipality)}-{slug(title)}",
    }


def target_grid(src: rasterio.io.DatasetReader) -> tuple[Affine, int, int]:
    transform, width, height = calculate_default_transform(
        src.crs, TARGET_CRS, src.width, src.height, *src.bounds
    )
    scale = min(1.0, MAX_DIMENSION / max(width, height))
    out_width = max(1, round(width * scale))
    out_height = max(1, round(height * scale))
    transform = transform * Affine.scale(width / out_width, height / out_height)
    return transform, out_width, out_height


def build_overlay(source: Path, destination: Path, transparent_dark_border: bool = False) -> dict[str, object]:
    with rasterio.open(source) as src:
        if src.crs is None:
            raise ValueError(f"Raster has no CRS: {source}")
        transform, width, height = target_grid(src)
        rgb = np.full((3, height, width), 255, dtype=np.uint8)
        for band in range(3):
            reproject(
                source=rasterio.band(src, band + 1),
                destination=rgb[band],
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=TARGET_CRS,
                src_nodata=src.nodata,
                dst_nodata=255,
                resampling=Resampling.bilinear,
            )

        alpha = None
        if transparent_dark_border:
            alpha = np.zeros((height, width), dtype=np.uint8)
            reproject(
                source=src.dataset_mask(),
                destination=alpha,
                src_transform=src.transform,
                src_crs=src.crs,
                dst_transform=transform,
                dst_crs=TARGET_CRS,
                src_nodata=0,
                dst_nodata=0,
                resampling=Resampling.nearest,
            )
            # The archive scans contain a pure-black scanner frame outside the
            # paper. Brown/red historical ink remains visible above this strict
            # threshold, while the border becomes transparent over the basemap.
            alpha[np.max(rgb, axis=0) < 18] = 0

        west = transform.c
        north = transform.f
        east = west + transform.a * width
        south = north + transform.e * height
        native = {"width": src.width, "height": src.height, "crs": str(src.crs)}

    destination.parent.mkdir(parents=True, exist_ok=True)
    pixels = np.moveaxis(rgb, 0, 2)
    if alpha is not None:
        pixels = np.dstack((pixels, alpha))
        image = Image.fromarray(pixels, mode="RGBA")
    else:
        image = Image.fromarray(pixels, mode="RGB")
    image.save(destination, "WEBP", quality=WEBP_QUALITY, method=6)
    return {
        "bounds": [[round(south, 8), round(west, 8)], [round(north, 8), round(east, 8)]],
        "width": width,
        "height": height,
        "native": native,
    }


def main() -> None:
    if not SOURCE_ROOT.exists():
        raise SystemExit(f"Missing source directory: {SOURCE_ROOT}")

    sources = sorted(SOURCE_ROOT.rglob("*.tif"), key=lambda path: ascii_key(str(path)))
    if not sources:
        raise SystemExit(f"No GeoTIFF sources found under {SOURCE_ROOT}")

    entries: list[dict[str, object]] = []
    print(f"Building {len(sources)} cartographic overlays")
    for index, source in enumerate(sources, start=1):
        item: dict[str, object] = classify(source)
        filename = f"{item['id']}.webp"
        destination = OUTPUT_ROOT / filename
        spatial = build_overlay(
            source,
            destination,
            transparent_dark_border=item["group"] == "historical",
        )
        item.update(spatial)
        item.update(
            {
                "file": filename,
                "sourceFile": source.name,
                "sourceNote": "Georreferenciamento herdado do GeoTIFF fornecido; Ortofoto 2010 permanece a referência para a Vila.",
            }
        )
        entries.append(item)
        print(f"[{index:02}/{len(sources)}] {item['label']} -> {destination.stat().st_size / 1024 / 1024:.2f} MB")

    entries.sort(key=lambda item: (item["group"], ascii_key(str(item["municipality"])), ascii_key(str(item["label"]))))
    manifest = {
        "schemaVersion": 1,
        "description": "Cartas históricas e anexos cartográficos de legislação, convertidos dos GeoTIFFs georreferenciados fornecidos.",
        "reference": "Ortofoto Paranapiacaba 2010",
        "defaultOpacity": 0.72,
        "blendMode": "multiply",
        "maps": entries,
    }
    manifest_path = OUTPUT_ROOT / "manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    total = sum((OUTPUT_ROOT / str(item["file"])).stat().st_size for item in entries)
    print(f"Manifest: {manifest_path}")
    print(f"Total WebP size: {total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
