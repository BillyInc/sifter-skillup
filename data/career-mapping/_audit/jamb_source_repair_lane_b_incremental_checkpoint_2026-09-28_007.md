# JAMB offering-source verification — Lane B checkpoint 007

Date: 2026-09-28  
Status: one Social/Management occurrence verified; stopped at the next boundary

## Scope completed

Resumed from checkpoint 006 at Social/Management row 3 in
`data/career-mapping/jamb/social_management_offerings.json`. Did not repeat
Arts rows 1–43 or Social/Management row 2. Reviewed only `Criminology`.

The official JAMB IBASS Social Sciences degree brochure is available at
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`.
Its printed p. 614 Social Sciences faculty table has a `CRIMINOLOGY` row whose
`COURSE/DEGREE AWARDING INSTITUTIONS` cell lists BAYERO, CALEB, JEWEL and
POL-ACAD. The local text extraction at
`data/career-mapping/_jamb_txt/Social Management Science.txt` preserves this
row and institution sequence. Verification confirms the exact occurrence,
faculty context and institution codes only. The existing shared/blank
requirement note and source fields were retained without reinterpretation.

## Increment counts

- Occurrences reviewed: 1
- Exact official programme/institution/faculty occurrence verified: 1
- Explicit evidence holds added: 0
- Item-specific official URL, printed-page/row/column locator and access date added: 1
- Other offering records edited: 0

## Focused test

Added `test_jamb_source_repair_lane_b_increment_006.py`. It checks the exact
row identity, institution codes, official URL, locator, access date, retained
shared-requirement note, the matching source-text row, and that row 4 remains
the next unreviewed occurrence.

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-006-20260928 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_006.py -q
```

Result: `1 passed`.

## Resume boundary

Continue at Social/Management row 4, `Criminology and Security Studies`. Do
not repeat Arts rows 1–43 or Social/Management rows 2–3. No CCMAS mappings,
derived scopes, domains, subgroups, roles, role naming, seeds, SQL or UI files
were changed in this increment.
