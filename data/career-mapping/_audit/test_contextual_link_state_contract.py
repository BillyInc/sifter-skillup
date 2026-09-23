"""Focused contract tests for item-level resource/link state transport."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
BUILDER = ROOT / "data" / "career-mapping" / "_build_contextual_guidance_items.py"


def load_builder():
    sys.path.insert(0, str(BUILDER.parent))
    spec = importlib.util.spec_from_file_location("contextual_builder", BUILDER)
    if spec is None or spec.loader is None:
        raise RuntimeError("unable to load contextual builder")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class ContextualLinkStateContractTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.builder = load_builder()

    def test_link_contract_has_explicit_state_for_all_outcomes(self) -> None:
        for candidates, expected in ((None, "no_link"), ([], "no_link"), ([{"url": "https://example.org"}], "review_required")):
            contract = self.builder.item_link_contract("skill", "Example", candidates)
            self.assertEqual(contract["link_state"], expected)
            self.assertIn("no_link_reason", contract)

    def test_sql_row_contains_link_fields_and_guidance_owner(self) -> None:
        row = {
            "context_level": "domain", "context_key": "D001", "domain_key": "D001",
            "item_type": "skill", "item_key": "example", "name": "Example",
            "plain_meaning": "Meaning", "contextual_use": "Use", "expected_output": "Output",
            "priority": "start_here", "priority_reason": "Reason", "prerequisites": [],
            "related_items": [], "source_ids": ["src"], "source_references": [{"url": "https://example.org"}],
            "source_locators": [{"section": "x"}], "geographic_scope": "global",
            "evidence_limitations": [], "evidence_type": "source_supported_synthesis",
            "source_confidence": "high", "data_state": "source_backed", "link_state": "no_link",
            "link_url": None, "link_title": None, "link_source_reference": {}, "link_accessed_at": None,
            "link_confidence": "low", "link_evidence": {"status": "no_item_specific_source_verified"},
            "no_link_reason": "No reviewed item-specific link.", "guidance_owner": "domain",
            "verified_at": "2026-09-19",
        }
        sql = self.builder.row_sql(row)
        self.assertIn("'no_link'", sql)
        self.assertIn("'domain'", sql)
        self.assertGreaterEqual(sql.count(","), 28)


if __name__ == "__main__":
    unittest.main()
