import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { MAP_SCALES, formatScale, scaleForZoom, zoomForScale } from '../utils/mapScale';

export function MapScaleControl() {
  const map = useMap();
  const [currentScale, setCurrentScale] = useState(() =>
    scaleForZoom(map.getZoom(), map.getCenter().lat)
  );

  useEffect(() => {
    const update = () => setCurrentScale(scaleForZoom(map.getZoom(), map.getCenter().lat));
    map.on('zoomend moveend', update);
    update();
    return () => map.off('zoomend moveend', update);
  }, [map]);

  const setScale = (value) => {
    const scale = Number(value);
    const zoom = zoomForScale(scale, map.getCenter().lat);
    if (zoom !== null) map.setZoom(Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoom)));
  };

  return (
    <div className="export-hide absolute bottom-11 md:bottom-12 left-3 md:left-4 z-[1000] flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white/95 shadow-md backdrop-blur-md">
      <button type="button" onClick={() => map.zoomOut(0.25)}
        className="px-2.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
        aria-label="Afastar mapa">−</button>
      <label className="sr-only" htmlFor="map-target-scale">Escala cartográfica</label>
      <select id="map-target-scale" value="" onChange={(event) => setScale(event.target.value)}
        className="max-w-[8.5rem] border-x border-slate-200 bg-transparent px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none"
        title={`Escala aproximada atual: ${formatScale(currentScale)}`}>
        <option value="" disabled>{formatScale(currentScale)}</option>
        {MAP_SCALES.map((scale) => (
          <option key={scale} value={scale}>{formatScale(scale)}</option>
        ))}
      </select>
      <button type="button" onClick={() => map.zoomIn(0.25)}
        className="px-2.5 py-1.5 text-sm font-bold text-slate-600 hover:bg-slate-100"
        aria-label="Aproximar mapa">+</button>
    </div>
  );
}
