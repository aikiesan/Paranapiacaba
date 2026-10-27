# Pacote QGIS — Paranapiacaba UNESCO (FAPESP / PUC-Campinas)

Pacote de trabalho para a produção dos mapas do **dossiê de candidatura de
Paranapiacaba (Santo André, SP) a Patrimônio Mundial da UNESCO**. Coordenação:
Profa. Maria Cristina Schicchi (PUC-Campinas). Entrega final do dossiê:
**fevereiro de 2027**.

Este pacote reúne, já organizados, os dados usados no WebGIS oficial do projeto
(<https://aikiesan.github.io/Paranapiacaba>), **em resolução completa**, e toda a
base complementar (shapefiles, planilhas, mapas históricos, rasters, mapas já
produzidos e documentação).

---

## 1. Como abrir

1. Abra `01_PROJETO_QGIS/Paranapiacaba_UNESCO.qgz` no QGIS (3.28 ou mais novo).
2. As camadas aparecem agrupadas pelos **eixos I–VII do Caderno de Mapas**, com a
   simbologia básica do WebGIS. Só as camadas de referência começam ligadas.
3. **Se o projeto não abrir ou faltar alguma camada**, abra o QGIS com um projeto
   vazio, vá em *Complementos › Console Python › Mostrar editor*, abra
   `01_PROJETO_QGIS/qgis_montar_projeto.py` e clique em *Executar*. Ele remonta o
   projeto a partir dos GeoPackages e salva `Paranapiacaba_UNESCO_reconstruido.qgz`.

Os estilos ficam gravados **dentro de cada GeoPackage** (estilo padrão). Mesmo
arrastando um `.gpkg` direto para um projeto novo, a camada já entra com a
simbologia.

> **Mantenha a estrutura de pastas.** O projeto usa caminhos relativos. Se a
> pasta `PACOTE_ARTHUR_QGIS` for movida inteira, tudo continua funcionando.

## 2. Estrutura

| Pasta | Conteúdo |
|---|---|
| `01_PROJETO_QGIS/` | Projeto `.qgz`, script de reconstrução e, em `referencia_projeto_equipe/`, os projetos antigos da equipe (`PROJETO FAPESP_R00–R02.qgz`, de set/2025 a abr/2026). Os caminhos desses projetos antigos apontam para o computador original, então use-os só como referência de layout e simbologia. |
| `02_DADOS_VETORIAIS/` | **Dados principais.** Um GeoPackage por eixo do dossiê (`I_contexto_regional.gpkg` … `VII_socioeconomia.gpkg`). Cada camada tem o mesmo nome (`id`) que no WebGIS. |
| `03_DADOS_COMPLEMENTARES/` | Toda a base que não está no WebGIS. `base_*.gpkg` contém os shapefiles de `01_CAMADAS_BASE`, por pasta temática. `siga_extra.gpkg` traz os SIGA Santo André extras. `gpkg_tematicos_equipe/` tem os GeoPackages que a equipe já tinha organizado. `kml_kmz/` guarda o Caminho do Sal, os ramais e as 46 trilhas Wikiloc. |
| `04_RASTERS/` | Ortofoto 2010 da Vila (UTM 23S), MapBiomas 2008–2024 e classes de declividade e hipsometria (GeoTIFF). |
| `05_MAPAS_HISTORICOS_E_REFERENCIAS/` | Mapas históricos, leis, edificações Palazzi e hidrografia completa SP. |
| `06_PLANILHAS/` | Inventários (agentes, classificação e diretrizes, cronograma), tabelas do Censo 2022 (Santo André e Rio Grande da Serra) e `MAPEAMENTO E SHAPEFILES_R01.xlsx`. |
| `07_MAPAS_PRODUZIDOS/` | Prévias de mapas já feitas (PDF/PNG). |
| `08_DOCUMENTACAO/` | **`DICIONARIO_DE_DADOS.xlsx`** (comece por aqui), planejamento (cronograma, plano de mapas), relatórios e atas. |

Os **originais brutos** (ZIPs do Drive, CAD, ArcGIS Pro, fotos de campo, PDFs) estão
na pasta irmã `PACOTE_ARTHUR_QGIS_ARQUIVO_ORIGINAIS/`. Ela serve só para consulta;
não é preciso abri-la para fazer os mapas.

## 3. Convenções

- **SRC único: SIRGAS 2000 / UTM 23S (EPSG:31983)** em todos os GeoPackages
  vetoriais e no projeto. Exceções: `gpkg_tematicos_equipe/` (cópia fiel, SRC
  original), MapBiomas e as classes de relevo (EPSG:4326).
- **Resolução.** A coluna `resolucao` do dicionário indica a origem de cada camada:
  - `completa`: reconstruída da fonte original, com a mesma limpeza do WebGIS mas
    sem generalização.
  - `web`: veio do GeoJSON publicado no WebGIS, que é um pouco generalizado. Isso
    vale para a rede elétrica (EPE), a hidrografia regional, nascentes e
    reservatórios regionais, APM/APRM, hipsometria, declividade e Caminho do Sal.
    Para mapas acima de 1:10.000 elas servem bem. Para mais detalhe, a fonte
    bruta está em `05_…/hidrografia_completa_sp` ou em `03_…/kml_kmz`.
- **Alinhamento da Vila.** As camadas da Vila (edificações Palazzi, CAD 2025,
  lotes PAC, sistema viário, caminhos, ferrovia local) já foram **deslocadas para
  casar com a ortofoto 2010**. Não reaplique correção sobre elas. As versões
  originais, sem correção, estão em `03_DADOS_COMPLEMENTARES/base_11_cadastro_vila_georef.gpkg`.
- **Escalas acordadas** (reunião de 25/09/2026): 1:1.000 (Vila, lote a lote),
  1:10.000 (Sítio), Serra do Mar → Parque Andreense e Corredor Jundiaí–Santos.
  No WebGIS as duas mais amplas ficaram em 1:100.000 e 1:500.000 por caber na
  tela. Para as pranchas impressas, confirme com a equipe se usam essas ou as
  propostas originais (1:50.000 / 1:250.000).

## 4. Como trabalhar e devolver

- **Não edite os GeoPackages de `02_` e `03_`.** Para criar ou corrigir camadas,
  salve em `09_TRABALHO_ARTHUR/` (crie a pasta), num GeoPackage seu, em EPSG:31983.
- Nomeie layouts e exportações com eixo, prancha e data, por exemplo
  `V_5-3_morfologia_vila_A1_2026-10-20.pdf`.
- Camadas novas que devam entrar no WebGIS devem ser enviadas ao Lucas com uma
  linha no dicionário (fonte, data e responsável). Ele as converte pelo pipeline
  do site.

## 5. Pendências que afetam os mapas

- **Lugares de Memória** (seção 5.4): camada **pausada**. A equipe ainda não
  definiu o método de mapeamento, e as falas exigem anonimização. Não está no
  pacote.
- **Mapa de proteção ambiental** (perímetro UNESCO, Parque Estadual Serra do Mar,
  Rebio Alto da Serra, PNM Nascentes, Cinturão Verde, RBMA): a Helo está limpando
  os limites. As UCs atuais estão em `II_meio_ambiente.gpkg › ucs / pnm_nascentes`.
- **Datas dos mapas históricos**: a Helo vai enviar. Ainda não há mapas históricos
  georreferenciados com data confirmada.
- **Atrativos A** (mapa de atrativos da Prefeitura de Santo André): dado ainda
  não recebido.
- **Caminho do Sal**: só a linha principal (~54 km, mapa de Mariana Lebens no
  Google My Maps). Os outros KMZ da pasta (ramais, Rota da Luz, Padre Capra) estão
  em `kml_kmz/` e ainda não foram tratados.
- **Fatos a confirmar com Helo/Cris** antes de entrarem em mapas: a data do Museu
  Funicular ABPF (1987), as altitudes dos patamares do funicular, o número de
  trilhas (45 ou 46) e o evento de 1860 dos "engenheiros britânicos".

## 6. Contatos

- **Lucas Nakamura**: WebGIS, pipeline de dados e este pacote.
- **Heloisa (PUC-Campinas)**: limites, mapas históricos e validação da Vila.
- **Profa. Maria Cristina Schicchi**: coordenação.
