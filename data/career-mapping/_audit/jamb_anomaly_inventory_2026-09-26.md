# JAMB anomaly inventory — 2026-09-26

Status: complete deterministic inventory for all 420 canonical identities; semantic source adjudication remains open.

This inventory does not treat a missing citation as a wrong curriculum, or a review label as proof. It records every identity and separates deterministic flags from evidence gaps.

## Catalogue counts

- `canonical_identities`: **420**
- `identities_with_any_flags`: **77**
- `identities_with_evidence_gaps`: **420**
- `no_offering_occurrence`: **0**
- `unverified_offering_context`: **419**
- `multiple_source_faculty_contexts`: **20**
- `partial_or_combined_zero_course_scopes`: **0**
- `unrepresented_facet_rows`: **2**
- `scope_review_required`: **41**
- `selected_course_citation_gap_rows`: **269**
- `domain_links_with_unapproved_scope`: **0**

## Flag counts

- `mapping_faculty_absent_from_parsed_source_faculties`: **29**
- `multiple_components_but_zero_selected_courses`: **26**
- `multiple_source_faculties_preserve_contexts`: **20**
- `unrepresented_named_facets`: **2**

## Evidence-gap counts

- `offering_cell_not_pdf_verified`: **419**
- `scope_review_required`: **41**
- `selected_ccmas_content_missing_or_placeholder`: **83**
- `selected_ccmas_outcomes_missing`: **41**
- `selected_ccmas_units_missing`: **34**
- `selected_course_citation_incomplete`: **269**

## Interpretation

The JSON contains one row for each of the 420 identities, including identities with no deterministic flag. Existing range checkpoint filenames are listed in the JSON. This is the saved catalogue-wide inventory requested by the audit; it is not a claim that all source searches or semantic fixes are complete.
