// Configuração das camadas do WebGIS Paranapiacaba
// Cada camada contém: id, label, file, group, type, color, weight, fillOpacity, minZoom, visible, popupFields, description, available
// Todas as camadas são definidas como available: true por padrão para que o app tente buscá-las localmente

export const LAYERS = [
  // GRUPO "Território"
  {
    id: "limite_sitio",
    label: "Limite do Sítio UNESCO",
    file: "limite_sitio.geojson",
    group: "Território",
    type: "polygon",
    color: "#E63946",
    weight: 2.5,
    fillOpacity: 0.05,
    minZoom: 10,
    visible: true,
    popupFields: [],
    description: "Perímetro oficial do Sítio UNESCO de Paranapiacaba, conforme delimitação do IPHAN.",
    available: true
  },
  {
    id: "limite_vila",
    label: "Perímetro da Vila",
    file: "limite_vila.geojson",
    group: "Território",
    type: "polygon",
    color: "#E63946",
    weight: 1.5,
    fillOpacity: 0.08,
    minZoom: 12,
    visible: true,
    popupFields: [],
    description: "Perímetro do núcleo histórico da Vila ferroviária, fundada em 1867 pela São Paulo Railway.",
    available: true
  },
  {
    id: "ucs",
    label: "Unidades de Conservação",
    file: "ucs.geojson",
    group: "Território",
    type: "polygon",
    color: "#2D6A4F",
    weight: 1.5,
    fillOpacity: 0.15,
    minZoom: 10,
    visible: true,
    popupFields: [],
    description: "Unidades de Conservação: PESM Núcleo Itutinga-Pilões, REBio Alto da Serra e Parque Natural Municipal.",
    available: true
  },

  // GRUPO "Patrimônio"
  {
    id: "patrimonio_tombados",
    label: "Bens Tombados",
    file: "patrimonio_tombados.geojson",
    group: "Patrimônio",
    type: "polygon",
    color: "#E9C46A",
    weight: 1,
    fillOpacity: 0.4,
    minZoom: 14,
    visible: true,
    popupFields: [],
    description: "Bens tombados nas instâncias federal (IPHAN), estadual (CONDEPHAAT) e municipal (COMDEPHAAPASA).",
    available: true
  },
  {
    id: "edificacoes_vila",
    label: "Edificações da Vila",
    file: "edificacoes_vila.geojson",
    group: "Patrimônio",
    type: "polygon",
    color: "#F4A261",
    weight: 0.8,
    fillOpacity: 0.5,
    minZoom: 15,
    visible: false,
    popupFields: [],
    description: "Edificações inventariadas da Vila ferroviária de Paranapiacaba.",
    available: true
  },
  {
    id: "pac_lotes",
    label: "Lotes PAC (Restauro)",
    file: "pac_lotes.geojson",
    group: "Patrimônio",
    type: "polygon",
    color: "#E76F51",
    weight: 1,
    fillOpacity: 0.45,
    minZoom: 15,
    visible: false,
    popupFields: [],
    description: "Lotes beneficiados pelas obras do PAC Cidades Históricas (Restauro e Conservação).",
    available: true
  },

  // GRUPO "Meio Ambiente"
  {
    id: "hidrografia",
    label: "Hidrografia",
    file: "hidrografia.geojson",
    group: "Meio Ambiente",
    type: "line",
    color: "#4895EF",
    weight: 1.5,
    minZoom: 11,
    visible: true,
    popupFields: [],
    description: "Rede de drenagem com nascentes e canais principais, incluindo divisor Cubatão/Tietê.",
    available: true
  },
  {
    id: "nascentes",
    label: "Nascentes",
    file: "nascentes.geojson",
    group: "Meio Ambiente",
    type: "point",
    color: "#4895EF",
    minZoom: 13,
    visible: false,
    popupFields: [],
    description: "Pontos de surgência de água mapeados, fundamentais para a bacia hidrográfica local.",
    available: true
  },
  {
    id: "app_buffers",
    label: "APPs (buffer 30m)",
    file: "app_buffers.geojson",
    group: "Meio Ambiente",
    type: "polygon",
    color: "#4CC9F0",
    weight: 0.5,
    fillOpacity: 0.2,
    minZoom: 13,
    visible: false,
    popupFields: [],
    description: "Áreas de Preservação Permanente (APPs) geradas com buffer de 30 metros ao redor dos corpos hídricos.",
    available: true
  },
  {
    id: "declividade",
    label: "Classes de Declividade",
    file: "declividade.geojson",
    group: "Meio Ambiente",
    type: "polygon",
    color: "#8338EC",
    weight: 0,
    fillOpacity: 0.35,
    minZoom: 12,
    visible: false,
    popupFields: [],
    description: "Classes de declividade do terreno expressas em porcentagem, auxiliando na análise de relevo.",
    available: true
  },

  // GRUPO "Turismo e Trilhas"
  {
    id: "trilhas",
    label: "Rede de Trilhas",
    file: "trilhas.geojson",
    group: "Turismo e Trilhas",
    type: "line",
    color: "#FB5607",
    weight: 2,
    minZoom: 11,
    visible: true,
    popupFields: [],
    description: "45 trilhas mapeadas via GPS Wikiloc (~763 km total), categorizadas por região, tipo e dificuldade.",
    available: true
  },
  {
    id: "atrativos",
    label: "Atrativos Naturais (331)",
    file: "atrativos.geojson",
    group: "Turismo e Trilhas",
    type: "point",
    color: "#FF9F1C",
    minZoom: 12,
    visible: true,
    popupFields: [],
    description: "331 atrativos naturais classificados: 145 cachoeiras, 64 poços, 60 mirantes, 42 pedras, 7 nascentes, 9 ruínas e 4 grutas.",
    available: true
  },
  {
    id: "circuitos",
    label: "Circuitos Turísticos",
    file: "circuitos.geojson",
    group: "Turismo e Trilhas",
    type: "line",
    color: "#FFBF69",
    weight: 2.5,
    minZoom: 12,
    visible: false,
    popupFields: [],
    description: "Circuitos de caminhada e turismo auto-guiados ou com monitoria na região.",
    available: true
  },

  // GRUPO "Infraestrutura"
  {
    id: "ferrovia",
    label: "Ferrovia Histórica",
    file: "ferrovia.geojson",
    group: "Infraestrutura",
    type: "line",
    color: "#6D6875",
    weight: 2,
    minZoom: 11,
    visible: true,
    popupFields: [],
    description: "Leito ferroviário histórico da São Paulo Railway (1867), atual CPTM Linha 10-Turquesa.",
    available: true
  },
  {
    id: "funicular",
    label: "Leito do Funicular",
    file: "funicular.geojson",
    group: "Infraestrutura",
    type: "line",
    color: "#B5838D",
    weight: 1.5,
    minZoom: 13,
    visible: false,
    popupFields: [],
    description: "Leito inclinado do antigo Funicular da Serra do Mar (Serra Velha de 1867 e Serra Nova de 1901).",
    available: true
  },

  // GRUPO "Socioeconomia"
  {
    id: "censo_setores",
    label: "Setores Censitários 2022",
    file: "censo_setores.geojson",
    group: "Socioeconomia",
    type: "polygon",
    color: "#9B5DE5",
    weight: 0.8,
    fillOpacity: 0.3,
    minZoom: 12,
    visible: false,
    popupFields: [],
    description: "Setores censitários do Censo IBGE 2022 recortados para o distrito de Paranapiacaba.",
    available: true
  },
  {
    id: "densidade",
    label: "Densidade Demográfica",
    file: "densidade.geojson",
    group: "Socioeconomia",
    type: "polygon",
    color: "#F15BB5",
    weight: 0,
    fillOpacity: 0.5,
    minZoom: 12,
    visible: false,
    popupFields: [],
    description: "Densidade demográfica obtida por setor censitário no distrito de Paranapiacaba.",
    available: true
  }
];

// Auxiliar para agrupar as camadas por grupo
export const GROUPS = [...new Set(LAYERS.map(layer => layer.group))];
