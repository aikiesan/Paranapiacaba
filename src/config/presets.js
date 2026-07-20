// Predefinições temáticas — um clique ativa um conjunto curado de camadas e o
// basemap mais adequado para cada tipo de mapa do dossiê. As camadas referenciam
// `id`s de src/config/layers.js e o basemap referencia `id`s de BasemapSelector.

export const PRESETS = [
  {
    id: 'prancha_conservacao',
    label: 'Prancha 1: Conservação (Semáforo)',
    icon: '🏢',
    basemap: 'satellite',
    description: 'Relatório de levantamento de campo: estado de conservação das edificações (conservados, mau estado, descaracterizados e ruínas).',
    layers: [
      'limite_vila', 'edificacoes_vila', 'patrimonio_ferroviario', 'sistema_viario', 'caminhos_vila'
    ],
    buildingMode: 'conservacao'
  },
  {
    id: 'prancha_uso_solo',
    label: 'Prancha 2: Uso do Solo (1:1.000 IBGE)',
    icon: '🎨',
    basemap: 'satellite',
    description: 'Mapeamento urbano em microescala (1:1.000) com paleta qualitativa IBGE (residencial, serviços, cultura, ferrovia e solo exposto).',
    layers: [
      'limite_vila', 'edificacoes_vila', 'pac_lotes', 'abpf', 'ferrovia_local', 'sistema_viario'
    ],
    buildingMode: 'uso'
  },
  {
    id: 'prancha_tombamentos',
    label: 'Prancha 3: Tombamentos & UNESCO',
    icon: '🏛️',
    basemap: 'satellite',
    description: 'Jurisdições sobrepostas em polígonos vazios (IPHAN Vinho, CONDEPHAAT Carmim, COMDEPHAAPASA Vermelho e Dourado UNESCO).',
    layers: [
      'limite_sitio', 'limite_vila', 'patrimonio_tombados', 'areas_envoltorias', 'bens_estudo', 'ucs'
    ]
  },
  {
    id: 'prancha_hidrica_redes',
    label: 'Prancha 4: Rede Hídrica & Infraestrutura',
    icon: '💧',
    basemap: 'terrain',
    description: 'Corpos d\'água em azul exclusivo (#0070C0), APPs verde claro (#A9D08E 40%) e rede de eletricidade tracejada.',
    layers: [
      'hidrografia', 'nascentes', 'subbacias', 'app_buffers', 'app_sul', 'rios_sul', 'rede_eletrica'
    ]
  },
  {
    id: 'prancha_hipsometria',
    label: 'Prancha 5: Hipsometria & Escarpa',
    icon: '⛰️',
    basemap: 'terrain',
    description: 'Estrutura altimétrica com curvas de nível em sépia (#833C0C) e transição sequencial de altitudes.',
    layers: [
      'curvas_nivel', 'altimetria_serra', 'hidrografia', 'limite_vila', 'funicular'
    ]
  },
  {
    id: 'unesco',
    label: 'Síntese UNESCO',
    icon: '🌍',
    basemap: 'satellite',
    description: 'Visão de síntese para o dossiê: sítio, vila, ferrovia, tombamentos, UCs e atrativos.',
    layers: [
      'limite_sitio', 'limite_vila', 'ferrovia_corredor', 'estacoes',
      'patrimonio_tombados', 'areas_envoltorias', 'edificacoes_vila', 'ucs', 'atrativos',
    ],
  },
  {
    id: 'ambiente',
    label: 'Meio Ambiente & Mata Atlântica',
    icon: '🌳',
    basemap: 'terrain',
    description: 'Unidades de conservação, cobertura vegetal (Mata Atlântica #385723), bacias e nascentes.',
    layers: [
      'ucs', 'pnm_nascentes', 'classif_vegetal', 'app_sul', 'subbacias',
      'regioes_hidrograficas', 'hidrografia', 'nascentes', 'app_buffers',
    ],
  },
  {
    id: 'riscos',
    label: 'Riscos & Defesa Civil',
    icon: '⚠️',
    basemap: 'terrain',
    description: 'Ameaças à conservação: deslizamentos (IPT), incêndio e relevo da escarpa.',
    layers: [
      'limite_vila', 'ferrovia_corredor', 'susc_movmas', 'risco_movmas',
      'risco_incendio', 'classif_vegetal', 'altimetria_serra',
    ],
  },
  {
    id: 'mobilidade',
    label: 'Mobilidade & Ferrovia',
    icon: '🚂',
    basemap: 'osm',
    description: 'Ferrovia histórica SPR, funicular e redes de transporte.',
    layers: [
      'ferrovia_corredor', 'estacoes', 'funicular', 'ferrovia_rmsp',
      'rodovias', 'mobilidade_urbana',
    ],
  },
];

