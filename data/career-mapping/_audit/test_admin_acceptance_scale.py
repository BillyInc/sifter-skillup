"""Regression tests for the full-population admin acceptance audit."""

from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
SCRIPT = AUDIT / "audit_admin_acceptance_scale_2026-09-23.py"
REPORT = AUDIT / "ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.json"
MARKDOWN = AUDIT / "ADMIN_ACCEPTANCE_SCALE_AUDIT_2026-09-23.md"


def load_audit_module():
    spec = importlib.util.spec_from_file_location("admin_acceptance_scale", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class AdminAcceptanceScaleTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.audit = load_audit_module()
        cls.report = json.loads(REPORT.read_text(encoding="utf-8"))
        cls.markdown = MARKDOWN.read_text(encoding="utf-8")

    def test_full_population_scope_is_present(self) -> None:
        scope = self.report["scope"]
        self.assertEqual(scope["programmeCount"], 237)
        self.assertEqual(scope["jambIdentityCount"], 420)
        self.assertEqual(scope["contextualItemRows"], 121377)
        self.assertEqual(scope["contextualRelationshipRows"], 408163)
        self.assertTrue(self.report["coverage"]["allProgrammesAudited"])
        self.assertTrue(self.report["coverage"]["allJambIdentitiesAudited"])
        self.assertEqual(len(self.report["coverage"]["programmeRows"]), 237)
        self.assertEqual(len(self.report["coverage"]["jambIdentities"]), 420)

    def test_accepted_view_is_strict_and_internal_states_are_blocked(self) -> None:
        accepted = self.report["acceptedView"]
        self.assertEqual(accepted["acceptedRows"], 0)
        self.assertEqual(accepted["acceptedRowsWithMissingApproval"], 0)
        self.assertEqual(accepted["acceptedRowsWithOwnerMismatch"], 0)
        self.assertEqual(accepted["acceptedRowsWithMissingTrace"], 0)
        self.assertEqual(accepted["acceptedRowsWithMissingAccessDate"], 0)
        self.assertTrue(accepted["blockedStatesInternal"])
        for state, result in accepted["syntheticBlockedStateChecks"].items():
            self.assertFalse(result["accepted"], state)

    def test_dashboard_contract_and_live_proof_boundaries_are_explicit(self) -> None:
        contract = self.report["dashboardContract"]
        self.assertTrue(contract["strictEvidenceContract"])
        self.assertTrue(contract["acceptedViewPartitionContract"])
        decision = self.report["decision"]
        self.assertTrue(decision["acceptedViewBoundaryPasses"])
        self.assertFalse(decision["fullAdminRenderAccepted"])
        self.assertFalse(decision["studentExposureApproved"])
        self.assertFalse(decision["browserProof"])
        self.assertFalse(decision["sqlApplied"])
        self.assertIn("explicit approved state", self.markdown)
        self.assertIn("NOT CLAIMED", self.markdown)

    def test_university_unavailable_states_are_separate_from_broken_routes(self) -> None:
        route = self.report["routeAvailability"]
        self.assertEqual(route["programmeCount"], 237)
        self.assertEqual(route["availableUniversityRoutes"], 154)
        self.assertEqual(route["explicitUnavailableProgrammes"], 83)
        self.assertEqual(route["missingUniversityJambIdentityStates"], 83)
        self.assertEqual(route["missingUniversityOfferingStates"], 83)
        self.assertEqual(route["brokenDownstreamRouteProgrammes"], 0)
        self.assertEqual(route["reviewRequiredJambIdentities"], 86)
        self.assertFalse(route["safeLocalResolution"]["missingUniversityJambIdentity"])
        self.assertFalse(route["safeLocalResolution"]["missingUniversityOffering"])
        self.assertTrue(self.report["decision"]["routeAvailabilityReviewed"])

    def test_builder_matches_checked_report(self) -> None:
        rebuilt = self.audit.build_report()
        self.assertEqual(rebuilt["scope"], self.report["scope"])
        self.assertEqual(rebuilt["acceptedView"], self.report["acceptedView"])
        self.assertEqual(rebuilt["decision"], self.report["decision"])


if __name__ == "__main__":
    unittest.main()
