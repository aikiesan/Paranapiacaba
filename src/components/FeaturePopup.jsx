import React from 'react';

/**
 * Componente que formata e exibe os atributos de uma feature do GeoJSON.
 * Retorna JSX a ser renderizado como string ou elemento.
 * @param {object} props.feature - Feature do GeoJSON contendo properties
 */
export function FeaturePopup({ feature }) {
  if (!feature || !feature.properties) {
    return <div className="text-slate-400 text-xs p-1">Sem atributos disponíveis.</div>;
  }

  const props = feature.properties;

  // Encontra um título amigável (campo de nome)
  const nameKeys = ['nome', 'name', 'NOME', 'Nome', 'NAME', 'label', 'titulo', 'titulo_camada'];
  const titleKey = Object.keys(props).find(key => nameKeys.includes(key));
  const titleValue = titleKey ? props[titleKey] : null;

  // Filtra chaves técnicas e nulas
  const technicalKeys = ['FID', 'OBJECTID', 'Shape_Area', 'Shape_Length', 'id', 'layer'];
  
  const filteredProperties = Object.entries(props).filter(([key, val]) => {
    // Não exibe se for o próprio título do popup
    if (key === titleKey) return false;
    // Exclui chaves nulas ou indefinidas
    if (val === null || val === undefined || String(val).trim() === '') return false;
    // Exclui chaves técnicas ou iniciadas em geometry_
    if (technicalKeys.includes(key) || key.toLowerCase().startsWith('geometry_') || key.toLowerCase().startsWith('shape_')) return false;
    
    return true;
  });

  return (
    <div className="min-w-[180px] max-w-[280px] font-sans text-slate-800 p-1">
      {titleValue && (
        <div className="border-b border-slate-200 pb-1.5 mb-2 font-bold text-sm text-slate-900 leading-tight">
          {titleValue}
        </div>
      )}
      {filteredProperties.length === 0 ? (
        <div className="text-slate-500 text-xs italic">Sem informações adicionais.</div>
      ) : (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
          {filteredProperties.map(([key, val]) => (
            <div key={key} className="flex flex-col text-xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                {key.replace(/_/g, ' ')}
              </span>
              <span className="font-semibold text-slate-700 break-words">
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
