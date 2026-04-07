// ============================================================================
// DeFi RESEARCH CURRICULUM — SECTION 3: DEEP DIVE — DEXes (Part A)
// Lessons: dex-types → balancer-weighted-pools
// ============================================================================

export const deepDiveDexesPartA = {
  id: 'deep-dive-dexes-a',
  lessons: [

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3.1 — DEX TYPES
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'dex-types',
      title: `3.1 DEX Types — Three Ways to Build a Market`,
      subtitle: `AMM, order book, or intent-based. Each solves the liquidity problem differently. Each creates different winners and losers.`,
      difficulty: 'intermediate',
      previousLessonRef: `In Section 1 you learned AMMs at a high level (L1.7) and in Section 2 you saw them deployed across chains. This section goes deep: the mechanics, trade-offs, and research implications of every DEX design. Start here.`,

      hook: `Every DEX design answers the same question: "How do you match a buyer with a seller without a central authority?" Three fundamentally different answers exist — and choosing the wrong one for your use case costs you real money.`,

      visualPrompt: `Three columns: left (AMM — two token pools with formula, automated, always available), center (Order Book — bids and asks stacked, price discovery), right (Intent / RFQ — user states desired outcome, solvers compete). Each column has a "best for" label. Caption: "Three architectures. Three different trade-offs between capital efficiency, price discovery, and execution quality."`,

      explanation: `Let me tell you about the three ways to build a [DEX].

Imagine you want to buy apples. Three different market designs could serve you:

1. A machine that always has apples and prices them by a formula (AMM)
2. A bulletin board where buyers and sellers post prices and match (Order Book)
3. A service where you say "I want apples, best price" and professionals compete to fill you (Intent/RFQ)

These map directly to the three DEX architectures.

**Architecture 1: Automated Market Maker (AMM)**

[AMM] — uses a mathematical formula to price assets based on pool reserves. No counterparty needed — the pool itself is always available to trade.

From L1.7: x × y = k (Uniswap). StableSwap (Curve). Weighted pools (Balancer).

Advantages: always liquid (as long as the pool has tokens), permissionless (anyone can trade any token with a pool), composable (other contracts can call it atomically).

Disadvantages: capital inefficiency (most liquidity sits unused outside current price range), impermanent loss for LPs, subject to MEV (frontrunning, sandwich attacks).

Best for: long-tail assets with no order book liquidity, permissionless token launches, composable DeFi building blocks.

**Architecture 2: On-Chain Order Book**

[Order book DEX] — buyers post bids, sellers post asks. When a bid meets an ask, the trade executes. Like a traditional exchange but on-chain.

Examples: dYdX (Cosmos, fully on-chain order book), Injective, Serum (Solana, now Phoenix), Dexalot (Avalanche subnet).

Advantages: price discovery (the order book reveals real supply and demand), professional market making (tighter spreads), no impermanent loss (market makers set prices, not a formula).

Disadvantages: requires market makers (illiquid pairs suffer), high on-chain gas for each order (makes Ethereum mainnet unviable for order books — only works on fast/cheap chains), more complex smart contracts.

Best for: high-volume pairs where professional market makers operate, derivatives and perpetuals, chains with sub-cent gas.

**Architecture 3: Intent-Based / RFQ (Request for Quote)**

[Intent-based trading] — the user specifies their desired outcome ("I want to swap 10 ETH for at least 20,000 USDC") and off-chain solvers compete to fill the order, then settle on-chain.

[RFQ (Request for Quote)] — a variant where the user's request is sent to professional market makers who quote prices; the best quote wins and executes on-chain.

Examples: CoW Protocol, Uniswap X, 1inch Fusion, Hashflow.

Advantages: MEV-protected (solvers compete to give you the best price, reducing frontrunning), access to off-chain liquidity (solvers can use CEX liquidity), no slippage for the user in some designs.

Disadvantages: requires off-chain infrastructure (less purely decentralized), dependent on solver liveness (if no solvers, trades fail), more complex architecture.

Best for: large trades where MEV protection matters, users who want guaranteed execution quality, bridging on-chain and off-chain liquidity.

**The hybrid landscape:**

Modern DEXes blend architectures. Uniswap V4 adds hooks (programmable AMMs). Jupiter (Solana) aggregates AMMs + order books. CoW Protocol routes through AMMs when no RFQ fills. The boundaries are blurring.`,

      examples: [
        {
          title: `$1M trade — which architecture saves money?`,
          scenario: `Marcus wants to swap $1M USDC for ETH. AMM (Uniswap V3): even with concentrated liquidity, a $1M swap in a $50M pool causes ~0.5-1% price impact = $5,000-10,000 lost to slippage. MEV sandwich attack risk on top. Order Book (dYdX): if sufficient depth, fills at near mid-price with tight spread. But dYdX is for perpetuals, not spot ETH. Intent/RFQ (CoW Protocol or 1inch Fusion): sends request to professional market makers. Best quote might be 0.05-0.1% spread = $500-1,000. MEV protection included. Winner for $1M: Intent/RFQ by a factor of 5-10x on execution quality.`,
          lesson: `Architecture choice isn't academic — it directly determines execution quality. For large trades, intent-based routing saves thousands. For small trades, AMMs are simpler and cheaper.`,
        },
        {
          title: `New token launch — only AMMs work`,
          scenario: `A new DeFi protocol launches $PROJECT token. They want immediate trading. Order book: impossible — no market makers will quote an unknown token with zero trading history. Intent/RFQ: no solvers will fill an illiquid, unknown token. AMM: create a Uniswap V2 pool with $PROJECT/ETH, add $100K of liquidity. Immediate trading begins. The price formula (x × y = k) creates a price from the moment of launch. Within hours, 500 traders are swapping — some adding more liquidity, arbitrageurs correcting price discrepancies across pools. AMMs are the only architecture that works permissionlessly for new assets.`,
          lesson: `AMMs democratized liquidity provision and token launches. Any token, any project, any time — no permission from market makers or exchanges needed. This is the foundational DeFi innovation.`,
        },
        {
          title: `dYdX order book — why derivatives need different design`,
          scenario: `dYdX offers ETH perpetuals with up to 20x leverage. Requirement: users need to place, modify, and cancel limit orders rapidly — potentially hundreds of orders per second for algorithmic traders. AMM for this: every order modification = an on-chain transaction = gas cost = too slow and expensive. Order book on Cosmos (dYdX V4): order placement is off-chain (instant, free), settlement is on-chain. Algorithmic traders can update strategies in milliseconds. Market makers maintain tight $0.01 spreads on a $100M bid/ask stack. AMMs simply cannot replicate this — the architecture is wrong for the use case.`,
          lesson: `Order books are the right architecture for derivatives where professional market making, rapid order modification, and tight spreads are required. AMMs work for spot — order books work for leverage.`,
        },
      ],

      guidedPractice: [
        {
          question: `A user wants to swap $100 of a brand-new token that just launched with no order book or market makers. Which DEX architecture is their only option?`,
          options: [
            `A) Order Book — it's the most professional`,
            `B) AMM — the only permissionless architecture that creates immediate liquidity for any token via a pool`,
            `C) Intent/RFQ — solvers will find the best price`,
            `D) None — they must wait for a CEX listing`,
          ],
          correct: `B) AMM — the only permissionless architecture that creates immediate liquidity for any token via a pool`,
          hint: `Order books need market makers. RFQ needs solvers. Neither will serve an unknown new token. What architecture works without permission from anyone?`,
          explanation: `AMMs are permissionless — anyone can create a pool for any ERC-20 token pair and provide liquidity. The formula sets prices automatically from the ratio of reserves. Order books and RFQ systems require professional counterparties (market makers, solvers) who won't serve illiquid unknown tokens. AMMs are the foundational infrastructure that enabled the long-tail token economy in DeFi.`,
        },
        {
          question: `What is the main advantage of intent-based / RFQ DEXes over AMMs for large trades?`,
          options: [
            `A) They're faster`,
            `B) Solvers compete for your order, giving you the best possible price with MEV protection — avoiding the slippage and frontrunning that AMMs expose large trades to`,
            `C) They have lower gas fees`,
            `D) They support more token pairs`,
          ],
          correct: `B) Solvers compete for your order, giving you the best possible price with MEV protection — avoiding the slippage and frontrunning that AMMs expose large trades to`,
          hint: `From L1.11 (MEV risk) and the $1M trade example: what specifically hurts large AMM trades that intent-based solves?`,
          explanation: `Large AMM trades face two costs: (1) price impact (moving the pool price against yourself) and (2) MEV sandwich attacks (bots frontrunning your large trade). Intent-based routing: solvers bid to fill your trade at the best price, competition reduces spread, and the intent model makes MEV attacks much harder (your transaction isn't visible in the mempool for bots to exploit).`,
        },
        {
          question: `Why are on-chain order books only viable on fast, cheap chains (Solana, Cosmos, Avalanche) and not on Ethereum mainnet?`,
          options: [
            `A) Ethereum doesn't support order book logic`,
            `B) Order books require frequent order placement, modification, and cancellation — each is an on-chain transaction. At $5-50 Ethereum gas per transaction, market makers can't profitably operate.`,
            `C) Order books are slower than AMMs`,
            `D) Ethereum doesn't allow order books by design`,
          ],
          correct: `B) Order books require frequent order placement, modification, and cancellation — each is an on-chain transaction. At $5-50 Ethereum gas per transaction, market makers can't profitably operate.`,
          hint: `A market maker might modify their quotes 100 times per minute. At $10 gas each: $1,000/minute in gas costs. How do they make a profit?`,
          explanation: `Professional market making requires updating quotes continuously as prices move. Each update is an on-chain transaction. On Ethereum mainnet, this is economically impossible — gas costs would exceed the spread revenue. On Solana ($0.001 per transaction) or dYdX's Cosmos chain (off-chain order placement with on-chain settlement), the economics work. This is why the chain determines the DEX architecture that's feasible on it.`,
        },
        {
          question: `Connecting to L2.12 (dYdX on Cosmos): dYdX migrated from Ethereum L2 to its own Cosmos chain. Which DEX architecture does dYdX use, and why did this require its own chain?`,
          options: [
            `A) AMM — the formula handles all pricing`,
            `B) Order book — requires ultra-low cost per order modification and custom block ordering to eliminate MEV frontrunning, only achievable on a purpose-built chain`,
            `C) Intent-based — solvers fill all dYdX orders`,
            `D) Hybrid AMM/order book — on any chain`,
          ],
          correct: `B) Order book — requires ultra-low cost per order modification and custom block ordering to eliminate MEV frontrunning, only achievable on a purpose-built chain`,
          hint: `From L2.12: why did dYdX need its own chain? What architecture requires custom block ordering?`,
          explanation: `dYdX V4 is a fully on-chain order book — the highest-performance DEX architecture. It requires: (1) near-zero cost per order (Cosmos chain: free off-chain order placement), (2) custom block ordering to eliminate MEV (the chain's validator set prioritizes fair ordering), (3) dedicated block space so high-frequency trading doesn't compete with other applications. Only an app-chain built specifically for this purpose could meet all three requirements.`,
        },
        {
          question: `An AMM pool has $10M TVL. A $1M swap is executed. What happens to the pool's price relative to external markets, and who profits from this?`,
          options: [
            `A) Nothing — AMMs don't move prices`,
            `B) The large swap moves the AMM price away from external market prices; arbitrageurs buy the mispriced asset from the AMM and sell on other venues, correcting the price and earning profit (arbitrage)`,
            `C) The LP earns the price difference`,
            `D) The protocol captures the price movement`,
          ],
          correct: `B) The large swap moves the AMM price away from external market prices; arbitrageurs buy the mispriced asset from the AMM and sell on other venues, correcting the price and earning profit (arbitrage)`,
          hint: `From L1.7: AMM prices follow the bonding curve. After a large buy, what does the price look like relative to Binance or Coinbase?`,
          explanation: `A $1M buy on a $10M pool moves the price ~10% (rough approximation). Immediately, the AMM price is 10% above Binance/Coinbase. Arbitrageurs see this, sell the expensive asset to the AMM, buy the cheap asset from a CEX, and pocket the ~10% difference. This arbitrage returns the AMM price to market equilibrium. The arbitrageur profits; the original large trader paid the price impact; LPs receive trading fees from all sides of this activity.`,
        },
      ],

      lessonSimulations: [
        {
          type: `architecture-selection`,
          scenario: `For each protocol design, recommend the DEX architecture and justify: (A) A stablecoin swap service targeting $10M+ institutional trades. (B) A memecoin launchpad where any project can create immediate trading. (C) A perpetuals exchange for crypto-native traders doing 100x leverage. (D) A cross-chain bridge that needs to swap wrapped ETH for native ETH at minimal slippage.`,
          answer: {
            A: `Intent/RFQ (CoW Protocol-style). $10M institutional: slippage and MEV are the dominant costs. Solvers with access to CEX liquidity can fill at near mid-price. AMMs would suffer massive price impact.`,
            B: `AMM (Uniswap V2/V3 style). Permissionless token launch → no market makers available → AMM only. Simple x×y=k works fine for speculative price discovery.`,
            C: `On-chain order book (dYdX-style). Leverage trading needs: tight spreads (professional market makers), position management (limit orders, stop losses), rapid order modification. AMMs can't provide leverage; intent-based is too slow for active trading.`,
            D: `Curve-style AMM (StableSwap). Wrapped ETH and native ETH are near-correlated (price should be ~equal). StableSwap minimizes slippage for near-equal assets — same formula that makes stablecoin swaps efficient. A general AMM (x×y=k) would cause unnecessary price impact.`,
          },
        },
        {
          type: `research-comparison`,
          scenario: `Compare Uniswap V3 (AMM) and CoW Protocol (intent-based) using DeFiLlama and their documentation: TVL, daily volume, fee structure, and which user type benefits most from each. Where do they compete and where do they complement each other?`,
          answer: `Uniswap V3: massive TVL ($3-5B+), $500M-$1B daily volume, LPs earn swap fees. Benefits: retail swappers doing <$10K trades, long-tail tokens with no alternative liquidity, composable DeFi (other protocols call Uniswap atomically). CoW Protocol: lower TVL (solver-based, doesn't hold funds), significant volume for large trades, users pay no MEV losses. Benefits: large traders ($100K+) who care about execution quality, batch auction allows coincidence of wants (no intermediary). Competition: mid-size trades ($10K-$100K) where both work but CoW offers better execution. Complement: Uniswap provides the underlying liquidity that CoW solvers often use to fill orders.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: DEX Architecture Analysis`,
        description: `L3.1 + Section 1-2 context. Full DEX evaluation.`,
        challenges: [
          {
            scenario: `You're designing a DEX for a new chain. Requirements: supports both retail ($10-500 trades, needs long-tail tokens) and institutional ($100K+ trades, needs MEV protection), launches with the chain (no existing market makers), and must be composable with other DeFi protocols. What architecture or combination do you recommend? How does this match what Jupiter (Solana) actually built?`,
            answer: `Recommendation: AMM core + intent-based routing layer. Phase 1: deploy AMM (Uniswap V3-style) for permissionless token launches and composability. AMM serves retail and bootstraps liquidity. Phase 2: add aggregator/intent layer on top — route large trades through solvers who use AMM + any off-chain liquidity. Jupiter (Solana) did exactly this: started as an aggregator routing through Solana AMMs (Raydium, Orca) then added intent-based routing for optimal execution. The AMM layer provides the liquidity foundation; the intent layer provides execution quality for larger trades. Neither alone serves both segments.`,
          },
        ],
      },

      keyTakeaway: `Three DEX architectures: AMM (formula-based, always liquid, permissionless — best for new/long-tail tokens and composability), Order Book (bid/ask matching, professional market making — best for derivatives and high-volume pairs on fast/cheap chains), Intent/RFQ (solver competition, MEV protection — best for large trades needing execution quality). Most modern DEX infrastructure combines architectures. Choose based on: trade size, asset type, MEV sensitivity, and whether professional counterparties exist for the asset.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3.2 — UNISWAP V2
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'uniswap-v2',
      title: `3.2 Uniswap V2 — The Formula That Built DeFi`,
      subtitle: `x × y = k. Four characters that generated $1 trillion in trading volume. Here's exactly how it works and why it matters.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L3.1 you learned the three DEX architectures. Uniswap V2 is the definitive AMM — the x×y=k formula you'll encounter in every DEX discussion. This lesson goes beyond the formula to understand the mechanics, LP economics, and why V2 became the foundation of DeFi.`,

      hook: `Uniswap V2 has no order book, no market maker, no CEO, and no support team. It's 500 lines of code running autonomously, 24/7. It has processed over $1 trillion in volume. Understanding how 500 lines produces $1 trillion is understanding DeFi.`,

      visualPrompt: `A bonding curve graph: x-axis = ETH amount in pool, y-axis = USDC amount. The curve labeled "x × y = k = constant." Two points marked: current price (intersection of tangent line), and new price after a large ETH buy (further along the curve). LP position shown as a shaded area. Caption: "The curve never runs out of liquidity — but price moves with every trade."`,

      explanation: `Let me tell you about the formula that changed [DeFi].

In 2018, Hayden Adams launched [Uniswap]. The entire protocol was a single formula: x × y = k.

[Constant Product Formula] — the invariant that governs Uniswap V2: the product of the two token reserves must remain constant after any trade (ignoring fees). If a pool has x tokens of A and y tokens of B: x × y = k. If someone buys some A (reducing reserve x), y must increase proportionally to keep the product k constant.

**How a swap works — step by step:**

Pool: 10 ETH + 20,000 USDC. k = 200,000.

Maria wants to buy 1 ETH with USDC.
1. After the trade: pool will have 9 ETH + ? USDC
2. Apply invariant: 9 × ? = 200,000
3. ? = 22,222 USDC (pool needs this much)
4. Maria must send: 22,222 − 20,000 = 2,222 USDC
5. Price paid: 2,222 USDC for 1 ETH

Notice: the "price" (2,222 USDC/ETH) is higher than the ratio implied by pool reserves (20,000/10 = 2,000). This difference is [price impact] — the cost of moving the curve.

**The 0.3% fee:**

Uniswap V2 takes 0.3% on each swap. It's applied before the invariant calculation, making k slightly larger after each trade. This fee accumulates to LP positions, growing the value of LP tokens over time.

[LP token] — when you provide liquidity to Uniswap V2, you receive LP tokens representing your proportional share of the pool. When you withdraw, you redeem LP tokens for pool assets + accumulated fees.

**Impermanent loss — the LP's dilemma:**

[Impermanent loss (IL)] — the difference between holding assets in an LP position vs simply holding the assets. When prices diverge, the AMM rebalances — leaving LPs with more of the cheaper asset.

Example: provide 1 ETH + 2,000 USDC when ETH = $2,000. ETH rises to $4,000. The pool now holds ~0.71 ETH + ~2,828 USDC (rebalanced by arbitrageurs). Your LP position = $5,657. If you had just held: 1 ETH ($4,000) + 2,000 USDC = $6,000. IL = $6,000 − $5,657 = $343, or about 5.7%.

The loss is "impermanent" because if ETH returns to $2,000, it disappears. If ETH stays at $4,000 and you exit: the loss is realized.

**Why V2 was revolutionary:**

- Permissionless: any ERC-20 token pair, no approval needed
- Composable: other contracts can call Uniswap atomically
- Immutable: the core contracts cannot be upgraded — code is law
- Self-sustaining: fees incentivize LPs to provide liquidity without any team coordination

V2 is still running today with billions in TVL, despite V3 existing. Some protocols prefer V2's simplicity for composability.`,

      examples: [
        {
          title: `Calculating exact swap output for a V2 pool`,
          scenario: `Pool: 100 ETH, 200,000 USDC. k = 20,000,000. Jake wants to buy 10 ETH. After trade: pool has 90 ETH. Required USDC: 20,000,000 / 90 = 222,222 USDC. Jake sends: 222,222 − 200,000 = 22,222 USDC. Price per ETH: 22,222 / 10 = 2,222 USDC (vs starting pool ratio of 200,000/100 = 2,000). Price impact: (2,222 − 2,000) / 2,000 = 11.1%. For a 10% trade of pool size ($20K of $200K pool): 11% slippage. Rule of thumb: price impact ≈ trade size / pool size × 2.`,
          lesson: `Price impact scales with trade size relative to pool size. A $200K pool handles $2K trades with ~1% impact. The same $200K pool gets hit 11% on a $20K trade. Pool depth (TVL) is the liquidity quality metric.`,
        },
        {
          title: `Impermanent loss vs fee revenue — when LPing is profitable`,
          scenario: `Maria provides 1 ETH + 2,000 USDC to a V2 pool. Over 6 months: ETH stays between $1,800 and $2,200 (±10% range). Fees earned: $800 (pool has high trading volume, Maria holds 1% of pool). IL from price movement: ~$50 (small range, small divergence). Net: +$750 profit vs simply holding. Comparison: if she'd just held 1 ETH + $2,000 USDC, she'd have $4,200 (ETH at $2,200). Her LP position: $4,200 − $50 IL + $800 fees = $4,950. LP wins by $750. Key insight: high-volume, low-volatility pairs are profitable for LPs.`,
          lesson: `IL is only a problem when fees don't compensate. Stablecoin/stablecoin or ETH/stablecoin pairs with high volume can be very profitable — fees exceed IL. High-volatility, low-volume pairs are LP traps.`,
        },
        {
          title: `V2 flash loans — composability in action`,
          scenario: `Priya uses a Uniswap V2 flash loan: borrow 1,000 ETH from the pool at the start of a transaction, execute complex arbitrage across 5 protocols, return 1,000 ETH + 0.3% fee in the same transaction. If any step fails: the whole transaction reverts, she never had the ETH, nothing changes. This is atomic composability — multiple protocols interacting in one transaction with zero risk of partial execution. The Uniswap V2 flash loan function is a single line in the core contract, yet it enables an entire arbitrage economy.`,
          lesson: `V2's flash loans enabled an entire class of DeFi strategies (arbitrage, liquidations, collateral swaps) that don't exist in TradFi. Atomic composability means complex multi-step strategies either fully succeed or fully fail — no partial execution risk.`,
        },
      ],

      guidedPractice: [
        {
          question: `A Uniswap V2 pool has 50 ETH and 100,000 USDC. What is k?`,
          options: [`A) 5,000,000`, `B) 150,000`, `C) 2,000`, `D) 50,000,000`],
          correct: `A) 5,000,000`,
          hint: `k = x × y = ETH reserves × USDC reserves.`,
          explanation: `k = 50 × 100,000 = 5,000,000. This value stays constant (ignoring fees) through every trade. If a trade reduces ETH to 45, USDC must rise to 5,000,000/45 = 111,111 USDC. The invariant forces price to move with every trade.`,
        },
        {
          question: `From the same pool (50 ETH, 100,000 USDC, k=5,000,000): someone buys 5 ETH. How much USDC do they pay (ignoring fees)?`,
          options: [`A) 10,000 USDC`, `B) 11,111 USDC`, `C) 12,500 USDC`, `D) 10,526 USDC`],
          correct: `B) 11,111 USDC`,
          hint: `After trade: 45 ETH remain. Required USDC = k / 45. Sent USDC = required − current USDC.`,
          explanation: `After buying 5 ETH: pool has 45 ETH. Required USDC: 5,000,000/45 = 111,111. Currently 100,000 USDC. Sent: 111,111 − 100,000 = 11,111 USDC. Price per ETH: 11,111/5 = 2,222 USDC vs starting ratio of 2,000. Price impact: 11.1% for buying 10% of the pool's ETH.`,
        },
        {
          question: `Why is Uniswap V2 still running with significant TVL despite V3 being superior on capital efficiency?`,
          options: [
            `A) V2 is more secure than V3`,
            `B) V2's simplicity and full-range liquidity makes it easier for other smart contracts to compose with — protocols that need guaranteed liquidity at any price prefer V2's passive LP model`,
            `C) V2 charges lower fees`,
            `D) V3 doesn't exist yet`,
          ],
          correct: `B) V2's simplicity and full-range liquidity makes it easier for other smart contracts to compose with — protocols that need guaranteed liquidity at any price prefer V2's passive LP model`,
          hint: `V3 LPs can go out of range. What happens to a protocol that tries to use V3 liquidity that's out of range?`,
          explanation: `V3 concentrated liquidity means LP positions can go "out of range" — providing zero liquidity. For protocols that depend on always-available liquidity (like liquidation bots, certain yield strategies), V2's guaranteed full-range coverage is more reliable. V2 is also simpler to audit and compose with. The tradeoff: V2 is less capital-efficient but more composable and passive-friendly.`,
        },
        {
          question: `Impermanent loss occurs when ETH price doubles while you're LP'ing ETH/USDC. Approximately what % IL do you experience?`,
          options: [`A) 2.9%`, `B) 5.7%`, `C) 11.4%`, `D) 20%`],
          correct: `B) 5.7%`,
          hint: `Price doubles (2x). IL formula for 2x price change: 1 - sqrt(2) / 1.5 ≈ 5.7%.`,
          explanation: `IL formula: 2√r/(1+r) − 1 where r = price ratio change. For 2x: 2√2/(1+2) − 1 = 2×1.414/3 − 1 = 0.943 − 1 = −5.7%. So a 2x price move = ~5.7% IL. For 4x: ~11.4%. For 9x: ~25%. IL grows with price divergence but at a decreasing rate — large moves hurt less proportionally than you might expect, but they're still significant.`,
        },
        {
          question: `Connecting to L1.10 (yield): a V2 LP earns 0.3% fees on every swap. The pool processes $5M in daily volume. The pool has $10M TVL. What is the LP's annualized fee APY?`,
          options: [`A) 0.3%`, `B) 5.5%`, `C) 54.75%`, `D) 15%`],
          correct: `C) 54.75%`,
          hint: `Daily fee revenue = $5M × 0.3% = $15,000. Annualized = $15,000 × 365. APY = Annual fees / TVL.`,
          explanation: `Daily fees: $5M × 0.003 = $15,000. Annual: $15,000 × 365 = $5,475,000. APY = $5,475,000 / $10,000,000 = 54.75%. High-volume pools with moderate TVL generate excellent real yield for LPs — this is exactly the capital efficiency metric from L1.13 applied to AMMs. Note: this is fee-only APY before IL adjustment.`,
        },
      ],

      lessonSimulations: [
        {
          type: `il-calculator`,
          scenario: `Marcus provides liquidity to a V2 ETH/USDC pool with equal value: $10,000 total ($5,000 ETH + $5,000 USDC at ETH=$2,500). Calculate his position value and IL in each scenario: (A) ETH stays at $2,500 after 3 months. (B) ETH rises to $5,000. (C) ETH falls to $1,000. Also calculate: how much fee revenue is needed in each scenario to break even vs holding?`,
          answer: {
            A: `No IL. LP value = $10,000 (prices unchanged, no rebalancing needed). Break-even fee: $0.`,
            B: `ETH 2x. IL ≈ 5.7%. Hold: $5,000×2 + $5,000 = $15,000. LP: ~$14,142 (sqrt price movement preserves constant product). Break-even fee needed: $858. High fee volume pool with $5M/day volume on $100K pool earns ~15% APY = $1,500 over 3 months. Net positive.`,
            C: `ETH drops 60% to $1,000. Hold: $2,000 + $5,000 = $7,000. LP: pool rebalances to hold more ETH and less USDC. LP value ≈ $6,325. IL = $675 (9.6%). Break-even fee: $675. At 15% APY fee yield, 3 months = ~$375. Net negative — fees don't cover IL. Lower volume during bear market makes this worse.`,
            lesson: `IL matters most in down markets and high-volatility pairs. The break-even analysis shows fee yield must exceed IL for profitability.`,
          },
        },
        {
          type: `pool-economics',
          scenario: `Compare two V2 pools for LP attractiveness: Pool A (ETH/USDC): $50M TVL, $20M daily volume, 0.3% fee. Pool B (SHIB/ETH): $5M TVL, $500K daily volume, 0.3% fee. Calculate fee APY for each. Factor in expected IL (ETH likely moves ±20% monthly; SHIB likely moves ±80% monthly). Which pool would you LP in?`,
          answer: {
            poolA: `Daily fees: $60,000. Annual: $21.9M. Fee APY: $21.9M/$50M = 43.8%. IL for 20% monthly ETH move: ~0.5% per month. Net APY estimate: 43.8% − 6% IL = ~37.8% net. Strong.`,
            poolB: `Daily fees: $1,500. Annual: $547,500. Fee APY: $547,500/$5M = 10.95%. IL for 80% monthly SHIB move: ~12% per month, ~144% annualized. Net APY: 10.95% − 144% = massively negative. LP trap.`,
            verdict: `Pool A clearly. High-volume, moderate-volatility = LP profit. Low-volume, high-volatility = guaranteed loss. Always calculate both sides before providing liquidity.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: V2 LP Strategy Design`,
        description: `L3.1–L3.2. Design a complete LP strategy for a V2 pool.`,
        challenges: [
          {
            scenario: `You have $50,000 to deploy as a V2 LP. Choose between: (A) ETH/USDC V2 on Arbitrum — $80M TVL, $30M daily volume. (B) ARB/ETH V2 on Arbitrum — $5M TVL, $2M daily volume, ARB highly volatile. (C) USDC/USDT V2 on Curve (equivalent) — $500M TVL, $200M daily volume, 0.04% fee rate. Calculate fee APY for each, estimate annual IL, identify the winner and why.`,
            answer: `A (ETH/USDC): Daily fees = $90K. Annual = $32.85M. APY = 41%. IL (ETH ±30% annual movement): ~4.5%. Net: ~36.5%. Strong. B (ARB/ETH): Daily fees = $6K. Annual = $2.19M. APY = 43.8% on $5M pool. But ARB volatile (±100% annually): IL = ~25%. Net: ~18.8%. Riskier for similar V2. C (USDC/USDT Curve): Daily fees = $80K. Annual = $29.2M. APY = 5.84%. IL: ~0% (near-zero price movement). Net: ~5.84%. Safe but low. Winner: A (ETH/USDC V2 on Arbitrum). Best risk-adjusted return. B has higher gross APY but IL risk too high. C is safest but 36% lower net yield than A for the same capital.`,
          },
        ],
      },

      keyTakeaway: `Uniswap V2: x × y = k. Every trade moves the price along the bonding curve — price impact proportional to trade size vs pool size. LPs earn 0.3% fee on every swap, accumulated as LP tokens. Impermanent loss occurs when prices diverge from entry — ranges from ~5.7% (2x move) to ~25% (9x move). Profitable LP = high-volume pools where fee yield exceeds IL. V2 remains relevant for composability and passive LPs despite V3's capital efficiency advantage.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3.3 — UNISWAP V3
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'uniswap-v3',
      title: `3.3 Uniswap V3 — Concentrated Liquidity Changes Everything`,
      subtitle: `In V2, 99% of your capital sits idle. V3 lets you deploy it all at once — with 10-100x more fee yield. Here's the trade-off.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L3.2 you mastered Uniswap V2's x×y=k formula and LP economics. V3 solves V2's biggest flaw: capital inefficiency. The same math, but you choose WHERE on the curve your capital sits — dramatically changing both the reward and the risk.`,

      hook: `V2 spreads your capital across every price from zero to infinity. If ETH trades between $2,000 and $3,000, 98% of your V2 capital is sitting outside that range doing nothing. V3 lets you put 100% in the $2,000-$3,000 range — earning 50x more fees. But step outside the range, and you earn zero.`,

      visualPrompt: `Side by side: V2 bonding curve (liquidity spread thin across all prices, most far from current price) vs V3 (thick liquidity concentration between two price ticks, almost nothing outside). LP fee comparison: V2 earns $100/day; V3 in range earns $5,000/day. Label showing "If price exits range: V3 earns $0." Caption: "Concentrated liquidity: 50x efficiency with active management cost."`,

      explanation: `Let me tell you about the upgrade that made [liquidity] provision a job.

[Uniswap v2] was simple: deposit tokens, earn fees, go to sleep. Capital efficiency: terrible (most liquidity unused).

[Uniswap V3] introduced [concentrated liquidity] — you choose a price range. Your capital only provides liquidity within that range, but it's 100% deployed there (not spread thin).

**How concentrated liquidity works:**

Instead of the full [0, ∞) price range, you choose [lower tick, upper tick].

Example: provide liquidity in the ETH/USDC range [$2,000, $3,000]. While ETH trades in this range: your capital is 100% active, earning maximum fees. If ETH drops to $1,999: your position is 100% ETH (converted at the bottom of your range). If ETH rises to $3,001: your position is 100% USDC (converted at the top of your range). Either way: you're earning zero fees until price returns to range.

[Tick] — the price increment in V3. Ticks represent price points on a geometric scale. Narrow tick range = more concentrated = more fees when in range, but higher IL and more active management needed.

**The capital efficiency gain:**

A V2 LP in a $100M pool earning $100K/day in fees earns $100K/day from $100M deployed.

A V3 LP concentrating their capital in a 10% price range effectively has 10x more capital deployed relative to that range. If 10% of the V2 pool is in that range ($10M), the V3 LP competes with only $10M rather than $100M — earning 10x more fees proportionally.

Practical multipliers: for stablecoin pairs (narrow range), V3 can be 1,000-4,000x more capital efficient than V2. For ETH/USDC with a ±5% range, 50-100x more efficient.

**The management requirement:**

V3 LPs are [active LPs] — they must monitor prices and rebalance ranges when price exits.

[Out of range] — when price moves outside your chosen ticks. Zero fees. Full exposure to the asset price movement (no IL mitigation, just raw directional exposure). The LP must either: widen the range (reduce efficiency), move the range (pay gas), or do nothing (miss fees, potentially exit at a poor price).

**V3 as a financial instrument:**

V3 positions behave like options on the underlying asset. In-range position = selling volatility (collecting premium from traders). Out-of-range position = directional exposure to the asset you end up holding.

[V3 NFT] — each V3 position is a unique NFT (unlike V2's fungible LP tokens), because each position has a unique price range. This enables V3 positions to be used as collateral in some protocols.`,

      examples: [
        {
          title: `V3 fee yield calculation — in range vs out of range`,
          scenario: `Maria deploys $10,000 in a V3 ETH/USDC position, range $2,800-$3,200 (±6.7% from $3,000). The $3,000 pool has $20M total V3 liquidity across all ranges, but only $2M is in her range. Her $10,000 represents 0.5% of the in-range liquidity. Pool generates $100,000/day in fees. Her daily fee: $100,000 × 0.5% = $500/day = $182,500 annualized = 1,825% APY on $10,000. If ETH moves to $3,201 (out of range): $0/day. She must manually rebalance — pay $10-50 gas to set a new range, which eats into yield.`,
          lesson: `In-range V3 positions generate extraordinary yields. Out-of-range positions earn nothing. The trade-off is continuous active management — V3 LP is a job, not a passive investment.`,
        },
        {
          title: `The full-range V3 position — passive but costly`,
          scenario: `Jake doesn't want to manage V3. He sets range [$0, ∞) — effectively V2 behavior. His $10,000 in a $20M pool represents 0.05% of all liquidity (not just in-range). Daily fees: $100,000 × 0.05% = $50/day = $18,250/year = 182.5% APY vs 1,825% for the in-range position. But Jake's position never goes out of range — he never pays gas to rebalance, never misses fees due to range management error. Trade-off: 10x less yield but 10x less work.`,
          lesson: `Full-range V3 positions are V2-equivalent — simple but capital-inefficient. The efficiency gain of concentration requires active management. The correct choice depends on your time and expertise, not just the APY headline.`,
        },
        {
          title: `Rebalancing mechanics and gas cost reality`,
          scenario: `Priya has a tight V3 range (±2%) on ETH/USDC. ETH moves ±2% roughly twice per week (exits range, comes back). Each exit requires: remove old position ($15 gas), add new position ($20 gas) = $35 per rebalance. 2 rebalances/week × $35 = $70/week = $3,640/year in gas. Her $10,000 position on Ethereum mainnet earning $500/day = $182,500/year. Gas impact: 3,640/182,500 = 2% of yield. Manageable. Same position on Ethereum mainnet with $1,000: $500/day assumes she holds 0.5% of in-range liquidity — not realistic at $1,000 scale. More realistically: smaller pool, smaller yield, same gas. Gas becomes 100%+ of yield. Lesson: V3 has a minimum economic viable position size for mainnet (roughly $50K+ for tight ranges).`,
          lesson: `V3 economics only work if position size × yield rate >> gas cost of rebalancing. On Ethereum mainnet, tight V3 ranges require $50K+ positions. On Arbitrum ($0.10 gas), even $1K positions can be profitable with tight ranges.`,
        },
      ],

      guidedPractice: [
        {
          question: `You provide V3 liquidity in the ETH/USDC range [$2,500, $3,500]. ETH is currently $3,000. What happens to your position if ETH drops to $2,400?`,
          options: [
            `A) You earn double fees because volatility is higher`,
            `B) Your position is 100% ETH (converted by the AMM as price fell through your range) and you earn zero fees until ETH returns above $2,500`,
            `C) You lose all your capital`,
            `D) Nothing — you hold the same mix of ETH and USDC`,
          ],
          correct: `B) Your position is 100% ETH (converted by the AMM as price fell through your range) and you earn zero fees until ETH returns above $2,500`,
          hint: `As price falls through your range, the AMM converts your USDC to ETH (arbitrageurs buy USDC from you cheaply). When fully out of range on the downside, you hold 100% of the cheaper asset.`,
          explanation: `When ETH drops below $2,500, your position has been fully converted to ETH (arbitrageurs progressively bought your USDC as ETH fell through your range). You now hold 100% ETH, which is falling in value. You earn zero fees. This is both concentrated impermanent loss and out-of-range risk combined. You must rebalance your range or wait for ETH to recover above $2,500.`,
        },
        {
          question: `Why is V3 described as "active LP" vs V2's "passive LP"?`,
          options: [
            `A) V3 requires you to trade more`,
            `B) V3 positions go out of range as prices move, requiring monitoring and rebalancing to maintain fee-earning efficiency — V2 always earns fees regardless of price`,
            `C) V3 has higher gas fees`,
            `D) V3 positions expire after 30 days`,
          ],
          correct: `B) V3 positions go out of range as prices move, requiring monitoring and rebalancing to maintain fee-earning efficiency — V2 always earns fees regardless of price`,
          hint: `V2: any price anywhere → you earn fees. V3: only within your range → what happens when price leaves?`,
          explanation: `V2 provides liquidity across all prices from 0 to ∞ — it's always in range and always earning fees (just less efficiently). V3 concentrates capital in a specific range — much more efficient when in range, but earning exactly zero when out. This means V3 LPs must actively monitor prices, adjust ranges as markets move, and pay gas to rebalance. Full-time V3 LP is a legitimate professional strategy.`,
        },
        {
          question: `A V3 LP earns 100x more fees than a V2 LP for the same capital in the same pool. What cost must they accept for this 100x improvement?`,
          options: [
            `A) A 100x higher fee percentage charged to swappers`,
            `B) Concentrated range = higher impermanent loss when price exits the range + active management requirement (monitoring, rebalancing, gas costs)`,
            `C) Their tokens are locked for 100 days`,
            `D) They must stake governance tokens`,
          ],
          correct: `B) Concentrated range = higher impermanent loss when price exits the range + active management requirement (monitoring, rebalancing, gas costs)`,
          hint: `There's no free lunch in DeFi. 100x more efficiency must come with some cost. What changes when you concentrate?`,
          explanation: `Concentration amplifies everything: more fees when in range, more IL when price moves, and requires active management (no "set and forget"). A V2 LP with $10K earns modest but reliable fees with modest IL. A V3 LP with $10K in a tight range earns 100x more fees when in range but faces: (1) higher IL from concentrated exposure, (2) gas costs for rebalancing, (3) missed fees during out-of-range periods. The net APY after all costs may be similar to V2 — but V3 has much higher upside for skilled active managers.`,
        },
        {
          question: `Connecting to L3.1 (DEX architectures): V3 concentrated liquidity has the same underlying x×y=k math as V2, but can approach order-book efficiency. At the extreme, what does a V3 position with an extremely narrow range resemble?`,
          options: [
            `A) A savings account`,
            `B) A limit order — providing liquidity at exactly one price, converting from one asset to the other if touched`,
            `C) A put option`,
            `D) A stablecoin`,
          ],
          correct: `B) A limit order — providing liquidity at exactly one price, converting from one asset to the other if touched`,
          hint: `If you set a V3 range so narrow it's essentially a single price point, what happens when price crosses that point?`,
          explanation: `A V3 range so narrow it's essentially a single price tick behaves like a limit order: it provides liquidity at one specific price, and when price crosses through it, converts entirely from one asset to the other. Sophisticated traders use V3 for passive limit orders: "convert my 10,000 USDC to ETH when ETH hits $2,000" by providing V3 liquidity in a range just above $2,000. This hybrid AMM/order-book behavior is one of V3's most powerful advanced features.`,
        },
        {
          question: `You have $5,000 for V3 LP. Same pool, two choices: Range A = ±50% (wide, V2-like), Range B = ±5% (tight, high efficiency). ETH moves ±15% over the next month. Which choice was better and why?`,
          options: [
            `A) Range A — always in range, lower management`,
            `B) Range B — 10x more fees while in range`,
            `C) It depends — Range B earns more when in range but spends more time out of range with ±15% moves`,
            `D) They earn identical fees`,
          ],
          correct: `C) It depends — Range B earns more when in range but spends more time out of range with ±15% moves`,
          hint: `±15% monthly move vs ±5% range: how often is Range B in range? Calculate the time and fee impact.`,
          explanation: `Range B (±5%) goes out of range 3x per month on ±15% moves. Assume 60% of time in range. Range B earns 10x more fees than Range A but only 60% of the time: effective multiplier = 6x. Range A earns lower fees but 100% of the time. If Range A earns $100/month, Range B earns $600/month but also requires more gas ($30-50/month in rebalancing) and has higher IL exposure. Net: Range B probably wins but by 4-5x, not 10x. For a $5,000 position on Ethereum mainnet (high gas): the gas might eat 20% of Range B's advantage. On Arbitrum: Range B wins clearly.`,
        },
      ],

      lessonSimulations: [
        {
          type: `range-strategy',
          scenario: `You're LP'ing $20,000 in ETH/USDC V3. Design three range strategies: (A) Conservative (V2-like, for passive investor). (B) Moderate (for semi-active investor checking weekly). (C) Aggressive (for full-time LP monitoring hourly). For each: range width, expected APY multiplier vs V2 baseline, management effort, and risk profile.`,
          answer: {
            conservative: `Range: ±50% from current price. Multiplier: ~2-3x V2. Effort: check monthly. Risk: low IL, low out-of-range risk. Appropriate for: set-and-forget crypto holders.`,
            moderate: `Range: ±10-15% from current price. Multiplier: ~8-15x V2. Effort: check weekly, rebalance ~2-3x/month. Risk: moderate IL, exits range during volatile weeks. Appropriate for: DeFi-active investors with time to manage weekly.`,
            aggressive: `Range: ±2-5% from current price. Multiplier: 50-200x V2. Effort: monitor hourly, rebalance daily or more. Risk: high IL, frequent out-of-range periods, significant gas costs. Appropriate for: professional LPs with automation/bots and $100K+ positions to justify gas.`,
          },
        },
        {
          type: `auto-compounder-comparison',
          scenario: `Gamma Strategies, Arrakis Finance, and Sommelier automatically manage V3 positions. Research one of them: what range strategy do they use? What is their fee? What is the advertised APY? Apply L1.10 (real yield) and L1.11 (risks) to this "V3-as-a-service" product.`,
          answer: `Example with Gamma: Strategy type: active rebalancing (adjusts range automatically when price exits). Fee: 10-20% of generated fees. Advertised APY: varies by pool, typically 1.5-3x V2 yield. Real yield test (L1.10): fees earned are real (from swap revenue), not emissions. The management fee is the cost. Risk assessment (L1.11): smart contract risk in Gamma's manager contract (additional attack surface vs raw V3). Oracle manipulation: potential if rebalancing logic uses manipulable price feeds. Key question: does the auto-management yield net of fees exceed what a passive V2 LP earns? Usually yes for volatile pairs, marginal for stablecoins.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: V3 LP Full Economics`,
        description: `L3.2–L3.3. Complete V3 LP analysis with real yield calculation.`,
        challenges: [
          {
            scenario: `$30,000 V3 ETH/USDC position. You're choosing between Ethereum mainnet and Arbitrum. Range: ±8% from current ETH price ($3,000). Pool stats: Ethereum mainnet — $200M in-range TVL, $50M daily volume, 0.3% fee. Arbitrum — $80M in-range TVL, $30M daily volume, 0.3% fee. Gas: mainnet $25/rebalance, Arbitrum $0.20/rebalance. Expected rebalances: 8/month. Calculate annualized fee yield, gas drag, and net APY for both chains. Where should you LP?`,
            answer: `Mainnet: Your share of in-range liquidity = $30K/$200M = 0.015%. Daily fees = $50M × 0.3% × 0.015% = $2.25/day. Annual = $821.25. Fee APY = 2.74%. Gas: 8 rebalances/month × $25 = $200/month = $2,400/year. Net APY: 2.74% − 8% (gas drag) = negative. Mainnet is uneconomical for $30K with 8 rebalances/month. Arbitrum: $30K/$80M = 0.0375%. Daily = $30M × 0.3% × 0.0375% = $3.375/day. Annual = $1,231. Fee APY = 4.1%. Gas: 8 × $0.20 = $1.60/month = $19.20/year. Net APY: 4.1% − 0.064% = ~4.04%. Arbitrum wins clearly. Mainnet $30K V3 LP is gas-destroyed. Move to Arbitrum where gas is 125x cheaper.`,
          },
        ],
      },

      keyTakeaway: `V3 concentrated liquidity: 10-4,000x more capital-efficient than V2, but positions go out of range when prices move — earning zero fees and requiring active rebalancing. The efficiency gain vs management cost trade-off makes V3 a job for active LPs and a potential trap for passive ones. V3 economics require: position size × APY >> gas costs. On Ethereum mainnet: $50K+ minimum for tight ranges. On L2s: $1K+ viable. V3 positions approach order-book limit orders at extreme concentration.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3.4 — UNISWAP V4
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'uniswap-v4',
      title: `3.4 Uniswap V4 — Programmable AMMs with Hooks`,
      subtitle: `V3 made LPs active. V4 makes the AMM itself programmable. Any logic, any fee structure, any behavior — all in a hook.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L3.3 you learned V3's concentrated liquidity. V4 doesn't change the underlying pricing math — it adds a plugin system called "hooks" that lets developers attach custom logic to any pool. This is the DeFi equivalent of moving from a fixed-function calculator to a programmable computer.`,

      hook: `V4 pools can have dynamic fees, on-chain limit orders, automatic rebalancing, and custom oracle logic — all without a new DEX. The AMM becomes a platform. Every DeFi primitive can now live inside a Uniswap pool.`,

      visualPrompt: `A Uniswap V4 pool in the center, with "hook" attachment points shown at four positions: before swap, after swap, before liquidity add, after liquidity add. Each hook point connects to example hook modules: dynamic fee calculator, TWAP oracle, auto-rebalancer, MEV protector. Caption: "Hooks turn a DEX into a DeFi platform."`,

      explanation: `Let me tell you about the upgrade that makes [Uniswap] programmable.

v2 was simple. v3 added concentrated ranges. V4 adds a plugin system: [hooks].

**What are hooks?**

[Hook] — a smart contract that executes custom logic at specific points in a V4 pool's lifecycle:
- beforeSwap: execute logic before a swap happens
- afterSwap: execute logic after a swap
- beforeAddLiquidity / afterAddLiquidity: execute on LP position changes
- beforeRemoveLiquidity / afterRemoveLiquidity: similar

A hook contract can do anything: adjust fees, update oracles, trigger rebalancing, implement MEV protection, or integrate with external protocols.

**The architectural innovation: Singleton contract**

V3: each pool is a separate smart contract. 1,000 pools = 1,000 contracts. Creating a pool costs significant gas. Moving between pools requires multiple contract calls.

V4: all pools live in one [Singleton contract]. Pool creation is a parameter change, not a new contract deployment. Moving between pools is one transaction touching one contract. Estimated gas savings: ~99% for factory deployments, 20-30% per swap.

[Flash accounting] — V4's complementary feature. Instead of transferring tokens after each swap, V4 uses an accounting system that only nets out token transfers at the end of a transaction. Multi-hop swaps (ETH → USDC → DAI → BTC) that previously required 3 separate token transfers now require 2 (just the net in/out).

**What hooks enable — examples:**

[Dynamic fee hooks] — fees that adjust based on volatility, time of day, or any on-chain signal. High volatility = higher LP fees (compensating for IL). Low activity = lower fees (attracting volume). AMM fees become market-responsive instead of static.

[On-chain limit orders] — hook that executes when price crosses a threshold. "Fill my 10 ETH sell order at $3,500." No off-chain component needed.

[Auto-rebalancing hooks] — LP positions that automatically adjust their range when price moves out. Eliminates the V3 management burden programmatically.

[TWAP oracle hooks] — custom price oracles embedded directly in pools with configurable time windows.

[MEV protection hooks] — batch auction designs or commit-reveal schemes reducing frontrunning.

**The DeFi platform thesis:**

V4 transforms Uniswap from "a DEX" to "a DEX platform" — any developer can add custom functionality without forking the core protocol. This creates a marketplace for pool designs competing on performance, fee structures, and features.

**Current status (as of writing):**

V4 launched in early 2024. The hook ecosystem is still developing. Most DeFi TVL remains in V2 and V3 while the V4 hook ecosystem matures. The design is technically sound — the research question is whether hook developers build compelling enough products to migrate liquidity.`,

      examples: [
        {
          title: `Dynamic fee hook — AMM that responds to volatility`,
          scenario: `A V4 pool with a volatility-based fee hook: base fee 0.05% during low volatility (competing with Curve for stable pairs). Volatility spikes (ETH drops 10% in an hour): hook automatically raises fee to 0.5% (compensating LPs for higher IL risk). Volume-based fee: off-peak hours (low volume, LPs undercompensated) → 0.1%. Peak hours (high volume, more competition for fees) → 0.3%. Result: LPs always earn fees proportional to the risk they're taking. Traders pay more during volatile periods. Both are better served than a fixed 0.3% that doesn't reflect conditions.`,
          lesson: `Dynamic fees align LP compensation with actual risk. A fixed 0.3% charges the same during calm and volatile markets — hooks can make AMM economics market-rational.`,
        },
        {
          title: `V4 singleton vs V3 factory — the gas math`,
          scenario: `V3: deploying a new MEMECOIN/ETH pool costs $500-2,000 in deployment gas. 1,000 new token launches per week × $1,000 average = $1M/week in pool creation gas. V4: creating a pool is just setting parameters in the singleton contract. Cost: ~$5-50 per pool. 1,000 pools × $25 = $25,000/week. Savings: $975,000/week. Per swap: V4's flash accounting saves 20-30% gas vs V3. On $1B daily volume at 0.1 ETH average gas per swap: 30% savings = 0.03 ETH per swap × average 500K daily swaps = 15,000 ETH/day saved. Gas savings are structural and compound at scale.`,
          lesson: `V4's singleton architecture is a massive infrastructure efficiency gain — especially for a long-tail token economy where thousands of new pools launch weekly. Lower creation costs = more experimentation.`,
        },
        {
          title: `Auto-rebalancing hook — solving V3's management problem`,
          scenario: `Maria's V3 problem from L3.3: her ±8% range requires 8 rebalances per month at $25 each = $200/month in gas (on mainnet). V4 hook solution: she sets up a V4 pool with an auto-rebalancing hook. The hook monitors her position and automatically rebalances when price exits range. Gas cost of the hook execution is bundled into the swap transaction that triggered the rebalance — paid by the trader, not Maria. Maria's out-of-pocket rebalancing gas: $0. She sets her preferred range once, and the hook maintains it perpetually.`,
          lesson: `V4 hooks can solve V3's management problem at the protocol layer — eliminating the manual management burden that makes V3 viable only for active LPs or large positions.`,
        },
      ],

      guidedPractice: [
        {
          question: `What is a Uniswap V4 hook?`,
          options: [
            `A) A fishing tool for finding undervalued pools`,
            `B) A smart contract that executes custom logic at specific points in a pool's lifecycle (before/after swaps, before/after liquidity changes) — enabling programmable AMM behavior`,
            `C) A governance mechanism for V4 fee changes`,
            `D) A bridge connecting V4 to other DEXes`,
          ],
          correct: `B) A smart contract that executes custom logic at specific points in a pool's lifecycle (before/after swaps, before/after liquidity changes) — enabling programmable AMM behavior`,
          hint: `Think of hooks as plugins or middleware in software — they intercept specific events and add custom behavior.`,
          explanation: `Hooks are callback contracts that Uniswap V4 calls at defined points in pool operations. A pool creator specifies which hooks apply. The hook can read pool state, execute logic, or modify behavior. This transforms the AMM from a fixed product into a programmable platform where developers compete on building the best pool logic.`,
        },
        {
          question: `V4 uses a singleton contract. How does this improve on V3's separate-contract-per-pool architecture?`,
          options: [
            `A) Singleton means only one pool can exist`,
            `B) Singleton reduces pool creation cost by ~99% and enables flash accounting — netting token transfers across multi-hop swaps in one transaction`,
            `C) Singleton makes V4 more decentralized`,
            `D) Singleton pools can't be exploited`,
          ],
          correct: `B) Singleton reduces pool creation cost by ~99% and enables flash accounting — netting token transfers across multi-hop swaps in one transaction`,
          hint: `V3: 1,000 pools = 1,000 separate contracts. V4: 1,000 pools = parameters in one contract. What does this change about creation cost and cross-pool efficiency?`,
          explanation: `V3 pool creation deploys a new Ethereum contract — expensive. V4 pool creation sets parameters in the existing singleton — cheap. Additionally, flash accounting means a 3-hop swap (ETH → USDC → DAI → WBTC) only nets out at the end: transfer ETH in, transfer WBTC out. The middle transfers never happen on-chain, saving 2x token transfer gas per intermediate hop.`,
        },
        {
          question: `A hook developer wants to build an "anti-sandwich" hook that protects users from MEV bots. When would this hook need to execute?`,
          options: [
            `A) afterSwap — to modify the output after the swap`,
            `B) beforeSwap — to check if the transaction looks like a sandwich attack and revert or adjust the trade before it executes`,
            `C) beforeAddLiquidity — to check LP credentials`,
            `D) afterRemoveLiquidity — to collect anti-MEV fees`,
          ],
          correct: `B) beforeSwap — to check if the transaction looks like a sandwich attack and revert or adjust the trade before it executes`,
          hint: `A sandwich attack happens before the victim's trade executes (frontrun) and after (backrun). To prevent it, when must you intervene?`,
          explanation: `Anti-sandwich logic must execute before the swap to detect suspicious ordering (is this transaction preceded by a large same-direction trade in the same block?) and either revert, delay, or adjust the transaction. afterSwap hooks can't undo damage already done. beforeSwap hooks have full power to prevent harmful execution.`,
        },
        {
          question: `Connecting to L3.3 (V3 active LP): what is the most significant management problem that a V4 auto-rebalancing hook would solve for V3-style positions?`,
          options: [
            `A) High impermanent loss`,
            `B) The requirement to manually monitor and rebalance positions when price exits the chosen range — costing gas and time`,
            `C) V4 hooks eliminate impermanent loss entirely`,
            `D) Hook manages governance token emissions`,
          ],
          correct: `B) The requirement to manually monitor and rebalance positions when price exits the chosen range — costing gas and time`,
          hint: `What was V3's biggest usability problem from L3.3?`,
          explanation: `V3's concentrated liquidity is only efficient when in range. When price exits, the LP earns zero and must manually rebalance — paying gas, monitoring prices, and timing entries. An auto-rebalancing hook executes this automatically, triggered by the swap that pushed price out of range. The rebalancing logic is part of the pool's execution, not an external management task. This could make V3-level capital efficiency accessible to passive LPs.`,
        },
        {
          question: `V4 launched in 2024. DeFi TVL is still mostly in V2 and V3. What's the most likely explanation, and what would drive migration?`,
          options: [
            `A) V4 is technically inferior to V2/V3`,
            `B) Hook ecosystem is still maturing — liquidity migrates when compelling hook features exceed the switching cost (gas, smart contract risk of new contracts, LPs learning new interfaces)`,
            `C) V4 is not EVM-compatible`,
            `D) V4 is not deployed yet`,
          ],
          correct: `B) Hook ecosystem is still maturing — liquidity migrates when compelling hook features exceed the switching cost (gas, smart contract risk of new contracts, LPs learning new interfaces)`,
          hint: `New DeFi versions always take 12-24 months to achieve full ecosystem adoption. What's needed for LPs to migrate?`,
          explanation: `V2 → V3 transition took 18+ months. V4's new risk vectors (hook smart contracts, new architecture) require audit coverage and time. Liquidity migrates when: compelling hooks provide meaningfully better yield or LP experience, major protocols integrate V4, and sufficient auditing reduces smart contract risk. The first compelling V4 hook products will accelerate migration — until then, V3's proven, audited code retains most liquidity.`,
        },
      ],

      lessonSimulations: [
        {
          type: `hook-design`,
          scenario: `Design a V4 hook for a stablecoin/stablecoin pool (USDC/USDT). Requirements: maximize LP yield by minimizing idle capital, protect against depeg events (if USDC depegs, limit damage), and minimize gas for LPs. Specify: which lifecycle points the hook uses, what logic executes, and what the expected outcome is for LPs vs a plain V3 pool.`,
          answer: {
            hookDesign: `beforeSwap hook: check USDC/USDT oracle price. If depeg detected (>0.5% deviation): raise fee to 2% (compensating LPs for IL risk during depeg), optionally pause large swaps (>$100K) to prevent LP drain. afterSwap hook: TWAP oracle update for accurate price tracking. beforeAddLiquidity: verify range is within stable zone (±0.5%), auto-suggest optimal range to new LPs. Auto-rebalancing: when price drifts outside ±0.1%, trigger rebalance automatically.`,
            vsV3: `Plain V3 stablecoin pool: fixed 0.01-0.05% fee, manual rebalancing. Hook-enabled pool: dynamic fees (higher during depeg risk = higher LP compensation), auto-rebalance (LP doesn't need to manage), depeg protection (circuit breaker limits LP exposure). LP result: higher yield during normal operations, protected during stress events.`,
          },
        },
        {
          type: `ecosystem-research`,
          scenario: `Research the current V4 hook ecosystem: find one deployed hook on Uniswap's docs or GitHub. What does it do? What pool type is it designed for? Has it been audited? Is there any TVL in V4 pools on DeFiLlama?`,
          answer: `Live research task. Search: "Uniswap V4 hooks" on GitHub/Uniswap docs. Expected finding: hook examples include dynamic fees, TWAP oracles, limit orders, geomean oracles. TVL on DeFiLlama: early stage, check current numbers. Key observation: V4 is deployed but the hook ecosystem is developer-facing currently — few production-grade hooks with significant liquidity. The research thesis: watch for the first hook that attracts $100M+ TVL — that's the signal that V4 ecosystem is maturing.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: V4 Strategy for a DEX Protocol`,
        description: `L3.1–L3.4. Design a complete DEX product using V4.`,
        challenges: [
          {
            scenario: `You're launching "OmniDEX" — a V4-powered DEX targeting three user segments: (1) retail swappers (<$1K), (2) professional LP managers ($100K+), (3) institutional traders ($1M+). Design: (A) The base V4 pool configuration. (B) Three hooks — one per user segment. (C) How OmniDEX monetizes without a traditional governance token (using V4 fee infrastructure). (D) What chain to deploy on and why (using L2.19 chain selection framework).`,
            answer: `Base configuration: Singleton V4 on Arbitrum. ETH/USDC as primary pool. 0.05% base fee. Hook A (retail): MEV protection hook (beforeSwap: commit-reveal scheme, batches small orders to eliminate frontrunning). Hook B (professional LP): auto-rebalancing hook (maintains optimal range, gas paid by protocol from fee revenue, reports APY real-time). Hook C (institutional): RFQ integration hook (afterSwap check: if order >$500K, route through RFQ solver network for better execution). Monetization: V4 hook fee on top of LP fee (0.01-0.05% goes to OmniDEX treasury per swap through specialty hooks). No governance token needed — revenue model is direct. Chain: Arbitrum. Reasoning from L2.19 — A+ security (Ethereum-backed), A fees ($0.10-0.30), A developer ecosystem, A+ TVL/liquidity. Gas savings critical for auto-rebalancing hook economics.`,
          },
        ],
      },

      keyTakeaway: `Uniswap V4 adds hooks (programmable callbacks at swap/LP lifecycle points) and a singleton architecture (99% cheaper pool creation, flash accounting for gas-efficient multi-hops). Hooks enable: dynamic fees, auto-rebalancing, on-chain limit orders, MEV protection — all without new DEX deployments. V4 transforms Uniswap from a DEX into a DEX platform. Current state: launched 2024, hook ecosystem maturing. Watch for first high-TVL hook product as the ecosystem maturity signal.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3.5 — CURVE STABLE SWAPS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'curve-stable-swaps',
      title: `3.5 Curve StableSwap — The Math That Rules Stablecoin Trading`,
      subtitle: `Uniswap loses 0.3% on a $10M stablecoin swap. Curve loses 0.02%. The math difference is worth billions.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L3.2–L3.4 you mastered Uniswap's x×y=k family. Curve uses entirely different math optimized for assets that should trade at equal value. Understanding when Curve's formula beats Uniswap's — and why — is essential for any serious DeFi researcher.`,

      hook: `In 2021, Curve processed more DEX volume than Uniswap by dollar value. Not because it had more users — because it captured all the institutional stablecoin trading that Uniswap's formula made too expensive. Different math for different assets isn't just technical elegance — it's billions in daily volume.`,

      visualPrompt: `Two bonding curves overlaid: x×y=k (hyperbola, steep at extremes) and StableSwap (nearly flat in the middle, steep at extremes). Current price marked at center. Large arrow labeled "$10M swap" — on x×y=k, moves price dramatically; on StableSwap, barely moves at all. Caption: "Near the price center, StableSwap is almost a straight line. That's where stablecoins live."`,

      explanation: `Let me tell you about the [DEX] that dominates [stablecoin] trading.

[Uniswap] works for everything. But for assets that SHOULD trade at the same price (USDC/USDT, stETH/ETH), its x × y = k formula creates unnecessary price impact.

Why? x × y = k assumes prices can range widely. Even in a USDC/USDT pool, the formula "expects" prices could go to 0 or infinity — spreading liquidity across the entire range. But USDC and USDT should always be $1. You don't need liquidity at $0.50 USDC.

**The StableSwap invariant:**

[StableSwap] combines two formulas:
- When prices are near equal: behaves like constant sum (x + y = k) — zero slippage
- When prices diverge significantly: transitions toward constant product (x × y = k) — prevents pool depletion

The blend is controlled by the [amplification parameter A]. High A → closer to constant sum (lower slippage, good for stable pairs). Low A → closer to constant product (more responsive to depeg scenarios).

[Amplification parameter (A)] — Curve's key parameter. A=100 for major stablecoins (USDC/USDT). A=10 for less stable pairs. A=2000+ for hyper-pegged pairs. Governance can adjust A, which changes the pool's slippage profile.

**The slippage comparison:**

$10M USDC → USDT swap:
- Uniswap V3 (USDC/USDT 0.01% pool): ~0.01-0.05% slippage (already concentrated)
- Curve 3pool (USDC/USDT/DAI): ~0.001-0.002% slippage

5-50x less slippage for correlated pairs. For $10M: the difference is $1,000-$5,000 per swap. Institutions making daily $100M stablecoin swaps save $10,000-50,000/day by routing through Curve.

**Beyond stablecoins — Curve's expansion:**

Curve's StableSwap applies to ANY near-equal assets:
- Liquid staking tokens (stETH/ETH, rETH/ETH)
- Wrapped assets (WBTC/BTC if comparable)
- Yield-bearing assets (aUSDC/USDC)

The stETH/ETH pool became one of DeFi's most important liquidity venues — enabling Lido's stETH to be efficiently exchanged for ETH, crucial for the liquid staking ecosystem (from L1.16).

**The veCRV model:**

From L1.15: Curve's fee distribution uses veCRV (vote-escrowed CRV). This creates a complex but powerful incentive system where:
- 50% of trading fees go to veCRV holders directly
- CRV emissions are directed by veCRV votes
- External protocols bribe veCRV holders to direct emissions to their pools

This economic model is as innovative as the StableSwap math itself.`,

      examples: [
        {
          title: `The stETH/ETH pool — critical DeFi infrastructure`,
          scenario: `Lido's stETH has a 7-day unstaking delay. Without Curve: if you want stETH → ETH before the 7 days, you'd need an inefficient swap on Uniswap with high slippage (stETH/ETH is near-1:1 but Uniswap's formula doesn't know that). With Curve's stETH/ETH pool: ~0.01% slippage on swaps, providing near-instant liquidity for a multi-billion dollar asset. The pool (peak: $6B+ TVL) made stETH liquid. Without it, stETH would have a meaningful peg discount — Lido's entire liquid staking model depended on Curve's efficient stETH/ETH exchange.`,
          lesson: `Curve's infrastructure is as important as the protocols it supports. Lido's $20B+ stETH ecosystem required Curve's efficient exchange to function. Curve is DeFi infrastructure, not just a DEX.`,
        },
        {
          title: `The Curve Wars — A veCRV explained`,
          scenario: `Protocol "FraxFinance" needs deep FRAX/USDC liquidity on Curve to make FRAX a usable stablecoin. More Curve liquidity = tighter spreads = more FRAX usage. To get liquidity: need CRV emissions directed to FRAX pool. To get CRV emissions: need veCRV votes. To get votes: bribe veCRV holders via Votium (e.g., $1M/week in FRAX tokens). If the FRAX pool generates $2M/week in additional FRAX usage value from better liquidity: the $1M bribe is worth paying. This is the "Curve Wars" — protocols competing for veCRV votes because the economic value of Curve liquidity is enormous. Convex Finance ($CVX) became a power broker by accumulating veCRV at scale and selling voting influence.`,
          lesson: `Curve's veCRV model made governance economically valuable in a way most protocols hadn't imagined. Controlling CRV emission direction = controlling DeFi liquidity allocation. This created an entire bribing economy worth hundreds of millions annually.`,
        },
        {
          title: `Curve vs Uniswap V3 — choosing the right DEX for your stablecoin`,
          scenario: `Maria wants to deploy $5M of USDC to earn yield on stablecoin trades. Uniswap V3 USDC/USDT 0.01% pool: ~0.01% fee, concentrated range needed, requires active management, ~8% APY from high volume but active effort. Curve 3pool: 0.04% fee rate but per-trade cost is tiny, passive LP (full range), ~3-5% APY from fees + CRV emissions (partially emission-based). For $5M passive: Curve wins on simplicity and consistency. For $5M active (someone managing V3): Uniswap V3 likely wins on yield. The choice reveals the V3 management trade-off from L3.3 repeated at stablecoin scale.`,
          lesson: `Curve's passive LP model is a genuine advantage for large institutional capital that doesn't want active management overhead. V3 wins on capital efficiency for active managers. Both can coexist.`,
        },
      ],

      guidedPractice: [
        {
          question: `Why does Curve's StableSwap formula produce dramatically less slippage than Uniswap's x×y=k for USDC/USDT?`,
          options: [
            `A) Curve has much more TVL than Uniswap for stablecoins`,
            `B) StableSwap is designed to behave like constant sum (zero slippage) near the 1:1 price point where stablecoins trade — unlike x×y=k which spreads liquidity across all prices including irrelevant ones like $0.01 USDC`,
            `C) Curve charges lower fees`,
            `D) Curve uses centralized market makers`,
          ],
          correct: `B) StableSwap is designed to behave like constant sum (zero slippage) near the 1:1 price point where stablecoins trade — unlike x×y=k which spreads liquidity across all prices including irrelevant ones like $0.01 USDC`,
          hint: `Where does the x×y=k formula concentrate liquidity? Where do stablecoins actually trade?`,
          explanation: `x×y=k distributes liquidity across all prices from 0 to ∞. For USDC/USDT: 99% of all trades happen within ±1% of $1.00. Uniswap wastes 99% of liquidity on price ranges that will never be used. StableSwap concentrates liquidity near the 1:1 point by behaving like x+y=k (zero slippage) near par. Slippage only appears when prices diverge significantly — exactly matching when stablecoin depeg risk actually materializes.`,
        },
        {
          question: `What does the amplification parameter A control in Curve pools?`,
          options: [
            `A) The fee percentage charged on trades`,
            `B) How closely the pool behaves like constant sum (low slippage) vs constant product (responding to depeg) — higher A = lower slippage near par, lower A = more slippage protection during depeg`,
            `C) The number of tokens allowed in the pool`,
            `D) The veCRV emission rate`,
          ],
          correct: `B) How closely the pool behaves like constant sum (low slippage) vs constant product (responding to depeg) — higher A = lower slippage near par, lower A = more slippage protection during depeg`,
          hint: `High A makes the pool "trust" that prices stay near equal. Low A makes the pool "skeptical" and react to price divergence. What's the trade-off?`,
          explanation: `A = amplification. A=100: pool behaves almost like a constant sum near par → very low slippage for normal trading. But if a stablecoin depegs, the pool drains much more rapidly than x×y=k would allow — less protection. A=10: more like x×y=k, slightly higher slippage but more resistant to rapid draining during depeg events. Governance sets A based on how trusted the stablecoin is — new/risky stablecoins get lower A.`,
        },
        {
          question: `Connecting to L1.15 (Curve Wars): why do protocols pay millions to bribe veCRV holders rather than just paying LPs directly to provide their own liquidity?`,
          options: [
            `A) Bribing is cheaper per unit of liquidity than direct incentives`,
            `B) Curve's CRV emissions are a subsidy that protocols access at the cost of a bribe — directing existing CRV emissions to their pool costs less than bootstrapping an equivalent incentive program`,
            `C) Direct LP incentives are illegal`,
            `D) veCRV holders require bribes by protocol`,
          ],
          correct: `B) Curve's CRV emissions are a subsidy that protocols access at the cost of a bribe — directing existing CRV emissions to their pool costs less than bootstrapping an equivalent incentive program`,
          hint: `What is Curve emitting? Who is already incentivizing LP provision? How do protocols tap into that existing subsidy?`,
          explanation: `Curve emits CRV tokens to LPs across all pools. These emissions are worth hundreds of millions annually. veCRV holders vote on which pools get more emissions. A protocol can: (A) build their own $10M/year LP incentive program, or (B) bribe veCRV holders $1M/year to direct Curve's existing $5M/year in CRV emissions to their pool. Option B is cheaper per unit of liquidity — they're accessing Curve's emission subsidy at a fraction of the direct cost. The math makes bribing economically rational.`,
        },
        {
          question: `Why is Curve's stETH/ETH pool considered critical DeFi infrastructure rather than just a trading venue?`,
          options: [
            `A) It has the most TVL in DeFi`,
            `B) It provides the liquidity layer that makes stETH "liquid" — without it, stETH holders can't exit positions before the 7-day unstaking period, making stETH less useful and depressing the entire liquid staking ecosystem`,
            `C) It's the only place to buy stETH`,
            `D) Curve created stETH`,
          ],
          correct: `B) It provides the liquidity layer that makes stETH "liquid" — without it, stETH holders can't exit positions before the 7-day unstaking period, making stETH less useful and depressing the entire liquid staking ecosystem`,
          hint: `From L2.13 (Stride liquid staking for Cosmos): what makes a liquid staking token actually "liquid"?`,
          explanation: `stETH's value proposition is earning ETH staking yield without the 7-day withdrawal lock. But "liquid" requires a venue to convert stETH back to ETH quickly. Without Curve's stETH/ETH pool: selling stETH on Uniswap would have massive slippage (x×y=k doesn't know they're near-equal). Curve's pool creates a near-zero-slippage exchange, making stETH genuinely liquid. Remove this pool and Lido's $20B+ stETH premium over locked ETH collapses — showing Curve as foundational DeFi infrastructure.`,
        },
        {
          question: `Connecting to L1.11 (risks): if USDC depegs to $0.90 during a banking crisis, what happens to a Curve 3pool LP (USDC/USDT/DAI)? How does the amplification parameter affect the impact?`,
          options: [
            `A) Nothing — Curve pools are stablecoin-protected`,
            `B) Arbitrageurs drain the pool of USDT and DAI in exchange for USDC (cheap USDC bought from the pool) — LP ends up holding mostly depegged USDC. High A amplifies the drain speed; lower A slows it.`,
            `C) Curve governance pauses the pool automatically`,
            `D) The LP exits at par because Curve guarantees $1`,
          ],
          correct: `B) Arbitrageurs drain the pool of USDT and DAI in exchange for USDC (cheap USDC bought from the pool) — LP ends up holding mostly depegged USDC. High A amplifies the drain speed; lower A slows it.`,
          hint: `From L1.9: if USDC depegs to $0.90, what does every rational market participant do with the Curve 3pool's USDT/DAI?`,
          explanation: `USDC at $0.90 means: the 3pool has "cheap" USDC mixed with $1.00 USDT/DAI. Arbitrageurs buy USDC from the pool (depositing USDT/DAI) to capture the $0.10 discount. Rapid drain of all USDT/DAI; LP left holding mostly $0.90 USDC. High A = pool drains faster (near-zero slippage near par means even small price differences cause large flows). This was observed during the SVB/USDC depeg in March 2023 — Curve 3pool LPs ended up with higher USDC exposure than intended. The amplification parameter is a key risk factor for stablecoin LPs.`,
        },
      ],

      lessonSimulations: [
        {
          type: `slippage-comparison`,
          scenario: `Calculate the slippage for a $5M USDC → USDT swap on: (A) Uniswap V3 0.01% pool with $200M in-range TVL. (B) Curve 3pool with $500M TVL. (C) A tiny AMM pool with $1M TVL (x×y=k). Show the math for each and explain why pool A vs B matters for institutional traders.`,
          answer: {
            uniswapV3: `Concentrated liquidity in 0.01% pool with $200M in-range: slippage ~0.01-0.03% on $5M. $5M cost: $500-1,500. Good but still meaningful for daily $100M flows.`,
            curve3pool: `StableSwap A=100 with $500M: slippage ~0.002-0.005% on $5M. Cost: $100-250. 5-10x cheaper than V3. For daily $100M institutional flow: saves $40,000-150,000 vs V3. Massively preferred.`,
            tinyAMM: `x×y=k with $1M TVL: $5M / $1M = 500% of pool size. Price impact formula: ~trade/pool = 5x slippage. Essentially drains the pool. Cost: $500,000+. Catastrophic.`,
            conclusion: `Pool size matters more than fee rate for slippage. Curve's specialized formula adds another 5-10x advantage on top. For institutional stablecoin volume: Curve is the only viable choice.`,
          },
        },
        {
          type: `veCRV-strategy`,
          scenario: `You hold 100,000 veCRV (locked for 4 years). Protocol FraxUSD wants you to vote for their FRAX/USDC pool in the weekly gauge vote. They're offering 0.5 FRAX per veCRV per week as a bribe. Calculate: annual bribe income, compare to the 50% fee share you earn from Curve trading fees (assume your veCRV represents 0.1% of total and Curve generates $5M/week in fees), and decide: is it worth selling your vote?`,
          answer: {
            bribeIncome: `0.5 FRAX × 100,000 veCRV × 52 weeks = 2,600,000 FRAX/year (~$2.6M if FRAX = $1).`,
            feeShare: `Your 0.1% of veCRV × $5M/week × 50% (fee share) = $2,500/week = $130,000/year.`,
            comparison: `Bribe ($2.6M) >> Fee share ($130K). Taking the bribe is 20x more valuable than the direct fee share. But: if you vote for FraxUSD pool, you forgo voting for pools that generate more fees (which would increase your fee share). Analysis: the bribe market is so competitive it pays far above underlying fee value. Take the bribe — this is why Convex Finance built a business around aggregating veCRV and monetizing voting power.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: Curve as DeFi Infrastructure`,
        description: `L3.1–L3.5. Analyze Curve's strategic position.`,
        challenges: [
          {
            scenario: `Map Curve's position in the DeFi ecosystem: (A) Which protocols DEPEND on Curve's liquidity for their core function? (B) If Curve's TVL dropped 80% (similar to Fantom in L2.16), which protocols would suffer most? (C) What does this tell you about Curve's moat vs Uniswap's moat? (D) If you had to choose between holding CRV or UNI tokens based on fundamental value (L1.13 analysis), which would you choose and why?`,
            answer: `(A) Protocols depending on Curve: Lido (stETH/ETH liquidity), Frax Finance (FRAX/USDC liquidity), MakerDAO (DAI liquidity), crvUSD (Curve's own stablecoin uses its own pools), Convex Finance (built entirely on Curve), many smaller stablecoin protocols. (B) If Curve TVL −80%: stETH would depeg from ETH (immediate Lido impact), FRAX would lose stable peg liquidity, DAI slippage would increase, Convex would lose most of its reason to exist. Systemic risk to stablecoin ecosystem. (C) Moats: Curve's moat = infrastructure dependency (protocols built on top). Uniswap's moat = brand recognition + long-tail token liquidity + developer ecosystem. Curve's moat is "stickier" — protocols that depend on it can't easily migrate. (D) CRV vs UNI: CRV has direct fee distribution (50% to veCRV — real yield from L1.10). UNI has no current fee distribution. Fundamental token value: CRV wins clearly based on cash flow. UNI wins on size of protocol and speculative fee switch thesis. For fundamental value: CRV.`,
          },
        ],
      },

      keyTakeaway: `Curve's StableSwap blends constant sum (near-zero slippage near par) with constant product (depeg protection) via the amplification parameter A. Result: 5-50x less slippage than Uniswap for correlated assets (stablecoins, LSTs). The stETH/ETH pool is critical DeFi infrastructure — making liquid staking actually liquid. veCRV model creates direct fee distribution (50% to lockers) and an emission-directing economy that spawned the Curve Wars. For institutional stablecoin volume: Curve is the only rational choice.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 3.6 — BALANCER WEIGHTED POOLS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'balancer-weighted-pools',
      title: `3.6 Balancer — Breaking the 50/50 Rule`,
      subtitle: `Uniswap requires equal value on both sides. Balancer pools can be 80/20, 98/2, or any split. This changes everything about how protocols bootstrap liquidity.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L3.2–L3.5 you mastered Uniswap V2/V3/V4 and Curve. All require balanced pools or near-equal assets. Balancer asks: what if the pool weights don't have to be 50/50? This single change enables entirely new use cases — from cheaper token launches to automated portfolio rebalancing.`,

      hook: `Every Uniswap LP must hold 50% ETH and 50% USDC. If ETH is 80% of your portfolio, you have to sell half to provide liquidity. Balancer lets you create an 80/20 ETH/USDC pool — providing liquidity while keeping your preferred exposure. Same pool mechanics, radically different portfolio math.`,

      visualPrompt: `Three pool configurations side by side: left (50/50 circle split evenly, labeled "Uniswap V2"), center (80/20 circle mostly blue, labeled "Balancer 80/20"), right (98/2 circle almost entirely blue, labeled "Liquidity Bootstrapping Pool"). Below each: pool TVL and price impact for same-size swap. Caption: "Asymmetric weights = asymmetric use cases."`,

      explanation: `Let me tell you about the [DEX] that lets you break the 50/50 rule.

[Uniswap] says every pool must be 50% of each token by value. [Balancer] says: why? What if an LP wants 80% exposure to ETH and 20% to USDC? Or a protocol wants to launch a token with 98% of the pool in their new token?

**The weighted pool formula:**

Balancer generalizes Uniswap's formula to support arbitrary weights.

Uniswap: x × y = k (implicit 50/50)
Balancer: x^w_x × y^w_y = k (where w_x + w_y = 1)

For an 80/20 pool (ETH = 80%, USDC = 20%): x^0.8 × y^0.2 = k

Result: the pool maintains the 80/20 value ratio as prices change. More ETH in the pool (by value) than USDC. An 80/20 ETH/USDC LP retains 80% ETH exposure vs 50% in Uniswap.

**Balancer pool types:**

[Weighted Pool] — any token combination, any weights (must sum to 100%), any number of tokens (up to 8). Create an ETH/BTC/AVAX/LINK portfolio that rebalances automatically via arbitrage.

[Multi-token pool] — e.g., 25% ETH, 25% BTC, 25% USDC, 25% LINK. Acts like a self-rebalancing index fund — when ETH rises, arbitrageurs sell ETH from the pool (rebalancing) and you collect fees. Your "index fund" pays you to rebalance it.

[Stable Pool] — equivalent to Curve's StableSwap for near-equal assets. Balancer v2 uses this for stablecoin pools, competing with Curve.

[Liquidity Bootstrapping Pool (LBP)] — a special pool type starting with heavy weight on the new token (e.g., 96% PROJECT, 4% USDC) and gradually shifting to 50/50 over a few days. Used for fair token launches.

**The LBP innovation:**

Traditional Uniswap V2 token launch: add $100K of NEW_TOKEN + $100K of USDC. Launch price set by ratio. Bots buy instantly, front-run, price spikes massively, team and early buyers dump on late buyers.

LBP token launch: start with 96% NEW_TOKEN / 4% USDC. Price starts high (because 96% is token, few USDC buyers can push price). As 96% shifts to 50% over 3 days: selling pressure gradually appears from the changing weights. Price discovery is more gradual — bots can't front-run a 3-day price decline. Fairer distribution.

[Weight shifting] — LBPs change the weights over time via smart contract. Each weight shift changes the price regardless of trading activity — creating a natural price decline that distributes tokens more widely.

**Balancer's unique LP economics:**

An 80/20 ETH/USDC LP has:
- 80% ETH exposure (vs 50% in Uniswap)
- Lower impermanent loss than 50/50 when ETH price changes (because you maintain ETH exposure)
- But still collects fees from all ETH/USDC trades through the pool

For protocols that want to provide liquidity without selling their governance token: create an 80/20 TOKEN/ETH pool — add liquidity while retaining 80% token exposure. Less dilution, same liquidity depth.`,

      examples: [
        {
          title: `80/20 TOKEN/ETH — the protocol liquidity strategy`,
          scenario: `Protocol "AlphaFi" launches ALPHA token. They want deep ALPHA/ETH liquidity but don't want to dump ETH (they're bullish) or sell lots of ALPHA (dilution). Traditional Uniswap V2: must provide 50% ALPHA + 50% ETH. For $1M liquidity: must have $500K ETH. 80/20 Balancer pool: $800K ALPHA + $200K ETH for the same pool depth (roughly). They retain 80% ALPHA exposure and only need 20% in ETH. Same market liquidity, 60% less ETH needed, 60% less dilution. AlphaFi can launch with $1M in liquidity by spending only $200K ETH instead of $500K.`,
          lesson: `80/20 pools are the standard for protocol-owned liquidity bootstrapping. Any governance token launch that wants to provide deep liquidity without excessive dilution uses weighted pools.`,
        },
        {
          title: `The self-rebalancing portfolio — earning fees while indexing`,
          scenario: `Maria creates a 25/25/25/25 ETH/BTC/LINK/AVAX Balancer pool with $100K. Over 6 months: ETH doubles (+100%), BTC up 50%, LINK flat, AVAX down 20%. Traditional index: rebalancing requires selling ETH, buying LINK and AVAX — costs gas and creates taxable events. Balancer pool: arbitrageurs do the rebalancing for you as prices change, paying 0.3% fees on each rebalance trade. Maria earns $2,400 in fees from rebalancing trades — equivalent to being paid to rebalance a portfolio index. IL vs hold: the underperformance of weaker assets causes some IL, but fees compensate. Net: roughly equivalent to the index with fee income on top.`,
          lesson: `Balancer pools are the first "yield-bearing index funds" in DeFi. Instead of paying management fees, the fund's rebalancing generates fee income for the LP.`,
        },
        {
          title: `Liquidity Bootstrapping Pool in practice — fair launch`,
          scenario: `Project "NewDEX" launches NDEX via LBP. Setup: 96% NDEX / 4% USDC. Starting price: $2.00 (implied by ratio). Over 72 hours, weights shift to 50/50: at 50/50, the same TVL implies a lower NDEX price. This creates a natural downward price pressure regardless of buying/selling. Day 1: whales who rush in at $2.00 get hurt as weights shift down. Day 2: price hits ~$1.20, early believers start buying. Day 3: price settles at ~$0.80 near true discovery. Distribution: 3,000 unique buyers over 72 hours vs typical 50 bots in a Uniswap V2 launch. The LBP structure mechanically resists front-running.`,
          lesson: `LBPs created DeFi's first fair-ish token launch mechanism. The natural price decline from weight shifting punishes bots who buy at launch price, while allowing gradual price discovery for a broader distribution.`,
        },
      ],

      guidedPractice: [
        {
          question: `What is the fundamental difference between a Uniswap V2 pool and a Balancer weighted pool?`,
          options: [
            `A) Uniswap V2 has no fees; Balancer charges fees`,
            `B) Uniswap V2 requires 50/50 value split; Balancer allows any weighting (80/20, 60/40, 98/2), changing LP exposure and impermanent loss profile`,
            `C) Balancer pools hold more tokens`,
            `D) Uniswap uses bonding curves; Balancer uses order books`,
          ],
          correct: `B) Uniswap V2 requires 50/50 value split; Balancer allows any weighting (80/20, 60/40, 98/2), changing LP exposure and impermanent loss profile`,
          hint: `What does "50/50" mean for a Uniswap LP? What does the weight change in Balancer?`,
          explanation: `Uniswap V2's x×y=k implicitly maintains equal value on both sides. If you provide $10,000 to a Uniswap ETH/USDC pool, you always hold ~$5,000 ETH value + $5,000 USDC value. Balancer's generalized formula allows any ratio: an 80/20 pool maintains 80% ETH value / 20% USDC value at all times. This means your exposure to ETH is 80% rather than 50% — changing both the IL profile and the capital efficiency of providing liquidity.`,
        },
        {
          question: `A protocol with a new governance token creates an 80/20 TOKEN/ETH Balancer pool. What is the primary reason to choose 80/20 over 50/50?`,
          options: [
            `A) 80/20 has lower fees for traders`,
            `B) 80/20 allows the protocol to provide liquidity while retaining 80% TOKEN exposure — requiring only 20% in ETH instead of 50%, reducing dilution and ETH requirement`,
            `C) 80/20 pools have higher APY`,
            `D) 80/20 is the only weight Balancer supports`,
          ],
          correct: `B) 80/20 allows the protocol to provide liquidity while retaining 80% TOKEN exposure — requiring only 20% in ETH instead of 50%, reducing dilution and ETH requirement`,
          hint: `If the protocol is bullish on their token, why would they want to hold 50% ETH instead of 80% TOKEN?`,
          explanation: `Protocol treasuries typically hold their own governance token as a primary asset. Creating a 50/50 TOKEN/ETH pool requires selling TOKEN (dilution) or holding large ETH. An 80/20 pool: for $1M in liquidity, you need $200K ETH + $800K TOKEN. You retain 80% of the price upside of your token, provide similar market depth, and use far less scarce capital (ETH) to do it.`,
        },
        {
          question: `What makes a Liquidity Bootstrapping Pool (LBP) a fairer token launch mechanism than a standard Uniswap V2 pool?`,
          options: [
            `A) LBPs have no front-running risk because Balancer is faster than Uniswap`,
            `B) The shifting weights create natural price decline pressure, making bot front-running on launch day unprofitable and allowing gradual price discovery over 2-4 days`,
            `C) LBPs require KYC so bots can't participate`,
            `D) LBPs only allow small purchase sizes`,
          ],
          correct: `B) The shifting weights create natural price decline pressure, making bot front-running on launch day unprofitable and allowing gradual price discovery over 2-4 days`,
          hint: `Why is buying on Day 1 of an LBP risky even if you're early? What happens to price regardless of buying pressure?`,
          explanation: `LBP starts at 96% TOKEN → shifts to 50/50 over days. The weight shift alone creates downward price pressure (fewer tokens needed in the pool as weight decreases). If a bot buys 1 million tokens at launch price ($2.00), the price it paid ($2.00) will be above the natural price after weight shifts ($0.80-1.20 range). The bot must sell before weights fully shift or take a loss. This mechanical structure makes Day-1 speculation costly, distributing tokens to buyers who enter at various price points during the discovery period.`,
        },
        {
          question: `How does a Balancer multi-token pool (e.g., 25/25/25/25 ETH/BTC/LINK/AVAX) function as a self-rebalancing index fund?`,
          options: [
            `A) The pool automatically buys the cheapest asset each day`,
            `B) When one asset appreciates (breaking the balance), arbitrageurs sell it to the pool and buy underperforming assets — paying fees to LPs in the process, effectively rebalancing the portfolio for free`,
            `C) Balancer's smart contract makes daily trades`,
            `D) Users vote to rebalance the pool`,
          ],
          correct: `B) When one asset appreciates (breaking the balance), arbitrageurs sell it to the pool and buy underperforming assets — paying fees to LPs in the process, effectively rebalancing the portfolio for free`,
          hint: `When ETH doubles, the pool's ETH weight becomes >25%. What do arbitrageurs do? Who profits?`,
          explanation: `If ETH doubles: the pool is now 40% ETH, 20% each of the others (by value). Arbitrageurs see: pool's ETH is cheap relative to external price (pool hasn't adjusted yet). They sell ETH to the pool at a small profit, rebalancing it back toward 25%. LPs earn 0.3% on every rebalancing trade. The "management" of the index portfolio is done by profit-seeking arbitrageurs who pay the LP for the privilege. Traditional index funds charge 0.1-0.5%/year for this service. Balancer pays you for it.`,
        },
        {
          question: `Connecting to L3.2 (V2 IL): does an 80/20 ETH/USDC Balancer pool have more or less impermanent loss than a Uniswap V2 50/50 ETH/USDC pool when ETH doubles?`,
          options: [
            `A) Same IL — both use AMM math`,
            `B) Less IL — the 80/20 pool maintains 80% ETH exposure, so when ETH doubles, the pool is already "weighted" toward the winning asset, reducing the rebalancing loss`,
            `C) More IL — weighted pools amplify losses`,
            `D) Weighted pools have zero IL`,
          ],
          correct: `B) Less IL — the 80/20 pool maintains 80% ETH exposure, so when ETH doubles, the pool is already "weighted" toward the winning asset, reducing the rebalancing loss`,
          hint: `IL comes from the pool rebalancing toward the underperforming asset. If you start with 80% ETH, how much rebalancing happens when ETH goes up?`,
          explanation: `V2 50/50 pool when ETH 2x: pool must rebalance from 50/50 to 67% ETH / 33% USDC by value (selling ETH to arbitrageurs, buying USDC). IL ≈ 5.7%. Balancer 80/20 pool when ETH 2x: pool must rebalance from 80/20 to... it stays closer to 80/20 because the weights explicitly target 80% ETH. Less rebalancing = less IL. Approximate IL for 80/20 when ETH 2x: ~1.5-2%. Lower IL means less compensation needed from trading fees — weighted pools are more LP-friendly for asset-biased positions.`,
        },
      ],

      lessonSimulations: [
        {
          type: `pool-design',
          scenario: `Design an optimal Balancer pool for each use case: (A) A protocol that holds 10,000 ETH in treasury and wants to generate yield without selling ETH. (B) A new token "NOVA" launching with a $2M sale over 5 days to the public. (C) A DAO that wants to hold a DeFi index (ETH, LINK, AAVE, CRV equally) and earn yield on rebalancing.`,
          answer: {
            A: `80/20 ETH/USDC pool. Deploy $10,000 ETH as 80% weight + $2,500 ETH worth of USDC as 20% (or use existing USDC from treasury). Earn swap fees on ETH/USDC trades while maintaining 80% ETH exposure. Protocol keeps ETH bullish position while generating real yield from fees.`,
            B: `LBP starting at 97% NOVA / 3% USDC over 5 days, shifting to 50/50. Starting price set higher than expected fair value. Natural price decline over 5 days creates fair distribution. Prevents bots from front-running launch. Raises USDC for the protocol treasury as buyers enter throughout the 5-day window.`,
            C: `25/25/25/25 ETH/LINK/AAVE/CRV weighted pool. Earns 0.3% fees on all rebalancing trades as portfolio drifts. Self-managing index — no DAO governance needed for rebalancing. Fee income offsets management costs. Historical return: ~equal to index + fee income from rebalancing volatility.`,
          },
        },
        {
          type: `research-task`,
          scenario: `On DeFiLlama, find Balancer's TVL and compare to Uniswap. On Balancer's app (app.balancer.fi), find the largest weighted pool by TVL. What are the weights? What is the fee rate? What is the 24h volume and implied APY from fees? Is this primarily a governance token liquidity pool, index fund, or LBP?`,
          answer: `Live research task. Expected finding: Balancer TVL likely $500M-$1.5B vs Uniswap's $4-6B. Largest pool likely: BAL/ETH 80/20 (Balancer's own governance token pool) or a major stablecoin pool. Fee rate: typically 0.1-0.5% for weighted pools. APY calculation: 24h volume × fee rate × 365 / TVL. Classification: BAL/ETH 80/20 = governance token liquidity strategy. Multi-token with stables = index fund. New token pool with high initial weight = LBP phase.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: AMM Deep Dive — Comparing All Five Models`,
        description: `L3.2–L3.6. Compare V2, V3, V4, Curve, and Balancer for a specific use case.`,
        challenges: [
          {
            scenario: `A new stablecoin project "StableX" (pegged to $1) wants to launch with $10M in initial DEX liquidity. Compare all five AMM designs (Uniswap V2, V3, V4, Curve, Balancer) for this use case. For each: fee structure appropriate for stablecoins, slippage profile, LP complexity, launch mechanics, and long-term sustainability. Recommend one with full justification.`,
            answer: `V2: 0.3% fee (too high for stablecoins, kills volume to Curve). 50/50 required (protocol must hold $5M other stablecoin). Passive LP. No special launch mechanics. Bad for stablecoins. V3: 0.01% fee pool, concentrated in ±0.1% range, ~0.001% slippage. Active management required. Near-Curve efficiency but requires constant rebalancing. Works but complex. V4: V3 mechanics + hooks for dynamic fees, auto-rebalancing. Best technical option but ecosystem immature. Good for future. Curve: StableSwap A=50-100 for new stablecoin. 0.04% fee, near-zero slippage. Passive LP. Can apply for gauge (CRV emissions). Most battle-tested for stablecoins. But must fight for Curve liquidity via veCRV bribes ($1M+/year). Balancer: Stable Pool equivalent to Curve. Can create asymmetric pool (80% StableX, 20% USDC) to minimize USDC requirement. Good for bootstrap. Less liquidity than Curve currently. Recommendation: Curve for maximum stablecoin legitimacy and slippage profile. Apply for gauge, start bribing veCRV. Add Balancer 80/20 for efficient bootstrapping. V4 for future (once ecosystem matures). V2 never — wrong tool for stablecoins.`,
          },
        ],
      },

      keyTakeaway: `Balancer's weighted pools generalize the AMM formula to any token weight distribution. 80/20 pools let protocols provide liquidity while retaining asset exposure, reducing dilution and capital requirement vs 50/50. Multi-token pools create self-rebalancing index funds that earn fees instead of paying management costs. LBPs enable fairer token launches via weight-shifting price decline. For DeFi researchers: Balancer is the protocol liquidity bootstrapping tool; Curve is the stablecoin liquidity tool; Uniswap is the retail spot trading tool — each optimal for its category.`,
    },

  ],
}
