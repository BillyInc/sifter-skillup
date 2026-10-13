# JAMB offering-source verification — Lane B checkpoint 003

Date: 2026-09-26  
Status: bounded increment complete; stopped at the requested boundary

## Scope completed

Continued from checkpoint `jamb_source_repair_lane_b_incremental_checkpoint_2026-09-26_002.md` without repeating Arts rows 1–20. Reviewed only Arts occurrence records 21–40 in
`data/career-mapping/jamb/arts_hum_offerings.json`. Social/Management, Medical,
and Law were not scanned or edited in this increment.

## Increment counts

- Occurrences reviewed: 20
- Exact local extracted brochure-window evidence attached: 3
- Explicit evidence holds attached: 17
- Official URL plus precise locator and verification date added: 3
- Source-verification metadata records added: 20

Verified occurrences:

1. `Peace Studies` — `LASU`; `arts_hum.txt:4854-4858` (printed p. 228).
2. `Anthropology` — `IBADAN`; `arts_hum.txt:5743-5745` (printed p. 247).
3. `Efik-Ibibio` — `UYO`; `arts_hum.txt:5770-5772`.

The other 17 records are explicit `evidence_hold` states. Holds document the
local extracted window and the reason the parsed occurrence could not be tied
to one exact programme/institution cell. No official URL, PDF locator, or
verification date was added to those holds.

## Current four-file Lane-B ledger counts

Across the 117 occurrence records in the four assigned files:

- `source_verification.verified_against_pdf == true`: 6
- Prior `source_context_status == source_text_confirmed`: 2
- `source_verification.verified_against_pdf == false` explicit holds: 36
- Records with no Lane-B verification state yet: 73

Relative to checkpoint 002, this increment adds three verified Arts records and
17 Arts holds.

## Focused test

Added `test_jamb_source_repair_lane_b_increment_002.py`. It checks Arts rows
21–40, the exact local windows for all three verified records, hold shape for
the remaining 17, and that rows after the bounded boundary remain untouched.
Run:

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-002-20260926 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_002.py -q
```

Result: `1 passed`.

## Resume boundary

When instructed to continue, resume at Arts occurrence 41. Do not scan beyond
this bounded increment or touch the other assigned files until then. No CCMAS,
mapping/scope, seed, SQL, taxonomy, role, downstream domain, subgroup, or UI
artifacts were changed.
