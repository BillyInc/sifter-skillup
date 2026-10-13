# D057-D112 deterministic role/area-fit handoff — 2026-10-07

## Stop point

User has taken over the local deterministic fix. Do not edit or regenerate the deterministic script/report or overwrite any D057-D112 files unless the user asks.

## Last generated batch snapshot

The latest completed run before the stop used `audit_d057_d112_role_area_fit_deterministic_2026_10_07.py` and reported:

- 1,034 unique active role records across 51 domains; 209 normalized recommended areas.
- Parent-domain review carried forward: 858 supported, 176 conditional.
- Area dispositions: 22 supported, 1,012 `review_required`; zero direct-domain routes and zero parent rejections.
- All 1,034 roles had all same-domain recommended-area candidates scored.
- Prior explicit non-review dispositions found: 15; provenance was retained on all 15. Nine had current area keys/source refs validated; none was revalidated for operational import. The two old direct-domain decisions were not carried forward because D058 and D059 have recommended areas.
- Canonical domain/subgroup/role files were not edited.

This snapshot is not a passing final result. The user's added regression suite reported 2 passed and 2 failed. Failures: selected rows omit `decision.area_evidence_locators`; generic overlap still auto-accepts veterinary nurse → Laboratory Animal Science and Veterinary Research and other weak routes.

## Confirmed false-positive examples from the last generated report

- D066 veterinary nurse → Laboratory Animal Science and Veterinary Research, using only generic “animal health” language.
- D066 animal behaviourist → Livestock, Poultry and Aquatic Animal Health and Production, driven by phrase “animals through”.
- D066 aquatic animal health professional → a companion-animal health area, despite the role being aquatic/fish-focused.
- D088 aesthetician → Body Therapy and Massage, based on “body treatments” despite the task being primarily skincare.
- D090 pet sitter → Animal Grooming and Coat Care, based on “safe handling”.
- D095 tyre fitter → Heavy-Vehicle Service and Repair, based on generic “maintain/repair/vehicles”.
- D070 lighting technician → Live Performance Production and Technical Theatre, based on “systems that”.
- D093 automotive electrician correctly remained unresolved due explicit vehicle-work conflict with the built-environment area. Generic electrician had been auto-supported to building/commercial installation; this should be rechecked for whether the task's “nearly every type of facility” is sufficiently specific.

## Unfinished items (do not perform unless user resumes)

1. Add exact nested evidence locators to `decision.area_evidence_locators` for every selected route; carry URLs, source IDs, locator, claim-supported statement, and claim limit from Global Step 1 evidence.
2. Tighten automatic acceptance to require at least two genuinely area-specific task anchors—not generic actions, settings, or objects—and check incompatible task scope before selecting an area.
3. Keep all 15 prior dispositions traceable separately. Do not import a prior route automatically just because its keys exist; retain its old status/rationale/provenance and report whether current evidence independently revalidates it.
4. Extend tests to assert exact locator/source fields, reject the listed false positives, verify 1,034 unique coverage, and enforce the auto-acceptance gates.
5. Rerun the user's test file plus any new lane tests only after the user authorizes resuming edits. Refresh a separate checkpoint with final counts and exact residual reasons.

## Relevant files at stop

- Deterministic script: `data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/audit_d057_d112_role_area_fit_deterministic_2026_10_07.py`
- Last generated report: `data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_existing_role_area_fit_deterministic_2026_10_07.json`
- User regression tests: `data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/test_d057_d112_deterministic_role_area_fit_2026_10_07.py`
- Prior explicit-decision inventory: `data/career-mapping/_audit/role_enrichment_lanes_2026_10_06/D057_D112/D057_D112_existing_role_area_fit_review_2026_10_07.json`
- Reconciled area source evidence: `data/career-mapping/_audit/specialization_lanes_2026_10_05/STEP1_RECONCILIATION_2026_10_06/global_step1_specialization_reconciliation_2026_10_06.json`

No tests were run after the last report generation. No canonical files were changed.
