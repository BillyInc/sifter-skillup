import json
import unittest
from pathlib import Path


REGISTER = Path(__file__).with_name("role_coverage_candidate_register.json")
CAREER_ROOT = Path(__file__).parents[3]


class RoleCoverageRegisterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(REGISTER.read_text(encoding="utf-8"))

    def test_current_lane_count_and_batch_domain_keys_are_exact(self):
        self.assertEqual(self.data["count_method"]["current_lane_total"], 562)
        domains = self.data["domains"]
        self.assertEqual([d["domain_id"] for d in domains], [f"D{i:03}" for i in range(45, 85)])
        self.assertEqual(sum(d["active_role_count"] for d in domains), 562)
        self.assertEqual(self.data["count_method"]["coverage_inventory_domains_recorded"], 40)
        self.assertEqual(self.data["count_method"]["coverage_inventory_domains_remaining"], 0)

    def test_active_counts_match_current_canonical_records_and_lane_queue(self):
        structure = json.loads((CAREER_ROOT / "domain_structure.json").read_text(encoding="utf-8"))
        worklist = json.loads((Path(__file__).parents[2] / "role_fit_lanes_2026_10_05" / "D001_D084" / "D045_D084_parent_domain_review_worklist.json").read_text(encoding="utf-8"))
        queue_counts = worklist["domain_counts"]
        queue_mismatches = []
        for domain in self.data["domains"]:
            domain_id = domain["domain_id"]
            self.assertEqual(domain["active_role_count"], structure[domain_id]["role_count"])
            if domain["active_role_count"] != queue_counts.get(domain_id, 0):
                queue_mismatches.append((domain_id, domain["active_role_count"], queue_counts.get(domain_id, 0)))
        self.assertEqual(queue_mismatches, [("D078", 23, 24)])

    def test_candidate_keys_unique_and_exactly_scoped(self):
        keys = [c["candidate_key"] for d in self.data["domains"] for c in d["candidates"]]
        self.assertEqual(len(keys), len(set(keys)))
        for d in self.data["domains"]:
            for c in d["candidates"]:
                self.assertTrue(c["candidate_key"].startswith(d["domain_id"] + "|"))

    def test_candidates_have_tasks_fit_title_and_authoritative_sources(self):
        for d in self.data["domains"]:
            for c in d["candidates"]:
                self.assertTrue(c["tasks"].strip())
                self.assertTrue(c["parent_domain_fit"].strip())
                self.assertTrue(c["title_status"].strip())
                self.assertTrue(c["source_refs"])
                self.assertNotEqual(c["nigeria_variant"], "")
                for source_id in c["source_refs"]:
                    self.assertIn(source_id, self.data["sources"])
                    self.assertTrue(self.data["sources"][source_id]["url"].startswith("https://"))

    def test_zero_role_domains_have_candidates(self):
        for d in self.data["domains"]:
            if d["active_role_count"] == 0:
                self.assertTrue(d["candidates"])

    def test_active_and_candidate_library_counts_are_not_conflated(self):
        structure = json.loads((CAREER_ROOT / "domain_structure.json").read_text(encoding="utf-8"))
        for d in self.data["domains"]:
            domain_file = CAREER_ROOT / "_audit" / "domains" / f"{d['domain_id']}.json"
            if domain_file.exists() and "candidate_library_record_count" in d:
                source = json.loads(domain_file.read_text(encoding="utf-8"))
                self.assertEqual(d["candidate_library_record_count"], source["role_count"])
            self.assertEqual(d["active_role_count"], structure[d["domain_id"]]["role_count"])

    def test_no_subgroup_assignments_or_canonical_edits(self):
        self.assertFalse(self.data["scope"]["canonical_edits"])
        self.assertEqual(self.data["scope"]["subgroup_assignment"], "deferred; no subgroup links proposed or written")
        for d in self.data["domains"]:
            for c in d["candidates"]:
                self.assertNotIn("subgroup_id", c)


if __name__ == "__main__":
    unittest.main()
