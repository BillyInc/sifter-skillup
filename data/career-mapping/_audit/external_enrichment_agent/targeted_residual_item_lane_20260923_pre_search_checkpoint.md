# Targeted residual item lane — pre-search checkpoint (2026-09-23)

This append-only checkpoint freezes the starting point before targeted searches.
It covers exactly the eight canonical contextual item rows whose explicit
`link_state` is `review_required`; it does not rerun the broader 9k item queue.

| Count | Value |
| --- | ---: |
| Canonical contextual item rows | 121,377 |
| Canonical `linked` rows | 5,253 |
| Canonical `no_link` rows | 116,116 |
| Canonical `review_required` rows | 8 |
| Missing/invalid link-state rows | 0 |
| Targeted rows in this lane | 8 |
| Searched at checkpoint | 0 |
| Promoted at checkpoint | 0 |
| Retained review-required at checkpoint | 8 |

Inputs read: `CONTEXTUAL_ITEM_LINK_STATE_AUDIT_2026-09-19.json`,
`contextual_guidance_items.json.gz`, and
`REMAINING_BLOCKERS_RECONCILIATION_2026-09-23.md`.

No population rerun, SQL, live database write, browser proof, frontend change,
or catalogue mutation was performed. The next action is targeted authoritative
search for the eight rows only, preserving item-specific URLs, locators, and
access dates.
