# Unsupported role→domain reconciliation — batch 007

Date: 2026-10-06  
Scope: all 9 active D010 Business Intelligence and Analytics unsupported exact keys, checked against the current seed source. Global-only; role-task evidence only; no ISCO/subgroup inference, no specialization decisions, and no canonical edits.

## Exact-key outcomes

| Exact key | Recommendation | Result |
|---|---|---|
| `D010|ICT integration tester` | `reclassify_exact` | Retain the independently supported exact D001 software-integration-testing mapping. |
| `D010|ICT system developer` | `remove_link_only` | General organizational ICT support/development does not establish BI tasks; no replacement guessed. |
| `D010|ICT system tester` | `reclassify_exact` | Point to existing D001 key but preserve its conditional fit status. |
| `D010|ICT test analyst` | `reclassify_exact` | Retain independently supported D001 software test-analysis mapping. |
| `D010|IT auditor` | `remove_link_only` | IT assurance and controls are not BI/analytics; no replacement inferred. |
| `D010|Project Management Specialists` | `reclassify_exact` | Recommend new exact D032 key; task and Project/Programme Management scope align. Target does not yet exist. |
| `D010|blockchain architect` | `reclassify_exact` | Retain exact D056 blockchain architecture route. |
| `D010|green ICT consultant` | `remove_link_only` | Environmental ICT strategy is not BI; no sustainability parent inferred from title. |
| `D010|software tester` | `reclassify_exact` | Retain independently supported D001 software-testing mapping. |

The five moves to existing D001/D056 exact keys rely on the role's documented task profile plus the destination's existing independent review/scope, not subgroup membership. The D001 system-tester route remains conditional. The project-management target is a recommendation for a new exact key, not an edit. Each removal applies only to D010 and does not delete the role globally.

## Reproduction

```powershell
python -m unittest discover -s 'data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06' -p 'test_batch_*.py'
```

## Cumulative progress

- Batches 001–007 contain **41 exact-key decisions** (D001 5, D002 8, D005 1, D007 4, D008 2, D009 12, D010 9).
- Current-seed reconciliation of the original 543 unsupported queue keys found **432 exact keys present** and **111 absent/stale-lineage keys**. Absent keys are not treated as active correction targets pending lineage reconciliation.
- **391 current exact keys remain undecided** (432 − 41). This is a queue count, not an error count or a prediction that each will be removed.
- The 11 catch-all unresolved records have not yet been reconciled; do not include them as resolved based on these batches.
- No canonical role/domain data has been changed.
