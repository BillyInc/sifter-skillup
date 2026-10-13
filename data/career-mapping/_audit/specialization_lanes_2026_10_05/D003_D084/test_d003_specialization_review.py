import json
import unittest
from pathlib import Path


REVIEW = Path(__file__).with_name("D003_specialization_review.json")


class D003SpecializationReviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.review = json.loads(REVIEW.read_text(encoding="utf-8"))

    def test_exact_domain_and_five_candidate_areas(self):
        self.assertEqual(self.review["domain_id"], "D003")
        self.assertEqual(self.review["decision"]["count"], 5)
        self.assertEqual(len(self.review["candidate_specializations"]), 5)
        self.assertEqual(
            len({row["key"] for row in self.review["candidate_specializations"]}), 5
        )

    def test_each_candidate_has_two_independent_primary_sources(self):
        source_ids = {row["source_id"] for row in self.review["source_register"]}
        self.assertEqual(len(source_ids), 2)
        for candidate in self.review["candidate_specializations"]:
            self.assertEqual(set(candidate["source_basis"]), source_ids)

    def test_no_role_assignments_are_approved(self):
        self.assertIn("not_reviewed_here", self.review["decision"]["role_assignment_status"])
        self.assertIn("No canonical role mapping", self.review["criteria_disposition"]["role_separation"])

    def test_sources_record_claim_limits_and_cross_cutting_items(self):
        for source in self.review["source_register"]:
            self.assertTrue(source["supports"])
            self.assertTrue(source["does_not_support"])
            self.assertTrue(source["locator"])
        self.assertEqual(len(self.review["cross_cutting_not_separate_specializations"]), 3)

    def test_d004_count_matches_candidate_list_and_independent_frameworks(self):
        d004 = json.loads(Path(__file__).with_name("D004_specialization_review.json").read_text(encoding="utf-8"))
        self.assertEqual(d004["decision"]["count"], 8)
        self.assertEqual(len(d004["candidate_specializations"]), 8)
        for area in d004["candidate_specializations"]:
            self.assertGreaterEqual(len(area["source_basis"]), 2)
        self.assertEqual(d004["decision"]["role_assignment_status"].split(";")[0], "not_reviewed_here")


if __name__ == "__main__":
    unittest.main()
