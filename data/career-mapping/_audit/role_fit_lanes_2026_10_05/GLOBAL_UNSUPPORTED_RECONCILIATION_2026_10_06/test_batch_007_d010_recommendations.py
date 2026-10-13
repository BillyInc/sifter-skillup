import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_007_d010_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D010UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.decisions = cls.doc["decisions"]
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{r['domain_id']}|{r['role_name']}": r for r in cls.roles}

    def test_batch_is_exactly_the_active_unsupported_d010_slice(self):
        expected = {x["role_key"] for x in self.queue if x["domain_id"] == "D010"}
        self.assertEqual(len(expected), 9)
        self.assertEqual({x["role_key"] for x in self.decisions}, expected)

    def test_exact_source_records_and_task_evidence_exist(self):
        for x in self.decisions:
            self.assertIn(x["role_key"], self.role_by_key)
            self.assertTrue(self.role_by_key[x["role_key"]].get("description", "").strip())
            self.assertTrue(x["task_evidence"])
            self.assertTrue(x["source_refs"])

    def test_reclassification_targets_are_exact_and_domain_valid(self):
        for x in self.decisions:
            target = x.get("alternative_exact_key")
            if target is None:
                self.assertIn(x["recommendation"], {"remove_link_only", "preserve_exclude", "unresolved"})
                continue
            self.assertEqual(x["recommendation"], "reclassify_exact")
            self.assertIn(target.split("|", 1)[0], self.domains)
            self.assertEqual(x["alternative_target_currently_exists"], target in self.role_by_key)

    def test_conditional_existing_destination_is_not_upgraded(self):
        d = next(x for x in self.decisions if x["role_key"] == "D010|ICT system tester")
        self.assertEqual(d["alternative_exact_key"], "D001|ICT system tester")
        self.assertEqual(d["target_domain_fit_status"], "conditional")

    def test_new_destination_is_explicitly_only_a_recommendation(self):
        d = next(x for x in self.decisions if x["role_key"] == "D010|Project Management Specialists")
        self.assertEqual(d["alternative_exact_key"], "D032|Project Management Specialists")
        self.assertFalse(d["alternative_target_currently_exists"])
        self.assertIn("not a canonical edit", d["rationale"])

    def test_global_only_no_canonical_edits(self):
        self.assertEqual(self.doc["jurisdiction"], "global_only")
        self.assertFalse(self.doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
