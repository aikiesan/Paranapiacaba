import React, { useState } from 'react';
import { CARTOGRAPHIC_MAPS, TECHNICAL_DOCUMENTS } from '../data/mapsIndex';

export function MapGalleryPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('maps'); // 'maps' | 'docs'
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  if (!isOpen) return null;

  const categories = ['Todas', 'Síntese & UNESCO', 'Patrimônio', 'Meio Ambiente', 'Zoneamento & Gestão', 'Mobilidade', 'Trilhas & Turismo', 'Socioeconômico'];

  const filteredMaps = CARTOGRAPHIC_MAPS.filter((map) => {
    const matchesCategory = selectedCategory === 'Todas' || map.category === selectedCategory;
    const matchesSearch = map.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          map.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          map.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 leading-tight">
                Acervo de Pranchas Cartográficas & Documentos FAPESP
              </h2>
              <p className="text-xs text-emerald-400 font-medium">
                Projeto FAPESP / PUC-Campinas — Sítio UNESCO Paranapiacaba
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Abas e Filtros */}
        <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('maps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'maps'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Pranchas Cartográficas A0 ({CARTOGRAPHIC_MAPS.length})
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'docs'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Documentos & Relatórios ({TECHNICAL_DOCUMENTS.length})
            </button>
          </div>

          {activeTab === 'maps' && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Buscar mapa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}
        </div>

        {/* Categorias de Mapas */}
        {activeTab === 'maps' && (
          <div className="px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs">
            <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Categoria:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50">
          {activeTab === 'maps' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMaps.map((map) => (
                <div
                  key={map.id}
                  onClick={() => setSelectedItem(map)}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200">
                        {map.code}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400">
                        {map.scale}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug hover:text-emerald-700 transition-colors">
                      {map.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {map.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                      {map.category}
                    </span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline">
                      Ver Detalhes &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {TECHNICAL_DOCUMENTS.map((doc, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                      {doc.type}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{doc.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-800">{doc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.description}</p>
                  <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                    Autoria: <strong className="text-slate-700">{doc.author}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-slate-200 bg-white flex justify-between items-center text-xs text-slate-500">
          <span>Acervo cartográfico consolidado pelo Laboratório SIG FAPESP / PUC-Campinas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Fechar Acervo
          </button>
        </div>
      </div>

      {/* Modal de Detalhe da Prancha Cartográfica */}
      {selectedItem && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                  {selectedItem.code}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                <div>Escala: <strong className="text-slate-800">{selectedItem.scale}</strong></div>
                <div>Categoria: <strong className="text-slate-800">{selectedItem.category}</strong></div>
              </div>
              <p className="leading-relaxed text-slate-700">{selectedItem.description}</p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] leading-snug">
              <strong>Nota do Acervo:</strong> Os arquivos originais em alta definição (PDF/PNG 300 DPI) estão armazenados no repositório de dados GIS do projeto FAPESP (pasta <code>06_MAPAS_FINAIS</code>).
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Voltar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
