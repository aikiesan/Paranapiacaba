import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Desenha no mapa os rasters escolhidos na aba "Históricos" do painel lateral:
// um mapa de referência (carta histórica ou anexo de legislação) e a série de
// cobertura do solo MapBiomas. Os controles vivem no painel (HistoricMapsPanel);
// aqui fica só a parte que precisa do mapa Leaflet.
//
// Os mapas de referência ficam abaixo dos vetores e usam blend "multiply" para
// que o fundo branco do papel não esconda a ortofoto.
export function ReferenceOverlays({ manifests, overlays }) {
  const map = useMap();
  const base = import.meta.env.BASE_URL || '/';
  const { rasters, references } = manifests;
  const { referenceId, referenceOpacity, coverageOn, coverageYear, coverageOpacity } = overlays;
  const covRef = useRef(null);

  const selectedReference = references?.maps?.find((item) => item.id === referenceId) || null;

  useEffect(() => {
    if (!map.getPane('analysisRasterPane')) {
      const pane = map.createPane('analysisRasterPane');
      pane.style.zIndex = '270';
      pane.style.pointerEvents = 'none';
    }
    if (!map.getPane('referenceRasterPane')) {
      const pane = map.createPane('referenceRasterPane');
      pane.style.zIndex = '260';
      pane.style.pointerEvents = 'none';
    }
  }, [map]);

  // Cobertura do solo (MapBiomas): troca só a imagem ao mudar de ano.
  useEffect(() => {
    if (!rasters?.coverage) return;
    if (coverageOn && coverageYear) {
      const url = `${base}data/rasters/coverage_${coverageYear}.png`;
      if (!covRef.current) {
        covRef.current = L.imageOverlay(url, rasters.coverage.bounds, {
          opacity: coverageOpacity,
          pane: 'analysisRasterPane',
          interactive: false,
          crossOrigin: 'anonymous',
        }).addTo(map);
      } else {
        covRef.current.setUrl(url);
        covRef.current.setOpacity(coverageOpacity);
      }
    } else if (covRef.current) {
      map.removeLayer(covRef.current);
      covRef.current = null;
    }
  }, [coverageOn, coverageYear, coverageOpacity, rasters, map, base]);

  useEffect(() => () => {
    if (covRef.current && map.hasLayer(covRef.current)) map.removeLayer(covRef.current);
    covRef.current = null;
  }, [map]);

  // Mapa de referência selecionado.
  useEffect(() => {
    if (!selectedReference) return undefined;
    const overlay = L.imageOverlay(
      `${base}data/reference_maps/${selectedReference.file}`,
      selectedReference.bounds,
      {
        opacity: referenceOpacity,
        pane: 'referenceRasterPane',
        className: 'reference-map-overlay',
        interactive: false,
        crossOrigin: 'anonymous',
      },
    ).addTo(map);
    const element = overlay.getElement();
    if (element) element.style.mixBlendMode = references?.blendMode || 'multiply';
    return () => {
      if (map.hasLayer(overlay)) map.removeLayer(overlay);
    };
  }, [selectedReference, referenceOpacity, references, map, base]);

  return null;
}
