import json
import unittest
from pathlib import Path


REVIEW = Path(__file__).with_name("D006_specialization_review.json")


class D006SpecializationReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_lane_and_candidate_set(self):
        self.assertEqual(self.review["lane"], "D003-D084")
        self.assertEqual(self.review["domain_id"], "D006")
        candidates = self.review["candidate_specializations"]
        self.assertEqual(self.review["decision"]["count"], len(candidates))
        self.assertEqual(len(candidates), 3)
        self.assertEqual(len({item["key"] for item in candidates}), 3)

    def test_sources_and_boundaries_resolve(self):
        source_ids = {row["source_id"] for row in self.review["source_register"]}
        self.assertGreaterEqual(len(source_ids), 4)
        for row in self.review["source_register"]:
            self.assertTrue(row["url"])
            self.assertTrue(row["locator"])
            self.assertTrue(row["supports"])
            self.assertTrue(row["does_not_support"])
        for item in self.review["candidate_specializations"]:
            self.assertGreaterEqual(len(item["source_basis"]), 2)
            self.assertTrue(set(item["source_basis"]).issubset(source_ids))
            self.assertTrue(item["scope"])
            self.assertTrue(item["boundary"])

    def test_no_role_fit_or_isco_inference(self):
        self.assertIn("not_reviewed_here", self.review["decision"]["role_assignment_status"])
        self.assertTrue(self.review["current_state"]["role_count_is_not_used_to_set_specialization_count"])
        self.assertTrue(all("role" not in item for item in self.review["candidate_specializations"]))

    def test_cross_cutting_items_are_not_automatically_specializations(self):
        topics = {item["topic"] for item in self.review["cross_cutting_not_separate_specializations"]}
        self.assertIn("Sensing and actuation", topics)
        self.assertIn("Connectivity and communications protocols", topics)
        self.assertIn("Cybersecurity, privacy, safety and trustworthiness", topics)


if __name__ == "__main__":
    unittest.main()
