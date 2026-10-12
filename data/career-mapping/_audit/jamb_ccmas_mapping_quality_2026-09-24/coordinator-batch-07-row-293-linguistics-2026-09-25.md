# Coordinator continuation — Batch 7: Linguistics (row 293)

**Date:** 2026-09-25  
**Rows reviewed:** 293 (1-based `programme_mapping.json`)  
**Status:** JAMB context, CCMAS course/outcome alignment, six active domain links, and downstream fit review. Audit documentation only; no canonical mapping or seed edits.

**Scope snapshot:** The tracked-baseline saved scope had six row-293 links; the active map also has six, with three relationship-type disagreements. The current dirty worktree scope file has zero links for this row. I did not edit it. This review checks the active links against the full Linguistics CCMAS record and records the baseline comparison; do not treat the empty dirty-scope row as a reviewed resolution.

The generic downstream catalogues themselves have role-count inconsistencies for some linked domains: D130 declares 17 roles but its subgroup counts sum to 14 and `role_library_v3_cleaned.json` has 6 records; D065 reports 12 / 11 / 8; D064 reports 20 / 18 / 14. D043, D039 and D073 counts reconcile. These totals describe three distinct artifacts, not programme-approved paths; reconcile before claiming exhaustive role coverage.

## JAMB title and source offering context

`programme_mapping.json` treats Linguistics as one Arts and Humanities identity. The local Arts parser’s institution array is contaminated by adjacent headings and merged variants: it includes fragments such as `AFRICAN LANGUAGES`, `OTHER LANGUAGES`, `ARTS`, `ISLAMIC STUDIES`, `LINGUISTICS AND`, `NIGERIAN LANGUAGES`, `LANGUAGE`, `LITERATURE`, `COMMUNICATION`, `AFRICAN LANGUAGE`, and `LINGUISTICS /YORUBA`, mixed with institution codes. The official JAMB Arts brochure, printed p. 198, shows adjacent but distinct entries such as `Linguistics/Igbo`, `Linguistics and African Languages` (with language options), `Linguistics, Igbo and Other African Languages`, and plain Linguistics-related records. The one flattened institution list cannot establish which university offers which variant. Keep those source rows separate and re-extract each table row before attaching institution associations or curriculum components.

No exact Linguistics occurrence was found in the other eight local faculty offering files in this pass. That does not cure the Arts source-row contamination.

## CCMAS and source-record quality

The mapped Arts CCMAS `Linguistics` programme has 38 course records and contains genuine foundations in phonetics, sociolinguistics, applied linguistics, grammar, syntax, lexicography, corpus/digital linguistics, computational linguistics, forensic linguistics, language acquisition and a research project. It is a coherent component for the generic Linguistics identity, but the local course-outcome extraction has material contamination:

- `LIN 206: Language Business` is populated with peace/conflict and security outcomes (duplicated from `GST 312`), not language-business outcomes. The NUC Arts CCMAS specifies opportunity identification and language-service business development for LIN 206. Do not cite the current local LIN 206 text as evidence for conflict/security or employment.
- Several Linguistics courses have empty outcomes in the local JSON despite named, relevant courses; the primary NUC CCMAS is required to verify each such course before it is used as link evidence.
- `LIN 204: Language Pathologies, Dysfunction and Disabilities` concerns communication/speech/language disorders and professional ethics. That is not psychology/counselling qualification; it should not be stretched to that career domain.
- The complete course roster includes no dedicated translation-practice course or specified source/target language pair. General grammar, phonetics, applied linguistics, language business, and computational linguistics are not by themselves translation/interpreting practice.

This is a correction target for the source course transcription and its downstream evidence, not proof that Linguistics lacks curriculum. I did not modify the CCMAS JSON.

## Active-domain link review and downstream catalogue fit

There are six active links. The domain counts below refer to generic subgroup/role catalogues; they are not a Linguistics-specific approved role list.

| Domain | Baseline saved type → active type | Course and downstream fit |
|---|---|---|
| D130 Recruitment, Employment | functional → adjacent | Only current active course anchor is ENT 211 Entrepreneurship and Innovation. It supports recognizing opportunities and enterprise creation, not recruitment, employment counselling, talent acquisition, or recruiting-agency work. Domain catalogue has 6 role records (including employment agent, talent acquisition specialist, executive-search/recruitment consultant) within 6 subgroups / 17 declared slots. Active `adjacent` is more cautious than `functional`, but this course alone does not establish a Linguistics-to-recruitment path; keep the link unconfirmed unless relevant language/employment outcomes and an explicit bridge are supplied. |
| D043 Journalism | functional → functional | Anchors are GST 111 English communication and LIN 203 Grammar, LIN 302 Syntax, LIN 402 Syntactic Theories. These support language analysis and communication, not reporting, news gathering, editorial standards, media law, or journalism practice. The domain exposes 62 roles, including journalist, editor, correspondent, reporter, and many unrelated creative/media roles. The current functional link overstates the evidence; no confirmed Journalism role subset was found. |
| D065 Translation, Interpretation | direct → direct | The CCMAS supports language structure, applied linguistics, phonetics, sociolinguistics, corpus and computational linguistics. The reviewed course roster does not establish translation methods, interpreting practice, domain-specific translation, or a target/source language pair. D065 has 8 role records / 12 declared slots, including translator, interpreter, localiser, subtitler and lexicographer. A direct professional translation/interpreting path is not supported by the current generic Linguistics course set. Reclassify only after finding course-specific translation outcomes or provide explicit external learning steps; do not imply immediate job readiness. |
| D039 Higher Education | functional → adjacent | The sole anchor LIN 410 Project/Long Essay supports research design and a linguistic project. It does not qualify a student as a university lecturer, school leader, or teacher. The destination contains 121 roles / 2 subgroups (including 110 Lecturers & Vocational Teachers), many requiring subject specialization and teaching credentials. `Adjacent` is more plausible than `functional`, but this remains an education/research bridge, not a confirmed occupational route; restrict to academic research foundations unless further qualifications are specified. |
| D064 Psychology, Counselling | functional → adjacent | The link cites only FAC 202 `The Arts and other Disciplines`, a survey of cross-disciplinary relationships. LIN 204’s language-disorder content is not clinical psychology, counselling methods, or regulated mental-health preparation. The domain has 14 role records / 4 subgroups, including psychologist, counsellor, psychotherapist and clinical psychologist. Even `adjacent` is not a supported learner path from the cited courses; suppress from confirmed view absent substantive evidence. |
| D073 Library, Archive | adjacent → adjacent | Anchors FAC 301 Research Methods in the Arts, LIN 303 Lexicography and LIN 307 Digital/Corpus Linguistics. These may support lexicon/corpus research and language-documentation data practices, but do not establish library science, cataloguing, archival preservation, records management, or collection curation. Destination includes 15 roles across Curators & Archivists, Collection Handling Support and clerical work. No appropriate role-level route is established; any future bridge must be limited to linguistic-documentation/lexicography tasks and must not imply general librarian/archivist preparation. |

**Disposition:** none of the six currently published links is confirmed as an unqualified student occupational route from this course evidence. D065 is a plausible long-term pathway only with missing translation/interpreter study clearly identified; D039/D073 may be narrow adjacent research/documentation bridges if role-level scope is explicit. D130, D043 and D064 are unsupported as currently anchored. The links must not expose every generic role in their destinations as a Linguistics outcome.

## Count separation

- Tracked-baseline row 293: 6 saved links, with 3 active-vs-saved type disagreements: D130 (functional/adjacent), D039 (functional/adjacent), D064 (functional/adjacent). The other three labels agree.
- Current dirty worktree saved scope: 0 links for row 293; active map: 6 links.
- Tracked-baseline rows 281–420: **835 links**, **439 absent course-locator markers**, and **65 active-vs-saved relationship-label disagreements**. Current worktree scope recount: **451**, **107**, and **7**, respectively, while the active map remains 835. Keep these snapshots and measures distinct; the dirty scope changes remain unreviewed.
- Next systematic identity is row 294 `Kanuri`; previous checkpoints 288, 290, 291 and 292 remain intact.

## Sources checked (accessed 2026-09-25)

- JAMB, [Arts and Humanities degree brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf), printed p. 198: separate language-programme headings/options; source identity/context only.
- NUC, [Arts CCMAS (2023)](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), printed Arts p. 425 for LIN 206 `Language Business` and its course outcomes. The official outcomes identify language-business opportunities and developing/implementing ideas; these contradict the local peace/conflict payload.
- Local: `programme_mapping.json` row 293; `jamb/arts_hum_offerings.json`; `ccmas/arts.json` Linguistics; active `jamb_domain_map.json`; tracked-baseline/current `jamb_curriculum_scopes_2026-08-17.json`; `domain_structure.json` D130/D043/D065/D039/D064/D073; `role_library_v3_cleaned.json`.
