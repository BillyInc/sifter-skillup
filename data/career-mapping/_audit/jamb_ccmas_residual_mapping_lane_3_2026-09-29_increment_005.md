# Residual JAMB–CCMAS semantic mapping lane 3 — increment 005

Audit-only checkpoint. Canonical mappings were not edited. The 2,442 course-detail records were excluded; this lane classifies only semantic mapping exceptions from the current reconciliation.

## Scope and counts

- **domain catalogue mismatch total:** 494
- **domain catalogue source anchored candidate:** 306
- **domain catalogue confirmed unselected anchor repair:** 116
- **domain catalogue unresolved no scope anchor:** 72
- **domain catalogue unresolved scope anchor membership:** 0
- **unselected domain link occurrences:** 488
- **held mapping occurrences:** 129
- **held component scope present but held:** 9
- **held full ccmas inheritance without explicit scope:** 84
- **held empty scope:** 0
- **held other source review:** 36
- **held jamb ccmas scope review:** 19
- **held downstream mapping only:** 110
- **held both jamb ccmas and downstream:** 10
- **selected course not found occurrences:** 0
- **external component occurrences:** 0
- **external component distinct names:** 0

## Deterministic interpretation

- **306** catalogue-pair mismatches have selected course-title anchors. They are candidate links requiring semantic label review, not automatic deletions.
- **116** catalogue-pair mismatches also reference unselected course titles. These are confirmed anchor-repair candidates.
- **72** have no current item-specific course anchor and remain unresolved.

## Named combined/partial cases

### Accounting and Finance

- **Disposition:** `source_supported_current_combined_scope_but_domain_publication_still_held`
- Both Accounting and Finance/Banking and Finance are present in the current national reference scope; the old FIN-only interpretation is no longer the current component set.
- **Components:** Administration and Management::Accounting, Administration and Management::Finance / Banking and Finance
- **Evidence:**
  - `data/career-mapping/_audit/jamb_accounting_finance_source_context_reconciliation_2026-09-25.md` — JAMB Administration printed p. 48 (BCU); JAMB Social Sciences printed p. 576 (FEDOTUOKE); NUC Administration and Management CCMAS component sections; supports distinct source-faculty contexts and the separate CCMAS Accounting and Finance curricula. URLs: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf, https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf, https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf

### Insurance and Actuarial Science

- **Disposition:** `source_supported_components; offering_inventory_defect_unresolved`
- The current scope contains all 32 Insurance rows and all 35 Actuarial Science rows, matched against the correct component facets. A separate Social Sciences standalone Actuarial Science occurrence is still missing from the offering ledger.
- **Components:** Administration and Management::Insurance, Administration and Management::Actuarial Science
- **Evidence:**
  - `data/career-mapping/_audit/insurance_actuarial_ccmas_crosswalk_audit_2026-09-28_001.md` — NUC printed pp. 54-73 and 307-328; JAMB Administration Administration.txt:1630-1634; supports complete separate Insurance and Actuarial course inventories and field-level course evidence. URLs: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf, https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf
  - `data/career-mapping/_audit/insurance_actuarial_offering_context_audit_2026-09-28_002.md` — JAMB Social Sciences printed p. 580; Social Management Science.txt:283-296; supports a distinct standalone Social Sciences Actuarial Science source occurrence that must not be collapsed into the combined Administration title. URLs: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf

### COMPUTER SCIENCE WITH ECONOMICS

- **Disposition:** `partial_source_support; economics_component_and_offering_context_unresolved`
- The current component set includes Computer Science and Economics and active links are withheld. The Computer Science first ten course rows have been source-checked, but the Economics component and the exact JAMB offering context are not yet fully adjudicated.
- **Components:** Computing::Computer Science, Social Sciences::Economics
- **Evidence:**
  - `data/career-mapping/_audit/computer_science_economics_cs_courses_001_010_reconciliation_2026_09_29.md` — Computing CCMAS course rows GST 111 through COS 101; Economics component remains outside that ten-row check; supports Computer Science detail repairs and the existence of a separate Economics CCMAS component, not a complete combined scope. URLs: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf, https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf
  - `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/coordinator-correction-computer-science-economics-accounting-finance-2026-09-25.md` — JAMB Sciences printed p. 452 and Engineering/Environmental/Technology printed p. 336; supports distinct similar JAMB titles that must not be merged without offering-context evidence. URLs: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf, https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf

### Political Science / International Law and Diplomacy

- **Disposition:** `source_supported_bounded_components; scope_and_downstream_review_unresolved`
- The exact Babcock Social/Management Sciences offering is supported by JAMB, Babcock, and the Political Science/International Relations CCMAS components. The seven-course bounded scope is evidence for the named subject facets, not a full Law/LL.B curriculum; active links remain withheld.
- **Components:** Social Sciences::Political Science, Social Sciences::International Relations
- **Evidence:**
  - `data/career-mapping/_audit/jamb_ccmas_mapping_quality_2026-09-24/row034-political-science-international-law-diplomacy-evidence-checkpoint-2026-09-25.md` — JAMB Social Sciences printed p. 574; Babcock bulletin printed pp. 37-42; POL/IRS course and outcome anchors; supports both named facets and the boundary excluding a full Law::Law professional-practice curriculum. URLs: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf, https://legacy.babcock.edu.ng/assets/docs/academics/bulletin.pdf, https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf

### COMPUTER SCIENCE AND MATHEMATICS

- **Disposition:** `source_supported_combined_components; score_catalogue_pair_reconciliation_unresolved`
- The current scope explicitly includes both Computer Science and Mathematics, with 77 selected reference courses and no unrepresented named facet. D001/D003 have selected course anchors; their absence as exact pairs in the component score catalogue is a provenance disagreement, not evidence that Mathematics was omitted.
- **Components:** Computing::Computer Science, Sciences::Mathematics
- **Evidence:**
  - `data/career-mapping/_audit/jamb_cs_math_combined_scope_checkpoint_2026-09-26_001.md` — both JAMB Sciences identity rows; current scope count 77; selected Computer Science and Mathematics course facets; supports the combined curriculum union and zero unrepresented named facets. URLs: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf, https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf

## External and missing-course cases

The six custom/external names remain unresolved. Their JAMB identities may be present, but the current local reconciliation does not contain authoritative external curriculum evidence sufficient to establish selected courses and outcomes. They must not be marked unavailable solely because a CCMAS anchor is absent.

## Boundary

This checkpoint separates source-supported current component coverage from unresolved semantic or provenance work. It is not a canonical fix, seed regeneration, SQL deployment, or student-view approval.
