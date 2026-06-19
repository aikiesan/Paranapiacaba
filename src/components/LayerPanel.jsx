import React, { useState, useEffect } from 'react';
import { LAYERS, GROUPS } from '../config/layers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { PALETTE } from '../config/styleGuide';

// Componente para item de camada individual, lidando com seu próprio hook de dados
function LayerItem({ layer, isActive, onToggle, currentZoom, isGroupExpanded }) {
  // Carrega o GeoJSON se o grupo estiver expandido (para contar features) ou se a camada estiver ativa no mapa
  const shouldLoad = isGroupExpanded || isActive;
  const { loading, error, featureCount } = useGeoJSON(layer.file, shouldLoad, layer.available);
  
  const [showDescription, setShowDescription] = useState(false);
  const isZoomRestricted = currentZoom < layer.minZoom;

  return (
    <div className="flex flex-col border-b border-slate-800/30 last:border-b-0 py-1.5 px-2">
      <div className={`group/layer flex items-center justify-between transition-opacity ${
        isZoomRestricted ? 'opacity-55' : 'opacity-100'
      }`}>
        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
          {/* Spinner de Loading */}
          {loading ? (
            <div className="w-3.5 h-3.5 flex items-center justify-center">
              <div className="w-2.5 h-2.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <input
              type="checkbox"
              checked={isActive}
              onChange={() => onToggle(layer.id)}
              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 focus:ring-offset-slate-900 cursor-pointer"
            />
          )}

          {/* Bullet colorido */}
          <span 
            className="w-3 h-3 rounded-sm flex-shrink-0 border border-slate-900/30"
            style={{ backgroundColor: layer.color || '#ccc' }}
          />

          <span 
            onClick={() => onToggle(layer.id)}
            className="text-xs font-medium text-slate-300 group-hover/layer:text-slate-100 transition-colors truncate cursor-pointer select-none"
            title={layer.label}
          >
            {layer.label}
          </span>

          {/* Badge de Contagem de Features */}
          {featureCount !== null && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {featureCount}
            </span>
          )}
        </div>

        {/* Controles de Info, Restrição de Zoom e Erro */}
        <div className="flex items-center space-x-1.5 ml-2">
          {/* Botão de Info */}
          {layer.description && (
            <button
              onClick={() => setShowDescription(!showDescription)}
              className={`p-0.5 rounded text-slate-500 hover:text-slate-200 transition-colors ${
                showDescription ? 'text-slate-200 bg-slate-800' : ''
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
              <svg className="w-4 h-4 text-rose-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="absolute right-0 bottom-6 hidden group-hover/err:block bg-rose-950 text-rose-200 text-[10px] font-bold px-2 py-1 rounded-md border border-rose-800 shadow-xl whitespace-nowrap z-[1050]">
                Arquivo não encontrado
              </div>
            </div>
          )}

          {/* Restrição de Zoom */}
          {isZoomRestricted && !error && (
            <div className="relative flex items-center group/tooltip">
              <svg className="w-3.5 h-3.5 text-amber-500/80 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="absolute right-0 bottom-6 hidden group-hover/tooltip:block bg-slate-950 text-slate-200 text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-800 shadow-xl whitespace-nowrap z-[1050]">
                Visível a partir do zoom {layer.minZoom} (Zoom atual: {currentZoom})
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Descrição Inline */}
      {showDescription && layer.description && (
        <div className="mt-1.5 p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 leading-relaxed animate-fade-in">
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
  onOpenAbout
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
          className="absolute top-4 left-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-200 p-2.5 rounded-lg shadow-2xl hover:text-white transition-all z-[1002] flex items-center justify-center"
          title="Expandir painel de camadas"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Painel Principal */}
      <div
        className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden transition-all duration-300 shadow-2xl relative z-[1001] ${
          isPanelOpen ? 'w-[300px]' : 'w-0 border-r-0'
        }`}
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <h1 className="text-sm font-bold text-slate-100">
                Paranapiacaba WebGIS
              </h1>
            </div>
            
            {/* Botão de recolher */}
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-slate-500 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
              title="Recolher painel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] font-semibold">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-900/50 px-2 py-0.5 rounded-full">
              {activeCount} active layers
            </span>
            <button 
              onClick={onOpenAbout}
              className="text-slate-400 hover:text-white hover:underline uppercase tracking-wider"
            >
              Sobre
            </button>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center gap-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar camada..."
            className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs px-3 py-1.5 rounded focus:outline-none focus:border-emerald-600 transition-colors pr-8"
          />
          {isSearching ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-6 text-slate-500 hover:text-slate-350 p-1"
              title="Limpar busca"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <svg className="absolute right-6 w-3.5 h-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>

        {/* Lista de Grupos (Accordion ou Flat) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {isSearching ? (
            /* Resultados de Busca (Flat list) */
            <div className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/20 p-2 space-y-1">
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-2 pb-1 border-b border-slate-800">
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

              // Verifica se o grupo tem camadas ativas
              const hasActiveLayers = groupLayers.some(layer => activeLayers.has(layer.id));

              return (
                <div 
                  key={group} 
                  className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/20"
                >
                  {/* Header do Grupo */}
                  <div className="group/header w-full flex flex-col px-3 py-2 bg-slate-950/50 hover:bg-slate-950/80 transition-colors">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleGroup(group)}
                        className="flex items-center gap-1.5 text-left flex-1 min-w-0"
                      >
                        <svg
                          className={`w-3.5 h-3.5 text-slate-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="text-[11px] font-bold text-slate-300 tracking-wider uppercase truncate">
                          {group}
                        </span>
                      </button>

                      {/* Botões de Ação Rápida (Ativar / Desativar tudo) - Visíveis apenas no hover */}
                      <div className="hidden group-hover/header:flex items-center space-x-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        <button
                          onClick={() => onToggleAllInGroup(group, true)}
                          className="hover:text-emerald-500 transition-colors"
                          title="Ativar todas as camadas do grupo"
                        >
                          Ativar
                        </button>
                        <span>|</span>
                        <button
                          onClick={() => onToggleAllInGroup(group, false)}
                          className="hover:text-rose-500 transition-colors"
                          title="Desativar todas as camadas do grupo"
                        >
                          Limpar
                        </button>
                      </div>
                    </div>

                    {/* Slider de Opacidade - Visível apenas se houver camadas ativas no grupo */}
                    {hasActiveLayers && (
                      <div 
                        className="mt-2 flex items-center space-x-2 bg-slate-900/60 p-1.5 rounded border border-slate-800/40 animate-fade-in"
                        onClick={(e) => e.stopPropagation()} // Impede que o clique no controle recolha o accordion
                      >
                        <span className="text-[9px] uppercase tracking-wide text-slate-500 font-bold">
                          Opacidade:
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={opacity}
                          onChange={(e) => onGroupOpacityChange(group, parseInt(e.target.value))}
                          className="flex-1 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                        <span className="text-[9px] font-semibold text-slate-400 w-6 text-right">
                          {opacity}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Camadas do Grupo */}
                  {isExpanded && (
                    <div className="p-1 space-y-0.5 bg-slate-900/10">
                      {groupLayers.map((layer) => (
                        <LayerItem
                          key={layer.id}
                          layer={layer}
                          isActive={activeLayers.has(layer.id)}
                          onToggle={onToggle}
                          currentZoom={currentZoom}
                          isGroupExpanded={isExpanded}
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
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
          <span className="text-[9px] text-slate-600 font-bold tracking-wider uppercase">
            FAPESP PUC-CAMPINAS &copy; 2026
          </span>
        </div>
      </div>
    </>
  );
}
