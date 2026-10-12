# Unsupported role→domain reconciliation — batch 008

Date: 2026-10-06  
Scope: the sole active D012 FinTech Engineering unsupported exact key. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcome

| Exact key | Recommendation | Result |
|---|---|---|
| `D012|Securities, Commodities, and Financial Services Sales Agents` | `remove_link_only` | The occupation profile describes selling securities/commodities and advising on financial products/market conditions, not fintech engineering. No alternative exact parent exists in the current inventory, so none is inferred. |

This recommendation removes only this parent edge if later approved/applied. It does not delete the role record. The occupation source is O*NET 41-3031.00; its US occupational classification is used here only to interpret tasks, not to assert global prevalence.

The same D012 queue slice also contains three entries (`Financial Quantitative Analysts`, `financial analyst`, and `financial markets back office administrator`) that are absent from the current cleaned seed input. They are explicitly recorded as stale source keys with no canonical action; they do not increase the active decision count, and their former parent-edge status must be reconciled to source lineage before any edit.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–008 contain **42 exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1).
- The original 543 unsupported queue keys reconcile to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **390 current exact keys remain undecided** (432 − 42). This is a queue count, not an error count.
- The 11 catch-all unresolved records are still a separate unreconciled queue.
- No canonical role/domain data has been changed.
