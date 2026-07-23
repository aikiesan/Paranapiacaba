import React, { useState } from 'react';

export function TrailsPanel({ onNavigateToMapWithPreset }) {
  const [selectedRegion, setSelectedRegion] = useState('Todas');
  const [difficultyFilter, setDifficultyFilter] = useState('Todas');

  const trailRegions = [
    { name: 'Vale do Quilombo', count: 12, km: 251, color: 'border-[#2D4A3E] text-[#2D4A3E] bg-[#2D4A3E]/10' },
    { name: 'Cachoeiras (Anhangabaú/Carvoeiros)', count: 11, km: 193, color: 'border-[#1E3A2F] text-[#1E3A2F] bg-[#1E3A2F]/10' },
    { name: 'Quatinga / Pedra Grande', count: 8, km: 122, color: 'border-[#78350F] text-[#78350F] bg-[#78350F]/10' },
    { name: 'Rio Mogi / Raiz da Serra', count: 7, km: 116, color: 'border-[#8C5E3C] text-[#8C5E3C] bg-[#8C5E3C]/10' },
    { name: 'Funicular / Grota Funda', count: 6, km: 73, color: 'border-[#B45309] text-[#B45309] bg-[#B45309]/10' },
  ];

  const highlightedTrails = [
    { name: 'Trilha do Funicular & Grota Funda', km: 14.2, type: 'Travessia', difficulty: 'Difícil', region: 'Funicular / Grota Funda', desc: 'Descida histórica ao longo dos 5 Planos Inclinados da São Paulo Railway, passando por pontes metálicas e casarões.' },
    { name: 'Caminho da Pedra Grande & Quatinga', km: 18.5, type: 'Travessia', difficulty: 'Difícil', region: 'Quatinga / Pedra Grande', desc: 'Percurso de crista no divisor de águas da Serra do Mar com vista panorâmica da Baixada Santista.' },
    { name: 'Circuito Poço Encantado & Anhangabaú', km: 8.4, type: 'Circuito', difficulty: 'Moderada', region: 'Cachoeiras (Anhangabaú/Carvoeiros)', desc: 'Caminho ecológico cortando a vegetação primária da Mata Atlântica com paradas para banho de rio.' },
    { name: 'Trilha das Nascentes (Parque Municipal)', km: 4.8, type: 'Circuito', difficulty: 'Fácil', region: 'Cachoeiras (Anhangabaú/Carvoeiros)', desc: 'Percurso oficial monitorado dentro do Parque Natural Municipal Nascentes de Paranapiacaba.' },
    { name: 'Travessia Vale do Quilombo a Cubatão', km: 22.1, type: 'Travessia', difficulty: 'Difícil', region: 'Vale do Quilombo', desc: 'Travessia profunda de serra descendo em direção aos mananciais e à Baixada.' },
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

      {/* Regiões de Trilhas */}
      <div className="max-w-5xl mx-auto space-y-4 font-sans">
        <h2 className="text-xs font-bold text-[#78716C] uppercase tracking-widest font-serif">
          Distribuição por Regiões Geográficas (Clusters)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {trailRegions.map((r, i) => (
            <div
              key={i}
              onClick={() => setSelectedRegion(selectedRegion === r.name ? 'Todas' : r.name)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${r.color} ${
                selectedRegion === r.name ? 'ring-2 ring-[#2D4A3E] shadow-sm' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <div className="text-xs font-bold truncate">{r.name}</div>
              <div className="text-xl font-black font-serif mt-1">{r.count} <span className="text-xs font-sans font-normal">trilhas</span></div>
              <div className="text-[11px] text-[#57534E] font-mono mt-0.5">{r.km} km totais</div>
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
