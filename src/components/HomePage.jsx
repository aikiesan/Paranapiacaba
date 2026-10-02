import React, { useState } from 'react';
import { LAYERS } from '../config/layers';
import { CARTOGRAPHIC_MAPS } from '../data/mapsIndex';
import { PHOTO_ARCHIVE, photoById, webImage } from '../data/photoArchiveIndex';
import { assetUrl } from '../utils/assetUrl';
import { TIMELINE } from '../data/history';
import { SHEETS } from '../data/sheets';
import {
  ArchiveFigure, Icon, InkButton, MapButton, ReaderNote, SheetPage, SheetSection, Term, usePortalNav,
} from './archive';

// Contagens derivadas dos catálogos, para que os indicadores não envelheçam.
const LAYER_COUNT = LAYERS.filter((layer) => layer.available !== false).length;
const MAP_COUNT = CARTOGRAPHIC_MAPS.length;
const DRAWING_COUNT = PHOTO_ARCHIVE.filter((photo) => photo.category === 'Desenhos da São Paulo Railway').length;

// Perfil esquemático da linha, de Santos a Jundiaí (fora de escala): o
// desenho que explica por que a Serra exigiu um sistema próprio.
const PROFILE_ZONES = [
  {
    id: 'baixada',
    label: 'A Baixada',
    station: 'Santos · Cubatão',
    altitude: 'nível do mar',
    preset: 'escala_corredor',
    text: 'O porto de Santos era o destino do café do interior. Na planície litorânea o trem corre por aderência, como em qualquer ferrovia.',
  },
  {
    id: 'serra',
    label: 'A Serra do Mar',
    station: 'Raiz da Serra → Alto da Serra',
    altitude: 'cerca de 800 m de desnível',
    preset: 'escala_serra',
    text: 'Aqui a encosta é íngreme demais para a locomotiva subir sozinha. A SPR dividiu a subida em planos inclinados, vencidos por cabos de aço puxados por máquinas fixas nos patamares.',
  },
  {
    id: 'vila',
    label: 'Paranapiacaba',
    station: 'Alto da Serra',
    altitude: 'no alto da escarpa',
    preset: 'escala_vila',
    text: 'No topo, onde terminava o último plano, a companhia construiu a estação, as oficinas e a vila dos ferroviários — o núcleo do sítio candidato.',
  },
  {
    id: 'planalto',
    label: 'O Planalto',
    station: 'Santo André · São Paulo · Jundiaí',
    altitude: 'planalto paulista',
    preset: 'escala_corredor',
    text: 'Vencida a Serra, a linha segue pelo planalto até São Paulo e Jundiaí, onde se encontrava com as ferrovias do café.',
  },
];

function LineProfile() {
  const [zoneId, setZoneId] = useState('serra');
  const { openMap } = usePortalNav();
  const zone = PROFILE_ZONES.find((item) => item.id === zoneId);
  // Faixas clicáveis sobre o perfil (coordenadas do viewBox 1000 × 260).
  const bands = { baixada: [0, 300], serra: [300, 470], vila: [470, 560], planalto: [560, 1000] };

  return (
    <div>
      <div className="relative border border-ink/25 bg-paper/80">
        <svg viewBox="0 0 1000 260" className="w-full h-auto block" role="img" aria-label="Perfil esquemático da linha Santos–Jundiaí: planície, a escarpa da Serra do Mar e o planalto">
          {/* cotas de fundo */}
          {[60, 110, 160, 210].map((y) => (
            <line key={y} x1="0" x2="1000" y1={y} y2={y} stroke="#231B15" strokeOpacity="0.08" />
          ))}
          {Object.entries(bands).map(([id, [x1, x2]]) => (
            <rect
              key={id}
              x={x1}
              y="0"
              width={x2 - x1}
              height="260"
              fill={id === zoneId ? '#A3321F' : 'transparent'}
              fillOpacity={id === zoneId ? 0.07 : 0}
              className="cursor-pointer"
              onClick={() => setZoneId(id)}
            />
          ))}
          {/* terreno */}
          <path
            d="M0 222 L250 220 C285 219 300 214 312 200 L340 160 L372 128 L405 92 L438 66 L470 52 L520 50 L560 58 L640 64 L720 70 L800 62 L880 66 L1000 58 L1000 260 L0 260 Z"
            fill="#EDE4D3"
          />
          {/* hachura da escarpa */}
          <path d="M312 200 L340 160 L372 128 L405 92 L438 66 L470 52" fill="none" stroke="#231B15" strokeWidth="2.2" />
          <path
            d="M0 222 L250 220 C285 219 300 214 312 200 M470 52 L520 50 L560 58 L640 64 L720 70 L800 62 L880 66 L1000 58"
            fill="none"
            stroke="#231B15"
            strokeWidth="1.6"
          />
          {/* planos inclinados: degraus em vermelho */}
          {[[312, 200], [340, 160], [372, 128], [405, 92], [438, 66]].map(([x, y], index) => (
            <g key={x}>
              <circle cx={x} cy={y} r="4.5" fill="#FAF7F2" stroke="#A3321F" strokeWidth="2" />
              <text x={x - 10} y={y - 9} fontSize="11" fill="#A3321F" fontFamily="Archivo" textAnchor="end">{index + 1}º</text>
            </g>
          ))}
          {/* estações */}
          {[
            [40, 221, 'Santos'],
            [200, 220, 'Cubatão'],
            [300, 212, 'Raiz da Serra'],
            [490, 51, 'Paranapiacaba'],
            [700, 69, 'Santo André'],
            [820, 63, 'São Paulo'],
            [970, 58, 'Jundiaí'],
          ].map(([x, y, name]) => (
            <g key={name}>
              <rect x={x - 3} y={y - 3} width="6" height="6" fill="#231B15" />
              <text x={x} y={y + (y > 150 ? 22 : -12)} fontSize="12.5" fill="#231B15" fontFamily="'Old Standard TT', Georgia, serif" textAnchor="middle" fontStyle={name === 'Paranapiacaba' ? 'italic' : 'normal'} fontWeight={name === 'Paranapiacaba' ? 700 : 400}>
                {name}
              </text>
            </g>
          ))}
          {/* cota */}
          <g stroke="#A3321F" strokeWidth="1" fill="none">
            <path d="M262 222 V52 M256 222 h12 M256 52 h12" />
          </g>
          <text x="254" y="140" fontSize="11" fill="#A3321F" fontFamily="Archivo" textAnchor="end">≈ 800 m</text>
          <text x="994" y="250" fontSize="10" fill="#6B5E52" fontFamily="Archivo" textAnchor="end" letterSpacing="1.5">PERFIL ESQUEMÁTICO · FORA DE ESCALA</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 border-x border-b border-ink/25" role="tablist" aria-label="Trechos da linha">
        {PROFILE_ZONES.map((item) => {
          const isActive = item.id === zoneId;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setZoneId(item.id)}
              className={`text-left px-3 py-2.5 border-ink/25 [&:not(:first-child)]:border-l transition-colors ${
                isActive ? 'bg-ink text-paper' : 'bg-paper hover:bg-paper-dark text-ink'
              }`}
            >
              <span className={`caps text-[9px] block ${isActive ? 'text-paper/70' : 'text-ink-500'}`}>{item.altitude}</span>
              <span className="font-display text-base leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 grid md:grid-cols-[1fr_auto] gap-4 md:items-end">
        <div>
          <div className="caps text-[10px] text-signal">{zone.station}</div>
          <p className="font-serif text-[1.05rem] leading-relaxed text-ink-700 mt-1 max-w-2xl">{zone.text}</p>
        </div>
        <MapButton onClick={() => openMap(zone.preset)} size="sm">Ver este trecho no mapa</MapButton>
      </div>
    </div>
  );
}

// Cronologia em forma de quadro de horários.
function Timetable() {
  const { openArchive } = usePortalNav();
  return (
    <div className="border-y-2 border-ink">
      <div className="hidden sm:grid grid-cols-[5.5rem_1fr_9rem] gap-4 py-2 border-b border-ink/40 caps text-[9px] text-ink-500">
        <span>Ano</span>
        <span>Acontecimento</span>
        <span className="text-right">No arquivo</span>
      </div>
      <ol>
        {TIMELINE.map((event) => {
          const figure = event.figure ? photoById(event.figure) : null;
          return (
            <li key={event.year} className="grid grid-cols-[4.25rem_1fr] sm:grid-cols-[5.5rem_1fr_9rem] gap-x-4 gap-y-1 py-4 border-b border-ink/15 last:border-b-0">
              <span className="font-display text-2xl md:text-3xl leading-none text-signal tabular">{event.year}</span>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-lg leading-tight">{event.title}</span>
                  <span className="leader hidden md:block text-ink" aria-hidden />
                </div>
                <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-1 max-w-2xl">{event.text}</p>
              </div>
              <div className="col-start-2 sm:col-start-3 sm:text-right">
                {figure && (
                  <button onClick={() => openArchive(figure.id)} className="inline-flex sm:flex-col sm:items-end gap-2 items-center group">
                    <img
                      src={assetUrl(webImage(figure.src))}
                      alt=""
                      loading="lazy"
                      className="archival-img w-20 h-14 object-cover border border-ink/25 group-hover:border-ink"
                    />
                    <span className="caps text-[9px] text-ink-500 group-hover:text-signal">Ver o desenho</span>
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const FIRST_STEPS = [
  {
    no: '1',
    title: 'Leia a história',
    time: '5 minutos',
    text: 'Entenda por que a ferrovia precisou de cabos para subir a Serra e como nasceu a vila no alto.',
    action: { label: 'Abrir a folha da Ferrovia', sheet: 'ferrovia' },
  },
  {
    no: '2',
    title: 'Explore o mapa',
    time: 'no seu ritmo',
    text: 'Comece por um “mapa pronto”: ele liga as camadas certas e enquadra a região. Depois ligue e desligue o que quiser.',
    action: { label: 'Abrir o mapa', sheet: 'map' },
  },
  {
    no: '3',
    title: 'Consulte o arquivo',
    time: 'para pesquisar',
    text: `Desenhos originais da São Paulo Railway, processos de tombamento e as ${MAP_COUNT} pranchas A0 do projeto.`,
    action: { label: 'Abrir o arquivo', archive: true },
  },
];

export function HomePage({ onNavigate }) {
  const { openArchive, navigate } = usePortalNav();
  const hero = photoById('spr-corte-cozinha');
  const drawings = ['spr-novas-estacoes', 'spr-telegrafo', 'spr-duplicacao', 'spr-elevacao-estacao'].map(photoById);

  return (
    <SheetPage sheetId="home">
      {/* Abertura */}
      <section className="grid md:grid-cols-[1.15fr_0.85fr] gap-10 md:gap-14 items-start mb-16 md:mb-24">
        <div>
          <div className="caps text-[10px] text-ink-500">
            Folha 01 / {String(SHEETS.length).padStart(2, '0')} <span className="text-signal">· Arquivo digital do sítio ferroviário</span>
          </div>
          <div className="track text-ink mt-3 mb-8" />
          <h1 className="font-display text-[3.2rem] leading-[0.95] sm:text-7xl md:text-[5.5rem] tracking-tight">
            Paranapiacaba
          </h1>
          <p className="font-display italic text-2xl md:text-[2rem] leading-snug text-ink-600 mt-3">
            e o caminho de ferro que subiu a Serra do Mar
          </p>
          <p className="font-serif text-lg leading-relaxed text-ink-700 mt-6 max-w-xl">
            Em 1867 a São Paulo Railway ligou o porto de Santos ao planalto. Para vencer a escarpa, puxou os trens por cabos de aço; no alto, ergueu uma vila inteira para os ferroviários. Este atlas reúne mapas, desenhos originais e documentos do corredor e da vila, como subsídio à candidatura a Patrimônio Mundial da UNESCO.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-8">
            <InkButton onClick={() => navigate('ferrovia')}>Começar pela história</InkButton>
            <MapButton onClick={() => onNavigate('map')}>Abrir o mapa</MapButton>
          </div>
        </div>

        <div className="md:pt-10">
          <ArchiveFigure photo={hero} fig="1" size={1600} aspect="aspect-[4/5]" />
        </div>
      </section>

      {/* Primeira visita */}
      <SheetSection
        no="I"
        title="Primeira visita? Três maneiras de começar"
        intro="Não é preciso saber nada de ferrovias nem de mapas. Escolha por onde entrar; cada página termina indicando a próxima."
      >
        <ol className="grid md:grid-cols-3 gap-px bg-ink/20 border border-ink/20">
          {FIRST_STEPS.map((step) => (
            <li key={step.no} className="bg-paper p-5 flex flex-col">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-5xl leading-none text-signal">{step.no}</span>
                <span className="caps text-[9px] text-ink-500 flex items-center gap-1"><Icon name="clock" className="w-3 h-3" />{step.time}</span>
              </div>
              <h3 className="font-display text-2xl mt-3">{step.title}</h3>
              <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-2 flex-1">{step.text}</p>
              <button
                onClick={() => (step.action.archive ? openArchive() : onNavigate(step.action.sheet))}
                className="mt-4 self-start inline-flex items-center gap-1.5 text-sm font-semibold ink-link"
              >
                {step.action.label} <Icon name="arrowRight" className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ol>
        <ReaderNote title="Dica de leitura">
          Palavras sublinhadas em pontilhado, como <Term id="funicular">funicular</Term> ou <Term id="tombamento">tombamento</Term>, abrem uma explicação curta. E todo botão verde leva ao mapa.
        </ReaderNote>
      </SheetSection>

      {/* A linha */}
      <SheetSection
        no="II"
        title="A linha, de Santos a Jundiaí"
        intro="Toda a história do sítio cabe neste perfil: uma planície, um paredão de quase oitocentos metros e o planalto. Toque em um trecho."
      >
        <LineProfile />
      </SheetSection>

      {/* Cronologia */}
      <SheetSection
        no="III"
        title="Quadro de horários da história"
        intro="As datas principais da ferrovia e do sítio. Quando o arquivo guarda um documento do fato, ele aparece ao lado."
      >
        <Timetable />
      </SheetSection>

      {/* Do arquivo */}
      <SheetSection
        no="IV"
        title="Do arquivo da São Paulo Railway"
        intro={`Plantas, cortes e elevações desenhados a nanquim pelos engenheiros da companhia, fotografados pela equipe de pesquisa. São ${DRAWING_COUNT} folhas no arquivo, com título e data transcritos da própria prancha.`}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {drawings.map((photo, index) => (
            <ArchiveFigure key={photo.id} photo={photo} fig={index + 2} />
          ))}
        </div>
        <div className="mt-6">
          <InkButton variant="outline" onClick={() => openArchive()} icon="archive">Abrir o arquivo completo</InkButton>
        </div>
      </SheetSection>

      {/* Índice das folhas */}
      <SheetSection no="V" title="Índice das folhas" intro="O portal é organizado como um jogo de pranchas. Cada folha trata de um tema.">
        <ol className="border-t-2 border-ink">
          {SHEETS.map((sheet) => (
            <li key={sheet.id} className="border-b border-ink/15">
              <button onClick={() => onNavigate(sheet.id)} className="w-full grid grid-cols-[3rem_1fr_auto] items-baseline gap-3 py-3 text-left group">
                <span className="font-display text-xl text-ink-400 tabular group-hover:text-signal">{sheet.no}</span>
                <span>
                  <span className="font-display text-xl leading-tight group-hover:text-signal">{sheet.title}</span>
                  <span className="font-serif text-sm text-ink-500 block sm:inline sm:ml-3">{sheet.summary}</span>
                </span>
                <Icon name="arrowRight" className="w-4 h-4 text-ink-400 group-hover:text-signal" />
              </button>
            </li>
          ))}
          <li className="border-b border-ink/15 grid grid-cols-[3rem_1fr] gap-3 py-3">
            <span className="caps text-[9px] text-ink-500 pt-1.5">Anexos</span>
            <span className="flex flex-wrap gap-x-5 gap-y-1">
              <button onClick={() => openArchive()} className="font-display text-xl ink-link">Arquivo de imagens</button>
              <button onClick={() => onNavigate('gallery')} className="font-display text-xl ink-link">{MAP_COUNT} pranchas A0</button>
            </span>
          </li>
        </ol>
        <p className="caps text-[9px] text-ink-500 mt-4 tabular">
          {LAYER_COUNT} camadas no mapa · {MAP_COUNT} pranchas · {PHOTO_ARCHIVE.length} imagens no arquivo
        </p>
      </SheetSection>
    </SheetPage>
  );
}
