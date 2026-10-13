from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d061", HERE / "review_d061_insurance_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D061InsuranceTests(unittest.TestCase):
    def test_exact_current_queue_coverage_and_evidence(self):
        expected = {r["role_key"] for r in QUEUE["role_mappings"] if r["domain_id"] == "D061"}
        result = MODULE.build()
        decisions = result["decisions"]
        self.assertEqual(len(expected), 20)
        self.assertEqual({d["role_key"] for d in decisions}, expected)
        self.assertEqual(len(decisions), len({d["role_key"] for d in decisions}))
        source_by_key = {r["role_key"]: r for r in QUEUE["role_mappings"]}
        for d in decisions:
            self.assertEqual(d["task_evidence"], source_by_key[d["role_key"]]["role_task_text"])
            self.assertTrue(d["basis"] and d["source_refs"] and d["source_limit"])
            if d["domain_fit_status"] == "conditional":
                self.assertTrue(d["conditional_scope"])
            else:
                self.assertIsNone(d["conditional_scope"])

    def test_financial_services_are_not_assumed_insurance(self):
        by_name = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        for role in ("financial broker", "foreign exchange broker", "mortgage broker", "mortgage loan underwriter", "mutual fund broker"):
            self.assertEqual(by_name[role]["domain_fit_status"], "unsupported")

    def test_mixed_source_records_are_conditional(self):
        by_name = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        self.assertEqual(by_name["insurance rating analyst"]["domain_fit_status"], "conditional")
        self.assertEqual(by_name["pension scheme manager"]["domain_fit_status"], "conditional")

    def test_saved_artifacts_match_builder(self):
        saved = json.loads((HERE / "D061_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, MODULE.build())
        md = (HERE / "D061_role_domain_fit_review_2026_10_05.md").read_text(encoding="utf-8")
        self.assertIn("20/20 exact mappings", md)
        self.assertIn("not insurance merely because they work in financial services", md)


if __name__ == "__main__":
    unittest.main()
