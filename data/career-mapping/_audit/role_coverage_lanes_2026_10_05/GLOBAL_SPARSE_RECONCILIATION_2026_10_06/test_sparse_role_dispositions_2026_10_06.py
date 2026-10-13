"""Tests for the audit-only sparse-role disposition register."""

from __future__ import annotations

import json
from pathlib import Path
import unittest


HERE = Path(__file__).resolve().parent
REGISTER = HERE / "sparse_role_disposition_register_2026_10_06.json"


class SparseRoleDispositionRegisterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.document = json.loads(REGISTER.read_text(encoding="utf-8"))
        cls.rows = cls.document["candidates"]
        cls.by_key = {row["candidate_key"]: row for row in cls.rows}

    def test_complete_candidate_and_domain_coverage(self) -> None:
        self.assertEqual(self.document["candidate_count"], 145)
        self.assertEqual(len(self.rows), len(self.by_key))
        self.assertEqual(self.document["zero_active_role_domain_count"], 16)
        self.assertEqual(
            self.document["zero_active_role_domain_ids"],
            [
                "D037", "D039", "D040", "D045", "D049", "D050", "D052", "D053",
                "D054", "D071", "D075", "D076", "D079", "D080", "D153", "D157",
            ],
        )
        self.assertEqual(self.document["role_enrichment_domain_ids"], ["D071"])

    def test_global_only_and_noncanonical(self) -> None:
        self.assertTrue(self.document["global_only"])
        self.assertFalse(self.document["nigerian_context_used"])
        self.assertFalse(self.document["canonical_edits"])
        self.assertFalse(self.document["apply_or_deploy_performed"])
        self.assertTrue(self.document["integrity"]["all_rows_noncanonical"])
        self.assertTrue(self.document["integrity"]["all_candidates_have_source_refs"])
        self.assertTrue(self.document["integrity"]["all_candidates_global_only"])
        for row in self.rows:
            self.assertFalse(row["nigerian_context_used"])
            self.assertFalse(row["canonical_edit"])
            self.assertTrue(row["parent_domain_implication"]["current_parent_domain_id"])
            self.assertIn("subgroups", row["subgroup_implication"])

    def test_expected_final_dispositions(self) -> None:
        self.assertEqual(
            self.document["decision_counts"],
            {
                "already_active_exact_role_closed": 2,
                "duplicate_or_overlap_hold": 2,
                "duplicate_or_overlap_resolved": 32,
                "net_new_role_proposal": 40,
                "no_addition_specialization_or_family": 25,
                "ownership_or_parent_scope_hold": 43,
                "source_count_reconciliation_hold": 1,
            },
        )
        self.assertEqual(self.document["net_new_role_target_count"], 40)
        self.assertEqual(self.document["safe_to_activate_candidate_count"], 22)
        self.assertEqual(self.document["safe_to_activate_existing_inactive_role_link_count"], 0)
        self.assertTrue(all(self.by_key[key]["decision"] == "net_new_role_proposal" for key in self.document["safe_to_activate_candidate_keys"]))

    def test_d071_resolution(self) -> None:
        d071 = next(row for row in self.document["domain_implications"] if row["domain_id"] == "D071")
        self.assertEqual(
            d071["role_enrichment_resolution"],
            {
                "net_new_role_proposals": [
                    "D071|sport administrator",
                    "D071|sports performance analyst",
                    "D071|sports referee match official",
                ],
                "no_addition_keys": ["D071|sports coach"],
                "ownership_hold_keys": ["D071|sports talent scout"],
                "subgroup_route_state": "blocked_all_current_subgroups_excluded",
            },
        )
        self.assertFalse(any(self.by_key[key]["safe_to_activate"] for key in d071["candidate_keys"]))

    def test_safe_rows_have_active_subgroup_routes(self) -> None:
        for key in self.document["safe_to_activate_candidate_keys"]:
            row = self.by_key[key]
            self.assertEqual(row["decision"], "net_new_role_proposal")
            self.assertEqual(row["subgroup_implication"]["route_state"], "active_subgroup_route_available")
            self.assertTrue(row["subgroup_implication"]["semantic_signoff_required"])
            self.assertTrue(row["proposed_or_target_role_key"])
            self.assertTrue(row["parent_domain_implication"]["current_parent_domain_id"])


if __name__ == "__main__":
    unittest.main()
