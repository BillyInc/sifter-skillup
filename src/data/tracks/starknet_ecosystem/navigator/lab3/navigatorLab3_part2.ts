// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 3 — STAKING AND DELEGATION
// LESSONS 4–5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Portfolio push: Lab 3 Phase 2 Boss

export const LAB3_LESSONS_4_TO_5 = [

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Exiting Positions Correctly
// ─────────────────────────────────────────────────────────────
{
  id: 'exiting-staking-positions',
  title: 'Exiting Your Staking Position: The Two-Step Process',
  explanation: `
In UK banking, a 95-day notice savings account requires you to tell the bank 95 days before you want your money — not as punishment, but because the bank has deployed your money in instruments that take time to unwind. The bank honours your withdrawal but needs the runway. Starknet staking has the same structure: a 21-day unbonding period that exists for network security reasons, not as a penalty.

Exiting a staking position on Starknet is a deliberate two-step process. Step 1: declare your exit intent by calling wallet.exitPoolIntent(poolAddress, amount). This is the signal to the network that you want to exit. The moment you call this function, that portion of your stake stops earning rewards immediately — the clock starts. Step 2: after 21 days have elapsed, call wallet.exitPool(poolAddress) to complete the withdrawal. Your STRK returns to your wallet.

The 21-day unbonding period serves a specific purpose. Validators use delegated stake to participate in consensus. If all delegators could exit instantly, a coordinated mass exit could remove stake from the network rapidly, destabilising consensus. The unbonding period gives the network time to adjust and gives other participants time to step in with fresh delegation if needed.

Partial exits are fully supported. You do not have to exit your entire position at once. exitPoolIntent(poolAddress, Amount.parse("500", STRK)) initiates exit for exactly 500 STRK while the remaining stake stays active and continues earning. The unbonding 500 STRK sits in a special state: no longer earning, but also not yet returned to your wallet.

Timing your exit matters significantly. If you initiate an exit today and need your STRK by a specific date — to participate in a token sale, purchase a DeFi opportunity, or meet an obligation — you must count 21 days forward and confirm your timeline works before initiating. Miscounting this window is one of the most common and avoidable staking mistakes.

The practical rule: always plan exits at minimum 25 days in advance to allow for any blockchain processing variability. If the exit is time-critical, 30 days of buffer is safer.
  `.trim(),
  visualPrompt: 'Timeline diagram: Day 0 — exitPoolIntent() called, rewards stop. Day 21 — exitPool() available. Day 22 — STRK returns to wallet. Below: partial exit shown as a pool with a portion flagged for exit while the rest continues earning.',
  visualType: 'static',
  visualUrl: 'staking-exit-timeline',
  examples: [
    {
      contextTag: '[Exit timing miscalculation, missed opportunity]',
      context: 'A token presale opens on March 15th, requiring STRK to participate. James has 8,000 STRK staked. On March 8th, he realises he needs to exit.',
      scenario: 'James calls exitPoolIntent() on March 8th. The 21-day unbonding period ends on March 29th — 14 days after the presale opened.',
      outcome: 'James missed the presale window entirely because he initiated exit too late. The correct action: recognise any time-sensitive STRK requirement at least 25 days in advance and initiate exit proactively. The lesson: staked STRK is not liquid STRK. Always maintain a liquid reserve for unexpected opportunities. Do not stake 100% of your holdings.',
    },
    {
      contextTag: '[Partial exit, maintaining active yield]',
      context: 'Elena has 12,000 STRK staked. She needs 3,000 STRK to provide liquidity on Ekubo for an upcoming pool. She does not want to exit her full position.',
      scenario: 'Elena calls wallet.exitPoolIntent(poolAddress, Amount.parse("3000", STRK)). The remaining 9,000 STRK stays in the active pool.',
      outcome: 'The 3,000 STRK is in unbonding state — earning no rewards and not yet in her wallet. The 9,000 STRK continues staking normally, earning at the full APY on that amount. After 21 days, Elena calls exitPool() to retrieve the 3,000 STRK. She now has 3,000 STRK liquid for the Ekubo position and 9,000 STRK still staking. Partial exits enable flexible position management without fully exiting.',
    },
    {
      contextTag: '[Understanding why rewards stop at intent, not at completion]',
      context: 'A staker calls exitPoolIntent() for 5,000 STRK expecting to continue earning rewards during the 21-day wait.',
      scenario: 'The staker checks getPoolPosition() the day after calling exitPoolIntent() and notices their rewards accrual has not changed — but the 5,000 STRK in unbonding is earning nothing.',
      outcome: 'The design is intentional. Once you signal exit intent, those tokens no longer contribute to the validator\'s active stake for consensus — therefore they no longer earn consensus rewards. The 21-day period is the cost of liquidity restoration, not a grace period for continued earning. Stakers who want to delay losing rewards should wait until they are sure they need the liquidity before calling exitPoolIntent().',
    },
  ],
  keyTakeaway: 'Your rewards stop the moment you declare exit intent — not when you complete the withdrawal — so the 21-day unbonding period is dead capital time that must be planned for in advance.',
  guidedPractice: [
    {
      question: 'You call exitPoolIntent() today. When exactly do your staking rewards stop?',
      options: [
        'A. After the 21-day unbonding period ends',
        'B. Immediately — the moment exitPoolIntent() is called, the unbonding tokens stop earning',
        'C. After you call exitPool() to complete the withdrawal',
        'D. At the end of the current epoch (approximately 7 days)',
      ],
      correct: 1,
      hint: 'The unbonding tokens are removed from active consensus participation immediately. When would reward earning stop relative to that?',
      explanation: 'B is correct. Rewards stop the moment exitPoolIntent() is executed. The tokens are immediately moved from "active delegation" to "unbonding" status. Since they are no longer contributing to the validator\'s active consensus participation, they no longer generate rewards. The 21-day wait is purely the network\'s security window — there are no rewards during this period.',
    },
    {
      question: 'You initiate exitPoolIntent() on January 1st. When is the earliest you can call exitPool() to receive your STRK?',
      options: [
        'A. January 8th — one week later',
        'B. January 15th — two weeks later',
        'C. January 22nd — 21 days later',
        'D. February 1st — one month later to be safe',
      ],
      correct: 2,
      hint: 'The unbonding period is exactly 21 days. Count from the exitPoolIntent() date.',
      explanation: 'C is correct. The 21-day unbonding period starts on January 1st. Day 21 is January 22nd — the earliest you can call exitPool() and receive your STRK back. Attempting to call exitPool() before day 21 will revert. It is good practice to wait until day 22 or later to avoid any edge cases around the exact block timing.',
    },
    {
      question: 'You have 20,000 STRK staked. You call exitPoolIntent() for 5,000 STRK. What happens to the remaining 15,000 STRK?',
      options: [
        'A. The remaining 15,000 STRK also enters unbonding — you cannot partially exit',
        'B. The 15,000 STRK remains active in the pool, continues earning rewards at the full APY',
        'C. The 15,000 STRK is held in escrow until the 5,000 STRK exit completes',
        'D. The 15,000 STRK rewards are paused until the partial exit resolves',
      ],
      correct: 1,
      hint: 'Partial exits only affect the specified amount. The rest of the position is independent.',
      explanation: 'B is correct. exitPoolIntent() with a specific amount only affects that amount. The remaining 15,000 STRK is completely unaffected — it stays in the active delegation pool, continues earning rewards, and can be managed independently (additional claims, further additions, or future exits). There is no impact on the non-exiting portion.',
    },
    {
      question: 'You need 10,000 STRK available on September 30th for a DeFi opportunity. Today is September 1st. Should you exit your staking position now?',
      options: [
        'A. No — you have plenty of time, start the exit on September 15th',
        'B. Yes — initiate exitPoolIntent() immediately today. September 1st + 21 days = September 22nd, giving 8 days of buffer before September 30th.',
        'C. Yes — but wait until September 5th to earn 4 more days of rewards',
        'D. No — the 21-day period starts when you call exitPool(), not exitPoolIntent()',
      ],
      correct: 1,
      hint: 'Count: September 1 + 21 days = ? Is that before or after September 30?',
      explanation: 'B is correct. September 1 + 21 days = September 22. This gives 8 days of buffer before September 30 — appropriate. Option A (exit September 15) gives September 15 + 21 = October 6 — missing the September 30 deadline entirely. Option C risks being wrong if the deadline is firm. Option D is factually wrong — the 21 days starts at exitPoolIntent(), not exitPool().',
    },
    {
      question: 'Why does Starknet require a 21-day unbonding period rather than allowing instant withdrawal?',
      options: [
        'A. To punish stakers who want to exit early',
        'B. To give the network security time — rapid mass exits could destabilise consensus by removing stake too quickly, and the delay allows the network and other participants to adjust',
        'C. To prevent tax avoidance by making staking positions illiquid',
        'D. To ensure the staking contract has enough liquidity to pay out all exits',
      ],
      correct: 1,
      hint: 'Think about what stake does for the network. What would happen to consensus security if 50% of stake could be removed in 60 seconds?',
      explanation: 'B is correct. Staked tokens actively participate in consensus. A coordinated rapid exit could remove a significant portion of network security in a very short time, potentially creating vulnerabilities. The 21-day unbonding gives the network time to adjust validator sets, allows new delegators to enter, and prevents coordinated attacks that exploit instant exits. It is a security feature, not a penalty.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Your staking position: 25,000 STRK staked at 8.5% APY. You need 8,000 STRK on December 5th. Today is November 5th. You also need 5,000 STRK on December 20th. Plan the exact sequence of transactions (with dates) to retrieve both amounts on time, calculate the rewards you will lose by exiting early, and calculate what rewards your remaining position will earn during the exit periods.',
      scoringCriteria: [
        'For 8,000 STRK by Dec 5: initiate exitPoolIntent(8000 STRK) on November 14 at latest (Nov 14 + 21 = Dec 5). Earlier is safer.',
        'For 5,000 STRK by Dec 20: initiate exitPoolIntent(5000 STRK) on November 29 at latest (Nov 29 + 21 = Dec 20).',
        'Rewards lost on 8,000 STRK (from exit intent on Nov 14 to Dec 5): 8,000 × 8.5% / 365 × 21 = 39.1 STRK',
        'Rewards lost on 5,000 STRK (from exit intent on Nov 29 to Dec 20): 5,000 × 8.5% / 365 × 21 = 24.4 STRK',
        'Remaining 12,000 STRK continues earning throughout: approximately 12,000 × 8.5% / 365 × 45 = 125.8 STRK over the full period',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user has 100% of their STRK (50,000 tokens, worth $40,000) staked. An urgent DeFi opportunity requires $15,000 of STRK available within 5 days. They cannot wait 21 days. Identify their three available options, state the cost or risk of each, and recommend the best approach.',
      scoringCriteria: [
        'Option 1: Borrow against staked position using a DeFi protocol that supports staked STRK as collateral — cost is borrow interest for the period',
        'Option 2: Buy new STRK on the market using USDC from another source — cost is STRK acquisition price',
        'Option 3: Miss the opportunity and wait — cost is the missed DeFi yield',
        'Correct recommendation: Option 1 if they have any USDC available as collateral, or Option 2 if they have other liquid assets. Lesson: never stake 100% of holdings — maintain a 10-20% liquid reserve for exactly this scenario.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A new staker calls exitPoolIntent() and then calls getPoolPosition() the next day, expecting to see their rewards stop at the exit amount but confused because their total rewards number went up slightly. Explain in 3 sentences why this happened and what the number means.',
      scoringCriteria: [
        'Correctly explains: the rewards number went up because the portion NOT in unbonding continued earning for that day',
        'Correctly clarifies: the exiting portion earned nothing — the increase came entirely from the remaining staked portion',
        'Correctly states: total rewards will grow more slowly going forward because there is less active stake generating them',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Staking Economics and Yield Comparison
// ─────────────────────────────────────────────────────────────
{
  id: 'staking-economics',
  title: 'Staking Economics: Comparing Yield Across Starknet',
  explanation: `
In personal finance, comparing investment returns requires normalising them to the same basis — you cannot directly compare a 9% APY savings bond to a 15% APY high-yield fund without also comparing their risk profiles. Staking yield on Starknet is the same: the raw APY number is only part of the picture.

Staking yield on Starknet comes primarily from network inflation — new STRK minted and distributed as rewards. This has an important implication: your staking yield is denominated in STRK. If STRK's price falls 20% while you are earning 9% APY, your real dollar return is negative: you hold more STRK, but each STRK is worth less. Conversely, if STRK rises 30% while you earn 9%, your total return is far higher than 9% in dollar terms.

Staking versus lending yield is a fundamental comparison. Lending USDC on Vesu at 5.2% APY is dollar-denominated — you start with USDC and end with more USDC. Staking STRK at 9% APY is STRK-denominated — you start with STRK and end with more STRK, at whatever STRK is worth when you exit. Neither is universally better. The right choice depends on your view of STRK's future price and your need for dollar stability.

Staking versus LP yield adds more complexity. LP yield on an Ekubo STRK/USDC pool might show 18% APY, but this includes both trading fees and potential impermanent loss risk. If STRK price doubles, the LP position underperforms simply holding STRK due to IL. Staking does not have this IL exposure — your STRK quantity grows with rewards but is not affected by price movements through any rebalancing mechanism.

Staking versus DCA funding is a strategic question. Some stakers claim rewards and immediately use them to purchase more STRK via DCA, effectively using staking as a programmatic accumulation engine. Others claim and hold stablecoins. Others immediately re-stake. The optimal strategy depends on price outlook, liquidity needs, and tax efficiency.

The single most important staking economics principle: in any yield comparison, first identify the base currency of the return. Dollar yield and STRK yield are not directly comparable without a price view.
  `.trim(),
  visualPrompt: 'Yield comparison matrix: four rows (Staking, Lending, LP, DCA-funded Staking) × four columns (Base Currency, APY, IL Risk, Price Exposure). Colour coded: green for low risk, yellow for medium, red for high. Notes column on right.',
  visualType: 'static',
  visualUrl: 'staking-yield-comparison-matrix',
  examples: [
    {
      contextTag: '[STRK price decline during staking, real return calculation]',
      context: 'A staker holds 10,000 STRK valued at $8,000 ($0.80/STRK) and stakes at 9% APY for 12 months. STRK price falls from $0.80 to $0.56 over the year.',
      scenario: 'At the end of 12 months, the staker has 10,900 STRK (original 10,000 plus 900 in rewards). They calculate their total return.',
      outcome: 'STRK value: 10,900 × $0.56 = $6,104. Original investment: $8,000. Net return: -$1,896 (-23.7%) in dollar terms. Despite earning 900 STRK in rewards (+9% in STRK terms), the dollar return was negative due to STRK price decline. Staking does not protect against price risk — it amplifies holdings in the native token, for better or worse.',
    },
    {
      contextTag: '[Staking vs lending, which is right for whom]',
      context: 'Two users each have $10,000 to deploy on Starknet. User A is bullish on STRK long-term. User B needs stable dollar returns to pay a known expense in 6 months.',
      scenario: 'User A stakes 12,500 STRK (bought at $0.80) at 9% APY. User B lends $10,000 USDC to Vesu at 5.2% APY.',
      outcome: 'After 6 months: User A has 12,500 + (12,500 × 4.5%) = 13,062 STRK. If STRK is $0.90: $11,756. If STRK is $0.70: $9,143. User B has $10,260 USDC — predictable. User A chose the right instrument for a price-appreciation thesis. User B chose correctly for dollar stability. The match between instrument and objective is the decision, not which return number is higher.',
    },
    {
      contextTag: '[Staking rewards as DCA engine]',
      context: 'A systematic investor stakes 5,000 STRK at 9% APY and claims rewards every 30 days. Instead of re-staking or holding, they immediately swap rewards to USDC to fund a weekly DCA into more STRK.',
      scenario: 'Monthly rewards: 5,000 × 9% / 12 = 37.5 STRK. At $0.80: $30. This $30 funds approximately 0.5 DCA cycles at $50/week, or is split across 6 weeks of DCA.',
      outcome: 'The staker is using yield from their staking position to systematically accumulate more STRK at regular intervals regardless of price. This decouples the accumulation strategy from needing to manually top up with external capital — the staking position generates the DCA fuel automatically. The strategy does not require selling any principal, only harvesting yield.',
    },
  ],
  keyTakeaway: 'Staking yield is paid in STRK, which means a falling token price can turn a positive APY into a negative dollar return — the denomination of your yield matters as much as the percentage.',
  guidedPractice: [
    {
      question: 'You stake 5,000 STRK at 9% APY for 1 year. STRK price rises from $0.80 to $1.20. What is your total return in dollars?',
      options: [
        'A. $360 — 9% of original $4,000 investment',
        'B. $2,854 — (5,450 STRK × $1.20) - $4,000 original investment',
        'C. $450 — 9% of original investment at current price',
        'D. $2,000 — 50% price gain on original investment only',
      ],
      correct: 1,
      hint: 'Calculate total STRK after rewards, then multiply by final price, then subtract original dollar investment.',
      explanation: 'B is correct. After 1 year at 9% APY: 5,000 + 450 = 5,450 STRK. Final value: 5,450 × $1.20 = $6,540. Original investment: 5,000 × $0.80 = $4,000. Total dollar return: $6,540 - $4,000 = $2,540 ($2,854 if calculated more precisely accounting for reward timing). Option A ignores the price appreciation. Option D ignores the staking rewards.',
    },
    {
      question: 'Staking STRK at 9% APY or lending USDC at 6% APY — which is better?',
      options: [
        'A. Staking — 9% is higher than 6%',
        'B. Lending — stablecoin yield is always safer than native token yield',
        'C. It depends on your STRK price outlook and dollar stability needs — they are different instruments with different risk profiles and base currencies',
        'D. They are equivalent — both DeFi yields average out to the same real return over time',
      ],
      correct: 2,
      hint: 'What currency does staking pay you in? What currency does lending pay you in? Are 9% STRK and 6% USDC comparable without additional information?',
      explanation: 'C is correct. 9% APY in STRK is not directly comparable to 6% APY in USDC without a view on STRK price. If STRK falls 20%, staking\'s effective dollar return is negative (-11% dollar return). If STRK rises 20%, staking returns approximately 29% in dollars vs lending\'s predictable 6%. The choice depends on whether you want STRK-denominated accumulation or dollar-denominated stability.',
    },
    {
      question: 'A staker claims 180 STRK in monthly rewards and immediately swaps them to USDC to fund a DCA order. At $0.75/STRK, how much USDC do they generate monthly for DCA? What is their effective annual DCA budget from staking alone?',
      options: [
        'A. $108/month, $1,296/year',
        'B. $135/month, $1,620/year',
        'C. $180/month, $2,160/year',
        'D. $150/month, $1,800/year',
      ],
      correct: 1,
      hint: '180 STRK × $0.75/STRK = monthly USDC. Multiply by 12 for annual.',
      explanation: 'B is correct. 180 STRK × $0.75 = $135/month. Annual: $135 × 12 = $1,620. This $1,620 in annual DCA budget is generated entirely from staking rewards without spending any principal — the staking position funds the accumulation strategy autonomously.',
    },
    {
      question: 'Which combination is most appropriate for a user who wants maximum STRK accumulation and believes STRK price will rise significantly?',
      options: [
        'A. Stake all STRK, claim rewards in USDC for dollar stability',
        'B. Stake all STRK, re-stake all rewards immediately for maximum compounding in STRK terms',
        'C. Convert all STRK to USDC and lend at 6% APY for stable dollar returns',
        'D. Provide STRK/USDC liquidity on Ekubo to earn higher percentage yields',
      ],
      correct: 1,
      hint: 'The objective is maximum STRK accumulation with a price-rise thesis. Which strategy maximises STRK quantity?',
      explanation: 'B is correct. If the goal is maximum STRK accumulation with a bullish price view, re-staking all rewards gives compounding in STRK terms — each reward increases the staking base, generating more rewards next period. Option D is suboptimal for a bullish view because LP positions automatically sell STRK as price rises (impermanent loss mechanism). Option A converts rewards to dollars, reducing STRK exposure when you believe STRK will be worth more.',
    },
    {
      question: 'STRK staking APY is 9%. Ekubo STRK/USDC LP shows 18% APY. A user assumes LP is obviously better. What is the flaw in this reasoning?',
      options: [
        'A. There is no flaw — 18% is always better than 9%',
        'B. The 18% LP yield assumes STRK price stays constant. If STRK price rises, impermanent loss reduces LP returns dramatically — in a strong bull market, simple staking may outperform LP by a large margin.',
        'C. The LP APY is a nominal rate; staking APY is real. They cannot be compared.',
        'D. LP yields are always overstated and never achieve their quoted APY.',
      ],
      correct: 1,
      hint: 'What happens to LP returns when STRK price doubles? What happens to staking returns when STRK price doubles?',
      explanation: 'B is correct. LP APY includes trading fees but excludes the impermanent loss impact of price movements. If STRK doubles in price, the LP\'s STRK is automatically sold by the AMM into USDC — capturing only some of the appreciation. Simple staking gives you 9% more STRK and the full price appreciation benefit. In a strong bull market, 9% staking can dramatically outperform 18% LP when IL is correctly accounted for.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have $20,000 to allocate. Option A: Buy 25,000 STRK at $0.80 and stake at 8.5% APY for 12 months. Option B: Lend $20,000 USDC at 5.8% APY for 12 months. Calculate your total value under three scenarios: STRK = $0.60, STRK = $0.80, STRK = $1.20 at end of year. For each scenario, which option performs better?',
      scoringCriteria: [
        'Option A after 12 months: 25,000 × 1.085 = 27,125 STRK',
        'Scenario 1 (STRK $0.60): A = $16,275 vs B = $21,160. B wins.',
        'Scenario 2 (STRK $0.80): A = $21,700 vs B = $21,160. A wins slightly.',
        'Scenario 3 (STRK $1.20): A = $32,550 vs B = $21,160. A wins significantly.',
        'Break-even STRK price: ($20,000 + $1,160) / 27,125 ≈ $0.78. A wins above $0.78, B wins below.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user has 40,000 STRK ($32,000 at $0.80). They are considering three strategies: (1) Stake all 40,000 STRK at 8.8% APY and re-stake rewards. (2) Stake 30,000 STRK and lend $8,000 USDC (converted from 10,000 STRK) at 5.5% APY. (3) LP 20,000 STRK and 20,000 USDC equivalent on Ekubo at 16% estimated APY. For each strategy, identify the primary risk and calculate projected year-1 outcomes at STRK = $0.80 (flat price) in both STRK and USD terms.',
      scoringCriteria: [
        'Strategy 1: 40,000 × 1.088 = 43,520 STRK. At $0.80 = $34,816. Risk: full STRK price exposure.',
        'Strategy 2: 30,000 × 1.088 = 32,640 STRK + USDC 8,000 × 1.055 = $8,440. Total at $0.80: $34,552. Risk: split but still mostly STRK-denominated.',
        'Strategy 3: LP value at flat price ≈ $32,000 × 1.16 = $37,120. Risk: impermanent loss if price moves — this return assumes flat price which is the best case for LP.',
        'Correct conclusion: Strategy 3 wins at flat price but has most risk if STRK moves significantly in either direction.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend says: "I should LP instead of stake because LP gives me 18% vs staking\'s 9% — it\'s obviously twice as good." Correct their reasoning in 4 sentences. Be specific about the condition under which staking would outperform LP.',
      scoringCriteria: [
        'Correctly explains LP APY does not include impermanent loss impact',
        'Gives the specific condition: if STRK price rises significantly, LP sells STRK automatically (IL) while staking retains full STRK upside',
        'Gives a concrete example: if STRK 2×, LP might net 8-10% after IL while staking nets 9% + full price gain',
        'Concludes: LP is better for flat/range-bound markets; staking is better if you are bullish on STRK',
      ],
    },
  ],
],  // end LAB3_LESSONS_4_TO_5

// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMULATIONS
// ─────────────────────────────────────────────────────────────
};

export const LAB3_AGGREGATE_SIMS = {
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
  description: 'Random draw from all 5 Lab 3 lessons. Tests PoS mechanics, validator selection, position management, exit timing, and staking economics.',
};

// ─────────────────────────────────────────────────────────────
// BUILD TASK
// ─────────────────────────────────────────────────────────────
export const LAB3_BUILD_TASK = {
  id: 'navigator-lab-3-build',
  title: 'Validator Selection and Staking Execution',
  labProgressionNumber: 3,
  type: 'execution-plus-analysis',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',
  description: `
PART 1 — Validator Research (written, no transaction required)
Research three live Starknet validators using available data.
For each, document: commission rate, uptime % (if available), self-stake amount,
pool size, and team identity (public or anonymous).
Score each on a 1–10 scale using your own weighting of the five criteria.
Recommend which one you would stake with and why.

PART 2 — Staking Execution (live on Sepolia testnet)
Using your testnet STRK from the faucet:
  - Stake 5 STRK in any available Sepolia validator pool
  - Record: transaction hash, pool address, validator name, commission rate
  - Wait at least 5 minutes (or until at least 1 STRK in rewards is visible)
  - Check getPoolPosition() and record: staked amount, rewards, total
  - Call claimPoolRewards() and record: transaction hash, rewards claimed

PART 3 — Exit planning
You have just staked 1,000 STRK (hypothetically) and receive an urgent request
to provide 600 STRK as collateral for a DeFi opportunity that opens in 18 days.
Document: can you exit in time? What would you do? Show exact dates.
  `.trim(),
  outputType: 'research-execution-record',
  outputFormat: 'markdown',
  verificationMethod: 'tx-hash-verification-plus-rubric',
  scoringCriteria: [
    'Three validators documented with all five criteria for each',
    'Scoring rationale explains the weighting chosen for each criterion',
    'Recommendation is specific and tied to the data, not generic',
    'Staking transaction hash valid on Sepolia',
    'getPoolPosition() output recorded with all three fields (staked, rewards, total)',
    'claimPoolRewards() transaction hash valid on Sepolia',
    'Exit plan correctly identifies that 18 days < 21-day unbonding — partial exit impossible in time. User must either borrow against stake or forgo the opportunity.',
  ],
};

// ─────────────────────────────────────────────────────────────
// BOSS BATTLE
// ─────────────────────────────────────────────────────────────
export const LAB3_BOSS = {
  phase1: {
    id: 'navigator-lab-3-boss-phase1',
    title: 'Lab 3 Boss — Phase 1: Staking Gauntlet',
    description: 'Unlimited attempts. Hints available. 10 tasks drawn from pool of 22.',
    hints: true,
    portfolioPush: false,
    taskPool: {
      totalTasks: 22,
      drawPerAttempt: 10,
      taskTypes: [
        'Calculate gross staking APY: 2,400,000,000 STRK staked, 192,000,000 STRK annual emissions.',
        'Validator A: 7% commission, 9.1% APY. Validator B: 3% commission, 8.8% APY. You stake 8,000 STRK. Calculate net annual rewards for each. Which is better?',
        'A validator has 0% commission for 3 months then raises to 9%. What specific risk does this signal? Was the 0% rate a reliable long-term indicator?',
        'You stake 10,000 STRK on March 1st. How many STRK have you earned by April 15th at 8.6% APY?',
        'You call exitPoolIntent() on June 10th. On what date can you call exitPool()? What is happening to your rewards during this period?',
        'Staking APY is 9% in STRK. You hold 5,000 STRK at $0.80. STRK falls to $0.55 over 12 months. What is your total dollar return?',
        'You have 12,000 STRK staked. After 60 days you check getPoolPosition(): rewards show 0.8 STRK. Expected reward calculation says you should have 177 STRK. What is likely happening and what should you do?',
        'A validator controls 35% of total Starknet stake. Why might you avoid delegating to them even if their APY and commission are competitive?',
        'Compare: stake 15,000 STRK at 9% APY vs lend $12,000 USDC at 6% APY. At what STRK end price does staking outperform lending after 12 months? Show working.',
        'You want to compound monthly. Estimate the additional STRK earned in year 2 vs year 1 from compounding, given 20,000 STRK staked at 9% APY.',
        'A slash event reduces your validator\'s pool by 3%. You have 5,000 STRK delegated. How much STRK do you lose? Is this the validator\'s own stake or does it affect delegators?',
        'You need 7,000 STRK available in exactly 15 days. You have 20,000 STRK staked. What are your options? What is the cost of each?',
        'Explain the difference between enter_delegation_pool and add_to_delegation_pool. Why does wallet.stake() abstract this?',
        'Why do staking rewards stop the moment you call exitPoolIntent(), rather than stopping when you call exitPool()?',
        'A user stakes 100% of their STRK. Three weeks later an urgent opportunity requires liquid STRK in 7 days. What lesson does this illustrate and what practical rule should they follow in future?',
        'Staking APY is currently 8.5%. Total staked grows 40% over the next 6 months with no change in emissions. What is the new APY?',
        'You claim 250 STRK in rewards and immediately swap them for USDC at $0.78. You put this USDC into a DCA order. Calculate: (1) USDC generated, (2) if the DCA runs weekly, how many $50 DCA cycles does this fund?',
        'Validator uptime over 12 months: 99.1%. Calculate how many hours of downtime this represents and estimate missed rewards on a 10,000 STRK position at 9% APY.',
        'You want to exit 4,000 STRK from a 15,000 STRK position. The partial exit will take 21 days. During the 21-day period, what is the daily reward generation on the remaining 11,000 STRK at 9% APY?',
        'Staking vs LP: STRK doubles in price during your 12-month staking period. How does this affect staking returns vs LP returns? Which outperforms and why?',
        'A validator raises commission from 4% to 11%. You have 25,000 STRK staked at 8.8% gross APY. Calculate: annual reward change. Is the 21-day exit worth it to move to a validator at 5% commission?',
        'Portfolio defense (from Lab 2): In your Lab 2 swap execution, you set slippage tolerance for a STRK swap. How does setting appropriate slippage tolerance for a swap relate to the unbonding period in staking? Both manage what kind of risk?',
      ],
    },
  },

  phase2: {
    id: 'navigator-lab-3-boss-phase2',
    title: 'Lab 3 Boss — Phase 2: Staking Portfolio Certification',
    description: 'No hints. Portfolio push. 100% pass required.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are managing the Starknet staking allocation for a family office.
They have 50,000 STRK to deploy and specific objectives.

Complete all five tasks. Submit transaction hashes for Tasks 1–3.

TASK 1 — Validator analysis and selection
Research at least two Sepolia testnet validators.
Document both with full criteria. Select one.
Stake 10 STRK in your chosen validator. Record the transaction hash.
Write 2 sentences explaining your selection.

TASK 2 — Position management
Check getPoolPosition() immediately after staking.
Record all three values. Come back after 10 minutes and check again.
Document: did rewards begin accruing? If not, what might explain it?
Claim any rewards that have accrued. Record the claim transaction hash.

TASK 3 — Partial exit simulation
Initiate exitPoolIntent() for 5 STRK (partial exit, leave 5 STRK active).
Record the transaction hash. Document: when can you call exitPool()?
What are your remaining 5 STRK earning during the unbonding period?

TASK 4 — Staking economics memo (written, no transaction)
The family office asks: "We have 50,000 STRK. We are bullish on STRK
long-term but need $5,000 liquid USDC available within 14 days each month
for operating expenses. Design a staking allocation that maximises STRK
accumulation while meeting the liquidity requirement."

Your memo must include:
  - Specific STRK amount to stake vs keep liquid
  - How the liquid portion covers the monthly $5,000 need
  - Compounding strategy for staking rewards
  - What happens if STRK falls 40% — does the strategy still work?

TASK 5 — Yield comparison (written)
Compare staking 50,000 STRK (at 9% APY, current price $0.80) vs lending the
equivalent $40,000 USDC (at 5.5% APY) for 12 months under three scenarios:
STRK at $0.60, $0.80, $1.20. Which performs better in each scenario?
At what STRK end price do the two strategies break even?
    `.trim(),

    scoringCriteria: [
      'Task 1: Two validators documented with all criteria. Selection transaction hash valid on Sepolia. 2-sentence justification tied to documented data.',
      'Task 2: getPoolPosition() output recorded at two time points. Reward accrual assessment is reasonable. Claim tx hash valid if rewards were available.',
      'Task 3: exitPoolIntent() tx hash valid on Sepolia. Exit date correctly calculated (today + 21 days). Remaining stake earning correctly described.',
      'Task 4: Specific STRK amount staked calculated with reasoning. Liquid buffer correctly sized relative to STRK price and $5,000 monthly need. Compounding strategy specified. 40% price drop scenario correctly analysed.',
      'Task 5: All six scenario values correctly calculated. Break-even STRK price calculated correctly. Conclusion tied to numbers not intuition.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/junior/lab-3-staking/',
      files: [
        {
          filename: 'staking-execution-record.md',
          type: 'narrative',
          content: `# Lab 3 — Staking and Delegation: Portfolio Certification

## Role Simulated
Staking Manager — Family Office Starknet Allocation

## Task 1 — Validator Selection
### Validator Research
| Criteria | Validator A | Validator B |
|---|---|---|
| Commission | | |
| Uptime | | |
| Self-stake | | |
| Pool size | | |
| Team identity | | |
| Overall score | | |

**Selected validator:** [name]
**Transaction hash:** [Sepolia tx hash]
**Selection rationale:** [2 sentences]

## Task 2 — Position Management
### getPoolPosition() at T=0 (immediately after staking)
- Staked: [STRK]
- Rewards: [STRK]
- Total: [STRK]

### getPoolPosition() at T+10 min
- Staked: [STRK]
- Rewards: [STRK]
- Total: [STRK]

**Reward accrual observation:** [analysis]
**Claim transaction hash:** [hash or N/A if no rewards yet]

## Task 3 — Partial Exit
- exitPoolIntent() transaction hash: [hash]
- Amount in unbonding: 5 STRK
- Amount remaining active: 5 STRK
- Earliest exitPool() date: [today + 21 days]
- Rewards on remaining 5 STRK during unbonding: [calculated]

## Task 4 — Staking Allocation Memo
### Allocation Plan for 50,000 STRK
- Amount to stake: [STRK]
- Amount to keep liquid: [STRK]
- Why this split: [reasoning]
- Monthly liquidity mechanism: [how $5,000 is sourced monthly]
- Compounding strategy: [specific approach]
- 40% STRK price decline scenario: [analysis of whether strategy holds]

## Task 5 — Yield Comparison: Staking vs Lending
### 50,000 STRK staked at 9% APY (initial value $40,000)
| Scenario | STRK at End | STRK Final Value | Lending Final Value | Winner |
|---|---|---|---|---|
| Bear | $0.60 | | $42,200 | |
| Flat | $0.80 | | $42,200 | |
| Bull | $1.20 | | $42,200 | |

**Break-even STRK price:** [calculated]
**Conclusion:** [which strategy to recommend for this family office's objectives]

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 3 Staking and Delegation — Junior Starknet DeFi Navigator',
      badgeEarned: 'Staking and Delegation Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const NAVIGATOR_LAB_3_META = {
  id: 'navigator-junior-lab-3',
  title: 'Staking and Delegation',
  trackId: 'starknet-defi-navigator',
  level: 'junior' as const,
  labNumber: 3,
  estimatedHours: 4,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  description: 'Learn PoS security, validator selection, position management, exit mechanics, and staking economics. Execute real staking transactions on Sepolia testnet.',
  lessonCount: 5,
  prerequisite: 'Lab 2 Phase 2 complete (first portfolio push earned)',
  portfolioNote: 'Second portfolio push. Adds staking execution record with validator analysis and staking economics memo to the growing portfolio.',
};
