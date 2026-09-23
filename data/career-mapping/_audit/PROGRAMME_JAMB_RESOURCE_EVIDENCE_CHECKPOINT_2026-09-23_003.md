# Programme/JAMB resource-evidence checkpoint 2026-09-23-003

Date: 2026-09-23 (Africa/Lagos)

## Corrected scope

- Student resource scope is all 420 canonical JAMB identities/programmes.
- The 237 CCMAS package rows remain supporting curriculum context only. A CCMAS
  anchor is optional and is not an availability gate.
- The 86 identities in the prior complement review are retained as nested
  link-level evidence inside the all-420 ledger; their 711 link occurrences are
  not a substitute for the 420-row scope.
- The 83 university/JAMB identity or offering reachability gaps from the
  all-programme route audit are reconciled in a separate append-only JSONL
  ledger. No identity, university, offering or alias is invented.

## Pre-write counts

| Scope | Count | State before this checkpoint |
| --- | ---: | --- |
| Canonical JAMB identities | 420 | Prior artifacts covered only 86 review-required identities |
| CCMAS package rows | 237 | Supporting context, not availability scope |
| Prior review-required JAMB link occurrences | 711 | 547 anchor-sufficient, 153 anchor-insufficient, 11 missing CCMAS anchor |
| Route-audit reachability gaps | 83 | Explicit `unavailable_missing_jamb_identity` route state |

## Corrected decision rule

Every canonical JAMB row receives official JAMB identity evidence and an
authoritative learning/resource candidate. The row is `confirmed` when the
identity/resource evidence is present; it is `review_only` where the official
identity is retained from the canonical catalogue/IBASS selector without a
matching brochure page or where the resource is only a discipline-level
foundation. `genuinely_unavailable` is reserved for an identity/resource that
cannot be substantiated after the checked sources. Missing Nigerian CCMAS
complement evidence is recorded as an optional-anchor limitation only.

The 11 old `nigerian_ccmas_anchor_missing` occurrences are therefore
re-evaluated against the enclosing JAMB identity and resource evidence. They
must not become unavailable merely because a CCMAS complement anchor is
absent.

## Sources checked

- JAMB IBASS eligibility/programme selector:
  https://eligibility.jamb.gov.ng/
- NUC CCMAS hub and discipline PDFs:
  https://www.nuc.edu.ng/ccmas/
- Official/authoritative foundation sources retained per discipline include
  OpenStax, LibreTexts, Open Textbook Library, UniSQ Open Textbooks, FAO,
  UNEP, and University of Minnesota Libraries Publishing. Item-specific URLs,
  locators, access dates and limitations are stored in the new rows.

## Append-only outputs planned

- `audit_jamb_resource_evidence_all420_2026-09-23_003.py`
- `programme_jamb_resource_evidence_2026-09-23_all420_jamb_batch-*.jsonl`
- `programme_jamb_resource_evidence_2026-09-23_all420_route_gap_batch-*.jsonl`
- `programme_jamb_resource_evidence_2026-09-23_all420_manifest.json`
- `programme_jamb_resource_evidence_2026-09-23_all420_report.md`

This checkpoint is audit-only. No SQL, live database, frontend, browser
acceptance proof, or live student-state claim is made.
