// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// SENIOR · LAB 10 — INSTITUTIONAL DEFI OPERATIONS
// ALL LESSONS + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Written to: lesson_writing_instructions.txt v1.0 + sim_instructions_v3.md
// Build task: Prescribed — Senior level (Section 20.3)
// Portfolio push: Lab 10 Phase 2 Boss. Portfolio defense required (Lab 3+ rule).
// Simulator assessment:
//   Lesson 1 (Treasury) → starkzap-treasury-allocator ✓
//   Lesson 2 (Tax/Compliance) → judgment only, no simulator
//   Lesson 3 (Position management) → starkzap-correlation-manager ✓
//   Lesson 4 (Protocol risk at scale) → judgment only
//   Lesson 5 (DeFi operations) → judgment only

export const LAB10_ALL_LESSONS = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — Treasury Management
// Dominant concept: a DeFi treasury allocation uses
// risk-adjusted yield as its primary sorting metric —
// raw APY without risk normalisation leads to concentration
// in high-yield/high-risk positions that destroy the portfolio
// in a single event.
// ─────────────────────────────────────────────────────────────
{
  id: 'treasury-management',
  title: 'Treasury Management: Risk-Adjusted Yield at Scale',

  explanation: `
In November 2022, Alameda Research — a crypto trading firm that managed billions of dollars — collapsed. Among the reasons disclosed during the subsequent bankruptcy proceedings was a treasury management structure that concentrated an enormous share of assets in illiquid, high-risk positions. The firm had optimised for maximum nominal return without accounting for the fact that those positions could not be exited in an emergency. When a liquidity crisis hit, assets that showed positive accounting values could not be converted to cash. The balance sheet was technically healthy; the treasury was not.

A DeFi treasury at any scale — $50,000 or $5,000,000 — faces a structurally similar challenge: the highest-APY opportunities are almost always the highest-risk ones, and concentrating in them without a framework for risk-adjusted comparison makes the portfolio appear more profitable than it actually is.

The metric that corrects for this is Sharpe ratio applied to yield. The Sharpe ratio measures the return per unit of risk — specifically, how much excess return you receive above a risk-free baseline for each unit of volatility you accept. In traditional finance, this is used for securities. In DeFi, the principle transfers directly: a 22% APY position with high IL risk and a $5M unaudited protocol may generate less real return per unit of risk than a 9% APY position on a well-audited protocol with stable pairs. The formula: Sharpe = (yield − risk-free rate) / risk. Estimating DeFi risk requires combining protocol maturity, smart contract audit status, oracle type, liquidity depth, and track record.

A treasury allocation framework adds one more layer: concentration limits. No single protocol should hold more than a defined threshold of total treasury — typically 20–30% for intermediate-size treasuries. No single asset should represent more than 40–50%. These limits exist because DeFi protocol failures tend to be binary and simultaneous: when a protocol is exploited, all depositors lose proportionally in the same transaction. Concentration risk in DeFi is not a statistical distribution — it is an all-or-nothing event.

A treasury of $200,000 applied to Starknet's DeFi stack might look like: 30% in Vesu USDC supply (stable yield, low risk, high liquidity), 25% in Ekubo ETH/USDC LP (moderate IL risk, strong audit history), 20% in STRK staking (protocol-native, low smart contract risk), 15% in Vesu wBTC supply (moderate yield, low liquidity in exit), 10% in a higher-yield experimental protocol. The 10% experimental allocation can be completely wiped out without destroying the treasury — that is the purpose of the limit.
  `.trim(),

  visualPrompt: 'Two-column comparison. Left: "Raw APY Sort" — five protocol bars sorted by APY from highest to lowest. Bar 1: unaudited new protocol 45% APY, full allocation. Risk annotation: "One exploit = −45% of treasury." Right: "Risk-Adjusted Allocation" — same five protocols, sized by risk-adjusted yield. Smaller allocation to high-APY/high-risk, larger allocation to moderate-APY/low-risk. Annotation: "Worst case loss: −10% of treasury (experimental allocation only)." Below: concentration limit table: max 30% per protocol, max 50% per asset.',
  visualType: 'static',
  visualUrl: 'treasury-risk-adjusted-allocation',

  examples: [
    {
      contextTag: '[Concentration risk, protocol exploit wipes concentrated position]',
      context: 'A DeFi operator manages a $300,000 treasury. They allocated $180,000 (60%) to a single yield aggregator showing 28% APY. The remaining $120,000 was split across five other protocols.',
      scenario: 'The yield aggregator is exploited via a reentrancy vulnerability. All depositors lose their full balance in a single transaction.',
      outcome: 'The operator loses $180,000 — 60% of the treasury — in one event. The six remaining positions are intact and worth $120,000. If the operator had applied a 25% concentration limit, the maximum loss from a single protocol failure would have been $75,000 (25%) — still a serious loss, but not treasury-destroying. The 60% concentration turned a smart contract risk into an existential treasury risk.',
    },
    {
      contextTag: '[Risk-adjusted yield calculation, Sharpe applied to two DeFi positions]',
      context: 'A treasury manager is choosing between two Starknet positions: (A) Vesu USDC supply — 9.5% APY, mature protocol, comprehensive audit, TWAP oracle, stable pair collateral. Estimated Sharpe (vs 5% risk-free): (9.5 − 5) / low_risk ≈ 1.8. (B) New STRK/ETH LP on an unaudited protocol — 32% APY, no audit, spot oracle, high IL. Estimated Sharpe: (32 − 5) / high_risk ≈ 0.6.',
      scenario: 'The manager evaluates both on risk-adjusted yield rather than raw APY.',
      outcome: 'Position A has a higher Sharpe despite lower APY. Per unit of risk, it generates more real return. Position B\'s 32% APY looks attractive but the high risk denominator — protocol immaturity, no audit, spot oracle, IL — reduces the Sharpe significantly. The manager allocates 30% to Position A and 8% to Position B (within the experimental limit), rather than chasing the 32% headline.',
    },
    {
      contextTag: '[Treasury allocation framework, five-position portfolio, concentration limits applied]',
      context: 'A DeFi fund manager constructs a $500,000 treasury allocation for Starknet DeFi. They apply a 25% single-protocol concentration limit and a 45% single-asset concentration limit.',
      scenario: 'They evaluate seven protocols and select five, sizing each by risk-adjusted yield.',
      outcome: 'Final allocation: Vesu USDC supply $125,000 (25% — at limit, low risk), STRK staking $100,000 (20%), Ekubo ETH/USDC LP $100,000 (20%), Vesu wBTC supply $75,000 (15%), new protocol yield boost $50,000 (10%), USDC reserve $50,000 (10%). USDC total (Vesu + reserve): $175,000 = 35% — within 45% single-asset limit. No protocol exceeds 25%. Worst-case single protocol failure: −$125,000 (Vesu) = 25% portfolio loss — painful but survivable.',
    },
  ],

  keyTakeaway: 'A DeFi treasury applies risk-adjusted yield rather than raw APY as its primary allocation metric, combined with single-protocol concentration limits, so that a single protocol failure cannot destroy the treasury.',

  guidedPractice: [
    {
      question: 'A treasury has $400,000. Protocol A offers 35% APY — no audit, new protocol. Protocol B offers 11% APY — well-audited, 2-year history. A 20% concentration limit applies. What is the maximum allocation to Protocol A?',
      options: [
        'A. $400,000 — the highest APY protocol should get the most capital',
        'B. $80,000 (20%) — the concentration limit applies regardless of APY',
        'C. $200,000 — 50% is the standard limit for high-yield protocols',
        'D. $0 — unaudited protocols should receive no treasury allocation',
      ],
      correct: 1,
      hint: 'The concentration limit is a hard ceiling. Apply 20% to the total treasury regardless of how attractive the APY appears.',
      explanation: 'B is correct. The 20% concentration limit applies to all protocols regardless of APY. $400,000 × 20% = $80,000 maximum to Protocol A. The limit exists specifically because high-APY opportunities are often high-risk — and a protocol failure is binary, not gradual. Option A confuses optimal APY with optimal allocation. Option D is too conservative — small allocations to unaudited protocols are a legitimate risk management tool when bounded.',
    },
    {
      question: 'Two positions: Position X — 18% APY, Sharpe 0.4. Position Y — 9% APY, Sharpe 1.6. Which has better risk-adjusted yield and should receive a larger allocation?',
      options: [
        'A. Position X — 18% APY is double Position Y\'s yield',
        'B. Position Y — a Sharpe of 1.6 means it generates far more return per unit of risk than Position X at 0.4',
        'C. They are equal — APY and Sharpe offset each other',
        'D. Position X — Sharpe ratio is irrelevant for DeFi positions',
      ],
      correct: 1,
      hint: 'Sharpe measures return per unit of risk. Which position generates more return for each unit of volatility or risk accepted?',
      explanation: 'B is correct. Position Y\'s Sharpe of 1.6 versus Position X\'s 0.4 means Y generates 4× more return per unit of risk. Despite lower raw APY, Position Y is the better treasury allocation on a risk-adjusted basis. Position X\'s 18% APY is absorbing a much larger risk denominator — the kind that leads to correlated drawdowns or binary protocol failures. A treasury optimised for Sharpe will allocate more to Y and less to X.',
    },
    {
      question: 'A $250,000 treasury has: Protocol A $70K, Protocol B $60K, Protocol C $50K, Protocol D $40K, Protocol E $30K. Protocol A is exploited and fully drained. What percentage of the treasury is lost?',
      options: [
        'A. 100% — a protocol exploit always drains the entire treasury',
        'B. 28% — $70,000 / $250,000',
        'C. 0% — only Protocol A users are affected',
        'D. 50% — DeFi exploits always spread to related protocols',
      ],
      correct: 1,
      hint: 'Protocol exploits are isolated — only funds in that protocol are at risk. Calculate $70K as a percentage of $250K.',
      explanation: 'B is correct. A protocol exploit drains only the funds deposited in that specific protocol. $70,000 / $250,000 = 28% loss. The remaining $180,000 across Protocols B–E is unaffected. This is the mathematical argument for concentration limits: a 25% limit on Protocol A would have capped this loss at 25% rather than 28%, and also forces diversification that typically means no single protocol holds as much as the largest allocation here.',
    },
    {
      question: 'A treasury applies a 45% single-asset limit. Current allocation: $100K in USDC on Vesu, $80K in USDC reserve, $120K in ETH-denominated positions. Total USDC: $180K of $300K total. Is the USDC allocation within the limit?',
      options: [
        'A. Yes — $180K / $300K = 60%, which exceeds the 45% limit',
        'B. No — $180K / $300K = 60%, which exceeds the 45% limit',
        'C. Yes — the limit only applies to individual protocols, not assets',
        'D. No — the limit applies only to STRK holdings',
      ],
      correct: 1,
      hint: 'The single-asset limit applies to all holdings of a given asset across all protocols. Calculate total USDC as a percentage of total treasury.',
      explanation: 'B is correct. Total USDC: $100K + $80K = $180K. Total treasury: $300K. $180K / $300K = 60% — exceeds the 45% single-asset limit. The USDC allocation needs to be reduced by approximately $45K or the treasury needs to grow the non-USDC positions proportionally. The single-asset limit protects against stablecoin de-peg risk affecting too large a share of the portfolio.',
    },
    {
      question: 'A DeFi treasury of $600,000 needs to generate 15% APY to meet its obligations. Available opportunities: Vesu USDC 10% (Sharpe 1.8), Ekubo LP 18% (Sharpe 1.1), STRK staking 9% (Sharpe 2.1), experimental protocol 40% (Sharpe 0.3). Using a 25% concentration limit, design an allocation that averages ≥15% APY while applying the limit. Is it achievable?',
      options: [
        'A. Not achievable — 15% requires concentrating in the experimental protocol which violates the limit',
        'B. Achievable: 25% experimental ($150K × 40%) + 25% Ekubo ($150K × 18%) + 25% Vesu ($150K × 10%) + 25% staking ($150K × 9%) = weighted APY = (40+18+10+9)/4 = 19.25% average — exceeds 15%',
        'C. Achievable but only with 50% in the experimental protocol',
        'D. Not achievable — 15% requires more than 25% in any single high-yield protocol',
      ],
      correct: 1,
      hint: 'Apply the 25% limit to all four protocols simultaneously. Calculate the weighted average APY across equal 25% allocations.',
      explanation: 'B is correct. With 25% in each: weighted APY = (40% + 18% + 10% + 9%) / 4 = 19.25% — comfortably above 15%. The constraint is satisfied: no protocol exceeds 25%. The 15% target is achievable without violating concentration limits. Option A is incorrect — the equal 25% split reaches 19.25% even without further concentration in the experimental protocol.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Treasury dashboard: Protocol A — Vesu USDC, $90K allocated, 10.5% APY, Sharpe 1.7, audit 3 months ago, TWAP oracle. Protocol B — Ekubo STRK/USDC LP, $75K allocated, 22% APY, Sharpe 0.8, audit 8 months ago, estimated IL 6% annually. Protocol C — New yield protocol, $30K allocated, 38% APY, Sharpe 0.4, unaudited, spot oracle. Protocol D — STRK staking, $55K allocated, 8.8% APY, Sharpe 2.2, protocol-native. Total: $250K. Evaluate: (1) is concentration within limits (25% max per protocol), (2) which protocol should have a reduced allocation based on risk-adjusted yield, (3) what is the portfolio-weighted APY?',
      scoringCriteria: [
        'Concentration check: A = 36% — EXCEEDS 25% limit. B = 30% — EXCEEDS limit. C = 12% — within. D = 22% — within. Two violations.',
        'Reduction target: Protocol A and B both exceed 25%. Each should be reduced to $62,500 max. The freed capital should be redistributed to D (highest Sharpe 2.2) or C if experimental budget allows.',
        'Weighted APY: ($90K × 10.5% + $75K × 22% + $30K × 38% + $55K × 8.8%) / $250K = ($9,450 + $16,500 + $11,400 + $4,840) / $250K = $42,190 / $250K = 16.88%.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi fund managing $500,000 across Starknet is presented with a new opportunity: an unaudited protocol launching next week with 55% APY, backed by a known team, no exploits in their previous protocol. Existing portfolio: 28% Vesu USDC, 24% Ekubo LP, 20% STRK staking, 18% wBTC lending, 10% existing experimental. 25% concentration limit. Should the fund participate, at what maximum size, and what existing position should be reduced to make room?',
      scoringCriteria: [
        'Can participate: yes, within the experimental budget. Current experimental = $50K (10%). Adding more increases experimental concentration.',
        'Maximum new allocation: concentration limit 25% = $125K max. But existing 10% experimental should be counted. New protocol max = 25% − existing experimental % if treating them as one category, or 25% standalone if treating separately. Most conservative: new protocol gets 10–15% ($50–75K).',
        'Position to reduce: the Vesu allocation at 28% exceeds the 25% limit — this should be reduced to 25% ($125K) regardless, freeing $15K. That reduction can fund the new protocol.',
        'Risk note: unaudited protocol warrants a reduced allocation versus the full 25% limit — 10% ($50K) is appropriate given no audit history.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'The fund\'s CIO asks: "Protocol X is showing 45% APY. Why are we only allocating 15% of the treasury to it? The math says we should put everything in." Respond in 4 sentences using the risk-adjusted framework, the concentration limit rationale, and one concrete calculation.',
      scoringCriteria: [
        'Risk-adjusted argument: 45% APY does not account for the risk denominator. A lower Sharpe means the APY overstates the real return per unit of risk taken.',
        'Concentration limit rationale: DeFi protocol failures are binary — if Protocol X is exploited, 100% allocation means 100% loss. A 15% allocation limits maximum loss to 15% of the treasury from this single event.',
        'Concrete calculation: at 15% allocation on $500K = $75K. If Protocol X fails, loss = $75K (15%). At 100% allocation, loss = $500K (100%). The expected value of diversification versus concentration depends on the probability of exploit — and for an unaudited protocol, that probability is non-trivial.',
        'Conclusion: the treasury goal is sustainable yield generation, not maximum point-in-time APY. Concentration risk in DeFi is existential, not statistical.',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-treasury-allocator',
    title: 'Treasury Allocation Tool',
    instructionText:
      'Build a $300,000 treasury allocation. Add positions until the portfolio is fully deployed. ' +
      'Observe when concentration limits are breached. Find the allocation that maximises risk-adjusted yield while staying within limits.',
    completionCriteria: [
      'User has deployed the full $300,000 across at least 4 protocols',
      'User has triggered a concentration limit warning',
      'User has corrected the allocation to stay within limits',
      'User has observed the weighted risk-adjusted yield output',
    ],
  },
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Tax and Compliance Awareness
// Dominant concept: every DeFi action that changes your
// economic position is a potentially taxable event in most
// jurisdictions — and the record you need for compliance
// is the one generated at transaction time, not retroactively.
// ─────────────────────────────────────────────────────────────
{
  id: 'tax-compliance-awareness',
  title: 'Tax and Compliance: What DeFi Generates and When',

  explanation: `
In 2023, the US Internal Revenue Service sent letters to over 10,000 cryptocurrency holders requesting information about unreported DeFi income. Several recipients were surprised to learn that yield they had reinvested immediately — never withdrawing to a bank account — was considered taxable income in the year it was received. The IRS position: a token received as a reward has fair market value at the moment of receipt. That value is income, regardless of what you do with it next.

This is the foundational principle of DeFi tax exposure in most major jurisdictions. A taxable event does not require cash leaving your wallet to a bank. It requires a change in your economic position that results in a gain or receipt of value.

The most commonly misunderstood taxable events in DeFi are: yield receipts (receiving STRK staking rewards, Vesu interest, or Ekubo fee distributions), swaps (exchanging one token for another is treated as a disposal of the first token in most jurisdictions — if STRK has appreciated since you received it, the swap generates a capital gain), liquidity provision exits (withdrawing from a pool at a different ratio than you deposited is treated as a disposal of the difference in most frameworks), and liquidations (a forced sale of your collateral is a disposal event — even if it was involuntary).

The challenge is practical, not theoretical. A user who ran a DCA strategy from Lab 5 for 12 months executed 52 weekly buys of STRK with USDC. Each buy is a separate disposal of USDC (if USDC has a cost basis different from $1.00, which is common in periods of de-peg risk). Each staking reward received is income at the spot price at time of receipt. Constructing a complete tax record retroactively from on-chain data is possible but time-consuming. Generating it as transactions occur — using a transaction log or on-chain analytics tool — is the practical standard.

The compliance record required is: timestamp, transaction type (swap/yield/LP entry/LP exit/liquidation), asset in, asset out, amount, USD value at time of event, and resulting gain or income. This record is what tax authorities in most jurisdictions request. Starknet's public transaction history means all of this is verifiable on-chain — which also means tax authorities can verify it independently of your records.

This lesson does not constitute tax advice. Jurisdictional rules vary significantly and change frequently. Consult a qualified tax professional for your specific situation.
  `.trim(),

  visualPrompt: 'Transaction type table with five rows. Column headers: Action, Taxable Event?, Tax Category, Record Required. Row 1: Swap STRK → USDC — Yes — Capital gain/loss on STRK disposal — Cost basis of STRK, sale price, date. Row 2: Receive staking rewards — Yes — Ordinary income — Spot price at receipt, amount, date. Row 3: LP deposit — Depends on jurisdiction — Potential disposal of tokens — Track ratio, date, values. Row 4: LP withdrawal — Yes if ratio changed — Capital gain on difference — Entry and exit values, impermanent loss. Row 5: Liquidation — Yes — Involuntary disposal — Collateral value at liquidation, cost basis. Footer: "Record every transaction at time of event. Retroactive reconstruction is possible but costly."',
  visualType: 'static',
  visualUrl: 'defi-taxable-events-table',

  examples: [
    {
      contextTag: '[Staking rewards as income, immediate tax liability regardless of reinvestment]',
      context: 'A DeFi user stakes 10,000 STRK and earns 880 STRK in rewards over 12 months (8.8% APY). They reinvest all rewards immediately into the staking pool. STRK price at reward receipt: averaging $0.78 per STRK over the year.',
      scenario: 'They ask their accountant whether the reinvested rewards are taxable income.',
      outcome: 'In most major jurisdictions: yes. The 880 STRK received as rewards had a fair market value of 880 × $0.78 = $686 at time of receipt. That $686 is taxable income in the year earned, regardless of reinvestment. The reinvested rewards also establish a new cost basis: each reward tranche has a cost basis equal to its value at the time of receipt ($0.78 per STRK). If the user later sells those STRK at $1.20, the capital gain is ($1.20 − $0.78) × 880 = $369. Both the income event and the future capital gain exist.',
    },
    {
      contextTag: '[Swap as taxable disposal, cost basis tracking, capital gain on appreciation]',
      context: 'A DeFi user bought 5,000 STRK at $0.60 (cost basis $3,000 total). Six months later, STRK is $0.95. They swap all 5,000 STRK for USDC via AVNU.',
      scenario: 'They calculate their tax liability from the swap.',
      outcome: 'The swap is a disposal of 5,000 STRK. Proceeds: 5,000 × $0.95 = $4,750. Cost basis: $3,000. Capital gain: $4,750 − $3,000 = $1,750. In most jurisdictions, this is a short-term capital gain (held under 1 year) taxed at ordinary income rates, or long-term if held over 1 year. The fact that the user immediately deployed the USDC into a DeFi protocol does not defer or eliminate the gain. The disposal event occurred at the moment of swap.',
    },
    {
      contextTag: '[Transaction record generation, DCA strategy, volume of taxable events]',
      context: 'A DeFi user ran a DCA strategy for 12 months: weekly $50 USDC → STRK purchases via AVNU (52 transactions). They also claimed staking rewards monthly (12 events) and performed 8 portfolio rebalancing swaps.',
      scenario: 'They prepare to file their annual tax return and assess the scope of their reporting requirement.',
      outcome: 'Total taxable events: 52 DCA purchases (each is a USDC disposal if USDC has a non-$1 cost basis), 12 staking reward receipts (income events), 8 rebalancing swaps (capital gain/loss events from token disposals). Total: up to 72 separate reportable events. Each requires: date, token in, token out, amounts, USD values at transaction time. All data is available on the Starknet blockchain and retrievable via Voyager or analytics tools. Generating this record quarterly rather than annually reduces year-end preparation time from hours to minutes.',
    },
  ],

  keyTakeaway: 'Every DeFi action that changes your economic position — swap, yield receipt, LP exit, liquidation — is a potentially taxable event requiring a transaction record generated at the time of the action, not retroactively.',

  guidedPractice: [
    {
      question: 'You receive 200 STRK as staking rewards when STRK is $0.85. You immediately re-stake the rewards. Is this a taxable event?',
      options: [
        'A. No — you did not sell anything or receive cash',
        'B. Yes — in most jurisdictions, receiving token rewards generates taxable income at fair market value at time of receipt, regardless of what you do next',
        'C. Only if you later sell the 200 STRK for more than $0.85',
        'D. No — re-staking is the same as not receiving the rewards',
      ],
      correct: 1,
      hint: 'The taxable event is receiving value, not converting it to cash. What is the fair market value of 200 STRK at $0.85?',
      explanation: 'B is correct. Receiving 200 STRK at $0.85 generates $170 of ordinary income in most major jurisdictions. The re-staking action is irrelevant to the income event — it merely establishes a new cost basis of $0.85 per STRK for those 200 tokens. A subsequent sale above $0.85 generates an additional capital gain on top of the already-recognised income.',
    },
    {
      question: 'You swapped 10,000 STRK for USDC when STRK was $0.92. Your cost basis for those STRK was $0.71. What is the capital gain?',
      options: [
        'A. $0 — the swap was a like-for-like exchange',
        'B. $2,100 — (0.92 − 0.71) × 10,000',
        'C. $9,200 — the full proceeds are taxable',
        'D. Only taxable if you withdraw the USDC to a bank',
      ],
      correct: 1,
      hint: 'Capital gain = proceeds minus cost basis. The proceeds are the USDC received (at the STRK price at time of swap), not the cash you convert it to later.',
      explanation: 'B is correct. Proceeds: 10,000 × $0.92 = $9,200. Cost basis: 10,000 × $0.71 = $7,100. Capital gain: $9,200 − $7,100 = $2,100. This gain exists at the moment of the swap, not when USDC is later converted. Option A confuses different assets (STRK and USDC are not like-for-like). Option D is incorrect — the taxable event is the disposal of STRK, not the withdrawal of proceeds.',
    },
    {
      question: 'Which of the following DeFi actions does NOT typically generate a taxable event?',
      options: [
        'A. Receiving USDC interest from Vesu lending',
        'B. Swapping STRK for ETH via AVNU',
        'C. Transferring USDC from your Starknet wallet to your Ethereum wallet (same owner, no swap)',
        'D. Receiving Ekubo LP fee distributions in USDC',
      ],
      correct: 2,
      hint: 'A taxable event requires a change in economic position — a gain, loss, or income receipt. Does moving an asset between two wallets you own change your economic position?',
      explanation: 'C is correct. Transferring an asset between wallets you own (same beneficial owner) is generally not a taxable event — there is no disposal, no gain or loss, no income received. The asset remains yours; only its location changes. Options A and D are income events. Option B is a disposal event (capital gain or loss on STRK).',
    },
    {
      question: 'A forced liquidation closes your wBTC collateral position when wBTC was $65,000. Your cost basis for the liquidated wBTC was $52,000. Is this a taxable event?',
      options: [
        'A. No — liquidations are involuntary and therefore non-taxable',
        'B. Yes — a liquidation is a forced disposal of the asset. The gain ($65,000 − $52,000 = $13,000 per wBTC) is typically taxable as a capital gain',
        'C. Only if you chose to be liquidated',
        'D. No — the wBTC was used as collateral, not sold',
      ],
      correct: 1,
      hint: 'Does the voluntary/involuntary nature of a disposal change whether economic value changed hands? Consider what happened to your wBTC.',
      explanation: 'B is correct. A liquidation transfers your wBTC to the liquidator in exchange for repayment of your debt. In most jurisdictions, this is treated as a disposal of the asset at its fair market value at the time of liquidation. The $13,000 gain per wBTC is typically taxable regardless of whether the disposal was voluntary. This is one of the more surprising tax consequences in DeFi — an adverse financial event (liquidation) can generate a taxable gain.',
    },
    {
      question: 'You made 48 taxable DeFi transactions this year — swaps, yield receipts, LP exits. What is the minimum information required for each transaction in a tax-compliant record?',
      options: [
        'A. Just the total annual profit',
        'B. Timestamp, transaction type, asset in, asset out, amounts, USD value at time of event, resulting gain or income',
        'C. Only swap transactions require records — yield is automatically tracked by protocols',
        'D. The wallet address and total portfolio value at year end',
      ],
      correct: 1,
      hint: 'Tax authorities need to verify each transaction independently. What information allows them to calculate gain/loss on each event?',
      explanation: 'B is correct. Each taxable transaction requires a complete record: when it happened (timestamp), what type of event (swap/yield/LP exit), what assets moved, in what amounts, and what their USD value was at the moment of the transaction. Without the USD value at transaction time, cost basis and gain/loss cannot be calculated. The Starknet blockchain preserves all of this — but retrieving and organising it is the user\'s responsibility.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Transaction log for Q3: (1) Jul 3 — received 450 STRK staking rewards, STRK price $0.82. (2) Aug 12 — swapped 2,000 STRK (cost basis $0.71) for USDC at $0.88/STRK. (3) Sep 8 — LP withdrawal from Ekubo: deposited $5,000 ETH + $5,000 USDC at entry; withdrew $4,200 ETH + $5,900 USDC at exit (ETH price unchanged). Calculate: (1) total taxable income from staking, (2) capital gain from the STRK swap, (3) whether the LP exit is a taxable event and its approximate gain/loss.',
      scoringCriteria: [
        'Staking income: 450 × $0.82 = $369 ordinary income.',
        'Swap capital gain: 2,000 × ($0.88 − $0.71) = 2,000 × $0.17 = $340.',
        'LP exit: deposited $10,000 total, received $10,100 total ($4,200 + $5,900). Net gain $100. ETH price unchanged means the $800 ETH reduction and $900 USDC increase constitutes a disposal of ETH at current price, generating a small gain on the ETH-to-USDC conversion. Exact treatment depends on jurisdiction — the net economic gain of $100 is the starting point.',
        'Total Q3 taxable: $369 income + $340 capital gain + ~$100 LP gain = ~$809 gross.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi operator has been active for 18 months across Starknet and Ethereum. They have no transaction records — they planned to retrieve everything from the blockchain at year end. They have: 240 swap transactions, 36 staking reward claims, 18 LP entries and exits, 3 liquidations. Assess the record retrieval risk: what information is retrievable from on-chain data, what may be difficult to reconstruct, and what is the practical risk of the "retrieve later" approach.',
      scoringCriteria: [
        'Retrievable: timestamps, transaction hashes, asset types, amounts — all on-chain and verifiable via Starknet and Ethereum explorers',
        'Difficult to reconstruct: USD values at time of transaction — requires historical price data at specific block timestamps, which may require third-party tools (CoinGecko historical API, Dune Analytics). For 297 events, this is feasible but time-consuming.',
        'Practical risk: historical price feeds may have gaps or inaccuracies for low-liquidity tokens. Reconstructing cost basis for tokens received via LP distributions requires knowing the exact token ratios at each claim. The "retrieve later" approach works but adds significant reconstruction complexity and cost.',
        'Recommendation: use a DeFi tax tracking tool (Koinly, Cointracker, or on-chain analytics) that captures USD values at transaction time. Retroactive reconstruction is possible but should be an emergency fallback.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi user says: "I only owe taxes when I cash out to my bank account. I\'ve never withdrawn anything — all my profits are still in tokens." Explain in 3 sentences why this belief is incorrect in most jurisdictions, identify the specific events in their DeFi activity that generated taxable events, and state what record they should have been keeping.',
      scoringCriteria: [
        'Corrects the belief: in most jurisdictions, taxable events occur at the point of disposal (swap) or income receipt (staking rewards, LP fees) — not at the point of fiat withdrawal',
        'Specific events identified: every STRK → USDC swap was a taxable disposal of STRK; every staking reward received was ordinary income at spot value at receipt; every LP exit was a potential capital gain event',
        'Record required: timestamp, transaction type, asset in, asset out, USD value at time of event for each transaction — generated at transaction time, not at year-end withdrawal',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Advanced Position Management
// Dominant concept: correlated positions amplify drawdowns —
// two positions that decline together in the same macro
// scenario are not two risks, they are one concentrated risk
// expressed twice.
// ─────────────────────────────────────────────────────────────
{
  id: 'advanced-position-management',
  title: 'Advanced Position Management: Correlation and Drawdown Control',

  explanation: `
In June 2022, the crypto market fell sharply following the collapse of the Terra/Luna ecosystem. An investor who held both an ETH long position and a STRK/ETH LP position on Starknet discovered that both positions declined simultaneously: ETH fell 40%, which reduced the LP position's value and also generated IL as the AMM rebalanced. A position they had mentally counted as two separate exposures behaved as one correlated macro bet.

Correlation in a portfolio context means the tendency of two positions to move together. A correlation of 1.0 means they move identically. A correlation of 0.0 means they are independent. A correlation of −1.0 means they move in opposite directions. In a multi-position DeFi portfolio, correlation is not usually calculated mathematically — it is assessed qualitatively by asking: which macro event affects both positions in the same direction simultaneously?

For Starknet DeFi, the most common source of hidden correlation is ETH price exposure. Ekubo LP positions in ETH-paired pools, STRK positions that move with the crypto market, and wBTC collateral on Vesu all tend to decline in a crypto market downturn. A portfolio that holds three of these positions may appear diversified across three protocols — but has a single correlated risk: a broad crypto market sell-off.

Stop-loss equivalents in DeFi do not exist as automatic orders. No protocol allows you to say "close my LP position if ETH falls 20%." The equivalent is pre-defined exit criteria written before the position is opened: specific price levels, health factor thresholds, or time-based reviews that trigger a manual exit check. A multi-leg position — one that involves multiple protocols interacting, such as using an LP token as Vesu collateral to borrow and re-invest — requires exit criteria for each leg, specified in order: which leg to close first, what price triggers each close, and what the domino effect is if one leg is liquidated before you can exit the others.

Correlation monitoring in practice is weekly: observe whether your positions have moved in the same direction for the past 7 days. If yes, document whether this is consistent with your expected correlation model. If three supposedly uncorrelated positions all declined 8–12% in the same week, your portfolio is more correlated than designed and requires rebalancing toward genuinely uncorrelated positions such as stablecoin supply or STRK staking in a crypto downturn.
  `.trim(),

  visualPrompt: 'Two-panel portfolio diagram. Left: "Apparent Diversification — 3 Protocols" — three separate boxes labelled Ekubo ETH/USDC LP, Vesu wBTC collateral, STRK long. Each labelled as a different protocol. Right: "Hidden Correlation — 1 Macro Bet" — same three boxes connected by a single arrow labelled "crypto market downturn → all fall simultaneously." Red annotation: "3 protocol exposures, 1 correlated risk." Below: a correlation matrix with two assets — STRK staking (correlation 0.8 to crypto market), Vesu USDC supply (correlation 0.1 to crypto market). Green annotation: "USDC supply provides genuine decorrelation."',
  visualType: 'static',
  visualUrl: 'correlation-hidden-single-bet',

  examples: [
    {
      contextTag: '[Three positions, one correlated macro move, drawdown amplification]',
      context: 'A DeFi portfolio holds: $80,000 Ekubo STRK/USDC LP, $60,000 ETH staked via LST as Vesu collateral, $40,000 STRK long position. The investor considers these three separate positions.',
      scenario: 'A macro crypto sell-off occurs: STRK falls 35%, ETH falls 28%, USDC holds peg. They calculate total portfolio impact.',
      outcome: 'Ekubo STRK/USDC LP: STRK fell 35%, so the pool accumulated more STRK and less USDC. IL at 35% price change ≈ 8%. LP value ≈ $80,000 × (1 − 0.08) × (STRK weight-adjusted) = approximately $58,000 after market decline and IL. ETH LST collateral: $60,000 × 0.72 = $43,200 — health factor deteriorates. STRK long: $40,000 × 0.65 = $26,000. Total portfolio: ~$127,200 from $180,000 initial = 29% drawdown. All three positions moved in the same direction. The investor had three protocol exposures and one macro risk.',
    },
    {
      contextTag: '[Pre-defined exit criteria, multi-leg position, ordered exit sequence]',
      context: 'A DeFi operator runs a multi-leg position: $50,000 ETH/USDC Ekubo LP → LP tokens deposited as Vesu collateral → $25,000 USDC borrowed → USDC supplied to Vesu for additional yield. Three legs interacting.',
      scenario: 'They define exit criteria before opening the position.',
      outcome: 'Written exit criteria: Leg 3 (USDC supply) — exit if Vesu utilisation exceeds 95% (liquidity risk). Leg 2 (Vesu borrow) — exit if health factor drops to 1.3 (before approaching 1.0). Leg 1 (LP position) — exit if ETH price falls 20% from entry. Exit order: always close Leg 3 first (repay borrow), then Leg 2 (withdraw LP collateral from Vesu), then Leg 1 (withdraw LP and rebalance). The written sequence prevents the panic of deciding what to close first under pressure — the decision is already made.',
    },
    {
      contextTag: '[Correlation monitoring, weekly review, unexpected correlation discovered]',
      context: 'A portfolio manager reviews their weekly returns: Ekubo STRK/ETH LP: −11.2%. Vesu wBTC lending position: −9.8%. STRK staking: −8.5%. Vesu USDC supply: +0.2%.',
      scenario: 'They assess whether their correlation model matches their portfolio behaviour.',
      outcome: 'Three of four positions declined 8–11% in the same week. The intended diversification was: LP (moderate correlation to ETH), lending (BTC-correlated), staking (STRK-native). The weekly observation reveals that all three are effectively crypto-market-correlated — they move together in a risk-off event. The USDC supply position provided genuine decorrelation (+0.2%). The portfolio manager\'s response: reduce wBTC and STRK staking allocations, increase USDC supply allocation. The monitoring revealed a correlation problem before it became a crisis.',
    },
  ],

  keyTakeaway: 'Correlated positions amplify drawdowns — two positions that decline together in the same macro scenario are one concentrated risk expressed twice — and the defence is qualitative correlation assessment combined with pre-defined exit criteria written before positions are opened.',

  guidedPractice: [
    {
      question: 'A portfolio holds: STRK/ETH LP on Ekubo, ETH long on Extended perp, wBTC lending on Vesu. A broad crypto market decline occurs. How many of these positions are likely to decline simultaneously?',
      options: [
        'A. One — each is a different asset',
        'B. All three — each position has positive correlation to the overall crypto market and will decline in a broad sell-off',
        'C. None — DeFi positions are uncorrelated to market movements',
        'D. Two — the LP position is hedged by the USDC component',
      ],
      correct: 1,
      hint: 'Ask: which macro event affects all three in the same direction? A broad crypto decline affects ETH, BTC, and STRK simultaneously.',
      explanation: 'B is correct. All three positions have positive correlation to the crypto market: the LP position holds ETH and STRK (both fall), the perp long on ETH falls directly, and wBTC as collateral loses value as BTC falls. The USDC component of the LP provides partial buffer but not enough to prevent portfolio-wide decline. Three protocols, one macro risk.',
    },
    {
      question: 'Which of the following positions has the LOWEST correlation to a broad crypto market sell-off?',
      options: [
        'A. STRK/ETH LP on Ekubo',
        'B. 10× ETH long on Extended',
        'C. Vesu USDC/USDT supply',
        'D. wBTC held as collateral on Vesu',
      ],
      correct: 2,
      hint: 'Which position\'s value is determined entirely by stablecoin interest rates rather than the price of a crypto asset?',
      explanation: 'C is correct. Vesu USDC/USDT supply earns yield from lending utilisation — its value in USD terms is stable regardless of crypto market conditions (assuming USDC and USDT maintain their pegs). Options A, B, and D all have direct positive exposure to ETH or BTC prices — they fall in a crypto sell-off.',
    },
    {
      question: 'You hold an ETH/USDC LP position with an LP token deposited as Vesu collateral. ETH falls 25%. In what ORDER should you exit this multi-leg position?',
      options: [
        'A. Exit the LP position first, then repay the Vesu borrow',
        'B. Repay the Vesu borrow first (or add collateral), then withdraw LP token from Vesu, then exit the LP',
        'C. Exit the Vesu borrow first and leave the LP position open',
        'D. Let the position be liquidated — liquidation automatically handles the exit',
      ],
      correct: 1,
      hint: 'Which leg has a liquidation risk that would trigger involuntary exits in other legs? That leg must be addressed first.',
      explanation: 'B is correct. The Vesu borrow must be addressed first — as ETH falls, the LP token collateral value drops, and the health factor approaches 1.0. If the Vesu position is liquidated, your LP tokens are seized. With no collateral left in Vesu, you lose control of the exit sequence. By repaying the borrow first (or adding collateral), you free the LP token, then exit the LP on your own terms. Option D is the worst choice — liquidation is an involuntary sale at potentially adverse prices.',
    },
    {
      question: 'You defined an exit criterion: "Exit LP position if ETH falls 20% from entry." ETH has fallen 21%. What is the correct action?',
      options: [
        'A. Wait — perhaps ETH will recover before you need to exit',
        'B. Exit the LP position — the pre-defined criterion has been met. The purpose of writing the criterion was to remove emotional judgment from the decision.',
        'C. Reassess whether 20% was the right threshold before acting',
        'D. Exit only if the position is currently showing a loss',
      ],
      correct: 1,
      hint: 'Why did you write the exit criterion before opening the position? What is the consequence of overriding it at the moment it triggers?',
      explanation: 'B is correct. Pre-defined exit criteria exist precisely to override the emotional pull to hold when the trigger arrives. If you reassess or delay every time a criterion triggers, the criteria have no value — you are back to emotional decision-making under pressure. The criterion was set when you had time to think clearly. Act on it. Options A, C, and D all introduce reasons to delay the decision the criterion was designed to prevent.',
    },
    {
      question: 'Weekly review: four positions. Position A: −9.2%. Position B: −8.7%. Position C: −10.1%. Position D (Vesu USDC supply): +0.3%. Your model predicted A–C would be moderately correlated (max 0.5) and D uncorrelated. What does this week\'s data suggest and what action is implied?',
      options: [
        'A. Nothing unusual — weekly variation is normal',
        'B. Positions A–C showed much higher correlation than 0.5 (they moved together within 1.5%). This suggests a shared macro risk not captured in the model. Reduce exposure to the correlated trio and increase D or similar decorrelated positions.',
        'C. Sell Position D — it performed worst in absolute terms',
        'D. Add leverage to A–C to recover the week\'s losses faster',
      ],
      correct: 1,
      hint: 'What does it mean when three supposedly "moderately correlated" positions all move −8.7% to −10.1% in the same week? Is that consistent with 0.5 correlation?',
      explanation: 'B is correct. Positions A–C all declined 8.7–10.1% in the same week with extremely tight clustering — this indicates much higher correlation than 0.5. It suggests a common macro risk factor driving all three simultaneously. The model underestimated correlation. The correct response: reduce the correlated trio and increase genuinely decorrelated positions like D. Option D (adding leverage to recover losses) is the most dangerous response — it amplifies the correlated risk rather than reducing it.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'Portfolio: (A) $90,000 STRK/ETH LP on Ekubo, (B) $70,000 STRK staking, (C) $50,000 ETH long on Extended at 5× leverage, (D) $40,000 Vesu USDC supply. Scenario: STRK falls 30%, ETH falls 25%. Calculate approximate total portfolio impact for each position and identify the correlated risk cluster.',
      scoringCriteria: [
        'Position A (STRK/ETH LP): both assets fall. At 30% STRK and 25% ETH moves, IL ≈ 1.5%. Market value of LP ≈ $90K × ~0.74 (weighted decline) × (1−0.015) ≈ $65,500.',
        'Position B (STRK staking): STRK falls 30%. Value: $70K × 0.70 = $49,000.',
        'Position C (ETH 5× long): 25% adverse at 5× = 125% of collateral loss. Position liquidated. Loss = full $50,000 collateral.',
        'Position D (Vesu USDC supply): unchanged at ~$40,000.',
        'Total portfolio: ~$65,500 + $49,000 + $0 + $40,000 = ~$154,500 from $250,000 = 38% drawdown.',
        'Correlated cluster: A, B, C all declined simultaneously — one macro risk (crypto sell-off) expressed three times. D provided genuine decorrelation. Lesson: Position C\'s 5× leverage on ETH long was the most destructive component.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi fund manager presents a portfolio: "We\'re diversified — we have positions in 7 different protocols across Ekubo, Vesu, Extended, STRK staking, wBTC lending, ETH lending, and a STRK/wBTC LP." Respond in 3 sentences explaining the difference between protocol diversification and risk diversification, identifying the shared correlation factor in this portfolio, and recommending one genuinely decorrelated position they should add.',
      scoringCriteria: [
        'Protocol vs risk diversification: seven protocols means seven different smart contract risks — but if all underlying assets (STRK, ETH, wBTC) move together in a crypto downturn, the portfolio has one correlated macro risk regardless of protocol count',
        'Shared correlation: all seven positions have positive exposure to the broad crypto market — they will all decline in a macro sell-off',
        'Genuinely decorrelated addition: Vesu USDC/USDT supply — the yield is driven by lending utilisation rates, not crypto prices. A macro sell-off does not reduce the value of this position in USD terms.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'You hold a three-leg position: (1) $60,000 ETH/USDC Ekubo LP → (2) LP tokens as Vesu collateral, $30,000 USDC borrowed at HF 1.55 → (3) $30,000 USDC supplied to Vesu for yield. ETH falls 18%. LP token value drops to approximately $54,000. Calculate new health factor for Leg 2. Determine whether Leg 2 is in danger and state which leg to close first, second, third.',
      scoringCriteria: [
        'New LP token value: $54,000. New HF: ($54,000 × 0.83) / $30,000 = $44,820 / $30,000 = 1.494. Below 1.5 warning threshold.',
        'Leg 2 is in danger — approaching liquidation threshold. Immediate action required.',
        'Exit order: Leg 3 first (withdraw USDC supply), use proceeds to repay borrow. Leg 2 second (repay borrow, free LP token collateral). Leg 1 third (exit LP position and rebalance).',
        'If HF drops to 1.2 or below before Leg 3 is exited: repay borrow from personal USDC reserves immediately, then proceed with ordered exit.',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-correlation-manager',
    title: 'Correlation Manager — Position Risk Dashboard',
    instructionText:
      'Add your portfolio positions. Observe the correlation matrix. ' +
      'Trigger a simulated market sell-off and watch which positions decline together. ' +
      'Set exit criteria for each position and observe how pre-defined triggers differ from emotional decision-making.',
    completionCriteria: [
      'User has added at least 4 positions including at least one stablecoin position',
      'User has observed the correlated cluster decline together in the sell-off simulation',
      'User has set at least one exit criterion',
      'User has observed the exit criterion trigger during the simulation',
    ],
  },
},

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Protocol Risk at Scale
// Dominant concept: at institutional scale, smart contract
// concentration risk — exceeding a threshold in any single
// protocol — is the primary risk that single-position analysis
// misses, because it makes a protocol failure catastrophic
// rather than manageable.
// ─────────────────────────────────────────────────────────────
{
  id: 'protocol-risk-at-scale',
  title: 'Protocol Risk at Scale: Concentration Thresholds and Exit Planning',

  explanation: `
In August 2023, Exactly Protocol — a DeFi lending protocol on Optimism — was exploited for $12 million via a reentrancy attack on its reward manager contract. The exploit drained the pool. Depositors lost their funds in proportion to their share. One institutional depositor who had concentrated 40% of their DeFi treasury in Exactly lost $4.8 million in a single transaction that took under 3 seconds.

At scale, smart contract risk is not distributed across many small bets. It is concentrated in specific protocols based on where you allocated capital. The risk that smart contract analysis assigns to a protocol — the probability that it will be exploited over some time horizon — interacts with your concentration level to produce your expected dollar loss from that event. A 2% probability of total loss on a $10,000 position has an expected loss of $200. A 2% probability of total loss on a $200,000 concentrated position has an expected loss of $4,000. The risk is the same percentage; the exposure is entirely different.

Protocol risk assessment at institutional scale has four components. First, smart contract audit status: how recently was the protocol audited, by how many firms, and were all critical findings resolved? A protocol with a resolved critical finding is safer than one with an unresolved medium finding — but both require ongoing monitoring for post-audit code changes. Second, time in production: protocols that have processed $100 million in volume over 18 months without incident have demonstrated resilience across market conditions that stress-test both technical and economic design. Third, protocol TVL trajectory: protocols losing TVL rapidly may face reduced security due to changing incentive structures or declining community confidence. Fourth, upgrade authority: can the protocol be modified by a multisig or governance vote? If so, who controls that authority and what are the safeguards?

Exit planning at scale is different from retail exit planning because size creates slippage. A $5,000 withdrawal from Vesu executes instantly with no market impact. A $2,000,000 withdrawal from Vesu at times of low liquidity moves the utilisation rate and may affect the yields available to remaining depositors. Large withdrawals should be planned in tranches — partial exits over time — rather than single full exits that move markets against you. The exit plan for each position in an institutional portfolio should specify: tranche size, timing, acceptable price impact, and the trigger conditions under which normal tranche timing is overridden for a faster exit.
  `.trim(),

  visualPrompt: 'Two-part risk diagram. Top: "Concentration × Exploit Probability = Expected Loss" — table with three rows: $10,000 at 2% probability = $200 expected loss; $100,000 at 2% probability = $2,000; $500,000 at 2% probability = $10,000. Annotation: "Same protocol, same risk percentage — exposure scales with concentration." Bottom: "Tranche Exit Diagram" — horizontal timeline showing $2M total exit split into 5 × $400K tranches over 5 weeks. Each tranche shows "market impact: 0.3%" versus a single-exit showing "market impact: 2.1%".',
  visualType: 'static',
  visualUrl: 'protocol-risk-concentration-tranche-exit',

  examples: [
    {
      contextTag: '[Exactly Protocol exploit, institutional concentration, catastrophic loss]',
      context: 'Exactly Protocol was a DeFi lending protocol on Optimism. In August 2023, an attacker exploited a reentrancy vulnerability in the protocol\'s reward manager contract and drained $12 million in user funds.',
      scenario: 'An institutional depositor had $4.8 million (40% of their $12 million DeFi treasury) concentrated in Exactly at the time of the exploit.',
      outcome: 'The depositor lost $4.8 million — 40% of their treasury — in one transaction. If they had applied a 20% concentration limit, their maximum loss from a single protocol failure would have been $2.4 million — still catastrophic, but the difference between fund survival and fund wind-down. The audit history of Exactly was not negligent — the reentrancy bug was in a component added after the last audit. This is why post-audit monitoring and concentration limits both matter: audits are point-in-time; concentration limits manage the ongoing exposure.',
    },
    {
      contextTag: '[Protocol risk scoring, four-component assessment, two protocols compared]',
      context: 'An institutional DeFi manager is evaluating two Starknet lending protocols for a $300,000 allocation. Protocol Alpha: 14 months in production, two audit firms, zero critical findings, $85M TVL growing, 3-of-5 multisig upgrade authority. Protocol Beta: 6 months in production, one audit firm (one medium finding resolved), $22M TVL stable, 2-of-3 multisig upgrade authority.',
      scenario: 'They score each protocol on the four-component framework and determine a maximum allocation for each.',
      outcome: 'Protocol Alpha: strong audit history, meaningful production history, growing TVL, acceptable governance (3-of-5 is harder to compromise than 2-of-3). Maximum allocation: 25% ($75,000). Protocol Beta: shorter production history, single auditor, lower governance threshold. Maximum allocation: 12% ($36,000). Total allocation: $111,000. The remaining $189,000 should be spread across at least two additional protocols or held in liquid stablecoins until additional positions are evaluated.',
    },
    {
      contextTag: '[Large-scale exit, tranche planning, slippage management]',
      context: 'An institutional fund holds $2.5 million in a Starknet lending protocol. A governance announcement proposes a significant protocol upgrade that the fund managers view as increasing risk. They decide to exit.',
      scenario: 'They assess the market impact of a single full exit versus a tranche exit over 3 weeks.',
      outcome: 'Single exit: withdrawing $2.5M from a protocol with $18M TVL removes 13.9% of the pool instantly, pushing utilisation to near maximum and likely triggering dynamic rate increases for remaining depositors. The exit transaction itself processes fine, but the fund\'s reputation as a large depositor may affect future protocol access. Tranche exit: $500K per week for 5 weeks. Each withdrawal is 2.8% of pool — minimal utilisation impact, clean execution, no market signalling in a single large transaction. The 3-week delay carries governance upgrade risk — but the fund maintains the ability to accelerate tranches if urgency increases.',
    },
  ],

  keyTakeaway: 'At institutional scale, smart contract concentration risk — having more capital in a single protocol than your concentration threshold allows — transforms a manageable audit risk into a catastrophic loss event, and tranche exit planning manages the scale problem that single-position exit analysis misses.',

  guidedPractice: [
    {
      question: 'A protocol has a 3% estimated annual probability of total loss from an exploit. Your allocation: $400,000. What is your expected annual loss from this position?',
      options: [
        'A. 3% — the probability is the risk',
        'B. $12,000 — $400,000 × 3%',
        'C. $400,000 — a 3% chance of total loss is very high',
        'D. $0 — 3% is too low to be meaningful',
      ],
      correct: 1,
      hint: 'Expected loss = probability × potential loss. Apply the 3% probability to the $400,000 allocation.',
      explanation: 'B is correct. Expected annual loss = $400,000 × 3% = $12,000. This is the mathematical expectation — 3% of the time you lose $400,000 (average annual cost $12,000). A 20% concentration limit on a $400,000 position within a $2M portfolio would cap the same 3% protocol risk at $2M × 20% × 3% = $12,000 — but the loss event is $400,000 not $40,000. Understanding the difference between expected loss and maximum loss is central to institutional risk management.',
    },
    {
      question: 'A protocol was last audited 14 months ago. Since then, the team added three new features. What is the correct risk assessment of the audit status?',
      options: [
        'A. Fully audited — the initial audit covers all code',
        'B. Partially audited — the original code is audited, but the three new features post-audit represent unaudited additions. The 14-month-old audit does not cover them.',
        'C. No risk — the team is experienced and the protocol has not been exploited',
        'D. Irrelevant — smart contract audits do not prevent exploits',
      ],
      correct: 1,
      hint: 'An audit is a point-in-time review of specific code. What about code written after the audit?',
      explanation: 'B is correct. An audit covers the code present at audit time. Three new features added after the last audit have not been independently reviewed. The Exactly Protocol exploit in 2023 occurred in exactly this way — a post-audit component contained the vulnerability. Treating a 14-month-old audit as covering current code is a category error. The correct approach: treat post-audit additions as unaudited risk and adjust the concentration limit accordingly.',
    },
    {
      question: 'You need to exit $1,800,000 from a protocol with $12,000,000 TVL. A single exit represents 15% of the pool. What is the appropriate exit strategy?',
      options: [
        'A. Single exit — withdraw all $1.8M immediately for maximum speed',
        'B. Tranche exit — plan 4–6 tranches of $300–450K spaced over 2–4 weeks to minimise utilisation impact and market signalling',
        'C. Exit 10% today and wait to see if the market recovers',
        'D. Only exit if the price has risen — never exit at a loss',
      ],
      correct: 1,
      hint: 'A 15% pool withdrawal creates what kind of market impact versus smaller tranches? Which matters more for a planned exit?',
      explanation: 'B is correct. A $1.8M single exit from a $12M pool removes 15% of TVL instantly, potentially pushing utilisation to near maximum and generating visible market signalling. Tranche exits of $300–450K are 2.5–3.75% of pool each — much lower utilisation impact, cleaner execution, and less signalling risk. The trade-off is time: tranches take weeks. For a planned strategic exit (not an emergency), the tranche approach is standard institutional practice. Emergency exits may require a single transaction despite the market impact.',
    },
    {
      question: 'Protocol upgrade governance uses a 2-of-3 multisig to approve changes. What is the minimum attack surface to approve a malicious upgrade?',
      options: [
        'A. 3 — all signers must be compromised',
        'B. 2 — the minimum threshold to reach approval',
        'C. 1 — a single compromised signer can approve changes',
        'D. 0 — a 2-of-3 multisig is fully decentralised',
      ],
      correct: 1,
      hint: 'A multisig threshold defines the minimum number of valid signers required. How many malicious signers reach that threshold?',
      explanation: 'B is correct. A 2-of-3 multisig requires exactly 2 valid signatures to approve a transaction. An attacker who compromises exactly 2 signers can approve any upgrade — including one that drains the protocol. A 3-of-5 multisig raises this to 3 compromised parties. For institutional depositors, the governance structure is a key risk component: 2-of-3 requires fewer compromised parties than 4-of-7 to enable a malicious protocol modification.',
    },
    {
      question: 'You are assessing a new Starknet protocol: 4 months in production, one audit (two medium findings, one unresolved), $8M TVL, 2-of-3 multisig governance. Maximum concentration limit for this protocol in a $500,000 treasury?',
      options: [
        'A. 25% — standard limit for all protocols',
        'B. 5–8% — reduced limit due to: short production history (4 months), unresolved audit finding, low governance threshold (2-of-3). Standard 25% limit applies only to mature, well-audited protocols.',
        'C. 0% — never invest in a protocol with an unresolved finding',
        'D. 15% — apply a 40% reduction to the standard limit for any audit finding',
      ],
      correct: 1,
      hint: 'Apply all four risk components: production history, audit completeness, TVL, and governance threshold. Each weakness reduces the maximum appropriate concentration.',
      explanation: 'B is correct. Each risk factor warrants a reduction from the standard 25% limit: 4 months of production history (vs 12+ months) → reduce. Unresolved medium finding → reduce. Low TVL ($8M) → less battle-tested → reduce. 2-of-3 governance → low attack surface → reduce. Combined, these push the appropriate limit to 5–8% of the treasury ($25–40K). Option C is too absolute — small allocations to early-stage protocols are a legitimate tool when bounded. Option D applies a mechanical reduction without considering the specific risks.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'Institutional treasury: $800,000 total. Current allocations: Protocol A (Vesu, 14 months, 2 audits, no findings) — $220,000 (27.5%). Protocol B (Ekubo LP, 18 months, 2 audits, no findings) — $190,000 (23.75%). Protocol C (new protocol, 5 months, 1 audit, 1 medium finding unresolved) — $140,000 (17.5%). Protocol D (STRK staking, native) — $130,000 (16.25%). Cash/USDC reserve — $120,000 (15%). Identify which positions exceed concentration limits (25% standard), assess Protocol C\'s appropriate limit, and calculate how much capital needs to be rebalanced.',
      scoringCriteria: [
        'Protocol A at 27.5% exceeds 25% limit. Excess: $220K − $200K = $20K needs redeployment.',
        'Protocol B at 23.75% — within 25% limit. No action required.',
        'Protocol C: 5 months production + unresolved finding + single auditor → appropriate limit 8–10%, not 17.5%. At 8%: max $64K. Current $140K. Excess: $76–$80K needs redeployment.',
        'Total rebalancing needed: ~$96–100K from A and C into reserve, D, or additional diversified protocols.',
        'Protocol D (STRK staking) and cash reserve are both within limits and require no change.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Protocol X governance announcement: "We are proposing an upgrade to the liquidation engine using our 3-of-7 multisig. The upgrade will go live in 72 hours. Audit of the upgrade is scheduled for next month." You hold $450,000 in Protocol X (25% of a $1.8M treasury). Interpret the announcement for risk implications, determine whether it changes your concentration assessment, and state your response.',
      scoringCriteria: [
        'Risk flags: upgrade going live before audit is complete — post-upgrade code will be unaudited at deployment. 72-hour window is insufficient for independent review.',
        'Concentration reassessment: the $450K at 25% was sized assuming the protocol code was fully audited. A pending unaudited upgrade changes this assumption — the 25% limit was calibrated to audited code, not unaudited additions.',
        'Response options: (1) reduce allocation to 12–15% before upgrade goes live (begin tranche exit now), (2) hold and monitor — if upgrade executes without incident and audit clears, restore full allocation. Time-sensitive: 72 hours requires immediate action.',
        'Correct response: begin a tranche exit to reduce to 15% ($270K) before the 72-hour window. $180K in tranches over 48 hours at $90K each — 2 tranches — manageable market impact on a large protocol.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A junior analyst says: "Protocol X has been audited twice with no critical findings — we can put as much as we want in it." Explain in 3 sentences why audit quality alone does not remove concentration limits, using the Exactly Protocol case as the reference, and state the maximum appropriate concentration regardless of audit status.',
      scoringCriteria: [
        'Audit limitation: audits cover code at a specific point in time. Post-audit code additions — new features, upgrades — are not covered by prior audits. Exactly Protocol was audited but exploited through a post-audit addition.',
        'Concentration argument: even a perfectly audited protocol has non-zero exploit probability over time. At large concentrations, even a 1–2% annual probability of total loss creates existential treasury risk. The concentration limit manages expected dollar loss, not just probability.',
        'Maximum limit: 25% per protocol is the institutional standard regardless of audit quality. For a $1M treasury, this means the maximum loss from any single protocol failure is $250K — survivable. Without the limit, a single failure at 100% concentration would be treasury-ending.',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Building a DeFi Operation
// Dominant concept: a DeFi operation is defined by its
// response time to an adverse event — and response time is
// entirely determined by whether monitoring, decision criteria,
// and exit procedures were defined before the event, not during.
// ─────────────────────────────────────────────────────────────
{
  id: 'building-defi-operation',
  title: 'Building a DeFi Operation: Monitoring, Procedures, and Performance',

  explanation: `
In March 2023, a DeFi fund manager received an alert that a protocol they were deposited in had flagged an unusual transaction pattern. By the time they had assembled their team, discussed the alert, located the exit procedure document, and initiated the withdrawal, the exploit had already executed and their funds were gone. The alert arrived 4 minutes before the exploit completed. Their response took 7 minutes.

A DeFi operation is not a set of positions — it is a system that monitors those positions and responds to changes. The gap between when something goes wrong and when you can act is determined entirely by preparation, not by how quickly you can think under pressure. Under pressure, thinking is slow. Prepared procedures execute in seconds.

A DeFi monitoring stack has three layers. The on-chain layer uses protocol event monitoring — tools that watch for abnormal transactions, large position changes, oracle price divergences, and governance proposals that affect your protocols. Dune Analytics and custom on-chain alert services provide this. The portfolio layer uses a health factor dashboard that shows real-time Vesu health factors, LP out-of-range status, and funding rate charges on perp positions — all in one view. The news layer monitors DeFi security channels (e.g. BlockSec, PeckShield, Immunefi) for early exploit disclosures that may affect your protocols before on-chain evidence appears.

Performance attribution answers: where is your return actually coming from? A portfolio earning 14% weighted APY needs to know whether that return is from Vesu yield (reliable, repeatable), Ekubo fee income (volume-dependent), STRK staking rewards (protocol-native, predictable), or funding rate receipts from a perp short (market-condition-dependent, volatile). Attributing return to its source reveals how much of the portfolio return is durable versus dependent on specific market conditions that may not persist.

Benchmarking anchors performance evaluation. Holding STRK and doing nothing is a valid benchmark — if your active DeFi strategy generates less than STRK appreciation plus native staking yield after fees and costs, the operational complexity is not worth it. A DeFi operation justifies its existence by generating risk-adjusted return above the passive benchmark — not just in nominal APY terms, but in Sharpe-adjusted terms that account for the time, operational risk, and smart contract exposure the active strategy requires.
  `.trim(),

  visualPrompt: 'Three-tier monitoring stack diagram. Tier 1 (top, green): "On-Chain Alerts" — anomalous transactions, oracle divergences, governance proposals. Tier 2 (middle, yellow): "Portfolio Dashboard" — Vesu health factors, LP range status, perp funding charges, real-time APY. Tier 3 (bottom, red): "Security News" — BlockSec, PeckShield, Immunefi feeds. Arrow on right side: "Alert → Decision → Action — target: under 3 minutes." Bottom box: "Emergency Procedure Card" — Protocol A: exit trigger, action, time estimate. Protocol B: same. Protocol C: same.',
  visualType: 'static',
  visualUrl: 'defi-operation-monitoring-stack',

  examples: [
    {
      contextTag: '[Monitoring response time, 4-minute exploit window, 7-minute response, outcome]',
      context: 'A DeFi fund received a BlockSec alert at 14:32:08 UTC: "Suspicious transaction detected in Protocol X — potential reentrancy attack." They had $380,000 deposited in Protocol X.',
      scenario: 'Their emergency procedure was to contact the on-call manager, who would assemble the team on a video call, then execute the withdrawal together.',
      outcome: 'The exploit completed at 14:36:02 UTC — 3 minutes and 54 seconds after the alert. The fund\'s response (team assembled, withdrawal initiated) happened at 14:39:12 UTC — 7 minutes after the alert, 3 minutes after the funds were gone. A pre-defined emergency procedure that allowed any one team member to initiate withdrawal unilaterally upon receiving a security alert — without assembling a team — would have enabled a response in under 60 seconds. The policy requiring group decision caused the delay.',
    },
    {
      contextTag: '[Performance attribution, three yield sources, durability assessment]',
      context: 'A DeFi portfolio earned 16.8% APY over Q2. Attribution breakdown: Vesu USDC yield $3,200 (stable, driven by consistent lending utilisation), Ekubo fee income $4,800 (higher than expected — Q2 had unusually high STRK volatility driving swap volume), STRK staking $1,600 (predictable, protocol-native), funding rate receipts from perp short $2,400 (Q2 had sustained negative funding as shorts were crowded).',
      scenario: 'The manager assesses Q3 durability of the 16.8% return.',
      outcome: 'Durable components: Vesu yield ($3,200 — utilisation-driven, likely to persist), STRK staking ($1,600 — protocol-native). Total durable annualised yield: approximately 9.6%. Condition-dependent: Ekubo fees ($4,800 — volatility was above average in Q2, likely to normalise), funding rate receipts ($2,400 — negative funding environments are cyclical, not permanent). The 16.8% Q2 APY overstates the repeatable yield by approximately 7%. Planning with the durable 9.6% is more conservative and appropriate.',
    },
    {
      contextTag: '[Benchmark comparison, passive STRK holding, active strategy evaluation]',
      context: 'A DeFi operator earned 14% APY on a $400,000 Starknet portfolio over 12 months. Passive benchmark: hold STRK and stake natively. Over the same 12 months, STRK appreciated 22% and native staking added 8.8% APY on the appreciation-adjusted value.',
      scenario: 'They compare active versus passive performance.',
      outcome: 'Passive (STRK hold + staking): $400,000 × 1.22 = $488,000 end-of-year value + 8.8% staking on average STRK value ≈ an additional $37,000 = $525,000 total. Active portfolio: $400,000 × 1.14 = $456,000. Active strategy underperformed passive by $69,000. The active strategy introduced 8 protocol interactions (smart contract risk) and 50+ hours of operational management overhead. At this comparison, the passive benchmark dominated — the active DeFi operation destroyed value relative to simply holding and staking.',
    },
  ],

  keyTakeaway: 'A DeFi operation is defined by its response time to an adverse event — and that response time is entirely determined by monitoring systems, pre-written procedures, and pre-defined decision authority established before any emergency occurs.',

  guidedPractice: [
    {
      question: 'An on-chain alert service flags unusual activity in a protocol you are deposited in. Your emergency procedure requires consensus from three team members before initiating withdrawal. The exploit window is 4 minutes. What is the fundamental flaw in this procedure?',
      options: [
        'A. The alert service is unreliable',
        'B. Requiring team consensus before action adds minutes of latency. In a 4-minute exploit window, the procedure ensures response after the event, not before.',
        'C. Withdrawals always take more than 4 minutes',
        'D. Three people is too few for consensus',
      ],
      correct: 1,
      hint: 'How long does assembling three people and reaching consensus take? Compare to the available response window.',
      explanation: 'B is correct. Assembling three people for consensus typically takes 3–7 minutes. A 4-minute exploit window means the consensus requirement guarantees the response arrives after the window closes. The correct procedure: pre-authorise any single team member to initiate withdrawal upon receiving a security alert, without requiring consensus. Consensus can be used for planned decisions; emergencies require pre-delegated unilateral authority.',
    },
    {
      question: 'Your DeFi portfolio earned 19% APY in Q3. Attribution: 7% from Vesu stable yield, 5% from STRK staking, 7% from unusually high Ekubo volume during a volatile market. How much of the 19% is likely to repeat in Q4 under normal conditions?',
      options: [
        'A. 19% — the portfolio system is operating correctly',
        'B. Approximately 12% — the 7% + 5% from Vesu and staking are durable. The 7% from Ekubo was driven by above-average volatility unlikely to persist at the same level.',
        'C. 0% — DeFi yields are completely unpredictable',
        'D. 7% — only the stablecoin component is durable',
      ],
      correct: 1,
      hint: 'Which yield sources are driven by stable structural factors versus temporary market conditions? Which is likely to normalise?',
      explanation: 'B is correct. Vesu yield (7%) is driven by lending utilisation — structural and relatively stable. STRK staking (5%) is protocol-native and predictable. Ekubo fee income (7%) in Q3 was elevated by above-average market volatility — this is a condition-dependent source. Normal market conditions produce lower swap volume and lower LP fee income. Planning with 12% durable yield prevents a Q4 surprise when Ekubo income normalises.',
    },
    {
      question: 'Your active DeFi strategy earned 13% APY. Passive benchmark (hold + native staking): 16% APY including token appreciation. What does this comparison imply?',
      options: [
        'A. The active strategy is superior — 13% APY in DeFi is high',
        'B. The active strategy underperformed the passive benchmark. The operational complexity, time investment, and smart contract exposure were not compensated by the return differential.',
        'C. The passive benchmark is invalid — token appreciation is not a fair comparison',
        'D. Active DeFi always outperforms passive holding — 13% vs 16% is within measurement error',
      ],
      correct: 1,
      hint: 'What is the purpose of a benchmark? What does it mean if the active strategy generates less return than the passive alternative?',
      explanation: 'B is correct. The benchmark represents what you could have earned without any active management, protocol risk, or operational overhead. If the passive strategy outperforms by 3%, the active strategy has imposed real costs (time, risk, complexity) and delivered less return. This is a clear case where the operational overhead is not justified. The benchmark is valid — it represents the real opportunity cost of active DeFi management.',
    },
    {
      question: 'Which three monitoring layers form a complete DeFi operations stack?',
      options: [
        'A. Price charts, social media, protocol forums',
        'B. On-chain event alerts (anomalous transactions, governance proposals), portfolio dashboard (health factors, LP status, funding charges), security news (exploit disclosures from BlockSec/Immunefi)',
        'C. APY dashboards, DEX volume charts, token price feeds',
        'D. Email newsletters, Discord channels, Twitter',
      ],
      correct: 1,
      hint: 'Think about what information you need: early warning of attacks, real-time portfolio health, and security community alerts. Which option covers all three?',
      explanation: 'B is correct. The three layers each serve a distinct purpose: on-chain alerts detect anomalous activity before or during an exploit; the portfolio dashboard provides continuous health status so you can act before reaching critical thresholds; security news provides early disclosure of vulnerabilities that may not yet show on-chain. Option A relies on social media, which is noisy and slow. Option C provides market data but not protocol security monitoring.',
    },
    {
      question: 'An emergency procedure document should be written before any position is opened. Which of the following items must it include for a Vesu collateral position?',
      options: [
        'A. Only the exit price target',
        'B. Trigger condition (specific health factor or protocol event), action (what to do and in what order for multi-leg positions), decision authority (who can act unilaterally), time estimate for full exit, and override conditions for accelerated exit',
        'C. Only the protocol\'s audit history',
        'D. The contact details for the protocol team',
      ],
      correct: 1,
      hint: 'An emergency procedure must answer: what triggers it, who acts, what do they do, in what order, and how fast. Which option covers all of these?',
      explanation: 'B is correct. A complete emergency procedure for a Vesu position must specify: what health factor level triggers the procedure (e.g. HF ≤ 1.3), what the exact action sequence is (repay borrow → withdraw collateral → exit underlying position), who is pre-authorised to act without consensus in an emergency, how long the full exit takes under normal conditions, and when normal timing is overridden for an emergency exit. Without all five elements, the procedure will have decision gaps that cost time under pressure.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi fund\'s monitoring stack shows simultaneously: (1) PeckShield tweet: "Potential exploit in progress at Protocol X — transactions paused." (2) Vesu health factor for your ETH/USDC LP collateral: 1.28 (ETH dropped 12% in the last hour). (3) STRK staking position: unchanged. You have $220K in Protocol X, $180K in the Vesu position, and $90K in STRK staking. Define the correct priority order of actions, time targets for each, and which team members need to be involved.',
      scoringCriteria: [
        'Priority 1: Protocol X exit initiated IMMEDIATELY (within 30–60 seconds). Pre-authorised unilateral action. $220K at potential total loss. Do not wait for team consensus.',
        'Priority 2: Vesu health factor 1.28 is below 1.3 warning threshold. Add collateral or reduce borrow within 15–30 minutes — urgent but not immediate emergency (HF not yet at 1.0).',
        'Priority 3: STRK staking — no action required. Not affected by Protocol X or ETH price in the short term.',
        'Decision authority: Protocol X exit should be pre-authorised for unilateral action. Vesu response may involve consultation but cannot require consensus that takes more than 15 minutes.',
        'Documentation: log all actions with timestamps immediately after execution for performance attribution and post-mortem.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A new fund manager joins the team and asks: "Why do we benchmark against passive STRK holding? Our DeFi strategy is obviously more sophisticated — shouldn\'t we benchmark against a Treasury bill rate?" Respond in 3 sentences explaining what the passive STRK benchmark measures, why it is the correct benchmark for a Starknet DeFi strategy, and what the T-bill comparison misses.',
      scoringCriteria: [
        'What the STRK benchmark measures: the return available without any active management, protocol risk, or operational overhead — the true opportunity cost of the active strategy',
        'Why it is correct: a Starknet DeFi manager who underperforms simple STRK hold + staking has imposed real costs (time, smart contract risk, IL, funding charges) and delivered less return. This is economically worse than the passive alternative, regardless of the absolute APY.',
        'What T-bill comparison misses: a T-bill rate comparison measures whether you beat cash — not whether you beat the relevant passive alternative. A DeFi fund earning 14% looks good against T-bills at 5% but is destroying value if passive STRK holding + staking returned 18% over the same period.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Q3 performance attribution for a $600,000 Starknet DeFi portfolio: Vesu USDC supply $6,300 yield (14% of portfolio). Ekubo ETH/USDC LP $8,400 fee income + IL of −$3,200 = net $5,200 (23% of portfolio). STRK staking $4,800 rewards (18% of portfolio). Perp short funding receipts $7,100 (5% of portfolio notional exposure). Total active return: $23,400 = 3.9% quarterly = ~15.6% annualised. Passive benchmark (STRK hold + staking): STRK appreciated 8% in Q3, staking 2.2% quarterly = 10.2% quarterly total. Evaluate: did the active strategy justify its complexity? Identify which attribution source is the least durable.',
      scoringCriteria: [
        'Active: 3.9% quarterly. Passive: 10.2% quarterly. Active strategy underperformed passive by 6.3% — even with five active positions and operational overhead.',
        'Least durable attribution: perp short funding receipts ($7,100). Negative funding environments are cyclical — this was the highest-yielding component on 5% notional but is highly dependent on short-crowding conditions that reverse. In a trending bull market, funding turns positive and shorts pay rather than receive.',
        'Action implied: evaluate whether continuing the active strategy is justified given passive outperformance. Consider reducing Ekubo LP exposure (IL cost $3,200 reducing net) and the perp position (market-condition-dependent). Increase Vesu and STRK staking allocation — both durable and less labour-intensive.',
        'Correct conclusion: active strategy underperformed in Q3. Continued operation requires either improving position selection or acknowledging that passive is superior in trending STRK market conditions.',
      ],
    },
  ],
},

];  // end LAB10_ALL_LESSONS


// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMULATIONS — Lab 10 (15 total)
// ─────────────────────────────────────────────────────────────

export const LAB10_AGGREGATE_SIMULATIONS = {
  count: 15,
  simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'judgment-communication'],
  drawPerSession: 5,
  scenarios: [
    { type: 'judgment-riskAssess', scenario: 'Treasury: $500K. Protocol A: $145K (29%). Protocol B: $120K (24%). Protocol C: $90K (18%). Cash: $145K. 25% concentration limit. Identify violations and calculate rebalancing required.', scoringCriteria: ['Protocol A at 29% violates 25% limit. Excess: $20K.', 'Protocol B at 24% — within limit.', 'Rebalancing: move $20K from Protocol A to cash or new protocol. No other changes required.'] },
    { type: 'judgment-dataInterpret', scenario: 'Q2 attribution: Vesu yield $4,100, Ekubo LP net $6,800 (Q2 had 3× normal volatility), STRK staking $3,200, perp funding −$1,100 (negative — you were long in a negative funding environment). Total: $13,000 on $300K = 17.3% annualised. Estimate Q3 durable yield.', scoringCriteria: ['Durable: Vesu $4,100 + staking $3,200 = $7,300 annualised ≈ 9.7%', 'Condition-dependent: Ekubo $6,800 (volatility will normalise)', 'Perp long in negative funding: −$1,100 is a cost, not income. Strategy misaligned with funding environment.', 'Q3 durable estimate: ~$7,300/quarter annualised = ~9.7%. Q2 was elevated by Ekubo volatility windfall.'] },
    { type: 'judgment-communication', scenario: 'Explain in 3 sentences why tax records must be generated at transaction time rather than year-end, using the scale of a typical active DeFi year.', scoringCriteria: ['An active DeFi year generates 50–200+ taxable events across swaps, yields, LP actions', 'Historical USD prices at specific block timestamps require third-party tools and may have gaps for low-liquidity tokens', 'Real-time record generation is minutes of work per transaction vs weeks of reconstruction at year-end'] },
    { type: 'judgment-riskAssess', scenario: 'A DeFi protocol announces an upgrade going live in 36 hours with no audit completed. You have $350K deposited (22% of treasury). Assess the risk change and state your response.', scoringCriteria: ['Pre-upgrade: $350K sized at 22% assuming audited code', 'Post-announcement: unaudited code at deployment — the 22% limit was calibrated to audited risk profile', 'Response: begin tranche exit to reduce to 12–15% before upgrade goes live. Two tranches of $50K in 36 hours is feasible.'] },
    { type: 'judgment-dataInterpret', scenario: 'Three positions: A (ETH/USDC LP) −9.1%, B (ETH staking via LST) −10.2%, C (Vesu USDC supply) +0.1%. Expected correlation: A and B moderate, C uncorrelated. Assess whether the portfolio is behaving as designed.', scoringCriteria: ['A and B declined 9–10% together — consistent with moderate correlation in a crypto sell-off', 'C +0.1% — behaving as expected (uncorrelated, stablecoin yield)', 'No model violation — expected behaviour. If A and C had both declined, that would signal unexpected correlation.'] },
    { type: 'judgment-communication', scenario: 'An investor asks why you use a 25% protocol concentration limit when Protocol X has a perfect audit history. Explain in 2 sentences.', scoringCriteria: ['Audits are point-in-time. Post-audit code changes introduce unreviewed risk. The Exactly Protocol exploit occurred in a post-audit addition.', 'Even perfect audit history has non-zero annual exploit probability. At 25% concentration on $1M treasury, max loss = $250K. At 100%, max loss = $1M. The limit manages expected dollar loss, not just probability.'] },
    { type: 'judgment-riskAssess', scenario: 'You receive a PeckShield alert: "Unusual flashloan activity on Protocol Y." You have $420K there. Your emergency procedure requires 3-person consensus. Team members are in different time zones — earliest assembly: 8 minutes. Exploit window based on similar incidents: 3–5 minutes. What is the fundamental failure and what is the correct action right now?', scoringCriteria: ['Failure: the 3-person consensus requirement cannot be satisfied within the exploit window', 'Correct action right now: override the consensus requirement. Any one team member should initiate the withdrawal immediately — the pre-defined procedure failed to account for this scenario', 'Post-event: rewrite emergency procedure to pre-authorise unilateral action by any team member on receipt of a security alert. Consensus is for planned decisions, not emergencies.'] },
    { type: 'judgment-dataInterpret', scenario: 'Treasury performance vs benchmark: Active portfolio earned 11.3% APY. Passive benchmark (STRK hold + staking): STRK fell 5%, staking added 8.8% = 3.8% net. Did the active strategy justify its complexity this period?', scoringCriteria: ['Active 11.3% vs passive 3.8% — active outperformed by 7.5%', 'The 7.5% outperformance compensates for operational overhead, smart contract risk, and time', 'Active strategy justified in this period. Note: in a rising STRK market, passive often outperforms — track rolling 12-month comparison, not single quarters.'] },
    { type: 'judgment-riskAssess', scenario: 'Multi-leg position: $80K Ekubo ETH/USDC LP → LP token as Vesu collateral → $40K USDC borrowed. ETH falls 15%. LP token value drops to approximately $72K. Health factor: ($72K × 0.83) / $40K = 1.494. Define the exit sequence and trigger for the next action.', scoringCriteria: ['HF 1.494 is below the 1.5 warning threshold. No immediate liquidation, but action warranted.', 'Exit sequence: (1) repay $10–15K of borrow to restore HF above 1.6 (or add ETH collateral), (2) if ETH continues falling, full borrow repay then LP exit', 'Trigger for emergency: if HF approaches 1.2, repay borrow in full immediately and initiate LP exit.'] },
    { type: 'judgment-communication', scenario: 'Explain in 3 sentences what performance attribution reveals that total portfolio APY does not, using a specific example of a misleading total return figure.', scoringCriteria: ['Total APY hides the source of returns. A 16% APY that is 60% from elevated Ekubo volume in a volatile quarter will drop to 10% when volatility normalises.', 'Attribution reveals: which return sources are durable (Vesu, staking) vs condition-dependent (Ekubo volume, perp funding)', 'Example: Q2 portfolio showing 19% total — attribution reveals 11% durable + 8% from above-normal volatility. Planning with 11% is accurate; planning with 19% leads to shortfalls.'] },
    { type: 'judgment-riskAssess', scenario: 'Protocol assessment: 3 months in production, 1 audit (1 critical finding — resolved, 2 medium unresolved), $4M TVL declining 20% MoM, 2-of-4 multisig governance. Maximum appropriate concentration in $600K treasury?', scoringCriteria: ['3 months: short history. 2 unresolved medium findings. TVL declining (negative signal). 2-of-4 multisig (lower threshold).', 'Each factor warrants reduction from 25% standard.', 'Appropriate maximum: 5–7% ($30–42K). TVL decline is particularly concerning — it may signal capital flight in response to known risks.'] },
    { type: 'judgment-dataInterpret', scenario: 'Correlation review: last 4 weeks, all positions in a 6-protocol portfolio declined 6–9% in the same week during a market sell-off. Expected: 3 crypto-correlated, 1 stablecoin (uncorrelated), 2 moderate. Actual: all 6 declined. Assess and recommend.', scoringCriteria: ['6/6 positions declining together contradicts the design — 1 should have been stable (stablecoin) and 2 moderate', 'Investigate the stablecoin position: if Vesu USDC also declined, it may indicate liquidity or de-peg risk, or a measurement error', 'Recommendation: conduct correlation audit. If genuinely all 6 are crypto-correlated, reduce 3 positions and replace with truly decorrelated assets (direct USDC supply, delta-neutral LP).'] },
    { type: 'judgment-communication', scenario: 'Describe the three monitoring layers of a DeFi operations stack and what each detects that the others cannot, in 3 sentences.', scoringCriteria: ['On-chain alerts: detect anomalous transactions and governance proposals before or as they execute. No other layer sees on-chain events in real time.', 'Portfolio dashboard: tracks health factors, LP range status, and funding charges continuously — enables proactive position management before thresholds are breached. Security news provides this.', 'Security news (BlockSec/Immunefi): provides early exploit disclosures from security researchers who may discover vulnerabilities before on-chain evidence appears — the earliest warning layer.'] },
    { type: 'judgment-riskAssess', scenario: 'Tranche exit assessment: $1.5M to exit from Protocol with $10M TVL. Single exit = 15% of pool. Plan 3-tranche exit over 2 weeks. Calculate impact per tranche and identify the scenario where a single exit would be appropriate despite the impact.', scoringCriteria: ['Per tranche: $500K = 5% of pool each. Acceptable utilisation impact.', 'Single exit scenario: security emergency — if a vulnerability is disclosed, market impact is acceptable to exit within minutes rather than weeks. Speed trumps efficiency in emergencies.', '3-tranche plan: week 1 $500K, week 1.5 $500K, week 2 $500K. Monitor TVL after each tranche — if others are exiting simultaneously, accelerate.'] },
    { type: 'judgment-dataInterpret', scenario: 'Emergency procedure card for Vesu position: Trigger — HF ≤ 1.3. Action — repay 30% of borrow. Authority — any team member unilaterally. Time estimate — 5 min. Override — HF ≤ 1.1: repay 100% immediately. Current HF: 1.27. What action does the procedure require?', scoringCriteria: ['HF 1.27 is below the 1.3 trigger threshold', 'Required action: repay 30% of borrow, unilaterally, within 5 minutes', 'Not yet at override threshold (1.1), so partial repayment is the specified action', 'No consensus required — procedure pre-authorises unilateral action at this trigger level'] },
  ],
};


// ─────────────────────────────────────────────────────────────
// BUILD TASK — Lab 10 (Prescribed — Senior level, Section 20.3)
// ─────────────────────────────────────────────────────────────

export const LAB10_BUILD_TASK = {
  id: 'lab10-build-task',
  title: 'Lab 10 Build Task — Institutional DeFi Operations Playbook',
  level: 'senior',
  progressionModel: 'prescribed',
  prompt: `
Produce a DeFi Operations Playbook for a $500,000 Starknet DeFi treasury.
The playbook must cover five sections as specified. No options — this is a prescribed deliverable.
  `.trim(),
  sections: [
    { id: 'S1', title: 'Treasury Allocation', requirement: 'Allocate $500,000 across at least 5 Starknet protocols. Apply a 25% per-protocol concentration limit and a 45% per-asset limit. Show risk-adjusted yield calculation (Sharpe estimate) for each protocol. State the rationale for each allocation percentage.' },
    { id: 'S2', title: 'Tax and Compliance Record Template', requirement: 'Design a transaction record template covering all five DeFi action types (swap, yield receipt, LP entry, LP exit, liquidation). Include all required fields: timestamp, type, asset in/out, amounts, USD value at time of event, resulting gain/income. Provide one worked example for each action type.' },
    { id: 'S3', title: 'Correlation and Exit Criteria', requirement: 'For each of your five protocols, identify its correlation to the crypto market (high/medium/low with one-sentence rationale). Define a pre-written exit criterion for each position: specific trigger (health factor, price level, or governance event), action sequence, and who has decision authority.' },
    { id: 'S4', title: 'Monitoring Stack', requirement: 'Define your three-layer monitoring stack: specific tools for on-chain alerts, portfolio dashboard, and security news. For each layer, state what it detects and the target response time from alert to action.' },
    { id: 'S5', title: 'Emergency Procedure Cards', requirement: 'Write emergency procedure cards for your two highest-value positions. Each card must include: trigger conditions, ordered action sequence (for multi-leg positions), decision authority, time estimate per action, and override conditions for accelerated exit.' },
  ],
  verificationCriteria: [
    'S1: All five protocols listed with allocation, concentration limit check passing, Sharpe rationale present',
    'S2: Template includes all five action types. Each worked example has all required fields populated with realistic numbers.',
    'S3: Correlation ratings justified with specific rationale. Exit criteria are specific observable triggers (numbers, not vague conditions).',
    'S4: Three layers defined with specific tool names (not generic descriptions). Response time targets stated.',
    'S5: Two procedure cards written. Each has all five required elements. Action sequence is ordered for multi-leg positions.',
  ],
};


// ─────────────────────────────────────────────────────────────
// BOSS BATTLE — Lab 10
// ─────────────────────────────────────────────────────────────

export const LAB10_BOSS_MODE = {
  id: 'lab10-boss',
  title: 'Boss Battle — Institutional DeFi Operations',

  phase1: {
    label: 'Phase 1 — Learning Loop',
    hintsEnabled: true,
    portfolioPush: false,
    drawCount: 8,
    taskPool: [
      { id: 'tp-01', type: 'judgment-riskAssess', task: '$400K treasury, 25% limit. Protocol A: $115K. Is this within limits? Calculate excess.', scoringCriteria: ['$115K / $400K = 28.75% — exceeds 25% limit', 'Excess: $115K − $100K = $15K needs redeployment', 'Action: reduce Protocol A by $15K'] },
      { id: 'tp-02', type: 'judgment-dataInterpret', task: 'Two protocols: A — 28% APY, Sharpe 0.5. B — 11% APY, Sharpe 1.9. Which receives the larger treasury allocation?', scoringCriteria: ['B receives larger allocation — Sharpe 1.9 vs 0.5 means B generates 3.8× more return per unit of risk', 'Raw APY comparison favours A but risk-adjusted comparison favours B', 'Apply larger weighting to B, cap A at experimental-level allocation'] },
      { id: 'tp-03', type: 'judgment-communication', task: 'Explain what performance attribution reveals that a simple 14% APY number does not.', scoringCriteria: ['Attribution breaks the 14% into source-specific components: durable (Vesu, staking) vs condition-dependent (LP volume, funding rates)', 'A 14% that is 8% durable + 6% condition-dependent will likely fall to ~8% in normal conditions', 'Attribution enables realistic forward planning and identifies which positions to size up vs wind down'] },
      { id: 'tp-04', type: 'judgment-riskAssess', task: 'Protocol with unresolved medium audit finding + 4 months in production. Standard 25% limit or adjusted? What limit?', scoringCriteria: ['Adjusted — unresolved finding + short production history both warrant reduction', '8–12% appropriate. Not 0% (position can be taken at limited size) and not 25% (not mature enough)', 'Specific rationale: unresolved finding represents identified but unpatched risk. Short production history = limited battle-testing.'] },
      { id: 'tp-05', type: 'judgment-dataInterpret', task: 'Weekly review: 4 positions all fell 7–11% this week. Expected: 2 crypto-correlated, 1 moderate, 1 stablecoin uncorrelated. Interpret.', scoringCriteria: ['The stablecoin position declining 7–11% contradicts its design as uncorrelated', 'Either: (a) the stablecoin position has an overlooked crypto-correlated component, (b) de-peg occurred, or (c) it was miscategorised', 'Action: audit the "stablecoin" position immediately. If genuinely uncorrelated, the 7–11% decline needs explanation.'] },
      { id: 'tp-06', type: 'judgment-communication', task: 'Why must exit criteria be written before a position is opened, not when the trigger is approaching?', scoringCriteria: ['Under pressure, emotional biases (loss aversion, hope) override rational analysis', 'Pre-written criteria encode your clear-headed judgment before stress — they run automatically when the trigger fires', 'Writing criteria at the trigger moment reintroduces the emotional decision the criteria were designed to remove'] },
      { id: 'tp-07', type: 'judgment-riskAssess', task: 'You need to exit $800K from a $6M TVL protocol. Single exit vs tranche plan?', scoringCriteria: ['Single exit: $800K / $6M = 13.3% of TVL — large utilisation impact, visible market signalling', 'Tranche: 4 × $200K over 2 weeks. Each = 3.3% of TVL — acceptable.', 'Emergency exception: single exit acceptable if security alert received. Speed > efficiency in emergencies.'] },
      { id: 'tp-08', type: 'judgment-dataInterpret', task: 'Swap: you sold 5,000 STRK at $0.94 (cost basis $0.68). Staking rewards: 200 STRK received at $0.92. Calculate the two taxable events.', scoringCriteria: ['Swap: capital gain = 5,000 × ($0.94 − $0.68) = $1,300', 'Staking rewards: 200 × $0.92 = $184 ordinary income. Cost basis for the 200 STRK = $0.92/STRK', 'Total taxable in this set: $1,300 capital gain + $184 income'] },
      { id: 'tp-09', type: 'judgment-riskAssess', task: 'Emergency procedure requires team consensus. Alert received. Team assembly time: 6 min. Exploit window: 4 min. What is the correct immediate action?', scoringCriteria: ['Override consensus requirement. Initiate withdrawal unilaterally immediately.', 'The procedure is flawed for emergency scenarios — correct it post-event.', 'Prioritise capital preservation over procedure compliance when procedure guarantees response after the window.'] },
      { id: 'tp-10', type: 'judgment-communication', task: 'Explain the passive STRK benchmark and when active DeFi strategy fails to justify itself.', scoringCriteria: ['Passive benchmark: hold STRK + native staking — what you earn with zero operational overhead or protocol risk', 'Active fails to justify: when active APY < passive APY after accounting for smart contract risk, operational time, IL, and funding costs', 'Specific failure case: active 13% vs passive 18% (STRK appreciated strongly) — active strategy imposed risk and overhead for 5% less return'] },
      { id: 'tp-11', type: 'judgment-dataInterpret', task: 'Protocol X: last audit 16 months ago, 4 new features added post-audit. Is the protocol fully audited? What is the correct risk category for the new features?', scoringCriteria: ['Not fully audited. The 4 new features are unaudited additions.', 'Original code: audited (16 months ago). New features: unaudited — treat as same risk as a new protocol.', 'Action: treat protocol as partially unaudited. Reduce concentration limit from standard 25% to 12–15% until a re-audit covers the new features.'] },
      { id: 'tp-12', type: 'judgment-riskAssess', task: 'Multi-leg position HF = 1.26. Exit procedure trigger: HF ≤ 1.3. What is the correct action and who can authorise it?', scoringCriteria: ['HF 1.26 < 1.3 trigger — procedure is activated', 'Action: execute the pre-defined step (e.g. repay 30% of borrow)', 'Authority: pre-delegated unilateral action by any team member. No consensus required — procedure explicitly states this at this trigger level.'] },
      { id: 'tp-13', type: 'judgment-communication', task: 'Explain in 2 sentences why yield attribution must separate Ekubo LP fee income from other yield sources.', scoringCriteria: ['Ekubo fee income is driven by swap volume, which is correlated with market volatility. In low-volatility periods, fee income drops significantly.', 'Attributing Ekubo fees as durable yield overstates the predictable return base. In quarterly planning, Ekubo contribution should be scenario-ranged, not assumed at peak levels.'] },
      { id: 'tp-14', type: 'judgment-dataInterpret', task: 'Performance: Active 15.2% vs Passive 14.8% this year. Is the active strategy justified?', scoringCriteria: ['Active outperformed by 0.4% — marginal', '0.4% on a $500K portfolio = $2,000 outperformance. Operational overhead (hours/week × 52 weeks) likely exceeds $2,000 in time value', 'Borderline: the strategy needs to generate at least 1.5–2% outperformance to justify operational complexity and smart contract risk overhead. 0.4% likely does not clear that bar.'] },
      { id: 'tp-15', type: 'judgment-riskAssess', task: 'Protocol governance: 2-of-5 multisig proposes to change liquidation parameters. You have $600K deposited. Assess the governance risk.', scoringCriteria: ['2-of-5 threshold: only 2 signers must be compromised to approve any upgrade, including one that drains the protocol', 'Parameter changes to liquidation engine can affect all depositors — this is a high-impact governance action', 'Response: evaluate who the 5 signers are, whether the change is audited, and whether the 2-of-5 threshold for this type of change is appropriate. Consider reducing allocation until governance threshold is improved or the specific change is audited.'] },
    ],
  },

  phase2: {
    label: 'Phase 2 — Portfolio Push',
    hintsEnabled: false,
    portfolioPush: true,

    portfolioDefensePrompt: `
Your Lab 9 portfolio includes an Advanced Primitives Strategy covering perps, flash loan defence, and LST collateral.
Before we proceed to the institutional assessment:
In your Lab 9 LST collateral position, what would trigger an emergency exit under your Lab 10 operations framework?
Specifically: what health factor threshold, who has decision authority, and how long does a full exit take given your Starkgate withdrawal timeline from Lab 8?
    `.trim(),

    scenario: `
You manage a $600,000 Starknet DeFi treasury for a family office.
The principals have asked for a comprehensive quarterly operations report covering four sections.

Section 1 — Current Allocation Review
The current allocation is: Vesu USDC supply $165K (27.5%), Ekubo ETH/USDC LP $140K (23.3%), STRK staking $120K (20%), wBTC lending on Vesu $95K (15.8%), new protocol yield boost $80K (13.3%).
Identify concentration limit violations (25% max per protocol), calculate required rebalancing, and state which protocols have single-asset exposure that may approach the 45% asset limit.

Section 2 — Performance Attribution
Q3 returns: Vesu USDC $5,800, Ekubo LP net of IL $9,200 (Q3 had 2.5× normal volatility), STRK staking $4,300, wBTC lending $3,100, new protocol $2,900. Total: $25,300 = 4.22% quarterly = 16.9% annualised.
Passive benchmark: STRK +6% Q3 + staking 2.2% = 8.2% quarterly. 
Evaluate: did the active strategy outperform? What is the durable yield estimate for Q4?

Section 3 — Risk Events This Quarter
Event 1: Vesu governance proposed a 3-of-7 multisig for protocol upgrades (currently direct team control). Position: $165K + $95K = $260K across two Vesu positions. Assess whether this is a positive or negative governance development.
Event 2: wBTC fell 18% mid-quarter. Your wBTC lending position collateral was wBTC. Calculate what happened to the health factor on a $95K position with $55K borrowed, and whether the emergency procedure should have triggered.

Section 4 — Q4 Operating Procedures Update
Based on the Q3 events: update the emergency procedure trigger for the wBTC lending position, update the concentration limit assessment for the new protocol (4 months in production, no audit yet), and define the tax record for the three largest Q3 transactions (Ekubo LP fee claim, Vesu yield claim, one STRK staking reward).
    `.trim(),

    scoringCriteria: [
      'S1: Vesu USDC at 27.5% exceeds 25% limit — excess $15K. New protocol at 13.3% — within limit. USDC total (Vesu + potentially wBTC USDC borrow exposure): flagged correctly.',
      'S1: Rebalancing: reduce Vesu USDC by $15K. Redistribute to STRK staking or cash reserve.',
      'S2: Active Q3 = 4.22%. Passive = 8.2%. Active underperformed passive by 3.98% this quarter.',
      'S2: Durable Q4 estimate: Vesu $5,800 + staking $4,300 + wBTC $3,100 = $13,200 quarterly = ~8.8% annualised. Ekubo Q3 was elevated by volatility — Q4 likely normalises to 40–50% of Q3 level.',
      'S3 Event 1: 3-of-7 multisig is a positive governance development — requires 3 compromised parties versus current direct team control. More decentralised, harder to compromise unilaterally. Positive for concentration limit assessment.',
      'S3 Event 2: wBTC −18%. Position $95K → $95K × 0.82 = $77,900. HF = ($77,900 × 0.83) / $55,000 = $64,657 / $55,000 = 1.176. Below 1.3 warning threshold — emergency procedure should have triggered for partial borrow repayment.',
      'S4: wBTC procedure update — trigger at HF ≤ 1.35 (given 18% wBTC volatility, the previous 1.3 threshold fires too close to liquidation. Raise to 1.35 for wBTC-collateral positions).',
      'S4: New protocol at 4 months, no audit — appropriate limit is 8–10% ($48–60K). Current $80K (13.3%) exceeds appropriate limit for unaudited protocol. Reduce by $20–30K.',
      'S4: Tax records for three transactions correctly structured with timestamp, type, asset in/out, amounts, USD value at time, resulting gain/income.',
      'Portfolio defense answered: Lab 9 LST HF trigger identified, unilateral authority stated, Starkgate 12-hour withdrawal timeline factored into exit time estimate.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/senior/lab-10-institutional-operations/',
      files: [
        {
          filename: 'institutional-operations-report.md',
          type: 'narrative' as const,
          content: `# Lab 10 — Institutional DeFi Operations: Certification

## Portfolio Defense — Lab 9 LST Exit Protocol
**LST collateral HF trigger:** HF ≤ [threshold]
**Decision authority:** [who, unilateral or consensus]
**Full exit timeline:** Repay borrow [X min] + withdraw LST from Vesu [Y min] + Starkgate withdrawal up to 12 hrs + L1 claim. Total: [hours]

## Section 1 — Allocation Review

| Protocol | Allocation | % | Limit Status |
|---|---|---|---|
| Vesu USDC | $165K | 27.5% | ⚠ Exceeds 25% — reduce by $15K |
| Ekubo LP | $140K | 23.3% | ✓ |
| STRK staking | $120K | 20% | ✓ |
| wBTC lending | $95K | 15.8% | ✓ |
| New protocol | $80K | 13.3% | ⚠ Exceeds unaudited limit |

**Required rebalancing:** [specific amounts and destinations]
**Single-asset exposure check:** [USDC total across protocols vs 45% limit]

## Section 2 — Performance Attribution

| Source | Q3 Return | Q4 Durable? |
|---|---|---|
| Vesu USDC | $5,800 | Yes — utilisation-driven |
| Ekubo LP | $9,200 | Partial — 2.5× normal volatility |
| STRK staking | $4,300 | Yes — protocol-native |
| wBTC lending | $3,100 | Yes |
| New protocol | $2,900 | Uncertain — unaudited |

**Q3 active:** 4.22% quarterly | **Passive benchmark:** 8.2% quarterly
**Outperformance:** [positive/negative] [amount]
**Q4 durable estimate:** $[amount] = [%] annualised

## Section 3 — Risk Events

**Governance (Vesu 3-of-7 multisig):**
Assessment: [positive/negative] — [rationale with specific multisig threshold comparison]

**wBTC −18% event:**
HF calculation: $95K × 0.82 = $[value]. HF = ($[value] × 0.83) / $55K = [HF]
Emergency procedure trigger: [did it trigger / should it have]

## Section 4 — Operating Procedures Update

**wBTC emergency procedure — updated trigger:** HF ≤ [new threshold] — rationale: [wBTC volatility analysis]

**New protocol concentration limit:** Unaudited, 4 months production → max [%] = $[amount]. Current $80K exceeds by $[amount]. Reduce by [date].

**Tax records — three largest Q3 transactions:**

| # | Date | Type | Asset In | Asset Out | Amount | USD Value at Event | Gain/Income |
|---|---|---|---|---|---|---|---|
| 1 | [date] | LP fee claim | USDC | — | $[amount] | $[amount] | $[amount] income |
| 2 | [date] | Lending yield | USDC | — | $[amount] | $[amount] | $[amount] income |
| 3 | [date] | Staking reward | STRK | — | [STRK] | $[amount] | $[amount] income |

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 10 Institutional DeFi Operations — Senior Starknet DeFi Navigator',
      badgeEarned: 'Institutional DeFi Operations Certified — Senior',
    },
    feedbackFormat: 'phase2-criteria-pass-fail-only' as const,
  },
};

export const NAVIGATOR_LAB_10_META = {
  id: 'navigator-senior-lab-10',
  title: 'Institutional DeFi Operations',
  trackId: 'starknet-defi-navigator',
  level: 'senior' as const,
  labNumber: 10,
  estimatedHours: 7.0,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 9 Phase 2 complete',
  description: 'Risk-adjusted treasury allocation, tax and compliance record requirements, correlation-aware position management, protocol risk at institutional scale, DeFi operations monitoring and performance attribution.',
  nextLab: 'Lab 11 — Strategy Research and Competitive Analysis',
};
