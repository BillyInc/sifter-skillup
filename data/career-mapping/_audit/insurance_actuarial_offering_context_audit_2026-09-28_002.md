# Insurance and Actuarial Science offering-context audit — 2026-09-28, increment 002

## Scope and disposition

Audit-only continuation of the 2026-09-28 CCMAS crosswalk audit. I rechecked canonical JAMB identity 077, its live offering row and curriculum-scope row, the prior row-077 checkpoints, and the separate Social Sciences source occurrence. No ledgers, scopes, mappings, downstream links, or seeds were changed.

## Offering-cell reconciliation

**The Administration offering cell is not split between BAZE/IMSU and WESLEYUNI.** In the current JAMB Administration brochure, the single heading `INSURANCE AND ACTUARIAL SCIENCE` is followed by all three awarding-institution codes—BAZE, IMSU, and WESLEYUNI—in one cell (printed p. 77; extracted source `data/career-mapping/_jamb_txt/Administration.txt:1630-1634`). The current `administration_offerings.json` row 077 carries exactly those three codes and records this exact-cell locator. This agrees with the current official-source transcription and the independently indexed JAMB table cell.

There is a **separate JAMB Social Sciences identity**, `ACTUARIAL SCIENCE` (printed p. 580; `data/career-mapping/_jamb_txt/Social Management Science.txt:283-296`). Its own institution cell lists ABU, BENIN, CUST, DOU, FED-DUTSE, LASUSTECH, LAPAI, PC-UNI, and SALEM—not BAZE, IMSU, or WESLEYUNI. Do not join this standalone Social Sciences identity to row 077 merely because “Actuarial Science” appears in both titles. The apparent WESLEYUNI conflict is resolved by preserving these as separate faculty/title contexts; it is not evidence that WESLEYUNI is detached from the combined Administration cell.

The same JAMB source set also has a separate standalone Administration `ACTUARIAL SCIENCE` entry (the current ledger records its exact source locator `Administration.txt:746-753` and nine institutions). Thus the source evidence contains **three distinct occurrences**: Administration standalone Actuarial Science, Administration combined Insurance and Actuarial Science (row 077), and Social Sciences standalone Actuarial Science. The current offering files contain the two Administration rows, but a full scan of `data/career-mapping/jamb/*.json` finds no Social Sciences `Actuarial Science` occurrence. This is a **second confirmed inventory/context-preservation defect**: the Social Sciences source occurrence is absent from the dedicated parsed offering ledger and the canonical mapping exposes only the Administration faculty context. The authoritative Social Sciences source entry is captured below for a later ledger repair; this audit does not repair it.

The prior checkpoint's “not yet direct-PDF verified” wording in the current curriculum-scope row is stale. The offering row and offering-context inventory already record source verification dated 2026-09-26, exact locator `Administration.txt:1630-1634`, and the verified three-code cell. The scope row nevertheless repeats the old unverified wording in `source_context.jamb_locator`, `institution_codes_parsed_not_verified`, and its first JAMB `scope_evidence` locator/support statement. This is **one confirmed provenance-reconciliation defect** across three stale fields; no underlying institution-code mismatch is found.

## CCMAS component/curriculum check

Current scope row 077 declares both distinct components:

- `Administration and Management::Insurance`: all 32 course-code rows from the current Insurance CCMAS package.
- `Administration and Management::Actuarial Science`: all 35 course-code rows from the current Actuarial Science CCMAS package.

The existing focused crosswalk test compares each selected course by facet against the current package for exact course-code inventory, title, content summary, and learning outcomes, and verifies item-level NUC URL, locator, and access date. It passes: **3 test methods, 69 subtests**. No current component omission or local selected-course/package drift was detected. The official NUC CCMAS confirms that these are separately defined programmes: Actuarial Science global structure, printed pp. 54–56 (PDF pp. 53–55), and course contents/outcomes beginning printed p. 58; Insurance global structure, printed pp. 309–310 (PDF pp. 308–309), and its programme contents/outcomes section. For example, NUC ACS 101 is *Introduction to Actuarial Science* and explicitly covers actuarial work and its relationship to insurance (printed p. 58); the scope test checks all selected course records, not only this example.

The union is valid as the national CCMAS reference scope under the project's stated NUC-baseline method. It does not prove that every one of BAZE, IMSU, and WESLEYUNI teaches every course in both full CCMAS packages, particularly since CCMAS allows institution-specific design. No institution-level schedules were examined here; this is an uncertainty about institution-specific implementation, **not** a demonstrated defect and not a reason to omit either named curriculum component from the national reference scope.

## Findings and remaining gaps

- **Confirmed defects: 2** — (1) stale JAMB-source status/locator in row 077's curriculum-scope provenance (three outdated fields; current offering record is verified); (2) a distinct Social Sciences standalone Actuarial Science source occurrence is absent from the JAMB offering ledger/canonical source-context representation.
- **Confirmed CCMAS omissions or selected-record mismatches: 0** — both full components and their per-course title/content/outcome records match the current source packages under the focused test.
- **Offering-cell discrepancy: resolved** — the combined Administration row has BAZE + IMSU + WESLEYUNI together; Social Sciences has a distinct standalone Actuarial Science cell with a different institution list. The separate Social Sciences context itself remains an inventory defect until represented.
- **Uncertain item: 1** — institution-specific implementation of the entire national 70%-core reference union is not established by the JAMB awarding-institution table or NUC national CCMAS. This was not treated as a confirmed defect.
- **Deferred by instruction:** reassessment of row 077's domain links and downstream descendants. No such links were approved or rejected in this audit.

## Item-specific source evidence (accessed 2026-09-28)

1. **JAMB Degree Administration brochure** — <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf>, printed p. 77, Administration degree/awarding-institutions table, exact `INSURANCE AND ACTUARIAL SCIENCE` cell; local source extraction `Administration.txt:1630-1634`. Supports the combined identity's faculty and all three awarding codes in the same cell. The same brochure's standalone `ACTUARIAL SCIENCE` entry is at `Administration.txt:746-753` and is a distinct title occurrence. The IBASS browser text endpoint is a JavaScript shell; the locators are grounded in the repository's brochure transcription and corroborated against indexed table extraction, not an inferred name match.
2. **JAMB Social Sciences brochure** — <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf>, printed p. 580, exact standalone `ACTUARIAL SCIENCE` institution cell; local source extraction `Social Management Science.txt:283-296`. Supports a distinct title/faculty context and its nine listed institutions; WESLEYUNI is not in this cell. The parsed source context is missing from the current JAMB offering JSON files.
3. **NUC Administration and Management CCMAS** — <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf>, Actuarial Science course structure printed pp. 54–56 and contents/outcomes printed pp. 58 onward; Insurance course structure printed pp. 309–310 and contents/outcomes in the corresponding programme section. Supports two separate national curriculum components and their course-level evidence, not each university's local timetable.

## Regression test

`test_insurance_actuarial_offering_context_audit_2026_09_28_002.py` protects the distinct JAMB offering-cell identities and ensures the Administration row's three codes remain together while the separate Social Sciences Actuarial cell stays separate. It does not mutate product data.
