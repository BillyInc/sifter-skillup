import json
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
DATA = ROOT / "data" / "career-mapping"
AUDIT = DATA / "_audit"
SPARSE = HERE / "D001_D056_SPARSE_AREA_FIT_REVIEW_2026_10_07.json"
ROLES = HERE / "D001_D056_existing_role_area_fit_review_2026_10_07.json"
CONTEXT = HERE / "D001_D056_nigerian_area_context_reconciliation_2026_10_07.json"
CATALOG = DATA / "domain_specialization_catalog.json"
LEDGER = AUDIT / "SPARSE_ROLE_ENRICHMENT_LEDGER_2026_10_07.json"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


class D001D056RoleAreaContextTests(unittest.TestCase):
    def test_sparse_candidates_all_have_separate_fit_and_disposition(self):
        report = load(SPARSE)
        source = load(LEDGER)
        expected = [r for r in source["candidate_records"] if 1 <= int(r["domain_id"][1:]) <= 56]
        rows = report["records"]
        self.assertEqual(len(rows), len(expected))
        self.assertEqual(len({r["candidate_key"] for r in rows}), len(rows))
        for row in rows:
            self.assertTrue(row["candidate_tasks"])
            self.assertIn(row["disposition"], {"accepted_candidate", "alias_existing", "review_only"})
            self.assertFalse(row["uses_isco_or_esco_membership_as_fit_evidence"])
            if row["disposition"] == "accepted_candidate":
                self.assertTrue(row["global_task_evidence"])
                self.assertEqual(row["parent_domain"]["fit_status"], "supported")
                self.assertEqual(row["recommended_area"]["fit_status"], "supported")
                self.assertTrue(row["recommended_area"]["area_key"])
        instruction = next(r for r in rows if r["role_title"] == "Instructional Coordinator")
        self.assertTrue(any(s.get("url") == "https://www.onetonline.org/link/details/25-9031.00" for s in instruction["global_task_evidence"]))

    def test_all_active_role_keys_are_included_once_and_uncertainty_stays_open(self):
        report = load(ROLES)
        rows = report["records"]
        self.assertEqual(len(rows), report["counts"]["active_unique_role_keys"])
        self.assertEqual(len({r["normalized_role_key"] for r in rows}), len(rows))
        self.assertEqual(len(rows), 1510)
        for row in rows:
            self.assertTrue(1 <= int(row["domain_id"][1:]) <= 56)
            self.assertFalse(row["isco_esco_or_subgroup_used_as_fit_evidence"])
            self.assertIn(row["area_fit"]["status"], {"review_required", "supported_existing_area_decision_reconciled", "supported_manual_task_and_area_evidence", "direct_domain_to_role"})
            if row["area_fit"]["status"] == "review_required":
                self.assertTrue(row["area_fit"]["rationale"])
            if row["area_fit"]["status"] == "supported_manual_task_and_area_evidence":
                self.assertEqual(row["parent_domain_fit"]["status"], "supported")
                self.assertTrue(row["exact_role_task_evidence"])
                self.assertTrue(row["parent_domain_fit"]["source_refs"])
                self.assertTrue(row["area_fit"]["area_boundary_source_ids"])
                self.assertTrue(row["area_fit"]["area_boundary_citations"])
                self.assertTrue(row["area_fit"]["rationale"])
            if row["area_fit"]["proposed_area_candidate"]:
                self.assertEqual(row["area_fit"]["proposed_area_boundary_source_ids"], row["area_fit"]["proposed_area_candidate"]["source_ids"])
                self.assertTrue(row["area_fit"]["proposed_area_fit_note"])
        self.assertTrue(report["integrity"]["each_active_unique_key_once"])
        self.assertEqual(report["counts"]["area_fit_status"].get("supported_manual_task_and_area_evidence"), 21)

    def test_nigerian_context_covers_each_current_recommended_area(self):
        report = load(CONTEXT)
        catalog = load(CATALOG)
        expected = sum(len(d.get("areas", [])) for d in catalog["domains"] if 1 <= int(d["domain_id"][1:]) <= 56)
        rows = report["areas"]
        self.assertEqual(len(rows), expected)
        self.assertEqual(len({(r["domain_id"], r["area_key"]) for r in rows}), expected)
        self.assertEqual(report["counts"]["area_records_reconciled"], expected)
        self.assertFalse(report["policy"]["global_area_labels_or_boundaries_changed"])
        self.assertFalse(report["policy"]["policy_or_curriculum_used_as_demand_or_vacancy_evidence"])
        statuses = report["counts"]["status"]
        self.assertEqual(statuses.get("nigerian_context_supported_primary_source_reopened"), 12)
        supported = [r for r in rows if r["nigerian_context_status"] == "nigerian_context_supported_primary_source_reopened"]
        self.assertEqual(len(supported), 12)
        for row in supported:
            self.assertTrue(row["evidence"])
            for evidence in row["evidence"]:
                self.assertTrue(evidence.get("url"))
                self.assertTrue(evidence.get("locator"))
                self.assertTrue(evidence.get("exact_nigerian_claim"))
                self.assertTrue(evidence.get("limitation"))
                self.assertEqual(evidence.get("access_date"), "2026-10-07")
                self.assertFalse(row["global_area_fit_or_definition_inferred_from_nigerian_source"])


if __name__ == "__main__":
    unittest.main()
