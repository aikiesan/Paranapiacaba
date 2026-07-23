import React from 'react';
import { ModulePage, ModuleHeader, ModuleSection, InfoCard } from './moduleUi';
import { PALETTE } from '../config/styleGuide';

// Módulo: Legislação & Planos Diretores.
// Repositório dos instrumentos de proteção patrimonial e ordenamento territorial
// que incidem sobre o corredor e a Vila de Paranapiacaba.
export function LegislacaoPanel({ onNavigateToMapWithPreset }) {
  const tombamentos = [
    {
      icon: '🏛️',
      title: 'IPHAN — Federal',
      accent: PALETTE.tombado_federal.stroke,
      desc: 'Tombamento na instância federal, reconhecendo o valor nacional do conjunto ferroviário e urbano. Exibido em contorno vinho no mapa.',
    },
    {
      icon: '🏰',
      title: 'CONDEPHAAT — Estadual',
      accent: PALETTE.tombado_estadual.stroke,
      desc: 'Proteção do patrimônio no âmbito do Estado de São Paulo, com perímetro em carmim sobre a Vila e o entorno serrano.',
    },
    {
      icon: '🏘️',
      title: 'COMDEPHAAPASA — Municipal',
      accent: PALETTE.tombado_municipal.stroke,
      desc: 'Instância municipal de Santo André, que também conduz processos de estudo de tombamento (bens em estudo).',
    },
  ];

  const instrumentos = [
    {
      icon: '📐',
      title: 'Plano Diretor de Santo André — LC 1.181/2022',
      accent: '#0D9488',
      desc: 'Define as macrozonas municipais e a Macrozona de Proteção Ambiental (MZPA), que enquadra Paranapiacaba e regula o uso do solo na área de mananciais.',
    },
    {
      icon: '🛡️',
      title: 'ZEIP — Zona Especial de Interesse do Patrimônio',
      accent: '#8B4513',
      desc: 'Instrumento urbanístico que grava a Vila como zona especial, condicionando obras, usos e parcelamento à salvaguarda do conjunto histórico.',
    },
    {
      icon: '🌍',
      title: 'Candidatura a Patrimônio Mundial — UNESCO',
      accent: '#D4AF37',
      desc: 'Áreas envoltórias e zonas de amortecimento propostas para o dossiê, articulando as demais camadas de proteção em torno do Valor Universal Excepcional.',
    },
    {
      icon: '🌳',
      title: 'Áreas de mananciais & UCs',
      accent: '#4B5320',
      desc: 'Legislação de proteção aos mananciais e às Unidades de Conservação (PESM, Rebio, Parques) que se sobrepõem ao território serrano.',
    },
  ];

  const municipios = [
    { title: 'Santo André', desc: 'Município-sede do distrito de Paranapiacaba; concentra os instrumentos de tombamento municipal e o Plano Diretor vigente.' },
    { title: 'Rio Grande da Serra', desc: 'Município vizinho no corredor ferroviário, com legislação própria de uso do solo em área de mananciais.' },
    { title: 'Ribeirão Pires', desc: 'Integra a Estância Turística e o eixo da antiga SPR, compondo o contexto regional da candidatura.' },
  ];

  return (
    <ModulePage>
      <ModuleHeader
        badge="Instrumentos de Proteção & Ordenamento Territorial"
        badgeIcon="📐"
        title="Legislação & Planos Diretores"
        subtitle="Repositório dos tombamentos (federal, estadual e municipal), da ZEIP, do Plano Diretor de Santo André (LC 1.181/2022) e das áreas envoltórias da candidatura UNESCO."
        cta={{ label: 'Ver Tombamentos no Mapa SIG', onClick: () => onNavigateToMapWithPreset('prancha_tombamentos') }}
      />

      {/* Instâncias de tombamento */}
      <ModuleSection icon="🏛️" title="Instâncias de Tombamento">
        <p className="text-xs text-slate-500 leading-relaxed">
          A Vila é protegida simultaneamente nas três esferas. No Mapa SIG, cada instância
          aparece como polígono de contorno colorido, conforme o padrão IBGE.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tombamentos.map((t) => (
            <InfoCard
              key={t.title}
              icon={t.icon}
              title={t.title}
              accent={t.accent}
              action={{ label: 'Ver no mapa', onClick: () => onNavigateToMapWithPreset('prancha_tombamentos') }}
            >
              {t.desc}
            </InfoCard>
          ))}
        </div>
      </ModuleSection>

      {/* Instrumentos urbanísticos e ambientais */}
      <ModuleSection icon="📜" title="Planos e Instrumentos Territoriais">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instrumentos.map((i) => (
            <InfoCard
              key={i.title}
              icon={i.icon}
              title={i.title}
              accent={i.accent}
              action={{ label: 'Ver no mapa', onClick: () => onNavigateToMapWithPreset('unesco') }}
            >
              {i.desc}
            </InfoCard>
          ))}
        </div>
      </ModuleSection>

      {/* Municípios do corredor */}
      <ModuleSection icon="🏙️" title="Municípios do Corredor">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {municipios.map((m) => (
            <InfoCard key={m.title} icon="📍" title={m.title} accent="#64748B">
              {m.desc}
            </InfoCard>
          ))}
        </div>
      </ModuleSection>
    </ModulePage>
  );
}
