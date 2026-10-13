import json
import subprocess
import sys
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
SCRIPT = HERE / "reconcile_role_coverage_candidates.py"
OUT = HERE / "role_coverage_candidate_reconciliation_2026_10_06.json"


class RoleCoverageCandidateReconciliationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        completed = subprocess.run([sys.executable, str(SCRIPT)], check=True, capture_output=True, text=True)
        cls.result = json.loads(completed.stdout)
        cls.doc = json.loads(OUT.read_text(encoding="utf-8"))

    def test_candidate_register_is_complete_and_exact(self):
        self.assertEqual(75, self.result["candidate_count"])
        self.assertEqual(48, self.result["candidate_domains"])
        self.assertEqual(75, len(self.doc["candidates"]))
        self.assertEqual(75, len({row["candidate_key"] for row in self.doc["candidates"]}))

    def test_every_candidate_has_scope_task_and_noncanonical_boundary(self):
        for row in self.doc["candidates"]:
            self.assertTrue(row["parent_domain_scope"].strip() or row["comparison_result"] == "missing_parent_scope_reconciliation")
            self.assertTrue(row["candidate_task_evidence"].strip())
            self.assertTrue(row["residual_reason"].strip())
            self.assertFalse(row["canonical_edit"])
            self.assertFalse(row["subgroup_or_specialization_edit"])

    def test_anchor_selectors_are_exact_and_have_task_text(self):
        for row in self.doc["candidates"]:
            for anchor in row["active_exact_task_comparisons"]:
                self.assertRegex(anchor["role_key"], r"^D[0-9]{3}\|")
                self.assertTrue(anchor["role_task_evidence"].strip())

    def test_zero_domains_and_exact_candidate_closure_are_explicit(self):
        zero = {row["domain_id"] for row in self.doc["candidates"] if row["comparison_result"] == "zero_active_domain_existing_record_reconciliation"}
        self.assertEqual({"D153", "D157"}, zero)
        game = next(row for row in self.doc["candidates"] if row["candidate_key"] == "D139|game_environment_artist_family")
        self.assertEqual("already_active_exact_role_candidate_closed", game["comparison_result"])
        self.assertTrue(any(a["role_key"] == "D139|game environment artist" for a in game["active_exact_task_comparisons"]))

    def test_unsupported_and_unresolved_fit_residuals_are_not_relabelled(self):
        context = self.doc["exact_role_fit_residual_context"]
        self.assertEqual(543, context["unsupported"])
        self.assertEqual(11, context["unresolved"])
        self.assertEqual(44, context["former_unresolved_44_currently_dispositioned"])
        self.assertEqual(0, context["conflicting_terminal_statuses"])


if __name__ == "__main__":
    unittest.main()
