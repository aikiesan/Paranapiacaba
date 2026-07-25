// Helpers de enquadramento do mapa, isolados do Leaflet para poderem ser
// testados sem DOM. Um "bounds" aqui é a tupla [[sul, oeste], [norte, leste]].

// Une várias extensões numa só, ignorando entradas ausentes ou malformadas.
export function unionBounds(boundsList) {
  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;

  for (const bounds of boundsList || []) {
    if (!Array.isArray(bounds) || bounds.length !== 2) continue;
    const [[s, w], [n, e]] = bounds;
    if (![s, w, n, e].every((value) => typeof value === 'number' && Number.isFinite(value))) {
      continue;
    }
    south = Math.min(south, s);
    west = Math.min(west, w);
    north = Math.max(north, n);
    east = Math.max(east, e);
  }

  if (south === Infinity) return null;
  return [[south, west], [north, east]];
}

// Extensão de um GeoJSON percorrendo as coordenadas diretamente. Evita
// instanciar camadas Leaflet só para medir, o que pesa nos arquivos grandes.
export function geoJSONBounds(geojson) {
  if (!geojson) return null;

  let south = Infinity;
  let west = Infinity;
  let north = -Infinity;
  let east = -Infinity;
  let found = false;

  const visitCoords = (node) => {
    if (!Array.isArray(node)) return;
    if (typeof node[0] === 'number') {
      const [lng, lat] = node;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      south = Math.min(south, lat);
      north = Math.max(north, lat);
      west = Math.min(west, lng);
      east = Math.max(east, lng);
      found = true;
      return;
    }
    node.forEach(visitCoords);
  };

  const visitGeometry = (geometry) => {
    if (!geometry) return;
    if (geometry.type === 'GeometryCollection') {
      (geometry.geometries || []).forEach(visitGeometry);
      return;
    }
    visitCoords(geometry.coordinates);
  };

  if (geojson.type === 'FeatureCollection') {
    (geojson.features || []).forEach((feature) => visitGeometry(feature && feature.geometry));
  } else if (geojson.type === 'Feature') {
    visitGeometry(geojson.geometry);
  } else {
    visitGeometry(geojson);
  }

  return found ? [[south, west], [north, east]] : null;
}

// Zoom máximo do enquadramento. Nas predefinições de escala o `zoomLevel`
// declarado é o que materializa a escala anunciada (1:1.000 … 1:50.000);
// sem ele, um teto genérico evita aproximar demais em camadas pontuais.
export const DEFAULT_PRESET_MAX_ZOOM = 16;

export function presetMaxZoom(preset) {
  const zoom = preset && preset.zoomLevel;
  return typeof zoom === 'number' && Number.isFinite(zoom) ? zoom : DEFAULT_PRESET_MAX_ZOOM;
}

// Quais camadas de uma predefinição podem contribuir com extensão: as marcadas
// `available: false` nunca são carregadas, então esperar por elas travaria o
// enquadramento.
export function focusableLayerIds(preset, layers) {
  if (!preset || !Array.isArray(preset.layers)) return [];
  const byId = new Map((layers || []).map((layer) => [layer.id, layer]));

  return preset.layers.filter((id) => {
    const layer = byId.get(id);
    return Boolean(layer) && layer.available !== false;
  });
}
