"""Build the "Lugares de Memória" layer (mapa afetivo) for the WebGIS.

Inputs (outside git — EXTERNAL_FILES_SHOULD_BE_GIT_IGNORED/05_TRANSCRICOES/):

  * citacoes_lugares.csv          id, fonte, falante, timestamp, citacao, lugar, tema, publicavel
                                  (interviews and field notes of Trilhas e Trilhos da Memória)
  * citacoes_videos.csv           same columns + url, categoria, nota (public YouTube videos)
  * lugares_memoria_gazetteer.csv lugar, lat, lon, precisao, fonte_coord
  * nomes_anonimizar*.csv         nome, substituto  (optional)

and, in git, scripts/lugares_memoria_gazetteer_osm.csv (lugar, apelidos, lat, lon,
precisao, fonte_coord): public landmarks taken from OpenStreetMap. A place is
looked up by name or alias, ignoring case and accents; the team gazetteer wins
whenever it has a coordinate for the place.

`categoria` follows the four books of IPHAN's registry of intangible heritage
(saberes, celebracoes, formas_expressao, lugares) and is optional. `url` links
the quote to the published video it comes from.

A quote is eligible only when the team has set publicavel == "sim" AND its
place has coordinates (precisao != "pendente"). `lugar` may list several places
separated by ";" — the quote is attached to each of them. One Point feature per
place, carrying every eligible quote.

Everything published is anonymised: each speaker becomes "Depoente NN" (numbered
by first appearance in the CSVs, so codes do not shift as approvals change), and
every name listed in nomes_anonimizar*.csv is replaced in quotes, place names and
sources. Real names stay only in the CSVs, outside git.

The layer is PAUSED: unless the script runs with --publicar, it writes an empty
FeatureCollection even if quotes were approved (it only reports how many would
go out). The repository and the GitHub Pages site are public. --previa writes a
review copy with every quote, approved or not, next to the CSVs (outside git).

Run:  python build_lugares_memoria.py              # pausado: GeoJSON vazio
      python build_lugares_memoria.py --previa     # + prévia de revisão em 05_TRANSCRICOES
      python build_lugares_memoria.py --publicar   # só após decisão da equipe
"""
import csv
import json
import os
import re
import sys
import unicodedata

import config as C

TRANSCRICOES = os.path.join(C.EXTERNAL, "05_TRANSCRICOES")
# Interviews first, so their speakers keep the Depoente numbers they already have.
CITACOES_CSVS = [os.path.join(TRANSCRICOES, "citacoes_lugares.csv"),
                 os.path.join(TRANSCRICOES, "citacoes_videos.csv")]
GAZETTEER_CSVS = [os.path.join(TRANSCRICOES, "lugares_memoria_gazetteer.csv"),
                  os.path.join(C.HERE, "lugares_memoria_gazetteer_osm.csv")]
NOMES_CSVS = [os.path.join(TRANSCRICOES, "nomes_anonimizar.csv"),
              os.path.join(TRANSCRICOES, "nomes_anonimizar_videos.csv")]
OUT = os.path.join(C.OUT_DIR, "lugares_memoria.geojson")
OUT_PREVIA = os.path.join(TRANSCRICOES, "lugares_memoria_previa.geojson")

TEMAS = {"ferrovia_trabalho", "mata_ranchos", "lazer_festas",
         "perda_gentrificacao", "misticismo", "outro"}
CATEGORIAS = {"saberes", "celebracoes", "formas_expressao", "lugares"}
EMPTY = {"type": "FeatureCollection", "features": []}


def read_csv(path):
    if not os.path.exists(path):
        return []
    # utf-8-sig: the CSVs are edited by the team in Excel, which adds a BOM.
    with open(path, encoding="utf-8-sig", newline="") as fh:
        return list(csv.DictReader(fh))


def read_csvs(paths):
    return [row for path in paths for row in read_csv(path)]


def split_lugares(value):
    return [p.strip() for p in (value or "").split(";") if p.strip()]


def norm(name):
    """Lookup key: lower case, no accents, single spaces."""
    text = unicodedata.normalize("NFKD", name or "")
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return " ".join(text.lower().split())


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


def gazetteer_index(gazetteer):
    """Name/alias key -> gazetteer row. The first row with a coordinate wins,
    so the team gazetteer (read first) overrides OpenStreetMap."""
    index = {}
    for entry in gazetteer:
        names = [entry.get("lugar")] + split_lugares(entry.get("apelidos"))
        for key in filter(None, map(norm, names)):
            if key not in index or (coords_of(index[key]) is None and coords_of(entry)):
                index[key] = entry
    return index


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


def build_features(citacoes, gazetteer, nomes=(), previa=False):
    """With previa=True every quote enters, approved or not (review copy only)."""
    gaz = gazetteer_index(gazetteer)
    codes = pseudonyms(citacoes)
    redact = redactor(nomes)
    places = {}
    for row in citacoes:
        if not (previa or is_publicavel(row)):
            continue
        tema = (row.get("tema") or "").strip()
        categoria = (row.get("categoria") or "").strip()
        url = (row.get("url") or "").strip()
        fala = {
            "id": (row.get("id") or "").strip(),
            "citacao": redact((row.get("citacao") or "").strip()),
            "falante": codes.get((row.get("falante") or "").strip(), "Depoente não identificado"),
            "fonte": redact((row.get("fonte") or "").strip()),
            "timestamp": (row.get("timestamp") or "").strip(),
            "tema": tema if tema in TEMAS else "outro",
        }
        if categoria in CATEGORIAS:
            fala["categoria"] = categoria
        if url.startswith("https://"):
            fala["url"] = url
        if not fala["citacao"]:
            continue
        for lugar in split_lugares(row.get("lugar")):
            entry = gaz.get(norm(lugar))
            xy = coords_of(entry)
            if xy is None:
                continue
            # Aliases of one place ("Lyra", "Lyra Serrano") meet on its canonical name.
            nome = entry["lugar"].strip()
            place = places.setdefault(nome, {"xy": xy, "entry": entry, "falas": []})
            if fala not in place["falas"]:
                place["falas"].append(fala)

    feats = []
    for lugar, place in sorted(places.items(), key=lambda kv: kv[0].lower()):
        temas = sorted({f["tema"] for f in place["falas"]})
        categorias = sorted({f["categoria"] for f in place["falas"] if "categoria" in f})
        feats.append({
            "type": "Feature",
            "properties": {
                "nome": redact(lugar),
                "n_falas": len(place["falas"]),
                "temas": temas,
                "categorias": categorias,
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


def unlocated_places(citacoes, gazetteer):
    """Places cited in some quote that no gazetteer can place yet."""
    gaz = gazetteer_index(gazetteer)
    return sorted({lugar for row in citacoes for lugar in split_lugares(row.get("lugar"))
                   if coords_of(gaz.get(norm(lugar))) is None}, key=str.lower)


def write_geojson(path, fc):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(fc, fh, ensure_ascii=False, separators=(",", ":"))


def main(argv=None):
    argv = sys.argv[1:] if argv is None else argv
    publicar = "--publicar" in argv
    print("Building lugares_memoria" + ("" if publicar else " (PAUSADO — use --publicar)"))
    citacoes = read_csvs(CITACOES_CSVS)
    gazetteer = read_csvs(GAZETTEER_CSVS)
    nomes = read_csvs(NOMES_CSVS)
    if not citacoes:
        print("  (sem citacoes_*.csv em 05_TRANSCRICOES — publicando camada vazia)")
    fc = build_features(citacoes, gazetteer, nomes)
    out = apply_pause(fc, publicar)
    write_geojson(OUT, out)

    aprovadas = sum(is_publicavel(r) for r in citacoes)
    print(f"  {len(citacoes)} falas, {aprovadas} aprovadas (publicavel=sim); "
          f"{len(gazetteer)} lugares no gazetteer; {len(nomes)} nomes a anonimizar")
    print(f"  {len(fc['features'])} lugares elegíveis -> {len(out['features'])} publicados em "
          f"{os.path.relpath(OUT, C.REPO)}")

    if "--previa" in argv:
        previa = build_features(citacoes, gazetteer, nomes, previa=True)
        write_geojson(OUT_PREVIA, previa)
        n = sum(f["properties"]["n_falas"] for f in previa["features"])
        print(f"  prévia (todas as falas, fora do site): {len(previa['features'])} lugares, "
              f"{n} falas -> {os.path.relpath(OUT_PREVIA, C.REPO)}")
    sem = unlocated_places(citacoes, gazetteer)
    if sem:
        print(f"  {len(sem)} lugares citados ainda sem coordenada: {'; '.join(sem)}")


if __name__ == "__main__":
    main()
