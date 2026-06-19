// Guia de Estilo Oficial - WebGIS Paranapiacaba
// Paleta de cores canônica para camadas, trilhas por região, atrativos por tipo e patrimônio por instância

export const PALETTE = {
  // Território
  limite_sitio:   { stroke: '#C1121F', fill: '#C1121F', fillOpacity: 0.04 },
  limite_vila:    { stroke: '#C1121F', fill: '#C1121F', fillOpacity: 0.08 },
  ucs:            { stroke: '#1B4332', fill: '#2D6A4F', fillOpacity: 0.18 },

  // Trilhas por região (mesmas cores do gráfico de perfis altimétricos)
  trilha_cachoeiras:  '#1D6FA4',  // azul
  trilha_funicular:   '#E07B39',  // laranja
  trilha_quatinga:    '#7B4FAB',  // roxo
  trilha_rio_mogi:    '#2A9D8F',  // teal
  trilha_quilombo:    '#3A7D44',  // verde
  trilha_default:     '#FB5607',

  // Atrativos por tipo (ícones circulares coloridos)
  atrativo_cachoeira: '#4895EF',
  atrativo_poco:      '#4361EE',
  atrativo_mirante:   '#F4A261',
  atrativo_pedra:     '#8D99AE',
  atrativo_nascente:  '#52B788',
  atrativo_ruina:     '#BC6C25',
  atrativo_gruta:     '#6D6875',
  atrativo_default:   '#FF9F1C',

  // Patrimônio
  tombado_federal:    '#FFB703',
  tombado_estadual:   '#FB8500',
  tombado_municipal:  '#E76F51',

  // Infraestrutura
  ferrovia:           '#6D6875',
  funicular:          '#B5838D',
  hidrografia:        '#4895EF',
  app_buffer:         '#4CC9F0',

  // Socioeconomia
  censo:              '#9B5DE5',
};
