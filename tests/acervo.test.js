import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PHOTO_ARCHIVE } from '../src/data/photoArchiveIndex.js';
import { CARTOGRAPHIC_MAPS, TECHNICAL_DOCUMENTS, MAP_CATEGORIES } from '../src/data/mapsIndex.js';

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../public');

describe('acervo fotográfico', () => {
  it('define ao menos uma foto', () => {
    expect(PHOTO_ARCHIVE.length).toBeGreaterThan(0);
  });

  it('não repete ids', () => {
    const ids = PHOTO_ARCHIVE.map((photo) => photo.id);
    expect(ids.length).toBe(new Set(ids).size);
  });

  it('preenche os metadados exibidos na galeria', () => {
    const invalid = PHOTO_ARCHIVE.filter(
      (photo) => !photo.id || !photo.title || !photo.category || !photo.src
    ).map((photo) => photo.id || photo.src || '<sem id>');

    expect(invalid).toEqual([]);
  });

  it('usa caminhos relativos ao diretório public (sem barra inicial)', () => {
    const absolute = PHOTO_ARCHIVE.filter((photo) => photo.src.startsWith('/')).map(
      (photo) => photo.src
    );

    expect(absolute).toEqual([]);
  });

  it('aponta para imagens realmente publicadas', () => {
    const missing = PHOTO_ARCHIVE.filter(
      (photo) => !fs.existsSync(path.join(PUBLIC_DIR, photo.src))
    ).map((photo) => `${photo.id} → public/${photo.src}`);

    expect(missing).toEqual([]);
  });
});

describe('índice de pranchas cartográficas', () => {
  it('define ao menos uma prancha', () => {
    expect(CARTOGRAPHIC_MAPS.length).toBeGreaterThan(0);
  });

  it('não repete ids nem códigos', () => {
    const ids = CARTOGRAPHIC_MAPS.map((map) => map.id);
    const codes = CARTOGRAPHIC_MAPS.map((map) => map.code);

    expect(ids.length).toBe(new Set(ids).size);
    expect(codes.length).toBe(new Set(codes).size);
  });

  it('preenche os campos usados pelos filtros e pela busca', () => {
    const invalid = CARTOGRAPHIC_MAPS.filter(
      (map) => !map.id || !map.code || !map.title || !map.category || !map.description
    ).map((map) => map.id || map.code || '<sem id>');

    expect(invalid).toEqual([]);
  });

  it('cobre toda prancha no filtro de categorias da galeria', () => {
    const uncovered = CARTOGRAPHIC_MAPS.filter(
      (map) => !MAP_CATEGORIES.includes(map.category)
    ).map((map) => `${map.id} → ${map.category}`);

    expect(MAP_CATEGORIES[0]).toBe('Todas');
    expect(uncovered).toEqual([]);
  });

  it('descreve cada documento técnico', () => {
    expect(Array.isArray(TECHNICAL_DOCUMENTS)).toBe(true);
    const invalid = TECHNICAL_DOCUMENTS.filter((doc) => !doc.title).map(
      (doc) => doc.id || '<sem título>'
    );

    expect(invalid).toEqual([]);
  });
});
