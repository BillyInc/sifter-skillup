# Row 257 research checkpoint — Agronomy

**Date:** 2026-09-25  
**Lane:** research/checkpoint only  
**Identity:** row 257, one-based order in `programme_mapping.json`

## Change boundary

This is a separate evidence checkpoint and an unapplied proposal. No shared mapping, curriculum-scope, canonical, derived or active JAMB JSON, seed, SQL, or role data was edited.

## Confirmed findings

### Current row and scope

- Canonical JAMB identity: **Agronomy**; faculty: Agriculture.
- Current mapping: `B_granular` to **Agricultural Science::Crop Science** (`CPS`), with the note “agronomy ~ crop science -> Crop Science.” This is a defensible primary component, but the note does not establish a course scope.
- The current curriculum-scope row selects exactly one course: **`AGG 102 — Introduction to Agriculture I`**. The user's reference to `AGG 101` does not match the checked-in mapping/scope or parsed CCMAS record: no `AGG 101` course was found in the checked-in Agricultural Science CCMAS JSON; the corresponding broad foundation course is `AGG 102`.
- `AGG 102` does mention agronomy, soil, crop resources, plant growth, cropping systems, crop husbandry, and related topics in its broad introductory contents. Its outcomes describe general agricultural literacy, not dedicated Crop Science/Agronomy competence. One broad introductory course is therefore insufficient to represent the mapped Crop Science component or substantiate Agronomy-specific routes.

### CCMAS course/outcome evidence

The NUC [Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf) treats B.Sc. Crop Science as a broad pathway covering crop production, preservation, use, practical production enterprise and research—not a single introductory course. Its listed Crop Science course structure and course outcomes support a bounded Agronomy/crop-production evidence slice:

| Candidate code | CCMAS title | Evidence relevant to Agronomy | Disposition in proposed slice |
|---|---|---|---|
| `AGG 102` | Introduction to Agriculture I | Broad foundation: agronomy, soils, crop/plant growth and cropping systems appear in the course contents; outcomes remain introductory/general | Retain as foundation only, not as the sole scope |
| `AGR 201` | Principles of Crop Production (called *Principles of Agronomy* in another Agriculture CCMAS programme section) | Agronomic terms, crop groups, crop/climatic distribution, crop growth/husbandry, and soil management are explicit | Include as the core agronomy anchor, after checking the exact Crop Science row's code/title variant |
| `CPS 205` | Principles of Crop Physiology | Crop growth/development, seed germination/dormancy, moisture/temperature/light effects, photosynthesis and growth analysis | Include as crop-science foundation; supportive rather than a standalone Agronomy proof |
| `CPS 301` | Arable Crops Production | Crop diversity, production procedures, crop improvement, harvesting/handling and use | Include |
| `CPS 302` | Permanent Crops Production | Plantation/perennial crops, production requirements, improvement, harvest and use | Include as a distinct crop-production facet |
| `CPS 304` | Crop Genetics and Breeding | Crop inheritance, breeding methods, propagation and crop improvement | Include as supporting crop-improvement facet |
| `CPS 406` | Soil Fertility Management and Crop Nutrition | Soil fertility and crop nutrition | Include as a bounded agronomic production input facet, subject to validating the parsed source outcomes against the PDF text |
| `CPS 407` | Irrigation Practices in Crop Production | Irrigation as an alternative to rain-fed crop production and all-year production | Include as a bounded crop-production practice facet |

The CCMAS also contains relevant but more specialized courses (for example `CPS 303 Crop Pests and Diseases`, `CPS 405 Weed Science and Control`, and `CPS 408 Post-Harvest Physiology and Produce Storage`). They should be added only when the desired Agronomy path explicitly includes those facets and each parsed outcome is verified; this checkpoint does not claim to reproduce a complete four-year course list.

The NUC source states Crop Science includes broad lower-level agricultural training followed by advanced Crop Science training. It identifies arable/vegetable/permanent-crop production, seed production, and crop-science research among the programme's outcomes/employability areas. The cited course descriptions give concrete support: `AGR 201` covers agronomic terms, crop classification/distribution and soil; `CPS 205` covers crop growth physiology; `CPS 301` and `CPS 302` address arable and permanent crop production; and `CPS 304` addresses crop genetics and breeding.

### JAMB occurrence verified separately

- The official [JAMB Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf) has a distinct **AGRONOMY** entry. Its extracted text lists ADSU (with options in Crop Production, Crop Protection and Soil Science), ESUTECH (as Agronomy and Ecological Management), HENSARD, IBADAN, NASARAWA, TSUJ and UNIOSUN.
- The local occurrence inventory independently records one Agriculture source occurrence (`agriculture_offerings.json`, parsed row ordinal 5) and the same seven institution tokens. However, the inventory still has `offering_row_verified_against_pdf: false`, no precise PDF table locator, and no official source URL/access date on the occurrence row. Thus the official brochure text confirms the programme occurrence and the institution-token set, while the local source-ledger verification fields remain open.
- The JAMB listing is a programme/offerings source, not proof that all listed institutions deliver the same detailed Crop Science course set. ADSU options and ESUTECH's alternative title are explicit contextual variation and should not be collapsed into an asserted identical institution-level curriculum.

## Unresolved evidence / guardrails

1. **Course-code/title variant:** In the NUC Agriculture CCMAS, course names/codes differ across programme sections (including `AGR 201 Principles of Crop Production` and `AGR 201 Principles of Agronomy`). Reconcile the exact course row in the parsed `Crop Science` component to the NUC PDF section before persisting a row scope; do not normalize away the source's variant.
2. **Parsed-outcome quality:** Some locally parsed course records have sparse or suspiciously mismatched outcome text. Validate each proposed code's complete title, contents and learning outcomes directly against the Crop Science section of the NUC PDF before student-facing use—especially `CPS 406` and `CPS 407`.
3. **Institution-level implementation:** CCMAS is the national curriculum benchmark, not evidence that each JAMB-listed institution uses identical course codes, options, or sequencing. Do not claim a university-specific Agronomy curriculum without institution-published support.
4. **Student domain links:** The existing D118/direct and other functional links were generated from a one-course scope. Their row-specific validity is not established by this research. Keep them out of any confirmed student-path claim until recomputed/reviewed from the corrected, bounded evidence.
5. **No full curriculum inferred:** The proposed subset is a defensible evidence slice for mapping review, not the complete Agronomy degree curriculum or a complete student learning roadmap.

## Minimal proposed row patch — NOT APPLIED

1. Retain **Agricultural Science::Crop Science** (`CPS`) as the primary CCMAS component; do not add unrelated components based only on Agronomy's JAMB title.
2. Correct the scope description/selection so `AGG 102` is clearly foundation-only, and add a bounded crop-science evidence slice after direct PDF reconciliation: `AGR 201`, `CPS 205`, `CPS 301`, `CPS 302`, `CPS 304`, `CPS 406`, and `CPS 407`. Do not claim that this is a complete degree curriculum. Keep `CPS 303`, `CPS 405`, and `CPS 408` as optional specialized candidates for a later facet-specific decision, not automatic inclusions.
3. Preserve the official JAMB occurrence context and seven institution tokens; keep its source-ledger verification state open until a precise brochure page/table-row locator is captured.
4. Reassess existing domain links from the corrected course-level evidence. This proposal does not authorize promoting existing links or generating/replacing shared artifacts.

**Disposition:** Confirmed under-scope defect: one broad introductory course (`AGG 102`, not `AGG 101`) is not adequate representation of the NUC Crop Science/Agronomy evidence. The bounded candidate codes above are proposed for serialized repair only after code/title and outcome-level PDF reconciliation.
