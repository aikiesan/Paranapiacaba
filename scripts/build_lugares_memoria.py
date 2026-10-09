"""Build the "Lugares de Memória" layer (mapa afetivo) for the WebGIS.

Inputs (outside git — EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/05_TRANSCRICOES/):

  * citacoes_lugares.csv          id, fonte, falante, timestamp, citacao, lugar, tema, publicavel
  * lugares_memoria_gazetteer.csv lugar, lat, lon, precisao, fonte_coord

A quote reaches public/data/lugares_memoria.geojson only when the team has set
publicavel == "sim" AND its place has coordinates (precisao != "pendente").
`lugar` may list several places separated by ";" — the quote is attached to
each of them. One Point feature per place, carrying every approved quote.

The repository is public: when nothing is approved (or the inputs are missing)
an empty FeatureCollection is written, so no quote ever leaks by default.

Run:  python build_lugares_memoria.py
"""
import csv
import json
import os

import config as C

TRANSCRICOES = os.path.join(C.EXTERNAL, "05_TRANSCRICOES")
CITACOES_CSV = os.path.join(TRANSCRICOES, "citacoes_lugares.csv")
GAZETTEER_CSV = os.path.join(TRANSCRICOES, "lugares_memoria_gazetteer.csv")
OUT = os.path.join(C.OUT_DIR, "lugares_memoria.geojson")

TEMAS = {"ferrovia_trabalho", "mata_ranchos", "lazer_festas",
         "perda_gentrificacao", "misticismo", "outro"}


def read_csv(path):
    if not os.path.exists(path):
        return []
    # utf-8-sig: the CSVs are edited by the team in Excel, which adds a BOM.
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def split_lugares(value):
    return [p.strip() for p in (value or "").split(";") if p.strip()]


def is_publicavel(row):
    return (row.get("publicavel") or "").strip().lower() == "sim"


def coords_of(entry):
    """(lon, lat) for a gazetteer row, or None when pending/blank/invalid."""
    if not entry or (entry.get("precisao") or "").strip().lower() == "pendente":
        return None
    try:
        lat, lon = float(entry["lat"]), float(entry["lon"])
    except (KeyError, TypeError, ValueError):
        return None
    if not (-90 <= lat <= 90 and -180 <= lon <= 180):
        return None
    return lon, lat


def build_features(citacoes, gazetteer):
    gaz = {(g.get("lugar") or "").strip(): g for g in gazetteer}
    places = {}
    for row in citacoes:
        if not is_publicavel(row):
            continue
        tema = (row.get("tema") or "").strip()
        fala = {
            "id": (row.get("id") or "").strip(),
            "citacao": (row.get("citacao") or "").strip(),
            "falante": (row.get("falante") or "").strip(),
            "fonte": (row.get("fonte") or "").strip(),
            "timestamp": (row.get("timestamp") or "").strip(),
            "tema": tema if tema in TEMAS else "outro",
        }
        if not fala["citacao"]:
            continue
        for lugar in split_lugares(row.get("lugar")):
            xy = coords_of(gaz.get(lugar))
            if xy is None:
                continue
            place = places.setdefault(lugar, {"xy": xy, "entry": gaz[lugar], "falas": []})
            place["falas"].append(fala)

    feats = []
    for lugar, place in sorted(places.items(), key=lambda kv: kv[0].lower()):
        temas = sorted({f["tema"] for f in place["falas"]})
        feats.append({
            "type": "Feature",
            "properties": {
                "nome": lugar,
                "n_falas": len(place["falas"]),
                "temas": temas,
                "precisao": place["entry"].get("precisao", "").strip(),
                "fonte_coord": place["entry"].get("fonte_coord", "").strip(),
                "falas": place["falas"],
            },
            "geometry": {"type": "Point",
                         "coordinates": [round(place["xy"][0], 6), round(place["xy"][1], 6)]},
        })
    return {"type": "FeatureCollection", "features": feats}


def main():
    print("Building lugares_memoria")
    citacoes = read_csv(CITACOES_CSV)
    gazetteer = read_csv(GAZETTEER_CSV)
    if not citacoes:
        print(f"  (sem {os.path.relpath(CITACOES_CSV, C.REPO)} — publicando camada vazia)")
    fc = build_features(citacoes, gazetteer)
    os.makedirs(C.OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))

    aprovadas = sum(is_publicavel(r) for r in citacoes)
    pendentes = sum(coords_of(g) is None for g in gazetteer)
    print(f"  {len(citacoes)} falas, {aprovadas} aprovadas (publicavel=sim); "
          f"{len(gazetteer)} lugares, {pendentes} sem coordenada")
    print(f"  -> {len(fc['features'])} lugares publicados em {os.path.relpath(OUT, C.REPO)}")


if __name__ == "__main__":
    main()
