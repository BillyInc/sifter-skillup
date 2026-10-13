import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent
QUEUE=HERE/"D045_D084_parent_domain_review_worklist.json"
REVIEW=HERE/"D055_role_domain_fit_review_2026_10_05.json"
SCRIPT=HERE/"review_d055_chemical_engineering_roles.py"

class D055Tests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable,str(SCRIPT)],check=True,cwd=HERE)
        cls.queue=json.loads(QUEUE.read_text(encoding="utf-8"))
        cls.review=json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_queue_coverage(self):
        expected={r["role_key"] for r in self.queue["role_mappings"] if r["domain_id"]=="D055"}
        actual=[d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected),3)
        self.assertEqual(set(actual),expected)
        self.assertEqual(len(actual),len(set(actual)))

    def test_all_supported_and_counted(self):
        self.assertEqual(self.review["counts"],{"reviewed_role_mappings":3,"supported":3,"conditional":0,"unsupported":0,"unresolved":0})

    def test_sources_and_rationales_present(self):
        for d in self.review["decisions"]:
            self.assertTrue(d["task_evidence"])
            self.assertTrue(d["basis"])
            self.assertTrue(d["source_limit"])
            self.assertTrue(any("icheme.org" in u for u in d["source_refs"]))

    def test_no_canonical_write_claimed(self):
        self.assertEqual(self.review["canonical_changes"],0)
        self.assertFalse(self.review["canonical_correction_ready"])

if __name__=="__main__": unittest.main()
