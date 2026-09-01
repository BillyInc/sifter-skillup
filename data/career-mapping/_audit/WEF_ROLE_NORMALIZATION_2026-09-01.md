# WEF role normalization — 2026-09-01

This audit preserves every WEF 2025 label and links it to the current role layer only when the normalized title or alias resolves uniquely. It does not modify the role taxonomy or seed.

- Distinct WEF labels: **48**.
- Current deduplicated role keys inspected: **5209**.
- `ambiguous_canonical_match`: **2**.
- `review_required_unmatched_or_aggregate`: **26**.
- `unique_canonical_match`: **20**.

## Interpretation

A unique match can attach a WEF growth, decline, absolute-change, or emerging-technology signal to the existing role. Ambiguous and unmatched labels are dispositioned as WEF source signals only; they are retained for transparency but do not invent a role, subgroup, Nigerian demand claim, or programme mapping.

The complete label-by-label result is in `wef_role_normalization_2026-09-01.json`.

## Reproducibility

```text
python data/career-mapping/_audit_wef_role_normalization.py
```
