// Glossário do portal. Cada termo aparece sublinhado em pontilhado no texto
// (componente <Term>) e reunido na folha 08. Definições curtas, para quem
// chega sem conhecer ferrovia, patrimônio ou cartografia.
export const GLOSSARY_GROUPS = [
  { id: 'ferrovia', label: 'Ferrovia' },
  { id: 'patrimonio', label: 'Patrimônio e proteção' },
  { id: 'territorio', label: 'Território e água' },
  { id: 'mapa', label: 'Mapa e cartografia' },
];

export const GLOSSARY = [
  // Ferrovia
  {
    id: 'aderencia',
    term: 'Tração por aderência',
    group: 'ferrovia',
    text: 'O modo comum de um trem andar: a locomotiva avança pelo atrito entre as próprias rodas e os trilhos. Funciona bem em rampas suaves, mas não em encostas íngremes como a da Serra do Mar.',
  },
  {
    id: 'funicular',
    term: 'Funicular',
    group: 'ferrovia',
    text: 'Sistema em que os vagões sobem e descem rampas fortes puxados por cabos de aço, movidos por máquinas fixas instaladas no alto de cada rampa, e não pela força da locomotiva.',
  },
  {
    id: 'plano-inclinado',
    term: 'Plano inclinado',
    group: 'ferrovia',
    text: 'Cada trecho de rampa forte vencido por tração a cabo. A subida da Serra pela São Paulo Railway foi dividida em uma sequência de planos inclinados.',
  },
  {
    id: 'patamar',
    term: 'Patamar',
    group: 'ferrovia',
    text: 'Trecho quase plano entre dois planos inclinados. Ali ficavam a casa de máquinas que movia o cabo, as caldeiras e as moradias dos ferroviários que operavam o sistema.',
  },
  {
    id: 'serra-velha-nova',
    term: 'Serra Velha e Serra Nova',
    group: 'ferrovia',
    text: 'Os dois sistemas funiculares da SPR: a Serra Velha, aberta em 1867, e a Serra Nova, inaugurada em 1901 para ampliar a capacidade da linha.',
  },
  {
    id: 'locobreque',
    term: 'Locobreque',
    group: 'ferrovia',
    text: 'Pequena locomotiva usada nos planos inclinados da Serra Nova. Presa ao cabo, acompanhava a composição e fazia o controle e a frenagem na subida e na descida.',
  },
  {
    id: 'bitola',
    term: 'Bitola',
    group: 'ferrovia',
    text: 'Distância entre os dois trilhos da via. A São Paulo Railway foi construída em bitola larga, de 1,60 m.',
  },
  {
    id: 'vila-ferroviaria',
    term: 'Vila ferroviária',
    group: 'ferrovia',
    text: 'Núcleo construído pela própria companhia para morar quem trabalhava na linha: casas, serviços, comércio e lazer organizados em torno da ferrovia. Paranapiacaba é um exemplo excepcionalmente completo.',
  },
  {
    id: 'viela-sanitaria',
    term: 'Viela sanitária',
    group: 'ferrovia',
    text: 'Passagem estreita nos fundos dos lotes, por onde corriam as redes de esgoto e o serviço das casas, separando-os da rua.',
  },

  // Patrimônio e proteção
  {
    id: 'tombamento',
    term: 'Tombamento',
    group: 'patrimonio',
    text: 'Ato do poder público que reconhece o valor cultural de um bem e o inscreve em um Livro do Tombo. A partir daí, qualquer obra no bem — e, em geral, no seu entorno — depende de aprovação do órgão de proteção.',
  },
  {
    id: 'iphan',
    term: 'IPHAN',
    group: 'patrimonio',
    text: 'Instituto do Patrimônio Histórico e Artístico Nacional, órgão federal de proteção do patrimônio cultural.',
  },
  {
    id: 'condephaat',
    term: 'CONDEPHAAT',
    group: 'patrimonio',
    text: 'Conselho de Defesa do Patrimônio Histórico, Arqueológico, Artístico e Turístico do Estado de São Paulo, responsável pelos tombamentos estaduais.',
  },
  {
    id: 'comdephaapasa',
    term: 'COMDEPHAAPASA',
    group: 'patrimonio',
    text: 'Conselho municipal de defesa do patrimônio de Santo André, que responde pelos tombamentos no âmbito do município — onde fica Paranapiacaba.',
  },
  {
    id: 'vue',
    term: 'Valor Universal Excepcional',
    group: 'patrimonio',
    text: 'Critério central da UNESCO: um significado cultural ou natural tão excepcional que interessa a toda a humanidade, e não só a um país. É o que uma candidatura precisa demonstrar.',
  },
  {
    id: 'zona-amortecimento',
    term: 'Zona de amortecimento',
    group: 'patrimonio',
    text: 'Área ao redor do bem protegido em que o uso do solo tem regras próprias, para proteger a paisagem e o contexto que dão sentido ao sítio.',
  },
  {
    id: 'zeip',
    term: 'ZEIP',
    group: 'patrimonio',
    text: 'Zona Especial de Interesse do Patrimônio: instrumento do zoneamento de Santo André que condiciona obras, usos e parcelamento à salvaguarda do conjunto histórico.',
  },

  // Território e água
  {
    id: 'divisor',
    term: 'Divisor de águas',
    group: 'territorio',
    text: 'Linha de cristas que separa duas bacias: de um lado a chuva escorre para um rio, do outro para outro. Em Paranapiacaba, separa as águas que vão para o Tietê das que descem para o litoral.',
  },
  {
    id: 'ugrhi',
    term: 'UGRHI',
    group: 'territorio',
    text: 'Unidade de Gerenciamento de Recursos Hídricos. O Estado de São Paulo é dividido em 22 delas para a gestão da água; o sítio fica entre a UGRHI 6 (Alto Tietê) e a UGRHI 7 (Baixada Santista).',
  },
  {
    id: 'app',
    term: 'APP',
    group: 'territorio',
    text: 'Área de Preservação Permanente, definida pelo Código Florestal: faixas ao longo de rios, em volta de nascentes e em encostas íngremes, onde a vegetação deve ser mantida.',
  },
  {
    id: 'mzpa',
    term: 'MZPA',
    group: 'territorio',
    text: 'Macrozona de Proteção Ambiental do Plano Diretor de Santo André, que abrange Paranapiacaba e a área de mananciais.',
  },

  // Mapa e cartografia
  {
    id: 'escala',
    term: 'Escala',
    group: 'mapa',
    text: 'Quanto o mapa reduz a realidade. Em 1:10.000, 1 cm no mapa vale 100 m no terreno; quanto maior o segundo número, mais área e menos detalhe.',
  },
  {
    id: 'camada',
    term: 'Camada',
    group: 'mapa',
    text: 'Um tema do mapa que pode ser ligado ou desligado — trilhos, rios, edificações, limites. Sobrepor camadas é o que permite comparar e entender o território.',
  },
  {
    id: 'prancha',
    term: 'Prancha',
    group: 'mapa',
    text: 'Folha de desenho ou de mapa em formato padronizado. As pranchas deste projeto são em A0 (84 × 119 cm), o maior formato da série A.',
  },
  {
    id: 'georreferenciamento',
    term: 'Georreferenciamento',
    group: 'mapa',
    text: 'Dar coordenadas a uma imagem — uma carta antiga, por exemplo — para que ela se encaixe no lugar certo sobre o mapa atual.',
  },
  {
    id: 'sirgas',
    term: 'SIRGAS 2000',
    group: 'mapa',
    text: 'Sistema de referência geodésico oficial do Brasil, a “régua” comum que faz todos os dados do mapa coincidirem.',
  },
];

export function glossaryEntry(id) {
  return GLOSSARY.find((entry) => entry.id === id) || null;
}
