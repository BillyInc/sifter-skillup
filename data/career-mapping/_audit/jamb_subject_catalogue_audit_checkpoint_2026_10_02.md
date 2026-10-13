# JAMB Subject Catalogue and Rule Audit — Checkpoint 2026-10-02

## Scope and safety

This is the subject-catalogue/parser/matcher task only. Compare the 10 original
JAMB/IBASS PDFs under `C:\Users\USER\Downloads\jamb brochure` to the current
subject catalogue, rule parser, and matcher. Check for omitted valid subjects,
stream display tags, rule grammar/scope, and unsafe alias collapse. Browse
authoritative JAMB/IBASS material for rule-scope questions. Do not edit CCMAS
course data, JAMB-to-CCMAS/domain crosswalks, JAMB offering rows, or apply SQL.

## Baseline captured before new reconciliation

- Source PDFs present: Administration; Agriculture; Arts & Humanities;
  Education; Engineering & Environmental Technology; Law; Medical &
  Pharmaceutical Health Science; Sciences; Social Management Science; and
  Specific Entry Requirements.
- The worktree is already extensively dirty. Preserve all unrelated edits.
- User-owned subject edits already present and explicitly preserved:
  `data/career-mapping/_parse_subject_options.py`,
  `backend/tests/test_subject_option_parser.py`,
  `backend/seed_subject_options.sql`, and
  `backend/seed_subject_rule_records.sql`.
- Parser/test edits add compound-name protection during splitting, further
  mathematics variants, environmental science and information technology
  codes, broader supported UTME/O'Level codes, plural “any other subjects”
  count handling, and NBC/NTC phrase-boundary handling. The two new tests cover
  an open remainder under a five-credit total and a three-from-Science group.
- The two generated seed files were already modified before this audit began;
  retain them and only regenerate from the checked-in current parser/catalogue
  once the reconciliation is complete.
- Existing manual subject audit:
  `data/career-mapping/_audit/jamb_subject_catalog_api_audit_2026_10_02.md`.
  It contains earlier checkpoints and must be consulted for prior decisions;
  this checkpoint supplements it rather than replacing its history.
- No SQL has been applied and no live deployment claim is in scope.

## Audit sequence

1. Build an inventory of distinct subject labels and true aliases from the
   catalogue, parser maps, rule records, and existing source variants.
2. Extract each of the 10 original PDFs once, reconcile O'Level and UTME
   labels (including subject names nested in examples, category groups, or
   certificate clauses), and inspect rendered pages only where extraction is
   ambiguous.
3. Classify student-facing catalogue display streams as Science, Arts, and
   Commercial, allowing legitimate multi-stream tags. Keep those tags
   separate from admission-rule category scopes.
4. Audit rule forms and scope: fixed inclusions; exact N-of-list; N-of-category;
   remaining slots under a total; free-choice remainder; distinct / one-from-
   each groups; cross-references; institution waivers; and certificate-specific
   conditions (including NBC/NTC). Determine whether each is identity-wide,
   programme-specific, or institution-specific; never flatten a narrow
   exception into a universal requirement.
5. Repair only source-supported catalogue/alias/parser/API/test defects, then
   regenerate subject seeds and rerun relevant audits/tests locally.

## First-pass findings / watchlist

- Validate that multiple distinct listed alternatives were not collapsed into
  one canonical code merely because the current catalogue maps them to GMT,
  CAT, CSC, or HEC. Shared codes must mean genuine synonyms, not neighbouring
  curriculum items or separate examination choices.
- Verify the existing user parser changes against original brochure examples
  before extending them. Pay special attention to plural “any other subjects”
  (remaining count is derived only when the source states a fixed total and
  fixed inclusions), compound names containing “and”, slash alternatives,
  and NBC/NTC conditional requirements.
- This checkpoint is an early resumption point, not a completed audit. No
  subject totals or final rule-coverage figures have yet been recomputed from
  the original PDFs.

## Current exact next action

Inspect the existing subject audit/checkpoints and catalogue/schema; then
extract the original brochure PDFs and produce a deduplicated source-to-catalog
diff. Save the next checkpoint after the first source batch, including exact
counts, unresolved scopes, changed files, and tests. Do not start from a
reformatted generated seed or overwrite the user's current edits.

### Local continuation checkpoint — original-PDF inventory rerun (2026-10-02)

- The subject agent could not resume because its Codex session reported a
  usage limit. No replacement agent was available in this session; work has
  continued locally without changing the domain/CCMAS lane.
- Re-extracted the 10 local JAMB brochure PDFs (1,068 pages) with the existing
  read-only audit. It found 122 of 130 parser phrases, across the 48 current
  canonical subject codes. Eight exact alias spellings were not found by the
  literal phrase scan: `additional further mathematics`,
  `agriculture/science`, `catering craft practice`, `dress making`,
  `dyeing and bleaching`, `dyeing bleaching`,
  `ladies garment construction and finishing`, and `motor vehicle mechanics`.
  These are exact-string misses only; they are not proof that the subjects or
  aliases are absent, because punctuation, abbreviations, and table extraction
  can differ.
- The source-ledger parser inventory currently has 223 JAMB identities with
  at least one `needs_review` layer, one empty requirement identity, and 26
  typed `source_missing` rows. These categories can overlap and must not be
  summed as distinct programmes. The PDF scan counts rule-marker page hits,
  not unique rule requirements or their applicability.
- Collision groups remain candidates for item-level alias adjudication, not
  confirmed errors. Highest-risk distinct-label groups include `BIO`
  (Biology/Botany/Zoology), `CSC` (Computer Studies/Data Processing/ICT),
  `GMT` (Textile, weaving, spinning, dyeing/bleaching, garment making), `CAT`
  (Catering Craft Practice versus generic catering), and `FSN` (Food and
  Nutrition versus Nutrition). Do not split or merge these without a source
  showing that the terms are true equivalent exam-subject labels.
- Scoped subject tests pass: 44 passed in
  `backend/tests/test_subject_option_parser.py`,
  `backend/tests/test_subject_option_seed.py`, and
  `backend/tests/test_student_pipeline_match.py`. Pytest emitted one
  non-failing cache-permission warning; no cache files were altered.
- Current subject audit artifact:
  `jamb_subject_catalog_original_pdf_audit_2026_10_02.json/.md`. No new
  catalogue/API/seed change was made in this local continuation. The subject
  catalogue/rule audit remains open.
- Next safe subject action: compare the eight exact-string misses and the
  collision groups against the extracted brochure text with normalized
  punctuation and inspect only ambiguous source pages; then deduplicate the
  `needs_review` rows by `(JAMB identity, exam layer, exact source variant)`.
  Do not promote blanket faculty/stream rules: the brochure’s exact
  programme/institution cell remains the scope authority.

### Continuation after table-continuation clarification (2026-10-02)

The user clarified that an apparently blank O'Level cell may be a vertically
continued requirement, or the programme may have a requirement in the
brochure's exception/waiver column. Therefore, a blank canonical field is not
proof that the official source has no applicable requirement. Trace the row,
column, continuation, and institution scope before classifying it. External
requirements must remain tied to the named university; do not promote them to
a national JAMB rule.

#### Source-backed additions in this continuation

- The original Arts & Humanities PDF has a direct `GERMAN` row for IBADAN,
  LAGOS, and OAU with five O'Level credits including French and English
  Language. This exact JAMB rule is now in
  `data/career-mapping/jamb/brochure_subject_overrides.json` for the canonical
  standalone German programme; it is not borrowed from the separate French /
  German / Russian combined offering. Source: `Arts _ Humanities.pdf`, PDF
  page 84, printed page 213.
- The Agriculture PDF has an NDU O'Level exception aligned with the Plant
  Breeding and Seed Technology row: English, Mathematics, Chemistry, Physics,
  and Biology or Agricultural Science. It is stored as NDU-only waiver
  evidence, not a national requirement. Source: `Agriculture.pdf`, PDF page
  44, printed page 118. The current canonical parsed institution list does not
  show NDU; that offering/identity discrepancy is deliberately not changed in
  this subject-only tranche.
- The Education PDF gives ILORIN's institution-specific O'Level requirement
  for Technology Education in the special-consideration column. It is stored
  as an ILORIN-only waiver, not a national rule. Source: `Education.pdf`, PDF
  page 105, printed page 303.
- The Sciences PDF shows a Robotics (Artificial Intelligence) row for WIGWE
  with a blank national O'Level cell. WIGWE's official Science and Computing
  admissions page supplies its own five-credit rule. It is stored as a
  WIGWE-only waiver. Source URL:
  `https://www.wigweuniversity.edu.ng/science-and-computing/`.
- The same official WIGWE page supplies a WIGWE-only O'Level rule for Data
  Science; this is also retained as an institution waiver and does not fill
  the national canonical field.
- The Sciences PDF lists Marine Science and Technology for FUTA but the
  national O'Level cell is blank. FUTA's official department admission page
  states its five required O'Level subjects and UTME combination. This is
  stored as a FUTA-only waiver. Source URL:
  `https://mst.futa.edu.ng/home/1741`.

These source facts are local subject-rule overrides only. No JAMB offering
ledger, CCMAS, domain data, or seed was edited/regenerated. The NDU
institution-list discrepancy remains outside this lane.

#### Current audit counts and remaining queue

- Original-PDF phrase audit rerun: 10 PDFs / 1,068 pages; 129 parser phrases
  across 48 canonical subject codes; 123 phrases have a literal exact-text
  hit. Six literal phrases remain unmatched; this is not proof of subject
  absence because the PDFs use punctuation, line breaks, or alternative
  spellings. The unmatched phrases are `additional further mathematics`,
  `agriculture/science`, `catering craft practice`, `dyeing and bleaching`,
  `dyeing bleaching`, and `ladies garment construction and finishing`.
- The parser now recognizes the observed `Dyeing & Bleaching` spelling. The
  unsupported `Dress Making` and `Motor Vehicle Mechanics` aliases remain
  removed; neither was verified as an exact JAMB subject in the local PDFs.
- Refreshed unresolved subject-rule queue: 227 identities have at least one
  parser `needs_review` layer, 1 identity has both requirement fields empty,
  and 25 O'Level rule rows remain `source_missing`. The queues overlap and
  are not additive counts. Institution-specific waivers above do not clear a
  national `source_missing` state.
- The sole both-fields-empty identity is `International Studies and
  Diplomacy`. The 25 source-missing O'Level identities are: Biology/
  Biotechnology; Building Technology; Computer and Information Science;
  Crop Science; Data Science; Environmental Science and Technology; Forestry
  and Fisheries; French and German/Russian; Geography; Geography and
  Environmental Management; Geology and Mining; Geophysics; Home Science;
  Hotel Management & Tourism; Information and Media Technology; Industrial
  Mathematics/Computer; International Studies and Diplomacy; Linguistics;
  Literature in English; Marine Science and Technology; Physical Sciences
  (with options in Industrial Physics / Physics with Electronics); Physics
  with Computational Modeling; Plant Breeding and Seed Technology; Robotics
  (Artificial Intelligence); and Technology Education.
- Original-PDF audit rule inventory remains broader than the 25 blank rules:
  116 distinct O'Level texts across 207 identity-layer failures and 33
  distinct UTME texts across 40 identity-layer failures are not fully
  matchable. Counts describe parser outcomes, not confirmed source errors.

#### Files changed and verification

- `data/career-mapping/_parse_subject_options.py`: add the verified exact
  `Dyeing & Bleaching` alias.
- `data/career-mapping/jamb/brochure_subject_overrides.json`: record the
  exact German JAMB row and separately scoped NDU, ILORIN, WIGWE, and FUTA
  O'Level evidence.
- `backend/tests/test_subject_option_parser.py`: assert the exact observed
  alias, scoped waiver attachment, and that institution waivers do not fill a
  national O'Level requirement.
- Refreshed read-only audit outputs:
  `jamb_subject_catalog_original_pdf_audit_2026_10_02.json/.md` and
  `jamb_subject_unresolved_subject_rule_queue_2026_10_02.json`.
- Scoped tests passed: 51 passed across
  `test_subject_option_parser.py`, `test_subject_option_seed.py`, and
  `test_student_pipeline_match.py`. Pytest emitted one non-failing cache
  permission warning. Seeds were not regenerated; no database/API deployment
  is claimed.

Next, continue through the source-missing queue and the distinct parser-failed
texts, use official JAMB/IBASS and institution sources to resolve only
supported contexts, and keep source ambiguity institution-scoped. Do not
restart the closed parser-alias sample or modify seed, CCMAS, JAMB curriculum,
domain, subgroup, or role files.

### Continuation checkpoint 4 — parser/source-state repair and catalogue-alias audit (2026-10-02)

Scope remains JAMB subject catalogue/parser/rules/API only. No CCMAS, JAMB-to-domain,
programme-offering, SQL-live, or downstream files were edited.

#### Current inventory and completed work

- The current generated unresolved queue (rebuilt after local parser edits) is
  `jamb_subject_unresolved_subject_rule_queue_2026_10_02.json`: 158 JAMB
  identities with at least one parser `needs_review` layer, 1 with both
  requirement fields empty, and 20 typed `source_missing` O'Level rows in the
  currently generated seed. Counts are different units and may overlap.
- A no-write preview using the updated typed-rule selection logic distinguishes
  13 genuinely empty national O'Level cells from 7 identities whose exact or
  inherited source text exists but is not safely executable; 2 additional
  identities with previously source-missing primary text now have a parseable
  source variant. The checked-in generated typed-rule seed has not yet been
  regenerated, so its count remains 20 until the full reconciliation closes.
- The exact source-missing identities in the preview are: Forestry and
  Fisheries; Plant Breeding and Seed Technology; Hotel Management & Tourism;
  French and German/Russian; Computer and Information Science; Information and
  Media Technology; Physics with Computational Modeling; Physical Sciences
  (options in Industrial Physics / Physics with Electronics); Industrial
  Mathematics/Computer; Environmental Science and Technology; Marine Science
  and Technology; Biology/Biotechnology; and Robotics (Artificial
  Intelligence). Some have separately sourced institution waivers; these do
  not fill the national rule field.
- Added a narrow O'Level parser repair for the exact extracted join
  `andanyothersubject` (seen in the Geological Sciences/Mining JAMB source
  variant). The parser now separates the conjunction/quantifier and correctly
  produces the fixed five-credit rule without changing the allowed subject
  scope.
- Fixed typed-rule status selection: when the primary requirement cell is
  blank but exact/inherited source variants exist and none is safely
  matchable, the typed record is now `structured_source` with the raw source
  variants retained, not falsely `source_missing`. Only a blank primary cell
  with no usable source text remains `source_missing`.
- Relevant verification after these changes: 27 tests passed across
  `test_subject_option_parser.py` and `test_subject_option_seed.py`. One
  non-failing pytest cache-permission warning occurred. Seeds have not been
  regenerated and SQL has not been applied.

#### Five source-missing identities reviewed in the next batch

- Environmental Science and Technology: exact title has no requirement-cell
  row in the current local Sciences PDF text. Search results from secondary
  admissions sites report a WESLEYUNI requirement, but the current official
  Wesley CEDM programme page lists Urban/Regional Planning, Estate Management,
  and Surveying/Geoinformatics—not this degree title. Do not use the secondary
  text as a confirmed programme-specific rule. Keep the national cell
  source-missing pending an exact official JAMB/university programme source.
- Forestry and Fisheries: current Agriculture PDF contains the name only in
  the programme index (PDF p. 1); no requirements row was found in the saved
  source variants. It has 14 institution contexts, so do not borrow the
  generic Agriculture rule as a universal substitute.
- French and German/Russian: the current Arts PDF contains this exact wording
  in its programme index (PDF p. 1), but no exact rule cell. A different
  `French with German/Russian` row for UNN and its institution-specific waiver
  are not silently transferred to the separate canonical identity whose
  current institution list is BABCOCK/NOUN.
- Geography and Environmental Management: source variants exist. A science
  cell names English, Mathematics, Geography, and any two Science subjects;
  a Social Management variant explicitly says five credits and at least a
  pass in Mathematics. The latter must not be converted into a Mathematics
  credit. The source-variant typed rule now preserves non-executable evidence
  instead of calling it missing; the parser repair also makes the other
  source text eligible for structured review.
- Geology and Mining: its Sciences PDF row (PDF p. 83 / printed p. 534)
  contains a five-credit cell with English, Biology, Chemistry, Mathematics,
  and any other subject; the joined-word repair makes this source variant
  parse. The Engineering PDF has separate institution-specific requirements
  for FUTA/ABU/JOS, which must remain scoped to those schools.

#### New catalogue integrity finding — distinct exam subjects were collapsed

The parser allow-list and the SQL subject catalogue disagree. The SQL seed
still aliases distinct subject choices to a neighbouring code even though
the parser tests reject those merges. Official WAEC evidence confirms separate
exam-subject entries for several of them:

- `CAT` incorrectly aliases generic Catering, Basic Catering and Food
  Services, and Bakery and Confectioneries to Catering Craft Practice.
- `GMT` incorrectly aliases Clothing and Textile, Textiles, Dyeing &
  Bleaching, Garment Making, and several garment/textile trade labels to one
  code. WAEC lists Clothing and Textile, Dyeing & Bleaching, Garment Making,
  and Textiles separately.
- `HEC` incorrectly aliases Home Management; WAEC lists Home Management
  separately.
- `CSC` SQL aliases Computer Science, ICT, and Data Processing to Computer
  Studies; existing parser tests already reject those mergers. WAEC lists Data
  Processing as a distinct subject.
- `ACC` SQL aliases Book Keeping to Principles of Accounts; the parser tests
  already reject that merge.
- `AGR` SQL aliases generic Agriculture to Agricultural Science; parser tests
  already reject generic Agriculture.
- `ART` SQL aliases Creative Arts, which parser tests already reject.
- `AUTO` SQL aliases Motor Vehicle Mechanics, which parser tests already
  reject.

Primary source for the distinct current subject names: WAEC examiner portal,
[Subject Listing](https://examiners.waecnigeria.org/Subjects/SubjectListing)
(accessed 2026-10-02), especially its separate entries for Catering Craft
Practice, Clothing and Textile, Data Processing, Dyeing & Bleaching, Foods and
Nutrition, Garment Making, Home Management, Textiles, and Computer Studies.
The WAEC 2026 Nigeria timetable also independently shows Clothing and Textiles,
Foods and Nutrition, Home Management, and Fashion Design & Garment Making as
named papers. JAMB's official [Agriculture brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf)
and [Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf)
list multiple vocational alternatives as separate items in programme
requirements; they are not permission to collapse them to one catalogue code.

#### Important deviation and next action

One full local-PDF audit command was accidentally rerun before noticing the
instruction not to redo completed extraction. It rewrote the audit report
artifact but did not alter any source PDF or programme data. The refreshed
audit artifact now reports 112 parser phrases across 48 codes, 107 source
labels located, and 5 exact phrase strings not found. Treat this as a fresh
machine inventory only; the alias/source interpretation above is based on
official JAMB/WAEC evidence, not phrase absence alone.

Next: reconcile the entire catalogue's canonical rows and aliases against the
WAEC official subject list plus exact distinct alternatives in the 10 JAMB
brochures. Add separate catalogue codes only for exam subjects supported by
those sources; remove false SQL aliases already contradicted by tests; keep
all legitimate parser aliases synchronized with the catalogue; assign
Science/Arts/Commercial display streams without changing rule scopes. Then
refresh the queue/typed-rule dry run, work the remaining source-missing and
needs-review patterns, regenerate seeds only after the source reconciliation
is complete, and rerun relevant audit/tests. Current checkpoint path remains
`data/career-mapping/_audit/jamb_subject_catalogue_audit_checkpoint_2026_10_02.md`.

### Exact eight alias-spelling adjudication (2026-10-02)

This adjudication used the already-produced PDF phrase/page report and the
existing parsed JAMB offering/source-variant files. The PDFs were not scanned
again.

| Literal candidate | Source check | Decision |
|---|---|---|
| `additional further mathematics` | The source phrase is `Additional/Further Mathematics` (Education PDF, p. 79); the existing parser and catalogue already have the slash spelling. | Punctuation/connector variant of the same printed choice; retain as a normalization/alias, not a new subject. |
| `agriculture/science` | The source uses `Agriculture Science` and compound alternatives such as `Biology/Agriculture Science`; the exact reversed slash phrase was not found. | Do not add this literal as a subject. Parse the actual named alternatives; `Agriculture` also occurs independently in the official JAMB UTME subject list, so it must not be conflated with O'Level `Agricultural Science` without exam-layer-aware handling. |
| `catering craft practice` | Present in source excerpts as `Catering Craft Practice` and PDF-extracted `cateringcraftpractice` (Education PDF pp. 115, 118). | Same named JAMB subject; add a narrowly scoped joined-word normalization for this extraction artifact. |
| `dress making` | No occurrence in the 10-PDF phrase/page report or current parsed source variants. | Unsupported alias for this brochure set; do not treat it as verified `Garment Making`. |
| `dyeing and bleaching` | Source uses `Dyeing & Bleaching` (Education PDF pp. 115, 118); JAMB Agriculture and Education requirements use it as a named option. | Ampersand/conjunction variant of the printed label. It is a separately named option from Garment Making; catalogue identity must be decided against the exam-subject source, not merged just because both are garment trades. |
| `dyeing bleaching` | No standalone wording; source wording is `Dyeing & Bleaching`. | Punctuation-loss variant only; support it only through normalization of the actual `&` form, not as another independent alias. |
| `ladies garment construction and finishing` | Present in Agriculture PDF pp. 70, 73, but extraction joins tokens (`ladiesgarment` / `andfinishing`). | PDF token-join variant of the printed alternative. Preserve the full phrase; do not collapse it to a shorter label unless catalogue evidence supports that equivalence. |
| `motor vehicle mechanics` | No occurrence in the current 10-PDF report/source variants. The official JAMB approved UTME list names `Computer Studies`, not this phrase. | Unsupported in this brochure set; do not accept it as an alias for `Auto Mechanics` without exact authoritative evidence. |

Primary verification also consulted JAMB's official 2026 approved UTME list,
which names `Agriculture`, `Computer Studies`, and `Physical and Health
Education` as UTME subjects. This confirms that a single undifferentiated
label-to-code dictionary cannot always represent differences between UTME and
O'Level identities; that is now an explicit parser/catalogue audit item.

### Web verification of the 13 blank national O'Level cells (2026-10-02)

Targeted external search was carried out for all 13 exact identities in the
current no-write preview. The blank national cell does **not** mean no
institution has an admission rule; external findings must be stored as
institution-scoped evidence, not copied into a national requirement.

| JAMB identity | Web evidence found | Decision / scope |
|---|---|---|
| Biology/Biotechnology | Official DUFUHS/KDUMS admissions notice lists the exact degree name and a five-credit science set (English, Mathematics, Physics, Chemistry, Biology), but the retrievable item is for 2021/22; a 2024/25 supplementary notice only says five relevant credits including English and Mathematics. | Evidence exists but is dated; do not promote as current 2026/27 rule without current DUFUHS confirmation. Official pages: `https://kdums.edu.ng/newsdetails.aspx?ID=8&title=KDUMS+UNDERGRADUATE+ADMISSION+FOR+2021%2F2022+ACADEMIC+SESSION`, `https://kdums.edu.ng/resources/announcement_of_supplementary_admissions_for_20242025_academic_session.pdf`. |
| Computer and Information Science | Official JAMB Engineering brochure contains the programme in its catalogue/index; no exact programme-specific O'Level rule found for BAUCHI or SUMMIT. SUMMIT's IT/Computer Science rules are not this named award. | Keep unresolved; do not borrow adjacent Computer Science/Information Technology rules. Source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf`. |
| Environmental Science and Technology | Official Wesley University College of Environmental Design and Management handbook says five credits including English, Mathematics, Economics, and two from Geography, Biology, Physics, Chemistry, Technical Drawing, Business Studies/Commerce, Agricultural Science, Fine Art, or Government. | Strong Wesley-scoped candidate, but the retrieved handbook is college-wide and does not name this exact degree in the requirement paragraph. Preserve as a scoped source candidate; do not promote to national rule until exact course-to-college applicability is checked. Source: `https://www.wesleyuni.edu.ng/assets/pdf/cedm.pdf`. |
| Forestry and Fisheries | Official JAMB Agriculture brochure places the name in its programme list, while current official JOSTUM records expose distinct forestry, fisheries, and related degree programmes with differing subject rules. The current canonical identity spans 14 institutions. | This is an umbrella/compound identity, not one shared admission rule. Resolve by exact institution/programme offering; no generic external rule promoted. Sources: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf`, `https://ugadm.uam.edu.ng/admission_requirement.php`. |
| French and German/Russian | Official JAMB Arts brochure confirms the combined title in its index. UNN documents multiple distinct language pairings, but the current canonical identity's institutions are BABCOCK and NOUN; Babcock's current page found in search lists standalone French Studies, not this combined award, and no exact NOUN rule was found. | Keep unresolved; do not transfer UNN or standalone-French rules to the combined identity. Sources: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf`, `https://babcock.edu.ng/admission/undergraduate`. |
| Hotel Management & Tourism | Official JAMB Social Sciences brochure gives an exact ELIZADE cell: English, Geography, any three Arts/Social Science credits, plus at least an O'Level pass (not credit) in Mathematics. The current canonical Agriculture-source offering list instead names BIU, FED-WUKARI, GREGORY, UMUDIKE, UNI-AFRICA, and WESLEYUNI. Official BIU/Wesley materials provide differently worded related hospitality rules, not an identical course/offering row. | Do not attach ELIZADE's rule to the current six-school identity or flatten related awards. Record as a cross-brochure identity/offering discrepancy for this subject audit; external rules remain school-scoped. Sources: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`, `https://biu.edu.ng/department-of-agronomy-environmental-management/`, `https://wesleyuni.edu.ng/assets/pdf/Wesleyuni_CSMS.pdf`. |
| INFORMATION AND MEDIA TECHNOLOGY | Official JAMB Engineering brochure provides MINNA-specific O'Level and UTME rules; this source was already represented by a MINNA-only rule override in `brochure_subject_overrides.json`. | Found and already recorded institution-scoped; do not duplicate or convert to national. Source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf`. |
| Industral Mathematics/Computer | Official JAMB Sciences brochure's EBSU special-consideration text names EBSU and allows two other O'Level credits from Biology, Economics, Physics, and Statistics. EBSU's current official department page describes Industrial Mathematics (not the slash-title award) and a five-credit baseline including English, Mathematics/Further Mathematics, Physics, and two relevant science subjects. | Record as an EBSU-only candidate; preserve the current title/name discrepancy and do not generalize to a national rule. Sources: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf`, `https://ebsu.edu.ng/department-of-industrial-mathematics-and-applied-statistics/`. |
| Marine Science and Technology | Official FUTA department page gives exact five-credit O'Level subjects and UTME combination; a FUTA-only override is already present. | Found and already recorded institution-scoped. Source: `https://mst.futa.edu.ng/home/1741`. |
| Physical Sciences (options: Industrial Physics / Physics with Electronics) | Official JAMB Sciences brochure's GOUU waiver explicitly requires five credits including English, Mathematics, Chemistry, Physics, and Biology. | Exact GOUU-scoped rule found; do not use as the other institutions' national rule. Source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf`. |
| Physics with Computational Modeling | Caleb's official current admissions page states its general five-credit minimum and core Mathematics, English, Physics plus at least one of Chemistry, Biology, or Computer Science; no distinct course-specific requirement was found. | Institution baseline only; insufficient to claim a complete course-specific rule. Keep the national cell unresolved pending Caleb's exact programme rule. Source: `https://calebuniversity.edu.ng/admissions`. |
| Plant Breeding and Seed Technology | Official JOSTUM 2026/27 portal identifies the current related award as “Plant Breeding and Seed Science” and gives subject requirements; the existing canonical JAMB institution token is MAKURDI. FUNAAB requirements found in an earlier pass are not applicable to this identity's current institution list. | Strong MAKURDI/JOSTUM-specific title-variant evidence; preserve the title variance and school scope. Source: `https://ugadm.uam.edu.ng/admission_requirement.php`. |
| Robotics (Artificial Intelligence) | Official WIGWE page states the programme and its O'Level minimum; a WIGWE-only override is already present. | Found and already recorded institution-scoped. Source: `https://www.wigweuniversity.edu.ng/science-and-computing/`. |

This search batch found official, relevant evidence for multiple individual
institutions, but did not establish a single nationally applicable rule for
the 13. Several candidates remain unresolved because the available official
text is historical, college-wide, a related-but-not-identical programme, or
does not match the current offering institution list. The three existing
scoped overrides (MINNA Information and Media Technology, FUTA Marine Science
and Technology, WIGWE Robotics) were verified rather than duplicated. No
JAMB-to-CCMAS/domain mapping, offering row, SQL seed, or live database was
changed by this web pass.

#### Follow-up correction: unintended generated seed rewrite (2026-10-02)

After the web pass, a command intended to inspect parser-script options was
run against `_parse_subject_options.py`, which has no argument parser. It
therefore executed the generator and rewrote
`backend/seed_subject_options.sql` (5,030,223 bytes; 5,970 added / 347 removed
lines relative to Git HEAD). This was unintended and violated the instruction
to defer seed regeneration until source reconciliation is complete. The file
was already modified in the worktree before this command, so the pre-command
uncommitted contents cannot be reconstructed from Git without destroying
unknown user changes. A workspace/temp search found no backup copy. Do not
apply or regenerate this SQL as part of the current task; treat its current
contents as requiring reconciliation with the pre-existing user edits before
any later seed generation or commit. No SQL was applied to a database.

The scoped parser/catalogue tests were run before this accidental rewrite and
passed 27 tests (one generated-SQL freshness test was intentionally excluded);
the test result does not validate the rewritten SQL. Re-run the focused audit
after the seed's pre-existing edits have been reconciled. The web-evidence
decisions above remain as recorded, and the JAMB→CCMAS/domain mapping files
remain outside scope.

#### Current queue reconciliation and follow-up search (2026-10-02)

A fresh read-only-rule-queue rebuild after the scoped evidence updates reports
20 `source_missing` rule rows (all O'Level), not 13. The earlier 13-row web
table is therefore not the whole current source-missing queue. The additional
seven identities are Building Technology, Crop Science, HOME SCIENCE, Data
Science, International Studies and Diplomacy, Literature in English, and
Technology Education. The overall queue also reports 150 parser-review
identities and one identity with both requirement layers empty; these counts
are separate/overlapping queues and are not the count of missing national
O'Level rules.

Follow-up searches found authoritative JAMB/JOSTUM evidence for several of
these rows. JAMB's Agriculture brochure gives FED-OYE EKITI's Crop Science and
Horticulture credits (English, Mathematics, Biology/Agricultural Science,
Chemistry, Physics); only a FED-OYE-scoped rule is justified if that offering
is confirmed in the canonical identity. JOSTUM's active 2026/27 portal lists
the Forestry and Fisheries umbrella with distinct B. Fisheries, B. Forestry,
Forest Production and Products, and Forestry and Wildlife Management awards,
and distinct O'Level/UTME sets. This confirms that the umbrella must not be
flattened into one universal rule; exact JOSTUM programme-to-canonical-title
scope needs reconciliation before writing an override. Sources:
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf`,
`https://ugadm.uam.edu.ng/admission_requirement.php`.

The remaining seven identities require exact institution/title checks before
promotion. Do not turn JAMB index text, university-wide minimums, or related
programme rows into exact course rules. Continue targeted authoritative web
search, compare each institution with canonical JAMB offering scope, then
record verified scoped rules or a specific evidence-gap disposition. Do not
regenerate or apply `seed_subject_options.sql` until reconciliation is done.

### Continuation checkpoint — KASU parser correction and audit rebuild (2026-10-03)

- Scope remained the JAMB subject catalogue, rule parser/overrides, and subject
  API inputs. No CCMAS files, JAMB-to-CCMAS/domain mapping files, or live SQL
  were changed or applied.
- Corrected a parser false positive: `credit passes in ...` was being treated
  as a lower-level `pass in` condition. The local exception detector now
  distinguishes credit-pass lists from a separate ordinary-pass condition.
  Also tightened category detection to match complete category phrases only;
  a named subject such as `Fine Art` can no longer expand to every Arts choice.
- Repaired the KASU Building Technology O'Level override. It now parses as a
  full five-credit rule: English, Mathematics, Physics, Chemistry, plus one
  subject from the source-listed choices. The subject catalogue/parser now
  represents the source's technical choices as separate O'Level items rather
  than silently dropping them or widening them to a broad category. UTME
  remains the KASU-scoped Physics + Mathematics + one-of rule.
- Split the already sourced FUTA Marine Science and MINNA Information and
  Media Technology O'Level and UTME notes into separate exam-layer records.
  Added institution-scoped source rules for KASU Building Technology and the
  shared Literature in English O'Level cell (ABU, BASU, BOSU, CHRISLAND,
  CHRISTOPHER). These do not fill national rules or alter offering ledgers.
- Focused tests: `python -m pytest tests/test_subject_option_parser.py
  tests/test_subject_option_seed.py -q -k "not
  generated_subject_option_sql_passes_prerequisite_and_completeness_audit"`
  from `backend/` — 30 passed, 1 deselected. Pytest emitted a cache-write
  permission warning. The generated-option-SQL audit was intentionally not
  run because its seed is pre-existing user-edited state and has not been
  reconciled/regenerated in this task.
- Rebuilt the local PDF phrase audit from the 10 original brochures (1,068
  pages): 141 parser phrases/canonical mappings checked, 82 distinct codes,
  and 134 literal source-label hits. Seven aliases have no exact-string hit;
  this is not proof of absence because punctuation/layout variants can differ.
  Updated rule inventory: 223 unique O'Level and 203 unique UTME exact/shared
  source texts; 54 O'Level and 102 UTME texts parse fully, while 169 O'Level
  and 101 UTME texts remain not fully matchable.
- Rebuilt current unresolved queue: 158 parser-review identities, 21 typed
  source-missing rule rows, and 1 empty-requirement identity. These queues
  overlap. Counts increased from the prior 150/19 after the stricter category
  matcher stopped accepting broad false matches; this is a fail-closed audit
  correction, not newly missing source data. The 21 national O'Level blanks
  can coexist with school-specific rules above.
- Files changed in this continuation: `_parse_subject_options.py`,
  `_parse_local_subject_exceptions.py`, `jamb/brochure_subject_overrides.json`,
  `backend/seed_subject_catalog.sql`, `backend/tests/test_subject_option_parser.py`,
  `jamb_subject_catalog_original_pdf_audit_2026_10_02.json/.md`,
  `jamb_subject_unresolved_subject_rule_queue_2026_10_02.json`, and this
  checkpoint. The audit/queue filenames retain their historical date; their
  `generated_on`/audit date is 2026-10-03.
- No subject-option or subject-rule SQL seed was regenerated or applied. The
  existing `backend/seed_subject_options.sql` and
  `backend/seed_subject_rule_records.sql` remain unverified against these
  latest parser/catalogue edits and must not be treated as deployment-ready.
- Next: continue reconciling the remaining source-missing and parser-review
  subject-rule rows, using institution-level source scope where necessary.
  After source reconciliation, regenerate subject seeds in documented order,
  run the generated-seed and exhaustive matcher audits, and refresh this
  append-only checkpoint with final counts. Do not touch downstream mapping.
