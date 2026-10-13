import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = HERE / "D045_D084_parent_domain_review_worklist.json"
REVIEW = HERE / "D059_role_domain_fit_review_2026_10_05.json"
SCRIPT = HERE / "review_d059_space_systems_roles.py"


class D059SpaceSystemsRoleFitTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(SCRIPT)], check=True, cwd=HERE)
        cls.queue = json.loads(QUEUE.read_text(encoding="utf-8"))
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_worklist_coverage(self):
        expected = {r["role_key"] for r in self.queue["role_mappings"] if r["domain_id"] == "D059"}
        actual = [d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected), 11)
        self.assertEqual(set(actual), expected)
        self.assertEqual(len(actual), len(set(actual)))

    def test_space_task_boundary(self):
        statuses = {d["role_name"]: d["domain_fit_status"] for d in self.review["decisions"]}
        self.assertEqual(self.review["counts"]["supported"], 4)
        self.assertEqual(self.review["counts"]["conditional"], 6)
        self.assertEqual(self.review["counts"]["unsupported"], 1)
        self.assertEqual(statuses["satellite engineer"], "supported")
        self.assertEqual(statuses["telecommunications engineer"], "conditional")
        self.assertEqual(statuses["avionics inspector"], "unsupported")

    def test_evidence_and_no_canonical_change(self):
        self.assertEqual(self.review["canonical_changes"], 0)
        for d in self.review["decisions"]:
            self.assertTrue(d["task_evidence"])
            self.assertTrue(d["basis"])
            self.assertTrue(d["source_refs"])
            self.assertTrue(d["source_limit"])


if __name__ == "__main__":
    unittest.main()
