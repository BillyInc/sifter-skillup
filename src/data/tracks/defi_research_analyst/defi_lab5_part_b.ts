// ============================================================================
// SIFTER SKILLUP — DeFi RESEARCH ANALYST Career Track
// Lab 5: Lending Deep Dive (Part B — Lessons 4.8–4.14)
// Append after Part A lessons, before aggregateSimulations block
// ============================================================================

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.8 — LENDING METRICS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'lending-metrics',
      title: `4.8 Lending Metrics — The Six Numbers That Tell You Everything`,
      subtitle: `TVL is the number everyone quotes. It is the least useful of the six. Here is the scorecard that actually evaluates a lending protocol.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 5's first seven lessons covered specific lending protocols. This lesson builds the evaluation framework that applies to all of them. Just as L3.12 gave you a six-metric DEX scorecard, this lesson gives you the equivalent for lending protocols — the numbers Marcus and Priya check before any allocation decision.`,

      hook: `Aave has $10B TVL. Protocol B has $200M TVL. Protocol B earns more fees per dollar deployed. One is a better yield per unit of risk. TVL alone told you nothing. These six metrics together tell you everything a lending protocol research brief needs.`,

      visualPrompt: `A scorecard card with six rows: TVL (supply depth), Utilisation Rate (demand signal), Borrow Rate (market pricing), Supply APY (depositor yield), Reserve Factor (protocol take), and Bad Debt / Treasury Ratio (safety buffer). Each row has a traffic-light indicator. Caption: "Six numbers. One verdict."`,

      explanation: `Let's look at the scorecard for lending protocols.

Just like DEXes have metrics, lending protocols have a standard set of numbers that reveal protocol health, yield sustainability, and risk exposure. Every research brief Marcus expects covers these six.

**Metric 1: TVL (Total Value Locked)**

[TVL] = total deposits in the protocol. Proxy for: liquidity depth, brand trust, and withdrawal capacity.

Signal: $1B+ TVL means institutional confidence. Sub-$50M TVL means withdrawal risk at high utilisation. But TVL alone says nothing about profitability — a large idle pool earns less per dollar than a smaller, highly-utilised one.

**Metric 2: Utilisation Rate**

[Utilisation rate] = total borrows ÷ total deposits.

Signal: 70–85% = healthy (active market, good yield). Above 90% = withdrawal risk and approaching rate spike. Below 50% = low demand, low yield. Target range depends on the asset (stablecoins 70–85%, volatile assets 40–60%).

**Metric 3: Borrow Rate**

[Borrow rate] = annualised interest paid by borrowers.

Signal: current market pricing of capital demand. High borrow rate → high supply APY available. Volatile borrow rate → utilisation volatility → rate cycle risk. Compare across chains to identify arbitrage (borrowers should migrate to cheapest chain).

**Metric 4: Supply APY**

[Supply APY] = annualised yield for depositors.

Signal: real yield (from borrower interest) vs emission yield (from governance token rewards). Always decompose: what is the floor if all emissions stopped? A 12% APY with 10% from emissions is actually a 2% real yield floor.

**Metric 5: Reserve Factor**

[Reserve factor] = percentage of interest revenue captured by the protocol treasury.

Signal: Aave's reserve factor on USDC: 10%. This means 10% of borrower interest goes to Aave's treasury, not to suppliers. Lower reserve factor = more yield to suppliers. Higher = larger treasury (more safety buffer). Governance can change this — check recent votes.

**Metric 6: Bad Debt / Treasury Ratio**

[Bad debt] = loans that exceed their collateral value at time of liquidation — the shortfall.
[Treasury ratio] = protocol treasury size ÷ total bad debt incurred.

Signal: the most important risk metric. Treasury covers bad debt so depositors do not. If treasury = $50M and bad debt history = $2M total: ratio = 25× (safe). If treasury = $2M and bad debt = $1.8M: ratio = 1.1× (one bad event away from depositor losses).

**How to find these metrics:**

TVL, supply APY, borrow rate, utilisation: DeFiLlama Markets tab or individual protocol dashboards.
Reserve factor: protocol governance documentation or Token Terminal.
Bad debt / treasury: Gauntlet risk reports, Chaos Labs dashboards, protocol governance forums.`,

      examples: [
        {
          contextTag: `[Research analyst, lending scorecard build]`,
          context: `Maya builds the six-metric scorecard for Aave V3 USDC on Arbitrum using DeFiLlama and Gauntlet's risk dashboard.`,
          scenario: `TVL: $1.8B (A — deep, institutional-grade). Utilisation: 76% (A — healthy range, near target). Borrow rate: 5.6% (B — moderate, market-driven). Supply APY: 3.9% (B — real yield, 100% from borrower interest). Reserve factor: 10% (B — reasonable take, $180M in treasury from all Aave markets). Bad debt/treasury: Aave has had $1.6M bad debt total vs $300M+ treasury = 187× ratio (A — exceptional buffer). Overall grade: A−. Verdict: Core allocation. High confidence in yield sustainability and depositor safety.`,
          outcome: `Maya presents the scorecard in the weekly research brief. Marcus asks: "What triggers a downgrade?" She answers: utilisation above 90% (withdrawal risk), reserve factor increase (cuts supply APY), or bad debt event that depletes treasury below 10× ratio.`,
        },
        {
          contextTag: `[Rate comparison, cross-protocol scorecard]`,
          context: `Priya runs the scorecard on three USDC lending protocols simultaneously to identify the best risk-adjusted opportunity.`,
          scenario: `Protocol A: TVL $3B, utilisation 71%, borrow rate 4.8%, supply APY 3.4% (real), reserve factor 10%, bad debt/treasury 95× (safe). Protocol B: TVL $120M, utilisation 88%, borrow rate 8.2%, supply APY 6.7% (real), reserve factor 15%, bad debt/treasury 4× (concerning). Protocol C: TVL $800M, utilisation 79%, borrow rate 6.1%, supply APY 4.8% (real), reserve factor 12%, bad debt/treasury 22× (good). Scorecard conclusion: Protocol A wins on safety. Protocol C wins on risk-adjusted yield. Protocol B's 6.7% real yield is not worth a 4× treasury buffer — one bad liquidation event could create depositor losses.`,
          outcome: `Priya recommends: 60% Protocol A (anchor safety), 40% Protocol C (yield improvement). Protocol B: watch list only — revisit when treasury ratio exceeds 10×.`,
        },
        {
          contextTag: `[Marcus's reserve factor analysis]`,
          context: `Marcus spots that a lending protocol changed its reserve factor from 10% to 25% via governance last month. He asks Maya to quantify the impact.`,
          scenario: `Before: borrow rate 6%, utilisation 80%, reserve factor 10%. Supply APY = 6% × 80% × 90% = 4.32%. After: same borrow rate and utilisation, reserve factor 25%. Supply APY = 6% × 80% × 75% = 3.60%. Impact: 0.72% reduction in supply APY. On $100M in deposits: depositors collectively receive $720K less per year. The treasury gets $720K more per year. Protocol claimed the treasury increase was for a "safety reserve" — but it simultaneously reduced depositor yield by 17%.`,
          outcome: `Marcus flags the governance vote as a material change for any depositor. He adds it to the team's monitoring list: reserve factor changes are a direct tax on depositors. A 25% reserve factor is above the DeFi average (10–15%) and warrants scrutiny.`,
        },
      ],

      keyTakeaway: `Six lending metrics: TVL (depth and trust signal), utilisation rate (demand health — target 70–85%), borrow rate (market pricing), supply APY (always decompose real vs emission), reserve factor (protocol's cut — watch for governance increases), bad debt/treasury ratio (safety buffer — below 5× is a concern, above 20× is healthy). TVL alone is the least useful metric. Bad debt/treasury ratio is the most underused but most important for assessing depositor safety. Sources: DeFiLlama Markets, Gauntlet, Chaos Labs, protocol governance forums.`,

      guidedPractice: [
        {
          question: `Utilisation is 91% on a $500M USDC lending pool. What specific risks does this create?`,
          options: [
            `A) No risk — high utilisation means high demand which is always positive`,
            `B) Two risks: (1) withdrawal illiquidity — only $45M of $500M is freely withdrawable; large withdrawals queue, (2) the protocol is above the kink — borrow rates are in the steep upswing zone, making new borrowing very expensive`,
            `C) The protocol will automatically reduce utilisation by minting more tokens`,
            `D) High utilisation only affects borrowers, not suppliers`,
          ],
          correct: 1,
          explanation: `91% utilisation means only 9% of deposits are available for withdrawal — $45M on a $500M pool. If $100M of suppliers try to withdraw simultaneously: $55M must wait for borrowers to repay first. Additionally, the protocol is above the standard 80% kink — borrow rates spike sharply to incentivise repayment and disincentivise new borrowing. Both withdrawal illiquidity and expensive new borrowing are direct consequences of 91% utilisation.`,
          hint: `If 91% is lent out, what percentage is available for withdrawal? And from L4.1: what happens to rates above the kink?`,
        },
        {
          question: `A protocol shows 15% supply APY. You check Token Terminal and find protocol revenue supports only 3% APY. What does the 12% gap represent and how should you classify it?`,
          options: [
            `A) A calculation error on Token Terminal`,
            `B) Emission yield — governance tokens distributed to depositors. The real yield floor is 3%. The 12% gap will compress as emissions decrease or token price falls.`,
            `C) Fees from liquidations distributed to depositors`,
            `D) Cross-chain yield that Token Terminal does not capture`,
          ],
          correct: 1,
          explanation: `Protocol revenue ÷ TVL = real yield floor. If that gives 3% and the advertised APY is 15%: the 12% gap is paid in governance tokens (emission yield). Applying the sustainability framework from L6.13: the 3% is the real floor that persists regardless of token price. The 12% deflates as (a) emission schedule reduces token issuance, (b) emission token price falls from selling pressure. For any allocation decision: the 3% floor is the number to rely on.`,
          hint: `From L6.1 and L6.13: what is the real yield test? If protocol revenue only supports 3%, where does the other 12% come from?`,
        },
        {
          question: `Protocol A has a reserve factor of 8%. Protocol B has a reserve factor of 22%. All else equal, which is better for depositors and which is better for the protocol's long-term safety?`,
          options: [
            `A) Protocol A is better for both depositors and long-term safety`,
            `B) Protocol A (8%) is better for depositors (they keep more of the interest). Protocol B (22%) is better for long-term safety (larger treasury builds faster to absorb bad debt events).`,
            `C) Protocol B is better for both`,
            `D) Reserve factor does not affect depositor yield`,
          ],
          correct: 1,
          explanation: `Supply APY = borrow rate × utilisation × (1 − reserve factor). Lower reserve factor → higher supply APY for depositors. Higher reserve factor → more revenue to the treasury → faster treasury growth → larger bad debt buffer. It is a direct trade-off. Aave's 10% reserve factor is a considered balance: enough treasury growth without excessively taxing depositors. A 22% reserve factor noticeably cuts depositor yield — quantify the impact before dismissing it.`,
          hint: `Supply APY formula includes (1 − reserve factor). What happens to supply APY when the reserve factor rises from 8% to 22%?`,
        },
        {
          question: `A protocol has $300M TVL and $1.2M in cumulative bad debt. Its treasury holds $8M. What is the bad debt/treasury ratio and what does it indicate?`,
          options: [
            `A) Ratio = 0.15 — dangerous, treasury is far too small`,
            `B) Ratio = treasury ÷ bad debt = $8M ÷ $1.2M = 6.67× — below the 10× comfort threshold, indicating the treasury is not deeply funded relative to historical bad debt`,
            `C) Ratio = bad debt ÷ TVL = 0.4% — excellent`,
            `D) Ratio = TVL ÷ treasury = 37.5× — healthy`,
          ],
          correct: 1,
          explanation: `Bad debt/treasury ratio = treasury ÷ cumulative bad debt = $8M ÷ $1.2M = 6.67×. Interpretation: the treasury can cover 6.67× the total bad debt the protocol has ever incurred. This is below the 10× threshold considered comfortable. If a single bad event creates $2M of new bad debt: treasury covers it but ratio drops to $6M ÷ $3.2M = 1.88× — dangerously thin. The protocol needs to grow its treasury before a significant liquidation failure event.`,
          hint: `The ratio is treasury ÷ bad debt (how many times over can the treasury cover historical bad debt). $8M ÷ $1.2M = ?`,
        },
        {
          question: `Connecting to L3.12 (DEX metrics): what is the key difference between evaluating a DEX's capital efficiency and a lending protocol's capital efficiency?`,
          options: [
            `A) DEXes have higher TVL than lending protocols so capital efficiency is less relevant`,
            `B) DEX capital efficiency = volume ÷ TVL (how much trading per dollar of liquidity). Lending capital efficiency = utilisation rate (how much borrowing per dollar of deposits). Both measure how hard each dollar works, but the relevant activity is different.`,
            `C) Capital efficiency only matters for DEXes, not lending protocols`,
            `D) Lending protocols use the same volume ÷ TVL formula as DEXes`,
          ],
          correct: 1,
          explanation: `DEX (from L3.12): capital efficiency = 24h volume ÷ TVL. High ratio = each dollar of liquidity enables lots of trading. Lending: capital efficiency = utilisation rate = borrowed ÷ deposited. High ratio = each dollar of deposits is working as a loan. Both measure productive use of capital, but through the protocol's primary activity: swapping (DEX) vs lending (lending protocol). Cross-apply both frameworks when comparing DEX-integrated lending protocols like GMX's GLP pool.`,
          hint: `What does each dollar of TVL "do" in a DEX vs in a lending protocol? What metric measures how actively it works in each context?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-data-interpret`,
          scenario: `Use DeFiLlama's Markets tab to pull the six metrics for Aave V3 USDC on Arbitrum and Morpho Blue USDC on Ethereum (or the closest available market). Build the scorecard table with all six columns. Then answer: which has higher capital efficiency (utilisation), which has a better safety buffer (treasury ratio if available), and which would you recommend for a $200K deposit with a 12-month horizon?`,
          scoringCriteria: [
            `Produces a table with all six metrics filled with real numbers from DeFiLlama or protocol dashboards`,
            `Correctly calculates supply APY from borrow rate × utilisation × (1 − reserve factor) if the dashboard shows components separately`,
            `Makes a recommendation referencing at least three specific metric values from the table`,
            `Notes Morpho Blue's curator model as a risk management layer that affects the safety assessment`,
          ],
        },
        {
          type: `judgment-yield-calc`,
          scenario: `A lending protocol governance vote proposes: raise reserve factor from 12% to 20%, use the extra revenue to build the treasury to $50M (currently $12M). Current state: $800M TVL, 78% utilisation, 6.2% borrow rate. Calculate: (A) current supply APY, (B) supply APY if reserve factor raises to 20%, (C) annual dollar impact on depositors at $800M TVL, (D) how many months until treasury reaches $50M at the new rate? Should depositors vote yes or no?`,
          scoringCriteria: [
            `Current supply APY: 6.2% × 78% × 88% = 4.25%`,
            `New supply APY: 6.2% × 78% × 80% = 3.87%`,
            `Annual depositor impact: $800M × (4.25% − 3.87%) = $3.04M/year less to depositors`,
            `Treasury growth rate: $800M × 6.2% × 78% × 8% = $3.04M/year → ($50M − $12M) ÷ $3.04M = 12.5 months. Balanced verdict: yes if treasury safety is a genuine concern; no if current bad debt history is minimal`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.2 (Aave): Marcus wants a lending protocol health report for a weekly team meeting. Write a 200-word brief covering Aave V3 Ethereum USDC using all six metrics. Format: one sentence per metric, one sentence on the biggest risk, one sentence verdict. Use specific current numbers from DeFiLlama. The brief should be usable by a non-technical portfolio manager.`,
          scoringCriteria: [
            `All six metrics addressed with specific numerical values`,
            `Biggest risk identified with a specific threshold that would trigger concern`,
            `Verdict written in plain language accessible to a non-technical reader`,
            `Numbers sourced from DeFiLlama or equivalent — not estimated from memory`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.9 — LIQUIDATION MECHANICS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'liquidation-mechanics',
      title: `4.9 Liquidation Mechanics — How They Work, Who Profits, and When They Fail`,
      subtitle: `Liquidations are DeFi's safety valve. When they work correctly: protocol stays solvent, depositors are safe, liquidators profit. When they fail: bad debt, depositor losses, potential protocol death.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.8 you built the lending metrics scorecard. The bad debt/treasury ratio — the most critical safety metric — is determined entirely by how well a protocol's liquidation system functions. This lesson breaks down the exact mechanics of a liquidation, why they sometimes fail, and how researchers evaluate liquidation system quality.`,

      hook: `In November 2022, a single $116M CRV loan on Aave generated $1.6M in bad debt in one transaction. The liquidation bots worked correctly but the collateral's on-chain liquidity was too thin to absorb a sale that large. The protocol survived. Most do not survive a version of this scaled 10×. Understanding why requires understanding how liquidations actually execute.`,

      visualPrompt: `A step-by-step liquidation flow: (1) ETH price drops → health factor below 1 → liquidation flag set. (2) Liquidation bot detects the flag in real time. (3) Bot calculates: repay X% of debt → receive collateral at Y% discount. (4) Bot calls liquidate() on-chain → repays debt → receives discounted collateral. (5) Bot sells collateral immediately on DEX. (6) Profit = liquidation bonus minus gas and slippage. Caption: "Five steps. Microseconds. One loser, one winner, and the protocol stays whole — if everything works."`,

      explanation: `Let me tell you about the safety valve of lending.

When borrowers' collateral drops too low, someone needs to step in and clear the debt before it becomes the protocol's problem. That someone is a liquidator — a bot (or person) who profits from doing the protocol's dirty work.

**The liquidation process — step by step:**

1. Price drops → borrower's health factor falls below 1.0
2. Liquidation bots monitor all positions on-chain in real time
3. Bot identifies the underwater position
4. Bot calls liquidate() → repays a portion of the borrower's debt
5. Bot receives the borrower's collateral at a [liquidation bonus] discount (typically 5–15%)
6. Bot immediately sells collateral to repay the capital used

The [liquidation bonus] is the liquidator's profit incentive — without it, no rational actor would run liquidation bots.

**Close factor — how much can be liquidated at once:**

[Close factor] = maximum percentage of a debt that can be repaid in one liquidation. Typically 50%.

Why not 100%? Smaller liquidations are gentler on price impact. Liquidating 50% rather than 100% of a $10M position means selling $5M of collateral rather than $10M — less DEX price impact, lower slippage, higher recovery for the borrower.

**The liquidation cascade:**

[Cascade liquidation] — when one large liquidation pushes the collateral asset's price lower on DEXes, causing other positions using the same collateral to breach their health factors, triggering more liquidations, pushing price lower again.

Example: 50 positions use ETH as collateral. Large ETH liquidation pushes ETH down 5% on-chain → 8 more positions now have health factor below 1 → 8 more liquidations → ETH drops another 3% → 12 more liquidations. Each round triggers the next.

**When liquidations fail — the path to bad debt:**

[Insufficient DEX liquidity]: if the collateral asset has thin on-chain liquidity, selling the liquidated collateral causes severe slippage — the received amount may be less than the debt repaid, creating bad debt.

[Oracle latency]: if the price oracle lags behind the real market price, the position may already be deeply underwater by the time it's flagged. Liquidators cannot recover the full debt.

[Network congestion / outage]: if the blockchain is congested (Ethereum gas spikes) or offline (Solana outages), liquidation bots cannot execute. Health factor breaches accumulate while the network is unavailable.

[MEV competition]: multiple bots competing to liquidate the same position can lead to gas wars that consume most of the liquidation bonus in fees — reducing the incentive to run bots at all.

**Partial vs full liquidation strategies:**

Aave V3: liquidators can choose to liquidate up to 50% (close factor) of the debt position. The remaining 50% either recovers if collateral price rebounds, or triggers another liquidation.

Some protocols use dynamic close factors — the deeper underwater a position, the higher the close factor allowed, to resolve severely underwater positions faster.`,

      examples: [
        {
          contextTag: `[Liquidation bot operator, mechanics walkthrough]`,
          context: `Jake runs a liquidation bot on Aave V3 Arbitrum. He identifies a position: $80K ETH collateral, $60K USDC debt, health factor 0.97.`,
          scenario: `Jake's bot calls liquidate(). Close factor 50% → repays $30K USDC → receives $30K × 1.05 (5% liquidation bonus) = $31,500 worth of ETH. Jake's gross profit: $1,500. Gas cost: $0.80 (Arbitrum). Collateral sell slippage: $31,500 ETH sold on Uniswap V3 Arbitrum → slippage 0.1% = $31.50. Net profit: $1,500 − $0.80 − $31.50 = $1,467.70 on a $30K capital deployment. The remaining $30K USDC debt and $48.5K ETH collateral: health factor now approximately 1.04 — above 1, no immediate further liquidation needed.`,
          outcome: `Jake books the $1,467.70 profit. His bot processes 12 similar liquidations that day for a total of $18K profit on $300K in capital deployed. Liquidation bots are a specialised yield strategy with high capital requirements and technical complexity.`,
        },
        {
          contextTag: `[Risk analyst, cascade liquidation simulation]`,
          context: `Priya is modelling cascade liquidation risk for a lending protocol with high ETH collateral concentration.`,
          scenario: `Protocol: $2B total deposits. 60% ETH collateral ($1.2B). Average LTV: 70%. Average liquidation threshold: 77%. Current ETH price: $3,000. Cascade scenario: ETH drops from $3,000 to $2,600 (−13.3%). At $2,600: positions with average LTV now have effective LTV = original_debt ÷ ($2,600/$3,000 × collateral). Approximate 15% of ETH-collateral positions breach liquidation threshold = $180M ETH to liquidate. Selling $180M ETH on Arbitrum's DEXes in a compressed timeframe: estimated 8–15% price impact. ETH drops to $2,200–$2,380. New round of liquidations triggered. Cascade risk is real and material at this concentration.`,
          outcome: `Priya recommends: add a circuit breaker (pause new borrowing if ETH drops more than 10% in 1 hour), and reduce maximum individual position size for ETH collateral. Her analysis influences Gauntlet's risk parameter recommendations to governance.`,
        },
        {
          contextTag: `[Researcher, oracle latency bad debt event]`,
          context: `Maya studies a real bad debt event on a smaller lending protocol caused by oracle latency during a flash crash.`,
          scenario: `Asset X experienced a flash crash: price dropped from $1.00 to $0.12 on-chain in two blocks. Oracle used a 30-minute TWAP. During the crash, oracle still showed $0.85 (lagged). A borrower had $10M of Asset X as collateral (oracle value: $8.5M) and $5.5M USDC debt. Real collateral value at $0.12: $1.2M — far below debt. Liquidation bots could not act until oracle updated (30 minutes later). By then: real collateral value $1.8M (partial recovery). Liquidation recovered $1.8M against $5.5M debt = $3.7M bad debt. Protocol treasury: $4.5M. Near-fatal: treasury now has $0.8M buffer against future events.`,
          outcome: `Maya documents: 30-minute TWAP oracles are too slow for illiquid assets that can crash 80%+ in minutes. DeFi risk recommendation: oracle update frequency must be faster than the protocol's liquidation response time. Fast-moving assets need Chainlink's 1-minute heartbeat, not 30-minute TWAPs.`,
        },
      ],

      keyTakeaway: `Liquidations: borrower health factor below 1 → liquidation bot calls liquidate() → repays up to close factor % of debt → receives collateral at liquidation bonus discount → sells immediately on DEX → profit = bonus minus gas and slippage. Three failure modes that create bad debt: thin DEX liquidity (collateral sale causes slippage exceeding the bonus), oracle latency (position deeply underwater before flagged), network congestion/outage (bots cannot execute). Cascade liquidations occur when selling collateral depresses price and triggers more liquidations. Evaluate protocols by: liquidation bonus size (incentive), close factor (gentleness), oracle speed, and DEX liquidity for collateral assets.`,

      guidedPractice: [
        {
          question: `A borrower has $100K ETH collateral and $70K USDC debt. Health factor drops to 0.94. The liquidation bonus is 6% and the close factor is 50%. What does a liquidator receive for one liquidation call?`,
          options: [
            `A) All $100K ETH collateral`,
            `B) $37,100 worth of ETH (repays $35K USDC, receives 35K × 1.06 = $37,100 in ETH at the current price)`,
            `C) $70K USDC equivalent in ETH (full debt repayment)`,
            `D) 6% of total collateral as a bonus`,
          ],
          correct: 1,
          explanation: `Close factor 50%: liquidator repays 50% × $70K = $35K USDC debt. Receives collateral worth $35K × 1.06 (6% bonus) = $37,100. The $37,100 in ETH is taken from the borrower's $100K collateral. Borrower now has: $100K − $37,100 = $62,900 ETH collateral and $35K USDC debt remaining. Liquidator's gross profit: $2,100 before gas and slippage.`,
          hint: `Close factor determines debt repaid (50% × $70K). Liquidation bonus determines collateral received (debt repaid × 1.06).`,
        },
        {
          question: `Why does the close factor limit liquidations to 50% rather than allowing 100% liquidation at once?`,
          options: [
            `A) To protect the liquidation bot from risk`,
            `B) Smaller liquidations create less DEX price impact when selling collateral, recovering more value for the borrower and reducing cascade risk for the protocol`,
            `C) Gas limits prevent full liquidations in one transaction`,
            `D) Regulatory requirements limit the size of forced sales`,
          ],
          correct: 1,
          explanation: `A $10M collateral liquidation sold all at once on DEX creates far more slippage than two $5M liquidations. Slippage on a $10M sale might be 8% — reducing recovery to $9.2M. Slippage on each $5M sale might be 3% — recovering $4.85M each = $9.7M total. The 50% limit also gives borrowers a chance to recover if collateral price rebounds before the second liquidation is triggered. Smaller, staged liquidations are gentler on both the borrower and the DEX market.`,
          hint: `What happens to price impact when you sell a large amount vs a small amount on a DEX? From L3.14: liquidity depth and slippage.`,
        },
        {
          question: `How does oracle latency create bad debt in lending protocols?`,
          options: [
            `A) Oracle latency increases gas costs for liquidations`,
            `B) A lagging oracle shows a stale (higher) price for collateral while the real market price has already fallen — the position appears healthy when it is actually deeply underwater. By the time the oracle updates, the liquidatable collateral may be worth far less than the debt.`,
            `C) Oracle latency only affects new borrows, not existing positions`,
            `D) Oracles update instantly in all DeFi protocols`,
          ],
          correct: 1,
          explanation: `A 30-minute TWAP oracle: if an asset crashes 70% in 5 minutes, the oracle still shows the pre-crash price for ~30 minutes. During that window: the position looks healthy to the smart contract. Liquidation bots cannot act on a position the contract doesn't flag as liquidatable. When the oracle finally updates: collateral is worth 30% of what it was — the protocol tries to liquidate but receives far less than the outstanding debt. The gap is bad debt.`,
          hint: `If a price has already crashed but the oracle hasn't updated yet, what does the smart contract think the health factor is?`,
        },
        {
          question: `Connecting to L2.7 (Solana): what specific risk do Solana network outages create for lending protocols compared to Ethereum?`,
          options: [
            `A) No difference — lending protocols are chain-agnostic`,
            `B) During Solana outages (which lasted hours in 2021–2022), liquidation bots cannot execute — health factors can breach 1.0 while the network is unavailable, accumulating bad debt that all materialises when the network returns`,
            `C) Outages cause automatic position closures to protect depositors`,
            `D) Ethereum has more outages than Solana`,
          ],
          correct: 1,
          explanation: `Ethereum has never experienced a full network outage. Solana had multiple multi-hour outages in 2021–2022. During an outage: no transactions can execute, including liquidations. If ETH drops 20% during a 4-hour Solana outage, positions that become liquidatable cannot be acted on. When the network returns, all liquidations execute simultaneously — a waterfall of activity that creates MEV competition and potential slippage cascades. This is a systemic lending risk specific to networks with historical outage records.`,
          hint: `Who needs to be online to execute a liquidation? What happens if the network stops them from acting for 4 hours while prices move?`,
        },
        {
          question: `A lending protocol's largest collateral asset (60% of deposits) has only $5M of DEX liquidity. The protocol has $400M in deposits. What specific risk does this create?`,
          options: [
            `A) No risk — DEX liquidity only affects trading, not lending`,
            `B) Thin DEX liquidity means large collateral liquidations cause severe slippage — a $20M liquidation into $5M of DEX liquidity could cause 50%+ price impact, meaning liquidators receive far less than the debt they repaid, creating bad debt`,
            `C) The protocol should increase its reserve factor to compensate`,
            `D) Liquidators will simply wait for more DEX liquidity to appear`,
          ],
          correct: 1,
          explanation: `Liquidation flow: receive collateral → sell on DEX immediately → repay capital. If the DEX has $5M liquidity and you try to sell $20M of collateral: extreme slippage (perhaps 60% price impact). You receive $8M for $20M of collateral against $16M of debt you repaid. Bad debt: $8M. For a protocol with $400M TVL and 60% in this asset: a 15% collateral price drop could trigger $36M in liquidations into $5M DEX liquidity — catastrophic. This is why protocols cap collateral concentration and require minimum DEX liquidity thresholds.`,
          hint: `From L3.14 (liquidity analysis): what happens to price when you sell an asset into a thin market? How does this affect the liquidation recovery amount?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `A lending protocol has: $600M TVL, 65% concentrated in one altcoin (ALTX), ALTX DEX liquidity $8M across all venues, oracle = 15-minute TWAP, liquidation bonus 5%, close factor 50%. Build a "liquidation stress test": assume ALTX drops 30% over 2 hours. Walk through: (A) which positions get flagged for liquidation, (B) what happens to the liquidation execution given $8M DEX liquidity, (C) can the protocol's treasury absorb the likely bad debt, (D) what three risk parameter changes would reduce this risk?`,
          scoringCriteria: [
            `Identifies that the 15-minute TWAP lags the 2-hour crash, delaying liquidation flags`,
            `Calculates approximate liquidation volume: $600M × 65% × (fraction with health factor near 1) — reasonable estimate showing multi-tens-of-millions needing liquidation`,
            `Identifies that multi-tens-of-millions of ALTX into $8M DEX liquidity creates catastrophic slippage and bad debt`,
            `Names three specific improvements: (1) switch to faster oracle (1-min heartbeat), (2) cap ALTX collateral concentration or supply cap, (3) require minimum DEX liquidity for new collateral listings`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.2 (Aave): the November 2022 CRV attack resulted in $1.6M bad debt on Aave. The attacker borrowed $100M USDC using CRV as collateral and shorted CRV externally to push it below the liquidation threshold. Explain: (A) why liquidation bots could not prevent the bad debt despite executing correctly, (B) what the $300M+ Aave treasury's role was, (C) what governance change Aave implemented to prevent recurrence, and (D) why this event was less damaging for Aave than it would have been for a protocol with a $3M treasury.`,
          scoringCriteria: [
            `Correctly identifies thin CRV DEX liquidity as the reason liquidation slippage exceeded the liquidation bonus — bots executed correctly but recovered less than the debt`,
            `Correctly states treasury absorbed the $1.6M bad debt gap, protecting depositors`,
            `Names governance change: borrow caps or supply caps on CRV (limits single-asset concentration)`,
            `Correctly calculates the comparative risk: $1.6M bad debt vs $3M treasury = 53% of treasury gone vs 0.5% of Aave's treasury`,
          ],
        },
        {
          type: `judgment-yield-calc`,
          scenario: `Jake is evaluating running a liquidation bot on Aave V3 Arbitrum. Capital available: $500K. Average liquidation size: $40K debt (repaying 50% = $20K). Liquidation bonus: 5%. Average gas: $0.80. Average slippage on collateral sale: 0.15%. Expected daily liquidation opportunities at current market volatility: 8. Calculate: (A) gross profit per liquidation, (B) net profit per liquidation, (C) daily net profit, (D) annual net profit, (E) ROI on $500K capital. Is this a viable yield strategy?`,
          scoringCriteria: [
            `Gross profit per liquidation: $20K × 5% = $1,000`,
            `Net profit: $1,000 − $0.80 gas − ($20K × 1.05 × 0.15% slippage) = $1,000 − $0.80 − $31.50 = $967.70`,
            `Daily net: 8 × $967.70 = $7,741.60`,
            `Annual: $7,741.60 × 365 = $2.825M. ROI: $2.825M ÷ $500K = 565% — exceptional, but capital is not always deployed (opportunities are intermittent), and real-world competition from other bots compresses the bonus`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.10 — BAD DEBT RISK
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'bad-debt-risk',
      title: `4.10 Bad Debt Risk — When Liquidations Fail and Depositors Pay`,
      subtitle: `Bad debt is the gap between what a liquidation recovers and what the borrower owed. It is rare, usually small, and occasionally existential. Here is how to assess it before it becomes your problem.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.9 you learned how liquidations work and the three ways they fail. This lesson quantifies the consequences of those failures — bad debt — and teaches the research framework for assessing bad debt risk before it materialises. The bad debt/treasury ratio from L4.8 is the output; this lesson explains the inputs.`,

      hook: `Venus Protocol on BNB Chain accumulated $100M+ in bad debt in one week in 2022 from a single XVS collateral manipulation. The protocol survived only because Binance backstopped it. Most protocols do not have Binance as a backstop. Understanding what creates bad debt — and how to spot the conditions before it happens — is one of the most valuable skills in DeFi lending research.`,

      visualPrompt: `A spectrum from "Normal liquidation" to "Bad debt event": Normal = collateral > debt, liquidation recovers full amount, protocol safe. Yellow zone = thin DEX liquidity, partial recovery, small bad debt absorbed by treasury. Red zone = oracle manipulation or crash + insufficient liquidity, massive bad debt, treasury depleted, depositor losses. Caption: "Bad debt is on a spectrum. Your job is to identify where a protocol sits before the event."`,

      explanation: `Let me tell you about the worst-case scenario for lending protocols.

Liquidations usually work. But sometimes they do not recover the full debt. The gap — the amount the protocol owes depositors but cannot recover from the collateral — is called bad debt.

**What creates bad debt:**

[Insufficient collateral recovery]: collateral is liquidated but DEX slippage means less is recovered than the outstanding debt. Gap = bad debt.

[Oracle manipulation]: attacker inflates collateral price on oracle, borrows against the inflated value, allows oracle to normalise. Collateral at real price is worth less than the debt. Gap = bad debt.

[Flash crash beyond liquidation threshold]: collateral drops so fast and so far that by the time liquidation executes, collateral value is below debt even after the liquidation bonus.

[Governance risk (Solend-style)]: extreme scenario where the governance mechanism itself creates bad debt by failing to act or acting incorrectly.

**Real bad debt events — case study comparison:**

[Aave CRV 2022]: $1.6M bad debt. Cause: thin CRV DEX liquidity. Treasury absorbed: yes. Depositor losses: zero. Protocol status: unaffected.

[Venus XVS 2022]: $100M+ bad debt. Cause: XVS price manipulation, concentrated positions, insufficient collateral limits. Treasury absorbed: partially. Binance backstop: yes. Depositor losses: minimal (with backstop). Without backstop: catastrophic.

[Euler Finance hack 2023]: $197M flash loan exploit. Note: this was a smart contract hack, not a bad debt event — but the depositor impact is similar. Protocol ultimately recovered funds through negotiation.

**Bad debt vs hack — important distinction:**

Bad debt: collateral was liquidated but not enough recovered. Protocol functions correctly but economics fail.
Hack: smart contract vulnerability exploited. Protocol fails technically.

Both result in depositor losses. Researchers should evaluate both simultaneously.

**The bad debt risk framework:**

Step 1 — Collateral quality: what assets are accepted as collateral? High-cap, deep-liquidity assets (ETH, BTC) create much less bad debt risk than small-cap tokens.

Step 2 — Oracle quality: Chainlink with multiple price feeds? Or single DEX TWAP? Fast heartbeat? Slow heartbeat?

Step 3 — Concentration limits: is any single collateral asset >30% of total deposits? Is any single position >2% of pool TVL?

Step 4 — DEX liquidity ratio: for each major collateral, what is (total collateral in protocol) ÷ (DEX liquidity for that asset)? Above 10× means the protocol cannot liquidate without severe price impact.

Step 5 — Treasury buffer: can the treasury absorb a 0.5% bad debt event without reaching zero?

**Monitoring tools:**

Gauntlet: monthly risk reports for Aave, Compound, and others. Most actionable source.
Chaos Labs: similar, with real-time position monitoring.
DeFi-specific dashboards: Rekt.news tracks all DeFi exploits including bad debt events.`,

      examples: [
        {
          contextTag: `[Risk analyst, Venus XVS bad debt autopsy]`,
          context: `Maya is writing a post-mortem on the Venus BNB Chain bad debt event for the team's risk library.`,
          scenario: `Venus protocol 2022: a single entity held a massive XVS position and used it as collateral. When XVS price dropped sharply, the position became liquidatable. But: XVS had insufficient DEX liquidity relative to the liquidation size. Liquidation slippage was severe — liquidators received far less than the debt. Result: $100M+ bad debt. Venus's treasury: insufficient to absorb. Binance (which had XVS interests) provided emergency backstop funds to prevent Venus from insolving depositors. Root cause: (1) No per-user position concentration limit. (2) No DEX liquidity check before listing XVS with high LTV. (3) Oracle allowed by governance without adequate liquidity verification.`,
          outcome: `Maya's root cause analysis: all three failures are preventable with standard risk controls. Venus had no equivalent to Aave's supply caps, position concentration limits, or Gauntlet's monthly liquidity checks. Lesson for research: protocol risk management sophistication matters as much as smart contract quality.`,
        },
        {
          contextTag: `[Protocol comparison, bad debt absorption capacity]`,
          context: `Priya is comparing bad debt absorption capacity for four protocols as part of a risk assessment matrix.`,
          scenario: `Aave V3: Treasury $300M+. Historical bad debt $1.6M. Absorption ratio: 187×. Can absorb a $15M bad debt event (5%) without treasury depletion. Compound V3: Treasury ~$50M. Historical bad debt: minimal. Conservative collateral list. Can absorb a $2.5M event. Venus: Treasury ~$40M after Binance backstop. Recent bad debt history. Less comfortable. New protocol X: Treasury $800K. No bad debt history (too new to have any). Can absorb $40K event. New Protocol X's unknown history is not a safety feature — it is an untested system.`,
          outcome: `Priya establishes a rule: for any protocol with treasury < 5× expected annual bad debt risk (based on collateral quality and liquidity), position size is capped at 5% of total lending allocation. Protocol X falls below this threshold.`,
        },
        {
          contextTag: `[Live monitoring, Gauntlet risk report]`,
          context: `Jake reads Gauntlet's monthly risk report for Aave and finds a concern about wstETH concentration.`,
          scenario: `Gauntlet report highlights: wstETH collateral on Aave Ethereum has grown to 22% of total deposits. In a stETH depeg scenario (like June 2022's 6% depeg): at 22% concentration, liquidation demand could be $1.1B in wstETH. stETH DEX liquidity: $400M on Curve stETH/ETH pool. Liquidation ratio: $1.1B needed ÷ $400M available = 2.75× the available liquidity. Even with partial liquidations, severe price impact is mathematically certain. Gauntlet recommends: lower wstETH supply cap to 15% of total deposits. Governance passes the cap reduction.`,
          outcome: `Jake now reads Gauntlet reports monthly as a standard protocol monitoring step. The reports translate protocol risk into specific, actionable parameter changes — the most useful risk management resource in DeFi lending.`,
        },
      ],

      keyTakeaway: `Bad debt = debt not recovered from liquidated collateral. Four root causes: insufficient DEX liquidity (most common), oracle manipulation, flash crash beyond threshold, and governance failure. Case studies: Aave $1.6M (treasury absorbed, depositors safe), Venus $100M+ (Binance backstop required). Five-step bad debt risk framework: (1) collateral quality, (2) oracle quality and speed, (3) concentration limits per-asset and per-user, (4) DEX liquidity ratio (protocol exposure ÷ DEX liquidity), (5) treasury buffer ratio. Monitoring resources: Gauntlet and Chaos Labs monthly reports. High-quality risk management separates Aave's $1.6M bad debt from Venus's $100M+ event.`,

      guidedPractice: [
        {
          question: `A lending protocol accepts TOKEN_X as collateral. TOKEN_X has $150M deposited as collateral and $20M in DEX liquidity across all venues. What is the DEX liquidity ratio and what does it indicate?`,
          options: [
            `A) Ratio = 0.13 — insufficient DEX liquidity relative to protocol exposure`,
            `B) Ratio = protocol exposure ÷ DEX liquidity = $150M ÷ $20M = 7.5× — the protocol holds 7.5× more TOKEN_X than DEX liquidity can absorb without severe slippage`,
            `C) The ratio is irrelevant — liquidations happen gradually`,
            `D) Ratio = $20M ÷ $150M = 0.13 — healthy since less than 1`,
          ],
          correct: 1,
          explanation: `DEX liquidity ratio = protocol collateral exposure ÷ DEX liquidity for that asset. $150M ÷ $20M = 7.5×. The protocol holds 7.5 times more TOKEN_X than DEX markets can absorb without severe price impact. If even 20% of TOKEN_X positions require liquidation simultaneously ($30M): selling $30M into $20M of DEX liquidity causes catastrophic slippage. Threshold guidance: >5× is elevated risk, >10× is severe risk. This protocol is in the elevated risk zone.`,
          hint: `If you need to sell $30M of an asset into $20M of DEX liquidity, what happens to the price? How does that create bad debt?`,
        },
        {
          question: `What is the key difference between the Aave CRV 2022 bad debt event and the Venus XVS 2022 bad debt event in terms of scale and root cause?`,
          options: [
            `A) Both events were caused by the same oracle vulnerability`,
            `B) Aave: $1.6M bad debt from a single coordinated attack on CRV liquidity — absorbed by Aave's $300M+ treasury. Venus: $100M+ bad debt from concentrated XVS positions with no per-user limits and insufficient protocol-managed risk controls — required a Binance backstop.`,
            `C) Venus's event was caused by a smart contract hack, not bad debt`,
            `D) The events were identical in structure but different in scale`,
          ],
          correct: 1,
          explanation: `Root causes differ critically. Aave: a coordinated attacker exploited known thin CRV liquidity — an external attack on a known vulnerability. Response: governance added CRV borrow caps. Venus: organic risk management failure — no per-user limits, no DEX liquidity checks before listing, no concentration caps. The structural vulnerability existed for months before materialising. Aave's event was a sophisticated attack; Venus's was a risk management failure. The magnitude difference (100×) reflects the sophistication gap in risk management infrastructure.`,
          hint: `What did Aave have that Venus lacked? (Treasury size and risk controls)`,
        },
        {
          question: `Why is "no historical bad debt" NOT a positive signal for a new lending protocol?`,
          options: [
            `A) It means the protocol is too conservative`,
            `B) A new protocol has not yet experienced a significant market stress event — zero bad debt history means zero tested safety, not proven safety`,
            `C) New protocols always have bad debt`,
            `D) Historical bad debt is irrelevant for evaluating current risk`,
          ],
          correct: 1,
          explanation: `Aave has $1.6M in historical bad debt across 4+ years — and that $1.6M demonstrates the system worked (treasury absorbed it, depositors were safe). A 3-month-old protocol with zero bad debt has simply not been stress-tested. It has not experienced a -30% ETH crash, a coordinated collateral attack, or an oracle failure. Zero history = untested, not zero risk. An experienced risk researcher treats new protocols as higher risk precisely because their failure modes are unknown.`,
          hint: `If you have never driven in heavy rain, does that mean you are a safe driver in heavy rain? What does "no bad debt" actually prove?`,
        },
        {
          question: `Connecting to L4.8 (lending metrics): a protocol has $200M TVL and $15M treasury. Gauntlet estimates potential bad debt in a severe market scenario at $8M. Is the treasury adequate?`,
          options: [
            `A) Yes — $15M treasury covers $8M bad debt with buffer`,
            `B) Barely — $15M covers the $8M event but leaves only $7M ($3.5× historical exposure). Any second event or larger event could deplete the treasury. Grade: C (manageable but concerning).`,
            `C) No — the treasury must be 50% of TVL`,
            `D) Treasury size does not affect depositor safety`,
          ],
          correct: 1,
          explanation: `$15M covers $8M — the protocol survives a single severe event. Remaining buffer: $7M = 0.875× of the scenario's bad debt. If a second similar event follows: treasury cannot cover it. Bad debt/treasury ratio for this scenario: $15M ÷ $8M = 1.875× — dangerously thin. Gauntlet's scenarios often represent 90th percentile stress, not the maximum possible loss. The 10th percentile catastrophic scenario could produce $20M+ bad debt — exceeding treasury. Grade C: proceed with caution and a smaller position size.`,
          hint: `After absorbing $8M in bad debt, how much treasury remains? Can it cover a second similar event?`,
        },
        {
          question: `Gauntlet recommends lowering a collateral asset's LTV from 75% to 65%. A depositor argues this makes the protocol "too conservative." What is the correct response?`,
          options: [
            `A) The depositor is right — lower LTV reduces capital efficiency`,
            `B) Lower LTV reduces bad debt risk: borrowers must maintain more collateral per unit of debt, making liquidations less likely and recovery higher when they do occur. Capital efficiency decreases slightly but depositor safety increases significantly.`,
            `C) LTV changes have no effect on bad debt probability`,
            `D) Gauntlet's recommendations are always too conservative`,
          ],
          correct: 1,
          explanation: `Lower LTV = larger collateral buffer per loan = harder to reach the liquidation threshold = smaller bad debt when liquidation occurs. At 75% LTV: a position is liquidatable when collateral falls 8.3% below entry. At 65% LTV: liquidatable when collateral falls 18.2% below entry. The larger buffer gives more time for liquidation bots to act and ensures more collateral value remains when the liquidation executes. The "cost" to borrowers: they can borrow $65K against $100K collateral instead of $75K. The benefit to depositors: significantly reduced bad debt probability.`,
          hint: `Higher LTV = borrower can borrow more but has less collateral buffer. If the buffer shrinks, how does that affect bad debt probability when the price crashes?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `Run the five-step bad debt risk framework on a hypothetical lending protocol with these parameters: accepts MEME_COIN (60% of deposits, $400M), oracle = Chainlink 1-hour TWAP, MEME_COIN DEX liquidity = $15M, no per-user position cap, treasury = $5M, LTV = 70%. Score each step A-D and identify the single greatest risk factor. What is the maximum safe position size for an institutional depositor given these findings?`,
          scoringCriteria: [
            `Step 1 collateral quality: D (meme coin, high volatility, 60% concentration)`,
            `Step 2 oracle: C (1-hour TWAP too slow for volatile assets — could lag a crash by 60 minutes)`,
            `Step 3 concentration: D (60% single asset, no per-user cap)`,
            `Step 4 DEX liquidity ratio: $400M ÷ $15M = 26.7× — D (catastrophically insufficient)`,
            `Step 5 treasury: D ($5M against potential tens-of-millions bad debt)`,
            `Identifies DEX liquidity as greatest risk. Recommends zero or symbolic position ($10K max) for institutional capital`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.9 (liquidation mechanics) and L4.6 (Solend): design a "bad debt prevention checklist" for a new Solana lending protocol about to accept its first 10 collateral assets. For each of the five root causes of bad debt (thin DEX liquidity, oracle latency, concentration, governance failure, network outage), provide one specific, measurable parameter or policy that would mitigate that cause. Format as a checklist usable in a governance proposal.`,
          scoringCriteria: [
            `DEX liquidity: minimum 10× rule (max collateral deposit = 10% of DEX liquidity for that asset)`,
            `Oracle: maximum heartbeat 1 minute for volatile assets; Pyth with confidence interval check`,
            `Concentration: no single collateral asset > 25% of total TVL; per-user borrow cap at 2% of pool TVL`,
            `Governance: 48-hour minimum timelock for parameter changes; emergency multisig requires 5/9 signers`,
            `Network outage: liquidation circuit breaker — if network is unavailable for 30+ minutes, new borrows paused until bots confirm operation resumed`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Read Gauntlet's latest risk report for Aave (find at gauntlet.network or Aave governance forum). Identify: (A) which collateral asset Gauntlet flags as highest risk, (B) what specific parameter change they recommend, (C) what bad debt scenario they model, (D) whether Aave's current treasury covers their modelled scenario. Write a two-sentence summary suitable for the weekly research brief.`,
          scoringCriteria: [
            `Correctly identifies a specific collateral asset flagged by Gauntlet with a risk reason`,
            `States the specific numerical parameter change recommended (e.g. reduce LTV from X% to Y%)`,
            `References Gauntlet's scenario modelling with specific numbers`,
            `Compares scenario bad debt estimate to current Aave treasury size`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.11 — INTEREST RATE MODELS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'interest-rate-models',
      title: `4.11 Interest Rate Models — The Curves That Control Your Yield`,
      subtitle: `Every lending protocol has a rate model. They look similar. They are not. The kink point, the slope, and the maximum rate determine who wins and who gets stuck.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.1 you learned the kink model conceptually. This lesson goes deeper: comparing exact rate curve implementations across Aave, Compound, Spark/Maker, and Fraxlend's adaptive model. Understanding these differences lets you predict rate behaviour during market stress — before it happens.`,

      hook: `In May 2022, Aave USDC utilisation hit 99.8%. The borrow rate reached 147% APY. No new borrowing was economical. Existing borrowers rushed to repay. In 72 hours utilisation dropped to 65% and rates normalised. The rate model did exactly what it was designed to do — it was just more painful than anyone expected. Knowing the maximum rate before you borrow could have avoided the panic.`,

      visualPrompt: `Two rate curves side by side. Left: standard kink model — flat from 0–80% utilisation (gentle slope), then steep from 80–100% (approaching 100%+ APY). Right: Fraxlend adaptive model — same shape but the kink point and slope "drift" over time based on historical utilisation. Both labelled with key parameters: optimal utilisation, base rate, slope 1 (below kink), slope 2 (above kink). Caption: "Knowing the curve means knowing your worst case before you commit."`,

      explanation: `Let me tell you about the curves that control your money.

You know rates change with utilisation. What you need to know next is exactly how — and what the worst case looks like for your specific protocol.

**The standard kink model — Aave V3:**

Four parameters define Aave's rate curve for each asset:

[Base rate]: minimum borrow rate even at 0% utilisation (often 0% for stable assets).
[Optimal utilisation (U_optimal)]: the kink point. Typically 80–90% for stablecoins, 45–65% for volatile assets.
[Slope 1]: rate increase per percentage point of utilisation below U_optimal.
[Slope 2]: rate increase per percentage point above U_optimal. Much steeper than Slope 1.

Formula below the kink: borrow rate = base rate + (utilisation ÷ U_optimal) × Slope 1
Formula above the kink: borrow rate = base rate + Slope 1 + ((utilisation − U_optimal) ÷ (1 − U_optimal)) × Slope 2

Example — Aave V3 USDC: base 0%, U_optimal 90%, Slope 1 6%, Slope 2 60%.
At 90% utilisation: borrow rate ≈ 6%.
At 95% utilisation: 6% + (5% ÷ 10%) × 60% = 6% + 30% = 36%.
At 99%: 6% + (9% ÷ 10%) × 60% = 6% + 54% = 60%.

**Different protocols, different curves:**

Compound V3 USDC Comet: similar kink model but different parameters. U_optimal 80%, Slope 2 more aggressive — hits 100%+ APY at 95% utilisation to prevent illiquidity more forcefully.

Spark/Maker D3M: rate is not pure market-driven — the D3M sets a floor and ceiling. Governance directly adjusts rates. Not curve-based in the same way.

Fraxlend adaptive: the kink moves. Above-kink rate accelerates faster the longer utilisation stays elevated. The curve "learns" from market stress. At 90% sustained utilisation for 7 days, the rate may be 3× higher than at 90% for 1 hour.

**Why the maximum rate matters:**

A borrower who enters at 6% APY could face 80% APY if utilisation spikes above the kink — the variable rate is legally what they agreed to. A researcher must always calculate: "what is my maximum possible borrow cost if utilisation reaches 95%+ on this protocol?"

**Rate model as a governance tool:**

Governance can change rate model parameters. A governance vote to lower Slope 2 from 60% to 40% makes the above-kink region less punishing — potentially keeping more borrowers during stress (but increasing depositor illiquidity risk). Rate model changes are governance votes. Check the changelog.`,

      examples: [
        {
          contextTag: `[Borrower stress-testing their rate]`,
          context: `Jake is borrowing $200K USDC on Aave V3 Ethereum at current 5.8% APY. He wants to know his worst-case rate.`,
          scenario: `Aave V3 USDC: U_optimal 90%, current utilisation 78%. At 90%: ~6%. At 95%: ~36%. At 99%: ~60%. Historical max utilisation on Aave USDC: 99.8% in May 2022 → rate hit 147%. Jake models: if utilisation hits 95% (a realistic stress scenario), his borrow rate jumps to 36%. On $200K that is $72K/year or $6K/month. His strategy must generate >36% APY to remain profitable. He decides: if he cannot generate 36%+ from the borrowed capital, he should use a fixed-rate alternative (Pendle PT from L6.10) or reduce his borrow size.`,
          outcome: `Jake reduces his borrow to $100K, keeping enough margin that even a 36% borrow rate is sustainable for 30 days while he unwinds. He sets a rate alert at 20% APY to trigger early review.`,
        },
        {
          contextTag: `[Aave vs Compound rate comparison at stress utilisation]`,
          context: `Priya compares Aave V3 and Compound V3 USDC borrow rates at various utilisation levels for a report on lending protocol behaviour during market stress.`,
          scenario: `At 80% utilisation: Aave 4.8%, Compound 5.1%. At 90% (Aave kink): Aave 6%, Compound 8.2%. At 95%: Aave 36%, Compound 48%. At 99%: Aave 60%, Compound 80%. Compound V3's more aggressive Slope 2 creates higher stress rates — better for depositors (more incentive to repay quickly, reducing withdrawal risk) but worse for existing borrowers (more painful above-kink). Priya's conclusion: for borrowers who want predictability, Aave's lower stress rates are preferable. For depositors who want withdrawal liquidity protection, Compound's aggressive above-kink rates are preferable.`,
          outcome: `Priya adds to the team's protocol matrix: "Aave: depositor-friendly stress rates. Compound: more aggressive repayment incentives above kink." Both designs are rational — they serve different priorities.`,
        },
        {
          contextTag: `[Fraxlend adaptive rate in action]`,
          context: `Maya monitors a Fraxlend market where a volatile token has sustained 94% utilisation for 10 days.`,
          scenario: `Standard kink model at 94% utilisation: borrow rate ~40%. Fraxlend adaptive model after 10 days at 94%: borrow rate has drifted up to ~85%. The adaptive model has increased the effective above-kink rate daily because high utilisation persisted. Existing borrowers face 85% APY — most are unprofitable and begin repaying. Utilisation drops from 94% to 71% over the next 3 days. Adaptive model then begins slowly reducing the rate. Result: the adaptive rate was more aggressive at forcing repayment than a standard kink would have been — protecting the protocol's depositor withdrawal liquidity faster.`,
          outcome: `Maya documents: Fraxlend's adaptive model is specifically designed for assets where high utilisation could persist — it escalates automatically without requiring governance action. For borrowers: commit only if confident in the long-term strategy, because the rate will worsen over time if utilisation stays elevated.`,
        },
      ],

      keyTakeaway: `Standard kink model (Aave, Compound): four parameters — base rate, optimal utilisation (kink), slope below kink (gentle), slope above kink (steep). Know your worst-case rate before borrowing: calculate borrow cost at 95% and 99% utilisation. Aave V3 USDC at 99% = ~60% APY. Compound V3 is more aggressive above the kink (better withdrawal protection, worse for borrowers). Fraxlend adaptive: rate curve drifts higher the longer utilisation stays elevated — more aggressive repayment pressure over time. Spark/Maker: governance-set rate floor, not pure utilisation-driven. Key rule: never borrow on a variable rate without modelling the maximum possible rate.`,

      guidedPractice: [
        {
          question: `Aave V3 USDC has: base 0%, U_optimal 90%, Slope 1 6%, Slope 2 60%. Current utilisation is 93%. What is the approximate borrow rate?`,
          options: [`A) 6%`, `B) 24%`, `C) 60%`, `D) 90%`],
          correct: 1,
          explanation: `Above-kink formula: borrow rate = base + Slope 1 + ((utilisation − U_optimal) ÷ (1 − U_optimal)) × Slope 2 = 0% + 6% + ((93% − 90%) ÷ (100% − 90%)) × 60% = 6% + (3% ÷ 10%) × 60% = 6% + 18% = 24%. At just 3% above the kink, the rate has already quadrupled from the kink rate. This is the kink model's design: dramatic rate increases for small utilisation increases above optimal.`,
          hint: `Above-kink: start at kink rate (6%), add Slope 2 × (how far above kink ÷ remaining room). 93% is 3% above 90% kink.`,
        },
        {
          question: `A borrower takes a variable rate loan at 6% APY when utilisation is 78%. Utilisation spikes to 95% in one week. What is their new borrow rate using Aave V3 USDC parameters (U_optimal 90%, Slope 2 60%)?`,
          options: [`A) Still 6% — rates only change when they open new positions`, `B) 36% APY — variable rates reset each block based on current utilisation`, `C) 18% APY`, `D) 78% APY`],
          correct: 1,
          explanation: `Variable rate loans reset every block. At 95%: 6% + ((95% − 90%) ÷ 10%) × 60% = 6% + 30% = 36% APY. The borrower who entered at 6% is now paying 36%. This is the variable rate risk. On $200K borrowed: weekly cost at 36% APY = $200K × 36% ÷ 52 = $1,384/week. Compare to original $200K × 6% ÷ 52 = $231/week. Rate spikes can make previously profitable strategies immediately unprofitable.`,
          hint: `Variable rate = current utilisation rate, not the rate when you entered. Calculate borrow rate at 95% with the above-kink formula.`,
        },
        {
          question: `Why does Fraxlend's adaptive rate model provide better protection for depositors than a standard kink model during prolonged high utilisation?`,
          options: [
            `A) Fraxlend has a higher maximum rate than Aave`,
            `B) The adaptive model increases the effective rate continuously while utilisation stays elevated — this creates mounting pressure on borrowers to repay, restoring liquidity faster than a static curve that stays at one rate regardless of duration`,
            `C) Fraxlend allows depositors to set their own rates`,
            `D) The adaptive model reduces borrower rates during high utilisation`,
          ],
          correct: 1,
          explanation: `Standard kink model: at 94% utilisation, rate = X% forever. Borrowers face a constant rate and may decide to stay if their strategy still earns more than X%. Fraxlend adaptive: at 94% utilisation for Day 1, rate = X%. By Day 7: rate = X% + accumulated adjustment. The increasing rate pressure means even profitable borrowers eventually face a rate that exceeds their strategy returns — forcing repayment and restoring depositor withdrawal liquidity. Duration of high utilisation directly increases the cost, not just the level.`,
          hint: `What happens to the rate in Fraxlend adaptive model on Day 1 vs Day 7 at the same utilisation? Does a standard kink model care about duration?`,
        },
        {
          question: `Connecting to L4.5 (Spark): why does Spark's DAI rate model behave fundamentally differently from Aave's utilisation-driven model?`,
          options: [
            `A) Spark does not charge interest`,
            `B) Spark's DAI rate is set by Maker governance via the D3M — it can be held below market utilisation rates, bypassing the kink model entirely when governance wants cheap DAI`,
            `C) Spark uses a steeper kink than Aave`,
            `D) Spark's rate is driven by FRAX price`,
          ],
          correct: 1,
          explanation: `Aave's rate: purely algorithmic — utilisation → rate formula → rate. No human input after parameters are set. Spark's DAI rate: governance-influenced via D3M. If Maker injects more DAI into Spark's pool, utilisation drops, rate drops — even if market demand would otherwise push it higher. Governance can keep the rate at 4% while the equivalent Aave market charges 8%. This control is Spark's competitive advantage and its central risk (one governance vote removes it).`,
          hint: `From L4.5: what does the D3M do to Spark's pool? How does that affect the utilisation level that drives the rate?`,
        },
        {
          question: `A governance vote proposes changing Aave V3's USDC Slope 2 from 60% to 80%. What are the effects on depositors and borrowers above the kink?`,
          options: [
            `A) Depositors earn less, borrowers pay more`,
            `B) Depositors benefit: higher Slope 2 creates more aggressive above-kink rates → faster repayment → faster return to sustainable withdrawal liquidity. Borrowers pay more above the kink — the rate spike is steeper.`,
            `C) No impact above the kink — Slope 2 only affects below-kink rates`,
            `D) Only new borrowers are affected, not existing positions`,
          ],
          correct: 1,
          explanation: `Higher Slope 2 = steeper rate curve above the kink. At 95% utilisation with Slope 2 = 80%: rate = 6% + (5% ÷ 10%) × 80% = 46% vs 36% with Slope 2 = 60%. Borrowers face higher costs above the kink → more incentive to repay → utilisation drops faster → depositors get withdrawal liquidity restored sooner. The trade-off: existing borrowers during stress periods face steeper penalty rates. Governance votes on Slope 2 are directly about this trade-off between borrower cost and depositor liquidity protection.`,
          hint: `Higher Slope 2 = higher rates above kink. Higher rates → more borrower repayment. More repayment → lower utilisation → depositors can withdraw. Who benefits and who pays?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `Build a rate table for Aave V3 USDC (base 0%, U_optimal 90%, Slope 1 6%, Slope 2 60%) at five utilisation levels: 60%, 80%, 90%, 95%, 99%. For each: calculate borrow rate and supply APY (assume reserve factor 10%). Then identify: at what utilisation does the supply APY for depositors actually exceed 10% (a meaningful yield threshold)?`,
          scoringCriteria: [
            `60%: borrow (60/90)×6% = 4%, supply = 4% × 60% × 90% = 2.16%`,
            `80%: borrow (80/90)×6% = 5.33%, supply = 5.33% × 80% × 90% = 3.84%`,
            `90%: borrow = 6%, supply = 6% × 90% × 90% = 4.86%`,
            `95%: borrow = 6% + (5/10)×60% = 36%, supply = 36% × 95% × 90% = 30.78%`,
            `Identifies: 10% supply APY is reached somewhere between 91–94% utilisation (above the kink but below 95%)`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Marcus is comparing two borrowing strategies using $500K: (A) borrow USDC on Aave V3 Ethereum at current utilisation 76% (borrow rate 5.1%), deploy in a 9% real yield LP strategy. (B) borrow USDC on Compound V3 at current utilisation 69% (borrow rate 4.3%), deploy in the same 9% strategy. Calculate net yield for each. Then model: if utilisation rises to 90% on both during a market stress event, what are the new net yields? At what utilisation does each strategy become unprofitable?`,
          scoringCriteria: [
            `Current net yields: Aave 9% − 5.1% = 3.9%; Compound 9% − 4.3% = 4.7%`,
            `At 90%: Aave borrow ≈ 6%, net = 3%; Compound borrow ≈ 8.2% net = 0.8%`,
            `Break-even utilisation: Aave (9% strategy) = solve for rate = 9% → at approximately 96.5% utilisation. Compound at approximately 94.5%`,
            `Notes Compound becomes unprofitable sooner in stress scenarios due to more aggressive Slope 2`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `A borrower plans to borrow $1M USDC on Fraxlend for 3 months. Current utilisation: 88%, current borrow rate: 8.2% APY. The adaptive model increases the above-kink rate by 0.5% per day when utilisation stays above 85%. Their strategy earns 12% APY. Model: (A) what is the borrow rate on day 15 if utilisation stays at 88%? (B) on day 30? (C) at what day does the strategy break even (borrow rate = 12%)? (D) what action should the borrower take on day 1 to protect themselves?`,
          scoringCriteria: [
            `Day 15: 8.2% + (15 × 0.5%) = 15.7% APY`,
            `Day 30: 8.2% + (30 × 0.5%) = 23.2% APY`,
            `Break-even day: (12% − 8.2%) ÷ 0.5%/day = 7.6 days — strategy unprofitable by day 8 if utilisation holds`,
            `Action on day 1: set a borrow rate alert at 10% APY (first warning threshold), plan exit by day 7 if utilisation shows no sign of dropping, OR use a fixed-rate alternative from Pendle`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.12 — CROSS-CHAIN LENDING
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'cross-chain-lending',
      title: `4.12 Cross-Chain Lending — Same Protocol, Different Chain, Different Deal`,
      subtitle: `Aave is on 12 chains. The codebase is identical. The yield is not. The risk is not. Understanding what makes each deployment different is what cross-chain lending analysis is about.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.11 you studied interest rate models and how utilisation drives rates differently across protocols. This lesson applies that cross-protocol analysis across chains — the same protocol with the same rate model producing completely different yield and risk profiles depending on where it is deployed.`,

      hook: `Aave USDC on Ethereum: 3.2% APY. Aave USDC on BNB Chain: 7.8% APY. Both Aave. Both USDC. The 4.6% difference is not free money. It is compensation for real, identifiable risks. Once you can name those risks, you can decide whether the extra yield is worth them.`,

      visualPrompt: `A chain comparison matrix: rows = Ethereum, Arbitrum, Optimism, Polygon, BNB Chain, Solana. Columns = USDC supply APY, utilisation, chain security grade, oracle provider, bridge risk. Cells filled with specific data. Colour coding: green (low risk), yellow (moderate), red (elevated). Caption: "Same asset, same protocol, five different risk-yield profiles."`,

      explanation: `Let me tell you about the same bank in different cities.

Aave is on 10+ chains. But it's not identical on each chain — not in practice. Same codebase, same governance, but different utilisation, different collateral mixes, different oracle dependencies, and different chain-level risks. Cross-chain lending analysis means evaluating every dimension that changes when the protocol moves from one chain to another.

**What changes across chains:**

[Utilisation rate] — different borrowing ecosystems drive different demand. Arbitrum's active DeFi traders create higher USDC utilisation than Ethereum's more conservative institutional users. Solana's retail trading culture creates spikes during meme coin seasons.

[Collateral mix] — each chain has its own ecosystem tokens. Aave Arbitrum has ARB as collateral. Aave Avalanche has AVAX. Different chains = different collateral risk profiles.

[Oracle provider] — Aave Ethereum: Chainlink with multiple fallback feeds. Aave Solana (hypothetical): would use Pyth — a different oracle risk profile. Oracle is chain-specific.

[Chain-level risk] — sequencer risk (Arbitrum/Optimism), validator concentration (BNB Chain), outage history (Solana), bridge risk to access the chain.

[Liquidity depth] — DEX liquidity for collateral assets varies dramatically by chain. ETH/USDC DEX liquidity on Arbitrum vs Polygon vs BNB Chain: completely different numbers affecting liquidation quality.

**The cross-chain yield premium framework:**

USDC supply APY differential = chain risk premium + utilisation premium

Chain risk premium: how much extra yield is the market charging for that chain's specific risks vs Ethereum mainnet?

Utilisation premium: how much extra yield from higher USDC borrowing demand on that chain?

Both are real and separable. Arbitrum over Ethereum: mostly utilisation premium (same security model, higher active trading). BNB Chain over Ethereum: partly utilisation, partly real chain risk premium.

**The arbitrage opportunity and its limits:**

Why doesn't capital flow from 3.2% (Ethereum) to 7.8% (BNB Chain) until rates equalise?

Friction: bridge cost, bridge risk, operational complexity, mandates that restrict chain exposure. These frictions keep rate differentials persistent rather than instantly arbitraged away. For researchers: this is an opportunity, not a failure. The friction creates sustainable yield advantage for sophisticated allocators.

**Cross-chain exposure management:**

Never put more than 30–40% of lending capital on any single non-Ethereum chain. Diversify within each chain tier. Keep a "safe harbour" allocation on Ethereum mainnet regardless of yield differential.`,

      examples: [
        {
          contextTag: `[Cross-chain allocation, yield vs risk matrix]`,
          context: `Priya is building a cross-chain lending strategy for a $1M USDC allocation. She scores each chain on yield and risk.`,
          scenario: `Ethereum Aave (3.2%, A security, A oracle, A liquidity): safe anchor. Arbitrum Aave (5.4%, A security via Ethereum, A oracle, A liquidity on L2): strong risk-adjusted. Polygon Aave (4.1%, B security — PoS with fewer validators, A oracle, B liquidity): moderate. BNB Chain Aave (7.8%, C security — 21 validators, B oracle, B liquidity): risk premium real. Avalanche (4.9%, B security, A oracle, B liquidity): moderate. Allocation: $350K Ethereum (anchor), $350K Arbitrum (best risk-adjusted), $150K Polygon (diversification), $100K Avalanche (minor yield pickup), $50K BNB (small exposure for yield, limited by security concern). Blended yield: ~4.7%.`,
          outcome: `Priya's blended yield of 4.7% outperforms Ethereum-only (3.2%) by 1.5% annually — $15K/year on $1M — while keeping 70% in Ethereum-secured protocols. BNB Chain exposure capped at 5% for the yield pickup.`,
        },
        {
          contextTag: `[Arbitrum sequencer risk analysis]`,
          context: `Maya is evaluating Arbitrum-specific risks for a $500K deployment on Aave V3 Arbitrum.`,
          scenario: `Arbitrum risk unique to Aave deployment: (1) Sequencer downtime — Arbitrum uses a centralised sequencer operated by Offchain Labs. If it goes down, transactions queue but do not fail. Liquidation bots can still execute when sequencer restores. Aave V3 has a sequencer uptime feed (Chainlink) that pauses certain functions if sequencer is down. (2) L1 vs L2 oracle: Aave Arbitrum uses Chainlink feeds that update on Arbitrum L2. During sequencer issues, Chainlink updates may also be delayed. (3) Fraud proof window: in an extreme scenario, a 7-day fraud proof window applies to withdrawals from Arbitrum to Ethereum. In a protocol emergency, exiting to Ethereum mainnet takes 7 days via the native bridge.`,
          outcome: `Maya categorises Arbitrum sequencer risk as B+ (manageable, mitigated by Aave's sequencer-aware architecture and Chainlink). The 7-day withdrawal window is only relevant for emergency exits — not day-to-day operations. She proceeds with the $500K allocation.`,
        },
        {
          contextTag: `[Rate arbitrage, same borrower different chains]`,
          context: `Jake needs to borrow $100K USDC for a 3-month strategy. He compares borrowing across Aave deployments.`,
          scenario: `Aave Ethereum: 5.1% APY borrow. Aave Arbitrum: 6.8% APY borrow. Aave BNB: 4.2% APY borrow (current moment, low utilisation). Bridge cost to BNB: $10 one-way + $10 return = $20 total. Annualised bridge cost on $100K for 3 months: $20 ÷ ($100K × 3/12) = 0.08%. Net BNB borrow cost: 4.2% + 0.08% = 4.28% vs Ethereum 5.1%. Saving: 0.82% × $100K × 3/12 = $205 over 3 months. Worth bridging? Jake considers: BNB Chain risk (C security) vs $205 saving. He decides the chain risk is not worth $205 and borrows on Ethereum.`,
          outcome: `Jake borrows on Ethereum. For his $100K borrow, the $205 BNB Chain yield advantage is too small relative to introducing C-grade security chain risk. The decision changes at $1M borrow (saving = $2,050) — large enough to justify careful BNB Chain analysis.`,
        },
      ],

      keyTakeaway: `Cross-chain lending: same codebase, different yields because of utilisation differences and chain risk premiums. Yield differential = chain risk premium + utilisation premium. Identify each separately before deciding to move capital. Key chain-specific risks: sequencer centralisation (Arbitrum/Optimism), validator concentration (BNB), outage history (Solana), oracle provider differences. The friction that keeps yield differentials persistent (bridge costs, complexity, mandates) is the opportunity for sophisticated allocators. Never exceed 30–40% allocation to any single non-Ethereum chain. Keep a safe harbour allocation on Ethereum mainnet.`,

      guidedPractice: [
        {
          question: `Aave USDC on Arbitrum yields 5.4% and on BNB Chain yields 7.8%. What two components explain the 2.4% BNB premium?`,
          options: [
            `A) BNB Chain Aave has better smart contracts than Arbitrum Aave`,
            `B) Utilisation premium (higher USDC borrowing demand on BNB Chain from retail trading) and chain risk premium (21-validator centralisation, regulatory risk from Binance's legal situation)`,
            `C) BNB Chain charges lower reserve factors`,
            `D) The difference is purely random market noise`,
          ],
          correct: 1,
          explanation: `The 2.4% premium has two separable components. Utilisation: BNB Chain has more retail trading activity (Binance user base) creating higher USDC borrow demand → higher utilisation → higher rates. Chain risk: 21 validators under Binance's effective control creates regulatory and censorship risk that Arbitrum (secured by Ethereum's validator set) does not have. A sophisticated researcher separates these: how much is real utilisation demand, and how much is risk compensation?`,
          hint: `From Lab 2 (L2.9): what specific risks does BNB Chain have that Arbitrum doesn't? That is the risk premium component.`,
        },
        {
          question: `Arbitrum uses a centralised sequencer. How does Aave V3's sequencer uptime feed (from Chainlink) mitigate this risk for lenders?`,
          options: [
            `A) It eliminates sequencer risk entirely`,
            `B) The sequencer uptime feed allows Aave to detect when the sequencer is offline and pause new borrows/deposits — preventing the protocol from accepting transactions during a period when liquidations may also be delayed`,
            `C) Chainlink's feed replaces the sequencer`,
            `D) The uptime feed automatically withdraws depositor funds during downtime`,
          ],
          correct: 1,
          explanation: `When Arbitrum's sequencer goes offline, Chainlink's sequencer uptime feed reports this to Aave. Aave pauses functionality that depends on reliable price feeds and transaction ordering (new borrows). This prevents a window where prices could move significantly with no liquidations possible — protecting depositors from accumulating bad debt during downtime. The pause is precautionary, not reactive. It is one of Aave V3's specific multi-chain safety improvements.`,
          hint: `What happens during a sequencer outage? Why does Aave pausing new borrows during that window protect depositors?`,
        },
        {
          question: `You move $300K USDC from Aave Ethereum (3.2% APY) to Aave Polygon (4.6% APY). Bridge cost: $8 round trip. Planned holding: 4 months. Calculate annualised net yield and determine if the move is worth the chain risk.`,
          options: [
            `A) Net yield: 4.6% — bridge cost is negligible`,
            `B) Bridge annualised cost: $8 ÷ ($300K × 4/12) = 0.008%. Net yield: 4.6% − 0.008% = 4.59%. Worth it if Polygon B-grade security risk (vs Ethereum A) is acceptable for a 1.39% yield improvement ($4,170/year on $300K)`,
            `C) Net yield: 3.2% — must subtract Ethereum yield as opportunity cost`,
            `D) The bridge cost makes this not worth it`,
          ],
          correct: 1,
          explanation: `Bridge annualised cost: $8 / ($300K × 4/12 months) × 12 = $8 / $100K × 12 = 0.0096% ≈ 0.01%. Negligible on $300K. Net yield = 4.6% − 0.01% = 4.59%. Annual dollar advantage: $300K × (4.59% − 3.2%) = $4,170/year. The question is: is $4,170/year of additional yield worth Polygon's B-grade security exposure? For a diversified institutional portfolio that already has some Polygon exposure in its mandate: probably yes. For a risk-averse mandate that explicitly requires A-grade security: no.`,
          hint: `Bridge cost annualisation: $8 total cost ÷ (deployed capital × time fraction). The real decision is whether Polygon's B-grade security is worth $4,170/year extra.`,
        },
        {
          question: `Connecting to L4.9 (liquidation mechanics): why does deploying on a chain with thin collateral DEX liquidity amplify bad debt risk specifically for cross-chain Aave deployments?`,
          options: [
            `A) Thin DEX liquidity slows down deposit transactions`,
            `B) In a liquidation, bots sell collateral on that chain's DEX. Thin local DEX liquidity means severe slippage — the same collateral that would liquidate cleanly on Ethereum cannot be absorbed on a smaller chain without creating bad debt`,
            `C) DEX liquidity affects supply APY, not bad debt`,
            `D) Aave uses the same DEX liquidity pool across all chains`,
          ],
          correct: 1,
          explanation: `Each Aave deployment uses the DEX liquidity available on its chain. A token accepted as collateral on Aave Polygon with $5M in DEX liquidity on Polygon — but $200M on Ethereum — is far riskier on Polygon than on Ethereum. The liquidation must occur on the chain where the collateral exists. Thin local liquidity means the same collateral type that is safely liquidatable on Ethereum can create bad debt on a smaller chain. Always check local DEX liquidity, not just the global liquidity for a token.`,
          hint: `Where does a Polygon liquidation sell the collateral? Does Ethereum DEX liquidity help a Polygon liquidation?`,
        },
        {
          question: `Why do yield differentials between Ethereum and other chains persist rather than immediately arbitraging to equalisation?`,
          options: [
            `A) Smart contracts prevent capital from moving across chains`,
            `B) Multiple frictions prevent immediate equalisation: bridge costs, bridge security risk, operational complexity, and institutional mandates that restrict chain exposure — these frictions are real costs that keep differentials sustainable for sophisticated allocators`,
            `C) Capital always equalises instantly — any differential is measurement error`,
            `D) Only Aave can move capital cross-chain`,
          ],
          correct: 1,
          explanation: `In an efficient market without friction, capital would instantly arbitrage the yield differential to zero. DeFi cross-chain markets are not frictionless: bridge costs (real dollar cost), bridge risk (exploit risk, delay risk), operational complexity (new wallets, gas tokens), and institutional mandates (many funds cannot hold assets on BNB Chain). These frictions mean a 4.6% yield on Polygon vs 3.2% on Ethereum can persist for weeks or months — creating a genuine opportunity for allocators who can absorb the friction cheaply.`,
          hint: `What stops a retail investor immediately moving capital from 3.2% to 7.8% to capture the spread? Each barrier is a friction that sustains the differential.`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-capital-flows`,
          scenario: `Build a cross-chain Aave lending allocation for a $2M USDC position. Available chains: Ethereum (3.2%, A), Arbitrum (5.4%, A), Base (4.8%, A), Polygon (4.1%, B), BNB (7.8%, C), Avalanche (4.9%, B). Constraints: minimum 25% on Ethereum, maximum 15% on any C-grade chain, maximum 35% on any single chain. Maximise blended APY within constraints. Show final allocation table and blended APY calculation.`,
          scoringCriteria: [
            `Allocates minimum $500K (25%) to Ethereum`,
            `BNB Chain capped at $300K (15%) as C-grade`,
            `No single chain exceeds $700K (35%)`,
            `Blended APY calculated correctly across the allocation`,
            `Allocation is optimal given constraints (e.g. maximises Arbitrum before other B-grade chains)`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `A new fund wants to deploy $5M across Aave deployments but their mandate prohibits any chain with (A) fewer than 100 validators, (B) any historical network outage exceeding 1 hour, (C) a non-Ethereum-equivalent security model. Identify which Aave chains pass the mandate using Lab 2 knowledge. Design the allocation across only the qualifying chains to maximise yield. State the blended APY vs a pure Ethereum allocation.`,
          scoringCriteria: [
            `Correctly disqualifies BNB Chain (21 validators), Solana (multiple outages), and potentially Polygon (PoS with fewer validators) based on mandate criteria`,
            `Qualifies Ethereum, Arbitrum, Optimism, Base as Ethereum-secured rollups that inherit the validator set`,
            `Allocates to maximise yield among qualifying chains`,
            `States blended APY and dollar advantage over pure Ethereum`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Using DeFiLlama's lending markets page, pull the current USDC supply APY for Aave V3 across five different chains. Build the cross-chain comparison table: chain, APY, utilisation rate, chain security grade (from Lab 2). Identify: (A) which chain has the highest capital efficiency (utilisation ÷ APY), (B) which chain offers the best risk-adjusted yield, (C) one chain where the APY seems unusually high relative to its security grade — explain the likely cause.`,
          scoringCriteria: [
            `Table contains five real chains with real APY and utilisation from DeFiLlama`,
            `Correctly calculates capital efficiency ratio for each`,
            `Best risk-adjusted yield identification references both security grade and APY`,
            `Unusual APY explanation cites either specific market events or structural BNB/Polygon premium with reasoning`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.13 — PRACTICE: LENDING COMPARISON
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'practice-lending-comparison',
      title: `4.13 Practice — Aave on Two Chains: A Full Comparison`,
      subtitle: `Same protocol. Two chains. Apply everything from Lab 5 to produce the comparison brief Marcus asked for.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 5 has covered lending basics, every major protocol, metrics, liquidations, bad debt, rate models, and cross-chain analysis. This practice lesson puts it all together: a structured comparison of Aave across two specific chains that exercises every analytical framework in the lab.`,

      hook: `"Compare Aave on Ethereum Mainnet and Polygon. Give me the full picture — yield, risk, mechanics, and your recommendation for our $500K USDC allocation." That is Marcus's exact request. You have everything you need. This lesson is the practice run.`,

      visualPrompt: `A two-column comparison brief: Aave Ethereum on the left, Aave Polygon on the right. Rows: TVL, utilisation, supply APY, borrow APY, reserve factor, bad debt risk, oracle, chain security, liquidation quality. Green cells where Ethereum wins, yellow where comparable, orange where Polygon wins. Bottom row: allocation recommendation. Caption: "The comparison brief. Every row is a lesson. The recommendation is the synthesis."`,

      explanation: `Now it's your turn to compare.

Take Aave on two different chains: Ethereum Mainnet and Polygon. Use every framework from Lab 5. The brief has a specific structure:

**Step 1: Six-metric scorecard for each (L4.8)**
Build the table. TVL, utilisation, borrow rate, supply APY, reserve factor, bad debt/treasury ratio.

**Step 2: Interest rate model behaviour (L4.11)**
At what utilisation does each deployment reach a 10% supply APY? What is the worst-case borrow rate at 95% utilisation?

**Step 3: Liquidation quality assessment (L4.9, L4.10)**
What are the major collateral assets? What is the DEX liquidity ratio for the largest collateral on each chain? What oracle does each use?

**Step 4: Chain-specific risk (Lab 2, L4.12)**
What are the chain-level risks that differ between Ethereum and Polygon? How do they affect the lending position specifically?

**Step 5: Recommendation**
For a $500K USDC supply, split or concentrate? Justify using at least four specific metric differences from the comparison.

**The output format (what Marcus expects):**

A comparison table (all six metrics), a risk delta (what risks Polygon adds vs Ethereum), a rate model note (worst-case rate on each), and a one-paragraph allocation recommendation with specific numbers.`,

      examples: [
        {
          contextTag: `[Research analyst, comparison brief draft]`,
          context: `Maya runs the full comparison as requested. She starts with DeFiLlama, supplements with Gauntlet's risk report, and finishes with a recommendation.`,
          scenario: `DeFiLlama pull: Aave Ethereum USDC — TVL $4.2B, utilisation 73%, supply APY 3.4%, borrow rate 4.6%, reserve factor 10%. Aave Polygon USDC — TVL $280M, utilisation 69%, supply APY 3.1%, borrow rate 4.0%, reserve factor 10%. Risk delta: Polygon adds PoS chain risk (fewer validators, Heimdall/Bor architecture vs Ethereum), lower DEX liquidity for MATIC collateral ($40M Polygon MATIC liquidity vs $2B+ ETH liquidity on Ethereum). Oracle: both Chainlink. Rate model worst case: both similar (same Aave V3 parameters). Treasury: Aave treasury covers both. Bad debt: Polygon has had one small bad debt event ($50K) vs Aave Ethereum's $1.6M.`,
          outcome: `Maya's recommendation: $400K Ethereum (security anchor, 3.4% real yield), $100K Polygon (slightly lower yield but provides chain diversification with minimal risk uplift for this allocation size). Blended: 3.35%. The $100K Polygon allocation is largely symbolic diversification — the yield advantage is only $300/year but demonstrates the team's ability to manage cross-chain positions.`,
        },
        {
          contextTag: `[Challenging the comparison with a bull case for Polygon]`,
          context: `Jake disagrees with Maya's recommendation and makes the case for 50/50 allocation.`,
          scenario: `Jake's argument: (1) Polygon is Ethereum-validated (the bridge checkpoints to Ethereum every 30 minutes). (2) Chainlink oracles are shared. (3) Aave V3 Polygon has the same codebase and parameters as Ethereum. (4) The $280M TVL on Polygon is adequate for a $100K withdrawal. (5) The risk delta between Ethereum and Polygon Aave is lower than the risk delta between, say, Aave and any new protocol. For $500K, Polygon adds minimal incremental risk while maintaining protocol familiarity (same Aave UI, same audits).`,
          outcome: `Priya weighs both cases. She agrees that Polygon's risk uplift is modest. She splits 60/40 rather than 80/20, increasing Polygon allocation to $200K. The team documents both analyses — the difference in recommendation came from different weightings of chain risk, not factual disagreement about the data.`,
        },
        {
          contextTag: `[Rate stress test, the critical scenario]`,
          context: `Sarah asks: "What if USDC borrow demand spikes on Polygon due to a Polygon DeFi summer event? How does the rate behave vs Ethereum?"`,
          scenario: `Scenario: Polygon launches a large native DeFi incentive programme. USDC borrowing demand on Polygon spikes. Utilisation: 68% → 94% over 2 weeks. Aave V3 Polygon USDC rate at 94% utilisation (same parameters as Ethereum): 6% + (4% ÷ 10%) × 60% = 30% APY borrow, ~24% APY supply. Compared to Ethereum: if Polygon spikes to 94% while Ethereum stays at 73%, Polygon supply APY temporarily blows past Ethereum. This is the bull case for Polygon: during a chain-specific activity surge, cross-chain yield differentials temporarily widen dramatically.`,
          outcome: `Sarah uses this insight to justify a small tactical allocation to Polygon: position for potential yield spikes when Polygon ecosystem activity picks up. Timing entry before activity surges — monitor Polygon transaction counts and native protocol TVL growth as leading indicators.`,
        },
      ],

      keyTakeaway: `The lending comparison brief has a fixed structure: six-metric scorecard, rate model worst-case, liquidation quality assessment, chain-specific risk delta, recommendation with explicit allocation and reasoning. Aave Ethereum vs Polygon: Ethereum wins on security, TVL depth, and historical track record. Polygon offers minor yield pickup with modest incremental risk (Ethereum-checkpointed PoS, shared Chainlink oracles, same Aave V3 code). For large allocations (>$5M): Ethereum anchor with limited Polygon exposure. For smaller allocations ($500K): the risk delta is small enough that a 20–30% Polygon allocation is defensible if yield justifies it.`,

      guidedPractice: [
        {
          question: `You have Aave Ethereum (3.4% APY, $4.2B TVL) and Aave Polygon (3.1% APY, $280M TVL). Which has higher capital efficiency (supply APY per dollar of TVL) and what does that indicate?`,
          options: [
            `A) Ethereum — larger TVL means more capital working`,
            `B) Polygon has slightly lower APY but much lower TVL — but APY is the output of utilisation and rate model, not TVL. Capital efficiency (utilisation) should be compared directly: if Polygon has similar utilisation, it is roughly equally capital efficient per dollar deployed`,
            `C) Capital efficiency is APY ÷ TVL — Polygon wins ($3.1% ÷ $280M >> 3.4% ÷ $4.2B)`,
            `D) Capital efficiency only matters for DEXes, not lending protocols`,
          ],
          correct: 1,
          explanation: `For lending protocols, capital efficiency = utilisation rate (how much of deposited capital is actively lent). APY ÷ TVL is not a meaningful ratio — it conflates yield with absolute pool size. If both Ethereum and Polygon show ~70–75% utilisation, they are equally capital efficient per dollar despite the TVL difference. The TVL difference means Ethereum can handle larger individual positions without slippage or withdrawal risk — that is depth, not efficiency.`,
          hint: `From L4.8: what is the correct lending protocol capital efficiency metric? Is it related to TVL or to something else?`,
        },
        {
          question: `Polygon's PoS chain checkpoints to Ethereum every 30 minutes. How does this specifically affect Aave Polygon depositors?`,
          options: [
            `A) Deposits are frozen for 30 minutes after each checkpoint`,
            `B) In an extreme Polygon failure scenario, the last valid state is checkpointed to Ethereum — providing some security backstop. However, transactions within the 30-minute window between checkpoints are at Polygon's own security level, not Ethereum's.`,
            `C) Checkpointing makes Polygon identical in security to Ethereum`,
            `D) The 30-minute checkpoint creates withdrawal delays for Aave deposits`,
          ],
          correct: 1,
          explanation: `Polygon's checkpointing to Ethereum means the chain's history is periodically anchored to Ethereum's security. But transactions between checkpoints are secured only by Polygon's own validator set (~100 validators vs Ethereum's 500,000+). This window creates a security gap. For Aave depositors: the risk materialises if a validator attack occurs between checkpoints and creates fraudulent transactions. In practice this is low probability but it is the genuine security delta between Aave Polygon and Aave Ethereum.`,
          hint: `What does "checkpointing to Ethereum" mean for the blocks between checkpoints? Who secures those?`,
        },
        {
          question: `The worst-case borrow rate on both Aave Ethereum and Aave Polygon (both V3, same parameters) at 99% utilisation is approximately 60% APY. What does this mean for a depositor who has their $300K USDC deployed?`,
          options: [
            `A) The depositor earns 60% APY when utilisation reaches 99%`,
            `B) Supply APY at 99% utilisation = borrow rate × utilisation × (1 − reserve factor) = 60% × 99% × 90% ≈ 53.5%. The depositor benefits from high utilisation — this is a supply APY spike that rewards staying deployed during market stress`,
            `C) The depositor must pay 60% APY`,
            `D) High utilisation creates bad debt that reduces depositor returns`,
          ],
          correct: 1,
          explanation: `High utilisation benefits depositors (higher supply APY) while penalising borrowers (higher borrow APY). At 99% utilisation: supply APY = 60% × 99% × 90% ≈ 53.5%. A depositor earning 53.5% on $300K earns $160K/year — exceptional. The corresponding risk: withdrawal illiquidity (only 1% of pool freely withdrawable). If the depositor needs to exit quickly during high utilisation, they cannot. This is the supply APY vs withdrawal liquidity trade-off that every depositor must understand before committing.`,
          hint: `Depositors earn supply APY, which = borrow rate × utilisation × (1 − reserve factor). At 99% utilisation, what does the depositor earn?`,
        },
        {
          question: `Connecting to L4.10 (bad debt risk): Aave Polygon's largest collateral is MATIC (now POL). Polygon's DEX liquidity for MATIC is $120M across all venues. Aave Polygon has $80M in MATIC collateral. What is the DEX liquidity ratio and what does it imply?`,
          options: [
            `A) Ratio = 0.67 — dangerous`,
            `B) Ratio = DEX liquidity ÷ protocol exposure = $120M ÷ $80M = 1.5× — the DEX has 1.5× more liquidity than the protocol's collateral exposure. Liquidations can absorb without catastrophic slippage`,
            `C) Ratio = $80M ÷ $120M = 0.67 — insufficient`,
            `D) The ratio does not apply to native chain tokens`,
          ],
          correct: 1,
          explanation: `DEX liquidity ratio = DEX liquidity ÷ protocol exposure. $120M ÷ $80M = 1.5×. Interpretation: for every dollar of MATIC collateral in Aave Polygon, there is $1.50 of DEX liquidity available. Liquidations can be executed without causing extreme price impact — the DEX is deeper than the collateral pool. This is a healthy ratio (above 1×). Compare to the Venus XVS event (from L4.10) where DEX liquidity was much thinner than protocol exposure. Aave Polygon's MATIC collateral passes this specific risk check.`,
          hint: `The ratio measures how much DEX liquidity exists relative to what needs to be liquidated. $120M DEX ÷ $80M collateral = ?`,
        },
        {
          question: `For a $500K USDC supply allocation, what specific numbers make Aave Ethereum the safer choice vs Aave Polygon, even if Polygon offered 0.5% higher APY?`,
          options: [
            `A) Ethereum is always safer regardless of any numbers`,
            `B) Three specific numbers: Ethereum $4.2B TVL (vs $280M Polygon — $500K is 0.012% of Ethereum vs 0.18% of Polygon, meaning withdrawal risk is dramatically lower), Ethereum 500K+ validators (vs ~100 Polygon), and Aave Ethereum's $300M+ treasury vs Polygon's shared but smaller buffer`,
            `C) The 0.5% APY difference is the only relevant number`,
            `D) Smart contract risk is the only differentiating factor`,
          ],
          correct: 1,
          explanation: `Three numbers support Ethereum over Polygon for $500K: (1) TVL depth — $500K is 0.18% of $280M Polygon TVL. At 80% utilisation, only $56M is freely withdrawable. $500K is 0.89% of available liquidity — fine normally but concentrates withdrawal risk. On Ethereum: $500K is 0.012% — negligible. (2) Validator count — 500K+ vs ~100 on Polygon PoS. (3) Treasury coverage — Aave's global treasury provides backstop, but the relative depth of DEX liquidity for collateral assets on Ethereum is dramatically better. For $500K, these are manageable differences but they are real and specific.`,
          hint: `What percentage of each chain's free withdrawal liquidity does $500K represent? What does that mean if multiple depositors want to exit simultaneously?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-data-interpret`,
          scenario: `Produce the full Aave Ethereum vs Polygon USDC comparison brief using current DeFiLlama data. Required components: (A) six-metric scorecard table for both, (B) interest rate model worst-case borrow rate at 95% utilisation for both, (C) largest collateral asset DEX liquidity ratio for each chain, (D) chain security delta in two sentences, (E) $500K allocation recommendation with explicit percentage split and annual dollar yield for each portion.`,
          scoringCriteria: [
            `Scorecard table contains real current numbers from DeFiLlama for all six metrics on both chains`,
            `Worst-case rate at 95% utilisation calculated using the Aave V3 formula (not estimated)`,
            `DEX liquidity ratio for at least one major collateral asset stated with source`,
            `Allocation recommendation states a specific split (e.g. $350K/$150K) with annual dollar yield calculated`,
          ],
        },
        {
          type: `judgment-yield-calc`,
          scenario: `Sarah is deciding between a $1M USDC 12-month deployment: 100% Aave Ethereum (3.4% = $34,000/year) vs a split: 60% Aave Ethereum ($600K × 3.4% = $20,400) + 40% Aave Polygon ($400K × 4.1% = $16,400) = $36,800/year. Annual advantage of the split: $2,800. Calculate: (A) how many "standard deviations" of Polygon-specific bad debt risk (assume $100K expected annual bad debt on Polygon Aave) the split exposes the $400K Polygon allocation to. (B) Is $2,800 extra yield adequate compensation for taking on that risk? (C) What is the break-even bad debt probability that makes the two options equivalent in expected value?`,
          scoringCriteria: [
            `Notes $400K Polygon exposure vs $100K expected Polygon bad debt — the $400K is 4× the expected bad debt level, meaning there is some probability of loss`,
            `Correctly states break-even: if probability of Polygon bad debt event affecting this position × expected loss = $2,800/year, the options are equivalent`,
            `Calculates: if probability of 10% loss on $400K = 0.07% chance per year, expected loss = $400K × 10% × 0.07% = $28, much less than $2,800 gain — split is worth it`,
            `Gives a defensible recommendation based on their probability assessment`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting across all of Lab 5: a new DeFi fund has $3M USDC to deploy in lending protocols. They want maximum real yield with a maximum governance risk grade of B. Build the complete allocation: (1) identify all lending protocols from Lab 5 that pass the governance risk B filter, (2) build a maximum yield allocation within those protocols, (3) show the allocation table with protocol, chain, APY, and dollar amount, (4) calculate blended APY. Exclude any C or D governance risk protocols.`,
          scoringCriteria: [
            `Correctly excludes Solend (governance risk C from the 2022 crisis)`,
            `Includes Aave, Compound V3, Morpho Blue/Optimizer, Spark (with governance risk note), Fraxlend (noting D3M dependency)`,
            `Allocation table with real current APY data for each protocol/chain`,
            `Blended APY calculated correctly across the $3M allocation`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.14 — LENDING RISK DASHBOARD (LAB 5 CAPSTONE)
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'lending-risk-dashboard',
      title: `4.14 Lending Risk Dashboard — Build the Monitor That Protects Your Capital`,
      subtitle: `The Lab 5 capstone. One dashboard, all the signals. This is what professional DeFi lending risk management looks like.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 5 has covered every major lending protocol, the metrics scorecard, liquidation mechanics, bad debt risk, interest rate models, and cross-chain analysis. This capstone lesson builds the continuous monitoring framework that synthesises everything — the dashboard a researcher runs weekly to protect any capital deployed in lending protocols.`,

      hook: `Anchor Protocol was showing warning signs 3 months before it collapsed: utilisation was fake (subsidised), reserve ratio was declining, borrowing demand was zero. A researcher with a proper dashboard would have seen every signal. They just needed to be looking. This lesson builds the dashboard.`,

      visualPrompt: `A monitoring dashboard with six panels: (1) Utilisation rate tracker — all deployed protocols, weekly trend. (2) Health factor distribution — histogram of all positions in the pool. (3) Bad debt event log — all bad debt events industry-wide (Rekt.news feed). (4) Treasury balance — protocol treasury over time. (5) Rate curve position — where current utilisation sits on the kink model (visualised). (6) Oracle freshness — last update time for each oracle in use. Caption: "Six panels. One weekly review. Full visibility on your lending capital."`,

      explanation: `Now for the final challenge.

Create a dashboard that monitors lending protocols for signs of risk — before they materialise. A professional DeFi lending desk reviews these six panels every week. Each panel maps to a specific risk category from Lab 5.

**Panel 1: Utilisation Rate Tracker**

Monitor: utilisation rate trend for every protocol/chain you are deployed on.
Why: utilisation is the primary early warning for rate spikes and withdrawal illiquidity. Trend above 85%: review position. Trend above 90%: active management required.
Source: DeFiLlama Markets, updated daily.
Alert threshold: utilisation crosses 85% (yellow), 92% (red).

**Panel 2: Health Factor Distribution**

Monitor: the histogram of all active borrowing positions in your deployed pool.
Why: a cluster of positions with health factors between 1.0–1.2 signals mass liquidation risk — a 10% collateral price drop could trigger a cascade.
Source: Gauntlet risk reports, Chaos Labs, or direct on-chain queries.
Alert threshold: >20% of debt has health factor below 1.3.

**Panel 3: Bad Debt Event Log**

Monitor: all bad debt events across DeFi lending — not just your protocols.
Why: bad debt events in similar protocols reveal systemic vulnerabilities (oracle type, collateral class, utilisation level) that may also exist in your deployments.
Source: Rekt.news, Chaos Labs incident tracker.
Alert threshold: any bad debt event above $1M in a protocol that shares collateral type or oracle with your deployments.

**Panel 4: Treasury Balance Trend**

Monitor: your deployed protocols' treasury balances over time.
Why: declining treasury trend (fees not keeping up with bad debt events, large governance spending) reduces the safety buffer. An $80M treasury declining to $20M over 6 months is a warning sign.
Source: protocol governance forums, Token Terminal.
Alert threshold: treasury decline of >25% quarter-over-quarter.

**Panel 5: Rate Curve Position**

Monitor: where current utilisation sits relative to the kink on the rate model.
Why: understanding how close you are to the steep part of the curve tells you the rate spike risk. "3% from the kink" is immediate risk. "15% from the kink" is comfortable buffer.
Source: Calculate from current utilisation and protocol rate model parameters.
Alert threshold: within 5% utilisation of the kink point.

**Panel 6: Oracle Freshness**

Monitor: last update time for each oracle feed in your deployed protocols.
Why: stale oracle = undetected liquidation risk. If the oracle hasn't updated in 2 hours for a volatile asset, bad debt could be accumulating silently.
Source: Chainlink oracle explorer, Pyth Network dashboard.
Alert threshold: oracle last updated >30 minutes for volatile assets.`,

      examples: [
        {
          contextTag: `[Weekly dashboard review, action protocol]`,
          context: `Maya runs her weekly lending risk dashboard on Monday morning. She has $400K deployed across Aave Ethereum, Aave Arbitrum, and Morpho Blue.`,
          scenario: `Panel 1 (Utilisation): Aave Arbitrum USDC trending from 72% to 84% over 3 weeks. Yellow alert triggered. Panel 2 (Health factors): Aave Arbitrum — 24% of debt in positions with HF 1.1-1.3. Elevated. Panels 3-6: all clear. Maya's action protocol: (1) Review what is driving Arbitrum utilisation increase (check new protocols borrowing USDC for farming). (2) Model borrow rate at 88% (approaching kink) — estimated 8.2%. Check if Morpho-matched rate still better. (3) Decide whether to partially reduce Arbitrum exposure or maintain given Morpho's "at least Aave rates" floor.`,
          outcome: `Maya reduces Aave Arbitrum direct exposure by $50K (moves to Morpho Optimizer Arbitrum for the same exposure with guaranteed floor protection). Monitors for 2 more weeks. Utilisation stabilises at 86%. No cascade. Action was precautionary but appropriate for the signal.`,
        },
        {
          contextTag: `[Bad debt event response, cross-protocol signal]`,
          context: `Rekt.news reports a $2M bad debt event on Protocol Z (a smaller Ethereum lending protocol). The cause: wstETH collateral, thin DEX liquidity, oracle lagged 45 minutes.`,
          scenario: `Maya's cross-protocol signal analysis: Protocol Z used wstETH collateral with a single-source oracle. Her deployments: Aave V3 Ethereum accepts wstETH as collateral (25% of ETH Aave deposits). Check Aave's wstETH oracle: Chainlink with heartbeat 1 hour and deviation threshold 0.5%. Check Aave wstETH DEX liquidity ratio: $3B wstETH in Aave vs $2B Curve stETH/ETH pool liquidity = 1.5× ratio. Different from Protocol Z's setup (thin liquidity). Conclusion: Aave's wstETH exposure is lower risk than Protocol Z's due to multi-feed oracle and adequate DEX liquidity. No action required on Aave position.`,
          outcome: `Maya documents the cross-protocol signal analysis in the research log. The exercise confirms Aave's superior oracle and liquidation infrastructure. She uses the finding to upgrade her "oracle quality" score for Aave from A to A+ in the research database.`,
        },
        {
          contextTag: `[Full dashboard year-end review]`,
          context: `Priya reviews 12 months of dashboard data for the team's annual lending portfolio review.`,
          scenario: `Full year review: 52 weekly dashboard reviews completed. Yellow alerts: 8 (all resolved without incident — appropriate caution). Red alerts: 1 (Aave Arbitrum utilisation hit 94% during a memecoin season in Q2 — team reduced exposure, borrow rates spiked to 35% briefly, position reduction was correct). Treasury trends: stable across all deployed protocols. Bad debt events monitored: 3 industry-wide (none affecting team's protocols). Oracle incidents: 0 affecting team's positions. Bad debt absorbed by team's positions: $0. Capital deployed over the year: $1.2M average. Yield earned: $1.2M × 4.6% = $55.2K. Risk management cost: 2 hours per week × 52 weeks = 104 hours. Yield per research hour: $530/hour.`,
          outcome: `Priya presents the metrics to the fund. $55K earned, zero losses, one active risk mitigation (the Q2 utilisation spike response). The dashboard made the one mitigation action possible — without it, the team would have held through the 35% borrow rate spike and potentially missed the warning that utilisation was about to spike further.`,
        },
      ],

      keyTakeaway: `A lending risk dashboard has six weekly monitoring panels: utilisation trend (alert >85%), health factor distribution (alert >20% of debt at HF below 1.3), bad debt event log (cross-protocol signals), treasury balance trend (alert >25% QoQ decline), rate curve position (alert within 5% of kink), oracle freshness (alert >30 min stale for volatile assets). Weekly review takes 1–2 hours. Sources: DeFiLlama, Gauntlet, Chaos Labs, Rekt.news, Chainlink oracle explorer. The dashboard converts passive yield farming into active risk management — the difference between being surprised by a bad debt event and seeing it coming two weeks early.`,

      guidedPractice: [
        {
          question: `Your utilisation tracker shows Aave V3 USDC on Arbitrum has risen from 72% to 87% over 3 weeks. What specific actions should you take and in what order?`,
          options: [
            `A) Immediately withdraw all capital`,
            `B) (1) Calculate current borrow rate at 87% (entering above-kink territory). (2) Model rate at 90% and 95% to understand worst-case impact. (3) Check what is driving the utilisation increase. (4) Decide: if strategy still profitable at 90%+ rate, hold. If not, reduce exposure before the kink is crossed.`,
            `C) Do nothing — 87% is still below 100%`,
            `D) Switch to a higher-yield protocol immediately`,
          ],
          correct: 1,
          explanation: `87% is 3% below the typical 90% kink on Aave V3 USDC. The kink is close. Required analysis: (1) What is the current borrow rate at 87% (approximately 5.2% for Aave V3 USDC at that utilisation)? (2) What is it at 90% (the kink — approximately 6%)? At 95% (approximately 36%)? (3) Why is utilisation rising — new protocol borrowing USDC for farming (temporary) or structural demand increase (persistent)? (4) Decision: if crossing the kink creates unsustainable borrow rates for existing strategies, reduce exposure proactively. If borrowing is temporary, the spike may resolve itself.`,
          hint: `87% is near but not at the kink. What is the rate RIGHT NOW, and what would it be at the kink? That is the risk you are measuring.`,
        },
        {
          question: `Gauntlet's risk report shows 28% of USDC debt on a lending protocol has a health factor between 1.0–1.2. Why is this a significant risk signal?`,
          options: [
            `A) 28% is a normal distribution — no concern`,
            `B) Health factors of 1.0–1.2 mean a 17–20% collateral price drop triggers mass liquidation — 28% of protocol debt could simultaneously seek liquidation, creating cascade risk and potential bad debt if DEX liquidity is insufficient`,
            `C) Health factors only matter for individual borrowers, not the protocol`,
            `D) The signal is significant only if health factors are below 1.0`,
          ],
          correct: 1,
          explanation: `Health factor 1.1: a 10% collateral price drop brings it to ~1.0 (liquidation threshold). Health factor 1.2: a 17% drop triggers liquidation. With 28% of debt in this zone: a 10–17% collateral price decline — completely normal in a volatile crypto market — would trigger simultaneous liquidation attempts on 28% of the protocol's entire debt book. At scale, this creates the cascade scenario from L4.9: liquidations selling collateral → price drops → more liquidations → cascade. The 20% threshold is a research rule of thumb: above it, the cascade risk is material.`,
          hint: `If 28% of debt has HF between 1.0–1.2, what price move triggers all those liquidations simultaneously? Is that move unusual in crypto?`,
        },
        {
          question: `A bad debt event occurs on Protocol Z involving stETH collateral and a 45-minute TWAP oracle. Your capital is deployed on Aave which also accepts stETH. Should you act immediately?`,
          options: [
            `A) Yes — withdraw all stETH-collateral-backed lending immediately`,
            `B) Run the cross-protocol signal analysis: check Aave's stETH oracle type and heartbeat, check Aave's stETH DEX liquidity ratio. If Aave's setup differs materially from Protocol Z's (multi-feed Chainlink vs single TWAP, better DEX liquidity), the event is a signal to verify but not an immediate exit trigger`,
            `C) No — bad debt events are always isolated to the affected protocol`,
            `D) Withdraw only the stETH-backed portion of your deposit`,
          ],
          correct: 1,
          explanation: `Bad debt events are cross-protocol signals, not isolated facts. The question: does Protocol Z's failure mode also exist in your protocol? Check: (1) Does Aave also use a TWAP oracle for stETH? (No — Aave uses Chainlink with faster heartbeat). (2) Is Aave's stETH DEX liquidity ratio similarly thin? (Likely better — Aave's supply caps and larger market). If the root cause (slow oracle + thin liquidity) is absent in your deployment: the event is a verification trigger, not an exit trigger. If the root cause exists: action required.`,
          hint: `The key question is: does my protocol share the same vulnerability that caused Protocol Z's bad debt? Check the oracle type and DEX liquidity ratio — not just the protocol name.`,
        },
        {
          question: `You are 4% away from the kink on Aave V3 USDC (Arbitrum, current utilisation 86%, kink at 90%). What specific number tells you whether to act now or monitor for another week?`,
          options: [
            `A) The absolute TVL of the pool`,
            `B) The weekly utilisation trend (rate of change). If utilisation has risen 1% per week, you have 4 weeks before hitting the kink. If it has risen 4% per week, you have 1 week. The rate of change determines urgency — not the current level alone.`,
            `C) The borrow APY at the kink`,
            `D) How long you have been deployed in the pool`,
          ],
          correct: 1,
          explanation: `"4% away from the kink" tells you the distance but not the velocity. Velocity determines urgency: +1%/week = 4 weeks of buffer (monitor weekly). +4%/week = 1 week (review immediately). +0.5%/week = 8 weeks (comfortable). The rate of change calculation: compare this week's utilisation to last week's and project forward. If you cannot hold your breath long enough to reach the kink: act now. If you have multiple weeks: use that time for a more informed decision.`,
          hint: `Distance to risk = 4%. Speed toward risk = weekly change. Time available = distance ÷ speed.`,
        },
        {
          question: `Connecting to L4.5 (Spark): your Spark sDAI dashboard shows the DSR has been unchanged for 4 months but MakerDAO governance has a proposal to cut it from 5% to 3%. What specific dashboard panel detects this risk and what action should you take?`,
          options: [
            `A) The utilisation tracker — DSR changes affect utilisation`,
            `B) The treasury balance trend panel (governance proposals affect protocol economics) and direct monitoring of Maker governance forums. Action: model impact of 3% DSR on your position's yield and decide whether to exit before the vote passes`,
            `C) The oracle freshness panel`,
            `D) The health factor distribution panel`,
          ],
          correct: 1,
          explanation: `Spark sDAI's risk is governance-driven (from L4.5) — not utilisation, liquidation, or oracle driven. The dashboard panel that captures this: treasury/governance monitoring plus direct governance forum tracking. Maker governance proposals are posted on forum.makerdao.com 5–14 days before a vote. A researcher monitoring Maker governance has time to model impact (3% DSR = $30K/year less on $1M sDAI vs $50K at 5%) and exit the position before the vote passes if the yield reduction makes the position unattractive.`,
          hint: `Which risk category from L1.11 applies to sDAI? Which dashboard panel monitors that risk category?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-integration`,
          scenario: `Build your personal lending risk dashboard for a $500K USDC allocation: $200K Aave V3 Arbitrum, $150K Morpho Blue (Ethereum), $100K Spark sDAI, $50K Aave V3 Polygon. For each position, specify: the one monitoring panel most critical for that specific position, the alert threshold, the data source, and the action triggered. Then estimate total weekly monitoring time.`,
          scoringCriteria: [
            `Aave Arbitrum: utilisation tracker (alert 85%+), DeFiLlama, action = rate model review at 88%+`,
            `Morpho Blue: utilisation + MetaMorpho curator health (Morpho docs), alert if curator changes market inclusion`,
            `Spark sDAI: governance forum monitoring (Maker forum), alert = any DSR proposal, action = model impact before vote`,
            `Aave Polygon: health factor distribution (Gauntlet/Chaos Labs), alert >20% debt below HF 1.3`,
            `Reasonable time estimate: 45–90 minutes per week for four positions`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `It is Monday morning. Your dashboard shows: (1) Aave Arbitrum utilisation: 91% (up from 82% last week). (2) Gauntlet report: 31% of Arbitrum USDC debt has HF 1.1–1.3 due to ETH collateral positions. (3) Rekt.news: no events this week. (4) Oracle freshness: all fresh. (5) Treasury: stable. You have $300K in Aave Arbitrum USDC supply. Three signals are elevated simultaneously. Write your action plan with specific decisions, timing, and reasoning.`,
          scoringCriteria: [
            `Identifies that 91% utilisation + 31% debt in low HF zone creates a cascade risk scenario`,
            `Calculates current supply APY at 91% utilisation: approximately 21-25% — attractive but risky`,
            `Action plan: immediate partial withdrawal of $100–150K to reduce exposure while supply APY is high (liquidity still available at 91%), monitor remaining position hourly rather than weekly during the elevated period`,
            `States specific exit trigger for remaining position: withdraw if utilisation crosses 94% or if a large liquidation event begins`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Using Gauntlet's public risk reports and DeFiLlama's lending data, produce a one-page lending risk assessment for Aave V3 across any two chains of your choice. Include: current scorecard metrics for both, one active risk flagged by Gauntlet, the current position on the rate curve for each, and a 30-day monitoring plan with three specific alerts and the action each would trigger.`,
          scoringCriteria: [
            `Scorecard completed with real data from DeFiLlama for both chosen chains`,
            `References a real, current Gauntlet finding (not invented) with the specific concern named`,
            `Rate curve position stated (e.g. "18% below kink at current utilisation")`,
            `Three alerts are specific, measurable conditions (not vague "if market changes") with named data sources and clear action responses`,
          ],
        },
      ],
    },
