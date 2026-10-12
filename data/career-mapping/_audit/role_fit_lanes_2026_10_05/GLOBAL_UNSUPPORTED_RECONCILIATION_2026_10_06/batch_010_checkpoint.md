# Unsupported role→domain reconciliation — batch 010

Date: 2026-10-06  
Scope: both active D014 Actuarial Science unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D014|Insurance Sales Agents` | `reclassify_exact` | Recommend new exact D061 Insurance key; tasks are insurance-product sales, not actuarial modeling. Target absent pending approval. |
| `D014|insurance broker` | `reclassify_exact` | Retain the existing exact D061 insurance-broker mapping; do not endorse unrelated D051 same-title mapping. |

The recommendations remove only the D014 edge if later approved/applied. They do not delete role records or modify other parents.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–010 contain **48 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**. Batch 008 separately records the three absent D012 entries; they are not active decisions.
- **384 current exact keys remain undecided** (432 − 48). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
