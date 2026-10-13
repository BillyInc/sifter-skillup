# Repair lane A — JAMB source/offering context incremental checkpoint 011

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Agriculture completed; Engineering occurrences 1–10 reviewed  
**Lane:** JAMB source/offering contexts only

## Completed increment

Resumed at Agriculture occurrence 21, without repeating Administration 1–40
or Agriculture 1–20. Agriculture had eight remaining rows (21–28); occurrence
28 was already confirmed in checkpoint 010 and was not re-reviewed. For
occurrences 21–27:

- **2 verified:** `Animal Physiology` — FUNAAB (printed p. 109), and
  `Crop Protection` — FUNAAB and LASUSTECH (printed p. 112).
- **5 evidence holds:** `Pasture & Range Management`,
  `Livestock Production Technology`, `Plant Science`,
  `Farm Management & Agric. Extension`, and
  `Eco-Tourism and Wildlife Management`.

The official Agriculture brochure's text view did not expose exact awarder
cells for the five holds. For `Plant Science`, the official table associates
ABSU and RSU with the distinct title `Plant Science and Biotechnology`; this
does not prove that array for the `Plant Science` identity. No Agriculture
institution arrays were changed.

After completing Agriculture, continued with Engineering occurrences 1–10:
`Building`, `Civil Engineering`, `Computer and Information Science`,
`Polymer and Textile Engineering`, `Water Resources and Environmental Engr`,
`Petroleum and Gas Engineering`, `Gas Engineering`, `Computer Science`,
`Systems Engineering`, and `Food Engineering`. The official catalogue on
printed p. 336 confirms the Engineering/Environmental/Technology faculty and
programme titles, and the Civil Engineering table begins on printed p. 355.
The available exact-table text did not establish complete awarder cells for
these rows; all ten remain explicit evidence holds. Their institution arrays
were not changed.

Each reviewed row carries the item-specific official IBASS URL, printed
locator, access date (`2026-09-28`) and a support/hold note. No institution
array was corrected because the exact source cells did not prove a correction.

## Lane-A counts

Across Administration, Agriculture and Engineering (125 total occurrences),
counting `source_context_status` directly in the three JSON files:

- Verified/source-confirmed: **48**
- Explicit evidence holds: **31**
- Pending/unreviewed: **46**

This increment adds two verified statuses and fifteen holds relative to
checkpoint 010. Agriculture is complete; the next range is Engineering
occurrences 11–20.

## Write boundary and focused validation

The bounded edits are limited to Agriculture source-context metadata for
occurrences 21–27, Engineering source-context metadata for occurrences 1–10,
this checkpoint, and the focused test
`test_jamb_source_repair_lane_a_agriculture_021_027_engineering_001_010.py`.
Administration rows 1–40 and Agriculture rows 1–20 were not changed. CCMAS
joins/scopes, downstream taxonomy, seeds, SQL and UI remain out of scope.
