import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent
QUEUE=HERE/"D045_D084_parent_domain_review_worklist.json"
REVIEW=HERE/"D056_role_domain_fit_review_2026_10_05.json"
SCRIPT=HERE/"review_d056_blockchain_roles.py"

class D056BlockchainRoleFitTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable,str(SCRIPT)],check=True,cwd=HERE)
        cls.queue=json.loads(QUEUE.read_text(encoding="utf-8"))
        cls.review=json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_worklist_coverage(self):
        expected={r["role_key"] for r in self.queue["role_mappings"] if r["domain_id"]=="D056"}
        actual=[d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected),25)
        self.assertEqual(set(actual),expected)
        self.assertEqual(len(actual),len(set(actual)))

    def test_only_explicit_blockchain_tasks_are_supported(self):
        status={d["role_name"]:d["domain_fit_status"] for d in self.review["decisions"]}
        self.assertEqual(status["blockchain architect"],"supported")
        self.assertEqual(status["blockchain developer"],"supported")
        self.assertEqual(sum(v=="supported" for v in status.values()),2)
        self.assertEqual(sum(v=="conditional" for v in status.values()),23)

    def test_conditional_roles_have_blockchain_specific_gate(self):
        for d in self.review["decisions"]:
            if d["domain_fit_status"]=="conditional":
                self.assertTrue(d["conditional_scope"])
                self.assertIn("without_blockchain_specific_assignment_evidence",d["recommended_action"])

    def test_evidence_and_no_canonical_change(self):
        self.assertEqual(self.review["canonical_changes"],0)
        self.assertFalse(self.review["canonical_correction_ready"])
        for d in self.review["decisions"]:
            self.assertTrue(d["task_evidence"])
            self.assertTrue(d["basis"])
            self.assertTrue(d["source_limit"])
            self.assertTrue(d["source_refs"])
            self.assertTrue(any("nist.gov" in u for u in d["source_refs"]))

if __name__=="__main__":unittest.main()
