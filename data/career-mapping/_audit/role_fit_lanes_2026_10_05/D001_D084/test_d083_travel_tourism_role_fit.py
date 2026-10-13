from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
QUEUE = json.loads((HERE / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
SPEC = importlib.util.spec_from_file_location("review_d083", HERE / "review_d083_travel_tourism_roles.py")
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(MODULE)


class D083TravelTourismRoleFitTests(unittest.TestCase):
    def test_exact_queue_coverage_and_task_evidence(self):
        rows = [r for r in QUEUE["role_mappings"] if r["domain_id"] == "D083"]
        expected = {r["role_key"] for r in rows}
        original = {r["role_key"]: r for r in rows}
        p = MODULE.build()
        self.assertEqual(len(expected), 22)
        self.assertEqual({d["role_key"] for d in p["decisions"]}, expected)
        for d in p["decisions"]:
            with self.subTest(key=d["role_key"]):
                self.assertEqual(d["task_evidence"], original[d["role_key"]]["role_task_text"])
                self.assertTrue(d["basis"] and d["source_refs"] and d["source_limit"])

    def test_environmental_education_is_tourism_only_for_guiding_duties(self):
        d = next(d for d in MODULE.build()["decisions"] if d["role_name"] == "environmental education officer")
        self.assertEqual(d["domain_fit_status"], "conditional")
        self.assertIn("guided visitor", d["conditional_scope"])

    def test_saved_report_and_no_canonical_mutation(self):
        p = MODULE.build()
        saved = json.loads((HERE / "D083_role_domain_fit_review_2026_10_05.json").read_text(encoding="utf-8"))
        self.assertEqual(saved, p)
        self.assertEqual(p["counts"], {"reviewed_role_mappings": 22, "supported": 21,
                                       "conditional": 1, "unsupported": 0, "unresolved": 0})
        self.assertEqual(p["canonical_changes"], 0)
        self.assertFalse(p["canonical_correction_ready"])


if __name__ == "__main__":
    unittest.main()
