# JAMB missing-content completion checklist

This is the exact manual work still needed for the JAMB layer. Complete only
the items below. Do not review CCMAS curricula, domains, subgroups or roles in
this task.

## Completion target

You are supplying source evidence from the original JAMB brochure PDFs so that
the parser can safely structure the admission content.

The target is not to re-enter the whole catalogue:

- **420** effective JAMB programme names already exist.
- **9,129** university/programme offering pairs already exist.
- **3,883** university-specific exception records are already preserved.
- **2,030** university-specific subject options are already structured.

## Task 1 — Resolve the national requirement cells

Complete the **170 national review layers covering 155 programme names** listed
in:

`docs/manual-review/brochure-subject-requirements-audit-2026-08-18.json`

For each row whose `source_status` is one of the following, open the listed PDF
candidate and confirm the correct source row:

- `multiple_primary_source_candidates` — 22 rows
- `one_primary_source_candidate` — 55 rows
- `source_row_found_but_primary_cell_empty` — 93 rows

For every affected programme/layer, supply:

```text
programme name
layer: UTME or O-LEVEL
original PDF filename
PDF page
table row
complete REQUIREMENTS cell, if O-level
complete UTME SUBJECTS cell, if UTME
any continuation/shared row
decision: exact rule | shared rule | condition only | source blank
```

The JSON already gives the candidate locations in:

```text
rows[].jamb_name
rows[].layer
rows[].source_candidates[].source_file
rows[].source_candidates[].page
rows[].source_candidates[].row
rows[].source_candidates[].cells
```

### What must be copied exactly

- Every named compulsory subject.
- Every alternative: “either”, “or”, “any two of”, “any three of”, etc.
- The total number of required credits for O-level.
- The number of sittings, if stated.
- Technical, trade or language alternatives exactly as written.
- Shared requirements referenced by “same as”, “as in” or “see …”.
- A genuinely blank cell, marked as `SOURCE IS BLANK`.

Do not replace an unclear phrase with a guessed subject list.

## Task 2 — Resolve the 47 programme-level UTME options

The current subject-option generator still reports **47 UTME programme options
as `needs_review`**. These are the highest-priority records because they affect
the subject picker and programme discovery.

For each one, provide the complete brochure **UTME SUBJECTS** cell and label it
as one of:

- `exact_rule`
- `alternative_rule`
- `shared_rule`
- `condition_only`
- `source_blank`
- `direct_entry_only`
- `needs_manual_interpretation`

If the UTME cell is shared by several programme names, send the entire shared
block and identify which names it applies to. Do not create separate rules
unless the brochure separates them.

The current generated summary is:

`docs/manual-review/complete-subject-requirement-classification-2026-08-18.md`

The exact structured rows are in its JSON companion. Search for programme
records with `status: "needs_review"`, then use the brochure audit JSON to find
the PDF page and row.

## Task 3 — Resolve university-specific admission exceptions

Complete the **657 university exception records** with `status:
"needs_review"` in:

`docs/manual-review/complete-subject-requirement-classification-2026-08-18.json`

Every record must be checked against the original brochure using:

```text
jambName + institution
```

For every record, provide:

```text
JAMB programme name
institution code/name
original PDF filename
PDF page and table row
complete waiver or exception text
route: UTME | O-LEVEL | DIRECT ENTRY | GENERAL NOTE
scope: full rule | partial condition | cross-reference | source blank
referenced programme, if any
```

### The 657 records by exact review type

| Review type | Count | What you must find and send |
|---|---:|---|
| `cross_reference` | 320 | The full text of the programme being referenced by “same as”, “as in” or “see …”, plus confirmation that it applies to this institution |
| `olevel_parse_failed` | 160 | The complete O-level requirement, including credit count, named subjects, alternatives and sitting condition |
| `utme_parse_failed` | 114 | The complete UTME subject combination, including mandatory subjects and every alternative group |
| `multiple_clauses` | 61 | All clauses, with each clause labelled UTME, O-level, Direct Entry or general note |
| `overlapping_other_groups` | 2 | The complete grouped text and the exact boundaries between the subject groups |
| **Total** | **657** | **All records above** |

### Exception records by original brochure

Use this table to choose the PDF. The repository source label is the JSON file
where the record is indexed; the second column is the original document to
open.

| Repository source | Original PDF | Records to review |
|---|---|---:|
| `sciences_offerings.json` | `Sciences.pdf` | 233 |
| `social_management_offerings.json` | `Social Management Science.pdf` | 89 |
| `engineering_offerings.json` | `Engineering _ Enviromental _ Technology.pdf` | 89 |
| `agriculture_offerings.json` | `Agriculture.pdf` | 82 |
| `administration_offerings.json` | `Administration.pdf` | 71 |
| `arts_hum_offerings.json` | `Arts _ Humanities.pdf` | 37 |
| `education_offerings.json` | `Education.pdf` | 27 |
| `medical_offerings.json` | `Medica_Pharmaceutical Health Science.pdf` | 24 |
| `law_offerings.json` | `Law.pdf` | 5 |

All PDFs are in:

`C:\Users\USER\Downloads\jamb brochure`

## Task 4 — Confirm offering identity only where needed

Do **not** manually re-enter all 9,129 offerings. Only report an offering if
you find that the repository has the wrong or missing school/programme pair.

For an offering correction, send:

```text
PDF filename
PDF page and table row
institution code/name
programme name exactly as printed
whether it is an offering, a name variation, or a waiver note
```

An institution appearing in the brochure's `COURSE/DEGREE` table is an
offering. A sentence in `SPECIAL CONSIDERATION (WAIVER) REMARKS` is not a new
offering unless the brochure explicitly identifies another programme/institution
pair.

## Required response format

Send the completed items in batches using this format:

```text
SOURCE: Sciences.pdf
PAGE: 228
TABLE ROW: 6
PROGRAMME: ANTHROPOLOGY (BIOLOGICAL)
INSTITUTION: IBADAN
LAYER: UTME | O-LEVEL | DIRECT ENTRY | WAIVER
BROCHURE TEXT: [complete copied cell and continuation]
DECISION: exact_rule | shared_rule | partial_condition | cross_reference | source_blank | direct_entry_only
REFERENCE: [target programme, if the text says “same as” or similar]
NOTE: [short explanation if the source row is shared or ambiguous]
```

For national requirements, leave `INSTITUTION` blank. For university
exceptions, never omit the institution.

## Do not complete these manually

- CCMAS programme curricula.
- CCMAS-to-domain mapping.
- Domain, subgroup or role links.
- Career resources.
- Labour-market or external curriculum evidence.
- Made-up subject alternatives.
- Direct Entry qualifications as UTME subjects.

Those are outside this JAMB source-feed pass.

## Completion order

Use this order so the most important missing content is resolved first:

1. Task 2: the 47 programme-level UTME options.
2. Task 1: the 170 national review layers and their 155 programme names.
3. Task 3: university `utme_parse_failed` and `cross_reference` records.
4. Task 3: university `olevel_parse_failed` records.
5. Task 3: multi-clause, overlapping-group and Direct Entry records.
6. Task 4 only when you find a genuinely missing or incorrect offering pair.

After you provide the source text, the parser, seed generation and subject
selection audits must be rerun. Source text alone does not make a rule active
until those checks pass.
