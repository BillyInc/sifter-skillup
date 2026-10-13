# Reverse CCMAS crosswalk reconciliation — 2026-09-26 (001)

Status: **open**. This append-only artifact reads the 83-entry reverse crosswalk and records the existing adjudication/resolution checkpoints. It does not edit the input ledger or any shared mapping/downstream file.

Input ledger: `_audit/jamb_ccmas_mapping_quality_2026-09-24/unreferenced_ccmas_component_crosswalk_2026-09-25.jsonl`

## Coverage

- `ccmas_components`: **83**
- `jamb_universe_checked`: **420**
- `adjudication_checkpoints_present`: **83**
- `resolution_checkpoints_present_for_entries_001_040`: **40**
- `entries_041_080_without_resolution_checkpoint`: **40**
- `entries_081_083_with_recorded_dispositions_not_reflected_in_ledger`: **3**

All 83 entries have numbered adjudication checkpoints. Only entries 001–040 have separate resolution checkpoints. Entries 081–083 have recorded dispositions in their adjudication checkpoint, but the machine ledger still says `candidate requiring source evidence`; that is a reconciliation issue, not permission to edit or promote the ledger here.

The JSON contains the exact NUC URL, programme/course locator, access date, checkpoint path, current ledger state, and repair/reconciliation recommendation for every entry.

A numbered checkpoint is not a canonical mapping update. The reverse crosswalk remains open until each disposition is reconciled into the source-phase evidence ledger without collapsing distinct JAMB contexts.

Downstream domain, subgroup, role, and role-naming work remains deferred.
