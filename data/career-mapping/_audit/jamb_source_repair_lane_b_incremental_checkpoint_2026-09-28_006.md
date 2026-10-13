# JAMB offering-source verification — Lane B checkpoint 006

Date: 2026-09-28  
Status: one Social/Management occurrence verified; stopped at the next boundary

## Scope completed

Resumed from checkpoint 005 at Social/Management row 2 in
`data/career-mapping/jamb/social_management_offerings.json`. Did not repeat
Arts rows 1–43 and did not infer nonexistent Arts rows 44–60. Reviewed only
`Criminology and Penology` / `RSU`, `SALEM`.

The official JAMB IBASS Social Sciences degree brochure identifies the exact
programme in its Social Sciences faculty table and lists RSU and SALEM in the
`COURSE/DEGREE AWARDING INSTITUTIONS` cell. The official PDF is
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`.
The browser text view does not expose a printed page number, so the source
locator uses the exact programme row and column and does not claim a page.

This confirms the occurrence identity, institutions and faculty. It does not
separately establish programme-specific requirements: the existing source note
that the relevant requirement cells are shared/blank remains unchanged.

## Increment counts

- Occurrences reviewed: 1
- Exact official programme/institution/faculty occurrence verified: 1
- Explicit evidence holds added: 0
- Item-specific official URL, row/column locator and access date added: 1
- Other offering records edited: 0

Across the 117 occurrence records in the four Lane-B files after this
increment:

- `source_verification.verified_against_pdf == true`: 7
- Prior `source_context_status == source_text_confirmed`: 2
- `source_verification.verified_against_pdf == false` explicit holds: 39
- Records with no Lane-B verification state: 69

## Focused test

Added `test_jamb_source_repair_lane_b_increment_005.py`. It checks the exact
row identity, institution codes, official URL, locator, access date, retained
shared-requirement note, and that row 3 remains the next unreviewed occurrence.

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-005-20260928 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_005.py -q
```

## Resume boundary

Continue at Social/Management row 3, `Criminology`. No CCMAS mappings, derived
scopes, domains, subgroups, roles, role naming, seeds, SQL or UI files were
changed in this increment.
