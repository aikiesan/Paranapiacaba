/**
 * Arquivo de imagens do portal.
 *
 * As legendas descrevem apenas o que se lê ou se vê em cada fotografia:
 * título e data escritos na própria prancha, órgão emissor do documento.
 * O que não está legível fica dito como tal — é um arquivo, não uma vitrine.
 *
 * Fonte: fotografias de pesquisa da equipe FAPESP / PUC-Campinas
 * (05_IMAGENS_CAMPO e E_PATRIM. FERROVIARIO). As versões leves usadas na
 * grade e no visualizador são geradas por scripts/build_acervo_web.py.
 */

const SPR_SOURCE = 'Fotografia de pesquisa, 03/05/2021. Arquivo de origem a identificar.';
const PROCESS_SOURCE = 'Fotografia de pesquisa de processo administrativo consultado pela equipe.';
const ORBITAL_SOURCE = 'Captura de imagem de satélite com pontos de interesse, usada para localizar os patamares.';

export const PHOTO_ARCHIVE = [
  // ── Desenhos da São Paulo Railway ──────────────────────────────────────
  {
    id: 'spr-telegrafo',
    category: 'Desenhos da São Paulo Railway',
    title: 'Croquis da modificação da linha telegráfica nacional no Alto da Serra',
    src: 'acervo/ferrovia/IMG_20210503_114044.jpg',
    date: 's.d. (legível: “Alto da Serra … Janeiro”)',
    location: 'Alto da Serra',
    ref: 'Escala 1:1000 · nº 167345',
    description:
      'Planta de traço fino com a curva da linha férrea, a “Estação actual” e a “Estação Nova”, e o desvio projetado da linha telegráfica nacional. Assinada pelo Chefe da 2ª Divisão.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-junta-vigas',
    category: 'Desenhos da São Paulo Railway',
    title: 'Detalhes da junta das vigas de 20,768 m',
    src: 'acervo/ferrovia/IMG_20210503_115729.jpg',
    date: '29 de setembro de 1899',
    location: 'Alto da Serra',
    ref: 'Escala 1:10 · carimbo “S.P.R. Engenharia”',
    description:
      'Detalhe construtivo, em escala de execução, da emenda de vigas metálicas. Datado no Alto da Serra e assinado pelo Chefe da 2ª Divisão.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-novas-estacoes',
    category: 'Desenhos da São Paulo Railway',
    title: 'Projectada disposição das salas nas novas estações de Raiz e Alto da Serra',
    src: 'acervo/ferrovia/IMG_20210503_122707_1.jpg',
    date: 's.d.',
    location: 'Raiz da Serra e Alto da Serra',
    ref: 'São Paulo Railway Cº · Escala 1:200',
    description:
      'Planta das dependências previstas para as novas estações: bagagem, bilheteria e telégrafo, chefe da estação, administração, sala para senhoras e restaurante, entre outras.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-elevacao-estacao',
    category: 'Desenhos da São Paulo Railway',
    title: 'Alto da Serra Station — elevação',
    src: 'acervo/ferrovia/IMG_20210503_122831_1.jpg',
    date: 's.d.',
    location: 'Alto da Serra',
    ref: 'Folha nº 6',
    description:
      'Elevação de fachada em madeira e vidro, com a modulação de portas, bandeiras envidraçadas e lambris. A régua sobre a folha dá a medida do desenho.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-planta-alto-serra',
    category: 'Desenhos da São Paulo Railway',
    title: 'Planta do Alto da Serra: pátio ferroviário e arredores',
    src: 'acervo/ferrovia/IMG_20210503_123051_1.jpg',
    date: 's.d.',
    location: 'Alto da Serra',
    ref: 'Título fora do enquadramento',
    description:
      'Planta colorida com o feixe de linhas do pátio, os cursos d’água, a rosa dos ventos e, à direita, o que aparenta ser o arruamento ortogonal da vila. O título da folha não aparece na fotografia.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-duplicacao',
    category: 'Desenhos da São Paulo Railway',
    title: 'S. Paulo Railway — Duplicação',
    src: 'acervo/ferrovia/IMG_20210503_123143_1.jpg',
    date: 's.d.',
    location: 'Linha da Serra',
    ref: 'Título caligráfico',
    description:
      'Elevação de um viaduto metálico em treliça, com os pilares de alvenaria pintados em vermelho, do conjunto de desenhos da duplicação da linha.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-cortes-coberturas',
    category: 'Desenhos da São Paulo Railway',
    title: 'Alto da Serra Station — cortes das coberturas dos mictórios e da cozinha',
    src: 'acervo/ferrovia/IMG_20210503_123346_1.jpg',
    date: 's.d.',
    location: 'Alto da Serra',
    ref: 'Scale 1:50 · pasta “Novos Planos Inclinados”',
    description:
      'Folha guardada na pasta “São Paulo Railway — Novos Planos Inclinados”. Mostra cortes das construções de serviço da estação, com a torre do relógio à esquerda.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-corte-mictorios',
    category: 'Desenhos da São Paulo Railway',
    title: 'Transverse section through mictories',
    src: 'acervo/ferrovia/IMG_20210503_123407_1.jpg',
    date: '5 de março de 1898',
    location: 'Alto da Serra',
    ref: 'Datado “5·3·98”',
    description:
      'Corte transversal do bloco de sanitários da estação: estrutura de madeira, cobertura em duas águas e a plataforma ao lado.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-corte-cozinha',
    category: 'Desenhos da São Paulo Railway',
    title: 'Raiz Station — corte transversal pela cozinha',
    src: 'acervo/ferrovia/IMG_20210503_123426_1.jpg',
    date: 's.d.',
    location: 'Raiz da Serra',
    ref: 'Título na margem, em caligrafia',
    description:
      'Corte com a torre do relógio de mostrador circular, a cobertura com lanternim e as esquadrias da fachada. É a imagem que dá o tom deste portal.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-calhas-galpoes',
    category: 'Desenhos da São Paulo Railway',
    title: 'Cast iron gutters in engine sheds',
    src: 'acervo/ferrovia/IMG_20210503_123713.jpg',
    date: 's.d.',
    location: 'Alto da Serra',
    ref: 'Scale 1:100',
    description:
      'Plantas dos galpões de locomotivas com a marcação das calhas de ferro fundido e de seus pontos de descida.',
    source: SPR_SOURCE,
  },
  {
    id: 'spr-plantas-dl597a',
    category: 'Desenhos da São Paulo Railway',
    title: 'Plantas de cobertura — folha DL 597 A',
    src: 'acervo/ferrovia/IMG_20210503_123732_1.jpg',
    date: 's.d.',
    location: 'Alto da Serra',
    ref: 'DL 597 A',
    description:
      'Contornos cotados de edifícios da estação, da mesma série de folhas das calhas dos galpões.',
    source: SPR_SOURCE,
  },

  // ── Processos de tombamento no corredor ────────────────────────────────
  {
    id: 'proc-rgs-resolucao',
    category: 'Processos de tombamento',
    title: 'Resolução de tombamento da Estação Ferroviária de Rio Grande da Serra',
    src: 'acervo/vila/IMG_3539.JPG',
    date: 's.d.',
    location: 'Rio Grande da Serra',
    ref: 'Secretaria da Cultura · CONDEPHAAT',
    description:
      'Os “considerandos” lembram o pioneirismo da antiga São Paulo Railway, o padrão inglês das construções e a transposição da Serra do Mar; o Artigo 1º tomba a estação e seus remanescentes.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-rgs-descricao',
    category: 'Processos de tombamento',
    title: 'Descrição arquitetônica da estação de Rio Grande da Serra',
    src: 'acervo/vila/IMG_3583.JPG',
    date: 's.d.',
    location: 'Rio Grande da Serra',
    ref: 'CONDEPHAAT · UPPH',
    description:
      'Trecho do estudo técnico que descreve a estação, seus elementos pré-fabricados em ferro da Walter Macfarlane & Co. e outros bens da SPR ao longo das linhas 7 e 10.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-rgs-assinaturas',
    category: 'Processos de tombamento',
    title: 'Parecer do Grupo de Estudos de Inventário — assinaturas',
    src: 'acervo/vila/IMG_3531.JPG',
    date: '26 de fevereiro de 2010',
    location: 'São Paulo',
    ref: 'UPPH/GEI/CET',
    description:
      'Fecho do parecer, com os artigos sobre intervenções no bem e no entorno e as assinaturas da equipe técnica.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-rgs-spu',
    category: 'Processos de tombamento',
    title: 'Ofício da Superintendência do Patrimônio da União sobre a estação',
    src: 'acervo/vila/IMG_3547.JPG',
    date: '16 de agosto de 2010',
    location: 'São Paulo',
    ref: 'Ofício nº 1088/2010/GP/GRPU/SP',
    description:
      'Resposta ao CONDEPHAAT sobre a titularidade dos bens da extinta RFFSA: a Estação de Rio Grande da Serra ainda não havia sido transferida à União.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-guiches',
    category: 'Processos de tombamento',
    title: 'Relação de processos sobre o conjunto de estações da antiga SPR',
    src: 'acervo/vila/IMG_3560.JPG',
    date: 's.d.',
    location: 'São Paulo',
    ref: 'CONDEPHAAT · nº 00969',
    description:
      'Lista de processos e guichês ligados às estações da linha — marco zero em Santos, ponto final em Jundiaí, Várzea Paulista, Ribeirão Pires — a apensar ao novo estudo de tombamento.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-mapa-cptm',
    category: 'Processos de tombamento',
    title: 'Mapa da rede metropolitana anotado à mão',
    src: 'acervo/vila/IMG_3506.JPG',
    date: '22 de maio de 2009',
    location: 'Região Metropolitana de São Paulo',
    ref: 'Anexo do processo',
    description:
      'Impressão do mapa da rede de trens metropolitanos com anotações manuscritas sobre as estações em estudo, juntada ao processo.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-moinho-folheto',
    category: 'Processos de tombamento',
    title: 'Folheto “Novo Centro Educacional de Ribeirão Pires”',
    src: 'acervo/vila/IMG_3668.JPG',
    date: 's.d.',
    location: 'Ribeirão Pires',
    ref: 'Anexo do processo',
    description:
      'Capa com a ruína de alvenaria e a chaminé do antigo moinho de Ribeirão Pires, objeto de estudo de tombamento.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-moinho-parecer',
    category: 'Processos de tombamento',
    title: 'Recomendações para o antigo Moinho de Ribeirão Pires',
    src: 'acervo/vila/IMG_3675.JPG',
    date: 's.d.',
    location: 'Ribeirão Pires',
    ref: 'Item 1.6 — Das recomendações',
    description:
      'O texto pede que o prédio seja mantido como patrimônio cultural — “não demolir” — e propõe gestão conjunta com o CONDEPHAAT.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-fabrica-sal',
    category: 'Processos de tombamento',
    title: 'Memorando sobre a Fábrica de Sal de Ribeirão Pires',
    src: 'acervo/vila/IMG_3678.JPG',
    date: '18 de maio de 2016',
    location: 'Ribeirão Pires',
    ref: 'Memorando UPPH nº 012/2016',
    description:
      'Pedido de avaliação da contaminação da área da Fábrica de Sal, à Av. Humberto de Campos, para subsidiar o estudo de tombamento em andamento.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-fabrica-parecer',
    category: 'Processos de tombamento',
    title: 'Parecer técnico sobre a fábrica e sua reconversão em escola',
    src: 'acervo/vila/IMG_3716.JPG',
    date: '2016',
    location: 'Ribeirão Pires',
    ref: 'Parecer Técnico UPPH nº GEI-2813-2016',
    description:
      'Página com foto do conjunto antes da intervenção e a avaliação do projeto que transformou a fábrica em escola, biblioteca e escola de música.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-correio',
    category: 'Processos de tombamento',
    title: 'Avisos de recebimento de ofícios do CONDEPHAAT',
    src: 'acervo/vila/IMG_3600.JPG',
    date: 'junho de 2011 e janeiro de 2012',
    location: 'São Paulo e Ribeirão Pires',
    ref: 'Ref.: Processo 60313',
    description:
      'Os comprovantes de correio guardados no processo mostram o caminho burocrático de uma notificação de tombamento.',
    source: PROCESS_SOURCE,
  },
  {
    id: 'proc-registro',
    category: 'Processos de tombamento',
    title: 'Averbação do tombamento no registro de imóveis',
    src: 'acervo/vila/IMG_3753.JPG',
    date: '22 de outubro de 2024',
    location: 'Ribeirão Pires',
    ref: 'Oficial de Registro de Imóveis de Ribeirão Pires',
    description:
      'Certidão que anota na matrícula do imóvel que ele não pode ser destruído, alterado ou restaurado sem prévia autorização do CONDEPHAAT.',
    source: PROCESS_SOURCE,
  },

  // ── A Serra vista do alto ──────────────────────────────────────────────
  {
    id: 'orb-1-patamar',
    category: 'A Serra vista do alto',
    title: '1º patamar e o pé da Serra',
    src: 'acervo/trilhas/1_patamar_com_chegada.png',
    date: 'Imagem orbital',
    location: 'Cubatão',
    description: 'A encosta coberta de mata entre o polo industrial de Cubatão e a subida da Serra, com a marcação do 1º patamar.',
    source: ORBITAL_SOURCE,
  },
  {
    id: 'orb-2-patamar',
    category: 'A Serra vista do alto',
    title: '2º patamar',
    src: 'acervo/trilhas/2_patamar.png',
    date: 'Imagem orbital',
    location: 'Serra do Mar',
    description: 'O traçado da linha corta a mata em diagonal; o ponto marca a máquina fixa do 2º patamar.',
    source: ORBITAL_SOURCE,
  },
  {
    id: 'orb-3-patamar',
    category: 'A Serra vista do alto',
    title: '3º patamar',
    src: 'acervo/trilhas/3_patamar.png',
    date: 'Imagem orbital',
    location: 'Serra do Mar',
    description: 'Trecho intermediário da subida, em plena mata atlântica.',
    source: ORBITAL_SOURCE,
  },
  {
    id: 'orb-4-patamar',
    category: 'A Serra vista do alto',
    title: 'Grota Funda e o 4º patamar',
    src: 'acervo/trilhas/grota_funda_4_patamar.png',
    date: 'Imagem orbital',
    location: 'Serra do Mar',
    description: 'A Grota Funda, com o 4º patamar e a chegada a Paranapiacaba no canto inferior direito.',
    source: ORBITAL_SOURCE,
  },
  {
    id: 'orb-santa-luzia',
    category: 'A Serra vista do alto',
    title: 'Arredores de Paranapiacaba e a Igreja de Santa Luzia',
    src: 'acervo/trilhas/igreja_de_santa_luzia.png',
    date: 'Imagem orbital',
    location: 'Alto da Serra',
    description: 'Vista mais aberta, com a vila, o Rio Grande e pontos de interesse marcados ao redor.',
    source: ORBITAL_SOURCE,
  },
  {
    id: 'orb-nascentes',
    category: 'A Serra vista do alto',
    title: 'Nascentes e cachoeiras',
    src: 'acervo/trilhas/nascente_e_cachoeiras.png',
    date: 'Imagem orbital',
    location: 'Parque Natural Municipal Nascentes de Paranapiacaba',
    description: 'Cachoeiras, poços e nascentes marcados na área do parque municipal.',
    source: ORBITAL_SOURCE,
  },
];

// Ordem canônica das categorias usada pelo filtro do arquivo. Derivada do
// próprio acervo para que nenhuma aba fique vazia nem uma imagem nova fique
// inacessível.
export const PHOTO_CATEGORIES = [
  'Todas',
  ...Array.from(new Set(PHOTO_ARCHIVE.map((photo) => photo.category)))
];

// Versão leve gerada por scripts/build_acervo_web.py:
// 'acervo/ferrovia/X.jpg' → 'acervo/_web/ferrovia/X-480.webp'
export function webImage(src, size = 480) {
  return src.replace(/^acervo\//, 'acervo/_web/').replace(/\.[a-z]+$/i, `-${size}.webp`);
}

export function photoById(id) {
  return PHOTO_ARCHIVE.find((photo) => photo.id === id) || null;
}
