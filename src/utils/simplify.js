// Utilitário de simplificação de geometrias usando o algoritmo Ramer-Douglas-Peucker (RDP)
// Reduz a quantidade de vértices em camadas complexas para melhorar o desempenho no navegador

function getSqSegDist(p, p1, p2) {
  let x = p1[0];
  let y = p1[1];
  let dx = p2[0] - x;
  let dy = p2[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = p2[0];
      y = p2[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = p[0] - x;
  dy = p[1] - y;
  return dx * dx + dy * dy;
}

function simplifyDPStep(points, first, last, sqTolerance, simplified) {
  let maxSqDist = sqTolerance;
  let index = -1;

  for (let i = first + 1; i < last; i++) {
    const sqDist = getSqSegDist(points[i], points[first], points[last]);
    if (sqDist > maxSqDist) {
      index = i;
      maxSqDist = sqDist;
    }
  }

  if (index !== -1) {
    simplifyDPStep(points, first, index, sqTolerance, simplified);
    simplified.push(points[index]);
    simplifyDPStep(points, index, last, sqTolerance, simplified);
  }
}

/**
 * Simplifica um array de pontos [lng, lat]
 */
export function simplifyPoints(points, tolerance) {
  if (points.length <= 2) return points;

  const sqTolerance = tolerance * tolerance;
  const simplified = [points[0]];
  simplifyDPStep(points, 0, points.length - 1, sqTolerance, simplified);
  simplified.push(points[points.length - 1]);

  return simplified;
}

/**
 * Simplifica on-the-fly as feições de um objeto GeoJSON
 * @param {object} geojson - O GeoJSON de entrada
 * @param {number} tolerance - Tolerância em graus decimais (default: 0.00005)
 */
export function simplifyGeoJSON(geojson, tolerance = 0.00005) {
  if (!geojson || !geojson.features) return geojson;

  // Clone profundo para não poluir o cache global em memória
  const cloned = JSON.parse(JSON.stringify(geojson));

  cloned.features = cloned.features.map(feature => {
    if (!feature.geometry || !feature.geometry.coordinates) return feature;

    const type = feature.geometry.type;
    const coords = feature.geometry.coordinates;

    try {
      if (type === 'LineString') {
        feature.geometry.coordinates = simplifyPoints(coords, tolerance);
      } else if (type === 'MultiLineString') {
        feature.geometry.coordinates = coords.map(line => simplifyPoints(line, tolerance));
      } else if (type === 'Polygon') {
        feature.geometry.coordinates = coords.map(ring => simplifyPoints(ring, tolerance));
      } else if (type === 'MultiPolygon') {
        feature.geometry.coordinates = coords.map(polygon =>
          polygon.map(ring => simplifyPoints(ring, tolerance))
        );
      }
    } catch (e) {
      console.warn('[simplifyGeoJSON] Falha ao simplificar feição:', e.message);
    }

    return feature;
  });

  return cloned;
}
