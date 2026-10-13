import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]


class D001RoleFitLaneTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads((HERE / "D001_reviewed_decisions.json").read_text(encoding="utf-8"))
        cls.inventory = json.loads((HERE / "D001_D084_inventory_and_triage.json").read_text(encoding="utf-8"))

    def test_d001_covers_exact_37_role_mappings(self):
        rows = self.report["D001_reviews"]
        d001 = [row for row in self.inventory["records"] if row.get("domain_id") == "D001"]
        self.assertEqual(len(rows), 37)
        self.assertEqual({row["role_key"] for row in rows}, {row["role_key"] for row in d001})

    def test_domain_and_specialization_are_separately_disposed(self):
        for row in self.report["D001_reviews"]:
            review = row["canonical_review_metadata"]
            self.assertIn(review["domain_fit_review_status"], {"supported", "conditional", "unsupported", "unresolved"})
            self.assertIn(review["specialization_fit_review_status"], {"supported", "conditional", "not_applicable", "unresolved"})
            self.assertTrue(review["domain_fit_review_basis"])
            self.assertTrue(review["specialization_fit_review_basis"])
            self.assertTrue(review["domain_fit_review_source_refs"])
            self.assertEqual(review["domain_fit_review_source_refs"], review["specialization_fit_review_source_refs"])

    def test_only_five_unsupported_d001_student_paths_are_excluded(self):
        rows = self.report["D001_reviews"]
        excluded = {
            row["role_key"] for row in rows
            if row["canonical_review_metadata"]["student_path_status"] == "excluded"
        }
        expected = {
            "D001|ICT disaster recovery analyst",
            "D001|Information Technology Project Managers",
            "D001|Video Game Designers",
            "D001|cloud identity manager",
            "D001|web content manager",
        }
        self.assertEqual(excluded, expected)
        self.assertEqual(self.report["counts"]["d001_unsupported_student_paths_excluded"], 5)

    def test_reconciles_catalogue_and_preserves_d119_without_repeating_review(self):
        counts = self.report["counts"]
        self.assertEqual(counts["all_canonical_mappings"], 3919)
        self.assertEqual(counts["pre_lane_generated_mappings_without_explicit_semantic_status"], 3914)
        self.assertEqual(counts["D119_prior_ledger_rows_reconciled"], 20)
        self.assertEqual(counts["D119_domain_and_specialization_decisions_present"], 20)
        self.assertEqual(counts["D001_D084_remaining_without_individual_review"], 2169)
        self.assertEqual(counts["D085_D168_excluding_D119_remaining"], 1693)
        self.assertEqual(37 + 2169 + 1693 + 20, 3919)
        self.assertFalse(self.report["D119_reconciliation"]["review_repeated"])
        self.assertEqual(self.report["D119_reconciliation"]["ledger_key_mismatches"], 0)


if __name__ == "__main__":
    unittest.main()
