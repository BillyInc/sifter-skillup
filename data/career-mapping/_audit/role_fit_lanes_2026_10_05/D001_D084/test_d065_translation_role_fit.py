from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d065", HERE / "review_d065_translation_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D065TranslationTests(unittest.TestCase):
    def test_exact_scope_and_task_evidence(self):
        expected = {r["role_key"] for r in QUEUE["role_mappings"] if r["domain_id"] == "D065"}
        payload = MODULE.build()
        self.assertEqual(len(expected), 4)
        self.assertEqual({d["role_key"] for d in payload["decisions"]}, expected)
        original = {r["role_key"]: r for r in QUEUE["role_mappings"]}
        for d in payload["decisions"]:
            self.assertEqual(d["task_evidence"], original[d["role_key"]]["role_task_text"])
            self.assertTrue(d["basis"] and d["source_refs"] and d["source_limit"])

    def test_sign_language_teaching_is_not_assumed_to_be_interpreting(self):
        by_name = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        teacher = by_name["sign language teacher"]
        self.assertEqual(teacher["domain_fit_status"], "conditional")
        self.assertTrue(teacher["conditional_scope"])

    def test_saved_output_and_canonical_guard(self):
        payload = MODULE.build()
        saved = json.loads((HERE / "D065_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, payload)
        self.assertEqual(payload["canonical_changes"], 0)
        self.assertFalse(payload["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
