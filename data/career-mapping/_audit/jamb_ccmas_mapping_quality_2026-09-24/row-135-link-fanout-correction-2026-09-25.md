# Row 135 link fan-out correction — Mathematics with Computer Science

Checkpoint date: 2026-09-25. Canonical identity: one-based row 135 in
`data/career-mapping/programme_mapping.json`. This is a row-local correction;
the 420-name JAMB identity registry and the 11-course CCMAS scope are unchanged.

## Evidence reviewed

The saved scope in `jamb_curriculum_scopes_2026-08-17.json` selects 11 Computer
Science courses from the NUC Computing CCMAS. Their outcomes cover foundational
mathematics (MTH 101, MTH 102, MTH 201); computing concepts (COS 101); software
programming and OOP (COS 201–202); computer architecture and assembly (IFT
212); software lifecycle, requirements, design, implementation, testing,
maintenance, UML and architecture (SEN 201); IT innovation/business, ethics
and law (CSC 322, CSC 402); and algorithm design/analysis (CSC 401).

Primary source: [NUC Computing CCMAS (2023)](https://www.nuc.edu.ng/wp-content/uploads/2026/03/Computing-CCMAS-2023-FINAL.pdf).
The course-level outcomes were checked against the course tables, including
COS 201–202 (printed Computing pp. 38–40), IFT 212 and SEN 201 (pp. 41–42),
CSC 322 (p. 46), and CSC 401–402 (pp. 50–51). The earlier before-snapshot
contains provisional page transcriptions; these printed-page locators supersede
them where they differ.

D001 Software Engineering is supported: SEN 201 explicitly covers the software
development lifecycle and its requirements, design, development, testing and
maintenance tasks; COS 201–202 provide programming implementation foundations.
This matches the local D001 domain description and task definition. The other
four destinations were not supported by the selected outcomes as student
learning paths: general programming/algorithms do not establish AI/ML (D003),
cloud platforms/deployment/operations (D005), blockchain/distributed-ledger
work (D056), or robotics/control/embedded/hardware integration (D140).

## Before/after disposition

Before-state is preserved in
`row-135-link-fanout-before-snapshot-2026-09-25.md`.

| Representation | Before | Corrected state |
|---|---|---|
| Course scope | 11 courses; D001 only | Unchanged: 11 courses; D001 only |
| Canonical exposed domain links | D001, D003, D005, D056, D140 | D001 only; count 1 |
| Derived map | D001, D003, D005, D056, D140 | D001 only |
| Active map | D001, D003, D005, D056, D140 | D001 only |

D003, D005, D056 and D140 remain preserved as non-student candidates in the
canonical record with `not_supported_by_current_scope` dispositions and
reasons. The original five-entry `candidate_ccmas_domain_links` evidence is
also retained for audit; it is not the active/student link set. No global seed,
role record, role name, or taxonomy naming was changed.

## Focused validation

Parsed all four JSON artifacts and asserted: scope has 11 courses and exactly
D001; canonical has exactly D001 with count 1; derived and active maps each
have exactly D001; the four removed destinations remain in the canonical
non-student candidate list; and the original five candidate records remain.
Result: PASS. The canonical identity count remains 420.
