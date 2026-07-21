import React from 'react';
import { ModulePage, ModuleHeader, ModuleSection, InfoCard } from './moduleUi';

// Módulo: Sistema Hidráulico dos Ingleses & Bacias.
// Síntese da engenharia hídrica britânica de Paranapiacaba e do seu contexto
// no divisor de águas da Serra do Mar (UGRHI 6 x UGRHI 7).
export function SistemaHidraulicoPanel({ onNavigateToMapWithPreset }) {
  const componentes = [
    { icon: '🌿', title: 'Captação de nascentes', accent: '#0070C0', desc: 'Surgências da escarpa canalizadas para abastecer a Vila e alimentar as caldeiras a vapor do sistema funicular.' },
    { icon: '🛢️', title: 'Caixas d\'água históricas', accent: '#0EA5E9', desc: 'Reservatórios elevados em alvenaria e ferro que garantiam pressão e regularidade ao abastecimento da vila operária.' },
    { icon: '🌉', title: 'Aquedutos e adutoras', accent: '#0369A1', desc: 'Condutos que transpõem a topografia acidentada, levando a água das cotas altas às áreas edificadas.' },
    { icon: '🧩', title: 'Manilhas cerâmicas', accent: '#B45309', desc: 'Tubulação em grês e cerâmica da rede original — testemunho material da tecnologia sanitária do século XIX.' },
    { icon: '🚿', title: 'Rede de esgotamento', accent: '#64748B', desc: 'Drenagem sanitária pelas vielas, precursora do saneamento planejado no Brasil.' },
    { icon: '💦', title: 'APPs de córregos e nascentes', accent: '#A9D08E', desc: 'Faixas de preservação permanente que protegem os corpos hídricos que estruturam a Vila.' },
  ];

  return (
    <ModulePage>
      <ModuleHeader
        badge="Engenharia Hídrica Britânica & Recursos Hídricos"
        badgeIcon="🌊"
        title="Sistema Hidráulico dos Ingleses & Bacias"
        subtitle="Captação de nascentes, caixas d'água históricas e aquedutos da São Paulo Railway, cruzados com as bacias hidrográficas UGRHI 6 (Alto Tietê) e UGRHI 7 (Baixada Santista)."
        cta={{ label: 'Ver Rede Hídrica no Mapa SIG', onClick: () => onNavigateToMapWithPreset('prancha_hidrica_redes') }}
      />

      {/* Divisor de águas */}
      <ModuleSection icon="⛰️" title="Divisor de Águas da Serra do Mar">
        <p className="text-xs text-slate-500 leading-relaxed">
          Paranapiacaba assenta-se sobre o divisor entre duas grandes vertentes. Poucos metros
          definem se a água segue para o interior (Tietê) ou desce a escarpa rumo ao litoral (Cubatão).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 border-l-4 border-l-cyan-600 bg-cyan-50/40 p-4 space-y-1">
            <div className="text-xs font-black text-cyan-800 uppercase tracking-wide">UGRHI 6 — Alto Tietê</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vertente interior que drena para o sistema Billings e o Tietê. Manancial estratégico
              de abastecimento da Região Metropolitana de São Paulo.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 border-l-4 border-l-teal-700 bg-teal-50/40 p-4 space-y-1">
            <div className="text-xs font-black text-teal-800 uppercase tracking-wide">UGRHI 7 — Baixada Santista</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vertente marítima que desce a Serra pelo Rio Cubatão até o estuário de Santos —
              trajeto histórico do funicular e das águas da escarpa.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateToMapWithPreset('ambiente')}
          className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors"
        >
          Abrir camadas de sub-bacias e nascentes no mapa &rarr;
        </button>
      </ModuleSection>

      {/* Componentes do sistema */}
      <ModuleSection icon="🔧" title="Componentes do Sistema Hidráulico Histórico">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {componentes.map((c) => (
            <InfoCard key={c.title} icon={c.icon} title={c.title} accent={c.accent}>
              {c.desc}
            </InfoCard>
          ))}
        </div>
      </ModuleSection>

      {/* Nota de leitura */}
      <ModuleSection icon="📖" title="Leitura Integrada">
        <p className="text-xs text-slate-600 leading-relaxed">
          O abastecimento de Paranapiacaba não foi um sistema isolado: a água movia as máquinas,
          servia à vila e ordenava o traçado urbano pelas cotas do terreno. Reconstituir essa
          rede — nascentes, adutoras, reservatórios e drenagem — é essencial para o diagnóstico
          de conservação e para a narrativa de valor universal excepcional da candidatura UNESCO.
        </p>
      </ModuleSection>
    </ModulePage>
  );
}
