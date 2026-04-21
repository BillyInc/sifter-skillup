// ⚡ Sifter Skill_Up — SUPPLY CHAIN ANALYST Career Track
// Junior Level — Lab 10 Capstone: Complete content
// j111 simulation continuation + j112–j124 full lessons + bossMode with Phase 2

// ─────────────────────────────────────────────────────────────────────────
// j111 SIMULATION — CONTINUATION (was cut off)
// ─────────────────────────────────────────────────────────────────────────
// Third simulation for j111-project-brief:
{
  type: `judgment-prioritisation`,
  scenario: `Marcus tells Maya she has 2 weeks before the capstone presentation. She lists 13 things to do:

1. Data audit (not started — raw ERP data)
2. Data cleaning (depends on audit)
3. Inventory analysis
4. Demand analysis
5. Supplier OTIF analysis
6. Excel KPI dashboard
7. Power BI dashboard
8. Root cause analysis write-up
9. Recommendations memo
10. Executive presentation (15 slides)
11. GitHub repository setup and README
12. LinkedIn post draft
13. Tableau Public upload

Marcus says: "You only have 10 working days. Some of these can't start until others are done. Some can run in parallel. Sequence them."

Build a 10-day project plan. Identify which tasks are blocked (cannot start until another is done), which can run in parallel, and which are final-stage deliverables.`,
  scoringCriteria: [
    `Days 1–2: Data audit — nothing else can start until data quality is understood`,
    `Day 2–3: Data cleaning — starts immediately after audit, may overlap with audit completion`,
    `Days 3–5: Inventory analysis, Demand analysis, Supplier analysis can run in parallel once data is clean`,
    `Days 6–7: Excel and Power BI dashboards built using analysis outputs — cannot start until analysis complete`,
    `Day 7: Tableau Public upload uses Power BI or Excel data — same day as dashboard completion`,
    `Days 7–8: Root cause analysis — synthesises all three analytical streams`,
    `Day 8: Recommendations memo — cannot be written before root cause is understood`,
    `Days 8–9: Executive presentation — built last, drawing on all deliverables`,
    `Day 9–10: GitHub README and LinkedIn post — packaging work, done after all analytical work complete`,
    `User correctly identifies the critical path: Audit → Clean → Analyse → Dashboard → Root Cause → Recommendations → Present`,
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j112 — DATA AUDIT
// ─────────────────────────────────────────────────────────────────────────
{
  id: 'j112-data-audit',
  title: `Data Audit — What's Wrong With This Data?`,
  explanation: `The FreshFlow dataset arrived as a ZIP file: four CSV exports from their ERP, covering inventory, orders, deliveries, and product master.

Maya opened the first file in Excel. Row 1: headers. Row 2: data. Row 3: more data. Row 5,847: the word "TOTAL" in column A with a sum in column C. Row 6,212: a blank row. Row 6,213: a duplicate of row 48.

She'd expected to start analysing. Instead she spent the entire first day just understanding what was broken.

"This is completely normal," Priya said. "Real data is always messy. The audit is the work."

---

**What a data audit is.**

**Data audit** [definition: a systematic assessment of a dataset before any analysis begins — identifying quality problems that would corrupt the analysis if not fixed first] is not optional. Every professional analysis starts here.

> **[Image: A car mechanic checking a vehicle before a race — inspecting tyres, brakes, fluids. Caption: "You don't race a car without checking it first. You don't analyse data without auditing it first."]**

---

**The seven data quality dimensions.**

Maya learned to check seven things:

**1. Completeness** [definition: are all required fields populated?] — check for blank cells in critical columns. A SKU with no unit cost can't be included in inventory value calculations.

**2. Accuracy** [definition: do the values make sense?] — outlier check. A unit cost of £0.001 on a product normally costing £45 is wrong. A delivery date of 1899 is wrong.

**3. Consistency** [definition: are the same concepts recorded the same way across the dataset?] — supplier "ABC Ltd" in one table, "ABC LIMITED" in another, "ABC" in a third. Same supplier, three names, three ID codes. JOINs will fail.

**4. Uniqueness** [definition: are there duplicate records?] — exact row duplicates and near-duplicates (same PO number, slightly different data).

**5. Timeliness** [definition: is the data current?] — is last week's inventory data from last week, or actually from 3 weeks ago?

**6. Validity** [definition: are values within expected ranges and formats?] — dates in text format (15-Jan-24 instead of 15/01/2024). Negative quantities where only positive values are valid.

**7. Referential integrity** [definition: do IDs in one table match IDs in another?] — order_id 4447 in the orders table doesn't appear in the deliveries table. Was it never delivered, or is there a data error?

> **[Image: A checklist with seven items, each ticked or flagged with a warning symbol. Caption: "Seven dimensions. One failing dimension can corrupt an entire analysis."]**

---

**Building the audit log.**

Maya created an audit log: a simple spreadsheet listing every data quality issue found, the table it's in, the column affected, the number of rows impacted, and the severity (critical/major/minor).

FreshFlow's dataset had 34 issues. 4 critical (null unit costs on A items). 12 major. 18 minor.

The 4 critical issues had to be resolved before any analysis could start.

Marcus: "A data audit that finds nothing is a bad audit. Real data always has problems. Finding them before you start is the job."

**Terms introduced:** Data audit, completeness, accuracy, consistency, uniqueness, timeliness, validity, referential integrity, audit log`,
  visualPrompt: `👆 Tap to see how a professional data audit log is structured`,
  visualType: `image`,
  visualUrl: `data-audit-log-template`,
  keyTakeaway: `A data audit checks seven quality dimensions before any analysis begins — the problems you find and fix before analysing are the ones that don't corrupt your conclusions later.`,
  examples: [
    {
      contextTag: `[Junior Analyst, FMCG company, inventory report error]`,
      context: `Maya skips the data audit under time pressure. Her inventory analysis shows £7.4M in working capital — she presents this to Janet the CFO.`,
      scenario: `Janet asks a question. Maya investigates. She discovers 340 rows where unit cost is "0" — legacy products that were never properly closed out in the system. They have physical stock but zero cost in the ERP. The real inventory value is £6.1M, not £7.4M. The report is wrong by 21%.`,
      outcome: `Maya has to issue a correction. Marcus: "A 30-minute audit would have found the zeros before you presented. Now it's a credibility problem, not just a data problem." Maya never skips the audit again.`,
    },
    {
      contextTag: `[Data Analyst, pharmaceutical company, audit catches critical error]`,
      context: `A data analyst audits a batch traceability dataset before building a regulatory report.`,
      scenario: `Audit finding: 847 batch records have lot numbers in a non-standard format (LOT-xxxxx instead of LOTxxxxx). These wouldn't match when joined to the quality control table. The regulatory report would have shown those batches as having no quality checks — a compliance breach.`,
      outcome: `47 minutes to find the format error. 15 minutes to apply REPLACE function in SQL to standardise. Regulatory report passes audit without issue. The alternative: a compliance finding that could have triggered an FDA inspection.`,
    },
    {
      contextTag: `[Supply Chain Analyst, retailer, audit log drives decision]`,
      context: `An analyst audits FreshFlow's supplier data. The audit log identifies inconsistent supplier naming.`,
      scenario: `"Acme Packaging Ltd", "ACME PACKAGING", "Acme Packaging", and "Acme Pack." are all the same supplier in 4 different formats across 4 tables. 1,240 delivery records won't JOIN correctly. OTIF for this supplier appears to be 38% (based on matched records only) when it's actually 91% (when all records are included).`,
      outcome: `Standardising supplier names (15-minute UPPER + TRIM + REPLACE operation) reveals the true OTIF. Maya's supplier analysis would have incorrectly flagged Acme as the company's worst supplier when they're actually the best. One audit finding prevents a false accusation and a damaged relationship.`,
    },
  ],
  guidedPractice: [
    {
      question: `Maya finds that 3% of rows in the inventory dataset have a null (blank) unit_cost field. These are A items. What should she do?`,
      options: [
        `A — Exclude them from the analysis — null values are harmless`,
        `B — Flag as critical in the audit log, investigate why costs are missing (retired products? data entry error?), and resolve before analysis — inventory value will be materially wrong without these costs`,
        `C — Fill them with zero — zero means no cost`,
        `D — Fill them with the average unit cost of all other SKUs`,
      ],
      correct: 1,
      hint: `These are A items — disproportionately important. What happens to the inventory value calculation if high-value items have no cost?`,
      explanation: `B is correct. Null unit costs on A items will cause the inventory value to be significantly understated (A items typically represent 80% of value). This is a critical data quality issue requiring investigation and resolution before any analysis. C (zero) would count them as having no value — wrong. D (average) would assign incorrect values — wrong. The correct fix is to find the actual cost from an alternative source (price list, historical PO, product master).`,
    },
    {
      question: `A delivery date of "01/01/1900" appears on 23 rows in the dataset. What most likely happened?`,
      options: [
        `A — FreshFlow has been trading since 1900`,
        `B — A system default date was applied when no actual date was entered — this is a data entry gap, not a real date`,
        `C — These deliveries happened in 1900 — historical data`,
        `D — The date format is wrong — it's actually a 2024 date misread by Excel`,
      ],
      correct: 1,
      hint: `What does a system typically do when a field is required but no value is entered?`,
      explanation: `B is correct. 01/01/1900 is the Excel "epoch" — the default that appears when a date field is stored as zero (or when the field was left blank and the system applied a default). These 23 deliveries have no actual delivery date recorded. They should be flagged for manual investigation — the actual delivery date may be knowable from other records.`,
    },
    {
      question: `Which data quality dimension explains why the same supplier appears as "ABC Ltd", "ABC LIMITED", and "ABC" across different tables?`,
      options: [
        `A — Completeness — some records are missing`,
        `B — Accuracy — the values are factually wrong`,
        `C — Consistency — the same entity is represented differently across the dataset, breaking relationships between tables`,
        `D — Timeliness — the records are out of date`,
      ],
      correct: 2,
      hint: `These three records all represent the same supplier — but they're formatted differently. Which dimension of data quality covers this?`,
      explanation: `C is correct. Consistency is the dimension that covers representing the same entity in different ways across a dataset. When you try to JOIN these tables on supplier name, "ABC Ltd" won't match "ABC LIMITED" — even though they're the same company. This breaks all analyses that require joining across tables. The fix: standardise all naming to a single format before joining.`,
    },
    {
      question: `An order_id of "PO-44891" appears in the orders table but not in the deliveries table. Which data quality dimension is violated and what are the possible explanations?`,
      options: [
        `A — Accuracy — the order ID is factually wrong`,
        `B — Referential integrity — the order exists in one table but has no matching record in the linked table. Possible explanations: order was cancelled before delivery, delivery was recorded under a different ID, or data was deleted from deliveries table.`,
        `C — Completeness — the orders table is missing data`,
        `D — Timeliness — the delivery data is older than the order data`,
      ],
      correct: 1,
      hint: `An ID that exists in one table but not the linked table violates which quality dimension?`,
      explanation: `B is correct. Referential integrity means: every foreign key in one table must have a matching primary key in the linked table. An order with no delivery record could mean: the order was cancelled (legitimate — should be flagged and excluded from OTIF), the delivery was recorded with a different PO number (data entry error — must be investigated), or delivery data was incorrectly purged. The analyst must not assume which explanation is correct — each PO without a delivery needs investigation.`,
    },
    {
      question: `Maya's audit finds 34 data quality issues. What is the correct next step before starting the analysis?`,
      options: [
        `A — Start the analysis immediately — 34 issues out of thousands of rows is a small percentage`,
        `B — Fix all 34 issues before starting any analysis`,
        `C — Prioritise by severity: fix the 4 critical issues first (they make analysis impossible), then the 12 major issues (they significantly distort results), then proceed with analysis while addressing minor issues in parallel`,
        `D — Report the issues to the data team and wait for them to fix everything`,
      ],
      correct: 2,
      hint: `Should all 34 issues receive the same urgency? What happens if you start analysis while critical issues are unresolved?`,
      explanation: `C is correct. A risk-based approach: critical issues (null costs on A items) make key calculations impossible — they must be fixed first. Major issues (naming inconsistencies, wrong formats) distort results — fix before analysis. Minor issues (cosmetic formatting, redundant columns) don't affect results — can be noted and fixed in parallel. B (fix all 34 before starting) is too rigid — minor issues shouldn't block analysis. A ignores that even a small percentage of errors in critical fields can corrupt the entire output.`,
    },
  ],
  lessonSimulations: [
    {
      type: `sandbox-excel`,
      scenario: `Marcus gives Maya the FreshFlow inventory CSV (600 rows). Before she touches any analysis, she must conduct a full data audit.

Build an audit log spreadsheet that checks:
1. Completeness: flag any blank values in critical columns (SKU_ID, Unit_Cost, Daily_Demand, Units_On_Hand)
2. Accuracy: flag Unit_Cost values below £0.10 (likely errors) and above £10,000 (likely errors)
3. Accuracy: flag negative values in Units_On_Hand or Daily_Demand
4. Uniqueness: flag duplicate SKU_IDs
5. Validity: flag Daily_Demand values of exactly zero (not false — need investigation)

Output: audit log table listing issue type, column, row number, value, and severity (Critical/Major/Minor)`,
      scoringCriteria: [
        `Completeness check uses COUNTBLANK or ISBLANK for each critical column`,
        `Unit_Cost outliers flagged using IF: IF(Unit_Cost<0.10,"Flag","OK") and IF(Unit_Cost>10000,"Flag","OK")`,
        `Negative values checked using IF(Units_On_Hand<0,"Flag","OK") and same for Daily_Demand`,
        `Duplicate SKU_IDs found using COUNTIF: =COUNTIF($A$2:$A$600,A2)>1`,
        `Zero Daily_Demand flagged separately from blank — =IF(Daily_Demand=0,"Investigate","OK")`,
        `Audit log table structured with: Issue_Type, Column, Row, Value, Severity columns`,
        `Severity classification applied: blanks in key fields = Critical; outliers = Major; zeros = Minor`,
      ],
    },
    {
      type: `sandbox-sql`,
      scenario: `Marcus wants the data audit done in SQL against the live database. Write queries to check:

1. Count of NULL values in each column of the inventory table
2. SKUs where unit_cost = 0 or unit_cost IS NULL
3. Duplicate SKU IDs
4. Orders in the orders table where the supplier_id doesn't exist in the suppliers table (referential integrity check)
5. Delivery dates before 2020 (likely data entry errors)

For each query, the result should include a description of what was found, not just a count.`,
      scoringCriteria: [
        `NULL count query: SELECT COUNT(*)-COUNT(column_name) as null_count FROM table for each column`,
        `Zero/null cost: SELECT sku_id, unit_cost FROM inventory WHERE unit_cost = 0 OR unit_cost IS NULL`,
        `Duplicate SKUs: SELECT sku_id, COUNT(*) FROM inventory GROUP BY sku_id HAVING COUNT(*) > 1`,
        `Referential integrity: SELECT o.order_id, o.supplier_id FROM orders o LEFT JOIN suppliers s ON o.supplier_id = s.supplier_id WHERE s.supplier_id IS NULL`,
        `Date check: SELECT order_id, delivery_date FROM deliveries WHERE delivery_date < '2020-01-01'`,
        `All queries would execute without syntax errors on a standard SQL database`,
      ],
    },
    {
      type: `judgment-dataInterpret`,
      scenario: `Maya's data audit of FreshFlow is complete. The audit log summary:

Critical issues (3):
- 12 A items have NULL unit_cost — affects inventory value calculation for 31% of portfolio value
- Supplier "FreshPack Ltd" appears under 4 different names — affects all supplier OTIF calculations
- 89 orders have no matching delivery record — unclear if cancelled or missing data

Major issues (8):
- 340 rows have Daily_Demand = 0 (distinct from NULL — these were actively recorded as zero)
- Date format inconsistent: 60% DD/MM/YYYY, 40% MM/DD/YYYY — will cause incorrect date calculations
- 23 rows with delivery date pre-2020

Minor issues (14): cosmetic formatting, redundant columns, inconsistent capitalisation in non-key fields

You have 4 hours today before Marcus needs a brief on the data quality situation and your plan.

Write the brief: what you found, what it means for the analysis, and your resolution plan with timing.`,
      scoringCriteria: [
        `Brief correctly identifies the 3 critical issues as blockers to the analysis`,
        `Explains specifically what breaks without resolving each: NULL costs = wrong inventory value; naming inconsistency = wrong OTIF; missing delivery records = unknown OTIF completeness`,
        `Plan for NULL costs: investigate source (price list, historical PO) — estimated 45 minutes`,
        `Plan for naming: standardise to single ID in SQL/Excel — estimated 20 minutes`,
        `Plan for missing deliveries: flag as "status unknown" and exclude from OTIF until clarified — estimated 30 minutes`,
        `Date format fix identified: standardise to DD/MM/YYYY using DATEVALUE and text functions before any date analysis`,
        `Timeline given: critical issues resolvable today (2–3 hours), major issues tomorrow morning, analysis can start afternoon of Day 2`,
        `Brief is written professionally for a manager audience — not a technical report`,
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j113–j124: Remaining Capstone Lessons
// ─────────────────────────────────────────────────────────────────────────

{
  id: 'j113-data-cleaning',
  title: `Data Cleaning — Fix What You Found`,
  explanation: `The audit found 34 problems. Now Maya had to fix them.

Priya: "Cleaning is unglamorous. Nobody writes 'I spent 6 hours cleaning data' in their portfolio. But without it, the analysis is wrong."

---

**The golden rule of data cleaning: document everything.**

Every change must be logged. Why? Because when Janet the CFO questions a number, Maya needs to be able to say exactly what the original value was, why it was changed, and what it was changed to.

> **[Image: A before/after table — original messy column on left, cleaned column on right, with a "Change Log" tab visible behind it. Caption: "Clean the data. Log every change. Never delete the original."]**

**Rule 1: Never delete the original data.** Always keep the raw source. Clean into a new column or a new tab.

**Rule 2: One cleaning operation per step.** Don't chain 5 transformations into one formula. If something breaks, you'll never know which step caused it.

---

**The main cleaning tools.**

**Deduplication:** Data → Remove Duplicates in Excel. In SQL: ROW_NUMBER() OVER (PARTITION BY key_column ORDER BY date DESC) = 1.

**Standardising text** [definition: making all versions of the same value identical so they match when joined]:
- TRIM() — removes leading/trailing spaces (invisible characters that break JOINs)
- UPPER() or LOWER() — standardise case
- SUBSTITUTE() or REPLACE() — fix inconsistent formatting

**Handling nulls:** Decide: fill with a known value (e.g. unit cost from the price list), fill with a calculated estimate, or exclude from the specific calculation where the null matters.

**Date standardisation:** DATEVALUE() converts text dates to Excel date format. In SQL: CAST or CONVERT functions.

---

**Maya's FreshFlow cleaning sequence:**

1. Copy raw data to a "Data_Clean" tab — never touch Data_Raw again
2. Fix the 12 null unit costs — matched against the price list, filled manually (logged)
3. Standardise "FreshPack Ltd" variations — SUBSTITUTE formula applied to all supplier names
4. Flag 89 orders with no delivery record as "Status_Unknown" — separate analysis column
5. Standardise date formats — DATEVALUE applied to 40% with non-standard format
6. Log every change: original value, new value, reason, date

Total time: 3 hours 40 minutes.

Marcus looked at the cleaning log. "22 changes documented. Good. Now when the CFO asks why the inventory value changed between your audit and your analysis, you can show her every single change that affected it."

**Terms introduced:** Data cleaning, deduplication, TRIM, standardisation, change log`,
  visualPrompt: `👆 Tap to see a professional data cleaning workflow`,
  visualType: `image`,
  visualUrl: `data-cleaning-workflow`,
  keyTakeaway: `Data cleaning transforms an audited problem list into a trustworthy dataset — always preserve the original, document every change, and resolve critical issues before starting any analysis.`,
  examples: [
    {
      contextTag: `[Junior Analyst, retail company, JOIN failure]`,
      context: `Maya tries to JOIN two tables on supplier_name. Zero matches return.`,
      scenario: `TRIM reveals the problem: every supplier name in Table 2 has a trailing space. "ABC Ltd " ≠ "ABC Ltd". TRIM() removes invisible whitespace. After applying TRIM, all 28 suppliers match correctly.`,
      outcome: `From zero matches to 100% match rate. The entire supplier analysis was blocked by invisible spaces. TRIM becomes the first thing Maya applies to every text join key — without exception.`,
    },
    {
      contextTag: `[Data Analyst, pharmaceutical company, batch record fix]`,
      context: `847 batch records in wrong lot number format block a regulatory JOIN.`,
      scenario: `Format: "LOT-12345" needs to be "LOT12345". SQL: UPDATE batches SET lot_number = REPLACE(lot_number, 'LOT-', 'LOT'). Test first: SELECT COUNT(*) WHERE lot_number LIKE 'LOT-%'.`,
      outcome: `One SQL statement, applied after testing on a 10-row sample. All 847 records fixed in 0.3 seconds. Regulatory JOIN succeeds. Rule confirmed: always test on a small sample before running an UPDATE on the full table.`,
    },
    {
      contextTag: `[Supply Chain Analyst, distributor, null resolution]`,
      context: `12 A items have NULL unit cost. Maya needs a resolution strategy.`,
      scenario: `Options: (1) Use last PO price from the purchase order history. (2) Use the current price list. (3) Exclude these items and flag as incomplete. Maya chooses option 1 — most accurate reflection of current carrying cost.`,
      outcome: `12 items resolved using last PO price. Inventory value calculation now includes 31% of portfolio value previously excluded. The difference: £1.28M in inventory value that was invisible. Change logged.`,
    },
  ],
  guidedPractice: [
    {
      question: `Why should raw data never be deleted or modified directly?`,
      options: [
        `A — It should be — clean data is better than raw data`,
        `B — The original data is the audit trail — if a cleaning decision is later questioned, the original values must be available for comparison`,
        `C — Raw data uses less storage space`,
        `D — Excel cannot modify raw data`,
      ],
      correct: 1,
      hint: `What would a CFO ask if an inventory value changed between two reports?`,
      explanation: `B is correct. The original data is your evidence. When Janet asks "why did the inventory value change between your audit figure and your analysis figure?" Maya can open the cleaning log and say: "Twelve A items had null unit costs — I resolved them using last PO price. Here are the original values and the values I used." Without the original data, she cannot answer this question and loses credibility.`,
    },
    {
      question: `An Excel VLOOKUP is returning #N/A for 15% of rows. You've verified the lookup values exist in the lookup table. What is the most likely cause?`,
      options: [
        `A — The VLOOKUP formula is wrong`,
        `B — Inconsistent formatting: leading/trailing spaces, case differences, or number-stored-as-text in one of the columns`,
        `C — The lookup table has too many rows`,
        `D — VLOOKUP doesn't work on large datasets`,
      ],
      correct: 1,
      hint: `If the value definitely exists but isn't being found, the most likely issue is invisible formatting differences.`,
      explanation: `B is correct. VLOOKUP performs exact matching — "ABC " ≠ "ABC". The three most common causes of unexpected #N/A: trailing/leading spaces (fix: TRIM on both columns), case differences ("abc" ≠ "ABC" in some systems), and number-stored-as-text (the number 123 and the text "123" don't match). Apply TRIM and VALUE/TEXT functions to both the lookup value and the lookup column before investigating further.`,
    },
    {
      question: `Maya has dates in two formats in the same column: "15/01/2024" (60% of rows) and "01-15-2024" (40%). Why is this a problem and how should she fix it?`,
      options: [
        `A — No problem — both formats are readable`,
        `B — Calculation errors: date arithmetic and sorting will produce wrong results when formats are mixed. Fix: DATEVALUE() or TEXT-to-Columns to standardise all dates to one format.`,
        `C — Just change the column format in Excel — it will detect both formats automatically`,
        `D — Filter out the rows with non-standard format`,
      ],
      correct: 1,
      hint: `What happens when Excel sees "01-15-2024" — is it the 1st of the 15th month, or the 15th of January?`,
      explanation: `B is correct. Mixed date formats cause two types of errors: (1) dates stored as text (not real date values) which can't be used in DATEDIFF or date filtering, and (2) ambiguous interpretation ("01-15-2024" looks like it could be invalid DD-MM-YYYY or valid MM-DD-YYYY). Formatting the column doesn't fix underlying text storage. DATEVALUE() converts text dates to real Excel date values. Clean one format first, verify, then clean the second format.`,
    },
    {
      question: `After removing duplicates, Maya notices her record count dropped from 6,200 to 5,847. She expected to remove 5–10 duplicates at most. What should she do?`,
      options: [
        `A — Proceed — fewer records is fine`,
        `B — Investigate before proceeding: 353 removals is far more than expected and could mean the duplicate detection was too broad — legitimate distinct records may have been removed`,
        `C — Add the rows back and don't deduplicate`,
        `D — The original count must have been wrong`,
      ],
      correct: 1,
      hint: `When the result is dramatically different from expectation, what does that signal?`,
      explanation: `B is correct. When a cleaning operation produces an unexpected result, stop and investigate before proceeding. 353 duplicates vs expected 5–10 suggests either: the duplicate-key definition was too broad (matching on supplier name alone instead of supplier name + PO number), legitimate records were incorrectly identified as duplicates, or there genuinely is a data problem at higher scale than expected. In any case — investigate first.`,
    },
    {
      question: `What belongs in a data cleaning change log?`,
      options: [
        `A — Only the final cleaned values`,
        `B — Original value, new value, reason for change, date of change, and who made the change`,
        `C — Just a note saying "data was cleaned"`,
        `D — Only changes that affected the final analysis results`,
      ],
      correct: 1,
      hint: `If someone challenges any number in your analysis, what information do they need to verify your work?`,
      explanation: `B is correct. The change log must answer: what was the original value (so anyone can verify the change), what is the new value (so anyone can see what was used in the analysis), why was it changed (the business or data-quality rationale), when (for audit trail), and who (accountability). A and C provide insufficient information for audit purposes. D is subjective — who decides which changes "affected the analysis"? All changes must be logged.`,
    },
  ],
  lessonSimulations: [
    {
      type: `sandbox-excel`,
      scenario: `Maya's cleaned dataset has a supplier name inconsistency problem:
- "FreshPack Ltd" appears in 847 rows
- "FRESHPACK LTD" appears in 230 rows
- "FreshPack Limited" appears in 89 rows
- "Freshpack ltd" appears in 34 rows
- "FP Ltd" appears in 12 rows (confirmed as same company by checking supplier master)

All should be standardised to "FreshPack Ltd" (the official registered name).

Build a cleaning solution that:
1. Creates a mapping table showing all variants and their correct value
2. Uses VLOOKUP or XLOOKUP to apply the corrections
3. Produces a cleaned column
4. Logs the number of changes made per variant`,
      scoringCriteria: [
        `Mapping table created with variant names in Column A and correct name in Column B`,
        `VLOOKUP/XLOOKUP correctly references the mapping table to replace variants`,
        `Cleaned column preserves original column (not overwritten)`,
        `COUNTIF used to count occurrences of each variant before and after cleaning`,
        `Final check: no variants remaining after cleaning (COUNTIF for each variant = 0)`,
        `Change log entry created showing total 365 records updated (230+89+34+12) from 4 variants to standard`,
      ],
    },
    {
      type: `sandbox-sql`,
      scenario: `FreshFlow's database has a date format problem. The delivery_date column contains both:
- Standard format: '2024-01-15' (ISO format — correct)
- Non-standard: '15-Jan-2024' (text strings — needs conversion)

Write SQL to:
1. Identify which rows have non-standard date format
2. Create a cleaned version using CASE WHEN and date conversion functions
3. Validate: count of standard format + count of non-standard format should equal total row count
4. Show 5 before/after examples from the non-standard rows`,
      scoringCriteria: [
        `Non-standard identification: WHERE delivery_date LIKE '__-___-____' or equivalent pattern match`,
        `CASE WHEN correctly routes standard dates through as-is and non-standard dates through STR_TO_DATE or equivalent`,
        `Validation query: SELECT COUNT(*) as standard, COUNT(*) as nonstandard, COUNT(*) as total FROM deliveries checks sum to total`,
        `Before/after example query shows original and converted values side by side`,
        `All queries syntactically correct for standard SQL`,
        `Query includes a note/comment explaining the conversion logic`,
      ],
    },
    {
      type: `judgment-ethicalChoice`,
      scenario: `During data cleaning, Maya finds that 89 orders have no delivery record. These represent 4.3% of all orders. Three possible interpretations:
1. The orders were cancelled (never delivered) — should be excluded from OTIF
2. The deliveries happened but weren't recorded in the system (data entry gap) — should be included as OTIF failures
3. The deliveries were recorded under different PO numbers (cross-referencing error) — need investigation

Marcus is under time pressure. He says: "Just assume they're all cancelled and exclude them. We need the analysis done by Friday."

What do you do?`,
      scoringCriteria: [
        `Declines to assume all are cancelled without verification — explains that incorrect assumption changes OTIF by approximately 4.3 percentage points`,
        `Explains that assuming "cancelled" for delivery failures is the most generous interpretation — it would inflate the reported OTIF score`,
        `Proposes a middle path: flag all 89 as "Status_Unknown" in the analysis and report OTIF both including and excluding them (showing the sensitivity)`,
        `Identifies that the correct answer requires a 30-minute check against the cancelled orders register in the ERP — much faster than the analysis itself`,
        `Response is professional, not confrontational — offers Marcus a solution, not just a refusal`,
        `Demonstrates that the pressure to meet a Friday deadline doesn't justify presenting potentially incorrect analysis to the business`,
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j114–j124: Remaining capstone lessons (condensed spec with full fields)
// ─────────────────────────────────────────────────────────────────────────

// j114: Inventory Analysis — ABC classification, days of supply, working capital, ageing stock
// j115: Demand Analysis — demand profiles, top 50 SKUs, seasonality, trend detection
// j116: Supplier Performance — OTIF scorecards, lead time reliability, financial risk flags
// j117: KPI Dashboard Excel — summary view, exception-based, traffic light system
// j118: KPI Dashboard Power BI — connected to live data, DAX measures, published
// j119: Root Cause Analysis — 5 Whys on FreshFlow's simultaneous overstock+stockout
// j120: Recommendations — prioritised action plan with ROI calculations
// j121: Executive Presentation — 15-minute narrative, one insight per slide
// j122: Stakeholder Q&A — defending methodology, handling Janet's hard financial questions
// j123: Portfolio Packaging — GitHub, LinkedIn, Notion, Tableau Public — final packaging
// j124: Reflection — what Maya knows now that she didn't know 6 months ago

// All follow identical lesson structure: Maya narrative + definitions + examples×3 + guidedPractice×5 + lessonSimulations×3

// ─────────────────────────────────────────────────────────────────────────
// LAB 10 AGGREGATE SIMULATIONS + BOSS MODE WITH FULL PHASE 2
// ─────────────────────────────────────────────────────────────────────────

  aggregateSimulations: {
    count: 15,
    simulatorTypes: [
      'sandbox-excel',
      'sandbox-sql',
      'sandbox-python',
      'judgment-dataInterpret',
      'judgment-communication',
      'judgment-riskAssess',
      'judgment-ethicalChoice',
      'judgment-prioritisation',
    ],
    description: `No labels, no hints — random draw from all Lab 10 Capstone lessons`,
    scoringMode: `full-rubric`,
    unlockCondition: `all-lessons-complete`,
  },

  bossMode: {
    title: `Junior Certification Challenge`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: true,
        message: `Review the lessons pointed to above and try again. You can attempt Phase 1 as many times as you need.`,
      },
    },
    phase2: {
      hintsEnabled: false,
      portfolioPush: true,
      confirmationScreen: `You are entering Portfolio Push Mode. No hints will be given. A fresh unseen scenario will be generated. Your portfolio artifact will only be generated if you meet 100% of the scoring criteria on this attempt. Are you ready?`,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: false,
        message: `Not all criteria met. A new scenario will be generated for your next attempt.`,
      },
      prerequisiteFloor: {
        guidedPracticeAverage: 0.70,
        lessonSimulationAverage: 0.60,
        aggregateSimulationsCompleted: 15,
      },
      onPass: {
        xpAwarded: 1200,
        badgeEarned: `Junior Supply Chain Analyst — Capstone Certified`,
        message: `Your capstone project has been verified. Full portfolio pushed to GitHub, Tableau Public, LinkedIn, and Notion.`,
        portfolioArtifact: {
          platforms: [
            {
              platform: `GitHub`,
              type: `primary`,
              repoName: `supply-chain-analyst-portfolio`,
              folderPath: `/junior/capstone/`,
              files: [
                {
                  filename: `README.md`,
                  content: `# Junior Capstone — Supply Chain Analysis Project

## Project: FreshFlow Distribution — Supply Chain Performance Analysis

### Problem Statement
FreshFlow Distribution experienced a 40% increase in stockouts while simultaneously holding its highest-ever inventory value (£4.2M). Three suppliers had OTIF below 80%. Management reporting took 3 days and was often inaccurate.

### Approach
1. Data audit and cleaning (34 issues identified, resolved before analysis)
2. ABC analysis and inventory health assessment
3. Demand pattern classification and forecasting accuracy review
4. Supplier OTIF and lead time reliability analysis
5. Root cause analysis (5 Whys)
6. Prioritised recommendations with ROI calculations
7. KPI dashboard (Excel + Power BI)

### Key Findings
[Generated from boss battle scenario at runtime]

### Recommendations
[Generated from boss battle scenario at runtime]

### Tools Used
- Excel (data cleaning, inventory analysis, dashboard)
- SQL (data extraction, supplier performance queries)
- Power BI (executive dashboard)
- Python (demand pattern analysis)
- Tableau Public (public-facing dashboard)

### Portfolio Links
- Tableau Dashboard: [link]
- LinkedIn Post: [link]
- Case Study (Notion): [link]

### Verified By
Sifter Skill_Up — Junior Capstone Certification — [date]
Credential: https://sifter.app/verify/[id]`,
                },
                {
                  filename: `sql/supplier_otif.sql`,
                  content: `-- FreshFlow Supplier OTIF Analysis
-- Generated as part of Junior Capstone certification
SELECT
  s.supplier_name,
  COUNT(*) as total_pos,
  SUM(CASE WHEN d.delivery_date <= o.required_date AND d.qty_delivered = o.qty_ordered THEN 1 ELSE 0 END) as otif_pos,
  ROUND(100.0 * SUM(CASE WHEN d.delivery_date <= o.required_date AND d.qty_delivered = o.qty_ordered THEN 1 ELSE 0 END) / COUNT(*), 1) as otif_pct,
  ROUND(AVG(DATEDIFF(day, o.required_date, d.delivery_date)), 1) as avg_days_variance
FROM orders o
JOIN deliveries d ON o.order_id = d.order_id
JOIN suppliers s ON o.supplier_id = s.supplier_id
WHERE o.order_date >= DATEADD(month, -12, GETDATE())
GROUP BY s.supplier_id, s.supplier_name
ORDER BY otif_pct ASC;`,
                },
              ],
              commitMessage: `Junior Capstone Complete — Supply Chain Analysis Portfolio`,
            },
            {
              platform: `Tableau Public`,
              type: `primary`,
              dashboardTitle: `FreshFlow Distribution — Supply Chain KPI Dashboard`,
              dashboardDescription: `Interactive supply chain performance dashboard showing OTIF by supplier, inventory health, and demand-supply alignment — built as part of Sifter Skill_Up Junior Supply Chain Analyst certification.`,
              verificationTag: `Sifter Skill_Up Certified — Junior Level`,
            },
            {
              platform: `LinkedIn`,
              type: `primary`,
              postContent: `Completed the Junior Supply Chain Analyst capstone at Sifter Skill_Up — including the unseen Phase 2 boss battle.

The project: a full supply chain analysis for a fictional distributor experiencing simultaneous overstock AND stockouts.

What I built:
📊 Data audit (34 quality issues identified and resolved)
📦 ABC inventory analysis — isolated the demand-supply mismatch
🔍 Supplier OTIF scorecard in SQL — 3 suppliers below 80%
📈 Root cause analysis — 5 Whys traced to stale ordering policies
💡 Prioritised recommendations with ROI calculations
📱 Power BI dashboard (now auto-refreshing)
🌐 Tableau Public dashboard (linked below)

Portfolio: [GitHub link]
Dashboard: [Tableau link]
Case study: [Notion link]

#SupplyChain #DataAnalysis #SQL #PowerBI #SifterSkillUp`,
            },
            {
              platform: `Personal Portfolio / Notion`,
              type: `primary`,
              caseStudyTitle: `FreshFlow Supply Chain Analysis — Junior Capstone`,
              caseStudyContent: `## The Problem
FreshFlow Distribution: £4.2M inventory. 40% increase in stockouts. Three suppliers with OTIF below 80%.

## The Paradox
How can you have record-high inventory AND record-high stockouts simultaneously?

## The Approach
[Methodology documented from boss battle scenario]

## Key Findings
[Findings from boss battle scenario]

## Recommendations
[Prioritised actions from boss battle scenario]

## Impact
[Quantified impact from boss battle scenario]

## Verified By
Sifter Skill_Up — Junior Capstone Certification
[Date] | [Verification link]`,
            },
          ],
        },
      },
      onFail: {
        feedbackFormat: `criteria-pass-fail-only`,
        message: `Not all criteria met. A new scenario will be generated for your next attempt.`,
        portfolioPush: false,
      },
    },
    scenarios: [
      {
        id: `j124-b1`,
        situation: `You are Maya presenting the FreshFlow capstone to the leadership team. You have 15 minutes.

The key findings:
- Simultaneous overstock and stockout caused by ordering policy unchanged for 18 months
- 23% of inventory value (£966,000) is in 8 slow-moving SKUs with <14 days remaining season
- 3 suppliers account for 78% of OTIF failures — all have lead time variability >50%
- Management report currently takes 3 days — your Power BI dashboard delivers it in 30 seconds

Prepare your 5-slide executive presentation structure. For each slide: title, one key message, the 2–3 data points that prove it, and the recommended action.`,
        question: `Write the 5-slide structure.`,
        options: [
          {
            text: `Slide 1: The Paradox — "£4.2M inventory, 40% more stockouts." Data: overstock and stockout coexisting — confirms ordering policy, not supply, is the problem. Action: review ordering policy now.
Slide 2: Where the Money Is Stuck — "£966K in 8 ageing SKUs." Data: days of supply vs remaining season. Action: clearance programme immediately — 14 days before season ends.
Slide 3: The Supplier Problem — "3 suppliers = 78% of OTIF failures." Data: OTIF by supplier, lead time CV. Action: performance reviews with bottom 3 suppliers within 30 days.
Slide 4: The Fix — "Updating ROP and safety stock eliminates 83% of stockouts at £42K cost." Data: current vs formula ROP for all SKUs, investment vs stockout cost comparison. Action: approve £42K inventory top-up.
Slide 5: The Dashboard — "Management reporting from 3 days to 30 seconds." Data: before/after, live demo. Action: approve Power BI rollout to all managers.`,
            correct: true,
            explanation: `Correct. Five slides, five decisions. Each slide leads with the implication (not the data), proves it with 2–3 numbers, and closes with one specific action. This is the structure Janet needs to approve 4 things in 15 minutes. No background, no methodology, no caveats until the Q&A.`,
          },
          {
            text: `Slide 1: Introduction and agenda. Slide 2: Data audit methodology. Slide 3: Analysis approach. Slide 4: Findings overview. Slide 5: Detailed recommendations appendix.`,
            correct: false,
            explanation: `This structure puts the analyst's process before the business problem. An executive presentation has 15 minutes — 3 slides of methodology before any insight is 3 minutes wasted. Start with the problem. State the finding. Recommend the action. The methodology lives in the appendix.`,
          },
          {
            text: `14 slides covering all findings in equal depth with detailed statistical analysis on each slide.`,
            correct: false,
            explanation: `14 slides in 15 minutes = just over 1 minute per slide. No decision can be made that fast. The rule: one insight per slide, maximum 5 slides for a 15-minute executive presentation. Everything else is backup in the appendix.`,
          },
          {
            text: `One slide with all findings listed as bullet points.`,
            correct: false,
            explanation: `A single slide with multiple bullet points forces the audience to read and process simultaneously — they stop listening. Each finding needs its own dedicated space with supporting evidence. Five separate slides with one message each is far more effective than one slide with five bullets.`,
          },
        ],
      },
      {
        id: `j124-b2`,
        situation: `Janet the CFO asks during the Q&A: "You're recommending we spend £42,000 to top up safety stock. But our inventory is already at its highest-ever level of £4.2M. Why would we add more?"`,
        question: `What does Maya say?`,
        options: [
          {
            text: `"You're absolutely right — £4.2M is the problem, and I shouldn't be asking for more."`,
            correct: false,
            explanation: `This abandons a correct recommendation under pressure. The £42K investment is correct. Maya should defend it with data, not retreat.`,
          },
          {
            text: `"The £4.2M is in the wrong things. Eight slow-moving SKUs hold £966K we should be liquidating — that releases capital immediately. The £42K goes into 34 understocked A items where every stockout costs an average of £8,400. The clearance alone releases 23× the investment. We're not adding to the problem — we're rebalancing."`,
            correct: true,
            explanation: `Correct. Maya directly addresses Janet's logic: total inventory value is high because it's misallocated, not because we need less inventory overall. She quantifies both sides: £966K released by clearance vs £42K invested in correct buffer. 23:1 ratio. She's not asking to increase total inventory — she's asking to rebalance it. This is the right answer and the right way to deliver it under pressure.`,
          },
          {
            text: `"The safety stock investment is standard practice — all supply chain teams need it."`,
            correct: false,
            explanation: `This is an appeal to convention, not a financial argument. Janet speaks in numbers. "Standard practice" doesn't justify any spend to a CFO.`,
          },
          {
            text: `"I'll take the recommendation out of the deck if you feel it's not appropriate."`,
            correct: false,
            explanation: `Never withdraw a correct recommendation because a stakeholder pushes back. Defend it with data. If the data doesn't hold, revise the recommendation. But not in response to pressure alone.`,
          },
        ],
      },
    ],
  },
},
