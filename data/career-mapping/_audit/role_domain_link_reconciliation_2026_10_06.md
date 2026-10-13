# Role-to-domain link reconciliation — 2026-10-06

This local apply step consumes the completed global exact-key review ledger. It changes student-path eligibility, not the underlying occupation identity or source evidence.

## Result

- Ledger decisions: **543** exact role-domain keys.
- Current links excluded from student paths: **504**.
- Explicit reclassifications: **75**.
- Reclassification targets already present: **30**.
- Reclassification target links added: **45**.
- Stale/no-active-delta records left unchanged: **38**.

The current parent-domain link is excluded only when the ledger says `remove_link_only`, `preserve_exclude`, or `reclassify_exact`. The occupation record remains available for provenance and other independently supported parent links. Newly added target links are marked `specialization_fit_review_status=review_required`; they must pass the separate role-to-subgroup/area-of-specialization audit before downstream subgroup display is treated as complete.

No SQL or live deployment was performed.
