# Unsupported role→domain reconciliation — batch 004

Date: 2026-10-06  
Scope: all four active D007 User Interface and User Experience Design unsupported exact keys. Task-level global evidence; no canonical edits; role→specialization excluded.

| Current exact key | Recommendation | Evidence-based destination/handling |
|---|---|---|
| `D007|digital games developer` | `reclassify_exact` | Move to existing `D139|digital games developer`; preserve independently supported `D001|digital games developer`. Source task is coding/implementing game functionality, not interface design. |
| `D007|performance video designer` | `remove_link_only` | Performance projection design tasks do not fit UI/UX. Existing D139 exact key is not endorsed and remains separately reviewable. |
| `D007|search engine optimisation expert` | `reclassify_exact` | Recommend new `D030|search engine optimisation expert`; O*NET Search Marketing Strategists explicitly includes SEO titles and tasks in search visibility, keyword research, online marketing, and campaign measurement. |
| `D007|web content manager` | `remove_link_only` | Web content strategy/governance does not establish interface design or UX tasks. Other exact mappings are untouched and not endorsed by this row. |

O*NET is an official US occupational source and is used to clarify tasks only, not to claim global or Nigerian prevalence. The ESCO task descriptions are also present in the current checked-in role source; its exact role-page interface was not accessible for every UUID during this session. Parent scope comes from current `domain_meta.json`. No mapping was inferred from occupational groups or subgroup membership.

Run:

```powershell
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_004_d007_recommendations
```

## Cumulative lane count

- Batches 001–004 contain **18 active exact-key decisions**: D001 5, D002 8, D005 1, D007 4.
- The original 543-key queue has 432 exact keys present in the current seed input; 111 are stale-source-absent and kept outside active deltas.
- The active remainder after these batches is **414**. This is a queue count only; remaining keys require the same per-key review and are not presumed wrong.
- No canonical edits have been applied. The next batch advances through active keys in domain-ID order.
