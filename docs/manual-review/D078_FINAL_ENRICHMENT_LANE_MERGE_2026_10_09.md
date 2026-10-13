# D078 final enrichment lane merge — 2026-10-09

Status: noncanonical review-only merge. No student approval, role-fit adjudication, API change, SQL change or subject-matcher change was made.

## Coverage

- Three repaired lane artifacts merged into one envelope: **215 record entries**, contiguous **001–215**, with **9** excluded philosopher record entries representing **15** excluded occurrences, and **206** remaining in-scope record entries.
- Each lane retains its original record schema and provenance inside `record`; this merge adds only lane/index/scope metadata.
- Mill's corrected final artifact was required to contain the complete 145–215 coverage; the invariant now passes.

## Lane sources

- `001-072`: 72 entries (72 in scope, 0 excluded record entries, 6 excluded occurrences), source `data\career-mapping\_audit\d078_role_item_lanes_2026_10_09\qa-001-072\repaired-package\d078_role_item_final_repair_overlay_001-072_2026-10-09.json`.
- `073-144`: 72 entries (70 in scope, 2 excluded record entries, 2 excluded occurrences), source `data\career-mapping\_audit\d078_role_item_lanes_2026_10_09\qa-073-144\D078_ROLE_ITEM_QA_REPAIRED_073-144_2026_10_09.json`.
- `145-215`: 71 entries (64 in scope, 7 excluded record entries, 7 excluded occurrences), source `data\career-mapping\_audit\d078_role_item_lanes_2026_10_09\qa-145-215\D078_ROLE_ITEM_QA_REPAIRED_FINAL_145-215_2026_10_09.json`.

## Safety boundary

The merged envelope is an evidence handoff, not a route decision. Items remain hidden until the programme/domain/area/role checkpoint, direct task evidence, source roles, Nigerian scope and learning-link requirements are independently satisfied. The subject-matcher workstream remains separate.

Machine-readable artifact: `data/career-mapping/_audit/d078_final_enrichment_lane_merge_2026_10_09.json`
