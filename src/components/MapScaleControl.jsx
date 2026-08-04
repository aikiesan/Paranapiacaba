import React, { useEffect, useState } from 'react';
import { useMap } from 'react-leaflet';
import { MAP_SCALES, formatScale, scaleForZoom, zoomForScale, graphicScaleSegment } from '../utils/mapScale';

export function MapScaleControl() {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  const [lat, setLat] = useState(() => map.getCenter().lat);

  useEffect(() => {
    const update = () => {
      setZoom(map.getZoom());
      setLat(map.getCenter().lat);
    };
    map.on('zoomend moveend', update);
    update();
    return () => map.off('zoomend moveend', update);
  }, [map]);

  const currentScale = scaleForZoom(zoom, lat);
  const graphicSegment = graphicScaleSegment(zoom, lat, 80);

  const setScale = (value) => {
    const scale = Number(value);
    const targetZoom = zoomForScale(scale, lat);
    if (targetZoom !== null) {
      map.setZoom(Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), targetZoom)));
    }
  };

  return (
    <div className="pointer-events-auto max-w-[calc(100vw-2rem)] select-none" data-testid="map-scale-control">
      {/* Card principal da escala */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-white/95 shadow-md backdrop-blur-md text-slate-800">
        {/* Botão de Zoom Out */}
        <button
          type="button"
          onClick={() => map.zoomOut(0.25)}
          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          aria-label="Afastar mapa (−)"
          title="Afastar mapa (−)"
        >
          −
        </button>

        {/* Seletor da Razão de Escala Cartográfica */}
        <div className="flex flex-col items-center px-1.5">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Escala</span>
          <select
            id="map-target-scale"
            aria-label="Escala cartográfica"
            value=""
            onChange={(e) => setScale(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-800 cursor-pointer outline-none hover:text-emerald-700 transition-colors"
            title={`Escala atual: ${formatScale(currentScale)} — Clique para alterar`}
          >
            <option value="" disabled>{formatScale(currentScale)}</option>
            {MAP_SCALES.map((scale) => (
              <option key={scale} value={scale}>
                {formatScale(scale)}
              </option>
            ))}
          </select>
        </div>

        {/* Botão de Zoom In */}
        <button
          type="button"
          onClick={() => map.zoomIn(0.25)}
          className="w-7 h-7 flex items-center justify-center rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          aria-label="Aproximar mapa (+)"
          title="Aproximar mapa (+)"
        >
          +
        </button>

        {/* Barra Gráfica Cartográfica Intuitiva */}
        <div className="flex flex-col border-l border-slate-200 pl-2 pr-1 space-y-0.5">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-700 tracking-tight leading-none" style={{ width: `${graphicSegment.pxWidth}px` }}>
            <span>0</span>
            <span>{graphicSegment.label}</span>
          </div>
          <div className="relative h-2 flex items-center" style={{ width: `${graphicSegment.pxWidth}px` }} aria-label={`Escala gráfica de 0 a ${graphicSegment.label}`}>
            {/* Ticks verticais nos extremos */}
            <span className="absolute left-0 top-0 bottom-0 w-[2px] bg-slate-800 rounded-sm" />
            <span className="absolute right-0 top-0 bottom-0 w-[2px] bg-slate-800 rounded-sm" />
            {/* Linha horizontal principal */}
            <span className="w-full h-[2px] bg-slate-800 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
