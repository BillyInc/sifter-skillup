from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d064", HERE / "review_d064_psychology_counselling_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D064PsychologyCounsellingTests(unittest.TestCase):
    def test_exact_queue_coverage_and_task_sources(self):
        expected = {r["role_key"] for r in QUEUE["role_mappings"] if r["domain_id"] == "D064"}
        payload = MODULE.build()
        decisions = payload["decisions"]
        self.assertEqual(len(expected), 20)
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

    def test_limits_coaching_mentoring_and_health_information(self):
        by_name = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        self.assertEqual(by_name["volunteer mentor"]["domain_fit_status"], "unsupported")
        self.assertEqual(by_name["life coach"]["domain_fit_status"], "conditional")
        self.assertEqual(by_name["family planning counsellor"]["domain_fit_status"], "conditional")
        self.assertEqual(by_name["mental health support worker"]["domain_fit_status"], "conditional")

    def test_saved_outputs_and_canonical_guard(self):
        payload = MODULE.build()
        saved = json.loads((HERE / "D064_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, payload)
        self.assertEqual(payload["canonical_changes"], 0)
        self.assertFalse(payload["canonical_correction_ready"])
        md = (HERE / "D064_role_domain_fit_review_2026_10_05.md").read_text(encoding="utf-8")
        self.assertIn("20/20 exact mappings", md)
        self.assertIn("Conditional is not confirmed", md)


if __name__ == "__main__":
    unittest.main()
