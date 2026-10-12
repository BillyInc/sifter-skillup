# Partition 02 — increment 033: rows 357–366 checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only evidence checkpoint. No shared mapping, curriculum scope, seed, SQL, UI, API, or taxonomy files were edited.

## Coverage and status

- Rows 357–366: 10 identities checked against current JAMB parsed occurrences, CCMAS scope, active map, domain/subgroup structure and role library. **0/10 fully closed** to the requested standard. All ten have `offering_row_verified_against_pdf=false` and no PDF table locator in the local inventory.
- All ten stored course scopes contain zero selected courses. Seven map rows are `review_required`; three (361–363) expose seven active downstream domain links each despite zero selected-course anchors. Rows 361 and 362 have identical seven-domain maps, although they are separate JAMB programme identities and their own university source contexts must be checked independently.
- Row 364 “Electrons” is an exact JAMB-listed identity associated with ZAMFARA, distinct from the separate “Electronics” programme and its BAYERO/NAUB/WESLEYUNI tokens. Do not silently correct/merge the name. The official JAMB parsed brochure result shows both identities in sequence.
- NUC announced a 2025 workshop to develop CCMAS for Parasitology and Entomology as a programme omitted/outstanding from the earlier set; that announcement is evidence of a curriculum gap at that time, not proof of the final approval or current curriculum status. The current Zoology component is not enough to infer complete parasitology/entomology scope.

## JAMB occurrence/context check

Official source: [JAMB Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf). Its search-extracted table visibly lists ELECTRONICS under BAYERO/NAUB/WESLEYUNI and separately ELECTRONS under ZAMFARA, followed by distinct physics/energy programme headings. The local inventory itself still lacks verified page/table locators for each occurrence, so institution sets remain parser leads pending the visual/source-locator reconciliation.

| Row | JAMB identity | Parsed occurrence / institution tokens | Disposition |
|---:|---|---|---|
| 357 | Parasitology and Entomology | Sciences; UNIZIK | Exact identity, school row unverified. Check whether NUC's announced new-programme CCMAS was finally approved and published before deciding that Zoology is sufficient. |
| 358 | BIOINFORMATICS | Sciences; CRAWFORD | Exact identity; do not equate a course called Bioinformatics within another degree with a complete Bioinformatics curriculum. |
| 359 | OPERATIONS RESEARCH | Sciences; MAUTY | Exact identity; do not equate a course in Operations Research in another programme with the whole degree. |
| 360 | BIOLOGICAL SCIENCE(S) | Sciences; 23 parsed institution tokens | Large parser list is unverified. It may encompass broad Biology offerings, but does not establish uniform institution-specific curriculum or scope. |
| 361 | Applied and Renewable Energy | Sciences; ADUN | Preserve distinct title and source context; exact local map has no course anchors. |
| 362 | Energy Studies | Sciences; SALEM | Distinct identity from 361; don't share the same path just because both map to Physics. |
| 363 | Energy and Petroleum Studies | Sciences; NOVENA | Exact identity; local proxy is Petroleum Chemistry, with no row-selected course evidence. |
| 364 | Electrons | Sciences; ZAMFARA | Official JAMB listing supports the exact spelling/identity, separate from Electronics. Do not “correct” it without institutional confirmation. |
| 365 | ELECTRONICS AND COMMUNICATIONS | Sciences; FOUNTAIN | Preserve exact combined title and test both electronics and communications/telecom curriculum coverage. |
| 366 | COMMUNICATIONS TECHNOLOGY | Sciences; OAUSTECH, NOUN | Distinct exact identity; check whether relevant offering means communications/telecommunications engineering, information technology, or another programme before mapping. |

## CCMAS scope and source review

Reference sources reviewed include NUC's [CCMAS collection](https://www.nuc.edu.ng/ccmas/), [Sciences CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Sciences-CCMAS-2023-FINAL.pdf), [Engineering and Technology CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf), and NUC's [2025 announcement of the 12 omitted/outstanding programmes](https://www.nuc.edu.ng/nuc-organises-workshop-to-incorporate-12-omitted-progs-in-ccmas/). The latter explicitly includes Parasitology and Entomology; it states that the resulting final drafts would still undergo review/approval.

| Row | Current component proxy; selected courses | Audit disposition |
|---:|---|---|
| 357 | Sciences::Zoology; zero selected courses. | Zoology shares biological subject matter, but does not by itself evidence the parasitology and entomology specialties, their applied diagnostic/ecological/field methods, or professional roles. Locate the eventual approved dedicated CCMAS or use authoritative external curriculum evidence; keep the current row held until then. |
| 358 | Sciences::Biotechnology; zero selected courses. | Biotechnology is a plausible adjacent foundation but not equivalent to computational biology. NUC Biology Education has a BIO 413 Bioinformatics course with databases, genomic/proteomic data and computer-based analysis, and engineering CCMAS has biomedical informatics content; these are item/course-level adjacent evidence, not a standalone Bioinformatics degree curriculum. Need a full, authoritative Bioinformatics curriculum scope and external enrichment before domain/role matching. |
| 359 | Sciences::Industrial Mathematics; zero selected courses. | Industrial Mathematics may supply mathematical foundations, but no selected course/outcome shows optimization, stochastic modelling, algorithms, simulation or decision science for this identity. Operations Research appearing as a course in another degree (e.g. building/SCM) is not a complete OR programme. Reconstruct from the actual JAMB offering and authoritative curriculum sources. |
| 360 | Sciences::Biology; zero selected courses. | The CCMAS Biology package exists, but no course list was selected for this JAMB row. A generic Biology component should not be expanded indiscriminately to every laboratory, conservation, biomedical or ecological specialization. Build a scoped course/outcome set first. |
| 361 | Sciences::Physics; zero selected courses; 7 active domains. | Physics alone is not evidence for renewable-energy-system design, installation, operation, economics or policy. No active link is course-anchored in this scope file. Treat the map as unsupported/held pending programme-specific evidence, not as “ready.” |
| 362 | Sciences::Physics; zero selected courses; 7 active domains identical to row 361. | Same issue as 361 plus suspicious identical link reuse across distinct programme identities. Confirm specific curriculum and differentiate required energy studies from renewable engineering, electrical installation, mechanical engineering, space technology and nanomaterials. |
| 363 | Sciences::Petroleum Chemistry; zero selected courses. | A chemistry/petroleum-related programme may support some petroleum-sector work, but there are no selected course/outcome anchors. Avoid mapping it to petroleum engineering, energy management or operational jobs by title alone. Need authoritative curriculum and role/task evidence. |
| 364 | Sciences::Physics with Electronics; zero selected courses. | Exact JAMB title “Electrons” is source-supported, but its intended programme content at ZAMFARA must be verified. Physics with Electronics could be a candidate bridge; do not assume it fully defines the course or that electronics occupations follow without course evidence. |
| 365 | Engineering::Electronic Engineering; zero selected courses. | Electronic engineering is a plausible base, but the name also includes Communications. Assess communication systems, signals, networks, RF/telecom content and actual role outcomes rather than silently treating this as electronic engineering only. |
| 366 | Engineering::Telecommunications Engineering; zero selected courses. | Telecom engineering is plausible but not yet proven as the right complete anchor for Communications Technology. Need offering-specific course evidence and distinct treatment from 365. |

## Existing map and downstream role audit

Current maps for 357–360 and 363–366 are fail-closed with zero links. No subgroup or role paths should be inferred until scope is rebuilt. The risks in the three active rows are:

| Row | Active domains | Descendant/task-level concern |
|---:|---|---|
| 361–362 | D016 Electrical Engineering; D019 Renewable Energy Engineering; D093 Electrical Installation/Wiring; D017 Mechanical Engineering; D041 Scientific Research; D059 Space Technology (adjacent); D155 Nanotechnology/Advanced Materials (adjacent). | This spans regulated engineering, electrical trades, research, aerospace/space, and materials. No selected course anchors support even a narrow subgroup in the current ledger. Physics fundamentals cannot promote electrical installer, mechanical engineer, renewable-energy engineer, astronaut/space, or nanomaterials roles. Exact outcomes and role work profiles are required. |
| 361–362 | Same exact seven links and tiers for two separate JAMB programmes. | The duplicate map likely reflects a reused broad Physics proxy, not independently verified evidence. Audit the specific degree and actual institution/course context separately; remove unsupported paths from student display. |

## Correction queue (no edits made)

1. Visually verify each JAMB source occurrence/table and add page/row locators; keep Electronics and Electrons separate.
2. Verify whether the new Parasitology and Entomology CCMAS announced in March/April 2025 was subsequently approved and published; do not treat a Zoology proxy as complete.
3. Build selected course/outcome scopes for all ten rows. For 358, 359, and 361–366, add authoritative external curriculum sources where CCMAS has no complete matching programme/specialization.
4. Re-evaluate rows 361/362 independently; replace the unsupported seven-domain physics proxy and identical path reuse with only evidenced required/optional routes.
5. For rows 365/366, check communications/telecom outcomes against exact subgroup/role competencies; do not inherit an entire engineering taxonomy from the course title.

**Disposition:** evidence checkpoint only. No link or curriculum scope was changed. Next tranche: rows 367–376.
