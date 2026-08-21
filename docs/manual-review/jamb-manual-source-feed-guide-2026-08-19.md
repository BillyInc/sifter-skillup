# JAMB manual source-feed guide

This guide is deliberately JAMB-scoped. It does not ask for CCMAS curriculum
evidence or domain-mapping decisions. The CCMAS PDFs will be handled
separately; this file identifies the JAMB brochure cells that still need a
human to read and feed back.

## What is actually missing

The university offering rows themselves are not missing. The current seed has
**9,129 university/programme offering pairs**. The unresolved material is the
admission text attached to some of those offerings and a smaller set of
national requirement cells:

| Layer | Current state | What you need to provide |
|---|---:|---|
| JAMB programme catalogue | 420 effective programme names | Nothing unless a name or offering is absent from the source |
| National requirement rows | 1,260 rows across UTME, O-level and Direct Entry | The original brochure cell where the current text is ambiguous, blank, or not safely structured |
| National programme-level UTME options | 47 still structurally under review | The complete UTME SUBJECTS cell, including every alternative and “any of” clause |
| National rows requiring source review | 170 layer records across 155 programmes | The brochure PDF page/row that proves which candidate row is the correct one |
| University-specific exception records | 3,883 preserved records; 657 still under review | The complete waiver/exception text and its correct route/scope for that university and programme |
| Structured university subject options | 2,030 already structured | Only send corrections or missing source text; do not re-enter these unless the source is wrong |

The **9,129 offerings are therefore not 9,129 missing items**. An offering is
the school + programme pair. The manual work concerns the requirement or waiver
text attached to a subset of those pairs.

## The original documents to open

Use the PDFs in:

`C:\Users\USER\Downloads\jamb brochure`

The repository also contains extracted text copies for faster searching, but
the PDF page is the preferred source location to send back.

| Repository source label | Original brochure file | Use it for |
|---|---|---|
| `Administration.pdf` / `administration_offerings.json` | `Administration.pdf` | Administration, management, accounting, finance, marketing and related offerings |
| `agriculture.txt` / `agriculture_offerings.json` | `Agriculture.pdf` | Agriculture, animal science, crop, forestry, fisheries and food/agricultural offerings |
| `arts_hum.txt` / `arts_hum_offerings.json` | `Arts _ Humanities.pdf` | Arts, languages, history, philosophy, religious studies and humanities |
| `education.txt` / `education_offerings.json` | `Education.pdf` | Education programmes and education specialisations |
| `engineering.txt` / `engineering_offerings.json` | `Engineering _ Enviromental _ Technology.pdf` | Engineering, environmental technology and built-environment offerings |
| `Law.pdf` / `law_offerings.json` | `Law.pdf` | Law offerings and their special considerations |
| `medical.txt` / `medical_offerings.json` | `Medica_Pharmaceutical Health Science.pdf` | Medicine, pharmacy, nursing, allied-health and health-science offerings |
| `Sciences.pdf` / `sciences_offerings.json` | `Sciences.pdf` | Biological, physical, mathematical, computing and other science offerings |
| `Social Management Science.pdf` / `social_management_offerings.json` | `Social Management Science.pdf` | Social-science, management and business offerings |
| `Specific Entry Requirements.pdf` | `Specific Entry Requirements.pdf` | Shared, special, cross-referenced or general JAMB entry notes |

If a source label ends in `.txt`, do not search for a literal TXT file in the
Downloads folder. It is the repository's extracted copy of the corresponding
brochure PDF shown in the table.

## Where to look inside each brochure PDF

For a normal programme row, find the programme name and institution code in the
table. Read all four relevant columns together:

```text
COURSE/DEGREE
REQUIREMENTS
UTME SUBJECTS
SPECIAL CONSIDERATION (WAIVER) REMARKS
```

Do not copy only the line containing the programme name. A continuation row or
a nearby shared heading may contain the actual requirement. When the text says
“same as …”, “as in …”, “see …”, or groups multiple programme names under one
column, include the referenced programme or the entire shared block.

For every university-specific item, search the PDF for both:

1. the JAMB programme name; and
2. the institution code/name in the exception record.

Then inspect the **SPECIAL CONSIDERATION (WAIVER) REMARKS** column and any
continuation immediately below it. The institution code is important: a waiver
for one university must not become a national rule or a rule for another
university.

## The exact repository indexes to use

These files tell you which source row to find; they are not substitutes for the
original brochure page.

### National requirements

Open:

`docs/manual-review/brochure-subject-requirements-audit-2026-08-18.json`

For each review item, use:

```text
rows[].jamb_name
rows[].layer
rows[].source_candidates[].source_file
rows[].source_candidates[].page
rows[].source_candidates[].row
rows[].source_candidates[].cells
```

The readable summary is:

`docs/manual-review/brochure-subject-requirements-audit-2026-08-18.md`

When there is more than one `source_candidates` entry, the source review must
choose the correct programme row. When `source_row_found_but_primary_cell_empty`
appears, inspect the continuation/shared row rather than inventing a rule.

### University-specific exceptions and offerings

Open:

`docs/manual-review/complete-subject-requirement-classification-2026-08-18.json`

Filter `universityExceptions` to records where:

```text
status == "needs_review"
```

For each record, use these fields to locate the original text:

```text
rowId
exceptionId
jambName
institution
sourceJson
sourceLabel
text
reason
rawRoute
```

`sourceLabel` is the exact repository extraction key. In the original PDF,
search the `jambName` and `institution` together. The `text` field is the
current extracted wording that needs confirmation, not an approved final rule.

The current 657 records are grouped as follows:

| Review reason | Records | What to copy from the brochure |
|---|---:|---|
| `cross_reference` | 320 | The full target programme text referred to by “same as”, “as in” or “see …”, plus the university context |
| `olevel_parse_failed` | 160 | The complete O-level REQUIREMENTS cell, including sitting limits, total credits, named subjects and alternatives |
| `utme_parse_failed` | 114 | The complete UTME SUBJECTS cell, including mandatory subjects, alternatives and “any two/three” groups |
| `multiple_clauses` | 61 | Every clause and which clause applies to UTME, O-level, Direct Entry or a general note |
| `overlapping_other_groups` | 2 | The complete grouped text and the intended subject group boundaries |

Some of these 657 records are Direct Entry notes. They should remain a
separate Direct Entry route; do not turn a qualification such as ND, HND, NCE,
IJMB or A-level into an ordinary UTME subject choice. Send the text if the
Direct Entry display also needs to be corrected.

## What to send back to me

You can send one record or a batch. This format is enough:

```text
SOURCE: Sciences.pdf
PAGE: 228
TABLE ROW: 6
PROGRAMME: ANTHROPOLOGY (BIOLOGICAL)
INSTITUTION: IBADAN
LAYER: UTME | O-LEVEL | DIRECT ENTRY | WAIVER
BROCHURE TEXT: [copy the complete cell or shared continuation]
DECISION: exact rule | shared with [programme] | condition only | direct entry only | source is blank
NOTE: [anything needed to explain a continuation or ambiguity]
```

For a national row, leave `INSTITUTION` blank. For a university exception,
always include the institution code/name. If the brochure has no requirement
in that cell, write `SOURCE IS BLANK` and give the page/row; blank is valid
source evidence and must not be replaced with a guessed requirement.

## How to prioritise the manual review

1. **National UTME cells**: resolve the 47 programme-level UTME options first,
   because they control the subject picker and programme discovery.
2. **National O-level cells**: resolve the rows where the brochure gives a
   sitting condition, named subject group or technical/trade alternative.
3. **University UTME exceptions**: resolve `utme_parse_failed` and
   `cross_reference` records that affect subject matching.
4. **University O-level exceptions**: resolve `olevel_parse_failed` records.
5. **Multiple-clause and Direct Entry notes**: classify their route and keep
   non-subject qualifications out of the UTME/O-level picker.

## Important boundaries

- Do not use a university-specific waiver as a national JAMB requirement.
- Do not treat a university offering as proof that its admission subjects are
  identical to another university's subjects.
- Do not turn “any other relevant subject” into a made-up fixed list unless the
  brochure defines the list.
- Do not convert Direct Entry qualifications into UTME subjects.
- Do not silently fill a blank brochure cell from memory or from another
  university.
- Send the PDF page and row whenever possible. That lets the source text be
  rechecked before the seed is changed.

## Existing machine-readable reports

- National source candidates: `docs/manual-review/brochure-subject-requirements-audit-2026-08-18.json`
- All classified national and university rows: `docs/manual-review/complete-subject-requirement-classification-2026-08-18.json`
- Offering/subject structural audit: `docs/manual-review/subject-programme-university-audit-2026-08-18.md`
- Subject-selection behavior audit: `docs/manual-review/subject-selection-matrix-run-2026-08-18.md`

This guide should be used to supply source evidence only. After the evidence
is fed back, the parser and audits still need to be rerun before any admission
rule is treated as complete.
