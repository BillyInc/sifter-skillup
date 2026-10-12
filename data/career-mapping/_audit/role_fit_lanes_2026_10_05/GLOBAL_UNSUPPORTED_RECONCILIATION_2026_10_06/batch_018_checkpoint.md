# Unsupported role→domain reconciliation — batch 018

Date: 2026-10-06  
Scope: all three active D030 Marketing and Brand Management unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D030|activism officer` | `preserve_exclude` | Remove the marketing route; public advocacy is not commercial marketing. Destination unresolved; do not equate all campaigning with governance/policy administration. |
| `D030|bid manager` | `reclassify_exact` | Recommend new D036 Procurement and Contract Management key; task is tender/bid preparation, requirements, cost and risk. Do not endorse D031 duplicate by title. |
| `D030|licensing manager` | `reclassify_exact` | Recommend new D163 Intellectual Property Law and Patent Practice key; work administers IP/product licences and rights compliance. Do not endorse D031 duplicate by title. |

New D036/D163 keys are recommendations only. Each decision affects only its D030 edge; no role record is globally removed.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–018 contain **93 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2, D025 1, D027 20, D028 7, D030 3).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **339 current exact keys remain undecided** (432 − 93). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain separate and open.
- No canonical role/domain data has been changed.
