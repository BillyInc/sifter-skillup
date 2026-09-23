# Programme/JAMB resource-evidence reconciliation 2026-09-23-005

This is a separate append-only reconciliation for the corrected local ledger.
It does not overwrite or regenerate prior JSONL batches.

## Scope result

- Corrected policy scope: **420** canonical JAMB identities.
- Corrected ledger manifest: **420/420** rows.
- Exact unique canonical names: **420**.
- CCMAS packages: **237**, supporting context only.
- CCMAS-anchor-absent occurrences: **11**.
- Anchor-absent rows classified available: **11**.
- Available resource packages: **420**.
- Review-required packages: **0**.
- `genuinely_unavailable`: **0**.

The resource-lane scope and the optional-anchor policy therefore reconcile.
None of the 11 anchor-absent occurrences is unavailable solely for lacking a
CCMAS anchor.

## Separate key-collision finding

The canonical source preserves four case-distinct identity pairs:

- `ANTHROPOLOGY` / `Anthropology`
- `LIBRARY AND INFORMATION SCIENCE` / `Library and Information Science`
- `LIBRARY SCIENCE` / `Library Science`
- `METEOROLOGY` / `Meteorology`

The resource rows retain all eight exact source names, but the current slug
function collapses each pair to one `subject_id`. This does not change the
420-row scope or the 11-row anchor result. It is recorded for later
case-preserving/source-qualified downstream key repair; no SQL, frontend,
live-database, or browser-proof change is made here.

Prior batches remain untouched.
