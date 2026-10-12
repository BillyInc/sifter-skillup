# D113-D168 second targeted role reconciliation — 2026-10-07

Proposal-only result. No canonical role, area, subgroup, or source-reconciler file was edited.

## Exact-key counts

- Current active canonical rows/unique keys in range: **772**.
- Area residual occurrences: **406**, deduplicated to **405** unique keys.
- Canonical active keys absent from the D113-D168 first-pass ledger: **321**.
- Deduplicated second-pass target: **726** unique exact keys.
- Already dispositioned and intentionally not reopened: **46**.
- Raw source-backed omissions, kept separate: **316**.

## Dispositions

| disposition | unique keys | meaning |
|---|---:|---|
| supported | 136 | Supported role-to-area route is already recorded from task/area evidence. |
| conditional | 157 | Parent fit is conditional; remit/material/facility qualification is required. |
| direct_domain_role | 23 | Parent domain is supported but no distinct area route is justified. |
| unsupported_exact_link | 0 | Task evidence rejects the exact parent-domain link. |
| duplicate | 0 | Duplicate source ownership requires deduplication before promotion. |
| still_unresolved | 410 | Exact blocker recorded; no safe area assignment without stronger task/boundary evidence. |

## Evidence method

Each record retains the current role task description/skills, current area boundaries, local source URLs where present, and official ESCO/O*NET/ILO reference URLs with locator, date and limitation. Negative-neighbour checks list same-domain areas that were not selected. No route is inferred from ISCO/ESCO or subgroup membership.

## Raw omissions

The first-pass ledger contains **316** source-backed role keys that are not current canonical active records. They are listed in JSON with their first-pass classification and evidence, but this pass proposes no automatic re-add.

Re-run: `python second_pass_d113_d168_targeted_reconciliation.py`.
