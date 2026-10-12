# Unsupported role→domain reconciliation — batch 001

Date: 2026-10-06  
Scope: D001 Software Engineering’s five exact keys in the 543-link unsupported queue. Global evidence only. No canonical edits; no role→specialization review; no Nigerian-context pass.

## Live-source preflight

The prior audit queue was compared to the actual seed input, `role_library_v3_cleaned.json`, rather than treating the Oct 3 inventory as current. The seed input has 3,411 rows and 3,408 distinct exact `(domain_id, role_name)` keys. Of the 543 queued unsupported keys, 432 still exist in this current input and 111 do not. Those 111 are stale relative to the current seed source and must not be treated as live mapping corrections without a separate lineage check.

All five D001 queued keys do still exist in the current seed input, with task descriptions. Each task description and D001’s current domain scope were read before making a recommendation. Existing exact-key duplicates in other domains were inspected; they are preserved unless individually adjudicated.

## Exact-key recommendations

| Exact current key | Recommendation | Proposed target / preservation | Basis |
|---|---|---|---|
| `D001|ICT disaster recovery analyst` | `remove_link_only` | Preserve current `D004|ICT disaster recovery analyst`; do not endorse it here | Source tasks are continuity/disaster recovery, risk and recovery planning, not software engineering. |
| `D001|Information Technology Project Managers` | `reclassify_exact` | Candidate `D032|Information Technology Project Managers` (target absent) | O*NET task profile is IT project scope/schedule/budget/staffing/delivery; D032 is Project and Programme Management. |
| `D001|Video Game Designers` | `reclassify_exact` | Candidate `D139|Video Game Designers` (target absent) | O*NET tasks are game mechanics, missions, narrative, and design documentation; these directly fit Game Design, not software engineering by default. |
| `D001|cloud identity manager` | `reclassify_exact` | Candidate `D005|cloud identity manager` (target absent) | ESCO task record is cloud identity/access governance and compliance; D005 covers cloud systems and security/compliance. |
| `D001|web content manager` | `remove_link_only` | Preserve D007 and D139 exact records without endorsing either | ESCO tasks concern online content strategy/governance and compliance, not software engineering; matching title does not justify choosing UI/UX or game design. |

For reclassifications, the proposed target key is a recommendation to move this role record, not a request to duplicate it globally. Apply only after the full unsupported queue has been reconciled and targets have passed final cross-domain checks. `remove_link_only` removes only the D001 edge; it never deletes the role globally.

## Evidence and limitations

- O*NET official task profiles were checked for Business Continuity Planners (`13-1199.04`), IT Project Managers (`15-1299.09`), and Video Game Designers (`15-1255.01`). O*NET is US-scoped; it supports task interpretation, not a claim of global prevalence or Nigerian demand.
- ESCO source identifiers and checked-in role descriptions were checked for ICT disaster recovery analyst, cloud identity manager, and web content manager. ESCO is an EU occupational framework; source/task descriptions inform the exact work profile but do not themselves determine this product’s parent taxonomy.
- Domain names and descriptions were read from current `domain_meta.json`. No parent was inferred from ISCO/ESCO occupational grouping or subgroup membership.
- The D004 recovery role and D007/D139 web content roles remain unadjudicated by this batch. No link was silently approved because it already exists.

## Reproduction

Run:

```powershell
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_001_d001_recommendations
```

The tests confirm the exact five-key queue slice, presence of each exact role/task in the current seed input, valid target domains, no duplicate target keys, link-only preservation rules, global-only scope, and no canonical writes. A green test validates the artifact’s linkage/invariants; it does not replace human/source judgment.

## Next batch

Proceed to the next domain with current exact unsupported keys after rechecking each key against `role_library_v3_cleaned.json`. Keep the 111 absent queue keys in a separate stale-key reconciliation bucket; do not apply them as active corrections until their removal/migration lineage is explained.
