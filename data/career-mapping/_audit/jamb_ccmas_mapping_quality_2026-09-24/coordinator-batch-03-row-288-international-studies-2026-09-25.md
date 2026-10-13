# Coordinator continuation — Batch 3: International Studies and Diplomacy source contexts

**Date:** 2026-09-25  
**Rows reviewed:** 288 (1-based `programme_mapping.json`) and its same-name source occurrences  
**Status:** Incremental source/course/outcome audit. No canonical mapping, seed, SQL, or UI edits.

## Identity and source-offering reconciliation

The canonical Arts row is currently named `International Studies and` and its offering record in `data/career-mapping/jamb/arts_hum_offerings.json` is not a trustworthy institution list: it contains fragments such as `FRENCH WITH GERMAN/`, `ASIAN STUDIES`, `ARTS`, `INTERNATIONAL`, `RELATIONS`, and `DIPLOMACY` interspersed with institution codes. Do not interpret that array as the Arts programme's actual providers.

The official JAMB Arts brochure catalogue (printed p. 130) lists the full identity `International Studies and Diplomacy`; the official Social/Management brochure also lists that name separately (printed p. 574). The repository has distinct source records:

| Source context | Parsed JAMB offering record | Context-specific evidence / limitation |
|---|---|---|
| Arts and Humanities | Truncated `International Studies and`; institution list contaminated | Official brochure confirms the full programme identity, but the current local institution array cannot establish which Arts institutions offer it. Re-extract the actual programme row from the brochure before attaching providers. |
| Administration and Management | `International Studies and Diplomacy`, institution `KASU`; OAU is separately present in an institution-specific subject waiver | Preserve the KASU offering and OAU waiver as distinct evidence; do not flatten the waiver into the institution list or infer a common curriculum from the shared name. |
| Social/Management Sciences | `International Studies and Diplomacy`, institution `BENIN` | Preserve this as a separate source-faculty/offering occurrence. |

The JAMB brochure notes that its advertised programmes were received from institutions; it supports programme identity and offering context, not CCMAS curriculum equivalence. The full Arts title should be normalized in any future correction, but provider associations need a clean source-row extraction first.

## CCMAS scope and outcome verification

Row 288 currently points to Social Sciences `International Relations` and selects 23 courses in the partial scope. The selected source includes substantial International Relations / Diplomacy content:

- IRS 304 `Diplomacy`: diplomatic history, peaceful dispute settlement, ambassadorial appointments, privileges and core diplomat functions.
- IRS 303 `The International Political System`, IRS 310 `Theories of International Relations`, IRS 401 `Foreign Policy Analysis`, IRS 402 `Nigerian Foreign Policy`, IRS 405 `Foreign Policies of the Powers`, and IRS 406 `International Institutions` directly cover international systems, diplomacy, foreign-policy analysis, and institutions.
- IRS 305 `Law of Nations (International Law)` covers sources, adjudication, enforcement, and the International Court of Justice.
- IRS 301 `International Economic Relations` covers international trade, WTO, IMF/World Bank, and economic-relations theories.
- IRS 311 `Theory and Practice of Administration` covers administrative-organization theory, bureaucratic decision-making, and the politics/administration relationship.

These course outcomes substantiate a strong direct International Relations/Diplomacy path for this Social Sciences component. They do **not** establish that the Administration and Arts source occurrences use the same component or exact scope. The partial scope also selects GST 112 and GST 312; these should not be used as generic proof for every downstream relationship.

## Current link-by-link evidence disposition

The row's five active links and saved anchor sets were compared with the actual selected course outcomes:

| Domain | Current type | Outcome check and disposition |
|---|---|---|
| D149 Diplomacy, International Relations | direct | Strongly supported by IRS 303/304/310/401/402/405/406 and related system courses. Keep as the supported anchor for this component; still verify its displayed subgroup/role branches are suitable to this JAMB context. |
| D063 Economics | functional | The saved anchors include several unrelated history/politics/GST courses. IRS 301 is the substantive economics-related course and explicitly covers international economic relations, trade, and international financial institutions. Keep only as a narrow economic-relations bridge pending downstream role review; do not represent it as an Economics curriculum. Replace broad/irrelevant anchors in a future evidence correction. |
| D045 Public Administration | functional | Existing anchors (new states, regionalism, human rights) are indirect. IRS 311, which is selected but omitted from the anchor list, explicitly teaches administrative organization, bureaucratic decisions, and the politics-administration nexus. This is a better course-specific basis for a functional public-administration relationship; role fit still needs checking. |
| D037 Legal Practice | functional | IRS 305 provides international-law knowledge, and IRS 403 covers human-rights protection; that is not equivalent to professional legal-practice preparation (e.g. domestic doctrinal breadth, procedure, client/court work, and qualification). Current functional label overstates the checked curriculum evidence. Reassess as an adjacent knowledge bridge or remove from a practice-oriented student route; do not call it a confirmed legal-practice path. |
| D028 General Management | functional | Current evidence cites only IRS 402 Nigerian Foreign Policy. That outcome concerns foreign policy, not general organizational/enterprise management. No adequate management-practice evidence found in the cited scope for this domain. Keep unconfirmed/out of confirmed student paths unless a specific selected course outcome supports it. |

`domain_structure.json` confirms these domain IDs have downstream catalogues, but this only establishes structural reachability. The generic subgroups/roles under Economics, Public Administration, Legal Practice, and General Management are not thereby supported for this International Relations JAMB identity. No JAMB-specific role allow-list was found in the audited mapping contract.

## Disposition and remaining work

- **Confirmed:** the Arts canonical name is truncated; the Arts institution array is contaminated; Arts, Administration, and Social/Management are distinct JAMB source contexts; row 288's Social Sciences CCMAS slice includes relevant IR/diplomacy course outcomes; D149 is directly supported for that slice; D045 has a better selected anchor in IRS 311 than its present set.
- **Evidence correction candidates:** narrow D063 evidence to IRS 301; remove unrelated course anchors from D063/D045; reassess or suppress D037 and D028 as student pathways unless more specific course evidence is identified.
- **Unresolved:** source-page reconciliation of the actual Arts provider list; whether Arts/Administration offerings have distinct curriculum contracts or can be represented by this Social Sciences component; all JAMB-specific downstream subgroup/role fit; authoritative offering-specific evidence for remaining contexts.
- This is one row-level increment, not completion of rows 281–420. No canonical map or seed was modified.

## Sources checked

- Local offering/mapping/scope: `data/career-mapping/jamb/arts_hum_offerings.json`, `administration_offerings.json`, `social_management_offerings.json`, `programme_mapping.json` row 288, `jamb_domain_map.json`, and `jamb_curriculum_scopes_2026-08-17.json`.
- Local CCMAS outcome source: `data/career-mapping/ccmas/social_sciences.json`, `International Relations`, courses IRS 301/303/304/305/310/311/401/402/403/405/406.
- Local downstream structure: `data/career-mapping/domain_structure.json`, D149/D063/D045/D037/D028 (structural check only; not programme-role validation).
- JAMB, [Arts and Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed p. 130 (full catalogue name); [Social Sciences degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed p. 574 (separate Social/Management catalogue occurrence). Accessed 2026-09-25. These are identity/context sources, not curriculum evidence.
