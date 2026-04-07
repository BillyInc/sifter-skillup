// ============================================================================
// LAB 6 — STABLECOINS DEEP DIVE
// aggregateSimulations + bossMode
// Append after all lessons (Parts A + B + C)
// ============================================================================

  ], // end lessons

  aggregateSimulations: {
    count: 15,
    simulatorTypes: [
      'judgment-risk-assess',
      'judgment-protocol-eval',
      'judgment-yield-calc',
      'judgment-data-interpret',
      'judgment-integration',
      'judgment-sustainability',
      'judgment-capital-flows',
    ],
    description: `No labels, no hints — random draw from all Lab 6: Stablecoins Deep Dive lessons`,
    scoringMode: `full-rubric`,
    unlockCondition: `all-lessons-complete`,
  },

  bossMode: {
    title: `The Stablecoin Allocation Brief`,
    phase1: {
      hintsEnabled: true,
      portfolioPush: false,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: true,
        message: `Review the lesson referenced above and try again. No attempt limit on Phase 1.`,
      },
    },
    phase2: {
      hintsEnabled: false,
      portfolioPush: true,
      portfolioArtifact: `stablecoin-allocation-brief.md`,
      feedbackFormat: {
        showCriteriaResults: true,
        showLessonPointers: false,
        message: `Phase 2 complete. Stablecoin Allocation Brief added to your DeFi Research Portfolio.`,
      },
    },
    scenarios: [
      {
        id: `defi-lab-6-boss`,
        situation: `Marcus drops a brief at 08:00 Monday: "We have $3M in stablecoins sitting idle across three wallets. I need a complete stablecoin strategy by EOD. Cover the allocation across at least three stablecoin types, yield strategy by market phase, the health check on any new stablecoin we are considering, and the depeg response playbook. Real numbers. Defensible decisions."`,
        question: `What is Maya's approach?`,
        options: [
          {
            text: `(1) Run the eight-question health check on each candidate stablecoin — score every question with evidence, disqualify any with Q3 D grade. (2) Build the allocation across at least three stablecoin types (fiat-backed core, crypto-backed decentralised, yield-optimised tactical). (3) Design yield strategy by market phase: bear market anchor in sDAI/DSR, bull market overlay in sUSDe/Aave high-utilisation. (4) Write the depeg response playbook: classify Level 1/2/3, calculate mathematical floor, read pool composition, assess resolution pathway, state action at each price level. (5) Calculate blended yield for current market phase with specific allocation table.`,
            correct: true,
            explanation: `Complete workflow covers every Lab 6 analytical layer: health check (L5.15), mechanism analysis (L5.2–L5.8), yield source classification (L5.13), pool monitoring (L5.10), depeg response (L5.11, L5.14). The allocation table with specific dollar amounts and blended yield is the deliverable Marcus expects — not a theoretical discussion but a deployable strategy.`,
          },
          {
            text: `Allocate everything to USDC and USDT — safest option, no research needed.`,
            correct: false,
            explanation: `USDC and USDT earn 0% without deployment. Marcus asked for a yield strategy. A researcher who defaults to the two largest stablecoins without deploying them in any yield-generating protocol has not answered the brief — they have avoided it.`,
          },
          {
            text: `Find the highest APY stablecoin on DeFiLlama and allocate everything there.`,
            correct: false,
            explanation: `From L5.15 and L5.13: highest APY without mechanism analysis is the recipe for UST. A researcher who allocates $3M to the highest-yield stablecoin without running the eight-question health check (especially Q3 — backing independence) has bypassed the most important safety layer in stablecoin research.`,
          },
          {
            text: `Ask Priya which stablecoins she prefers and replicate her positions.`,
            correct: false,
            explanation: `Copying positions without understanding the underlying analysis provides zero research value and no ability to make independent decisions when conditions change (which they will). A researcher who cannot independently evaluate a stablecoin has not completed Lab 6.`,
          },
        ],
      },
    ],
  },

};
