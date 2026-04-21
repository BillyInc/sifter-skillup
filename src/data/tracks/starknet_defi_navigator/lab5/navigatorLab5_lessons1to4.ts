// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 5 — DCA AND AUTOMATION · LESSONS 1–4
// Written to sim_instructions_v3 + Lab 11 standard
// Portfolio push: Lab 5 Phase 2 Boss
// Cross-chain note added at boss level (Ethereum/Solana equivalents)

export const LAB5_LESSONS_1_TO_4 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — The Mathematics of DCA
// ─────────────────────────────────────────────────────────────
{
  id: 'mathematics-of-dca',
  title: 'The Mathematics of Dollar-Cost Averaging',
  explanation: `
In 1987, the Dow Jones Industrial Average fell 22.6% in a single day — Black Monday. Investors who had been buying stocks weekly for the previous year found that their average purchase price was far lower than the pre-crash peak. When the market recovered over the following years, their systematic buying had positioned them far better than those who had tried to time the market and ended up sitting in cash, waiting for the perfect moment that never clearly arrived.

Investing a fixed dollar amount every week — $100 on Monday, every Monday, regardless of whether the price is up or down — is called Dollar-Cost Averaging, or DCA. The mathematics behind it are simple but counterintuitive: because you spend the same dollar amount each period, you automatically buy more units when the price is low and fewer when the price is high. Over time, your average cost per unit is lower than the average price over the same period.

Add up every weekly price over a period and divide by the number of weeks. That average — the time-weighted average price, or TWAP — is the benchmark your DCA average cost will typically beat. Your DCA average cost will almost always be below the TWAP, because the fixed-amount mechanic allocates more capital during cheaper periods. The divergence between your average cost and the TWAP increases with price volatility — higher volatility, greater DCA advantage.

The exception matters: in a strongly and consistently uptrending market, a lump sum invested at the beginning outperforms DCA because the asset is consistently more expensive over time. DCA is most valuable in volatile, sideways, or downtrending markets where the averaging effect captures lower prices.

Invest $10,000 all at once on the day before a 40% crash — your entry is terrible and no amount of future performance recovers it easily. Spread the same $10,000 across ten weekly purchases — the crash becomes one of ten entries, not the only one. This reduction in the range of possible outcomes is called variance reduction. A lump sum investment has full exposure to the entry price risk — if you invest $10,000 the day before a 40% crash, your entry is terrible. DCA spreads that entry risk across many periods. The expected return is slightly lower than a perfectly timed lump sum, but the variance (range of possible outcomes) is dramatically lower. For most people managing real capital, lower variance is worth the trade-off.

On Starknet, DCA is not just a manual discipline — it is an automated on-chain order. The automation removes the largest source of DCA failure: human inconsistency. A manually executed DCA strategy fails when the investor skips a period because "the price looks bad right now." Automated on-chain DCA executes regardless.
  `.trim(),
  visualPrompt: 'Three-panel chart: Panel 1 shows price line oscillating over 12 periods with fixed dollar amount bars below — more units bought at lower prices, fewer at higher. Panel 2: lump sum vs DCA cumulative unit count comparison showing DCA advantage. Panel 3: variance comparison chart showing tight DCA return distribution vs wide lump sum distribution.',
  visualType: 'static',
  visualUrl: 'dca-mathematics-chart',
  examples: [
    {
      contextTag: '[DCA vs lump sum, volatile market, concrete numbers]',
      context: 'Two investors each allocate $1,200 to STRK. Investor A buys $1,200 all at once in month 1. Investor B buys $100/month for 12 months. STRK monthly prices: $0.80, $0.65, $0.50, $0.45, $0.60, $0.75, $0.90, $1.00, $0.85, $0.70, $0.65, $0.60.',
      scenario: 'Both investors calculate their total STRK holdings after 12 months.',
      outcome: 'Investor A: $1,200 / $0.80 = 1,500 STRK at $0.60 end price = $900 (loss of $300). Investor B monthly: 125+154+200+222+167+133+111+100+118+143+154+167 = 1,794 STRK. Average cost: $1,200 / 1,794 = $0.669/STRK. Value at $0.60: $1,076 (loss of $124). DCA reduced the loss from $300 to $124 purely through the averaging mechanism — no market timing required.',
    },
    {
      contextTag: '[TWAP vs DCA average cost, variance reduction]',
      context: 'STRK prices over 6 weeks: $1.00, $0.80, $0.60, $0.80, $1.00, $1.20. TWAP = ($1.00+$0.80+$0.60+$0.80+$1.00+$1.20) / 6 = $0.90.',
      scenario: 'A DCA investor buys $600/week for 6 weeks. Calculate their average cost and compare to TWAP.',
      outcome: 'Units purchased: 600+750+1000+750+600+500 = 4,200 STRK. Average cost: $3,600 / 4,200 = $0.857/STRK. TWAP: $0.90. DCA average cost ($0.857) is 4.8% below TWAP — the fixed-amount mechanism automatically bought more at $0.60 (1,000 units) than at $1.20 (500 units). This sub-TWAP entry is the mathematical core of the DCA advantage.',
    },
    {
      contextTag: '[Lump sum wins in bull market, honest comparison]',
      context: 'STRK prices over 6 weeks: $0.80, $0.85, $0.90, $0.95, $1.00, $1.05. A consistently uptrending market.',
      scenario: 'Compare lump sum $3,000 at week 1 vs DCA $500/week for 6 weeks.',
      outcome: 'Lump sum: $3,000 / $0.80 = 3,750 STRK. Value at $1.05: $3,937.50. DCA units: 625+588+556+526+500+476 = 3,271 STRK. Value at $1.05: $3,434.55. Lump sum wins by $503 because every subsequent week was more expensive — the DCA investor bought at progressively higher prices. DCA is not universally superior: it underperforms lump sum in consistently uptrending markets by design.',
    },
  ],
  keyTakeaway: 'Because a fixed dollar amount buys more units when the price is low, your average cost per unit is mathematically guaranteed to be below the average price over the same period — in any market that is not continuously rising.',
  guidedPractice: [
    {
      question: 'You DCA $200/week for 4 weeks. STRK prices: $1.00, $0.80, $0.60, $0.80. How many total STRK do you hold and what is your average cost?',
      options: [
        'A. 800 STRK at $1.00 average — you spent $800 total',
        'B. 200+250+333+250 = 1,033 STRK. Average cost: $800 / 1,033 = $0.774',
        'C. 800 STRK at $0.80 — the average of the four prices',
        'D. 1,033 STRK at $0.80 — the average price directly',
      ],
      correct: 1,
      hint: 'Calculate units each week: $200 / price. Sum units. Average cost = total dollars / total units.',
      explanation: 'B is correct. Week 1: 200 STRK. Week 2: 250. Week 3: 333. Week 4: 250. Total: 1,033. Average cost: $800 / 1,033 = $0.774. The TWAP is ($1.00+$0.80+$0.60+$0.80)/4 = $0.80. Your average cost ($0.774) is below TWAP ($0.80) — the DCA advantage from buying more at $0.60.',
    },
    {
      question: 'Why is your DCA average cost typically below the time-weighted average price (TWAP)?',
      options: [
        'A. DCA orders receive a protocol discount not available to lump sum buyers',
        'B. Fixed dollar amounts buy more units at low prices and fewer at high prices — mathematically weighting your average cost toward cheaper periods',
        'C. DCA orders execute at yesterday\'s price, giving a systematic discount',
        'D. DCA averages out to TWAP exactly — neither above nor below',
      ],
      correct: 1,
      hint: 'With $100 fixed: how many units at $0.50? How many at $2.00? Which period gets more capital weight?',
      explanation: 'B is correct. $100 at $0.50 buys 200 units. $100 at $2.00 buys 50 units. Your total cost is $200 for 250 units ($0.80 average) — but TWAP of $0.50 and $2.00 is $1.25. Your average cost ($0.80) is far below TWAP ($1.25) because you bought 4× more units during the cheap period. The fixed-dollar mechanism is a built-in value-weighting system.',
    },
    {
      question: 'In which market condition does lump sum investing outperform DCA?',
      options: [
        'A. Volatile markets with large price swings',
        'B. Sideways or range-bound markets',
        'C. Consistently and strongly uptrending markets where every future purchase is more expensive than today',
        'D. Bear markets where prices are declining',
      ],
      correct: 2,
      hint: 'If every future week is more expensive than now, what is the optimal strategy?',
      explanation: 'C is correct. In a consistent uptrend, every future DCA purchase is at a higher price than the initial lump sum entry. The DCA investor pays progressively more per unit over time. The lump sum investor captured the lowest price (the entry point) with all their capital. DCA wins in volatile and downtrending markets; lump sum wins in straight-up bull markets.',
    },
    {
      question: 'What is variance reduction and why does it matter for DCA?',
      options: [
        'A. DCA reduces the total return variance by guaranteeing a specific return percentage',
        'B. DCA spreads entry risk across many periods — reducing the range of possible outcomes. A bad single entry point (lump sum on the day before a crash) becomes just one of many entry points, not the only one.',
        'C. Variance reduction means DCA eliminates all downside risk from price declines',
        'D. Variance reduction refers to the protocol fee savings from automated orders',
      ],
      correct: 1,
      hint: 'Think about the difference in outcomes: what happens if you invest your entire $10,000 the day before a 50% crash vs spreading it across 10 weeks?',
      explanation: 'B is correct. With lump sum: invest $10,000 the day before a 50% crash — you have $5,000. With DCA over 10 weeks: you invested $1,000 before the crash and $9,000 during or after it — your average entry is far better. The worst-case lump sum outcome is terrible. The worst-case DCA outcome over the same period is meaningfully less bad. Variance reduction is not eliminating losses — it is making the worst outcomes less catastrophic.',
    },
    {
      question: 'A friend says: "I\'ll DCA next month when the price drops. I\'m waiting for a better entry." Why does this undermine the DCA strategy?',
      options: [
        'A. It does not — waiting for a lower price before starting DCA is optimal',
        'B. Waiting to start DCA is market timing — the exact behavior DCA is designed to eliminate. The strategy only works through consistent execution regardless of price.',
        'C. DCA only works if you start immediately — a one-month delay makes it mathematically invalid',
        'D. Waiting is fine as long as you double the first deposit to make up for the skipped period',
      ],
      correct: 1,
      hint: 'What is the foundational principle of DCA? What does "waiting for a better price" require the investor to know?',
      explanation: 'B is correct. "Waiting for a better price" requires knowing what the future price will be — which is market timing. DCA works precisely because it removes the need to predict prices. A friend who waits for "a lower price to start DCA" is making a prediction that the price will fall — if it rises instead, they miss the entire period at a lower price. Start DCA on a fixed schedule and let the math work over time.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Compare three strategies for deploying $5,000 into STRK over 10 weeks. STRK weekly prices: $0.80, $0.72, $0.65, $0.58, $0.50, $0.62, $0.75, $0.85, $0.78, $0.70. Strategy A: lump sum $5,000 at week 1. Strategy B: DCA $500/week for 10 weeks. Strategy C: DCA $500/week but skips weeks 1 and 2 (waiting for "a better price"). Calculate total STRK for each. Final price: $0.70. Which strategy has the highest value?',
      scoringCriteria: [
        'Strategy A: $5,000 / $0.80 = 6,250 STRK. Value at $0.70: $4,375.',
        'Strategy B: 625+694+769+862+1000+806+667+588+641+714 = 7,366 STRK. Value: $5,156.',
        'Strategy C: skips weeks 1-2 ($1,000 undeployed), weeks 3-10: 769+862+1000+806+667+588+641+714 = 6,047 STRK + $1,000 cash. Total: $5,233.',
        'Ranking: C slightly edges B due to lower prices in weeks 3-10 but only because prices happened to fall. B is the correct strategy — C got lucky.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user plans to DCA $300/week into STRK for 52 weeks ($15,600 total). They currently have exactly $15,600 available. They plan to transfer all $15,600 to a DCA protocol upfront. Identify two risks with this approach and propose a better structure.',
      scoringCriteria: [
        'Risk 1: Smart contract risk — $15,600 locked in a DCA protocol contract from day 1. A hack at week 2 loses 50 weeks of undeployed capital.',
        'Risk 2: Opportunity cost — $15,600 locked cannot be used if an urgent opportunity arises.',
        'Better structure: keep $15,600 in a Vesu USDC supply position earning ~5% APY. Transfer $300/week to the DCA order as each cycle executes — the undeployed capital earns yield while waiting.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A colleague who manages a traditional equity portfolio understands pound-cost averaging (the UK equivalent of DCA in stock markets). Explain how on-chain DCA on Starknet differs from their experience — in 3 sentences covering: what is automated, what is not needed, and what new risk exists that traditional PCA does not have.',
      scoringCriteria: [
        'What is automated: the execution itself — no need to log into a brokerage and place the order each week. The protocol executes on-chain on schedule.',
        'What is not needed: a broker, a brokerage account, identity verification, or minimum account balance.',
        'New risk: smart contract risk — the DCA order exists in code on Starknet, not with a regulated custodian. If Starknet or the DCA protocol has a bug, capital at risk differs from a regulated broker.',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — AVNU DCA Mechanics
// ─────────────────────────────────────────────────────────────
{
  id: 'avnu-dca-mechanics',
  title: 'AVNU DCA: Setting Up Automated Buying',
  explanation: `
Every month, a standing order at your bank transfers $200 from your current account to your investment account — automatically, on schedule, without you logging in. You set it up once three years ago and have not thought about it since. AVNU DCA on Starknet does the same thing for token purchases: set it up once, and the protocol buys on schedule forever.

AVNU DCA creates discrete recurring swap orders. You specify four things: the token you are selling (typically USDC), the token you are buying (STRK or any supported asset), the amount per cycle, and the frequency (daily, weekly, or custom intervals). The protocol executes each cycle at the then-current market price routed through AVNU's aggregator — finding the best available price across Starknet DEXs at execution time.

Price bounds add strategic precision. A minimum price bound says: "do not execute this cycle if the token is below $X." This prevents buying into a potential death spiral — if STRK falls below your floor, the cycle is skipped and your USDC stays unspent. A maximum price bound says: "do not execute if the token is above $X" — useful for systematic buyers who want to avoid buying at what they consider excessive valuations.

The previewCycle() function is your look-before-you-execute tool. Calling wallet.dca().previewCycle({ sellToken: USDC, buyToken: STRK, sellAmount: "100" }) returns the estimated STRK you would receive in the next cycle at current prices. This is a read-only call — no gas, no transaction. Use it to sanity-check your parameters before creating the order.

Managing active orders uses getOrders() to list all your active DCA orders with their IDs, parameters, and status. cancel() stops a specific order by ID. The unspent portion of your configured sell amount stays in your wallet if you cancel mid-cycle.

One design principle: DCA is most effective when funded from a yield-bearing position. Keep your USDC in Vesu earning 5%+ APY and transfer only the weekly DCA amount when the cycle executes — your undeployed capital earns yield rather than sitting idle waiting to be spent.
  `.trim(),
  visualPrompt: 'AVNU DCA order creation UI: four fields (sell token, buy token, amount per cycle, frequency). Below: timeline showing weekly execution bars with price bounds — green bars executed, yellow bars skipped (above max bound), red bar skipped (below min bound). Side panel: previewCycle() output showing estimated tokens received.',
  visualType: 'static',
  visualUrl: 'avnu-dca-interface',
  examples: [
    {
      contextTag: '[Setting up a DCA order, complete walkthrough]',
      context: 'Priya wants to accumulate STRK systematically. She has $2,400 USDC and wants to DCA $200/week for 12 weeks.',
      scenario: 'Priya calls wallet.dca().previewCycle({ sellToken: USDC, buyToken: STRK, sellAmount: "200" }). Returns: amountOut: 247,000,000 (247 STRK at 6 decimals), priceImpact: 0.04%. She creates the order.',
      outcome: 'The order creates with ID ord_0x4a2b...f3. Each subsequent Tuesday (her chosen day), AVNU automatically swaps $200 USDC to STRK at the best available price. In week 4, STRK drops to $0.60 — she buys 333 STRK that week vs the 247 at current price. In week 9, STRK rises to $1.10 — she buys only 182 STRK. The automation runs without her involvement.',
    },
    {
      contextTag: '[Price bounds in action, downside protection]',
      context: 'An investor sets up a DCA: $500/week USDC to STRK, minimum price bound $0.40/STRK, maximum $1.50/STRK. Over 8 weeks, STRK moves significantly.',
      scenario: 'Week 3: STRK at $0.35 — below minimum. Week 7: STRK at $1.65 — above maximum. Both cycles are candidates for skipping.',
      outcome: 'Week 3 skipped — STRK below $0.40 floor. The investor\'s $500 USDC stays in their wallet unused that week. Week 7 skipped — STRK above $1.50 ceiling. Six of eight cycles executed normally. The investor accumulated STRK only within their value range, avoiding both a potential crash entry and a potential bubble entry. The two skipped weeks\' $1,000 USDC remains liquid.',
    },
    {
      contextTag: '[DCA funded from lending yield, capital efficiency]',
      context: 'A user has $12,000 USDC. Instead of putting all $12,000 into a DCA protocol, they supply $12,000 to Vesu at 5.2% APY and create a weekly $100 USDC DCA order into STRK.',
      scenario: 'Each week, $100 is withdrawn from Vesu and used for the DCA cycle. The remaining $11,900 continues earning Vesu yield.',
      outcome: 'Over 52 weeks: $5,200 accumulated into STRK via DCA. Vesu yield on decreasing balance: approximately $12,000 × 5.2% × (1 - 0.5 × (5,200/12,000)) = ~$491 in yield. The DCA strategy generated approximately $491 in free USDC from Vesu yield — effectively funding about 5 extra DCA cycles that cost the user nothing. The undeployed capital worked while waiting to be spent.',
    },
  ],
  keyTakeaway: 'Between each DCA cycle, your unspent USDC earns nothing sitting idle in a wallet — deploying it into a Vesu supply position turns the waiting time into additional yield.',
  guidedPractice: [
    {
      question: 'previewCycle() returns amountOutBase: 183,000,000 for STRK (which has 18 decimals on Starknet). How many STRK will you receive?',
      options: [
        'A. 183,000,000 STRK',
        'B. 0.000000000183 STRK',
        'C. 183 STRK — but wait, STRK has 18 decimals so it is 183,000,000 / 10^18 = 0.000000183 STRK',
        'D. Depends on STRK decimals — if 18 decimals: 183,000,000 / 10^18 = 0.000000183 STRK. If 6 decimals: 183 STRK.',
      ],
      correct: 3,
      hint: 'Token decimal places determine the conversion. STRK has 18 decimals. USDC has 6 decimals. The base unit number must be divided by 10^decimals.',
      explanation: 'D is correct — and the answer matters. STRK uses 18 decimal places: 183,000,000 / 10^18 = 0.000000183 STRK. This would indicate either a very small swap amount or a possible parameter error. USDC uses 6 decimals: if this were a USDC output, 183,000,000 / 10^6 = 183 USDC. Always verify which token\'s decimals apply. The Starkzap SDK provides Amount.fromRaw(amountOutBase, STRK) to handle this automatically.',
    },
    {
      question: 'You set a DCA with minimum price bound $0.55/STRK. This week STRK trades at $0.48. What happens?',
      options: [
        'A. AVNU executes at $0.48 — price bounds are only advisory',
        'B. This cycle is skipped — STRK is below your minimum bound. Your sell amount stays unspent.',
        'C. The entire DCA order is cancelled when price hits the minimum',
        'D. AVNU waits until STRK reaches $0.55 within the week, then executes',
      ],
      correct: 1,
      hint: 'Minimum price bound = do not execute if price is below this floor. What is the outcome when the floor is breached?',
      explanation: 'B is correct. The minimum price bound is a hard skip condition for that cycle — not a cancellation of the whole order and not a wait-and-execute within the period. The cycle is skipped, your $X USDC stays in your wallet, and the DCA continues next week regardless of whether STRK has recovered above $0.55.',
    },
    {
      question: 'Why should you call previewCycle() before creating a DCA order?',
      options: [
        'A. previewCycle() locks in the price for your first execution',
        'B. It is a gas-free read-only call that shows the estimated output at current prices — letting you verify the amount is sensible before committing to the recurring order',
        'C. previewCycle() is required by the AVNU protocol before any DCA order can be created',
        'D. It checks that your wallet has sufficient USDC balance for all cycles',
      ],
      correct: 1,
      hint: 'What is the cost of calling previewCycle()? What does it return?',
      explanation: 'B is correct. previewCycle() is a read-only function — no gas, no transaction, no state change. It simulates the next cycle at current market prices and returns expected output. This lets you catch: wrong decimal assumptions (expecting 247 STRK but getting 0.000000247), unexpected price impact, or wrong token order. A 2-second check before a recurring order that runs for months is good practice.',
    },
    {
      question: 'What is the advantage of keeping your DCA sell-amount in Vesu rather than idle in your wallet?',
      options: [
        'A. Vesu automatically transfers funds to AVNU DCA on schedule',
        'B. The undeployed capital earns lending yield while waiting to be spent — turning idle capital into a yield-generating position between DCA cycles',
        'C. Vesu offers lower DCA execution fees than holding USDC in a wallet',
        'D. AVNU DCA requires funds to be in Vesu to execute',
      ],
      correct: 1,
      hint: 'Capital sitting idle in a wallet earns 0%. Capital in Vesu earns 5%+. What happens to the capital between DCA cycles?',
      explanation: 'B is correct. Between DCA cycles, your unspent USDC earns nothing in a wallet. In Vesu at 5.2% APY, a $10,000 balance waiting to be spent over 20 weeks earns approximately $200 in yield during that period — effectively subsidising ~2 extra DCA cycles at $100 each. The integration of lending yield with DCA execution is a capital efficiency technique used by experienced DeFi participants.',
    },
    {
      question: 'You have an active DCA order and want to stop it. You call wallet.dca().cancel({ orderId: "ord_0x4a2b" }). What happens to unspent funds for the current cycle?',
      options: [
        'A. Unspent funds are forfeited — the protocol keeps them as a cancellation fee',
        'B. The current cycle executes immediately before cancellation',
        'C. The DCA order stops and any unspent sell amount for future cycles stays in your wallet — cancellation does not forfeit funds',
        'D. Funds are returned after a 24-hour delay for security',
      ],
      correct: 2,
      hint: 'DCA protocols do not custody your full sell amount upfront. Where does your USDC sit between cycles?',
      explanation: 'C is correct. AVNU DCA does not lock all your future cycle funds upfront — each cycle pulls the specified amount at execution time. When you cancel, the order simply stops. No future cycles execute. Any USDC that was not yet pulled for an executed cycle remains in your wallet. There are no cancellation fees and no delay.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You set up AVNU DCA: $150 USDC/week for 8 weeks into STRK. Week prices: $0.80, $0.90, $0.70, $0.55, $0.65, $0.80, $0.95, $1.10. Min price bound: $0.50, Max: $1.00. Calculate: (1) which weeks execute, (2) STRK accumulated per executed week, (3) total STRK, (4) effective average cost, (5) total USDC spent.',
      scoringCriteria: [
        'All weeks execute — all prices between $0.50 and $1.00 (week 8 at $1.10 is above max — skipped)',
        'Weeks 1-7 execute: 187.5+167+214+273+231+188+158 = 1,418.5 STRK',
        'Week 8 skipped (price $1.10 > $1.00 max bound)',
        'Total spent: $150 × 7 = $1,050',
        'Average cost: $1,050 / 1,418.5 = $0.740/STRK vs TWAP of weeks 1-7: $0.793',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user creates an AVNU DCA: $500/week for 52 weeks ($26,000 total). They put all $26,000 into the DCA protocol upfront. Three months later the DCA protocol is exploited and loses 60% of locked funds. They have spent $6,000 on 12 cycles. How much do they lose? How much would they have lost with the Vesu-funded approach?',
      scoringCriteria: [
        'Full upfront: $26,000 - $6,000 spent = $20,000 still locked. 60% loss: $12,000 lost.',
        'Vesu-funded: each week $500 withdrawn from Vesu for that week\'s cycle. At exploit: only current week\'s $500 might be in the DCA protocol. Loss: maximum $500.',
        'Difference: $12,000 vs $500. The Vesu-funded approach limits exposure to one cycle\'s amount at any time.',
        'Correct conclusion: never lock more than necessary into any single DeFi protocol. Fund DCA from a separate yield-bearing position.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Your manager asks you to explain AVNU DCA to the rest of the team in a 30-second verbal summary. Write the script. It must cover: what it does, why it exists, and one thing the listener needs to watch out for.',
      scoringCriteria: [
        'What it does: correctly described as automated recurring token purchases at fixed intervals',
        'Why it exists: removes timing decisions and human inconsistency from accumulation',
        'Watch out for: either price bounds being too tight (skipping too many cycles) or funding risk if fronting all capital upfront to the protocol',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Ekubo TWAMM
// ─────────────────────────────────────────────────────────────
{
  id: 'ekubo-twamm',
  title: 'Ekubo TWAMM: Continuous On-Chain Execution',
  explanation: `
A dripping tap and a bucket of water deliver the same total volume — but a dripping tap fills an aquarium so gradually that the fish barely notice the water level changing, while dumping a bucket disturbs everything. TWAMM (Time-Weighted Automated Market Maker) is the dripping tap for large token orders on Starknet.

Discrete DCA (like AVNU) executes once per period — a weekly bucket. TWAMM executes continuously — every block, all day, every day, for the full order duration. On Starknet with approximately 30-second block times, a 30-day TWAMM order executes approximately 86,400 micro-swaps. Each individual execution is so small that price impact per swap approaches zero.

Ekubo's TWAMM implementation uses a mathematical model that accumulates swap activity between interactions rather than actually executing a transaction for each block. When you check your TWAMM position or interact with the pool, the contract calculates the total effect of all accumulated micro-swaps since your last interaction in a single computation. This is how continuous execution is achieved without requiring 86,400 actual on-chain transactions.

TWAMM is most valuable for large orders where even weekly discrete execution would create detectable market impact. A $500,000 order split into $71,428 weekly chunks is detectable and front-runnable by arbitrageurs who monitor on-chain flows. The same $500,000 split into 86,400 micro-swaps of $5.79 each is economically impossible to front-run — no single execution is large enough to profit from.

The trade-off vs AVNU DCA: TWAMM offers lower price impact and less front-running exposure, but less flexibility. You cannot set price bounds (it executes continuously regardless of price). You cannot easily modify the order mid-stream. For most individual investors, AVNU DCA's simplicity and price bound flexibility are preferable. TWAMM is the institutional tool for orders above $100,000 where minimising market impact is the primary objective.
  `.trim(),
  visualPrompt: 'Side-by-side comparison: AVNU DCA (weekly discrete bars, each bar is one large transaction, arbitrageur icon detecting predictable timing) vs TWAMM (thousands of tiny continuous bars, arbitrageur icon showing no detectable pattern, near-zero impact per bar). Below: order size threshold guide showing when to use each.',
  visualType: 'static',
  visualUrl: 'twamm-vs-dca-comparison',
  examples: [
    {
      contextTag: '[TWAMM for large protocol treasury purchase]',
      context: 'A Starknet DeFi protocol\'s treasury wants to buy $400,000 of STRK over 45 days for ecosystem development.',
      scenario: 'Option A: AVNU DCA at $8,889/day — detectable daily purchase pattern. Option B: Ekubo TWAMM over 45 days — continuous micro-execution.',
      outcome: 'AVNU DCA daily price impact: ~1.8% per $8,889 transaction in current market depth. TWAMM effective price impact per execution: ~0.002% — economically negligible. Additionally, sophisticated arbitrageurs who monitor large DeFi protocols can detect and front-run a predictable $8,889/day buy from a treasury address. TWAMM\'s micro-execution makes front-running unprofitable. The treasury chooses TWAMM for both lower impact and stealth.',
    },
    {
      contextTag: '[TWAMM accumulation mechanism, no real transactions per block]',
      context: 'A user creates a TWAMM order: $10,000 USDC over 30 days. They expect to see 86,400 transactions in their Voyager history.',
      scenario: 'After 10 days, they check Voyager and see only 3 transactions: the order creation, one position check, and one partial claim.',
      outcome: 'The TWAMM model accumulates swap state mathematically between interactions. The "86,400 micro-swaps" are not individual blockchain transactions — they are a continuous mathematical function. When you interact with the position (checking, claiming, modifying), the contract computes all accumulated swaps since the last interaction in one calculation. Gas efficiency: only real user interactions cost gas, not each micro-swap.',
    },
    {
      contextTag: '[TWAMM vs DCA choice, $50,000 order]',
      context: 'A user has $50,000 to deploy into STRK over 60 days. They compare TWAMM and AVNU DCA.',
      scenario: 'AVNU DCA at $833/week: 8 cycles, each detectable on-chain. TWAMM over 60 days: continuous, 172,800 mathematical micro-executions.',
      outcome: '$50,000 at $833/week: each weekly $833 purchase has approximately 0.2% price impact in a $5M liquidity pool — acceptable. The predictability concern is present but minor for $833. TWAMM is technically better but the simplicity advantage of AVNU DCA (price bounds, easy cancellation, visible cycle history) outweighs the 0.2% impact advantage. Recommendation: AVNU DCA at this size. Reserve TWAMM for orders above $100,000-$200,000.',
    },
  ],
  keyTakeaway: 'A weekly $10,000 buy is a detectable, front-runnable event — the same $10,000 spread across every block for seven days is economically impossible to front-run because each individual execution is worth less than the gas required to attack it.',
  guidedPractice: [
    {
      question: 'What is the fundamental difference in execution between AVNU DCA and Ekubo TWAMM?',
      options: [
        'A. AVNU DCA uses USDC; TWAMM uses STRK as the base currency',
        'B. AVNU DCA executes discrete swaps at fixed intervals (weekly/daily); TWAMM executes mathematically continuously across every block',
        'C. AVNU DCA is for buying; TWAMM is only for selling',
        'D. AVNU DCA costs more gas; TWAMM is gasless',
      ],
      correct: 1,
      hint: 'Think about the dripping tap vs bucket analogy. Which is discrete and which is continuous?',
      explanation: 'B is correct. AVNU DCA is discrete — one swap per period. TWAMM is continuous — the swap is spread mathematically across every block for the order duration. AVNU DCA creates a detectable on-chain event at each execution. TWAMM creates one order event and then accumulates swaps silently until the next user interaction.',
    },
    {
      question: 'Why does TWAMM not create a real blockchain transaction for each micro-swap?',
      options: [
        'A. Starknet blocks are too slow to accommodate that many transactions',
        'B. TWAMM uses a mathematical accumulation model — swap effects are computed cumulatively when users interact, not as individual on-chain transactions per block',
        'C. The Starknet network blocks TWAMM transactions to prevent spam',
        'D. TWAMM batches all micro-swaps into monthly settlement transactions',
      ],
      correct: 1,
      hint: 'If TWAMM created 86,400 transactions per month, what would the gas cost be? How does the protocol avoid this?',
      explanation: 'B is correct. 86,400 actual transactions would be prohibitively expensive and would congest the network. Ekubo\'s TWAMM uses a mathematical model that represents continuous accumulation as a function of time. When a user interacts with the position (check, claim, modify), the contract evaluates the function for the elapsed time period and applies the cumulative swap effect in one calculation.',
    },
    {
      question: 'A sophisticated arbitrageur monitors on-chain flows looking for large predictable buys to front-run. Which strategy is harder to exploit?',
      options: [
        'A. AVNU DCA at $10,000/week — detectable weekly transaction',
        'B. TWAMM over 30 days — continuous accumulation with no detectable per-block signature',
        'C. They are equally exploitable — both create the same on-chain pattern',
        'D. AVNU DCA is harder to exploit because its timing is random',
      ],
      correct: 1,
      hint: 'Front-running requires knowing when and how much the target order will execute. Which mechanism makes this harder?',
      explanation: 'B is correct. TWAMM\'s micro-executions per block are mathematically too small to front-run profitably — each execution is $0.23 on a $10,000/30-day order. Front-running costs gas and price impact. The potential profit ($0.001 on a $0.23 execution) does not cover the cost of submitting a front-running transaction. AVNU DCA\'s weekly $10,000 execution is visible on-chain and large enough that front-running is economically worthwhile for sophisticated bots.',
    },
    {
      question: 'What is the primary trade-off of using TWAMM instead of AVNU DCA for a $50,000 order?',
      options: [
        'A. TWAMM has higher fees than AVNU DCA',
        'B. TWAMM offers lower price impact but less flexibility — no price bounds, harder to modify mid-order, less intuitive status tracking',
        'C. TWAMM is slower — it takes longer to acquire the target amount',
        'D. TWAMM requires a minimum of $1,000,000 to use',
      ],
      correct: 1,
      hint: 'TWAMM\'s advantages are clear. What does it sacrifice compared to AVNU\'s discrete model?',
      explanation: 'B is correct. TWAMM cannot be configured with min/max price bounds — it executes regardless of current price. It is harder to cancel cleanly mid-execution. The continuous accumulation model makes it less intuitive to track progress. For a $50,000 order, the price impact advantage of TWAMM may not be worth the reduced flexibility compared to AVNU DCA\'s discrete, configurable, easily cancellable model.',
    },
    {
      question: 'At what order size does the case for TWAMM over AVNU DCA become compelling?',
      options: [
        'A. Any size above $1,000',
        'B. Approximately $100,000–$200,000+, where weekly discrete execution creates measurable market impact and front-running becomes economically worthwhile for bots',
        'C. Only for orders above $10,000,000',
        'D. TWAMM is never preferable — AVNU DCA is always better',
      ],
      correct: 1,
      hint: 'At what order size does discrete weekly execution create meaningful market impact? At what size does front-running become profitable for sophisticated bots?',
      explanation: 'B is correct. Below $100,000, weekly AVNU DCA creates manageable price impact (typically under 0.5%) and front-running profit margins are thin. Above $100,000–$200,000, weekly executions start creating 1–3% impact that TWAMM would reduce to near-zero, and the front-running profit from a predictable weekly $20,000+ buy becomes attractive for bots. The crossover point depends on pool liquidity depth but $100,000–$200,000 is a reasonable general threshold.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A protocol treasury executes a $300,000 STRK purchase. Compare three approaches: (1) Single transaction: 25% price impact. (2) AVNU DCA $10,000/week for 30 weeks: 0.8% per cycle. (3) Ekubo TWAMM over 30 weeks: 0.003% per micro-execution. Calculate total price impact cost for each approach and recommend.',
      scoringCriteria: [
        'Option 1: $300,000 × 25% = $75,000 in price impact cost',
        'Option 2: $300,000 × 0.8% = $2,400 in total impact across cycles (approximately)',
        'Option 3: $300,000 × 0.003% per execution. Negligible — effectively zero per execution, negligible total',
        'Recommendation: TWAMM at this scale — $72,600 saving vs single transaction, $2,400 additional saving vs AVNU DCA',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user sets up a TWAMM order: $80,000 USDC over 60 days buying STRK. Midway through (day 30), STRK drops 45% from $0.80 to $0.44. The user wants to pause the order. What challenge do they face with TWAMM vs what they could do with AVNU DCA price bounds? What are their actual options?',
      scoringCriteria: [
        'TWAMM challenge: no price bounds — the order continues executing at $0.44 regardless of price view',
        'AVNU DCA comparison: a minimum price bound of $0.50 would have automatically paused at $0.44',
        'Actual options: (1) cancel the TWAMM order and restart with AVNU DCA with a $0.50 min bound, (2) let it continue — the lower price increases STRK accumulation rate (DCA benefit), (3) cancel and re-evaluate strategy',
        'No option is clearly wrong — depends on conviction on STRK price recovery',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'An institutional investor who uses TWAP (Time-Weighted Average Price) algorithms on traditional equity markets asks about Ekubo TWAMM. Draw the parallel in 4 sentences — what is the same, what is different, and what new capability blockchain adds.',
      scoringCriteria: [
        'Same: objective is identical — minimize market impact by spreading a large order over time, achieving close to TWAP execution price',
        'Different: traditional TWAP requires a broker, a custodian, and settlement delays. TWAMM is self-executing code — no intermediary',
        'Different: traditional TWAP still executes discrete sub-orders (e.g., every 5 minutes). TWAMM\'s mathematical model is genuinely continuous.',
        'New capability: TWAMM execution is transparent and publicly verifiable on-chain — no broker claiming they achieved TWAP while actually trading against you',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Combining DCA with Other Strategies
// ─────────────────────────────────────────────────────────────
{
  id: 'combining-dca-strategies',
  title: 'Combining DCA with Other Starknet Strategies',
  explanation: `
The most powerful DeFi strategies are not single protocols in isolation — they are composable systems where the output of one protocol becomes the input of another. A staking position generates rewards. Those rewards fund a DCA order. The DCA accumulates STRK. The accumulated STRK adds to the staking position. The cycle compounds autonomously.

DCA as a compounding engine works when you claim staking rewards periodically and immediately route them into a DCA order rather than simply holding or re-staking. The advantage over direct re-staking: you convert the yield into a systematic buying program that accumulates across price ranges rather than buying all at once at the reward claim moment.

DCA funded by lending yield is the most capital-efficient configuration. Keep a large USDC balance in Vesu earning 5%+ APY. Create a small weekly DCA order buying STRK. The Vesu yield funds the DCA — ideally at a rate where the weekly DCA amount equals or approximates the weekly yield earned. If Vesu earns 5% on $100,000 = $5,000/year = $96/week, you can run a $96/week DCA into STRK for free — funded entirely by lending yield with no principal reduction.

Exit DCA (selling systematically rather than buying) is the mirror image and equally important. Large holders who sell all at once cause significant price impact and may panic the market. Systematic exit DCA sells a fixed amount per week over a predetermined schedule. It captures the average price over the exit period, minimises impact, and removes the psychological pressure of deciding "when to sell."

Portfolio rebalancing DCA is the most sophisticated application. If your portfolio targets 60% STRK / 40% USDC and STRK rises to 75% of portfolio value, you sell excess STRK systematically via exit DCA back to USDC until the target is restored. If STRK falls to 45%, you buy STRK via DCA until you return to 60%. This is systematic rebalancing without market timing — the target ratio triggers the direction, the DCA handles the execution.
  `.trim(),
  visualPrompt: 'Ecosystem diagram showing four composable strategy flows: (1) Staking → claim rewards → DCA → more STRK → stake (circular). (2) Vesu USDC → weekly yield → DCA order → STRK accumulation. (3) Large STRK position → exit DCA → USDC over time. (4) Portfolio target → drift detection → DCA buys or sells → rebalanced. Arrows connecting each flow.',
  visualType: 'static',
  visualUrl: 'composable-dca-strategies',
  examples: [
    {
      contextTag: '[Staking rewards funding DCA, self-sustaining system]',
      context: 'A user has 20,000 STRK staked at 8.5% APY. They claim 1,700 STRK per year (~142 STRK/month). Instead of re-staking, they swap the monthly rewards to USDC and use the USDC to fund a daily DCA back into STRK.',
      scenario: '142 STRK × $0.80 = $113.60/month → $113.60 / 30 days = $3.79/day DCA into STRK.',
      outcome: 'The staking position generates $113.60/month of USDC-equivalent. The DCA buys STRK daily at whatever the market price is — capturing more STRK during dips and less during peaks. The system is self-sustaining: staking generates yield → yield funds DCA → DCA accumulates more STRK → more STRK increases the staking position → staking generates more yield. Compounding across two mechanisms simultaneously.',
    },
    {
      contextTag: '[Lending yield funding free DCA]',
      context: 'A user deposits $78,000 USDC into Vesu at 5.2% APY. They want to accumulate STRK without reducing their USDC principal.',
      scenario: 'Annual Vesu yield: $78,000 × 5.2% = $4,056. Weekly yield: $4,056 / 52 = $78. They create an AVNU DCA: $78/week into STRK.',
      outcome: 'The Vesu position earns $78/week, which funds the DCA each week. The $78,000 USDC principal stays intact in Vesu. The user accumulates STRK at the rate that their lending yield provides — effectively acquiring STRK for free using yield income. After 1 year: still holds $78,000+ USDC in Vesu (principal plus any undistributed yield) plus however many STRK they accumulated at an average of $78/week throughout the year.',
    },
    {
      contextTag: '[Exit DCA, large position liquidation]',
      context: 'An early Starknet supporter holds 800,000 STRK accumulated at an average cost of $0.12. STRK is now $0.85 and they want to take profits on 20% of their position (160,000 STRK = $136,000).',
      scenario: 'Selling 160,000 STRK as a single transaction would create approximately 8% price impact in current market conditions. They design an exit DCA.',
      outcome: 'Exit DCA: sell 5,000 STRK/week for 32 weeks. Each weekly sale of 5,000 STRK creates approximately 0.25% price impact — negligible. Total execution period: 8 months. They capture the average STRK price across 8 months rather than today\'s single price. If STRK rises during this period, they sell later tranches at higher prices. If it falls, earlier tranches were better. Systematic exit removes the "when to sell" psychological burden.',
    },
  ],
  keyTakeaway: 'When your lending yield funds your DCA order, you are accumulating an asset without touching your principal — the system generates the buying power from interest, not from spending what you already have.',
  guidedPractice: [
    {
      question: 'You have $50,000 in Vesu at 5.8% APY. You want to create a DCA order fully funded by your lending yield without touching the principal. What is the maximum weekly DCA amount?',
      options: [
        'A. $500/week — 1% of principal per week',
        'B. $55.77/week — $50,000 × 5.8% / 52 weeks',
        'C. $1,000/week — to make it worth doing',
        'D. $2,900/week — $50,000 × 5.8% per month',
      ],
      correct: 1,
      hint: 'Annual yield = $50,000 × 5.8%. Divide by 52 for weekly yield.',
      explanation: 'B is correct. Annual yield: $50,000 × 5.8% = $2,900. Weekly yield: $2,900 / 52 = $55.77. A $55.77/week DCA is exactly funded by Vesu yield — the principal is untouched. Any larger DCA amount would reduce the USDC principal over time. This "yield-funded DCA" is zero-cost accumulation: you end the year with $50,000+ USDC plus however much STRK $55.77/week bought at various prices.',
    },
    {
      question: 'Why is claiming staking rewards and routing them to a DCA order sometimes better than directly re-staking?',
      options: [
        'A. DCA generates higher returns than compounding in any market condition',
        'B. Re-staking buys at one price (the reward claim day). DCA spreads the same capital across multiple price points — potentially achieving a lower average cost if prices are volatile',
        'C. DCA avoids the 21-day unbonding period that applies to re-staked rewards',
        'D. DCA orders receive a fee discount from AVNU that direct staking does not',
      ],
      correct: 1,
      hint: 'Re-staking = buy at one moment\'s price. DCA = buy at multiple prices over time. What does price volatility do to this comparison?',
      explanation: 'B is correct. When you re-stake rewards, you buy back into STRK at the exact price on the claim day. If DCA instead spreads the same amount across 4 weekly purchases, price volatility can produce a lower average cost than a single entry. In volatile markets, the DCA advantage from spreading across dips applies equally to reward recycling as to fresh capital deployment.',
    },
    {
      question: 'Portfolio target: 70% STRK / 30% USDC. Current values: $14,000 STRK, $3,000 USDC (total $17,000). STRK has risen — the portfolio is now above target. What is the rebalancing DCA action?',
      options: [
        'A. Buy more STRK to grow toward the target allocation faster',
        'B. Sell STRK via exit DCA until STRK = 70% of the new total portfolio value',
        'C. No action needed — portfolio targets are aspirational, not operational',
        'D. Sell all STRK and restart the allocation from scratch',
      ],
      correct: 1,
      hint: 'STRK is $14,000 out of $17,000 total = 82.4% — above the 70% target. The rebalancing action returns to 70%.',
      explanation: 'B is correct. Current STRK allocation: $14,000 / $17,000 = 82.4%. Target: 70%. Required STRK value at 70%: $17,000 × 70% = $11,900. Need to sell: $14,000 - $11,900 = $2,100 of STRK via exit DCA. This restores the target allocation systematically without a single large sale. The rebalancing DCA would sell approximately $2,100 / 4 weeks = $525/week for 4 weeks.',
    },
    {
      question: 'What is "exit DCA" and when is it preferable to a single large sale?',
      options: [
        'A. Exit DCA is a way to avoid capital gains tax by spreading sales over time',
        'B. Exit DCA systematically sells a fixed amount per period — preferable when the position is large enough that a single sale would create significant market impact or psychologically difficult timing decisions',
        'C. Exit DCA only applies to staking positions, not token holdings',
        'D. Exit DCA is a Starknet-specific protocol — it is not available on other chains',
      ],
      correct: 1,
      hint: 'Think about two things: market impact of a large single sale, and the psychological difficulty of deciding exactly when to sell.',
      explanation: 'B is correct. Exit DCA addresses two problems. First: a large single sale of an illiquid or moderate-liquidity token creates price impact, meaning you receive less per token than the quoted price for the early units sold. Systematic small sales avoid this. Second: deciding exactly when to sell a large position is psychologically difficult and often leads to holding too long. Exit DCA removes the timing decision — you sell at the average price over the exit period.',
    },
    {
      question: 'You have $8,000 USDC in Vesu earning 5.5% APY. You also have 5,000 STRK earning 8.8% APY staking. Design a system where both yield streams fund a single combined DCA into more STRK. What is the maximum sustainable weekly DCA amount from both sources?',
      options: [
        'A. $8,000 × 5.5% / 52 = $8.46/week from Vesu only',
        'B. ($8,000 × 5.5% + 5,000 STRK × 8.8% × $0.80) / 52 = ($440 + $352) / 52 = $15.23/week',
        'C. (5,000 × 8.8%) / 52 = 8.46 STRK/week from staking only',
        'D. $100/week — a round number that is easy to manage',
      ],
      correct: 1,
      hint: 'Add both annual yield streams (converted to USD), then divide by 52 for weekly. Vesu yields in USDC, staking yields in STRK — convert staking to USD at current price.',
      explanation: 'B is correct. Vesu annual yield: $8,000 × 5.5% = $440/year. Staking annual yield: 5,000 × 8.8% = 440 STRK × $0.80 = $352/year. Combined: $792/year = $15.23/week. A $15.23/week DCA is fully funded by both yield streams — principal and staked position are untouched. This is the maximum sustainable rate without principal erosion.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Build a full self-sustaining DeFi system with $25,000 starting capital. Allocate: $18,000 USDC to Vesu at 5.6% APY, $7,000 to buy STRK ($0.80) and stake at 9.1% APY. Calculate: (1) weekly Vesu yield, (2) weekly staking rewards in STRK and USD, (3) maximum combined weekly DCA into more STRK, (4) after 52 weeks of running this system, how much STRK have you accumulated via DCA (assume flat STRK price)?',
      scoringCriteria: [
        'Weekly Vesu yield: $18,000 × 5.6% / 52 = $19.38/week',
        'Weekly staking: 8,750 STRK × 9.1% / 52 = 15.31 STRK × $0.80 = $12.25/week',
        'Combined DCA budget: $19.38 + $12.25 = $31.63/week',
        'Annual DCA accumulation: $31.63/week × 52 = $1,644.76 / $0.80 = 2,056 STRK accumulated',
        'System produces 2,056 STRK/year from yield alone — no principal spent',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You run a staking-rewards-funded DCA system. Your 10,000 STRK staking position earns 8.5% APY. You claim monthly and route to a USDC DCA order. Midway through month 3, STRK drops 50% to $0.40. Your monthly reward is 71 STRK. Identify three ways this price drop affects your system and state whether the system should continue running.',
      scoringCriteria: [
        'Effect 1: Monthly reward in USD terms falls from 71 × $0.80 = $56.80 to 71 × $0.40 = $28.40 — DCA buying power halves',
        'Effect 2: At $0.40/STRK, the DCA buys more STRK per dollar — accumulation rate in STRK terms doubles',
        'Effect 3: Your 10,000 STRK staking position is now worth $4,000 vs $8,000 — total portfolio value has fallen',
        'Conclusion: system should continue — a 50% price drop is exactly when DCA accumulation is most valuable. The system is designed for this scenario.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain portfolio rebalancing DCA to a traditional equity investor who manually rebalances their stock portfolio once per year. In 4 sentences, explain what stays the same, what is automated, what the blockchain adds, and what new risk exists.',
      scoringCriteria: [
        'Same: target allocation ratios and the trigger (portfolio drift from target) are identical concepts',
        'Automated: the rebalancing trades execute automatically via DCA orders — no need to log in, calculate, and place orders manually',
        'Blockchain adds: fully transparent execution on-chain, no broker required, can execute on any schedule not just annually',
        'New risk: smart contract risk and variable rates — the protocols executing the rebalancing could be exploited',
      ],
    },
  ],
},

];  // end LAB5_LESSONS_1_TO_4
