# Lane 2 source-audit checkpoint 015 — German outcome/content tranche, rows 26–30

## Scope and source

Continued package 080 immediately before checkpoint 014's rows 31–41; this uses the current local fields verified in checkpoint 013 (`skills_learned`, `content_summary`, `lh`, `ph`). Compared ENT 312, FAC 301, FAC 302, GER 301 and GER 302 with the exact German-course blocks in the [official NUC Arts CCMAS](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), accessed 2026-09-28, printed pp. 481–484. For the malformed FAC 301 outcome, I also checked the repeated same-code/title FAC 301 block in that same official PDF (printed p. 67); this is corroborating evidence, not a silent assumption that the corrupt German-section text is legible.

## Results and repair handoff

- **ENT 312 — confirmed repair:** eight local outcomes fuse source outcomes 8 and 9; PH 45 is missing; and the content summary truncates after “personal savings,” although the NUC content continues. Restore the separate final outcome, PH 45 and remaining source content.
- **FAC 301 — confirmed repair with a source note:** the local content summary is empty. Local outcome 4 is corrupt; the German-section NUC copy is also OCR-corrupt there, while the same NUC PDF's repeated FAC 301 block gives “engage in field works to collect data.” Restore the content and repair only that outcome using the repeated official block, recording both locators.
- **FAC 302 — confirmed content-field boundary defect:** all five local outcomes match in count and substance, but `content_summary` begins with “Learning Outcomes” and mixes the heading with the actual course-content text. Keep the outcomes; clean the content field boundary.
- **GER 301 — confirmed outcome merge:** the local third outcome combines two source outcomes (grammar/phonology/culture and translation/interpretation/evaluation); split it into two entries. The fifth generic employment outcome is already present; LH 30 and the content summary match.
- **GER 302 — checked match:** its five local outcomes, content summary and checked hours match the exact source block; no edit indicated.

No shared product ledger, CCMAS source JSON, mapping or seed was edited. These are source-backed repair pointers for the local correction pass. Package 080 remains open; this tranche does not repeat prior field/count flags and does not constitute package sign-off.
