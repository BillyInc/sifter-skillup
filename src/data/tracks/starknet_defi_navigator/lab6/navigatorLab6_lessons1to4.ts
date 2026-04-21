// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 6 — PORTFOLIO STRATEGY AND ALLOCATION · LESSONS 1–4
// Written to sim_instructions_v3 + Lab 11 standard
// Entry point to Intermediate level — assumes Junior Labs 1–5 complete
// Cross-chain: Ethereum/Solana allocation frameworks compared at boss level

export const LAB6_LESSONS_1_TO_4 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — Asset Allocation Frameworks
// ─────────────────────────────────────────────────────────────
{
  id: 'asset-allocation-frameworks',
  title: 'Asset Allocation Frameworks for DeFi Portfolios',
  explanation: `
In 1986, a landmark study by Brinson, Hood, and Beebower found that 93.6% of the variation in portfolio returns across pension funds was explained by their asset allocation — not stock selection, not market timing. The choice of how much to hold in each asset class mattered far more than the individual assets chosen. DeFi portfolios operate under the same principle: how you allocate between STRK, stablecoins, ETH, and different yield strategies matters more than which specific validator pool or lending protocol you choose.

Asset allocation in DeFi requires resolving three tensions that do not exist in the same form in traditional finance.

The first tension is yield vs liquidity. High-yield positions (locked staking, concentrated LP, borrow positions) are often partially or fully illiquid. A 21-day unbonding period, a 94% utilised lending pool, or an out-of-range LP position can all prevent access to capital when you need it. The allocation framework must explicitly reserve a liquid tier — typically 15–25% of total portfolio in immediately accessible assets.

The second tension is yield vs price exposure. STRK-denominated yield (staking, STRK LP fees) amplifies your STRK position. Dollar-denominated yield (USDC lending, stablecoin LP) reduces your STRK exposure. Your allocation implicitly expresses a view on STRK price. If you allocate 80% to staking, you are highly bullish on STRK. If you allocate 80% to USDC lending, you are expressing a neutral or bearish view.

The third tension is diversification vs concentration. Starknet is a young ecosystem with protocol-level risks. Concentrating 80% of capital in a single protocol (even a good one) is meaningful smart contract risk exposure. Spreading across Vesu, Ekubo, staking, and liquid reserves reduces the blast radius of any single protocol failure.

A workable framework for a $10,000–$100,000 Starknet portfolio:
- 20% liquid reserve (immediately accessible USDC or STRK — no lock-up)
- 35% dollar-denominated yield (USDC lending across 2+ protocols)
- 30% STRK-denominated yield (staking in 2–3 validator pools)
- 15% opportunistic/active (LP positions, DCA accumulation, experimental protocols)

Adjust percentages based on your STRK price conviction and liquidity needs. The framework is not a formula — it is a structure that forces explicit decisions about each tension.
  `.trim(),
  visualPrompt: 'Portfolio allocation pie chart with four segments: Liquid Reserve (20%, grey), Dollar Yield (35%, green), STRK Yield (30%, purple), Opportunistic (15%, orange). Below: three tension diagrams showing yield vs liquidity, yield vs price exposure, and diversification vs concentration as scales/sliders.',
  visualType: 'static',
  visualUrl: 'defi-allocation-framework',
  examples: [
    {
      contextTag: '[Allocation expressing implicit STRK view]',
      context: 'Two investors each have $30,000 on Starknet. Investor A: $24,000 (80%) in STRK staking, $6,000 (20%) USDC in Vesu. Investor B: $6,000 (20%) in STRK staking, $21,000 (70%) USDC in Vesu, $3,000 (10%) liquid.',
      scenario: 'STRK falls 40% over 6 months. Both calculate their portfolio values.',
      outcome: 'Investor A: staking position now worth $14,400 (was $24,000) + $6,180 Vesu (5.5% for 6 months) + no liquid buffer = $20,580. Down 31.4%. Investor B: staking now worth $3,600 (was $6,000) + $21,578 Vesu + $3,000 liquid = $28,178. Down 6.1%. The allocation expressed the price view — Investor A was implicitly very bullish on STRK. The allocation determined outcomes, not protocol selection.',
    },
    {
      contextTag: '[Liquidity tier saving a position]',
      context: 'A DeFi operator has $50,000 deployed: $35,000 staked (21-day unbonding), $12,000 in Vesu at 88% utilisation, $3,000 liquid. An urgent onchain opportunity requires $8,000 within 48 hours.',
      scenario: 'The operator evaluates their liquidity position.',
      outcome: 'Liquid: $3,000 available immediately. Vesu at 88% utilisation: approximately $1,440 available immediately (12% × $12,000). Total: $4,440 — not enough for the $8,000 requirement. They must either borrow against their staked position or miss the opportunity entirely. Had they kept 20% liquid ($10,000), the opportunity would have been accessible. The lesson: liquid reserves are not idle capital — they are optionality capital.',
    },
    {
      contextTag: '[Protocol concentration risk, blast radius assessment]',
      context: 'An investor has $40,000 on Starknet, all in Vesu. A critical Vesu smart contract vulnerability is discovered and $2M is drained from the protocol. The user cannot withdraw — the Vesu team pauses the protocol.',
      scenario: 'Compare this outcome to an investor who had the same $40,000 split: $18,000 Vesu, $14,000 staking (separate protocol), $8,000 liquid.',
      outcome: 'Concentrated investor: full $40,000 at risk. Diversified investor: $18,000 at risk (the Vesu portion), $22,000 safe. Protocol-level diversification is not about getting higher returns — it is about reducing the maximum possible loss from a single event. At $40,000, the $50/year saved by concentrating in the best single-protocol yield rate is trivial compared to the risk reduction from spreading across three protocols.',
    },
  ],
  keyTakeaway: 'A 1986 study of pension funds found that 93.6% of return variation came from asset allocation — which means choosing whether to hold 30% or 70% STRK matters far more than choosing between Vesu and Nostra for the USDC portion.',
  guidedPractice: [
    {
      question: 'You have $25,000 on Starknet. You want maximum yield with no concerns about liquidity. You put 100% in a 9% APY staking position. What is the hidden cost of this decision?',
      options: [
        'A. No hidden cost — maximum yield is always the correct objective',
        'B. Zero liquidity for 21 days minimum during any exit. Any opportunity requiring capital within 21 days is inaccessible. All capital at risk from a single validator failure.',
        'C. The staking protocol charges extra fees for 100% allocations',
        'D. You lose yield on the 15% that should be kept liquid',
      ],
      correct: 1,
      hint: 'Think about what "100% staked" means for: (a) emergencies, (b) opportunities, (c) single-point failure.',
      explanation: 'B is correct. Three hidden costs: (1) zero liquidity — you cannot access any capital for 21 days minimum if you need it urgently, (2) no optionality — any new opportunity is inaccessible, (3) concentration risk — a single validator failure or slashing event affects your entire portfolio. Maximum yield and optimal risk-adjusted return are not the same objective.',
    },
    {
      question: 'Investor A: 85% STRK staking, 15% liquid. Investor B: 30% STRK staking, 55% USDC Vesu, 15% liquid. Both have $20,000. STRK rises 50%. Who performs better after 12 months at 9% staking APY and 5.5% Vesu APY?',
      options: [
        'A. Investor A — more STRK exposure in a bull market always wins',
        'B. Investor A: ($17,000 × 1.09 × 1.5) + $3,000 = $30,805. Investor B: ($6,000 × 1.09 × 1.5) + ($11,000 × 1.055) + $3,000 = $24,565. Investor A wins significantly in a bull market.',
        'C. Investor B — diversification always outperforms',
        'D. They perform identically — yield rates equalise outcomes',
      ],
      correct: 1,
      hint: 'Calculate each position separately. Staking gains both yield and price appreciation. Vesu gains yield but not STRK price appreciation.',
      explanation: 'B is correct. In a bull market, higher STRK allocation wins because you capture both staking yield AND price appreciation. Investor A: 17,000 × 1.09 (staking) = 18,530 STRK × $1.20/STRK (50% rise) + $3,000 = $25,236. Investor B: 6,000 × 1.09 × $1.20 + 11,000 × 1.055 + $3,000 = $7,848 + $11,605 + $3,000 = $22,453. This is why allocation decisions are implicit price views — higher STRK allocation is higher STRK beta.',
    },
    {
      question: 'What does the Brinson, Hood, and Beebower study finding imply for DeFi portfolio management?',
      options: [
        'A. Protocol selection (which Starknet lending protocol to use) is the most important decision',
        'B. Asset allocation (how much in stablecoins vs STRK vs liquid) explains most portfolio outcome variation — choosing Vesu vs Nostra matters far less than choosing 30% vs 70% stablecoin allocation',
        'C. Market timing (when to enter DeFi positions) is the dominant factor',
        'D. The study is irrelevant to DeFi because DeFi is a different asset class',
      ],
      correct: 1,
      hint: 'The study found 93.6% of return variation came from allocation. What does that imply about protocol selection within an asset class?',
      explanation: 'B is correct. If 93.6% of return variation is explained by allocation, then the choice between Vesu and Nostra (both USDC lending protocols) is a minor determinant of outcomes compared to whether you hold 20% vs 60% in USDC-denominated yield at all. Spending hours researching the "best" staking validator when your staking allocation is 5% vs 50% is misallocating your analytical energy.',
    },
    {
      question: 'You hold 70% of your Starknet portfolio in STRK-denominated yield (staking + STRK LP). What price view does this allocation implicitly express?',
      options: [
        'A. Neutral on STRK — yield is yield regardless of currency',
        'B. Bearish on STRK — high yield compensates for expected price decline',
        'C. Bullish on STRK — you want maximum STRK exposure because you expect price appreciation',
        'D. No view — allocation is purely about maximising yield percentage',
      ],
      correct: 2,
      hint: 'If STRK falls 50%, what happens to the dollar value of your 70% STRK-denominated position? Would a neutral or bearish investor accept this exposure?',
      explanation: 'C is correct. A 70% STRK-denominated allocation means 70% of your portfolio moves with STRK price. If STRK falls 50%, that 70% becomes 35% of original value — a 35% loss on the overall portfolio before yield. Only an investor who is bullish on STRK would rationally accept this exposure. Neutral or bearish investors allocate more to dollar-denominated positions to preserve dollar value.',
    },
    {
      question: 'What is the primary purpose of the liquid reserve tier in a DeFi portfolio?',
      options: [
        'A. To earn yield on idle capital while maintaining flexibility',
        'B. To preserve optionality — the ability to act on opportunities, emergencies, or risk events within hours, not weeks',
        'C. To satisfy regulatory requirements for liquid asset holdings',
        'D. To provide a buffer against impermanent loss in LP positions',
      ],
      correct: 1,
      hint: 'Think about what you cannot do without liquid reserves. What would you miss?',
      explanation: 'B is correct. Liquid reserves are optionality capital. They enable: (1) acting on new DeFi opportunities that open suddenly, (2) responding to emergencies requiring immediate capital, (3) rebalancing when portfolio drift triggers corrective action, (4) adding collateral to a threatened borrow position without waiting for unbonding. Liquid capital earns less yield — this is the explicit cost of paying for optionality.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have $60,000 to deploy on Starknet. Current rates: USDC Vesu 5.6% APY, STRK staking 8.9% APY, STRK/USDC Ekubo LP estimated 16% APY, STRK current price $0.80. Design a complete allocation across four tiers (liquid, dollar yield, STRK yield, opportunistic). For each tier: dollar amount, protocol, APY, annual yield in dollars. Calculate total expected annual yield and blended yield %.',
      scoringCriteria: [
        'Liquid tier: 15–25% of $60,000 = $9,000–$15,000, zero yield, provides optionality',
        'Dollar yield tier: USDC to Vesu/Nostra, 5.6% APY calculated on allocated amount',
        'STRK yield tier: STRK staked at 8.9%, converted to dollar yield at $0.80',
        'Opportunistic tier: LP or experimental, 16% APY with IL risk noted',
        'Total annual yield calculated. Blended yield = total yield / $60,000',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Portfolio: $80,000 total. $60,000 in a single Starknet lending protocol (new, 3 months old), $15,000 staked, $5,000 liquid. The protocol announces they found a critical bug and are pausing withdrawals while they patch. Assess your position and list actions in priority order.',
      scoringCriteria: [
        'Immediate assessment: $60,000 (75% of portfolio) is inaccessible. This is the blast radius of excessive concentration.',
        'Priority 1: Verify the announcement is genuine — check official channels, not just social media',
        'Priority 2: Monitor the protocol team\'s communication on the patch timeline',
        'Priority 3: Do not panic-sell the liquid $5,000 — assess whether the bug is exploitable before acting',
        'Lesson identified: never allocate 75% to a single 3-month-old protocol. Protocol age and diversification thresholds should have prevented this.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A colleague running a Starknet ecosystem fund asks you to review their allocation: 90% STRK staking, 10% liquid. They argue "staking has the best risk-adjusted yield on Starknet." Respond with a specific critique in 4 sentences that addresses both the allocation and the reasoning.',
      scoringCriteria: [
        'Critiques the yield comparison: risk-adjusted yield includes liquidity risk and price concentration risk — not just APY %',
        'Points out the liquidity problem: 90% locked in staking means 21-day minimum for any capital access',
        'Points out the price concentration: 90% STRK exposure means this is a highly directional STRK price bet, not a risk-adjusted strategy',
        'Suggests a specific improvement: redistribute to include at least 30% dollar-denominated yield and 20% liquid reserve',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Yield Optimisation
// ─────────────────────────────────────────────────────────────
{
  id: 'yield-optimisation',
  title: 'Yield Optimisation: Making Capital Work Harder',
  explanation: `
In 1958, Harry Markowitz won the Nobel Prize for demonstrating that expected return and risk (measured as variance) are the only two variables that matter for portfolio construction. Every extra unit of return per unit of risk taken is an improvement. The Sharpe ratio — return minus the risk-free rate, divided by return volatility — became the standard measure. In DeFi, the same principle applies: you want the highest yield for the risk you are taking, not simply the highest yield.

Risk-adjusted yield in DeFi means adjusting the quoted APY for the specific risks of that position. A 9% staking APY on an established validator is different from a 9% APY on a new protocol with no audit. A 16% LP APY on a volatile pair is different from a 16% APY on a stable pair. The number is the same — the risk is not.

Capital efficiency is the practice of making the same USDC do multiple things simultaneously. Supplying USDC to Vesu earns supply APY. The vUSDC receipt token you receive can, in some configurations, be used as collateral elsewhere. Staking STRK earns staking APY. Liquid staking tokens representing staked STRK can be used as collateral in Vesu. Each layer of efficiency adds yield without additional capital deployment — but adds a corresponding layer of smart contract risk.

Yield decay is the systematic tendency for high-yielding strategies to compress over time as capital flows in. A 20% APY in a new Starknet protocol attracts capital. More capital means more supply relative to demand. Rates fall. Within months, the "20% opportunity" becomes a 6% opportunity. Systematic yield optimisation requires monitoring yield decay and rotating capital before the yield advantage disappears.

Gas cost impact on yield determines the minimum viable position size for each strategy. On Ethereum mainnet, a $500 monthly compounding action at $30 gas costs 6% of the yield — not viable. On Starknet with a gasless paymaster, the same action costs $0. This means Starknet enables economically rational yield strategies at position sizes that would be unviable on Ethereum.

The yield stack is the layering of yields from multiple sources on the same capital. A staked STRK position earns staking APY. The staking position generates STRK rewards. Those rewards fund a DCA into more STRK. The accumulated STRK adds to the staking base. Each layer is additive but each layer also adds complexity and risk.
  `.trim(),
  visualPrompt: 'Two charts: Left — risk vs return scatter plot with different DeFi strategies plotted (staking, USDC lending, stable LP, volatile LP, new protocol, leveraged staking) showing the efficient frontier. Right — yield decay curve showing a new protocol\'s APY declining from 25% to 6% over 6 months as TVL grows.',
  visualType: 'static',
  visualUrl: 'yield-optimisation-frontier',
  examples: [
    {
      contextTag: '[Risk-adjusted yield comparison, two "equal" opportunities]',
      context: 'Two Starknet protocols both offer 8% APY on USDC deposits. Protocol A: 18 months operating, $40M TVL, two audits, 72% utilisation. Protocol B: 6 weeks operating, $3M TVL, no audit, 65% utilisation.',
      scenario: 'An investor evaluates both using risk-adjusted yield rather than raw APY.',
      outcome: 'Protocol A: smart contract risk low (established, audited), liquidity risk low (72% utilisation, $11.2M available). Risk-adjusted yield: high confidence in the 8%. Protocol B: smart contract risk high (new, unaudited), liquidity risk medium ($1.05M available). Risk-adjusted yield: 8% face value but significant probability of partial or total loss. To earn the same risk-adjusted yield as Protocol A, Protocol B should offer 12–15% to compensate for the additional risk. An investor choosing Protocol B at 8% is being under-compensated for the risk they are taking.',
    },
    {
      contextTag: '[Yield decay in real time, capital rotation]',
      context: 'A new Starknet lending protocol launches in January with 22% supply APY on USDC (high because initial TVL is tiny and borrow demand is relatively high). By March, TVL has grown from $200K to $8M.',
      scenario: 'An investor tracked the APY weekly and monitored when to rotate capital.',
      outcome: 'January: 22% APY, $200K TVL. February: 14% APY, $2M TVL. March 1: 8.5% APY, $5M TVL. March 15: 6.2% APY, $8M TVL. The investor rotated capital to a new protocol in February at 14% before the final compression to 6.2%. By monitoring yield decay rate (the protocol was losing 2–3% APY per week), they extracted the high-yield period and left before the opportunity compresses. Passive investors who entered in January and held through March earned an average APY of approximately 12% — better than the 6.2% late entry but far below the 22% initial rate.',
    },
    {
      contextTag: '[Gas cost impact, Starknet vs Ethereum]',
      context: 'An investor has $2,000 in a DeFi yield position and wants to compound monthly — claiming rewards and re-depositing to maximise compounding. Comparing Ethereum mainnet vs Starknet.',
      scenario: 'Monthly compounding costs: Ethereum mainnet gas: $25–40 per claim+deposit transaction. Starknet with paymaster: $0.',
      outcome: 'Ethereum: monthly gas cost $30 / $2,000 position = 1.5% monthly cost = 18% annual cost from gas alone. At 8% APY, compounding is actively destroying value — paying $18/month in gas on $160/year in yield. On Starknet: $0 gas means the $160/year in yield is fully earned. Minimum viable compounding position on Ethereum: approximately $20,000–$30,000. On Starknet: any size — even a $50 position can compound efficiently.',
    },
  ],
  keyTakeaway: 'A 12% APY on a new unaudited protocol is not a better opportunity than 7% on an established audited one — the difference is risk premium, not free money, and measuring yield without measuring risk is how capital gets lost.',
  guidedPractice: [
    {
      question: 'Protocol A: 7% APY, 20 months old, audited, $35M TVL. Protocol B: 12% APY, 2 months old, unaudited, $1.5M TVL. You have $50,000. Which has better risk-adjusted yield?',
      options: [
        'A. Protocol B — 12% is higher than 7% so it is always better',
        'B. Protocol A — the 7% comes with established track record, audit, and deep liquidity. The risk premium required for Protocol B would put its fair yield at 15–20%, not 12%. Protocol A offers better risk-adjusted yield.',
        'C. They are equivalent — both are Starknet DeFi protocols with similar risk',
        'D. Protocol B — higher TVL growth rate indicates better protocol quality',
      ],
      correct: 1,
      hint: 'What extra risks does Protocol B carry? What yield premium should those risks command?',
      explanation: 'B is correct. Protocol B carries: unaudited code (smart contract risk), 2-month track record (insufficient time for bugs to surface), $1.5M TVL (thin — meaning potential withdrawal constraints and less battle-tested). Each risk deserves a premium. An unaudited protocol on a 2-month track record should offer at minimum 5–8% premium over an established audited protocol to compensate for those risks. Protocol B at 12% offers only a 5% premium — insufficient. Protocol A at 7% is better risk-adjusted.',
    },
    {
      question: 'A new Starknet protocol launches at 30% APY. Two weeks later it is at 24%. Two weeks after that, 18%. What is the yield decay rate per week and when will it likely reach market rate (~7%)?',
      options: [
        'A. Decay rate: 3% per week. Reaches 7% in approximately 5 weeks from now.',
        'B. Decay rate: 6% per two-week period = 3% per week. From 18%: 11 more weeks to reach 7%.',
        'C. Decay rate: 1.5% per week. Reaches 7% in 7 more weeks.',
        'D. Cannot predict — yield decay is random and not foreseeable.',
      ],
      correct: 1,
      hint: 'Calculate the change per period: 30%→24% in 2 weeks = 6% drop. 24%→18% in 2 weeks = 6% drop. Is decay rate linear?',
      explanation: 'B is correct. The protocol has been losing approximately 6% APY every two weeks = 3% per week. This is consistent, suggesting linear decay driven by steady capital inflow. From 18%: (18% - 7%) / 3% per week = 3.67 weeks. Roughly 4 more weeks until market rate. An investor who monitors this decay curve can decide when the yield advantage no longer justifies the higher risk of a newer protocol, and rotate to established alternatives.',
    },
    {
      question: 'The yield stack: you supply $10,000 USDC to Vesu (5.5% APY). You use vUSDC as collateral to borrow $2,000 USDC (7.2% borrow APY). You lend the borrowed $2,000 back into Vesu at 5.5% APY. What is your total net annual yield and what did capital efficiency achieve?',
      options: [
        'A. $550 — only the original $10,000 earns yield',
        'B. Supply yield: $550. Borrowed $2,000 earns: $110. Borrow cost: $144. Net yield stack: $550 + $110 - $144 = $516. Slightly less than simple supply but the looping has cost $34/year.',
        'C. $660 — 5.5% on $12,000 effective deployed capital',
        'D. Net negative — borrowing to re-supply always destroys value',
      ],
      correct: 1,
      hint: 'Calculate each piece: original supply yield, additional supply yield on borrowed amount, borrow cost. Sum the three.',
      explanation: 'B is correct. Original supply: $10,000 × 5.5% = $550. Borrowed supply: $2,000 × 5.5% = $110. Borrow cost: $2,000 × 7.2% = $144. Net: $550 + $110 - $144 = $516. The looping actually reduced yield by $34 because borrow APY (7.2%) exceeds supply APY (5.5%). Capital efficiency through looping only creates value when the rate spread is positive — here it is negative. This is a common mistake by beginners who assume "using capital multiple times" always improves yield.',
    },
    {
      question: 'Your Starknet strategy involves claiming and re-staking rewards every 7 days. Your position is $800. At 9% APY, your weekly reward is approximately $1.38. Should you compound weekly?',
      options: [
        'A. Yes — more frequent compounding always improves returns',
        'B. On Starknet with gasless paymaster: yes — $0 transaction cost makes even $1.38/week compounding viable. On Ethereum mainnet with $20 gas: no — $20 exceeds $1.38 weekly reward.',
        'C. No — compounding below $10/week never makes mathematical sense',
        'D. Only if you use TWAMM to batch the compounding action',
      ],
      correct: 1,
      hint: 'The answer depends on the gas cost. What does Starknet\'s paymaster change about this calculation?',
      explanation: 'B is correct. On Ethereum mainnet, a $20 gas cost on a $1.38 weekly reward is a 1,449% fee — economically absurd. On Starknet with gasless paymaster, the cost is $0 — so weekly compounding on an $800 position is viable. This is the precise reason Starknet enables DeFi participation at position sizes that are economically excluded on Ethereum mainnet.',
    },
    {
      question: 'You monitor a new Starknet protocol offering 18% APY that you deployed $5,000 into. APY has dropped from 18% to 11% over 4 weeks. At what point should you consider rotating to an established protocol at 6.5% APY?',
      options: [
        'A. Never rotate — you entered at 18% so keep the position regardless',
        'B. When the risk premium no longer compensates for the new protocol\'s higher risk — roughly when its APY falls within 2–3% of the established alternative, or earlier if a risk event occurs',
        'C. Immediately — any APY above 10% is suspicious',
        'D. Only when APY exactly equals 6.5% — matching the alternative',
      ],
      correct: 1,
      hint: 'The new protocol carries higher risk (newer, less battle-tested). What risk premium above the established rate is required to justify staying?',
      explanation: 'B is correct. The new protocol carries higher smart contract and liquidity risk compared to established alternatives. A risk premium of 3–5% above established rates may be appropriate to justify the additional risk. If the 18% has compressed to 11% and the established alternative is 6.5%, the current premium is 4.5% — still potentially justifiable. If it compresses to 8.5%, the premium is only 2% — probably insufficient for the risk. Rotate when the risk premium falls below your threshold, not only when rates equalise.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have $40,000 allocated: $15,000 in Protocol A (12% APY, 6 weeks old, unaudited, TVL $2M — declining from 18% when you entered 4 weeks ago), $20,000 in Protocol B (6.8% APY, 16 months old, audited, TVL $28M), $5,000 liquid. Calculate: (1) current annual yield from each position, (2) risk-adjusted assessment of each, (3) if Protocol A continues decaying at 2%/week, when does it become a rotation candidate relative to Protocol B?',
      scoringCriteria: [
        'Protocol A annual yield: $15,000 × 12% = $1,800. Protocol B: $20,000 × 6.8% = $1,360.',
        'Risk assessment: Protocol A carries higher unaudited + new protocol risk. $1,800 yield must be evaluated against possible partial/total loss risk.',
        'Rotation trigger: Protocol A at 2%/week decay from 12%: (12% - 6.8%) / 2% = 2.6 weeks until APY matches Protocol B. With risk premium of ~2%, rotate when Protocol A hits ~8.8% = 1.6 weeks away.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Design a yield stack using $20,000 USDC on Starknet. Vesu supply at 5.8% APY. You can borrow USDC at 7.4% APY and re-supply. Calculate: is a 1-loop (borrow 70% of max LTV and re-supply) yield-positive? What about a 2-loop? At what borrow APY does looping become yield-neutral?',
      scoringCriteria: [
        '1-loop: deposit $20K, borrow $12K at 70% LTV. Re-supply $12K. Supply yield: ($20K + $12K) × 5.8% = $1,856. Borrow cost: $12K × 7.4% = $888. Net: $968 vs $1,160 without loop. Loop is yield-negative.',
        '2-loop: deposit $20K, borrow $12K, re-supply, borrow $8.4K more. Net: worse, each loop deepens the loss since borrow APY > supply APY.',
        'Break-even borrow APY = supply APY = 5.8%. Any borrow APY above supply APY makes looping yield-negative. Looping only makes sense when borrow APY < supply APY.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A new DeFi investor shows you a protocol offering 45% APY on USDC deposits. They say "I know it\'s risky but the yield is amazing." Give them a 4-sentence response that reframes their thinking around risk-adjusted yield without dismissing the opportunity.',
      scoringCriteria: [
        'Asks the sustainability question: where does 45% APY come from? $450/year per $1,000 is the required payout source.',
        'Introduces risk-adjusted yield concept: 45% nominal is not 45% risk-adjusted if there is meaningful probability of partial or total loss',
        'Gives a practical framework: what position size makes sense for this risk level? If you would put $10K in a 6% established protocol, maybe $1-2K in this 45% new one.',
        'Does not simply say "it is a scam" — acknowledges new protocols can be legitimate and the yield real while being honest about the risk calibration required',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Protocol Risk Assessment Methodology
// ─────────────────────────────────────────────────────────────
{
  id: 'protocol-risk-assessment',
  title: 'Protocol Risk Assessment: A Systematic Framework',
  explanation: `
Ronin Network was the blockchain bridge powering Axie Infinity, a blockchain game with millions of players. In 2022, it lost $625 million to a hack. The vulnerability — only 5 of 9 validators were needed to approve transactions, and 4 of those 5 were controlled by Sky Mavis, the same company — was publicly visible in their documentation for months before the exploit. The risk was not hidden. It was just unread.

Systematic protocol risk assessment is the discipline of reading what is actually there before deploying capital. It converts the subjective feeling of "this seems trustworthy" into a structured evaluation across seven dimensions.

Dimension 1: Smart contract audit. Was it audited, by whom, and when? Trail of Bits, OpenZeppelin, Spearbit, and Certora are top-tier auditors. A 2021 audit on a protocol that has shipped major upgrades since is partially stale — only the unchanged code is covered. Bug bounty programs are the ongoing complement to a one-time audit.

Dimension 2: Team and transparency. Is the team publicly identified? Do they have verifiable prior experience building blockchain infrastructure? Anonymous teams are not automatically bad — many legitimate protocols are anonymous — but anonymity concentrates exit risk: no reputational consequences for abandoning the project.

Dimension 3: Upgrade mechanism. Can the team change the smart contract code after deployment? A fully upgradeable proxy controlled by a 2/3 multisig of team members is extremely centralised — they can change anything without governance vote. An immutable contract (cannot be changed) has zero upgrade risk but zero bug-fix ability. The best design: upgradeable with timelocked governance approval and a minimum 24–48 hour delay.

Dimension 4: Token distribution and vesting. What percentage is held by the team and investors? When do their tokens unlock? A team holding 30% of tokens with a 3-month cliff and 1-year vesting will be selling within 12 months. On-chain vesting contract addresses can often be found and monitored.

Dimension 5: Oracle dependency. Does the protocol use price oracles? Which ones? A single unverified oracle with no TWAP protection is a manipulation target. Multiple independent oracle sources with TWAP pricing is significantly safer.

Dimension 6: TVL trends and capital quality. Is TVL growing organically or through incentive programs that will stop? A protocol whose TVL is 80% in their own governance token (farmed and dumped) is fundamentally different from one whose TVL is 80% USDC and ETH from long-term users.

Dimension 7: Historical security. Has the protocol been exploited before? If yes, was the root cause fixed or band-aided? What was the post-exploit response — full transparency and user reimbursement, or obfuscation?
  `.trim(),
  visualPrompt: 'Seven-dimension risk assessment scorecard: each dimension has a 1-5 rating with colour coding (green 4-5, yellow 2-3, red 1). Radar chart showing a sample protocol\'s scores across all seven dimensions. Below: example of a "Ronin-style" red flag checklist.',
  visualType: 'static',
  visualUrl: 'protocol-risk-scorecard',
  examples: [
    {
      contextTag: '[Upgrade mechanism red flag, real pattern]',
      context: 'A Starknet lending protocol has a fully upgradeable proxy contract. The upgrade key is held by a 2/3 multisig. Team member A holds key 1, Team member B holds key 2, and a DAO treasury wallet holds key 3 — but the DAO treasury is controlled by Team member A.',
      scenario: 'A security researcher analyses the governance setup.',
      outcome: 'Team member A effectively controls 2 of 3 keys (their personal key + the DAO treasury they control). With Team member B, any two of three keys are sufficient to upgrade the contract. In practice, two individuals can make arbitrary changes to the protocol — including withdrawing all funds — with no timelock and no community notice. This is equivalent to a 2/2 multisig controlled by the team. Rating for upgrade mechanism: 1/5.',
    },
    {
      contextTag: '[Audit staleness, new code not covered]',
      context: 'A protocol was audited by Trail of Bits in March 2024 on version 1.0. In August 2024, they shipped version 2.0 which added concentrated liquidity and a new oracle integration — two of the most complex and attack-prone features in DeFi.',
      scenario: 'A potential depositor reads the protocol\'s security page: "Audited by Trail of Bits."',
      outcome: 'The March audit covered v1.0. The new concentrated liquidity and oracle integration code — which represents the majority of the attack surface in v2.0 — was never audited. The claim "Audited by Trail of Bits" is technically true and practically misleading. A diligent investor checks the audit date, the commit hash audited, and the protocol\'s changelog to determine what percentage of current deployed code is actually covered by the cited audit.',
    },
    {
      contextTag: '[Token distribution analysis, unlock event monitoring]',
      context: 'A Starknet protocol\'s tokenomics: total supply 100M tokens. Team allocation: 20M (20%) vesting 12 months with 1-month cliff. Investor allocation: 15M (15%) vesting 18 months with 6-month cliff. Community/ecosystem: 65M (65%) released over 4 years.',
      scenario: 'An analyst calculates when the largest selling pressure is likely to occur.',
      outcome: 'Month 1: cliff for team (1-month) — first 5M team tokens unlock. At 1 USDC/token this is $5M potential sell pressure. Month 6: investor cliff — first 2.5M investor tokens unlock. Month 12: team full vesting complete — remaining 15M team tokens unlock. Month 18: investor full vesting complete. The analyst monitors the protocol\'s on-chain vesting contract address and sets calendar reminders for each unlock event — these are predictable selling pressure dates that often depress token price temporarily.',
    },
  ],
  keyTakeaway: 'A protocol\'s upgrade mechanism — specifically who can change the code, how many must agree, and whether there is a time delay — matters more than any other single risk dimension, because a compromised upgrade key can bypass every other protection.',
  guidedPractice: [
    {
      question: 'A protocol was audited by OpenZeppelin 14 months ago. Since then they shipped three major feature upgrades covering 60% of their contract codebase. How much of the current code is covered by the audit?',
      options: [
        'A. 100% — the audit covers the protocol, not a specific version',
        'B. Approximately 40% — the unchanged original code. The 60% of new code from the upgrades has not been audited.',
        'C. 0% — any code change invalidates a previous audit entirely',
        'D. 100% — OpenZeppelin provides ongoing coverage after an initial audit',
      ],
      correct: 1,
      hint: 'An audit covers the specific code at a specific commit hash. New code added after the audit was never reviewed.',
      explanation: 'B is correct. The OpenZeppelin audit reviewed the code as it existed at the audit date. The 60% of new code shipped in subsequent upgrades was never reviewed by OpenZeppelin. The uncovered 60% could contain critical vulnerabilities. A diligent protocol would commission an audit of each major upgrade — the absence of that follow-up audit is itself a risk signal.',
    },
    {
      question: 'A protocol has a 3/5 multisig controlling upgrades. All five key holders are from the same founding team. Is this adequately decentralised?',
      options: [
        'A. Yes — a 3/5 multisig is considered industry-standard decentralisation',
        'B. No — the multisig structure is irrelevant if all key holders are aligned and potentially colluding. True decentralisation requires independent parties across different organisations with different incentives.',
        'C. Yes — any multisig above 1/1 is decentralised by definition',
        'D. Yes — the team are the most trusted parties to manage upgrades',
      ],
      correct: 1,
      hint: 'What is the purpose of a multisig? What failure mode does it prevent? Can that failure mode still occur if all key holders work together?',
      explanation: 'B is correct. A multisig prevents a single private key theft from being catastrophic — it requires multiple keys to sign. But it does not prevent coordinated insider action. If all 5 key holders are from the same team, any 3 of them can agree to upgrade the contract to steal funds or change parameters arbitrarily. The Ronin hack illustrates this: the multisig existed but the threshold could be reached by coordinated insiders. True decentralisation requires key holders with genuinely independent interests.',
    },
    {
      question: 'Protocol X\'s TVL is $30M but analysis shows $22M of it is their own governance token deposited by the team to inflate TVL metrics. What does the real TVL indicate about the protocol?',
      options: [
        'A. $30M TVL is $30M TVL — governance token deposits are legitimate',
        'B. Real TVL is approximately $8M. The inflation by team-deposited governance tokens suggests the team is manufacturing the appearance of adoption to attract genuine external capital.',
        'C. The protocol is worth more because the team has aligned their interests',
        'D. $30M TVL is conservative — governance tokens should be valued at a premium',
      ],
      correct: 1,
      hint: 'Who deposited the $22M and why? What is the economic quality of team-deposited governance tokens vs organic user capital?',
      explanation: 'B is correct. Team-deposited governance tokens are low-quality TVL: the team can withdraw at any time, the token\'s value is circular (the protocol uses its own token to make itself look bigger), and it provides no genuine liquidity for other users. Real TVL — USDC, ETH, and STRK deposited by independent external users — is the only economically meaningful measure. Protocols that inflate TVL metrics with their own governance tokens are attempting to manufacture credibility rather than earn it.',
    },
    {
      question: 'A protocol had a $4.5M hack in 2023. Their post-mortem cited a reentrancy bug. They deployed a fix and resumed operations. A new depositor reads this history. What additional questions should they ask?',
      options: [
        'A. No questions — a patched protocol is safer than one that has never been hacked',
        'B. Was the root cause fully fixed or patched around? Was the new code audited? Were affected users compensated? What monitoring is now in place?',
        'C. Only one question: was the hacker caught?',
        'D. Avoid the protocol entirely — any exploit history disqualifies a protocol',
      ],
      correct: 1,
      hint: 'An exploit demonstrates a vulnerability existed. What determines whether the risk has been fully addressed?',
      explanation: 'B is correct. Four critical follow-up questions: (1) Was the root cause fixed (not just the specific exploit path)? Many "patches" close one door while the underlying vulnerability remains. (2) Was the patched code re-audited? (3) Were affected users made whole? Protocol integrity under adversity reveals team character. (4) What new monitoring or circuit breakers were added? Option D (avoid entirely) is too rigid — some of the most secure protocols have survived an exploit and emerged more robust.',
    },
    {
      question: 'A protocol\'s tokenomics shows the team holds 25% of supply with a 1-year vesting cliff. It is now month 11. What risk event is approaching and how can it be monitored?',
      options: [
        'A. No risk — 1-year vesting is considered long-term commitment',
        'B. At month 12, the team\'s full 25% vests simultaneously — significant potential sell pressure. Monitor the on-chain vesting contract address for withdrawals. Watch token price action around the unlock date.',
        'C. Team token unlocks are always gradual and never create selling pressure',
        'D. The vesting cliff means they cannot sell until year 2 — no immediate risk',
      ],
      correct: 1,
      hint: 'A cliff means all tokens unlock at once, not gradually. What happens when a large allocation becomes liquid simultaneously?',
      explanation: 'B is correct. A 1-year cliff means 0% vests before month 12 and then 100% vests at once on month 12. The team holds 25% of supply that becomes immediately liquid. Even if only 10% of the team sells, that is 2.5% of total supply entering the market simultaneously. Monitor the on-chain vesting contract (find it via the project\'s documentation or block explorer), watch for withdrawal transactions, and consider reducing position size in the month before the unlock.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Conduct a seven-dimension risk assessment of this protocol: 8 months old. Audit: Quantstamp, 6 months ago, no major upgrades since. Team: 3 public founders with verifiable prior Solidity experience (no Cairo history). Upgrade: 4/7 multisig, 3 keys are community-elected DAO representatives, 4 keys are team. Timelock: 48 hours. Tokens: 500M supply, team 15% (2-year linear vest, 6-month cliff), investors 20% (1-year vest, 3-month cliff — 5 months until first investor cliff). Oracle: Pragma, TWAP 1-hour window. TVL: $12M, 78% USDC/ETH, 22% their own governance token. Exploit history: none. Rate each dimension 1–5 and produce an overall assessment.',
      scoringCriteria: [
        'Audit: 3/5 — Quantstamp is reputable, 6 months without upgrades is reasonable, but no Cairo audit history on team means contract quality uncertain',
        'Team: 3/5 — public and experienced, but Solidity background not Cairo — meaningful skill gap',
        'Upgrade: 3/5 — 4/7 with community reps is decent, 48-hour timelock is acceptable, but team still controls 4/7',
        'Tokens: 3/5 — investor cliff in 5 months is near-term risk, flag for monitoring',
        'Oracle: 4/5 — Pragma with TWAP is solid',
        'TVL quality: 3/5 — 78% external capital is good, 22% own token is a minor concern',
        'Exploit history: 5/5 — clean',
        'Overall: 3.1/5 — moderate risk, appropriate for limited allocation with monitoring',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You discover a Starknet protocol where the smart contract upgrade key is held by a Gnosis Safe multisig. The Gnosis Safe has 3 signers. On-chain, you can see that signer addresses 1 and 3 both sent their first transactions from the same deployer wallet 18 months ago. Signer 2 is a hardware wallet with independent history. Assess what this means and what position size (if any) is appropriate.',
      scoringCriteria: [
        'Correctly identifies: signers 1 and 3 likely belong to the same person (same deployer origin)',
        'Effectively: the 3/3 multisig is a 2/2 if signers 1 and 3 are the same person',
        'Correctly assesses: one independent party (signer 2) cannot stop upgrades if the other two collude',
        'Position size recommendation: very small or zero until the protocol clarifies the signer relationship',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a 5-bullet risk assessment summary for a $50,000 allocation decision into a new Starknet protocol. Format it as if briefing a non-technical investment committee — each bullet must be one sentence, actionable, and use no blockchain jargon.',
      scoringCriteria: [
        'Audit status: one sentence stating who audited it, when, and whether recent changes are covered',
        'Team accountability: one sentence on whether team members are publicly identified and verifiable',
        'Control risk: one sentence on who can change the system and how many people must agree',
        'Liquidity risk: one sentence on whether capital can be retrieved quickly',
        'Track record: one sentence on operating history and any prior security incidents',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Cross-Protocol Strategies
// ─────────────────────────────────────────────────────────────
{
  id: 'cross-protocol-strategies',
  title: 'Cross-Protocol Strategies: Composability in Practice',
  explanation: `
Money Legos is the term DeFi developers use for the composability of DeFi protocols — each protocol is a building block that can be stacked on others. Aave issues aTokens. Aave aTokens can be deposited into Yearn vaults. Yearn shares can be used as collateral in MakerDAO. A single dollar of capital earns three different yields simultaneously, stacked in a tower of smart contracts.

On Starknet, the same composability exists across a smaller but growing ecosystem. Understanding how to safely combine protocols — and how to recognise when you are stacking too much risk — is the skill that separates intermediate from junior DeFi participants.

Looping is the simplest composability strategy. Deposit USDC to Vesu → borrow USDC against it → deposit borrowed USDC to Vesu again. Each loop increases your effective supply while growing your borrow position. Looping is only yield-positive when borrow APY is meaningfully below supply APY — as shown in the yield optimisation lesson. The risk amplification is real: a high-utilisation event that prevents withdrawal affects a looped position more severely, and a liquidation at high LTV leaves less residual equity.

Delta-neutral strategies use DeFi positions to cancel price exposure. Supply USDC to earn yield (no price exposure). Borrow STRK against a separate STRK collateral position (short STRK). Your borrowed STRK has value that moves inversely with your collateral — combining them creates near-zero net STRK exposure while earning supply yield and borrowing yield spread. This is complex and requires active monitoring.

Leveraged LP combines LP provision with borrowing. Deposit USDC as collateral → borrow additional USDC → provide the combined capital as LP on Ekubo. This magnifies LP fee income and LP impermanent loss simultaneously. Net effect: higher returns in range, larger losses out of range.

The key composability principle: every additional protocol you add to a stack doubles the smart contract attack surface exposed. A stack of four protocols has four independent failure modes. If each protocol has a 2% annual probability of a critical exploit, four stacked protocols have approximately 8% annual exploit probability (simplified). Higher yield from composability must be assessed against exponentially increasing combined risk.

Position simplicity has real value. A single Vesu USDC deposit is a clean, audited, single-protocol exposure. Understanding it, monitoring it, and exiting it is straightforward. A four-protocol loop is harder to unwind under stress. The best DeFi participants are not those who find the most complex strategies — they are those who earn competitive risk-adjusted yield with the minimum necessary complexity.
  `.trim(),
  visualPrompt: 'Three diagrams: (1) Looping: Vesu deposit → borrow → Vesu → borrow again, showing growing arrows but also growing risk indicator. (2) Delta-neutral: two arrows (USDC supply yield pointing up, STRK borrow creating opposite price exposure), net delta = 0 arrow. (3) Risk stacking: bar chart showing 1-protocol risk, 2-protocol risk, 4-protocol risk with compounding probability.',
  visualType: 'static',
  visualUrl: 'composability-strategies',
  examples: [
    {
      contextTag: '[Looping, yield-positive conditions]',
      context: 'Vesu USDC: supply APY 5.8%, borrow APY 7.4%. Vesu ETH: supply APY 2.9%, borrow APY 5.1%.',
      scenario: 'A user considers looping USDC (borrow USDC and re-supply USDC) vs cross-looping (supply USDC, borrow ETH, sell ETH for USDC, re-supply USDC).',
      outcome: 'USDC loop: borrow APY (7.4%) > supply APY (5.8%) — yield negative. Each loop costs more in borrow APY than it earns in supply APY. Cross-loop (supply USDC, borrow ETH, sell ETH): borrow ETH at 5.1%, earn USDC supply at 5.8% on the converted ETH. Spread: +0.7%. This is yield-positive — but adds ETH price risk (the borrowed ETH must be repaid in ETH, so if ETH rises in price, repayment becomes more expensive). The "free" 0.7% spread comes with hidden ETH price exposure.',
    },
    {
      contextTag: '[Delta-neutral, execution and maintenance]',
      context: 'A user wants to earn DeFi yield with zero price exposure. They design a delta-neutral position.',
      scenario: 'Deposit $10,000 USDC to Vesu (supply 5.8% APY). Separately, deposit $5,000 STRK as collateral and borrow $2,000 STRK (borrow APY 6.2%). Immediately sell the borrowed STRK to USDC via AVNU.',
      outcome: 'Position: Long $10,000 USDC earning 5.8%. Short $2,000 STRK (borrowed and sold) — this creates a hedge. Net STRK price exposure: original $5,000 collateral minus $2,000 short = approximately $3,000 net long STRK (not fully delta-neutral). To achieve full delta-neutral on STRK, the short must equal the collateral value. This requires careful calibration and rebalancing when STRK price changes — a delta-neutral position drifts as underlying prices move. Maintenance cost: periodic rebalancing transactions.',
    },
    {
      contextTag: '[Risk stacking, the invisible complexity cost]',
      context: 'A sophisticated DeFi user builds a four-protocol stack: supply USDC to Vesu, receive vUSDC, use vUSDC as collateral on Protocol B, borrow STRK, stake STRK on Protocol C, receive liquid staking token, provide liquidity on Ekubo with the liquid staking token.',
      scenario: 'The user earns a combined 18% APY from the stack vs 5.8% from Vesu alone. They consider this a major yield improvement.',
      outcome: 'Protocol count: 4 (Vesu, Protocol B, staking Protocol C, Ekubo). Each protocol has independent smart contract risk. A critical exploit in Protocol B collapses the entire stack — vUSDC collateral stolen means the borrow position defaults, staked STRK has no underlying, LP position becomes worthless. The 12.2% extra APY (18% - 5.8%) on $20,000 = $2,440/year of extra income. If the four-protocol stack has combined 8% annual exploit probability vs Vesu\'s 1% alone, the risk premium demanded should be far higher than $2,440/year.',
    },
  ],
  keyTakeaway: 'Each protocol you add to a stack roughly adds its own exploit probability to your total combined risk — the yield premium from stacking must exceed the expected annual loss from the increased combined failure probability.',
  guidedPractice: [
    {
      question: 'USDC supply APY on Vesu: 5.5%. USDC borrow APY: 8.2%. Is looping USDC (borrow USDC and re-supply USDC) yield-positive?',
      options: [
        'A. Yes — looping always amplifies yield',
        'B. No — each loop borrows at 8.2% to earn 5.5%. Net cost per loop: 2.7%. Looping USDC here is yield-negative.',
        'C. Yes, but only for the first loop — subsequent loops break even',
        'D. Yes — the supply APY compounds while borrow APY does not',
      ],
      correct: 1,
      hint: 'Net yield per loop = supply APY - borrow APY. What is the sign of this number?',
      explanation: 'B is correct. Each loop borrows at 8.2% and re-supplies at 5.5%. Net: 5.5% - 8.2% = -2.7% per loop. Every additional loop reduces net yield. USDC looping is only yield-positive when borrow APY < supply APY — the opposite of what is shown here. This condition occurs rarely and briefly when utilisation spikes and supply APY temporarily exceeds borrow APY.',
    },
    {
      question: 'You stack four DeFi protocols. Each individually has a 1.5% annual probability of a critical exploit. What is the approximate combined probability that at least one protocol is exploited in a year?',
      options: [
        'A. 1.5% — only the weakest link matters',
        'B. 6% — approximately 4 × 1.5%, the additive probability',
        'C. 0.375% — it gets safer as you diversify',
        'D. 100% — four protocols means certain exploit',
      ],
      correct: 1,
      hint: 'For independent risks, the probability that at least one occurs is approximately the sum of individual probabilities (for small probabilities).',
      explanation: 'B is correct. For four independent protocols each with 1.5% annual exploit probability, the probability that at least one is exploited: 1 - (1-0.015)^4 = 1 - 0.942 = 5.8% ≈ 6%. This quadruples your exploit exposure compared to a single protocol. The extra yield from the stack must compensate for this 4.5× increase in risk.',
    },
    {
      question: 'What is a delta-neutral strategy and why might an investor use one?',
      options: [
        'A. A strategy that earns exactly 0% yield — neutral return',
        'B. A strategy where long and short positions cancel price exposure, allowing the investor to earn protocol yield without directional price risk',
        'C. A strategy using only stablecoins — no volatile asset exposure',
        'D. Delta-neutral means equal amounts in every protocol — maximum diversification',
      ],
      correct: 1,
      hint: '"Delta" in options/derivatives means sensitivity to price movements. "Neutral" means zero. What does combining these mean?',
      explanation: 'B is correct. Delta-neutral means the net price exposure of the position is zero — gains from rising prices are offset by losses from the short, and vice versa. The investor earns yield from the DeFi protocols (supply APY, borrow spread) without caring whether STRK or ETH goes up or down. Institutional DeFi participants use delta-neutral strategies to extract DeFi yield without taking directional crypto price bets.',
    },
    {
      question: 'You want to earn higher LP fees by providing more liquidity than you own. Which strategy achieves this?',
      options: [
        'A. Provide LP tokens to multiple pools simultaneously',
        'B. Leveraged LP: deposit collateral to Vesu, borrow additional capital, deploy all capital (owned + borrowed) into an Ekubo LP position',
        'C. Concentrated liquidity with a very tight range (same capital but appears larger)',
        'D. Join a whale-coordinated LP pool that fronts additional capital',
      ],
      correct: 1,
      hint: 'Which approach actually increases the total capital deployed to the LP pool?',
      explanation: 'B is correct. Leveraged LP borrows additional capital from a lending protocol and adds it to your LP position. If you own $10,000 and borrow $5,000, you provide $15,000 to the LP pool — earning 50% more fees from the same owned capital. The risk: IL and liquidation both scale with the full $15,000 position while only $10,000 is your own equity. Out-of-range movement on a leveraged LP position can trigger liquidation much faster than an unlevered position.',
    },
    {
      question: 'When is adding composability to a DeFi strategy justified?',
      options: [
        'A. Always — more composability always generates more yield',
        'B. When the additional yield from the new layer meaningfully exceeds the additional risk premium required for the new protocol\'s exploit probability',
        'C. When the protocol offering the new composability layer is more than 12 months old',
        'D. Composability is never justified — simple positions are always better',
      ],
      correct: 1,
      hint: 'Each new protocol layer adds yield AND risk. When does the yield addition outweigh the risk addition?',
      explanation: 'B is correct. Composability is justified when the incremental yield exceeds the incremental risk cost. A new protocol layer adding 3% extra APY but increasing combined exploit probability by 5% (annualised expected loss = 5% × capital) is not justified. A layer adding 3% APY to a well-audited protocol increasing exploit probability by only 0.5% might be. The calculation is explicit: incremental yield vs expected incremental loss from the new risk.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have $30,000 USDC. Design three portfolio configurations: (A) Simple: $30K in Vesu at 5.8% APY. (B) One-loop: Deposit $30K, borrow $18K USDC at 7.5% APY (60% LTV), re-supply to Vesu. (C) Two-loop: deposit $48K to Vesu, borrow $28.8K more, re-supply. For each: net annual yield in dollars, health factor, and combined smart contract risk assessment.',
      scoringCriteria: [
        'Config A: yield = $30K × 5.8% = $1,740. HF = N/A (no borrow). Risk: 1 protocol.',
        'Config B: supply = $48K × 5.8% = $2,784. Borrow cost = $18K × 7.5% = $1,350. Net = $1,434 — less than A. HF = ($48K × 0.83) / $18K = 2.21. Risk: worse yield, same protocol.',
        'Config C: supply = $76.8K × 5.8% = $4,454. Borrow = $46.8K × 7.5% = $3,510. Net = $944 — less than A and B. Risk: deep in negative-spread territory.',
        'Conclusion: looping USDC at current rates destroys value at every loop. Config A is optimal.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'An investor runs a four-protocol stack earning 19% APY on $25,000. Their single-protocol Vesu position earns 5.8% APY. Calculate: (1) annual income difference, (2) assuming protocols 2-4 each have 2% annual exploit probability (Protocol 1 Vesu = 0.8%), combined exploit probability, (3) expected annual loss from combined exploit risk, (4) whether the 13.2% extra APY is adequate compensation.',
      scoringCriteria: [
        'Income difference: $25K × (19% - 5.8%) = $3,300/year extra',
        'Combined exploit probability: 1 - (1-0.008)(1-0.02)(1-0.02)(1-0.02) = 6.55%',
        'Expected annual loss: 6.55% × $25,000 = $1,637 (if exploit = total loss)',
        'Net risk-adjusted extra income: $3,300 - $1,637 = $1,663/year',
        'Assessment: if risk-adjusted, the extra 13.2% APY represents only $1,663/year of real value after expected loss. This is a meaningful but not overwhelming premium. Position size and exit plan matter.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A junior DeFi analyst says: "I built a strategy earning 22% APY by stacking five protocols together." Your senior colleague says: "That might actually be worth less than a boring 6% position." Explain the colleague\'s reasoning in 3 sentences without using "smart contract risk" or "composability."',
      scoringCriteria: [
        'Explains: five protocol dependencies means five separate ways to lose everything — any one failure collapses the entire stack',
        'Quantifies: at 2% annual failure probability per protocol, five protocols gives approximately 10% combined failure probability — meaning 10% chance of losing the full principal each year',
        'Conclusion: 22% gross APY minus 10% expected loss rate = approximately 12% risk-adjusted APY — better than 6% but by far less than the 22% headline suggests',
      ],
    },
  ],
},

];  // end LAB6_LESSONS_1_TO_4
