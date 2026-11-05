"""Catálogo dos conjuntos SIGA Santo André baixados em 05/11/2026.

Fonte única de verdade sobre o que é cada arquivo bruto: tema da pasta em
00_DADOS_BRUTOS/SIGA/, ficha de metadados (PDF ISO 19115 / Perfil MGB) e base
legal. A base legal foi transcrita à mão do Resumo / Declaração de Qualidade de
cada ficha, porque o texto livre não segue um padrão que uma regex capture com
segurança. Título, data, responsável, escala e EPSG são lidos do próprio PDF
por build_siga_ambiental.py.

`decisao` segue a tabela do relatório (08_DOCUMENTACAO/02_RELATORIOS/):
  publicada     — vira camada do WebGIS (recortada à área de estudo)
  regional      — publicada só no contorno, para a escala 1:500.000
  validacao     — não publicada; serve para validar outra fonte (IoU no manifesto)
  descartada    — fica só no bruto (obsoleta, fora da área ou redundante)
  substituida   — versão antiga de um conjunto que tem versão nova
"""

TEMAS = ("LIMITES", "AMBIENTAL_UC", "HIDRO_BACIAS", "AMBIENTAL_OUTROS",
         "TURISMO", "ALTIMETRIA")

# codigo -> tema, pdf, base_legal. `zip` = False quando o SIGA só forneceu a ficha.
DATASETS = {
    # ---------------- LIMITES ----------------
    "SIGA_LIM_MUNICIPAL_2026": dict(
        tema="LIMITES", pdf="Limite Municipal - 2026.pdf",
        base_legal="Malha municipal oficial IGC-SP (revisão 2021)"),
    "SIGA_LIM_MUNICIPAL": dict(
        tema="LIMITES", pdf="Limite Municipal.pdf",
        base_legal="Cartas topográficas EMPLASA 1:10.000 (download 2019)"),
    "SIGA_LIM_DISTRITO_SUBDISTRITO": dict(
        tema="LIMITES", pdf="Limite de Distritos e Subdistrito.pdf",
        base_legal="Lei Estadual 8.092/1964; Lei 4.954/1985 (cria Capuava)"),
    "SIGA_LIM_BAIRROS_OFICIAL": dict(
        tema="LIMITES", pdf="Limite de Bairros - Oficial 2018_2020.pdf",
        base_legal="Leis Municipais 10.136/2018 e 10.312/2020"),
    "SIGA_LIM_BAIRROS_2009": dict(
        tema="LIMITES", pdf="Limite de Bairros - 2009.pdf",
        base_legal="Decreto Municipal 15.913/2009 (altera Dec. 14.372/1999)"),
    "SIGA_LIM_LOTEAMENTO": dict(
        tema="LIMITES", pdf="Limite de Loteamento.pdf", zip=False,
        base_legal="LUOPS: Leis 271/1929 … 9.924/2016"),
    "SIGA_LIM_MARCO_ZERO": dict(
        tema="LIMITES", pdf="Marco Zero.pdf",
        base_legal="Lei Municipal 10.177/2019 (art. 1º)"),
    "SIGA_LIM_PARQUE_ANDREENSE": dict(
        tema="LIMITES", pdf="Parque Andreense.pdf",
        base_legal="Lei Municipal 8.343/2002"),
    "SIGA_LIM_BILLINGS_2026": dict(
        tema="LIMITES", pdf="Billings Cota 747 - 2026.pdf",
        base_legal="Cota 747,00 (máximo maximorum); levantamento LIDAR 2024 1:1.000"),

    # ---------------- AMBIENTAL_UC ----------------
    "SIGA_AMB_UC_EST_SERRA_MAR": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Estadual - Parque Estadual da Serra do Mar.pdf",
        base_legal="Decreto Estadual 10.251/1977"),
    "SIGA_AMB_UC_EST_ALTO_PARANAP": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Estadual - Reserva Biológica do Alto da Serra de Paranapiacaba.pdf",
        base_legal="Decreto Estadual 24.714/1986"),
    "SIGA_AMB_UC_EST_BARONESA": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Estadual - Chácara da Baronesa.pdf",
        base_legal="Lei Estadual 5.745/1987"),
    "SIGA_AMB_UC_MUN_NASC_PARANAP": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Nascentes de Paranapiacaba.pdf",
        base_legal="Decreto Municipal 14.937/2003"),
    "SIGA_AMB_UC_MUN_PEDROSO_LIM": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Parque do Pedroso - Limite.pdf",
        base_legal="Decreto Municipal 16.878/2016"),
    "SIGA_AMB_UC_MUN_PEDROSO_AMORT": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Parque do Pedroso - Zona de Amortecimento.pdf",
        base_legal="Plano de Manejo do PNM do Pedroso, vol. II"),
    "SIGA_AMB_UC_MUN_PED_ZON_INTER": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Parque do Pedroso - Zoneamento Interno.pdf",
        base_legal="Plano de Manejo do PNM do Pedroso, vol. II, p. 69–83"),
    "SIGA_AMB_UC_MUN_PEDROSO_BACIA": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Parque do Pedroso - Bacias.pdf",
        base_legal=""),
    "SIGA_AMB_UC_PED_LEVANT_PRE": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Parque do Pedroso - Pedologia - Levantamento Preliminar.pdf",
        base_legal=""),
    "SIGA_AMB_UC_PED_FOTOS_CAMPO": dict(
        tema="AMBIENTAL_UC",
        pdf="Unidade de Conservação Municipal - Parque do Pedroso - Pedologia - Fotos de Campo.pdf",
        base_legal=""),

    # ---------------- HIDRO_BACIAS ----------------
    "SIGA_AMB_UGRHIS": dict(
        tema="HIDRO_BACIAS", pdf="Bacias Hidrográficas_ UGRHI's.pdf",
        base_legal="Lei Estadual 9.034/1994"),
    "SIGA_AMB_MACRO_BACIAS": dict(
        tema="HIDRO_BACIAS", pdf="Bacias Hidrográficas_ Macro Bacias.pdf",
        base_legal=""),
    "SIGA_AMB_BACIAS": dict(
        tema="HIDRO_BACIAS", pdf="Bacias Hidrográficas_ Bacias.pdf",
        base_legal=""),
    "SIGA_AMB_SUB_BACIAS": dict(
        tema="HIDRO_BACIAS", pdf="Bacias Hidrográficas_ Sub-bacias.pdf",
        base_legal=""),

    # ---------------- AMBIENTAL_OUTROS ----------------
    "SIGA_AMB_CLASSIF_VEGETAL": dict(
        tema="AMBIENTAL_OUTROS", pdf="Classificação Vegetal.pdf",
        base_legal="Resoluções CONAMA 10/1993 e 01/1994 (projeto FEHIDRO 2011–2012)"),
    "SIGA_AMB_APP_LICENC_SUL": dict(
        tema="AMBIENTAL_OUTROS", pdf="APP's Licenciáveis Sul.pdf",
        base_legal="Lei Federal 12.651/2012; Lei Estadual 13.579/2009"),
    "SIGA_AMB_APP_LICENC_NORTE": dict(
        tema="AMBIENTAL_OUTROS", pdf="APP's Licenciáveis Norte.pdf",
        base_legal=""),
    "SIGA_SEM_AREA_CONTAMINADA": dict(
        tema="AMBIENTAL_OUTROS", pdf="Áreas Contaminadas.pdf",
        base_legal="Decreto Estadual 59.263/2013 (art. 3º); relação CETESB"),

    # ---------------- ALTIMETRIA ----------------
    "SIGA_AMB_ALTIMETRIA_NORTE_1M": dict(
        tema="ALTIMETRIA", pdf="Altimetria Norte - 1m.pdf",
        base_legal="Restituição aerofotogramétrica 1990, voo 1:8.000"),

    # ---------------- TURISMO (sem ficha PDF no SIGA) ----------------
    **{f"SIGA_TUR_{c}": dict(tema="TURISMO", pdf=None, base_legal="")
       for c in ("CIRC_PARANAPIACABA", "HIST_CULTURAL", "CITY_TOUR_HISTORICO",
                 "ARTE_ARQUITETURA", "CIRC_PARQUE_LAZER", "CIRC_PEDAGOG_CIENTIF",
                 "CIRC_INDUSTRIA_INOVAC", "CIRC_HOTEL", "COMPRA")},
}

# Documentos não-SIGA baixados no mesmo lote (Tombamento da Serra do Mar,
# Res. SC 40/1985). Copiados para 00_DADOS_BRUTOS/TOMBAMENTO_SERRA_MAR/ —
# insumo da camada pendente do mapa ambiental, fora deste pipeline.
EXTRAS_TOMBAMENTO = {
    "E0D00012.pdf": "DOE 15/06/1985 (v.95 nº110, p.29) — Resolução SC 40 de 06/06/1985, "
                    "tombamento da Serra do Mar e de Paranapiacaba (digitalização, Acervo ISA)",
    "db122_RES. SC N 40 - Area da Serra do Mar e Paranapiacaba.pdf":
        "Transcrição CONDEPHAAT da Res. SC 40/1985 (texto integral com perímetro)",
    "13d00219.pdf": "Caderno CONDEPHAAT sobre o tombamento da Serra do Mar "
                    "(tabela de áreas tombadas e mapas)",
    "Mapa-Plano-Serra-do-Mar-e1421177335249.jpg": "Mapa ilustrativo do Plano da Serra do Mar",
}
