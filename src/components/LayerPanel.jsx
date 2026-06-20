import React, { useState } from 'react';
import { LAYERS, GROUPS } from '../config/layers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { groupMeta, getLayerSymbol } from '../config/styleGuide';
import { PRESETS } from '../config/presets';

// "Swatch" que espelha como a camada é desenhada no mapa (linha / polígono / ponto).
function LayerSwatch({ layer }) {
  const s = getLayerSymbol(layer);
  if (s.emoji) {
    return (
      <span className="w-4 h-4 flex items-center justify-center text-[11px] flex-shrink-0" aria-hidden>
        {s.emoji}
      </span>
    );
  }
  if (s.kind === 'line') {
    return (
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden>
        <span className="block w-4 h-[3px] rounded-full" style={{ backgroundColor: s.color }} />
      </span>
    );
  }
  if (s.kind === 'point') {
    return (
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden>
        <span className="block w-2.5 h-2.5 rounded-full border border-slate-900/30" style={{ backgroundColor: s.color }} />
      </span>
    );
  }
  // Polígono
  return (
    <span
      className="w-4 h-4 rounded-[3px] flex-shrink-0 border"
      style={{ backgroundColor: `${s.color}55`, borderColor: s.color }}
      aria-hidden
    />
  );
}

// Componente para item de camada individual, lidando com seu próprio hook de dados
function LayerItem({ layer, isActive, onToggle, currentZoom, isGroupExpanded, onOpenTable, onZoomToLayer }) {
  // Carrega o GeoJSON se o grupo estiver expandido (para contar features) ou se a camada estiver ativa no mapa
  const shouldLoad = isGroupExpanded || isActive;
  const { loading, error, featureCount } = useGeoJSON(layer.file, shouldLoad, layer.available);

  const [showDescription, setShowDescription] = useState(false);
  const isZoomRestricted = currentZoom < layer.minZoom;

  return (
    <div
      className={`flex flex-col rounded-md transition-colors ${
        isActive ? 'bg-emerald-50/80 ring-1 ring-emerald-200' : 'hover:bg-slate-50'
      } py-1.5 px-2`}
    >
      <div className={`group/layer flex items-center justify-between transition-opacity ${
        isZoomRestricted ? 'opacity-50' : 'opacity-100'
      }`}>
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          {/* Spinner de Loading ou Checkbox */}
          {loading ? (
            <div className="w-4 h-4 flex items-center justify-center">
              <div className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onToggle(layer.id)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white focus:ring-offset-white cursor-pointer"
            />
          )}

          {/* Símbolo da camada (espelha o mapa) */}
          <LayerSwatch layer={layer} />

          <span
            onClick={() => onToggle(layer.id)}
            className={`text-xs truncate cursor-pointer select-none transition-colors ${
              isActive
                ? 'font-bold text-slate-900'
                : 'font-semibold text-slate-600 group-hover/layer:text-slate-900'
            }`}
            title={layer.label}
          >
            {layer.label}
          </span>

          {/* Badge de Contagem de Features */}
          {featureCount !== null && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200/50">
              {featureCount}
            </span>
          )}
        </div>

        {/* Controles de Zoom, Tabela, Info, Restrição de Zoom e Erro */}
        <div className="flex items-center space-x-1 ml-2">
          {/* Botão Zoom para a camada */}
          {layer.available !== false && !error && onZoomToLayer && (
            <button
              onClick={() => onZoomToLayer(layer.id)}
              className="p-0.5 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              title="Aproximar na extensão da camada"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14zm0-10v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          )}

          {/* Botão de Tabela de Atributos */}
          {layer.available !== false && !error && onOpenTable && (
            <button
              onClick={() => onOpenTable(layer.id)}
              className="p-0.5 rounded text-slate-400 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              title="Tabela de atributos / exportar"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 6h18M3 18h18" />
              </svg>
            </button>
          )}

          {/* Botão de Info */}
          {layer.description && (
            <button
              onClick={() => setShowDescription(!showDescription)}
              className={`p-0.5 rounded text-slate-400 hover:text-slate-700 transition-colors ${
                showDescription ? 'text-slate-800 bg-slate-100' : ''
              }`}
              title="Informações da camada"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          {/* Erro de Arquivo */}
          {error && (
            <div className="relative flex items-center group/err">
              <svg className="w-4 h-4 text-rose-600 cursor-help animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="absolute right-0 bottom-6 hidden group-hover/err:block bg-slate-900 text-slate-100 text-[10px] font-bold px-2 py-1 rounded-md border border-slate-750 shadow-xl whitespace-nowrap z-[1050]">
                Arquivo não encontrado
              </div>
            </div>
          )}

          {/* Restrição de Zoom */}
          {isZoomRestricted && !error && (
            <div className="relative flex items-center group/tooltip">
              <svg className="w-3.5 h-3.5 text-amber-600 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="absolute right-0 bottom-6 hidden group-hover/tooltip:block bg-slate-900 text-slate-100 text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-750 shadow-xl whitespace-nowrap z-[1050]">
                Visível a partir do zoom {layer.minZoom} (Zoom atual: {currentZoom})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Descrição Inline */}
      {showDescription && layer.description && (
        <div className="mt-1.5 p-2 rounded bg-slate-50 border border-slate-200 text-[10px] text-slate-500 leading-relaxed animate-fade-in">
          {layer.description}
        </div>
      )}
    </div>
  );
}

export function LayerPanel({
  activeLayers,
  onToggle,
  currentZoom,
  groupOpacities,
  onGroupOpacityChange,
  onToggleAllInGroup,
  onOpenAbout,
  onOpenTable,
  onZoomToLayer,
  onApplyPreset
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Carrega estado do accordion do localStorage (todos abertos por padrão)
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const saved = localStorage.getItem('webgis_expanded_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Erro ao restaurar accordions:', e);
      }
    }
    return GROUPS.reduce((acc, group) => ({ ...acc, [group]: true }), {});
  });

  // Salva no localStorage a cada modificação
  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const next = { ...prev, [groupName]: !prev[groupName] };
      localStorage.setItem('webgis_expanded_groups', JSON.stringify(next));
      return next;
    });
  };

  // Contagem de camadas ativas
  const activeCount = activeLayers.size;

  // Filtragem das camadas
  const isSearching = searchQuery.trim() !== '';
  const filteredLayers = LAYERS.filter(layer =>
    layer.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Botão flutuante (Menu Hamburguer) quando o painel está colapsado */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-4 left-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 p-2.5 rounded-lg shadow-xl hover:text-slate-900 transition-all z-[1002] flex items-center justify-center"
          title="Expandir painel de camadas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Painel Principal */}
      <div
        className={`bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden transition-all duration-300 shadow-xl relative z-[1001] ${
          isPanelOpen ? 'w-[300px]' : 'w-0 border-r-0'
        }`}
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h1 className="text-sm font-bold text-slate-800">
                Paranapiacaba WebGIS
              </h1>
            </div>

            {/* Botão de recolher */}
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-slate-400 hover:text-slate-800 p-1 rounded hover:bg-slate-100 transition-colors"
              title="Recolher painel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
              {activeCount} camadas ativas
            </span>
            <button
              onClick={onOpenAbout}
              className="text-slate-450 hover:text-slate-800 hover:underline uppercase tracking-wider"
            >
              Sobre
            </button>
          </div>
        </div>

        {/* Predefinições temáticas (mapas prontos) */}
        {onApplyPreset && (
          <div className="px-3 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Mapas temáticos
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onApplyPreset(p)}
                  title={p.description}
                  className="flex items-center gap-1 px-2 py-1 rounded-full border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50 text-[10px] font-bold text-slate-600 hover:text-emerald-700 transition-colors"
                >
                  <span aria-hidden>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Barra de Busca */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar camada..."
            className="w-full bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors pr-8"
          />
          {isSearching ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 text-slate-400 hover:text-slate-700 p-1"
              title="Limpar busca"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <svg className="absolute right-6 w-3.5 h-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Lista de Grupos (Accordion ou Flat) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {isSearching ? (
            /* Resultados de Busca (Flat list) */
            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/20 p-2 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 pb-1 border-b border-slate-200">
                Resultados ({filteredLayers.length})
              </div>
              {filteredLayers.length === 0 ? (
                <div className="text-xs italic text-slate-500 text-center py-4">
                  Nenhuma camada encontrada
                </div>
              ) : (
                filteredLayers.map(layer => (
                  <LayerItem
                    key={layer.id}
                    layer={layer}
                    isActive={activeLayers.has(layer.id)}
                    onToggle={onToggle}
                    currentZoom={currentZoom}
                    isGroupExpanded={true}
                    onOpenTable={onOpenTable}
                    onZoomToLayer={onZoomToLayer}
                  />
                ))
              )}
            </div>
          ) : (
            /* Layout Accordion Padrão */
            GROUPS.map((group) => {
              const isExpanded = !!expandedGroups[group];
              const groupLayers = LAYERS.filter(layer => layer.group === group);
              const opacity = groupOpacities[group] !== undefined ? groupOpacities[group] : 100;
              const meta = groupMeta(group);

              // Contagem de camadas ativas no grupo
              const activeInGroup = groupLayers.filter(layer => activeLayers.has(layer.id)).length;
              const hasActiveLayers = activeInGroup > 0;

              return (
                <div
                  key={group}
                  className="border border-slate-200 border-l-4 rounded-lg overflow-hidden bg-slate-50/20"
                  style={{ borderLeftColor: meta.accent }}
                >
                  {/* Header do Grupo */}
                  <div className="group/header w-full flex flex-col px-3 py-2 bg-slate-100/50 hover:bg-slate-100/80 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleGroup(group)}
                        className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                      >
                        <svg
                          className={`w-3.5 h-3.5 text-slate-400 transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="text-sm flex-shrink-0" aria-hidden>{meta.icon}</span>
                        <span
                          className="text-[11px] font-bold tracking-wide uppercase truncate"
                          style={{ color: meta.accent }}
                        >
                          {group}
                        </span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
                          hasActiveLayers
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}>
                          {activeInGroup}/{groupLayers.length}
                        </span>
                      </button>

                      {/* Botões de Ação Rápida (Ativar / Limpar) — sempre visíveis */}
                      <div className="flex items-center space-x-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
                        <button
                          onClick={() => onToggleAllInGroup(group, true)}
                          className="hover:text-emerald-600 transition-colors"
                          title="Ativar todas as camadas do grupo"
                        >
                          Ativar
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => onToggleAllInGroup(group, false)}
                          className="hover:text-rose-600 transition-colors"
                          title="Desativar todas as camadas do grupo"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    {/* Slider de Opacidade - Visível apenas se houver camadas ativas no grupo */}
                    {hasActiveLayers && (
                      <div
                        className="mt-2 flex items-center space-x-2 bg-white p-1.5 rounded border border-slate-200 animate-fade-in"
                        onClick={(e) => e.stopPropagation()} // Impede que o clique no controle recolha o accordion
                      >
                        <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">
                          Opacidade:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={opacity}
                          onChange={(e) => onGroupOpacityChange(group, parseInt(e.target.value))}
                          className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-[9px] font-semibold text-slate-500 w-6 text-right">
                          {opacity}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Camadas do Grupo */}
                  {isExpanded && (
                    <div className="p-1 space-y-0.5 bg-white/40">
                      {groupLayers.map((layer) => (
                        <LayerItem
                          key={layer.id}
                          layer={layer}
                          isActive={activeLayers.has(layer.id)}
                          onToggle={onToggle}
                          currentZoom={currentZoom}
                          isGroupExpanded={isExpanded}
                          onOpenTable={onOpenTable}
                          onZoomToLayer={onZoomToLayer}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé institucional */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
          <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">
            FAPESP PUC-CAMPINAS &copy; 2026
          </span>
        </div>
      </div>
    </>
  );
}
