# Corrected all-JAMB resource evidence ledger — 2026-09-23

Append-only local audit artifact. No SQL, seed, frontend, backend or live
database change was made.

## Scope

- Canonical JAMB identities: **420/420**.
- CCMAS-anchor-absent occurrences: **11**; all remain available when external evidence exists.
- Available resource packages: **420**.
- Review-required resource packages: **0**.
- Genuinely unavailable: **0**.

## Policy correction

The student-facing denominator is the 420 JAMB identities, not the 237 CCMAS
packages. CCMAS is an optional curriculum complement. The 11 previously
classified as unavailable solely because an anchor was absent are retained with
their external sources and are not unavailable under this ledger.

Resource availability is separate from downstream mapping review. A row may
have an available external learning resource while still requiring internal
review of programme-to-domain promotion, ownership or student approval.

## Outputs

- JSONL batches: `programme_jamb_resource_evidence_2026-09-23_corrected_003_jamb_batch-*.jsonl`
- Manifest: `programme_jamb_resource_evidence_2026-09-23_corrected_003_manifest.json`

SQL application, live payload verification and browser acceptance remain
deferred.
