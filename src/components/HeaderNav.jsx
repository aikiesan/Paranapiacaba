import React from 'react';

export function HeaderNav({ activeTab, onTabChange, onOpenAbout, onOpenGallery, onOpenPhotoGallery }) {
  const primaryTabs = [
    { id: 'home', label: 'Início', icon: '🏛️' },
    { id: 'map', label: 'Mapa SIG Interativo', icon: '🗺️' },
    { id: 'ferrovia', label: 'Memória Ferroviária', icon: '🚂' },
    { id: 'trilhas', label: 'Rede de Trilhas', icon: '🥾' },
  ];

  const secondaryTabs = [
    { id: 'campo', label: 'Levantamento de Campo', icon: '📋' },
    { id: 'hidraulica', label: 'Sistema Hidráulico', icon: '🌊' },
    { id: 'legislacao', label: 'Legislação', icon: '📐' },
  ];

  return (
    <header className="h-16 bg-[#FAF7F2] text-[#1C1917] flex items-center justify-between px-4 md:px-8 border-b border-[#E7E0D3] flex-shrink-0 z-[1100] shadow-xs font-serif">
      {/* Título & Marca do Projeto Estilo Acervo Histórico */}
      <div 
        onClick={() => onTabChange('home')}
        className="flex items-center space-x-3.5 cursor-pointer group select-none"
      >
        <div className="w-9 h-9 rounded-md bg-[#8C5E3C]/10 border border-[#8C5E3C]/30 flex items-center justify-center text-[#8C5E3C] group-hover:bg-[#8C5E3C]/20 transition-colors">
          <span className="text-lg">🚂</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm md:text-base tracking-tight text-[#1C1917] leading-none group-hover:text-[#8C5E3C] transition-colors font-serif">
            Estação & Memória Paranapiacaba
          </span>
          <span className="text-[10px] text-[#78350F] font-sans font-semibold tracking-wider uppercase mt-1">
            São Paulo Railway (1867) · FAPESP / PUC-Campinas
          </span>
        </div>
      </div>

      {/* Tabs Principais de Navegação Editorial */}
      <nav className="flex items-center space-x-1 md:space-x-2 overflow-x-auto custom-scrollbar py-1 font-sans">
        {primaryTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
                  : 'text-[#44403C] hover:text-[#1C1917] hover:bg-[#EFE9DF]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}

        {/* Submenu de Módulos Específicos */}
        <div className="hidden lg:flex items-center space-x-1 pl-2 border-l border-[#D6CEBE]">
          {secondaryTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-[#EFE9DF] text-[#78350F] font-bold'
                    : 'text-[#78716C] hover:text-[#292524] hover:bg-[#EFE9DF]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Botões de Ação Tradicionais (Fotos + Acervo A0 + Sobre) */}
      <div className="flex items-center space-x-2 font-sans">
        <button
          onClick={onOpenPhotoGallery}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-[#1E3A2F] hover:text-[#0F281E] bg-[#E6F4EA] transition-all border border-[#A8DABC]"
          title="Ver Acervo Fotográfico de Campo & Iconografia"
        >
          <span>📸</span>
          <span className="hidden sm:inline">Acervo Fotográfico</span>
        </button>

        <button
          onClick={onOpenGallery}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-bold text-[#78350F] hover:text-[#451A03] bg-[#FEF3C7]/60 hover:bg-[#FEF3C7] transition-all border border-[#F59E0B]/30"
          title="Ver 26 Pranchas Cartográficas A0 e Relatórios"
        >
          <span>📐</span>
          <span className="hidden sm:inline">26 Pranchas A0</span>
        </button>

        <button
          onClick={onOpenAbout}
          className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-bold text-[#44403C] hover:text-[#1C1917] bg-[#EFE9DF] hover:bg-[#E7E0D3] transition-colors border border-[#D6CEBE]"
        >
          <span>ℹ️</span>
          <span>Sobre</span>
        </button>
      </div>
    </header>
  );
}
