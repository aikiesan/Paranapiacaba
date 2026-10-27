"""Monta o pacote de dados para trabalho em QGIS (entrega ao Arthur).

Reaproveita o pipeline do WebGIS (config.JOBS + build_data.build_job) com a
mesma limpeza, alinhamento e seleção de atributos, mas SEM simplificação, e grava
tudo em SIRGAS 2000 / UTM 23S (EPSG:31983), um GeoPackage por eixo do dossiê.

Estrutura gerada em --out:
    00_LEIA-ME.md
    01_PROJETO_QGIS/          projeto .qgz + script PyQGIS de reconstrução
    02_DADOS_VETORIAIS/       I_..VII_*.gpkg — camadas do WebGIS, resolução completa
    03_DADOS_COMPLEMENTARES/  demais shapefiles/gpkg da base, por pasta temática
    04_RASTERS/               ortofoto 2010, MapBiomas, declividade, hipsometria
    05_MAPAS_HISTORICOS_E_REFERENCIAS/
    06_PLANILHAS/
    07_MAPAS_PRODUZIDOS/
    08_DOCUMENTACAO/          dicionário de dados (xlsx), relatórios, planos

Uso:
    python build_pacote_qgis.py --out <pasta> [--fases vetores,complementares,...]

Fases: vetores, rasters, complementares, copias, estilos, projeto, dicionario.
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tarfile
import tempfile
import time
import unicodedata
import uuid
import warnings
import zipfile
from xml.sax.saxutils import escape

import geopandas as gpd
import pandas as pd
import shapely
from pyproj import CRS

import config as C
import lib

warnings.filterwarnings("ignore")

TARGET_EPSG = 31983
TARGET_WKT = CRS.from_epsg(TARGET_EPSG).to_wkt()
TARGET_PROJ = CRS.from_epsg(TARGET_EPSG).to_proj4()

# Fonte organizada (fora do git). O pipeline do WebGIS espera essas pastas
# dentro do repositório; aqui elas são redirecionadas para a árvore curada.
DEFAULT_GIS_ROOT = os.path.join(
    os.path.expanduser("~"), "Downloads", "05_UNESCO_PARANAPIACABA",
    "GIS_UNESCO_FAPESP_PUCCAMP",
)
# Ramo com o catálogo mais completo (hipsometria, Caminho do Sal, seção 5.4).
DEFAULT_REGISTRY_REF = "origin/feat/lugares-memoria-relevo"

THEME_FILES = {
    "I": "I_contexto_regional",
    "II": "II_meio_ambiente",
    "III": "III_infraestrutura",
    "IV": "IV_planejamento_legislacao",
    "V": "V_patrimonio_cultural",
    "VI": "VI_turismo_trilhas",
    "VII": "VII_socioeconomia",
}

# Camadas fora do pacote: pausadas pela equipe ou sem dado publicável.
SKIP_LAYERS = {
    "lugares_memoria": "Pausada (PR #12): fontes das transcrições não estão nesta máquina; "
                       "o GeoJSON publicado é uma FeatureCollection vazia.",
}


# --- utilidades --------------------------------------------------------------
def log(msg):
    print(msg, flush=True)


def slug(text):
    text = unicodedata.normalize("NFKD", str(text)).encode("ascii", "ignore").decode()
    text = re.sub(r"[^A-Za-z0-9]+", "_", text).strip("_").lower()
    return text or "camada"


def ensure(path):
    os.makedirs(path, exist_ok=True)
    return path


def to_target(gdf):
    if gdf.crs is None:
        gdf = gdf.set_crs(lib.DEFAULT_SRC_EPSG, allow_override=True)
    return gdf.to_crs(TARGET_EPSG)


def _keep_dimension(geom, dim):
    """make_valid pode devolver GeometryCollection; mantém só a dimensão da camada."""
    from shapely.geometry import MultiLineString, MultiPoint, MultiPolygon
    if geom is None or geom.geom_type != "GeometryCollection":
        return geom
    parts = list(shapely.get_parts(geom))
    while any(p.geom_type.startswith(("Multi", "Geometry")) for p in parts):
        parts = [q for p in parts for q in shapely.get_parts(p)]
    parts = [g for g in parts if shapely.get_dimensions(g) == dim and not g.is_empty]
    cls = {0: MultiPoint, 1: MultiLineString, 2: MultiPolygon}[dim]
    return cls(parts) if parts else None


def _repair(geom, dim):
    try:
        return _keep_dimension(shapely.make_valid(geom), dim)
    except Exception:
        return None  # geometria irrecuperável (ex.: coordenadas NaN)


def write_layer(gdf, gpkg, layer):
    gdf = gdf[gdf.geometry.notna() & ~gdf.geometry.is_empty].copy()
    # A reprojeção (e o deslocamento da Vila) pode reabrir pequenas invalidades.
    try:
        invalid = ~gdf.geometry.is_valid
    except Exception:
        invalid = pd.Series(True, index=gdf.index)
    if invalid.any():
        dim = int(shapely.get_dimensions(gdf.geometry.values).max())
        geoms = [(_repair(g, dim) if bad else g) for g, bad in zip(gdf.geometry.values, invalid)]
        gdf = gdf.set_geometry(gpd.GeoSeries(geoms, index=gdf.index, crs=gdf.crs))
        gdf = gdf[gdf.geometry.notna()]
    # "fid" é a chave primária reservada do GeoPackage.
    gdf = gdf.rename(columns={c: f"{c}_orig" for c in gdf.columns if c.lower() == "fid"})
    # GPKG não aceita colunas com nomes repetidos ignorando caixa.
    seen, cols = set(), []
    for c in gdf.columns:
        key = c.lower()
        if key in seen and c != gdf.geometry.name:
            continue
        seen.add(key)
        cols.append(c)
    gdf = gdf[cols]
    gdf.to_file(gpkg, layer=layer, driver="GPKG", engine="pyogrio")
    return len(gdf)


def geometry_kind(gdf):
    types = set(gdf.geom_type.dropna().unique())
    if not types:
        return "?"
    if types <= {"Point", "MultiPoint"}:
        return "point"
    if types <= {"LineString", "MultiLineString"}:
        return "line"
    if types <= {"Polygon", "MultiPolygon"}:
        return "polygon"
    return "mixed"


# --- registro de camadas (catalog.js + layers.js) ----------------------------
def export_registry(repo, ref, workdir):
    """Extrai catalog.js, layers.js e public/data do ref e devolve o registro."""
    archive = os.path.join(workdir, "ref.tar")
    subprocess.run(["git", "-C", repo, "archive", "-o", archive, ref,
                    "src/config", "public/data"], check=True)
    with tarfile.open(archive) as tar:
        tar.extractall(workdir)
    cfg = os.path.join(workdir, "src", "config")
    layers_src = open(os.path.join(cfg, "layers.js"), encoding="utf-8").read()
    catalog_url = "file:///" + os.path.join(cfg, "catalog.js").replace("\\", "/")
    layers_src = re.sub(r"from\s+['\"]\./catalog(\.js)?['\"]", f"from '{catalog_url}'", layers_src)
    layers_mjs = os.path.join(cfg, "layers_export.mjs")
    open(layers_mjs, "w", encoding="utf-8").write(layers_src)
    catalog_mjs = os.path.join(cfg, "catalog.mjs")
    shutil.copy(os.path.join(cfg, "catalog.js"), catalog_mjs)
    layers_mjs_url = "file:///" + layers_mjs.replace("\\", "/")
    catalog_mjs_url = "file:///" + catalog_mjs.replace("\\", "/")
    script = (
        f"const {{LAYERS}} = await import('{layers_mjs_url}');"
        f"const {{THEMES}} = await import('{catalog_mjs_url}');"
        "process.stdout.write(JSON.stringify({layers: LAYERS, themes: THEMES}));"
    )
    out = subprocess.run(["node", "--input-type=module", "-e", script],
                         check=True, capture_output=True, text=True, encoding="utf-8")
    reg = json.loads(out.stdout)
    reg["web_data"] = os.path.join(workdir, "public", "data")
    return reg


# --- fase: vetores (camadas do WebGIS em resolução completa) ------------------
def redirect_sources(gis_root):
    """Aponta o pipeline para a árvore curada de ``gis_root``."""
    old = {"siga": C.SIGA_MAPA, "kml": C.TRILHAS_KML_DIR}
    C.SOURCE_ROOT = os.path.join(gis_root, "01_CAMADAS_BASE")
    C.SIGA_MAPA = os.path.join(gis_root, "11_SHAPEFILES_EXTRA_SIGA")
    C.TRILHAS_KML_DIR = os.path.join(gis_root, "00_DADOS_BRUTOS", "07_TRILHAS_KML")
    C.VILA_MASK_SRC = C.src("01_LIMITES_ADMINISTRATIVOS", "ALTO_DA_SERRA",
                            "FAPESP_Alto_da_Serra_Delimitacao.shp")
    jobs = []
    for job in C.JOBS:
        job = dict(job)
        if job.get("root") == old["siga"]:
            job["root"] = C.SIGA_MAPA
        if job.get("kml_dir") == old["kml"]:
            job["kml_dir"] = C.TRILHAS_KML_DIR
        # Resolução completa: sem simplificação, sem amostragem, sem dissolve.
        job["simplify"] = 0
        for k in ("mapshaper", "feature_stride", "dissolve"):
            job.pop(k, None)
        jobs.append(job)
    return jobs


def build_full_resolution(jobs):
    """Roda build_job capturando o GeoDataFrame em vez de gravar GeoJSON."""
    import build_data

    captured = {}

    def capture(gdf, out_path, precision=6):
        captured[os.path.basename(out_path)] = gdf
        return len(gdf), 0

    original = lib.write_geojson
    lib.write_geojson = capture
    original_tracks = lib.read_kml_tracks
    lib.read_kml_tracks = lambda d, tol=0: original_tracks(d, 0)
    try:
        for job in jobs:
            try:
                build_data.build_job(job)
            except Exception as e:  # registra e segue com o fallback web
                log(f"   ! {job['out']}: {e}")
    finally:
        lib.write_geojson = original
        lib.read_kml_tracks = original_tracks
    return captured


def phase_vetores(out, reg, gis_root):
    dest = ensure(os.path.join(out, "02_DADOS_VETORIAIS"))
    jobs = redirect_sources(gis_root)
    log("Reconstruindo camadas em resolução completa…")
    full = build_full_resolution(jobs)
    by_id = {l["id"]: l for l in reg["layers"]}
    rows = []
    for theme in reg["themes"]:
        gpkg = os.path.join(dest, THEME_FILES[theme["code"]] + ".gpkg")
        if os.path.exists(gpkg):
            os.remove(gpkg)
        for section in theme["sections"]:
            for lid in section["layers"]:
                meta = by_id.get(lid, {"id": lid, "label": lid, "file": f"{lid}.geojson"})
                row = {"eixo": theme["code"], "eixo_titulo": theme["title"],
                       "secao": section["code"], "secao_titulo": section["title"],
                       "camada": lid, "titulo": meta.get("label", lid),
                       "gpkg": os.path.relpath(gpkg, out).replace("\\", "/"),
                       "descricao": meta.get("description", ""),
                       "cor_webgis": meta.get("color", ""),
                       "no_webgis": "sim" if meta.get("available", True) else "não (oculta)"}
                if lid in SKIP_LAYERS:
                    rows.append({**row, "resolucao": "—", "feicoes": 0,
                                 "observacoes": SKIP_LAYERS[lid]})
                    continue
                fname = meta.get("file", f"{lid}.geojson")
                gdf, res = full.get(fname), "completa (fonte original)"
                if gdf is None or gdf.empty:
                    web = os.path.join(reg["web_data"], fname)
                    if not os.path.exists(web):
                        rows.append({**row, "resolucao": "—", "feicoes": 0,
                                     "observacoes": "Sem fonte nem GeoJSON publicado."})
                        continue
                    gdf, res = gpd.read_file(web), "web (GeoJSON do WebGIS, generalizado)"
                gdf = to_target(lib.fix_geometry(gdf))
                n = write_layer(gdf, gpkg, lid)
                fields = [c for c in gdf.columns if c != gdf.geometry.name]
                rows.append({**row, "resolucao": res, "feicoes": n,
                             "geometria": geometry_kind(gdf),
                             "campos": ", ".join(fields), "observacoes": ""})
                log(f"   {theme['code']:>4} {lid:<30} {n:>7}  {res.split(' ')[0]}")
    pd.DataFrame(rows).to_csv(os.path.join(dest, "_camadas.csv"), index=False,
                              encoding="utf-8-sig")
    return rows


# --- fase: rasters -----------------------------------------------------------
def png_to_geotiff(png, bounds, tif):
    """Converte um PNG do WebGIS (bounds [[s, w], [n, e]] em 4326) em GeoTIFF."""
    import numpy as np
    import rasterio
    from PIL import Image
    from rasterio.transform import from_bounds

    (s, w), (n, e) = bounds
    img = np.array(Image.open(png).convert("RGBA"))
    h, wd = img.shape[:2]
    with rasterio.open(tif, "w", driver="GTiff", width=wd, height=h, count=4,
                       dtype="uint8", crs="EPSG:4326", compress="deflate",
                       transform=from_bounds(w, s, e, n, wd, h)) as ds:
        for b in range(4):
            ds.write(img[:, :, b], b + 1)
        ds.colorinterp = [rasterio.enums.ColorInterp.red, rasterio.enums.ColorInterp.green,
                          rasterio.enums.ColorInterp.blue, rasterio.enums.ColorInterp.alpha]


def phase_rasters(out, reg, gis_root, repo):
    dest = ensure(os.path.join(out, "04_RASTERS"))
    rows = []
    orto = ensure(os.path.join(dest, "ortofoto_2010"))
    for f in glob.glob(os.path.join(repo, "Ortofoto_Paranapiacaba_2010", "*UTM23S*")):
        shutil.copy2(f, orto)
    rows.append({"raster": "ortofoto_2010/Ortofoto_Paranapiacaba_2010_UTM23S.tif",
                 "crs": "EPSG:31983", "fonte": "Ortofoto Paranapiacaba 2010",
                 "observacoes": "Referência de alinhamento das camadas da Vila."})
    mb = ensure(os.path.join(dest, "mapbiomas_cobertura"))
    for f in sorted(glob.glob(os.path.join(gis_root, "01_CAMADAS_BASE", "09_RASTERS_COBERTURA", "*.tif"))):
        shutil.copy2(f, mb)
    rows.append({"raster": "mapbiomas_cobertura/paranapiacaba_coverage_AAAA.tif (2008–2024)",
                 "crs": "ver arquivo", "fonte": "MapBiomas Coleção (cobertura e uso)",
                 "observacoes": "Valores = códigos de classe MapBiomas; legenda no manifest do WebGIS."})
    manifest = json.load(open(os.path.join(reg["web_data"], "rasters", "manifest.json"), encoding="utf-8"))
    deriv = ensure(os.path.join(dest, "relevo_derivados"))
    for key in ("declividade", "hipsometria"):
        info = manifest.get(key)
        png = os.path.join(reg["web_data"], "rasters", f"{key}.png")
        if info and os.path.exists(png):
            png_to_geotiff(png, info["bounds"], os.path.join(deriv, f"{key}_classes.tif"))
            legend = "; ".join(f"{i['color']} = {i['label']}" for i in info.get("legend", []))
            rows.append({"raster": f"relevo_derivados/{key}_classes.tif", "crs": "EPSG:4326",
                         "fonte": info.get("source", "Copernicus DEM GLO-30"),
                         "observacoes": f"Imagem RGBA classificada (visualização). Legenda: {legend}. "
                                        "A versão vetorial está em II_meio_ambiente.gpkg."})
    return rows


# --- fase: complementares ----------------------------------------------------
def phase_complementares(out, gis_root):
    dest = ensure(os.path.join(out, "03_DADOS_COMPLEMENTARES"))
    rows = []
    groups = []
    base = os.path.join(gis_root, "01_CAMADAS_BASE")
    for d in sorted(os.listdir(base)):
        if os.path.isdir(os.path.join(base, d)):
            groups.append((f"base_{slug(d)}", os.path.join(base, d)))
    groups.append(("siga_extra", os.path.join(gis_root, "11_SHAPEFILES_EXTRA_SIGA")))
    for name, folder in groups:
        shps = sorted(glob.glob(os.path.join(folder, "**", "*.shp"), recursive=True))
        if not shps:
            continue
        gpkg = os.path.join(dest, f"{name}.gpkg")
        if os.path.exists(gpkg):
            os.remove(gpkg)
        used = set()
        log(f"   {name}: {len(shps)} shapefiles")
        for shp in shps:
            layer = slug(os.path.splitext(os.path.basename(shp))[0])[:60]
            rel = os.path.relpath(shp, gis_root).replace("\\", "/")
            if layer in used:
                rows.append({"gpkg": f"03_DADOS_COMPLEMENTARES/{name}.gpkg", "camada": layer,
                             "origem": rel, "feicoes": 0,
                             "observacoes": "Duplicata de nome (versão com espaços/acentos) — ignorada."})
                continue
            try:
                gdf = lib.read_vector(shp)
                crs_note = "" if gdf.crs else "Sem .prj — assumido SIRGAS 2000 (EPSG:4674)."
                gdf = to_target(gdf)  # write_layer corrige as geometrias
                n = write_layer(gdf, gpkg, layer)
                used.add(layer)
                rows.append({"gpkg": f"03_DADOS_COMPLEMENTARES/{name}.gpkg", "camada": layer,
                             "origem": rel, "feicoes": n, "geometria": geometry_kind(gdf),
                             "campos": ", ".join(c for c in gdf.columns if c != gdf.geometry.name),
                             "observacoes": crs_note})
            except Exception as e:
                rows.append({"gpkg": f"03_DADOS_COMPLEMENTARES/{name}.gpkg", "camada": layer,
                             "origem": rel, "feicoes": 0, "observacoes": f"ERRO ao converter: {e}"})
                log(f"      ! {rel}: {e}")
    # GeoPackages temáticos já organizados pela equipe (02–05): copiados como estão.
    gp_dest = ensure(os.path.join(dest, "gpkg_tematicos_equipe"))
    for f in sorted(glob.glob(os.path.join(gis_root, "0[2-5]_*", "**", "*.gpkg"), recursive=True)):
        shutil.copy2(f, gp_dest)
        for lyr in gpd.list_layers(f).itertuples():
            rows.append({"gpkg": f"03_DADOS_COMPLEMENTARES/gpkg_tematicos_equipe/{os.path.basename(f)}",
                         "camada": lyr.name, "origem": os.path.relpath(f, gis_root).replace("\\", "/"),
                         "geometria": lyr.geometry_type,
                         "observacoes": "Cópia fiel do GeoPackage da equipe (CRS original)."})
    hydro = os.path.join(gis_root, "01_CAMADAS_BASE", "02_HIDROGRAFIA", "app_restricao_ocupacao_santo_andre.gpkg")
    if os.path.exists(hydro):
        shutil.copy2(hydro, gp_dest)
    # KML/KMZ brutos (Caminho do Sal, ramais, trilhas Wikiloc).
    kml = ensure(os.path.join(dest, "kml_kmz"))
    for sub in (os.path.join("00_DADOS_BRUTOS", "01_SHAPEFILES_ORIGINAIS", "10_KMZ_KML"),
                os.path.join("00_DADOS_BRUTOS", "07_TRILHAS_KML")):
        src = os.path.join(gis_root, sub)
        if os.path.isdir(src):
            shutil.copytree(src, os.path.join(kml, os.path.basename(src)), dirs_exist_ok=True)
    pd.DataFrame(rows).to_csv(os.path.join(dest, "_camadas_complementares.csv"),
                              index=False, encoding="utf-8-sig")
    return rows


# --- fase: cópias (planilhas, mapas, documentação, projetos antigos) ---------
def copy_tree(src, dst):
    if os.path.isdir(src):
        shutil.copytree(src, dst, dirs_exist_ok=True)
        return True
    return False


def phase_copias(out, gis_root, repo, workdir):
    ref = ensure(os.path.join(out, "05_MAPAS_HISTORICOS_E_REFERENCIAS"))
    copy_tree(os.path.join(repo, "Mapas_Layers_Extras", "MAPAS HISTORICOS"),
              os.path.join(ref, "mapas_historicos"))
    copy_tree(os.path.join(repo, "Mapas_Layers_Extras", "LEIS"), os.path.join(ref, "leis"))
    copy_tree(os.path.join(repo, "Mapas_Layers_Extras", "drive-download-20260804T221351Z-1-001"),
              os.path.join(ref, "edificacoes_palazzi_e_extras"))
    copy_tree(os.path.join(repo, "Hidrografia_Completa_SP"), os.path.join(ref, "hidrografia_completa_sp"))

    plan = ensure(os.path.join(out, "06_PLANILHAS"))
    copy_tree(os.path.join(gis_root, "00_DADOS_BRUTOS", "04_INVENTARIOS_XLSX"),
              os.path.join(plan, "inventarios"))
    ibge = ensure(os.path.join(plan, "ibge_censo"))
    for f in glob.glob(os.path.join(gis_root, "09_IBGE", "**", "*.xlsx"), recursive=True):
        shutil.copy2(f, ibge)
    for f in glob.glob(os.path.join(gis_root, "0[4-6]_*", "**", "*.csv"), recursive=True):
        shutil.copy2(f, plan)
    mapeamento = os.path.join(repo, "Mapas_Layers_Extras", "MAPEAMENTO E SHAPEFILES_R01.xlsx")
    if os.path.exists(mapeamento):
        shutil.copy2(mapeamento, plan)

    copy_tree(os.path.join(gis_root, "06_MAPAS_PREVIAS"), os.path.join(out, "07_MAPAS_PRODUZIDOS"))
    copy_tree(os.path.join(gis_root, "10_TRILHAS_ANALISE"),
              os.path.join(out, "07_MAPAS_PRODUZIDOS", "trilhas_analise"))

    doc = ensure(os.path.join(out, "08_DOCUMENTACAO"))
    copy_tree(os.path.join(gis_root, "08_DOCUMENTACAO"), os.path.join(doc, "planejamento"))
    copy_tree(os.path.join(repo, "08_DOCUMENTACAO"), os.path.join(doc, "webgis"))
    relat = os.path.join(workdir, "relatorio")
    ensure(relat)
    try:
        txt = subprocess.run(["git", "-C", repo, "show",
                              f"{DEFAULT_REGISTRY_REF}:08_DOCUMENTACAO/02_RELATORIOS/RELATORIO_ANDAMENTO_20261009.md"],
                             check=True, capture_output=True).stdout
        open(os.path.join(doc, "webgis", "RELATORIO_ANDAMENTO_20261009.md"), "wb").write(txt)
    except subprocess.CalledProcessError:
        pass

    shutil.copy2(os.path.join(C.HERE, "qgis_montar_projeto.py"), ensure(os.path.join(out, "01_PROJETO_QGIS")))
    shutil.copy2(os.path.join(C.HERE, "pacote_qgis_LEIA-ME.md"),
                 os.path.join(out, "00_LEIA-ME.md"))

    # Projeto QGIS anterior da equipe (R00–R02), como referência.
    proj = ensure(os.path.join(out, "01_PROJETO_QGIS", "referencia_projeto_equipe"))
    z = os.path.join(gis_root, "99_ARQUIVO_ORIGINAIS", "PESQUISA_FAPESP_PARANAPIACABA",
                     "SHAPEFILES e ARQUIVO QGIS.zip")
    if os.path.exists(z):
        with zipfile.ZipFile(z) as zf:
            for info in zf.infolist():
                if info.filename.lower().endswith(".qgz"):
                    target = os.path.join(proj, os.path.basename(info.filename))
                    with zf.open(info) as srcf, open(target, "wb") as dst:
                        shutil.copyfileobj(srcf, dst)


# --- estilos QGIS ------------------------------------------------------------
def _rgba(hex_color, alpha=255):
    h = (hex_color or "#666666").lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"{r},{g},{b},{alpha}"


def _opt(name, value):
    return f'<Option name="{name}" type="QString" value="{escape(str(value))}"/>'


def renderer_xml(kind, meta):
    """renderer-v2 de símbolo único a partir da cor/espessura do WebGIS."""
    color = meta.get("color", "#666666")
    width_mm = round(float(meta.get("weight", 1) or 1) * 0.26, 2)
    if kind == "point":
        sym_type, layer = "marker", (
            '<layer class="SimpleMarker" enabled="1" locked="0" pass="0"><Option type="Map">'
            + _opt("name", "circle") + _opt("color", _rgba(color)) + _opt("outline_color", "255,255,255,255")
            + _opt("outline_width", "0.2") + _opt("outline_width_unit", "MM")
            + _opt("size", "2.2") + _opt("size_unit", "MM") + "</Option></layer>")
    elif kind == "line":
        sym_type, layer = "line", (
            '<layer class="SimpleLine" enabled="1" locked="0" pass="0"><Option type="Map">'
            + _opt("line_color", _rgba(color)) + _opt("line_width", width_mm)
            + _opt("line_width_unit", "MM") + _opt("line_style", "solid")
            + _opt("capstyle", "round") + _opt("joinstyle", "round") + "</Option></layer>")
    else:
        fill_alpha = int(round(float(meta.get("fillOpacity", 0.35) or 0) * 255))
        sym_type, layer = "fill", (
            '<layer class="SimpleFill" enabled="1" locked="0" pass="0"><Option type="Map">'
            + _opt("color", _rgba(color, fill_alpha)) + _opt("style", "solid" if fill_alpha else "no")
            + _opt("outline_color", _rgba(color)) + _opt("outline_style", "solid")
            + _opt("outline_width", max(width_mm, 0.2)) + _opt("outline_width_unit", "MM")
            + "</Option></layer>")
    return ('<renderer-v2 type="singleSymbol" symbollevels="0" enableorderby="0" forceraster="0">'
            f'<symbols><symbol type="{sym_type}" name="0" alpha="1" clip_to_extent="1" force_rhr="0">'
            f"{layer}</symbol></symbols><rotation/><sizescale/></renderer-v2>")


def qml(kind, meta):
    return ("<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>"
            '<qgis version="3.34.0" styleCategories="Symbology">'
            f"{renderer_xml(kind, meta)}<blendMode>0</blendMode><featureBlendMode>0</featureBlendMode>"
            "<layerOpacity>1</layerOpacity></qgis>")


def gpkg_layer_info(gpkg):
    con = sqlite3.connect(gpkg)
    try:
        rows = con.execute("SELECT table_name, column_name, geometry_type_name "
                           "FROM gpkg_geometry_columns").fetchall()
        ext = {r[0]: r[1:] for r in con.execute(
            "SELECT table_name, min_x, min_y, max_x, max_y FROM gpkg_contents").fetchall()}
    finally:
        con.close()
    out = {}
    for table, geom_col, gtype in rows:
        g = gtype.upper()
        kind = "point" if "POINT" in g else "line" if ("LINE" in g or "CURVE" in g) else "polygon"
        out[table] = {"geom_col": geom_col, "kind": kind, "extent": ext.get(table)}
    return out


def phase_estilos(out, reg):
    """Grava o estilo de cada camada como padrão dentro do GeoPackage."""
    by_id = {l["id"]: l for l in reg["layers"]}
    for gpkg in sorted(glob.glob(os.path.join(out, "02_DADOS_VETORIAIS", "*.gpkg"))):
        info = gpkg_layer_info(gpkg)
        con = sqlite3.connect(gpkg)
        con.execute("""CREATE TABLE IF NOT EXISTS layer_styles (
            id INTEGER PRIMARY KEY AUTOINCREMENT, f_table_catalog TEXT(256),
            f_table_schema TEXT(256), f_table_name TEXT(256), f_geometry_column TEXT(256),
            styleName TEXT(30), styleQML TEXT, styleSLD TEXT, useAsDefault BOOLEAN,
            description TEXT, owner TEXT(30), ui TEXT(30), update_time DATETIME DEFAULT CURRENT_TIMESTAMP)""")
        con.execute("DELETE FROM layer_styles")
        for table, li in info.items():
            meta = by_id.get(table, {})
            con.execute("INSERT INTO layer_styles (f_table_catalog, f_table_schema, f_table_name, "
                        "f_geometry_column, styleName, styleQML, styleSLD, useAsDefault, description) "
                        "VALUES ('', '', ?, ?, ?, ?, '', 1, ?)",
                        (table, li["geom_col"], "webgis", qml(li["kind"], meta),
                         "Estilo base do WebGIS Paranapiacaba"))
        # Registra a tabela para que o QGIS a reconheça como tabela de atributos.
        con.execute("INSERT OR IGNORE INTO gpkg_contents (table_name, data_type, identifier) "
                    "VALUES ('layer_styles', 'attributes', 'layer_styles')")
        con.commit()
        con.close()


# --- projeto QGIS ------------------------------------------------------------
def srs_xml(epsg=TARGET_EPSG):
    crs = CRS.from_epsg(epsg)
    return ("<spatialrefsys nativeFormat=\"Wkt\">"
            f"<wkt>{escape(crs.to_wkt())}</wkt><proj4>{escape(crs.to_proj4() or '')}</proj4>"
            f"<authid>EPSG:{epsg}</authid><description>{escape(crs.name)}</description>"
            f"<projectionacronym></projectionacronym><ellipsoidacronym></ellipsoidacronym>"
            f"<geographicflag>{'true' if crs.is_geographic else 'false'}</geographicflag>"
            "</spatialrefsys>")


QGIS_GEOM = {"point": "Point", "line": "Line", "polygon": "Polygon"}


def phase_projeto(out, reg):
    proj_dir = ensure(os.path.join(out, "01_PROJETO_QGIS"))
    by_id = {l["id"]: l for l in reg["layers"]}
    tree, maplayers = [], []
    xmin = ymin = float("inf")
    xmax = ymax = float("-inf")

    def add_vector(lid, name, gpkg_rel, li, checked):
        layer_id = f"{lid}_{uuid.uuid4().hex[:8]}"
        src = f"../{gpkg_rel}|layername={lid}"
        ext = li.get("extent") or (0, 0, 0, 0)
        tree.append(f'<layer-tree-layer id="{layer_id}" name="{escape(name)}" source="{escape(src)}" '
                    f'providerKey="ogr" checked="{"Qt::Checked" if checked else "Qt::Unchecked"}" '
                    'expanded="0" legend_exp=""><customproperties/></layer-tree-layer>')
        maplayers.append(
            f'<maplayer type="vector" geometry="{QGIS_GEOM[li["kind"]]}" autoRefreshEnabled="0" '
            'hasScaleBasedVisibilityFlag="0" readOnly="0" simplifyDrawingHints="1" '
            'simplifyMaxScale="1" simplifyAlgorithm="0" simplifyLocal="1" simplifyDrawingTol="1" '
            'styleCategories="AllStyleCategories" refreshOnNotifyEnabled="0" labelsEnabled="0">'
            f"<extent><xmin>{ext[0]}</xmin><ymin>{ext[1]}</ymin><xmax>{ext[2]}</xmax><ymax>{ext[3]}</ymax></extent>"
            f"<id>{layer_id}</id><datasource>{escape(src)}</datasource>"
            f"<layername>{escape(name)}</layername><srs>{srs_xml()}</srs>"
            '<provider encoding="UTF-8">ogr</provider>'
            f"{renderer_xml(li['kind'], by_id.get(lid, {}))}"
            "<blendMode>0</blendMode><featureBlendMode>0</featureBlendMode>"
            "<layerOpacity>1</layerOpacity></maplayer>")
        return layer_id

    for theme in reg["themes"]:
        gpkg = os.path.join(out, "02_DADOS_VETORIAIS", THEME_FILES[theme["code"]] + ".gpkg")
        if not os.path.exists(gpkg):
            continue
        info = gpkg_layer_info(gpkg)
        gpkg_rel = os.path.relpath(gpkg, out).replace("\\", "/")
        tree.append(f'<layer-tree-group name="{escape(theme["code"] + " · " + theme["title"])}" '
                    'checked="Qt::Checked" expanded="0"><customproperties/>')
        for section in theme["sections"]:
            present = [lid for lid in section["layers"] if lid in info]
            if not present:
                continue
            tree.append(f'<layer-tree-group name="{escape(section["code"] + " " + section["title"])}" '
                        'checked="Qt::Checked" expanded="1"><customproperties/>')
            for lid in present:
                li = info[lid]
                meta = by_id.get(lid, {})
                add_vector(lid, meta.get("label", lid), gpkg_rel, li, bool(meta.get("visible")))
                if meta.get("visible") and li.get("extent") and lid in ("limite_vila", "ferrovia_local",
                                                                       "edificacoes_vila"):
                    e = li["extent"]
                    xmin, ymin = min(xmin, e[0]), min(ymin, e[1])
                    xmax, ymax = max(xmax, e[2]), max(ymax, e[3])
            tree.append("</layer-tree-group>")
        tree.append("</layer-tree-group>")

    # Rasters de referência e mapas-base.
    tree.append('<layer-tree-group name="Rasters e mapas-base" checked="Qt::Checked" expanded="1"><customproperties/>')
    orto = "../04_RASTERS/ortofoto_2010/Ortofoto_Paranapiacaba_2010_UTM23S.tif"
    if os.path.exists(os.path.join(proj_dir, orto)):
        rid = f"ortofoto_{uuid.uuid4().hex[:8]}"
        tree.append(f'<layer-tree-layer id="{rid}" name="Ortofoto 2010 (Vila)" source="{orto}" '
                    'providerKey="gdal" checked="Qt::Unchecked" expanded="0"><customproperties/></layer-tree-layer>')
        maplayers.append(
            f'<maplayer type="raster" autoRefreshEnabled="0" hasScaleBasedVisibilityFlag="0" '
            f'styleCategories="AllStyleCategories"><id>{rid}</id><datasource>{orto}</datasource>'
            f"<layername>Ortofoto 2010 (Vila)</layername><srs>{srs_xml()}</srs>"
            '<provider>gdal</provider><pipe><rasterrenderer type="multibandcolor" opacity="1" '
            'alphaBand="-1" redBand="1" greenBand="2" blueBand="3" nodataColor="">'
            "<rasterTransparency/><minMaxOrigin><limits>None</limits><extent>WholeRaster</extent>"
            "<statAccuracy>Estimated</statAccuracy><cumulativeCutLower>0.02</cumulativeCutLower>"
            "<cumulativeCutUpper>0.98</cumulativeCutUpper><stdDevFactor>2</stdDevFactor></minMaxOrigin>"
            "</rasterrenderer><brightnesscontrast brightness=\"0\" contrast=\"0\" gamma=\"1\"/>"
            '<huesaturation saturation="0" grayscaleMode="0" colorizeOn="0"/>'
            '<rasterresampler maxOversampling="2"/></pipe><blendMode>0</blendMode></maplayer>')
    for name, url, checked in (
        ("OpenStreetMap", "https://tile.openstreetmap.org/{z}/{x}/{y}.png", True),
        ("Esri World Imagery",
         "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", False),
    ):
        rid = f"{slug(name)}_{uuid.uuid4().hex[:8]}"
        src = f"type=xyz&url={url}&zmax=19&zmin=0"
        tree.append(f'<layer-tree-layer id="{rid}" name="{name}" source="{escape(src)}" providerKey="wms" '
                    f'checked="{"Qt::Checked" if checked else "Qt::Unchecked"}" expanded="0">'
                    "<customproperties/></layer-tree-layer>")
        maplayers.append(
            f'<maplayer type="raster" autoRefreshEnabled="0" hasScaleBasedVisibilityFlag="0" '
            f'styleCategories="AllStyleCategories"><id>{rid}</id><datasource>{escape(src)}</datasource>'
            f"<layername>{name}</layername><srs>{srs_xml(3857)}</srs><provider>wms</provider>"
            '<pipe><rasterrenderer type="singlebandcolordata" opacity="1" alphaBand="-1" band="1" '
            'nodataColor=""><rasterTransparency/><minMaxOrigin><limits>None</limits>'
            "<extent>WholeRaster</extent><statAccuracy>Estimated</statAccuracy>"
            "<cumulativeCutLower>0.02</cumulativeCutLower><cumulativeCutUpper>0.98</cumulativeCutUpper>"
            "<stdDevFactor>2</stdDevFactor></minMaxOrigin></rasterrenderer>"
            '<brightnesscontrast brightness="0" contrast="0" gamma="1"/>'
            '<huesaturation saturation="0" grayscaleMode="0" colorizeOn="0"/>'
            '<rasterresampler maxOversampling="2"/></pipe><blendMode>0</blendMode></maplayer>')
    tree.append("</layer-tree-group>")

    if xmin == float("inf"):  # enquadramento padrão: Vila de Paranapiacaba
        xmin, ymin, xmax, ymax = 360500, 7368500, 364500, 7371500
    pad = 400
    canvas = (f'<mapcanvas name="theMapCanvas" annotationsVisible="1"><units>meters</units>'
              f"<extent><xmin>{xmin - pad}</xmin><ymin>{ymin - pad}</ymin>"
              f"<xmax>{xmax + pad}</xmax><ymax>{ymax + pad}</ymax></extent><rotation>0</rotation>"
              f"<destinationsrs>{srs_xml()}</destinationsrs><rendermaptile>0</rendermaptile></mapcanvas>")
    title = "Paranapiacaba UNESCO — Caderno de Mapas (FAPESP / PUC-Campinas)"
    qgs = ("<!DOCTYPE qgis PUBLIC 'http://mrcc.com/qgis.dtd' 'SYSTEM'>\n"
           f'<qgis projectname="{escape(title)}" version="3.34.0-Prizren">'
           '<homePath path=""/>'
           f"<title>{escape(title)}</title>"
           f"<projectCrs>{srs_xml()}</projectCrs>"
           '<layer-tree-group><customproperties/>' + "".join(tree) + "</layer-tree-group>"
           + canvas + "<projectlayers>" + "".join(maplayers) + "</projectlayers>"
           "<properties><Paths><Absolute type=\"bool\">false</Absolute></Paths>"
           "<Measurement><DistanceUnits type=\"QString\">meters</DistanceUnits>"
           "<AreaUnits type=\"QString\">m2</AreaUnits></Measurement></properties>"
           "</qgis>\n")
    qgz = os.path.join(proj_dir, "Paranapiacaba_UNESCO.qgz")
    with zipfile.ZipFile(qgz, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("Paranapiacaba_UNESCO.qgs", qgs)
    return qgz


# --- dicionário de dados -----------------------------------------------------
def phase_dicionario(out, vet_rows, comp_rows, ras_rows):
    doc = ensure(os.path.join(out, "08_DOCUMENTACAO"))
    path = os.path.join(doc, "DICIONARIO_DE_DADOS.xlsx")
    vet_cols = ["eixo", "eixo_titulo", "secao", "secao_titulo", "camada", "titulo", "gpkg",
                "geometria", "feicoes", "resolucao", "campos", "descricao", "cor_webgis",
                "no_webgis", "observacoes"]
    comp_cols = ["gpkg", "camada", "origem", "geometria", "feicoes", "campos", "observacoes"]
    with pd.ExcelWriter(path, engine="openpyxl") as xw:
        pd.DataFrame(vet_rows).reindex(columns=vet_cols).to_excel(xw, "camadas_webgis", index=False)
        pd.DataFrame(comp_rows).reindex(columns=comp_cols).to_excel(xw, "complementares", index=False)
        pd.DataFrame(ras_rows).to_excel(xw, "rasters", index=False)
        for ws in xw.book.worksheets:
            ws.freeze_panes = "A2"
            ws.auto_filter.ref = ws.dimensions
            for col in ws.columns:
                width = max(len(str(c.value or "")) for c in col[:200])
                ws.column_dimensions[col[0].column_letter].width = min(max(10, width + 2), 60)
    return path


# --- main --------------------------------------------------------------------
def load_rows(path):
    return pd.read_csv(path).fillna("").to_dict("records") if os.path.exists(path) else []


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", required=True)
    ap.add_argument("--fonte", default=DEFAULT_GIS_ROOT)
    ap.add_argument("--ref", default=DEFAULT_REGISTRY_REF)
    ap.add_argument("--fases", default="vetores,rasters,complementares,copias,estilos,projeto,dicionario")
    a = ap.parse_args()
    fases = set(a.fases.split(","))
    out = ensure(os.path.abspath(a.out))
    t0 = time.time()
    with tempfile.TemporaryDirectory() as work:
        reg = export_registry(C.REPO, a.ref, work)
        log(f"Registro: {len(reg['layers'])} camadas, {len(reg['themes'])} eixos ({a.ref})")
        meta_dir = ensure(os.path.join(out, "08_DOCUMENTACAO"))
        ras_csv = os.path.join(meta_dir, "_rasters.csv")
        if "vetores" in fases:
            phase_vetores(out, reg, a.fonte)
        if "rasters" in fases:
            pd.DataFrame(phase_rasters(out, reg, a.fonte, C.REPO)).to_csv(ras_csv, index=False, encoding="utf-8-sig")
        if "complementares" in fases:
            phase_complementares(out, a.fonte)
        if "copias" in fases:
            phase_copias(out, a.fonte, C.REPO, work)
        if "estilos" in fases:
            phase_estilos(out, reg)
        if "projeto" in fases:
            log(f"Projeto: {phase_projeto(out, reg)}")
        if "dicionario" in fases:
            p = phase_dicionario(out,
                                 load_rows(os.path.join(out, "02_DADOS_VETORIAIS", "_camadas.csv")),
                                 load_rows(os.path.join(out, "03_DADOS_COMPLEMENTARES", "_camadas_complementares.csv")),
                                 load_rows(ras_csv))
            log(f"Dicionário: {p}")
    log(f"Concluído em {time.time() - t0:.0f}s")


if __name__ == "__main__":
    sys.exit(main())
