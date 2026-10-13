# Unsupported role→domain reconciliation — batch 020

Date: 2026-10-06  
Scope: all eight active D032 Project and Programme Management unsupported exact keys, checked against current seed source. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key(s) | Recommendation | Result |
|---|---|---|
| `D032|advertising sales agent`, `D032|auctioneer` | `reclassify_exact` | Recommend new D031 exact keys; both defined tasks are sales transactions, not project management. |
| `D032|director of compliance and information security` | `reclassify_exact` | Recommend new D038 Compliance/Regulation/Governance key; compliance governance is explicit, not inferred from seniority. |
| `D032|intellectual property consultant`, `D032|publishing rights manager` | `reclassify_exact` | Recommend new D163 IP-practice keys; source tasks concern rights valuation/protection/licensing. |
| `D032|manufacturing cost estimator` | `preserve_exclude` | Remove project-management student route; destination unresolved rather than inferred from estimating costs/time. |
| `D032|talent agent` | `preserve_exclude` | Remove project-management student route; cross-sector representation does not establish one parent among media, recruitment and sports. |
| `D032|tourism contract negotiator` | `reclassify_exact` | Recommend new D036 contract-management key; role negotiates tourism-service contracts, not project delivery. |

All new destination keys are recommendations only. Each parent-edge action is exact-key scoped; no role record is globally deleted.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–020 contain **116 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4, D014 2, D015 1, D017 5, D018 6, D023 2, D025 1, D027 20, D028 7, D030 3, D031 15, D032 8).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**.
- **316 current exact keys remain undecided** (432 − 116). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain separate and open.
- No canonical role/domain data has been changed.
