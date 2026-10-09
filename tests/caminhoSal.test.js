import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYERS } from '../src/config/layers.js';
import { sectionOf } from '../src/config/catalog.js';

const DATA_DIR = path.resolve(import.meta.dirname, '../public/data');
const FONTE = 'https://www.google.com/maps/d/viewer?mid=12bBvGeW5hecNAqtQlvLA1lK1dseMIbA';

const layer = LAYERS.find((item) => item.id === 'caminho_sal');
const geojson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'caminho_sal.geojson'), 'utf8'));

describe('Caminho do Sal (caminhos históricos)', () => {
  it('está na seção Caminhos Históricos como camada de linha', () => {
    expect(layer).toMatchObject({ type: 'line', group: 'Caminhos Históricos' });
    expect(sectionOf(layer.group)?.layers).toEqual(['caminho_sal']);
  });

  it('credita o mapa de Mariana Lebens na descrição e nos atributos', () => {
    expect(layer.description).toContain('Mariana Lebens');
    expect(layer.description).toContain(FONTE);
    for (const feature of geojson.features) {
      expect(feature.properties).toMatchObject({ autoria: 'Mariana Lebens', fonte: FONTE });
    }
  });

  it('publica só o traçado (linhas), sem os pontos de interesse do KMZ', () => {
    expect(geojson.features.length).toBeGreaterThan(0);
    const types = new Set(geojson.features.map((feature) => feature.geometry.type));
    expect([...types]).toEqual(['LineString']);
    for (const feature of geojson.features) {
      expect(feature.geometry.coordinates.length).toBeGreaterThan(1);
      for (const [lon, lat] of feature.geometry.coordinates) {
        expect(lon).toBeGreaterThan(-47.5);
        expect(lon).toBeLessThan(-45.5);
        expect(lat).toBeGreaterThan(-24.5);
        expect(lat).toBeLessThan(-23);
      }
    }
  });

  // Os demais KMZ da pasta CAMINHO_SAL ficam fora do WebGIS por decisão da equipe.
  it('não publica os outros roteiros da pasta CAMINHO_SAL', () => {
    const files = fs.readdirSync(DATA_DIR).map((file) => file.toLowerCase());
    for (const name of ['padre_capra', 'rota_da_luz', 'magic_city', 'biritiba', 'rota_da_madeira', 'estudos_de_ampliacao']) {
      expect(files.some((file) => file.includes(name))).toBe(false);
    }
    expect(LAYERS.filter((item) => item.group === 'Caminhos Históricos').map((item) => item.id)).toEqual(['caminho_sal']);
  });
});
