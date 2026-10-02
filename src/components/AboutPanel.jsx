import React from 'react';
import { useOnEscape } from '../hooks/useOnEscape';

export function AboutPanel({ isOpen, onClose }) {
  useOnEscape(isOpen, onClose);
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Sobre o Projeto"
    >
      {/* Modal Container */}
      <div
        className="w-full max-w-md bg-white border border-stone-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-5 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-800 leading-tight">
              Sobre o Projeto
            </h2>
            <p className="text-[11px] text-forest-600 font-semibold">
              Dossiê Temático GIS
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-md hover:bg-stone-100 transition-colors"
            title="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 text-stone-600 text-xs">
          
          {/* Sessão: O Projeto */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide border-b border-stone-200 pb-1">
              O Projeto
            </h3>
            <p className="leading-relaxed text-justify text-stone-600">
              O WebGIS consolida o levantamento cartográfico ao longo do <span className="font-semibold text-stone-700">corredor ferroviário histórico Jundiaí–Santos</span> (São Paulo Railway, 1867), tendo a <span className="font-semibold text-stone-700">Vila de Paranapiacaba</span> (Santo André) como núcleo de detalhe — marco da arquitetura inglesa e da engenharia ferroviária na Serra do Mar, subsídio à salvaguarda e à candidatura do sítio à Chancela de Patrimônio Mundial da UNESCO.
            </p>
          </div>

          {/* Sessão: Indicadores / Dados */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide border-b border-stone-200 pb-1">
              Dossier de Dados Integrados
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-stone-600">
              <li>
                <span className="font-semibold text-stone-700">Corredor Jundiaí–Santos</span> mapeado a partir da malha ferroviária IBGE (BaseFerro) e suas estações.
              </li>
              <li>
                <span className="font-semibold text-stone-700">Patrimônio tombado</span> nas instâncias federal, estadual e municipal, com edificações e lotes da Vila por uso.
              </li>
              <li>
                <span className="font-semibold text-stone-700">Meio ambiente</span>: Unidades de Conservação, hidrografia, nascentes e APPs no divisor Cubatão/Tietê.
              </li>
              <li>
                <span className="font-semibold text-stone-700">Equipamentos urbanos</span> (saúde, educação, segurança) dos municípios do corredor.
              </li>
              <li>
                Dados socioeconômicos do <span className="font-semibold text-stone-700">Censo IBGE</span> recortados por setor no distrito de Paranapiacaba.
              </li>
            </ul>
          </div>

          {/* Sessão: Créditos */}
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide border-b border-stone-200 pb-1">
              Parcerias e Financiamento
            </h3>
            <div className="bg-stone-50 p-2.5 rounded border border-stone-200 space-y-1 text-stone-500">
              <div><strong className="text-stone-700">Coordenação e Execução Técnica:</strong> Equipe PUC-Campinas</div>
              <div><strong className="text-stone-700">Fomento:</strong> FAPESP (Fundação de Amparo à Pesquisa do Estado de São Paulo)</div>
            </div>
          </div>

          {/* Sessão: Fontes Abertas */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wide border-b border-stone-200 pb-1">
              Fontes de Informação
            </h3>
            <p className="text-[11px] leading-relaxed text-stone-500">
              MapBiomas (séries temporais), IBGE (Bases Censitárias), Wikiloc (tracks GPS de trilhas), IPHAN (delimitações do patrimônio), Fundação Santo André.
            </p>
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex justify-between items-center text-[10px] text-stone-400 font-medium">
          <span>v0.2 · Junho 2026</span>
          <a
            href="https://github.com/aikiesan/Paranapiacaba"
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-600 hover:text-forest-700 font-bold transition-colors"
          >
            Repositório GitHub &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
