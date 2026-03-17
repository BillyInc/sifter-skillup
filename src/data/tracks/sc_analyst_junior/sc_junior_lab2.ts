// ⚡ Sifter Skill_Up — SUPPLY CHAIN ANALYST Career Track
// Junior Level — Lab 2: Excel — The Tool You'll Use Every Single Day
// 18 Lessons | Phase 1 (Learning Loop) Only | No Portfolio Push
// Maya is learning Excel from scratch — she's used it before but never properly

{
  id: 'junior-excel',
  title: `Lab 2: Excel — The Tool You'll Use Every Single Day`,
  subtitle: `From "what's a spreadsheet?" to building dashboards that managers actually use.`,
  difficulty: 'beginner',
  lessons: [

    {
      id: 'j16-what-is-excel',
      title: `What Excel Is and Why Analysts Live In It`,
      explanation: `Maya had used Excel before. In university, for a module on statistics she hated. She'd typed numbers in, hit sum, and submitted her coursework. She thought she knew Excel.

On her first proper project — a weekly inventory health report — Marcus looked at what she'd built and said, politely but firmly: "You don't know Excel yet."

He wasn't being cruel. He was being accurate.

---

**What Excel actually is.**

**Excel** [definition: a spreadsheet application where data is stored in a grid of rows and columns, and calculations are performed using formulas] is not a calculator. It's not a database. It's not a presentation tool.

It's a workspace. A flexible, powerful workspace where you can store data, analyse it, automate calculations, build reports, and make decisions visible.

Think of it like a whiteboard that can do maths, remembers everything you write on it, and can instantly recalculate every number when one thing changes.

> **[Image: A modern Excel workbook open, showing a supply chain dashboard with colour-coded cells, charts, and a summary table. Caption: "This took one analyst 3 hours to build. It now updates automatically every Monday morning."]**

---

**Why supply chain analysts live in it.**

Every supply chain decision involves numbers. How much stock do we have? When do we run out? How much does it cost to hold it? Which supplier is performing worst? What happens to our costs if demand increases 15%?

Excel answers all of these. Immediately. With your own data.

Marcus showed Maya his Monday morning routine: he opens three Excel files before 9am. The inventory dashboard (updates automatically from last night's data extract). The supplier scorecard (refreshes weekly). The OTIF tracker (flags anything below 90%).

"These three files," Marcus said, "tell me everything I need to know before I walk into any meeting today."

> **[Image: Three Excel files open on a dual-monitor setup. Arrows show data flowing from one to another. Caption: "Three files. Everything you need. Built once, used forever."]**

---

**Why Excel is still here after 40 years.**

Microsoft released Excel in 1985. Forty years later, every company on earth still uses it. Why hasn't something better replaced it?

Because Excel is flexible in a way that nothing else is. You can use it for a simple list or a complex financial model. You can build exactly what your company needs — not a pre-built template that's 80% right. It's endlessly customisable.

Priya's opinion: "People keep announcing that Excel is dying. It's not. I've worked at Nike, Tesco, and Pfizer. Every single one: Excel."

> **[Image: A timeline from 1985 to today showing Excel versions. Overlaid: logos of major companies that all use Excel. Caption: "40 years. Still the world's most-used analysis tool."]**

---

**What you'll actually do in Excel as a supply chain analyst.**

- Pull inventory data and flag everything below reorder point
- Calculate how many days of stock each SKU has left
- Build OTIF trackers that automatically highlight failures in red
- Create pivot tables showing which supplier is causing the most problems
- Model the financial impact of a proposed process change before anyone spends money
- Build dashboards that non-technical managers can read at a glance

Maya looked at Marcus's files again. "How long did it take you to learn this?"

"About six months to be useful. About two years to be dangerous." He paused. "You'll be useful in six weeks if you actually practise."

> **[Image: Before/after comparison — a raw data extract (thousands of rows, no formatting) on the left; a clean dashboard with colour coding and summary metrics on the right. Caption: "Raw data vs insight. Excel is the bridge."]**

---

**Terms introduced in this lesson:**
- **Spreadsheet** — a grid of rows and columns for storing and calculating data
- **Workbook** — an Excel file, which can contain multiple sheets
- **Worksheet / Sheet** — a single tab within a workbook
- **Cell** — the intersection of a row and column where data lives
- **Formula** — an instruction that calculates a result from other cells`,

      visualPrompt: `👆 Tap to see what a real supply chain analyst's Excel looks like`,
      visualType: `interactive`,
      visualUrl: `excel-analyst-workspace`,

      keyTakeaway: `Excel is the universal language of supply chain analysis — 40 years old and still the most important tool in the job, because it's flexible enough to solve any analytical problem your company throws at you.`,

      examples: [
        {
          contextTag: `[Junior Analyst, FMCG company, first week]`,
          context: `Maya's first task: produce the weekly inventory health report that her predecessor took 4 hours to build manually.`,
          scenario: `The report requires: pulling stock levels by SKU, comparing to minimum thresholds, flagging anything below threshold, and summarising total inventory value. The dataset has 14,000 rows. Her predecessor did it with copy-paste and manual filters.`,
          outcome: `Maya learns VLOOKUP for the threshold comparison, conditional formatting for the flags, and a SUMIF for the value summary. The report now takes 25 minutes. Within 3 months she automates the data pull entirely — total time: 8 minutes every Monday morning. Marcus: "That's 3 hours and 52 minutes back per week."`,
        },
        {
          contextTag: `[Mid-level Analyst, logistics company, executive dashboard]`,
          context: `Priya is tasked with building a monthly performance dashboard for a client's VP of Operations. Data sits in four different systems.`,
          scenario: `The VP wants a single-page view of OTIF by category, cost per shipment trend, inventory turns, and top-5 stockout SKUs. Priya has to pull data from WMS, TMS, ERP, and a carrier portal and consolidate it in one workbook.`,
          outcome: `Priya builds the dashboard in Excel first (before moving to Power BI later). The VP stops requesting ad hoc reports — she checks the dashboard every Monday. Six months later, Priya is asked to train two junior analysts. "Excel first," she says. "Always Excel first."`,
        },
        {
          contextTag: `[Operations Manager, retail company, cost modelling]`,
          context: `An operations manager needs to model the financial impact of switching from a twice-weekly to a daily replenishment cycle for top-selling SKUs before presenting to the board.`,
          scenario: `The model needs to compare: current safety stock levels vs new levels, transportation cost per delivery, labour cost per delivery cycle, and the reduction in stockout events. Six variables. Multiple scenarios.`,
          outcome: `The manager builds the model in Excel with input cells at the top and a scenario table at the bottom. They can change one number (frequency) and all downstream impacts recalculate instantly. The board presentation takes 20 minutes and passes on the first attempt. "The model answered every question before they asked it," the manager said.`,
        },
      ],

      guidedPractice: [
        {
          question: `A supply chain analyst needs to find all SKUs in a 14,000-row spreadsheet where current stock is below the reorder point. What is the most efficient approach?`,
          options: [
            `A — Read through all 14,000 rows manually`,
            `B — Use a formula to calculate the difference between current stock and reorder point, then use conditional formatting to highlight cells where the result is negative`,
            `C — Delete all rows where stock is above the reorder point`,
            `D — Print the spreadsheet and use a highlighter`,
          ],
          correct: 1,
          hint: `Which approach identifies ALL exceptions automatically without reading every row?`,
          explanation: `B is correct. A formula in a new column (=current stock − reorder point) calculates the gap for every SKU automatically. Conditional formatting then highlights any negative values in red — no reading required. This scales to 14,000 or 140,000 rows with no extra effort. A would take hours and miss errors. C destroys data. D is not a professional analytical approach. This formula-plus-formatting pattern is one Maya will use every week of her career.`,
        },
        {
          question: `What is the difference between a workbook and a worksheet in Excel?`,
          options: [
            `A — They are the same thing — different names for an Excel file`,
            `B — A workbook is the Excel file (.xlsx) that contains one or more worksheets (individual tabs)`,
            `C — A workbook is one tab; a worksheet is the whole file`,
            `D — Worksheets are for formulas; workbooks are for data`,
          ],
          correct: 1,
          hint: `Think of a physical workbook — a binder that contains multiple sheets of paper.`,
          explanation: `B is correct. A workbook is the entire Excel file — the .xlsx file you save and send. Inside a workbook, you can have multiple worksheets (the tabs at the bottom). Maya's inventory workbook might have one sheet for raw data, one for analysis, and one for the dashboard — all in a single file. This structure keeps related work organised without creating dozens of separate files.`,
        },
        {
          question: `Maya types the number 15 into cell B3 and the number 8 into cell B4. She wants B5 to show their sum but automatically update if either number changes. What should she type in B5?`,
          options: [
            `A — 23`,
            `B — =B3+B4`,
            `C — SUM(B3,B4)`,
            `D — =15+8`,
          ],
          correct: 1,
          hint: `In Excel, formulas start with = and reference cells, not hardcoded numbers.`,
          explanation: `B is correct. =B3+B4 tells Excel: "add whatever is in B3 to whatever is in B4." If Maya later changes B3 to 20, B5 automatically updates to 28. Typing 23 (A) is hardcoded and won't update. C is missing the = sign. =15+8 (D) will always show 23 regardless of what's in B3 or B4 — it ignores the cells entirely. The principle of referencing cells rather than hardcoding numbers is fundamental to professional Excel work.`,
        },
        {
          question: `Why does Priya say "Excel first, always" before moving to Power BI or other tools?`,
          options: [
            `A — Because Excel is newer and more powerful than Power BI`,
            `B — Because Excel forces you to understand the data and the calculation logic before automating it — you can't build a good dashboard if you don't first understand what you're measuring`,
            `C — Because Power BI doesn't work with supply chain data`,
            `D — Because Excel is cheaper than Power BI`,
          ],
          correct: 1,
          hint: `What does the process of building something in Excel teach you that importing data into a BI tool doesn't?`,
          explanation: `B is correct. When you build a calculation in Excel, you have to understand every step: where the data comes from, what each formula does, and why the result makes sense. That understanding is what makes a Power BI dashboard accurate rather than confidently wrong. Marcus: "I've seen analysts build beautiful Power BI dashboards that measured the wrong thing. They didn't know because they'd never done it in Excel first."`,
        },
        {
          question: `An analyst's Excel formula produces the result 0 when it should produce a positive number. What is the most common first thing to check?`,
          options: [
            `A — Restart the computer`,
            `B — Check that all referenced cells contain data and that the formula is referencing the correct cells — a common error is pointing at empty cells or the wrong column`,
            `C — The formula is definitely correct — the data must be wrong`,
            `D — Delete the formula and type the number manually`,
          ],
          correct: 1,
          hint: `What would cause Excel to return 0 even when there's supposed to be data?`,
          explanation: `B is correct. The most common cause of unexpected zeros is a formula referencing an empty cell or the wrong cell range. Maya once spent 30 minutes debugging a SUMIF that kept returning 0 — the criteria range was one column to the left of where it should have been. Checking cell references first resolves 80% of formula errors. A and D don't address the root cause. C assumes the formula is correct before checking it.`,
        },
      ],

      lessonSimulations: [
        {
          type: `sandbox-excel`,
          scenario: `Marcus gives Maya her first real task:

"Here's a raw data export from the ERP. 200 rows. Columns: SKU_ID, Product_Name, Units_On_Hand, Daily_Demand, Unit_Cost, Reorder_Point.

I need you to add three new columns:
1. Days_of_Supply: how many days until we run out (Units_On_Hand ÷ Daily_Demand)
2. Inventory_Value: total value of current stock (Units_On_Hand × Unit_Cost)
3. Status: 'Critical' if Days_of_Supply < 7, 'Watch' if 7–14, 'OK' if > 14

Then add a summary box above the data showing: Total Inventory Value, Count of Critical SKUs, Count of Watch SKUs, Average Days of Supply.

Then apply conditional formatting: red fill for Critical rows, yellow for Watch.

All using formulas — no manual typing of values."`,
          scoringCriteria: [
            `Days_of_Supply formula is correct: =Units_On_Hand/Daily_Demand with division-by-zero error handling (IFERROR)`,
            `Inventory_Value formula is correct: =Units_On_Hand*Unit_Cost`,
            `Status column uses nested IF or IFS with correct thresholds: <7 Critical, 7–14 Watch, >14 OK`,
            `Summary box uses SUM/SUMIF for Total Inventory Value`,
            `COUNTIF correctly counts Critical and Watch SKUs separately`,
            `AVERAGE formula correctly calculates average Days_of_Supply across all rows`,
            `Conditional formatting applies red fill to rows where Status = "Critical" and yellow to "Watch"`,
          ],
        },
        {
          type: `sandbox-excel`,
          scenario: `Priya shows Maya a supplier performance dataset:

Columns: Supplier_Name, PO_Number, Ordered_Qty, Delivered_Qty, Promised_Date, Actual_Date

"Build me a supplier scorecard," Priya says. "For each supplier I want to see:
- Total POs
- On-Time % (Actual_Date ≤ Promised_Date)
- In-Full % (Delivered_Qty = Ordered_Qty)
- OTIF % (both criteria met)

Use a pivot table. Format OTIF% with conditional formatting — anything below 90% in red."`,
          scoringCriteria: [
            `User creates helper columns for On-Time (Y/N), In-Full (Y/N), and OTIF (Y only if both = Y)`,
            `On-Time formula correctly compares Actual_Date to Promised_Date`,
            `In-Full formula correctly compares Delivered_Qty to Ordered_Qty`,
            `OTIF formula uses AND logic requiring both On-Time and In-Full = Y`,
            `Pivot table is built from the correct source range with Supplier_Name in Rows`,
            `OTIF% is calculated as a percentage (Count of Y ÷ Total POs × 100) in the pivot`,
            `Conditional formatting correctly highlights OTIF% < 90% in red`,
          ],
        },
        {
          type: `judgment-dataInterpret`,
          scenario: `Maya has built her first inventory health dashboard. Marcus reviews it and asks three questions she hasn't thought about:

1. "Your Days_of_Supply formula divides by zero for any SKU with 0 daily demand. What happens?"
2. "If I add 50 new SKUs to the raw data tab, does your summary box automatically include them?"
3. "Your 'Critical' count shows 12 SKUs. But when I filter the data for Status = Critical, I see 14. Why might this be different?"

Write your answers to all three questions. Then explain what you would fix in each case.`,
          scoringCriteria: [
            `Question 1 answered correctly: division by zero produces a #DIV/0! error — fix using IFERROR(formula, "N/A") or IF(Daily_Demand=0, "N/A", formula)`,
            `Question 2 answered correctly: if the summary COUNTIF range is fixed (e.g. B2:B200), new rows beyond row 200 won't be counted — fix by extending the range or using a dynamic table`,
            `Question 3 answered correctly: possible causes include blank cells counted incorrectly, case sensitivity in criteria, or leading/trailing spaces in the Status column — fix by auditing the formula criteria`,
            `Each fix is specific and actionable, not just identifying the problem`,
            `Response demonstrates understanding of formula range management`,
            `Response is written clearly enough that a non-technical manager could understand the issue`,
          ],
        },
      ],
    },

    {
      id: 'j17-first-spreadsheet',
      title: `Your First Supply Chain Spreadsheet`,
      explanation: `"Build me an inventory tracker," Marcus said on Maya's fifth day. "From scratch. Nothing copied from anywhere."

Maya opened a blank Excel file and stared at the grid.

Where do you even start?

---

**The three questions before you touch a cell.**

Marcus had a rule he called The Three Questions:

1. **Who is this for?** (Maya's tracker was for Marcus — a manager who needed to make reorder decisions)
2. **What decision does it need to support?** (Should we reorder this SKU this week, yes or no?)
3. **What data do I need to answer that question?** (Stock level, reorder point, lead time, current open orders)

"Most bad spreadsheets," Marcus said, "were built by someone who started typing before answering these questions."

> **[Image: A whiteboard with three questions written on it. Below each question, a filled-in answer for the inventory tracker. Caption: "Three questions. Five minutes. Better than three hours of rework."]**

---

**Structure: inputs, calculations, outputs.**

Every well-built spreadsheet has the same architecture, even if it looks different:

**Inputs** [definition: the raw data that feeds the spreadsheet — pulled from a system, typed in, or updated regularly] live in one place. Usually a separate tab or a clearly labelled section. Never mixed with calculations.

**Calculations** [definition: formulas that transform input data into intermediate results — days of supply, inventory value, variance from target] are the middle layer. Hidden from most users but critical for the analyst maintaining the file.

**Outputs** [definition: the final results the user needs — a dashboard, a summary table, a list of exceptions] are what the non-analyst sees. Clean, visual, decision-ready.

> **[Image: A spreadsheet with three clearly labelled sections — Inputs (raw data in blue), Calculations (formulas in grey), Outputs (dashboard in green). Caption: "Separate inputs from calculations from outputs. Always."]**

---

**The formatting rules that make you look professional.**

Maya's first draft had: seven different font sizes, numbers without units, dates in three different formats, and a tab named "Sheet1."

Marcus didn't say anything. He just renamed the tab "Data_Raw", formatted every number with a comma separator and no decimals, added column headers in bold, froze the top row so it always showed while scrolling, and locked the input cells.

It took him four minutes. The spreadsheet looked completely different.

**Professional formatting rules:**
- One font size for data (10 or 11pt). One for headers (one size larger, bold)
- Numbers: comma separator for thousands (1,234 not 1234). Currency: £ symbol. Percentages: one decimal place (87.3%)
- Dates: consistent format throughout (DD/MM/YYYY for UK, or formatted cells)
- Tab names: descriptive, underscored (Data_Raw, Analysis, Dashboard — not Sheet1, Sheet2, Sheet3)
- Freeze the top row: View → Freeze Panes → Freeze Top Row

> **[Image: Before/after of the same data — messy and unformatted vs clean and professional. Caption: "Same data. One looks like a junior did it. One looks like a professional."]**

---

**Protecting your work.**

Maya had spent 3 hours building a model. A colleague accidentally deleted a formula column. Everything broke.

**Cell locking** [definition: protecting specific cells from being edited accidentally, while leaving input cells editable] prevents this.

How: Select the cells that should be locked → Format Cells → Protection → Locked. Then: Review → Protect Sheet → set a password. Now only the input cells (which you leave unlocked) can be edited. The formula cells are protected.

Marcus: "Lock everything except the cells that are supposed to be changed. A spreadsheet that can be accidentally broken will eventually be accidentally broken."

> **[Image: A lock icon overlay on formula cells in a spreadsheet. Input cells have a pencil icon showing they're editable. Caption: "Lock the formulas. Free the inputs."]**

---

**Terms introduced in this lesson:**
- **Input cells** — where raw data is entered or pasted
- **Calculation cells** — where formulas live
- **Output cells** — the final results displayed to users
- **Freeze panes** — locks rows or columns so they stay visible while scrolling
- **Cell locking / sheet protection** — prevents accidental editing of formula cells`,

      visualPrompt: `👆 Tap to see how a professional supply chain spreadsheet is structured`,
      visualType: `image`,
      visualUrl: `professional-spreadsheet-anatomy`,

      keyTakeaway: `Every professional spreadsheet has three layers — inputs, calculations, outputs — and answering three questions before you start building saves hours of rework later.`,

      examples: [
        {
          contextTag: `[Junior Analyst, distribution company, reorder report]`,
          context: `Maya's actual first deliverable: a weekly reorder report for Marcus covering 340 active SKUs.`,
          scenario: `The report needs to show which SKUs are below reorder point, how many days of supply remain, and whether an open purchase order already covers the gap. Three data sources: ERP stock export, reorder point table, open PO report.`,
          outcome: `Maya builds it with three input tabs (one per data source), a calculation tab (VLOOKUP to join all three, Days_of_Supply formula, open PO offset), and an output tab (filtered to show only SKUs requiring action). Marcus: "This is what I needed. Took you longer than it should have, but you built it right."`,
        },
        {
          contextTag: `[Mid-level Analyst, retail company, model error]`,
          context: `Priya once built a margin analysis model that gave wrong results for six weeks before anyone noticed. The root cause: she'd mixed input cells with calculation cells in the same column.`,
          scenario: `When a colleague updated the "input" section by pasting new data, they overwrote several formula cells. The model silently started showing wrong numbers. No error messages — just quietly wrong.`,
          outcome: `After that, Priya implemented a strict rule: inputs always on a separate tab called Data_Raw, never in the same columns as formulas. "A silent error is the worst kind," she told Maya. "It looks fine right up until someone makes a £500,000 decision based on it."`,
        },
        {
          contextTag: `[Operations Analyst, pharmaceutical company, scenario model]`,
          context: `An operations analyst needs to model three different supply frequency scenarios for a board decision: weekly, twice-weekly, and daily replenishment.`,
          scenario: `Rather than building three separate spreadsheets, the analyst builds one model with a dropdown input cell for frequency. All calculations reference that one cell. Changing the dropdown instantly recalculates all costs, stock levels, and service impact across all scenarios.`,
          outcome: `The board presentation uses the model live — the CFO asks "what if we do it daily?" and the analyst changes the dropdown in real time. The answer appears instantly. "That's the power of building it right the first time," Marcus said when Maya showed him the approach.`,
        },
      ],

      guidedPractice: [
        {
          question: `Marcus asks Maya to build an inventory tracker. Before opening Excel, what three questions should she answer?`,
          options: [
            `A — What font should I use? How many columns? What colour scheme?`,
            `B — Who is this for, what decision does it support, and what data is needed to answer that decision?`,
            `C — How long will it take? Can I copy it from somewhere? Does Excel have a template?`,
            `D — Which formulas will I use? How many sheets? What should I name the tabs?`,
          ],
          correct: 1,
          hint: `Think about what information you need before you can decide how to build anything.`,
          explanation: `B is correct. These three questions determine everything else: who reads it (shapes the output format), what decision it supports (determines which data matters), what data is needed (determines inputs and formulas). Answering these first means you build the right thing once, rather than building the wrong thing and redesigning it. A, C, and D are all tactical questions that only make sense after answering the strategic ones.`,
        },
        {
          question: `Maya has a spreadsheet with input data in column A, a formula in column B, and output results in column C — all on the same sheet. A colleague accidentally pastes new data into column B, destroying all the formulas. What should Maya have done to prevent this?`,
          options: [
            `A — Used a different computer so colleagues can't access the file`,
            `B — Separated inputs, calculations, and outputs onto different tabs, then locked the formula cells with sheet protection`,
            `C — Printed the spreadsheet to PDF so nobody could edit it`,
            `D — Told colleagues not to touch her spreadsheet`,
          ],
          correct: 1,
          hint: `What structural and protective measures prevent accidental formula deletion?`,
          explanation: `B is correct. The two-part solution: structural separation (inputs and formulas on different tabs means a colleague can't accidentally overwrite a formula while updating data) and cell locking (Review → Protect Sheet locks formula cells against editing). A and C make the spreadsheet unusable for its purpose. D is not a technical solution and relies entirely on colleagues remembering a verbal instruction — which they will eventually forget.`,
        },
        {
          question: `A spreadsheet shows "1234.5678" in a cell representing £1,234 and 57 pence. How should it be formatted professionally?`,
          options: [
            `A — Leave as 1234.5678 — the exact number is always better`,
            `B — Format as £1,234.57 — currency symbol, comma thousands separator, two decimal places`,
            `C — Round to 1000 and format as £1,000`,
            `D — Format as 1234.57% — percentage format`,
          ],
          correct: 1,
          hint: `Professional financial formatting uses currency symbols, comma separators for thousands, and appropriate decimal places.`,
          explanation: `B is correct. £1,234.57 communicates the value unambiguously: the £ sign confirms it's currency, the comma makes large numbers readable at a glance, and two decimal places is standard for monetary values. Leaving the raw number (A) makes the spreadsheet harder to read and looks unprofessional. Rounding to the nearest thousand (C) loses information that may be meaningful. D applies percentage formatting to a currency value — completely wrong.`,
        },
        {
          question: `Maya has 500 rows of data and scrolls down to row 200. The column headers (SKU_ID, Units_On_Hand, etc.) have disappeared off the top of the screen. What is the quickest fix?`,
          options: [
            `A — Copy the headers to row 200 so they're always visible`,
            `B — Use View → Freeze Panes → Freeze Top Row to lock the header row in place`,
            `C — Print the spreadsheet`,
            `D — Reduce the row height so more rows fit on screen`,
          ],
          correct: 1,
          hint: `Excel has a built-in feature specifically designed to keep headers visible while scrolling.`,
          explanation: `B is correct. Freeze Top Row locks row 1 (or whichever row you're on when you freeze) so it stays visible regardless of how far you scroll down. This is essential for any dataset longer than a screen. A creates duplicate data that will cause confusion. C doesn't help with the scrolling problem. D reduces readability without solving the header visibility problem.`,
        },
        {
          question: `What is the correct professional naming convention for Excel tabs in a supply chain workbook?`,
          options: [
            `A — Sheet1, Sheet2, Sheet3 — Excel's default names`,
            `B — Descriptive names with underscores: Data_Raw, Analysis, Dashboard — each tab's purpose is immediately clear`,
            `C — Numbers only: 1, 2, 3 — short and simple`,
            `D — Tab names don't matter as long as the contents are correct`,
          ],
          correct: 1,
          hint: `What happens when someone else opens your file and needs to find the right data quickly?`,
          explanation: `B is correct. Descriptive tab names immediately tell any user (including future-Maya, who has forgotten what she built) where everything lives. Sheet1 tells you nothing. Data_Raw tells you exactly what's there. Underscores instead of spaces prevent technical issues if tabs are referenced in formulas or VBA. Priya: "I judge a spreadsheet by the tab names before I even look at the data. Bad tab names = bad spreadsheet."`,
        },
      ],

      lessonSimulations: [
        {
          type: `sandbox-excel`,
          scenario: `Build Maya's first proper supply chain spreadsheet from scratch.

Requirements:
- Tab 1 named 'Data_Raw': contains 10 sample SKUs with columns: SKU_ID, Product_Name, Units_On_Hand, Daily_Demand, Unit_Cost, Reorder_Point
- Tab 2 named 'Analysis': pulls data from Data_Raw using cell references (not copy-paste), adds: Days_of_Supply (=Units_On_Hand/Daily_Demand), Inventory_Value (=Units_On_Hand*Unit_Cost), Status (Critical/Watch/OK)
- Tab 3 named 'Dashboard': a clean summary showing Total Inventory Value, Critical SKU count, Watch SKU count, and a list of only the Critical SKUs

Format rules: currency columns formatted as £, percentage columns to 1 decimal, header row bold and frozen, formula cells locked`,
          scoringCriteria: [
            `Three tabs present with correct names: Data_Raw, Analysis, Dashboard`,
            `Analysis tab references Data_Raw using cell references, not copy-paste values`,
            `Days_of_Supply formula correct with IFERROR for zero-demand protection`,
            `Inventory_Value formula correct`,
            `Status formula uses correct thresholds with nested IF or IFS`,
            `Dashboard shows correct summary metrics using formulas (not manually typed numbers)`,
            `Dashboard list of Critical SKUs updates automatically if Status changes in Analysis tab`,
            `Currency formatting, bold headers, frozen top row, and formula cell locking all applied`,
          ],
        },
        {
          type: `sandbox-excel`,
          scenario: `Marcus gives Maya a broken spreadsheet. He says: "This was built by someone who left. Nothing is labelled. Find the three errors and fix them."

The file has:
- Tab named 'Sheet1' with data in columns A-F (no headers)
- Column G has formulas that return #DIV/0! errors for some rows
- Column H has a VLOOKUP that returns #N/A for 30% of rows
- Column I shows negative inventory values (Units_On_Hand - Reorder_Point) but 5 cells show 0 instead of the correct negative number

Find each error, explain what caused it, and fix it.`,
          scoringCriteria: [
            `#DIV/0! error identified: division by a zero value in the denominator — fixed with IFERROR or IF check`,
            `#N/A error identified: VLOOKUP lookup value not found in lookup table — fixed by checking for exact match (FALSE as 4th argument) and using IFERROR to handle missing values`,
            `Zero instead of negative value identified: possible cause — cell formatted as non-negative, or ABS() function wrapping the formula incorrectly`,
            `All three fixes implemented correctly in the spreadsheet`,
            `Tab renamed from Sheet1 to a descriptive name`,
            `Headers added to all data columns`,
          ],
        },
        {
          type: `judgment-dataInterpret`,
          scenario: `Maya has just finished building her inventory tracker. Priya reviews it and asks:

"Your spreadsheet works perfectly right now with 200 rows. But next month we're importing data from a new warehouse — it'll be 800 rows. In six months it could be 3,000 rows. Will your spreadsheet still work? Walk me through every formula and tell me which ones will break and why."

Assess the scalability of a spreadsheet that uses:
- VLOOKUP ranges defined as A2:D200
- COUNTIF ranges defined as E2:E200  
- A Dashboard that filters rows using manual copy-paste from the Analysis tab
- Conditional formatting applied only to rows 2:200`,
          scoringCriteria: [
            `VLOOKUP range A2:D200 identified as will break: rows beyond 200 won't be included in the lookup — fix with A:D (whole column reference) or a named range that expands`,
            `COUNTIF range E2:E200 identified as will break for the same reason — fix with E:E or a named range`,
            `Dashboard manual copy-paste identified as will definitely break: new rows won't appear automatically — fix by using FILTER function, pivot table, or a dynamic reference`,
            `Conditional formatting E2:E200 identified as will stop applying to new rows — fix by extending to E:E or using a table format`,
            `Recommended fix for all: convert the data range to an Excel Table (Insert → Table) which automatically expands all formulas, conditional formatting, and references`,
          ],
        },
      ],
    },

    // Lessons j18-j32 follow the same pattern
    // For brevity in this file, the remaining 16 lessons continue in the batch file
    // Each maintains Maya narrative, inline term definitions, image prompts, and full spec fields

  ],

  aggregateSimulations: {
    count: 15,
    simulatorTypes: [
      'sandbox-excel',
      'judgment-dataInterpret',
      'judgment-communication',
      'judgment-prioritisation',
    ],
    description: `No labels, no hints — random draw from all Lab 2 Excel lessons`,
    scoringMode: `full-rubric`,
    unlockCondition: `all-lessons-complete`,
  },

  bossMode: {
    title: `Inventory Clerk Challenge`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: true,
        message: `Review the lessons pointed to above and try again. You can attempt Phase 1 as many times as you need.`,
      },
    },
    // Phase 2 NOT active for Lab 2 — Excel foundations not yet certifiable at portfolio level
    scenarios: [
      {
        id: `j32-b1`,
        situation: `Marcus gives Maya a raw ERP export: 1,200 rows, 8 columns, no formatting, duplicate entries, some cells with "#N/A", dates in three different formats.

Task: produce a clean, formatted inventory health report showing: all SKUs below reorder point, days of supply for each, total inventory value by category, and a summary of the 5 most critical SKUs.`,
        question: `What is Maya's step-by-step approach?`,
        options: [
          {
            text: `Start formatting immediately — make it look good first, then figure out the data`,
            correct: false,
            explanation: `Formatting before cleaning data guarantees errors in the output. You'll format incorrect numbers beautifully. Always: clean → calculate → format. In that order, every time.`,
          },
          {
            text: `Step 1: Clean the data (remove duplicates, fix date formats, handle #N/A errors with IFERROR). Step 2: Add calculation columns (Days_of_Supply, Inventory_Value, Status). Step 3: Build a pivot table for the category summary. Step 4: Create the critical SKU summary with LARGE or SORT. Step 5: Apply professional formatting last.`,
            correct: true,
            explanation: `Correct. The sequence is always: clean → calculate → summarise → format. Skipping or reordering any step creates compounding errors. Clean data first because dirty data produces wrong calculations. Calculations before formatting because you format what the numbers mean, not how they look before you know what they are.`,
          },
          {
            text: `Use VLOOKUP to fix all the errors automatically`,
            correct: false,
            explanation: `VLOOKUP finds and retrieves matching values — it doesn't fix data quality problems like duplicate entries, inconsistent date formats, or #N/A errors. Data cleaning requires a different set of tools: Remove Duplicates, TRIM, DATEVALUE, IFERROR, and manual audit of outliers.`,
          },
          {
            text: `Delete all rows with errors and work with the remaining clean data`,
            correct: false,
            explanation: `Deleting rows with errors removes real SKUs from the analysis. If a critical product has a data error, removing it means it won't appear in your critical SKU list — exactly the opposite of what you need. Fix the errors; don't delete them.`,
          },
        ],
      },
      {
        id: `j32-b2`,
        situation: `Maya has built a supplier scorecard. OTIF for Supplier A: 84%. Supplier B: 91%. Supplier C: 78%. Supplier D: 95%.

Janet asks: "Which supplier should we be most worried about, and what exactly does their OTIF number mean in practical terms?"`,
        question: `What does Maya say?`,
        options: [
          {
            text: `Supplier C at 78% — meaning 22 out of every 100 orders either arrive late, arrive incomplete, or both. At our order volume of 500 orders/month, that's 110 failed deliveries per month affecting customer service or production schedules.`,
            correct: true,
            explanation: `Correct on both counts: Supplier C has the lowest OTIF, and the explanation translates the percentage into a real operational number. 78% OTIF on 500 monthly orders = 110 failures per month. Janet understands 110 failed deliveries. She may not immediately grasp "78% OTIF" without that translation.`,
          },
          {
            text: `Supplier D at 95% — because they're closest to our 100% target so they need the most improvement`,
            correct: false,
            explanation: `Supplier D at 95% is your best performer — they're above the industry benchmark. Your biggest concern should always be your worst performer, not your best. Supplier C at 78% requires immediate attention.`,
          },
          {
            text: `All suppliers are fine — all are above 75%`,
            correct: false,
            explanation: `75% is not a benchmark for acceptable OTIF. Industry standard is 95%+. Supplier C at 78% and Supplier A at 84% are both significantly below standard, meaning 22% and 16% of their orders respectively are failing. This is a serious performance problem.`,
          },
          {
            text: `We need more data before we can say anything`,
            correct: false,
            explanation: `You have the data. Waiting for more data is an avoidance tactic, not an analytical decision. Supplier C at 78% is significantly below benchmark. That's enough to act on right now.`,
          },
        ],
      },
      {
        id: `j32-b3`,
        situation: `Maya's inventory model shows that if she changes the reorder frequency from weekly to twice-weekly for the top 50 SKUs, safety stock requirements drop by 23% while stockout risk stays the same.

Marcus asks: "What's the annual financial impact? And what are the risks of making this change?"`,
        question: `How does Maya answer?`,
        options: [
          {
            text: `Annual saving: current safety stock for top 50 SKUs × 23% reduction × 25% holding cost rate. For example, if those 50 SKUs hold £800,000 in safety stock: £800,000 × 23% × 25% = £46,000/year saving. Risk: higher ordering frequency means higher administrative and logistics cost per order — must calculate order cost increase to confirm net benefit.`,
            correct: true,
            explanation: `Correct structure: quantify the saving first (reduction in inventory × holding cost rate), then identify the offsetting risk (higher order frequency costs). A complete financial case shows both sides. £46,000 saving sounds good — until you discover that 50 more orders per week at £200 logistics cost each = £520,000/year in additional costs, making the change a bad idea.`,
          },
          {
            text: `The saving is 23% — so we should definitely do it`,
            correct: false,
            explanation: `23% is the inventory reduction, not the financial saving. The saving is 23% of the safety stock value multiplied by the holding cost rate. And the saving doesn't account for the offsetting costs (higher order frequency). Always model both sides before recommending.`,
          },
          {
            text: `There are no risks — lower inventory is always better`,
            correct: false,
            explanation: `Lower inventory reduces holding cost but increases supply risk if any order is missed or delayed. With twice-weekly ordering, you have half the time to recover from a missed delivery before stockout. The trade-off between holding cost and stockout risk is the central tension of inventory management.`,
          },
          {
            text: `We need to check with the supplier before calculating anything`,
            correct: false,
            explanation: `The financial model can and should be built before supplier conversations. You don't need the supplier's agreement to calculate whether the change is financially worthwhile. Build the case first, then have the supplier conversation with data behind you.`,
          },
        ],
      },
    ],
  },
},
