from __future__ import annotations

import unittest

from generate_sociology_theme_resource_repair_2026_10_23 import SOURCE, build_sql


class SociologyThemeResourceRepairTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.sql = build_sql(SOURCE.read_text(encoding="utf-8"))

    def test_repair_is_transactional_and_uses_only_the_programme_reading_block(self) -> None:
        self.assertTrue(self.sql.startswith("-- Generated from migration_guidance_ownership"))
        self.assertTrue(self.sql.rstrip().endswith("COMMIT;"))
        self.assertIn("INSERT INTO _sociology_theme_resource_seed", self.sql)
        self.assertNotIn("INSERT INTO skillup_dev.career_context_items", self.sql)
        self.assertNotIn("INSERT INTO skillup_dev.domain_tools", self.sql)

    def test_repair_updates_existing_rows_then_inserts_only_missing_identities(self) -> None:
        self.assertIn("UPDATE skillup_dev.career_learning_resources AS target", self.sql)
        self.assertIn("WHERE NOT EXISTS (", self.sql)
        self.assertIn("duplicate programme-reading identities", self.sql)
        self.assertIn("Expected 18 reviewed Sociology resource rows after repair", self.sql)

    def test_repair_checks_complete_active_theme_coverage(self) -> None:
        self.assertIn("IF mapped_themes <> 14 THEN", self.sql)
        self.assertIn("sociology_programme_v1", self.sql)
        self.assertIn("approved_guidance_v1", self.sql)
        self.assertIn(") AS theme_keys(theme_key)", self.sql)


if __name__ == "__main__":
    unittest.main()
