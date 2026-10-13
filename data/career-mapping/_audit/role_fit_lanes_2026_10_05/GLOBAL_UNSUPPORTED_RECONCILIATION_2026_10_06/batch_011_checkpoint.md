# Unsupported role→domain reconciliation — batch 011

Date: 2026-10-06  
Scope: the active D015 Accounting unsupported exact key. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcome

| Exact key | Recommendation | Result |
|---|---|---|
| `D015|investment clerk` | `reclassify_exact` | Recommend a new D062 Trading exact key: securities transaction records, orders, market-price tracking and settlement fit trading operations rather than organizational accounting. Target absent pending approval. |

This recommendation is grounded in the occupation task descriptions: O*NET Brokerage Clerks (43-4011.00) includes documenting and verifying securities transactions, calculating holdings/fees and tracking prices. Existing D060/D084 same-title records are not endorsed or altered. The O*NET profile is US-scoped and used to clarify duties only, not global prevalence.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–011 contain **49 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **383 current exact keys remain undecided** (432 − 49). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
