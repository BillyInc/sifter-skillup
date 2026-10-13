import json
import subprocess
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = HERE / "D045_D084_parent_domain_review_worklist.json"
REVIEW = HERE / "D051_role_domain_fit_review_2026_10_05.json"
SCRIPT = HERE / "review_d051_real_estate_roles.py"


class D051RoleFitReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        subprocess.run([sys.executable, str(SCRIPT)], check=True, cwd=HERE)
        cls.worklist = json.loads(WORKLIST.read_text(encoding="utf-8"))
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_current_d051_key_coverage(self):
        expected = {r["role_key"] for r in self.worklist["role_mappings"] if r["domain_id"] == "D051"}
        actual = [d["role_key"] for d in self.review["decisions"]]
        self.assertEqual(len(expected), 8)
        self.assertEqual(len(actual), len(set(actual)))
        self.assertEqual(set(actual), expected)

    def test_statuses_and_counts(self):
        c = self.review["counts"]
        self.assertEqual((c["supported"], c["unsupported"], c["conditional"], c["unresolved"]), (2, 6, 0, 0))
        self.assertEqual(sum(c[k] for k in ("supported", "conditional", "unsupported", "unresolved")), 8)

    def test_roles_fit_by_task_not_adjoining_finance_terms(self):
        status = {d["role_name"]: d["domain_fit_status"] for d in self.review["decisions"]}
        self.assertEqual(status["facilities manager"], "supported")
        self.assertEqual(status["mortgage broker"], "supported")
        for role in ("business valuer", "cultural facilities manager", "financial broker", "foreign exchange broker", "insurance broker", "intellectual property consultant"):
            self.assertEqual(status[role], "unsupported")

    def test_every_row_is_auditable_and_no_canonical_edit_is_claimed(self):
        self.assertEqual(self.review["canonical_changes"], 0)
        self.assertFalse(self.review["canonical_correction_ready"])
        for d in self.review["decisions"]:
            with self.subTest(role=d["role_key"]):
                self.assertTrue(d["task_evidence"].strip())
                self.assertTrue(d["basis"].strip())
                self.assertTrue(d["source_limit"].strip())
                self.assertTrue(all(r.startswith(("https://", "http://")) for r in d["source_refs"]))


if __name__ == "__main__":
    unittest.main()
