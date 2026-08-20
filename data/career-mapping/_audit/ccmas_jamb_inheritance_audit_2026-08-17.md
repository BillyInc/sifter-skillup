# CCMAS → JAMB inheritance audit — 2026-08-17

## Decision

All 420 active JAMB names have an explicit inheritance scope: full CCMAS, combined CCMAS, course-scoped partial CCMAS, or separately evidenced external curriculum. The active domain links match the saved canonical scope artifact.

The active JAMB map now uses CCMAS-derived links for every certified row, records inheritance metadata, and exposes only the supported course-scoped links for partial and external rows.

## Current inheritance categories

- **partial_curriculum_scope**: 273
- **single_ccmas_full_curriculum**: 113
- **combined_ccmas_curriculum**: 28
- **external_sources_required**: 6

The bridge has **420** rows and **28** explicit supporting-component declarations. The stored skills artifact has **420** names, so **0** bridge names are stale or missing from it.
The original brochure source audit matched **400** bridge names exactly and **16** through declared source aliases; **0** have no source hit.
The saved canonical inheritance artifact marks **141** full/combined rows ready, **273** partial rows ready from course-scoped evidence, **6** external rows ready from explicit enrichment evidence, and **0** for further review.
The domain comparison found **420** rows matching their derived domain set and **0** with extra or tier-mismatched stored links. No rows remain held for review.
The parsed JAMB detail audit found source rows for **420 / 420** names. Field coverage is institutions **420**, UTME **420**, O-level **252**, Direct Entry **246**; the latter three are not complete.
CCMAS resolution checked **50** rows without a declared discipline using explicit name, unique code, faculty disambiguation, or reviewed external enrichment; unresolved components: **0**.

## Quantitative Finance

The D011 subgroup 21 grouping is retained as a subgroup inside the already-existing D011 Quantitative Finance domain. It did not meet the separate promotion gate for a new top-level domain because promotion would duplicate D011; no CCMAS programme-domain edges were split or rewritten by that decision.

The subgroup audit is not a claim that every subgroup is semantically perfect: its current report still records five empty subgroup-skill findings and a source-layer overlap issue. Those remain review items.

## Required implementation boundary

1. Keep A_exact/C_reclassified on full single-programme inheritance only after the CCMAS programme is resolved.
2. Use the saved course-level curriculum-scope artifact for B_granular rows; expose only its anchored domain links.
3. Derive combined JAMB domain links from the primary plus every reviewed supporting CCMAS component.
4. Keep D_custom outside unscoped CCMAS inheritance and require explicit external source evidence.
5. Regenerate the SQL/database seed from the active map before relying on the corrected links in a live database.
6. Use the original JAMB brochure audit to resolve unmatched aliases and to prove that a programme name is actually in the JAMB source catalogue.

The JSON report contains the row-level stale-artifact, blend, partial-scope, subgroup, and mapping-graph checks.
It also contains the CCMAS-derived domain alignment comparison and the parsed JAMB detail completeness audit.
