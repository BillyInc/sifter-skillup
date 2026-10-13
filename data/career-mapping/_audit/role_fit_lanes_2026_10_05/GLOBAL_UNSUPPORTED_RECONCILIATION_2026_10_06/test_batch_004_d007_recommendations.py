import json
from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[5]
HERE = Path(__file__).resolve().parent
DECISIONS = HERE / "batch_004_d007_recommendations.json"
ROLE_SOURCE = ROOT / "data/career-mapping/role_library_v3_cleaned.json"
DOMAIN_SOURCE = ROOT / "data/career-mapping/domain_meta.json"
QUEUE = ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"


class D007UnsupportedDeltaTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.doc = json.loads(DECISIONS.read_text(encoding="utf-8"))
        cls.decisions = cls.doc["decisions"]
        cls.roles = json.loads(ROLE_SOURCE.read_text(encoding="utf-8"))
        cls.domains = json.loads(DOMAIN_SOURCE.read_text(encoding="utf-8"))
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))["queue"]
        cls.role_by_key = {f"{row['domain_id']}|{row['role_name']}": row for row in cls.roles}

    def test_batch_is_exactly_the_current_unsupported_d007_slice(self):
        expected = {row["role_key"] for row in self.queue if row["domain_id"] == "D007"}
        self.assertEqual(len(expected), 4)
        self.assertEqual({row["role_key"] for row in self.decisions}, expected)
        self.assertEqual(len(self.decisions), 4)

    def test_all_current_role_keys_have_descriptions_and_citations(self):
        for row in self.decisions:
            self.assertIn(row["role_key"], self.role_by_key)
            self.assertTrue(self.role_by_key[row["role_key"]].get("description", "").strip())
            self.assertTrue(row["task_evidence"])
            self.assertTrue(row["source_refs"])

    def test_exact_reclassification_targets_match_task_domain_and_existence(self):
        by_key = {row["role_key"]: row for row in self.decisions}
        game = by_key["D007|digital games developer"]
        self.assertEqual(game["alternative_exact_key"], "D139|digital games developer")
        self.assertIn(game["alternative_exact_key"], self.role_by_key)
        self.assertIn("D001|digital games developer", game["untouched_other_parent_links"])
        seo = by_key["D007|search engine optimisation expert"]
        self.assertEqual(seo["alternative_exact_key"], "D030|search engine optimisation expert")
        self.assertNotIn(seo["alternative_exact_key"], self.role_by_key)
        for row in (game, seo):
            target_domain = row["alternative_exact_key"].split("|", 1)[0]
            self.assertIn(target_domain, self.domains)
            self.assertEqual(row["recommendation"], "reclassify_exact")

    def test_removals_are_link_local_and_do_not_assert_peer_validity(self):
        for row in self.decisions:
            if row["recommendation"] == "remove_link_only":
                self.assertIsNone(row["alternative_exact_key"])
                for key in row["untouched_other_parent_links"]:
                    self.assertIn(key, self.role_by_key)

    def test_global_scope_and_no_canonical_writes(self):
        self.assertEqual(self.doc["jurisdiction"], "global_only")
        self.assertFalse(self.doc["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
