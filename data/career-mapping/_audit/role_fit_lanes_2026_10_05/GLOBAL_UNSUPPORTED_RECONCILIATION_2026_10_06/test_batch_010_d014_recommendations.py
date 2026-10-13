import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_010_d014_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D014UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{r['domain_id']}|{r['role_name']}": r for r in cls.roles}

    def test_batch_matches_all_active_unsupported_d014_keys(self):
        expected = {x["role_key"] for x in self.queue if x["domain_id"] == "D014"} & set(self.role_by_key)
        self.assertEqual(expected, {x["role_key"] for x in self.doc["decisions"]})
        self.assertEqual(len(expected), 2)

    def test_role_tasks_and_reclassification_destinations_are_exact(self):
        for d in self.doc["decisions"]:
            self.assertIn(d["role_key"], self.role_by_key)
            self.assertTrue(self.role_by_key[d["role_key"]].get("description", "").strip())
            self.assertTrue(d["task_evidence"] and d["source_refs"])
            self.assertEqual(d["recommendation"], "reclassify_exact")
            domain_id = d["alternative_exact_key"].split("|", 1)[0]
            self.assertIn(domain_id, self.domains)
            self.assertEqual(d["alternative_target_currently_exists"], d["alternative_exact_key"] in self.role_by_key)

    def test_unsupported_parent_removal_is_link_only(self):
        self.assertFalse(self.doc["canonical_changes_applied"])
        self.assertEqual(self.doc["jurisdiction"], "global_only")


if __name__ == "__main__":
    unittest.main()
