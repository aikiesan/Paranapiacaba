import React, { useState } from 'react';
import { useMap } from 'react-leaflet';

export function MapToolbar() {
  const map = useMap();
  const [copied, setCopied] = useState(false);

  // Voltar para a extensão inicial do Sítio
  const handleGoHome = () => {
    map.setView([-23.773, -46.312], 13);
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
    <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/50 shadow-lg">
      {/* Botão Home */}
      <button
        onClick={handleGoHome}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all relative group"
        title="Enquadramento Inicial"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-850 shadow-md whitespace-nowrap">
          Enquadramento Inicial
        </span>
      </button>

      {/* Botão Localização */}
      <button
        onClick={handleLocateUser}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all relative group"
        title="Minha Localização"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-850 shadow-md whitespace-nowrap">
          Minha Localização
        </span>
      </button>

      {/* Botão Compartilhar Link */}
      <button
        onClick={handleCopyLink}
        className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-all relative group"
        title="Compartilhar Mapa"
      >
        {copied ? (
          <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 10.742l4.739-2.37M8.684 13.257l4.739 2.37M21 8a3 3 0 11-6 0 3 3 0 016 0zm-6 8a3 3 0 11-6 0 3 3 0 016 0zM9 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
        <span className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover:block bg-slate-950 text-slate-200 text-[10px] px-2 py-1 rounded border border-slate-850 shadow-md whitespace-nowrap">
          {copied ? 'Link Copiado!' : 'Copiar Link do Mapa'}
        </span>
      </button>
    </div>
  );
}
