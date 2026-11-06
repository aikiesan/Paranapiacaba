# Dados ambientais SIGA Santo André no WebGIS — inventário e deduplicação

**Data:** 05/11/2026 · **Branch:** `feat/siga-ambiental` (a partir de `main` d65a2c9, PR #15)
**Pipeline:** `scripts/build_siga_ambiental.py` · **Manifesto:** `00_DADOS_BRUTOS/SIGA/manifesto.csv`

Regra que guiou tudo: **cada UC, limite ou bacia aparece em uma única camada**, com uma única
fonte. Dentro de Santo André vale o SIGA (escala 1:40.000 ou melhor). O que se estende além do
município fica com a fonte de contorno completo (GeoSEADE, CBH-AT), e o SIGA só valida. Nenhuma
feição foi costurada a partir de duas fontes.

---

## 1. Resumo

| | |
|---|---|
| Arquivos recebidos | 36 zips (SHP) + 28 fichas PDF (ISO 19115 / Perfil MGB) + 4 documentos não-SIGA |
| Conjuntos SIGA | 37 (36 com zip; Limite de Loteamento só com ficha) |
| Publicados | 14 conjuntos → 11 camadas (8 atualizadas, 3 novas) |
| Regionais (só contorno, 1:500.000) | 2 (Chácara da Baronesa, Pedroso), dentro de `ucs` |
| Validação (não viram camada) | 4 |
| Substituídos | 2 |
| Descartados | 14 |
| Camadas retiradas do WebGIS | 2 (`subbacias`, `circuitos`) |
| Área de estudo | 214,7 km² (extensão de `hipsometria.geojson`); 92,4 km² dela em Santo André |

Todos os 36 `.prj` existem e declaram SIRGAS 2000 / UTM 23S (EPSG 31983), igual às fichas.
Atributos em ISO-8859-1 (arquivo `.cst` de cada zip).

## 2. Inventário — o que chegou e o que falta

- **`E0D00012.pdf`** é a digitalização do *Diário Oficial do Estado* de 15/06/1985 (v. 95, nº 110,
  p. 29) com a **Resolução SC 40, de 06/06/1985 — tombamento da Serra do Mar e de
  Paranapiacaba (CONDEPHAAT)**, do Acervo ISA. Não tem camada de texto (só imagem). Vieram junto,
  sobre o mesmo ato, `db122_RES. SC N 40…pdf` (transcrição com o perímetro), `13d00219.pdf`
  (caderno CONDEPHAAT com a tabela de áreas tombadas) e `Mapa-Plano-Serra-do-Mar…jpg`. Os quatro
  foram copiados para `00_DADOS_BRUTOS/TOMBAMENTO_SERRA_MAR/` (fora do git): são o insumo da camada
  pendente "Tombamento Serra do Mar" do mapa ambiental.
- **Falta o zip de `Limite de Loteamento`.** Só a ficha foi baixada (DDPU, 12/06/2024, 1:40.000).
- **Os 9 `SIGA_TUR_*` não têm ficha de metadados no SIGA.** A citação em `sources.js` diz isso.
- **Fora do git (> 50 MB):** `SIGA_AMB_ALTIMETRIA_NORTE_1M.zip` (121 MB; 5.743 curvas). Está no
  `.gitignore` e no manifesto (`versionado_git`). A ficha PDF dele é versionada.

## 3. Tabela de decisão final

IoU = interseção / união das áreas, medida em EPSG:31983 contra `public/data` na linha de base
(d65a2c9). "∩/SIGA" = fração da área SIGA contida na outra geometria.

### Usados (publicados)

| Conjunto SIGA | Camada | Evidência | Observação |
|---|---|---|---|
| SIGA_LIM_DISTRITO_SUBDISTRITO | `distritos` | IoU 0,990 | Atualização. 2 distritos tocam a área (Paranapiacaba, Sede). |
| SIGA_LIM_BAIRROS_OFICIAL | `bairros` | IoU 0,982 | Atualização. 23 bairros tocam a área (antes 112, município todo). |
| SIGA_LIM_PARQUE_ANDREENSE | `parque_andreense` | IoU 0,995 | Atualização. |
| SIGA_LIM_BILLINGS_2026 | `billings_747` | IoU 0,840; ∩/SIGA 0,991 | Nova cota 747 por LIDAR 2024 (1:1.000): 8,33 → 7,11 km². |
| SIGA_AMB_UC_MUN_NASC_PARANAP | `pnm_nascentes` | IoU 1,000 | O polígono GeoSEADE *estimado* da mesma UC (IoU 0,973) **saiu de `ucs`**. |
| SIGA_AMB_UC_EST_ALTO_PARANAP | `ucs` (Rebio) | IoU 0,989 | Não existe na base GeoSEADE. |
| SIGA_AMB_CLASSIF_VEGETAL | `classif_vegetal` | IoU 0,430 | O recorte passou do buffer da Serra para a área de estudo: 39 → 88 km². |
| SIGA_AMB_APP_LICENC_SUL | `app_sul` | IoU 0,464 | Idem: 11 → 23 km². |
| SIGA_AMB_SUB_BACIAS | `subbacias_sa` (nova) | ver §4 | 204 sub-bacias com bacia/macro/UGRHI como atributos. |
| SIGA_SEM_AREA_CONTAMINADA | `areas_contaminadas` (nova) | 3 lotes na área | **Publicada como ponto.** O SIGA marca o lote cadastral inteiro, e um deles tem 7,6 km². |
| SIGA_TUR_CIRC_PARANAPIACABA | `atrativos_prefeitura` (nova) | 19/19 coincidem com `circuitos` | Substitui `circuitos` (mesmos dados, agora com nome e endereço). |
| SIGA_TUR_CIRC_PARQUE_LAZER, _PEDAGOG_CIENTIF, _INDUSTRIA_INOVAC | `atrativos_prefeitura` | 1, 2 e 1 pontos na área | 23 pontos brutos → 19 lugares. O PNM e o Centro de Visitantes aparecem em 3 e 2 circuitos e viram um ponto cada. |

### Regionais (só contorno, escala 1:500.000)

| Conjunto SIGA | Camada | Evidência |
|---|---|---|
| SIGA_AMB_UC_EST_BARONESA | `ucs` | 0 % na área de estudo; ausente da base GeoSEADE |
| SIGA_AMB_UC_MUN_PEDROSO_LIM | `ucs` | 0,1 % na área; 7 polígonos dissolvidos num contorno |

### Validação (não viram camada)

| Conjunto SIGA | Valida | Evidência |
|---|---|---|
| SIGA_LIM_MUNICIPAL_2026 | máscara "dentro de Santo André"; `distritos`; `municipios_corredor` | IoU 0,989 com a união de `distritos` e 0,923 com o IBGE. Publicá-lo seria uma 3ª linha para a mesma entidade. |
| SIGA_AMB_UC_EST_SERRA_MAR | PESM em `ucs` (GeoSEADE, contorno completo) | Só 68,6 % do recorte SIGA cai dentro do PESM GeoSEADE (ver §6). |
| SIGA_AMB_UGRHIS | `regioes_hidrograficas` | Dissolve exato das Sub-bacias (IoU 1,000). Alto Tietê IoU 0,884 ∩ SA; Baixada Santista 0,179 (ver §6). |
| SIGA_AMB_MACRO_BACIAS | `subbacias_ugrhi6` | Dissolve exato das Sub-bacias (IoU 1,000). Bacia Billings vs CBH-AT ∩ SA: IoU 0,526. |

### Substituídos

| Conjunto SIGA | Substituído por | Evidência |
|---|---|---|
| SIGA_LIM_MUNICIPAL (EMPLASA 2019) | SIGA_LIM_MUNICIPAL_2026 (IGC-SP 2021) | IoU 0,996 |
| SIGA_LIM_BAIRROS_2009 | SIGA_LIM_BAIRROS_OFICIAL | Ficha: "Status: Obsoleto"; IoU 0,982 |

### Descartados (ficam só no bruto)

| Conjunto SIGA | Motivo |
|---|---|
| SIGA_AMB_BACIAS | Redundante: dissolve exato das Sub-bacias (IoU 1,000). A informação está no atributo `bacia`. |
| SIGA_AMB_UC_MUN_PEDROSO_AMORT | Zoneamento do Pedroso, fora do escopo. Atenção: 15,9 % (13,5 km²) dele cai na área de estudo. |
| SIGA_AMB_UC_MUN_PED_ZON_INTER, _PEDROSO_BACIA, _PED_LEVANT_PRE, _PED_FOTOS_CAMPO | Zoneamento, bacias internas, pedologia e fotos do Pedroso (0,1 % na área) |
| SIGA_AMB_APP_LICENC_NORTE | Porção norte (14,5 % na área) |
| SIGA_AMB_ALTIMETRIA_NORTE_1M | Porção norte; arquivo de 121 MB |
| SIGA_LIM_MARCO_ZERO | Fora da área (centro de Santo André) |
| SIGA_TUR_HIST_CULTURAL, _CITY_TOUR_HISTORICO, _ARTE_ARQUITETURA, _CIRC_HOTEL, _COMPRA | 0 pontos na área de estudo. Todos ficam no centro de Santo André. |

**Pendente:** SIGA_LIM_LOTEAMENTO (falta o zip).

## 4. Bacias — um nível por escala, uma fonte por nível

| Escala | Nível | Camada | Fonte |
|---|---|---|---|
| 1:500.000 | UGRHI | `regioes_hidrograficas` | GeoSEADE `MA_reghidro`, contorno completo |
| 1:100.000 | Macro-bacia | `subbacias_ugrhi6` | CBH-AT (Billings-Tamanduateí, Cabeceiras) |
| 1:10.000 | Bacia / Sub-bacia | `subbacias_sa` **(nova)** | SIGA, 204 polígonos, cartas 1:10.000 |

- Os quatro níveis do SIGA (UGRHI, Macro, Bacias, Sub-bacias) são o **mesmo conjunto
  dissolvido**: o IoU entre cada nível e o dissolve das Sub-bacias é 1,000 nos 11 grupos, e a
  hierarquia de atributos é consistente. Por isso vai ao ar uma camada só, e os níveis
  superiores viram atributos.
- **`subbacias` (GeoSEADE) foi retirada.** Não é um nível próprio: é outro desenho do divisor
  UGRHI 6/7 (IoU 0,888 com `regioes_hidrograficas` nas duas vertentes) e se sobrepunha a
  `subbacias_ugrhi6` em 42 km² (IoU 0,617).
- Os presets de escala seguem a tabela: o de 1:500.000 deixou de ligar `subbacias_ugrhi6`, o de
  1:100.000 trocou `subbacias` por `subbacias_ugrhi6` e o de 1:10.000 ganhou `subbacias_sa`.
  `tests/sigaAmbiental.test.js` impede que um preset de escala volte a ligar dois níveis.
- 87 das 248 sub-bacias SIGA tocam o limite municipal, ou seja, estão truncadas nele (o SIGA
  só cobre Santo André).

## 5. Camadas retiradas e alteradas

| Camada | O que aconteceu | Por quê |
|---|---|---|
| `subbacias` | **retirada** (arquivo e catálogo) | Redundante com `regioes_hidrograficas` e `subbacias_ugrhi6` (§4) |
| `circuitos` | **retirada**, substituída por `atrativos_prefeitura` | Os 22 pontos SIGA_TUR de `circuitos` (com o mesmo lugar repetido em vários circuitos), mais 1 ponto de Indústria e Inovação, viram 19 lugares, com nome, endereço e lista de circuitos (antes só havia a categoria) |
| `ucs` | 26 → 27 feições, **agora com nome, categoria, esfera, ato e fonte** (antes sem nenhum atributo) | Saiu o PNM Nascentes GeoSEADE (duplicado); Rebio atualizada; entraram Baronesa e Pedroso |
| `regioes_hidrograficas` | só texto: 9 valores corrigidos | Nomes gravados como UTF-8 lido em Latin-1 (`ALTO TIETÃ\x8a` → `ALTO TIETÊ`); geometria intacta |

Diff das camadas regravadas (feições · km² · bbox WGS84):

| Camada | Antes | Depois |
|---|---|---|
| `distritos` | 4 · 185,99 · −46,567 −23,816 −46,279 −23,606 | 2 · 163,43 · −46,567 −23,816 −46,279 −23,606 |
| `bairros` | 112 · 166,12 · −46,567 −23,816 −46,279 −23,606 | 23 · 98,77 · −46,528 −23,816 −46,279 −23,711 |
| `parque_andreense` | 1 · 4,117 | 1 · 4,121 |
| `billings_747` | 2 · 8,328 | 2 · 7,112 |
| `pnm_nascentes` | 1 · 4,572 | 1 · 4,573 |
| `ucs` | 26 · 1.330,8 | 27 · 1.335,3 |
| `classif_vegetal` | 135 · 39,02 · −46,363 −23,802 −46,279 −23,727 | 390 · 88,17 · −46,496 −23,816 −46,279 −23,739 |
| `app_sul` | 20 · 11,32 · −46,363 −23,802 −46,279 −23,727 | 33 · 23,31 · −46,481 −23,814 −46,279 −23,739 |
| `subbacias_sa` (nova) | — | 204 · 84,43 |
| `areas_contaminadas` (nova) | — | 3 pontos |
| `atrativos_prefeitura` (nova) | — | 19 pontos |

Catálogo: a seção 2.3 virou **"Áreas Protegidas"** (`ucs`, `pnm_nascentes`, `parque_andreense`,
`apm_aprm_regionais`, cada UC uma vez). Entraram **2.4 "Vegetação e APPs"**, **2.5 "Riscos e
Passivos Ambientais"** (com `areas_contaminadas`) e **6.2 "Atrativos (Prefeitura)"**; Caminhos
Históricos passou para 6.3. Os códigos de seção só aparecem na interface: os links
compartilhados usam os ids de camada.

## 6. Discrepâncias entre fontes (registradas, não corrigidas)

1. **PESM — GeoSEADE × SIGA.** 0,60 km² do PESM-SIGA (Decreto 10.251/1977) ficam fora do PESM
   GeoSEADE, que se declara "polígono é uma estimativa dos limites da UC". Pela regra 2, a
   camada mantém o contorno GeoSEADE.
2. **PESM (GeoSEADE) × PNM Nascentes (SIGA): 16,25 ha de sobreposição.** No SIGA as duas UCs não
   se sobrepõem (0 m²). Cortar o PESM pelo PNM seria costurar fontes, e a regra proíbe. A solução
   é obter o limite oficial completo do PESM (Fundação Florestal / DataGEO).
3. **Divisor de águas Alto Tietê / Baixada Santista.** Dentro de Santo André, só 20 % da UGRHI 7
   do SIGA cai na "Baixada Santista" do GeoSEADE (IoU 0,179): cerca de 9,5 km² mudam de vertente
   conforme a fonte, justamente em volta da Vila. O SIGA foi traçado sobre cartas 1:10.000; o
   GeoSEADE é regional. Nas escalas de detalhe vale `subbacias_sa`.
4. **Topologia das coberturas SIGA.** Sub-bacias, Classificação Vegetal e Bairros tinham vértices
   não coincidentes nas divisas e pequenas sobreposições (133 m² e 3 m²). A topologia foi refeita
   (poligonização das bordas, uma face por dono) antes do `coverage_simplify`. O resíduo final
   nas Sub-bacias é de 0,022 % do comprimento das bordas.

## 7. Verificação

- `npm test`: **143/143** (16 arquivos), incluindo 9 testes novos em `tests/sigaAmbiental.test.js`:
  PNM só na camada própria, UCs nomeadas e sem repetição, um nível de bacia por preset de escala,
  atrativos sem pontos repetidos, camadas retiradas fora do catálogo e do disco, nomes das UGRHIs
  corrigidos.
- `npm run build`: OK. O aviso de chunk > 500 kB já existia antes desta mudança.
- **Inspeção visual no app (dev server), nas 4 escalas:**
  - **1:500.000:** só UGRHIs, municípios, ferrovia e estações. Com `ucs` ligada, cada UC aparece
    uma vez.
  - **1:100.000:** PESM, Rebio, PNM, Parque Andreense, Billings 2026 e macro-bacias CBH-AT, sem
    contornos duplicados.
  - **1:10.000:** sub-bacias SIGA e os 19 atrativos sem marcadores empilhados. Com `ucs` +
    `pnm_nascentes` ligadas, o PNM tem um único contorno: no DOM há um só path da UC, e nenhum
    anel de `ucs` acompanha o contorno.
  - **1:1.000:** os atrativos caem sobre os edifícios (Igreja Bom Jesus, cemitério, Largo dos
    Padeiros). O popup mostra nome, endereço, circuitos e a citação SIGA.
  - A única sobreposição visível entre polígonos de UCs é a do item 2 do §6.

## 8. Fora do escopo — recomendações

- `reservatorios` e `reservatorios_rmsp_completos` desenham a mesma Billings da mesma fonte
  (CBH-AT). O mesmo vale para `grande_abc` × `municipios_corredor`, que repetem os municípios do
  ABC. A regra 1 pede uma camada só em cada caso.
- `atrativos_prefeitura` tem um ponto "Parque Natural Municipal Nascentes de Paranapiacaba"
  (ponto de visita) além do polígono da UC. Não é geometria duplicada, mas pode virar
  referência à UC.
- Mapa ambiental da Helo: Tombamento Serra do Mar (Res. SC 40/1985; documentos em
  `00_DADOS_BRUTOS/TOMBAMENTO_SERRA_MAR/`), Cinturão Verde, Reserva da Biosfera da Mata
  Atlântica e perímetro UNESCO continuam sem fonte vetorial.
- As 17 entrevistas brutas da SEMASA seguem pendentes; Lugares de Memória continua com os vídeos
  públicos.

## 9. Adendo (06/11/2026): pacote de perímetros da Heloisa

A Heloisa enviou em 30/10/2026 o pacote `meio_tomb` (projeto QGIS + `packaged_data.gpkg`,
365 MB). O pacote foi copiado sem alteração para `00_DADOS_BRUTOS/EQUIPE/HELO_MEIO_TOMB_20261030/`,
fora do git. Cada camada do pacote tem uma linha no manifesto (`tema = EQUIPE`). Aplicou-se a
mesma regra: só entra o que ainda não existe no atlas.

| Camada do pacote | Decisão | Evidência |
|---|---|---|
| CINTURAO_VERDE_SP | **publicada**: `cinturao_verde` (nova) | Reserva da Biosfera do Cinturão Verde; contorno inteiro (23.329 km²) |
| biosfere_reserves (Mata Atlântica) | **publicada**: `rbma` (nova) | Só a RBMA, recortada numa janela 1° maior que o corredor |
| AREAS_ZEIP | **publicada**: `zeip_areas_uso` (nova) | APR, APC, ASD e AAN da Lei 9.018/2007 (Mapa 5). Falta a ATP. Sobreposição de 109 m² entre as áreas corrigida na limpeza de topologia. |
| TOMBAMENTO_IPHAN / _CONDEPHAAT / _CONDEPHAAPASA | validação | Já publicados a partir do SIGA em `patrimonio_tombados`: IoU 0,890 / 0,972 / 0,933 |
| RESERVA_BIOLOGICA | validação | IoU 0,850 com a Rebio SIGA (3,94 contra 3,41 km²) |
| SIGA_AMB_UC_MUN_NASC_PARANAP, SIGA_PLA_LEGIS_ZEIP, ABPF | validação | IoU 1,000 / 0,999 / 0,986 com as camadas publicadas |
| VESP25 / VPAR25 (CEM) | pendente | Fora da lista de encargos; finalidade a confirmar com a Helo |
| LimiteAgenciasCETESB, BR_Municipios_2024, BaseFerro | descartadas | Sem uso, ou já publicadas |

Os perímetros de tombamento e a Rebio do pacote foram digitalizados sobre o mapa *Plano de Ação
das Cidades Históricas — Vila de Paranapiacaba e Região* (Prefeitura de Santo André, 1:15.000,
SAD 69). O próprio mapa avisa que é "apenas uma referência". Por isso a versão SIGA prevalece.

**Achado ao validar os tombamentos: `patrimonio_tombados` estava triplicada.** O job de
`scripts/config.py` somava `TOMBADOS_FEDERAL`, `_ESTADUAL` e `_MUNICIPAL`, mas os três arquivos
(e também `TOMBADOS_GERAL` e `SIGA_CUL_BENS_TOMBADOS_CULT`) trazem os mesmos 113 registros. Cada
polígono saía três vezes: 339 feições para 108 geometrias. Agora o job lê um arquivo só, e a nova
opção `merge_same_geometry` junta os 5 bens com dois registros (tombados por dois órgãos) numa
feição com os dois órgãos e processos. Resultado: 108 feições, com a mesma área (12,2386 km²) e
o mesmo bbox. Para rodar com a base do workspace, use `CAMADAS_BASE=…/1_GIS_UNESCO_PARANAPIACABA/01_CAMADAS_BASE`.

**Continuam pendentes do mapa ambiental:**
- o perímetro UNESCO;
- o tombamento da Serra do Mar em contorno completo. Hoje só existe o trecho de Santo André
  (1,3 km²), em `patrimonio_tombados`.

**Outra redundância encontrada (não corrigida):** `limite_vila` e `zeip_subdivisoes` leem o
mesmo arquivo (`limite_vila.geojson`), ou seja, os 4 setores da ZEIP aparecem como duas camadas.

## 10. Como refazer

```bash
python scripts/build_siga_ambiental.py --ingest "C:/Users/Lucas/Documents/PROJETO_FAPESP_PUCCAMP"  # só na 1ª vez
python scripts/build_siga_ambiental.py --dry-run          # mostra o diff, não grava
python scripts/build_siga_ambiental.py --write-existing   # regrava as camadas e o manifesto
```

Requer geopandas ≥ 0.14, shapely ≥ 2.1 (GEOS ≥ 3.12, para `coverage_simplify`) e pymupdf, além
da pasta `01_CAMADAS_BASE` (UCs GeoSEADE), achada automaticamente ou via `--base` /
`CAMADAS_BASE`. Sem `--write-existing`, camadas que já existiam na linha de base vão para
`scripts/.cache/siga_preview/` e não são sobrescritas. As camadas que esse pipeline gera saíram
de `scripts/config.py`, para que `build_data.py` não recrie as versões antigas.
