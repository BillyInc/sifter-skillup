from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d077", HERE / "review_d077_security_services_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D077SecurityServicesRoleFitTests(unittest.TestCase):
    def test_exact_queue_coverage_and_task_evidence(self):
        rows = [r for r in QUEUE["role_mappings"] if r["domain_id"] == "D077"]
        expected = {r["role_key"] for r in rows}
        original = {r["role_key"]: r for r in rows}
        payload = MODULE.build()
        self.assertEqual(len(expected), 31)
        self.assertEqual({d["role_key"] for d in payload["decisions"]}, expected)
        for decision in payload["decisions"]:
            with self.subTest(key=decision["role_key"]):
                self.assertEqual(decision["task_evidence"], original[decision["role_key"]]["role_task_text"])
                self.assertTrue(decision["basis"] and decision["source_refs"] and decision["source_limit"])

    def test_non_security_tasks_are_excluded(self):
        payload = MODULE.build()
        decisions = {d["role_name"].casefold(): d for d in payload["decisions"]}
        self.assertEqual(decisions["aircraft marshaller"]["domain_fit_status"], "unsupported")
        self.assertEqual(decisions["game keeper"]["domain_fit_status"], "unsupported")

    def test_saved_report_and_no_canonical_mutation(self):
        payload = MODULE.build()
        saved = json.loads((HERE / "D077_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, payload)
        self.assertEqual(payload["counts"], {"reviewed_role_mappings": 31, "supported": 29,
                                             "conditional": 0, "unsupported": 2, "unresolved": 0})
        self.assertEqual(payload["canonical_changes"], 0)
        self.assertFalse(payload["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
