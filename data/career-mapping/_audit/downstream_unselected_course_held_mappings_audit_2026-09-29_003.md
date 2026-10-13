# Downstream unselected-course and held-mapping audit — 2026-09-29 (003)

Audit-only, append-only reconciliation against the current selected JAMB course scopes. JAMB↔CCMAS source repairs, generated seeds, and role naming were not reopened or changed.

## Exact counts

- **reconciliation jamb names:** 420
- **unselected domain link occurrences:** 488
- **unselected domain link unique jamb domain pairs:** 488
- **unselected anchor entries:** 3338
- **held mapping occurrences:** 120
- **held downstream only occurrences:** 120
- **held overlap or state changed occurrences:** 0
- **open unselected anchor repair cases:** 266
- **deterministic anchor normalization candidates:** 206
- **genuinely unselected anchor entries:** 687
- **missing anchor payload entries:** 0

## Unselected-anchor classifications

- `exact_selected_title`: **1977**
- `genuinely_unselected_anchor`: **687**
- `punctuation_or_spacing_variant`: **1**
- `token_normalization_variant`: **12**
- `truncated_or_extended_selected_title`: **661**

## Held-mapping classifications

- `downstream_hold_on_full_ccmas_inheritance_without_explicit_scope_rows`: **84**
- `downstream_hold_with_selected_course_evidence`: **36**

## Validation

- **All invariants passed:** `True`
- 420-name scope coverage: `True`
- 488 unselected queue reconciled: `True`
- 120 held queue reconciled: `True`
- All holds downstream-only: `True`
- No canonical edit flags: `True`

The machine-readable JSON contains every occurrence, its selected-course source summary, the stored anchor titles, deterministic comparison result, and repair recommendation.

## Boundary

No canonical edit was applied. This checkpoint does not approve student-facing downstream links or regenerate a seed.
