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
      'patrimonio_tombados', 'edificacoes_vila', 'ucs', 'atrativos',
    ],
  },
  {
    id: 'patrimonio',
    label: 'Patrimônio',
    icon: '🏘️',
    basemap: 'satellite',
    description: 'Camadas de patrimônio material e morfologia da vila.',
    layers: [
      'limite_vila', 'patrimonio_tombados', 'bens_registrados', 'bens_estudo',
      'edificacoes_vila', 'edificacoes_cad', 'patrimonio_ferroviario', 'abpf',
    ],
  },
  {
    id: 'ambiente',
    label: 'Meio Ambiente',
    icon: '🌳',
    basemap: 'terrain',
    description: 'Unidades de conservação, bacias, hidrografia e relevo.',
    layers: [
      'ucs', 'subbacias', 'regioes_hidrograficas', 'hidrografia',
      'nascentes', 'app_buffers', 'curvas_nivel',
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
