# JAMB Sciences lane C checkpoint 005

**Date:** 2026-09-28 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** bounded rows 061-080 reviewed; 17 source-confirmed and 3 explicit evidence holds  
**Previous checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-26_004.md`  
**Official source:** https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf  
**Source access date:** 2026-09-28

## Increment result

Rows **061-080** in `sciences_offerings.json` were checked against the exact
official Sciences brochure context represented in the local text extraction.
Seventeen occurrences have exact programme cells and matching awarding
institution context, including continued blocks across page boundaries. Three
occurrences remain explicit evidence holds. Rows 001-060 and all later rows
were preserved.

| Result | Increment | Catalogue after increment |
|---|---:|---:|
| Source evidence attached | **17** | **76 verified** |
| Explicit evidence hold | **3** | **6 explicit holds** |
| Remaining unreviewed occurrences | **0 new in this increment** | **105** |
| Held/unresolved inclusive of explicit holds | — | **111** |
| Total Sciences occurrences | **20 reviewed** | **187 total** |

Explicit holds:

- `PURE AND APPLIED BIOLOGY` — the inspected nearby Applied Biology cells are
  different programme identities; no exact programme and institution block
  was established.
- `Physics/Industrial Physics` — the brochure's nearby Physics and Industrial
  Physics headings do not establish the exact combined identity with the
  listed BENIN and UNIZIK context.
- `Surveying and Geoinformatics` — UNN is attached to that exact cell, while
  KASU appears under the next distinct `BUILDING TECHNOLOGY` heading.

## Evidence windows

| Row | Programme | Exact local extracted window |
|---:|---|---|
| 061 | Data Science and Analytics | `Sciences.txt:4478-4482` |
| 062 | Marine Science | `Sciences.txt:5532-5538` |
| 063 | INFORMATION TECHNOLOGY AND HEALTH INFORMATICS | `Sciences.txt:9041-9045` |
| 064 | MANAGEMENT INFORMATION SYSTEM | `Sciences.txt:9050-9073` |
| 065 | INFORMATION SYSTEMS AND TECHNOLOGY | `Sciences.txt:9158-9162` |
| 066 | CYBER SECURITY SCIENCE | `Sciences.txt:9196-9200` |
| 067 | COMMUNICATIONS TECHNOLOGY | `Sciences.txt:9382-9385` |
| 068 | INFORMATION SCIENCE AND MEDIA STUDIES | `Sciences.txt:9452-9456` |
| 069 | PURE AND APPLIED BIOLOGY | explicit evidence hold |
| 070 | APPLIED BIOLOGY AND BIOTECHNOLOGY | `Sciences.txt:10142-10146` |
| 071 | MARINE BIOLOGY | `Sciences.txt:10250-10253` |
| 072 | FISHERIES AND AQUACULTURE | `Sciences.txt:10254-10257` |
| 073 | Physics Electronics | `Sciences.txt:1435-1438` |
| 074 | Physics/Industrial Physics | explicit evidence hold |
| 075 | Applied Physics | `Sciences.txt:1977-1984` |
| 076 | Applied Biochemistry | `Sciences.txt:2026-2042` |
| 077 | Chemistry and Industrial Chemistry | `Sciences.txt:2531-2534` |
| 078 | Fisheries | `Sciences.txt:3552-3555` |
| 079 | Applied Geology | `Sciences.txt:3788-3790` |
| 080 | Surveying and Geoinformatics | explicit evidence hold |

All 17 verified rows carry the official brochure URL, precise local locator,
and `source_accessed_on: 2026-09-28`, with
`source_context_status: source_text_confirmed`. The three holds carry an
item-specific reason and no promoted source URL, locator, or access date.

## Scope guard

Only `sciences_offerings.json` and Lane C checkpoint/test artifacts were
edited. No CCMAS mapping, derived scope, downstream domain/subgroup/role,
role naming, seed, SQL, or UI files were edited. Rows 001-060 were not repeated
or changed in this increment.
