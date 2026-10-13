# Unsupported role→domain reconciliation — batch 012

Date: 2026-10-06  
Scope: all five active D017 Mechanical Engineering unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D017|architectural drafter` | `reclassify_exact` | Recommend new D021 Architecture and Urban Planning key; do not endorse the existing D018 same-title mapping. |
| `D017|electrical drafter` | `reclassify_exact` | Recommend new D016 Electrical Engineering key; source tasks draft electrical systems/equipment. |
| `D017|electronics drafter` | `reclassify_exact` | Recommend new D016 key; source tasks draft electronic systems/components. |
| `D017|electronics production supervisor` | `remove_link_only` | Remove D017; manufacturing-line supervision is not mechanical engineering. No electrical-engineering destination guessed from the sector; alternate parent remains unresolved. |
| `D017|printed circuit board designer` | `reclassify_exact` | Recommend new D016 key; PCB circuit design fits the domain's explicit circuit/electronic-device scope. |

Each action is an exact-key recommendation only. Other same-title parent links are not automatically validated or modified.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–012 contain **54 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **378 current exact keys remain undecided** (432 − 54). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
