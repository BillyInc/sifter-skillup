# Repair lane A — JAMB source/offering context incremental checkpoint 019

**Date:** 2026-09-28 (Africa/Lagos)  
**Status:** resolved Administration occurrences 16 and 23 from exact source cells  
**Lane:** JAMB source/offering contexts only

## Completed increment

Continued from checkpoint 018 and audited only the next two held Administration
occurrences:

| Occurrence | Exact JAMB title cell | Exact awarder(s) | Official brochure locator | Disposition |
|---:|---|---|---|---|
| 16 | `SECRETARIAL ADMINISTRATION` | CRAWFORD | Printed p. 86; `Administration.txt:2120-2123` | Confirmed; removed awarders belonging to adjacent title headings from this offering |
| 23 | `LOCAL GOVERNMENT STUDIES` | OAU | Printed p. 84; `Administration.txt:2033-2035` and `2045-2046` | Confirmed; separated from `LOCAL GOVERNMENT AND DEVELOPMENT STUDIES` |

The title/awarder cells are present in the checked-in text extraction of the
official [IBASS Administration brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf).
The official indexed extraction also independently returns the two Local
Government title rows separately. For Secretarial Administration, the
official indexed text returns `SECRETARIAL ADMINISTRATION / CRAWFORD` followed
by a separate `OFFICE AND INFORMATION MANAGEMENT` heading. Exact URLs,
locators, access date (`2026-09-28`), disposition reasons, and verified source
context are attached to each affected row.

The provider arrays now contain only the institutions attached to each exact
title cell. Neighboring title/provider text is described as separate context;
no requirements or waiver text was edited. This tranche does not adjudicate
whether distinct JAMB titles should be merged as canonical identities.

## Reconciled Lane-A count and next action

Across the Administration (60), Agriculture (28), and Engineering (37)
occurrence ledgers, row-level totals are now **125 occurrences: 88 source-text
confirmed, 37 evidence-held, 0 pending/unreviewed**. Relative to checkpoint
018, two held source contexts were resolved. Continue with the next held
Administration occurrence only; do not revisit confirmed rows.

This is not completion of the 420-identity JAMB source audit, all faculty
offering contexts, CCMAS curriculum review, or downstream mapping.

## Validation and changed files

Focused checks:

```powershell
python -m pytest data/career-mapping/_audit/test_jamb_source_repair_lane_a_administration_holds_016_023.py -q
```

Changed only `data/career-mapping/jamb/administration_offerings.json`, this
checkpoint, and its focused test. No CCMAS scope, downstream/domain data,
taxonomy names, seed, or SQL artifacts were touched.
