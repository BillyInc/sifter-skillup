import json
import unittest

import run_jamb_ccmas_deterministic_discovery_2026_09_28 as discovery


class DeterministicDiscoveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads(discovery.OUT_JSON.read_text(encoding="utf-8"))

    def test_full_local_catalogue_is_enumerated_without_sampling(self):
        counts = self.report["counts"]
        self.assertEqual(counts["jamb_canonical_identities"], 420)
        self.assertEqual(counts["ccmas_programme_packages"], 237)
        self.assertEqual(len(self.report["jamb_identities"]), 420)
        self.assertEqual(len(self.report["ccmas_packages"]), 237)
        self.assertEqual(counts["ccmas_course_rows"], sum(row["course_count"] for row in self.report["ccmas_packages"]))
        self.assertEqual(len(self.report["ccmas_course_rows"]), counts["ccmas_course_rows"])
        self.assertEqual(len({row["record_id"] for row in self.report["ccmas_course_rows"]}), counts["ccmas_course_rows"])
        self.assertEqual(counts["jamb_selected_course_records"], sum(row["selected_course_count"] for row in self.report["jamb_identities"]))
        self.assertEqual(
            counts["jamb_selected_course_records"],
            counts["jamb_selected_ccmas_course_records"] + counts["jamb_selected_external_or_custom_course_records"],
        )

    def test_course_rows_carry_previous_source_review_and_checkpoint_reconciliation(self):
        source_review = self.report["ccmas_checkpoint_reconciliation"]["original_source_review"]
        self.assertEqual(source_review["checkpoint_rows"], 122)
        self.assertEqual(source_review["unmatched_rows"], 1)
        self.assertEqual(source_review["unmatched_checkpoint_records"][0]["courseCode"], "FIN 102")
        self.assertEqual(self.report["ccmas_checkpoint_reconciliation"]["open_anomaly_adjudications"]["checkpoint_rows"], 10)
        self.assertTrue(any(row["prior_original_source_review"] for row in self.report["ccmas_course_rows"]))

    def test_case_variants_are_reported_not_collapsed_as_canonical_rows(self):
        self.assertEqual(len(self.report["casefold_name_collisions"]), 4)
        self.assertEqual(self.report["counts"]["jamb_canonical_identities"], 420)

    def test_all_source_occurrences_are_retained_and_urls_match_exact_faculty(self):
        identities = self.report["jamb_identities"]
        occurrence_count = sum(row["source_occurrence_count"] for row in identities)
        self.assertEqual(occurrence_count, self.report["counts"]["jamb_parsed_offering_occurrences"])
        all_occurrences = [occ for row in identities for occ in row["source_occurrences"]]
        all_occurrences += self.report["orphan_source_occurrences"]
        self.assertEqual(self.report["counts"]["jamb_all_parsed_offering_occurrences"], 443)
        self.assertEqual(len(all_occurrences), 443)
        self.assertEqual(self.report["counts"]["jamb_occurrences_without_faculty_brochure_url"], 0)
        self.assertTrue(all(occurrence["brochure_source_url"] for occurrence in all_occurrences))
        social = [occ for occ in all_occurrences if occ["source_faculty"] == "Social/Management Sciences"]
        self.assertTrue(all("social-sciences.pdf" in occ["brochure_source_url"] for occ in social))

    def test_prior_occurrence_ids_and_unmatched_source_spelling_are_preserved(self):
        identities = self.report["jamb_identities"]
        canonical_occurrences = [occ for row in identities for occ in row["source_occurrences"]]
        linked = [occ for occ in canonical_occurrences if occ["occurrence_id"]]
        self.assertGreater(len(linked), 0)
        accounting_finance = next(row for row in identities if row["jamb_name"] == "Accounting and Finance")
        social_context = next(occ for occ in accounting_finance["source_occurrences"] if occ["source_faculty"] == "Social/Management Sciences")
        self.assertEqual(social_context["pdf_table_locator"].split("printed p. ")[1][:3], "576")
        # The offering inventory is now reconciled against the current source
        # row.  Preserve the locator field, but do not require the superseded
        # 2026-09-25 page-577 locator after the source-context repair.
        self.assertTrue(social_context["prior_inventory_pdf_table_locator"])
        orphans = self.report["orphan_source_occurrences"]
        # The current source-alias reconciliation resolves the former spelling
        # orphan; an orphan is now a genuine unmatched source occurrence.
        self.assertEqual(len(orphans), 0)
        counts = self.report["counts"]
        # The current inventory repair assigns stable IDs to the three rows
        # that previously appeared current-only, including the corrected
        # Sociology/Anthropology spelling alias.
        self.assertEqual(counts["jamb_occurrences_matched_to_stable_inventory_id"], 443)
        self.assertEqual(counts["jamb_occurrences_without_stable_inventory_id"], 0)
        self.assertEqual(counts["jamb_current_occurrences_not_in_older_inventory_signature"], 0)
        self.assertEqual(counts["jamb_older_inventory_occurrences_not_in_current_files"], 1)

    def test_computer_science_with_economics_has_both_declared_course_facets(self):
        row = next(row for row in self.report["jamb_identities"] if row["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS")
        # Find the exact scope row independently; this guards against treating
        # the first selected course's facet as the whole combined scope.
        scope = next(item for item in json.loads(discovery.SCOPE_PATH.read_text(encoding="utf-8"))["rows"] if item["jamb_name"] == "COMPUTER SCIENCE WITH ECONOMICS")
        facets = {course.get("scope_facet") for course in scope["selected_courses"]}
        self.assertEqual(len(row["component_refs"]), 2)
        self.assertIn("computer science curriculum", facets)
        self.assertIn("economics curriculum", facets)
        self.assertEqual(len(scope["selected_courses"]), 76)

    def test_candidate_labels_are_not_confirmed_source_defects(self):
        counts = self.report["ccmas_structural_candidate_counts_by_type_nonexclusive"]
        self.assertGreater(counts["empty_or_placeholder_content_summary"], 0)
        self.assertTrue(all(
            finding["classification"] != "confirmed_source_defect"
            for package in self.report["ccmas_packages"]
            for finding in package["findings"]
        ))

    def test_cross_package_course_identity_reuse_is_queued_not_auto_fixed(self):
        groups = self.report["ccmas_cross_package_course_code_candidates"]
        agb301 = [row for row in groups if row["course_code"] == "AGB 301"]
        self.assertEqual(len(agb301), 1)
        # The original-PDF repair normalized this former cross-package title
        # anomaly; it must no longer be treated as a live candidate.
        self.assertFalse(agb301[0]["same_detail_with_different_titles_candidate"])
        self.assertEqual(agb301[0]["classification"], "candidate_cross_package_identity_or_extraction_review")
        self.assertGreater(self.report["ccmas_cross_package_material_variance_candidate_count"], 0)
        repeated = [
            finding for package in self.report["ccmas_packages"] for finding in package["findings"]
            if finding["finding"] == "repeated_outcome_text_within_course"
        ]
        self.assertEqual(sum(row["count"] for row in repeated), 3)


if __name__ == "__main__":
    unittest.main()
