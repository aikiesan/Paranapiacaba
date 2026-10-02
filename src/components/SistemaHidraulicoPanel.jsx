import React from 'react';
import { MapButton, ReaderNote, SheetHeader, SheetPage, SheetSection, Term } from './archive';
import { Entry, EntryGrid } from './moduleUi';

// Folha 05: a engenharia da água em Paranapiacaba e o divisor de águas da
// Serra do Mar (UGRHI 6 × UGRHI 7).
const COMPONENTES = [
  { title: 'Captação de nascentes', accent: '#0070C0', desc: 'Surgências da escarpa canalizadas para abastecer a vila e alimentar as caldeiras a vapor do funicular.' },
  { title: 'Caixas d’água históricas', accent: '#0EA5E9', desc: 'Reservatórios elevados em alvenaria e ferro que davam pressão e regularidade ao abastecimento da vila.' },
  { title: 'Aquedutos e adutoras', accent: '#0369A1', desc: 'Condutos que vencem a topografia acidentada, levando a água das cotas altas às áreas construídas.' },
  { title: 'Manilhas cerâmicas', accent: '#B45309', desc: 'Tubulação em grés e cerâmica da rede original — testemunho material da tecnologia sanitária do século XIX.' },
  { title: 'Rede de esgotamento', accent: '#64748B', desc: 'Drenagem sanitária pelas vielas dos fundos dos lotes, um saneamento planejado desde a origem da vila.' },
  { title: 'APPs de córregos e nascentes', accent: '#7FA86A', desc: 'Faixas de preservação que protegem os corpos d’água que estruturam a vila.' },
];

export function SistemaHidraulicoPanel({ onNavigateToMapWithPreset }) {
  return (
    <SheetPage sheetId="hidraulica">
      <SheetHeader
        sheetId="hidraulica"
        kicker="Engenharia e recursos hídricos"
        title="A água e a vila"
        lede="A água movia as máquinas do funicular, abastecia as casas e ordenava o desenho da vila pelas cotas do terreno. E Paranapiacaba está exatamente onde as águas se dividem."
        meta={[
          { label: 'Bacias', value: 'Tietê × litoral' },
          { label: 'Unidades', value: 'UGRHI 6 e 7' },
        ]}
      >
        <MapButton onClick={() => onNavigateToMapWithPreset('prancha_hidrica_redes')}>Ver a rede hídrica no mapa</MapButton>
      </SheetHeader>

      <SheetSection
        no="1"
        title="No divisor de águas"
        intro="Poucos metros decidem o destino de uma gota de chuva em Paranapiacaba: seguir para o interior, pelo Tietê, ou despencar a escarpa rumo ao mar."
      >
        <div className="grid md:grid-cols-2 gap-px bg-ink/20 border border-ink/20">
          <div className="bg-paper p-5">
            <span className="block w-8 h-[3px] mb-3 bg-sky-700" />
            <div className="caps text-[9px] text-ink-500"><Term id="ugrhi">UGRHI</Term> 6</div>
            <h3 className="font-display text-2xl">Alto Tietê</h3>
            <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-2">
              Vertente interior, que drena para o sistema Billings e o Tietê — manancial de abastecimento da Região Metropolitana de São Paulo.
            </p>
          </div>
          <div className="bg-paper p-5">
            <span className="block w-8 h-[3px] mb-3 bg-forest-700" />
            <div className="caps text-[9px] text-ink-500">UGRHI 7</div>
            <h3 className="font-display text-2xl">Baixada Santista</h3>
            <p className="font-serif text-[0.95rem] leading-relaxed text-ink-600 mt-2">
              Vertente marítima, que desce a Serra pelo Rio Cubatão até o estuário de Santos — o mesmo caminho do funicular.
            </p>
          </div>
        </div>
        <ReaderNote>
          Um <Term id="divisor">divisor de águas</Term> é a linha de cristas que separa duas bacias. No mapa, ligue as sub-bacias para vê-lo passar junto da vila.
        </ReaderNote>
        <MapButton size="sm" onClick={() => onNavigateToMapWithPreset('ambiente')}>Ver as sub-bacias e nascentes no mapa</MapButton>
      </SheetSection>

      <SheetSection no="2" title="O sistema hidráulico da companhia">
        <EntryGrid>
          {COMPONENTES.map((c) => (
            <Entry key={c.title} title={c.title} accent={c.accent}>{c.desc}</Entry>
          ))}
        </EntryGrid>
      </SheetSection>

      <SheetSection no="3" title="Por que isso importa para a candidatura">
        <p className="font-serif text-[1.05rem] leading-relaxed text-ink-700 max-w-3xl">
          O abastecimento de Paranapiacaba não era um sistema à parte: nascentes, adutoras, reservatórios e drenagem faziam parte da mesma máquina que movia os trens. Reconstituir essa rede é essencial para o diagnóstico de conservação e para demonstrar o <Term id="vue">Valor Universal Excepcional</Term> do sítio.
        </p>
      </SheetSection>
    </SheetPage>
  );
}
