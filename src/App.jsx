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

export default function App() {
  const isMobile = useIsMobile();

  // Aba ativa do portal: 'map', 'ferrovia', 'campo', 'hidraulica', 'legislacao'
  const [activeTab, setActiveTab] = useState('map');

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

  // Estado de controle do painel "Sobre"
  const [isAboutOpen, setIsAboutOpen] = useState(false);

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
        onTabChange={setActiveTab}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      {/* Conteúdo do Módulo Selecionado */}
      <div className="flex-1 flex overflow-hidden relative">
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

        {/* Módulos de Projeto (Estrutura Preparada) */}
        {activeTab === 'campo' && (
          <div className="flex-1 p-6 bg-slate-100 overflow-y-auto flex flex-col justify-center items-center text-center space-y-3">
            <span className="text-4xl">📋</span>
            <h2 className="text-lg font-bold text-slate-800">Módulo: Levantamento de Campo (Parte Alta & Rabique)</h2>
            <p className="text-xs text-slate-500 max-w-md">
              Fichas fotográficas de conservação das edificações, mapeamento de vielas sanitárias e sarjetas históricas da Vila.
            </p>
            <button
              onClick={() => handleNavigateToMapWithPreset('prancha_conservacao')}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded shadow transition-colors"
            >
              Exibir Prancha de Conservação no Mapa SIG
            </button>
          </div>
        )}

        {activeTab === 'hidraulica' && (
          <div className="flex-1 p-6 bg-slate-100 overflow-y-auto flex flex-col justify-center items-center text-center space-y-3">
            <span className="text-4xl">🌊</span>
            <h2 className="text-lg font-bold text-slate-800">Módulo: Sistema Hidráulico dos Ingleses & Bacias</h2>
            <p className="text-xs text-slate-500 max-w-md">
              Engenharia hídrica britânica (captão de nascentes, caixas d'água históricas, aquedutos) e cruzamento com as bacias hidrográficas UGRHI 6 e 7.
            </p>
            <button
              onClick={() => handleNavigateToMapWithPreset('prancha_hidrica_redes')}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded shadow transition-colors"
            >
              Exibir Rede Hídrica no Mapa SIG
            </button>
          </div>
        )}

        {activeTab === 'legislacao' && (
          <div className="flex-1 p-6 bg-slate-100 overflow-y-auto flex flex-col justify-center items-center text-center space-y-3">
            <span className="text-4xl">📐</span>
            <h2 className="text-lg font-bold text-slate-800">Módulo: Legislação & Planos Diretores</h2>
            <p className="text-xs text-slate-500 max-w-md">
              Repositório de legislação municipal e decretos patrimoniais (Santo André LC 1.181/2022, Rio Grande da Serra e Ribeirão Pires).
            </p>
            <button
              onClick={() => handleNavigateToMapWithPreset('prancha_tombamentos')}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded shadow transition-colors"
            >
              Exibir Tombamentos IPHAN/UNESCO no Mapa SIG
            </button>
          </div>
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
    </div>
  );
}


