# CCMAS Physiotherapy source audit — increment 007

**Access date:** 2026-09-28 (Africa/Lagos)  
**Mode:** audit-only. No CCMAS rows, mappings, or seeds were edited.  
**Primary source:** National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>.

## Scope and source order

Read Physiotherapy source-audit checkpoints 001–006 and the associated regression test before continuing. The six checkpoints identify 17 of 48 DPT-owned PST course blocks as already source-compared. Excluding those, the nine rows previously identified as Audiology/Speech-Language Therapy context, and the earlier course blocks, the earliest unchecked DPT-owned course in NUC global-table order across the requested 300/400/500-level sequence is **PST 311 — Introduction to Physiotherapy Profession** (300 level).

Compared the NUC global DPT course table (printed p. 587, source lines 22847–22849) and detailed PST 311 course block (printed p. 606, source lines 23585–23604) against the exact title-matched row in `data/career-mapping/ccmas/allied_health.json` → `Physiotherapy`. Matching by both course code and title is essential: the package also contains PST 311 rows owned by other CCMAS programme contexts.

## Field-by-field comparison

| Field | NUC source | Local Physiotherapy row | Finding |
|---|---|---|---|
| Course identity | PST 311, “Introduction to Physiotherapy Profession” | Same code and title | Matches. Other PST 311 rows in the package are not this DPT course and were not used as evidence. |
| Level | 300 Level | `level: 300` | Matches. |
| Units / status | 2 Units, C | `units: 2`, `status: C` | Matches. |
| Lecture / practical hours | LH 15; PH 45 | `lh: 15`, `ph: 45` | Matches both the global table and detailed course header. |
| Learning outcomes | Five outcomes: professional role/responsibilities; patient handling/management; documentation and clinical-parameter assessment; muscle/pain/joint-mobility assessment; walking-aid assessment | Five corresponding entries, with the same substantive content and sequence | Matches in count and substance. The source's awkward wording in outcome 2 (“familiar with…”) is also present in the local wording; this is source wording, not a local omission. |
| Course contents / summary | Full contents include professional history and responsibilities; patient/environment preparation; identification, history and examination (observation, palpation, movement); record keeping and vital signs; sensory tests and reflexes; muscle bulk/strength, pain and joint-range measurement; walking aids | `content_summary` has exactly 400 characters and ends mid-word at “Local Examination Observatio” | **Confirmed truncation:** the summary stops during the examination list and omits the remainder of the source contents, including record keeping, vital signs, sensory testing/reflexes, muscle assessment, pain/joint measurement, and walking aids. |
| Item-level source provenance | NUC URL and detailed locator above; source accessed 2026-09-28 | No `source_url`, `source_locator`, or `source_accessed_on` fields on the local row | **Provenance gap:** this row does not retain item-specific source attribution/access date. |
| Source conflict / extraction note | No title/load conflict in the checked global and detailed locations | No conflict/note fields on the row | No source-internal conflict identified for this course. The current checkpoint records the observed truncation and provenance gap; no note was added to the data row. |

## Audit result and next boundary

PST 311's identity, level, units, status, contact hours, and all five learning outcomes agree with the national CCMAS. Two confirmed local data-quality issues remain documented: the 400-character content-summary truncation and missing item-level source provenance. No institution-specific curriculum or provider-specific 30% evidence was required; national CCMAS is the baseline.

This increment brings the cumulative full-detail comparison to **18/48 DPT-owned blocks; 30 remain unchecked**. The next unchecked DPT course in global-table order is **PST 312 — Exercise Physiology**. This checkpoint does not close Physiotherapy or any wider programme audit. No `allied_health.json`, JAMB mapping, downstream mapping, or seed was edited.
