# Nigerian CCMAS/JAMB reviewed links — 2026-09-01

This is a reviewed disposition layer for the previous 86-row queue. It uses exact Nigerian CCMAS curriculum material for programme learning and Nigerian professional/local evidence for destination-domain context and bridge preparation.

- Affected JAMB rows: **86**
- Candidate link occurrences: **711**
- Published in reviewed map: **710**
- Source-gap links: **0 rows**

## Dispositions

- `certified_nigerian_curriculum_link`: **547**
- `removed_unsupported_candidate`: **1**
- `resolved_nigerian_bridge_link`: **163**

## Rule

A bridge link is not a claim that the programme qualifies the learner for the destination profession. It means the programme supplies an evidenced starting point and the Nigerian professional/local sources identify the additional domain preparation, examination, registration, or supervised practice that must be explained in the guidance flow.

Unsupported candidates are removed from the reviewed published set. They are not silently retained as recommendations merely because a global occupational source or a broad Nigerian context profile exists.

## Reproducibility

```text
python data/career-mapping/_review_nigerian_ccmas_links.py
```
