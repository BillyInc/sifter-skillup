// ============================================================================
// SIFTER SKILLUP — DeFi RESEARCH ANALYST Career Track
// Lab 6: Stablecoins Deep Dive (Part A — Lessons 5.1–5.5)
// Append to defi_lab_6.ts lessons array
// ============================================================================

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.1 — WHY STABLECOINS EXIST
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'why-stablecoins-exist',
      title: `5.1 Why Stablecoins Exist — Volatility Is the Enemy of Utility`,
      subtitle: `Crypto is the settlement layer. Stablecoins are the unit of account. Without them, DeFi would be unusable for anything practical.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 5 covered lending in depth — and nearly every lending position uses stablecoins as either the deposited asset or the borrowed asset. Lab 6 goes one level deeper: what stablecoins actually are, how each type maintains its peg, and what happens when they do not.`,

      hook: `In May 2022 Terra's UST stablecoin went from $1.00 to $0.003 in 72 hours. $40 billion evaporated. Every DeFi protocol built on UST broke simultaneously. The collapse revealed a truth the market had ignored: not all stablecoins are stable for the same reason — and the reason matters enormously.`,

      visualPrompt: `A timeline: ETH price over 2021–2022 (violent up and down swings). Overlaid: USDC price over the same period (flat at $1.00 except for one brief $0.87 dip in March 2023). Below: a DeFi protocol showing a lending pool with ETH as collateral and USDC as the borrowed asset. Caption: "Volatility is the enemy of utility. The borrowed asset must stay at $1 — or every calculation in lending, trading, and payments breaks."`,

      explanation: `Let me tell you about why stablecoins exist.

Imagine trying to price a sandwich in ETH. On Monday your $10 sandwich costs 0.003 ETH. On Friday it costs 0.007 ETH. The sandwich did not change. ETH did. This is why crypto needs stablecoins.

[Stablecoin] — a token designed to maintain a stable value, almost always pegged to $1 USD, by using one of three mechanisms: fiat backing, crypto overcollateralisation, or algorithmic supply management.

**The problem stablecoins solve:**

DeFi lending requires a stable unit of account. If you borrow ETH to deploy in a strategy, your repayment amount fluctuates with ETH price — impossible to plan around. Borrow USDC: you repay exactly $1 per USDC regardless of market movements.

DEX trading pairs require a stable numeraire. ETH/USDC is the market standard. Without USDC, every token would need a direct pair against every other token — logistically impossible at scale.

Payments and remittances require price certainty. Paying someone 0.003 ETH today might be $10 or $6 depending on when they check the price. Paying 10 USDC is always $10.

**Why DeFi cannot function without stablecoins:**

The entire lending ecosystem (Lab 5) relies on stablecoins as the primary borrowed asset. Borrowers take USDC/DAI loans because the repayment amount is predictable. Depositors hold USDC because 5% APY on a $1 asset is calculable in dollar terms.

DEX liquidity depends on stablecoin pairs for price discovery. Every token ultimately prices itself against USDC or USDT.

Yield strategies (Lab 4) denominate returns in dollar terms. "8% APY" means 8% of your starting dollar value — which requires a stable dollar-denominated asset.

**The $1 peg — why it is harder than it looks:**

Maintaining a $1 peg requires a credible mechanism that forces the token back to $1 whenever it deviates. Three fundamentally different mechanisms exist, each with different strengths and catastrophic failure modes. Understanding which mechanism backs a stablecoin is the single most important fact a researcher can know about it.`,

      examples: [
        {
          contextTag: `[Researcher, stablecoin use case mapping]`,
          context: `Maya is building a DeFi protocol overview and needs to map all the places stablecoins appear in a typical user's DeFi activity.`,
          scenario: `User journey: (1) User onboards ETH. (2) Deposits stETH on Aave — uses stETH as collateral, borrows USDC (stablecoin as debt asset). (3) Deploys USDC on Curve 3pool for stable yield (stablecoin as LP asset). (4) Uses some USDC to swap for a new token on Uniswap (stablecoin as numeraire in the pair). (5) Sends USDC cross-chain via Stargate (stablecoin as cross-chain settlement asset). At every step: a stablecoin is either the borrowed asset, the yield-generating asset, the pricing reference, or the transfer medium. Remove stablecoins from DeFi: the entire system collapses to barter.`,
          outcome: `Maya's map shows five distinct stablecoin use cases in one user journey. She documents this as context for the stablecoin section — stablecoin risk is protocol-wide risk, not just asset risk.`,
        },
        {
          contextTag: `[Historical researcher, the pre-stablecoin DEX problem]`,
          context: `Priya is explaining to a new team member why early DEXes in 2017–2018 struggled before USDC existed.`,
          scenario: `Pre-USDC DEX landscape: every token pair was token/ETH (e.g. MKR/ETH, BAT/ETH). To trade MKR for BAT: you had to sell MKR for ETH, then sell ETH for BAT — two transactions with two price exposures. An ETH price move between the two transactions changed your effective exchange rate. The "dollar value" of your BAT at trade execution was not what you thought it would be when you started. USDC launched September 2018. Within 12 months: most DEX volume shifted to token/USDC pairs. The MKR/USDC pair is a direct exchange at a predictable dollar price. No intermediate ETH exposure.`,
          outcome: `Priya's historical analysis demonstrates: stablecoins did not add a new feature to DeFi — they made DeFi calculable in human-understandable terms (dollars), which is what unlocked mass adoption.`,
        },
        {
          contextTag: `[Risk analyst, systemic stablecoin failure]`,
          context: `Jake studies the May 2022 Terra/UST collapse to understand how stablecoin failure propagates across DeFi.`,
          scenario: `UST at $1: Anchor Protocol lending, Mirror Protocol synthetic stocks, and dozens of DeFi apps used UST as their denominated asset. When UST broke its peg: (1) Anchor's 19.5% "stable" yield on UST became worthless — $15B in deposits lost their dollar value. (2) Mirror Protocol synthetic stocks priced in UST lost their dollar reference — trades executed at arbitrary prices. (3) Every protocol holding UST in treasury took an immediate 97% writedown. The stablecoin was the foundation. When the foundation broke, every building on it fell.`,
          outcome: `Jake documents: stablecoin choice is protocol-existential risk. A protocol denominating its core activities in an algorithmic stablecoin is betting its entire operation on that stablecoin's mechanism working indefinitely. The Terra collapse is the permanent reference case for why mechanism analysis precedes yield analysis.`,
        },
      ],

      keyTakeaway: `Stablecoins exist because DeFi requires a stable unit of account for lending (predictable repayment), DEX trading (dollar-denominated price discovery), yield strategies (calculable APY), and cross-chain settlement. The $1 peg is maintained by three fundamentally different mechanisms — fiat backing, crypto overcollateralisation, and algorithmic supply management — each with different failure modes. A stablecoin's mechanism is more important than its yield. UST's 2022 collapse ($40B in 72 hours) is the permanent case study for why mechanism analysis is non-negotiable before any stablecoin allocation.`,

      guidedPractice: [
        {
          question: `A DeFi lending protocol accepts only ETH as collateral and only lends ETH. What fundamental problem does the absence of stablecoins create for borrowers?`,
          options: [
            `A) No problem — ETH is a perfectly usable loan asset`,
            `B) The repayment amount fluctuates with ETH price — a borrower who takes a loan to fund a dollar-denominated business cannot plan repayment when both the loan value and their collateral value change daily`,
            `C) ETH lending protocols have higher gas costs`,
            `D) Only stablecoins can be used as collateral`,
          ],
          correct: 1,
          explanation: `A business owner borrowing 1 ETH ($3,000) to fund operations might owe back 1 ETH ($5,000) six months later. The dollar value of their debt has changed despite borrowing the same token amount. Stablecoins solve this: borrow $3,000 USDC and owe back $3,000 USDC regardless of ETH price movements. The predictability of the repayment obligation is what makes DeFi lending useful for real-world economic activity.`,
          hint: `What does a borrower need to know when planning to repay a loan? If the repayment amount changes daily in dollar terms, how do they plan?`,
        },
        {
          question: `Why is USDC described as the "numeraire" in DeFi token pairs?`,
          options: [
            `A) USDC is the most valuable token in DeFi`,
            `B) USDC serves as the stable unit against which all other tokens are priced — ETH/USDC, ARB/USDC, and thousands of other pairs all express token value in dollar terms, making prices human-readable and comparable`,
            `C) USDC was the first token ever created`,
            `D) USDC is the governance token for DeFi`,
          ],
          correct: 1,
          explanation: `Numeraire = the unit of measurement in a price system. In DeFi: USDC and USDT serve as the dollar-equivalent numeraire. Pricing tokens against USDC means every price is a dollar price — human-interpretable without any conversion. Without stablecoin numeraires, token prices would only exist as ratios to other volatile assets (ETH/BTC), requiring constant re-calculation in dollar terms as both sides of the pair fluctuate.`,
          hint: `What does "numeraire" mean in economics? What role does the dollar play in traditional finance pricing?`,
        },
        {
          question: `What made Terra's UST collapse so devastating for DeFi protocols beyond UST itself?`,
          options: [
            `A) UST was only used by one protocol — Anchor`,
            `B) UST had become the foundational stablecoin for dozens of DeFi protocols — when it broke its peg, every calculation, balance, and contract denominated in UST simultaneously lost its dollar anchor`,
            `C) The collapse was caused by a smart contract hack`,
            `D) Only UST holders lost money — other DeFi protocols were unaffected`,
          ],
          correct: 1,
          explanation: `UST's failure was systemic precisely because it was foundational. Anchor ($15B in deposits), Mirror Protocol (synthetic stocks), dozens of treasury holdings and LP positions — all denominated in UST. When UST broke: every protocol treating UST as a dollar-equivalent immediately faced a 97% write-down on its UST holdings. The interconnection that made UST valuable (widespread use) became the interconnection that made its failure catastrophic.`,
          hint: `Think of UST as the concrete slab under multiple buildings. If the slab cracks, what happens to the buildings on it?`,
        },
        {
          question: `Connecting to Lab 5 (L4.1): why must the borrowed asset in a DeFi lending protocol be stable?`,
          options: [
            `A) Regulations require stable borrowed assets`,
            `B) The borrower's debt obligation must be calculable at any future moment — if borrowed ETH rises 50% before repayment, the borrower owes 50% more in dollar terms than they planned, potentially making the loan unprofitable or unrepayable`,
            `C) Stable assets have lower interest rates`,
            `D) Liquidation mechanics only work with stable assets`,
          ],
          correct: 1,
          explanation: `From L4.1: borrowers calculate whether a strategy is profitable by comparing their yield to their borrow cost. If borrow cost is in a volatile asset, the calculation is impossible to hold stable. Borrowing USDC: $5,000 borrowed, $5,000 + interest owed — completely predictable. Borrowing ETH: $5,000 worth of ETH borrowed, but at repayment the same ETH might be worth $8,000 or $2,000. The strategy becomes a directional ETH bet regardless of the underlying DeFi activity.`,
          hint: `From L4.1: borrowers compare yield to borrow cost to determine profitability. What happens to that calculation if the borrow cost denominator changes daily?`,
        },
        {
          question: `A researcher identifies a new DeFi protocol offering 25% APY denominated in their own new "stablecoin." What is the first question they must ask before evaluating the yield?`,
          options: [
            `A) What is the current market cap of the stablecoin?`,
            `B) What mechanism maintains the $1 peg — and has that mechanism been stress-tested under market volatility? The yield is meaningless if the "stable" asset is not actually stable.`,
            `C) Who are the team members?`,
            `D) What is the TVL of the protocol?`,
          ],
          correct: 1,
          explanation: `25% APY in a stablecoin that depegs to $0.10 is a −90% loss plus 25% nominal yield = −87.5% net. Mechanism analysis precedes yield analysis, always. The three questions for any stablecoin: (1) What backs it? (2) Under what conditions would the backing fail? (3) Has it been tested under real market stress? Without these answers, the APY number is decorative.`,
          hint: `From UST's history: 19.5% APY was real. The stablecoin mechanism was not. What was worth more — the yield or the peg stability?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `A new DeFi fund states their strategy: "We will hold 40% of our treasury in ProtocolX stablecoin (PXUSD) to earn their 18% APY. PXUSD maintains its peg through an algorithmic mechanism backed by the PXGOV token." Apply the stablecoin mechanism framework from this lesson: (A) What type of stablecoin is PXUSD? (B) What is the catastrophic failure mode for this type? (C) What specific question about the mechanism must be answered before this allocation is defensible? (D) What is the maximum allocation you would recommend for a mechanism that has never been stress-tested?`,
          scoringCriteria: [
            `Identifies PXUSD as algorithmic (backed by its own governance token — same structure as UST/LUNA)`,
            `Correctly identifies the death spiral failure mode: token drops → confidence in peg drops → selling pressure → token drops further → peg breaks`,
            `Names the critical question: what is the exogenous backing or circuit breaker if PXGOV price collapses 80%+ simultaneously with a peg attack?`,
            `Recommends zero or symbolic allocation (1–2% max) for an unstressed algorithmic stablecoin in a fund treasury`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to Lab 5 (L4.1): map the stablecoin dependency chain for a typical leveraged staking position: deposit stETH on Aave → borrow USDC → swap USDC to stETH → re-deposit. Identify: (A) which stablecoin is used and where, (B) what happens to the entire strategy if USDC depegs to $0.92 (as briefly occurred in March 2023), (C) what happens if DAI is used instead of USDC, (D) which stablecoin choice minimises systemic risk for this strategy?`,
          scoringCriteria: [
            `Correctly identifies USDC as the borrowed asset — the debt obligation is denominated in USDC`,
            `USDC depeg to $0.92: borrowed debt effectively worth $0.92 per USDC — repaying is cheaper in dollar terms, but Aave oracle may not immediately reflect depeg, creating health factor uncertainty`,
            `DAI substitution: DAI is crypto-backed (ETH/stETH) — a stETH depeg that threatens the leveraged position ALSO threatens DAI's collateral, creating correlated risk`,
            `Recommends USDC despite centralisation risk for this specific strategy — its fiat backing is independent of ETH/stETH price, avoiding correlated risk`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Pull the current stablecoin market cap data from DeFiLlama or CoinGecko. Record the top 5 stablecoins by market cap and their peg mechanism type. Calculate: what percentage of total stablecoin market cap is fiat-backed vs crypto-backed vs algorithmic? What does this distribution reveal about the market's revealed preference for stablecoin mechanism safety?`,
          scoringCriteria: [
            `Correctly identifies USDT and USDC as the dominant fiat-backed stablecoins`,
            `Correctly classifies DAI/LUSD/FRAX as crypto-backed or hybrid`,
            `Correctly identifies any remaining pure algorithmic stablecoins at very small market cap post-UST`,
            `Interprets distribution: fiat-backed dominance (typically 85%+ of market cap) reflects market's revealed preference for proven, simple mechanisms over higher-yield experimental ones`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.2 — STABLECOIN TYPES
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'stablecoin-types',
      title: `5.2 Stablecoin Types — Three Mechanisms, Three Risk Profiles`,
      subtitle: `Fiat-backed, crypto-backed, and algorithmic. Each maintains its $1 peg differently. Each fails differently. Knowing the difference is knowing the risk.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.1 you learned why stablecoins exist and why mechanism analysis precedes yield analysis. This lesson maps the three mechanism types in detail: how each works, what keeps the peg, and what the catastrophic failure mode looks like for each.`,

      hook: `USDT, USDC, DAI, LUSD, UST, FRAX, sUSD — all described as "stablecoins." All targeting $1. But USDT is backed by dollars in a bank. DAI is backed by ETH in a smart contract. UST was backed by nothing but game theory. Three completely different products with three completely different ways to lose your dollar.`,

      visualPrompt: `A three-column comparison: Left (fiat-backed) — a bank vault with dollars, "1 USDC = $1 in Circle's bank account." Centre (crypto-backed) — ETH locked in a vault, "1 DAI = $1.50 ETH locked, over-collateralised." Right (algorithmic) — a circular arrow between token A and token B, "1 UST = burn $1 of LUNA, or mint $1 of LUNA." Below each: a failure mode label. Left: "Bank failure/freeze." Centre: "ETH crashes past liquidation." Right: "LUNA crashes → spiral."`,

      explanation: `Let me tell you about the three ways to make a dollar.

All stablecoins target $1 but use completely different mechanisms. Understanding the mechanism tells you: who controls the supply, what assets back it, under what conditions it fails, and whether the failure is recoverable or existential.

**Type 1: Fiat-Backed (Centralised)**

[Fiat-backed stablecoin] — for every token in circulation, the issuer holds $1 (or equivalent) in a bank account, US Treasury bills, or money market funds.

Examples: USDC (Circle), USDT (Tether), BUSD (Binance/Paxos), USDP (Paxos).

How the peg holds: arbitrage. If USDC trades at $1.01: institutions redeem USDC directly with Circle for $1.00, selling the $0.01 premium. If USDC trades at $0.99: institutions buy USDC at $0.99 and redeem with Circle for $1.00. Arbitrageurs continuously push the price back to $1.

Strength: the simplest and most battle-tested mechanism. No smart contract manages the peg — regulated institutions do.

Failure modes: (1) Issuer insolvency — the backing assets disappear. (2) Regulatory seizure — governments freeze the issuer's bank accounts. (3) Redemption suspension — issuer stops 1:1 redemptions. (4) Blacklisting — Circle and Tether can freeze individual wallet addresses.

**Type 2: Crypto-Backed (Decentralised)**

[Crypto-backed stablecoin] — minted by locking more than $1 worth of crypto as collateral in a smart contract. No central issuer.

Examples: DAI (MakerDAO), LUSD (Liquity), sUSD (Synthetix).

How the peg holds: overcollateralisation + liquidation. Your $1.50 ETH collateral creates $1 DAI. If ETH drops so your collateral falls to $1.10: a liquidation bot repays your DAI debt and takes your ETH at a discount. This protects the protocol's solvency. DAI always has more than $1 of collateral backing it.

Strength: no single issuer to go bankrupt or be regulated. The mechanism is enforced by code, not institutions.

Failure modes: (1) Collateral flash crash — ETH drops faster than liquidations can execute, creating undercollateralised DAI. (2) Oracle manipulation — falsely reported collateral prices allow over-borrowing. (3) Governance attack — malicious governance vote changes parameters destructively.

**Type 3: Algorithmic (Experimental)**

[Algorithmic stablecoin] — no external backing. Maintains the peg through programmatic supply expansion/contraction, usually involving a paired "seigniorage" token.

Classic model (Terra/UST): to mint 1 UST, burn $1 worth of LUNA. To redeem 1 UST, receive $1 worth of LUNA. If UST > $1: mint UST (buy LUNA, burn it, sell UST). If UST < $1: burn UST (buy UST, mint LUNA, sell it).

Failure mode: [death spiral]. UST falls below $1 → burn UST, mint LUNA → LUNA supply increases → LUNA price falls → confidence in UST falls → more selling → more LUNA minted → LUNA hyperinflates → UST collapses to zero. The mechanism that maintains the peg becomes the mechanism that destroys it.

**Hybrid models:**

[FRAX] — partially backed by USDC (collateral ratio starts at 85%), partially algorithmic (15% backed by FXS token). The collateral ratio adjusts based on market conditions. When confidence is high: more algorithmic. When confidence is low: more collateral. Designed to avoid the pure algorithmic death spiral by maintaining a non-zero collateral floor.`,

      examples: [
        {
          contextTag: `[Mechanism comparison, same user different risk]`,
          context: `Sarah holds $100K in "stablecoins" split across USDC, DAI, and UST (hypothetically, before collapse). She asks Maya to explain her actual risk profile.`,
          scenario: `USDC: risk = Circle's solvency and US regulatory environment. In 99% of scenarios: redeemable at $1.00. Worst case: bank run on Silicon Valley Bank (March 2023 — Circle had $3.3B there, USDC briefly depegged to $0.87). Recovery: Fed backstop, peg restored in 48 hours. DAI: risk = ETH price crash beyond liquidation. In 99% of scenarios: DAI maintains peg because ETH overcollateralisation is extreme (150%+). Worst case: ETH drops 60%+ in hours before liquidations execute. Historical: DAI survived March 2020 Black Thursday (−50% ETH in 24 hours) with minimal bad debt. UST: risk = death spiral. In 90% of good market scenarios: peg holds. In tail event (coordinated selling + LUNA price collapse): peg fails catastrophically. No recovery mechanism. Loss: permanent.`,
          outcome: `Sarah rebalances: 70% USDC (highest liquidity, proven mechanism), 25% DAI (decentralised, stress-tested), 5% experimental for yield purposes. The framework: rank stablecoins by failure probability and recovery path, not yield.`,
        },
        {
          contextTag: `[Arbitrage mechanism, fiat-backed peg enforcement]`,
          context: `Priya is explaining to a junior researcher exactly how USDC's peg is maintained mechanically.`,
          scenario: `Scenario A: USDC trades at $1.005 on Curve (small premium). Arbitrageur: (1) Deposits $1,000,000 with Circle → receives 1,000,000 USDC at $1.00. (2) Sells 1,000,000 USDC on Curve at $1.005. (3) Profit: $5,000. The selling pressure pushes USDC back toward $1.00. Scenario B: USDC trades at $0.995. Arbitrageur: (1) Buys 1,000,000 USDC on Curve at $0.995. (2) Redeems with Circle at $1.00. (3) Profit: $5,000. The buying pressure pushes USDC back toward $1.00. This arbitrage mechanism operates 24/7. Premium or discount above 0.1%: institutional arbs activate. Below 0.1%: gas costs exceed profit.`,
          outcome: `Priya documents: the peg is not maintained by Circe manually — it is maintained by profit-seeking arbitrageurs who are paid by the market to restore equilibrium. This self-enforcement is what makes fiat-backed peg maintenance reliable.`,
        },
        {
          contextTag: `[Death spiral anatomy, algorithmic stablecoin]`,
          context: `Jake is writing a post-mortem analysis of the May 2022 Terra collapse for the team's risk library.`,
          scenario: `May 7, 2022: an entity sells $285M UST on Curve, pushing UST below $1. The Terra algorithm tries to restore the peg: burn UST, mint LUNA. $285M of UST burned → ~$285M of new LUNA minted → LUNA price drops 10% (supply surge). LUNA drop reduces confidence in UST's backing value → more UST holders sell → more LUNA minted → LUNA drops another 20% → panic accelerates. By May 13: UST at $0.17. LUNA at $0.0001 from $80. Total LUNA minted to defend UST: 6.5 trillion new tokens. The mechanism had one fatal flaw: the "backing" asset (LUNA) had no value independent of UST's success. When confidence in UST failed, LUNA's value failed simultaneously — eliminating the very mechanism designed to restore the peg.`,
          outcome: `Jake's post-mortem conclusion: any stablecoin whose backing asset derives its value primarily from the stablecoin's success is structurally circular. The backing cannot survive a stablecoin confidence crisis because they are the same crisis.`,
        },
      ],

      keyTakeaway: `Three stablecoin types: fiat-backed (simplest, centralised, arbitrage-enforced peg, failure = issuer insolvency or regulatory seizure), crypto-backed (decentralised, overcollateralisation + liquidation-enforced, failure = collateral crash faster than liquidation), algorithmic (no external backing, seigniorage mechanism, catastrophic failure = death spiral as seen with UST). Hybrid (FRAX) attempts to reduce death spiral risk by maintaining partial collateral. Mechanism type determines failure mode and recovery possibility. Fiat-backed failures are typically temporary and recoverable (SVB/USDC 2023). Algorithmic failures can be permanent and total (Terra 2022).`,

      guidedPractice: [
        {
          question: `What makes the fiat-backed stablecoin peg self-enforcing without any smart contract logic?`,
          options: [
            `A) Circle manually intervenes whenever USDC depegs`,
            `B) Arbitrageurs profit by redeeming USDC at $1.00 from Circle when it trades below $1.00 on the market — this buying pressure restores the peg automatically`,
            `C) USDC is pegged by government regulation`,
            `D) The peg is maintained by burning tokens when USDC exceeds $1`,
          ],
          correct: 1,
          explanation: `Arbitrage mechanics: USDC at $0.99 → buy on market, redeem with Circle at $1.00 → $0.01 profit per USDC. The buying activity pushes price back to $1.00. USDC at $1.01 → buy new USDC from Circle at $1.00, sell on market at $1.01 → $0.01 profit. Selling pushes back to $1.00. This arbitrage is permissionless — any institution with Circle account access can do it. The profit motive ensures continuous peg maintenance without requiring any central party to manually intervene.`,
          hint: `What happens to the price of anything when lots of people buy it simultaneously? Who profits from buying USDC at $0.99?`,
        },
        {
          question: `Why is a crypto-backed stablecoin more resistant to regulatory seizure than a fiat-backed one?`,
          options: [
            `A) Smart contracts cannot be regulated`,
            `B) The backing assets (ETH, WBTC) are held in a smart contract on a public blockchain — no single company's bank account can be frozen to disable the mechanism`,
            `C) Crypto-backed stablecoins are always anonymous`,
            `D) Regulatory agencies do not monitor crypto-backed protocols`,
          ],
          correct: 1,
          explanation: `Fiat-backed: Circle holds backing USD in banks. A regulator can freeze Circle's bank accounts or compel Circle to freeze wallets. Crypto-backed (DAI): the ETH backing DAI is locked in MakerDAO's smart contracts on Ethereum. No bank account to freeze. No company to compel to freeze withdrawals (governance can act, but that requires a governance vote that the community can see and resist). The decentralisation of the backing is what provides regulatory resistance — though governance contracts and front-end servers remain regulatory targets.`,
          hint: `Where is the $1 backing held for USDC vs DAI? Who has access to each?`,
        },
        {
          question: `Explain the Terra death spiral in one sentence using the mechanism: "burn UST to mint LUNA."`,
          options: [
            `A) UST burning created LUNA which backed UST value`,
            `B) When UST fell below $1, the mechanism minted more LUNA to restore the peg — but minting more LUNA increased supply and crashed LUNA's price, reducing confidence in UST, requiring more LUNA minting, creating a loop that destroyed both`,
            `C) LUNA was burned to maintain UST's peg`,
            `D) The mechanism worked correctly but was attacked by hackers`,
          ],
          correct: 1,
          explanation: `The fatal circularity: LUNA backs UST's peg, but LUNA's value comes from UST's success. When UST confidence fell: the mechanism printed LUNA to buy UST → LUNA supply surged → LUNA price crashed → LUNA's value as backing collapsed → UST confidence fell further. Each step of the "stabilisation" mechanism made both assets less stable. The mechanism amplified the crisis rather than dampening it once past a critical threshold.`,
          hint: `If the mechanism to defend UST requires minting LUNA, and minting LUNA crashes LUNA's price, what happens to UST's apparent "backing value"?`,
        },
        {
          question: `FRAX uses a "fractional reserve" model starting at 85% USDC backing and 15% algorithmic. How does this reduce (but not eliminate) death spiral risk vs a pure algorithmic stablecoin?`,
          options: [
            `A) FRAX eliminates death spiral risk entirely`,
            `B) Even if the algorithmic 15% fails completely, FRAX still has 85% USDC backing — the maximum devalue without collateral failure is approximately 15%, not 100% as with pure algorithmic`,
            `C) FRAX has a government guarantee for 15% of its backing`,
            `D) The 15% algorithmic component automatically converts to USDC during stress`,
          ],
          correct: 1,
          explanation: `Pure algorithmic UST: backing = only LUNA. If confidence fails: LUNA goes to zero, backing goes to zero, UST goes to zero. FRAX at 85% USDC: worst case if FXS (algorithmic backing) goes to zero — FRAX still has 85 cents of USDC per $1 FRAX. The devalue is bounded at ~15% rather than ~100%. This does not eliminate the risk: if USDC itself depegs (March 2023), FRAX depegs simultaneously. But it prevents the total existential collapse seen with UST. The collateral floor is the key innovation.`,
          hint: `If the 15% algorithmic component fails, what remains? How does having something remain differ from having nothing remain?`,
        },
        {
          question: `Connecting to L5.1: a DeFi protocol announces they will denominate all their treasury and user balances in a new "yield-bearing stablecoin" paying 12% APY backed by their own governance token. What is the complete risk chain?`,
          options: [
            `A) No risk — 12% APY makes any risk acceptable`,
            `B) Governance token backing = algorithmic stablecoin structure. Risk chain: governance token price falls → stablecoin confidence falls → users redeem → protocol mints more governance tokens → governance token price falls further → death spiral → treasury goes to zero → all user balances lose their dollar anchor`,
            `C) Governance token backing provides better stability than USDC`,
            `D) The 12% APY proves the protocol's financial strength`,
          ],
          correct: 1,
          explanation: `The structure is identical to Terra: governance token = LUNA, stablecoin = UST. The 12% APY comes from: the protocol must generate 12% real yield to pay it sustainably, OR it pays it through governance token inflation (making the backing token worth less). If governance token inflation funds the yield, the backing asset is simultaneously deflating as it pays yield — a guaranteed spiral. The existence of attractive yield does not change the structural failure mode.`,
          hint: `Map this to the Terra model: which token is LUNA here? Which is UST? What happens when the "LUNA" equivalent drops in price?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `Score three stablecoins on a failure probability matrix. For each: USDC (fiat-backed), DAI (crypto-backed), and a new stablecoin NEWSD (algorithmic, backed by NEWGOV token). Dimensions: (A) probability of >5% depeg in a normal market year, (B) probability of permanent loss of peg, (C) recovery time after a temporary depeg, (D) decentralisation of the mechanism. Grade each dimension A/B/C/D and identify the overall risk ranking.`,
          scoringCriteria: [
            `USDC: A on probability of depeg (arbitrage mechanism extremely reliable), A on recovery time (SVB depeg restored in 48h), D on decentralisation (fully centralised)`,
            `DAI: B on depeg probability (has depegged slightly during ETH crashes), B-C on permanent loss (never happened, but March 2020 was close), A on decentralisation`,
            `NEWSD: C-D on depeg probability (untested, algorithmic), D on permanent loss risk (UST precedent), D on recovery (no recovery mechanism for death spiral)`,
            `Correctly ranks: USDC safest for dollar stability, NEWSD highest risk, DAI intermediate with decentralisation advantage`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `A DeFi research brief needs a "stablecoin selection guide" for a new lending protocol choosing which stablecoins to accept as both collateral and borrowable assets. Write the one-paragraph recommendation covering: which type to accept as primary borrowable asset, which to accept as collateral with LTV considerations, and which to refuse entirely (with mechanism reason). Use the three-type framework from this lesson.`,
          scoringCriteria: [
            `Recommends fiat-backed (USDC/USDT) as primary borrowable asset — proven arbitrage-enforced peg, high liquidity`,
            `Recommends crypto-backed (DAI, LUSD) as collateral with conservative LTV — decentralised but additional liquidation risk during ETH crashes`,
            `Refuses pure algorithmic stablecoins with specific mechanism reason — no external backing means potential 100% loss with no recovery`,
            `Notes that any collateral whose value correlates with the stablecoin's backing token creates circular risk (e.g. using FXS as collateral in a FRAX lending market)`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find the current market cap breakdown of the top 10 stablecoins by type (fiat-backed, crypto-backed, algorithmic/hybrid) using CoinGecko or DeFiLlama. Calculate the percentage share of each type. Then find the 1-year price chart for USDC, DAI, and FRAX — how many times did each deviate more than 0.5% from $1 in the past year? What does the frequency and magnitude of depegs reveal about each mechanism's robustness?`,
          scoringCriteria: [
            `Correctly sources market cap data and classifies top 10 stablecoins by mechanism type`,
            `Calculates percentage share showing fiat-backed dominance (typically 85%+)`,
            `Identifies USDC's March 2023 depeg event (if within the year) as the most significant fiat-backed deviation`,
            `Interprets: lower frequency and faster recovery of depegs = more robust mechanism. USDC's March 2023 recovery in 48h demonstrates the fiat-arbitrage mechanism's efficiency`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.3 — USDT (TETHER)
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'usdt-tether',
      title: `5.3 USDT (Tether) — Most Used, Most Questioned, Still Standing`,
      subtitle: `$100B+ market cap. The backbone of global crypto trading. And a company that went 8 years without a proper audit. Understanding Tether is understanding DeFi's most important counterparty risk.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.2 you learned fiat-backed stablecoins maintain their peg through arbitrage and are backed by real-world assets. USDT is the world's largest fiat-backed stablecoin by far. This lesson examines what is actually in Tether's reserves, why the transparency questions matter, and why USDT continues to dominate despite persistent concerns.`,

      hook: `Tether processes more daily volume than Bitcoin and Ethereum combined. It is the default trading pair on every major exchange globally. If Tether's reserves turned out to be substantially less than claimed, the resulting stablecoin bank run would be the largest financial event in crypto history. Understanding Tether means understanding the single largest counterparty risk in all of DeFi.`,

      visualPrompt: `A balance sheet graphic: left side "USDT in circulation: $100B+." Right side: "Tether's claimed reserves breakdown — US Treasury bills (largest slice), money market funds, corporate bonds, other investments, secured loans." Below: a question mark over "Third-party audit: attestation, not full audit." Caption: "The most important number in crypto: how good is the backing?"`,

      explanation: `Let me tell you about the most used stablecoin in the world.

USDT is everywhere. It is the primary trading pair on Binance, Bybit, and OKX. It is how most traders move between positions without going back to fiat. It is the default remittance stablecoin in emerging markets. By daily volume, it dwarfs every other asset in crypto.

And yet: for most of its history, Tether's reserve composition was opaque, its auditor was a small firm, and it faced multiple regulatory investigations.

**What backs USDT:**

Tether publishes quarterly reserve attestations (since 2021 — not full audits, attestations). As of late 2024, the stated breakdown:
- US Treasury bills: ~85% of reserves
- Money market funds: ~5%
- Cash and bank deposits: ~3%
- Corporate bonds and other: remaining %
- Secured loans to third parties: small but notable

The shift toward US Treasury bills is significant: Tether moved away from commercial paper (which included illiquid corporate debt) after 2021 scrutiny. US Treasuries are the most liquid, safest asset class in the world.

**The audit history:**

Tether has never had a full third-party audit by a major accounting firm (Big Four). It publishes [attestations] — a more limited document that confirms reserves exist at a point in time but does not verify the full accounting. This is meaningfully different from an audit.

Key moments: (1) 2017: Tether and Bitfinex shared banking relationships exposed. (2) 2021: CFTC fine of $41M for misrepresenting reserves. (3) 2022: Tether committed to releasing quarterly reports. (4) 2023–2024: Reserve quality improved dramatically toward Treasuries.

**Why USDT continues to dominate:**

[Network effect] — USDT pairs exist on every exchange, every DEX, in every country. Switching costs are high. Liquidity is unmatched.

[Emerging market utility] — in countries with currency devaluation (Turkey, Argentina, Venezuela), USDT provides dollar exposure on local mobile apps without needing a US bank account. This genuine utility creates real demand independent of DeFi.

[Regulatory arbitrage] — Tether is not a US company and is not subject to SEC/CFTC oversight in the way Circle (USDC) is. This creates regulatory uncertainty but also regulatory flexibility.

**USDT vs USDC — the key comparison:**

USDC: regulated, US company, monthly attestations by Deloitte, can freeze wallets, FDIC-eligible reserve structure. More transparent, more centralised.
USDT: less regulated, offshore incorporation, quarterly attestations by smaller firms, also can freeze wallets, larger reserves uncertainty. Less transparent, less centralised oversight.`,

      examples: [
        {
          contextTag: `[Fund analyst, USDT counterparty risk assessment]`,
          context: `Priya is writing a counterparty risk assessment for a fund that trades primarily using USDT pairs.`,
          scenario: `USDT risk dimensions: (1) Reserve quality: 85%+ US Treasuries as of 2024 — high quality. Risk: remaining commercial paper and "secured loans" to unknown counterparties. (2) Audit quality: attestation vs full audit — unknown liabilities that attestation would not reveal. (3) Regulatory: CFTC settlement 2021, no ongoing enforcement action currently. Tether HQ in British Virgin Islands. (4) Bank risk: Tether's banking relationships historically with smaller offshore banks. (5) Redemption access: institutions can redeem USDT for $1, but minimum $100K and must be a verified Tether customer. Retail cannot directly redeem.`,
          outcome: `Priya's assessment: USDT counterparty risk is elevated compared to USDC (less transparent, less regulated) but the reserve shift toward Treasuries has materially improved it since 2021. Recommendation: limit USDT holdings to trading operations. Do not hold USDT as a long-term store of value for treasury management.`,
        },
        {
          contextTag: `[Researcher, USDT in emerging markets]`,
          context: `Jake is studying USDT's role in emerging market economies for a broader crypto adoption report.`,
          scenario: `Turkey 2023: Turkish lira lost 55% of value against the dollar. Local exchanges report USDT trading volume 10× normal levels. Turks use USDT to: (1) store savings in dollar-equivalent on smartphones, (2) pay for international services (digital subscriptions, freelance platforms), (3) receive payments from international clients. Bank dollar accounts: require documentation, often have withdrawal limits. USDT account: anyone with a phone can hold it. The stablecoin provides a dollar savings account to people who cannot access the US banking system.`,
          outcome: `Jake documents: USDT's real-world utility in emerging markets creates genuine dollar demand that is independent of DeFi speculation. This demand provides a floor on USDT usage that USDC (which requires a US-adjacent banking infrastructure to be useful) cannot replicate.`,
        },
        {
          contextTag: `[Stress test, what a Tether bank run would look like]`,
          context: `Maya is running a stress test scenario for the research team: what happens if Tether's reserves are discovered to be 80% of stated value?`,
          scenario: `Assume USDT reserves are $80B instead of stated $100B (20% shortfall). News breaks. Institutions with Tether redemption access immediately queue: redemptions are first-come-first-served against $80B of assets for $100B of claims. Classic bank run dynamics: first 80% out get $1.00, last 20% get $0. USDT market price: falls toward $0.80 as people race to exit. All USDT/X trading pairs on every exchange simultaneously break. Crypto trading seizes up. Every protocol holding USDT as a treasury asset or LP token takes immediate losses. Cascade: every DeFi protocol that accepted USDT as collateral now has under-backed positions.`,
          outcome: `Maya's analysis: a Tether insolvency event would be the largest financial crisis in crypto history — larger than FTX, larger than Luna. This is why the reserve composition matters. Moving from commercial paper to US Treasuries dramatically reduces (but does not eliminate) this tail risk.`,
        },
      ],

      keyTakeaway: `USDT: $100B+ market cap, largest stablecoin by daily volume, backbone of global crypto trading. Reserve composition (2024): ~85% US Treasuries — materially better than 2021's commercial paper mix. Key risk: attestations not full audits — unknown liabilities remain. Regulatory: offshore incorporation, 2021 CFTC fine. Retail cannot directly redeem — must sell on market. USDT vs USDC: USDC more transparent/regulated, USDT more liquid/globally distributed. USDT's emerging market utility (Turkey, Argentina, Venezuela) creates genuine demand floor. Use USDT for trading operations; prefer USDC for treasury and long-term holdings requiring auditability.`,

      guidedPractice: [
        {
          question: `What is the practical difference between a reserve "attestation" and a full audit for a stablecoin issuer?`,
          options: [
            `A) Attestation is more thorough than an audit`,
            `B) An attestation confirms reserves exist at a specific point in time. A full audit verifies the complete financial picture including liabilities, legal obligations, and off-balance-sheet items that could affect the reserves' true availability`,
            `C) There is no meaningful difference`,
            `D) Audits are required by law; attestations are voluntary`,
          ],
          correct: 1,
          explanation: `Attestation: "On date X, we confirm that Tether's assets equal or exceed its liabilities." This does not verify: what those assets actually are (could be pledged as collateral elsewhere), whether undisclosed liabilities exist, or whether the reserve management has changed since date X. Full audit: independent accountants examine all transactions, verify asset ownership, confirm no undisclosed liabilities. USDC has monthly attestations by Deloitte (still not a full audit, but Deloitte's reputation is on the line). Tether's attestations are by smaller firms — less reputational skin in the game.`,
          hint: `What would a full audit reveal that a point-in-time attestation would not? Think about liabilities, not just assets.`,
        },
        {
          question: `Why has Tether's shift toward US Treasury bills improved its risk profile since 2021?`,
          options: [
            `A) Treasury bills pay higher yield than commercial paper`,
            `B) US Treasury bills are the most liquid, safest short-term debt in the world — in a redemption crisis, Tether can liquidate Treasuries within hours without market impact, unlike illiquid commercial paper`,
            `C) Tether receives US government guarantees for Treasury bills`,
            `D) Treasury bills eliminate Tether's counterparty risk entirely`,
          ],
          correct: 1,
          explanation: `Commercial paper (corporate short-term debt) is: less liquid, credit-risk bearing (a company can default), and can be hard to sell at par during market stress. US Treasuries: essentially zero default risk (US government), extremely liquid (the most traded instruments in the world), redeemable in hours at face value. In a Tether redemption surge, Treasury-backed reserves can be liquidated far faster and with less slippage than commercial paper. The shift materially reduces the "bank run" tail risk even if it does not eliminate it.`,
          hint: `During a crisis, what matters most about reserve assets? Liquidity (how fast you can sell them) or yield (how much they pay)?`,
        },
        {
          question: `Tether can freeze any USDT wallet address. A DeFi protocol's smart contract holds $50M USDT. What risk does this create?`,
          options: [
            `A) No risk — smart contracts cannot be frozen`,
            `B) Tether maintains a blacklist — they can add the smart contract address to it, permanently preventing those $50M USDT from being transferred. The protocol's liquidity is frozen without any smart contract exploit.`,
            `C) Only individual wallets can be frozen, not smart contracts`,
            `D) Freezing requires a court order that takes years`,
          ],
          correct: 1,
          explanation: `Both Tether (USDT) and Circle (USDC) maintain token blacklists enforced at the smart contract level. Any address on the blacklist cannot transfer or receive the token. Historically used against sanctioned entities (OFAC-sanctioned wallets). Risk for DeFi protocols: a government can compel Tether to freeze a protocol's USDT holdings — disabling the protocol's liquidity without any technical hack. This is the centralised censorship risk of fiat-backed stablecoins.`,
          hint: `Tether maintains a blacklist at the smart contract level. Is a smart contract address fundamentally different from a wallet address for blacklist purposes?`,
        },
        {
          question: `Connecting to L5.2: why does USDT's offshore incorporation (British Virgin Islands) both reduce and increase risk compared to a US-incorporated issuer like Circle?`,
          options: [
            `A) Offshore incorporation only creates risk`,
            `B) Reduces risk: less subject to US regulatory seizure (can't be shut down by SEC/CFTC easily). Increases risk: less accountability, less legal recourse for holders, less transparent regulatory oversight — making it harder to verify reserve claims independently`,
            `C) Offshore incorporation is irrelevant to stablecoin risk`,
            `D) Only US-incorporated entities can issue stablecoins`,
          ],
          correct: 1,
          explanation: `The dual nature of offshore incorporation: if the US government decides to sanction USDT (as they did with Tornado Cash), a BVI entity is harder to directly enforce against than a US company — reducing a specific regulatory seizure risk. But the same distance from US regulation means: no SEC filing requirements, no mandatory audits, less reputational penalty for opacity. Circle (Delaware corp, US banking partners) faces more regulatory pressure but provides more accountability. Which risk matters more depends on your use case and political risk view.`,
          hint: `Think about two separate risks: (1) the US government trying to shut it down, and (2) Tether itself misrepresenting its reserves. Does offshore incorporation help or hurt each?`,
        },
        {
          question: `A researcher argues that USDT's dominance in emerging markets (Turkey, Argentina) makes it more resilient than its reserve concerns suggest. Is this argument valid?`,
          options: [
            `A) No — reserve concerns always outweigh network effects`,
            `B) Partially valid: genuine utility-driven demand creates a stable user base that would resist abandoning USDT even during concerns. However, this demand does not change the fundamental reserve risk — if Tether cannot meet redemptions, the utility demand cannot save the peg`,
            `C) Fully valid — utility demand guarantees the peg`,
            `D) Emerging market demand is too small to matter`,
          ],
          correct: 1,
          explanation: `The argument has two true parts: (1) Emerging market utility IS real and creates sticky demand that reduces the probability of a voluntary bank run. Users who need USDT for daily transactions are less likely to sell at the first sign of concern than speculative holders. (2) But reserve backing is the only thing that enables redemptions at $1.00. If reserves are $80B for $100B of USDT, the 20% shortfall is real regardless of utility. The demand-side resilience reduces probability of crisis; it does not eliminate the consequence if a crisis occurs.`,
          hint: `Two separate questions: (1) how likely is a bank run? and (2) if a bank run happens, can Tether survive it? Does demand affect question 1 or question 2?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `Apply the six-dimensional Tether risk assessment: (1) reserve quality (grade A-D), (2) audit transparency (grade A-D), (3) regulatory status (grade A-D), (4) blacklist/censorship risk (grade A-D), (5) liquidity/accessibility (grade A-D), (6) bank run probability (grade A-D). Compare to USDC on the same six dimensions. Which stablecoin wins on overall risk-adjusted safety? Which wins on utility for different use cases (trading, treasury, DeFi collateral)?`,
          scoringCriteria: [
            `USDT: B reserve quality (85% Treasuries — good, but attestation not audit), C audit transparency, C regulation, C censorship (same blacklist capability as USDC but less predictable usage), A liquidity`,
            `USDC: A-B reserve quality (monthly Deloitte attestation, FDIC-eligible), A-B audit, A-B regulation, C censorship (same blacklist), B-C liquidity vs USDT`,
            `Correctly recommends USDC for treasury/collateral (transparency advantage), USDT for trading (liquidity advantage)`,
            `Notes that both have blacklist capability — the decentralisation advantage of crypto is absent for both`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.2 (Aave): Aave V3 accepts both USDC and USDT as supply and borrow assets. From a depositor's perspective, should the reserve transparency difference between USDT and USDC affect which you supply? Walk through: (A) what risk does Aave take on by accepting USDT, (B) what risk do USDT suppliers take beyond normal lending risk, (C) at what USDT reserve concern threshold should a depositor switch to USDC supply?`,
          scoringCriteria: [
            `Aave risk from USDT: if USDT depegs, USDT supplied to Aave and used as collateral creates positions where the "stablecoin" collateral is no longer stable — potential cascade of undercollateralised positions`,
            `Depositor risk: beyond lending protocol risk, USDT supply carries reserve risk — if USDT depegs, the depositor's $1.00 asset becomes $0.90 or less regardless of Aave's health`,
            `Threshold for switching: any credible report of reserve shortfall >5% or any major counterparty failure in Tether's banking relationships`,
            `Notes that Aave has supply caps on USDT specifically to limit protocol-level concentration in any single stablecoin`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find Tether's current reserve attestation report at tether.to/transparency. Record: total USDT in circulation, breakdown by asset type (Treasuries, cash, other), percentage in each category, and the name of the attesting firm. Compare to Circle's USDC reserve report (centre.io or Circle's transparency page). Produce a two-row comparison table. Which has more Treasury exposure as a percentage? Which has a more credible attestation process?`,
          scoringCriteria: [
            `Successfully locates and reads both reserve reports`,
            `Comparison table accurately reflects the current breakdown for both stablecoins`,
            `Correctly identifies which has higher Treasury percentage (typically similar, both shifted toward Treasuries)`,
            `Correctly assesses attestation credibility: Deloitte (USDC) vs BDO or other Tether attester — notes difference in firm reputation`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.4 — USDC (CIRCLE)
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'usdc-circle',
      title: `5.4 USDC (Circle) — The Regulated Alternative`,
      subtitle: `USDC chose transparency and US regulation. In March 2023 that choice was tested when $3.3B of its reserves sat in Silicon Valley Bank during its collapse. What happened next taught DeFi the limits of even the most transparent stablecoin.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.3 you evaluated Tether's risk profile — a high-volume, less-transparent offshore issuer. USDC is the contrast: a US-regulated, monthly-attested, transparent issuer. This lesson examines what Circle's regulatory approach actually guarantees, where it creates new risks (SVB), and why USDC became DeFi's preferred institutional stablecoin despite its centralisation.`,

      hook: `March 10, 2023. Silicon Valley Bank collapses. Circle announces that $3.3B of USDC's reserves — 8% of total backing — are stuck in SVB. USDC depegs to $0.87 over the weekend. Every DeFi protocol that had priced USDC at $1 suddenly faced a stablecoin that was worth $0.87. By Monday the Fed backstopped SVB depositors. USDC recovered to $1.00. The crisis lasted 60 hours. But it revealed something: even the most transparent stablecoin carries bank risk.`,

      visualPrompt: `A timeline of the USDC SVB depeg: Friday March 10 (USDC at $1.00), Saturday March 11 (news breaks, USDC at $0.87 on Curve), Sunday March 12 (Fed announces backstop), Monday March 13 (USDC at $0.998). Below: a breakdown showing what happened in DeFi — MakerDAO temporarily pausing DAI mints, Uniswap USDC/USDT pool showing massive imbalance, DeFi protocols temporarily accepting USDC as $0.87. Caption: "60 hours of bank risk became a DeFi systemic event."`,

      explanation: `Let me tell you about the regulated stablecoin.

Circle built USDC as the antithesis of Tether: transparent, US-incorporated, regularly attested, and fully backed by the highest-quality short-term assets. For institutional DeFi users, USDC became the preferred stablecoin.

**USDC's architecture:**

[Circle] — the issuer. A US company (formerly joint venture with Coinbase). Regulated as a money services business. Subject to FinCEN oversight.

[Reserve composition]: monthly attestations by Deloitte confirm the backing. As of 2024: nearly 100% in short-duration US Treasury bills and overnight repos. No commercial paper. No corporate bonds. The safest possible reserve composition for a fiat-backed stablecoin.

[Redemption access]: institutional access through Circle's API. Direct minting and redemption at $1.00 for verified businesses. Retail uses secondary markets.

**The SVB crisis — what happened:**

March 2023: Circle held $3.3B of its $40B reserves in Silicon Valley Bank — approximately 8%. SVB collapsed on March 10. The FDIC took control. For 60 hours: nobody knew if that $3.3B would be recovered.

USDC market response: market participants began selling USDC at any price. Curve's USDC/USDT pool: heavily imbalanced as everyone fled to USDT. USDC price: $0.87 at the low.

DeFi response: MakerDAO temporarily paused new DAI mints using USDC as collateral. Aave's USDC oracle registered the depeg. Protocols that had assumed USDC = $1 faced unexpected health factor changes.

Resolution: March 12, US government announced all SVB depositors (including Circle) would be made whole. USDC recovered to $0.998 within hours.

Key lesson: USDC's reserve transparency revealed the bank risk. If Tether had the same bank exposure, it might never have been disclosed until it became a problem.

**USDC's DeFi integrations:**

[Native USDC] — Circle has deployed native USDC on Ethereum, Arbitrum, Base, Solana, Polygon, and other chains using their own CCTP (Cross-Chain Transfer Protocol). This differs from "bridged" USDC (which has additional bridge smart contract risk).

[USDC as DeFi's reserve currency]: USDC is the primary collateral in MakerDAO's reserve, the largest stable pool on Curve, the default borrow asset on Aave. Its deep integrations make it the de facto dollar settlement layer for DeFi.`,

      examples: [
        {
          contextTag: `[SVB crisis, DeFi impact analysis]`,
          context: `Maya is documenting the 60-hour USDC depeg for the team's crisis playbook.`,
          scenario: `Saturday March 11, 08:00 UTC: USDC trades at $0.93 on Coinbase. Curve 3pool: 76% USDC (everyone selling into the pool), 12% USDT, 12% DAI (pool massively imbalanced — automated arb cannot rebalance fast enough). Aave USDC oracle: reports $0.93 — USDC positions now have lower collateral value. A borrower with $10M USDC collateral and $8M USDT debt now has HF = $10M × 0.93 × liquidation threshold ÷ $8M = potentially below 1. Cascade of USDC-collateralised positions reaching liquidation threshold. MEV bots attempt liquidations. Gas spikes. Chaos.`,
          outcome: `Maya's documentation: the SVB event was a live demonstration that stablecoin bank risk transmits directly into DeFi protocol risk. A 60-hour depeg created temporary liquidation risk across thousands of positions. The Fed backstop resolved it — but the resolution was political, not mechanical.`,
        },
        {
          contextTag: `[USDC vs USDT integration analysis]`,
          context: `Priya is advising a new DeFi protocol on which stablecoin to use as their primary asset.`,
          scenario: `Protocol considerations: (1) If they use USDC: monthly Deloitte attestations give institutional confidence, native USDC on multiple chains avoids bridge risk, US regulatory clarity for institutional users. Risk: US regulatory action could freeze protocol-related USDC if protocol is deemed non-compliant. (2) If they use USDT: highest trading volume, widest exchange integration, BVI incorporation reduces US regulatory reach. Risk: reserve opacity, no full audit, bank relationships less transparent. (3) If they use DAI: decentralised, no single issuer to freeze wallets. Risk: overcollateralised — capital inefficient, depegs slightly more frequently than USDC.`,
          outcome: `Priya recommends USDC as primary with DAI as secondary. Reasoning: USDC's institutional credibility and audit quality are essential for the protocol's fund relationships; DAI provides decentralised fallback. The USDC regulatory risk is accepted as the cost of institutional distribution.`,
        },
        {
          contextTag: `[Native vs bridged USDC, risk comparison]`,
          context: `Jake is deploying a strategy on Arbitrum and checking whether the USDC available is native or bridged.`,
          scenario: `Check on Arbiscan: the USDC.e token (bridged) has contract address 0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8. The USDC token (native) has address 0xaf88d065e77c8cC2239327C5EDb3A432268e5831. Bridged USDC.e: originally minted on Ethereum, locked in Arbitrum bridge, wrapped USDC on Arbitrum. Risk: if the Arbitrum bridge smart contract is exploited, bridged USDC.e could become unbacked. Native USDC on Arbitrum: minted directly by Circle using their CCTP. No bridge smart contract risk. Aave V3 Arbitrum: accepts native USDC primarily (the 0xaf88... address). DeFiLlama: native USDC has higher TVL on Arbitrum than bridged USDC.e.`,
          outcome: `Jake uses native USDC (0xaf88) for his Arbitrum strategy. The extra step of verifying the contract address eliminates bridge smart contract risk — one of the most exploited attack vectors in DeFi history (from L1.11).`,
        },
      ],

      keyTakeaway: `USDC: US-incorporated Circle, monthly Deloitte attestations, nearly 100% US Treasury bill reserves, native deployment across 12+ chains via CCTP. SVB crisis (March 2023): $3.3B reserves temporarily at risk, USDC depegged to $0.87 for 60 hours before Fed backstop resolved it. Lesson: even the most transparent stablecoin carries bank concentration risk. DeFi impact of the depeg: oracle updates triggered unexpected liquidations, Curve pool massively imbalanced. Key distinction: native USDC (minted by Circle directly) vs bridged USDC.e (wrapped via bridge, carries bridge smart contract risk). USDC is DeFi's de facto institutional dollar standard — used in MakerDAO reserves, Aave primary supply asset, Curve 3pool anchor.`,

      guidedPractice: [
        {
          question: `Circle held $3.3B of USDC's reserves in Silicon Valley Bank. What specific mechanism caused this to create a USDC depeg?`,
          options: [
            `A) Circle announced it was insolvent`,
            `B) Market participants believed that if $3.3B could not be recovered from SVB, USDC would have $3.3B less backing than its $40B outstanding — making full 1:1 redemption uncertain — causing selling pressure that pushed USDC below $1`,
            `C) The FDIC froze all USDC tokens directly`,
            `D) Circle paused redemptions immediately after SVB's failure`,
          ],
          correct: 1,
          explanation: `The depeg was purely expectation-driven: no one knew yet whether the $3.3B would be recovered. Rational participants: "USDC has $40B outstanding, $3.3B might not be there, therefore USDC might only be worth 91.75 cents in the worst case." At $0.87 (the low), the market was pricing in worse than the actual math suggested — panic overshoot. When the Fed backstop confirmed all SVB depositors would be made whole, the expectation of full coverage was restored and USDC recovered. The depeg was a fear event, not an insolvency event.`,
          hint: `What is the value of a $1 stablecoin if it might only have 91.75 cents of backing? The market price reflects uncertainty about backing, not confirmed loss.`,
        },
        {
          question: `What is the difference between native USDC and bridged USDC.e on Arbitrum, and why does it matter for DeFi users?`,
          options: [
            `A) They are identical tokens with different names`,
            `B) Native USDC is minted directly by Circle via CCTP — no bridge smart contract risk. Bridged USDC.e is locked-on-Ethereum and represented on Arbitrum — carries bridge exploit risk where the bridge contract could be hacked and the Arbitrum representation becomes unbacked`,
            `C) Bridged USDC.e has lower fees`,
            `D) Native USDC is only available on Ethereum mainnet`,
          ],
          correct: 1,
          explanation: `From L1.11 (bridge risk): bridges are the largest single exploit category in DeFi. Bridged USDC.e depends on the Arbitrum bridge contract remaining unhacked. If the bridge is exploited, the locked USDC on Ethereum is stolen and the USDC.e on Arbitrum becomes unbacked. Native USDC has no bridge dependency — Circle mints it directly on Arbitrum's L2. Aave V3 Arbitrum and most major protocols have migrated to native USDC. For any significant deployment, always verify whether you are using native or bridged versions.`,
          hint: `From L1.11: bridge risk. Which USDC version depends on a bridge contract being unhacked? Which is backed directly by Circle's reserves?`,
        },
        {
          question: `Connecting to L5.3: a researcher argues that USDC's monthly Deloitte attestations make it categorically safer than USDT's quarterly attestations by a smaller firm. How strong is this argument?`,
          options: [
            `A) Perfect — monthly Deloitte attestations completely de-risk USDC`,
            `B) Strong but not perfect: Deloitte's reputation raises the reliability of the attestation (more to lose if wrong), monthly frequency reduces the window of undetected reserve changes. But attestations (even from Deloitte) are still not full audits — they confirm reserves exist at a point in time, not that no undisclosed liabilities exist`,
            `C) Weak — monthly vs quarterly makes no difference`,
            `D) Deloitte attestations are government-audited and guarantee full backing`,
          ],
          correct: 1,
          explanation: `Deloitte attestations are meaningfully better than smaller firm attestations: (1) Deloitte's reputation is at stake — they would not sign off on something materially inaccurate. (2) Monthly frequency means the window between checks is 30 days, not 90. But it is still not a full audit. A full audit would examine all contracts, counterparty relationships, off-balance-sheet items, and legal obligations. The SVB event demonstrated the gap: nothing in an attestation would have flagged "8% of reserves are in a bank that may fail next month." The attestation confirmed reserves existed; it could not predict future bank failures.`,
          hint: `What does an attestation confirm? What would a full audit also verify? The SVB event: was Circle's attestation "wrong"? Or was it correct at the time but unable to predict the future?`,
        },
        {
          question: `MakerDAO paused new DAI mints using USDC as collateral during the USDC SVB depeg. Why?`,
          options: [
            `A) MakerDAO governance was slow to react`,
            `B) If USDC was worth $0.87, then every 1 USDC used as collateral was only backing $0.87 of DAI — creating undercollateralised DAI. Pausing new mints prevented the problem from growing while the situation was unclear`,
            `C) MakerDAO has a rule that only DAI can back DAI`,
            `D) USDC liquidity was insufficient for DAI minting`,
          ],
          correct: 1,
          explanation: `DAI's backing includes USDC (a controversial governance decision — USDC as collateral introduces the very centralisation risk that DAI was designed to avoid). When USDC depegged: USDC-backed DAI was technically undercollateralised at $0.87 of USDC per $1 of DAI backed by it. Pausing new mints was a precautionary measure to stop DAI's own backing ratio from worsening while the USDC situation resolved. This event permanently strengthened the argument within MakerDAO to reduce USDC dependency in favour of ETH/stETH collateral and RWA.`,
          hint: `If you accepted $1 of USDC as backing for $1 of DAI, and USDC becomes worth $0.87, is the $1 of DAI fully backed?`,
        },
        {
          question: `USDC can be frozen by Circle on government order. A DeFi protocol's entire $30M treasury is in USDC. What specific regulatory scenario could freeze the treasury?`,
          options: [
            `A) No scenario — smart contract treasuries cannot be frozen`,
            `B) If the US government (Treasury, OFAC, or DOJ) determines the protocol is facilitating illegal activity and issues a legal demand to Circle to blacklist the protocol's smart contract address — Circle complies and the $30M USDC is permanently frozen`,
            `C) Only individual wallets can be blacklisted, not contract addresses`,
            `D) Circle only freezes wallets if the token holder consents`,
          ],
          correct: 1,
          explanation: `Circle has blacklisted smart contract addresses before. In August 2022, Circle (and Tether) both blacklisted addresses associated with Tornado Cash within hours of the OFAC sanctioning. Smart contracts are addresses on a blockchain — they can be blacklisted exactly like wallet addresses. A protocol treasury holding USDC in a smart contract has a real regulatory seizure risk: if the protocol is ever accused of facilitating illegal activity, the treasury can be frozen before any legal process completes. This is the DeFi-specific argument for holding treasury in ETH or DAI rather than centralised stablecoins.`,
          hint: `From L5.3: Tether and Circle both maintain blacklists. Is a smart contract address (like a Gnosis Safe) different from a personal wallet address for blacklisting purposes?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `You are advising a DeFi protocol that holds $5M in USDC treasury. After the SVB event, the board asks you to produce a "stablecoin treasury risk assessment." Cover: (A) the three specific scenarios where USDC backing could fall below $1, (B) the probability of each in the next 12 months (qualitative A/B/C), (C) what diversification would reduce concentration risk while maintaining institutional-grade custody, (D) the maximum USDC allocation you recommend.`,
          scoringCriteria: [
            `Three scenarios: bank concentration (SVB-style), regulatory seizure (OFAC action), Circle insolvency (lower probability given reserve quality)`,
            `Reasonable probability grades: bank concentration B (Treasury bills reduce but don't eliminate this), regulatory B (small for a generic DeFi protocol), Circle insolvency C (low given reserve quality)`,
            `Diversification: split across USDC, USDT, DAI, and possibly some ETH for non-correlated exposure`,
            `Maximum USDC: recommends 40-60% cap given the SVB precedent for bank concentration risk`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.2 (Aave) and L5.4: during the 60-hour USDC SVB depeg, Aave's price oracle for USDC registered $0.87. Trace through: (A) what happens to a position with $10M USDC collateral and $7M USDC debt? (B) what about a position with $10M USDC collateral and $7M USDT debt? (C) should Aave's oracle have maintained USDC at $1.00 during a known temporary depeg? What are the arguments for and against?`,
          scoringCriteria: [
            `Position A (USDC/USDC): both sides reprice at $0.87 — collateral and debt both lose value proportionally, so health factor is largely unchanged`,
            `Position B (USDC collateral, USDT debt): collateral reprices to $8.7M, debt stays at $7M USDT ($7M) — health factor = $8.7M × LT / $7M — could breach if LTV was high`,
            `Oracle argument for $1.00: a 60-hour temporary depeg with clear backstop is not a fundamental value change. Triggering liquidations during a known temporary event harms borrowers unnecessarily`,
            `Oracle argument for market price: protocols must use market prices — accepting a "wrong" oracle sets a dangerous precedent for oracle manipulation attacks`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find Circle's most recent USDC reserve attestation report (circle.com/usdc/transparency). Record: total USDC in circulation, percentage in Treasury bills, percentage in repos, percentage in money market funds. Compare: has the composition changed from the prior quarter? Then find the March 2023 Curve 3pool data during the SVB crisis (use DeFiLlama historical or crypto analytics sites). What was the peak USDC imbalance in the 3pool? What did it imply about market panic relative to the actual 8% reserve shortfall?`,
          scoringCriteria: [
            `Current reserve attestation data accurately recorded from Circle's transparency page`,
            `Quarter-over-quarter comparison made with specific percentage changes noted`,
            `March 2023 3pool data found showing USDC at 70%+ of pool (vs normal ~33%)`,
            `Correct interpretation: peak pool imbalance implied USDC was worth ~$0.87 but actual shortfall was max 8% — market overshot by approximately 5× the mathematical worst case, reflecting panic premium`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.5 — DAI (MAKER)
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'dai-maker',
      title: `5.5 DAI (Maker) — The Original Decentralised Stablecoin`,
      subtitle: `DAI is six years old, has survived Black Thursday, survived UST, survived SVB. Its mechanism is elegant: no issuer, no bank account, just code that keeps a dollar stable through overcollateralisation. Here is how.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.3–L5.4 you studied fiat-backed stablecoins (USDT and USDC) with their issuer counterparty risks. DAI is the oldest and largest crypto-backed stablecoin — the alternative that eliminates issuer risk at the cost of capital efficiency and adds governance risk instead. Understanding DAI requires understanding MakerDAO's collateral system.`,

      hook: `March 12 2020. Crypto market crashes 50% in 24 hours. ETH falls from $194 to $88 in a single morning. MakerDAO's liquidation system breaks — gas prices are so high that liquidation keepers cannot execute, creating $5.4M in bad debt. The protocol survives by issuing and auctioning MKR tokens to cover the shortfall. Six years later: DAI still maintains its peg. That survival story is the foundation of DAI's credibility.`,

      visualPrompt: `A diagram of a CDP (Collateralized Debt Position): user locks 1.5 ETH ($3,000 at $2,000/ETH) into the Maker vault → mints 1,000 DAI → deploys DAI in DeFi → later burns 1,000 DAI + stability fee to unlock ETH. Below: liquidation trigger showing ETH falling to $1,500 → health factor breached → Maker bot auctions ETH for DAI → shortfall covered. Caption: "DAI: no bank, no issuer, no single point of control. Just collateral and code."`,

      explanation: `Let me tell you about the grandfather of decentralised stablecoins.

DAI launched in December 2017. It has maintained its $1 peg through more market crashes than any other DeFi protocol has survived. Its mechanism is different from USDT and USDC in one fundamental way: there is no company holding dollars. The dollar stability comes from overcollateralised ETH locked in smart contracts.

**How DAI is created:**

[Collateralized Debt Position (CDP)] — called a "vault" in MakerDAO. To create DAI:
1. Deposit collateral (ETH, WBTC, stETH, RWA, or other approved assets) into a Maker vault.
2. Mint DAI up to the collateralisation limit (e.g. 150% minimum → deposit $1,500 ETH to mint $1,000 DAI).
3. DAI enters circulation with a $1.00 target.
4. To get collateral back: burn $1,000 DAI + stability fee (the borrow interest).

[Stability fee] — the interest rate charged on DAI debt. Governance-set. Equivalent to the borrow rate. When governance wants less DAI supply: raise the stability fee (borrowing becomes more expensive, existing borrowers repay). When governance wants more DAI supply: lower the stability fee.

**How the peg is maintained:**

Above $1.00: borrow DAI (it's valuable), sell at premium, buy collateral. More DAI supply → price drops back toward $1.
Below $1.00: buy DAI (it's cheap), use to repay CDPs, reduce DAI supply. Less DAI → price rises back toward $1.

[DAI Savings Rate (DSR)] — from L4.5. Governance sets a rate paid to DAI holders who lock in the DSR. Increase DSR → more demand for DAI → price rises toward $1.

**Collateral types and risks:**

[Single-collateral DAI (SAI, pre-2019)]: only ETH. Elegant but highly correlated risk — ETH crash = system stress.
[Multi-collateral DAI (DAI, current)]: ETH, WBTC, stETH, USDC (controversial), real-world assets (US Treasuries via institutional partners).

USDC as DAI collateral: introduced during DeFi summer to maintain DAI's peg under demand pressure. Made DAI more stable but introduced the same centralisation risk that the March 2023 SVB crisis revealed — DAI's stability partly depends on USDC.

Real-world assets (RWA): MakerDAO has deployed ~$1.5B in US Treasuries and institutional debt. This diversifies DAI's backing and provides yield (funds the DSR), but introduces off-chain institutional counterparty risk.

**Black Thursday and recovery:**

March 12, 2020: ETH -50% in 24 hours. Gas prices spiked to 500+ gwei. Liquidation keepers (bots) could not afford to bid — gas costs exceeded the liquidation premium. Some auctions settled at $0 bids (no one could bid profitably). $5.4M bad debt created.

Resolution: governance vote auctioned new MKR tokens to cover the shortfall. The MKR token acted as the "capital of last resort" — diluting MKR holders to protect DAI holders.

This mechanism worked. DAI peg survived. The event led to a major liquidation system overhaul.`,

      examples: [
        {
          contextTag: `[CDP creation walkthrough]`,
          context: `Jake wants to access liquidity against his ETH without selling it. He opens a MakerDAO vault.`,
          scenario: `Jake has 5 ETH at $2,500 each ($12,500 total). He opens a Maker ETH-A vault. Minimum collateralisation: 150%. Maximum DAI he can mint: $12,500 ÷ 1.50 = $8,333 DAI. Jake mints conservatively: $6,000 DAI (collateralisation ratio 208%). Stability fee: 3.5% APY. Jake deploys $6,000 DAI in Spark's sDAI (5.5% DSR yield). Net yield: 5.5% − 3.5% = 2.0% on $6,000 = $120/year. Plus: his 5 ETH remain his (he did not sell). If ETH doubles: his collateral is now $25,000. He repays $6,000 DAI + fees ($210) and gets all 5 ETH back.`,
          outcome: `Jake accessed $6,000 in liquidity without selling ETH, earned a net 2% on the deployed DAI, and maintains full ETH exposure. The cost: he must monitor his health factor. If ETH drops below $1,714 ($6,000 ÷ 3.5 ETH after liquidation penalty): his vault is at risk. He sets an ETH price alert at $2,000 to give buffer.`,
        },
        {
          contextTag: `[Black Thursday analysis — the liquidation system failure]`,
          context: `Maya writes the Black Thursday case study for the team's risk library.`,
          scenario: `March 12, 2020 08:00 UTC: ETH at $194. By 12:00: ETH at $88 (−55%). 1,462 vaults immediately become liquidatable. ETH gas: 200+ gwei (normal: 5 gwei). Liquidation keepers run the math: buy $10,000 ETH, flip it for $10,300 (3% liquidation premium). Gas cost at 200 gwei for one transaction: $500. Net: $300 − $500 = −$200. Nobody could bid profitably. Result: some auctions cleared at 0 DAI (the only bidder bid $0, received the ETH for free, and the vault owner lost their entire collateral with zero debt repayment). $5.4M DAI was uncollateralised. Governance response: MKR dilution auction covered the gap in 24 hours.`,
          outcome: `Maya documents three protocol improvements after Black Thursday: (1) circuit breaker to pause liquidations during gas crises, (2) keeper incentive redesign, (3) minimum bid requirement in auctions. The event proved the governance recovery mechanism works but also revealed design flaws that a better-funded attacker could have exploited at scale.`,
        },
        {
          contextTag: `[RWA integration analysis]`,
          context: `Priya evaluates MakerDAO's $1.5B Real World Asset portfolio for the team's DAI risk assessment.`,
          scenario: `MakerDAO's RWA exposure: ~$1.5B in US Treasuries (via BlockTower, Monetalis), ~$500M in corporate lending (Centrifuge pools), ~$100M in Coinbase institutional account. Yield from RWA portfolio: ~5% APY = ~$100M/year to Maker treasury. This funds the DAI Savings Rate (DSR) at 5%+. Risk: the US Treasury exposure is via off-chain institutional intermediaries who hold the Treasuries on Maker's behalf. The on-chain Maker vault holds tokenised representations. If the institutional intermediary fails: Maker's Treasury exposure becomes illiquid. This is the same institutional counterparty risk that the SVB crisis exposed, just in a different form.`,
          outcome: `Priya's finding: MakerDAO/DAI now has three layers of risk — original ETH/crypto collateral risk, USDC centralisation risk, and now RWA institutional counterparty risk. Each layer adds stability (diversification) but adds a new failure mode. DAI is simultaneously more stable and more complex than it was in 2017.`,
        },
      ],

      keyTakeaway: `DAI: crypto-backed stablecoin maintained through overcollateralised vaults (CDPs). Mechanism: lock ETH/WBTC/stETH → mint DAI up to 150% collateralisation ratio → governance-set stability fee for borrow cost. Peg maintained by: supply/demand arbitrage (borrow when above $1, repay when below $1), plus DSR rate adjustments. Survived Black Thursday 2020 (ETH −55%, $5.4M bad debt, MKR dilution auction recovered it). Current DAI backing: crypto collateral + USDC (centralisation risk) + $1.5B in RWA (institutional counterparty risk). MKR token is "capital of last resort" — dilutes to cover bad debt if all else fails.`,

      guidedPractice: [
        {
          question: `Jake deposits $15,000 ETH into a MakerDAO vault with 150% minimum collateralisation. What is the maximum DAI he can mint?`,
          options: [
            `A) $15,000 DAI`, `B) $22,500 DAI`, `C) $10,000 DAI`, `D) $7,500 DAI`,
          ],
          correct: 2,
          explanation: `Maximum DAI = collateral value ÷ minimum collateralisation ratio = $15,000 ÷ 1.50 = $10,000 DAI. At this maximum, the vault has exactly 150% collateralisation — any ETH price drop triggers immediate liquidation. In practice, users mint significantly less (e.g. $7,000–$8,000) to maintain a safety buffer. The formula: collateralisation ratio = (collateral value ÷ DAI debt) × 100%.`,
          hint: `Maximum DAI = collateral ÷ minimum collateralisation ratio. $15,000 ÷ 1.50 = ?`,
        },
        {
          question: `MakerDAO governance raises the stability fee from 3% to 8%. What market behaviour follows?`,
          options: [
            `A) More DAI is minted because yields are higher`,
            `B) Existing vault owners face higher borrowing costs — many will repay DAI debt (burn DAI) to avoid 8% fees. Reduced DAI supply pushes DAI price toward or above $1.`,
            `C) The stability fee increase has no effect on DAI supply`,
            `D) More USDC is used as DAI collateral`,
          ],
          correct: 1,
          explanation: `The stability fee is MakerDAO's primary monetary policy tool. It is the interest rate on DAI borrowing. When the rate rises to 8%: CDP holders who borrowed at 3% now face 8% — some will prepay. Each repayment burns DAI. Less DAI in circulation → supply decreases → price rises toward or above $1. This is how MakerDAO defends against DAI falling below $1: raise the stability fee, increase the cost of holding DAI debt, incentivise repayment.`,
          hint: `The stability fee is the borrow rate. When borrow costs rise, do more or fewer people want to maintain their loans?`,
        },
        {
          question: `What happened mechanically during Black Thursday that allowed $0 bids to win liquidation auctions?`,
          options: [
            `A) Hackers manipulated the auction contract`,
            `B) Gas costs exceeded the liquidation bonus at peak gas prices — no keeper could bid profitably. The auction ended with only a single $0 bid, and the bidder received the full collateral for free, leaving zero DAI to repay the vault's debt`,
            `C) Maker governance suspended the liquidation mechanism`,
            `D) ETH price oracles lagged the actual market price`,
          ],
          correct: 1,
          explanation: `Liquidation economics: keeper profit = (collateral received × liquidation discount) − (DAI debt repaid) − (gas costs). At 200+ gwei gas, the gas cost term exceeded the liquidation discount term for all practical position sizes. No rational keeper would bid. In a Dutch auction with no competing bidders: the minimum bid wins. Some auctions received a single $0 DAI bid — the bidder paid nothing, received the full ETH collateral, and the DAI debt was effectively forgiven. The protocol created $5.4M of undercollateralised DAI as a result.`,
          hint: `Why would a keeper normally bid? Why couldn't they on Black Thursday? If nobody bids, who wins the auction and at what price?`,
        },
        {
          question: `DAI includes USDC as collateral (approximately 30-40% of backing). Connecting to L5.4: what specific risk does this introduce?`,
          options: [
            `A) No risk — USDC is the safest stablecoin`,
            `B) USDC depeg risk directly affects DAI's collateral value — as seen during SVB crisis, USDC at $0.87 meant the portion of DAI backed by USDC was only 87 cents-on-the-dollar collateralised`,
            `C) USDC as collateral makes DAI less liquid`,
            `D) USDC collateral eliminates DAI's decentralisation`,
          ],
          correct: 1,
          explanation: `During the March 2023 SVB depeg: USDC-backed DAI was temporarily under-collateralised. If USDC is $0.87 and DAI is $1.00, USDC-backed CDP: $1.00 of USDC collateral is now worth $0.87. A vault that had $1.50 of USDC backing $1.00 of DAI now has $1.305 of "real dollar value" backing $1.00 of DAI. Still over-collateralised but the buffer is thinner. Minting paused during the crisis was the correct precautionary response.`,
          hint: `If 35% of DAI is backed by USDC, and USDC is worth $0.87, what is the effective backing value of that 35% per dollar of DAI it backs?`,
        },
        {
          question: `What role does the MKR token play as "capital of last resort" in MakerDAO's system?`,
          options: [
            `A) MKR holders vote on governance proposals`,
            `B) When DAI has bad debt that exceeds protocol surplus, MakerDAO can mint and auction new MKR tokens to raise the DAI needed to cover the shortfall — diluting MKR holders to protect DAI holders`,
            `C) MKR is used as additional collateral for DAI minting`,
            `D) MKR holders receive DAI stability fee income directly`,
          ],
          correct: 1,
          explanation: `MKR as capital of last resort is MakerDAO's final safety layer. Normal operations: stability fees flow to the Maker Surplus Buffer. If bad debt exceeds the Surplus Buffer: governance can mint new MKR tokens and sell them at auction for DAI. The DAI raised covers the bad debt. MKR supply dilutes — existing MKR holders' ownership percentage decreases. This means MKR holders bear the tail risk of DAI's stability. Good alignment: MKR holders have strong incentive to maintain sound risk parameters because they pay the cost if those parameters fail.`,
          hint: `When Maker auctioned new MKR to cover Black Thursday's $5.4M bad debt, where did the DAI to cover the bad debt come from? Who funded it?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `Model a MakerDAO vault position for $50,000 in stETH at $3,000/stETH (~16.67 stETH). Vault type: ETH-B (150% minimum collateralisation, 5% stability fee). Target collateralisation: 200%. (A) How much DAI can be minted at 200% collateralisation? (B) If DAI is deployed in Spark sDAI at 5.5% DSR, what is the net annual yield on the deployed DAI? (C) At what stETH price does the vault reach the 150% liquidation threshold (assuming constant DAI debt)? (D) What is the health factor at stETH = $2,200?`,
          scoringCriteria: [
            `DAI at 200% collateralisation: $50,000 ÷ 2.00 = $25,000 DAI`,
            `Net yield: 5.5% DSR − 5.0% stability fee = 0.5% net on $25,000 = $125/year (modest but retains stETH exposure plus stETH staking yield)`,
            `Liquidation price: $25,000 debt × 1.50 / 16.67 stETH = $2,249 per stETH. Vault liquidated if stETH falls below approximately $2,249`,
            `Health factor at $2,200: ($2,200 × 16.67) ÷ ($25,000 × 1.50) = $36,674 ÷ $37,500 = 0.978 — below 1.0, vault is liquidatable`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `Run a full risk assessment on DAI using the five-step framework adapted for stablecoins: (1) backing quality — grade A-D, (2) peg mechanism robustness (how does it fail?) — grade A-D, (3) governance risk (who can change parameters and how quickly?) — grade A-D, (4) track record (stress events survived) — grade A-D, (5) decentralisation (resistance to regulatory seizure) — grade A-D. Compare to USDC on the same five dimensions. Identify one scenario where DAI outperforms USDC and one where USDC outperforms DAI.`,
          scoringCriteria: [
            `DAI backing quality: B-C (diversified ETH/USDC/RWA, each with own risk, less simple than fiat-backed)`,
            `DAI peg mechanism: A-B (survived Black Thursday, multiple crashes — proven under stress)`,
            `DAI governance risk: B (governance can change stability fee, collateral, DSR — but requires MKR voting, time-delay)`,
            `DAI decentralisation: A (no wallet blacklist at protocol level, no single company to freeze)`,
            `USDC wins: regulatory clarity, full institutional redemption access, simpler risk model`,
            `DAI wins: censorship resistance — no entity can freeze DAI without a governance attack`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.5 (Spark): the Spark sDAI product pays the DAI Savings Rate funded by MakerDAO's RWA yield. A researcher argues that sDAI is "equivalent to a government money market fund." Evaluate this claim: (A) what makes it accurate, (B) what makes it inaccurate, (C) for a sophisticated institutional investor comparing sDAI to a traditional money market fund (MMF), what are the two most material risks that sDAI carries that a US government MMF does not?`,
          scoringCriteria: [
            `Accurate: both invest in short-duration US Treasuries, both target ~5% yield at current rates, both have high liquidity`,
            `Inaccurate: MMF regulated under SEC Rule 2a-7, daily NAV disclosure, government-backed insurance frameworks. sDAI: smart contract risk (Maker/Spark contracts), DAI mechanism risk (if ETH crashes 70%, DAI collateral partially fails), governance risk (DSR can be cut by one vote)`,
            `Two most material risks: (1) Smart contract risk — a Maker/Spark exploit could lose principal instantly; MMFs have no equivalent. (2) Governance risk — DSR can be changed by a token vote with no advance notice; MMF yield changes follow regulatory process with disclosure`,
          ],
        },
      ],
    },
