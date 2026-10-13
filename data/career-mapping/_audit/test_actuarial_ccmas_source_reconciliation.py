import importlib.util
import json
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("repair_actuarial_ccmas_source_2026_09_26.py")
SPEC = importlib.util.spec_from_file_location("actuarial_ccmas_repair", SCRIPT)
repair = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(repair)


class ActuarialCcmasSourceReconciliationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.after = json.loads(repair.SOURCE.read_text(encoding="utf-8"))
        cls.programme = next(p for p in cls.after["programmes"] if p["code"] == "ACS")
        cls.courses = {c["code"]: c for c in cls.programme["courses"] if c["code"].startswith("ACS ")}

    def test_exact_official_actuarial_course_code_inventory_and_titles(self):
        self.assertCountEqual(self.courses, repair.CORRECTIONS)
        self.assertEqual(len(self.courses), len(repair.CORRECTIONS))
        for code, expected in repair.CORRECTIONS.items():
            with self.subTest(code=code):
                course = self.courses[code]
                self.assertEqual(course["title"], expected["title"])
                self.assertEqual(course["content_summary"], expected["summary"])
                self.assertEqual(course["skills_learned"], expected["outcomes"])
                self.assertEqual(course["source_url"], repair.SOURCE_URL)
                self.assertIn(expected["pages"], course["source_locator"])
                self.assertEqual(course["source_accessed_on"], repair.ACCESS_DATE)

    def test_course_code_303_and_309_are_replaced_by_official_310_and_311(self):
        self.assertNotIn("ACS 303", self.courses)
        self.assertNotIn("ACS 309", self.courses)
        self.assertIn("ACS 310", self.courses)
        self.assertIn("ACS 311", self.courses)

    def test_unrelated_programmes_unchanged_from_preserved_pre_repair_snapshot(self):
        snapshot_path = repair.ROOT / "data/career-mapping/_audit/acc_ccmas_source_before_2026-09-25/administration_management.json"
        snapshot = json.loads(snapshot_path.read_text(encoding="utf-8"))
        before = {p["code"]: p for p in snapshot["programmes"]}
        after = {p["code"]: p for p in self.after["programmes"]}
        for code, previous in before.items():
            if code in {"ACC", "ACS"}:
                continue
            with self.subTest(programme=code):
                self.assertEqual(previous, after[code])


if __name__ == "__main__":
    unittest.main()
