import React from 'react';
import { LAYERS } from '../config/layers';
import { PALETTE } from '../config/styleGuide';
import { useIsMobile } from '../hooks/useIsMobile';

// Helper simples para calcular o centroide aproximado de qualquer geometria
function getCentroid(feature) {
  if (!feature || !feature.geometry) return null;
  const { type, coordinates } = feature.geometry;
  if (type === 'Point') {
    return coordinates;
  }
  let sumLng = 0;
  let sumLat = 0;
  let count = 0;

  const traverse = (arr) => {
    if (Array.isArray(arr[0])) {
      arr.forEach(traverse);
    } else {
      sumLng += arr[0];
      sumLat += arr[1];
      count++;
    }
  };

  try {
    traverse(coordinates);
  } catch (e) {
    return null;
  }

  return count > 0 ? [sumLng / count, sumLat / count] : null;
}

// Mini gráfico SVG do perfil de elevação de uma trilha (array [km, elev_m])
function ElevationProfile({ perfil, color = '#FB5607' }) {
  if (!Array.isArray(perfil) || perfil.length < 2) return null;
  const W = 280, H = 88, pad = 5;
  const xs = perfil.map(p => p[0]);
  const ys = perfil.map(p => p[1]);
  const xmin = Math.min(...xs), xmax = Math.max(...xs);
  const ymin = Math.min(...ys), ymax = Math.max(...ys);
  const sx = x => pad + (xmax > xmin ? (x - xmin) / (xmax - xmin) : 0) * (W - 2 * pad);
  const sy = y => H - pad - (ymax > ymin ? (y - ymin) / (ymax - ymin) : 0) * (H - 2 * pad);
  const line = perfil.map((p, i) => `${i ? 'L' : 'M'}${sx(p[0]).toFixed(1)},${sy(p[1]).toFixed(1)}`).join(' ');
  const area = `${line} L${sx(xmax).toFixed(1)},${(H - pad).toFixed(1)} L${sx(xmin).toFixed(1)},${(H - pad).toFixed(1)} Z`;

  return (
    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[10px] uppercase text-slate-400 font-bold">Perfil de Elevação</span>
        <span className="text-[10px] font-semibold text-slate-500">{Math.round(ymin)}–{Math.round(ymax)} m</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 88 }} preserveAspectRatio="none">
        <path d={area} fill={color} fillOpacity="0.15" />
        <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-[9px] text-slate-400 font-medium">
        <span>0 km</span><span>{xmax.toFixed(1)} km</span>
      </div>
    </div>
  );
}

// Formata chaves (ex: "distancia_km" -> "Distancia Km")
function formatKey(key) {
  const technicalPrefixes = ['Shape_', 'FID_', 'OBJECTID_'];
  let cleanKey = key;
  technicalPrefixes.forEach(prefix => {
    if (cleanKey.startsWith(prefix)) {
      cleanKey = cleanKey.replace(prefix, '');
    }
  });
  return cleanKey
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export function FeatureDetailPanel({ activeFeature, onClose }) {
  const isMobile = useIsMobile();
  if (!activeFeature) return null;

  const { feature, layerId } = activeFeature;
  const properties = feature.properties || {};
  
  // Encontra a camada de origem
  const layer = LAYERS.find(l => l.id === layerId) || {};
  
  const centroid = getCentroid(feature);
  const lat = centroid ? centroid[1].toFixed(5) : null;
  const lng = centroid ? centroid[0].toFixed(5) : null;

  // Renderizadores específicos de acordo com a camada
  const renderTrilhaContent = () => {
    const nome = properties.nome || properties.name || 'Trilha Sem Nome';
    const regiao = properties.regiao || 'Geral';
    const tipo = properties.tipo || 'Trilha';
    const dificuldade = properties.dificuldade || 'Não informada';
    const distancia = properties.distancia_km || properties.distancia || 0;
    const desnivel = properties.desnivel_m || properties.desnivel || 0;
    
    // Contar waypoints do GeoJSON se disponível
    let waypointsCount = 0;
    if (feature.geometry && feature.geometry.type === 'LineString') {
      waypointsCount = feature.geometry.coordinates.length;
    } else if (feature.geometry && feature.geometry.type === 'MultiLineString') {
      waypointsCount = feature.geometry.coordinates.reduce((sum, line) => sum + line.length, 0);
    }

    // Calcula tempo estimado (distancia / 3.5 km/h)
    const totalHours = distancia / 3.5;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);
    const tempoEstimado = `${hours}h:${minutes < 10 ? '0' : ''}${minutes}m`;

    const isRisk = properties.risco === true || properties.risco === 'true' || nome.toLowerCase().includes('funicular');

    // Mapeamento de cor da região
    const regiaoKey = `trilha_${regiao.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const regiaoColor = PALETTE[regiaoKey] || PALETTE.trilha_default;

    // Estilo de dificuldade
    let diffColorClass = 'bg-slate-100 text-slate-600 border border-slate-200';
    if (dificuldade.toLowerCase().includes('fácil')) diffColorClass = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    else if (dificuldade.toLowerCase().includes('moderada') || dificuldade.toLowerCase().includes('médio')) diffColorClass = 'bg-amber-50 text-amber-700 border border-amber-200';
    else if (dificuldade.toLowerCase().includes('difícil') || dificuldade.toLowerCase().includes('pesada')) diffColorClass = 'bg-rose-50 text-rose-700 border border-rose-200';

    return (
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 leading-tight">{nome}</h2>
        
        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <span 
            className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-sm"
            style={{ backgroundColor: regiaoColor }}
          >
            Região: {regiao}
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {tipo}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${diffColorClass}`}>
            Dificuldade: {dificuldade}
          </span>
        </div>

        {/* Grid Altimétrico/Métricas */}
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Extensão</span>
            <span className="text-sm font-bold text-slate-800">{distancia} km</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Desnível (+)</span>
            <span className="text-sm font-bold text-slate-800">+{desnivel} m</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Nº de Pontos</span>
            <span className="text-sm font-bold text-slate-800">{waypointsCount}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Tempo Estimado</span>
            <span className="text-sm font-bold text-slate-800">{tempoEstimado}</span>
          </div>
        </div>

        {/* Perfil de Elevação */}
        <ElevationProfile perfil={properties.perfil} color={regiaoColor} />

        {/* Alerta de Risco */}
        {isRisk && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex gap-2 shadow-sm">
            <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <span className="font-bold">Atenção:</span> Trilha de alto risco ou leito ferroviário ativo. Requer autorização e acompanhamento de monitor credenciado.
            </div>
          </div>
        )}

        {/* Link Wikiloc */}
        {properties.url_wikiloc && (
          <a
            href={properties.url_wikiloc}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded transition-colors shadow-md"
          >
            Ver no Wikiloc
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </div>
    );
  };

  const renderAtrativoContent = () => {
    const nome = properties.nome || properties.name || 'Atrativo';
    const tipo = properties.tipo || 'Cachoeira';
    const regiao = properties.regiao || 'Geral';
    const descricao = properties.descricao || properties.description;

    // Ícones e cores para atrativos
    const tipoKey = `atrativo_${tipo.toLowerCase()}`;
    const atrativoColor = PALETTE[tipoKey] || PALETTE.atrativo_default;
    
    // Emojis de atrativos
    const iconsMap = {
      'cachoeira': '💧',
      'poco': '◎',
      'mirante': '👁',
      'pedra': '⬡',
      'nascente': '🌿',
      'ruina': '🏛',
      'gruta': '○'
    };
    const emoji = iconsMap[tipo.toLowerCase()] || '📍';

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-md border border-white/80"
            style={{ backgroundColor: atrativoColor }}
          >
            {emoji}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 leading-tight">{nome}</h2>
            <span className="text-xs text-slate-400 capitalize">{tipo}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Região: {regiao}
          </span>
        </div>

        {descricao && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200">
            {descricao}
          </p>
        )}

        {lat && lng && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-xs text-slate-600">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Coordenadas</span>
            <div className="flex justify-between">
              <span>Latitude:</span> <span className="font-mono font-semibold text-slate-800">{lat}</span>
            </div>
            <div className="flex justify-between">
              <span>Longitude:</span> <span className="font-mono font-semibold text-slate-800">{lng}</span>
            </div>
          </div>
        )}

        {lat && lng && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 px-4 rounded border border-slate-200 transition-colors shadow-sm"
          >
            Como Chegar (Google Maps)
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </a>
        )}
      </div>
    );
  };

  const renderPatrimonioContent = () => {
    const nome = properties.nome || properties.name || properties.Denominaca || 'Patrimônio Histórico';
    const endereco = properties.endereco || properties.endereco_completo || properties.Localizaca || 'Vila de Paranapiacaba';
    const instancia = properties.instancia || properties.instancia_tombamento || properties.Tombamento || 'IPHAN';
    const processo = properties.processo || properties.num_processo || properties.Processo_N || null;
    const tipologia = properties.tipologia || properties.tipo_edific || null;

    // Badges de Tombamento
    let badgeColor = '#E9C46A';
    if (instancia.toUpperCase().includes('IPHAN')) badgeColor = PALETTE.tombado_federal;
    else if (instancia.toUpperCase().includes('CONDEPHAAT')) badgeColor = PALETTE.tombado_estadual;
    else if (instancia.toUpperCase().includes('COMDEPHAAPASA') || instancia.toUpperCase().includes('MUNICIPAL')) badgeColor = PALETTE.tombado_municipal;

    return (
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 leading-tight">{nome}</h2>
        
        <div className="flex flex-wrap gap-2">
          <span 
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-slate-900 shadow-sm"
            style={{ backgroundColor: badgeColor }}
          >
            Tombamento: {instancia}
          </span>
        </div>

        {endereco && (
          <div className="text-xs text-slate-600">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Localização / Endereço</span>
            <span className="font-semibold text-slate-800">{endereco}</span>
          </div>
        )}

        {(processo || tipologia) && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 text-xs text-slate-600">
            {processo && (
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Nº Processo</span>
                <span className="font-semibold font-mono text-slate-800">{processo}</span>
              </div>
            )}
            {tipologia && (
              <div>
                <span className="text-[10px] uppercase text-slate-400 font-bold block">Tipologia Construtiva</span>
                <span className="font-semibold text-emerald-600">{tipologia}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderDefaultContent = () => {
    // Exclui chaves técnicas e filtra valores válidos
    const technicalKeys = ['FID', 'OBJECTID', 'id', 'layer', 'geometry_len', 'geometry_area', 'Shape_Area', 'Shape_Length'];
    const filteredProps = Object.entries(properties).filter(([key, val]) => {
      if (technicalKeys.some(techKey => key.toLowerCase().startsWith(techKey.toLowerCase()) || key.toLowerCase().endsWith(techKey.toLowerCase()))) return false;
      if (val === null || val === undefined || String(val).trim() === '') return false;
      return true;
    });

    return (
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-800 leading-tight">
          {properties.nome || properties.name || layer.label || 'Feição do Mapa'}
        </h2>

        {filteredProps.length > 0 ? (
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar border border-slate-200 rounded bg-slate-50">
            <table className="w-full text-left border-collapse text-xs">
              <tbody>
                {filteredProps.map(([key, val], idx) => (
                  <tr key={key} className={idx % 2 === 0 ? 'bg-slate-100/50' : 'bg-white'}>
                    <td className="p-2 font-medium text-slate-500 border-b border-slate-200/60 w-1/3 text-[10px] uppercase tracking-wider">
                      {formatKey(key)}
                    </td>
                    <td className="p-2 font-semibold text-slate-700 border-b border-slate-200/60 break-all">
                      {String(val)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Nenhum atributo disponível.</p>
        )}

        {lat && lng && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Coordenadas de Centroide</span>
            <div>Lat: <span className="font-mono font-semibold text-slate-700">{lat}</span></div>
            <div>Lng: <span className="font-mono font-semibold text-slate-700">{lng}</span></div>
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (layerId) {
      case 'trilhas':
        return renderTrilhaContent();
      case 'atrativos':
        return renderAtrativoContent();
      case 'patrimonio_tombados':
        return renderPatrimonioContent();
      default:
        return renderDefaultContent();
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 w-full max-h-[70vh] rounded-t-2xl border-t md:absolute md:inset-auto md:top-0 md:right-0 md:h-full md:w-[320px] md:max-h-none md:rounded-none md:border-t-0 md:border-l bg-white/95 backdrop-blur border-slate-200 shadow-2xl flex flex-col z-[1010] transform transition-transform duration-300 ${
        isMobile ? 'animate-slide-up' : 'animate-slide-in'
      }`}
    >
      {/* Alça de arraste (somente mobile, indica que é uma "folha" arrastável) */}
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <span className="w-10 h-1.5 rounded-full bg-slate-300" />
      </div>

      {/* Header do Painel */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Pill de origem */}
          <span 
            className="w-3 h-3 rounded-full border border-slate-900/10"
            style={{ backgroundColor: layer.color || '#fff' }}
          />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {layer.label || 'Detalhes'}
          </span>
        </div>
        
        {/* Botão de Fechar */}
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-slate-800 p-1 rounded-md hover:bg-slate-100 transition-colors"
          title="Fechar painel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Conteúdo Dinâmico com Scroll */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {renderContent()}
      </div>

      {/* Rodapé institucional */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
          WebGIS Paranapiacaba
        </span>
      </div>
    </div>
  );
}
