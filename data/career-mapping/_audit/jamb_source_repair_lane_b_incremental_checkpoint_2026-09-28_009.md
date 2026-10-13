# JAMB offering-source verification — Lane B checkpoint 009

Date: 2026-09-28  
Status: two bounded Social/Management occurrences verified; stopped at Population Studies

## Scope completed

Resumed from checkpoint 008 at Social/Management row 6 in
`data/career-mapping/jamb/social_management_offerings.json`. Did not revisit
Arts rows 1–43 or Social/Management rows 2–5. Reviewed:

1. `Demography and Statistics` — GOUU.
2. `Demography and Social Studies` — UDU.

The official JAMB IBASS Social Sciences degree brochure is available at
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`.
On printed p. 624, its Social Sciences faculty table lists each exact title in
the `COURSE/DEGREE AWARDING INSTITUTIONS` first-column cell, with GOUU and UDU
under their respective titles. The local IBASS text extraction at
`data/career-mapping/_jamb_txt/Social Management Science.txt` preserves that
sequence. These verifications cover the exact title, faculty and institution
cells only. The requirements text flows across this grouped block; no
requirement was reassigned or edited.

## Increment counts

- Occurrences reviewed: 2
- Exact official programme/institution/faculty occurrences verified: 2
- Explicit evidence holds added: 0
- Item-specific official URL, printed-page/table/column locator, access date and support note added: 2
- Other offering records edited: 0

## Focused test

Added `test_jamb_source_repair_lane_b_increment_008.py`. It checks both exact
identities, institution codes against the matching IBASS text block, official
URL, printed-page/table/column locators, access date, the shared-requirements
boundary, and that Population Studies remains the next unreviewed occurrence.

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-008-20260928 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_008.py -q
```

Result: `1 passed`.

## Resume boundary

Continue at Social/Management row 8, `Population Studies`. Do not repeat Arts
rows 1–43 or Social/Management rows 2–7. No CCMAS joins/scopes, downstream
taxonomy, seeds, SQL or UI files were changed in this increment.
