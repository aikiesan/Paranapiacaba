# Diretório de Dados Geográficos (GeoJSON)

Este diretório contém os arquivos de dados geográficos no formato GeoJSON que servem de fonte para as camadas do WebGIS.

## Requisitos dos Arquivos

1. **Formato:** GeoJSON (`FeatureCollection`)
2. **Projeção/SRC:** Obrigatório estar em **WGS 84 (EPSG:4326)** (Latitude e Longitude decimais).
3. **Nomenclatura:** Os nomes dos arquivos devem seguir o padrão `snake_case` e corresponder exatamente à propriedade `file` cadastrada no arquivo [layers.js](file:///c:/Users/Lucas/Documents/PROJETO_FAPESP_PUCCAMP/1_GIS_UNESCO_PARANAPIACABA/src/config/layers.js) (ex: `limite_sitio.geojson`).

---

## Como Exportar e Preparar as Camadas

Para garantir o bom desempenho do mapa no navegador, as geometrias não devem possuir excesso de vértices e detalhes (especialmente redes hidrográficas, declividades ou curvas de nível).

### 1. Exportando com `ogr2ogr` (GDAL)

Você pode exportar camadas de bancos de dados geográficos (como File Geodatabase `.gdb`, GeoPackage `.gpkg` ou Shapefiles `.shp`) usando o utilitário `ogr2ogr`.

#### Exemplo a partir de GeoPackage (`.gpkg`):
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 \
  public/data/trilhas.geojson \
  caminho/para/banco_paranapiacaba.gpkg \
  nome_da_tabela_trilhas
```

#### Exemplo a partir de Shapefile (`.shp`):
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 \
  public/data/hidrografia.geojson \
  caminho/para/hidrografia_original.shp
```

#### Exemplo a partir de File Geodatabase (`.gdb`):
```bash
ogr2ogr -f GeoJSON -t_srs EPSG:4326 \
  public/data/limite_sitio.geojson \
  caminho/para/Paranapiacaba.gdb \
  tabela_limite_sitio
```

---

### 2. Simplificando Geometrias Pesadas com `mapshaper`

Para arquivos grandes (> 2MB), é extremamente recomendado reduzir o peso do arquivo simplificando os vértices das linhas e polígonos. A ferramenta recomendada é o **mapshaper** (Node.js).

Instalação global:
```bash
npm install -g mapshaper
```

#### Exemplo de Simplificação (Preservando Topologia):
Simplifica a hidrografia mantendo 15% dos vértices originais (método Visvalingam-Whyatt):

```bash
mapshaper public/data/hidrografia.geojson \
  -simplify 15% keep-shapes \
  -o public/data/hidrografia.geojson format=geojson
```

Para camadas de declividade ou setores censitários, o método `keep-shapes` previne a criação de frestas entre polígonos adjacentes.
