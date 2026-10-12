# Specialization lane checkpoint 009 — D003–D084

Date: 2026-10-05

## Scope and write boundary

- Lane range D003–D084; D001–D002 excluded and the separate D085+ lane untouched.
- This is specialization taxonomy only. Do not assess or change role→domain or role→specialization links, assign roles, enrich learning items, or edit shared registers/canonical taxonomy.
- Use global/cross-regional primary professional, industry and academic sources. Existing group labels/counts and ISCO membership are context only, never evidence of specialization fit.
- The computational catalogue scan is a cross-check/candidate detector only. A keyword hit does not prove a distinct specialization should exist.

## Progress and next cursor

- Source-reviewed domain set: **10/82 — D003–D012**.
- Remaining in order: **72/82 — D013–D084**.
- D003–D010 were checkpointed previously and not repeated. D011 and D012 are new in this checkpoint interval.
- D011 recommends 3 internal-synthesis areas: Quantitative Pricing and Financial Engineering; Quantitative Financial Risk Modeling; Systematic Investment and Quantitative Trading.
- D012 recommends 3 internal-synthesis areas: Digital Payments and Transaction Systems; Digital Banking and Credit Platforms; Financial-Market and Investment Infrastructure.
- Neither source set mandates these exact counts. Role mapping remains unreviewed.

## Computational-coverage cross-check

Read `COMPUTATIONAL_TAXONOMY_CANDIDATES_2026-10-05.md` as a high-recall lexical discovery report, not a semantic verdict. Its global counts are 168 domains scanned, 121 keyword-hit domains, 36 in the declared computational set, 87 lexical candidates outside that set, and 1,486 source-field hits. Individual domain hits are context only.

- D011 has 30 source-field hits; quantitative-finance evidence is independently evaluated from CFA/GARP sources in the D011 record.
- D047 has 8 source-field hits, including computational/agricultural method language; it remains pending explicit source adjudication of precision agriculture versus a distinct specialization.
- D065 has 1 source-field hit mentioning computational linguistics/NLP; it remains pending direct ACL-source adjudication.
- These numbers count lexical matches and do not determine subgroup creation/count.

## D011/D012 primary evidence checked

- D011: GARP FRM exam topics; CFA CBOK; CFA 2026 material on quantitative active strategies and portfolio mathematics.
- D012: FSB FinTech function taxonomy; BIS CPMI mandate and payment-infrastructure report; World Bank digital-finance and API resources.
- Exact locators, claims and limitations are recorded in each domain's JSON review.

## Files and verification

- D011: JSON, Markdown and `test_d011_specialization_review.py`.
- D012: JSON, Markdown and `test_d012_specialization_review.py`.
- Verification command: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D003_D084`.

## Next

Continue at D013 without repeating D003–D012. Explicitly adjudicate D047 and D065 when reaching them, and record the computational scan as a candidate cross-check in their reviews.
