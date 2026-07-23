import React, { useState } from 'react';
import { PHOTO_ARCHIVE } from '../data/photoArchiveIndex';

export function PhotoGalleryModal({ isOpen, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  if (!isOpen) return null;

  const categories = ['Todas', 'Ferrovia Histórica', 'Vila de Paranapiacaba', 'Pesquisa de Campo', 'Trilhas & Natureza'];

  const filteredPhotos = PHOTO_ARCHIVE.filter(
    (p) => selectedCategory === 'Todas' || p.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-[#1C1917]/70 backdrop-blur-xs animate-fade-in font-serif">
      <div 
        className="w-full max-w-5xl bg-[#FAF7F2] border border-[#E7E0D3] rounded-xl shadow-2xl overflow-hidden flex flex-col h-[88vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-[#E7E0D3] bg-[#F4EFE6] text-[#1C1917] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-[#78350F]/10 border border-[#78350F]/20 flex items-center justify-center text-[#78350F]">
              <span className="text-lg">📸</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-[#1C1917] leading-tight font-serif">
                Acervo Fotográfico de Campo & Iconografia Histórica
              </h2>
              <p className="text-xs text-[#78350F] font-sans font-semibold">
                Registros de Pesquisa FAPESP / PUC-Campinas & Arquivo São Paulo Railway
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-[#78716C] hover:text-[#1C1917] p-1.5 rounded hover:bg-[#EFE9DF] transition-colors"
            title="Fechar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Categorias de Filtro */}
        <div className="px-6 py-3 bg-[#EFE9DF] border-b border-[#E7E0D3] flex items-center gap-2 overflow-x-auto custom-scrollbar font-sans text-xs">
          <span className="text-[11px] font-semibold text-[#78716C] uppercase mr-1">Filtrar Categoria:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
                  : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#F4EFE6] border border-[#E7E0D3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de Fotos em Estilo Exposição Museológica */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-[#FAF7F2]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#8C5E3C] transition-all cursor-pointer flex flex-col justify-between"
              >
                <div className="relative aspect-4/3 overflow-hidden bg-[#EFE9DF]">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#1C1917]/70 text-[#FAF7F2] text-[10px] font-sans font-medium backdrop-blur-xs">
                    {photo.category}
                  </div>
                </div>

                <div className="p-4 space-y-1.5 font-sans">
                  <div className="flex items-center justify-between text-[11px] text-[#78350F] font-semibold">
                    <span>{photo.location}</span>
                    <span>{photo.date}</span>
                  </div>
                  <h3 className="text-sm font-serif font-bold text-[#1C1917] leading-snug group-hover:text-[#78350F] transition-colors">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-[#57534E] line-clamp-2 leading-relaxed">
                    {photo.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-3 border-t border-[#E7E0D3] bg-[#F4EFE6] flex justify-between items-center text-xs text-[#57534E] font-sans">
          <span>{filteredPhotos.length} registros fotográficos catalogados no acervo</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#1C1917] font-bold border border-[#E7E0D3] transition-colors"
          >
            Fechar Acervo
          </button>
        </div>
      </div>

      {/* Modal Zoom em Alta Definição */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[2100] flex items-center justify-center p-4 bg-[#1C1917]/85 backdrop-blur-md animate-fade-in font-serif">
          <div className="bg-[#FAF7F2] border border-[#E7E0D3] rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden animate-scale-up">
            <div className="relative bg-black flex items-center justify-center max-h-[60vh]">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="max-h-[60vh] w-auto object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-sans"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-3 font-sans">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-[#FEF3C7] text-[#78350F] text-xs font-bold border border-[#F59E0B]/30">
                  {selectedPhoto.category}
                </span>
                <span className="text-xs text-[#78716C] font-semibold">{selectedPhoto.location} · {selectedPhoto.date}</span>
              </div>
              <h3 className="text-xl font-serif font-bold text-[#1C1917]">{selectedPhoto.title}</h3>
              <p className="text-sm text-[#44403C] leading-relaxed">{selectedPhoto.description}</p>
            </div>

            <div className="px-6 py-3 border-t border-[#E7E0D3] bg-[#F4EFE6] flex justify-end font-sans">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-1.5 text-xs font-bold text-[#44403C] bg-[#FAF7F2] hover:bg-[#EFE9DF] border border-[#E7E0D3] rounded-md"
              >
                Voltar à Galeria
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
