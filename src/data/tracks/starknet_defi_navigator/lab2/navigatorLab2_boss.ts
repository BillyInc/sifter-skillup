// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 2 — TOKEN SWAPS AND AMMs
// AGGREGATE SIMULATIONS + BUILD TASK + BOSS BATTLE
// FIRST PORTFOLIO PUSH: Lab 2 Phase 2 Boss
// Rationale: Lab 2 is where the first verifiable onchain artifact exists —
// real transaction hashes from testnet swap execution, analysed slippage,
// and documented routing decisions. Nothing in Lab 1 is verifiable onchain.

export const LAB2_AGGREGATE_SIMS = {
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
  description: 'Random draw of 15 scenarios from all 5 Lab 2 lessons. Tests AMM mechanics, concentrated liquidity, AVNU routing, swap execution, and advanced strategies.',
};

export const LAB2_BUILD_TASK = {
  id: 'navigator-lab-2-build',
  title: 'Swap Strategy Execution and Analysis',
  labProgressionNumber: 2,
  type: 'execution-plus-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '45–75 minutes',

  description: `
Execute three swaps on Starknet Sepolia testnet using the SkillUp swap simulator
or directly through the Starkzap SDK. Document each swap fully.

SWAP 1 — Baseline execution
Swap exactly 5 STRK → USDC via AVNU.
Record: quoted price, executed price, price impact (%), route chosen by AVNU,
transaction hash, and actual USDC received on Voyager.

SWAP 2 — Slippage experiment
Attempt the same swap (5 STRK → USDC) twice:
  - First attempt: slippage tolerance 0.01% (should revert unless market is perfectly still)
  - Second attempt: slippage tolerance 1.0% (should execute)
Record: what happened on each attempt, the error message on revert (if any),
and the transaction hash of the successful execution.

SWAP 3 — Size impact comparison
Swap 1 STRK → USDC, then swap 100 STRK → USDC (if you have enough testnet STRK
from the faucet — if not, document the theoretical comparison using the AMM formula).
Record: price impact on each swap. Calculate whether AVNU found a better route
for the larger swap vs the smaller one.

WRITTEN ANALYSIS (200–300 words)
Answer three questions:
1. What was the largest price impact you observed and why did it occur?
2. Did AVNU use a multi-hop route for any of your swaps? If yes, why? If no,
   why did a direct route suffice for your trade sizes?
3. If you needed to swap $50,000 of STRK into USDC on Starknet today,
   describe exactly how you would execute it to minimise price impact.
  `.trim(),

  outputType: 'execution-record-plus-analysis',
  outputFormat: 'markdown',
  verificationMethod: 'tx-hash-verification-plus-rubric',

  scoringCriteria: [
    'Swap 1 transaction hash is valid on Starknet Sepolia (verified via Voyager)',
    'Quoted vs executed price comparison is present with slippage calculated correctly',
    'Swap 2 documents both attempts — the revert (if it occurred) and the successful execution',
    'Swap 3 correctly compares price impact across different sizes or correctly applies AMM formula',
    'Analysis question 1 correctly identifies price impact cause tied to pool depth and order size',
    'Analysis question 2 correctly describes whether multi-hop was used and explains the routing logic',
    'Analysis question 3 proposes a realistic split execution strategy with specific amounts and timing',
  ],
};

export const LAB2_BOSS = {
  phase1: {
    id: 'navigator-lab-2-boss-phase1',
    title: 'Lab 2 Boss — Phase 1: Swaps and AMMs Gauntlet',
    description: 'Unlimited attempts. Hints available. 10 tasks drawn from pool of 22. Pass 70% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,

    taskPool: {
      totalTasks: 22,
      drawPerAttempt: 10,
      taskTypes: [
        // AMM mechanics
        'Pool has 800,000 STRK and 800,000 USDC. k = 640,000,000,000,000. You buy 80,000 STRK. Calculate: new pool balances, USDC paid, average execution price, and price impact.',
        'You deposit 2,000 USDC and 2,000 STRK when STRK = $1. STRK rises to $4. Calculate your pool position value vs holding value. What is the impermanent loss in dollars and percentage?',
        'A pool has 10,000,000 STRK and 10,000,000 USDC. Someone swaps 100 STRK for USDC. Estimate the price impact. Is this significant? Why or why not?',
        'Why is impermanent loss called "impermanent"? Under what specific condition does it become permanent?',
        'You LP into a STRK/USDC pool at range $0.75–$0.85. STRK is currently $0.82. STRK falls to $0.60. What is the composition of your position and how much are you earning in fees?',
        // Concentrated liquidity
        'LP A deploys $20,000 full range. LP B deploys $2,000 concentrated in $0.79–$0.81 when STRK = $0.80. STRK trades between $0.795 and $0.805 all month. Pool generates $10,000 in fees total. Both have 1% of their respective liquidity category. Who earns more fees?',
        'What fee tier is most appropriate for a USDC/USDT pool and why? What fee tier suits a new volatile token pair?',
        'An LP set a concentrated range of $0.70–$0.90 for STRK/USDC. STRK is now $1.20. What is the composition of their position and what are their options?',
        'A liquidity provider earned $800 in fees and experienced $1,200 in impermanent loss in the same period. What is their net result? Was providing liquidity a good decision vs holding?',
        // AVNU routing
        'AVNU shows two routes: Route A single hop, 1.2% price impact. Route B two hops (STRK→ETH→USDC), 0.7% combined price impact but 0.4% total fees. You are swapping $20,000. Which route gives you more output? Show your working.',
        'You want to swap $500,000 USDC for STRK. AVNU shows 8% price impact as a single transaction. Propose a specific execution plan using AVNU DCA or manual splitting that reduces effective price impact below 1%.',
        'wallet.getQuote() returns priceImpactBps: 180. Convert to percentage. For a $30,000 swap, what is the dollar cost of this price impact? Is it acceptable?',
        'Why does AVNU sometimes route through an intermediate token (multi-hop) rather than executing a direct swap?',
        // Execution
        'A user sets slippage to 15% on a $10,000 swap. Explain the specific attack this enables and calculate the maximum amount a sandwich bot could extract.',
        'During a STRK flash crash, a user\'s transactions with 0.2% slippage keep reverting. The market is moving 3% per minute. What should they do and why?',
        'Voyager shows Transfer: +12,340,000 (6 decimals) USDC to your wallet. The app showed "you received 12.40 USDC." Which is correct? What is the discrepancy in absolute terms?',
        'You execute a swap. The app says "confirmed." Voyager shows status "Reverted." What happened to your tokens and what should you do next?',
        // Advanced strategies
        'Compare DCA vs lump sum: STRK prices over 4 weeks: $1.00, $0.80, $0.60, $0.90. User A buys $400 lump sum at week 1. User B buys $100/week for 4 weeks. Who has more STRK at week 4? What is each user\'s average cost?',
        'What is the difference between AVNU DCA and Ekubo TWAMM? For a $5,000 order over 30 days, which is more appropriate and why?',
        'You want to exit 1,000,000 STRK ($900,000 value) over 45 days. Single transaction shows 20% price impact. Calculate daily sale amount and estimated daily price impact. What risk remains even with this plan?',
        'An AVNU DCA order has a maximum price bound of $1.20/STRK. This week STRK is $1.35. What happens to the weekly cycle? What is the user\'s unspent USDC doing during skipped cycles?',
        'Impermanent loss vs fee income: LP earns 2% APY in fees on a volatile STRK/USDC position. STRK price doubles during the year. Is the LP better or worse off than simply holding? Estimate the IL and compare to fee income.',
      ],
    },
  },

  phase2: {
    id: 'navigator-lab-2-boss-phase2',
    title: 'Lab 2 Boss — Phase 2: Swap Portfolio Certification',
    description: 'No hints. First portfolio push. 100% pass required. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are onboarding as a DeFi trading assistant at a small Starknet-focused fund.
Your supervisor gives you $10,000 of testnet USDC and $10,000 of testnet STRK (on Sepolia)
and asks you to demonstrate that you can operate the full swap infrastructure correctly.

Complete all five tasks. Submit transaction hashes for Tasks 1–4.
Task 5 is a written memo with no transaction required.

TASK 1 — Execute a standard swap
Swap 500 STRK → USDC via AVNU. Before executing:
  - Record the getQuote() output: expected USDC, price impact, route
  - Set an appropriate slippage tolerance and justify your choice
After executing: record the actual USDC received and calculate real slippage vs quote.

TASK 2 — Execute a large swap with impact management
Swap 2,000 STRK → USDC. This is a larger order.
  - Check price impact first. If above 2%, split into two transactions of 1,000 STRK each.
  - Record: whether you split, price impact on each transaction, total USDC received across all transactions.
  - Calculate: did splitting save you money vs executing as one transaction? By how much?

TASK 3 — Reverse swap with slippage experiment
Swap 500 USDC → STRK.
  - First attempt: set slippage to 0.05%. Record the result (likely revert).
  - Second attempt: set slippage to 0.5%. Record the result.
  - Explain in one sentence why the first attempt behaved as it did.

TASK 4 — Set up a DCA order
Create an AVNU DCA order: 50 USDC of STRK per week for 4 weeks.
  - Record: the transaction hash of the DCA creation, the previewCycle() output showing expected STRK per cycle, and the order ID from getOrders().
  - Do not cancel the order — leave it active.

TASK 5 — Strategy memo (written, no transaction)
Your supervisor asks: "We hold 500,000 STRK ($400,000 value) on Starknet mainnet.
We need to exit 40% of this position within 30 days without disrupting the market.
Write a specific exit plan."

Your memo must include:
  - Daily sale amount and estimated daily price impact
  - Whether you would use AVNU DCA, manual daily transactions, or TWAMM, and why
  - Three risks that could disrupt this plan and your mitigation for each
  - One decision trigger: at what condition would you accelerate the exit?
    `.trim(),

    scoringCriteria: [
      'Task 1: Transaction hash valid on Sepolia. getQuote output documented. Slippage choice justified. Real vs quoted slippage calculated correctly.',
      'Task 2: Correctly assesses whether splitting was needed (impact above/below 2%). If split: two valid tx hashes. Savings calculation mathematically correct.',
      'Task 3: Both attempts documented. First attempt result (revert or success) correctly recorded. One-sentence explanation of first attempt behaviour is accurate.',
      'Task 4: DCA creation tx hash valid. previewCycle() output documented. Order ID recorded from getOrders(). Order left active.',
      'Task 5: Daily sale amount correctly calculated (200,000 STRK / 30 days = 6,667 STRK/day). Mechanism choice justified with reference to order size vs TWAMM threshold. Three distinct risks identified with specific mitigations. Decision trigger is specific (e.g. price drops X%, protocol risk emerges) not vague.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/junior/lab-2-token-swaps/',
      files: [
        {
          filename: 'swap-execution-record.md',
          type: 'narrative',
          content: `# Lab 2 — Token Swaps & AMMs: Portfolio Certification

## Role Simulated
DeFi Trading Assistant — Starknet-focused fund

## Task 1 — Standard Swap (500 STRK → USDC)
### Pre-execution Quote
- Expected USDC: [user's value]
- Price impact: [user's value]%
- Route: [user's AVNU route]
- Slippage tolerance set: [user's value]% — Justification: [user's reasoning]

### Execution Result
- Transaction hash: [user's Sepolia tx hash]
- Actual USDC received: [user's value]
- Real slippage vs quote: [user's calculation]%

## Task 2 — Large Swap (2,000 STRK → USDC)
### Impact Assessment
- Single-transaction price impact: [user's value]%
- Decision: [split / did not split] — Reasoning: [user's reasoning]

### Execution
- Transaction 1 hash: [hash] — [1,000 STRK if split, or 2,000 STRK if not]
- Transaction 2 hash: [hash if split]
- Total USDC received: [user's value]
- Savings from splitting vs single transaction: [user's calculation or N/A]

## Task 3 — Reverse Swap with Slippage Experiment (500 USDC → STRK)
### Attempt 1 (0.05% slippage)
- Result: [Reverted / Executed]
- Transaction hash (if executed): [hash or N/A]

### Attempt 2 (0.5% slippage)
- Result: [Executed]
- Transaction hash: [user's hash]
- STRK received: [user's value]

### Explanation of Attempt 1 Behaviour
[User's one-sentence explanation]

## Task 4 — DCA Order Setup
- DCA creation transaction hash: [user's hash]
- previewCycle() output: [expected STRK per $50 USDC cycle]
- Order ID: [user's order ID from getOrders()]
- Order status: Active

## Task 5 — Exit Strategy Memo
### Position
500,000 STRK, exit 40% = 200,000 STRK over 30 days

### Daily Execution Plan
- Daily sale: 6,667 STRK/day
- Estimated daily price impact: [user's estimate]%
- Mechanism: [AVNU DCA / Manual / TWAMM] — Justification: [user's reasoning]

### Risk Analysis
1. [Risk 1] — Mitigation: [user's mitigation]
2. [Risk 2] — Mitigation: [user's mitigation]
3. [Risk 3] — Mitigation: [user's mitigation]

### Acceleration Trigger
[User's specific condition for accelerating exit]

## Verified by Sifter SkillUp — [date]
[Platform verification link]`,
        },
      ],
      commitMessage: 'Passed Lab 2 Token Swaps & AMMs — Junior Starknet DeFi Navigator',
      badgeEarned: 'Token Swaps & AMMs Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

// ─────────────────────────────────────────────────────────────
// LAB 2 META
// ─────────────────────────────────────────────────────────────

export const NAVIGATOR_LAB_2_META = {
  id: 'navigator-junior-lab-2',
  title: 'Token Swaps and AMMs',
  trackId: 'starknet-defi-navigator',
  level: 'junior' as const,
  labNumber: 2,
  estimatedHours: 3.5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  description: 'Learn AMM mechanics, concentrated liquidity, AVNU aggregation, and swap execution. Execute real testnet transactions. First portfolio push with verified onchain transaction hashes.',
  lessonCount: 5,
  unlockConditionForPhase2: {
    guidedPracticeAverage: 70,
    lessonSimAverage: 60,
    aggregateSimsCompleted: 15,
    buildTaskCompleted: true,
  },
  portfolioNote: 'First portfolio push. The artifact is a markdown document containing verified Starknet Sepolia transaction hashes proving real swap execution — the first onchain-verifiable proof of skill in the track.',
};
