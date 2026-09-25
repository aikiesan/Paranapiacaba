# Dados Geográficos (GeoJSON) — `public/data/`

Os arquivos GeoJSON desta pasta são as **fontes das camadas do WebGIS** e são
**gerados automaticamente** pelo pipeline em [`scripts/`](../../scripts/), a partir
dos shapefiles organizados em `EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/01_CAMADAS_BASE/`
(que ficam fora do controle de versão).

> ⚠️ Não edite estes `.geojson` à mão — eles são sobrescritos a cada execução do
> pipeline. Para mudar uma camada, ajuste o mapeamento em `scripts/config.py`.

## Requisitos dos arquivos
- **Formato:** GeoJSON (`FeatureCollection`), RFC 7946.
- **Projeção:** WGS 84 (EPSG:4326), coordenadas arredondadas a 6 casas.
- **Nomenclatura:** `snake_case`, casando exatamente com a propriedade `file` de
  cada camada em [`src/config/layers.js`](../../src/config/layers.js).

## Como regenerar
```bash
cd scripts
pip install -r requirements.txt          # geopandas, shapely, pyogrio, requests
python build_data.py                     # gera todos os public/data/*.geojson
python build_data.py ferrovia_corredor.geojson   # ou apenas camadas específicas
python validate_data.py                  # valida (4326, FeatureCollection, bbox)
python build_rasters.py                  # overlays raster: MapBiomas 2008–2024 + ortofoto 2010
python build_declividade.py              # declividade (5 classes) — Copernicus GLO-30
```

Os overlays raster (PNGs georreferenciados + `rasters/manifest.json`) são
gerados por `build_rasters.py` (cobertura MapBiomas colorizada por ano e
ortofoto 2010). A declividade em 5 classes (0–8, 8–20, 20–30, 30–45, >45%) é
gerada por `build_declividade.py` a partir do Copernicus DEM GLO-30 (~30 m,
método de Horn), publicada como `declividade.geojson` e como overlay raster.

Rede de energia: `rede_eletrica.geojson` (linhas de transmissão) e
`subestacoes.geojson` saem de `build_data.py` a partir dos shapefiles EPE/SIN
`LT_EXISTENTE` e `SE_EXISTENTE` colocados em `Energia_SIN/` (fora do
versionamento), recortados ao corredor Jundiaí–Santos.

Opcional — checagem de continuidade do corredor via OpenStreetMap:
```bash
python fetch_osm_railway.py              # baixa malha OSM para scripts/.cache/
OSM_FILL=1 python build_data.py ferrovia_corredor.geojson
```
(Por padrão o corredor usa a malha IBGE `BaseFerro`, que já cobre Jundiaí→Santos.)

## Mapa fonte → camada
O mapeamento canônico (camada de saída ↔ shapefile de origem, recorte e
simplificação) está em [`scripts/config.py`](../../scripts/config.py) na lista `JOBS`.

Opções de `JOBS` relevantes: `aoi` (`corridor`/`vila`/`serra`/`None`), `simplify`,
`keep` (renomeia colunas), `name_auto`, `family`/`family_prefix` (empilha vários
shapefiles e marca uma `categoria`), `repair_epsg` + `nudge` (camadas CAD da Vila,
EPSG:31983), `mapshaper` (simplificação topológica), `filter`, `extra`, e
**`dissolve`** (funde milhares de segmentos sem atributos — ex.: curvas de nível —
numa única (Multi)geometria, eliminando o overhead por feição no GeoJSON).

### Camadas adicionadas (Fase E)
- **Morfologia da Vila:** `edificacoes_cad`, `sistema_viario`, `caminhos_vila`,
  `curvas_nivel` (CAD georref. 2025) + `pac_lotes`.
- **Patrimônio:** `bens_estudo` (bens em estudo de tombamento), `abpf`.
- **Equipamentos Urbanos:** `feiras_livres`, `cemiterio`.
- **Meio Ambiente:** `regioes_hidrograficas`.
- **Mobilidade:** `mobilidade_urbana` (linhas de ônibus municipais/intermunicipais).

> Nota: não há camada de UCs federais — o único UC federal que intersecta o
> corredor é a APA Bacia do Paraíba do Sul (região distinta); as UCs relevantes
> (estaduais/municipais) já estão em `ucs.geojson`.

### Camadas adicionadas (Fase F — lote SIGA_MAPA)
Origem: `OTHER_SHAPEFILES_SIGA_MAPA/` (EPSG:31983, gitignored; jobs usam
`"root": SIGA_MAPA`).
- **Meio Ambiente:** `classif_vegetal` (sucessão da Mata Atlântica), `app_sul`,
  `rios_sul`, `pnm_nascentes` (PNM Nascentes de Paranapiacaba),
  `altimetria_serra` (curvas-mestras 50 m), `billings_747`.
- **Patrimônio:** `areas_envoltorias` (zonas de entorno dos tombados — inclui o
  Complexo Ferroviário de Paranapiacaba; ≈ zona de amortecimento UNESCO).
- **Riscos (Defesa Civil):** `susc_movmas` (suscetibilidade a deslizamentos,
  IPT 2025), `risco_movmas` (risco, IPT 2014), `risco_incendio`.
- **Território:** `distritos` (distrito de Paranapiacaba).
- **Socioeconomia:** `densidade_2022`, `populacao_2022` (Censo IBGE 2022).

> Não incluídos (duplicatas ou granularidade municipal grossa): UC estadual Alto
> Paranapiacaba, bairros, ZEIP, pluviômetros, ferrovia e circuito Paranapiacaba
> (já presentes); risco de enxurrada (sem feições perto de Paranapiacaba);
> infraestrutura domiciliar (6×), censo por faixa etária/gênero e densidade 2010.

Cada camada pode ser baixada direto do painel (ícone de download → GeoJSON) ou
pela tabela de atributos (GeoJSON / CSV).

### Camadas adicionadas (Fase G — hidrografia regional completa)

Origem: `Hidrografia_Completa_SP/` (SIRGAS 2000 / UTM 23S, EPSG:31983,
gitignored), processada por `scripts/build_hydrography.py` para WGS 84
(EPSG:4326). O recorte regional `(-46.40, -23.86, -46.22, -23.68)` cobre as
duas vertentes do divisor de águas de Paranapiacaba.

- `hidrografia_regional_completa`: 2.555 trechos integrando APPs/RMSP,
  Hidrografia UGRHI 6 e Hidrografia Complementar UGRHI 6.
- `nascentes_regionais`: 745 pontos de nascente.
- `apps_hidricas_regionais`: APPs hídricas no recorte de análise.
- `subbacias_ugrhi6_regionais`: duas sub-bacias oficiais intersectantes.
- `apm_aprm_regionais`: duas áreas de proteção/recuperação de mananciais.
- `reservatorios_rmsp_completos`: os 17 reservatórios da base RMSP, mantidos
  completos para análise metropolitana.

O raster `rasters/ortofoto_paranapiacaba_2010.webp` é derivado do GeoTIFF
EPSG:4674, preserva os 3.000 × 3.000 pixels originais e é descrito em
`rasters/manifest.json`.
