# Unsupported role→domain reconciliation — batch 013

Date: 2026-10-06  
Scope: all six active D018 Civil Engineering unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D018|energy consultant` | `remove_link_only` | Energy-source/tariff/efficiency advice is not civil engineering; alternative parent unresolved. |
| `D018|landfill supervisor` | `remove_link_only` | Landfill operations supervision is not civil design; do not infer Environmental Engineering without engineering-task evidence. |
| `D018|logistics engineer` | `reclassify_exact` | Recommend new D035 Logistics and Transportation Operations key; role designs/optimizes transportation logistics systems. |
| `D018|mine shift manager` | `reclassify_exact` | Recommend new D022 Mining and Geosciences key; role supervises mine production/operations. |
| `D018|mine supervisor` | `reclassify_exact` | Recommend new D022 key; role directly supervises mine/quarry operations. |
| `D018|patent engineer` | `reclassify_exact` | Recommend a new D163 Intellectual Property Law and Patent Practice exact key; tasks are patent/IP practice, not engineering. The prior peer inventory listed this candidate, but it is absent from the current cleaned seed input. |

The two removals are parent-link-only and leave their alternative destinations unresolved. New D035/D022/D163 keys are recommendations only; they are absent from the live role inventory.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–013 contain **60 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **372 current exact keys remain undecided** (432 − 60). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
