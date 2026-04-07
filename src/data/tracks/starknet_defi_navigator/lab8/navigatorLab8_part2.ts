// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 8 — BRIDGING AND CROSS-CHAIN CAPITAL MOVEMENT
// LESSONS 4–5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Written to: lesson_writing_instructions.txt + sim_instructions_v3.md
// Build task: Expanded Choice (4 options) — Section 20.5
// Portfolio push: Lab 8 Phase 2 Boss

export const LAB8_LESSONS_4_TO_5 = [

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Round-Trip Cost Calculation
// Dominant concept: a cross-chain strategy that looks
// profitable on yield alone may be net-negative once
// you account for every cost in a complete round-trip
// calculation — and the break-even duration reveals
// the minimum hold period before a move makes sense.
// ─────────────────────────────────────────────────────────────
{
  id: 'round-trip-cost-calculation',
  title: 'Round-Trip Cost Calculation: The True Cost of Moving Capital',

  explanation: `
A yield opportunity on Starknet offers 18% APY on USDC. You hold $30,000 USDC on Ethereum. At 18% APY over 60 days, you expect $30,000 × 0.18 × (60/365) = $887 in yield. You bridge over, earn the yield, bridge back. Before you run that calculation, pause: have you accounted for every cost the round trip actually creates?

Entry costs are the easiest to see. A CCTP transfer from Ethereum to Starknet costs approximately $5 in Ethereum gas. Starknet transactions are near-zero in fee due to account abstraction — the programmable wallet model from Starknet Island. Supplying USDC to Vesu — the lending protocol from Lab 4 — costs less than $0.01 on Starknet. So entry friction is approximately $5.

Exit costs are less obvious. Withdrawing from Starknet to Ethereum via Starkgate takes up to 12 hours. During those 12 hours, your $30,000 sits idle — not earning the 18% APY you moved for. The opportunity cost of that idle period is $30,000 × 0.18 × (12/8,760 hours) = $7.40. Add the Ethereum gas to claim the L1 withdrawal: approximately $9. Total exit cost: $16.40.

The full round-trip cost is: $5 entry + $16.40 exit = $21.40. This is your bridge friction — the minimum yield a strategy must earn before it breaks even on costs alone. The break-even duration is the number of days you need to hold before the yield accumulated exceeds the round-trip cost. The formula is: break-even days = round-trip cost / (principal × APY / 365). For $30,000 at 18% APY: break-even = $21.40 / ($30,000 × 0.18 / 365) = $21.40 / $14.79 per day = 1.45 days. After 1.45 days on Starknet, the strategy is profitable.

Scale changes this calculation dramatically. At $500 principal: break-even = $21.40 / ($500 × 0.18 / 365) = $21.40 / $0.246 per day = 87 days. A $500 cross-chain yield strategy at 18% APY requires an 87-day hold to break even. If the opportunity lasts less than 87 days, the strategy loses money despite a positive APY. This is why cross-chain DeFi is structurally unsuited to small amounts.

The break-even formula has four levers: higher principal shortens break-even. Higher APY shortens break-even. Lower round-trip cost shortens break-even. Longer hold duration provides more room for costs to be absorbed. When evaluating any cross-chain yield move, calculating break-even duration is the first step — before looking at APY, before comparing protocols.
  `.trim(),

  visualPrompt: 'Two-part diagram. Top: cost timeline — a horizontal timeline with "Entry" on the left ($5 CCTP gas), "Yield accumulating" in the middle (rising line), and "Exit" on the right ($9 Ethereum claim gas + $7.40 opportunity cost during 12-hour wait). The break-even point is marked where the yield line crosses the total round-trip cost line. Bottom: scale comparison table with columns: Principal, APY, Round-trip cost, Break-even days. Three rows: $500 / 18% / $21.40 / 87 days, $10,000 / 18% / $21.40 / 4.3 days, $80,000 / 18% / $21.40 / 0.54 days. Arrow annotation: "At $80,000, break-even is under 13 hours."',
  visualType: 'static',
  visualUrl: 'round-trip-cost-break-even',

  examples: [
    {
      contextTag: '[Small amount, long break-even, strategy uneconomical for short opportunities]',
      context: 'A DeFi user sees a 22% APY USDC opportunity on Starknet. They have $2,000 USDC on Ethereum. Round-trip costs: $5 CCTP entry + $9 Ethereum exit gas + $2.50 opportunity cost during 12-hour withdrawal = $16.50 total.',
      scenario: 'They calculate whether a 30-day position is profitable.',
      outcome: 'Break-even days = $16.50 / ($2,000 × 0.22 / 365) = $16.50 / $1.205 per day = 13.7 days. A 30-day hold is profitable — they earn approximately $36.15 in yield and spend $16.50 in costs for a net $19.65. However, if the APY dropped to 8% after 2 weeks (APY opportunities are variable), break-even at 8% APY on $2,000 = $16.50 / $0.438 per day = 37.7 days. At 8% APY, a 30-day hold would not break even. The user needs to factor in APY stability when calculating whether the move is worth it.',
    },
    {
      contextTag: '[Large amount, sub-day break-even, strategy clearly viable]',
      context: 'A DeFi fund manager identifies a 15% APY on USDC on Starknet versus 6% on Ethereum. They want to move $80,000 for at least 90 days. Round-trip costs: $5 CCTP entry + $9 Ethereum exit gas + $12 opportunity cost during 12-hour withdrawal = $26 total.',
      scenario: 'They calculate the break-even duration and the net yield advantage over the 90-day period.',
      outcome: 'Break-even days = $26 / ($80,000 × 0.15 / 365) = $26 / $32.88 per day = 0.79 days (about 19 hours). The strategy breaks even in under one day. Over 90 days: Starknet yield = $80,000 × 0.15 × (90/365) = $2,959. Ethereum yield foregone = $80,000 × 0.06 × (90/365) = $1,184. Net yield advantage = $2,959 − $1,184 − $26 costs = $1,749 net gain from moving. With a sub-day break-even and 90-day hold, the strategy is strongly justified.',
    },
    {
      contextTag: '[Comparing two cross-chain opportunities, net yield calculation, selecting the better move]',
      context: 'You hold $40,000 USDC on Ethereum and are evaluating two Starknet opportunities. Opportunity A: 14% APY on Vesu USDC, expected duration 45 days, round-trip cost $22. Opportunity B: 28% APY on an Ekubo stablecoin LP, expected duration 20 days, round-trip cost $22 (same bridge path).',
      scenario: 'You calculate the net yield for each opportunity after round-trip costs.',
      outcome: 'Opportunity A: yield = $40,000 × 0.14 × (45/365) = $690. Net = $690 − $22 = $668. Break-even = $22 / ($40,000 × 0.14 / 365) = $22 / $15.34 = 1.43 days. Opportunity B: yield = $40,000 × 0.28 × (20/365) = $613. Net = $613 − $22 = $591. Break-even = $22 / ($40,000 × 0.28 / 365) = $22 / $30.68 = 0.72 days. Opportunity A generates more net yield ($668 vs $591) despite lower APY, because it runs longer. Opportunity B breaks even faster but earns less in absolute terms over its shorter window. Round-trip costs are the same for both, so the better move depends on expected duration, not APY alone.',
    },
  ],

  keyTakeaway: 'Every cross-chain capital movement has a break-even duration — the minimum hold period where accumulated yield exceeds round-trip costs — and strategies with small principals or short durations often fail this test regardless of APY.',

  guidedPractice: [
    {
      question: 'Which costs belong in a complete round-trip calculation for a Starknet yield strategy?',
      options: [
        'A. Only the bridge fee on the way in',
        'B. Entry bridge gas, exit bridge gas, and the opportunity cost of capital idle during the Starkgate withdrawal wait',
        'C. Only the yield foregone on Ethereum while capital is on Starknet',
        'D. Entry bridge gas only — withdrawals are free on Starknet',
      ],
      correct: 1,
      hint: 'A round trip means going there and coming back. What costs occur at each stage including during the wait?',
      explanation: 'B is correct. A complete round-trip calculation includes every cost across the full journey: entry bridge gas (to get onto Starknet), exit bridge gas (to withdraw back to Ethereum), and the opportunity cost of the 12-hour Starkgate withdrawal window during which capital is idle and not earning yield. Starknet transactions are near-zero in fee, but the Ethereum gas to claim the L1 withdrawal is a real cost. Omitting any of these gives an inflated view of strategy profitability.',
    },
    {
      question: '$15,000 USDC at 20% APY on Starknet. Round-trip costs total $18. What is the break-even duration in days?',
      options: [
        'A. 18 days',
        'B. 2.19 days — calculated as $18 / ($15,000 × 0.20 / 365)',
        'C. 0.5 days — at 20% APY all costs are covered quickly',
        'D. 90 days — yield strategies require at least 3 months to break even',
      ],
      correct: 1,
      hint: 'Break-even = round-trip cost / (principal × APY / 365). Apply the formula with these numbers.',
      explanation: 'B is correct. Daily yield = $15,000 × 0.20 / 365 = $8.22 per day. Break-even = $18 / $8.22 = 2.19 days. After just over 2 days, the accumulated yield exceeds the round-trip cost and the strategy is profitable. At this scale, a 30-day hold produces $15,000 × 0.20 × (30/365) = $246 in yield against $18 in costs — a comfortable margin.',
    },
    {
      question: 'At $600 principal, 18% APY, and $20 round-trip costs, what is the break-even duration?',
      options: [
        'A. 2.4 days — same calculation as always',
        'B. 121 days — $20 / ($600 × 0.18 / 365) = $20 / $0.296 = 67.6 days',
        'C. 68 days — $20 / ($600 × 0.18 / 365) = $20 / $0.296 = 67.6 days',
        'D. 14 days — round-trip costs are always covered within two weeks',
      ],
      correct: 2,
      hint: 'Apply the formula: $20 / ($600 × 0.18 / 365). Calculate the daily yield first.',
      explanation: 'C is correct. Daily yield = $600 × 0.18 / 365 = $0.296 per day. Break-even = $20 / $0.296 = 67.6 days. At $600, this strategy requires a 68-day hold just to cover costs — before earning any net profit. If the opportunity is available for only 30 days, the strategy loses money despite positive APY. This illustrates why small principals make cross-chain yield farming economically unviable for most opportunities.',
    },
    {
      question: 'Two yield opportunities both have 25% APY and the same round-trip costs of $25. Position A: $50,000 principal, 14-day expected duration. Position B: $5,000 principal, 60-day expected duration. Which is more likely to be profitable after costs?',
      options: [
        'A. Position B — a longer hold always produces more yield',
        'B. Position A — larger principal generates more yield per day, reaching break-even faster and accumulating more yield over 14 days',
        'C. Both are equally profitable — same APY and same costs',
        'D. Neither — 25% APY is not enough to cover $25 in costs',
      ],
      correct: 1,
      hint: 'Calculate the daily yield for each position. Which one exceeds the $25 cost faster?',
      explanation: 'B is correct. Position A daily yield = $50,000 × 0.25 / 365 = $34.25. Break-even = $25 / $34.25 = 0.73 days. Over 14 days: $479.45 yield − $25 costs = $454.45 net. Position B daily yield = $5,000 × 0.25 / 365 = $3.42. Break-even = $25 / $3.42 = 7.3 days. Over 60 days: $205.48 yield − $25 costs = $180.48 net. Position A is more profitable in absolute terms even over the shorter hold, because the principal drives daily yield far above the fixed cost. Position B breaks even too slowly for short opportunities.',
    },
    {
      question: 'A Starknet opportunity offers 12% APY. Your Ethereum alternative offers 7% APY. You plan to move $60,000 for 75 days. Round-trip costs: $24. What is the net advantage of moving to Starknet versus staying on Ethereum?',
      options: [
        'A. $60,000 × 0.12 × (75/365) − $24 = $1,476 − $24 = $1,452 (gross Starknet yield minus costs only)',
        'B. ($60,000 × (0.12 − 0.07) × (75/365)) − $24 = $616 − $24 = $592 net advantage (yield differential minus costs)',
        'C. $60,000 × 0.05 × (75/365) = $616 — costs do not apply here',
        'D. The move is not worth it — 12% and 7% are too close together',
      ],
      correct: 1,
      hint: 'You are not giving up zero by moving — you are giving up 7% on Ethereum. The net advantage is the yield differential, not the gross Starknet yield.',
      explanation: 'B is correct. The correct frame is: what do you gain by moving? You gain (12% − 7%) = 5% APY differential on $60,000 for 75 days. Yield differential = $60,000 × 0.05 × (75/365) = $616. Subtract round-trip costs: $616 − $24 = $592 net advantage. Option A looks at gross Starknet yield but ignores the 7% you would have earned staying on Ethereum — overstating the advantage by $863. The correct measure is always the yield differential minus costs.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A DeFi aggregator shows three Starknet USDC opportunities: (1) Vesu supply, 11% APY, estimated duration stable (months). (2) Ekubo USDC/USDT LP, 19% APY, estimated duration 30 days (high volatility of opportunity). (3) New protocol launch yield boost, 45% APY, estimated duration 7 days. You hold $25,000 USDC on Ethereum. Round-trip costs for all three: $22. Your Ethereum alternative: 6% APY on Aave. For each opportunity, calculate the break-even duration and the net advantage over the estimated duration. Determine which, if any, are worth executing.',
      scoringCriteria: [
        'Opportunity 1 Vesu: daily yield differential = $25,000 × (0.11 − 0.06) / 365 = $3.42. Break-even = $22 / $3.42 = 6.4 days. Over a stable multi-month hold, clear advantage. Worth executing.',
        'Opportunity 2 Ekubo LP: daily yield differential = $25,000 × (0.19 − 0.06) / 365 = $8.90. Break-even = $22 / $8.90 = 2.5 days. Over 30 days: $267 yield advantage − $22 costs = $245 net. Worth executing if APY holds.',
        'Opportunity 3 Launch boost: daily yield differential = $25,000 × (0.45 − 0.06) / 365 = $26.71. Break-even = $22 / $26.71 = 0.82 days. Over 7 days: $186.97 − $22 = $164.97 net. Worth executing but requires high APY to sustain for the full 7 days — yield boost duration risk is high.',
        'Correct conclusion: all three pass the break-even test at $25,000, but APY stability risk escalates from Opportunity 1 to 3. Size and certainty are inversely related here.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You are evaluating whether to move $8,000 USDC from Ethereum (earning 5% APY on Aave) to Starknet for a yield strategy. You identify two options: (A) 22% APY on a new protocol, expected to last 21 days. (B) 10% APY on Vesu, stable indefinitely. Round-trip costs for each: $20. Calculate break-even for both. Identify which is viable and which is not at this principal size, and explain the specific failure condition for the unviable one.',
      scoringCriteria: [
        'Option A: daily yield differential = $8,000 × (0.22 − 0.05) / 365 = $3.73. Break-even = $20 / $3.73 = 5.4 days. Over 21 days: $78.33 − $20 = $58.33 net. Viable — break-even well within duration.',
        'Option B: daily yield differential = $8,000 × (0.10 − 0.05) / 365 = $1.10. Break-even = $20 / $1.10 = 18.2 days. Technically viable at 30+ days — but the margin is very thin.',
        'Failure condition for Option B at short durations: if the strategy is disrupted or APY changes within the first 18 days, costs are not recovered. At $8,000 and 5% differential, a 2-week disruption produces a net loss despite positive APY.',
        'Correct conclusion: Option A is clearly viable at 21 days. Option B requires a commitment of at least 4+ weeks to meaningfully exceed costs — a reasonable long-term hold but not a short-term play.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi group chat member posts: "I\'m going to bridge $800 USDC to Starknet to farm the new 40% APY launch pool for a week. Free money!" You want to reply constructively. Write a 3-sentence response that calculates their actual break-even, shows the net result over 7 days, and explains the structural reason small principals make cross-chain farming uneconomical.',
      scoringCriteria: [
        'Break-even calculation shown: daily yield = $800 × 0.40 / 365 = $0.876. Break-even = $20 (assumed round-trip cost) / $0.876 = 22.8 days. Over 7 days: $6.13 yield − $20 costs = −$13.87 net loss.',
        'Clearly states the 7-day hold is a net loss — the 40% APY cannot cover $20 in round-trip costs on an $800 principal in one week',
        'Explains the structural reason: round-trip costs are roughly fixed regardless of principal size. At small principals, those fixed costs consume many days of yield. Scale is the primary determinant of whether cross-chain farming makes sense.',
        'Response is constructive — acknowledges the APY is real but frames the cost correctly without being dismissive',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Multi-Chain Portfolio Management
// Dominant concept: a multi-chain portfolio requires tracking
// bridge risk per position, chain-specific settlement finality,
// and cross-chain rebalancing overhead as distinct dimensions
// that single-chain accounting does not capture.
// ─────────────────────────────────────────────────────────────
{
  id: 'multi-chain-portfolio-management',
  title: 'Multi-Chain Portfolio Management: Three Dimensions Single-Chain Ignores',

  explanation: `
You have $200,000 deployed across three chains. Ethereum: $80,000 in an Aave USDC supply position — the largest Ethereum lending protocol. Starknet: $70,000 in an Ekubo LP position from Lab 7. Solana: $50,000 in Marinade liquid staking — a Solana liquid staking protocol that issues mSOL. On a standard portfolio dashboard, these three positions each show a value and a yield. Everything looks independent. But they are not.

The Ekubo LP position exists on Starknet because $70,000 in ETH was bridged via Starkgate. That ETH is locked in Starkgate's contract on Ethereum. Your Starknet position carries Starkgate's contract risk as an ongoing exposure — not just on the day you bridged, but for the entire duration you hold the position. If Starkgate were exploited today, your Ekubo LP position would be at risk even though you are not actively using the bridge. This is called bridge risk exposure: the risk embedded in a position that originated from a bridge deposit, which remains active until the position is closed and funds are withdrawn back to the origin chain.

Chain-specific settlement finality determines how quickly your capital is truly accessible. Starknet has two layers of finality: L2 finality — when your transaction is included in a Starknet block, approximately 30 seconds — and L1 finality — when a STARK proof settling that block is accepted by Ethereum, up to 12 hours. Your Starknet position is "safe" at L2 finality but not fully settled on Ethereum until L1 finality. Solana achieves finality in under a second. Ethereum mainnet reaches probabilistic finality in approximately 15 minutes. These different timelines affect how quickly you can respond to an urgent exit: a Solana position can be liquidated and bridged within minutes; a Starknet position takes up to 12 hours to reach Ethereum.

The third dimension is rebalancing overhead: the full cost and time to move capital from one chain to another. From Lab 4's round-trip calculation, you know every rebalancing event has a fixed cost floor. A multi-chain portfolio rebalances only when the yield differential between chains exceeds that cost floor over the planned rebalancing period. This is the rebalancing threshold: yield_differential × principal × (rebalancing_period / 365) > rebalancing_cost. A 4% APY differential on $40,000 over 30 days = $131. If round-trip costs are $22, the rebalance is justified. A 0.5% differential on $10,000 over 7 days = $9.59, which is below the $22 cost floor — that rebalance is not justified.

Managing a multi-chain portfolio means maintaining a position register that tracks all three dimensions for each position: which bridge it came through, what that bridge's current risk status is, which chain it is on and what the settlement finality timeline is, and whether the current yield differential justifies rebalancing overhead.
  `.trim(),

  visualPrompt: 'Three-panel dashboard mockup. Panel 1 "Bridge Risk Register": table with columns Position, Bridge Used, Bridge TVL, Days Since Audit, Risk Level. Three rows: Ekubo LP ($70K) / Starkgate / $1.9B / 4 mo / Low. Marinade ($50K) / Hyperlane CCTP / $48M / 6 mo / Medium. Aave ($80K) / Direct (no bridge) / — / — / None. Panel 2 "Settlement Finality": chain comparison — Ethereum 15 min, Starknet L2 30s / L1 12hr, Solana <1s. Panel 3 "Rebalancing Threshold": formula diagram showing yield_differential × principal × (days/365) > round_trip_cost, with a worked example showing a justified rebalance versus an unjustified one.',
  visualType: 'static',
  visualUrl: 'multi-chain-portfolio-three-dimensions',

  examples: [
    {
      contextTag: '[Bridge risk exposure tracking, ongoing risk after bridge deposit]',
      context: 'A portfolio manager bridged $90,000 ETH to Starknet via Starkgate eight months ago to fund an Ekubo LP position. The position has been running since. They receive an alert that a Starkgate security audit has flagged a low-severity issue in a new contract update.',
      scenario: 'They review their multi-chain position register and assess whether the bridge risk flag changes their exit decision.',
      outcome: 'The $90,000 Ekubo LP position carries ongoing Starkgate exposure — the ETH is still locked in Starkgate\'s contract until they withdraw. A low-severity finding from an audit does not automatically trigger an exit, but it changes their risk register from "low" to "elevated — monitor." They document the audit finding, note the next patch date, and set an alert for the severity status. If upgraded to medium or high severity, their protocol: exit within 48 hours and bridge back via Starkgate while the exploit window is still theoretical rather than active. Tracking bridge risk as an ongoing exposure — not just a one-time entry event — is what enables this response.',
    },
    {
      contextTag: '[Settlement finality difference, Solana vs Starknet exit speed comparison]',
      context: 'A cross-chain portfolio manager holds $60,000 in a Solana DeFi position and $60,000 in a Starknet DeFi position. An unexpected macro event causes them to want to exit both positions and move all capital to Ethereum USDC within 2 hours.',
      scenario: 'They assess whether either or both positions can be exited and settled to Ethereum within the 2-hour window.',
      outcome: 'Solana position: exit DeFi protocol (< 1 second), bridge to Ethereum via Wormhole (~18 minutes). Capital on Ethereum within 20 minutes. Well inside the 2-hour window. Starknet position: exit DeFi protocol (L2 finality ~30 seconds), initiate Starkgate withdrawal. L1 finality: up to 12 hours. The Starknet position cannot reach Ethereum within 2 hours via Starkgate. Options: (1) Accept that the Starknet capital remains on Starknet during the crisis window. (2) Use a third-party bridge for faster exit, accepting the added trust during a period when using less-secure bridges is generally more risky. Neither option is clean — this is the settlement finality risk that must be planned for before deploying capital on Starknet.',
    },
    {
      contextTag: '[Rebalancing threshold calculation, yield differential versus overhead cost]',
      context: 'A DeFi investor holds $45,000 USDC on Ethereum at 6% APY. They observe a Starknet opportunity at 13% APY. They plan to evaluate whether rebalancing monthly (30-day cycles) makes sense.',
      scenario: 'They apply the rebalancing threshold formula: yield_differential × principal × (days/365) > round_trip_cost.',
      outcome: 'Yield differential = 13% − 6% = 7%. Monthly yield gain = $45,000 × 0.07 × (30/365) = $258. Round-trip cost = $22. $258 >> $22 — the monthly rebalance is justified by a factor of 11×. The investor moves the capital to Starknet. Quarterly review: if the Starknet APY falls to 7% (1% differential), monthly gain = $45,000 × 0.01 × (30/365) = $37. Still above $22 but by a much smaller margin. At 6.5% on Starknet (0.5% differential): monthly gain = $18.49 < $22 cost. At that point, rebalancing overhead exceeds the differential — they stop chasing and let the position run until the spread widens again.',
    },
  ],

  keyTakeaway: 'A multi-chain portfolio must track bridge risk exposure per position, settlement finality per chain, and rebalancing overhead — three dimensions that single-chain portfolio accounting does not capture and that determine your real ability to exit, respond, and rebalance.',

  guidedPractice: [
    {
      question: 'You bridged $50,000 ETH to Starknet six months ago to fund an Ekubo position. You hear a Starkgate vulnerability has been reported. Does your Ekubo position carry ongoing Starkgate risk?',
      options: [
        'A. No — you used the bridge six months ago; bridge risk only applies during the active transfer',
        'B. Yes — the $50,000 ETH remains locked in Starkgate\'s contract on Ethereum until you withdraw, so Starkgate contract risk is a continuous exposure for the duration of your Starknet position',
        'C. No — the ETH is on Starknet now, not on Ethereum',
        'D. Only if you plan to withdraw within the next 7 days',
      ],
      correct: 1,
      hint: 'In lock-and-mint bridging, where is your ETH actually held while your position is open on Starknet?',
      explanation: 'B is correct. Lock-and-mint means your ETH is locked in Starkgate\'s contract on Ethereum for as long as you hold the Starknet position. The bridge risk does not end on the day you deposited — it remains active until you withdraw and the locked ETH is returned. A Starkgate vulnerability reported today affects every holder of Starkgate-issued wETH on Starknet, regardless of when they deposited.',
    },
    {
      question: 'You need to move $80,000 from Starknet back to Ethereum in under 3 hours due to an emergency. What is the constraint?',
      options: [
        'A. No constraint — Starknet withdrawals via Starkgate take approximately 30 minutes',
        'B. Starkgate withdrawals require up to 12 hours for L1 finality — the capital cannot reach Ethereum within 3 hours via the canonical path',
        'C. The constraint is Ethereum gas prices — high gas may delay the withdrawal',
        'D. Starknet L2 finality is 30 seconds so capital is accessible immediately',
      ],
      correct: 1,
      hint: 'Distinguish L2 finality (when the transaction is confirmed on Starknet) from L1 finality (when the STARK proof is accepted by Ethereum). Which is needed to move funds back to Ethereum?',
      explanation: 'B is correct. L2 finality on Starknet is approximately 30 seconds — your transaction is confirmed on the Starknet chain quickly. But withdrawals to Ethereum require L1 finality: a STARK proof must be generated and submitted to Ethereum\'s L1 verifier, which takes up to 12 hours. Your capital is accessible on Starknet in seconds but cannot clear to Ethereum inside a 3-hour window via the canonical path.',
    },
    {
      question: 'Yield on Starknet: 9% APY. Yield on Ethereum: 6% APY. Principal: $20,000. Rebalancing period: 30 days. Round-trip cost: $22. Should you rebalance?',
      options: [
        'A. Yes — any positive yield differential justifies rebalancing',
        'B. No — 3% differential is too small to matter',
        'C. Yes — yield_differential gain over 30 days = $20,000 × 0.03 × (30/365) = $49.32 > $22 cost',
        'D. No — $20,000 × 0.03 × (30/365) = $49.32 < $22 cost',
      ],
      correct: 2,
      hint: 'Apply the threshold formula: yield_differential × principal × (rebalancing_period / 365). Compare the result to the round-trip cost.',
      explanation: 'C is correct. The 30-day yield advantage from rebalancing = $20,000 × 0.03 × (30/365) = $49.32. This exceeds the $22 round-trip cost by $27.32. The rebalance is justified. Option A is wrong — a positive differential does not automatically justify rebalancing; the gain must exceed the cost. Option B ignores the calculation entirely.',
    },
    {
      question: 'Which of the following changes would make a monthly rebalance go from justified to unjustified, all else being equal?',
      options: [
        'A. The yield differential widens from 3% to 5%',
        'B. The principal increases from $20,000 to $60,000',
        'C. The yield differential narrows from 3% to 0.8% while round-trip costs remain $22 on a $20,000 position',
        'D. The rebalancing period extends from 30 to 60 days',
      ],
      correct: 2,
      hint: 'The rebalance is justified when yield gain exceeds costs. Which change makes the yield gain fall below the cost floor?',
      explanation: 'C is correct. At 0.8% differential: $20,000 × 0.008 × (30/365) = $13.15 < $22 cost. The rebalance becomes unjustified. Option A widens the differential, making the rebalance more justified. Option B increases principal, increasing the yield gain. Option D extends the hold period, increasing total yield and actually making a 60-day rebalance more justified than a 30-day one.',
    },
    {
      question: 'You hold the following multi-chain positions: $70,000 on Starknet via Starkgate (L1 finality 12 hrs), $50,000 on Solana via Hyperlane CCTP, $40,000 on Ethereum directly (no bridge). A critical vulnerability is disclosed for Starkgate. In what order should you prioritise exits, and what exit timeline does each chain allow?',
      options: [
        'A. Exit Ethereum first — it\'s on the most secure chain',
        'B. Exit Solana first — fastest finality means you can act there immediately while initiating the slower Starkgate exit simultaneously',
        'C. Exit Starkgate position first by initiating withdrawal immediately, simultaneously exit Solana within minutes — prioritise by urgency and feasibility',
        'D. Hold all positions — cross-chain exits during a vulnerability disclosure are always higher risk than staying put',
      ],
      correct: 2,
      hint: 'Starkgate exit takes up to 12 hours. Solana exit takes minutes. Ethereum position carries no bridge risk and is not under threat. What is the time-critical action?',
      explanation: 'C is correct. The Starkgate vulnerability is the active risk — initiate the Starkgate withdrawal immediately because it takes up to 12 hours and the clock needs to start now. Simultaneously, the Solana position can be exited rapidly (Solana finality <1 second, Hyperlane CCTP ~8 minutes). The Ethereum Aave position carries no bridge risk and is not threatened by a Starkgate disclosure — it can remain. Acting on the longest-lead-time exit first while running shorter exits in parallel is the correct multi-chain emergency protocol.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'Your multi-chain portfolio: (A) $85,000 ETH on Starknet in Ekubo LP via Starkgate — bridge last audited 4 months ago, TVL $1.9B, no exploits. (B) $40,000 USDC on Solana in Marinade via Hyperlane CCTP — bridge audited 6 months ago, TVL $48M, no exploits. (C) $55,000 USDC on Ethereum in Aave — no bridge. Produce a bridge risk register for each position. Rate each Low/Medium/High, identify the specific risk for each, and state the conditions that would trigger an exit for each.',
      scoringCriteria: [
        'Position A (Starkgate): Low risk rating. Risk: Starkgate contract holds $85,000 ETH — exploit would invalidate Starknet wETH. Trigger: audit finding rated medium or above, bridge TVL drop >40% in 24 hours, or public disclosure of active exploit.',
        'Position B (Hyperlane CCTP): Low-medium risk rating. Risk: Hyperlane message routing + CCTP; USDC burn-and-mint means locked-collateral risk is minimal; primary risk is Hyperlane validator compromise affecting message routing. Trigger: Hyperlane validator compromise disclosed, or CCTP/Circle operational issue.',
        'Position C (Aave direct): No bridge risk. Protocol risk only. Trigger: Aave-specific vulnerability, not bridge-related.',
        'Bridge risk register is structured as a table with Position, Bridge, Risk Level, Specific Risk, Exit Trigger columns.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Your multi-chain portfolio dashboard shows: Starknet Ekubo LP yield: 16% APY, $65,000 deployed. Ethereum Aave yield: 7% APY. Solana Marinade yield: 8% APY. Rebalancing cost (any cross-chain move): $25. You are reviewing monthly. Evaluate: (1) Is it worth moving any Ethereum capital to Starknet? (2) Is it worth moving any Solana capital to Starknet? (3) At what principal size does a monthly Solana→Starknet move become unjustified?',
      scoringCriteria: [
        'Ethereum→Starknet: differential = 16% − 7% = 9%. At $40,000 for 30 days: $40,000 × 0.09 × (30/365) = $295.89 >> $25. Worth moving.',
        'Solana→Starknet: differential = 16% − 8% = 8%. At $30,000 for 30 days: $30,000 × 0.08 × (30/365) = $197.26 >> $25. Worth moving.',
        'Break-even principal for Solana→Starknet monthly: $25 = P × 0.08 × (30/365). P = $25 / 0.00657 = $3,806. Below approximately $3,800 principal, a monthly Solana→Starknet move at 8% differential does not break even on round-trip costs.',
        'Additional consideration: Hyperlane bridge costs for Solana→Starknet may differ from Starkgate costs — should be included in the $25 estimate.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A portfolio manager at a DeFi fund says: "We track our positions by protocol and yield. Chain doesn\'t matter as long as the numbers look right." Write a 4-sentence response explaining the three dimensions that multi-chain portfolios require beyond protocol and yield tracking, with a specific consequence of omitting each one.',
      scoringCriteria: [
        'Bridge risk exposure: omitting this means not knowing that a position on Starknet carries ongoing Starkgate contract risk — a vulnerability disclosure would catch the fund off-guard with no pre-planned exit trigger',
        'Settlement finality: omitting this means assuming all positions can be exited on the same timeline — a Starknet position cannot reach Ethereum in under 12 hours, which can be catastrophic in a rapid exit scenario',
        'Rebalancing overhead: omitting this means rebalancing decisions are made on APY alone without knowing whether the yield differential covers the round-trip cost — leading to rebalances that cost more than they earn',
        'Response is directed at the PM\'s frame ("numbers look right") and explains why the missing dimensions are invisible in standard yield reporting but create real operational and financial risk',
      ],
    },
  ],
},

];  // end LAB8_LESSONS_4_TO_5


// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMULATIONS — Lab Level (15 total)
// Placed AFTER all lessons, BEFORE bossMode.
// Draws randomly — learner does not know which lesson is tested.
// ─────────────────────────────────────────────────────────────

export const LAB8_AGGREGATE_SIMULATIONS = {
  count: 15,
  simulatorTypes: [
    'judgment-riskAssess',
    'judgment-dataInterpret',
    'judgment-communication',
  ],
  drawPerSession: 5,
  scenarios: [
    // — From Lesson 1: Bridge Mechanics —
    {
      type: 'judgment-riskAssess',
      scenario: 'A bridge holds $400M in locked ETH across 12,000 user positions. An audit published yesterday found a low-severity integer overflow in the withdrawal contract. You have $60,000 bridged. Assess whether to exit immediately or monitor.',
      scoringCriteria: [
        'Identifies that lock-and-mint means all $400M locked ETH is at risk if exploited',
        'Correctly categorises low-severity as monitor rather than immediate exit for most positions',
        'States specific trigger for upgrade to exit: severity reclassification or evidence of active probing',
        'Calculates personal exposure: $60,000 at risk from the vulnerability, not just a portion',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A bridge security dashboard shows: total locked TVL $900M, 5-of-9 multisig validator set, last exploit attempt 14 months ago (blocked), audit completed 2 months ago, daily bridge volume $45M. You are about to bridge $200,000. Interpret each data point and rate overall suitability.',
      scoringCriteria: [
        '$900M TVL: large target but market has validated this bridge with real capital for sustained period',
        '5-of-9 multisig: 5 validators must be compromised — concrete but non-trivial attack requirement',
        '2-month audit: recent, acceptable recency',
        '$45M daily: active bridge with meaningful transaction history',
        'Overall: suitable for $200,000 with bridge risk documented in position register; not canonical-grade but reasonable',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A team lead asks why you recommend CCTP for USDC instead of the faster third-party bridge that the rest of the team uses. Explain in 3 sentences.',
      scoringCriteria: [
        'Explains burn-and-mint: USDC is destroyed on source, Circle attests, native USDC minted on destination — no locked pool to exploit',
        'Contrasts with lock-and-mint: third-party bridge locks USDC on source chain; if the bridge contract is exploited, locked USDC is drained and Starknet tokens become worthless',
        'States the trade-off honestly: CCTP is USDC-only; for other tokens the lock-and-mint comparison with Starkgate is the relevant decision',
      ],
    },
    // — From Lesson 2: ETH to Starknet —
    {
      type: 'judgment-riskAssess',
      scenario: 'You must bridge $150,000 ETH to Starknet today. Option A: Starkgate, ~$10 gas. Option B: third-party bridge, 6-of-9 multisig, 0.04% fee, 5-minute deposit and withdrawal. You plan to hold for 4 months. Produce a written risk recommendation.',
      scoringCriteria: [
        'Starkgate trust model stated: STARK proof, no added trust',
        'Third-party cost calculated: $150,000 × 0.04% = $60 plus gas',
        'Recommendation: Starkgate. $50 fee saving does not justify adding a 6-of-9 multisig trust assumption on a $150,000 position held 4 months',
        'Notes withdrawal speed difference is irrelevant for a planned 4-month hold',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'You are bridging $5,000 ETH to Starknet. Ethereum gas is spiking at $18 per transaction (3× normal). Orbiter total fee at current gas: $3.20. Should you use Starkgate or Orbiter at this gas level? Calculate the break-even scale at $18 gas.',
      scoringCriteria: [
        'Starkgate cost at $18 gas: $18. Orbiter: $3.20. Difference: $14.80.',
        '$5,000 transfer: Starkgate cost = 0.36% of amount. Orbiter = 0.064%. At spiked gas, Orbiter is significantly more economical for small amounts.',
        'Break-even scale: where Starkgate gas ($18) equals Orbiter fees. Orbiter = $1.50 + 0.06% × P = $18. 0.06% × P = $16.50. P = $27,500. Above $27,500, Starkgate becomes preferable even at spiked gas.',
        'Recommendation: Orbiter at $5,000 when gas is $18. Starkgate for amounts above ~$27,500.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A user wants to bridge $200,000 USDC to Starknet and asks: "Should I use CCTP or Starkgate? Starkgate supports USDC and seems simpler." Respond in 3 sentences.',
      scoringCriteria: [
        'Correctly explains Starkgate USDC risk: lock-and-mint produces bridged USDC — a representation backed by locked Ethereum USDC; if Starkgate is exploited, representation loses value',
        'Correctly explains CCTP advantage: USDC is burned, Circle attests, native USDC minted — no locked collateral risk, same native token as Circle-issued USDC anywhere',
        'Recommendation: CCTP for USDC at $200,000. Both options work; CCTP is strictly safer. Starkgate is appropriate for non-USDC assets where CCTP is not available.',
      ],
    },
    // — From Lesson 3: Solana to Starknet —
    {
      type: 'judgment-riskAssess',
      scenario: 'You are bridging $55,000 wSOL from Solana to Starknet for a 3-month LP position. Direct Hyperlane: 5-of-8 multisig, $27.50 fee, 9 min. Via Wormhole→Starkgate: $21 total, 24 min. Produce a written risk assessment and recommendation.',
      scoringCriteria: [
        'Hyperlane trust model: 5-of-8 — 5 validators must be compromised',
        'Wormhole+Starkgate trust model: Wormhole guardian set + Starkgate STARK proof on final Starknet leg',
        'Cost comparison: Hyperlane $27.50 vs Path B $21. Path B is $6.50 cheaper AND has stronger security on the final leg.',
        'Recommendation: Path B. Cheaper and more secure. Direct Hyperlane only advantageous at smaller amounts where Path B fees are proportionally larger.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Hyperlane dashboard: all-time volume $62M, daily $410K, 0 exploits, 7-of-10 validator threshold, audit 5 months ago. You are considering bridging $18,000 USDC via the CCTP integration path. Interpret each data point and determine suitability.',
      scoringCriteria: [
        'Volume: $62M all-time, $410K daily — active but smaller than major bridges',
        'USDC CCTP integration: Hyperlane validators not the security bottleneck for USDC — Circle attestation is. Bridge TVL and validator data is secondary for this specific transfer.',
        '7-of-10 threshold: stronger than 5-of-8; 7 validators must be compromised',
        '5-month audit: acceptable recency',
        'Conclusion: $18,000 USDC via CCTP integration is appropriate. Circle\'s attestation model applies regardless of Hyperlane\'s scale.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain to a Solana-native user in 3 sentences: why Starkgate doesn\'t work for their SOL, what Hyperlane is and how it works, and which path is better for USDC versus wSOL at $50,000.',
      scoringCriteria: [
        'Starkgate explanation: canonical Ethereum↔Starknet bridge only; Solana is a separate L1 outside Starknet\'s validity proof system',
        'Hyperlane explanation: permissionless interoperability protocol; validators attest to cross-chain messages; message passes from Solana to Starknet when threshold of validators sign off',
        'Path recommendation: USDC at $50,000 via Hyperlane CCTP (burn-and-mint, Circle attestation). wSOL at $50,000: consider Wormhole→Ethereum→Starkgate intermediate hop for Starkgate\'s STARK proof on the Starknet final leg.',
      ],
    },
    // — From Lesson 4: Round-Trip Costs —
    {
      type: 'judgment-dataInterpret',
      scenario: 'Three yield opportunities on Starknet: (A) 16% APY, stable indefinitely. (B) 24% APY, estimated 14 days. (C) 40% APY, estimated 5 days. You have $12,000 USDC on Ethereum. Round-trip costs: $20. Ethereum alternative: 5% APY. Calculate net advantage for each and rank by viability.',
      scoringCriteria: [
        'A: daily diff = $12,000 × 0.11 / 365 = $3.62. Break-even = $20 / $3.62 = 5.5 days. Over stable hold: clearly viable.',
        'B: daily diff = $12,000 × 0.19 / 365 = $6.25. Break-even = $20 / $6.25 = 3.2 days. Over 14 days: $87.49 − $20 = $67.49. Viable.',
        'C: daily diff = $12,000 × 0.35 / 365 = $11.51. Break-even = $20 / $11.51 = 1.74 days. Over 5 days: $57.53 − $20 = $37.53. Viable but tight duration risk.',
        'Rank: A (most reliable long-term), B (strong short-term), C (viable but duration risk highest). All pass break-even test at $12,000.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi investor is considering moving $3,000 USDC to Starknet for a 10% APY opportunity that is expected to last 21 days. Ethereum alternative: 5% APY. Round-trip costs: $22. Calculate break-even, calculate net advantage over 21 days, and assess whether the strategy is viable.',
      scoringCriteria: [
        'Daily yield differential: $3,000 × 0.05 / 365 = $0.411 per day',
        'Break-even: $22 / $0.411 = 53.5 days — longer than the expected duration of 21 days',
        'Net result over 21 days: $0.411 × 21 = $8.63 yield gain minus $22 costs = −$13.37 net loss',
        'Assessment: strategy is not viable at $3,000 principal for a 21-day opportunity at 5% differential. Minimum viable principal at these parameters: $22 / (0.05 × 21/365) = $7,660.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi user posts: "I found a 35% APY pool on Starknet. I\'m going to bridge my $1,200 for 2 weeks." Respond in 3 sentences explaining the break-even calculation and whether the strategy makes financial sense.',
      scoringCriteria: [
        'Break-even calculation shown: daily yield = $1,200 × 0.35 / 365 = $1.15. Break-even = $20 (assumed costs) / $1.15 = 17.4 days. Longer than the planned 2-week hold.',
        'Net result over 14 days: $1.15 × 14 = $16.10 minus $20 costs = −$3.90 net loss. The 35% APY is real but the position is too small for the hold period.',
        'States the fix: at $1,200, the user would need to hold approximately 18+ days to break even, or increase their principal above ~$3,500 for a 2-week break-even at these costs.',
      ],
    },
    // — From Lesson 5: Multi-Chain Portfolio —
    {
      type: 'judgment-riskAssess',
      scenario: 'Portfolio: $90,000 in Ekubo LP on Starknet (via Starkgate), $45,000 in Vesu supply on Starknet (via Starkgate), $60,000 in Aave on Ethereum (no bridge). A medium-severity Starkgate vulnerability is disclosed. Assess your exposure, prioritise actions, and state your exit protocol.',
      scoringCriteria: [
        'Both Starknet positions carry Starkgate exposure: $90,000 + $45,000 = $135,000 at risk from Starkgate vulnerability',
        'Aave position has no Starkgate exposure — no action required for that position',
        'Priority: initiate Starkgate withdrawals for both Starknet positions immediately (medium severity warrants exit, not monitor)',
        'Exit protocol: Ekubo LP must be unwound to single asset before withdrawal. Vesu supply must be repaid/withdrawn. Both Starkgate withdrawals initiated simultaneously. 12-hour wait acknowledged.',
        'Post-exit: evaluate Ethereum or alternative non-Starkgate deployment while vulnerability is addressed.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Multi-chain dashboard: Starknet Ekubo LP 14% APY ($50,000). Ethereum Aave 6% APY. Solana Marinade 9% APY ($30,000). Monthly rebalancing review. Evaluate: (1) Should Ethereum capital move to Starknet? (2) Should Solana capital move to Starknet? (3) What is the minimum principal that justifies monthly Solana→Starknet rebalancing at current differentials? Rebalancing cost $22.',
      scoringCriteria: [
        'Ethereum→Starknet: diff 8%. On $40,000 / 30 days: $263 >> $22. Yes, justified.',
        'Solana→Starknet: diff 5%. On $30,000 / 30 days: $123 >> $22. Yes, justified.',
        'Minimum principal for Solana→Starknet monthly: $22 = P × 0.05 × 30/365. P = $22 / 0.00411 = $5,353. Below $5,353, monthly Solana→Starknet rebalancing at 5% differential is unjustified.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain to a DeFi fund manager in 4 sentences why their current position tracker (which only shows asset, protocol, and yield) is incomplete for a multi-chain portfolio, and what three additional fields each position should carry.',
      scoringCriteria: [
        'Missing field 1: bridge used and bridge risk level — the position register must show which bridge holds the locked collateral for each Starknet/Solana position',
        'Missing field 2: settlement finality — each chain has a different exit timeline; a Starknet position cannot reach Ethereum in under 12 hours',
        'Missing field 3: rebalancing threshold — yield differential must be compared against round-trip costs before any capital move is initiated',
        'Explains consequence of each omission: missing bridge risk = blind to an active exploit affecting your position; missing finality = unable to plan emergency exits; missing threshold = rebalancing at a net loss',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// BUILD TASK — Lab 8 (Expanded Choice: 4 options)
// Per Section 20.5 — Intermediate Labs 7–9 range
// ─────────────────────────────────────────────────────────────

export const LAB8_BUILD_TASK = {
  id: 'lab8-build-task',
  title: 'Lab 8 Build Task — Cross-Chain Capital Movement',
  level: 'intermediate',
  progressionModel: 'expanded-choice-4-options',

  prompt: `
You have completed Lab 8. Choose one of the four build tasks below.
Each task is designed to take 1–2 hours and produce a concrete document or analysis.
Your completed artifact will be reviewed as part of the Phase 2 boss.
  `.trim(),

  options: [
    {
      id: 'bt-a',
      title: 'Option A — Bridge Comparison Report',
      description: `
Research and document the current state of bridging from Ethereum to Starknet.
Produce a structured comparison covering Starkgate, CCTP, and one additional third-party bridge of your choice.
For each bridge: mechanism (lock-and-mint or burn-and-mint), current TVL, last audit date, fee structure, supported tokens, deposit and withdrawal speed, and trust model.
Include a "selection guide" section that specifies which bridge to use for: (1) large ETH transfers, (2) USDC transfers of any size, (3) small ETH transfers under $2,000, (4) STRK transfers.
Use current data from bridge dashboards, documentation, and DeFi dashboards. Document every data source.
      `.trim(),
      artifact: 'bridge-comparison-report.md',
      verificationCriteria: [
        'All three bridges documented with current data (dated within 7 days of submission)',
        'Mechanism correctly identified for each bridge (lock-and-mint vs burn-and-mint)',
        'Selection guide covers all four specified scenarios with a specific recommendation and one-sentence rationale for each',
        'Every data point sourced — TVL, audit date, fees all cited with link or timestamp',
      ],
    },
    {
      id: 'bt-b',
      title: 'Option B — Round-Trip Cost Calculator',
      description: `
Build a round-trip cost model in a spreadsheet or document that a DeFi investor can use to evaluate any cross-chain yield strategy.
The model must accept as inputs: principal amount, source chain APY, destination APY, entry bridge cost, exit bridge cost, withdrawal wait time (hours), and strategy duration (days).
The model must output: daily yield differential, total yield advantage over duration, round-trip cost, break-even duration in days, net advantage, and a viability verdict (justified / not justified).
Test your model against three scenarios: $5,000 / 18% Starknet vs 6% Ethereum / 30 days. $40,000 / 12% vs 7% / 60 days. $1,500 / 35% vs 5% / 10 days.
Show all calculations clearly. Write a one-paragraph explanation of how to use the model.
      `.trim(),
      artifact: 'round-trip-cost-model.md or .xlsx',
      verificationCriteria: [
        'Model correctly handles all six inputs',
        'All three test scenarios calculated correctly with working shown',
        '$5,000 scenario: break-even ~4.3 days, 30-day net positive',
        '$40,000 scenario: break-even ~1.35 days, 60-day net clearly positive',
        '$1,500 scenario: break-even ~53 days, 10-day position is a net loss — model correctly flags "not justified"',
        'Explanation paragraph is clear and accurate',
      ],
    },
    {
      id: 'bt-c',
      title: 'Option C — Multi-Chain Position Register',
      description: `
Design and populate a multi-chain position register template that a DeFi fund manager could use to track a portfolio across Ethereum, Starknet, and Solana.
The register must include all required columns: position name, chain, protocol, current value, current APY, bridge used to deposit, bridge risk level (Low/Medium/High with one-sentence rationale), settlement finality (time to reach Ethereum), and last rebalancing review date.
Populate the register with a hypothetical $250,000 portfolio spread across at least 5 positions on at least 2 chains.
Add a "rebalancing decision log" section covering three rebalancing evaluations — one that is justified, one that is not, and one that is borderline — using the threshold formula from Lesson 5.
      `.trim(),
      artifact: 'multi-chain-position-register.md or .xlsx',
      verificationCriteria: [
        'All required columns present and populated for all 5+ positions',
        'Bridge risk level ratings are specific — rationale references TVL, validator threshold, or audit recency, not vague terms',
        'Settlement finality correctly stated per chain — Starknet L2 and L1 finality distinguished',
        'Three rebalancing evaluations use the correct threshold formula and reach the correct verdict for each',
        'Total portfolio value sums to $250,000 across all positions',
      ],
    },
    {
      id: 'bt-d',
      title: 'Option D — Bridge Security Assessment',
      description: `
Produce a security assessment of one bridge currently available for Solana→Starknet transfers.
Your assessment must cover: mechanism (lock-and-mint or burn-and-mint for each supported asset), validator model (who validates, what threshold, how validators are selected), audit history (when, by whom, any findings), TVL history (stable, growing, or declining over 6 months), exploit history, and maximum transfer size you would recommend given your findings.
Use the assessment framework from Lesson 1: for each risk dimension, state the specific risk, rate it, and identify the specific condition that would cause you to stop using this bridge.
Conclude with a one-paragraph recommendation: which asset types and at what maximum amount is this bridge appropriate for single-step Solana→Starknet transfers?
      `.trim(),
      artifact: 'bridge-security-assessment.md',
      verificationCriteria: [
        'All six assessment dimensions covered with specific data, not generic statements',
        'Mechanism correctly identified per asset type (USDC CCTP vs other tokens lock-and-mint)',
        'Validator model specifically described — threshold stated, selection process described',
        'Risk ratings are accompanied by specific observable conditions, not vague qualifiers',
        'Recommendation is specific: names asset types and a maximum dollar amount with rationale',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// BOSS BATTLE — Lab 8
// Phase 1: task pool (15 scenarios, draws 8 per attempt)
// Phase 2: portfolio artifact + portfolio defense from Lab 7
// ─────────────────────────────────────────────────────────────

export const LAB8_BOSS_MODE = {
  id: 'lab8-boss',
  title: 'Boss Battle — Bridging and Cross-Chain Capital Movement',

  phase1: {
    label: 'Phase 1 — Learning Loop',
    hintsEnabled: true,
    portfolioPush: false,
    drawCount: 8,
    taskPool: [
      {
        id: 'tp-01',
        type: 'judgment-riskAssess',
        task: 'A bridge uses a 4-of-7 multisig. How many validators must be compromised to forge a message? Is this appropriate for a $120,000 transfer held 6 months?',
        scoringCriteria: ['States 4 validators needed', 'Assesses 4-of-7 as a relatively low threshold for a large long-term position', 'Recommends Starkgate or higher-threshold bridge for this amount and duration'],
      },
      {
        id: 'tp-02',
        type: 'judgment-dataInterpret',
        task: 'CCTP transfer initiated. Source chain USDC balance: 0. Destination chain USDC balance: 50,000. Where is the locked collateral?',
        scoringCriteria: ['States there is no locked collateral — CCTP burn-and-mint destroys source token', 'Explains destination USDC is native, issued by Circle', 'Distinguishes from lock-and-mint where collateral would remain on source chain'],
      },
      {
        id: 'tp-03',
        type: 'judgment-riskAssess',
        task: 'Bridge TVL drops 60% in 24 hours with no announced reason. You have $80,000 bridged. What does this signal and what action do you take?',
        scoringCriteria: ['Identifies sudden TVL drop as a potential exploit or bank-run signal', 'Recommends immediate exit initiation — ambiguous signal with large position warrants caution', 'Does not overstate certainty — states "possible exploit or panic withdrawal" not "confirmed exploit"'],
      },
      {
        id: 'tp-04',
        type: 'judgment-communication',
        task: 'Explain lock-and-mint bridging to someone who has never used DeFi. Use one concrete risk example. Maximum 3 sentences.',
        scoringCriteria: ['Explains mechanism correctly: lock on source, mint representation on destination', 'Uses the Wormhole example or equivalent concrete exploit as the risk illustration', 'No unexplained jargon — accessible to a non-DeFi reader'],
      },
      {
        id: 'tp-05',
        type: 'judgment-riskAssess',
        task: 'You are moving $70,000 USDC from Ethereum to Starknet for a Vesu supply position. Compare Starkgate lock-and-mint versus CCTP burn-and-mint. Which is strictly better for USDC and why?',
        scoringCriteria: ['Identifies CCTP as strictly better for USDC', 'Explains that CCTP eliminates locked-collateral risk while Starkgate-bridged USDC remains a representation backed by locked collateral', 'States CCTP produces native USDC accepted by Vesu at full value'],
      },
      {
        id: 'tp-06',
        type: 'judgment-dataInterpret',
        task: 'Starkgate dashboard: last proof submitted 7 hours ago, 2,400 ETH in pending withdrawals, current proof generation time: 4–8 hours. You initiated a withdrawal 3 hours ago. When is it likely to complete?',
        scoringCriteria: ['States withdrawal not yet complete — proof generation takes 4–8 hours from proof submission cycle start', 'Estimates likely completion within 1–5 more hours based on current proof cadence', 'No alarm raised — 7 hours since last proof is within normal operating range'],
      },
      {
        id: 'tp-07',
        type: 'judgment-riskAssess',
        task: 'You want to bridge $500 ETH from Solana to Starknet urgently. Direct Hyperlane: $0.25 fee, 9 min. Wormhole + Starkgate: $21 fees, 24 min. Which path is appropriate at this amount?',
        scoringCriteria: ['States direct Hyperlane appropriate at $500 — $21 round-trip cost is 4.2% of the principal, clearly uneconomical', 'Calculates Hyperlane fee: $500 × 0.05% = $0.25 — negligible', 'Notes Ethereum intermediate hop is for large amounts where security premium justifies the cost'],
      },
      {
        id: 'tp-08',
        type: 'judgment-dataInterpret',
        task: '$25,000 principal, 10% APY on Starknet, 4% APY on Ethereum, round-trip costs $20, 45-day hold. Calculate: (1) daily yield differential, (2) total yield advantage, (3) net advantage after costs.',
        scoringCriteria: ['Daily diff: $25,000 × 0.06 / 365 = $4.11', 'Total advantage: $4.11 × 45 = $184.93', 'Net: $184.93 − $20 = $164.93', 'Break-even: $20 / $4.11 = 4.87 days — confirms viability'],
      },
      {
        id: 'tp-09',
        type: 'judgment-communication',
        task: 'A colleague asks: "Why does cross-chain yield farming fail for small amounts?" Explain the break-even mechanism in 2 sentences using specific numbers.',
        scoringCriteria: ['States that round-trip costs are roughly fixed regardless of principal size', 'Uses a specific example: e.g. $1,000 at 20% APY = $0.548/day — break-even at $20 costs = 36.5 days', 'Makes the structural point clear: fixed costs + small daily yield = long break-even period'],
      },
      {
        id: 'tp-10',
        type: 'judgment-riskAssess',
        task: 'Portfolio: $95,000 on Starknet in Ekubo LP via Starkgate, $60,000 on Ethereum in Aave directly. A Starkgate low-severity vulnerability is disclosed. Which position is affected and what action is appropriate?',
        scoringCriteria: ['Only the $95,000 Starknet position carries Starkgate exposure', 'Aave position is unaffected — no bridge involved', 'Low-severity: monitor, document in position register, set alert for reclassification — not automatic exit', 'States the specific trigger that would upgrade to exit: reclassification to medium/high or evidence of active exploit attempts'],
      },
      {
        id: 'tp-11',
        type: 'judgment-dataInterpret',
        task: 'Multi-chain portfolio: Starknet 15% APY ($40,000), Ethereum 6% APY. Monthly rebalancing cost $22. Is it worth moving an additional $15,000 from Ethereum to Starknet this month?',
        scoringCriteria: ['Differential: 9%. Monthly gain: $15,000 × 0.09 × 30/365 = $111.37', '$111.37 >> $22 — rebalance clearly justified', 'States the new total Starknet allocation: $40,000 + $15,000 = $55,000, and confirms the math applies to the marginal capital only'],
      },
      {
        id: 'tp-12',
        type: 'judgment-communication',
        task: 'Explain to a portfolio manager in 3 sentences why settlement finality matters when managing cross-chain DeFi positions.',
        scoringCriteria: ['States different chains have different exit timelines: Starknet up to 12 hours to Ethereum, Solana under 1 minute', 'Explains the consequence: a Starknet position cannot be fully exited to Ethereum in under 12 hours regardless of urgency', 'States the planning requirement: emergency exit protocols must account for chain-specific finality before capital is deployed'],
      },
      {
        id: 'tp-13',
        type: 'judgment-riskAssess',
        task: 'You hold wETH on Solana and need to move $40,000 to Starknet. Direct Hyperlane lock-and-mint: 5-of-8 multisig, $20 fee, 9 min. Wormhole→Ethereum→Starkgate: $21 total, 24 min. The amount and 4-month hold period are both significant factors. Which do you choose?',
        scoringCriteria: ['Path B is $1 more expensive and provides Starkgate STARK proof on the Starknet final leg', 'For $40,000 held 4 months, $1 extra for meaningfully stronger security assurance on the final leg is appropriate', 'States that direct Hyperlane becomes more compelling for smaller amounts where $1 difference is proportionally larger'],
      },
      {
        id: 'tp-14',
        type: 'judgment-dataInterpret',
        task: 'Three assets to bridge from Ethereum to Starknet: $60,000 USDC, $40,000 ETH, $10,000 STRK. State the optimal bridge for each and the total estimated cost assuming $8 gas per Starkgate transaction and $5 CCTP gas.',
        scoringCriteria: ['USDC: CCTP, $5 gas. Rationale: burn-and-mint, no locked-collateral risk', 'ETH: Starkgate, $8 gas. Rationale: canonical lock-and-mint, no added trust', 'STRK: Starkgate, $8 gas. Rationale: only bridge supporting STRK', 'Total: $5 + $8 + $8 = $21'],
      },
      {
        id: 'tp-15',
        type: 'judgment-communication',
        task: 'Explain in 3 sentences: what bridge risk exposure is, why it persists after the initial bridge transaction, and what event would end it.',
        scoringCriteria: ['Defines bridge risk exposure: ongoing risk from locked collateral in a bridge contract on the origin chain, for the duration of a Starknet position', 'Explains persistence: the ETH or other tokens remain locked in the bridge contract until the position is closed and funds are withdrawn', 'States termination event: bridge risk exposure ends when the Starknet position is closed, funds withdrawn, and the Starkgate L1 withdrawal is claimed — returning locked collateral to the user\'s Ethereum wallet'],
      },
    ],
  },

  phase2: {
    label: 'Phase 2 — Portfolio Push',
    hintsEnabled: false,
    portfolioPush: true,

    portfolioDefensePrompt: `
I can see from your Lab 7 portfolio that you deployed an LP strategy on Ekubo.
Before we assess your bridging strategy, answer this: How did you get that capital onto Starknet?
Which bridge did you use, what was the trust model, and what was your total round-trip cost for that deployment?
If the APY compressed and you needed to exit your Lab 7 position today, how long would it take you to have the capital back on Ethereum and fully settled?
    `.trim(),

    scenario: `
You are the Cross-Chain Capital Lead for a DeFi fund managing $300,000 in assets across Ethereum, Starknet, and Solana.
The fund's CIO has asked you to produce a complete cross-chain capital movement strategy document that will govern all bridging decisions for the next 6 months.

The document must cover four sections:

Section 1 — Bridge Selection Policy
Define the rule for each bridge decision: which bridge for USDC transfers of any size, which bridge for ETH transfers above and below $10,000, which bridge for Solana-originating capital, and which conditions would lead you to suspend use of any specific bridge.

Section 2 — Round-Trip Cost Analysis
For the following three planned capital movements, calculate the break-even duration and net advantage over the planned holding period:
(A) $80,000 USDC from Ethereum to Starknet, 14% destination APY, 6% source APY, 60 days.
(B) $25,000 ETH from Ethereum to Starknet, 11% destination APY, 5% source APY, 30 days.
(C) $15,000 USDC from Solana to Starknet, 18% destination APY, 8% source APY, 21 days.

Section 3 — Bridge Risk Register
For the current planned portfolio — $80,000 USDC on Starknet via CCTP, $25,000 ETH on Starknet via Starkgate, $15,000 USDC on Starknet via Hyperlane CCTP, $90,000 remaining on Ethereum in Aave — produce a bridge risk register with risk level, specific risk, and exit trigger for each position.

Section 4 — Emergency Exit Protocol
Define the fund's emergency exit protocol: what event triggers an exit review, what action is taken for each chain and bridge, and what the maximum expected time-to-Ethereum is for each position.
    `.trim(),

    scoringCriteria: [
      'Section 1 — Bridge selection policy is specific: USDC always CCTP (burn-and-mint, no locked-collateral risk), ETH above $10K via Starkgate (canonical), ETH below $10K may use Orbiter (gas cost calculus), Solana USDC via Hyperlane CCTP, Solana non-USDC large amounts via Wormhole+Starkgate intermediate hop',
      'Section 1 — Bridge suspension conditions are observable, not vague: exploit disclosed, audit finding rated medium+, TVL drop >40% in 24 hrs',
      'Section 2A — Correct: diff 8%, daily = $80,000 × 0.08 / 365 = $17.53. Break-even = $22 / $17.53 = 1.26 days. Over 60 days: $1,051.78 − $22 = $1,029.78 net',
      'Section 2B — Correct: diff 6%, daily = $25,000 × 0.06 / 365 = $4.11. Break-even = $22 / $4.11 = 5.35 days. Over 30 days: $123.29 − $22 = $101.29 net',
      'Section 2C — Correct: diff 10%, daily = $15,000 × 0.10 / 365 = $4.11. Break-even = $22 / $4.11 = 5.35 days. Over 21 days: $86.30 − $22 = $64.30 net',
      'Section 3 — Bridge risk register correctly assigns: CCTP positions as low risk (Circle attestation, no locked collateral), Starkgate ETH as low risk (STARK proof), Hyperlane CCTP as low risk (same rationale as CCTP), Aave direct as no bridge risk',
      'Section 3 — Exit triggers are specific observable events, not "if it looks risky"',
      'Section 4 — Emergency protocol distinguishes chains: Starknet positions require Starkgate withdrawal initiation immediately (12-hour timeline); Solana positions can exit within minutes; Ethereum positions have no bridge exit requirement',
      'Section 4 — Maximum time-to-Ethereum stated correctly per position: Starknet via Starkgate = up to 12 hours, Solana via Hyperlane + Wormhole = approximately 25 minutes',
      'Portfolio defense from Lab 7 answered correctly: bridge used for LP deployment identified, trust model stated, round-trip cost calculated, exit timeline acknowledged as up to 12 hours for Starkgate',
    ],

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/intermediate/lab-8-bridging/',
      files: [
        {
          filename: 'bridge-strategy-memo.md',
          type: 'narrative' as const,
          content: `# Lab 8 — Bridging and Cross-Chain Capital Movement: Certification

## Role Simulated
Cross-Chain Capital Lead — DeFi Fund ($300,000 AUM)

## Portfolio Defense — Lab 7 Connection
**Bridge used for Lab 7 LP deployment:** [Bridge name]
**Trust model:** [Description]
**Round-trip cost calculation for that deployment:** $[amount] principal via [bridge], $[entry cost] entry + $[exit cost] exit + $[opportunity cost] 12-hour idle = $[total] round-trip cost
**Time-to-Ethereum if exiting today:** [Up to 12 hours via Starkgate / other]

## Section 1 — Bridge Selection Policy

| Scenario | Bridge | Mechanism | Rationale |
|---|---|---|---|
| USDC, any size | CCTP | Burn-and-mint | No locked-collateral risk; native USDC on Starknet |
| ETH > $10,000 | Starkgate | Lock-and-mint (canonical) | STARK proof, no added trust assumption |
| ETH < $10,000 | Orbiter or Starkgate | Relayer / canonical | Gas cost calculus: Orbiter at [threshold]% of amount |
| Solana USDC | Hyperlane CCTP | Burn-and-mint | Circle attestation; Hyperlane validators not security bottleneck |
| Solana non-USDC > $[threshold] | Wormhole → Starkgate | Two-bridge intermediate hop | Starkgate STARK proof on final leg for large amounts |

**Bridge Suspension Conditions (any bridge):**
1. [Specific observable condition 1]
2. [Specific observable condition 2]
3. [Specific observable condition 3]

## Section 2 — Round-Trip Cost Analysis

**Movement A: $80,000 USDC, Ethereum→Starknet, 14% vs 6% APY, 60 days**
- Daily yield differential: $80,000 × [diff]% / 365 = $[daily]
- Break-even: $[round-trip cost] / $[daily] = [days]
- Net advantage over 60 days: $[yield] − $[cost] = $[net]

**Movement B: $25,000 ETH, Ethereum→Starknet, 11% vs 5% APY, 30 days**
- Daily yield differential: $25,000 × [diff]% / 365 = $[daily]
- Break-even: $[cost] / $[daily] = [days]
- Net advantage over 30 days: $[net]

**Movement C: $15,000 USDC, Solana→Starknet, 18% vs 8% APY, 21 days**
- Daily yield differential: $15,000 × [diff]% / 365 = $[daily]
- Break-even: $[cost] / $[daily] = [days]
- Net advantage over 21 days: $[net]

## Section 3 — Bridge Risk Register

| Position | Bridge | Risk Level | Specific Risk | Exit Trigger |
|---|---|---|---|---|
| $80K USDC (Starknet) | CCTP | [level] | [specific risk] | [observable trigger] |
| $25K ETH (Starknet) | Starkgate | [level] | [specific risk] | [observable trigger] |
| $15K USDC (Starknet via Hyperlane) | Hyperlane CCTP | [level] | [specific risk] | [observable trigger] |
| $90K USDC (Ethereum Aave) | None | None | No bridge exposure | N/A |

## Section 4 — Emergency Exit Protocol

**Exit Review Trigger:** [Specific event that initiates exit review]

**Starknet Positions (all):**
- Action: Initiate Starkgate withdrawal immediately upon trigger
- Time-to-Ethereum: Up to 12 hours
- Intermediate state: Capital on Starknet L2 is safe at L2 finality while withdrawal processes

**Solana Position:**
- Action: Exit DeFi protocol, bridge via [bridge]
- Time-to-Ethereum: Approximately [X] minutes

**Ethereum Position:**
- Action: [Action if required]
- Time-to-settlement: Immediate — no bridge required

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 8 Bridging and Cross-Chain Capital Movement — Intermediate Starknet DeFi Navigator',
      badgeEarned: 'Cross-Chain Capital Certified — Intermediate',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only' as const,
  },
};


export const NAVIGATOR_LAB_8_META = {
  id: 'navigator-intermediate-lab-8',
  title: 'Bridging and Cross-Chain Capital Movement',
  trackId: 'starknet-defi-navigator',
  level: 'intermediate' as const,
  labNumber: 8,
  estimatedHours: 5.5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 7 Phase 2 complete',
  description: 'Bridge mechanics (lock-and-mint vs burn-and-mint), Ethereum-to-Starknet paths (Starkgate, CCTP, Orbiter), Solana-to-Starknet via Hyperlane, round-trip cost calculation and break-even analysis, multi-chain portfolio management.',
  crossChainCoverage: 'Starkgate vs Arbitrum Bridge vs Wormhole vs Allbridge — security models and trust assumptions compared.',
  nextLab: 'Lab 9 — Advanced DeFi Primitives',
};
