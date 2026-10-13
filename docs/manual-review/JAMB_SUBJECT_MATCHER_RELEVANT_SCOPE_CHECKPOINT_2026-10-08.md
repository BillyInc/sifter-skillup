# JAMB Subject Matcher: Qualifier and Subject-Pool Checkpoint

Date: 2026-10-08

## Decision from the source check

The two pasted explanations are useful hypotheses, but they are not a JAMB
rulebook. Their claims that every vague phrase is resolved by a universal
faculty bucket, and their course examples of accepted/rejected subjects, are
not certified by the cited material. The official IBASS checker asks for the
institution and programme as well as the candidate's O'Level and UTME
subjects. IBASS brochure entries separate the programme requirements, UTME
subjects and institution-specific waiver remarks. The exact source row and
institution therefore control; a generic faculty label or an internet
example cannot fill an unstated pool.

Official references checked:

- [JAMB FAQ, Question 7](https://www.jamb.gov.ng/FAQ): directs candidates to
  the IBASS Eligibility Checker for programme/institution-specific UTME
  combinations and says to verify requirements.
- [IBASS Eligibility Checker](https://eligibility.jamb.gov.ng/): requests
  entry mode, institution and programme, then separately accepts O'Level
  credits and the UTME combination.
- [IBASS brochure by programme](https://ibass.jamb.gov.ng/brochure-by-programme):
  presents the programme and institution views.
- [IBASS Arts/Humanities brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf),
  [Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf),
  and [Education brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf):
  examples show named pools, category pools, and institution waiver remarks;
  the wording varies by programme and institution.

## Parsing contract now enforced

- Named subjects after `include`/`including`/`to include` are mandatory
  inclusions. They do not by themselves restrict the remaining credit slots.
- An explicit rule such as `any three Science subjects` or `two subjects from
  Arts or Social Sciences` creates a counted allowed pool, using only the
  categories explicitly named by that source wording.
- An explicit named list after `from` creates a counted pool from that list.
- A fixed O'Level credit total plus mandatory inclusions can represent an
  open remainder only when the wording makes the remaining slot(s) genuinely
  open (for example, all but one credit is explicitly named, or the source
  says `any other subject(s)`).
- `relevant`, `suitable`, `appropriate`, and similar qualifiers without a
  source-stated pool remain non-matchable source evidence. The other exam
  layer no longer supplies an inferred pool.
- University waiver rules remain attached to the named institution/offering;
  they do not rewrite the national programme rule. A local rule is promoted
  only when its own text can be represented safely.

## Implementation and generated state

Changed parser/generator files:

- `data/career-mapping/_parse_subject_options.py`
- `data/career-mapping/_gen_subject_rule_records.py`
- `backend/tests/test_subject_option_parser.py`
- `backend/seed_subject_options.sql` (regenerated)
- `backend/seed_subject_rule_records.sql` (regenerated)

The parser no longer resolves an unqualified O'Level `relevant` pool from the
same programme's UTME pool, or an unqualified UTME pool from O'Level wording.
Explicit `as in [programme]` references still resolve. Compatibility
parameters used by an older audit script remain accepted but are ignored.

Current local generation reports:

- 420 canonical JAMB programme identities.
- 363 UTME rules parsed, including 8 explicit `as in` references.
- 201 O'Level rules parsed; 198 programmes have at least one layer marked for
  source review. These are programme counts, not qualifier-only counts.
- 1,260 typed source-layer records: 647 matchable, 178 structured source
  records retained without picker eligibility, 2 cross-references, 420 Direct
  Entry records, and 13 source-missing records.
- In a targeted scan of the current canonical source text, 26 of 41 O'Level
  rows containing a relevance/suitability qualifier remain without an
  executable O'Level rule. Some of the 15 parseable rows use an explicitly
  open national rule and place the qualifier only in a separate NBC/other
  certificate condition; this is not a general qualifier resolution.
- Five of seven UTME rows containing a relevance/suitability qualifier remain
  unresolved; the remaining two have an explicit source-supported scope.

These figures describe local generated artifacts only. They do not claim that
SQL was applied to Supabase or that unresolved wording has been verified for
any individual university. Candidate-facing matching should use a specific
institution's source-backed exception when the national wording leaves a
subject pool open or institution-dependent.

## Verification

Focused suite: `73 passed` across subject parser, generated subject seed,
student matcher, and local exception parser tests. Pytest emitted one cache
permission warning after the passing result; it did not affect the tests.

## Resumed pass and current status (2026-10-08)

The earlier figures above are the starting checkpoint, not the current
remaining count. I resumed by inspecting the current diff and regenerated
source rules, then added a repeatable source-row inventory:

- `data/career-mapping/_audit/inventory_jamb_unresolved_subject_pools_2026_10_08.py`
- `data/career-mapping/_audit/jamb_unresolved_subject_pools_2026_10_08.json`

The queue currently contains **149 unresolved programme/layer rows**: 131
O'Level and 18 UTME rows, representing 100 distinct source-text variants.
It preserves the exact row wording, offering-institution codes, and related
institution-scoped waiver notes. These are not 149 confirmed defects: many
are intentionally non-matchable because the source says only “relevant” or
“suitable,” has a mixed/shared programme block, or provides incomplete/corrupt
text. Use the queue to investigate repeated phrase variants and each affected
offering separately. Rebuild it after every source or parser change.

One source-grounded case was resolved: the sole HUMAN BIOLOGY offering is
ABUAD, and the official IBASS Sciences table follows its “three relevant
Science subjects” wording with the explicit list Biology, Chemistry, and
Physics or Mathematics. The subject-specific override now parses as required
Biology + required Chemistry + one of Physics/Mathematics. It does not infer a
general science-subject pool. Locator: `data/career-mapping/jamb/
sciences_offerings.json` identifies the HUMAN BIOLOGY heading and ABUAD;
`data/career-mapping/_jamb_txt/Sciences.txt` contains the table text at lines
9879 onward. Official source: [IBASS Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf).

The exhaustive audit also exposed and fixed a validator inconsistency: it had
rejected a source rule with four named required credits plus a fixed five-credit
minimum, even though exactly one remaining credit is left unspecified. Its
gate now agrees with the parser’s narrow one-open-credit rule. I tested a
broader interpretation of “including” (allow any number of unnamed credits)
and reverted it: that interpretation caused 129 matcher-oracle mismatches.
Therefore “including” with multiple unspecified credits is not automatically
promoted; it needs explicit source wording and a separate audit of its exact
offering behavior.

Current local generation/verification:

- Subject parser: 420 programmes; 364 UTME rows parsed (including 8 explicit
  “as in” references); 201 O'Level rows parsed; 198 programmes have at least
  one layer still requiring review.
- Typed rule seed: 1,260 programme layers (647 matchable, 178 structured
  source-only, 2 cross-references, 420 Direct Entry, 13 source-missing).
- Subject-option seed audit: passed, 565 options and 2,117 represented
  subject slots/groups.
- Exhaustive matcher audit: passed, 1,260 typed rules, 8,917 option items,
  276 satisfying/mutation cases, zero false-positive oracle mismatches.
- Focused tests: 43 passed across subject parser, subject seed and local
  exception parser. Pytest reported only a cache-directory permission warning.

Important remaining work: investigate the 149-row queue against the exact
official IBASS programme/institution cells and source-backed university
exceptions. JAMB explains that the IBASS checker is programme- and
institution-specific, but it does not publish a universal accepted-subject
pool for a bare “relevant/suitable” phrase. Do not convert such a phrase into
a faculty-wide bucket. Resolve parseable institutional exceptions only in
their own offering scope; keep the national rule distinct. After the queue is
reviewed, regenerate both subject seeds and rerun the parser, seed and
exhaustive matcher tests. No SQL has been applied.

References: [JAMB FAQ, Question 7](https://www.jamb.gov.ng/FAQ), [IBASS
Eligibility Checker](https://eligibility.jamb.gov.ng/), [IBASS brochure by
programme](https://ibass.jamb.gov.ng/brochure-by-programme), and the official
[IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf)
and [IBASS Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf).

## Latest deterministic replay (2026-10-08)

The parser and generated subject seeds were regenerated after removing two
unverified Botany/Zoology aliases. Those names occur in source prose, but the
current source audit did not establish them as selectable canonical JAMB
subject rows, so they are not invented as picker aliases.

Current generated counts:

- 420 canonical JAMB programmes.
- 369 UTME rows parsed, including 8 explicit `as in` references.
- 201 O'Level rows parsed.
- 1,260 typed rule records: 650 `matchable`, 175 `structured_source`, 2
  `cross_reference`, 420 Direct Entry, and 13 `source_missing`.
- Subject-option seed audit: **570 options and 2,131 represented subject
  slots/groups**.
- Exhaustive matcher audit: **1,260 typed rules, 570 options, 8,211 option
  items, 263 generated cases, 188 negative-mutation cases, and zero false
  positive oracle mismatches**.
- Catalogue stream audit: **82 catalogue codes**, 82 O'Level codes, 23 UTME
  codes, and 82 source-PDF-audited distinct codes. Effective picker stream
  counts are O'Level: Science 45, Arts 39, Commercial 25, Technical 44;
  UTME: Science 9, Arts 18, Commercial 8, Technical 3.
- Unresolved wording inventory remains **149 programme/layer rows**: 131
  O'Level and 18 UTME, across 100 source-text variants. This is an evidence
  queue, not a confirmed error count.

Filtering and validation changes verified in this replay:

- Science, Arts, Commercial, and Technical/Vocational are accepted picker
  streams.
- A selected stream filters both O'Level and UTME pickers after the exam-layer
  filter; cross-listed subjects remain visible in every applicable stream.
- Technical-category rows receive the Technical/Vocational visibility tag
  without being promoted into the UTME catalogue unless their exam metadata
  says they are UTME-selectable.
- National rules remain separate from institution/offering exceptions, and
  stream tags do not rewrite either rule type.
- The focused Python suite passes **82 tests**; the focused TypeScript ESLint
  run passes with no findings.

Changed/replayed matcher artifacts include the strict subject parser and rule
generator, regenerated `backend/seed_subject_options.sql` and
`backend/seed_subject_rule_records.sql`, the effective stream-tag updates in
`backend/seed_subject_catalog.sql` and `backend/patch_subject_catalog_streams.sql`,
the student/admin stream surfaces, subject-picker tests, the stream audit, and
the unresolved-wording inventory. No role, domain, or guided-experience files
were edited in this pass. No SQL was applied.

The remaining queue is still handled fail-closed: a bare
`relevant`/`suitable`/`appropriate` phrase, or an `including` phrase without a
source-stated remainder, is not converted into a guessed faculty, stream, or
other-exam subject pool. The next valid reduction requires an exact IBASS
institution/programme cell or an authoritative institution waiver with a
locator; otherwise the row stays structured/admin-visible and out of exact
student matching.

## Resumed exact-source pass (2026-10-08, latest)

The queue is being handled programme-first, then institution-by-institution:
resolve the national rule once from its own IBASS programme cell, and keep any
university variation in an exact offering exception. A university exception
does not resolve or broaden the national wording.

I extended `data/career-mapping/_audit/build_jamb_subject_scoped_resolution_2026_10_08.py`
to compare existing institution-waiver notes against extracted official IBASS
PDF pages. The audit now requires the exact note text, a standalone canonical
programme title, and the institution token on the same PDF page before it
counts a waiver as source-linked. The report retains the PDF name/page, official
URL, inferred exam layer and parsed rule scope. This is evidence linkage, not
automatic rule promotion.

Latest replay:

- 149 unresolved programme/layer rows remain in the input queue (131 O'Level,
  18 UTME; 100 wording variants).
- 3 exact, executable institution-scoped rows remain resolved (Psychology,
  Sociology and Zoology UTME); 146 national rows remain residual. No
  institution-specific note was promoted into a national rule.
- Of 391 existing parsed institutional waiver records across 58 programme/layer
  groups, 50 exact note texts now have a matching official IBASS PDF page and
  programme context; 23 also pass institution-scope linkage. These numbers are
  source-link counts, not counts of newly repaired rules.
- The current residual reason distribution is unchanged: 35 non-executable
  exact cells, 72 non-exact source statuses, 6 incompletely executable exact
  cells, 7 contaminated/compound texts, 19 rows with no source variant, and 7
  other identity/credit-total/mixed-layer cases.
- No `*_offerings.json` or SQL seed was changed by this audit replay; local
  waiver provenance is currently captured in the audit output only. Do not
  describe those 50 source links as persisted seed provenance or as live data.

Verification after the audit change:

- New exact-source audit tests: 3 passed.
- Focused subject matcher suite: 88 passed.
- Subject-option seed audit: 570 options, 2,131 represented slots/groups,
  passed.
- Exhaustive matcher audit: 1,260 typed rules, 570 options, 8,211 option
  items, 263 positive cases, 188 negative mutations, zero false-positive
  oracle mismatches.
- Inventory replay remains 149 rows / 100 wording variants.

The unresolved count must not be reduced just because an exact institution
note exists: it must have the correct exam layer, a bounded and executable
subject rule, an exact programme/institution source context, and remain scoped
to that offering. Next: carry only those verified scoped records into the
existing local exception provenance path, then continue exact IBASS checks for
the residual programme/institution pairs. Unsupported or cross-layer notes
stay hidden from exact student matching.

## Applied exact programme + institution pass (2026-10-08, latest)

User clarification: this lane must fix the gaps, not stop at a review artifact.
The resolution JSON is consumed by `data/career-mapping/_gen_seed.py`; the
generator writes the verified rules into the institution-specific
`school_programme_requirement_exceptions` and `school_programme_subject_options`
rows. It does not write university exceptions into national requirement or
subject-option rules.

Latest replay from `build_jamb_subject_scoped_resolution_2026_10_08.py`:

- Baseline inventory: **149 rows** (131 O'Level, 18 UTME; 100 text variants).
  This differs from the previously cited **143**; the checked-in inventory and
  current builder both currently report 149, so these denominators must not be
  conflated.
- Exact programme/layer groups now resolved: **16**, with zero conflicts.
- Exact institution + programme + exam-layer applications generated: **69**.
  These remain institution-specific, each with the source text, official IBASS
  URL, PDF/page or extracted-text locator, and access date. No national rule
  was widened.
- Residual rows still hidden from exact student matching: **133**.
- Residual reasons: 31 exact cells not executable; 67 source status not exact;
  6 exact cells not fully executable; 7 contaminated/compound text; 19 no
  source variant; 1 canonical programme/cell identity mismatch; 3 O'Level
  cells without explicit credit total; 1 exact cell without institution
  codes; 2 mixed exam/Direct Entry; 1 programme name embedded only in a
  compound title.
- The builder reports 391 existing parsed institutional waiver rows across
  58 programme/layer groups; 23 exact source-linked rows; 40 exact PDF-text
  page matches; 13 exact executable waiver candidates in five programme/layer
  groups; zero layer mismatches; 69 course-cell-only unverified notes; and 299
  notes without exact source linkage. These are diagnostics, not extra
  resolutions beyond the 69 generated cases above.

Local generated-seed replay (temporary preview only; canonical dirty seed
files were not overwritten):

- `python data/career-mapping/_gen_seed.py` with
  `CAREER_PILOT_SEED_OUTPUT_PATH=tmp/jamb_subject_queue_replay_20261008_04.sql`
  generated **69** exact IBASS institution-scoped exceptions.
- Preview totals: 420 JAMB identities, 8,117 offerings, 3,965 university
  requirement exceptions, 1,858 parsed university subject options, and 17,394
  parsed subject items. This is a local preview, not a live database change.
- Focused subject matcher/parser suite: **95 passed**.
- Exhaustive matcher audit: **passed**, 1,260 typed rules, 570 options, 8,211
  option items, 263 positive cases, 188 negative mutations, zero false-positive
  oracle mismatches.
- No SQL applied. No role/domain/guided-experience files edited.

Next work remains the 133 residual source rows. Continue exact programme-first
identification, then filter to the institution/offering and exact exam layer;
use a source-backed national rule only when the national IBASS programme cell
itself establishes it. Keep every unsupported, ambiguous, compound, or
cross-layer case hidden from exact matching. Reconcile the 143-vs-149 count
against its originating audit before adopting 143 as the remaining denominator.

## Deferral handoff — 2026-10-08 (supersedes the earlier “continue next” status)

**User instruction:** pause implementation of the subject-matcher remediation
until the Sociology guided-experience pilot is complete. Do not continue matcher
code or data changes during that pilot. This checkpoint is the only file to
update for this handoff. Do not edit Sociology files or apply SQL.

### Current matcher status at pause

- The unresolved-source inventory remains **149 baseline programme/layer
  rows** (131 O'Level, 18 UTME; 100 wording variants). The latest generated
  resolution artifact has **22 exact programme/layer groups** and **127
  residual rows**. The earlier user-cited 143 count has not been reconciled to
  this checked-in 149-row inventory; do not silently substitute one count for
  the other.
- Those 22 groups contain **115 exact programme + institution + exam-layer
  applications**. They are represented as institution-scoped exception and
  option rows; national requirements remain separate. No SQL has been applied.
- Latest residual reasons: 63 non-exact source statuses; 31 exact cells not
  executable; 19 with no source variant; 7 contaminated/compound texts; 3
  without an explicit O'Level credit total; 2 mixed exam/Direct Entry; 1
  programme/cell identity mismatch; 1 exact cell without matched institution
  codes; 1 compound-title-only identity; and 1 otherwise incomplete rule.
- The local seed preview at `tmp/jamb_subject_queue_replay_20261008_05.sql`
  was generated with **115** exact IBASS institution-scoped exceptions. It is
  only a preview; it did not overwrite the canonical seed and is not a live
  deployment.
- Most recent checks before pausing: **98 focused Python tests passed**;
  subject-option seed audit passed (**570 options; 2,131 represented
  slots/groups**); exhaustive matcher audit passed (**1,260 typed rules, 570
  options, 8,211 option items, 263 positive cases, 188 negative mutations,
  zero false-positive oracle mismatches**).
- The 127 residual rows remain excluded from exact student matching unless
  later resolved with exact national or institution/programme evidence. Do
  not infer missing pool membership from neighbouring programme rows.

### Work completed before the pause

- Exact programme/institution/page indexing and evidence checks in the scoped
  resolution builder; institution-specific rule candidates flow into the
  local seed generator, not national rules.
- A bounded parser rule for exact O'Level cells with an explicit credit total,
  named inclusions, and a truly unrestricted remainder; relevant/suitable or
  otherwise constrained remainder language remains held.
- Conflict handling now distinguishes overlapping institution rules from
  disjoint institution-specific rules, allowing only non-conflicting
  institutions to be emitted.
- Tests cover exact programme/institution evidence, open versus qualified
  O'Level remainders, layer separation, and disjoint versus overlapping
  institutional rules. Do not resume or extend these changes until the pilot
  completion gate below is met.

### Resume gate and exact next steps

Resume only after the user confirms the Sociology guided-experience pilot is
complete. At that point:

1. Re-read this checkpoint and
   `docs/manual-review/JAMB_SUBJECT_MATCHER_SOURCE_RESOLUTION_REFERENCE_2026-10-08.md`;
   inspect `docs/SOCIOLOGY_GUIDED_EXPERIENCE_PILOT_2026_10_08.md` only to
   confirm the pilot is complete, without editing it. Review `AGENTS.md` for
   the current subject-matcher/local-only and no-SQL deployment contract.
2. Inspect the current worktree and the exact current contents of the
   resolution JSON before changing anything. Confirm whether 143 refers to a
   newer/different audit population or whether 149 remains the correct base.
3. Continue in grouped batches using programme identity first, then exact
   institution/offering and exam layer. Resolve a national rule only from its
   national IBASS source; resolve institution-specific text only for the
   named offering. Keep unsupported/ambiguous rows hidden.
4. Apply only source-backed resolutions to local canonical matcher inputs or
   scoped overrides; regenerate into a new disposable preview path (never
   overwrite dirty seed files), then run the focused suite, subject-option
   seed audit, and exhaustive matcher audit.
5. Update this checkpoint with per-batch applied counts, residual/hidden
   counts and reasons, source locators, changed files, and test results. Do not
   apply SQL unless separately requested and authorized.

Exact verification commands for resumption (run after reviewing the current
worktree, and preserve a new preview filename):

```powershell
python data/career-mapping/_audit/build_jamb_subject_scoped_resolution_2026_10_08.py
python -m pytest data/career-mapping/_audit/test_jamb_subject_scoped_resolution_2026_10_08.py backend/tests/test_local_subject_exception_parser.py backend/tests/test_subject_option_parser.py backend/tests/test_subject_option_seed.py backend/tests/test_student_pipeline_match.py -q -p no:cacheprovider
python data/career-mapping/_audit_subject_option_seed.py
python data/career-mapping/_audit_subject_match_exhaustive.py
$env:CAREER_PILOT_SEED_OUTPUT_PATH='tmp/jamb_subject_queue_replay_<new-unique-id>.sql'
python data/career-mapping/_gen_seed.py
Remove-Item Env:CAREER_PILOT_SEED_OUTPUT_PATH
```

Relevant handoff/specification documents: this checkpoint;
`docs/manual-review/JAMB_SUBJECT_MATCHER_SOURCE_RESOLUTION_REFERENCE_2026-10-08.md`;
`docs/SOCIOLOGY_GUIDED_EXPERIENCE_PILOT_2026_10_08.md` (pilot completion gate
only); and the subject-matcher deployment constraints in `AGENTS.md`.
