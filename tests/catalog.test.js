import { describe, expect, it } from 'vitest';
import { LAYERS } from '../src/config/layers.js';
import { SECTIONS, THEMES, sectionOf } from '../src/config/catalog.js';
import { groupMeta } from '../src/config/styleGuide.js';

describe('catálogo do dossiê (eixos e seções)', () => {
  it('lista cada camada em exatamente uma seção', () => {
    const listed = SECTIONS.flatMap((section) => section.layers);
    expect(new Set(listed).size).toBe(listed.length);
    expect(new Set(listed)).toEqual(new Set(LAYERS.map((layer) => layer.id)));
  });

  it('faz o `group` de cada camada coincidir com a seção que a lista', () => {
    const mismatched = LAYERS.filter(
      (layer) => !sectionOf(layer.group)?.layers.includes(layer.id)
    ).map((layer) => `${layer.id} → ${layer.group}`);
    expect(mismatched).toEqual([]);
  });

  it('usa códigos únicos, com a seção numerada pelo seu eixo', () => {
    const codes = SECTIONS.map((section) => section.code);
    expect(new Set(codes).size).toBe(codes.length);
    THEMES.forEach((theme, index) => {
      theme.sections.forEach((section) => {
        expect(section.code.split('.')[0]).toBe(String(index + 1));
      });
    });
  });

  it('expõe ícone, cor e códigos de cada grupo para o painel e a legenda', () => {
    const meta = groupMeta('Bacias e Hidrografia');
    expect(meta).toMatchObject({ code: '2.2', themeCode: 'II', icon: '💧' });
    expect(groupMeta('Grupo inexistente').code).toBeNull();
  });
});
