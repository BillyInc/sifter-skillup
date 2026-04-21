// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 7 — ADVANCED LIQUIDITY PROVISION
// LESSONS 4–5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE + META
// Written to sim_instructions_v3 + Lab 11 standard
// Portfolio push: Lab 7 Phase 2 Boss

// ─────────────────────────────────────────────────────────────
// LESSON 4 — LP Position Sizing
// Dominant concept: LP positions belong in the opportunistic tier
// of the Lab 6 framework — size them to your IL tolerance,
// not your fee income target.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_4 = {
  id: 'lp-position-sizing',
  title: 'LP Position Sizing: Allocating to Liquidity Provision',
  explanation: `
In the Lab 6 portfolio framework, LP positions belong in the opportunistic tier — the 15% allocation reserved for active, higher-risk strategies. This is not a conservative recommendation. It reflects a structural reality: LP positions combine price exposure, IL risk, and management overhead in a way that makes them unsuitable as the primary yield strategy for most DeFi portfolios.

The first sizing principle is IL tolerance. Before deploying capital to an LP position, calculate the maximum dollar IL you can absorb without it materially affecting your overall portfolio. If you have $50,000 total and can tolerate losing $2,500 from a single strategy mistake, your maximum LP allocation is determined by how much IL could occur. A 3× STRK price move would produce 13.4% IL — so a $2,500 tolerance implies a maximum LP position of $2,500 / 13.4% = $18,650. More practically, size for the IL at 2× (5.72%), giving a $2,500 / 5.72% = $43,700 maximum — larger, but you should still apply the 15-20% portfolio cap from the Lab 6 framework.

The second sizing principle is management capacity. Concentrated LP requires active management. If you have a day job and check your portfolio weekly, a ±5% range on STRK is unsuitable — it will go out of range frequently and you will miss repositioning windows. Size your position to match your management frequency: wide ranges and low maintenance or narrow ranges requiring daily attention. Do not deploy $20,000 into a tight range you can only monitor weekly.

The third sizing principle is liquidity reserve impact. Recall from Lab 6 that your liquid reserve must remain 15-25% of total portfolio. LP capital is illiquid in a specific way: you can exit at any time, but the exit timing affects IL. Exiting during a price spike to re-enter at a better range crystallises IL at the worst possible moment. Do not fund LP positions from your liquid reserve — fund them from the opportunistic tier only.

Putting it together: for a $60,000 Starknet portfolio using the Lab 6 framework, the opportunistic tier is $9,000–$12,000 (15-20%). LP should take at most half of that allocation — $4,500–$6,000. This prevents LP IL from meaningfully damaging the overall portfolio while still allowing material participation in fee income. At 150% effective fee APY on $5,000, annual fee income is $7,500 — a meaningful contributor without existential IL risk.
  `.trim(),
  visualPrompt: 'Portfolio allocation diagram showing $60,000 split into four tiers from Lab 6 framework: Liquid Reserve (15%, $9,000), Dollar Yield (35%, $21,000), STRK Yield (30%, $18,000), Opportunistic (20%, $12,000). The Opportunistic tier is expanded to show: LP Position $5,000 (LP icon, labelled "max IL tolerance ÷ IL% at 2×"), DCA Accumulation $4,000, Experimental Protocol $3,000. Arrows from IL tolerance calculation feeding into LP sizing.',
  visualType: 'static',
  visualUrl: 'lp-position-sizing-framework',
  examples: [
    {
      contextTag: '[IL tolerance sizing, $80,000 portfolio]',
      context: 'A DeFi operator has $80,000 total. Their Lab 6 framework: 20% opportunistic = $16,000. They can tolerate losing $3,000 maximum from IL on any single LP position.',
      scenario: 'Calculate their maximum LP position size using IL tolerance as the binding constraint.',
      outcome: 'IL tolerance: $3,000. For a 2× price move (likely over 6-12 months for STRK), IL = 5.72%. Maximum LP position: $3,000 / 5.72% = $52,448. For a 3× move (worst case), IL = 13.4%. Maximum LP: $3,000 / 13.4% = $22,388. The binding constraint is the 3× worst-case: $22,388. But the portfolio cap of $16,000 (20% opportunistic tier) is more restrictive. The LP allocation is $16,000 × 50% = $8,000 (half the opportunistic tier). At this size, a 3× STRK move produces $8,000 × 13.4% = $1,072 IL — well within the $3,000 tolerance.',
    },
    {
      contextTag: '[Management capacity mismatch]',
      context: 'A full-time professional can check their Starknet portfolio every Saturday morning. They deploy $10,000 into a STRK/USDC Ekubo range of $0.95–$1.05 (±5%) with 400% APY when in range.',
      scenario: 'Over 8 weeks, STRK volatility causes the position to go out of range on Tuesday and re-enter range by Thursday, twice per week on average. Assess whether this is a suitable LP configuration.',
      outcome: 'The position goes out of range approximately 16 times over 8 weeks. Each out-of-range event is detected only on Saturday — meaning 4-5 days of zero fee income per event. Total days out of range: 16 × 2 days average per event = 32 days. Out-of-range fraction: 32/56 = 57%. Effective APY: 400% × 43% = 172%. Expected 8-week income: 172% / 52 × 8 × $10,000 = $2,646. Contrast: a ±25% range earning 80% APY always in range earns 80%/52 × 8 × $10,000 = $1,231. The tight range still wins — but the management capacity mismatch means the LP is running a tight range with weekly-only attention, leaving significant fee income on the table from missed repositionings.',
    },
    {
      contextTag: '[LP sizing within the full portfolio framework]',
      context: 'A practitioner runs a $45,000 Starknet portfolio: $9,000 liquid, $16,000 USDC in Vesu (5.8%), $14,000 staked (8.9%), $6,000 opportunistic. They want to add an LP position.',
      scenario: 'Using Lab 6 framework principles, determine an appropriate LP allocation and the maximum position size.',
      outcome: 'The opportunistic tier is $6,000. Following the 50% LP cap principle: maximum LP = $3,000. At 150% effective fee APY on $3,000, annual fee income = $4,500 (10% of total portfolio). Annual staking yield on $14,000 at 8.9% = $1,246. Annual Vesu yield on $16,000 at 5.8% = $928. Total annual yield: $4,500 + $1,246 + $928 = $6,674. Blended yield: $6,674 / $45,000 = 14.8%. Adding LP increases blended portfolio yield significantly. A worst-case 3× STRK move produces IL of $3,000 × 13.4% = $402 — less than one month of LP fee income at $375/month. The allocation is correctly sized.',
    },
  ],
  keyTakeaway: 'Size LP positions from your IL tolerance and management capacity, not your fee income target — LP belongs in the opportunistic tier capped at 10-15% of total portfolio to prevent IL from threatening the overall strategy.',
  guidedPractice: [
    {
      question: 'Your total Starknet portfolio is $30,000. Following the Lab 6 framework, what is the maximum suggested LP allocation?',
      options: [
        'A. $30,000 — LP has the highest yield, maximise it',
        'B. $9,000 — the full 30% STRK yield tier allocated to LP',
        'C. $2,250–$4,500 — half of the 15-30% opportunistic tier ($4,500–$9,000)',
        'D. $1,500 — 5% maximum for high-risk positions',
      ],
      correct: 2,
      hint: 'The Lab 6 framework puts LP in the opportunistic tier (15-20%). LP should take at most half of that allocation.',
      explanation: 'C is correct. Opportunistic tier at 15% of $30,000 = $4,500. At 20% = $6,000. LP at 50% of opportunistic = $2,250–$3,000. This prevents IL from damaging the overall portfolio while maintaining meaningful fee income participation. Option A ignores IL risk and portfolio framework entirely. Option B places LP in the wrong tier — staking is the STRK yield position, not LP. Option D is overly conservative for a well-managed LP position.',
    },
    {
      question: 'You can tolerate a maximum $1,500 IL loss. STRK is at $1.00. What is the maximum LP position size using the 2× price move scenario?',
      options: [
        'A. $1,500 — your tolerance equals the position size',
        'B. $26,224 — $1,500 / 5.72%',
        'C. $11,194 — $1,500 / 13.4%',
        'D. $3,000 — double your tolerance as a safety buffer',
      ],
      correct: 1,
      hint: 'Maximum position = IL tolerance / IL%. For a 2× move, IL = 5.72%. Divide tolerance by IL rate.',
      explanation: 'B is correct. Maximum position = $1,500 / 0.0572 = $26,224. This is the IL-tolerance-based maximum. In practice, you would also apply the portfolio framework cap (LP ≤ 50% of opportunistic tier), which is likely more restrictive for most portfolios. For a 3× worst-case (IL = 13.4%): $1,500 / 0.134 = $11,194. The correct answer depends on which price scenario you size for. Using 2× is standard for a base case; using 3× is more conservative.',
    },
    {
      question: 'You check your portfolio monthly. Which LP range configuration is most appropriate?',
      options: [
        'A. ±2% range — maximum fee efficiency',
        'B. ±10% range — balanced efficiency with monthly check frequency',
        'C. ±40% range — wide enough to stay in range through an entire month of typical STRK volatility',
        'D. Full range v2 equivalent — no management required',
      ],
      correct: 2,
      hint: 'STRK\'s monthly volatility can easily exceed ±10%. Match range width to how often you can reposition.',
      explanation: 'C is correct. With monthly monitoring, you need a range wide enough that STRK is unlikely to exit it within a month. STRK\'s 30-day historical volatility has frequently been ±20-40%. A ±40% range offers a reasonable chance of staying in range between monthly checks. ±2% (A) would go out of range within hours. ±10% (B) would likely go out of range multiple times per month. Full range (D) avoids out-of-range entirely but with near-zero capital efficiency. The practical choice for monthly monitors is wide range or the hybrid outer-range tier.',
    },
    {
      question: 'You want to fund a new LP position. Your current portfolio: $12,000 liquid, $20,000 staking, $8,000 Vesu, $0 opportunistic. Where should the LP capital come from?',
      options: [
        'A. From liquid reserve — it is accessible immediately',
        'B. From staking — reduce the STRK position to fund LP',
        'C. From Vesu — withdraw lending yield to fund LP',
        'D. The opportunistic tier is currently zero — add capital to portfolio or reduce another tier through the correct exit process before adding LP',
      ],
      correct: 3,
      hint: 'The Lab 6 framework requires an opportunistic tier for LP. If that tier is zero, you need to create it first.',
      explanation: 'D is correct. LP belongs in the opportunistic tier. Your opportunistic tier is currently zero — funding LP from the liquid reserve (A) reduces your emergency buffer below safe levels. Reducing staking (B) requires 21-day unbonding — use this only if you deliberately want to shift allocation. Reducing Vesu (C) depletes your dollar yield tier. The correct action: plan a portfolio rebalancing to create an opportunistic tier (e.g., reduce liquid reserve from $12,000 to $9,000 and reduce Vesu from $8,000 to $5,000, creating $6,000 opportunistic), then allocate $3,000 of that to LP.',
    },
    {
      question: 'A $5,000 LP position earns 200% effective fee APY. A worst-case 3× STRK price move would produce $670 IL. Your total portfolio is $40,000. Is this LP position correctly sized?',
      options: [
        'A. No — fee APY should be at least 10× the IL risk before deploying',
        'B. Yes — annual fee income ($10,000) far exceeds worst-case IL ($670). IL is only 1.7% of total portfolio.',
        'C. No — any IL risk is unacceptable in a well-managed DeFi portfolio',
        'D. Cannot determine without knowing current STRK price',
      ],
      correct: 1,
      hint: 'Compare annual fee income to worst-case IL. Check IL as a percentage of total portfolio.',
      explanation: 'B is correct. Annual fee income: $5,000 × 200% = $10,000. Worst-case IL: $670. Fee income covers IL in approximately 25 days ($10,000/365 = $27.40/day). IL as portfolio percentage: $670 / $40,000 = 1.7% — well within any reasonable tolerance. The position size ($5,000 = 12.5% of $40,000 portfolio) is within the opportunistic tier range. This is a correctly sized, high-return LP position. Option A introduces an arbitrary rule that does not correspond to any established framework.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Your $70,000 Starknet portfolio uses the Lab 6 framework: $14,000 liquid (20%), $21,000 USDC Vesu (30%), $21,000 staked STRK (30%), $14,000 opportunistic (20%). You want to deploy an LP position in STRK/USDC. STRK is at $1.20. Historical data: STRK has moved more than 2× within 6 months on two out of four measured periods. Design the LP allocation: position size, maximum IL tolerance, range selection justification, and expected fee income using a conservative 120% effective fee APY estimate.',
      scoringCriteria: [
        'Position size: LP from opportunistic tier at 50% = $7,000. Leaves $7,000 opportunistic for other strategies.',
        'IL tolerance: $7,000 × 5.72% (2×) = $400 for base case. $7,000 × 13.4% (3×) = $938 worst case. Total portfolio impact: $938 / $70,000 = 1.3% — acceptable.',
        'Range selection: given STRK\'s history of 2× moves within 6 months, a ±30% range ($0.84–$1.56) is recommended for hold-and-manage approach. If checking weekly, ±15% is manageable. Narrow ±5% requires daily attention.',
        'Expected fee income: $7,000 × 120% effective APY = $8,400/year = $700/month. Exceeds worst-case IL ($938) in approximately 40 days.',
        'Correct response includes the specific range, dollar amounts, and references both the portfolio framework and IL calculation.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You currently have an LP position that has been working well: $8,000 in STRK/USDC, earning 180% fee APY, in range 90% of the time. A new opportunity emerges: a newly launched token (NEWT/USDC) offering 2,000% APY from launch trading volume. Assess whether to add to or shift into the new position.',
      scoringCriteria: [
        'Current position assessment: $8,000 × 180% × 90% = 162% effective APY. Strong, proven position. Exiting crystallises any accumulated IL.',
        'New opportunity assessment: 2,000% APY at launch is typical for new pairs — volume will decrease as novelty fades, possibly within days. Underlying IL risk on NEWT is higher than STRK (new token, higher volatility, potential to go to zero).',
        'Risk-specific analysis: NEWT price could move 10× or go to zero. At 10× price move, IL = 2√10/(1+10)−1 = 42%. On $5,000 position = $2,100 IL. Could happen within days.',
        'Framework application: NEWT/USDC belongs in experimental sub-tier of opportunistic. Maximum allocation: 20% of opportunistic tier = $1,400–$2,800 maximum.',
        'Correct recommendation: do not exit current STRK/USDC position. Allocate a small experimental amount ($1,000–$2,000) to NEWT/USDC from the opportunistic tier\'s experimental sub-allocation. Cap at a level where total loss (not just IL) is tolerable.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend shows you their DeFi portfolio: 70% STRK staking, 30% in a single STRK/USDC LP position with ±8% range. They say: "The LP pays 350% APY and my staking covers my living expenses — this is my whole system." Write a 4-sentence critique addressing the specific risks of this configuration.',
      scoringCriteria: [
        'Identifies the range management risk: a ±8% range on STRK requires frequent repositioning — if they miss a repositioning window, their LP earns zero fees and they are left holding the depreciating asset.',
        'Raises the concentration concern: 100% in a single asset (STRK) across two different strategies provides correlation risk, not diversification. Both positions suffer in a STRK price decline.',
        'Points out the missing liquid reserve: no USDC or liquid buffer means any emergency or opportunity requiring capital faces a 21-day wait (staking) or IL crystallisation (LP exit). Living-expense dependency makes this worse.',
        'Suggests a specific rebalancing: introduce 15-20% liquid USDC reserve, reduce staking slightly, widen LP range to ±25% if they cannot monitor daily.',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// LESSON 5 — Advanced LP Strategies
// Dominant concept: multi-range positions, asymmetric ranges,
// and fee tier selection optimise LP for specific market views.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_5 = {
  id: 'advanced-lp-strategies',
  title: 'Advanced LP Strategies: Multi-Range, Asymmetric, and Fee Tier Optimisation',
  explanation: `
A single symmetric range centred on current price is the simplest concentrated LP deployment. It is also suboptimal for any LP with a market view. Advanced LP strategies use range asymmetry, multiple positions, and fee tier selection to express a directional opinion, manage IL more precisely, and optimise fee income across different market regimes.

An asymmetric range expresses a directional view. If you believe STRK is more likely to rise than fall from its current price of $1.00, you deploy a range of $0.90–$1.40 rather than the symmetric $0.80–$1.20. The upper bound is farther from current price, meaning you stay in range if STRK rises significantly. The lower bound is tighter, meaning you exit range faster on a downside move — but you own more STRK in that scenario (which is acceptable if you are bullish). This is not speculation; it is alignment between your LP deployment and your existing market view.

A multi-range strategy uses at least two positions to separate objectives. The classic implementation: a narrow inner range (±8%) for high-efficiency fee collection, and a wide outer range (±40%) as a fee-earning buffer when price moves. The inner range earns the bulk of fees when STRK is in a calm period. The outer range earns lower but consistent fees during volatile stretches. Each range has its own IL clock — repositioning only the inner range when it exits does not affect the outer range.

Fee tier selection is a routing decision. On Ekubo, 0.01% is for stablecoin or highly correlated pairs, 0.05% for semi-stable pairs (e.g., ETH/wstETH), 0.30% for standard volatile pairs (STRK/USDC, STRK/ETH), and 1.00% for exotic or highly illiquid pairs. LPs in the wrong tier lose volume to aggregators that route around them. An LP in a 1.00% STRK/USDC pool earns high fees per trade but captures very little volume — AVNU routes most STRK/USDC trades to the 0.30% pool. Fee tier is not a yield knob — it is a routing prediction.

The most important advanced concept is position rebalancing discipline. When an inner range goes out of range, do not immediately reposition to the new price. First, assess: is this move a short-term spike or a regime change? If STRK moved from $1.00 to $1.20 on high volume and strong fundamentals, repositioning to a new range centred at $1.20 makes sense. If STRK moved to $1.20 on thin volume with no news, mean reversion is likely — waiting for re-entry into the original range avoids paying IL twice (once to exit range, once on the repositioning).
  `.trim(),
  visualPrompt: 'Three LP strategy diagrams on the same price axis. Diagram 1 (Symmetric): range $0.80–$1.20, current price $1.00 at centre. Diagram 2 (Asymmetric bullish): range $0.90–$1.40, current price $1.00 closer to the lower bound — showing bullish tilt. Diagram 3 (Multi-range): inner range $0.90–$1.10 labelled "50% capital, high efficiency" and outer range $0.70–$1.50 labelled "50% capital, always earning." Current price $1.00 shown in the middle of both ranges.',
  visualType: 'static',
  visualUrl: 'advanced-lp-strategy-comparison',
  examples: [
    {
      contextTag: '[Asymmetric range, bullish STRK view]',
      context: 'An LP is strongly bullish on STRK at $1.00. They expect STRK to reach $2.00 over 3 months but could see a brief drop to $0.75 on broader market weakness.',
      scenario: 'Design an asymmetric range that reflects this view and calculate how it performs vs a symmetric range if STRK reaches $1.80.',
      outcome: 'Asymmetric range: $0.85–$1.85 (lower bound tight, upper bound wide). Symmetric range: $0.70–$1.30 (±30%). At $1.80: Asymmetric — still in range at $1.85 upper tick. Earning fees throughout the $1.00→$1.80 move. IL at $1.80 (r=1.8): 2√1.8/(1+1.8)−1 = 2×1.342/2.8−1 = −4.15%. Symmetric — exits range at $1.30. Fully in USDC from $1.30 to $1.80. Earned fees from $1.00→$1.30 but zero fees above $1.30. The asymmetric range significantly outperforms in the bullish scenario the LP anticipated.',
    },
    {
      contextTag: '[Multi-range repositioning discipline]',
      context: 'An LP has $10,000 in a multi-range setup: $5,000 inner range $0.90–$1.10, $5,000 outer range $0.70–$1.40. STRK spikes to $1.25 on thin volume — an exchange listing announcement that reversed within 24 hours.',
      scenario: 'The inner range went out of range at $1.10. The LP must decide: reposition inner range to $1.15–$1.35, or wait.',
      outcome: 'Assessment: the spike to $1.25 occurred on thin volume (announcement-driven), reversed within 24 hours, suggesting mean reversion. Outer range is still earning fees throughout ($0.70–$1.40 covers $1.25). The inner range is sitting 100% in USDC. Decision: wait. If STRK returns to $1.00–$1.10, the inner range re-enters and earns fees again without incurring repositioning costs. If the LP had repositioned immediately to $1.15–$1.35, STRK would have re-entered the original inner range while the new inner range is now centred too high — double repositioning cost with no gain.',
    },
    {
      contextTag: '[Fee tier mismatch, volume routing]',
      context: 'An LP provides $15,000 of liquidity to a STRK/USDC 1.00% fee tier pool on Ekubo. Daily STRK/USDC trading volume on Starknet is $2,000,000. The 0.30% fee tier pool has $1,500,000 in liquidity. The 1.00% pool has $200,000.',
      scenario: 'AVNU routes all trades to minimize slippage plus fees. Calculate how much volume the 1.00% pool actually captures.',
      outcome: 'For a $10,000 STRK/USDC swap: 0.30% fee = $30, 1.00% fee = $100. AVNU routes to the 0.30% pool unless the 0.30% pool has insufficient depth (large trades creating >0.70% slippage difference). Given $1,500,000 in 0.30% liquidity, the pool absorbs most trades with minimal slippage. The 1.00% pool captures only trades where AVNU cannot route efficiently — perhaps $40,000 of $2,000,000 daily volume (2%). The LP\'s fee income: $15,000 / $200,000 = 7.5% pool share. Daily income: $40,000 × 1.00% × 7.5% = $30/day. Had the LP been in the 0.30% pool with $15,000 / $1,500,000 = 1% share: $2,000,000 × 0.30% × 1% = $60/day. The lower fee tier generates more income because it captures more volume.',
    },
  ],
  keyTakeaway: 'Advanced LP strategies use asymmetric ranges to express market views, multi-range positions to balance efficiency against consistency, and correct fee tier selection to capture maximum routing volume.',
  guidedPractice: [
    {
      question: 'You are bearish on STRK in the short term but bullish medium term. Which asymmetric range best reflects this view at a current price of $1.00?',
      options: [
        'A. $1.00–$1.60 — capture only the upside you expect long term',
        'B. $0.70–$1.15 — tight upper, wide lower: stay in range if STRK drops, exit quickly if it spikes',
        'C. $0.85–$1.45 — mild bearish tilt with wide upper to capture the eventual recovery',
        'D. $0.50–$2.00 — full range covers all scenarios',
      ],
      correct: 1,
      hint: 'Bearish short term means you expect the lower bound to be tested more than the upper. The wide lower side keeps you in range during the expected dip.',
      explanation: 'B is correct. A wide lower bound ($0.70) and tight upper ($1.15) reflects short-term bearish positioning: you stay in range through a dip to $0.70, continuing to earn fees during the expected decline. The tight upper ($1.15) means you exit range quickly on any unexpected upside spike — acceptable since you are not expecting near-term upside. Option A earns nothing if STRK falls. Option C (mild bearish tilt) under-represents the bearish conviction. Option D is not asymmetric — it is full-range with no view expression.',
    },
    {
      question: 'Your inner range ($0.92–$1.08) went out of range when STRK pumped to $1.15 on massive volume following a major protocol upgrade announcement. The outer range ($0.75–$1.50) is still earning. Should you reposition the inner range?',
      options: [
        'A. No — wait for STRK to return to your original inner range',
        'B. Yes — the protocol upgrade is fundamental news, not a noise spike. Reposition inner range to $1.10–$1.25.',
        'C. Yes, but first withdraw the outer range position and consolidate into one centred range',
        'D. No — repositioning always crystallises IL and should be avoided',
      ],
      correct: 1,
      hint: 'Assess: is this a regime change (fundamental news, sustained volume) or a noise spike (thin volume, likely reversal)?',
      explanation: 'B is correct. A major protocol upgrade on high volume is a regime change signal, not noise. Price is unlikely to mean-revert to $1.00 quickly. The inner range at $0.92–$1.08 may not see price re-enter for weeks or months, earning zero fees in the meantime. Repositioning to $1.10–$1.25 restores high-efficiency fee earning at the new price level. Option A is the correct choice for noise spikes, not fundamental moves. Option C unnecessarily disrupts the outer range, which is still earning. Option D is too absolute — repositioning IL crystallisation is justified when the alternative is extended zero-fee periods.',
    },
    {
      question: 'A USDC/DAI pair (both USD-pegged stablecoins) on Ekubo. Which fee tier should you choose?',
      options: [
        'A. 1.00% — stablecoin pairs are risky (depeg risk) so high fee compensates',
        'B. 0.30% — the standard tier for most pairs',
        'C. 0.01% — stablecoin pairs trade at near-zero price divergence; any higher fee routes traders elsewhere',
        'D. 0.05% — semi-stable classification for USD-pegged assets',
      ],
      correct: 2,
      hint: 'Recall the fee tier lesson. For near-zero price divergence pairs, which tier captures maximum volume through routing?',
      explanation: 'C is correct. USDC/DAI trade at near-parity with price variation of 0.001–0.01% in normal conditions. A 0.01% fee tier means your fee is lower than the expected price move — competitive with any alternative. A 0.30% fee tier makes every USDC/DAI swap 30× more expensive, and AVNU immediately routes to the 0.01% pool instead. The 1.00% tier is never correct for stablecoins — depeg risk is a reason to monitor, not a reason to charge traders more (which only routes volume away from you).',
    },
    {
      question: 'You have $15,000 to deploy as LP. Option A: one position, full $15,000, ±15% range. Option B: split — $7,500 inner ±5%, $7,500 outer ±35%. Assuming the inner range is in range 65% of the time and earns 300% APY when in range, and the outer range earns 70% APY always in range, which earns more annually?',
      options: [
        'A. Option A — concentrated positions always outperform',
        'B. Option B: inner = $7,500 × 300% × 65% = $14,625. Outer = $7,500 × 70% = $5,250. Total = $19,875.',
        'C. Option A: $15,000 × 300% × 65% = $29,250. Option B total = $19,875. Option A wins.',
        'D. Option A: assuming ±15% stays in range 85% of the time at 150% APY = $19,125. Compared to Option B $19,875 — they are approximately equal.',
      ],
      correct: 3,
      hint: 'For Option A, the ±15% range is not the same APY or in-range frequency as the inner ±5% range. Estimate ±15% performance separately.',
      explanation: 'D is the most accurate answer. Option A with ±15% range: wider range means lower capital efficiency — APY might be ~150% (midpoint between inner 300% and outer 70%). In-range frequency at ±15% ≈ 85%. Annual income: $15,000 × 150% × 85% = $19,125. Option B: inner $14,625 + outer $5,250 = $19,875. The hybrid slightly outperforms at these parameters, but the margin is small. The real advantage of Option B is consistency — the outer range prevents total zero-fee periods when price exits the inner range.',
    },
    {
      question: 'Your outer range LP position ($0.60–$1.60) is earning 45% APY. You notice a new pool for the same pair offering 400% APY in a ±3% range. Should you move your outer range capital?',
      options: [
        'A. Yes — 400% >> 45%, always move to the higher APY',
        'B. No — the outer range serves a specific function (buffer) that a ±3% range cannot replicate. Keep the outer range and consider a separate small allocation to the ±3% range.',
        'C. Yes, but only after calculating IL on exit from the current position',
        'D. No — moving between ranges always triggers a tax event that eliminates gains',
      ],
      correct: 1,
      hint: 'Why did you deploy an outer range in the first place? Can a ±3% range serve the same purpose?',
      explanation: 'B is correct. The outer range\'s purpose is continuity — earning fees even when price moves outside the inner range. A ±3% range goes out of range with any meaningful price move and earns zero — the opposite of the outer range\'s function. Moving your buffer capital to a ±3% range eliminates the buffer. The correct action: keep the outer range, and optionally allocate a small additional amount to the ±3% inner position if management capacity permits and total LP allocation stays within framework limits. Option C has the right instinct (consider IL) but reaches the wrong conclusion.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You are optimising your LP strategy on Ekubo. You have $18,000 allocated to LP (within your opportunistic tier). Current STRK price: $0.95. 30-day price range observed: $0.72–$1.15. You have moderate bullish conviction. Design a complete multi-range deployment: position count, capital split, range bounds for each, fee tier, and expected effective APY (use 300% when in range for inner, 65% for outer, and assume inner in-range 70% based on recent volatility).',
      scoringCriteria: [
        'Inner range: asymmetric bullish tilt. Example: $0.85–$1.20 (tighter lower, wider upper for bullish bias). Capital: $9,000. In-range estimate: 70%. Effective APY: 300% × 70% = 210%. Annual income: $18,900.',
        'Outer range: $0.65–$1.60 (covers full 30-day range plus buffer). Capital: $9,000. Always in range at 65% APY. Annual income: $5,850.',
        'Fee tier: 0.30% for STRK/USDC — standard volatile pair, highest routing volume tier.',
        'Total expected annual income: $18,900 + $5,850 = $24,750. Effective blended APY on $18,000 = 137.5%.',
        'Correct response demonstrates asymmetric range rationale (bullish conviction in upper bound placement), references historical price range for outer bound, and confirms fee tier selection.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You have been running a multi-range LP for 3 months. Inner range: $0.85–$1.10, earning 280% when in range, in range 60% of time. Outer range: $0.65–$1.45, earning 60%. Total LP capital: $10,000 ($5,000 each). STRK is now at $0.68 — near the outer range lower bound of $0.65. Assess the risk to your full position and prescribe an action.',
      scoringCriteria: [
        'Inner range status: at $0.68, price is below $0.85 lower tick. Inner range is fully in STRK. Earning zero fees. IL has been realised from the entry price to $0.68.',
        'Outer range status: $0.68 is within the outer range ($0.65 lower). Outer range is active, earning 60% APY on $5,000 = $3,000/year. The outer range is doing its job — providing fee income buffer during price decline.',
        'Risk assessment: the outer range lower bound is $0.65. If STRK falls another 4.5%, the outer range also exits and both positions earn zero. Total LP = $10,000 at risk of becoming entirely non-earning.',
        'Action: the critical question is whether $0.65 will hold. If you are uncertain, consider: (1) wait and monitor with $0.65 as the trigger for emergency reassessment, (2) close the inner range now (crystallise IL, free up $5,000 STRK to redeploy elsewhere), (3) widen the outer range lower bound to $0.50 by exiting and re-entering (costs gas and a repositioning IL hit).',
        'Correct response acknowledges the proximity to the outer range exit, calculates the remaining buffer, and provides a specific action with stated rationale.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You are presenting your LP strategy to a Starknet DeFi study group. Explain in 4 sentences why fee tier selection is not simply "higher fee = more income" — using the STRK/USDC example where a 1.00% pool and a 0.30% pool exist simultaneously.',
      scoringCriteria: [
        'Explains routing: aggregators like AVNU route to the cheapest execution for the trader, which directs volume overwhelmingly to the lower fee tier pool.',
        'Quantifies the volume split: a 1.00% pool might capture 2-5% of STRK/USDC volume while the 0.30% pool captures 90%+, because most trades are below the size threshold where depth advantage outweighs fee cost.',
        'States the counterintuitive result: an LP in the 0.30% pool typically earns more total income than an LP in the 1.00% pool for the same capital, because volume × (lower fee %) > (minimal volume) × (higher fee %).',
        'Identifies when higher fee tier is correct: for exotic or very illiquid pairs where the 0.30% pool does not have enough depth to absorb large trades, the 1.00% pool can capture those large trades efficiently.',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMS — Lab 7
// ─────────────────────────────────────────────────────────────

export const LAB7_AGGREGATE_SIMS = {
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
  description: 'Random draw of 15 scenarios from all 5 Lab 7 lessons. No labels shown. Tests advanced LP concepts across: fee economics, impermanent loss formula, concentrated range management, position sizing, and multi-range / asymmetric strategies.',
};


// ─────────────────────────────────────────────────────────────
// BUILD TASK — Lab 7
// ─────────────────────────────────────────────────────────────

export const LAB7_BUILD_TASK = {
  id: 'navigator-lab-7-build',
  title: 'LP Position Design and Deployment Report',
  labProgressionNumber: 7,
  type: 'judgment-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',

  description: `
Design and partially execute a complete LP position on Ekubo using Starknet Sepolia testnet.

SECTION 1 — Market Assessment (150–200 words)
Current STRK price on Sepolia testnet (or use $1.00 as baseline if testnet price is unavailable).
Your directional view for the next 30 days: bullish, bearish, or neutral. State your reasoning in one paragraph — do not hedge every sentence.
30-day historical price range for STRK (source from DefiLlama, Starkscan, or CoinGecko). Use this to justify your range selection.

SECTION 2 — Range Design (quantitative)
Your chosen range: lower tick price and upper tick price.
Justification: is it symmetric or asymmetric? If asymmetric, which direction and why?
Capital efficiency multiplier vs full-range (estimate: full range width / your range width).
Estimated in-range percentage based on the 30-day historical range you identified.
Fee tier selection: which tier and why.

SECTION 3 — Position Sizing (quantitative)
Your total Starknet portfolio value (use the testnet portfolio from Lab 6 Phase 2 if available, or specify a hypothetical).
Your opportunistic tier allocation from the Lab 6 framework.
LP allocation as a percentage of opportunistic tier (must be ≤ 50%).
Dollar position size.
Maximum IL tolerance calculation: position size × IL% at 2× price move.

SECTION 4 — Testnet Execution
Using the Ekubo testnet interface or starkzap SDK: add liquidity with a small testnet amount (minimum 1 USDC equivalent).
Record: transaction hash, the exact range ticks used, the token amounts deposited.

SECTION 5 — Management Plan (100–150 words)
Under what conditions will you reposition the inner range (if using multi-range)?
What is your trigger for exiting the LP entirely?
How frequently will you check the position?
  `.trim(),

  scoringCriteria: [
    'Section 1: directional view is stated clearly and supported by specific price data, not generic statements.',
    'Section 2: range bounds are specific numbers, not approximate. Asymmetric rationale directly references the directional view from Section 1. Capital efficiency multiplier is calculated.',
    'Section 3: LP position size ≤ 50% of opportunistic tier. IL tolerance calculation is shown with working.',
    'Section 4: transaction hash is valid on Sepolia. Token amounts match the stated range and position size.',
    'Section 5: repositioning trigger is a specific price or condition, not vague (e.g., "if STRK moves too much"). Exit trigger is specific. Check frequency is realistic given stated management capacity.',
  ],
};


// ─────────────────────────────────────────────────────────────
// BOSS BATTLE — Lab 7
// ─────────────────────────────────────────────────────────────

export const LAB7_BOSS = {
  phase1: {
    id: 'navigator-lab-7-boss-phase1',
    title: 'Lab 7 Boss — Phase 1: Advanced LP Gauntlet',
    description: 'Timed gauntlet. Hints available. 80% pass threshold.',
    hints: true,
    portfolioPush: false,

    scenarios: [
      // Fee economics
      'You deposit $8,000 into a pool with $320,000 total liquidity and 0.30% fee tier. Daily volume is $960,000. Calculate: your pool share, daily pool fees, your daily fee income, and your fee APY.',
      'Pool A: $100,000 liquidity, $1,500,000 daily volume, 0.30% fee. Pool B: $2,000,000 liquidity, $1,500,000 daily volume, 0.30% fee. You have $10,000 to deploy. Calculate daily income in each. Why does Pool A produce more income despite identical volume?',
      'Your LP position earned $2,800 in fee income over 90 days on a $14,000 position. STRK moved 2× from your entry price over the same period. Calculate net return in dollars and percentage.',

      // IL formula
      'STRK is at $0.80 at LP entry. 4 months later STRK is at $2.40. Calculate IL using the formula. If your position is $10,000, what is the dollar IL? What would your hold value have been?',
      'Two LPs entered identical $5,000 positions at $1.00. LP A exits when STRK = $0.50. LP B holds as STRK falls to $0.50 then recovers to $1.00 and exits. Calculate the IL for each at exit. Explain the difference.',
      'Fee APY: 200%. STRK moved 3× during the year. Calculate net return. Would you have been better off holding the assets instead of providing liquidity?',

      // Concentrated range management
      'You have a ±10% range on STRK/USDC entered at $1.00. STRK falls to $0.85. Describe your current position in terms of asset composition, fee earning status, and IL status.',
      'Compare three range widths for a $6,000 STRK/USDC position at $1.00: (a) ±5%, expected in-range 50% of time, 500% APY in range; (b) ±20%, expected in-range 85%, 125% APY; (c) ±50%, expected in-range 99%, 50% APY. Calculate effective annual income for each.',
      'STRK is at $1.10 — outside your inner range of $0.90–$1.05. Before repositioning, you check: the pump was on heavy volume following a staking rewards increase announcement. What is the correct repositioning decision and why?',

      // Position sizing
      'Portfolio: $55,000. Lab 6 framework: 15% liquid, 35% Vesu, 30% staking, 20% opportunistic. You want LP. Calculate: maximum LP allocation, LP position size, IL in dollars at 2× STRK move.',
      'You can tolerate $2,000 maximum IL. STRK is at $1.50. What is the maximum LP position size using: (a) 2× scenario, (b) 3× scenario? Use the IL formula.',

      // Advanced strategies
      'Design an asymmetric range for STRK at $1.00 with a moderate bearish short-term view. Specify lower and upper bound, justify the asymmetry, and describe what happens to the position at your predicted low price.',
      'Your multi-range position: $6,000 inner ($0.88–$1.08), $6,000 outer ($0.65–$1.40). STRK moves to $1.12. Describe both positions\' status. Should you reposition the inner range if the move was on average volume with no fundamental catalyst?',

      // Cross-lab synthesis
      'Cross-lab (Lab 2): you are repositioning your LP range by exiting and re-entering. You need to sell 5,000 STRK to convert to USDC before adding liquidity to the new range. STRK price is $1.15 and pool depth is $400,000. Should you use a single AVNU swap, or split across multiple swaps? Calculate approximate price impact.',
      'Cross-lab (Labs 1–7 synthesis): you have a complete Starknet portfolio. Your LP position went out of range on the upside. Your staking position has an upcoming 21-day unbonding completion. Your Vesu position is at 91% utilisation — the protocol from Lab 4 where you supply assets to earn yield — limiting withdrawals. Rank which action to take first and why, considering time constraints and opportunity cost.',
    ],
  },

  phase2: {
    id: 'navigator-lab-7-boss-phase2',
    title: 'Lab 7 Boss — Phase 2: Advanced LP Certification',
    description: 'No hints. Portfolio push. 100% pass required. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are managing LP allocations for a Starknet DeFi operator.
Total portfolio: $90,000. LP budget (opportunistic tier): $13,500 (15%).
Current STRK price: use live price from DefiLlama/Starkscan or $1.00 baseline.

Complete all five tasks. Tasks 1–3 require transaction hashes from Starknet Sepolia testnet.

TASK 1 — Execute a multi-range LP deployment
Deploy a two-range LP position in STRK/USDC on Ekubo Sepolia testnet.
Inner range: centred at current price, ±10%.
Outer range: centred at current price, ±35%.
Use at minimum 2 USDC total split between ranges.
Record: both transaction hashes, exact tick bounds used for each range, token amounts deposited in each range.

TASK 2 — IL analysis on the live position
Using your entry prices and current prices (check Starkscan 30 minutes after deployment):
Calculate current IL percentage for your inner range position.
Calculate IL in dollar terms on the testnet position.
Calculate how many days of fee income at your estimated APY are needed to recover this IL.

TASK 3 — Repositioning simulation
Artificially assume STRK price has moved to 1.5× your entry price (out of inner range, within outer range).
Document the steps you would take to reposition the inner range.
Execute one of the following on testnet: (a) remove liquidity from your inner range, or (b) add a new narrow range at the new simulated price.
Record: transaction hash and the rationale for the action taken.

TASK 4 — Full LP strategy memo (written, no transaction)
For the full $13,500 LP budget:
  - Multi-range allocation: dollar amounts in inner and outer ranges
  - Specific range bounds for each (numbers, not descriptions)
  - Fee tier selection and routing rationale
  - Expected effective APY for each range (in-range frequency × APY when in range)
  - Total expected annual fee income in dollars
  - Maximum IL scenario: 3× STRK price move, total dollar IL on full position
  - Break-even analysis: days of fee income needed to cover worst-case IL

TASK 5 — Risk-adjusted comparison (written)
Compare your LP strategy against using the same $13,500 in Vesu USDC lending at current APY (look up live rate).
Show: annual income from each, worst-case loss from each (IL vs utilisation lock-up risk), and net risk-adjusted return if you weight each risk by a 15% annual probability of materialising.
Conclude: which deployment is more appropriate for the opportunistic tier and why.
    `.trim(),

    scoringCriteria: [
      'Task 1: both transaction hashes valid on Sepolia. Tick bounds are specific numbers in Ekubo tick format (or price format). Token amounts consistent with stated split.',
      'Task 2: IL formula applied correctly. Dollar IL calculated on actual testnet position size. Break-even days = IL in dollars / (daily fee income estimate).',
      'Task 3: repositioning rationale addresses the specific market condition (1.5× move). Transaction hash valid. Action is internally consistent with the stated rationale.',
      'Task 4: inner + outer range capital sums to $13,500. All range bounds are specific. Effective APY calculated with in-range frequency stated. Annual income calculated. 3× IL scenario uses the formula (IL = −13.4%) applied to total LP capital. Break-even days explicitly calculated.',
      'Task 5: Vesu APY sourced from live data (not estimated). Risk weighting is explicit: each risk type multiplied by 15% annual probability. Net risk-adjusted return shown for both. Conclusion is a specific recommendation with stated reasoning.',
    ],

    crossChainNote: `
## Cross-Chain Context: Advanced LP on Ethereum and Solana

The concentrated liquidity architecture you have mastered on Ekubo was pioneered by Uniswap v3 on Ethereum mainnet — the same fundamental mechanics, different execution environment.

On Ethereum mainnet: Uniswap v3 is the dominant concentrated LP venue. Gas costs for adding, removing, or repositioning liquidity range from $15–$80 per transaction depending on network congestion. A repositioning event (remove + re-add) costs $30–$160. This dramatically raises the break-even threshold for narrow-range strategies — a ±5% range requires enough fee income to cover both IL and $160 in gas per repositioning. At typical Uniswap v3 APYs on ETH pairs, this favours positions that hold ranges for weeks, not days. Uniswap v4 (launched late 2024) introduces hooks — programmable LP logic — that enables automated repositioning within a single transaction, reducing management overhead.

On Solana: Orca Whirlpools implements concentrated liquidity with near-zero fees (under $0.01 per transaction). This makes frequent repositioning economical at any position size — similar to Starknet. Kamino Finance builds on top of Whirlpools with automated range management vaults that reposition ranges algorithmically based on price movement and fee income thresholds. Depositing into a Kamino vault converts active LP management into a passive deposit — at the cost of vault fees (typically 10% of yield).

Starknet advantage: Ekubo's architecture and Starknet's transaction costs make the multi-range hybrid strategy practically accessible at any position size, without the gas-cost threshold that makes frequent repositioning on Ethereum mainnet uneconomical below $50,000.
    `.trim(),

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/intermediate/lab-7-advanced-lp/',
      files: [
        {
          filename: 'advanced-lp-strategy.md',
          type: 'narrative',
          content: `# Lab 7 — Advanced Liquidity Provision: Certification

## Role Simulated
LP Strategy Manager — Starknet DeFi Portfolio ($90,000 AUM, $13,500 LP Budget)

## Task 1 — Multi-Range LP Deployment

### Inner Range
- Transaction hash: [Sepolia tx hash]
- Lower tick / price: [value]
- Upper tick / price: [value]
- STRK deposited: [amount]
- USDC deposited: [amount]

### Outer Range
- Transaction hash: [Sepolia tx hash]
- Lower tick / price: [value]
- Upper tick / price: [value]
- STRK deposited: [amount]
- USDC deposited: [amount]

## Task 2 — IL Analysis

- Inner range entry price: [STRK price at deposit]
- Current STRK price (30 min post-deployment): [price]
- Price ratio r: [current / entry]
- IL%: 2√r / (1 + r) − 1 = [calculated %]
- Position size on testnet: [USDC value deposited]
- IL in dollars (testnet): [$ amount]
- Estimated fee APY (inner range, when in range): [%]
- Daily fee income estimate: position × APY / 365 = [$/day]
- Break-even days: IL / daily income = [days]

## Task 3 — Repositioning Simulation

- Simulated new price (1.5× entry): [price]
- Action taken: [remove inner range liquidity / add new narrow range]
- Transaction hash: [Sepolia tx hash]
- Rationale: [why this action, why now vs waiting]

## Task 4 — Full LP Strategy Memo ($13,500)

### Multi-Range Allocation
| Range | Capital | Lower | Upper | Width | Est. In-Range | APY In-Range | Effective APY | Annual Income |
|---|---|---|---|---|---|---|---|---|
| Inner | $[amount] | [price] | [price] | ±[%] | [%] | [%] | [%] | $[amount] |
| Outer | $[amount] | [price] | [price] | ±[%] | [%] | [%] | [%] | $[amount] |
| **Total** | **$13,500** | | | | | | **[blended %]** | **$[total]** |

**Fee tier:** [0.01% / 0.05% / 0.30% / 1.00%]
**Routing rationale:** [why this tier for STRK/USDC]

### IL Scenario Analysis
- Worst-case (3× price move): IL = 13.4%
- Dollar IL on $13,500: $[calculated]
- Break-even days at daily fee income: [days]

## Task 5 — Risk-Adjusted Comparison

### LP Strategy vs Vesu Lending

| Metric | LP ($13,500) | Vesu ($13,500) |
|---|---|---|
| Annual income | $[amount] | $[amount] |
| Primary risk | IL (3× = 13.4% = $[amount]) | Utilisation lock-up |
| Worst-case loss | $[IL amount] | $0 (no IL) + lock-up duration |
| Risk probability | 15% per year | 15% per year |
| Expected annual loss | [probability] × $[loss] | [probability] × [estimated cost] |
| Net risk-adjusted return | $[income] − $[expected loss] | $[income] − $[expected loss] |

**Conclusion:** [LP / Vesu] is more appropriate for the opportunistic tier because [specific reasoning].

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 7 Advanced LP — Intermediate Starknet DeFi Navigator',
      badgeEarned: 'Advanced Liquidity Provision Certified — Intermediate',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};


// ─────────────────────────────────────────────────────────────
// META — Lab 7
// ─────────────────────────────────────────────────────────────

export const NAVIGATOR_LAB_7_META = {
  id: 'navigator-intermediate-lab-7',
  title: 'Advanced Liquidity Provision',
  trackId: 'starknet-defi-navigator',
  level: 'intermediate' as const,
  labNumber: 7,
  estimatedHours: 5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 6 Phase 2 complete (Intermediate level entry certified)',
  description: 'LP fee economics, impermanent loss formula, concentrated range management on Ekubo, LP position sizing within the portfolio framework, and advanced strategies including multi-range positions, asymmetric ranges, and fee tier optimisation.',
  nextLab: 'Lab 8 — Advanced Borrowing Strategies',
};
