# Authoritative follow-up addendum — rows 002–006 and 009

Audit date: 2026-09-26 (Africa/Lagos). This addendum closes some JAMB offering-source questions left open or imprecisely located in checkpoint `_001.md`; it does not close the full identity audits. No shared mapping, source inventory, curriculum scope, code, seed, SQL, label, or role file was changed.

## Primary-source locator

Official JAMB IBASS [Law brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf). The checked-in text extraction `data/career-mapping/_jamb_txt/Law.txt` preserves printed page footers and table text. The following exact cells are present in the PDF-derived text:

| Row | Printed JAMB cell and page | Comparison to current occurrence inventory | Finding |
|---:|---|---|---|
| 002 | **Islamic/Sharia Law** — ABU, KHAIRUN, MAIDUGURI, PAAU, PRU; printed p. 428. | All five tokens match occurrence `7298363697cb54a1`. | Offering name and institution set verified from the table cell. This corrects `_001.md`'s claim that the cell was not resolved. |
| 003 | **Common and Islamic Law** — ABUJA, BAYERO, FOUNTAIN, ILORIN, KWASU, LASU on p. 428; continuation NASARAWA, UDU, UNI-ILESA, UNIOSUN on p. 429. | All ten tokens match occurrence `a9f90fcc546a6d56`. | Offering name and full institution set verified from the table cell. |
| 004 | **Public and Private International Law** — AAUA, MAIDUGURI (Pub); printed p. 430. | Tokens match occurrence `cd498dbdfc39050a`, including Maiduguri qualifier. | Confirmed source label/context mismatch remains: canonical/index `Public and International Law` versus body-cell heading `Public and Private International Law`. Preserve both labels and the `(Pub)` qualifier as offering evidence. This corrects `_001.md`'s p. 428 locator. |
| 005 | **Criminology and Security Studies** — JOS; printed p. 430, within the Law faculty block. | Matches Law occurrence `c099170ff7869fcc`. | Law-faculty occurrence verified. It is separate from the Social/Management occurrence in row 009. This corrects `_001.md`'s p. 429 locator. |
| 006 | **Common Law** — ILORIN, KWASU; printed p. 430. | Matches occurrence `249e4e903cb0615d`. | Offering name and institution set verified. This corrects `_001.md`'s p. 429 locator. |

For row 009, the official JAMB IBASS [Social Sciences brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf), printed pp. 613–614, contains a separate `CRIMINOLOGY AND SECURITY STUDIES` awarding-institution block. In `data/career-mapping/_jamb_txt/Social Management Science.txt`, the block begins on p. 613 after the distinct `CRIMINOLOGY` row and continues on p. 614. This confirms a separate Social/Management source occurrence, not the JOS Law occurrence. The entire multi-page institution list has not yet been reconciled token-by-token against occurrence `b2082bd5151bea30`; that exact set remains open.

## Audit boundary

These checks verify JAMB name/faculty/institution table evidence only for the rows explicitly stated above. CCMAS course/outcome sufficiency, active domain-link anchors/status, and subgroup/role task fit remain separate required checks; no row is declared fully closed here. The corrections above are append-only and do not alter the earlier checkpoint text.
