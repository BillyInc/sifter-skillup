# Quality remediation Lane 90 — final report

Batch: `quality_remediation_lane_90_20260922`  
Finalized: `2026-09-22`

## Exact reconciliation

The existing selection and append-only ledger reconcile exactly at the typed
subject identity level:

- Selection: **200/200** rows (`requested_count=200`, `shortfall=0`).
- Ledger: **200/200** valid JSONL rows.
- Missing ledger subject IDs: **0**.
- Extra ledger subject IDs: **0**.
- Duplicate subject IDs in selection: **0**.
- Duplicate subject IDs in ledger: **0**.

## Final decision counts

All 200 selected rows began as `review_required`:

| Final decision | Rows | Promotion status |
| --- | ---: | --- |
| `promoted` | 24 | `promoted` |
| `review_required` | 176 | `not_promoted` |
| **Total** | **200** | |

Decision transitions are therefore `review_required → promoted`: 24 and
`review_required → review_required`: 176.

## Coverage breakdown

- Context level: `role` — 200.
- Item type: `skill` — 172; `tool` — 28.
- Distinct role contexts: 77.
- Rows with search queries: 200.
- Rows with evidence entries: 200.
- Rows with reviewed authoritative routes: 38.
- Rows with an exact item locator: 54.

## Finalization boundary

No new searches were performed and no rows were appended. Existing ledger rows
were preserved. Relationships, catalogue data, SQL, seeds, UI, and browser
proof were not touched.

Source hashes:

- Selection JSON: `86e5549c7e1479f0fe7676b343daafad66e02fff3efc3d580b452bd242ba5088`
- Ledger JSONL: `2f777d10cf862ebfe81577ccc5ca03802d91f03413143ee612b6de909d1049f8`
