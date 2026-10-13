from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d063", HERE / "review_d063_economics_policy_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D063EconomicsPolicyTests(unittest.TestCase):
    def test_exact_queue_coverage_and_source_evidence(self):
        expected = {r["role_key"] for r in QUEUE["role_mappings"] if r["domain_id"] == "D063"}
        payload = MODULE.build()
        decisions = payload["decisions"]
        self.assertEqual(len(expected), 17)
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

    def test_policy_adjacency_does_not_confirm_every_role(self):
        by_name = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        self.assertEqual(by_name["political scientist"]["domain_fit_status"], "unsupported")
        self.assertEqual(by_name["climate change policy analysts"]["domain_fit_status"], "conditional")
        self.assertEqual(by_name["business studies and economics teacher secondary school"]["domain_fit_status"], "conditional")
        self.assertEqual(by_name["environmental economists"]["domain_fit_status"], "supported")

    def test_outputs_match_builder_and_keep_canonical_data_out_of_scope(self):
        saved = json.loads((HERE / "D063_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        payload = MODULE.build()
        self.assertEqual(saved, payload)
        self.assertEqual(payload["canonical_changes"], 0)
        self.assertFalse(payload["canonical_correction_ready"])
        md = (HERE / "D063_role_domain_fit_review_2026_10_05.md").read_text(encoding="utf-8")
        self.assertIn("17/17 exact mappings", md)
        self.assertIn("Conditional is not confirmed", md)


if __name__ == "__main__":
    unittest.main()
