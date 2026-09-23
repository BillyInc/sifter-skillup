"""Regression tests for the append-only admin evidence ledger audit."""

from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SCRIPT = AUDIT / "audit_admin_evidence_ledger_acceptance_2026-09-23.py"
REPORT = AUDIT / "ADMIN_EVIDENCE_LEDGER_ACCEPTANCE_AUDIT_2026-09-23.json"
MARKDOWN = AUDIT / "ADMIN_EVIDENCE_LEDGER_ACCEPTANCE_AUDIT_2026-09-23.md"


def load_module():
    spec = importlib.util.spec_from_file_location("admin_evidence_ledger_acceptance", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class AdminEvidenceLedgerAcceptanceTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.audit = load_module()
        cls.report = json.loads(REPORT.read_text(encoding="utf-8"))
        cls.markdown = MARKDOWN.read_text(encoding="utf-8")

    def test_population_and_ledger_counts(self) -> None:
        self.assertEqual(self.report["scope"]["ccmasCurriculumResourcePackageCount"], 237)
        self.assertEqual(self.report["scope"]["jambStudentProgrammeIdentityCount"], 420)
        self.assertEqual(self.report["programmeEvidence"]["rows"], 237)
        self.assertEqual(self.report["jambEvidence"]["rows"], 86)
        self.assertEqual(self.report["jambPopulation"]["resourceStates"], {"available": 420})
        identity = self.report["jambPopulation"]["studentFacingProgrammeIdentities"]
        self.assertEqual(identity["rows"], 420)
        self.assertEqual(identity["uniqueIdentityNames"], 420)
        self.assertEqual(identity["identitySourceRows"], 420)
        self.assertEqual(identity["explicitResourceStateRows"], 420)
        self.assertEqual(identity["missingIdentitySourceRows"], 0)
        self.assertEqual(identity["missingResourceStateRows"], 0)
        self.assertTrue(identity["resourceStateBasedOnActualIdentityResourceEvidence"])
        self.assertFalse(identity["reviewOrUnavailableBasedOnActualIdentityResourceEvidence"])
        self.assertTrue(identity["ccmasAnchorAbsenceIsNotABlocker"])

    def test_only_explicit_approval_can_be_accepted(self) -> None:
        self.assertTrue(self.report["ledgerIntegrity"]["passes"])
        self.assertTrue(self.report["ledgerIntegrity"]["manifestAppendOnly"])
        self.assertEqual(self.report["acceptedView"]["acceptedRows"], 0)
        self.assertTrue(self.report["acceptedView"]["acceptedRowsOnlyApprovedOwnedTraceable"])
        self.assertTrue(self.report["acceptedView"]["allObservedRowsInternal"])

    def test_boundaries_are_not_overclaimed(self) -> None:
        decision = self.report["decision"]
        self.assertTrue(decision["localAdminAcceptanceBoundaryPasses"])
        self.assertFalse(decision["fullAdminRenderAccepted"])
        self.assertFalse(decision["studentExposureApproved"])
        self.assertFalse(decision["browserProof"])
        self.assertFalse(decision["sqlApplied"])
        self.assertIn("NOT CLAIMED", self.markdown)

    def test_builder_matches_checked_report(self) -> None:
        rebuilt = self.audit.build_report()
        self.assertEqual(rebuilt, self.report)


if __name__ == "__main__":
    unittest.main()
