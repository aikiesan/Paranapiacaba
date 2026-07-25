import { useState, useEffect } from 'react';

// Cache em memória global para persistir dados entre múltiplos componentes (MapView, LayerPanel, etc.)
const globalCache = {};
const globalCountCache = {};
// Requisições em voo, para que dois componentes montando a mesma camada
// compartilhem um único fetch em vez de disparar dois.
const inflight = {};

// Resolve o caminho levando em conta o BASE_URL da hospedagem
function geoJSONUrl(fileName) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${cleanBaseUrl}data/${fileName}`;
}

/**
 * Carrega um GeoJSON imperativamente, compartilhando o mesmo cache do hook.
 * Útil fora do ciclo de render — por exemplo, para medir a extensão de várias
 * camadas ao aplicar uma predefinição temática.
 * @param {string} fileName
 * @returns {Promise<object|null>}
 */
export function loadGeoJSON(fileName) {
  if (!fileName) return Promise.resolve(null);
  if (globalCache[fileName]) return Promise.resolve(globalCache[fileName]);
  if (inflight[fileName]) return inflight[fileName];

  const request = fetch(geoJSONUrl(fileName))
    .then((response) => {
      if (!response.ok) throw new Error('Arquivo não encontrado');
      return response.json();
    })
    .then((json) => {
      globalCache[fileName] = json;
      globalCountCache[fileName] = json.features ? json.features.length : 0;
      delete inflight[fileName];
      return json;
    })
    .catch((err) => {
      delete inflight[fileName];
      throw err;
    });

  inflight[fileName] = request;
  return request;
}

/**
 * Hook para carregar arquivos GeoJSON de forma lazy e cacheá-los globalmente.
 * @param {string} fileName - Nome do arquivo GeoJSON (ex: "limite_sitio.geojson")
 * @param {boolean} enabled - Se true ou preload for true, inicia o carregamento do arquivo
 * @param {boolean} available - Se false, a camada é tratada como "em breve" (dado ainda não publicado), sem tentar o fetch
 * @returns {object} { data, loading, error, unavailable, featureCount }
 */
export function useGeoJSON(fileName, enabled, available = true) {
  const [data, setData] = useState(globalCache[fileName] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Camada intencionalmente ainda não publicada (roteiro de dados) — não é um erro.
  const unavailable = available === false;

  useEffect(() => {
    // Camadas marcadas como "em breve" não disparam fetch nem erro de carregamento.
    if (!available) {
      setError(null);
      return;
    }

    if (!enabled || !fileName) return;

    // Se os dados já existem no cache global, carrega instantaneamente
    if (globalCache[fileName]) {
      setData(globalCache[fileName]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    loadGeoJSON(fileName)
      .then((json) => {
        if (isMounted) {
          setData(json);
          setError(null);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn(`[useGeoJSON] Não foi possível carregar a camada "${fileName}":`, err.message);
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileName, enabled, available]);

  // Busca a contagem do cache global ou calcula a partir dos dados atuais
  const featureCount = globalCountCache[fileName] !== undefined
    ? globalCountCache[fileName]
    : (data?.features?.length || null);

  return { data, loading, error, unavailable, featureCount };
}
