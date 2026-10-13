# Specialization lane reconciliation checkpoint 008 — D057–D091

Date: 2026-10-05. Continues after D063; D064 is now reviewed.

## Reconciled lane accounting

- Assigned range: **35 domain IDs**.
- Previously reviewed and not repeated: **9** — D067–D068 and D085–D091.
- Newly examined in this continuation: **8** — D057–D064.
- Source-reviewed candidate recommendations counted closed: **11 total** (nine carried forward plus D059 and D061).
- Provisional/unclosed: **24 total**. In this continuation: D057, D058, D060, D062, D063 and D064. D063 is provisional on area grouping and adjacent-domain boundaries; D064 is provisional on cross-jurisdiction title equivalence and whether health/community and clinical neuropsychology should be split.
- Not yet examined in this continuation: **18** — D065–D066 and D069–D084. Next: **D065**.

“Closed” means a source-reviewed candidate recommendation, not canonical implementation, academic sign-off or role assignment. Provisional and unexamined cases both count as unclosed. D098 remains outside this lane.

## D064 — Psychology and Counselling

The four current subgroup records are broad ISCO occupation families and do not define learner specializations. Cross-region professional frameworks support distinct areas. The provisional eight-area set is Clinical; Counselling Psychology and Psychotherapy; Educational, School and Developmental; Health and Community; Forensic; Work and Organizational; Sport and Exercise; and Psychological Research and Assessment.

APA (US), UK protected-title guidance, and the Australian endorsement pathway show recurring but non-identical areas. Country-specific licensing/protected titles are not generalized. Counselling psychology is kept distinct from broader counselling/psychotherapy. Clinical neuropsychology is surfaced as an advanced pathway under clinical pending full catalogue review. One lexical computational hit in an optional volunteer-mentor competency does not support a computational psychology specialization.

Artifacts: `D064_specialization_review.json` and `.md`; source jurisdictions, limits, alternatives, and scan disposition are recorded there. No roles or canonical data changed.

## Verification

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091 data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py
```

Result: **34 passed**. Next domain: D065.
