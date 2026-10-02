// Índice das "folhas" do portal, numeradas como um jogo de pranchas.
// A mesma ordem alimenta o menu, o índice da página inicial e a navegação
// "próxima estação" no pé de cada página.
export const SHEETS = [
  { id: 'home', no: '01', label: 'Início', title: 'Apresentação', summary: 'Por onde começar, a linha da Serra e a cronologia.' },
  { id: 'map', no: '02', label: 'Mapa', title: 'O atlas interativo', summary: 'Camadas do dossiê, mapas prontos e cartas históricas.' },
  { id: 'ferrovia', no: '03', label: 'Ferrovia', title: 'A São Paulo Railway e a Serra', summary: 'Como o trem venceu 800 metros de escarpa.' },
  { id: 'trilhas', no: '04', label: 'Trilhas', title: 'Caminhos da Serra', summary: 'Trilhas oficiais, técnicas e históricas.' },
  { id: 'hidraulica', no: '05', label: 'Água', title: 'A água e a vila', summary: 'Nascentes, reservatórios e o divisor de águas.' },
  { id: 'campo', no: '06', label: 'Campo', title: 'Levantamento de campo', summary: 'Como se inventaria o estado de conservação.' },
  { id: 'legislacao', no: '07', label: 'Proteção', title: 'Proteção e planos', summary: 'Tombamentos, zoneamento e a candidatura.' },
  { id: 'glossario', no: '08', label: 'Glossário', title: 'Glossário', summary: 'As palavras da ferrovia, do patrimônio e do mapa.' },
];

export function sheetOf(id) {
  return SHEETS.find((sheet) => sheet.id === id) || null;
}

export function neighbours(id) {
  const index = SHEETS.findIndex((sheet) => sheet.id === id);
  if (index < 0) return { prev: null, next: null };
  return { prev: SHEETS[index - 1] || null, next: SHEETS[index + 1] || null };
}
