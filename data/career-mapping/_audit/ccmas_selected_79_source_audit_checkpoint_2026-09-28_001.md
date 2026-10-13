# Selected CCMAS 79-package source audit — checkpoint 001

**Started:** 2026-09-28 (Africa/Lagos)  
**Status:** package-by-package audit in progress; Pharmacology (1/79) has a source comparison checkpoint. Physiotherapy structural comparison is underway in increment 001; it is not yet counted complete. This is not an overall audit closure claim.  
**Mode:** audit/findings only. No CCMAS source JSON, seeds, JAMB mappings, or downstream domain/subgroup/role records may be edited in this phase.

## Required coverage

The selected local files contain **79 CCMAS programme packages and 3,342 extracted course rows**. Counts below are the current local baseline; independent NUC source counts and course-by-course comparisons remain pending.

| Source file | Packages | Local course rows | Programme packages in audit scope |
|---|---:|---:|---|
| `allied_health.json` | 19 | 535 | Pharmacology; Physiotherapy; Audiology; Nursing Sciences; Complementary and Alternative Medicine; Dental Technology; Dental Therapy; Environmental Health Science; Health Care Administration and Hospital Management; Information Technology and Health Informatics; Health Information Management; Medical Laboratory Science; Human Nutrition and Dietetics; Occupational Therapy; Public Health; Optometry; Prosthetics and Orthotics; Radiography; Speech-Language Therapy |
| `architecture.json` | 6 | 142 | Architecture; Architectural Technology; Furniture Design; Interior Architecture and Design; Landscape Architecture; Naval Architecture |
| `basic_medical.json` | 2 | 88 | Human Anatomy; Physiology |
| `computing.json` | 7 | 267 | Computer Science; Cybersecurity; Data Science; Information and Communication Technology; Information Systems; Information Technology; Software Engineering |
| `medicine_dentistry.json` | 2 | 399 | Bachelor of Medicine and Bachelor of Surgery (MBBS/MBChB); Bachelor of Dental Surgery (BDS/BChD) |
| `pharmacy.json` | 2 | 189 | Bachelor of Pharmacy; Doctor of Pharmacy |
| `sciences.json` | 26 | 1,094 | Applied Geophysics; Biochemistry; Biology; Biotechnology; Botany; Brewing Science and Technology; Chemistry; Environmental Management and Toxicology; Forensic Science; Geology; Industrial Chemistry; Industrial Mathematics; Industrial Physics; Marine Science; Maritime Science; Mathematics; Medical Physics; Medicinal Chemistry; Meteorology; Microbiology; Petroleum Chemistry; Physics with Electronics; Physics; Science Laboratory Technology; Statistics; Zoology |
| `social_sciences.json` | 14 | 534 | Criminology and Security Studies; Demography and Social Statistics; Development Studies; Economics; International Relations; Library and Information Science; Peace Studies and Conflict Resolution; Petroleum Economics and Policy Studies; Political Science; Politics, Philosophy and Economics (PPE); Psychology; Social Standards; Social Work; Sociology |
| `veterinary.json` | 1 | 94 | Veterinary Medicine |
| **Total** | **79** | **3,342** | **All listed programme packages; no sampling substitution** |

## Authoritative source URLs

These are the exact primary NUC CCMAS PDFs registered in the existing bounded-audit runner. A URL in this list is a source starting point, not evidence that each course/package has been compared.

| File | NUC CCMAS PDF |
|---|---|
| `allied_health.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf> |
| `architecture.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Architecture-CCMAS-2023-FINAL.pdf> |
| `basic_medical.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Basic-Medical-Sciences-CCMAS-FINAL-December-26-2022.pdf> |
| `computing.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf> |
| `medicine_dentistry.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Medicine-and-Dentistry-CCMAS-2023-FINAL.pdf> |
| `pharmacy.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Pharmacy-and-Pharmaceutical-Sciences-CCMAS-2023-FINAL.pdf> |
| `sciences.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf> |
| `social_sciences.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf> |
| `veterinary.json` | <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Veterinary-Medicine-CCMAS-2023-FINAL.pdf> |

## Existing evidence read; do not repeat these adjudications blindly

Before starting this selected-package phase, the following current artifacts were read:

- `ccmas_bounded_catalogue_audit_aggregate_checkpoint_2026-09-26_001.md` and its per-range ledgers: structural candidate detection over all 237 packages, explicitly not source adjudication.
- `ccmas_extraction_anomaly_review_checkpoint_2026-09-26_001.md`, `ccmas_catalogue_anomaly_triage_checkpoint_2026-09-26_001.md`, and `ccmas_duplicate_code_queue_checkpoint_2026-09-26_001.md`: whole-catalogue candidate queues only.
- `ccmas_open_anomaly_adjudication_checkpoint_2026-09-26_002.md` and JSON ledger: targeted source adjudications, not full package audits.
- `ccmas_audit_interrupt_checkpoint_2026-09-26_001.md`, `ccmas_empty_summary_source_review_reconciliation_checkpoint_2026-09-26_001.md`, and `jamb_ccmas_local_fix_log_2026-09-26.md`: known source checks and repairs, with explicit unresolved scopes.
- `run_ccmas_bounded_catalogue_audit_2026_09_26.py`: authoritative URL registry and deterministic local structural scanner.

Known targeted records to carry forward as already reviewed (do not redo their same source query unless a full-package contradiction is found): Allied Health DTH 527, OCT 525, OPT 203, OPT 698, POT 317, CAM 424, Physiotherapy PST 421/PST 423/PST 503, Computing DTS 498/CSC 432 and prior selected-package scope fixes, Sciences source repairs logged in FIX-001 and related issue-specific ledgers, Social Sciences DSS 101–104/ENT 211/LIS 228 and other logged fixes, Veterinary VEX 599. The full FIX log and adjudication ledger govern exact boundaries. Previously source-checked rows still participate in package counts/reconciliation, but their closed micro-issue is not reopened without contrary evidence.

The earlier catalogue checkpoints report 17 files/237 packages/9,854 course rows; the latest empty-summary reconciliation documents subsequent repairs and a current total of 9,853 rows. Do not reuse the stale 9,854 baseline as current source truth. This selected nine-file subset currently totals 3,342 extracted rows.

## Audit protocol and progress accounting

For each package, compare source structure and every row's exact course identity/code, units, status, lecture/practical/other hours, outcomes, content, package ownership, duplicates/anomalies, and item-level provenance. Record the NUC URL, printed page/table or course-block locator, access date, observed source facts, local comparison, and outcome for each confirmed discrepancy or verified package section. Distinguish `confirmed_match`, `confirmed_defect`, `source_conflict`, and `not_yet_verified`; a local candidate or package header does not prove a defect. Verify each package's authoritative source course count before marking it complete.

Add checkpoints after bounded package increments, and focused regression tests for confirmed package/source discrepancies. No data mutation is authorized by this phase. No downstream mapping inspection is in scope. A package is complete only when its entire official structure and course detail have been compared—not merely because its anomalies appear in an earlier candidate scan.

### National baseline versus university implementation

NUC CCMAS is the adequate national curriculum baseline for national
curriculum/domain mapping. Do not block that baseline solely because the
university-specific/additional 30% implementation syllabus is unavailable.
Record national CCMAS evidence separately from provider-specific
implementation; consult authoritative external curriculum sources only where
CCMAS is absent or genuinely insufficient. When reconciling existing JAMB–CCMAS
scope holds, explicitly identify rows where missing 30%-specific evidence was
the sole caveat. JAMB title/faculty/awarder evidence remains distinct from
curriculum evidence and does not prove a provider's delivered syllabus.

**Current per-package source-audit completion: 1/79 source-compared in this phase** (Pharmacology; discrepancies remain documented, no data edits). Physiotherapy structural/ownership comparison is in progress at `ccmas_physiotherapy_source_audit_2026-09-28_001.md` and does not count toward completed packages until its detailed outcomes/content pass and package-count reconciliation are finished. Existing targeted course repairs are acknowledged above; they do not count as complete package audits. Continue with Physiotherapy, while avoiding repeats of closed micro-issues.

## National CCMAS baseline and offering-context rule (user clarification)

NUC CCMAS is the adequate national curriculum baseline for a JAMB-to-curriculum mapping. Do not hold that national curriculum relationship solely because an institution-specific syllabus or the institution-designed additional 30% is unavailable. Keep the national CCMAS course/outcome evidence distinct from any institution-specific implementation; use authoritative external curriculum sources only when CCMAS is absent or genuinely insufficient for the named programme facet.

This does not relax source verification of JAMB offerings. Continue capturing each exact JAMB programme title, faculty/source context, institution-awarder association, and distinct offering occurrence. Preserve identical programme names in separate faculty/institution contexts. JAMB brochure evidence establishes the offering/title-awarder association only; it does not prove the university's local course timetable or the extra 30%.

Initial review of the current scoped ledger and cited follow-up findings found **no row that can presently be certified as blocked only by the missing institution-specific 30%**. The rows that mention this distinction remain candidates for explicit re-review in the full JAMB–CCMAS adjudication; do not leave them held on that caveat alone:

- `Actuarial Science` and `Insurance and Actuarial Science` in `jamb_curriculum_scopes_2026-08-17.json`: their statuses/reasons also cite unresolved JAMB awarder-cell/context checks and/or course/domain review, so they are not 30%-only holds.
- Row 145, `Computer Science with Economics`, in `jamb_ccmas_curriculum_source_followup_rows_141_150_2026-09-26_001.md`: its exact JAMB table-cell/awarder context and non-misleading combined scope remain open in addition to the 70/30 note.
- Row 311, `Polymer and Textile Engineering`, in `jamb_ccmas_authoritative_followup_rows_281_420_2026-09-26_004.md`: the ABU-specific scope gap and the exact JAMB awarder/ABU association remain open; the missing local extra curriculum is not the national-baseline gate.
- `Physiology` (scope ledger) and row 302 `Yoruba` (follow-up rows 281–420): the former is already marked `partial_scope_reviewed`; the latter has an explicit incomplete CCMAS course selection. Neither is blocked merely by lack of institution-specific 30% data.

This is an initial indexed inventory, not a final assertion that no other historical note used the caveat. During the full source audit, search current row-level scope/findings and record every actual 30%-only hold as a separate, explicitly cleared disposition.
