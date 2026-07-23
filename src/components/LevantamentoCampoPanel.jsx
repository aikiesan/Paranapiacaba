import React from 'react';
import { ModulePage, ModuleHeader, ModuleSection, InfoCard } from './moduleUi';
import { CONSERVATION_PALETTE } from '../config/styleGuide';

// Módulo: Levantamento de Campo (Parte Alta & Rabique).
// Referência de método para o inventário de conservação das edificações e da
// infraestrutura urbana histórica da Vila, integrado à Prancha de Conservação.
export function LevantamentoCampoPanel({ onNavigateToMapWithPreset }) {
  // Escala-semáforo de conservação, espelhando a simbologia do mapa.
  const estados = [
    { key: 'conservado', ...CONSERVATION_PALETTE.conservado },
    { key: 'mau_estado', ...CONSERVATION_PALETTE.mau_estado },
    { key: 'descaracterizado', ...CONSERVATION_PALETTE.descaracterizado },
    { key: 'ruinas', ...CONSERVATION_PALETTE.ruinas },
  ];

  const setores = [
    {
      icon: '⛰️',
      title: 'Parte Alta / Rabique',
      accent: '#843C0C',
      desc: 'Núcleo residencial operário em madeira no topo da colina, com o casario padronizado da São Paulo Railway, vielas sanitárias e o Castelinho.',
    },
    {
      icon: '🏘️',
      title: 'Parte Baixa (Vila Martin Smith)',
      accent: '#0D9488',
      desc: 'Malha ortogonal planejada junto ao pátio ferroviário, com as edificações de maior gabarito, o Mercado e os equipamentos institucionais.',
    },
    {
      icon: '🚉',
      title: 'Núcleo da Estação',
      accent: '#595959',
      desc: 'Complexo ferroviário: estação, Torre do Relógio, oficinas, galpões e o leito dos trilhos — coração funcional do sítio industrial.',
    },
  ];

  const elementos = [
    { icon: '🚿', title: 'Vielas sanitárias', desc: 'Corredores de serviço entre as fileiras de casas, com sistema de esgotamento e ventilação originais da concepção inglesa.' },
    { icon: '💧', title: 'Sarjetas e canaletas', desc: 'Drenagem superficial em pedra e concreto que conduz as águas pluviais pela topografia acidentada da Vila.' },
    { icon: '🧱', title: 'Muros de arrimo', desc: 'Contenções históricas que estabilizam os platôs e as escadarias na encosta — pontos sensíveis de conservação.' },
    { icon: '🪜', title: 'Escadarias e passeios', desc: 'Percursos de pedestres que vencem o desnível entre a Parte Alta e a Parte Baixa.' },
    { icon: '🪵', title: 'Casario em madeira', desc: 'Edificações em tabuado e lambris, com telhados em quatro águas — a assinatura arquitetônica da vila operária.' },
    { icon: '🏛️', title: 'Equipamentos institucionais', desc: 'Igreja, mercado, escola, clube e cinema — a estrutura de vida comunitária a ser fichada.' },
  ];

  return (
    <ModulePage>
      <ModuleHeader
        badge="Inventário de Conservação & Infraestrutura Histórica"
        badgeIcon="📋"
        title="Levantamento de Campo — Parte Alta & Rabique"
        subtitle="Metodologia de fichamento fotográfico do estado de conservação das edificações e mapeamento das vielas sanitárias, sarjetas e muros de arrimo históricos da Vila de Paranapiacaba."
        cta={{ label: 'Ver Prancha de Conservação', onClick: () => onNavigateToMapWithPreset('prancha_conservacao') }}
      />

      {/* Escala de conservação (semáforo IBGE) */}
      <ModuleSection icon="🎨" title="Escala de Conservação (Semáforo IBGE)">
        <p className="text-xs text-slate-500 leading-relaxed">
          Cada edificação é classificada em campo segundo o seu estado de conservação. A mesma
          escala cromática alimenta a simbologia da camada <span className="font-semibold text-slate-700">Edificações da Vila</span> no Mapa SIG.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {estados.map((e) => (
            <div key={e.key} className="rounded-lg border border-slate-200 overflow-hidden bg-white">
              <div className="h-8 w-full" style={{ backgroundColor: e.fill, borderBottom: `3px solid ${e.stroke}` }} />
              <div className="p-2.5">
                <div className="text-xs font-bold text-slate-800">{e.label.split('(')[0].trim()}</div>
                <div className="text-[10px] text-slate-500 leading-snug mt-0.5">
                  {e.label.includes('(') ? e.label.split('(')[1].replace(')', '') : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModuleSection>

      {/* Setores de levantamento */}
      <ModuleSection icon="🗺️" title="Setores de Levantamento">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {setores.map((s) => (
            <InfoCard key={s.title} icon={s.icon} title={s.title} accent={s.accent}>
              {s.desc}
            </InfoCard>
          ))}
        </div>
      </ModuleSection>

      {/* Elementos a inventariar */}
      <ModuleSection icon="🔎" title="Elementos de Infraestrutura Histórica a Inventariar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {elementos.map((el) => (
            <InfoCard key={el.title} icon={el.icon} title={el.title} accent="#10b981">
              {el.desc}
            </InfoCard>
          ))}
        </div>
      </ModuleSection>

      {/* Roteiro de campo */}
      <ModuleSection icon="✅" title="Roteiro da Ficha de Campo">
        <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside marker:text-emerald-600 marker:font-bold">
          <li>Identificação do lote/edificação e vínculo ao cadastro georreferenciado (CAD 2025).</li>
          <li>Registro fotográfico das quatro fachadas e da cobertura.</li>
          <li>Classificação do estado de conservação pela escala-semáforo.</li>
          <li>Anotação de acréscimos, descaracterizações e patologias construtivas.</li>
          <li>Levantamento das vielas, sarjetas e muros de arrimo do entorno imediato.</li>
          <li>Síntese e exportação para a Prancha de Conservação (PNG/PDF).</li>
        </ol>
      </ModuleSection>
    </ModulePage>
  );
}
