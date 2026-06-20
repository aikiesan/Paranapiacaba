import React, { useState, useMemo } from 'react';
import { LAYERS } from '../config/layers';
import { useGeoJSON } from '../hooks/useGeoJSON';
import { downloadGeoJSON, downloadCSV } from '../utils/exportData';

// Painel/gaveta inferior com a tabela de atributos de uma camada: busca,
// download (GeoJSON/CSV) e clique na linha para focar a feição no mapa.
export function DataTablePanel({ layerId, onClose, onSelectFeature }) {
  const layer = LAYERS.find((l) => l.id === layerId);
  const { data, loading } = useGeoJSON(layer?.file, true, layer?.available);
  const [query, setQuery] = useState('');

  const features = data?.features || [];

  // Colunas = união das chaves de propriedade (exceto arrays/objetos como o perfil)
  const columns = useMemo(() => {
    const keys = [];
    features.forEach((f) => {
      Object.entries(f.properties || {}).forEach(([k, v]) => {
        if (Array.isArray(v) || (v && typeof v === 'object')) return;
        if (!keys.includes(k)) keys.push(k);
      });
    });
    return keys.slice(0, 12);
  }, [data]);

  const filtered = useMemo(() => {
    if (!query.trim()) return features;
    const q = query.toLowerCase();
    return features.filter((f) =>
      columns.some((k) => String(f.properties?.[k] ?? '').toLowerCase().includes(q))
    );
  }, [features, columns, query]);

  if (!layer) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[1015] h-[42vh] bg-white border-t border-slate-300 shadow-2xl flex flex-col animate-slide-up">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-3 h-3 rounded-sm flex-shrink-0 border border-slate-900/10" style={{ backgroundColor: layer.color }} />
          <span className="text-xs font-bold text-slate-700 truncate">{layer.label}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            {filtered.length}{query ? ` / ${features.length}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filtrar…"
            className="bg-white border border-slate-300 text-slate-800 placeholder-slate-400 text-xs px-2.5 py-1 rounded focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 w-40"
          />
          <button
            onClick={() => downloadCSV(layer.id, data)}
            disabled={!features.length}
            className="text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:text-emerald-700 border border-slate-300 rounded px-2 py-1 disabled:opacity-40 transition-colors"
            title="Baixar CSV"
          >
            CSV
          </button>
          <button
            onClick={() => downloadGeoJSON(layer.id, data)}
            disabled={!features.length}
            className="text-[10px] font-bold uppercase tracking-wide text-slate-600 hover:text-emerald-700 border border-slate-300 rounded px-2 py-1 disabled:opacity-40 transition-colors"
            title="Baixar GeoJSON"
          >
            GeoJSON
          </button>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 p-1 rounded hover:bg-slate-100" title="Fechar tabela">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Corpo */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {loading ? (
          <div className="p-6 text-center text-xs text-slate-400">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 italic">Nenhuma feição.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-100 z-10">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="px-3 py-1.5 font-bold text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200 whitespace-nowrap">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 500).map((f, i) => (
                <tr
                  key={i}
                  onClick={() => onSelectFeature(f)}
                  className="cursor-pointer hover:bg-emerald-50 even:bg-slate-50/50"
                  title="Focar no mapa"
                >
                  {columns.map((c) => (
                    <td key={c} className="px-3 py-1.5 text-slate-700 border-b border-slate-100 max-w-[220px] truncate">
                      {String(f.properties?.[c] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
