import React, { useState } from 'react';
import { PRESETS, PRESET_FAMILIES, presetsByFamily } from '../config/presets';
import { useOnEscape } from '../hooks/useOnEscape';

// Controle flutuante das predefinições temáticas, ancorado no canto superior
// esquerdo do mapa. Ficava no topo da barra lateral, onde doze botões
// empurravam a árvore de camadas para fora da tela.
export function ThematicPresets({ activePresetId, onApplyPreset }) {
  const [isOpen, setIsOpen] = useState(false);
  useOnEscape(isOpen, () => setIsOpen(false));

  const activePreset = PRESETS.find((preset) => preset.id === activePresetId) || null;

  const handlePick = (preset) => {
    onApplyPreset(preset);
    setIsOpen(false);
  };

  return (
    <div className="export-hide absolute top-4 left-4 z-[1000] flex flex-col items-start gap-2">
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        title="Mapas temáticos — composições prontas de camadas"
        className={`flex items-center gap-2 pl-2.5 pr-3 py-2 rounded-lg border shadow-md backdrop-blur-md text-xs font-bold transition-colors ${
          isOpen || activePreset
            ? 'bg-emerald-600 border-emerald-700 text-white'
            : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-white hover:border-emerald-400 hover:text-emerald-700'
        }`}
      >
        <span aria-hidden className="text-base leading-none">
          {activePreset ? activePreset.icon : '🗂️'}
        </span>
        <span className="max-w-[11rem] truncate">
          {activePreset ? activePreset.label : 'Mapas temáticos'}
        </span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Mapas temáticos"
          className="w-[19rem] max-w-[calc(100vw-2rem)] max-h-[70vh] overflow-y-auto custom-scrollbar bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-xl p-3 space-y-3"
        >
          {PRESET_FAMILIES.map((family) => (
            <div key={family.id}>
              <div className="px-1 mb-1.5">
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {family.label}
                </div>
                <div className="text-[10px] text-slate-400">{family.hint}</div>
              </div>

              <div className="space-y-1">
                {presetsByFamily(family.id).map((preset) => {
                  const isActive = preset.id === activePresetId;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePick(preset)}
                      title={preset.description}
                      className={`w-full flex items-start gap-2 text-left px-2 py-1.5 rounded-lg border transition-colors ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-transparent hover:border-emerald-300 hover:bg-emerald-50/60'
                      }`}
                    >
                      <span aria-hidden className="text-sm leading-5 shrink-0">
                        {preset.icon}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[11px] font-bold leading-tight ${
                            isActive ? 'text-emerald-700' : 'text-slate-700'
                          }`}
                        >
                          {preset.label}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {preset.layers.length} camadas
                          {preset.targetScale ? ` · ${preset.targetScale}` : ''}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
