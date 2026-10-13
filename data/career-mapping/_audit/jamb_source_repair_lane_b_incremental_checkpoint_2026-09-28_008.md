# JAMB offering-source verification — Lane B checkpoint 008

Date: 2026-09-28  
Status: two bounded Social/Management occurrences verified; stopped at adjacent demography variants

## Scope completed

Resumed from checkpoint 007 at Social/Management row 4 in
`data/career-mapping/jamb/social_management_offerings.json`. Did not revisit
Arts rows 1–43 or Social/Management rows 2–3. Verified:

1. `Criminology and Security Studies` — 63 listed institutions, Social Sciences
   faculty table, printed pp. 614–615.
2. `Demography and Social Statistics` — COVENANT, FED-KEBBI, FED-OYE EKITI,
   OAU and UNIOSUN, Social Sciences table, printed p. 624.

For Criminology and Security Studies, the official IBASS degree brochure row
and its institution list cross the page break. The source's requirements are
shared across Criminology, Criminology and Penology, and Criminology and
Security Studies. The existing shared/blank note and requirement content were
left intact; this increment does not assign those shared cells exclusively to
row 4. The extracted institution sequence prints `COOU` twice; the occurrence
record keeps one unique institution code and does not infer a second distinct
offering.

`Demography and Social Statistics` is a separate exact offering row. The
adjacent `Demography and Statistics` and `Demography and Social Studies`
records remain unreviewed for this increment.

Official source URL for both records:
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`

## Increment counts

- Occurrences reviewed: 2
- Exact official programme/institution/faculty occurrences verified: 2
- Explicit evidence holds added: 0
- Item-specific URL, exact printed-page/row/column locator, access date and support note added: 2
- Other offering records edited: 0

## Focused test

Added `test_jamb_source_repair_lane_b_increment_007.py`. It checks both exact
identities, institution lists against the matching extracted IBASS text,
official URL, locators, access date, the shared-requirements boundary, and that
the two adjacent demography variants remain the next unreviewed records.

```powershell
python -m pytest --basetemp .pytest-tmp-jamb-lane-b-007-20260928 data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_007.py -q
```

Result: `1 passed`.

## Resume boundary

Continue at Social/Management row 6, `Demography and Statistics`, only after
rechecking its exact IBASS programme/institution context. Do not repeat Arts
rows 1–43 or Social/Management rows 2–5. No CCMAS joins/scopes, downstream
taxonomy, seeds, SQL or UI files were changed in this increment.
