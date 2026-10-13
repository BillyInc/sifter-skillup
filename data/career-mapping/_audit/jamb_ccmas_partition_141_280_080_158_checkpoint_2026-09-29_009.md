# JAMB 141–280 / CCMAS 080–158 source-review checkpoint 009

**Date:** 2026-09-29 (Africa/Lagos). This append-only increment corrects the resume cursor in checkpoint 008 and audits the next uncovered course row.

## Cursor reconciliation

Checkpoint 008 pointed to course ordinal 11. That row and ordinals 12–24 (`GST 212`, `GST 222`, `FAC 201`, `FAC 202`, and `GER 201`–`GER 210`) were already detailed source-checked in increment 003. They are skipped. The correct next row was ordinal 25.

## CCMAS package 080, course ordinal 25

**GST 312 — Peace and Conflict Resolution.** Source: [NUC Arts CCMAS 2023](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), printed pp. 481–482, detailed course block; accessed 2026-09-29.

The detailed block confirms code/title, 2 units, C status, LH 30, and all five local outcomes. The earlier global-structure discrepancy (`GST 311`) remains a source conflict. The content summary has an inserted “Learning Outcomes” label and ends early; it omits the source continuation on peacebuilding, law, ADR, international bodies, media, and post-conflict situations. Content field disposition: `confirmed_defect`.

## Current coverage

JAMB rows 141–280: **140 identities / 141 parsed occurrences**. Rows 141–150 remain **6 exact-cell complete, 2 partial, 2 unresolved**; row 141 remains the active JAMB cursor.

CCMAS indices 080–158: **79 packages / 3,144 course rows**. Package 080: **42/42 global-table rows compared**; **23 new detailed rows checked in increments 001–009**, plus **2 prior closed rows reused**, for **25/42 detailed rows with source evidence and 17 remaining**. Complete packages: **0/79**.

Next cursors: JAMB row 141 / `88a6f6c47de0853e`; CCMAS package 080 / course ordinal 26 (`arts.json::Modern European Languages B.A (German)::0026`). No shared ledger or out-of-partition data was touched.
