import React, { useMemo, useState } from 'react';

// Aba "Históricos" do painel lateral: cartas históricas, anexos cartográficos
// da legislação municipal e a série temporal de cobertura do solo (MapBiomas).
// Um mapa de referência por vez — escolher outro substitui o anterior.

// "Cubatão — Zoneamento — Anexo I" → "Zoneamento — Anexo I" dentro do grupo do município.
function shortLabel(item) {
  const parts = item.label.split(' — ');
  return parts.length > 1 && parts[0] === item.municipality ? parts.slice(1).join(' — ') : item.label;
}

function Slider({ label, value, onChange, accent = 'accent-forest-600' }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-wide text-stone-400 font-bold w-16">{label}</span>
      <input
        type="range"
        min="0"
        max="100"
        value={Math.round(value * 100)}
        onChange={(event) => onChange(parseInt(event.target.value, 10) / 100)}
        className={`flex-1 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer ${accent}`}
      />
      <span className="w-7 text-right text-[9px] font-semibold text-stone-500">{Math.round(value * 100)}%</span>
    </label>
  );
}

function ReferenceItem({ item, isSelected, overlays, onChange, onFitBounds }) {
  return (
    <div className={`rounded-md border transition-colors ${isSelected ? 'border-rust-300 bg-rust-50' : 'border-transparent hover:bg-white'}`}>
      <button
        onClick={() => onChange({ referenceId: isSelected ? '' : item.id })}
        aria-pressed={isSelected}
        className="w-full flex items-start gap-2 px-2 py-1.5 text-left"
      >
        <span className={`mt-0.5 w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 ${isSelected ? 'border-rust-700 bg-rust-700 ring-2 ring-inset ring-white' : 'border-stone-300 bg-white'}`} />
        <span className={`text-xs leading-snug ${isSelected ? 'font-bold text-rust-800' : 'font-medium text-stone-700'}`}>
          {shortLabel(item)}
        </span>
      </button>
      {isSelected && (
        <div className="px-2 pb-2 pl-7 space-y-2 animate-fade-in">
          <Slider
            label="Opacidade"
            value={overlays.referenceOpacity}
            onChange={(referenceOpacity) => onChange({ referenceOpacity })}
            accent="accent-rust-700"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => onFitBounds(item.bounds)}
              className="px-2 py-1 rounded border border-rust-200 bg-white text-[10px] font-semibold text-rust-700 hover:bg-rust-100"
            >
              Enquadrar no mapa
            </button>
            <button
              onClick={() => onChange({ referenceId: '' })}
              className="px-2 py-1 rounded border border-stone-200 bg-white text-[10px] font-semibold text-stone-500 hover:text-rose-700"
            >
              Remover
            </button>
          </div>
          {item.sourceNote && <p className="text-[10px] leading-snug text-stone-500">{item.sourceNote}</p>}
        </div>
      )}
    </div>
  );
}

export function HistoricMapsPanel({ manifests, overlays, onChange, onFitBounds }) {
  const { rasters, references } = manifests;
  const maps = references?.maps || [];
  const [openMunicipality, setOpenMunicipality] = useState(null);

  const { historical, byMunicipality } = useMemo(() => {
    const grouped = new Map();
    maps.filter((item) => item.group !== 'historical').forEach((item) => {
      if (!grouped.has(item.municipality)) grouped.set(item.municipality, []);
      grouped.get(item.municipality).push(item);
    });
    return {
      historical: maps.filter((item) => item.group === 'historical'),
      byMunicipality: [...grouped.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR')),
    };
  }, [maps]);

  const renderItem = (item) => (
    <ReferenceItem
      key={item.id}
      item={item}
      isSelected={overlays.referenceId === item.id}
      overlays={overlays}
      onChange={onChange}
      onFitBounds={onFitBounds}
    />
  );

  const years = rasters?.coverage?.years || [];
  const year = overlays.coverageYear || years[years.length - 1];

  if (!rasters && !references) {
    return <div className="p-6 text-xs text-stone-500 text-center">Carregando mapas de referência…</div>;
  }

  return (
    <div className="p-3 space-y-4">
      <p className="text-[11px] text-stone-500 leading-relaxed px-1">
        Sobreponha uma carta antiga ou um mapa da legislação ao mapa atual, e ajuste a opacidade para comparar <strong className="text-stone-700">antes e agora</strong>. Um mapa por vez.
      </p>

      {historical.length > 0 && (
        <section className="space-y-1">
          <h2 className="px-1 text-[13px] font-bold font-serif text-stone-800">Cartas históricas</h2>
          {historical.map(renderItem)}
        </section>
      )}

      {byMunicipality.length > 0 && (
        <section className="space-y-1">
          <h2 className="px-1 text-[13px] font-bold font-serif text-stone-800">Legislação municipal</h2>
          {byMunicipality.map(([municipality, items]) => {
            const hasSelected = items.some((item) => item.id === overlays.referenceId);
            const isOpen = openMunicipality === municipality || hasSelected;
            return (
              <div key={municipality} className="border border-paper-line rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setOpenMunicipality(isOpen && !hasSelected ? null : municipality)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left hover:bg-paper/80"
                >
                  <span className="text-xs font-bold text-stone-800">{municipality}</span>
                  <span className="flex items-center gap-1.5">
                    {hasSelected && <span className="w-1.5 h-1.5 rounded-full bg-rust-700" aria-label="mapa no mapa" />}
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-stone-50 text-stone-400 border border-stone-200">
                      {items.length}
                    </span>
                    <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && <div className="p-1 border-t border-paper-line bg-paper/40">{items.map(renderItem)}</div>}
              </div>
            );
          })}
        </section>
      )}

      {rasters?.coverage && years.length > 0 && (
        <section className="space-y-1.5">
          <h2 className="px-1 text-[13px] font-bold font-serif text-stone-800">Cobertura do solo no tempo</h2>
          <div className="border border-paper-line rounded-lg bg-white p-2.5 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={overlays.coverageOn}
                onChange={() => onChange({ coverageOn: !overlays.coverageOn, coverageYear: year })}
                className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 border-stone-300"
              />
              <span className="text-xs font-semibold text-stone-700">MapBiomas {years[0]}–{years[years.length - 1]}</span>
            </label>
            {overlays.coverageOn && (
              <div className="space-y-2 animate-fade-in">
                <div>
                  <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold">
                    <span>Ano</span>
                    <span className="text-forest-700 text-sm font-serif">{year}</span>
                  </div>
                  <input
                    type="range"
                    min={years[0]}
                    max={years[years.length - 1]}
                    step={1}
                    value={year}
                    onChange={(event) => onChange({ coverageYear: parseInt(event.target.value, 10) })}
                    aria-label="Ano da cobertura do solo"
                    className="w-full h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-forest-600"
                  />
                </div>
                <Slider
                  label="Opacidade"
                  value={overlays.coverageOpacity}
                  onChange={(coverageOpacity) => onChange({ coverageOpacity })}
                />
                {rasters.coverage.legend?.length > 0 && (
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 border-t border-paper-line">
                    {rasters.coverage.legend.map((item) => (
                      <div key={item.label} className="flex items-center gap-1.5 min-w-0">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0 border border-stone-900/10" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] text-stone-600 truncate" title={item.label}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
