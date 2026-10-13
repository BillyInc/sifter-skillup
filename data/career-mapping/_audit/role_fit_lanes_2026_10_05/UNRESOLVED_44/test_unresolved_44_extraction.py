import json
import subprocess
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
REGISTER = HERE / "unresolved_44_parent_fit_register.json"


class Unresolved44ExtractionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(HERE / "extract_unresolved_parent_fit_rows.py")], check=True, cwd=ROOT)
        cls.data = json.loads(REGISTER.read_text(encoding="utf-8"))
        cls.inventory = json.loads((ROOT / "data/career-mapping/_audit/domain_subgroup_role_taxonomy_inventory_2026_10_03.json").read_text(encoding="utf-8"))

    def test_exactly_44_unique_existing_unresolved_keys(self):
        rows = self.data["unresolved_rows"]
        self.assertEqual(44, len(rows))
        self.assertEqual(44, len({row["role_key"] for row in rows}))
        self.assertTrue(all(row["prior_fit_status"] == "unresolved" for row in rows))
        self.assertEqual({row["role_key"] for row in rows}, {row["role_key"] for row in self.inventory["role_mappings"] if row.get("role_to_domain_fit_status") == "unresolved"} | {row["role_key"] for row in rows})

    def test_no_canonical_edits_or_subgroup_fit_inference(self):
        self.assertFalse(self.data["canonical_edits"])
        self.assertTrue(self.data["global_only"])
        for row in self.data["unresolved_rows"]:
            self.assertEqual([], row["source_refs"])
            self.assertIsNone(row["new_disposition"])
            self.assertIn("global_only", row["jurisdiction"])

    def test_each_key_joins_to_the_3919_row_inventory(self):
        keys = {row["role_key"] for row in self.inventory["role_mappings"]}
        self.assertTrue(all(row["role_key"] in keys for row in self.data["unresolved_rows"]))


if __name__ == "__main__":
    unittest.main()
