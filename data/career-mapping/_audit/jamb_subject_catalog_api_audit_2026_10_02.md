# JAMB Subject Catalogue and API Audit — 2026-10-02

Status: catalogue/API implementation and scoped tests are complete for this
pass; the full subject-rule source audit is still open. Live deployment is not
claimed. Scope is the subject catalogue, subject parsing, and the student
subject-list API only. No JAMB university-offering ledger, CCMAS JSON, or
manual lookup document is in scope.

## Baseline inventory

- `backend/seed_subject_catalog.sql` currently seeds 46 canonical subject rows.
- Its UTME layer is maintained separately in
  `data/career-mapping/_parse_subject_options.py` (`UTME_CODES`); O'Level has a
  larger set (`OLEVEL_CODES`). This duplication creates drift risk between the
  catalogue's `exam_types` and the parser's allow-lists.
- `GET /api/student/subjects` in `backend/routes/student_pipeline_routes.py`
  filters by `exam_types` when `exam_type` is supplied and orders by stream,
  but does not hide valid subjects for the selected stream. The response
  includes `category` and `streamTags`, but omits `examTypes`.
- `src/lib/careerData.ts` models this endpoint as a flat `SubjectCatalogItem[]`;
  adding a field is backward-compatible. Existing stream selection is a
  relevance/order hint, not an eligibility filter.
- Existing regression tests cover exam-layer filtering and stream ordering in
  `backend/tests/test_student_pipeline_match.py`; seed/parser checks are in
  `backend/tests/test_subject_option_seed.py` and
  `backend/tests/test_subject_option_parser.py`.

## Source comparison (accessed 2026-10-02)

The current public JAMB IBASS Eligibility Checker exposes O'Level and UTME
subject selectors; its live rendered page says English Language is selected by
default for UTME. JAMB's public IBASS faculty brochures also explicitly name
additional subjects as valid UTME alternatives in programme-specific rules.
The official IBASS Sciences brochure's chemistry UTME requirements for AUN
explicitly list Further Mathematics, Environmental Science, Technical
Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and
French among acceptable alternatives (printed p. 509). This confirms that
Further Mathematics, Environmental Science, Technical Drawing, Information
Technology, and Civic Education need UTME representation; Visual Arts and
French already resolve to existing catalogue rows. The same brochure's
O'Level requirements for AUN name Environmental Science and Information
Technology among eligible subjects (printed p. 509), so both need O'Level
representation too.

The official IBASS Education brochure's Lagos programme-specific UTME rule
allows one subject from Mathematics, Physics, Food and Nutrition, Home
Management, Clothing and Textile, Garment Making, Dyeing and Bleaching, and
Catering Craft Practice (printed p. 312). The catalogue already represents
Mathematics, Physics, and Home Management (as a Home Economics alias); Food
and Nutrition, Garment Making/Clothing and Textile/Dyeing and Bleaching, and
Catering Craft Practice exist only in the O'Level layer and need UTME support.
These are source-supported options for relevant programme rules, not universal
requirements.

Health Science appears in official IBASS O'Level qualification/credit
requirements for Health Education (Education brochure, printed p. 284), not in
the cited UTME alternative lists. It will remain O'Level-only; the earlier
candidate scan does not justify promoting it to UTME.

### Claim-to-source log

| Claim used in this pass | Exact source and locator | Accessed |
| --- | --- | --- |
| IBASS exposes O'Level/UTME eligibility checking; English Language is shown as the default UTME subject | [IBASS Eligibility Checker](https://eligibility.jamb.gov.ng/), live checker page; selector is dynamically rendered | 2026-10-02 |
| Additional subject alternatives include Further Mathematics, Environmental Science, Technical Drawing, Visual Arts, Computer Studies, Information Technology, Civics, and French; the cited AUN O'Level rule includes Environmental Science and Information Technology | [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf), printed p. 509, AUN chemistry/subject requirement cells | 2026-10-02 |
| Food and Nutrition, Home Management, Clothing and Textile, Garment Making, Dyeing and Bleaching, and Catering Craft Practice are UTME alternatives in the cited programme rule | [IBASS Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf), printed p. 312, Lagos programme subject requirement cell | 2026-10-02 |
| Health Science appears in the cited O'Level requirement, not the cited UTME alternatives | [IBASS Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf), printed p. 284, Health Education O'Level cell; compared with printed p. 312 UTME cell | 2026-10-02 |
| Engineering brochure corroboration for the cited AUN subject alternatives | [IBASS Engineering brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf), AUN chemistry subject requirement cell; used as corroboration, not as a universal subject list | 2026-10-02 |

These are programme/institution-specific eligibility examples. They support
catalogue recognition and parsing, not a claim that every listed subject is
required or eligible for every JAMB programme. The checker’s dynamically
rendered complete selector values were not independently enumerated in this
pass; do not treat the sources above as proof that every possible selector
choice has been exhaustively matched.

Subject classification is a product stream grouping, not a JAMB admission
rule. The API preserves the existing `art` wire value and old flat response,
accepts `arts` as a request alias, and additionally returns user-facing
`streams` (`arts`, `science`, and/or `commercial`) and `examTypes`. Stream tags
remain relevance/order metadata, never an eligibility filter.

## Implemented corrections

The catalogue now has 48 canonical rows: all 48 are O'Level choices and 33
have UTME support. Two distinct canonical rows were added because the official
brochure lists them as separate alternatives from Computer Studies:

| Code | Student label | O'Level | UTME | Stream grouping |
| --- | --- | --- | --- | --- |
| ENVS | Environmental Science | Yes | Yes | Science |
| IT | Information Technology | Yes | Yes | Science, Commercial |

Eight existing rows gained UTME eligibility from explicit programme-specific
IBASS UTME alternatives: Civic Education (`CIV`), Further Mathematics
(`FMATH`), Food and Nutrition (`FSN`), Garment Making (`GMT`, including
Clothing/Textile and Dyeing/Bleaching variants), Catering Craft Practice
(`CAT`), Technical Drawing (`TD`), Environmental Science (`ENVS`), and
Information Technology (`IT`). These choices do not become universal
requirements; individual programme rules still determine whether they apply.
Home Management already resolves to Home Economics (`HEC`); Visual Arts and
French already resolve to their existing canonical rows. Health Science
remains O'Level-only because its checked evidence is an O'Level rule.

The catalogue no longer treats the combined strings `Yoruba/Hausa/Igbo` and
`CRS/IRS` as aliases for a single language/religion subject. They are
alternatives, so they now resolve as one-of groups. The parser now preserves
multiword catalog labels containing “and” while splitting source subject
lists, and accepts the named alternatives added above. The generated subject
option seed and typed subject-rule seed were regenerated in documented order.

The endpoint keeps returning a list, so existing clients remain compatible;
it adds `examTypes` and a normalized `streams` field. Search now also matches
catalogue aliases (for example, searching “Civics” finds Civic Education).

## Verification

- Current local source inventory: 420 canonical JAMB programme records; 390
  have UTME subject cells, representing 175 distinct raw UTME strings. The
  option generator reports 377 structured UTME records (including 8 safe
  “as in” references), 166 structured O'Level records, 221 requirement rows
  still needing source-text review, and 1 empty requirement row. Those review
  rows are not missing catalogue subjects by themselves and were not promoted
  by guessing.
- Catalogue consistency: SQL seed has 48 rows, 33 UTME memberships and 48
  O'Level memberships; parser allow-lists match those counts. No duplicate
  canonical subject names or cross-code alias collisions were found.
- `python data/career-mapping/_parse_subject_options.py`: passed; generated
  543 subject-option records from the current 420-programme source set.
- `python data/career-mapping/_gen_subject_rule_records.py`: passed; generated
  1,260 typed rule rows (640 matchable, 170 structured-source, 2
  cross-reference, 420 direct-entry, 28 source-missing).
- `python data/career-mapping/_audit_subject_option_seed.py`: passed; 543
  options and 1,977 represented subject slots/groups.
- `python -m pytest tests/test_subject_option_seed.py
  tests/test_subject_option_parser.py tests/test_student_pipeline_match.py -q`
  (run from `backend/`): 42 passed. Pytest emitted one cache-write warning
  because the workspace cache directory is access-restricted; test results
  were successful.
- No Supabase SQL was applied. The updated SQL files are local generated
  artifacts only.

## Resumable checkpoint

Task/range: subject-catalogue and student subject API lane; compared the
canonical catalogue and parsed subject-rule inputs across all 420 canonical
JAMB identities. This is not the separate university-offering-occurrence lane.

| Checkpoint stage | Verified/corrected | Unresolved at checkpoint |
| --- | --- | --- |
| Baseline inventory | 46 original catalogue rows; 420 JAMB identities; 390 with UTME cells; 175 distinct raw UTME strings | Dynamic IBASS selector’s complete option inventory not independently extracted |
| Source comparison and catalogue repair | 48 canonical rows now represented; 2 distinct canonical subjects added; 8 existing subjects gained source-backed UTME eligibility; 2 false composite aliases removed; listed alternatives retained as separate choices | 221 parsed requirement rows still `needs_review`; 1 requirement row empty; generated typed rules include 28 `source_missing` rows. Buckets may overlap other generated rule statuses; do not add them as a unique-record total. |
| Parser, API and seed implementation | 543 generated subject-option records; 1,260 generated typed rules; endpoint preserves the flat response and legacy `art`/`streamTags`, adds `examTypes`/normalized `streams`, and alias-aware `q` | These counts do not establish that each unresolved requirement row has been source-verified or that the live database has been updated |
| Scoped test pass | 42 tests passed | One non-failing pytest cache warning; no live SQL/API deployment verification |

Last completed item IDs: catalogue codes `ENVS` and `IT` were added; existing
UTME eligibility updates were applied to `CIV`, `FMATH`, `FSN`, `GMT`, `CAT`,
`TD`, `ENVS`, and `IT`. Requirement rows are keyed in the local parsed JAMB
rule data rather than sequential IDs; the remaining rows must be enumerated
by their canonical JAMB identity and source-rule key before closing the audit.

Files changed in this lane:

- `backend/seed_subject_catalog.sql`
- `backend/seed_subject_options.sql` (generated)
- `backend/seed_subject_rule_records.sql` (generated)
- `backend/routes/student_pipeline_routes.py`
- `backend/tests/test_subject_option_seed.py`
- `backend/tests/test_student_pipeline_match.py`
- `data/career-mapping/_parse_subject_options.py`
- `src/lib/careerData.ts`
- `data/career-mapping/_audit/jamb_subject_catalog_api_audit_2026_10_02.md`

Precise next action: generate an append-only list of the 221 `needs_review`,
1 empty, and 28 `source_missing` subject-rule rows, deduplicated by canonical
JAMB identity plus rule key; compare those records with the current official
IBASS checker/brochure sources, correct only source-supported parsing or
catalogue gaps, and update this checkpoint before a long source review or any
change. Do not change JAMB university-offering ledgers, CCMAS files, or apply
SQL. Keep every unresolved row explicitly listed; the subject lane remains
open until that queue has been reconciled and rerun through generation,
consistency audits, and tests.

### Resume checkpoint — 2026-10-02

- Task/range: reopen subject/API audit; first inventory all parser
  `needs_review` identities, the single empty source identity, and the 28
  typed-rule `source_missing` rows.
- Last completed items: prior code/rule additions remain `ENVS`, `IT`, `CIV`,
  `FMATH`, `FSN`, `GMT`, `CAT`, `TD`; no new source rows reviewed in this
  resumed pass.
- Counts at resume: 221 needs-review programme rows, 1 empty programme row,
  28 source-missing typed exam-rule rows (different units; may overlap); 0
  additional corrections in this resumed pass.
- In-repo evidence: `jamb_brochure_source_rules_2026-08-19.json` declares
  1,260 layers, 2,721 source variants (991 exact, 1,710 inherited shared, 17
  source-blank, 3 source-missing), with brochure filename, PDF page, table row
  and course-cell text provenance.
- Refreshed sources (accessed 2026-10-02): IBASS Eligibility Checker
  `https://eligibility.jamb.gov.ng/`; JAMB CAPS & IBASS manual
  `https://www.jamb.gov.ng/Speeches-Presentation/CAPS_and_IBASS_manuals.pdf`;
  IBASS Social Sciences brochure
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`.
  The manual confirms institution-configured required/optional alternatives
  and English default; the checker confirms English-default behavior. The
  brochure shows alternatives are programme/institution-specific, not a
  universal catalogue requirement list.
- Files changed in resumed pass: checkpoint only so far. Tests not rerun; the
  earlier 42-pass result remains the last result.
- Next exact action: produce an append-only row-level JSON queue with canonical
  identity, exam layer, source text, parser disposition, and available source
  locators; group unresolved cases by repeated parse-failure pattern, then
  save another checkpoint before any catalogue/parser correction.

### Resume checkpoint 2 — queue itemization saved (2026-10-02)

- Task/range: all 420 canonical programme subject requirement inputs.
- Last completed item IDs: full unresolved queue generated. Parser review
  identities: 221, with 201 O'Level failed layers and 40 UTME failed layers
  (some identities fail both). Empty UTME+O'Level requirement identity: 1.
  Typed `source_missing`: 28, all O'Level rule rows.
- Verified/corrected/unresolved: row-level inventory verified 221/221 review
  identities, 1/1 empty identity, and 28/28 source-missing rows; no rows
  corrected in this step; all inventoried unresolved pending source research.
- Exact IDs/text/status/source-variant locators: saved in
  `jamb_subject_unresolved_subject_rule_queue_2026_10_02.json`, generated by
  `build_jamb_subject_unresolved_queue_2026_10_02.py`. This is the complete
  itemization; the JSON preserves duplicate programme identities across
  exam-layer lists rather than falsely summing different queue units.
- Source URLs/access date for claims in this inventory: in-repo source ledger
  `jamb_brochure_source_rules_2026-08-19.json` (its exact source PDF file,
  printed PDF page, table row and cell text are copied per variant into the
  queue); IBASS checker `https://eligibility.jamb.gov.ng/`, JAMB IBASS manual
  `https://www.jamb.gov.ng/Speeches-Presentation/CAPS_and_IBASS_manuals.pdf`,
  and Social Sciences brochure
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`
  (all web-checked 2026-10-02). These confirm source/rule principles, not the
  content of every queued requirement.
- Files changed: this checkpoint; new read-only queue builder
  `build_jamb_subject_unresolved_queue_2026_10_02.py`; generated queue JSON
  `jamb_subject_unresolved_subject_rule_queue_2026_10_02.json`.
- Tests: none rerun; previous scoped result is 42 passed.
- Next exact action: source-check the 28 empty O'Level rows in small groups of
  three to five identities against exact JAMB/IBASS rule records and the
  specific source variants in the queue; checkpoint each completed group.
  First group: Biology/Biotechnology, Building Technology, Computer and
  Information Science, Crop Science, Data Science. Do not borrow another
  programme's requirements or use unrelated university pages as canonical
  JAMB evidence.

### Resume checkpoint 3 — empty O'Level rows 1–5 reviewed (2026-10-02)

- Task/range: first five of 28 typed O'Level `source_missing` identities:
  `Biology/Biotechnology`, `Building Technology`, `Computer and Information
  Science`, `Crop Science`, `Data Science`.
- Last completed IDs: the five identities above; exact local source variants
  are also preserved in the unresolved queue JSON by filename, printed PDF
  page, table row, course-cell text, and source text.
- Verified/corrected/unresolved: local JAMB source-variant evidence reviewed
  for 5/5. No catalogue or requirement corrections made. 5/5 remain unresolved
  because evidence is absent or conflicts across programme/institution
  contexts; no requirement was inferred from a similar title.
- Findings/source locators (local ledger maps these filenames to JAMB IBASS
  official brochure URLs):
  - Biology/Biotechnology: 0 source rows in
    `jamb_brochure_source_rules_2026-08-19.json`; source absent in the current
    in-repo brochure extraction.
  - Building Technology: 6 variants: Sciences.pdf p.94 row 4; Engineering _
    Enviromental _ Technology.pdf p.12 row 4; Education.pdf pp.97, 104, 105,
    214 row 1. These span distinct institution groups and contain divergent
    requirement text; no single national rule is supported by these mixed
    cells.
  - Computer and Information Science: 0 requirement-cell source rows in the
    local source ledger. Engineering/Environmental/Technology brochure p.336
    lists the programme title in an index/list but supplies no requirement
    cell there; title presence alone cannot fill O'Level rules.
  - Crop Science: Agriculture.pdf pp.2, 3, 7, 11 row 3 repeat the general
    Agriculture requirement for institution/options groups; p.44 row 3 has a
    distinct Crop Science-specific rule and cross-reference. These are not
    one uniform requirement for the aggregated canonical identity.
  - Data Science: Sciences.pdf p.100 row 3 has an inherited shared requirement
    for a multi-institution row; Engineering _ Enviromental _ Technology.pdf
    p.136 row 3 includes Data Science inside a broader multi-programme cell
    with different requirement text. Keep held until offering scope can
    disambiguate; do not merge the alternatives as one student's rule.
- Web checks, accessed 2026-10-02: [IBASS Engineering/Environmental/Technology
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf),
  printed pp.12 and 336; [IBASS Sciences
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
  printed pp.94 and 100; [IBASS Agriculture
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf),
  printed pp.2–3 and 7, 11, 44. Web search excerpts support the Building
  Technology cells and the Data Science/Crop Science table contexts, not a
  universal requirement. The local source ledger supplies the printed-page
  row/cell provenance.
- Files changed: checkpoint only since queue generation. No API/catalogue
  edits. Tests not rerun.
- Next exact action: review empty O'Level rows 6–10:
  `Environmental Science and Technology`, `Forestry and Fisheries`, `French
  and German/Russian`, `Geography`, and `Geography and Environmental
  Management`; inspect all exact/inherited source variants, then checkpoint
  their decisions before moving on.

### Resume checkpoint 4 — empty O'Level rows 6–10 reviewed (2026-10-02)

- Task/range: `Environmental Science and Technology`, `Forestry and
  Fisheries`, `French and German/Russian`, `Geography`, and `Geography and
  Environmental Management`.
- Last completed IDs: all five identities checked against local source rows
  and targeted JAMB IBASS web searches.
- Verified/corrected/unresolved: source inventory reviewed 5/5; no safe
  canonical requirement correction; 5/5 remain unresolved (no source row,
  explicitly blank/inherited cell, or competing context variants).
- Row findings:
  - Environmental Science and Technology: no exact requirement source row in
    the repository's JAMB source ledger; exact-title web query did not return
    a supporting JAMB requirements cell. Remain unresolved.
  - Forestry and Fisheries: Agriculture.pdf p.1 row 42 is status
    `source_missing` with a course-cell title but no requirement text. Related
    broad agriculture/forestry wording does not establish this combined
    programme's actual exact requirement. Remain unresolved.
  - French and German/Russian: official [IBASS Arts brochure]
    (https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf),
    printed p.130, lists the programme title, but no exact O'Level requirement
    cell was identified. Do not borrow French or German standalone rules.
  - Geography: source variants include Arts _ Humanities.pdf p.121 row 5,
    Engineering _ Enviromental _ Technology.pdf p.106 row 4, and multiple
    Education.pdf rows (119, 141–147, 176, 185–186, 196), with requirement
    text varying by faculty/programme offering; no single common rule is
    justified for the aggregated identity.
  - Geography and Environmental Management: Sciences.pdf p.91 row 3 gives
    “English Language, Mathematics, Geography and any other two (2) Science
    subjects”; Social Management Science.pdf p.54 row 1 has a different
    Arts/Social Science subject rule for named institutions. Preserve as a
    context conflict rather than OR-combining them into one national rule.
- Web sources, accessed 2026-10-02: [IBASS Arts brochure]
  (https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf),
  printed p.130; [IBASS Agriculture brochure]
  (https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf),
  printed p.1; [IBASS Sciences brochure]
  (https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
  printed p.91; [IBASS Engineering/Environmental/Technology brochure]
  (https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf),
  printed p.106; and [IBASS Social Sciences brochure]
  (https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf),
  printed p.54. The latter PDF links are source destinations recorded in the
  repo's brochure ledger for the matching original source filenames. The
  web-search extract corroborated Arts programme inventory and Geography
  criteria snippets; per-offering variants remain more precise than broad
  programme-name web snippets.
- Files changed: checkpoint only; no catalogue/parser/API change and no tests
  rerun.
- Next exact action: review the next five source-missing identities from the
  queue: `Geology and Mining`, `Geophysics`, `German`, `HOME SCIENCE`, and
  `Horticulture`; inspect their exact source cells and search official JAMB
  sources, then save the group assessment before proceeding.

### Resume checkpoint 5 — empty O'Level rows 11–15 reviewed (2026-10-02)

- Task/range: `Geology and Mining`, `Geophysics`, `German`, `HOME SCIENCE`,
  `Horticulture`.
- Last completed IDs: all five source-missing rows checked against local exact
  and inherited source-cell variants and targeted official IBASS searches.
- Verified/corrected/unresolved: 5/5 source records reviewed; one direct
  source-backed O'Level correction identified for Horticulture and queued for
  application; 4/5 remain context-ambiguous or variant-conflicted; no code or
  catalogue edits made yet.
- Findings:
  - Geology and Mining: Sciences.pdf p.83 row 3 is inherited/shared across a
    broad multi-programme cell; Engineering _ Enviromental _ Technology.pdf
    p.74 row 3 is a different exact institution group and qualification
    wording. The official [Engineering/Environmental/Technology IBASS
    brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf)
    confirms institution-specific exceptions; do not merge into one universal
    O'Level option.
  - Geophysics: variants at Sciences.pdf pp.27, 45, 81, 83 and 153 contain
    multiple named programmes, institution-specific groups and differing
    requirements. The official [Sciences IBASS
    brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
    printed p.587, confirms a separate Geophysics offering block, but not that
    every variant is one national rule.
  - German: Arts _ Humanities.pdf p.84 row 5 gives the exact standalone
    `GERMAN IBADAN LAGOS OAU` O'Level cell; pp.48, 85, and 120 include German
    inside other combined/modern-language contexts. Since the canonical
    identity aggregates standalone and combined-title contexts, do not
    overwrite it with the standalone cell without an offering-scope key. The
    official [Arts IBASS brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf)
    includes German and combined language programmes as distinct titles.
  - HOME SCIENCE: Sciences.pdf p.231 row 3 and Agriculture.pdf p.74 row 3
    have institution-context cells with differing subject lists/extra pass
    conditions. No single requirement established.
  - Horticulture: Agriculture.pdf p.76 row 4 is an exact row naming
    `HORTICULTURE: FUNAAB MINNA`; the base O'Level cell states five credits
    including English Language, Chemistry, Mathematics, Biology or
    Agricultural Science. MINNA/FUNAAB-specific extra details are in the
    waiver cell and will not be promoted into the shared base rule. This is a
    direct source-backed correction candidate; parser currently does not
    structure the exact wording and must retain it as source text/review until
    a safe alternative/count representation is verified.
- Web source/access date: [IBASS Agriculture
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf),
  printed p.141 (Horticulture base requirement and campus-specific waivers);
  [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
  printed p.587 (Geophysics context); [IBASS Arts
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf),
  printed p.130 (official programme-title inventory). Accessed 2026-10-02.
  Exact variant filenames and cell locators remain in the JSON queue.
- Files changed: checkpoint only; tests not rerun.
- Next exact action: add Horticulture's exact base O'Level text to the
  subject-only `brochure_subject_overrides.json` with its Agriculture.pdf
  locator; update the row-level queue/checkpoint to record source-filled but
  matcher-review status. Then run only parser/generator audits needed to
  confirm exact counts before moving to the next 5 identities.

### Resume checkpoint 6 — next five identities opened (2026-10-02)

- Task/range: queue positions 16–20 after the already reviewed Horticulture
  row: `Hotel Management & Tourism`, `INFORMATION AND MEDIA TECHNOLOGY`,
  `Industral Mathematics/Computer` (spelling retained from the canonical
  identity), `International Studies and Diplomacy`, and `Linguistics`.
- Last completed IDs: previous five identities Geology and Mining through
  Horticulture remain reviewed; no further source decision has been made yet
  for this group.
- Verified/corrected/unresolved: 0/5 assessed in this tranche at checkpoint
  start; all five remain pending. Overall unresolved totals are unchanged
  until this group is source-checked: 221 needs-review identities, 1 empty
  identity, 28 typed source-missing O'Level rows.
- Files changed: checkpoint only. Tests not rerun.
- Next exact action: inspect all source variants and current JAMB/IBASS
  official material for these five identities, preserve exact programme and
  institution contexts, then save a group outcome here before moving on.

### Resume checkpoint 7 — source-missing rows 16–20 reviewed (2026-10-02)

- Task/range: `Hotel Management & Tourism`, `INFORMATION AND MEDIA
  TECHNOLOGY`, `Industral Mathematics/Computer`, `International Studies and
  Diplomacy`, `Linguistics`.
- Last completed IDs: all five checked against the local latest JAMB offering
  inputs/enrich overlays, source-variant ledger, and official JAMB IBASS
  brochure searches.
- Verified/corrected/unresolved: 5/5 researched; 0 canonical global subject
  rules promoted; 5/5 remain unresolved at the canonical programme layer
  because identified evidence is university/programme-context-specific or
  the local source ledger has no matching requirement cell. One new verified
  university-specific O'Level candidate was found for Information and Media
  Technology (MINNA) and is documented below; it is not written into the
  identity-wide canonical rule.
- Row outcomes and exact source scope:
  - Hotel Management & Tourism: local Agriculture.pdf row is blank for base
    O'Level. JAMB Social Sciences PDF p.653 lists Hotel Management and Tourism
    for ATIBA/ELIZADE with five credits including English, Geography and any
    three Arts/Social Science subjects plus an O'Level Mathematics pass.
    JAMB Agriculture PDF p.137 lists a different institution group
    (BIU/FED-WUKARI/GREGORY/UMUDIKE/UNI-AFRICA/WESLEYUNI) and a UMUDIKE-only
    requirement in its waiver. These are not one shared rule.
  - INFORMATION AND MEDIA TECHNOLOGY: current local canonical offering is
    MINNA. JAMB Engineering PDF p.456 has a MINNA-specific O'Level rule: five
    credits in English, Mathematics, Physics and two other relevant Science
    subjects. This verifies a contextual candidate, not an identity-wide
    requirement. Keep pending until subject API has a supported institution
    context for this rule.
  - Industral Mathematics/Computer: local identity is EBSU; no exact source
    variant was found for that spelling/title. Official Sciences PDF p.493
    includes the distinct titles “Industrial Mathematics and Computer
    Science” (Redeemer's), “Industrial Mathematics/Applied Statistics”
    (ESUTECH), and an EBSU Applied Statistics row. These do not prove the
    EBSU offering is the canonical typo-title; do not merge them.
  - International Studies and Diplomacy: source cells conflict by identity
    and institution: Arts _ Humanities.pdf p.69 row 3 (Benin/BIU group),
    Administration.pdf p.35 row 4 (KASU), and Social Management Science.pdf
    p.116 row 1 (Benin and a multi-programme Social Science cell) differ in
    required subjects. Keep as offering-specific variants; no universal rule.
  - Linguistics: local identity aggregates many schools and combined-language
    variants. Arts PDF p.205 row 4 has a standalone AAUA/ABUAD/ABUJA/etc. cell
    with English as the only named O'Level inclusion; other cells in the local
    source ledger cover Linguistics/Arabic, /Edo, /English, /French, /Hausa,
    /Igbo and other combined programmes with different requirements. Do not
    broaden the standalone rule to every combined identity.
- Exact primary URLs/access date: [JAMB IBASS Agriculture
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf)
  pp.137; [JAMB IBASS Social Sciences
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf)
  p.653; [JAMB IBASS Engineering/Environmental/Technology
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf)
  p.456; [JAMB IBASS Sciences
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf)
  p.493; [JAMB IBASS Administration
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf)
  p.35; [JAMB IBASS Arts
  brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf)
  pp.69 and 205. All accessed 2026-10-02. The local source ledger retains
  printed page/table-row/course-cell locators for its extracted source rows.
- Files changed: checkpoint only; no catalogue/parser/API edits. Tests not
  rerun.
- Next exact action: continue with the next five source-missing rows after
  Linguistics: `Literature in English`, `METEOROLOGY AND CLIMATE CHANGE`,
  `Marine Science and Technology`, `Physical Sciences (with options in i.
  Industrial Physics, ii. Physics with Electronics)`, and `Physics with
  Computational Modeling`. Keep the Horticulture base-text correction
  identified in checkpoint 5 pending; do not mark it applied.

Initial primary sources consulted:

- JAMB IBASS Eligibility Checker: https://eligibility.jamb.gov.ng/
- JAMB IBASS Education brochure:
  https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf
- JAMB IBASS Sciences brochure:
  https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf
- JAMB IBASS Engineering/Environmental/Technology brochure:
  https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf

The brochures are the currently published public IBASS brochure URLs found in
the search. They contain programme/institution-specific wording, so additions
will be qualified as valid options for the source-supported pathways rather
than universal requirements.

## Checkpoint log

- 2026-10-02: checkpoint 1 — baseline catalogue/API inventory recorded.
- 2026-10-02: checkpoint 2 — comparison of source-supported subject
  alternatives recorded; catalogue/parser changes and generated artifacts
  saved.
- 2026-10-02: checkpoint 3 — API compatibility changes and regression tests
  saved.
- 2026-10-02 final verification: reran from `backend/`:
  `python -m pytest tests/test_subject_option_seed.py tests/test_subject_option_parser.py tests/test_student_pipeline_match.py -q`;
  result `42 passed` (2.95s). Pytest emitted one non-failing cache warning
  because the existing `.pytest_cache/v/cache` path could not be created
  (`WinError 183`); no cache or unrelated temporary files were altered.
- Scope confirmation: this lane changed only the subject catalog/parser,
  generated subject seeds, subject API/types/tests, and this checkpoint. No
  CCMAS course data, JAMB university-offering rows, or shared manual-review
  ledger was edited; no SQL was applied.

### Resume checkpoint 8 — requested next five plus Horticulture (2026-10-02)

- Task/range: `Literature in English`, `METEOROLOGY AND CLIMATE CHANGE`,
  `Marine Science and Technology`, `Physical Sciences (with options in i.
  Industrial Physics, ii. Physics with Electronics)`, and `Physics with
  Computational Modeling`; additionally resolve the previously queued
  Horticulture O'Level text.
- Last completed IDs: queue positions 21–25 (five requested rows) assessed;
  Horticulture source-text disposition assessed. Do not move to positions
  26–30 yet.
- Verified/corrected/unresolved: 6/6 researched; 2 exact source-text
  corrections added to the subject-only override (Horticulture and
  Meteorology); 3 remain blank with no source-backed requirement candidate in
  the local search ledger; Literature remains context-ambiguous. The two new
  texts are source-backed but remain non-matchable `structured_source` until
  the parser can faithfully represent their open fifth-credit slot. No
  unsupported subject options were added. The four science/arts identities
  remain unresolved for national matcher availability as described below.
- Row dispositions and item-specific evidence:
  - `Literature in English`: source-missing O'Level. Local variant
    `Arts _ Humanities.pdf`, p.43 row 3, is marked `inherited_shared`; its
    multi-title cell includes Literature in English but does not enumerate
    the current full institution set. `Education.pdf`, p.143 row 1, is an
    unrelated education-programme cell and was rejected. Do not fill a
    national rule from either. Local offering list and locator are in
    `data/career-mapping/jamb/arts_hum_offerings.json`.
  - `METEOROLOGY AND CLIMATE CHANGE`: exact local variant
    `Sciences.pdf`, p.230 row 4 names the specific title and the LAGOS,
    MARITIME-UNI and PRU awarder group; its source text is “Five (5) SSC
    credit passes including Physics, Mathematics and English Language and
    either Chemistry or Geography.” This aligns with the current canonical
    institution list. Added that exact source text to
    `data/career-mapping/jamb/brochure_subject_overrides.json`. The separate
    Engineering/Environmental/Technology p.140 row 4 has overlapping
    awarders plus unrelated offerings and extra text, so it was not merged.
    The source text is retained, not promoted to executable options: current
    O'Level parser returns `None` for the open fifth credit plus alternative
    phrase.
  - `Marine Science and Technology`: current local offering is FUTA only;
    `Sciences.txt:5512, 5532–5535` confirms wrapped title and awarding
    institution while O'Level/UTME cells are blank. No source-missing row
    variant supplies a requirement. No borrowing from other marine titles.
  - `Physical Sciences (with options in i. Industrial Physics, ii. Physics
    with Electronics)`: current local offering is GOUU only;
    `Sciences.txt:1516–1520` confirms the exact title/options and awarder.
    The requirement cells are blank and no source-missing row variant
    supplies a rule. The two options are recorded as programme-title scope,
    not invented as subject requirements.
  - `Physics with Computational Modeling`: current local offering is CALEB
    only; `Sciences.txt:1501, 1509–1511` confirms wrapped title and awarding
    institution. Requirement cells are blank and no matching local source
    variant supplies a rule. Other institutions' Physics exceptions were not
    transferred to CALEB.
  - `Horticulture`: exact local source variant `Agriculture.pdf`, p.76 row 4
    names `HORTICULTURE: FUNAAB MINNA`; existing verified source metadata
    points to `Agriculture.txt:3817–3819`, printed p.149, exact title/awarder
    cell, verified 2026-09-28. The common base O'Level text is “Five (5) SSC
    credit passes including English Language, Chemistry, Mathematics,
    Biology or Agric Science.” Added this text to the subject-only override.
    FUNAAB/MINNA-specific extra conditions remain separate and are not
    flattened into the base. Parser currently does not yield an executable
    option for the exact five-credit wording; do not count it as matcher-ready.
- Exact official sources checked/access date: JAMB IBASS Eligibility Checker
  HTML `https://eligibility.jamb.gov.ng/` and IBASS programme-search HTML
  `https://ibass.jamb.gov.ng/brochure-by-programme` (both accessed
  2026-10-02). The former requires interactive entry mode/institution/program
  selections and exposes no course-specific rule in its static HTML; the
  latter is a JavaScript app shell in the available text view. Therefore no
  new rule was claimed from HTML alone. Source texts above are from the
  checked-in extracted search ledger and the existing exact source locators;
  no PDF was opened or read for this tranche. Official URLs represented by
  those records are:
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf`,
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf`,
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf`,
  and
  `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf`.
- Files changed: `data/career-mapping/jamb/brochure_subject_overrides.json`
  (two source-backed O'Level text additions),
  `backend/seed_subject_rule_records.sql` (regenerated typed records),
  `data/career-mapping/_audit/jamb_subject_unresolved_subject_rule_queue_2026_10_02.json`
  (regenerated queue), and this checkpoint. No API, JAMB offering, CCMAS, or
  shared manual-review file changed; no SQL was applied. Existing unrelated
  worktree edits were preserved.
- Tests and deterministic verification: ran
  `python data/career-mapping/_gen_subject_rule_records.py` successfully:
  1,260 programme layers; 640 matchable, 172 structured_source, 2
  cross_reference, 420 direct_entry, 26 source_missing. Inspected the
  generated O'Level rows: both new texts are preserved verbatim with
  `rule_status='structured_source'`, `rule_kind='source_variants'`; no
  executable option was fabricated. The regeneration diff is broader than
  these two records (88 added/86 removed lines versus the checked-in seed),
  consistent with the pre-existing local subject-parser edits; those edits
  were not changed in this tranche, and the regenerated seed was retained so
  it reflects the current source/parser state. Reran the queue builder successfully:
  223 parser-needs-review identities, 1 empty identity, 26 typed
  source-missing rows (down from 28; the two new source texts account for the
  change). The parser's unresolved count rises by two because it now sees the
  sourced text but cannot fully represent the open fifth-credit slot. An
  exploratory `python -m pytest backend/tests/test_subject_option_parser.py -q`
  during a temporary parser/test experiment reported 5 passed, 2 failed on
  these exact phrasings; those temporary code/test edits were reverted. No
  final tests were rerun because parser/API code is unchanged by this batch.
  The previous 42-pass run predates this batch and is not claimed as a new
  pass.
- Precise next action: on resume, finish the only three source-missing
  identities not yet assessed: `Plant Breeding and Seed Technology`,
  `Robotics (Artificial Intelligence)`, and `Technology Education`, in that
  order. The regenerated queue has 26 source-missing entries overall, but its
  first 23 are already reviewed (the first 19 were covered in earlier groups;
  the four remaining source-missing identities from this tranche were just
  assessed). Do not interpret those as
  newly pending work or repeat positions 1–23. Keep Horticulture and
  Meteorology labeled source-backed-but-not-matcher-ready until their
  open-credit rules can be represented safely, and retain
  institution-specific Horticulture waivers separately.
