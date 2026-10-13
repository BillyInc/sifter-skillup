# Unsupported role→domain reconciliation — batch 009

Date: 2026-10-06  
Scope: all four active D013 Investment Analysis and Asset Management unsupported exact keys, verified against current seed input. Global-only; task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D013|investor relations manager` | `remove_link_only` | Investment-strategy communication to stakeholders is not investment research, asset management, or trading; D062 same-title link is not endorsed. |
| `D013|programme funding manager` | `remove_link_only` | Organizational programme-funding strategy is not investment analysis/asset management; no alternate inferred. |
| `D013|public funding advisor` | `remove_link_only` | Government grants/subsidy advice and application support are not investment analysis. |
| `D013|relationship banking manager` | `remove_link_only` | Customer relationship/cross-selling duties do not establish investment research or portfolio management. |

Each recommendation removes only its D013 edge if later approved/applied; none deletes a role record or changes any other parent mapping.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–009 contain **46 active exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9, D012 1, D013 4).
- The original unsupported queue reconciles to **432 exact keys present in the current seed source** and **111 absent/stale-lineage keys**. D012's three absent entries are separately recorded in batch 008; they do not count as active decisions.
- **386 current exact keys remain undecided** (432 − 46). This is a queue count, not an error count.
- The 11 catch-all unresolved records remain a separate open reconciliation.
- No canonical role/domain data has been changed.
