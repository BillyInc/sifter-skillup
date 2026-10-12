# CCMAS conflicting-outcome repair checkpoint — 2026-09-30

Status: **dry_run**

This pass is limited to the 141 empty-outcome rows classified as multiple/conflicting source contexts.

## Exact counts

- `target_rows_before`: **123**
- `repair_candidates`: **0**
- `repairs_applied`: **0**
- `ledger_events_already_present`: **0**
- `repairs_skipped_after_preimage_check`: **0**

- classification `source_authored_absence` before apply: **47**
- classification `true_source_conflict` before apply: **14**
- classification `unresolved_context_or_extraction` before apply: **62**

Only `repairable_unique_candidate` rows can change CCMAS JSON. Source-authored absences and unresolved/conflicting rows are retained in the JSON and JSONL ledgers; no JAMB or downstream data is changed.
