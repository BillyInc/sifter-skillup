# D084 — Payroll and Bookkeeping: role-to-parent-domain fit

**Slice:** 15/15 exact residual mappings reviewed against task evidence and the stored D084 parent scope. Canonical data unchanged.

| Disposition | Count |
|---|---:|
| Supported | 7 |
| Conditional | 4 |
| Unsupported | 4 |
| Unresolved | 0 |

## Exact decisions

| Exact role key | Result | Task-based rationale |
|---|---|---|
| `D084|auditing clerk` | supported | The supplied duties examine and verify an organisation's financial records and transactions; that is expressly within the domain's accounting-record and audit-support scope. |
| `D084|back office specialist` | conditional | The ESCO task definition covers financial-company administration, transaction processing, data and documents, but does not establish that bookkeeping/payroll recordkeeping is the actual assignment rather than another back-office function. |
| `D084|billing clerk` | supported | The task creates invoices, credit memos and customer statements and updates customer files, matching billing records and financial-document maintenance. |
| `D084|bookkeeper` | supported | The task records, balances and assembles routine sales, purchase, payment and receipt transactions in day books and ledgers—the central work of bookkeeping. |
| `D084|Bookkeeping, Accounting, and Auditing Clerks` | supported | The task explicitly classifies, records, calculates and verifies numerical data to maintain complete financial records. |
| `D084|financial markets back office administrator` | unsupported | The supplied duties centre on clearing and settling securities, derivatives, foreign-exchange and commodity trades. That is market-transaction operations, not payroll/bookkeeping as this parent domain is defined. |
| `D084|foreign exchange cashier` | conditional | The role chiefly executes currency cash transactions and provides exchange-rate information; recording those transactions is relevant, but the source does not show that maintaining/reconciling books or payroll records is a substantive duty. |
| `D084|Human Resources Assistants, Except Payroll and Timekeeping` | unsupported | The occupational scope explicitly excludes payroll/timekeeping and centres on personnel files, recruitment and HR administration, not bookkeeping or payroll records. |
| `D084|insurance clerk` | unsupported | The supplied duties are insurance-policy/claims administration and customer assistance. The source does not establish bookkeeping/payroll or maintenance of general financial accounts. |
| `D084|investment clerk` | conditional | The supplied duties administer securities investments. That is investment/market operations unless the actual role also has substantive accounting-ledger or financial-bookkeeping responsibilities. |
| `D084|New Accounts Clerks` | unsupported | The authoritative O*NET task profile describes interviewing prospective bank customers, explaining account services and helping with applications. Those are account-opening and customer-service tasks, not bookkeeping/payroll. |
| `D084|Payroll and Timekeeping Clerks` | supported | The task compiles employee time and payroll data, calculates wages and deductions, posts records and prepares paychecks, directly matching payroll recordkeeping. |
| `D084|payroll clerk` | supported | The task manages timesheets and paychecks and checks overtime, leave and pay accuracy, directly matching payroll records and processing. |
| `D084|sales support assistant` | conditional | The supplied duties are primarily sales support; checking invoices/accounting documents is relevant but does not establish that bookkeeping or maintaining financial books is a substantive part of the role. |
| `D084|tax clerk` | supported | The task collects financial information and prepares accounting and tax documents, which fits the domain's clerical financial-record and tax-document work; it does not imply the role independently determines tax liability. |

## Proposed canonical corrections (not applied)

- `D084|financial markets back office administrator` — remove the D084 parent-domain link. The source task is outside payroll/bookkeeping as scoped; see the exact evidence and source references in the JSON report.
- `D084|Human Resources Assistants, Except Payroll and Timekeeping` — remove the D084 parent-domain link. The source task is outside payroll/bookkeeping as scoped; see the exact evidence and source references in the JSON report.
- `D084|insurance clerk` — remove the D084 parent-domain link. The source task is outside payroll/bookkeeping as scoped; see the exact evidence and source references in the JSON report.
- `D084|New Accounts Clerks` — remove the D084 parent-domain link. The source task is outside payroll/bookkeeping as scoped; see the exact evidence and source references in the JSON report.

## Sources and limits

The exact ESCO occupation definitions and task payloads are cited per role in the JSON report. O*NET's [bookkeeping/accounting/auditing clerk profile](https://www.onetonline.org/link/summary/43-3031.00), [billing and posting clerks](https://www.onetonline.org/link/summary/43-3021.00), [payroll and timekeeping clerks](https://www.onetonline.org/link/summary/43-3051.00), and [New Accounts Clerks](https://www.onetonline.org/link/summary/43-4141.00) distinguish bookkeeping/payroll from account-opening and customer transactions. O*NET also separately defines [HR assistants excluding payroll](https://www.onetonline.org/link/summary/43-4161.00), [insurance claims and policy processing clerks](https://www.onetonline.org/link/summary/43-9041.00), and [brokerage clerks](https://www.onetonline.org/link/summary/43-4011.00). These are cross-jurisdiction occupational references, not evidence of Nigerian demand or Nigerian licensure.

Four records remain conditional rather than being treated as confirmed student paths: back-office specialist, foreign-exchange cashier, investment clerk and sales-support assistant are checked against the task-scope condition stated on each exact decision.

- Exact D084 residual coverage: 15/15; 7 supported, 4 conditional, 4 unsupported, 0 unresolved.
- Unsupported-link actions are proposals only; no canonical edit or seed regeneration was performed.
