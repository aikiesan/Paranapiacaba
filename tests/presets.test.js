import { describe, it, expect } from 'vitest';
import { PRESETS } from '../src/config/presets.js';
import { LAYERS } from '../src/config/layers.js';
import { BASEMAPS } from '../src/components/BasemapSelector.jsx';

const layerIds = new Set(LAYERS.map((layer) => layer.id));

describe('presets temáticos', () => {
  it('define ao menos um preset', () => {
    expect(PRESETS.length).toBeGreaterThan(0);
  });

  it('não repete ids de preset', () => {
    const ids = PRESETS.map((preset) => preset.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('preenche id, label e lista de camadas', () => {
    const invalid = PRESETS.filter(
      (preset) => !preset.id || !preset.label || !Array.isArray(preset.layers) || preset.layers.length === 0
    ).map((preset) => preset.id || preset.label || '<sem id>');

    expect(invalid).toEqual([]);
  });

  // Regressão: o preset "Prancha 3" e o "Síntese UNESCO" referenciavam
  // `limite_sitio` depois que a camada foi removida do catálogo, deixando as
  // pranchas sem o perímetro do sítio.
  it('só referencia camadas existentes no catálogo', () => {
    const dangling = [];
    for (const preset of PRESETS) {
      for (const id of preset.layers) {
        if (!layerIds.has(id)) dangling.push(`${preset.id} → ${id}`);
      }
    }

    expect(dangling).toEqual([]);
  });

  it('não repete camadas dentro do mesmo preset', () => {
    const duplicated = PRESETS.filter(
      (preset) => preset.layers.length !== new Set(preset.layers).size
    ).map((preset) => preset.id);

    expect(duplicated).toEqual([]);
  });

  it('só referencia mapas-base existentes', () => {
    const basemapIds = new Set(BASEMAPS.map((basemap) => basemap.id));
    const invalid = PRESETS.filter((preset) => preset.basemap && !basemapIds.has(preset.basemap))
      .map((preset) => preset.id);

    expect(invalid).toEqual([]);
  });

  it('mantém a Prancha 4 ligada à hidrografia regional completa', () => {
    const preset = PRESETS.find((item) => item.id === 'prancha_hidrica_redes');
    expect(preset.layers).toEqual(expect.arrayContaining([
      'hidrografia_regional', 'nascentes_regionais', 'apps_hidricas_regionais',
      'subbacias_ugrhi6', 'apm_aprm_regionais'
    ]));
  });
});
