// ⚡ Sifter Skill_Up — SUPPLY CHAIN ANALYST Career Track
// Junior Level — Lab 1: Foundation — What Is Supply Chain?
// 15 Lessons | Phase 1 (Learning Loop) Only | No Portfolio Push
// Character: Maya — fresh graduate, first supply chain job
// Supporting cast: Marcus (manager), Priya (senior analyst), Derek (procurement), Janet (CFO), Carlos (supplier AM)

{
  id: 'junior-foundation',
  title: `Lab 1: What Is a Supply Chain?`,
  subtitle: `We start from absolute zero. Like, "where does my Amazon package actually come from?" zero.`,
  difficulty: 'beginner',
  lessons: [

    // ─────────────────────────────────────────────────────────────
    // LESSON 1
    // ─────────────────────────────────────────────────────────────
    {
      id: 'f1-world-runs-on-supply-chain',
      title: `The World Runs on Supply Chain (Even Though You Never See It)`,
      explanation: `Maya graduated on a Friday. By Monday she was sitting at a desk in a warehouse office in Birmingham, wondering what exactly a "supply chain analyst" was supposed to do.

Her manager Marcus walked over and dropped a newspaper on her desk. The headline: "TOILET PAPER SHORTAGE HITS BRITAIN." It was March 2020.

"Welcome to supply chain," Marcus said. "Read that. Then tell me why it happened."

Maya stared at it. Toilet paper. A shortage. How?

---

**Here is what Maya figured out.**

A **supply chain** [definition: the complete journey a product takes from raw material to the person who buys it] is invisible until it breaks. You never think about how a product got to you — until it doesn't.

> **[Image: A map showing the journey of a roll of toilet paper — forest → pulp mill → factory → warehouse → truck → supermarket shelf. Each stage labelled. Caption: "This is what's behind a £0.80 toilet roll."]**

---

**The toilet paper mystery.**

In February 2020, factories were making the same amount of toilet paper they always had. Lorries were running. Supermarkets were stocked. Nothing had changed.

Then COVID hit. Schools closed. Offices closed. Everyone stayed home.

The problem: toilet paper comes in two completely separate supply chains.

**Commercial supply chain** → bulk rolls for offices, hotels, schools. Huge rolls. Different packaging. Different suppliers. Different delivery routes.

**Retail supply chain** → individual packs for homes. The ones you buy in Tesco.

When everyone stayed home, demand for retail toilet paper spiked 300% overnight. But the factories couldn't just switch. Different machinery. Different packaging lines. Different contracts. The commercial supply chain had toilet paper nobody wanted. The retail supply chain had none.

> **[Image: Two parallel conveyor belts — one labelled "Commercial: Offices" showing giant rolls with nobody buying them, one labelled "Retail: Homes" showing empty shelves. Caption: "Same product. Different chains. System couldn't switch fast enough."]**

---

**The semiconductor shortage that stopped car factories.**

In April 2020, car companies panicked. Sales were falling. They cancelled their semiconductor orders — the computer chips that go inside every modern car.

Semiconductor factories don't sit idle. They immediately filled that capacity with orders from PlayStation, laptop manufacturers, and phone makers. Demand for electronics was booming.

By October 2020, car sales had recovered. Car companies went back to order semiconductors. The factories said: fully booked until 2022.

Ford lost $2.5 billion in profit. Toyota cut production by 40%. All because of a cancellation decision made in a moment of panic.

**Priya** — the senior analyst two desks over from Maya — put it simply: "Supply chain decisions made today have consequences in two years. That's why this job matters."

> **[Image: A car factory assembly line stopped. One missing component highlighted — a chip the size of a fingernail. Caption: "A £3 chip stopped a £35,000 car from being built."]**

---

**The Red Sea crisis that made your sofa late.**

In January 2024, ships travelling from Asia to Europe through the Red Sea started getting attacked by Houthi forces. Companies rerouted around Africa instead.

A 22-day journey became 42 days.

IKEA couldn't get sofas. Car factories ran out of parts. Retailers ran out of electronics. All because of a shipping route nobody had thought about since geography class.

> **[Image: A world map showing two routes — the normal route through the Suez Canal (short, direct) and the rerouted path around Africa (long, expensive). Caption: "20 extra days. Billions in disruption."]**

---

**Why Maya's job exists.**

Someone has to watch for these things. Someone has to spot the toilet paper problem before it hits the news. Someone has to flag the semiconductor risk before the factory stops. Someone has to reroute 200 containers before they're stranded in the wrong ocean.

That someone is a supply chain analyst.

**Supply chain** [definition: the end-to-end system that takes raw materials and turns them into products in customers' hands] is the most important business function nobody teaches you in school.

Until now.

> **[Pop-up Glossary: Tap any bold term to see its definition.]**

**Terms introduced in this lesson:**
- **Supply chain** — the complete journey from raw material to customer
- **Commercial supply chain** — products sold to businesses
- **Retail supply chain** — products sold to individual consumers
- **Semiconductor** — a computer chip that controls electronic devices`,

      visualPrompt: `👆 Tap to see the invisible journey behind everyday products`,
      visualType: `interactive`,
      visualUrl: `supply-chain-journey-map`,

      keyTakeaway: `A supply chain is the invisible system that moves products from raw material to your hands — when it works, nobody notices; when it breaks, the whole world feels it.`,

      examples: [
        {
          contextTag: `[Junior Analyst, FMCG company, COVID demand surge]`,
          context: `Maya's first week. Her company makes hand sanitiser. Marcus drops a spreadsheet on her desk: demand has spiked 500% in 48 hours.`,
          scenario: `The company's entire stock is allocated to hotels, airports, and offices — all of which have closed. Retail chemists are empty. The allocation system can't switch automatically. Marcus asks Maya to map what it would take to redirect stock.`,
          outcome: `Maya identifies that redirecting to retail requires new packaging (pump bottles instead of bulk containers), new delivery routes, and renegotiated minimums with three distributors. She builds a 10-day action plan. The company captures £11M in sales that competitors miss by acting three weeks later.`,
        },
        {
          contextTag: `[Procurement Coordinator, EV startup, chip shortage 2021]`,
          context: `A 200-person EV startup cancelled semiconductor orders in April 2020 expecting sales to collapse. By October 2020 the EV market is booming.`,
          scenario: `The startup needs 40,000 chips for 400 vehicles in its backlog — its entire revenue pipeline. The Taiwan foundry has no capacity until Q3 2022. The procurement coordinator must find alternative sources immediately.`,
          outcome: `The coordinator sources chips from a spot broker at 3.2× standard price — spending £1.9M extra — but ships the backlog and keeps the company solvent. The lesson: cancelling supply chain commitments to save short-term cost creates long-term existential risk.`,
        },
        {
          contextTag: `[Logistics Analyst, furniture retailer, Red Sea 2024]`,
          context: `A logistics analyst at a furniture retailer is tracking 15 container ships from Vietnam carrying sofas and bookshelves.`,
          scenario: `The ships are rerouted around Africa due to Houthi attacks. Transit time increases from 22 to 42 days. Two product launches and Christmas inventory are at risk. The analyst has 72 hours to make decisions.`,
          outcome: `The analyst identifies 3 high-velocity SKUs facing stockout and escalates to procurement. The company airfreights 800 units of its best-selling sofa at £180,000 cost, saving an estimated £2.1M in lost Christmas sales. Early identification was the difference between a problem and a crisis.`,
        },
      ],

      guidedPractice: [
        {
          question: `In 2020, toilet paper disappeared from supermarkets even though factories were running normally and total production hadn't changed. What was the root cause?`,
          options: [
            `A — Factories reduced output because workers were ill`,
            `B — The supply chain was configured for commercial buyers and couldn't rapidly switch to retail packaging and routes`,
            `C — Consumers hoarded more than they needed, depleting all stock permanently`,
            `D — Lorry drivers refused to work during lockdown`,
          ],
          correct: 1,
          hint: `Think about WHO the supply chain was built to serve — and whether that changed overnight.`,
          explanation: `B is correct. Two completely separate distribution systems existed: commercial (bulk rolls for offices and schools) and retail (individual packs for homes). When offices closed, commercial demand collapsed — but factories couldn't instantly convert packaging lines and delivery routes to retail. The product existed. The pipeline to get it to homes didn't. A is wrong — factories ran at normal capacity. C made shortages more visible but wasn't the structural cause. D didn't happen at scale.`,
        },
        {
          question: `Ford cancelled semiconductor orders in April 2020 and couldn't get chips back until 2022. Which supply chain stage failed first, and what was the cascade?`,
          options: [
            `A — Logistics failed; chips couldn't be shipped from Taiwan`,
            `B — Sourcing failed; without chips, production halted, inventory depleted, and customer delivery stopped`,
            `C — Inventory failed; Ford held too many chips and couldn't sell them`,
            `D — Delivery failed; dealers couldn't sell cars because showrooms were closed`,
          ],
          correct: 1,
          hint: `Which stage comes first in a supply chain? A failure there cascades to everything that follows.`,
          explanation: `B is correct. Sourcing (Stage 1) failed — Ford had no chips available to buy. Without chips, production (Stage 2) stopped. Without production, inventory (Stage 3) depleted. Without inventory, logistics (Stage 4) had nothing to ship. Without shipments, delivery (Stage 5) stopped. One Stage-1 decision cascaded through all five stages and cost Ford £2 billion. A is wrong — chips were available, just allocated to others. C is the opposite of what happened.`,
        },
        {
          question: `A company holds £8M in inventory at 25% annual holding cost. They reduce inventory by 20%. What is the annual saving?`,
          options: [
            `A — £400,000`,
            `B — £2,000,000`,
            `C — £1,600,000`,
            `D — £200,000`,
          ],
          correct: 0,
          hint: `Calculate what 20% of £8M is first. Then apply the 25% holding cost rate to that reduction.`,
          explanation: `A is correct. Inventory reduced: £8M × 20% = £1.6M. Annual holding cost saving: £1.6M × 25% = £400,000. B is the total current holding cost before any reduction. C is the inventory value reduced — not the holding cost saving on it. D uses the wrong numbers entirely. This is the core financial argument for inventory reduction programmes.`,
        },
        {
          question: `A pharmaceutical analyst has 18 days of API stock. Their supplier notifies them of a 14-day delay. What is the actual buffer before a production stoppage?`,
          options: [
            `A — 14 days, equal to the delay`,
            `B — 4 days, because stock is consumed during the wait`,
            `C — 18 days, because current stock covers everything`,
            `D — 32 days, adding the delay to current stock`,
          ],
          correct: 1,
          hint: `Your stock is being used every day during the delay period. Subtract the delay from your current stock.`,
          explanation: `B is correct. You have 18 days of stock, but you consume it while waiting 14 days for the supplier. After 14 days, the supplier delivers — but you only have 4 days of stock left. That's your real buffer: 4 days to resolve any further problems. C ignores that stock gets used during the wait. D adds instead of subtracts. This calculation — available stock minus lead time — is one Maya will do every week of her career.`,
        },
        {
          question: `Retail sales increase 3%. Your DC orders 9% more from the factory. The factory orders 22% more raw materials. Your manager says this is normal. What is your assessment?`,
          options: [
            `A — Normal; upstream teams are being prudent by ordering extra buffer`,
            `B — The bullwhip effect: a 3% retail signal has been amplified to 22% upstream — a classic sign of demand distortion`,
            `C — A data error; the three percentages can't all be correct simultaneously`,
            `D — Under-ordering at retail; the retailer should have ordered more`,
          ],
          correct: 1,
          hint: `What happens to order sizes as you move further from the actual customer? What does CSCMP call this pattern?`,
          explanation: `B is correct, per CSCMP Supply Chain Management definitions. The bullwhip effect describes the amplification of demand signals upstream: 3% → 9% → 22% is textbook. Each tier over-orders to protect itself, creating massive swings in production that don't reflect actual customer demand. A mistakes dangerous amplification for prudence. C is wrong — this pattern is very real. D is backwards. Maya will encounter the bullwhip effect in almost every company she works for.`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-escalation`,
          scenario: `You are Maya, junior supply chain analyst. It's Tuesday 3:40pm.

The weekly inventory dashboard shows your primary packaging supplier — responsible for 60% of bottle supply — hasn't confirmed this week's delivery, which was due by 3pm today. Current bottle stock covers exactly 8 days of production.

Your manager Marcus is presenting to the CFO until 5pm. Procurement closes at 5pm today. You have the supplier account manager Carlos's mobile number.

What do you do right now? Write out your exact actions and reasoning.

Options to consider:
A — Wait for Marcus to finish and brief him tomorrow morning
B — Call Carlos now and email Marcus simultaneously
C — Email procurement before 5pm without telling Marcus
D — Interrupt the CFO presentation now`,
          scoringCriteria: [
            `User selects or recommends option B — simultaneous supplier call and manager notification`,
            `User identifies that 8 days of stock with weekends and lead times reduces the real buffer to approximately 4–5 working days`,
            `User explains why A is wrong: waiting until tomorrow wastes a full working day and may miss the procurement window`,
            `User explains why D is disproportionate: a non-imminent stockout does not justify interrupting a CFO presentation`,
            `User notes the importance of creating a documented paper trail by emailing Marcus even during the call`,
            `User identifies this is a time-sensitive escalation requiring action before 5pm procurement close`,
          ],
        },
        {
          type: `judgment-riskAssess`,
          scenario: `It's Friday 11am. You receive three alerts simultaneously:

1. Your API Supplier A — 40% of your production input — has just failed a GMP inspection and is suspended for 30–45 days. Current API A stock: 22 days.

2. The WMS shows a 14% inventory count discrepancy on your highest-margin product. The system shows 4,200 units; Monday's shipping commitment requires 3,800 units.

3. A container from Germany carrying raw materials is delayed 6 days due to port congestion. That material is needed for a production run starting in 12 days.

Priya tells you: "Marcus is leaving for the airport in 30 minutes. You can only escalate one thing to him before he goes. Choose."

Which do you escalate and why? Write your reasoning clearly.`,
          scoringCriteria: [
            `User escalates Alert 1 (GMP suspension) as the highest-severity issue`,
            `User correctly calculates that 22 days of stock will be exhausted before re-inspection completes (30–45 days), creating a production stop`,
            `User explains Alert 2 is urgent but recoverable: a physical count Friday afternoon can verify before Monday shipping`,
            `User explains Alert 3 has a 6-day buffer against a 12-day runway — not yet critical`,
            `User applies the correct severity framework: irreversible damage if not acted on immediately vs recoverable with time`,
            `User communicates their reasoning in a way Marcus could act on in the 30 minutes available`,
          ],
        },
        {
          type: `judgment-dataInterpret`,
          scenario: `It's Monday morning. Your demand planner sends you this data before the S&OP meeting:

• Retail sales of Product Y: +18% vs last quarter
• DC orders to factory: +34% vs last quarter  
• Factory raw material orders: +67% vs last quarter
• Factory finished goods inventory: −22% (currently 8 days of supply)
• Component lead time: 14 weeks (unchanged)

The demand planner says: "Increase production by 18% to match retail."
The supply planner says: "Order 67% more components."

Janet the CFO will ask you what's happening and what to do. Write a 3–5 sentence memo identifying what is happening and recommending the correct response.`,
          scoringCriteria: [
            `Memo correctly identifies the bullwhip effect: 18% retail signal amplified to 34% then 67% upstream`,
            `Memo recommends production increase based on actual retail demand (18%), not the amplified upstream orders`,
            `Memo explicitly warns against ordering 67% more components — in 14 weeks this will create overstock`,
            `Memo flags that 8 days of factory inventory is a separate urgent risk requiring attention`,
            `Memo is written in plain professional language with specific numbers cited`,
            `Memo is addressed appropriately for a CFO audience — no jargon without explanation`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // LESSON 2
    // ─────────────────────────────────────────────────────────────
    {
      id: 'f2-five-stages',
      title: `The Five Stages — From Dirt to Doorstep`,
      explanation: `On Maya's second day, Marcus handed her a whiteboard marker and pointed at the wall.

"Draw me how a Nike trainer gets made," he said. "Start with the cotton. End with the customer's foot."

Maya stared at the blank wall for a moment. Then she started drawing. Twenty minutes later she had something. Marcus nodded slowly.

"You've just drawn a supply chain. Now let's name the stages."

---

**Every supply chain — Nike trainers, your morning coffee, an iPhone, a hospital's medicines — has exactly five stages. Always five. Every time.**

> **[Image: A horizontal pipeline with five connected tanks, each labelled with a stage name and a small icon. Water flows from left to right. Caption: "Five stages. Break one and the water stops flowing."]**

---

**STAGE 1: SOURCING**

Getting the raw materials.

For Nike, this means: cotton from India, rubber from Malaysia, synthetic mesh from South Korea, foam compounds from Germany, metal eyelets from Taiwan. Fourteen countries. Forty-two suppliers. All before a single shoe is made.

**Sourcing** [definition: the process of finding, evaluating, and purchasing the raw materials or components needed for production] is about asking: where does this come from, how do we get it, and what happens if that source disappears?

Priya leaned over: "The cheapest source is usually the riskiest. Malaysia has the best rubber prices. Malaysia also has typhoon season."

> **[Image: A world map with pins showing Nike's sourcing countries, connected by lines to a UK distribution hub. Caption: "Nike sources from 40+ countries before a trainer reaches your foot."]**

---

**STAGE 2: PRODUCTION**

Making the thing.

Apple: Foxconn factories in Shenzhen assemble iPhones from 2,000 components. Zara: their own factories in Spain and Portugal (unusual — most fashion brands outsource). Nestlé: 413 factories across 85 countries turning cocoa beans into Kit Kats.

**Production** [definition: the process of transforming raw materials into finished goods] is where the sourcing decisions from Stage 1 get tested. If your Stage 1 supplier is late, Stage 2 grinds to a halt.

Marcus: "Remember, a factory sitting idle costs the same whether it's making 10,000 units or zero."

> **[Image: A modern factory floor — robotic arms, conveyor belts, quality control stations. Caption: "Production: where raw materials become products."]**

---

**STAGE 3: INVENTORY**

Storing the thing before it sells.

Apple holds 6 days of iPhone inventory globally — enough to flex but not enough to create massive write-off risk. Zara holds 15 days — fast fashion, fast turnover. A pharmaceutical company might hold 180 days of a critical medicine because running out kills people.

**Inventory** [definition: the stock of finished goods, work-in-progress, or raw materials held by a company at any point in time] is where money goes to sit. Every day your stock isn't selling, it's costing you roughly 25p for every £1 of inventory value per year.

> **[Image: Three warehouses side by side — Apple's slim, minimal warehouse labelled "6 days stock"; Zara's large but organised labelled "15 days"; a pharmaceutical warehouse labelled "180 days — because running out kills people". Caption: "Right inventory depends on the industry."]**

---

**STAGE 4: LOGISTICS**

Moving the thing.

Amazon: 150+ fulfilment centres, 75,000 delivery vans, 70 cargo planes, and partnerships with every carrier on earth. DHL: 220 countries, 395,000 employees, 5,500 aircraft and vehicles.

**Logistics** [definition: the physical movement and transportation of goods from one location to another — including warehousing, handling, and last-mile delivery] is Stage 4. It's the most visible stage — the lorry you get stuck behind on the M6 is Stage 4.

Derek from procurement once said: "Logistics is just moving boxes." Priya's response: "That's like saying surgery is just cutting people." Logistics determines whether customers get their orders on time.

> **[Image: A split image — one side shows the clean Amazon app on a phone showing "Arriving today". The other side shows the 14-step logistics journey that made that possible. Caption: "One tap. Fourteen handoffs."]**

---

**STAGE 5: DELIVERY**

Getting the thing to the customer.

The last mile. In London, this might be a bicycle courier in 30 minutes. In rural Scotland, it might be a Royal Mail van on a Tuesday. In a B2B context, it might be a pallet truck delivering 2,000 units to a Tesco distribution centre at a specific 30-minute docking window.

**Delivery** [definition: the final stage of the supply chain — the handoff from the supply chain to the customer] is where everything upstream either succeeds or fails. A perfectly sourced, manufactured, stored, and transported product that arrives at the wrong address, three days late, damaged, is a supply chain failure.

Marcus closed the whiteboard session: "Your job is to make sure all five stages flow. Break one — you break all five."

> **[Image: A happy customer opening a delivery box. Overlaid text shows the five stages that made this moment possible. Caption: "Stage 5 is the only stage the customer sees."]**

---

**Terms introduced in this lesson:**
- **Sourcing** — finding and purchasing raw materials
- **Production** — transforming materials into finished goods
- **Inventory** — stock held at any stage of the chain
- **Logistics** — physical movement of goods
- **Delivery** — the final handoff to the customer`,

      visualPrompt: `👆 Tap to trace a product through all five stages`,
      visualType: `interactive`,
      visualUrl: `five-stages-pipeline`,

      keyTakeaway: `Every supply chain has exactly five stages — Sourcing, Production, Inventory, Logistics, Delivery. A failure in any one stage stops the entire flow.`,

      examples: [
        {
          contextTag: `[Supply Chain Analyst, consumer electronics, launch planning]`,
          context: `Maya is three months in. Her first project: model the financial impact of a supplier's volume discount offer. The battery supplier offers a 10% price cut if they double the minimum order quantity.`,
          scenario: `The analyst must map the impact across all five stages. Doubling MOQ affects Stage 1 (sourcing saving) but also Stage 3 (twice the inventory holding cost) and Stage 4 (more storage space needed in the DC). A single-stage view would say "accept the discount." A five-stage view changes the answer.`,
          outcome: `The analyst calculates: 10% sourcing saving = £180,000/year. Additional Stage 3 holding cost for doubled inventory = £340,000/year. Net impact: accepting the "discount" costs £160,000 more per year. The analyst recommends declining. Marcus: "That's why we do the full analysis."`,
        },
        {
          contextTag: `[Logistics Coordinator, fast-fashion retailer, air vs sea decision]`,
          context: `A logistics coordinator must decide how to ship 8,000 winter coats from Bangladesh. Sea: £0.80/unit, 28-day transit. Air: £6.40/unit, 3-day transit. Selling season ends in 10 weeks.`,
          scenario: `Sea freight arrives with 3 weeks of selling season remaining. Air arrives with 6.5 weeks. Extra selling time is estimated to shift 1,200 additional units at £60 gross margin each. This is a Stage 4 decision with a direct Stage 5 revenue consequence.`,
          outcome: `Air freight premium: £5.60 × 8,000 = £44,800. Additional gross profit: 1,200 × £60 = £72,000. Net benefit of air: +£27,200. The coordinator recommends air freight. A Stage 4 cost increase generates a Stage 5 revenue gain that more than pays for it.`,
        },
        {
          contextTag: `[Inventory Analyst, FMCG company, overstock crisis]`,
          context: `An inventory analyst holds £18M in finished goods across three warehouses at 28% holding cost (£5.04M/year). The demand planning team over-forecast by 22% for a seasonal product with 8 weeks of selling season remaining.`,
          scenario: `The analyst has 6 months of supply for a product with 8 weeks left to sell at full price (£1.20/unit). Liquidation price: £0.55/unit. Projected full-price revenue: £1.4M. Immediate liquidation revenue: £1.76M. Stage 3 (inventory) has created a Stage 5 (revenue) problem.`,
          outcome: `The analyst recommends liquidation: £1.76M > £1.4M in projected sales, freeing £3.2M in warehouse space and eliminating £56,000 in additional holding costs. The forecast error is escalated for S&OP root-cause analysis. Marcus: "A Stage 3 problem ignored becomes a Stage 5 disaster."`,
        },
      ],

      guidedPractice: [
        {
          question: `Apple ships AirPods by sea (£0.60/unit, 28 days) vs air (£7.20/unit, 4 days). Air gives 3.5 extra weeks of selling season, expected to generate sales of 800 additional units at £30 gross margin each. Batch size: 50,000 units. What is the correct logistics decision?`,
          options: [
            `A — Sea freight: air premium (£330,000) vastly exceeds additional revenue (£24,000)`,
            `B — Air freight: more selling time always means more revenue`,
            `C — Air freight: Apple always airfreights product launches as policy`,
            `D — Cannot decide without knowing Apple's annual revenue`,
          ],
          correct: 0,
          hint: `Calculate the full air premium (cost difference × all units shipped) then compare to the additional gross profit (extra units × margin).`,
          explanation: `A is correct. Air premium: (£7.20 − £0.60) × 50,000 = £330,000. Additional gross profit: 800 × £30 = £24,000. Net cost of air: −£306,000. Sea freight is clearly correct here. B ignores that speed costs money — always calculate both sides. C is not a financial argument. D is unnecessary — the relative comparison is mathematically clear. This is the core Stage 4 vs Stage 5 trade-off calculation Maya will run constantly.`,
        },
        {
          question: `A pharmaceutical company holds £6M in raw material inventory at 22% annual holding cost. They implement more frequent ordering and reduce inventory by 30%. What is the annual saving?`,
          options: [
            `A — £396,000`,
            `B — £1,320,000`,
            `C — £180,000`,
            `D — £660,000`,
          ],
          correct: 0,
          hint: `Calculate the current annual holding cost, then find the saving on the 30% reduction only.`,
          explanation: `A is correct. Inventory reduction: £6M × 30% = £1.8M less inventory held. Annual holding cost saving: £1.8M × 22% = £396,000. B is the total current holding cost before any reduction — a common mistake. D incorrectly applies 22% to £3M (the remaining inventory) rather than the reduction. C has no mathematical basis. This calculation — reduction in inventory × holding cost rate — is fundamental Stage 3 analysis.`,
        },
        {
          question: `Zara manufactures coats in Spain (2-week lead time, 40% higher unit cost) vs Bangladesh (8-week lead time, lower cost). Zara's strategy is to respond to fashion trends that change monthly. Which Stage 2 (Production) decision best supports this strategy?`,
          options: [
            `A — Bangladesh: lower cost maximises gross margin on every coat`,
            `B — Spain: 2-week lead time lets Zara respond to trends before they pass — the foundation of its competitive advantage`,
            `C — Bangladesh: savings should fund marketing spend`,
            `D — Spain: always use domestic factories to minimise Stage 4 logistics cost`,
          ],
          correct: 1,
          hint: `What is Zara's competitive advantage — and which option is the only one that enables it?`,
          explanation: `B is correct. Zara's advantage is speed-to-market, not lowest unit cost. A 2-week vs 8-week production cycle means Zara can put coats in stores while the trend they're responding to is still relevant. A cheaper coat that arrives after its trend has passed sells at 40% markdown — or not at all. A ignores markdown risk entirely. D confuses location with lead time — Spain doesn't mean cheap logistics. Priya: "Strategy defines supply chain. Supply chain doesn't define strategy."`,
        },
        {
          question: `A retailer holds 45 days of inventory. Its competitor holds 15 days. Both have the same annual revenue and product type. Holding cost rate is 25%. Which company pays more in annual holding costs, and by approximately how much more?`,
          options: [
            `A — Same cost — revenue is identical so inventory value is identical`,
            `B — The 45-day company pays approximately 3× more in holding costs`,
            `C — The competitor pays more — faster inventory turns create higher transaction costs`,
            `D — Cannot determine without knowing the cost of goods sold`,
          ],
          correct: 1,
          hint: `Holding cost depends on the VALUE of inventory held — which is directly proportional to how many days of supply you're carrying.`,
          explanation: `B is correct. Same revenue and product type means 45 days of supply = 3× more inventory value than 15 days. At 25% holding cost rate, 3× inventory = 3× holding cost. If the competitor holds £2M in inventory (£500,000 holding cost), the 45-day company holds £6M (£1.5M holding cost) — an extra £1M per year doing nothing except sitting in a warehouse. A confuses revenue with inventory value. C is backwards — faster turns reduce holding cost.`,
        },
        {
          question: `A grocery chain's OTIF (On-Time In-Full) is 82% vs a 95% industry benchmark. Root cause analysis shows: 60% of failures from a slow supplier, 25% from DC picking errors, 15% from carrier failures. Where should Maya focus first?`,
          options: [
            `A — Carrier failures first: lowest complexity fix`,
            `B — Supplier delays first: fixing 60% of failures improves OTIF from 82% to approximately 93% — the single largest available improvement`,
            `C — All three simultaneously for a comprehensive response`,
            `D — Renegotiate the OTIF benchmark to 85% to reduce the gap on paper`,
          ],
          correct: 1,
          hint: `Which cause is responsible for the most failures? Per APICS doctrine, fix the highest-impact root cause first.`,
          explanation: `B is correct, per APICS prioritisation methodology. The 13-point gap × 60% = 7.8 points. Fixing supplier delays takes OTIF from 82% to approximately 90% — the largest single action available. A tackles the smallest contributor first. C dilutes focus and resource across three workstreams simultaneously, reducing the chance of succeeding at any. D avoids the problem entirely. Marcus: "Fix the biggest lever first. Always."`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-prioritisation`,
          scenario: `It's Wednesday afternoon. Marcus is unreachable until 6pm. You have five things competing for your attention:

1. Monthly CFO inventory report — due 4pm today, 70% complete, needs 90 more minutes
2. Supplier Carlos just emailed: a factory fire means no packaging delivery Friday. Current packaging stock: 9 days. No backup supplier on file.
3. Three lorries for tomorrow's delivery to your top-10 customer are unconfirmed. Customer has a 5pm cancellation deadline today with a £25,000 penalty clause.
4. Junior analyst asks you to review their model — their project is due next week
5. HR employee experience survey — due Friday

Rank all five tasks in order and write a one-sentence justification for each.`,
          scoringCriteria: [
            `User addresses Task 3 first: hard 5pm deadline today with a £25,000 irreversible financial penalty`,
            `User addresses Task 2 second: 9-day packaging buffer requires immediate supplier escalation before Carlos's office closes`,
            `User addresses Task 1 third: CFO report is important but still completable after urgent tasks — 4pm deadline is real but recoverable`,
            `User defers Task 4: project due next week — not urgent today`,
            `User defers Task 5: HR survey due Friday — lowest stakes item`,
            `User articulates the framework: irreversible financial loss > supply risk > scheduled deliverable > non-urgent > low-stakes admin`,
          ],
        },
        {
          type: `judgment-communication`,
          scenario: `It's Friday 4pm. You discover a data error in last month's inventory report you prepared and submitted to Janet the CFO: finished goods were overstated by 18,000 units (£2.7M). Janet used this report in an investor briefing on Tuesday. An earnings call is scheduled for Monday morning.

Marcus has just left for a flight — he lands at 9pm. The Head of Finance is still in the building.

Write the disclosure memo you take to the Head of Finance right now. Include: what happened, the magnitude, the cause, what you have verified, and your recommended next steps.`,
          scoringCriteria: [
            `User takes the memo to the Head of Finance immediately — not waiting for Marcus or deferring to Monday`,
            `Memo states specifically what went wrong, not vague language like "a discrepancy was found"`,
            `Memo quantifies the magnitude precisely: £2.7M overstatement, 18,000 units`,
            `Memo identifies the specific cause of the error — not just "human error"`,
            `Memo recommends getting finance and legal/compliance involved given the investor disclosure implications`,
            `Memo is professional and factual — not defensive, not minimising the issue`,
          ],
        },
        {
          type: `judgment-riskAssess`,
          scenario: `Marcus asks you to produce a supply chain risk assessment for Product Z before the annual supplier review next Monday.

Data you have:
• Product Z revenue: £22M/year
• Key ingredient: 100% single-source from Supplier K
• Supplier K lead time: 14 weeks
• Current key ingredient stock: 6 weeks of supply
• Supplier K D&B risk rating: "High Risk" — last reviewed 18 months ago
• Qualified alternative suppliers: 0 (2 potential suppliers identified but unaudited)
• Port strike probability in Supplier K's region: 35% in Q2 per industry intelligence

Write a one-paragraph risk assessment and a prioritised list of 3 mitigation actions with timelines.`,
          scoringCriteria: [
            `Assessment identifies single-source dependency as the primary structural risk`,
            `Assessment flags the critical gap: 6 weeks of stock vs 14-week lead time means any supplier failure creates a production stop before an alternative can be qualified`,
            `Assessment flags the 18-month-old D&B rating as outdated and in need of immediate refresh`,
            `Mitigation 1: Begin qualification of 2 identified alternative suppliers immediately — target within 4 weeks`,
            `Mitigation 2: Increase safety stock to minimum 16 weeks while alternatives are being qualified`,
            `Mitigation 3: Refresh Supplier K D&B rating and request current financial statements before Q2 port strike season`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // LESSON 3
    // ─────────────────────────────────────────────────────────────
    {
      id: 'f3-why-this-is-a-career',
      title: `Why This Is a Career (Not Just a Job)`,
      explanation: `Two weeks in. Maya was eating lunch alone in the break room when Priya sat down across from her.

"What made you pick supply chain?" Priya asked.

Maya shrugged. "Honestly? It was the only graduate scheme I got into."

Priya laughed. "Same. Now I earn more than my friends in marketing and I've had three job offers this year without applying for any of them. Let me show you what you've actually stumbled into."

---

**The industry nobody talks about.**

Global supply chain management is a £15 trillion industry. That's larger than the GDP of every country on earth except the United States and China.

Every company that makes or sells anything — Apple, Tesco, Pfizer, BMW, your local hospital, the Ministry of Defence — needs supply chain professionals. Not one department. Not one role. Dozens of roles at every seniority level.

> **[Image: A skyline of logos — major retailers, manufacturers, pharmaceutical companies, defence contractors, healthcare systems. Caption: "Every one of these companies is actively hiring supply chain analysts right now."]**

---

**The demand problem that works in your favour.**

Right now, there are 2.3 job openings for every qualified supply chain professional in the UK. Companies have been posting the same roles for months with no qualified applicants.

Why? Supply chain isn't taught in most schools. It's not glamourised in films or TV. Nobody grows up wanting to be a supply chain analyst the way they want to be a doctor or a software engineer. The talent pipeline is thin.

That gap is your opportunity.

Priya: "I could leave tomorrow and have three job offers by Friday. Not because I'm exceptional. Because there aren't enough of us."

> **[Image: A job market scale — many open supply chain roles on one side, few qualified candidates on the other. The scale tips dramatically. Caption: "2.3 roles for every qualified professional. That's your leverage."]**

---

**What the pay actually looks like.**

Maya had been afraid to ask. Priya showed her a salary benchmarking report she'd saved.

| Level | Role | Typical salary range |
|-------|------|---------------------|
| Junior (0–2 years) | Supply Chain Analyst | £28,000–£42,000 |
| Mid-level (3–5 years) | Senior Analyst / Planner | £42,000–£62,000 |
| Senior (6–10 years) | Manager / Lead | £62,000–£90,000 |
| Leadership | Director / VP | £90,000–£180,000+ |

"And that's base salary," Priya said. "Add bonuses. Add the fact that supply chain people get poached constantly, so your salary grows faster than your title suggests."

> **[Image: A salary ladder showing progression from junior analyst to CSCO (Chief Supply Chain Officer). Each rung has a salary range and approximate timeline. Caption: "The climb is real. And it's faster than most people think."]**

---

**Why it survives recessions.**

Derek from procurement wandered in. "Supply chain is a cost centre," he announced, like he always did. "First to go in a recession."

Priya disagreed. "During the 2008 financial crisis, supply chain roles were cut 40% less than marketing and sales. During COVID, supply chain people were working 80-hour weeks because companies couldn't function without them."

The reason: goods still have to move in every economic condition. You cannot pause the supply chain the way you pause an advertising campaign. Companies learned this lesson in 2020 and won't forget it.

> **[Image: A graph showing job cuts during 2008 by department. Supply chain bar is noticeably shorter than marketing, sales, and HR. Caption: "The function that moves goods is always the last cut."]**

---

**You can work anywhere.**

Maya hadn't thought about this. Supply chains exist in every industry. The skills she was learning right now — inventory management, demand planning, supplier relationships, data analysis — worked the same way in fashion, pharma, automotive, food, defence, and healthcare.

She wasn't locked in. She could spend three years at Nike, move to Pfizer, then consult for the NHS. Each move would increase her salary and her perspective.

Marcus appeared at the break room door. "Lunch is over. But Priya's right. Learn this well and you'll never struggle to find work again."

> **[Image: A mind map with "Supply Chain Analyst" in the centre, connected to logos from 10 different industries: fashion, pharma, automotive, food & beverage, defence, tech, retail, healthcare, energy, logistics. Caption: "One skill set. Infinite industries."]**

---

**Terms introduced in this lesson:**
- **APICS** — the professional body for supply chain certification (CPIM, CSCP)
- **CSCMP** — Council of Supply Chain Management Professionals — sets industry standards
- **Demand gap** — the difference between available talent and open roles in a field`,

      visualPrompt: `👆 Tap to explore supply chain career paths and salary progression`,
      visualType: `interactive`,
      visualUrl: `supply-chain-career-explorer`,

      keyTakeaway: `Supply chain is a £15 trillion industry with 2.3 jobs for every qualified professional — it's recession-resistant, cross-industry, and one of the best-paid functions nobody talks about.`,

      examples: [
        {
          contextTag: `[Career switcher, retail management background, job search]`,
          context: `A 27-year-old retail manager with 5 years of floor experience, strong Excel skills, and no formal supply chain training is researching a career switch.`,
          scenario: `They discover supply chain analyst roles at Amazon, Tesco, and Unilever actively recruit from retail operations backgrounds. They build a 6-month self-study plan covering inventory fundamentals, SQL basics, and APICS terminology.`,
          outcome: `They land a junior analyst role at £36,000 within 7 months — a £14,000 salary increase from retail management. Hiring manager's feedback: "Retail operations experience is directly transferable. We taught the rest."`,
        },
        {
          contextTag: `[Mid-level analyst, pharmaceutical sector, salary negotiation]`,
          context: `Priya — 4 years of supply chain experience at a pharmaceutical company — is preparing for her annual review. She has delivered £1.2M in measurable cost savings through inventory optimisation.`,
          scenario: `Priya researches market rates and finds mid-level pharma supply chain roles pay £52,000–£68,000 in her geography. She's currently on £47,000. She prepares her case: £1.2M in savings, OTIF improvement from 87% to 94%, two system implementations led.`,
          outcome: `Priya negotiates from £47,000 to £58,000. Her manager approves it without pushback. "The business case was undeniable," her manager said afterwards. "I couldn't argue with the numbers." Supply chain delivers measurable ROI that supports salary conversations.`,
        },
        {
          contextTag: `[Senior analyst, FMCG, Director promotion]`,
          context: `A senior analyst at a consumer goods company has been building their case for a Director promotion over 18 months.`,
          scenario: `Their evidence package: a £3.4M logistics cost reduction, an S&OP redesign that improved forecast accuracy by 18 percentage points, and a dual-sourcing programme that eliminated single-source risk on 14 critical SKUs. Total value delivered: £4.8M annually against a total salary cost of £85,000.`,
          outcome: `Director promotion approved at £118,000 — up from £82,000. The board's comment: "The ROI on this person is 57:1. We'd be foolish not to retain them." Supply chain career progression is driven entirely by measurable business impact.`,
        },
      ],

      guidedPractice: [
        {
          question: `A supply chain analyst saves £500,000 in logistics costs at a company with a 5% operating profit margin. What is the equivalent additional sales revenue needed to generate the same profit increase?`,
          options: [
            `A — £500,000`,
            `B — £10,000,000`,
            `C — £2,500,000`,
            `D — £1,000,000`,
          ],
          correct: 1,
          hint: `At 5% margin, how much revenue is needed to generate £1 of profit? Apply that multiplier to £500,000.`,
          explanation: `B is correct. At 5% margin, £1 of profit requires £20 of revenue (£1 ÷ 0.05 = £20). So £500,000 saved = £10M in additional sales needed to achieve the same profit impact. This is the fundamental financial argument for supply chain investment — savings flow directly to the bottom line with no revenue risk attached. Janet the CFO calls this "the cleanest way to grow profit." A confuses saving with equivalent revenue. C and D use wrong margin multipliers.`,
        },
        {
          question: `During the 2008 financial crisis, what happened to supply chain jobs relative to other corporate functions?`,
          options: [
            `A — They were cut more than most functions as companies reduced operations`,
            `B — They were cut significantly less, or became more critical — companies cannot stop moving goods even in downturns`,
            `C — They were fully automated and most roles were replaced by software`,
            `D — They were entirely outsourced to third-party logistics providers`,
          ],
          correct: 1,
          hint: `Can a company pause buying, making, or shipping goods during a recession?`,
          explanation: `B is correct. During 2008, supply chain was classified as essential operations and retained at higher rates than marketing, sales, and HR. During COVID, supply chain analysts worked extended hours as the most critical function in many companies. Goods have to move in every economic condition — you cannot pause deliveries to hospitals, supermarkets, or manufacturers. A is factually wrong — supply chain is historically more protected than other functions. C didn't happen. D describes a structural trend but not what happened to analyst employment.`,
        },
        {
          question: `A junior supply chain analyst earns £32,000. Average annual pay increases in supply chain are 8%. A mid-level manager role pays £52,000. Approximately how many years of 8% compound growth before they cross £52,000?`,
          options: [
            `A — 3 years`,
            `B — 5 years`,
            `C — 7 years`,
            `D — 10 years`,
          ],
          correct: 1,
          hint: `Use compound growth: Year 1 = £32k × 1.08, Year 2 = result × 1.08, and so on.`,
          explanation: `B is correct. Year 1: £34,560. Year 2: £37,325. Year 3: £40,311. Year 4: £43,536. Year 5: £47,019. Year 6: £50,780. Year 7: £54,843. At 8% compound growth they cross £52,000 in approximately year 6–7. However, supply chain analysts who deliver visible results typically receive above-average increases and promotions that accelerate this timeline significantly. The compound growth calculation is the floor, not the ceiling.`,
        },
        {
          question: `Which combination of skills gives a supply chain analyst the strongest foundation for early-career hiring, based on job description analysis?`,
          options: [
            `A — PowerPoint and communication skills only`,
            `B — Excel + SQL + one BI tool (Power BI or Tableau) + domain knowledge in inventory, logistics, or procurement`,
            `C — Python and machine learning only`,
            `D — A single ERP certification (SAP or Oracle) only`,
          ],
          correct: 1,
          hint: `Think about what appears in the widest range of supply chain analyst job descriptions at junior level.`,
          explanation: `B is correct. Excel appears in virtually every supply chain analyst job description — it's the universal tool. SQL enables database access when data exceeds Excel's limits (which happens within months). A BI tool enables management-facing dashboards. Domain knowledge (inventory, logistics, or procurement) contextualises everything else. A is insufficient for data-heavy roles. C skips the foundational tools that most companies still require alongside Python. D alone gives ERP navigation but no analytical capability.`,
        },
        {
          question: `A supply chain analyst is considering moving from FMCG to healthcare supply chain. Which statement is most accurate about this transition?`,
          options: [
            `A — Supply chain skills are industry-specific; this transition would require starting over`,
            `B — Core analytical skills (demand planning, inventory management, supplier management) transfer across industries; domain knowledge is learned on the job`,
            `C — Healthcare supply chain is simpler than FMCG, so the move represents a step down`,
            `D — Moving industries always results in a salary reduction in the first year`,
          ],
          correct: 1,
          hint: `Do the core methods of supply chain analysis — forecasting, inventory optimisation, logistics management — change between industries?`,
          explanation: `B is correct. The analytical frameworks — EOQ, safety stock, OTIF, S&OP, ABC analysis — are industry-agnostic. Healthcare adds regulatory complexity (NHS frameworks, cold chain requirements, GMP) but the core methods transfer directly. This cross-industry mobility is one of supply chain's major career advantages over more specialised functions. A is factually wrong — supply chain skills are among the most portable in business. C is wrong — healthcare is often more complex due to regulatory requirements and patient safety stakes. D is wrong — lateral moves to healthcare typically include a premium.`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-communication`,
          scenario: `You are Maya. A friend from university — who studied marketing — asks you over coffee to explain why supply chain is worth pursuing as a career. She's considering it but has heard "it's just logistics" and is sceptical.

Write your 5-minute pitch. It must include:
1. One concrete salary data point for each of junior, mid, and senior levels
2. One specific company that actively hires supply chain analysts
3. A plain English explanation of why supply chain savings are more powerful than sales revenue increases
4. One specific reason why supply chain jobs are more resilient than marketing jobs in a downturn`,
          scoringCriteria: [
            `Pitch includes specific salary figures for junior (£28k–£42k), mid (£42k–£62k), and senior (£62k–£90k) levels`,
            `Pitch names a real, specific company (Amazon, Tesco, Unilever, Pfizer, BMW, NHS Supply Chain, etc.)`,
            `Pitch correctly explains the savings-vs-revenue leverage with a specific example (e.g. at 5% margin, £1 saved = £20 in revenue)`,
            `Pitch identifies a specific reason for recession resilience (goods must move regardless of economic conditions)`,
            `Pitch is written in plain language accessible to someone with no supply chain background`,
            `Pitch would genuinely persuade a sceptic — not just recite facts`,
          ],
        },
        {
          type: `judgment-prioritisation`,
          scenario: `You are a junior analyst two years into your career. You have three job offers on the table and must decide by Friday:

Offer A: £38,000 at a 50-person startup. No structured mentorship. Highly autonomous — you'd touch all supply chain functions from day one. No formal training programme.

Offer B: £44,000 at a Fortune 500 FMCG company. Structured 2-year rotation programme. Formal mentorship. Initial scope is narrow: inventory analysis only for the first year.

Offer C: £41,000 at a mid-size logistics company. No formal programme. Manager described as "hands-off." Broad scope but the team has 60% turnover in 18 months.

Your goal: become a senior analyst within 5 years and move into supply chain management.

Write a structured decision memo of 4–6 sentences addressing career trajectory, skill development, and risk for each option. State your recommendation clearly.`,
          scoringCriteria: [
            `Recommendation is explicit — one offer selected with a primary reason stated`,
            `Offer B correctly identified as strongest foundation: structured development, Fortune 500 brand value, formal mentorship`,
            `Offer A evaluated honestly: breadth advantage is real but absence of mentorship at 2 years experience is a development risk`,
            `Offer C correctly flagged as high risk: 60% team turnover in 18 months signals a management or culture problem that impedes development`,
            `Memo addresses the 5-year goal explicitly and connects the chosen offer to specific skills required`,
            `Memo is structured and presents trade-offs — not just a statement of preference`,
          ],
        },
        {
          type: `judgment-ethicalChoice`,
          scenario: `You are Maya, three months into the job. Marcus asks you to adjust inventory reporting numbers before a board presentation. The change would reclassify £800,000 of slow-moving inventory — currently flagged as "at-risk" in your model — as "healthy inventory."

It's technically within company accounting policy (a grey area). But you know from your analysis that these items haven't moved in 4 months and have a 70% probability of being written off at year-end.

Marcus says: "It's within policy. Don't make this complicated. The board doesn't need to see every nuance."

What do you say to Marcus? Write your response.`,
          scoringCriteria: [
            `Response declines to reclassify the inventory without proper business justification`,
            `Response frames the decline professionally — not accusatory, not confrontational`,
            `Response offers a constructive alternative: present the inventory accurately with context explaining why the at-risk classification is a conservative estimate`,
            `Response explains why misleading the board creates downstream risk: decisions made on false data lead to larger write-offs later`,
            `Response does not threaten to escalate in the conversation — but maintains a clear position`,
            `Response is written in professional language appropriate to a junior-manager relationship in a first job`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────
    // LESSON 4 — Key Players
    // ─────────────────────────────────────────────────────────────
    {
      id: 'f4-key-players',
      title: `The Key Players — Who Does What in a Supply Chain`,
      explanation: `In Maya's fourth week, Marcus took her to a supplier meeting. Not to present. Just to watch.

Around the table: the company's procurement lead (Derek), a logistics manager from their 3PL provider, a quality manager from the supplier (a packaging manufacturer in Coventry), and a distributor representative from a national wholesaler.

Maya counted five organisations in one meeting room. All of them were part of the same supply chain. All of them had different interests.

"Watch what happens," Marcus said quietly.

---

**The players in a supply chain — and what they actually want.**

> **[Image: A supply chain map showing all player types — raw material suppliers, Tier 2, Tier 1, manufacturer, distributor, retailer, end customer — connected by arrows. Each player has a speech bubble with their primary concern. Caption: "Same chain. Different priorities. Your job is to align them."]**

---

**Raw material suppliers**

The start of everything. The farmer growing soy. The mine extracting lithium. The forestry company cutting timber. They sell to manufacturers or Tier 2 suppliers.

**Tier 2 suppliers** [definition: suppliers who provide components or materials to your direct (Tier 1) suppliers — you don't buy directly from them, but their failures affect you] are one step removed from you. The packaging company who supplies your packaging supplier. The ball bearing manufacturer who supplies your pump manufacturer.

Why does Tier 2 matter? Because in 2021, a single Tier 2 semiconductor manufacturer in Germany failed — and 12 major car brands had to halt production simultaneously. They had no visibility of their Tier 2. They paid for it.

> **[Image: A diagram showing a Tier 2 failure cascading to Tier 1, then to the manufacturer, then to the customer. Caption: "You can't see Tier 2. But Tier 2 can stop you."]**

---

**Tier 1 suppliers**

Your direct suppliers. The people you have contracts with. The ones you call when things go wrong.

**Tier 1 supplier** [definition: a company that sells directly to you under a formal commercial agreement] — this is the relationship Maya will spend most of her supplier management time on.

---

**Contract manufacturers**

Companies that make your product without selling it under their own brand.

Foxconn makes iPhones. They don't sell iPhones — Apple does. Foxconn is a contract manufacturer. They provide the factory, the labour, and the process. Apple provides the design, the components, and the brand.

**Contract manufacturer** [definition: a company that produces goods on behalf of another company's brand, using the brand owner's specifications] — common in electronics, fashion, pharmaceutical, and food sectors.

> **[Image: Side by side — an iPhone box with Apple logo, and the Foxconn factory in Shenzhen where it was made. Caption: "The box says Apple. The factory says Foxconn."]**

---

**Distributors and wholesalers**

The middle tier. They buy large quantities from manufacturers and sell smaller quantities to retailers or businesses.

**Distributor** [definition: a company that buys products in bulk from manufacturers and resells them, often adding warehousing and logistics services] solves two problems simultaneously: manufacturers don't want to manage 10,000 small retailer relationships; small retailers don't want to commit to 10,000-unit minimum orders. Distributors sit in between.

The national wholesaler in Maya's meeting was unhappy. The manufacturer had recently started selling direct to large retailers, bypassing the distributor entirely. "Disintermediation," Priya called it later. "When you cut out the middleman, the middleman gets very unhappy."

---

**3PLs — Third Party Logistics providers**

The company that runs the warehouse Maya sat in and the lorries that delivered from it. Not the manufacturer. Not the retailer. A specialist logistics company hired to manage both.

**3PL (Third Party Logistics)** [definition: a company hired to manage some or all of a company's logistics operations — warehousing, transportation, fulfilment, or all three] — companies like DHL, XPO, GXO, Wincanton.

Why hire a 3PL instead of running your own warehouse? Scale, flexibility, and expertise. A 3PL manages 50 clients simultaneously — their buying power on vehicles, fuel, and labour is far greater than any single company's.

The downside: you're dependent on them. And when they make mistakes — like the time the 3PL in the meeting had shipped the wrong products to 34 retailers due to a WMS error — the relationship gets complicated fast.

> **[Image: A warehouse interior with 3PL branding on the walls but a manufacturer's products being processed. Caption: "Their building. Your products. Their people. Your responsibility."]**

---

**Terms introduced in this lesson:**
- **Tier 2 supplier** — a supplier of your supplier
- **Tier 1 supplier** — your direct supplier
- **Contract manufacturer** — makes your product under your brand
- **Distributor / Wholesaler** — buys bulk, sells small
- **3PL** — third-party logistics provider`,

      visualPrompt: `👆 Tap to explore each player's role in a live supply chain`,
      visualType: `interactive`,
      visualUrl: `supply-chain-players-map`,

      keyTakeaway: `A supply chain involves raw material suppliers, Tier 2 and Tier 1 suppliers, contract manufacturers, distributors, 3PLs, and customers — Maya's job is to understand every player's interests and manage the relationships between them.`,

      examples: [
        {
          contextTag: `[Procurement Analyst, automotive OEM, Tier 2 failure]`,
          context: `A procurement analyst at an automotive company tracks Tier 1 supplier performance but has no visibility of Tier 2. Their Tier 1 suppliers each source a specialist bearing component from the same Tier 2 manufacturer.`,
          scenario: `The Tier 2 bearing manufacturer files for bankruptcy. The analyst discovers this only when three Tier 1 suppliers simultaneously report component shortages. The OEM has no alternative Tier 2 qualified. Production halts within 18 days.`,
          outcome: `11 days of production lost at £4.3M per day = £47M. Post-incident: the OEM implements Tier 2 financial monitoring for all single-source critical components. The lesson: supply chain risk doesn't stop at the supplier you can see.`,
        },
        {
          contextTag: `[Logistics Coordinator, consumer goods company, 3PL dispute]`,
          context: `A logistics coordinator at a consumer goods company manages the relationship with a 3PL that runs their primary DC. The 3PL misprocesses 340 outbound shipments in one week due to a WMS configuration error.`,
          scenario: `Wrong products reach 34 retailers. The 3PL blames incorrect product master data from the client. The client blames the 3PL's WMS validation. Both positions have some merit. The coordinator must establish accountability and manage the retailer relationships simultaneously.`,
          outcome: `The coordinator convenes a joint root-cause session. Both parties contributed (incorrect master data AND missing WMS validation check). They negotiate a 50/50 cost-share on returns and re-shipments (£62,000 total). A master data validation protocol is implemented. Clear accountability built into the relationship prevents the same dispute the following quarter.`,
        },
        {
          contextTag: `[Sourcing Manager, electronics retailer, distributor removal]`,
          context: `A sourcing manager at a mid-size electronics retailer reviews their distributor arrangement. They currently buy through a national distributor at 18% above direct manufacturer price.`,
          scenario: `The manufacturer offers direct supply at a 500-unit minimum per SKU vs the current 50-unit minimum through the distributor. The retailer's average monthly sales per SKU are 200 units. Holding cost is 22%.`,
          outcome: `The analyst models it: markup saving = £756,000/year on £4.2M annual spend. Additional holding cost of going direct (4.25 months of stock vs 0.25 months) = £196,000/year. Net saving: £560,000/year. The distributor is removed. Three months later, the retailer's OTIF drops 4 points because the distributor was absorbing stock risk that the retailer now carries alone. The full picture was right — but execution needed a stock buffer plan.`,
        },
      ],

      guidedPractice: [
        {
          question: `Foxconn manufactures iPhones for Apple. What player role does Foxconn represent in Apple's supply chain?`,
          options: [
            `A — Tier 1 supplier: they provide raw materials to Apple`,
            `B — Contract manufacturer: they assemble finished products for another company's brand under that company's specifications`,
            `C — Distributor: they move products between Apple and retailers`,
            `D — 3PL: they manage Apple's logistics network`,
          ],
          correct: 1,
          hint: `Foxconn doesn't sell under its own brand — it makes products for someone else's brand. Which player type does this describe?`,
          explanation: `B is correct. Contract manufacturers produce goods to another company's specifications and brand. Foxconn receives Apple's designs, Apple's components (sourced separately), and assembles iPhones that are sold under the Apple brand. A is wrong — Foxconn doesn't supply raw materials; it receives them and transforms them. C is wrong — distributors move finished goods between tiers, they don't manufacture. D is wrong — 3PLs provide logistics services. Foxconn is a classic contract manufacturing relationship.`,
        },
        {
          question: `A Tier 2 supplier fails. Which downstream players are most immediately and directly affected?`,
          options: [
            `A — Retailers and end customers, who immediately see empty shelves`,
            `B — Tier 1 suppliers who relied on that Tier 2 supplier for their own components`,
            `C — 3PLs who shipped the Tier 2 supplier's goods`,
            `D — Distributors who sold the finished product to retailers`,
          ],
          correct: 1,
          hint: `Who does the Tier 2 supplier sell directly to? That player is immediately downstream.`,
          explanation: `B is correct. A Tier 2 supplier sells to Tier 1 suppliers. When a Tier 2 fails, Tier 1 suppliers immediately lose components they need for their own production. The cascade then continues to the OEM (can't get sub-assemblies), then distributors (nothing to distribute), then retailers (empty shelves), then customers. A and D feel the effect eventually but not immediately — the cascade takes weeks or months to reach them. Priya: "The closer you are to Tier 2, the more you need to watch it."`,
        },
        {
          question: `A consumer goods company buys through a national distributor at 15% above direct manufacturer price. Annual purchases: £3M. The manufacturer offers direct supply at a 500-unit minimum per SKU vs the current 50-unit minimum. Holding cost: 25%. Average monthly sales per SKU: 200 units. What is the net financial case for going direct?`,
          options: [
            `A — Going direct saves £450,000 but adds approximately £31,000 in holding costs — net saving of £419,000/year`,
            `B — Going direct saves £450,000 with no additional costs`,
            `C — Going direct costs more due to higher minimum order requirements`,
            `D — Cannot calculate without knowing the number of active SKUs`,
          ],
          correct: 0,
          hint: `Calculate the markup saving first. Then calculate the additional inventory held (difference in minimums) and apply the holding cost rate.`,
          explanation: `A is correct. Markup saving: £3M × 15% = £450,000/year. At 200 units/month = 2.5 months normal stock. Direct minimum = 500 units = 2.5 months. Distributor minimum = 50 units = 0.25 months. Additional stock at direct: 2.25 months average additional inventory. At an average unit cost of £10: roughly £45,000 in additional inventory × 25% = £11,250/year. Net saving approximately £438,750. B ignores the holding cost increase. C is wrong — the savings far exceed the holding cost penalty. The distributor removal is justified — with a stock buffer plan.`,
        },
        {
          question: `A 3PL ships incorrect products to 15 retail stores. The 3PL blames incorrect product master data. The retailer blames the 3PL's WMS. Who should own the resolution process?`,
          options: [
            `A — The 3PL owns it entirely — they operated the warehouse`,
            `B — The retailer owns it entirely — master data is their responsibility`,
            `C — Both parties should convene a joint root-cause session before assigning accountability`,
            `D — Escalate immediately to both CEOs`,
          ],
          correct: 2,
          hint: `What happens when both parties assign blame before the facts are established? What does good supply chain relationship management look like?`,
          explanation: `C is correct, per CSCMP supply chain relationship management doctrine. Assigning blame before establishing facts damages the relationship and often produces incorrect accountability. A joint root-cause session (both parties present, both bringing their data) establishes what actually happened, enables fair cost-sharing, and protects the ongoing partnership. A and B both pre-assign blame without evidence — which guarantees a dispute. D is disproportionate for an operational error. The joint session is always the right first step.`,
        },
        {
          question: `A wholesaler buys 10,000 units from a manufacturer and sells them in batches of 500 to 20 different retailers. Which supply chain function is the wholesaler performing that benefits both the manufacturer and each retailer?`,
          options: [
            `A — Demand forecasting: the wholesaler predicts what retailers will order`,
            `B — Lot-size reduction and geographic consolidation: breaking large minimum orders into retailer-sized quantities while holding stock closer to the market`,
            `C — Quality control: inspecting goods before they reach retailers`,
            `D — Brand management: controlling how the product is marketed to retailers`,
          ],
          correct: 1,
          hint: `What problem does a small retailer have when buying direct from a manufacturer? What problem does the manufacturer have when serving 20 small retailers individually?`,
          explanation: `B is correct. Wholesalers perform lot-size reduction (breaking 10,000-unit manufacturer minimums into 500-unit retailer quantities) and geographic consolidation (holding stock closer to the end market). Without wholesalers, retailers would need to commit to 10,000 units they can't sell, and manufacturers would manage 20 separate small-order relationships. Both problems solved by one player in the middle. A is a planning function, not what wholesalers do. C and D are not core wholesale functions.`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-escalation`,
          scenario: `You are Maya at a medical device company. It's Wednesday 2pm. You've just discovered that your Tier 2 supplier — who provides specialised silicone tubing to your Tier 1 contract manufacturer — was acquired last week by a direct competitor of your company.

The acquisition closed last Thursday. Your Tier 1 manufacturer doesn't know. Your procurement team doesn't know.

If the competitor instructs the Tier 2 supplier to stop supplying your Tier 1 manufacturer, your production line stops in 6 weeks (current silicone stock at Tier 1 level).

You are a junior analyst. Marcus is in the building.

Write the email you send in the next 10 minutes.`,
          scoringCriteria: [
            `Email is sent to both Marcus and the Head of Procurement simultaneously`,
            `Email clearly states the acquisition fact, the Tier 2 relationship, and the 6-week risk window with specific numbers`,
            `Email identifies the specific risk: competitor control of a sole-source critical input`,
            `Email requests urgent confirmation of Tier 1's current silicone stock position`,
            `Email recommends procurement initiate alternative supplier qualification immediately`,
            `Email is factual and professional — no speculation beyond what is known`,
          ],
        },
        {
          type: `judgment-riskAssess`,
          scenario: `You are building a supply chain risk map for a new product launch. The product requires 6 components from the following supply base:

Component A: Sole-source supplier in Taiwan. Lead time: 16 weeks. No alternatives qualified.
Component B: Dual-source (60/40 split). Lead time: 8 weeks. Both suppliers rated financially stable.
Component C: Single-source in Germany. Lead time: 4 weeks. 3 qualified alternatives exist.
Component D: Commodity item. 4 suppliers available. Lead time: 2 weeks.
Component E: Contract manufacturer in Vietnam. Lead time: 12 weeks. One alternative qualified.
Component F: Packaging. 2 domestic suppliers. Lead time: 1 week.

Rank the 6 components by supply risk (1 = highest risk) and provide a one-sentence justification for your top 2 risks.`,
          scoringCriteria: [
            `Component A ranked as highest risk: sole source, 16-week lead time, no alternatives — longest recovery window with no backup option`,
            `Component E ranked second: single effective source (one alternative), 12-week lead time — significant exposure with limited recovery`,
            `Component C ranked lower despite being single-source because 3 alternatives exist and lead time is short (4 weeks)`,
            `Component B ranked low: dual-source reduces concentration risk significantly`,
            `Components D and F ranked lowest: commodity/multi-source with very short lead times`,
            `User applies the correct risk dimensions: source concentration × lead time × alternatives available`,
          ],
        },
        {
          type: `judgment-negotiation`,
          scenario: `You are a mid-level supply chain analyst preparing for a 3PL contract renewal. Current contract: £2.1M annually. The 3PL has proposed a 12% price increase (£252,000 more per year) citing labour and fuel cost increases.

You have benchmarked 3 alternative 3PLs. Their pricing for equivalent services ranges from £1.85M to £2.05M. Switching costs (IT integration, staff retraining, transition period): estimated £180,000 one-time.

Prepare your opening negotiation position. State: your counter-offer, your walk-away point, and the 2 key leverage points you will use.`,
          scoringCriteria: [
            `Counter-offer is positioned between £2.0M and £2.1M — acknowledges some increase is justified while anchoring below the ask`,
            `Walk-away point correctly identified: at any renewal price above approximately £2.15M, switching (£2.05M + £180k one-time, amortised over 3 years = ~£2.11M equivalent) becomes financially attractive`,
            `Leverage point 1: competitor bids of £1.85M–£2.05M cited as market evidence — the incumbent is above market rate`,
            `Leverage point 2: the £180k switching cost is a one-time expense, not a perpetual barrier — the incumbent cannot rely on switching friction indefinitely`,
            `Position is professional and evidence-based, not emotional`,
            `User acknowledges the 3PL's legitimate cost increase argument while countering with market data`,
          ],
        },
      ],
    },

  ], // end lessons array — lessons 5-15 continue in next file

  aggregateSimulations: {
    count: 15,
    simulatorTypes: [
      'judgment-escalation',
      'judgment-prioritisation',
      'judgment-riskAssess',
      'judgment-communication',
      'judgment-dataInterpret',
      'judgment-ethicalChoice',
      'judgment-negotiation',
    ],
    description: `No labels, no hints — random draw from all Lab 1 Foundation lessons`,
    scoringMode: `full-rubric`,
    unlockCondition: `all-lessons-complete`,
  },

  bossMode: {
    title: `Floor Assistant Challenge`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: true,
        message: `Review the lessons pointed to above and try again. You can attempt Phase 1 as many times as you need.`,
      },
    },
    // Phase 2 NOT active for Lab 1 — foundational orientation, nothing certifiable yet
    scenarios: [
      {
        id: `f15-b1`,
        situation: `You're a junior analyst at a coffee company. A fire at the primary coffee bean supplier in Brazil means no delivery for 6 months. Current bean inventory: 3 months of supply.`,
        question: `Walk through what happens to each of the five supply chain stages and what you would recommend.`,
        options: [
          {
            text: `Only sourcing is affected — production, inventory, logistics, and delivery continue normally`,
            correct: false,
            explanation: `When sourcing stops, the cascade is inevitable: production stops in 3 months when beans run out, inventory depletes, logistics has nothing to move, delivery fails. All five stages are connected. You have 3 months to find an alternative source before the whole chain stops.`,
          },
          {
            text: `Sourcing stops → production stops in 3 months when inventory depletes → logistics has nothing to ship → delivery fails. All five stages affected. Immediate action: qualify alternative suppliers in Brazil, Colombia, and Vietnam within 8 weeks.`,
            correct: true,
            explanation: `Correct. The fire at Stage 1 (sourcing) creates a cascade through all five stages on a 3-month clock. The right response is immediate: identify and qualify alternative suppliers before the 3-month inventory buffer runs out. Maya would start calling alternative suppliers on day one.`,
          },
          {
            text: `Just buy beans from someone else immediately — this is a minor problem`,
            correct: false,
            explanation: `Finding, qualifying, contracting, and onboarding a new coffee bean supplier takes time — quality checks, contract negotiation, logistics setup. 3 months may not be enough. This is a significant supply chain crisis requiring immediate escalation.`,
          },
          {
            text: `Tell customers immediately that deliveries will stop in 3 months`,
            correct: false,
            explanation: `Customer communication comes after you've assessed the problem and identified solutions. Telling customers before you've explored alternatives causes unnecessary panic and potential customer loss. Assess first, then communicate with a plan.`,
          },
        ],
      },
      {
        id: `f15-b2`,
        situation: `Maya's company's OTIF dropped from 95% to 88% in one month. Janet the CFO has called an emergency meeting and wants to know: what does OTIF measure, why does it matter to the business, and what should the target be?`,
        question: `What does Maya present?`,
        options: [
          {
            text: `OTIF measures inventory levels. Target should be 88% — it's close to the original 95%.`,
            correct: false,
            explanation: `OTIF measures whether customers receive their complete orders on time — not inventory levels. And 88% is not a target; it's a problem. At 88%, 12 in every 100 orders are late or incomplete. That's customer dissatisfaction at scale.`,
          },
          {
            text: `OTIF (On-Time In-Full) measures the percentage of customer orders delivered complete and on time. At 88%, 12 in every 100 orders are failing. Industry benchmark is 95%+. Each 1% drop below target represents measurable lost customer satisfaction and potential revenue loss. Target: restore to 95% within 60 days. Root cause must be identified immediately.`,
            correct: true,
            explanation: `Correct. OTIF is binary — an order either passes both criteria (on time AND in full) or it fails entirely. An 88% OTIF means 120 failures in every 1,000 orders. Janet needs to know the benchmark (95%+), the gap (7 points), and the plan (identify root cause, restore within 60 days).`,
          },
          {
            text: `OTIF is a supply chain vanity metric. 88% is fine for the industry.`,
            correct: false,
            explanation: `OTIF is not a vanity metric — it directly measures customer experience and is used in retailer contracts with financial penalties for failure. 88% is not fine; the industry benchmark is 95%+ and many major retailers require 97%+.`,
          },
          {
            text: `We should change how we calculate OTIF to make the number look better`,
            correct: false,
            explanation: `Changing the calculation doesn't fix the underlying problem — it hides it until it becomes a bigger crisis. Maya's job is to identify what's actually causing 12% of orders to fail and fix it.`,
          },
        ],
      },
      {
        id: `f15-b3`,
        situation: `Your company holds £10M in inventory. The finance team says holding costs are 25% per year. Janet asks: "How much is it costing us just to keep this inventory sitting here?"`,
        question: `What is the correct answer, and how does Maya explain it to a non-supply chain audience?`,
        options: [
          {
            text: `£250,000 per year`,
            correct: false,
            explanation: `25% of £10M is £2.5M, not £250k. The calculation is £10M × 0.25 = £2.5M per year.`,
          },
          {
            text: `£2.5M per year. Holding costs include warehouse rent, insurance, handling labour, capital tied up, and the risk of stock becoming obsolete or damaged. This is why reducing inventory is one of the highest-ROI activities a supply chain team can pursue.`,
            correct: true,
            explanation: `Correct. £10M × 25% = £2.5M. And the explanation is exactly right: holding cost isn't just rent — it's capital cost (money tied up that could be invested elsewhere), insurance, labour to manage the stock, and obsolescence risk. Janet will understand £2.5M/year in a way she won't understand "25% holding cost."`,
          },
          {
            text: `£10M — the full value of the inventory`,
            correct: false,
            explanation: `£10M is the value of the inventory, not the cost to hold it. Holding cost is what you pay annually to keep that inventory — rent, insurance, capital cost, etc. It's 25% of the inventory value per year, not the inventory value itself.`,
          },
          {
            text: `Nothing — inventory is an asset, so it doesn't cost anything to hold it`,
            correct: false,
            explanation: `Inventory is listed as an asset on the balance sheet, but holding it costs real money every day — warehouse space, insurance, people to manage it, and the opportunity cost of capital tied up in stock that hasn't sold. £2.5M per year is a very real expense.`,
          },
        ],
      },
      {
        id: `f15-b4`,
        situation: `A customer orders 100 units. Maya's company has 120 in stock. 100 units are shipped. They arrive 3 days after the promised delivery date.`,
        question: `What is the OTIF result for this order, and why?`,
        options: [
          {
            text: `100% OTIF — the customer received everything they ordered`,
            correct: false,
            explanation: `OTIF requires both criteria to pass: On-Time AND In-Full. The customer received the full quantity (In-Full ✓) but the delivery was late (On-Time ✗). The order fails OTIF entirely. There is no partial credit in OTIF measurement.`,
          },
          {
            text: `0% OTIF — because the delivery was late, the order fails the on-time criterion and therefore fails OTIF entirely, regardless of quantity`,
            correct: true,
            explanation: `Correct. OTIF is binary. Late + correct quantity = OTIF fail. This is why OTIF is such a demanding metric — it forces supply chains to get both dimensions right simultaneously. A delivery that's 3 days late on a Monday may have caused the customer to miss a production run or a retail restocking window. The failure is real even if the units eventually arrived.`,
          },
          {
            text: `50% OTIF — half credit for delivering the right quantity`,
            correct: false,
            explanation: `OTIF doesn't award partial credit. It's a yes/no metric: either an order passes both criteria or it doesn't. No half marks.`,
          },
          {
            text: `It depends on whether the customer complained`,
            correct: false,
            explanation: `OTIF is calculated from objective data — promised delivery date vs actual delivery date, ordered quantity vs delivered quantity. Customer complaints are separate. The order is late regardless of whether the customer noticed or called.`,
          },
        ],
      },
    ],
  },
},
