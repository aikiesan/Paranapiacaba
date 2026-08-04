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
      'limite_sitio', 'limite_vila', 'patrimonio_tombados', 'areas_envoltorias', 'bens_estudo', 'ucs'
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
    description: 'Rede hídrica regional completa, nascentes, APPs, sub-bacias e áreas de proteção e recuperação de mananciais.',
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
    description: 'Estrutura altimétrica com curvas de nível em sépia (#833C0C) e transição sequencial de altitudes.',
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
      'limite_sitio', 'limite_vila', 'ferrovia_corredor', 'estacoes',
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
  {
    id: 'escala_1_1000',
    family: 'escala',
    label: 'Escala 1:1.000 (Vila Completa)',
    icon: '🔍',
    basemap: 'satellite',
    description: 'Escala de detalhamento urbano máximo (1:1.000): Parte Baixa, Parte Alta e Rabique com estado de conservação e uso do solo lote a lote.',
    layers: [
      'limite_vila', 'zeip_subdivisoes', 'edificacoes_vila', 'pac_lotes', 'edificacoes_cad', 'sistema_viario', 'caminhos_vila'
    ],
    targetScale: '1:1.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(1000, VILA_CENTER[0])
  },
  {
    id: 'escala_1_5000',
    family: 'escala',
    label: 'Escala 1:5.000 (Área Intermediária)',
    icon: '🏙️',
    basemap: 'satellite',
    description: 'Escala intermediária (1:5.000): Vila de Paranapiacaba, 5 Planos Inclinados do Funicular e PNM Nascentes.',
    layers: [
      'limite_vila', 'patrimonio_ferroviario', 'funicular', 'pnm_nascentes', 'curvas_nivel', 'hidrografia', 'atrativos'
    ],
    targetScale: '1:5.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(5000, VILA_CENTER[0])
  },
  {
    id: 'escala_1_10000',
    family: 'escala',
    label: 'Escala 1:10.000 (Sítio de Paranapiacaba)',
    icon: '🗺️',
    basemap: 'ortofoto2010',
    description: 'Escala de contexto do sítio: Vila, patrimônio, funicular, limites de proteção e rede hídrica detalhada.',
    layers: [
      'limite_sitio', 'limite_vila', 'patrimonio_ferroviario', 'funicular',
      'areas_envoltorias', 'hidrografia_regional', 'nascentes_regionais'
    ],
    targetScale: '1:10.000',
    center: VILA_CENTER,
    zoomLevel: zoomForScale(10000, VILA_CENTER[0])
  },
  {
    id: 'escala_1_20000',
    family: 'escala',
    label: 'Escala 1:20.000 (Área de Proteção)',
    icon: '🛡️',
    basemap: 'terrain',
    description: 'Escala regional de conservação (1:20.000): Reserva Biológica Alto da Serra, unidades de conservação e sub-bacias hidrográficas.',
    layers: [
      'ucs', 'pnm_nascentes', 'subbacias', 'regioes_hidrograficas', 'classif_vegetal', 'trilhas', 'areas_envoltorias'
    ],
    targetScale: '1:20.000',
    center: REGIONAL_CENTER,
    zoomLevel: zoomForScale(20000, REGIONAL_CENTER[0])
  },
  {
    id: 'escala_1_50000',
    family: 'escala',
    label: 'Escala 1:50.000 (Região de Paranapiacaba)',
    icon: '🗺️',
    basemap: 'terrain',
    description: 'Escala regional (1:50.000): Serra do Mar, rede hidrográfica completa, mananciais, sub-bacias, unidades de conservação e conexões ferroviárias.',
    layers: [
      'ferrovia_corredor', 'hidrografia_regional', 'nascentes_regionais',
      'subbacias_ugrhi6', 'apm_aprm_regionais', 'ucs', 'regioes_hidrograficas'
    ],
    targetScale: '1:50.000',
    center: REGIONAL_CENTER,
    zoomLevel: zoomForScale(50000, REGIONAL_CENTER[0])
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
