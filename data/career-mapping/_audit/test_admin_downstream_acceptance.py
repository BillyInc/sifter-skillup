"""Regression tests for the population-wide admin/downstream checkpoint."""

from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SCRIPT = AUDIT / "audit_admin_downstream_acceptance_2026-09-19.py"
REPORT = AUDIT / "ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.json"
MARKDOWN = AUDIT / "ADMIN_DOWNSTREAM_ACCEPTANCE_2026-09-19.md"


def load_audit_module():
    spec = importlib.util.spec_from_file_location("admin_downstream_acceptance", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class AdminDownstreamAcceptanceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.audit = load_audit_module()
        cls.report = json.loads(REPORT.read_text(encoding="utf-8"))
        cls.markdown = MARKDOWN.read_text(encoding="utf-8")

    def test_population_and_jamb_scope_are_full(self) -> None:
        scope = self.report["scope"]
        self.assertEqual(scope["programmeCount"], 237)
        self.assertEqual(scope["genericProgrammeCount"], 236)
        self.assertEqual(scope["sociologyProgrammeCount"], 1)
        self.assertEqual(scope["jambIdentityCount"], 420)
        self.assertTrue(self.report["populationIdentity"]["allProgrammeKeysPresent"])
        self.assertTrue(self.report["populationIdentity"]["programmeKeysAreUnique"])
        self.assertEqual(self.report["populationIdentity"]["uniqueProgrammeKeys"], 237)
        self.assertEqual(self.report["unmappedProgrammes"], [])
        self.assertEqual(self.report["jambCoverage"]["partialCurriculumScope"], 273)
        self.assertEqual(self.report["jambCoverage"]["combinedCcmasCurriculum"], 28)
        self.assertEqual(self.report["jambCoverage"]["externalSourcesRequired"], 6)

    def test_admin_review_and_boundary_contracts_are_present(self) -> None:
        self.assertTrue(all(self.report["adminContract"].values()))
        self.assertTrue(all(self.report["institutionContract"].values()))
        self.assertTrue(all(self.report["reportContract"].values()))
        decision = self.report["decision"]
        self.assertTrue(decision["localAdminBoundaryImplemented"])
        self.assertTrue(decision["localInstitutionBoundaryImplemented"])
        self.assertTrue(decision["localReportGateImplemented"])
        self.assertFalse(decision["fullAdminRenderAccepted"])
        self.assertFalse(decision["studentExposureAccepted"])

    def test_open_queues_and_deferred_gates_are_explicit(self) -> None:
        queue = self.report["reviewQueue"]
        self.assertEqual(queue["unresolvedRelationshipRows"], 2305)
        self.assertGreater(queue["notEstablishedRelationshipRows"], 0)
        self.assertEqual(queue["contextualItems"], 121377)
        self.assertIn("NOT APPROVED", self.markdown)
        self.assertIn("Full 237-programme admin rendering", self.markdown)
        self.assertIn("browser proof and SQL remain deferred", self.markdown)

    def test_builder_matches_checked_report(self) -> None:
        rebuilt = self.audit.build_report()
        self.assertEqual(rebuilt["scope"], self.report["scope"])
        self.assertEqual(rebuilt["unmappedProgrammes"], self.report["unmappedProgrammes"])
        self.assertEqual(rebuilt["decision"], self.report["decision"])


if __name__ == "__main__":
    unittest.main()
