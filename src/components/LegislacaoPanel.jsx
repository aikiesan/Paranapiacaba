import React from 'react';
import { ArchiveFigure, MapButton, ReaderNote, SheetHeader, SheetPage, SheetSection, Term } from './archive';
import { Entry, EntryGrid } from './moduleUi';
import { PALETTE } from '../config/styleGuide';
import { photoById } from '../data/photoArchiveIndex';

// Folha 07: os instrumentos de proteção patrimonial e de ordenamento
// territorial que incidem sobre o corredor e a Vila de Paranapiacaba.
export function LegislacaoPanel({ onNavigateToMapWithPreset }) {
  const toMap = (preset) => ({ label: 'Ver no mapa', onClick: () => onNavigateToMapWithPreset(preset) });

  const tombamentos = [
    { kicker: 'Federal', title: 'IPHAN', term: 'iphan', accent: PALETTE.tombado_federal.stroke, desc: 'Reconhece o valor nacional do conjunto ferroviário e urbano. No mapa, contorno vinho.' },
    { kicker: 'Estadual', title: 'CONDEPHAAT', term: 'condephaat', accent: PALETTE.tombado_estadual.stroke, desc: 'Protege o bem no âmbito do Estado de São Paulo, com perímetro em carmim sobre a vila e o entorno serrano.' },
    { kicker: 'Municipal', title: 'COMDEPHAAPASA', term: 'comdephaapasa', accent: PALETTE.tombado_municipal.stroke, desc: 'Instância de Santo André, que também conduz estudos de tombamento (bens em estudo).' },
  ];

  const instrumentos = [
    { title: 'Plano Diretor de Santo André — LC 1.181/2022', accent: '#0D9488', desc: 'Define as macrozonas do município e a Macrozona de Proteção Ambiental, que enquadra Paranapiacaba na área de mananciais.' },
    { title: 'ZEIP — Zona Especial de Interesse do Patrimônio', accent: '#8B4513', desc: 'Grava a vila como zona especial: obras, usos e parcelamento ficam condicionados à salvaguarda do conjunto.' },
    { title: 'Candidatura a Patrimônio Mundial', accent: '#B8932F', desc: 'Áreas envoltórias e zonas de amortecimento propostas no dossiê, articulando as demais camadas de proteção.' },
    { title: 'Mananciais e unidades de conservação', accent: '#4B5320', desc: 'Legislação de mananciais e as unidades de conservação — parque estadual, reserva biológica, parques municipais — sobrepostas à Serra.' },
  ];

  const municipios = [
    { title: 'Santo André', desc: 'Sede do distrito de Paranapiacaba; concentra o tombamento municipal e o Plano Diretor vigente.' },
    { title: 'Rio Grande da Serra', desc: 'Vizinho no corredor, com estação tombada e legislação própria de uso do solo em área de mananciais.' },
    { title: 'Ribeirão Pires', desc: 'Estância turística no eixo da antiga SPR, com bens industriais em estudo de tombamento.' },
  ];

  return (
    <SheetPage sheetId="legislacao">
      <SheetHeader
        sheetId="legislacao"
        kicker="Instrumentos de proteção"
        title="Proteção e planos"
        lede="Paranapiacaba é protegida ao mesmo tempo pelas três esferas de governo, e o seu entorno por planos diretores e leis ambientais. Esta folha explica quem protege o quê."
        meta={[
          { label: 'Esferas', value: '3' },
          { label: 'Plano Diretor', value: 'LC 1.181/2022' },
        ]}
      >
        <MapButton onClick={() => onNavigateToMapWithPreset('prancha_tombamentos')}>Ver os tombamentos no mapa</MapButton>
      </SheetHeader>

      <SheetSection
        no="1"
        title="Três tombamentos sobre a mesma vila"
        intro="No mapa, cada instância aparece como um polígono de contorno colorido. Onde eles se sobrepõem, as regras se somam."
      >
        <EntryGrid>
          {tombamentos.map((t) => (
            <Entry key={t.title} kicker={t.kicker} title={<Term id={t.term}>{t.title}</Term>} accent={t.accent} action={toMap('prancha_tombamentos')}>
              {t.desc}
            </Entry>
          ))}
        </EntryGrid>
        <ReaderNote>
          O <Term id="tombamento">tombamento</Term> não “congela” o bem: obriga a que qualquer intervenção seja aprovada pelo órgão de proteção — no próprio bem e, em geral, também no seu entorno.
        </ReaderNote>
      </SheetSection>

      <SheetSection no="2" title="Como é um processo de tombamento" intro="Uma decisão de proteção deixa um rastro de papéis: estudos, pareceres, ofícios, avisos de recebimento e, por fim, a anotação no registro de imóveis.">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
          {['proc-rgs-resolucao', 'proc-rgs-spu', 'proc-correio', 'proc-registro'].map((id, index) => (
            <ArchiveFigure key={id} photo={photoById(id)} fig={index + 1} aspect="aspect-[3/4]" />
          ))}
        </div>
      </SheetSection>

      <SheetSection no="3" title="Planos e instrumentos territoriais">
        <EntryGrid cols="md:grid-cols-2">
          {instrumentos.map((i) => (
            <Entry key={i.title} title={i.title} accent={i.accent} action={toMap('unesco')}>{i.desc}</Entry>
          ))}
        </EntryGrid>
        <p className="font-serif text-sm text-ink-500 mt-4 max-w-3xl">
          Veja também <Term id="zeip">ZEIP</Term>, <Term id="mzpa">MZPA</Term> e <Term id="zona-amortecimento">zona de amortecimento</Term> no glossário.
        </p>
      </SheetSection>

      <SheetSection no="4" title="Os municípios do corredor">
        <EntryGrid>
          {municipios.map((m) => <Entry key={m.title} title={m.title} accent="#8C7F71">{m.desc}</Entry>)}
        </EntryGrid>
        <p className="font-serif text-sm text-ink-500 mt-4">
          Os mapas de zoneamento de cada município podem ser sobrepostos ao mapa atual na aba <strong className="text-ink-700">Históricos</strong> do painel do mapa.
        </p>
      </SheetSection>
    </SheetPage>
  );
}
