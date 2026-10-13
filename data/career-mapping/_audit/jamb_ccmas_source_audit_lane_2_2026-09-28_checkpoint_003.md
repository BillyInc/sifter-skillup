# Lane 2 source-audit checkpoint 003 — 2026-09-28

## CCMAS package 080: full global-structure identity reconciliation

Compared all **41** local German package rows against the four official NUC German global-structure tables (printed pp. 467–468). The NUC programme lists 41 source rows and totals 22, 26, 20 and 18 units across 100–400 levels. The local package also contains 41 rows, but equal row count masks substantial composition/code errors.

Confirmed local defects:

- 100 level: local `GST 112` (“Nigerian Peoples and Cultures”) should be `GST 113` according to the NUC table.
- 200 level: the NUC sequence is `GST 211`, `ENT 211`, `FAC 201`, and `GER 201–210`. Locally, `GST 212` carries the GST 211 title, `ENT 211` is absent, and extra `GST 222` and `FAC 202` rows appear. Do not repair from the title alone; verify the shared-course extraction/source rows before editing.
- 300 level: local `GST 312` is the NUC `GST 311` course (same title/theme, code mismatch).
- 400 level: local package omits `GER 407 Long Essay/Project`. The NUC table and detailed course block both establish this required course.

Source conflicts retained separately:

- The NUC global table labels the German 300-level listening/speech course `FRE 302`, while its detailed block is headed `GER 302`; the local row uses `GER 302`, which agrees with the detailed course block. Do not “correct” it absent NUC clarification.
- NUC's GER 407 global table reports 6 units with LH 30, while the detailed block reports 6 units and PH 270. Course inclusion is certain; contact-hour fields conflict.

The exact row-level comparisons and printed-page/PDF line locators are in checkpoint JSON 003. Course contents/outcomes are not yet fully reconciled. `GER 101` was opened in detail (checkpoint 002); package completion remains **0/79** because 38 further rows and the detailed field audit are open. No source JSON, mapping, or seed was changed.
