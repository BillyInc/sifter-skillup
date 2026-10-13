import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_005_d008_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D008UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.decisions = cls.doc["decisions"]
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{r['domain_id']}|{r['role_name']}": r for r in cls.roles}

    def test_exact_current_unsupported_d008_coverage(self):
        expected = {x["role_key"] for x in self.queue if x["domain_id"] == "D008"}
        self.assertEqual(len(expected), 2)
        self.assertEqual({x["role_key"] for x in self.decisions}, expected)

    def test_source_records_and_domain_scope_are_current(self):
        self.assertEqual(self.domains["D008"]["domain_name"], "Telecommunications and Network Engineering")
        for x in self.decisions:
            self.assertIn(x["role_key"], self.role_by_key)
            self.assertTrue(self.role_by_key[x["role_key"]].get("description", "").strip())
            self.assertTrue(x["source_refs"])

    def test_link_local_removal_and_global_only(self):
        for x in self.decisions:
            self.assertEqual(x["recommendation"], "remove_link_only")
            self.assertIsNone(x["alternative_exact_key"])
        self.assertEqual(self.doc["jurisdiction"], "global_only")
        self.assertFalse(self.doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
