# Authoritative follow-up addendum — rows 001 and 009

Audit date: 2026-09-26 (Africa/Lagos). Append-only audit evidence; no shared source, inventory, mapping, code, seed, SQL, taxonomy label, or role name was changed.

## Row 001 — Civil Law / Law heading boundary

Primary source: official JAMB IBASS [Law brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf), printed pp. 418–419; PDF-derived local text: `data/career-mapping/_jamb_txt/Law.txt`.

- Printed p. 418's official programme index lists **Civil Law** as item 1 and **Law** separately as item 7.
- On printed p. 419, the table text places the `CIVIL LAW` heading above awarders **ABU, OOU, UNIZIK**. The next distinct programme heading `LAW` then begins before **AAU, AAUA, ABSU, ...**.
- The current occurrence inventory has one `Civil Law` occurrence (`13db7f702d56c6f9`) with 117 institution tokens, including `LAW`; the inventory has no separate canonical `Law` identity/occurrence.

**Confirmed inventory defect:** `LAW` is a programme heading in the official index/table, not an awarding institution in the Civil Law cell. The Civil Law parsed token list has crossed a programme boundary. The table text strongly indicates Civil Law's cell is ABU/OOU/UNIZIK; the rest of the institution sequence after the distinct `LAW` heading must be reconciled to the missing/separate Law context before any repair. This supersedes `_001.md`'s weaker statement that the full Civil Law sequence merely remained unverified.

## Row 009 — separate Social/Management Criminology and Security Studies occurrence

Primary source: official JAMB IBASS [Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed pp. 613–615; PDF-derived local text: `data/career-mapping/_jamb_txt/Social Management Science.txt`.

The extracted table places the `CRIMINOLOGY` heading/institutions first, then a separate `CRIMINOLOGY AND SECURITY STUDIES` heading and its institution list across the continuation pages. Comparing occurrence `b2082bd5151bea30` to the p. 613–615 extracted text block finds all **63 of 63** inventory institution tokens present; none are absent from that block. This is a text-layer set reconciliation, not a visual confirmation of every table-cell boundary. It verifies the programme's separate source context and strengthens the parsed list, but does not equate it with Law-occurrence row 005 (JOS, printed p. 430).

## Remaining boundary

These additions resolve source-context questions only. Row 001's distinct Law context still needs its complete institution-set reconciliation; row 009 needs visual cell-boundary confirmation. Both rows still require the assigned CCMAS course/outcome and every active domain-to-subgroup/role fit audit; neither is closed end-to-end.
