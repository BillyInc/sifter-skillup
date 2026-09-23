# Quality remediation lane 71 — needs review

Batch: quality_remediation_lane_71_20260922

## Integrity exception

- Selection: **100/100** selected IDs.
- Ledger: **120** valid JSONL rows.
- Unique ledger subject IDs: **100**.
- Missing selected IDs: **0**.
- Outside IDs: **0**.
- Extra records: **20**.
- Duplicate identities: **20**.
- All selected IDs reconcile as a set: **yes**.

The ledger is intentionally unchanged. The duplicate-row condition remains
unresolved and the lane is not finalized.

## Decisions

- review_required: 120
- promoted: 0
- not_promoted: 120

## Scope boundary

No scope changes were made. Relationships, catalogue data, SQL, seeds, UI, and
browser proof were not touched. This report does not repair or rewrite the
append-only ledger.

Source hashes:

- Selection JSON: c00619649d4596b41f2e6f23d294432e99d90d45b1696905bd37f3bf6fc5deab
- Ledger JSONL: 37cef24dac70af1cdf0bc8e592637caf6606ceed004269cbaceaf6bea8b8d0ca
