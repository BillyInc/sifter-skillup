import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_009_d013_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D013UnsupportedDeltaTests(unittest.TestCase):
    def test_batch_matches_all_active_unsupported_d013_keys(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        present = {f"{r['domain_id']}|{r['role_name']}" for r in roles}
        expected = {x["role_key"] for x in queue if x["domain_id"] == "D013"} & present
        self.assertEqual(len(expected), 4)
        self.assertEqual({x["role_key"] for x in doc["decisions"]}, expected)

    def test_each_removal_is_exact_and_does_not_infer_a_target(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        present = {f"{r['domain_id']}|{r['role_name']}": r for r in roles}
        for d in doc["decisions"]:
            self.assertIn(d["role_key"], present)
            self.assertTrue(present[d["role_key"]].get("description", "").strip())
            self.assertEqual(d["recommendation"], "remove_link_only")
            self.assertIsNone(d["alternative_exact_key"])
            self.assertTrue(d["task_evidence"] and d["source_refs"])

    def test_global_only_no_canonical_edits(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        self.assertEqual(doc["jurisdiction"], "global_only")
        self.assertFalse(doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
