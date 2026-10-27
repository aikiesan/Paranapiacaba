// Exportação rápida do mapa atual como PNG (para relatórios / dossiê).
// Captura o container Leaflet (basemap + camadas + legenda + escala) com
// html-to-image e carimba um cabeçalho (título + data) e um rodapé de créditos.
import { toBlob } from 'html-to-image';

const pad = (n) => String(n).padStart(2, '0');

function todayStr() {
  const d = new Date();
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}
function todaySlug() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function blobToImage(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const CREDITS = 'FAPESP · PUC-Campinas';

// As fontes das camadas desenhadas já estão no rodapé de atribuição do Leaflet
// (ver SourceAttribution em MapView); o PNG repete o mesmo texto.
// O Leaflet escreve "prefixo | atribuição, atribuição, …"; o prefixo é o
// crédito do próprio Leaflet.
function mapSources(mapEl) {
  const text = mapEl.querySelector('.leaflet-control-attribution')?.textContent || '';
  const parts = text.split('|').map((part) => part.trim()).filter(Boolean);
  return parts.filter((part) => !part.endsWith('Leaflet'));
}

// Reduz a fonte até o texto caber na largura disponível.
function fitFont(ctx, text, maxWidth, size, minSize) {
  let current = size;
  ctx.font = `${current}px ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`;
  while (current > minSize && ctx.measureText(text).width > maxWidth) {
    current -= 1;
    ctx.font = `${current}px ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`;
  }
}

/**
 * Captura o mapa e dispara o download de um PNG.
 * @param {HTMLElement} mapEl - container do Leaflet (map.getContainer()).
 * @param {{title?: string}} opts
 */
export async function exportMapImage(mapEl, { title } = {}) {
  if (!mapEl) throw new Error('Mapa não encontrado');

  // Esconde os controles flutuantes (mantém legenda + escala) durante a captura.
  mapEl.classList.add('exporting');
  await new Promise((r) => setTimeout(r, 80)); // deixa o CSS/relayout assentar

  try {
    const blob = await toBlob(mapEl, { pixelRatio: 2, cacheBust: true });
    if (!blob) throw new Error('Falha ao capturar o mapa');
    const base = await blobToImage(blob);

    const S = 2; // mesmo pixelRatio da captura, para texto nítido
    const headerH = title ? 36 * S : 0;
    const footerH = 20 * S;

    const canvas = document.createElement('canvas');
    canvas.width = base.width;
    canvas.height = base.height + headerH + footerH;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (title) {
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${17 * S}px ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'left';
      ctx.fillText(title, 12 * S, headerH / 2);
      ctx.fillStyle = '#64748b';
      ctx.font = `${11 * S}px ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`;
      ctx.textAlign = 'right';
      ctx.fillText(todayStr(), canvas.width - 12 * S, headerH / 2);
    }

    ctx.drawImage(base, 0, headerH);

    // Rodapé de créditos/fontes
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, headerH + base.height, canvas.width, footerH);
    ctx.fillStyle = '#64748b';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const credits = `Fontes: ${[...mapSources(mapEl), CREDITS].join(' · ')}`;
    const signature = 'Paranapiacaba WebGIS';
    ctx.font = `${10 * S}px ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`;
    const signatureWidth = ctx.measureText(signature).width;
    fitFont(ctx, credits, canvas.width - signatureWidth - 36 * S, 10 * S, 6 * S);
    ctx.fillText(credits, 12 * S, headerH + base.height + footerH / 2);
    ctx.font = `${10 * S}px ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText(signature, canvas.width - 12 * S, headerH + base.height + footerH / 2);

    const outBlob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
    downloadBlob(`paranapiacaba-mapa-${todaySlug()}.png`, outBlob || blob);
  } finally {
    mapEl.classList.remove('exporting');
  }
}
