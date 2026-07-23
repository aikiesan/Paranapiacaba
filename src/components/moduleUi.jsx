import React from 'react';

// Elementos de UI compartilhados pelos módulos temáticos do portal (Campo,
// Hidráulica, Legislação e Memória Ferroviária), para uma aparência consistente.

// Cabeçalho padrão de um módulo: faixa escura com selo, título, resumo e uma
// chamada para ação (abrir a prancha correspondente no Mapa SIG).
export function ModuleHeader({ badge, badgeIcon = '📘', title, subtitle, cta }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl p-6 shadow-lg border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1.5">
        {badge && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <span>{badgeIcon}</span> {badge}
          </div>
        )}
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {cta && (
        <button
          onClick={cta.onClick}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-md transition-all whitespace-nowrap"
        >
          <span>🗺️</span>
          <span>{cta.label}</span>
        </button>
      )}
    </div>
  );
}

// Cartão de seção branco com título e ícone.
export function ModuleSection({ icon, title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 space-y-4 ${className}`}>
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
        {icon && <span>{icon}</span>} {title}
      </h2>
      {children}
    </div>
  );
}

// Cartão informativo compacto, opcionalmente com faixa de cor à esquerda e
// um botão "ver no mapa".
export function InfoCard({ icon, title, accent, children, action }) {
  return (
    <div
      className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 border-l-4 space-y-1.5 flex flex-col"
      style={{ borderLeftColor: accent || '#cbd5e1' }}
    >
      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
        {icon && <span>{icon}</span>} {title}
      </div>
      <p className="text-xs text-slate-600 leading-relaxed flex-1">{children}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-1 self-start text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
        >
          {action.label} &rarr;
        </button>
      )}
    </div>
  );
}

// Contêiner de página de um módulo (scroll + largura máxima centralizada).
export function ModulePage({ children }) {
  return (
    <div className="flex-1 h-full overflow-y-auto bg-slate-100 p-4 md:p-6 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-6">{children}</div>
    </div>
  );
}
