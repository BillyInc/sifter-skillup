from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d074", HERE / "review_d074_occupational_safety_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D074OccupationalSafetyRoleFitTests(unittest.TestCase):
    def test_exact_queue_coverage_and_task_evidence(self):
        rows = [r for r in QUEUE["role_mappings"] if r["domain_id"] == "D074"]
        expected = {r["role_key"] for r in rows}
        original = {r["role_key"]: r for r in rows}
        payload = MODULE.build()
        self.assertEqual(len(expected), 20)
        self.assertEqual({d["role_key"] for d in payload["decisions"]}, expected)
        for decision in payload["decisions"]:
            with self.subTest(key=decision["role_key"]):
                self.assertEqual(decision["task_evidence"], original[decision["role_key"]]["role_task_text"])
                self.assertTrue(decision["basis"] and decision["source_refs"] and decision["source_limit"])

    def test_non_occupational_safety_adjacent_roles_are_conditional(self):
        payload = MODULE.build()
        decisions = {d["role_name"].casefold(): d for d in payload["decisions"]}
        for name in ("aviation safety officer", "food safety inspector", "healthcare inspector",
                     "industrial waste inspector", "transport health and safety inspector"):
            with self.subTest(name=name):
                self.assertEqual(decisions[name]["domain_fit_status"], "conditional")
                self.assertTrue(decisions[name]["conditional_scope"])

    def test_saved_report_and_no_canonical_mutation(self):
        payload = MODULE.build()
        saved = json.loads((HERE / "D074_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, payload)
        self.assertEqual(payload["counts"], {"reviewed_role_mappings": 20, "supported": 11,
                                             "conditional": 9, "unsupported": 0, "unresolved": 0})
        self.assertEqual(payload["canonical_changes"], 0)
        self.assertFalse(payload["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
