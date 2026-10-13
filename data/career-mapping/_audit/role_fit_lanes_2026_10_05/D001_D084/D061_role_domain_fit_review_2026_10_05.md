# D061 — Insurance: role-to-parent-domain fit

**Slice:** 20/20 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical data unchanged.

| Disposition | Count |
|---|---:|
| Supported | 13 |
| Conditional | 2 |
| Unsupported | 5 |
| Unresolved | 0 |

## Exact decisions

| Role | Result | Task-based rationale |
|---|---|---|
| financial broker | unsupported | The supplied tasks concern securities and financial-market trading on clients' behalf, not insurance policies, risk transfer, premium pricing, or claims. |
| foreign exchange broker | unsupported | The supplied tasks are currency-market dealing and speculation on exchange-rate movements; no insurance activity is described. |
| insurance agency manager | supported | The task explicitly manages an institution or branch providing insurance services and advises clients on insurance products. |
| insurance broker | supported | The task explicitly advises on and intermediates insurance policies between customers and insurers. |
| insurance claims handler | supported | The task explicitly assesses and administers insurance claims and payments to policyholders. |
| insurance claims manager | supported | The task leads insurance claims handling, resolves complex policyholder cases, and coordinates with adjusters and brokers. |
| insurance clerk | supported | The task performs insurance-agreement administration and provides information about insurance to customers in insurance institutions or agencies. |
| insurance collector | supported | The task collects overdue insurance premiums and arranges payment plans for policyholders. |
| insurance fraud investigator | supported | The task investigates suspicious insurance claims, customer activity, product purchases and premium calculations. |
| insurance product manager | supported | The task owns insurance-product development and lifecycle, aligned with insurance strategy and distribution. |
| insurance rating analyst | conditional | The supplied description mixes insurance premium/rate calculation with credit-rating opinions. The insurance-pricing work fits; generic securities/issuer credit-rating work does not. Confirm which task set the mapped role record intends. **Condition:** insurance risk classification and premium/rate calculation, not issuer or securities credit ratings |
| insurance risk consultant | supported | The task surveys people, property or sites to estimate potential financial loss for insurance underwriting. |
| insurance underwriter | supported | The supplied task explicitly evaluates insurable commercial-property and liability risks and supports insurance coverage decisions, although the source excerpt also mentions loan-related duties. |
| loss adjuster | supported | The task investigates insured losses, assesses damage and liability against policy terms, and recommends claim settlement. |
| mortgage broker | unsupported | The task is mortgage-credit intermediation and loan-agreement administration, not insurance intermediation. |
| mortgage loan underwriter | unsupported | The task reviews mortgage-loan underwriting guidelines and loans; it does not describe insurance underwriting. |
| mutual fund broker | unsupported | The task raises and invests shareholder funds in securities and money-market instruments; that is investment management/brokerage, not insurance. |
| pension scheme manager | conditional | The task manages retirement schemes and pension-fund deployment. Some insurers administer or provide pension/annuity products, but the supplied profile does not establish that this role is insurer-based. **Condition:** pension or retirement products administered/provided by an insurer; not general pension-fund management |
| personal property appraiser | supported | The task explicitly values personal property for insurance purposes as well as sales; the insurance valuation use is a direct fit. |
| property insurance underwriter | supported | The task directly evaluates insured property risk and coverage under insurance underwriting rules. |

## Evidence and limits

The [IAIS Insurance Core Principles and Methodology](https://www.iais.org/uploads/2022/01/Insurance_core_principles_and_methodology.pdf.pdf) provide international supervisory principles for insurers and insurance intermediaries; they support the distinction between insurance functions and other financial services, but are not a global job taxonomy. O*NET task profiles for [insurance underwriters](https://www.onetonline.org/link/summary/13-2053.00) and [claims adjusters/examiners/investigators](https://www.onetonline.org/link/summary/13-1031.00) corroborate underwriting and claims tasks. Exact ESCO/O*NET locators are retained per decision.

Financial brokers, foreign-exchange brokers, mortgage-credit roles and mutual-fund brokers are not insurance merely because they work in financial services. The rating-analyst record combines insurance pricing with credit-rating language; pension management is conditional on insurer-provided pension/annuity work.

- Exact queue-key coverage: 20/20; 13 supported, 2 conditional, 5 unsupported, 0 unresolved.
- Every disposition includes task evidence, rationale, source references, limits and recommended action.
- No canonical role mapping or specialization data changed.
