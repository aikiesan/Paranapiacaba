import React, { useMemo, useState } from 'react';
import { GLOSSARY, GLOSSARY_GROUPS } from '../data/glossary';
import { Icon, SheetHeader, SheetPage, SheetSection } from './archive';

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Folha 08: o glossário completo, por assunto, com busca.
export function GlossaryPage() {
  const [query, setQuery] = useState('');
  const matches = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return GLOSSARY;
    return GLOSSARY.filter((entry) => normalize(`${entry.term} ${entry.text}`).includes(q));
  }, [query]);

  return (
    <SheetPage sheetId="glossario">
      <SheetHeader
        sheetId="glossario"
        kicker="Para ler o atlas"
        title="Glossário"
        lede="As palavras da ferrovia, do patrimônio, da água e do mapa que aparecem neste portal, explicadas para quem chega agora."
        meta={[
          { label: 'Termos', value: GLOSSARY.length },
          { label: 'Assuntos', value: GLOSSARY_GROUPS.length },
        ]}
      />

      <label className="flex items-center gap-2 border-b-2 border-ink pb-2 mb-12 max-w-md">
        <Icon name="search" className="w-4 h-4 text-ink-500" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Procurar uma palavra…"
          className="flex-1 bg-transparent font-serif text-lg placeholder:text-ink-400 focus:outline-none"
          aria-label="Procurar no glossário"
        />
      </label>

      {matches.length === 0 && (
        <p className="font-serif text-ink-600 mb-16">Nenhum termo encontrado para “{query}”.</p>
      )}

      {GLOSSARY_GROUPS.map((group, index) => {
        const entries = matches.filter((entry) => entry.group === group.id);
        if (entries.length === 0) return null;
        return (
          <SheetSection key={group.id} no={['I', 'II', 'III', 'IV'][index]} title={group.label}>
            <dl className="grid md:grid-cols-2 gap-x-10">
              {entries.map((entry) => (
                <div key={entry.id} id={`termo-${entry.id}`} className="py-4 border-b border-ink/15">
                  <dt className="font-display text-xl leading-tight">{entry.term}</dt>
                  <dd className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-1.5">{entry.text}</dd>
                </div>
              ))}
            </dl>
          </SheetSection>
        );
      })}
    </SheetPage>
  );
}
