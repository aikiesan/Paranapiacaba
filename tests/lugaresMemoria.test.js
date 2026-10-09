import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYERS } from '../src/config/layers.js';
import { sectionOf } from '../src/config/catalog.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'public/data');
const TEMAS = ['ferrovia_trabalho', 'mata_ranchos', 'lazer_festas', 'perda_gentrificacao', 'misticismo', 'outro'];

const layer = LAYERS.find((item) => item.id === 'lugares_memoria');
const geojson = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'lugares_memoria.geojson'), 'utf8'));

describe('camada Lugares de Memória (mapa afetivo)', () => {
  it('está no catálogo como camada de pontos da seção Memória Afetiva', () => {
    expect(layer).toMatchObject({ label: 'Lugares de Memória', type: 'point', group: 'Memória Afetiva' });
    expect(sectionOf(layer.group)?.layers).toContain('lugares_memoria');
  });

  it('publica uma FeatureCollection (vazia enquanto nenhuma fala for aprovada)', () => {
    expect(geojson.type).toBe('FeatureCollection');
    expect(Array.isArray(geojson.features)).toBe(true);
  });

  // Decisão da equipe (09/10/2026): os dados afetivos não vão ao GitHub Pages
  // antes de definido o método de mapeamento. Ao liberar, atualize este teste.
  it('fica pausada: indisponível na interface e sem nenhum lugar publicado', () => {
    expect(layer.available).toBe(false);
    expect(layer.visible).toBe(false);
    expect(geojson.features).toEqual([]);
  });

  it('só publica falantes anonimizados (Depoente NN)', () => {
    const named = geojson.features
      .flatMap((feature) => feature.properties?.falas || [])
      .filter((fala) => !/^Depoente (\d{2,}|não identificado)$/.test(fala.falante));
    expect(named).toEqual([]);
  });

  it('só publica pontos com coordenada definida, nunca lugares pendentes', () => {
    const invalid = geojson.features.filter((feature) => {
      const [lon, lat] = feature.geometry?.coordinates || [];
      return (
        feature.geometry?.type !== 'Point' ||
        !Number.isFinite(lon) || !Number.isFinite(lat) ||
        Math.abs(lat) > 90 || Math.abs(lon) > 180 ||
        feature.properties?.precisao === 'pendente'
      );
    }).map((feature) => feature.properties?.nome);

    expect(invalid).toEqual([]);
  });

  it('lista em cada lugar as falas com citação, falante e fonte', () => {
    const incomplete = [];
    for (const feature of geojson.features) {
      const { nome, falas, n_falas: count } = feature.properties || {};
      if (!nome || !Array.isArray(falas) || falas.length === 0 || falas.length !== count) {
        incomplete.push(nome || '<sem nome>');
        continue;
      }
      for (const fala of falas) {
        if (!fala.citacao || !fala.falante || !fala.fonte || !TEMAS.includes(fala.tema)) {
          incomplete.push(`${nome} → ${fala.id || '<sem id>'}`);
        }
      }
    }

    expect(incomplete).toEqual([]);
  });

  it('não expõe a coluna interna de revisão (publicavel) no GeoJSON público', () => {
    expect(JSON.stringify(geojson)).not.toMatch(/publicavel/);
  });

  // As transcrições e os CSVs de revisão ficam fora do repositório público.
  it('mantém a pasta das transcrições ignorada pelo git', () => {
    const gitignore = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
    expect(gitignore).toMatch(/^\/EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED\/\r?$/m);
  });
});
