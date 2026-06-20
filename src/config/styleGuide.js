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

  // Infraestrutura / Ferrovia
  ferrovia:           '#6D6875',
  funicular:          '#B5838D',
  hidrografia:        '#4895EF',
  app_buffer:         '#4CC9F0',
  // Corredor ferroviário por situação operacional
  ferrovia_ativa:        '#1E293B',
  ferrovia_desativada:   '#9CA3AF',
  ferrovia_planejada:    '#0EA5E9',
  ferrovia_default:      '#1E293B',

  // Equipamentos urbanos
  equip_saude:        '#EF4444',
  equip_educacao:     '#3B82F6',
  equip_seguranca:    '#6366F1',

  // Socioeconomia
  censo:              '#9B5DE5',

  // Mobilidade urbana (linhas de ônibus por tipo)
  bus_municipal:      '#0D9488',
  bus_intermunicipal: '#7C3AED',

  // Vegetação — estágios de sucessão da Mata Atlântica
  veg_nao_macico:     '#C2C5AA',
  veg_pioneiro:       '#A7C957',
  veg_inicial:        '#74C69D',
  veg_medio:          '#40916C',
  veg_avancado:       '#1B4332',
  veg_default:        '#52B788',

  // Riscos (Defesa Civil / IPT) por grau
  risco_r1:           '#FCD34D',
  risco_r2:           '#FB923C',
  risco_r3:           '#EF4444',
  risco_r4:           '#991B1B',
  risco_sm:           '#64748B',
  risco_default:      '#EF4444',
};

// Ícone + cor de destaque por grupo de camadas — dá identidade visual a cada
// seção do painel lateral (pedido dos pesquisadores: distinguir os grupos).
export const GROUP_META = {
  'Ferrovia SPR (Jundiaí–Santos)': { icon: '🚂', accent: '#1E293B' },
  'Mobilidade':                    { icon: '🚌', accent: '#0891B2' },
  'Território':                    { icon: '🗺️', accent: '#64748B' },
  'Patrimônio':                    { icon: '🏛️', accent: '#B45309' },
  'Morfologia da Vila':            { icon: '🏘️', accent: '#E76F51' },
  'Meio Ambiente':                 { icon: '🌳', accent: '#2D6A4F' },
  'Turismo e Trilhas':             { icon: '🥾', accent: '#FB5607' },
  'Legislação e Planejamento':     { icon: '📐', accent: '#7C3AED' },
  'Socioeconomia':                 { icon: '📊', accent: '#9B5DE5' },
  'Equipamentos Urbanos':          { icon: '🏥', accent: '#EF4444' },
  'Riscos (Defesa Civil)':         { icon: '⚠️', accent: '#DC2626' },
};

const _norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Cor por estágio de sucessão da vegetação (classif_vegetal).
export function vegColor(classe) {
  const c = _norm(classe);
  if (c.includes('avancado')) return PALETTE.veg_avancado;
  if (c.includes('medio')) return PALETTE.veg_medio;
  if (c.includes('inicial')) return PALETTE.veg_inicial;
  if (c.includes('pionei')) return PALETTE.veg_pioneiro;
  if (c.includes('maci')) return PALETTE.veg_nao_macico;
  return PALETTE.veg_default;
}

// Cor por grau de risco (R1–R4 / SM) das camadas de Defesa Civil.
export function riskColor(grau) {
  const g = (grau || '').toUpperCase();
  if (g.includes('R4')) return PALETTE.risco_r4;
  if (g.includes('R3')) return PALETTE.risco_r3;
  if (g.includes('R2')) return PALETTE.risco_r2;
  if (g.includes('R1')) return PALETTE.risco_r1;
  if (g.includes('SM')) return PALETTE.risco_sm;
  return PALETTE.risco_default;
}

export function groupMeta(group) {
  return GROUP_META[group] || { icon: '📁', accent: '#64748B' };
}

// Descritor visual de uma camada para o "swatch" do painel — espelha como a
// feição é desenhada no mapa (linha / polígono / ponto), ajudando a identificá-la.
export function getLayerSymbol(layer) {
  const color = layer.color || '#94a3b8';
  if (layer.id === 'atrativos') return { kind: 'point', color, emoji: '📍' };
  return { kind: layer.type || 'point', color };
}
