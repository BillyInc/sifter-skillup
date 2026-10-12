# Reverse CCMAS component crosswalk — evidence checkpoint (2026-09-25)

This is a distinct, append-only sidecar for the 83 CCMAS programme packages that lack an exact `component_refs` entry in the saved 420-row JAMB curriculum-scope artifact. It does not edit shared mappings, seeds, SQL, UI, or API.

## Current disposition

- CCMAS components inventoried and classified: **83/83**.
- Canonical JAMB identities compared per component: **420**.
- Confirmed component-to-JAMB matches from this checkpoint: **0**.
- Candidates requiring exact source-offering/course-outcome evidence: **83**.
- No-support-after-documented-search dispositions: **0**; no component was declared unavailable from a missing seed link or lexical-search absence.
- Every lexical lead is explicitly non-evidence. Faculty/institution tokens remain parser output until the exact official brochure table is located.
- Full CCMAS course codes, titles, content summaries and parsed learning outcomes are included in the JSONL ledger so review can test each component rather than title-match alone.

## Official source and locator policy

- NUC CCMAS discipline PDFs and programme sections are linked item-by-item in the ledger; accessed **2026-09-25**. Course code/title is supplied as the locator. Exact printed page numbers are intentionally marked unverified where not independently checked.
- Each lexical JAMB lead retains every parsed source-faculty occurrence and institution token, plus a verified official JAMB brochure URL where available; accessed **2026-09-25**. Exact awarding-institution table locators remain null until verified against the PDF.
- Medical/Pharmaceutical/Health source occurrences currently lack a verified direct official PDF URL in this ledger (13 retained lead occurrences); their checked-in source-document filename is preserved and must be resolved from IBASS before that offering context can be adjudicated.
- Accordingly, this artifact is a complete 83-package *candidate crosswalk*, not a completed 83-package adjudication. Do not use its candidate entries as student-visible mappings.

## Confirmed context dispositions already established in the main audit

The five exact-title Education-package comparisons reviewed in `agent-01-increment-021-unreferenced-crosswalk-review-2026-09-25.md` are confirmed *non-matches to the specific non-Education source contexts reviewed*: Education::Political Science vs Social/Management Sciences Political Science; Education::Computer Science vs Sciences/Engineering Computer Science; and Education::Chemistry, Physics, Biology vs their Sciences offerings. Teacher-training/practicum outcomes distinguish these packages. This does not establish that those Education packages have no corresponding Education-faculty JAMB identities; therefore the package-level status remains candidate pending a search across all exact Education offerings.

## Review limit and next evidence required

This pass systematically compared each CCMAS programme name with all 420 canonical JAMB identities and attached official source paths plus complete parsed CCMAS course/outcome material. It did not visually verify the exact institution-bearing row for every candidate, nor did it yet perform outcome-by-outcome adjudication for all 83 packages. For each package, the next reviewer must inspect the JAMB PDF catalogue/faculty and exact institution table, compare course titles/content/outcomes against that offering, preserve distinct faculty contexts, then document either a confirmed match, a candidate needing further source evidence, or no support only after a documented search. Downstream domain/subgroup/role links remain outside this sidecar disposition until that scope is established.

Machine-readable append-only ledger: `unreferenced_ccmas_component_crosswalk_2026-09-25.jsonl` (83 JSONL records).
