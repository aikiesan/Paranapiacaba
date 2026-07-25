import { describe, it, expect } from 'vitest';
import {
  unionBounds,
  geoJSONBounds,
  presetMaxZoom,
  focusableLayerIds,
  DEFAULT_PRESET_MAX_ZOOM
} from '../src/utils/mapBounds.js';
import { PRESETS, PRESET_FAMILIES, presetsByFamily } from '../src/config/presets.js';
import { LAYERS } from '../src/config/layers.js';

describe('unionBounds', () => {
  it('une duas extensões disjuntas', () => {
    const a = [[-24, -47], [-23, -46]];
    const b = [[-25, -48], [-22, -45]];

    expect(unionBounds([a, b])).toEqual([[-25, -48], [-22, -45]]);
  });

  it('devolve a própria extensão quando há apenas uma', () => {
    const only = [[-24, -47], [-23, -46]];
    expect(unionBounds([only])).toEqual(only);
  });

  it('ignora entradas ausentes ou malformadas', () => {
    const valid = [[-24, -47], [-23, -46]];
    expect(unionBounds([null, undefined, [], [[NaN, 0], [1, 1]], valid])).toEqual(valid);
  });

  it('devolve null quando não há nenhuma extensão utilizável', () => {
    expect(unionBounds([])).toBeNull();
    expect(unionBounds(null)).toBeNull();
    expect(unionBounds([null, undefined])).toBeNull();
  });
});

describe('geoJSONBounds', () => {
  const feature = (geometry) => ({ type: 'Feature', properties: {}, geometry });

  it('mede uma FeatureCollection de pontos', () => {
    const data = {
      type: 'FeatureCollection',
      features: [
        feature({ type: 'Point', coordinates: [-46.3, -23.8] }),
        feature({ type: 'Point', coordinates: [-46.1, -23.6] })
      ]
    };

    expect(geoJSONBounds(data)).toEqual([[-23.8, -46.3], [-23.6, -46.1]]);
  });

  it('mede polígonos e multipolígonos aninhados', () => {
    const data = {
      type: 'FeatureCollection',
      features: [
        feature({
          type: 'Polygon',
          coordinates: [[[-46.4, -23.9], [-46.4, -23.7], [-46.2, -23.7], [-46.2, -23.9]]]
        }),
        feature({
          type: 'MultiPolygon',
          coordinates: [[[[-46.5, -24.0], [-46.5, -23.95], [-46.45, -23.95]]]]
        })
      ]
    };

    expect(geoJSONBounds(data)).toEqual([[-24.0, -46.5], [-23.7, -46.2]]);
  });

  it('percorre GeometryCollection', () => {
    const data = feature({
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [-46.3, -23.8] },
        { type: 'LineString', coordinates: [[-46.5, -23.9], [-46.2, -23.7]] }
      ]
    });

    expect(geoJSONBounds(data)).toEqual([[-23.9, -46.5], [-23.7, -46.2]]);
  });

  it('aceita uma geometria nua', () => {
    expect(geoJSONBounds({ type: 'Point', coordinates: [-46.3, -23.8] })).toEqual([
      [-23.8, -46.3],
      [-23.8, -46.3]
    ]);
  });

  it('devolve null para entradas vazias ou sem coordenadas', () => {
    expect(geoJSONBounds(null)).toBeNull();
    expect(geoJSONBounds({ type: 'FeatureCollection', features: [] })).toBeNull();
    expect(geoJSONBounds({ type: 'FeatureCollection', features: [feature(null)] })).toBeNull();
  });
});

describe('presetMaxZoom', () => {
  it('respeita o zoomLevel declarado na predefinição de escala', () => {
    expect(presetMaxZoom({ zoomLevel: 10.5 })).toBe(10.5);
  });

  it('cai no teto padrão quando não há zoomLevel', () => {
    expect(presetMaxZoom({})).toBe(DEFAULT_PRESET_MAX_ZOOM);
    expect(presetMaxZoom(null)).toBe(DEFAULT_PRESET_MAX_ZOOM);
    expect(presetMaxZoom({ zoomLevel: 'perto' })).toBe(DEFAULT_PRESET_MAX_ZOOM);
  });
});

describe('focusableLayerIds', () => {
  const layers = [
    { id: 'a', available: true },
    { id: 'b', available: false },
    { id: 'c' }
  ];

  it('mantém as camadas publicadas', () => {
    expect(focusableLayerIds({ layers: ['a', 'c'] }, layers)).toEqual(['a', 'c']);
  });

  // Uma camada "em breve" nunca chega a carregar; esperar por ela deixaria o
  // enquadramento pendurado.
  it('descarta camadas marcadas como indisponíveis', () => {
    expect(focusableLayerIds({ layers: ['a', 'b'] }, layers)).toEqual(['a']);
  });

  it('descarta ids sem camada correspondente', () => {
    expect(focusableLayerIds({ layers: ['a', 'inexistente'] }, layers)).toEqual(['a']);
  });

  it('tolera predefinições vazias', () => {
    expect(focusableLayerIds(null, layers)).toEqual([]);
    expect(focusableLayerIds({}, layers)).toEqual([]);
  });
});

describe('enquadramento das predefinições reais', () => {
  it('deixa toda predefinição com ao menos uma camada enquadrável', () => {
    const empty = PRESETS.filter(
      (preset) => focusableLayerIds(preset, LAYERS).length === 0
    ).map((preset) => preset.id);

    expect(empty).toEqual([]);
  });

  // targetScale é uma promessa ao leitor; sem zoomLevel o enquadramento não a
  // cumpre, porque cai no teto genérico.
  it('acompanha todo targetScale de um zoomLevel', () => {
    const incomplete = PRESETS.filter(
      (preset) => preset.targetScale && typeof preset.zoomLevel !== 'number'
    ).map((preset) => preset.id);

    expect(incomplete).toEqual([]);
  });
});

describe('famílias de predefinições', () => {
  it('classifica toda predefinição numa família conhecida', () => {
    const known = new Set(PRESET_FAMILIES.map((family) => family.id));
    const orphans = PRESETS.filter((preset) => !known.has(preset.family)).map(
      (preset) => `${preset.id} → ${preset.family}`
    );

    expect(orphans).toEqual([]);
  });

  it('não declara família vazia no painel', () => {
    const empty = PRESET_FAMILIES.filter((family) => presetsByFamily(family.id).length === 0).map(
      (family) => family.id
    );

    expect(empty).toEqual([]);
  });

  it('cobre todas as predefinições ao somar as famílias', () => {
    const grouped = PRESET_FAMILIES.flatMap((family) => presetsByFamily(family.id));
    expect(grouped).toHaveLength(PRESETS.length);
  });
});
