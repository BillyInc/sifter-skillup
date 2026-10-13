import json
import unittest
from pathlib import Path


REGISTER = Path(__file__).with_name("global_step1_specialization_reconciliation_2026_10_06.json")


class GlobalStep1RegisterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(REGISTER.read_text(encoding="utf-8"))

    def test_all_168_catalogue_domains_appear_once(self):
        rows = self.data["domains"]
        self.assertEqual(len(rows), 168)
        self.assertEqual(self.data["unique_domain_count"], 168)
        self.assertEqual(self.data["missing_domain_ids"], [])
        self.assertEqual(self.data["duplicate_domain_ids"], [])

    def test_current_subgroup_comparison_is_present_for_every_domain(self):
        self.assertEqual(self.data["domains_with_current_subgroup_comparison"], 168)

    def test_source_capture_addendum_closes_the_single_d090_locator_gap(self):
        self.assertEqual(self.data["source_capture_complete_count"], 168)
        d090 = next(row for row in self.data["domains"] if row["domain_id"] == "D090")
        self.assertTrue(d090["source_capture_complete"])
        self.assertEqual(d090["source_capture_quality"]["supplemental_source_capture_count"], 1)

    def test_pending_and_unresolved_cases_are_not_reported_as_complete(self):
        counts = self.data["step1_status_counts"]
        self.assertEqual(counts.get("candidate_set_needs_final_reconciliation", 0), 0)
        self.assertEqual(counts.get("parent_scope_unresolved", 0), 0)
        self.assertEqual(counts.get("recommendation_reconciled"), 164)
        self.assertEqual(counts.get("no_specialization_recommended"), 4)
        self.assertTrue(self.data["step1_decisions_complete"])
        self.assertEqual(self.data["step1_decisions_dispositioned_count"], 168)

    def test_agent_reconciliation_supersedes_preliminary_rows_for_d029_d056(self):
        rows = {row["domain_id"]: row for row in self.data["domains"]}
        reconciled_ids = [
            "D029", "D030", "D031", "D032", "D033", "D035", "D036", "D038",
            "D039", "D040", "D041", "D042", "D043", "D045", "D046", "D047",
            "D048", "D049", "D050", "D052", "D053", "D055", "D056",
        ]
        for domain_id in reconciled_ids:
            self.assertEqual(rows[domain_id]["step1_status"], "recommendation_reconciled")
            self.assertGreater(rows[domain_id]["recommended_area_count"], 0)
            self.assertTrue(rows[domain_id]["source_capture_complete"])

    def test_d068_parent_scope_hold_has_a_source_backed_step1_resolution(self):
        d068 = next(row for row in self.data["domains"] if row["domain_id"] == "D068")
        self.assertEqual(d068["step1_status"], "recommendation_reconciled")
        self.assertEqual(d068["recommended_area_count"], 3)
        self.assertEqual(
            [area["label"] for area in d068["recommended_areas"]],
            ["Rehabilitation and Functional Health Services", "Biomedical Laboratory Diagnostics", "Medical Imaging and Radiography"],
        )
        self.assertTrue(d068["source_capture_complete"])

    def test_kepler_d001_d028_slice_is_complete_and_source_captured(self):
        rows = {row["domain_id"]: row for row in self.data["domains"]}
        expected = [f"D{i:03d}" for i in range(1, 21)] + ["D026", "D028"]
        for domain_id in expected:
            self.assertEqual(rows[domain_id]["step1_status"], "recommendation_reconciled")
            self.assertTrue(rows[domain_id]["source_capture_complete"])
            self.assertGreater(rows[domain_id]["recommended_area_count"], 0)

    def test_this_step_did_not_apply_taxonomy_or_national_or_role_links(self):
        self.assertEqual(self.data["canonical_taxonomy_changed_count"], 0)
        self.assertEqual(self.data["role_to_specialization_assigned_count"], 0)
        self.assertEqual(self.data["nigerian_context_applied_count"], 0)

    def test_computational_overlay_remains_distinct_from_role_assignment(self):
        overlay = self.data["computational_overlay_counts"]
        self.assertEqual(overlay["method_groups_without_explicit_role_link_resolved"], 38)
        self.assertEqual(overlay["canonical_taxonomy_changes"], 0)
        self.assertEqual(overlay["canonical_role_file_changes"], 0)


if __name__ == "__main__":
    unittest.main()
