// Estado compartilhável do mapa no hash da URL:
//
//   #<zoom>/<lat>/<lng>?camadas=id1,id2&base=satellite
//
// A parte antes do "?" mantém o formato antigo (#zoom/lat/lng), então links já
// distribuídos continuam abrindo no mesmo enquadramento. Camadas e basemap são
// opcionais: sem eles, o app usa os padrões do catálogo.

/**
 * @param {string} hash - window.location.hash (com ou sem "#")
 * @param {{ layerIds?: Iterable<string>, basemapIds?: Iterable<string> }} [known]
 *   ids válidos; ids desconhecidos (camada removida do catálogo) são descartados.
 * @returns {{ view: {zoom:number, lat:number, lng:number}|null, layers: string[]|null, basemap: string|null }}
 */
export function parseShareHash(hash, known = {}) {
  const empty = { view: null, layers: null, basemap: null };
  if (!hash) return empty;
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  const [viewPart, queryPart = ''] = raw.split('?');

  let view = null;
  const parts = viewPart.split('/');
  if (parts.length === 3) {
    const [zoom, lat, lng] = parts.map(Number);
    const valid =
      [zoom, lat, lng].every(Number.isFinite) &&
      zoom >= 0 && zoom <= 22 && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    if (valid) view = { zoom, lat, lng };
  }

  const params = new URLSearchParams(queryPart);
  const layerIds = known.layerIds ? new Set(known.layerIds) : null;
  const basemapIds = known.basemapIds ? new Set(known.basemapIds) : null;

  let layers = null;
  if (params.has('camadas')) {
    layers = params.get('camadas').split(',').map((id) => id.trim()).filter(Boolean);
    if (layerIds) layers = layers.filter((id) => layerIds.has(id));
  }

  let basemap = params.get('base') || null;
  if (basemap && basemapIds && !basemapIds.has(basemap)) basemap = null;

  return { view, layers, basemap };
}

/**
 * @param {{ zoom:number, lat:number, lng:number }} view
 * @param {{ layers?: Iterable<string>, basemap?: string }} [state]
 * @returns {string} hash começando por "#"
 */
export function buildShareHash(view, state = {}) {
  const zoom = Math.round(view.zoom * 100) / 100;
  let hash = `#${zoom}/${view.lat.toFixed(5)}/${view.lng.toFixed(5)}`;
  const params = [];
  if (state.layers) params.push(`camadas=${[...state.layers].join(',')}`);
  if (state.basemap) params.push(`base=${encodeURIComponent(state.basemap)}`);
  if (params.length) hash += `?${params.join('&')}`;
  return hash;
}
