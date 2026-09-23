"""Focused, read-only assertions for the product-wide scaling matrix."""

from __future__ import annotations

import json
import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
EVIDENCE = AUDIT / "programme_scaling_contract_2026-09-19.json"
REPORT = AUDIT / "SCALING_ACCEPTANCE_MATRIX_2026-09-19.md"
ROUTE_SMOKE = ROOT / "scripts" / "programmeGuidanceScaleSmoke.cjs"
CURRICULUM_SMOKE = ROOT / "scripts" / "programmeCurriculumUiScaleSmoke.cjs"


class ScalingAcceptanceMatrixTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
        cls.report = REPORT.read_text(encoding="utf-8")

    def test_full_population_and_contract_coverage(self) -> None:
        summary = self.evidence["summary"]
        self.assertEqual(summary["programmeCount"], 237)
        self.assertEqual(summary["genericProgrammeCount"], 236)
        self.assertEqual(summary["sociologyProgrammeCount"], 1)
        self.assertEqual(len(self.evidence["programmes"]), 237)
        keys = {(row["discipline"], row["programme"]) for row in self.evidence["programmes"]}
        self.assertEqual(len(keys), 237)

        curriculum = self.evidence["curriculumAudit"]
        for key in (
            "legacyFallbackRisk",
            "missingCurriculumSourceLocators",
            "missingCurriculumDataState",
            "invalidCurriculumDataState",
            "missingContractSummary",
            "curriculumCountMismatch",
            "rawCurriculumAnnotations",
            "sociologyQualityGateFailures",
        ):
            self.assertEqual(curriculum[key], 0, key)

    def test_source_enrichment_and_relationship_backlog_are_not_hidden(self) -> None:
        contextual = self.evidence["contextualAudit"]
        self.assertEqual(contextual["itemRows"], 121377)
        self.assertEqual(contextual["duplicateTypedItemRows"], 0)
        for key in (
            "missingGuidanceOwner",
            "ownerMismatch",
            "missingDataState",
            "invalidDataState",
            "missingSourceLocators",
            "missingSourceReferences",
            "invalidSourceReferenceUrls",
            "roleAggregateCandidates",
        ):
            self.assertEqual(contextual["issues"][key], 0, key)
        self.assertEqual(contextual["issues"]["unlabelledLinkState"], 0)

        relationships = self.evidence["relationshipAudit"]
        self.assertEqual(relationships["relationshipRows"], 408163)
        self.assertEqual(relationships["duplicateEdgeRows"], 0)
        self.assertEqual(relationships["missingSourceReferenceRows"], 0)
        self.assertGreater(relationships["unresolvedEndpointRows"], 0)
        self.assertGreater(relationships["notEstablishedRows"], 0)

        policy = self.evidence["policy"]
        self.assertEqual(policy["sql"], "not applied")
        self.assertIn("not fetched", policy["externalSources"])
        self.assertTrue(
            any("source_backed" in requirement for requirement in policy["relationshipsRequire"])
        )

    def test_smoke_scope_and_report_boundary_are_explicit(self) -> None:
        route_smoke = ROUTE_SMOKE.read_text(encoding="utf-8")
        for label in ("Sociology", "Nursing", "Accounting"):
            self.assertIn(f'label: "{label}"', route_smoke)
        self.assertIn("15 transitions", route_smoke)
        curriculum_smoke = CURRICULUM_SMOKE.read_text(encoding="utf-8")
        self.assertIn('displayGroup: "programme_core"', curriculum_smoke)
        self.assertIn('displayGroup: "sociology_programme"', curriculum_smoke)

        self.assertIn("237 parsed programmes", self.report)
        self.assertIn("not accepted for live exposure", self.report)
        self.assertIn("SQL was not applied", self.report)
        self.assertIn("Browser proof was unavailable", self.report)
        self.assertIn("unresolved/not-established", self.report)
        self.assertIn("all-programme admin render", self.report)
        self.assertNotRegex(self.report, r"\b(?:all|every)\s+237\s+programmes\s+(?:passed|accepted)")


if __name__ == "__main__":
    unittest.main()
