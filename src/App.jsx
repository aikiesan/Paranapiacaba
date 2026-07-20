import React, { useState } from 'react';
import { LAYERS, GROUPS } from './config/layers';
import { useIsMobile } from './hooks/useIsMobile';
import { LayerPanel } from './components/LayerPanel';
import { MapView } from './components/MapView';
import { BasemapSelector } from './components/BasemapSelector';
import { Legend } from './components/Legend';
import { FeatureDetailPanel } from './components/FeatureDetailPanel';
import { AboutPanel } from './components/AboutPanel';
import { DataTablePanel } from './components/DataTablePanel';

export default function App() {
  const isMobile = useIsMobile();

  // Estado das camadas ativas, inicializado com as que têm visible: true
  const [activeLayers, setActiveLayers] = useState(() => {
    return new Set(LAYERS.filter((layer) => layer.visible).map((layer) => layer.id));
  });

  // Modo de simbologia das edificações da Vila: 'conservacao' (Semáforo) ou 'uso' (Uso do Solo IBGE)
  const [buildingSymbologyMode, setBuildingSymbologyMode] = useState('conservacao');

  // Estado do basemap selecionado (default 'osm')
  const [selectedBasemap, setSelectedBasemap] = useState('osm');

  // Estado do nível de zoom atual (inicializado no zoom padrão 13)
  const [currentZoom, setCurrentZoom] = useState(13);

  // Estado das opacidades por grupo de camadas (0 a 100)
  const [groupOpacities, setGroupOpacities] = useState(() => {
    return GROUPS.reduce((acc, group) => ({ ...acc, [group]: 100 }), {});
  });

  // Estado da feição atualmente selecionada para exibição no painel lateral direito
  const [activeFeature, setActiveFeature] = useState(null);

  // Estado de controle de exibição do painel "Sobre"
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Camada com a tabela de atributos aberta (gaveta inferior) e feição a focar no mapa
  const [tableLayerId, setTableLayerId] = useState(null);
  const [focusFeature, setFocusFeature] = useState(null);

  // Camada a enquadrar no mapa (botão "zoom para a camada" do painel)
  const [focusLayer, setFocusLayer] = useState(null);

  // Abre a tabela de uma camada e garante que ela esteja ativa no mapa
  const handleOpenTable = (layerId) => {
    setTableLayerId(layerId);
    setActiveLayers((prev) => new Set(prev).add(layerId));
  };

  // Clique numa linha da tabela: abre detalhes e centraliza a feição
  const handleSelectFromTable = (feature) => {
    setActiveFeature({ feature, layerId: tableLayerId });
    setFocusFeature({ feature, ts: Date.now() });
    if (isMobile) setTableLayerId(null);
  };

  // Manipulador para alternar a visibilidade de uma camada
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

  // Manipulador para alterar opacidade de um grupo inteiro
  const handleGroupOpacityChange = (group, opacity) => {
    setGroupOpacities(prev => ({
      ...prev,
      [group]: opacity
    }));
  };

  // Enquadra o mapa na extensão de uma camada
  const handleZoomToLayer = (layerId) => {
    setActiveLayers((prev) => new Set(prev).add(layerId));
    setFocusLayer({ layerId, ts: Date.now() });
  };

  // Aplica uma predefinição temática: troca o conjunto de camadas e o basemap
  const handleApplyPreset = (preset) => {
    if (!preset) return;
    setActiveLayers(new Set(preset.layers));
    if (preset.basemap) setSelectedBasemap(preset.basemap);
    setActiveFeature(null);
  };

  // Ativar ou desativar todas as camadas de um grupo específico
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 relative select-none">
      
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
          {/* Pills de seleção do basemap */}
          <BasemapSelector
            selectedBasemap={selectedBasemap}
            onChange={setSelectedBasemap}
          />

          {/* Legenda Dinâmica baseada em camadas ativas */}
          <Legend activeLayers={activeLayers} buildingSymbologyMode={buildingSymbologyMode} />
        </MapView>

        {/* Painel Lateral Direito (Detalhes da Feição Selecionada) */}
        {activeFeature && (
          <FeatureDetailPanel
            activeFeature={activeFeature}
            onClose={() => setActiveFeature(null)}
          />
        )}
      </div>

      {/* Tabela de Atributos */}
      {tableLayerId && (
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

