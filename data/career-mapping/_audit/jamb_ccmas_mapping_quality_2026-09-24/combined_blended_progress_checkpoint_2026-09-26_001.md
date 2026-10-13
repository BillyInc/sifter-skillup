# Incremental progress checkpoint — combined/blended scopes, rows 281–420

Checkpoint time: 2026-09-26 (Africa/Lagos).

## Completed this increment

- Enumerated all 54 one-based JAMB identities in `programme_mapping.json` rows 281–420 whose names include `and`, `with`, `/`, or `&`.
- Audited their current CCMAS component/scope states against the prior tranche audit artifacts and the checked-in course-level evidence.
- Separately classified confirmed scope/source defects, evidence-needed candidates, and one-package/alias positive controls; all four explicit combined scopes in this range (rows 290, 306, 337, 338) are recorded as zero-course evidence gaps.
- Saved the detailed row-by-row register at `combined_blended_source_audit_rows_281-420_2026-09-26.md`.
- Rechecked the official NUC Administration and Management CCMAS PDF for current row 77 only earlier in the same resumed goal; it was not used as evidence for unrelated rows. Today’s JAMB Engineering brochure extraction confirms directory entries including Food Science and Engineering, Petroleum and Gas Engineering, Polymer and Textile Engineering, and Water Resources and Environmental Engineering (printed p. 336; access date 2026-09-26).

## Files written by this increment

1. `combined_blended_source_audit_rows_281-420_2026-09-26.md` — audit register; 54 identity rows.
2. `combined_blended_progress_checkpoint_2026-09-26_001.md` — this append-only checkpoint.

No JAMB/CCMAS JSON, offering inventory, domain/subgroup/role data, generated seed, or SQL was changed by this increment. Existing dirty worktree changes in these shared artifacts predate this increment and were preserved.

## Status and limitation

Inventory/triage is saved; catalogue correction work is **not complete**. Confirmed issues are identified, but this increment deliberately did not rewrite shared scope JSON because multiple mapping/scope files already contain unrelated concurrent changes and most exact awarder/course-source locators are still unresolved. The audit register marks those rows as candidates rather than inventing curriculum evidence.

## Next step

Continue source-by-source for rows 281–420: verify exact JAMB offering cells and the owning CCMAS course title/content/outcome locators for each confirmed defect; close any bounded correction whose source chain is complete, and leave unresolved facets explicitly unsupported/evidence-needed. Do not touch downstream maps or seeds. Before any shared-scope edit, preserve a row-local before snapshot and re-check the active worktree diff so unrelated edits remain intact.
