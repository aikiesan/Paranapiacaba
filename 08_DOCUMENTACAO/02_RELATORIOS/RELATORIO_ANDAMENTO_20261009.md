# Relatório de andamento — 09/10/2026

Branch `feat/lugares-memoria-relevo` (a partir da `main` atualizada em 09/10/2026).
Três frentes: lugares de memória (mapa afetivo), relevo até o Parque Andreense e
Caminho do Sal.

> Este relatório não reproduz nenhuma fala dos entrevistados (o repositório é
> público). As falas ficam só em
> `EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/05_TRANSCRICOES/citacoes_lugares.csv`, fora
> do git, e são referidas aqui apenas pelo `id` (LM001…LM068).

---

## (a) O que foi feito

| Commit | Tarefa | Resumo |
|---|---|---|
| `d0168dc` | 1 — Lugares de Memória | `scripts/build_lugares_memoria.py`, camada `lugares_memoria` (seção 5.4 “Memória Afetiva”), painel com as falas, testes |
| `fe0bb02` | 2 — Hipsometria e declividade | janela do DEM ampliada até lon −46,50; nova camada `hipsometria`; ambas no preset `escala_serra` (1:100.000) |
| `be0f2b6` | 3 — Caminho do Sal | `scripts/build_caminho_sal.py`, camada `caminho_sal` (seção 6.2 “Caminhos Históricos”) com autoria de Mariana Lebens |
| `3017c04` | 1 — anonimização e pausa | falantes viram “Depoente NN”, nomes listados são substituídos; camada pausada (não vai ao GitHub Pages) |

Verificações: `npm test` (14 arquivos, 124 testes) e `npm run build` passam;
`python -m unittest test_build_lugares_memoria` (8 testes) passa. As três camadas
foram conferidas no navegador (preset 1:100.000 e painel de detalhe).

### Anonimização e pausa dos dados afetivos (decisão de 09/10/2026)

- **Tudo o que for publicado sai anonimizado.**
  - Cada falante vira `Depoente NN`, numerado pela ordem de aparição no CSV, para
    que o código não mude quando novas falas forem aprovadas.
  - Os nomes de moradores e terceiros listados em `nomes_anonimizar.csv` (pasta
    EXTERNAL, fora do git) são substituídos nas falas, nos nomes de lugar e nas
    fontes. Por exemplo, “Rancho do seu …” vira “Rancho do [um morador]”.
  - A lista começou com 10 entradas: os terceiros citados nas falas e a autoria
    das notas de campo, que passa a aparecer como “equipe PUC-Campinas”.
  - Topônimos históricos consolidados (Caixa do Gustavo, Casa Fox, Lyra)
    **não** foram alterados; a equipe pode incluí-los na lista se preferir.
  - Os nomes reais continuam só nos CSVs locais, necessários para o controle de
    consentimento.
- **A camada está pausada.**
  - `available: false` no catálogo: aparece como “em breve” e não é carregada.
  - `build_lugares_memoria.py` só publica com a flag `--publicar`; sem ela, grava
    GeoJSON vazio mesmo que haja falas aprovadas.
  - Um teste falha se a camada for liberada sem atualizar essa decisão.
- **Mapas preliminares para uso interno** em
  `EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/MAPAS_PRELIMINARES_20261009/` (fora do git):
  1. mapa afetivo estático (PNG);
  2. mapa afetivo interativo (HTML local, com as falas anonimizadas);
  3. relevo (hipsometria e declividade);
  4. Caminho do Sal.

  Os mapas afetivos usam as 68 falas como prévia, sem depender de aprovação, e
  não devem ser publicados.

### Tarefa 1 — Lugares de memória

1. **Fontes copiadas** para `EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/05_TRANSCRICOES/`
   (ignorada pelo git): as 4 transcrições `.txt` e as notas de campo `.docx`.
2. **`citacoes_lugares.csv`** — 68 falas, colunas `id, fonte, falante, timestamp,
   citacao, lugar, tema, publicavel`. Todas com `publicavel = revisar`.
   - Quando uma fala cita vários lugares, `lugar` traz todos separados por `;` e o
     script associa a fala a cada um deles.
   - Nas notas de campo, que não têm minutagem, `timestamp` traz data, período e
     local da gravação.
   - Critério de extração: entram só falas com lugar **identificável** (topônimo,
     rua, edifício, patamar, campo, rancho nomeado, cachoeira etc.). Ficaram de fora
     as menções genéricas (“a Vila”, “a mata”, “aqui”), as cidades de origem dos
     entrevistados e as falas institucionais do evento.
3. **`lugares_memoria_gazetteer.csv`** — 58 lugares. As coordenadas vieram só de
   feições nomeadas já publicadas (`atrativos`, `estacoes`, `cemiterio`). Nenhuma
   coordenada foi inventada: o que não tem feição correspondente ficou como
   `precisao = pendente`, e a coluna `fonte_coord` traz uma pista para o
   georreferenciamento manual.
   - As camadas `nascentes`, `caminhos_vila` e `edificacoes_vila` não têm atributo
     de nome, então não servem para localizar topônimos.
   - Busquei também em `trilhas` e `patrimonio_tombados`, sem correspondência
     pontual utilizável.
4. **`scripts/build_lugares_memoria.py`** publica `public/data/lugares_memoria.geojson`
   só com `publicavel == "sim"` e lugar com coordenada. Como nada foi aprovado, o
   arquivo publicado é uma `FeatureCollection` vazia. Se os CSVs não existirem
   (outro clone, CI), também gera a camada vazia.
5. **Camada “Lugares de Memória”** (pontos), seção 5.4 do catálogo. O painel de
   detalhe lista as falas do lugar: citação, falante, fonte, minutagem e tema.
6. **Testes**:
   - `tests/lugaresMemoria.test.js`: catálogo, GeoJSON válido, nenhum ponto
     pendente, campos obrigatórios das falas, ausência da coluna `publicavel` no
     arquivo público e a pasta EXTERNAL no `.gitignore`.
   - `scripts/test_build_lugares_memoria.py`: a regra “só `sim` + coordenada”,
     testada com dados sintéticos.

### Tarefa 2 — Hipsometria e declividade até o Parque Andreense

- **Janela do DEM**: `scripts/build_declividade.py` passou de lon −46,3423 a
  −46,2623 para **lon −46,50 a −46,2623**. A latitude continua de −23,8188 a
  −23,7388, faixa que já cobre o parque (−23,779 a −23,748). Tudo cabe no mesmo
  tile Copernicus GLO-30 S24/W047, e o Parque Andreense (lon −46,481 a −46,453)
  fica inteiro dentro da janela.
- **Hipsometria** em 8 faixas: < 200, 200–400, 400–600, 600–750, 750–800,
  800–850, 850–950 e > 950 m.
  - A escarpa varia de forma uniforme de 0 a 750 m e leva faixas de 200 m. O
    planalto concentra cerca de 80% da janela entre 700 e 850 m e leva faixas
    mais finas.
  - A paleta é sequencial de um só matiz (sépia, claro = baixo, escuro = alto),
    validada como rampa ordinal: luminosidade monotônica e contraste mínimo do
    tom mais claro.
  - É publicada como GeoJSON e como overlay raster (manifesto), com sub-legenda.
- **Preset `escala_serra` (1:100.000)**: inclui `hipsometria` e `declividade`. A
  declividade é desenhada por cima. No zoom do preset (≈12,4) as duas aparecem
  (`minZoom` 11 e 12).
- **Testes** (`tests/relevo.test.js`): cobertura do parque, classes e cores iguais à
  legenda e ao manifesto, rampa monotônica, ordem de desenho e zoom do preset.

### Tarefa 3 — Caminho do Sal

- KMZ copiado de `1_GIS_UNESCO_PARANAPIACABA/00_DADOS_BRUTOS/01_SHAPEFILES_ORIGINAIS/10_KMZ_KML/CAMINHO_SAL/`
  para a mesma estrutura dentro de `EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/`. O
  caminho está em `config.CAMINHO_SAL_KMZ`.
- `scripts/build_caminho_sal.py` converte **só o traçado**: uma `LineString` com 419
  vértices e cerca de 54 km, que passa por Santo André, São Bernardo do Campo e
  Mogi das Cruzes e atravessa a Vila e o PNM Nascentes.
  - Os 15 pontos de interesse do KMZ (capelas, parques, estações) **não** foram
    publicados.
  - Atributos: `nome`, `extensao_km`, `autoria = Mariana Lebens`, `fonte` (URL do
    mapa no Google My Maps).
- A camada fica na nova seção 6.2 “Caminhos Históricos”. A descrição registra a
  autoria e o link do mapa de referência.
- **KMZ da pasta que não foram publicados** (só listados aqui, como pedido):
  1. Biritiba Mirim - Sabaúna.kmz
  2. Circuito Rota da Madeira - Atrativos.kmz
  3. Estudos de Ampliação.kmz
  4. Paranapiacaba - Biritiba Mirim.kmz
  5. Passos do Padre Capra.kmz
  6. Ramal - Magic City.kmz
  7. Ramal Rio Pequeno e Passos do Padre Capra.kmz
  8. Rota da Luz - Completo.kmz
- **Testes** (`tests/caminhoSal.test.js`): seção, autoria e URL, só linhas, e
  nenhum dos outros roteiros publicado.

---

## (b) O que ficou pendente e por quê

1. **Nenhuma fala foi publicada, e a camada está pausada.** Todas as falas estão
   como `revisar`. A camada aparece como “em breve” e só será liberada quando a
   equipe definir o método de mapeamento e aprovar as falas.
2. **51 dos 58 lugares estão sem coordenada.** Não existe feição nomeada para eles
   nas camadas publicadas. Isso inclui praticamente todos os lugares do núcleo
   urbano: Parte Alta/Baixa, Rabique, ruas, patamares, Castelinho, Lyra, Mercado,
   campo de futebol, Caixa do Gustavo, Vacaria, Bela Vista, Pontinha, Rio Pardo e
   outros. Precisam de georreferenciamento manual ou com moradores.
3. **Falantes não identificados.** Nos dois vídeos compilados (“E agora? A Rede
   sumiu” e o vídeo do evento SEMASA, parte 1), a transcrição não traz o nome de
   quem fala. Ficaram como “não identificado(a)”, e é preciso conferir nos vídeos.
4. **Notas de campo são paráfrases.** As 38 falas das notas de campo da
   pesquisadora da equipe resumem o que foi dito; não são transcrição literal. A
   coluna `fonte` marca isso.
5. **Fontes sem falas de lugares.**
   - A parte 2 do evento SEMASA só tem falas institucionais e homenagens.
   - Das gravações de 13/04 à tarde (3 entrevistas nas casas dos moradores) não há
     notas nem transcrição.
   - As 17 entrevistas completas não foram transcritas: só os compilados.
6. **Tema `misticismo` sem nenhuma fala.** A única fala sobre o assunto não cita
   um lugar específico e ficou fora pelo critério de extração.
7. **Caminho do Sal não foi comparado com o mapa on-line.** O KMZ tem a estrutura
   de uma exportação do Google My Maps, mas não baixei a versão atual do mapa de
   Mariana Lebens para conferir se é a mesma.
8. **Tamanho da declividade.** Com a janela 3 vezes maior, `declividade.geojson`
   passou de 1,9 para 5,6 MB e é hoje o maior arquivo do site. Simplificar não
   reduz: os vértices são os degraus dos pixels de 30 m. A camada só é baixada
   quando ligada.

---

## (c) Números

| Item | Quantidade |
|---|---|
| Falas extraídas (linhas do CSV) | **68** |
| — notas de campo (paráfrases) | 38 |
| — vídeo “Qual sua memória de Paranapiacaba?” | 11 |
| — evento SEMASA, parte 1 | 11 |
| — vídeo “E agora? A Rede sumiu” | 8 |
| — evento SEMASA, parte 2 | 0 |
| Falas por tema: outro / ferrovia_trabalho / mata_ranchos / lazer_festas / perda_gentrificacao / misticismo | 26 / 15 / 10 / 10 / 7 / 0 |
| Lugares distintos no gazetteer | **58** |
| Lugares **com coordenada** | **7** (3 exatas, 4 aproximadas) |
| Lugares **pendentes** | **51** |
| Falas com ao menos um lugar georreferenciado (publicáveis se aprovadas) | 15 |
| Falas publicadas hoje | 0 |

Lugares com coordenada:

- **Exatas**: Poço das Moças, Estação da Luz e Cemitério (Bom Jesus de Paranapiacaba).
- **Aproximadas**:
  - Pedra Lisa: waypoint da cachoeira homônima.
  - Mirante: waypoint “Mirante de Paranapiacaba”.
  - Cachoeira Escondida: há dois waypoints homônimos.
  - Piaçaguera: ponto da estação.

---

## (d) Decisões que a equipe precisa tomar

1. **Definir o método de mapeamento antes de liberar a camada**, que está
   pausada. Definir também quem decide a liberação, que exige `available: true`,
   `--publicar` e a atualização do teste. Pontos em aberto:
   - um ponto por lugar ou áreas/linhas para patamares, caminhos e bairros;
   - escala;
   - se o mapa mostra falas ou só temas.
2. **Aprovar cada fala** (`publicavel = sim` ou `não`) no CSV e definir a base para
   isso: termo de autorização de uso de voz e imagem do projeto SEMASA, consulta
   aos entrevistados ou outro critério. A forma de identificar os falantes já
   está decidida: anonimizados (“Depoente NN”). Falta revisar a lista
   `nomes_anonimizar.csv`.
3. **As paráfrases das notas de campo podem ir ao mapa?** Se sim, com que rótulo,
   já que hoje aparecem como citação.
4. **Falas sensíveis**, para avaliação caso a caso:
   - LM005: conduta pessoal de familiar.
   - LM006: discriminação racial no passado e ato ilícito na infância.
   - LM014: contém endereço residencial com número.
   - LM034: morte de uma família em local de lazer.
   - LM001: terceiro nomeado, com conduta atribuída.
   - Nomes de terceiros usados como topônimo: LM033, LM035, LM036, LM037, LM050
     e LM053.
5. **Georreferenciar os 51 lugares pendentes.** Sugestão: oficina de mapeamento
   com moradores, sobre a ortofoto 2010. Confirmar também os 4 pontos aproximados,
   em especial se o “Mirante” das falas (o do sítio citado nas notas) é o waypoint
   adotado.
6. **Lugares fora da área de estudo** (Estação da Luz, Piaçaguera, Porto Seco,
   Eletrocloro): entram no mapa afetivo ou ficam só no acervo?
7. **Ampliar o critério de extração?** Incluir um ponto “Vila (geral)” para falas
   sobre perda, gentrificação e misticismo que não citam lugar específico.
8. **Caminho do Sal**:
   - Confirmar com Mariana Lebens a licença ou autorização de republicação (a
     autoria está registrada, mas a licença é desconhecida).
   - Decidir se os 15 pontos de interesse do KMZ devem virar camada.
   - Decidir se algum dos 8 outros roteiros listados deve ser publicado.
9. **Declividade em 1:100.000**: manter o vetor de 5,6 MB ou servir só o raster
   (PNG já gerado) na escala regional.
10. **Faixas da hipsometria e Prancha 5**: revisar as quebras propostas. O DEM é
    um modelo de superfície e inclui o dossel (cerca de +10 a 20 m na mata).
    Avaliar também se a “Prancha 5: Hipsometria & Escarpa” deve passar a usar a
    nova camada.
