# Specialization lane checkpoint 017 — D003–D056

Date: 2026-10-05

## Status and boundaries

- Local assignment: D003–D056; the other specialization lane owns D057–D091.
- **21/54 domain IDs assessed through D023:** 18 source-reviewed candidate sets (D003–D020), two source-reviewed scope holds (D021–D022), and a third scope hold at D023 because the Medicine parent population must first be reconciled against neighboring health domains. Next local cursor: D024 Nursing.
- D023 has 49 active role mappings, 0 visible specializations, and 3 excluded ISCO-derived occupational groups. See `D023_specialization_review.json` and `.md`; no final specialization count or role→specialization link was approved.
- The lane's prior count of 20/54 through D022 is superseded by this checkpoint. Do not count the concurrent D057–D091 lane in this cursor.
- D078 received a separate computational-coverage label refinement to `Computational and Quantitative Social Research`; its full sibling-specialization set remains unreviewed. See `_audit/D078_computational_specialization_review_2026_10_05.json` and `_audit/COMPUTATIONAL_DOMAIN_COVERAGE_RECONCILIATION_2026-10-05.md`.
- No role-to-specialization links were changed. One D078 subgroup display label/description was refined on source evidence; it is not external academic sign-off.

## Relevant findings

- D020: five source-supported environmental-engineering specialization candidates.
- D021: architecture versus urban/territorial planning remains a parent-scope split decision; do not force a subgroup count before reconciling cross-domain roles.
- D022: mining/geosciences overlaps D054 oil-and-gas scope; four current active/visible ISCO groups do not establish specializations.
- D023: medical specialty bodies show multiple genuine specialty branches, but their jurisdictional counts differ; the current root also contains adjacent allied-health, management, and informatics roles. Resolve parent membership first.

## Verification

- Taxonomy audit tests after D078 label refinement: **25 passed**.
- Computational deterministic triage after excluding generic subgroup/ISCO aggregates from direct domain evidence: **168 domains scanned; 1 named computational-field candidate (D142, already declared); 73 method/role-task signal domains; 33 occupational-aggregate-only domains; 61 with no lexical signal**. These are triage counts, not semantic pass/fail totals.
- D078 computational subgroup name is aligned between `domain_structure.json` and `computational_layer_manifest.json`.
