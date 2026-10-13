# Repair lane A — JAMB source/offering context incremental checkpoint 014

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Engineering occurrences 31–37 reviewed; final rows in this source ledger  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 013 at Engineering occurrence 31. The Engineering
offering ledger contains 37 occurrences total, so this bounded increment covers
the seven remaining exact occurrences (**31–37**) and stops at the end of the
ledger. No earlier occurrence was re-audited or changed.

Verified source title, Engineering/Environmental/Technology faculty context,
and exact awarder cell against the official IBASS Engineering PDF. Each row now
stores the item-specific official PDF URL, printed-page locator, access date
(`2026-09-28`), and source-context evidence.

- Occurrences 31–37: `Production Engineering` (p. 374), `Mechatronics
  Engineering` (pp. 404–405), `Electronics Engineering` (p. 385),
  `Electrical/Electronic Engineering` (source heading `ELECTRICAL/ELECTRONICS
  ENGINEERING`, pp. 380–385), `Communication Technology` (p. 470), `ICT
  Engineering` (source heading `INFORMATION AND COMMUNICATION TECHNOLOGY
  ENGINEERING`, pp. 471–472), and the `LAND SURVEYING` sub-heading (p. 427).
- Source institution arrays were checked against the corresponding awarder
  cells. The 87-institution Electrical/Electronics cell continues across pages;
  its complete sequence is retained.
- **Confirmed correction at occurrence 36:** `ICT Engineering` maps only to
  `ELIZADE` under the exact source title `INFORMATION AND COMMUNICATION
  TECHNOLOGY ENGINEERING`. `COVENANT`, `NILE` and `UNIZIK` are listed under the
  next, distinct title `INFORMATION AND COMMUNICATION ENGINEERING`. The
  following `INFORMATION AND COMMUNICATION TECHNOLOGY` title separately lists
  `ABSU`, `AFIT-DEG`, `AKSU`, `FUTA`, `KSUSTA` and `UDU`. These contexts are
  documented and not merged into the ICT Engineering institution array.
- Other distinct neighboring offerings retained separately include
  Production Technology (UNIZIK), Mechatronics and System Engineering
  (BAUCHI), Mechatronics and Robotics Engineering (DELSUT), other separately
  titled electrical/electronics engineering variants, Telecommunications
  offerings, and Land Surveying and Geoinformatics (UYO).

## Lane-A counts

Across Administration, Agriculture and Engineering (**125 occurrences**),
counting `source_context_status` directly in the three ledgers after this
increment:

- Source-confirmed: **65**
- Evidence holds: **39**
- Pending/unreviewed: **21**

This increment confirmed seven previously unreviewed Engineering occurrences;
one institution association was corrected by separating the adjacent exact
programme titles at occurrence 36.

## Stop boundary and validation

The bounded increment ends at Engineering occurrence **37 (`Land Surveying`)**.
There is no Engineering occurrence 38 in this ledger. The next pending
occurrence elsewhere in Lane A is Administration occurrence **24 (`Accounting
and Finance`)**; it is outside this requested Engineering slice and was not
changed here. Agriculture has no unreviewed rows in its current ledger; the
remaining Lane-A pending rows are in Administration.

Changed files: `jamb/engineering_offerings.json`, this checkpoint, and
`test_jamb_source_repair_lane_a_engineering_031_037.py`. JSON parsing and the
focused test passed. No CCMAS scopes or downstream mappings were changed.

Source: [official JAMB/IBASS Engineering brochure (current official-hosted PDF)](https://ibass.jamb.gov.ng/static/media/engineering2.a81443bb885b5e602704.pdf)
