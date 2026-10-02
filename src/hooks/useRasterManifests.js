import { useEffect, useState } from 'react';

// Catálogos dos rasters: séries de análise (MapBiomas) e mapas de referência
// georreferenciados (cartas históricas e anexos de legislação municipal).
// Carregados uma vez por sessão e compartilhados entre o painel e o mapa.
let cached = null;
let inflight = null;

function loadManifests() {
  if (cached) return Promise.resolve(cached);
  if (inflight) return inflight;
  const base = import.meta.env.BASE_URL || '/';
  const getJson = (path) =>
    fetch(`${base}${path}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .catch((error) => {
        console.info(`Catálogo indisponível (${path}):`, error.message);
        return null;
      });

  inflight = Promise.all([
    getJson('data/rasters/manifest.json'),
    getJson('data/reference_maps/manifest.json'),
  ]).then(([rasters, references]) => {
    cached = { rasters, references };
    inflight = null;
    return cached;
  });
  return inflight;
}

/** @returns {{ rasters: object|null, references: object|null }} */
export function useRasterManifests() {
  const [manifests, setManifests] = useState(cached || { rasters: null, references: null });
  useEffect(() => {
    let mounted = true;
    loadManifests().then((result) => mounted && setManifests(result));
    return () => {
      mounted = false;
    };
  }, []);
  return manifests;
}
