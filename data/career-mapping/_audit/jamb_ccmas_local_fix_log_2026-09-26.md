# JAMB–CCMAS local source/curriculum fixes — 2026-09-26

This append-only log records source/curriculum corrections made locally while the three range audits are in progress. It does not certify all 420 identities, approve a student-facing map, or claim SQL/seed deployment.

## FIX-001 — Chemistry and Industrial Chemistry component scope

- **Defect:** the canonical bridge contained only `Sciences::Industrial Chemistry`; it omitted the distinct CCMAS `Sciences::Chemistry` curriculum despite the JAMB identity naming both facets.
- **Correction:** declared Chemistry as a secondary CCMAS component and added a manual held reference-union scope selecting all source rows from both 42-course CCMAS packages (84 selected source rows). `scope_status=combined_scope_review_required`, `scope_approval=pending_review`, and `domain_links=[]` are retained. The record explicitly states this is not an institution-specific schedule.
- **Offering context preserved:** Sciences faculty; local parsed occurrence associates ABSU and IGBINEDION. Exact JAMB awarder cells and each institution’s course applicability remain unverified; do not treat the candidate union as an approved curriculum for either institution.
- **Sources:** JAMB, [Degree Sciences Brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), printed p. 452, entry 34 (accessed 2026-09-26); NUC, [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), Industrial Chemistry course structure printed pp. 298–299, ICH 251/252 outcomes p. 310 and ICH 319 outcomes p. 317 (accessed 2026-09-26).
- **Seminar record quality:** ICH 400 lists restricted topic areas, not explicit learning outcomes; its corrected source summary is flagged `source_topics_only_no_explicit_learning_outcomes` and leaves `skills_learned=[]` (NUC Sciences CCMAS, printed pp. 318–319).
- **Files:** `_aggregate_jamb_nuance.py`, `jamb/jamb_skills_nuance.json`, `_audit/jamb_ccmas_manual_scope_overrides_2026-09-25.json`, `ccmas/sciences.json`, `_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`, `_audit/jamb_curriculum_scopes_2026-08-17.json`.
- **Verification:** inheritance audit and scope builder rerun; regression tests assert both components, 84 rows, held/no-links state and ICH 400's topic-only status.

## FIX-002 — FCS 431 placeholder replaced with its verified course identity

- **Defect:** the Family and Consumer Sciences CCMAS source record mislabeled FCS 431 as `[NOT FOUND IN DOCUMENT …]` while attaching that course’s actual outcomes and content to the placeholder.
- **Correction:** set title to `Advanced Resource Management`, units to 2, lecture hours to 30; retained the source-backed four outcomes and content. The regenerated scope now identifies the actual course title for every selected FCS 431 occurrence.
- **Affected JAMB scopes:** Family, Nutrition and Consumer Sciences; Home Economics; Home Science, Nutrition and Dietetics; Home Science & Management; Home Economics and Food Management; HOME SCIENCE. These remain subject to their separate offering/scope reviews; correcting a course record does not approve their downstream links.
- **Source:** NUC, [Agricultural Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf), course table printed p. 220 and course outcomes/content printed p. 242 (accessed 2026-09-26).
- **Files:** `ccmas/agricultural_science.json`, `_audit/test_jamb_ccmas_materializer.py`, regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`.
- **Verification:** scope builder rerun; source JSON validation and focused regression tests pass.

## FIX-003 — Classics course metadata/outcomes restored from NUC CCMAS

- **Defect:** selected Classics courses CLC 201, CLC 203, CLC 204 and CLC 206 had empty parsed learning-outcome arrays; CLC 201 also had its title truncated with “(2 Units” and null unit/lecture-hour fields, while CLC 206 content was truncated mid-word.
- **Correction:** restored CLC 201 title/metadata and each course's source-stated outcomes; restored the complete CLC 206 course-content summary. No new curriculum component or downstream link was inferred.
- **Source:** NUC, [Arts CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), course table printed p. 164; CLC 201–206 contents and outcomes printed pp. 172–174 (accessed 2026-09-26).
- **Files:** `ccmas/arts.json`, `_audit/test_jamb_ccmas_materializer.py`, regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`.
- **Verification:** source JSON validation, inheritance audit and scope builder rerun; focused regression tests cover the restored metadata/outcomes.

## FIX-004 — Political Science and Defence Studies scope/source correction

- **Defect:** the blend registry added International Relations because a comment equated defence with strategic/IR studies, although the JAMB title does not name International Relations. The local Political Science `POL 401 Civil-Military Relations` record also contained three Development Administration outcomes and truncated Development Administration content; `POL 403` content retained a trailing extraction marker.
- **Correction:** removed the unsupported International Relations component; the canonical reference scope now uses only the Political Science CCMAS package, including its source-explicit POL 401 and POL 403 courses. It remains `full_scope_review_required`, pending review of the NDA-specific offering; domain links remain empty. Corrected POL 401 course outcomes/content and POL 403 content while preserving the separate Development Studies `POL 401 Development Administration` record.
- **Sources:** JAMB, [Degree Social Sciences Brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 668, `POLITICAL SCIENCE AND DEFENCE STUDIES — NDA`; NUC, [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), Political Science course table printed p. 204 and POL 401/POL 403 outcomes/content pp. 217–219 (accessed 2026-09-26).
- **Files:** `_aggregate_jamb_nuance.py`, regenerated `jamb/jamb_skills_nuance.json`, `ccmas/social_sciences.json`, `_audit/jamb_ccmas_manual_scope_overrides_2026-09-25.json`, and regenerated canonical/scope audit JSON.
- **Verification:** regression tests assert the single Political Science component, both defense-course anchors, fail-closed status/no domain links, and separation of Development Studies' same-code POL 401 course.

## FIX-005 — Preserve course-level CCMAS source provenance in generated JAMB scopes

- **Defect:** the Actuarial Science source repair attached official NUC URLs, printed-page locators and access dates to its corrected ACS course records, but `_build_jamb_curriculum_scopes.py` dropped those fields when materializing selected courses. Older CCMAS course rows without an explicit per-course citation also lacked a source anchor at the selected-course level, despite the JAMB scope already containing the relevant official NUC programme locator.
- **Correction:** selected course records now carry `source_url`, `source_locator` and `source_accessed_on`. Explicit course citations take precedence. When absent, the builder matches the linked CCMAS programme's own NUC evidence and adds the exact course code/title as an anchor to that programme's printed-page locator. It does not borrow another component's evidence. The row-77 Insurance and Actuarial Science reference union remains held, pending review, with no domain links.
- **Files:** `_build_jamb_curriculum_scopes.py`, regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`, and `_audit/test_jamb_ccmas_manual_scope_overrides.py`.
- **Verification:** focused scope/Actuarial tests pass (15 tests, 46 subtests). The regenerated row-77 scope retains both components and all 67 selected course-package entries; all 67 now have a URL, locator and access date. ACS 101 keeps its exact printed p. 58 locator; INS 101 points to the official Insurance course section and adds its exact course-code/title anchor. The scope remains `combined_scope_review_required` / `pending_review`, with `domain_links=[]`.

## FIX-006 — Repair Demography and Social Statistics DSS course metadata

- **Defect:** the four 100-level DSS course codes in the CCMAS source record had incorrect course titles. DSS 101 and DSS 102 swapped/shortened their actual population-studies and demography/statistics titles; DSS 103 and DSS 104 were mislabeled as non-mathematics courses. DSS 103 learning outcomes also included a PDF page-header fragment. All four records lacked course-content summaries despite those being present in the official curriculum.
- **Correction:** restored the exact CCMAS code/title pairing and 2-unit/30-hour metadata, added concise course-content summaries faithful to the published text, and removed only the page-header artifacts from DSS 103 outcomes. No curriculum component or downstream mapping was added or changed.
- **Source:** NUC, [Social Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), course structure printed p. 48; DSS 101–104 learning outcomes and course contents printed pp. 51–52 (accessed 2026-09-26).
- **Files:** `ccmas/social_sciences.json`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`.
- **Verification:** regression test checks each exact code/title pairing, units/hours, content summary, and removal of the extracted page-header strings. Scope generation and focused audits are run after the patch.

## FIX-007 — Restore the Computer Science component in Industrial Mathematics and Computer Science

- **Defect:** the exact JAMB Sciences identity and REDEEMERS awarder were verified at printed p. 493, but the local mapping represented only Sciences::Industrial Mathematics. The 16-row partial scope included only COS 101 and COS 201; these computing foundations did not cover the distinct Computer Science CCMAS package.
- **Correction:** declared Computing::Computer Science as a supporting CCMAS component alongside Sciences::Industrial Mathematics; stored both complete NUC packages as a held reference union. The 72 selected course rows retain their source package identity and exact package-backed course locators. The override is `combined_scope_review_required` / `pending_review` and contains no domain links. This is not a claim that REDEEMERS teaches every course in the union.
- **Open curriculum defect:** the parsed Computing CCMAS source has no `content_summary` for all 38 Computer Science course rows. The scope remains held until each course’s source content/outcomes are verified and the 38 summaries are recovered; IMT 320 is separately a 12-week attachment whose source assessment form was reviewed as an exception, not a missing taught-course outcome.
- **Sources:** JAMB, [Degree Sciences Brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), printed p. 493 (`INDUSTRIAL MATHEMATICS AND COMPUTER SCIENCE — REDEEMERS`); NUC, [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), Industrial Mathematics printed pp. 323–344; NUC, [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), Computer Science overview p. 26, structure pp. 28–30 and course contents/outcomes from p. 30 onward (accessed 2026-09-26).
- **Files:** `_aggregate_jamb_nuance.py`, `programme_mapping.json`, `_audit/jamb_ccmas_manual_scope_overrides_2026-09-25.json`, regenerated `jamb/jamb_skills_nuance.json`, `_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`, `_audit/jamb_curriculum_scopes_2026-08-17.json`, and `_audit/test_jamb_ccmas_manual_scope_overrides.py`.
- **Verification:** combined-component parity audit reports zero component mismatches; generated scope has 34 Industrial Mathematics + 38 Computer Science records, 72/72 source citation triples, and zero domain links. Manual scope regression suite: 13 passed. No active JAMB domain map or production seed was replaced.

## Verification run

```text
python data/career-mapping/_audit_ccmas_jamb_inheritance.py
python data/career-mapping/_build_jamb_curriculum_scopes.py
python -m pytest --basetemp .pytest-tmp-source-corrections-20260926 data/career-mapping/_audit/test_jamb_ccmas_materializer.py data/career-mapping/_audit/test_jamb_ccmas_manual_scope_overrides.py -q
21 passed, 46 subtests passed
```

The current audit still reports 71 `review_required` JAMB identities, 35 combined CCMAS curricula pending course/domain evidence, and other unresolved source-context and curriculum gaps. These are audit indicators, not claims that only those items remain. Downstream domain/subgroup/role audit and repair is deferred until the full JAMB-CCMAS source/curriculum phase is closed.

## FIX-008 - Remove cross-programme Nursing course records from Nursing Sciences

- **Defect:** the parsed Nursing Sciences package contained two extra records copied from other Allied Health programme sections: `NSC 201 Foundations of Nursing` (Dental Therapy, printed pp. 144/157) and `NSC 314 Clinical Nursing Procedure` (Audiology/rehabilitation section, printed pp. 34/56). Their code/title/units and rehabilitation outcomes do not match the Nursing Science programme's official course structure. This is a source-boundary/ownership error, not a reason to keep both same-code records in Nursing.
- **Correction:** removed only those two foreign records from the Nursing Sciences package. Retained `NSC 201 Foundations of Professional Nursing Practice I` (2 units; table printed p. 370, outcomes/content pp. 384-385) and `NSC 314 Mental Health and Psychiatric Nursing I` (2 units; table printed p. 371, outcomes/content pp. 395-396). No global course identity was deleted.
- **Source:** NUC, [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), Nursing Science course tables and course detail sections; printed pages cited above (accessed 2026-09-26).
- **Files:** `ccmas/allied_health.json`, `_audit/repair_nursing_course_ownership_2026_09_26.py`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB curriculum scopes.
- **Verification:** source-repair script asserts exact pre-edit row identities/counts; regression asserts the Nursing package has exactly the official NSC 201 and NSC 314 titles. Scope builder rerun; focused materializer tests pass (9 tests).

## FIX-009 - Keep both named CCMAS components in Computer Science with Economics

- **Defect:** a historical regression expected the old eight-course Computer Science-only partial scope and explicitly rejected Economics courses, even though the current source bridge declares a combined Computer Science and Economics identity.
- **Correction:** refreshed the scope from both declared components: 38 Computer Science + 38 Economics courses, each with `source_url`, `source_locator` and `source_accessed_on`. The reference union remains `combined_scope_review_required` / `pending_review` with no domain links; this does not assert every institution's exact course plan. All 38 Computing content summaries remain outstanding and block acceptance.
- **Files:** regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`, `_audit/test_jamb_manual_scope_review_holds.py`, and the findings register.
- **Verification:** updated regression checks both component identities, 38 rows per package, complete citation triples and fail-closed/no-link status.

## FIX-010 - Correct the FWM 408 code/title mismatch

- **Defect:** in Agricultural Science CCMAS, the local Forest Resources and Wildlife Management record labeled `FWM 408` as `Ecotourism and Wildlife Management Practices`, while its content and outcomes were the separate NUC course about harvesting, processing and utilization of forest products. The incorrect title had been used as apparent evidence of an ecotourism curriculum facet.
- **Correction:** changed only the CCMAS course title to the exact source title `Forest Products Harvesting, Processing and Utilization`. The record does not establish a dedicated ecotourism course; row 416 remains in scope review pending offering-specific primary curriculum evidence.
- **Source:** NUC, [Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf), FWM course table and FWM 408 outcomes/content, printed pp. 317 and 337 (accessed 2026-09-26).
- **Files:** `ccmas/agricultural_science.json`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB curriculum scopes.
- **Verification:** regression asserts title/content/outcome agreement; scope builder and focused tests rerun after correction.

## FIX-011 - Restore Mathematics MTH 399/MTH 404 content and citations

- **Defect:** both CCMAS Mathematics course records lacked content summaries although NUC provides the content. NUC does not provide explicit learning-outcome lists for these courses, so their empty outcome arrays are retained.
- **Correction:** added concise source-faithful content descriptions plus the official NUC URL, printed-page locator and access date to MTH 399 (industrial attachment) and MTH 404 (mathematics research project). No outcomes were invented.
- **Source:** NUC, [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), Mathematics course structure printed pp. 429-430; MTH 399 content p. 441 and MTH 404 content p. 442 (accessed 2026-09-26).
- **Files:** `ccmas/sciences.json`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB curriculum scopes.
- **Verification:** regression checks source fields/content are present and outcome arrays remain empty.

## FIX-012 - Preserve CCMAS course metadata in generated selected scopes

- **Defect:** the scope materializer copied selected course codes, titles, content, outcomes and citations but dropped the source course's units, status, lecture hours and practical hours. This made the JAMB curriculum contract materially less informative than the CCMAS source and prevented downstream consumers/auditors from checking workload and course status from the selected record.
- **Correction:** generated selected-course objects now carry `units`, `status`, `lecture_hours` and `practical_hours` directly from their exact source course. Missing source values remain null; the builder does not infer or fill them. A regression compares all selected Computer Science and Economics rows against their exact local CCMAS source objects.
- **Files:** `_build_jamb_curriculum_scopes.py`, regenerated `_audit/jamb_curriculum_scopes_2026-08-17.json`, `_audit/test_jamb_manual_scope_review_holds.py`.
- **Verification:** scope builder completed; focused suite is rerunning after correcting the regression fixture's source-root path. This fixes metadata propagation, not missing source data or evidence elsewhere in the 420-row catalogue.

## FIX-013 - Repair Cybersecurity course extraction contamination

- **Defect:** local CYB 201 repeated its first learning outcome as a seventh outcome. CYB 498 mixed its four genuine project-II outcomes with 27 unrelated mathematics, statistics and computing outcomes, and its content summary was a cross-course code/list fragment rather than CYB 498's project content.
- **Correction:** retained the six CYB 201 source outcomes once each; replaced CYB 498's contaminated outcome list with its four project outcomes and restored a concise faithful summary of the source's continuation-of-project-II content. Added item-specific official NUC URL, printed-page locator and access date to both rows. The broader Cybersecurity selected scope and its other missing course summaries remain open; this does not close JAMB row 107.
- **Source:** NUC, [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), Cybersecurity CYB 201 pp. 69-70 and CYB 498 pp. 85-86 (accessed 2026-09-26).
- **Files:** `ccmas/computing.json`, `_audit/repair_cybersecurity_course_extraction_2026_09_26.py`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB scopes.
- **Verification:** scope builder rerun. The focused materializer/manual-override/scope-hold suite passes (27 tests). The full Cybersecurity package still has 38/39 missing content summaries; row 107's current selected set is 9 courses, and its partial-scope adequacy and row-specific offering evidence remain open.

## FIX-014 - Restore Physiotherapy PST 421 source record

- **Defect:** the parsed PST 421 course row included a CCMAS page header in its content, ended the final learning outcome mid-sentence, and omitted its 2-unit/30-lecture-hour load.
- **Correction:** restored the complete six outcomes and source-faithful content summary, exact 2-unit/30-hour metadata, and item-specific NUC citation. The source course is Neurological Physiotherapy-I; no separate course claim or outcome was inferred.
- **Source:** NUC, [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), Physiotherapy course table printed p. 588 and PST 421 outcomes/content pp. 619-620 (accessed 2026-09-26).
- **Files:** `ccmas/allied_health.json`, `_audit/repair_physiotherapy_pst421_extraction_2026_09_26.py`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB scopes.
- **Verification:** regression checks the full source record, header removal and citation. Scope rebuild and focused tests pending.

## FIX-015 - Remove Physiotherapy PST 423 page-header spill

- **Defect:** the PST 423 seminar content began with the preceding CCMAS page header (“Allied Health Sciences 619 New”), and its official practical-hours load was not represented locally.
- **Correction:** removed only the header fragment, restored the faithful seminar-content summary and the source's 1-unit/core/45-practical-hour load; added an item-specific NUC locator/date.
- **Source:** NUC, [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), course structure printed p. 588 and PST 423 content printed p. 619 (accessed 2026-09-26).
- **Files:** `ccmas/allied_health.json`, `_audit/repair_physiotherapy_pst423_extraction_2026_09_26.py`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB scopes.
- **Verification:** regression checks header removal, source content/load and locator; scope rebuild and focused tests pending.

## FIX-016 - Repair Film Production FIP 211 extraction

- **Defect:** FIP 211 repeated all three official outcomes in a second malformed list and began its content with the `Arts 255` page header.
- **Correction:** retained the three NUC outcomes once each, restored the project content and the 2-unit/90-practical-hour load, and added item-specific citation fields.
- **Source:** NUC, [Arts CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), Film Production course structure printed p. 244 and FIP 211 outcomes/content pp. 254-255 (accessed 2026-09-26).
- **Files:** `ccmas/arts.json`, `_audit/repair_film_fip211_extraction_2026_09_26.py`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB scopes.
- **Verification:** regression checks outcome uniqueness, page-header removal, source load and locator; scope rebuild and focused tests pending.

## FIX-017 - Remove Speech-Language Therapy PST 503 from Physiotherapy

- **Defect:** the Physiotherapy CCMAS package contained `PST 503 Rehabilitation and Functional Training`, but the NUC source places this exact row in the Speech-Language Therapy section. Its hearing-device/implant outcomes and content are not Physiotherapy course evidence. This is a package-boundary error, not a global deletion of the course identity.
- **Correction:** removed the exact `(PST 503, Rehabilitation and Functional Training)` row from Physiotherapy only. No Speech-Language package row was invented or moved; the source-owned course remains represented only where the local source package has it.
- **Source:** NUC, [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), Speech-Language Therapy course table/outcomes/content, printed pp. 738 and 764-765 (accessed 2026-09-26). The Physiotherapy table at printed pp. 588-589 does not list PST 503.
- **Files:** `ccmas/allied_health.json`, `_audit/repair_physiotherapy_pst503_ownership_2026_09_26.py`, `_audit/test_jamb_ccmas_materializer.py`, and regenerated JAMB scopes.
- **Verification:** regression asserts Physiotherapy no longer contains PST 503; source-boundary review remains open for other repeated codes.

## FIX-018 - Anchor French to the Arts CCMAS package

- **Defect:** `French` was classified as a custom/external-only curriculum and
  promoted a 59-row enrichment list, even though the local NUC Arts CCMAS
  contains the exact `Modern European Languages B.A (French)` package with 40
  source courses. The old mapping therefore bypassed the available CCMAS
  anchor and supplied no item-level external citations for the 59 rows.
- **Correction:** changed the JAMB mapping to Arts / code `FRE`, added a
  manual full-package CCMAS scope for all 40 exact source courses, and kept
  the legacy external list out of the student curriculum until it is compared
  course-by-course and given item-specific evidence. No external row was
  silently merged into the CCMAS package and no domain links were promoted.
- **Source:** NUC, [Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), Modern European Languages B.A (French) package and French course/outcome section, printed pp. 22 and 437-464 (accessed 2026-09-26).
- **Files:** `programme_mapping.json`, `_build_jamb_curriculum_scopes.py`,
  `jamb_ccmas_manual_scope_overrides_2026-09-25.json`, regenerated canonical
  and scope inventories, and the French reconciliation checkpoint.
- **Verification:** scope materializer now emits 40 Arts CCMAS courses for
  French, marks the scope `full_scope_review_required`, and the joined
  external/unanchored inventory drops from 8 to 7 because French is no longer
  custom-only. Offering-context verification and downstream reassessment
  remain open.

## FIX-019 - Remove 41 unambiguous CCMAS page-header spills

- **Defect:** 47 candidate course records contained a document page header such
  as `Allied Health Sciences 67 New` or `Arts 89 New` inside the extracted
  course content. Six records also contained adjacent equipment or next-course
  text, so they were not safe to repair from the marker alone.
- **Correction:** removed only the header marker from 41 source rows where the
  course boundary was unambiguous, added the official NUC source URL, a
  course-specific cleanup locator and access date, and left the six compound
  candidates in the evidence queue. The duplicate-code `RUS 361` repair was
  limited to the exact `Oral Expression and comprehension in Russian` row.
- **Source:** the relevant official NUC CCMAS PDFs expose the same headers as
  document navigation text, including [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf),
  [Arts CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf),
  [Basic Medical Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf),
  and [Education CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Education-CCMAS-2023-New.pdf), accessed 2026-09-26.
- **Files:** the four CCMAS source JSON files,
  `_audit/repair_ccmas_page_header_spill_2026_09_26.py`,
  `_audit/ccmas_page_header_spill_repair_2026-09-26.json`, and regenerated
  anomaly inventory.
- **Verification:** the catalogue-wide page-header candidate count fell from
  47 to 6. The remaining six are `DTH 527`, `OCT 525`, `OPT 203`, `OPT 698`,
  `POT 317`, and `CHM 107`; they remain open because their marker is adjacent
  to equipment or another course block.

## FIX-020 - Remove CAM 424 equipment spill from learning outcomes

- **Defect:** `CAM 424 Project` retained two genuine source learning outcomes,
  then incorrectly continued with the Minimum Academic Standards equipment
  list. That caused `Microscopes` to appear twice as if it were a learning
  outcome.
- **Correction:** retained only the two official project outcomes and removed
  the equipment-list spill from `skills_learned`. The equipment remains
  source context in the NUC document, not a student learning outcome.
- **Source:** NUC, [Allied Health Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), CAM 424, printed p. 101 (accessed 2026-09-26).
- **Verification:** the duplicate-outcome candidate count fell from 8 to 7;
  regression confirms CAM 424 has exactly two outcomes and no `Microscopes`
  outcome.

## FIX-021 - Resolve Computing cross-reference spill in DTS 498 and CSC 432

- **Defect:** `DTS 498` and `CSC 432` course summaries began with `[SEE CS …]`
  cross-reference text and truncated/mixed adjacent course material. The
  cross-reference is valid in the source document, but it must not become the
  selected course's own content.
- **Correction:** replaced each contaminated summary with a concise,
  source-faithful summary from its own official course block. Existing
  learning-outcome arrays were retained; no cross-referenced course was
  silently copied into either record. Added item-specific NUC URL, locator and
  access date.
- **Source:** NUC, [Computing CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), DTS 498 printed pp. 115–116 and CSC 432 printed pp. 143–144 (accessed 2026-09-26).
- **Verification:** unresolved cross-reference candidate count fell from 2 to
  0; regression confirms neither course publishes the `[SEE CS` marker.

## FIX-022 - Normalize CCMAS replacement-character extraction artifacts

- **Defect:** 1,129 strings across the 17 CCMAS JSON files contained the
  Unicode replacement character (`U+FFFD`), making source text visibly
  corrupted and causing 268 course-level extraction candidates.
- **Correction:** replaced only that encoding artifact with a neutral en dash
  across all JSON string values. This does not claim to recover the original
  punctuation and does not change curriculum wording, outcomes, or row
  ownership.
- **Verification:** the catalogue-wide extraction audit now reports zero
  replacement-character candidates and zero unresolved cross-reference
  candidates. The repair checkpoint records the two idempotent passes and the
  remaining open anomaly categories.

## FIX-023 - Preserve a complete JAMB skills-profile index without fabricating unresolved rows

- **Defect:** regenerating the JAMB skills nuance artifact silently omitted
  `Environmental Science and Technology` because its mapping has no resolved
  CCMAS or custom component. That reduced the profile index to 419 names and
  made an unresolved source row look absent.
- **Correction:** removed French from the legacy custom-enrichment input after
  its exact Arts CCMAS anchor was established, and changed the aggregator to
  retain unresolved JAMB names as explicit `review_required` rows with empty
  profiles and an `unresolved_components` field. No skills were invented and
  no row was promoted.
- **Verification:** the regenerated artifact contains all 420 canonical JAMB
  names; the unresolved Environmental Science and Technology row is retained
  with zero skills and an explicit review state. The inheritance audit now
  reports zero stale JAMB-skill names and zero stored component mismatches.

## FIX-024 - Remove the confirmed duplicate Sociology institution token

- **Defect:** the Social/Management Sciences Sociology offering row contained
  `UDU` twice in its institution array.
- **Correction:** removed only the second duplicate token and retained the
  single source-supported `UDU` association. No institution was added or
  inferred.
- **Verification:** the repair checkpoint records the official JAMB source
  window and the regression test confirms exactly one `UDU` token remains.

## FIX-025 - Preserve confirmed Sciences brochure source aliases and locators

- **Defect:** two valid JAMB Sciences offering rows were vulnerable to being
  treated as missing because one source cell contains the typo
  `ENVRIONMENTAL`, and another title crosses an extracted page break.
- **Correction:** retained the canonical display names and institutions, while
  recording the source-original alias/title, exact extracted source window,
  official brochure URL, access date, and a confirmed source-context status.
- **Verification:** regression tests confirm the Environmental Science and
  Technology/WESLEYUNI and Information and Media Technology/MINNA records keep
  their distinct source contexts.

## FIX-026 - Repair six source-confirmed CCMAS boundary spills and VEX 599 duplication

- **Defect:** authoritative NUC adjudication confirmed six remaining page-header
  records also contained equipment or next-course text; `VEX 599` repeated its
  three outcomes twice.
- **Correction:** removed only the confirmed post-course boundary text,
  trimmed the three verified next-course outcome tails for OPT 203, POT 317 and
  CHM 107, and retained one copy of each VEX 599 outcome. Each repaired record
  now carries its official NUC URL, printed locator and access date.
- **Verification:** the focused regression test confirms the boundary markers
  and equipment spill are absent, the intended outcome counts remain, and VEX
  599 has three distinct outcomes. LIS/SED/FAA reconstruction remains a
  separate open repair because those records contain deeper course-boundary
  joins.

## FIX-027 - Reconstruct Education LIS and SED course boundaries

- **Defect:** Education `LIS 215`, `LIS 216`, `LIS 222`, and `SED 101` contained
  neighbouring-course outcomes, truncated titles, or empty content summaries.
- **Correction:** rebuilt each row from its own official Education CCMAS course
  block; restored the source-faithful titles, outcomes, content summaries,
  locators, URLs and access date. `SED 101` retains both official title
  renderings as audit metadata and uses the course-content heading as its
  canonical title. The separate Social Sciences LIS records were not merged.
- **Verification:** `test_ccmas_education_lane_b_2026_09_26.py` passes; the
  source-phase checkpoint records the exact printed-page boundaries.

## FIX-028 - Preserve the source-authored FAA 451/FAA 442 combined block

- **Defect:** Environmental Sciences `FAA 451` included unrelated `FAE 311`
  and `FAE 321` outcomes, while the NUC source itself printed a combined
  `FAA 451`/`FAA 442` Draughtsmanship heading.
- **Correction:** retained the four exact Draughtsmanship outcomes, removed
  only the confirmed FAE contamination, and preserved `FAA 442` as an explicit
  source alias/combined-header state rather than guessing a split.
- **Verification:** focused FAA repair checker and regression tests pass.

## FIX-029 - Source-phase repair checkpoint and remaining evidence boundary

- **Status:** confirmed bounded repairs are applied and locally verified. The
  420-JAMB occurrence audit still contains evidence-state holds and candidate
  source-cell queues; those are not treated as unavailable or source-backed
  until individually verified. No derived JAMB/CCMAS scope, domain, subgroup,
  role, seed, SQL or UI artifact is promoted by this checkpoint.

## FIX-030 - Preserve both CCMAS components for CS-and-Mathematics identities

- **Defect:** `COMPUTER SCIENCE AND MATHEMATICS` and
  `COMPUTER SCIENCE WITH MATHEMATICS` were previously represented by a partial
  Computer Science scope with only a few mathematics courses, which could be
  misread as the complete Mathematics component.
- **Correction:** added explicit manual scope overrides and secondary component
  coverage for both identities. Each now carries the full reference union of
  `Computing::Computer Science` and `Sciences::Mathematics`, with separate NUC
  evidence, JAMB context, and an explicit `combined_scope_review_required`
  state. No domain links were promoted because the combined course/outcome
  reconciliation is still pending.
- **Verification:** the regenerated scope artifact reports both components,
  77 selected reference courses, zero unrepresented facets, and zero domain
  links for each identity. The JAMB nuance profile was regenerated so its
  stored component arrays also contain both components; the inheritance audit
  now reports zero blend-component mismatches and zero stored-component
  mismatches. The manual-scope/review-hold and source-repair suite passes (23
  tests). This is a source-phase correction, not downstream completion.

## FIX-031 - Reconcile Finance FIN 102 and Procurement PRM 408 against NUC tables

- **Defects:** the parsed Finance package contained `FIN 102` with the same
  3-unit/45-hour load as `FIN 101`, but the authoritative Finance course table
  lists `FIN 101` and then proceeds to 200 Level without any `FIN 102` row.
  Procurement `PRM 408` was incorrectly blanked even though its global course
  table supplies the title and 2-unit/30-hour load.
- **Corrections:** removed only the unsupported FIN 102 course row and recorded
  the source-boundary decision in the document flags. Restored PRM 408's exact
  table title/load and source URL, printed-page locator and access date. Its
  learning outcomes and content summary remain empty because the NUC course
  detail sequence does not supply a PRM 408 block; no syllabus was inferred.
- **Source:** NUC, [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), Finance global course structure printed p. 235; Procurement Management 400-Level course table printed p. 464 and following course-detail sequence.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py` checks
  that FIN 101 remains and FIN 102 is absent, and that PRM 408 has only
  source-supported table fields and no fabricated outcomes/content (3 tests
  after FIX-032 was added).

## FIX-032 - Add item-specific NUC citation to table-only Social Sciences LIS 228

- **Defect:** Social Sciences CCMAS already retained LIS 228 as a table-only
  course with the correct title/load and no invented outcomes, but its record
  lacked the direct NUC URL, exact printed-page/table locator, and access date.
- **Correction:** added the official Social Sciences CCMAS PDF URL, printed
  p. 139 200-Level LIS table locator, and access date. Preserved the
  `table_only` state and empty outcomes/content because the source has no
  corresponding detailed LIS 228 block.
- **Source:** NUC, [Social Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), printed p. 139, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py` now
  asserts the course identity/load, citation, and absence of fabricated content.

## FIX-033 - Restore source-present Data Science DTS 322 course contents

- **Defect:** the NUC Computing CCMAS original-source review confirms that the
  detailed `DST 322` course block exists, but the parsed Data Science record
  retained its outcomes while omitting the course-content summary.
- **Correction:** added a concise, source-faithful content summary covering
  innovation, product development, IT entrepreneurship, business planning and
  strategy, market research, ethics/legal issues, and technical presentations.
  Preserved the table's canonical `DTS 322` identity and the detail-heading
  discrepancy in the existing audit flag.
- **Source:** NUC, [Computing CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), Data Science table printed p. 96 and detailed `DST 322` contents printed p. 112, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py` checks
  the summary and its item-specific citation, locator and access date.

## FIX-034 - Canonicalize Information Systems foundation-course loads to its global table

- **Defect:** the NUC Computing CCMAS Information Systems global course
  structure (printed p. 149) lists MTH 101, MTH 102 and PHY 101 as 2 units
  with 30 lecture hours. The following detailed course blocks (printed pp.
  152-153) conflict: MTH 101/102 say 45 lecture hours, while PHY 101 says
  3 units/45 lecture hours. The extracted local records had followed only the
  detailed blocks, obscuring the table discrepancy.
- **Correction:** retained the programme's global course structure as the
  canonical load for these records (2 units/LH 30, no practical hours) and
  added item-specific source locators, URL and access date. Each row now
  explicitly preserves the conflicting detailed-block evidence in its audit
  flag; no learning outcomes or course contents were changed.
- **Source:** NUC, [Computing CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), Information Systems global course structure printed p. 149 and detailed blocks printed pp. 152-153, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  asserts the canonical loads and retained conflict flags for all three rows.

## FIX-035 - Restore source-present PPE philosophy course evidence and separate table-only row

- **Defect:** the PPE PHL 301, PHL 302, and PHL 305 records were incorrectly
  marked `source_missing` with empty outcomes/content despite exact detailed
  blocks in the NUC Social Sciences CCMAS. PHL 306 was also labelled
  `source_missing`, although its table identity/load is present; its detailed
  course block was not located.
- **Correction:** restored source-grounded outcomes and concise contents for
  PHL 301, PHL 302, and PHL 305 with item-specific NUC locators/access date.
  Preserved the source's PHL 205/PHL 303 cross-reference anomalies as audit
  flags rather than presenting the mismatched codes to students. Classified
  PHL 306 as `table_only`, retaining its verified table identity/load and
  blank outcomes/content instead of inventing a syllabus.
- **Source:** NUC, [Social Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), PPE table printed p. 226; PHL 301 pp. 239-240; PHL 302 and PHL 305 p. 240; accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  checks restored content/outcomes, retained source cross-reference notes, and
  the table-only boundary for PHL 306.

## FIX-036 - Restore Information Systems foundation-course contents

- **Defect:** the Information Systems MTH 101, MTH 102 and PHY 101 records had
  source-backed learning outcomes and course-load conflict notes, but their
  student-readable course-content summaries were absent.
- **Correction:** added concise summaries from the exact NUC Information
  Systems course-content blocks. Kept the global-table course loads and the
  detailed-block discrepancies unchanged; the source's separate load conflict
  remains visible in each audit flag and locator.
- **Source:** NUC, [Computing CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), Information Systems global table printed p. 149 and detailed course blocks printed pp. 152-153, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  checks item-specific content themes, citations, and unchanged load-conflict
  flags.

## FIX-037 - Restore duplicated Law CCMAS ENT 211 evidence and clean parser debris

- **Defect:** both Law and Common & Islamic Law `ENT 211` rows had placeholder
  course-content summaries. Their extracted learning outcomes duplicated
  statements and included a pasted audit note as though it were a student
  outcome.
- **Correction:** restored concise source-backed summaries and the eight
  intended outcomes for both course instances. Kept the existing separate load
  resolution; the source's stray trailing letter is not shown as a learner
  outcome.
- **Source:** NUC, [Law CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf), ENT 211 details printed pp. 33-34 and repeated for Common & Islamic Law on pp. 63-64, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  checks both programme-context rows for clean outcomes, summaries and exact
  source locators.

## FIX-038 - Restore five source-present Common & Islamic Law course records

- **Defect:** `ICL 301`, `JIL 501`, `JIL 502`, `PPL 501` and `PPL 502` had
  placeholder content summaries. The extracted outcomes also included generic
  unsupported skill labels, duplicate JIL/PPL outcomes, and quote/parser debris.
- **Correction:** restored concise course-content summaries and normalized
  outcomes from each exact NUC course block. Preserved the ICL 301 dropped-code
  prefix flag, the JIL table/detail lecture-hour conflict, and the already
  resolved PPL table discrepancy; no course load was inferred or changed.
- **Source:** NUC, [Law CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Law-ALL.pdf), ICL 301 printed pp. 72-73; JIL 501 printed pp. 78-79; JIL 502 and PPL 501-502 printed pp. 79-80, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  checks each exact source citation, clean outcome count, and preservation of
  the documented course-load conflicts.

## FIX-039 - Correct Software Engineering COS 102 and COS 409 source records

- **Defect:** both Software Engineering rows lacked course-content summaries.
  COS 102 and COS 409 also have differences between their programme global-table
  loads and their detailed blocks. COS 409's extracted outcome list did not
  match the exact Software Engineering detail section.
- **Correction:** restored both summaries and normalized each outcome list from
  the Software Engineering-specific course blocks. Retained the table values
  (COS 102: 3 units/30 LH/45 PH; COS 409: 3 units/30 LH/0 PH) as primary and
  added explicit flags for each detailed-block conflict; no source version was
  silently discarded.
- **Source:** NUC, [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), Software Engineering tables printed pp. 203-204 and course blocks pp. 209-210, 221-222, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  checks both source locators, six outcomes per course and preserved global /
  detailed load conflicts.

## FIX-040 - Restore LIS 322 content without hiding the CCMAS code conflict

- **Defect:** the Library and Information Science global table lists `LIS 322`
  at 2 units/30 lecture hours, but the detailed block for the identical title
  “Hardware and Software Technologies” is headed `LIS 225`. The table-backed
  row had no content summary, and silently borrowing the detailed block would
  conceal a source identity conflict.
- **Correction:** retained the table's `LIS 322` identity and load, restored
  the matching-title content and outcomes from the detailed block, and kept
  the record explicitly `source_conflict` with both printed locators. This
  supplies the available curriculum evidence without asserting the conflicting
  course codes are interchangeable.
- **Source:** NUC, [Social Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf), LIS global table printed p. 141 and detailed block printed pp. 149-150, accessed 2026-09-28.
- **Verification:** `test_ccmas_fin_prm_table_adjudication_2026_09_28.py`
  asserts the retained table identity/load, detail-code conflict, item-specific
  URL/locators, summary and outcomes.
