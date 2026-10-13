# JAMBâ€“CCMAS evidence funnel â€” 2026-09-29

This queue makes the exhaustive local scan useful without treating local text hits as source proof.

## Scope

- **jamb occurrences:** 443
- **ccmas course rows:** 9854
- **ccmas shared detail groups:** 7518
- **ccmas rows eligible for exact detail reuse:** 2379
- **ccmas rows with deep review exceptions:** 9854
- **ccmas rows requiring metadata fill:** 9639
- **jamb occurrences with exceptions:** 442

## CCMAS queue states

- `exception_queue`: 9854
- `reason:ambiguous_code_hits`: 9359
- `reason:empty_or_placeholder_content`: 511
- `reason:empty_outcomes`: 308
- `reason:local_extract_missing`: 9854
- `reason:missing_item_source_metadata`: 9639
- `reason:repeated_outcome_text`: 433

## JAMB queue states

- `exception_queue`: 442
- `locator_candidate_needs_source_adjudication`: 1
- `reason:compound_title_requires_facet_review`: 228
- `reason:deterministic_finding_present`: 440
- `reason:institution_context_not_source_verified`: 385
- `reason:missing_explicit_pdf_metadata`: 104
- `reason:title_not_located_in_local_extract`: 147

## Operating rule

Agents should consume only `exception_queue` rows and shared-detail representatives. Local repair may proceed only from a source-backed finding, then rerun this funnel. Rows in `locator_candidate_needs_source_adjudication` are not student-approved or source-confirmed.

Machine-readable output: `jamb_ccmas_evidence_funnel_2026-09-29.json`.
