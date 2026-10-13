# Downstream held-mapping audit — increment 004

Audit-only, append-only checkpoint. This pass begins after the JAMB↔CCMAS reconciliation; it did not reopen course/source work, change role names, edit canonical mappings, or edit generated seeds.

## Exact current counts

- Held downstream mapping occurrences: **120**.
- Rows with complete component score-catalogue coverage: **119**; missing a component catalogue: **1**.
- Current published links for these held rows: **0**; unsupported published links: **0**. Therefore all **120** held rows are currently fail-closed in the student view.
- Component-domain observations: **2994**; unique JAMB↔domain candidate pairs: **2588** across **133** domains.
- Candidate pairs with a structurally available domain→subgroup→role route: **2588**; candidate domains missing meta/structure: **0**.
- Candidate pairs with a cleaned role-registry row: **2392**; without one: **196** across **19** candidate domains.
- `domain_structure.json` role counts match `role_library_v3_cleaned.json` for **61 / 133** candidate domains; subgroup role counts match for **63 / 133**. This is a registry reconciliation finding, not a role-name change.
- Candidate direct/functional/adjacent tier conflicts: **63 pairs** across **26 rows**.
- Candidate pairs without course-match evidence from every contributing component: **121**.

## Row-level dispositions

- **54 rows** are deterministic repair candidates: all component score catalogues exist, every candidate pair has course-match evidence, and no component tier conflict was found.
- **26 rows** need tier adjudication before publication because the same domain receives different tiers from different CCMAS components.
- **39 rows** need targeted course-evidence review for at least one candidate pair.
- **1 row** needs downstream evidence for a component not present in the score catalogue.

## Tier candidate counts

These are deterministic candidate classifications from the component score catalogue, not published student links. Conflicted pairs are retained as conflicts rather than silently promoted.
- Direct candidate pairs: **164**.
- Functional candidate pairs: **2357**.
- Adjacent candidate pairs: **67**.

## Deterministic repair rule

For the 54 fully stable rows, the next safe repair can materialize the component-score-catalogue union, preserve the derived direct/functional/adjacent tier, and attach the contributing CCMAS components as provenance. Do not publish a pair with a conflicting component tier, a false course-match flag, a missing component catalogue, or a missing domain/subgroup/role route. Those cases remain targeted downstream review candidates—not student requirements.

## Evidence basis

- `jamb_ccmas_domain_mapping_reconciliation_2026-09-29.json` identifies the exact 120 rows as mapping-only holds after course/source issues were cleared.
- `programme_domain_scores.json` supplies the component-level domain ID, score, course-match flag, and direct/functional/adjacent label.
- `domain_meta.json` and `domain_structure.json` verify the domain name, exclusion state, subgroup presence, and role count for each candidate route.
- `jamb_domain_map.json` verifies what is currently student-published; the 120 held rows have no published links, so this audit found no currently exposed unsupported link in this queue.

## Boundary

This is an audit checkpoint and repair queue only. It does not claim that candidate links are approved for students, and it does not replace the final domain/subgroup/role evidence audit. The full row inventory and evidence details are in the paired JSON checkpoint.
