"""Quality gates for source-owned domain learning items."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


CAREER_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(CAREER_DIR))

import _build_contextual_guidance_items as builder  # noqa: E402


class DomainGuidanceContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.rows = builder.build()
        cls.domain_rows = [row for row in cls.rows if row["context_level"] == "domain"]

    def test_domain_items_have_domain_ownership_and_item_sources(self) -> None:
        self.assertTrue(self.domain_rows)
        for row in self.domain_rows:
            with self.subTest(domain=row["context_key"], item=row["name"]):
                self.assertEqual(row["guidance_owner"], "domain")
                self.assertTrue(row["source_ids"])
                self.assertTrue(row["source_references"])
                self.assertTrue(all(ref["url"].startswith("https://") for ref in row["source_references"]))

    def test_domain_foundations_do_not_claim_an_unverified_learning_order(self) -> None:
        for row in self.domain_rows:
            with self.subTest(domain=row["context_key"], item=row["name"]):
                self.assertEqual(row["prerequisites"], [])
                self.assertEqual(row["related_items"], [])
                self.assertIn("not a ranking", row["priority_reason"])

    def test_domain_credentials_require_an_exact_reviewed_source_link(self) -> None:
        for row in self.domain_rows:
            if row["item_type"] != "certification":
                continue
            with self.subTest(domain=row["context_key"], credential=row["name"]):
                self.assertEqual(row["link_state"], "linked")
                self.assertIn("credential_specific_evidence", [locator.get("evidenceKind") for locator in row["source_locators"]])

    def test_domain_items_do_not_use_generic_capability_copy(self) -> None:
        for row in self.domain_rows:
            with self.subTest(domain=row["context_key"], item=row["name"]):
                self.assertNotIn("This capability is recorded", row["plain_meaning"])
                self.assertNotIn("work product appropriate to the field", row["expected_output"])


if __name__ == "__main__":
    unittest.main()
