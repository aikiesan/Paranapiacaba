import React, { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Controle de camadas raster: cobertura do solo MapBiomas (2008–2024, com
// régua de ano) e declividade (5 classes). Sobrepõe PNGs georreferenciados.
export function RasterControl() {
  const map = useMap();
  const base = import.meta.env.BASE_URL || '/';
  const [manifest, setManifest] = useState(null);
  const [open, setOpen] = useState(false);
  const [showCov, setShowCov] = useState(false);
  const [showDecl, setShowDecl] = useState(false);
  const [year, setYear] = useState(null);
  const [opacity, setOpacity] = useState(0.75);
  const covRef = useRef(null);
  const declRef = useRef(null);

  useEffect(() => {
    fetch(`${base}data/rasters/manifest.json`)
      .then((r) => r.json())
      .then((m) => {
        setManifest(m);
        const ys = m.coverage?.years;
        if (ys?.length) setYear(ys[ys.length - 1]);
      })
      .catch((e) => console.warn('RasterControl manifest:', e));
  }, [base]);

  // Overlay de cobertura (troca a URL ao mudar o ano)
  useEffect(() => {
    if (!manifest?.coverage) return;
    if (showCov && year) {
      const url = `${base}data/rasters/coverage_${year}.png`;
      if (!covRef.current) {
        covRef.current = L.imageOverlay(url, manifest.coverage.bounds, { opacity, interactive: false, crossOrigin: 'anonymous' }).addTo(map);
      } else {
        covRef.current.setUrl(url);
        covRef.current.setOpacity(opacity);
      }
    } else if (covRef.current) {
      map.removeLayer(covRef.current);
      covRef.current = null;
    }
  }, [showCov, year, opacity, manifest, map, base]);

  // Overlay de declividade
  useEffect(() => {
    if (!manifest?.declividade) return;
    if (showDecl) {
      if (!declRef.current) {
        declRef.current = L.imageOverlay(`${base}data/rasters/declividade.png`, manifest.declividade.bounds, { opacity, interactive: false, crossOrigin: 'anonymous' }).addTo(map);
      } else {
        declRef.current.setOpacity(opacity);
      }
    } else if (declRef.current) {
      map.removeLayer(declRef.current);
      declRef.current = null;
    }
  }, [showDecl, opacity, manifest, map, base]);

  useEffect(() => () => {
    if (covRef.current) map.removeLayer(covRef.current);
    if (declRef.current) map.removeLayer(declRef.current);
  }, [map]);

  if (!manifest) return null;
  const legend = showDecl ? manifest.declividade?.legend : (showCov ? manifest.coverage?.legend : null);

  return (
    <div className="export-hide absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[230px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-md overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200"
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M4 9h16 M9 21V9" />
          </svg>
          Cobertura & Relevo
          {(showCov || showDecl) && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
        </span>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Cobertura MapBiomas */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showCov} onChange={() => setShowCov(!showCov)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
              <span className="text-xs font-semibold text-slate-700">Cobertura do Solo (MapBiomas)</span>
            </label>
            {showCov && year && (
              <div className="pl-5.5 pt-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <span>Ano</span><span className="text-emerald-700 text-xs">{year}</span>
                </div>
                <input
                  type="range"
                  min={manifest.coverage.years[0]}
                  max={manifest.coverage.years[manifest.coverage.years.length - 1]}
                  step={1}
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[9px] text-slate-400 font-medium">
                  <span>{manifest.coverage.years[0]}</span>
                  <span>{manifest.coverage.years[manifest.coverage.years.length - 1]}</span>
                </div>
              </div>
            )}
          </div>

          {/* Declividade */}
          {manifest.declividade && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showDecl} onChange={() => setShowDecl(!showDecl)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
              <span className="text-xs font-semibold text-slate-700">Declividade (5 classes)</span>
            </label>
          )}

          {/* Opacidade */}
          {(showCov || showDecl) && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Opac.</span>
              <input type="range" min="0" max="100" value={Math.round(opacity * 100)}
                onChange={(e) => setOpacity(parseInt(e.target.value, 10) / 100)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
          )}

          {/* Legenda dinâmica */}
          {legend && legend.length > 0 && (
            <div className="border-t border-slate-200 pt-2 space-y-1">
              {legend.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0 border border-slate-900/10" style={{ backgroundColor: it.color }} />
                  <span className="text-[10px] text-slate-600 truncate" title={it.label}>{it.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
