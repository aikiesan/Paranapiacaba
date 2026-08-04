import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const GROUP_LABELS = {
  historical: 'Mapas históricos',
  legislation: 'Mapas da legislação municipal',
};

function ReferenceMapSelect({ maps, value, onChange }) {
  const groups = useMemo(() => {
    const grouped = new Map();
    maps.forEach((item) => {
      const key = item.group === 'historical'
        ? GROUP_LABELS.historical
        : `${GROUP_LABELS.legislation} — ${item.municipality}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    });
    return [...grouped.entries()];
  }, [maps]);

  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-[11px] text-slate-700 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
      aria-label="Selecionar mapa histórico ou cartografia legal"
    >
      <option value="">Nenhum mapa de referência</option>
      {groups.map(([label, items]) => (
        <optgroup key={label} label={label}>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

// Raster analysis plus optional georeferenced historical and legislation maps.
// Reference maps render below GeoJSON vectors and use multiply blending so their
// white paper background does not obscure the orthophoto.
export function RasterControl() {
  const map = useMap();
  const base = import.meta.env.BASE_URL || '/';
  const [manifest, setManifest] = useState(null);
  const [referenceManifest, setReferenceManifest] = useState(null);
  const [open, setOpen] = useState(false);
  const [showCov, setShowCov] = useState(false);
  const [showDecl, setShowDecl] = useState(false);
  const [year, setYear] = useState(null);
  const [opacity, setOpacity] = useState(0.75);
  const [referenceId, setReferenceId] = useState('');
  const [referenceOpacity, setReferenceOpacity] = useState(0.72);
  const covRef = useRef(null);
  const declRef = useRef(null);
  const referenceRef = useRef(null);

  const selectedReference = useMemo(
    () => referenceManifest?.maps?.find((item) => item.id === referenceId) || null,
    [referenceManifest, referenceId],
  );

  useEffect(() => {
    fetch(`${base}data/rasters/manifest.json`)
      .then((response) => response.json())
      .then((nextManifest) => {
        setManifest(nextManifest);
        const years = nextManifest.coverage?.years;
        if (years?.length) setYear(years[years.length - 1]);
      })
      .catch((error) => console.warn('RasterControl manifest:', error));

    fetch(`${base}data/reference_maps/manifest.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((nextManifest) => {
        setReferenceManifest(nextManifest);
        if (typeof nextManifest.defaultOpacity === 'number') {
          setReferenceOpacity(nextManifest.defaultOpacity);
        }
      })
      .catch((error) => console.info('Reference maps are not available:', error));
  }, [base]);

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

  useEffect(() => {
    if (!manifest?.coverage) return;
    if (showCov && year) {
      const url = `${base}data/rasters/coverage_${year}.png`;
      if (!covRef.current) {
        covRef.current = L.imageOverlay(url, manifest.coverage.bounds, {
          opacity,
          pane: 'analysisRasterPane',
          interactive: false,
          crossOrigin: 'anonymous',
        }).addTo(map);
      } else {
        covRef.current.setUrl(url);
        covRef.current.setOpacity(opacity);
      }
    } else if (covRef.current) {
      map.removeLayer(covRef.current);
      covRef.current = null;
    }
  }, [showCov, year, opacity, manifest, map, base]);

  useEffect(() => {
    if (!manifest?.declividade) return;
    if (showDecl) {
      if (!declRef.current) {
        declRef.current = L.imageOverlay(
          `${base}data/rasters/declividade.png`,
          manifest.declividade.bounds,
          { opacity, pane: 'analysisRasterPane', interactive: false, crossOrigin: 'anonymous' },
        ).addTo(map);
      } else {
        declRef.current.setOpacity(opacity);
      }
    } else if (declRef.current) {
      map.removeLayer(declRef.current);
      declRef.current = null;
    }
  }, [showDecl, opacity, manifest, map, base]);

  useEffect(() => {
    if (referenceRef.current) {
      map.removeLayer(referenceRef.current);
      referenceRef.current = null;
    }
    if (!selectedReference) return;

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
    if (element) element.style.mixBlendMode = referenceManifest?.blendMode || 'multiply';
    referenceRef.current = overlay;

    return () => {
      if (map.hasLayer(overlay)) map.removeLayer(overlay);
      if (referenceRef.current === overlay) referenceRef.current = null;
    };
  }, [selectedReference, referenceOpacity, referenceManifest, map, base]);

  useEffect(() => () => {
    [covRef, declRef, referenceRef].forEach((layerRef) => {
      if (layerRef.current && map.hasLayer(layerRef.current)) map.removeLayer(layerRef.current);
    });
  }, [map]);

  if (!manifest && !referenceManifest) return null;
  const legend = showDecl ? manifest?.declividade?.legend : (showCov ? manifest?.coverage?.legend : null);
  const isActive = showCov || showDecl || Boolean(selectedReference);

  return (
    <div className="export-hide absolute top-3 md:top-4 left-1/2 -translate-x-1/2 z-[1000] w-[285px] max-w-[68vw] md:max-w-none bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-200"
        aria-expanded={open}
      >
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
          <svg className="w-3.5 h-3.5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z M4 9h16 M9 21V9" />
          </svg>
          Rasters & Cartografia
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
        </span>
        <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="p-3 space-y-3 max-h-[68vh] overflow-y-auto custom-scrollbar">
          {manifest?.coverage && (
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
                  <input type="range" min={manifest.coverage.years[0]}
                    max={manifest.coverage.years[manifest.coverage.years.length - 1]} step={1}
                    value={year} onChange={(event) => setYear(parseInt(event.target.value, 10))}
                    className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>
              )}
            </div>
          )}

          {manifest?.declividade && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showDecl} onChange={() => setShowDecl(!showDecl)}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300" />
              <span className="text-xs font-semibold text-slate-700">Declividade (5 classes)</span>
            </label>
          )}

          {(showCov || showDecl) && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Opac.</span>
              <input type="range" min="0" max="100" value={Math.round(opacity * 100)}
                onChange={(event) => setOpacity(parseInt(event.target.value, 10) / 100)}
                className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
            </div>
          )}

          {legend?.length > 0 && (
            <div className="border-t border-slate-200 pt-2 space-y-1">
              {legend.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm flex-shrink-0 border border-slate-900/10" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] text-slate-600 truncate" title={item.label}>{item.label}</span>
                </div>
              ))}
            </div>
          )}

          {referenceManifest?.maps?.length > 0 && (
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">Mapas de referência</div>
                <p className="mt-0.5 text-[9px] leading-snug text-slate-500">Históricos e anexos legais georreferenciados. A Ortofoto 2010 é a referência principal da Vila.</p>
              </div>
              <ReferenceMapSelect maps={referenceManifest.maps} value={referenceId} onChange={setReferenceId} />
              {selectedReference && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 font-bold">Opac.</span>
                    <input type="range" min="0" max="100" value={Math.round(referenceOpacity * 100)}
                      onChange={(event) => setReferenceOpacity(parseInt(event.target.value, 10) / 100)}
                      className="flex-1 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-500" />
                    <span className="w-7 text-right text-[9px] text-slate-500">{Math.round(referenceOpacity * 100)}%</span>
                  </div>
                  <button type="button" onClick={() => map.fitBounds(selectedReference.bounds, { padding: [24, 24] })}
                    className="w-full rounded-md border border-violet-200 bg-violet-50 px-2 py-1.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-100">
                    Enquadrar este mapa
                  </button>
                  <p className="text-[9px] leading-snug text-slate-500">{selectedReference.sourceNote}</p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
