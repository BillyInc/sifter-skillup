# JAMB Sciences lane C checkpoint 003

**Date:** 2026-09-26 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** bounded rows 021-040 closed with source evidence  
**Previous checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-26_002.md`  
**Official source:** https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf  
**Source access date:** 2026-09-26

## Increment result

Rows **021-040** in `sciences_offerings.json` were checked against the exact
local extracted brochure windows recorded in the paired lane-C test artifact.
All 20 occurrences have an exact programme heading or grouped programme cell
and matching awarding-institution block. Existing institution contexts, notes,
and the rows 001-020 evidence/holds were preserved.

| Result | Increment | Catalogue after increment |
|---|---:|---:|
| Source evidence attached | **20** | **40 verified** |
| New explicit evidence hold | **0** | **2 explicit holds** |
| Remaining unreviewed occurrences | **0 new in this increment** | **145** |
| Held/unresolved inclusive of explicit holds | — | **147** |
| Total Sciences occurrences | **20 reviewed** | **187 total** |

The grouped source cells were retained as exact evidence for:

- `Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics` — the three adjacent source cells and their institution blocks.
- `Chemical Sciences` — the `CHEMICAL SCIENCES` cell, its option lines, and the continuation across the extracted page boundary.

## Evidence windows

| Row | Programme | Exact local extracted window |
|---:|---|---|
| 021 | INFORMATION SYSTEMS | `Sciences.txt:9121-9156` |
| 022 | Data Science | `Sciences.txt:4503-4527` |
| 023 | Environmental Management and Toxicology | `Sciences.txt:7548-7583` |
| 024 | FORENSIC SCIENCE | `Sciences.txt:436-458` |
| 025 | Applied Geophysics | `Sciences.txt:6782-6823` |
| 026 | INFORMATION AND COMMUNICATION TECHNOLOGY | `Sciences.txt:9075-9103` |
| 027 | Animal and Environmental Biology | `Sciences.txt:5453-5472` |
| 028 | Geophysics | `Sciences.txt:6833-6847` |
| 029 | Industrial Physics | `Sciences.txt:1945-1973` |
| 030 | LIBRARY AND INFORMATION SCIENCE | `Sciences.txt:9392-9428` |
| 031 | Geography | `Sciences.txt:4102-4116` |
| 032 | Mathematics with Statistics / Mathematics/Statistics / Mathematics and Statistics | `Sciences.txt:8129-8162` |
| 033 | Petroleum Chemistry | `Sciences.txt:2625-2637` |
| 034 | Pure and Industrial Chemistry | `Sciences.txt:3261-3283` |
| 035 | APPLIED BIOLOGY | `Sciences.txt:10130-10137` |
| 036 | Food Science and Technology | `Sciences.txt:3016-3023` |
| 037 | Environmental Management | `Sciences.txt:7530-7537` |
| 038 | METEOROLOGY | `Sciences.txt:10298-10307` |
| 039 | Chemical Sciences | `Sciences.txt:2578-2623` |
| 040 | Geology and Mining | `Sciences.txt:3744-3749` |

All 20 rows carry the official brochure URL, precise local locator, and
`source_accessed_on: 2026-09-26`, with `source_context_status:
source_text_confirmed`. No new evidence hold was required in this increment.

## Scope guard

Only `sciences_offerings.json` and lane-C checkpoint/test artifacts were edited.
No rows after 040 were scanned or changed in this increment. No CCMAS,
mapping, scope, seed, SQL, taxonomy, role, or UI files were edited.
