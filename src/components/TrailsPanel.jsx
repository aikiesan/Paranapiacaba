import React, { useState } from 'react';

export function TrailsPanel({ onNavigateToMapWithPreset }) {
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  const [difficultyFilter, setDifficultyFilter] = useState('Todas');

  const trailCategories = [
    { name: 'Oficiais Subprefeitura', count: 12, km: 68, color: 'border-[#15803D] text-[#15803D] bg-[#15803D]/10', desc: 'Trilhas manejadas e monitoradas pela Subprefeitura de Paranapiacaba.' },
    { name: 'Registradas (Wikiloc)', count: 18, km: 412, color: 'border-[#EAB308] text-[#78350F] bg-[#FEF3C7]', desc: 'Mapeamento colaborativo de montanhismo e travessias registradas por usuários.' },
    { name: 'Técnicas da Ferrovia', count: 8, km: 95, color: 'border-[#7E22CE] text-[#7E22CE] bg-[#7E22CE]/10', desc: 'Servidão de manutenção da via permanente, linhas de energia e aquedutos ingleses.' },
    { name: 'Caminhos Históricos', count: 7, km: 218, color: 'border-[#D97706] text-[#D97706] bg-[#D97706]/10', desc: 'Rotas históricas de tropeiros e conexões intermunicipais (ex: Caminho do Sal).' },
  ];

  const highlightedTrails = [
    { name: 'Trilha dos Mirantes & Nascentes', km: 4.8, type: 'Circuito Monitorado', difficulty: 'Fácil', category: 'Oficiais Subprefeitura', desc: 'Percurso oficial monitorado dentro do Parque Natural Municipal Nascentes de Paranapiacaba com mirantes históricos.' },
    { name: 'Trilha da Pontinha & Poço Formoso', km: 6.2, type: 'Circuito Monitorado', difficulty: 'Moderada', category: 'Oficiais Subprefeitura', desc: 'Percurso guiado pela vegetação primária da Mata Atlântica até poços naturais de banho.' },
    { name: 'Caminho do Funicular & Grota Funda', km: 14.2, type: 'Servidão Técnica', difficulty: 'Interdito', category: 'Técnicas da Ferrovia', desc: 'Traçado dos 5 Planos Inclinados da São Paulo Railway (1867) — Sítio Histórico Industrial sob Interdição.' },
    { name: 'Servidão de Aquedutos & Caixas d\'Água', km: 8.5, type: 'Manutenção Hidráulica', difficulty: 'Difícil', category: 'Técnicas da Ferrovia', desc: 'Acesso técnico aos reservatórios e encanamentos de ferro fundido instalados pelos ingleses.' },
    { name: 'Caminho do Sal (Zanzalá ao Pilar)', km: 53.5, type: 'Caminho Histórico', difficulty: 'Moderada', category: 'Caminhos Históricos', desc: 'Rota quinhentista de tropeiros ligando a Baixada Santista e Paranapiacaba a Ribeirão Pires.' },
    { name: 'Travessia Mogi-Bertioga (Quatinga)', km: 28.1, type: 'Travessia Wikiloc', difficulty: 'Difícil', category: 'Registradas (Wikiloc)', desc: 'Percurso de crista registrado no Wikiloc ao longo do divisor de águas da Serra do Mar.' },
  ];

  const filteredTrails = highlightedTrails.filter((t) => {
    const matchReg = selectedRegion === 'Todas' || t.region.includes(selectedRegion);
    const matchDiff = difficultyFilter === 'Todas' || t.difficulty === difficultyFilter;
    return matchReg && matchDiff;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF7F2] text-[#1C1917] p-6 md:p-8 space-y-8 custom-scrollbar font-serif">
      {/* Cabeçalho */}
      <div className="max-w-5xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#2D4A3E]/10 text-[#2D4A3E] text-xs font-sans font-bold uppercase tracking-widest border border-[#2D4A3E]/20">
          <span>🥾 Guia & Atlas de Campo FAPESP</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-[#1C1917] font-serif">
          Rede de Trilhas & Patrimônio Natural da Serra do Mar
        </h1>
        <p className="text-sm md:text-base font-sans text-[#44403C] leading-relaxed text-justify max-w-3xl">
          Mapeamento canônico consolidado a partir de <strong className="text-[#1C1917]">45 tracks de GPS (KML/Wikiloc)</strong> e 1.329 Pontos de Interesse (POIs). Totaliza <span className="text-[#2D4A3E] font-semibold">~780 km de percursos</span> catalogados no entorno de Paranapiacaba e nos limites dos Parques da Serra do Mar.
        </p>
      </div>

      {/* As 4 Categorias Oficiais de Trilhas */}
      <div className="max-w-5xl mx-auto space-y-4 font-sans">
        <h2 className="text-xs font-bold text-[#78716C] uppercase tracking-widest font-serif">
          Categorias de Trilhas & Servidões Técnicas (Diretriz FAPESP 2026)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {trailCategories.map((cat, i) => (
            <div
              key={i}
              onClick={() => setSelectedRegion(selectedRegion === cat.name ? 'Todas' : cat.name)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${cat.color} ${
                selectedRegion === cat.name ? 'ring-2 ring-[#78350F] shadow-sm' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-bold truncate">{cat.name}</div>
              <div className="text-2xl font-black font-serif mt-1">{cat.count} <span className="text-xs font-sans font-normal">percursos</span></div>
              <div className="text-[11px] text-[#57534E] font-mono mt-0.5">{cat.km} km totais</div>
              <p className="text-[11px] text-[#57534E] mt-2 line-clamp-2 leading-tight">{cat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros e Lista de Trilhas Principais */}
      <div className="max-w-5xl mx-auto space-y-6 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#F4EFE6] p-4 rounded-xl border border-[#E7E0D3]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#57534E] uppercase">Filtrar Dificuldade:</span>
            {['Todas', 'Fácil', 'Moderada', 'Difícil'].map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  difficultyFilter === d
                    ? 'bg-[#2D4A3E] text-[#FAF7F2]'
                    : 'bg-[#FAF7F2] text-[#57534E] hover:bg-[#EFE9DF] border border-[#E7E0D3]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigateToMapWithPreset('prancha_trilhas_wikiloc')}
            className="px-4 py-2 rounded-md bg-[#2D4A3E] hover:bg-[#1E3A2F] text-[#FAF7F2] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <span>🗺️ Visualizar no Mapa SIG</span>
          </button>
        </div>

        {/* Cards de Trilhas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTrails.map((t, idx) => (
            <div key={idx} className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl p-5 space-y-3 hover:border-[#2D4A3E] transition-all shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-[#FAF7F2] text-[#2D4A3E] border border-[#E7E0D3]">
                    {t.type} · {t.km} km
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#1C1917] mt-1.5">{t.name}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  t.difficulty === 'Fácil' ? 'bg-[#E6F4EA] text-[#1E3A2F] border border-[#A8DABC]' :
                  t.difficulty === 'Moderada' ? 'bg-[#FEF3C7] text-[#78350F] border border-[#F59E0B]/30' :
                  'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]'
                }`}>
                  {t.difficulty}
                </span>
              </div>

              <p className="text-xs text-[#57534E] leading-relaxed">{t.desc}</p>

              <div className="pt-2 border-t border-[#E7E0D3] flex items-center justify-between text-[11px] text-[#78716C] font-medium">
                <span>Cluster: {t.region}</span>
                <button
                  onClick={() => onNavigateToMapWithPreset('prancha_trilhas_wikiloc')}
                  className="text-[#2D4A3E] font-bold hover:underline"
                >
                  Ver no Mapa &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
