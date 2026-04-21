// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 5 — DCA AND AUTOMATION
// LESSON 5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Portfolio push: Lab 5 Phase 2 Boss
// Cross-chain note: Ethereum/Solana DCA equivalents added at boss level

export const LAB5_LESSON_5 = {
  id: 'building-automated-portfolio',
  title: 'Building a Complete Automated Portfolio',
  explanation: `
In 2010, Wealthfront launched as one of the first robo-advisors — automated investment management requiring no active user decisions beyond the initial setup. It rebalanced portfolios, harvested tax losses, and reinvested dividends automatically. It managed billions within five years. The core insight: automation removes the human inconsistency that makes most individual investors underperform their own strategy.

A complete automated DeFi portfolio on Starknet has three layers running simultaneously. The yield layer generates income passively. The accumulation layer deploys that income systematically. The rebalancing layer maintains the target allocation without constant manual intervention.

The yield layer is your base: USDC deposited in Vesu generating 5%+ APY, and STRK staked in a validator pool generating 8%+ APY. These positions operate autonomously — you do nothing after setup.

The accumulation layer is automated DCA orders funded by yield. Weekly claims from staking rewards feed an AVNU DCA order. Monthly yield from Vesu funds separate DCA cycles. These orders execute without intervention.

The rebalancing layer has two components. First, a target allocation (e.g., 60% productive assets, 25% liquid USDC, 15% liquid STRK). Second, a drift threshold (e.g., act if any allocation moves more than 10% from target). When drift occurs, execute a corrective DCA to restore the target — either buy or sell the over/under-allocated asset systematically.

The monitoring requirement is lower than most DeFi users expect. Weekly: check health factors on any borrow positions, verify staking rewards accruing, review DCA order execution. Monthly: claim staking rewards and re-route to DCA, check portfolio allocation against targets, rebalance if drift exceeds threshold. Quarterly: re-evaluate validator selection, assess protocol risk for lending positions, review DCA parameters against current market conditions.

The whole system requires no daily attention — only consistent weekly and monthly discipline. Automation does not mean zero maintenance; it means appropriate maintenance at the right frequency.
  `.trim(),
  visualPrompt: 'Three-layer portfolio diagram: Layer 1 (Yield) — Vesu USDC box and Staking STRK box with passive yield arrows. Layer 2 (Accumulation) — yield arrows feeding into AVNU DCA order, DCA accumulating STRK. Layer 3 (Rebalancing) — portfolio allocation pie chart with drift alert indicator and corrective DCA arrows. Weekly/monthly maintenance calendar below.',
  visualType: 'static',
  visualUrl: 'automated-portfolio-system',
  examples: [
    {
      contextTag: '[Full system setup, $20,000 starting capital]',
      context: 'A user allocates $20,000 to build a complete automated DeFi portfolio on Starknet. Target allocation: 50% USDC in Vesu, 35% STRK staked, 15% liquid STRK.',
      scenario: 'Initial setup: $10,000 USDC to Vesu at 5.4% APY. $7,000 USDC → 8,750 STRK at $0.80 → staked at 8.8% APY. $3,000 in liquid STRK. AVNU DCA: $96/week (Vesu weekly yield $10,000 × 5.4% / 52) into STRK.',
      outcome: 'System running: Vesu earns $540/year, funding 52 × $10 DCA cycles (approximated). Staking earns 770 STRK/year ($616 at $0.80). Portfolio rebalances quarterly if any allocation drifts above 10% from target. Weekly time cost: 5 minutes to check positions. Monthly: 15 minutes to claim rewards and review. The system compounds across all three layers with minimal active management.',
    },
    {
      contextTag: '[Monitoring reveals a problem, early detection]',
      context: 'During a weekly check, a user notices their staking position shows 0.2 STRK in rewards after 14 days — expected was approximately 19 STRK based on their 8.5% APY on 5,000 STRK.',
      scenario: 'The user investigates. They check getPoolPosition() and compare to expected accrual.',
      outcome: 'Identified: the validator pool has been experiencing 12% downtime over the past 2 weeks. The weekly monitoring caught a performance issue early. The user initiates exitPoolIntent() and begins the 21-day migration to a new validator. If they had monitored monthly, they would have missed 6+ more weeks of reduced rewards. Weekly monitoring at the right intervals caught the problem while it was still recoverable.',
    },
    {
      contextTag: '[Quarterly rebalancing, allocation drift]',
      context: 'Three months in, STRK has risen 60% to $1.28. The user\'s portfolio has drifted from the target allocation.',
      scenario: 'Current values: Vesu $10,270 (5.4% for 3 months). Staked STRK: 8,750 × $1.28 = $11,200. Liquid STRK: 3,000 × $1.28 = $3,840. Total: $25,310. Allocation: Vesu 40.6%, Staked STRK 44.3%, Liquid STRK 15.2%.',
      outcome: 'Target: 50% Vesu, 35% staked, 15% liquid. Staked STRK has drifted from 35% to 44.3% — above the 10% drift threshold. Corrective action: initiate exit DCA on 9.3% of total portfolio value ($2,354) from staked STRK to USDC, then deposit to Vesu. Rebalancing restores the target without a large single transaction. The system stays aligned with the original risk parameters.',
    },
  ],
  keyTakeaway: 'Automation does not mean zero maintenance — it means the right maintenance at the right frequency, which for most positions is five minutes weekly to verify nothing has silently gone wrong.',
  guidedPractice: [
    {
      question: 'What is the recommended monitoring frequency for a Starknet borrow position with STRK collateral?',
      options: [
        'A. Annually — DeFi positions are designed to be hands-off',
        'B. Monthly — checking once per month is standard practice',
        'C. Daily or more during volatile periods — STRK\'s volatility can move health factors 10-20% in a single day',
        'D. Only when the protocol sends a notification',
      ],
      correct: 2,
      hint: 'STRK can move 15%+ in a single day. Health factor moves with collateral price. At what frequency do you need to know about that?',
      explanation: 'C is correct. STRK has experienced daily moves of 10–20% during volatile periods. A health factor that was 1.8 in the morning can be 1.2 by evening after a 15% decline — dangerously close to your personal alert threshold of 1.3. Borrow positions with volatile collateral require daily monitoring at minimum. There are no push notifications in non-custodial DeFi — you are responsible for your own position health.',
    },
    {
      question: 'Your automated portfolio runs for 6 months with no monitoring. What is the most likely thing to have gone wrong?',
      options: [
        'A. Nothing — automated portfolios are designed to run without monitoring',
        'B. Validator downtime reduced staking rewards without you knowing, and/or a borrow position health factor declined without triggering action',
        'C. The DCA protocol automatically cancelled your orders after 90 days of inactivity',
        'D. Vesu automatically reduced your supply APY to zero after 6 months',
      ],
      correct: 1,
      hint: 'What events can happen to your positions without your intervention that require action?',
      explanation: 'B is correct. Two common silent failures in automated portfolios: validator downtime silently reduces rewards without any notification, and collateral price declines silently reduce health factors without triggering any external alert. "Automated" means the execution runs without you — it does not mean the positions are immune to events requiring human judgment and response.',
    },
    {
      question: 'Portfolio target 60% STRK / 40% USDC. Current: 72% STRK / 28% USDC (total portfolio $30,000). Drift threshold 10%. Is rebalancing required and if so, what action?',
      options: [
        'A. No rebalancing — 72% is close enough to 60%',
        'B. Yes — STRK is 12% above target. Sell $3,600 of STRK via exit DCA and move proceeds to USDC to restore 60/40.',
        'C. Yes — buy more USDC by borrowing against STRK collateral',
        'D. Yes — sell all STRK and restart from 0% STRK allocation',
      ],
      correct: 1,
      hint: 'Drift: 72% - 60% = 12%. This exceeds the 10% threshold. To return to 60%, how much STRK do you sell?',
      explanation: 'B is correct. Required STRK at 60%: $30,000 × 60% = $18,000. Current STRK: $30,000 × 72% = $21,600. Sell: $21,600 - $18,000 = $3,600 of STRK. Resulting USDC: $30,000 × 28% + $3,600 = $12,000 = 40% of portfolio. Exit DCA the $3,600 over 2–3 weeks to minimise impact. Option C adds leverage complexity where simple rebalancing suffices.',
    },
    {
      question: 'You want your DCA order funded entirely from yield — no principal reduction. Current Vesu yield: $82/month. You set a DCA at $100/week ($400/month). What happens over time?',
      options: [
        'A. Nothing changes — yield and DCA run independently',
        'B. You spend $318/month ($400 - $82) from principal. Over time this reduces your Vesu balance, which reduces yield, which creates a negative spiral.',
        'C. The DCA automatically scales down to match yield',
        'D. Vesu automatically tops up your wallet to cover the shortfall',
      ],
      correct: 1,
      hint: 'If you spend $400/month and earn $82/month, what is the net monthly change in your USDC balance?',
      explanation: 'B is correct. $400/month DCA - $82/month yield = $318/month principal reduction. Smaller Vesu balance → less yield → even more principal needed to fund the DCA → accelerating depletion. This is why yield-funded DCA must be sized at or below the yield rate. At $82/month yield, the maximum sustainable DCA is $82/month — not $100/week.',
    },
    {
      question: 'What are the three layers of a complete automated Starknet DeFi portfolio?',
      options: [
        'A. Trading, hedging, and tax optimisation',
        'B. Yield generation (Vesu + staking), yield-funded accumulation DCA, and target-allocation rebalancing',
        'C. Lending, borrowing, and liquidation',
        'D. Staking, governance, and grant applications',
      ],
      correct: 1,
      hint: 'Think about the three functions described in this lesson: generating income, deploying that income, and maintaining portfolio balance.',
      explanation: 'B is correct. Layer 1 (yield): passive income from Vesu lending and STRK staking — runs autonomously. Layer 2 (accumulation): DCA orders funded by Layer 1 yield — executes automatically. Layer 3 (rebalancing): portfolio drift detection and corrective DCA when allocation exceeds target thresholds. Together these three create a self-sustaining, autonomously compounding DeFi portfolio.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Design a complete automated portfolio with $35,000. Target allocation: 45% USDC in Vesu, 40% STRK staked, 15% liquid STRK. Current rates: Vesu 5.7% APY, staking 8.9% APY net, STRK at $0.80. Show: (1) initial dollar allocation per layer, (2) weekly yield from each source, (3) maximum sustainable combined DCA amount, (4) monitoring schedule.',
      scoringCriteria: [
        'Allocation: $15,750 Vesu, $14,000→17,500 STRK staked, $5,250 liquid STRK',
        'Weekly Vesu yield: $15,750 × 5.7% / 52 = $17.27/week',
        'Weekly staking yield: 17,500 × 8.9% / 52 = 29.95 STRK × $0.80 = $23.96/week',
        'Combined DCA: $17.27 + $23.96 = $41.23/week maximum',
        'Monitoring: borrow positions daily (if any), staking weekly, Vesu weekly, rebalancing quarterly',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You have built a three-layer automated portfolio. After 4 months of operation, you review and find: (1) Staking rewards are 40% below expected — validator has been experiencing repeated downtime. (2) Vesu pool utilisation has risen to 88% — supply APY increased but withdrawal may be slower. (3) STRK has risen 35% — portfolio allocation has drifted to 58% STRK vs 40% target. Prioritise your three required actions in order and justify the ranking.',
      scoringCriteria: [
        'Action 1 (highest priority): Begin validator exit process — ongoing downtime is bleeding rewards silently and slashing risk increases with unreliable validators',
        'Action 2: Rebalancing STRK back toward 40% target — drift of 18% exceeds 10% threshold and should be corrected',
        'Action 3 (monitor but no immediate action): Vesu 88% utilisation — note for next withdrawal, but supply APY is higher which compensates somewhat. Not urgent if withdrawal is not needed soon.',
        'Ranking justification: validator exit has ongoing cost that compounds daily. Rebalancing prevents further drift. Vesu is elevated but not at crisis point.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a 5-sentence summary of what you have built across Labs 1–5 that you could use to explain your Starknet DeFi competence in a job interview at a Starknet-native protocol. It should cover: what you understand, what you can operate, and what you can build.',
      scoringCriteria: [
        'Covers conceptual understanding: DeFi primitives, risk taxonomy, yield sources, market mechanics',
        'Covers operational competence: real testnet transactions across swaps, staking, lending, and DCA with verified tx hashes',
        'Covers system-building: the three-layer automated portfolio with composable protocols',
        'Mentions Starknet-specific context: AVNU, Vesu, Ekubo, Starkzap SDK, account abstraction',
        'Interview-appropriate tone — confident and specific, not vague or generic',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMULATIONS
// ─────────────────────────────────────────────────────────────
export const LAB5_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'judgment-communication'],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 5 lessons. Tests DCA mathematics, AVNU DCA mechanics, TWAMM, composable strategies, and automated portfolio management.',
};

// ─────────────────────────────────────────────────────────────
// BUILD TASK
// ─────────────────────────────────────────────────────────────
export const LAB5_BUILD_TASK = {
  id: 'navigator-lab-5-build',
  title: 'DCA System Setup and Analysis',
  labProgressionNumber: 5,
  type: 'execution-plus-analysis',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',
  description: `
PART 1 — DCA execution on Sepolia testnet
Create an AVNU DCA order: $5 USDC per cycle, weekly, buying STRK.
Before creating: call previewCycle() and record the expected STRK output.
Record: DCA creation tx hash, order ID from getOrders(), previewCycle() output.
After 1 simulated cycle (or using a testnet fast-forward if available):
Record: actual STRK received vs previewCycle estimate.

PART 2 — Yield-funded DCA design
You have $25,000 USDC in Vesu at 5.4% APY and 8,000 STRK staked at 8.6% APY (STRK = $0.80).
Calculate: (1) weekly Vesu yield, (2) weekly staking yield in USD, (3) maximum combined weekly DCA
that leaves both principals intact. Design the DCA parameters.

PART 3 — Exit DCA strategy
You hold 50,000 STRK ($40,000 at $0.80). You want to exit 30% over 60 days.
Single-transaction price impact: 12%.
Design a complete exit DCA plan: daily sale amount, estimated daily price impact,
total gas cost estimate (Starknet-native with paymaster), one risk that could disrupt the plan.

PART 4 — TWAMM vs AVNU DCA decision
Given a $250,000 order to buy STRK over 45 days, justify your choice between
AVNU DCA (weekly, $5,556/cycle) and Ekubo TWAMM (continuous).
Use specific numbers: estimated price impact for each approach, front-running exposure,
flexibility trade-offs.
  `.trim(),
  outputType: 'execution-record-plus-analysis',
  outputFormat: 'markdown',
  verificationMethod: 'tx-hash-verification-plus-rubric',
  scoringCriteria: [
    'DCA creation tx hash valid on Sepolia',
    'Order ID correctly retrieved from getOrders()',
    'previewCycle() output recorded with correct STRK amount',
    'Part 2 calculations mathematically correct — weekly yields and combined DCA amount',
    'Part 3 exit plan: daily sale = 50,000 × 30% / 60 = 250 STRK/day. Impact calculation reasonable.',
    'Part 4 TWAMM vs DCA recommendation justified with specific numbers and honest trade-off discussion',
  ],
};

// ─────────────────────────────────────────────────────────────
// BOSS BATTLE
// ─────────────────────────────────────────────────────────────
export const LAB5_BOSS = {
  phase1: {
    id: 'navigator-lab-5-boss-phase1',
    title: 'Lab 5 Boss — Phase 1: DCA and Automation Gauntlet',
    description: 'Unlimited attempts. Hints available. 10 tasks from pool of 22.',
    hints: true,
    portfolioPush: false,
    taskPool: {
      totalTasks: 22,
      drawPerAttempt: 10,
      taskTypes: [
        'DCA $300/week for 5 weeks. Prices: $0.90, $0.75, $0.60, $0.70, $0.85. Calculate total STRK and average cost. What is the TWAP?',
        'You DCA $500/week. Week 3 price is $0.45 — below your $0.50 minimum bound. Week 5 price is $1.35 — above your $1.20 max. Total STRK after 5 weeks if weeks 3 and 5 skip?',
        'previewCycle() returns amountOutBase: 625000000000000000000 for STRK (18 decimals). How many STRK?',
        'Compare: lump sum $10,000 at $0.80 vs DCA $1,000/week for 10 weeks. Prices: $0.80, $0.85, $0.70, $0.65, $0.60, $0.75, $0.80, $0.90, $0.95, $1.00. Which produces more STRK?',
        'You have $15,000 in Vesu at 5.9% APY. What is the maximum weekly DCA amount fully funded by yield?',
        'Why does DCA average cost typically fall below TWAP? Give a mathematical example.',
        'AVNU DCA vs Ekubo TWAMM: a $500,000 purchase over 90 days. Which do you choose and why? Give three specific reasons.',
        'You cancel your DCA order mid-cycle. What happens to your unspent USDC? What happens to STRK already purchased?',
        'Design a staking-rewards-funded DCA: 30,000 STRK staked at 9.2% APY. Monthly reward value in USD at $0.75/STRK. Weekly DCA budget.',
        'Portfolio: $18,000 total, target 65% STRK / 35% USDC. Current: $13,500 STRK (75%), $4,500 USDC (25%). Rebalancing action required?',
        'Exit DCA: 200,000 STRK ($160,000 at $0.80). Single-transaction impact: 18%. Design exit DCA with daily amount and estimate daily impact.',
        'Your Vesu-funded DCA runs for 6 months but you set DCA at $120/week and Vesu yields $95/week. How much principal has been consumed?',
        'TWAMM order: $200,000 over 30 days. How many effective micro-executions on Starknet (30-second blocks)? What is the dollar amount per micro-execution?',
        'DCA variance reduction: explain why a $10,000 lump sum one day before a 40% crash results in a worse outcome than $1,000/week for 10 weeks starting the same day.',
        'You are bullish on STRK: it will double in 6 months. Should you DCA or lump sum? Justify quantitatively.',
        'Three-layer portfolio with $50,000: allocate between Vesu, staking, and liquid. Calculate weekly yield from each layer and combined DCA capacity.',
        'Cross-lab synthesis (from Lab 4): your DCA order is buying STRK weekly. Meanwhile you also have a borrow position with STRK as collateral. STRK drops 20%. How do both positions interact and what is your priority action?',
        'What happens during a DCA cycle if AVNU cannot find a route with price impact below your implicit slippage tolerance? Does the cycle execute or skip?',
        'Automated portfolio monitoring: what is the minimum monitoring frequency for (a) a Vesu supply position, (b) a borrow position with STRK collateral, (c) a staking position, (d) an active AVNU DCA order?',
        'You want to rebalance monthly regardless of drift. Your portfolio is $30,000 with 60/40 STRK/USDC target. After one month of 8% STRK price increase, calculate new allocation and rebalancing trade.',
        'A user says "my DCA is fully automated, I don\'t need to check anything." Name three events that could silently harm their positions without triggering any notification.',
        'Cross-chain awareness: on Ethereum mainnet, gas costs make weekly DCA impractical for amounts below $5,000. On Starknet with AVNU paymaster, what is the minimum practical DCA amount and why?',
      ],
    },
  },

  phase2: {
    id: 'navigator-lab-5-boss-phase2',
    title: 'Lab 5 Boss — Phase 2: Automation Portfolio Certification',
    description: 'No hints. Portfolio push. 100% pass required.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are completing your Junior Starknet DeFi Navigator certification.
This is the capstone of the Junior level — demonstrating you can build and
operate a complete automated Starknet DeFi portfolio.

Complete all five tasks. Tasks 1–3 require transaction hashes.

TASK 1 — DCA setup with documentation
Create an AVNU DCA order on Sepolia: 2 USDC/week into STRK.
Record: previewCycle() output, creation tx hash, order ID.
Show the calculation proving this DCA is yield-funded (what Vesu balance
at 5.5% APY would generate exactly $2/week in yield?).

TASK 2 — Portfolio position summary
Using all positions from Labs 2–5, document your complete Sepolia testnet portfolio:
  - Any active swap positions or token balances (from Lab 2)
  - Active staking position and current rewards (from Lab 3)
  - Active lending/borrow position and current health factor (from Lab 4)
  - Active DCA order (Task 1 above)

TASK 3 — Rebalancing trade
Your portfolio has drifted. Identify the asset most over-represented vs your target.
Execute one corrective swap on Sepolia to begin rebalancing.
Record the transaction hash. State your target allocation and current drift.

TASK 4 — Full automated portfolio design (written, no transaction)
You have $50,000 to deploy on Starknet mainnet.
Design a complete three-layer automated portfolio:
  - Layer 1 (Yield): specific allocations to Vesu and staking. Dollar amounts, protocols, expected APYs, weekly yield from each.
  - Layer 2 (Accumulation): DCA order size funded by Layer 1 yield. AVNU DCA or TWAMM and why.
  - Layer 3 (Rebalancing): target allocations with specific percentages. Drift threshold. Rebalancing mechanism.
  - Total expected annual return in dollar terms and as percentage of $50,000.
  - Monitoring schedule: what you check, when, and what triggers action.

TASK 5 — Cross-chain comparison (written)
Compare your Starknet DCA system to the equivalent on Ethereum mainnet and Solana.
Cover three differences and one area where Starknet is specifically better.
Ethereum mainnet DCA equivalent: Uniswap v3 limit orders or third-party DCA protocols.
Solana DCA equivalent: Jupiter DCA feature.
    `.trim(),

    scoringCriteria: [
      'Task 1: previewCycle() documented. Tx hash valid. Order ID recorded. Vesu balance calculation correct ($2/week ÷ 5.5% APY × 52 = $1,890 in Vesu).',
      'Task 2: All four active position types documented with current values. Health factor included for borrow positions.',
      'Task 3: Corrective swap tx hash valid. Drift correctly identified. Target allocation stated.',
      'Task 4: All three layers specified with dollar amounts and APYs. Weekly yield sum matches DCA size. Rebalancing mechanism is specific. Annual return calculated. Monitoring schedule is actionable.',
      'Task 5: Three meaningful differences identified (not superficial). Starknet advantage is specific — e.g., gasless paymaster makes micro-DCA ($2/week) viable where Ethereum gas would exceed the DCA amount itself.',
    ],

    crossChainNote: `
## Cross-Chain DCA Context (shown after Phase 2 completion)

The DCA strategy you just built on Starknet is available across major chains —
but with meaningful differences:

**Ethereum mainnet:** Third-party DCA protocols (DeFi Saver, Gelato) automate purchases,
but gas costs of $5–30 per execution make weekly DCA impractical below $1,000/cycle.
TWAMM is available via certain AMMs. Uniswap v3 limit orders approximate DCA functionality.
Minimum viable DCA amount: approximately $500/week to justify gas.

**Solana:** Jupiter DCA offers one-click automated recurring purchases with very low fees ($0.001/tx).
Supports price bounds similar to AVNU. No TWAMM equivalent. Execution is centralised through
Jupiter's routing — similar trust model to AVNU. Minimum viable: less than $1 per cycle.

**Starknet advantage:** AVNU Paymaster makes DCA fully gasless — even a $2/week DCA executes
at zero cost to the user. This makes yield-funded micro-DCA (funding $2/week from a $1,890 Vesu
position) viable in a way that is economically impossible on Ethereum mainnet, where gas
would exceed the DCA amount itself.
    `.trim(),

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/junior/lab-5-dca-automation/',
      files: [
        {
          filename: 'dca-automation-record.md',
          type: 'narrative',
          content: `# Lab 5 — DCA and Automation: Portfolio Certification
## Junior Level Capstone

## Task 1 — DCA Setup
- previewCycle() output: [expected STRK per $2 cycle]
- DCA creation tx hash: [hash]
- Order ID: [order ID]
- Yield-funded proof: $2/week ÷ 5.5% APY × 52 = $[calculated] required in Vesu

## Task 2 — Complete Portfolio Summary (Sepolia Testnet)
| Position | Protocol | Amount | APY/Status | Notes |
|---|---|---|---|---|
| Token holdings | — | | — | From Lab 2 swaps |
| Staking | Validator | STRK | % APY | Rewards: STRK |
| Lending supply | Vesu | USDC | % APY | |
| Borrow (if active) | Vesu | USDC | Health factor: | |
| DCA order | AVNU | $/week | Active | Order ID: |

## Task 3 — Rebalancing Trade
- Target allocation: [%] STRK / [%] USDC
- Current allocation: [%] STRK / [%] USDC
- Drift: [asset] is [%] above/below target
- Corrective swap tx hash: [hash]

## Task 4 — Automated Portfolio Design ($50,000)

### Layer 1: Yield Generation
| Position | Amount | Protocol | APY | Weekly Yield |
|---|---|---|---|---|
| USDC supply | $[amount] | Vesu | [%] | $[weekly] |
| STRK stake | [STRK] | [Validator] | [%] | $[weekly] |
| **Total weekly yield** | | | | **$[total]** |

### Layer 2: Accumulation DCA
- Weekly DCA amount: $[yield total]
- Mechanism: [AVNU DCA / TWAMM] — Reason: [justification]
- Token being accumulated: STRK

### Layer 3: Rebalancing
- Target: [%] USDC / [%] STRK staked / [%] STRK liquid
- Drift threshold: [%] before action
- Rebalancing mechanism: [exit DCA / swap]

### Expected Annual Return
| Source | Annual Amount | Notes |
|---|---|---|
| Vesu yield | $[amount] | |
| Staking yield | $[amount] STRK | |
| DCA accumulation | [STRK amount] | Valued at current price |
| **Total** | **$[total]** | **[%] on $50,000** |

### Monitoring Schedule
| Frequency | What to Check | Trigger for Action |
|---|---|---|
| Weekly | Staking rewards accrual | Zero rewards → investigate validator |
| Weekly | DCA execution history | Missed cycles → check price bounds |
| Monthly | Portfolio allocation | Drift > [%] → rebalance |
| Quarterly | Validator performance | Uptime < 99.5% → consider migration |

## Task 5 — Cross-Chain DCA Comparison
[Three differences between Starknet, Ethereum mainnet, and Solana DCA]
[Specific Starknet advantage with supporting calculation]

## Junior DeFi Navigator — Certification Complete
Labs completed: 1 (Mental Models) · 2 (Swaps) · 3 (Staking) · 4 (Lending) · 5 (DCA)
Portfolio pushes: Labs 2, 3, 4, 5
Total verified testnet transactions: [count]
Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 5 DCA & Automation — Junior Starknet DeFi Navigator COMPLETE',
      badgeEarned: 'Junior Starknet DeFi Navigator — Certified',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const NAVIGATOR_LAB_5_META = {
  id: 'navigator-junior-lab-5',
  title: 'DCA and Automation',
  trackId: 'starknet-defi-navigator',
  level: 'junior' as const,
  labNumber: 5,
  estimatedHours: 4,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  isJuniorCapstone: true,
  lessonCount: 5,
  prerequisite: 'Lab 4 Phase 2 complete',
  description: 'DCA mathematics, AVNU DCA mechanics, Ekubo TWAMM, composable strategies, and complete automated portfolio design. Junior level capstone with cross-chain comparison.',
  nextLevel: 'Intermediate — Lab 6: Portfolio Strategy and Allocation',
};
