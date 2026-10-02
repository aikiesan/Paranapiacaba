import React, { useState } from 'react';
import { TIMELINE } from '../data/history';
import { photoById } from '../data/photoArchiveIndex';
import {
  ArchiveFigure, MapButton, ReaderNote, SheetHeader, SheetPage, SheetSection, Term,
} from './archive';

// Os cinco patamares da Serra Nova, do pé da Serra ao Alto da Serra.
// Cotas aproximadas, a conferir com a equipe na prancha de hipsometria.
const PATAMARES = [
  {
    id: 1,
    nome: '1º patamar',
    lugar: 'Pé da Serra, Cubatão',
    cota: '≈ 80 m',
    descricao: 'Início da escarpa. Aqui a linha de aderência da Baixada encontrava o primeiro plano inclinado.',
    equipamentos: 'Casa de máquinas nº 1, poço de contrapeso, oficina de cabos.',
  },
  {
    id: 2,
    nome: '2º patamar',
    lugar: 'Encosta da Serra',
    cota: '≈ 250 m',
    descricao: 'Patamar intermediário de tração fixa, com caldeiras a vapor e sistemas de frenagem de emergência.',
    equipamentos: 'Máquina fixa a vapor, reservatório de água de alimentação.',
  },
  {
    id: 3,
    nome: '3º patamar',
    lugar: 'Meio da Serra',
    cota: '≈ 420 m',
    descricao: 'Ponto de cruzamento das composições, com vista sobre os vales dos rios Mogi e das Pedras.',
    equipamentos: 'Casa de máquinas, desvio de cruzamento.',
  },
  {
    id: 4,
    nome: '4º patamar',
    lugar: 'Grota Funda',
    cota: '≈ 600 m',
    descricao: 'Transição na alta escarpa, nos trechos de rampa mais forte do sistema.',
    equipamentos: 'Caldeiras fixas, carretéis de cabo de aço, locobreques.',
  },
  {
    id: 5,
    nome: '5º patamar',
    lugar: 'Alto da Serra, Paranapiacaba',
    cota: '≈ 780 m',
    descricao: 'Topo do sistema, ligado ao pátio de manobras de Paranapiacaba, ao girador de locomotivas e às oficinas.',
    equipamentos: 'Casa de máquinas principal, hoje museu; relógio da estação; oficinas.',
  },
];

// Corte esquemático da Serra com os cinco patamares clicáveis.
function InclineDiagram({ selected, onSelect }) {
  const points = [[70, 250], [190, 205], [300, 155], [410, 102], [520, 50]];
  return (
    <svg viewBox="0 0 600 290" className="w-full h-auto" role="group" aria-label="Corte esquemático dos cinco planos inclinados da Serra Nova">
      <path d="M0 262 L40 262 L70 250 L190 205 L300 155 L410 102 L520 50 L600 46 L600 290 L0 290 Z" fill="#EDE4D3" />
      {/* hachura da encosta */}
      {Array.from({ length: 26 }).map((_, i) => (
        <line key={i} x1={40 + i * 22} y1="290" x2={70 + i * 22} y2="262" stroke="#231B15" strokeOpacity="0.07" />
      ))}
      <path d="M0 262 L40 262 L70 250 L190 205 L300 155 L410 102 L520 50 L600 46" fill="none" stroke="#231B15" strokeWidth="2" />
      {/* cabos: planos inclinados */}
      {points.slice(0, -1).map(([x, y], i) => {
        const [x2, y2] = points[i + 1];
        return <line key={x} x1={x} y1={y - 7} x2={x2} y2={y2 - 7} stroke="#A3321F" strokeWidth="1" strokeDasharray="4 3" />;
      })}
      {points.map(([x, y], i) => {
        const id = i + 1;
        const isActive = id === selected;
        return (
          <g key={id} className="cursor-pointer" onClick={() => onSelect(id)} role="button" tabIndex={0} aria-label={`${id}º patamar`} aria-pressed={isActive}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onSelect(id)}>
            <rect x={x - 16} y={y - 34} width="32" height="20" fill={isActive ? '#A3321F' : '#FAF7F2'} stroke={isActive ? '#A3321F' : '#231B15'} strokeWidth="1.2" />
            <text x={x} y={y - 20} fontSize="12" textAnchor="middle" fontFamily="'Old Standard TT', serif" fill={isActive ? '#FAF7F2' : '#231B15'}>{id}º</text>
            <line x1={x} y1={y - 14} x2={x} y2={y} stroke="#231B15" strokeWidth="1" />
            <circle cx={x} cy={y} r={isActive ? 6 : 4} fill={isActive ? '#A3321F' : '#231B15'} />
            <circle cx={x} cy={y} r="18" fill="transparent" />
          </g>
        );
      })}
      <text x="10" y="282" fontSize="10" fill="#6B5E52" fontFamily="Archivo" letterSpacing="1.2">BAIXADA</text>
      <text x="592" y="68" fontSize="10" fill="#6B5E52" fontFamily="Archivo" letterSpacing="1.2" textAnchor="end">PLANALTO</text>
      <text x="300" y="282" fontSize="10" fill="#6B5E52" fontFamily="Archivo" letterSpacing="1.2" textAnchor="middle">CORTE ESQUEMÁTICO · FORA DE ESCALA</text>
    </svg>
  );
}

const MONUMENTOS = [
  {
    titulo: 'Relógio da estação',
    data: '1898',
    texto: 'A torre do relógio marcava a hora para toda a linha entre Jundiaí e o porto. A tradição local a compara ao Big Ben de Londres.',
  },
  {
    titulo: 'Casa de máquinas do 5º patamar',
    data: 'Serra Nova',
    texto: 'Abriga hoje o acervo de preservação ferroviária: locomotivas, locobreques, carretéis de cabo e oficinas históricas.',
  },
  {
    titulo: 'Castelinho',
    data: 'Parte Alta',
    texto: 'A casa do engenheiro-chefe, no alto da colina, de onde se via todo o pátio, a estação e a vila.',
  },
];

export function MemoriaFerroviariaPanel({ onNavigateToMapWithPreset }) {
  const [selectedPatamar, setSelectedPatamar] = useState(5);
  const active = PATAMARES.find((p) => p.id === selectedPatamar);
  const timeline = TIMELINE.filter((event) => Number(event.year) < 2000);

  return (
    <SheetPage sheetId="ferrovia">
      <SheetHeader
        sheetId="ferrovia"
        kicker="Memória ferroviária"
        title="A São Paulo Railway e a Serra"
        lede="Como uma companhia inglesa levou o trem do porto de Santos ao planalto, puxando os vagões por cabos de aço — e por que isso fez nascer uma vila no alto da Serra."
        meta={[
          { label: 'Inauguração', value: '1867' },
          { label: 'Bitola', value: '1,60 m' },
          { label: 'Desnível', value: '≈ 800 m' },
          { label: 'Planos (1901)', value: '5' },
        ]}
      >
        <MapButton onClick={() => onNavigateToMapWithPreset('ferrovia_serra')}>Ver a ferrovia no mapa</MapButton>
      </SheetHeader>

      <SheetSection no="1" title="O problema: uma parede de oitocentos metros">
        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-8 md:gap-12">
          <div className="font-serif text-[1.05rem] leading-relaxed text-ink-700 space-y-4">
            <p>
              Entre o porto de Santos e o planalto paulista ergue-se a Serra do Mar. A subida é tão íngreme que uma locomotiva comum, que anda pela <Term id="aderencia">aderência</Term> das rodas aos trilhos, simplesmente patinaria.
            </p>
            <p>
              A solução dos engenheiros da companhia foi o <Term id="funicular">funicular</Term>: dividir a encosta em rampas retas, os <Term id="plano-inclinado">planos inclinados</Term>, e puxar os vagões por cabos de aço movidos por máquinas a vapor fixas. Entre uma rampa e outra, um <Term id="patamar">patamar</Term> quase plano abrigava as máquinas e quem as operava.
            </p>
            <p>
              O primeiro sistema, a <Term id="serra-velha-nova">Serra Velha</Term>, abriu em 1867. Com o aumento do tráfego de café, a companhia construiu ao lado a Serra Nova, de 1901, com cinco planos e os <Term id="locobreque">locobreques</Term>.
            </p>
          </div>
          <ArchiveFigure photo={photoById('spr-duplicacao')} fig="1" aspect="aspect-[4/3]" />
        </div>
      </SheetSection>

      <SheetSection
        no="2"
        title="Os cinco patamares da Serra Nova"
        intro="Toque em um patamar no corte para ver o que havia ali. A subida vai da Baixada, à esquerda, ao Alto da Serra, à direita."
      >
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-8 items-start">
          <div className="border border-ink/25 bg-paper/80 p-2">
            <InclineDiagram selected={selectedPatamar} onSelect={setSelectedPatamar} />
            <div className="flex flex-wrap gap-1 border-t border-ink/15 pt-2 mt-1" role="tablist" aria-label="Patamares">
              {PATAMARES.map((p) => (
                <button
                  key={p.id}
                  role="tab"
                  aria-selected={p.id === selectedPatamar}
                  onClick={() => setSelectedPatamar(p.id)}
                  className={`px-2.5 py-1 text-xs border transition-colors ${
                    p.id === selectedPatamar ? 'bg-ink text-paper border-ink' : 'border-ink/20 hover:border-ink/60'
                  }`}
                >
                  {p.nome}
                </button>
              ))}
            </div>
          </div>
          <div className="double-rule bg-paper p-5" aria-live="polite">
            <div className="flex items-baseline justify-between gap-3">
              <span className="caps text-[9px] text-signal">{active.lugar}</span>
              <span className="caps text-[9px] text-ink-500 tabular">Cota {active.cota}</span>
            </div>
            <h3 className="font-display text-3xl mt-1">{active.nome}</h3>
            <p className="font-serif text-[0.98rem] leading-relaxed text-ink-700 mt-2">{active.descricao}</p>
            <div className="border-t border-ink/20 mt-4 pt-3">
              <div className="caps text-[9px] text-ink-500">Equipamentos</div>
              <p className="font-serif text-sm text-ink-700 mt-1">{active.equipamentos}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <MapButton size="sm" onClick={() => onNavigateToMapWithPreset('prancha_hipsometria')}>Ver o relevo da escarpa no mapa</MapButton>
          <span className="font-serif text-sm text-ink-500">As cotas são aproximadas.</span>
        </div>
      </SheetSection>

      <SheetSection no="3" title="Uma linha desenhada a nanquim" intro="As estações do alto e do pé da Serra foram redesenhadas no fim do século XIX. O arquivo guarda as folhas do escritório técnico da companhia.">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
          {['spr-corte-cozinha', 'spr-cortes-coberturas', 'spr-planta-alto-serra'].map((id, index) => (
            <ArchiveFigure key={id} photo={photoById(id)} fig={index + 2} />
          ))}
        </div>
        <ReaderNote title="Como ler um desenho técnico">
          A <em>planta</em> mostra o edifício visto de cima, cortado à altura das janelas; o <em>corte</em> o mostra fatiado de lado; a <em>elevação</em> mostra a fachada. A escala (1:50, 1:200) diz quantas vezes o desenho é menor que a obra.
        </ReaderNote>
      </SheetSection>

      <SheetSection no="4" title="Cronologia da ferrovia">
        <ol className="border-l-2 border-ink/70 ml-2 space-y-6">
          {timeline.map((event) => (
            <li key={event.year} className="relative pl-6">
              <span className="absolute -left-[7px] top-2 w-3 h-3 bg-paper border-2 border-signal rounded-full" />
              <div className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-display text-2xl text-signal tabular">{event.year}</span>
                <span className="font-display text-lg">{event.title}</span>
              </div>
              <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-1 max-w-2xl">{event.text}</p>
            </li>
          ))}
        </ol>
      </SheetSection>

      <SheetSection no="5" title="O que ver no Alto da Serra">
        <div className="grid md:grid-cols-3 gap-px bg-ink/20 border border-ink/20">
          {MONUMENTOS.map((item) => (
            <div key={item.titulo} className="bg-paper p-5">
              <div className="caps text-[9px] text-signal">{item.data}</div>
              <h3 className="font-display text-xl mt-1">{item.titulo}</h3>
              <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-2">{item.texto}</p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <MapButton size="sm" onClick={() => onNavigateToMapWithPreset('escala_sitio')}>Ver o sítio de Paranapiacaba no mapa</MapButton>
        </div>
      </SheetSection>
    </SheetPage>
  );
}
