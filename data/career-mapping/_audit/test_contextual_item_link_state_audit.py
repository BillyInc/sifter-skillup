"""Regression checks for the read-only contextual link-state audit."""

from __future__ import annotations

import importlib.util
import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
SCRIPT = ROOT / "data" / "career-mapping" / "_audit" / "audit_contextual_item_link_state_2026-09-19.py"
REPORT = ROOT / "data" / "career-mapping" / "_audit" / "CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json"
MARKDOWN = ROOT / "data" / "career-mapping" / "_audit" / "CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.md"
CATALOGUE = ROOT / "data" / "career-mapping" / "contextual_guidance_items.json.gz"


def load_audit_module():
    spec = importlib.util.spec_from_file_location("contextual_link_state_audit", SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("could not load contextual link-state audit")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ContextualItemLinkStateAuditTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.module = load_audit_module()
        cls.evidence = json.loads(REPORT.read_text(encoding="utf-8"))
        cls.markdown = MARKDOWN.read_text(encoding="utf-8")

    def test_all_programmes_are_projected_without_promoting_missing_links(self) -> None:
        summary = self.evidence["summary"]
        self.assertEqual(summary["programmeCount"], 237)
        self.assertEqual(summary["activeMappedProgrammeCount"], 237)
        self.assertEqual(summary["unmappedProgrammeCount"], 0)
        self.assertEqual(summary["catalogueRows"], 121377)
        self.assertEqual(summary["stateCounts"], {"linked": 5253, "no_link": 116116, "review_required": 8})
        self.assertEqual(len(self.evidence["programmes"]), 237)
        self.assertEqual(summary["programmesWithMissingLinkState"], 0)
        self.assertFalse(self.evidence["decision"]["studentExposureApproved"])

    def test_current_source_contract_identifies_seed_renderer_gap(self) -> None:
        readiness = self.evidence["sourceContractReadiness"]
        self.assertTrue(readiness["schemaColumnsPresent"])
        self.assertTrue(readiness["builderRowFieldsPresent"])
        self.assertTrue(readiness["seedRendererColumnsPresent"])
        self.assertEqual(readiness["missingFromSeedRendererColumns"], [])

    def test_report_and_audit_are_local_and_explicit(self) -> None:
        self.assertTrue(CATALOGUE.exists())
        self.assertIn("does not fetch URLs, apply SQL, or rewrite gzip artifacts", self.markdown)
        self.assertIn("local transport now carries the full link contract", self.markdown)
        self.assertIn("honest reviewed absence", self.markdown)
        self.assertEqual(self.module.classify_link_state({}), "missing")
        self.assertEqual(self.module.classify_link_state({"link_state": "no_link", "no_link_reason": "not established"}), "no_link")
        self.assertEqual(self.module.classify_link_state({"link_state": "linked", "link_url": "https://example.test", "link_source_reference": {"id": "x"}}), "linked")


if __name__ == "__main__":
    unittest.main()
