// Estrutura do catálogo de camadas, espelhando o Caderno de Mapas do dossiê
// (sequência temática aprovada na reunião FAPESP de 19/06/2026: do macro ao
// micro, do físico ao social). Cada eixo tem um numeral romano e cada seção um
// código estável ("2.2") — o mesmo código aparece no painel, na legenda e nos
// links compartilhados, à maneira do sistema de tutela do PPTR da Puglia.
//
// A ordem aqui é a ordem do painel. Cada camada pertence a exatamente uma
// seção; o campo `group` de cada camada em layers.js é o `title` da seção.

export const THEMES = [
  {
    code: 'I',
    title: 'Contexto Regional e Limites',
    accent: '#57534E',
    sections: [
      {
        code: '1.1',
        title: 'Limites Administrativos',
        icon: '🗺️',
        layers: ['municipios_corredor', 'grande_abc', 'distritos', 'bairros', 'limite_vila'],
      },
    ],
  },
  {
    code: 'II',
    title: 'Meio Ambiente e Recursos Hídricos',
    accent: '#385723',
    sections: [
      {
        code: '2.1',
        title: 'Relevo e Declividade',
        icon: '⛰️',
        layers: ['altimetria_serra', 'hipsometria', 'declividade', 'curvas_nivel'],
      },
      {
        code: '2.2',
        title: 'Bacias e Hidrografia',
        icon: '💧',
        layers: [
          'regioes_hidrograficas', 'subbacias_ugrhi6', 'subbacias',
          'hidrografia_regional', 'hidrografia', 'rios_sul',
          'nascentes_regionais', 'nascentes',
          'reservatorios_rmsp_completos', 'reservatorios', 'billings_747',
        ],
      },
      {
        code: '2.3',
        title: 'Áreas Protegidas e Vegetação',
        icon: '🌳',
        layers: [
          'ucs', 'pnm_nascentes', 'parque_andreense', 'apm_aprm_regionais',
          'apps_hidricas_regionais', 'app_buffers', 'app_sul', 'classif_vegetal',
        ],
      },
      {
        code: '2.4',
        title: 'Riscos (Defesa Civil)',
        icon: '⚠️',
        layers: ['susc_movmas', 'risco_movmas', 'risco_incendio'],
      },
    ],
  },
  {
    code: 'III',
    title: 'Infraestrutura e Conexões',
    accent: '#0E7490',
    sections: [
      {
        code: '3.1',
        title: 'Mobilidade',
        icon: '🚌',
        layers: ['ferrovia_rmsp', 'rodovias', 'ciclovias', 'mobilidade_urbana'],
      },
      {
        code: '3.2',
        title: 'Energia',
        icon: '⚡',
        layers: ['rede_eletrica', 'subestacoes'],
      },
      {
        code: '3.3',
        title: 'Equipamentos Urbanos',
        icon: '🏥',
        layers: [
          'saude', 'educacao', 'seguranca', 'esporte', 'assistencia_social',
          'defesa_civil', 'feiras_livres', 'cemiterio',
        ],
      },
    ],
  },
  {
    code: 'IV',
    title: 'Planejamento e Legislação',
    accent: '#6D28D9',
    sections: [
      {
        code: '4.1',
        title: 'Zoneamento e Planos',
        icon: '📐',
        layers: ['macrozonas', 'zoneamento_mzpa', 'zeip_subdivisoes'],
      },
    ],
  },
  {
    code: 'V',
    title: 'Patrimônio Cultural',
    accent: '#78350F',
    sections: [
      {
        code: '5.1',
        title: 'Sistema Ferroviário SPR',
        icon: '🚂',
        layers: ['ferrovia_corredor', 'estacoes', 'ferrovia_local', 'funicular', 'patrimonio_ferroviario', 'abpf'],
      },
      {
        code: '5.2',
        title: 'Proteção do Patrimônio',
        icon: '🏛️',
        layers: ['patrimonio_tombados', 'areas_envoltorias', 'bens_estudo', 'bens_registrados', 'territorios_culturais'],
      },
      {
        code: '5.3',
        title: 'Morfologia da Vila',
        icon: '🏘️',
        layers: ['edificacoes_vila', 'edificacoes_cad', 'pac_lotes', 'sistema_viario', 'caminhos_vila'],
      },
      {
        code: '5.4',
        title: 'Memória Afetiva',
        icon: '💬',
        layers: ['lugares_memoria'],
      },
    ],
  },
  {
    code: 'VI',
    title: 'Turismo, Circulação e Trilhas',
    accent: '#2D6A4F',
    sections: [
      {
        code: '6.1',
        title: 'Trilhas e Atrativos',
        icon: '🥾',
        layers: ['trilhas', 'atrativos', 'circuitos'],
      },
    ],
  },
  {
    code: 'VII',
    title: 'Socioeconomia e Demografia',
    accent: '#7E22CE',
    sections: [
      {
        code: '7.1',
        title: 'Censo e Densidade',
        icon: '📊',
        layers: ['censo_setores', 'densidade', 'densidade_2022', 'populacao_2022'],
      },
    ],
  },
];

// Seções na ordem do painel, cada uma com o eixo a que pertence.
export const SECTIONS = THEMES.flatMap((theme) =>
  theme.sections.map((section) => ({ ...section, theme }))
);

const SECTION_BY_TITLE = Object.fromEntries(SECTIONS.map((s) => [s.title, s]));

/** Seção do catálogo pelo título (o `group` das camadas). */
export function sectionOf(group) {
  return SECTION_BY_TITLE[group] || null;
}
