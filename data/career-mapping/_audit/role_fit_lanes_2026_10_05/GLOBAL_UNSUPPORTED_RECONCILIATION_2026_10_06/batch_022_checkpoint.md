# Unsupported role→domain reconciliation — batch 022

Date: 2026-10-06  
Scope: the **236** exact keys left after prior global batches 001–021. This is a parent-domain audit only; it does not audit role→subgroup or role→specialization links.

## Exact result

| Result | Count |
|---|---:|
| Unsupported queue total | 543 |
| Already dispositioned in batches 001–021 | 307 |
| This batch | 236 |
| `remove_link_only` | 235 |
| `reclassify_exact` | 1 |
| `preserve_exclude` | 0 |
| `unresolved` | 0 |

The one exact reclassification candidate is `D152|conservation scientist` → `D121|conservation scientist`. The source task record is the same in both records and explicitly describes forest, park, wildlife-habitat and biodiversity work; this is not a title-only move. The remaining rows have saved task/domain evidence supporting removal of the current parent edge, including the six records sourced from the separate D119 ledger.

## Evidence and safeguards

- Every decision retains the saved task evidence, the current parent-domain scope, source references and the originating review artifact.
- Same-title records in other domains are recorded as **context only**. They never prove fit or destination.
- ISCO group, subgroup membership and role title were not used as fit evidence.
- No role→subgroup or role→specialization decision is made here.
- No canonical domain structure, role library, subgroup script, or seed file was edited.

## Verification

```text
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06/build_batch_022_remaining_queue.py
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_022_remaining_queue
```

The focused tests assert exact queue arithmetic, one-time coverage, saved evidence on every row, the explicit D152→D121 transfer, and the no-ISCO/no-subgroup/no-canonical-edit invariants.
