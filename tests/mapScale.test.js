import { describe, expect, it } from 'vitest';
import {
  MAP_SCALES,
  formatScale,
  scaleForZoom,
  zoomForScale,
  metersPerPixel,
  formatMetricDistance,
  graphicScaleSegment
} from '../src/utils/mapScale.js';

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
    expect(formatScale(1000)).toBe('1:1.000');
    expect(formatScale(50000)).toBe('1:50.000');
  });

  it('rejeita denominadores inválidos', () => {
    expect(zoomForScale(0)).toBeNull();
    expect(zoomForScale(Number.NaN)).toBeNull();
  });
});

describe('resolução em solo e escala gráfica intuitiva', () => {
  it('calcula metros por pixel reduzindo ao aproxima o zoom', () => {
    const mPerPxDetail = metersPerPixel(17.5, -23.778);
    const mPerPxRegional = metersPerPixel(10.5, -23.778);
    expect(mPerPxDetail).toBeLessThan(mPerPxRegional);
  });

  it('formata distâncias métricas no padrão português', () => {
    expect(formatMetricDistance(50)).toBe('50 m');
    expect(formatMetricDistance(500)).toBe('500 m');
    expect(formatMetricDistance(1000)).toBe('1 km');
    expect(formatMetricDistance(2500)).toBe('2,5 km');
    expect(formatMetricDistance(10000)).toBe('10 km');
  });

  it('seleciona 50 m e preserva a largura matemática no zoom de detalhe', () => {
    const segment = graphicScaleSegment(17.5, -23.778, 80);
    expect(segment.distanceMeters).toBe(50);
    expect(segment.label).toBe('50 m');
    expect(segment.pxWidth).toBe(Math.round(50 / metersPerPixel(17.5, -23.778)));
  });

  it('seleciona 10 km e preserva a largura matemática no zoom territorial', () => {
    const segment = graphicScaleSegment(10.5, -23.778, 80);
    expect(segment.distanceMeters).toBe(10000);
    expect(segment.label).toBe('10 km');
    expect(segment.pxWidth).toBe(Math.round(10000 / metersPerPixel(10.5, -23.778)));
  });
});
