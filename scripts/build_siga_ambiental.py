"""SIGA Santo André → camadas ambientais do WebGIS (sem sobreposição de fontes).

Uso (um comando, a partir da raiz do repositório):

    python scripts/build_siga_ambiental.py            # inventário + camadas + manifesto
    python scripts/build_siga_ambiental.py --dry-run  # só mostra o diff, não grava GeoJSON
    python scripts/build_siga_ambiental.py --ingest "C:/…/PROJETO_FAPESP_PUCCAMP"
        # copia (sem alterar) zips e PDFs baixados para 00_DADOS_BRUTOS/SIGA/<TEMA>/

Etapas por camada: lê o zip → exige .prj (falha se faltar CRS) → lê atributos em
ISO-8859-1 (.cst do SIGA) → make_valid → reprojeta para EPSG:4326 → recorta à
área de estudo (extensão de public/data/hipsometria.geojson) → simplifica por
escala preservando topologia → grava public/data/<id>.geojson com atributos
limpos → registra contagem, área, bbox e IoU contra as camadas existentes em
00_DADOS_BRUTOS/SIGA/manifesto.csv.

GeoJSON existente só é sobrescrito com --write-existing, depois que o diff
(feições, área, bbox) foi revisto.
"""
import argparse
import csv
import glob
import json
import os
import re
import shutil
import sys
import warnings
import zipfile

import geopandas as gpd
import pandas as pd
from shapely import make_valid
from shapely.geometry import box

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from siga_catalogo import DATASETS, EXTRAS_TOMBAMENTO, TEMAS  # noqa: E402

REPO = os.path.dirname(HERE)
RAW = os.path.join(REPO, "00_DADOS_BRUTOS", "SIGA")
RAW_TOMBAMENTO = os.path.join(REPO, "00_DADOS_BRUTOS", "TOMBAMENTO_SERRA_MAR")
OUT_DIR = os.path.join(REPO, "public", "data")
MANIFEST = os.path.join(RAW, "manifesto.csv")
UTM = 31983          # SIRGAS 2000 / UTM 23S — todo cálculo de área é feito aqui
WGS84 = 4326
GIT_LIMIT_MB = 50

warnings.filterwarnings("ignore", category=RuntimeWarning)


# --------------------------------------------------------------------------
# Ingestão e leitura do bruto
# --------------------------------------------------------------------------
def ingest(download_dir):
    """Copia, sem alterar, zips e fichas PDF do download para 00_DADOS_BRUTOS."""
    copied = 0
    for code, d in DATASETS.items():
        dest = os.path.join(RAW, d["tema"])
        os.makedirs(dest, exist_ok=True)
        names = [d["pdf"]] if d.get("pdf") else []
        if d.get("zip", True):
            names.append(code + ".zip")
        for n in names:
            src = os.path.join(download_dir, n)
            if not os.path.exists(src):
                print(f"  ! ausente no download: {n}")
                continue
            shutil.copy2(src, os.path.join(dest, n))
            copied += 1
    os.makedirs(RAW_TOMBAMENTO, exist_ok=True)
    for n in EXTRAS_TOMBAMENTO:
        src = os.path.join(download_dir, n)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(RAW_TOMBAMENTO, n))
            copied += 1
    print(f"ingest: {copied} arquivos copiados para {os.path.relpath(RAW, REPO)} "
          f"e {os.path.relpath(RAW_TOMBAMENTO, REPO)}")


def zip_path(code):
    return os.path.join(RAW, DATASETS[code]["tema"], code + ".zip")


def read_siga(code, layer_index=0):
    """Lê o shapefile principal de um zip SIGA em EPSG:31983, geometria válida.

    Falha (SystemExit) se o shapefile não tiver .prj — não se adivinha CRS.
    Shapefiles auxiliares `*_NULL.shp` (só geometrias nulas) são ignorados.
    """
    zpath = zip_path(code)
    with zipfile.ZipFile(zpath) as zf:
        names = zf.namelist()
        shps = sorted(n for n in names
                      if n.lower().endswith(".shp") and "_null" not in n.lower())
        if not shps:
            sys.exit(f"ERRO {code}: nenhum .shp no zip")
        shp = shps[layer_index]
        stem = shp[:-4].lower()
        if not any(n.lower() == stem + ".prj" for n in names):
            sys.exit(f"ERRO {code}: {shp} sem .prj — CRS desconhecido, abortando")
        cst = next((n for n in names if n.lower() in (stem + ".cst", stem + ".cpg")), None)
        enc = zf.read(cst).decode("ascii").strip() if cst else "ISO-8859-1"
    gdf = gpd.read_file(f"zip://{zpath}!{shp}", encoding=enc)
    if gdf.crs is None:
        sys.exit(f"ERRO {code}: .prj ilegível — CRS desconhecido, abortando")
    gdf = gdf[gdf.geometry.notna() & ~gdf.geometry.is_empty].copy()
    gdf = gdf.to_crs(UTM)
    n_invalid = int((~gdf.is_valid).sum())
    gdf["geometry"] = gdf.geometry.apply(make_valid)
    # make_valid pode devolver GeometryCollection com restos lineares: manter
    # só a parte da mesma dimensão do dado original.
    gdf["geometry"] = gdf.geometry.apply(_keep_dim, dim=_dim(gdf))
    gdf = gdf[~gdf.geometry.is_empty]
    gdf.attrs.update(code=code, n_invalid=n_invalid, encoding=enc, shp=shp)
    for c in gdf.columns:
        if gdf[c].dtype == object and c != "geometry":
            gdf[c] = gdf[c].map(lambda v: v.replace("\xa0", " ").strip()
                                if isinstance(v, str) else v)
    return gdf


def _dim(gdf):
    t = gdf.geom_type.dropna()
    if t.str.contains("Polygon").any():
        return 2
    if t.str.contains("LineString").any():
        return 1
    return 0


def _keep_dim(geom, dim):
    from shapely.geometry import GeometryCollection, MultiPolygon, MultiLineString
    if geom.geom_type != "GeometryCollection":
        return geom
    parts = [g for g in geom.geoms if _dim(gpd.GeoSeries([g])) == dim]
    if dim == 2:
        polys = [p for g in parts for p in getattr(g, "geoms", [g])]
        return MultiPolygon(polys) if polys else GeometryCollection()
    if dim == 1:
        lines = [p for g in parts for p in getattr(g, "geoms", [g])]
        return MultiLineString(lines) if lines else GeometryCollection()
    return parts[0] if parts else GeometryCollection()


# --------------------------------------------------------------------------
# Referências: área de estudo, linha de base e fontes regionais
# --------------------------------------------------------------------------
# Estado do WebGIS antes deste pipeline (PR #15). O IoU do manifesto é medido
# contra esta versão, para não mudar quando os arquivos forem regravados.
BASELINE = "d65a2c9"
CORRIDOR_BBOX = (-47.05, -24.10, -46.15, -23.05)   # = scripts/config.py


def base_root(cli_value=None):
    """Pasta 01_CAMADAS_BASE (fontes GeoSEADE das UCs regionais)."""
    cands = [cli_value, os.environ.get("CAMADAS_BASE")]
    try:
        import config
        cands.append(config.SOURCE_ROOT)
    except Exception:
        pass
    cands.append(os.path.join(os.path.dirname(REPO), "1_GIS_UNESCO_PARANAPIACABA",
                              "01_CAMADAS_BASE"))
    for c in cands:
        if c and os.path.isdir(os.path.join(c, "03_UNIDADES_CONSERVACAO")):
            return c
    sys.exit("ERRO: 01_CAMADAS_BASE não encontrada (use --base ou CAMADAS_BASE)")


def study_area():
    """Área de estudo ampliada = extensão de public/data/hipsometria.geojson."""
    hip = gpd.read_file(os.path.join(OUT_DIR, "hipsometria.geojson"))
    return gpd.GeoSeries([box(*hip.total_bounds)], crs=WGS84).to_crs(UTM).iloc[0]


def corridor():
    return gpd.GeoSeries([box(*CORRIDOR_BBOX)], crs=WGS84).to_crs(UTM).iloc[0]


def baseline(layer_file):
    """GeoJSON de public/data como estava em BASELINE (via git show), em UTM."""
    import io
    import subprocess
    try:
        raw = subprocess.run(
            ["git", "-C", REPO, "show", f"{BASELINE}:public/data/{layer_file}"],
            capture_output=True, check=True).stdout
    except subprocess.CalledProcessError:
        return None
    return gpd.read_file(io.BytesIO(raw)).to_crs(UTM)


def union(gdf):
    from shapely.ops import unary_union
    return unary_union(list(gdf.geometry)) if len(gdf) else box(0, 0, 0, 0).buffer(0)


def iou(a, b):
    u = a.union(b).area
    return a.intersection(b).area / u if u else float("nan")


# --------------------------------------------------------------------------
# Geoprocessamento
# --------------------------------------------------------------------------
def simplify(gdf, tol_m, coverage=False):
    """Simplifica em metros (UTM). Tolerância ≈ 0,25 mm na escala da fonte
    (1:40.000 → 8–12 m; 1:10.000 → 4 m; 1:1.000 → 2 m), menor em faixas
    estreitas (APP), onde a perda de área cresce rápido. Coberturas (bairros, bacias, vegetação…)
    têm a topologia refeita e usam coverage_simplify, que preserva as divisas
    comuns; camadas que podem se sobrepor por natureza (UCs) usam
    simplify(preserve_topology=True) feição a feição."""
    import shapely
    if not tol_m or gdf.empty or _dim(gdf) == 0:
        return gdf
    gdf = clean_coverage(gdf.copy()) if coverage else gdf.copy()
    geoms = gdf.geometry.values
    residual = 0.0
    if coverage and len(gdf) > 1:
        bad = [e for e in shapely.coverage_invalid_edges(geoms) if e is not None and not e.is_empty]
        residual = sum(e.length for e in bad) / max(sum(g.boundary.length for g in geoms), 1)
    if coverage and len(gdf) > 1 and residual < 1e-3:
        gdf["geometry"] = shapely.coverage_simplify(geoms, tol_m)
        gdf["geometry"] = gdf.geometry.apply(lambda g: g if g.is_valid else make_valid(g))
        gdf["geometry"] = gdf.geometry.apply(_keep_dim, dim=2)
        gdf.attrs["simplify"] = (f"coverage_simplify {tol_m} m"
                                 + (f" (resíduo topológico {residual:.4%} das bordas)" if residual else ""))
    else:
        gdf["geometry"] = gdf.geometry.simplify(tol_m, preserve_topology=True)
        gdf.attrs["simplify"] = f"simplify(preserve_topology) {tol_m} m"
    return gdf[~gdf.geometry.is_empty & gdf.geometry.notna()]


def clean_coverage(gdf):
    """Refaz a topologia de uma cobertura poligonal: nodifica todas as bordas,
    poligoniza as faces e entrega cada face a um único dono (o primeiro que a
    contém). Elimina sobreposições e vértices não coincidentes nas divisas,
    para que coverage_simplify possa preservar as bordas comuns."""
    import shapely
    from shapely.ops import polygonize, unary_union
    if _dim(gdf) != 2 or len(gdf) < 2 or bool(shapely.coverage_is_valid(gdf.geometry.values)):
        return gdf
    gdf = gdf.reset_index(drop=True)
    faces = gpd.GeoDataFrame(
        geometry=list(polygonize(unary_union([g.boundary for g in gdf.geometry]))), crs=gdf.crs)
    pts = gpd.GeoDataFrame(geometry=faces.representative_point(), crs=gdf.crs)
    own = gpd.sjoin(pts, gdf[["geometry"]], predicate="within", how="inner")
    own = own[~own.index.duplicated(keep="first")]["index_right"]
    faces = faces.loc[own.index].assign(owner=own.values)
    merged = faces.dissolve("owner").geometry
    out = gdf.loc[merged.index].copy()
    out["geometry"] = merged.values
    out.attrs.update(gdf.attrs)
    out.attrs["coverage_fix"] = f"cobertura refeita ({len(gdf) - len(out)} feições sem face própria)"
    return out


def clip_cover(gdf, mask):
    """Recorte geométrico (coberturas contínuas)."""
    out = gdf[gdf.intersects(mask)].copy()
    out["geometry"] = out.geometry.intersection(mask).apply(make_valid)
    out["geometry"] = out.geometry.apply(_keep_dim, dim=_dim(gdf))
    out = out[~out.geometry.is_empty]
    if _dim(gdf) == 2:
        out = out[out.area > 1.0]          # descarta lascas < 1 m²
    return out


def select_entities(gdf, mask):
    """Seleção por interseção (entidades discretas: geometria inteira)."""
    return gdf[gdf.intersects(mask)].copy()


def tidy(gdf, keep, extra=None):
    out = gpd.GeoDataFrame(geometry=gdf.geometry.values, crs=gdf.crs)
    for src, dst in keep.items():
        if src in gdf.columns:
            out[dst] = gdf[src].values
    for k, v in (extra or {}).items():
        out[k] = v
    out.attrs.update(gdf.attrs)
    return out


def _norm(s):
    import unicodedata
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()


def _title_pt(s):
    """'PARQUE ESTADUAL DA SERRA DO MAR' → 'Parque Estadual da Serra do Mar'."""
    if not isinstance(s, str):
        return s
    small = {"da", "de", "do", "das", "dos", "e", "a", "o"}
    cap = lambda w: "-".join(p[:1].upper() + p[1:] for p in w.split("-"))
    words = s.lower().split()
    return " ".join(w if (i and w in small) else cap(w) for i, w in enumerate(words))


def _fix_mojibake(v):
    """'ALTO TIETÃ\\x8a' → 'ALTO TIETÊ' (UTF-8 lido como Latin-1)."""
    if isinstance(v, str) and "Ã" in v:
        try:
            return v.encode("latin-1").decode("utf-8")
        except (UnicodeEncodeError, UnicodeDecodeError):
            return v
    return v


# --------------------------------------------------------------------------
# Camadas publicadas
# --------------------------------------------------------------------------
FONTE = "SIGA Santo André"
TUR_LABEL = {
    "CIRC_PARANAPIACABA": "Circuito Paranapiacaba", "HIST_CULTURAL": "Histórico-Cultural",
    "CITY_TOUR_HISTORICO": "City Tour Histórico", "ARTE_ARQUITETURA": "Arte e Arquitetura",
    "CIRC_PARQUE_LAZER": "Parques e Lazer", "CIRC_PEDAGOG_CIENTIF": "Pedagógico-Científico",
    "CIRC_INDUSTRIA_INOVAC": "Indústria e Inovação", "CIRC_HOTEL": "Hotelaria",
    "COMPRA": "Compras",
}


def build_layers(aoi, base, regional_tur=False, marco_zero=False):
    """Devolve {id: GeoDataFrame em UTM} — uma geometria por entidade."""
    L = {}

    # ---- Limites ---------------------------------------------------------
    g = read_siga("SIGA_LIM_DISTRITO_SUBDISTRITO")
    L["distritos"] = simplify(tidy(select_entities(g, aoi),
                                   {"NOM_DISTRI": "nome", "DSC_SUBDIS": "subdistrito"},
                                   {"fonte": FONTE, "escala": "1:40.000"}), 8, coverage=True)

    g = read_siga("SIGA_LIM_BAIRROS_OFICIAL")
    L["bairros"] = simplify(tidy(select_entities(g, aoi),
                                 {"NOME": "nome", "NUM_LEI": "lei", "POPULACAO_": "populacao_2022"},
                                 {"fonte": FONTE, "escala": "1:10.000"}), 4, coverage=True)

    g = read_siga("SIGA_LIM_PARQUE_ANDREENSE")
    L["parque_andreense"] = simplify(tidy(g, {"NOME": "nome", "LEGISLACAO": "legislacao"},
                                          {"fonte": FONTE, "escala": "1:40.000"}), 1)

    g = read_siga("SIGA_LIM_BILLINGS_2026")
    L["billings_747"] = simplify(tidy(g, {"DSC_COMPAR": "compartimento"},
                                      {"nome": "Represa Billings (cota 747 — 2026)",
                                       "fonte": FONTE, "escala": "1:1.000"}), 2, coverage=True)

    if marco_zero:
        g = read_siga("SIGA_LIM_MARCO_ZERO").explode(index_parts=False)
        L["marco_zero"] = tidy(g, {"NOME": "nome", "ALTITUDE": "altitude",
                                   "LATITUDE": "latitude", "LONGITUDE": "longitude"},
                               {"legislacao": "Lei Municipal 10.177/2019", "fonte": FONTE})

    # ---- Áreas protegidas: cada UC uma vez -------------------------------
    g = read_siga("SIGA_AMB_UC_MUN_NASC_PARANAP")
    L["pnm_nascentes"] = simplify(tidy(g, {"NOM_UNIDAD": "nome", "AREA_HA": "area_ha",
                                           "DSC_LEGISL": "legislacao", "TPO_UNIDAD": "esfera"},
                                       {"fonte": FONTE, "escala": "1:40.000"}), 1)
    L["ucs"] = build_ucs(base, siga_inside=[L["pnm_nascentes"]])

    # ---- Vegetação e APP (coberturas: recorte geométrico) ----------------
    g = read_siga("SIGA_AMB_CLASSIF_VEGETAL")
    v = tidy(clip_cover(g, aoi), {"CLASSIFICA": "classe"}, {"fonte": FONTE, "escala": "1:40.000"})
    v["area_ha"] = (v.area / 1e4).round(2)
    L["classif_vegetal"] = simplify(v, 12, coverage=True)

    g = read_siga("SIGA_AMB_APP_LICENC_SUL")
    L["app_sul"] = simplify(tidy(clip_cover(g, aoi), {},
                                 {"tipo": "APP / Área de Restrição à Ocupação (licenciamento Sul)",
                                  "fonte": FONTE, "escala": "1:40.000"}), 6, coverage=True)

    # ---- Bacias: um só conjunto SIGA, hierarquia nos atributos -----------
    g = read_siga("SIGA_AMB_SUB_BACIAS")
    s = tidy(clip_cover(g, aoi), {"NOM_SUB_BA": "sub_bacia", "NOM_BACIA": "bacia",
                                  "NOM_MACRO": "macro_bacia", "UGRHIS": "ugrhi"},
             {"fonte": FONTE, "escala": "1:10.000 (cartas Emplasa/PMSA)"})
    s["ugrhi"] = s["ugrhi"].str.replace("UGRHIs", "UGRHI", regex=False)
    L["subbacias_sa"] = simplify(s, 8, coverage=True)

    # ---- Áreas contaminadas -----------------------------------------------
    # O SIGA marca o LOTE cadastral que tem registro na CETESB, não a mancha
    # contaminada (um dos lotes tem 7,6 km²). Publicar o polígono do lote
    # exageraria a área; publica-se um ponto por lote, com a área do lote.
    g = select_entities(read_siga("SIGA_SEM_AREA_CONTAMINADA"), aoi)
    g["area_lote_ha"] = (g.area / 1e4).round(1)
    g["geometry"] = g.geometry.representative_point()
    L["areas_contaminadas"] = tidy(g, {"DSC_SITUAC": "situacao", "DSC_FONTE_": "fonte_registro",
                                       "DSC_DOCUME": "relacao", "NOM_BAIRRO": "bairro",
                                       "area_lote_ha": "area_lote_ha"},
                                   {"fonte": FONTE + " / CETESB"})
    L["areas_contaminadas"]["situacao"] = L["areas_contaminadas"]["situacao"].str.capitalize()

    # ---- Atrativos (Prefeitura) -------------------------------------------
    L["atrativos_prefeitura"] = build_atrativos(aoi, regional=regional_tur)
    return L


def build_ucs(base, siga_inside):
    """UCs do corredor: GeoSEADE (contorno completo, regional) + SIGA para as
    UCs de Santo André. Uma UC GeoSEADE é descartada quando já existe em SIGA
    (IoU ≥ 0,5) — SIGA vence dentro do município. PESM fica GeoSEADE (estende-se
    além de Santo André); o recorte SIGA do PESM só valida."""
    cor = corridor()
    parts = []
    siga_geoms = [union(x) for x in siga_inside]
    for shp in ("MA_ucestpi1.shp", "MA_ucmunpi1.shp"):
        g = gpd.read_file(os.path.join(base, "03_UNIDADES_CONSERVACAO", shp), encoding="utf-8")
        g = g.to_crs(UTM)
        g["geometry"] = g.geometry.apply(make_valid).apply(_keep_dim, dim=2)
        g = g[g.intersects(cor)].copy()
        dup = g.geometry.apply(lambda x: any(iou(x, s) >= 0.5 for s in siga_geoms))
        for n in g.loc[dup, "NOME_UC3"]:
            print(f"  ucs: GeoSEADE '{n}' omitida — já publicada a partir do SIGA")
        g = g[~dup]
        g["geometry"] = g.geometry.intersection(cor).apply(_keep_dim, dim=2)
        g = tidy(g, {"NOME_UC3": "nome", "CATEGORI18": "categoria", "ESFERA13": "esfera",
                     "CRIA_ATO5": "ato_criacao", "QUALI_PO9": "qualidade_poligono"},
                 {"fonte": "GeoSEADE (CNUC/MMA)", "escala": "regional"})
        for c in ("nome", "categoria", "ato_criacao", "qualidade_poligono"):
            g[c] = g[c].map(_fix_mojibake)      # parte da base vem com UTF-8 duplo
        g["nome"] = g["nome"].map(_title_pt)
        parts.append(simplify(g, 20))
    for code, cat in (("SIGA_AMB_UC_EST_ALTO_PARANAP", "Reserva Biológica"),
                      ("SIGA_AMB_UC_EST_BARONESA", "Parque"),
                      ("SIGA_AMB_UC_MUN_PEDROSO_LIM", "Parque")):
        g = read_siga(code)
        if code.endswith("PEDROSO_LIM"):          # 7 polígonos do mesmo parque
            g = g.dissolve(by="NOM_UNIDAD", as_index=False, aggfunc="first")
        esfera = g["TPO_UNIDAD"] if "TPO_UNIDAD" in g.columns else "Municipal"
        g = tidy(g, {"NOM_UNIDAD": "nome", "DSC_LEGISL": "ato_criacao"},
                 {"categoria": cat, "fonte": FONTE, "escala": "1:40.000"})
        g["esfera"] = esfera.values if hasattr(esfera, "values") else esfera
        parts.append(simplify(g, 1))
    out = gpd.GeoDataFrame(pd.concat(parts, ignore_index=True), crs=UTM)
    out.attrs["simplify"] = "GeoSEADE 20 m; SIGA 1 m"
    return out


def build_atrativos(aoi, regional=False):
    """Pontos dos circuitos turísticos da Prefeitura. Um lugar que aparece em
    vários circuitos vira um só ponto com a lista de circuitos."""
    cor = corridor()
    prio = {"CIRC_PARANAPIACABA", "HIST_CULTURAL", "CITY_TOUR_HISTORICO", "ARTE_ARQUITETURA"}
    rows = []
    for code in [c for c in DATASETS if c.startswith("SIGA_TUR_")]:
        key = code.removeprefix("SIGA_TUR_")
        g = read_siga(code).explode(index_parts=False)
        mask = cor if (regional and key in prio) else aoi
        g = g[g.within(mask)]
        for _, r in g.iterrows():
            rows.append(dict(nome=r["NOME"], endereco=r.get("ENDERECO"), bairro=r.get("BAIRRO"),
                             link=r.get("LINK"), circuito=TUR_LABEL[key], geometry=r.geometry))
    if not rows:
        return gpd.GeoDataFrame(geometry=[], crs=UTM)
    g = gpd.GeoDataFrame(rows, crs=UTM)
    # agrupa o mesmo lugar: ≤ 15 m ou mesmo nome normalizado a ≤ 150 m
    g["k"] = -1
    for i in g.index:
        if g.at[i, "k"] >= 0:
            continue
        d = g.distance(g.at[i, "geometry"])
        same = (d <= 15) | ((d <= 150) & (g["nome"].map(_norm) == _norm(g.at[i, "nome"])))
        g.loc[same & (g["k"] < 0), "k"] = i
    out = g.groupby("k").agg(nome=("nome", "first"), endereco=("endereco", "first"),
                             bairro=("bairro", "first"), link=("link", "first"),
                             circuitos=("circuito", lambda s: "; ".join(dict.fromkeys(s))),
                             geometry=("geometry", "first"))
    out = gpd.GeoDataFrame(out.reset_index(drop=True), crs=UTM)
    out["fonte"] = FONTE + " — Turismo"
    out.attrs.update(n_raw=len(g), simplify="—")
    return out


# --------------------------------------------------------------------------
# Decisões, comparações (IoU) e manifesto
# --------------------------------------------------------------------------
# codigo → (decisao, camada_webgis, substitui, substituido_por, observacao)
DECISOES = {
    "SIGA_LIM_MUNICIPAL_2026": ("validacao", "", "SIGA_LIM_MUNICIPAL", "",
        "Máscara 'dentro de Santo André' do pipeline e validação. Não vira camada: o mesmo "
        "contorno já é desenhado por `distritos` (SIGA) e, na escala 1:500.000, por "
        "`municipios_corredor` (IBGE)."),
    "SIGA_LIM_MUNICIPAL": ("substituida", "", "", "SIGA_LIM_MUNICIPAL_2026",
        "Versão EMPLASA 2019; substituída pela malha IGC-SP 2021 (2026)."),
    "SIGA_LIM_DISTRITO_SUBDISTRITO": ("publicada", "distritos", "", "",
        "Atualização da camada existente (mesma fonte)."),
    "SIGA_LIM_BAIRROS_OFICIAL": ("publicada", "bairros", "SIGA_LIM_BAIRROS_2009", "",
        "Atualização; bairros que tocam a área de estudo, geometria inteira."),
    "SIGA_LIM_BAIRROS_2009": ("substituida", "", "", "SIGA_LIM_BAIRROS_OFICIAL",
        "Ficha marca Status: Obsoleto. Fica só no bruto."),
    "SIGA_LIM_LOTEAMENTO": ("pendente", "", "", "",
        "Só a ficha PDF foi baixada; falta o zip no SIGA."),
    "SIGA_LIM_MARCO_ZERO": ("descartada", "", "", "",
        "Ponto fora da área de estudo (centro de Santo André)."),
    "SIGA_LIM_PARQUE_ANDREENSE": ("publicada", "parque_andreense", "", "",
        "Atualização da camada existente (mesma fonte)."),
    "SIGA_LIM_BILLINGS_2026": ("publicada", "billings_747", "SIGA_LIM_BILLINGS_COTA_747", "",
        "Nova cota 747 por LIDAR 2024 (1:1.000) substitui a versão anterior na mesma camada."),
    "SIGA_AMB_UC_EST_SERRA_MAR": ("validacao", "", "", "",
        "Só a parte de Santo André. A camada `ucs` mantém o contorno completo GeoSEADE; "
        "o recorte SIGA só valida."),
    "SIGA_AMB_UC_EST_ALTO_PARANAP": ("publicada", "ucs", "", "",
        "Atualiza a Rebio dentro de `ucs` (não existe na base GeoSEADE)."),
    "SIGA_AMB_UC_EST_BARONESA": ("regional", "ucs", "", "",
        "Fora da área de estudo: só o contorno, em `ucs` (1:500.000)."),
    "SIGA_AMB_UC_MUN_NASC_PARANAP": ("publicada", "pnm_nascentes", "", "",
        "SIGA vence dentro de Santo André; o polígono GeoSEADE estimado sai de `ucs`."),
    "SIGA_AMB_UC_MUN_PEDROSO_LIM": ("regional", "ucs", "", "",
        "Fora da área de estudo: 7 polígonos dissolvidos num contorno, em `ucs` (1:500.000)."),
    "SIGA_AMB_UC_MUN_PEDROSO_AMORT": ("descartada", "", "", "",
        "Zoneamento do Pedroso, fora do escopo."),
    "SIGA_AMB_UC_MUN_PED_ZON_INTER": ("descartada", "", "", "", "Zoneamento interno do Pedroso."),
    "SIGA_AMB_UC_MUN_PEDROSO_BACIA": ("descartada", "", "", "", "Bacias internas do Pedroso."),
    "SIGA_AMB_UC_PED_LEVANT_PRE": ("descartada", "", "", "", "Pedologia do Pedroso."),
    "SIGA_AMB_UC_PED_FOTOS_CAMPO": ("descartada", "", "", "", "Fotos de campo do Pedroso."),
    "SIGA_AMB_UGRHIS": ("validacao", "", "", "",
        "Dissolve exato das Sub-bacias SIGA. UGRHI na escala 1:500.000 = `regioes_hidrograficas` "
        "(GeoSEADE, contorno completo)."),
    "SIGA_AMB_MACRO_BACIAS": ("validacao", "", "", "",
        "Dissolve exato das Sub-bacias SIGA (atributo `macro_bacia`). Macro na escala 1:100.000 "
        "= `subbacias_ugrhi6` (CBH-AT)."),
    "SIGA_AMB_BACIAS": ("descartada", "", "", "",
        "Redundante: dissolve exato das Sub-bacias SIGA (atributo `bacia`)."),
    "SIGA_AMB_SUB_BACIAS": ("publicada", "subbacias_sa", "", "",
        "Nível 1:10.000; leva bacia, macro e UGRHI como atributos. Truncada no limite municipal."),
    "SIGA_AMB_CLASSIF_VEGETAL": ("publicada", "classif_vegetal", "", "",
        "Atualização; recorte passa do buffer da Serra para a área de estudo."),
    "SIGA_AMB_APP_LICENC_SUL": ("publicada", "app_sul", "", "",
        "Atualização; recorte passa do buffer da Serra para a área de estudo."),
    "SIGA_AMB_APP_LICENC_NORTE": ("descartada", "", "", "", "Porção norte, fora do escopo."),
    "SIGA_SEM_AREA_CONTAMINADA": ("publicada", "areas_contaminadas", "", "",
        "Lotes que tocam a área de estudo."),
    "SIGA_AMB_ALTIMETRIA_NORTE_1M": ("descartada", "", "", "",
        "Porção norte, fora do escopo; arquivo > 50 MB fora do git."),
}
for _c in DATASETS:
    if _c.startswith("SIGA_TUR_"):
        DECISOES[_c] = ("publicada", "atrativos_prefeitura", "", "",
                        "Pontos dentro da área de estudo; substitui a camada `circuitos`.")


def comparisons(aoi, sa):
    """IoU / contenção de cada conjunto SIGA contra a linha de base (BASELINE)."""
    out = {}
    b = {k: baseline(k + ".geojson") for k in (
        "distritos", "bairros", "parque_andreense", "billings_747", "pnm_nascentes", "ucs",
        "classif_vegetal", "app_sul", "subbacias", "subbacias_ugrhi6_regionais",
        "regioes_hidrograficas", "municipios_corredor", "circuitos")}
    S = lambda c: union(read_siga(c))
    fmt = lambda name, a, c: f"{name}: IoU {iou(a, c):.3f} (A∩B/A {a.intersection(c).area / a.area:.3f})"

    old = S("SIGA_LIM_MUNICIPAL")
    mc = b["municipios_corredor"]
    out["SIGA_LIM_MUNICIPAL_2026"] = "; ".join([
        fmt("SIGA_LIM_MUNICIPAL", sa, old),
        fmt("distritos (união)", sa, union(b["distritos"])),
        fmt("municipios_corredor[Santo André] IBGE", sa, union(mc[mc["nome"] == "Santo André"]))])
    out["SIGA_LIM_MUNICIPAL"] = fmt("SIGA_LIM_MUNICIPAL_2026", old, sa)
    out["SIGA_LIM_DISTRITO_SUBDISTRITO"] = fmt("distritos", S("SIGA_LIM_DISTRITO_SUBDISTRITO"), union(b["distritos"]))
    out["SIGA_LIM_BAIRROS_OFICIAL"] = fmt("bairros", S("SIGA_LIM_BAIRROS_OFICIAL"), union(b["bairros"]))
    out["SIGA_LIM_BAIRROS_2009"] = fmt("SIGA_LIM_BAIRROS_OFICIAL", S("SIGA_LIM_BAIRROS_2009"), S("SIGA_LIM_BAIRROS_OFICIAL"))
    out["SIGA_LIM_PARQUE_ANDREENSE"] = fmt("parque_andreense", S("SIGA_LIM_PARQUE_ANDREENSE"), union(b["parque_andreense"]))
    out["SIGA_LIM_BILLINGS_2026"] = fmt("billings_747 (cota 747 anterior)", S("SIGA_LIM_BILLINGS_2026"), union(b["billings_747"]))
    out["SIGA_AMB_CLASSIF_VEGETAL"] = fmt("classif_vegetal", S("SIGA_AMB_CLASSIF_VEGETAL"), union(b["classif_vegetal"]))
    out["SIGA_AMB_APP_LICENC_SUL"] = fmt("app_sul", S("SIGA_AMB_APP_LICENC_SUL"), union(b["app_sul"]))

    ucs = b["ucs"]
    for code in ("SIGA_AMB_UC_EST_SERRA_MAR", "SIGA_AMB_UC_EST_ALTO_PARANAP", "SIGA_AMB_UC_EST_BARONESA",
                 "SIGA_AMB_UC_MUN_NASC_PARANAP", "SIGA_AMB_UC_MUN_PEDROSO_LIM"):
        a = S(code)
        ov = ucs.geometry.intersection(a).area
        j = ov.idxmax()
        txt = (f"ucs feição #{j}: IoU {iou(a, ucs.geometry[j]):.3f}; "
               f"{ov[j] / a.area:.3f} da área SIGA dentro dela")
        if code == "SIGA_AMB_UC_MUN_NASC_PARANAP":
            txt = fmt("pnm_nascentes", a, union(b["pnm_nascentes"])) + "; " + txt
        out[code] = txt

    sub = read_siga("SIGA_AMB_SUB_BACIAS")
    for code, key in (("SIGA_AMB_BACIAS", "NOM_BACIA"), ("SIGA_AMB_MACRO_BACIAS", "NOM_MACRO"),
                      ("SIGA_AMB_UGRHIS", "UGRHIS")):
        lv, ds = read_siga(code).dissolve(key), sub.dissolve(key)
        m = min(iou(lv.geometry[k], ds.geometry[k]) for k in lv.index)
        out[code] = f"dissolve SIGA_AMB_SUB_BACIAS por {key}: IoU mínimo {m:.3f}"
    rh = b["regioes_hidrograficas"]
    rh["nome"] = rh["nome"].map(_fix_mojibake)
    ug = read_siga("SIGA_AMB_UGRHIS").dissolve("UGRHIS")
    for k, nm in (("UGRHIs 6 - Alto Tietê", "ALTO TIETÊ"), ("UGRHIs 7 - Baixada Santista", "BAIXADA SANTISTA")):
        a, c = ug.geometry[k], union(rh[rh["nome"] == nm]).intersection(sa)
        out["SIGA_AMB_UGRHIS"] += f"; {fmt('regioes_hidrograficas[' + nm + '] ∩ SA', a, c)}"
    s6 = union(b["subbacias_ugrhi6_regionais"])
    mb = read_siga("SIGA_AMB_MACRO_BACIAS").dissolve("NOM_MACRO")
    out["SIGA_AMB_MACRO_BACIAS"] += "; " + fmt("subbacias_ugrhi6 (CBH-AT) ∩ SA [Bacia Billings]",
                                               mb.geometry["Bacia Billings"], s6.intersection(sa))
    sb = b["subbacias"]
    win = sa.intersection(aoi)
    out["SIGA_AMB_SUB_BACIAS"] = "; ".join(
        fmt(f"subbacias GeoSEADE[ugrhi {u}] ∩ SA ∩ área", ug.geometry[k].intersection(win),
            union(sb[sb["ugrhi"] == u]).intersection(win))
        for u, k in (("6", "UGRHIs 6 - Alto Tietê"), ("7", "UGRHIs 7 - Baixada Santista")))

    circ = b["circuitos"]
    for code in [c for c in DATASETS if c.startswith("SIGA_TUR_")]:
        g = read_siga(code).explode(index_parts=False)
        n = sum(circ.distance(p).min() < 5 for p in g.geometry)
        out[code] = f"circuitos: {n}/{len(g)} pontos coincidem (< 5 m)"
    return out


def parse_pdf(path):
    if not path or not os.path.exists(path):
        return {}
    import fitz
    txt = "\n".join(p.get_text() for p in fitz.open(path))

    def grab(label, stop):
        m = re.search(rf"^{label}:\s*(.*?)\n(?={stop})", txt, re.S | re.M)
        return " ".join(m.group(1).split()) if m else ""
    escala = re.search(r"Escala Equivalente:\s*(\S+)", txt)
    epsg = re.search(r"Código Identificador:\s*EPSG\s*(\d+)", txt)
    return dict(titulo=grab("Título", "Data:"), data=grab("Data", "Tipo de Data"),
                responsavel=grab("Responsável", "Status:"), status=grab("Status", r"PALAVRAS|Escala"),
                escala=escala.group(1) if escala else "", epsg_pdf=epsg.group(1) if epsg else "")


def inventory(aoi, sa, iou_txt):
    import hashlib
    import pyogrio
    rows = []
    for code, d in DATASETS.items():
        meta = parse_pdf(os.path.join(RAW, d["tema"], d["pdf"])) if d.get("pdf") else {}
        zp = zip_path(code)
        row = dict(codigo_siga=code, tema=d["tema"], titulo=meta.get("titulo", ""),
                   data=meta.get("data", ""), responsavel=meta.get("responsavel", ""),
                   escala=meta.get("escala", ""), epsg="", base_legal=d.get("base_legal", ""),
                   geometria="", n_feicoes="", bbox_wgs84="", area_km2="", frac_area_estudo="",
                   arquivo=os.path.relpath(zp, REPO).replace("\\", "/") if os.path.exists(zp) else "",
                   tamanho_mb="", sha256="", versionado_git="",
                   ficha_pdf="sim" if meta else "não")
        dec = DECISOES.get(code, ("", "", "", "", ""))
        row.update(decisao=dec[0], camada_webgis=dec[1], substitui=dec[2], substituido_por=dec[3],
                   iou=iou_txt.get(code, ""), observacao=dec[4])
        if meta.get("status") == "Obsoleto":
            row["observacao"] = ("Ficha: Status Obsoleto. " + row["observacao"]).strip()
        if os.path.exists(zp):
            mb = os.path.getsize(zp) / 1e6
            row["tamanho_mb"] = f"{mb:.2f}"
            row["versionado_git"] = "não (> 50 MB, .gitignore)" if mb > GIT_LIMIT_MB else "sim"
            row["sha256"] = hashlib.sha256(open(zp, "rb").read()).hexdigest()[:16]
            if mb > GIT_LIMIT_MB:     # leitura só de metadados, sem geometrias
                with zipfile.ZipFile(zp) as zf:
                    shp = next(n for n in zf.namelist() if n.lower().endswith(".shp"))
                info = pyogrio.read_info(f"zip://{zp}!{shp}")
                bb = gpd.GeoSeries([box(*info["total_bounds"])], crs=info["crs"]).to_crs(WGS84).total_bounds
                row.update(epsg=str(gpd.GeoSeries([], crs=info["crs"]).crs.to_epsg()),
                           geometria=info["geometry_type"], n_feicoes=info["features"],
                           bbox_wgs84=" ".join(f"{x:.5f}" for x in bb))
            else:
                g = read_siga(code)
                with zipfile.ZipFile(zp) as zf:
                    shp = g.attrs["shp"]
                raw_crs = gpd.read_file(f"zip://{zp}!{shp}", rows=1).crs
                row.update(epsg=str(raw_crs.to_epsg()), geometria="/".join(sorted(set(g.geom_type))),
                           n_feicoes=len(g),
                           bbox_wgs84=" ".join(f"{x:.5f}" for x in g.to_crs(WGS84).total_bounds))
                if _dim(g) == 2:
                    u = union(g)
                    row["area_km2"] = f"{u.area / 1e6:.3f}"
                    row["frac_area_estudo"] = f"{u.intersection(aoi).area / u.area:.3f}"
                else:
                    n_in = int(g.explode(index_parts=False).within(aoi).sum())
                    row["frac_area_estudo"] = f"{n_in}/{len(g.explode(index_parts=False))} pontos"
                    if code.startswith("SIGA_TUR_") and n_in == 0:
                        row.update(decisao="descartada", camada_webgis="",
                                   observacao="Nenhum ponto na área de estudo (centro de Santo André). "
                                              "Fica no bruto; publicável como conteúdo regional "
                                              "com --regional-tur.")
                if g.attrs.get("n_invalid"):
                    row["observacao"] = (row["observacao"] +
                                         f" make_valid corrigiu {g.attrs['n_invalid']} geometria(s).").strip()
            if row["epsg"] and meta.get("epsg_pdf") and row["epsg"] != meta["epsg_pdf"]:
                row["observacao"] += f" ATENÇÃO: .prj EPSG {row['epsg']} ≠ ficha EPSG {meta['epsg_pdf']}."
        elif d.get("zip", True):
            row["observacao"] += " Zip ausente."
        if not d.get("pdf"):
            row["observacao"] = (row["observacao"] + " Sem ficha de metadados no SIGA.").strip()
        rows.append(row)
    for name, desc in EXTRAS_TOMBAMENTO.items():
        p = os.path.join(RAW_TOMBAMENTO, name)
        rows.append(dict(codigo_siga="(não-SIGA) " + name, tema="TOMBAMENTO_SERRA_MAR", titulo=desc,
                         arquivo=os.path.relpath(p, REPO).replace("\\", "/"),
                         tamanho_mb=f"{os.path.getsize(p) / 1e6:.2f}" if os.path.exists(p) else "",
                         versionado_git="não (fora de 00_DADOS_BRUTOS/SIGA)", decisao="pendente",
                         base_legal="Resolução SC 40/1985 (CONDEPHAAT)",
                         observacao="Insumo da camada 'Tombamento Serra do Mar' do mapa ambiental."))
    return rows


COLS = ["codigo_siga", "tema", "titulo", "data", "responsavel", "escala", "epsg", "base_legal",
        "geometria", "n_feicoes", "bbox_wgs84", "area_km2", "frac_area_estudo", "decisao",
        "camada_webgis", "substitui", "substituido_por", "iou", "observacao", "arquivo",
        "tamanho_mb", "sha256", "versionado_git", "ficha_pdf"]


# --------------------------------------------------------------------------
# Escrita com diff
# --------------------------------------------------------------------------
def stats(gdf_utm):
    if gdf_utm is None or gdf_utm.empty:
        return dict(n=0, area_km2=0.0, bbox="—")
    bb = gdf_utm.to_crs(WGS84).total_bounds
    a = gdf_utm.area.sum() / 1e6 if _dim(gdf_utm) == 2 else 0.0
    return dict(n=len(gdf_utm), area_km2=round(a, 3), bbox=" ".join(f"{x:.4f}" for x in bb))


def write_layers(layers, write_existing, dry_run):
    from lib import write_geojson
    preview = os.path.join(HERE, ".cache", "siga_preview")
    report = []
    for lid, gdf in layers.items():
        dest = os.path.join(OUT_DIR, lid + ".geojson")
        # "existente" = já estava publicada na linha de base; camadas novas
        # deste pipeline podem ser regravadas livremente.
        exists = os.path.exists(dest) and baseline(lid + ".geojson") is not None
        old = stats(gpd.read_file(dest).to_crs(UTM)) if exists else None
        new = stats(gdf)
        target = dest if (not exists or write_existing) else os.path.join(preview, lid + ".geojson")
        if not dry_run:
            gdf = gdf.copy()
            gdf.attrs = {}
            n, size = write_geojson(gdf.to_crs(WGS84), target, precision=6)
            new["kb"] = round(size / 1024)
        state = "nova" if not exists else ("regravada" if write_existing else "PRÉVIA (não gravada)")
        report.append((lid, state, old, new, layers[lid].attrs.get("simplify", "")))
    print("\n=== diff (antes → depois) ===")
    for lid, state, old, new, simp in report:
        o = f"{old['n']} feições, {old['area_km2']} km², bbox {old['bbox']}" if old else "—"
        print(f"{lid:22s} [{state}]\n    antes : {o}\n    depois: {new['n']} feições, "
              f"{new['area_km2']} km², bbox {new['bbox']}  {new.get('kb', '?')} kB  ({simp})")
    return report


def repair_regioes_hidrograficas(dry_run):
    """Corrige só o texto dos atributos (UTF-8 lido como Latin-1); geometria intacta."""
    p = os.path.join(OUT_DIR, "regioes_hidrograficas.geojson")
    fc = json.load(open(p, encoding="utf-8"))
    changed = 0
    for f in fc["features"]:
        for k, v in f["properties"].items():
            nv = _fix_mojibake(v)
            if nv != v:
                f["properties"][k] = nv
                changed += 1
    if changed and not dry_run:
        json.dump(fc, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print(f"regioes_hidrograficas: {changed} valores de texto corrigidos (geometria intacta)")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--ingest", metavar="DIR", help="copia o download bruto para 00_DADOS_BRUTOS/SIGA")
    ap.add_argument("--base", help="pasta 01_CAMADAS_BASE (UCs GeoSEADE)")
    ap.add_argument("--write-existing", action="store_true",
                    help="regrava GeoJSON já existentes (depois de revisar o diff)")
    ap.add_argument("--dry-run", action="store_true", help="não grava nada")
    ap.add_argument("--regional-tur", action="store_true",
                    help="publica os 4 circuitos prioritários também fora da área de estudo")
    ap.add_argument("--marco-zero", action="store_true", help="publica o Marco Zero (fora da área)")
    a = ap.parse_args()
    if a.ingest:
        ingest(a.ingest)
        return
    base = base_root(a.base)
    aoi = study_area()
    sa = union(read_siga("SIGA_LIM_MUNICIPAL_2026"))
    print(f"área de estudo: {aoi.area / 1e6:.1f} km² (extensão de hipsometria.geojson); "
          f"Santo André ∩ área: {aoi.intersection(sa).area / 1e6:.1f} km²")
    layers = build_layers(aoi, base, regional_tur=a.regional_tur, marco_zero=a.marco_zero)
    write_layers(layers, a.write_existing, a.dry_run)
    repair_regioes_hidrograficas(a.dry_run or not a.write_existing)
    print("\ncomparando com a linha de base", BASELINE, "…")
    rows = inventory(aoi, sa, comparisons(aoi, sa))
    if not a.dry_run:
        with open(MANIFEST, "w", encoding="utf-8-sig", newline="") as f:
            w = csv.DictWriter(f, fieldnames=COLS, extrasaction="ignore")
            w.writeheader()
            w.writerows(rows)
        print(f"manifesto: {os.path.relpath(MANIFEST, REPO)} ({len(rows)} linhas)")


if __name__ == "__main__":
    main()
