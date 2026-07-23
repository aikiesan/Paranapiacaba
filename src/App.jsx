import React, { useState } from 'react';
import { LAYERS, GROUPS } from './config/layers';
import { PRESETS } from './config/presets';
import { useIsMobile } from './hooks/useIsMobile';
import { HeaderNav } from './components/HeaderNav';
import { LayerPanel } from './components/LayerPanel';
import { MapView } from './components/MapView';
import { BasemapSelector } from './components/BasemapSelector';
import { Legend } from './components/Legend';
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

export default function App() {
  const isMobile = useIsMobile();

  // Aba ativa do portal: 'home', 'map', 'ferrovia', 'trilhas', 'campo', 'hidraulica', 'legislacao'
  const [activeTab, setActiveTab] = useState('home');

  // Estado das camadas ativas
  const [activeLayers, setActiveLayers] = useState(() => {
    return new Set(LAYERS.filter((layer) => layer.visible).map((layer) => layer.id));
  });

  // Modo de simbologia das edificações da Vila: 'conservacao' ou 'uso'
  const [buildingSymbologyMode, setBuildingSymbologyMode] = useState('conservacao');

  // Estado do basemap selecionado (default 'osm')
  const [selectedBasemap, setSelectedBasemap] = useState('osm');

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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 relative select-none">
      
      {/* Barra de Navegação Superior do Portal */}
      <HeaderNav
        activeTab={activeTab}
        onTabChange={handleNavigate}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
      />

      {/* Conteúdo do Módulo Selecionado */}
      <div className="flex-1 flex overflow-hidden relative">
        {activeTab === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}

        {activeTab === 'trilhas' && (
          <TrailsPanel onNavigateToMapWithPreset={handleNavigateToMapWithPreset} />
        )}

        {activeTab === 'map' && (
          <>
            {/* Painel Lateral Esquerdo (Camadas e Filtros) */}
            <LayerPanel
              activeLayers={activeLayers}
              onToggle={handleToggleLayer}
              currentZoom={currentZoom}
              groupOpacities={groupOpacities}
              onGroupOpacityChange={handleGroupOpacityChange}
              onToggleAllInGroup={handleToggleAllInGroup}
              onOpenAbout={() => setIsAboutOpen(true)}
              onOpenTable={handleOpenTable}
              onZoomToLayer={handleZoomToLayer}
              onApplyPreset={handleApplyPreset}
              buildingSymbologyMode={buildingSymbologyMode}
              onBuildingSymbologyChange={setBuildingSymbologyMode}
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
                buildingSymbologyMode={buildingSymbologyMode}
              >
                <BasemapSelector
                  selectedBasemap={selectedBasemap}
                  onChange={setSelectedBasemap}
                />

                <Legend activeLayers={activeLayers} buildingSymbologyMode={buildingSymbologyMode} />
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


