// Utilitários de exportação de dados (GeoJSON / CSV) para os pesquisadores.

// Centroide aproximado de qualquer geometria GeoJSON (para colunas lat/lng no CSV).
export function getCentroid(geometry) {
  if (!geometry || !geometry.coordinates) return null;
  if (geometry.type === 'Point') return geometry.coordinates;
  let sx = 0, sy = 0, n = 0;
  const walk = (a) => {
    if (typeof a[0] === 'number') { sx += a[0]; sy += a[1]; n++; }
    else a.forEach(walk);
  };
  try { walk(geometry.coordinates); } catch { return null; }
  return n ? [sx / n, sy / n] : null;
}

function triggerDownload(filename, text, mime) {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadGeoJSON(name, data) {
  triggerDownload(`${name}.geojson`, JSON.stringify(data), 'application/geo+json');
}

// Converte uma FeatureCollection em CSV (propriedades + lat/lng do centroide).
// Ignora propriedades que são arrays/objetos (ex.: o perfil de elevação).
export function toCSV(data) {
  const features = (data && data.features) || [];
  const keys = [];
  features.forEach((f) => {
    Object.entries(f.properties || {}).forEach(([k, v]) => {
      if (Array.isArray(v) || (v && typeof v === 'object')) return;
      if (!keys.includes(k)) keys.push(k);
    });
  });
  const header = [...keys, 'lat', 'lng'];
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  features.forEach((f) => {
    const c = getCentroid(f.geometry);
    const row = keys.map((k) => esc(f.properties?.[k]));
    row.push(c ? c[1].toFixed(6) : '', c ? c[0].toFixed(6) : '');
    lines.push(row.join(','));
  });
  return lines.join('\n');
}

export function downloadCSV(name, data) {
  triggerDownload(`${name}.csv`, toCSV(data), 'text/csv;charset=utf-8');
}
