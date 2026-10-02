import React, { useState } from 'react';
import { LAYERS, GROUPS } from './config/layers';
import { PRESETS } from './config/presets';
import { useIsMobile } from './hooks/useIsMobile';
import { HeaderNav } from './components/HeaderNav';
import { MapSidebar } from './components/LayerPanel';
import { MapView } from './components/MapView';
import { BasemapSelector } from './components/BasemapSelector';
import { Legend } from './components/Legend';
import { MapScaleControl } from './components/MapScaleControl';
import { FeatureDetailPanel } from './components/FeatureDetailPanel';
import { AboutPanel } from './components/AboutPanel';
import { DataTablePanel } from './components/DataTablePanel';
import { MemoriaFerroviariaPanel } from './components/MemoriaFerroviariaPanel';
import { MapGalleryPanel } from './components/MapGalleryPanel';
import { PhotoGalleryModal } from './components/PhotoGalleryModal';
import { LevantamentoCampoPanel } from './components/LevantamentoCampoPanel';
import { SistemaHidraulicoPanel } from './components/SistemaHidraulicoPanel';
import { LegislacaoPanel } from './components/LegislacaoPanel';
import { HomePage } from './components/HomePage';
import { TrailsPanel } from './components/TrailsPanel';
import { BASEMAPS } from './components/BasemapSelector';
import { parseShareHash } from './utils/shareState';
import { useRasterManifests } from './hooks/useRasterManifests';

// Estado vindo de um link compartilhado (#zoom/lat/lng?camadas=…&base=…), lido
// uma vez na carga: um link de mapa abre direto na aba do mapa.
const SHARED = parseShareHash(window.location.hash, {
  layerIds: LAYERS.map((layer) => layer.id),
  basemapIds: BASEMAPS.map((basemap) => basemap.id),
});

// Título do que está no mapa (mapa pronto e/ou carta sobreposta), à maneira
// do cartucho de uma prancha. Só informativo: não é mais um botão.
function MapTitle({ preset, reference }) {
  if (!preset && !reference) return null;
  return (
    <div className="export-hide hidden md:block absolute top-4 left-1/2 -translate-x-1/2 z-[999] pointer-events-none max-w-[calc(100%-9rem)]">
      <div className="bg-paper/95 backdrop-blur-md border border-paper-line rounded-lg shadow-md px-3 py-1.5 text-center">
        {preset && (
          <div className="text-xs font-bold text-stone-900 font-serif truncate">
            {preset.icon} {preset.label}
          </div>
        )}
        {reference && (
          <div className="text-[10px] font-semibold text-rust-700 truncate">📜 {reference.label}</div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const isMobile = useIsMobile();

  // Aba ativa do portal: 'home', 'map', 'ferrovia', 'trilhas', 'campo', 'hidraulica', 'legislacao'
  const [activeTab, setActiveTab] = useState(SHARED.view ? 'map' : 'home');

  // Estado das camadas ativas
  const [activeLayers, setActiveLayers] = useState(() => {
    if (SHARED.layers) return new Set(SHARED.layers);
    return new Set(LAYERS.filter((layer) => layer.visible).map((layer) => layer.id));
  });

  // Modo de simbologia das edificações da Vila: 'conservacao' ou 'uso'
  const [buildingSymbologyMode, setBuildingSymbologyMode] = useState('conservacao');

  // Estado do basemap selecionado (default 'osm')
  const [selectedBasemap, setSelectedBasemap] = useState(SHARED.basemap || 'osm');

  // Estado do nível de zoom atual
  const [currentZoom, setCurrentZoom] = useState(13);

  // Estado das opacidades por grupo de camadas
  const [groupOpacities, setGroupOpacities] = useState(() => {
    return GROUPS.reduce((acc, group) => ({ ...acc, [group]: 100 }), {});
  });

  // Estado da feição atualmente selecionada
  const [activeFeature, setActiveFeature] = useState(null);

  // Estado de controle dos painéis modais: Sobre, Galeria A0 e Acervo Fotográfico
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);

  // Tabela de atributos e foco
  const [tableLayerId, setTableLayerId] = useState(null);
  const [focusFeature, setFocusFeature] = useState(null);
  const [focusLayer, setFocusLayer] = useState(null);

  // Predefinição temática aplicada no momento, e o pedido de enquadramento
  // correspondente consumido pelo MapView.
  const [activePresetId, setActivePresetId] = useState(null);
  const [focusPreset, setFocusPreset] = useState(null);

  // Sobreposições da aba "Históricos": um mapa de referência por vez e a série
  // MapBiomas; e pedidos de enquadramento vindos do painel.
  const manifests = useRasterManifests();
  const [overlays, setOverlays] = useState({
    referenceId: '',
    referenceOpacity: 0.72,
    coverageOn: false,
    coverageYear: null,
    coverageOpacity: 0.75,
  });
  const [focusBounds, setFocusBounds] = useState(null);
  const handleOverlaysChange = (patch) => setOverlays((prev) => ({ ...prev, ...patch }));
  const handleFitBounds = (bounds) => setFocusBounds({ bounds, ts: Date.now() });

  const handleOpenTable = (layerId) => {
    setTableLayerId(layerId);
    setActiveLayers((prev) => new Set(prev).add(layerId));
  };

  const handleSelectFromTable = (feature) => {
    setActiveFeature({ feature, layerId: tableLayerId });
    setFocusFeature({ feature, ts: Date.now() });
    if (isMobile) setTableLayerId(null);
  };

  const handleToggleLayer = (layerId) => {
    // Mexer numa camada à mão desfaz a composição: o mapa deixa de ser a
    // predefinição anunciada no botão flutuante.
    setActivePresetId(null);
    setActiveLayers((prevActive) => {
      const nextActive = new Set(prevActive);
      if (nextActive.has(layerId)) {
        nextActive.delete(layerId);
        if (activeFeature && activeFeature.layerId === layerId) {
          setActiveFeature(null);
        }
      } else {
        nextActive.add(layerId);
      }
      return nextActive;
    });
  };

  const handleGroupOpacityChange = (group, opacity) => {
    setGroupOpacities(prev => ({
      ...prev,
      [group]: opacity
    }));
  };

  const handleZoomToLayer = (layerId) => {
    setActiveLayers((prev) => new Set(prev).add(layerId));
    setFocusLayer({ layerId, ts: Date.now() });
  };

  const handleApplyPreset = (preset) => {
    if (!preset) return;
    setActiveLayers(new Set(preset.layers));
    if (preset.basemap) setSelectedBasemap(preset.basemap);
    if (preset.buildingMode) setBuildingSymbologyMode(preset.buildingMode);
    setActiveFeature(null);
    setActivePresetId(preset.id);
    // O `ts` faz cada clique valer como um novo pedido de enquadramento,
    // inclusive ao reaplicar a mesma predefinição depois de navegar o mapa.
    setFocusPreset({ preset, ts: Date.now() });
  };

  const handleNavigateToMapWithPreset = (presetId) => {
    const preset = PRESETS.find(p => p.id === presetId);
    if (preset) handleApplyPreset(preset);
    setActiveTab('map');
  };

  const handleNavigate = (page) => {
    if (page === 'gallery') {
      setIsGalleryOpen(true);
    } else if (page === 'photo_gallery') {
      setIsPhotoGalleryOpen(true);
    } else {
      setActiveTab(page);
    }
  };

  const handleToggleAllInGroup = (group, enable) => {
    setActivePresetId(null);
    setActiveLayers(prevActive => {
      const nextActive = new Set(prevActive);
      const groupLayers = LAYERS.filter(layer => layer.group === group);
      
      groupLayers.forEach(layer => {
        if (enable) {
          nextActive.add(layer.id);
        } else {
          nextActive.delete(layer.id);
          if (activeFeature && activeFeature.layerId === layer.id) {
            setActiveFeature(null);
          }
        }
      });
      return nextActive;
    });
  };

  const handleClearAllLayers = () => {
    setActivePresetId(null);
    setActiveLayers(new Set());
    setActiveFeature(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-paper relative select-none">
      
      {/* Barra de Navegação Superior do Portal */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={handleNavigate}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
      />

      {/* Conteúdo do Módulo Selecionado */}
      <div className="flex-1 flex overflow-hidden relative min-w-0">
        {activeTab === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {activeTab === 'trilhas' && (
          <TrailsPanel onNavigateToMapWithPreset={handleNavigateToMapWithPreset} />
        )}

        {activeTab === 'map' && (
          <>
            {/* Painel Lateral Esquerdo (Camadas e Filtros) */}
            <MapSidebar
              initialTab={SHARED.layers ? 'camadas' : 'prontos'}
              activeLayers={activeLayers}
              onToggle={handleToggleLayer}
              currentZoom={currentZoom}
              groupOpacities={groupOpacities}
              onGroupOpacityChange={handleGroupOpacityChange}
              onToggleAllInGroup={handleToggleAllInGroup}
              onClearAll={handleClearAllLayers}
              onOpenTable={handleOpenTable}
              onZoomToLayer={handleZoomToLayer}
              activePresetId={activePresetId}
              onApplyPreset={handleApplyPreset}
              manifests={manifests}
              overlays={overlays}
              onOverlaysChange={handleOverlaysChange}
              onFitBounds={handleFitBounds}
            />

            {/* Área Principal (Mapa) */}
            <div className="relative flex-1 h-full min-w-0">
              <MapView
                activeLayers={activeLayers}
                selectedBasemap={selectedBasemap}
                currentZoom={currentZoom}
                onZoomChange={setCurrentZoom}
                groupOpacities={groupOpacities}
                onFeatureClick={setActiveFeature}
                onMapClick={() => setActiveFeature(null)}
                focusFeature={focusFeature}
                focusLayer={focusLayer}
                focusPreset={focusPreset}
                focusBounds={focusBounds}
                manifests={manifests}
                overlays={overlays}
                buildingSymbologyMode={buildingSymbologyMode}
              >
                <BasemapSelector
                  selectedBasemap={selectedBasemap}
                  onChange={setSelectedBasemap}
                />

                <div
                  className="absolute bottom-9 left-4 z-[1001] pointer-events-none"
                  data-testid="map-legend-control"
                >
                  <Legend activeLayers={activeLayers} buildingSymbologyMode={buildingSymbologyMode} />
                </div>

                <div
                  className="absolute bottom-[5.25rem] right-4 z-[1001] pointer-events-none"
                  data-testid="cartographic-scale-control"
                >
                  <MapScaleControl />
                </div>

                <MapTitle
                  preset={PRESETS.find((preset) => preset.id === activePresetId)}
                  reference={manifests.references?.maps?.find((item) => item.id === overlays.referenceId)}
                />
              </MapView>

              {activeFeature && (
                <FeatureDetailPanel
                  activeFeature={activeFeature}
                  onClose={() => setActiveFeature(null)}
                />
              )}
            </div>
          </>
        )}

        {/* Módulo: Memória Ferroviária */}
        {activeTab === 'ferrovia' && (
          <MemoriaFerroviariaPanel
            onNavigateToMapWithPreset={handleNavigateToMapWithPreset}
          />
        )}

        {/* Módulo: Levantamento de Campo */}
        {activeTab === 'campo' && (
          <LevantamentoCampoPanel onNavigateToMapWithPreset={handleNavigateToMapWithPreset} />
        )}

        {/* Módulo: Sistema Hidráulico */}
        {activeTab === 'hidraulica' && (
          <SistemaHidraulicoPanel onNavigateToMapWithPreset={handleNavigateToMapWithPreset} />
        )}

        {/* Módulo: Legislação & Planos */}
        {activeTab === 'legislacao' && (
          <LegislacaoPanel onNavigateToMapWithPreset={handleNavigateToMapWithPreset} />
        )}
      </div>

      {/* Tabela de Atributos */}
      {tableLayerId && activeTab === 'map' && (
        <DataTablePanel
          layerId={tableLayerId}
          onClose={() => setTableLayerId(null)}
          onSelectFeature={handleSelectFromTable}
        />
      )}

      {/* Modal Sobre o Projeto */}
      <AboutPanel
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Modal Acervo de Pranchas Cartográficas A0 */}
      <MapGalleryPanel
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Modal Acervo Fotográfico de Campo & Iconografia */}
      <PhotoGalleryModal
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
      />
    </div>
  );
}


