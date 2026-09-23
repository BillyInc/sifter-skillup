# Programme/JAMB resource-evidence audit report — 2026-09-23

Append-only local audit artifact. No SQL, seed transport, frontend/backend
implementation, or live deployment was changed.

## Counts

- Programme resource reviews: **237/237**.
- Canonical JAMB identities: **420**.
- Review-required JAMB identities: **86/86**.
- Review-required JAMB/domain link occurrences represented: **711**.
- Promotions: **0**.
- Genuinely unavailable decisions: **0**.

## Decision policy

All 237 programme resource packages remain `review_required`. Each row keeps an
official NUC CCMAS URL and programme-specific local PDF/course locator, plus the
current discipline-level open foundation reference and its locator. The open
reference is not treated as a prescribed reading list.

All 86 JAMB identities remain `review_required`. Each row keeps the official
JAMB IBASS identity locator plus every retained component/domain evidence
occurrence from the prior CCMAS external-complement artifact. Existing source
URLs, locators and access dates are preserved where present; missing prior
access dates are explicitly marked rather than invented.

The ledger is evidence for staff review only. It does not close the
programme-fit/domain gate and does not authorize student exposure.

## Outputs

- Programme JSONL batches: `programme_jamb_resource_evidence_2026-09-23_programme_batch-*.jsonl`
- JAMB JSONL batches: `programme_jamb_resource_evidence_2026-09-23_jamb_batch-*.jsonl`
- Machine-readable manifest: `programme_jamb_resource_evidence_2026-09-23_manifest.json`

## Authority boundary

- NUC CCMAS: https://www.nuc.edu.ng/ccmas/ (accessed 2026-09-23).
- JAMB IBASS: https://eligibility.jamb.gov.ng/ (accessed 2026-09-23).

## Deferred work

Human review of programme-specific resource suitability and the 86 JAMB/domain
gates remains open. SQL application, generated-seed changes, implementation
changes, live payload verification and browser acceptance remain deferred.
