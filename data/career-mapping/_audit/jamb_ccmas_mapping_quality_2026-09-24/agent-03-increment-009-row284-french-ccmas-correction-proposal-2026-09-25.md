# Increment 009 — Row 284 French: CCMAS component correction proposal

Date: 2026-09-25  
Lane: research/checkpoint only  
Status: proposed; **no shared mapping, scope, canonical, derived, active-map, seed, or role files edited**

## Selection and audit context

After reviewing the row 281–420 issue summary, coordinator verification, subsequent increments, and the row-420 reconciliation context, the next high-confidence unresolved component/scope defect selected is canonical JAMB row **284, French**. Row 420 was already the subject of an explicit reconciliation checkpoint; this note does not reopen or modify it. The other clearly confirmed full-slice candidate, row 304 Efik-Ibibio, remains queued behind this higher-confidence false-absence correction.

The current issue sources agree that row 284 is marked `D_custom`/external-only because its mapping note says a French-specific CCMAS curriculum is absent. That premise is contradicted by `data/career-mapping/ccmas/arts.json`, which contains Arts component `FRE`, named **Modern European Languages B.A (French)**, with 40 total curriculum rows, including 30 French-coded (`FRE`) courses. `data/career-mapping/ccmas/education.json` separately contains an Education::French curriculum (30 courses); it must not be merged into the Arts JAMB identity merely because the name matches.

## Evidence and source-context findings

1. **JAMB identity/context:** The official JAMB Arts brochure lists standalone **French** separately from combined language offerings. This supports treating the Arts French identity as distinct from French-and-German/Russian, French-and-International-Relations, and Education French. It does not establish a particular university’s local course implementation; do not infer one from noisy institution arrays.
2. **CCMAS component:** The official NUC Arts CCMAS 2023 contains French course rows. The official PDF gives item-specific outcomes for, among others, FRE 104 (French composition), FRE 105 (introductory French↔English translation), FRE 106 (literary appreciation), FRE 107 (French prose genres), and FRE 109 (Nigeria and Francophone neighbours). Its content also covers French grammar, phonetics, writing, literature, translation, and Francophone culture.
3. **Parsed-data quality:** In the checked-in Arts JSON there are 30 `FRE`-coded courses, but 29 have no parsed `skills_learned` outcome. The course identity is enough to refute “no French CCMAS”; it is **not** enough to treat all parsed course titles as verified student learning claims. The official CCMAS PDF should be used to recover course-specific outcomes and locators before student publication. Do not automatically include the other ten shared/general curriculum rows as French-specific scope.
4. **External enrichment:** `data/career-mapping/enrichment/french.json` contains a 59-course external French curriculum and its own source claims. Because its stated reason for bypassing CCMAS is contradicted, it should be treated as a supplementary evidence source, not as the replacement base curriculum. Validate every external item against its cited institution/source and label institutional specificity; do not generalize a university curriculum to every JAMB French offering.

## Proposed row-only patch (not applied)

| Target | Proposed disposition |
|---|---|
| JAMB row 284 source mapping | Replace the false “French-specific CCMAS absent” rationale with the exact Arts CCMAS component `Arts::FRE — Modern European Languages B.A (French)`. Preserve the standalone Arts JAMB identity and its source context. Keep `Education::French` separate. Do not change any other row. |
| Row 284 curriculum scope | Reconcile against the 30 French-coded Arts CCMAS course identities. Recover course-level outcome text and precise PDF/page locators from the official CCMAS before treating a course as student-facing learning evidence. Keep shared/general courses out unless their relevance is independently demonstrated. External enrichment may fill verified gaps only, with each item's provenance and scope retained. |
| Domain/path relationships | Reassess existing D065 Translation and D149 Diplomacy/International Relations relationships individually against row-284 course outcomes and source-backed use. FRE 105 establishes introductory translation learning, but does not by itself prove every translation occupation/path. French-language/cultural study alone does not establish a Diplomacy/International Relations pathway. Until the row-specific evidence and fit are documented, retain both as **unpublished recommendations**, not confirmed student paths. Add no new links by analogy. |
| Release state | Keep student availability fail-closed/unpublished until the corrected component, item-level outcomes, source locators, and each retained path pass validation. This is an evidence hold, not a claim that no relevant learning or pathway exists. |

## Explicitly not authorized by this checkpoint

- No edits to `programme_mapping.json`, `jamb_curriculum_scopes_2026-08-17.json`, `jamb_ccmas_inheritance_canonical_2026-08-17.json`, `jamb_domain_map_ccmas_derived_2026-08-17.json`, `jamb_domain_map.json`, any seed/SQL, or role files.
- No merging of Arts French, Education French, or French-plus-another-language JAMB identities.
- No promotion of unsupported links or externally sourced course titles to confirmed student requirements.
- No role-name or role-record changes.

## Sources

- NUC, *Arts Core Curriculum and Minimum Academic Standards (CCMAS), 2023*, official PDF: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf (French course evidence visible in the PDF around printed Arts pp. 443–446; verify each exact locator during implementation).
- JAMB, *Degree Arts Brochure*, official PDF: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf (standalone French and combined language programme listings; confirm the exact offering/institution locator before attaching institution-level context).
- Local parsed source: `data/career-mapping/ccmas/arts.json` (`FRE`, 30 FRE-coded course rows); distinct local curriculum: `data/career-mapping/ccmas/education.json` (`FRE`, 30 courses).
- Existing tranche findings: `agent-03-rows-281-420.md`, `coordinator-verification-rows-281-420-2026-09-24.md`, and `_audit/.../README.md`.

## Next verification work

Build a course-by-course concordance for the 30 Arts FRE rows against the official NUC PDF, recording exact printed page, course title, outcome, and whether the checked-in parsed outcome is missing or divergent. Then adjudicate D065 and D149 separately. Only after that evidence is reviewed should a row-only implementation patch be prepared for approval; keep all other confirmed defects in the tranche register for later treatment.
