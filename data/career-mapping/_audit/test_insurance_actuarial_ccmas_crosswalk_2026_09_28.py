"""Regression checks for the Insurance and Actuarial Science CCMAS crosswalk.

This is an audit-only test: it compares the saved JAMB scope against both
programme packages in the checked-in NUC CCMAS extraction. It never edits data.
"""

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
CCMAS_PATH = ROOT / "data/career-mapping/ccmas/administration_management.json"
SCOPE_PATH = ROOT / "data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json"
OFFERINGS_PATH = ROOT / "data/career-mapping/jamb/administration_offerings.json"
NUC_URL = "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf"
JAMB_URL = "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf"


class InsuranceActuarialCrosswalkTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.ccmas = json.loads(CCMAS_PATH.read_text(encoding="utf-8"))
        cls.scope_ledger = json.loads(SCOPE_PATH.read_text(encoding="utf-8"))
        cls.offering_ledger = json.loads(OFFERINGS_PATH.read_text(encoding="utf-8"))
        cls.components = {
            p["name"]: p
            for p in cls.ccmas["programmes"]
            if p.get("code") in {"INS", "ACS"}
        }
        cls.scope = next(
            row
            for row in cls.scope_ledger["rows"]
            if row.get("jamb_name") == "Insurance and Actuarial Science"
        )
        cls.offering = next(
            row
            for row in cls.offering_ledger["programmes"]
            if row.get("jamb_name") == "Insurance and Actuarial Science"
        )

    def test_both_complete_ccmas_components_are_selected_with_distinct_facets(self):
        self.assertEqual(
            self.scope["component_refs"],
            [
                "Administration and Management::Insurance",
                "Administration and Management::Actuarial Science",
            ],
        )
        selected = self.scope["selected_courses"]
        by_facet = {
            facet: [row for row in selected if row.get("scope_facet") == facet]
            for facet in ("insurance curriculum", "actuarial science curriculum")
        }
        expected = {
            "insurance curriculum": self.components["Insurance"]["courses"],
            "actuarial science curriculum": self.components["Actuarial Science"]["courses"],
        }
        for facet, source_courses in expected.items():
            with self.subTest(facet=facet):
                selected_courses = by_facet[facet]
                self.assertEqual(len(selected_courses), len(source_courses))
                self.assertCountEqual(
                    [row["code"] for row in selected_courses],
                    [row["code"] for row in source_courses],
                )
                selected_by_code = {row["code"]: row for row in selected_courses}
                for source in source_courses:
                    saved = selected_by_code[source["code"]]
                    self.assertEqual(saved["title"], source["title"])
                    self.assertEqual(saved["content_summary"], source["content_summary"])
                    self.assertEqual(saved["learning_outcomes"], source["skills_learned"])
                    self.assertTrue(saved["learning_outcomes"])
                    self.assertEqual(saved["source_ccmas_programme"], self.components[
                        "Insurance" if facet == "insurance curriculum" else "Actuarial Science"
                    ]["name"])

    def test_course_level_source_links_are_present_for_both_facets(self):
        for row in self.scope["selected_courses"]:
            with self.subTest(facet=row.get("scope_facet"), code=row.get("code")):
                self.assertEqual(row.get("source_url"), NUC_URL)
                self.assertTrue(row.get("source_locator"))
                self.assertIn("printed p", row["source_locator"])
                self.assertTrue(row.get("source_accessed_on"))

    def test_canonical_jamb_offering_identity_and_source_context_remain_distinct(self):
        self.assertEqual(self.offering["jamb_name"], "Insurance and Actuarial Science")
        self.assertEqual(self.offering["source_context_status"], "source_text_confirmed")
        self.assertTrue(self.offering["source_verification"]["verified_against_pdf"])
        self.assertEqual(self.offering["source_verification"]["official_source_url"], JAMB_URL)
        self.assertIn("INSURANCE AND ACTUARIAL SCIENCE", self.offering["source_verification"]["pdf_table_locator"])
        self.assertCountEqual(self.offering["institutions"], ["BAZE", "IMSU", "WESLEYUNI"])

    def test_scope_source_context_matches_verified_jamb_cell_without_overclaiming_provider_curriculum(self):
        context = self.scope["source_context"]
        self.assertEqual(context["institution_codes_source_confirmed"], ["BAZE", "IMSU", "WESLEYUNI"])
        self.assertNotIn("institution_codes_parsed_not_verified", context)
        self.assertIn("Administration.txt lines 1630-1634", context["jamb_locator"])
        self.assertIn("complete awarder cell", context["verification_method"])
        self.assertIn("institution's implementation", self.scope["scope_reason"])
        self.assertEqual(self.scope["scope_status"], "combined_scope_review_required")


if __name__ == "__main__":
    unittest.main()
