# Unsupported role-to-domain reconciliation — batch 021

Date: 2026-10-06  
Scope: the 191 D001–D084 unsupported exact keys that remained after global batches 001–020. This batch carries forward the existing lane-owned task/domain decisions; it does not reopen closed records.

## Exact result

The 307 D001–D084 entries in the unsupported queue were compared with global batches 001–020. Those batches already cover 116 exact keys. The remaining **191 exact keys** all have exactly one saved D001–D084 lane decision and were carried forward into `batch_021_d001_d084_lane_carryforward.json`.

| Result | Count |
|---|---:|
| Unsupported exact keys carried forward | 191 |
| Live-source `remove_link_only` candidates | 148 |
| Explicit `preserve_exclude` holds | 5 |
| Stale source absent; no active delta | 38 |
| Missing lane evidence | 0 |
| Destination inferred | 0 |

The 148 removals are lane-owned candidates only. The artifact does not edit the canonical role library, domain metadata, role-to-domain seed, or role-to-specialization links. The five preserve/exclude rows retain their exact evidence and do not receive guessed destinations. The 38 stale-source rows are present in the historical queue and lane report but absent from the current role seed; they remain evidence-only lineage records.

## D077 and D080 checks

- D077 `Security Services` has the two queue keys already established as unsupported by the saved role-task review: `aircraft marshaller` (aircraft ground movement) and `game keeper` (habitat and wild-game management). Both remain exact parent-domain exclusions with no inferred replacement.
- D080 `Interior and Spatial Design` exists in `domain_meta.json`, but the current role seed has **0** D080 rows and the unsupported queue has **0** D080 rows. This is recorded as a held inventory discrepancy; no D080 role link was invented and no empty domain was treated as evidence that roles do not exist globally.

## Evidence rule

Every carried-forward row retains the saved task evidence, D001–D084 parent-domain scope, basis, source references and source limitations. ISCO/subgroup membership, title similarity and cross-domain duplicates were not used as fit evidence. No role-to-specialization field is present in the artifact.

## Verification

```text
python data/career-mapping/_audit/role_fit_lanes_2026_10_05/GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06/build_batch_021_lane_carryforward.py
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_UNSUPPORTED_RECONCILIATION_2026_10_06.test_batch_021_d001_d084_lane_carryforward
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.D001_D084.test_d045_d084_parent_domain_worklist data.career-mapping._audit.role_fit_lanes_2026_10_05.D001_D084.test_d077_security_services_role_fit data.career-mapping._audit.role_fit_lanes_2026_10_05.D001_D084.test_d084_payroll_bookkeeping_role_fit
python -m unittest data.career-mapping._audit.role_fit_lanes_2026_10_05.GLOBAL_CONTINUATION_2026_10_06.test_reconcile_exact_role_fit_coverage
```

Latest focused result: **19 tests passed** across the new carry-forward, D001–D084 lane, D077/D084, and global exact-key reconciliation checks.
