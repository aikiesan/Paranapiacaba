import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { GLOSSARY, GLOSSARY_GROUPS } from '../src/data/glossary.js';
import { TIMELINE } from '../src/data/history.js';
import { SHEETS, neighbours } from '../src/data/sheets.js';
import { PHOTO_ARCHIVE, webImage, photoById } from '../src/data/photoArchiveIndex.js';
import { CARTOGRAPHIC_MAPS } from '../src/data/mapsIndex.js';
import { PRESETS } from '../src/config/presets.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const COMPONENTS_DIR = path.join(ROOT, 'src/components');
const componentSources = fs.readdirSync(COMPONENTS_DIR)
  .filter((file) => file.endsWith('.jsx'))
  .map((file) => [file, fs.readFileSync(path.join(COMPONENTS_DIR, file), 'utf8')]);

describe('folhas do portal', () => {
  it('numera as folhas em sequência, sem ids repetidos', () => {
    expect(SHEETS.map((sheet) => sheet.no)).toEqual(SHEETS.map((_, i) => String(i + 1).padStart(2, '0')));
    expect(new Set(SHEETS.map((sheet) => sheet.id)).size).toBe(SHEETS.length);
  });

  it('toda folha é renderizada pelo App', () => {
    const app = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');
    SHEETS.forEach((sheet) => expect(app).toContain(`activeTab === '${sheet.id}'`));
  });

  it('liga a primeira à última folha pela navegação "próxima folha"', () => {
    expect(neighbours(SHEETS[0].id).prev).toBeNull();
    expect(neighbours(SHEETS[SHEETS.length - 1].id).next).toBeNull();
    expect(neighbours(SHEETS[1].id).next.id).toBe(SHEETS[2].id);
  });
});

describe('glossário', () => {
  it('não repete termos e classifica todos num assunto existente', () => {
    expect(new Set(GLOSSARY.map((entry) => entry.id)).size).toBe(GLOSSARY.length);
    const groups = new Set(GLOSSARY_GROUPS.map((group) => group.id));
    expect(GLOSSARY.filter((entry) => !groups.has(entry.group)).map((entry) => entry.id)).toEqual([]);
  });

  it('todo <Term id> usado nas páginas existe no glossário', () => {
    const ids = new Set(GLOSSARY.map((entry) => entry.id));
    const missing = componentSources.flatMap(([file, source]) =>
      [...source.matchAll(/<Term id="([^"]+)"/g)].map((m) => m[1]).filter((id) => !ids.has(id)).map((id) => `${file}: ${id}`));
    expect(missing).toEqual([]);
  });
});

describe('referências cruzadas', () => {
  it('todo mapa pronto chamado pelas páginas existe', () => {
    const ids = new Set(PRESETS.map((preset) => preset.id));
    const pattern = /(?:onNavigateToMapWithPreset|openMap|toMap)\('([^']+)'\)|preset: '([^']+)'/g;
    const missing = componentSources.flatMap(([file, source]) =>
      [...source.matchAll(pattern)].map((m) => m[1] || m[2]).filter((id) => !ids.has(id)).map((id) => `${file}: ${id}`));
    expect(missing).toEqual([]);
  });

  it('toda figura citada pelas páginas e pela cronologia está no arquivo', () => {
    const cited = componentSources.flatMap(([, source]) =>
      [...source.matchAll(/photoById\('([^']+)'\)|'((?:spr|proc|orb)-[a-z0-9-]+)'/g)].map((m) => m[1] || m[2]));
    const fromTimeline = TIMELINE.filter((event) => event.figure).map((event) => event.figure);
    expect([...cited, ...fromTimeline].filter((id) => !photoById(id))).toEqual([]);
  });
});

describe('versões leves do arquivo (scripts/build_acervo_web.py)', () => {
  it('existem miniatura e versão de tela para cada imagem do arquivo', () => {
    const missing = PHOTO_ARCHIVE.flatMap((photo) => [480, 1600]
      .map((size) => webImage(photo.src, size))
      .filter((file) => !fs.existsSync(path.join(PUBLIC_DIR, file))));
    expect(missing).toEqual([]);
  });

  it('as pranchas com prévia apontam para imagens publicadas', () => {
    const missing = CARTOGRAPHIC_MAPS.filter((map) => map.preview).flatMap((map) =>
      [map.preview, webImage(map.preview, 480), webImage(map.preview, 1600)]
        .filter((file) => !fs.existsSync(path.join(PUBLIC_DIR, file))));
    expect(missing).toEqual([]);
  });
});
