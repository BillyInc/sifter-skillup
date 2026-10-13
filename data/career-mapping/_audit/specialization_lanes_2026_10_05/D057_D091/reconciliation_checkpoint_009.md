# Specialization lane reconciliation checkpoint 009 — D057–D091

Date: 2026-10-05. Continues after D065; D066 is next.

## Reconciled lane accounting

- Assigned range: **35 domain IDs**.
- Previously reviewed and not repeated: **9** — D067–D068 and D085–D091.
- Newly examined in this continuation: **9** — D057–D065.
- Source-reviewed candidate recommendations counted closed: **11 total** (nine carried forward plus D059 and D061).
- Provisional/unclosed: **24 total**. In this continuation: D057, D058, D060, D062–D065. D063–D065 have sourced candidate sets but remain provisional on grouping and/or catalogue boundaries.
- Not yet examined in this continuation: **17** — D066 and D069–D084. Next: **D066**.

“Closed” means a documented, source-reviewed candidate recommendation, not canonical implementation, academic sign-off or role assignment. Provisional and unexamined cases both count as unclosed.

## Shared-register reconciliation check

The shared register `data/career-mapping/_audit/domain_specialization_review_2026_10_03.json` already contains D085–D091. It does not contain D059 or D061, which are source-reviewed in this lane and need additive reconciliation. The checkpoint says D067/D068 were reviewed earlier, but the review evidence artifacts could not be located in the current checkout (`_audit/domains/D067.json` and `D068.json` are role inventories, not specialization reviews). Do not infer or reconstruct those specialization dispositions from those inventories. This checkpoint records the gap; no existing shared-register content was overwritten.

## D065 — Translation, Interpretation and Linguistics

The four current subgroup records are ISCO occupation families. The provisional six-area synthesis is: Translation, Localization and Transcreation; Interpreting; Terminology and Language-Services Project Practice; Linguistic Research, Description and Documentation; Applied Linguistics and Language Learning; Computational Linguistics and Language Technology.

FIT and CIOL support distinct language-service areas (with CIOL qualification claims kept UK-bounded); ACL provides direct international evidence for computational linguistics/NLP. The LSA scholarly sources support disciplinary breadth but do not mandate this count. The computational scanner’s one hit is a noisy generic-ISCO text signal; it did not establish the computational area. Language-specific computational work should be explicit here, while general AI/software/data work remains a cross-domain boundary question. No roles were assigned and no canonical data changed.

Artifacts: `D065_specialization_review.json` and `.md`; locators and limitations are recorded there.

## Verification

```powershell
python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091 data/career-mapping/_audit/specialization_lanes_2026_10_05/D093_D168/test_d098_specialization_review.py
```

Result: **39 passed**. Next domain: D066.
