// Predefinições temáticas — um clique ativa um conjunto curado de camadas e o
// basemap mais adequado para cada tipo de mapa do dossiê. As camadas referenciam
// `id`s de src/config/layers.js e o basemap referencia `id`s de BasemapSelector.

export const PRESETS = [
  {
    id: 'unesco',
    label: 'Síntese UNESCO',
    icon: '🏛️',
    basemap: 'satellite',
    description: 'Visão de síntese para o dossiê: sítio, vila, ferrovia, tombamentos, UCs e atrativos.',
    layers: [
      'limite_sitio', 'limite_vila', 'ferrovia_corredor', 'estacoes',
      'patrimonio_tombados', 'areas_envoltorias', 'edificacoes_vila', 'ucs', 'atrativos',
    ],
  },
  {
    id: 'patrimonio',
    label: 'Patrimônio',
    icon: '🏘️',
    basemap: 'satellite',
    description: 'Camadas de patrimônio material e morfologia da vila.',
    layers: [
      'limite_vila', 'patrimonio_tombados', 'areas_envoltorias', 'bens_registrados',
      'bens_estudo', 'edificacoes_vila', 'edificacoes_cad', 'patrimonio_ferroviario', 'abpf',
    ],
  },
  {
    id: 'ambiente',
    label: 'Meio Ambiente',
    icon: '🌳',
    basemap: 'terrain',
    description: 'Unidades de conservação, bacias, hidrografia e relevo.',
    layers: [
      'ucs', 'pnm_nascentes', 'classif_vegetal', 'app_sul', 'subbacias',
      'regioes_hidrograficas', 'hidrografia', 'nascentes', 'app_buffers',
    ],
  },
  {
    id: 'riscos',
    label: 'Riscos & Serra',
    icon: '⚠️',
    basemap: 'terrain',
    description: 'Ameaças à conservação: deslizamentos, incêndio e relevo da escarpa.',
    layers: [
      'limite_vila', 'ferrovia_corredor', 'susc_movmas', 'risco_movmas',
      'risco_incendio', 'classif_vegetal', 'altimetria_serra',
    ],
  },
  {
    id: 'mobilidade',
    label: 'Mobilidade',
    icon: '🚂',
    basemap: 'osm',
    description: 'Ferrovia histórica, funicular e redes de transporte.',
    layers: [
      'ferrovia_corredor', 'estacoes', 'funicular', 'ferrovia_rmsp',
      'rodovias', 'mobilidade_urbana',
    ],
  },
];
