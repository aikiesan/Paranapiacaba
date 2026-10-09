import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYERS } from '../src/config/layers.js';
import { PRESETS } from '../src/config/presets.js';
import { HYPSO_CLASSES, SLOPE_CLASSES } from '../src/config/styleGuide.js';

const DATA_DIR = path.resolve(import.meta.dirname, '../public/data');
const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));

// Extensão [oeste, sul, leste, norte] de uma FeatureCollection de polígonos.
function extent(fc) {
  let [w, s, e, n] = [Infinity, Infinity, -Infinity, -Infinity];
  const visit = (coords) => {
    if (typeof coords[0] === 'number') {
      w = Math.min(w, coords[0]); e = Math.max(e, coords[0]);
      s = Math.min(s, coords[1]); n = Math.max(n, coords[1]);
    } else coords.forEach(visit);
  };
  fc.features.forEach((feature) => visit(feature.geometry.coordinates));
  return [w, s, e, n];
}

const parque = extent(read('parque_andreense.geojson'));

describe('relevo: hipsometria e declividade até o Parque Andreense', () => {
  for (const [file, classes] of [['hipsometria.geojson', HYPSO_CLASSES], ['declividade.geojson', SLOPE_CLASSES]]) {
    const fc = read(file);

    it(`${file} cobre o Parque Andreense (lon ${parque[0].toFixed(3)} a ${parque[2].toFixed(3)})`, () => {
      const [w, s, e, n] = extent(fc);
      expect(w).toBeLessThanOrEqual(-46.5 + 0.001);
      expect(w).toBeLessThan(parque[0]);
      expect(e).toBeGreaterThan(-46.3);
      expect(s).toBeLessThan(parque[1]);
      expect(n).toBeGreaterThan(parque[3]);
    });

    it(`${file} usa as classes e cores da legenda`, () => {
      const used = new Set();
      const mismatched = fc.features.filter((feature) => {
        const { classe, cor } = feature.properties;
        used.add(classe);
        return classes[classe - 1]?.color !== cor;
      });
      expect(mismatched).toEqual([]);
      expect([...used].sort((a, b) => a - b)).toEqual(classes.map((_, i) => i + 1));
    });
  }

  it('a hipsometria é uma rampa sequencial: cada faixa mais escura que a anterior', () => {
    const luminance = (hex) => {
      const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
        .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const values = HYPSO_CLASSES.map(({ color }) => luminance(color));
    values.slice(1).forEach((value, i) => expect(value).toBeLessThan(values[i]));
  });

  it('registra os dois overlays raster no manifesto', () => {
    const manifest = read('rasters/manifest.json');
    expect(manifest.hipsometria.legend.map((item) => item.color)).toEqual(HYPSO_CLASSES.map((c) => c.color));
    expect(manifest.declividade.legend.map((item) => item.color)).toEqual(SLOPE_CLASSES.map((c) => c.color));
    expect(manifest.hipsometria.bounds[0][1]).toBeLessThanOrEqual(-46.5 + 0.001);
  });

  it('inclui hipsometria e declividade no preset 1:100.000 da Serra', () => {
    const preset = PRESETS.find((item) => item.id === 'escala_serra');
    expect(preset.targetScale).toBe('1:100.000');
    expect(preset.layers).toEqual(expect.arrayContaining(['hipsometria', 'declividade']));
    // A declividade é desenhada por cima da hipsometria (ordem de LAYERS).
    const order = LAYERS.map((layer) => layer.id);
    expect(order.indexOf('hipsometria')).toBeLessThan(order.indexOf('declividade'));
    // As duas aparecem no zoom do preset.
    for (const id of ['hipsometria', 'declividade']) {
      expect(LAYERS.find((layer) => layer.id === id).minZoom).toBeLessThanOrEqual(preset.zoomLevel);
    }
  });
});
