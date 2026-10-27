# 📋 WebGIS Paranapiacaba — Comprehensive Project Context & Handoff Document

> **Destination / Recipient:** Claude Code & Engineering Review Team  
> **Project Title:** WebGIS Paranapiacaba — Corredor Ferroviário Jundiaí–Santos (Projeto FAPESP / PUC-Campinas Sítio UNESCO)  
> **Repository:** `aikiesan/Paranapiacaba`  
> **Production URL:** [https://aikiesan.github.io/Paranapiacaba](https://aikiesan.github.io/Paranapiacaba)  
> **Vite Base Path:** `/Paranapiacaba/`  
> **Generated:** August 2026  

---

## 1. Executive Summary & Core Purpose

This repository houses the **WebGIS Paranapiacaba** application, developed as part of the **FAPESP / PUC-Campinas Research Project** supporting the **UNESCO World Heritage Dossier candidacy**.

### Key Scope & Objectives
1. **Territorial Egress:** Mappings of the historic 139 km **São Paulo Railway (1867)** corridor connecting **Jundiaí → São Paulo → Santo André (Paranapiacaba) → Cubatão → Santos**.
2. **Urban Micro-Scale Focus:** Detailed architectural, historical, environmental, and infrastructural mapping of the **Vila de Paranapiacaba** (Santo André, SP) at 1:1.000 scale.
3. **Multidisciplinary GIS Integration:** Merging physical-environmental data (watersheds, slope, Atlantic Forest succession, disaster risks), urban morphology (lots, CAD building footprints, conservation state), heritage conservation (IPHAN, CONDEPHAAT, COMDEPHAAPASA, UNESCO buffer zones), tourism (trails, Wikiloc GPS tracks, 331 natural points of interest), and socio-economic census data.
4. **Interactive Web Application:** A performant, responsive React + Leaflet WebGIS interface deployed automatically via GitHub Actions to GitHub Pages.

---

## 2. Technology Stack & Dependencies Overview

### Frontend Architecture (React Web Application)
* **Framework:** React 18 (`react` `^18.3.1`, `react-dom` `^18.3.1`)
* **Build Tool & Dev Server:** Vite 5 (`vite` `^5.3.1`, `@vitejs/plugin-react` `^4.3.1`)
* **Map Engine:** Leaflet 1.9 (`leaflet` `^1.9.4`, `react-leaflet` `^4.2.1`)
* **Marker Clustering:** `leaflet.markercluster` `^1.5.3`
* **Export Utilities:** `html-to-image` `^1.11.13` (canvas/DOM rasterization for A0 map prints)
* **Styling & CSS:** Tailwind CSS 3 (`tailwindcss` `^3.4.4`), PostCSS 8 (`postcss` `^8.4.38`), Autoprefixer (`autoprefixer` `^10.4.19`), Custom Vanilla CSS Design Tokens (`src/index.css`)
* **Testing Framework:** Vitest 2 (`vitest` `^2.1.9`)

### Spatial Data Processing Pipeline (Python 3 Environment)
* **Location:** `scripts/`
* **Key Packages:** `geopandas`, `shapely`, `pyogrio`, `requests`, `pillow`, `matplotlib`
* **Python Dependencies (`scripts/requirements.txt`):**
  ```text
  geopandas>=0.14.0
  shapely>=2.0.0
  pyogrio>=0.7.0
  requests>=2.31.0
  pillow>=10.0.0
  ```

### Deployment & Production Containerization
* **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml` and `ci.yml`)
* **Docker Container:** `Dockerfile` (Node 20 build stage -> Nginx Alpine production runtime)
* **Orchestration:** `docker-compose.yml` (Port 8080 mapping)
* **Web Server Config:** `nginx.conf` (Single-page app fallback routing + Gzip compression)

---

## 3. Directory Layout & Repository Anatomy

```
Paranapiacaba/
├── .claude/                               # Claude Code workspace metadata
├── .github/
│   └── workflows/
│       ├── ci.yml                         # PR validation (npm test + npm run build)
│       └── deploy.yml                     # Production GitHub Pages deployment workflow
├── .dockerignore                          # Docker build exclusion rules
├── .gitignore                             # Git ignore rules (node_modules, dist, heavy GIS)
├── Dockerfile                             # Multi-stage production container build definition
├── docker-compose.yml                     # Docker Compose file for local container execution
├── nginx.conf                             # Nginx configuration for production container
├── index.html                             # Web app HTML entrypoint (SEO & viewport metadata)
├── package.json                           # Node.js dependencies and script definitions
├── package-lock.json                      # Dependency lockfile
├── vite.config.js                         # Vite build configuration (base: '/Paranapiacaba/')
├── postcss.config.js                      # PostCSS plugins (TailwindCSS, Autoprefixer)
├── tailwind.config.js                     # Tailwind CSS theme & content path definitions
├── README.md                              # Main repository documentation & GIS workspace reference
├── external_files_details.md              # Detailed inventory of local raw GIS datasets
├── PROJECT_CONTEXT_HANDOFF.md             # [THIS FILE] Complete context & handoff specification
│
├── 08_DOCUMENTACAO/                       # Academic & Technical Documentation
│   └── 02_RELATORIOS/
│       └── pauta_reuniao_resolvida_20260619.md  # FAPESP GIS technical resolutions (19/06/2026)
│
├── public/                                # Public static web assets (served directly)
│   ├── favicon.svg                        # Application favicon
│   ├── acervo/                            # Image archive for historic photos & map gallery
│   └── data/                              # Canonical WebGIS GeoJSON layers & Rasters
│       ├── README.md                      # GeoJSON requirements & regeneration guidelines
│       ├── *.geojson                      # 62 optimized RFC 7946 GeoJSON layers (EPSG:4326)
│       └── rasters/                       # Georeferenced map overlays
│           ├── manifest.json              # Metadata catalog for raster layers
│           ├── mapbiomas_*.png            # Colorized MapBiomas land cover rasters (2008–2024)
│           └── declividade.png            # Slope raster (5 terrain classes)
│
├── scripts/                               # Data ETL & GIS Transformation Pipeline
│   ├── build_data.py                      # Main script converting Shapefiles -> optimized GeoJSONs
│   ├── build_rasters.py                   # Script generating MapBiomas & slope raster overlays
│   ├── config.py                          # Single Source of Truth mapping source shapes to jobs
│   ├── fetch_osm_railway.py               # Fetches OpenStreetMap railway tracks for corridor gap filling
│   ├── lib.py                             # Spatial processing library (reproject, nudge, dissolve)
│   ├── validate_data.py                   # GeoJSON integrity validator (WGS 84, bbox, features)
│   └── requirements.txt                   # Python ETL requirements
│
├── src/                                   # React Application Source Code
│   ├── main.jsx                           # React root mounting point
│   ├── App.jsx                            # Main application layout, state provider & tab navigation
│   ├── index.css                          # Design tokens, custom scrollbars, animations, Leaflet overrides
│   │
│   ├── components/                        # React UI & Map Components (21 files)
│   │   ├── AboutPanel.jsx                 # "Sobre o Projeto" modal (FAPESP/PUC/UNESCO info)
│   │   ├── BasemapSelector.jsx            # Basemap chooser (OSM, Satellite, Terrain, CartoDB Light)
│   │   ├── DataTablePanel.jsx             # Interactive attribute data table with search & CSV export
│   │   ├── FeatureDetailPanel.jsx         # Sidebar panel showing clicked feature properties & media
│   │   ├── FeaturePopup.jsx               # Quick Leaflet map popup on hover/click
│   │   ├── HeaderNav.jsx                  # Top navigation bar with tabs and preset shortcuts
│   │   ├── HomePage.jsx                   # Portal landing page with thematic cards & statistics
│   │   ├── LayerPanel.jsx                 # Collapsible layer catalog tree with search & opacity controls
│   │   ├── Legend.jsx                     # Dynamic map legend (IBGE color symbology, scale swatches)
│   │   ├── LegislacaoPanel.jsx            # Master plan, zoning laws, and heritage decree panel
│   │   ├── LevantamentoCampoPanel.jsx     # Field survey report & building conservation state panel
│   │   ├── MapGalleryPanel.jsx            # Modal showcase of 26 printable A0 thematic map boards
│   │   ├── MapToolbar.jsx                 # Floating map tools (zoom, enquadrar, export image, presets)
│   │   ├── MapView.jsx                    # Primary Leaflet map container & GeoJSON renderer
│   │   ├── MemoriaFerroviariaPanel.jsx    # Railway heritage module & historic photo archive viewer
│   │   ├── PhotoGalleryModal.jsx          # Fullscreen historic image lightbox modal
│   │   ├── RasterControl.jsx              # Timeline control slider for MapBiomas & slope rasters
│   │   ├── SistemaHidraulicoPanel.jsx     # Hydraulic heritage & spring protection analysis panel
│   │   ├── ThematicPresets.jsx            # Floating preset launcher bar (Pranchas, Sinteses, Escalas)
│   │   ├── TrailsPanel.jsx                # Hikers & eco-tourism trails directory with elevation profiles
│   │   └── moduleUi.jsx                   # Shared UI primitives (Card, Badge, Button, StatCard)
│   │
│   ├── config/                            # WebGIS Application Configurations
│   │   ├── layers.js                      # Layer catalog registry (62 layers, groups, metadata)
│   │   ├── presets.js                     # Thematic map presets (curated layer combinations)
│   │   └── styleGuide.js                  # IBGE official color palette & symbology helper functions
│   │
│   ├── data/                              # Static Indexes & Data Registers
│   │   ├── mapsIndex.js                   # Catalog of 26 printable A0 map boards (metadata & files)
│   │   └── photoArchiveIndex.js           # Catalog of historic railway & village photography archive
│   │
│   ├── hooks/                             # Custom React Hooks
│   │   ├── useGeoJSON.js                  # Async fetcher & client-side cache for GeoJSON files
│   │   ├── useIsMobile.js                 # Media query hook for responsive layout adjustments
│   │   └── useOnEscape.js                 # Keyboard listener hook for Escape key modal dismissal
│   │
│   └── utils/                             # Core Helper Utilities
│       ├── assetUrl.js                    # Prefix handler ensuring static asset path compatibility
│       ├── exportData.js                  # GeoJSON/CSV file exporter for layer attribute tables
│       ├── exportImage.js                 # Canvas snapshot generator for exporting map views
│       ├── mapBounds.js                   # Spatial bounding box computer & auto-fit zoom calculations
│       └── simplify.js                    # Client-side Ramer-Douglas-Peucker geometry simplifier
│
├── tests/                                 # Unit & Integration Test Suite (Vitest)
│   ├── acervo.test.js                     # Validates photo archive indexing & image file existence
│   ├── deploy.test.js                     # Validates deployment config, package.json & vite.config.js
│   ├── layers.test.js                     # Validates layer catalog integrity & GeoJSON file matching
│   ├── mapBounds.test.js                  # Tests bounding box computation & spatial math
│   ├── presets.test.js                    # Validates thematic preset layer references
│   └── utils.test.js                      # Tests utility functions (assetUrl, simplify, export CSV)
│
└── EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/ # Local Raw GIS Data Store (Not version controlled)
    ├── 00_DADOS_BRUTOS/                   # Raw shapefiles, KMLs, XLSX inventories, field photos
    ├── 01_CAMADAS_BASE/                   # Clean reprojected base layers (EPSG:4674 / 31983)
    └── OTHER_SHAPEFILES_SIGA_MAPA/        # Municipal GIS layers (Santo André SIGA dataset)
```

---

## 4. Data Processing Pipeline & Shape Transformation Architecture

All vector datasets displayed in the frontend reside in `public/data/*.geojson`. They are **automatically derived and compiled** using the Python data pipeline in `scripts/`.

### 4.1 Coordinate Reference System (CRS) & Standardization
* **Input Formats:** ESRI Shapefiles (`.shp`), File Geodatabases (`.gdb`), Google Earth (`.kml`/`.kmz`), AutoCAD (`.dwg`).
* **Source Projections:**
  * SIRGAS 2000 / UTM zone 23S (`EPSG:31983`) — common for municipal CAD/SIGA data.
  * SIRGAS 2000 Geographic (`EPSG:4674`) — common for IBGE/State datasets.
  * WGS 84 (`EPSG:4326`) — GPS tracks.
* **Target Standard:** WGS 84 (`EPSG:4326`), RFC 7946 GeoJSON format, coordinates rounded to **6 decimal places** (~0.1m precision).

### 4.2 Spatial Alignment & Micro-Nudge Parameters
Due to slight datum/survey offsets between historic CAD files (georeferenced AutoCAD map of the village) and modern satellite imagery (Esri/OSM), a spatial nudge is applied during processing to achieve sub-meter alignment:
```python
# Defined in scripts/config.py
NUDGE_VILA_DEG = (-0.0000316, -0.0000303)  # Shift CAD layers W/S by ~3.2m E / ~3.4m N
```
Affected CAD layers: `edificacoes_cad.geojson`, `edificacoes_vila.geojson`, `caminhos_vila.geojson`, `ferrovia_local.geojson`, `patrimonio_ferroviario.geojson`.

### 4.3 Bounding Box & Area of Interest (AOI) Filtering
To optimize web payload sizes, spatial datasets are clipped to relevant geographic extents:
* **Corridor Extent (`CORRIDOR_BBOX`):** `(-47.05, -24.10, -46.15, -23.05)` — Bounding box covering Jundiaí down to Santos.
* **Vila Buffer (`VILA_BUFFER_DEG`):** `0.006` (~650m buffer around Paranapiacaba village polygon).
* **Serra Buffer (`SERRA_BUFFER_DEG`):** `0.05` (~5.5km buffer around the escarpment for sub-basins and contour lines).

### 4.4 Topo-Geometry Simplification & Feature Dissolving
* High-density layers (e.g. contour lines `curvas_nivel`, detailed tracks `trilhas`, rivers `rios_sul`) undergo topology-preserving simplification (`Douglas-Peucker` / `Mapshaper`).
* **Geometry Dissolving:** Layers with thousands of fragmented line segments lacking distinct attributes are dissolved into single `MultiLineString` / `MultiPolygon` geometries. This drastically reduces GeoJSON overhead (e.g., `curvas_nivel.geojson` reduced from thousands of JSON objects to single dissolved features).

### 4.5 Python Pipeline Commands
To regenerate all vector and raster datasets:
```bash
cd scripts
pip install -r requirements.txt
python build_data.py         # Compiles raw shapes -> public/data/*.geojson
python validate_data.py      # Validates GeoJSON structure, CRS 4326, and bounding boxes
python build_rasters.py     # Generates MapBiomas (2008-2024) and slope PNG rasters
```

---

## 5. GeoJSON Layer Catalog & Data Shapes Schema

The catalog in `src/config/layers.js` defines **62 layers** organized across **11 thematic groups**.

### Summary of Layer Groups & Key Schemas

| Group | Layers Count | Key Examples | Primary Attributes | Target Scale / MinZoom |
| :--- | :---: | :--- | :--- | :--- |
| **Ferrovia SPR (Jundiaí–Santos)** | 5 | `ferrovia_corredor`, `estacoes`, `ferrovia_local`, `funicular`, `patrimonio_ferroviario` | `nome`, `situacao`, `bitola`, `trecho`, `condicao` | Zoom 8–14 (Territorial & Local) |
| **Mobilidade** | 3 | `ferrovia_rmsp`, `rodovias`, `ciclovias` | `nome`, `tipo`, `extensao` | Zoom 9–13 |
| **Território** | 4 | `limite_sitio`, `limite_vila`, `distritos`, `municipios_corredor` | `nome`, `area_ha`, `municipio` | Zoom 8–12 |
| **Patrimônio** | 4 | `patrimonio_tombados`, `areas_envoltorias`, `bens_estudo`, `abpf` | `nome`, `orgao`, `grau`, `esfera`, `decreto` | Zoom 12–14 |
| **Morfologia da Vila** | 5 | `edificacoes_vila`, `pac_lotes`, `edificacoes_cad`, `sistema_viario`, `caminhos_vila` | `CODIGO`, `USO`, `CONSERVAC`, `PAVIMENT`, `PAC_ID` | Zoom 15–17.5 (1:1.000 Detail) |
| **Meio Ambiente** | 10 | `ucs`, `pnm_nascentes`, `classif_vegetal`, `app_sul`, `app_buffers`, `regioes_hidrograficas`, `subbacias`, `hidrografia`, `rios_sul`, `nascentes` | `NM_UC`, `CLASSE`, `ESTAGIO`, `BACIA`, `NOME` | Zoom 10–14 |
| **Turismo e Trilhas** | 3 | `trilhas`, `atrativos`, `circuitos` | `nome`, `dificuldade`, `extensao_km`, `desnivel_m`, `tipo` | Zoom 12–15.5 |
| **Legislação e Planejamento** | 2 | `macrozonas`, `zoneamento_mzpa` | `nome`, `sigla`, `zoneamento`, `restricoes` | Zoom 12–14 |
| **Socioeconomia** | 4 | `censo_setores`, `densidade`, `densidade_2022`, `populacao_2022` | `CD_SETOR`, `POPULACAO`, `DENSIDADE_HAB_KM2` | Zoom 10–13 |
| **Equipamentos Urbanos** | 10 | `saude`, `educacao`, `esporte`, `assistencia_social`, `seguranca`, `defesa_civil`, `feiras_livres`, `cemiterio`, `parque_andreense`, `reservatorios` | `nome`, `tipo`, `endereco`, `categoria` | Zoom 12–15 |
| **Riscos (Defesa Civil)** | 3 | `susc_movmas`, `risco_movmas`, `risco_incendio` | `GRAU_RISCO`, `SUSCETIBILIDADE`, `DESCRICAO` | Zoom 13–15 |

---

## 6. Frontend Application Architecture & React State Flow

### 6.1 State Management (`App.jsx`)
The main state tree resides in `src/App.jsx` and flows down to UI panels and `MapView`:

```
                           App.jsx (Root State)
                                    │
    ┌───────────────────────────────┼───────────────────────────────┐
    │                               │                               │
activeTab (string)          activeLayers (Set)             selectedBasemap (string)
['home', 'map', 'trilhas']  ['ferrovia_corredor', ...]      ['osm', 'satellite', ...]
    │                               │                               │
    ▼                               ▼                               ▼
HeaderNav.jsx                 LayerPanel.jsx                 BasemapSelector.jsx
                                    │
                                    ▼
                              MapView.jsx
                                    │
                   ┌────────────────┴────────────────┐
                   ▼                                 ▼
         GeoJSONLayerWrapper              RasterControl.jsx
         (useGeoJSON Hook)             (MapBiomas / Declividade)
```

### 6.2 Primary UI Components & Responsibilities

1. **`App.jsx`**: Manages tab state, layer visibility Sets, basemap selection, group opacities, active features for sidebar inspection, and preset enquadramento triggers.
2. **`HeaderNav.jsx`**: Main navigation header bar with brand title, tab switcher (`Início`, `Mapa WebGIS`, `Memória Ferroviária`, `Trilhas`, `Levantamentos`), and quick action buttons.
3. **`HomePage.jsx`**: Rich landing page highlighting project stats (139 km railway, 62 layers, 331 attractions, 26 A0 boards), thematic exploration cards, and immediate preset launchers.
4. **`MapView.jsx`**: The core Leaflet map container:
   * Handles Leaflet map instance, tile basemaps (`TileLayer`), and URL hash synchronization (`#zoom/lat/lng`).
   * Renders active vector layers using `GeoJSONLayerWrapper` with dynamic styling from `styleGuide.js`.
   * Integrates point marker clustering (`leaflet.markercluster`) for attractions (`atrativos.geojson`) and stations (`estacoes.geojson`).
   * Executes map bounds fitting (`fitBounds`) when presets or features are clicked.
5. **`LayerPanel.jsx`**: Left sidebar catalog containing:
   * Grouped layer hierarchy tree with search filter.
   * Toggle switches for individual layers and entire group enable/disable.
   * Group opacity sliders (0–100%).
   * Direct links to zoom to layer bounds or open attribute data tables.
6. **`FeatureDetailPanel.jsx`**: Right sidebar panel displayed when a map feature is clicked:
   * Shows formatted key-value attribute table.
   * Formats specialized fields (e.g. conservation status badges, trail elevation gain, zone rules).
   * Displays attached images if feature references media.
7. **`Legend.jsx`**: Floating legend panel dynamically reflecting visible map layers with IBGE-compliant symbology swatches and building state semaphores (Conservado, Mau Estado, Descaracterizado, Ruínas).
8. **`ThematicPresets.jsx`**: Floating bottom bar with 1-click curated thematic compositions (e.g. *Prancha 1 Conservação*, *Prancha 3 Tombamentos & UNESCO*, *Escala 1:1.000*, *Síntese UNESCO*).
9. **`DataTablePanel.jsx`**: Full-width bottom drawer containing an interactive tabular view of the selected GeoJSON layer with live search, column sorting, and CSV / GeoJSON export options.
10. **`TrailsPanel.jsx`**: Dedicated module showcasing Paranapiacaba's trekking network with difficulty ratings, distance, vertical elevation profiles, and GPX/KML metadata.
11. **`MemoriaFerroviariaPanel.jsx`**: Dedicated module for railway memory, historic maps, and interactive photo gallery lightbox (`PhotoGalleryModal.jsx`).

---

## 7. Quality Assurance, Test Suite & CI/CD Pipeline

### 7.1 Vitest Suite (`tests/`)
The repository includes **6 test modules with 67 tests**:

```bash
# Executing test suite
npm test                 # Single test run (Vitest)
npm run test:watch       # Interactive watch mode
```

#### Test Files Breakdown:
* **`tests/deploy.test.js`**: Validates deployment config:
  * Ensures `package.json` `homepage` matches `vite.config.js` `base`.
  * Verifies relative paths in `index.html`.
  * Confirms CI workflow executes `npm test` prior to build.
* **`tests/layers.test.js`**: Catalog integrity suite:
  * Checks that every layer in `src/config/layers.js` points to an existing `.geojson` file in `public/data/`.
  * Validates that all GeoJSON files are valid JSON and feature valid `FeatureCollection` structures.
* **`tests/presets.test.js`**: Validates that all thematic presets in `src/config/presets.js` reference valid layer IDs.
* **`tests/mapBounds.test.js`**: Tests spatial bounding box computations, union calculations, and map zoom level calculations.
* **`tests/acervo.test.js`**: Checks that all images referenced in `src/data/photoArchiveIndex.js` and `src/data/mapsIndex.js` exist on disk in `public/acervo/`.
* **`tests/utils.test.js`**: Unit tests for utilities (`simplify.js`, `exportData.js`, `assetUrl.js`).

### 7.2 GitHub Actions Workflows
1. **`.github/workflows/ci.yml`**: Runs on pull requests to `main`. Installs dependencies, runs Vitest tests, and executes `npm run build`.
2. **`.github/workflows/deploy.yml`**: Runs on push to `main`. Executes quality checks (`npm test`), builds production bundle (`dist/`), and deploys directly to GitHub Pages using official GitHub Actions (`actions/upload-pages-artifact` & `actions/deploy-pages`).

---

## 8. Critical Review Notes & Action Items for Claude Code Handoff

When reviewing, refining, or adjusting this project, pay special attention to the following points:

### 1. Vitest Test Environment Note (`tests/utils.test.js`)
* **Context:** In `tests/utils.test.js`, the test expects `import.meta.env.BASE_URL` to equal `'/Paranapiacaba/'`.
* **Behavior:** When running `npx vitest run` directly without explicit inline Vite environment configuration, Vitest's default fallback for `BASE_URL` is `'/'`, which causes `assetUrl` unit tests for base path prefixing to check against `'/'` vs `'/Paranapiacaba/'`.
* **Recommendation:** Ensure Vitest configuration in `vite.config.js` explicitly defines `test: { environment: 'jsdom' }` or provides `define: { 'import.meta.env.BASE_URL': JSON.stringify('/Paranapiacaba/') }` so test environments stay 100% aligned with the production build base.

### 2. PowerShell Script Execution Policy on Windows
* **Context:** Running `npm test` directly from Windows PowerShell might raise a execution policy restriction (`PSSecurityException`).
* **Fix/Workaround:** Execute via `cmd.exe /c npm test` or `npx vitest run`.

### 3. Raw Data Exclusion & Git Tracking
* **Rule:** Never commit raw `.shp`, `.gdb`, or `.zip` files from `EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/` or `OTHER_SHAPEFILES_SIGA_MAPA/` to Git. Only the processed, lightweight GeoJSON outputs in `public/data/` should be tracked.

### 4. Performance & Memory Optimization Targets
* **High-Density Vector Layers:** Layers like `curvas_nivel.geojson` (~911 KB) and `trilhas.geojson` (~620 KB) render thousands of vertices. Client-side simplification (`src/utils/simplify.js`) is used when zoomed out. Further spatial indexing or vector tiling could be explored if mobile performance needs enhancement.
* **Canvas Rendering:** `MapView.jsx` uses standard Leaflet SVG renderer. For ultra-high feature counts, Leaflet's `preferCanvas: true` setting in `MapContainer` can be evaluated.

### 5. Architectural & Feature Refinement Opportunities
* **Layer Grouping & UI:** Modernize `LayerPanel.jsx` with collapsible accordions, quick-filter badges by scale, and layer search highlights.
* **Mobile Responsiveness:** Ensure modal panels (`DataTablePanel.jsx`, `FeatureDetailPanel.jsx`) adapt smoothly on screens < 640px wide.
* **Accessibility (a11y):** Verify ARIA roles, keyboard navigation (Escape key modal closing is handled via `useOnEscape.js`), and contrast ratios for text overlays on map layers.

---

### Summary Checklist for Handoff

- [x] Full directory tree and file hierarchy mapped.
- [x] All 62 GeoJSON datasets and 11 layer groups cataloged with schemas and sources.
- [x] Python data transformation pipeline (`scripts/`) fully documented (CRS 4326, micro-nudges, bounding boxes, mapshaper simplify).
- [x] React state management (`App.jsx`), 21 components, hooks, and utilities detailed.
- [x] Quality assurance test suite, CI/CD GitHub Actions, and Docker environment outlined.
- [x] Test environment caveats and optimization targets highlighted for immediate refinement.
