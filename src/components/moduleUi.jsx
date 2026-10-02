import React from 'react';
import { Icon } from './archive';

// Peças compartilhadas pelas folhas temáticas (Água, Campo, Proteção).
// A estrutura de página vem de ./archive (SheetPage, SheetHeader, SheetSection).

// Grade de verbetes com filete divisor, sem cartões arredondados.
export function EntryGrid({ children, cols = 'md:grid-cols-3' }) {
  return <div className={`grid sm:grid-cols-2 ${cols} gap-px bg-ink/20 border border-ink/20`}>{children}</div>;
}

// Verbete: faixa de cor (a mesma da simbologia do mapa), título e texto.
export function Entry({ title, kicker, accent, children, action }) {
  return (
    <div className="bg-paper p-4 md:p-5 flex flex-col">
      {accent && <span className="block w-8 h-[3px] mb-3" style={{ backgroundColor: accent }} />}
      {kicker && <span className="caps text-[9px] text-ink-500">{kicker}</span>}
      <h3 className="font-display text-lg md:text-xl leading-tight">{title}</h3>
      <p className="font-serif text-[0.93rem] leading-relaxed text-ink-600 mt-1.5 flex-1">{children}</p>
      {action && (
        <button onClick={action.onClick} className="mt-3 self-start inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800">
          <Icon name="map" className="w-3.5 h-3.5" /> {action.label}
        </button>
      )}
    </div>
  );
}
