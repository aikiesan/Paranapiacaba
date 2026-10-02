import React from 'react';
import { useOnEscape } from '../hooks/useOnEscape';
import { ClockTowerMark, Icon } from './archive';

// Anexo C: sobre o projeto, no formato do carimbo de uma prancha.
export function AboutPanel({ isOpen, onClose }) {
  useOnEscape(isOpen, onClose);
  if (!isOpen) return null;

  const credits = [
    ['Coordenação e execução', 'Equipe PUC-Campinas'],
    ['Fomento', 'FAPESP — Fundação de Amparo à Pesquisa do Estado de São Paulo'],
    ['Referência geodésica', 'SIRGAS 2000 (EPSG:4674)'],
    ['Fontes', 'IBGE, IPHAN, CONDEPHAAT, MapBiomas, DataGeo, Prefeitura de Santo André, Wikiloc'],
  ];

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-ink/60 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sobre o projeto"
    >
      <div
        className="w-full max-w-lg paper-grain border border-ink/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-5 pb-4 border-b border-ink/20 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClockTowerMark className="w-10 h-10" />
            <div>
              <div className="caps text-[9px] text-signal">Anexo C</div>
              <h2 className="font-display text-3xl leading-none mt-0.5">Sobre o projeto</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 -m-1 text-ink-500 hover:text-ink" aria-label="Fechar">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5 space-y-5">
          <p className="font-serif text-[1rem] leading-relaxed text-ink-700">
            Este atlas reúne o levantamento cartográfico do <strong className="font-semibold text-ink">corredor ferroviário Jundiaí–Santos</strong> (São Paulo Railway, 1867), com a <strong className="font-semibold text-ink">Vila de Paranapiacaba</strong>, em Santo André, como núcleo de detalhe. Serve à salvaguarda do sítio e à sua candidatura a Patrimônio Mundial da UNESCO.
          </p>
          <div>
            <h3 className="caps text-[9px] text-ink-500 mb-1.5">O que há no atlas</h3>
            <ul className="font-serif text-[0.95rem] leading-relaxed text-ink-700 space-y-1 list-none">
              {[
                'O corredor e as estações, a partir da malha ferroviária do IBGE.',
                'O patrimônio tombado nas três esferas, com as edificações e lotes da vila.',
                'Unidades de conservação, rios, nascentes e o divisor de águas da Serra.',
                'Equipamentos urbanos e dados do Censo IBGE dos municípios do corredor.',
                'Cartas históricas e mapas da legislação municipal, georreferenciados.',
              ].map((item) => (
                <li key={item} className="pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-signal">{item}</li>
              ))}
            </ul>
          </div>
          <dl className="double-rule bg-paper">
            {credits.map(([label, value], index) => (
              <div key={label} className={`grid grid-cols-[8.5rem_1fr] gap-3 px-3 py-2 ${index ? 'border-t border-ink/20' : ''}`}>
                <dt className="caps text-[9px] text-ink-500 pt-0.5">{label}</dt>
                <dd className="text-[12px] leading-snug text-ink-700">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="px-6 py-3 border-t border-ink/20 flex justify-between items-center text-[11px] text-ink-500">
          <span className="tabular">Versão 0.3 · outubro de 2026</span>
          <a href="https://github.com/aikiesan/Paranapiacaba" target="_blank" rel="noopener noreferrer" className="ink-link text-ink-700">
            Código no GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
