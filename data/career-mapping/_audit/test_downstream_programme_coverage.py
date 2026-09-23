"""Deterministic all-programme downstream coverage checkpoint.

This test consumes the existing scaling audit JSON and acceptance matrix. It
intentionally does not open the large contextual gzip or mutate implementation
files.
"""

from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
EVIDENCE = AUDIT / "programme_scaling_contract_2026-09-19.json"
REPORT = AUDIT / "DOWNSTREAM_PROGRAMME_COVERAGE_CHECK_2026-09-19.md"
MATRIX = AUDIT / "SCALING_ACCEPTANCE_MATRIX_2026-09-19.md"


class DownstreamProgrammeCoverageTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
        cls.report = REPORT.read_text(encoding="utf-8")
        cls.matrix = MATRIX.read_text(encoding="utf-8")

    def test_every_programme_has_one_audit_record(self) -> None:
        summary = self.evidence["summary"]
        programmes = self.evidence["programmes"]
        self.assertEqual(summary["programmeCount"], 237)
        self.assertEqual(summary["genericProgrammeCount"], 236)
        self.assertEqual(summary["sociologyProgrammeCount"], 1)
        self.assertEqual(len(programmes), 237)
        keys = [row["programmeKey"] for row in programmes]
        self.assertEqual(len(set(keys)), 237)
        self.assertTrue(all(row.get("context") is not None for row in programmes))
        self.assertTrue(all(row.get("curriculum") is not None for row in programmes))
        self.assertEqual(summary["activeDomainLinks"], 1344)
        self.assertEqual(summary["programmesWithoutActiveDomainMapping"], 0)

    def test_smoke_fixtures_are_distinguished_from_population(self) -> None:
        by_key = {row["programmeKey"]: row for row in self.evidence["programmes"]}
        fixtures = {
            "Sociology": ("Social Sciences::Sociology", "sociology_reviewed", 5),
            "Nursing": ("Allied Health Sciences::Nursing Sciences", "generic", 6),
            "Accounting": ("Administration and Management::Accounting", "generic", 11),
        }
        for label, (key, contract_kind, link_count) in fixtures.items():
            self.assertIn(key, by_key, label)
            row = by_key[key]
            self.assertEqual(row["curriculum"]["kind"], contract_kind, label)
            self.assertEqual(row["context"]["activeDomainLinks"], link_count, label)
            self.assertIn(f"| {label} |", self.report)
        self.assertIn("do not replace the 237-programme audit", self.report)
        self.assertIn("15 route", self.report)
        self.assertIn("helper transitions", self.report)

    def test_boundary_is_explicit(self) -> None:
        report_text = " ".join(self.report.split())
        self.assertIn("unresolved or not-established relationships", report_text)
        self.assertIn("SQL/live deployment and browser verification remain deferred", self.report)
        self.assertIn("not accepted for live exposure", self.matrix)
        self.assertIn("all-programme admin render", self.matrix)


if __name__ == "__main__":
    unittest.main()
