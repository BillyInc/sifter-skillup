# CCMAS Physiotherapy source audit — increment 008

**Access date:** 2026-09-28 (Africa/Lagos)  
**Mode:** audit-only. No CCMAS rows, JAMB data, mappings, or seeds were edited.  
**Primary source:** National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>.

## Scope and source comparison

Continued after increment 007, which checked PST 311 and reported 18/48 DPT-owned course blocks reviewed. The exact Physiotherapy-owned `PST 312 — Exercise Physiology` row was compared with its global DPT-table entry (printed p. 587, PDF lines 22843–22850) and detailed course block (printed pp. 606–607, PDF lines 23605–23619). The global row and detailed header agree: 2 units, compulsory, LH 15 and PH 45.

## Field-by-field findings

| Field | NUC source | Local Physiotherapy row | Finding |
|---|---|---|---|
| Identity and level | PST 312, Exercise Physiology, 300 Level | Same code/title; `level: 300` | Matches. The course was matched inside the Physiotherapy package, not by code alone. |
| Units/status/contact hours | 2 units, C, LH 15, PH 45 in both global table and detailed header | Same values | Matches; no source conflict. |
| Learning outcomes | Six outcomes: exercise physiology and therapeutic-exercise relevance; skeletal-muscle structure/function; common metabolism pathway; body-system adjustment to exercise; aerobic-exercise response and adaptation; effects on body organs | Six entries with matching substantive wording/order; sixth entry ends with `Allied Health Sciences 607 New` | **Confirmed extraction contamination:** page header/footer text was appended to the sixth outcome. Remove only the contaminating page furniture when repairing; preserve the source wording. |
| Course contents | Full source ends with body response to acute/single-bout exercise, chronic exercise adaptations, and effects on body composition | Summary is exactly 400 characters and ends mid-word at `chronic exerc` | **Confirmed truncation:** the local summary omits the remainder of chronic-exercise adaptation and the source's final body-composition topic. |
| Item-level provenance | Official NUC PDF; global and detailed locators above; accessed 2026-09-28 | `source_url`, `source_locator`, and `source_accessed_on` are absent/null | **Confirmed provenance gap:** retain the official item-specific URL, both relevant locators, and access date on repair. |
| Internal source conflict | Global and detailed course entries agree on course identity, units, status, and hours | No source conflict note | No conflict found; no conflict note is needed. |

## Audit result and next boundary

PST 312 is source-consistent for identity, level, units, status, contact hours, and the substantive content of all six outcomes, subject to the explicit footer contamination in the sixth local outcome. Two additional local data defects are confirmed: the 400-character course-content truncation and missing item-level source provenance. These findings are recorded regardless of severity. This is audit-only; the data row remains unchanged for the subsequent repair pass.

The cumulative full-detail comparison is now **19/48 DPT-owned blocks; 29 remain unchecked**. PST 313 has other same-code rows in the CCMAS package, so the next comparison must again resolve the exact row by programme context, code, and title. This increment does not close the Physiotherapy audit. No provider-specific 30% curriculum was required; national CCMAS is the baseline.
