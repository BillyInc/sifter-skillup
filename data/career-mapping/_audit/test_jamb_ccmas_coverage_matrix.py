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
        cls.matrix = json.loads(builder.OUT_JSON.read_text(encoding="utf-8"))
        cls.canonical = json.loads(builder.CANONICAL_PATH.read_text(encoding="utf-8"))

    def test_matrix_covers_all_unique_jamb_rows_without_reclassification(self) -> None:
        self.assertEqual(self.matrix["totals"]["jamb_rows"], 420)
        self.assertEqual(self.matrix["totals"]["unique_jamb_names"], 420)
        self.assertEqual(
            sum(item["rows"] for item in self.matrix["categories"]),
            self.matrix["totals"]["jamb_rows"],
        )
        self.assertEqual(
            self.matrix["totals"]["raw_mapping_states"],
            {"ready": 55, "ready_external": 6, "ready_partial": 273, "review_required": 86},
        )

    def test_partial_external_and_combined_cases_keep_their_contract(self) -> None:
        by_category = {item["category"]: item for item in self.matrix["categories"]}
        self.assertEqual(by_category["partial_curriculum_scope"]["rows"], 273)
        self.assertEqual(by_category["external_sources_required"]["rows"], 6)
        self.assertEqual(by_category["combined_ccmas_curriculum"]["rows"], 28)
        self.assertEqual(by_category["single_ccmas_full_curriculum"]["rows"], 113)

        canonical_by_name = {row["jamb_name"]: row for row in self.canonical["rows"]}
        external_names = set(by_category["external_sources_required"]["jamb_names"])
        self.assertTrue(external_names)
        self.assertTrue(
            all(
                canonical_by_name[name]["mapping_status"] == "ready_external"
                and canonical_by_name[name]["inheritance_type"] == "external_sources_required"
                for name in external_names
            )
        )
        self.assertEqual(
            self.matrix["combined_detail"]["rows_with_two_or_more_named_ccmas_disciplines"],
            10,
        )
        self.assertEqual(
            self.matrix["combined_detail"]["rows_with_custom_external_component"],
            1,
        )
        self.assertEqual(
            self.matrix["combined_detail"]["rows_not_spanning_two_or_more_named_ccmas_disciplines"],
            18,
        )

    def test_review_and_unavailable_states_are_preserved_and_fanout_is_overlapping(self) -> None:
        self.assertEqual(self.matrix["totals"]["review_required"], 86)
        self.assertEqual(self.matrix["totals"]["unavailable"], 0)
        self.assertEqual(self.matrix["source_state_guard"]["unavailable_jamb_names"], [])

        fanout = self.matrix["split_fanout_review_queue"]
        self.assertEqual(fanout["component_count"], 83)
        self.assertEqual(fanout["unique_jamb_row_count"], 346)
        self.assertEqual(fanout["review_required"], 64)
        self.assertEqual(fanout["unavailable"], 0)
        self.assertEqual(
            fanout["states"],
            {"ready": 48, "ready_external": 1, "ready_partial": 233, "review_required": 64},
        )
        self.assertTrue(all(item["jamb_row_count"] >= 2 for item in fanout["components"]))
        # Fan-out is intentionally an overlapping queue, so it must not inflate
        # the mutually exclusive category denominator.
        self.assertGreater(fanout["unique_jamb_row_count"], 0)
        self.assertEqual(sum(item["rows"] for item in self.matrix["categories"]), 420)


if __name__ == "__main__":
    unittest.main()
