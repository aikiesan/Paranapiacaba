import { useState, useEffect, useRef } from 'react';

/**
 * Hook para carregar arquivos GeoJSON de forma lazy e cacheá-los.
 * @param {string} fileName - Nome do arquivo GeoJSON (ex: "limite_sitio.geojson")
 * @param {boolean} enabled - Se true, inicia o carregamento do arquivo
 * @returns {object} { data, loading, error }
 */
export function useGeoJSON(fileName, enabled) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Cache em memória usando useRef
  const cache = useRef({});

  useEffect(() => {
    if (!enabled || !fileName) return;

    // Se já estiver no cache, carrega imediatamente
    if (cache.current[fileName]) {
      setData(cache.current[fileName]);
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Resolve o caminho absoluto levando em conta o BASE_URL do Vite (/Paranapiacaba/)
    const baseUrl = import.meta.env.BASE_URL || '/';
    // Garante que não haverá barras duplicadas
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = `${cleanBaseUrl}data/${fileName}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar o arquivo: ${response.statusText} (${response.status})`);
        }
        return response.json();
      })
      .then((json) => {
        if (isMounted) {
          cache.current[fileName] = json;
          setData(json);
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
  }, [fileName, enabled]);

  return { data, loading, error };
}
