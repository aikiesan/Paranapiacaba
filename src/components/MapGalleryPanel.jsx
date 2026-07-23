import React, { useState } from 'react';
import { CARTOGRAPHIC_MAPS, TECHNICAL_DOCUMENTS } from '../data/mapsIndex';

export function MapGalleryPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('maps');
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#1C1917]/60 backdrop-blur-xs animate-fade-in font-serif">
      <div 
        className="w-full max-w-4xl bg-[#FAF7F2] border border-[#E7E0D3] rounded-xl shadow-xl overflow-hidden flex flex-col h-[85vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-[#E7E0D3] bg-[#F4EFE6] text-[#1C1917] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#78350F]/10 border border-[#78350F]/20 flex items-center justify-center text-[#78350F]">
              <span className="text-lg">📐</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1917] leading-tight font-serif">
                Acervo de Pranchas Cartográficas & Documentos FAPESP
              </h2>
              <p className="text-xs text-[#78350F] font-sans font-semibold">
                Projeto FAPESP / PUC-Campinas — Sítio UNESCO Paranapiacaba
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] p-1 rounded hover:bg-[#EFE9DF] transition-colors"
            title="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Abas e Filtros */}
        <div className="px-6 py-3 border-b border-[#E7E0D3] bg-[#FAF7F2] flex flex-wrap items-center justify-between gap-3 font-sans">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('maps')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'maps'
                  ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#F4EFE6] text-[#44403C] border border-[#E7E0D3] hover:bg-[#EFE9DF]'
              }`}
            >
              Pranchas Cartográficas A0 ({CARTOGRAPHIC_MAPS.length})
            </button>
            <button
              onClick={() => setActiveTab('docs')}
              className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === 'docs'
                  ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#F4EFE6] text-[#44403C] border border-[#E7E0D3] hover:bg-[#EFE9DF]'
              }`}
            >
              Documentos & Relatórios ({TECHNICAL_DOCUMENTS.length})
            </button>
          </div>

          {activeTab === 'maps' && (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <input
                type="text"
                placeholder="Buscar mapa no acervo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-[#F4EFE6] border border-[#E7E0D3] rounded-md focus:outline-none focus:border-[#78350F]"
              />
            </div>
          )}
        </div>

        {/* Categorias de Mapas */}
        {activeTab === 'maps' && (
          <div className="px-6 py-2.5 bg-[#EFE9DF] border-b border-[#E7E0D3] flex items-center gap-1.5 overflow-x-auto custom-scrollbar text-xs font-sans">
            <span className="text-[11px] font-semibold text-[#78716C] uppercase mr-1">Categoria:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-[#78350F] text-[#FAF7F2] font-semibold'
                    : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#F4EFE6] border border-[#E7E0D3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#FAF7F2]">
          {activeTab === 'maps' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
              {filteredMaps.map((map) => (
                <div
                  key={map.id}
                  onClick={() => setSelectedItem(map)}
                  className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl p-4 shadow-xs hover:shadow-md hover:border-[#8C5E3C] transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#78350F] text-[10px] font-mono font-bold border border-[#F59E0B]/30">
                        {map.code}
                      </span>
                      <span className="text-[10px] font-medium text-[#78716C]">
                        {map.scale}
                      </span>
                    </div>
                    <h3 className="text-sm font-serif font-bold text-[#1C1917] leading-snug hover:text-[#78350F] transition-colors">
                      {map.title}
                    </h3>
                    <p className="text-xs text-[#57534E] line-clamp-3 leading-relaxed">
                      {map.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E7E0D3] flex items-center justify-between text-[11px] text-[#78716C]">
                    <span className="bg-[#FAF7F2] px-2 py-0.5 rounded text-[#44403C] font-medium border border-[#E7E0D3]">
                      {map.category}
                    </span>
                    <span className="text-[#78350F] font-bold flex items-center gap-1 hover:underline">
                      Ver Detalhes &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {TECHNICAL_DOCUMENTS.map((doc, idx) => (
                <div key={idx} className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl p-5 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#78350F] text-[10px] font-bold border border-[#F59E0B]/30">
                      {doc.type}
                    </span>
                    <span className="text-xs text-[#78716C] font-mono">{doc.date}</span>
                  </div>
                  <h3 className="text-base font-serif font-bold text-[#1C1917]">{doc.title}</h3>
                  <p className="text-xs text-[#57534E] leading-relaxed">{doc.description}</p>
                  <p className="text-[11px] text-[#78716C] pt-2 border-t border-[#E7E0D3]">
                    Autoria: <strong className="text-[#1C1917] font-serif">{doc.author}</strong>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-[#E7E0D3] bg-[#F4EFE6] flex justify-between items-center text-xs text-[#57534E] font-sans">
          <span>Acervo cartográfico consolidado pelo Laboratório SIG FAPESP / PUC-Campinas</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#1C1917] font-bold border border-[#E7E0D3] transition-colors"
          >
            Fechar Acervo
          </button>
        </div>
      </div>

      {/* Modal de Detalhe da Prancha Cartográfica */}
      {selectedItem && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs animate-fade-in font-serif">
          <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scale-up font-sans">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-[#FEF3C7] text-[#78350F] text-xs font-mono font-bold border border-[#F59E0B]/30">
                  {selectedItem.code}
                </span>
                <h3 className="text-lg font-serif font-bold text-[#1C1917] mt-1">{selectedItem.title}</h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 text-xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2 text-xs text-[#44403C]">
              <div className="flex items-center gap-4 bg-[#F4EFE6] p-2.5 rounded-md border border-[#E7E0D3] font-medium">
                <div>Escala: <strong className="text-[#1C1917] font-serif">{selectedItem.scale}</strong></div>
                <div>Categoria: <strong className="text-[#1C1917] font-serif">{selectedItem.category}</strong></div>
              </div>
              <p className="leading-relaxed text-[#57534E]">{selectedItem.description}</p>
            </div>

            <div className="p-3 bg-[#FEF3C7]/60 border border-[#F59E0B]/30 rounded-md text-[#78350F] text-[11px] leading-snug">
              <strong>Nota do Acervo:</strong> Os arquivos originais em alta definição (PDF/PNG 300 DPI) estão armazenados no repositório de dados GIS do projeto FAPESP (pasta <code>06_MAPAS_FINAIS</code>).
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E0D3]">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 text-xs font-bold text-[#44403C] bg-[#F4EFE6] hover:bg-[#EFE9DF] border border-[#E7E0D3] rounded-md"
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
