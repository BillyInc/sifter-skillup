"""Focused regression checks for the JAMB/CCMAS scaling coverage matrix."""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path


HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import build_jamb_ccmas_coverage_matrix as builder  # noqa: E402


class JambCcmasCoverageMatrixTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        # Build from the current inputs in memory so an old generated snapshot
        # cannot silently make a newer scope ledger look incomplete.
        cls.matrix = builder.build_matrix()
        cls.canonical = json.loads(builder.CANONICAL_PATH.read_text(encoding="utf-8"))
        scope_path = HERE / "jamb_curriculum_scopes_2026-08-17.json"
        cls.scopes = json.loads(scope_path.read_text(encoding="utf-8"))["rows"]
        cls.discovery = json.loads(
            (HERE / "jamb_ccmas_deterministic_discovery_2026-09-28.json").read_text(encoding="utf-8")
        )

    def test_matrix_covers_all_unique_jamb_rows_without_reclassification(self) -> None:
        self.assertEqual(self.matrix["totals"]["jamb_rows"], 420)
        self.assertEqual(self.matrix["totals"]["unique_jamb_names"], 420)
        self.assertEqual(
            sum(item["rows"] for item in self.matrix["categories"]),
            self.matrix["totals"]["jamb_rows"],
        )
        self.assertEqual(
            sum(self.matrix["totals"]["raw_mapping_states"].values()),
            self.matrix["totals"]["jamb_rows"],
        )

    def test_partial_external_and_combined_cases_keep_their_contract(self) -> None:
        by_category = {item["category"]: item for item in self.matrix["categories"]}
        self.assertEqual(by_category["partial_curriculum_scope"]["rows"], 263)
        self.assertEqual(by_category["external_sources_required"]["rows"], 6)
        self.assertEqual(by_category["combined_ccmas_curriculum"]["rows"], 38)
        self.assertEqual(by_category["single_ccmas_full_curriculum"]["rows"], 113)

        canonical_by_name = {row["jamb_name"]: row for row in self.canonical["rows"]}
        combined_rows = [
            row for row in self.canonical["rows"]
            if row["inheritance_type"] == "combined_ccmas_curriculum"
        ]
        self.assertEqual(len(combined_rows), 38)
        self.assertTrue(all(
            row["mapping_status"] == "review_required"
            and not row["domain_links"]
            for row in combined_rows
        ))
        mathematics_computer_science = canonical_by_name["Mathematics with Computer Science"]
        self.assertEqual(mathematics_computer_science["curriculum_scope"]["selected_course_count"], 77)
        self.assertEqual(mathematics_computer_science["mapping_status"], "review_required")
        self.assertEqual(mathematics_computer_science["domain_links"], [])
        external_names = set(by_category["external_sources_required"]["jamb_names"])
        self.assertTrue(external_names)
        self.assertTrue(all(
            canonical_by_name[name]["mapping_status"] in {"ready_external", "external_review_required"}
            and canonical_by_name[name]["inheritance_type"] == "external_sources_required"
            for name in external_names
        ))
        self.assertEqual(
            self.matrix["combined_detail"]["rows_with_two_or_more_named_ccmas_disciplines"],
            15,
        )
        self.assertEqual(
            self.matrix["combined_detail"]["rows_with_custom_external_component"],
            1,
        )
        self.assertEqual(
            self.matrix["combined_detail"]["rows_not_spanning_two_or_more_named_ccmas_disciplines"],
            23,
        )

    def test_review_and_unavailable_states_are_preserved_and_fanout_is_overlapping(self) -> None:
        self.assertEqual(
            self.matrix["totals"]["review_required"],
            self.matrix["totals"]["raw_mapping_states"].get("review_required", 0)
            + self.matrix["totals"]["raw_mapping_states"].get("external_review_required", 0),
        )
        self.assertEqual(self.matrix["totals"]["unavailable"], 0)
        self.assertEqual(self.matrix["source_state_guard"]["unavailable_jamb_names"], [])

        fanout = self.matrix["split_fanout_review_queue"]
        self.assertEqual(fanout["component_count"], len(fanout["components"]))
        self.assertGreater(fanout["component_count"], 0)
        self.assertGreater(fanout["unique_jamb_row_count"], 0)
        self.assertEqual(fanout["review_required"], fanout["states"]["review_required"])
        self.assertEqual(fanout["unavailable"], 0)
        self.assertEqual(sum(fanout["states"].values()), fanout["unique_jamb_row_count"])
        self.assertTrue(all(item["jamb_row_count"] >= 2 for item in fanout["components"]))
        # Fan-out is intentionally an overlapping queue, so it must not inflate
        # the mutually exclusive category denominator.
        self.assertGreater(fanout["unique_jamb_row_count"], 0)
        self.assertEqual(sum(item["rows"] for item in self.matrix["categories"]), 420)

    def test_combined_scope_artifact_fails_closed_until_course_and_outcome_review(self) -> None:
        combined = [
            row for row in self.scopes
            if row["inheritance_type"] == "combined_ccmas_curriculum"
        ]
        self.assertEqual(len(combined), 38)
        self.assertTrue(all(row["scope_approval"] == "pending_review" for row in combined))
        self.assertTrue(all(not row.get("domain_links") for row in combined))

        by_scope = {row["jamb_name"]: row for row in combined}
        accounting_finance = by_scope["Accounting and Finance"]
        self.assertEqual(len(accounting_finance["selected_courses"]), 65)
        self.assertEqual(set(accounting_finance["component_refs"]), {
            "Administration and Management::Finance / Banking and Finance",
            "Administration and Management::Accounting",
        })
        selected_components = {
            course.get("source_ccmas_programme")
            for course in accounting_finance["selected_courses"]
        }
        self.assertEqual(selected_components, {"Finance / Banking and Finance", "Accounting"})

        computer_science_economics = by_scope["COMPUTER SCIENCE WITH ECONOMICS"]
        economics_facets = {course.get("scope_facet") for course in computer_science_economics["selected_courses"]}
        self.assertEqual(len(computer_science_economics["selected_courses"]), 76)
        self.assertEqual(economics_facets, {"computer science curriculum", "economics curriculum"})

        for name in (
            "COMPUTER SCIENCE AND MATHEMATICS",
            "COMPUTER SCIENCE WITH MATHEMATICS",
            "Mathematics with Computer Science",
        ):
            mathematics_blend = by_scope[name]
            self.assertEqual(len(mathematics_blend["selected_courses"]), 77)
            self.assertEqual(sum(
                course.get("source_ccmas_programme") == "Mathematics"
                for course in mathematics_blend["selected_courses"]
            ), 39)

        accounting_identity = next(
            row for row in self.discovery["jamb_identities"]
            if row["jamb_name"] == "Accounting and Finance"
        )
        contexts = {(row["source_faculty"], tuple(row["institutions"])) for row in accounting_identity["source_occurrences"]}
        self.assertEqual(contexts, {
            ("Administration", ("BCU",)),
            ("Social/Management Sciences", ("FEDOTUOKE",)),
        })

    def test_current_report_is_serialized_from_current_inputs(self) -> None:
        saved = json.loads(builder.OUT_JSON.read_text(encoding="utf-8"))
        self.assertEqual(saved, self.matrix)


if __name__ == "__main__":
    unittest.main()
