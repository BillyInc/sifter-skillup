# relationship_quality_scaling_lane_20260923

Relationship evidence only. This scaling-lane report reconciles the canonical backlog against existing append-only relationship ledgers.
No relationship, catalogue, SQL, seed, UI, or student-facing data was changed.

## Exact reconciliation

- Canonical inventory rows: **2305**
- Canonical IDs saved in scaling ledger: **2305**
- Canonical IDs missing after save: **0**
- Duplicate rows in scaling ledger: **0**
- Promotable: **0**
- Remain unestablished: **2305**
- Review required: **2305**

## Candidate disposition

- Endpoint-name candidates without typed target endpoints: **8**
- Rows with no target endpoint: **2297**
- No candidate was promoted. All retained candidates remain audit/review-only.

## Retained source evidence

- Records with retained inventory context references: **2305**
- Records with retained item-specific candidate evidence: **125**
- Retained evidence entries: **7038**
- Retained URLs: **9753**
- Retained locators: **4654**

Item-specific candidate evidence is a conservative retention metric: search routes and generic ESCO/O*NET landing pages are excluded. It is not an approval or promotion signal.

## Historical ledger reconciliation

- Existing 2026-09-23 quality-lane canonical coverage before this pass: **2305 / 2305**
- Missing canonical IDs processed by the targeted ledger: **0**
- Existing targeted-ledger rows, including its one overlap: **9**
- Historical ledger rows read: **4697**
- Historical IDs outside the canonical inventory: **4**

## Artifacts

- Append-only detail ledger: `relationship_quality_scaling_lane_20260923_append_only_ledger.jsonl`
- Per-record selection: `relationship_quality_scaling_lane_20260923_selection.json`
- Checkpoint: `relationship_quality_scaling_lane_20260923_checkpoint.json`
- JSON report with per-ID retained URLs/locators: `relationship_quality_scaling_lane_20260923_report.json`

The final state is deliberately not student data: `review_required` / `remain_unestablished` with `promotable: false` for every canonical ID.
