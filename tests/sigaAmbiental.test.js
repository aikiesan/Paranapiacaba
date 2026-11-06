// Regras de deduplicação das camadas ambientais SIGA (scripts/build_siga_ambiental.py):
// uma geometria por entidade e uma fonte por nível de bacia em cada escala.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { LAYERS } from '../src/config/layers.js';
import { PRESETS } from '../src/config/presets.js';
import { SECTIONS } from '../src/config/catalog.js';

const DATA_DIR = path.resolve(import.meta.dirname, '../public/data');
const read = (file) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
const norm = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Os três níveis de bacia, do regional ao detalhe.
const BASIN_LEVELS = ['regioes_hidrograficas', 'subbacias_ugrhi6', 'subbacias_sa'];

describe('camadas ambientais SIGA — sem sobreposição de fontes', () => {
  it('não desenha o PNM Nascentes duas vezes (só na camada própria)', () => {
    const ucs = read('ucs.geojson').features.map((f) => norm(f.properties.nome));
    expect(ucs.filter((n) => n.includes('nascentes de paranapiacaba'))).toEqual([]);
    expect(read('pnm_nascentes.geojson').features).toHaveLength(1);
  });

  it('nomeia cada UC e não repete nenhuma', () => {
    const names = read('ucs.geojson').features.map((f) => norm(f.properties.nome || ''));
    expect(names.filter((n) => !n)).toEqual([]);
    expect(new Set(names).size).toBe(names.length);
  });

  it('cita a fonte de cada UC (GeoSEADE completo ou SIGA)', () => {
    const fontes = new Set(read('ucs.geojson').features.map((f) => f.properties.fonte));
    expect([...fontes].sort()).toEqual(['GeoSEADE (CNUC/MMA)', 'SIGA Santo André']);
  });

  it('mostra no máximo um nível de bacia em cada preset de escala', () => {
    const offenders = PRESETS.filter((p) => p.family === 'escala')
      .filter((p) => p.layers.filter((id) => BASIN_LEVELS.includes(id)).length > 1)
      .map((p) => p.id);
    expect(offenders).toEqual([]);
  });

  it('liga cada nível de bacia à sua escala', () => {
    const byScale = Object.fromEntries(PRESETS.filter((p) => p.family === 'escala')
      .map((p) => [p.targetScale, p.layers.filter((id) => BASIN_LEVELS.includes(id))]));
    expect(byScale['1:500.000']).toEqual(['regioes_hidrograficas']);
    expect(byScale['1:100.000']).toEqual(['subbacias_ugrhi6']);
    expect(byScale['1:10.000']).toEqual(['subbacias_sa']);
  });

  it('leva a hierarquia de bacias nos atributos das sub-bacias SIGA', () => {
    const f = read('subbacias_sa.geojson').features;
    expect(f.length).toBeGreaterThan(100);
    f.forEach(({ properties: p }) => {
      expect(p.sub_bacia || p.bacia).toBeTruthy();
      expect(p.ugrhi).toMatch(/^UGRHI [67] - /);
    });
  });

  it('não repete um atrativo da Prefeitura que aparece em vários circuitos', () => {
    const f = read('atrativos_prefeitura.geojson').features;
    const keys = f.map((x) => x.geometry.coordinates.map((c) => c.toFixed(4)).join(','));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('retirou as camadas redundantes do catálogo e do disco', () => {
    const listed = new Set(SECTIONS.flatMap((s) => s.layers));
    ['subbacias', 'circuitos'].forEach((id) => {
      expect(LAYERS.find((l) => l.id === id)).toBeUndefined();
      expect(listed.has(id)).toBe(false);
      expect(fs.existsSync(path.join(DATA_DIR, `${id}.geojson`))).toBe(false);
    });
  });

  it('não empilha o mesmo bem tombado várias vezes', () => {
    const f = read('patrimonio_tombados.geojson').features;
    const keys = f.map((x) => JSON.stringify(x.geometry));
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('publica os perímetros de tombamento uma vez só (SIGA, em patrimonio_tombados)', () => {
    const extra = LAYERS.filter((l) => /tombamento/i.test(l.id) && l.id !== 'patrimonio_tombados');
    expect(extra.map((l) => l.id)).toEqual([]);
    const orgaos = read('patrimonio_tombados.geojson').features.map((x) => x.properties.orgao || '');
    ['IPHAN', 'CONDEPHAAT', 'COMDEPHAAPASA'].forEach((o) => {
      expect(orgaos.some((v) => v.includes(o))).toBe(true);
    });
  });

  it('nomeia as áreas de uso da ZEIP pela Lei 9.018/2007', () => {
    const f = read('zeip_areas_uso.geojson').features.map((x) => x.properties);
    expect(f.map((p) => p.sigla).sort()).toEqual(['AAN', 'APC', 'APR', 'ASD']);
    f.forEach((p) => expect(p.nome).toMatch(/^Área /));
  });

  it('corrigiu os nomes das UGRHIs (sem texto UTF-8 lido como Latin-1)', () => {
    const names = read('regioes_hidrograficas.geojson').features.map((f) => f.properties.nome);
    expect(names).toContain('ALTO TIETÊ');
    expect(names.filter((n) => /Ã/.test(n))).toEqual([]);
  });
});
