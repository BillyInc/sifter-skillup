# Insurance and Actuarial Science scope audit — 2026-09-25

## Identity and row-number reconciliation

The exact identity `Insurance and Actuarial Science` is row **77** in the
current one-based `programme_mapping.json` `mappings` order and row 77 in the
saved scope/canonical ledgers. Row 63 in that same order is `Finance`. This
checkpoint follows the named identity (the already catalogued row-77 issue)
and records the ordinal mismatch so it is not propagated.

## Current row state — read only

- `programme_mapping.json` maps this identity to the single CCMAS component
  `Administration and Management::Insurance` (`ccmas_code: INS`); no ACS
  supporting component is declared.
- `jamb_curriculum_scopes_2026-08-17.json` selects 19 courses, all attributed
  to source programme `Insurance`. Four selected entries have ACS-prefixed
  codes—ACS 207, 306, 308 and 402—because those courses also appear in the
  Insurance curriculum. Their titles/outcomes match across the two local
  parsed programme entries. This is not representation of the full Actuarial
  Science programme.
- Local parsed CCMAS data contains separate Insurance and Actuarial Science
  programmes. Among course-code-specialist rows, Insurance has 22 INS/ACS
  courses; the saved scope omits INS 201, INS 203 and INS 302. Actuarial Science
  has 25 ACS-coded courses; 21 distinct ACS courses are absent from the saved
  scope (the four cross-listed courses above are already present).
- The current canonical record still has one primary Insurance component, no
  supporting components, 19 scoped courses and 10 exposed links. The same
  links are present in the derived and active maps: D061 Insurance (direct),
  plus D063 Economics, D062 Trading, D014 Actuarial Science, D013 Investment
  Analysis, D158 Corporate Finance/Investment Banking, D028 General Management,
  D159 Credit Analysis/Structured Finance, D015 Accounting and D037 Legal
  Practice (functional).

## Source-quality defect that must be resolved before scope promotion

The current local parsed `ccmas/administration_management.json` Actuarial
Science course records do not consistently match the official NUC
Administration and Management CCMAS. Examples:

| Course code | Local parsed title | Official NUC CCMAS title |
|---|---|---|
| ACS 101 | Statistical Inference I | Introduction to Actuarial Science |
| ACS 102 | Statistical Inference II | Basic Mathematics for Actuarial Science |
| ACS 104 | Introduction to Actuarial Science | Elements of Actuarial Statistics |
| ACS 203 | Financial Mathematics I | Mathematical Statistics for Actuarial Science |
| ACS 204 | Financial Mathematics II | Probability Theory for Actuarial Science |
| ACS 301 | Survival Models I | Differential Equations for Actuarial Science |
| ACS 302 | Survival Models II | Life Contingencies |
| ACS 304 | Corporate Finance | Financial Mathematics for Actuaries |

Further sequence differences are present: local parsed ACS 303/309 entries do
not align with the official course table, which proceeds from ACS 302 to ACS
304 and includes ACS 310/311. The official overview and outcomes describe an
actuarial programme centered on quantitative risk, probability/statistics,
financial mathematics, insurance pricing, and risk management. For example,
official ACS 101 covers actuarial work, compound interest, life tables and
annuities; the local ACS 101 entry instead presents statistical-inference
outcomes.

Primary source: [NUC Administration and Management CCMAS (2026)](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Administration-and-Management.pdf).
Relevant locators: separate programme-code list at PDF text lines 820–842;
Actuarial overview at 2280–2313; actuarial course tables at 2396–2459 and
course outcomes starting at 2606; Insurance course table at 14143–14199.
The repository source is `data/career-mapping/ccmas/administration_management.json`
(`source_file: CCMAS_Administration_Management_COMPLETE.txt`).

## Disposition and proposed artifact correction (not applied)

**Confirmed coverage defect:** the saved row scope represents the Insurance
curriculum only; four shared/cross-listed ACS-prefixed courses do not establish
the separate Actuarial Science curriculum. The local Actuarial source also has
course-title/outcome mismatches against NUC, so its records must not yet be
blindly merged into the JAMB row.

Proposed sequence for the later row-local repair:

1. Correct/reconcile the ACS course-code, title and outcome records against the
   official NUC tables and learning-outcome sections; preserve the source
   locator and the separately defined INS/ACS programme ownership.
2. Rebuild this JAMB identity's partial scope with an explicit Insurance
   primary component and Actuarial Science supporting component, after
   confirming the intended composite curriculum for its JAMB offering context.
   At minimum, reassess all 22 INS/ACS specialist courses and all 25 ACS-coded
   specialist courses; retain identical cross-listed course/outcome records
   once while representing both programme provenances. The local Insurance
   omissions INS 201, INS 203 and INS 302 also require explicit include/exclude
   decisions from their NUC outcomes.
3. Re-evaluate the existing 10 domain links only after that corrected scope is
   source-backed. D061 Insurance remains supported by the named Insurance
   curriculum. D014 Actuarial Science is a high-priority candidate for direct
   review against the corrected dedicated ACS curriculum, but this checkpoint
   does not promote or retier it. Do not promote the other functional links by
   course-title keyword overlap alone.

No shared JAMB JSON, course JSON, map, role file, seed or SQL was edited. No
seed generation or mapping-link promotion was performed. This file is an
append-only audit/proposal checkpoint only.
