import { useState, useEffect } from 'react';

// Cache em memória global para persistir dados entre múltiplos componentes (MapView, LayerPanel, etc.)
const globalCache = {};
const globalCountCache = {};

/**
 * Hook para carregar arquivos GeoJSON de forma lazy e cacheá-los globalmente.
 * @param {string} fileName - Nome do arquivo GeoJSON (ex: "limite_sitio.geojson")
 * @param {boolean} enabled - Se true ou preload for true, inicia o carregamento do arquivo
 * @param {boolean} available - Se false, aborta o fetch e retorna erro "Arquivo não encontrado" imediatamente
 * @returns {object} { data, loading, error, featureCount }
 */
export function useGeoJSON(fileName, enabled, available = true) {
  const [data, setData] = useState(globalCache[fileName] || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Se a camada está explicitada como indisponível nas configurações, rejeita imediatamente
    if (!available) {
      setError(new Error('Arquivo não encontrado'));
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

    // Resolve o caminho levando em conta o BASE_URL da hospedagem
    const baseUrl = import.meta.env.BASE_URL || '/';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = `${cleanBaseUrl}data/${fileName}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Arquivo não encontrado');
        }
        return response.json();
      })
      .then((json) => {
        if (isMounted) {
          globalCache[fileName] = json;
          globalCountCache[fileName] = json.features ? json.features.length : 0;
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

  return { data, loading, error, featureCount };
}
