# Unsupported role→domain reconciliation — batch 014

Date: 2026-10-06  
Scope: both active D023 Medicine unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D023|Chiropractors` | `reclassify_exact` | Recommend new D126 Complementary, Alternative and Traditional Medicine key; tasks are chiropractic spinal/manual care. |
| `D023|Ophthalmic Laboratory Technicians` | `reclassify_exact` | Recommend new D098 Precision Engineering and Toolmaking key; tasks fabricate/finish precision optical components, not patient diagnosis/treatment. |

The National Center for Complementary and Integrative Health describes chiropractic as a licensed health-care profession involving manual therapy and spinal manipulation. O*NET describes ophthalmic laboratory work as lens/optical-element fabrication. These sources clarify task boundaries; they do not add a U.S.-specific market or licensing recommendation to the global taxonomy.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–014 contain **62 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **370 current exact keys remain undecided** (432 − 62). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
