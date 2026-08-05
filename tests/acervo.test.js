import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { PHOTO_ARCHIVE, PHOTO_CATEGORIES } from '../src/data/photoArchiveIndex.js';
import { CARTOGRAPHIC_MAPS, TECHNICAL_DOCUMENTS, MAP_CATEGORIES } from '../src/data/mapsIndex.js';

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../public');
const REFERENCE_MAP_DIR = path.join(PUBLIC_DIR, 'data/reference_maps');

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

  it('cobre toda foto no filtro de categorias, sem abas vazias', () => {
    const used = new Set(PHOTO_ARCHIVE.map((photo) => photo.category));
    const filters = PHOTO_CATEGORIES.slice(1);

    expect(PHOTO_CATEGORIES[0]).toBe('Todas');
    expect([...used].filter((c) => !filters.includes(c))).toEqual([]);
    expect(filters.filter((c) => !used.has(c))).toEqual([]);
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

describe('mapas históricos e legislação georreferenciada', () => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(REFERENCE_MAP_DIR, 'manifest.json'), 'utf8')
  );

  it('publica as duas famílias de mapas de referência', () => {
    const groups = new Set(manifest.maps.map((item) => item.group));

    expect(manifest.maps.length).toBeGreaterThanOrEqual(30);
    expect(groups).toEqual(new Set(['historical', 'legislation']));
  });

  it('aponta para todas as imagens georreferenciadas do manifesto', () => {
    const missing = manifest.maps
      .filter((item) => !fs.existsSync(path.join(REFERENCE_MAP_DIR, item.file)))
      .map((item) => item.file);

    expect(missing).toEqual([]);
  });
});

describe('resolução de imagens do acervo nos componentes', () => {
  const COMPONENTS_DIR = path.join(path.resolve(import.meta.dirname, '../src'), 'components');

  // Uma imagem escrita como src="acervo/..." resolve a partir da URL corrente
  // do navegador em vez do BASE_URL da publicação. Toda referência precisa
  // passar por assetUrl().
  it('não usa caminhos crus de acervo em atributos src', () => {
    const offenders = [];
    for (const file of fs.readdirSync(COMPONENTS_DIR)) {
      if (!file.endsWith('.jsx')) continue;
      const source = fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8');
      for (const match of source.matchAll(/src=["']\/?acervo\/[^"']+["']/gi)) {
        offenders.push(`${file} → ${match[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });
});
