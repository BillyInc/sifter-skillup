# Repair lane A — JAMB source/offering context incremental checkpoint 016

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** Administration occurrences 41–50 audited; next increment bounded  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 015. Audited exactly Administration occurrences
**41–50**, beginning with `Accounting and Data Analytics` and ending with
`Transport and Tourism`. Occurrences 1–40 and the previously completed
Engineering rows were not revisited or edited. The next occurrence,
Administration 51 (`Aviation Management`), was not touched.

- **Nine exact source cells confirmed** against the official IBASS
  Administration brochure. Their existing institution arrays match the exact
  title-to-awarder cells: Accounting and Data Analytics—WIGWE (printed p. 49);
  Finance and Financial Technology—WIGWE (p. 56); Agribusiness and
  Economics—HUSTECH (p. 60); Supply Chain Management—BINGHAM (p. 61);
  Cooperative Management—NOUN (p. 66); Cooperative Economics and
  Management—UNIZIK (p. 66); Social Innovation and Entrepreneurship—WIGWE
  (p. 68); Entrepreneurship and Business Management—NOUN (p. 69); and Film
  and Video Studies—WESTERN-DEL (p. 69). Distinct neighboring title cells were
  not merged or used to infer awarders.
- **One evidence hold:** Transport and Tourism. The official brochure's
  printed p. 44 catalogue index confirms the title belongs to Administration,
  and the existing ledger lists REDEEMERS. A secondary mirror reproduces the
  p. 72 title-awarder cell, but the exact p. 72 awarder text was not
  independently retrievable from the IBASS host in this check. The institution
  association therefore remains held rather than promoted as official-source
  verified.
- No confirmed institution-array defects were found in the nine verified
  cells. Requirement text and neighboring waiver content were not changed.

## Lane-A counters and boundary

Across the same 125 Administration, Agriculture and Engineering occurrences,
the lane counters after this increment are **75 source-confirmed, 40 evidence
holds, and 10 pending/unreviewed**. The nine confirmed entries moved from
pending to confirmed; Transport and Tourism moved from pending to evidence
hold.

**Counter reconciliation:** checkpoint 015 reported 65 confirmed, 39 holds,
and 21 pending. Recounting the three current lane ledgers immediately before
this increment yields 66 confirmed, 39 holds, and 20 pending; after this
increment the independently recounted totals are 75/40/10. This checkpoint
uses the row-level ledger counts as authoritative and corrects the prior
checkpoint's aggregate discrepancy without changing any rows outside 41–50.

The next pending Lane-A item is Administration occurrence **51, Aviation
Management**. This checkpoint covers exactly ten occurrences (41–50); it does
not claim the full Administration or JAMB offering audit is complete.

## Validation and changed files

Focused regression tests assert the exact ten-row slice, the nine official
title-awarder associations and printed-page locators, the Transport and
Tourism hold, and the immediate before/after boundaries.

Changed for this increment: `jamb/administration_offerings.json`, this
checkpoint, and
`test_jamb_source_repair_lane_a_administration_041_050.py`. Official source:
[IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf).
No CCMAS, downstream mapping, domain/subgroup/role naming, seed, or SQL files
were changed.
