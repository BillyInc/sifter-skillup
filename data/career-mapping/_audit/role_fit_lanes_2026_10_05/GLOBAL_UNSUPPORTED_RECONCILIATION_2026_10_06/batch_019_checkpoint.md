# Unsupported role→domain reconciliation — batch 019

Date: 2026-10-06  
Scope: all 15 active D031 Sales and Business Development unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key(s) | Recommendation | Result |
|---|---|---|
| `D031|ICT buyer` | `reclassify_exact` | Recommend new D036 procurement key; this is buyer-side sourcing, not selling ICT. |
| `D031|bid manager` | `reclassify_exact` | Recommend the shared new D036 bid-manager key, already proposed for D030 in batch 018. |
| `D031|chief marketing officer`, `digital marketing manager`, `marketing manager`, `promotion manager` | `reclassify_exact` | Retain exact D030 marketing keys; tasks are marketing/brand/promotion. |
| `D031|commodity trader` | `retain_supported` | This unsupported flag is a false positive: D031's own scope explicitly includes trading commodities, matching the role tasks. |
| `D031|costume buyer`, `set buyer` | `reclassify_exact` | Recommend new D042 Media Production and Broadcasting keys; each role procures production-specific costumes/props/sets. |
| `D031|destination manager` | `reclassify_exact` | Recommend new D083 Travel and Tourism key; destination strategy is tourism work. Existing D030 path remains unadjudicated. |
| `D031|green coffee buyer`, `purchaser` | `reclassify_exact` | Retain exact D036 procurement keys; tasks are purchasing/sourcing. |
| `D031|purchase planner` | `reclassify_exact` | Recommend new D034 supply-chain key; task is ongoing replenishment under existing contracts. |
| `D031|standalone public buyer` | `reclassify_exact` | Recommend new D036 public-procurement key. |
| `D031|tourism product manager` | `reclassify_exact` | Recommend new D083 tourism-product key; existing D030 path remains unadjudicated. |

All reclassifications remove only the named D031 edge; no global role deletion. New keys are recommendations, not canonical edits. The retained commodity-trader outcome is explicitly limited to D031 and does not decide whether another parent is also valid.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–019 contain **108 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2, D025 1, D027 20, D028 7, D030 3, D031 15).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **324 current exact keys remain undecided** (432 − 108). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain separate and open.
- No canonical role/domain data has been changed.
