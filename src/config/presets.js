// Predefinições temáticas — um clique ativa um conjunto curado de camadas e o
// basemap mais adequado para cada tipo de mapa do dossiê. As camadas referenciam
// `id`s de src/config/layers.js e o basemap referencia `id`s de BasemapSelector.
//
// `family` agrupa as predefinições no painel flutuante de Mapas Temáticos.
// `zoomLevel`, quando presente, é o zoom máximo do enquadramento automático —
// é o que materializa a escala anunciada em `targetScale`.

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
    buildingMode: 'conservacao'
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
    buildingMode: 'uso'
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
    ]
  },
  {
    id: 'prancha_hidrica_redes',
    family: 'prancha',
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
    family: 'prancha',
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
      'ucs', 'pnm_nascentes', 'classif_vegetal', 'app_sul', 'subbacias',
      'regioes_hidrograficas', 'hidrografia', 'nascentes', 'app_buffers',
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
    zoomLevel: 17.5
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
    zoomLevel: 15.5
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
    zoomLevel: 13.5
  },
  {
    id: 'escala_1_50000',
    family: 'escala',
    label: 'Escala 1:50.000 (Corredor SPR Santos–Jundiaí)',
    icon: '🗺️',
    basemap: 'terrain',
    description: 'Escala territorial macro (1:50.000): Corredor histórico São Paulo Railway de Santos a Jundiaí (139 km), bacias hidrográficas e conexões regionais.',
    layers: [
      'ferrovia_corredor', 'estacoes', 'municipios_corredor', 'grande_abc', 'regioes_hidrograficas', 'reservatorios'
    ],
    targetScale: '1:50.000',
    zoomLevel: 10.5
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
