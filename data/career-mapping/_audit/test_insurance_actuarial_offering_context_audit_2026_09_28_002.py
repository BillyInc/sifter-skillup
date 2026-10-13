"""Regression tests for distinct Insurance/Actuarial JAMB source contexts."""

import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[3]
JAMB_ADMIN = ROOT / "data/career-mapping/jamb/administration_offerings.json"
ADMIN_TEXT = ROOT / "data/career-mapping/_jamb_txt/Administration.txt"
SOCIAL_TEXT = ROOT / "data/career-mapping/_jamb_txt/Social Management Science.txt"
SOCIAL_LEDGER = ROOT / "data/career-mapping/jamb/social_management_offerings.json"
CHECKPOINT = ROOT / "data/career-mapping/_audit/insurance_actuarial_offering_context_audit_2026-09-28_002.md"


class InsuranceActuarialOfferingContextTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        admin = json.loads(JAMB_ADMIN.read_text(encoding="utf-8"))
        cls.combined_row = next(
            row for row in admin["programmes"]
            if row.get("jamb_name") == "Insurance and Actuarial Science"
        )
        cls.admin_text = ADMIN_TEXT.read_text(encoding="cp1252").splitlines()
        cls.social_text = SOCIAL_TEXT.read_text(encoding="cp1252").splitlines()
        cls.social_ledger = json.loads(SOCIAL_LEDGER.read_text(encoding="utf-8"))
        cls.checkpoint = CHECKPOINT.read_text(encoding="utf-8")

    def test_combined_administration_cell_has_all_three_awarders(self):
        self.assertEqual(
            self.combined_row["institutions"], ["BAZE", "IMSU", "WESLEYUNI"]
        )
        locator = self.combined_row["source_verification"]["pdf_table_locator"]
        self.assertIn("1630-1634", locator)
        self.assertTrue(self.combined_row["source_verification"]["verified_against_pdf"])
        title_line = next(
            i for i, line in enumerate(self.admin_text)
            if line.strip().startswith("INSURANCE AND")
            and i + 1 < len(self.admin_text)
            and self.admin_text[i + 1].strip().startswith("ACTUARIAL SCIENCE")
        )
        block = "\n".join(self.admin_text[title_line:title_line + 5])
        self.assertIn("INSURANCE AND", block)
        for code in self.combined_row["institutions"]:
            self.assertIn(code, block)

    def test_social_sciences_actuarial_is_a_separate_awarder_cell(self):
        # Printed p. 579 ends immediately before the printed p. 580 standalone
        # ACTUARIAL SCIENCE cell. Stop at the next programme title FINANCE.
        title_line = next(
            i for i, line in enumerate(self.social_text)
            if line.strip() == "ACTUARIAL SCIENCE"
        )
        next_title = next(
            i for i in range(title_line + 1, len(self.social_text))
            if self.social_text[i].strip().startswith("FINANCE")
        )
        text = "\n".join(self.social_text[title_line:next_title])
        self.assertIn("ACTUARIAL SCIENCE", text)
        expected = [
            "ABU", "BENIN", "CUST", "DOU", "FED-DUTSE",
            "LASUSTECH", "LAPAI", "PC-UNI", "SALEM",
        ]
        for code in expected:
            self.assertIn(code, text)
        self.assertNotIn("WESLEYUNI", text)
        self.assertNotIn("BAZE", text)
        self.assertNotIn("IMSU", text)

    def test_social_sciences_actuarial_occurrence_is_added_without_collapsing_admin_contexts(self):
        matches = [
            row for row in self.social_ledger["programmes"]
            if row.get("jamb_name") == "Actuarial Science"
        ]
        self.assertEqual(len(matches), 1)
        row = matches[0]
        expected = ["ABU", "BENIN", "CUST", "DOU", "FED-DUTSE", "LASUSTECH", "LAPAI", "PC-UNI", "SALEM"]
        self.assertEqual(row["institutions"], expected)
        self.assertEqual(row["source_verification"]["official_source_url"],
                         "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf")
        self.assertIn("printed p. 580", row["source_verification"]["pdf_table_locator"])
        self.assertIn("lines 283-289", row["source_verification"]["pdf_table_locator"])
        self.assertIsNone(row["utme_subjects"])
        self.assertIsNone(row["olevel_requirement"])
        self.assertIsNone(row["direct_entry"])
        self.assertEqual(row["institution_waivers"], [])

        admin_actuarial = [
            item for item in json.loads(JAMB_ADMIN.read_text(encoding="utf-8"))["programmes"]
            if item.get("jamb_name") == "Actuarial Science"
        ]
        combined = [
            item for item in json.loads(JAMB_ADMIN.read_text(encoding="utf-8"))["programmes"]
            if item.get("jamb_name") == "Insurance and Actuarial Science"
        ]
        self.assertEqual(len(admin_actuarial), 1)
        self.assertEqual(len(combined), 1)
        self.assertNotEqual(admin_actuarial[0]["institutions"], row["institutions"])
        self.assertEqual(combined[0]["institutions"], ["BAZE", "IMSU", "WESLEYUNI"])
        self.assertIn("second confirmed inventory/context-preservation defect", self.checkpoint)
        self.assertIn("source occurrence is absent", self.checkpoint)


if __name__ == "__main__":
    unittest.main()
