import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
ROLE_FILE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
SEED_BUILDER = ROOT / "data/career-mapping/_gen_career_seed.py"
TARGET_ROLES = {"mathematician", "historian", "biometrician"}


class D078UnsupportedRoleRouteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.roles = json.loads(ROLE_FILE.read_text(encoding="utf-8"))
        cls.by_domain_and_name = {
            (row.get("domain_id"), row.get("role_name", "").casefold()): row
            for row in cls.roles
        }

    def test_all_three_d078_paths_are_excluded_with_source_review(self):
        for name in sorted(TARGET_ROLES):
            with self.subTest(role=name):
                row = self.by_domain_and_name[("D078", name)]
                self.assertEqual(row.get("student_path_status"), "excluded")
                self.assertEqual(row.get("domain_fit_review_status"), "unsupported")
                self.assertEqual(row.get("role_domain_reconciliation_status"), "remove_link_only")
                self.assertTrue(row.get("domain_fit_review_source_refs"))
                self.assertEqual(row.get("role_area_routes"), [])

    def test_supported_existing_destinations_are_preserved(self):
        expected = {
            ("D009", "mathematician"),
            ("D009", "biometrician"),
            ("D010", "mathematician"),
            ("D011", "mathematician"),
            ("D014", "mathematician"),
        }
        for key in expected:
            with self.subTest(route=key):
                row = self.by_domain_and_name[key]
                self.assertNotEqual(row.get("student_path_status"), "excluded")
                self.assertEqual(row.get("domain_fit_review_status"), "supported")
                self.assertTrue(row.get("domain_fit_review_source_refs"))

    def test_historian_has_no_other_destination_path(self):
        historian_rows = [row for row in self.roles if row.get("role_name", "").casefold() == "historian"]
        self.assertEqual([row.get("domain_id") for row in historian_rows], ["D078"])

    def test_seed_generator_filters_excluded_role_paths(self):
        source = SEED_BUILDER.read_text(encoding="utf-8")
        self.assertIn('str(role.get("student_path_status") or "active").casefold() != "excluded"', source)


if __name__ == "__main__":
    unittest.main()
