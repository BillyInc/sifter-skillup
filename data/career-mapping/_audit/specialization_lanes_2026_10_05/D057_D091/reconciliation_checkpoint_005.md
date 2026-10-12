# Specialization lane reconciliation checkpoint 005 — D057–D091

Date: 2026-10-05. This resumes checkpoint 004 at D060 and examines the next untouched domain, D061.

## Reconciled lane totals

- Assigned range: **35 domain IDs**.
- Previously reviewed and not repeated: **9** — D067–D068 and D085–D091.
- Newly examined in this continuation: **5** — D057–D061.
- Source-reviewed candidate recommendations counted closed: **11 total** (the nine carried-forward records plus D059 and D061).
- Provisional/unclosed: **24 total**. Within the current continuation these are D057, D058 and D060; the remaining unreviewed are D062–D066 and D069–D084.
- Not yet examined in this continuation: **21**. Next: **D062**.

“Closed” here means the domain-level candidate set has a documented evidence-based recommendation under the lane criteria. It is not canonical implementation, external academic sign-off, role assignment, or role-to-specialization validation. The documented open metrology alternative in D098 is outside this lane and does not alter these counts.

## D061 — Insurance

Recommend three candidate areas: Insurance Underwriting and Risk Selection; Claims, Loss Adjustment and Resolution; and Insurance Distribution and Policy Service. Current occupational/ISCO buckets were not used to set the count. Cross-region support includes UK CII pathways, Canadian Insurance Institute curricula, a U.S. university insurance-management curriculum, and IAIS international supervisory principles. No source mandates the exact labels or count.

Product lines remain contexts within paths by default; policy administration/customer service is nested in distribution/service unless distinct learner-route evidence appears. Actuarial/enterprise-risk and pension-scheme ownership remain parent-catalogue boundary questions, not added specialties by assumption. The scanner found no D061 computational-layer gap; methods such as analytics or fraud detection do not establish a standalone computational specialty.

Artifacts: `D061_specialization_review.json` and `.md`; source claim limits, locators, alternatives and jurisdiction tags are in the JSON. No roles were assigned and no canonical taxonomy JSON changed.

## Verification

Targeted command covering new D061 and local D098 review artifacts:

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091/test_d061_specialization_review.py data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py
```

Result: **10 passed**. The lane-wide test suite remains to be run after checkpoint reconciliation.
