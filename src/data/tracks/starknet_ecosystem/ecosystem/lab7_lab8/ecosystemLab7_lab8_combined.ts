// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// INTERMEDIATE · LAB 7 — CROSS-CHAIN COMPETITIVE ANALYSIS
// INTERMEDIATE · LAB 8 — ECOSYSTEM GAPS AND OPPORTUNITY ANALYSIS
//
// Lab 7 prerequisite: Labs 1–6 complete.
// Lab 8 prerequisite: Labs 1–7 complete.
//
// Lab 7 types: all TYPE A (comparative analysis — DEX, lending, perps, capital flows, synthesis)
// Lab 8 types: all TYPE A (gap identification and opportunity analysis)
//
// Data sources for Lab 7: DefiLlama, TokenTerminal, Dune Analytics

// ═══════════════════════════════════════════════════════════════
// LAB 7 — CROSS-CHAIN COMPETITIVE ANALYSIS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// L7.1 — DEX Comparison Across Chains
// TYPE A — Normalised metrics expose what absolute TVL hides:
// volume/TVL ratio, fee revenue per user, protocol concentration.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_1 = {
  id: 'l7-1-dex-comparison',
  title: 'DEX Comparison Across Chains',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
Comparing DeFi ecosystems by TVL alone is like comparing cities by parking-lot capacity. A city might have enormous parking capacity that sits empty all day. Another city might have a fraction of the capacity but every space is occupied from morning to night. Raw capacity says nothing about how hard the asset is working.

The same problem applies to DEX comparison. Ethereum's $35B DEX TVL vs Starknet's $200M DEX TVL looks like a crushing comparison — but it tells you size, not efficiency. Three normalised metrics reveal what the TVL comparison obscures.

THREE NORMALISED DEX METRICS

METRIC 1 — VOLUME/TVL RATIO (CAPITAL EFFICIENCY)
Formula: daily trading volume ÷ total TVL
Interpretation: what percentage of locked liquidity generates trading activity each day.

Chain benchmarks (approximate):
Ethereum Uniswap v3: ~20% (daily volume is 20% of TVL)
Arbitrum: ~18%
Solana (Raydium, Orca): ~40% (inflated by near-zero fee bot activity)
Starknet Ekubo: ~18%

Starknet's 18% matches Arbitrum — capital is working as hard as on a mature L2 despite Starknet being 25× smaller by TVL. The Solana figure looks impressive but is substantially driven by high-frequency bots that are economically unviable at Ethereum/Arbitrum fee levels.

METRIC 2 — FEE REVENUE PER DAILY ACTIVE USER
Formula: daily fee revenue ÷ daily active wallets
Interpretation: average value generated per trading session — a proxy for user quality.

Approximate cross-chain:
Ethereum: ~$10–20/user (high gas costs self-select for high-value trades)
Arbitrum: ~$3–5/user
Solana: ~$0.25/user (many bot transactions, tiny trade sizes)
Starknet: ~$4–6/user (competitive with Arbitrum — DeFi-native early adopters)

Starknet's revenue per user is comparable to Arbitrum's and far above Solana's — suggesting its current user base is genuinely active DeFi participants rather than airdrop farmers or bots.

METRIC 3 — TOP PROTOCOL CONCENTRATION
Formula: volume share held by the single largest DEX on the chain.

Ethereum: Uniswap ~60%
Arbitrum: Camelot ~40–45%
Solana: Raydium ~50%
Starknet: Ekubo ~92%

Ekubo's 92% is the highest concentration among major DeFi chains. This signals two things simultaneously: (1) Ekubo has the strongest composability moat of any DEX on its chain — 7+ protocol integrations creating structural lock-in (L6.3). (2) A single point of failure: an Ekubo exploit or outage would disrupt 92% of Starknet DEX capacity simultaneously. Analysts must report both signals.

THE FULL COMPARISON TABLE

Metric, Ethereum, Arbitrum, Solana, Starknet:
DEX TVL: $35B / $4B / $1.5B / $200M
Volume/TVL: 20% / 18% / 40%* / 18%
Revenue/User: $15 / $4 / $0.25 / $5
Top Protocol %: 60% / 43% / 50% / 92%
(*Solana inflated by bot activity)

Reading this table: Starknet's capital efficiency and user quality match mature chain benchmarks. The 92% concentration and $200M absolute TVL are the standout gaps. The concentration is both a lead and a risk. The absolute TVL gap is the primary growth lever.
  `.trim(),

  keyTakeaway: `Volume/TVL ratio (~18% matches Arbitrum), fee revenue per user (~$5 matches Arbitrum), and top protocol concentration (92% Ekubo — strongest moat, highest single-point fragility) are the three normalised metrics that reveal Starknet's DEX competitive position more accurately than absolute TVL comparisons.`,

  examples: [
    {
      contextTag: '[Solana volume/TVL ratio decoded]',
      context: 'A report claims Solana\'s 40% volume/TVL is evidence of superior capital efficiency vs Ethereum\'s 20%.',
      scenario: 'An analyst checks fee revenue per user: Solana $0.25, Ethereum $15. Near-zero Solana fees enable thousands of sub-cent arbitrage bot transactions per second — high volume, minimal value per transaction.',
      outcome: 'Capital efficiency in raw volume/TVL is inflated by bots. Per-user revenue ($0.25 vs $15) shows genuine human economic activity is far lower on Solana relative to apparent volume. Both metrics together give the complete picture.',
    },
    {
      contextTag: '[Ekubo 92% as dual signal]',
      context: 'A competitor chain\'s marketing states: "Starknet\'s fragile DEX — one protocol has 92% share."',
      scenario: 'An analyst applies the full framework: 92% reflects Ekubo\'s composability moat (7+ protocol integrations, structural switching costs). But it also means an Ekubo exploit would simultaneously disable 92% of Starknet DEX capacity. Arbitrum\'s 43% concentration at Camelot has less moat but more resilience.',
      outcome: 'Both signals reported: "Ekubo\'s 92% reflects a strong, integration-backed moat and a material single-point-of-failure risk — both must be disclosed in research."',
    },
    {
      contextTag: '[DefiLlama cross-chain comparison workflow]',
      context: 'An analyst pulls data from defillama.com/chains for Starknet vs Arbitrum.',
      scenario: 'Starknet 30-day DEX volume: $1.1B. TVL: $200M. Volume/TVL: ~18%. Arbitrum 30-day DEX volume: $24B. TVL: $4B. Volume/TVL: ~20%. She then uses Dune for DAU and TokenTerminal for revenue per user.',
      outcome: 'Her conclusion: capital efficiency within 2 percentage points of Arbitrum. Absolute TVL gap 20×. Revenue per user comparable. "Starknet punches above its weight on efficiency — it needs scale, not redesign."',
    },
  ],

  guidedPractice: [
    {
      question: 'Chain A: $5B DEX TVL, $900M daily volume. Chain B: $500M DEX TVL, $90M daily volume. Which has higher capital efficiency?',
      options: ['A. Chain A — larger absolute volume', 'B. Both equal at 18% volume/TVL ratio', 'C. Chain B — smaller chains are always more efficient', 'D. Cannot compare without protocol count'],
      correct: 1,
      explanation: 'B is correct. Chain A: $900M ÷ $5B = 18%. Chain B: $90M ÷ $500M = 18%. Identical capital efficiency despite 10× TVL difference. Raw TVL comparison would imply Chain A dominates; normalised comparison shows parity.',
    },
    {
      question: 'Solana DEXs have volume/TVL of 40%, Ethereum 20%. But Solana fee revenue per user is $0.25 vs Ethereum\'s $15. How do you reconcile these?',
      options: ['A. The data is inconsistent', 'B. Solana\'s high volume/TVL is bot-driven — near-zero fees enable sub-cent bot trades. Ethereum\'s fee structure self-selects for high-value human trades, producing lower volume/TVL but far higher value per transaction.', 'C. Solana data must be wrong', 'D. Volume/TVL is the only metric that matters'],
      correct: 1,
      explanation: 'B is correct. Near-zero fees on Solana make thousands of tiny arbitrage transactions economically viable, inflating volume. Ethereum\'s $5-20 gas cost filters out sub-threshold bot activity, leaving higher-value human trades. Both metrics together tell the full story.',
    },
    {
      question: 'Ekubo holds 92% of Starknet DEX volume. What are the two opposing signals this creates?',
      options: ['A. Strong moat AND high single-point-of-failure risk — both must be reported', 'B. Only positive — market dominance is always good', 'C. Only negative — concentration is always fragility', 'D. Neither — market share is irrelevant for risk analysis'],
      correct: 0,
      explanation: 'A is correct. 92% signals: (1) Ekubo has a strong composability moat backed by 7+ protocol integrations that create structural switching costs for dependent protocols. (2) An Ekubo exploit or outage disables 92% of Starknet DEX capacity simultaneously — a critical single-point-of-failure. Both signals are real and both must be disclosed.',
    },
    {
      question: 'Starknet DEX volume/TVL is 18% — matching Arbitrum. What does this tell you about Starknet\'s DEX ecosystem relative to its absolute TVL gap?',
      options: ['A. Nothing — absolute TVL is the only signal that matters', 'B. Capital efficiency matches a mature L2 — the gap is scale, not how hard capital is working. Starknet needs more TVL, not redesigned protocols.', 'C. It means Starknet is overperforming and will definitely catch Arbitrum', 'D. It means Starknet DEXs are less efficient because they should be higher for an early chain'],
      correct: 1,
      explanation: 'B is correct. Matching Arbitrum\'s capital efficiency at 25× smaller absolute size indicates the protocols Starknet has are well-designed and well-used. The growth constraint is user acquisition and TVL, not protocol quality. This is a meaningful analytical distinction.',
    },
    {
      question: 'TokenTerminal shows a Starknet DEX: FDV $180M, annualised revenue $1.2M. P/E ratio and interpretation?',
      options: ['A. 150× — within mature protocol range (50-200×), pricing moderate growth expectations', 'B. 6.7× — significantly below mature range, deeply undervalued', 'C. 1,500× — extreme growth pricing', 'D. Cannot calculate without token price'],
      correct: 0,
      explanation: 'A is correct. $180M ÷ $1.2M = 150×. This falls squarely in the Uniswap historical range (50–300×). At 150× the market prices meaningful but not extreme revenue growth. This is a reasonable starting-point valuation for a growing early-stage DEX with a defensible moat.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Pull Starknet vs Arbitrum data from the simulator: 30-day TVL change, 30-day fee revenue, and daily active users. Calculate Starknet as a percentage of Arbitrum for each metric. Identify: which metric shows Starknet punching above its TVL weight?',
      scoringCriteria: ['Reads all three metrics for both chains correctly', 'Calculates Starknet/Arbitrum ratio for each', 'Correctly identifies daily active users or revenue-per-user as the metric where Starknet likely outperforms its TVL share ratio — indicating higher engagement density'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Cross-chain DEX data: Ethereum $35B TVL / $7B daily vol / 45,000 DAU. Arbitrum $4B / $700M / 28,000 DAU. Solana $1.5B / $600M / 120,000 DAU. Starknet $200M / $36M / 8,000 DAU. Fee rate 0.15% all chains. Calculate volume/TVL and revenue/user for each. Which chain has (a) highest capital efficiency, (b) highest revenue/user, (c) most bot-dominated activity?',
      scoringCriteria: ['Volume/TVL: Ethereum 20%, Arbitrum 17.5%, Solana 40%, Starknet 18%', 'Revenue/user: Ethereum $23.3, Arbitrum $3.75, Solana $0.75, Starknet $6.75 — Starknet highest among L2s', 'Most bot-dominated: Solana — 40% volume/TVL but $0.75 revenue/user vs Starknet\'s 18%/$6.75'],
    },
    {
      type: 'sandbox-research-writer',
      scenario: 'Write a 200-word DEX comparison subsection for a cross-chain report. Cover: Starknet vs Ethereum and Arbitrum on volume/TVL and revenue/user. Note Ekubo\'s concentration as a dual signal. State Starknet\'s relative position and what it needs to change to improve its weakest normalised metric.',
      scoringCriteria: ['Uses volume/TVL and revenue/user as primary metrics, not raw TVL', 'Ekubo concentration described as both moat signal and fragility risk', 'Weakest metric correctly identified: absolute user count — Starknet needs more users, not more efficient ones'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L7.2 — Lending Comparison Across Chains
// TYPE A — Utilisation rate and interest spread normalise lending
// comparisons; collateral diversity sets the TAM ceiling.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_2 = {
  id: 'l7-2-lending-comparison',
  title: 'Lending Comparison Across Chains',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
A bank with $1B in deposits lending out $100M (10% utilisation) is larger but far less productive than a $100M-deposit bank lending $85M (85%). For lending protocols, utilisation rate is the equivalent of volume/TVL for DEXs — the normalised metric that shows whether capital is working.

THREE NORMALISED LENDING METRICS

METRIC 1 — UTILISATION RATE
Formula: total borrows ÷ total deposits

Cross-chain benchmarks:
Ethereum Aave: 65–75%
Arbitrum Aave: 60–70%
Solana Marginfi/Kamino: 65–75%
Starknet Vesu + Nostra: 60–68%

Starknet is in line with all competitors. The capital that has been deposited is being borrowed at a healthy rate — suggesting real demand for Starknet borrowing, not just yield farming deposits.

METRIC 2 — INTEREST RATE SPREAD (NET INTEREST MARGIN)
Formula: average borrow APY − average supply APY

Cross-chain for USDC:
Ethereum Aave: 1.2–2.0%
Arbitrum: 1.0–1.8%
Solana: 0.8–1.5%
Starknet: 1.8–2.8%

Starknet carries a wider spread — a standard early-market premium from lower competition. As more lending protocols launch on Starknet, competition will compress spreads toward Ethereum/Arbitrum benchmarks. For today's LPs, Starknet offers higher margin. For borrowers, it is a 0.5–1.0% cost premium.

METRIC 3 — COLLATERAL DIVERSITY
Types of assets accepted as collateral.

Ethereum Aave: 30+
Arbitrum: 20+
Solana Marginfi: 12–15
Starknet Vesu: 5–8

This is Starknet's clearest structural lending gap. Starknet's 5–8 collateral types vs Ethereum's 30+ means an entire class of borrowers — those holding mid-cap ecosystem tokens, staked assets, or LP positions — cannot borrow on Starknet today.

The growth path: each new Starknet protocol token added as collateral opens a new borrower class. The constraint is Pragma oracle coverage (every new collateral needs reliable price data) and risk parameter setting (LTV, liquidation threshold per asset).

SUSTAINABILITY CHECK

From L6.4: at 65% utilisation with typical Starknet rates (8% borrow APY, 5.5% supply APY), Vesu earns:
Net interest revenue = ($35M × 8%) − ($50M × 5.5%) = $2.8M − $2.75M = $50,000

The spread is thin at these parameters. Vesu is approximately at break-even on net interest at these rates — relying on its early-market premium (wider spreads) for meaningful profitability. As competition increases and spreads compress, maintaining profitability requires either higher utilisation or fee revenue diversification.
  `.trim(),

  keyTakeaway: `Starknet lending matches competitor chains on utilisation rate (60–68%) and earns an early-market spread premium (1.8–2.8% vs 1.0–2.0% on Ethereum) — but with only 5–8 collateral types vs 30+ on Ethereum, collateral expansion is the single largest growth lever for the lending category.`,

  examples: [
    {
      contextTag: '[Utilisation rate comparison in practice]',
      context: 'Two Starknet lending protocols: Vesu $45M deposits, $31M borrows; Nostra $12M deposits, $9.6M borrows.',
      scenario: 'Vesu: 69% utilisation. Nostra: 80% utilisation. Nostra\'s higher rate means scarcer supply APY — likely higher supply yield for depositors. Near 80–85%, borrow rates spike to slow demand.',
      outcome: 'Nostra deposits are relatively more productive. At 80% utilisation, rate model will begin raising borrow APY to protect depositor liquidity — useful signal for LP positioning.',
    },
    {
      contextTag: '[Spread premium as temporary advantage]',
      context: 'Starknet Vesu: USDC borrow 7.5%, supply 5.0%. Ethereum Aave: USDC borrow 6.2%, supply 4.8%.',
      scenario: 'Vesu spread: 2.5%. Aave spread: 1.4%. Vesu earns 1.1pp more per dollar borrowed. This is an early-market premium from less competition.',
      outcome: 'Her report: "Vesu\'s 2.5% spread vs Aave\'s 1.4% will compress as Starknet lending competition increases — likely toward 1.5–2.0% within 12–18 months. Today\'s LP advantage is temporary but real."',
    },
    {
      contextTag: '[Collateral gap limiting borrower TAM]',
      context: 'A fund holds $5M of a Starknet ecosystem token and wants to borrow USDC against it without selling.',
      scenario: 'Vesu and Nostra do not list the token as collateral. On Ethereum Aave, an equivalent-tier Ethereum ecosystem token would be borrowable. The fund is forced to either sell or forgo the opportunity.',
      outcome: 'Concrete TAM limitation: "This class of sophisticated borrowing — borrowing against ecosystem token holdings — is available on Ethereum, unavailable on Starknet. Each unlisted asset is a borrower category excluded."',
    },
  ],

  guidedPractice: [
    {
      question: 'Vesu: $60M deposits, $42M borrows. Nostra: $25M deposits, $22.5M borrows. Which has higher utilisation and what does it imply?',
      options: ['A. Vesu 70%; Nostra 90%. Nostra near capacity — borrow rates likely rising.', 'B. Vesu 70%; Nostra 80%.', 'C. Both 70%.', 'D. Cannot determine without APY data.'],
      correct: 0,
      explanation: 'A is correct. Vesu: $42M ÷ $60M = 70%. Nostra: $22.5M ÷ $25M = 90%. Nostra at 90% is near the kink point where most rate models sharply raise borrow APY to protect liquidity buffer. For depositors this is good (high APY). For borrowers, borrowing costs rise.',
    },
    {
      question: 'Starknet lending spread is 2.3% vs Ethereum Aave\'s 1.4%. Most likely explanation?',
      options: ['A. Starknet lending is better managed', 'B. Early-market premium — less competition on Starknet means protocols maintain wider spreads. Competition will compress toward Ethereum benchmark over time.', 'C. Starknet borrowers are higher risk', 'D. ZK proofs require a security surcharge'],
      correct: 1,
      explanation: 'B is correct. Fewer competing lending protocols on Starknet means less rate competition. This is standard economics: less competition → higher margins. As Starknet matures and more protocols launch, spreads will compress toward the efficient equilibrium seen on Ethereum.',
    },
    {
      question: 'At 40% utilisation, Vesu has $50M deposits at 8% borrow APY and 5% supply APY. What is net protocol revenue?',
      options: ['A. $300K', 'B. −$900K (negative — lending to depositors costs more than borrowers pay)', 'C. $1.2M', 'D. $0'],
      correct: 1,
      explanation: 'B is correct. At 40% utilisation: borrows = $20M. Interest generated = $20M × 8% = $1.6M. Distributed = $50M × 5% = $2.5M. Net = $1.6M − $2.5M = −$900K. The protocol pays depositors $900K more than borrowers pay it — unsustainable. This is why utilisation below the break-even point triggers automatic rate adjustments.',
    },
    {
      question: 'What is the single most impactful growth action for Starknet\'s lending TAM?',
      options: ['A. Lower borrow APY', 'B. Add new collateral types — each new asset listed opens borrowing to holders of that asset', 'C. Increase supply APY to attract more deposits', 'D. Launch a third lending protocol'],
      correct: 1,
      explanation: 'B is correct. The primary constraint is collateral coverage — borrowers can only use assets the protocol lists and prices. Each new asset added opens a new class of borrowers previously excluded. Lower APY (A) or more deposits (C) improve conditions for existing borrower types but do not expand the universe of eligible borrowers.',
    },
    {
      question: 'Starknet vs Ethereum lending: utilisation rates are comparable (65% vs 68%), but collateral types are 6 vs 30+. What does this combination tell you?',
      options: ['A. Starknet lending is working well for its current addressable market but the addressable market is structurally limited by narrow collateral coverage', 'B. Starknet lending is underperforming on all dimensions', 'C. Collateral count is irrelevant — only TVL matters', 'D. Starknet has better risk management by accepting fewer asset types'],
      correct: 0,
      explanation: 'A is correct. Comparable utilisation shows that the capital currently deposited is being borrowed at a healthy rate — existing users are actively using the protocols. The low collateral count limits how many new users can access Starknet lending. The existing TAM is well-served; the potential TAM is capped until collateral coverage expands.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Lending data: Ethereum $40B deposits / 68% util / 1.5% spread / 30+ collateral. Arbitrum $3B / 63% / 1.3% / 20+. Solana $500M / 72% / 1.1% / 12. Starknet $120M / 65% / 2.3% / 6. Calculate net protocol revenue per $1 of TVL for each. Which chain generates the highest net margin per deposit dollar? What drives Starknet\'s position?',
      scoringCriteria: ['Net margin per deposit ≈ utilisation × spread. Ethereum: 0.68 × 1.5% = 1.02%. Arbitrum: 0.63 × 1.3% = 0.82%. Solana: 0.72 × 1.1% = 0.79%. Starknet: 0.65 × 2.3% = 1.50%. Starknet generates highest margin per deposit dollar.', 'Correctly identifies driver: early-market spread premium (2.3% vs 1.1–1.5% peers) compensates for utilisation not being highest.', 'Notes this advantage is temporary — competition will compress Starknet\'s spread.'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Starknet lending ($120M TVL at 65% utilisation) shares Pragma as the sole oracle. Pragma experiences a 10-minute outage during a period when ETH drops 15%. Model: which positions are at risk, what prevents liquidations, what happens when Pragma restores, and whether this is recoverable.',
      scoringCriteria: ['At-risk positions: ETH-collateralised borrowers whose health factors dropped below 1.0 during the price drop. Without price updates, the protocol cannot identify or process them.', 'What prevents liquidations: Pragma offline means no current price → no health factor calculation → liquidation bots cannot determine which positions to close.', 'Post-restoration: protocol reads the lower price simultaneously for all positions. Multiple under-collateralised positions liquidated at once — potential cascade as liquidated ETH sells into a falling market.', 'Recoverability: depends on LTV conservatism. Conservative LTV (70% max) gives a larger buffer — 15% price drop still leaves most positions above total-loss threshold.'],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a 150-word cross-chain lending comparison section. Cover: utilisation (Starknet vs Ethereum and Arbitrum), spread, collateral diversity gap, and one sentence on the growth lever. Use specific numbers. No use of "significant", "robust", "notable".',
      scoringCriteria: ['Utilisation comparison with specific numbers (Starknet 65%, Ethereum 68%, Arbitrum 63%)', 'Spread comparison with specific numbers (Starknet 2.3% vs Ethereum 1.5% — temporary early-market premium)', 'Collateral count stated specifically (6 vs 30+) with implication', 'Growth lever stated as one specific action: adding 5–10 collateral types with Pragma oracle support'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L7.3 — Perpetuals Comparison Across Chains
// TYPE A/B MIXED — Funding rate primer + open interest as the
// key metric; the Starknet/Hyperliquid gap is a user problem,
// not an infrastructure problem.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_3 = {
  id: 'l7-3-perps-comparison',
  title: 'Perpetuals Comparison Across Chains',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
PERPS MECHANICS PRIMER

Mark price: the current trading price of the perpetual contract.
Index price: the spot price of the underlying asset averaged across major exchanges.
Funding rate: a payment every 8 hours between longs and shorts that keeps mark price close to index price.

When mark > index (longs dominant): longs pay shorts. This punishes excess bullishness and pulls the contract price back toward spot.
When mark < index (shorts dominant): shorts pay longs.

A positive funding rate of 0.04% per 8 hours = 0.12%/day = 43.8% annualised cost for longs. Signals extremely crowded long positioning.

THE OPEN INTEREST COMPARISON

Open interest (OI) is the total value of all active leveraged positions — the perps equivalent of TVL.

Chain / platform, OI (approximate):
Hyperliquid (Ethereum L2): $3B — global DeFi perps leader
dYdX (own chain): $500M
GMX on Arbitrum: $400M
Drift on Solana: $200M
Extended on Starknet: $8M

Starknet-to-Hyperliquid ratio: 1:375.

THE ROOT CAUSE OF THE GAP

Starknet's infrastructure is theoretically well-suited to perps: STARK proof finality in hours, Account Abstraction for session-key-based automated strategies, sub-cent transaction fees. The gap is not infrastructure — it is user acquisition.

Perps traders are a specific community concentrated on Hyperliquid and centralised exchanges. They care about: sub-100ms execution, tight bid-ask spreads, deep OI on major pairs, and a track record. Hyperliquid built a purpose-specific orderbook for this community and has two years of brand recognition.

Extended on Starknet uses an AMM model (not a native orderbook), which is easier to build on a general-purpose chain but produces less efficient execution for large orders. This is a product gap on top of a user acquisition gap.

REVENUE SCALING

From L6.4: perps revenue = OI × funding rate × protocol fee share × 3 × 365.

At $8M OI: ~$26,000 annual revenue
At $100M OI (12.5× growth): ~$328,000 annual revenue
At $1B OI (125× growth): ~$3.3M annual revenue

Revenue scales linearly with OI. The constraint is getting traders to Starknet — not protocol math.
  `.trim(),

  keyTakeaway: `Perpetuals open interest is the key metric — Starknet Extended's $8M vs Hyperliquid's $3B represents a 1:375 gap driven by user acquisition failure, not infrastructure, and revenue scales linearly with open interest so closing even 10% of the gap produces 37.5× revenue growth.`,

  examples: [
    {
      contextTag: '[Funding rate as sentiment signal]',
      context: 'STRK has risen 40% in two weeks. Extended funding rate: +0.08% per 8 hours.',
      scenario: '0.08% × 3 × 365 = 87.6% annualised cost for longs. Extremely overcrowded long positioning — longs paying an enormous premium.',
      outcome: 'Interpretation: high positive funding rate signals extreme bullish positioning and a likely reversion trigger — when longs eventually unwind the crowded position, price corrects sharply. A contrarian short is attractive at very high positive funding.',
    },
    {
      contextTag: '[Infrastructure vs user acquisition as the gap cause]',
      context: 'A journalist writes: "Extended cannot compete because Starknet\'s technology isn\'t designed for perps."',
      scenario: 'An analyst checks: STARK proofs provide fast L2 finality. Account Abstraction enables automated strategy execution. Sub-cent fees. All suitable for perps. The issue is Hyperliquid has a purpose-built orderbook and two years of brand recognition with the trader community.',
      outcome: '"The infrastructure criticism is inaccurate. The gap is user acquisition — perps traders have concentrated on Hyperliquid and CEXs because of UX and track record, not because Starknet\'s architecture is unsuitable."',
    },
    {
      contextTag: '[Revenue growth from OI scaling]',
      context: 'A protocol investor models Extended revenue at three OI milestones.',
      scenario: 'Current $8M: $26,280/year. At $300M (same as Drift): $986,000/year. At $1B: $3.3M/year.',
      outcome: 'At $1B OI with a $50M FDV, implied P/E = 50M/3.3M ≈ 15×. At that scale the protocol trades at a compelling value multiple. The execution challenge is getting from $8M to $1B OI — a user acquisition, not revenue model, problem.',
    },
  ],

  guidedPractice: [
    {
      question: 'Funding rate is +0.04% per 8 hours. What does this tell you about market positioning?',
      options: ['A. Shorts dominant — shorts paying longs', 'B. Longs dominant — longs paying shorts 0.04% per period to maintain overcrowded long positions', 'C. Neutral positioning', 'D. Extreme bearish'],
      correct: 1,
      explanation: 'B is correct. Positive funding = mark price above index = longs overcrowded. Longs pay shorts the funding rate to maintain their positions. 0.04% × 3 × 365 = 43.8% annualised cost for longs — a meaningful signal of bullish excess.',
    },
    {
      question: 'Extended has $8M OI. Hyperliquid has $3B. The most accurate description of the gap\'s root cause?',
      options: ['A. Starknet tech is unsuitable for perps', 'B. User acquisition failure — perps traders concentrated on Hyperliquid\'s purpose-built orderbook, not because of Starknet infrastructure gaps', 'C. Extended has higher fees than Hyperliquid', 'D. Starknet governance restricted perps'],
      correct: 1,
      explanation: 'B is correct. Starknet\'s infrastructure (fast finality, low fees, AA) is theoretically compatible with perps. The gap reflects where the perps community developed: Hyperliquid built specifically for leveraged traders, established 2 years of track record, and the perps community concentrated there by default.',
    },
    {
      question: 'Extended: $8M OI, 0.025% funding rate per 8h, 10% protocol share. Annual revenue?',
      options: ['A. $21,900', 'B. $219,000', 'C. $2,190', 'D. $2,190,000'],
      correct: 1,
      explanation: 'B is correct. Per 8h: $8M × 0.00025 × 0.10 = $200. Daily: $200 × 3 = $600. Annual: $600 × 365 = $219,000.',
    },
    {
      question: 'If Extended OI grows from $8M to $400M, how does annual revenue change (same rates)?',
      options: ['A. 50× — linear scaling means 50× OI = 50× revenue', 'B. Unchanged — revenue is fixed', 'C. 2× — revenue grows at half the OI growth rate', 'D. 400× growth'],
      correct: 0,
      explanation: 'A is correct. Perps revenue formula: OI × constant factors. Revenue scales linearly with OI. 400M ÷ 8M = 50× OI growth = 50× revenue growth. $219,000 × 50 = $10.95M annually at $400M OI.',
    },
    {
      question: 'AMM vs orderbook for perpetuals: what is the key trade-off for Extended?',
      options: ['A. AMMs are always superior — no counterparty needed', 'B. Orderbooks provide tighter spreads and better execution for large orders; AMMs are easier to build on a general-purpose chain but produce slippage on large trades — a real product gap for Extended vs Hyperliquid', 'C. Orderbooks are always superior', 'D. No difference in practice'],
      correct: 1,
      explanation: 'B is correct. An orderbook matches buyers and sellers directly — deep OI enables tight bid-ask spreads. AMMs always have a counterparty but large trades move the pool price, creating slippage. For a $1M perps trade, an orderbook with deep OI executes at a fraction of a basis point of slippage; an AMM pool may move 50–100 bps. This is why serious perps traders prefer Hyperliquid\'s orderbook.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Perps comparison: Hyperliquid $3B OI / 0.02% funding / 5% share. dYdX $500M / 0.025% / 8%. GMX $400M / 0.01% / 15%. Extended $8M / 0.03% / 10%. Calculate annual revenue for each. Calculate revenue per dollar of OI. Explain why Extended\'s higher revenue/OI doesn\'t offset its absolute OI gap.',
      scoringCriteria: ['Annual revenues: Hyperliquid $3.285M, dYdX $1.095M, GMX $657K, Extended $26.3K', 'Revenue/OI: Hyperliquid 0.11%, dYdX 0.22%, GMX 0.16%, Extended 0.33% — Extended highest', 'Correctly explains: $26K × (3B/8M) = $9.8M if Extended had Hyperliquid\'s scale. The per-dollar efficiency advantage is irrelevant at current scale — absolute OI is the binding constraint.'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A fund holds $2M STRK and wants a $1.5M short hedge. Evaluating Extended ($8M OI) vs Hyperliquid ($3B OI). Identify: (1) execution risk on Extended for $1.5M short, (2) same risk on Hyperliquid, (3) recommendation, (4) one Starknet-native advantage that might still favour Extended.',
      scoringCriteria: ['Extended: $1.5M = 18.75% of total OI — massive market impact, slippage on entry and exit, funding rate distortion', 'Hyperliquid: $1.5M = 0.05% of OI — negligible impact, tight execution', 'Recommendation: Hyperliquid for this size', 'Starknet-native advantage: AA session keys enable automated hedge management (adjust position if STRK moves past threshold) without manual approval per transaction — not available natively on Hyperliquid'],
    },
    {
      type: 'sandbox-research-writer',
      scenario: 'Write a 200-word perpetuals section for a cross-chain report. Cover: top three chains by OI with numbers, Starknet Extended\'s position and root cause of gap, and revenue projection if Extended reaches 5% of Hyperliquid ($150M OI).',
      scoringCriteria: ['Three leading chains with OI: Hyperliquid $3B, dYdX $500M, GMX $400M', 'Extended characterised as $8M OI, 1:375 ratio, gap is user acquisition not infrastructure', 'Revenue at $150M OI: $150M × 0.03% × 10% × 3 × 365 ≈ $493K annual — approximately 19× current'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L7.4 — Capital Flow Patterns and TVL Ratio Analysis
// TYPE A — DEX/Lending and Perps/DEX ratios reveal ecosystem
// maturity stage; new wallet growth distinguishes organic from
// price-driven TVL expansion.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_4 = {
  id: 'l7-4-capital-flow-patterns',
  title: 'Capital Flow Patterns and TVL Ratio Analysis',
  trackType: 'A',
  lessonNumber: 4,

  explanation: `
A city's economic profile is readable from which businesses fill its high streets. A city with only restaurants but no banks, insurance companies, or law firms has a specific profile — early consumer activity without financial infrastructure. A mature city has all of these. DeFi ecosystems follow the same progression, and the ratios between protocol categories are the legible signal.

THREE DIAGNOSTIC RATIOS

RATIO 1 — DEX TVL TO LENDING TVL
A mature ecosystem has roughly equal capital in trading (DEXs) and capital management (lending). As ecosystems develop, lending TVL grows toward DEX TVL.

Benchmarks (DEX ÷ Lending):
Ethereum: 0.875:1 (near parity — mature)
Arbitrum: 1.33:1 (DEX-dominant but lending present)
Solana: 3:1 (heavily DEX-dominant, lending underdeveloped)
Starknet: 1.67:1 (past early stage, lending growing)

A declining ratio over time is a maturation signal — lending catching up to DEXs.

RATIO 2 — PERPS OPEN INTEREST TO DEX TVL
Measures how much leveraged trader activity exists relative to spot activity.

Ethereum: 0.14:1
Arbitrum: 0.10:1
Hyperliquid-centric ecosystem: 6:1 (purpose-built for traders)
Starknet: 0.04:1

Starknet's 0.04:1 confirms its current user base is primarily spot DeFi users — not leveraged traders. This is consistent with its early-stage profile and its Account Abstraction-first user acquisition strategy, which targets mainstream consumers rather than sophisticated traders.

RATIO 3 — NEW WALLET GROWTH RATE
Monthly new wallets as % of existing wallet base. Distinguishes organic user acquisition from price-driven TVL growth.

Ethereum: 0.2–0.5%/month (mature, slow)
Arbitrum: 1–3%/month
Starknet: 2–4%/month (above mature-chain levels — growing)

TVL growing during an asset price rally is partly price-driven. New wallet growth confirms whether actual humans are joining.

READING ALL THREE TOGETHER FOR STARKNET

DEX/Lending at 1.67:1 → past early stage, lending still catching up. Watch for ratio declining toward 1.3 over 4 quarters.
Perps/DEX at 0.04:1 → minimal leveraged trading. Perps is the clearest under-served user category.
New wallets 2–4%/month → above mature chain levels — user acquisition is happening.

Synthesis: Starknet is a growing spot DeFi ecosystem with an active user acquisition engine and a clear next-stage target — attracting leveraged traders and building out the collateral/lending diversity needed for maturation.
  `.trim(),

  keyTakeaway: `DEX/Lending ratio 1.67:1 (past early stage, lending still catching up), Perps/DEX ratio 0.04:1 (minimal leveraged trading), and 2–4% monthly new wallet growth (above mature-chain levels) together show Starknet as a growing spot-DeFi ecosystem with perps as the clearest next-stage opportunity.`,

  examples: [
    {
      contextTag: '[Declining DEX/Lending ratio as maturation signal]',
      context: 'Analyst tracks Starknet DEX/Lending TVL ratio quarterly.',
      scenario: 'Q1: 2.67:1. Q2: 1.94:1. Q3: 1.67:1. Consistently declining — lending growing faster than DEXs.',
      outcome: '"Three consecutive quarters of ratio decline confirms lending maturation. If trend continues, Starknet reaches Arbitrum\'s 1.33:1 within 2–3 quarters. This is one of the clearest positive ecosystem signals in current data."',
    },
    {
      contextTag: '[Decomposing TVL growth]',
      context: 'Starknet TVL up 40% in a quarter. ETH and STRK both up ~35% in the same period. New wallets up 8%.',
      scenario: 'Price appreciation alone explains ~35% TVL growth. Actual growth was 40% — 5pp above what price appreciation explains. New wallet growth of 8% confirms new participants joining.',
      outcome: '"40% TVL growth: approximately 35% price-driven, ~5pp organic. Monitor: if TVL holds or grows during a market correction, confirms organic foundation. If it follows price down 1:1, the organic component was smaller than estimated."',
    },
    {
      contextTag: '[Starknet vs Hyperliquid user profile contrast]',
      context: 'Analyst compares Starknet (0.04:1 perps/DEX) and Hyperliquid (6:1) for a "capital flow" report.',
      scenario: 'The two ecosystems serve completely different user profiles at this stage — Starknet: spot users, mobile-first, AA-native. Hyperliquid: leveraged traders, speed-focused.',
      outcome: '"Starknet and Hyperliquid are not competing for the same users today. Both can grow without directly displacing each other. The risk for Starknet: if leveraged trading becomes the dominant on-chain activity type, Starknet\'s 0.04:1 ratio means it\'s poorly positioned to capture that trend without perps improvement."',
    },
  ],

  guidedPractice: [
    {
      question: 'Ethereum DEX/Lending = 0.875:1. Starknet = 1.67:1. What does the difference indicate?',
      options: ['A. Starknet is more efficient', 'B. Ethereum\'s near-1:1 reflects a mature balanced ecosystem. Starknet\'s 1.67:1 means lending is underdeveloped relative to trading — consistent with earlier ecosystem stage.', 'C. Starknet has better DEXs', 'D. The ratio is irrelevant'],
      correct: 1,
      explanation: 'B is correct. A 1:1 ratio indicates balanced development of trading and capital management. A higher DEX/Lending ratio means trading infrastructure is more mature than lending infrastructure — characteristic of earlier-stage ecosystems where users discover DEXs before lending.',
    },
    {
      question: 'Starknet Perps/DEX = 0.04:1 vs Hyperliquid 6:1. What do these tell you about their respective user profiles?',
      options: ['A. Starknet users are less sophisticated', 'B. Starknet\'s 0.04:1 reflects a spot-DeFi user base. Hyperliquid\'s 6:1 reflects a leveraged-trader-centric ecosystem. Different user types — not competing for the same users.', 'C. Starknet is failing to attract any traders', 'D. Hyperliquid is reckless with high leverage concentration'],
      correct: 1,
      explanation: 'B is correct. Perps trading attracts specific expert users comfortable with leverage risk. Spot DEX activity attracts a broader base. Starknet has optimised (via AA, mobile onboarding) for the broader base — which is a deliberate strategy, not a failure.',
    },
    {
      question: 'Starknet TVL grew 40% in a quarter when assets appreciated 35%. New wallets grew 8%. How much of TVL growth is approximately organic?',
      options: ['A. All 40% — organic', 'B. ~5pp organic (above what price appreciation explains), confirmed by 8% new wallet growth', 'C. 8% organic, 32% price-driven', 'D. 100% price-driven'],
      correct: 1,
      explanation: 'B is correct. Asset appreciation of 35% would produce approximately 35% TVL growth on existing deposits. Actual 40% growth is ~5pp above this — suggesting ~5pp of organic new deposits. New wallet growth of 8% confirms new participants are joining, supporting the organic estimate.',
    },
    {
      question: 'Which combination of signals best indicates genuine Starknet ecosystem maturation?',
      options: ['A. 50% TVL growth during a 45% market rally', 'B. DEX/Lending ratio declining from 2.5:1 to 1.5:1 over 4 quarters, new wallet growth sustained at 3%/month, perps/DEX ratio rising from 0.04 to 0.10', 'C. STRK price up 100%', 'D. Major media coverage'],
      correct: 1,
      explanation: 'B is correct. Each signal tests a different maturity dimension: declining DEX/Lending ratio → lending developing alongside trading. Sustained new wallet growth → user acquisition is structural. Rising perps/DEX → sophisticated trader category beginning to develop. Three independent positive signals across different ecosystem dimensions.',
    },
    {
      question: 'A competitor claims: "Starknet\'s 0.04:1 perps/DEX ratio proves it\'s failing to attract serious DeFi users." How do you respond?',
      options: ['A. Agree — low perps ratio is always a failure signal', 'B. The ratio is a stage indicator, not quality. Ethereum also has a low perps/DEX ratio (0.14:1). Starknet\'s ratio reflects its current spot-user profile — a deliberate positioning, not a failure.', 'C. Agree partly — Starknet should shut down Extended', 'D. Completely dismiss — perps/DEX ratio is irrelevant'],
      correct: 1,
      explanation: 'B is correct. The perps/DEX ratio indicates what the current user base is doing — not whether the ecosystem is well-built. Ethereum has a similarly low perps/DEX ratio and is not considered to have "failed to attract serious users." The ratio reflects ecosystem focus and user demographics, not failure.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'TVL data: Ethereum DEX $35B / Lending $40B / Perps $5B. Arbitrum DEX $4B / Lending $3B / Perps $400M. Solana DEX $1.5B / Lending $500M / Perps $200M. Starknet DEX $200M / Lending $120M / Perps $8M. Calculate DEX/Lending and Perps/DEX ratios for all four. Identify: (a) most balanced ecosystem, (b) most trader-centric, (c) Starknet\'s primary growth opportunities from the ratios.',
      scoringCriteria: ['DEX/Lending: Ethereum 0.875, Arbitrum 1.33, Solana 3.0, Starknet 1.67. Perps/DEX: Ethereum 0.143, Arbitrum 0.10, Solana 0.133, Starknet 0.04', '(a) Most balanced: Ethereum — closest to 1:1 DEX/Lending, perps present but not dominant', '(b) Most trader-centric among the four: Solana at 0.133 (Hyperliquid would be far higher at 6:1 but not in this comparison set)', '(c) Starknet growth opportunities: lending growth to lower DEX/Lending toward 1.3 (collateral expansion), and perps growth to raise Perps/DEX toward 0.10 (user acquisition from trader community)'],
    },
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Use the Ecosystem Read simulator. Pull Starknet vs Arbitrum on three metrics: 30-day TVL change, 30-day fee revenue, daily active users. Calculate Starknet as % of Arbitrum on each metric. Identify which metric shows Starknet outperforming its TVL share (punching above weight) and which shows underperformance.',
      scoringCriteria: ['Reads all three metrics correctly for both chains', 'Calculates ratio for each correctly', 'Correctly identifies DAU/engagement metrics as where Starknet likely outperforms TVL share — consistent with high-quality user base observation in L7.1'],
    },
    {
      type: 'sandbox-research-writer',
      scenario: 'Write a 200-word Capital Flow Pattern Analysis section. Cover all three ratios (DEX/Lending, Perps/DEX, new wallet growth) with specific numbers and cross-chain context. State Starknet\'s current development stage. Identify the single metric that, if it changed materially, would most update your stage assessment.',
      scoringCriteria: ['All three ratios with specific numbers and chain comparisons', 'Stage assessment specific: e.g. "post-early-DeFi, active spot ecosystem, developing lending, minimal perps"', 'Most diagnostic changing metric identified: DEX/Lending ratio continuing to decline toward 1.3 would confirm maturation thesis; perps/DEX rising above 0.10 would signal trader community beginning to migrate'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L7.5 — Synthesis: Starknet's Gaps and Leads Framework
// TYPE A — Five-dimension structured assessment with monitoring signals.
// ─────────────────────────────────────────────────────────────

export const LAB7_LESSON_5 = {
  id: 'l7-5-gaps-and-leads',
  title: "Synthesis: Starknet's Gaps and Leads Framework",
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
Labs 1–7 have built every analytical tool for a complete competitive assessment. This lesson assembles them.

THE FIVE DIMENSIONS

LEADS (Starknet ahead):
1. Proof System: STARK proofs, no trusted setup. Security from hash functions alone. Competitors (ZKSync, Polygon zkEVM) require a ceremony whose integrity rests on human behaviour. This is an unconditional mathematical advantage.
   Monitor: SNARK ceremony integrity challenges; Ethereum adopting STARKs.

2. Mobile UX / Account Abstraction: Native AA enables Face ID onboarding, session keys, gasless transactions. 80%+ of new Starknet wallets created on mobile with biometrics. EVM chains require seed phrases and browser extensions as baseline.
   Monitor: AA-native app count on Starknet; EIP-4337 app count on ZKSync.

3. Long-Term Throughput: Recursive proof composition demonstrated. Theoretical batch size grows with recursive layers — no fixed block-space ceiling the way EVM chains face. Volition and sequencer decentralisation on roadmap.
   Monitor: Proof batch size; average transaction cost trend.

LAGS (Starknet behind):
4. Developer Ecosystem: Cairo ~3,000 developers vs Solidity ~150,000. Package ecosystem 47+ vs 4,200+. The gap is measurable, large, and closes slowly.
   Monitor: Cairo developer count quarterly.

5. Application TVL: $800M vs Arbitrum $20B (4%), Ethereum $60B (1.3%). Normalised metrics are competitive; absolute scale is far behind.
   Monitor: Starknet/Arbitrum TVL ratio quarterly.

ALSO LAGGING (from Lab 7 data):
6. Trader ecosystem: Perps/DEX ratio 0.04:1 — the leveraged trader community has not migrated to Starknet.
   Monitor: Extended OI monthly.

THE FIVE MONITORING SIGNALS
1. Cairo developer count — target: 10%+ quarterly growth
2. DEX/Lending TVL ratio — target: below 1.5 within 4 quarters
3. AA-native app count — target: doubling annually
4. Extended OI — target: 10%/month growth for 6 consecutive months
5. Starknet/Arbitrum TVL ratio — target: 4% → 6% within 4 quarters

These five leading indicators will reflect competitive position changes before lagging indicators (absolute TVL) catch up.

THE COUNTER-THESIS (required for intellectual honesty)

EVM-compatible ZK rollups capture developer mindshare at scale. The 150,000 Solidity developers never learn Cairo. Applications built on EVM-compatible chains become "good enough" for everything Cairo does natively. Starknet gets squeezed between Arbitrum (TVL leader) and ZKSync (EVM-ZK leader).

For this counter-thesis to be correct: (1) EVM-ZK chains must close the AA gap — add native AA equivalent to Starknet's. (2) No large-scale ZK-native application category must emerge that specifically requires Cairo's architecture. Both are plausible. Neither is inevitable.
  `.trim(),

  keyTakeaway: `Starknet leads on proof system security (STARK, no trusted setup), mobile UX (native AA), and long-term throughput (recursive proofs) — and lags on developer ecosystem, absolute TVL, and perps trader acquisition — with five specific monitoring signals that indicate whether the competitive position is strengthening before absolute TVL reflects it.`,

  examples: [
    {
      contextTag: '[VC pitch review using the framework]',
      context: 'A VC pitch deck claims: "Starknet is the leading ZK rollup in every meaningful dimension."',
      scenario: 'Analyst applies Gaps and Leads: leads confirmed on proof system, UX, throughput. Lags not mentioned: developer ecosystem (1:50 vs Solidity), absolute TVL (4% of Arbitrum), perps gap (0.04:1).',
      outcome: '"The pitch overstates the position. A credible deck presents both leads and lags — the leads are genuinely compelling and don\'t need enhancement. A deck that only presents leads will be identified as unbalanced by sophisticated investors. Recommend adding the Gaps and Leads card honestly."',
    },
    {
      contextTag: '[Mid-year monitoring signal review]',
      context: 'Analyst reviews five signals at mid-year.',
      scenario: 'S1 Cairo devs: +20%. S2 DEX/Lending: 1.67→1.48 (ahead). S3 AA apps: doubled. S4 Extended OI: $8M→$11M (+37.5%, slightly below 10%/month target). S5 Starknet/Arbitrum TVL: 4.0%→4.8% (ahead).',
      outcome: '"Four of five on track or ahead. Signal 4 (OI) the only laggard — 37.5% half-year implies ~88% annualised, below 10%/month (214% annualised) target. Perps thesis not yet materialising at required pace. Maintain thesis on other four dimensions; flag perps for Q3 review."',
    },
    {
      contextTag: '[Counter-thesis stress test]',
      context: 'ZKSync announces native AA support equivalent to Starknet\'s, launching in 90 days.',
      scenario: 'Analyst maps which dimensions are affected: UX lead narrows (from "leads" to "tied" or "marginal lead"). Proof system lead unchanged. Throughput unchanged. Developer ecosystem unchanged.',
      outcome: '"UX advantage narrows. If ZKSync delivers full AA at comparable quality, Starknet loses one of three leads. Remaining two leads (proof system, throughput) are sufficient to maintain a differentiated thesis, but user acquisition momentum must come primarily from the composability ecosystem Starknet has already built around AA — that is harder to copy quickly than adding the technical feature."',
    },
  ],

  guidedPractice: [
    {
      question: 'What is the specific evidence supporting Starknet\'s proof system lead?',
      options: ['A. STARK proofs verify faster', 'B. STARK proofs require no trusted setup ceremony — security from hash functions alone, with no scenario where a past participant could generate false proofs. SNARKs require a ceremony whose security rests on at least one participant being honest.', 'C. StarkWare holds more ZK patents', 'D. Ethereum endorsed STARKs'],
      correct: 1,
      explanation: 'B is correct. The no-trusted-setup property is the specific, verifiable advantage. No ceremony = no trust assumption on any human behaviour during setup. This is a mathematical property, not a marketing claim.',
    },
    {
      question: 'Which dimension represents Starknet\'s most significant lag and why?',
      options: ['A. Proof system — other chains will develop no-trusted-setup proofs', 'B. Developer ecosystem — the 1:50 Cairo-to-Solidity developer ratio closes slowly, compounds into fewer applications, and is the primary constraint on TVL growth', 'C. Application TVL — TVL will catch up automatically', 'D. Mobile UX — other chains will add AA'],
      correct: 1,
      explanation: 'B is correct. The developer gap is the largest, most structurally persistent, and most consequential lag. Fewer Cairo developers → fewer protocols built → lower TVL → weaker composability ecosystem. Closing it requires years of educational investment. It is both the largest current gap and the slowest to close.',
    },
    {
      question: 'If Arbitrum TVL grows 30% (from $20B to $26B), what absolute Starknet TVL achieves the 6% target?',
      options: ['A. $1.2B (6% of original $20B)', 'B. $1.56B (6% of new $26B)', 'C. $800M (current is already 4%)', 'D. $1.04B (current TVL growing 30%)'],
      correct: 1,
      explanation: 'B is correct. The target is 6% of Arbitrum\'s TVL at the end of the period. 6% × $26B = $1.56B. Starting from $800M, Starknet must grow ~95% to reach $1.56B while Arbitrum grows 30%. Ratio-based targets are harder to hit when the denominator also grows.',
    },
    {
      question: 'Extended OI monthly data over 6 months: $8M, $9.2M, $10.6M, $12.2M, $14.0M, $16.1M. Is this on target with 10%/month?',
      options: ['A. No — absolute growth slowing each month', 'B. Yes — each month shows ~15% growth (consistently above 10% target)', 'C. No — $16.1M is still far below Hyperliquid', 'D. Yes — total growth is 101% over 6 months'],
      correct: 1,
      explanation: 'B is correct. Month-on-month rates: 15%, 15.2%, 15.1%, 14.8%, 15%. All above the 10% monthly target. Absolute dollar increments grow ($1.2M, $1.4M, etc.) because compound growth produces larger absolute additions each period — this is expected and correct. At 15%/month, Extended reaches $1B OI in approximately 42 months from current.',
    },
    {
      question: 'A VC insists on seeing Starknet\'s competitive lags before allocating. Why is this request legitimate?',
      options: ['A. Not legitimate — VCs focus on upside', 'B. A thesis that only presents leads cannot be evaluated — lags define execution risk, the probability of each failure mode, and the conditions under which the investment thesis fails. Lags are the information needed to size the position correctly.', 'C. Only legitimate if the VC has concerns', 'D. Legitimate only if disclosing developer ecosystem lag'],
      correct: 1,
      explanation: 'B is correct. An investment thesis must be evaluable on both upside and downside. Leads justify the bet. Lags define the risk. Without knowing the lags, the VC cannot assess: What could go wrong? How likely is it? How would we know early? These questions require the lags. A presentation that only shows leads implicitly asks the investor to be blind to downside — which is a red flag, not a feature.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: '12-month signal review: S1 Cairo devs 3,000→3,800 (+26.7%). S2 DEX/Lending 1.67→1.41. S3 AA apps 12→26 (+116%). S4 Extended OI $8M→$22M (+175%). S5 Starknet/Arbitrum TVL ratio 4.0%→5.1%. Rate each as On Track / Ahead / Below Target. State overall thesis update.',
      scoringCriteria: ['S1 On Track (26.7% vs 40% annual target = slightly below but reasonable). S2 Ahead (hit 1.41, below 1.5 target). S3 Ahead (doubled). S4 Below Target ($22M vs $25M at 10%/month = 175% vs 214% annualised — slightly below). S5 Below Target (5.1% vs 6%).', 'Thesis update: developer ecosystem and lending maturation theses progressing. TVL closure and perps slightly behind. No dimension in crisis — incremental monitoring required on S4 and S5.'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'ZKSync announces native AA support equivalent to Starknet\'s, launching 90 days. Using the Gaps and Leads framework, model: (1) which dimension changes, (2) how overall competitive position shifts, (3) which monitoring signals become more critical, (4) one specific defensive action Starknet should take.',
      scoringCriteria: ['UX dimension narrows from "leads" to "tied/marginal lead" if ZKSync delivers comparable implementation', 'Overall: two leads remain (proof system, throughput). One lead becomes a tie. Three lags unchanged.', 'More critical signals: AA-native app count (does Starknet\'s composability ecosystem create retention even if ZKSync adds AA?); Cairo developer count (if UX parity achieved, developer ecosystem becomes decisive differentiator)', 'Defensive action: accelerate composability — get more protocols to build AA-native features that create switching costs. AA as a technical feature can be copied; AA as an integrated ecosystem advantage cannot be quickly replicated.'],
    },
    {
      type: 'sandbox-research-writer',
      scenario: 'Write a 300-word "Cross-Chain Competitive Landscape" section covering DEX, lending, and perps. Include specific normalised metrics for each category, the Gaps and Leads summary (two leads, two lags, one signal each), and one sentence on the counter-thesis. Use specific numbers throughout.',
      scoringCriteria: ['DEX: volume/TVL comparison with numbers; Ekubo concentration as dual signal', 'Lending: utilisation and spread comparison; collateral diversity gap stated specifically', 'Perps: OI comparison ($8M vs $3B) with user acquisition root cause', 'Gaps/Leads card complete with evidence and monitoring signals', 'Counter-thesis stated honestly in one sentence'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 7 — STRUCTURE
// ─────────────────────────────────────────────────────────────

export const LAB7_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: ['starkzap-ecosystem-read', 'sandbox-research-writer', 'judgment-dataInterpret', 'judgment-riskAssess'],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  description: 'Random draw from all 5 Lab 7 lessons. Tests normalised cross-chain DEX/lending/perps metrics, capital flow ratio analysis, and competitive synthesis. No labels. No hints.',
};

export const LAB7_BUILD_TASK = {
  id: 'ecosystem-lab-7-build',
  title: 'Cross-Chain Comparison Report',
  labProgressionNumber: 7,
  selectionMode: 'user-choice-3',
  availableTasks: [
    { id: '7a', title: 'Option A: DEX Ecosystem Comparison', description: 'Starknet vs Ethereum and Arbitrum on volume/TVL, revenue/user, protocol concentration. Use DefiLlama and Dune. Output: dex-comparison-report.md' },
    { id: '7b', title: 'Option B: Lending Ecosystem Comparison', description: 'Starknet vs Ethereum and Solana on utilisation, spread, collateral diversity. Include the growth lever. Output: lending-comparison-report.md' },
    { id: '7c', title: 'Option C: Full Ecosystem (DEX + Lending + Perps)', description: 'All three categories plus capital flow ratio analysis and Gaps and Leads summary. Output: full-ecosystem-comparison.md' },
  ],
  outputType: 'written-document', outputFormat: 'markdown',
  outputPath: '/intermediate/lab-07-cross-chain/',
};

export const LAB7_BOSS = {
  phase1: { id: 'ecosystem-lab-7-boss-phase1', hints: true, portfolioPush: false, taskPool: { totalTasks: 20, drawPerAttempt: 8, passMark: 0.80 } },
  phase2: {
    id: 'ecosystem-lab-7-boss-phase2', hints: false, portfolioPush: true,
    scenario: `A $5M DeFi allocation committee asks for a cross-chain comparison and recommended allocation ratio across Starknet, Arbitrum, and Ethereum. Provide: normalised DEX comparison (volume/TVL and revenue/user for all three chains), lending comparison (utilisation and spread), perps assessment, capital flow ratios, and your specific recommended allocation with justification.`,
    portfolioArtifact: { repoName: 'starknet-ecosystem-deep-dive', folderPath: '/intermediate/lab-07-cross-chain/', files: [{ filename: 'cross-chain-allocation-brief.md', type: 'narrative' }], commitMessage: 'Passed Lab 7 Cross-Chain Analysis — Intermediate', badgeEarned: 'Cross-Chain Analysis Certified — Intermediate' },
    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const LAB7_META = {
  id: 'ecosystem-intermediate-lab-7', title: 'Cross-Chain Competitive Analysis',
  trackId: 'starknet-ecosystem-deep-dive', level: 'intermediate' as const,
  labNumber: 7, estimatedHours: 6, portfolioPushThisLab: true, portfolioPushPhase: 2,
  lessonCount: 5, prerequisite: 'Labs 1–6 complete',
  description: 'Normalised DEX, lending, and perps comparison across chains; capital flow ratio analysis; five-signal Gaps and Leads monitoring framework.',
  nextLab: 'Lab 8 — Ecosystem Gaps and Opportunity Analysis',
};

// ═══════════════════════════════════════════════════════════════
// LAB 8 — ECOSYSTEM GAPS AND OPPORTUNITY ANALYSIS
// ═══════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────
// L8.1 — The Options Protocol Gap
// ─────────────────────────────────────────────────────────────

export const LAB8_LESSON_1 = {
  id: 'l8-1-options-gap',
  title: 'The Options Protocol Gap',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
OPTIONS PRIMER

An option is a contract giving the buyer the right — but not the obligation — to buy (call) or sell (put) an asset at a specific price before a specific date. Like a restaurant reservation with a cancellation fee: you pay upfront to secure a price. If conditions favour you, you exercise. If not, you lose only the fee.

Call option on ETH at $2,000 strike: if ETH is $2,500 at expiry, your call is worth $500. If ETH is $1,500, you let it expire and lose only the premium. Options enable asymmetric positions — defined maximum loss, theoretically unlimited upside.

On Ethereum: Lyra Finance, Dopex, Panoptic — combined hundreds of millions in TVL, billions in annual volume.
On Starknet: no dominant options protocol. TVL: approximately $0.

THE BOOTSTRAPPING PROBLEM

A spot DEX needs one pool per trading pair — all ETH/USDC liquidity concentrates in one place. An options protocol needs separate liquidity for every combination of: strike price ($1,500, $2,000, $2,500, $3,000…) × expiry date (7-day, 30-day, 90-day…). Potentially 20–30+ pools, each with a fraction of total options trading volume.

This fragmentation means each pool is smaller and generates less fee income per liquidity provider — making market-making less attractive. The bootstrapping problem for options is structurally harder than for spot DEXs.

THE INFRASTRUCTURE IS READY

12 months ago, these were missing. Today, all exist on Starknet:
— Ekubo: deep spot liquidity for delta hedging
— Pragma: multi-source oracle for options pricing
— Vesu: lending for options writers posting collateral
— Account Abstraction: session keys for complex multi-step strategies
— AVNU: execution for automated book hedging

The infrastructure gap is resolved. The team gap remains.

MARKET SIZE

Ethereum DeFi options peak TVL: $200–400M. At 10% Starknet capture: $20–40M TVL. At 50% (Starknet-native breakout): $100–200M TVL. The demand is proven by Ethereum data. On Starknet the category is entirely unaddressed.

REQUIRED EXPERTISE BEYOND TYPICAL DEFI DEVELOPMENT

Building options is not just writing swap contracts. Options market-makers must manage the Greeks — delta (directional sensitivity), gamma (convexity), vega (volatility sensitivity). Without continuous delta hedging, a protocol that sells options accumulates directional risk that can produce catastrophic losses in volatile markets. A team without quantitative finance + DeFi options experience will likely build a technically correct but economically unsafe protocol.
  `.trim(),

  keyTakeaway: `Options have a harder bootstrapping problem than spot DEXs (liquidity fragmented across strike/expiry combinations), but Starknet now has the infrastructure they require — the gap is team-side, not infrastructure-side, and the proven Ethereum market represents $200–400M TAM for the first well-executed Starknet options protocol.`,

  examples: [
    {
      contextTag: '[Sizing the opportunity from Ethereum data]',
      context: 'Lyra Finance peak TVL $120M. Hegic $60M. Panoptic $40M. Combined ~$250–400M.',
      scenario: 'If a Starknet options protocol captures 15% of this benchmark: $37.5–60M TVL.',
      outcome: '"The market is proven. The gap is supply-side — no protocol has been built, not lack of demand."',
    },
    {
      contextTag: '[Options-specific expertise requirement]',
      context: 'A strong AMM team considers building Starknet options.',
      scenario: 'Spot DEX LPs have passive risk (impermanent loss). Options market-makers have active, dynamic risk (gamma, vega). Without continuous delta hedging via Ekubo/AVNU, the protocol accumulates dangerous directional exposure.',
      outcome: '"Your AMM expertise covers the infrastructure design. You need a quantitative market-maker with DeFi options experience for the risk management system — the protocol\'s solvency depends on it."',
    },
    {
      contextTag: '[User need that options address]',
      context: 'A Starknet user holds $50K STRK and wants downside protection.',
      scenario: 'Without options: sell some STRK (loses upside), do nothing (full downside), or use Extended perps short (funding cost, active management). With options: buy STRK put at $0.60 strike / 90-day expiry. Pay $2K premium. If STRK drops below $0.60, the put covers the loss. Maximum loss: the $2K premium.',
      outcome: '"This asymmetric protection — defined max loss, full upside — is unavailable on Starknet today. This is an unmet user need with billions in proven demand on Ethereum."',
    },
  ],

  guidedPractice: [
    {
      question: 'Why is bootstrapping an options protocol harder than bootstrapping a spot DEX?',
      options: ['A. Options smart contracts are more complex to write', 'B. Spot DEXs concentrate all ETH/USDC liquidity in one pool. Options need separate pools per strike × expiry combination — fragmenting liquidity across 20–30+ pools, each generating less fee income, making market-making less attractive.', 'C. Options are legally restricted', 'D. No demand for options on-chain'],
      correct: 1,
      explanation: 'B is correct. Liquidity fragmentation is the structural challenge. A spot DEX pool receives 100% of ETH/USDC trading activity. An options pool for ETH calls at $2,000 strike / 30-day expiry receives a fraction of total options volume — making it harder to build the depth needed for attractive market-making returns.',
    },
    {
      question: 'Which Starknet infrastructure component is most critical for options pricing?',
      options: ['A. AVNU aggregator', 'B. Pragma oracle — options pricing formulas require the current underlying asset price as a core input. A manipulated oracle could enable theft by mispricing options.', 'C. Dojo game engine', 'D. Starkzap SDK'],
      correct: 1,
      explanation: 'B is correct. Options pricing (Black-Scholes and variants) requires the current spot price of the underlying. Pragma\'s multi-source, time-weighted average design specifically mitigates the oracle manipulation attacks that options protocols are particularly vulnerable to (since a fake price can make an option appear more valuable than it is).',
    },
    {
      question: 'Ethereum options protocols peaked at $250–400M TVL. If Starknet captures 15%, what is the implied TVL range?',
      options: ['A. $37.5M–$60M', 'B. $2.5M–$4M', 'C. $150M–$240M', 'D. $37.5M–$60M but only in a bull market'],
      correct: 0,
      explanation: 'A is correct. 15% × $250M = $37.5M. 15% × $400M = $60M. Range: $37.5–60M. This is a meaningful milestone that would make the protocol one of Starknet\'s larger TVL contributors at current ecosystem scale.',
    },
    {
      question: 'Why does options market-making require expertise beyond typical DeFi development experience?',
      options: ['A. It doesn\'t — options are just a different type of swap', 'B. Options market-makers must actively manage the Greeks (delta, gamma, vega) — price sensitivities that change non-linearly. Without continuous delta hedging, the market-maker accumulates directional risk that can produce catastrophic losses in volatile markets.', 'C. Only regulatory expertise is required', 'D. Options market-making is easier because users take the risk'],
      correct: 1,
      explanation: 'B is correct. Spot DEX LPs have a well-characterised, passive risk (impermanent loss). Options market-makers take on dynamic, complex risk that requires continuous active management. A protocol that doesn\'t provide the hedging infrastructure and risk management tools for market-makers will see them suffer losses and leave — collapsing the liquidity the protocol needs to function.',
    },
    {
      question: 'Which Starknet AA feature is most valuable for options traders running complex multi-step strategies?',
      options: ['A. Ekubo deep liquidity', 'B. Session keys — enabling a pre-approved strategy (buy call, simultaneously hedge delta with spot, set automatic closing condition) to execute multiple steps automatically without manual approval for each', 'C. Pragma oracle', 'D. STRK staking'],
      correct: 1,
      explanation: 'B is correct. Session keys allow an options trading interface to execute all steps of a complex strategy within a user-defined scope and time limit, after a single initial approval. On Ethereum, each transaction step requires a separate MetaMask popup. This is a genuine UX advantage for complex multi-step DeFi strategies that Starknet has natively.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Use the simulator\'s opportunity analysis mode. Pull options TVL for Starknet (approximately $0) and Ethereum ($200–400M). Calculate: Starknet as % of Ethereum options market. Annual fee revenue that would be generated at 10% Ethereum capture (assume 0.5% fee on notional, 12× annual notional/TVL ratio). State the 12-month TVL target for a realistic first-mover protocol.',
      scoringCriteria: ['Starknet options TVL ≈ $0. Ethereum options TVL $200–400M. Ratio: 0%.', 'Annual fee at 10% capture: 10% × $300M average × 12 annual turns × 0.5% fee = $1.8M/year — a self-sustaining revenue level', 'Realistic 12-month target: $5–15M TVL (initial market share capture with focused launch of 4–6 pools)'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A team (2 Cairo devs, 1 PM, no options market-making experience) applies for a $300K Foundation Growth Grant to build 12 strike/expiry combinations covering ETH and STRK. Identify: (1) the highest-risk expertise gap, (2) minimum viable MVP scope to reduce bootstrapping risk, (3) whether $300K is appropriately sized.',
      scoringCriteria: ['Highest risk: options market-making knowledge — Greeks management, delta hedging infrastructure. Without this, market-makers lose money and leave.', 'MVP: 2 strikes × 2 expiries = 4 pools, ETH only. Concentrates available market-maker capital instead of fragmenting across 12 pools.', 'Sizing: $300K is Growth Grant level, but Foundation requires demonstrated traction for Growth Grants. Recommend: $100K SEED grant for 4-pool MVP → 6 months live trading → reapply for $300K Growth Grant.'],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-paragraph opportunity memo for the options gap. P1: what the gap is, what infrastructure exists. P2: key constraint and realistic 12-month success metric. Specific numbers throughout. Max 200 words.',
      scoringCriteria: ['P1: $0 Starknet vs $200–400M Ethereum options TVL; infrastructure now exists (Ekubo hedging, Pragma pricing, Vesu collateral, AA session keys)', 'P2: Key constraint = team with options market-making expertise has not yet built on Starknet. 12-month metric: $5M open notional within 12 months of launch, 3 active market-makers providing continuous liquidity across all listed strikes.'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L8.2 — The Yield Aggregator Gap
// ─────────────────────────────────────────────────────────────

export const LAB8_LESSON_2 = {
  id: 'l8-2-yield-aggregator-gap',
  title: 'The Yield Aggregator Gap',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
YIELD AGGREGATOR PRIMER

A yield aggregator automatically moves user capital between DeFi protocols to capture the highest available yield at any moment — without the user manually switching. Yearn Finance pioneered this on Ethereum in 2020, growing to $6B TVL at peak by offering a single vault that automatically rotated capital between Compound, Aave, and other lending protocols based on current APY.

On Ethereum: Yearn, Convex, Beefy — collectively billions in TVL.
On Starknet: no dominant yield aggregator. The category is entirely unaddressed.

WHY IT WAS NOT VIABLE BEFORE — WHY IT IS NOW

12 months ago: Vesu was new with limited history. STRK staking did not exist. DCA protocols were not live. An aggregator had too few stable yield sources to route between.

Today:
— Vesu USDC supply: 5.2% APY, 12+ months of stable operation, $45M TVL
— Nostra USDC supply: 4.8% APY, 8+ months stable, $28M TVL
— STRK staking: 7.5% APY (token-denominated)
— Ekubo USDC-STRK LP: 8.4% fee APY (with impermanent loss risk)

Three stable yield sources with sufficient history now exist. A minimal viable aggregator can route USDC between Vesu and Nostra — expanding to staking and LP as the product matures.

HOW IT WORKS

Step 1: User deposits USDC into the aggregator vault.
Step 2: The aggregator scans current APYs across Vesu, Nostra, and approved LP pools.
Step 3: Allocates capital to the highest risk-adjusted yield given the user's risk tolerance settings.
Step 4: When Vesu APY rises (utilisation increases), aggregator automatically rebalances — moves from Nostra to Vesu.

Account Abstraction session keys enable Step 4 without asking users to manually approve each rebalancing transaction. The user approves once ("This vault can move my USDC between approved protocols, up to $100K per transaction, for 90 days"). All rebalancing is automatic within that scope.

THE BUSINESS MODEL

Performance fee: 15% of generated yield. No token inflation required.

Example at $200M AUM:
Average APY across sources: 5%
Annual yield generated: $200M × 5% = $10M
Aggregator fee: $10M × 15% = $1.5M annual revenue

A self-sustaining, inflation-free revenue model — exactly the "real yield" model that DeFi investors have demanded since the Wonderland collapse.

ACCOUNT ABSTRACTION AS NATIVE ENABLER

On Ethereum, automatic rebalancing requires either a centralised keeper bot (counterparty risk) or complex EIP-4337 implementation (inconsistent wallet support). On Starknet, session keys are native to every wallet — the aggregator vault requests a scoped permission, and all subsequent rebalancing happens trustlessly. This turns a complex infrastructure problem into a standard interaction.
  `.trim(),

  keyTakeaway: `A yield aggregator automatically routes capital between Starknet's now-mature yield sources (Vesu 5.2%, Nostra 4.8%, STRK staking 7.5%) — Account Abstraction session keys enable trustless automatic rebalancing without keepers — and a 15% performance fee on $200M AUM generates $1.5M annual revenue with no token inflation.`,

  examples: [
    {
      contextTag: '[Yearn Finance as market size reference]',
      context: 'Yearn Finance: launched 2020, $6B peak TVL, ~$50M annual revenue at peak.',
      scenario: 'If a Starknet aggregator captures 25% of addressable TVL ($150M lending + $50M staking = $200M addressable): $50M AUM at launch. Revenue: $50M × 5% × 15% = $375K/year. Not yet large, but self-sustaining.',
      outcome: '"The business model is viable at $50M AUM. Yearn\'s trajectory shows that aggregators can scale dramatically as TVL grows — $6B peak from a $100M start in 6 months during the 2020 DeFi summer."',
    },
    {
      contextTag: '[AA as the key implementation advantage]',
      context: 'Developer team comparing Ethereum vs Starknet for yield aggregator implementation.',
      scenario: 'Ethereum: automatic rebalancing needs a centralised keeper bot (team operates it, users trust the team) or complex EIP-4337 (poor wallet support). Starknet: session keys native to every wallet — vault requests scoped permission once, all rebalancing trustless.',
      outcome: '"The AA session key model turns \'requires a trusted keeper\' into \'fully trustless automatic rebalancing\' — a qualitative product difference, not just a convenience improvement."',
    },
    {
      contextTag: '[Current yield source assessment]',
      context: 'Analyst evaluates available yield sources for a Starknet aggregator today.',
      scenario: 'Vesu (12+ months, stable): suitable as primary route. Nostra (8+ months, stable): suitable as primary route. STRK staking (7.5% APY but token-denominated): opt-in for STRK-bullish users. Ekubo USDC-STRK LP (8.4% but impermanent loss risk): opt-in for "aggressive" risk users.',
      outcome: '"Minimal viable aggregator: Vesu + Nostra routing only. 12-month expansion: add STRK staking and Ekubo LP as risk-tiered options. The foundation now exists. Build now; expand later."',
    },
  ],

  guidedPractice: [
    {
      question: 'A yield aggregator has $200M AUM, average 5% APY across sources, charges 15% performance fee. Annual revenue?',
      options: ['A. $1.5M', 'B. $150K', 'C. $15M', 'D. Need to know allocation split'],
      correct: 0,
      explanation: 'A is correct. Annual yield: $200M × 5% = $10M. Aggregator fee: $10M × 15% = $1.5M. This is self-sustaining without token inflation — the "real yield" model.',
    },
    {
      question: 'Why was a Starknet yield aggregator not viable 18 months ago but is now?',
      options: ['A. Foundation now offers grants for aggregators', 'B. The component yield sources — Vesu and Nostra — did not have sufficient operational history or TVL depth for a reliable aggregator to route between. Today both have 8–12+ months of stable operation and combined $70M+ TVL.', 'C. Smart contract technology was not mature enough', 'D. Governance did not permit aggregators'],
      correct: 1,
      explanation: 'B is correct. An aggregator needs at least two stable yield sources with sufficient history to route between. 18 months ago, Starknet\'s lending protocols were too new and too small. Today Vesu and Nostra both have the operational history and TVL depth required.',
    },
    {
      question: 'A user wants the aggregator to automatically rebalance between Vesu and Nostra without manual approval for each transaction. Which Starknet feature enables this trustlessly?',
      options: ['A. Pragma oracle', 'B. Session keys (Account Abstraction) — the user grants the vault a scoped permission once ("move USDC between approved protocols, up to $100K per transaction, for 90 days"). All rebalancing executes automatically within that scope.', 'C. STARK proofs', 'D. Ekubo concentrated liquidity'],
      correct: 1,
      explanation: 'B is correct. Session keys allow a user to pre-approve a specific, scoped set of actions for an application. The aggregator vault can then rebalance automatically when yield differentials exceed a threshold — no manual approval needed per transaction. On Ethereum, the equivalent requires a centralised keeper bot (trust the team) or complex EIP-4337 (poor support). Starknet\'s native AA makes this trustless by design.',
    },
    {
      question: 'Ekubo USDC-STRK LP offers 8.4% APY but with impermanent loss risk. Should a yield aggregator route all user capital there by default?',
      options: ['A. Yes — 8.4% is higher than Vesu\'s 5.2%', 'B. No — impermanent loss is a risk that cannot be eliminated. 8.4% LP yield may underperform 5.2% stable lending if STRK price diverges from USDC price significantly. LP should be an opt-in for users who explicitly choose "aggressive" risk tolerance, not the default allocation.', 'C. Only in bull markets', 'D. Yes — impermanent loss is too small to matter'],
      correct: 1,
      explanation: 'B is correct. APY comparison must account for risk: 8.4% in a pool with impermanent loss risk vs 5.2% in a stable lending pool are not directly comparable. If STRK moves significantly relative to USDC, LP returns can fall below, and potentially far below, the lending APY. An aggregator that silently routes user capital to the highest raw APY without accounting for risk would harm conservative users. Risk-tiered routing is the responsible design.',
    },
    {
      question: 'The Wonderland collapse is referenced as context for the yield aggregator opportunity. What specifically does it illustrate?',
      options: ['A. All yield aggregators are scams', 'B. Token-inflation-funded yield (Wonderland\'s mechanism) eventually collapses. DeFi investors now demand "real yield" — revenue from protocol fees, not token minting. An aggregator with a performance-fee revenue model (earning from actual yield, not inflation) directly addresses this investor demand.', 'C. High APY is always a scam', 'D. Only Ethereum-native protocols are trustworthy'],
      correct: 1,
      explanation: 'B is correct. Wonderland paid 80,000%+ APY by minting new tokens — the yield was entirely inflationary, not revenue-backed. The collapse demonstrated that inflationary yield is not sustainable. Post-Wonderland, investors specifically seek protocols generating yield from real economic activity (trading fees, lending interest). A Starknet yield aggregator routing to Vesu and Nostra earns from actual lending interest — "real yield" by design.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Use the simulator to check current APYs across Starknet yield sources: Vesu USDC supply, Nostra USDC supply, STRK staking. For each source: record current APY, 30-day average APY, and TVL. Calculate the blended APY if a $10M aggregator vault allocated $5M to Vesu, $3M to Nostra, $2M to STRK staking. Then calculate annual aggregator revenue at 15% performance fee.',
      scoringCriteria: ['Reads three APYs from simulator correctly', 'Blended APY: (5M × Vesu APY + 3M × Nostra APY + 2M × STRK APY) ÷ 10M', 'Annual revenue: $10M × blended APY × 15%'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A Starknet yield aggregator holds $80M AUM (60% Vesu, 40% Nostra). Nostra experiences a governance attack that drains $3M from its lending pool. Nostra\'s supply APY drops to 0% as depositors withdraw. Model: (1) what happens to the aggregator\'s Nostra position, (2) what the automated response should be, (3) how session keys enable that response, (4) what residual user harm exists.',
      scoringCriteria: ['Nostra position ($32M): at risk of partial loss (the $3M drain is from borrows, not deposits — depositor funds protected by overcollateralisation if LTV held; but confidence collapse triggers depositor flight, reducing APY to 0%)', 'Automated response: aggregator\'s rebalancing logic detects Nostra APY at 0% → triggers full reallocation to Vesu (or pause pending governance review)', 'Session keys enable this: the pre-approved scope allows the vault to move USDC between approved protocols within defined limits — a rebalancing trigger fires the automatic migration', 'Residual harm: users earn 0% on their Nostra allocation during the governance attack period (a few hours to days) and may face queue delays if Nostra deposit withdrawal is congested'],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-paragraph opportunity memo for the Starknet yield aggregator gap. P1: the gap, what component protocols now exist. P2: why now is the viable moment and the 12-month success metric. Specific numbers throughout. Max 200 words.',
      scoringCriteria: ['P1: no dominant Starknet yield aggregator despite Ethereum having Yearn ($6B peak TVL). Component protocols now live: Vesu (5.2% USDC, 12+ months), Nostra (4.8%, 8+ months), STRK staking (7.5%). AA session keys enable automatic rebalancing without keepers.', 'P2: viable now because 3+ stable yield sources with operational history exist — the minimum threshold for meaningful aggregation. 12-month success metric: $20M AUM within 12 months, positive sustainability ratio (revenue > 0, performance fee covers operating costs), and at least 2 active yield source routes with automated rebalancing live.'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L8.3 — The RWA Gap
// ─────────────────────────────────────────────────────────────

export const LAB8_LESSON_3 = {
  id: 'l8-3-rwa-gap',
  title: 'The Real World Assets Gap',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
RWA PRIMER

Real World Assets (RWAs) are tokenised versions of off-chain financial instruments — Treasury bills, corporate bonds, real estate, invoices. They bring traditional finance yield onto the blockchain. Ondo Finance tokenised US Treasury bills, reaching $500M+ in tokenised T-bill TVL on Ethereum by 2024. Maple Finance tokenised institutional credit. Franklin Templeton put a money market fund on-chain.

The proposition: instead of earning 3–5% in a DeFi lending pool, institutional capital can earn 4.5–5.2% from US Treasury bills — with comparable risk to holding T-bills directly, but in a permissionless, composable on-chain format.

On Ethereum: $2B+ in tokenised RWAs as of current data.
On Starknet: no significant RWA protocol has reached meaningful scale.

THE GAP AND ITS CAUSES

Cause 1 — Liquidity: institutional capital (pension funds, family offices, DAO treasuries) allocates in minimums of $1M–$10M+. Starknet's total TVL is $800M. For an institution that deploys $50M minimum, Starknet's entire ecosystem is smaller than one deployment ticket. RWA adoption follows TVL — institutions go where the liquidity exists.

Cause 2 — Regulatory clarity: RWAs sit at the intersection of blockchain and traditional securities regulation. Ondo and Maple spent significant legal resources obtaining the right regulatory structure (SEC exemptions, jurisdiction selection) before launch. This regulatory work is chain-agnostic — the protocol teams, not the chain, navigate it. But institutions require established regulatory precedent before deploying, and Starknet has not yet been the chosen chain for any major RWA issuance.

Cause 3 — Technical access: Ondo Finance and similar protocols are primarily deployed on Ethereum. For Starknet to access these assets, cross-chain bridging is required — Starkgate. Each bridge introduces smart contract risk. Institutional capital with stringent risk controls may not accept bridge risk for yield comparable to what they can earn on Ethereum directly.

THE PATH TO STARKNET RWA

The realistic near-term scenario is not "Ondo deploys natively on Starknet." It is "Starknet protocols gain access to existing tokenised T-bills via bridge, and use them as collateral in Starknet lending."

Specifically: if Starkgate supports USDC and stablecoins from Ethereum, and if Ondo's OUSD (tokenised T-bill) is bridgeable to Starknet, then Vesu could list OUSD as collateral — allowing Starknet users to borrow USDC against T-bill-backed stablecoins. This would be Starknet's first RWA exposure without requiring a native Starknet RWA protocol.

The 12-month realistic scenario: OUSD or equivalent T-bill token bridged to Starknet via Starkgate, listed as Vesu/Nostra collateral with conservative LTV parameters. TVL contribution: $5–20M initially (early adopters bridging T-bill exposure to Starknet).

The 24-month ambitious scenario: a Starknet-native RWA protocol (Foundation grant-funded) issues tokenised T-bills directly on Starknet. This requires legal structure, KYC/AML on issuance, and SEC/FCA regulatory clarity — significant but not insurmountable obstacles.
  `.trim(),

  keyTakeaway: `RWAs are blocked from Starknet by three constraints — insufficient liquidity depth for institutional minimums, regulatory frameworks that haven\'t yet selected Starknet as a deployment chain, and bridge friction — but the realistic near-term path is T-bill tokens bridged to Starknet as lending collateral, not a native RWA protocol.`,

  examples: [
    {
      contextTag: '[Ondo Finance as the Ethereum benchmark]',
      context: 'Ondo Finance: $500M+ tokenised T-bill TVL on Ethereum as of 2024.',
      scenario: 'Institutions earn 4.8% T-bill yield on-chain via OUSD — comparable to Fed funds rate, on-chain and composable. Starknet has no equivalent.',
      outcome: '"The demand is institutional and large-ticket. Starknet at $800M total TVL is below the minimum deployment ticket for most institutional capital. TVL must reach $2–3B before institutional RWA becomes realistic without specific bridge solutions."',
    },
    {
      contextTag: '[Bridge-based RWA access as near-term solution]',
      context: 'A Starknet lending protocol team considers adding OUSD as collateral.',
      scenario: 'OUSD is bridgeable from Ethereum to Starknet via Starkgate. Users hold OUSD and want USDC liquidity without selling. Listing OUSD in Vesu allows this. Requires: Pragma oracle feed for OUSD/USD, conservative LTV (90%+), Starkgate bridge risk acknowledgment.',
      outcome: '"This creates Starknet\'s first RWA exposure through the existing infrastructure, without a native RWA protocol — a $5–15M TVL contribution in year one from early adopters."',
    },
    {
      contextTag: '[Regulatory complexity as the primary blocker]',
      context: 'A Starknet-native tokenised T-bill protocol is considered.',
      scenario: 'Requirements: SEC regulation D or equivalent exemption, KYC/AML on all holders, legal entity to hold T-bills off-chain, smart contract structure for redemption — each step requires significant legal investment. Ondo spent $2M+ in legal costs before launch.',
      outcome: '"A Starknet-native RWA protocol is a 24-month project with $1.5–2M in legal costs — suitable for a well-funded team with regulatory experience, not a standard DeFi developer team. The Foundation SEED grant ceiling ($150K) is insufficient. This requires separate investor funding."',
    },
  ],

  guidedPractice: [
    {
      question: 'Ondo Finance reached $500M in tokenised T-bill TVL on Ethereum. Why hasn\'t an equivalent appeared on Starknet?',
      options: ['A. Starknet\'s technology cannot support RWAs', 'B. Three constraints: Starknet\'s $800M TVL is below institutional deployment minimums; regulatory frameworks for RWA issuance haven\'t selected Starknet; bridge friction discourages institutional capital with strict risk controls.', 'C. The Foundation has banned RWA protocols', 'D. T-bills are not suitable for blockchain representation'],
      correct: 1,
      explanation: 'B is correct. All three constraints are structural rather than technical. Starknet\'s STARK proofs and smart contract capabilities are compatible with RWA protocols. The blockers are economic (TVL too small for institutional minimums), regulatory (no precedent-setting issuance on Starknet), and risk (bridge friction).',
    },
    {
      question: 'What is the most realistic near-term path for Starknet to gain RWA exposure?',
      options: ['A. Build a native Starknet T-bill protocol from scratch', 'B. Bridge existing tokenised T-bill tokens (e.g., OUSD) from Ethereum via Starkgate and list them as collateral in Vesu — no new RWA protocol required, uses existing infrastructure', 'C. Wait for institutions to deploy natively on Starknet', 'D. Create a synthetic T-bill using STRK staking'],
      correct: 1,
      explanation: 'B is correct. The bridge + collateral listing path uses existing infrastructure (Starkgate, Vesu, Pragma) and requires only adding an oracle feed and collateral listing — a matter of weeks rather than the months-to-years of a native RWA protocol. It is the pragmatic path to initial RWA exposure.',
    },
    {
      question: 'Why is a native Starknet RWA protocol more suited to a 24-month than 6-month timeline?',
      options: ['A. Cairo is too new for RWA smart contracts', 'B. Native RWA issuance requires legal structure (SEC exemptions or equivalent), KYC/AML systems, and regulatory precedent — a process costing $1.5–2M in legal fees and taking 18–24 months even for well-resourced teams.', 'C. The Foundation won\'t grant-fund it', 'D. Demand for on-chain T-bills is still unproven'],
      correct: 1,
      explanation: 'B is correct. RWA issuance sits at the boundary of blockchain and securities regulation. The technical build is relatively straightforward; the legal and regulatory work is the long path. Ondo spent over $2M in legal preparation before its first issuance. This is not a DeFi grant-fundable project — it requires institutional-scale funding and a team with securities law expertise.',
    },
    {
      question: 'A Starknet lending protocol wants to list OUSD (Ondo\'s tokenised T-bill) as collateral. What three infrastructure elements must be in place?',
      options: ['A. A Starknet-native T-bill protocol, a DEX for OUSD, and an options market', 'B. A Starkgate bridge supporting OUSD, a Pragma oracle feed for OUSD/USD, and conservative LTV parameters in Vesu/Nostra to reflect bridge risk', 'C. Starknet Foundation approval, legal opinion, and user KYC', 'D. AVNU routing for OUSD, Ekubo liquidity pool for OUSD, and STRK staking integration'],
      correct: 1,
      explanation: 'B is correct. The three technical requirements: (1) Starkgate must support bridging OUSD from Ethereum to Starknet. (2) Pragma must have a reliable OUSD/USD oracle feed so the lending protocol can correctly value the collateral. (3) LTV must be conservative (90%+ given T-bill stability, but with an additional discount for bridge risk — perhaps 85%) to protect against liquidation failures during bridge events.',
    },
    {
      question: 'Why does institutional RWA capital follow TVL rather than leading it?',
      options: ['A. Institutions are slower to adopt technology', 'B. Institutional capital deploys in minimums of $1M–$10M+ per ticket. On a chain with $800M total TVL, a $10M deployment represents 1.25% of the entire ecosystem — concentration risk that institutions\' risk controls typically prohibit. Institutions deploy where existing liquidity provides exit options.', 'C. Institutions prefer Ethereum regardless of other factors', 'D. Regulatory rules prohibit institutions from being early adopters of new chains'],
      correct: 1,
      explanation: 'B is correct. Institutional capital has liquidity requirements — the ability to exit a position without moving the market significantly. On a $800M TVL chain, a $10M position is large relative to the ecosystem. On a $20B+ TVL chain (Arbitrum), $10M is a rounding error. This is why RWA follows TVL — institutional risk controls mandate deploying into deep liquidity, not bootstrapping new chains.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Use the opportunity analysis mode. Pull: (1) Ethereum RWA TVL ($2B+ including Ondo, Maple, Franklin Templeton), (2) Starknet RWA TVL (approximately $0), (3) current OUSD or equivalent T-bill token liquidity on Starkgate (if any). Calculate: Starknet as % of Ethereum RWA market. State the bridge-based near-term path and estimate 12-month realistic TVL contribution.',
      scoringCriteria: ['Ethereum RWA TVL approximately $2B+. Starknet RWA TVL approximately $0. Ratio: 0%.', 'Bridge path: OUSD via Starkgate → Vesu collateral listing. Requires Pragma oracle + conservative LTV.', '12-month realistic TVL contribution: $5–20M (early crypto-native institutional adopters; not traditional institutional capital which requires deeper TVL)'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Vesu lists OUSD (bridged Ondo T-bill token via Starkgate) as collateral at 85% LTV. A user deposits $1M OUSD and borrows $850K USDC. Starkgate experiences a 6-hour outage during which OUSD cannot be transferred between Ethereum and Starknet. The user wants to repay their loan and withdraw. Model: (1) can the user repay their loan, (2) can they withdraw their OUSD collateral, (3) what risk does the outage create for the protocol, (4) whether 85% LTV appropriately accounts for bridge risk.',
      scoringCriteria: ['(1) Loan repayment: the user can repay USDC borrowed from Vesu — the USDC exists on Starknet natively, no Starkgate required. Repayment is possible.', '(2) OUSD withdrawal: cannot bridge OUSD back to Ethereum during the outage. The OUSD collateral is stuck on Starknet until Starkgate restores — but it remains as collateral in Vesu and isn\'t lost.', '(3) Protocol risk: if OUSD price were to drop significantly during the outage (unlikely for a T-bill token, but possible) and the collateral value fell below the 85% LTV threshold, liquidation would be triggered but the liquidator cannot bridge the OUSD proceeds back to Ethereum — stuck on Starknet. Liquidity risk for liquidators.', '(4) 85% LTV assessment: appropriate for T-bill stability (T-bills rarely move >5%), but the bridge risk warrants the discount from 90% that might apply without bridge exposure. The outage scenario shows the liquidator liquidity risk — potentially justify a further conservative reduction to 80%.'],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-paragraph RWA gap memo. P1: the gap and why it exists (three causes). P2: the realistic near-term and ambitious long-term paths, with specific timelines and TVL estimates. Max 200 words.',
      scoringCriteria: ['P1: three causes correctly identified — institutional TVL minimums vs Starknet\'s $800M ecosystem, regulatory frameworks not yet selecting Starknet, bridge friction for institutional risk controls', 'P2: near-term (6–12 months): bridge OUSD or equivalent to Starknet via Starkgate, list as Vesu collateral — $5–20M TVL, no new protocol needed. Long-term (18–24 months): Starknet-native RWA issuance — requires $1.5–2M legal budget, SEC/regulatory structure, team with securities law expertise.'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L8.4 — The Mobile DCA Interface Gap
// ─────────────────────────────────────────────────────────────

export const LAB8_LESSON_4 = {
  id: 'l8-4-mobile-dca-gap',
  title: 'The Mobile DCA Interface Gap',
  trackType: 'A',
  lessonNumber: 4,

  explanation: `
Dollar-cost averaging (DCA) is the simplest investment strategy: buy a fixed amount of an asset at regular intervals, regardless of price. Buy $100 of Bitcoin every Monday. Over time, you buy more when prices are low and less when high — smoothing entry cost.

DCA has mainstream appeal specifically because it is simple. It is how pension plans work, how 401(k)s invest, and how financial advisors tell most retail clients to invest in volatile assets. The DCA behaviour is already deeply embedded in mainstream financial thinking.

THE GAP ON STARKNET

AVNU DCA exists on Starknet — it is technically available. But it is desktop-only, accessed via a browser interface. The user experience: open a laptop, navigate to avnu.fi, connect a browser wallet, set up a recurring order. This is not how mainstream users interact with financial products in 2024.

Mainstream financial products are mobile-first, biometric-authenticated, and set-and-forget. A Revolut user invests £50/week in ETH from their phone in 30 seconds. A Starknet DCA user opens their laptop, manages a browser wallet, and manually executes or maintains a web-based interface.

This is a UX gap, not a protocol gap. The AVNU DCA smart contract works correctly. The interface layer does not match how non-crypto-native users expect to manage recurring financial actions.

WHY STARKNET IS UNIQUELY POSITIONED TO SOLVE IT

Starknet is the only chain where all the required pieces are native:

Account Abstraction session keys: a mobile DCA app can request "execute $50 STRK purchase every Monday from my USDC, for 52 weeks" — one approval from the user's Face ID, then 52 weeks of automatic execution without further interaction.

Biometric wallet authentication: Braavos and Argent X support Face ID login on mobile. The DCA app uses the same wallet the user already set up — no separate key management.

AVNU Paymaster: the DCA app can absorb gas fees entirely, making the recurring purchase experience identical to Revolut — the user pays $50 and receives approximately $50 of STRK, with no gas fee visible or required.

The result: a Starknet mobile DCA app could provide a Revolut-like experience for DeFi investing — biometric login, zero visible gas fees, automatic weekly execution, native mobile interface. This experience is architecturally impossible on standard Ethereum (no native AA) and awkward even on EIP-4337 chains (inconsistent wallet support).

THE MARKET SIZE

DCA investing is a $2T+ behaviour globally in traditional finance (pension contributions, index fund auto-buys). In crypto: Coinbase Recurring Buy has millions of active users. Swan Bitcoin is purpose-built for DCA.

The Starknet-addressable market is not "DCA investors globally" — it is "crypto DCA users who would migrate to a non-custodial, on-chain DCA experience if it were as simple as Coinbase Recurring Buy." This is a narrower but real and growing segment.

WHAT IS NEEDED

Not a new smart contract. The AVNU DCA protocol exists. What is needed:
— A dedicated mobile app (iOS + Android) built using Starkzap SDK
— Braavos or Argent X integration for Face ID authentication
— AVNU Paymaster integration for gasless execution
— Simple UX: select asset, set amount, set frequency, approve once with Face ID

Build time estimate: 3–4 months for a 2-person frontend team. Foundation SEED grant applicable at $100–150K. Time-to-market far faster than any of the other gaps in Lab 8.
  `.trim(),

  keyTakeaway: `AVNU DCA exists on Starknet but is desktop-only — a mobile DCA app using Starkzap SDK + Braavos Face ID + AVNU Paymaster is the fastest gap to close in Lab 8, achievable in 3–4 months, and positions Starknet for the mainstream DCA user segment that makes up the largest retail investing behaviour globally.`,

  examples: [
    {
      contextTag: '[Mainstream DCA behaviour contrast]',
      context: 'A Revolut user: opens app, taps "Invest", selects "Weekly ETH purchase £50", Face ID confirms, done. Total time: 45 seconds.',
      scenario: 'A Starknet DCA user: opens laptop, navigates to avnu.fi, connects browser wallet (possibly seed phrase), sets DCA parameters, confirms each weekly transaction manually.',
      outcome: '"This is not a protocol problem — the smart contracts work. It is a UX problem. The experience gap between Revolut and current Starknet DCA is precisely the gap that Account Abstraction was designed to close, and that only Starknet can close natively today."',
    },
    {
      contextTag: '[Why Ethereum cannot replicate this natively]',
      context: 'A competitor team considers building the same product on Ethereum.',
      scenario: 'On Ethereum: no native AA → session keys require EIP-4337 → inconsistent wallet support → gasless requires centralised paymaster → seed phrase still required for most wallets. The product works but requires 5+ user decisions and setup steps vs Starknet\'s 2.',
      outcome: '"Starknet\'s native AA turns what would be a complex, fragile stack on Ethereum into a standard Starknet integration. This is a genuine architectural advantage for this specific product category."',
    },
    {
      contextTag: '[Build estimate and grant sizing]',
      context: 'A 2-person frontend team (React Native mobile developers) evaluates the mobile DCA build.',
      scenario: 'They assess: Starkzap SDK quickstart 30 minutes to first transaction. Braavos wallet connect documented. AVNU DCA API documented. Paymaster integration 1 day. Mobile app UI 6 weeks. Total: 3–4 months to production app. Grant: Foundation SEED at $100–150K covers 2 developers for 4 months.',
      outcome: '"This is the fastest-to-market gap in the Lab 8 analysis. Options need options specialists (6+ months). Yield aggregators need operational history (existing, could build now). RWA needs legal ($1.5M+). Mobile DCA needs frontend devs and 3–4 months. The Foundation should prioritise this in SEED funding — highest impact per dollar."',
    },
  ],

  guidedPractice: [
    {
      question: 'AVNU DCA exists on Starknet but has low adoption among mainstream users. What is the root cause?',
      options: ['A. The smart contract has bugs', 'B. UX gap — AVNU DCA is desktop-only via a browser wallet. Mainstream financial behaviour in 2024 is mobile-first with biometric authentication. The product exists; the interface doesn\'t match mainstream user expectations.', 'C. Gas fees are too high for DCA', 'D. DCA is illegal in some jurisdictions'],
      correct: 1,
      explanation: 'B is correct. This is a UX gap, not a protocol gap. The underlying smart contracts work correctly. The missing layer is a mobile-first interface with Face ID authentication and gasless execution — exactly what Account Abstraction makes possible on Starknet.',
    },
    {
      question: 'Which three Starknet-specific features combine to enable a Revolut-like mobile DCA experience?',
      options: ['A. Ekubo, Pragma, Vesu', 'B. Session keys (automatic weekly execution after one Face ID approval), Braavos/Argent Face ID authentication (no seed phrase), AVNU Paymaster (no visible gas fee)', 'C. STARK proofs, recursive proofs, Volition', 'D. Cairo language, Starknet Foundry, Scarb'],
      correct: 1,
      explanation: 'B is correct. The three features work together: Session keys mean the user approves the DCA schedule once with Face ID — all 52 weekly executions then happen automatically. Biometric wallet authentication makes the login experience identical to a banking app. The Paymaster absorbs gas fees, making the cost experience identical to a zero-fee investing app. No equivalent combination is available natively on Ethereum or most L2s.',
    },
    {
      question: 'Why does the mobile DCA gap have the fastest time-to-market among the four gaps in Lab 8?',
      options: ['A. It requires no smart contract development — only a frontend app built on existing protocols', 'B. It requires the smallest Foundation grant', 'C. Mobile apps are faster to build than DeFi protocols', 'D. The regulatory requirements are simpler'],
      correct: 0,
      explanation: 'A is correct. The underlying smart contract (AVNU DCA) already exists and works. The gap is purely the frontend layer: a mobile app using Starkzap SDK to interact with the existing protocol. No new protocol needs to be designed, audited, or deployed. Estimate: 3–4 months for a 2-person team. Compare: options protocol (6+ months, needs options specialists), RWA (18–24 months, needs legal work).',
    },
    {
      question: 'The addressable market for a Starknet mobile DCA app is described as "crypto DCA users who would migrate to non-custodial on-chain DCA if it were as simple as Coinbase Recurring Buy." Why is this narrower than "DCA investors globally"?',
      options: ['A. Not narrower — all DCA investors are the target', 'B. Most DCA investors globally use traditional finance products (pension plans, index fund auto-buys) and have no interest in crypto. The realistic market is the subset of crypto investors currently using custodial DCA (Coinbase Recurring Buy, Kraken DCA) who would prefer a non-custodial, on-chain equivalent if the UX were comparable.', 'C. Starknet apps can only target European users', 'D. Only investors who already hold STRK can use DCA'],
      correct: 1,
      explanation: 'B is correct. The Starknet-addressable market requires a user who: (1) is interested in crypto, (2) wants non-custodial exposure (not willing to leave funds on Coinbase), and (3) would use DCA if the UX were simple enough. This is a subset of all crypto users, and a much smaller subset of all DCA investors. Being precise about the TAM prevents overbuilding for a market that doesn\'t exist.',
    },
    {
      question: 'A Foundation reviewer asks whether a mobile DCA app should apply for a SEED Grant or Growth Grant. What is the correct answer and why?',
      options: ['A. Growth Grant — the market is large', 'B. SEED Grant at $100–150K — the team has no prior shipped Starknet product. SEED Grants are for early-stage teams building first products. Growth Grants require demonstrated traction (existing users). A SEED Grant funds the app build; after 3–6 months of live users, the team can apply for a Growth Grant.', 'C. Neither — mobile apps don\'t qualify for Foundation grants', 'D. Growth Grant — mobile apps are expensive to build'],
      correct: 1,
      explanation: 'B is correct. Grant tier selection must match the team\'s demonstrated traction. A new team with no prior Starknet product needs to demonstrate they can ship before accessing the larger Growth Grant tier. SEED is the right starting point — it funds the build, de-risks the Foundation\'s investment, and creates the traction milestone needed for a subsequent Growth Grant.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Use the simulator to assess the current AVNU DCA interface: record (1) whether a mobile-native version exists, (2) steps required for a first-time user to execute a DCA order via the current interface, (3) estimated time for a non-crypto user with a Braavos wallet to execute their first DCA. Compare to the Revolut recurring investment UX (45-second equivalent for mainstream users).',
      scoringCriteria: ['Records current state: desktop-only, browser wallet required', 'Step count for first-time user: minimum 5–7 steps (navigate, connect wallet, approve, set parameters, confirm)', 'Estimated time for non-crypto user: 5–15 minutes vs Revolut 45 seconds — a 10–20× friction gap that the mobile DCA app addresses'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A team wants to build a Starknet mobile DCA app using only Starkzap SDK (no Starknet.js fallback). The SDK is maintained by 3 core contributors. Identify: (1) the specific dependency risk, (2) what happens if one contributor leaves during the 3-month build, (3) whether this risk justifies a Starknet.js fallback, (4) one mitigation that doesn\'t require duplicating the entire SDK integration.',
      scoringCriteria: ['Dependency risk: 3 contributors means losing 1 = 33% reduction in maintenance bandwidth. Critical updates (Starknet protocol upgrades, security patches) could be delayed.', 'During 3-month build: SDK changes during development could break the app mid-build. A critical bug fix may not be prioritised if contributor capacity drops.', 'Starknet.js fallback assessment: full fallback adds 3–4 weeks to build — may not be worth it for a 3-month SEED-grant project. Better mitigation: contribute one team member as an SDK open-source contributor (builds familiarity, partial key-person mitigation, doesn\'t duplicate the integration).', 'One mitigation: lock the SDK version at project start and manage updates deliberately at defined milestones rather than accepting continuous updates during development.'],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-paragraph opportunity memo for the mobile DCA interface gap. P1: what the gap is and why AVNU DCA doesn\'t address it. P2: what Starknet-specific features make this buildable and the realistic build timeline with grant sizing. Max 200 words.',
      scoringCriteria: ['P1: AVNU DCA exists as a smart contract but is desktop-only via a browser wallet — mainstream DCA users expect mobile-first, biometric, zero-visible-gas experience. The gap is a UX layer, not a protocol.', 'P2: Session keys (one-approval automatic weekly execution), Braavos Face ID authentication, AVNU Paymaster (gasless) — none of these are natively available on Ethereum. Build: 3–4 months, 2-person frontend team, Foundation SEED grant $100–150K, fastest time-to-market of any Lab 8 gap.'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L8.5 — Grant Opportunities: Connecting Gaps to Funding
// ─────────────────────────────────────────────────────────────

export const LAB8_LESSON_5 = {
  id: 'l8-5-grant-opportunities',
  title: 'Grant Opportunities: Connecting Gaps to Funding',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
Labs 8.1–8.4 identified four unaddressed gaps in Starknet DeFi. This lesson maps each gap to the Foundation grant tier most appropriate to address it, applies the four-criterion grant evaluation rubric from L4.5, and synthesises which opportunities are most likely to receive Foundation support in the next 12 months.

REVIEWING THE FOUR CRITERIA (from L4.5)

1. Specific product — not "we will build X" but "X users will do Y by date Z."
2. Team credibility — prior shipped products, relevant background.
3. Milestone specificity — outcomes not activities. Measurable, time-bounded, verifiable.
4. Honest risk assessment — the most likely failure mode and its specific mitigation.

MAPPING THE FOUR GAPS TO GRANT TIERS

GAP 1 — OPTIONS PROTOCOL

Grant tier: Growth Grant ($300K–$1M) or structured multi-tranche SEED ($100K per phase)
Primary funding challenge: the Foundation's Growth Grant requires demonstrated traction. No current Starknet team has shipped an options protocol — so Growth Grant level is appropriate only after a minimal viable product has processed real trading volume.
Recommended approach: Phase 1 SEED ($100K): 4-pool MVP with ETH options only, 30-day live trading on mainnet. Phase 2 Growth Grant ($400K): expand to STRK, 12 pools, 6 months of sustained trading activity.
Team credibility requirement: the application will be strengthened significantly by a team member with DeFi options market-making experience (from Lyra, Dopex, or traditional quantitative trading).

GAP 2 — YIELD AGGREGATOR

Grant tier: SEED Grant ($100–150K initially)
This is the highest readiness gap — component protocols exist, no special expertise required beyond DeFi development, AA session keys provide the key differentiator. A team of 2–3 experienced DeFi developers could ship in 3–4 months.
Strong milestone example: "By Day 90: yield aggregator vault live on Starknet mainnet, routing USDC between Vesu and Nostra. TVL milestone: $500K in vault within 30 days of launch. Verifiable via vault contract on Voyager."
Risk to disclose: "Primary risk — Vesu or Nostra APY convergence (both at same rate removes the aggregation value proposition). Mitigation: add STRK staking as third route, expand to LP pools as options market matures."

GAP 3 — RWA ONBOARDING

Grant tier: Not currently fundable at standard SEED or Growth Grant level
The regulatory complexity of native RWA issuance ($1.5–2M legal budget) far exceeds Foundation grant ceilings. The bridge-based near-term path (OUSD as Vesu collateral) requires Vesu governance approval and Pragma oracle addition — not a standalone project, so no separate grant needed.
Foundation action: the most valuable contribution is a Foundation-sponsored RWA working group — bringing together Ondo Finance, legal counsel, and Starknet ecosystem teams to establish the regulatory framework needed for eventual native Starknet RWA issuance. This is advocacy and coordination work, not a grant.

GAP 4 — MOBILE DCA INTERFACE

Grant tier: SEED Grant ($100–150K)
The fastest-to-build and lowest-risk gap. Team requires: React Native mobile development experience and Starkzap SDK familiarity. No DeFi protocol expertise needed — the protocol (AVNU DCA) already exists.
Strong milestone example: "By Day 90: iOS and Android app available on App Store and Google Play, supporting USDC → STRK weekly DCA via AVNU. Day 90 milestone: 200 unique wallets have executed at least one DCA order through the app. Verifiable via AVNU DCA contract events on Voyager."
Risk to disclose: "Primary risk — App Store review rejection for crypto applications (historical pattern: Apple has rejected crypto wallet apps). Mitigation: legal review of App Store guidelines before submission, prepared appeals process, Android launch as backup if iOS is delayed."

SYNTHESIS: FOUNDATION PRIORITY RECOMMENDATION

From the Foundation's perspective, the highest ROI grants are those that: (1) close the most important gaps, (2) are executable by available teams, (3) have clear success metrics, and (4) create compounding value for the rest of the ecosystem.

Ranked by Foundation priority:
1. Mobile DCA app — fastest to ship, broadens Starknet's user base demographic
2. Yield aggregator — highest infrastructure readiness, self-sustaining revenue model
3. Options protocol (Phase 1 MVP only) — requires specialist team; Foundation should actively recruit a qualified team rather than wait for applications
4. RWA onboarding — best addressed via working group and bridge infrastructure improvement, not a standard grant

The options gap is arguably the highest-value opportunity long-term — but it requires the right team, not just funding. The Foundation's most effective action is outreach to DeFi options teams on Ethereum (Lyra ecosystem teams, post-Dopex developers) specifically inviting them to build on Starknet with a tailored grant package.
  `.trim(),

  keyTakeaway: `The four Lab 8 gaps map to different grant tiers — mobile DCA (SEED, fastest to ship), yield aggregator (SEED, highest readiness), options (Growth after MVP traction), RWA (working group not grant) — and the Foundation's highest-ROI action is not just funding proposals but actively recruiting the options specialist team that the market gap requires.`,

  examples: [
    {
      contextTag: '[Yield aggregator grant application — strong example]',
      context: 'A team of 3 DeFi developers (1 with Yearn vault experience, 1 with Cairo, 1 product) applies for a $120K SEED grant.',
      scenario: 'Criterion 1: "A Cairo yield aggregator vault routing USDC between Vesu and Nostra based on APY differential." Criterion 2: Lead dev shipped 2 Cairo contracts to Starknet mainnet; vault specialist has Yearn vault contributions on GitHub. Criterion 3: "Day 60: vault live on mainnet accepting USDC. Day 90: $500K TVL. Day 120: session key automated rebalancing live. All verifiable via Voyager." Criterion 4: "Risk: Vesu/Nostra APY convergence removes value. Mitigation: add STRK staking as third route within 30 days of convergence detection."',
      outcome: '"This application passes all four criteria. Approved at $115K (slightly below request pending Day 60 deployment milestone)."',
    },
    {
      contextTag: '[Options grant approach — phased recommendation]',
      context: 'A team with 2 Cairo developers and 1 quantitative trader (Lyra Finance background) applies for a $500K Growth Grant for an options protocol.',
      scenario: 'Foundation reviewer notes: no prior Starknet deployment from this team. Growth Grant requires demonstrated traction. Team credibility is strong (Lyra background), but no Starknet track record. The $500K Growth Grant scope (12 pools, multiple assets) is ambitious for an unproven Starknet team.',
      outcome: '"Recommend restructuring as Phase 1 SEED ($100K) for 4-pool ETH-only MVP on mainnet, 60-day live trading milestone. Phase 2 Growth Grant application after Phase 1 completion with verified trading activity. The team\'s qualifications are exactly what this gap requires — the phasing de-risks the Foundation\'s investment while ensuring the team gets funded."',
    },
    {
      contextTag: '[Foundation working group for RWA]',
      context: 'A community member proposes a Foundation grant for a Starknet-native T-bill protocol.',
      scenario: 'Foundation reviews: native T-bill issuance requires $1.5–2M in legal costs, SEC regulatory structure, KYC/AML systems. Standard SEED ceiling is $150K. Growth Grant ceiling is $1M. Neither covers the regulatory cost, and no team has the required securities law expertise.',
      outcome: '"Instead of a standard grant, the Foundation should facilitate a working group: invite Ondo Finance team to explore Starknet deployment, engage a securities law firm with blockchain experience, and fund a $50K feasibility study. If the study identifies a viable path, provide a $150K legal preparation grant to the first credible team pursuing native Starknet RWA issuance. The gap is real but the solution is coordination, not a development grant."',
    },
  ],

  guidedPractice: [
    {
      question: 'A team applies for a Growth Grant for a Starknet yield aggregator but has no prior Starknet deployments. What should the Foundation recommend?',
      options: ['A. Approve — the concept is strong enough', 'B. Recommend a SEED Grant first — build the minimal viable aggregator vault, demonstrate $500K TVL within 90 days, then reapply for a Growth Grant based on demonstrated traction', 'C. Reject entirely — yield aggregators are not a Foundation priority', 'D. Approve with a reduced budget'],
      correct: 1,
      explanation: 'B is correct. Growth Grants require demonstrated traction by design — they fund scale-up, not initial build. A team with no Starknet track record has not demonstrated they can ship on Starknet. The correct path: SEED Grant funds the initial deployment (demonstrates ability to ship) → live metrics demonstrate traction → Growth Grant funds expansion. This structure protects Foundation capital while still funding the opportunity.',
    },
    {
      question: 'A grant application for a mobile DCA app reads: "Milestone 1: We will build the iOS app." What is wrong with this milestone and how should it be rewritten?',
      options: ['A. Nothing wrong — building the app is a clear milestone', 'B. "Build the app" is an activity, not an outcome. Rewrite: "Day 90: iOS app available on App Store, supporting USDC→STRK weekly DCA via AVNU. 200 unique wallets have executed at least one DCA order. Verifiable via AVNU DCA contract events on Voyager."', 'C. The milestone is too ambitious — reduce to Android only', 'D. Should specify the number of lines of code'],
      correct: 1,
      explanation: 'B is correct. "Build the app" cannot be independently verified. The rewrite meets all three milestone criteria: measurable (200 unique wallets), time-bounded (Day 90), and verifiable (AVNU DCA contract events on Voyager). A Foundation reviewer can confirm this milestone without any access to the team.',
    },
    {
      question: 'Why is the RWA gap best addressed by a Foundation working group rather than a standard development grant?',
      options: ['A. RWA protocols are not technically compatible with Starknet', 'B. Native RWA issuance requires $1.5–2M in regulatory and legal costs — far exceeding standard Foundation grant ceilings ($150K SEED, $1M Growth). The bottleneck is regulatory framework and institutional relationship-building, not smart contract development.', 'C. The Foundation does not fund DeFi protocols', 'D. RWA demand is too low to justify Foundation attention'],
      correct: 1,
      explanation: 'B is correct. The development gap for RWA is relatively small — the smart contract is a standard vault structure. The regulatory preparation (SEC exemptions, KYC/AML, legal entity structure) costs $1.5–2M and takes 18–24 months. No Foundation grant category covers this. A working group (outreach to Ondo, legal feasibility study at $50K) is the right Foundation action — creating the conditions for a credible team to eventually launch with separate investor funding.',
    },
    {
      question: 'Ranked from fastest to slowest time-to-market, what is the correct order of the four Lab 8 gaps?',
      options: ['A. Mobile DCA → Yield Aggregator → Options → RWA', 'B. Yield Aggregator → Mobile DCA → Options → RWA', 'C. Options → Mobile DCA → Yield Aggregator → RWA', 'D. All four have the same timeline'],
      correct: 0,
      explanation: 'A is correct. Mobile DCA: 3–4 months (no new protocol needed, frontend only). Yield Aggregator: 3–4 months (new protocol but simple vault logic, no specialist knowledge needed). Options: 6–12 months (requires specialist market-making expertise, complex risk management system, audit). RWA: 18–24 months (regulatory preparation, legal structure, institutional relationship-building). Each gap\'s timeline is driven by the binding constraint — UX layer vs new protocol vs specialist expertise vs regulatory process.',
    },
    {
      question: 'A grant application for an options protocol lists: "Risk: market conditions." The Foundation reviewer flags this as inadequate. What should a protocol-specific risk assessment include?',
      options: ['A. "Market conditions" is sufficient — all DeFi faces this risk', 'B. The specific failure mode most likely for THIS protocol (e.g., "market-maker exits due to unmanaged gamma exposure in a volatile market") with a specific mitigation (e.g., "automated delta hedging circuit breaker: if protocol net gamma exposure exceeds $500K, new option minting is paused until hedging is restored") and a decision point (e.g., "if gamma management fails more than twice in a 30-day period, we pause the protocol and reassess the risk model")', 'C. Risk assessment is optional for SEED grants', 'D. "Smart contract risk" covers everything needed'],
      correct: 1,
      explanation: 'B is correct. "Market conditions" applies to every DeFi protocol and tells the Foundation nothing about this team\'s risk thinking. The Foundation wants to see: (1) the specific technical or operational risk most likely to cause this particular protocol to fail, (2) the specific mitigation (what you will build or do), and (3) the decision point (what triggers a pause or pivot). This demonstrates the team has genuinely thought through failure modes rather than adding a generic disclaimer.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Foundation Q1 grant allocation data: 8 grants approved, $1.2M total. Breakdown: Mobile DCA app $120K, Yield Aggregator $115K, Cairo testing library $80K, Oracle expansion $95K, Gaming protocol $200K, DEX analytics dashboard $90K, NFT marketplace $250K, ZK identity proof-of-concept $245K. Assess: (1) which allocation most directly addresses the Lab 8 gaps, (2) which represents the highest ecosystem multiplier (benefits multiple protocols), (3) any gap allocation that seems undersized for its scope.',
      scoringCriteria: ['Mobile DCA ($120K) and Yield Aggregator ($115K) directly address Lab 8 gaps — correctly identified', 'Highest ecosystem multiplier: Oracle expansion ($95K) — a Pragma oracle addition benefits every lending protocol that adds the new collateral. Also Cairo testing library ($80K) — benefits every Cairo developer. Both are infrastructure with compounding returns.', 'Undersized: ZK identity ($245K) seems ambitious for a PoC — but the allocation is for a proof-of-concept, so the sizing may be appropriate. The NFT marketplace ($250K) could be questioned as a Lab 8 gap (none of the four gaps identified were NFT-related) — this represents Foundation allocation outside the identified priority gaps.'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'The Foundation wants to accelerate the options protocol gap but no suitable team has applied. They consider two approaches: (A) post a Request for Proposals and wait for applications, (B) actively reach out to Lyra Finance contributors and post-Dopex developers with a pre-approved $150K SEED grant commitment for any qualifying team. Compare the two approaches on: speed, team quality, and Foundation resource cost.',
      scoringCriteria: ['Approach A (RFP): slower — wait time for applications is 4–12 weeks, then evaluation. Quality uncertain — self-selected applicants may or may not have options expertise. Foundation resource: standard grant review.', 'Approach B (active outreach): faster — Foundation initiates contact with qualified teams directly. Quality higher — targeting teams with demonstrated options market-making experience (Lyra contributors, quantitative traders). Foundation resource: higher (requires relationship-building, identifying prospects).', 'Recommendation: Approach B for options specifically — the gap requires specialist expertise that will not appear from an open RFP. The Foundation should treat options as a strategic recruitment challenge, not a passive grant allocation challenge.'],
    },
    {
      type: 'sandbox-research-writer',
      scenario: 'Write a 250-word grant opportunity summary covering all four Lab 8 gaps. For each gap: grant tier recommendation, required team profile, the strongest milestone that would signal success, and one honest risk. Format as a structured summary the Foundation could use to brief its grants committee.',
      scoringCriteria: ['Options: Growth Grant (after SEED MVP), requires options market-making expertise, milestone = $5M notional trading volume within 6 months of launch, risk = market-maker exits due to unmanaged Greeks', 'Yield Aggregator: SEED Grant, DeFi developer team (no specialist expertise needed), milestone = $500K TVL within 30 days of launch, risk = Vesu/Nostra APY convergence', 'RWA: Working group not grant, needs legal + institutional expertise, milestone = feasibility study published with viable regulatory path, risk = SEC framework is incompatible with decentralised structure', 'Mobile DCA: SEED Grant, React Native developer team, milestone = 200 unique wallets complete DCA order within 30 days of app launch, risk = App Store rejection of crypto app'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 8 — STRUCTURE
// ─────────────────────────────────────────────────────────────

export const LAB8_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: ['starkzap-ecosystem-read', 'sandbox-research-writer', 'judgment-dataInterpret', 'judgment-riskAssess', 'judgment-communication'],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  description: 'Random draw from all 5 Lab 8 lessons. Tests gap identification, market sizing, infrastructure readiness assessment, grant evaluation, and opportunity memo writing. No labels. No hints.',
};

export const LAB8_BUILD_TASK = {
  id: 'ecosystem-lab-8-build',
  title: 'Ecosystem Gap Opportunity Memo',
  labProgressionNumber: 8,
  selectionMode: 'user-choice-4',
  type: 'research-document',
  simulator: 'starkzap-ecosystem-read',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',

  availableTasks: [
    {
      id: '8a', title: 'Option A: Options Protocol Gap Memo',
      description: 'Document: what options are, the Starknet gap ($0 vs $200-400M on Ethereum), the bootstrapping problem, the infrastructure that now exists, required team expertise, and a realistic 12-month success metric. Include a Foundation grant recommendation with milestone structure. Output: options-gap-memo.md',
    },
    {
      id: '8b', title: 'Option B: Yield Aggregator Gap Memo',
      description: 'Document: the aggregator category, the Starknet gap, the component protocols now available, how Account Abstraction enables trustless rebalancing, the business model (performance fee calculation), and a Foundation grant recommendation. Output: yield-aggregator-memo.md',
    },
    {
      id: '8c', title: 'Option C: RWA Onboarding Gap Memo',
      description: 'Document: what RWAs are, the Starknet gap vs Ethereum ($2B+ RWA TVL), the three constraints (TVL, regulatory, bridge), the bridge-based near-term path, and the working group recommendation instead of a standard grant. Output: rwa-gap-memo.md',
    },
    {
      id: '8d', title: 'Option D: Mobile DCA Interface Gap Memo (Your Proposal)',
      description: 'A gap not fully built yet: propose the mobile DCA app from first principles. Document: the existing AVNU DCA protocol, the UX gap, how Starknet AA enables the product, a build specification (which SDK/wallet/paymaster to use), build timeline, and SEED grant application with four-criterion evaluation. Output: mobile-dca-proposal.md',
    },
  ],

  outputType: 'written-document',
  outputFormat: 'markdown',
  outputPath: '/intermediate/lab-08-ecosystem-gaps/',

  scoringCriteria: [
    'Gap is quantified with specific numbers (current Starknet TVL in category vs reference chain)',
    'Infrastructure readiness assessment covers all relevant Starknet components',
    'Grant recommendation specifies correct tier with justification',
    'At least one milestone meets all three criteria: measurable, time-bounded, verifiable',
    'Risk assessment names the specific failure mode for this gap, not generic "market conditions"',
  ],
};

export const LAB8_BOSS = {
  phase1: {
    id: 'ecosystem-lab-8-boss-phase1', hints: true, portfolioPush: false,
    taskPool: { totalTasks: 20, drawPerAttempt: 8, passMark: 0.80 },
  },
  phase2: {
    id: 'ecosystem-lab-8-boss-phase2', hints: false, portfolioPush: true,
    scenario: `
The Foundation's grants committee is allocating $400K across the four Lab 8 gaps. You advise them.

TASK 1 — Gap Prioritisation
Rank the four gaps by: (a) speed to close the gap, (b) ecosystem multiplier (benefit to existing protocols), (c) team availability. Present a ranked table with justification for each criterion.

TASK 2 — Grant Allocation
Recommend how to allocate $400K across the four gaps. For each allocation: grant tier, amount, milestone structure (at least 2 milestones per grant), and team requirement. If you recommend a gap receive $0 (working group instead of grant), explain why.

TASK 3 — Strongest Opportunity
Select the single gap with the highest expected return on Foundation investment. Write a 150-word brief explaining why — citing specific market size data, infrastructure readiness, and the specific team profile that would make this grant succeed.
    `,
    scoringCriteria: [
      'Task 1: Mobile DCA fastest to close (3-4 months, frontend only). Yield aggregator highest multiplier (benefits all lending protocols by increasing capital efficiency). Options requires most specific team availability (options market-making expertise). RWA team unavailable at grant level (needs institutional legal funding).',
      'Task 2: Mobile DCA $120K SEED, Yield Aggregator $115K SEED, Options $150K SEED (Phase 1 MVP only, not Growth), RWA $0 (working group $15K feasibility study instead). Total: $385K grants + $15K working group. Milestones for each are outcome-based with specific numbers.',
      'Task 3: Yield aggregator strongest ROI — highest infrastructure readiness (all components exist), no specialist expertise required (any good DeFi dev team qualifies), clear self-sustaining revenue model (15% performance fee), compounding ecosystem benefit (every new yield source added to Starknet increases aggregator value), and the team profile exists in the current Starknet developer community.',
    ],
    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/intermediate/lab-08-ecosystem-gaps/',
      files: [{ filename: 'gap-analysis-allocation-brief.md', type: 'narrative' }],
      commitMessage: 'Passed Lab 8 Ecosystem Gaps — Intermediate Ecosystem Deep Dive',
      badgeEarned: 'Ecosystem Gap Analysis Certified — Intermediate',
    },
    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const LAB8_META = {
  id: 'ecosystem-intermediate-lab-8',
  title: 'Ecosystem Gaps and Opportunity Analysis',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'intermediate' as const,
  labNumber: 8,
  estimatedHours: 6,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Labs 1–7 complete',
  description: 'Four Starknet DeFi gaps — options, yield aggregation, RWA onboarding, and mobile DCA — analysed for infrastructure readiness, market size, team requirements, and appropriate Foundation grant structure.',
  nextLab: 'Senior Level — Lab 9: Strategic Ecosystem Analysis',
};
