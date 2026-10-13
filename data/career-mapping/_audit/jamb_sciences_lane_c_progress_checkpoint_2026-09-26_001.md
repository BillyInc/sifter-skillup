# JAMB Sciences lane C progress checkpoint 001

**Date:** 2026-09-26 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** resumed; bounded verification is open  
**Official source:** https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf  
**Source access date for existing confirmed rows:** 2026-09-26

## Current occurrence state

Counts are from `data/career-mapping/jamb/sciences_offerings.json` at checkpoint
creation time. The file contains **187** Sciences offering occurrences.

| State | Occurrences |
|---|---:|
| Exact source-context metadata already verified | **2** |
| Explicit evidence hold / not yet verified in this lane | **185** |
| Total | **187** |

The two existing verified occurrences are preserved:

- `Environmental Science and Technology` — `WESLEYUNI`; source typo retained as
  `ENVRIONMENTAL SCIENCE AND TECHNOLOGY`; `Sciences.txt:5491-5505`.
- `INFORMATION AND MEDIA TECHNOLOGY` — `MINNA`; title crosses an extracted page
  break; `Sciences.txt:9441-9479`.

Both carry the official IBASS Sciences brochure URL, source locator,
`source_accessed_on: 2026-09-26`, and `source_context_status:
source_text_confirmed`.

## Resume boundary

The next bounded increment is Sciences occurrence rows **001-020** in file
order. Each row will be checked against its exact brochure programme cell and
awarding-institution block. A URL, precise locator, and access date will be
added only after that cell is closed. Rows whose exact cell or institution
boundary cannot be established will receive an explicit evidence hold with a
reason. Existing source fixes and faculty contexts remain unchanged.

## Scope guard

Only `sciences_offerings.json` and lane C checkpoint/test artifacts may change.
No CCMAS, mapping, scope, seed, SQL, taxonomy, role, or UI files are in scope.
