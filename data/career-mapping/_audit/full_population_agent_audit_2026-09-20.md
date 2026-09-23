# Full-population downstream agent audit

Generated: 2026-09-21
Scope: 237 canonical programmes, 420 JAMB identities, local curriculum/mapping/downstream contracts.
Mode: read-only local audit; no SQL, browser, UI or existing inventory was changed.

## Executive result

- Population identity: **237 programmes / 420 JAMB identities**.
- Curriculum contract: **236 generic + Sociology**, with **0 missing contracts**.
- Active programme→domain links: **1344** across **237 programmes**; unmapped programmes: **0**.
- Contextual transport: **121377 items / 408163 relationships**; manifest match: **True**.
- Admin state: **237 programme queues**, with review states retained; browser/SQL remain outside this audit.

## Curriculum and programme mapping

- Student outcome rows counted from the per-programme scaling records: **81186**.
- Programmes with legacy profile rows retained as audit evidence: **237** (131178 rows).
- Active relationship types: `{"adjacent": 64, "direct": 206, "functional": 1074}`.
- Programmes with unverified domain links: **0**.
- Quarantined/unverified mapping rows retained outside active guidance: **375** (`{"retain_quarantined": 375}`).
- Invalid active mapping rows: **0 programme-level findings**.

## Domain → subgroup → role continuity

- Domain registry: **168**; traceability rows: **558 subgroups / 5209 roles**.
- Active links checked for downstream continuity: **1344**.
- Links missing a domain registry record: **0**.
- Links whose domain has no traced subgroup or role: **0**.
- Roles without work-profile rows: **119**; without any recorded anchor: **0**.

## Tool/category duplication

- Aggregate domain tool rows: **3866**; subgroup aggregate rows: **5186**.
- Generic/category-like rows: **1571**.
- Same-scope duplicate rows: **0**; domain↔subgroup repeated rows: **4089**.
- D078 `Microsoft Office software` aggregate rows: **3**.
- These are source-layer findings, not a claim that every row is currently student-visible; they require ownership/category review before promotion.

## Source, link and relationship states

- Contextual items by data state: `{"source_backed": 121377}`.
- Contextual items by link state: `{"linked": 5253, "no_link": 116116, "review_required": 8}`.
- Missing source-reference rows: **0**; missing locator rows: **0**.
- Invalid item-link URLs: **0**; O*NET item-link URLs: **0**; O*NET source-reference occurrences: **45984**.
- Relationships by state: `{"not_established": 2305, "source_backed": 405858}`; by type: `{"builds_on": 259241, "not_established": 2305, "works_with": 146617}`.
- Relationship rows unresolved/review-required by the raw catalogue fields: **2305**.
- Duplicate typed contextual items (sample cap 100): **at least 0**.
- Ownership mismatches: **0**.
- A source reference is not automatically an item-specific learning link. `not_established` relationships remain staff/audit evidence until an item-specific source establishes the edge.

## JAMB identity and admin queue

- JAMB mapping rows: **420** identities and **420** mapping rows.
- Coverage categories: `{"combined_ccmas_curriculum": 28, "external_sources_required": 6, "partial_curriculum_scope": 273, "single_ccmas_full_curriculum": 113}`.
- JAMB identities without component references: **0**; without source references: **0**.
- Programme resource review states: `{"review_required": 237}`.
- Programme relationship review states: `{"not_established": 211, "review_required": 26}`.
- Programme admin review states: `{"pending_full_population_render": 237}`.
- Existing admin queue summary: `{"contextualItemLinkStateGaps": 0, "contextualItems": 121377, "notEstablishedRelationshipRows": 2305, "unresolvedRelationshipRows": 2305}`.

## Exact open findings

1. The aggregate `domain_tools` layer contains generic software/category rows and repeated domain/subgroup tools; D078 includes `Microsoft Office software`. These rows are not accepted as student-facing guidance by this audit.
2. The contextual catalogue is structurally source/state complete according to its local manifest, but O*NET references are present in provenance. Student payload/UI exclusion of legacy O*NET links still requires a separate route/payload proof.
3. The source-enrichment contracts intentionally retain programme-level `review_required` resource and `not_established` relationship states. They are backlog states, not evidence that exhaustive item-specific internet verification has been completed.
4. Roles without work-profile rows remain an admin/source-review continuity gap even when a role anchor exists.

## Boundary

This audit does not fetch URLs, apply SQL, run browser proof, alter UI/API/SQL, or overwrite any prior inventory. It reports the checked-in local state only; live deployment and URL reachability remain unproven.
