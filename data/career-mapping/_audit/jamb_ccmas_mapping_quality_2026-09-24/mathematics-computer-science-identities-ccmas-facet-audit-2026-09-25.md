# Mathematics + Computer Science JAMB identities — CCMAS facet audit

**Date:** 2026-09-25  
**Mode:** research/checkpoint only  
**Scope:** every canonical JAMB identity in `programme_mapping.json` whose name contains both a Mathematics and Computer/Computer Science facet, including the supplied spelling variants.

## Change boundary

No shared mapping/scope/canonical/derived/active JSON, seed, SQL, or role file was edited. This document is a research finding and proposal only. Identity order below is one-based order in `programme_mapping.json`.

## Method and sources

1. Searched all 420 canonical mapping identities for both `math*` and `computer*`, including spelling variants. Five identities matched.
2. Read each identity's checked-in parsed occurrence inventory, current scope, and canonical inheritance row. Institution tokens below are preserved as parsed, not silently normalized.
3. Compared the complete parsed **Computing::Computer Science**, **Sciences::Mathematics**, and **Sciences::Industrial Mathematics** course packages and relevant outcomes.
4. Checked the official JAMB [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf) and NUC CCMAS source PDFs for [Computing](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf) and [Sciences](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf). JAMB's current brochure names these as Sciences offerings. Its text extraction confirms programme labels, while the checked-in occurrence ledger retains the more specific institution groupings; those occurrence rows are not yet marked visually verified and lack exact page/table locators.

### Confidence categories

- **High:** direct match between the named JAMB facet and a distinct CCMAS component/course outcomes; omission/incidental coverage is clear in the checked-in artifacts.
- **Medium:** a plausible bounded facet is supported, but the exact JAMB variant or institutional curriculum context is not verified enough to assert a full combined curriculum.
- **Low / conditional:** the source name itself is abbreviated or ambiguous; do not infer its intended expansion or promote a component until the JAMB row and offering context are visually/source verified.

## Exhaustive identity and occurrence table

| Row | Canonical JAMB identity (source faculty) | Parsed JAMB occurrence and institutions | Current mapped component and selected scope | Named-facet finding and confidence |
|---:|---|---|---|---|
| 135 | **Mathematics with Computer Science** (Sciences) | Sciences brochure; `Sciences.pdf`, parsed row 41; `GOUU`, `MINNA`, `MAUTY`, `NOUN`, `PHC`. No exact PDF locator; row and institution cells not verified against the PDF. | Primary `Computing::Computer Science` (`COS`) only. Eleven selected courses: MTH 101, MTH 102, COS 101, MTH 201, COS 201, COS 202, IFT 212, SEN 201, CSC 322, CSC 401, CSC 402. | Mathematics appears only as selected courses inside the Computing package (MTH 101/102/201); there is no `Sciences::Mathematics` supporting component. **Mathematics facet is underrepresented — High.** Computer Science is named but only a partial 11-course slice of the 38-course component — **partial, not full curriculum; Medium.** |
| 146 | **Computer Science and Mathematics** (Sciences) | Sciences brochure; `Sciences.pdf`, parsed row 53; `ADSU`, `NOVENA`, `PHC`. No exact PDF locator; unverified institution cells. | Same Computing-only component and same 11-course list as row 135. Five current domain links: Software Engineering, AI, Cloud Computing, Blockchain, Robotics. | Mathematics again has no distinct Mathematics component; only three mathematical courses appear in the selected Computing slice. **Underrepresented — High.** The current AI/cloud/blockchain/robotics links are not established by the selected courses: the relevant dedicated courses (e.g. CSC 309 AI; cloud/distributed, blockchain, robotics/control courses) are absent. **Link-scope concern — High.** |
| 178 | **Computer Science with Mathematics** (Sciences) | Sciences brochure; `Sciences.pdf`, parsed row 99; `OAU`. No exact PDF locator; unverified institution cell. | Same Computing-only component and same 11-course list as rows 135/146. Same five current domain links as row 146. | Same missing distinct Mathematics component and partial mathematics treatment. **Underrepresented — High.** Existing AI/cloud/blockchain/robotics links are likewise not evidenced by the selected course slice. **Link-scope concern — High.** |
| 201 | **Industrial Mathematics and Computer Science** (Sciences) | Sciences brochure; `Sciences.pdf`, parsed row 133; `REDEEMERS`. No exact PDF locator; unverified institution cell. | Primary `Sciences::Industrial Mathematics` (`IMT`) only. Sixteen selected courses span Industrial Mathematics plus COS 101 and COS 201. | The Industrial Mathematics facet is substantively represented by MTH/IMT courses (including calculus, vectors, algebra, numerical analysis, operations research, mathematical computing, modelling and optimization). Computer Science is only incidental: introduction to computing + Programming I, with no Programming II, discrete structures, data structures, or algorithms in the selected scope. **Missing/underrepresented Computer Science facet — High.** A bounded supporting Computing facet is justified by the explicit JAMB title, but exact institution-specific curriculum is unverified — **component proposal High; exact breadth Medium.** |
| 205 | **Industral Mathematics/Computer** (Sciences; source spelling retained) | Sciences brochure; `Sciences.pdf`, parsed row 137; `EBSU`. No exact PDF locator; unverified institution cell. | Primary `Sciences::Industrial Mathematics` (`IMT`) only. Fifteen selected courses include mathematics/IMT, COS 101, COS 201 and IMT 303 Mathematical Computing. | Industrial Mathematics is substantive. Computing/Computer Science is represented only by introductory computing, Programming I, and Mathematical Computing. The label ends at “Computer” and may be a truncated or malformed programme title; do **not** assume it is identical to row 201 or expand it without checking the original JAMB table and source institution. **Computer-facet gap if intended as Computer Science — Medium; intended identity/expansion — Low/conditional.** |

`requirements_available_in_record` is false for rows 135, 178, 201 and 205 and true for row 146; this does not change the identity/facet analysis. All five occurrence records currently have empty `institution_codes_verified_from_pdf`, `offering_row_verified_against_pdf: false`, `pdf_table_locator: null`, and no recorded official URL/date.

## What the CCMAS evidence says

### Computing — Computer Science (`COS`)

The parsed NUC Computing component has 38 courses. Its outcomes establish more than general computer familiarity:

- `COS 101 Introduction to Computing Sciences`: computer components and use; introductory computing foundations.
- `COS 102 Problem Solving`: problem-solving process and algorithm development/properties.
- `COS 201 Computer Programming I`: programming paradigms, types/strings, and design/implementation of programs.
- `COS 202 Computer Programming II`: object-oriented solutions, program organization and APIs.
- `CSC 203 Discrete Structures`: logic, proof techniques and discrete mathematical structures.
- `CSC 301 Data Structures`: selecting and implementing data structures and algorithms.
- `CSC 401 Algorithms and Complexity Analysis`: algorithm analysis and asymptotic time/space complexity.
- Other Computer Science components include architecture (`IFT 212`), software engineering (`SEN 201`), operating systems, AI, networks, data management, ethics, research and project work.

The three conventional CS+Mathematics identities select only 11 of these 38 courses, leaving core courses such as COS 102, CSC 203, CSC 301, CSC 309 and other CS facets absent. This is a partial named-path slice and should not be described as the complete combined degree.

### Sciences — Mathematics (`MTH`) and Industrial Mathematics (`IMT`)

The standalone parsed Mathematics component has 39 courses. The mathematically meaningful candidate progression includes:

- Foundation: `MTH 101` algebra/trigonometry; `MTH 102` calculus; `MTH 103` vectors, geometry and dynamics; `STA 112` probability.
- Mathematical methods: `MTH 201`, `MTH 202` differential equations, `MTH 203` sets/logic/algebra, `MTH 204` and `MTH 205` linear algebra, `MTH 207` real analysis, `MTH 209` numerical analysis, `MTH 210` vector analysis.
- Applied mathematical extension: `MTH 308` mathematical modelling.

These course outcomes are directly mathematical, but JAMB's combined title does not authorize copying all 39 Mathematics courses into a combined programme. Use a bounded, foundational/applied subset and label it as a CCMAS-supported learning facet, not as a verified institution's full degree plan.

The 34-course Industrial Mathematics component provides specific applied mathematics evidence: `IMT 303 Mathematical Computing`, `IMT 306 Introduction to Operations Research`, `MTH 308 Introduction to Mathematical Modelling`, and `IMT 404 Optimization Theory`, in addition to foundational and advanced mathematics. These courses support the Industrial Mathematics side of rows 201/205; they do not replace the Computer Science course sequence.

## Bounded candidate course set and confidence

This is a candidate evidence set for later serialized review, not an applied patch and not a full curriculum. Course code/title/outcome should be matched to the exact CCMAS programme section before persistence; same code across Computing and Sciences can have title/outcome variations.

| Named facet | Candidate CCMAS codes | Why these candidates | Confidence / boundary |
|---|---|---|---|
| Computer Science core | `COS 101`, `COS 102`, `COS 201`, `COS 202`, `CSC 203`, `CSC 301`, `CSC 401` | Covers computing foundations, algorithmic problem solving, programming progression, discrete structures, data structures and algorithm analysis | **High** that this is a defensible *bounded CS core* from direct outcomes. Not a full 38-course CS curriculum. |
| Mathematics core for a combined CS–Math label | `MTH 101`, `MTH 102`, `MTH 103`, `MTH 201`, `MTH 202`, `MTH 203`, `MTH 204`, `MTH 209`, `STA 112` | Algebra/trigonometry, calculus, vector methods, mathematical methods, differential equations, logic/algebra, linear algebra, numerical methods, probability | **High** for the mathematical learning facet; **Medium** for exact breadth any named combined JAMB programme should inherit. Do not union all standalone Mathematics courses automatically. |
| Optional applied math extension | `MTH 210`, `MTH 308`; for Industrial Mathematics `IMT 303`, `IMT 306`, `IMT 404` | Vector analysis/modeling; mathematical computing, operations research and optimization outcomes | **High** as course-to-facet support; inclusion in any specific JAMB identity is **Medium** pending exact offering/course structure. |
| Current five-row applicability | Rows 135/146/178: add a distinct Mathematics facet candidate; rows 201/205: preserve Industrial Mathematics and assess a distinct Computing facet | Named JAMB title explicitly includes both fields in rows 135/146/178/201. Row 205 is ambiguous due source label truncation/spelling. | **High** for rows 135/146/178/201 omission; **Low/conditional** for interpreting row 205 as full Computer Science. |

## Consolidated findings / disposition

1. **Confirmed structural issue:** the five names are being mapped through only one primary component each. The ordinary CS–Mathematics identities all use Computer Science as their only component; the industrial variants use Industrial Mathematics alone.
2. **Confirmed facet omission:** for rows 135, 146 and 178, Mathematics is not represented as its own Sciences CCMAS component; it appears as a small handful of common MTH courses within the Computer Science package. For row 201, the Computer Science side is limited to COS 101/COS 201 in an otherwise substantial Industrial Mathematics slice. These are not equivalent to representing both named areas.
3. **Conditional omission:** row 205's “Computer” may imply Computer Science, but the canonical name is incomplete/misspelled. Keep this as an identity-resolution case until official table visual and institution context are checked.
4. **Current links need separate evidence review:** rows 146/178 expose AI, cloud, blockchain and robotics links despite selected course slices that omit those specific learning content. Treat these as unconfirmed candidates, not proven student routes. Row 201/205 AI and Actuarial Science links also need row-specific task/course outcome review; the generic link labels alone do not establish those routes.
5. **Occurrence preservation:** do not merge the five identities. Keep their distinct source faculty, parsed row, and institution sets even where course candidates overlap.

### Minimal future repair outline — NOT APPLIED

- Keep each canonical JAMB identity and offering occurrence distinct.
- For rows 135/146/178, retain Computer Science as primary and add a bounded Sciences::Mathematics supporting facet, sourced from Mathematics CCMAS courses/outcomes; audit existing student links against the selected courses.
- For row 201, retain Industrial Mathematics and add a bounded Computing::Computer Science supporting facet; do not replace IMT or union the full 38-course COS package.
- For row 205, first verify whether the original JAMB row truly intends “Industrial Mathematics and Computer Science.” Until confirmed, retain its distinct text/context and make no expansion assumption.
- Any later shared-artifact repair must preserve a before-snapshot, reconcile only the affected rows across mapping/scope/canonical/derived/active artifacts, and run focused cross-artifact invariants. No such repair is performed here.
