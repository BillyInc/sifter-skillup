# Coordinator continuation — Batch 4: History and Strategic Studies

**Date:** 2026-09-25  
**Rows reviewed:** 290 (1-based `programme_mapping.json`)  
**Status:** Component/source and domain-link audit increment. No canonical mapping, seed, SQL, or UI edits.

## JAMB identity, source context, and current component claim

The official JAMB Arts brochure catalogue lists `History and Strategic Studies` (printed p. 130). The local Arts offering record at `data/career-mapping/jamb/arts_hum_offerings.json` is contaminated: its `institutions` array contains `STUDIES`, `AND`, `HISTORY AND`, `ARTS`, and `MILITARY HISTORY` among apparent provider names. Its listed page-line range overlaps adjacent catalogue material, so this array cannot establish the provider list. The individual admission requirement notes name multiple institutions, but they are not a clean programme-row parse and should not silently substitute for a re-extraction from the official source.

The active name-keyed map says the JAMB identity is a combined `Arts::History/History and Diplomatic Studies` plus `Social Sciences::International Relations` package, with a note that `history (primary) + strategic -> History/History and Diplomatic Studies`. The audit scope, however, has **zero selected courses** and was labelled `combined_scope_evidenced` from a secondary mapping rule. No dedicated CCMAS programme named Strategic Studies appears in the checked 237-programme source catalogue. A title/mapping rule is not evidence that the substantive `Strategic Studies` component is represented. International Relations includes relevant political/international-security content, but equivalence to a strategic-studies curriculum remains unproved and needs authoritative, offering-specific external curriculum evidence where CCMAS is inadequate.

## Domain links: evidence status against actual component coursework

The current row has 15 links, all with zero JAMB-scope course anchors. The full CCMAS History and International Relations course files were inspected for specific course/outcome candidates. These candidates identify evidence to scope; they do not retroactively validate the current mapping.

| Current destination and type | Component/course evidence candidate | Audit disposition |
|---|---|---|
| D039 Higher Education — functional | History/IR programmes can include research/project and academic-history outcomes, but the current combined scope selects none and the destination means tertiary-education work. | Unconfirmed; identify the course/outcome and appropriate downstream teaching/research roles before retaining. |
| D078 Social Sciences — functional | Both source curricula are social-science/humanities-related, but the domain is a broad career family rather than a curriculum component. | Unconfirmed; define what supported student path this link represents. |
| D063 Economics — functional | History includes economic-history courses; IR includes IRS 301 International Economic Relations. | Candidate functional bridge only if those actual outcomes are selected and linked; not a substitute for Economics curriculum. |
| D043 Journalism — functional | No journalism-specific curriculum/outcome established by either current component claim. | Unsupported on evidence reviewed; keep out of confirmed student view absent item-specific coursework. |
| D152 Museum Curation, Cultural Heritage, Archives — functional | History curriculum includes history/archaeology, heritage/museum/archival candidate coursework. | Plausible, but identify the exact selected History courses/outcomes and limit roles to evidence-backed archival/heritage work. |
| D073 Library, Archive — functional | History source may support archival research/use, but no selected course or outcome is cited for library science or professional records management. | Unconfirmed; distinguish historical archival methods from library-service occupations. |
| D149 Diplomacy, International Relations — direct | The claimed IR component includes diplomacy, foreign-policy, international-system and international-institution coursework. | Plausible direct route only if IR is confirmed as part of this actual JAMB offering and the component courses/outcomes are explicitly scoped. |
| D151 Criminology, Criminal Justice — functional | No crime, criminal justice or criminological course/outcome identified in the claimed components. | Unsupported on evidence reviewed; suppress pending specific support. |
| D045 Public Administration — functional | IR has `Theory and Practice of Administration` (IRS 311) with bureaucracy/administrative-organization outcomes. | Candidate functional bridge if explicitly included; broad regionalism/human-rights titles alone are not enough. |
| D037 Legal Practice — functional | International Relations has `Law of Nations (International Law)`; this provides international-law knowledge, not general legal practice qualification or court/client skills. | Current functional type overstates the evidence. At most an adjacent knowledge path unless a distinct law curriculum is evidenced. |
| D038 Compliance, Regulation — functional | International law/institutions may provide context but do not by themselves establish compliance-control practice. | Unconfirmed/likely overreach; seek course outcomes about regulatory or compliance practice. |
| D162 Immigration Law, Asylum — functional | No immigration, refugee, or asylum-specific course/outcome identified in the checked components. | Unsupported on evidence reviewed; suppress absent such evidence. |
| D028 General Management — functional | No identified course outcome establishes general organizational or business-management practice. | Unsupported on evidence reviewed; suppress absent specific evidence. |
| D161 Humanitarian Aid, Emergency Response — functional | IR peace/conflict/UN peacekeeping content can explain the field but does not establish emergency-response or humanitarian operations competence. | Not a confirmed functional preparation path; potentially adjacent only if the intended route and downstream roles are explicitly narrowed. |
| D065 Translation, Interpretation — adjacent | No language-specific translation/interpretation curriculum is part of either claimed component. | Unsupported even as a named learning path on the checked scope; remove unless a language component is evidenced. |

The current `ready` mapping state and `combined_scope_evidenced` label therefore overstate what is proven: the selected-course count is zero, strategic-studies coverage is not established, and most links have neither a scoped item nor a programme-specific course anchor. This finding does not prove all 15 destination relationships are intrinsically false; it means the current student-route evidence is inadequate.

## Downstream implications and next checks

The destination domain catalogues contain generic subgroups and roles, but no JAMB-specific subgroup/role allow-list was found. Consequently, even the plausible D149/D152/D045 bridges cannot expose every generic role in those domains as an outcome of this programme. After the offering contexts and actual components are reconciled, each retained link must be narrowed to supported subgroups/roles; unsupported branches should not be exposed as confirmed.

Next: (1) recover clean provider rows for each JAMB source occurrence; (2) check each named offering against CCMAS components and course/outcome locators; (3) seek authoritative external curriculum evidence for any actual Strategic Studies component not represented by CCMAS; (4) construct an explicit selected-course/outcome-to-domain table and independently recompute direct/functional/adjacent; and (5) inspect the relevant downstream roles before the row can be cleared.

## Sources checked

- Local: `programme_mapping.json` row 290; `jamb_domain_map.json` entry `History and Strategic Studies`; `jamb_curriculum_scopes_2026-08-17.json`; `programme_domain_evidence_2026-08-17.json`; `jamb/arts_hum_offerings.json`; `ccmas/arts.json` History/History and Diplomatic Studies; `ccmas/social_sciences.json` International Relations; and `domain_structure.json` for D039/D078/D063/D043/D152/D073/D149/D151/D045/D037/D038/D162/D028/D161/D065.
- JAMB, [Arts and Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed p. 130, confirms the full programme identity (accessed 2026-09-25). It does not provide university curriculum/course outcomes.
