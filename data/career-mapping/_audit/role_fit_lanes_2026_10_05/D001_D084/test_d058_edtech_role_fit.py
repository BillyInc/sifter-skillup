import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = HERE / "D045_D084_parent_domain_review_worklist.json"
REVIEW = HERE / "D058_role_domain_fit_review_2026_10_05.json"
SCRIPT = HERE / "review_d058_edtech_roles.py"


class D058EdTechRoleFitTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(SCRIPT)], check=True, cwd=HERE)
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_worklist_coverage(self):
        expected = {r["role_key"] for r in self.queue["role_mappings"] if r["domain_id"] == "D058"}
        actual = [d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected), 20)
        self.assertEqual(set(actual), expected)
        self.assertEqual(len(actual), len(set(actual)))

    def test_task_based_counts(self):
        statuses = {d["role_name"]: d["domain_fit_status"] for d in self.review["decisions"]}
        self.assertEqual(self.review["counts"]["supported"], 2)
        self.assertEqual(self.review["counts"]["conditional"], 1)
        self.assertEqual(self.review["counts"]["unsupported"], 17)
        self.assertEqual(statuses["digital literacy teacher"], "supported")
        self.assertEqual(statuses["ICT trainer"], "supported")
        self.assertEqual(statuses["corporate trainer"], "conditional")
        self.assertEqual(statuses["biology teacher secondary school"], "unsupported")

    def test_evidence_and_no_shared_taxonomy_mutation(self):
        self.assertEqual(self.review["canonical_changes"], 0)
        self.assertFalse(self.review["canonical_correction_ready"])
        for d in self.review["decisions"]:
            self.assertTrue(d["task_evidence"])
            self.assertTrue(d["basis"])
            self.assertTrue(d["source_refs"])
            self.assertTrue(d["source_limit"])


if __name__ == "__main__":
    unittest.main()
