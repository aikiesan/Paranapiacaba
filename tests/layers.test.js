import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYERS, GROUPS } from '../src/config/layers.js';

const DATA_DIR = path.resolve(import.meta.dirname, '../public/data');

// Camadas marcadas como `available: false` são placeholders anunciados como
// "em breve" na interface — a UI não tenta buscá-las, então o arquivo pode faltar.
const shipped = LAYERS.filter((layer) => layer.available !== false);

describe('catálogo de camadas', () => {
  it('define ao menos uma camada e um grupo', () => {
    expect(LAYERS.length).toBeGreaterThan(0);
    expect(GROUPS.length).toBeGreaterThan(0);
  });

  it('não repete ids de camada', () => {
    const seen = new Set();
    const duplicates = LAYERS.filter((layer) => {
      if (seen.has(layer.id)) return true;
      seen.add(layer.id);
      return false;
    }).map((layer) => layer.id);

    expect(duplicates).toEqual([]);
  });

  it('preenche os campos obrigatórios de cada camada', () => {
    const invalid = LAYERS.filter(
      (layer) =>
        !layer.id ||
        !layer.label ||
        !layer.file ||
        !layer.group ||
        !layer.type ||
        typeof layer.description !== 'string'
    ).map((layer) => layer.id || layer.file || '<sem id>');

    expect(invalid).toEqual([]);
  });

  it('usa apenas grupos declarados em GROUPS', () => {
    const known = new Set(GROUPS);
    const orphans = LAYERS.filter((layer) => !known.has(layer.group)).map(
      (layer) => `${layer.id} → ${layer.group}`
    );

    expect(orphans).toEqual([]);
  });

  it('usa cores em hexadecimal válido', () => {
    const invalid = LAYERS.filter(
      (layer) => layer.color && !/^#[0-9a-f]{6}$/i.test(layer.color)
    ).map((layer) => `${layer.id} → ${layer.color}`);

    expect(invalid).toEqual([]);
  });

  it('aponta para GeoJSONs realmente publicados em public/data', () => {
    const missing = shipped
      .filter((layer) => !fs.existsSync(path.join(DATA_DIR, layer.file)))
      .map((layer) => `${layer.id} → public/data/${layer.file}`);

    expect(missing).toEqual([]);
  });

  it('publica GeoJSONs sintaticamente válidos', () => {
    const broken = [];
    for (const file of new Set(shipped.map((layer) => layer.file))) {
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        if (!parsed.type) broken.push(`${file} → sem campo "type"`);
      } catch (error) {
        broken.push(`${file} → ${error.message}`);
      }
    }

    expect(broken).toEqual([]);
  });

  it('não marca camadas indisponíveis como visíveis por padrão', () => {
    const contradictory = LAYERS.filter(
      (layer) => layer.available === false && layer.visible
    ).map((layer) => layer.id);

    expect(contradictory).toEqual([]);
  });

  it('publica somente a rede hidrográfica conectada às nascentes regionais', () => {
    const hydrography = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'hidrografia_regional_completa.geojson'), 'utf8')
    );
    const sources = new Set(
      hydrography.features.map((feature) => feature.properties?.fonte).filter(Boolean)
    );

    expect(hydrography.features.length).toBeGreaterThan(0);
    expect([...sources]).toEqual([
      'Hidrografia das APPs da RMSP (conectada às nascentes)'
    ]);
  });

  it('reduz as curvas da Vila para uma cadência nominal de 5 m sem duplicatas', () => {
    const contours = JSON.parse(
      fs.readFileSync(path.join(DATA_DIR, 'curvas_nivel.geojson'), 'utf8')
    );
    const feature = contours.features[0];
    const lines = feature.geometry.coordinates;
    const canonical = lines.map((line) => {
      const forward = JSON.stringify(line);
      const reverse = JSON.stringify([...line].reverse());
      return forward < reverse ? forward : reverse;
    });

    expect(feature.properties.intervalo_exibicao_m).toBe(5);
    expect(lines.length).toBeGreaterThan(1000);
    expect(lines.length).toBeLessThan(2000);
    expect(new Set(canonical).size).toBe(lines.length);
  });
});
