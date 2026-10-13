# CCMAS German GER 406/407 reconciliation — 2026-09-29

## Source and scope

Audited the final two German source course blocks in the Modern European Languages B.A (German) CCMAS package: GER 406 and GER 407. Primary source: [NUC Arts CCMAS 2023 PDF](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Arts-CCMAS-2023-FINAL.pdf), GER 406 on printed p. 488 and GER 407 on printed pp. 488–489.

## Defect and correction

The local package had 41 course rows but the NUC source has 42 course blocks. The local GER 406 row contained its six matching source outcomes plus two GER 407 outcomes, and its content summary continued through the GER 407 header/content into the following Minimum Academic Standards section. GER 407 was absent as a distinct course.

The local correction restores GER 406 to its six outcomes and its own prose-content sentence, then adds GER 407 Long Essay as a separate 400-level, 6-unit, C course with PH 270, three source outcomes and the independent-essay content. The odd published wording “nation, international and global” is retained and explicitly noted as source wording rather than silently rewritten. Both course rows now carry the NUC item URL, printed locator and access date.

## Verification

`test_german_ger406_407_boundary_repair_2026_09_29.py` asserts the two course identities, exact separation, metadata, outcome counts, content, and provenance. Source-audit checkpoint 034 remains the audit record; this local reconciliation does not alter the checkpoint.
