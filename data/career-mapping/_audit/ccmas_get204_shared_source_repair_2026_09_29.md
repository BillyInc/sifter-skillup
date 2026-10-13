# Shared GET 204 source-backed repair — 2026-09-29

## Finding and correction

The CCMAS Engineering source package contains 32 programme copies of `GET 204`.
Each had a 400-character course summary ending mid-word at `bra`; the omitted
source content includes foundry/casting, forming and joining, heat treatment,
material removal, machine-tool/CNC work, electrical measurements, and energy
conservation. The title was also variably truncated, polluted with the next
course, or mojibaked in six package copies. The checked-in source was repaired
across all 32 copies to the source title and a complete, concise summary.

The six learning outcomes were retained unchanged. Programme-specific schedule
metadata was also retained unchanged: six copies have schedule values that
differ from the shared detailed course block, so those need separate comparison
against their respective programme tables. This repair does not mark those
schedule differences as confirmed errors.

## Source evidence

- Primary source: [NUC Engineering and Technology CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Engineering-Technology-CCMAS-2023-FINAL.pdf)
- Locator: shared `GET 204: Students Workshop Practice` detailed course block,
  printed pp. 1173–1174. It lists six outcomes and the full workshop syllabus.
- Accessed: 2026-09-29.

The finding originated in Lane 3's Structural Engineering package 174 audit
(increment 038); checking the shared copies exposed the same truncation and
title-extraction variants in the other package occurrences.

## Reproduction and regression coverage

```powershell
python data/career-mapping/_audit/repair_ccmas_get204_shared_content_2026_09_29.py
python -m pytest -q data/career-mapping/_audit/test_ccmas_get204_shared_content_repair_2026_09_29.py
```

The guarded repair updates only the 32 `GET 204` title/content/provenance
records. It refuses an unexpected row count, title, summary, or source state.
The test covers all 32 copies, source locators, preservation of package-level
schedule values, and retention of the six shared outcomes.
