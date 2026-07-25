// Resolve caminhos de arquivos estáticos servidos a partir de `public/`.
//
// Em produção o site é publicado sob um subcaminho (GitHub Pages:
// `/Paranapiacaba/`), então caminhos relativos como "acervo/foto.jpg" dependem
// da URL corrente do navegador para resolver. Prefixar com o BASE_URL do Vite
// torna a resolução independente da URL e igual em dev, preview e produção.
export function assetUrl(path) {
  if (!path) return path;
  // URLs absolutas e data URIs passam intactas.
  if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('data:')) return path;

  const base = import.meta.env.BASE_URL || '/';
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
