# Lane 1 increment 038 — DPT Physiotherapy PST 311 and PST 312

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** CCMAS Allied Health Sciences, exact DPT course rows PST 311 and PST 312.  
**Mode:** verify existing local repairs against primary sources; no duplicate edits.

## Why this check was needed

The package-level inventory documented repeated PST codes across DPT, Audiology, and Speech-Language Therapy. Code equality is not course identity. Earlier repair scripts already targeted the exact DPT title rows for PST 311 and PST 312; this increment independently verifies those current rows against the correct DPT source section.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| DPT course | Global table | Detailed source | Current local row | Result |
|---|---|---|---|---|
| PST 311 — Introduction to Physiotherapy Profession | Printed p. 587, lines 22847–22849: 2 C, LH 15, PH 45 | Printed p. 606, lines 23585–23604: five outcomes; history/profession, responsibilities, patient/environment preparation, assessment, documentation, vital signs, sensation/reflexes, muscle/pain/joint-range measures, walking aids | Exact DPT title/load, five outcomes, complete summary; URL, both locators and `source_accessed_on=2026-09-28` | **Verified; repair matches source.** The distinct Audiology/Speech-Language Therapy PST 311 rows were not used as evidence for this DPT row. |
| PST 312 — Exercise Physiology | Printed p. 587, line 22850: 2 C, LH 15, PH 45 | Printed pp. 606–607, lines 23605–23619: six outcomes; skeletal muscle, energy systems/fuels, metabolism, body-system adjustment, acute/chronic exercise responses and body composition | Exact DPT title/load, six outcomes, complete summary; URL, both locators and `source_accessed_on=2026-09-28` | **Verified; prior footer and truncation repairs match the source.** |

## Structural finding

The source confirms that same-code DPT rows must be joined to their exact programme/title occurrence. This is a structural cross-context risk already recorded in the ownership audit. It does not justify moving or deleting the other programme rows. No edits were needed in this increment.

Regression coverage is in `test_ccmas_pst311_pst312_source_verification_2026_09_29.py`.

**Next cursor:** PST 313. The lane-1 increment 011 already audited the repeated PST 313 source contexts; inspect that checkpoint and reuse it rather than reopening those three rows.
