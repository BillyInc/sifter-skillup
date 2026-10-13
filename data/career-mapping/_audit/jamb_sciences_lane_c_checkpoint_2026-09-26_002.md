# JAMB Sciences lane C checkpoint 002

**Date:** 2026-09-26 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** bounded rows 001-020 closed with source evidence and explicit holds  
**Official source:** https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf  
**Source access date:** 2026-09-26

## Increment result

Rows **001-020** in `sciences_offerings.json` were checked against the exact
local extracted brochure windows recorded in the paired lane-C test artifact.
Each row has a distinct programme heading and awarding-institution block in its
window. The existing institution contexts and notes were preserved.

| Result | Increment | Catalogue after increment |
|---|---:|---:|
| Source evidence attached | **18** | **20 verified** |
| Explicit evidence hold | **2** | **167 held** |
| Total Sciences occurrences | **20** | **187 total** |

The 20 verified total includes the two earlier confirmed rows:
`Environmental Science and Technology` and `INFORMATION AND MEDIA TECHNOLOGY`.

Explicit holds in this increment:

- `Chemistry` — the inspected cell `Sciences.txt:2197-2517` does not contain
  28 institution tokens currently listed on the occurrence; the boundary is
  unresolved.
- `BIOLOGY` — the inspected cell `Sciences.txt:9714-10102` does not contain
  31 institution tokens currently listed on the occurrence, and another
  Biology source occurrence exists; the boundary is unresolved.

## Evidence windows

| Row | Programme | Exact local extracted window |
|---:|---|---|
| 001 | Computer Science | `Sciences.txt:8242-8664` |
| 002 | Chemistry | `Sciences.txt:2197-2517` |
| 003 | Microbiology | `Sciences.txt:7023-7373` |
| 004 | Mathematics | `Sciences.txt:5728-6052` |
| 005 | PHYSICS | `Sciences.txt:966-1317` |
| 006 | BIOLOGY | `Sciences.txt:9714-10102` |
| 007 | CYBER SECURITY | `Sciences.txt:9196-9361` |
| 008 | Statistics | `Sciences.txt:4285-4462` |
| 009 | Software Engineering | `Sciences.txt:8736-8880` |
| 010 | PHYSICS WITH ELECTRONICS | `Sciences.txt:1319-1430` |
| 011 | Geology | `Sciences.txt:3595-3731` |
| 012 | INFORMATION TECHNOLOGY | `Sciences.txt:8890-9039` |
| 013 | Zoology | `Sciences.txt:5302-5409` |
| 014 | Botany | `Sciences.txt:4765-4844` |
| 015 | Industrial Mathematics | `Sciences.txt:2044-2111` |
| 016 | Plant Science and Biotechnology | `Sciences.txt:4850-4900` |
| 017 | Industrial Chemistry | `Sciences.txt:3033-3260` |
| 018 | Science Laboratory Technology | `Sciences.txt:7426-7491` |
| 019 | Biotechnology | `Sciences.txt:4946-5071` |
| 020 | BIOLOGICAL SCIENCE(S) | `Sciences.txt:788-900` |

The 18 verified rows carry the official brochure URL, precise local locator,
and `source_accessed_on: 2026-09-26`, with `source_context_status:
source_text_confirmed`. The two unresolved rows carry an explicit
`evidence_hold` and no promoted source URL, locator, or date.

## Scope guard

Only `sciences_offerings.json` and lane-C checkpoint/test artifacts were edited.
No rows after 020 were scanned or changed in this increment. No CCMAS,
mapping, scope, seed, SQL, taxonomy, role, or UI files were edited.
