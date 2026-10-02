import React, { useEffect, useRef, useState } from 'react';
import { LAYERS, GROUPS } from '../config/layers';
import { useGeoJSON, loadGeoJSON } from '../hooks/useGeoJSON';
import { useIsMobile } from '../hooks/useIsMobile';
import { groupMeta, getLayerSymbol } from '../config/styleGuide';
import { THEMES } from '../config/catalog';
import { downloadGeoJSON } from '../utils/exportData';

// "Swatch" que espelha como a camada é desenhada no mapa (linha / polígono / ponto).
function LayerSwatch({ layer }) {
  const s = getLayerSymbol(layer);
  if (s.emoji) {
    return (
      <span className="w-4 h-4 flex items-center justify-center text-[11px] flex-shrink-0" aria-hidden>
        {s.emoji}
      </span>
    );
  }
  if (s.kind === 'line') {
    return (
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden>
        <span className="block w-4 h-[3px] rounded-full" style={{ backgroundColor: s.color }} />
      </span>
    );
  }
  if (s.kind === 'point') {
    return (
      <span className="w-4 h-4 flex items-center justify-center flex-shrink-0" aria-hidden>
        <span className="block w-2.5 h-2.5 rounded-full border border-stone-900/30" style={{ backgroundColor: s.color }} />
      </span>
    );
  }
  // Polígono
  return (
    <span
      className="w-4 h-4 rounded-[3px] flex-shrink-0 border"
      style={{ backgroundColor: `${s.color}55`, borderColor: s.color }}
      aria-hidden
    />
  );
}

// Botão rotulado do painel de detalhes da camada
function LayerAction({ onClick, icon, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1 px-2 py-1 rounded border border-stone-200 bg-white text-[10px] font-semibold text-stone-600 hover:text-forest-700 hover:border-forest-300 hover:bg-forest-50 transition-colors"
    >
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
      </svg>
      {children}
    </button>
  );
}

const ICON_ZOOM = 'M15 15l6 6m-11-4a7 7 0 110-14 7 7 0 010 14zm0-10v3m0 0v3m0-3h3m-3 0H7';
const ICON_TABLE = 'M3 10h18M3 14h18M3 6h18M3 18h18';
const ICON_DOWNLOAD = 'M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 4v12m0 0l-4-4m4 4l4-4';

// Componente para item de camada individual, lidando com seu próprio hook de dados
function LayerItem({
  layer,
  isActive,
  onToggle,
  currentZoom,
  onOpenTable,
  onZoomToLayer
}) {
  // Só baixa o GeoJSON quando a camada é ligada: abrir um grupo não deve
  // disparar o download de todas as camadas dele (o catálogo soma ~11 MB).
  const { loading, error, unavailable, featureCount } = useGeoJSON(layer.file, isActive, layer.available);

  const [showDetails, setShowDetails] = useState(false);
  const isZoomRestricted = currentZoom < layer.minZoom;
  const isInteractive = !unavailable && !error;

  const handleDownload = () => {
    loadGeoJSON(layer.file)
      .then((json) => json && downloadGeoJSON(layer.id, json))
      .catch((err) => console.warn(`[LayerPanel] Falha ao baixar "${layer.file}":`, err.message));
  };

  return (
    <div
      className={`flex flex-col rounded-md transition-colors ${
        isActive ? 'bg-forest-50/80 ring-1 ring-forest-200' : 'hover:bg-stone-50'
      } py-1.5 px-2`}
    >
      <div className={`flex items-start gap-2.5 transition-opacity ${
        isZoomRestricted ? 'opacity-60' : 'opacity-100'
      }`}>
        {/* Spinner de Loading ou Checkbox */}
        <div className="w-4 h-4 mt-px flex items-center justify-center flex-shrink-0">
          {loading ? (
            <div className="w-2.5 h-2.5 border-2 border-forest-500 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <input
              id={`layer-toggle-${layer.id}`}
              type="checkbox"
              checked={isActive && isInteractive}
              disabled={!isInteractive}
              onChange={() => onToggle(layer.id)}
              className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 border-stone-300 bg-white focus:ring-offset-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
            />
          )}
        </div>

        {/* Símbolo da camada (espelha o mapa) */}
        <span className="mt-px flex-shrink-0"><LayerSwatch layer={layer} /></span>

        {/* Nome completo, quebrando linha em vez de ser cortado */}
        <label
          htmlFor={`layer-toggle-${layer.id}`}
          className={`flex-1 min-w-0 text-xs leading-snug break-words select-none transition-colors ${
            isInteractive ? 'cursor-pointer' : 'cursor-default'
          } ${
            isActive && isInteractive
              ? 'font-bold text-stone-900'
              : 'font-semibold text-stone-600 hover:text-stone-900'
          }`}
        >
          {layer.label}
          {/* Contagem de feições — conhecida depois que a camada foi carregada */}
          {featureCount !== null && isInteractive && (
            <span className="ml-1.5 align-middle text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/50">
              {featureCount}
            </span>
          )}
          {unavailable && (
            <span className="ml-1.5 align-middle text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200/70 uppercase tracking-wide">
              Em breve
            </span>
          )}
        </label>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Erro de Arquivo */}
          {error && (
            <span title="Arquivo não encontrado" className="p-0.5">
              <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          )}

          {/* Restrição de Zoom */}
          {isZoomRestricted && isInteractive && (
            <span
              title={`Visível a partir do zoom ${layer.minZoom} (zoom atual: ${currentZoom}) — aproxime o mapa`}
              className="p-0.5 cursor-help"
            >
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={ICON_ZOOM} />
              </svg>
            </span>
          )}

          {/* Detalhes: descrição + ações rotuladas */}
          {(isInteractive || layer.description) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              aria-expanded={showDetails}
              className={`p-1.5 md:p-0.5 rounded transition-colors ${
                showDetails ? 'text-stone-800 bg-stone-100' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title="Detalhes e ferramentas da camada"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <div className="mt-1.5 ml-[3.25rem] p-2 rounded bg-stone-50 border border-stone-200 space-y-2 animate-fade-in">
          {layer.description && (
            <p className="text-[10px] text-stone-500 leading-relaxed">{layer.description}</p>
          )}
          {isZoomRestricted && isInteractive && (
            <p className="text-[10px] text-amber-700 font-semibold">
              Visível a partir do zoom {layer.minZoom} — use “Aproximar”.
            </p>
          )}
          {isInteractive && (
            <div className="flex flex-wrap gap-1.5">
              {onZoomToLayer && (
                <LayerAction onClick={() => onZoomToLayer(layer.id)} icon={ICON_ZOOM} title="Aproximar na extensão da camada">
                  Aproximar
                </LayerAction>
              )}
              {onOpenTable && (
                <LayerAction onClick={() => onOpenTable(layer.id)} icon={ICON_TABLE} title="Tabela de atributos / exportar CSV">
                  Tabela
                </LayerAction>
              )}
              <LayerAction onClick={handleDownload} icon={ICON_DOWNLOAD} title="Baixar camada (GeoJSON)">
                GeoJSON
              </LayerAction>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// v3: grupos renomeados para as seções do catálogo do dossiê.
const EXPANDED_GROUPS_KEY = 'webgis_expanded_groups_v3';

// Busca sem distinção de acentos/caixa ("hidrografia" acha "Hidrográficas").
const normalize = (text) =>
  (text || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function matchesQuery(layer, query) {
  const meta = groupMeta(layer.group);
  const haystack = normalize(
    [layer.label, layer.description, layer.group, meta.code, meta.themeTitle].join(' ')
  );
  return normalize(query).split(/\s+/).filter(Boolean).every((term) => haystack.includes(term));
}

// Checkbox da seção: marcado se todas as camadas estão ligadas, "meio" se algumas.
function SectionCheckbox({ activeCount, total, onChange, label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = activeCount > 0 && activeCount < total;
  }, [activeCount, total]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={activeCount === total}
      onChange={() => onChange(activeCount === 0)}
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      title={activeCount === 0 ? 'Ligar todas as camadas da seção' : 'Desligar as camadas da seção'}
      className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 border-stone-300 bg-white cursor-pointer flex-shrink-0"
    />
  );
}

// Faixa "No mapa agora": o que está ligado, com remoção em um toque.
function ActiveLayersStrip({ activeLayers, onToggle, onClearAll }) {
  const active = LAYERS.filter((layer) => activeLayers.has(layer.id));
  if (active.length === 0) {
    return (
      <div className="px-4 py-3 border-b border-paper-line bg-paper-dark/60 text-[11px] text-stone-500 leading-relaxed">
        Nenhuma camada no mapa. Ligue camadas abaixo ou escolha um <strong className="text-stone-700">Mapa temático</strong> no topo do mapa.
      </div>
    );
  }
  return (
    <div className="px-3 py-2.5 border-b border-paper-line bg-paper-dark/60">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
          No mapa agora · {active.length}
        </span>
        <button
          onClick={onClearAll}
          className="text-[10px] font-bold text-stone-400 hover:text-rose-700 transition-colors"
          title="Desligar todas as camadas"
        >
          Limpar tudo
        </button>
      </div>
      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
        {active.map((layer) => (
          <span
            key={layer.id}
            className="inline-flex items-center gap-1.5 max-w-full pl-2 pr-1 py-0.5 rounded-full bg-white border border-paper-line text-[10px] font-semibold text-stone-700"
          >
            <LayerSwatch layer={layer} />
            <span className="truncate">{layer.label}</span>
            <button
              onClick={() => onToggle(layer.id)}
              className="w-4 h-4 flex items-center justify-center rounded-full text-stone-400 hover:text-white hover:bg-stone-500 transition-colors flex-shrink-0"
              title={`Remover “${layer.label}” do mapa`}
              aria-label={`Remover ${layer.label} do mapa`}
            >
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export function LayerPanel({
  activeLayers,
  onToggle,
  currentZoom,
  groupOpacities,
  onGroupOpacityChange,
  onToggleAllInGroup,
  onClearAll,
  onOpenAbout,
  onOpenTable,
  onZoomToLayer
}) {
  const isMobile = useIsMobile();
  // Inicia recolhido no mobile (o mapa ocupa a tela toda) e aberto no desktop
  const [isPanelOpen, setIsPanelOpen] = useState(() => !isMobile);
  const [searchQuery, setSearchQuery] = useState('');

  // Estado do accordion, lembrado por navegador. Por padrão só as seções com
  // camadas ligadas abrem, para o catálogo caber na tela.
  const [expandedGroups, setExpandedGroups] = useState(() => {
    try {
      const saved = localStorage.getItem(EXPANDED_GROUPS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Erro ao restaurar accordions:', e);
    }
    return GROUPS.reduce((acc, group) => ({
      ...acc,
      [group]: LAYERS.some((layer) => layer.group === group && activeLayers.has(layer.id))
    }), {});
  });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => {
      const next = { ...prev, [groupName]: !prev[groupName] };
      try {
        localStorage.setItem(EXPANDED_GROUPS_KEY, JSON.stringify(next));
      } catch (e) {
        // Armazenamento bloqueado (janela privada etc.): segue sem lembrar.
      }
      return next;
    });
  };

  const isSearching = searchQuery.trim() !== '';
  const filteredLayers = isSearching ? LAYERS.filter((layer) => matchesQuery(layer, searchQuery)) : [];

  const renderLayer = (layer) => (
    <LayerItem
      key={layer.id}
      layer={layer}
      isActive={activeLayers.has(layer.id)}
      onToggle={onToggle}
      currentZoom={currentZoom}
      onOpenTable={onOpenTable}
      onZoomToLayer={onZoomToLayer}
    />
  );

  const renderSection = (group) => {
    const isExpanded = !!expandedGroups[group];
    const groupLayers = LAYERS.filter(layer => layer.group === group);
    const opacity = groupOpacities[group] !== undefined ? groupOpacities[group] : 100;
    const meta = groupMeta(group);
    const activeInGroup = groupLayers.filter(layer => activeLayers.has(layer.id)).length;
    const hasActiveLayers = activeInGroup > 0;

    return (
      <div
        key={group}
        className={`border rounded-lg overflow-hidden bg-white transition-colors ${
          hasActiveLayers ? 'border-forest-200' : 'border-paper-line'
        }`}
      >
        {/* Cabeçalho da seção */}
        <div className="flex items-center gap-2 px-2.5 py-2 hover:bg-paper/80 transition-colors">
          <SectionCheckbox
            activeCount={activeInGroup}
            total={groupLayers.length}
            onChange={(enable) => onToggleAllInGroup(group, enable)}
            label={`Todas as camadas de ${group}`}
          />
          <button
            onClick={() => toggleGroup(group)}
            aria-expanded={isExpanded}
            className="flex items-center gap-2 text-left flex-1 min-w-0"
          >
            <span
              className="text-[9px] font-bold font-mono px-1 py-0.5 rounded text-white flex-shrink-0"
              style={{ backgroundColor: meta.accent }}
            >
              {meta.code}
            </span>
            <span className="text-sm flex-shrink-0" aria-hidden>{meta.icon}</span>
            <span className="text-xs font-bold text-stone-800 leading-snug flex-1 min-w-0">
              {group}
            </span>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 ${
              hasActiveLayers
                ? 'bg-forest-50 text-forest-700 border-forest-200'
                : 'bg-stone-50 text-stone-400 border-stone-200'
            }`}>
              {activeInGroup}/{groupLayers.length}
            </span>
            <svg
              className={`w-3.5 h-3.5 text-stone-400 transform transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Opacidade — só quando há camadas da seção no mapa */}
        {hasActiveLayers && (
          <div className="mx-2.5 mb-2 flex items-center gap-2 animate-fade-in">
            <span className="text-[9px] uppercase tracking-wide text-stone-400 font-bold">
              Opacidade
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => onGroupOpacityChange(group, parseInt(e.target.value))}
              aria-label={`Opacidade de ${group}`}
              className="flex-1 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-forest-600"
            />
            <span className="text-[9px] font-semibold text-stone-500 w-7 text-right">
              {opacity}%
            </span>
          </div>
        )}

        {isExpanded && (
          <div className="p-1 space-y-0.5 border-t border-paper-line bg-paper/40">
            {groupLayers.map(renderLayer)}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Botão flutuante quando o painel está recolhido */}
      {!isPanelOpen && (
        <button
          onClick={() => setIsPanelOpen(true)}
          className="absolute top-4 left-4 bg-white hover:bg-paper border border-paper-line text-stone-700 pl-2.5 pr-3 py-2 rounded-lg shadow-xl hover:text-stone-900 transition-all z-[1002] flex items-center gap-2 text-xs font-bold"
          title="Abrir painel de camadas"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Camadas
          {activeLayers.size > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-forest-600 text-white text-[9px]">{activeLayers.size}</span>
          )}
        </button>
      )}

      {/* Backdrop (somente mobile) — toque fecha o painel */}
      {isPanelOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-[1000] md:hidden"
          onClick={() => setIsPanelOpen(false)}
          aria-hidden
        />
      )}

      {/* Painel Principal — gaveta sobreposta no mobile, barra lateral fixa no desktop */}
      <div
        className={`bg-paper border-r border-paper-line flex flex-col h-full overflow-hidden transition-all duration-300 shadow-xl z-[1001] fixed inset-y-0 left-0 w-[88vw] max-w-[340px] md:relative md:max-w-none ${
          isPanelOpen ? 'translate-x-0 md:w-[320px]' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0'
        }`}
      >
        {/* Cabeçalho */}
        <div className="px-4 pt-3.5 pb-3 border-b border-paper-line flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-stone-900 font-serif leading-tight">
              Camadas do mapa
            </h1>
            <p className="text-[11px] text-stone-500 leading-snug mt-0.5">
              Organizadas pelos eixos do Caderno de Mapas do dossiê.{' '}
              <button onClick={onOpenAbout} className="underline decoration-stone-300 hover:text-stone-800">
                Sobre o projeto
              </button>
            </p>
          </div>
          <button
            onClick={() => setIsPanelOpen(false)}
            className="text-stone-400 hover:text-stone-800 p-1 rounded hover:bg-paper-dark transition-colors flex-shrink-0"
            title="Recolher painel"
            aria-label="Recolher painel de camadas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </div>

        {/* Barra de Busca */}
        <div className="px-3 py-2.5 border-b border-paper-line flex items-center relative">
          <svg className="absolute left-5 w-3.5 h-3.5 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar: nascentes, tombamento, trilhas…"
            aria-label="Buscar camada"
            className="w-full bg-white border border-stone-300 text-stone-800 placeholder-stone-400 text-xs pl-8 pr-8 py-2 rounded-md focus:outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-colors"
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-5 text-stone-400 hover:text-stone-700 p-1"
              title="Limpar busca"
              aria-label="Limpar busca"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <ActiveLayersStrip activeLayers={activeLayers} onToggle={onToggle} onClearAll={onClearAll} />

        {/* Catálogo: eixos do dossiê → seções → camadas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
          {isSearching ? (
            <div className="space-y-1">
              <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider px-1 pb-1">
                {filteredLayers.length} {filteredLayers.length === 1 ? 'camada encontrada' : 'camadas encontradas'}
              </div>
              {filteredLayers.length === 0 ? (
                <div className="text-xs text-stone-500 text-center py-6 px-4 leading-relaxed">
                  Nada encontrado para “{searchQuery}”. Tente outro termo, como “bacia”, “IPHAN” ou “Vila”.
                </div>
              ) : (
                filteredLayers.map((layer) => {
                  const meta = groupMeta(layer.group);
                  return (
                    <div key={layer.id} className="bg-white border border-paper-line rounded-md">
                      <div className="px-2 pt-1.5 text-[9px] font-bold uppercase tracking-wider text-stone-400">
                        {meta.code} · {layer.group}
                      </div>
                      {renderLayer(layer)}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            THEMES.map((theme) => {
              const sections = theme.sections.map((s) => s.title).filter((title) => GROUPS.includes(title));
              if (sections.length === 0) return null;
              return (
                <section key={theme.code} aria-label={`Eixo ${theme.code}: ${theme.title}`} className="space-y-1.5">
                  <h2 className="flex items-baseline gap-2 px-1 font-serif">
                    <span className="text-sm font-bold" style={{ color: theme.accent }}>{theme.code}</span>
                    <span className="text-[13px] font-bold text-stone-700 leading-tight">{theme.title}</span>
                  </h2>
                  {sections.map(renderSection)}
                </section>
              );
            })
          )}
        </div>

        {/* Rodapé institucional */}
        <div className="px-3 py-2 border-t border-paper-line text-center">
          <span className="text-[9px] text-stone-400 font-bold tracking-wider uppercase">
            FAPESP · PUC-Campinas · 2026
          </span>
        </div>
      </div>
    </>
  );
}
