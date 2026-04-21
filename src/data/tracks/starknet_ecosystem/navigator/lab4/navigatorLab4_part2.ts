// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 4 — LENDING AND BORROWING
// LESSON 5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Portfolio push: Lab 4 Phase 2 Boss

export const LAB4_LESSON_5 = {
  id: 'risk-management-borrowers',
  title: 'Risk Management for Borrowers',
  explanation: `
In 2008, millions of homeowners discovered what happens when the value of collateralised assets falls below the loan value simultaneously — forced selling, wiped equity, and no exit. DeFi borrowers face the same fundamental risk with one critical difference: liquidation happens in seconds, not months, and there is no bank manager to call.

Managing a borrow position is not a "set and forget" activity. It requires a monitoring discipline that matches the volatility of your collateral. Stablecoin collateral can be checked weekly. ETH collateral should be checked daily. STRK collateral — as a newer, more volatile asset — should be monitored more frequently during significant market moves.

The first line of defence is the alert threshold. Set a personal trigger point well above the liquidation threshold. If your liquidation threshold is a health factor of 1.0, set your personal alert at 1.3 or 1.4. When your health factor hits 1.3, act immediately — do not wait for 1.0. By the time your health factor reaches 1.0, you may have already been liquidated.

When health factor deteriorates, two actions restore it. Repaying debt reduces the denominator in the health factor formula — most directly. Adding collateral increases the numerator. Both work. Repaying is usually faster and cleaner. Adding collateral is preferable when you want to maintain the loan size.

Liquidation penalty is the extra cost you bear when liquidated. Typically 5–10% of the liquidated amount is added as a bonus to the liquidator. If your $5,000 collateral is liquidated, the liquidator receives $5,000 + $250–$500 bonus from your position. You do not just lose the collateral value at market price — you lose an additional penalty on top.

Flash loans enable efficient liquidations. Liquidation bots use flash loans to repay your debt, claim your collateral plus penalty, sell the collateral, and repay the flash loan — all in one atomic transaction with no capital required. This means liquidations happen within seconds of a health factor breaching 1.0.
  `.trim(),
  visualPrompt: 'Health factor monitoring timeline: health factor line declining over time with three horizontal markers — green "safe zone 1.7+", amber "personal alert 1.3", red "liquidation 1.0". Two intervention arrows showing repay debt and add collateral both raising the line. Below: liquidation penalty diagram showing borrower receives collateral value minus debt minus penalty.',
  visualType: 'static',
  visualUrl: 'borrow-risk-management',
  examples: [
    {
      contextTag: '[Personal alert saves position, ETH decline]',
      context: 'A borrower has $15,000 ETH as collateral, $6,000 USDC debt, liquidation threshold 83%. Health factor at entry: 2.075. They set a personal alert at health factor 1.4.',
      scenario: 'Over a weekend, ETH falls 32% from $3,000 to $2,040. Their alert system notifies them Monday morning. Health factor is now: ($10,200 × 0.83) / $6,000 = 1.411 — just above their alert threshold.',
      outcome: 'They immediately repay $2,000 of their $6,000 debt. New health factor: ($10,200 × 0.83) / $4,000 = 2.117. Position is safe again. Had they not set the alert and checked the next week after ETH fell to $1,800: health factor would have been ($9,000 × 0.83) / $6,000 = 1.245 — critically close to liquidation. The alert threshold saved the position.',
    },
    {
      contextTag: '[Liquidation event, penalty calculation]',
      context: 'A borrower\'s health factor reaches 0.97. A liquidation bot detects it immediately.',
      scenario: 'The borrower had $4,000 USDC debt and $4,800 ETH collateral at the time of liquidation. Liquidation penalty: 8%.',
      outcome: 'The bot repays $4,000 USDC (full debt). In return, it receives ETH worth $4,000 + 8% penalty = $4,320 worth of ETH. The borrower receives the remaining ETH: $4,800 - $4,320 = $480 returned. The borrower effectively lost $4,800 worth of ETH (their full position) and had $4,000 of debt repaid plus $480 returned — net loss of $320 beyond the debt value. The 8% penalty went to the liquidator as compensation for capital efficiency and speed.',
    },
    {
      contextTag: '[Monitoring frequency by collateral type]',
      context: 'Three borrowers each hold $30,000 worth of different collateral assets with $10,000 debt each. Borrower A uses USDC as collateral. Borrower B uses ETH. Borrower C uses STRK.',
      scenario: 'A week of normal market activity passes. USDC stays at $1.00. ETH moves ±5%. STRK moves ±15%.',
      outcome: 'Borrower A: health factor unchanged — USDC is stable. No monitoring needed beyond weekly check. Borrower B: ±5% ETH moves impact health factor by approximately 5%. Daily monitoring appropriate. Borrower C: ±15% STRK moves could shift health factor by 15% in a single day. Active monitoring required — check at least twice daily during volatile periods. Never borrow against an asset you cannot commit to monitoring regularly.',
    },
  ],
  keyTakeaway: 'A health factor of 1.08 means a 7% collateral price drop triggers liquidation — and STRK can move 7% in under an hour, which is why your personal alert must be set at 1.3, not 1.0.',
  guidedPractice: [
    {
      question: 'Your health factor is 1.28 and falling. Your liquidation threshold is at health factor 1.0. You have 30 minutes before your next opportunity to check. What is the risk?',
      options: [
        'A. No risk — health factor 1.28 is comfortably above 1.0',
        'B. Significant risk — volatile collateral can move enough in 30 minutes to push health factor below 1.0. Liquidation bots act within seconds of breach.',
        'C. Low risk — liquidation takes at least 24 hours to process after health factor breach',
        'D. Moderate risk — you will receive a 4-hour warning before liquidation',
      ],
      correct: 1,
      hint: 'A 22% buffer (from 1.28 to 1.0) on a volatile asset like STRK or ETH can be eliminated in minutes during a sharp move.',
      explanation: 'B is correct. A health factor of 1.28 with volatile collateral is dangerous. A 22% collateral price decline brings health factor to 1.0. STRK or ETH can move 10–20% in under an hour during extreme volatility. Liquidation bots monitor every block (approximately every 2 seconds) and execute the moment health factor falls below 1.0 — there is no 4-hour warning and no grace period.',
    },
    {
      question: 'Health factor falls to 1.18. You have $10,000 USDC in your wallet. Should you repay debt or add collateral?',
      options: [
        'A. Always repay debt — it is always the better choice',
        'B. Repaying debt reduces the denominator (most direct). Adding collateral increases the numerator. Both work — choose based on whether you want to maintain the loan size.',
        'C. Do neither — 1.18 is above 1.0 so no action is needed',
        'D. Add collateral only — repaying debt triggers a tax event',
      ],
      correct: 1,
      hint: 'Health factor = (collateral × threshold) / debt. Which variable does repaying affect? Which does adding collateral affect?',
      explanation: 'B is correct. Repaying $3,000 of debt reduces the denominator — the most direct and typically largest impact per dollar. Adding $3,000 of collateral increases the numerator. If you need to keep the loan (for the strategy you entered it for), add collateral. If you no longer need the loan or want to reduce debt, repay. Option C is wrong — 1.18 is dangerously close to liquidation and requires immediate action.',
    },
    {
      question: 'A liquidation bot repays your $8,000 debt and receives your $9,600 collateral (8% penalty). What do you receive?',
      options: [
        'A. $8,000 — your debt is repaid so you are even',
        'B. $1,600 — the remaining collateral after debt repayment and penalty ($9,600 - $8,640)',
        'C. $0 — liquidation forfeits all collateral and debt',
        'D. $9,600 — the full collateral value minus only the debt',
      ],
      correct: 1,
      hint: 'Bot pays $8,000 debt and receives collateral worth $8,000 + 8% bonus = $8,640. What remains?',
      explanation: 'B is correct. Bot receives: $8,000 + 8% = $8,640 worth of collateral. Your $9,600 collateral minus $8,640 = $960 returned. Wait — the debt was also repaid: $8,640 - $8,000 debt = $640 net cost beyond the debt. You started with $9,600 collateral and $8,000 debt (net equity: $1,600). After liquidation: you received $960 collateral back, debt cleared — but your $640 went to the liquidator as penalty. Net equity remaining: $960 vs expected $1,600. Liquidation cost you $640.',
    },
    {
      question: 'What is the most important personal rule for managing a borrow position on volatile collateral?',
      options: [
        'A. Borrow at maximum LTV to maximise capital efficiency',
        'B. Never let health factor fall below 1.3 — set an alert and act before reaching 1.0',
        'C. Always use stablecoin collateral to avoid liquidation risk',
        'D. Repay your loan every 30 days regardless of health factor',
      ],
      correct: 1,
      hint: 'You cannot protect what you do not monitor. What is the practical operating principle?',
      explanation: 'B is correct. The 1.3 personal threshold gives you meaningful buffer above the 1.0 liquidation line. Volatile assets can move 10–20% in hours — if you only act at 1.05, you may already be liquidated by the time you see it. Set the alert at 1.3, act at 1.3, restore to 1.7+. This is the operational discipline that separates borrowers who keep their positions from those who get liquidated.',
    },
    {
      question: 'Flash loans enable liquidation bots to operate without upfront capital. What does this mean for the speed of liquidations?',
      options: [
        'A. Liquidations are slower because flash loans require complex multi-step transactions',
        'B. Liquidations are nearly instantaneous — bots need no upfront capital, so any entity with access to code can liquidate as soon as health factor < 1.0, meaning positions breach and are liquidated within the same block or the next',
        'C. Flash loans are banned on Starknet so liquidation takes at least 1 hour',
        'D. Liquidations require human approval even with flash loans',
      ],
      correct: 1,
      hint: 'If liquidation is profitable and requires no upfront capital, what is the barrier to doing it instantly?',
      explanation: 'B is correct. Flash loans allow liquidation bots to borrow, liquidate, collect the collateral premium, repay the flash loan, and keep the profit — all in one atomic transaction with zero upfront capital required. There is no financial barrier to liquidating a breached position. Bots monitor every block and submit liquidation transactions immediately upon breach. This is why liquidations are effectively instantaneous — within seconds of health factor reaching 1.0.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Your borrow position: 8 ETH collateral at $2,800/ETH = $22,400. Debt: $9,000 USDC. Liquidation threshold 83%. Calculate health factor. ETH price scenarios: (1) drops 10% to $2,520, (2) drops 25% to $2,100, (3) drops 40% to $1,680. For each scenario: new health factor, whether liquidation triggers, and how much debt to repay NOW to ensure health factor stays above 1.4 even at scenario 3.',
      scoringCriteria: [
        'Current HF: ($22,400 × 0.83) / $9,000 = 2.066',
        'Scenario 1 ($2,520): ($20,160 × 0.83) / $9,000 = 1.860. Safe.',
        'Scenario 2 ($2,100): ($16,800 × 0.83) / $9,000 = 1.549. Safe but watch.',
        'Scenario 3 ($1,680): ($13,440 × 0.83) / $9,000 = 1.239. Not liquidated but below 1.4 alert.',
        'Debt to repay for HF ≥ 1.4 at scenario 3: $13,440 × 0.83 / 1.4 = $7,966 max debt. Must repay $9,000 - $7,966 = $1,034 now.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user has the following position: 5,000 STRK ($4,000 at $0.80) collateral, $1,200 USDC debt, liquidation threshold 75% (STRK has lower threshold than ETH due to volatility). They plan to check their position once per week. STRK has experienced weekly moves of up to 35% in the past 3 months. Identify the specific risk of weekly-only monitoring for this collateral type and calculate the maximum weekly STRK decline at which they would still be safe.',
      scoringCriteria: [
        'Current HF: ($4,000 × 0.75) / $1,200 = 2.50',
        'Liquidation price: $1,200 / (5,000 × 0.75) = $0.32/STRK — a 60% decline',
        'In theory safe for weekly monitoring. BUT: STRK has moved 35% in a week historically. From $0.80, 35% drop = $0.52. HF: ($2,600 × 0.75) / $1,200 = 1.625. Still safe.',
        'However: two consecutive 35% weeks would bring STRK to $0.338 — nearly liquidation. Weekly monitoring is borderline — recommend daily checks and a 1.5 personal alert threshold.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi user is about to open their first borrow position. They ask: "What are the three most important things I need to know before I borrow?" Give three specific, actionable answers. No generic "be careful" advice — each answer must be actionable.',
      scoringCriteria: [
        'Answer 1: Calculate the exact ETH/STRK price at which your position gets liquidated before entering. Know your liquidation price.',
        'Answer 2: Set a personal alert at health factor 1.3 (not 1.0) and check your position at a frequency appropriate for your collateral\'s volatility.',
        'Answer 3: Stress-test your strategy at 3× the current borrow APY — if it is still profitable, proceed. If not, reduce loan size until it is.',
      ],
    },
  ],
};

export const LAB4_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'judgment-communication'],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 4 lessons. Tests utilisation mechanics, supply yield calculations, health factor management, borrowing strategies, and liquidation risk.',
};

export const LAB4_BUILD_TASK = {
  id: 'navigator-lab-4-build',
  title: 'Lending and Borrowing Execution',
  labProgressionNumber: 4,
  type: 'execution-plus-analysis',
  hints: true,
  portfolioPush: false,
  estimatedTime: '75–90 minutes',
  description: `
Execute a full lending and borrowing cycle on Starknet Sepolia testnet.

PART 1 — Supply execution
Supply 10 USDC to Vesu on Sepolia testnet.
Record: transaction hash, pool utilisation at time of deposit, supply APY at deposit.
Wait 10 minutes. Check getPosition(). Record: current position value and accrued yield (if any).

PART 2 — Borrow execution
Using any Sepolia testnet collateral available, borrow a small amount of USDC or STRK.
Record: collateral deposited (type and amount), amount borrowed, borrow APY,
health factor immediately after borrowing (from getHealth()), and the transaction hash.

PART 3 — Health factor analysis
Using your position from Part 2, calculate:
  - The collateral price at which your position would be liquidated
  - The percentage decline from current price that represents
  - Whether your current health factor meets the minimum 1.5 safe standard

PART 4 — Written borrowing strategy
You have $10,000 USDC and believe STRK will appreciate 3× over 18 months.
Design a complete hold-and-borrow strategy:
  - How much STRK do you buy and at what price?
  - How much USDC do you borrow against it?
  - What is your starting health factor?
  - What is your liquidation STRK price?
  - What is your borrow cost over 18 months at current APY?
  - At what STRK price does the strategy become profitable after accounting for borrow cost?
  `.trim(),
  outputType: 'execution-record-plus-analysis',
  outputFormat: 'markdown',
  verificationMethod: 'tx-hash-verification-plus-rubric',
  scoringCriteria: [
    'Part 1 supply transaction hash valid on Sepolia',
    'Pool utilisation and APY recorded at time of deposit',
    'Part 2 borrow transaction hash valid on Sepolia',
    'Health factor correctly calculated and matches protocol output',
    'Part 3 liquidation price mathematically correct',
    'Part 4 strategy is complete with all six elements calculated correctly',
    'Borrow cost correctly annualised over 18 months',
  ],
};

export const LAB4_BOSS = {
  phase1: {
    id: 'navigator-lab-4-boss-phase1',
    title: 'Lab 4 Boss — Phase 1: Lending Gauntlet',
    description: 'Unlimited attempts. Hints available. 10 tasks from pool of 22.',
    hints: true,
    portfolioPush: false,
    taskPool: {
      totalTasks: 22,
      drawPerAttempt: 10,
      taskTypes: [
        'USDC pool: $8M deposited, $6.2M borrowed, borrow APY 7.8%, reserve factor 12%. Calculate: utilisation, supply APY.',
        'Pool utilisation is 94%. You have $50,000 deposited (1.5% of $3.3M total). How much can you withdraw immediately?',
        'Health factor formula: (collateral × liquidation threshold) / debt. You have $12,000 ETH, $5,000 USDC debt, threshold 83%. Calculate health factor and liquidation ETH price.',
        'Health factor falls to 0.96. What happens next and who can trigger it?',
        'You deposit 5 ETH ($3,500/ETH) as collateral. Max LTV 80%. What is your maximum safe borrow at 60% of maximum?',
        'Borrow APY is 6.2%. Your yield strategy returns 8.9%. Break-even borrow APY? If rates spike to 11%, what do you do?',
        'Calculate supply APY: utilisation 76%, borrow APY 8.1%, reserve factor 15%.',
        'Share price was $1.00 at deposit, now $1.043. You have 8,000 shares. What is your position worth and how much yield have you earned?',
        'You borrow $10,000 USDC at 6.8% APY for leveraged staking. Staking net APY 8.1%. Calculate annual spread in dollars. Is this sufficient for the risk?',
        'What are two legitimate reasons to borrow in DeFi rather than simply selling your collateral asset?',
        'A liquidation bot repays your $7,500 debt. Your collateral was worth $9,200. Liquidation penalty 7%. What do you receive back?',
        'Pool A: 5.8% APY, 69% utilisation, $40M TVL. Pool B: 7.2% APY, 91% utilisation, $6M TVL. You deposit $80,000 with potential need to withdraw within 30 days. Which pool and why?',
        'Why is borrow APY always higher than supply APY on the same asset in the same pool?',
        'You supply $25,000 STRK tokens (not STRK the token — assume STRK as collateral) at 3.2% supply APY. STRK falls 35% over 12 months. Calculate your total return in dollar terms.',
        'A friend says: "I set my health factor alert at 1.02. That gives me time to react." What is wrong with this and what would you recommend?',
        'Kink model: below 80% utilisation, borrow APY rises from 2% to 10%. Above 80%, it rises steeply to 35% at 100%. Current utilisation: 87%. Estimate current borrow APY.',
        'You borrow $15,000 USDC against $35,000 ETH at 43% LTV. ETH drops 20%. Calculate new health factor (assuming 83% liquidation threshold).',
        'What is a self-repaying loan and under what conditions does it work?',
        'You supply $60,000 USDC. After 4 months you check: 60,000 shares × $1.0192 = $61,152. Verify: is this consistent with approximately 5.76% annual APY?',
        'A borrower has health factor 1.8. They see an opportunity and borrow an additional $20,000 against the same collateral, reducing health factor to 1.12. STRK drops 10% overnight. What happens?',
        'Explain the difference between liquidity risk in a lending pool and smart contract risk. Which is more likely to cause permanent loss of funds?',
        'Cross-lab synthesis: you earned rewards from staking (Lab 3). How could you use those rewards to create a self-sustaining borrowing strategy without adding new capital?',
      ],
    },
  },

  phase2: {
    id: 'navigator-lab-4-boss-phase2',
    title: 'Lab 4 Boss — Phase 2: Lending Portfolio Certification',
    description: 'No hints. Portfolio push. 100% pass required.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are the DeFi operations lead for a Starknet-native fund.
The fund has $100,000 to deploy across lending and borrowing operations.
The objective: maximise yield while maintaining all positions above health factor 1.5.

Complete all five tasks. Submit transaction hashes for Tasks 1–3.

TASK 1 — Supply deployment
Supply 20 USDC to Vesu on Sepolia testnet.
Record: transaction hash, utilisation at deposit, supply APY, estimated annual yield on 20 USDC.

TASK 2 — Borrow position
Deposit any available Sepolia collateral and borrow the maximum that maintains health factor above 1.5.
Record: transaction hash, collateral type and amount, borrowed amount, borrow APY, exact health factor from getHealth().
Show your calculation proving health factor > 1.5.

TASK 3 — Partial repayment
Repay exactly 50% of your borrowed amount.
Record: transaction hash, new health factor after repayment.
Calculate: by how much did your health factor improve?

TASK 4 — Full capital allocation plan (written, no transaction)
You have $100,000 to deploy. Current Starknet rates:
  - USDC supply APY: 5.4%
  - ETH supply APY: 2.9%
  - USDC borrow APY: 7.1%
  - STRK staking APY: 8.8% (net after 5% commission)

Design an allocation that:
  - Maximises total yield while maintaining health factors above 1.5 on all borrow positions
  - Uses at least two different protocols or yield sources
  - Keeps 15% of capital liquid for opportunities

Show: specific allocation amounts, expected annual yield per position, total annual yield, and blended yield % on the $100,000.

TASK 5 — Risk stress test (written)
For your Task 4 allocation, calculate outcomes under two scenarios:
  (A) ETH falls 40%, STRK falls 30%, USDC rates stay flat
  (B) Borrow APY spikes to 18% across all protocols for 60 days

For each scenario: which positions are threatened? What actions would you take and in what order?
    `.trim(),

    scoringCriteria: [
      'Task 1: Tx hash valid. Utilisation and APY recorded. Annual yield calculated correctly.',
      'Task 2: Tx hash valid. Health factor > 1.5 confirmed. Calculation showing HF derivation included.',
      'Task 3: Tx hash valid. New HF calculated correctly. Improvement quantified.',
      'Task 4: Total allocation sums to $100,000 with 15% liquid. At least two yield sources. Annual yield calculation correct for each position. Blended yield computed.',
      'Task 5 Scenario A: Borrow position health factors recalculated at new prices. Actions prioritised correctly (repay most at-risk position first).',
      'Task 5 Scenario B: Break-even analysis at 18% borrow APY. Correct action: close borrowing positions where spread turns negative.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/junior/lab-4-lending-borrowing/',
      files: [
        {
          filename: 'lending-borrowing-record.md',
          type: 'narrative',
          content: `# Lab 4 — Lending and Borrowing: Portfolio Certification

## Role Simulated
DeFi Operations Lead — Starknet Fund

## Task 1 — Supply Deployment
- Transaction hash: [hash]
- Pool utilisation at deposit: [%]
- Supply APY: [%]
- Estimated annual yield on 20 USDC: $[calculated]

## Task 2 — Borrow Position
- Transaction hash: [hash]
- Collateral: [type] — [amount]
- Borrowed: [amount] [token]
- Borrow APY: [%]
- Health factor: [value] (target: >1.5)
- Health factor derivation: ([collateral value] × [threshold]) / [debt] = [HF]

## Task 3 — Partial Repayment
- Transaction hash: [hash]
- Repaid: 50% of original borrow
- New health factor: [value]
- Improvement: [new HF] - [old HF] = [delta]

## Task 4 — Capital Allocation Plan ($100,000)
| Position | Amount | Protocol | APY | Annual Yield |
|---|---|---|---|---|
| USDC supply | | Vesu | | |
| [Position 2] | | | | |
| [Position 3] | | | | |
| Liquid reserve | $15,000 | — | — | — |
| **Total** | **$100,000** | | | **$[total]** |

**Blended yield:** [total yield / $100,000]%

## Task 5 — Risk Stress Test

### Scenario A: ETH -40%, STRK -30%
| Position | Impact | Action Required |
|---|---|---|
| | | |

**Priority order for action:** [ranked list]

### Scenario B: Borrow APY spikes to 18% for 60 days
| Borrow Position | Current Spread | Spread at 18% | Action |
|---|---|---|---|
| | | | |

**60-day cost of spike:** $[calculated]

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 4 Lending and Borrowing — Junior Starknet DeFi Navigator',
      badgeEarned: 'Lending and Borrowing Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const NAVIGATOR_LAB_4_META = {
  id: 'navigator-junior-lab-4',
  title: 'Lending and Borrowing',
  trackId: 'starknet-defi-navigator',
  level: 'junior' as const,
  labNumber: 4,
  estimatedHours: 4,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 3 Phase 2 complete',
  description: 'Learn utilisation-driven interest rates, share-based supply accounting, health factor mechanics, borrowing strategies, and liquidation risk management.',
};
