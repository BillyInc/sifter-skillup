import json
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DOC = json.loads((HERE / "batch_021_d001_d084_lane_carryforward.json").read_text(encoding="utf-8"))
QUEUE = json.loads(
    (ROOT / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json").read_text(encoding="utf-8")
)["queue"]
ROLES = {
    f"{row['domain_id']}|{row['role_name']}": row
    for row in json.loads((ROOT / "data/career-mapping/role_library_v3_cleaned.json").read_text(encoding="utf-8"))
}


class Batch021Tests(unittest.TestCase):
    def test_exact_active_queue_keys_are_carried_once(self):
        previous = set()
        for path in HERE.glob("batch_*_recommendations.json"):
            previous.update(row["role_key"] for row in json.loads(path.read_text(encoding="utf-8"))["decisions"])
        expected = {
            row["role_key"]
            for row in QUEUE
            if int(row["domain_id"][1:]) <= 84 and row["role_key"] not in previous
        }
        actual = {row["role_key"] for row in DOC["decisions"]}
        self.assertEqual(len(expected), 191)
        self.assertSetEqual(actual, expected)
        self.assertEqual(len(actual), len(DOC["decisions"]))

    def test_every_decision_has_lane_evidence_and_no_destination_guess(self):
        for row in DOC["decisions"]:
            with self.subTest(role_key=row["role_key"]):
                self.assertEqual(row["domain_fit_status"], "unsupported")
                self.assertTrue(row["task_evidence"])
                self.assertTrue(row["domain_scope_evidence"])
                self.assertTrue(row["rationale"])
                self.assertTrue(row["evidence_refs"])
                self.assertTrue(row["source_limit"])
                self.assertTrue(row["no_destination_inferred"])
                self.assertIsNone(row["alternative_exact_key"])
                self.assertFalse(row["canonical_changes_applied"])
                self.assertFalse(any("specialization" in key.lower() or "subgroup" in key.lower() for key in row))
                if row["current_key_verified"]:
                    self.assertIn(row["role_key"], ROLES)
                else:
                    self.assertEqual(row["recommendation"], "stale_source_absent_no_active_delta")

    def test_stale_and_live_counts_are_explicit(self):
        self.assertEqual(DOC["counts"]["decisions"], 191)
        self.assertEqual(DOC["counts"]["unsupported"], 191)
        self.assertEqual(DOC["counts"]["remove_link_only"], 148)
        self.assertEqual(DOC["counts"]["preserve_exclude"], 5)
        self.assertEqual(DOC["counts"]["stale_source_absent_no_active_delta"], 38)

    def test_d077_and_d080_discrepancies_are_recorded(self):
        self.assertEqual(
            {row["role_key"] for row in DOC["decisions"] if row["domain_id"] == "D077"},
            {"D077|aircraft marshaller", "D077|game keeper"},
        )
        d080 = next(row for row in DOC["inventory_discrepancies"] if row["domain_id"] == "D080")
        self.assertEqual(d080["current_role_seed_count"], 0)
        self.assertEqual(d080["unsupported_queue_count"], 0)
        self.assertEqual(d080["action"], "hold; no role decision or invented link")

    def test_global_only_and_no_canonical_edits(self):
        self.assertEqual(DOC["jurisdiction"], "global_only")
        self.assertFalse(DOC["canonical_changes_applied"])


if __name__ == "__main__":
    unittest.main()
