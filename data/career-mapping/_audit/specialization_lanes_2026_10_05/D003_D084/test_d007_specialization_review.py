import json
import unittest
from pathlib import Path


REVIEW = Path(__file__).with_name("D007_specialization_review.json")


class D007SpecializationReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_candidate_set_and_parent(self):
        self.assertEqual(self.review["domain_id"], "D007")
        areas = self.review["candidate_specializations"]
        self.assertEqual(self.review["decision"]["count"], 3)
        self.assertEqual(len(areas), 3)
        self.assertEqual(len({area["key"] for area in areas}), 3)

    def test_each_area_has_resolving_evidence_and_boundary(self):
        source_ids = {row["source_id"] for row in self.review["source_register"]}
        for source in self.review["source_register"]:
            self.assertTrue(source["locator"])
            self.assertTrue(source["supports"])
            self.assertTrue(source["does_not_support"])
        for area in self.review["candidate_specializations"]:
            self.assertGreaterEqual(len(area["source_basis"]), 2)
            self.assertTrue(set(area["source_basis"]).issubset(source_ids))
            self.assertTrue(area["boundary"])

    def test_accessibility_is_focused_but_cross_cutting(self):
        area = next(x for x in self.review["candidate_specializations"] if x["key"] == "accessibility-and-inclusive-design")
        self.assertIn("responsibility", area["boundary"])
        self.assertTrue(any(x["topic"] == "Accessibility and usability quality" for x in self.review["cross_cutting_not_separate_specializations"]))

    def test_roles_remain_out_of_scope(self):
        self.assertIn("not_reviewed_here", self.review["decision"]["role_assignment_status"])
        self.assertTrue(all("role" not in area for area in self.review["candidate_specializations"]))


if __name__ == "__main__":
    unittest.main()
