// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 6 — PORTFOLIO STRATEGY AND ALLOCATION
// LESSON 5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Written to lesson_writing_instructions.txt standard
// Portfolio push: Lab 6 Phase 2 Boss

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Portfolio Rebalancing
// Dominant concept: when allocation drifts from target,
// systematic correction restores the intended risk profile.
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_5 = {
  id: 'portfolio-rebalancing',
  title: 'Portfolio Rebalancing: Restoring Your Intended Risk',

  explanation: `
You set a target in January: 60% of your capital in STRK-denominated yield, 25% in USDC lending, 15% liquid. By June, STRK has risen 45%. Without any action on your part, STRK now represents 71% of your portfolio. The 15% liquid buffer has shrunk to 8%. The risk profile you chose in January no longer exists — and you did not consciously decide to change it.

This is what allocation drift looks like. You started with a plan. Market movements executed a different plan on your behalf.

Set a threshold before you start — for example, 10 percentage points from any target. When any position drifts beyond that threshold, you correct it. You sell the over-represented asset and add to the under-represented one until each position returns to target. This response to drift — selling what grew too large and buying what shrank too small — is called rebalancing.

Rebalancing has a counterintuitive property. It forces you to sell assets that performed well and buy assets that performed poorly. This feels wrong in the moment. But it is exactly what systematic investing requires: reducing concentration in what already ran up, and adding to what is now cheaper. Over long periods, this automatic sell-high-buy-low discipline has been shown to improve risk-adjusted returns compared to portfolios left unmanaged.

Two timing approaches exist. Threshold-based rebalancing triggers only when drift exceeds a specific threshold — 10 percentage points is the trigger, not the calendar. Time-based rebalancing triggers on a fixed schedule — monthly or quarterly — regardless of how much drift occurred. In practice, threshold-based rebalancing is more capital-efficient: you act when action is genuinely needed, not on an arbitrary schedule.

On Starknet, rebalancing uses the tools you already know. An over-weight STRK staking position requires declaring exit intent — recall the 21-day unbonding window — so plan corrections at least 25 days before the rebalanced capital needs to be deployed. A correction to an under-weight USDC position in Vesu — the lending protocol from Lab 4 where you supply assets to earn yield — can happen immediately. Exit DCA — the systematic selling technique from Lab 5 — is appropriate for large corrections that would otherwise create price impact if executed at once.
  `.trim(),

  visualPrompt: 'Three horizontal allocation bars stacked vertically — no text required to understand what is happening. Bar 1 labelled TARGET: three segments exactly matching the intended split. Bar 2 labelled AFTER 6 MONTHS: the STRK segment has grown visibly wider, the liquid segment visibly narrower, drift arrows showing each deviation in percentage points. Bar 3 labelled AFTER REBALANCING: segments restored to match Bar 1. The visual shows the full cycle: intended → drifted → corrected.',
  visualType: 'static',
  visualUrl: 'rebalancing-drift-correction',

  examples: [
    {
      contextTag: '[Threshold-based trigger, STRK bull market]',
      context: 'A portfolio is set with target: 55% STRK staking, 30% USDC in Vesu, 15% liquid. The threshold is 8 percentage points from any target. Starting value: $40,000.',
      scenario: 'Over four months, STRK rises 38%. The portfolio is now: $24,200 STRK staking (56.2%), $13,200 USDC Vesu (30.7%), $5,720 liquid (13.3%). Checking each position: STRK drifted +1.2 points, Vesu +0.7 points, liquid -1.7 points. No threshold is exceeded.',
      outcome: 'No rebalancing occurs. The drift is within acceptable bounds — the risk profile is still substantially intact. Threshold-based rebalancing avoids the transaction and tax costs of unnecessary corrections. The portfolio continues running. The next check is in one month.',
    },
    {
      contextTag: '[Threshold breached, STRK outperforms significantly]',
      context: 'Same portfolio six months later. STRK has risen another 60% since the last check. Current values: $38,720 STRK staking (67.4%), $13,800 USDC Vesu (24.0%), $4,960 liquid (8.6%). Total: $57,480.',
      scenario: 'Checking against targets: STRK is +12.4 points above target (55%), Vesu is -6 points below (30%), liquid is -6.4 points below (15%). STRK has breached the 8-point threshold. Rebalancing is triggered.',
      outcome: 'Target STRK at 55%: $57,480 × 55% = $31,614 required. Current STRK: $38,720. Excess: $7,106 — initiate exit DCA on $7,106 of STRK over 3 weeks to minimise impact. Proceeds split: $3,448 to Vesu (restoring 30% = $17,244), $3,658 to liquid reserve (restoring 15% = $8,622). Exit intent declared today. Capital redeployed in 25 days.',
    },
    {
      contextTag: '[Time-based vs threshold-based, cost comparison]',
      context: 'Two investors both manage $50,000 with identical 60/25/15 targets. Investor A rebalances monthly. Investor B rebalances when any position drifts more than 10 points.',
      scenario: 'Over 12 months of moderate STRK volatility (range: -15% to +20%), Investor A rebalances 12 times. Investor B rebalances twice — once after a 12-point STRK surge in month 3, once after a 13-point STRK drop in month 9.',
      outcome: 'Investor A executed 12 corrective swaps. Each swap involves AVNU routing — the aggregator from Lab 2 — and Vesu deposits and withdrawals. Investor B executed 4 total transactions across 2 rebalancing events. At $0 gas on Starknet, the cost difference is minimal. But Investor B made fewer decisions under emotional conditions — the threshold acted as a filter against overtrading during volatile periods when the impulse to act is highest.',
    },
  ],

  keyTakeaway: 'Left unmanaged, market movements silently change your risk profile — rebalancing restores your intended allocation by selling what grew too large and adding to what shrank too small.',

  guidedPractice: [
    {
      question: 'Your target is 50% STRK staking, 35% USDC Vesu, 15% liquid. Today your allocation reads 52% STRK, 34% Vesu, 14% liquid. Your threshold is 8 percentage points. Do you rebalance?',
      options: [
        'A. Yes — any drift from target requires immediate correction',
        'B. No — the largest drift is 2 percentage points, well within the 8-point threshold',
        'C. Yes — STRK is above target, which always requires selling',
        'D. No — rebalancing is only required once per quarter',
      ],
      correct: 1,
      hint: 'Compare each position\'s actual percentage to its target. What is the maximum deviation?',
      explanation: 'B is correct. STRK drifted 2 points above target. Vesu drifted 1 point below. Liquid drifted 1 point below. None exceeded the 8-point threshold. Option A would result in constant small corrections that waste transaction effort and potentially trigger unnecessary tax events. Option C incorrectly treats any above-target position as an automatic sell signal. Option D is time-based logic — this portfolio uses threshold-based rules.',
    },
    {
      question: 'STRK rises 50%. Your STRK staking position was $20,000 of a $40,000 portfolio (50% target). After the rise, total portfolio is $50,000 and STRK staking is $30,000. What is STRK\'s new allocation percentage and how far has it drifted from target?',
      options: [
        'A. 60% — drifted 10 percentage points above the 50% target',
        'B. 75% — drifted 25 percentage points above target',
        'C. 50% — price appreciation does not affect allocation percentage',
        'D. 55% — drifted 5 percentage points above target',
      ],
      correct: 0,
      hint: 'New STRK allocation = new STRK value / new total portfolio value. $30,000 / $50,000 = ?',
      explanation: 'A is correct. $30,000 / $50,000 = 60%. Drifted 10 percentage points above the 50% target. Option C is wrong — price appreciation changes absolute values, which changes the percentage even if you made no trades. Option B overstates the drift. Option D understates it.',
    },
    {
      question: 'You need to reduce your STRK staking position by $8,000 as part of a rebalancing. STRK is currently $0.85. Today is March 1st. When is the earliest the rebalanced capital can be deployed elsewhere?',
      options: [
        'A. March 1st — STRK staking exits are immediate',
        'B. March 8th — one week for standard processing',
        'C. March 22nd — 21-day unbonding period starts from exit intent today',
        'D. April 1st — one full month for rebalancing to complete',
      ],
      correct: 2,
      hint: 'Recall the staking exit mechanics from Lab 3. What starts the 21-day clock, and when can the capital be redeployed?',
      explanation: 'C is correct. Exit intent declared March 1st starts the 21-day unbonding period — the mechanism from Lab 3. The earliest the STRK returns to your wallet is March 22nd. Only then can you deploy it into Vesu or the liquid reserve. This means rebalancing a staking position requires 25+ days of planning. Options A and B ignore the unbonding requirement. Option D is too long.',
    },
    {
      question: 'Your $60,000 portfolio is 70% STRK staking, 20% Vesu, 10% liquid. Target: 50%, 35%, 15%. Which correction should you execute first and why?',
      options: [
        'A. Add to Vesu first — easiest to execute',
        'B. Add to liquid reserve first — most urgent for safety',
        'C. Declare exit intent on excess STRK first — it takes 21 days, so starting immediately prevents a longer delay before capital can be redeployed to under-weight positions',
        'D. All corrections simultaneously — timing does not matter',
      ],
      correct: 2,
      hint: 'Which action has a time delay attached to it? Starting that action first determines the overall rebalancing timeline.',
      explanation: 'C is correct. The STRK exit — recall the 21-day unbonding from Lab 3 — is the rate-limiting step. Declaring exit intent on the excess STRK today means capital is available in 21 days. If you add to Vesu or liquid reserve first using other capital, you have corrected two positions but the largest correction (STRK is 20 points over-weight) is still pending. Start the longest operation first to compress the total rebalancing timeline.',
    },
    {
      question: 'Portfolio target: 55% STRK staking, 30% USDC Vesu, 15% liquid. Total value: $80,000. Current: $49,600 STRK (62%), $22,400 Vesu (28%), $8,000 liquid (10%). Threshold is 8 points. Calculate the exact dollar correction needed for each position to restore targets.',
      options: [
        'A. Sell $5,600 STRK. Add $1,600 to Vesu. Add $4,000 to liquid.',
        'B. Sell $4,000 STRK. Add $2,000 to Vesu. Add $2,000 to liquid.',
        'C. No rebalancing needed — all positions within 8-point threshold',
        'D. Sell $8,000 STRK. Add $4,000 to Vesu. Add $4,000 to liquid.',
      ],
      correct: 0,
      hint: 'Calculate target dollar value for each: STRK = $80,000 × 55%, Vesu = $80,000 × 30%, Liquid = $80,000 × 15%. Then subtract current values.',
      explanation: 'A is correct. Target values: STRK = $44,000, Vesu = $24,000, Liquid = $12,000. Corrections: STRK excess = $49,600 - $44,000 = $5,600 to sell. Vesu shortfall = $24,000 - $22,400 = $1,600 to add. Liquid shortfall = $12,000 - $8,000 = $4,000 to add. Total corrections balance: $5,600 sold = $1,600 + $4,000 deployed. STRK has drifted 7 points above target — one point below the 8-point threshold, so this correction is elective rather than required, but restoring balance is prudent.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Your portfolio target is 45% STRK staking, 40% USDC Vesu, 15% liquid. Threshold: 10 points. Starting value six months ago: $50,000. Today\'s values: STRK staking $31,500, Vesu $19,200, liquid $7,300. Total: $58,000. Calculate: (1) current allocation percentages for each position, (2) drift from target for each, (3) whether the threshold is breached, (4) if yes, the exact dollar correction for each position.',
      scoringCriteria: [
        'Current allocations: STRK 54.3%, Vesu 33.1%, liquid 12.6%',
        'Drift: STRK +9.3 points, Vesu -6.9 points, liquid -2.4 points',
        'Threshold check: STRK at +9.3 points is within 10-point threshold — no rebalancing triggered',
        'Correct conclusion: no action required at this time. Next check in one month.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You rebalance on a fixed monthly schedule regardless of drift. In month 4, your STRK position is 2 points above target. You execute a corrective swap anyway. In month 7, STRK drops 25% in a single week. Your health factor on a borrow position — the safety metric from Lab 4 — falls to 1.15 and you need $12,000 liquid immediately. Your liquid reserve is at target (15% = $9,000). Identify the mistake in your rebalancing approach and how a threshold-based system would have prevented this specific problem.',
      scoringCriteria: [
        'Mistake identified: monthly rebalancing corrected a 2-point STRK excess in month 4, deploying the small correction into Vesu. This unnecessarily reduced the liquid reserve\'s growth rate.',
        'Threshold system difference: a 10-point threshold would not have triggered in month 4 — the correction would not have happened, leaving slightly more capital available for emergencies.',
        'Core lesson: frequent small rebalances train the portfolio toward targets mechanically but can consume optionality capital that has emergency value.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You manage a DeFi portfolio for a friend who asks: "My STRK position has been growing — should I sell some to rebalance? It feels wrong to sell something that\'s going up." Explain in 3 sentences why rebalancing after strong performance is not a mistake, using only the logic of the correction, not market predictions.',
      scoringCriteria: [
        'Explains that selling a grown position is not a prediction that it will fall — it is a restoration of the risk exposure you chose when you started',
        'States the mechanical benefit: selling high and buying the under-weight asset low is exactly what the system produces when followed consistently',
        'Addresses the emotional frame: the feeling of selling something performing well is the correct signal that rebalancing is doing its job',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMULATIONS
// ─────────────────────────────────────────────────────────────

export const LAB6_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: [
    'judgment-riskAssess',
    'judgment-dataInterpret',
    'judgment-communication',
  ],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 6 lessons. Tests allocation frameworks, risk-adjusted yield, protocol risk assessment, cross-protocol composability, and portfolio rebalancing.',
};

// ─────────────────────────────────────────────────────────────
// BUILD TASK
// ─────────────────────────────────────────────────────────────

export const LAB6_BUILD_TASK = {
  id: 'navigator-lab-6-build',
  title: 'Portfolio Strategy Memo',
  labProgressionNumber: 6,
  type: 'judgment-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '75–90 minutes',

  description: `
You are designing a Starknet DeFi portfolio for a $45,000 allocation.
Write a portfolio strategy memo covering the four sections below.

SECTION 1 — Allocation Design (150–200 words)
Specify exact dollar amounts and target percentages for each tier:
  - Liquid reserve
  - Dollar-denominated yield (USDC in Vesu or equivalent)
  - STRK-denominated yield (staking)
  - Opportunistic (LP, DCA, or experimental)

For each tier: state the protocol, the current APY at time of writing,
and the annual yield in dollars at your allocated amount.
Calculate the total blended annual yield across all tiers as a percentage of $45,000.

SECTION 2 — Risk Profile Statement (100–150 words)
Your allocation implicitly expresses a view on STRK price.
State that view explicitly: bullish, neutral, or bearish.
Justify it by explaining how your percentage splits reflect it.
Identify the single biggest risk to your allocation and one specific mitigation.

SECTION 3 — Protocol Risk Assessment (150–200 words)
Select one protocol from your allocation (not Vesu — choose another).
Assess it on the seven dimensions from Lab 6:
audit, team, upgrade mechanism, token distribution, oracle, TVL quality, exploit history.
Rate each 1–5. Produce an overall score and state whether your allocation to it is appropriate.

SECTION 4 — Rebalancing Policy (100–150 words)
Define: your threshold (what drift percentage triggers a rebalance),
your timing approach (threshold-based or time-based), and your correction method
(single swap, exit DCA, or gradual).
State the specific action you would take if STRK rises 60% from today.
Include the timeline: when would you act, what would you sell, where would proceeds go?
  `.trim(),

  outputType: 'written-document',
  outputFormat: 'markdown',
  verificationMethod: 'ai-evaluator-rubric',

  scoringCriteria: [
    'Section 1: dollar amounts sum to $45,000. APYs are current and specific. Total blended yield is calculated correctly.',
    'Section 2: price view is stated explicitly (not hedged). Justification connects the STRK percentage to the stated view.',
    'Section 3: all seven dimensions addressed. Ratings are accompanied by specific evidence, not generic statements.',
    'Section 4: threshold is a specific number (not a range). The 60% STRK rise scenario is answered with exact dollar figures and a specific timeline.',
  ],
};

// ─────────────────────────────────────────────────────────────
// BOSS BATTLE
// ─────────────────────────────────────────────────────────────

export const LAB6_BOSS = {
  phase1: {
    id: 'navigator-lab-6-boss-phase1',
    title: 'Lab 6 Boss — Phase 1: Portfolio Strategy Gauntlet',
    description: 'Unlimited attempts. Hints available. 10 tasks drawn from pool of 22. Pass 70% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,

    taskPool: {
      totalTasks: 22,
      drawPerAttempt: 10,
      taskTypes: [
        // Allocation frameworks
        'Your $35,000 Starknet portfolio is 85% STRK staking, 10% USDC Vesu, 5% liquid. STRK falls 40%. Calculate new dollar values and new allocation percentages. Which tier is most damaged?',
        'Two portfolios: A is 70% STRK / 25% USDC / 5% liquid. B is 40% STRK / 45% USDC / 15% liquid. STRK rises 30%. Which portfolio has higher dollar return? Which took more risk to achieve it?',
        'What are the three tensions every DeFi portfolio allocation must explicitly resolve? For each, give an example of how failing to resolve it causes a problem.',
        'A $60,000 portfolio has zero liquid reserve — 100% deployed in yield positions. A DeFi opportunity opens requiring $15,000 within 48 hours. What are the investor\'s options and the cost of each?',
        'Explain why the choice between 30% and 70% STRK allocation matters more to your final portfolio outcome than choosing between Vesu and Nostra for your USDC position.',
        // Yield optimisation
        'Protocol A: 8.5% APY, 14 months old, audited. Protocol B: 14% APY, 5 weeks old, unaudited. You have $20,000. Calculate annual income from each. What risk premium should B offer to justify the additional risk?',
        'A new Starknet protocol launches at 28% APY. Three weeks later: 22%. Six weeks later: 16%. Nine weeks later: 11%. Calculate the decay rate per week. When does it reach a 6% market rate?',
        'Supply APY on Vesu: 5.9%. Borrow APY on Vesu: 8.1%. Is looping USDC (borrow USDC and re-supply USDC) yield-positive or yield-negative? Show the calculation for one loop on $20,000.',
        'You have a $500 position earning 7% APY. You want to compound monthly. On Ethereum mainnet at $22 gas per transaction, is monthly compounding rational? On Starknet with a gasless paymaster, is it rational? Show the numbers.',
        // Protocol risk
        'A protocol\'s upgrade key is held by a 4/6 multisig. All six key holders are co-founders of the same company. How many people need to agree to upgrade the contract? Is this adequately decentralised?',
        'A protocol was audited 18 months ago. Since then it has shipped two major upgrades covering 55% of its codebase. A new depositor reads "Audited by a tier-one firm." What percentage of current code is actually covered by that audit?',
        'A protocol\'s team tokens unlock in 3 weeks (1-year cliff, 18-month linear vest, currently at month 12). How do you monitor this event and what position adjustment — if any — would you make in advance?',
        // Cross-protocol strategies
        'Supply APY: 5.4%. Borrow APY: 7.8%. You attempt a 2-loop on $30,000. Calculate the net yield after each loop. Is the second loop more or less profitable than the first?',
        'Four protocols stacked: Protocol A 1% annual exploit probability, B 2%, C 2%, D 1.5%. Calculate the combined probability that at least one is exploited in a year. Is a 15% APY stack sufficient compensation?',
        'Explain in specific numbers why a delta-neutral position earns yield without STRK price exposure. Use $15,000 USDC supply and a $3,000 STRK borrow as your example.',
        // Rebalancing
        'Your portfolio target: 60% STRK / 25% USDC / 15% liquid. Current: $42,000 STRK, $15,000 USDC, $7,000 liquid. Total: $64,000. Calculate current allocations, drift from target, and the dollar correction needed if your threshold is 8 points.',
        'You need to rebalance by reducing STRK staking by $12,000. Today is August 5th. You want the rebalanced capital deployed into Vesu by August 20th. Is this timeline achievable? What would you do differently if not?',
        'Compare threshold-based rebalancing (10-point trigger) to monthly rebalancing over a year of moderate volatility. Which produces more transactions? Which better protects the portfolio during a sudden 30% STRK drop?',
        'Your STRK position has risen from 50% to 65% of your portfolio. You feel reluctant to sell because "it\'s going up." Explain the specific logical argument for rebalancing anyway — without predicting future price direction.',
        // Cross-lab synthesis
        'Cross-lab (Lab 5): you are rebalancing by selling $8,000 of STRK. You want to minimise price impact. Should you use a single AVNU swap, AVNU exit DCA over 3 weeks, or Ekubo TWAMM? Justify based on order size and market depth.',
        'Cross-lab (Lab 4): your rebalancing requires $10,000 from a borrow position. Repaying $10,000 of debt increases your health factor. You also need to add $10,000 to your liquid reserve. Which do you do first and why?',
        'Cross-lab (Labs 1–6 synthesis): you have a complete Starknet DeFi portfolio. Name one risk from each of Labs 1–4 that your current allocation is exposed to and one thing you have done in your design to mitigate each.',
      ],
    },
  },

  phase2: {
    id: 'navigator-lab-6-boss-phase2',
    title: 'Lab 6 Boss — Phase 2: Portfolio Strategy Certification',
    description: 'No hints. Portfolio push. 100% pass required. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You manage DeFi allocations for a Starknet-native fund.
The fund has $120,000 to deploy. The mandate: maximise risk-adjusted yield
while maintaining health factors above 1.5 on all borrow positions
and keeping 15% of capital liquid at all times.

Complete all five tasks. Tasks 1–3 require transaction hashes from Starknet Sepolia testnet.

TASK 1 — Execute one rebalancing swap
Your testnet portfolio from Lab 5 has drifted. Identify which position is
most over-weight relative to your Lab 5 target allocation.
Execute one corrective swap on Sepolia using AVNU to move it back toward target.
Record: the transaction hash, the position you corrected, the direction
(sold or bought), and the new allocation percentage after correction.

TASK 2 — Supply and document
Supply 5 USDC to Vesu on Sepolia.
Record: the transaction hash, the utilisation rate at the time of deposit,
the supply APY at the time of deposit, and your projected annual yield on 5 USDC.

TASK 3 — Protocol risk assessment — live
Choose one Starknet protocol you have not used in a build task before.
Assess it on all seven dimensions. Deploy 2 USDC to it if it scores above 3.0/5.0.
If below, document why you chose not to deploy.
Record: the transaction hash if you deployed, or your refusal rationale if you did not.

TASK 4 — Full portfolio allocation memo (written, no transaction)
Design the complete $120,000 fund allocation:
  - Four tiers with specific dollar amounts and target percentages
  - Named protocols for each position
  - Current APY for each position (look up, do not estimate)
  - Annual yield per position and total blended yield
  - Rebalancing policy: threshold, timing approach, correction method
  - One specific scenario where your allocation would fail and your contingency

TASK 5 — Risk-adjusted analysis (written)
Your allocation contains one yield opportunity above 12% APY.
Justify whether it is correctly sized relative to the risk it carries.
Show: the specific risks of that position, the annual expected loss
if the risk materialises (probability × position size), and whether the
excess yield above 6% (a safe benchmark) compensates for that expected loss.
    `.trim(),

    scoringCriteria: [
      'Task 1: Tx hash valid on Sepolia. Over-weight position correctly identified. New percentage calculated and stated.',
      'Task 2: Tx hash valid. Utilisation rate and APY are specific numbers from the time of deposit — not estimates. Annual yield calculated correctly.',
      'Task 3: Seven-dimension assessment present. Score calculated. Deployment decision consistent with score.',
      'Task 4: Four tiers sum to $120,000. APYs are sourced (not assumed). Total blended yield calculated. Rebalancing policy is specific — threshold is a number, correction method is named. Failure scenario is specific to the actual allocation, not generic.',
      'Task 5: Probability × position size = expected annual loss shown. Comparison to excess yield above 6% benchmark is explicit. Conclusion is a commitment — position is correctly sized, under-sized, or should be removed.',
    ],

    crossChainNote: `
## Cross-Chain Context: Portfolio Strategy on Ethereum and Solana

The portfolio strategy framework you built on Starknet applies across chains —
but the mechanics differ in ways that affect allocation decisions.

On Ethereum mainnet: gas costs of $5–30 per transaction make frequent
rebalancing expensive for portfolios below $500,000. A 2-point drift correction
on a $40,000 portfolio might cost $40 in gas — 50% of the value moved.
Rebalancing thresholds must be set wider (15–20 points) to justify the cost.
Liquid reserves must be larger to absorb gas costs during corrections.

On Solana: near-zero transaction fees (under $0.01) make frequent
rebalancing viable at any portfolio size. The ecosystem has Kamino Finance
(yield aggregator) for automated position management and rebalancing.
Liquid staking via Marinade or Jito generates msol and jitoSOL
that compound staking yield automatically.

Starknet advantage: AVNU Paymaster — the gasless transaction layer from
Lab 2 — makes rebalancing at any threshold economically viable regardless
of portfolio size. A 3-point threshold correction on a $5,000 portfolio
costs $0 in gas on Starknet. On Ethereum mainnet, the same correction
would cost more in gas than the yield benefit of the correction itself.
    `.trim(),

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/intermediate/lab-6-portfolio-strategy/',
      files: [
        {
          filename: 'portfolio-strategy-memo.md',
          type: 'narrative',
          content: `# Lab 6 — Portfolio Strategy and Allocation: Certification

## Role Simulated
DeFi Allocation Manager — Starknet-Native Fund ($120,000 AUM)

## Task 1 — Rebalancing Correction
- Position corrected: [position name and protocol]
- Direction: [sold / bought]
- Amount: $[amount]
- Transaction hash: [Sepolia tx hash]
- Allocation before: [%]
- Allocation after: [%]
- Drift resolved: [percentage points]

## Task 2 — Supply Position
- Protocol: Vesu
- Transaction hash: [Sepolia tx hash]
- Utilisation rate at deposit: [%]
- Supply APY at deposit: [%]
- 5 USDC projected annual yield: $[calculated]

## Task 3 — Protocol Risk Assessment
- Protocol assessed: [name]
- Protocol description: [one sentence]

| Dimension | Score (1–5) | Evidence |
|---|---|---|
| Smart contract audit | | |
| Team transparency | | |
| Upgrade mechanism | | |
| Token distribution | | |
| Oracle dependency | | |
| TVL quality | | |
| Exploit history | | |
| **Overall** | **[avg]** | |

- Deployment decision: [Deployed 2 USDC / Did not deploy]
- Transaction hash (if deployed): [hash or N/A]
- Rationale: [specific justification tied to score]

## Task 4 — Full Allocation Memo ($120,000)

### Rebalancing Policy
- Threshold: [% drift triggers rebalance]
- Timing: [threshold-based / time-based]
- Correction method: [single swap / exit DCA / gradual]

### Allocation Table
| Tier | Protocol | Amount | Target % | APY | Annual Yield |
|---|---|---|---|---|---|
| Liquid reserve | — | $[amount] | [%] | — | — |
| Dollar yield | [protocol] | $[amount] | [%] | [%] | $[amount] |
| STRK yield | [validator] | $[amount] | [%] | [%] | $[amount] |
| Opportunistic | [protocol] | $[amount] | [%] | [%] | $[amount] |
| **Total** | | **$120,000** | **100%** | | **$[total]** |

**Blended yield:** [total yield / $120,000]%

### Failure Scenario
- Scenario: [specific condition]
- Impact: [specific dollar impact on specific positions]
- Contingency: [specific action with timeline]

## Task 5 — Risk-Adjusted Analysis

- High-yield position: [protocol and APY]
- Position size: $[amount]
- Specific risks: [list]
- Probability of materialisation: [%] (justified)
- Expected annual loss: [probability] × $[position size] = $[expected loss]
- Excess yield above 6% benchmark: ([APY] - 6%) × $[position size] = $[excess yield]
- Conclusion: [excess yield is / is not] sufficient compensation. Position is [correctly sized / should be reduced to $X / should be removed].

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 6 Portfolio Strategy — Intermediate Starknet DeFi Navigator',
      badgeEarned: 'Portfolio Strategy Certified — Intermediate',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const NAVIGATOR_LAB_6_META = {
  id: 'navigator-intermediate-lab-6',
  title: 'Portfolio Strategy and Allocation',
  trackId: 'starknet-defi-navigator',
  level: 'intermediate' as const,
  labNumber: 6,
  estimatedHours: 5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 5 Phase 2 complete (Junior level certified)',
  description: 'Asset allocation frameworks, risk-adjusted yield, protocol risk assessment, cross-protocol composability, and portfolio rebalancing. First Intermediate lab.',
  nextLab: 'Lab 7 — Advanced Liquidity Provision',
};
