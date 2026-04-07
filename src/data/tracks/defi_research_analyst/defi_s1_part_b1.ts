// ============================================================================
// DeFi RESEARCH CURRICULUM — SECTION 1: FOUNDATIONS (Part B1, Lessons 9–12)
// Lessons: introduction-to-stablecoins → first-dashboard-defillama
// ============================================================================

export const defiFoundationsPartB1 = {
  id: 'defi-foundations-b1',
  lessons: [

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.9 — INTRODUCTION TO STABLECOINS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'introduction-to-stablecoins',
      title: `1.9 Introduction to Stablecoins — The Dollar of DeFi`,
      subtitle: `Crypto that stays at $1. Here's why that's both powerful and incredibly hard.`,
      difficulty: 'foundation',
      previousLessonRef: `In L1.8 you learned DeFi lending — most loans use stablecoins as the borrowed asset. This lesson explains what stablecoins are, the three types, and why the differences matter enormously for your safety.`,

      hook: `A stablecoin that loses its peg doesn't just hurt you — it can crash an entire ecosystem. $40 billion evaporated in 72 hours in May 2022. Understanding HOW they stay at $1 is how you know which ones to trust.`,

      visualPrompt: `Three columns: left (vault with real dollars, labeled "Fiat-backed: USDC/USDT"), center (safe with ETH and coins, labeled "Crypto-backed: DAI/LUSD"), right (broken algorithm with spiral arrow, labeled "Algorithmic: UST — FAILED"). Each column shows the stability mechanism and failure mode. Caption: "Three ways to make $1 on a blockchain. Three very different ways to fail."`,

      explanation: `Let me tell you about the problem stablecoins solve.

Imagine you're trading on a [DEX]. You want to sell your [ETH] and "go to cash." But there is no cash in DeFi — only crypto that goes up and down.

If you sell [ETH] for another [crypto], you're still exposed to price swings. You need something stable.

[Stablecoin] — a token designed to maintain a stable value (usually $1 USD) by using one of three mechanisms: fiat backing, crypto collateral, or algorithmic supply management.

**Why stablecoins are essential to DeFi:**
Without stablecoins, every DeFi position would carry price exposure. You couldn't park profits. Lending markets would be chaotic. Stablecoins are the "cash layer" that makes DeFi usable.

**Type 1: Fiat-Backed (Centralized)**

[Fiat-backed stablecoin] — backed 1:1 by real dollars held by a centralized company. For every 1 USDC in circulation, Circle holds $1 in a bank account.

Examples: USDC (Circle), USDT (Tether)
Pros: most stable, deepest liquidity everywhere
Cons: centralized — Circle can freeze your tokens on government orders

[Blacklisting] — fiat stablecoin issuers can freeze specific wallet addresses, making tokens non-transferable. In 2023, Circle froze $75M USDC in one enforcement action.

**Type 2: Crypto-Backed (Decentralized)**

[Crypto-backed stablecoin] — backed by overcollateralized crypto assets. To mint $100 of DAI, you lock $150+ of ETH.

Examples: DAI (MakerDAO), LUSD (Liquity)
Pros: decentralized, no company can freeze it
Cons: more complex, requires overcollateralization, can break if collateral crashes extremely fast

[Peg] — the target value a stablecoin aims to maintain. "Depegging" means the price moved significantly from $1.

**Type 3: Algorithmic (High Risk)**

[Algorithmic stablecoin] — attempts to maintain its peg through supply expansion/contraction algorithms rather than backing assets.

The warning: UST was the largest algorithmic stablecoin. In May 2022, it lost its peg and collapsed from $1 to near $0 in 72 hours, wiping out $40+ billion in value. This is called a [death spiral] — confidence breaks → selling accelerates → mechanism fails → collapse.

Pure algorithmic stablecoins are extremely high-risk. Avoid until you deeply understand the mechanics.

**Key research metrics:**
- Peg deviation history: how far from $1 has it ever traded?
- Market cap: larger = more battle-tested demand
- Collateral ratio: for crypto-backed, what's the overcollateralization level?
- Redemption mechanism: can you always redeem for $1 worth of something real?`,

      examples: [
        {
          title: `USDC vs DAI — the centralization trade-off`,
          scenario: `Sarah holds $10,000. USDC: always exactly $1, redeemable directly with Circle for real dollars, deepest liquidity. But Circle froze $75M in 2023 on government request. DAI: backed by ETH + USDC collateral, no single entity can freeze it, occasionally depegs slightly to $1.01-1.02. Sarah picks based on priorities: simplicity + stability (USDC) or censorship resistance (DAI).`,
          lesson: `Every stablecoin trades off stability, decentralization, and risk. There's no perfect option — know what you're choosing.`,
        },
        {
          title: `The UST collapse — algorithmic death spiral`,
          scenario: `May 2022: TerraUSD (UST) backed by LUNA. Mechanism: if UST < $1, burn UST and mint LUNA (reducing supply). When large holders sold UST → peg slipped → confidence dropped → more selling → more LUNA minted → LUNA price crashed → UST had nothing backing it. 72 hours: $1 UST → $0.02. LUNA: $80 → $0.0001. $40 billion gone. Once confidence breaks in an algorithmic system, math can't save it.`,
          lesson: `Algorithmic stablecoins with no real backing fail catastrophically and fast. The history of DeFi is full of them — and full of their wreckage.`,
        },
        {
          title: `Stablecoins as the backbone of lending (connecting L1.8)`,
          scenario: `Marcus lends USDC on Aave and earns 5.2% APY. Why is USDC the most popular lending asset? Borrowers want stable debt — they know exactly what they'll repay. Lenders want yield without price exposure. If both sides used ETH, a 20% ETH price move would change the real value of every loan. Stablecoins make lending predictable.`,
          lesson: `Stablecoins are the lubricant of DeFi lending. Without them, every position becomes a directional price bet — stablecoins let you earn yield while staying neutral.`,
        },
      ],

      guidedPractice: [
        {
          question: `What problem do stablecoins solve in DeFi?`,
          options: [
            `A) They make crypto more volatile`,
            `B) They provide a stable store of value on blockchains — "cash" you can hold and use in DeFi without price exposure`,
            `C) They replace all other crypto tokens`,
            `D) They're only for speculation`,
          ],
          correct: `B) They provide a stable store of value on blockchains — "cash" you can hold and use in DeFi without price exposure`,
          hint: `Think about what "going to cash" means when there's no actual cash on a blockchain.`,
          explanation: `Without stablecoins, every DeFi position requires price exposure. When you want to sit out market volatility, stablecoins let you hold value at $1 while staying in the DeFi ecosystem — earning yield, providing liquidity, or just waiting.`,
        },
        {
          question: `What is the main risk of fiat-backed stablecoins like USDC?`,
          options: [
            `A) They depeg due to algorithmic failures`,
            `B) They require too much overcollateralization`,
            `C) The issuing company can freeze wallets and faces regulatory and insolvency risk`,
            `D) They have no liquidity on DEXes`,
          ],
          correct: `C) The issuing company can freeze wallets and faces regulatory and insolvency risk`,
          hint: `USDC is controlled by Circle — a centralized company regulated by governments. What can companies do?`,
          explanation: `Circle and Tether can blacklist wallet addresses on government orders, can fail as businesses, and face regulatory action. This is the core trade-off: maximum stability (backed 1:1 by real dollars) comes with maximum centralization risk.`,
        },
        {
          question: `Why did UST (TerraUSD) collapse in 2022?`,
          options: [
            `A) The team rug-pulled the protocol`,
            `B) It had no real backing — its peg relied on algorithms that created a death spiral when confidence broke`,
            `C) Ethereum had a bug that corrupted UST`,
            `D) Regulators shut it down`,
          ],
          correct: `B) It had no real backing — its peg relied on algorithms that created a death spiral when confidence broke`,
          hint: `UST was backed by LUNA — which was minted to restore the peg. What happens when LUNA itself loses value?`,
          explanation: `The mechanism: burn UST → mint LUNA → reduce UST supply → restore peg. When LUNA's price crashed, minting more LUNA flooded supply → LUNA crashed further → more minting → hyperinflation of LUNA → UST had no backing left. Once confidence broke, the math made things worse, not better.`,
        },
        {
          question: `Connecting to L1.8 (lending): why is USDC the most popular asset to borrow on Aave?`,
          options: [
            `A) It has the highest interest rates`,
            `B) Borrowers want price-stable debt — they know exactly how much USDC they'll need to repay, regardless of market conditions`,
            `C) Aave only accepts USDC`,
            `D) USDC has the most liquidity on Uniswap`,
          ],
          correct: `B) Borrowers want price-stable debt — they know exactly how much USDC they'll need to repay, regardless of market conditions`,
          hint: `If you borrowed ETH and ETH went up 50%, your debt just got 50% more expensive in USD terms.`,
          explanation: `Borrowing volatile assets creates unpredictable debt. Borrow 1 ETH at $2,000 → ETH goes to $3,000 → you now owe $3,000 in value. Borrowing USDC = your debt is always exactly $X. This predictability makes stablecoins the overwhelming choice for DeFi loans.`,
        },
        {
          question: `DAI is backed by ETH collateral (150% minimum). If all ETH collateral crashed 40% instantly, what would happen?`,
          options: [
            `A) DAI immediately becomes worthless`,
            `B) Liquidation mechanisms sell collateral to maintain backing, but an extremely fast crash could outpace liquidators — causing undercollateralized DAI and a depeg`,
            `C) MakerDAO adds more ETH from their treasury`,
            `D) DAI automatically adjusts to $0.60`,
          ],
          correct: `B) Liquidation mechanisms sell collateral to maintain backing, but an extremely fast crash could outpace liquidators — causing undercollateralized DAI and a depeg`,
          hint: `Liquidations take time. What if price crashes faster than liquidator bots can execute?`,
          explanation: `MakerDAO has liquidation bots — when collateral drops below thresholds, it's sold to maintain DAI's backing. But a flash crash (minutes) can outpace liquidators, leaving DAI undercollateralized. This is why MakerDAO diversifies collateral types and maintains a stability fee buffer — to absorb this tail risk.`,
        },
      ],

      lessonSimulations: [
        {
          type: `stablecoin-comparison`,
          scenario: `Sarah needs $10,000 in stablecoins for DeFi yield. She's choosing between USDC, DAI, and LUSD. For each: (A) What keeps it at $1? (B) Biggest risk? (C) Worst scenario?`,
          answer: {
            USDC: `(A) Circle holds $1 real dollar per USDC. (B) Circle insolvency, government seizure, or blacklisting. (C) Worst: government crackdown on Circle or if you're a sanctioned address.`,
            DAI: `(A) Overcollateralized ETH/USDC locked in MakerDAO vaults. (B) Collateral crash faster than liquidations. (C) Worst: ETH flash crash of 60%+ in minutes before liquidators act.`,
            LUSD: `(A) ETH-only collateral, 110% minimum, always redeemable for $1 of ETH. (B) ETH crash overwhelming the system. (C) Worst: extreme ETH volatility combined with high liquidation volume.`,
            keyInsight: `No stablecoin is risk-free. Each has a specific failure mode. Diversifying across types reduces single-point-of-failure risk.`,
          },
        },
        {
          type: `peg-analysis`,
          scenario: `Marcus sees USDC trading at $0.87 on Uniswap during a banking crisis (like SVB collapse in March 2023). Why is it off-peg? What would you do — sell, hold, or buy?`,
          answer: `Why off-peg: Silicon Valley Bank (where Circle held reserves) failed. Market feared Circle couldn't redeem all USDC. Temporary confidence crisis = temporary depeg. Analysis: Circle confirmed reserves were elsewhere. FDIC insured some deposits. Systemic risk: low. Result: USDC restored to $1 within 48 hours. Buying at $0.87 returned 15% in 2 days — but ONLY for those who understood the specific risk and confirmed Circle's solvency. This is NOT a general "buy all dips" strategy — some deregs don't recover (UST never did).`,
        },
        {
          type: `scenario-decision`,
          scenario: `Priya wants to earn "safe" yield on $20,000. Rank these from safest to riskiest and justify: (A) Lend USDC on Aave at 5%, (B) Provide DAI/USDC liquidity on Curve at 8%, (C) Hold LUSD in Liquity's stability pool at 4%.`,
          answer: `Safest: (C) LUSD stability pool — ETH-backed stablecoin, simple mechanism, risk limited to ETH crashes. Medium: (A) USDC on Aave — smart contract risk (Aave, battle-tested) + stablecoin risk (Circle). Riskiest: (B) DAI/USDC LP on Curve — LP risk + Curve smart contract risk + stablecoin risks for both assets. More yield layers = more risk layers. The 3% extra from Curve vs Liquity may not justify the additional complexity.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Stablecoin Crisis Simulation`,
        description: `Combining L1.8 (lending) + L1.9 (stablecoins). Your lending position uses USDC as collateral, and USDC just depegged to $0.85.`,
        challenges: [
          {
            scenario: `You borrowed $5,000 USDC against $10,000 of ETH on Aave (LTV 50%). USDC suddenly depegs to $0.85. Your "debt" in real value terms just increased. Does your health factor change? What actions can you take?`,
            answer: `Health factor impact: Aave uses oracles for collateral AND debt pricing. If USDC depeg is reflected in the oracle, your $5,000 USDC debt is still worth $5,000 USDC (just worth less in "real" USD). Collateral: your ETH value unchanged. Health factor: likely unchanged because both sides still measured in their respective tokens. BUT if you need to buy USDC to repay, you'd pay $0.85 per USDC — meaning repaying $5,000 USDC costs only $4,250 real dollars. Actions: if you have spare USDC, repay now while it's "cheap." If not, monitor closely. Key learning: how depeg affects YOUR position depends on whether you're holding or owe the depegged asset.`,
          },
          {
            scenario: `Design a $10,000 stablecoin portfolio that minimizes single-point-of-failure risk while maximizing yield. Use at least 3 different stablecoin types.`,
            answer: `Example: $4,000 USDC on Aave (5% APY — fiat-backed, simple, battle-tested). $3,000 DAI in Curve 3pool (8% from fees + CRV — crypto-backed, decentralized). $2,000 LUSD in Liquity stability pool (4% — ETH-backed, most decentralized). $1,000 FRAX on Frax Finance (6% — fractional-algorithmic, medium risk). Total: blended ~6.3% APY across 4 stablecoin types, 4 protocols, 4 different risk profiles. No single regulatory action, smart contract hack, or depeg collapses the whole portfolio.`,
          },
        ],
      },

      keyTakeaway: `Stablecoins are DeFi's "cash layer" — three types: fiat-backed (stable, centralized), crypto-backed (decentralized, complex), algorithmic (high risk, avoid pure versions). Always understand the mechanism before trusting it. A stablecoin is only as stable as its backing — and backing can fail fast.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.10 — INTRODUCTION TO YIELD
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'introduction-to-yield',
      title: `1.10 Introduction to Yield — Where Does the Money Actually Come From?`,
      subtitle: `20% APY sounds amazing. But if you can't explain where the yield comes from, you might be the yield.`,
      difficulty: 'foundation',
      previousLessonRef: `You've now learned swapping (L1.7), lending (L1.8), and stablecoins (L1.9). All three generate yield. This lesson is the master framework for evaluating ANY yield source in DeFi — the most important skill you'll develop.`,

      hook: `If a yield source doesn't have an obvious, sustainable income stream behind it — it's redistribution, not creation. High APY without a clear source means someone else is subsidizing you temporarily. Here's how to tell real from fake in 5 minutes.`,

      visualPrompt: `Four faucets over a bucket. First two (Trading Fees, Lending Interest) flow freely with steady streams. Third (Token Emissions) shows a token dripping in but a price arrow falling. Fourth (Points/Airdrops) shows a question mark. Caption: "Real yield flows from economic activity. Emissions are borrowed time. Know which faucet you're drinking from."`,

      explanation: `Let me tell you about the question every DeFi researcher asks.

You see a protocol offering 20% [APY] on [USDC]. Your bank offers 0.01%.

Question: Where does the 20% come from? Is it real? Will it last?

In [TradFi], yield comes from economic activity — businesses borrow to grow, pay interest, banks lend your savings at higher rates than they pay you. The yield is real because it comes from real value creation.

In [DeFi], there are four sources of yield — and only two of them are reliably real.

**Source 1: Trading Fees — Real Yield**

[Trading fees] — when someone swaps tokens on a [DEX], they pay a fee (typically 0.01%–1%). This fee goes to liquidity providers.

Real? Yes — comes from actual trading activity. Sustainable? As long as people trade. Find it: Uniswap, Curve, dYdX volume data on DeFiLlama.

**Source 2: Lending Interest — Real Yield**

[Lending interest] — borrowers pay interest to lenders. Demand to borrow creates real yield for depositors.

Real? Yes — from borrower demand. Sustainable? As long as people want leverage. Market-driven: high in bull markets, lower in bears.

**Source 3: Token Emissions — Inflationary Yield**

[Token emissions] — the protocol mints new governance tokens and distributes them as incentives. "Here's 1,000 FAST tokens/day for using our protocol."

Real? Only if the token holds value. The problem: more tokens minted → supply increases → price drops → yield disappears. Many "high APY" opportunities are almost entirely emissions that collapse to near zero within months.

[Inflation yield] — yield that comes from token minting. You earn more tokens, but each token is worth less. Net real yield may be zero or negative.

**Source 4: Points and Airdrops — Speculative**

[Points programs] — protocols award off-chain points redeemable for future token airdrops. APY-equivalent is unknown until the airdrop happens (if it happens).

Speculative: could be worth nothing, could be worth a lot. Not predictable.

**The Real Yield Test:**

"If all token emissions stopped today, would the protocol still generate yield?"

Yes → real yield. No → it was entirely inflationary.

**The formula every researcher uses:**

Annual Protocol Revenue ÷ TVL = Sustainable Real Yield APY

If Uniswap generates $300M/year in fees and has $3B TVL: sustainable yield = 10% for LPs. Any APY above that comes from emissions.

**APY vs APR — the math:**

[APR] — simple annual rate without compounding.
[APY] — rate with compounding included.

At 36% APR, compounding weekly: APY = (1 + 0.36/52)^52 − 1 ≈ 42.6%. Auto-compounding protocols apply this automatically.`,

      examples: [
        {
          title: `The 200% APY that became 8%`,
          scenario: `New protocol "FastYield" offers 200% APY on ETH: 180% from FAST token emissions, 20% from real protocol fees. After 3 months, FAST drops 90% (emissions inflate supply, early farmers sell). Real APY earned: 20% from fees + (180% × 10% remaining value) = 38% gross. After gas costs and the missed opportunity cost of holding FAST: maybe 15% net. The 200% headline was marketing for an 8% product.`,
          lesson: `Always decompose yield: what fraction is real (fees, interest) vs inflationary (token emissions that will be sold)? High emission yields can disappear within weeks as token prices fall.`,
        },
        {
          title: `Calculating real yield on Uniswap V3`,
          scenario: `Uniswap V3 generates $300M in annual trading fees. 100% goes to LPs. Total LP TVL: $3B. Real yield = $300M / $3B = 10% APY. This is completely real — it comes from people paying to swap tokens. No token is minted to create it. The 10% could decrease (if volume drops) or increase (if more people trade) — but it won't evaporate overnight like emission yield does.`,
          lesson: `Protocol Revenue / TVL is the foundational yield calculation. Do it for every protocol before depositing.`,
        },
        {
          title: `Lending yield follows market cycles`,
          scenario: `Aave's USDC supply APY: Bull market 2021 = 15-20% (high leverage demand → high borrow utilization → high rates). Bear market 2023 = 2-4% (low leverage demand → low utilization → low rates). Same protocol. Same mechanism. Yield varies 5-8x based purely on market conditions. Understanding this: DeFi lending yields are market rates, not fixed rates. You can't count on 15% forever — but the mechanism is always real.`,
          lesson: `Lending yield is real but cyclical. Plan for the bear market rate, be pleasantly surprised by the bull market rate.`,
        },
      ],

      guidedPractice: [
        {
          question: `A protocol offers 500% APY — 490% from their governance token emissions, 10% from real trading fees. After 6 months the governance token drops 80%. What is your approximate actual yield?`,
          options: [
            `A) Still 500%`,
            `B) Roughly 10% + (490% × 20%) = 108%`,
            `C) 10% real yield only — emissions are worthless`,
            `D) Negative — you lost money`,
          ],
          correct: `B) Roughly 10% + (490% × 20%) = 108%`,
          hint: `Token emissions × remaining token value = real earnings from emissions. If token dropped 80%, emissions are worth 20% of their original value.`,
          explanation: `490% nominal × 20% remaining value = 98% from emissions + 10% real = 108% total. BUT this assumes you held all the emitted tokens — if you'd sold them as earned before the drop, you'd have captured more. This is why experienced yield farmers sell emitted tokens immediately. The lesson: real yield is predictable; emission yield requires active management.`,
        },
        {
          question: `What is the "real yield test" for any DeFi protocol?`,
          options: [
            `A) Real yield is always above 5%`,
            `B) If all token emissions stopped today, would the protocol still generate yield for participants from its own activity?`,
            `C) Real yield only comes from lending protocols`,
            `D) Yield must come from Ethereum mainnet to be "real"`,
          ],
          correct: `B) If all token emissions stopped today, would the protocol still generate yield for participants from its own activity?`,
          hint: `Emissions are external incentives added on top. Real yield comes from the protocol's own economic activity.`,
          explanation: `Strip out all token emissions. What's left? If the answer is "nothing" — zero organic revenue. If the answer is fees from trading or interest from lending — that's real yield. GMX's 10% ETH yield to stakers is real because it comes from traders paying fees, not from printing GMX tokens.`,
        },
        {
          question: `Aave's USDC lending APY is 8% in a bull market and 2% in a bear market. The mechanism hasn't changed. Why?`,
          options: [
            `A) Aave team adjusts rates seasonally`,
            `B) Utilization rate changes with market conditions — high leverage demand in bull markets → high rates; low demand in bears → low rates`,
            `C) USDC supply changes cause this`,
            `D) Gas fees affect the lending rate`,
          ],
          correct: `B) Utilization rate changes with market conditions — high leverage demand in bull markets → high rates; low demand in bears → low rates`,
          hint: `From L1.8: utilization drives interest rates algorithmically. What drives borrowing demand?`,
          explanation: `In bull markets, traders borrow to leverage up. High demand → high utilization → algorithmic rate spikes → lenders earn more. In bears, leverage demand collapses → low utilization → rates fall. The mechanism is always real — yield just reflects the market's appetite for borrowing.`,
        },
        {
          question: `Protocol X: $200M TVL, $10M annual protocol revenue. What is the sustainable real yield for depositors?`,
          options: [`A) 5% APY`, `B) 2% APY`, `C) 10% APY`, `D) 20% APY`],
          correct: `A) 5% APY`,
          hint: `Sustainable yield = Annual Revenue / TVL.`,
          explanation: `$10M / $200M = 5% APY. This is the maximum real yield the protocol can sustainably pay from its own revenue. If it advertises 20% APY, the extra 15% must come from token emissions — and that portion will deflate as tokens are minted.`,
        },
        {
          question: `APR is 52%. You compound weekly. Approximate APY?`,
          options: [`A) 52%`, `B) 67.8%`, `C) 104%`, `D) 26%`],
          correct: `B) 67.8%`,
          hint: `APY = (1 + APR/52)^52 − 1. Weekly compounding amplifies returns.`,
          explanation: `(1 + 0.52/52)^52 − 1 = (1.01)^52 − 1 ≈ 0.678 = 67.8% APY. On $10,000, that's $6,780 vs $5,200 simple interest. This is why auto-compounding protocols emphasize APY — it makes the number look bigger and reflects the true return if you reinvest continuously.`,
        },
      ],

      lessonSimulations: [
        {
          type: `yield-decomposition`,
          scenario: `Evaluate three yield opportunities:
A: Uniswap V3 ETH/USDC — 12% APY from trading fees only
B: New protocol "MoonYield" — 80% APY (75% MOON token emissions, 5% real fees)  
C: Aave USDC supply — 5% APY from lending interest

For each: sustainability, real yield %, what happens in a bear market, and what happens if token emissions stop.`,
          answer: {
            A: `Real yield: 100% (12% from trading). Sustainable: yes, as long as ETH/USDC trades. Bear market: volume drops → fees drop → maybe 6-8%. Emissions stop: no impact (no emissions). Risk: impermanent loss if ETH price moves.`,
            B: `Real yield: 5% of 80% = 6.25% APY equivalent. Sustainable: only while MOON holds value. Bear market: MOON dumps → emissions worthless → drops to 5% real yield. Emissions stop: drops to 5% instantly. High risk.`,
            C: `Real yield: 100% (5% from borrowers). Sustainable: yes, tied to lending demand. Bear market: drops to 1-2%. Emissions stop: no impact. Safest option — real, boring, reliable.`,
          },
        },
        {
          type: `yield-calculation`,
          scenario: `Protocol Y: $500M TVL. Annual revenue from fees: $15M. They also emit $25M worth of governance tokens/year as incentives. 
(A) Real yield APY?  (B) Total advertised APY?  (C) What happens to total APY if governance token price drops 60%?`,
          answer: {
            A: `Real yield = $15M / $500M = 3% APY`,
            B: `Total = ($15M + $25M) / $500M = 8% APY`,
            C: `Emissions worth 40% of original: $15M + ($25M × 40%) = $15M + $10M = $25M / $500M = 5% APY. Real yield unchanged at 3%; emission yield drops from 5% to 2%.`,
          },
        },
        {
          type: `decision-scenario`,
          scenario: `Jake has $5,000. He sees: Aave USDC at 4%, Curve 3pool at 7% (half fees, half CRV emissions), and a new protocol at 45% (entirely CRV-like emissions). He needs this money back in 6 months. Rank his options.`,
          answer: `For 6-month horizon: Aave is best — predictable 4% real yield, withdraw anytime, no token management. Curve is second — 3.5% real from fees, 3.5% from CRV (sell immediately to lock in gains, but adds management complexity). New 45% protocol is worst — 6-month horizon is exactly when emission yields collapse as early farmers exit. With $5,000 and a 6-month need: don't chase yield. Aave. Take the 4%.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Full Yield Audit`,
        description: `Combining L1.7 (AMMs), L1.8 (lending), L1.9 (stablecoins), L1.10 (yield). Complete yield analysis.`,
        challenges: [
          {
            scenario: `Curve Finance offers 8% APY on a USDC/USDT/DAI pool. Breakdown: 3% from stablecoin swap fees, 2% from CRV token emissions, 3% from partner protocol bribes (external protocols pay to boost their pool). Analyze: what is real? What disappears in a bear market? What survives if CRV goes to zero?`,
            answer: `Real yield: 3% swap fees (from actual stablecoin trading volume — real and persistent) + 3% bribes (semi-real — depends on whether protocols keep paying, usually tied to their own business activity). CRV emissions (2%): disappears if CRV price collapses. Bear market impact: bribe income may drop as fewer protocols compete; fee income may drop as stablecoin swap volume decreases. CRV → zero: total drops from 8% to 6%. Minimum floor in sustained bear: probably 2-4%. Conclusion: 8% headline is partly real, partly dependent on token ecosystem health. Better than pure emission plays, not as safe as pure lending.`,
          },
          {
            scenario: `Build a $15,000 yield portfolio targeting 5-8% real APY with no more than 30% in any single protocol. Use only real yield sources (no pure emission plays). Allocate across stablecoin types from L1.9.`,
            answer: `Example: $5,000 Aave USDC supply (4-6% real, lending interest). $4,000 Curve USDC/USDT 3pool (3-5% real fees). $3,000 Morpho USDC (4-5% optimized lending, real yield). $3,000 Aave DAI supply (diversify stablecoin type). Blended real yield: ~4.5-5.5% APY. No single protocol > 33%. All real yield sources. Stablecoin diversification: USDC + DAI. No pure emissions. This is a boring, professional portfolio — boring is what keeps capital safe.`,
          },
        ],
      },

      keyTakeaway: `DeFi yield comes from four sources: trading fees (real), lending interest (real), token emissions (inflationary, time-limited), points (speculative). Real yield test: does yield exist without emissions? Sustainable APY = Protocol Revenue ÷ TVL. High APYs driven by emissions are like discounts that end — plan accordingly, or sell emissions as you earn them.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.11 — DeFi RISKS OVERVIEW
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'defi-risks-overview',
      title: `1.11 DeFi Risks Overview — The Six Patterns Behind Every Hack`,
      subtitle: `$10 billion lost in 3 years. Every single loss followed one of six patterns. Learn the patterns, not the hacks.`,
      difficulty: 'foundation',
      previousLessonRef: `You've now learned all major DeFi mechanisms: AMMs (L1.7), lending (L1.8), stablecoins (L1.9), yield (L1.10). This lesson is the most important: what can take your money in any of those systems — and how to check if a protocol is protected.`,

      hook: `Every major DeFi hack follows one of six patterns. Ronin Bridge ($625M), Wormhole ($320M), Beanstalk ($182M) — all fit the same six boxes. By the end of this lesson, you'll recognize them instantly.`,

      visualPrompt: `Six shield icons arranged in a circle, each color-coded by risk level: Smart Contract Bug (red shield, cracked), Oracle Manipulation (orange shield, distorted price feed), Bridge Exploit (red shield, broken chain), Governance Attack (yellow shield, voting power concentrated), Liquidation Cascade (orange shield, falling dominoes), Rug Pull (red shield, disappearing team). Caption: "Six patterns. Billions lost. Know them all before depositing a cent."`,

      explanation: `Let me tell you about the hacks that changed [DeFi].

In 2022 alone, over $3 billion was lost to hacks and exploits. People lost life savings. Protocols that seemed safe vanished overnight.

[DeFi] offers opportunities, but it also has risks that don't exist in traditional finance. Your job as a researcher: understand them so well that you can assess any protocol in 15 minutes.

**Risk 1: Smart Contract Exploits**

[Smart contract exploit] — an attacker finds a bug in the protocol's code and drains funds. The most common attack in DeFi.

Common vectors:
- [Reentrancy] — attacker calls a function that sends funds before updating balances, calls it again before it finishes. The DAO hack (2016): $60M.
- [Flash loan attack] — borrows a massive sum with no collateral (repaid in the same transaction) to manipulate prices or exploit edge cases.
- Logic errors — math that works in normal conditions breaks under edge cases.

Assess by: multiple audits from top firms, bug bounty program (size signals confidence), time deployed, TVL history (sudden drops = potential exploit).

**Risk 2: Oracle Manipulation**

[Oracle] — a service providing off-chain data (like ETH price) to smart contracts. Contracts can't access real-world data on their own.

[Oracle manipulation] — attackers manipulate the price feed that a protocol relies on. Example: Mango Markets (2022) — attacker pumped MNGO price on a thin market, used the inflated value as collateral to borrow everything in the treasury. $114M stolen.

Assess by: does the protocol use Chainlink (decentralized) or a single on-chain price source? Time-weighted average prices (TWAPs) are harder to manipulate than spot prices.

**Risk 3: Bridge Exploits**

Bridges hold enormous assets and have complex cross-chain logic — the largest single hack category in DeFi history.

Examples: Ronin Bridge ($625M, 2022 — validator keys compromised), Wormhole ($320M, 2022 — signature verification bug), Nomad ($190M, 2022 — initialization bug anyone could exploit).

[Cross-chain bridge] — locks tokens on one chain, mints equivalents on another. Every lock/mint mechanism is an attack surface.

Assess by: audit history, security model (multisig vs ZK proof vs optimistic), time deployed, team's incident response history.

**Risk 4: Governance Attacks**

[Governance attack] — attacker acquires enough voting power to pass malicious proposals.

Beanstalk (2022): attacker flash-loaned governance tokens, achieved instant majority, passed a proposal to drain $182M to their address, all in one transaction block. No timelock. No delay. Gone.

[Timelock] — a mandatory delay between a governance proposal passing and executing. Essential security feature. Without it, flash-loan attacks can pass and execute malicious proposals instantly.

Assess by: is there a timelock? (24h minimum, 48h+ preferred). Is voting power distributed or concentrated?

**Risk 5: Liquidation Cascades**

[Liquidation cascade] — a price drop triggers mass liquidations, which dump assets on DEXes, dropping prices further, triggering more liquidations.

March 2020: ETH crashed 50% in hours. Maker's liquidation mechanisms couldn't handle the volume. Some vaults liquidated with zero ETH returned. DAI depegged briefly.

Assess by: what is the protocol's overcollateralization buffer? Are there circuit breakers? How deep is DEX liquidity for the liquidated assets?

**Risk 6: Rug Pulls**

[Rug pull] — developers drain the protocol's funds and disappear. Usually new, unaudited protocols with anonymous teams and no token lockups.

Red flags: team is anonymous, no audit, team tokens unlock immediately, liquidity not locked, extreme APY with no obvious source.

**The researcher's 5-minute checklist:**
- Audit: who? When? Findings fixed? Multiple firms?
- Age: how long deployed? Any prior incidents?
- Admin key: timelock? Multisig? Or single wallet?
- Oracle: Chainlink? TWAP? Single source?
- TVL history: stable? Any sudden drops?
- Team: doxxed? Token vesting?`,

      examples: [
        {
          title: `Ronin Bridge — $625M and the validator key problem`,
          scenario: `Ronin Bridge (Axie Infinity) used 5/9 multisig validators. In March 2022, attackers compromised 4 Sky Mavis keys + 1 Axie DAO key (which had been given extra permissions). 5/9 achieved. They signed a withdrawal of 173,600 ETH + 25.5M USDC. The hack wasn't noticed for 6 days — no monitoring caught $625M leaving. The lesson: (1) validators controlled by related parties = effectively lower threshold, (2) monitoring matters as much as security.`,
          lesson: `Bridge security lives and dies by the security model. A 5/9 multisig where 5 are effectively one organization is functionally a 1/1 multisig. Always check who controls the keys.`,
        },
        {
          title: `Beanstalk — the 13-minute governance attack`,
          scenario: `Beanstalk had no timelock on governance. April 2022: attacker took out a $1B flash loan to temporarily acquire majority voting power. Passed a proposal to "donate" protocol assets to Ukraine. In the same transaction: executed the proposal. Sent $182M to their own wallet. Returned the flash loan. Net profit: $80M+. Total time: 13 minutes. The fix would have been trivial: a 24-hour timelock. The entire attack was only possible because proposal passing and execution happened in the same block.`,
          lesson: `A timelock is DeFi's most important governance safety feature. It costs nothing, provides enormous protection. Any protocol without one is accepting flash-loan governance attack risk.`,
        },
        {
          title: `Building a risk checklist in practice`,
          scenario: `New protocol "SafeYield" — 15% APY on ETH. Jake's checklist: Audits — two from mid-tier firms, 3 months ago, 0 criticals, 2 mediums fixed (B+). Age — 2 months deployed, no incidents (C, too new). Admin key — 3/5 multisig, NO timelock (C-, critical gap). Oracle — Chainlink + TWAP hybrid (A). TVL — growing steadily, no drops (B). Team — doxxed, LinkedIn-verifiable (B+). Overall: B-/C+. Action: deposit 5% of portfolio max. Monitor for timelock implementation.`,
          lesson: `Risk assessment is not binary. No protocol is perfectly safe. Grade each factor, size positions accordingly. Multiple red flags = reduce exposure. Never risk more than you can afford to lose on any single protocol.`,
        },
      ],

      guidedPractice: [
        {
          question: `What was the biggest hack category in DeFi by total losses?`,
          options: [
            `A) Smart contract bugs in DEXes`,
            `B) Bridges — cross-chain infrastructure`,
            `C) Centralized exchange hacks`,
            `D) Wallet phishing`,
          ],
          correct: `B) Bridges — cross-chain infrastructure`,
          hint: `Which DeFi component holds the most cross-chain value with the most complex multi-chain code?`,
          explanation: `Bridges hold enormous assets and require complex coordination between multiple chains — creating massive attack surfaces. Ronin ($625M), Wormhole ($320M), Nomad ($190M) are among the largest individual DeFi exploits ever. The cross-chain model itself creates unique security challenges not present in single-chain protocols.`,
        },
        {
          question: `What is a reentrancy attack?`,
          options: [
            `A) An attacker gaining access to a protocol multiple times per day`,
            `B) A bug where a function sends funds before updating balances — the recipient calls back into the function before it finishes, draining funds in a loop`,
            `C) An attacker re-entering a protocol after being banned`,
            `D) A flash loan that loops infinitely`,
          ],
          correct: `B) A bug where a function sends funds before updating balances — the recipient calls back into the function before it finishes, draining funds in a loop`,
          hint: `Think about the order of operations: send funds → update balance. What if the recipient calls back BEFORE the balance updates?`,
          explanation: `Reentrancy: contract sends ETH to attacker's contract → attacker's contract calls back into the original before the balance is updated → contract thinks attacker still has the old balance → sends again → loop until empty. The fix (checks-effects-interactions pattern) updates state BEFORE sending funds. The DAO hack (2016, $60M) was the most famous reentrancy attack.`,
        },
        {
          question: `Connecting to L1.8 (lending): how could oracle manipulation harm a lending protocol?`,
          options: [
            `A) It has no effect — lending doesn't use oracles`,
            `B) Manipulating the price oracle can make worthless collateral appear valuable, allowing massive overcollateralized borrowing with no intention to repay`,
            `C) Oracle attacks only affect DEX prices`,
            `D) Only stablecoin protocols use oracles`,
          ],
          correct: `B) Manipulating the price oracle can make worthless collateral appear valuable, allowing massive overcollateralized borrowing with no intention to repay`,
          hint: `Lending protocols use price oracles to value collateral and determine safe borrow limits. Feed it wrong prices...`,
          explanation: `Lending protocols trust oracle prices for collateral valuation. Manipulate the oracle to show 10x the real price → borrow 10x what collateral is actually worth → never repay → protocol holds worthless collateral. Mango Markets: attacker made MNGO appear worth $400M+ by manipulating a thin market, borrowed everything in the treasury.`,
        },
        {
          question: `Why did Beanstalk's governance attack succeed in 13 minutes — and what single feature would have prevented it?`,
          options: [
            `A) Beanstalk had weak passwords — two-factor authentication would have helped`,
            `B) No timelock — a mandatory delay between proposal passing and execution would have made flash-loan voting impossible`,
            `C) Beanstalk was on a slow chain — faster chain would have helped`,
            `D) The team was anonymous — doxxing would have prevented it`,
          ],
          correct: `B) No timelock — a mandatory delay between proposal passing and execution would have made flash-loan voting impossible`,
          hint: `Flash loans are repaid in the same transaction. If execution required a delay, the attacker couldn't maintain the borrowed voting power.`,
          explanation: `Flash loans are borrowed and repaid in one transaction. Without a timelock, governance proposals can pass AND execute in the same block — letting flash-loan borrowers achieve temporary majority and act before repaying. A 24h timelock means: attacker borrows, passes proposal, must wait 24h to execute, repays flash loan → no longer has majority → can't execute. Problem solved by one line of code.`,
        },
        {
          question: `You're evaluating a protocol: 3 months old, anonymous team, one audit from an unknown firm, no timelock, 50% APY. What's the risk level?`,
          options: [
            `A) Low — the audit provides good coverage`,
            `B) Extreme — multiple critical red flags stack to create very high rug/exploit probability`,
            `C) Medium — worth depositing $500 to test`,
            `D) The high APY compensates for the risks`,
          ],
          correct: `B) Extreme — multiple critical red flags stack to create very high rug/exploit probability`,
          hint: `Count the red flags: anonymous team + one weak audit + no timelock + extreme APY + 3 months old. Each is concerning alone. Together?`,
          explanation: `Red flag count: (1) anonymous team = no accountability, (2) one audit from unknown firm = minimal security verification, (3) no timelock = team can act instantly on funds, (4) 50% APY = unsustainable without massive token emissions that will dump, (5) 3 months = no battle testing. This exact profile describes hundreds of protocols that have rugged. Use at maximum for entertainment with money you can afford to lose entirely — never for savings.`,
        },
      ],

      lessonSimulations: [
        {
          type: `risk-assessment`,
          scenario: `Assess Aave V3 across all 6 risk categories. For each: what is Aave's protection and what scenario would cause it to fail?`,
          answer: {
            'Smart contract': `Protection: 20+ audits over 3+ years, $16M bug bounty, $5B+ TVL without major incident. Failure: zero-day in new feature code — always possible, probability extremely low.`,
            Oracle: `Protection: Chainlink oracles + price deviation circuit breakers + multiple data sources. Failure: coordinated Chainlink oracle manipulation — would require compromising the Chainlink network itself.`,
            Bridge: `Protection: Aave deploys separately on each chain — no bridge dependency for core functionality. Cross-chain messaging (Portal) has limited exposure. Failure: Portal-specific exploit with minimal impact.`,
            Governance: `Protection: 24h timelock on parameter changes, 10-day timelock on major upgrades, AAVE governance token distributed broadly. Failure: coordinated whale cartel or future flash-loan governance attack if protections weaken.`,
            'Liquidation cascade': `Protection: conservative LTV ratios (65-80%), diverse collateral types, efficient liquidator bot ecosystem. Failure: ETH drops 70% in 10 minutes (March 2020 magnitude but faster) before liquidators can act.`,
            'Rug pull': `Protection: fully public team (Stani Kulechov), decentralized governance, no admin key that directly controls funds. Failure: effectively impossible without full governance takeover (which itself would be visible and slow).`,
          },
        },
        {
          type: `hack-analysis`,
          scenario: `The Nomad Bridge hack (2022, $190M): a routine upgrade initialized a critical variable incorrectly, making any message with any "proof" appear valid. Once one attacker found this, hundreds of others copy-pasted the exploit transaction and drained the bridge in hours — a public crowd-hack. What risk category? What could have prevented it? What does it tell us about upgrade risk?`,
          answer: `Risk category: Smart contract (initialization bug during upgrade). Prevention: (1) more thorough audit of the specific upgrade code (not just the original), (2) formal verification of security invariants, (3) staged rollout with TVL cap to limit blast radius. Upgrade risk lesson: upgrades introduce new code = new risk even for "safe" protocols. Every upgrade should be treated as a new protocol launch from a security perspective — re-audited, staged, with emergency pause capability.`,
        },
        {
          type: `protocol-scorecard`,
          scenario: `Score Protocol X on the 5-minute checklist:
- Audits: Trail of Bits (2022) + OpenZeppelin (2023), all criticals resolved
- Age: 18 months, zero incidents
- Admin: 4/7 multisig, 48h timelock
- Oracle: Chainlink + 30-min TWAP
- TVL: $400M, stable for 12 months
- Team: fully doxxed, LinkedIn-verified backgrounds`,
          answer: `Audits: A (two top firms, recent, fixed). Age: A- (18 months, incident-free is significant). Admin key: B+ (4/7 multisig good, 48h timelock excellent). Oracle: A (Chainlink + TWAP hybrid is best practice). TVL: A (stable $400M for 12 months = strong signal). Team: A (doxxed, verifiable). Overall: A-. This is a high-quality protocol appropriate for meaningful allocation — not "set and forget" but appropriate for 15-25% of DeFi portfolio.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Full Protocol Risk Audit`,
        description: `Using all L1.1–L1.11 knowledge. Evaluate a protocol completely.`,
        challenges: [
          {
            scenario: `"DeltaSwap" — new DEX (L1.7 AMM mechanics) with a stablecoin pool (L1.9), offering 12% APY (L1.10). Details: Trail of Bits + OpenZeppelin audits, 6 months deployed, $50M TVL, team doxxed, Chainlink oracles, 48h timelock, 4/7 multisig. Yield: 8% swap fees + 4% DELTA token emissions. Write a complete risk score (A-F) for each of the 6 categories and an investment recommendation with position sizing.`,
            answer: `Smart contract: A- (two top audits, 6 months without incident). Oracle: A (Chainlink standard). Bridge: N/A. Governance: B+ (48h timelock + multisig = good, not perfect). Liquidation: N/A (not a lending protocol). Rug pull: B+ (doxxed + timelock limits instant rugs, but team still has power). Yield sustainability: B (8% real from fees = solid; 4% DELTA emissions = check unlock schedule and selling pressure). Overall: B+. Recommendation: appropriate for 10-20% of DeFi portfolio. Monitor DELTA token selling pressure — if early investors dump, the 4% emission yield evaporates and you're left with the 8% real yield only (still acceptable). Set a calendar reminder to re-evaluate at 3 months.`,
          },
        ],
      },

      keyTakeaway: `Six risk patterns cover every major DeFi hack: smart contract bugs, oracle manipulation, bridge exploits, governance attacks, liquidation cascades, rug pulls. Your 5-minute checklist: audit quality and age, protocol age, admin key setup (timelock?), oracle source, TVL stability, team transparency. No single factor is sufficient — assess all six before depositing anything meaningful.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.12 — DeFiLLAMA DASHBOARD
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'first-dashboard-defillama',
      title: `1.12 DeFiLlama — The Scoreboard of DeFi`,
      subtitle: `Open defillama.com. This is where every serious DeFi researcher starts their day.`,
      difficulty: 'foundation',
      previousLessonRef: `In L1.1–L1.11 you learned what DeFi protocols do and what risks they carry. DeFiLlama is the tool that shows you how they're actually performing right now — connecting theory to reality.`,

      hook: `Open defillama.com right now. You're looking at $100+ billion in DeFi in real time — every protocol, every chain, every yield opportunity. This lesson teaches you to read all of it in under 5 minutes.`,

      visualPrompt: `The DeFiLlama interface: left sidebar with protocol categories (DEXs, Lending, Bridges, Yield), main area showing TVL rankings with sparkline trend charts, chain filter options, and a search bar. One protocol highlighted showing a sudden TVL drop. Caption: "DeFiLlama: your real-time window into where DeFi money is — and where it's moving."`,

      explanation: `Let me tell you about the first tool every researcher learns.

[Maria] wanted to know: which [DeFi protocols] are actually being used? Where is the money going?

Her mentor said: "Go to [DeFiLlama]. It's the scoreboard for [DeFi]."

[DeFiLlama] is the most popular data site in DeFi. It tracks [TVL] across 3,000+ protocols and 200+ blockchains — all in one place, all free.

**What TVL means and why it matters:**

[TVL (Total Value Locked)] — the dollar value of all assets deposited in a protocol's smart contracts at a given moment.

TVL is DeFi's equivalent of "assets under management." A protocol with $5B TVL has $5B of tokens deposited by users trusting the protocol enough to lock funds. Higher TVL generally = more adoption, more trust, more battle-testing.

What TVL tells you: which protocols users actually trust, how adoption trends over time, which chains are gaining or losing market share.

What TVL doesn't tell you: whether the protocol is profitable (see L1.13 Token Terminal), whether TVL is "real" (some is team-owned or incentive-driven and will leave).

**The key pages you'll use daily:**

**Overview** (defillama.com) — total DeFi TVL, top protocols, daily/weekly/monthly changes. Your starting point every morning.

**Chains** (defillama.com/chains) — TVL by blockchain. Watch which chains are gaining market share over time — this tells you where capital and developers are moving before price reflects it.

**Categories** — filter by DEXs, Lending, Bridges, Yield, CDP, etc. Compare protocols within the same category to find leaders and challengers.

**Individual protocol pages** — click any protocol for TVL history chart, chain breakdown, token price, audits, external links. This is where research begins.

**Yields** (defillama.com/yields) — all yield opportunities ranked by APY, filterable by chain and asset. Your yield discovery tool — always apply L1.10 analysis to everything you find here.

**Key metrics to track:**

[TVL change] — % change over 24h/7d/30d. Sustained decline = users leaving. Sustained growth = adoption momentum.

[Chain market share] — what % of total DeFi TVL is on each chain? Ethereum still dominates but L2s are growing. Watching this shift is like watching tectonic plates move slowly — but when they move, everything changes.

[Protocol dominance] — within a category (e.g., DEXs), what % does Uniswap hold? Dominance indicates competitive moat.`,

      examples: [
        {
          title: `Spotting an exploit via TVL drop`,
          scenario: `Jake checks DeFiLlama on a Monday morning and sees a Lending protocol dropped from $800M TVL to $200M overnight (−75%). No announcement. He immediately checks: Twitter/Discord (finds "vulnerability discovered, team pausing protocol"), Etherscan (large outgoing transactions visible), DeFiLlama historical chart (confirms the exact hour of the drop). Jake wasn't invested — but he learned to watch for sudden TVL drops as the earliest on-chain signal of exploits.`,
          lesson: `DeFiLlama is often the first place an exploit is visible. A sudden unexplained TVL drop is a red flag — investigate before the Twitter mob figures it out.`,
        },
        {
          title: `Reading chain market share shifts`,
          scenario: `Maria checks DeFiLlama's Chains page weekly for 3 months. Ethereum: 58% → 54% (−4%). Arbitrum: 7% → 12% (+5%). Base: 2% → 5% (+3%). Solana: 5% → 8% (+3%). Trend: ETH L2s + Solana gaining at Ethereum mainnet's expense. This informs her thesis: deploy capital on growing chains before liquidity fully migrates — earlier positioning, lower gas costs (from L1.6), access to yield before it's crowded.`,
          lesson: `TVL market share shifts are slow-moving but predictable. Watching them weekly builds conviction on chain momentum before price moves confirm it.`,
        },
        {
          title: `Yield discovery with L1.10 filter applied`,
          scenario: `Priya wants ETH yield on Arbitrum (low gas from L1.6). She goes to defillama.com/yields, filters: Asset = ETH, Chain = Arbitrum. Results: Aave V3 (2.8%), Morpho (3.4%), Pendle (6.2% for fixed-rate ETH-PT). Applying L1.10: Aave and Morpho = real yield (from borrower interest). Pendle = more complex yield-stripping (still real but requires understanding the mechanism). She picks Morpho: higher yield than Aave, same real-yield category, smaller TVL means more research needed (L1.11 checklist applied next).`,
          lesson: `DeFiLlama yields page is the fastest way to find opportunities. But it shows numbers, not safety. Always apply L1.10 (is it real?) and L1.11 (is it safe?) to every result.`,
        },
      ],

      guidedPractice: [
        {
          question: `What does TVL measure?`,
          options: [
            `A) Total trading volume on a DEX`,
            `B) The total dollar value of all tokens deposited in a protocol's smart contracts`,
            `C) Token velocity level`,
            `D) Total virtual liquidity available`,
          ],
          correct: `B) The total dollar value of all tokens deposited in a protocol's smart contracts`,
          hint: `"Locked" = deposited into the protocol's smart contracts by users.`,
          explanation: `TVL is the dollar value of everything deposited — lending deposits, LP positions, staked tokens. It's the primary measure of adoption. A protocol with $5B TVL has $5B of real user assets trusting the protocol's code.`,
        },
        {
          question: `Protocol A: $2B TVL declining 10%/month. Protocol B: $400M TVL growing 20%/month. Same category. What does this tell you?`,
          options: [
            `A) Protocol A is better — it has more TVL`,
            `B) Protocol B has momentum while Protocol A is losing users — trend often matters more than the current snapshot`,
            `C) Both are equally positioned`,
            `D) Protocol B is too small to be worth researching`,
          ],
          correct: `B) Protocol B has momentum while Protocol A is losing users — trend often matters more than the current snapshot`,
          hint: `Where will Protocol B be in 6 months at 20%/month growth? Where will Protocol A be at −10%/month?`,
          explanation: `Protocol B at $400M growing 20%/month → $1.19B in 6 months. Protocol A at $2B declining 10%/month → $1.06B in 6 months. Protocol B will likely surpass A. More importantly: growth signals product-market fit, new users, competitive advantage. Decline signals users leaving — always investigate why.`,
        },
        {
          question: `Connecting to L1.11: you see a protocol's TVL drop $200M in 2 hours. What should you do first?`,
          options: [
            `A) Buy the protocol's token — dips are buying opportunities`,
            `B) Check Twitter/Discord and Etherscan to determine: exploit, rug, or voluntary user withdrawal`,
            `C) Wait 24 hours to see if TVL recovers`,
            `D) Report it to DeFiLlama as a data error`,
          ],
          correct: `B) Check Twitter/Discord and Etherscan to determine: exploit, rug, or voluntary user withdrawal`,
          hint: `From L1.11: sudden TVL drops are a primary red flag for exploits or rug pulls — investigate before concluding.`,
          explanation: `$200M in 2 hours requires immediate investigation. Check: (1) official channels for announcements, (2) Etherscan for large suspicious transactions, (3) is the protocol paused? Three possible explanations: exploit (bad — exit immediately if you're deposited), rug pull (bad — too late), or large whale withdrawal (neutral — investigate why a whale left). Never "buy the dip" on unexplained sudden TVL drops.`,
        },
        {
          question: `What does "chain market share" on DeFiLlama's Chains page reveal?`,
          options: [
            `A) Which chain has the lowest gas fees`,
            `B) What percentage of total DeFi TVL is on each blockchain — showing where capital and users are concentrated`,
            `C) The number of users on each chain`,
            `D) Which chains have the most token listings`,
          ],
          correct: `B) What percentage of total DeFi TVL is on each blockchain — showing where capital and users are concentrated`,
          hint: `Market share = each chain's slice of the total DeFi pie.`,
          explanation: `Chain market share shows you the competitive landscape of blockchains. Ethereum has dominated (60%+ historically) but Arbitrum, Base, Optimism, and Solana are gaining. Watching share shift weekly builds conviction on where the industry is heading — before token prices reflect the trend.`,
        },
        {
          question: `You find a 45% APY opportunity on DeFiLlama's yields page. Before depositing, what L1.10 and L1.11 questions must you answer?`,
          options: [
            `A) Deposit immediately — DeFiLlama only shows safe opportunities`,
            `B) What % of yield is real (fees/interest) vs token emissions? Who audited it? How old is the protocol? Is there a timelock?`,
            `C) Check if APY is above 50% — below that is always safe`,
            `D) Only check if the protocol is on Ethereum mainnet`,
          ],
          correct: `B) What % of yield is real (fees/interest) vs token emissions? Who audited it? How old is the protocol? Is there a timelock?`,
          hint: `DeFiLlama shows yield numbers. It doesn't tell you if they're sustainable (L1.10) or safe (L1.11).`,
          explanation: `DeFiLlama is a data aggregator — it shows what exists, not what's safe or real. Apply your full framework: (1) Yield decomposition from L1.10 — what's real vs emissions? (2) Risk assessment from L1.11 — audits, age, TVL stability, admin keys, timelock. A 45% APY from a 3-month-old protocol with no timelock is completely different from 45% APY on a well-established protocol with clear yield sources.`,
        },
      ],

      lessonSimulations: [
        {
          type: `live-research`,
          scenario: `Open defillama.com. Your task: find the top 3 protocols by TVL in the "Lending" category on Arbitrum. For each, record: protocol name, current TVL, 30-day TVL change, and one observation about what the trend suggests.`,
          answer: `Live research task — open defillama.com → filter "Lending" category → filter "Arbitrum" chain. Expected finding (approximate): Aave V3 (likely #1, stable/growing TVL), Compound V3 or similar (#2), a newer protocol (#3 with potentially higher growth rate but lower absolute TVL). Observation examples: "Aave's stable TVL suggests sticky user base"; "Newer protocol growing 30% monthly suggests competitive pressure"; "If 2 of 3 are declining, lending demand on Arbitrum may be softening." The research skill is in the observation, not just the numbers.`,
        },
        {
          type: `yield-screening`,
          scenario: `Jake has $5,000 USDC he wants to deploy. Using defillama.com/yields, filter for USDC on Arbitrum. Identify the top 3 opportunities by APY. For each: classify the yield type (L1.10) and give a preliminary risk score (L1.11). Which one should he use?`,
          answer: `Live research task. Expected approach: top result might be a newer protocol with 15%+ from emissions (L1.10 = inflationary, L1.11 = check audit/age). Middle result: Morpho or Aave V3 at 4-6% (real yield from lending interest, A-tier safety). Lower result: might be Compound at 3-4% (real yield, B+). Recommendation: for $5,000, Aave or Morpho. Reason: real yield (L1.10) + battle-tested safety (L1.11). The extra 10% from the high-emission protocol isn't worth the risk on a meaningful amount.`,
        },
        {
          type: `chain-analysis`,
          scenario: `Check DeFiLlama's Chains page. Identify: which 3 chains grew market share the most in the last 30 days? Which chain lost the most? What thesis does this data support?`,
          answer: `Live research task. Expected finding pattern (mid-2024): Base and Arbitrum likely gaining. Some alt-L1 declining. Ethereum mainnet slowly giving share to L2s. Thesis that data might support: "L2 adoption accelerating — capital migrating from mainnet to L2s for lower fees while keeping Ethereum security." Or: "Solana gaining from retail activity during specific market conditions." The thesis should follow from the data, not precede it. This is what real research looks like.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: DeFiLlama Research Sprint`,
        description: `Applying L1.1–L1.12. Use DeFiLlama to build a complete picture of one protocol in 15 minutes.`,
        challenges: [
          {
            scenario: `Pick any DeFi protocol you're curious about. Using ONLY DeFiLlama, answer: What does it do (L1.3 — which primitive)? What chain(s) is it on? What is its TVL and 30-day trend? Did its TVL ever drop suddenly (L1.11 exploit red flag check)? What yield opportunities does it offer (L1.10)? Summarize in 5 bullet points as if briefing Marcus.`,
            answer: `Format expected: "Protocol: Morpho Blue. Primitive: Lending (L1.3). Chain: Ethereum + Base. TVL: $2.1B, +12% 30-day (growing). Historical: one small TVL dip in Oct 2023 (investigated — market-wide withdrawal, not exploit). Yield: USDC supply 5.2% on Arbitrum via Aave integration (real yield, lending interest). Summary: Growing lending protocol with real yield, no exploit history, multi-chain expansion underway. Appropriate for research deepdive before allocating."`,
          },
          {
            scenario: `Use DeFiLlama to find a protocol you've never heard of with: TVL between $10M-$100M (not too big, not too small), growing TVL last 30 days, and available on an L2 chain. Apply the L1.11 risk checklist to it. Would you deposit $500 to learn?`,
            answer: `This is a real-world research exercise. The answer depends on what the researcher finds. Assessment criteria: passing = audit exists + team visible + timelock present + TVL growth organic (not just incentives launching). Failing = any of: no audit + no timelock + anonymous team + APY > 50% with unclear source. The purpose: practice real risk assessment on something small enough that $500 is a learning investment, not a life-changing loss.`,
          },
        ],
      },

      keyTakeaway: `DeFiLlama is your daily research dashboard — TVL, trends, chain market share, and yield opportunities all in one place. Sudden TVL drops = investigate immediately. Growing TVL + chain market share = adoption momentum. Always apply L1.10 (is this yield real?) and L1.11 (is this protocol safe?) to everything you find. DeFiLlama shows the numbers — you supply the analysis.`,
    },

  ],
}
