import React from 'react';

export function HomePage({ onNavigate }) {
  const timelineEvents = [
    { year: '1856', title: 'Decreto Imperial & Concessão', desc: 'Irineu Evangelista de Sousa (Barão de Mauá) obtém a concessão imperial para a primeira ferrovia paulista.' },
    { year: '1860', title: 'Início das Obras da SPR', desc: 'Engenheiros britânicos iniciam a transposição da Serra do Mar e a construção dos Planos Inclinados.' },
    { year: '1867', title: 'Inauguração da São Paulo Railway', desc: 'Abertura oficial do corredor Jundiaí–Santos e fundação da Estação de Alto da Serra (Paranapiacaba).' },
    { year: '1898', title: 'Torre do Relógio & Novo Funicular', desc: 'Construção da icônica Clock Tower de Paranapiacaba e expansão do sistema funicular de tração por cabo.' },
    { year: '1946', title: 'Encampação & E.F. Santos a Jundiaí', desc: 'Fim da concessão inglesa de 90 anos e estatização da malha ferroviária pelo Governo Federal.' },
    { year: '2026', title: 'Dossiê SIG & Candidatura UNESCO', desc: 'Consolidação do levantamento cartográfico FAPESP / PUC-Campinas apoiando a preservação do sítio histórico.' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#FAF7F2] text-[#1C1917] custom-scrollbar font-serif selection:bg-[#FEF3C7] selection:text-[#78350F]">
      
      {/* 1. Hero Section Editorial Artístico */}
      <section className="relative px-6 py-16 md:py-24 border-b border-[#E7E0D3] bg-[#F5F0E6]">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          
          {/* Selo Histórico */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#78350F]/10 border border-[#78350F]/20 text-[#78350F] text-xs font-sans font-bold uppercase tracking-widest">
            <span>🏛️ Preservação & Memória Ferroviária Brasileira</span>
          </div>

          {/* Título Principal em Serif Clássica */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1C1917] leading-tight max-w-4xl mx-auto font-serif">
            Registrando a Memória da <span className="text-[#78350F] italic font-serif">São Paulo Railway</span> & Paranapiacaba
          </h1>

          {/* Subtítulo / Descrição Editorial */}
          <p className="text-base sm:text-lg text-[#44403C] max-w-3xl mx-auto font-sans leading-relaxed text-justify sm:text-center">
            Um acervo digital de salvaguarda do patrimônio industrial, arquitetônico e ambiental do <strong className="text-[#1C1917]">corredor ferroviário histórico Jundiaí–Santos (1867)</strong>, integrando a Vila de Paranapiacaba e os 5 Planos Inclinados da Serra do Mar à candidatura para <span className="text-[#78350F] font-semibold">Patrimônio Mundial da UNESCO</span>.
          </p>

          {/* Botões Tradicionais de Ação */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-6 font-sans">
            <button
              onClick={() => onNavigate('map')}
              className="px-6 py-3.5 rounded-md bg-[#78350F] hover:bg-[#451A03] text-[#FAF7F2] font-bold text-sm shadow-md transition-all flex items-center gap-2"
            >
              <span>🗺️ Explorar Mapa SIG Interativo</span>
            </button>

            <button
              onClick={() => onNavigate('ferrovia')}
              className="px-6 py-3.5 rounded-md bg-[#EFE9DF] hover:bg-[#E7E0D3] text-[#1C1917] font-bold text-sm border border-[#D6CEBE] transition-all flex items-center gap-2"
            >
              <span>🚂 Dossiê Memória Ferroviária</span>
            </button>

            <button
              onClick={() => onNavigate('gallery')}
              className="px-6 py-3.5 rounded-md bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#78350F] font-bold text-sm border border-[#F59E0B]/30 transition-all flex items-center gap-2"
            >
              <span>📐 26 Pranchas Cartográficas A0</span>
            </button>
          </div>

          {/* Cartões Indicadores de Acervo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 pt-10 font-sans">
            <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-lg p-4 text-center shadow-xs">
              <div className="text-2xl font-extrabold text-[#78350F] font-serif">1867</div>
              <div className="text-[11px] text-[#57534E] font-medium uppercase mt-1">Inauguração SPR</div>
            </div>
            <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-lg p-4 text-center shadow-xs">
              <div className="text-2xl font-extrabold text-[#2D4A3E] font-serif">139 km</div>
              <div className="text-[11px] text-[#57534E] font-medium uppercase mt-1">Corredor Mapeado</div>
            </div>
            <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-lg p-4 text-center shadow-xs">
              <div className="text-2xl font-extrabold text-[#78350F] font-serif">26 Mapas</div>
              <div className="text-[11px] text-[#57534E] font-medium uppercase mt-1">Pranchas A0</div>
            </div>
            <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-lg p-4 text-center shadow-xs">
              <div className="text-2xl font-extrabold text-[#2D4A3E] font-serif">45 Trilhas</div>
              <div className="text-[11px] text-[#57534E] font-medium uppercase mt-1">~780 km GPS</div>
            </div>
            <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-lg p-4 text-center shadow-xs col-span-2 sm:col-span-1">
              <div className="text-2xl font-extrabold text-[#78350F] font-serif">200+</div>
              <div className="text-[11px] text-[#57534E] font-medium uppercase mt-1">Camadas SIG</div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Linha do Tempo Histórica da São Paulo Railway */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-10 border-b border-[#E7E0D3]">
        <div className="text-center space-y-2">
          <span className="text-xs font-sans font-bold uppercase tracking-widest text-[#78350F]">Cronologia Histórica</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917]">Linha do Tempo da Ferrovia & Paranapiacaba</h2>
          <p className="text-sm font-sans text-[#57534E] max-w-2xl mx-auto">
            Da fundação britânica à consagração do patrimônio cultural na escarpa da Serra do Mar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-sans">
          {timelineEvents.map((ev, idx) => (
            <div key={idx} className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-lg p-5 space-y-2 shadow-xs hover:border-[#8C5E3C] transition-colors">
              <span className="inline-block px-2.5 py-0.5 rounded bg-[#78350F]/10 text-[#78350F] text-xs font-serif font-bold">
                {ev.year}
              </span>
              <h3 className="text-base font-bold text-[#1C1917] font-serif">{ev.title}</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">{ev.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Seções Culturais e Arquitetônicas */}
      <section className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        
        {/* Bloco A: Engenharia Ferroviária */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded bg-[#78350F]/10 text-[#78350F] text-xs font-sans font-bold uppercase tracking-widest">
              🚂 Engenharia do Século XIX
            </span>
            <h2 className="text-2xl font-bold text-[#1C1917] font-serif">
              Os 5 Planos Inclinados e os Locobreques Britânicos
            </h2>
            <p className="text-sm font-sans text-[#44403C] leading-relaxed text-justify">
              Para transpor os 800 metros de desnível da Serra do Mar, os engenheiros britânicos projetaram o <strong className="text-[#1C1917]">Sistema Funicular</strong>: um conjunto de 5 patamares operacionais conectados por cabos de aço e impulsionados por máquinas a vapor estacionárias.
            </p>
            <p className="text-sm font-sans text-[#57534E] leading-relaxed text-justify">
              Locomotivas especiais de freio e tração (<span className="italic font-serif text-[#78350F]">locobreques</span>), importadas de Birmingham e Manchester, ancoravam os vagões durante a travessia da escarpa, tornando-se o coração tecnológico da São Paulo Railway.
            </p>
            <button
              onClick={() => onNavigate('ferrovia')}
              className="font-sans text-xs font-bold text-[#78350F] hover:text-[#451A03] flex items-center gap-1"
            >
              <span>Ver Dossiê da Memória Ferroviária &rarr;</span>
            </button>
          </div>

          <div className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl p-6 space-y-4 font-sans shadow-xs">
            <h3 className="text-xs font-bold text-[#78350F] uppercase tracking-wider border-b border-[#D6CEBE] pb-2 font-serif">
              Elementos do Patrimônio Industrial Mapeados
            </h3>
            <ul className="space-y-3 text-xs text-[#44403C]">
              <li className="flex items-start gap-2">
                <span className="text-[#78350F] font-bold">▪</span>
                <span><strong>Planos 1 a 5:</strong> Traçado georreferenciado dos patamares e casas de força da Serra.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#78350F] font-bold">▪</span>
                <span><strong>Torre do Relógio (Clock Tower):</strong> Marco de 1898 centralizando o pátio operacional.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#78350F] font-bold">▪</span>
                <span><strong>Ponte Metálica SPR:</strong> Estruturas de ferro fundido importadas da Inglaterra.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#78350F] font-bold">▪</span>
                <span><strong>Oficinas & Garagens:</strong> Galpões de manutenção e material rodante preservado.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bloco B: A Vila e a Chancela UNESCO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="order-2 md:order-1 bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl p-6 space-y-4 font-sans shadow-xs">
            <h3 className="text-xs font-bold text-[#2D4A3E] uppercase tracking-wider border-b border-[#D6CEBE] pb-2 font-serif">
              Tipologia Arquitetônica & Conservação Lote a Lote
            </h3>
            <div className="space-y-2 text-xs text-[#44403C]">
              <div className="p-3 bg-[#FAF7F2] rounded border border-[#E7E0D3]">
                <strong className="text-[#1C1917] block font-serif">Parte Baixa (Vila Operária):</strong>
                Habitações geminadas de madeira pré-fabricada, alinhadas em moinho urbano britânico.
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded border border-[#E7E0D3]">
                <strong className="text-[#1C1917] block font-serif">Parte Alta & Rabique:</strong>
                Habitações históricas, Igreja de Bom Jesus (1889) e vielas sanitárias originais.
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded border border-[#E7E0D3]">
                <strong className="text-[#1C1917] block font-serif">Equipamentos Sociais:</strong>
                Clube União Lyra Serrano (1936) e o Museu Castelinho.
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2 space-y-4">
            <span className="px-3 py-1 rounded bg-[#2D4A3E]/10 text-[#2D4A3E] text-xs font-sans font-bold uppercase tracking-widest">
              🏛️ Valor Universal Excepcional
            </span>
            <h2 className="text-2xl font-bold text-[#1C1917] font-serif">
              A Vila de Paranapiacaba & a Candidatura UNESCO
            </h2>
            <p className="text-sm font-sans text-[#44403C] leading-relaxed text-justify">
              Único testemunho preservado de vila operária ferroviária em madeira no continente sul-americano, Paranapiacaba reúne arquitetura Victorian-colonial, infraestrutura hídrica histórica e paisagem cultural tombada pelas três instâncias (IPHAN, CONDEPHAAT, COMPACT).
            </p>
            <p className="text-sm font-sans text-[#57534E] leading-relaxed text-justify">
              O projeto <strong className="text-[#1C1917]">FAPESP / PUC-Campinas</strong> disponibiliza a cartografia lote a lote e o diagnóstico do estado de conservação como subsídio direto aos documentos de candidatura à Chancela de Patrimônio Mundial.
            </p>
          </div>
        </div>

        {/* Bloco C: Acervo Fotográfico de Campo & Iconografia Histórica */}
        <div className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-2xl p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D6CEBE] pb-5">
            <div>
              <span className="px-3 py-1 rounded bg-[#78350F]/10 text-[#78350F] text-xs font-sans font-bold uppercase tracking-widest">
                📸 Registros Visuais do Projeto
              </span>
              <h2 className="text-2xl font-bold text-[#1C1917] font-serif mt-1">
                Acervo Fotográfico de Campo & Iconografia Histórica
              </h2>
            </div>
            <button
              onClick={() => onNavigate('photo_gallery')}
              className="px-5 py-2.5 rounded-md bg-[#78350F] hover:bg-[#451A03] text-[#FAF7F2] font-sans font-bold text-xs shadow-xs transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span>📸 Abrir Galeria Completa</span>
            </button>
          </div>

          <p className="text-sm font-sans text-[#44403C] leading-relaxed text-justify">
            Registros fotográficos das vistorias de campo da equipe <strong className="text-[#1C1917]">FAPESP / PUC-Campinas</strong>, acompanhados pelo acervo histórico da São Paulo Railway, fotos operacionais do Funicular, casarões da Vila de Paranapiacaba e paisagem da Serra do Mar.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-sans">
            <div 
              onClick={() => onNavigate('photo_gallery')}
              className="group relative aspect-4/3 rounded-lg overflow-hidden border border-[#E7E0D3] cursor-pointer shadow-xs"
            >
              <img src="acervo/ferrovia/IMG_20210503_114044.jpg" alt="Ferrovia" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">Trilhos & Funicular</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigate('photo_gallery')}
              className="group relative aspect-4/3 rounded-lg overflow-hidden border border-[#E7E0D3] cursor-pointer shadow-xs"
            >
              <img src="acervo/vila/IMG_3506.JPG" alt="Vila de Paranapiacaba" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">Casarões da Vila</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigate('photo_gallery')}
              className="group relative aspect-4/3 rounded-lg overflow-hidden border border-[#E7E0D3] cursor-pointer shadow-xs"
            >
              <img src="acervo/campo/foto_campo_vistoria_01.jpeg" alt="Visita de Campo" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">Vistoria de Campo</span>
              </div>
            </div>

            <div 
              onClick={() => onNavigate('photo_gallery')}
              className="group relative aspect-4/3 rounded-lg overflow-hidden border border-[#E7E0D3] cursor-pointer shadow-xs"
            >
              <img src="acervo/trilhas/1_patamar_com_chegada.png" alt="Serra do Mar" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-bold text-white">Paisagem da Serra</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* Rodapé Editorial */}
      <footer className="border-t border-[#E7E0D3] bg-[#EFE9DF] px-6 py-10 text-xs font-sans text-[#57534E]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1">
            <div className="font-bold text-[#1C1917] font-serif text-sm">Estação & Memória Paranapiacaba</div>
            <div>Projeto FAPESP / PUC-Campinas · CP2b NIPE-Unicamp</div>
            <div className="text-[11px] text-[#78716C]">Cartografia Georreferenciada EPSG:4674 SIRGAS 2000</div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-semibold">
            <button onClick={() => onNavigate('map')} className="hover:text-[#78350F] transition-colors">Mapa SIG</button>
            <button onClick={() => onNavigate('ferrovia')} className="hover:text-[#78350F] transition-colors">Memória Ferroviária</button>
            <button onClick={() => onNavigate('trilhas')} className="hover:text-[#78350F] transition-colors">Rede de Trilhas</button>
            <button onClick={() => onNavigate('gallery')} className="hover:text-[#78350F] transition-colors">Acervo A0</button>
            <a href="https://github.com/aikiesan/Paranapiacaba" target="_blank" rel="noopener noreferrer" className="text-[#78350F] hover:underline">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
