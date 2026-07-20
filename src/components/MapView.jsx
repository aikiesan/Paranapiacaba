import React, { useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ScaleControl } from 'react-leaflet';
import L from 'leaflet';
import { LAYERS } from '../config/layers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { PALETTE, vegColor, riskColor, conservationColor } from '../config/styleGuide';
import { MapToolbar, CORRIDOR_BOUNDS } from './MapToolbar';
import { RasterControl } from './RasterControl';

// Importa biblioteca e estilos de clusterização do leaflet.markercluster
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { BASEMAPS } from './BasemapSelector';

// Componente auxiliar para sincronização da posição do mapa no URL hash (#zoom/lat/lng)
function MapHashHandler() {
  const map = useMap();

  useEffect(() => {
    // Tenta carregar a posição inicial a partir do hash da URL
    const hash = window.location.hash;
    let restored = false;
    if (hash && hash.startsWith('#')) {
      const parts = hash.substring(1).split('/');
      if (parts.length === 3) {
        const zoom = parseInt(parts[0], 10);
        const lat = parseFloat(parts[1]);
        const lng = parseFloat(parts[2]);
        if (!isNaN(zoom) && !isNaN(lat) && !isNaN(lng)) {
          map.setView([lat, lng], zoom);
          restored = true;
        }
      }
    }
    // Sem link compartilhado: enquadra o corredor Jundiaí–Santos (visão geral)
    if (!restored) {
      map.fitBounds(CORRIDOR_BOUNDS, { padding: [30, 30] });
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
function GeoJSONLayerWrapper({ layer, isVisible, groupOpacity, onFeatureClick, buildingSymbologyMode }) {
  const { data } = useGeoJSON(layer.file, isVisible, layer.available);
  const map = useMap();

  useEffect(() => {
    if (!isVisible || !data) return;

    const processedData = data;

    // Estilo dinâmico/estático dependendo do tipo da camada e feição
    let dashArray;
    const getStyle = (feature) => {
      const props = feature.properties || {};

      // Cor base padrão
      let strokeColor = layer.color;
      let fillColor = layer.color;
      let weight = layer.weight || 1;
      let fillOpacity = layer.fillOpacity !== undefined ? layer.fillOpacity : 0.4;
      dashArray = undefined;

      // Estilo dinâmico: Trilhas por Tipologia (Oficial / Wikiloc / Técnica) ou Região
      if (layer.id === 'trilhas') {
        const tipo = (props.tipo || props.tipologia || '').toLowerCase();
        if (tipo.includes('oficial') || tipo.includes('subprefeitura')) {
          strokeColor = PALETTE.trilha_oficial;
          weight = 2.5;
        } else if (tipo.includes('tecnica') || tipo.includes('ferrovia')) {
          strokeColor = PALETTE.trilha_tecnica;
          weight = 1.5;
        } else if (props.regiao) {
          const regiaoKey = `trilha_${props.regiao.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          strokeColor = PALETTE[regiaoKey] || PALETTE.trilha_wikiloc;
          dashArray = '5 4';
        } else {
          strokeColor = PALETTE.trilha_wikiloc;
          dashArray = '5 4';
        }
      }

      // Estilo dinâmico: Corredor ferroviário por situação operacional
      if (layer.id === 'ferrovia_corredor') {
        const sit = (props.situacao || '').toLowerCase();
        if (sit.includes('desativ') || sit.includes('erradic')) {
          strokeColor = PALETTE.ferrovia_desativada;
          dashArray = '6 4';
        } else if (sit.includes('plan') || sit.includes('constru')) {
          strokeColor = PALETTE.ferrovia_planejada;
        } else {
          strokeColor = PALETTE.ferrovia_ativa;
        }
      }

      // Estilo dinâmico: Rede de Eletricidade (Linha tracejada Vermelho Vivo)
      if (layer.id === 'rede_eletrica') {
        strokeColor = PALETTE.rede_eletrica;
        dashArray = '6 4';
        weight = 1.8;
      }

      // Estilo dinâmico: Linhas de ônibus por tipo
      if (layer.id === 'mobilidade_urbana') {
        const cat = (props.categoria || '').toUpperCase();
        strokeColor = cat.includes('INTER')
          ? PALETTE.bus_intermunicipal
          : PALETTE.bus_municipal;
      }

      // Estilo dinâmico: Vegetação por estágio de sucessão (IBGE)
      if (layer.id === 'classif_vegetal') {
        strokeColor = fillColor = vegColor(props.classe);
      }

      // Estilo dinâmico: Riscos (Defesa Civil) por grau
      if (layer.id === 'risco_movmas' || layer.id === 'susc_movmas' || layer.id === 'risco_incendio') {
        strokeColor = fillColor = riskColor(props.grau);
      }

      // Estilo dinâmico: Bens Tombados por Instância (IBGE: Polígonos Vazios)
      if (layer.id === 'patrimonio_tombados') {
        const inst = (props.instancia || '').toUpperCase();
        fillOpacity = 0; // Borda vazia conforme norma IBGE
        if (inst.includes('FEDERAL') || inst.includes('IPHAN')) {
          strokeColor = PALETTE.tombado_federal.stroke;
          weight = PALETTE.tombado_federal.weight;
        } else if (inst.includes('ESTADUAL') || inst.includes('CONDEPHAAT')) {
          strokeColor = PALETTE.tombado_estadual.stroke;
          weight = PALETTE.tombado_estadual.weight;
        } else if (inst.includes('MUNICIPAL') || inst.includes('COMDEPHAAPASA')) {
          strokeColor = PALETTE.tombado_municipal.stroke;
          weight = PALETTE.tombado_municipal.weight;
        } else {
          strokeColor = PALETTE.tombado_federal.stroke;
          weight = 2;
        }
      }

      // Estilo dinâmico: Edificações da Vila (Alternador: Conservação Semáforo vs Uso do Solo IBGE)
      if (layer.id === 'edificacoes_vila') {
        if (buildingSymbologyMode === 'uso') {
          const uso = (props.uso || props.categoria || '').toLowerCase();
          if (uso.includes('residenc') || uso.includes('habit')) fillColor = PALETTE.uso_residencial;
          else if (uso.includes('servico') || uso.includes('public') || uso.includes('equip')) fillColor = PALETTE.uso_servicos;
          else if (uso.includes('turis') || uso.includes('cultur') || uso.includes('museu')) fillColor = PALETTE.uso_turismo_cultura;
          else if (uso.includes('ferrov') || uso.includes('operac')) fillColor = PALETTE.uso_ferrovia;
          else fillColor = PALETTE.uso_solo_exposto;
          strokeColor = '#B45309';
        } else {
          // Default: Estado de Conservação (Escala Semáforo IBGE)
          const estado = props.estado_conservacao || props.conservacao || props.estado;
          const style = conservationColor(estado);
          fillColor = style.fill;
          strokeColor = style.stroke;
        }
        fillOpacity = 0.65;
      }

      // Estilo dinâmico: Áreas Envoltórias (UNESCO)
      if (layer.id === 'areas_envoltorias') {
        strokeColor = PALETTE.area_unesco.stroke;
        weight = PALETTE.area_unesco.weight;
        dashArray = PALETTE.area_unesco.dashArray;
        fillOpacity = 0;
      }

      if (layer.type === 'polygon') {
        return {
          color: strokeColor,
          weight: weight,
          opacity: groupOpacity,
          fillColor: fillColor,
          fillOpacity: fillOpacity * groupOpacity
        };
      } else if (layer.type === 'line') {
        return {
          color: strokeColor,
          weight: weight,
          opacity: groupOpacity,
          dashArray,
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

    // 5. Renderização
    let geoJsonLayer;
    if (layer.cluster && layer.type === 'point') {
      const clusterColor = layer.color || '#475569';
      const mcg = L.markerClusterGroup({
        disableClusteringAtZoom: 14,
        maxClusterRadius: 40,
        iconCreateFunction: (cluster) => {
          const count = cluster.getChildCount();
          return L.divIcon({
            html: `<div style="background-color:${clusterColor}" class="w-8 h-8 rounded-full border border-white/80 text-white font-bold text-xs flex items-center justify-center shadow-lg hover:scale-105 transition-transform">${count}</div>`,
            className: 'custom-cluster-icon',
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
  }, [data, isVisible, groupOpacity, map, layer, onFeatureClick, buildingSymbologyMode]);

  return null;
}

// Centraliza/aproxima o mapa numa feição selecionada (ex.: clique na tabela)
function FlyToFeature({ focusFeature }) {
  const map = useMap();
  useEffect(() => {
    if (!focusFeature || !focusFeature.feature) return;
    try {
      const gj = L.geoJSON(focusFeature.feature);
      const bounds = gj.getBounds();
      if (bounds.isValid()) {
        if (focusFeature.feature.geometry?.type === 'Point') {
          map.setView(bounds.getCenter(), Math.max(map.getZoom(), 16));
        } else {
          map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17 });
        }
      }
    } catch (e) {
      console.warn('FlyToFeature:', e);
    }
  }, [focusFeature, map]);
  return null;
}

// Enquadra o mapa na extensão completa de uma camada (botão "zoom para a camada")
function FlyToLayer({ focusLayer }) {
  const map = useMap();
  const layer = focusLayer ? LAYERS.find((l) => l.id === focusLayer.layerId) : null;
  const { data } = useGeoJSON(layer ? layer.file : null, !!layer, layer ? layer.available : true);
  useEffect(() => {
    if (!focusLayer || !layer || !data) return;
    try {
      const bounds = L.geoJSON(data).getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
      }
    } catch (e) {
      console.warn('FlyToLayer:', e);
    }
  }, [focusLayer, data, layer, map]);
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
  focusFeature,
  focusLayer,
  buildingSymbologyMode,
  children
}) {
  const basemapConfig = LAYERS;
  const activeBasemap = selectedBasemap;

  // Encontra as configurações do basemap selecionado
  const currentBasemap = BASEMAPS.find(b => b.id === activeBasemap) || BASEMAPS[0];

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[-23.778, -46.305]}
        zoom={13}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <MapHashHandler />

        <TileLayer
          key={currentBasemap.id}
          url={currentBasemap.url}
          attribution={currentBasemap.attribution}
          subdomains={currentBasemap.subdomains || 'abc'}
          maxZoom={currentBasemap.maxZoom || 19}
        />

        <ScaleControl position="bottomleft" imperial={false} />

        <MapToolbar />

        <RasterControl />

        <MapEventsZoomWatcher onZoomChange={onZoomChange} onMapClick={onMapClick} />

        <FlyToFeature focusFeature={focusFeature} />

        <FlyToLayer focusLayer={focusLayer} />

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
              buildingSymbologyMode={buildingSymbologyMode}
            />
          );
        })}

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
