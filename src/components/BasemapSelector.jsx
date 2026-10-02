import React, { useEffect, useRef, useState } from 'react';

export const BASEMAPS = [
  {
    id: 'ortofoto2010',
    label: 'Ortofoto 2010',
    type: 'image',
    url: 'data/rasters/ortofoto_paranapiacaba_2010.webp',
    bounds: [[-23.79, -46.32], [-23.77, -46.29]],
    attribution: 'Ortofoto Paranapiacaba 2010',
    maxZoom: 21
  },
  {
    id: 'osm',
    label: 'Mapa',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  },
  {
    id: 'satellite',
    label: 'Satélite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  },
  {
    id: 'terrain',
    label: 'Terreno',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
  },
  {
    id: 'dark',
    label: 'Escuro',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  }
];

const BASEMAP_HINTS = {
  ortofoto2010: 'Foto aérea da Vila (2010)',
  osm: 'Ruas e lugares',
  satellite: 'Imagem de satélite atual',
  terrain: 'Relevo e topografia',
  dark: 'Fundo escuro, realça as camadas',
};

// Mapa de fundo: um único botão (em vez de cinco pílulas) que abre a lista.
export function BasemapSelector({ selectedBasemap, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const current = BASEMAPS.find((basemap) => basemap.id === selectedBasemap) || BASEMAPS[0];

  useEffect(() => {
    if (!isOpen) return undefined;
    const close = (event) => ref.current && !ref.current.contains(event.target) && setIsOpen(false);
    const onKey = (event) => event.key === 'Escape' && setIsOpen(false);
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  return (
    <div ref={ref} className="export-hide absolute bottom-9 right-4 z-[1000]">
      {isOpen && (
        <div
          role="menu"
          aria-label="Mapa de fundo"
          className="absolute bottom-full right-0 mb-2 w-56 bg-paper/95 backdrop-blur-md border border-paper-line rounded-lg shadow-xl p-1.5 animate-fade-in"
        >
          <div className="px-2 pt-1 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-500">Mapa de fundo</div>
          {BASEMAPS.map((basemap) => {
            const isActive = basemap.id === current.id;
            return (
              <button
                key={basemap.id}
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  onChange(basemap.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-left transition-colors ${
                  isActive ? 'bg-forest-50' : 'hover:bg-white'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${isActive ? 'border-forest-600 bg-forest-600 ring-2 ring-inset ring-white' : 'border-stone-300 bg-white'}`} />
                <span className="min-w-0">
                  <span className={`block text-xs leading-tight ${isActive ? 'font-bold text-forest-800' : 'font-semibold text-stone-700'}`}>{basemap.label}</span>
                  <span className="block text-[10px] text-stone-500 leading-tight">{BASEMAP_HINTS[basemap.id]}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
      <button
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title="Trocar o mapa de fundo"
        className="flex items-center gap-2 bg-paper/95 backdrop-blur-md pl-2.5 pr-3 py-2 rounded-lg border border-paper-line shadow-md text-xs font-bold text-stone-700 hover:border-forest-300 hover:text-forest-800 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3l9 4.5-9 4.5-9-4.5L12 3zm-9 9l9 4.5 9-4.5M3 16.5L12 21l9-4.5" />
        </svg>
        <span className="text-stone-500 font-semibold">Fundo:</span>
        <span>{current.label}</span>
      </button>
    </div>
  );
}
