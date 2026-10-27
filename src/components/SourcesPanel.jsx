import React, { useMemo } from 'react';
import { useOnEscape } from '../hooks/useOnEscape';
import { LAYERS } from '../config/layers';
import { SOURCES, LAYER_SOURCES, RASTER_SOURCES, LEGISLATION_SOURCES, REFERENCE_SOURCES } from '../config/sources';
import { ClockTowerMark, Icon } from './archive';

const RASTER_LABELS = {
  coverage: 'Cobertura do solo MapBiomas (aba Históricos)',
  orthophoto: 'Fundo "Ortofoto 2010"',
};

// Para cada portal, onde ele é usado no atlas: camadas, rasters e cartas.
function buildCatalog() {
  const uses = new Map(Object.keys(SOURCES).map((key) => [key, []]));
  const add = (key, label, entry) => {
    if (!uses.has(key)) return;
    uses.get(key).push({ label, dataset: entry.dataset || null, url: entry.url || null });
  };

  LAYERS.forEach((layer) => {
    (LAYER_SOURCES[layer.id] || []).forEach((entry) => add(entry.source, layer.label, entry));
  });
  Object.entries(RASTER_LABELS).forEach(([id, label]) => {
    (RASTER_SOURCES[id] || []).forEach((entry) => add(entry.source, label, entry));
  });
  add(REFERENCE_SOURCES.historical.source, 'Cartas históricas (aba Históricos)', REFERENCE_SOURCES.historical);
  Object.entries(LEGISLATION_SOURCES).forEach(([municipality, entry]) => {
    add(entry.source, `Anexos de lei — ${municipality} (aba Históricos)`, entry);
  });

  return Object.entries(SOURCES)
    .map(([key, source]) => ({ key, ...source, uses: uses.get(key) }))
    .filter((source) => source.uses.length > 0);
}

// Anexo D: todas as fontes de dados do atlas, com link e o que vem de cada uma.
export function SourcesPanel({ isOpen, onClose }) {
  useOnEscape(isOpen, onClose);
  const catalog = useMemo(buildCatalog, []);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-ink/60 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Fontes dos dados"
    >
      <div
        className="w-full max-w-2xl paper-grain border border-ink/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-ink/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClockTowerMark className="w-10 h-10" />
            <div>
              <div className="caps text-[9px] text-signal">Anexo D</div>
              <h2 className="font-display text-3xl leading-none mt-0.5">Fontes dos dados</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 -m-1 text-ink-500 hover:text-ink" aria-label="Fechar">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-4">
          <p className="font-serif text-[0.95rem] leading-relaxed text-ink-700">
            De onde vem cada camada do atlas. Os links levam à página consultada: a do próprio conjunto de dados quando o portal tem uma, senão a página do portal. Fontes internas da equipe não têm endereço público.
          </p>

          <ol className="space-y-3">
            {catalog.map((source) => (
              <li key={source.key} className="double-rule bg-paper px-3 py-2.5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  {source.url ? (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="ink-link font-semibold text-[13px] text-ink">
                      {source.name} ↗
                    </a>
                  ) : (
                    <span className="font-semibold text-[13px] text-ink">{source.name}</span>
                  )}
                  <span className="caps text-[9px] text-ink-500">{source.org}</span>
                </div>
                {source.note && <p className="text-[11px] italic text-ink-500 mt-0.5">{source.note}</p>}
                <ul className="mt-1.5 space-y-0.5 text-[11px] leading-snug text-ink-700">
                  {source.uses.map((use, index) => (
                    <li key={`${use.label}-${index}`} className="pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-signal">
                      <span className="font-semibold">{use.label}</span>
                      {use.dataset && <span className="text-ink-500"> · <span className="font-mono text-[10px]">{use.dataset}</span></span>}
                      {use.url && (
                        <a href={use.url} target="_blank" rel="noopener noreferrer" className="ink-link text-ink-600 ml-1">
                          documento ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>

        <div className="px-6 py-3 border-t border-ink/20 text-[11px] text-ink-500">
          Cada camada também mostra sua fonte no painel de camadas (ícone ⓘ) e ao clicar numa feição no mapa.
        </div>
      </div>
    </div>
  );
}
