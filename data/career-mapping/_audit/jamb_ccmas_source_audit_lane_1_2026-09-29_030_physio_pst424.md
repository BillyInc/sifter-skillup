# Lane 1 increment 030 — CCMAS Physiotherapy PST 424

**Access date:** 2026-09-29 (Africa/Lagos)  
**Scope:** package 038, Allied Health Sciences → DPT Physiotherapy, exact course PST 424.  
**Mode:** exact official-source comparison; no JAMB/offering mapping changed.

## Coverage and source

Increment 029 explicitly set PST 424 as the next cursor. I checked the existing lane-1 checkpoints and repair scripts for an exact PST 424 audit/repair, then inspected the local row. No previous exact course checkpoint or repair existed.

Primary source: National Universities Commission, *Core Curriculum and Minimum Academic Standards (CCMAS) for Nigerian Universities: Allied Health Sciences* (2023), <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Allied-Health-Sciences-2023.pdf>, accessed 2026-09-29.

| Field | NUC global course table, printed p. 588 | NUC detailed block, printed p. 619 | Local row before reconciliation |
|---|---|---|---|
| Identity | PST 424, Sports and Recreational Physiotherapy | Same title | Same title |
| Level, units, status | 400 level, 2 units, C | 2 Units C | 400, 2, C |
| LH / PH | LH dash; PH 45 | LH 30; no PH stated | LH 30; PH null |
| Learning outcomes | — | Five outcomes: discuss sports/recreation conditions; care principles; decision-making; clinical reasoning; examination/diagnosis/prognosis/intervention | Five outcomes corresponding in substance |
| Course contents | — | Sports/recreation injuries; knee, ankle, shoulder and other injuries; female-athlete issues; surgery; ergogenic aids; sport-setting physiotherapy; physical management, return-to-play, performance measures, sport-specific rehabilitation, prevention, fitness/motor-skill/anthropometric assessment | Exactly 400 characters; cuts off after “osteolysis of acromio-clavicular joint” |

## Findings and local reconciliation

1. Identity, level, units, status, and all five outcomes match the detailed source in substance.
2. **Hours are a source-internal conflict.** The global table says LH dash / PH 45; the detailed course heading says LH 30 and gives no PH. Neither is silently preferred. Existing `lh=30`, `ph=null` remain in place pending adjudication; the conflict and both printed-page locators are attached to the course row.
3. The content summary was truncated at the local 400-character limit. It is now completed from the detailed source, retaining the source's coverage through sports-specific rehabilitation, prevention and assessment.
4. Course-specific URL, printed locators and access date were added. Existing five learning outcomes were preserved.

The exact edit is guarded by `apply_ccmas_pst424_content_provenance_repair_2026_09_29.py`; regression coverage is in `test_ccmas_pst424_source_reconciliation_2026_09_29.py`. The saved JSON above records the pre-repair comparison and post-repair state. No hours value was invented or altered.

**Next cursor:** PST 425. Verify exact prior coverage before advancing.
