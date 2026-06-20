"""Paths, areas of interest, and the source->target job list for the pipeline.

Single source of truth: edit JOBS to change what ends up in public/data/.
"""
import os

# --- Paths -------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT_DIR = os.path.join(REPO, "public", "data")
CACHE_DIR = os.path.join(HERE, ".cache")

EXTERNAL = os.path.join(REPO, "EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED")
# Clean, pre-organized canonical source (reprojected base layers).
SOURCE_ROOT = os.path.join(
    EXTERNAL, "01_CAMADAS_BASE-20260619T230527Z-3-001", "01_CAMADAS_BASE"
)


def src(*parts):
    return os.path.join(SOURCE_ROOT, *parts)


# --- Areas of interest -------------------------------------------------------
# Corridor band covering the historic São Paulo Railway: Jundiaí -> São Paulo ->
# Santo André/Paranapiacaba -> Cubatão -> Santos. (lon_min, lat_min, lon_max, lat_max)
CORRIDOR_BBOX = (-47.05, -24.10, -46.15, -23.05)

# The detailed village mask is loaded at build time from this polygon and buffered.
VILA_MASK_SRC = src("01_LIMITES_ADMINISTRATIVOS", "ALTO_DA_SERRA",
                    "FAPESP_Alto_da_Serra_Delimitacao.shp")
VILA_BUFFER_DEG = 0.006  # ~650 m so edge features are not clipped off
SERRA_BUFFER_DEG = 0.05  # ~5.5 km around the vila (sub-basins / divisor de águas)

# Georeferencing nudge for the Vila CAD layers (houses + lots + local rail share
# one CAD georef). Measured against OSM/Esri building footprints: the CAD sits
# ~3.22 m E and ~3.37 m N of imagery, so shift W/S. Stored in degrees at ~lat -23.78.
# (dlon, dlat). Tweak here to re-align; re-run build_data.py.
NUDGE_VILA_DEG = (-0.0000316, -0.0000303)

# Wikiloc GPS tracks (real trilhas) — 46 KML exports in the raw data tree.
TRILHAS_KML_DIR = os.path.join(
    EXTERNAL, "00_DADOS_BRUTOS-20260619T230500Z-3-001", "00_DADOS_BRUTOS",
    "07_TRILHAS_KML"
)

# --- Candidate name columns for layers with heterogeneous schemas ------------
NAME_CANDIDATES = [
    "nome", "NOME", "EQUIPAMENT", "DSC_DENOMI", "NomeEstaca", "NM_MUN",
    "NOME1", "NM_UC", "nome_uc", "NOMEUC1", "name", "LABEL", "label", "Funicular",
]

# --- Jobs --------------------------------------------------------------------
# aoi: "corridor" | "vila" | None
# family: when set, `src` is a glob; one output layer is built by stacking every
#         matching shapefile and tagging it with a category parsed from the file
#         name (prefix stripped, trailing "Point"/"MPoint"/"Polygon"/"Line" removed).
JOBS = [
    # ---- Ferrovia SPR (Jundiaí–Santos) -- the spine --------------------------
    {
        "out": "ferrovia_corredor.geojson", "aoi": "corridor", "simplify": 8e-5,
        "src": ["04_FERROVIA_MOBILIDADE/BaseFerro.shp"],
        "keep": {"nome": "nome", "tip_situac": "situacao", "bitola": "bitola",
                 "municipio": "municipio", "uf": "uf", "extensao": "extensao_km"},
        "osm_rail_fill": True,
    },
    {
        "out": "estacoes.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["04_FERROVIA_MOBILIDADE/Estacao.shp"],
        "keep": {"NomeEstaca": "nome", "CodigoMuni": "cod_municipio",
                 "CodigoSitu": "cod_situacao"},
    },
    {
        "out": "ferrovia_local.geojson", "aoi": "vila", "simplify": 5e-6,
        "src": ["11_CADASTRO_VILA_GEOREF/paranapiacaba_trilhos_ferrovia_georef.shp"],
        "repair_epsg": 31983, "keep": {"Layer": "elemento"}, "nudge": True,
    },
    {
        "out": "funicular.geojson", "aoi": None, "simplify": 1e-5,
        "src": ["04_FERROVIA_MOBILIDADE/Funicular.shp"],
        "keep": {"Funicular": "trecho", "id": "id"},
    },
    {
        "out": "patrimonio_ferroviario.geojson", "aoi": "vila", "simplify": 5e-6,
        "src": ["05_PATRIMONIO/EDIFICACOES_PALAZZI/Ruinas.shp"],
        "keep": {"layer": "condicao"}, "extra": {"tipo": "Ruína ferroviária"},
        "nudge": True,
    },

    # ---- Território ----------------------------------------------------------
    {
        # Only municipalities the corridor railway actually crosses (~2.7 km buffer),
        # not every municipality in the bounding box.
        "out": "municipios_corredor.geojson", "aoi": None, "simplify": 5e-4,
        "rail_buffer_deg": 0.025,
        "src": ["01_LIMITES_ADMINISTRATIVOS/BR_Municipios_2024.shp"],
        "keep": {"NM_MUN": "nome", "NM_UF": "uf", "SIGLA_UF": "sigla_uf",
                 "AREA_KM2": "area_km2"},
        "mapshaper": "8%",
    },
    {
        "out": "limite_sitio.geojson", "aoi": None, "simplify": 0,
        "src": ["01_LIMITES_ADMINISTRATIVOS/ALTO_DA_SERRA/FAPESP_Alto_da_Serra_Delimitacao.shp"],
        "keep": {"NOME": "nome"},
    },
    {
        "out": "limite_vila.geojson", "aoi": None, "simplify": 1e-5,
        "src": ["06_LEGISLACAO_PLANEJAMENTO/SIGA_PLA_LEGIS_ZEIP_PARANAPPolygon.shp"],
        "extra": {"nome": "ZEIP Paranapiacaba"},
    },

    # ---- Meio Ambiente -------------------------------------------------------
    {
        "out": "ucs.geojson", "aoi": "corridor", "simplify": 2e-4,
        "src": ["03_UNIDADES_CONSERVACAO/MA_ucestpi1.shp",
                "03_UNIDADES_CONSERVACAO/MA_ucmunpi1.shp",
                "03_UNIDADES_CONSERVACAO/SIGA_AMB_UC_EST_ALTO_PARANAPPolygon.shp"],
        "name_auto": True, "mapshaper": "20%",
    },
    {
        "out": "hidrografia.geojson", "aoi": "vila", "simplify": 2e-5,
        "src": ["05_PATRIMONIO/EDIFICACOES_PALAZZI/Corregos.shp"],
        "keep": {"layer": "tipo"}, "nudge": True,
    },
    {
        "out": "nascentes.geojson", "aoi": "vila", "simplify": 0,
        "src": ["02_HIDROGRAFIA/APPs_Nascentes.shp"], "name_auto": True,
    },
    {
        "out": "app_buffers.geojson", "aoi": "vila", "simplify": 2e-5,
        "src": ["02_HIDROGRAFIA/APPs_Hidrografia.shp",
                "02_HIDROGRAFIA/APPs_Nascentes.shp"], "name_auto": True,
    },
    {
        # Sub-bacias ao redor da Vila — divisor de águas Alto Tietê (UGRHI 6) /
        # Baixada Santista (UGRHI 7).
        "out": "subbacias.geojson", "aoi": "serra", "simplify": 1e-4,
        "src": ["02_HIDROGRAFIA/MA_subbacias.shp"],
        "keep": {"DSUBBC1": "nome", "NUGRHI0": "ugrhi"}, "mapshaper": "20%",
    },

    # ---- Patrimônio ----------------------------------------------------------
    {
        "out": "patrimonio_tombados.geojson", "aoi": "corridor", "simplify": 5e-6,
        "src": ["05_PATRIMONIO/PATRIMONIO_CULTURAL/TOMBADOS_FEDERAL.shp",
                "05_PATRIMONIO/PATRIMONIO_CULTURAL/TOMBADOS_ESTADUAL.shp",
                "05_PATRIMONIO/PATRIMONIO_CULTURAL/TOMBADOS_MUNICIPAL.shp"],
        "keep": {"DSC_DENOMI": "nome", "DSC_ENDERE": "endereco",
                 "NOM_BAIRRO": "bairro", "INSTANCIA": "instancia",
                 "NOM_ORGAO": "orgao", "NUM_PROCES": "processo",
                 "DTA_TOMBO": "data_tombamento", "DSC_USO_AT": "uso_atual"},
    },
    {
        "out": "edificacoes_vila.geojson", "aoi": "vila", "simplify": 4e-6,
        "src": ["05_PATRIMONIO/EDIFICACOES_PALAZZI/Edificacoes_*.shp"],
        "family": "uso", "family_prefix": "Edificacoes_", "nudge": True,
    },
    {
        "out": "pac_lotes.geojson", "aoi": None, "simplify": 4e-6,
        "src": ["11_CADASTRO_VILA_GEOREF/paranapiacaba_lotes_georef.shp"],
        "repair_epsg": 31983, "keep": {"Layer": "lote"}, "nudge": True,
    },

    # ---- Turismo e Trilhas ---------------------------------------------------
    {
        # Trilhas reais (Wikiloc) — uma faixa por KML, com distância e desnível.
        "out": "trilhas.geojson", "aoi": None, "simplify": 4e-5,
        "kml_dir": TRILHAS_KML_DIR,
    },
    {
        # Atrativos naturais extraídos dos waypoints dos KML (cachoeiras, poços…).
        "out": "atrativos.geojson", "aoi": None, "simplify": 0,
        "kml_dir": TRILHAS_KML_DIR, "kml_mode": "waypoints",
    },
    {
        "out": "circuitos.geojson", "aoi": "vila", "simplify": 0,
        "src": ["07_TURISMO_CIRCUITOS/SIGA_TUR_*.shp"],
        "family": "categoria", "family_prefix": "SIGA_TUR_",
    },

    # ---- Socioeconomia -------------------------------------------------------
    {
        "out": "censo_setores.geojson", "aoi": None, "simplify": 3e-5,
        "src": ["08_SOCIOECONOMICO/FC_35SANDRE.shp"],
        "filter": ("NOMEDIST", ["PARANAPIACABA"]),
        "keep": {"CODSETOR": "cod_setor", "NOMEBAIR": "bairro",
                 "NOMEDIST": "distrito", "DENSDEMO": "densidade_hab_ha",
                 "V0003": "domicilios"},
        "mapshaper": "30%",
    },
    {
        "out": "densidade.geojson", "aoi": None, "simplify": 3e-5,
        "src": ["08_SOCIOECONOMICO/FC_35SANDRE.shp"],
        "filter": ("NOMEDIST", ["PARANAPIACABA"]),
        "keep": {"CODSETOR": "cod_setor", "DENSDEMO": "densidade_hab_ha"},
        "mapshaper": "30%",
    },

    # ---- Equipamentos Urbanos (curated thematic) -----------------------------
    {
        "out": "saude.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["03_EQUIPAMENTOS/SAUDE/SIGA_SAU_*.shp"],
        "family": "categoria", "family_prefix": "SIGA_SAU_", "name_auto": True,
    },
    {
        "out": "educacao.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["03_EQUIPAMENTOS/EDUCACAO/SIGA_EDU_*.shp"],
        "family": "categoria", "family_prefix": "SIGA_EDU_", "name_auto": True,
    },
    {
        "out": "seguranca.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["03_EQUIPAMENTOS/SEGURANCA/SIGA_SEG_*.shp"],
        "family": "categoria", "family_prefix": "SIGA_SEG_", "name_auto": True,
    },
    {
        "out": "esporte.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["03_EQUIPAMENTOS/ESPORTE/SIGA_ESP_*.shp"],
        "family": "categoria", "family_prefix": "SIGA_ESP_", "name_auto": True,
    },
    {
        "out": "assistencia_social.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["03_EQUIPAMENTOS/ASSIST_SOCIAL/SIGA_AS_*Point.shp"],
        "family": "categoria", "family_prefix": "SIGA_AS_", "name_auto": True,
    },
    {
        "out": "defesa_civil.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["03_EQUIPAMENTOS/DEFESA_CIVIL/SIGA_DCI_*.shp"],
        "family": "categoria", "family_prefix": "SIGA_DCI_", "name_auto": True,
    },

    # ---- Mobilidade (rodovias, rail RMSP, ciclovias) -------------------------
    {
        "out": "ferrovia_rmsp.geojson", "aoi": "corridor", "simplify": 8e-5,
        "src": ["04_FERROVIA_MOBILIDADE/FER_L_RMSP_2021_CEM.shp"],
        "keep": {"NM_FER": "nome", "OPERACAO": "operacao", "TIPO": "tipo",
                 "EXT_KM": "ext_km"},
    },
    {
        "out": "rodovias.geojson", "aoi": "corridor", "simplify": 1e-4,
        "src": ["04_FERROVIA_MOBILIDADE/RODO_RMSP_2021_CEM.shp"],
        "keep": {"OPERACAO": "operacao", "INSTANCIA": "instancia", "EXT_KM": "ext_km"},
    },
    {
        "out": "ciclovias.geojson", "aoi": "corridor", "simplify": 2e-5,
        "src": ["04_FERROVIA_MOBILIDADE/SIGA_MUR_SIS_CICLOVIARIOLine.shp"],
        "keep": {"TIPO": "tipo"},
    },

    # ---- Território (regional) -----------------------------------------------
    {
        "out": "grande_abc.geojson", "aoi": None, "simplify": 1e-4,
        "src": ["01_LIMITES_ADMINISTRATIVOS/GRANDE_ABC.shp"],
        "keep": {"cidade": "nome"}, "mapshaper": "15%",
    },
    {
        "out": "bairros.geojson", "aoi": "corridor", "simplify": 5e-5,
        "src": ["01_LIMITES_ADMINISTRATIVOS/SIGA_LIM_BAIRROS_OFICIALPolygon.shp"],
        "keep": {"NOME": "nome", "AREA": "area", "NUM_LEI": "lei"},
        "mapshaper": "20%",
    },
    {
        "out": "parque_andreense.geojson", "aoi": None, "simplify": 5e-5,
        "src": ["01_LIMITES_ADMINISTRATIVOS/SIGA_LIM_PARQUE_ANDREENSEPolygon.shp"],
        "keep": {"NOME": "nome", "LEGISLACAO": "legislacao"},
    },

    # ---- Meio Ambiente (reservatórios) ---------------------------------------
    {
        "out": "reservatorios.geojson", "aoi": "corridor", "simplify": 4e-4,
        "src": ["02_HIDROGRAFIA/Reservatorios_RMSP.shp"],
        "keep": {"NM_MD": "nome", "TIPO_MD": "tipo", "CBHAT": "bacia"},
    },

    # ---- Patrimônio cultural (registrados, territórios) ----------------------
    {
        "out": "bens_registrados.geojson", "aoi": "corridor", "simplify": 0,
        "src": ["05_PATRIMONIO/PATRIMONIO_CULTURAL/SIGA_CUL_BENS_REGISTRADOSPoint.shp"],
        "keep": {"DSC_DENOMI": "nome", "DSC_ENDERE": "endereco",
                 "DSC_TIPOLO": "tipologia"},
    },
    {
        "out": "territorios_culturais.geojson", "aoi": "corridor", "simplify": 3e-5,
        "src": ["05_PATRIMONIO/PATRIMONIO_CULTURAL/SIGA_CUL_TERRITORIOS_CULTURAISPolygon.shp"],
        "keep": {"NOM_BAIRRO": "nome", "NUM_REGIAO": "regiao"},
    },

    # ---- Legislação e Planejamento -------------------------------------------
    {
        "out": "macrozonas.geojson", "aoi": "corridor", "simplify": 5e-5,
        "src": ["06_LEGISLACAO_PLANEJAMENTO/LC_1181_2022_MACROZONAS.shp"],
        "keep": {"DESCRICAO": "nome"}, "mapshaper": "25%",
    },
    {
        "out": "zoneamento_mzpa.geojson", "aoi": "corridor", "simplify": 3e-5,
        "src": ["06_LEGISLACAO_PLANEJAMENTO/SIGA_PLA_SETORIZACAO_MZPAPolygon.shp"],
        "keep": {"SETORIZACA": "setor", "URL_LEGISL": "legislacao"},
    },
]
