# JAMB offering-source verification — Lane B checkpoint 011

Date: 2026-09-28  
Status: eight bounded Social/Management occurrences checked; stopped before row 26

## Scope completed

Continued after checkpoint 010 at Social/Management row 18 in
`data/career-mapping/jamb/social_management_offerings.json`. Did not revisit
Arts rows 1–43 or Social/Management rows 2–17. Checked rows 18–25:

1. `International Relations and Diplomacy` — 14 institutions, printed p. 687.
2. `International Relations and Diplomatic Studies` — AVE-MARIA, p. 688.
3. `International Studies` — ABU, ABU-ODL and MAITAMA, p. 688.
4. `International Studies and Diplomacy` — BENIN, p. 689.
5. `International and Comparative Politics` — AUN, p. 689.
6. `International Relationship & Strategic Studies` — IGBINEDION and NOVENA, p. 689. The brochure spelling `Relationship` and ampersand are retained.
7. `History and International Relations` — AL-HIKMA, p. 689.
8. `History and International Studies` — ESUTECH, UNIHEZ and VISION-UNI, p. 689.

The official IBASS Social Sciences PDF search index and the repository's
column-interleaved extraction were checked together. The extracted source
places the exact programme headings and institution cells in this bounded
sequence; the indexed PDF snippet independently reproduces the adjacent
International Studies variants and the History variants. Each ledger record
now carries the official brochure URL, printed-page/table locator, date and
the institution codes supported by that cell. These confirmations cover
programme/faculty/institution evidence only. Requirement cells are blank or
shared in this block; they were not copied between titles. BELLS remains only
in the existing shared UTME note for the diplomatic-studies entry and was not
added to its institution list. Overlapping titles in Arts or Education remain
separate source contexts.

Official source:
`https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`

## Increment counts

- Occurrences reviewed: 8
- Exact title and institution-cell occurrences confirmed: 8
- Explicit evidence holds added: 0
- Institution arrays changed: 0
- Requirement/shared-column data changed: 0
- Other offering records edited: 0

## Focused test

Added `test_jamb_source_repair_lane_b_increment_010.py`. It checks the bounded
row identities, institution arrays, official source metadata, printed-page
locators, preservation of distinct offering contexts, and that the next row
remains unreviewed.

```powershell
python -m pytest --basetemp "$env:TEMP\pytest-lane-b-010-20260928" data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_010.py -q
```

Result: `1 passed`.

## Resume boundary

Continue at Social/Management row 26, `LIBRARY SCIENCE`; do not repeat rows
18–25. CCMAS joins/scopes, downstream taxonomy, seeds, SQL and UI remain out of
scope for this increment.
