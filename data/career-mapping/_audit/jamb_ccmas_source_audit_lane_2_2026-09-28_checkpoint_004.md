# Lane 2 source-audit checkpoint 004 — 2026-09-28

## Package 080 detailed rows 001–010

Continued the NUC source comparison for the German CCMAS package. This is still audit-only; the source JSON and generated data were not changed.

Source: NUC Arts CCMAS (2023), official PDF <https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf>, accessed 2026-09-28. The relevant course blocks are printed pp. 469–471.

| Row | Result |
|---|---|
| GST 111 | Code/title/units/status/hours match, but the local content summary is exactly 400 characters and stops mid-phrase. NUC content continues through writing, comprehension, ICT and communication topics: confirmed truncation. |
| GST 112 | Previously confirmed code mismatch (NUC German structure prints GST 113); local content summary also stops at 400 characters mid-sentence. |
| GER 101 | Confirmed missing local content and outcome-array contamination; source has eight outcomes and a defined German alphabet/phonetics/basic-grammar content block. |
| GER 102 | The seven outcomes and sound-system/language-lab summary match the source fields compared; item-level provenance remains absent, so this is not yet a fully closed package row. |
| GER 103 | Local has six outcomes; the source has a separate translation/evaluation outcome that is absent. Local outcome 5 merges statements, and its 400-character summary ends mid-sentence. Confirmed defect. |
| GER 104–108 | Not yet fully compared; do not infer a match from their titles or neighboring rows. |

Detailed row evidence is in checkpoint JSON 004. Together with the structural comparison and GER 101 from checkpoint 002, package 080 currently has **8 confirmed local defects** and **2 NUC-internal conflicts**; none have been repaired in this agent lane. The package remains incomplete: 5/41 rows received detailed comparison, with 36 still open.
