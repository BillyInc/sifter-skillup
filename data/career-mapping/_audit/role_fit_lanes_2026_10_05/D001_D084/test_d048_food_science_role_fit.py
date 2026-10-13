import json
import subprocess
import sys
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
REVIEW = HERE / "D048_role_domain_fit_review_2026_10_05.json"
SCRIPT = HERE / "review_d048_food_science_roles.py"


class D048RoleFitReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(SCRIPT)], check=True, cwd=HERE)
        cls.worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_current_d048_key_coverage(self):
        expected = {r["role_key"] for r in self.worklist["role_mappings"] if r["domain_id"] == "D048"}
        actual = [d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected), 43)
        self.assertEqual(len(actual), len(set(actual)))
        self.assertEqual(set(actual), expected)

    def test_status_counts_reconcile(self):
        decisions = self.review["decisions"]
        counts = self.review["counts"]
        self.assertEqual(counts["reviewed_role_mappings"], len(decisions))
        self.assertEqual(sum(counts[s] for s in ("supported", "conditional", "unsupported", "unresolved")), len(decisions))
        self.assertEqual((counts["supported"], counts["conditional"], counts["unsupported"], counts["unresolved"]), (39, 3, 1, 0))

    def test_every_row_has_task_basis_and_sources(self):
        for decision in self.review["decisions"]:
            with self.subTest(role=decision["role_key"]):
                self.assertTrue(decision["task_evidence"].strip())
                self.assertTrue(decision["basis"].strip())
                self.assertTrue(decision["source_limit"].strip())
                self.assertTrue(decision["source_refs"])
                self.assertTrue(all(ref.startswith("https://") or ref.startswith("http://") for ref in decision["source_refs"]))

    def test_generic_life_science_is_not_confirmed_by_title(self):
        statuses = {d["role_name"]: d["domain_fit_status"] for d in self.review["decisions"]}
        self.assertEqual(statuses["biochemist"], "conditional")
        self.assertEqual(statuses["bioinformatics scientist"], "conditional")
        self.assertEqual(statuses["geneticist"], "conditional")

    def test_aquaculture_is_flagged_without_inventing_destination(self):
        d = next(x for x in self.review["decisions"] if x["role_name"] == "aquaculture biologist")
        self.assertEqual(d["domain_fit_status"], "unsupported")
        self.assertIn("do_not_infer_destination", d["recommended_action"])

    def test_no_canonical_data_was_changed_by_review(self):
        self.assertEqual(self.review["canonical_changes"], 0)
        self.assertFalse(self.review["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
