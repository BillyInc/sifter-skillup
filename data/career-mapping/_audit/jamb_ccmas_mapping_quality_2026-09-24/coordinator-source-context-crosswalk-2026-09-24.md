# Coordinator crosswalk: JAMB source occurrences vs canonical identities

Audit date: 2026-09-24  
Status: incremental coordinator checkpoint; source-page verification and curriculum adjudication remain open.  
Scope: read-only comparison of the nine parsed `data/career-mapping/jamb/*_offerings.json` files with `programme_mapping.json`, plus saved-scope rows and selected CCMAS records. No canonical mapping or seed was changed.

## Reproducible parsed-file counts

- Parsed JAMB offering files contain 439 programme-occurrence rows and 420 exact distinct display names.
- `programme_mapping.json` contains 420 exact distinct JAMB names. The parsed and canonical name sets match exactly (zero offering-only names and zero mapping-only names).
- 17 display names occur in more than one parsed faculty file. One display name can therefore have distinct source-faculty and institution contexts even though the canonical mapping is a single name-keyed row.
- A raw string comparison flags 47 canonical `jamb_faculty` values that are absent from that name's parsed source-faculty set or where the source set has more than one faculty. This is only a triage count: canonical faculty labels are normalized differently from some parsed brochure faculty labels, and an apparent mismatch is not a confirmed source error until checked against the original JAMB brochure page and institution list.
- Some parsed institution arrays visibly contain OCR spillover words/fragments (for example “GEOGRAPHY AND”, “PLANNING”, and “TRANSPORT” in unrelated lists). Do not use the current parsed institution arrays as definitive evidence until they are checked against the original source page.

## Multi-file identity queue

The occurrences below are separate provenance contexts, not proof that every institution or curriculum differs. Verify the printed JAMB source faculty, exact programme label, and institution list before deciding whether they share a curriculum. Preserve source occurrence and normalized taxonomy as separate fields.

| JAMB display name | Parsed source-faculty occurrences |
|---|---|
| Biotechnology | Agriculture; Sciences |
| Computer Science | Engineering/Environmental/Technology; Sciences |
| Economics | Administration; Arts and Humanities; Engineering/Environmental/Technology; Social/Management Sciences |
| Fisheries | Agriculture; Sciences |
| Geography | Engineering/Environmental/Technology; Sciences |
| International Relations | Administration; Social/Management Sciences |
| International Studies and Diplomacy | Administration; Social/Management Sciences |
| LIBRARY AND INFORMATION SCIENCE | Sciences; Social/Management Sciences |
| Mass Communication | Administration; Arts and Humanities |
| Optometry | Medical/Pharmaceutical/Health; Sciences |
| Plant Science | Agriculture; Sciences |
| Psychology | Arts and Humanities; Social/Management Sciences |
| Public Administration | Administration; Social/Management Sciences |
| Sociology | Arts and Humanities; Social/Management Sciences |
| Software Engineering | Engineering/Environmental/Technology; Sciences |
| Sport Science | Education; Sciences |
| Statistics | Engineering/Environmental/Technology; Sciences |

The candidate table does not collapse these to “duplicates”. Same spelling may identify repeated national curriculum names, distinct faculty-level JAMB listings, different institution subsets, or parser errors; those possibilities need page-level evidence.

## High-risk faculty/context discrepancies for original-page checking

These examples were identified by comparing canonical `jamb_faculty` strings with parsed source occurrence labels. Treat as evidence-review leads only, not 47 confirmed defects:

| Saved-scope row | JAMB name | Parsed source faculty | Canonical mapped faculty | Why inspect source page |
|---:|---|---|---|---|
| 404 | Land Surveying | Engineering/Environmental/Technology | Environmental Sciences | Faculty and likely parsed institution-array boundaries differ; confirm the JAMB heading and institution list. |
| 406 | Fine Art/Fine and Applied Arts | Arts and Humanities | Environmental Sciences | Strong apparent discipline mismatch; verify the brochure row, then resolve the canonical faculty without discarding provenance. |
| 410 | Geography and Environmental Studies | Arts and Humanities | Environmental Sciences | Could be an arts/humanities programme label despite canonical Environmental Sciences normalization; verify exact printed context. |
| 417 | Environmental Management and Technology | Agriculture | Environmental Sciences | Confirm source section and institution associations before deciding this is only normalization. |
| 420 | Transport Planning and Management | Education | Administration and Management | Confirm original section/institutions and inspect the CCMAS Transport Planning and Management component; avoid forcing it into Hospitality/Tourism or Administration based on a label. |
| 344 | Optometry | Medical/Pharmaceutical/Health; Sciences | blank | Two parsed faculty contexts but canonical faculty is blank; source-page check needed to explain both occurrences. |

The exact row numbers above refer to the saved curriculum-scope order in `_audit/jamb_curriculum_scopes_2026-08-17.json`, not proof that parsed context is correct.

## Required blended-scope cases confirmed from saved records

- `Accounting and Finance` (scope row 72) declares only `Administration and Management::Finance / Banking and Finance`; its 20 selected rows are all FIN courses. The separate CCMAS `Accounting` (ACC) package is not included. The parsed Administration occurrence lists UYO, VISION-UNI, WELLSPRING and WESTERN-DEL. The official JAMB Social Sciences degree brochure separately records Accounting and Finance for FUOTUOKE (PDF p. 2, as recorded in the existing audit checkpoint). Preserve the two contexts; current evidence does not establish that the historical/second occurrence should inherit the same ACC+FIN course union. Its displayed name cannot decide this.
- `Insurance and Actuarial Science` (row 77) currently declares only CCMAS `Insurance`; the separate CCMAS `Actuarial Science` curriculum is not a component. The current scope does contain insurance courses and link D014 to Actuarial Science with anchors drawn from insurance topics, which is not equivalent to verifying the named actuarial curriculum. Treat the actuarial component and D014 match type as unresolved pending course/outcome review.
- `COMPUTER SCIENCE WITH ECONOMICS` (row 145) currently declares only Computing::Computer Science and selects eight CS courses. It does not declare or select the separate CCMAS Economics curriculum. This is a confirmed named-component coverage gap in the current scope contract; exact Economics courses and downstream link changes still need evidence-based adjudication.
- `Political Science / International Law and Diplomacy` (row 34) is labelled `combined_scope_evidenced` / `reviewed` but has zero selected courses, and its component list contains Social Sciences::Political Science and International Relations without a Law component. It is not verified as a combined curriculum; inspect CCMAS Political Science, International Relations, and Law outcomes, and narrow the broad inherited domain links to evidence-supported links.
- `COMPUTER SCIENCE AND MATHEMATICS` (row 146) selects MTH 101, MTH 102, and MTH 201 within the Computing::Computer Science scope. Do not claim mathematics is absent. It remains to be checked whether those course outcomes adequately represent the named Mathematics component or whether separately scoped Mathematics CCMAS content is necessary.

These are current-artifact findings. They are not a full independent primary-source review of every selected course/outcome or destination role. The three row-partitioned agents have been directed to review their assigned high-priority cases and broad link tranches; no sample will be represented as catalogue completion.

## Next evidence actions

1. Reconcile all parsed multi-faculty occurrences and the faculty-discordance triage list to original JAMB brochure pages and institution associations; record source-page locators and access dates.
2. Resolve each named component against the actual CCMAS programme/course record, then inspect course contents and learning outcomes. Do not infer a blend from the JAMB title or keyword-generated scope status.
3. Reassess each domain relationship and relevant downstream subgroup/role at the scope actually demonstrated; preserve unsupported links out of confirmed guidance.
4. Keep separate counts for canonical JAMB identities (420), parsed source occurrences (439), source faculty occurrences, canonical JAMB→domain links, saved curriculum-scope links, and unresolved evidence rows. Do not mix these denominators.

## Primary-source checks added 2026-09-24

Official JAMB IBASS brochure checks were made for the high-risk source-context leads:

| JAMB name / issue | Primary-source result | Effect on current audit |
|---|---|---|
| Fine Art/Fine and Applied Arts (saved row 406) | JAMB's Arts degree brochure lists the exact name under the Faculty/School/College of Arts, printed p. 130. The Engineering/Environmental/Technology brochure separately lists `Fine Art` and `Fine and Applied Arts` under that faculty section. | **Confirmed parsed-source/canonical faculty discrepancy:** canonical mapping says Environmental Sciences while a primary JAMB Arts occurrence exists. Keep exact source faculty and offering institutions attached; check whether engineering also has distinct Fine Art listings before deciding how many offering contexts. Sources: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf` p.130; `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf` p.336. Accessed 2026-09-24. |
| Geography and Environmental Studies (saved row 410) | JAMB Arts brochure lists the exact name under Faculty of Arts, printed p. 130. | **Confirmed primary source context; canonical faculty discrepancy:** current `programme_mapping.json` says Environmental Sciences. Preserve the Arts occurrence; reconcile any separate Environmental Sciences offerings by institution rather than replacing one with the other. Source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf` p.130. Accessed 2026-09-24. |
| Transport Planning and Management (saved row 420) | JAMB Education brochure lists the exact programme under Faculty of Education, printed p. 200. | **Confirmed primary source context; canonical faculty discrepancy:** map says Administration and Management. Original parsed Education offering is consistent with the official brochure; verify institution list and CCMAS Transport Planning and Management before correcting taxonomy. Source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf` p.200. Accessed 2026-09-24. |
| Land Surveying (saved row 404) | JAMB Engineering/Environmental/Technology brochure lists Land Surveying in that faculty's programme table, printed p.336; table entries include additional separate programmes/variants such as Land Surveying and Geoinformatics. | Source label alone does **not** settle the canonical Environmental Sciences mapping or institution associations. Check exact table-row/institution placement and whether a separate Environmental Sciences occurrence exists. Source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf` p.336. Accessed 2026-09-24. |
| Computer Science with Economics / Computer Science and Mathematics (rows 145–146) | JAMB Engineering/Environmental/Technology brochure includes a single printed catalogue line `Computer Science with (Economics) (Mathematics)` under that faculty, while JAMB Sciences separately lists forms including `Computer and Economics`, `Computer and Mathematics`, and `Mathematics and Economics` (printed p.452). | Strong warning that the engineering identity variants are catalogue/option contexts, not automatically two independent full CCMAS programmes. Existing JAMB rows 145–146 need the institutions and exact requirement text extracted from the primary table, then course-outcome review. Sources: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf` p.336; `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf` p.452. Accessed 2026-09-24. |

Search-result/parsed text can blur which institutions belong to a catalogue row; the brochure PDF and its table geometry remain the controlling source. These checks establish source section/name, not complete institution lists.

## Saved checkpoint: exact source-context leads and count reconciliation (2026-09-24)

This is an append-only checkpoint for the user's requested primary-source checks. It records what the official JAMB pages establish and what remains unverified; a catalogue/index entry is not treated as proof of an institution association.

### Recount from current canonical artifacts

Recounted directly from `programme_mapping.json`, `jamb_domain_map.json`, and `jamb_curriculum_scopes_2026-08-17.json`:

- The saved curriculum-scope file contains **3,164** JAMB-to-domain rows overall; **1,333** have no `scope_course_titles` locator.
- Rows 281-420 contain **835** saved-scope links; **439** have no `scope_course_titles` locator.
- The current active `jamb_domain_map.json` is one link shorter overall: **3,163** links, **1,332** without a locator. For rows 281-420, active map and saved scope both count 835 links and 439 without locators.
- The row-281-420 label totals differ by source artifact: saved scope = 115 direct / 670 functional / 50 adjacent; active map = 115 direct / 605 functional / 115 adjacent. A per-name/domain join confirms **65 match-type disagreements within rows 281-420**. Across all 420 rows, it finds **147** match-type disagreements and one scope-only link (`Project Management` -> D001). These labels must not be silently mixed; resolve against course outcomes and downstream fit.
- The earlier statement of 835 links and 115 direct / 605 functional / 115 adjacent describes `jamb_domain_map.json`, not the saved scope. The earlier scope-side totals of 115 / 670 / 50 are the saved-scope distribution. Both have 835 row-level links in this tranche, but they are not semantically equivalent.
- **Next systematic domain-link boundary:** row 281, `English and Literary Studies` -> first saved link D130 `Recruitment, Employment`. The tranche has 835 links total and 439 with no course-title locator. Prior checkpoints already contain individual decisions for some later rows; because no exhaustive disposition ledger exists, the number of never-reviewed links cannot honestly be reduced by subtracting note-table entries. The systematic link-by-link queue remains open from this boundary.

### JAMB primary-source checks for the requested rows

| Row | Official JAMB evidence checked | Parsed/source-context reconciliation and status |
|---:|---|---|
| 404 `Land Surveying` | Engineering/Environmental/Technology degree brochure, printed p. 336 catalogue; the programme table at printed p. 415 shows the exact `LAND SURVEYING` heading and institution codes ABU, ESUTECH, IMSU. | Primary evidence confirms an Engineering/Environmental/Technology occurrence. Parsed `engineering_offerings.json` includes ABU, ESUTECH, IMSU, **and RSU**; RSU is not in the primary row excerpt and is a likely neighboring-row parse spillover, pending visual table-boundary verification. Canonical row 404 maps to Environmental Sciences::Surveying and Geoinformatics. Keep the faculty discrepancy as an evidence lead, not a proven curriculum error; separately verify if the Environmental Sciences context has its own institution-specific occurrence. Official source: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf, pp. 336, 415; accessed 2026-09-24. |
| 406 `Fine Art/Fine and Applied Arts` | Arts brochure printed p. 130 lists this exact name under the Arts faculty catalogue. Engineering/Environmental/Technology brochure printed p. 336 separately lists `Fine Art` and `Fine and Applied Arts` under that faculty catalogue. | Confirmed multiple JAMB source-section/name contexts, not proof that all are identical offerings. Canonical mapping says Environmental Sciences; parsed Arts offering lists BENIN, CALABAR, DELSU, AEFUNA, IAUED, KWASU, LASUED, TASUED, UNN, DOU, LAGOS, PHC, LASU, FED-LAFIA, LCITY, WIGWE, DELSUT, ABSU. These institution arrays still need reconciliation to the exact Arts and Engineering programme-table rows; do not assign all 18 to the engineering entries or flatten to one curriculum. Official sources: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf, p. 130 and programme block locator still to verify; https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf, p. 336; accessed 2026-09-24. |
| 410 `Geography and Environmental Studies` | Arts brochure printed p. 130 lists the exact programme under Arts. | Canonical mapping says Environmental Sciences. Parsed Arts offering lists FED-KASHERE, FED-LAFIA, FED-LOKOJA, AEFUNA. The p. 130 catalogue confirms the Arts occurrence/name, but not these four institution associations; verify the programme table row before treating the list as canonical. Preserve any separate Environmental Sciences occurrence only if the original brochure establishes it. Official source: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf, p. 130 and programme block locator still to verify; accessed 2026-09-24. |
| 417 `Environmental Management and Technology` | Engineering/Environmental/Technology brochure p. 336 catalogue contains the similar but non-identical label `Environmental Management Technology` (without `and`). | Parsed Agriculture row is headed `ENVIRONMENTAL MANAGEMENT AND TOXICOLOGY`, with FUNAAB and KWASU in its institution array; this is yet another distinct wording. The exact canonical label, JAMB source occurrence, and institution list are not reconciled. Treat the wording/faculty divergence as a collision lead, not as proof that a JAMB programme or CCMAS component is absent. Do not use the parsed FUNAAB/KWASU association for `Environmental Management Technology` unless the exact table row proves it. Official source: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf, p. 336; accessed 2026-09-24. |
| 420 `Transport Planning and Management` | Education brochure p. 200 catalogue lists `Transport Planning and Management (TPM)` under Education. Social Sciences brochure p. 575 catalogue also lists `Transport Planning and Management`. | Two JAMB section contexts are evidenced; they must not be collapsed without institution rows. Canonical mapping currently says Administration and Management::Hospitality and Tourism Management; parsed Education offering lists TASUED. The official catalogue page does not itself verify TASUED's row association. Preserve Education and Social Sciences contexts separately while verifying each programme-table institution list and the CCMAS Transport Management/Transport Planning course evidence. Official sources: https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf, p. 200 and programme block locator still to verify; https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf, p. 575; accessed 2026-09-24. |

The primary brochure checks above confirm source-section/title leads only where stated. Institution arrays remain provisional unless tied to the actual course/degree awarding table row. No canonical map, scope, or seed was changed. The next audit step is to resolve the exact institution-cell boundaries for these five names from the JAMB PDF page images, then continue the 835-link course/outcome and downstream fit queue from row 281 / D130.

## Incremental review status snapshot (2026-09-24)

Independent recount of `_audit/jamb_curriculum_scopes_2026-08-17.json` gives 3,164 saved-scope domain-link occurrences and 1,333 with no JAMB-specific course-title locator: 727 in rows 1–140, 167 in rows 141–280, and 439 in rows 281–420. The active `jamb_domain_map.json` has 3,163 links; keep the one-link discrepancy visible until the Project Management scope-only D001 entry is reconciled. Locator presence is not outcome-level approval, and locator absence is not proof of no course evidence.

- Rows 1–140: the 19 zero-selected-course combined rows (294 link occurrences) have link-level component-candidate reviews in increments 001–005. The first 50/435 non-combined no-locator links are reviewed in increments 006–007. Their curriculum candidates are not selected JAMB courses; rebuild remains open. On this count, 385 non-combined no-locator occurrences remain in this tranche.
- Rows 141–280: all five empty combined rows (78 links) have component/outcome candidate review, but zero-selected-course status remains unresolved. The 89 non-combined no-locator queue has 50 reviewed in batches 001–002; 39 remain. Batch 002 reviewed three active-vs-saved type disagreements; exact JAMB scope/course confirmation and all downstream role fit remain open.
- Rows 281–420: four empty combined rows account for 48 links; the coordinator checkpoints now include targeted verified source-context batches for Geography (row321), rows 411–420, and several blended cases. The broad 439 no-locator links and all downstream subgroup/role fit are not complete.

These progress counts describe checkpoint coverage, not promotion-ready mapping. No student mapping or seed was changed as part of these audit batches.

### Agent 02 incremental status update — 2026-09-24

The earlier snapshot above records the state before batches 003–004. The 89-link non-combined missing-locator queue for rows 141–280 is now checkpointed in all four batches (25 + 25 + 25 + 14 = 89). Batch 003 covers rows 253–263 and now includes an official NUC CCMAS outcome check for Animal Science research: ANS 407 (printed p. 182) supports a bounded research-methods/ethics facet at full-programme level, but is absent from that D041 link's anchors; the generated scope's inclusion is not institution-specific JAMB-course proof. Batch 004 records the final 14 links beginning row 263/D041 and ending row 275/D152.

The 89-link queue is closed, but this does not close the 141–280 tranche. Its five combined scopes still have 78 links with zero selected JAMB courses; anchored course/outcome checks, source-faculty/institution reconciliation, active-vs-saved status differences, and downstream subgroup/role fit remain open. No canonical map, curriculum scope, seed, SQL, or UI was changed by this update.
