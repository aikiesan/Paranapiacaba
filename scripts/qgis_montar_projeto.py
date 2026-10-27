"""Reconstrói o projeto QGIS do pacote a partir dos GeoPackages.

Uso (QGIS 3.28+): abra um projeto vazio, menu Complementos > Console Python >
Mostrar editor, abra este arquivo e clique em Executar. O projeto é salvo em
01_PROJETO_QGIS/Paranapiacaba_UNESCO_reconstruido.qgz.

Os estilos vêm da tabela layer_styles de cada GeoPackage (estilo padrão).
A ordem e os grupos seguem 02_DADOS_VETORIAIS/_camadas.csv (eixos I–VII do dossiê).
"""
import csv
import os

from qgis.core import (QgsCoordinateReferenceSystem, QgsProject, QgsRasterLayer,
                       QgsVectorLayer)

PASTA_PROJETO = os.path.dirname(os.path.abspath(__file__)) if "__file__" in globals() else None
if not PASTA_PROJETO or not os.path.isdir(os.path.join(PASTA_PROJETO, "..", "02_DADOS_VETORIAIS")):
    from qgis.PyQt.QtWidgets import QFileDialog
    PASTA_PROJETO = os.path.join(QFileDialog.getExistingDirectory(
        None, "Selecione a pasta PACOTE_ARTHUR_QGIS"), "01_PROJETO_QGIS")
RAIZ = os.path.normpath(os.path.join(PASTA_PROJETO, ".."))

projeto = QgsProject.instance()
projeto.clear()
projeto.setCrs(QgsCoordinateReferenceSystem("EPSG:31983"))
projeto.setFilePathStorage(0)  # caminhos relativos
raiz = projeto.layerTreeRoot()

grupos = {}
with open(os.path.join(RAIZ, "02_DADOS_VETORIAIS", "_camadas.csv"), encoding="utf-8-sig") as f:
    for linha in csv.DictReader(f):
        if not int(float(linha.get("feicoes") or 0)):
            continue
        chave_eixo = f"{linha['eixo']} · {linha['eixo_titulo']}"
        eixo = grupos.get(chave_eixo) or raiz.addGroup(chave_eixo)
        grupos[chave_eixo] = eixo
        chave_secao = f"{linha['secao']} {linha['secao_titulo']}"
        secao = eixo.findGroup(chave_secao) or eixo.addGroup(chave_secao)
        fonte = os.path.join(RAIZ, linha["gpkg"]) + f"|layername={linha['camada']}"
        camada = QgsVectorLayer(fonte, linha["titulo"], "ogr")
        if not camada.isValid():
            print("Não carregou:", fonte)
            continue
        projeto.addMapLayer(camada, False)
        no = secao.addLayer(camada)
        no.setItemVisibilityChecked(False)
        no.setExpanded(False)

base = raiz.addGroup("Rasters e mapas-base")
orto = os.path.join(RAIZ, "04_RASTERS", "ortofoto_2010", "Ortofoto_Paranapiacaba_2010_UTM23S.tif")
if os.path.exists(orto):
    r = QgsRasterLayer(orto, "Ortofoto 2010 (Vila)")
    projeto.addMapLayer(r, False)
    base.addLayer(r).setItemVisibilityChecked(False)
osm = QgsRasterLayer("type=xyz&url=https://tile.openstreetmap.org/{z}/{x}/{y}.png&zmax=19&zmin=0",
                     "OpenStreetMap", "wms")
projeto.addMapLayer(osm, False)
base.addLayer(osm)

saida = os.path.join(PASTA_PROJETO, "Paranapiacaba_UNESCO_reconstruido.qgz")
projeto.write(saida)
print("Projeto salvo em", saida)
