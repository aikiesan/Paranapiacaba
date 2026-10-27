"""Tests for build_lugares_memoria (synthetic rows only — never real quotes).

Run:  python -m unittest test_build_lugares_memoria   (from scripts/)
"""
import json
import unittest

from build_lugares_memoria import apply_pause, build_features, unlocated_places

GAZ = [
    {"lugar": "Lugar A", "lat": "-23.78", "lon": "-46.30", "precisao": "exata", "fonte_coord": "teste"},
    {"lugar": "Lugar B", "lat": "", "lon": "", "precisao": "pendente", "fonte_coord": ""},
    {"lugar": "Lugar C", "lat": "-23.79", "lon": "-46.31", "precisao": "pendente", "fonte_coord": ""},
    {"lugar": "Lugar D", "lat": "-23.80", "lon": "-46.32", "precisao": "aproximada", "fonte_coord": "teste"},
]


def row(i, lugar, publicavel, tema="outro"):
    return {"id": f"T{i}", "fonte": "fonte teste", "falante": "falante teste",
            "timestamp": "00:00", "citacao": f"fala sintética {i}", "lugar": lugar,
            "tema": tema, "publicavel": publicavel}


class BuildLugaresMemoria(unittest.TestCase):
    def test_nothing_approved_gives_empty_collection(self):
        fc = build_features([row(1, "Lugar A", "revisar"), row(2, "Lugar A", "não")], GAZ)
        self.assertEqual(fc, {"type": "FeatureCollection", "features": []})

    def test_only_sim_is_published(self):
        fc = build_features([row(1, "Lugar A", "sim"), row(2, "Lugar A", "revisar"),
                             row(3, "Lugar A", " SIM ")], GAZ)
        ids = [f["id"] for f in fc["features"][0]["properties"]["falas"]]
        self.assertEqual(ids, ["T1", "T3"])

    def test_pending_or_blank_coordinates_are_skipped(self):
        fc = build_features([row(1, "Lugar B", "sim"), row(2, "Lugar C", "sim"),
                             row(3, "Lugar inexistente", "sim")], GAZ)
        self.assertEqual(fc["features"], [])

    def test_multi_place_quote_attaches_to_each_located_place(self):
        fc = build_features([row(1, "Lugar A; Lugar B; Lugar D", "sim", "mata_ranchos")], GAZ)
        names = [f["properties"]["nome"] for f in fc["features"]]
        self.assertEqual(names, ["Lugar A", "Lugar D"])
        a = fc["features"][0]
        self.assertEqual(a["geometry"], {"type": "Point", "coordinates": [-46.3, -23.78]})
        self.assertEqual(a["properties"]["temas"], ["mata_ranchos"])
        self.assertEqual(a["properties"]["n_falas"], 1)

    def test_unknown_theme_falls_back_to_outro(self):
        fc = build_features([row(1, "Lugar A", "sim", "tema_inventado")], GAZ)
        self.assertEqual(fc["features"][0]["properties"]["falas"][0]["tema"], "outro")

    def test_speakers_become_stable_pseudonyms(self):
        rows = [row(1, "Lugar A", "revisar"), row(2, "Lugar A", "sim"), row(3, "Lugar A", "sim")]
        rows[0]["falante"], rows[1]["falante"], rows[2]["falante"] = "Fulano", "Beltrana", "Fulano"
        falas = build_features(rows, GAZ)["features"][0]["properties"]["falas"]
        # Numbered by first appearance in the CSV, approved or not.
        self.assertEqual([f["falante"] for f in falas], ["Depoente 02", "Depoente 01"])
        self.assertNotIn("Fulano", str(falas))

    def test_listed_names_are_redacted_everywhere(self):
        gaz = GAZ + [{"lugar": "Casa do seu Fulano", "lat": "-23.7", "lon": "-46.3",
                      "precisao": "exata", "fonte_coord": "perto do bar de Fulano"}]
        r = row(1, "Casa do seu Fulano", "sim")
        r["citacao"], r["fonte"] = "ia na casa do seu Fulano, o FULANO sabia", "notas de Sicrano"
        nomes = [{"nome": "Fulano", "substituto": "[morador]"},
                 {"nome": "seu Fulano", "substituto": "[um morador]"},
                 {"nome": "Sicrano", "substituto": "equipe"}]
        props = build_features([r], gaz, nomes)["features"][0]["properties"]
        self.assertEqual(props["nome"], "Casa do [um morador]")
        self.assertEqual(props["falas"][0]["citacao"], "ia na casa do [um morador], o [morador] sabia")
        self.assertEqual(props["falas"][0]["fonte"], "notas de equipe")
        self.assertNotIn("Fulano", json.dumps(props, ensure_ascii=False))

    def test_places_match_aliases_ignoring_case_and_accents(self):
        osm = [{"lugar": "Clube Exemplo", "apelidos": "Lyra; Salão Antigo", "lat": "-23.77",
                "lon": "-46.29", "precisao": "exata", "fonte_coord": "OpenStreetMap"}]
        fc = build_features([row(1, "lyra", "sim"), row(2, "SALAO antigo; Clube Exemplo", "sim")], osm)
        self.assertEqual([f["properties"]["nome"] for f in fc["features"]], ["Clube Exemplo"])
        self.assertEqual([f["id"] for f in fc["features"][0]["properties"]["falas"]], ["T1", "T2"])

    def test_team_coordinate_wins_over_osm_and_osm_fills_pending(self):
        osm = [{"lugar": "Lugar A", "apelidos": "", "lat": "-23.0", "lon": "-46.0",
                "precisao": "exata", "fonte_coord": "OpenStreetMap"},
               {"lugar": "Lugar B", "apelidos": "", "lat": "-23.5", "lon": "-46.5",
                "precisao": "exata", "fonte_coord": "OpenStreetMap"}]
        fc = build_features([row(1, "Lugar A; Lugar B", "sim")], GAZ + osm)
        coords = {f["properties"]["nome"]: f["geometry"]["coordinates"] for f in fc["features"]}
        self.assertEqual(coords, {"Lugar A": [-46.3, -23.78], "Lugar B": [-46.5, -23.5]})

    def test_video_link_and_iphan_category_are_kept(self):
        r = row(1, "Lugar A", "sim")
        r["url"], r["categoria"] = "https://www.youtube.com/watch?v=teste", "saberes"
        r2 = row(2, "Lugar A", "sim")
        r2["url"], r2["categoria"] = "http://inseguro.example", "categoria_inventada"
        props = build_features([r, r2], GAZ)["features"][0]["properties"]
        self.assertEqual(props["falas"][0]["url"], "https://www.youtube.com/watch?v=teste")
        self.assertEqual(props["falas"][0]["categoria"], "saberes")
        self.assertNotIn("url", props["falas"][1])
        self.assertNotIn("categoria", props["falas"][1])
        self.assertEqual(props["categorias"], ["saberes"])

    def test_previa_includes_quotes_not_yet_approved(self):
        rows = [row(1, "Lugar A", "revisar"), row(2, "Lugar A", "não")]
        self.assertEqual(build_features(rows, GAZ)["features"], [])
        falas = build_features(rows, GAZ, previa=True)["features"][0]["properties"]["falas"]
        self.assertEqual([f["id"] for f in falas], ["T1", "T2"])

    def test_unlocated_places_are_reported(self):
        rows = [row(1, "Lugar A; Lugar B", "revisar"), row(2, "Lugar novo", "sim")]
        self.assertEqual(unlocated_places(rows, GAZ), ["Lugar B", "Lugar novo"])

    def test_paused_layer_publishes_nothing(self):
        fc = build_features([row(1, "Lugar A", "sim")], GAZ)
        self.assertEqual(len(fc["features"]), 1)
        self.assertEqual(apply_pause(fc, publicar=False), {"type": "FeatureCollection", "features": []})
        self.assertIs(apply_pause(fc, publicar=True), fc)


if __name__ == "__main__":
    unittest.main()
