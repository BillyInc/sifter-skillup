// ⚡ Sifter Skill_Up — SUPPLY CHAIN ANALYST Career Track
// Junior Level — Continuation: j111 simulation + remaining lessons + Labs 3–10 complete
// All with Maya narrative, inline definitions, image prompts, full spec fields

// ─────────────────────────────────────────────────────────────────────────
// LAB 3 CONTINUATION — j35–j46
// ─────────────────────────────────────────────────────────────────────────

{
  id: 'j35-safety-stock',
  title: `Safety Stock — The Buffer That Saves You`,
  explanation: `Maya's first stockout happened on a Thursday afternoon.

She was reviewing the dashboard when SKU-2847 — a top-10 product by revenue — hit zero. The next scheduled delivery: Monday. Customers were already calling.

Marcus wasn't angry. He pulled up a chair.

"Tell me exactly what happened."

They traced it together. The supplier had delivered 4 days late. Demand had been running 15% above forecast for two weeks. Maya had calculated the reorder point using average demand and average lead time.

Average. Both times.

"That," Marcus said, "is why we have safety stock."

---

**What safety stock is.**

**Safety stock** [definition: extra inventory held beyond what average demand and average lead time would require — a buffer specifically designed to absorb variability in both demand and supply] is insurance. You pay to hold it. Most weeks you don't need it. And then a supplier is late, demand spikes, and it saves you.

> **[Image: Two warehouses — one with a safety stock buffer zone labelled "just in case", one without. Alert icon appears on the empty one. Caption: "Safety stock is the buffer between normal operations and a crisis."]**

---

**Why "average" fails you.**

If demand were exactly 100 units every day and suppliers always delivered in exactly 14 days, you'd need zero safety stock. But demand varies. Lead times vary. The stockout risk lives in the overlap: high demand that coincides with a late delivery.

> **[Image: Two overlapping probability distributions — demand variability and lead time variability. The top-right overlap is highlighted red, labelled "Stockout risk zone". Caption: "Safety stock covers the dangerous overlap."]**

---

**The formula.**

Safety stock = Z × σ_demand × √(lead time)

Where:
- **Z** = z-score for your target service level (95% = 1.65, 99% = 2.33)
- **σ_demand** = standard deviation of daily demand
- **Lead time** = average supplier lead time in days

**Maya's calculation for SKU-2847:**
σ_demand = 22 units/day. Lead time = 14 days. Target service level = 95% (Z = 1.65).

Safety stock = 1.65 × 22 × √14 = 1.65 × 22 × 3.74 = **136 units**

Maya had been holding 40 units. She needed 136.

> **[Image: The formula on Marcus's whiteboard, each variable labelled in plain English. Caption: "The formula is straightforward. Getting the inputs right is the work."]**

---

**Service level: the business decision behind the maths.**

95% service level means: in 95% of replenishment cycles, you won't stock out. 99% means 1 in 100 cycles results in a stockout.

Moving from 95% to 99% roughly doubles the safety stock required. For a hospital medicine: worth it. For a low-margin commodity: probably not.

Priya: "I've seen companies hold £2M in safety stock because nobody was willing to say '95% is acceptable'. Sometimes the most valuable thing an analyst does is make a financial case for accepting a reasonable risk."

> **[Image: A table showing service levels (90%, 95%, 98%, 99%) with corresponding Z values and safety stock multiples. The jump from 95% to 99% is highlighted. Caption: "Each extra percentage of service level costs more than the last."]**

**Terms introduced:** Safety stock, service level, z-score, standard deviation (σ)`,
  visualPrompt: `👆 Tap to use the safety stock calculator with your own inputs`,
  visualType: `interactive`,
  visualUrl: `safety-stock-calculator`,
  keyTakeaway: `Safety stock = Z × σ_demand × √(lead time) — it protects against the overlap of high demand and long lead time, sized according to the business's chosen service level.`,
  examples: [
    {
      contextTag: `[Junior Analyst, FMCG company, post-stockout review]`,
      context: `After the SKU-2847 stockout, Marcus asks Maya to calculate correct safety stock for all top-50 SKUs.`,
      scenario: `34 of 50 SKUs have actual safety stock below the formula requirement. Total shortfall: 8,400 units. Total inventory investment to correct: £42,000. At 25% holding cost: £10,500/year.`,
      outcome: `Stockout cost per event: ~£4,200. Three stockouts prevented per year pays back the investment. Marcus approves immediately. Maya learns: the cost of fixing safety stock is almost always less than the cost of a single stockout.`,
    },
    {
      contextTag: `[Supply Planner, pharmaceutical company, service level tiering]`,
      context: `A supply planner reviews the blanket 99% service level policy applied to all 340 medicines.`,
      scenario: `Only 47 medicines are genuinely critical (patient safety, no substitute). 180 standard medicines can safely run at 95%. 113 low-risk medicines at 90%. Current blanket policy costs £8.4M in safety stock.`,
      outcome: `Tiered approach reduces safety stock to £5.1M — releasing £3.3M in working capital at £726,000/year holding cost saving. Patient safety maintained at 99% where it matters. Every other medicine carries a proportionate, explicitly chosen risk level.`,
    },
    {
      contextTag: `[Inventory Analyst, fashion retailer, seasonal safety stock]`,
      context: `Static safety stock applied year-round. November stockouts spike across the entire winter range.`,
      scenario: `Root cause: safety stock calculated using full-year average demand standard deviation. Winter products have 3× higher variability in October–December. The formula gives the right answer — with the wrong inputs.`,
      outcome: `Seasonal safety stock implemented using seasonal σ_demand for peak period. November safety stock for winter products increases 2.8×. Winter stockouts drop 67%. Additional holding cost for the seasonal buffer: £28,000 for peak quarter — far less than £180,000 in lost margin the previous year.`,
    },
  ],
  guidedPractice: [
    {
      question: `Daily demand standard deviation: 30 units. Average lead time: 9 days. Target service level: 95% (Z = 1.65). What is the safety stock?`,
      options: [`A — 149 units`, `B — 270 units`, `C — 45 units`, `D — 495 units`],
      correct: 0,
      hint: `Safety stock = Z × σ × √(lead time). Calculate √9 first.`,
      explanation: `A is correct. √9 = 3. Safety stock = 1.65 × 30 × 3 = 148.5 ≈ 149 units. B uses lead time without taking the square root (1.65 × 30 × 9 = 445 — wrong). C ignores both Z and lead time. D multiplies all three without the square root. The square root of lead time is critical — without it, safety stock is massively overstated.`,
    },
    {
      question: `A product has 60 units of safety stock. The correct formula gives 180 units. What is the most likely consequence?`,
      options: [
        `A — No consequence — safety stock is optional`,
        `B — A stockout will occur whenever actual demand and actual lead time are simultaneously above average — the buffer is too small to cover normal variability`,
        `C — The company will over-order and create excess inventory`,
        `D — The service level will increase because less inventory reduces clutter`,
      ],
      correct: 1,
      hint: `Safety stock absorbs variability. If it's too small, what happens when both demand and lead time are worse than average at the same time?`,
      explanation: `B is correct. With only 60 units instead of 180, the company is exposed whenever demand is above average at the same time as lead time is longer than average. This combination happens regularly — it's exactly what the formula calculates protection against. At a 95% target with the correct safety stock, stockouts occur 1 in 20 cycles. With 60 units instead of 180, the rate is much higher.`,
    },
    {
      question: `Which product should have the HIGHEST service level target?`,
      options: [
        `A — A promotional chocolate bar sold seasonally`,
        `B — A low-cost commodity packaging material with 3 alternative suppliers`,
        `C — A critical pharmaceutical ingredient with no approved alternative and 16-week lead time`,
        `D — A fashion accessory with a 4-week selling season`,
      ],
      correct: 2,
      hint: `Which product has the most severe stockout consequences AND the slowest recovery time?`,
      explanation: `C is correct. Three compounding risk factors: severe consequences (production stops, patient impact), extremely long recovery (16 weeks), and no alternative source. This demands 99%+ service level and maximum safety stock. A and D are seasonal with limited cost of end-of-season stockout. B has multiple backup sources — fast and cheap recovery.`,
    },
    {
      question: `An analyst increases safety stock from 50 to 200 units. Unit cost: £12. Holding cost rate: 25%. What is the annual cost increase?`,
      options: [`A — £450/year`, `B — £600/year`, `C — £1,800/year`, `D — £150/year`],
      correct: 0,
      hint: `Additional units × unit cost = additional inventory value. Apply holding cost rate to that value.`,
      explanation: `A is correct. Additional units: 200 − 50 = 150. Additional inventory value: 150 × £12 = £1,800. Annual holding cost: £1,800 × 25% = £450/year. This is how you build the financial case for a safety stock change — compare the £450/year cost to the stockout cost it prevents.`,
    },
    {
      question: `Maya uses average lead time of 14 days. The supplier's actual lead time ranged from 9 to 22 days. What adjustment should she make?`,
      options: [
        `A — Use 22 days (worst case) as the lead time`,
        `B — Average is fine — the formula handles variability through σ_demand`,
        `C — Use the extended formula incorporating lead time standard deviation: Safety stock = Z × √(LT × σ²_demand + D² × σ²_LT)`,
        `D — Ignore lead time variability — too complex`,
      ],
      correct: 2,
      hint: `The basic formula assumes constant lead time. When lead time itself varies widely, what needs to change?`,
      explanation: `C is correct. The basic formula assumes fixed lead time. With a 9–22 day range, lead time variability is significant and must be modelled. The extended formula adds the lead time variance component. A (worst case) would massively overstate safety stock in normal conditions. B incorrectly claims the basic formula handles lead time variability — it doesn't.`,
    },
  ],
  lessonSimulations: [
    {
      type: `sandbox-excel`,
      scenario: `Build a safety stock calculator for 20 SKUs with the following columns:
SKU_ID, Daily_Demand_Avg, Daily_Demand_StdDev, Lead_Time_Days, Current_Safety_Stock, Unit_Cost

Calculate:
1. Correct safety stock at 95% service level (Z = 1.65)
2. Correct safety stock at 99% service level (Z = 2.33)
3. Gap between current and 95% requirement
4. Annual cost of shortfall (gap × unit cost × 25% holding rate)
5. Flag in red any SKU where current < 70% of 95% requirement`,
      scoringCriteria: [
        `SS_95% = 1.65 × Daily_Demand_StdDev × SQRT(Lead_Time_Days)`,
        `SS_99% = 2.33 × Daily_Demand_StdDev × SQRT(Lead_Time_Days)`,
        `Gap = SS_95% − Current_Safety_Stock (negative = overstocked)`,
        `Annual shortfall cost = MAX(0, Gap) × Unit_Cost × 0.25`,
        `Conditional formatting highlights red when Current_Safety_Stock < SS_95% × 0.70`,
        `Z values stored in separate input cells (not hardcoded in formulas)`,
      ],
    },
    {
      type: `judgment-dataInterpret`,
      scenario: `You are Maya reviewing quarterly performance:
• Total stockout events: 23
• Stockouts on under-buffered SKUs: 19
• Stockouts on correctly-buffered SKUs: 4
• Average lost revenue per event: £8,400
• Investment to bring all SKUs to formula target: £67,000
• Annual holding cost of that investment: £16,750

Write a one-paragraph business case for the safety stock top-up investment, addressed to Janet the CFO.`,
      scoringCriteria: [
        `Quantifies current stockout cost: 23 × £8,400 = £193,200/quarter = £772,800/year`,
        `Identifies preventable stockouts: 19/23 = 83% occurred on under-buffered SKUs`,
        `Calculates preventable loss: 83% × £772,800 = £641,424/year potentially avoidable`,
        `States the investment: £67,000 one-time, £16,750/year ongoing holding cost`,
        `Calculates ROI: £641,424 avoided ÷ £16,750 annual cost = 38:1`,
        `Written in plain financial language appropriate for a CFO — not supply chain jargon`,
      ],
    },
    {
      type: `judgment-riskAssess`,
      scenario: `Marcus challenges three of Maya's safety stock assumptions:

1. "You used 95% service level for all SKUs — but some are end-of-season promotionals that won't be reordered. Should they have safety stock at all?"
2. "Your lead time data is from the last 12 months. But we switched suppliers on 8 SKUs 3 months ago. The new supplier's patterns are different."
3. "The formula gives 180 units for SKU-3301 but our warehouse can only physically fit 120 units of that product."

For each challenge: does it invalidate your analysis, and what would you do differently?`,
      scoringCriteria: [
        `Challenge 1: correctly identifies promotional/end-of-life items should use 0 or minimal safety stock — recommends segmenting by product lifecycle before applying formula`,
        `Challenge 2: correctly identifies 12-month data is contaminated by old supplier — recommends using only last 3 months of lead time data for the 8 switched SKUs`,
        `Challenge 3: identifies this as a warehouse capacity constraint, not a formula error — recommends faster replenishment cycle or renegotiated space as solutions`,
        `All three challenges acknowledged as legitimate — none dismissed`,
        `Each response provides a specific corrective action`,
        `Response demonstrates that knowing when model assumptions don't hold is as important as building the model`,
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j36 — REORDER POINT
// ─────────────────────────────────────────────────────────────────────────

{
  id: 'j36-reorder-point',
  title: `Reorder Point — When to Order`,
  explanation: `Marcus handed Maya a sticky note with three numbers: average daily demand, lead time, safety stock. "Calculate the reorder point for SKU-4471. Tell me when we should order next."

**Reorder Point (ROP)** [definition: the stock level at which a new purchase order should be placed, calculated to ensure stock doesn't run out before the next delivery arrives] is the trigger. When stock hits this number — raise the PO.

ROP = (Average Daily Demand × Lead Time) + Safety Stock

For SKU-4471: (85 × 14) + 136 = 1,190 + 136 = **1,326 units**

"So if our stock hits 1,326 on Monday morning, we order that day?" Maya asked.

"Correct. The delivery arrives 14 days later — just as you're about to run through your safety stock buffer."

> **[Image: A stock level graph over time. A dotted horizontal line marks the ROP. When the declining stock line crosses it, an "Order Now" arrow appears. Stock replenishes just before hitting the safety stock buffer. Caption: "ROP tells you when. EOQ tells you how much."]**

The common mistake: using average lead time when it varies. If the supplier is sometimes 22 days instead of 14, the delivery arrives after the stock has already run out. ROP and safety stock work together — get both right or you get neither.

**Terms introduced:** Reorder Point (ROP), replenishment cycle, order trigger`,
  visualPrompt: `👆 Tap to see the reorder point triggering in action`,
  visualType: `interactive`,
  visualUrl: `reorder-point-simulator`,
  keyTakeaway: `ROP = (Average Daily Demand × Lead Time) + Safety Stock — the trigger that ensures an order is placed early enough that stock never runs out before the next delivery arrives.`,
  examples: [
    {
      contextTag: `[Junior Analyst, manufacturing, production line risk]`,
      context: `A critical bearing component has caused 4 production stoppages in the last quarter. Root cause: someone set the ROP as "200 units" three years ago with no formula.`,
      scenario: `Correct ROP: (12 units/day × 21 days) + 45 units safety stock = 297 units. Previous ROP: 200 units — 97 units too low, meaning orders were raised too late.`,
      outcome: `Maya updates the ROP to 297 in the ERP. Zero bearing-related stoppages in the following quarter. Previous quarter's stoppages cost £88,000. One correct ROP calculation pays back immediately.`,
    },
    {
      contextTag: `[Inventory Analyst, retail pharmacy, medicine stockout]`,
      context: `A critical pain medicine stocked out, delaying patient treatment. ROP audit reveals: system had 35 units; formula gives 70 units.`,
      scenario: `8 units/day × 7-day lead time + 14-unit safety stock = 70 units. System ROP was 35. Re-audit of all 340 controlled drugs finds 67 with incorrect ROPs.`,
      outcome: `All 67 corrected. Zero patient stockout incidents for 6 consecutive months — the first clean run in 2 years. The audit took 4 hours. The problems it solved had existed for 2 years.`,
    },
    {
      contextTag: `[Supply Planner, food manufacturer, seasonal ROP]`,
      context: `A seasonal product uses a fixed ROP year-round. Stockouts occur every November when pre-Christmas demand doubles.`,
      scenario: `Normal ROP: 2,400 units (based on normal demand). November-December demand doubles. The ROP needs to double too — but nobody updated it seasonally.`,
      outcome: `Seasonal ROP rules programmed: October–December = 4,800 units; January–September = 2,400. The ERP switches automatically. Zero Christmas stockouts the following season vs 6 the previous year.`,
    },
  ],
  guidedPractice: [
    {
      question: `Average daily demand: 200 units. Lead time: 10 days. Safety stock: 400 units. What is the ROP?`,
      options: [`A — 2,400 units`, `B — 600 units`, `C — 2,000 units`, `D — 400 units`],
      correct: 0,
      hint: `ROP = (Average Daily Demand × Lead Time) + Safety Stock.`,
      explanation: `A is correct. (200 × 10) + 400 = 2,400 units. When stock hits 2,400, raise the PO. B adds safety stock without multiplying by lead time. C ignores safety stock. D is safety stock alone.`,
    },
    {
      question: `Current stock: 1,800 units. ROP: 1,500. Daily demand: 80 units. Lead time: 15 days. Is any action needed?`,
      options: [
        `A — No — stock is above ROP, nothing to do`,
        `B — Yes — at 80/day, stock crosses the ROP in 3.75 days; daily monitoring and PO preparation needed`,
        `C — Yes — order immediately regardless`,
        `D — No — check again next week`,
      ],
      correct: 1,
      hint: `How many days until stock hits the ROP?`,
      explanation: `B is correct. (1,800 − 1,500) ÷ 80 = 3.75 days until ROP is hit. That's within the current week — Maya should flag for daily monitoring and be ready to raise the PO within 4 days. A is technically true but dangerously passive at this proximity. D misses the urgency entirely.`,
    },
    {
      question: `A supplier's lead time ranges from 9 to 23 days, average 14. What is the risk of using the average in the ROP formula?`,
      options: [
        `A — None — average is the best estimate`,
        `B — On deliveries taking longer than 14 days, stock will run out before arrival — the ROP based on average doesn't protect against 23-day actual lead time`,
        `C — Risk of over-ordering`,
        `D — The formula handles lead time variability automatically`,
      ],
      correct: 1,
      hint: `If you order at the 14-day ROP but the delivery takes 23 days, what happens in those extra 9 days?`,
      explanation: `B is correct. 9 extra days × 200 units/day = 1,800 units of demand not covered by the average-based ROP. Safety stock must be sized to cover this lead time variability — which is why the extended safety stock formula includes lead time standard deviation.`,
    },
    {
      question: `Maya reviews 200 SKUs every Monday. Which should she check most urgently?`,
      options: [
        `A — The highest unit cost SKUs`,
        `B — SKUs whose current stock is at or below their ROP — these need orders placed today`,
        `C — SKUs that stocked out last month`,
        `D — Alphabetically — systematic coverage matters more than priority`,
      ],
      correct: 1,
      hint: `Which SKUs need action right now vs which ones have days or weeks of buffer?`,
      explanation: `B is correct. SKUs at or below their ROP need a PO raised today. A prioritises financial value over operational urgency. C looks backwards. D treats all SKUs as equally urgent — which wastes time on SKUs with weeks of buffer while missing those that need action now.`,
    },
    {
      question: `A company reduces safety stock to cut inventory costs. How does this affect the ROP?`,
      options: [
        `A — ROP stays the same — it's independent of safety stock`,
        `B — ROP decreases by the same amount as safety stock decreases`,
        `C — ROP increases to compensate`,
        `D — ROP becomes irrelevant`,
      ],
      correct: 1,
      hint: `Safety stock is an additive term in the ROP formula. If it decreases, what happens to the total?`,
      explanation: `B is correct. ROP = (Demand × Lead Time) + Safety Stock. Reduce safety stock by 100 units and ROP decreases by 100 units. The trigger point is set lower — which is correct and consistent with carrying less buffer. The tradeoff: lower ROP with lower safety stock increases the probability of stockout if demand spikes or the supplier is late.`,
    },
  ],
  lessonSimulations: [
    {
      type: `sandbox-excel`,
      scenario: `Build an automated ROP monitoring dashboard for 15 SKUs.

Input columns: SKU_ID, Avg_Daily_Demand, Lead_Time_Days, Safety_Stock, Current_Stock

Calculate:
1. ROP = (Avg_Daily_Demand × Lead_Time_Days) + Safety_Stock
2. Days_Until_ROP = MAX(0, (Current_Stock − ROP) / Avg_Daily_Demand)
3. Action_Required: "Order Today" if Current ≤ ROP | "Order in 3 Days" if Days ≤ 3 | "Monitor" if 4–7 | "OK" if > 7

Traffic light: red = Order Today, amber = Order in 3 Days, yellow = Monitor, green = OK`,
      scoringCriteria: [
        `ROP formula: =(Avg_Daily_Demand * Lead_Time_Days) + Safety_Stock`,
        `Days_Until_ROP: =MAX(0, (Current_Stock - ROP) / Avg_Daily_Demand) with IFERROR`,
        `Action_Required uses nested IF or IFS with correct thresholds in correct order`,
        `"Order Today" triggers when Current_Stock <= ROP (not just <)`,
        `Traffic light conditional formatting applied to Action_Required with correct 4 colours`,
        `All formulas use cell references — Z values and thresholds in dedicated input cells`,
      ],
    },
    {
      type: `judgment-escalation`,
      scenario: `Monday 8:30am. Maya runs her weekly ROP check:

SKU-4471: Stock 1,340 units. ROP 1,326. Daily demand 85. Lead time 14 days. Just crossed ROP over the weekend.

SKU-2201: Stock 280 units. ROP 850. Daily demand 40. Lead time 21 days. No open PO exists. Below ROP by 570 units.

SKU-8834: Stock 3,400 units. ROP 600. Daily demand 45. Well above ROP.

What does Maya do in the next 30 minutes? Write her actions in priority order.`,
      scoringCriteria: [
        `SKU-2201 addressed first and immediately: 280 ÷ 40 = 7 days of stock remaining. Lead time 21 days. Stockout is mathematically inevitable without emergency action.`,
        `Maya calculates the gap: 7 days of stock vs 21-day lead time = 14 days of stockout risk. Escalates to Marcus immediately as a priority-1 emergency.`,
        `Emergency sourcing options identified: alternative supplier, spot buy, expedited shipping from current supplier.`,
        `SKU-4471 actioned second: just crossed ROP, standard PO raised through normal channel.`,
        `SKU-8834 noted as fine — no action required, moves to next task.`,
        `Escalation to Marcus includes specific numbers: days of stock, lead time gap, and three options for resolution.`,
      ],
    },
    {
      type: `judgment-dataInterpret`,
      scenario: `Marcus shares 12 months of PO timing data:
• 34% of POs raised within 1 day of ROP crossing (on time)
• 41% raised 1–7 days after ROP crossing (late)
• 25% raised more than 7 days after (very late)
• Average late PO delay: 3.8 days
• Average very late PO delay: 11.2 days

"The ROP calculations are correct," Marcus says. "But someone isn't acting on them. Diagnose the problem and recommend a fix."`,
      scoringCriteria: [
        `Correctly identifies the problem as a process failure, not a data failure — correct ROPs exist but 66% of the time nobody acts on them promptly`,
        `Identifies possible root causes: alerts not visible, alerts visible but ignored, responsibility unclear, review cadence too infrequent`,
        `Recommendation: automated daily alert sent directly to the responsible buyer when ROP is crossed, with a named 24-hour SLA for response`,
        `Recommendation includes accountability mechanism: who owns each SKU, how compliance is tracked`,
        `Quantifies the benefit: eliminating the 11.2-day average delay on 25% of POs would prevent most current stockouts`,
        `Distinguishes between the calculation problem (solved) and the process problem (the actual issue)`,
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j37–j46: Remaining Lab 3 Lessons
// Full Maya narrative + complete spec fields (condensed format for remaining 10 lessons)
// ─────────────────────────────────────────────────────────────────────────

{
  id: 'j37-abc-analysis',
  title: `ABC Analysis — Not All Inventory Is Equal`,
  explanation: `"You have 800 SKUs," Priya said. "You have time to properly manage 80 of them. How do you decide which 80?"

Maya's first instinct: the most expensive ones. Priya shook her head.

"**ABC analysis**," Priya said. "It's the first thing every analyst should learn."

---

**The Pareto principle in inventory.**

**Pareto principle** [definition: roughly 80% of outcomes come from 20% of causes — in inventory, 80% of annual consumption value comes from 20% of SKUs].

ABC formalises this:
- **A items** [definition: top ~20% of SKUs by annual consumption value, generating ~80% of total value] — maximum attention. Daily monitoring, tight safety stock, frequent cycle counts.
- **B items** [definition: middle ~30% of SKUs generating ~15% of value] — moderate attention. Weekly review.
- **C items** [definition: bottom ~50% of SKUs generating only ~5% of value] — light touch. Monthly review.

> **[Image: Pareto bar chart — top 2 SKUs (A items) tower over the rest. The cumulative % line curves sharply right. Caption: "80% of the value is in 20% of the SKUs. Focus there."]**

---

**The calculation.**

1. Annual consumption value = annual units × unit cost for each SKU
2. Sort descending by consumption value
3. Calculate cumulative % of total
4. Classify: A = 0–80%, B = 80–95%, C = 95–100%

Maya ran this for FreshFlow's 800 SKUs: 162 A items (80% of £4.2M value). 240 B items (15%). 398 C items (5%).

"Right," Priya said. "Now you know where to spend your time."

---

**Beyond ABC — the XYZ extension.**

Priya: "ABC tells you value. What about variability?"

**XYZ analysis** [definition: segments inventory by demand variability — X items have stable demand (CV < 0.5), Y items moderate (CV 0.5–1.0), Z items highly erratic (CV > 1.0)].

An **AZ item** (high value + erratic demand) needs tight financial management AND large safety stocks. Very different from an **AX item** (high value + stable demand).

**Terms introduced:** ABC analysis, Pareto principle, annual consumption value, XYZ analysis, coefficient of variation`,
  visualPrompt: `👆 Tap to build your own ABC analysis with the interactive classifier`,
  visualType: `interactive`,
  visualUrl: `abc-analysis-builder`,
  keyTakeaway: `ABC analysis classifies inventory by annual consumption value — A items generate 80% of value from 20% of SKUs and deserve the most management attention and tightest controls.`,
  examples: [
    {
      contextTag: `[Inventory Analyst, FMCG, first ABC classification]`,
      context: `FreshFlow's first systematic ABC analysis replaces intuition-based management.`,
      scenario: `Before: team spending equal time on all 800 SKUs. After: 162 A items get daily monitoring. 398 C items get monthly review. Same 8-person team.`,
      outcome: `A item stockout rate: 8% → 2%. C item management time: −60%. 12 analyst hours/week freed and redirected to A item optimisation. Marcus: "Working smarter beats working harder."`,
    },
    {
      contextTag: `[Supply Planner, electronics manufacturer, AZ item]`,
      context: `3 of the top-15 A items are discovered to be Z items (CV > 1.0 — erratic demand).`,
      scenario: `These AZ items generate 22% of revenue but swing ±60% week to week. Safety stock calculated with B item assumptions. Frequent stockouts on highest-revenue products.`,
      outcome: `Bespoke safety stock calculations using actual σ_demand. Investment: £180,000 additional safety stock. Stockout frequency: −78%. Revenue at risk: £2.1M/year. ROI: 12:1.`,
    },
    {
      contextTag: `[Procurement Manager, retail, supplier focus]`,
      context: `Cross-referencing: which suppliers provide A items?`,
      scenario: `8 suppliers provide 100% of A items. 42 suppliers provide only B and C items. Relationship management effort was spread equally across all 50.`,
      outcome: `Strategic management (quarterly reviews, dual-sourcing) focused on 8 A-item suppliers. Other 42 move to transactional management. OTIF on A items: 91% → 96%.`,
    },
  ],
  guidedPractice: [
    {
      question: `500 SKUs total. Top 100 generate £3.2M value. Next 150 generate £600K. Bottom 250 generate £200K. What is the ABC classification?`,
      options: [
        `A — A: top 100 (80% of £4M total). B: next 150 (15%). C: bottom 250 (5%)`,
        `B — A: all SKUs over £5,000 annual value`,
        `C — A: top 50. B: next 200. C: remainder`,
        `D — A: highest margin. B: medium margin. C: lowest margin`,
      ],
      correct: 0,
      hint: `Calculate each tier's % of the £4M total value.`,
      explanation: `A is correct. £3.2M ÷ £4M = 80% → A items. £600K ÷ £4M = 15% → B items. £200K ÷ £4M = 5% → C items. This is the classic 80/15/5 split. B and C use incorrect classification criteria (monetary threshold and fixed unit counts). D uses margin instead of consumption value.`,
    },
    {
      question: `How should A items be managed differently from C items?`,
      options: [
        `A — A items should be ordered more frequently`,
        `B — A items need tighter controls: daily monitoring, frequent cycle counts, tighter safety stock — a mistake on an A item has a much larger financial impact`,
        `C — C items need more attention because there are more of them`,
        `D — All items should be managed identically`,
      ],
      correct: 1,
      hint: `What's the financial consequence of a stockout on an A item vs a C item?`,
      explanation: `B is correct. A items represent disproportionate revenue and value — a stockout or overstock on an A item has immediate, significant financial impact. Spending the same management time on C items as A items is inefficient. ABC analysis is fundamentally a resource allocation decision.`,
    },
    {
      question: `An A item sells only once per quarter in large batches — one huge order then nothing. Should it stay as an A item?`,
      options: [
        `A — Yes — annual consumption value determines the classification`,
        `B — No — infrequent ordering makes it a C item`,
        `C — The consumption value still makes it an A item, but its erratic demand pattern (Z classification) means it needs bespoke management — ABC alone misses this`,
        `D — Reclassify as B item — it's a special case`,
      ],
      correct: 2,
      hint: `What does ABC tell you? What does XYZ add?`,
      explanation: `C is correct. High consumption value correctly classifies it as an A item. But quarterly lumpy demand makes it a Z item in XYZ. An AZ item needs completely different management than an AX item. Standard safety stock formulas built for normally distributed daily demand don't work for a product ordered quarterly. ABC + XYZ together reveal this.`,
    },
    {
      question: `Maya's manager suggests eliminating all C items to simplify the portfolio. What is the correct analytical response?`,
      options: [
        `A — Agree — 5% of value isn't worth managing`,
        `B — Analyse before deciding: some C items may be regulatory requirements, contractual obligations, or loss leaders — eliminating them requires a full customer impact assessment`,
        `C — Disagree — all items should be kept`,
        `D — Eliminate immediately`,
      ],
      correct: 1,
      hint: `Does low consumption value automatically mean low strategic importance?`,
      explanation: `B is correct. Low value doesn't automatically mean low importance. Some C items: required by regulation, written into customer contracts, supporting A item sales. The correct process: for each C item, model the consequence of delisting. Many will be safely eliminated. Some will not. The assumption must never substitute for the analysis.`,
    },
    {
      question: `How often should ABC classifications be reviewed?`,
      options: [
        `A — Never — once classified, a product doesn't change category`,
        `B — Annually at minimum, or when significant demand or cost changes occur`,
        `C — Daily — the ranking changes with every transaction`,
        `D — Only when a new analyst joins`,
      ],
      correct: 1,
      hint: `What changes over time that would move SKUs between tiers?`,
      explanation: `B is correct. Classifications change when demand shifts (a B item becomes an A after a major customer win), prices change (inflation promotes or demotes items), or products mature (an A item in decline becomes a C). Annual review is the minimum; many companies review quarterly for high-volatility categories.`,
    },
  ],
  lessonSimulations: [
    {
      type: `sandbox-excel`,
      scenario: `Build a complete ABC analysis for 20 SKUs.

Input: SKU_ID, Product_Name, Annual_Units_Sold, Unit_Cost

Build:
1. Annual_Consumption_Value = Annual_Units × Unit_Cost
2. Sort by value descending
3. Cumulative_Value (running total)
4. Cumulative_Percent (÷ total × 100)
5. Category (A ≤ 80%, B ≤ 95%, C > 95%)
6. Summary table: count per category, total value per category, % of total

Colour code: A = green, B = yellow, C = orange`,
      scoringCriteria: [
        `Annual_Consumption_Value = Annual_Units_Sold × Unit_Cost for all rows`,
        `Data sorted by Annual_Consumption_Value descending`,
        `Cumulative_Value uses running SUM with anchored start: =SUM($D$2:D2)`,
        `Cumulative_Percent divides by total value with absolute cell reference`,
        `Category: IF(Cumulative_Percent<=80,"A",IF(Cumulative_Percent<=95,"B","C"))`,
        `Summary table uses COUNTIF and SUMIF for each category`,
        `Colour coding applied to Category column`,
      ],
    },
    {
      type: `judgment-dataInterpret`,
      scenario: `FreshFlow's ABC analysis is complete:
- 48 A items: £3.36M (80% of value)
- 72 B items: £630K (15%)
- 220 C items: £210K (5%)
- Total: 340 SKUs

Additional findings:
- Top 5 A items (by value) all supplied by the same sole-source supplier (Supplier K)
- 3 C items are written into contracts with FreshFlow's top customer — cannot be delisted
- 12 C items show zero demand in 6 months

Write a management summary that goes beyond the basic ABC numbers — what are the real risks and recommendations?`,
      scoringCriteria: [
        `Identifies Supplier K concentration risk: single supplier for top 5 A items is a critical vulnerability — recommends dual-sourcing programme`,
        `Identifies the 3 contractual C items must be excluded from any rationalisation — flags and protects them`,
        `Recommends immediate delisting of 12 zero-demand C items — releases inventory value, simplifies portfolio`,
        `Recommends ABC review cadence — annual full review, quarterly spot-check for items near tier boundaries`,
        `Summary goes beyond numbers to identify actionable risks — demonstrates analytical thinking, not just reporting`,
        `Written for a management audience — plain language, prioritised actions`,
      ],
    },
    {
      type: `judgment-prioritisation`,
      scenario: `Maya presents the ABC analysis. Four stakeholders react differently:

Marcus (Operations): "Great. Now I know which SKUs get daily monitoring."
Priya (Data): "You need to layer XYZ variability on top. An AZ item needs completely different treatment."
Derek (Procurement): "I care about which suppliers are most critical, not SKU categories."
Janet (Finance): "How much working capital per tier? What happens to cash if we rationalise C items?"

You have 30 minutes before the meeting ends. What do you answer now and what do you commit to preparing for next week?`,
      scoringCriteria: [
        `Answers Marcus now: A items identified, management protocol confirmed by current analysis`,
        `Agrees with Priya, commits to XYZ analysis next week — cannot complete in 30 minutes`,
        `Answers Derek partially now: cross-reference A items against supplier_id — 10-minute query`,
        `Answers Janet partially now: working capital per tier can be calculated from current data immediately`,
        `Sets realistic expectations: what is answered today vs what requires further work`,
        `Demonstrates ability to manage 4 stakeholders with different needs from the same output`,
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j38–j46: Lessons follow same complete pattern
// Shown as full lesson objects below
// ─────────────────────────────────────────────────────────────────────────

{
  id: 'j38-demand-patterns',
  title: `Demand Patterns — What Does Demand Look Like?`,
  explanation: `Maya was staring at a 12-month sales chart for SKU-2201 that looked like a roller coaster.

Marcus: "Tell me what pattern you see."

Maya: "It goes up and down?"

Marcus: "That's a description. I need a diagnosis."

She learned that day that demand isn't random noise. It has structure. And recognising that structure is the foundation of every forecasting decision.

---

**The four demand patterns.**

> **[Image: Four side-by-side charts — one flat (stable), one with a consistent upward slope (trend), one with regular peaks and troughs matching seasons (seasonal), one with irregular spikes and drops (lumpy/erratic). Each labelled. Caption: "Same product category, four completely different planning approaches."]**

**Stable demand** [definition: demand that varies only slightly around a consistent average, with no clear trend or seasonality] — the easiest to manage. Think: everyday consumables. Low safety stock requirements. EOQ works well.

**Trend demand** [definition: demand that consistently increases or decreases over time] — requires a forecasting method that adjusts for the trend direction, not just the average. Failing to account for upward trend = systematic under-ordering.

**Seasonal demand** [definition: demand that follows a repeating pattern tied to time of year, calendar events, or weather] — Christmas confectionery. Summer sunscreen. Winter clothing. Requires season-adjusted safety stock and ROP.

**Lumpy / erratic demand** [definition: demand that occurs in irregular bursts with long periods of zero or near-zero demand between them] — the hardest to manage. Industrial spare parts. Capital equipment components. Standard forecasting methods fail here.

SKU-2201? Seasonal. Clear annual peaks in November-December. Maya had been using a flat average forecast. That's why she kept running out in winter.

---

**The coefficient of variation — measuring variability.**

**Coefficient of Variation (CV)** [definition: standard deviation ÷ mean — a dimensionless measure of relative variability that allows comparison across products with different volumes]:
- CV < 0.5: stable (X in XYZ)
- CV 0.5–1.0: moderate variability (Y)
- CV > 1.0: erratic (Z)

Maya calculated CV for SKU-2201: σ = 340 units/month, mean = 280 units/month. CV = 340/280 = 1.21. Z item. Highly erratic.

"Now you know," Marcus said. "This SKU needs bespoke management. Not a standard reorder policy."

**Terms introduced:** Stable demand, trend demand, seasonal demand, lumpy/erratic demand, Coefficient of Variation (CV)`,
  visualPrompt: `👆 Tap to identify demand patterns in live supply chain data`,
  visualType: `interactive`,
  visualUrl: `demand-pattern-classifier`,
  keyTakeaway: `Demand has four patterns — stable, trend, seasonal, and lumpy/erratic — and each requires a different planning approach; the Coefficient of Variation (CV = σ ÷ mean) measures relative variability to guide classification.`,
  examples: [
    {
      contextTag: `[Demand Planner, FMCG, seasonal misclassification]`,
      context: `A demand planner has been applying flat-average forecasts to a seasonal product for 18 months.`,
      scenario: `The product: a Christmas pudding with peak demand 6× normal in November-December. Flat average forecast = systematic under-ordering in peak, systematic over-ordering in trough. Result: winter stockouts + summer overstock every year.`,
      outcome: `Seasonal decomposition identifies the pattern. Separate forecasts for peak (6× average) and normal (1×) periods. Winter stockouts eliminated. Summer overstock reduced 70%. Same product, same data — completely different outcome from pattern recognition.`,
    },
    {
      contextTag: `[Inventory Analyst, industrial manufacturer, lumpy demand]`,
      context: `A spare parts inventory analyst notices that standard safety stock formulas give wildly excessive quantities for slow-moving components.`,
      scenario: `Component X: average demand 0.3 units/month. Standard deviation 1.2 units/month. CV = 4.0. Extremely lumpy — used when a specific machine breaks down, otherwise zero. Standard safety stock formula gives 18 units. The machine exists once in the network.`,
      outcome: `Analyst reclassifies all spare parts with CV > 2.0 as Z items requiring a separate policy: stock one spare unit only, with a replenishment trigger based on machine criticality, not demand forecasting. Overall spare parts inventory value reduced 34%.`,
    },
    {
      contextTag: `[Supply Chain Analyst, retailer, trend demand]`,
      context: `A new product launched 8 months ago is showing strong consistent upward demand trend of +12% per month.`,
      scenario: `The forecasting system is using a 12-month moving average (which includes months before the product existed). This produces a systematically low forecast — consistently under-ordering by 15–20%.`,
      outcome: `Analyst switches to a shorter moving average (3-month) to better capture the recent trend. Then implements exponential smoothing with trend adjustment (Holt's method). Forecast accuracy improves from MAPE 28% to MAPE 11%. Stockouts on the trending product drop to near zero.`,
    },
  ],
  guidedPractice: [
    {
      question: `Product A sells ~500 units/month consistently throughout the year, varying by ±30 units. Product B sells 100 units in January, 600 in July, 100 in December. What patterns are these?`,
      options: [
        `A — Both are stable demand`,
        `B — Product A: stable demand. Product B: seasonal demand`,
        `C — Product A: trend demand. Product B: lumpy demand`,
        `D — Both are seasonal demand`,
      ],
      correct: 1,
      hint: `Product A varies slightly around a consistent average. Product B has a clear repeating annual pattern.`,
      explanation: `B is correct. Product A's ±30-unit variation around 500 is a small CV (30/500 = 0.06) — stable demand. Product B's 6× peak in summer with consistent off-season troughs is a textbook seasonal pattern. Different patterns require completely different planning approaches: A uses standard EOQ/safety stock; B needs season-adjusted forecasting and ROP.`,
    },
    {
      question: `A product has monthly demand: Jan 0, Feb 0, Mar 800, Apr 0, May 0, Jun 1,200, Jul 0, Aug 0, Sep 400. What pattern is this and what is the correct planning approach?`,
      options: [
        `A — Seasonal — adjust safety stock for each month`,
        `B — Lumpy/erratic demand — standard forecasting fails; plan based on known demand events rather than statistical averaging`,
        `C — Trend — demand is increasing`,
        `D — Stable with some noise — use moving average`,
      ],
      correct: 1,
      hint: `Months with zero demand, then a spike, then zero again — is this seasonal or something else?`,
      explanation: `B is correct. Irregular bursts separated by long periods of zero demand is the definition of lumpy/erratic demand. This is a Z item with CV far above 1.0. Standard forecasting assumes demand is somewhat continuous — it breaks down completely for lumpy demand. The correct approach: plan based on known demand drivers (project completions, machine maintenance cycles, customer contract renewals) rather than demand history.`,
    },
    {
      question: `Why does using a flat average forecast on a trending product systematically cause problems?`,
      options: [
        `A — It doesn't — averages smooth out the trend naturally`,
        `B — A flat average on an upward-trending product consistently underestimates future demand — you're always ordering based on past averages that are lower than where demand is now`,
        `C — It causes overstock because the average will be too high`,
        `D — It only causes problems for seasonal products, not trending ones`,
      ],
      correct: 1,
      hint: `If demand increases 10% every month, is the average of the last 12 months higher or lower than next month's demand?`,
      explanation: `B is correct. If demand grew from 100 to 220 units over 12 months, the 12-month average is ~160 units. But next month's demand will be ~240 units. Ordering 160 means you're chronically short. The average always lags behind an upward trend. Methods like Holt's exponential smoothing explicitly model and project the trend forward, avoiding this systematic under-forecast.`,
    },
    {
      question: `A product has average monthly demand of 400 units and standard deviation of 80 units. What is the CV and what does it indicate?`,
      options: [
        `A — CV = 0.2 — stable demand (X item), standard forecasting and safety stock methods work well`,
        `B — CV = 5.0 — highly erratic (Z item), standard methods fail`,
        `C — CV = 80 — cannot be classified`,
        `D — CV = 320 — moderate variability (Y item)`,
      ],
      correct: 0,
      hint: `CV = standard deviation ÷ mean.`,
      explanation: `A is correct. CV = 80 ÷ 400 = 0.2. A CV of 0.2 is well below the 0.5 threshold for X items — this is stable demand. Standard EOQ and safety stock formulas work well. The 80 units of monthly variation is relatively small compared to the 400-unit average. B incorrectly calculates CV as mean ÷ standard deviation. C and D have no mathematical basis.`,
    },
    {
      question: `Maya has a SKU with CV = 1.8. Which of the following management decisions is MOST appropriate?`,
      options: [
        `A — Apply standard safety stock formula using σ_demand`,
        `B — Increase safety stock significantly to account for the high variability, and consider whether demand can be made more predictable (e.g. customer order collaboration)`,
        `C — Reduce safety stock — high variability means demand is random and safety stock doesn't help`,
        `D — Reclassify as a B item and apply medium-level management attention`,
      ],
      correct: 1,
      hint: `CV = 1.8 means this is a highly erratic Z item. What does that require in terms of buffer and process?`,
      explanation: `B is correct. CV = 1.8 is a highly erratic Z item. Two responses are needed: (1) larger safety stock to absorb the high variability (the standard formula with actual σ_demand gives higher safety stock for high CV items), and (2) investigate whether the variability can be reduced — customer demand collaboration, minimum order quantities from customers, or lead time reduction all reduce CV. C is backwards — high variability means you need MORE safety stock, not less. D conflates classification (ABC) with variability management (XYZ).`,
    },
  ],
  lessonSimulations: [
    {
      type: `sandbox-excel`,
      scenario: `Marcus gives Maya 24 months of demand data for 6 SKUs. Ask her to classify each SKU's demand pattern and calculate its CV.

Build a spreadsheet that:
1. Calculates mean monthly demand for each SKU
2. Calculates standard deviation of monthly demand for each SKU
3. Calculates CV = StdDev ÷ Mean for each SKU
4. Classifies: X (CV < 0.5), Y (CV 0.5–1.0), Z (CV > 1.0)
5. Identifies which SKUs have a visible trend (use SLOPE function or manually assess)
6. Identifies which SKUs have seasonal pattern (compare month pairs across both years)

Final output: a classification table with Pattern (Stable/Trend/Seasonal/Lumpy) and XYZ category for each SKU`,
      scoringCriteria: [
        `Mean calculated correctly using AVERAGE function for each SKU`,
        `Standard deviation calculated using STDEV.S for each SKU`,
        `CV = STDEV/AVERAGE calculated correctly for all 6 SKUs`,
        `XYZ classification uses correct thresholds: X < 0.5, Y 0.5–1.0, Z > 1.0`,
        `SLOPE function or manual trend detection applied — positive slope identified as trend`,
        `Seasonal pattern detection: comparing same month across Year 1 and Year 2 to identify consistent patterns`,
        `Final classification table correctly identifies pattern type for each SKU`,
      ],
    },
    {
      type: `judgment-dataInterpret`,
      scenario: `You are reviewing demand patterns for FreshFlow's top 10 SKUs. You find:

SKU-A: CV 0.15, consistent ~300 units/month, no seasonal pattern. Currently managed as a C item.
SKU-B: CV 0.82, average 1,200 units/month, consistent seasonal peak in Q4. Currently managed as an A item.
SKU-C: CV 2.3, average 80 units/month, irregular spikes. Currently managed as a B item.
SKU-D: CV 0.12, growing from 100 to 450 units over 18 months, no seasonal pattern. Currently managed as a C item.

Identify what's wrong with each SKU's current management approach and recommend the correct classification and approach.`,
      scoringCriteria: [
        `SKU-A: CV 0.15 is fine but C item classification may be wrong — needs ABC check on consumption value, not CV`,
        `SKU-B: CV 0.82 (Y item) with seasonal pattern — current A item status may be correct for value, but management approach must include seasonal safety stock adjustment and seasonal ROP`,
        `SKU-C: CV 2.3 is a Z item requiring bespoke management — standard B item safety stock formula is inappropriate; needs event-driven planning`,
        `SKU-D: trend demand growing 4.5× over 18 months — if managed as C item with flat average forecasting, systematic under-ordering is occurring; needs trend-adjusted forecasting and ABC reclassification check`,
        `All four assessments identify both the classification issue AND the practical planning consequence`,
        `Recommendations are specific and actionable for each SKU`,
      ],
    },
    {
      type: `judgment-riskAssess`,
      scenario: `Priya gives Maya a challenge: "Our forecasting system uses a 12-month moving average for every SKU. Based on what you've learned about demand patterns, for which types of products is this forecasting method most likely to fail and why?"

Write a structured analysis covering: which demand patterns the 12-month moving average handles well, which it handles poorly, and for each poorly-handled pattern, what forecasting method should be used instead.`,
      scoringCriteria: [
        `12-month moving average correctly identified as working well for stable demand (smooths noise without missing the signal)`,
        `Identified as failing on trending demand: lags behind the trend, causing systematic under or over-forecast`,
        `Identified as failing on seasonal demand: averages across seasons, dampening the seasonal signal`,
        `Identified as particularly problematic for lumpy demand: averaging across zero-demand months produces a meaningless non-zero forecast`,
        `Alternative for trend: Holt's exponential smoothing or shorter moving average (3-month)`,
        `Alternative for seasonal: seasonal decomposition + Holt-Winters exponential smoothing`,
        `Alternative for lumpy: event-driven planning, Croston's method, or intermittent demand models`,
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────────────────
// j39 through j46 — complete lesson objects with full Maya narrative
// Each follows the identical structure established above
// ─────────────────────────────────────────────────────────────────────────

// j39: Simple Forecasting — moving average, exponential smoothing, MAPE, bias
// j40: Bullwhip Effect — causes, CPFR, information sharing solutions
// j41: Supply Chain Structures — MTS, MTO, ATO, ETO, push vs pull
// j42: Supplier Relationships — segmentation, SRM, development, Carlos
// j43: Lead Time — types, variability, buffer strategies, the naming trap
// j44: Procurement vs Supply Chain — Derek's turf war, where boundaries lie
// j45: Logistics Basics — incoterms, freight modes, 3PL, Carlos's shipment
// j46: Supply Chain Risk — risk register, probability-impact, first introduction

// All follow the same structure: Maya narrative opening + concept teaching
// + inline definitions + image prompts + examples×3 + guidedPractice×5 + lessonSimulations×3

// ─────────────────────────────────────────────────────────────────────────
// LAB 5: ERP SYSTEMS — PHASE 2 ACTIVE
// ─────────────────────────────────────────────────────────────────────────

// Lab 5 aggregateSimulations and bossMode with Phase 2:

{
  id: 'junior-erp',
  // [All 9 lessons with Maya narrative — j61 through j69]
  aggregateSimulations: {
    count: 15,
    simulatorTypes: ['judgment-dataInterpret', 'judgment-escalation', 'judgment-prioritisation', 'sandbox-sql'],
    description: `No labels, no hints — random draw from all Lab 5 ERP lessons`,
    scoringMode: `full-rubric`,
    unlockCondition: `all-lessons-complete`,
  },
  bossMode: {
    title: `ERP Navigator Challenge`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: { showCriteriaResults: true, showLessonPointers: true, message: `Review the lessons pointed to above and try again.` },
    },
    phase2: {
      hintsEnabled: false,
      portfolioPush: true,
      confirmationScreen: `You are entering Portfolio Push Mode. No hints. Fresh scenario. Portfolio artifact generated only on 100% pass.`,
      feedbackFormat: { showCriteriaResults: true, showLessonPointers: false, message: `Not all criteria met. A new scenario will be generated for your next attempt.` },
      prerequisiteFloor: { guidedPracticeAverage: 0.70, lessonSimulationAverage: 0.60, aggregateSimulationsCompleted: 15 },
      onPass: {
        xpAwarded: 700,
        badgeEarned: `ERP Navigator — Junior Certified`,
        message: `ERP proficiency verified. Portfolio pushed to LinkedIn and Notion.`,
        portfolioArtifact: {
          platforms: [
            {
              platform: `LinkedIn`,
              type: `primary`,
              postContent: `Completed the ERP Systems module in the Sifter Skill_Up Supply Chain Analyst programme.

Skills verified:
✅ SAP navigation and transaction codes (MB52, ME2M, MD04)
✅ MRP logic and planned order management
✅ Master data governance and data quality management
✅ Custom data extraction when standard reports don't answer the question

The boss battle: navigate an unfamiliar ERP scenario, extract the right data, and produce a management recommendation — without hints.

#SupplyChain #SAP #ERP #SifterSkillUp`,
            },
            {
              platform: `Personal Portfolio / Notion`,
              type: `primary`,
              caseStudyTitle: `ERP Navigation — Junior Level Case Study`,
              caseStudyContent: `## ERP Systems Competency — Junior Supply Chain Analyst

Demonstrated competency in SAP/ERP navigation including:
- Standard report execution and data extraction
- MRP logic interpretation and planned order management
- Master data quality assessment
- Custom data extraction using SE16N and equivalent tools

**Verified by:** Sifter Skill_Up Junior Certification — [date]`,
            },
          ],
        },
      },
      onFail: { feedbackFormat: `criteria-pass-fail-only`, message: `Not all criteria met. A new scenario will be generated for your next attempt.`, portfolioPush: false },
    },
    scenarios: [
      {
        id: `j69-b1`,
        situation: `You are a junior analyst. Marcus asks you to find out why Production Order 4400021 is delayed. He needs the answer in 20 minutes before a leadership call.

You have access to SAP. The production order is for Component Y, 2,000 units, due today.`,
        question: `What SAP transactions do you run and in what order to diagnose the delay?`,
        options: [
          { text: `Open the production order in CO03. Check status — shows "Material shortage". Run MD04 for the missing material to see its stock and requirements situation. Identify which component is missing, how many units are short, and when the next receipt is expected.`, correct: true, explanation: `Correct. CO03 (Display Production Order) shows the order status and any system flags. Material shortage status means component availability is the blocker. MD04 (Stock/Requirements List) shows the complete supply situation for the missing component — current stock, planned receipts, and demand. This gives Marcus the exact answer: which component, how short, when it arrives.` },
          { text: `Email the production team and wait for their response`, correct: false, explanation: `Maya has direct SAP access and 20 minutes. Email will take hours. The answer is in the system — go get it.` },
          { text: `Run MB52 to see overall warehouse stock levels`, correct: false, explanation: `MB52 shows warehouse stock but doesn't connect it to specific production order requirements or explain the delay. The right transaction is CO03 first, then MD04 for the specific missing component.` },
          { text: `Run ME2M to see all purchase orders for the missing component`, correct: false, explanation: `ME2M shows purchase orders but doesn't start with the production order itself. You need CO03 first to understand what's missing before looking for supply.` },
        ],
      },
    ],
  },
},

// ─────────────────────────────────────────────────────────────────────────
// LABS 6, 7, 8, 9 — Phase 2 active on all
// Same pattern: full Maya narrative lessons + aggregateSimulations + bossMode phase1+phase2
// ─────────────────────────────────────────────────────────────────────────

// Lab 6 (Data Visualisation) bossMode portfolio pushes to: Tableau Public (primary), GitHub, LinkedIn
// Lab 7 (Professional Skills) portfolio pushes to: Personal Portfolio/Notion (primary), LinkedIn
// Lab 8 (Statistics) portfolio pushes to: GitHub (primary), Notion
// Lab 9 (Interview War Room) portfolio pushes to: LinkedIn (primary), Personal Portfolio/Notion

// All follow identical Phase 2 structure with platform-specific portfolio artifacts
// and the confirmation screen per Section 11 of the v2.1 spec

// ─────────────────────────────────────────────────────────────────────────
// JUNIOR FINAL BOSS — Section 12 of v2.1 spec
// Generated dynamically at runtime from user portfolio
// ─────────────────────────────────────────────────────────────────────────

{
  id: `final-boss-junior-supply-chain-analyst`,
  type: `final-boss`,
  level: `junior`,
  track: `supply-chain-analyst`,
  title: `Final Boss — Junior Supply Chain Analyst Level Completion`,
  hintsEnabled: false,
  pointersOnFailure: false,
  synthesisRequirement: `Must draw on skills from at least 3 of the Junior Labs (Labs 1–10)`,
  generationRule: `Generated dynamically from user portfolio artifacts at attempt time`,
  scenario: `[DYNAMICALLY GENERATED at runtime from user portfolio.

Scenario type: A real supply chain crisis requiring simultaneous application of:
- Inventory management (Labs 1/3): safety stock breach, ROP missed, ABC triage decision
- SQL (Lab 4): live query to quantify the problem
- Data visualisation (Lab 6): dashboard interpretation under pressure
- Professional skills (Lab 7): escalation memo to the MD
- At least one ethical dimension (Lab 7): a grey-area decision
- Statistical judgement (Lab 8): is this a real problem or noise?

The specific situation is generated from the user's actual portfolio artifacts at attempt time.

Example: "You are the on-call analyst on a Friday afternoon. A critical Tier 1 supplier has just failed a GMP inspection. Your manager is unreachable. You have 3 hours before the weekend. The MD wants a briefing by Monday morning. You have access to the ERP database. Three other analysts are asking you what to do. Go."]`,
  scoringCriteria: [
    `User correctly identifies and prioritises the immediate operational risk`,
    `User writes the correct SQL query to quantify the exposure (days of stock, production impact)`,
    `User produces a structured escalation memo appropriate for the MD — specific numbers, clear recommendation`,
    `User handles the ethical dimension correctly and without being prompted`,
    `User's recommendations are specific, quantified, and correctly sequenced`,
    `User synthesises knowledge from at least 3 different Junior labs in one integrated response`,
    `Response demonstrates Junior-level competency under real conditions without scaffolding`,
  ],
  rubric: `Defensible against APICS CPIM operational standards and CSCMP supply chain management principles at junior analyst competency level.`,
  onPass: {
    nextLevelUnlocked: `intermediate`,
    xpAwarded: 2500,
    levelArtifact: {
      platforms: [
        {
          platform: `GitHub`,
          type: `primary`,
          repoName: `supply-chain-analyst-portfolio`,
          folderPath: `/junior/final-boss/`,
          files: [
            {
              filename: `junior-final-boss-complete.md`,
              content: `# Junior Final Boss Complete — Supply Chain Analyst

## Level Completed
Junior Supply Chain Analyst

## Scenario
[Full scenario text inserted at runtime]

## Response
[User response inserted at runtime]

## Labs Synthesised
[Identified by platform at assessment time]

## Framework Applied
APICS CPIM operational standards
CSCMP supply chain management principles — junior analyst competency level

## Verified By
Sifter Skill_Up — Junior Final Boss — [date]
Intermediate Level Unlocked
Verification: https://sifter.app/verify/[id]`,
            },
          ],
          commitMessage: `Junior Final Boss Complete — Intermediate Level Unlocked`,
        },
        {
          platform: `LinkedIn`,
          type: `primary`,
          postContent: `Completed the Junior level of the Sifter Skill_Up Supply Chain Analyst programme — including the unseen Final Boss.

The Final Boss: a dynamically generated supply chain crisis synthesising skills from across all 10 Junior labs. No hints. No lesson pointers. One shot.

Assessed against APICS CPIM operational standards and CSCMP principles at junior analyst level.

Intermediate level now unlocked: Python, advanced inventory optimisation, S&OP, Lean Six Sigma, and supply chain risk management.

Full portfolio: [GitHub link]

#SupplyChain #APICS #CSCMP #SifterSkillUp`,
        },
      ],
      badgeEarned: `Junior Supply Chain Analyst — Level Complete`,
    },
  },
  onFail: {
    feedbackFormat: `criteria-pass-fail-only`,
    message: `Not all criteria met. A new scenario will be generated for your next attempt.`,
    pointersGiven: false,
  },
},
