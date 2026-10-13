# Subgroup/role audit handoff and Nigerian-context gate

Date: 2026-10-06

This is a sequencing checkpoint for the current taxonomy repair. It does not
change canonical taxonomy files.

## Current structural inventory

- Catalogue domains: **168**.
- Merged role mappings: **3,964**; active role mappings after current exclusions: **3,441**.
- Subgroup records: **557**; active student-visible subgroup records: **311**; source-preserved excluded records: **246**.
- Domains with no visible subgroup after the current semantic route corrections: **88**. These are not automatically errors: some should remain direct domain → role routes, while others need a source-backed specialization layer.
- Domains with no active role mappings: **16**. The current list is recorded in the regenerated taxonomy inventory; it is an enrichment queue, not permission to invent roles from titles or subgroup counts.
- The zero-role list is an enrichment queue, not permission to invent roles from titles or subgroup counts.

## Required order

1. Finish the global subgroup/area-of-specialization review for every domain,
   including the no-role and flat-path domains.
2. Audit every role against the approved domain and approved specialization
   using actual task evidence. ISCO membership is not fit evidence.
3. Apply only deterministic role exclusions/reassignments and approved
   specialization changes; retain conditional/unresolved cases explicitly.
4. Rebuild and verify the canonical seed locally.
5. Add Nigerian context to the finalized specialization and role records.
   Nigerian context must be an explicitly labelled enrichment layer; it must
   not replace the globally recognized specialization or role definition.
6. Run the final domain → specialization → role and Nigerian-context audits.

The Nigerian pass must therefore not be treated as proof of global role fit,
and the current global audit must not be described as Nigerian enrichment.

## Latest local verification

- Structural subgroup/role repair: **0 invalid role paths** after the current role-domain reconciliation; **19** reclassified routes remain explicitly gated because no supported target subgroup exists yet.
- Current semantic register: **1,577** conditional role-to-subgroup rows reconciled as **1,315 conditional**, **79 supported**, **64 wrong-subgroup**, and **119 direct-domain-role** dispositions. The deterministic apply changed **183** routes (**64 reassignments** and **119 direct-domain-role routes**); semantic sign-off remains false.
- Sparse-role register: **145** role-coverage candidates across **79** domains, including **75** in D085-D168; **40** net-new role proposals, **22** structurally safe-to-activate candidates, and **0** existing inactive links safe to activate. These remain review-only because the proposed additions still require approved subgroup/role sign-off.
- The specialization register still contains **42** source-reviewed specialization recommendations pending independent implementation. The **75** D085-D168 candidates are not 75 confirmed specialization gaps: the completed classification separates **2** specialization/subgroup gaps, **41** duplicate/ownership cases, and **32** no-addition cases.
- Role completeness scan: **16 empty domains** remain in the source-population enrichment queue; all **3,964** merged role keys have at least one recorded source signal.
- Seed-readiness remains blocked by the existing source/denominator gate (`all_domain_review_rows_are_structural_only` is false). This is a verification gate, not a claim that the subgroup/role audit is complete.
- The source-backed materialization and contract repair are deterministic and repeatable; they must be rerun after the semantic role→subgroup decisions are applied.
