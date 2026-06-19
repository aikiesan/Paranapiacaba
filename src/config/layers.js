// Configuração das camadas do WebGIS Paranapiacaba
// Cada camada contém: id, label, file, group, type, color, weight, fillOpacity, minZoom, visible, popupFields

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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
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
    popupFields: []
  }
];

// Auxiliar para agrupar as camadas por grupo
export const GROUPS = [...new Set(LAYERS.map(layer => layer.group))];
