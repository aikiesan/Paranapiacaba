import React, { useState } from 'react';
import { LAYERS, GROUPS } from '../config/layers';

export function LayerPanel({ activeLayers, onToggle, currentZoom }) {
  // Controle de painel expandido/colapsado como um todo
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  
  // Estado local para os grupos expandidos (inicia com todos abertos)
  const [expandedGroups, setExpandedGroups] = useState(
    GROUPS.reduce((acc, group) => ({ ...acc, [group]: true }), {})
  );

  // Alterna a expansão de um grupo
  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  return (
    <div className="relative h-screen flex flex-shrink-0 z-[1001]">
      {/* Botão de Toggle do Painel Lateral */}
      <button
        onClick={() => setIsPanelOpen(!isPanelOpen)}
        className="absolute top-4 -right-10 bg-slate-900 border border-slate-700/60 border-l-0 text-slate-300 p-2 rounded-r-lg shadow-lg hover:text-white hover:bg-slate-800 transition-colors z-[1002]"
        title={isPanelOpen ? "Colapsar painel" : "Expandir painel"}
      >
        <svg
          className={`w-5 h-5 transform transition-transform duration-300 ${isPanelOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Container Principal do Painel */}
      <div
        className={`bg-slate-900 border-r border-slate-800 flex flex-col h-full overflow-hidden transition-all duration-300 shadow-2xl ${
          isPanelOpen ? 'w-[290px]' : 'w-0 border-r-0'
        }`}
      >
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col gap-1">
          <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            WebGIS Paranapiacaba
          </h1>
          <p className="text-xs text-slate-400">Projeto FAPESP / PUC-Campinas</p>
        </div>

        {/* Lista de Grupos (Accordion) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
          {GROUPS.map((group) => {
            const isExpanded = expandedGroups[group];
            const groupLayers = LAYERS.filter(layer => layer.group === group);

            return (
              <div 
                key={group} 
                className="border border-slate-800/80 rounded-lg overflow-hidden bg-slate-950/20"
              >
                {/* Header do Grupo */}
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-slate-950/50 hover:bg-slate-800/40 text-left transition-colors"
                >
                  <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
                    {group}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-500 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Camadas do Grupo */}
                {isExpanded && (
                  <div className="p-2 space-y-1 bg-slate-900/10">
                    {groupLayers.map((layer) => {
                      const isActive = activeLayers.has(layer.id);
                      const isZoomRestricted = currentZoom < layer.minZoom;

                      return (
                        <div
                          key={layer.id}
                          className={`group/layer flex items-center justify-between px-2 py-1.5 rounded transition-all ${
                            isZoomRestricted ? 'opacity-55' : 'hover:bg-slate-800/45'
                          }`}
                        >
                          <label className="flex items-center space-x-2.5 cursor-pointer flex-1 select-none">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => onToggle(layer.id)}
                              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-700 bg-slate-800 focus:ring-offset-slate-900 cursor-pointer"
                            />
                            
                            {/* Bullet colorido conforme o tipo de geometria */}
                            <span 
                              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 border border-slate-900/20`}
                              style={{ backgroundColor: layer.color }}
                            />

                            <span className="text-xs font-medium text-slate-300 group-hover/layer:text-slate-100 transition-colors">
                              {layer.label}
                            </span>
                          </label>

                          {/* Indicador de minZoom restrito */}
                          {isZoomRestricted && (
                            <div className="relative flex items-center group/tooltip ml-2">
                              <svg
                                className="w-4 h-4 text-amber-500/80 cursor-help"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                              </svg>
                              
                              {/* Tooltip */}
                              <div className="absolute right-0 bottom-6 hidden group-hover/tooltip:block bg-slate-950 text-slate-200 text-[10px] font-semibold px-2 py-1.5 rounded-md border border-slate-800 shadow-xl whitespace-nowrap z-[1005]">
                                Visível a partir do zoom {layer.minZoom} (Zoom atual: {currentZoom})
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Rodapé institucional */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
          <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
            FAPESP PUC-CAMPINAS &copy; 2026
          </span>
        </div>
      </div>
    </div>
  );
}
