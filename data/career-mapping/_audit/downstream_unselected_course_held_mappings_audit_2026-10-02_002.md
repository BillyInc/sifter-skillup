# Downstream unselected-course and held-mapping audit — 2026-09-29 (002)

Audit-only, append-only reconciliation against the current selected JAMB course scopes. JAMB↔CCMAS source repairs, generated seeds, and role naming were not reopened or changed.

## Exact counts

- **reconciliation jamb names:** 420
- **unselected domain link occurrences:** 383
- **unselected domain link unique jamb domain pairs:** 383
- **unselected anchor entries:** 2762
- **held mapping occurrences:** 41
- **held downstream only occurrences:** 0
- **held overlap or state changed occurrences:** 41
- **open unselected anchor repair cases:** 281
- **deterministic anchor normalization candidates:** 84
- **genuinely unselected anchor entries:** 683
- **missing anchor payload entries:** 0

## Unselected-anchor classifications

- `exact_selected_title`: **1737**
- `genuinely_unselected_anchor`: **683**
- `punctuation_or_spacing_variant`: **1**
- `token_normalization_variant`: **3**
- `truncated_or_extended_selected_title`: **338**

## Held-mapping classifications

- `not_downstream_only_overlap_or_state_changed`: **41**

## Validation

- **All invariants passed:** `False`
- 420-name scope coverage: `True`
- 488 unselected queue reconciled: `False`
- 120 held queue reconciled: `False`
- All holds downstream-only: `False`
- No canonical edit flags: `True`

The machine-readable JSON contains every occurrence, its selected-course source summary, the stored anchor titles, deterministic comparison result, and repair recommendation.

## Boundary

No canonical edit was applied. This checkpoint does not approve student-facing downstream links or regenerate a seed.
