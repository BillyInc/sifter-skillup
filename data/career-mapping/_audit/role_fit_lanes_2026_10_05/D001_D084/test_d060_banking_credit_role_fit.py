from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d060", HERE / "review_d060_banking_credit_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)
ALLOWED = {"supported", "conditional", "unsupported", "unresolved"}


class D060BankingCreditTests(unittest.TestCase):
    def test_exact_current_queue_coverage(self):
        expected = {r["role_key"] for r in QUEUE["role_mappings"] if r["domain_id"] == "D060"}
        result = MODULE.build()
        actual = [d["role_key"] for d in result["decisions"]]
        self.assertEqual(len(expected), 21)
        self.assertEqual(len(actual), len(set(actual)))
        self.assertEqual(set(actual), expected)
        self.assertEqual(result["counts"]["reviewed_role_mappings"], 21)

    def test_each_decision_has_task_basis_and_direct_sources(self):
        result = MODULE.build()
        queue_by_key = {r["role_key"]: r for r in QUEUE["role_mappings"]}
        for decision in result["decisions"]:
            with self.subTest(role=decision["role_key"]):
                self.assertIn(decision["domain_fit_status"], ALLOWED)
                self.assertTrue(decision["task_evidence"])
                self.assertEqual(decision["task_evidence"], queue_by_key[decision["role_key"]]["role_task_text"])
                self.assertTrue(decision["basis"])
                self.assertTrue(decision["source_refs"])
                self.assertTrue(decision["source_limit"])
                if decision["domain_fit_status"] == "conditional":
                    self.assertTrue(decision["conditional_scope"])
                else:
                    self.assertIsNone(decision["conditional_scope"])
                self.assertNotIn("subgroup", decision)
                self.assertNotIn("specialization", decision)

    def test_sector_only_roles_are_not_assumed_to_be_banking(self):
        decisions = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        self.assertEqual(decisions["brokerage firm director"]["domain_fit_status"], "unsupported")
        self.assertEqual(decisions["pension scheme manager"]["domain_fit_status"], "unsupported")
        self.assertEqual(decisions["back office specialist"]["domain_fit_status"], "conditional")

    def test_artifacts_match_generator(self):
        payload = json.loads((HERE / "D060_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(payload, MODULE.build())
        report = (HERE / "D060_role_domain_fit_review_2026_10_05.md").read_text(encoding="utf-8")
        self.assertIn("21/21 exact mappings", report)
        self.assertIn("Conditional is not a weak synonym for supported", report)


if __name__ == "__main__":
    unittest.main()
