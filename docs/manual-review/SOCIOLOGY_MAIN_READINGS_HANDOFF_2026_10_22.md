# Sociology main readings handoff — 2026-10-22

## Request and implementation

Add the two main Sociology references immediately after the student-facing Sociology theme overview in `DegreeSkills`:

- Anthony Giddens and Philip W. Sutton, *Sociology*.
- Michael Haralambos and Martin Holborn, *Sociology: Themes and Perspectives* (8th edition).

Both are rendered from the existing approved, programme-owned `programme_reading` records. The new “Main Sociology books” card labels them optional and says paid or library access; it does not present them as prescribed course requirements. The card appears after the theme cards/overview and the “See all learning areas” control.

Giddens is tagged **Ideas and foundations** based on the stored resource's exact ninth edition (ISBN `978-1-5095-3922-2`): Wiley's matching product page identifies chapter 3 as “Theories and Perspectives.” Do not use Polity's 10th-edition chapter locator to describe this ninth-edition record. The tag is a student-facing theme association, not a claim that this text is prescribed or covers every Ideas outcome; the card continues to open the stored publisher URL.

Haralambos is added to the main-books card using its existing resource record. Its already stored theme-specific links remain available in the relevant theme cards.

## Local reconciliation — completed

The base Sociology resource migration now maps Giddens (`target_name = 'Sociology'`, ISBN `978-1-5095-3922-2`) only to `ideas`, with an edition-specific description, theme URL, rationale, source locator, and check date. Haralambos remains mapped to `people`, `ideas`, `research`, `social_issues`, and `governance`, with its existing item-specific descriptions.

For a database where the base resource migration has already run, apply `backend/migration_sociology_giddens_ideas_theme_2026-10-22.sql` after it. This narrow, idempotent update requires exactly one matching programme-owned row and fails loudly if the base row or ISBN does not match. It does not apply SQL to Supabase. Do not copy tenth-edition chapter numbering to the stored ninth-edition record.

## Files changed

- `src/components/careerIntelligence/DegreeSkills.tsx` — adds the main-books card, uses the existing approved reading records, and displays Giddens’ theme association.
- `src/components/careerIntelligence/DegreeSkills.test.tsx` — adds a focused rendering test for both readings, the Giddens theme, optional status and publisher action.
- `docs/manual-review/SOCIOLOGY_MAIN_READINGS_HANDOFF_2026_10_22.md` — this reconciliation note.
- `backend/migration_guidance_ownership_and_sociology_resources_2026-09-11.sql` — canonical data now includes the verified Giddens theme association.
- `backend/migration_sociology_giddens_ideas_theme_2026-10-22.sql` — narrow update for installations where the base migration is already applied.
- `docs/manual-review/SOCIOLOGY_PROGRAMME_THEME_RESOURCE_MATRIX_2026_10_08.md` — stale “unmapped” statement corrected.

## Verification and boundary

Edition-specific publisher evidence: [Wiley, *Sociology*, ISBN 978-1-5095-3922-2](https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2). The page identifies the 9th edition and lists chapter 3, “Theories and Perspectives.” The 10th-edition Polity page is not used as evidence for this stored record.

Focused test: `node node_modules/jest/bin/jest.js src/components/careerIntelligence/DegreeSkills.test.tsx --runInBand` — **19 passed**. Jest printed the existing Expo Constants native-module warning; the suite passed. No browser-render verification is claimed. No graph, curriculum inventory, UI explanations, role fit, SQL or migrations were changed.
