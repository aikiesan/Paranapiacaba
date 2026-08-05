"""Build the complete Paranapiacaba regional hydrography web layers.

The source packages in ``Hidrografia_Completa_SP`` are authoritative working
data and remain unversioned. This script clips them to the regional analysis
window, reprojects them from SIRGAS 2000 / UTM 23S to RFC 7946 WGS 84, keeps
useful source attributes and writes compact GeoJSON files to ``public/data``.

Run from the repository root or scripts directory:
    python scripts/build_hydrography.py
"""
from __future__ import annotations

import json
from pathlib import Path

import geopandas as gpd
import pandas as pd
from shapely.geometry import box

import config as C


ROOT = Path(C.HYDROGRAPHY_ROOT)
OUT = Path(C.OUT_DIR)
AOI_WGS84 = box(*C.HYDRO_REGION_BBOX)


def find_shapefile(name: str) -> Path:
    matches = list(ROOT.rglob(name))
    if not matches:
        raise FileNotFoundError(f"Hydrography source not found: {name}")
    return matches[0]


def read_source(name: str) -> gpd.GeoDataFrame:
    path = find_shapefile(name)
    # Some DBFs use Windows-1252/Latin-1 while others advertise UTF-8.
    try:
        frame = gpd.read_file(path)
    except UnicodeDecodeError:
        frame = gpd.read_file(path, encoding="latin1")
    if frame.crs is None:
        frame = frame.set_crs(31983)
    return frame.to_crs(4326)


def normalize_value(value):
    if value is None or pd.isna(value):
        return None
    if hasattr(value, "item"):
        value = value.item()
    if isinstance(value, str):
        # Some DBFs are UTF-8 bytes advertised as Latin-1. Repair the common
        # mojibake pattern without altering strings that are already correct.
        if any(marker in value for marker in ("Ã", "Â", "â")):
            try:
                value = value.encode("latin1").decode("utf-8")
            except (UnicodeEncodeError, UnicodeDecodeError):
                pass
        value = value.replace("\u00ad", "")
    return value


def clip_and_prepare(
    frame: gpd.GeoDataFrame,
    *,
    source: str,
    fields: dict[str, str] | None = None,
    simplify_m: float = 0,
    clip: bool = True,
) -> gpd.GeoDataFrame:
    if clip:
        frame = gpd.clip(frame, AOI_WGS84)
    frame = frame[frame.geometry.notna() & ~frame.geometry.is_empty].copy()

    if simplify_m:
        projected = frame.to_crs(31983)
        projected.geometry = projected.geometry.simplify(simplify_m, preserve_topology=True)
        frame = projected.to_crs(4326)

    fields = fields or {}
    data = {target: frame[source_name].map(normalize_value)
            for source_name, target in fields.items() if source_name in frame.columns}
    result = gpd.GeoDataFrame(data, geometry=frame.geometry, crs=4326)
    result.insert(0, "fonte", source)
    return result


def compact_geojson(frame: gpd.GeoDataFrame, filename: str) -> None:
    frame = frame[frame.geometry.notna() & ~frame.geometry.is_empty].copy()
    # Exact duplicates occur where the complementary and APP packages overlap.
    frame["_geometry_key"] = frame.geometry.to_wkb(hex=True)
    frame = frame.drop_duplicates(subset=["_geometry_key"]).drop(columns="_geometry_key")
    payload = json.loads(frame.to_json(drop_id=True, show_bbox=False, to_wgs84=True))
    target = OUT / filename
    target.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
        encoding="utf-8",
    )
    print(f"  {filename}: {len(frame):,} features, {target.stat().st_size / 1048576:.2f} MB")


def build_network() -> None:
    # The APPs hydrography and spring inventories are a matched dataset: every
    # spring in the regional AOI lies exactly on this network. The two UGRHI 6
    # packages overlap it with a different positional reference, which rendered
    # as a false doubled network. Keep this spring-connected network as the
    # single cartographic authority.
    network = clip_and_prepare(
        read_source("APPs_Hidrografia.shp"),
        source="Hidrografia das APPs da RMSP (conectada às nascentes)",
        fields={
            "hid_cd": "codigo",
            "hid_tp_el": "tipo",
            "STATUS": "status",
            "CODCURSOAG": "curso_agua",
            "Manancial": "manancial",
            "Niv_1": "nivel",
        },
        simplify_m=1.5,
    )
    compact_geojson(network, "hidrografia_regional_completa.geojson")


def main() -> None:
    if not ROOT.exists():
        raise FileNotFoundError(f"Source directory does not exist: {ROOT}")
    OUT.mkdir(parents=True, exist_ok=True)
    print("Building complete regional hydrography ->", OUT)

    build_network()
    compact_geojson(
        clip_and_prepare(
            read_source("APPs_Nascentes.shp"), source="Nascentes das APPs da RMSP",
            fields={"hid_cd": "codigo", "STATUS": "status", "CODCURSOAG": "curso_agua",
                    "Manancial": "manancial"},
        ),
        "nascentes_regionais.geojson",
    )
    compact_geojson(
        clip_and_prepare(
            read_source("APPs.shp"), source="APPs da RMSP",
            fields={"Area_ha": "area_ha", "Area_km": "area_km2"}, simplify_m=2.5,
        ),
        "apps_hidricas_regionais.geojson",
    )
    compact_geojson(
        clip_and_prepare(
            read_source("45_SubBacias.shp"), source="Sub-bacias UGRHI 6",
            fields={"SRH_NM": "nome", "SRH_AR_KM2": "area_km2", "Crit_IQA": "criticidade_iqa",
                    "Crit_Uso": "criticidade_uso"}, simplify_m=5,
        ),
        "subbacias_ugrhi6_regionais.geojson",
    )
    compact_geojson(
        clip_and_prepare(
            read_source("01_APRM.shp"), source="APMs/APRMs da RMSP",
            fields={"Nome": "nome", "Manancial": "manancial", "Area_km2": "area_km2",
                    "Criticidad": "criticidade"}, simplify_m=5,
        ),
        "apm_aprm_regionais.geojson",
    )
    compact_geojson(
        clip_and_prepare(
            read_source("Reservatórios_RMSP.shp"), source="Reservatórios da RMSP",
            fields={"NM_MD": "nome", "NM_MD_COMP": "nome_completo", "TIPO_MD": "tipo",
                    "CBHAT": "bacia", "UGRHI": "ugrhi"}, simplify_m=5, clip=False,
        ),
        "reservatorios_rmsp_completos.geojson",
    )


if __name__ == "__main__":
    main()
