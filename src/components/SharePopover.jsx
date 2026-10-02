import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Popover "Compartilhar esta vista": o link (que já carrega enquadramento,
// camadas e basemap no hash) e um QR code para pranchas impressas e cartazes.
export function SharePopover({ onClose }) {
  const [url] = useState(() => window.location.href);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(url, { margin: 1, width: 360, color: { dark: '#1C1917', light: '#FFFFFF' } })
      .then((dataUrl) => !cancelled && setQrDataUrl(dataUrl))
      .catch((err) => console.warn('Erro ao gerar QR code:', err));
    return () => {
      cancelled = true;
    };
  }, [url]);

  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => console.warn('Erro ao copiar URL:', err));
  };

  return (
    <div
      role="dialog"
      aria-label="Compartilhar esta vista do mapa"
      className="absolute right-14 top-0 w-72 bg-paper border border-paper-line rounded-lg shadow-xl p-3.5 space-y-3 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-stone-900 font-serif">Compartilhar esta vista</div>
          <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
            O link abre o mapa neste enquadramento, com as mesmas camadas e o mesmo mapa de fundo.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-800 p-0.5 rounded flex-shrink-0"
          aria-label="Fechar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex gap-1.5">
        <input
          readOnly
          value={url}
          onFocus={(e) => e.target.select()}
          aria-label="Link desta vista"
          className="flex-1 min-w-0 bg-white border border-stone-300 text-stone-700 text-[11px] px-2 py-1.5 rounded font-mono"
        />
        <button
          onClick={handleCopy}
          className="px-2.5 py-1.5 rounded bg-forest-600 hover:bg-forest-700 text-white text-xs font-bold transition-colors whitespace-nowrap"
        >
          {copied ? 'Copiado ✓' : 'Copiar'}
        </button>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div className="w-28 h-28 bg-white border border-paper-line rounded flex items-center justify-center flex-shrink-0">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR code do link desta vista" className="w-full h-full p-1" />
          ) : (
            <div className="w-4 h-4 border-2 border-forest-500 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <div className="space-y-2 min-w-0">
          <p className="text-[11px] text-stone-500 leading-snug">
            Use o QR code em pranchas impressas, cartazes e apresentações.
          </p>
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="paranapiacaba-webgis-qrcode.png"
              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-stone-300 bg-white text-[11px] font-semibold text-stone-700 hover:border-forest-400 hover:text-forest-700"
            >
              Baixar QR (PNG)
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
