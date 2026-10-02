import React, { useEffect, useRef, useState } from 'react';
import { CARTOGRAPHIC_MAPS } from '../data/mapsIndex';

const primaryTabs = [
  { id: 'home', label: 'Início', icon: '🏛️' },
  { id: 'map', label: 'Mapa SIG Interativo', shortLabel: 'Mapa', icon: '🗺️' },
  { id: 'ferrovia', label: 'Memória Ferroviária', shortLabel: 'Ferrovia', icon: '🚂' },
  { id: 'trilhas', label: 'Rede de Trilhas', shortLabel: 'Trilhas', icon: '🥾' },
];

const secondaryTabs = [
  { id: 'campo', label: 'Levantamento de Campo', icon: '📋' },
  { id: 'hidraulica', label: 'Sistema Hidráulico', icon: '🌊' },
  { id: 'legislacao', label: 'Legislação', icon: '📐' },
];

// Menu "Mais" com os módulos secundários. Fica fora da faixa rolável das abas
// para que o dropdown não seja recortado pelo overflow.
function MoreModulesMenu({ activeTab, onTabChange, collectionLinks }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const activeSecondary = secondaryTabs.find((tab) => tab.id === activeTab);

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

  return (
    <div ref={menuRef} className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-label="Mais módulos"
        aria-expanded={isOpen}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
          activeSecondary
            ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
            : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#EFE9DF]'
        }`}
      >
        {activeSecondary ? (
          <>
            <span>{activeSecondary.icon}</span>
            <span className="hidden sm:inline">{activeSecondary.label}</span>
          </>
        ) : (
          <span>Mais</span>
        )}
        <svg className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-60 bg-[#FAF7F2] border border-[#E7E0D3] rounded-lg shadow-xl py-1.5 z-[1200] animate-fade-in"
        >
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#78716C]">
            Módulos temáticos
          </div>
          {secondaryTabs.map((tab) => (
            <button
              key={tab.id}
              role="menuitem"
              onClick={() => {
                onTabChange(tab.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#EFE9DF] text-[#78350F] font-bold'
                  : 'text-[#44403C] hover:bg-[#EFE9DF] hover:text-[#1C1917] font-medium'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
          {/* No celular os acervos saem do cabeçalho e entram aqui */}
          <div className="sm:hidden border-t border-[#E7E0D3] mt-1.5 pt-1.5">
            {collectionLinks.map((link) => (
              <button
                key={link.label}
                role="menuitem"
                onClick={() => {
                  link.onClick();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs text-[#44403C] hover:bg-[#EFE9DF] hover:text-[#1C1917] font-medium"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function HeaderNav({ activeTab, onTabChange, onOpenAbout, onOpenGallery, onOpenPhotoGallery }) {
  const collectionLinks = [
    { label: 'Acervo Fotográfico', icon: '📸', onClick: onOpenPhotoGallery },
    { label: 'Pranchas A0', icon: '📐', onClick: onOpenGallery },
    { label: 'Sobre o projeto', icon: 'ℹ️', onClick: onOpenAbout },
  ];

  return (
    <header className="h-14 md:h-16 bg-[#FAF7F2] text-[#1C1917] flex items-center gap-3 px-3 md:px-6 border-b border-[#E7E0D3] flex-shrink-0 z-[1100] shadow-xs font-serif">
      {/* Título & Marca do Projeto Estilo Acervo Histórico */}
      <button
        onClick={() => onTabChange('home')}
        className="hidden sm:flex items-center gap-3 group select-none flex-shrink-0 min-w-0 text-left"
        title="Voltar ao início"
      >
        <div className="w-9 h-9 rounded-md bg-[#8C5E3C]/10 border border-[#8C5E3C]/30 flex items-center justify-center text-[#8C5E3C] group-hover:bg-[#8C5E3C]/20 transition-colors flex-shrink-0">
          <span className="text-lg">🚂</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-bold text-sm md:text-base tracking-tight text-[#1C1917] leading-tight whitespace-nowrap group-hover:text-[#8C5E3C] transition-colors font-serif">
            Paranapiacaba
          </span>
          <span className="hidden xl:block text-[10px] text-[#78350F] font-sans font-semibold tracking-wider uppercase leading-tight whitespace-nowrap">
            São Paulo Railway (1867) · FAPESP / PUC-Campinas
          </span>
        </div>
      </button>

      {/* Abas principais + menu de módulos secundários */}
      <div className="flex-1 flex items-center justify-center gap-1 md:gap-2 min-w-0 font-sans">
        <nav className="flex items-center gap-1 md:gap-1.5 overflow-x-auto no-scrollbar min-w-0">
          {primaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                title={tab.label}
                className={`flex items-center gap-1.5 px-2.5 md:px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
                    : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#EFE9DF]'
                }`}
              >
                <span>{tab.icon}</span>
                {/* No celular só a aba ativa mostra o nome; em telas médias, o rótulo curto */}
                <span className={`${isActive ? 'inline' : 'hidden md:inline'} xl:hidden`}>
                  {tab.shortLabel || tab.label}
                </span>
                <span className="hidden xl:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
        <MoreModulesMenu activeTab={activeTab} onTabChange={onTabChange} collectionLinks={collectionLinks} />
      </div>

      {/* Acervos e Sobre */}
      <div className="hidden sm:flex items-center gap-1.5 md:gap-2 font-sans flex-shrink-0">
        <button
          onClick={onOpenPhotoGallery}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-md text-xs font-bold text-[#1E3A2F] hover:text-[#0F281E] bg-[#E6F4EA] transition-all border border-[#A8DABC] whitespace-nowrap"
          title="Acervo Fotográfico de Campo & Iconografia"
        >
          <span>📸</span>
          <span className="hidden lg:inline">Fotos</span>
        </button>

        <button
          onClick={onOpenGallery}
          className="flex items-center gap-1.5 px-2.5 md:px-3 py-1.5 rounded-md text-xs font-bold text-[#78350F] hover:text-[#451A03] bg-[#FEF3C7]/60 hover:bg-[#FEF3C7] transition-all border border-[#F59E0B]/30 whitespace-nowrap"
          title={`${CARTOGRAPHIC_MAPS.length} Pranchas Cartográficas A0 e Relatórios`}
        >
          <span>📐</span>
          <span className="hidden lg:inline">Pranchas A0</span>
        </button>

        <button
          onClick={onOpenAbout}
          className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold text-[#44403C] hover:text-[#1C1917] bg-[#EFE9DF] hover:bg-[#E7E0D3] transition-colors border border-[#D6CEBE]"
          title="Sobre o projeto"
        >
          <span>ℹ️</span>
          <span className="hidden lg:inline">Sobre</span>
        </button>
      </div>
    </header>
  );
}
