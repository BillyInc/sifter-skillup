# Lane 2 source-audit checkpoint 018 — German outcome/content tranche, rows 11–15

## Scope and source

Compared GST 212, GST 222, FAC 201, FAC 202 and GER 201 with their exact German-section blocks in the [official NUC Arts CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-28, printed pp. 474–477. Current local fields are `skills_learned`, `content_summary`, `lh` and `ph`, per corrected checkpoint 013.

## Results and repair handoff

- **GST 212:** eight outcomes match. The summary is cut after “Logic as an”; the rest of the course-content text has spilled into the last outcome. Repair the field boundary only. Retain the already recorded global GST 211 vs detailed GST 212 source conflict.
- **GST 222:** five outcomes match. LH 30 is missing and the content is truncated at 400 characters. The detailed block is absent from the global German 200-level list; keep that NUC conflict open.
- **FAC 201:** this is both a local extraction defect and a source-quality issue. Locally one array entry combines the last German employment outcome, pagination and the entire course-content paragraph; `content_summary` is empty and LH 30 is missing. In the NUC itself, outcomes 3–7 describe German proficiency/employment even though the course is Digital Humanities and the source content describes computer use, data representation, publishing and networking. Preserve and flag the NUC mismatch; do not invent replacement outcomes or show those five as confirmed requirements.
- **FAC 202:** all five outcomes and LH 30 match. Its content summary is the right source paragraph but stops mid-word; restore the remaining paragraph only.
- **GER 201:** the local fourth outcome merges source outcomes 4 and 5 (comprehension plus translation/interpretation/evaluation). Split them; the sixth source outcome is already the local fifth item.

No shared product data, CCMAS JSON, mapping or seed was edited. Package 080 remains open.
