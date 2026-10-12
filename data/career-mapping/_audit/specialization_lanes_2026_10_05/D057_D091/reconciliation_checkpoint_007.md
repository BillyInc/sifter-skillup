# Specialization lane reconciliation checkpoint 007 — D057–D091

Date: 2026-10-05. Continues after D062; D063 is now reviewed.

## Reconciled lane accounting

- Assigned range: **35 domain IDs**.
- Previously reviewed and not repeated: **9** — D067–D068 and D085–D091.
- Newly examined in this continuation: **7** — D057–D063.
- Source-reviewed candidate recommendations counted closed: **11 total** (nine carried forward plus D059 and D061).
- Provisional/unclosed: **24 total**. In the current continuation: D057, D058, D060, D062 and D063. D063 remains provisional because six is a synthesized grouping, the applied-sector umbrella may need splitting, and the finance/policy boundaries need catalogue reconciliation.
- Not yet examined in this continuation: **19** — D064–D066 and D069–D084. Next: **D064**.

“Closed” denotes a documented source-based candidate recommendation only. It is not canonical implementation, academic sign-off, or role assignment. D063 is examined but still provisional, so it remains in the provisional count. D098 remains outside this lane.

## D063 — Economics and Policy Analysis

The current three subgroup records mix occupational buckets and do not establish the student specialization count. The provisional six-area synthesis is: Economic Research, Econometrics and Forecasting; Computational Economics and Economic Modelling; Public Economics, Policy and Evaluation; Macroeconomic, Monetary and Financial Economics; International, Trade and Development Economics; Applied and Sector Economics. The last area keeps sector topics visible as themes, with a noted alternative of splitting them if the resulting student pathways warrant more cards.

Computational economics is explicitly named based on the Society for Computational Economics and independent Southampton/Edinburgh/McGill curricula—not merely the scanner. Its methods can support multiple economic areas. AEA JEL establishes breadth but is a literature classification, not a student taxonomy. Finance, policy, and applied-sector boundaries remain open for cross-catalogue reconciliation. No roles were assigned and no canonical data changed.

Artifacts: `D063_specialization_review.json` and `.md`; source locators, claim limits, alternatives and computational scan disposition are recorded there.

## Verification

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091 data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py
```

Result: **29 passed**. Next domain: D064.
