"""Regression tests for the all-programme student route contract audit."""

from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_SCRIPT = ROOT / "data" / "career-mapping" / "_audit" / "audit_all_programme_student_route_contract_2026-09-23.py"


def load_audit_module():
    spec = importlib.util.spec_from_file_location("all_programme_student_route_contract", AUDIT_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {AUDIT_SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class AllProgrammeStudentRouteContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.audit = load_audit_module()
        cls.report = cls.audit.build_report()

    def test_population_and_university_projection_cover_all_237(self) -> None:
        population = self.report["population"]
        self.assertEqual(population["programmeRecords"], 237)
        self.assertEqual(population["genericCurriculumContracts"], 236)
        self.assertEqual(population["sociologyCurriculumContracts"], 1)
        self.assertEqual(population["jambIdentities"], 420)
        self.assertEqual(population["universityOfferings"], 9130)
        self.assertEqual(population["uniqueUniversityProgrammePairs"], 9130)
        rows = self.report["programmes"]
        self.assertEqual(len(rows), 237)
        self.assertEqual(len({row["programmeKey"] for row in rows}), 237)
        self.assertEqual(sum(row["university"]["reachable"] for row in rows), 154)
        self.assertTrue(all(row["university"]["missingRouteStateExplicit"] for row in rows))
        self.assertTrue(self.report["gates"]["universityReachability"])
        self.assertEqual(self.report["population"]["studentRouteProgrammePackages"], 154)
        self.assertEqual(self.report["population"]["supportingOnlyProgrammePackages"], 83)
        self.assertEqual(self.report["population"]["jambResourceRows"], 420)
        self.assertEqual(self.report["population"]["jambResourceAvailable"], 420)
        self.assertEqual(self.report["population"]["jambResourceReviewRequired"], 0)
        self.assertEqual(self.report["population"]["jambResourceUnavailable"], 0)
        self.assertTrue(self.report["gates"]["jambResourceCoverage"])
        self.assertTrue(self.report["gates"]["universityRouteStatesExplicit"])

    def test_same_downstream_route_shape_applies_to_every_programme(self) -> None:
        rows = self.report["programmes"]
        self.assertTrue(all(row["domain"]["activeLinkCount"] > 0 for row in rows))
        self.assertTrue(all(row["routes"]["recordPresent"] for row in rows))
        self.assertTrue(all(row["routes"]["fullDownstreamCoverage"] for row in rows))
        self.assertEqual(
            self.report["missingStates"],
            {"university_jamb_identity": 83, "university_offering": 83},
        )
        self.assertEqual(self.report["studentRouteMissingStates"], {})
        self.assertEqual(self.report["supportingPackageMissingStates"], {"university_jamb_identity": 83, "university_offering": 83})
        self.assertEqual(self.report["counts"]["activeDomainLinks"], 1344)
        self.assertEqual(self.report["counts"]["domainRoutes"], 1344)
        self.assertEqual(self.report["counts"]["subgroupRoutes"], 3580)
        self.assertEqual(self.report["counts"]["roleRoutes"], 46941)

    def test_ownership_and_link_states_are_explicit(self) -> None:
        boundary = self.report["reviewOnlyBoundary"]
        counts = self.report["counts"]
        self.assertEqual(boundary["ownershipOrStateIssues"], 0)
        self.assertEqual(boundary["linkStateGaps"], 0)
        self.assertEqual(counts["contextualMissingLinkStateRows"], 0)
        self.assertEqual(counts["contextualMissingSourceLocatorRows"], 0)
        self.assertEqual(counts["contextualLinkedRows"], 5253)
        self.assertEqual(counts["contextualNoLinkRows"], 116116)
        self.assertEqual(counts["contextualReviewRequiredRows"], 8)
        self.assertEqual(boundary["studentVisibleReviewOnlyRows"], 0)

    def test_review_only_and_not_established_states_fail_closed(self) -> None:
        boundary = self.report["reviewOnlyBoundary"]
        self.assertTrue(boundary["reviewRequiredRowsAreNotStudentApproved"])
        self.assertTrue(boundary["notEstablishedRelationshipsAreNotStudentApproved"])
        self.assertTrue(boundary["explicitNoLinkIsUnavailableState"])
        self.assertEqual(boundary["reviewOnlyJambIdentities"], 86)
        self.assertEqual(boundary["reviewOnlyJambIdentitiesBlocked"], 86)
        self.assertEqual(boundary["notEstablishedRelationships"], 2305)
        self.assertEqual(boundary["unresolvedRelationshipEndpoints"], 2305)
        self.assertTrue(self.report["studentSurfaceChecks"]["passed"])
        self.assertFalse(self.report["decision"]["sqlApplied"])
        self.assertFalse(self.report["decision"]["browserProof"])

    def test_curriculum_contract_and_local_gates_pass(self) -> None:
        self.assertEqual(self.report["counts"]["curriculumStudentOutcomeRows"], 81429)
        self.assertEqual(self.report["counts"]["curriculumRawAnnotationRows"], 0)
        self.assertTrue(all(row["curriculum"]["contractPresent"] for row in self.report["programmes"]))
        self.assertTrue(all(row["curriculum"]["legacyFallbackRisk"] == 0 for row in self.report["programmes"]))
        self.assertTrue(self.report["decision"]["localStructuralAuditPassed"])
        self.assertFalse(self.report["decision"]["studentExposureApproved"])
        self.assertTrue(self.report["decision"]["fullFiveLayerRouteAvailability"])


if __name__ == "__main__":
    unittest.main()
