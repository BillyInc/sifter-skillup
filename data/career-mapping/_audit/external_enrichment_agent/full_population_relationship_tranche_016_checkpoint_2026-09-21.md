# Full-population relationship tranche 016 pre-search checkpoint

Date: 2026-09-21

Selected exactly **100** next deterministic pending non-D078 relationship rows.

Before any search, historical relationship ledger row IDs were normalized by removing the `relationship|` prefix and mapping historical null-target aliases (`missing`, `unresolved`, `review_only`, `review-required`) to `not_established`. The normalized prior set contained **69** IDs; selected overlap is **0** and D078 rows are **0**.

Search policy: retain null endpoints. Promote a row only when authoritative HTTPS evidence explicitly names both typed endpoints and a canonical `builds_on` or `works_with` edge. Otherwise record `review_required` with `not_established` and preserve the null target.

This checkpoint was written before searching. Only relationship selection, checkpoint, ledger and report artifacts belong to this tranche; item ledgers, SQL, seeds, UI and browser proof are out of scope.
