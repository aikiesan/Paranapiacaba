import { describe, expect, it } from 'vitest';
import { parseShareHash, buildShareHash } from '../src/utils/shareState.js';

const known = { layerIds: ['ferrovia_corredor', 'estacoes', 'trilhas'], basemapIds: ['osm', 'satellite'] };

describe('links compartilháveis do mapa', () => {
  it('continua lendo links antigos só com enquadramento', () => {
    expect(parseShareHash('#13.5/-23.77800/-46.30450', known)).toEqual({
      view: { zoom: 13.5, lat: -23.778, lng: -46.3045 },
      layers: null,
      basemap: null,
    });
  });

  it('lê camadas e basemap e descarta ids que não existem mais', () => {
    const shared = parseShareHash('#15/-23.7/-46.3?camadas=estacoes,removida,trilhas&base=satellite', known);
    expect(shared.layers).toEqual(['estacoes', 'trilhas']);
    expect(shared.basemap).toBe('satellite');
  });

  it('ignora basemap desconhecido e lista de camadas vazia significa mapa limpo', () => {
    const shared = parseShareHash('#15/-23.7/-46.3?camadas=&base=inexistente', known);
    expect(shared.layers).toEqual([]);
    expect(shared.basemap).toBeNull();
  });

  it('rejeita enquadramentos inválidos', () => {
    expect(parseShareHash('#abc/1/2').view).toBeNull();
    expect(parseShareHash('#13/-123/-46').view).toBeNull();
    expect(parseShareHash('').view).toBeNull();
  });

  it('gera um hash que volta ao mesmo estado', () => {
    const hash = buildShareHash(
      { zoom: 12.256, lat: -23.7781234, lng: -46.3045678 },
      { layers: new Set(['ferrovia_corredor', 'estacoes']), basemap: 'osm' }
    );
    expect(hash).toBe('#12.26/-23.77812/-46.30457?camadas=ferrovia_corredor,estacoes&base=osm');
    expect(parseShareHash(hash, known)).toEqual({
      view: { zoom: 12.26, lat: -23.77812, lng: -46.30457 },
      layers: ['ferrovia_corredor', 'estacoes'],
      basemap: 'osm',
    });
  });
});
