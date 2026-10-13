# JAMB Sciences lane C checkpoint 004

**Date:** 2026-09-26 (Africa/Lagos)  
**Lane:** JAMB offering-source verification, Sciences brochure  
**Status:** bounded rows 041-060 closed with source evidence and one explicit hold  
**Previous checkpoint:** `jamb_sciences_lane_c_checkpoint_2026-09-26_003.md`  
**Official source:** https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf  
**Source access date:** 2026-09-26

## Increment result

Rows **041-060** in `sciences_offerings.json` were checked against exact local
extracted brochure windows. Nineteen occurrences have exact programme cells or
grouped adjacent cells with matching awarding-institution blocks. One
occurrence remains an explicit evidence hold because the exact programme cell
was not found. Existing rows 001-040 evidence, contexts, notes, and holds were
preserved.

| Result | Increment | Catalogue after increment |
|---|---:|---:|
| Source evidence attached | **19** | **59 verified** |
| Explicit evidence hold | **1** | **3 explicit holds** |
| Remaining unreviewed occurrences | **0 new in this increment** | **125** |
| Held/unresolved inclusive of explicit holds | — | **128** |
| Total Sciences occurrences | **20 reviewed** | **187 total** |

Explicit hold:

- `Computer Science and Information Technology` — no exact programme cell or
  matching awarding-institution block was found in the inspected official
  Sciences text. Neighboring Computer Science variants are not an exact
  programme+institution context. No source URL, locator, or access date was
  promoted.

## Evidence windows

| Row | Programme | Exact local extracted window |
|---:|---|---|
| 041 | Mathematics with Computer Science | `Sciences.txt:6054-6068` |
| 042 | Applied Microbiology and Brewing / Applied Microbiology | `Sciences.txt:8111-8120` |
| 043 | Pure and Applied Chemistry | `Sciences.txt:2567-2576` |
| 044 | Plant Biology | `Sciences.txt:4934-4939` |
| 045 | Plant Science | `Sciences.txt:4940-4945` |
| 046 | Genetics and Biotechnology | `Sciences.txt:5076-5082` |
| 047 | Environmental Health Science | `Sciences.txt:7521-7528` |
| 048 | Pure and Applied Mathematics | `Sciences.txt:8004-8022` |
| 049 | Computer Science and Information Technology | explicit evidence hold; no exact local source cell |
| 050 | BIOCHEMISTRY AND MOLECULAR BIOLOGY | `Sciences.txt:411-416` |
| 051 | INFORMATION AND COMMUNICATION SCIENCE | `Sciences.txt:9111-9120` |
| 052 | COMPUTER SCIENCE WITH ECONOMICS | `Sciences.txt:9163-9167` |
| 053 | COMPUTER SCIENCE AND MATHEMATICS | `Sciences.txt:9626-9630` |
| 054 | COMPUTER WITH STATISTICS | `Sciences.txt:9636-9640` |
| 055 | METEOROLOGY AND CLIMATE CHANGE | `Sciences.txt:10310-10316` |
| 056 | Electronics | `Sciences.txt:1440-1461` |
| 057 | Pure Chemistry | `Sciences.txt:2541-2544` |
| 058 | Applied Chemistry | `Sciences.txt:2660-2663` |
| 059 | Biostatistics | `Sciences.txt:4467-4470` |
| 060 | Statistics and Data Sciences | `Sciences.txt:4472-4476` |

The 19 verified rows carry the official brochure URL, precise local locator,
and `source_accessed_on: 2026-09-26`, with `source_context_status:
source_text_confirmed`. The held row carries only `evidence_hold` and its
item-specific reason.

## Scope guard

Only `sciences_offerings.json` and lane-C checkpoint/test artifacts were edited.
No rows after 060 were scanned or changed in this increment. No CCMAS,
mapping, scope, seed, SQL, taxonomy, role, or UI files were edited.
