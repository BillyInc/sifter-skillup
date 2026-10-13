# Lane 1 checkpoint 005 — JAMB occurrence queue reconciliation

**Date:** 2026-09-28 (Africa/Lagos)  
**Scope:** canonical identities 001–140 plus the separately assigned orphan spelling `Sociology and Anthropology`.  
**Status:** current rows are assembled with occurrence IDs and prior-coverage references; exact per-occurrence checkpoint join and official source adjudication remain open.

## Current denominators

- Canonical JAMB identities: **140**.
- Current linked source-offering occurrences across those identities: **150** (not 140; duplicate-faculty/title contexts stay separate).
- Additional orphan-spelling occurrence assigned to this lane: **1** (`Sociology and Anthropology`; candidate canonical spelling `Sociology and Anthroplogy`).
- Current rows with an explicit local PDF flag plus locator among those 150: **94**. A row flag/locator is a prior ledger claim, not independent proof that the exact awarder cell and continuation boundary were checked.

## Prior-coverage reconciliation boundary

- Identities 001–060 have bounded checkpoints 005–007 from 2026-09-26 with specific parsed records and extracted-text windows. Those are useful prior coverage; they do not uniformly constitute direct visual PDF-cell verification.
- The 2026-09-26 aggregate notes a 061–080 structural scan, not a bounded exact-cell source audit.
- The full-catalogue source inventory and the 2026-08-17 audit contain catalogue/source-hit references for later identities, but a name hit is not a complete exact awarder-cell/continuation check.
- Newer JAMB source-repair Lane A/B/C checkpoints were inventoried. Their decisions must be joined to a current occurrence ID and exact context before this ledger can credit them; a matching programme name alone is insufficient. The reconciliation JSON therefore marks these current rows `prior_checkpoint_join_required`, not globally unverified or closed.
- The orphan occurrence is already represented in deterministic discovery, but its stable occurrence ID is null; keep it distinct and assign a stable audit identity only in this lane evidence, not in canonical product data.

## Next action

Continue by joining source-repair Lane A/B/C and fix-log records to the 151 current source occurrences by exact title + faculty + source file + awarder context, then inspect uncovered/conflicting official JAMB brochure cells. Each result needs its own official URL, printed page/table locator, complete awarder cell/continuation boundary, access date, local row comparison, and disposition. The row-level queue is `jamb_ccmas_source_audit_lane_1_2026-09-28_005_jamb_occurrence_reconciliation.json`.
