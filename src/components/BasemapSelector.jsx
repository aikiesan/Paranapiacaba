import React from 'react';

export const BASEMAPS = [
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

export function BasemapSelector({ selectedBasemap, onChange }) {
  return (
    <div className="export-hide absolute bottom-4 right-4 z-[1000] flex bg-white/90 backdrop-blur-md p-1.5 rounded-full border border-slate-200 shadow-md transition-all duration-300 hover:border-slate-350">
      {BASEMAPS.map((basemap) => {
        const isActive = selectedBasemap === basemap.id;
        return (
          <button
            key={basemap.id}
            onClick={() => onChange(basemap.id)}
            className={`px-2 md:px-3 py-1 text-[11px] md:text-xs font-bold rounded-full transition-all duration-200 ${
              isActive
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            {basemap.label}
          </button>
        );
      })}
    </div>
  );
}
