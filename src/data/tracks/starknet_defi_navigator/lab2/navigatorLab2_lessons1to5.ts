// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 2 — TOKEN SWAPS AND AMMs · LESSONS 1–5
// Written to sim_instructions_v3 + Lab 11 standard
// FIRST PORTFOLIO PUSH: Lab 2 Phase 2 Boss

export const LAB2_LESSONS_1_TO_5 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — How AMMs Work
// ─────────────────────────────────────────────────────────────
{
  id: 'how-amms-work',
  title: 'How Automated Market Makers Work',
  explanation: `
In 1994, the Nasdaq stock exchange moved entirely to electronic trading. Before that, human market makers stood on trading floors, buying and selling from their own inventories at posted prices and pocketing the spread. The system worked, but it was slow, expensive, and dependent on humans who needed sleep. Automated Market Makers (AMMs) took this concept further — replacing not just the human, but the order book itself.

An AMM holds a pool of two tokens and uses a mathematical formula to set the price automatically. The most common formula is the constant product model: x × y = k, where x is the quantity of token A in the pool, y is the quantity of token B, and k is a constant that must always remain the same.

Here is what that means in practice. If a pool holds 100,000 STRK and 100,000 USDC, k = 10,000,000,000. Each STRK is worth 1 USDC. If you buy 10,000 STRK, you remove 10,000 from x. The formula requires k to stay constant, so y must increase. Specifically: new y = k / new x = 10,000,000,000 / 90,000 = 111,111 USDC. You paid 11,111 USDC for 10,000 STRK — an average price of 1.11 USDC per STRK, not 1.00. The act of buying drove the price up.

This price movement is called price impact — the percentage difference between the quoted price and the actual average execution price. The larger your trade relative to the pool, the more price impact you experience. Buying 10,000 STRK from a pool of 100,000 STRK (10% of the pool) causes significant impact. Buying 100 STRK from the same pool causes negligible impact.

Impermanent loss is the risk unique to AMM liquidity providers. When you deposit tokens into a pool, you receive LP tokens representing your share. If one token's price changes significantly relative to the other, your share of the pool will have fewer of the appreciating token than if you had simply held both tokens separately. The loss is "impermanent" because it only becomes permanent when you withdraw — if the price ratio returns to what it was when you deposited, the loss disappears. If not, it crystallises.

The word "impermanent" is somewhat misleading. In practice, large price divergences create permanent losses that no amount of fee income compensates for.
  `.trim(),
  visualPrompt: 'Constant product curve x × y = k shown as a hyperbola. Three points marked: initial position, position after small trade, position after large trade. Price impact shown as the gap between initial price and average execution price. Second panel: LP deposit before and after price change showing the impermanent loss.',
  visualType: 'static',
  visualUrl: 'amm-constant-product-curve',
  examples: [
    {
      contextTag: '[Pool mechanics, price impact calculation]',
      context: "The Ekubo STRK/USDC pool — Ekubo is Starknet's concentrated liquidity AMM — has 1,000,000 STRK and 1,000,000 USDC. k = 1,000,000,000,000. Current price: 1 USDC per STRK.",
      scenario: 'A trader buys 100,000 STRK. New STRK in pool: 900,000. New USDC in pool: k / 900,000 = 1,111,111 USDC. The trader paid 111,111 USDC for 100,000 STRK.',
      outcome: 'Average execution price: 1.111 USDC per STRK. Price impact: 11.1%. The pool now prices STRK at 1,111,111 / 900,000 = 1.235 USDC — the price has moved dramatically. This is why large trades on pools with limited liquidity are so expensive. An arbitrageur will now buy USDC with STRK on another exchange and sell it back into this pool, restoring the price toward equilibrium.',
    },
    {
      contextTag: '[Impermanent loss, concrete calculation]',
      context: 'A liquidity provider deposits 1,000 USDC and 1,000 STRK into an Ekubo pool when STRK = $1.00. She receives LP tokens representing her pool share. Three months later, STRK is worth $4.00.',
      scenario: 'The LP checks the position before withdrawing. The pool rebalanced through trading: her share now represents 500 STRK and 2,000 USDC (not the 1,000/1,000 she deposited). The AMM sold STRK as its price rose.',
      outcome: 'The LP position value: 500 × $4 + $2,000 = $4,000. Had she simply held: 1,000 × $4 + $1,000 = $5,000. Impermanent loss: $1,000, or 20%. She earned approximately $200 in trading fees over three months. Net: she is $800 worse off than if she had held. The fees did not compensate for the impermanent loss at this level of price divergence.',
    },
    {
      contextTag: '[When fees do compensate, stable pair LP]',
      context: 'A liquidity provider deposits into a USDC/USDT pool on Ekubo. Both are stablecoins. Their prices rarely deviate from each other by more than 0.1%.',
      scenario: 'Over 6 months, the LP earns 3.2% APY in trading fees on their $50,000 position. USDC/USDT price ratio stayed within 0.05–1.00–1.02 the entire time.',
      outcome: 'Impermanent loss was negligible — approximately 0.01% — because the two tokens did not diverge meaningfully. The LP earned $1,600 in fees on $50,000 with near-zero IL. Stable pairs are the most favourable LP opportunity for conservative providers: high fee volume from stablecoin swaps, minimal impermanent loss risk.',
    },
  ],
  keyTakeaway: "When you buy from an AMM pool, you are changing the ratio of the two assets — and the larger your purchase relative to the pool's total depth, the worse the average price you receive.",
  guidedPractice: [
    {
      question: 'A pool has 500,000 USDC and 250,000 STRK (STRK = $2.00). k = 125,000,000,000. You buy 25,000 STRK. What is the new USDC in the pool?',
      options: [
        'A. 475,000 USDC — you paid 25,000 USDC for 25,000 STRK at $1 each',
        'B. 555,556 USDC — calculated as k / new STRK quantity = 125,000,000,000 / 225,000',
        'C. 500,000 USDC — buying STRK does not change the USDC in the pool',
        'D. 450,000 USDC — you paid $2.00 per STRK × 25,000 = $50,000',
      ],
      correct: 1,
      hint: 'New STRK in pool: 250,000 - 25,000 = 225,000. Apply k / new STRK quantity to find new USDC.',
      explanation: 'B is correct. New STRK = 225,000. New USDC = 125,000,000,000 / 225,000 = 555,556. You paid 555,556 - 500,000 = 55,556 USDC for 25,000 STRK. Average price: $2.22 per STRK, not $2.00. The price impact: 11.1%. Option D incorrectly applies the initial price to the full quantity — the AMM charges more for each successive STRK as the pool is depleted.',
    },
    {
      question: 'You deposit 5,000 USDC and 5,000 STRK into a pool when STRK = $1.00. STRK later rises to $9.00. Your pool share is now worth:',
      options: [
        'A. $50,000 — 5,000 STRK × $9 + 5,000 USDC',
        'B. $30,000 — approximately (calculated via the AMM formula, not the simple hold value)',
        'C. $10,000 — the same as your original deposit',
        'D. $45,000 — half the $9 price gain applies to your LP position',
      ],
      correct: 1,
      hint: 'When STRK price increases 9×, the AMM rebalances by selling your STRK for USDC. Use: value = 2 × sqrt(k × new price ratio) where k = initial product.',
      explanation: 'B is correct. With constant product, when STRK rises to $9 (9× increase), your pool share holds approximately 1,667 STRK and 15,000 USDC (the pool sold STRK as price rose). Value: 1,667 × $9 + $15,000 = $30,000. Had you held: 5,000 × $9 + $5,000 = $50,000. Impermanent loss: $20,000 (40%). The AMM sold your appreciating asset as it appreciated.',
    },
    {
      question: 'Why is impermanent loss called "impermanent"?',
      options: [
        'A. It automatically recovers over time as trading fees accumulate',
        'B. It only becomes a permanent loss when you withdraw — if the price ratio returns to your entry ratio before you withdraw, the loss disappears',
        'C. It is a temporary accounting entry that protocols remove from dashboards after 30 days',
        'D. It only applies to the first 30 days after deposit',
      ],
      correct: 1,
      hint: 'Think about what happens to your LP position if the price returns exactly to where it was when you deposited.',
      explanation: 'B is correct. If you deposit when STRK = $1 and STRK rises to $4, you have impermanent loss. But if STRK falls back to $1 before you withdraw, your pool position returns to the original ratio and the "loss" compared to holding is zero. The loss only crystallises at withdrawal. Option A is wrong — fees accumulate but do not eliminate the loss mechanism itself. The loss is based on price divergence, not time.',
    },
    {
      question: 'Which LP position would experience the least impermanent loss?',
      options: [
        'A. STRK/ETH pool — both crypto assets likely to move together',
        'B. STRK/USDC pool — one stable, one volatile',
        'C. USDC/USDT pool — both stablecoins, price rarely deviates',
        'D. wBTC/STRK pool — BTC and STRK are both DeFi assets',
      ],
      correct: 2,
      hint: 'Impermanent loss increases with price divergence between the two pooled assets. Which pair has the smallest likely price divergence?',
      explanation: 'C is correct. USDC and USDT are both designed to be worth $1.00. Their price ratio rarely deviates by more than 0.5%. The constant product formula only creates meaningful IL when prices diverge significantly. Option A has IL from Ethereum price movements relative to STRK. Option B has high IL potential from STRK volatility. Option D combines two volatile assets.',
    },
    {
      question: 'A pool has $10,000,000 of liquidity. You want to swap $50,000 of STRK. AVNU shows 0.5% price impact. Is this acceptable, and what does it cost you?',
      options: [
        'A. Unacceptable — any price impact above 0.1% is too high',
        'B. Acceptable for most strategies — 0.5% on $50,000 costs $250, and deep liquidity ($10M pool) means the quote is reliable',
        'C. Acceptable — 0.5% price impact means you will receive 0.5% more than quoted',
        'D. Unacceptable — $50,000 is too large for any DeFi swap',
      ],
      correct: 1,
      hint: 'Calculate the dollar cost of 0.5% on $50,000. Then assess whether a $10M pool makes this quote reliable.',
      explanation: 'B is correct. 0.5% of $50,000 = $250 — the extra cost due to price impact. In a $10M pool, a $50,000 trade is 0.5% of the pool, which is a reasonable fraction. The quote is reliable. Whether $250 is acceptable depends on your strategy — for most uses, it is. Option C is backwards — price impact costs you, it does not give you more.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Pool state: 2,000,000 STRK and 2,000,000 USDC. k = 4,000,000,000,000. A trader buys 400,000 STRK. Calculate: (1) new pool balances, (2) USDC paid, (3) average execution price, (4) price impact percentage, (5) new spot price after the trade.',
      scoringCriteria: [
        'New STRK in pool: 2,000,000 - 400,000 = 1,600,000',
        'New USDC in pool: 4,000,000,000,000 / 1,600,000 = 2,500,000',
        'USDC paid: 2,500,000 - 2,000,000 = 500,000',
        'Average execution price: 500,000 / 400,000 = $1.25 per STRK',
        'Price impact: (1.25 - 1.00) / 1.00 = 25%',
        'New spot price: 2,500,000 / 1,600,000 = $1.5625 per STRK',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You are considering providing $100,000 of liquidity to an Ekubo STRK/USDC pool (50/50 split). STRK is currently $0.80. You believe STRK could reach $4.00 within 12 months. Calculate the impermanent loss you would experience if STRK reaches $4.00 and you withdraw at that point. Compare to simply holding both assets. Should you LP or hold?',
      scoringCriteria: [
        'Initial deposit: $50,000 USDC and 62,500 STRK (at $0.80)',
        'IL formula: pool value at $4 = 2 × sqrt(initial_product × 4) = 2 × sqrt(50,000 × 62,500 × 4) ≈ $141,421',
        'Hold value at $4: 62,500 × $4 + $50,000 = $300,000',
        'IL: $300,000 - $141,421 = $158,579 (approximately 52.9%)',
        'Conclusion: holding is dramatically better if the price rise thesis is correct — LPing while believing one asset will 5× is almost always a losing strategy',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A developer who understands databases but not DeFi asks: "How does an AMM know what price to charge? Who sets it?" Explain in 4 sentences using database analogies where helpful.',
      scoringCriteria: [
        'Explains the formula sets the price automatically — no human or order book required',
        'Uses a clear analogy (formula as a stored procedure, pool balances as a database record, trade as a transaction that updates both fields)',
        'Explains that the price emerges from the ratio of the two balances',
        'Mentions that large trades against small pools cause the price to move more — connecting to database lock contention or similar concept is a bonus',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Concentrated Liquidity (Ekubo)
// ─────────────────────────────────────────────────────────────
{
  id: 'concentrated-liquidity-ekubo',
  title: 'Concentrated Liquidity: Making Capital Work Harder',
  explanation: `
In a standard AMM pool, liquidity is spread uniformly across all possible prices — from zero to infinity. This means most of your deposited capital sits idle at price ranges where almost no trading ever happens. If STRK is trading at $0.80, the liquidity you deployed at $50 or $0.01 generates zero fees because no trades occur there. Capital efficiency is poor.

Concentrated liquidity was pioneered by Uniswap v3 — the dominant Ethereum DEX — and implemented on Starknet by Ekubo. It solves this. Instead of spreading liquidity across all prices, LPs specify a price range — for example, $0.70 to $0.90. All their capital is deployed only within that range. When STRK trades between $0.70 and $0.90, their liquidity is active and earns fees. Outside that range, their liquidity is completely inactive and earns nothing.

The trade-off is powerful. An LP who concentrates $10,000 into a narrow range ($0.75–$0.85) can earn the same fees as an LP with $100,000 in a standard pool covering the full range — a 10× capital efficiency improvement. But if the price moves outside their range, they earn nothing until they either wait for the price to return or rebalance their position to a new range.

Fee tiers in Ekubo determine how much of each swap goes to LPs. Higher fee tiers (1%) are appropriate for volatile pairs where LPs face more impermanent loss risk. Lower fee tiers (0.05%) suit stable pairs like USDC/USDT where price rarely moves and LPs face minimal IL. The market selects the appropriate tier — most volume routes through whichever pool offers the best total price including fees.

Active management is the hidden cost of concentrated liquidity. When prices move out of your range, you must decide: widen the range (lower fees but more resilient), shift the range (new gas cost), or exit. Passive LPs who set tight ranges and forget them often earn nothing for extended periods.
  `.trim(),
  visualPrompt: 'Two liquidity distribution diagrams side by side: Standard AMM (flat line across all prices — "1x efficiency") vs Concentrated liquidity (tall spike between two price bounds — "10x efficiency"). Below: fee tier comparison table (0.05%, 0.3%, 1%) with use cases.',
  visualType: 'static',
  visualUrl: 'concentrated-liquidity-comparison',
  examples: [
    {
      contextTag: '[Capital efficiency, LP comparison]',
      context: 'Two LPs both want to provide liquidity to the STRK/USDC pair on Ekubo. LP A deposits $100,000 at a full range (standard AMM style). LP B deposits $10,000 concentrated in the $0.75–$0.85 range.',
      scenario: 'STRK trades between $0.78 and $0.82 for the next month. Both LPs are active for the entire period. The pool generates $50,000 in total fees.',
      outcome: 'LP A earns their proportional share of $50,000 based on their $100,000 contribution. LP B, despite having only $10,000 deployed, has concentrated all capital at the active trading range — earning a similar share to LP A. LP B achieved the same fee income with one tenth the capital. Capital efficiency: 10×. Risk: if STRK moves outside $0.75–$0.85, LP B earns zero until rebalancing.',
    },
    {
      contextTag: '[Out-of-range position, common mistake]',
      context: 'Carlos deposits $20,000 into an Ekubo STRK/USDC position with range $0.80–$0.90 when STRK is $0.82. He does not check his position for 3 weeks.',
      scenario: 'STRK falls to $0.65 over those 3 weeks due to market conditions. Carlos logs in and checks his Ekubo dashboard.',
      outcome: 'His position shows $0 in fees earned for the past 2 weeks — the price moved below his range and his liquidity has been completely inactive. His position now holds only USDC (the AMM converted all his STRK to USDC as the price fell through his range). He must decide: wait for STRK to return to $0.80, or rebalance to a new range centred on $0.65. This is the active management cost of concentrated liquidity.',
    },
    {
      contextTag: '[Fee tier selection, stable vs volatile]',
      context: 'An LP is considering two positions: (A) USDC/USDT at 0.05% fee tier, (B) STRK/USDC at 0.3% fee tier. Both with $50,000 deployed.',
      scenario: 'Over 30 days: USDC/USDT generates $500,000 daily volume (stablecoin swaps are very frequent). STRK/USDC generates $80,000 daily volume. The LP calculates fee income for each.',
      outcome: 'Position A: $500,000 × 0.05% × 30 days = $7,500, but the LP only has a fraction of total pool liquidity (say 5% share) = $375 earned. Position B: $80,000 × 0.3% × 30 days = $7,200, with LP at 10% of pool = $720 earned. Position A wins despite lower fee tier because of much higher volume. Fee tier selection must account for both the tier AND the expected volume.',
    },
  ],
  keyTakeaway: 'A concentrated liquidity position earns fees only when the current price falls inside the range you set — the moment price moves outside your range, your capital is completely inactive.',
  guidedPractice: [
    {
      question: 'Why does concentrated liquidity improve capital efficiency compared to a standard AMM?',
      options: [
        'A. Concentrated liquidity earns higher fee percentages than standard AMMs',
        'B. All capital is deployed within the active trading range, not spread across prices where no trades occur',
        'C. Concentrated liquidity positions never experience impermanent loss',
        'D. The protocol compounds fees automatically, increasing returns',
      ],
      correct: 1,
      hint: 'In a standard AMM, where is most of the liquidity deployed? At what price ranges do actual trades happen?',
      explanation: 'B is correct. In a standard AMM, your $10,000 is spread from price zero to infinity. Only the liquidity near the current price earns fees — the rest earns nothing. Concentrated liquidity deploys all $10,000 near the current price, making all of it fee-generating. The efficiency gain is the ratio of active range to total range.',
    },
    {
      question: 'STRK is trading at $0.85. You deploy concentrated liquidity in the range $0.80–$0.90. STRK then rises to $0.95. What happens to your position?',
      options: [
        'A. Your position continues earning fees at the new higher price',
        'B. Your position becomes entirely composed of USDC — the AMM sold all your STRK as it rose through your range — and you earn zero fees until price returns or you rebalance',
        'C. Your position earns extra fees because higher price means more valuable fees',
        'D. Your position automatically adjusts its range to follow the current price',
      ],
      correct: 1,
      hint: 'When price rises above your range, what does the AMM do to your token mix? Are you still providing active liquidity?',
      explanation: 'B is correct. As STRK rose from $0.85 to $0.90 (your upper bound), the AMM sold your STRK for USDC. Above $0.90, your position is 100% USDC and completely inactive — no fees earned. Concentrated liquidity positions do not automatically follow the price. You must manually rebalance to a new range, paying gas, to return to active liquidity provision.',
    },
    {
      question: 'Which fee tier is most appropriate for a USDC/USDT liquidity position?',
      options: [
        'A. 1% — higher fees compensate for the risk',
        'B. 0.3% — the standard fee tier for most pairs',
        'C. 0.05% — stablecoins rarely deviate in price, so LPs face minimal IL and can accept low fees per trade while earning from very high volume',
        'D. Fee tier does not matter for stablecoin pairs',
      ],
      correct: 2,
      hint: 'IL is minimal for stablecoins. Volume is very high. What fee tier attracts the most volume while still rewarding LPs?',
      explanation: 'C is correct. USDC/USDT is a stable pair — prices rarely deviate, so impermanent loss is negligible. LPs can offer very low fees (0.05%) while still earning significant income because the trading volume on stablecoin pairs is extremely high. The 1% tier (Option A) would route almost all volume to lower-fee competitors — nobody pays 1% to swap one stablecoin for another.',
    },
    {
      question: 'An LP sets a range of $0.70–$0.90 for STRK/USDC when STRK = $0.80. STRK drops to $0.50 and recovers to $0.75 over 2 months. During the time STRK was below $0.70, the LP earned:',
      options: [
        'A. Half the normal fees — price was only slightly outside range',
        'B. Zero fees — the position was completely out of range and inactive',
        'C. Normal fees — the pool continued operating at the new price',
        'D. Bonus fees — the pool compensated LPs for the price movement',
      ],
      correct: 1,
      hint: 'Concentrated liquidity is binary — either in range (earning fees) or out of range (earning nothing). There is no partial earning.',
      explanation: 'B is correct. When STRK is below $0.70 (the lower bound of the range), the position is entirely out of range. Zero fees are earned during that period. The capital is still deployed — just inactive. When STRK returned to $0.75 (within the $0.70–$0.90 range), fee earning resumed.',
    },
    {
      question: 'LP A has $50,000 in a standard full-range STRK/USDC pool (1% of total pool). LP B has $5,000 concentrated in $0.78–$0.82 (5% of active liquidity in that range). STRK trades between $0.79 and $0.81 all month. Daily volume in the active range: $200,000. Fee tier: 0.3%. Which LP earns more in fees?',
      options: [
        'A. LP A — more capital always means more fees',
        'B. LP B — despite less capital, the concentrated position captures a larger share of active range liquidity, earning more fees on the active trading range',
        'C. They earn identical fees — fees are based on capital deployed, not position type',
        'D. Cannot determine without knowing the full pool TVL',
      ],
      correct: 1,
      hint: 'Fees are distributed based on share of active liquidity, not total capital. LP B is 5% of active liquidity. LP A is 1% of total pool but what fraction of active liquidity?',
      explanation: 'B is correct. In concentrated liquidity, fees go to providers of active liquidity — liquidity within the current trading range. LP A has 1% of total pool capital, but most of that capital is inactive (deployed outside $0.79–$0.81). LP B has 5% of active liquidity in the exact range where trading is happening. Monthly fees from active range: $200,000 × 0.3% × 30 = $18,000. LP B earns 5% = $900. LP A earns a much smaller fraction despite having 10× more capital.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You want to LP $30,000 into an Ekubo STRK/USDC pool. Current STRK price: $0.82. Option A: Full range deployment (standard AMM style). Option B: Concentrated in $0.75–$0.90. Option C: Concentrated in $0.80–$0.85. Daily active range volume: $500,000. Fee tier: 0.3%. Estimate fee APY for each option assuming you represent 5% of liquidity in each respective category and STRK stays between $0.80–$0.85 all month.',
      scoringCriteria: [
        'Option A: Only a fraction of full-range is active — maybe 5% of $500K active × 0.3% × 365 / $30,000 = low APY (approximately 9% if 5% of active range)',
        'Option B: Wider range, more capital active when price in $0.80–$0.85, moderate APY (approximately 18%)',
        'Option C: Tightest range, all capital active when price in range, highest fee APY (approximately 55%) but highest out-of-range risk',
        'Correctly identifies the fee/risk trade-off: tighter range = higher APY when in range = higher risk of going out of range',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A friend has $40,000 to LP on Ekubo. They want to "maximise yield" and plan to set the tightest possible price range: $0.819–$0.821 (a 0.2% range around current STRK price of $0.820). They say this will give them 500× capital efficiency. What are the two critical risks they are ignoring and what would you recommend instead?',
      scoringCriteria: [
        'Risk 1: Any price move of more than 0.1% takes them out of range — they will earn zero fees and must rebalance frequently at gas cost',
        'Risk 2: Gas costs of constant rebalancing may exceed the extra fee income from the tight range',
        'Recommendation: A range of $0.75–$0.90 provides good capital efficiency while tolerating normal STRK price volatility without constant rebalancing',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain concentrated liquidity to someone who owns a physical shop and understands stock/inventory management. 4 sentences. Use the shop as your analogy throughout.',
      scoringCriteria: [
        'Shop inventory analogy correctly applied: keeping stock only in the sizes/products that actually sell (concentrated range) vs keeping every possible size even if rarely sold (full range)',
        'Out-of-range correctly analogised: like stocking only children\'s shoes when all customers are adults — the stock exists but earns nothing',
        'Fee earning correctly described: revenue comes from products in the active selling range',
        'Active management correctly described: like a shop manager who must update inventory when customer preferences change',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — AVNU: Understanding Aggregation
// ─────────────────────────────────────────────────────────────
{
  id: 'avnu-aggregation',
  title: 'AVNU: Understanding DEX Aggregation',
  explanation: `
In 2000, before Google Flights existed, booking a cheap flight meant visiting every airline's website individually — United, Delta, Lufthansa, British Airways — comparing prices manually and hoping you found the best option. Google Flights changed this by aggregating all airlines into one search, finding the cheapest combination of routes in seconds. AVNU does the same thing for token swaps on Starknet.

AVNU is a DEX aggregator — it does not hold liquidity itself, but instead queries all liquidity sources on Starknet simultaneously and routes your swap through the best combination. When you want to swap 1,000 STRK for USDC, AVNU might route 60% through an Ekubo pool with deep liquidity, 30% through a second Ekubo pool at a different fee tier, and 10% through another protocol — all in a single atomic transaction, arriving in your wallet as one combined USDC amount.

Split routing is why aggregators produce better prices than single DEX swaps. When a pool is shallow, buying all of it from one source creates high price impact. By splitting the same order across multiple pools, AVNU averages the price impact across all sources, resulting in less total slippage.

Multi-hop routing takes this further. Sometimes there is no direct STRK/wBTC pool, but there is a deep STRK/USDC pool and a deep USDC/wBTC pool. AVNU routes STRK → USDC → wBTC in two internal steps, arriving at a better total price than if it had forced a direct swap through a shallow STRK/wBTC pool.

The Starkzap SDK integrates AVNU directly. wallet.getQuote() calls AVNU's routing engine off-chain to find the optimal path and returns the expected output, price impact, and route breakdown. wallet.swap() then executes the route as a single Starknet transaction. The routing happens silently — you see only the input, the output, and the price impact.
  `.trim(),
  visualPrompt: 'Flow diagram: User input (1000 STRK) → AVNU routing engine → split arrows: 60% to Ekubo Pool A, 30% to Ekubo Pool B, 10% to other DEX → all arrows converge to USDC output. Second diagram: multi-hop STRK → USDC → wBTC shown as two sequential swaps in one transaction.',
  visualType: 'static',
  visualUrl: 'avnu-routing-diagram',
  examples: [
    {
      contextTag: '[Split routing saves $2,400 on large swap]',
      context: 'A user wants to swap $100,000 of STRK for USDC. The main Ekubo STRK/USDC pool has $800,000 of liquidity. Directly executing on this pool would cause approximately 12.5% price impact.',
      scenario: 'AVNU finds three routes: Ekubo Pool A ($800K liquidity, 0.3% fee), Ekubo Pool B ($300K liquidity, 0.05% fee), and a smaller DEX ($100K liquidity). AVNU splits: 70% ($70K) through Pool A, 20% ($20K) through Pool B, 10% ($10K) through the smaller DEX.',
      outcome: 'Average price impact across all routes: approximately 4.1% vs 12.5% single-pool impact. Savings: 8.4% of $100,000 = $8,400. AVNU also selected Pool B for part of the route despite lower liquidity because the 0.05% fee tier partially offset the slightly worse price. Smart routing is not just about finding the deepest pool — it is about optimising total output after fees.',
    },
    {
      contextTag: '[Multi-hop routing, no direct pair]',
      context: 'A user wants to swap STRK directly for lBTC. There is no deep direct STRK/lBTC pool on Starknet at the moment.',
      scenario: 'AVNU finds: STRK/USDC pool ($2M liquidity, 0.3% fee) and USDC/lBTC pool ($500K liquidity, 0.1% fee). Route: STRK → USDC → lBTC. Total fees: 0.4%.',
      outcome: 'The user receives lBTC in a single transaction. AVNU internally executed two swaps, batched them atomically. Total price impact: 3.2% (less than the 8%+ impact of forcing through a direct shallow STRK/lBTC pool). The user sees: "Input: 1,000 STRK. Output: 0.00185 lBTC. Route: STRK/USDC → USDC/lBTC. Fees: 0.4%."',
    },
    {
      contextTag: '[getQuote before committing, risk management]',
      context: 'Amara wants to swap 5,000 STRK for USDC but is concerned about price impact. Before committing, she calls wallet.getQuote() to preview the swap.',
      scenario: 'getQuote returns: amountOut = 618,500,000 (618.5 USDC after 6 decimals), priceImpactBps = 42 (0.42%), route = ["Ekubo-0.3%", "Ekubo-0.05%"], provider = "avnu".',
      outcome: 'Amara sees 0.42% price impact — approximately $2.60 on her 5,000 STRK swap. She decides this is acceptable. She calls wallet.swap() and the transaction executes at that route. Had she seen 8% price impact, she would have split her swap into multiple smaller transactions. Previewing before committing is the discipline that separates experienced DeFi users from those who consistently overpay.',
    },
  ],
  keyTakeaway: 'By splitting your swap across every available liquidity source simultaneously, AVNU reduces the price impact that a single-pool trade would cause — but you only capture that benefit if you check the quote before committing.',
  guidedPractice: [
    {
      question: 'What does AVNU\'s split routing accomplish that a single DEX swap cannot?',
      options: [
        'A. It allows swapping tokens that are not listed on any single DEX',
        'B. It distributes the swap across multiple pools, averaging price impact across all sources and reducing total slippage',
        'C. It guarantees a fixed exchange rate regardless of pool depth',
        'D. It allows larger swaps than any single DEX would permit',
      ],
      correct: 1,
      hint: 'Think about what causes high price impact. If you split the same order across multiple pools, what happens to the impact on each pool?',
      explanation: 'B is correct. Price impact occurs when a single pool is depleted. Splitting the same order across multiple pools means each pool is depleted less, resulting in lower price impact per pool. The average price across all splits is better than forcing the entire order through one pool. Option A is addressed by multi-hop routing, not split routing. Option C is wrong — no AMM guarantees a fixed rate.',
    },
    {
      question: 'AVNU routes your STRK swap through: 60% to Pool A (0.3% fee), 40% to Pool B (0.05% fee). You are swapping $10,000 of STRK. What is the weighted average fee you pay?',
      options: [
        'A. 0.175% — (0.3% + 0.05%) / 2',
        'B. 0.2% — (60% × 0.3%) + (40% × 0.05%) = 0.18% + 0.02% = 0.20%',
        'C. 0.3% — the highest fee tier always applies',
        'D. 0.05% — the lowest fee tier always wins',
      ],
      correct: 1,
      hint: 'Weighted average: multiply each fee by its allocation percentage and sum.',
      explanation: 'B is correct. (60% × 0.3%) + (40% × 0.05%) = 0.18% + 0.02% = 0.20%. On $10,000, this costs $20. Option A incorrectly takes a simple average ignoring the different allocation sizes. Options C and D incorrectly apply only one fee tier.',
    },
    {
      question: 'wallet.getQuote() returns priceImpactBps: 250. What does this mean in percentage terms and is it acceptable for a $5,000 swap?',
      options: [
        'A. 25% price impact — highly unacceptable for any swap',
        'B. 2.5% price impact — moderate, costs $125 on a $5,000 swap. Borderline acceptable depending on urgency and alternatives.',
        'C. 0.25% price impact — minimal, acceptable for any swap size',
        'D. 250% price impact — meaning the swap would be unprofitable',
      ],
      correct: 1,
      hint: 'Bps = basis points. 100 bps = 1%. Convert 250 bps to percentage.',
      explanation: 'B is correct. 250 basis points = 2.5%. On $5,000, this costs $125 in extra slippage. Whether this is acceptable depends on context: for an urgent trade in a thin market, it may be the best available. For a patient user, splitting into multiple smaller swaps over time would reduce this. Option A misreads bps (250 bps ≠ 25%). Option C is off by 10×.',
    },
    {
      question: 'Why might AVNU route STRK → USDC → wBTC in two hops rather than direct STRK → wBTC?',
      options: [
        'A. AVNU always uses USDC as an intermediate — it is required by the protocol',
        'B. There may be no direct STRK/wBTC pool with sufficient liquidity, but deep STRK/USDC and USDC/wBTC pools exist — routing through USDC gives better total output',
        'C. Two-hop routes cost less in gas fees',
        'D. AVNU routes through USDC to collect an additional fee',
      ],
      correct: 1,
      hint: 'Why does a travel aggregator route London→Paris→New York instead of direct London→New York sometimes? Same principle.',
      explanation: 'B is correct. A direct STRK/wBTC pool may have poor liquidity, causing high price impact. If STRK/USDC and USDC/wBTC each have deep liquidity, routing through USDC produces better total output despite the two-hop fee cost. AVNU calculates the optimal path and chooses multi-hop only when it produces better results than direct.',
    },
    {
      question: 'You are about to swap $50,000 of STRK. AVNU shows 6% price impact. What should you do?',
      options: [
        'A. Execute immediately — 6% is the market price and unavoidable',
        'B. Split into 5 × $10,000 swaps executed over 5 hours, allowing arbitrageurs to rebalance the pool between each trade',
        'C. Cancel — any price impact above 1% means the swap is not worth doing',
        'D. Increase slippage tolerance to 7% and execute',
      ],
      correct: 1,
      hint: '6% of $50,000 = $3,000 extra cost. What alternative would reduce this cost?',
      explanation: 'B is correct. 6% on $50,000 = $3,000 in extra cost due to price impact. Splitting into 5 × $10,000 gives each pool time to rebalance between trades (arbitrageurs restore prices to equilibrium), so each sub-trade faces much lower price impact — perhaps 1–1.5% instead of 6%. Total savings: potentially $2,000+. Option D makes it worse by accepting even more slippage. Option C is too rigid — sometimes large swaps are unavoidable.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You want to swap 10,000 STRK for USDC. AVNU returns two route options: Route 1: Single hop through Ekubo Pool A ($3M liquidity, 0.3% fee), price impact 0.33%, expected output: 12,380 USDC. Route 2: Split — 70% Ekubo Pool A, 30% Ekubo Pool B ($800K liquidity, 0.05% fee), combined price impact 0.21%, expected output: 12,404 USDC. Calculate the difference in USDC received and recommend which route to use.',
      scoringCriteria: [
        'Difference: 12,404 - 12,380 = 24 USDC in favour of Route 2',
        'Route 2 saves 24 USDC on a 10,000 STRK swap (approximately $24)',
        'Recommendation: Route 2 is correct — AVNU should be allowed to execute the split route',
        'Notes that AVNU handles this automatically — the user does not need to manually select routes unless overriding',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to swap $200,000 of USDC for lBTC. AVNU shows: Route USDC → wBTC → lBTC (two hops), price impact 1.8%, expected lBTC: 3.24. Alternatively they could bridge to Ethereum, swap on Uniswap (deeper liquidity), then bridge lBTC back to Starknet. Bridge costs: $25 each way + 2 hours each way. Uniswap price impact for same trade: 0.4%. Which path gives better total output? Show your working.',
      scoringCriteria: [
        'Starknet path cost: $200,000 × 1.8% = $3,600 in price impact',
        'Ethereum path cost: $200,000 × 0.4% = $800 price impact + $50 bridge fees + 4 hours time cost',
        'Ethereum path savings: $3,600 - $800 - $50 = $2,750 in dollar terms',
        'Correct recommendation: Ethereum path is better economically but user must value 4 hours of time — if time value > $2,750 / 4 hours, Starknet wins',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi beginner says: "I just went to Ekubo directly and swapped my STRK instead of using AVNU. Was that a mistake?" Give an honest 3-sentence answer that covers when direct DEX use is fine and when AVNU matters.',
      scoringCriteria: [
        'Correctly states direct DEX is fine for small swaps where price impact is minimal (under 0.5%)',
        'Correctly identifies when AVNU matters: larger swaps where split routing saves meaningful money',
        'Gives a practical threshold: for swaps under $1,000–$2,000 on liquid pairs, the difference is typically under $5 and not worth worrying about',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Executing Swaps Correctly
// ─────────────────────────────────────────────────────────────
{
  id: 'executing-swaps-correctly',
  title: 'Executing Swaps Correctly',
  explanation: `
In 2021, a user attempted to swap $500,000 of ETH on Uniswap with slippage tolerance set to 50%. A sandwich bot detected the pending transaction, placed a buy order immediately before it and a sell order immediately after, profiting approximately $4,900 from the user's tolerance for price movement. The user received far less than they would have with a 0.5% slippage setting.

Slippage tolerance is the maximum price movement you will accept between submitting a transaction and it being executed. Set it too tight and your transaction fails frequently during volatile markets. Set it too wide and bots can profit from your tolerance — a practice called a sandwich attack.

The correct slippage setting depends on market conditions. For liquid pairs on stable days, 0.3–0.5% is appropriate. During high volatility (major news events, sharp price moves), temporarily widening to 1–2% prevents constant reverts. For stablecoin swaps, 0.05–0.1% is usually sufficient.

Before every swap, review four things. First, the quote — does the expected output match your expectations? Second, the price impact — is it below 1% for ordinary trades? Third, the route — does AVNU's chosen path make sense? Fourth, the slippage tolerance — is it appropriate for current conditions?

Front-running is the practice of placing a transaction immediately before yours, knowing your large trade will move the price. Sandwich attacks combine front-running (buy before) with back-running (sell immediately after). On Starknet, the sequencer's ordering creates some MEV (Maximal Extractable Value) opportunities, but they are generally smaller than on Ethereum due to the single sequencer's ordering transparency.

After submission, tx.wait() resolves when the transaction is included in a block. Verify the result on Voyager: check the events section to confirm the exact amounts transferred. The quote is an estimate — execution can differ slightly. Checking the receipt is how you know exactly what you received.
  `.trim(),
  visualPrompt: 'Swap checklist UI showing four checkpoints: Quote (✓), Price Impact (✓ or ⚠), Route (AVNU multi-hop), Slippage Tolerance (input field with guide: 0.05% stable, 0.3% normal, 1% volatile). Below: sandwich attack diagram showing bot buy → user swap → bot sell in sequence.',
  visualType: 'static',
  visualUrl: 'swap-execution-checklist',
  examples: [
    {
      contextTag: '[Sandwich attack, high slippage victim]',
      context: 'A DeFi user in 2021 set 49% slippage tolerance on a $500K ETH swap on Uniswap, thinking higher tolerance would help during volatile markets.',
      scenario: 'A MEV bot detected the pending transaction. The bot bought ETH immediately before the user (driving up the price), let the user execute at the higher price, then immediately sold the ETH at the inflated price.',
      outcome: 'The bot profited $4,900. The user received $4,900 less ETH than they would have with appropriate slippage. On Starknet, the AVNU Paymaster and single sequencer reduce but do not eliminate MEV risk. The defence: set slippage as tight as the market conditions allow — never use 49% unless you are comfortable giving bots a guaranteed profit margin.',
    },
    {
      contextTag: '[Transaction revert, tight slippage during volatility]',
      context: 'During a STRK price flash crash, a user tries to swap 10,000 STRK for USDC with 0.1% slippage tolerance. Three transactions revert in succession.',
      scenario: 'The price is moving 2–3% per minute during the crash. Each time the user submits, the price moves more than 0.1% before the sequencer includes the transaction.',
      outcome: 'The user temporarily increases slippage to 2% during the volatile period. The next transaction executes immediately. After prices stabilise 20 minutes later, the user returns slippage to 0.3%. The lesson: slippage settings are not permanent — they should be adjusted for current market conditions. Reverts during volatility are the normal functioning of the safety mechanism.',
    },
    {
      contextTag: '[Verifying a swap on Voyager]',
      context: 'Fatima swaps 2,000 STRK for USDC. The app shows "Transaction confirmed: you received 246.80 USDC." She copies the transaction hash to sepolia.voyager.online.',
      scenario: 'On Voyager, she sees three events: (1) Transfer: -2,000 STRK from her wallet to AVNU contract. (2) Transfer: +248.12 USDC from AVNU contract to her wallet. The amounts do not match the app display.',
      outcome: 'Fatima received 248.12 USDC — slightly more than the app\'s pre-execution estimate of 246.80. The app\'s estimate used the quote from before submission; actual execution was slightly more favourable due to price movement. The Voyager events are the authoritative record — the actual amounts transferred on-chain. Always verify the receipt, not just the confirmation screen.',
    },
  ],
  keyTakeaway: 'Slippage tolerance is both your protection against bad execution and the profit margin you hand to bots — setting it too tight causes frequent reverts, setting it too wide invites sandwich attacks.',
  guidedPractice: [
    {
      question: 'What is slippage tolerance and what happens if it is set too high?',
      options: [
        'A. The maximum fee you pay; setting it high means paying more fees',
        'B. The maximum price movement you accept; setting it too high gives MEV bots room to profit from your order',
        'C. The minimum amount you will accept; setting it too high causes transactions to revert unnecessarily',
        'D. The time limit for your transaction; setting it too high means you wait longer',
      ],
      correct: 1,
      hint: 'Think about the sandwich attack example. How did the high slippage setting enable the bot to profit?',
      explanation: 'B is correct. Slippage tolerance defines how much the price can move against you while your transaction is pending. Too high = bots can buy before you (driving up price to your tolerance limit), execute your swap at the higher price, then sell. Your tolerance is their guaranteed profit margin. Too low = reverts during normal volatility.',
    },
    {
      question: 'A user submits a STRK/USDC swap with 0.2% slippage. While the transaction is in the sequencer queue, STRK price drops 0.5%. What happens?',
      options: [
        'A. The transaction executes at the new lower price — you receive less USDC',
        'B. The transaction reverts — the 0.5% price movement exceeded the 0.2% slippage tolerance',
        'C. The transaction executes and you receive 0.5% more USDC because STRK is now cheaper',
        'D. The transaction is held in queue until price recovers to within 0.2%',
      ],
      correct: 1,
      hint: 'Slippage tolerance is protection for the buyer. If price moves more than the tolerance, the protocol cancels the transaction.',
      explanation: 'B is correct. The 0.5% price drop means you would receive 0.5% less USDC than quoted. Since your tolerance was only 0.2%, the transaction reverts — protecting you from worse-than-expected execution. Your STRK remains in your wallet. You can resubmit with the current price as the new quote basis.',
    },
    {
      question: 'AVNU quote shows price impact: 0.08%. This is:',
      options: [
        'A. High — 0.08% is above acceptable threshold for DeFi',
        'B. Very low — less than 0.1% price impact means this is a highly liquid pair with minimal market impact from your trade',
        'C. Not shown — AVNU does not display price impact',
        'D. The fee percentage, not the price impact',
      ],
      correct: 1,
      hint: 'What does 0.08% price impact mean in dollar terms on a $1,000 swap?',
      explanation: 'B is correct. 0.08% price impact on a $1,000 swap costs $0.80 in slippage — negligible. This indicates deep liquidity in the pair relative to your trade size. Concerning price impact starts around 1–2% for most strategies. 0.08% means you can execute without worrying about market impact.',
    },
    {
      question: 'What four things should you check before confirming a large swap?',
      options: [
        'A. Token names, wallet balance, network status, weather forecast',
        'B. Quote (expected output), price impact (below 1%?), route (does it make sense?), slippage tolerance (appropriate for current conditions?)',
        'C. Gas fee, contract address, your portfolio size, market cap of the output token',
        'D. AVNU API status, Ekubo TVL, Starknet block time, your account nonce',
      ],
      correct: 1,
      hint: 'Think about what can go wrong in a swap and what information would help you catch each issue before executing.',
      explanation: 'B is correct. Quote: confirms you are getting what you expect. Price impact: tells you how much your trade moves the market. Route: confirms the path makes sense (not routing through a suspicious intermediate token). Slippage tolerance: confirms you are protected appropriately for current volatility without being unnecessarily wide.',
    },
    {
      question: 'After a swap, the app says "you received 620 USDC" but Voyager shows a Transfer event of 618.3 USDC. Which is correct?',
      options: [
        'A. The app — it has access to more precise data than Voyager',
        'B. Voyager — the on-chain events are the authoritative record of what actually happened',
        'C. Neither — both are estimates until the transaction finalises',
        'D. They are the same amount expressed differently due to decimal precision',
      ],
      correct: 1,
      hint: 'Which is the primary source — the app\'s estimate made before execution, or the actual transaction data recorded on Starknet?',
      explanation: 'B is correct. On-chain events recorded in the Starknet transaction are the authoritative source of truth. The app\'s displayed amount (620 USDC) was based on the pre-execution quote estimate. Actual execution at 618.3 USDC reflects the precise price at the moment the transaction was processed. Always trust the block explorer for exact amounts.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to swap $150,000 USDC for STRK. They plan to set 10% slippage tolerance to "make sure it goes through." Explain the specific risk this creates, calculate the maximum dollar amount a sandwich bot could extract given 10% tolerance, and recommend the correct approach.',
      scoringCriteria: [
        'Risk correctly identified: 10% tolerance gives bots up to $15,000 of guaranteed profit margin',
        'Maximum bot extraction: $150,000 × 10% = $15,000',
        'Correct approach: set slippage at 0.5–1%, split the $150,000 into 3–5 smaller swaps, and use AVNU\'s routing to minimise price impact per swap',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'You execute three swaps on Starknet Sepolia testnet and record the results. Swap 1: Quoted 100 STRK → 12.40 USDC, executed 12.38 USDC, slippage set 0.5%. Swap 2: Quoted 100 STRK → 12.40 USDC, executed 12.02 USDC, slippage set 3%. Swap 3: Quoted 100 STRK → 12.40 USDC, reverted, slippage set 0.1%. For each: calculate actual slippage experienced. What does the pattern tell you about slippage tolerance setting?',
      scoringCriteria: [
        'Swap 1: actual slippage (12.40 - 12.38) / 12.40 = 0.16% — within tolerance, good execution',
        'Swap 2: actual slippage (12.40 - 12.02) / 12.40 = 3.06% — within 3% tolerance but significant overpayment ($0.38 per 100 STRK)',
        'Swap 3: price moved more than 0.1% — revert protected the user from worse execution',
        'Pattern: 0.5% tolerance is a good balance for normal conditions — accepts minor movements, rejects significant ones',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A beginner says: "I don\'t understand why my transaction failed. I thought the blockchain just processes everything." Explain why swap transactions fail (revert) in 3 sentences, without using the words revert, slippage, or AMM.',
      scoringCriteria: [
        'Explains that the price changed between when the quote was given and when the transaction was processed',
        'Explains that the user set a maximum acceptable price change, and when the market moved beyond that, the transaction was cancelled to protect the user',
        'Correctly notes the user\'s funds are safe — the cancellation prevented the user from getting a worse deal than expected',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Advanced Swap Strategies
// ─────────────────────────────────────────────────────────────
{
  id: 'advanced-swap-strategies',
  title: 'Advanced Swap Strategies',
  explanation: `
In 1995, Warren Buffett was asked why he did not use complex derivatives to time his market entries. He replied that he did not know how to time markets consistently and that nobody else did either with reliability. His strategy: buy quality assets, hold them, and let compounding do the work. DeFi's equivalent of this wisdom is Dollar-Cost Averaging (DCA) — and on Starknet, you can automate it in a single transaction.

Large order execution requires discipline that most DeFi users ignore. If you want to sell $500,000 of STRK, submitting it as one transaction creates 30–40% price impact in all but the deepest pools. Professional traders on centralised exchanges use Time-Weighted Average Price (TWAP) algorithms — breaking large orders into small pieces executed at regular intervals to average out their market impact. On Starknet, AVNU DCA and Ekubo TWAMM replicate this for retail users.

AVNU DCA creates discrete recurring orders: swap 1,000 USDC of STRK every 7 days for 10 weeks. The protocol executes each cycle at market price on its schedule. You can set minimum and maximum price bounds — if STRK spikes above your maximum, AVNU skips that cycle. Optional but powerful for systematic buyers.

Ekubo TWAMM (Time-Weighted AMM) goes further — instead of weekly discrete swaps, it executes your order continuously, dripping tiny amounts every block over the order duration. The impact per execution is negligible. This is the most efficient mechanism for very large orders where even weekly swaps would create meaningful impact.

For large position exits (selling a large token position), the same logic applies in reverse. Never exit a concentrated position all at once. Split across multiple transactions over multiple days. Use AVNU DCA in reverse — sell a fixed amount per week over a predetermined schedule. This technique is called Exit DCA or systematic liquidation, and it is standard practice for sophisticated DeFi participants managing large positions.

Swap timing has a secondary impact via front-running avoidance. Transactions submitted during periods of low mempool activity face less competition from MEV bots. On Starknet, the sequencer orders transactions, but submitting during quieter periods still reduces MEV exposure slightly.
  `.trim(),
  visualPrompt: 'Three execution strategies shown as price charts over time: (1) Single lump sum — one large candle with big price impact arrow, (2) AVNU DCA — weekly discrete bars showing averaged entry prices, (3) Ekubo TWAMM — smooth continuous curve, minimal impact per execution. All three arrive at similar final quantity but different average costs.',
  visualType: 'static',
  visualUrl: 'swap-strategies-comparison',
  examples: [
    {
      contextTag: '[DCA beats lump sum in volatile market]',
      context: 'Two users each have $10,000 USDC to buy STRK. User A buys all $10,000 at once on day 1. User B uses AVNU DCA: $1,000 per week for 10 weeks.',
      scenario: 'STRK price over 10 weeks: $0.80, $0.65, $0.50, $0.55, $0.70, $0.90, $1.10, $0.95, $0.85, $0.80. User A buys 12,500 STRK at $0.80.',
      outcome: 'User B\'s DCA purchases: 1,250 + 1,538 + 2,000 + 1,818 + 1,429 + 1,111 + 909 + 1,053 + 1,176 + 1,250 = 13,534 STRK. Average cost: $0.739. User A: 12,500 STRK at $0.80. DCA advantage: 1,034 more STRK (8.3% more). The volatile market that alarmed User A was actually the DCA investor\'s best environment — dips are buying opportunities when you are dollar-cost averaging.',
    },
    {
      contextTag: '[Institutional exit DCA, large position]',
      context: 'A Starknet ecosystem fund holds 5,000,000 STRK acquired at an average cost of $0.15. STRK is now $0.85 and the fund wants to exit 20% of their position ($850,000 value).',
      scenario: 'Selling 1,000,000 STRK at once would create 15–20% price impact in current market conditions, reducing their effective exit price significantly. The fund\'s analyst builds an exit DCA plan.',
      outcome: 'Plan: sell 50,000 STRK per day for 20 days. Each daily sale represents 0.75% of typical daily volume — negligible impact per trade. Average exit price over 20 days reflects the STRK price movement during that period. The fund estimates this systematic exit costs them $0.02–0.03 per STRK in market impact versus a single-transaction exit that would cost $0.12–0.17 per STRK. Exit DCA saves approximately $90,000–$140,000 on the $850,000 exit.',
    },
    {
      contextTag: '[TWAMM for continuous DCA, large buyer]',
      context: 'A protocol treasury wants to deploy $500,000 USDC to buy STRK over 30 days as part of their treasury diversification strategy.',
      scenario: 'Using AVNU DCA at $16,667/day (30 days): each daily purchase creates approximately 0.8% price impact in current market conditions. Using Ekubo TWAMM: the $500,000 is streamed continuously over 30 days, executing thousands of micro-swaps throughout each day.',
      outcome: 'TWAMM price impact per execution: approximately 0.003% (essentially zero). The continuous execution also naturally averages the price across 30 days of market conditions. The treasury chooses TWAMM for the smoother execution, better price averaging, and minimal market disruption — the protocol does not want its buying activity to be detectable by arbitrageurs tracking large DeFi flows.',
    },
  ],
  keyTakeaway: 'Submitting a large position as a single transaction costs you in price impact and makes your order predictable to arbitrage bots — splitting it across time is not just better strategy, it is the professional standard.',
  guidedPractice: [
    {
      question: 'Why does DCA typically produce a lower average cost than a single lump sum purchase in volatile markets?',
      options: [
        'A. DCA gives you access to wholesale prices unavailable to lump sum buyers',
        'B. By buying fixed amounts at regular intervals, you automatically buy more units when prices are low and fewer when prices are high — averaging your cost below a random single entry point',
        'C. Protocols offer fee discounts for DCA orders',
        'D. DCA positions compound automatically, increasing the effective amount received',
      ],
      correct: 1,
      hint: 'If STRK is $0.50 this week and $1.50 next week, how many more STRK do you buy this week vs next with $100 fixed?',
      explanation: 'B is correct. With $100/week: at $0.50, you buy 200 STRK. At $1.50, you buy 66.7 STRK. You automatically accumulate more during dips. Over time, your average cost per STRK is lower than the average price over the same period. This mathematical property makes DCA effective in volatile markets without requiring any price prediction.',
    },
    {
      question: 'What is the key difference between AVNU DCA and Ekubo TWAMM?',
      options: [
        'A. AVNU DCA is more expensive; TWAMM is cheaper per execution',
        'B. AVNU executes discrete periodic swaps (daily/weekly); TWAMM executes continuously every block as a smooth stream',
        'C. AVNU supports any token pair; TWAMM only supports STRK/USDC',
        'D. AVNU DCA is for buying; TWAMM is only for selling',
      ],
      correct: 1,
      hint: 'Think about the bucket analogy: pouring water in weekly batches vs dripping water continuously from a tap.',
      explanation: 'B is correct. AVNU DCA executes at specific intervals — a weekly swap is one transaction at one specific moment in time. TWAMM executes continuously — your order is spread across every block over the order period, creating ultra-smooth averaging with near-zero price impact per execution. TWAMM is more efficient for very large orders; DCA is simpler and more predictable for regular smaller amounts.',
    },
    {
      question: 'You want to exit 500,000 STRK ($400,000 value). Selling all at once shows 18% price impact. Your exit DCA plan is to sell 25,000 STRK per day for 20 days. What is the estimated daily price impact?',
      options: [
        'A. 18% — the same impact applies regardless of trade size',
        'B. Approximately 0.9% per day — the impact scales approximately proportionally with trade size',
        'C. 0% — splitting trades eliminates price impact entirely',
        'D. 36% — splitting trades doubles the impact due to more transactions',
      ],
      correct: 1,
      hint: 'If 500,000 STRK causes 18% impact, what does 25,000 STRK (5% of 500,000) cause approximately?',
      explanation: 'B is correct. Price impact scales roughly proportionally with trade size relative to pool liquidity. 25,000 STRK is 5% of 500,000 STRK. 5% × 18% ≈ 0.9% per daily trade. The daily impact is manageable; over 20 days, arbitrageurs rebalance the pool between each trade, reducing cumulative impact further. Option C is wrong — splitting reduces but does not eliminate price impact.',
    },
    {
      question: 'You set up an AVNU DCA: $200 of STRK per week, minimum price bound $0.60/STRK. This week, STRK trades at $0.55. What happens?',
      options: [
        'A. AVNU executes the swap at $0.55 — price bounds are suggestions, not hard limits',
        'B. AVNU skips this week\'s cycle — the price is below your minimum bound',
        'C. AVNU buys double the amount to compensate for the skipped cycle',
        'D. The entire DCA order is cancelled when price hits the minimum bound',
      ],
      correct: 1,
      hint: 'Minimum price bounds protect you from buying below a floor you set. What happens when the floor is breached?',
      explanation: 'B is correct. The minimum price bound means: "do not execute this cycle if STRK is below $0.60." AVNU skips the cycle. Your $200 USDC stays unspent for that week. The DCA continues in subsequent weeks. This is useful if you believe $0.55 represents a potential crisis or further downside — you prefer to wait rather than buy into a breakdown.',
    },
    {
      question: 'A protocol treasury wants to buy $2,000,000 of STRK over 60 days to minimise market impact. Should they use AVNU DCA or Ekubo TWAMM?',
      options: [
        'A. AVNU DCA — it is simpler to set up and monitor',
        'B. Ekubo TWAMM — for a $2M position over 60 days, continuous execution minimises price impact to near-zero and prevents arbitrageurs from front-running predictable daily buy times',
        'C. Neither — $2M is too large for on-chain DCA mechanisms',
        'D. Split 50/50 between both to hedge the decision',
      ],
      correct: 1,
      hint: 'AVNU DCA executes at predictable times — a sophisticated arbitrageur could front-run a known daily $33K buy. TWAMM executes continuously — when does it execute?',
      explanation: 'B is correct. At $2M over 60 days, AVNU DCA ($33K/day) is predictable — arbitrageurs monitoring on-chain flows can front-run each daily execution. TWAMM executes every block continuously, making front-running economically unviable (each execution is too small to profit from individually). For large institutional-scale orders, TWAMM\'s continuous execution is superior.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Compare two strategies for deploying $24,000 into STRK. Strategy A: Buy all $24,000 on day 1 when STRK = $0.80. Strategy B: DCA $2,000/week for 12 weeks. STRK weekly prices: $0.80, $0.72, $0.65, $0.58, $0.70, $0.85, $1.00, $0.90, $0.80, $0.75, $0.70, $0.68. Calculate: (1) total STRK acquired by each strategy, (2) average cost per STRK for Strategy B, (3) Strategy A final value at week 12 price ($0.68).',
      scoringCriteria: [
        'Strategy A: 24,000 / 0.80 = 30,000 STRK. Value at $0.68: $20,400 (a loss of $3,600)',
        'Strategy B weekly: 2500+2778+3077+3448+2857+2353+2000+2222+2500+2667+2857+2941 = 32,200 STRK',
        'Strategy B average cost: $24,000 / 32,200 = $0.745/STRK. Value at $0.68: $21,896',
        'Strategy B outperforms by $1,496 despite both being down from the $0.80 entry — DCA advantage demonstrated',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user holds 2,000,000 STRK ($1,600,000 value) and wants to exit 50% within 30 days. Single transaction exit shows 22% price impact. Propose a specific exit DCA schedule including: daily sale amount, estimated daily price impact, total gas cost consideration, and one risk that could disrupt the plan.',
      scoringCriteria: [
        'Daily sale: 1,000,000 / 30 = 33,333 STRK per day',
        'Estimated daily impact: approximately 22% / 30 = 0.73% (proportional estimate)',
        'Gas cost note: 30 transactions at ~$0.01 each = $0.30 total — negligible via paymaster',
        'Risk identified: if STRK price falls significantly during the 30-day period, the user receives less than planned for later tranches — exit DCA locks in average not minimum price',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend says: "I need to buy $50,000 of STRK. Should I just buy it all now or set up a DCA?" Give an honest 4-sentence answer that helps them decide — not a generic "DCA is always better" answer.',
      scoringCriteria: [
        'Addresses the market context question: DCA is more beneficial in sideways or downtrending markets; lump sum is better in strongly uptrending markets',
        'Notes the psychological benefit of DCA: removes timing pressure and regret',
        'Notes the cost of DCA: if STRK trends up strongly, they buy at progressively higher prices and end up with fewer tokens',
        'Gives a practical recommendation tied to their actual situation rather than a generic answer',
      ],
    },
  ],
},

];  // end LAB2_LESSONS_1_TO_5
