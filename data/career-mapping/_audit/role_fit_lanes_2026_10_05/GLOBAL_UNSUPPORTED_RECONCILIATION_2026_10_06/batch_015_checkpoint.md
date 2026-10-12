# Unsupported role→domain reconciliation — batch 015

Date: 2026-10-06  
Scope: the active D025 Pharmacy unsupported exact key. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcome

| Exact key | Recommendation | Result |
|---|---|---|
| `D025|pharmaceutical sales representative` | `remove_link_only` | Remove D025 only: pharmaceutical product promotion/sales is not preparing/dispensing medicines or pharmacy safety/quality work. No alternative domain inferred. |

O*NET 41-4011.00 confirms the role family is technical/scientific product sales; the use of that occupational source is limited to interpreting tasks, not global prevalence.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–015 contain **63 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2, D025 1).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **369 current exact keys remain undecided** (432 − 63). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
