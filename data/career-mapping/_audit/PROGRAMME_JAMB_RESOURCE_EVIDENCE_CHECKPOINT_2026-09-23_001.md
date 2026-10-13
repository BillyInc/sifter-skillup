# Programme/JAMB resource-evidence scaling checkpoint 001 — 2026-09-23

This is an append-only checkpoint for the programme/JAMB resource-evidence
lane. It is local audit state only. No SQL, seed transport, frontend/backend
implementation, or live deployment was changed.

## Current population and progress

| Queue | Current count | Status at checkpoint |
|---|---:|---|
| Canonical programmes | 237 | Full population boundary identified |
| Programme resource reviews | 237 | Queue identified; evidence review remains open/fail-closed |
| Programme resource rows in the current catalogue | 473 | Existing NUC CCMAS + open foundation references retained as audit inputs |
| Canonical JAMB identities | 420 | Full population boundary identified |
| JAMB identities requiring external-domain review | 86 | Identified from `external_domain_provenance_required` rows |
| JAMB/domain link occurrences for those 86 identities | 711 | Existing evidence handoff retains source URLs/locators; review state remains unchanged |
| JAMB/domain component pairs for those 86 identities | 559 | Existing evidence handoff retains source-backed course anchors and limitations |

## Evidence work completed before this checkpoint

- Read `AGENTS.md`, the programme guidance catalogue manifest/audit, the
  scaling handoff, the broad source-enrichment checkpoint, the external-source
  search protocol, and the 86-row CCMAS/JAMB external-complement handoff.
- Confirmed the official NUC CCMAS hub as the curriculum-source authority:
  `https://www.nuc.edu.ng/ccmas/`.
- Confirmed the official JAMB IBASS eligibility checker as the JAMB identity
  and eligibility authority: `https://eligibility.jamb.gov.ng/`.
- Confirmed the current open-reference source URLs used by the catalogue are
  reachable or represented by an authoritative landing page where applicable;
  generic discipline landing pages remain supporting references, not
  programme-specific proof.
- Preserved the existing policy that a generic homepage, category page, or
  neighbouring curriculum cannot promote a programme resource or a
  JAMB/domain relationship.

## Next incremental action

Create new append-only machine-readable ledgers for:

1. all 237 programme resource review records, each retaining the programme
   key, CCMAS PDF/source locator, open-reference URL/locator, access date,
   decision, and limitations; and
2. all 86 review-required JAMB identity records, retaining each affected
   component/domain occurrence, Nigerian curriculum anchors, external source
   URL/locator, access date, and the unchanged `review_required` decision.

Until those ledgers pass reconciliation, no row is eligible for student
exposure and no existing generated seed or implementation file is to be
modified.

## Boundaries

- SQL application: **not performed**.
- Frontend/backend implementation edits: **not performed**.
- Live payload or deployment claim: **none**.
- Promotion of `review_required`, `no_link`, `not_established`, or
  `unavailable` states: **none**.
