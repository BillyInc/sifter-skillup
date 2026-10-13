"""Regression gate for Sociology programme-theme resource coverage."""

from __future__ import annotations

import json
import unittest
from pathlib import Path


AUDIT = Path(__file__).with_name("_audit") / "sociology_programme_theme_resource_audit_2026_10_08.json"
MIGRATION = Path(__file__).parents[2] / "backend" / "migration_guidance_ownership_and_sociology_resources_2026-09-11.sql"


class SociologyProgrammeThemeResourceAuditTests(unittest.TestCase):
    def test_every_active_theme_has_a_recorded_learning_route(self) -> None:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        self.assertTrue(audit["coverage_pass"])
        self.assertEqual(14, audit["active_theme_count"])
        self.assertEqual(14, audit["matrix_theme_row_count"])
        self.assertEqual([], audit["active_themes_missing_migration_url"])
        self.assertEqual(25, audit["matrix_url_count"])
        self.assertTrue(audit["claim_reviewed_guidance_is_separate"])

    def test_africa_and_peace_resources_have_exact_theme_links(self) -> None:
        migration = MIGRATION.read_text(encoding="utf-8")
        expected = {
            "Principles and practices of peace education (OpenLearn)": (
                "shared_peace_conflict",
                "https://www.open.edu/openlearn/education-development/principles-and-practices-peace-education",
            ),
            "History of Conflicts in Nigeria (NOUN courseware)": (
                "shared_peace_conflict",
                "https://nou.edu.ng/coursewarecontent/PCR331%20HISTORY%20OF%20CONFLICTS%20IN%20NIGERIA.pdf",
            ),
            "The History of African Development (AEHN open textbook)": (
                "african_societies",
                "https://www.aehnetwork.org/textbook/",
            ),
            "Production Systems in Pre-colonial Africa (AEHN, Chapter 3)": (
                "african_societies",
                "https://www.aehnetwork.org/textbook/production-systems-in-pre-colonial-africa/",
            ),
            "African Demographics (AEHN, Chapter 8)": (
                "african_societies",
                "https://www.aehnetwork.org/textbook/how-many-people-are-too-many-people/",
            ),
            "Growing Cities: Urbanization in Africa (AEHN, Chapter 14)": (
                "african_societies",
                "https://www.aehnetwork.org/textbook/growing-cities-urbanization-in-africa/",
            ),
        }
        for resource_name, (theme_key, url) in expected.items():
            with self.subTest(resource=resource_name):
                self.assertIn(f"WHEN '{resource_name}' THEN", migration)
                self.assertIn(f"'{theme_key}', '{url}'", migration)

    def test_noun_culture_resource_uses_the_same_name_for_its_theme_url(self) -> None:
        migration = MIGRATION.read_text(encoding="utf-8")
        self.assertIn(
            "WHEN 'Nigerian Peoples and Culture (NOUN courseware)' THEN jsonb_build_object(",
            migration,
        )
        self.assertNotIn(
            "WHEN 'GST 201: Nigerian Peoples and Culture (NOUN courseware)' THEN jsonb_build_object(",
            migration,
        )
        self.assertIn(
            "'shared_nigerian_culture', 'https://nou.edu.ng/coursewarecontent/GST%20201%20%20NIGERIAN%20PEOPLES%20AND%20CULTURE.pdf'",
            migration,
        )


if __name__ == "__main__":
    unittest.main()
