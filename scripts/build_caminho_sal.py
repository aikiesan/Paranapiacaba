"""Build the Caminho do Sal layer (Caminhos históricos) for the WebGIS.

Source: "Caminho do Sal.kmz" (config.CAMINHO_SAL_KMZ, outside git), exported
from the Google My Maps of Mariana Lebens:
https://www.google.com/maps/d/viewer?mid=12bBvGeW5hecNAqtQlvLA1lK1dseMIbA

Only the route line is published. The KMZ also carries points of interest
(chapels, parks, stations) that are not part of this layer, and the other KMZs
in the same folder (Passos do Padre Capra, Rota da Luz, ...) are deliberately
not published.

Run:  python build_caminho_sal.py
"""
import json
import math
import os
import xml.etree.ElementTree as ET
import zipfile

import config as C

KML_NS = "{http://www.opengis.net/kml/2.2}"
OUT = os.path.join(C.OUT_DIR, "caminho_sal.geojson")
AUTORIA = "Mariana Lebens"
FONTE_URL = "https://www.google.com/maps/d/viewer?mid=12bBvGeW5hecNAqtQlvLA1lK1dseMIbA"


def _clean(text):
    # The export uses non-breaking spaces ("Caminho\xa0 do Sal").
    return " ".join((text or "").replace("\xa0", " ").split())


def _coords(text):
    pts = []
    for token in (text or "").split():
        lon, lat = (float(v) for v in token.split(",")[:2])
        pts.append([round(lon, 6), round(lat, 6)])
    return pts


def _length_km(line):
    total = 0.0
    for (x1, y1), (x2, y2) in zip(line, line[1:]):
        p1, p2 = math.radians(y1), math.radians(y2)
        dp, dl = p2 - p1, math.radians(x2 - x1)
        a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
        total += 2 * 6371.0088 * math.asin(math.sqrt(a))
    return total


def read_lines(kmz_path):
    with zipfile.ZipFile(kmz_path) as z:
        kml_name = next(n for n in z.namelist() if n.lower().endswith(".kml"))
        root = ET.fromstring(z.read(kml_name))
    lines = []
    for pm in root.iter(f"{KML_NS}Placemark"):
        for ls in pm.iter(f"{KML_NS}LineString"):
            coords = _coords(ls.findtext(f"{KML_NS}coordinates"))
            if len(coords) >= 2:
                lines.append((_clean(pm.findtext(f"{KML_NS}name")), coords))
    return lines


def main():
    print("Building caminho_sal")
    lines = read_lines(C.CAMINHO_SAL_KMZ)
    if not lines:
        raise SystemExit(f"nenhuma linha em {C.CAMINHO_SAL_KMZ}")
    feats = []
    for name, coords in lines:
        feats.append({
            "type": "Feature",
            "properties": {
                "nome": name or "Caminho do Sal",
                "extensao_km": round(_length_km(coords), 1),
                "autoria": AUTORIA,
                "fonte": FONTE_URL,
            },
            "geometry": {"type": "LineString", "coordinates": coords},
        })
    fc = {"type": "FeatureCollection", "features": feats}
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))
    for f in feats:
        p = f["properties"]
        print(f"  {p['nome']}: {len(f['geometry']['coordinates'])} vértices, {p['extensao_km']} km")


if __name__ == "__main__":
    main()
