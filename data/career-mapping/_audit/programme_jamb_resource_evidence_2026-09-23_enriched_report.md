# Enriched programme/JAMB resource-evidence audit — 2026-09-23

Append-only local audit artifact. No SQL, live database, frontend/backend
implementation, generated seed or browser acceptance proof was changed.

## Scope and classifications

| Queue | Total | Confirmed | Review-only | Genuinely unavailable |
|---|---:|---:|---:|---:|
| Programme resource packages | 237 | 1 | 236 | 0 |
| Review-required JAMB identities | 86 | 0 | 75 | 11 |
| JAMB/domain link occurrences | 711 | 547 | 153 | 11 |

`confirmed` is evidence-level confirmation, not student exposure or a live
deployment claim. The Sociology programme package is confirmed because its
separate reviewed programme-resource contract retains ten item-specific
publisher/open-learning resources. The other 236 programme packages remain
review-only because their open references are discipline-level foundations,
not programme-specific prescribed reading lists. All 237 still remain
`decision=review_required` and `student_exposure=blocked_review_required`.

For JAMB, 547 link occurrences have sufficient Nigerian CCMAS anchors, 153
remain review-only because anchors are insufficient, and 11 have no Nigerian
CCMAS anchor and are therefore genuinely unavailable for programme-fit
evidence in this audit. The enclosing 86 identities remain review-required;
external-domain evidence alone does not promote a mapping.

## Preservation

- Canonical population reconciled: 237 programmes / 420 JAMB identities.
- Review-required JAMB slice reconciled: 86 identities / 711 link occurrences / 559 component-domain pairs.
- Prior nested external URLs, source names, locators, claims and limitations are retained.
- Prior missing access dates are preserved as `missing_in_prior_artifact`; no date is invented.
- New `checked_on` dates are written only for the explicitly checked authority/source catalog.
- Unique prior external URLs retained in enriched JAMB links: **618**.

## Outputs

- Programme JSONL batches: `programme_jamb_resource_evidence_2026-09-23_enriched_programme_batch-*.jsonl`.
- JAMB JSONL batches: `programme_jamb_resource_evidence_2026-09-23_enriched_jamb_batch-*.jsonl`.
- Manifest: `programme_jamb_resource_evidence_2026-09-23_enriched_manifest.json`.
- Checkpoint: `PROGRAMME_JAMB_RESOURCE_EVIDENCE_CHECKPOINT_2026-09-23_002.md`.

## Boundary

- SQL applied: **no**.
- Live database changed: **no**.
- Frontend/backend implementation changed: **no**.
- Browser acceptance proof: **no**.
