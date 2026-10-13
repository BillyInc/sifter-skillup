import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_016_d027_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D027UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{r['domain_id']}|{r['role_name']}": r for r in cls.roles}

    def test_batch_matches_all_active_unsupported_d027_keys(self):
        expected = {x["role_key"] for x in self.queue if x["domain_id"] == "D027"} & set(self.role_by_key)
        self.assertEqual(len(expected), 20)
        self.assertEqual({x["role_key"] for x in self.doc["decisions"]}, expected)

    def test_each_exact_source_has_task_evidence_and_valid_outcome(self):
        allowed = {"reclassify_exact", "remove_link_only", "preserve_exclude", "unresolved"}
        for d in self.doc["decisions"]:
            self.assertIn(d["role_key"], self.role_by_key)
            self.assertTrue(self.role_by_key[d["role_key"]].get("description", "").strip())
            self.assertTrue(d["task_evidence"] and d["source_refs"])
            self.assertIn(d["recommendation"], allowed)
            target = d.get("alternative_exact_key")
            if target:
                self.assertEqual(d["recommendation"], "reclassify_exact")
                self.assertIn(target.split("|", 1)[0], self.domains)
                self.assertEqual(d["alternative_target_currently_exists"], target in self.role_by_key)
            else:
                self.assertIn(d["recommendation"], {"remove_link_only", "preserve_exclude", "unresolved"})

    def test_ambiguous_environmental_and_soil_destinations_are_not_guessed(self):
        unresolved = {"D027|environmental programme coordinator", "D027|environmental scientist", "D027|natural resources consultant", "D027|soil scientist"}
        actual = {d["role_key"] for d in self.doc["decisions"] if d["recommendation"] == "preserve_exclude" or "alternate_parent_unresolved" in d["confidence"]}
        self.assertTrue(unresolved <= actual)

    def test_duplicate_d142_links_are_not_recommended_as_destinations(self):
        self.assertTrue(all(not (d.get("alternative_exact_key") or "").startswith("D142|") for d in self.doc["decisions"]))

    def test_global_only_no_canonical_edits(self):
        self.assertEqual(self.doc["jurisdiction"], "global_only")
        self.assertFalse(self.doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
