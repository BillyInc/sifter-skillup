# Domain and subgroup source / naming audit — 2026-10-03

This is a refreshed source-label and subgroup-count reconciliation, not semantic approval of specialization-to-domain fit or a role-membership audit. Stable domain IDs, subgroup codes, ownership and relationships are preserved.

Scope checked: 168 domains and 557 subgroups. Every subgroup code resolves to an ILO ISCO-08 title; `557/557` has recorded provenance; `557/557` subgroup role counts reconcile.

## Source and derivation results

- Domain lineage: 166 source-library domains and 2 later repo additions are present in the traceability crosswalk. The source-backed/exact/curated classifications are carried per ID in the JSON; the prior August summary alone was insufficient to prove readability.
- Subgroup derivation: all 557 two-digit codes exist in the local ISCO source taxonomy and map to a canonical source title. The recorded role counts match the current deduplicated role sources for all 557 groups.
- Literal wording: 536 raw source-label fields match the official ISCO title. 272 student-facing subgroup labels differ from that literal title; they are inventoried below/in JSON as candidates requiring wording evidence, not presumed errors.
- Official source reference: [ILO ISCO-08](https://isco.ilo.org/en/isco-08/). It defines the two-digit sub-major group level and provides the group titles and scope descriptions.

## Safe label corrections recorded in this checkpoint

### Domains

| ID | Previous label | Current display label | Basis |
|---|---|---|---|
| D007 | UI/UX Design | User Interface and User Experience Design | Existing source definition/description; see per-ID locator in JSON |
| D140 | Robotics Engineering, Systems Design | Robotics Engineering and Systems Design | Existing source definition/description; see per-ID locator in JSON |
| D011 | Quantitative Finance | Quantitative Finance and Financial Engineering | Existing source definition/description; see per-ID locator in JSON |
| D060 | Banking, Credit | Banking and Credit Services | Existing source definition/description; see per-ID locator in JSON |
| D158 | Corporate Finance, Investment Banking | Corporate Finance and Investment Banking | Existing source definition/description; see per-ID locator in JSON |
| D159 | Credit Analysis, Structured Finance | Credit Analysis and Structured Finance | Existing source definition/description; see per-ID locator in JSON |
| D016 | Electrical | Electrical Engineering | Existing source definition/description; see per-ID locator in JSON |
| D017 | Mechanical | Mechanical Engineering | Existing source definition/description; see per-ID locator in JSON |
| D018 | Civil | Civil Engineering | Existing source definition/description; see per-ID locator in JSON |
| D074 | Occupational Health, Safety | Occupational Health and Safety | Existing source definition/description; see per-ID locator in JSON |
| D146 | Building Services Engineering — Mechanical, Electrical | Building Services Engineering (Mechanical and Electrical Systems) | Existing source definition/description; see per-ID locator in JSON |
| D147 | Process Automation, SCADA, PLC | Industrial Process Automation (SCADA and PLC Systems) | Existing source definition/description; see per-ID locator in JSON |
| D156 | Land Surveying, Cadastral Mapping | Land Surveying and Cadastral Mapping | Existing source definition/description; see per-ID locator in JSON |
| D164 | Urban Mobility, Smart City Systems | Urban Mobility and Smart City Systems | Existing source definition/description; see per-ID locator in JSON |
| D027 | Biomedical | Biomedical Science | Existing source definition/description; see per-ID locator in JSON |
| D064 | Psychology, Counselling | Psychology and Counselling | Existing source definition/description; see per-ID locator in JSON |
| D030 | Marketing, Brand | Marketing and Brand Management | Existing source definition/description; see per-ID locator in JSON |
| D079 | Customs, Trade | Customs and International Trade | Existing source definition/description; see per-ID locator in JSON |
| D162 | Immigration Law, Asylum | Immigration Law and Asylum | Existing source definition/description; see per-ID locator in JSON |
| D163 | Intellectual Property Law, Patents | Intellectual Property Law and Patent Practice | Existing source definition/description; see per-ID locator in JSON |
| D040 | Vocational | Vocational and Technical Training | Existing source definition/description; see per-ID locator in JSON |
| D073 | Library, Archive | Libraries, Archives and Information Management | Existing source definition/description; see per-ID locator in JSON |
| D151 | Criminology, Criminal Justice | Criminology, Criminal Justice and Corrections | Existing source definition/description; see per-ID locator in JSON |
| D054 | Oil | Oil and Gas Operations | Existing source definition/description; see per-ID locator in JSON |
| D089 | Funeral | Funeral and Mortuary Services | Existing source definition/description; see per-ID locator in JSON |
| D096 | Agricultural | Agricultural Machinery and Farm Operations | Existing source definition/description; see per-ID locator in JSON |
| D108 | Printing Technology, Pre-press | Printing Technology, Pre-press and Print Finishing | Existing source definition/description; see per-ID locator in JSON |
| D110 | Chemical, Rubber | Chemical, Rubber and Plastics Plant Operations | Existing source definition/description; see per-ID locator in JSON |
| D113 | Glass, Ceramics, Building Materials | Glass, Ceramics, Building Materials and Boiler Plant Operations | Existing source definition/description; see per-ID locator in JSON |
| D115 | Road Transport Operations (Drivers | Road Transport and Driving Operations | Existing source definition/description; see per-ID locator in JSON |
| D136 | Aeronautical | Aeronautical and Aerospace Engineering | Existing source definition/description; see per-ID locator in JSON |
| D086 | Gaming, Betting & Lottery | Gaming, Betting and Lottery Operations | Existing source definition/description; see per-ID locator in JSON |

### Subgroups

| Domain / ISCO | Previous label | Current label |
|---|---|---|
| D151 / 25 | ISCO-08 group 25 | Information and Communications Technology Professionals |
| D100 / 71 | Building and Related Trades Workers | Building and Related Trades Workers (Excluding Electricians) |
| D101 / 71 | Building and Related Trades Workers | Building and Related Trades Workers (Excluding Electricians) |

These subgroup changes alter labels only. No ISCO code, role count, role record, domain or map edge was changed. D151/code 25 still has a generic subgroup description and is separately flagged for source-description completion.

## Material unresolved findings

- D151/code 25 was a literal code placeholder; it now uses the ILO title, but its description and one-role grouping still need review.
- D100 and D101/code 71 now say electricians are excluded, matching the actual ISCO scope.
- The 272 curated/altered display labels are not all defects; each needs to be checked against the linked source-backed role cluster before calling its wording correct. The JSON lists every one with domain, code, official title, provenance and role count.
- D133's source-library identity and student description appear to cover different scopes; no replacement was guessed.
- D086 lacks a current cluster despite its source-library record specifying one; later additions D167/D168 have no source-library cluster record and need explicit curation evidence.
- The full set of 168 domain records and 557 subgroup records, plus all unresolved candidates, is in the companion JSON.

No generated seed, SQL, database, JAMB mapping, endpoint or UI file was edited for this audit. When naming edits are accepted, `_gen_career_seed.py` reads `domain_meta.json` and copies domain names into the generated role/domain rows; subgroup labels flow from `domain_structure.json`. Seed regeneration remains a later step.
