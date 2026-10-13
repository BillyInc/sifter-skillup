from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d082", HERE / "review_d082_customer_service_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D082CustomerServiceRoleFitTests(unittest.TestCase):
    def test_exact_queue_coverage_and_task_evidence(self):
        rows = [r for r in QUEUE["role_mappings"] if r["domain_id"] == "D082"]
        expected = {r["role_key"] for r in rows}
        original = {r["role_key"]: r for r in rows}
        p = MODULE.build()
        self.assertEqual(len(expected), 17)
        self.assertEqual({d["role_key"] for d in p["decisions"]}, expected)
        for d in p["decisions"]:
            with self.subTest(key=d["role_key"]):
                self.assertEqual(d["task_evidence"], original[d["role_key"]]["role_task_text"])
                self.assertTrue(d["basis"] and d["source_refs"] and d["source_limit"])

    def test_research_and_transcription_are_not_customer_service(self):
        ds = {d["role_name"].casefold(): d for d in MODULE.build()["decisions"]}
        for name in ("market research interviewer", "medical transcriptionist", "survey enumerator"):
            with self.subTest(name=name):
                self.assertEqual(ds[name]["domain_fit_status"], "unsupported")

    def test_saved_report_and_no_canonical_mutation(self):
        p = MODULE.build()
        saved = json.loads((HERE / "D082_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, p)
        self.assertEqual(p["counts"], {"reviewed_role_mappings": 17, "supported": 13,
                                       "conditional": 1, "unsupported": 3, "unresolved": 0})
        self.assertEqual(p["canonical_changes"], 0)
        self.assertFalse(p["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
