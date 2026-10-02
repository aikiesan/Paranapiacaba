import React from 'react';
import { PRESET_FAMILIES, presetsByFamily } from '../config/presets';

// Aba "Mapas prontos" do painel lateral: composições curadas de camadas
// (pranchas do dossiê, sínteses temáticas e as 4 escalas de navegação).
// Um clique liga as camadas, troca o mapa de fundo e enquadra o mapa.
export function PresetList({ activePresetId, onApplyPreset }) {
  return (
    <div className="p-3 space-y-4">
      <p className="text-[11px] text-stone-500 leading-relaxed px-1">
        Comece por aqui: cada mapa pronto liga as camadas certas e enquadra a região. Depois, ajuste na aba <strong className="text-stone-700">Camadas</strong>.
      </p>
      {PRESET_FAMILIES.map((family) => (
        <section key={family.id} className="space-y-1.5" aria-label={family.label}>
          <div className="px-1">
            <h2 className="text-[13px] font-bold font-serif text-stone-800 leading-tight">{family.label}</h2>
            <p className="text-[10px] text-stone-400">{family.hint}</p>
          </div>
          {presetsByFamily(family.id).map((preset) => {
            const isActive = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onApplyPreset(preset)}
                aria-pressed={isActive}
                className={`w-full flex items-start gap-2.5 text-left p-2.5 rounded-lg border transition-colors ${
                  isActive
                    ? 'border-forest-400 bg-forest-50 ring-1 ring-forest-200'
                    : 'border-paper-line bg-white hover:border-forest-300 hover:bg-forest-50/50'
                }`}
              >
                <span aria-hidden className="text-lg leading-6 shrink-0">{preset.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-xs font-bold leading-snug ${isActive ? 'text-forest-800' : 'text-stone-800'}`}>
                    {preset.label}
                  </span>
                  {preset.description && (
                    <span className="block text-[10px] text-stone-500 leading-snug mt-0.5 line-clamp-2">
                      {preset.description}
                    </span>
                  )}
                  <span className="block text-[9px] font-bold uppercase tracking-wider text-stone-400 mt-1">
                    {preset.layers.length} camadas{preset.targetScale ? ` · ${preset.targetScale}` : ''}
                    {isActive && <span className="text-forest-600"> · no mapa</span>}
                  </span>
                </span>
              </button>
            );
          })}
        </section>
      ))}
    </div>
  );
}
