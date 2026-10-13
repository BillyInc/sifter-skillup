import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_003_d005_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D005UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{row['domain_id']}|{row['role_name']}": row for row in cls.roles}

    def test_exact_current_and_stale_keys_are_separated(self):
        self.assertEqual(len([x for x in self.queue if x["domain_id"] == "D005"]), 2)
        decision = self.doc["decisions"][0]
        stale = self.doc["stale_queue_keys"][0]
        self.assertIn(decision["role_key"], self.role_by_key)
        self.assertNotIn(stale["role_key"], self.role_by_key)
        self.assertFalse(stale["current_key_verified"])

    def test_reclassification_is_task_based_and_preserves_valid_software_parent(self):
        decision = self.doc["decisions"][0]
        self.assertEqual(decision["recommendation"], "reclassify_exact")
        self.assertEqual(decision["alternative_exact_key"], "D006|IoT developer")
        self.assertNotIn("D006|IoT developer", self.role_by_key)
        self.assertIn("D001|IoT developer", self.role_by_key)
        self.assertIn("D001|IoT developer", decision["retain_other_parent_links"])
        self.assertTrue(decision["task_evidence"])
        self.assertTrue(decision["source_refs"])

    def test_no_canonical_change(self):
        self.assertFalse(self.doc["canonical_changes_applied"])
        self.assertEqual(self.doc["jurisdiction"], "global_only")


if __name__ == "__main__":
    unittest.main()
