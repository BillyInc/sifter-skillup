# Unsupported role→domain reconciliation — batch 005

Date: 2026-10-06  
Scope: both current D008 Telecommunications and Network Engineering unsupported exact keys. Global, task-based review only; no canonical edits and no subgroup inference.

| Exact key | Recommendation | Task/domain rationale |
|---|---|---|
| `D008|ICT information and knowledge manager` | `remove_link_only` | Information strategy and knowledge governance are not telecom/network engineering tasks. No alternative is inferred from “ICT.” |
| `D008|chief technology officer` | `remove_link_only` | Enterprise technology leadership is not telecom-specific unless its actual job remit says so; employer sector alone cannot supply the missing fit. |

Both exact role keys and their task descriptions are present in the current seed input. Their exact ESCO identifiers are preserved as sources; the ESCO occupation web UI was not independently available for every identifier, so this is not described as a fresh external-page validation. The current D008 scope was checked in `domain_meta.json`.

Run:

```powershell
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_005_d008_recommendations
```

## Cumulative progress

- Active exact-key recommendations in batches 001–005: **20** (D001 5, D002 8, D005 1, D007 4, D008 2).
- Current seed input contains **432** of the old 543 unsupported keys; **111** are absent and remain in a stale-lineage queue.
- Active unsupported links without a recommendation in this new lane: **412**.
- No canonical changes have been applied. Continue with the next current domain ID and preserve the separate stale-key reconciliation.
