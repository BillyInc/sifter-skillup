# JAMB offering-source verification — Lane B checkpoint 004

Date: 2026-09-26  
Status: bounded increment complete; stopped at the next unreviewed boundary

## Scope completed

Continued from checkpoint `jamb_source_repair_lane_b_incremental_checkpoint_2026-09-26_003.md`. Skipped Arts rows 1–40, which already have verified or held states, and reviewed only the remaining Arts occurrence records 41–43 in
`data/career-mapping/jamb/arts_hum_offerings.json`.

Social/Management, Medical, and Law were not scanned or edited in this
increment.

## Increment counts

- Occurrences reviewed: 3
- Exact local extracted brochure-window evidence attached: 0
- Explicit evidence holds attached: 3
- Official URL plus precise locator and verification date added: 0
- Source-verification metadata records added: 3

Explicit holds:

1. `Igbo` — the local row is followed by the adjacent `AFRICAN AND ASIAN STUDIES` heading; `arts_hum.txt:3696-3710`.
2. `Modern Language and Translation` — the source has `MODERN LANGUAGES`, not the indexed title; `arts_hum.txt:5820-5846`.
3. `Geography and Environmental Studies` — the source has `GEOGRAPHY`, not the indexed title; `arts_hum.txt:5879-5884`.

No official URL, PDF locator, or verification date was promoted for these
records because the exact indexed programme/institution context was
insufficiently provable.

## Current four-file Lane-B ledger counts

Across the 117 occurrence records in the four assigned files:

- `source_verification.verified_against_pdf == true`: 6
- Prior `source_context_status == source_text_confirmed`: 2
- `source_verification.verified_against_pdf == false` explicit holds: 39
- Records with no Lane-B verification state yet: 70

Relative to checkpoint 003, this increment adds three Arts holds and no new
verified records.

## Focused test

Added `test_jamb_source_repair_lane_b_increment_003.py`. It checks Arts rows
41–43, their explicit hold metadata, the exact local windows used for the
hold decisions, and that all earlier Arts rows retain verification state. Run:

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-003-20260926 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_003.py -q
```

Result: `1 passed`.

## Resume boundary

Arts is now fully stamped for its 43 occurrence records. When instructed to
continue, resume at the next unreviewed occurrence in Social/Management
Sciences, skipping its existing verified/held rows. No CCMAS, mapping/scope,
seed, SQL, taxonomy, role, downstream domain, subgroup, or UI artifacts were
changed.
