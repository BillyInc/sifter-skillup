# Lane 1 increment 040 — Audiology AUD 320 Paediatric Audiology

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** first exact source-uncovered course in CCMAS package index 039, Allied Health Sciences → Audiology: AUD 320.  
**Mode:** source audit only; do not edit the shared course/offering ledgers.

## Primary source

National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), [official PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf), accessed 2026-09-29.

- Global course structure: printed p. 34, extracted lines 1268–1268: `AUD 320 Paediatric Audiology`, 1 credit, compulsory, LH 15, PH dash.
- Detailed AUD 320 block: printed p. 54, extracted lines 2005–2024: course heading/load, nine learning outcomes, and Course Contents.

## Field-by-field comparison

| Field | NUC source | Local `allied_health.json` → Audiology → AUD 320 | Finding |
|---|---|---|---|
| Identity / level | AUD 320, Paediatric Audiology; 300-level global structure | Same code/title; level 300 | Match. |
| Units / status / contact hours | 1 C, LH 15, PH dash in global table; detailed heading says `1 Unit C: LH 15` | 1 unit, C, LH 15, PH null | Match; no hour conflict. |
| Learning outcomes | Nine: audiologist/team roles; speech/language/auditory development with physical milestones; paediatric hearing-loss aetiologies and prevalence; neonatal/child hearing-test batteries; peripheral/central disorders; developmental effects; behavioural/non-behavioural test interpretation; rehabilitation protocol | Nine local outcomes cover these same topics in source order | Match in count and substance. Source phrasing such as “nature and statistical figure” and “tests battery” is retained rather than editorially rewritten in this audit. |
| Course contents | Epidemiology (local/global); child auditory and genetic disorders; otologic evaluation/management; newborn screening; behavioural/objective tests; middle-ear assessment; auditory-processing disorders; educational, social, linguistic and psychological implications | Summary has 400 characters and ends mid-word at `soci`; the final source topic group is not fully represented | **Confirmed truncated content summary.** The exact source uses the spelling `Immitance`; local extraction repeats it. This audit preserves the source spelling and does not silently normalize it. |
| Item-level provenance | Official NUC PDF, printed table/course-block locators above; accessed 2026-09-29 | No `source_url`, `source_locator`, or `source_accessed_on` on this row | **Confirmed provenance gap.** Record the exact official URL, both locators, and access date during local reconciliation. |
| Structural / owner context | AUD 320 appears in the global Allied Health 300-level structure and its own Audiology detailed block | One exact AUD 320 row in the Audiology package | Correct programme context; do not substitute same-discipline shared courses or another package's rows. |

## Handoff and next cursor

Confirmed findings for local reconciliation: (1) complete the cut-off summary with the unrepresented linguistic and psychological implications topic, remaining source text; and (2) add item-specific provenance. Preserve current course identity, level, units, status, hours and all nine outcomes. Do not infer additional hours or rewrite the NUC wording. No product ledger was edited in this audit.

Next, check existing source coverage for **AUD 321 — Clinical Externship Scheme (SIWES)**, then audit the first course occurrence in global-table order that has no exact source checkpoint. Package index 039 contains 28 local rows; source-global structure/order differs from local JSON order, so continue from the official NUC order rather than simply taking the next JSON array entry.

Machine-readable evidence: `jamb_ccmas_source_audit_lane_1_2026-09-29_040_audiology_aud320.json`. Regression: `test_jamb_ccmas_source_audit_lane_1_2026_09_29_040.py`.
