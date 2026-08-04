import { describe, expect, it } from 'vitest';
import { MAP_SCALES, formatScale, scaleForZoom, zoomForScale } from '../src/utils/mapScale.js';

describe('conversão entre escala cartográfica e zoom', () => {
  it('faz ida e volta nas escalas oferecidas ao usuário', () => {
    for (const scale of MAP_SCALES) {
      const zoom = zoomForScale(scale, -23.778);
      expect(scaleForZoom(zoom, -23.778)).toBeCloseTo(scale, 6);
    }
  });

  it('aproxima mais nas escalas de maior detalhe', () => {
    expect(zoomForScale(1000, -23.778)).toBeGreaterThan(zoomForScale(10000, -23.778));
  });

  it('formata denominadores no padrão brasileiro', () => {
    expect(formatScale(10000)).toBe('1:10.000');
  });

  it('rejeita denominadores inválidos', () => {
    expect(zoomForScale(0)).toBeNull();
    expect(zoomForScale(Number.NaN)).toBeNull();
  });
});
