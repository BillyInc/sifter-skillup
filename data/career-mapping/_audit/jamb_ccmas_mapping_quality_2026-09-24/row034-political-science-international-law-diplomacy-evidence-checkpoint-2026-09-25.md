# Row 34 — Political Science / International Law and Diplomacy

Date: 2026-09-25  
Lane: research/checkpoint only  
Status: evidence checkpoint; **no shared JAMB mapping/scope/canonical/derived/active JSON, seed, SQL, or role file edited**

## Finding

The exact JAMB offering is a Babcock programme under the **Social/Management Sciences** brochure context. The title's Political Science and International Law/Diplomacy facets are substantively supported by the Babcock undergraduate course schedule and by NUC Social Sciences CCMAS outcomes for Political Science and International Relations. The current scope, however, selects **zero courses**, and the current active JAMB domain map exposes **zero links**. The prior candidate/claimed links therefore remain unapproved.

The “International Law” subject facet must not be mistaken for a full LL.B curriculum, professional legal education, or lawyer/court practice. The title does not justify a `Law::Law` curriculum union. The exact Babcock B.Sc. schedule includes some law-specific courses, but the NUC Law CCMAS is a distinct first-degree-in-Law curriculum with separate clinical/moot/practice courses. A degree that studies international-law subjects does not itself establish legal-practice qualification.

## Exact JAMB source occurrence and institution

- `programme_mapping.json` row 34 (zero-based index 33) is `Political Science / International Law and Diplomacy`, faculty `Social/Management Sciences`, mapping type `B_granular`, component code `POL`, with note `PolSci variant with IR/diplomacy emphasis`.
- `data/career-mapping/jamb/social_management_offerings.json` preserves the matching JAMB source occurrence. It associates the programme with **BABCOCK**, and records its O'Level/Direct Entry requirements as “as in Political Science”; the source note says no separate requirements column is shown for this heading. Do not copy neighbouring Political Science waiver text as a separately verified row-34 rule.
- JAMB's official Social Sciences brochure lists “Political Science/International Law and Diplomacy” in its Social/Management Sciences catalogue. Babcock University's own undergraduate bulletin names the degree **B.Sc. (Hons) Political Science (International Law and Diplomacy)** and separately lists this degree track's course sequence. This independently corroborates the Babcock/source-context pairing.
- Do not collapse this exact slash-title into other JAMB catalogue identities such as Political Science and Diplomacy, Political Science and International Relations, Political Science and International Studies, or the standalone Law/International Relations programmes.

## CCMAS and Babcock course evidence for both title facets

### Political Science / diplomatic and international-law content

The declared CCMAS components are `Social Sciences::Political Science` (`POL`) and `Social Sciences::International Relations` (`IRS`). They have direct course/outcome evidence for both facets:

- **Political Science:** POL 205 Introduction to International Relations links state interaction, national interest and domestic/foreign policy; POL 309 Theories of International Relations covers IR concepts and applying theories to international politics; POL 405 Nigerian Foreign Policy covers national interest, foreign-policy actors/processes and Nigeria's external relations.
- **International law:** POL 406 International Law and Organisation covers the nature/development/principles of international law, international adjudication and dispute settlement, its limitations in international politics, and international organisations.
- **Diplomacy:** IRS 304 Diplomacy covers diplomacy's historical development, peaceful dispute settlement, ambassador appointments/recall, privileges/immunities and diplomats' functions. IRS 303 links international law, international organisations, trade and global diplomacy within the international political system.
- **International law under IR:** IRS 305 Law of Nations (International Law) covers sources of international law, state practice, adjudication/enforcement, the International Court of Justice, and limitations relative to municipal law.

These outcomes establish subject knowledge and learning about international systems, diplomacy, foreign policy, and international law. They do not establish domestic legal practice or a complete professional Law degree.

### Exact Babcock offering-specific corroboration

Babcock's 2019–2023 Undergraduate Bulletin lists a specific B.Sc. Political Science (International Law and Diplomacy) schedule: LAWS 105 Introduction to Law and ILDP 121 Introduction to International Relations and Diplomacy in Level 100; ILDP 201 General Principles of International Law, ILDP 221 Constitutional Law, and ILDP 234 Structure of Nigerian Foreign Service in Level 200; diplomatic/consular-law and international-institutions courses in Level 300; and international human-rights/humanitarian-law courses in Level 400. This is strong evidence that both title facets exist in the named Babcock degree. It is Babcock-specific, not a universal course prescription for every JAMB programme with similar words.

### What the separate Law CCMAS does—and does not—establish

The checked-in `data/career-mapping/ccmas/law.json` represents the distinct `Law::Law` curriculum (70 parsed courses). It contains foundational/constitutional law and public international law; its explicitly practical `CLE 401/402 Clinical and Moot Court Practice` outcomes include moot/mock trial participation, law-office/courtroom exposure, legal drafting and advocacy. Row 34's declared scope has **no Law component and no selected Law courses**. Do not import the full LL.B course set or those practical outcomes into this B.Sc. merely because its title includes “International Law.”

The official Nigerian Law School states that people wishing to practise law in Nigeria must pass through the Law School. The Babcock source identifies this row as a B.Sc. (Hons), not an LL.B. Therefore a Legal Practice route is not established by row 34's title or by international-law survey courses. (This checkpoint does not adjudicate individual admission eligibility.)

## Current mapping/scope/link state

- Mapping: `B_granular`, primary `POL`; mapping note describes an IR/diplomacy emphasis. The canonical record declares Political Science primary plus International Relations supporting.
- Saved curriculum scope: `combined_scope_review_required`, `pending_review`; component refs are Social Sciences::Political Science and Social Sciences::International Relations; selected course list is empty; no separate Law component is declared.
- Active map (`jamb_domain_map.json`): `links: []`, `mapping_status: review_required`.
- Derived map: also currently has `links: []` and `review_required` for this identity.
- Canonical candidate links (not active student links): D063 Economics (functional), D149 Diplomacy/International Relations (direct), D078 Social Sciences (functional), D037 Legal Practice (functional), D045 Public Administration (functional), D028 General Management (functional), D130 Recruitment/Employment (functional), and D065 Translation/Interpretation (adjacent). These remain proposals, not student routes.
- A prior link audit discussed 13 claimed destinations, including D151 Criminology/Criminal Justice, D038 Compliance/Regulation, D162 Immigration Law/Asylum and D077 Security Services. Its course-level review found the current downstream fanout overbroad: D149 is the strongest direct subject-area fit; research destinations require narrowing to relevant social/political research; D037 professional Legal Practice is unsupported; the other broad destinations do not follow from course evidence as generic career paths. Because the current active map is empty, none of those older claims should be represented as currently exposed.

## Proposed row-only disposition (not applied)

1. Preserve the exact JAMB identity, Social/Management Sciences source context, and Babcock occurrence; keep Babcock-specific course evidence institution-scoped.
2. Retain Political Science and International Relations as the core CCMAS components. Make a course-level row-34 scope from relevant POL/IRS outcomes, including the foreign-policy, IR-theory, diplomacy, and international-law anchors above. Do not select the whole POL/IRS curriculum merely because the labels occur in the title.
3. Use the Babcock schedule as offering-specific supplementary evidence. Keep Babcock's `LAWS`/`ILDP` course identifiers distinct from NUC CCMAS codes; do not assert a code equivalence without a concordance.
4. Do not add the separate `Law::Law` component by default. If it is considered as supporting context, restrict it to independently validated row-specific course evidence and do not import the full LL.B curriculum or legal-practice requirements.
5. Keep all active downstream links unpublished until the course-level scope and each domain/subgroup/role route are reviewed. `D149 Diplomacy, International Relations` is the best direct candidate; `D078` may be limited to political/social research pathways. Do not publish `D037 Legal Practice`, lawyer/court roles, or other broad candidate domains based on this degree title alone. Add no link through analogy.

## Sources

- JAMB, *Degree Social Sciences Brochure*: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf (Social/Management Sciences catalogue; printed p. 574 listing).
- Babcock University, *2019–2023 Undergraduate Bulletin*: https://legacy.babcock.edu.ng/assets/docs/academics/bulletin.pdf (Political Science/International Law and Diplomacy course schedule, printed pp. 37–42; course table around PDF pages 842–847).
- Babcock University undergraduate admission page: https://sb.babcock.edu.ng/admission/undergraduate (B.Sc. Political Science/International Law & Diplomacy degree and institution-specific admission context).
- NUC, *Social Sciences CCMAS 2023*: https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf (POL and IRS course outcomes; e.g. IRS 304/305 printed pp. 127–128; POL course material in the Political Science section).
- NUC CCMAS directory, Law discipline: https://www.nuc.edu.ng/ccmas/ (official directory for the separate Law CCMAS).
- Nigerian Law School, About: https://www.lawschool.gov.ng/about.html (professional legal training context).
- Local checked-in evidence: `data/career-mapping/ccmas/social_sciences.json`, `data/career-mapping/ccmas/law.json`, `data/career-mapping/jamb/social_management_offerings.json`, `data/career-mapping/_audit/jamb_curriculum_scopes_2026-08-17.json`, `data/career-mapping/_audit/jamb_ccmas_inheritance_canonical_2026-08-17.json`, `data/career-mapping/_audit/jamb_domain_map_ccmas_derived_2026-08-17.json`, and `data/career-mapping/jamb_domain_map.json`.

## Scope boundary

This is an evidence checkpoint only. Do not edit shared JAMB mapping/scope/canonical/derived/active JSONs, seeds, SQL, or role files as part of it. No active link is proposed for publication here.
