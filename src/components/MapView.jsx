import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import { LAYERS } from '../config/layers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { PALETTE } from '../config/styleGuide';
import { simplifyGeoJSON } from '../utils/simplify';
import { MapToolbar } from './MapToolbar';

// Importa estilos de clusterização do leaflet.markercluster
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { BASEMAPS } from './BasemapSelector';

// Componente auxiliar para sincronização da posição do mapa no URL hash (#zoom/lat/lng)
function MapHashHandler() {
  const map = useMap();

  useEffect(() => {
    // Tenta carregar a posição inicial a partir do hash da URL
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const parts = hash.substring(1).split('/');
      if (parts.length === 3) {
        const zoom = parseInt(parts[0], 10);
        const lat = parseFloat(parts[1]);
        const lng = parseFloat(parts[2]);
        if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lng)) {
          map.setView([lat, lng], zoom);
        }
      }
    }
  }, [map]);

  // Atualiza a URL quando o mapa para de se mover
  useEffect(() => {
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const lat = center.lat.toFixed(5);
      const lng = center.lng.toFixed(5);
      const hash = `#${zoom}/${lat}/${lng}`;
      window.history.replaceState(null, null, hash);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map]);

  return null;
}

// Retorna o Leaflet DivIcon estilizado com SVG e Emoji por tipo de atrativo
function getAtrativoIcon(feature) {
  const props = feature.properties || {};
  const tipo = (props.tipo || '').toLowerCase();
  const nome = props.nome || props.name || 'Atrativo';

  // Resgata cor do estilo ou default
  const color = PALETTE[`atrativo_${tipo}`] || PALETTE.atrativo_default;

  // Emojis específicos por categoria
  const iconsMap = {
    'cachoeira': '💧',
    'poco': '◎',
    'mirante': '👁',
    'pedra': '⬡',
    'nascente': '🌿',
    'ruina': '🏛',
    'gruta': '○'
  };
  const emoji = iconsMap[tipo] || '📍';

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center cursor-pointer shadow-md rounded-full border border-white/80 transition-all hover:scale-110 active:scale-95" style="width: 22px; height: 22px; background-color: ${color};">
        <span class="text-[11px] font-sans" style="margin-top: -1px;">${emoji}</span>
        <span class="atrativo-label">${nome}</span>
      </div>
    `,
    className: 'atrativo-marker-icon-wrapper',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

// Componente para carregar, simplificar e renderizar dados GeoJSON
function GeoJSONLayerWrapper({ layer, isVisible, groupOpacity, onFeatureClick }) {
  const { data } = useGeoJSON(layer.file, isVisible, layer.available);
  const map = useMap();

  useEffect(() => {
    if (!isVisible || !data) return;

    // 1. Aplica simplificação on-the-fly Ramer-Douglas-Peucker para camadas pesadas
    const heavyLayers = ['hidrografia', 'declividade', 'app_buffers', 'censo_setores'];
    const processedData = heavyLayers.includes(layer.id)
      ? simplifyGeoJSON(data, 0.00005)
      : data;

    // 2. Estilo dinâmico/estático dependendo do tipo da camada e feição
    const getStyle = (feature) => {
      const props = feature.properties || {};
      
      // Cor base padrão
      let strokeColor = layer.color;
      let fillColor = layer.color;

      // Estilo dinâmico: Trilhas por Região
      if (layer.id === 'trilhas' && props.regiao) {
        const regiaoKey = `trilha_${props.regiao.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        strokeColor = PALETTE[regiaoKey] || PALETTE.trilha_default;
      }

      // Estilo dinâmico: Bens Tombados por Instância
      if (layer.id === 'patrimonio_tombados' && props.instancia) {
        const inst = props.instancia.toUpperCase();
        if (inst.includes('IPHAN')) {
          strokeColor = PALETTE.tombado_federal;
          fillColor = PALETTE.tombado_federal;
        } else if (inst.includes('CONDEPHAAT')) {
          strokeColor = PALETTE.tombado_estadual;
          fillColor = PALETTE.tombado_estadual;
        } else if (inst.includes('COMDEPHAAPASA') || inst.includes('MUNICIPAL')) {
          strokeColor = PALETTE.tombado_municipal;
          fillColor = PALETTE.tombado_municipal;
        }
      }

      if (layer.type === 'polygon') {
        return {
          color: strokeColor,
          weight: layer.weight,
          opacity: groupOpacity,
          fillColor: fillColor,
          fillOpacity: layer.fillOpacity * groupOpacity
        };
      } else if (layer.type === 'line') {
        return {
          color: strokeColor,
          weight: layer.weight,
          opacity: groupOpacity,
          fillColor: 'transparent'
        };
      }
      return {};
    };

    // 3. Estilo dinâmico: Pontos de Atrativos ou Nascentes
    const pointToLayer = (feature, latlng) => {
      if (layer.id === 'atrativos') {
        return L.marker(latlng, { 
          icon: getAtrativoIcon(feature),
          opacity: groupOpacity 
        });
      }
      
      // Default Point -> CircleMarker
      return L.circleMarker(latlng, {
        radius: 6,
        fillColor: layer.color,
        color: '#1e293b',
        weight: 1,
        opacity: groupOpacity,
        fillOpacity: 0.85 * groupOpacity
      });
    };

    // 4. Integração de eventos (clique para detalhes e hover)
    const onEachFeature = (feature, leafletLayer) => {
      // Evento de clique: abre o painel lateral deslizante
      leafletLayer.on({
        click: (e) => {
          onFeatureClick({ feature, layerId: layer.id });
          L.DomEvent.stopPropagation(e);
        },
        mouseover: (e) => {
          const target = e.target;
          if (layer.type === 'polygon') {
            target.setStyle({ fillOpacity: Math.min(layer.fillOpacity * groupOpacity + 0.25, 0.95) });
          } else if (layer.type === 'line') {
            target.setStyle({ weight: layer.weight + 1.5 });
          }
        },
        mouseout: (e) => {
          const target = e.target;
          if (layer.type === 'polygon') {
            target.setStyle({ fillOpacity: layer.fillOpacity * groupOpacity });
          } else if (layer.type === 'line') {
            target.setStyle({ weight: layer.weight });
          }
        }
      });
    };

    // 5. Renderização (se for a camada de atrativos com mais de 300 pontos, usa cluster)
    let geoJsonLayer;
    if (layer.id === 'atrativos') {
      const mcg = L.markerClusterGroup({
        disableClusteringAtZoom: 14,
        maxClusterRadius: 40,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div class="w-8 h-8 rounded-full border border-white/80 bg-amber-600/90 text-white font-bold text-xs flex items-center justify-center shadow-lg hover:scale-105 transition-transform">${count}</div>`,
            className: 'custom-atrativos-cluster',
            iconSize: [32, 32]
          });
        }
      });

      const rawGeoJson = L.geoJSON(processedData, {
        pointToLayer,
        onEachFeature
      });

      mcg.addLayer(rawGeoJson);
      map.addLayer(mcg);
      geoJsonLayer = mcg;
    } else {
      const rawGeoJson = L.geoJSON(processedData, {
        style: getStyle,
        pointToLayer: layer.type === 'point' ? pointToLayer : undefined,
        onEachFeature
      });
      map.addLayer(rawGeoJson);
      geoJsonLayer = rawGeoJson;
    }

    return () => {
      map.removeLayer(geoJsonLayer);
    };
  }, [data, isVisible, groupOpacity, map, layer, onFeatureClick]);

  return null;
}

export function MapView({ 
  activeLayers, 
  selectedBasemap, 
  currentZoom, 
  onZoomChange, 
  groupOpacities, 
  onFeatureClick,
  onMapClick,
  children 
}) {
  const basemapConfig = LAYERS; // Só pra garantir
  const activeBasemap = selectedBasemap;

  // Encontra as configurações do basemap selecionado
  const currentBasemap = BASEMAPS.find(b => b.id === activeBasemap) || BASEMAPS[0];

  return (
    <div className="relative w-full h-full flex-1">
      <MapContainer
        center={[-23.773, -46.312]}
        zoom={13}
        className={`w-full h-full z-0 leaflet-zoom-${currentZoom}`}
        zoomControl={false}
      >
        <TileLayer
          url={currentBasemap.url}
          attribution={currentBasemap.attribution}
        />

        {/* Régua de Escala Física */}
        <ScaleControl position="bottomleft" imperial={false} />

        {/* Manipulador do URL Hash (#13/-23.773/-46.312) */}
        <MapHashHandler />

        {/* Barra de Ferramentas Flutuante */}
        <MapToolbar />

        {/* Captura de mudanças do zoom */}
        <MapEventsZoomWatcher onZoomChange={onZoomChange} onMapClick={onMapClick} />

        {/* Renderização individualizada das camadas geográficas */}
        {LAYERS.map((layer) => {
          const isVisible = activeLayers.has(layer.id) && currentZoom >= layer.minZoom;
          const opacity = (groupOpacities[layer.group] !== undefined ? groupOpacities[layer.group] : 100) / 100;
          return (
            <GeoJSONLayerWrapper
              key={layer.id}
              layer={layer}
              isVisible={isVisible}
              groupOpacity={opacity}
              onFeatureClick={onFeatureClick}
            />
          );
        })}

        {/* Controles de pills/basemap injetados */}
        {children}
      </MapContainer>
    </div>
  );
}

// Sub-componente interno para assistir eventos de zoom e cliques vazios no mapa
function MapEventsZoomWatcher({ onZoomChange, onMapClick }) {
  const map = useMap();
  
  useEffect(() => {
    const handleZoomEnd = () => {
      onZoomChange(map.getZoom());
    };
    const handleMapClick = () => {
      if (onMapClick) onMapClick();
    };

    map.on('zoomend', handleZoomEnd);
    map.on('click', handleMapClick);

    // Dispara a leitura do zoom inicial
    onZoomChange(map.getZoom());

    return () => {
      map.off('zoomend', handleZoomEnd);
      map.off('click', handleMapClick);
    };
  }, [map, onZoomChange, onMapClick]);

  return null;
}
