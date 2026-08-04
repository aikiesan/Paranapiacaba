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

export function formatScale(scale) {
  if (!Number.isFinite(scale)) return 'Escala';
  return `1:${Math.round(scale).toLocaleString('pt-BR')}`;
}
