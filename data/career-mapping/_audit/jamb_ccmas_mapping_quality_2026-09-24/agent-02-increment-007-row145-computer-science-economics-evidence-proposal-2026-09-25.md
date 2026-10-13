# Increment 007 — Row 145 Computer Science with Economics

Date: 2026-09-25  
Lane: evidence checkpoint / proposed row-only patch  
Status: research only; no shared mapping, scope, canonical, derived, active-map, seed, SQL, or role file edited

## Decision summary

Row 145 is a confirmed **component-coverage gap**, not yet an approved domain-link change. The canonical identity is `COMPUTER SCIENCE WITH ECONOMICS`; its current mapping resolves only to Computing CCMAS Computer Science (`COS`). The saved curriculum scope has eight Computer Science courses and no Social Sciences Economics courses or outcomes. The JAMB name establishes that Economics is part of the named programme variant; it does not establish a full union with the entire 38-course CCMAS Economics degree curriculum, nor does it establish the exact curriculum of every listed institution.

Recommended next step: retain the eight Computer Science course rows as candidates, add a separately sourced Economics component candidate, and keep the row pending/unpublished until the JAMB occurrence and bounded course scope are reconciled. Do not promote any domain/path link as a consequence of this component correction.

## JAMB source occurrence, faculty, and institution context

- The checked-in JAMB Sciences offering occurrence is `COMPUTER SCIENCE WITH ECONOMICS`, under the Sciences source file, with institution names `CUAB`, `LCITY`, and `OAU` (`data/career-mapping/jamb/sciences_offerings.json`). These are the parsed source associations; they should not be presented as independently verified campus offerings until each institution/programme table row is confirmed against the original brochure.
- A distinct line in the official JAMB Engineering/Environmental/Technology brochure, printed p. 336, reads **“Computer Science with (Economics) (Mathematics)”** in a faculty/technology programme catalogue. That line is a catalogue occurrence, not a clean institution-specific offering table. It may encode variants or a different source context. It does not establish that the Engineering occurrence is the same row as Sciences row 145, that its institutions are CUAB/LCITY/OAU, or that Economics and Mathematics should both be unioned into row 145.
- The JAMB Sciences brochure also contains other labels such as “Computer and Economics”; those labels must not be silently normalized to this identity.
- OAU’s official computing handbook independently verifies that OAU offers a B.Sc. Computer Science with Economics and describes a distinct, genuinely combined programme. It lists 32 units of Economics courses alongside 62 units of Computer Science, 32 Computer Engineering units, Mathematics, foundation sciences, and other components. This is strong evidence for the OAU offering only; it cannot be generalized to CUAB, LCITY, or all JAMB occurrences. OAU’s official admissions page also lists Computer Science with Economics as a programme, but its institutional/faculty context should be recorded as OAU’s—not projected back onto all JAMB rows.

## Audit of the current eight-course scope

The current scope (`partial_scope_review_required`, `pending_review`) selects these Computing CCMAS Computer Science courses:

| Course | Title | What this row-level selection can support |
|---|---|---|
| COS 101 | Introduction to Computing Sciences | Introductory computing foundation candidate |
| COS 201 | Computer Programming I | Programming foundation candidate |
| COS 202 | Computer Programming II | Continuing programming candidate |
| IFT 212 | Computer Architecture and Organisation | Computer systems/architecture candidate |
| SEN 201 | Introduction to Software Engineering | Software engineering foundation candidate |
| CSC 322 | Computer Science Innovation and New Technologies | Innovation/new-technology course candidate; title alone does not prove a particular downstream specialization |
| CSC 401 | Algorithms and Complexity Analysis | Algorithms candidate |
| CSC 402 | Ethics and Legal Issues in Computer Science | Computing ethics/legal-issues candidate |

All eight are from the Computing::Computer Science CCMAS component and none supplies Economics evidence. The current title/content-anchor selection rule does not by itself demonstrate that these eight constitute a complete, validated Computer Science slice for this combined identity. Keep them as candidates pending course-outcome/source-locator review; do not call them the programme’s entire CS curriculum.

## Economics CCMAS evidence and bounded candidate scope

The official NUC Social Sciences CCMAS 2023 treats Economics as a programme area and explicitly says its curriculum is intended to accommodate single, joint, and combined studies. Its global Economics course structure includes both principles and supporting quantitative/statistical courses. Item-specific outcomes include:

- **ECO 101, Principles of Economics I:** scarcity, choice, demand and supply, elasticity, production, factor pricing, and market structures.
- **ECO 102, Principles of Economics II:** national-income accounting, circular flow, consumption, savings, investment, government revenue/expenditure, money, and foreign exchange.
- **ECO 201, Introduction to Microeconomics I:** individual/market demand and supply, elasticity, household choice, production, and costs.
- **ECO 203, Introduction to Macroeconomics I:** aggregate measures, macroeconomic goals, GDP, consumption, savings, and investment.
- **ECO 207, Mathematics for Economists:** mathematical formulation and interpretation of economic models.

These courses provide a defensible **candidate foundation** for checking the Economics facet. They are not proof that all five are prescribed at every institution, and are not a licence to attach all 38 Economics CCMAS courses to this JAMB row. OAU’s distinct handbook uses institution-specific course codes (ECN/SSC) and a broader course plan; do not assume one-to-one code equivalence with NUC ECO codes without a course concordance.

## Proposed row-only patch (not applied)

1. Preserve row 145’s JAMB Sciences identity and the currently recorded institution strings as *parsed source associations*, with institution-level verification flagged separately.
2. Add `Social Sciences::Economics (ECO)` as a **supporting candidate CCMAS component** alongside primary `Computing::Computer Science (COS)`. Do not map row 145 to the standalone Economics degree or merge every course in that degree.
3. Retain the eight selected COS rows as candidates, not as an approved complete course slice.
4. Build a bounded Economics candidate slice from course-level outcomes—starting with the official NUC Economics foundation/principles outcomes (ECO 101/102), then evaluate ECO 201/203 and quantitative ECO 207 against the exact JAMB/OAU source context. Record what the source supports and why each selected course is included; exclude courses without a demonstrated fit. Reconcile NUC ECO codes to any institution-specific course codes rather than equating them by name alone.
5. Keep scope and all domain/path relationships in review/unpublished status until (a) the Sciences-vs-Engineering source occurrences and institution associations are reconciled, (b) the selected course outcomes and locators are validated, and (c) each proposed path is independently supported. No new Economics, finance, data, software, or other domain link is promoted by this checkpoint.

## Sources

- JAMB, *Degree Sciences Brochure*: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf (parsed Sciences occurrence and institution names are retained locally; verify against the exact brochure table before final institution-level attribution).
- JAMB, *Degree Engineering/Environmental/Technology Brochure*, printed p. 336: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf (parenthesized catalogue line; not treated as an institution-specific row).
- NUC, *Social Sciences CCMAS 2023*: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf (Economics global structure and outcomes; printed pp. 93–104, especially ECO 101/102 and the 200-level course structure).
- OAU, *Undergraduate Handbook*, Computer Science with Economics course/degree requirements: https://cse.oauife.edu.ng/wp-content/uploads/2023/03/undergradute_handbook.pdf (specific OAU combined-programme evidence; 32 Economics units plus other named components).
- OAU, *Undergraduate Admissions*: https://oauife.edu.ng/admission-undergraduate-studies/ (official university programme/admissions context; institution-specific only).
- Local prior evidence: `agent-02-increment-003-rows-145-146-and-boundary.md`; `agent-02-increment-006-rows-141-280-authoritative-component-recheck-2026-09-25.md`.

## Explicit scope boundaries

- Do not edit shared JAMB mapping/scope/canonical/derived/active-map JSONs, seeds, SQL, or role records while coordinator integration is serialized.
- Do not infer that the Engineering brochure’s parenthesized label shares the Sciences row’s faculty, institution list, admission requirements, or curriculum.
- Do not assume the full Economics CCMAS course union or treat OAU’s institution-specific handbook as a national JAMB curriculum.
- Do not publish or promote downstream links from the programme title alone.
