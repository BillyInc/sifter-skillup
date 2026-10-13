# CCMAS source-batch reconciliation plan — 2026-09-29

This manifest reduces repeated JAMB occurrences to source-document and unique course-record verification units.
It is a deterministic work plan, not a claim that the source records are already verified.

## Counts

- **source documents:** 0
- **affected packages:** 0
- **unique course records:** 0
- **affected jamb occurrences:** 0
- **candidate exact source block groups:** 0
- **candidate reusable records:** 0
- **source documents requiring retrieval:** 0
- **source documents with existing extract:** 0

## Invariants

- **source documents:** 0 / 15 — REVIEW
- **affected packages:** 0 / 117 — REVIEW
- **unique course records:** 0 / 2442 — REVIEW
- **affected jamb occurrences:** 0 / 5449 — REVIEW

## Safe processing rule

Verify once per `(source package, course code)`. Exact duplicate source-block fingerprints are only reuse candidates; they become reusable after the representative is verified against the same official source document.

## Source batches
