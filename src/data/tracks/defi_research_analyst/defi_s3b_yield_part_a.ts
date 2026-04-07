// ============================================================================
// DeFi RESEARCH CURRICULUM — SECTION 3B: YIELD & LIQUIDITY DEEP DIVE (Part A)
// Lessons: sources-of-yield → concentrated-liquidity-strategies
// ============================================================================

export const yieldLiquidityPartA = {
  id: 'yield-liquidity-a',
  lessons: [

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.1 — SOURCES OF YIELD
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'sources-of-yield',
      title: `6.1 Sources of Yield — Where Every APY Actually Comes From`,
      subtitle: `Trading fees, lending interest, emissions, and points. Four sources. Only two are real. Here's how to tell them apart in 60 seconds.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L1.10 (Introduction to Yield) you learned the high-level framework: real yield vs emission yield. This Section 3B deep dive goes further — showing exactly where each yield source originates, how to calculate its sustainability, and how to stack sources without compounding risk.`,

      hook: `Protocols have advertised 1,000% APY. Researchers have earned 2% and called it a win. The difference isn't luck — it's knowing which of the four yield sources is powering each opportunity. One source can disappear overnight. Two will outlast any bear market.`,

      visualPrompt: `Four columns labeled "Trading Fees," "Lending Interest," "Token Emissions," "Points/Airdrops." Beneath each: a faucet icon. Fees and Lending faucets flow steadily (labeled "Real — comes from economic activity"). Emissions faucet drips a token falling in price (labeled "Inflationary — fades with token"). Points faucet shows a question mark (labeled "Speculative — unknown value until airdrop"). Caption: "Know which faucet you're drinking from before you build a yield strategy."`,

      explanation: `Let me tell you about the question every DeFi researcher asks.

You see a protocol offering 20% [APY]. Your bank offers 0.01%. What explains the gap — and is it real?

In [TradFi], yield comes from economic activity: businesses borrow to grow, pay interest, banks lend your savings at higher rates. The yield is real because it comes from real value creation.

In [DeFi], there are four distinct sources of yield. Each behaves differently, carries different risk, and has a different sustainability profile.

**Source 1: Trading Fees — The Most Reliable Real Yield**

[Trading fees] come from swap activity on DEXes. When someone exchanges USDC for ETH on Uniswap, they pay 0.05-0.3% of the trade value. That fee flows to liquidity providers in proportion to their pool share.

Real? Yes. Sustainable? As long as people trade. Sizing the opportunity: if a pool generates $1M in daily volume at 0.3% fee: $3,000/day = $1.095M/year. If the pool has $10M TVL: sustainable fee APY = 10.95%. This is purely real — no tokens minted, no printing.

**Source 2: Lending Interest — Market-Driven Real Yield**

[Lending interest] comes from borrowers paying to access capital. On Aave, you deposit USDC, borrowers pay 5-15% interest depending on utilization. You receive most of that interest minus the protocol's reserve factor.

Real? Yes. Cyclical? Yes — rates compress in bear markets when leverage demand falls, spike in bull markets. From L1.8: [utilization rate] drives rates algorithmically. High demand = high rates = high real yield.

**Source 3: Token Emissions — Inflationary, Time-Limited**

[Token emissions] are governance tokens minted by protocols and distributed to users as incentives. "Here are 1,000 FAST tokens per day for using our protocol." The problem: more tokens minted means more supply, means lower price, means the yield you calculated last week has already deflated.

The [real yield test] from L1.10: if all emissions stopped today, would the protocol still generate yield? No → it was entirely inflationary. Many "high APY" opportunities are near-100% emissions that collapse to real yield (2-5%) within months.

**Source 4: Points and Airdrops — Speculative**

[Points programs] award off-chain points redeemable for future token airdrops. APY-equivalent is unknown until the airdrop (if it happens, at the token's launch price, subject to vesting).

Speculative but not worthless: Arbitrum's airdrop rewarded early users with tokens worth $1,000-$12,000 each. The risk: the airdrop may not happen, the token may launch at low prices, or you may be filtered for sybil behavior.

**The Sustainability Formula:**

Sustainable real APY = (Annual Protocol Revenue from Real Sources) ÷ TVL

For a DEX: Annual Trading Fees ÷ TVL
For a lending protocol: Annual Lending Interest Captured by Protocol ÷ TVL

Any APY above this formula must come from emissions or unsustainable subsidies.`,

      examples: [
        {
          title: `Decomposing a 45% APY offer`,
          scenario: `Protocol "FastYield" offers 45% APY on ETH: 38% from FAST token emissions, 7% from real trading fees. After 4 months: FAST drops 85% in price (emission farming → sell pressure). Real APY earned: 7% real + (38% × 15% remaining FAST value) = 7% + 5.7% = 12.7% gross. Subtract: gas costs, time monitoring, and the opportunity cost of holding depreciating FAST. Net: roughly 8% — not the 45% advertised. The 7% real yield floor was the only durable part.`,
          lesson: `Always decompose advertised APY into real yield and emission yield before committing capital. The real yield floor is what you can count on when the emission cycle ends.`,
        },
        {
          title: `Stacking yield sources correctly`,
          scenario: `Priya builds a stacked yield position: deposits stETH on Aave (4% lending interest — real). Uses borrowed USDC to LP on Curve 3pool (6% swap fees — real). Plus Curve CRV emissions on the LP position (3% — emission, sells immediately). Total: 4% + 6% + 3% sold = 13% gross. Risk: she's now leveraged (borrowed against stETH). If stETH depegs sharply, the Aave position approaches liquidation. The stacked yield is real — but the leverage amplifies the tail risk.`,
          lesson: `Stacking yield sources multiplies both yield and risk. Each layer adds a new failure mode. Always trace the full risk chain before adding a layer — especially leverage.`,
        },
        {
          title: `Points program expected value`,
          scenario: `Jake spends 3 months interacting with a pre-launch protocol that has a points system. His 50,000 points represent 0.05% of total points issued. Protocol launches with $200M FDV: 10% to community airdrop = $20M. His 0.05% = $10,000 gross. After 6-month vesting: $10,000 in tokens. If the token drops 70% (common for new launches): $3,000. Risk-adjusted expected value: $3,000-$10,000. Time invested: 3 months of weekly interactions. Implicit hourly rate: $25-83/hour plus the underlying asset risk.`,
          lesson: `Points programs have calculable expected value once you know total points issued and the protocol's funding/valuation. Calculate before committing — don't farm blindly.`,
        },
      ],

      guidedPractice: [
        {
          question: `A protocol reports $500M TVL and $25M in annual protocol revenue. What is the maximum sustainable real yield APY for depositors?`,
          options: [`A) 5%`, `B) 2%`, `C) 10%`, `D) 50%`],
          correct: `A) 5%`,
          hint: `Sustainable yield = Annual Revenue / TVL. $25M / $500M = ?`,
          explanation: `$25M / $500M = 5%. Any advertised APY above 5% must come from token emissions or unsustainable subsidies that will eventually end. The 5% is the real yield floor — what remains when all incentives stop.`,
        },
        {
          question: `A lending protocol's supply APY was 12% in bull market 2021, then fell to 2% in bear market 2023. The protocol didn't change. Why?`,
          options: [
            `A) The team reduced rates to hurt depositors`,
            `B) Utilization rate dropped — fewer borrowers in the bear market means less interest paid means lower supply yields`,
            `C) The TVL grew too large`,
            `D) Token emissions were cut`,
          ],
          correct: `B) Utilization rate dropped — fewer borrowers in the bear market means less interest paid means lower supply yields`,
          hint: `From L1.8: utilization rate drives lending rates. What happens to borrow demand in a bear market?`,
          explanation: `Lending rates are market-driven: high leverage demand (bull) = high utilization = high rates = high yield. Low leverage demand (bear) = low utilization = rates fall algorithmically. The mechanism is always real — the rate just reflects the market's appetite for borrowing. Plan for bear market rates when estimating lending yield over a full cycle.`,
        },
        {
          question: `Token emissions offer 200% APY. The emitted token drops 90% over 6 months. What is the approximate real APY?`,
          options: [`A) 200%`, `B) 20%`, `C) 110%`, `D) 200% minus 90% = 110%`],
          correct: `B) 20%`,
          hint: `Your emission yield is: 200% × (1 - 90% drop) = 200% × 10% of original value remaining.`,
          explanation: `If you received 200% APY in tokens and those tokens lost 90% of their value: your real return = 200% × 10% = 20% of original capital. This is why selling emitted tokens immediately (rather than holding) is the standard practice — you lock in value before further depreciation. Holding emission tokens is a separate directional bet on that token, not a yield strategy.`,
        },
        {
          question: `Connecting to L3.12 (DEX metrics): a DEX has $1B TVL and $100K daily trading fees. What is the annual fee APY for LPs?`,
          options: [`A) 3.65%`, `B) 10%`, `C) 36.5%`, `D) 0.01%`],
          correct: `A) 3.65%`,
          hint: `Annual fees = $100K × 365. APY = Annual Fees / TVL.`,
          explanation: `Annual fees: $100K × 365 = $36.5M. APY = $36.5M / $1,000M = 3.65%. This is the real yield floor for this DEX's LPs. If the protocol advertises 15% APY, the extra 11.35% must come from token emissions. At $1B TVL: 3.65% real yield is modest but sustainable indefinitely. The high TVL relative to volume suggests low capital efficiency — a pool with less TVL and similar volume would generate higher per-LP APY.`,
        },
        {
          question: `Which yield source is structurally guaranteed to continue regardless of token price movements?`,
          options: [
            `A) Token emissions`,
            `B) Points programs`,
            `C) Trading fees — they come from actual user activity, not token printing`,
            `D) Governance incentives`,
          ],
          correct: `C) Trading fees — they come from actual user activity, not token printing`,
          hint: `The real yield test: if all token emissions stopped today, what yields would persist? Which source doesn't require minting new tokens?`,
          explanation: `Trading fees and lending interest are structural — they come from economic activity (people swapping tokens, people borrowing capital) that exists independent of any governance token price. Emissions collapse when token price falls. Points may never arrive. Trading fees on a DEX with genuine volume exist as long as volume exists. They're the only yield source completely decoupled from tokenomics.`,
        },
        {
          question: `Jake earns 8% from swap fees and 12% from QUICK emissions on a QuickSwap LP. He sells all QUICK immediately as earned. What is his effective real yield rate?`,
          options: [`A) 20%`, `B) 8%`, `C) 12%`, `D) 8% plus market value of sold QUICK`],
          correct: `D) 8% plus market value of sold QUICK`,
          hint: `If Jake sells QUICK immediately, he converts emission yield to cash at current market price. That IS realized yield — the question is whether QUICK's price holds.`,
          explanation: `By selling QUICK immediately, Jake converts his emission yield to cash — avoiding the risk of holding a depreciating token. His effective yield: 8% structural (fees) + whatever QUICK was worth when he sold it. If QUICK holds value: close to 20%. If QUICK depreciates while he sells: less. The immediate-sell strategy is the professional approach — separate the yield question (how much do I earn?) from the token question (do I want QUICK exposure?).`,
        },
      ],

      lessonSimulations: [
        {
          type: `yield-decomposition`,
          scenario: `Analyze three real yield opportunities using DeFiLlama yields page. For each: (A) Uniswap V3 ETH/USDC 0.05% pool on Arbitrum, (B) Aave V3 USDC supply on Arbitrum, (C) A new protocol with 80% APY on USDC. Classify: what % is real yield (fees/interest), what % is emissions, what % is points? Calculate the real yield floor for A and B. For C: what information would you need to classify it?`,
          answer: {
            A: `Real yield: 100% from trading fees. Real yield floor = 24h fees × 365 / TVL (check live). Typical Arbitrum USDC/ETH 0.05%: 8-15% APY in active market. Zero emissions dependency.`,
            B: `Real yield: 100% from lending interest. Rate = f(utilization). Typical Aave V3 USDC Arbitrum: 4-8%. Cyclical — higher in bull, lower in bear. Zero emissions dependency.`,
            C: `Need to know: (1) What protocol is it? (2) What percentage of the 80% is their native token emissions vs actual fees/interest? (3) What is the token's vesting schedule? Without this: assume worst case — near-100% emissions. Real floor likely 2-5%.`,
          },
        },
        {
          type: `yield-stack-design`,
          scenario: `Design a $20,000 yield stack using exactly three yield sources. Target: 8-12% blended real yield. Constraints: max 50% from any single source, no leveraged positions, all must pass the real yield test. Show the allocation, yield source for each, and estimated APY.`,
          answer: `Example: $8,000 Curve stETH/ETH pool (real: swap fees 3% + stETH staking ~3.5% embedded = 6.5%). $7,000 Aave V3 USDC on Arbitrum (real: lending interest 4-6%). $5,000 Uniswap V3 ARB/ETH ±10% range on Arbitrum (real: swap fees 8-15% when in range). Blended: roughly 7-10% real yield. All three pass real yield test. No leverage. Three distinct mechanisms (trading fees, lending interest, trading fees on different pair/chain). Total across three sources = diversified against single-mechanism failure.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Full Yield Audit`,
        description: `Combining L1.10 (yield framework) + L6.1 (sources deep dive). Real yield detective work on a live protocol.`,
        challenges: [
          {
            scenario: `GMX on Arbitrum advertises: GLP stakers earn 15-25% APY in ETH (from trading fees), GMX stakers earn 8-12% in esGMX + multiplier points, and the GLP pool earns additional yield during high volatility events. Decompose: (A) Which components are real yield? (B) Which are emission? (C) What is GMX's sustainable real yield floor? (D) Which position (GLP vs GMX staking) is better for someone who wants purely real yield?`,
            answer: `A — Real yield components: GLP stakers' ETH income = real (comes from traders paying fees and losses absorbed by GLP pool). During volatility: traders lose more → GLP earns more. Directly real from economic activity. B — Emission: esGMX (escrowed GMX) rewards are effectively emissions — GMX tokens locked and vested over 1 year. Multiplier points boost esGMX yield but are not cash flow. C — Sustainable real floor: GLP real yield = Total GMX trading fees × LP share / GLP TVL. Historical GMX fees: $80-150M/year. GLP TVL: $400-600M. Real yield floor: 13-37% — unusually high because it's genuine real yield from trader activity. D — For pure real yield: GLP wins clearly. GLP earns ETH directly from trading activity. GMX staking's esGMX is a 1-year locked emission. GLP is one of DeFi's strongest real yield positions.`,
          },
        ],
      },

      keyTakeaway: `Four yield sources: trading fees (real, structural), lending interest (real, cyclical), token emissions (inflationary, time-limited — sell immediately or discount heavily), points/airdrops (speculative). Real yield = annual economic revenue / TVL. Any APY above this calculation requires emissions. The real yield floor is what survives the next bear market. Build yield stacks from the floor up — not from the headline down.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.2 — LIQUIDITY PROVIDING BASICS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'liquidity-providing-basics',
      title: `6.2 Liquidity Providing Basics — Being the House`,
      subtitle: `When you LP, you're not gambling. You're running the casino. Here's exactly what that means, what you earn, and what can go wrong.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.1 you learned that trading fees are the most reliable real yield source. This lesson teaches the mechanics of becoming the person who earns those fees — providing liquidity to an AMM pool and understanding the complete economics before the first deposit.`,

      hook: `Every swap on Uniswap earns fees for the LP. Every single one. 24/7, no credit check, no account, no minimum. But unlike a casino, the house can lose when prices move. That loss has a name: impermanent loss. Understanding it before you deposit is the difference between profit and confusion.`,

      visualPrompt: `A pool diagram: two token buckets (ETH and USDC) connected in the center. Arrows show: traders swap in/out (paying fees), LP deposits tokens (receives LP tokens), LP later withdraws (gets back tokens + fees). A small warning label on the withdrawal arrow: "May contain more of the cheaper asset than you started with." Caption: "The LP earns every swap fee. The LP also rebalances automatically — sometimes at a loss."`,

      explanation: `Let me tell you about being the house.

In a casino, the house doesn't gamble. It provides the tables, takes a cut of every game, and profits from volume. In [DeFi], [liquidity providers] (LPs) are the house — they provide the tokens that make swaps possible, and earn a fee on every swap.

**What LPs actually do:**

[Liquidity Provider (LP)] — someone who deposits token pairs into an AMM pool, enabling other users to swap. In return: the LP receives a proportional share of all swap fees generated in that pool.

On [Uniswap V2]: deposit an equal dollar value of two tokens (e.g., $5,000 ETH + $5,000 USDC). Receive LP tokens representing your pool share. Every swap in that pool earns you 0.3% proportional to your share. Withdraw anytime: redeem LP tokens for pool assets plus accumulated fees.

**The mechanics of earning:**

Your share of fees = (Your pool share %) × (Total fees generated)

Example: you provide 1% of a pool that generates $10,000/day in fees. Your daily fee income: $100. Annual: $36,500 = 36.5% APY on $100,000 invested.

The fee is real — it comes from traders paying to use your capital. No token printed.

**What you're actually holding:**

When you LP in an ETH/USDC pool: you don't hold specific amounts of ETH or USDC. You hold a *share of the pool*. The pool's ratio changes as prices move (arbitrageurs rebalance it). When ETH goes up: the pool sells ETH (rebalancing), leaving you with more USDC and less ETH than you started with. When ETH goes down: the pool buys ETH, leaving you with more ETH and less USDC.

[Impermanent Loss (IL)] — the cost of this automatic rebalancing. You end up with a different asset mix than you started with, and that mix is worth less than if you'd just held both assets separately. Covered in depth in L6.3.

**The LP profit equation:**

LP profit = Fee income − Impermanent Loss

Profitable LP: fees > IL (high-volume pairs, stable prices)
Unprofitable LP: IL > fees (low-volume pairs, high volatility)

**What makes a good LP pair:**

High volume: more swaps = more fees. Volume matters more than TVL.
Low volatility: price stability reduces IL. Stablecoin pairs have near-zero IL.
Appropriate fee tier: 0.01% for stablecoins (high volume compensates), 0.3% for general pairs, 1% for exotic/volatile tokens.

**The LP token:**

[LP token] — the receipt for your pool share. Transferable, usable as collateral in some protocols (Aave accepts some LP tokens). Fungible in V2 (all same-range positions identical), unique NFTs in V3 (each position has a custom range).`,

      examples: [
        {
          title: `Running the LP math before depositing`,
          scenario: `Jake wants to LP in the ETH/USDC Uniswap V3 0.05% pool on Arbitrum. Current pool stats: $80M TVL, $40M daily volume. Fee tier: 0.05%. His planned deposit: $10,000 (split equally). His pool share: $10K / $80M = 0.0125%. Daily fees to Jake: $40M × 0.05% × 0.0125% = $2.50/day. Annual: $912.50. Fee APY: $912.50 / $10,000 = 9.1%. Range: ±8% from current price. Expected time in-range: ~70% of days (ETH moves ±8% roughly 30% of the time). Effective APY: 9.1% × 70% = 6.4% net of out-of-range periods. Before IL. This is the pre-IL profit — he still needs to estimate impermanent loss from L6.3 to get the full picture.`,
          lesson: `Run the LP math before depositing. Volume and your pool share determine fee income. Factor in time in-range for V3. Then subtract expected IL (next lesson). Never deposit based on the advertised APY without doing this calculation yourself.`,
        },
        {
          title: `LP tokens as collateral — compounding yield`,
          scenario: `Maria provides liquidity to Curve's stETH/ETH pool and receives cvxCRV LP tokens via Convex Finance. She deposits those LP tokens on a lending protocol (some protocols accept LP tokens as collateral). She borrows USDC against her LP position and deploys the USDC in another yield strategy. Net result: she earns curve swap fees + CRV/CVX rewards + lending yield on borrowed USDC — all from one pool deposit. Risk: if stETH depegs significantly, her LP token value drops → approaches liquidation on the lending protocol.`,
          lesson: `LP tokens are productive assets — they can be used as collateral to access more capital. But each additional layer multiplies the risk. The liquidation risk from the lending position creates a path to losing your LP position entirely.`,
        },
        {
          title: `Stablecoin LP — the low-drama real yield baseline`,
          scenario: `Priya provides $50,000 to Curve's USDC/USDT pool on Arbitrum. Fee tier: 0.04%. Daily volume: $20M. Her share: $50K / $300M TVL = 0.0167%. Daily fees: $20M × 0.04% × 0.0167% = $1.33/day. Annual: $485. APY: 0.97% from fees alone. Plus CRV emissions: 2%. Plus Convex boost: 1%. Total: ~4%. IL: near-zero (USDC and USDT should both stay at $1.00). Withdrawal: anytime, instant, predictable. This is DeFi's most boring, most reliable LP position — ~4% real yield with effectively zero IL. The benchmark for risk-adjusted yield.`,
          lesson: `Stablecoin LPs are DeFi's savings account equivalent: predictable, low-drama, real yield with near-zero IL. Understanding this baseline makes evaluating more complex positions easier — every additional % of yield above this baseline should have a named, understood risk behind it.`,
        },
      ],

      guidedPractice: [
        {
          question: `You provide 2% of a Uniswap V3 pool. The pool generates $500K in fees on a given day. What do you earn (ignoring IL)?`,
          options: [`A) $500`, `B) $10,000`, `C) $1,000`, `D) $100`],
          correct: `B) $10,000`,
          hint: `Your share of fees = your pool share % × total fees. 2% × $500,000 = ?`,
          explanation: `2% × $500,000 = $10,000. This is the gross fee income for the day, before gas costs to claim and before impermanent loss adjustment. Annualized: $10,000 × 365 = $3.65M on your LP position. Pool size determines your share; volume determines total fees.`,
        },
        {
          question: `What is an LP token and what does it represent?`,
          options: [
            `A) A governance token for the DEX`,
            `B) A receipt representing your proportional share of a liquidity pool — redeemable for pool assets plus accumulated fees`,
            `C) A token that earns emission rewards`,
            `D) A stablecoin pegged to the pool's value`,
          ],
          correct: `B) A receipt representing your proportional share of a liquidity pool — redeemable for pool assets plus accumulated fees`,
          hint: `When you deposit into a pool, you receive something proving your share. What does redeeming it give you?`,
          explanation: `LP tokens are claims on pool assets. Holding an LP token means: you own X% of all ETH in the pool, X% of all USDC in the pool, and X% of all fees accumulated since your deposit. Redeeming (burning) LP tokens returns your proportional share of current pool assets. Because the pool rebalances continuously, what you get back may be a different ratio than what you deposited — that difference is impermanent loss.`,
        },
        {
          question: `Two LP pairs: ETH/USDC with $2M daily volume and SHIB/ETH with $50K daily volume. Both pools are $5M TVL. Which is better for LPs and why?`,
          options: [
            `A) SHIB/ETH — exotic pairs earn higher fees`,
            `B) ETH/USDC — 40x more volume generates 40x more fee income for LPs with similar TVL`,
            `C) They earn equal fees since both pools are the same size`,
            `D) Depends on the fee tier only`,
          ],
          correct: `B) ETH/USDC — 40x more volume generates 40x more fee income for LPs with similar TVL`,
          hint: `LP earnings = pool share × fees generated. Fees come from volume. Same TVL, different volume — what changes?`,
          explanation: `Same TVL: your pool share % is similar ($1 of $5M = 0.00002%). Different volume: $2M generates $6K/day in fees at 0.3%. $50K generates $150/day. Fee income is 40x higher for ETH/USDC LPs despite equal capital committed. Volume is the dominant driver of LP profitability — not pool size alone.`,
        },
        {
          question: `Connecting to L3.14 (liquidity analysis): a pool has $20M TVL but the top 2 LPs provide 85% of liquidity. Why is this a concern for the other LPs?`,
          options: [
            `A) The top LPs earn more fees which is unfair`,
            `B) If the whale LPs exit simultaneously, the pool collapses from $20M to $3M — your remaining LP position faces dramatically worse execution and the pool may become too thin to generate meaningful fee income`,
            `C) Top LPs can vote to change the fee tier`,
            `D) Concentrated LP ownership has no impact on fee economics`,
          ],
          correct: `B) If the whale LPs exit simultaneously, the pool collapses from $20M to $3M — your remaining LP position faces dramatically worse execution and the pool may become too thin to generate meaningful fee income`,
          hint: `From L3.14: what is whale LP concentration risk? What happens to fee income when TVL collapses?`,
          explanation: `85% of $20M = $17M controlled by 2 wallets. If they exit: pool drops to $3M. Remaining LPs: your pool share increases (you went from 15% of $20M to 100% of $3M) but the pool is now too thin for meaningful trading volume. Traders route elsewhere for better pricing. Fee income collapses. You're trapped in a dying pool earning near-zero. Always check LP concentration before providing to smaller pools.`,
        },
        {
          question: `The LP profit equation is: LP profit = Fee income − Impermanent Loss. In what market condition does a stablecoin LP position guarantee positive profit?`,
          options: [
            `A) Only in bull markets`,
            `B) When both stablecoins maintain their $1 peg — IL is near-zero, so any positive fee income is net profit`,
            `C) Only when fee APY exceeds 5%`,
            `D) Stablecoin LP positions can never guarantee positive profit`,
          ],
          correct: `B) When both stablecoins maintain their $1 peg — IL is near-zero, so any positive fee income is net profit`,
          hint: `IL occurs when prices diverge. If both assets stay at $1.00... what is the price divergence?`,
          explanation: `Impermanent loss = f(price ratio change). If both USDC and USDT stay at $1.00 (no relative price change), IL = 0%. Every basis point of fee income is pure profit. This is why stablecoin LPs are DeFi's safest LP position — the IL term is effectively removed from the equation as long as neither stablecoin depegs.`,
        },
      ],

      lessonSimulations: [
        {
          type: `lp-economics-calculation`,
          scenario: `Calculate full LP economics for two positions. Position A: $15,000 in ETH/USDC V2 on Arbitrum ($60M TVL, $25M daily volume, 0.3% fee). Position B: $15,000 in USDC/USDT Curve on Arbitrum ($400M TVL, $150M daily volume, 0.04% fee). For each: calculate daily fee income, annual fee APY. Which has higher fee income? Which has lower IL risk? Which is better for a passive investor checking positions monthly?`,
          answer: {
            A: `Share: $15K / $60M = 0.025%. Daily fees: $25M × 0.3% × 0.025% = $1.875. Annual: $684. APY: 4.56%. IL risk: moderate (ETH moves vs USDC). Needs monitoring if V3.`,
            B: `Share: $15K / $400M = 0.00375%. Daily fees: $150M × 0.04% × 0.00375% = $2.25. Annual: $821. APY: 5.47%. IL risk: near-zero (stablecoins). Passive-friendly.`,
            verdict: `Surprisingly: Curve generates MORE fee income despite lower fee rate, because $150M volume × 0.04% > $25M volume × 0.3%. For passive monthly-checker: Curve is clearly better — higher fee income AND near-zero IL.`,
          },
        },
        {
          type: `fee-tier-research`,
          scenario: `On DeFiLlama's yields page, find the same pair (ETH/USDC) in different fee tiers on Uniswap V3 (0.01%, 0.05%, 0.3%). Which fee tier has the most volume? Which has the highest LP APY? Does higher fee always mean higher LP income? What explains the distribution?`,
          answer: `Live research task. Expected: 0.05% pool likely has the most volume (the sweet spot for liquid ETH/USDC — professional traders prefer tight spreads). 0.3% pool may have higher per-swap fees but less volume — net APY may be lower than 0.05%. 0.01% pool: mostly arbitrageurs doing tight-spread high-frequency trading. Key insight: the market selects the "efficient" fee tier — LPs should concentrate in the tier with actual volume, not the tier with the highest fee rate. High fee rate without volume = zero earnings.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: LP Position Design`,
        description: `L6.1 (yield sources) + L6.2 (LP basics). Design and defend a complete LP strategy.`,
        challenges: [
          {
            scenario: `You have $30,000 and want to deploy it as LP capital across two positions. Constraint: combined real yield must exceed 6% APY, no leveraged positions, and you can only check positions weekly. Choose two pools from different protocols and chains. Provide: exact pool selection, calculated fee APY for each (using live DeFiLlama data), IL risk assessment, and time-in-range estimate for V3 positions.`,
            answer: `Example allocation: $18,000 Curve stETH/ETH on Ethereum or Arbitrum. Real yield: swap fees 1-3% + stETH appreciation ~3.5% = 4.5-6.5%. IL: low (stETH and ETH are near-correlated). Never goes out of range (V2 style). Weekly check: just verify stETH peg is stable. $12,000 Uniswap V3 USDC/ETH 0.05% on Arbitrum, ±10% range. Real yield: fee APY varies with volume, typically 8-15% when in range. Time in range: ±10% accommodates ~2 weeks of typical ETH movement. Weekly check: sufficient. IL: moderate (ETH can move 20%+ in a month). Blended expected: ~7-9% real yield before IL adjustment. After moderate IL adjustment: ~5-8% net. Passes the 6% target in typical market conditions.`,
          },
        ],
      },

      keyTakeaway: `LPs are the house — earning a fee on every swap in proportion to their pool share. LP profit = Fee income − Impermanent Loss. High volume beats high fee rate: calculate (volume × fee%) ÷ TVL for the real APY. Stablecoin pools are the baseline: near-zero IL, predictable real yield. V3 positions require range monitoring. LP tokens are productive assets reusable as collateral. Always run the math before depositing: volume, your share, fee rate, and IL expectation.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.3 — IMPERMANENT LOSS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'impermanent-loss',
      title: `6.3 Impermanent Loss — The Math, When It Hurts, When It Doesn't`,
      subtitle: `IL is the most feared concept in DeFi LP. It's also frequently misunderstood. Here's the exact formula, the breakeven calculation, and when IL is actually your friend.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.2 you learned the LP profit equation: LP profit = Fee income − Impermanent Loss. This lesson is entirely dedicated to the IL side of that equation — the formula, the scenarios where it's devastating, and the surprising cases where it's irrelevant.`,

      hook: `"I lost money LPing even though the pool went up." This is impermanent loss — and it confuses thousands of DeFi users. The math is simple once you see it. Understanding it takes 10 minutes. Ignoring it can cost you 10-30% of your capital.`,

      visualPrompt: `Two scenarios compared: "Just Held" vs "LP'd." Starting point: 1 ETH ($2,000) + 2,000 USDC = $4,000. ETH goes to $4,000. Hold result: 1 ETH ($4,000) + $2,000 USDC = $6,000. LP result: pool rebalances to ~0.71 ETH ($2,828) + $2,828 USDC = $5,656. IL = $344 (5.7%). Caption: "You still made money — just less than if you'd held. That's impermanent loss."`,

      explanation: `Let me tell you about the catch in liquidity providing.

You deposit $10,000 into a pool. A month later, you withdraw and count: you have $9,800 in tokens, plus $600 in fees. Net: +$400. But if you'd just held the same tokens, you'd have $10,600.

That $600 gap is [impermanent loss] — and it's the most important concept for any LP to understand.

**The mechanism — why it happens:**

When you LP in an ETH/USDC pool and ETH's price changes, [arbitrageurs] rebalance your pool automatically. They buy or sell ETH until the pool price matches the external market.

When ETH goes up: arbitrageurs buy ETH from your pool (cheap), selling USDC in. You end up with less ETH and more USDC. But the ETH you "gave up" appreciated — and you didn't capture that appreciation.

When ETH goes down: arbitrageurs sell ETH to your pool (expensive), buying USDC out. You end up with more ETH and less USDC. The extra ETH you now hold depreciated.

In both directions: you end up holding more of the worse-performing asset. This is impermanent loss.

**The formula:**

IL = 2√r/(1+r) − 1, where r = price ratio change (new price / old price)

Key data points:
- 1.25x price change: 0.6% IL
- 1.5x price change: 2.0% IL
- 2x price change: 5.7% IL
- 3x price change: 13.4% IL
- 4x price change: 20.0% IL
- 5x price change: 25.5% IL

The loss is asymmetric — it's the same for price going up or down by the same ratio. ETH 2x or ETH -50% both produce ~5.7% IL.

**Why "impermanent"?**

The loss is impermanent because if the price returns to the original ratio, the IL disappears completely. You exit with the same asset ratio you entered with, plus all accumulated fees.

IL becomes [realized loss] when you exit while prices are diverged from entry. If you hold until the price ratio returns: no loss, only fees gained.

**The break-even analysis:**

Minimum fee APY needed to break even against IL over 1 year:
- ETH moves ±20% from entry: IL ~0.5%. Needs >0.5% fee APY to profit.
- ETH moves ±50% from entry: IL ~5%. Needs >5% fee APY.
- ETH moves ±100% from entry: IL ~20%. Needs >20% fee APY.

**When IL is irrelevant:**

Stablecoin/stablecoin pairs: both assets maintain $1 → price ratio unchanged → IL = 0%.
Correlated pairs (stETH/ETH, rETH/ETH): both assets move together → minimal price ratio change → IL near-zero.
High-fee, high-volume pairs: fees can easily exceed even significant IL.`,

      examples: [
        {
          title: `The 2x ETH move — exact IL calculation`,
          scenario: `Maria provides 1 ETH ($2,000) + 2,000 USDC at ETH = $2,000. Pool: $4,000 total. ETH doubles to $4,000. Pool rebalances via arbitrage: new pool = 0.7071 ETH + 2,828 USDC (k = 1 × 2,000 = 2,000; new: 0.7071 × 2,828 = 2,000 ✓). Maria's position value: 0.7071 × $4,000 + $2,828 = $2,828 + $2,828 = $5,657. If Maria had held: 1 ETH ($4,000) + $2,000 USDC = $6,000. IL: $6,000 − $5,657 = $343 or 5.7%. Fee income needed to break even over the period: $343.`,
          lesson: `5.7% IL on a 2x price move is the most important data point to memorize. ETH doubling while you LP costs 5.7% vs holding. If the pool generated more than 5.7% in fees over the same period, LPing was profitable even with the IL.`,
        },
        {
          title: `When fees easily beat IL — the high-volume reality`,
          scenario: `Jake LPs ETH/USDC on Uniswap V3. ETH moves from $2,000 to $3,000 (1.5x) over 3 months. IL: 2.0%. His 3-month fee income (Arbitrum, $200M TVL pool, $80M daily volume): pool share 0.01% = $80M × 0.3% × 0.01% = $24/day × 90 days = $2,160. On $100,000 position: 2.16% in 3 months. IL: 2.0%. Net: +0.16% from IL vs fees. Plus: the 50% ETH price appreciation accrues to him through the pool (he ends up with less ETH but more USDC — his total portfolio value still rose significantly). He made money, just slightly less than pure holding.`,
          lesson: `On a high-volume pool, even a 1.5x price move (2% IL) can be offset by 3 months of trading fees. The volume is the key variable — not the fee rate, and not the TVL headline number.`,
        },
        {
          title: `The staking vs LP comparison`,
          scenario: `Sarah has 10 ETH (worth $20,000 each = $200K). Option A: stake on Lido for 3.5% APY in stETH (real yield, liquid). Option B: LP ETH/USDC on Uniswap V3 at ±15% range for estimated 12% APY from fees. She models 1-year IL assuming ETH doubles in a bull market: LP IL = 5.7%. Net LP yield: 12% − 5.7% = 6.3%. Staking: 3.5%. LP wins at 6.3% vs 3.5%. But: LP requires active management (range monitoring, rebalancing), and she needs to hold 50% USDC (reducing ETH upside). If ETH 4x: LP IL = 20%. Net LP: 12% − 20% = −8%. Staking: +3.5%. Staking wins by a lot in extreme bull scenarios.`,
          lesson: `LP vs staking is a directional bet: LP wins in flat/moderate markets where fees exceed IL. Staking wins in extreme bull markets where ETH appreciation dramatically outpaces LP fee income. The right choice depends on your price view.`,
        },
      ],

      guidedPractice: [
        {
          question: `ETH starts at $2,000 and rises to $4,000 while you LP in ETH/USDC. What is your approximate IL?`,
          options: [`A) 5.7%`, `B) 100%`, `C) 2%`, `D) 20%`],
          correct: `A) 5.7%`,
          hint: `Price ratio = 4,000/2,000 = 2x. IL formula: 2√2/(1+2) − 1 = 2×1.414/3 − 1 ≈ 5.7%.`,
          explanation: `2x price change = 5.7% IL. This is the most important IL data point to memorize. ETH doubling while you LP costs you 5.7% relative to just holding. Not devastating — easily overcome by high-volume pool fees over the same period.`,
        },
        {
          question: `ETH drops from $3,000 to $1,500 (50% down, same as 2x ratio). What is the IL?`,
          options: [`A) 50%`, `B) 5.7%`, `C) 2%`, `D) 0%`],
          correct: `B) 5.7%`,
          hint: `IL is symmetric: 2x up or 2x down produces the same IL percentage. The formula uses the ratio regardless of direction.`,
          explanation: `IL formula uses the price ratio: 1,500/3,000 = 0.5 (or 3,000/1,500 = 2 — use the larger ratio). Same result: 5.7%. IL is indifferent to direction — a 50% drop and a 100% gain from the same starting point produce identical IL. This symmetry surprises most new LPs.`,
        },
        {
          question: `An ETH/USDC pool generates 15% annual fee APY. ETH 4x during the year. What is net LP performance vs holding?`,
          options: [
            `A) +15% (fees only)`,
            `B) +15% fees − 20% IL = −5% vs holding (but your absolute position value still rose significantly)`,
            `C) −20% (IL destroys all gains)`,
            `D) +35% (fees + price appreciation)`,
          ],
          correct: `B) +15% fees − 20% IL = −5% vs holding (but your absolute position value still rose significantly)`,
          hint: `4x = 20% IL. You still made money in absolute terms — just 5% less than pure holding. IL measures underperformance vs holding, not absolute loss.`,
          explanation: `15% fees − 20% IL = −5% underperformance vs holding. Important: your position still appreciated significantly in absolute terms (ETH went 4x, you held partial ETH). "Impermanent loss" is the opportunity cost vs holding, not an absolute capital loss. You made money — just less than the maximum possible. In a 4x bull market, staking would have been better. In a flat market, the 15% fee yield would be pure profit.`,
        },
        {
          question: `You LP stETH/ETH on Curve. ETH goes from $2,500 to $3,500 over 6 months. stETH maintains its peg (stETH = 0.998 ETH throughout). What is the approximate IL?`,
          options: [
            `A) 5.7% (ETH went up 40%)`,
            `B) Near-zero — stETH and ETH move together in ratio, so the pool barely rebalances`,
            `C) 2% (from the 40% move)`,
            `D) 15%`,
          ],
          correct: `B) Near-zero — stETH and ETH move together in ratio, so the pool barely rebalances`,
          hint: `IL measures the change in the ratio between the two assets. If stETH tracks ETH price closely, what happens to the stETH/ETH ratio?`,
          explanation: `IL depends on price ratio change between the two assets — not absolute price changes. stETH and ETH both move with ETH price. stETH/ETH ratio stays near 1.0 throughout the 40% ETH appreciation. The pool barely needs to rebalance. IL is near-zero. This is why correlated asset pairs (stETH/ETH, wBTC/WBTC, USDC/USDT) are the safest LP positions — the two assets move together, keeping the ratio stable.`,
        },
        {
          question: `IL is called "impermanent." In what condition does it become permanent?`,
          options: [
            `A) When fees are low`,
            `B) When you exit the LP position while the price ratio is still diverged from your entry — the paper loss crystallizes into a real loss`,
            `C) After 30 days`,
            `D) When you use V3 instead of V2`,
          ],
          correct: `B) When you exit the LP position while the price ratio is still diverged from your entry — the paper loss crystallizes into a real loss`,
          hint: `"Impermanent" implies it can disappear. When does it disappear? When does it get locked in?`,
          explanation: `IL is impermanent as long as you hold the LP position — if price returns to entry ratio, IL = 0%. It becomes realized (permanent) the moment you exit while prices are diverged. Example: ETH 2x → IL = 5.7%. If you exit now: that 5.7% is locked in as a real loss vs holding. If you wait and ETH returns to original price: IL disappears. The "impermanent" label assumes prices revert — for one-directional moves (ETH going from $2,000 to $6,000 and staying there), the IL doesn't revert and you would have been better off holding.`,
        },
      ],

      lessonSimulations: [
        {
          type: `il-scenario-analysis`,
          scenario: `You LP $20,000 in ETH/USDC (Uniswap V2 style). Calculate your position value and IL for three scenarios at the end of 6 months: (A) ETH flat (no movement), (B) ETH +100% (doubles), (C) ETH −50% (halves). Assume you earned 8% annual fee APY = 4% in 6 months = $800 in fees. For each: total position value, IL amount, fee income, and net vs holding.`,
          answer: {
            A: `ETH flat: no rebalancing, no IL. Position = $20,000 + $800 fees = $20,800. Hold = $20,000. LP wins by $800.`,
            B: `ETH +100% (2x): IL = 5.7% = $1,140. LP value before fees: $20,000 × (1 + 50% ETH gain captured by pool) approximately $28,284 (using the formula). After fees: $28,284 + $800 = $29,084. Hold: $10,000 ETH × 2 + $10,000 USDC = $30,000. LP underperforms by $916. Fee income ($800) partially offset IL ($1,140). Net: LP lost $340 vs holding, but made $9,084 in absolute profit.`,
            C: `ETH −50% (same ratio, same IL = 5.7% = $1,140). LP value: approximately $14,142. After fees: $14,942. Hold: $10,000 ETH (now $5,000) + $10,000 USDC = $15,000. LP underperforms hold by $58. Actually close to even because fees nearly offset IL.`,
          },
        },
        {
          type: `breakeven-calculator`,
          scenario: `Build a breakeven table: for each IL percentage (1%, 2%, 5%, 10%, 20%), calculate the minimum annual fee APY needed to break even. Then for each breakeven APY, identify whether a real pool exists that delivers that APY. Practical conclusion: at what ETH volatility does LPing stop making sense vs staking?`,
          answer: {
            table: `1% IL needs 1% fee APY (very achievable — even stablecoin pools deliver this). 2% IL needs 2% fee APY (standard ETH/USDC pool achieves this). 5% IL needs 5% fee APY (achievable on high-volume pools). 10% IL needs 10% fee APY (requires consistently high-volume pool or concentrated V3 position). 20% IL needs 20% fee APY (only achievable with tight V3 ranges in active markets).`,
            conclusion: `LPing vs staking breakeven: if annual ETH movement exceeds ~100% (4x from entry), IL = 20%+. Unless your pool consistently generates 20%+ fee APY, staking (3.5% guaranteed real yield) wins in extreme bull scenarios. LP wins in flat/moderate markets where fee income exceeds modest IL. Rule of thumb: if you expect ETH to be 3x+ within your LP horizon, consider staking over LPing.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: LP vs Hold vs Stake — Full Comparison`,
        description: `L6.2 (LP basics) + L6.3 (IL). Choose the optimal ETH deployment for 12 months.`,
        challenges: [
          {
            scenario: `You have 5 ETH ($15,000 at $3,000/ETH). Three options for 12 months: (A) Stake on Lido — 3.5% APY in stETH. (B) LP ETH/USDC V2 on Arbitrum — estimated 10% fee APY. (C) Just hold ETH. For each option: calculate position value at ETH = $3,000 (flat), ETH = $6,000 (+100%), and ETH = $1,500 (−50%). Include fee income for A and B. Include IL for B. Conclude: which option wins in each scenario?`,
            answer: {
              flat: `ETH=$3,000 (flat). Hold: $15,000. Stake: $15,000 × 1.035 = $15,525. LP: $15,000 + $1,500 fees − $0 IL = $16,500 (no IL if flat). LP wins. Stake second. Hold last.`,
              bull: `ETH=$6,000 (+100%). Hold: $30,000. Stake: 5 stETH × 1.035 = 5.175 stETH × $6,000 = $31,050. LP: rebalanced pool ~$21,213 + $1,500 fees = $22,713. IL = 5.7%. LP vastly underperforms in extreme bull. Hold wins. Stake second (preserves ETH exposure + small yield). LP loses due to reduced ETH exposure.`,
              bear: `ETH=$1,500 (−50%). Hold: $7,500. Stake: 5.175 stETH × $1,500 = $7,762. LP: rebalanced ~$10,607 + $1,500 fees = $12,107. Wait — LP actually outperforms in the bear case because the pool rebalanced to hold more ETH when cheap, and fees add on top. Let me recalculate: LP value formula gives ~$10,607 for a −50% move on $15K original pool. Plus fees $1,500 = $12,107 vs hold $7,500. LP wins the bear scenario dramatically! Hold last. Staking second ($7,762). LP first ($12,107 — the automatic rebalancing bought more ETH at the lower price).`,
              conclusion: `LP wins: flat markets, bear markets. Holding/staking wins: strong bull markets. LP is the optimal strategy unless you have strong directional conviction that ETH will significantly appreciate.`,
            },
          },
        ],
      },

      keyTakeaway: `Impermanent loss = 2√r/(1+r) − 1, where r = price ratio change. Key data: 1.5x = 2% IL, 2x = 5.7% IL, 4x = 20% IL. IL is symmetric (same up or down). Correlated pairs (stETH/ETH) have near-zero IL. IL becomes permanent when you exit while prices are diverged. LP beats holding in flat/bear markets; underperforms in strong bull markets. Always calculate fee APY vs expected IL before depositing — the break-even analysis determines whether LP or stake/hold is optimal for your price view.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.4 — IL CALCULATOR
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'il-calculator',
      title: `6.4 IL Calculator — Calculate Before You Provide`,
      subtitle: `Every LP decision should start with a number, not a feeling. Here's the exact process to model IL before depositing, so you know the break-even point going in.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.3 you learned the IL formula and key data points (2x = 5.7%, 4x = 20%). This lesson teaches the complete pre-deposit calculation workflow — turning the formula into a practical tool you run before every LP position, not after.`,

      hook: `Most LP losses aren't from bad luck — they're from skipping the calculation. "The APY looked high" is how people end up holding more of the cheaper token and wondering where their money went. Five minutes of math before depositing saves hours of confusion after.`,

      visualPrompt: `A four-step flowchart: Step 1 "Find fee APY" (DeFiLlama data) → Step 2 "Estimate price range" (your price view) → Step 3 "Calculate IL" (formula) → Step 4 "Compare: Fee APY vs IL" (is it worth it?). At each step: a specific data input required. Final output: "Go / No-Go decision." Caption: "The IL calculator is four steps. Always run it before depositing."`,

      explanation: `Let me tell you about the tool every LP should use.

You wouldn't jump into a pool without knowing the risks. IL calculation is how you quantify the risk before it happens — not after.

**The four-step pre-deposit IL analysis:**

**Step 1: Find the pool's real fee APY**

From DeFiLlama yields page or the DEX directly:
- Get: 24h trading volume and pool TVL
- Calculate: (Volume × Fee rate × 365) / TVL = Annual fee APY
- Example: $50M volume, 0.3% fee, $200M TVL → ($50M × 0.003 × 365) / $200M = 27.4% APY

**Step 2: Estimate your price scenario**

Define three scenarios based on your price view:
- Bear case: what's the worst price move you expect?
- Base case: what's the most likely price move?
- Bull case: what's the best price move?

For ETH/USDC LP over 3 months: bear = ETH −30%, base = flat, bull = ETH +50%

**Step 3: Calculate IL for each scenario**

Use the formula: IL% = 2√r/(1+r) − 1

Or use these reference points:
- ±10% price move: 0.12% IL
- ±25% price move: 0.76% IL
- ±50% price move: 2.0% IL (same as 1.5x)
- ±100% price move (2x): 5.7% IL
- ±200% price move (3x): 13.4% IL

For a 3-month time horizon: scale the annual fee APY to 3 months (÷4).

**Step 4: Compare fee income vs IL**

Fee income (3 months) = Annual Fee APY ÷ 4
Net LP outcome = Fee income − IL

If positive: LP is profitable vs holding in this scenario
If negative: holding or staking would have been better

**The decision matrix:**

Bear scenario: does LP outperform hold? (Often yes — pool rebalances, buying the dip for you)
Base scenario: does LP outperform hold? (Almost always yes — fees with minimal IL)
Bull scenario: does LP outperform hold? (Often no — IL grows faster than fees in strong bull)

If LP wins in 2 of 3 scenarios: typically worth it.
If LP only wins in flat markets: consider staking instead.

**V3 position sizing:**

For concentrated V3 positions: also estimate time-in-range %.
Effective APY = Quoted APY × (estimated time in range)
IL is amplified when out-of-range (full directional exposure without fee income).`,

      examples: [
        {
          title: `Full pre-deposit analysis — ETH/USDC 3-month position`,
          scenario: `Jake plans to LP $25,000 in Uniswap V3 ETH/USDC on Arbitrum for 3 months. Pool stats: $150M TVL, $60M daily volume, 0.05% fee. Fee APY: ($60M × 0.05% × 365) / $150M = 7.3%. 3-month fee income: 7.3% / 4 = 1.83% = $458. Price scenarios: Bear (ETH −40% to $1,800) → IL 2.0% → $500 loss. Flat (ETH ±5%) → IL 0.01% → negligible. Bull (ETH +80% to $5,400) → IL 5.2% → $1,300 loss. Net outcomes: Bear: +$458 fees − $500 IL = −$42 vs holding (essentially break-even). Flat: +$458 − $0 = +$458 profit. Bull: +$458 − $1,300 = −$842 vs holding. Jake's view: ETH likely flat to moderate bull in 3 months. LP wins 2 of 3 scenarios. He proceeds.`,
          lesson: `The pre-deposit analysis makes the trade-off explicit before you risk capital. Jake knows he'll underperform a strong bull but outperform in flat/bear conditions. He decides that fits his price view. This is informed position taking — not guesswork.`,
        },
        {
          title: `Stablecoin LP — the trivial IL calculation`,
          scenario: `Priya plans to LP $30,000 in USDC/USDT on Curve. Pool stats: $400M TVL, $200M daily volume, 0.04% fee. Fee APY: ($200M × 0.04% × 365) / $400M = 7.3%. 3-month fee income: 7.3% / 4 = 1.83% = $549. IL scenarios: USDC depeg never happens → IL = 0%. If USDC depegs to $0.98 (minor depeg) → price ratio = 1.02 → IL = 0.01% → $3. Even a major depeg to $0.95 → price ratio = 1.05 → IL = 0.12% → $36. Net: worst realistic case = $549 − $36 = $513 profit. IL calculation for stablecoins takes 30 seconds and confirms what everyone already knows: the IL risk is negligible. The analysis still matters because it makes the assumption explicit.`,
          lesson: `Even the "obvious" IL calculation is worth running. It quantifies what you already sense: stablecoin LPs have trivial IL risk. Making it explicit gives you the confidence to size the position appropriately.`,
        },
        {
          title: `When the IL calculation says no`,
          scenario: `Marcus is considering LPing 100 ARB tokens in an ARB/ETH pool. Pool stats: $3M TVL, $200K daily volume, 0.3% fee. Fee APY: ($200K × 0.3% × 365) / $3M = 7.3%. 3-month income: 1.83% = $183 on $10,000. IL scenarios: Both ARB and ETH are volatile and can move independently. Expected 6-month price ratio change: easily ±100% (ARB and ETH uncorrelated). IL at 2x ratio change: 5.7% = $570. Net: $183 fees − $570 IL = −$387 vs holding. The IL calculation says no: this pool generates insufficient fee income to offset the expected IL from two uncorrelated volatile assets. Marcus holds his ARB instead.`,
          lesson: `The IL calculator catches unprofitable positions before you enter them. Low-volume pools with uncorrelated volatile asset pairs are the danger zone — insufficient fees to compensate IL. The calculation forced the correct decision.`,
        },
      ],

      guidedPractice: [
        {
          question: `Pool: $80M TVL, $30M daily volume, 0.3% fee. What is the annual fee APY for LPs?`,
          options: [`A) 41.1%`, `B) 10.3%`, `C) 0.3%`, `D) 3.75%`],
          correct: `A) 41.1%`,
          hint: `Annual fee APY = (Daily Volume × Fee Rate × 365) / TVL.`,
          explanation: `($30M × 0.003 × 365) / $80M = $32.85M / $80M = 41.1%. This is a high-efficiency pool — $30M daily volume on $80M TVL = 37.5% daily turnover. Compare to lower efficiency pools where the same TVL generates much less volume and thus much lower LP APY.`,
        },
        {
          question: `You LP $10,000 for 6 months. Annual fee APY is 20%. ETH moves from $2,500 to $4,000 (1.6x). What is net LP profit vs holding?`,
          options: [
            `A) +$1,000 (fees only)`,
            `B) +$1,000 fees − $2.4% IL ($240) = +$760 vs holding`,
            `C) −$760 (IL hurts)`,
            `D) +$2,000 (fees + price gain)`,
          ],
          correct: `B) +$1,000 fees − $2.4% IL ($240) = +$760 vs holding`,
          hint: `6-month fee income = 20%/2 = 10% = $1,000. 1.6x IL = approximately 2.4% = $240. Net = fees − IL.`,
          explanation: `6-month fees: 20% × 6/12 = 10% of $10,000 = $1,000. IL for 1.6x: approximately 2.4% of $10,000 = $240. Net vs holding: $1,000 − $240 = +$760. LPing was profitable by $760 even though you underperformed pure ETH holding by $240. Your absolute position value also rose with ETH's 60% gain — just less than pure holding would have captured.`,
        },
        {
          question: `In the IL decision matrix, when does LP typically NOT outperform holding?`,
          options: [
            `A) In bear markets`,
            `B) In flat markets`,
            `C) In strong bull markets where ETH appreciates significantly`,
            `D) LP always outperforms holding`,
          ],
          correct: `C) In strong bull markets where ETH appreciates significantly`,
          hint: `From L6.3: LP holds less ETH than pure holding after a price rise. When does that matter most?`,
          explanation: `In a strong bull market (ETH 4x): LP rebalances to hold less ETH (the appreciating asset). IL = 20%. Unless your fee APY exceeds 20% over the same period (rare), pure holding outperforms. LP wins in flat markets (fees with no IL) and bear markets (automatic rebalancing buys the dip). LP loses in strong directed bull markets where reduced ETH exposure costs more than fee income covers.`,
        },
        {
          question: `Connecting to L3.3 (V3): you use a ±5% V3 range. ETH is currently $3,000. Your range is $2,850-$3,150. Over 3 months, ETH moves ±8% on average monthly. What fraction of time is your position approximately in range?`,
          options: [
            `A) 100% — V3 ranges always stay valid`,
            `B) Roughly 50-60% — ±8% monthly moves frequently push ETH outside the ±5% range`,
            `C) 0% — ±5% is too narrow`,
            `D) 80% — ranges rarely exit`,
          ],
          correct: `B) Roughly 50-60% — ±8% monthly moves frequently push ETH outside the ±5% range`,
          hint: `Your range allows ±5%. ETH moves ±8% monthly on average. How often does ±8% move exceed ±5% boundary?`,
          explanation: `If ETH moves ±8% per month and your range is ±5%, your position exits range frequently — any daily or weekly move that accumulates to ±5% pushes you out. Roughly: a ±5% range on an asset with ±8% monthly typical movement will be in-range maybe 50-60% of the time. Effective V3 APY = quoted APY × 50-60%. This is why tight ranges require frequent rebalancing and active monitoring.`,
        },
        {
          question: `Two pools: Pool A (ETH/USDC, 12% fee APY, expects ±50% price move) vs Pool B (stETH/ETH, 4% fee APY, expects ±2% price move). Over 12 months, which provides better risk-adjusted returns?`,
          options: [
            `A) Pool A — 3x higher APY`,
            `B) Pool B — 4% fee vs near-zero IL beats 12% fee vs 2% IL (= net 10% Pool A vs net ~4% Pool B) ... actually Pool A wins`,
            `C) Pool A net 10% beats Pool B net 4%. Pool A wins even after IL.`,
            `D) Depends on how quickly you can rebalance`,
          ],
          correct: `C) Pool A net 10% beats Pool B net 4%. Pool A wins even after IL.`,
          hint: `Calculate net for each: Pool A = 12% − 2% IL (from ±50% move) = 10%. Pool B = 4% − ~0% IL = 4%. Which is higher?`,
          explanation: `Pool A: 12% fee − 2% IL (±50% move) = 10% net. Pool B: 4% fee − ~0% IL = 4% net. Pool A wins by 6% despite higher IL. The calculation shows: higher volatility pairs can be better LP opportunities as long as their fee APY more than compensates for IL. The IL calculation forces an apples-to-apples comparison that reveals Pool A as the better risk-adjusted choice despite the perception that volatile pairs are "riskier."`,
        },
      ],

      lessonSimulations: [
        {
          type: `pre-deposit-analysis`,
          scenario: `Run a complete pre-deposit analysis for a Balancer 80/20 BAL/ETH pool. Find the pool on DeFiLlama or Balancer's app. Record: TVL, 24h volume, fee rate. Calculate fee APY. Then model IL for three scenarios: BAL −50% vs ETH (BAL underperforms), BAL flat vs ETH, BAL +100% vs ETH. For Balancer 80/20 pools, IL is lower than V2 50/50 (from L3.6: weighted pools reduce IL). Estimate: go or no-go?`,
          answer: `Live research task. Key formula for 80/20 Balancer IL is lower than 50/50 by approximately factor of 2-3x. Fee APY calculation: same method. 80/20 BAL/ETH specific: if BAL underperforms ETH significantly, the 80% BAL weight means you hold mostly the underperforming asset — IL compounds. But if BAL and ETH move together: near-zero IL. The 80/20 weighting primarily helps when the protocol team holds this as their primary treasury asset (they want 80% BAL exposure). For external LPs without BAL strategic reasons: evaluate pure economics.`,
        },
        {
          type: `il-toolkit-build`,
          scenario: `Build a simple IL reference table for your personal use. Columns: price ratio change (1.1x, 1.25x, 1.5x, 2x, 3x, 4x, 5x), IL%, and "minimum fee APY needed to break even in 6 months." Use the formula: 2√r/(1+r) − 1. Then create a second column: "pool fee APY needed to break even in 3 months" (higher because you have less time to accumulate fees). This becomes your go-to reference before every LP decision.`,
          answer: {
            table: `1.1x: 0.11% IL | 6mo break-even: 0.22% APY | 3mo break-even: 0.44% APY. 1.25x: 0.57% IL | 1.14% | 2.28%. 1.5x: 2.02% IL | 4.04% | 8.08%. 2x: 5.72% IL | 11.44% | 22.88%. 3x: 13.4% IL | 26.8% | 53.6%. 4x: 20.0% IL | 40% | 80%. 5x: 25.5% IL | 51% | 102%.`,
            interpretation: `For any LP position: (1) Estimate the expected price ratio change. (2) Look up the IL. (3) Check if the pool's fee APY exceeds the break-even threshold for your time horizon. If yes: profitable position. If no: reconsider.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: IL-Adjusted Portfolio Construction`,
        description: `L6.3 (IL theory) + L6.4 (IL calculator). Build a complete IL-adjusted LP portfolio.`,
        challenges: [
          {
            scenario: `$50,000 to deploy across three LP positions. Constraints: (1) At least one stablecoin pair, (2) At least one ETH-correlated pair, (3) One "higher risk" position you believe has sufficient fee APY to compensate IL. For each position: run the complete 4-step pre-deposit analysis assuming a 6-month horizon and your personal ETH price view. Calculate blended net APY after IL. Is the portfolio profitable in your base case?`,
            answer: `Example with ETH base case = flat to +30%: Position 1 ($20K): Curve USDC/USDT. Fee APY ~6%. IL ~0%. Net: 6% annualized, 3% in 6 months = $600. Position 2 ($18K): Curve stETH/ETH. Fee APY ~5% (fees + staking). IL ~0.2% (stETH tracks ETH closely). Net: ~4.8% = $432. Position 3 ($12K): Uniswap V3 ARB/ETH ±15% range on Arbitrum. Fee APY: check live (typically 15-25%). IL for ±30% ETH and ARB: if both move together ~0.5%, if uncorrelated ~5%. Net: 20% fee − 5% IL = 15% = $900. Total 6-month income: $600 + $432 + $900 = $1,932 = 7.7% annualized. Profitable in base case. If ETH 2x: Position 3 IL spikes to ~5.7% (ETH) — still covered by fees at 15% APY.`,
          },
        ],
      },

      keyTakeaway: `Four-step IL analysis before every deposit: (1) Calculate real fee APY (volume × fee rate × 365 / TVL), (2) Estimate price scenarios (bear/base/bull), (3) Calculate IL for each scenario using the formula, (4) Compare fee income vs IL to make the go/no-go decision. Reference: 1.5x = 2% IL, 2x = 5.7%, 4x = 20%. Always build the IL reference table for your time horizon. LP wins 2 of 3 scenarios (flat and bear) in most cases — the exception is strong directional bull markets.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.5 — CONCENTRATED LIQUIDITY STRATEGIES
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'concentrated-liquidity-strategies',
      title: `6.5 Concentrated Liquidity Strategies — Choosing Ranges, Rebalancing, and When to Automate`,
      subtitle: `V3 gives you 100x efficiency. It also gives you 100x more decisions. Here's the framework for making those decisions without becoming a full-time LP manager.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L3.3 you learned how concentrated liquidity (V3) works mechanically. In L6.3-6.4 you learned IL math. This lesson combines both — the practical strategies for range selection, rebalancing triggers, and when to use automated managers vs doing it yourself.`,

      hook: `A V3 LP out of range earns zero fees and accumulates full directional price exposure. Most retail V3 LPs spend 30-60% of their time out of range — meaning they're earning half their expected yield while still paying gas to rebalance. The solution is strategy, not more monitoring.`,

      visualPrompt: `Three range strategies overlaid on a price chart: Wide (±50% range, thick band, always in range, low multiplier), Medium (±15% range, medium band, in range most of the time, moderate multiplier), Narrow (±3% range, thin band, frequently exits, maximum multiplier when in range). Time-in-range % shown for each. Caption: "Range width is the core decision. Wider = safer. Narrower = higher yield but more work."`,

      explanation: `Let me tell you about active liquidity management.

[Uniswap v2] was simple: deposit, forget, earn. [Uniswap v3] introduced concentrated liquidity — and with it, a fundamental question every LP must answer: how wide should my range be?

The answer determines your capital efficiency, management burden, and risk profile. Here's the decision framework.

**The range-width trade-off:**

Narrow range (±2-5%): highest capital efficiency (50-200x vs V2), earns maximum fees when in range, but exits range on any normal daily price move. Requires daily (or automated) rebalancing.

Medium range (±10-20%): 5-20x efficiency vs V2, exits range during significant weekly moves, requires weekly monitoring. Best for active but not professional LPs.

Wide range (±50%+): 2-4x efficiency vs V2, rarely exits range, passive-friendly. For monthly checkers.

**Range selection framework:**

Step 1: Estimate asset volatility. ETH moves ±3-5% daily, ±10-20% weekly, ±30-60% monthly.

Step 2: Match range width to your monitoring frequency.
- Check daily → narrow range (±5-10%)
- Check weekly → medium range (±15-25%)
- Check monthly → wide range (±40-60%)

Step 3: Set asymmetric ranges if you have a price view. Bullish on ETH: extend range further above current price (more room to run up before exiting). Bearish: extend below.

**The rebalancing decision:**

Rebalance triggers:
- Price exits your range
- Price approaches range boundary within 20% (proactive)
- Time-based (fixed rebalancing regardless of price)

Rebalancing costs on Ethereum mainnet: $15-50 gas per rebalance. On Arbitrum/Solana: $0.10-0.50.

[Gas-break-even for rebalancing] = Rebalance cost / (Daily fee income when in range)

Example: $20 gas, $5/day fee income → 4 days of fees to break even on one rebalance. Rebalancing more than once every 4 days destroys yield.

**Automated LP managers:**

[Gamma Strategies] — automatically manages V3 ranges across multiple fee tiers. Charges 10-20% of fees as management fee. Available on Ethereum, Arbitrum, Polygon.

[Arrakis Finance] — similar automatic range management. Good for protocols managing their own liquidity.

[Beefy Finance] — auto-compounds V3 fees back into the position. No range management but saves manual claiming.

[Sommelier Finance] — active strategy vaults with professional managers setting ranges.

When to use automation: position under $10,000, monitoring only possible weekly or less, gas cost of manual rebalancing exceeds 30% of fee income.

**The single-sided deposit option:**

Some protocols (Orca, some V4 hooks) allow single-sided deposits — add only one token, and the protocol finds optimal range placement. Useful for entering large positions without immediate price impact of buying both assets.`,

      examples: [
        {
          title: `Range strategy for a semi-active LP`,
          scenario: `Maria has $20,000 to LP ETH/USDC. She can check the position weekly. Her approach: set ±15% range from current ETH price ($3,000 → range $2,550–$3,450). Historical analysis: ETH exits a ±15% range roughly once every 3-4 weeks (based on 1 standard deviation monthly moves). Expected time in range: ~75%. Fee APY from pool: 15%. Effective fee APY: 15% × 75% = 11.25%. Gas on Arbitrum for rebalance: $0.50 per event × 13 rebalances/year = $6.50 (negligible). Her annual performance vs V2: V2 estimated fee APY = 3%. V3 with medium range = 11.25%. Net gain from concentration: +8.25% = $1,650/year extra. Active management cost: 12-15 minutes per week. Worth it.`,
          lesson: `Medium ranges (±15-20%) on Arbitrum create significant yield improvement with manageable weekly management. The combination of low gas (Arbitrum) and reasonable range width makes this the "sweet spot" for most semi-active retail LPs.`,
        },
        {
          title: `Automated LP manager vs manual`,
          scenario: `Jake has $5,000 in an ETH/USDC Uniswap V3 position on Ethereum mainnet. Fee income: $15/day. He needs to rebalance every 10 days (±5% range). Rebalance cost: $25. 36.5 rebalances/year × $25 = $912.50 in gas. Annual fee income: $15 × 365 = $5,475. Gas drag: 16.7% of fee income. Effective yield: $5,475 − $912 = $4,563 = 91.3% APY. Using Gamma (10% fee, automatic): $5,475 × 90% = $4,927 fee income. No gas cost. Net $4,927 vs $4,563 manual. Gamma wins by $364 on a $5K position at mainnet gas prices. On Arbitrum: manual gas = $0.50 × 36.5 = $18.25. Manual wins by $492 over Gamma.`,
          lesson: `Automation wins at high gas costs (mainnet) and small position sizes. Manual wins at low gas costs (Arbitrum/Solana) and larger positions. Always compare: protocol fee vs gas cost of manual management given your position size and rebalancing frequency.`,
        },
        {
          title: `Asymmetric range — using your price view`,
          scenario: `Priya is moderately bullish on ETH ($3,000 current price). Rather than a symmetric ±15% range ($2,550-$3,450), she sets an asymmetric range: $2,700-$3,800 (lower boundary closer, upper boundary further). Logic: she expects ETH to trend up — setting more range above captures upside before exiting range. If ETH goes to $3,500: she's still in range earning fees (symmetric would also be in range here). If ETH goes to $4,000: asymmetric stays in range ($3,800 boundary), symmetric exits ($3,450 boundary). She earns fees on the $3,450-$3,800 move that the symmetric LP misses. Trade-off: less downside buffer — if ETH drops to $2,600, she exits range faster than symmetric.`,
          lesson: `Asymmetric ranges are how price views translate into LP strategy. Bullish: extend upper boundary. Bearish: extend lower boundary. This lets you maintain fee-earning exposure in your expected direction while reducing the range (and thus capital required) in the less likely direction.`,
        },
      ],

      guidedPractice: [
        {
          question: `You can only check your V3 position monthly. ETH moves ±30% over a typical month. What range width is appropriate?`,
          options: [
            `A) ±5% — maximum efficiency`,
            `B) ±40-60% — wide enough that ±30% moves rarely push you out of range`,
            `C) ±15% — medium range`,
            `D) Any range works for monthly checking`,
          ],
          correct: `B) ±40-60% — wide enough that ±30% moves rarely push you out of range`,
          hint: `Monthly moves of ±30% require a range that accommodates that movement without exiting. What width handles ±30% as a normal monthly event?`,
          explanation: `±30% monthly moves mean your range needs ±40-50% minimum to avoid frequent exits with monthly monitoring. With ±40% range: a ±30% move keeps you in range. With ±15% range: you'd exit range most months and miss fees while accumulating directional exposure without the fee income to compensate. Range must be wider than typical movement over your monitoring interval.`,
        },
        {
          question: `Gas cost per rebalance: $20 (Ethereum mainnet). Daily fee income: $8. You're considering a narrow ±3% range. Approximately how many rebalances per month can you afford before gas destroys more than 25% of your fee income?`,
          options: [`A) 30`, `B) 4`, `C) 15`, `D) 1`],
          correct: `B) 4`,
          hint: `Monthly fee income = $8 × 30 = $240. 25% tolerance = $60. Max affordable gas = $60 / $20 per rebalance = ?`,
          explanation: `Monthly fee income: $8 × 30 = $240. 25% = $60 tolerance for gas. $60 / $20 per rebalance = 3 rebalances (be conservative → 4 maximum). A ±3% range on ETH (which moves ±3% in a day routinely) would require daily rebalancing — 30 rebalances/month × $20 = $600. That's 250% of monthly fee income. The narrow ±3% range on mainnet with $8/day income is economically irrational.`,
        },
        {
          question: `Connecting to L3.3 (V3 mechanics): why does a V3 position that's out of range accumulate "directional exposure" instead of IL?`,
          options: [
            `A) Out-of-range positions continue rebalancing normally`,
            `B) Out-of-range positions are 100% in one asset and don't rebalance — so you just hold that asset directionally with zero fee income`,
            `C) Out-of-range positions earn higher fees`,
            `D) V3 positions are always in range`,
          ],
          correct: `B) Out-of-range positions are 100% in one asset and don't rebalance — so you just hold that asset directionally with zero fee income`,
          hint: `From L3.3: what happens to a V3 position when price exits the range? Does the pool continue to rebalance it?`,
          explanation: `When price exits a V3 range: the position has been fully converted to one asset (100% USDC if price fell below range, 100% ETH if price rose above range). No rebalancing occurs outside the range — the AMM only rebalances within the range. So out-of-range = you're just holding one asset, earning zero fees, with full directional exposure to that asset's price movement. It's equivalent to "holding ETH" or "holding USDC" depending on which side of the range price exited from.`,
        },
        {
          question: `When does using an automated LP manager (like Gamma) make more financial sense than manual management?`,
          options: [
            `A) Always — automation is always better`,
            `B) When the protocol management fee is less than your gas cost for manual rebalancing given your position size and rebalancing frequency`,
            `C) Only for large institutional positions`,
            `D) When the protocol APY is higher than manual`,
          ],
          correct: `B) When the protocol management fee is less than your gas cost for manual rebalancing given your position size and rebalancing frequency`,
          hint: `Automation costs a % of fees (e.g., 10%). Manual costs gas per rebalance. Which is cheaper depends on position size, rebalancing frequency, and chain gas costs.`,
          explanation: `Break-even: Automation fee = Position × Fee APY × 10% (protocol fee). Manual cost = Rebalances per year × Gas cost. Example: $5K position, 20% APY, 10% protocol fee → $100/year automation. Manual: 36 rebalances × $0.50 Arbitrum gas = $18/year. Manual wins on Arbitrum. Same on mainnet: 36 × $20 = $720 manual. Automation ($100) wins. Calculate for your specific situation: chain, position size, and expected rebalancing frequency.`,
        },
        {
          question: `You're bullish on ETH and want to set an asymmetric V3 range. Current price: $3,000. What configuration best captures your price view?`,
          options: [
            `A) Symmetric range: $2,700-$3,300 (±10%)`,
            `B) Asymmetric bullish: $2,800-$3,600 — less downside buffer, more upside room before exiting range`,
            `C) Asymmetric bearish: $2,400-$3,200 — prepared for ETH decline`,
            `D) No range — LP symmetrically always`,
          ],
          correct: `B) Asymmetric bullish: $2,800-$3,600 — less downside buffer, more upside room before exiting range`,
          hint: `Bullish = expect upward movement. Which configuration gives ETH more room to run up before exiting the range?`,
          explanation: `Asymmetric bullish: lower boundary at $2,800 (only $200 downside buffer, 6.7% below current), upper boundary at $3,600 ($600 upside room, 20% above current). If ETH rises to $3,400: still in range, earning fees. Symmetric ±10% would exit at $3,300. You capture $100 extra move before exiting range. Trade-off: if ETH drops to $2,700, you exit range sooner than the symmetric position. The asymmetric range lets your price view directly influence your fee-earning range.`,
        },
      ],

      lessonSimulations: [
        {
          type: `range-strategy-comparison`,
          scenario: `For the same $10,000 in ETH/USDC on Arbitrum, compare three range strategies over 6 months. ETH moves: Month 1 +8%, M2 −12%, M3 +5%, M4 −3%, M5 +15%, M6 +6%. Pool base fee APY (V2-equivalent): 8%. V3 multiplier by range: ±5% = 30x, ±15% = 8x, ±40% = 2.5x. Estimate time-in-range for each strategy given the monthly moves. Calculate effective APY. Which strategy performs best?`,
          answer: {
            narrow5pct: `30x multiplier = 240% APY when in range. But ±5% exits on any month with >5% move. Month 1 (+8%): out. M2 (−12%): out. M3 (+5%): barely in. M4 (−3%): in. M5 (+15%): out. M6 (+6%): out. In-range months: 2/6 = 33%. Effective APY: 240% × 33% = 79.2%. But each exit requires rebalancing ($0.50 × 4 exits = $2 negligible on Arbitrum). Best raw APY.`,
            medium15pct: `8x = 64% APY when in range. Exits on moves >15%: only M2 (−12% might be okay, borderline) and M5 (+15% exactly at boundary). Rough: in range 4-5 of 6 months = 75-85%. Effective: 64% × 80% = 51.2%. Weekly check sufficient.`,
            wide40pct: `2.5x = 20% APY. ±40% range: never exits on any of these moves (max single month = 15%). In range 100%. Effective: 20%. Monthly check sufficient.`,
            verdict: `Narrow wins on raw APY (79%) but requires weekly management and frequent rebalancing. Medium is the sweet spot (51%) with weekly monitoring. Wide (20%) is truly passive but underperforms significantly. For Arbitrum (near-zero gas): narrow or medium range is optimal. For mainnet: wide range to avoid gas destruction.`,
          },
        },
        {
          type: `automated-vs-manual`,
          scenario: `You have $15,000 in a V3 ETH/USDC position on Ethereum mainnet (±10% range). Fee APY from pool: 18%. Expected rebalances: 2 per month. Gas per rebalance: $25. Compare: manual management vs Gamma at 10% fee vs Beefy (auto-compound, 3% performance fee, no range management). Which yields the most after 1 year?`,
          answer: {
            manual: `Annual fees: $15,000 × 18% = $2,700. Gas: 24 rebalances × $25 = $600. Net: $2,100. Yield: 14%.`,
            gamma: `Fees × 90%: $2,700 × 90% = $2,430. No gas cost. Net: $2,430. Yield: 16.2%. Plus Gamma handles range — possibly captures more in-range time than manual.`,
            beefy: `Beefy auto-compounds but doesn't manage ranges. Manual gas still required for range rebalancing. 3% performance fee: $2,700 × 97% = $2,619. Minus gas ($600) = $2,019. Slightly worse than pure manual. Beefy adds compounding benefit but requires manual range management — awkward hybrid.`,
            verdict: `Gamma wins at mainnet gas prices: $2,430 vs $2,100 manual. The 10% fee is cheaper than $600 in gas. On Arbitrum: manual wins easily ($2,700 minus $12 gas = $2,688 vs Gamma's $2,430).`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: V3 Strategy for Volatile vs Stable Markets`,
        description: `L6.3 (IL) + L6.4 (calculator) + L6.5 (strategies). Design optimal V3 strategies for two different market conditions.`,
        challenges: [
          {
            scenario: `Design a V3 LP strategy for $25,000 under two market regimes. Regime A: Low volatility, ETH moving ±3% weekly, base case flat. Regime B: High volatility, ETH moving ±15% weekly, macro uncertainty. For each regime: (1) Optimal range width and why, (2) Chain selection (Ethereum mainnet vs Arbitrum), (3) Automation or manual, (4) Expected APY after gas/fees, (5) Key risk and mitigation.`,
            answer: {
              regimeA: `Low volatility (±3% weekly). Range: ±5% (narrow — in a low-volatility environment, narrow works without constant exits). Chain: Arbitrum (low gas makes narrow viable). Automation: manual with weekly check (±3% moves won't exit ±5% range weekly). APY: 30x multiplier × base 8% = 240% when in range. In range ~85% (±3% weekly won't always exceed ±5%). Effective: 204%. After IL (minimal in low vol): 200%+. Risk: volatility spike exits range suddenly — set alerts.`,
              regimeB: `High volatility (±15% weekly). Range: ±35-40% (wide — narrow range would exit constantly, generating more gas than fees). Chain: Arbitrum still (but mainnet also viable with wide range since rare rebalancing). Automation: Gamma or Arrakis (manage the range — high vol makes automation worth the fee). APY: 2.5x × 8% = 20%. In range ~90% (±40% accommodates ±15% weekly). Effective: 18%. Risk: extreme move (3x monthly) exits even ±40% range — accept this tail risk or use V2 instead.`,
              conclusion: `Market regime determines everything: range width, chain, and whether to automate. Low vol = go narrow and manual. High vol = go wide and automate. Trying to use a narrow range in high vol destroys yield through constant rebalancing.`,
            },
          },
        ],
      },

      keyTakeaway: `Concentrated liquidity strategy is three decisions: range width (narrow = high yield but frequent exits, wide = passive but low yield), monitoring frequency (match range to how often you can check), and automation (use it when gas cost > protocol fee for your position size). Asymmetric ranges encode price views. Automated managers (Gamma, Arrakis) win at mainnet gas costs; manual wins on L2s. The optimal strategy changes with market regime — reassess when volatility regime shifts.`,
    },

  ],
}
