// Procedência dos dados do atlas.
//
// Toda camada do mapa (layers.js), todo raster e toda carta de referência cita
// de onde veio, com link para a página consultada: a página do próprio
// conjunto de dados quando o portal tem uma, senão a página geral do portal.
// O arquivo de origem (shapefile/GeoTIFF) aparece em `dataset`, para que a
// equipe possa refazer o caminho até scripts/config.py.
//
// Fontes internas da equipe (levantamentos de campo, cadastros cedidos) não
// têm endereço público: ficam com `url: null` e uma nota dizendo o que são.

export const SOURCES = {
  // ---- Prefeituras e órgãos municipais -------------------------------------
  siga: {
    short: 'SIGA Santo André',
    name: 'SIGA — Sistema de Informações Geográficas de Santo André',
    org: 'Prefeitura de Santo André',
    url: 'https://siga.santoandre.sp.gov.br/Catalogo',
    note: 'O catálogo não tem endereço por camada: busque pelo título da camada e use "Abrir metadados".',
  },
  santos_pd: {
    short: 'Prefeitura de Santos',
    name: 'Plano Diretor de Santos — Lei Complementar 1.181/2022',
    org: 'Prefeitura Municipal de Santos',
    url: 'https://www.santos.sp.gov.br/static/files_www/files/portal_files/SEDURB/COPOLUR/plano_diretor_lc1181_2022.pdf',
  },
  santos_luos: {
    short: 'Prefeitura de Santos',
    name: 'Santos — Lei Complementar 1.314/2025 (uso e ocupação do solo da Área Continental)',
    org: 'Prefeitura Municipal de Santos',
    url: 'https://egov.santos.sp.gov.br/legis/documents/11975/view',
    note: 'Seu Anexo IX altera o Anexo I (perímetro) da LC 1.181/2022.',
  },
  santo_andre_luops: {
    short: 'Prefeitura de Santo André',
    name: 'Santo André — Lei 9.924/2016 (uso, ocupação e parcelamento do solo)',
    org: 'Prefeitura de Santo André',
    url: 'https://portais.santoandre.sp.gov.br/semasa/wp-content/uploads/sites/13/2024/08/Lei-Ordinaria-9924-L9924-16.pdf',
    note: 'Origem provável: Anexo 1.1, Mapa 1 — Zoneamento.',
  },
  cubatao_pd: {
    short: 'Prefeitura de Cubatão',
    name: 'Cubatão — Minuta de revisão do Plano Diretor e da LPUOS (nov. 2022)',
    org: 'Prefeitura Municipal de Cubatão',
    url: 'https://cubatao.sp.gov.br/minuta-de-revisao-do-plano-diretor-e-da-lei-de-parcelamento-uso-e-ocupacao-do-solo-do-municipio-de-cubatao/',
    note: 'Mapa da minuta, não da lei aprovada (LC 135/2023, alterada pela LC 139/2024).',
  },
  mogi_pd: {
    short: 'Prefeitura de Mogi das Cruzes',
    name: 'Mogi das Cruzes — Lei Complementar 150/2019 (Plano Diretor)',
    org: 'Prefeitura de Mogi das Cruzes',
    url: 'https://www.mogidascruzes.sp.gov.br/public/site/doc/202001161856435e20ce0b36edc.pdf',
    note: 'O PDF oficial traz só o texto; os mapas foram obtidos como anexos da lei publicada.',
  },
  ribeirao_pd: {
    short: 'Leis Municipais',
    name: 'Ribeirão Pires — Lei 5.907/2014 (revisão do Plano Diretor)',
    org: 'Prefeitura da Estância Turística de Ribeirão Pires',
    url: 'https://leismunicipais.com.br/a/sp/r/ribeirao-pires/lei-ordinaria/2014/591/5907/lei-ordinaria-n-5907-2014-efetua-a-revisao-da-lei-n-4791-de-14-de-setembro-de-2004-plano-diretor-do-municipio-da-est-ncia-turistica-de-ribeirao-pires-nos-termos-do-artigo-40-da-lei-federal-n-10257-de-10-de-julho-de-2001-e-da-outras-providencias',
    note: 'Texto oficial não localizado nos portais da Prefeitura e da Câmara; link para o compilador Leis Municipais.',
  },
  rgs_pd: {
    short: 'Prefeitura de Rio Grande da Serra',
    name: 'Rio Grande da Serra — Lei 2.321/2019 (atualização do Plano Diretor)',
    org: 'Prefeitura de Rio Grande da Serra',
    url: 'https://www.riograndedaserra.sp.gov.br/wp-content/uploads/leis/LEI-2321.pdf',
    note: 'Desenhos anexos elaborados pelo IPT (Relatório Técnico 156 891-205).',
  },
  suzano_pd: {
    short: 'Prefeitura de Suzano',
    name: 'Suzano — Lei Complementar 312/2017 (Plano Diretor)',
    org: 'Prefeitura de Suzano',
    url: 'https://www.suzano.sp.gov.br/wp-content/uploads/2017/12/312-17-Plano-Diretor.pdf',
  },

  // ---- Governo federal ------------------------------------------------------
  ibge_malhas: {
    short: 'IBGE',
    name: 'IBGE — Malhas Territoriais (malha municipal)',
    org: 'Instituto Brasileiro de Geografia e Estatística',
    url: 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html',
  },
  ibge_censo2000: {
    short: 'IBGE',
    name: 'IBGE — Censo 2000, malha de setores urbanos de Santo André (3547809)',
    org: 'Instituto Brasileiro de Geografia e Estatística',
    url: 'https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2000/setor_urbano/sp/3547809/',
    note: 'O arquivo 35SANDRE é derivado: geometria do IBGE unida aos agregados por setor do Censo 2000.',
  },
  mt_bit: {
    short: 'Ministério dos Transportes',
    name: 'BIT — Banco de Informações de Transportes (mapas e dados georreferenciados)',
    org: 'Ministério dos Transportes / ANTT',
    url: 'https://www.gov.br/transportes/pt-br/assuntos/dados-de-transportes/bit/bit-mapas',
    note: 'O portal publica os mapas no visualizador do BIT, sem link direto para o shapefile.',
  },
  epe: {
    short: 'EPE',
    name: 'WebMap EPE — Sistema Interligado Nacional (instalações existentes)',
    org: 'Empresa de Pesquisa Energética',
    url: 'https://gisepeprd2.epe.gov.br/WebMapEPE/',
    note: 'Grupo "Sistema Elétrico Existente"; o download é feito pela ferramenta Download do próprio WebMap.',
  },

  // ---- Governo estadual e academia -----------------------------------------
  geoseade: {
    short: 'GeoSEADE',
    name: 'GeoSEADE — Infraestrutura e meio ambiente (bases cartográficas)',
    org: 'Fundação SEADE',
    url: 'https://repositorio.seade.gov.br/dataset/infraestrutura-e-meio-ambiente',
    note: 'Origem provável: os arquivos MA_* seguem uma nomenclatura antiga do GeoSEADE; os campos coincidem com as bases atuais.',
  },
  cbhat: {
    short: 'CBH-AT',
    name: 'Shapefiles do Plano da Bacia Hidrográfica do Alto Tietê (PBH-AT 2018, escala 1:50.000)',
    org: 'Comitê da Bacia Hidrográfica do Alto Tietê / FABHAT',
    url: 'https://comiteat.sp.gov.br/a-bacia/shapefiles/',
  },
  cem: {
    short: 'CEM/USP',
    name: 'Centro de Estudos da Metrópole — download de dados cartográficos',
    org: 'Centro de Estudos da Metrópole (FFLCH-USP)',
    url: 'https://centrodametropole.fflch.usp.br/pt-br/download-de-dados',
  },
  apesp: {
    short: 'Arquivo Público SP',
    name: 'Arquivo Público do Estado de São Paulo — acervo cartográfico (fundo IGC/IGG)',
    org: 'Arquivo Público do Estado de São Paulo',
    url: 'https://www.arquivoestado.sp.gov.br/apesp',
    note: 'O catálogo on-line não tem página por carta; o código BR_APESP_IGC_IGG_CAR_* identifica o item no acervo.',
  },

  // ---- Bases abertas e internacionais --------------------------------------
  osm: {
    short: 'OpenStreetMap',
    name: 'OpenStreetMap — colaboradores (licença ODbL)',
    org: 'OpenStreetMap Foundation',
    url: 'https://www.openstreetmap.org/copyright',
    // Igual à do mapa de fundo OSM, para o Leaflet não repetir o crédito.
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  wikiloc: {
    short: 'Wikiloc',
    name: 'Wikiloc — trilhas registradas por GPS (Paranapiacaba)',
    org: 'Wikiloc',
    url: 'https://pt.wikiloc.com/wikiloc/map.do?sw=-23.783106383131603%2C-46.30829572677612&ne=-23.7756250588516%2C-46.29456281661988&page=1',
  },
  mapbiomas: {
    short: 'MapBiomas',
    name: 'MapBiomas — Coleção 10 dos mapas anuais de cobertura e uso da terra do Brasil (1985–2024)',
    org: 'Projeto MapBiomas (licença CC BY 4.0)',
    url: 'https://brasil.mapbiomas.org/',
  },
  copernicus: {
    short: 'Copernicus DEM',
    name: 'Copernicus DEM GLO-30 (modelo digital de superfície, 30 m)',
    org: 'ESA / Airbus — Programa Copernicus',
    url: 'https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM',
    note: '© DLR e.V. 2010-2014 and © Airbus Defence and Space GmbH 2014-2018 provided under COPERNICUS by the European Union and ESA; all rights reserved. Baixado do Registry of Open Data on AWS.',
  },
  mymaps_lebens: {
    short: 'Google My Maps (M. Lebens)',
    name: 'Caminho do Sal — mapa colaborativo de Mariana Lebens no Google My Maps',
    org: 'Mariana Lebens (autora do mapa)',
    url: 'https://www.google.com/maps/d/viewer?mid=12bBvGeW5hecNAqtQlvLA1lK1dseMIbA',
  },

  // ---- Memória e patrimônio imaterial --------------------------------------
  trilhas_trilhos: {
    short: 'Trilhas e Trilhos da Memória',
    name: 'Projeto Trilhas e Trilhos da Memória — gravações com moradores de Paranapiacaba',
    org: 'SEMASA / Subprefeitura de Paranapiacaba e Parque Andreense, com apoio da PUC-Campinas',
    url: 'https://www.dgabc.com.br/Noticia/4315346/projeto-audiovisual-de-santo-andre-resgata-elo-entre-memoria-ferroviaria-e-natureza-de-paranapiacaba',
    note: 'Os compilados em vídeo e as notas de campo foram transcritos pela equipe; as 17 entrevistas completas ainda não.',
  },
  youtube_memoria: {
    short: 'Vídeos no YouTube',
    name: 'Vídeos de memória da Vila publicados no YouTube',
    org: 'Canais de cada vídeo, citados um a um',
    url: null,
    note: 'Cada fala leva o link do vídeo de onde foi transcrita; a minutagem ainda não foi conferida.',
  },

  // ---- Acervo da equipe (sem endereço público) -----------------------------
  equipe: {
    short: 'Equipe FAPESP/PUC-Campinas',
    name: 'Equipe de pesquisa FAPESP / PUC-Campinas',
    org: 'Projeto FAPESP — PUC-Campinas',
    url: null,
    note: 'Produzido pela equipe do projeto; não publicado em outro portal.',
  },
  palazzi: {
    short: 'Mapas Palazzi',
    name: 'Mapas de levantamento de campo da Vila (Palazzi), georreferenciados pela equipe',
    org: 'Levantamento cedido ao projeto',
    url: null,
    note: 'Mapas temáticos de uso e conservação cedidos ao projeto e georreferenciados pela equipe sobre a Ortofoto 2010.',
  },
  cad_vila: {
    short: 'Cadastro CAD da Vila',
    name: 'Levantamento CAD "Mapa Vila 2025 UNESCO" (DWG), georreferenciado pela equipe',
    org: 'Cadastro técnico cedido ao projeto',
    url: null,
    note: 'Linhas do DWG oficial convertidas para SIRGAS 2000 / UTM 23S e calibradas à Ortofoto 2010.',
  },
  ortofoto: {
    short: 'Ortofoto 2010',
    name: 'Ortofoto de Paranapiacaba, 2010 (SIRGAS 2000 / UTM 23S)',
    org: 'Procedência a confirmar',
    url: null,
    note: 'GeoTIFF recebido pela equipe. Data e resolução coincidem com as ortofotos Emplasa de 2010 (1 m), mas o produtor não foi confirmado.',
  },
};

// Cada camada: lista de { source, dataset, url?, note? }. `url` sobrepõe a do
// portal quando existe página direta do conjunto ou do documento consultado.
const siga = (dataset, extra = {}) => ({ source: 'siga', dataset, ...extra });
const youtube = (id, dataset) => ({ source: 'youtube_memoria', dataset, url: `https://www.youtube.com/watch?v=${id}` });
const CBHAT_FILES ='https://comiteat.sp.gov.br/wp-content/uploads/2021/06/';
// O servidor do CBH-AT grava os nomes acentuados em Unicode decomposto (NFD).
const cbhat = (file, dataset) => ({
  source: 'cbhat', dataset, url: encodeURI(`${CBHAT_FILES}${file}.rar`.normalize('NFD')),
});

export const LAYER_SOURCES = {
  // Sistema Ferroviário SPR
  ferrovia_corredor: [{
    source: 'mt_bit',
    dataset: 'BaseFerro — malha ferroviária nacional',
    note: 'A planilha de mapeamento da equipe atribui a BaseFerro ao Ministério dos Transportes; o pipeline a marca como "IBGE/BaseFerro". Procedência a confirmar.',
  }],
  estacoes: [{ source: 'mt_bit', dataset: 'Estacao — estações ferroviárias (ANTT)' }],
  ferrovia_local: [{ source: 'cad_vila', dataset: 'paranapiacaba_trilhos_ferrovia_georef' }],
  funicular: [
    { source: 'equipe', dataset: 'Funicular — leito digitalizado pela equipe' },
    { source: 'osm', dataset: 'Base OpenStreetMap usada como referência de digitalização' },
  ],
  patrimonio_ferroviario: [{ source: 'palazzi', dataset: 'Ruinas' }],
  abpf: [{ source: 'equipe', dataset: 'ABPF — área delimitada pela equipe', note: 'Delimitação a validar com a ABPF.' }],

  // Mobilidade
  ferrovia_rmsp: [{ source: 'cem', dataset: 'FER_L_RMSP_2021_CEM — ferrovias da RMSP, 2021' }],
  rodovias: [{ source: 'cem', dataset: 'RODO_RMSP_2021_CEM — rodovias da RMSP, 2021' }],
  ciclovias: [siga('SIGA_MUR_SIS_CICLOVIARIO')],
  mobilidade_urbana: [siga('SIGA_MUR_BUS_* — linhas de ônibus municipais e intermunicipais (EMTU-SP/SATRANS)')],

  // Limites
  limite_vila: [siga('SIGA_PLA_LEGIS_ZEIP_PARANAP — Zona Especial de Interesse do Patrimônio de Paranapiacaba')],
  zeip_subdivisoes: [siga('SIGA_PLA_LEGIS_ZEIP_PARANAP — Zona Especial de Interesse do Patrimônio de Paranapiacaba')],
  municipios_corredor: [{
    source: 'ibge_malhas',
    dataset: 'BR_Municipios_2024 — Malha Municipal 2024',
    url: 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html?edicao=43129',
  }],
  grande_abc: [{ source: 'equipe', dataset: 'GRANDE_ABC', note: 'Procedência a confirmar; contornos compatíveis com a malha municipal do IBGE.' }],
  bairros: [siga('SIGA_LIM_BAIRROS_OFICIAL — bairros oficiais (Leis 10.136/2018 e 10.312/2020)')],
  parque_andreense: [siga('SIGA_LIM_PARQUE_ANDREENSE — limite legal (Lei 8.343/2002)')],
  distritos: [siga('SIGA_LIM_DISTRITO_SUBDISTRITO')],

  // Patrimônio
  patrimonio_tombados: [siga('SIGA_CUL_BENS_TOMBADOS_CULT — bens tombados (IPHAN, CONDEPHAAT, COMDEPHAAPASA)')],
  bens_registrados: [siga('SIGA_CUL_BENS_REGISTRADOS — patrimônio imaterial')],
  territorios_culturais: [siga('SIGA_CUL_TERRITORIOS_CULTURAIS')],
  bens_estudo: [siga('SIGA_CUL_BENS_ESTUDO — bens em estudo de tombamento')],
  areas_envoltorias: [siga('SIGA_CUL_AREAS_ENVOLTORIAS — áreas envoltórias dos bens tombados')],

  // Morfologia da Vila
  edificacoes_vila: [
    { source: 'palazzi', dataset: 'Edificacoes_* (uso) e classes de conservação' },
    { source: 'ortofoto', dataset: 'Referência de alinhamento' },
  ],
  edificacoes_cad: [{ source: 'cad_vila', dataset: 'paranapiacaba_edificacoes_georef' }],
  sistema_viario: [{ source: 'cad_vila', dataset: 'paranapiacaba_sistema_viario_georef' }],
  caminhos_vila: [{ source: 'palazzi', dataset: 'Caminhos' }],
  pac_lotes: [{ source: 'cad_vila', dataset: 'paranapiacaba_lotes_georef — lotes do cadastro (PAC Cidades Históricas)' }],

  // Relevo
  curvas_nivel: [{ source: 'cad_vila', dataset: 'paranapiacaba_curvas_nivel_detalhadas_georef — curvas de 1 m' }],
  altimetria_serra: [siga('SIGA_AMB_ALTIMETRIA_SUL_5M — curvas de 5 m (filtradas a cada 50 m)')],
  declividade: [{ source: 'copernicus', dataset: 'Copernicus DEM GLO-30, folha S24 W047 — declividade calculada pela equipe (método de Horn)' }],
  hipsometria: [{ source: 'copernicus', dataset: 'Copernicus DEM GLO-30, folha S24 W047 — faixas de altitude calculadas pela equipe' }],

  // Memória afetiva e caminhos históricos
  lugares_memoria: [
    {
      source: 'trilhas_trilhos',
      dataset: 'Compilados em vídeo, evento SEMASA e notas de campo (citacoes_lugares.csv)',
    },
    youtube('4GBcu6YzD_0', 'Casa da Memória de Paranapiacaba — canal Casa da Memória Paranapiacaba'),
    youtube('nrjB5ZXfiQI', 'Paranapiacaba — canal Casa da Memória Paranapiacaba'),
    youtube('Vhdn9-miubI', 'Documentário: Paranapiacaba Mais Que Uma Lenda — canal Melissa Gargalis'),
    youtube('-M0QTCgg8aU', 'Memória Viva – Lenda de Paranapiacaba, produção para a TV Câmara de Santo André — canal IPCOM'),
    youtube('_Bv9PWEjpDw', 'Nos Trilhos da Memória – Em Paranapiacaba — canal Eduardo Luz'),
    youtube('y4sTZaD84b4', 'Qual sua memória de Paranapiacaba? — canal Prefeitura de Santo André'),
    { source: 'osm', dataset: 'Coordenadas dos lugares citados (scripts/lugares_memoria_gazetteer_osm.csv)' },
  ],
  caminho_sal: [{ source: 'mymaps_lebens', dataset: 'KMZ exportado do mapa, só a linha do Caminho do Sal' }],

  // Bacias e hidrografia
  hidrografia_regional: [cbhat('Hidrografia-das-APPs-da-Região-Metropolitana-de-São-Paulo', 'Hidrografia das APPs da RMSP (APPs_Hidrografia)')],
  nascentes_regionais: [cbhat('Nascentes-da-Região-Metropolitana-de-São-Paulo', 'Nascentes da RMSP (APPs_Nascentes)')],
  subbacias_ugrhi6: [cbhat('Sub-bacias-UGRHI-6', 'Sub-bacias UGRHI 6 (45_SubBacias)')],
  reservatorios_rmsp_completos: [cbhat('Reservatórios-da-Região-Metropolitana-de-São-Paulo-1', 'Reservatórios da RMSP (Reservatórios_RMSP)')],
  reservatorios: [cbhat('Reservatórios-da-Região-Metropolitana-de-São-Paulo-1', 'Reservatórios da RMSP (Reservatórios_RMSP)')],
  subbacias: [{ source: 'geoseade', dataset: 'MA_subbacias — sub-bacias hidrográficas' }],
  regioes_hidrograficas: [{ source: 'geoseade', dataset: 'MA_reghidro — regiões hidrográficas' }],
  hidrografia: [{ source: 'palazzi', dataset: 'Corregos — córregos da Vila' }],
  nascentes: [cbhat('Nascentes-da-Região-Metropolitana-de-São-Paulo', 'Nascentes da RMSP (APPs_Nascentes), recorte da Vila')],
  rios_sul: [siga('SIGA_AMB_RIOS_LICENC_SUL')],
  billings_747: [siga('SIGA_LIM_BILLINGS_COTA_747')],

  // Áreas protegidas e vegetação
  ucs: [
    { source: 'geoseade', dataset: 'MA_ucestpi1 e MA_ucmunpi1 — unidades de conservação estaduais e municipais' },
    siga('SIGA_AMB_UC_EST_ALTO_PARANAP — Reserva Biológica do Alto da Serra de Paranapiacaba'),
  ],
  pnm_nascentes: [siga('SIGA_AMB_UC_MUN_NASC_PARANAP — Parque Natural Municipal Nascentes de Paranapiacaba')],
  apm_aprm_regionais: [cbhat('APMs_APRMs-da-Região-Metropolitana-de-São-Paulo', 'APMs/APRMs da RMSP (01_APRM)')],
  apps_hidricas_regionais: [cbhat('APPs-da-Região-Metropolitana-de-São-Paulo', 'APPs da RMSP (APPs)')],
  app_buffers: [cbhat('Hidrografia-das-APPs-da-Região-Metropolitana-de-São-Paulo', 'APPs_Hidrografia e APPs_Nascentes, recorte da Vila')],
  app_sul: [siga('SIGA_AMB_APP_LICENC_SUL')],
  classif_vegetal: [siga('SIGA_AMB_CLASSIF_VEGETAL — estágios de sucessão da Mata Atlântica')],

  // Riscos
  susc_movmas: [siga('SIGA_DCI_SUSC_MOVMAS_IPT2025 — suscetibilidade a movimentos de massa (IPT, 2025)')],
  risco_movmas: [siga('SIGA_DCI_RISCO_MOVMAS_IPT2014 — setores de risco (IPT, 2014)')],
  risco_incendio: [siga('SIGA_DCI_RISCO_INCENDIO — Defesa Civil de Santo André')],

  // Trilhas e atrativos
  trilhas: [{ source: 'wikiloc', dataset: '46 trilhas exportadas em KML do Wikiloc' }],
  atrativos: [{ source: 'wikiloc', dataset: 'Waypoints dos KML das trilhas do Wikiloc' }],
  circuitos: [siga('SIGA_TUR_* — circuitos turísticos de Santo André')],

  // Zoneamento e planos
  macrozonas: [{ source: 'santos_pd', dataset: 'LC_1181_2022_MACROZONAS — macrozonas do Plano Diretor de Santos' }],
  zoneamento_mzpa: [siga('SIGA_PLA_SETORIZACAO_MZPA — setorização da MZPA', {
    url: 'https://portais.santoandre.sp.gov.br/semasa/wp-content/uploads/sites/13/2024/08/Lei-Ordinaria-9924-L9924-16.pdf',
    note: 'Link para a Lei municipal 9.924/2016, citada em cada setor.',
  })],

  // Censo e densidade
  censo_setores: [{ source: 'ibge_censo2000', dataset: '35SANDRE — setores censitários de Santo André (Censo 2000)' }],
  densidade: [{ source: 'ibge_censo2000', dataset: '35SANDRE — densidade por setor censitário (Censo 2000)' }],
  densidade_2022: [siga('SIGA_PLA_POP_DENSIDADE_2022 — densidade por bairro, Censo IBGE 2022')],
  populacao_2022: [siga('SIGA_PLA_POPULACAO_CENSO_2022 — população por bairro, Censo IBGE 2022')],

  // Equipamentos urbanos
  saude: [siga('SIGA_SAU_* — equipamentos de saúde')],
  educacao: [siga('SIGA_EDU_* — equipamentos de educação')],
  seguranca: [siga('SIGA_SEG_* — equipamentos de segurança')],
  esporte: [siga('SIGA_ESP_* — equipamentos esportivos')],
  assistencia_social: [siga('SIGA_AS_* — equipamentos de assistência social')],
  defesa_civil: [siga('SIGA_DCI_* — abrigos e pluviômetros')],
  feiras_livres: [siga('SIGA_CRA_FEIRAS_LIVRES — feiras livres (CRAISA)')],
  cemiterio: [siga('SIGA_SFU_CEMITERIO')],

  // Energia
  rede_eletrica: [{ source: 'epe', dataset: 'LT_EXISTENTE — linhas de transmissão existentes' }],
  subestacoes: [{ source: 'epe', dataset: 'SE_EXISTENTE — subestações existentes' }],
};

// Rasters da aba "Históricos" e o fundo Ortofoto 2010.
export const RASTER_SOURCES = {
  coverage: [{
    source: 'mapbiomas',
    dataset: 'Cobertura e uso da terra, 2008–2024, recorte de Paranapiacaba',
    url: 'https://doi.org/10.58053/MapBiomas/5P83DF',
  }],
  declividade: LAYER_SOURCES.declividade,
  orthophoto: [{ source: 'ortofoto', dataset: 'Ortofoto_Paranapiacaba_2010_UTM23S.tif' }],
};

// Cartas históricas e anexos de lei: a fonte depende do grupo e do município.
export const REFERENCE_SOURCES = {
  historical: { source: 'apesp', note: 'Carta do fundo IGC/IGG; código no nome do arquivo.' },
};

export const LEGISLATION_SOURCES = {
  'Cubatão': {
    source: 'cubatao_pd',
    url: 'https://www.cubatao.sp.gov.br/wp-content/uploads/2022/11/Anexo-I-%E2%80%93-Mapa-de-Zoneamento-2.pdf',
  },
  'Mogi das Cruzes': { source: 'mogi_pd' },
  'Ribeirão Pires': { source: 'ribeirao_pd' },
  'Rio Grande da Serra': { source: 'rgs_pd' },
  'Santo André': { source: 'santo_andre_luops' },
  'Santos': { source: 'santos_luos' },
  'Suzano': { source: 'suzano_pd' },
};

/** Resolve uma lista de { source, dataset, url?, note? } com os dados do portal. */
export function resolveSources(entries = []) {
  return entries
    .filter((entry) => SOURCES[entry.source])
    .map((entry) => {
      const portal = SOURCES[entry.source];
      return {
        key: entry.source,
        short: portal.short,
        name: portal.name,
        org: portal.org,
        dataset: entry.dataset || null,
        url: entry.url || portal.url,
        portalUrl: portal.url,
        note: entry.note || portal.note || null,
      };
    });
}

export function layerSources(layerId) {
  return resolveSources(LAYER_SOURCES[layerId]);
}

/** Fonte de uma carta de referência do manifesto (histórica ou anexo de lei). */
export function referenceMapSources(item) {
  if (!item) return [];
  const entry = item.group === 'historical'
    ? REFERENCE_SOURCES.historical
    : LEGISLATION_SOURCES[item.municipality];
  if (!entry) return [];
  return resolveSources([{ ...entry, dataset: entry.dataset || item.sourceFile }]);
}

/** Uma entrada por portal (sem repetir), na ordem em que aparecem nas camadas. */
export function uniqueSources(layerIds) {
  const seen = new Map();
  layerIds.forEach((id) => {
    layerSources(id).forEach((source) => {
      if (!seen.has(source.key)) seen.set(source.key, source);
    });
  });
  return [...seen.values()];
}

/** HTML curto para o controle de atribuição do Leaflet. */
export function attributionHtml(source) {
  if (SOURCES[source.key]?.attribution) return SOURCES[source.key].attribution;
  const label = escapeHtml(source.short);
  if (!source.portalUrl) return label;
  return `<a href="${escapeHtml(source.portalUrl)}" target="_blank" rel="noopener noreferrer" title="${escapeHtml(source.name)}">${label}</a>`;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
