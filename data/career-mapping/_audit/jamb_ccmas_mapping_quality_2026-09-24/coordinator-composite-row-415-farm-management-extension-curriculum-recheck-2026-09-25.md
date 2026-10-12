# Composite curriculum recheck — row 415 Farm Management & Agric. Extension

Recorded 2026-09-25 (Africa/Lagos). Append-only supplement to the existing row-411–420 checkpoints and partition-02 crosswalk. This is a targeted evidence recheck, not a new identity-range audit. No canonical mapping, scope, seed, SQL, API, UI, or taxonomy file was changed.

## Exact identity and source-context result

- Canonical identity: row 415, **Farm Management & Agric. Extension**, mapped as `B_granular` to `Agricultural Science::Agricultural Extension`.
- Official JAMB Agriculture brochure catalogue (printed p. 75) includes the exact programme heading **“Farm Management & Agric. Extension.”** This confirms catalogue identity, but not the awarder cells for the exact identity.
- The checked-in parsed offering record does **not** preserve that exact heading as its source row. It assigns the four tokens CRAWFORD, FUNAAB, LASUSTECH and OOU to **“Agricultural Economics & Farm Management”**, while separately noting an **“Agricultural Economics & Extension”** heading for BOUEDST and HENSARD. The note calls its chosen source heading the “best match”; it is a parser/matching assumption, not verified table geometry. Therefore the exact institution-bearing JAMB context for row 415 remains **unresolved**. Do not treat those four institution tokens as verified awarders of the exact row-415 title.

## CCMAS component and outcome comparison

The current row-415 scope selects 17 courses from the CCMAS **Agricultural Extension** package. It includes genuine extension/rural-development/research content (AGX 204, AGX 205, AGX 301/304, AGX 401–403) and some agricultural-economics coverage (AGE 202 and AGE 404). However, the exact named **Farm Management** facet has stronger item-specific evidence in the separate CCMAS **Agricultural Economics** programme:

- **AGE 307, Introduction to Farm Management and Accounting**: outcomes include preparing farm records and budgets, comparing financial performance, farm planning with linear-programming approaches, bookkeeping and financial statements. NUC Agriculture CCMAS, course locator AGE 307, PDF pp. 81–82.
- **AGE 302, Introduction to Computer Application in Agricultural Economics**: database creation and analysis using spreadsheet/statistical software. This is relevant only if the verified awarder’s curriculum includes the Agricultural Economics option; it must not be used to imply that particular software is universally required.
- **AGR 202 / AGX 204** outcomes support agricultural economics, extension methods and rural sociology; **AGX 205** supports qualitative/quantitative research methods; **AGX 301/401/402/403** support community interventions, programme evaluation, extension communication and teaching/learning methods. Locators: NUC CCMAS course codes and outcome text, including PDF pp. 41–43 and 140–143.

**Disposition:** the Agriculture CCMAS contains substantive evidence for both halves of the title, but in separately named Agricultural Economics and Agricultural Extension curriculum programmes. This is a strong candidate for a *course-scoped complementary crosswalk*, not authorization to append either entire CCMAS package. Select relevant Farm Management outcomes (AGE 307 and any source-verified prerequisites) alongside the row-specific extension courses only after the exact JAMB offering/option context is resolved. The current extension-only component and 17-course scope do not yet demonstrate the full named programme.

## Active domain links and downstream gate

| Current link | Evidence recheck | Status for this identity |
|---|---|---|
| D047 Agricultural Science — direct | Multiple selected courses establish agricultural foundations and extension subject matter. | Strong subject-domain basis; subgroup and role descendants still need a row-specific task match. |
| D063 Economics — functional | AGE 202/404 provide agriculture-economics/policy evidence; AGE 307 would strengthen farm budgeting/accounting if the component is confirmed. | Plausible bounded farm-economics bridge, not blanket access to all 17 domain roles. |
| D078 Social Sciences — functional | AGX 204 rural sociology and AGX 205 research methods, plus AGX 301/304 community work, support rural/community-development facets. | Plausible bounded bridge; do not expose every social-science subgroup/role. |
| D041 Scientific Research — functional | Current saved anchor is AGG 102, a broad introductory-agriculture course. AGX 205 is the more specific research-methods evidence. | Current anchor is inadequate; replace/reassess using the exact outcome-bearing research course before retaining as confirmed. |
| D118 Crop Production, Horticulture — functional | Current saved anchor is AGG 102, a broad agriculture survey; the row’s selected slice has no specific crop-production course outcome. | Unsupported by the cited row-specific evidence; remove/hold from confirmed student paths unless a specific crop course and role use case is established. |

Domain existence/counts are not programme-to-role evidence. Subgroups and each role task for the otherwise plausible D047/D063/D078 paths remain unadjudicated here; no domain or descendant is promoted as a complete student route.

## Checkpoint counts and next action

- New identity reviewed in this supplement: **1** (row 415); previously checkpointed identity ranges were not restarted.
- Newly fully closed to exact JAMB source context + component/course outcomes + every connected domain/subgroup/role: **0/1**.
- Row 415 remains open for official awarder-cell verification, identity-specific course-scope resolution and descendant-role filtering. Full-catalogue checkpoint coverage remains **420/420** according to the existing range reports; that coverage is not 420 closed identities. Partition-02 rows 307–420 remains **0/114 fully closed** under its latest recheck.

## Sources / locators (accessed 2026-09-25)

- JAMB IBASS, [Agriculture degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf), printed p. 75: exact catalogue entry “Farm Management & Agric. Extension”; catalogue identity only, not a verified awarder row for this identity.
- NUC, [Agriculture CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2022/12/Agriculture-CCMAS.pdf), AGE 307, PDF pp. 81–82; AGR 202, PDF pp. 41–43; AGX 204/related extension outcomes, PDF pp. 140–143. Course code/title and outcome are cited; these do not prove a specific JAMB institution’s curriculum implementation.
- Local occurrence and scope records: `data/career-mapping/jamb/agriculture_offerings.json`; `data/career-mapping/programme_mapping.json` row 415; `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json` row 415; `data/career-mapping/jamb_domain_map.json` key `Farm Management & Agric. Extension`.
