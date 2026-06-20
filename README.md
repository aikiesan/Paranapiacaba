# WebGIS Paranapiacaba — Corredor Ferroviário Jundiaí–Santos

**Projeto FAPESP / PUC-Campinas — Sítio UNESCO Paranapiacaba**

Aplicação WebGIS (React + Vite + Leaflet) que mapeia o **corredor ferroviário
histórico Jundiaí–Santos** (São Paulo Railway, 1867), com a **Vila de
Paranapiacaba** (Santo André) como núcleo de detalhe. Publicada via GitHub Pages.

🔗 **Deploy:** https://aikiesan.github.io/Paranapiacaba

## Rodar localmente
```bash
npm install
npm run dev        # http://localhost:5173/Paranapiacaba/
npm run build      # build de produção em dist/
npm run preview    # serve o build em http://localhost:4173/Paranapiacaba/
```

## Dados das camadas
As camadas (`public/data/*.geojson`) são **geradas** pelo pipeline Python em
[`scripts/`](scripts/) a partir dos shapefiles em
`EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/01_CAMADAS_BASE/` (fora do versionamento).
Para regenerar:
```bash
cd scripts && pip install -r requirements.txt
python build_data.py && python validate_data.py
```
Mapeamento camada↔fonte em [`scripts/config.py`](scripts/config.py); detalhes em
[`public/data/README.md`](public/data/README.md).

## Deploy (GitHub Pages)
Push na branch `main` dispara `.github/workflows/deploy.yml`, que faz o build do
Vite e publica `dist/` na branch `gh-pages`. O `base` do Vite é `/Paranapiacaba/`.

---

# Workspace SIG consolidado (referência)

**Reorganizado em 17/06/2026.** Documentação do SIG original (dados, projeto
ArcGIS, scripts e mapas finais) — mantida como referência da fonte dos dados.

## Estrutura

```
1_GIS_UNESCO_PARANAPIACABA/
├── 00_DADOS_BRUTOS/          ← originais (não editar)
│   ├── 01_SHAPEFILES_ORIGINAIS/   (837 shapes em 23 categorias)
│   ├── 04_INVENTARIOS_XLSX/       inventários + MAPEAMENTO E SHAPEFILES_R01 (catálogo de shapes)
│   ├── 05_IMAGENS_CAMPO/          fotos de campo
│   ├── 06_PDF_DOCUMENTOS/         Atlas das Nascentes, INFURB, etc.
│   ├── 07_TRILHAS_KML/            46 KMLs (tracks GPS Wikiloc) — entrada do pipeline de trilhas
│   └── 08_CAD_VILA/               MAPA VILA 2025 UNESCO.dwg
├── 01_CAMADAS_BASE/          ← camadas reprojetadas EPSG:4674
│   ├── 09_RASTERS_COBERTURA/      MapBiomas 2008–2024 (.tif)
│   └── 11_CADASTRO_VILA_GEOREF/   paranapiacaba_*_georef.shp (CAD da Vila georref.)
├── 02_PATRIMONIO/  03_LEGISLACAO_PLANEJAMENTO/   ← (vazias) p/ exports temáticos do GDB
├── 04_SOCIOECONOMICO/04_USO_SOLO/   histórico/matriz de transição (MapBiomas)
├── 05_TURISMO_CIRCUITOS/02_TRILHAS_CAMINHOS/   trilhas_paranapiacaba.gpkg (+ tabela .csv)
├── 06_MAPAS_FINAIS/
│   ├── 07_SERIES_TEMATICAS/       rascunhos (graficos PNG)
│   └── 08_EXPORTADOS_PDF_TIFF/    **26 pranchas A0 finais (PDF+PNG 300 dpi)** + MAPS_PARANAPIACABA.pdf
├── 07_ARCGIS_PRO/
│   ├── 01_PROJETOS_APRX/Projeto_FAPESP_UNESCO_PARANAPIACABA/  ← .aprx + GDB CANÔNICO (~200 camadas) + .atbx
│   ├── 03_ESTILOS_TEMPLATES/      Layout A0 (.pagx) + provas de layout
│   └── 04_SCRIPTS_TOOLBOX/prancha/  pipeline Python (template + build_*.py + _paths.py)
└── 08_DOCUMENTACAO/
    ├── 01_METADADOS/   auditoria_projeto.csv
    ├── 02_RELATORIOS/  NOVOS_MAPAS_BASE, PLANO_DESENVOLVIMENTO_MAPAS, INVENTARIO_E_PLANO_TRILHAS, DIAGNOSTICO, RELATORIO
    ├── 03_NOTEBOOKS/   Paranapiacaba_clean.ipynb
    └── 04_SCRIPTS_ANALISE/  scripts de análise (xlsx/csv) e inventários
```

## Geodatabase canônico
`07_ARCGIS_PRO/01_PROJETOS_APRX/Projeto_FAPESP_UNESCO_PARANAPIACABA/Projeto_FAPESP_UNESCO_PARANAPIACABA.gdb`
(~200 camadas, EPSG:4674). É o GDB padrão do projeto ArcGIS (`.aprx`) na mesma pasta.

## Pipeline de mapas (pranchas A0)
Scripts em `07_ARCGIS_PRO/04_SCRIPTS_TOOLBOX/prancha/`. Os caminhos são centralizados
em `_paths.py` (GDB, trilhas, cadastro, KMLs, saídas) — não há mais dependência de
estrutura relativa frágil. Rodar com o **Python do ArcGIS Pro** (o env conda `cp2b`
tem matplotlib quebrado):

```
cd 07_ARCGIS_PRO\04_SCRIPTS_TOOLBOX\prancha
"C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" build_trilhas_layer.py
"C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\python.exe" build_r2_trilhas_rede.py
```
As pranchas saem em `06_MAPAS_FINAIS/08_EXPORTADOS_PDF_TIFF/`.

## Pendências da reorganização
- **Re-apontar as fontes do `.aprx`** ao abrir no ArcGIS Pro: o link ao GDB padrão é
  preservado (mesma pasta), mas as camadas que apontavam para shapefiles externos
  (ex.: `01_CAMADAS_BASE`) precisam ser reconectadas (Repair Source) — o caminho-base
  mudou.
- **Arquivos pesados deixados fora** (decisão de escopo): os `.zip` do drive
  (~30 GB) e a `analise_ambiental_paranapiacaba/geodatabase/ABIOVE2026.gdb` (~10 GB)
  permanecem na raiz do projeto. O projeto ArcGIS antigo em `5_PROJETO_ARCGIS_PRO` e
  o backup `7_Feito_Em_Casa-….zip` também foram mantidos como arquivo.

## Status dos mapas
Ver `08_DOCUMENTACAO/02_RELATORIOS/NOVOS_MAPAS_BASE.md` (status por ID) e
`PLANO_DESENVOLVIMENTO_MAPAS.md` (gap analysis e roteiro).
