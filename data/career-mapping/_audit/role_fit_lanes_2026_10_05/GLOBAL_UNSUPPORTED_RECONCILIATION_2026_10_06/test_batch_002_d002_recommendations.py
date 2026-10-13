import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_002_d002_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D002UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.decisions = json.loads(DECISIONS.read_text(encoding="utf-8"))["decisions"]
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{row['domain_id']}|{row['role_name']}": row for row in cls.roles}

    def test_batch_covers_exact_current_unsupported_d002_slice(self):
        expected = {row["role_key"] for row in self.queue if row["domain_id"] == "D002"}
        actual = {row["role_key"] for row in self.decisions}
        self.assertEqual(len(expected), 8)
        self.assertEqual(actual, expected)
        self.assertEqual(len(actual), len(self.decisions))

    def test_exact_keys_exist_with_task_evidence_and_source(self):
        for row in self.decisions:
            current = self.role_by_key.get(row["role_key"])
            self.assertIsNotNone(current, row["role_key"])
            self.assertTrue(current.get("description", "").strip())
            self.assertTrue(row["task_evidence"].strip())
            self.assertTrue(row["source_refs"])

    def test_exclusions_do_not_reclassify_or_delete_roles(self):
        for row in self.decisions:
            self.assertEqual(row["recommendation"], "preserve_exclude")
            self.assertIsNone(row["alternative_exact_key"])
            rationale = row["rationale"].casefold()
            self.assertTrue("exclude" in rationale or "do not expose" in rationale)
            for peer in row["same_title_other_parent_keys_unadjudicated"]:
                self.assertIn(peer, self.role_by_key)

    def test_domain_scope_is_live_and_batch_is_global_only(self):
        d002 = self.domains["D002"]
        self.assertEqual(d002["domain_name"], "Data Engineering and Architecture")
        self.assertIn("collect, store and move", d002["description"])
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        self.assertEqual(doc["jurisdiction"], "global_only")
        self.assertFalse(doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
