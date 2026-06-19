import React from 'react';
import { MapContainer, TileLayer, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import { LAYERS } from '../config/layers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { FeaturePopup } from './FeaturePopup';
import { BASEMAPS } from './BasemapSelector';

// Componente auxiliar para capturar eventos do mapa (zoom)
function MapEventsHandler({ onZoomChange }) {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
    // Atualiza o zoom inicial
    load: () => {
      onZoomChange(map.getZoom());
    }
  });
  return null;
}

// Componente para carregar e renderizar cada camada GeoJSON individualmente
// Isso permite respeitar as regras do React Hook ao chamar o useGeoJSON para cada camada
function GeoJSONLayerWrapper({ layer, isVisible }) {
  const { data, loading, error } = useGeoJSON(layer.file, isVisible);

  if (!isVisible || !data) return null;

  // Estilo específico dependendo do tipo da geometria
  const getStyle = () => {
    if (layer.type === 'polygon') {
      return {
        color: layer.color,
        weight: layer.weight,
        fillColor: layer.color,
        fillOpacity: layer.fillOpacity,
      };
    } else if (layer.type === 'line') {
      return {
        color: layer.color,
        weight: layer.weight,
        fillColor: 'transparent',
      };
    }
    return {};
  };

  // Tratamento especial para pontos -> renderizar como CircleMarker
  const pointToLayer = (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 6,
      fillColor: layer.color,
      color: '#1e293b', // Borda escura suave
      weight: 1,
      opacity: 0.9,
      fillOpacity: 0.85
    });
  };

  // Associa o popup formatado a cada feição
  const onEachFeature = (feature, leafletLayer) => {
    const popupHtml = ReactDOMServer.renderToString(<FeaturePopup feature={feature} />);
    
    // Configura o popup do Leaflet com estilos apropriados
    leafletLayer.bindPopup(popupHtml, {
      className: 'custom-leaflet-popup',
      maxWidth: 300,
    });

    // Efeito visual ao passar o mouse por cima
    leafletLayer.on({
      mouseover: (e) => {
        const target = e.target;
        if (layer.type === 'polygon') {
          target.setStyle({ fillOpacity: Math.min(layer.fillOpacity + 0.2, 0.9) });
        } else if (layer.type === 'line') {
          target.setStyle({ weight: layer.weight + 1.5 });
        }
      },
      mouseout: (e) => {
        const target = e.target;
        if (layer.type === 'polygon') {
          target.setStyle({ fillOpacity: layer.fillOpacity });
        } else if (layer.type === 'line') {
          target.setStyle({ weight: layer.weight });
        }
      }
    });
  };

  return (
    <GeoJSON
      key={`${layer.id}-${data.features?.length || 0}`}
      data={data}
      style={getStyle}
      pointToLayer={layer.type === 'point' ? pointToLayer : undefined}
      onEachFeature={onEachFeature}
    />
  );
}

export function MapView({ activeLayers, selectedBasemap, currentZoom, onZoomChange, children }) {
  // Encontra as configurações do basemap selecionado
  const basemapConfig = BASEMAPS.find(b => b.id === selectedBasemap) || BASEMAPS[0];

  return (
    <div className="relative w-full h-full flex-1">
      <MapContainer
        center={[-23.773, -46.312]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false} // Desabilita o controle de zoom padrão para podermos customizar/reordenar se necessário
      >
        {/* Adiciona o controle de zoom personalizado no canto superior direito para liberar espaço */}
        <TileLayer
          url={basemapConfig.url}
          attribution={basemapConfig.attribution}
        />

        {/* Captura mudanças no nível de zoom e repassa para o pai (App) */}
        <MapEventsHandler onZoomChange={onZoomChange} />

        {/* Renderiza as camadas ativas que satisfazem a restrição de zoom mínimo */}
        {LAYERS.map((layer) => {
          const isVisible = activeLayers.has(layer.id) && currentZoom >= layer.minZoom;
          return (
            <GeoJSONLayerWrapper
              key={layer.id}
              layer={layer}
              isVisible={isVisible}
            />
          );
        })}

        {/* Renderiza componentes filhos passados (BasemapSelector, Legend, etc.) */}
        {children}
      </MapContainer>
    </div>
  );
}
