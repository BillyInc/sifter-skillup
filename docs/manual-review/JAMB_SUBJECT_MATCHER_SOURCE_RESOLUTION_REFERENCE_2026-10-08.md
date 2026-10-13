# JAMB Subject Matcher: Source-Resolution Reference

Date: 2026-10-08  
Scope: JAMB/IBASS subject matching only. This document does not reopen the
programme-to-domain, area-of-specialization, or role work.

## Purpose

Use this document when resuming the subject-matcher task with a new agent. The
matcher must represent what the source actually says for the relevant exam
layer and offering. It must not turn a vague phrase into a guessed faculty or
stream-wide subject pool.

## Authoritative source order

1. Use the JAMB/IBASS Eligibility Checker with the exact entry mode,
   institution, and programme selected.
2. Read the matching IBASS programme/institution row, including the O'Level
   requirement, UTME combination, and Special Consideration/Waiver Remarks.
3. Use the official IBASS brochure-by-programme or brochure-by-institution
   PDF as the durable source locator when the checker presents the same row.
4. Use an institution's own current admission document only as a separately
   recorded corroborating source; it must not silently replace the IBASS row.
5. General websites and faculty lists are discovery aids only. They cannot
   define a universal meaning for `relevant`, `suitable`, `appropriate`, or
   `including`.

JAMB's own FAQ directs candidates to IBASS for institution/programme-specific
   UTME combinations. The checker asks for institution and programme, accepts
   O'Level credits separately from UTME subjects, and keeps institution and
   programme selection in the eligibility workflow. That is why an offering
   row, rather than a bare JAMB programme name, is the unit of resolution.

## Exact handling of wording

### `including`

Named subjects after `including`, `to include`, `must include`, or equivalent
wording are required subjects for that source rule. Do not treat the named
subjects as the complete list unless the source says so.

The remaining credit slots may become executable only when the same source
also supplies a defensible scope, for example:

- an explicit named list or category (`any two Science subjects`);
- an explicit open remainder (`any other two subjects`) with a fixed credit
  count; or
- a source-supported university waiver that names the alternatives.

If multiple remaining slots have no source-stated scope, retain the exact
source text as structured review evidence. Do not fill the slots from the
other exam layer, a faculty label, or the whole catalogue.

### `relevant`, `suitable`, `appropriate`, and similar terms

These words are not themselves subject pools. Resolve them in this order:

1. Identify the exact institution/programme cell that contains the wording.
2. Inspect the same row's waiver/special-consideration text.
3. If the waiver names the permissible subjects or a bounded category, create
   a matchable rule only for that institution/programme and exam layer.
4. If the waiver does not resolve the wording, check the exact institution's
   current official admission requirement for corroboration and retain its
   URL, date, and locator.
5. If no authoritative source supplies a bounded pool, keep the rule
   `structured_source`/review-required and exclude it from exact picker
   matching. It may remain visible to admins with its source text.

Do not promote an institution's interpretation into the national programme
rule. A national rule and a university exception must remain separate records.

### `suitable/relevant` in O'Level versus UTME

Resolve each exam layer independently. An O'Level phrase cannot inherit a
UTME pool, and a UTME phrase cannot inherit an O'Level pool. A cross-reference
such as `same as ...` or `as in ...` may be followed only when the referenced
source row is explicit and its locator is retained.

## Data and provenance contract

Every resolved exception must retain:

- canonical JAMB programme identity;
- exact institution identity and offering/programme key;
- exam layer (`olevel` or `utme`);
- raw source wording;
- normalized executable rule and subject codes;
- source URL, PDF filename/page/table row or checker locator;
- source access date;
- whether the row is national, institution-specific, or a waiver;
- parser status (`matchable`, `structured_source`, `cross_reference`, or
  `source_missing`); and
- the reason a vague phrase was or was not resolved.

The matcher must use only `matchable` typed rules and verified institution
exceptions. `structured_source` is not a failed source lookup; it means the
source is present but cannot safely be converted into an exact rule yet.

## Catalogue and stream contract

The current local catalogue contains 82 canonical subject codes. The current
JAMB UTME picker layer contains 23 approved UTME subjects; the catalogue also
contains O'Level-only subjects used by brochure requirements. Subject aliases
must resolve to an existing canonical code and must not create a new subject
without source evidence.

Each catalogue row has:

- `exam_types`: the exam layers in which that subject is selectable;
- `category`: the subject family used for display and source-category rules;
- `stream_tags`: school-stream visibility tags.

Stream tags are not admission rules. They control the student's picker only.
The exact national requirement and exact university/offering exception always
take precedence in eligibility matching.

Supported picker streams are Science, Arts, Commercial, and Technical /
vocational. Cross-listed subjects retain every applicable tag. Selecting a
stream filters both the O'Level and UTME subject pickers after the exam-layer
filter is applied; it does not remove a subject from the canonical catalogue
or rewrite a programme rule. Core subjects remain available in each stream.

Technical-category O'Level rows are tagged for the Technical / vocational
picker while retaining any existing Science, Arts, or Commercial tags. This
is a visibility classification, not a claim that every technical subject is
an approved UTME subject.

## Required audit sequence

Run from the repository root after every source or parser change:

```powershell
python data/career-mapping/_audit/inventory_jamb_unresolved_subject_pools_2026_10_08.py
python data/career-mapping/_audit_subject_option_seed.py
python data/career-mapping/_audit_subject_match_exhaustive.py
python -m pytest backend/tests/test_subject_option_parser.py backend/tests/test_subject_option_seed.py backend/tests/test_local_subject_exception_parser.py backend/tests/test_student_pipeline_match.py -q -p no:cacheprovider
```

The inventory is a queue, not a defect count. At the 2026-10-08 checkpoint it
contained 149 programme/layer rows (131 O'Level and 18 UTME) across 100 source
text variants. The next pass must reduce that queue only by attaching exact
source-backed institutional resolutions or by explicitly documenting why a
row remains non-matchable. It must not reduce the count by guessing.

## Completion criteria

The subject-matcher lane is complete only when:

- every catalogue code has source-backed exam-layer and stream metadata;
- the 420 canonical JAMB identities remain represented;
- national rules and institution/offering exceptions remain distinct;
- all resolvable `including`/`relevant`/`suitable` rows have exact source
  locators and executable rules;
- genuinely unresolved rows remain admin-visible but student matching is
  fail-closed for them;
- stream filtering is tested independently for O'Level and UTME, including
  cross-listed and Technical rows; and
- the subject-option seed audit and exhaustive matcher audit pass.

No local seed or audit result is evidence that SQL has been applied to
Supabase. SQL application remains a separate, manually verified deployment
step.

## Current checkpoint references

- `docs/manual-review/JAMB_SUBJECT_MATCHER_RELEVANT_SCOPE_CHECKPOINT_2026-10-08.md`
- `data/career-mapping/_audit/jamb_unresolved_subject_pools_2026_10_08.json`
- `data/career-mapping/_audit/jamb_subject_catalog_original_pdf_audit_2026_10_08.md`
- `data/career-mapping/_parse_subject_options.py`
- `data/career-mapping/_gen_subject_rule_records.py`
- `data/career-mapping/_audit_subject_option_seed.py`
- `data/career-mapping/_audit_subject_match_exhaustive.py`
