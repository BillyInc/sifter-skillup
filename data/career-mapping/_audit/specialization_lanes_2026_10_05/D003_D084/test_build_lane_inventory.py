import unittest

from build_lane_inventory import build_lane


class BuildLaneInventoryTests(unittest.TestCase):
    def test_lane_excludes_d001_d002_and_includes_bounds(self):
        inventory = {
            "domains": [
                {"domain_id": f"D{i:03d}", "domain_name": str(i)}
                for i in (1, 2, 3, 84, 85)
            ]
        }
        result = build_lane(inventory, {"domain_reviews": []})
        self.assertEqual([row["domain_id"] for row in result["domains"]], ["D003", "D084"])

    def test_existing_review_is_counted_but_not_assumed_correct(self):
        inventory = {
            "domains": [
                {
                    "domain_id": "D003",
                    "domain_name": "AI",
                    "active_role_count": 4,
                    "visible_subgroup_count": 0,
                    "all_subgroup_records": [],
                    "specialization_set_review_status": "not_individually_reviewed",
                    "subgroup_structure_disposition": "unresolved",
                }
            ]
        }
        review = {"domain_reviews": [{"domain_id": "D003", "review_status": "candidate"}]}
        result = build_lane(inventory, review)
        self.assertEqual(result["counts"]["domains_with_existing_source_review"], 1)
        self.assertIsNone(result["domains"][0]["existing_review_recommendation_count"])


if __name__ == "__main__":
    unittest.main()
