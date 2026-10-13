# Partition 02 — increment 026: rows 287–296 checkpoint

Recorded 2026-09-25 (Africa/Lagos). Append-only audit checkpoint; no shared canonical map/scope, SQL or seed edits.

## Coverage and status

- Sequential checkpoints span rows 217–296 (80/140 identities). Rows 287–296: 10/10 inventoried; full closure 0/10.
- Parsed source occurrences: 11 for 10 canonical identities because Economics (291) has four parsed source contexts and Mass Communication (296) has two. All parsed institution arrays remain leads, not verified university-offering evidence.
- Scope course rows: 174 across eight partial-scope identities; row 290 combined scope and rows 291/293 full inheritance have zero selected course rows.
- Candidate links: 31; active fail-closed map: 25; prior snapshot: 55. Full per-link descendant subgroup/role closure remains 0/31.
- `review_required`, zero active links: row 290 History and Strategic Studies; row 291 Economics; row 293 Linguistics. These need evidence reconciliation, not an assumption of unavailability.
- Exact source access is available. Original JAMB page/table geometry is still open except prior known leads. Continue rows 297–306.

## Occurrence inventory

| Row | Name | Occurrence / source/faculty | Token count | PDF source-offer proof |
|---:|---|---|---:|---|
| 287 | French and German/Russian | `4c04f3ba807ad77e`; Arts and Humanities / `arts_hum.txt` | 4 | Not verified |
| 288 | International Studies and | `5716ac737eed1885`; Arts and Humanities / `arts_hum.txt` | 84 | Existing coordinator/agent reports; exact association still needs source context reconciliation |
| 289 | History | `547f7dca67a1bdcb`; Arts and Humanities / `arts_hum.txt` | 75 | Not verified |
| 290 | History and Strategic Studies | `064b51428c2c9e9b`; Arts and Humanities / `arts_hum.txt` | 8 | Not verified |
| 291 | Economics | `88be6d2785db8861` Administration/7; `67da30400e4892b8` Arts and Humanities/21; `d1e5e227a51a3769` Engineering-Environmental-Technology/1; `180f5b6c4e406afa` Social/Management Sciences/192 | 221 total | Four parser contexts; distinct exact brochure tables and offering names must be confirmed separately |
| 292 | African and Asian Studies | `aefee42fd20d335b`; Arts and Humanities / `arts_hum.txt` | 6 | Not verified |
| 293 | Linguistics | `3b10d1ea1fa456ee`; Arts and Humanities / `arts_hum.txt` | 93 | Not verified |
| 294 | Kanuri | `e52e6885c3902545`; Arts and Humanities / `arts_hum.txt` | 3 | Not verified |
| 295 | Russian with French/German | `5b3ef2db301e0298`; Arts and Humanities / `arts_hum.txt` | 3 | Not verified |
| 296 | Mass Communication | `34536b465e9e8a8c` Administration/8; `a6b8c4e080161f30` Arts and Humanities/13 | 21 total | Two parser contexts; verify exact JAMB catalogue tables and source row boundaries |

Sources consulted (accessed 2026-09-25): JAMB Arts brochure `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf`; NUC CCMAS primary discipline documents under `https://www.nuc.edu.ng/ccmas/`, including Arts, Communication and Media Studies, and Social Sciences. Exact JAMB programme/institution printed-page cells are not confirmed in this increment. Existing row-specific records for 288/290/291 are preserved and should be reconciled, not redone: `coordinator-batch-03-row-288-international-studies-2026-09-25.md`, `coordinator-batch-04-row-290-history-strategic-2026-09-25.md`, `coordinator-batch-05-row-291-economics-2026-09-25.md`.

## Curriculum/link triage

- **287 French and German/Russian** — component references only French; 27 selected courses are French grammar/oral/writing/literature/translation. D065 Translation direct. The JAMB title names multiple languages, while selected component represents only French; confirm whether this is a combined/option label, which languages each institution offers, and whether corresponding German/Russian CCMAS component is needed. Do not presume one three-language degree.
- **288 International Studies and** — Social Sciences::International Relations; 23 courses across world system, African politics, diplomacy, international law, foreign policy, regionalism, human rights and project. D149 International Relations direct; D063 Economics, D045 Public Administration, D037 Legal Practice, D028 General Management functional. Core international relations fit is supported; functional roles need course/task and descendant checks. Prior dedicated source-context record remains authoritative lead; the title is truncated in canonical string and must be reconciled.
- **289 History** — Arts::History/History and Diplomatic Studies; 19 selected courses covering historical methods/eras, Nigerian/West African, religion, economic history, archaeology, digital history and internship. D039 Higher Education, D078 Social Sciences, D063 Economics, D152 Museum/Curation/Archives functional. Historical study supports research/interpretation, but not automatically teaching, economics or professional archival/museum positions; inspect descendants.
- **290 History and Strategic Studies** — two components: Arts History/History and Diplomatic Studies plus Social Sciences International Relations; zero courses, combined-scope review required, 0 active /15 prior links. This is a high-priority blended-title hold. Verify the JAMB offering and map a justified subset of both history and IR courses; do not treat a merged name as authorization for full union or restore prior links.
- **291 Economics** — Social Sciences::Economics, full inheritance but zero selected courses. Four parsed source occurrences across faculties are distinct leads, not four confirmed institutions/offerings. Current 0 active /13 prior links. Existing coordinator Economics reconciliation artifact should be joined before any curriculum or link decision; do not collapse distinct offering contexts. NUC Economics CCMAS is the primary package; zero selected rows do not imply no curriculum.
- **292 African and Asian Studies** — History/History and Diplomatic Studies component; 4 selected history courses (diaspora, slave trade, Islam/Christianity in West Africa, Nigerian nation-building). D039 Higher Education and D063 Economics functional. Four courses are thin for the combined regional title; verify curriculum breadth and distinguish a history pathway from language/culture/politics. No descendant path confirmed.
- **293 Linguistics** — Arts::Linguistics full inheritance, zero selected courses; 0 active /6 prior. NUC Linguistics CCMAS is a substantive package and courses appear in other rows; extract and validate full component before deciding any link. No active link is currently confirmed.
- **294 Kanuri** — Arts::Linguistics; 27 selected linguistics courses: grammar, sociolinguistics, phonetics/phonology, documentation, lexicography, digital/corpus and computational linguistics, language acquisition, forensic linguistics and project. D065 Translation direct; D043 Journalism functional; D073 Library/Archive adjacent. Language/translation and documentation are relevant study facets; journalism and archives need specific role-task support; computational linguistics is not generic data science.
- **295 Russian with French/German** — Russian CCMAS; 35 Russian courses, including language/oral/aural, grammar, literature, culture, applied linguistics and translation. D065 Translation direct, D043 Journalism functional. The name implies additional French/German routes not represented by Russian component; validate institutional options and map each language separately. Journalism fit remains candidate.
- **296 Mass Communication** — Communication and Media Studies::Mass Communication; 35 courses span media writing, photojournalism, online/investigative/data journalism, film production, digital marketing, reporting, research/statistics, media management/law/ethics, community/development communication and attachments. D043 Journalism and D042 Media Production direct; D030 Marketing functional; D168 Esports/Creator Economy adjacent. NUC CMS CCMAS identifies separate, unbundled programmes; the 35-course extracted Mass Communication contract is a distinct legacy/current identity requiring curriculum version checks. Journalism/media direct fits are plausible but downstream roles need their exact outcomes; “creator economy” is not inferred from ordinary online media/digital marketing.

## Map counts and open work

Current/prior links: 287 1/1; 288 5/5; 289 4/4; 290 0/15; 291 0/13; 292 2/2; 293 0/6; 294 3/4; 295 2/2; 296 4/4. No canonical edits. Each link remains a candidate until the exact programme source, learning outcome, tier, subgroup and role task are independently supported. Continue rows 297–306.

