import React, { useState } from 'react';
import { LAYERS } from './config/layers';
import { LayerPanel } from './components/LayerPanel';
import { MapView } from './components/MapView';
import { BasemapSelector } from './components/BasemapSelector';
import { Legend } from './components/Legend';

export default function App() {
  // Estado das camadas ativas, inicializado com as que têm visible: true
  const [activeLayers, setActiveLayers] = useState(() => {
    return new Set(LAYERS.filter((layer) => layer.visible).map((layer) => layer.id));
  });

  // Estado do basemap selecionado (default 'osm')
  const [selectedBasemap, setSelectedBasemap] = useState('osm');

  // Estado do nível de zoom atual (inicializado próximo ao zoom de centro 13)
  const [currentZoom, setCurrentZoom] = useState(13);

  // Manipulador para alternar a visibilidade de uma camada
  const handleToggleLayer = (layerId) => {
    setActiveLayers((prevActive) => {
      const nextActive = new Set(prevActive);
      if (nextActive.has(layerId)) {
        nextActive.delete(layerId);
      } else {
        nextActive.add(layerId);
      }
      return nextActive;
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      {/* Painel Lateral Esquerdo */}
      <LayerPanel
        activeLayers={activeLayers}
        onToggle={handleToggleLayer}
        currentZoom={currentZoom}
      />

      {/* Área do Mapa (ocupa todo o restante) */}
      <MapView
        activeLayers={activeLayers}
        selectedBasemap={selectedBasemap}
        currentZoom={currentZoom}
        onZoomChange={setCurrentZoom}
      >
        {/* Controles de Basemap (canto inferior direito) */}
        <BasemapSelector
          selectedBasemap={selectedBasemap}
          onChange={setSelectedBasemap}
        />

        {/* Legenda Dinâmica (canto inferior esquerdo) */}
        <Legend activeLayers={activeLayers} />
      </MapView>
    </div>
  );
}
