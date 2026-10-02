import React, { useEffect, useState } from 'react';
import { CARTOGRAPHIC_MAPS, TECHNICAL_DOCUMENTS, MAP_CATEGORIES } from '../data/mapsIndex';
import { webImage } from '../data/photoArchiveIndex';
import { assetUrl } from '../utils/assetUrl';
import { Icon } from './archive';

const normalize = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Miniatura da prancha: a exportação publicada, ou um cartucho desenhado
// quando a prancha ainda não tem imagem no site.
function SheetThumb({ map, size = 480 }) {
  if (map.preview) {
    return (
      <img
        src={assetUrl(webImage(map.preview, size))}
        alt={`Prancha ${map.code}: ${map.title}`}
        loading="lazy"
        className="w-full h-full object-contain bg-white"
      />
    );
  }
  return (
    <span className="w-full h-full flex flex-col items-center justify-center bg-paper-deep text-ink-400 border border-dashed border-ink/25">
      <span className="font-display text-3xl text-ink-300 tabular">{map.id}</span>
      <span className="caps text-[8px] mt-1">Imagem a publicar</span>
    </span>
  );
}

// Anexo B: o índice das pranchas A0 e os documentos técnicos do projeto.
export function MapGalleryPanel({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('maps');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (event) => {
      if (event.key !== 'Escape') return;
      if (selectedItem) setSelectedItem(null);
      else onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, selectedItem]);

  if (!isOpen) return null;

  const q = normalize(searchTerm.trim());
  const filteredMaps = CARTOGRAPHIC_MAPS.filter((map) =>
    (selectedCategory === 'Todas' || map.category === selectedCategory) &&
    (!q || normalize(`${map.title} ${map.code} ${map.description}`).includes(q)));

  return (
    <div className="fixed inset-0 z-[2000] flex items-stretch md:items-center justify-center md:p-6 bg-ink/60 animate-fade-in" role="dialog" aria-modal="true" aria-label="Pranchas A0 e documentos">
      <div className="w-full max-w-6xl paper-grain md:border md:border-ink/40 shadow-2xl overflow-hidden flex flex-col h-full md:h-[90vh] text-ink">
        <div className="px-5 md:px-7 pt-5 pb-4 border-b border-ink/20 flex items-start justify-between gap-4">
          <div>
            <div className="caps text-[9px] text-signal">Anexo B · Produtos do projeto</div>
            <h2 className="font-display text-3xl md:text-4xl leading-none mt-1">Pranchas e documentos</h2>
            <p className="font-serif text-sm text-ink-600 mt-2 max-w-2xl">
              Os mapas finais em formato A0 e os relatórios do projeto FAPESP / PUC-Campinas. Muitas pranchas também existem como “mapa pronto” no atlas.
            </p>
          </div>
          <button onClick={onClose} className="p-2 -m-1 text-ink-500 hover:text-ink border border-transparent hover:border-ink/30" aria-label="Fechar">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 md:px-7 py-2.5 border-b border-ink/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1" role="tablist">
            {[
              ['maps', `Pranchas A0`, CARTOGRAPHIC_MAPS.length],
              ['docs', 'Documentos', TECHNICAL_DOCUMENTS.length],
            ].map(([id, label, count]) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={`px-3 py-1.5 text-xs border transition-colors ${activeTab === id ? 'bg-ink text-paper border-ink' : 'border-transparent text-ink-600 hover:border-ink/30'}`}
              >
                {label} <span className={`tabular ${activeTab === id ? 'text-paper/60' : 'text-ink-400'}`}>{count}</span>
              </button>
            ))}
          </div>
          {activeTab === 'maps' && (
            <label className="flex items-center gap-2 border-b border-ink/40 pb-1 w-full sm:w-64">
              <Icon name="search" className="w-3.5 h-3.5 text-ink-500" />
              <input
                type="search"
                placeholder="Procurar prancha…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-ink-400"
                aria-label="Procurar prancha"
              />
            </label>
          )}
        </div>

        {activeTab === 'maps' && (
          <div className="px-5 md:px-7 py-2 border-b border-ink/15 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {MAP_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`px-2.5 py-1 text-[11px] whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'text-signal font-semibold underline underline-offset-4 decoration-2' : 'text-ink-600 hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 md:px-7 py-6">
          {activeTab === 'maps' ? (
            filteredMaps.length === 0 ? (
              <p className="font-serif text-ink-600 text-center py-10">Nenhuma prancha encontrada.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-7">
                {filteredMaps.map((map) => (
                  <button key={map.id} onClick={() => setSelectedItem(map)} className="group text-left">
                    <span className="block border border-ink/25 p-1 bg-paper group-hover:border-ink/70 transition-colors">
                      <span className="block aspect-[1189/841] overflow-hidden"><SheetThumb map={map} /></span>
                    </span>
                    <span className="flex items-baseline justify-between gap-2 mt-2">
                      <span className="caps text-[9px] text-signal">{map.code.replace('Mapa_', 'Prancha ')}</span>
                      <span className="caps text-[9px] text-ink-400 tabular">{map.scale.replace(' (A0)', '')}</span>
                    </span>
                    <span className="block font-display text-[1.05rem] leading-tight mt-0.5 group-hover:text-signal">{map.title}</span>
                  </button>
                ))}
              </div>
            )
          ) : (
            <ol className="border-t-2 border-ink max-w-3xl">
              {TECHNICAL_DOCUMENTS.map((doc) => (
                <li key={doc.title} className="py-4 border-b border-ink/15">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="caps text-[9px] text-signal">{doc.type}</span>
                    <span className="caps text-[9px] text-ink-500 tabular">{doc.date}</span>
                  </div>
                  <h3 className="font-display text-xl leading-tight mt-1">{doc.title}</h3>
                  <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-1">{doc.description}</p>
                  <p className="text-[11px] text-ink-500 mt-1.5">{doc.author}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-[2100] flex items-stretch md:items-center justify-center md:p-6 bg-ink/80 animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="w-full max-w-5xl bg-paper md:border md:border-ink/40 shadow-2xl overflow-hidden grid md:grid-cols-[1fr_20rem] md:max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white flex items-center justify-center min-h-[40vh] p-2">
              {selectedItem.preview ? (
                <img src={assetUrl(webImage(selectedItem.preview, 1600))} alt={selectedItem.title} className="max-h-[80vh] w-auto max-w-full object-contain" />
              ) : (
                <div className="w-full aspect-[1189/841]"><SheetThumb map={selectedItem} /></div>
              )}
            </div>
            <div className="p-5 md:p-6 border-t md:border-t-0 md:border-l border-ink/20 overflow-y-auto custom-scrollbar">
              <div className="flex items-start justify-between gap-2">
                <span className="caps text-[9px] text-signal">{selectedItem.code.replace('Mapa_', 'Prancha ')} · {selectedItem.category}</span>
                <button onClick={() => setSelectedItem(null)} className="text-ink-500 hover:text-ink -m-1 p-1" aria-label="Voltar às pranchas">
                  <Icon name="close" className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-display text-2xl leading-tight mt-1">{selectedItem.title}</h3>
              <p className="font-serif text-[0.95rem] leading-relaxed text-ink-700 mt-3">{selectedItem.description}</p>
              <dl className="border-t border-ink/20 mt-4 text-[12px]">
                <div className="grid grid-cols-[5rem_1fr] gap-3 py-1.5 border-b border-ink/10">
                  <dt className="caps text-[9px] text-ink-500 pt-0.5">Escala</dt>
                  <dd className="text-ink-700">{selectedItem.scale}</dd>
                </div>
                <div className="grid grid-cols-[5rem_1fr] gap-3 py-1.5 border-b border-ink/10">
                  <dt className="caps text-[9px] text-ink-500 pt-0.5">Arquivo</dt>
                  <dd className="text-ink-700 break-all">{selectedItem.pdf}</dd>
                </div>
              </dl>
              {selectedItem.preview && (
                <a href={assetUrl(selectedItem.preview)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold ink-link text-ink-700 mt-4">
                  Abrir em alta resolução <Icon name="arrowRight" className="w-3 h-3" />
                </a>
              )}
              <p className="font-serif text-xs text-ink-500 mt-4 leading-relaxed">
                Os originais em PDF e PNG a 300 dpi ficam no repositório de dados do projeto (pasta 06_MAPAS_FINAIS).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
