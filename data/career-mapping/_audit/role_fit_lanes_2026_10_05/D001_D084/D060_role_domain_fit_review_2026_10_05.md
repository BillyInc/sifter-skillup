# D060 — Banking and Credit Services: role-to-parent-domain fit

**Slice:** 21/21 exact mappings reviewed against role tasks and the stored parent-domain scope. No subgroup or role-to-specialization decisions; canonical mappings unchanged.

| Disposition | Count |
|---|---:|
| Supported | 11 |
| Conditional | 8 |
| Unsupported | 2 |
| Unresolved | 0 |

## Exact decisions

| Role | Result | Task-based rationale |
|---|---|---|
| auditing clerk | conditional | The supplied task is general financial-record auditing, not bank-specific. This link fits only for an auditing-clerk assignment inside a bank or credit provider. **Condition:** bank or credit-provider financial records and controls |
| back office specialist | conditional | The task describes support operations in a financial company. That includes but is not limited to banks; retain this path only where the actual back-office remit supports banking or credit transactions. **Condition:** bank or credit transaction processing |
| bank account manager | supported | The task directly covers advising clients on bank accounts, opening accounts, documentation, and ongoing bank customer service. |
| bank manager | supported | The task explicitly oversees bank activities, safe banking operations, bank policy, and compliance. |
| bank teller | supported | The task directly covers customer deposits, withdrawals, cash balancing, bank accounts, and related transactions. |
| brokerage firm director | unsupported | The task is securities-trading strategy and brokerage management. It does not describe deposit banking, lending, mortgage, or credit-union services in the stored D060 scope. |
| credit adviser | supported | The task directly advises clients on credit, debt and borrowing solutions, which is the core credit-services remit. |
| credit analyst | supported | The task assesses borrower credit applications and repayment risk for lending decisions; that directly matches credit analysis. |
| credit manager | supported | The task sets and administers credit policy, limits, risk acceptance, payment terms, and collection for a lender. |
| credit risk analyst | supported | The task explicitly assesses individual credit risk and recommends risk levels, directly matching lender credit-risk work. |
| credit union manager | supported | The task explicitly manages credit-union member services, staff, operations, policies, and financial reporting. |
| debt collector | conditional | The task is generic overdue-debt collection and does not identify the creditor. It belongs here only when collecting debts for a bank, credit union, mortgage lender, or other credit provider. **Condition:** collections for a banking or credit provider |
| financial markets back office administrator | conditional | The task explicitly processes securities, derivatives, FX and commodity trades and clearing/settlement. These are financial-market operations, not necessarily banking or credit; retain only for a bank-owned trading/settlement desk whose remit is within the D060 offering. **Condition:** bank-owned financial-market operations; not a general market-operations assignment |
| foreign exchange cashier | conditional | The task covers currency exchange and cash transactions but does not establish that the employer is a bank. Keep only for a bank or credit-provider foreign-exchange counter, not a general exchange bureau. **Condition:** bank-based foreign-exchange cash service |
| investment clerk | conditional | The task describes securities-investment administration in a financial company. It is not inherently banking or credit work; retain only for an investment operation within a bank covered by D060. **Condition:** investment administration within a bank |
| loan officer | supported | The task directly evaluates, recommends or authorizes consumer, commercial and mortgage credit and advises borrowers. |
| mortgage broker | supported | The task directly handles mortgage applications, lender documentation and mortgage-loan completion; mortgage firms are explicitly within D060's scope. |
| mortgage loan underwriter | supported | The task reviews mortgage loans against underwriting policy and guidelines, directly matching mortgage-credit assessment. |
| pawnbroker | conditional | The task involves secured consumer lending against personal property, so it is credit work, but it is a distinct non-bank lending model. Keep only if D060 intentionally includes non-bank credit providers; otherwise it belongs outside the bank/mortgage/credit-union scope. **Condition:** non-bank secured consumer lending explicitly included in D060's credit-services scope |
| pension scheme manager | unsupported | The task manages pension schemes, retirement benefits and pension-fund deployment. It does not establish banking, lending, mortgage, or credit-union work. |
| student financial support coordinator | conditional | The task serves students and education administrators by determining or advising on student loans. It fits only where the work is loan/credit administration, not general student financial aid or campus support. **Condition:** student-loan eligibility, origination or servicing |

## Evidence and limits

The [EBA Guidelines on Loan Origination and Monitoring](https://www.eba.europa.eu/activities/single-rulebook/regulatory-activities/credit-risk/guidelines-loan-origination-and-monitoring) treat lending as a lifecycle involving borrower assessment, credit-risk controls and monitoring; this is a jurisdiction-specific regulatory source, used here to corroborate task boundaries rather than impose EU rules globally. O*NET's [Banking & Credit cluster](https://www.onetonline.org/find/career?c=030102) identifies banking, loans, microlending and commercial/consumer credit as related job contexts. O*NET task profiles for [tellers](https://www.onetonline.org/link/details/43-3071.00), [credit analysts](https://www.onetonline.org/link/details/13-2041.00), [credit clerks](https://www.onetonline.org/link/details/43-4041.00), [credit counsellors](https://www.onetonline.org/link/details/13-2071.00) and [loan officers](https://www.onetonline.org/link/details/13-2072.00) corroborate the corresponding work tasks. Exact ESCO/O*NET task record URLs are retained per decision.

Conditional is not a weak synonym for supported: it means an actual bank/credit assignment must be established before the mapping is shown as a confirmed D060 path. Securities brokerage, pension management and general auditing/collections are not automatically bank/credit work. Pawnbroking is conditional because the stored domain scope does not make clear whether it includes non-bank secured lending.

## Audit checks

- Exact queue-key coverage: 21/21; 11 supported, 8 conditional, 2 unsupported, 0 unresolved.
- Every decision records supplied task evidence, rationale, source URLs, source limits, and action.
- No canonical role mapping or specialization data changed.
