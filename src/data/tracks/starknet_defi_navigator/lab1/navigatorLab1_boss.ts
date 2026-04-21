// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 1 — DeFi Mental Models
// AGGREGATE SIMULATIONS + BUILD TASK + BOSS BATTLE
// Portfolio push: NOT this lab. First push is Lab 2 Phase 2.

export const LAB1_AGGREGATE_SIMS = {
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
  description: 'Random draw of 15 scenarios from all 8 Lab 1 lessons. No labels shown. Tests DeFi mental models across: intermediary replacement, token types, liquidity, yield sources, risk taxonomy, settlement, data reading, and transaction execution.',
};

export const LAB1_BUILD_TASK = {
  id: 'navigator-lab-1-build',
  title: 'DeFi Protocol Risk Assessment Report',
  labProgressionNumber: 1,
  type: 'judgment-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',

  description: `
Select any one live Starknet DeFi protocol not used in this lab's lessons.

Write a 600–800 word risk assessment covering four sections:

SECTION 1 — Protocol Overview (100–150 words)
What does the protocol do? Who are the likely users? What DeFi category?
Write in your own words — not the protocol's marketing copy.

SECTION 2 — Health Metrics (150–200 words)
Using DefiLlama, Starkscan, or the protocol's own dashboard, find and report:
- Current TVL and 30-day trend (growing / stable / declining)
- Daily trading volume (if applicable)
- Volume/TVL ratio — calculate it, do not just report raw numbers
- Protocol revenue per day (if available)
- Approximate unique wallets in the past 30 days
Interpret each number: what does it tell you about the protocol's health?

SECTION 3 — Risk Analysis (200–250 words)
Identify and assess the top four risk categories for this specific protocol. For each:
- Name the risk category
- Explain specifically how it applies (not a generic definition)
- Rate severity: Low / Medium / High with one-sentence justification

SECTION 4 — Recommendation (100–150 words)
Would you deposit $5,000 of your own money into this protocol today?
Yes or No. Support with exactly three reasons tied to your research above.
Do not say "it depends" — commit to a position.
  `.trim(),

  outputType: 'written-document',
  outputFormat: 'markdown-or-plain-text',
  verificationMethod: 'ai-evaluator-rubric',

  scoringCriteria: [
    'Protocol overview is written in the student\'s own words — not copied from marketing or documentation',
    'Health metrics are correctly calculated — volume/TVL ratio is computed, not estimated',
    'Risk taxonomy is correctly applied — each named category matches the specific protocol, not generic DeFi',
    'Risk severity ratings are justified with protocol-specific evidence',
    'Recommendation is decisive (Yes or No) with three reasons grounded in the research',
    'Total length is 600–800 words',
  ],
};

export const LAB1_BOSS = {
  phase1: {
    id: 'navigator-lab-1-boss-phase1',
    title: 'Lab 1 Boss — Phase 1: DeFi Fundamentals Gauntlet',
    description: 'Unlimited attempts. Hints available. 9 tasks drawn randomly from pool of 20. Pass 70% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,

    taskPool: {
      totalTasks: 20,
      drawPerAttempt: 9,
      taskTypes: [
        'A stablecoin holds 60% US Treasuries, 30% commercial paper, 10% cash. Rate the stability risk: Low/Medium/High. Justify.',
        'Calculate: $250,000 in a lending pool at 6.5% APY, 80% utilisation, 15% reserve factor. What is your actual supply APY?',
        'A token has $50M market cap, $200K daily volume. A second has $8M market cap, $3M daily volume. Which has more credible price discovery and why?',
        'You want to swap $80,000 of STRK. AVNU shows 4.2% price impact. What is the dollar cost and what should you do?',
        'Define atomic settlement. Give a specific example of how it eliminates a risk that T+2 carries.',
        'A protocol offers 180% APY. TVL is $12M, daily revenue is $1,800. Is this yield sustainable? Show your working.',
        'Rank by counterparty risk highest to lowest: (a) non-custodial Starknet smart contract, (b) Coinbase exchange account, (c) Argent X with guardian, (d) centralised yield platform like Celsius.',
        'A protocol has $400M TVL (growing), $3M daily volume, 200 unique wallets in 30 days. What does the wallet count tell you that TVL does not?',
        'You supply USDC to a pool at 92% utilisation. You need funds within 48 hours. What risk does this create and what should you have done?',
        'Explain impermanent loss in 2 sentences to someone who understands a joint bank account.',
        'A new protocol launches with 200% APY paid in its own token. TVL reaches $80M in 2 weeks. Three months later TVL is $4M. Construct the most likely explanation.',
        'What is the difference between protocol revenue and LP fee income? Which is more relevant for assessing protocol sustainability?',
        'A user approves unlimited USDC spending for a contract address found on Twitter. What specific attack is now enabled and what should they do immediately?',
        'A Starknet transaction reverts. What happens to: (a) token balances, (b) gas fee, (c) events in the block?',
        'A protocol has $30M TVL and $45M daily volume. Calculate the volume/TVL ratio. Is this high or low and what does it indicate?',
        'A friend says "this protocol was audited so my funds are safe." Name three risks an audit does not address.',
        'What is Herstatt risk, and why is it impossible for a DeFi AMM swap to create it?',
        'A pool has 200,000 STRK and 200,000 USDC. Someone buys $40,000 of STRK. What happens to pool reserves after the purchase?',
        'Compare: holding USDC in a non-custodial Starknet wallet vs a centralised exchange. One advantage and one risk for each.',
        'Construct the full argument for why 20% APY from protocol fee revenue is fundamentally different from 20% APY from token emissions.',
      ],
    },
  },

  phase2: {
    id: 'navigator-lab-1-boss-phase2',
    title: 'Lab 1 Boss — Phase 2: DeFi Fundamentals Certification',
    description: 'No hints. Fresh scenario per attempt. No portfolio push this lab — first push is Lab 2.',
    hints: false,
    portfolioPush: false,

    scenario: `
You are a DeFi analyst at a small family office. Your principal has $500,000 to allocate into Starknet DeFi. They have never used DeFi before. They understand traditional banking and stock markets.

Prepare a one-page briefing covering four things:

1. What DeFi actually is and why it is relevant to them — use analogies from banking and stock markets, no jargon.

2. The three most important risk categories they need to understand before allocating — specific to Starknet DeFi, not generic warnings.

3. How to evaluate whether a Starknet protocol is healthy — give three metrics, explain each, and provide a realistic example of what a good number looks like versus a concerning one.

4. One concrete allocation they could make with $50,000 as a first step — specific protocol, specific operation, projected yield, and the three risks specific to that exact allocation.

No generic DeFi advice. No marketing language. Specific and defensible on every point.
    `.trim(),

    scoringCriteria: [
      'DeFi explanation avoids jargon — uses analogies appropriate for a banking and stock market professional',
      'Three risk categories correctly named and described specifically for Starknet DeFi, not generically',
      'All three health metrics correctly defined with a real numeric example of healthy vs concerning',
      'Allocation recommendation names a specific Starknet protocol with a specific operation',
      'Yield projection includes the APY source and is not an inflated promise',
      'Three specific risks for the recommended allocation are protocol-specific, not generic DeFi risks',
      'Tone is professional — appropriate for a principal/analyst relationship',
    ],

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

// ─────────────────────────────────────────────────────────────
// COMPLETE LAB 1 EXPORT
// Import lessons from the two lesson files and combine here.
// ─────────────────────────────────────────────────────────────

// Usage:
// import { LAB1_LESSONS_1_TO_4 } from './navigatorLab1_lessons1to4';
// import { LAB1_LESSONS_5_TO_8 } from './navigatorLab1_lessons5to8';
// import { LAB1_AGGREGATE_SIMS, LAB1_BUILD_TASK, LAB1_BOSS } from './navigatorLab1_boss';

export const NAVIGATOR_LAB_1_META = {
  id: 'navigator-junior-lab-1',
  title: 'DeFi Mental Models',
  trackId: 'starknet-defi-navigator',
  level: 'junior' as const,
  labNumber: 1,
  estimatedHours: 3,
  portfolioPushThisLab: false,
  firstPortfolioPushLab: 2,
  description: 'Build the conceptual vocabulary to reason about DeFi. Every future lab assumes this foundation.',
  prerequisite: 'Starknet Island (levels 291–310) complete',
  lessonCount: 8,
  unlockConditionForPhase2: {
    guidedPracticeAverage: 70,
    lessonSimAverage: 60,
    aggregateSimsCompleted: 15,
    buildTaskCompleted: true,
  },
};
