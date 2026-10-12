# JAMB identity and offering audit — rows 001–010

Date: 2026-09-29. Scope is limited to canonical JAMB identity spelling, faculty/source context, and institution-awarder cells with page/table locators. No shared source ledger or downstream domain mapping was edited.

## Coverage reconciliation

The deterministic discovery report contains 420 canonical identities and distinguishes each parsed offering occurrence. In this tranche, rows 001–010 have 10 current occurrences. The exact prior coverage was checked in `jamb_ccmas_authoritative_followup_rows_001_140_2026-09-26_001.md` and `jamb_ccmas_source_audit_lane_1_2026-09-28_005_jamb_occurrence_reconciliation.json`. The prior report already checked rows 004–008 and 010; those source decisions are carried forward without repeating their source checks. Rows 001–003 and 009 were previously left without complete exact awarder-cell verification. New official-PDF searches were limited to those open fields.

## Results

| Row | Current source context | Result | Disposition |
|---:|---|---|---|
| 001 | Civil Law — Law brochure, p. 419, occurrence `13db7f702d56c6f9` | Title and faculty match. The large awarder cell continuation and embedded `LAW` token boundary remain unresolved; the 117 local tokens are not confirmed. | unresolved |
| 002 | Islamic Law/Sharia Law — Law brochure, occurrence `7298363697cb54a1` | The p. 419 index confirms the exact title and Law faculty. Exact awarder cell for ABU, KHAIRUN, MAIDUGURI, PAAU and PRU remains unverified. | unresolved |
| 003 | Common and Islamic Law — Law brochure, occurrence `a9f90fcc546a6d56` | The p. 419 index confirms title and faculty. Exact awarder cell and continuation boundary remain unverified for the ten local institution tokens. | unresolved |
| 004 | Public and International Law — Law brochure, p. 428, occurrence `cd498dbdfc39050a` | The brochure index/canonical title is “Public and International Law”; the body prints “Public and Private International Law.” AAUA and MAIDUGURI (Pub) agree with local tokens. Preserve the title variation as a source conflict. | source conflict |
| 005 | Criminology and Security Studies — Law brochure, p. 429, occurrence `c099170ff7869fcc` | JOS is confirmed. | confirmed match |
| 006 | Common Law — Law brochure, p. 429, occurrence `249e4e903cb0615d` | ILORIN and KWASU are confirmed. | confirmed match |
| 007 | Criminology and Penology — Social/Management Sciences brochure, p. 617, occurrence `2980b53ae7ec073d` | RSU and SALEM are confirmed. | confirmed match |
| 008 | Criminology — Social/Management Sciences brochure, p. 617, occurrence `3078528f4f2b768e` | BAYERO is confirmed. CALEB, JEWEL and POL-ACAD were not visible in the recovered exact cell and remain candidates. | candidate |
| 009 | Criminology and Security Studies — Social/Management Sciences brochure, p. 574 index, occurrence `b2082bd5151bea30` | Index confirms title only. Its separate Social/Management awarder cell is unresolved; row 005’s Law/JOS cell is not evidence for it. | unresolved |
| 010 | Demography and Social Statistics — Social/Management Sciences brochure, p. 628, occurrence `ec7015e8813934e7` | COVENANT, FED-KEBBI, FED-OYE EKITI, OAU and UNIOSUN are confirmed. The adjacent Demography and Statistics — GOUU row is a distinct identity. | confirmed match |

Exact URLs, source dates, current local comparisons, and prior checkpoint references are retained in the JSON. Source claims here concern only JAMB identity/offering records; no curriculum-to-domain or career-path audit is included.

## Tranche coverage and cursor

10 canonical identities and 10 offering occurrences reviewed. Dispositions: 4 confirmed matches, 1 source conflict, 1 candidate and 4 unresolved. No row is fully closed because every exact context must have a complete identity and awarder-cell comparison. Next cursor: **row 011**.
