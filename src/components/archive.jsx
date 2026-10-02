import React, { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { SHEETS, neighbours, sheetOf } from '../data/sheets';
import { glossaryEntry } from '../data/glossary';
import { webImage } from '../data/photoArchiveIndex';
import { assetUrl } from '../utils/assetUrl';

// Kit visual das páginas do portal, a partir das pranchas da São Paulo Railway
// guardadas no arquivo: cartucho de título, versal espaçada, filetes, cotas e
// o lápis vermelho das anotações. Nada de emoji: ícones de traço único.

// Navegação compartilhada (mudar de folha, abrir o arquivo numa imagem, ir ao
// mapa com um mapa pronto), para que termos e figuras funcionem em qualquer
// página sem repassar props por toda a árvore.
export const PortalNav = createContext({
  navigate: () => {},
  openArchive: () => {},
  openMap: () => {},
});
export const usePortalNav = () => useContext(PortalNav);

// ── Ícones ──────────────────────────────────────────────────────────────────
const ICONS = {
  map: 'M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Zm0 0v13.5m6-11v13.5',
  rail: 'M8 3 5 21M16 3l3 18M6.3 15h11.4M6.9 10.5h10.2M7.5 6h9',
  book: 'M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5v-13Zm8 .5v13',
  archive: 'M3.5 5h17v4h-17zM5 9v10h14V9M10 13h4',
  drawing: 'M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5M12 4V2',
  document: 'M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6',
  trail: 'M5 20c3-1 2-5 5-6s5 1 7-2 1-6 2-8M5 20h.01M19 4h.01',
  water: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z',
  shield: 'M12 3 4.5 6v5.5c0 4.5 3.2 8 7.5 9.5 4.3-1.5 7.5-5 7.5-9.5V6L12 3Z',
  clipboard: 'M9 4h6v3H9zM7 5.5H5.5V21h13V5.5H17M8.5 12l2 2 4-4',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm3.5-12.5-2 5-5 2 2-5 5-2Z',
  arrowRight: 'M5 12h14m-5-5 5 5-5 5',
  arrowLeft: 'M19 12H5m5-5-5 5 5 5',
  close: 'M6 6l12 12M18 6 6 18',
  chevronDown: 'm6 9 6 6 6-6',
  chevronLeft: 'm15 6-6 6 6 6',
  chevronRight: 'm9 6 6 6-6 6',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm5-2 4 4',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-11v6m0-9h.01',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2',
  layers: 'm12 4 8.5 4.5L12 13 3.5 8.5 12 4Zm-8.5 8L12 16.5l8.5-4.5M3.5 15.5 12 20l8.5-4.5',
  image: 'M4 5h16v14H4zM4 16l4.5-4.5 3.5 3.5 2.5-2.5L20 17M15.5 9.5h.01',
  mountain: 'm3 19 6.5-11 4 6.5 2-3L21 19H3Z',
};

export function Icon({ name, className = 'w-4 h-4', strokeWidth = 1.6 }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

// Marca do portal: a torre do relógio da estação, como no corte da Raiz Station.
export function ClockTowerMark({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 1.8v2.4" strokeLinecap="round" />
      <path d="M10.5 9.5 16 4.2l5.5 5.3" />
      <path d="M9.6 9.5h12.8v1.6H9.6z" />
      <rect x="10.6" y="11.1" width="10.8" height="10.6" />
      <circle cx="16" cy="16.4" r="3.6" />
      <path d="M16 14.4v2l1.4 1" strokeLinecap="round" />
      <path d="M9.6 21.7h12.8v1.4H9.6z" />
      <path d="M11.2 23.1v7.1h9.6v-7.1" />
      <path d="M14 30.2v-3.8h4v3.8M5 30.2h22" strokeLinecap="round" />
    </svg>
  );
}

// ── Botões ──────────────────────────────────────────────────────────────────
// Verde sempre leva ao mapa: a mesma cor em todas as folhas ensina o gesto.
export function MapButton({ onClick, children, size = 'md', className = '' }) {
  const sizes = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 bg-forest-700 hover:bg-forest-800 text-paper font-semibold rounded-sm transition-colors ${sizes} ${className}`}
    >
      <Icon name="map" className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{children}</span>
    </button>
  );
}

export function InkButton({ onClick, children, icon = 'arrowRight', variant = 'solid', className = '' }) {
  const styles = variant === 'solid'
    ? 'bg-ink hover:bg-ink-700 text-paper border-ink'
    : 'bg-transparent hover:bg-ink/5 text-ink border-ink/40 hover:border-ink';
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border rounded-sm transition-colors ${styles} ${className}`}
    >
      <span>{children}</span>
      {icon && <Icon name={icon} className="w-4 h-4" />}
    </button>
  );
}

// ── Estrutura de página ─────────────────────────────────────────────────────
export function SheetPage({ children, sheetId }) {
  const scrollRef = useRef(null);
  // Ao trocar de folha, recomeça do topo (o contêiner é reaproveitado).
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [sheetId]);
  return (
    <div ref={scrollRef} className="flex-1 h-full overflow-y-auto custom-scrollbar paper-grain text-ink select-text">
      <div className="max-w-5xl mx-auto px-5 md:px-8 pt-8 md:pt-12 pb-10">{children}</div>
      {sheetId && <NextStops current={sheetId} />}
      <Colophon />
    </div>
  );
}

// Cartucho de título, como o canto de uma prancha da SPR.
export function SheetHeader({ sheetId, kicker, title, lede, meta = [], children }) {
  const sheet = sheetOf(sheetId);
  return (
    <header className="mb-12 md:mb-16">
      <div className="flex items-center justify-between gap-4 text-[10px] text-ink-500 caps">
        <span>
          {sheet && <>Folha {sheet.no} <span className="text-ink-300">/ {String(SHEETS.length).padStart(2, '0')}</span></>}
          {kicker && <span className="text-signal"> · {kicker}</span>}
        </span>
        <span className="hidden sm:inline">São Paulo Railway · Arquivo do sítio</span>
      </div>
      <div className="track text-ink mt-3 mb-8" />
      <h1 className="font-display text-[2.6rem] leading-[1.02] md:text-7xl md:leading-[0.98] tracking-tight text-ink max-w-4xl">
        {title}
      </h1>
      {lede && (
        <p className="font-serif text-lg md:text-xl leading-relaxed text-ink-600 mt-5 max-w-2xl">{lede}</p>
      )}
      {(meta.length > 0 || children) && (
        <div className="mt-8 flex flex-col md:flex-row md:items-end gap-5 md:gap-8">
          {meta.length > 0 && (
            <dl className="double-rule grid grid-cols-2 sm:grid-flow-col sm:auto-cols-fr bg-paper/70 flex-1 max-w-2xl">
              {meta.map((item, index) => (
                <div
                  key={item.label}
                  className={`px-3 py-2.5 border-ink/25 sm:border-t-0 ${index % 2 ? 'border-l' : ''} ${index > 1 ? 'border-t' : ''} ${index > 0 ? 'sm:border-l' : 'sm:border-l-0'}`}
                >
                  <dt className="caps text-[9px] text-ink-500">{item.label}</dt>
                  <dd className="font-display text-base md:text-lg leading-tight mt-0.5 tabular">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
          {children && <div className="flex flex-wrap gap-2.5">{children}</div>}
        </div>
      )}
    </header>
  );
}

// Seção numerada, com o número em lápis vermelho.
export function SheetSection({ no, title, intro, id, children, className = '' }) {
  return (
    <section id={id} className={`mb-14 md:mb-20 scroll-mt-6 ${className}`}>
      <div className="flex items-baseline gap-3 mb-1">
        {no && <span className="font-display italic text-signal text-xl md:text-2xl tabular">{no}</span>}
        <h2 className="font-display text-2xl md:text-[2rem] leading-tight text-ink">{title}</h2>
      </div>
      <div className="dim-rule text-ink mt-3 mb-5" />
      {intro && <p className="font-serif text-base md:text-[1.05rem] leading-relaxed text-ink-600 max-w-3xl mb-6">{intro}</p>}
      {children}
    </section>
  );
}

// Nota lateral para o leitor iniciante ("Para entender").
export function ReaderNote({ title = 'Para entender', children }) {
  return (
    <aside className="border-l-2 border-signal pl-4 py-1 my-6 max-w-3xl">
      <div className="caps text-[10px] text-signal mb-1">{title}</div>
      <div className="font-serif text-[0.95rem] leading-relaxed text-ink-700">{children}</div>
    </aside>
  );
}

// ── Glossário em linha ──────────────────────────────────────────────────────
export function Term({ id, children }) {
  const entry = glossaryEntry(id);
  const { navigate } = usePortalNav();
  const [open, setOpen] = useState(false);
  const [shift, setShift] = useState(0);
  const ref = useRef(null);
  const popRef = useRef(null);
  const popId = useId();

  // Mantém a explicação dentro da tela quando o termo está perto da borda.
  useEffect(() => {
    if (!open || !popRef.current) {
      setShift(0);
      return;
    }
    const rect = popRef.current.getBoundingClientRect();
    const overflow = rect.right - (window.innerWidth - 12);
    if (overflow > 0) setShift(-overflow);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => ref.current && !ref.current.contains(event.target) && setOpen(false);
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!entry) return <>{children}</>;
  return (
    <span ref={ref} className="relative inline">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={popId}
        className="term text-inherit font-inherit"
      >
        {children || entry.term}
      </button>
      {open && (
        <span
          ref={popRef}
          id={popId}
          role="note"
          style={shift ? { transform: `translateX(${shift}px)` } : undefined}
          className="absolute left-0 top-full mt-2 z-50 block w-72 max-w-[80vw] bg-paper border border-ink/70 shadow-[4px_4px_0_rgba(35,27,21,0.12)] p-3.5 text-left animate-fade-in"
        >
          <span className="caps text-[9px] text-signal block">Glossário</span>
          <span className="font-display text-lg leading-tight block mt-0.5 text-ink">{entry.term}</span>
          <span className="font-serif text-sm leading-relaxed text-ink-700 block mt-1.5 not-italic">{entry.text}</span>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate('glossario');
            }}
            className="caps text-[9px] text-ink-500 hover:text-signal mt-2.5 inline-flex items-center gap-1"
          >
            Todos os termos <Icon name="arrowRight" className="w-3 h-3" />
          </button>
        </span>
      )}
    </span>
  );
}

// ── Figura do arquivo ───────────────────────────────────────────────────────
export function ArchiveFigure({ photo, fig, size = 480, aspect = 'aspect-[4/3]', className = '', showCaption = true }) {
  const { openArchive } = usePortalNav();
  if (!photo) return null;
  return (
    <figure className={`group ${className}`}>
      <button
        type="button"
        onClick={() => openArchive(photo.id)}
        className="block w-full bg-paper-deep border border-ink/20 p-1.5 hover:border-ink/60 transition-colors"
        aria-label={`Ampliar: ${photo.title}`}
      >
        <span className={`block overflow-hidden ${aspect}`}>
          <img
            src={assetUrl(webImage(photo.src, size))}
            alt={photo.title}
            loading="lazy"
            className="archival-img w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
          />
        </span>
      </button>
      {showCaption && (
        <figcaption className="mt-2 text-[12px] leading-snug text-ink-600">
          {fig && <span className="caps text-[9px] text-signal mr-1.5">Fig. {fig}</span>}
          <span className="font-serif italic text-ink-700">{photo.title}</span>
          {(photo.date || photo.ref) && (
            <span className="block text-[11px] text-ink-400 mt-0.5 tabular">
              {[photo.date, photo.ref].filter(Boolean).join(' · ')}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

// ── Navegação de pé de página: a linha com as folhas como estações ─────────
export function NextStops({ current }) {
  const { navigate } = usePortalNav();
  const { prev, next } = neighbours(current);
  return (
    <nav aria-label="Folhas do portal" className="border-t border-ink/15 bg-paper-dark/60">
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8">
        <div className="caps text-[10px] text-ink-500 mb-4">Continue a viagem</div>
        <ol className="relative flex justify-between gap-1 overflow-x-auto no-scrollbar pb-1">
          <span className="absolute left-2 right-2 top-[7px] h-[3px] border-y border-ink/40" aria-hidden />
          {SHEETS.map((sheet) => {
            const isCurrent = sheet.id === current;
            return (
              <li key={sheet.id} className="relative flex-1 min-w-[4.25rem] flex flex-col items-center">
                <button
                  onClick={() => navigate(sheet.id)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <span className={`w-[17px] h-[17px] rounded-full border-2 transition-colors ${
                    isCurrent ? 'bg-signal border-signal' : 'bg-paper border-ink/60 group-hover:border-signal'
                  }`} />
                  <span className={`text-[11px] leading-tight text-center ${isCurrent ? 'text-signal font-semibold' : 'text-ink-600 group-hover:text-ink'}`}>
                    <span className="block tabular text-[9px] text-ink-400">{sheet.no}</span>
                    {sheet.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="grid grid-cols-2 gap-3 mt-7">
          {prev ? (
            <button onClick={() => navigate(prev.id)} className="text-left border border-ink/20 hover:border-ink/60 bg-paper px-4 py-3 transition-colors group">
              <span className="caps text-[9px] text-ink-500 flex items-center gap-1"><Icon name="arrowLeft" className="w-3 h-3" /> Folha anterior</span>
              <span className="font-display text-lg leading-tight block mt-1 group-hover:text-signal">{prev.title}</span>
            </button>
          ) : <span />}
          {next ? (
            <button onClick={() => navigate(next.id)} className="text-right border border-ink/20 hover:border-ink/60 bg-paper px-4 py-3 transition-colors group">
              <span className="caps text-[9px] text-ink-500 flex items-center justify-end gap-1">Próxima folha <Icon name="arrowRight" className="w-3 h-3" /></span>
              <span className="font-display text-lg leading-tight block mt-1 group-hover:text-signal">{next.title}</span>
              <span className="font-serif text-xs text-ink-500 block mt-0.5">{next.summary}</span>
            </button>
          ) : <span />}
        </div>
      </div>
    </nav>
  );
}

// Colofão: os créditos no formato de carimbo de prancha.
export function Colophon() {
  return (
    <footer className="border-t border-ink/15 px-5 md:px-8 py-6 text-[11px] text-ink-500">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ClockTowerMark className="w-7 h-7 text-ink-400" />
          <div className="leading-snug">
            <div className="font-display text-sm text-ink">Paranapiacaba · Arquivo do sítio ferroviário</div>
            <div>Projeto FAPESP · Equipe PUC-Campinas · SIRGAS 2000</div>
          </div>
        </div>
        <a href="https://github.com/aikiesan/Paranapiacaba" target="_blank" rel="noopener noreferrer" className="ink-link text-ink-600 hover:text-ink">
          Código e dados abertos no GitHub
        </a>
      </div>
    </footer>
  );
}
