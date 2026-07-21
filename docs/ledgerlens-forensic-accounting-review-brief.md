# LedgerLens: Concept Review Brief for a Nigerian Forensic Accountant

**Purpose.** This brief explains the LedgerLens product concept in plain language so that a founder, an accounting professional, and a forensic accountant can evaluate whether the product is financially sound, operationally useful, and viable in Nigeria.

**This is not tax, legal, or audit advice.** It is a product concept seeking professional challenge. LedgerLens must not claim that its output is an audit opinion, statutory financial statements, or tax filing advice unless a suitably qualified professional has reviewed and approved the relevant process.

---

## 1. The problem LedgerLens is meant to solve

Many small businesses do keep records, but not in a conventional accounting system. Their records are scattered across:

- sales books and stock cards;
- paper receipts, supplier invoices, POS slips, and bank alerts;
- screenshots sent by WhatsApp;
- informal notes, voice messages, and memory;
- different shops, sales staff, and an owner who is not always physically present.

This is not a lack of business activity or even necessarily a lack of record-keeping. It is a lack of **structured, connected, verifiable records**. The owner cannot easily see the full picture; the auditor later has to reconstruct it manually in books and spreadsheets; and errors in labels, stock, cash, credit, or payment status become expensive to correct.

LedgerLens is intended to turn the normal ways people already record activity into a continuously updated, structured record-keeping system.

### The core promise

> Capture an activity once—by photo, image, PDF, screenshot, text, quick selection, or voice—and LedgerLens classifies it, places it in the appropriate records, updates every connected balance, preserves the original proof, and asks focused correction questions where needed.

The system must not become a repository of uploads that the business owner must later organise. It should do the structuring work immediately and show what remains unclear.

---

## 2. The product in one practical example: Mama Oshodi

Mama owns multiple food-item shops. Her shops sell items such as spaghetti, Indomie, flour, sugar, butter, margarine, spread, and wheat. Products have different brands, weights, prices, and units, such as cartons, sacks, packs, and pieces.

Today, a sales girl may use:

- a stock card for each item, recording goods received and goods sold;
- a sales book recording each sale and its value;
- separate columns for cash, POS, credit, and credit repayment;
- POS slips, bank transaction evidence, receipts, and an expense book;
- manual carry-forward balances for customers who collected goods on credit.

An audit requires comparing the stock cards, sales book, receipts, POS records, bank transactions, cash deposits, credit records, and expenses. The auditor then re-enters reconciled information into a spreadsheet for reporting or tax work.

### What LedgerLens should do instead

The sales girl can record a sale in the manner that is easiest at that moment:

- select products and quantities during a sale;
- speak a fast summary;
- type a quick note;
- upload a photo of a sales-book page at the end of the day;
- upload a POS slip, bank alert, receipt, supplier invoice, screenshot, or PDF;
- photograph stock cards or an expense book whenever she is free.

LedgerLens reads and structures the record. A sale of 20 cartons of a named spaghetti brand, for a stated value, paid by cash or POS, becomes a connected set of updates:

- the sale is added to the sales record;
- the relevant product and shop stock reduce;
- the relevant payment route is updated;
- the supporting document is attached to the entry;
- the day, shop, staff member, product, quantity, price, and evidence are available to the owner and auditor;
- any ambiguity, such as an unreadable unit or unclear payment method, becomes a targeted correction request.

The owner sees the records from her phone, asks questions on a specific entry, and receives the sales girl’s explanation or corrected evidence in the same thread. She does not need to visit the shop merely to reconstruct the day.

---

## 3. The intended user types

### 3.1 Multi-shop owner / proprietor

Examples: Mama Oshodi, pharmacy owner, wholesaler, provisions-store owner, boutique owner, food retailer.

Needs:

- remote visibility across shops and staff;
- product, stock, sales, cash, POS, transfer, credit, expense, and bank visibility;
- a way to review evidence and request clarification without physically visiting a shop;
- prevention or early discovery of recording mistakes, stock differences, missing deposits, and unresolved credits;
- usable reports for decisions, accountants, auditors, lenders, and tax preparation.

### 3.2 Sales girl, cashier, shop manager, or field recorder

Needs:

- an extremely fast way to record work without accounting training;
- support for photos, screenshots, documents, voice, text, and simple item selection;
- the ability to record entries immediately or batch-upload paper records later;
- focused clarification requests rather than being told to redo an entire day’s records;
- clear visibility into what has been recorded, what is awaiting evidence, and what needs a response.

### 3.3 Solo founder

Examples: designer, consultant, creative, freelancer, small online seller, one-person service business.

Needs:

- fast capture of revenue, business purchases, subscriptions, transport, client payments, invoices, and personal withdrawals;
- structured records without having to become a bookkeeper;
- separation of business money from personal money;
- cash-flow, profit, spending, customer, and project information for everyday decisions;
- evidence-ready books for an accountant at month-end.

### 3.4 Startup founder

Examples: founder running a small but growing technology, logistics, services, trading, or operations business.

Needs:

- the solo founder’s capture simplicity, plus multiple team members and approval needs;
- revenue, supplier, expense, project/job, customer, and bank visibility;
- founder contributions, founder withdrawals, employee expenses, and business liabilities kept distinct;
- reliable management accounts and an accountant-ready monthly close.

### 3.5 Personal user

Needs:

- simple capture of income, spending, transfers, debts, recurring bills, and savings decisions;
- a personal—not business-accounting—interface;
- clear spending patterns and reminders;
- the ability to distinguish personal spending from a side business where required.

### 3.6 Accountant, auditor, or forensic accountant

Needs:

- evidence connected to each transaction;
- clear source, entry, correction, and approval history;
- exception queues that identify mismatches rather than requiring manual reconstruction of everything;
- exportable and reviewable records by business, shop, product, counterparty, period, and account;
- controlled adjusting entries, period-close support, workpapers, and report exports.

---

## 4. The records LedgerLens must maintain

The interface should use plain language for the business owner, while the accounting engine maintains correct relationships underneath.

### 4.1 Sales and stock

- Product catalogue: product name, brand, size/weight, unit, SKU/alias, selling price history, purchase cost history, and shop availability.
- Goods received: supplier, source shop, quantity, cost, date, proof, and destination shop.
- Sales: each product line, quantity, selling price, shop, staff member, customer if relevant, payment route, date, and proof.
- Stock movements: purchase/receipt, sale, return, wastage, physical-count adjustment, and inter-shop transfer.
- Physical stock counts: actual quantity, date, recorder, evidence, expected quantity, variance, explanation, and approval.

### 4.2 Payment routes and cash control

LedgerLens must distinguish the following. They are not interchangeable:

- **Cash collected:** physical money received at the shop.
- **Cash float:** approved money intentionally left at the shop for change or immediate operational spending.
- **Cash deposited to company bank account:** cash physically taken to bank and evidenced.
- **POS payment:** customer paid through a card/POS terminal. The customer has paid, but the amount may settle into the business bank account later and may have fees or reversals.
- **Bank transfer:** customer claims or provides evidence of transfer; it may be confirmed only when it appears in the relevant account.
- **Company money received into owner’s personal account:** business money received through Mama’s or a founder’s personal account. It must be visible and linked, not silently treated as unexplained revenue or forgotten.
- **Owner withdrawal/draw:** money the owner takes from the business. It must not be presented as a normal operating expense.
- **Business money paid personally by the owner:** an owner contribution or business liability to the owner, depending on the accounting policy.

The product should track both the payment event and the later bank/POS settlement or deposit where applicable.

### 4.3 Customer credit and payment-pending sales

This is a critical distinction for the product.

**Actual customer credit:** a customer takes goods and genuinely owes the business. The customer record should show the first credit date, each additional credit sale, partial payments, allocation of each payment, balance after each payment, final settlement date, and current balance.

**Payment pending confirmation:** a customer receives goods because they say they paid by transfer or POS, but the business has not yet confirmed the money. This is not automatically customer credit. It should be a separate status with the payment evidence, expected amount, expected settlement route, confirmation date, and follow-up alert if it remains unmatched.

In owner-facing language, the product may show “Customers owing” and “Payments awaiting confirmation.” Under the accounting system, customer credit is accounts receivable; supplier debts are accounts payable. These should never be mixed.

### 4.4 Expenses, purchases, and business categories

Examples include goods purchased for resale, transport, fuel, electricity, environmental levies, rent, repairs, staff costs, subscriptions, and other operating expenses.

LedgerLens should collect the source evidence, structured category, payment route, counterparty, business/shop, date, and relevant product or service link. It must distinguish inventory purchases from operating expenses so that profit is not distorted.

---

## 5. End-to-end workflows

### 5.1 A sale recorded at the time of trade

1. Sales girl selects or speaks the goods, quantities, price, and payment method.
2. LedgerLens identifies the products and shop, calculates the total, and updates sales and stock.
3. If payment is cash, POS, confirmed transfer, credit, or payment pending, it updates the relevant payment record.
4. A receipt, POS slip, screenshot, or later sales-book photo is attached as evidence.
5. The owner can view the entry immediately and request clarification if needed.

### 5.2 A day-end paper-record upload

1. Sales girl photographs a sales-book page, stock card, or expense book.
2. LedgerLens reads the rows and creates structured entries, matching them to entries already recorded where possible.
3. It highlights duplicates, missing payment types, unreadable figures, product-name uncertainty, stock mismatches, or totals that do not add up.
4. The sales girl resolves only the flagged parts. The original page remains attached permanently.
5. Owner and auditor see the updated daily records and any remaining exceptions.

### 5.3 Customer credit and partial repayment

1. Staff records an actual credit sale against the customer.
2. LedgerLens records goods, value, date, shop, due date if known, and evidence.
3. The customer later pays a partial amount by cash, POS, transfer, or another route.
4. LedgerLens links that payment to the specific outstanding credit, updates the balance, and preserves the payment evidence.
5. When fully paid, the customer’s entry shows the complete history rather than overwriting the original credit.

### 5.4 POS and transfer confirmation

1. A sale is recorded as POS or transfer payment, with slip/screenshot/reference where available.
2. LedgerLens expects settlement into the specified company account or POS settlement route.
3. A bank screenshot, statement import, or manual confirmation matches the settlement to the underlying sale(s).
4. If payment does not appear, is short, is reversed, or cannot be matched, LedgerLens raises an exception for staff or owner review.

### 5.5 Cash deposited, cash held, or money sent to the owner

1. Staff records daily cash collected and cash paid out for approved expenses.
2. Staff records cash deposited to the business bank, the amount kept as cash float, or money sent to the owner.
3. LedgerLens shows expected cash by shop and compares it with periodic physical cash counts and deposits.
4. A difference is shown as a reconciliation issue—not an automatic accusation of theft—and requires explanation, evidence, and owner approval where appropriate.

### 5.6 Inter-shop transfer

1. Shop A records goods sent to Shop B with date, product, quantity, and evidence.
2. Shop B confirms receipt.
3. LedgerLens creates linked stock-out and stock-in movements, and flags anything sent but not confirmed received.
4. Transfers must not be treated as external sales or expenses unless there was an actual sale.

### 5.7 Auditor review and period close

1. Auditor opens a defined period and sees records, evidence, corrections, stock movements, payment routes, and exception queues.
2. Auditor checks stock against sales, customer credits against payments, POS/transfer amounts against bank settlement, cash against deposits/counts, and expenses against evidence.
3. Corrections are made as traceable adjustment entries; original records remain viewable.
4. The period is reviewed/closed according to agreed authority rules.
5. The auditor exports schedules and working data rather than retyping a reconstructed book into a spreadsheet.

---

## 6. Decisions and intelligence the product can produce

Once enough structured evidence exists, LedgerLens can provide useful decision support:

- sales by shop, product, brand, size, staff, and payment route;
- goods with highest revenue, highest gross profit, and highest margin—these are different measures;
- fast-moving and slow-moving stock;
- stock-out frequency and potential lost-sale signals;
- stock differences, wastage, and unexplained adjustments;
- credit ageing, repayment history, and outstanding customer balances;
- cash, POS, transfer, and bank settlement position;
- expenses by category, shop, product line, project, or period;
- business cash flow, owner withdrawals/contributions, and cash available;
- recurring expenses and unusually high/low items;
- data-quality and reconciliation status, so a user knows how much confidence to place in a report.

The product may infer demand from sales volume and stock-outs. It must not claim that it knows unmet demand unless the business also records stock-outs, customer requests, cancelled orders, or similar evidence.

---

## 7. What genuinely differentiates LedgerLens

Sales, inventory, POS, debt tracking, and analytics already exist in the market. LedgerLens is not differentiated merely because it contains those features.

Its potential differentiation is the **connected evidence-to-books workflow**:

1. **Natural capture becomes structured records immediately.** Paper books, images, receipts, screenshots, PDFs, typed notes, and spoken entries are not just stored; they become connected sales, stock, payment, expense, and credit records.
2. **One activity updates all affected records.** A sale does not live separately from stock, payment method, customer balance, evidence, and reports.
3. **It handles the messy middle.** Actual credit, pending transfer, POS settlement, cash float, cash-to-bank, personal-account receipt, partial repayment, and inter-shop movement are treated as distinct business realities.
4. **Evidence and clarification are inside the entry.** The owner can see the source document, ask a question, receive a reply, and retain the correction history without reconstructing the matter in WhatsApp or a notebook.
5. **It is designed for auditability from day one.** The product creates a review trail and exception list while transactions are happening, rather than asking an auditor to rebuild the story later.
6. **It learns the owner’s structure without forcing accounting language on staff.** The owner can define products, shops, preferred labels, categories, and payment routes; staff see simple business language.

This is a meaningful difference only if it is delivered reliably. If LedgerLens merely provides a standard POS, inventory count, and AI text extraction, it will be another competitor. Its defensible value is trustworthy conversion of informal operating evidence into records an owner and accountant can verify.

---

## 8. Product boundaries and non-negotiable safeguards

LedgerLens should be a record-keeping and accounting-support product. It should not imply that it holds customer funds, provides lending, moves money, or makes an audit conclusion.

Non-negotiable safeguards include:

- original evidence retained with access controls and export capability;
- no destructive editing: corrections retain the prior record and explanation;
- clear distinction between user-entered fact, AI extraction, suggested classification, and approved correction;
- role permissions by business and shop: owner, staff recorder, manager, accountant, auditor;
- no silent historical reclassification after a new rule is created;
- clear record of who entered, changed, approved, or reviewed an item;
- data-quality and unresolved-exception indicators on reports;
- secure handling of customer names, numbers, financial evidence, staff activity, and personal-account information;
- accessible export so the business is not trapped if it changes accountant or software.

---

## 9. Questions for the Nigerian forensic accountant to clarify

The most useful review is not “Is this a good app?” It is: **what conditions must be true for LedgerLens records to be reliable enough for management, accountants, audits, and tax preparation?**

### A. Accounting design

1. What minimum chart of accounts should LedgerLens provide for a Nigerian retailer, solo service founder, startup, and personal user?
2. Which owner-facing labels should be used so staff can operate correctly without accounting vocabulary?
3. Should the retail engine use perpetual inventory, periodic inventory, or a configurable approach? What is appropriate for this user segment?
4. Which inventory costing method should be used for interchangeable goods: weighted average, FIFO, or another approved method? How should changes be controlled?
5. How should the product account for stock purchases, stock returns, supplier discounts, wastage, damaged goods, expired food, stock counts, and stock write-offs?
6. What is the correct treatment of owner withdrawals, owner contributions, business expenses paid personally by the owner, and company revenue received into the owner’s personal account?
7. How should loans, loan principal, loan interest, advance payments, and deposits be represented?
8. What conditions must be met before the product can describe a report as a management account, accountant-reviewed report, tax-preparation schedule, or financial statement?

### B. Customer credit, supplier debts, and payment status

9. What exact business rules distinguish actual customer credit from an unconfirmed transfer/POS payment?
10. How should partial payment be allocated where a customer has several outstanding credit sales?
11. Should allocation default to oldest debt first, selected invoice/sale, or another rule—and when may staff override it?
12. What evidence is sufficient to mark a bank transfer, POS payment, or cash payment as confirmed?
13. How should a reversed POS payment, failed transfer, short settlement, bank charge, or unidentified bank inflow be handled?
14. What terminology should the user interface use for customers owing money and suppliers the business owes, while preserving correct accounting treatment underneath?
15. What credit-ageing intervals and escalation signals are meaningful for typical retail businesses?

### C. Cash, POS, bank, and reconciliation

16. What daily cash-up process would make expected cash versus physical cash meaningful?
17. How should the product record cash float, cash shortages/overages, cash deposited to bank, cash used for expenses, and cash sent to the owner?
18. Should POS transactions be initially recorded in a clearing/settlement account before they appear in the bank? How should fees and delayed settlement be treated?
19. What is the appropriate reconciliation workflow for cash, POS settlement, transfers, and bank accounts for a small multi-shop retailer?
20. What evidence, approvals, and thresholds should be required before a variance can be written off or adjusted?

### D. Evidence, corrections, and forensic usefulness

21. Which evidence types are adequate for each transaction type: receipt, POS slip, bank alert, supplier invoice, paper book, signature, stock count, screenshot, or other proof?
22. What provenance should LedgerLens preserve: original file, capture date, entry date, user, device, file hash, extracted text, correction history, and approval history?
23. Should the product ever permit deletion? If yes, what must remain as a deletion/audit record?
24. What correction process preserves accountability without making ordinary staff work too difficult?
25. What kinds of exception reports would most reduce audit time and expose likely errors or irregularities?
26. Which anomalies should be presented as neutral reconciliation questions rather than fraud alerts?
27. What records should be locked at month-end, and who may unlock or adjust a closed period?

### E. Multi-shop operations and staff controls

28. What controls are appropriate for shop-level sales staff, managers, owners, accountants, and external auditors?
29. Which actions need approval: stock adjustment, price override, credit sale, refund, post-period correction, cash variance, owner withdrawal, or inter-shop transfer?
30. What is the minimum evidence and acknowledgement required for stock sent from one shop and received at another?
31. How should LedgerLens report staff activity fairly without treating normal operational differences as misconduct?

### F. Nigerian tax, regulatory, and privacy review

32. Which records and retention periods should be supported for tax preparation under the business types LedgerLens will serve?
33. What data fields are required for VAT, withholding tax, PAYE, company tax, or other applicable schedules—and which should be optional because applicability varies?
34. What claims must LedgerLens avoid until an accountant or tax professional reviews each business’s position?
35. What privacy, consent, notification, access-control, and retention practices are necessary when the app stores customer credit details, phone numbers, receipts, bank evidence, and staff records?
36. When should the product require a professional accountant’s review before presenting a tax or formal-financial-report output?

### G. Viability and adoption

37. Which part of the workflow creates the greatest real-world accounting value: capture, stock control, payment reconciliation, credit history, owner oversight, or audit preparation?
38. What will staff realistically record at the point of sale, and what should be captured in a day-end batch without damaging reliability?
39. Which data errors are tolerable operationally, and which make reports unusable?
40. What onboarding information is essential before a retailer can receive trustworthy reports: opening stock, product list, historical credit, cash balance, bank balance, supplier/customer list, price history, or other data?
41. What would make an auditor or accounting practice willing to recommend or use LedgerLens repeatedly?
42. Which reports would a business owner actually pay for because they change daily decisions or reduce losses?

---

## 10. What a successful professional review should produce

At the end of the review, the accountant should ideally provide:

- an approved or revised accounting model for each user type;
- clear definitions for every payment, credit, cash, stock, and owner-money state;
- minimum evidence standards and exception rules;
- a recommended period-close and correction policy;
- the reports that are useful and the claims LedgerLens must not make;
- a viability view on whether the proposed daily workflows can produce sufficiently reliable records;
- a list of high-risk cases requiring product controls or professional review.

---

## 11. One-sentence product definition

> **LedgerLens turns the messy evidence of daily business activity into structured, connected, reviewable books—so owners can manage remotely, staff can record naturally, and accountants can verify rather than reconstruct.**

