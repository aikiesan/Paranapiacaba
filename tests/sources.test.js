import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYERS } from '../src/config/layers.js';
import {
  SOURCES, LAYER_SOURCES, RASTER_SOURCES, LEGISLATION_SOURCES, REFERENCE_SOURCES,
  layerSources, uniqueSources, attributionHtml, referenceMapSources,
} from '../src/config/sources.js';

const allEntries = () => [
  ...Object.values(LAYER_SOURCES).flat(),
  ...Object.values(RASTER_SOURCES).flat(),
  ...Object.values(LEGISLATION_SOURCES),
  ...Object.values(REFERENCE_SOURCES),
];

describe('fontes dos dados', () => {
  it('toda camada do mapa cita ao menos uma fonte', () => {
    const missing = LAYERS.filter((layer) => layerSources(layer.id).length === 0).map((layer) => layer.id);
    expect(missing).toEqual([]);
  });

  it('não cita fontes para camadas que não existem', () => {
    const ids = new Set(LAYERS.map((layer) => layer.id));
    expect(Object.keys(LAYER_SOURCES).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('toda citação aponta para um portal registrado', () => {
    const unknown = allEntries().filter((entry) => !SOURCES[entry.source]).map((entry) => entry.source);
    expect(unknown).toEqual([]);
  });

  it('usa apenas links https', () => {
    const urls = [
      ...Object.values(SOURCES).map((source) => source.url),
      ...allEntries().map((entry) => entry.url),
    ].filter(Boolean);
    expect(urls.filter((url) => !url.startsWith('https://'))).toEqual([]);
  });

  it('fonte sem link explica o que é', () => {
    const silent = Object.entries(SOURCES).filter(([, source]) => !source.url && !source.note).map(([key]) => key);
    expect(silent).toEqual([]);
  });

  it('agrupa por portal sem repetir na atribuição do mapa', () => {
    const sources = uniqueSources(['saude', 'educacao', 'municipios_corredor']);
    expect(sources.map((source) => source.key)).toEqual(['siga', 'ibge_malhas']);
    expect(attributionHtml(sources[0])).toContain('href="https://');
  });

  it('toda carta do manifesto de referência cita uma fonte', () => {
    const manifest = JSON.parse(fs.readFileSync(
      path.resolve(import.meta.dirname, '../public/data/reference_maps/manifest.json'), 'utf8',
    ));
    const missing = manifest.maps.filter((item) => referenceMapSources(item).length === 0).map((item) => item.id);
    expect(missing).toEqual([]);
  });

  it('cartas históricas citam o Arquivo Público', () => {
    const [source] = referenceMapSources({ group: 'historical', sourceFile: 'BR_APESP_IGC_IGG_CAR_I_S_0070_001_001.tif' });
    expect(source.key).toBe('apesp');
    expect(source.dataset).toContain('APESP');
  });
});
