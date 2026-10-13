# JAMB offering-source verification — Lane B checkpoint 010

Date: 2026-09-28  
Status: ten bounded Social/Management occurrences reviewed; stopped before row 18

## Scope completed

Resumed at Social/Management row 8 in
`data/career-mapping/jamb/social_management_offerings.json`, following
checkpoint 009. Did not revisit Arts rows 1–43 or Social/Management rows 2–7.
Reviewed rows 8–17:

1. `Population Studies` — JABU; exact title and cell on printed pp. 624–626.
   The following `Geography` heading is a separate entry; its institutions
   were not attributed to Population Studies.
2. `Economics and Statistics` — BENIN; printed p. 611.
3. `Economics and Development Studies` — EL-AMIN and HAVILLA; printed p. 611.
4. `Economics with/and Operation Research` — CUAB; printed pp. 612–613.
5. `Peace and Development Studies` — SALEM and NOUN; printed pp. 612–613.
6. `Economics` — all 192 institution codes in the current row checked against
   the Economics table block before the distinct Economics and Statistics
   entry; printed pp. 605–613.
7. `Industrial Relations / Industrial and Labour Relations` — COVENANT, AAUA
   and OOU; paired title entries on printed p. 675.
8. `Industrial Relations and Personnel Management / Industrial Relations and
   Human Resource Management` — evidence hold. The six listed institutions
   occur under the Personnel Management heading; the source block does not
   establish that same institution cell for the separate Human Resource
   Management heading.
9. `Intelligence and Security Studies` — ABUAD, EKSU, NDA and NOVENA; printed
   pp. 679–684. This verifies the title and awarder list only; the source marks
   requirements as shared with Political Science, so those were not made
   exclusive to this programme.
10. `International Relations` — title is explicit, but evidence hold on the
    full institution array: WESTERN-DEL and WESTLAND appear immediately before
    this heading in the extracted source sequence, so their attachment is not
    inferred.

Official source for every occurrence:
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`

The source verification fields retain the official URL, printed-page/table
locator, and access date (`2026-09-28`). Existing requirement text, shared
requirement boundaries, institution arrays, and all other offering records
were left unchanged. Evidence holds are not student-confirmed source claims.

## Increment counts

- Occurrences reviewed: 10
- Exact title and full institution-list occurrences confirmed: 8
- Explicit evidence holds retained: 2
- Institution arrays changed: 0
- Requirement/shared-column data changed: 0
- Other offering records edited: 0

## Focused test

Added `test_jamb_source_repair_lane_b_increment_009.py`. It checks the bounded
row range, source locators/date, matching institution codes, both evidence
holds, the Population Studies/Geography boundary, shared-requirement handling,
and that the next record is not marked as reviewed.

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-009-20260928 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_009.py -q
```

Result: `1 passed`.

## Resume boundary

Continue at Social/Management row 18, `International Relations and Diplomacy`.
Do not repeat Arts rows 1–43 or Social/Management rows 2–17. CCMAS joins/scopes,
taxonomy, seeds, SQL and UI remain out of scope.
