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
```

Opcional — checagem de continuidade do corredor via OpenStreetMap:
```bash
python fetch_osm_railway.py              # baixa malha OSM para scripts/.cache/
OSM_FILL=1 python build_data.py ferrovia_corredor.geojson
```
(Por padrão o corredor usa a malha IBGE `BaseFerro`, que já cobre Jundiaí→Santos.)

## Mapa fonte → camada
O mapeamento canônico (camada de saída ↔ shapefile de origem, recorte e
simplificação) está em [`scripts/config.py`](../../scripts/config.py) na lista `JOBS`.
