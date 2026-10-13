import json
import unittest
from pathlib import Path


SOURCE = Path(__file__).parents[1] / "ccmas" / "administration_management.json"
DOCUMENT = json.loads(SOURCE.read_text(encoding="utf-8"))
PROGRAMMES = {row.get("code"): row for row in DOCUMENT["programmes"]}
SOCIAL_SOURCE = Path(__file__).parents[1] / "ccmas" / "social_sciences.json"
SOCIAL_DOCUMENT = json.loads(SOCIAL_SOURCE.read_text(encoding="utf-8"))
COMPUTING_SOURCE = Path(__file__).parents[1] / "ccmas" / "computing.json"
COMPUTING_DOCUMENT = json.loads(COMPUTING_SOURCE.read_text(encoding="utf-8"))
LAW_SOURCE = Path(__file__).parents[1] / "ccmas" / "law.json"
LAW_DOCUMENT = json.loads(LAW_SOURCE.read_text(encoding="utf-8"))


class FinanceProcurementTableAdjudicationTests(unittest.TestCase):
    def test_law_ent211_source_summary_restored_and_parse_debris_removed(self):
        for programme_code in ("LAW", "ICL"):
            programme = next(p for p in LAW_DOCUMENT["programmes"] if p.get("code") == programme_code)
            course = next(c for c in programme["courses"] if c.get("code") == "ENT 211")
            with self.subTest(programme=programme_code):
                self.assertEqual(course["source_state"], "source_backed")
                self.assertEqual(course["source_url"], "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf")
                self.assertIn("printed pp. 33-34", course["source_locator"])
                self.assertEqual(course["source_accessed_on"], "2026-09-28")
                self.assertIn("business planning", course["content_summary"])
                self.assertEqual(len(course["skills_learned"]), 8)
                self.assertEqual(course["skills_learned"][-1], "state the basic principles of e-commerce")
                self.assertFalse(any("**NOTE**" in item or "â" in item for item in course["skills_learned"]))

    def test_common_islamic_law_course_summaries_and_outcomes_are_source_backed(self):
        programme = next(p for p in LAW_DOCUMENT["programmes"] if p.get("code") == "ICL")
        courses = {c["code"]: c for c in programme["courses"]}
        expected_pages = {
            "ICL 301": "printed pp. 72-73",
            "JIL 501": "printed pp. 78-79",
            "JIL 502": "printed pp. 79-80",
            "PPL 501": "printed pp. 79-80",
            "PPL 502": "printed pp. 79-80",
        }
        for code, locator in expected_pages.items():
            with self.subTest(code=code):
                course = courses[code]
                self.assertEqual(course["source_state"], "source_backed")
                self.assertTrue(course["content_summary"])
                self.assertEqual(course["source_url"], "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf")
                self.assertIn(locator, course["source_locator"])
                self.assertEqual(course["source_accessed_on"], "2026-09-28")
                self.assertFalse(any(item.endswith(('\\"', '"')) for item in course["skills_learned"]))
        self.assertEqual(len(courses["ICL 301"]["skills_learned"]), 4)
        self.assertIn("FLAG-G", courses["ICL 301"]["flags"])
        for code in ("JIL 501", "JIL 502"):
            self.assertTrue(courses[code]["disputed"]["needs_owner_decision"])
            self.assertIn("lh", courses[code]["disputed"]["nuc_structure_table"])
        for code in ("PPL 501", "PPL 502"):
            self.assertIn("FLAG-D", courses[code]["flags"])
            self.assertIn("corroborated", courses[code]["resolution"])

    def test_information_systems_load_uses_global_table_and_preserves_detail_conflict(self):
        information_systems = next(p for p in COMPUTING_DOCUMENT["programmes"] if p.get("code") == "INS")
        expected = {"MTH 101": (2, 30), "MTH 102": (2, 30), "PHY 101": (2, 30)}
        for code, (units, lecture_hours) in expected.items():
            with self.subTest(code=code):
                course = next(c for c in information_systems["courses"] if c.get("code") == code)
                self.assertEqual((course["units"], course["lh"], course["ph"]), (units, lecture_hours, 0))
                self.assertEqual(course["source_url"], "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf")
                self.assertIn("printed p. 149", course["source_locator"])
                self.assertIn("discrepancy", course["flags"][0].lower())
                self.assertEqual(course["source_accessed_on"], "2026-09-28")
                self.assertTrue(course["content_summary"])
                if code == "MTH 101":
                    self.assertIn("Venn diagrams", course["content_summary"])
                    self.assertIn("complex numbers", course["content_summary"])
                elif code == "MTH 102":
                    self.assertIn("differentiation techniques", course["content_summary"])
                    self.assertIn("areas and volumes", course["content_summary"])
                else:
                    self.assertIn("Newton's laws", course["content_summary"])
                    self.assertIn("satellites and orbits", course["content_summary"])

    def test_software_engineering_shared_computing_courses_keep_context_and_load_conflicts(self):
        software_engineering = next(p for p in COMPUTING_DOCUMENT["programmes"] if p.get("code") == "SEN")
        courses = {c["code"]: c for c in software_engineering["courses"]}
        for code, page_locator in (("COS 102", "printed pp. 209-210"), ("COS 409", "printed pp. 221-222")):
            with self.subTest(code=code):
                course = courses[code]
                self.assertEqual(course["source_state"], "source_backed")
                self.assertTrue(course["content_summary"])
                self.assertEqual(course["source_url"], "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf")
                self.assertIn(page_locator, course["source_locator"])
                self.assertEqual(course["source_accessed_on"], "2026-09-28")
                self.assertTrue(any("detailed-block conflict" in flag for flag in course["flags"]))
                self.assertEqual(len(course["skills_learned"]), 6)
        self.assertEqual((courses["COS 102"]["units"], courses["COS 102"]["lh"], courses["COS 102"]["ph"]), (3, 30, 45))
        self.assertEqual((courses["COS 409"]["units"], courses["COS 409"]["lh"], courses["COS 409"]["ph"]), (3, 30, 0))
        self.assertIn("flowcharts", courses["COS 102"]["content_summary"])
        self.assertIn("hypothesis testing", courses["COS 409"]["content_summary"])

    def test_ppe_philosophy_courses_use_their_exact_nuc_detail_blocks(self):
        ppe = next(p for p in SOCIAL_DOCUMENT["programmes"] if p.get("code") == "PPE")
        courses = {c["code"]: c for c in ppe["courses"]}
        for code in ("PHL 301", "PHL 302", "PHL 305"):
            with self.subTest(code=code):
                course = courses[code]
                self.assertEqual(course["source_state"], "source_backed")
                self.assertTrue(course["skills_learned"])
                self.assertTrue(course["content_summary"])
                self.assertEqual(course["source_url"], "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf")
                self.assertEqual(course["source_accessed_on"], "2026-09-28")
        self.assertIn("printed pp. 239-240", courses["PHL 301"]["source_locator"])
        self.assertIn("PHL 205", courses["PHL 302"]["flags"][0])
        self.assertIn("PHL 303", courses["PHL 305"]["flags"][0])
        table_only = courses["PHL 306"]
        self.assertEqual(table_only["source_state"], "table_only")
        self.assertEqual(table_only["skills_learned"], [])
        self.assertIsNone(table_only["content_summary"])
        self.assertIn("printed p. 226", table_only["source_locator"])

    def test_finance_table_only_lists_fin101_not_phantom_fin102(self):
        finance = PROGRAMMES["FIN"]
        codes = [course.get("code") for course in finance["courses"]]
        self.assertIn("FIN 101", codes)
        self.assertNotIn("FIN 102", codes)
        self.assertTrue(
            any(
                flag.startswith("FIN (17): FIN 102 is not listed in the Finance global course structure")
                for flag in DOCUMENT["document_flags"]
            )
        )

    def test_prm408_retains_only_table_supported_identity_and_load(self):
        procurement = PROGRAMMES["PRM"]
        course = next(c for c in procurement["courses"] if c.get("code") == "PRM 408")
        self.assertEqual(course["title"], "Case Studies in Procurement Management")
        self.assertEqual((course["units"], course["status"], course["lh"], course["ph"]), (2, "C", 30, None))
        self.assertEqual(course["skills_learned"], [])
        self.assertIsNone(course.get("content_summary"))
        self.assertEqual(course["source_state"], "table_only")
        self.assertEqual(
            course["source_url"],
            "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf",
        )
        self.assertIn("printed p. 464", course["source_locator"])
        self.assertEqual(course["source_accessed_on"], "2026-09-28")

    def test_social_sciences_lis228_is_cited_table_only_without_invented_content(self):
        lis = next(p for p in SOCIAL_DOCUMENT["programmes"] if p.get("code") == "LIS")
        course = next(c for c in lis["courses"] if c.get("code") == "LIS 228")
        self.assertEqual(course["title"], "Information Literacy")
        self.assertEqual((course["units"], course["status"], course["lh"], course["ph"]), (2, "C", 30, None))
        self.assertEqual(course["source_state"], "table_only")
        self.assertEqual(course["skills_learned"], [])
        self.assertIsNone(course.get("content_summary"))
        self.assertEqual(
            course["source_url"],
            "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
        )
        self.assertIn("Printed p. 139", course["source_locator"])
        self.assertEqual(course["source_accessed_on"], "2026-09-28")

    def test_lis322_keeps_table_identity_and_explicit_detail_code_conflict(self):
        lis = next(p for p in SOCIAL_DOCUMENT["programmes"] if p.get("code") == "LIS")
        course = next(c for c in lis["courses"] if c.get("code") == "LIS 322")
        self.assertEqual(course["source_state"], "source_conflict")
        self.assertEqual((course["units"], course["lh"]), (2, 30))
        self.assertIn("identical title as LIS 225", course["flags"][0])
        self.assertIn("printed p. 141", course["source_locator"])
        self.assertIn("printed pp. 149-150", course["source_locator"])
        self.assertTrue(course["content_summary"])
        self.assertEqual(len(course["skills_learned"]), 7)
        self.assertEqual(
            course["source_url"],
            "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
        )
        self.assertEqual(course["source_accessed_on"], "2026-09-28")

    def test_data_science_dts322_content_is_restored_from_nuc(self):
        computing = json.loads((Path(__file__).parents[1] / "ccmas" / "computing.json").read_text(encoding="utf-8"))
        programme = next(p for p in computing["programmes"] if p.get("code") == "DTS")
        course = next(c for c in programme["courses"] if c.get("code") == "DTS 322")
        self.assertIn("business models and business plans", course["content_summary"])
        self.assertIn("market research", course["content_summary"])
        self.assertEqual(course["source_url"], "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf")
        self.assertIn("printed CCMAS p. 112", course["source_locator"])
        self.assertEqual(course["source_accessed_on"], "2026-09-28")


if __name__ == "__main__":
    unittest.main()
