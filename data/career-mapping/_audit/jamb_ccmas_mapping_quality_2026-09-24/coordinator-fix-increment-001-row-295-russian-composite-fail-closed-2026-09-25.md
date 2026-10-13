# Audit-and-fix checkpoint — row 295 Russian with French/German

Recorded 2026-09-25 (Africa/Lagos). This is a targeted correction within the latest coordinator batch, rows 291–300. No other identity in that ten-row batch was changed.

## Evidence and correction

The official JAMB Arts brochure lists the exact catalogue identity **“Russian with French/German”** in the Arts/Humanities programme list (printed p. 130). The local scope currently selects **35 courses from only Arts::Modern European Languages (Russian)**; 19 have extracted outcome text, and no French or German course is selected. NUC’s Arts CCMAS separately lists Modern European Languages—French, —German, and —Russian, so the omitted second-language component cannot be supplied by treating Russian as the whole curriculum.

I therefore changed row 295 to `review_required` / `partial_scope_review_required`, cleared its active domain links from the scope and student map, and retained D043 Journalism and D065 Translation as candidate links in the canonical audit record. This does **not** assert that both links are false: the French/German variant, full course/outcome coverage, and role fit are unresolved. Journalism’s current Russian-grammar anchors do not themselves establish journalism preparation; translation is a more plausible language path but remains unconfirmed for this composite identity and its role descendants.

## Changed files

- `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` — row 295 held for review; active scope links cleared.
- `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json` — row 295 held for review; active links cleared; candidate links retained.
- `data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json` — matching derived fail-closed row.
- `data/career-mapping/jamb_domain_map.json` — matching active student map row, no exposed links.
- `data/career-mapping/_audit/jamb_ccmas_curriculum_coverage_matrix_2026-09-19.json` and `.md` — regenerated from current canonical state. They now report 31 review-required rows (up from the stale 28); this includes the row-295 change plus the Accounting and Finance and Computer Science with Economics holds already present in the worktree. Those two were not changed in this batch.
- This append-only checkpoint.

## Counts and remaining evidence

- Current batch 291–300: **1 identity changed**, **0 fully closed**, **1 unresolved/held**, **9 untouched**.
- The identity remains unclosed until the exact JAMB offering/awarder row establishes whether the second language is French, German, or an institution-specific option; relevant French/German course and outcome rows are scoped; missing Russian outcomes are reconciled; and each proposed domain → subgroup → role route is checked against course learning and the role’s actual tasks.
- No other row in 291–300 was altered because the available evidence does not yet establish a safe, offering-specific correction. In particular, parsed multi-faculty occurrences for Economics and Mass Communication remain source-context candidates, not proof that all contexts share one curriculum.

## Sources and verification

- JAMB IBASS, [Arts degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed p. 130: exact programme catalogue title; the institution-specific awarder cell/variant was not verified in this correction.
- NUC, [Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf): programme list distinguishes French, German and Russian; course/outcome sections must still be matched to the offering variant.
- Local scope row 295, canonical candidate links, and parsed JAMB offering inventory were checked. No shared UI/API, SQL, seed-generation logic, or unrelated identity row was changed.
