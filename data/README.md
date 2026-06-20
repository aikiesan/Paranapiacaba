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
python build_rasters.py                  # overlays raster: MapBiomas 2008–2024 + declividade
```

Os overlays raster (PNGs georreferenciados + `rasters/manifest.json`) são
gerados por `build_rasters.py`: cobertura MapBiomas colorizada por ano e
declividade (5 classes) interpolada a partir das curvas de nível.

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
