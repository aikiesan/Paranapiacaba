import React from 'react';

const ICON_EXTERNAL = 'M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14';

/**
 * Lista de fontes de uma camada/raster (ver config/sources.js): portal com
 * link, conjunto de dados de origem e nota. `compact` é a versão do painel de
 * camadas; a normal serve ao painel da feição e ao anexo de fontes.
 */
export function SourceList({ sources, compact = false }) {
  if (!sources || sources.length === 0) return null;
  const text = compact ? 'text-[10px]' : 'text-[11px]';

  return (
    <div className={`${text} leading-snug text-stone-600`}>
      <span className={`block uppercase tracking-wider font-bold text-stone-400 ${compact ? 'text-[9px]' : 'text-[10px]'} mb-0.5`}>
        {sources.length > 1 ? 'Fontes' : 'Fonte'}
      </span>
      <ul className="space-y-1">
        {sources.map((source, index) => (
          <li key={`${source.key}-${index}`}>
            {source.url ? (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-start gap-1 font-semibold text-forest-700 hover:text-forest-900 underline decoration-forest-300 underline-offset-2"
                title={source.url}
              >
                <span>{source.name}</span>
                <svg className="w-3 h-3 mt-px flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_EXTERNAL} />
                </svg>
              </a>
            ) : (
              <span className="font-semibold text-stone-700">{source.name}</span>
            )}
            {source.org && <span className="text-stone-500"> · {source.org}</span>}
            {source.dataset && (
              <span className="block text-stone-500">
                Arquivo de origem: <span className="font-mono text-[0.95em] text-stone-600 break-words">{source.dataset}</span>
              </span>
            )}
            {source.url && source.portalUrl && source.url !== source.portalUrl && (
              <a
                href={source.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-stone-500 hover:text-forest-700 underline decoration-stone-300 underline-offset-2"
              >
                Portal: {source.short}
              </a>
            )}
            {source.note && <span className="block italic text-stone-500">{source.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
