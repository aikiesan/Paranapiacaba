import React, { useState } from 'react';
import { Icon, MapButton, ReaderNote, SheetHeader, SheetPage, SheetSection } from './archive';

const CATEGORIES = [
  { name: 'Oficiais da Subprefeitura', count: 12, km: 68, color: '#2D4A3E', desc: 'Trilhas manejadas e monitoradas pela Subprefeitura de Paranapiacaba.' },
  { name: 'Registradas (Wikiloc)', count: 18, km: 412, color: '#A0683A', desc: 'Percursos de montanhismo e travessias gravados por usuários.' },
  { name: 'Técnicas da ferrovia', count: 8, km: 95, color: '#52463B', desc: 'Servidões de manutenção da via, das linhas de energia e dos aquedutos.' },
  { name: 'Caminhos históricos', count: 7, km: 218, color: '#A3321F', desc: 'Rotas antigas de tropeiros e ligações entre municípios, como o Caminho do Sal.' },
];

const TRAILS = [
  { name: 'Trilha dos Mirantes e Nascentes', km: 4.8, type: 'Circuito monitorado', difficulty: 'Fácil', category: 'Oficiais da Subprefeitura', desc: 'Percurso oficial dentro do Parque Natural Municipal Nascentes de Paranapiacaba, com mirantes.' },
  { name: 'Trilha da Pontinha e Poço Formoso', km: 6.2, type: 'Circuito monitorado', difficulty: 'Moderada', category: 'Oficiais da Subprefeitura', desc: 'Percurso guiado pela Mata Atlântica até poços naturais.' },
  { name: 'Caminho do Funicular e Grota Funda', km: 14.2, type: 'Servidão técnica', difficulty: 'Interditada', category: 'Técnicas da ferrovia', desc: 'Traçado dos planos inclinados da São Paulo Railway. Sítio histórico industrial sob interdição.' },
  { name: 'Servidão dos aquedutos e caixas d’água', km: 8.5, type: 'Manutenção hidráulica', difficulty: 'Difícil', category: 'Técnicas da ferrovia', desc: 'Acesso técnico aos reservatórios e encanamentos de ferro instalados pela companhia.' },
  { name: 'Caminho do Sal', km: 53.5, type: 'Caminho histórico', difficulty: 'Moderada', category: 'Caminhos históricos', desc: 'Rota antiga de tropeiros entre a Baixada Santista, Paranapiacaba e Ribeirão Pires.' },
  { name: 'Travessia Mogi–Bertioga (Quatinga)', km: 28.1, type: 'Travessia', difficulty: 'Difícil', category: 'Registradas (Wikiloc)', desc: 'Percurso de crista ao longo do divisor de águas da Serra do Mar.' },
];

const DIFFICULTY_STYLE = {
  'Fácil': 'text-forest-700 border-forest-700',
  'Moderada': 'text-rust-600 border-rust-600',
  'Difícil': 'text-signal border-signal',
  'Interditada': 'text-paper bg-ink border-ink',
};

// Cartão de trilha à maneira de um bilhete de trem (Edmondson): corpo e canhoto.
function TrailTicket({ trail, color, onMap }) {
  return (
    <article className="flex bg-paper border border-ink/30 hover:border-ink/70 transition-colors">
      <div className="flex-1 p-4 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="caps text-[9px] text-ink-500 truncate">{trail.type}</span>
          <span className={`caps text-[9px] px-1.5 py-0.5 border ${DIFFICULTY_STYLE[trail.difficulty]}`}>{trail.difficulty}</span>
        </div>
        <h3 className="font-display text-xl leading-tight mt-1.5">{trail.name}</h3>
        <p className="font-serif text-[0.92rem] leading-relaxed text-ink-600 mt-1.5">{trail.desc}</p>
        <button onClick={onMap} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-forest-700 hover:text-forest-800">
          <Icon name="map" className="w-3.5 h-3.5" /> Ver no mapa
        </button>
      </div>
      <div className="w-20 flex-shrink-0 border-l-2 border-dashed border-ink/30 flex flex-col items-center justify-center text-center px-2" style={{ backgroundColor: `${color}12` }}>
        <span className="font-display text-3xl leading-none tabular">{trail.km.toLocaleString('pt-BR')}</span>
        <span className="caps text-[9px] text-ink-500 mt-1">km</span>
        <span className="w-6 h-[3px] mt-3" style={{ backgroundColor: color }} />
      </div>
    </article>
  );
}

export function TrailsPanel({ onNavigateToMapWithPreset }) {
  const [category, setCategory] = useState('Todas');
  const [difficulty, setDifficulty] = useState('Todas');
  const openMap = () => onNavigateToMapWithPreset('trilhas_serra');

  const filtered = TRAILS.filter((t) =>
    (category === 'Todas' || t.category === category) && (difficulty === 'Todas' || t.difficulty === difficulty));
  const totalTracks = CATEGORIES.reduce((sum, c) => sum + c.count, 0);
  const totalKm = CATEGORIES.reduce((sum, c) => sum + c.km, 0);

  return (
    <SheetPage sheetId="trilhas">
      <SheetHeader
        sheetId="trilhas"
        kicker="Paisagem e circulação"
        title="Caminhos da Serra"
        lede="Antes e depois do trem, a Serra foi atravessada a pé: por tropeiros, por ferroviários em serviço e hoje por visitantes. Estas são as trilhas mapeadas pelo projeto."
        meta={[
          { label: 'Percursos', value: totalTracks },
          { label: 'Extensão', value: `≈ ${totalKm} km` },
          { label: 'Categorias', value: CATEGORIES.length },
        ]}
      >
        <MapButton onClick={openMap}>Ver as trilhas no mapa</MapButton>
      </SheetHeader>

      <SheetSection no="1" title="Quatro tipos de caminho" intro="Toque em um tipo para filtrar a lista abaixo.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-ink/20 border border-ink/20">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setCategory(isActive ? 'Todas' : cat.name)}
                aria-pressed={isActive}
                className={`text-left p-4 transition-colors ${isActive ? 'bg-ink text-paper' : 'bg-paper hover:bg-paper-dark'}`}
              >
                <span className="block w-8 h-[3px] mb-3" style={{ backgroundColor: isActive ? '#FAF7F2' : cat.color }} />
                <span className="font-display text-lg leading-tight block">{cat.name}</span>
                <span className={`caps text-[9px] block mt-1 tabular ${isActive ? 'text-paper/70' : 'text-ink-500'}`}>{cat.count} percursos · {cat.km} km</span>
                <span className={`font-serif text-sm leading-snug block mt-2 ${isActive ? 'text-paper/85' : 'text-ink-600'}`}>{cat.desc}</span>
              </button>
            );
          })}
        </div>
      </SheetSection>

      <SheetSection no="2" title="Percursos em destaque">
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          <span className="caps text-[9px] text-ink-500 mr-2">Dificuldade</span>
          {['Todas', 'Fácil', 'Moderada', 'Difícil', 'Interditada'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              aria-pressed={difficulty === d}
              className={`px-3 py-1 text-xs border transition-colors ${difficulty === d ? 'bg-ink text-paper border-ink' : 'border-ink/25 hover:border-ink/60'}`}
            >
              {d}
            </button>
          ))}
          {(category !== 'Todas' || difficulty !== 'Todas') && (
            <button onClick={() => { setCategory('Todas'); setDifficulty('Todas'); }} className="ml-2 text-xs ink-link text-ink-600">
              Limpar filtros
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="font-serif text-ink-600 border border-dashed border-ink/30 p-6 text-center">Nenhum percurso em destaque com esses filtros. O mapa mostra todos os registrados.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((t) => (
              <TrailTicket key={t.name} trail={t} color={CATEGORIES.find((c) => c.name === t.category)?.color} onMap={openMap} />
            ))}
          </div>
        )}

        <ReaderNote title="Antes de sair">
          Informe-se no centro de visitantes de Paranapiacaba sobre as condições de cada trilha: algumas só podem ser percorridas com monitor credenciado, e o leito do funicular é área interditada. A Serra tem neblina e chuva frequentes.
        </ReaderNote>
      </SheetSection>
    </SheetPage>
  );
}
