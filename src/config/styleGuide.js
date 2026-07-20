// Guia de Estilo Oficial - WebGIS Paranapiacaba (Padrão IBGE)
// Paleta de cores canônica para camadas, uso do solo, conservação de edificações,
// limites institucionais sem preenchimento, hidrografia exclusiva e infraestrutura.

export const PALETTE = {
  // --- Uso e Ocupação do Solo (Padrão IBGE - Escala 1:1.000) ---
  uso_residencial:      '#FCE4D6',  // Amarelo / Laranja Claro (Habitação / Residencial)
  uso_residencial_alt:  '#FFC000',  // Amarelo Vivo
  uso_servicos:         '#BDD7EE',  // Azul Claro (Prédios públicos, subprefeitura)
  uso_turismo_cultura:  '#E1BEE7',  // Roxo Claro / Violeta (ABPF, Funicular, Museus)
  uso_ferrovia:         '#595959',  // Cinza Escuro / Grafite (Corredores ativos e pátios)
  uso_vegetacao:        '#385723',  // Verde Floresta Escuro (Mata Atlântica)
  uso_solo_exposto:     '#FFF2CC',  // Bege / Areia Claro (Lotes/solo exposto)

  // --- Território e Unidades de Conservação ---
  limite_sitio:   { stroke: '#C1121F', fill: '#C1121F', fillOpacity: 0.04 },
  limite_vila:    { stroke: '#8B4513', fill: '#8B4513', fillOpacity: 0.05 }, // ZEIP hachura/borda marrom
  ucs:            { stroke: '#4B5320', fill: 'transparent', fillOpacity: 0 },  // Verde Oliva (Rebio/UCs)

  // --- Patrimônio e Tombamentos (IBGE: Polígonos Vazios com Bordas Coloridas) ---
  tombado_federal:    { stroke: '#581845', weight: 3, fill: 'transparent' }, // Vinho / Ameixa (IPHAN)
  tombado_estadual:   { stroke: '#900C3F', weight: 2, fill: 'transparent' }, // Carmim (CONDEPHAAT)
  tombado_municipal:  { stroke: '#FF5733', weight: 1.5, fill: 'transparent' }, // Vermelho (COMDEPHAAPASA)
  area_unesco:        { stroke: '#D4AF37', weight: 2, dashArray: '6 4', fill: 'transparent' }, // Borda Dourada Tracejada
  zeip_zona:          { stroke: '#8B4513', weight: 1.5, fill: 'transparent' }, // ZEIP marrom

  // --- Infraestrutura e Redes ---
  hidrografia:        '#0070C0',  // Ciano a Azul Escuro (RESERVADO EXCLUSIVO PARA HIDROGRAFIA)
  nascentes:          '#0070C0',  // Pontos de nascente hídrica
  app_buffer:         '#A9D08E',  // Verde Claro Semi-transparente (40% opacidade)
  rede_eletrica:      '#FF0000',  // Linha tracejada Vermelho Vivo

  // --- Trilhas por Tipologia ---
  trilha_oficial:     '#00B050',  // Verde Esmeralda (Linha sólida - Subprefeitura)
  trilha_wikiloc:     '#C65911',  // Marrom / Ocre (Linha tracejada - Usuários)
  trilha_tecnica:     '#333333',  // Grafite (Linha fina com estilo férreo)

  // Trilhas por região (compatibilidade altimétrica)
  trilha_cachoeiras:  '#1D6FA4',
  trilha_funicular:   '#E07B39',
  trilha_quatinga:    '#7B4FAB',
  trilha_rio_mogi:    '#2A9D8F',
  trilha_quilombo:    '#3A7D44',
  trilha_default:     '#C65911',

  // Atrativos por tipo
  atrativo_cachoeira: '#0070C0',
  atrativo_poco:      '#0070C0',
  atrativo_mirante:   '#F4A261',
  atrativo_pedra:     '#8D99AE',
  atrativo_nascente:  '#0070C0',
  atrativo_ruina:     '#E1BEE7',
  atrativo_gruta:     '#6D6875',
  atrativo_default:   '#FF9F1C',

  // Ferrovia / Estações (Cinza Grafite / Neutro - Sem utilizar azul)
  ferrovia:           '#595959',
  funicular:          '#595959',
  ferrovia_ativa:     '#595959',
  ferrovia_desativada:'#9CA3AF',
  ferrovia_planejada: '#78716C',
  ferrovia_estacao:   '#333333',
  ferrovia_default:   '#595959',

  // Equipamentos urbanos (Sem azul genérico)
  equip_saude:        '#EF4444',
  equip_educacao:     '#BDD7EE',  // Azul Claro IBGE
  equip_seguranca:    '#6366F1',

  // Altimetria e Curvas de Nível
  curvas_nivel_sepia: '#833C0C',

  // Socioeconomia
  censo:              '#9B5DE5',

  // Mobilidade urbana
  bus_municipal:      '#0D9488',
  bus_intermunicipal: '#7C3AED',

  // Vegetação — estágios de sucessão da Mata Atlântica (base IBGE #385723)
  veg_nao_macico:     '#C2C5AA',
  veg_pioneiro:       '#A7C957',
  veg_inicial:        '#74C69D',
  veg_medio:          '#40916C',
  veg_avancado:       '#385723',  // Verde Floresta Escuro IBGE
  veg_default:        '#385723',

  // Riscos (Defesa Civil / IPT) por grau
  risco_r1:           '#FCD34D',
  risco_r2:           '#FB923C',
  risco_r3:           '#EF4444',
  risco_r4:           '#991B1B',
  risco_sm:           '#64748B',
  risco_default:      '#EF4444',
};

// --- Escala Coroplética do Estado de Conservação das Edificações (Semáforo IBGE) ---
export const CONSERVATION_PALETTE = {
  conservado:         { fill: '#C6EFCE', stroke: '#006100', label: 'Conservado (Estável/Sádio)' },
  mau_estado:         { fill: '#FFEB9C', stroke: '#9C6500', label: 'Mau Estado (Necessita Manutenção)' },
  descaracterizado:   { fill: '#F8CBAD', stroke: '#843C0C', label: 'Descaracterizado (Acréscimos Fora de Padrão)' },
  ruinas:             { fill: '#FFC7CE', stroke: '#9C0006', label: 'Em Ruínas (Alta Vulnerabilidade)' },
  default:            { fill: '#FCE4D6', stroke: '#D97706', label: 'Não Avaliado / Residencial' }
};

// Ícone + cor de destaque por grupo de camadas
export const GROUP_META = {
  'Ferrovia SPR (Jundiaí–Santos)': { icon: '🚂', accent: '#595959' },
  'Mobilidade':                    { icon: '🚌', accent: '#0891B2' },
  'Território':                    { icon: '🗺️', accent: '#64748B' },
  'Patrimônio':                    { icon: '🏛️', accent: '#581845' },
  'Morfologia da Vila':            { icon: '🏘️', accent: '#FCE4D6' },
  'Meio Ambiente':                 { icon: '🌳', accent: '#385723' },
  'Turismo e Trilhas':             { icon: '🥾', accent: '#00B050' },
  'Legislação e Planejamento':     { icon: '📐', accent: '#7C3AED' },
  'Socioeconomia':                 { icon: '📊', accent: '#9B5DE5' },
  'Equipamentos Urbanos':          { icon: '🏥', accent: '#BDD7EE' },
  'Riscos (Defesa Civil)':         { icon: '⚠️', accent: '#DC2626' },
};

const _norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Retorna estilo do estado de conservação de edificação
export function conservationColor(estado) {
  const e = _norm(estado);
  if (e.includes('conservad') || e.includes('bom') || e.includes('otimo')) return CONSERVATION_PALETTE.conservado;
  if (e.includes('mau') || e.includes('regular') || e.includes('recupera')) return CONSERVATION_PALETTE.mau_estado;
  if (e.includes('descaract') || e.includes('alterad')) return CONSERVATION_PALETTE.descaracterizado;
  if (e.includes('ruina') || e.includes('pessim') || e.includes('precari')) return CONSERVATION_PALETTE.ruinas;
  return CONSERVATION_PALETTE.default;
}

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

// Descritor visual de uma camada para o "swatch" do painel
export function getLayerSymbol(layer) {
  const color = layer.color || '#94a3b8';
  if (layer.id === 'atrativos') return { kind: 'point', color, emoji: '📍' };
  return { kind: layer.type || 'point', color };
}

