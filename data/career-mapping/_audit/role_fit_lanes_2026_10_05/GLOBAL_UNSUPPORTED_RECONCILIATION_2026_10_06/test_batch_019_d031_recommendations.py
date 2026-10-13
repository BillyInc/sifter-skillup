import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_019_d031_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D031UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{r['domain_id']}|{r['role_name']}": r for r in cls.roles}

    def test_batch_matches_all_active_unsupported_d031_keys(self):
        expected = {x["role_key"] for x in self.queue if x["domain_id"] == "D031"} & set(self.role_by_key)
        self.assertEqual(len(expected), 15)
        self.assertEqual({x["role_key"] for x in self.doc["decisions"]}, expected)

    def test_task_evidence_and_targets_match_current_inventory(self):
        for d in self.doc["decisions"]:
            self.assertIn(d["role_key"], self.role_by_key)
            self.assertTrue(self.role_by_key[d["role_key"]].get("description", "").strip())
            self.assertTrue(d["task_evidence"] and d["source_refs"])
            target = d.get("alternative_exact_key")
            if target:
                self.assertEqual(d["recommendation"], "reclassify_exact")
                self.assertIn(target.split("|", 1)[0], self.domains)
                self.assertEqual(d["alternative_target_currently_exists"], target in self.role_by_key)
            else:
                self.assertEqual(d["recommendation"], "retain_supported")

    def test_commodity_trader_false_positive_is_retained(self):
        d = next(x for x in self.doc["decisions"] if x["role_key"] == "D031|commodity trader")
        self.assertEqual(d["recommendation"], "retain_supported")
        self.assertIn("explicitly includes commodity trading", d["rationale"])

    def test_global_only_no_canonical_edits(self):
        self.assertEqual(self.doc["jurisdiction"], "global_only")
        self.assertFalse(self.doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
