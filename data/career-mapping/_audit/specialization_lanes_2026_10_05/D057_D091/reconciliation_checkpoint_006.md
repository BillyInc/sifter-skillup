# Specialization lane reconciliation checkpoint 006 — D057–D091

Date: 2026-10-05. Continues after D061; D062 is now reviewed.

## Reconciled lane accounting

- Assigned range: **35 domain IDs**.
- Previously reviewed and not repeated: **9** — D067–D068 and D085–D091.
- Newly examined in this continuation: **6** — D057–D062.
- Source-reviewed candidate recommendations counted closed: **11 total** (nine carried forward plus D059 and D061).
- Provisional/unclosed: **24 total**. In the current continuation: D057, D058, D060 and D062. The remaining unexamined IDs are D063–D066 and D069–D084.
- Not yet examined in this continuation: **20**. Next: **D063**.

“Closed” denotes a documented source-based candidate recommendation only. It is not canonical implementation, academic sign-off, or role assignment. The local D098 review is outside this lane.

## D062 — Trading

The current parent description reaches into investment analysis/portfolio advice and quantitative finance, overlapping D013 and D011. The recommendation is therefore provisional: if D062 is scoped to trading/dealing and brokerage/intermediation, the two candidate areas are **Trading, Dealing and Market Making** and **Brokerage and Market Intermediation**. Product markets and styles remain nested contexts by default; FX/money-market dealing is a strong candidate context but not yet a separate third area.

The computational scanner returns **21 lexical hits** (algorithm/optimization, simulation/system modelling, statistics/quantitative), mainly from existing analyst/risk role text. These are not source-validated evidence of a missing computational specialization. Trading algorithms remain a method within execution; pricing/model development requires D011 boundary review.

Artifacts: `D062_specialization_review.json` and `.md`; source locators, claim limits, overlap and alternatives are recorded there. No roles were assigned and no canonical data changed.

## Verification

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091 data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py
```

Result: **24 passed**. Next domain: D063 Economics and Policy Analysis.
