import React, { useState } from 'react';
import { LAYERS } from '../config/layers';
import { CONSERVATION_PALETTE, PALETTE, SLOPE_CLASSES } from '../config/styleGuide';
import { useIsMobile } from '../hooks/useIsMobile';

export function Legend({ activeLayers, buildingSymbologyMode = 'conservacao' }) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(() => !isMobile);

  // Filtra as camadas ativas
  const activeList = LAYERS.filter((layer) => activeLayers.has(layer.id));
  const isEdificacoesActive = activeLayers.has('edificacoes_vila');
  const isDeclividadeActive = activeLayers.has('declividade');

  return (
    <div className="pointer-events-auto w-[180px] md:w-[240px] bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg shadow-md overflow-hidden transition-all duration-300">
      {/* Cabeçalho com toggle */}
      <div 
        className="flex items-center justify-between px-3 py-2 bg-slate-50 cursor-pointer border-b border-slate-200 select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[10px] font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1">
          <span>🎨</span> Legenda IBGE
        </span>
        <button type="button" aria-label={isOpen ? 'Recolher legenda' : 'Expandir legenda'} className="text-slate-400 hover:text-slate-750 focus:outline-none transition-transform duration-200">
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
        <div className="p-3 space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar">
          {activeList.length === 0 ? (
            <div className="text-xs italic text-slate-400 py-1 text-center">
              Nenhuma camada ativa
            </div>
          ) : (
            <div className="space-y-2">
              {activeList.map((layer) => {
                const isHollow = layer.fillOpacity === 0;
                return (
                  <div key={layer.id} className="flex items-center space-x-2.5">
                    {/* Símbolo de acordo com o tipo */}
                    {layer.type === 'point' && (
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0 border border-slate-900/10 shadow-sm"
                        style={{ backgroundColor: layer.color }}
                      />
                    )}
                    {layer.type === 'line' && (
                      <div 
                        className="w-4.5 h-1.5 rounded-sm flex-shrink-0 shadow-sm"
                        style={{ 
                          backgroundColor: layer.color,
                          borderStyle: layer.id === 'rede_eletrica' ? 'dashed' : 'solid'
                        }}
                      />
                    )}
                    {layer.type === 'polygon' && (
                      <div 
                        className="w-3.5 h-3.5 rounded flex-shrink-0 shadow-sm"
                        style={{ 
                          borderColor: layer.color, 
                          backgroundColor: isHollow ? 'transparent' : `${layer.color}66`,
                          borderWidth: layer.weight > 0 ? '1.5px' : '0px',
                          borderStyle: layer.id === 'areas_envoltorias' ? 'dashed' : 'solid'
                        }}
                      />
                    )}
                    <span className="text-xs text-slate-600 font-semibold truncate" title={layer.label}>
                      {layer.label}
                    </span>
                  </div>
                );
              })}

              {/* Sub-legenda das Classes de Declividade */}
              {isDeclividadeActive && (
                <div className="mt-3 pt-2 border-t border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Declividade (5 classes)
                  </div>
                  <div className="space-y-1 text-[10px]">
                    {SLOPE_CLASSES.map(({ label, color }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm border border-slate-700/20" style={{ backgroundColor: color }} />
                        <span className="text-slate-600 truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-legenda dinâmica de Edificações se a camada estiver ativa */}
              {isEdificacoesActive && (
                <div className="mt-3 pt-2 border-t border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {buildingSymbologyMode === 'uso' ? 'Uso do Solo (1:1.000 IBGE)' : 'Conservação (Semáforo IBGE)'}
                  </div>
                  {buildingSymbologyMode === 'uso' ? (
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {[
                        ['Residencial', PALETTE.uso_residencial],
                        ['Comércio/Serviços', PALETTE.uso_comercial],
                        ['Público', PALETTE.uso_servicos],
                        ['Hotelaria/Turismo', PALETTE.uso_turismo_cultura],
                        ['Esporte', PALETTE.uso_esporte],
                        ['Uso misto', PALETTE.uso_misto],
                        ['Sem dados', PALETTE.uso_sem_dados],
                      ].map(([label, color]) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm border border-slate-700/40" style={{ backgroundColor: color }} />
                          <span className="text-slate-600 truncate">{label}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-1 text-[10px]">
                      {[
                        ['Conservado', CONSERVATION_PALETTE.conservado],
                        ['Mau estado', CONSERVATION_PALETTE.mau_estado],
                        ['Ruínas/Péssimo', CONSERVATION_PALETTE.ruinas],
                        ['Não avaliado', CONSERVATION_PALETTE.default],
                      ].map(([label, style]) => (
                        <div key={label} className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: style.fill, border: `1px solid ${style.stroke}` }} />
                          <span className="text-slate-600 truncate">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

