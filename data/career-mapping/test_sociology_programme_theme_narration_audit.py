"""Regression gate for Sociology theme-to-curriculum evidence coverage."""

from __future__ import annotations

import json
import unittest
from pathlib import Path


AUDIT = Path(__file__).with_name("_audit") / "sociology_programme_theme_narration_audit_2026_10_08.json"


class SociologyProgrammeThemeNarrationAuditTests(unittest.TestCase):
    def test_all_active_themes_have_narration_and_course_evidence(self) -> None:
        audit = json.loads(AUDIT.read_text(encoding="utf-8"))
        self.assertTrue(audit["pass"], audit.get("errors"))
        self.assertEqual(34, audit["courseMapCount"])
        self.assertEqual(34, audit["contractCourseCount"])
        self.assertEqual(14, audit["activeThemeCount"])
        self.assertEqual(14, audit["themeCountWithNarration"])
        self.assertEqual(14, audit["themeCountWithCourseEvidence"])
        for theme in audit["themes"]:
            self.assertTrue(theme["narration"].strip())
            self.assertTrue(theme["courseAnchors"])
            self.assertTrue(all(anchor["sourceLocatorText"] for anchor in theme["courseAnchors"]))


if __name__ == "__main__":
    unittest.main()
