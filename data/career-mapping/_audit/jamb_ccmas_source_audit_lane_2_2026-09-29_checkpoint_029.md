# Lane 2 source-audit checkpoint 029 — German CCMAS courses GER 202–206

## Source and scope

Audited course ordinals 16–20 of CCMAS package index 080 against the exact NUC Arts CCMAS 2023 course blocks, printed pp. 477–479. Primary source: [NUC Arts CCMAS PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-29.

## Decisions handed to local reconciliation

- **GER 202:** Match; metadata, all six outcomes, and content summary agree.
- **GER 203:** Seven NUC outcomes are compressed into six local entries; local outcome 5 combines the source comprehension and translation outcomes. Split them and preserve the seven-item sequence.
- **GER 204:** The local record has missing practical-hour metadata and field spill. More importantly, NUC repeats the same course code/title/load twice with two different outcome/content blocks: an initial five generic German outcomes and a second set of four grammar-specific outcomes. Preserve both source variants for adjudication; do not silently discard either. Both headers support PH 90.
- **GER 205:** Five outcomes match, but the local content summary truncates and its tail spills into the final outcome. The official source also appends broader B.A. German capabilities to the listening-course content; preserve that as source text, not as extra listening outcomes.
- **GER 206:** Match; metadata, four outcomes, and content summary agree.

No shared ledger was changed. The two source-scope conflicts are explicitly held from unqualified student-facing promotion. The exact next cursor is recorded in JSON.

**Next cursor:** CCMAS package index 080, course ordinals 21–25; then JAMB identity row 144.

Regression coverage: `test_jamb_ccmas_source_audit_lane_2_checkpoint_029.py`.
