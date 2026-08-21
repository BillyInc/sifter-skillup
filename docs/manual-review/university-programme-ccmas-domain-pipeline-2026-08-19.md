# University programme → CCMAS → domain pipeline audit — 2026-08-19

This audit follows every seeded university offering through its JAMB programme name, canonical CCMAS inheritance row, CCMAS component registry, and materialized domain links.

## Result

- University/programme offerings checked: **9130**
- Unique university/programme pairs checked: **9130**
- JAMB names represented by offerings: **420 / 420**
- Offerings with a ready full, reviewed partial, or reviewed external chain: **9130**
- Offerings held for CCMAS/domain/source review: **0**
- Structural errors: **0**

## What passed

- Every university offering resolves to a seeded JAMB programme row.
- Every offering name resolves to a canonical inheritance row.
- Every canonical CCMAS component resolves to a current CCMAS programme identity.
- The active domain map matches the canonical CCMAS-derived domain links.
- No demand data is used.

## Review boundary

The canonical chain contains **141 ready full rows**, **273 reviewed partial rows**, **6 reviewed external rows**, and **0 rows held for review**. A held row is still mapped structurally, but its CCMAS curriculum scope or source-backed domain evidence is not certified.

Machine-readable detail is in `university-programme-ccmas-domain-pipeline-2026-08-19.json`.
