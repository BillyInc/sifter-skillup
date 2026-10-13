from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
WORKLIST = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d084", HERE / "review_d084_payroll_bookkeeping_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D084PayrollBookkeepingRoleFitTests(unittest.TestCase):
    def test_exact_queue_coverage_and_task_evidence(self):
        rows = [row for row in WORKLIST["role_mappings"] if row["domain_id"] == "D084"]
        source = {row["role_key"]: row for row in rows}
        report = MODULE.build()
        self.assertEqual(len(rows), 15)
        self.assertEqual({d["role_key"] for d in report["decisions"]}, set(source))
        for decision in report["decisions"]:
            with self.subTest(key=decision["role_key"]):
                self.assertEqual(decision["task_evidence"], source[decision["role_key"]]["role_task_text"])
                self.assertTrue(decision["basis"])
                self.assertTrue(decision["source_refs"])
                self.assertIn("not establish Nigerian", decision["source_limit"])

    def test_dispositions_and_exact_unsupported_proposals(self):
        report = MODULE.build()
        self.assertEqual(report["counts"], {
            "reviewed_role_mappings": 15,
            "supported": 7,
            "conditional": 4,
            "unsupported": 4,
            "unresolved": 0,
        })
        self.assertEqual(
            {p["exact_role_key"] for p in report["correction_proposals"]},
            {
                "D084|financial markets back office administrator",
                "D084|Human Resources Assistants, Except Payroll and Timekeeping",
                "D084|insurance clerk",
                "D084|New Accounts Clerks",
            },
        )
        self.assertTrue(all(not p["canonical_edit_applied"] for p in report["correction_proposals"]))

    def test_saved_report_matches_and_canonical_data_is_untouched(self):
        report = MODULE.build()
        saved = json.loads((HERE / "D084_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, report)
        self.assertEqual(report["canonical_changes"], 0)
        self.assertFalse(report["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
