# Partition 02 — increment 034: rows 367–376 checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only evidence checkpoint. No canonical map, course scope, seed, SQL, UI, API, or taxonomy file was edited.

## Coverage and status

- Rows 367–376: 10 identities checked against parsed JAMB occurrences, current CCMAS components/scopes, active domain links, and current subgroup/role descendants. **0/10 fully closed** to the requested standard. Every occurrence is unverified against its exact JAMB PDF table in the local inventory; no table locator is stored.
- Rows 367–370 are four distinct communication/telecom identities all mapped to the same Engineering::Telecommunications Engineering component, all with zero selected courses and zero active links. “Telecommunication Management” should not inherit an engineering-only scope or routes by title proximity; “Telecommunication Science” was among the new programmes NUC said in 2025 needed a new CCMAS, and current approval/source status needs confirmation.
- Rows 374–375 are distinct JAMB source-context occurrences for Anthropology (Sciences and Arts/Humanities), both parser-associated with IBADAN. JAMB's Social Sciences brochure also indexes Sociology and Anthropology. The Science Anthropology map is held on a Biology component; the Arts/Humanities Anthropology record uses custom CCMAS-independent evidence and exposes social-science/museum paths. Do not merge, expose or reject either until actual source tables and programme/curriculum context are reconciled.
- Row 376 canonical name is misspelled `ARCHEAOLOGY`; JAMB's official Arts brochure spells the standalone course **ARCHAEOLOGY** and lists ABU, IBADAN, JOS and UNN. The Sciences brochure index also carries OCR-like spelling `Archealology`. This is strong evidence of a source/normalization defect, but no canonical identity was edited.

## JAMB occurrence and context evidence

Official JAMB sources: [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), [Arts brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), and [Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf). Search extraction of the official Sciences brochure lists Anthropology, Archaeology-like spelling, Information Science, Communication Technology and multiple distinct telecommunications identities. The official Arts brochure lists **ARCHAEOLOGY** with ABU, IBADAN, JOS and UNN. The occurrence inventory remains marked unverified, so exact university associations must be captured with page/table locators before treating them as verified records.

| Row | JAMB identity | Parsed source context / tokens | Evidence/disposition |
|---:|---|---|---|
| 367 | COMMUNICATION AND WIRELESS TECHNOLOGY | Sciences; AUN | Keep separate from telecommunication-and-wireless and telecom science. Actual university table row unverified. |
| 368 | TELECOMMUNICATION AND WIRELESS TECHNOLOGY | Sciences; AUN | Distinct exact JAMB identity; same AUN token does not prove same degree as row 367. |
| 369 | TELECOMMUNICATION SCIENCE | Sciences; ILORIN | NUC announced Telecommunication Science among programmes needing new CCMAS development in 2025; locate approved final version/current source before using a proxy. |
| 370 | TELECOMMUNICATION MANAGEMENT | Sciences; CUAB | Must be distinguished from Telecom Engineering; management, business and technical curriculum may be different. |
| 371 | COMMUNICATION AND DIGITAL MEDIA STUDIES | Sciences; WIGWE | Candidate CCMAS Communication and Media Studies overlap, but exact composition may span more than the one selected Information and Media Studies programme. |
| 372 | INFORMATION SCIENCE | Sciences; UNIOSUN | Official JAMB Sciences table lists Information Science separately from Information and Media Studies, Information/Media Science, Library and Information Technology and related titles. Preserve distinctions. |
| 373 | NATURAL AND ENVIRONMENTAL SCIENCE | Sciences; AUN | Environmental Management component is only a title-level proxy until actual required course list is found. |
| 374 | ANTHROPOLOGY | Sciences; IBADAN | Separate Sciences occurrence, not validated as same as row 375; current map's Biology component is weak/unexplained. |
| 375 | Anthropology | Arts and Humanities; IBADAN | Separate occurrence; JAMB Social Sciences catalogue also lists Sociology and Anthropology. The current custom scope and routes require offering-specific review. |
| 376 | ARCHEAOLOGY | Sciences; IBADAN | Official Arts brochure supports corrected spelling Archaeology and lists four institutions; Science catalogue uses OCR-like `Archealology`. Local canonical spelling should be reconciled to the authoritative JAMB identity, preserving source locators. |

## CCMAS scope and outcome audit

Primary NUC references: [Communication and Media Studies CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Communication-and-Media-Studies-CCMAS-2023-FINAL.pdf), [Engineering and Technology CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), [Sciences CCMAS collection](https://www.nuc.edu.ng/ccmas/), and [Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf). NUC's [2025 announcement](https://www.nuc.edu.ng/nuc-organises-workshop-to-incorporate-12-omitted-progs-in-ccmas/) says the final drafts for 12 new/omitted programmes, including Telecommunication Science, would undergo further review/approval; this checkpoint found no approved Telecommunication Science CCMAS source to close that question.

| Row | Current component/scope | Course and mapping evidence |
|---:|---|---|
| 367–368 | Engineering::Telecommunications Engineering; zero selected course rows. | A telecom-engineering component may be a candidate foundation, but no scoped outcomes prove wireless/mobile networks, RF, signal processing, antenna systems or communications systems for these identities. Do not call the component a verified complete match or surface roles without evidence. |
| 369 | Engineering::Telecommunications Engineering; zero selected rows. | NUC's announced development status makes the proxy particularly unsafe. Find the final approved Telecommunication Science curriculum or use authoritative external programme curricula and keep the distinction visible. |
| 370 | Engineering::Telecommunications Engineering; zero selected rows. | The component does not establish management-specific learning such as telecom business models, operations, policy, regulation, service/product management or project/financial control. Candidate complementary Administration/Management content must be outcome-supported; don't force an engineering-only match. |
| 371 | Communication and Media Studies::Information and Media Studies; zero selected rows. | NUC offers distinct Information and Media Studies, Film and Multimedia, Journalism and Media Studies, Strategic Communication, and other programmes. The JAMB combined name could map to a particular mix, but the local single-component/no-course scope does not demonstrate it. |
| 372 | Computing::Information Systems; zero selected rows. | The label “Information Science” is not synonymous by default with “Information Systems.” JAMB separately lists library/information technology and information/media programmes. NUC coursework and actual UNIOSUN programme structure must determine whether Computing Information Systems, a library/information science curriculum, or external programme evidence is appropriate. |
| 373 | Environmental Sciences::Environmental Management; zero selected rows. | A broad natural-and-environmental science degree may combine biological, physical, earth, environmental or resource disciplines. The selected-course ledger is empty; environmental management alone is not demonstrated as the complete scope. |
| 374 | Sciences::Biology; zero selected rows. | Biology is not accepted as an Anthropology curriculum. NUC Arts Archaeology CCMAS contains ARC 106 Introduction to Anthropology as a course, but a course embedded in a different degree is only adjacent evidence—not proof of standalone Anthropology outcomes. |
| 375 | `__custom__::Anthropology`; 21 selected items from ANT and SOC course records, including Introduction to Anthropology, African institutions, symbolic/political anthropology, ethnography, social thought, heritage and culture. | This is stronger than title-only mapping, but the exact university/source programme evidence and every row's source authority need tracing. The mixture of ANT and SOC records should be attributed to actual curriculum/programme context, not treated as automatically interchangeable with either JAMB faculty occurrence. |
| 376 | Arts::Archaeology; zero selected rows. | Correct Arts CCMAS component exists, but scope is empty. NUC Arts CCMAS course outcome for ARC 105 Public Archaeology includes heritage/resource stewardship, public engagement, awareness, archaeo-tourism and application of archaeology; ARC 106 Intro to Anthropology is a supporting course. Rebuild the complete archaeological field/lab/heritage scope, not just these examples. |

## Active domain → subgroup → role check

Only rows 371, 372 and 375 have active links. Descendant structure was checked; none is approved as a complete student route here.

| Row | Active links | Subgroup/role findings |
|---:|---|---|
| 371 | D042 Media Production (direct), D030 Marketing and Brand Management (adjacent), D043 Journalism (functional), D168 Esports/Creator Economy (adjacent). | D042 contains creative production, stage/crew, camera/sound roles; D043 spans many journalism/writing roles; D030 contains general commercial managers; D168 has esports and creator operations/broadcast. With no selected course anchors, none may be treated as confirmed. Once scoped, media-production and communication tasks may be plausible; esports and generic marketing need a specific elective/optional evidence path. |
| 372 | D001 Software Engineering, D002 Data Engineering, D003 AI, D004 Cybersecurity, D007 UI/UX, D009 Data Science, D010 BI, D032 Project Management — all functional. | These domains span software engineering and development, data pipeline engineering, AI, cyber defence, user/product design, data science, business intelligence and project management. An Information Science title cannot support this eight-domain spread without course/outcome evidence. Keep these held from student requirements until a legitimate information-science curriculum and item-specific task links support selected roles. |
| 375 | D078 Social Sciences direct; D152 Museum Curation/Cultural Heritage/Archives functional. | D078 descendants include quantitative social science and broad social/economic research roles; the mapping should identify anthropology/ethnography roles, not present unrelated criminology/history/sociology jobs as one requirement. D152 includes curators/archivists, but only specific heritage and museum courses/outcomes support those roles. This route needs offering-specific curriculum evidence and exact role filtering. |

## Correction queue (no shared edits)

1. Reconcile the official JAMB page/table rows and institution lists for all ten identities; preserve separate course/faculty contexts.
2. Confirm final approved CCMAS availability for Telecommunication Science; rebuild telecom/wireless scopes separately from Telecom Management.
3. Rebuild scopes for rows 367–374 and 376. For Information Science, Natural and Environmental Science, and Communication and Digital Media Studies, determine whether the current CCMAS component is incomplete or external authoritative curriculum is required.
4. Reconcile Anthropology's Sciences and Arts/Humanities records, JAMB's Sociology and Anthropology context, the custom course scope, and the Sociology/Arts source curricula. Do not merge or discard a context from title resemblance.
5. Normalize row 376's spelling from source evidence in the appropriate canonical process; keep this checkpoint non-mutating.
6. Narrow row 371/372/375 downstream paths to source-supported subgroups and specific roles; current active labels overgeneralize.

**Disposition:** audit checkpoint only. No canonical name or mapping was changed. Next tranche: rows 377–386.
