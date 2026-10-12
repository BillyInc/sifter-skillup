# Lane 3 source audit increment 004 — JAMB awarder-cell addendum

Access date: 2026-09-28. Source: [JAMB Arts and Humanities brochure](https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf).

This addendum checks the exact awarder cells that increment 002 explicitly left open. It closes the awarder-cell source check for two offering occurrences, not the full identity/curriculum audit.

| JAMB order | Local name → exact brochure row | Exact awarders | Printed locator | Result |
|---:|---|---|---|---|
| 287 | “French and German/Russian” → “RUSSIAN WITH FRENCH/GERMAN” | IBADAN | p.204, Russian/German/Portuguese awarder table | Confirmed defect: local title differs, parsed local tokens omit IBADAN and contain spill text. Whether the slash requires multiple curriculum components remains unresolved; current French-only scope is not validated. |
| 288 | “International Studies and” → “INTERNATIONAL STUDIES AND DIPLOMACY” | BENIN; BIU | p.191, exact programme row and awarder cell | Confirmed defect: local title is truncated and parsed providers do not preserve the exact row-level awarder cell. CCMAS scope remains open. |

The complete prior parsed token list for identity 288 is preserved in `jamb_ccmas_source_audit_lane_3_2026-09-28_increment_002.json`; it should not be interpreted as the official cell. No curriculum-combination inference is made from these JAMB titles. The official JAMB document provides the exact offering labels and cells, so no secondary source was needed for these checks.

Checkpoint: 2 exact awarder cells checked and closed; 0 of these two identities fully closed because their CCMAS component/course-scope audits remain open. Within the 281–290 increment, eight other occurrence cells plus all full curriculum-scope checks remain open.
