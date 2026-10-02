// Predefinições temáticas — um clique ativa um conjunto curado de camadas e o
// basemap mais adequado para cada tipo de mapa do dossiê. As camadas referenciam
// `id`s de src/config/layers.js e o basemap referencia `id`s de BasemapSelector.
//
// `family` agrupa as predefinições no painel flutuante de Mapas Temáticos.
// `center` + `zoomLevel` fixam posição e escala cartográfica de forma
// determinística; presets sem centro continuam usando a união das extensões.

import { zoomForScale } from '../utils/mapScale';

const VILA_CENTER = [-23.778, -46.3045];
const REGIONAL_CENTER = [-23.77, -46.31];
// Entre a escarpa (Vila) e o Parque Andreense, a oeste.
const SERRA_CENTER = [-23.775, -46.38];
// Centro do corredor Jundiaí–Santos (extensão de ferrovia_corredor).
const CORREDOR_CENTER = [-23.575, -46.6];

export const PRESETS = [
  {
    id: 'prancha_conservacao',
    family: 'prancha',
    label: 'Prancha 1: Conservação (Semáforo)',
    icon: '🏢',
    basemap: 'satellite',
    description: 'Relatório de levantamento de campo: estado de conservação das edificações (conservados, mau estado, descaracterizados e ruínas).',
    layers: [
      'limite_vila', 'edificacoes_vila', 'patrimonio_ferroviario', 'sistema_viario', 'caminhos_vila'
    ],
    buildingMode: 'conservacao',
    targetScale: '1:1.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(1000, VILA_CENTER[0])
  },
  {
    id: 'prancha_uso_solo',
    family: 'prancha',
    label: 'Prancha 2: Uso do Solo (1:1.000 IBGE)',
    icon: '🎨',
    basemap: 'satellite',
    description: 'Mapeamento urbano em microescala (1:1.000) com paleta qualitativa IBGE (residencial, serviços, cultura, ferrovia e solo exposto).',
    layers: [
      'limite_vila', 'edificacoes_vila', 'pac_lotes', 'abpf', 'ferrovia_local', 'sistema_viario'
    ],
    buildingMode: 'uso',
    targetScale: '1:1.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(1000, VILA_CENTER[0])
  },
  {
    id: 'prancha_tombamentos',
    family: 'prancha',
    label: 'Prancha 3: Tombamentos & UNESCO',
    icon: '🏛️',
    basemap: 'satellite',
    description: 'Jurisdições sobrepostas em polígonos vazios (IPHAN Vinho, CONDEPHAAT Carmim, COMDEPHAAPASA Vermelho e Dourado UNESCO).',
    layers: [
      'limite_vila', 'patrimonio_tombados', 'areas_envoltorias', 'bens_estudo', 'ucs'
    ],
    targetScale: '1:10.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(10000, VILA_CENTER[0])
  },
  {
    id: 'prancha_hidrica_redes',
    family: 'prancha',
    label: 'Prancha 4: Hidrografia Regional Completa',
    icon: '💧',
    basemap: 'terrain',
    description: 'Rede hídrica regional conectada às nascentes, APPs, sub-bacias e áreas de proteção e recuperação de mananciais.',
    layers: [
      'hidrografia_regional', 'nascentes_regionais', 'apps_hidricas_regionais',
      'subbacias_ugrhi6', 'apm_aprm_regionais'
    ],
    targetScale: '1:50.000',
    center: REGIONAL_CENTER,
    zoomLevel: zoomForScale(50000, REGIONAL_CENTER[0])
  },
  {
    id: 'prancha_hipsometria',
    family: 'prancha',
    label: 'Prancha 5: Hipsometria & Escarpa',
    icon: '⛰️',
    basemap: 'terrain',
    description: 'Estrutura altimétrica com curvas da Vila em cadência nominal de 5 m, curvas-mestras regionais e transição sequencial de altitudes.',
    layers: [
      'curvas_nivel', 'altimetria_serra', 'hidrografia', 'limite_vila', 'funicular'
    ],
    targetScale: '1:20.000',
    center: REGIONAL_CENTER,
    zoomLevel: zoomForScale(20000, REGIONAL_CENTER[0])
  },
  {
    id: 'unesco',
    family: 'tematico',
    label: 'Síntese UNESCO',
    icon: '🌍',
    basemap: 'satellite',
    description: 'Visão de síntese para o dossiê: sítio, vila, ferrovia, tombamentos, UCs e atrativos.',
    layers: [
      'limite_vila', 'ferrovia_corredor', 'estacoes',
      'patrimonio_tombados', 'areas_envoltorias', 'edificacoes_vila', 'ucs', 'atrativos',
    ],
  },
  {
    id: 'ambiente',
    family: 'tematico',
    label: 'Meio Ambiente & Mata Atlântica',
    icon: '🌳',
    basemap: 'terrain',
    description: 'Unidades de conservação, cobertura vegetal (Mata Atlântica #385723), bacias e nascentes.',
    layers: [
      'ucs', 'pnm_nascentes', 'classif_vegetal', 'apps_hidricas_regionais',
      'subbacias_ugrhi6', 'regioes_hidrograficas', 'hidrografia_regional',
      'nascentes_regionais', 'apm_aprm_regionais',
    ],
  },
  {
    id: 'riscos',
    family: 'tematico',
    label: 'Riscos & Defesa Civil',
    icon: '⚠️',
    basemap: 'terrain',
    description: 'Ameaças à conservação: deslizamentos (IPT), incêndio e relevo da escarpa.',
    layers: [
      'limite_vila', 'ferrovia_corredor', 'susc_movmas', 'risco_movmas',
      'risco_incendio', 'classif_vegetal', 'altimetria_serra',
    ],
  },
  // As 4 escalas de navegação combinadas com a equipe (reunião de 25/09/2026),
  // do lote ao corredor. A escala é a de tela (96 dpi): as duas mais amplas
  // foram escolhidas para que a área inteira caiba numa tela de notebook.
  {
    id: 'escala_vila',
    family: 'escala',
    label: '1:1.000 · Vila (lote a lote)',
    icon: '🔍',
    basemap: 'satellite',
    description: 'Detalhe urbano máximo: Parte Baixa, Parte Alta e Rabique com estado de conservação e uso do solo lote a lote.',
    layers: [
      'limite_vila', 'zeip_subdivisoes', 'edificacoes_vila', 'pac_lotes', 'edificacoes_cad', 'sistema_viario', 'caminhos_vila'
    ],
    targetScale: '1:1.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(1000, VILA_CENTER[0])
  },
  {
    id: 'escala_sitio',
    family: 'escala',
    label: '1:10.000 · Sítio de Paranapiacaba',
    icon: '🏘️',
    basemap: 'ortofoto2010',
    description: 'Contexto do sítio: Vila, patrimônio ferroviário, Planos Inclinados do Funicular, áreas envoltórias e rede hídrica detalhada.',
    layers: [
      'limite_vila', 'patrimonio_ferroviario', 'funicular',
      'areas_envoltorias', 'hidrografia_regional', 'nascentes_regionais'
    ],
    targetScale: '1:10.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(10000, VILA_CENTER[0])
  },
  {
    id: 'escala_serra',
    family: 'escala',
    label: '1:100.000 · Serra do Mar ao Parque Andreense',
    icon: '⛰️',
    basemap: 'terrain',
    description: 'Área de estudo ampliada: escarpa da Serra do Mar, relevo e declividade, unidades de conservação, sub-bacias do divisor de águas e o Parque Andreense.',
    layers: [
      'altimetria_serra', 'declividade', 'ucs', 'pnm_nascentes', 'parque_andreense',
      'subbacias', 'hidrografia_regional', 'limite_vila', 'funicular'
    ],
    targetScale: '1:100.000',
    center: SERRA_CENTER,
    zoomLevel: zoomForScale(100000, SERRA_CENTER[0])
  },
  {
    id: 'escala_corredor',
    family: 'escala',
    label: '1:500.000 · Corredor Jundiaí–Santos',
    icon: '🗺️',
    basemap: 'terrain',
    description: 'Escala mais ampla: o corredor da São Paulo Railway inteiro sobre as regiões hidrográficas e as sub-bacias do Alto Tietê (UGRHI 6) e da Baixada Santista.',
    layers: [
      'ferrovia_corredor', 'estacoes', 'regioes_hidrograficas', 'subbacias_ugrhi6', 'municipios_corredor'
    ],
    targetScale: '1:500.000',
    center: CORREDOR_CENTER,
    zoomLevel: zoomForScale(500000, CORREDOR_CENTER[0])
  }
];

// Famílias exibidas no painel de Mapas Temáticos, na ordem de apresentação.
export const PRESET_FAMILIES = [
  { id: 'prancha', label: 'Pranchas do dossiê', hint: 'Composições prontas para impressão A0' },
  { id: 'tematico', label: 'Sínteses temáticas', hint: 'Recortes por tema de análise' },
  { id: 'escala', label: 'Por escala', hint: 'Do lote à escala territorial' }
];

export function presetsByFamily(familyId) {
  return PRESETS.filter((preset) => preset.family === familyId);
}
