"""Tests for build_lugares_memoria (synthetic rows only — never real quotes).

Run:  python -m unittest test_build_lugares_memoria   (from scripts/)
"""
import unittest

from build_lugares_memoria import build_features

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


if __name__ == "__main__":
    unittest.main()
