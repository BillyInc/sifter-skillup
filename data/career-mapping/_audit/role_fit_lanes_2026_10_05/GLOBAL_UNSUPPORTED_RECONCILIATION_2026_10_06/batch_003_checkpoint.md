# Unsupported role→domain reconciliation — batch 003

Date: 2026-10-06  
Scope: D005 Cloud Computing and DevOps. Global-only, task-based, no canonical writes, and no role→specialization decisions.

## Exact-key result

- `D005|IoT developer` is present in the current seed input. Recommendation: move this exact mapping to `D006|IoT developer`, which is currently absent, and preserve `D001|IoT developer`, whose independent reviewed task record supports software construction. The checked-in ESCO task description is connected-device/IoT software work and does not establish cloud-platform or DevOps responsibilities.
- `D005|communication infrastructure maintainer` is absent from the current seed input. It is recorded as `stale_source_absent_no_active_delta`; the D094 same-title key is not adjudicated here.

## Evidence and scope

The role task description was checked from the current role seed input and exact ESCO source identifier in the prior audit. D005/D006 domain descriptions were read from `domain_meta.json`; the existing D001 role-fit decision was checked to ensure its independent software-construction mapping is preserved. The current ESCO web interface did not expose the exact occupation page during this turn, so this checkpoint does not claim a fresh external page retrieval. The recommendation is based on task/domain fit, not the role’s occupational group.

## Queue progress

- Prior unsupported queue: 543 exact keys.
- Present in current role seed input at preflight: 432; absent: 111.
- Active exact-key recommendations completed: D001 5, D002 8, D005 1 = **14**.
- Active unsupported keys remaining at this checkpoint: **418** (before resolving any lineage for absent keys).
- No canonical data changes have been applied.

Run the batch test with:

```powershell
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_003_d005_recommendations
```
