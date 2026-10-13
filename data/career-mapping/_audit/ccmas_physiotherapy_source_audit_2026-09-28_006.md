# CCMAS Physiotherapy source audit — increment 006

**Access date:** 2026-09-28 (Africa/Lagos)  
**Mode:** audit-only. No CCMAS source data, JAMB mapping, downstream links, or seeds were edited.  
**Primary source:** National Universities Commission (NUC), *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>.

## Scope and progress

Increment 005 closed PST 614 and PST 621–623. This append-only increment checks the next and final two DPT-owned 600-level PST blocks: **PST 624 and PST 625**. The NUC global table lists no PST 626. For each course, the local Physiotherapy row was checked against both its NUC global-table entry and detailed block: code, title, level, units, status, LH/PH, outcomes, content, and available provenance/conflict fields.

The detailed source comparison now covers **17 of 48** Physiotherapy-owned PST course blocks; **31 remain unchecked**. This closes the 600-level course-block sequence only; it does not close the full 48-course audit, the Physiotherapy package, or any broader selected-programme audit.

## Findings

| Course | Official NUC evidence | Local comparison | Finding |
|---|---|---|---|
| **PST 624 — Disability Issues** | Global table, printed p. 589, lines 22951–22951: 1 C, LH 15, PH dash. Detailed block, printed p. 629, lines 24489–24508: title “Disability Issues,” 1 Unit C/LH 30; three outcomes on disability in social/cultural context, relationships among disease/deformity/disability/habilitation/rehabilitation, and physiotherapy's clinical/non-clinical/advocacy role. Contents span terminology and causes; community and community-based rehabilitation; reintegration; psychosocial and family-finance issues; participation/access; and disability policy, advocacy, legislation and conventions. | Local code/title/level, 1 unit/C and all three outcomes agree with the detailed block. LH 30 agrees with the detailed block but conflicts with global LH 15. PH null follows the global dash; the detailed block supplies no PH value. The content summary ends at “Com”, omitting most of the detailed content. No row-level source URL, locator, access date, or conflict note is present. | **Source-internal LH conflict (15 global vs 30 detailed); confirmed truncated content summary; missing item-level source provenance and conflict annotation.** Do not silently choose a global or detailed load as universally authoritative. |
| **PST 625 — Physiotherapy in Integumentary and Skin Care** | Global table, printed p. 589, lines 22952–22954: 1 C, LH 15, PH dash; title wraps as “Physiotherapy in Integumentary and / Skin care.” Detailed block, printed p. 629, lines 24509–24529: title “Physiotherapy in Integumentary and Skin Care,” 1 Unit C/LH 30; four outcomes on common skin conditions, decision principles, beginning-level care, and clinical judgment. Contents span skin anatomy/physiology; infections, burns, wounds, dermatologic and lymphatic conditions; interventions; specific disorders; tests/prognosis; and physiotherapy in dermatological conditions. | Local code/title/level, 1 unit/C and all four outcomes agree with the detailed block. LH 30 agrees with the detailed block but conflicts with global LH 15. PH null follows the global dash; the detailed block supplies no PH value. The content summary ends at “Specif”, omitting the remaining condition list and final topics. Global “Skin care” vs detailed/local “Skin Care” is capitalization only. No row-level source URL, locator, access date, or conflict note is present. | **Source-internal LH conflict (15 global vs 30 detailed); confirmed truncated content summary; missing item-level source provenance and conflict annotation.** Title capitalization is not a substantive identity discrepancy. |

## Comparison method and disposition

- Global-table evidence: printed p. 589, lines 22951–22954. Detailed evidence: printed p. 629, lines 24489–24529. These are the NUC document's printed page numbers, not PDF page indexes.
- Each outcome was checked against the corresponding numbered detailed-block outcomes; the local outcome counts and concepts match both source blocks. The missing material is in `content_summary`, not in the listed learning outcomes.
- For both rows the global table says LH 15 while the detailed course header says LH 30. This is a source-internal discrepancy, not a basis to infer the local value is wrong in one direction. The detailed block does not state PH; the global dash supports the local null representation.
- Both local summaries stop within a word and omit substantial source topics. The existing extractor's 400-character cap is a plausible mechanism, but the audit records the observed truncation, not an inferred fix.
- Neither row carries item-specific NUC URL/locator/access-date provenance or a local conflict note. These are recorded as metadata gaps; no data was changed.
- No provider-specific curriculum was needed or consulted. Missing provider-specific 30% curriculum is not used as a reason to treat either CCMAS course as unavailable.

**Next scope:** the remaining 31 unchecked DPT-owned blocks are outside this final 600-level increment and must be continued from the next unaudited block in the 300/400/500-level source sequence. Do not count the package complete until all 48 owned blocks and the already documented ownership/source-context issues have been reconciled.
