import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = HERE / "D045_D084_parent_domain_review_worklist.json"
REVIEW = HERE / "D057_role_domain_fit_review_2026_10_05.json"
SCRIPT = HERE / "review_d057_digital_health_roles.py"


class D057DigitalHealthRoleFitTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(SCRIPT)], check=True, cwd=HERE)
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_worklist_coverage(self):
        expected = {r["role_key"] for r in self.queue["role_mappings"] if r["domain_id"] == "D057"}
        actual = [d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected), 14)
        self.assertEqual(set(actual), expected)
        self.assertEqual(len(actual), len(set(actual)))

    def test_counts_and_boundary_cases(self):
        statuses = {d["role_name"]: d["domain_fit_status"] for d in self.review["decisions"]}
        self.assertEqual(self.review["counts"]["supported"], 7)
        self.assertEqual(self.review["counts"]["conditional"], 6)
        self.assertEqual(self.review["counts"]["unsupported"], 1)
        self.assertEqual(statuses["waiting list coordinator"], "unsupported")
        self.assertEqual(statuses["healthcare institution manager"], "conditional")
        self.assertEqual(statuses["clinical coder"], "supported")

    def test_conditional_entries_are_gated_and_sources_are_present(self):
        for decision in self.review["decisions"]:
            self.assertTrue(decision["task_evidence"])
            self.assertTrue(decision["basis"])
            self.assertTrue(decision["source_refs"])
            self.assertTrue(decision["source_limit"])
            if decision["domain_fit_status"] == "conditional":
                self.assertIn("do_not_present_as_confirmed", decision["recommended_action"])

    def test_no_canonical_changes_or_specialization_review(self):
        self.assertEqual(self.review["canonical_changes"], 0)
        self.assertFalse(self.review["canonical_correction_ready"])
        self.assertIn("No subgroup", self.review["scope"])


if __name__ == "__main__":
    unittest.main()
