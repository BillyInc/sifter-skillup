import json
import unittest
from pathlib import Path


REGISTER = Path(__file__).with_name("d001_d056_step1_reconciliation_register_2026_10_06.json")


class Step1ReconciliationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = json.loads(REGISTER.read_text(encoding="utf-8"))
        cls.rows = cls.data["domains"]

    def test_exactly_one_row_for_each_assigned_domain(self):
        self.assertEqual(len(self.rows), 56)
        self.assertEqual([row["domain_id"] for row in self.rows], [f"D{i:03d}" for i in range(1, 57)])

    def test_each_row_compares_the_live_subgroup_structure(self):
        self.assertTrue(all("current_subgroup_comparison" in row for row in self.rows))

    def test_no_scope_creep_into_later_phases(self):
        self.assertTrue(all(row["canonical_taxonomy_changed"] is False for row in self.rows))
        self.assertTrue(all(row["role_to_specialization_assignments_made"] is False for row in self.rows))
        self.assertTrue(all(row["nigerian_context_applied"] is False for row in self.rows))

    def test_no_candidate_set_is_invented_for_evidence_gaps(self):
        for row in self.rows:
            if row["disposition"] == "evidence_record_incomplete_reconciliation_open":
                self.assertEqual(row["distinct_candidate_sets"], 0)

    def test_role_deferred_specialization_structures_are_decided_without_role_links(self):
        adjudicated = {f"D{i:03d}" for i in (21, 22, 23, 24, 25, 27, 34, 37, 44, 51, 54)}
        rows = {row["domain_id"]: row for row in self.rows}
        self.assertTrue(all(rows[domain_id]["specialization_structure_reconciled"] for domain_id in adjudicated))
        self.assertTrue(all(rows[domain_id]["role_audit_is_a_specialization_blocker"] is False for domain_id in adjudicated))
        self.assertFalse(rows["D054"]["candidate_set_conflict"])
        self.assertEqual(len(rows["D054"]["proposal_variants"][-1]["candidate_areas"]), 7)
        self.assertTrue(all(row["role_to_specialization_assignments_made"] is False for row in self.rows))

    def test_newly_resolved_domains_have_source_records(self):
        rows = {row["domain_id"]: row for row in self.rows}
        for domain_id in ("D021", "D022", "D023", "D024"):
            self.assertGreater(len(rows[domain_id]["supporting_sources"]), 0)
            self.assertTrue(rows[domain_id]["proposal_variants"][-1]["candidate_areas"])

    def test_shared_source_catalogues_resolve_to_exact_locators(self):
        rows = {row["domain_id"]: row for row in self.rows}
        for domain_id in ("D053", "D054", "D055", "D056"):
            self.assertTrue(rows[domain_id]["source_capture_quality"]["has_url_locator_and_support_or_limit_for_each_row"])
            self.assertTrue(all(source["url"] and source["locator"] for source in rows[domain_id]["supporting_sources"]))


if __name__ == "__main__":
    unittest.main()
