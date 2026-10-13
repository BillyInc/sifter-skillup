# JAMB offering-source verification — Lane B checkpoint 012

Date: 2026-09-28  
Status: Social/Management rows 26–33 checked; next planned row is 34

## Scope completed

Verified the next eight sequential Social/Management ledger records after
checkpoint 011 against the official JAMB IBASS Social Sciences degree brochure
and the repository's source-text extraction:

1. `LIBRARY SCIENCE` — AUE, printed p. 634.
2. `LIBRARY AND INFORMATION SCIENCE` — 16 institutions ending with PHC,
   printed p. 635.
3. `Policy and Strategic Studies` — COVENANT, printed p. 646.
4. `Policy and Administrative Studies` — CALABAR, printed p. 646.
5. `Social Justice` — ABUAD and CLIFFORD, printed p. 646.
6. `Political Science` — its institution column through YSU, printed pp. 650–654.
7. `Political Science / International Law and Diplomacy` — BABCOCK, printed
   p. 654. The source typo `INTERNTIONAL` is retained in the source locator;
   the canonical display identity is not changed.
8. `Political Science and Diplomacy` — VERITAS, printed p. 655.

All eight rows now carry item-level official URL, printed-page locator,
verification date, and verified institution codes. Their institution arrays
were already correct and are unchanged. Requirements, shared columns and
waiver data were not revised or copied between adjacent titles. This tranche
confirms only the title/institution cells.

## Separate source context preserved

The same official Social Sciences brochure separately lists canonical JAMB
identity `INFORMATION SCIENCE AND MEDIA STUDIES` for PAN-ATLANTIC on printed
p. 635. That occurrence was absent from the Social/Management ledger. Added
it as a separate source occurrence at the end of the ledger, leaving the
Sciences occurrence (BAYERO and CHRISTOPHER) distinct. The requirement fields
remain null because the adjacent shared/waiver columns cannot be safely
attributed to this cell. This addition does not shift the prior row indexes.

The same printed p. 646 block also lists `STRATEGIC MANAGEMENT` — NBU and
`ENVIRONMENTAL PROTECTION AND RESOURCES MANAGEMENT` — CALABAR. Neither title
is a canonical identity in the current 420-key `jamb_domain_map.json`. They
were not added as aliases or silently treated as canonical rows; reconcile
them against the manual missing-content queue before expanding the canonical
identity set.

## Increment counts

- Sequential ledger records reviewed: 8
- Exact title/institution cells confirmed in those rows: 8
- Institution arrays changed in those rows: 0
- Requirement/shared-column changes: 0
- Additional distinct cross-faculty source occurrence captured: 1
- CCMAS scopes and downstream mappings changed: 0

Current Social/Management ledger state (53 occurrence rows, including the
additional PAN-ATLANTIC source occurrence): 32 PDF-verified, 3 explicit holds,
17 not yet source-verified, and 1 legacy source-text-only confirmation.
These counts describe this ledger only, not the full 420-identity audit.

## Focused test

Added `test_jamb_source_repair_lane_b_increment_011.py`. It checks the exact
eight-row boundary, institution-cell evidence in the extracted source,
shared-requirement preservation, the separately captured PAN-ATLANTIC source
context, and the next unreviewed row.

```powershell
python -m pytest --basetemp .pytest-tmp-lane-b-011-20260928e data/career-mapping/_audit/test_jamb_source_repair_lane_b_increment_011.py -q
```

Result: `1 passed`.

Official source: `https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf`

## Resume boundary

Continue at Social/Management row 34, `Political Science and Public
Administration`. Keep the two p. 646 listings absent from the canonical 420
identity map queued for source-census/missing-content reconciliation. Do not
repeat rows 26–33. CCMAS joins/scopes and downstream taxonomy remain out of
scope for this source tranche.
