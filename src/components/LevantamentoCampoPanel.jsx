import React from 'react';
import { MapButton, ReaderNote, SheetHeader, SheetPage, SheetSection, Term } from './archive';
import { Entry, EntryGrid } from './moduleUi';
import { CONSERVATION_PALETTE } from '../config/styleGuide';

// Folha 06: o método do inventário de conservação das edificações e da
// infraestrutura urbana histórica da Vila (Parte Alta e Rabique).
const SETORES = [
  { title: 'Parte Alta e Rabique', accent: '#843C0C', desc: 'Núcleo residencial no topo da colina, com o casario padronizado da companhia, as vielas sanitárias e o Castelinho.' },
  { title: 'Parte Baixa (Vila Martin Smith)', accent: '#0D9488', desc: 'Malha ortogonal planejada junto ao pátio ferroviário, com as edificações maiores, o mercado e os equipamentos coletivos.' },
  { title: 'Núcleo da estação', accent: '#595959', desc: 'Estação, torre do relógio, oficinas, galpões e o leito dos trilhos — o coração funcional do sítio.' },
];

const ELEMENTOS = [
  { title: 'Vielas sanitárias', desc: 'Corredores de serviço entre as fileiras de casas, com o esgotamento e a ventilação da concepção original.' },
  { title: 'Sarjetas e canaletas', desc: 'Drenagem superficial em pedra e concreto que conduz a chuva pela topografia acidentada da vila.' },
  { title: 'Muros de arrimo', desc: 'Contenções históricas que estabilizam os platôs e as escadarias na encosta — pontos sensíveis de conservação.' },
  { title: 'Escadarias e passeios', desc: 'Percursos de pedestres que vencem o desnível entre a Parte Alta e a Parte Baixa.' },
  { title: 'Casario em madeira', desc: 'Edificações em tabuado e lambris, com telhados em quatro águas — a assinatura arquitetônica da vila.' },
  { title: 'Equipamentos coletivos', desc: 'Igreja, mercado, escola, clube e cinema — a estrutura da vida comunitária, também a ser fichada.' },
];

const ROTEIRO = [
  'Identificar o lote e a edificação e ligá-los ao cadastro georreferenciado (CAD 2025).',
  'Fotografar as quatro fachadas e a cobertura.',
  'Classificar o estado de conservação pela escala-semáforo.',
  'Anotar acréscimos, descaracterizações e patologias construtivas.',
  'Levantar vielas, sarjetas e muros de arrimo do entorno imediato.',
  'Consolidar e exportar para a prancha de conservação.',
];

export function LevantamentoCampoPanel({ onNavigateToMapWithPreset }) {
  const estados = ['conservado', 'mau_estado', 'descaracterizado', 'ruinas'].map((key) => ({ key, ...CONSERVATION_PALETTE[key] }));

  return (
    <SheetPage sheetId="campo">
      <SheetHeader
        sheetId="campo"
        kicker="Inventário de conservação"
        title="Levantamento de campo"
        lede="Como a equipe percorre a vila casa por casa para registrar o estado de cada edificação e da infraestrutura histórica — e como esse registro vira mapa."
        meta={[
          { label: 'Setores', value: SETORES.length },
          { label: 'Estados', value: estados.length },
          { label: 'Etapas', value: ROTEIRO.length },
        ]}
      >
        <MapButton onClick={() => onNavigateToMapWithPreset('prancha_conservacao')}>Ver a prancha de conservação</MapButton>
      </SheetHeader>

      <SheetSection
        no="1"
        title="A escala de conservação"
        intro="Cada edificação recebe em campo uma de quatro cores. É a mesma escala que pinta a camada “Edificações da Vila” no mapa."
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink/20 border border-ink/20">
          {estados.map((e) => {
            const [name, note] = e.label.split('(');
            return (
              <div key={e.key} className="bg-paper">
                <div className="h-12" style={{ backgroundColor: e.fill, borderBottom: `3px solid ${e.stroke}` }} />
                <div className="p-3">
                  <div className="font-display text-lg leading-tight">{name.trim()}</div>
                  {note && <div className="font-serif text-xs text-ink-500 mt-0.5">{note.replace(')', '')}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </SheetSection>

      <SheetSection no="2" title="Os setores da vila">
        <EntryGrid>
          {SETORES.map((s) => <Entry key={s.title} title={s.title} accent={s.accent}>{s.desc}</Entry>)}
        </EntryGrid>
      </SheetSection>

      <SheetSection no="3" title="O que se inventaria" intro="Não só as casas: a vila é um sistema, e a infraestrutura que a sustenta também é patrimônio.">
        <EntryGrid>
          {ELEMENTOS.map((el) => <Entry key={el.title} title={el.title}>{el.desc}</Entry>)}
        </EntryGrid>
        <ReaderNote>
          A <Term id="viela-sanitaria">viela sanitária</Term> é um dos traços mais típicos da <Term id="vila-ferroviaria">vila ferroviária</Term> inglesa: separa o serviço da casa da rua.
        </ReaderNote>
      </SheetSection>

      <SheetSection no="4" title="Roteiro da ficha de campo">
        <ol className="border-t-2 border-ink max-w-3xl">
          {ROTEIRO.map((step, index) => (
            <li key={step} className="grid grid-cols-[2.5rem_1fr] gap-3 py-3 border-b border-ink/15">
              <span className="font-display text-2xl text-signal leading-none tabular">{index + 1}</span>
              <span className="font-serif text-[0.98rem] leading-relaxed text-ink-700">{step}</span>
            </li>
          ))}
        </ol>
      </SheetSection>
    </SheetPage>
  );
}
