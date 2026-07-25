import { describe, it, expect } from 'vitest';
import { simplifyPoints, simplifyGeoJSON } from '../src/utils/simplify.js';
import { getCentroid, toCSV } from '../src/utils/exportData.js';
import { assetUrl } from '../src/utils/assetUrl.js';

describe('simplifyPoints (Ramer–Douglas–Peucker)', () => {
  it('preserva os extremos da linha', () => {
    const points = [[0, 0], [1, 0.0001], [2, 0], [3, 0.0001], [4, 0]];
    const result = simplifyPoints(points, 0.01);

    expect(result[0]).toEqual([0, 0]);
    expect(result.at(-1)).toEqual([4, 0]);
  });

  it('colapsa vértices colineares dentro da tolerância', () => {
    const points = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]];
    expect(simplifyPoints(points, 0.01)).toEqual([[0, 0], [4, 0]]);
  });

  it('mantém vértices que excedem a tolerância', () => {
    const points = [[0, 0], [2, 5], [4, 0]];
    expect(simplifyPoints(points, 0.01)).toEqual(points);
  });

  it('devolve linhas curtas demais para simplificar sem alteração', () => {
    expect(simplifyPoints([[0, 0], [1, 1]], 0.01)).toEqual([[0, 0], [1, 1]]);
    expect(simplifyPoints([], 0.01)).toEqual([]);
  });
});

describe('simplifyGeoJSON', () => {
  it('reduz vértices de LineString preservando a estrutura', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { nome: 'Trilha' },
          geometry: { type: 'LineString', coordinates: [[0, 0], [1, 0], [2, 0], [3, 0]] }
        }
      ]
    };

    const output = simplifyGeoJSON(input, 0.01);

    expect(output.type).toBe('FeatureCollection');
    expect(output.features).toHaveLength(1);
    expect(output.features[0].properties).toEqual({ nome: 'Trilha' });
    expect(output.features[0].geometry.coordinates.length).toBeLessThan(4);
  });

  it('não altera geometrias de ponto', () => {
    const input = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-46.3, -23.7] } }
      ]
    };

    expect(simplifyGeoJSON(input, 0.01).features[0].geometry.coordinates).toEqual([-46.3, -23.7]);
  });

  it('tolera entradas vazias ou inválidas', () => {
    expect(() => simplifyGeoJSON(null, 0.01)).not.toThrow();
    expect(() => simplifyGeoJSON({ type: 'FeatureCollection', features: [] }, 0.01)).not.toThrow();
  });
});

describe('getCentroid', () => {
  it('devolve as próprias coordenadas de um ponto', () => {
    expect(getCentroid({ type: 'Point', coordinates: [-46.3, -23.7] })).toEqual([-46.3, -23.7]);
  });

  it('calcula a média dos vértices de um polígono', () => {
    const geometry = {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 2], [2, 2], [2, 0]]]
    };

    expect(getCentroid(geometry)).toEqual([1, 1]);
  });

  it('devolve null para geometrias ausentes', () => {
    expect(getCentroid(null)).toBeNull();
    expect(getCentroid({ type: 'Point' })).toBeNull();
  });
});

describe('toCSV', () => {
  const collection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { nome: 'Estação', ano: 1867, perfil: [1, 2, 3] },
        geometry: { type: 'Point', coordinates: [-46.3, -23.7] }
      }
    ]
  };

  it('gera cabeçalho com as propriedades escalares', () => {
    const header = toCSV(collection).split('\n')[0];

    expect(header).toContain('nome');
    expect(header).toContain('ano');
  });

  it('ignora propriedades com arrays ou objetos', () => {
    expect(toCSV(collection).split('\n')[0]).not.toContain('perfil');
  });

  it('inclui a linha de dados da feição', () => {
    expect(toCSV(collection).split('\n')[1]).toContain('Estação');
  });

  it('não quebra com uma coleção vazia', () => {
    expect(() => toCSV({ type: 'FeatureCollection', features: [] })).not.toThrow();
    expect(() => toCSV(null)).not.toThrow();
  });
});

describe('assetUrl', () => {
  // O Vitest reaproveita o `base` de vite.config.js, então BASE_URL aqui é o
  // mesmo subcaminho usado na publicação ('/Paranapiacaba/').
  const base = import.meta.env.BASE_URL;

  it('prefixa caminhos relativos com o subcaminho de publicação', () => {
    expect(base).toBe('/Paranapiacaba/');
    expect(assetUrl('acervo/ferrovia/foto.jpg')).toBe('/Paranapiacaba/acervo/ferrovia/foto.jpg');
  });

  it('não duplica barras quando o caminho já começa com uma', () => {
    expect(assetUrl('/acervo/foto.jpg')).toBe('/Paranapiacaba/acervo/foto.jpg');
  });

  it('preserva URLs absolutas e data URIs', () => {
    expect(assetUrl('https://exemplo.org/foto.jpg')).toBe('https://exemplo.org/foto.jpg');
    expect(assetUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
  });

  it('devolve valores vazios intactos', () => {
    expect(assetUrl('')).toBe('');
    expect(assetUrl(undefined)).toBeUndefined();
  });
});
