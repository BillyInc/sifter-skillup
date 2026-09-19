"""Focused integration-gap checkpoint; read-only and implementation-agnostic."""

from __future__ import annotations

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "data" / "career-mapping" / "_audit"
MATRIX = AUDIT / "INTEGRATION_GAP_MATRIX_2026-09-19.md"
SCALING = AUDIT / "programme_scaling_contract_2026-09-19.json"
SOCIOLOGY = AUDIT / "sociology_student_guidance_contract_2026-09-19.json"
RELATIONSHIP_BACKLOG = AUDIT / "relationship_backlog_inventory.json"
GENERIC_BATCH = AUDIT / "source_enrichment_batch_generic_2026-09-19.json"


class IntegrationGapMatrixTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.matrix = MATRIX.read_text(encoding="utf-8")
        cls.scaling = json.loads(SCALING.read_text(encoding="utf-8"))
        cls.sociology = json.loads(SOCIOLOGY.read_text(encoding="utf-8"))
        cls.backlog = json.loads(RELATIONSHIP_BACKLOG.read_text(encoding="utf-8"))
        cls.generic_batch = json.loads(GENERIC_BATCH.read_text(encoding="utf-8"))

    def test_full_population_and_downstream_boundary(self) -> None:
        summary = self.scaling["summary"]
        programmes = self.scaling["programmes"]
        self.assertEqual(summary["programmeCount"], 237)
        self.assertEqual(summary["genericProgrammeCount"], 236)
        self.assertEqual(summary["sociologyProgrammeCount"], 1)
        self.assertEqual(len(programmes), 237)
        self.assertEqual(len({row["programmeKey"] for row in programmes}), 237)
        self.assertEqual(summary["activeDomainLinks"], 1343)
        self.assertIn("Sociology", self.matrix)
        self.assertIn("Nursing", self.matrix)
        self.assertIn("Accounting", self.matrix)
        self.assertIn("smoke fixtures only", self.matrix)

    def test_source_states_and_retained_evidence(self) -> None:
        sociology_items = self.sociology["d078_contextual_items"]
        sociology_relationships = self.sociology["d078_relationships"]
        self.assertEqual(sociology_items["total"], 725)
        self.assertEqual(sociology_items["link_states"]["matched_approved_resource"], 27)
        self.assertEqual(sociology_items["link_states"]["missing_item_specific_resource"], 698)
        self.assertEqual(sociology_relationships["total"], 2519)
        self.assertEqual(sociology_relationships["integrity"]["duplicate_edge_rows"], 0)

        self.assertEqual(self.backlog["total_unresolved"], 2305)
        self.assertTrue(self.backlog["rows"])
        self.assertTrue(
            all(
                row["data_state"] == "not_established"
                and row["relationship_status"] == "not_established"
                and row["source_references"]
                and row["source_locators"]
                for row in self.backlog["rows"]
            )
        )

        records = self.generic_batch["records"]
        self.assertEqual(sum(row["decision"] == "verified" for row in records), 2)
        self.assertEqual(sum(row["decision"] == "review_required" for row in records), 1)
        review_row = next(row for row in records if row["decision"] == "review_required")
        self.assertEqual(review_row["promotion"], "not_promoted")
        self.assertTrue(all(source["url"].startswith("https://") for row in records for source in row["sources"]))

    def test_deferred_sql_browser_and_admin_gates_are_explicit(self) -> None:
        policy = self.scaling["policy"]
        self.assertEqual(policy["sql"], "not applied")
        self.assertEqual(self.scaling["contextualAudit"]["issues"]["unlabelledLinkState"], 126414)
        self.assertEqual(self.scaling["relationshipAudit"]["notEstablishedRows"], 2305)
        self.assertEqual(self.scaling["programmeContextTotals"]["unresolvedEndpointRows"], 21238)
        for phrase in (
            "PARTIAL",
            "DEFERRED",
            "BLOCKED / DEFERRED",
            "review_required",
            "no-link",
            "all-237 admin render",
            "No implementation or SQL file was changed",
        ):
            self.assertIn(phrase, self.matrix)


if __name__ == "__main__":
    unittest.main()
