"""Regression tests for the all-programme downstream route audit."""

from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
AUDIT_SCRIPT = ROOT / "data" / "career-mapping" / "_audit" / "audit_downstream_programme_routes_2026-09-19.py"
EVIDENCE = ROOT / "data" / "career-mapping" / "_audit" / "programme_scaling_contract_2026-09-19.json"


def load_audit_module():
    spec = importlib.util.spec_from_file_location("downstream_route_audit", AUDIT_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {AUDIT_SCRIPT}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class DownstreamProgrammeRouteAuditTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.audit = load_audit_module()

    def test_relationship_endpoints_are_checked_against_item_keys(self) -> None:
        item_keys = {
            ("domain", "D1", "tool", "tool-1"),
            ("domain", "D1", "skill", "skill-1"),
        }
        relationships = [
            {
                "context_level": "domain",
                "context_key": "D1",
                "from_item_type": "tool",
                "from_item_key": "tool-1",
                "to_item_type": "skill",
                "to_item_key": "skill-1",
                "relationship_status": "source_backed",
                "data_state": "source_backed",
                "source_references": [{"url": "https://example.org/source"}],
            },
            {
                "context_level": "domain",
                "context_key": "D1",
                "from_item_type": "tool",
                "from_item_key": "missing-tool",
                "to_item_type": "skill",
                "to_item_key": "skill-1",
                "relationship_status": "not_established",
                "data_state": "not_established",
                "source_references": [],
            },
        ]

        summary = self.audit.relationship_state_audit(relationships, item_keys)

        self.assertEqual(summary["relationshipRows"], 2)
        self.assertEqual(summary["unresolvedEndpointRows"], 1)
        self.assertEqual(summary["studentRenderableRows"], 1)
        self.assertEqual(summary["failClosedRows"], 1)

    def test_scaling_contract_remains_population_wide(self) -> None:
        evidence = json.loads(EVIDENCE.read_text(encoding="utf-8"))
        self.assertEqual(evidence["summary"]["programmeCount"], 237)
        self.assertEqual(evidence["summary"]["genericProgrammeCount"], 236)
        self.assertEqual(evidence["summary"]["sociologyProgrammeCount"], 1)

    def test_jamb_entry_route_keeps_ccmas_optional(self) -> None:
        report = self.audit.build_report()
        contract = report["jambRouteContract"]
        self.assertTrue(contract["all420IdentitiesPresent"])
        self.assertTrue(contract["jambProgrammeAvailabilityIndependent"])
        self.assertTrue(contract["universityAvailabilityIndependent"])
        self.assertTrue(contract["optionalCcmasComplement"])
        self.assertTrue(contract["missingCcmasDoesNotFailJambRoute"])
        self.assertTrue(contract["reviewRequiredCcmasDoesNotFailJambRoute"])
        self.assertEqual(report["coverage"]["jambIdentityCount"], 420)
        self.assertEqual(report["coverage"]["jambProgrammeRoutesAvailable"], 420)
        self.assertEqual(report["coverage"]["universityOfferingRoutesAvailable"], 420)
        self.assertEqual(report["coverage"]["brokenJambRouteCount"], 0)
        self.assertEqual(report["coverage"]["ccmasComplementStateCounts"].get("review_required"), 86)
        self.assertTrue(report["decision"]["jambRouteAvailabilityPasses"])


if __name__ == "__main__":
    unittest.main()
