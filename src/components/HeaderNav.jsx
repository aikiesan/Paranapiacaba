import React, { useEffect, useRef, useState } from 'react';
import { CARTOGRAPHIC_MAPS } from '../data/mapsIndex';
import { SHEETS, sheetOf } from '../data/sheets';
import { ClockTowerMark, Icon } from './archive';

// Folhas com aba própria no cabeçalho; as demais ficam no menu "Mais".
const PRIMARY_IDS = ['home', 'map', 'ferrovia', 'trilhas'];
const PRIMARY = PRIMARY_IDS.map(sheetOf);
const SECONDARY = SHEETS.filter((sheet) => !PRIMARY_IDS.includes(sheet.id));

function MoreMenu({ activeTab, onTabChange, annexLinks }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const activeSecondary = SECONDARY.find((sheet) => sheet.id === activeTab);

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
    };
    const onKey = (event) => event.key === 'Escape' && setIsOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  const item = (key, no, label, hint, onClick, isActive) => (
    <button
      key={key}
      role="menuitem"
      onClick={() => {
        onClick();
        setIsOpen(false);
      }}
      className={`w-full grid grid-cols-[2rem_1fr] items-baseline gap-1 px-4 py-2 text-left transition-colors ${
        isActive ? 'bg-ink/[0.06]' : 'hover:bg-ink/[0.04]'
      }`}
    >
      <span className={`font-display text-sm tabular ${isActive ? 'text-signal' : 'text-ink-400'}`}>{no}</span>
      <span>
        <span className={`font-display text-[15px] leading-tight block ${isActive ? 'text-signal' : 'text-ink'}`}>{label}</span>
        {hint && <span className="font-serif text-[12px] text-ink-500 leading-snug block">{hint}</span>}
      </span>
    </button>
  );

  return (
    <div ref={menuRef} className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-label="Mais folhas e anexos"
        aria-expanded={isOpen}
        className={`relative flex items-center gap-1 px-2.5 md:px-3 h-14 md:h-16 text-[13px] transition-colors ${
          activeSecondary ? 'text-ink font-semibold' : 'text-ink-600 hover:text-ink'
        }`}
      >
        <span>{activeSecondary ? activeSecondary.label : 'Mais'}</span>
        <Icon name="chevronDown" className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        {activeSecondary && <span className="absolute left-2 right-2 bottom-0 h-[3px] bg-signal" />}
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 top-full w-72 bg-paper border border-ink/40 shadow-[5px_5px_0_rgba(35,27,21,0.10)] py-2 z-[1200] animate-fade-in">
          <div className="caps text-[9px] text-ink-500 px-4 pb-1.5">Folhas temáticas</div>
          {SECONDARY.map((sheet) => item(sheet.id, sheet.no, sheet.title, sheet.summary, () => onTabChange(sheet.id), activeTab === sheet.id))}
          <div className="border-t border-ink/15 mt-2 pt-2">
            <div className="caps text-[9px] text-ink-500 px-4 pb-1.5">Anexos</div>
            {annexLinks.map((link) => item(link.label, link.no, link.label, link.hint, link.onClick, false))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderNav({ activeTab, onTabChange, onOpenAbout, onOpenGallery, onOpenPhotoGallery }) {
  const annexLinks = [
    { no: 'A', label: 'Arquivo de imagens', hint: 'Desenhos da SPR e processos de tombamento', onClick: onOpenPhotoGallery },
    { no: 'B', label: `${CARTOGRAPHIC_MAPS.length} pranchas A0`, hint: 'Os mapas finais do projeto', onClick: onOpenGallery },
    { no: 'C', label: 'Sobre o projeto', hint: 'Equipe, fontes e créditos', onClick: onOpenAbout },
  ];

  return (
    <header className="h-14 md:h-16 bg-paper text-ink flex items-stretch gap-2 md:gap-4 px-3 md:px-6 border-b border-ink/20 flex-shrink-0 z-[1100]">
      {/* Marca */}
      <button
        onClick={() => onTabChange('home')}
        className="hidden sm:flex items-center gap-2.5 group select-none flex-shrink-0 text-left"
        title="Voltar ao início"
      >
        <ClockTowerMark className="w-8 h-8 md:w-9 md:h-9 text-ink group-hover:text-signal transition-colors" />
        <span className="flex flex-col">
          <span className="font-display text-lg md:text-xl leading-none tracking-tight">Paranapiacaba</span>
          <span className="hidden lg:block caps text-[8.5px] text-ink-500 mt-1">Arquivo do sítio ferroviário · SPR 1867</span>
        </span>
      </button>

      {/* Abas: sublinhado vermelho na folha atual, como uma cota */}
      <div className="flex-1 flex items-stretch justify-center sm:justify-end gap-0.5 md:gap-1 min-w-0">
        <nav className="flex items-stretch overflow-x-auto no-scrollbar min-w-0" aria-label="Folhas principais">
          {PRIMARY.map((sheet) => {
            const isActive = activeTab === sheet.id;
            return (
              <button
                key={sheet.id}
                onClick={() => onTabChange(sheet.id)}
                aria-current={isActive ? 'page' : undefined}
                title={sheet.title}
                className={`relative flex items-center gap-1.5 px-2.5 md:px-3.5 text-[13px] whitespace-nowrap flex-shrink-0 transition-colors ${
                  isActive ? 'text-ink font-semibold' : 'text-ink-600 hover:text-ink'
                }`}
              >
                <span className="hidden md:inline font-display text-[11px] text-ink-400 tabular">{sheet.no}</span>
                <span>{sheet.label}</span>
                {isActive && <span className="absolute left-2 right-2 bottom-0 h-[3px] bg-signal" />}
              </button>
            );
          })}
        </nav>
        <MoreMenu activeTab={activeTab} onTabChange={onTabChange} annexLinks={annexLinks} />
      </div>
    </header>
  );
}
