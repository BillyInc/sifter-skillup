import json
import unittest
from pathlib import Path


REVIEW = Path(__file__).with_name("D005_specialization_review.json")


class D005SpecializationReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_lane_and_four_candidate_areas(self):
        self.assertEqual(self.review["lane"], "D003-D084")
        self.assertEqual(self.review["domain_id"], "D005")
        self.assertEqual(self.review["decision"]["count"], 4)
        self.assertEqual(len(self.review["candidate_specializations"]), 4)

    def test_every_area_has_multiple_sources_and_boundaries(self):
        source_ids = {row["source_id"] for row in self.review["source_register"]}
        for area in self.review["candidate_specializations"]:
            self.assertGreaterEqual(len(area["source_basis"]), 2)
            self.assertTrue(set(area["source_basis"]).issubset(source_ids))
            self.assertTrue(area["boundary"])

    def test_no_role_fit_is_inferred(self):
        self.assertIn("not_reviewed_here", self.review["decision"]["role_assignment_status"])
        self.assertTrue(all("role" not in area for area in self.review["candidate_specializations"]))

    def test_structural_concepts_are_not_counted_as_areas(self):
        topics = {row["topic"] for row in self.review["cross_cutting_not_separate_specializations"]}
        self.assertIn("IaaS, PaaS and SaaS; public, private and hybrid cloud", topics)
        self.assertIn("FinOps and cloud cost optimization", topics)


if __name__ == "__main__":
    unittest.main()
