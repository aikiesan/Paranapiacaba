import React, { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

// Área geodésica (m²) de um anel de latlngs — fórmula esférica (igual Leaflet.Draw)
function geodesicArea(latlngs) {
  const R = 6378137;
  const n = latlngs.length;
  if (n < 3) return 0;
  const d2r = Math.PI / 180;
  let area = 0;
  for (let i = 0; i < n; i++) {
    const p1 = latlngs[i], p2 = latlngs[(i + 1) % n];
    area += (p2.lng - p1.lng) * d2r * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
  }
  return Math.abs((area * R * R) / 2);
}

const fmtDist = (m) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(2)} km`);
const fmtArea = (m2) => (m2 < 1e4 ? `${Math.round(m2)} m²` : `${(m2 / 1e6).toFixed(3)} km²`);

// Enquadramento do corredor ferroviário Jundiaí–Santos (SW, NE)
export const CORRIDOR_BOUNDS = [[-24.10, -47.05], [-23.05, -46.15]];
// Centro da Vila de Paranapiacaba
export const VILA_CENTER = [-23.778, -46.305];

export function MapToolbar() {
  const map = useMap();
  const [copied, setCopied] = useState(false);

  // --- Ferramenta de medição (distância / área) ---
  const [measuring, setMeasuring] = useState(false);
  const [readout, setReadout] = useState(null);
  const groupRef = useRef(null);
  const ptsRef = useRef([]);

  const redraw = () => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    g.clearLayers();
    const pts = ptsRef.current;
    pts.forEach((ll) => L.circleMarker(ll, {
      radius: 4, color: '#0f766e', fillColor: '#10b981', fillOpacity: 1, weight: 2,
    }).addTo(g));
    if (pts.length >= 2) {
      L.polyline(pts, { color: '#0f766e', weight: 2.5, dashArray: '5 4' }).addTo(g);
    }
    let dist = 0;
    for (let i = 1; i < pts.length; i++) dist += map.distance(pts[i - 1], pts[i]);
    setReadout(pts.length >= 2 ? { dist, area: pts.length >= 3 ? geodesicArea(pts) : 0 } : null);
  };

  useEffect(() => {
    if (!measuring) return;
    if (!groupRef.current) groupRef.current = L.featureGroup().addTo(map);
    map.getContainer().style.cursor = 'crosshair';
    const onClick = (e) => { ptsRef.current.push(e.latlng); redraw(); };
    map.on('click', onClick);
    return () => {
      map.off('click', onClick);
      if (map.getContainer()) map.getContainer().style.cursor = '';
    };
  }, [measuring, map]);

  const clearMeasure = () => {
    ptsRef.current = [];
    if (groupRef.current) groupRef.current.clearLayers();
    setReadout(null);
  };

  const toggleMeasure = () => {
    if (measuring) { clearMeasure(); setMeasuring(false); }
    else setMeasuring(true);
  };

  // Enquadrar o corredor ferroviário completo (Jundiaí ↔ Santos)
  const handleGoCorridor = () => {
    map.fitBounds(CORRIDOR_BOUNDS, { padding: [30, 30] });
  };

  // Aproximar na Vila de Paranapiacaba
  const handleGoVila = () => {
    map.setView(VILA_CENTER, 16);
  };

  // Buscar localização do usuário via GPS do dispositivo
  const handleLocateUser = () => {
    map.locate({ setView: true, maxZoom: 16 });
  };

  // Copiar link com estado do mapa atual (Zoom/Lat/Lng)
  const handleCopyLink = () => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    const lat = center.lat.toFixed(5);
    const lng = center.lng.toFixed(5);
    const hash = `#${zoom}/${lat}/${lng}`;
    
    // Atualiza a URL sem causar reload
    window.history.pushState(null, null, hash);

    const shareUrl = `${window.location.origin}${window.location.pathname}${hash}`;

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.warn('Erro ao copiar URL:', err);
      });
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-white/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-200 shadow-md">
      {/* Botão Corredor Ferroviário Jundiaí–Santos */}
      <button
        onClick={handleGoCorridor}
        className="p-2 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all relative group"
        title="Corredor Jundiaí–Santos"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 15.5V6a2 2 0 012-2h12a2 2 0 012 2v9.5M4 15.5A2.5 2.5 0 006.5 18h11a2.5 2.5 0 002.5-2.5M4 15.5h16M9 4v14m6-14v14M7.5 21l1.5-3m6 3l-1.5-3" />
        </svg>
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-800 shadow-md whitespace-nowrap">
          Corredor Jundiaí–Santos
        </span>
      </button>

      {/* Botão Paranapiacaba (Vila) */}
      <button
        onClick={handleGoVila}
        className="p-2 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all relative group"
        title="Vila de Paranapiacaba"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-2 0H5m0 0H3m6-4h6m-6-4h6m-6-4h6" />
        </svg>
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-800 shadow-md whitespace-nowrap">
          Vila de Paranapiacaba
        </span>
      </button>

      {/* Botão Medir (distância / área) */}
      <button
        onClick={toggleMeasure}
        className={`p-2 rounded-md transition-all relative group ${
          measuring ? 'bg-emerald-600 text-white' : 'text-slate-650 hover:text-slate-900 hover:bg-slate-100'
        }`}
        title="Medir distância / área"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 17l6-6 4 4 8-8M3 17v4h4M21 7V3h-4" />
        </svg>
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-800 shadow-md whitespace-nowrap">
          {measuring ? 'Medindo — clique no mapa' : 'Medir distância / área'}
        </span>
      </button>

      {/* Leitura da medição */}
      {measuring && (
        <div className="absolute right-12 top-0 bg-white/95 backdrop-blur border border-slate-200 rounded-lg shadow-md px-3 py-2 text-xs whitespace-nowrap">
          {readout ? (
            <div className="space-y-0.5">
              <div className="font-bold text-slate-700">Distância: {fmtDist(readout.dist)}</div>
              {readout.area > 0 && <div className="text-slate-600">Área: {fmtArea(readout.area)}</div>}
            </div>
          ) : (
            <div className="text-slate-500">Clique para adicionar pontos</div>
          )}
          <button onClick={clearMeasure} className="mt-1 text-[10px] font-bold uppercase tracking-wide text-rose-600 hover:text-rose-700">
            Limpar
          </button>
        </div>
      )}

      {/* Botão Localização */}
      <button
        onClick={handleLocateUser}
        className="p-2 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all relative group"
        title="Minha Localização"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-800 shadow-md whitespace-nowrap">
          Minha Localização
        </span>
      </button>

      {/* Botão Compartilhar Link */}
      <button
        onClick={handleCopyLink}
        className="p-2 text-slate-650 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-all relative group"
        title="Compartilhar Mapa"
      >
        {copied ? (
          <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.739-2.37M8.684 13.257l4.739 2.37M21 8a3 3 0 11-6 0 3 3 0 016 0zm-6 8a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-900 text-slate-100 text-[10px] px-2 py-1 rounded border border-slate-800 shadow-md whitespace-nowrap">
          {copied ? 'Link Copiado!' : 'Copiar Link do Mapa'}
        </span>
      </button>
    </div>
  );
}
