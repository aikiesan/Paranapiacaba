"""Build the "Lugares de Memória" layer (mapa afetivo) for the WebGIS.

Inputs (outside git — EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/05_TRANSCRICOES/):

  * citacoes_lugares.csv          id, fonte, falante, timestamp, citacao, lugar, tema, publicavel
  * lugares_memoria_gazetteer.csv lugar, lat, lon, precisao, fonte_coord
  * nomes_anonimizar.csv          nome, substituto  (optional)

A quote is eligible only when the team has set publicavel == "sim" AND its
place has coordinates (precisao != "pendente"). `lugar` may list several places
separated by ";" — the quote is attached to each of them. One Point feature per
place, carrying every eligible quote.

Everything published is anonymised: each speaker becomes "Depoente NN" (numbered
by first appearance in the CSV, so codes do not shift as approvals change), and
every name listed in nomes_anonimizar.csv is replaced in quotes, place names and
sources. Real names stay only in the CSVs, outside git.

The layer is PAUSED: unless the script runs with --publicar, it writes an empty
FeatureCollection even if quotes were approved (it only reports how many would
go out). The repository and the GitHub Pages site are public.

Run:  python build_lugares_memoria.py              # pausado: GeoJSON vazio
      python build_lugares_memoria.py --publicar   # só após decisão da equipe
"""
import csv
import json
import os
import re
import sys

import config as C

TRANSCRICOES = os.path.join(C.EXTERNAL, "05_TRANSCRICOES")
CITACOES_CSV = os.path.join(TRANSCRICOES, "citacoes_lugares.csv")
GAZETTEER_CSV = os.path.join(TRANSCRICOES, "lugares_memoria_gazetteer.csv")
NOMES_CSV = os.path.join(TRANSCRICOES, "nomes_anonimizar.csv")
OUT = os.path.join(C.OUT_DIR, "lugares_memoria.geojson")

TEMAS = {"ferrovia_trabalho", "mata_ranchos", "lazer_festas",
         "perda_gentrificacao", "misticismo", "outro"}
EMPTY = {"type": "FeatureCollection", "features": []}


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


def pseudonyms(citacoes):
    """Speaker -> "Depoente NN", numbered by first appearance in the CSV."""
    codes = {}
    for row in citacoes:
        falante = (row.get("falante") or "").strip()
        if falante and falante not in codes:
            codes[falante] = f"Depoente {len(codes) + 1:02d}"
    return codes


def redactor(nomes):
    """Function replacing each listed name (whole word, any case) by its substitute."""
    pairs = [((n.get("nome") or "").strip(), (n.get("substituto") or "[nome omitido]").strip())
             for n in nomes]
    pairs = sorted((p for p in pairs if p[0]), key=lambda p: len(p[0]), reverse=True)
    patterns = [(re.compile(rf"(?<!\w){re.escape(nome)}(?!\w)", re.IGNORECASE), sub)
                for nome, sub in pairs]

    def redact(text):
        for pattern, sub in patterns:
            text = pattern.sub(sub, text)
        return text
    return redact


def build_features(citacoes, gazetteer, nomes=()):
    gaz = {(g.get("lugar") or "").strip(): g for g in gazetteer}
    codes = pseudonyms(citacoes)
    redact = redactor(nomes)
    places = {}
    for row in citacoes:
        if not is_publicavel(row):
            continue
        tema = (row.get("tema") or "").strip()
        fala = {
            "id": (row.get("id") or "").strip(),
            "citacao": redact((row.get("citacao") or "").strip()),
            "falante": codes.get((row.get("falante") or "").strip(), "Depoente não identificado"),
            "fonte": redact((row.get("fonte") or "").strip()),
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
                "nome": redact(lugar),
                "n_falas": len(place["falas"]),
                "temas": temas,
                "precisao": place["entry"].get("precisao", "").strip(),
                "fonte_coord": redact(place["entry"].get("fonte_coord", "").strip()),
                "falas": place["falas"],
            },
            "geometry": {"type": "Point",
                         "coordinates": [round(place["xy"][0], 6), round(place["xy"][1], 6)]},
        })
    return {"type": "FeatureCollection", "features": feats}


def apply_pause(fc, publicar):
    """While the layer is paused, nothing leaves the machine."""
    return fc if publicar else EMPTY


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    publicar = "--publicar" in argv
    print("Building lugares_memoria" + ("" if publicar else " (PAUSADO — use --publicar)"))
    citacoes = read_csv(CITACOES_CSV)
    gazetteer = read_csv(GAZETTEER_CSV)
    nomes = read_csv(NOMES_CSV)
    if not citacoes:
        print(f"  (sem {os.path.relpath(CITACOES_CSV, C.REPO)} — publicando camada vazia)")
    fc = build_features(citacoes, gazetteer, nomes)
    out = apply_pause(fc, publicar)
    os.makedirs(C.OUT_DIR, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, separators=(",", ":"))

    aprovadas = sum(is_publicavel(r) for r in citacoes)
    pendentes = sum(coords_of(g) is None for g in gazetteer)
    print(f"  {len(citacoes)} falas, {aprovadas} aprovadas (publicavel=sim); "
          f"{len(gazetteer)} lugares, {pendentes} sem coordenada; {len(nomes)} nomes a anonimizar")
    print(f"  {len(fc['features'])} lugares elegíveis -> {len(out['features'])} publicados em "
          f"{os.path.relpath(OUT, C.REPO)}")


if __name__ == "__main__":
    main()
