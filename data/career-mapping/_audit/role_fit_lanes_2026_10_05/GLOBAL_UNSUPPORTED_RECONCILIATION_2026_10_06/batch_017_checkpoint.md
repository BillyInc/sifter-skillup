# Unsupported role→domain reconciliation — batch 017

Date: 2026-10-06  
Scope: all seven active D028 General Management unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D028|EU funds manager` | `reclassify_exact` | Retain existing D032 programme-management key; do not endorse D033 duplicate. |
| `D028|bank treasurer` | `reclassify_exact` | Recommend new D060 Banking and Credit Services key; bank treasury/liquidity is the defining remit. |
| `D028|building information modelling consultant` | `preserve_exclude` | Remove the D028 student route; construction/BIM parent is unresolved. Existing D032/D033/D034 duplicate mappings are not endorsed. |
| `D028|corporate treasurer` | `reclassify_exact` | Recommend new D158 Corporate Finance and Investment Banking key; tasks are corporate treasury/financial policy. |
| `D028|logistics analyst` | `reclassify_exact` | Retain existing D034 supply-chain/logistics analyst key. |
| `D028|manufacturing cost estimator` | `preserve_exclude` | Remove the D028 student route; current D032/D033/D034/D036 duplicates do not prove one exact destination. |
| `D028|procurement department manager` | `reclassify_exact` | Recommend new D036 Procurement and Contract Management key; core work is managing procurement operations. |

All moves/removals affect only the exact D028 edge. Role records and other parents are not globally deleted or automatically endorsed.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–017 contain **90 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2, D025 1, D027 20, D028 7).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **342 current exact keys remain undecided** (432 − 90). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain separate and open.
- No canonical role/domain data has been changed.
