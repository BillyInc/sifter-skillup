# Authoritative follow-up audit — rows 036–040

Audit date: 2026-09-26 (Africa/Lagos). Append-only supplement to checkpoint `_004.md`; no shared mappings, source inventories, code, seeds/SQL, labels, or role records changed. This checkpoint records new primary-source evidence and preserves unresolved points rather than promoting candidates.

## Primary source

- JAMB IBASS Social Sciences brochure: <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf>, accessed 2026-09-26. Printed pages 666–668. Search-indexed extraction exposes table columns and the awarder/programme sequence; the live document viewer itself returns a JavaScript shell, so where row geometry is not explicit below it remains an evidence gap rather than a visual-cell confirmation.
- JAMB IBASS Arts brochure: <https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf>, accessed 2026-09-26, printed p. 239 for row 040's separate Arts occurrence.

## New row evidence

| Row | Source-verified observation | Remaining evidence gap / disposition |
|---:|---|---|
| 036 | Social Sciences printed p. 666 extraction places **POLITICAL SCIENCE AND PUBLIC ADMINISTRATION** immediately above `AAU`, `BENIN`; the continuation sequence on p. 667 begins `BIU`, `IGBINEDION`, `KWASU`, `RHEMA`, `WESTERN-DEL`, then the next heading **POLITICAL AND ADMINISTRATIVE STUDIES** and `PHC`. This supports the parsed seven-token list for row 036 across a page break; p. 666 contains the programme heading and first two awarders, and p. 667 the remaining five before the next programme heading. | This is text/table-order evidence, not a visual table-cell screenshot. Row remains zero selected courses despite its two declared CCMAS components (Political Science + Public Administration), so the combined-scope gate is a confirmed defect. Course-by-course union and active-link dispositions are still open; do not restore any path from names alone. |
| 037 | Printed p. 667 sequence explicitly shows **POLITICAL AND ADMINISTRATIVE STUDIES — PHC**, bounded between the continuation of row 036's institutions and the next programme heading. | Confirms exact awarder occurrence, not curriculum sufficiency. Existing 27-course Political Science-only scope does not represent the separately named administrative facet. Keep as confirmed named-facet coverage gap; course union and downstream link evidence remain open. |
| 038 | Printed p. 667 sequence explicitly lists **POLITICAL SCIENCE AND INTERNATIONAL RELATIONS** followed by `ABUJA`, `CRAWFORD`, `CUAB`, `GOUU`, `HENSARD`, `KWARARAFA`, `NILE`, `TSUJ`, `UNIOSUN`, then the next heading **POLITICAL SCIENCE AND INTERNATIONAL STUDIES**. This corroborates all nine parsed row-038 awarder tokens and sets a clear end boundary before row 039. | Strong exact text/table-order confirmation; visual cell boundary remains uninspected. Row 038 still declares two CCMAS components but has zero selected courses. Combined curriculum and active-path support remain open; maintain fail-closed state without labeling the programme unavailable. |
| 039 | The official sequence confirms **POLITICAL SCIENCE AND INTERNATIONAL STUDIES** is a distinct programme heading after row 038's nine awarders. | The available extraction does not yet establish the awarder cell for this heading; CUAB remains unverified for this row. Zero selected courses despite Political Science + International Relations scope, with the International Studies facet also needing source-backed representation. Do not count row 039's identity/cell as source-closed. |
| 040 | Printed p. 668 extraction explicitly shows **POLITICAL SCIENCE AND CONFLICT RESOLUTION — AL-HIKMAH**. Printed Arts p. 239 independently lists the same awarder/programme as a distinct Arts occurrence. | Confirms the Social Sciences row-040 occurrence and the separate Arts occurrence (not one merged identity). Existing combined scope has zero selected courses; both components and all active routes remain to be verified. |

## Resulting checkpoint status

- New JAMB table-order evidence closes the institution sequence for rows 036–038 at text-extraction level; row 039's awarding institution remains unchecked. Row 040's two separate faculty occurrences are corroborated.
- No row in 036–040 is fully closed: selected CCMAS course/outcome evidence and per-link downstream review remain outstanding. This checkpoint does not claim the range's source checks or audit are complete.
- Do not change mappings or mark an offering unavailable based solely on absent seed links. Confirmed issues remain the empty combined scopes and row 037's Political-Science-only scope versus its named administrative facet; other semantic-link dispositions remain candidates pending course and descendant evidence.
