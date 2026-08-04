// Approximate cartographic scale at the screen center using the CSS reference
// pixel (96 dpi) and Web Mercator ground resolution. Presets and the interactive
// scale control use the same conversion.
const EARTH_RADIUS = 6378137;
const CSS_DPI = 96;
const METRES_PER_INCH = 0.0254;

export const MAP_SCALES = [1000, 2000, 5000, 10000, 20000, 50000, 100000];

export function zoomForScale(scale, latitude = 0) {
  if (!Number.isFinite(scale) || scale <= 0) return null;
  const metresPerPixel = scale * METRES_PER_INCH / CSS_DPI;
  const circumferenceAtLatitude =
    Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * EARTH_RADIUS;
  return Math.log2(circumferenceAtLatitude / (256 * metresPerPixel));
}
export function scaleForZoom(zoom, latitude = 0) {
  if (!Number.isFinite(zoom)) return null;
  const metresPerPixel =
    Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * EARTH_RADIUS /
    (256 * 2 ** zoom);
  return metresPerPixel * CSS_DPI / METRES_PER_INCH;
}

export function metersPerPixel(zoom, latitude = 0) {
  if (!Number.isFinite(zoom)) return 1;
  return (Math.cos((latitude * Math.PI) / 180) * 2 * Math.PI * EARTH_RADIUS) / (256 * Math.pow(2, zoom));
}

export function formatScale(scale) {
  if (!Number.isFinite(scale)) return 'Escala';
  return `1:${Math.round(scale).toLocaleString('pt-BR')}`;
}

export function formatMetricDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return '0 m';
  if (meters >= 1000) {
    const km = meters / 1000;
    return `${km.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km`;
  }
  return `${Math.round(meters)} m`;
}

// Retorna o segmento gráfico ideal (distância em metros e largura em pixels)
export function graphicScaleSegment(zoom, latitude = 0, targetPxWidth = 90) {
  const mPerPx = metersPerPixel(zoom, latitude);
  const candidateSteps = [
    5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000
  ];

  let bestStep = candidateSteps[0];
  let minDiff = Infinity;

  for (const step of candidateSteps) {
    const px = step / mPerPx;
    const diff = Math.abs(px - targetPxWidth);
    if (diff < minDiff) {
      minDiff = diff;
      bestStep = step;
    }
  }

  const pxWidth = Math.round(bestStep / mPerPx);
  return {
    distanceMeters: bestStep,
    label: formatMetricDistance(bestStep),
    pxWidth: Math.max(36, Math.min(180, pxWidth))
  };
}
