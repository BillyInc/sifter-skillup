# Repair lane A — JAMB source/offering context incremental checkpoint 009

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Agriculture occurrences 1–10 reviewed; bounded increment saved  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 008 without repeating Administration rows 1–40.
Reviewed only Agriculture occurrences **1–10** against official IBASS evidence
at:

`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf`

- **1 verified occurrence:** `Agronomy`. The exact title, Agriculture faculty
  context, and complete awarding-institution cell (ADSU, ESUTECH, HENSARD,
  IBADAN, NASARAWA, TSUJ, UNIOSUN) match the parsed record. Locator: PDF p. 103.
- **9 explicit evidence holds:** `Agriculture`, `Biotechnology`,
  `Horticulture`, `Fisheries`, `Animal Production`, `Animal Science`,
  `Animal Breeding and Genetics`, `Crop Production`, and `Crop Science`.
  Each record now carries the official item URL, source locator, access date,
  and a support note explaining the exact unresolved cell boundary or array
  mismatch. No unsupported institution list was certified.

Horticulture is a confirmed mismatch: the official cell lists FUNAAB and
MINNA, while the parsed record contains different institution tokens and a
spillover title fragment. Other holds reflect merged neighboring headings,
source-extract truncation, or insufficient evidence to establish a complete
exact institution cell.

## Lane-A counts

Across Administration, Agriculture and Engineering (125 total occurrences),
counting `source_context_status` separately from the stricter PDF boolean in
the three current JSON files:

- Source-text-confirmed context records: **38**
- `source_verification.verified_against_pdf == true`: **36**
- Explicit evidence holds: **14**
- Pending/unreviewed: **73**

The apparent one-record discrepancy against checkpoint 008 is a status-metric
mismatch: checkpoint 008's aggregate used its stricter verified total, while
this checkpoint's initial summary counted the broader `source_text_confirmed`
state. Current direct file counts are 38 source-text-confirmed contexts and 36
PDF-boolean verified occurrences. This increment adds one source-text-confirmed
context and nine holds relative to the current files before this bounded edit.

## Stop boundary

This increment stops after Agriculture occurrences **1–10**. Agriculture
occurrences 11–28 and all remaining Engineering occurrences were not reviewed
or changed. Administration rows 1–40 were not repeated.

## Write boundary

Only the source-context metadata for Agriculture occurrences 1–10, this new
checkpoint, and the focused test artifact were added. Institution arrays were
not edited. CCMAS, mappings, derived scopes, domains, subgroups, roles, role
naming, seeds, SQL and UI remain out of scope.
