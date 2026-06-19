# Propostas Técnicas de Resolução: Pauta de Reunião FAPESP GIS
**Projeto FAPESP / PUC-Campinas — Dossiê Temático GIS UNESCO Paranapiacaba**  
**Data do Encontro:** 19 de Junho de 2026  
**Documento de Apoio para a Coordenação**

---

## 1. Eixo Físico-Ambiental (Pranchas D1, D2, D3, G1)

### Divisor de Águas (Prancha D2)
*   **Pergunta:** *A representação da Vila como área crítica assentada exatamente sobre o divisor Cubatão/Tietê atende ao foco analítico do Plano de Manejo?*
*   **Proposta de Resolução:** **Sim, atende perfeitamente e é de vital importância analítica.**
*   **Justificativa Técnica:** 
    *   A Vila de Paranapiacaba está geometricamente posicionada sobre a cumeeira da escarpa da Serra do Mar. A vertente norte alimenta a bacia do Rio Tietê (através das cabeceiras que formam o Parque das Nascentes) e a vertente sul drena diretamente para a Bacia Hidrográfica da Baixada Santista (Rio Cubatão).
    *   Qualquer impacto ambiental na Vila (e.g., efluentes, resíduos sólidos, vazamentos) afeta simultaneamente duas macrobacias hidrográficas cruciais.
    *   **Encaminhamento para o Plano de Manejo:** Mapear a Vila no zoneamento ambiental como uma **"Zona Crítica de Sensibilidade Hidrográfica"**. Recomenda-se que o Plano de Manejo prescreva restrições severas de impermeabilização do solo e sistemas de saneamento redundantes baseados em soluções baseadas na natureza (SBN) para salvaguardar as nascentes de cabeceira.

### Classes de Declividade (Prancha D1)
*   **Pergunta:** *A reclassificação em 5 intervalos representa bem as feições da escarpa para subsidiar a análise de risco?*
*   **Proposta de Resolução:** **Sim, desde que os limites dos intervalos reflitam as restrições da legislação e os limiares geotécnicos da escarpa.**
*   **Intervalos Recomendados (5 classes):**
    1.  **0% a 8% (Plano a Suave Ondulado):** Área apta à urbanização e traçado ferroviário (topo do planalto).
    2.  **8% a 20% (Moderado):** Áreas de transição urbana e trilhas secundárias.
    3.  **20% a 30% (Forte Ondulado):** Limite de declividade para ocupação urbana sob a Lei Federal 6.766/79 (exige cuidados especiais de drenagem).
    4.  **30% a 45% (Declivoso):** Áreas impróprias para novas construções, com forte controle de erosão e suscetibilidade média a deslizamentos.
    5.  **> 45% (Escarpado):** Rebordo da escarpa e encostas declivosas da Serra do Mar. Área de risco crítico de escorregamentos e preservação florestal obrigatória.
*   **Justificativa Técnica:** Essa escala permite correlacionar diretamente o relevo com a suscetibilidade a movimentos de massa (deslizamentos e rastejos), facilitando a tomada de decisão da Defesa Civil e a delimitação de zonas de amortecimento ambiental.

---

## 2. Eixo Turismo e Trilhas (T2, R2b, R2c e Folhas de Vale)

### Nomes dos 331 Atrativos Naturais (Prancha T2)
*   **Pergunta:** *A nomenclatura consolidada (poços, cachoeiras, mirantes) está em concordância com os inventários anteriores das professoras?*
*   **Proposta de Resolução:** **Adotar uma Tabela de Equivalência Cadastral no metadado do GIS.**
*   **Justificativa Técnica:** 
    *   Alguns atrativos possuem nomes populares consagrados pelos guias e trilheiros (Wikiloc/comunidade local) que diferem das denominações técnicas usadas nos relatórios e inventários acadêmicos históricos (Profa. Maria Cristina e equipe).
    *   **Ação:** Criar uma tabela de relacionamento no GeoPackage, adicionando duas colunas na camada de pontos: `NOME_POPULAR` (utilizado pelos guias e turistas) e `NOME_ACADEMICO` (inventariado pelas professoras). Isso garante a preservação do histórico e evita duplicidades na contagem final (145 cachoeiras, 64 poços, etc.).

### Capacidade de Carga (Prancha R2c)
*   **Pergunta:** *Os valores adotados de capacidade de carga do Parque devem ser mantidos ou atualizados com o desnível positivo acumulado real extraído da coordenada Z?*
*   **Proposta de Resolução:** **Atualizar e recalcular incorporando a coordenada Z (Desnível Acumulado).**
*   **Justificativa Técnica:** 
    *   A fórmula clássica de capacidade de carga (Cifuentes) considera fatores limitantes físicos e ambientais. Adicionar o **desnível positivo acumulado real (Z)** extraído dos perfis tridimensionais das trilhas permite quantificar objetivamente o **Índice de Esforço Físico** e a fadiga do visitante.
    *   Trilhas com mesma distância horizontal (e.g. 5 km), mas com desníveis diferentes (e.g. Funicular com 800m de desnível vs. Caminho do Sal plano), possuem tempos de permanência e riscos radicalmente distintos. O desnível real atua como limitador de velocidade de circulação, reduzindo a capacidade de carga diária permitida.

### Trilhas de Risco (ex.: Funicular)
*   **Pergunta:** *A descida de serra com pontes desativadas deve ser rotulada como trilha de aventura ou sítio histórico-arqueológico fechado?*
*   **Proposta de Resolução:** **Rotular estritamente como "Sítio Histórico-Arqueológico Industrial sob Interdição/Fechado".**
*   **Justificativa Técnica:** 
    *   O traçado ferroviário e as pontes metálicas da Funicular da SPR (1867) estão fisicamente degradados, sem passarelas e com risco de queda livre de centenas de metros.
    *   Rotular como "trilha de aventura" gera passivo de responsabilidade civil para a Prefeitura/Parque e incentiva acessos clandestinos perigosos.
    *   A classificação como "Sítio Histórico-Arqueológico Industrial Interditado" protege o patrimônio contra vandalismo, preserva a memória da engenharia ferroviária inglesa e protege a integridade física de eventuais visitantes, no âmbito das diretrizes da candidatura UNESCO.

---

## 3. Eixo Patrimônio Material (Obras do PAC e CAD)

### Formato do ID Único
*   **Pergunta:** *O padrão 'PAC_LOTES_TIPO' pode ser formalizado com a equipe de restauro da arquitetura?*
*   **Proposta de Resolução:** **Sim, formalizar e fixar o padrão de chave única.**
*   **Justificativa Técnica:** 
    *   A amarração entre a planta do CAD (`MAPA VILA 2025 UNESCO.dwg`) e as planilhas financeiras/de restauro exige uma chave primária sem espaços ou acentos.
    *   O padrão `PAC_LOTES_TIPO` (e.g. `PAC_409_411_08B`) atende à lógica do geoprocessamento (operações de JOIN). Cada lote do PAC deve conter exatamente um polígono georreferenciado correspondente com esse ID nas tabelas de atributos.

### Inconsistências no CAD (Lotes 445-448 e 459-462)
*   **Pergunta:** *Como solucionar as incompatibilidades cadastrais dos lotes 445-448 (Padrão B) e 459-462 (Padrão C)?*
*   **Proposta de Solução:**
    1.  **Dicionário de Sinônimos Cadastrais:** Criar uma tabela de relacionamento auxiliar dentro do banco de dados geográfico (`GDB`/`GPKG`) que mapeie os três padrões de nomenclatura para o ID Canônico do GIS.
    2.  **Campos Auxiliares:** Na tabela de atributos da camada de edificações, manter campos de retrocompatibilidade como `ID_CAD_ORIGINAL_B` e `ID_CAD_ORIGINAL_C`.
    3.  **Validação de Desenho:** Solicitar à equipe de arquitetura a delimitação exata sobre os lotes 445-448 (Padrão B - `NUM_B_LOTES`) e 459-462 (Padrão C - `2B_E1E2`) no mapa cadastral oficial para unificação de polígonos nas bases.

---

## 4. Eixo Social e Plataforma WebGIS

### Mapeamento Afetivo
*   **Pergunta:** *Qual o formato geoespacial esperado (pontos de depoimento ou polígonos de calor afetivo) para a equipe da Renata?*
*   **Proposta de Resolução:** **Adotar uma representação híbrida composta por duas camadas específicas.**
    1.  **Camada Vetorial de Pontos ("Pontos de Memória"):** Marcadores geoespaciais com popups ricos contendo links para áudios de depoimentos, transcrições em texto e fotografias afetivas históricas de moradores.
    2.  **Camada Vetorial de Polígonos ("Zonas de Relevância Afetiva"):** Polígonos de contorno suave que representam territórios com significados subjetivos (e.g. praças de festa, áreas de trânsito tradicional, pontos de sociabilidade).
    *   *Nota:* Polígonos de calor afetivo (densidade raster) podem ser gerados em cima da camada de pontos como uma ferramenta analítica de síntese.

### Plataforma WebGIS Final
*   **Pergunta:** *A publicação deve priorizar a infraestrutura ArcGIS Online institucional da PUC-Campinas ou QGIS Cloud?*
*   **Proposta de Resolução:** **Priorizar o ArcGIS Online institucional para a publicação oficial, mas manter o repositório em QGIS/GeoPackage totalmente independente.**
*   **Justificativa:**
    *   O **ArcGIS Online** oferece excelentes ferramentas de narrativa visual (**ArcGIS StoryMaps**), que são fundamentais para apresentar a candidatura UNESCO de forma atrativa e interativa aos avaliadores internacionais. A infraestrutura da PUC-Campinas confere robustez e suporte de rede.
    *   O **QGIS Cloud** e bases em **GeoPackage** (código aberto) devem ser mantidos como o ambiente de backup e versionamento dos dados brutos, garantindo a soberania tecnológica e a continuidade do projeto caso haja descontinuidade da assinatura institucional do software proprietário.

### Caderno de Mapas
*   **Pergunta:** *A ordem temática das 39 pranchas no PDF consolidado atende à lógica de entrega da FAPESP?*
*   **Proposta de Resolução:** **Adotar uma estrutura lógica que vá do macro (regional) para o micro (Vila) e do físico (estável) para o social (dinâmico).**
*   **Sequência Temática Proposta:**
    1.  **Grupo I: Contexto Regional e Limites Administrativos** (Pranchas B4, R5, R6, M2)
    2.  **Grupo II: Meio Ambiente e Recursos Hídricos** (Pranchas B3, D1, D2, D3, G1, R3)
    3.  **Grupo III: Sistemas de Infraestrutura e Conexões** (Pranchas M1, P6)
    4.  **Grupo IV: Planejamento Urbano e Legislação Reguladora** (Pranchas P1, P2, P3, S4)
    5.  **Grupo V: Patrimônio Cultural Material (Vila)** (Pranchas P5, S2, V1, V6, V7, V8)
    6.  **Grupo VI: Turismo, Circulação e Trilhas** (Pranchas R2, R2b, R2c, T1, T2, Folhas de Vale)
    7.  **Grupo VII: Socioeconomia e Demografia** (Pranchas S5, S6, V3)
    8.  **Grupo VIII: Sínteses e Dossiê UNESCO** (Pranchas S1, S3)
