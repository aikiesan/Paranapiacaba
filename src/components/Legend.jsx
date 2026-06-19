import React, { useState } from 'react';
import { LAYERS } from '../config/layers';

export function Legend({ activeLayers }) {
  const [isOpen, setIsOpen] = useState(true);

  // Filtra as camadas ativas
  const activeList = LAYERS.filter((layer) => activeLayers.has(layer.id));

  return (
    <div className="absolute bottom-4 left-4 z-[1000] max-w-[240px] bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl overflow-hidden transition-all duration-300">
      {/* Cabeçalho com toggle */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-slate-800/80 cursor-pointer border-b border-slate-700/30 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
          Legenda
        </span>
        <button className="text-slate-400 hover:text-slate-200 focus:outline-none transition-transform duration-200">
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Conteúdo da legenda */}
      {isOpen && (
        <div className="p-3 space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
          {activeList.length === 0 ? (
            <div className="text-xs italic text-slate-500 py-1">
              Nenhuma camada visível
            </div>
          ) : (
            <div className="space-y-2">
              {activeList.map((layer) => (
                <div key={layer.id} className="flex items-center space-x-2.5">
                  {/* Símbolo de acordo com o tipo */}
                  {layer.type === 'point' && (
                    <div 
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-slate-900/40"
                      style={{ backgroundColor: layer.color }}
                    />
                  )}
                  {layer.type === 'line' && (
                    <div 
                      className="w-5 h-1.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: layer.color }}
                    />
                  )}
                  {layer.type === 'polygon' && (
                    <div 
                      className="w-4 h-4 rounded border flex-shrink-0"
                      style={{ 
                        borderColor: layer.color, 
                        backgroundColor: `${layer.color}25`, // Opacidade de 15% em hex
                        borderWidth: layer.weight > 0 ? '1.5px' : '0px'
                      }}
                    />
                  )}
                  <span className="text-xs text-slate-300 font-medium truncate" title={layer.label}>
                    {layer.label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
