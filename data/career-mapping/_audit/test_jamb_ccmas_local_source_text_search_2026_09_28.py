import json
import unittest

import augment_jamb_ccmas_local_source_text_search_2026_09_28 as search


class LocalSourceTextSearchTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads(search.OUT_JSON.read_text(encoding="utf-8"))

    def test_all_current_jamb_occurrences_and_ccmas_course_rows_are_queued(self):
        scope = self.report["scope"]
        self.assertEqual(scope["jamb_offering_occurrences"], 443)
        self.assertEqual(len(self.report["jamb_occurrences"]), 443)
        self.assertEqual(scope["ccmas_packages"], 237)
        self.assertEqual(scope["ccmas_course_rows"], sum(len(package["courses"]) for package in self.report["ccmas_packages"]))

    def test_local_text_availability_is_distinct_from_source_unavailability(self):
        self.assertEqual(self.report["scope"]["ccmas_missing_local_text_source_files"], 5)
        names = {row["source_file"] for row in self.report["ccmas_missing_local_text_source_files"]}
        self.assertEqual(names, {
            "administration_management.json",
            "agricultural_science.json",
            "law.json",
            "medicine_dentistry.json",
            "social_sciences.json",
        })
        self.assertTrue(any("do not mean" in text for text in self.report["method_limits"]))

    def test_wrapped_title_search_returns_candidate_line_context(self):
        text = "prefix\nCOMPUTER SCIENCE AND\nMATHEMATICS\nawarders"
        hits = search.find_wrapped_title(text, "Computer Science and Mathematics")
        self.assertEqual(len(hits), 1)
        self.assertEqual(hits[0]["line_start"], 2)
        self.assertEqual(hits[0]["line_end"], 3)


if __name__ == "__main__":
    unittest.main()
