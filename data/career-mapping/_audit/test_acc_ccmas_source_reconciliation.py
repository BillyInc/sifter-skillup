import importlib.util
import json
import unittest
from pathlib import Path


SCRIPT = Path(__file__).with_name("repair_acc_ccmas_source_2026_09_25.py")
SPEC = importlib.util.spec_from_file_location("acc_ccmas_repair", SCRIPT)
repair = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(repair)


class AccCcmasSourceReconciliationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.after = json.loads(repair.SOURCE.read_text(encoding="utf-8"))
        cls.before = json.loads(repair.SNAPSHOT.read_text(encoding="utf-8"))
        cls.after_acc = next(p for p in cls.after["programmes"] if p["code"] == "ACC")
        cls.before_acc = next(p for p in cls.before["programmes"] if p["code"] == "ACC")

    def test_all_official_acc_course_codes_present_once(self):
        codes = [c["code"] for c in self.after_acc["courses"] if c["code"] in repair.CORRECTIONS]
        self.assertCountEqual(codes, repair.CORRECTIONS)
        self.assertEqual(len(codes), len(set(codes)))

    def test_title_summary_and_outcomes_match_correction_ledger(self):
        courses = {c["code"]: c for c in self.after_acc["courses"]}
        for code, expected in repair.CORRECTIONS.items():
            with self.subTest(code=code):
                self.assertEqual(courses[code]["title"], expected["title"])
                self.assertEqual(courses[code]["content_summary"], expected["content_summary"])
                self.assertEqual(courses[code]["learning_outcomes"], expected["learning_outcomes"])

    def test_non_target_acc_courses_and_fields_are_unchanged(self):
        before_courses = {c["code"]: c for c in self.before_acc["courses"]}
        after_courses = {c["code"]: c for c in self.after_acc["courses"]}
        edited_fields = {"title", "content_summary", "learning_outcomes"}
        residual_repair_fields = {"skills_learned", "source_url", "source_locator", "source_accessed_on"}
        for code, before in before_courses.items():
            after = after_courses[code]
            if code in repair.CORRECTIONS:
                course_edited_fields = edited_fields | (residual_repair_fields if code in {"ACC 102", "ACC 203", "ACC 206"} else set())
                self.assertEqual(
                    {k: v for k, v in before.items() if k not in course_edited_fields},
                    {k: v for k, v in after.items() if k not in course_edited_fields},
                )
            else:
                self.assertEqual(before, after, code)

        # Other CCMAS packages are undergoing independent source reconciliation;
        # this ACC-specific repair must not claim those packages are immutable.

    def test_project_absence_is_not_filled_with_invented_outcomes(self):
        project = next(c for c in self.after_acc["courses"] if c["code"] == "ACC 490")
        self.assertEqual(project["learning_outcomes"], [])
        self.assertIn("does not provide", project["content_summary"])


if __name__ == "__main__":
    unittest.main()
