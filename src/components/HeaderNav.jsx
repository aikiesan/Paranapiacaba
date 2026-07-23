import React from 'react';

export function HeaderNav({ activeTab, onTabChange, onOpenAbout, onOpenGallery }) {
  const tabs = [
    { id: 'map', label: 'Mapa SIG Interativo', icon: '🗺️' },
    { id: 'ferrovia', label: 'Memória Ferroviária', icon: '🚂' },
    { id: 'campo', label: 'Levantamento de Campo', icon: '📋' },
    { id: 'hidraulica', label: 'Sistema Hidráulico', icon: '🌊' },
    { id: 'legislacao', label: 'Legislação & Planos', icon: '📐' },
  ];

  return (
    <header className="h-12 bg-slate-900 text-slate-100 flex items-center justify-between px-3 md:px-4 border-b border-slate-800 flex-shrink-0 z-[1100]">
      {/* Título do Projeto */}
      <div className="flex items-center space-x-2.5">
        <span className="text-lg">🚂</span>
        <div className="flex flex-col">
          <span className="font-bold text-xs md:text-sm tracking-wide text-white leading-none">
            WEBGIS PARANAPIACABA
          </span>
          <span className="text-[9px] text-emerald-400 font-semibold tracking-wider uppercase">
            FAPESP · PUC-CAMPINAS
          </span>
        </div>
      </div>

      {/* Tabs de Navegação de Módulos */}
      <nav className="flex items-center space-x-1 md:space-x-1.5 overflow-x-auto custom-scrollbar py-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Botões de Ações (Acervo + Sobre) */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onOpenGallery}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/80 hover:bg-emerald-900 transition-colors border border-emerald-800"
          title="Ver 26 Pranchas Cartográficas A0 e Relatórios"
        >
          <span>📐</span>
          <span className="hidden sm:inline">Acervo A0</span>
        </button>

        <button
          onClick={onOpenAbout}
          className="hidden md:flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
        >
          <span>ℹ️</span>
          <span>Sobre</span>
        </button>
      </div>
    </header>
  );
}
