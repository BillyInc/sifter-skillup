import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_001_d001_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D001UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.decisions = json.loads(DECISIONS.read_text(encoding="utf-8"))["decisions"]
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {
            f"{row['domain_id']}|{row['role_name']}": row for row in cls.roles
        }

    def test_batch_is_exactly_the_current_unsupported_d001_slice(self):
        current_d001 = {
            row["role_key"] for row in self.queue if row["domain_id"] == "D001"
        }
        recommended = {row["role_key"] for row in self.decisions}
        self.assertEqual(len(current_d001), 5)
        self.assertEqual(recommended, current_d001)
        self.assertEqual(len(self.decisions), len(recommended))

    def test_all_source_keys_still_exist_with_task_text(self):
        for decision in self.decisions:
            row = self.role_by_key.get(decision["role_key"])
            self.assertIsNotNone(row, decision["role_key"])
            self.assertTrue(row.get("description", "").strip(), decision["role_key"])
            self.assertTrue(decision["task_evidence"].strip())
            self.assertTrue(decision["evidence_refs"])

    def test_reclassification_targets_are_current_domains_and_absent_exact_keys(self):
        for decision in self.decisions:
            target = decision.get("alternative_exact_key")
            if not target:
                continue
            target_domain = target.split("|", 1)[0]
            self.assertIn(target_domain, self.domains)
            self.assertEqual(decision["alternative_target_currently_exists"], target in self.role_by_key)
            self.assertNotEqual(target_domain, "D001")

    def test_removal_is_link_only_and_preserves_listed_other_links(self):
        for decision in self.decisions:
            if decision["recommendation"] != "remove_link_only":
                continue
            self.assertIsNone(decision["alternative_exact_key"])
            for untouched_key in decision["other_current_parent_links_not_adjudicated_here"]:
                self.assertIn(untouched_key, self.role_by_key)

    def test_global_only_and_no_canonical_writes(self):
        doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        self.assertEqual(doc["jurisdiction"], "global_only")
        self.assertFalse(doc["canonical_changes_applied"])
        self.assertTrue(all(d["current_key_verified"] for d in self.decisions))


if __name__ == "__main__":
    unittest.main()
