import React, { useState } from 'react';

export function MemoriaFerroviariaPanel({ onNavigateToMapWithPreset }) {
  const [selectedPatamar, setSelectedPatamar] = useState(1);

  const patamares = [
    {
      id: 1,
      nome: '1º Patamar (Pé da Serra / Cubatão)',
      altitude: '80 m',
      descricao: 'Início da escarpa da Serra do Mar. Ponto de transição entre a linha de aderência da Baixada Santista e a primeira máquina de tração por cabo.',
      equipamentos: 'Casa de Máquinas nº 1, poço de contrapeso, oficinas de cabos.'
    },
    {
      id: 2,
      nome: '2º Patamar',
      altitude: '250 m',
      descricao: 'Estação intermediária de tração fixa na encosta da serra. Abriga caldeiras a vapor e sistemas de frenagem de emergência.',
      equipamentos: 'Máquina de tração fixa a vapor, reservatório de água de alimentação.'
    },
    {
      id: 3,
      nome: '3º Patamar (Meio da Serra)',
      altitude: '420 m',
      descricao: 'Ponto crítico de travessia do Funicular Serra Nova. Vista panorâmica sobre os vales dos rios Mogi e das Pedras.',
      equipamentos: 'Casa de máquinas interconectada, desvio de cruzamento de composições.'
    },
    {
      id: 4,
      nome: '4º Patamar',
      altitude: '600 m',
      descricao: 'Estação de transição superior na alta escarpa. Suporta o esforço de tração dos trechos de maior declividade (8%).',
      equipamentos: 'Caldeiras fixas, carretéis de cabo de aço de 1.3/8", locobreques.'
    },
    {
      id: 5,
      nome: '5º Patamar (Alto da Serra / Paranapiacaba)',
      altitude: '780 m',
      descricao: 'Topo do plano inclinado funicular. Conexão direta com o pátio de manobras de Paranapiacaba, viradouro de locomotivas e oficinas da ABPF.',
      equipamentos: 'Casa de máquinas principal, Museu Funicular ABPF, relógio da estação, oficinas.'
    }
  ];

  const timeline = [
    {
      ano: '1867',
      titulo: 'Inauguração da São Paulo Railway (SPR)',
      desc: 'Primeira ferrovia paulista ligando Jundiaí a Santos. Entrada em operação do Funicular da Serra Velha (4 planos inclinados).'
    },
    {
      ano: '1898',
      titulo: 'Construção da Torre do Relógio',
      desc: 'Edificação do relógio central da estação de Paranapiacaba (réplica estilizada do Big Ben), controlando os horários dos trens.'
    },
    {
      ano: '1901',
      titulo: 'Conclusão do Funicular Serra Nova',
      desc: 'Ampliação da capacidade de carga com o novo sistema funicular de 5 patamares, operando com cabos sem fim e locobreques.'
    },
    {
      ano: '1946',
      titulo: 'Nacionalização da SPR (EFSJ)',
      desc: 'Término da concessão inglesa de 90 anos. A ferrovia passa para o controle estatal sob o nome Estrada de Ferro Santos a Jundiaí.'
    },
    {
      ano: '1987',
      titulo: 'Criação do Museu Funicular (ABPF)',
      desc: 'Fundação do acervo de preservação ferroviária no 5º Patamar pela Associação Brasileira de Preservação Ferroviária.'
    },
    {
      ano: '2026',
      titulo: 'Reconhecimento Patrimonial & UNESCO',
      desc: 'Georreferenciamento cartográfico CAD 2025, inventário de conservação e inclusão no Dossiê de Candidatura a Patrimônio Mundial.'
    }
  ];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#FAF7F2] text-[#1C1917] p-6 md:p-8 custom-scrollbar font-serif">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Cabeçalho do Módulo Estilo Acervo Histórico */}
        <div className="bg-[#F4EFE6] border border-[#E7E0D3] rounded-xl p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#78350F]/10 text-[#78350F] text-xs font-sans font-bold border border-[#78350F]/20">
              <span>🚂</span> Dossiê Histórico & Exposição Museológica
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#1C1917] font-serif">
              Memória Ferroviária da São Paulo Railway
            </h1>
            <p className="text-[#44403C] text-xs md:text-sm max-w-2xl leading-relaxed font-sans text-justify">
              Resgate histórico e cartográfico da primeira ferrovia de São Paulo (1867), o complexo do Funicular da Serra do Mar e a arquitetura industrial de Paranapiacaba.
            </p>
          </div>
          
          <button
            onClick={() => onNavigateToMapWithPreset('mobilidade')}
            className="flex items-center gap-2 bg-[#78350F] hover:bg-[#451A03] text-[#FAF7F2] text-xs font-sans font-bold px-4 py-2.5 rounded-md shadow-xs transition-all whitespace-nowrap"
          >
            <span>🗺️ Visualizar no Mapa SIG</span>
          </button>
        </div>

        {/* Grid Principal: Linha do Tempo + Sistema Funicular */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
          
          {/* Coluna 1 & 2: Linha do Tempo Histórica */}
          <div className="lg:col-span-2 bg-[#F4EFE6] rounded-xl p-6 shadow-xs border border-[#E7E0D3] space-y-5">
            <h2 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2 border-b border-[#D6CEBE] pb-3 font-serif">
              <span>⏳</span> Cronologia da São Paulo Railway (1867–2026)
            </h2>

            <div className="relative border-l-2 border-[#78350F]/30 ml-3 pl-5 space-y-5 my-2">
              {timeline.map((item, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[26px] top-1 w-3.5 h-3.5 rounded-full bg-[#78350F] border-2 border-[#FAF7F2] shadow-xs group-hover:scale-125 transition-transform" />
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-serif font-bold text-[#78350F] bg-[#FAF7F2] px-2.5 py-0.5 rounded border border-[#E7E0D3]">
                      {item.ano}
                    </span>
                    <span className="text-xs font-serif font-bold text-[#1C1917]">{item.titulo}</span>
                  </div>
                  <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Explorador dos 5 Patamares do Funicular */}
          <div className="bg-[#F4EFE6] rounded-xl p-6 shadow-xs border border-[#E7E0D3] space-y-4">
            <h2 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2 border-b border-[#D6CEBE] pb-3 font-serif">
              <span>⛰️</span> Funicular Serra Nova (5 Patamares)
            </h2>

            <p className="text-xs text-[#57534E] leading-relaxed">
              O sistema funicular vence o desnível de 700 metros da escarpa da Serra do Mar através de 5 seções de tração por cabos de aço.
            </p>

            {/* Seletor de Patamares */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {patamares.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatamar(p.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all ${
                    selectedPatamar === p.id
                      ? 'bg-[#78350F] text-[#FAF7F2] shadow-xs'
                      : 'bg-[#FAF7F2] text-[#44403C] hover:bg-[#EFE9DF] border border-[#E7E0D3]'
                  }`}
                >
                  {p.id}º Patamar
                </button>
              ))}
            </div>

            {/* Detalhes do Patamar Selecionado */}
            {(() => {
              const active = patamares.find(p => p.id === selectedPatamar);
              return (
                <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#E7E0D3] space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-serif font-bold text-[#1C1917]">{active.nome}</span>
                    <span className="text-[10px] font-sans font-bold text-[#78350F] bg-[#FEF3C7] px-2 py-0.5 rounded border border-[#F59E0B]/30">
                      Cota {active.altitude}
                    </span>
                  </div>
                  <p className="text-xs text-[#57534E] leading-relaxed">
                    {active.descricao}
                  </p>
                  <div className="pt-2 border-t border-[#E7E0D3]">
                    <span className="text-[10px] font-sans font-bold text-[#78716C] uppercase block">Equipamentos Históricos:</span>
                    <span className="text-xs text-[#292524]">{active.equipamentos}</span>
                  </div>
                </div>
              );
            })()}

            <button
              onClick={() => onNavigateToMapWithPreset('prancha_hipsometria')}
              className="w-full text-center text-xs font-bold text-[#78350F] bg-[#FEF3C7]/60 hover:bg-[#FEF3C7] p-2.5 rounded-md border border-[#F59E0B]/30 transition-colors"
            >
              Exibir Perfil Altimétrico no Mapa SIG &rarr;
            </button>
          </div>
        </div>

        {/* Seção de Patrimônio Edificado e Monumentos */}
        <div className="bg-[#F4EFE6] rounded-xl p-6 shadow-xs border border-[#E7E0D3] space-y-4 font-sans">
          <h2 className="text-sm font-bold text-[#1C1917] uppercase tracking-wider flex items-center gap-2 border-b border-[#D6CEBE] pb-3 font-serif">
            <span>🏛️</span> Monumentos Históricos & Infraestrutura Industrial
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#E7E0D3] space-y-1.5">
              <div className="text-xs font-serif font-bold text-[#1C1917] flex items-center gap-1.5">
                <span>🕒</span> Relógio da Estação (1898)
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Réplica estilizada do Big Ben de Londres. Controlava pontualmente as composições férreas de passageiros e carga entre Jundiaí e o Porto de Santos.
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#E7E0D3] space-y-1.5">
              <div className="text-xs font-serif font-bold text-[#1C1917] flex items-center gap-1.5">
                <span>🚂</span> Museu Funicular ABPF (5º Patamar)
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Acervo de locomotivas a vapor, locobreques de madeira e aço, carretéis de tração e oficinas históricas mantidas pela Associação Brasileira de Preservação Ferroviária.
              </p>
            </div>

            <div className="bg-[#FAF7F2] p-4 rounded-lg border border-[#E7E0D3] space-y-1.5">
              <div className="text-xs font-serif font-bold text-[#1C1917] flex items-center gap-1.5">
                <span>🏰</span> Castelinho (Casa do Engenheiro)
              </div>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Localizado no topo da colina da Parte Alta, oferecia visão privilegiada sobre todo o pátio ferroviário, estação e vila de moradores.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
