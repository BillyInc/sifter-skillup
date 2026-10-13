from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d062", HERE / "review_d062_trading_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D062TradingTests(unittest.TestCase):
    def test_exact_queue_coverage_and_source_evidence(self):
        expected = {r["role_key"] for r in QUEUE["role_mappings"] if r["domain_id"] == "D062"}
        payload = MODULE.build()
        decisions = payload["decisions"]
        self.assertEqual(len(expected), 29)
        self.assertEqual({d["role_key"] for d in decisions}, expected)
        self.assertEqual(len(decisions), len({d["role_key"] for d in decisions}))
        original = {r["role_key"]: r for r in QUEUE["role_mappings"]}
        for d in decisions:
            with self.subTest(key=d["role_key"]):
                self.assertEqual(d["task_evidence"], original[d["role_key"]]["role_task_text"])
                self.assertTrue(d["basis"] and d["source_refs"] and d["source_limit"])
                if d["domain_fit_status"] == "conditional":
                    self.assertTrue(d["conditional_scope"])
                else:
                    self.assertIsNone(d["conditional_scope"])

    def test_not_all_financial_roles_are_trading_roles(self):
        by_name = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        self.assertEqual(by_name["corporate risk manager"]["domain_fit_status"], "unsupported")
        self.assertEqual(by_name["investor relations manager"]["domain_fit_status"], "unsupported")
        self.assertEqual(by_name["financial planner"]["domain_fit_status"], "conditional")

    def test_outputs_match_builder(self):
        saved = json.loads((HERE / "D062_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, MODULE.build())
        md = (HERE / "D062_role_domain_fit_review_2026_10_05.md").read_text(encoding="utf-8")
        self.assertIn("29/29 exact mappings", md)
        self.assertIn("Conditional is not confirmed", md)


if __name__ == "__main__":
    unittest.main()
