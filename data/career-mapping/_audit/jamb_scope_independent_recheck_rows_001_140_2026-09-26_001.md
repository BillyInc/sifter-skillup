# Independent JAMB/CCMAS scope recheck — rows 001–140 — checkpoint 001

Audit-only append-only checkpoint, 2026-09-26. This supplements but does not
rewrite `jamb_combined_partial_scope_audit_rows_001_140_2026-09-26.md`.
No canonical mapping, curriculum scope, override, generator, seed, SQL or
application file was changed. Findings below are tied to one-based positions
in `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` and
should be matched to the exact identity before any repair.

## What was independently checked

1. Compared the 140 ordered scope rows with the 237 parsed NUC CCMAS programme
   packages under `data/career-mapping/ccmas/`, including selected course
   codes, titles, `content_summary` and `skills_learned` where present.
2. Compared partial-scope course selections with declared CCMAS components
   and the course-title anchors attached to each domain link.
3. Read the 2026-09-25 offering-context inventory's verification boundary:
   it records 440 parsed occurrences plus a manual-confirmation occurrence,
   while only three occurrences are marked PDF-verified. Parsed institution
   tokens are discovery leads, not proof that the named university offers the
   programme in that faculty/context.
4. Cross-checked key compound-title cases against the official JAMB brochure
   catalogue text and the corresponding NUC CCMAS package. Brochure index
   entries establish that a JAMB identity is listed; they do not alone verify
   an institution's offering row. CCMAS lists course titles/content/outcomes;
   a selection generated from those records still needs a reasoned scope
   decision and per-link review.

## Confirmed defects / explicit data contradictions

| Row | Finding | Why confirmed; what remains open |
|---:|---|---|
| 14 — Economics and Statistics | Scope is `combined_scope_review_required`, has declared Economics + Statistics components, but has zero selected courses and zero domain links. | This is a confirmed empty-scope defect, not proof that either curriculum is unavailable. Select bounded course/outcome sets from both CCMAS programmes; then derive links. JAMB catalogue presence does not verify the parsed awarder tokens. |
| 16 — Economics with/and Operations Research | Declares Economics + Industrial Mathematics, but has zero selected courses and links. | Confirmed empty-scope defect. Compare Operations Research-specific course titles and outcomes in the NUC packages; do not silently substitute Economics or all Industrial Mathematics courses. Exact JAMB wording and institution rows still need source-cell verification. |
| 17 — Peace and Development Studies | Declares Development Studies + Peace Studies and Conflict Resolution, but has no selected courses or domain links. | Confirmed empty-scope defect. Both named parts need evidence-backed scope; do not make a whole-package union automatically. |
| 26, 28–29, 31, 34–36, 38–43, 49, 52 (among others in this tranche) | Multiple named components are declared while the scope row remains empty/pending. | Each is an explicit unresolved curriculum contract, not a legitimate final “held” resolution. Use the existing row-specific inventory for identity/context distinctions; map only after courses/outcomes from each facet are reconciled. This checkpoint does not claim this list is exhaustive of all compound rows. |
| 77 — Insurance and Actuarial Science | The scope declares only `Administration and Management::Insurance`; 19 selected courses come from the Insurance component. A separate `Actuarial Science` CCMAS component exists in the same NUC package (35 courses), including statistical inference, calculus, financial mathematics, probability, survival models, actuarial risk/insurance pricing and actuarial applications. | **Confirmed missing named component.** Insurance INS/ACS selections include useful insurance and ratemaking material, but they do not represent the distinct Actuarial Science curriculum. The D014 Actuarial Science link cites seven course titles, some present in the Insurance slice; that does not establish the missing actuarial learning sequence or justify treating Insurance-only scope as complete. Reconcile the exact component union and retest D014 tier/descendants after scoped evidence. The JAMB Social Sciences brochure includes an “Insurance and Actuarial Science” catalogue/table heading, but the current offering inventory’s parsed school tokens are not proof of individual cells. |
| 87 — Accounting and Data Analytics | Sixteen Accounting selections; current scope has no dedicated data-analytics component. Accounting CCMAS is the source; the title “Data Analytics” is not itself course evidence. | Confirmed named-facet coverage gap in the saved scope. Audit the Accounting course contents/outcomes for actual data-analysis competencies; if inadequate, search for an authoritative external learning curriculum for only the uncovered facet. Domain D009/analytics and its descendants must not be confirmed by accounting/finance anchors alone. |
| 89 — Agribusiness and Economics | Scope declares/selects Economics only (25 courses); the NUC CCMAS corpus separately contains Agribusiness. | Confirmed missing-facet gap in the saved scope. Check whether the Economics package's outcomes genuinely cover agribusiness learning (not merely markets/economics); otherwise add bounded Agribusiness course evidence. Keep Economics links distinct from farm/agri-business learning and occupations. |
| 116 — Plant Science and Biotechnology | Scope selects the Biotechnology CCMAS component only; title's Plant Science facet has no declared Botany/Plant Science source component. | Confirmed named-facet gap in scope representation. Compare suitable Botany/Plant Science course outcomes with the exact JAMB identity before choosing a bounded component; do not infer plant-science competency from generic Biotechnology. |
| 129 — Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | Three JAMB names are bundled into one row and mapped to Statistics only; it includes MTH 101/102 (real mathematics evidence) but no Mathematics CCMAS component. | Confirmed alias/context conflation and incomplete component representation. The mathematics courses must not be described as absent, but two foundational courses do not establish the full Mathematics facet. Preserve each catalogue variant/context and reconcile the Mathematics + Statistics course evidence before shared mapping. |
| 135 — Mathematics with Computer Science | The selection is Computer Science CCMAS only, with MTH 101, MTH 102 and MTH 201 present in the package. | The three courses prove that mathematics is not absent. They do not, on their own, prove that the named Mathematics facet has been adequately represented by the full Mathematics CCMAS curriculum. Confirmed scope limitation; compare a bounded Mathematics course/outcome set and then re-evaluate any math/data/AI descendants. |

## High-priority candidates; evidence insufficient to call final defects

- Rows 1, 2, 4, 6–8, 11–13, 18–19, 22–25, 27, 30, 37, 44, 46–48,
  53–100 and 102–140 contain partial or full-parent contracts with possible
  omissions, extraction gaps or broad legacy links. The earlier row-by-row
  report records individual leads. A selected code/title is not evidence that
  its outcome was read; where the local `skills_learned` or source outcome is
  empty, use the original NUC PDF locator to recover/verify it before making
  a semantic claim.
- Rows 101, 108 and 109 have multiple JAMB faculty/source occurrences
  (Computer Science, Statistics, Software Engineering). Preserve contexts;
  do not count parser-derived institution tokens as verified offering rows.
- Rows 101–140 contain additional candidate blended-scope cases recorded in
  the earlier report, including Animal and Environmental Biology, Geology and
  Mining, Genetics and Biotechnology, and Plant Science/Biotechnology. A
  title word is a search lead only: the definitive component choice must be
  based on NUC course content/outcomes, and an outside source is appropriate
  only for the facet CCMAS does not adequately cover.
- Domain IDs and attached course-title anchors are not proof of semantic fit.
  For every non-empty route, verify that each cited course is in the accepted
  row scope, inspect its content/outcome, and test the claimed domain task and
  direct/functional/adjacent tier. Do not accept broad source labels or the
  existence of a matching title as sufficient. Subgroups and roles remain
  unresolved until their actual tasks and learner requirements are checked.

## Primary sources reviewed / source locator state

- JAMB, [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), catalogue/table text for Insurance and Actuarial Science; official JAMB search result also exposes the heading and table entries. Exact institution-cell geometry remains to be checked in the PDF for each occurrence before asserting an awarder.
- JAMB, [Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), printed catalogue p. 452 (including Mathematics with Computer Science and related programme names). The exact corresponding awarding-institution table still needs per-row verification.
- NUC, [Administration and Management CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf), local extracted source `data/career-mapping/ccmas/administration_management.json`. The local package contains separate programme objects `Insurance` and `Actuarial Science`; course-level content and outcomes distinguish insurance operations from actuarial mathematics/statistics/risk modelling. Record exact printed page locators for the course/outcome rows in the next checkpoint before any external promotion or final acceptance.
- NUC, [Sciences CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), local extracted source `data/career-mapping/ccmas/sciences.json`; and NUC, [Computing CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf), local source `data/career-mapping/ccmas/computing.json`. Used to verify the named component/course records for rows 116, 129, 135, and other Science/Computing leads. Per-course printed locators and outcome-level rationale are not yet closed in this tranche.

## Checkpoint boundary and next audit work

This is a supplemental independent check, not a final audit of 001–140. It
confirms some specific contradictions and strengthens the task queue, but does
not validate every source offering cell, every CCMAS course/outcome, every
domain tier, or any subgroup/role. Continue with exact PDF source-cell
verification, selected-course/outcome-level scope decisions for every partial
or combined row, and course-to-domain/task validation across all 140. Keep
confirmed defects separate from unresolved candidates and create another
append-only checkpoint rather than overwriting this one.
