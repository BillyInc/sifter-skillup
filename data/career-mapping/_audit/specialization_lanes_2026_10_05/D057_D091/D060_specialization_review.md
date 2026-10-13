# D060 — Banking and Credit Services: specialization review

**Status: provisional source review; no canonical taxonomy change.** Reviewed 2026-10-05. This is limited to whether the specialization structure fits the parent domain, has defensible labels/boundaries/count, or should be flat. It does not assess role-to-domain or role-to-specialization fit.

## Finding

The current four labels—“Bank & Fund Directors,” “Lending & Credit Advisors,” “Teller & Collections Services,” and “Banking Back-Office Clerks”—are an inventory of occupationally framed buckets, not an evidenced specialization taxonomy. Do not treat their count or membership as proof of the right structure.

Credit and lending is the strongest supported distinct learning area. The Global Banking Education Standards Board (GBEStB), formed by 25 national banking institutes, has a dedicated Credit & Lending education standard. Its scope describes credit and lending as a core banking education area and covers lending principles, borrower and facility types, appraisal/risk, monitoring and impaired assets (PDF pp. 1–7). This supports considering a Credit and Lending specialization, but does not prescribe our taxonomy or a universal subgroup count. [GBEStB global standards](https://www.globalbankingstandards.org/globalstandards), [Credit & Lending standard](https://www.globalbankingstandards.org/s/GBEStB-Credit-Lending-Education-and-Training-Standard-Final-080721-gs84.pdf)

The Basel Committee's globally applicable Core Principles distinguish bank-wide governance, risk management, credit, liquidity, operational resilience, controls and customer-due-diligence expectations. They show why governance, risk and compliance should not automatically become separate learner specializations: these are cross-cutting supervisory dimensions, not a published education taxonomy. Likewise, Basel's four credit-risk headings are control/lifecycle areas, not four sibling specializations. [Basel Core Principles](https://www.bis.org/committees/bcbs/basel-framework/standard/bcp?allChapters=true), [2025 credit-risk principles](https://www.bis.org/bcbs/publ/d595.pdf)

Payments, clearing and settlement are a distinct technical practice in the CPMI/IOSCO Principles for Financial Market Infrastructures. But those standards concern payment systems and other financial-market infrastructures; they do not establish that bank payment operations belong as a separate D060 specialization rather than within banking operations or a neighboring infrastructure domain. [BIS/CPMI Principles for Financial Market Infrastructures](https://www.bis.org/committees/cpmi/pfmi/overview)

## Recommendation and unresolved choice

Reject the current four-bucket structure as the student-facing taxonomy. Keep **Credit and Lending** as a source-supported candidate area. Do not yet approve a final subgroup count or choose between flat and split: we still need comparative banking curricula showing whether customer/account/deposit operations, payments/transaction services and treasury form distinct additive learner pathways under this parent. The GBEStB page itself says there are not definitive internationally agreed answers to the full question of bankers' knowledge and skills. It lists Treasury Operations as a **first draft**, so that document is a signal to investigate, not a settled global standard.

Risk, compliance and governance should remain cross-cutting foundation topics unless comparative education sources demonstrate that they form distinct pathways. Possible labels such as **Customer, Account and Deposit Operations**, **Payments and Transaction Services**, and **Treasury Operations** are candidates only—not approved additions. The key boundary issue is whether this parent means bank service operations alone or also payment/settlement infrastructure.

No Nigeria-specific source was used to set the global structure. Local product, legal, supervisory and licensing details should be tagged by jurisdiction in any later content enrichment.

## Source locators and limits

The full source register, locator details, claim limits and alternatives are in [`D060_specialization_review.json`](D060_specialization_review.json). In brief:

- GBEStB Credit & Lending standard, pp. 1–7: distinct professional education area; voluntary standard, not taxonomy/accreditation.
- Basel Core Principles: BCP40.32–34, 40.39, 40.41–66: global supervision dimensions; not a curriculum or subgroup count.
- CPMI/IOSCO PFMI overview and principles: payment-system/FMI scope and settlement processes; not proof of bank-employee specialization placement.
- 2025 BCBS Credit Risk Principles overview: four credit-risk management/control areas; not four specialization nodes.

## Accounting and verification

- D060 is one of the assigned 35 IDs; it is now source-reviewed but remains **provisional/unclosed**.
- Lane totals after D060: 35 assigned; 9 previously reviewed and skipped; 4 newly reviewed in this continuation (D057–D060); 10 evidence-closed total carried from prior work; 25 provisional/unclosed; 22 not yet examined in this continuation. Next cursor: D061.
- D092 and D093–D168 remain outside this lane/local-owned.
- No canonical structure JSON, shared register, role library, role mapping, or generator was edited.
- Test command: `python -m pytest -q data/career-mapping/_audit/specialization_lanes_2026_10_05/D057_D091`.
