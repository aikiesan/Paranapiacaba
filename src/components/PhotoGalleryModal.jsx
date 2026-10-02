import React, { useEffect, useMemo, useState } from 'react';
import { PHOTO_ARCHIVE, PHOTO_CATEGORIES, webImage } from '../data/photoArchiveIndex';
import { assetUrl } from '../utils/assetUrl';
import { Icon } from './archive';

const CATEGORY_NOTES = {
  'Desenhos da São Paulo Railway': 'Plantas, cortes e elevações a nanquim da própria companhia. Títulos e datas transcritos da folha.',
  'Processos de tombamento': 'Páginas de processos de proteção de bens da antiga SPR no corredor: pareceres, ofícios e registros.',
  'A Serra vista do alto': 'Imagens de satélite usadas pela equipe para localizar os patamares e os caminhos da Serra.',
};

// Ficha de catálogo de um item, no visualizador.
function CatalogCard({ photo, index, total }) {
  const rows = [
    ['Data', photo.date],
    ['Local', photo.location],
    ['Referência', photo.ref],
    ['Fonte', photo.source],
  ].filter(([, value]) => value);
  return (
    <div className="p-5 md:p-6 space-y-4">
      <div className="caps text-[9px] text-signal tabular">
        {photo.category} · {index + 1} de {total}
      </div>
      <h3 className="font-display text-2xl leading-tight text-ink">{photo.title}</h3>
      <p className="font-serif text-[0.95rem] leading-relaxed text-ink-700">{photo.description}</p>
      <dl className="border-t border-ink/20 text-[12px]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-[5.5rem_1fr] gap-3 py-1.5 border-b border-ink/10">
            <dt className="caps text-[9px] text-ink-500 pt-0.5">{label}</dt>
            <dd className="text-ink-700 leading-snug">{value}</dd>
          </div>
        ))}
      </dl>
      <a
        href={assetUrl(photo.src)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-xs font-semibold ink-link text-ink-700"
      >
        Abrir o original em alta resolução <Icon name="arrowRight" className="w-3 h-3" />
      </a>
    </div>
  );
}

export function PhotoGalleryModal({ isOpen, onClose, initialPhotoId = null }) {
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedId, setSelectedId] = useState(null);

  // Abrir o arquivo já numa imagem (vindo de uma figura ou da cronologia).
  useEffect(() => {
    if (isOpen) {
      setSelectedId(initialPhotoId);
      setSelectedCategory('Todas');
    }
  }, [isOpen, initialPhotoId]);

  const filteredPhotos = useMemo(
    () => PHOTO_ARCHIVE.filter((p) => selectedCategory === 'Todas' || p.category === selectedCategory),
    [selectedCategory],
  );
  const viewerList = selectedId && !filteredPhotos.some((p) => p.id === selectedId) ? PHOTO_ARCHIVE : filteredPhotos;
  const selectedIndex = viewerList.findIndex((p) => p.id === selectedId);
  const selectedPhoto = selectedIndex >= 0 ? viewerList[selectedIndex] : null;

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        if (selectedId) setSelectedId(null);
        else onClose();
      } else if (selectedPhoto && event.key === 'ArrowRight') {
        setSelectedId(viewerList[(selectedIndex + 1) % viewerList.length].id);
      } else if (selectedPhoto && event.key === 'ArrowLeft') {
        setSelectedId(viewerList[(selectedIndex - 1 + viewerList.length) % viewerList.length].id);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, selectedId, selectedPhoto, selectedIndex, viewerList]);

  if (!isOpen) return null;

  const step = (delta) => setSelectedId(viewerList[(selectedIndex + delta + viewerList.length) % viewerList.length].id);
  const groups = selectedCategory === 'Todas' ? PHOTO_CATEGORIES.slice(1) : [selectedCategory];

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch md:items-center justify-center md:p-6 bg-ink/60 animate-fade-in" role="dialog" aria-modal="true" aria-label="Arquivo de imagens">
      <div className="w-full max-w-6xl paper-grain md:border md:border-ink/40 shadow-2xl overflow-hidden flex flex-col h-full md:h-[90vh] text-ink">
        {/* Cabeçalho */}
        <div className="px-5 md:px-7 pt-5 pb-4 border-b border-ink/20 flex items-start justify-between gap-4">
          <div>
            <div className="caps text-[9px] text-signal">Anexo · Arquivo de imagens</div>
            <h2 className="font-display text-3xl md:text-4xl leading-none mt-1">O arquivo</h2>
            <p className="font-serif text-sm text-ink-600 mt-2 max-w-2xl">
              Fotografias de pesquisa da equipe FAPESP / PUC-Campinas. Toque numa imagem para ver a ficha e navegar com as setas.
            </p>
          </div>
          <button onClick={onClose} className="p-2 -m-1 text-ink-500 hover:text-ink border border-transparent hover:border-ink/30" aria-label="Fechar o arquivo">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-5 md:px-7 py-2.5 border-b border-ink/20 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {PHOTO_CATEGORIES.map((cat) => {
            const count = cat === 'Todas' ? PHOTO_ARCHIVE.length : PHOTO_ARCHIVE.filter((p) => p.category === cat).length;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={isActive}
                className={`px-3 py-1.5 text-xs whitespace-nowrap border transition-colors ${
                  isActive ? 'bg-ink text-paper border-ink' : 'border-transparent text-ink-600 hover:border-ink/30'
                }`}
              >
                {cat} <span className={`tabular ${isActive ? 'text-paper/60' : 'text-ink-400'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grade por categoria */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 md:px-7 py-6 space-y-10">
          {groups.map((group) => {
            const items = filteredPhotos.filter((p) => p.category === group);
            return (
              <section key={group}>
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-display text-2xl">{group}</h3>
                  <span className="caps text-[9px] text-ink-500 tabular">{items.length} itens</span>
                </div>
                {CATEGORY_NOTES[group] && <p className="font-serif text-sm text-ink-600 mb-4">{CATEGORY_NOTES[group]}</p>}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6">
                  {items.map((photo) => (
                    <button key={photo.id} onClick={() => setSelectedId(photo.id)} className="group text-left">
                      <span className="block bg-paper-deep border border-ink/20 p-1 group-hover:border-ink/60 transition-colors">
                        <span className="block aspect-[4/3] overflow-hidden">
                          <img
                            src={assetUrl(webImage(photo.src))}
                            alt={photo.title}
                            loading="lazy"
                            className="archival-img w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </span>
                      </span>
                      <span className="block font-serif italic text-[13px] leading-snug text-ink-700 mt-2 line-clamp-2 group-hover:text-signal">{photo.title}</span>
                      <span className="block text-[11px] text-ink-400 mt-0.5 tabular line-clamp-1">{photo.date}</span>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* Visualizador com ficha de catálogo */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-[2100] flex items-stretch md:items-center justify-center md:p-6 bg-ink/85 animate-fade-in" onClick={() => setSelectedId(null)}>
          <div
            className="w-full max-w-6xl bg-paper md:border md:border-ink/40 shadow-2xl overflow-hidden grid md:grid-cols-[1fr_22rem] h-full md:h-auto md:max-h-[90vh]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative bg-[#1b1611] flex items-center justify-center min-h-[45vh] md:min-h-[70vh]">
              <img
                key={selectedPhoto.id}
                src={assetUrl(webImage(selectedPhoto.src, 1600))}
                alt={selectedPhoto.title}
                className="max-h-[55vh] md:max-h-[85vh] w-auto max-w-full object-contain animate-fade-in"
              />
              <button onClick={() => step(-1)} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-paper/90 hover:bg-paper text-ink" aria-label="Imagem anterior">
                <Icon name="chevronLeft" className="w-5 h-5" />
              </button>
              <button onClick={() => step(1)} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-paper/90 hover:bg-paper text-ink" aria-label="Próxima imagem">
                <Icon name="chevronRight" className="w-5 h-5" />
              </button>
              <button onClick={() => setSelectedId(null)} className="absolute top-2 right-2 w-9 h-9 flex items-center justify-center bg-paper/90 hover:bg-paper text-ink" aria-label="Voltar à grade">
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-y-auto custom-scrollbar border-t md:border-t-0 md:border-l border-ink/20">
              <CatalogCard photo={selectedPhoto} index={selectedIndex} total={viewerList.length} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
