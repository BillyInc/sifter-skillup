# JAMB offering-source verification — Lane B checkpoint 002

Date: 2026-09-26  
Status: bounded increment complete; stopped at the requested boundary

## Scope completed

Reviewed only the first 20 deterministic occurrence records in
`data/career-mapping/jamb/arts_hum_offerings.json` (Arts rows 1–20). No
Social/Management, Medical, or Law occurrence was scanned or edited in this
increment. The only source artifact edited was the Arts offerings file; this
checkpoint and the focused test are the accompanying Lane-B artifacts.

## Increment counts

- Occurrences reviewed: 20
- Exact local extracted brochure-window evidence attached: 2
- Explicit evidence holds attached: 18
- URL plus precise locator/date added: 2
- Source-verification metadata records added: 20

Verified occurrences:

1. `Classical Studies` — `IBADAN`; `arts_hum.txt:375-384` (printed p. 138).
2. `Christian Studies` — `AJAYI`, `ILORIN`, `KWASU`; `arts_hum.txt:449-452`.

The other 18 records are explicit `evidence_hold` states. Their local window
references remain discovery/audit context only; no official URL, PDF locator,
or verification date was promoted without an independently provable exact
programme/institution cell.

## Current four-file Lane-B ledger counts

Across the 117 occurrence records in the four assigned files:

- `source_verification.verified_against_pdf == true`: 3
- Prior `source_context_status == source_text_confirmed`: 2
- `source_verification.verified_against_pdf == false` explicit holds: 19
- Records with no Lane-B verification state yet: 93

The prior counts include the pre-existing Social/Management evidence and hold
states; this increment adds two verified Arts records and 18 Arts holds.

## Focused test

Added `test_jamb_source_repair_lane_b_increment_001.py`. It checks the first 20
Arts records, exact local source windows for both verified records, hold shape
for the remaining 18, and that rows after the bounded boundary remain
untouched. Run:

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-001-20260926 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_001.py -q
```

Result: `1 passed`.

## Resume boundary

When instructed to continue, resume at Arts occurrence 21. Do not scan beyond
the bounded increment or touch other assigned files until then. No CCMAS,
mapping/scope, seed, SQL, taxonomy, role, or UI artifacts were changed.
