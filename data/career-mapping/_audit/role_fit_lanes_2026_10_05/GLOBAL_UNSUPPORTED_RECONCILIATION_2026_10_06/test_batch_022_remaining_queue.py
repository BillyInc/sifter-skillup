import json
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DOC = json.loads(
    (HERE / "batch_022_remaining_d085_d168_recommendations.json").read_text(encoding="utf-8")
)
QUEUE = json.loads(
    (
        ROOT
        / "data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_FOLLOWUP_2026_10_06/unsupported_exact_key_review_queue_2026_10_06.json"
    ).read_text(encoding="utf-8")
)["queue"]


class Batch022Tests(unittest.TestCase):
    def test_exact_remaining_queue_is_dispositioned_once(self):
        previous = set()
        for path in HERE.glob("batch_*_*.json"):
            if path.name == "batch_022_remaining_d085_d168_recommendations.json":
                continue
            previous.update(
                row["role_key"]
                for row in json.loads(path.read_text(encoding="utf-8")).get("decisions", [])
                if row.get("role_key")
            )
        expected = {row["role_key"] for row in QUEUE if row["role_key"] not in previous}
        actual = {row["role_key"] for row in DOC["decisions"]}
        self.assertEqual(len(QUEUE), 543)
        self.assertEqual(len(previous), 307)
        self.assertEqual(len(expected), 236)
        self.assertSetEqual(actual, expected)
        self.assertEqual(len(actual), len(DOC["decisions"]))

    def test_action_counts_and_known_reconciliation(self):
        counts = DOC["counts"]["by_action"]
        self.assertEqual(counts, {"remove_link_only": 235, "reclassify_exact": 1})
        transfer = next(row for row in DOC["decisions"] if row["action"] == "reclassify_exact")
        self.assertEqual(transfer["role_key"], "D152|conservation scientist")
        self.assertEqual(transfer["alternative_exact_key"], "D121|conservation scientist")
        self.assertEqual(
            next(row for row in DOC["decisions"] if row["role_key"] == "D085|lottery cashier")["action"],
            "remove_link_only",
        )
        self.assertTrue(
            all(
                next(row for row in DOC["decisions"] if row["role_key"] == key)["action"] == "remove_link_only"
                for key in {
                    "D119|dairy processing technician",
                    "D119|dairy products and edible oils distribution manager",
                    "D119|dairy products maker",
                    "D119|dairy products manufacturing worker",
                    "D119|import export manager in dairy products and edible oils",
                }
            )
        )

    def test_every_row_has_saved_evidence_and_context(self):
        for row in DOC["decisions"]:
            with self.subTest(role_key=row["role_key"]):
                self.assertTrue(row["task_evidence"])
                self.assertTrue(row["domain_scope"])
                self.assertTrue(row["rationale"])
                self.assertTrue(row["evidence_refs"])
                self.assertTrue(row["evidence_artifact"])
                self.assertFalse(row["cross_domain_title_matches_used_as_fit_proof"])
                self.assertFalse(row["isco_or_subgroup_used_as_fit_proof"])
                self.assertFalse(row["role_to_specialization_or_subgroup_decision"])
                self.assertFalse(row["canonical_changes_applied"])

    def test_batch_scope_and_no_canonical_mutation_claim(self):
        self.assertEqual(DOC["batch"], 22)
        self.assertEqual(DOC["jurisdiction"], "global_only")
        self.assertFalse(DOC["canonical_changes_applied"])
        self.assertEqual(DOC["counts"]["remaining_decisions"], 236)


if __name__ == "__main__":
    unittest.main()
