# JAMB–CCMAS/external joined-inventory correction checkpoint — 2026-09-26 (001)

Status: **local correction applied; source adjudication remains open**.

The joined inventory builder previously detected an external/unanchored JAMB
scope only when it had selected rows without a `source_ccmas_programme`, or
when `component_refs` was empty. That omitted a valid class of records:
partial/combined scopes with an explicit `__custom__::...` component but no
selected course rows yet. The builder now treats every explicit custom
component reference as an external/unanchored signal and preserves the
component reference in the row-level output.

## Verification

The rebuilt inventory now reports:

- 420/420 JAMB identity rows joined;
- 237/237 CCMAS packages represented;
- 9,854 CCMAS course records in the current anomaly ledger;
- 420/420 JAMB scope rows joined to the JAMB inventory; and
- **8 external/unanchored scope rows**, including the three previously omitted
  custom identities: Intelligence and Security Studies, Social Justice, and
  Sociology and Anthroplogy.

This corrects inventory coverage only. It does not promote any external scope,
resolve its course evidence, or make a student-facing availability decision.
Those rows still require item-specific sources, offering-context evidence, and
course/outcome adjudication before closure.

## Changed files

- `data/career-mapping/_audit/build_jamb_ccmas_external_audit_inventory_2026_09_26.py`
- `data/career-mapping/_audit/jamb_ccmas_external_audit_inventory_2026-09-26.json`
- `data/career-mapping/_audit/jamb_ccmas_external_audit_inventory_2026-09-26.md`
- `data/career-mapping/_audit/test_jamb_ccmas_external_inventory.py`

Focused regression suite: **33 passed**.
