# Role → area-of-practice route apply — 2026-10-07

Status: **dry_run** (run with `--apply` to write canonical route fields).

## Counts

- Unique active role keys: 3391
- Supported area routes: 93
- Evidence-supported direct Domain → Role routes: 43
- Residual review-required: 3255
- Role records that would change / changed: 12

## Residuals

Every residual role and its specific reason is in the adjacent JSON `residuals` array. No uncertainty is silently converted to a route.

## Scope safeguards

Only `specialization_fit_*` area-route fields are written. Legacy `subgroup_fit_*` fields and all parent-domain status/conditionality fields are left untouched. Direct routes are accepted only for explicit no-area domains and only when parent-domain fit is supported.
