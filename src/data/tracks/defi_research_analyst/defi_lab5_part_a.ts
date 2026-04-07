// ============================================================================
// SIFTER SKILLUP — DeFi RESEARCH ANALYST Career Track
// Lab 5: Lending Deep Dive (Part A — Lessons 4.1–4.7)
// Append to defi_lab_5.ts lessons array
// ============================================================================

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.1 — LENDING BASICS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'lending-basics',
      title: `4.1 Lending Basics — Supplying, Borrowing, and the Interest Rate Machine`,
      subtitle: `DeFi lending is a pool, not a matchmaker. Here is how money flows in, how it flows out, and what determines the rate between them.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 4 covered yield sources including lending interest as real yield. This lesson opens Lab 5 by going deep on the mechanics — how DeFi lending protocols actually work, what drives rates, and why utilisation is the single most important number in any lending analysis.`,

      hook: `In 2022 Aave had $10B in deposits paying 0.5% APY. In 2021 the same deposits paid 8% APY. Same protocol. Same code. Same depositors. The interest rate model responded to borrowing demand — and borrowing demand follows the crypto market cycle. Understanding why is understanding DeFi lending.`,

      visualPrompt: `A pool diagram: depositors pour tokens in from the left. Borrowers draw tokens out from the right. A utilisation gauge in the centre shows 0–100%. As the gauge rises toward 100%, the borrow APY line curves sharply upward. The supply APY line rises more gently. Caption: "Utilisation drives everything. High demand → high rates for everyone."`,

      explanation: `Let me tell you about the DeFi bank.

Imagine a bank where anyone can deposit and earn interest, anyone can borrow without ID, and the interest rate changes every block based on supply and demand. That is DeFi lending.

[Lending protocol] — a smart contract that pools deposited tokens and lends them to borrowers who post collateral. No credit checks. No human approval. Code executes automatically.

**The three participants:**

[Supplier / Depositor] — deposits tokens into the pool and receives a yield-bearing receipt token (aToken on Aave, cToken on Compound). The receipt token automatically accrues interest.

[Borrower] — deposits collateral worth more than the loan (overcollateralised), draws out tokens from the pool, and pays interest. Must maintain the health factor above 1 or face liquidation.

[Liquidator] — a third party who repays a borrower's debt when their health factor drops below 1, receiving the collateral at a discount as reward.

**The utilisation rate — the master variable:**

[Utilisation rate] = Borrowed tokens ÷ Total deposited tokens

At 0% utilisation: nobody is borrowing. Rates are near zero.
At 80% utilisation: most deposits are lent out. Rates are elevated.
At 95%+ utilisation: almost all deposits are out. Borrow rate spikes sharply (the kink). Suppliers cannot withdraw until borrowers repay.

The [kink model] — most protocols set a target utilisation (typically 80%). Below the kink: rates rise gradually. Above the kink: rates rise steeply to incentivise repayment.

**The overcollateralisation requirement:**

[Loan-to-Value (LTV)] — maximum loan as a percentage of collateral value. ETH LTV on Aave: 80%. Deposit $10,000 ETH → borrow up to $8,000 USDC.

[Liquidation threshold] — the LTV at which liquidation triggers. Usually higher than max LTV. ETH liquidation threshold on Aave: 82.5%. If your $10,000 ETH collateral falls to $9,700 and you borrowed $8,000: LTV = 82.5% → liquidation.

[Health factor] = (Collateral × liquidation threshold) ÷ debt. Must stay above 1 to avoid liquidation.

**Why DeFi lending requires overcollateralisation:**

No credit scores. No identity. No recourse if the borrower disappears. The collateral is the only guarantee. This is why every DeFi loan requires more collateral than the loan value — the protocol must always be able to repay depositors even if the borrower walks away.

**Supply vs borrow APY:**

[Borrow APY] — what borrowers pay. Determined by the utilisation rate.
[Supply APY] = Borrow APY × Utilisation rate × (1 − Reserve factor)

Reserve factor: a percentage of interest kept by the protocol treasury (typically 10–20%). Aave's reserve factor on USDC: 10%. If borrow APY is 6% and utilisation is 80%: supply APY = 6% × 80% × 90% = 4.32%.`,

      examples: [
        {
          contextTag: `[Junior Analyst, first lending protocol evaluation]`,
          context: `Maya is asked to explain why Aave USDC supply APY dropped from 7% to 2% over three months without any protocol change.`,
          scenario: `Q3 2022: crypto market in bear phase. Leverage demand collapses. Traders stop borrowing USDC to buy ETH. Utilisation drops from 78% to 35%. Borrow APY falls from 9% to 3%. Supply APY: 3% × 35% × 90% = 0.945%. Maya traces the causal chain: market sentiment → borrowing demand → utilisation → borrow rate → supply rate. The protocol worked exactly as designed.`,
          outcome: `Maya documents the causal chain for Marcus. He adds it to the team's rate-cycle model. Understanding the utilisation driver allows the team to predict when supply rates will recover: when leverage demand returns in the next bull cycle, utilisation rises, rates follow.`,
        },
        {
          contextTag: `[Borrower, ETH collateral, near liquidation]`,
          context: `Jake deposited 5 ETH as collateral on Aave and borrowed $8,000 USDC. ETH was at $2,500 (collateral value $12,500). Health factor: ($12,500 × 82.5%) ÷ $8,000 = 1.29.`,
          scenario: `ETH drops 20% to $2,000. New collateral value: $10,000. Health factor: ($10,000 × 82.5%) ÷ $8,000 = 1.03. Dangerously close to liquidation threshold (1.0). Jake must either: repay some USDC debt, add more ETH collateral, or risk having his ETH liquidated at a 5% discount by liquidators scanning for unhealthy positions.`,
          outcome: `Jake repays $1,500 USDC. New health factor: ($10,000 × 82.5%) ÷ $6,500 = 1.27. Safe again. Lesson: health factor monitoring is continuous work, not a set-and-forget activity.`,
        },
        {
          contextTag: `[Researcher, protocol comparison]`,
          context: `Priya compares two lending protocols for a $200K USDC deployment. Protocol A: 5.2% supply APY, 78% utilisation, 10% reserve factor. Protocol B: 8.1% supply APY, 92% utilisation, 15% reserve factor.`,
          scenario: `Protocol B's 8.1% looks better. But 92% utilisation is above the kink — near illiquidity. If $100K tries to withdraw simultaneously: not enough free liquidity. Priya checks: the extra 2.9% yield requires accepting withdrawal risk. She models: if utilisation stays at 92% for 30 days, net yield advantage = $200K × 2.9% × (30/365) = $476. The withdrawal risk is not worth $476.`,
          outcome: `Priya deploys to Protocol A. Two weeks later Protocol B hits 97% utilisation and withdrawals queue. Her decision saved a potential 2-week lock on $200K of capital.`,
        },
      ],

      keyTakeaway: `DeFi lending pools: depositors supply → borrowers draw out → utilisation rate = borrowed ÷ total deposited → utilisation drives borrow rate (kink model) → supply APY = borrow APY × utilisation × (1 − reserve factor). Health factor = (collateral × liquidation threshold) ÷ debt. Below 1 = liquidation. High utilisation means high rates but also withdrawal risk — always check utilisation before depositing large amounts.`,

      guidedPractice: [
        {
          question: `A pool has $10M deposited and $7.5M borrowed. What is the utilisation rate?`,
          options: [`A) 25%`, `B) 75%`, `C) 133%`, `D) 7.5%`],
          correct: 1,
          explanation: `Utilisation = borrowed ÷ deposited = $7.5M ÷ $10M = 75%. This is just below the typical 80% kink, so rates are elevated but not yet in the sharp upswing zone.`,
          hint: `Utilisation = what's out ÷ what's in. Divide borrowed by total deposited.`,
        },
        {
          question: `Borrow APY is 8%, utilisation is 70%, reserve factor is 10%. What is supply APY?`,
          options: [`A) 8%`, `B) 5.04%`, `C) 7.2%`, `D) 4.32%`],
          correct: 1,
          explanation: `Supply APY = 8% × 70% × (1 − 10%) = 8% × 0.70 × 0.90 = 5.04%. The reserve factor and utilisation together mean suppliers always earn less than the borrow rate. The spread funds the protocol treasury.`,
          hint: `Supply APY = borrow APY × utilisation rate × (1 − reserve factor). Multiply all three together.`,
        },
        {
          question: `Jake's health factor is 1.05. What does this mean and what should he do?`,
          options: [
            `A) He is safe — health factor above 1 means no risk`,
            `B) He is dangerously close to liquidation. Any further collateral price drop triggers automated liquidation. He should repay debt or add collateral immediately.`,
            `C) He should borrow more to take advantage of available capacity`,
            `D) He needs to wait 24 hours before any action is possible`,
          ],
          correct: 1,
          explanation: `Health factor 1.05 means a 5% drop in collateral value (or 5% increase in debt value) triggers liquidation at 1.0. Liquidators are scanning constantly — they will act the moment it crosses. Immediate action: repay enough debt to raise the health factor to at least 1.3, or add collateral. Never leave a health factor below 1.2 without active monitoring.`,
          hint: `Health factor below 1 = liquidation. 1.05 means only a 5% adverse move triggers it. Is that safe?`,
        },
        {
          question: `Why does DeFi lending require overcollateralisation rather than matching borrowers to lenders by creditworthiness?`,
          options: [
            `A) DeFi is slower than TradFi and needs extra buffer time`,
            `B) Borrowers are pseudonymous with no credit history or legal recourse — the collateral is the only guarantee the protocol can enforce without trusting the borrower's identity`,
            `C) Overcollateralisation earns the protocol more fees`,
            `D) Regulators require it for DeFi protocols`,
          ],
          correct: 1,
          explanation: `DeFi lending is permissionless — anyone connects a wallet and borrows without revealing identity. There is no credit score, no legal system to pursue defaulters, no identity verification. The smart contract can only enforce what it controls: the locked collateral. Overcollateralisation ensures the protocol can always make depositors whole by liquidating the collateral, even if the borrower never repays.`,
          hint: `Why can a bank lend without collateral but a DeFi protocol cannot? What does a bank know about you that a smart contract doesn't?`,
        },
        {
          question: `Connecting to Lab 4 (L6.1): why is lending interest classified as "real yield" rather than emission yield?`,
          options: [
            `A) Because lending protocols are older than DEXes`,
            `B) Because it comes from borrowers paying to use capital — real economic demand, not newly minted tokens. If all token emissions stopped, lenders would still earn interest from borrowers.`,
            `C) Because it is paid in USDC rather than governance tokens`,
            `D) Lending interest is actually emission yield — it depends on the governance token price`,
          ],
          correct: 1,
          explanation: `Real yield test from L6.1: if all token emissions stopped today, would yield persist? Yes — borrowers still pay interest on outstanding loans regardless of any governance token. The interest comes from the real economic activity of people borrowing capital and paying to use it. This is structurally identical to bank deposit interest, just mediated by a smart contract instead of a bank.`,
          hint: `From L6.1: the real yield test. If AAVE token emissions stopped tomorrow, would Aave depositors still earn anything?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `Aave V3 USDC on Arbitrum: $400M total deposits, $310M borrowed, reserve factor 10%. The borrow rate model shows: at 77.5% utilisation the borrow APY is 5.8%. Calculate: (A) current utilisation rate, (B) current supply APY, (C) if $50M more is borrowed (utilisation crosses the 80% kink and borrow APY jumps to 9.2%), what is the new supply APY? Which utilisation scenario gives better supply yield and by how much annually on a $100K deposit?`,
          scoringCriteria: [
            `Correctly calculates current utilisation: $310M ÷ $400M = 77.5%`,
            `Correctly calculates current supply APY: 5.8% × 77.5% × 90% = 4.04%`,
            `Correctly calculates post-kink supply APY: 9.2% × (360/400) × 90% = 7.45%`,
            `Correctly states annual dollar difference on $100K: ($7,450 − $4,040) = $3,410/year more at higher utilisation`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `Sarah is evaluating two USDC lending pools for a $500K institutional deposit. Pool A: $2B deposits, 68% utilisation, Aave V3 on Ethereum, 3 years live, 5 audits. Pool B: $80M deposits, 91% utilisation, new protocol on a new L2, 4 months live, 1 audit. Pool B advertises 11.2% supply APY vs Pool A's 3.8%. For each pool: assess withdrawal liquidity risk, smart contract risk, and the sustainability of the yield differential. What is the maximum position size you would recommend in Pool B and why?`,
          scoringCriteria: [
            `Identifies Pool B's 91% utilisation as above the kink — withdrawal of $500K (0.6% of pool) could move rates and may face queuing`,
            `Flags Pool B's smart contract risk: 4 months live, 1 audit vs Aave's 3 years, 5 audits`,
            `Identifies yield difference: 7.4% higher. On $500K for 12 months that is $37K — but tail risk of exploit or liquidity lock is not compensated`,
            `Recommends minimal or zero allocation to Pool B for institutional capital, or a small exploratory position (e.g. $10–20K max) with close monitoring`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Marcus asks Maya to build a "lending rate cycle model." He wants to know: in which market conditions are lending supply rates highest, when are they lowest, and what on-chain signal should trigger a rebalance from one lending protocol to another? Use the utilisation rate framework to answer all three questions, and give one specific metric she should track weekly.`,
          scoringCriteria: [
            `Correctly identifies bull market / high leverage demand as the condition for peak supply rates (high utilisation)`,
            `Correctly identifies bear market / deleveraging as the condition for lowest supply rates`,
            `Names a specific, measurable rebalance trigger (e.g. utilisation dropping below 60% on current protocol while another shows above 75%)`,
            `Names a specific weekly tracking metric: utilisation rate on DeFiLlama or Token Terminal, refreshed weekly`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.2 — AAVE
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'aave',
      title: `4.2 Aave — The Multi-Chain Lending Leader`,
      subtitle: `$10B+ TVL, 12 chains, three versions. Aave is the benchmark every other lending protocol is compared against. Here is why it dominates and what its weaknesses are.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.1 you learned lending fundamentals — utilisation rates, health factors, and the interest rate kink model. This lesson applies that framework to Aave specifically: how it implements lending across chains, what distinguishes V2 from V3, and where Aave's competitive advantages and risks actually sit.`,

      hook: `In the 2022 bear market, Aave had $600M in bad debt exposure from a single coordinated attack on the CRV/USDC pool. The protocol survived — no depositor lost funds — because of its risk parameters. Understanding exactly why it survived teaches you more about DeFi lending risk than any whitepaper.`,

      visualPrompt: `Aave's multi-chain deployment map: Ethereum (largest circle), Arbitrum, Polygon, Optimism, Base, Avalanche, BNB Chain, and others. Each circle sized by TVL. Lines connecting them labelled "same codebase, separate liquidity." Sidebar showing V1/V2/V3 timeline with key feature additions at each version. Caption: "One protocol, 12 deployments, one shared risk model."`,

      explanation: `Let me tell you about the king of lending.

When people think "DeFi bank," they think Aave. It is the largest lending protocol by TVL, deployed on more chains than any competitor, and the de facto benchmark for lending protocol analysis.

**Aave's architecture:**

[Aave V1 (2020)] — basic lending pool. Proved the model worked at scale.
[Aave V2 (2020)] — added credit delegation (lend your borrowing power to another wallet), debt tokenisation (aTokens and debtTokens), and flash loans.
[Aave V3 (2022)] — the current standard. Key additions:

[Portal] — cross-chain liquidity bridging. Move liquidity between Aave deployments on different chains atomically.
[Isolation mode] — new or risky assets can be listed in isolation: only borrowable up to a debt ceiling, only USDC/stablecoins can be borrowed against them. Reduces contagion risk from new collateral types.
[Efficiency mode (eMode)] — allows higher LTV for correlated assets. ETH/stETH in eMode: LTV up to 93% instead of 80%, because both track ETH price closely. Critical for the stETH leverage loop from L6.7.
[Supply and borrow caps] — protocol governance can cap how much of any asset can be supplied or borrowed, preventing over-concentration.

**Aave's competitive moat:**

[Depth of liquidity] — $10B+ TVL means institutional-sized trades execute without moving rates. Competitors with $100M TVL cannot serve $50M borrowers.
[Multi-chain deployment] — deployed on 12 chains with consistent UX, risk parameters, and audits. A researcher deploying on Arbitrum, Polygon, and Ethereum can use Aave everywhere without learning new interfaces.
[Audit history] — 10+ audits over 4 years, including Trail of Bits, OpenZeppelin, and ABDK. Longest battle-tested track record in DeFi lending.
[AAVE token governance] — token holders vote on risk parameters, collateral listings, and fee distribution. Fee switch (sharing protocol revenue with stakers) has been discussed but not implemented at scale.

**The 2022 CRV attack — what happened:**

A trader borrowed $100M USDC against CRV collateral on Aave. Another actor shorted CRV heavily on CEXes, attempting to crash CRV below Aave's liquidation threshold before liquidators could act. The position created potential bad debt of $1.6M (the gap between collateral value and debt after liquidation). Aave's treasury absorbed the loss. No depositor lost funds. Lesson: protocol treasury depth is a real risk buffer. Aave's $300M+ treasury made this survivable.

**Risk parameters — how Aave manages asset risk:**

Each collateral asset on Aave has: LTV (max borrow), liquidation threshold (trigger point), liquidation bonus (reward for liquidators), and supply/borrow caps. These are set by governance based on oracle reliability, liquidity depth, and volatility. Lower-quality assets get lower LTV and stricter caps.`,

      examples: [
        {
          contextTag: `[DeFi researcher, Aave V3 eMode analysis]`,
          context: `Priya is modelling a leveraged stETH position using Aave V3's eMode feature for a $100K ETH position.`,
          scenario: `Normal mode: ETH LTV 80%. Deposit $100K stETH → borrow $80K ETH → buy stETH → deposit $80K → borrow $64K → 3 loops = $244K stETH exposure, $144K debt. eMode: stETH LTV 93%. Deposit $100K stETH → borrow $93K ETH → 5 loops = $430K stETH exposure, $330K debt. eMode yields significantly higher leveraged staking APY. Risk difference: eMode positions are more sensitive to a stETH depeg — if stETH trades at 0.97 ETH instead of 1.0, health factor drops sharply on the leveraged position.`,
          outcome: `Priya uses eMode with 4 loops instead of 5 to maintain a health factor above 1.4. She sets a price alert at stETH = 0.96 ETH to trigger manual deleveraging. The extra yield from eMode: approximately 2.1% additional APY on the $100K base.`,
        },
        {
          contextTag: `[Protocol researcher, isolation mode evaluation]`,
          context: `Aave governance is voting on whether to list a new token (TOKEN_X) as collateral. Maya is writing the risk analysis.`,
          scenario: `TOKEN_X: $50M market cap, DEX-only liquidity, oracle uses a 30-minute TWAP. Without isolation mode: if TOKEN_X is manipulated and used to drain the lending pool, all depositors suffer. With isolation mode: TOKEN_X gets a $2M debt ceiling (only $2M can be borrowed against it), only USDC is borrowable against it (not ETH which has deeper manipulation potential), and a single position cannot exceed $500K. The worst-case loss is capped at $2M — absorbable by Aave's treasury.`,
          outcome: `Governance passes TOKEN_X listing in isolation mode. Six months later TOKEN_X is deprioritised by its team and price drops 80%. Two liquidations occur totalling $400K — handled cleanly with no bad debt. Isolation mode worked as designed.`,
        },
        {
          contextTag: `[Fund analyst, cross-chain Aave yield comparison]`,
          context: `Marcus wants to deploy $1M USDC across Aave deployments for the best risk-adjusted yield.`,
          scenario: `Current yields: Aave V3 Ethereum 3.2% (deepest, lowest risk), Aave V3 Arbitrum 5.4% (same code, lower gas, slightly higher utilisation), Aave V3 Polygon 4.1% (lower utilisation, older deployment), Aave V3 BNB 7.8% (highest but BNB Chain risk from L2.9). Split decision: $400K Arbitrum (best risk/yield on Ethereum-secured L2), $350K Ethereum mainnet (ultimate safe harbour), $200K Polygon (diversification), $50K BNB (yield pickup with limited BNB exposure). Blended yield: ~4.8% vs 3.2% Ethereum-only.`,
          outcome: `The split achieves 1.6% higher blended yield with diversified chain exposure. Each deployment uses identical Aave code — the only variable is chain-specific utilisation and risk.`,
        },
      ],

      keyTakeaway: `Aave is the benchmark DeFi lender: $10B+ TVL, 12 chains, V3 features including eMode (higher LTV for correlated assets), isolation mode (debt ceilings for new collateral), and supply/borrow caps. Competitive moat: liquidity depth, multi-chain deployment, and 4+ years of audited battle-testing. Risk parameters (LTV, liquidation threshold, caps) are governance-controlled per asset. Aave's treasury absorbed a $1.6M bad debt event in 2022 without depositor losses — treasury depth is a real safety buffer.`,

      guidedPractice: [
        {
          question: `What is Aave V3 eMode and when does it benefit a borrower?`,
          options: [
            `A) eMode eliminates liquidation risk entirely`,
            `B) eMode allows higher LTV (up to 93%) for correlated asset pairs like stETH/ETH — benefiting leveraged staking strategies where both assets track the same price`,
            `C) eMode is only available on Ethereum mainnet`,
            `D) eMode reduces the borrow APY by 50%`,
          ],
          correct: 1,
          explanation: `eMode recognises that correlated assets (stETH and ETH both track ETH price) have much lower relative price risk than uncorrelated pairs. Normal ETH LTV: 80%. eMode stETH/ETH LTV: 93%. This allows significantly more leverage in the stETH loop strategy from L6.7. The risk: if stETH depegs from ETH (as happened in June 2022), the higher leverage amplifies health factor stress.`,
          hint: `eMode stands for "efficiency mode." It is designed for assets that track each other closely. What does higher correlation between collateral and borrowed asset mean for liquidation risk?`,
        },
        {
          question: `Aave lists a new DeFi token in isolation mode with a $5M debt ceiling. A whale tries to deposit $50M of this token as collateral and borrow $20M USDC. What happens?`,
          options: [
            `A) The transaction executes normally — TVL limits don't exist on Aave`,
            `B) The borrow is capped at $5M USDC regardless of collateral size — the debt ceiling blocks borrowing beyond the protocol-wide limit for this isolated asset`,
            `C) The position is rejected entirely due to isolation mode`,
            `D) Only the collateral deposit is blocked, not the borrow`,
          ],
          correct: 1,
          explanation: `Isolation mode sets a protocol-wide debt ceiling for that asset — total borrowed against it across all users cannot exceed $5M. Even if the whale's $50M collateral would theoretically support $20M in borrowing (at 40% LTV), the debt ceiling caps the entire market's borrowing at $5M. This prevents a single new/risky asset from creating outsized exposure across the whole protocol.`,
          hint: `Isolation mode uses a debt ceiling — a cap on total borrowing against this asset across the whole protocol. Not per-user.`,
        },
        {
          question: `During the 2022 CRV attack on Aave, why did depositors not lose funds despite $1.6M in bad debt?`,
          options: [
            `A) The attacker returned the funds voluntarily`,
            `B) Aave's protocol treasury absorbed the bad debt loss — the treasury was large enough to cover $1.6M without touching depositor funds`,
            `C) Aave had insurance from Nexus Mutual that covered the loss`,
            `D) The liquidation system recovered the full debt value`,
          ],
          correct: 1,
          explanation: `Bad debt = debt that exceeds the collateral value at the time of liquidation — the shortfall that liquidators cannot recover. Aave's treasury (accumulated from protocol fees) covered the $1.6M gap. Treasury depth is therefore a real safety buffer for depositors. A protocol with a $5M treasury can absorb a $1.6M bad debt event. A protocol with $50K in treasury cannot. Always check the protocol treasury before allocating significant capital.`,
          hint: `Bad debt means the collateral was not enough to repay the loan. Liquidators could not cover the gap. Who did?`,
        },
        {
          question: `Connecting to L4.1: Aave's supply cap for a risky asset is set to $100M. The current supply is $98M. Should you deposit $5M of this asset?`,
          options: [
            `A) Yes — the supply cap shows the protocol trusts this asset`,
            `B) No — only $2M more can be supplied before the cap is hit. Your $5M deposit would exceed the cap and either be rejected or only partially accepted. More importantly, supply caps near-full signal governance concern about this asset.`,
            `C) Supply caps only affect borrowing, not deposits`,
            `D) Caps reset monthly so you should act quickly`,
          ],
          correct: 1,
          explanation: `Supply caps set the maximum total deposits for a given asset. At $98M/$100M you are $2M away from the cap. Attempting a $5M deposit would either fail or only deposit $2M. More importantly: a supply cap near maximum signals that governance explicitly limited this asset's footprint in the protocol — usually because of oracle risk, liquidity risk, or concentration concern. Near-cap assets warrant extra scrutiny before depositing.`,
          hint: `Two questions: (1) can you physically deposit $5M when only $2M capacity remains? (2) What does a nearly-full supply cap signal about governance's view of this asset?`,
        },
        {
          question: `Aave is deployed identically on Ethereum mainnet and Arbitrum. USDC supply APY on Ethereum is 3.2% and on Arbitrum is 5.4%. What specifically causes this difference?`,
          options: [
            `A) Aave charges higher fees on Arbitrum`,
            `B) Different utilisation rates driven by different borrowing demand on each chain — more active DeFi trading on Arbitrum creates higher leverage demand and thus higher utilisation`,
            `C) Arbitrum Aave has a lower reserve factor`,
            `D) The Arbitrum deployment is riskier so pays more`,
          ],
          correct: 1,
          explanation: `Same code, different utilisation. Arbitrum hosts more active DeFi trading (GMX perps, Camelot, Uniswap V3 farming) which creates more borrowing demand — traders borrow USDC to deploy in these strategies. Higher demand → higher utilisation → higher borrow APY → higher supply APY. The 2.2% gap is entirely driven by chain-specific borrowing activity, not different code or risk parameters.`,
          hint: `From L4.1: supply APY = f(utilisation). Both chains use identical Aave code. What variable differs between them?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-protocol-eval`,
          scenario: `A DeFi fund is allocating $2M across lending protocols. The candidate list: Aave V3 Ethereum USDC (3.2% APY, $8B TVL, 10+ audits, 4 years live), Aave V3 Arbitrum USDC (5.4% APY, $2B TVL, same codebase, 18 months live), and a new lending protocol on Arbitrum (8.9% APY, $60M TVL, 3 months live, 1 audit). Priya requires: minimum 3 audits, maximum 30% in any single protocol, and blended APY must exceed 4%. Design the allocation, show blended APY calculation, and identify the one disqualified option with your reasoning.`,
          scoringCriteria: [
            `Correctly disqualifies the new protocol (1 audit fails the 3-audit minimum)`,
            `Allocates $2M across Aave Ethereum and Aave Arbitrum within the 30% cap (max $600K each)`,
            `Calculates blended APY correctly given the allocation`,
            `Notes that Aave Arbitrum and Ethereum share codebase so concentration risk is partially correlated`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `You are reviewing an Aave V3 position: $500K stETH deposited in eMode on Arbitrum, $430K ETH borrowed (86% LTV), swapped to stETH, re-deposited for a total of $1.8M stETH exposure and $1.3M debt. Current stETH/ETH ratio: 0.999. Simulate: (A) stETH depegs to 0.97 ETH — what happens to the health factor? (B) At what stETH/ETH ratio does liquidation trigger? (C) What specific action reduces the risk most efficiently?`,
          scoringCriteria: [
            `Calculates that stETH depeg to 0.97 reduces collateral value by 3% — with 86% LTV used, health factor drops below 1.1`,
            `Identifies the liquidation trigger: health factor reaches 1.0, which occurs when collateral × liquidation threshold = debt`,
            `Names the most efficient risk reduction: repay debt (unwind the loop) rather than add collateral, because debt reduction improves health factor more efficiently at high leverage`,
            `Notes that the June 2022 stETH depeg (to 0.94) would have triggered mass liquidations at this leverage level`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `DeFiLlama shows Aave across 8 chains. Build a priority ranking for deploying $300K USDC using only these metrics: TVL, 7-day volume, supply APY, and chain security level (from Lab 2). Ethereum TVL $4.2B/APY 3.2%, Arbitrum TVL $1.8B/APY 5.4%, Base TVL $420M/APY 4.8%, Polygon TVL $280M/APY 3.9%, BNB Chain TVL $190M/APY 7.1%, Avalanche TVL $90M/APY 4.2%. Rank top 3 and justify using the exact metrics given.`,
          scoringCriteria: [
            `Ranks Arbitrum #1 or #2: best risk-adjusted yield (5.4%, $1.8B TVL, Ethereum-secured L2)`,
            `Ranks Ethereum #1 or #2: highest security, deepest TVL — appropriate anchor for institutional capital`,
            `Either flags BNB Chain's 7.1% as unattractive for large allocation due to centralisation risk (from L2.9) despite highest yield`,
            `References TVL depth as a withdrawal liquidity proxy — Avalanche ($90M) inadequate for $300K at peak utilisation`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.3 — COMPOUND
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'compound',
      title: `4.3 Compound — The Original, and What V3 Changed`,
      subtitle: `Compound invented the interest rate model that Aave, Morpho, and every other lending protocol uses. V3 redesigned it from scratch. Here is why.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.2 you studied Aave's architecture and competitive moat. Compound is Aave's primary Ethereum competitor and the protocol that invented DeFi lending's core mechanics. Understanding Compound means understanding the history of the category — and the design trade-off that V3 made.`,

      hook: `Compound's COMP token launch in June 2020 triggered the first DeFi summer — the first time a protocol distributed governance tokens as yield, creating the liquidity mining meta that dominated the next two years. The mechanism Compound invented was immediately copied by every competitor. The model it moved away from in V3 is what most of those competitors still use.`,

      visualPrompt: `Two diagrams side by side. Left: Compound V2 — a single pool with multiple assets mixed together, all shared liquidity. Right: Compound V3 (Comet) — isolated markets, one base asset per deployment, cleaner risk separation. Arrow between them labelled "2022 redesign." Caption: "V2: everything in one pool. V3: one market per base asset. Why the difference matters."`,

      explanation: `Let me tell you about the grandfather of lending.

Before Aave dominated, there was Compound. It was the first DeFi lending protocol to achieve meaningful scale, invented the interest rate model every competitor now uses, and triggered the DeFi summer of 2020 by being the first to distribute governance tokens as yield incentives.

**Compound V2 — the original design:**

[Compound V2] — a unified pool where users can supply any supported asset and borrow any other supported asset. Every asset earns and pays rates. Risk is shared across all assets in the pool.

[cToken] — the receipt token for each supplied asset. Supply 100 USDC → receive cUSDC. cToken exchange rate increases over time as interest accrues. Different from Aave's rebasing aToken: cToken balance stays fixed, exchange rate grows.

[COMP token and liquidity mining] — Compound launched COMP in June 2020 and began distributing it to both suppliers and borrowers proportional to their activity. This was DeFi's first large-scale liquidity mining programme. It created a recursive dynamic: borrow USDC → earn COMP → sell COMP → repay debt → pocket the spread. At peak, borrowing was profitable because COMP rewards exceeded borrow costs.

**The problem with V2's shared pool model:**

In a shared pool, a bad collateral asset can drain the entire pool. If Token X is listed as collateral and its oracle is manipulated, an attacker can borrow all the USDC using artificially inflated Token X — emptying the pool of liquid assets. The risk from any single bad asset spreads to all depositors.

**Compound V3 (Comet) — the redesign:**

[Compound V3 / Comet] — launched 2022. Fundamental redesign: each deployment has one base asset (e.g. USDC) that users can supply and borrow. Multiple collateral assets are accepted but cannot be borrowed. Key differences:

Collateral cannot be borrowed: you deposit ETH as collateral, but nobody can borrow your ETH. Only the base asset (USDC) circulates. This eliminates the cross-asset contamination risk.

[Isolated risk model]: each Comet market is fully isolated. A problem with one collateral asset in one market cannot drain other markets.

[Streamlined liquidation]: simpler liquidation logic, lower gas costs.

**Where Compound stands today:**

V3 has $700M–$1B TVL, significantly below Aave's $10B+. The redesign created a cleaner, safer architecture but at the cost of capital efficiency — suppliers cannot earn yield on their collateral. The DeFi community largely migrated to Aave, but Compound V3 remains relevant as a safer, simpler alternative with strong institutional credibility (a16z and Bain Capital backed the original raise).`,

      examples: [
        {
          contextTag: `[Historical researcher, DeFi Summer 2020]`,
          context: `Maya is building a timeline of DeFi innovation for the team's research library. She needs to explain the significance of Compound's COMP launch.`,
          scenario: `June 15 2020: Compound launches COMP token distribution. Users who supply or borrow earn COMP proportional to their activity. At COMP price $200: supplying USDC earns 3% base APY + 8% COMP rewards = 11% total. Borrowing USDC costs 5% base APY but earns 12% COMP rewards = 7% net profit to borrow. Total Compound TVL: $90M in April 2020 → $700M by July 2020 → $2B by September 2020. This mechanism — liquidity mining — was immediately forked by Sushiswap (on Uniswap), Balancer, and every subsequent protocol.`,
          outcome: `Maya documents: Compound invented liquidity mining, which created the DeFi summer meta, which attracted $10B+ in TVL across the ecosystem by end 2020. The mechanism worked perfectly at bootstrapping liquidity and equally perfectly at creating unsustainable yields.`,
        },
        {
          contextTag: `[Risk researcher, shared pool vulnerability analysis]`,
          context: `Priya is explaining to a new team member why Compound V3's isolated market design matters compared to V2.`,
          scenario: `V2 scenario: Protocol lists TokenX with a manipulable oracle. Attacker: (1) deposits $1M TokenX (real value $100K due to oracle manipulation reading $10M), (2) borrows $8M USDC against $10M manipulated collateral value, (3) walks away. USDC depositors collectively lose $8M. Entire USDC pool drained. In V3: TokenX is a collateral-only asset in a USDC Comet market. Attacker deposits TokenX, borrows USDC. But: V3 has a supply cap and borrow limit per collateral type. Even if oracle is manipulated, maximum loss is capped at the collateral's borrow limit — cannot drain the whole pool.`,
          outcome: `Priya's analysis: V3's collateral-cannot-be-borrowed design eliminates one entire attack vector. Collateral sits inert — it is only sold during liquidation, never borrowed against for recursive attacks.`,
        },
        {
          contextTag: `[Analyst, V2 vs V3 depositor comparison]`,
          context: `Jake has 50,000 USDC to lend. He compares Compound V2 and V3 on Ethereum mainnet.`,
          scenario: `Compound V2: supply USDC to the shared pool. Earn cUSDC. APY: 3.1%. Risk: shared with all collateral assets in the pool. Compound V3 USDC Comet: supply USDC as the base asset. Earn yield. APY: 3.3%. Risk: only exposed to Comet's listed collateral assets (ETH, WBTC, wstETH — all high quality). Can also supply collateral (ETH) but earns zero yield on it. Decision: V3 at 3.3% is both slightly higher yield AND lower risk (isolated market). For Jake's simple USDC supply, V3 is strictly superior to V2.`,
          outcome: `Jake moves to V3 Comet. Better yield, cleaner risk. The main V3 limitation: his ETH collateral earns nothing, unlike V2 where depositing ETH earned cETH yield. He accepts this trade-off.`,
        },
      ],

      keyTakeaway: `Compound invented DeFi lending's interest rate model and liquidity mining (COMP token, June 2020). V2: shared pool where all assets can be supplied and borrowed — elegant but exposes all depositors to any bad collateral asset. V3 (Comet): isolated markets, one base asset per deployment, collateral cannot be borrowed — cleaner risk model but lower capital efficiency. V3 TVL: $700M–$1B vs Aave's $10B+. Key lesson: shared pool design is capital efficient but systemically risky; isolated market design is safer but constrains capital efficiency.`,

      guidedPractice: [
        {
          question: `What did Compound's COMP token launch in June 2020 pioneer and what was its primary market impact?`,
          options: [
            `A) COMP was the first stablecoin in DeFi`,
            `B) Liquidity mining — distributing governance tokens to users proportional to protocol activity, triggering DeFi Summer and a template copied by every subsequent protocol`,
            `C) COMP was the first DeFi token listed on Coinbase`,
            `D) Compound invented the automated market maker model`,
          ],
          correct: 1,
          explanation: `Compound's COMP distribution (to both suppliers and borrowers) created the first liquidity mining programme at scale. The result: TVL grew 20× in 3 months as capital chased COMP rewards. Every subsequent DeFi protocol in 2020–2022 launched with a similar model. The mechanism was brilliant for bootstrapping TVL and deeply flawed for sustainability — as L6.13's yield sustainability lesson shows, emission-funded yield collapses when emissions end or token price falls.`,
          hint: `What does "liquidity mining" mean? What did distributing COMP tokens to users incentivise?`,
        },
        {
          question: `In Compound V2's shared pool, why can a single bad collateral asset threaten all depositors?`,
          options: [
            `A) All depositors vote on collateral decisions and are equally responsible`,
            `B) The shared pool means all deposited assets back all loans — if an attacker exploits a weak collateral asset to borrow USDC, the loss comes from the shared USDC pool that all USDC depositors contributed to`,
            `C) V2 allows any asset to be used as collateral without governance approval`,
            `D) V2 uses oracles that are vulnerable to manipulation on a single block`,
          ],
          correct: 1,
          explanation: `Shared pool design means all supplied assets are commingled — a single pool of USDC backs all USDC loans regardless of what collateral was posted. An attacker who manipulates a single weak collateral asset's oracle can drain the entire USDC supply from that pool. All USDC suppliers — even those who never interacted with the weak collateral asset — bear proportional losses. V3's isolated markets prevent this contagion by design.`,
          hint: `Think of a shared pool as a single bucket. Every USDC depositor added to it. What happens to all of them if someone drains the bucket?`,
        },
        {
          question: `What is the key design difference between Compound V2's cToken and Aave's aToken?`,
          options: [
            `A) cTokens earn more yield than aTokens`,
            `B) aToken balance increases daily (rebasing), cToken balance stays fixed but exchange rate grows — both represent the same underlying accrual but in different accounting forms`,
            `C) cTokens can be used as collateral; aTokens cannot`,
            `D) cTokens are only available on Ethereum mainnet`,
          ],
          correct: 1,
          explanation: `Both represent "deposit + accrued interest" but in different ways. aToken: deposit 100 USDC → receive 100 aUSDC that grows to 103 aUSDC after a year (balance increases). cToken: deposit 100 USDC → receive 95 cUSDC (exchange rate 1.05). After a year: still 95 cUSDC but now redeemable for 103.15 USDC (exchange rate 1.086). Same economic outcome, different accounting. cTokens avoid the "spontaneous balance change" problem that complicated aToken integration in smart contracts.`,
          hint: `From L6.7: stETH vs rETH used the same distinction — rebasing vs exchange rate. Apply that to cToken vs aToken.`,
        },
        {
          question: `In Compound V3, a user deposits 10 ETH as collateral in the USDC Comet and then tries to borrow 5 ETH. What happens?`,
          options: [
            `A) The borrow succeeds — ETH is the most liquid collateral`,
            `B) The borrow fails — in V3's isolated market design, collateral assets (ETH) cannot be borrowed. Only the base asset (USDC) can be borrowed.`,
            `C) The user must first convert ETH to USDC before borrowing`,
            `D) The borrow is queued until sufficient ETH liquidity exists`,
          ],
          correct: 1,
          explanation: `V3 (Comet) has a strict separation: the base asset (USDC in the USDC Comet) is the only borrowable asset. All other assets (ETH, WBTC, wstETH) are collateral-only — they sit locked, cannot be borrowed, and only move during liquidation. This eliminates the recursive collateral attack vector that threatens shared-pool V2 designs.`,
          hint: `What is the core V3 design principle? "Collateral cannot be ___."`,
        },
        {
          question: `Compound V3 has $800M TVL while Aave has $10B+ TVL. Does lower TVL mean Compound V3 is worse for institutional depositors?`,
          options: [
            `A) Yes — lower TVL always means worse for institutional depositors`,
            `B) Not necessarily — TVL determines withdrawal liquidity but V3's isolated market design and strong audit history may make it more appropriate for risk-averse capital that prioritises safety over yield`,
            `C) TVL is irrelevant for lending protocols`,
            `D) Compound V3 is worse because it earns less yield`,
          ],
          correct: 1,
          explanation: `TVL affects withdrawal liquidity — at 80% utilisation on an $800M pool, $160M is freely withdrawable. For a $10M institutional deposit, this is ample. The real question for risk-averse capital is: what is the protocol's failure mode? V3's isolated market means a single collateral failure cannot drain the base asset pool. Combined with strong VC backing and 4+ years of track record, Compound V3 is an appropriate choice for institutions prioritising predictability over maximum yield.`,
          hint: `What does TVL actually determine for a depositor? Is $160M of free USDC (80% utilisation on $800M) insufficient for a $10M withdrawal?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-protocol-eval`,
          scenario: `A sovereign wealth fund's DeFi team is allocating $50M USDC to on-chain lending. Their mandate: maximum capital preservation, minimum 3% APY, Ethereum mainnet only, minimum 3 major audits. They are evaluating Compound V3 USDC Comet (3.3% APY, $800M TVL, isolated market design, a16z-backed, 4 audits) vs Aave V3 Ethereum (3.2% APY, $8B TVL, shared pool partially, 10+ audits). Write a two-paragraph recommendation with explicit references to at least three protocol properties from this lesson.`,
          scoringCriteria: [
            `Recommends Aave for TVL-based withdrawal liquidity argument ($8B vs $800M — more important at $50M position size)`,
            `OR recommends Compound V3 for isolated market safety argument with specific reference to shared pool contagion risk`,
            `References the collateral-cannot-be-borrowed distinction as a specific V3 safety property`,
            `Addresses the mandate constraints explicitly: both pass APY (3.3% and 3.2%), both pass audit count, both Ethereum mainnet`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `Compound V2 lists a new DeFi token (DEFI_X) as collateral. DEFI_X has a $15M market cap but its oracle uses a single DEX price feed with $200K liquidity. An analyst flags this as a potential attack vector. Walk through: (A) exactly how an attacker would exploit this to drain the USDC pool, (B) what V2's design allows that V3 would prevent, (C) what governance action could mitigate the risk without delisting.`,
          scoringCriteria: [
            `Correctly describes the attack: manipulate DEFI_X price up on the thin DEX → inflate collateral value on oracle → borrow maximum USDC → oracle resets → collateral worthless → bad debt`,
            `Correctly identifies V3 prevention: collateral-only assets cannot be borrowed, and supply caps prevent over-concentration`,
            `Names a specific governance mitigation: reduce DEFI_X collateral factor (LTV) to 0% to prevent new borrows, or set a borrow cap`,
            `Quantifies the risk: maximum loss = DEFI_X collateral factor × total DEFI_X supplied × USDC liquidity in pool`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.1 (lending basics) and L4.2 (Aave): Build a simple comparison table for a DeFi research report covering Aave V3 and Compound V3 on Ethereum. Columns: TVL, current USDC APY, pool architecture (shared vs isolated), collateral borrowable (yes/no), audit count, and one-line risk verdict. Then write two sentences summarising which protocol a yield-maximiser should choose vs which a capital-preserver should choose, and why.`,
          scoringCriteria: [
            `Table contains accurate entries for all six columns for both protocols`,
            `Correctly marks Compound V3 as isolated market, collateral not borrowable`,
            `Correctly marks Aave as shared pool (partially) with higher TVL`,
            `Recommendation correctly maps: yield-maximiser to Aave (higher TVL = more borrowing demand = higher rates), capital-preserver to Compound V3 (isolated market, simpler risk model)`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.4 — MORPHO
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'morpho',
      title: `4.4 Morpho — Peer-to-Peer Matching on Top of Aave and Compound`,
      subtitle: `Morpho does not compete with Aave. It sits on top of Aave and gives both suppliers and borrowers better rates by matching them directly. That is a different kind of threat.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.2–L4.3 you learned Aave's pool model and Compound's isolated market model. Morpho is a different architecture entirely: it acts as a rate optimiser that matches lenders and borrowers peer-to-peer whenever possible, using Aave or Compound as a fallback. Understanding Morpho reveals why pool-based lending has an inherent spread that can be arbitraged.`,

      hook: `On Aave: you supply USDC at 4.2% and someone borrows USDC at 5.8%. That 1.6% gap funds the protocol and liquidators. Morpho's insight: if the same supplier and borrower can be matched directly — no pool spread — both get better rates. Supplier earns 5.0%. Borrower pays 5.0%. Morpho takes a tiny cut. Aave stays as a backstop. This is either elegant engineering or the end of pool-based lending's margin.`,

      visualPrompt: `Three scenarios side by side. Left: Aave supplier (4.2%) and Aave borrower (5.8%) connected through the pool — 1.6% gap. Centre: Morpho matched peer (5.0% for both) — 0% gap, Morpho fee tiny. Right: Unmatched Morpho position defaults to Aave pool rates. Caption: "Morpho: better rates when matched, Aave rates when not. No worse than Aave, often better."`,

      explanation: `Let me tell you about the lending protocol that optimizes rates.

Aave and Compound use pools — everyone's deposits are pooled, and rates are set algorithmically. This creates an inherent spread: the rate suppliers earn is always less than the rate borrowers pay. The difference goes to the protocol treasury and liquidation incentives.

Morpho's observation: this spread is inefficiency. If a specific supplier and borrower can be matched at a single rate between the supply and borrow rate, both are better off.

**Morpho Optimizer (the original):**

[Morpho Optimizer] — built on top of Aave and Compound. When a borrower requests a loan, Morpho first tries to match them with a supplier at a peer-to-peer rate (the midpoint between Aave's supply and borrow rates). If matched: both get better rates. If no match available: the position falls through to Aave's pool at standard pool rates.

The guarantee: you can never do worse than Aave rates with Morpho Optimizer. You can only do equal (no match) or better (matched).

**Morpho Blue (2023) — the redesign:**

[Morpho Blue] — a new architecture that does not rely on Aave as a backstop. Instead: a minimal base layer lending protocol that allows anyone to create a lending market for any asset pair. Highly permissionless, highly customisable.

Key properties of Morpho Blue:
[Permissionless market creation] — anyone can create a USDC/ETH lending market or a DAI/stETH market. No governance vote required.
[Modular risk management] — "curators" (like re7Labs or Steakhouse Financial) build risk-managed vaults on top of Morpho Blue, selecting which markets to include. MetaMorpho is the vault standard.
[No protocol fee by default] — markets pay no protocol fee. Revenue comes from optional curator fees and governance decisions.

**Morpho's traction:**

Morpho Blue launched late 2023 and grew to $1B+ TVL within months. It attracted institutional allocators precisely because risk management is outsourced to professional curators rather than a single governance DAO.

**The competitive dynamic:**

Morpho Optimizer: directly reduces Aave's margin on every matched position — Aave loses the spread on that loan pair.
Morpho Blue: competes with Aave at the protocol level — builders create markets on Morpho rather than pushing governance to list on Aave.

This makes Morpho one of the most interesting strategic threats in DeFi lending.`,

      examples: [
        {
          contextTag: `[LP comparing Aave and Morpho yields]`,
          context: `Sarah has $200K USDC to lend. She checks both Aave V3 and Morpho Optimizer simultaneously.`,
          scenario: `Aave V3 USDC supply APY: 4.2%. Morpho Optimizer USDC supply APY: 5.1% (because 60% of her position gets peer-matched with borrowers who want to borrow at lower than Aave's borrow rate). The 0.9% difference: $200K × 0.9% = $1,800/year extra. Risk difference: Morpho Optimizer sits on top of Aave — the underlying position is in Aave's pool. Unmatched portions earn Aave pool rate. Sarah's Morpho position is essentially Aave exposure with optional peer-matching upside.`,
          outcome: `Sarah deploys to Morpho Optimizer. She earns 5.1% vs 4.2% on Aave — $1,800 extra annually for identical smart contract risk (both ultimately use Aave). She monitors that Morpho Optimizer's contract itself has been audited and is not a new risk layer.`,
        },
        {
          contextTag: `[Protocol researcher, Morpho Blue market analysis]`,
          context: `A new DeFi team wants to create a lending market for their token (PROTO) paired against USDC on Morpho Blue.`,
          scenario: `On Aave, listing PROTO would require a governance vote, a risk analysis, and weeks of process. On Morpho Blue: the team creates a PROTO/USDC market in one transaction. Parameters: LLTV (liquidation LTV) 80%, oracle (Chainlink PROTO/USD), and interest rate model (adaptive curve). Curator re7Labs evaluates whether to include this market in their MetaMorpho vault. If included: the market gets capital from institutional depositors via the vault. If not included: the market remains permissionlessly accessible but without institutional capital.`,
          outcome: `PROTO/USDC launches on Morpho Blue within 24 hours of the decision. re7Labs includes it in their vault 3 weeks later after their own risk assessment. TVL grows to $5M. The curator model separated "market creation" (permissionless) from "institutional capital access" (curated).`,
        },
        {
          contextTag: `[Competitive analyst, Aave vs Morpho strategic comparison]`,
          context: `Marcus asks for a strategic analysis: does Morpho threaten Aave's long-term business model?`,
          scenario: `Morpho Optimizer: each match reduces Aave's spread income on that position. If 50% of Aave's matched lending pairs migrate to Morpho Optimizer, Aave's revenue from those pairs drops by 50% (the spread disappears). However: Aave still collects fees from the unmatched pool positions and from other markets. Morpho Blue: protocol fee is zero by default. Builders choose Morpho over Aave because of permissionless market creation. Aave governance takes months to list new assets; Morpho Blue takes one transaction. Long-term risk: Morpho Blue captures the long tail of asset pairs that Aave governance will never get around to listing.`,
          outcome: `Marcus concludes: Morpho is a medium-term threat to Aave's yield on matched positions and a long-term threat on new market creation. Aave's moat (liquidity depth, multi-chain, brand) remains intact for large-cap assets. The competition primarily erodes the margin on medium-sized markets.`,
        },
      ],

      keyTakeaway: `Morpho Optimizer sits on Aave/Compound and peer-matches lenders/borrowers at the midpoint rate — suppliers earn more, borrowers pay less, cannot do worse than Aave. Morpho Blue (2023): permissionless market creation for any asset pair, MetaMorpho vaults for risk-managed access, no governance vote required for listings. Combined $1B+ TVL. Strategic threat to Aave: erodes spread income on matched positions and captures long-tail markets that governance-controlled protocols cannot list quickly. For depositors: Morpho Optimizer is strictly >= Aave. For researchers: Morpho Blue is the most important new lending primitive in DeFi.`,

      guidedPractice: [
        {
          question: `Morpho Optimizer guarantees depositors "at least Aave rates." Why is this guarantee credible?`,
          options: [
            `A) Morpho holds AAVE tokens as collateral`,
            `B) Unmatched positions automatically fall through to Aave's pool at standard rates — the worst case is you earn exactly what Aave would pay, never less`,
            `C) Morpho pays the difference from its own treasury`,
            `D) The guarantee only applies to the first $10M deposited`,
          ],
          correct: 1,
          explanation: `Morpho Optimizer's architecture: your USDC sits in Aave's pool by default, earning Aave's pool rate. When Morpho finds a peer match (a borrower wanting your specific USDC), it upgrades your rate to the peer rate. If no match: your position stays in Aave's pool. The "at least Aave rates" guarantee is structural, not a promise — it is enforced by the smart contract routing logic.`,
          hint: `Where does an unmatched Morpho position actually sit? What protocol backs it?`,
        },
        {
          question: `What fundamental inefficiency in pool-based lending does Morpho identify and exploit?`,
          options: [
            `A) Pool-based lending uses too much gas`,
            `B) The spread between supply rate and borrow rate — money that goes to the protocol rather than either supplier or borrower — can be captured by both parties if they are matched directly`,
            `C) Pool-based lending cannot support collateral`,
            `D) Pool-based lending does not support cross-chain liquidity`,
          ],
          correct: 1,
          explanation: `In Aave: supply USDC at 4.2%, someone borrows at 5.8%. The 1.6% gap funds protocol fees and liquidity reserves. Morpho's insight: a willing supplier and borrower matched at 5.0% each capture 0.8% that would have gone to the protocol. Both are strictly better off. The inefficiency is the protocol-mandated spread; Morpho's value is eliminating it when a match exists.`,
          hint: `Think about what the spread between supply APY and borrow APY in a pool represents. Who benefits from that gap?`,
        },
        {
          question: `Morpho Blue allows anyone to create a lending market without a governance vote. What problem does this solve compared to Aave?`,
          options: [
            `A) It removes the need for smart contract audits`,
            `B) New asset pairs can launch in minutes rather than weeks — Aave's governance process takes months, preventing new projects from accessing permissionless lending infrastructure quickly`,
            `C) It removes all liquidation risk`,
            `D) It allows borrowing without collateral`,
          ],
          correct: 1,
          explanation: `Aave governance: propose a new collateral asset → community discussion → temperature check → Snapshot vote → on-chain vote → wait for timelock → deploy. This process takes 4–8 weeks minimum. Morpho Blue: one transaction. This speed difference is enormous for new projects that want lending infrastructure on day one rather than month two. The trade-off: governance provides safety review; permissionless means anyone can create a risky market that unsophisticated users might use.`,
          hint: `How long does Aave governance take to list a new asset? How long does Morpho Blue take?`,
        },
        {
          question: `Connecting to L4.2 (Aave): a MetaMorpho vault curator decides which Morpho Blue markets to include. What role does this serve relative to Aave's governance?`,
          options: [
            `A) Curators replace smart contract audits`,
            `B) Curators perform the risk assessment that Aave governance performs — evaluating which markets are safe for institutional capital — but as a separate professional service rather than a DAO vote`,
            `C) Curators set interest rates for each market`,
            `D) Curators are required to hold MORPHO tokens`,
          ],
          correct: 1,
          explanation: `Morpho Blue separates "market creation" (permissionless, anyone) from "risk management" (curated, professional). Curators like re7Labs or Steakhouse Financial analyse Morpho Blue markets and select safe ones for their MetaMorpho vault. Institutional depositors can access Morpho Blue through a curator's vault without evaluating every market themselves. This mirrors Aave's governance function but outsources it to specialised firms rather than a broad DAO vote.`,
          hint: `Aave governance votes on which assets to list (risk assessment by DAO). MetaMorpho curators choose which markets to include (risk assessment by professionals). Same function, different mechanism.`,
        },
        {
          question: `Morpho Blue grew from $0 to $1B+ TVL within months of launch. Connecting to L6.13 (yield sustainability), is this TVL growth a signal of sustainable adoption or mercenary capital?`,
          options: [
            `A) Always mercenary — fast TVL growth is always a red flag`,
            `B) Requires decomposition: if TVL came from institutional curated vaults (sticky — risk-assessed, long-term mandates) it is more sustainable than if it came from retail emission farming (mercenary — exits when emissions reduce)`,
            `C) Fast TVL growth always indicates strong product-market fit`,
            `D) TVL growth speed does not predict sustainability`,
          ],
          correct: 1,
          explanation: `From L6.13: TVL composition determines durability. Morpho Blue's early growth came largely from MetaMorpho vaults funded by institutional capital (sticky — risk-assessed mandates do not rotate quickly). This is different from a protocol that grew on emission rewards. The signal to check: what percentage of Morpho's TVL is in MetaMorpho curated vaults vs uncurated markets? High curated vault percentage = institutional, sticky. High uncurated percentage = retail, possibly mercenary.`,
          hint: `From L6.13: what distinguishes sticky TVL from mercenary TVL? Apply this to Morpho Blue's specific capital sources.`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `On a given day: Aave V3 Ethereum USDC supply APY 4.1%, borrow APY 5.9%. Morpho Optimizer shows 40% peer-matching efficiency (40% of your deposit will be peer-matched). Calculate: (A) the blended Morpho Optimizer APY for a $300K deposit, (B) annual dollar advantage vs pure Aave, (C) if the matching efficiency drops to 10%, what is the new blended APY? At what matching efficiency does Morpho Optimizer stop being worth the additional smart contract complexity?`,
          scoringCriteria: [
            `Correctly calculates peer-matched rate: midpoint of 4.1% and 5.9% = 5.0%`,
            `Correctly calculates blended APY at 40% matching: (40% × 5.0%) + (60% × 4.1%) = 2.0% + 2.46% = 4.46%`,
            `Correctly calculates annual advantage: ($300K × 0.36%) = $1,080/year`,
            `Correctly states that at near-zero matching efficiency (approaching 0%), Morpho Optimizer converges to Aave rates — worth it at any positive matching efficiency since risk is identical`,
          ],
        },
        {
          type: `judgment-protocol-eval`,
          scenario: `A DeFi researcher is comparing Morpho Blue and Aave V3 for listing a new LST (liquid staking token called "xSTETH"). xSTETH has $200M market cap, tracks ETH closely, Chainlink oracle, two audits. On Aave: minimum 6-week governance process, may be listed in isolation mode. On Morpho Blue: list immediately, curator vaults decide whether to include. Evaluate both paths from the perspective of: (A) the protocol team wanting lending infrastructure quickly, (B) an institutional depositor who needs curated risk management, (C) a retail user.`,
          scoringCriteria: [
            `Correctly identifies Morpho Blue as superior for the protocol team (speed, no governance delay)`,
            `Correctly identifies that institutional depositors benefit equally from both — Aave's governance provides review; Morpho's curators provide equivalent review for MetaMorpho vaults`,
            `Identifies retail risk on Morpho Blue: permissionless markets include unreviewed options — retail users must evaluate curator reputation`,
            `Notes that for xSTETH specifically, eMode compatibility on Aave (from L4.2) may provide better capital efficiency for stETH-correlated assets than a new Morpho Blue market`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Marcus asks for a one-page briefing: "How does Morpho change the lending protocol landscape? Focus on the competitive threat to Aave and what it means for AAVE token holders." Use the spread analysis, Morpho Blue's permissionless design, and the curator model to structure the answer. Conclude with a view on whether AAVE token holders should be concerned.`,
          scoringCriteria: [
            `Explains the spread erosion mechanism: Morpho matches positions that would have contributed spread revenue to Aave`,
            `Explains Morpho Blue's permissionless listing as a competitive threat to Aave's new-market capture`,
            `Notes AAVE token's lack of direct fee capture (as in L4.2 — fee switch not yet active) means the threat is primarily to protocol growth, not immediate token cash flows`,
            `Gives a nuanced conclusion: Morpho is a genuine competitive threat but Aave's TVL depth and multi-chain brand are durable moats for large-cap markets`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.5 — SPARK
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'spark',
      title: `4.5 Spark — MakerDAO's Lending Arm`,
      subtitle: `Spark is a fork of Aave V3 built by the MakerDAO ecosystem. It offers some of DeFi's most competitive DAI borrowing rates. Understanding why requires understanding Maker's unique position.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.4 you studied Morpho's rate optimisation approach. Spark takes a different angle: it leverages MakerDAO's ability to mint DAI at a protocol-determined rate to offer borrowers terms that no other lending protocol can match. This lesson explains how that works and why Spark's competitive position is both powerful and dependent on a single governance decision.`,

      hook: `In 2023 Spark offered 3.49% APY on DAI deposits — when US Treasury rates were 5%+. That was possible because Maker was directly subsidising the rate to drive DAI adoption. Understanding who is subsidising a yield and why is one of the most important skills in DeFi research. Spark makes the subsidy unusually transparent.`,

      visualPrompt: `Flow diagram: MakerDAO sets the DAI Savings Rate (DSR) → Spark borrows DAI from Maker at a preferred rate → Spark lends that DAI to borrowers → borrowers pay slightly above the DSR → the spread funds Spark's risk. Below: comparison table with Aave USDC borrow rate vs Spark DAI borrow rate. Caption: "Spark's competitive rate comes from MakerDAO's printing press — not from market dynamics."`,

      explanation: `Let me tell you about the lending protocol from the MakerDAO ecosystem.

DAI is the leading decentralised stablecoin. MakerDAO is the protocol that governs it. Spark is a lending protocol built by a MakerDAO-affiliated entity (Phoenix Labs) that uses Maker's unique ability to mint DAI as a structural competitive advantage.

**How Spark works:**

[Spark Protocol] — a fork of Aave V3 (identical codebase, modified for Maker integration) that allows users to borrow DAI at rates set by MakerDAO's governance rather than by pure market dynamics.

[Direct Deposit Module (D3M)] — the key mechanism. Maker directly injects DAI liquidity into Spark's lending pool at a rate determined by governance. This means:

1. Spark always has DAI supply to lend regardless of external depositor behaviour.
2. The borrow rate for DAI on Spark is essentially controlled by Maker governance.
3. When Maker wants to increase DAI adoption: set a low D3M rate → Spark offers cheap DAI → borrowers use DAI → DAI supply grows.

**Why this is different from Aave:**

On Aave: USDC borrow rate is determined by utilisation. Aave cannot control the rate — the market does.
On Spark: DAI borrow rate is influenced by Maker governance. When Maker wants cheap DAI: lower the D3M rate. No market utilisation logic needed.

**Spark's products:**

[SparkLend] — the core lending market. Supply ETH/stETH/wBTC/DAI as collateral, borrow DAI or USDC. Aave V3 codebase, Maker-subsidised DAI rates.
[Spark Savings DAI (sDAI)] — deposit DAI and earn the DSR (DAI Savings Rate). Set by Maker governance. In 2023 this was 5%, matching US Treasury rates — funded by Maker's own RWA (real-world asset) yield.

**The dependency risk:**

Spark's competitive advantage depends entirely on MakerDAO governance decisions. If governance raises the D3M rate, Spark's DAI borrow rate rises to match. If Maker has a governance crisis or is subject to regulatory pressure, Spark's competitive position changes immediately. This single-point dependency is Spark's main structural risk.`,

      examples: [
        {
          contextTag: `[Rate comparison, DAI vs USDC borrowing]`,
          context: `Jake wants to borrow $50K stablecoin to deploy in a DeFi strategy. He compares borrowing USDC on Aave vs borrowing DAI on Spark.`,
          scenario: `Aave USDC borrow rate: 6.2% (driven by market utilisation). Spark DAI borrow rate: 4.1% (set by Maker D3M at a subsidised rate). Jake's strategy returns 8% real yield. Net profit: Aave = 8% − 6.2% = 1.8%. Spark = 8% − 4.1% = 3.9%. Spark gives Jake 2.1% more net profit on the same strategy, simply by using DAI instead of USDC as the borrowed stablecoin.`,
          outcome: `Jake borrows DAI from Spark. He accepts the DAI-specific risk (DAI depeg, though minor historically) for a 2.1% improvement in net yield. The borrow rate difference is the direct result of Maker governance's D3M rate decision.`,
        },
        {
          contextTag: `[sDAI yield analysis, RWA backing]`,
          context: `Sarah is evaluating the sDAI 5% yield for a conservative DeFi position. She wants to understand what actually backs this rate.`,
          scenario: `Spark's sDAI offers 5% APY. This rate is funded by MakerDAO's real-world asset (RWA) portfolio: Maker holds ~$1.5B in US Treasury bonds and other RWAs generating ~5% yield. That yield flows back to the DAI system. The DAI Savings Rate (DSR) is set by governance to distribute part of that yield to DAI holders who stake via sDAI. Risk assessment: (1) US Treasury bond credit risk — near zero. (2) Maker smart contract risk — moderate (8 years live, multiple audits). (3) DAI depeg risk — DAI has maintained its $1 peg through multiple market crises including the 2023 USDC depeg (Maker's collateral partially backed by USDC). (4) Governance risk — rate can be reduced by governance vote.`,
          outcome: `Sarah allocates to sDAI. At 5% APY with US Treasury-backed yield, it is effectively DeFi's version of a government money market fund — lower counterparty risk than most alternatives at the same rate.`,
        },
        {
          contextTag: `[Protocol comparison, Aave vs Spark for new listings]`,
          context: `Priya is analysing why some stablecoin protocols choose to integrate with Spark rather than Aave for their primary lending market.`,
          scenario: `A new decentralised stablecoin team chooses Spark as their primary lending market. Reasoning: (1) Spark offers the D3M module which means Maker can directly inject their stablecoin liquidity at preferred rates — bootstrapping liquidity without token emissions. (2) MakerDAO's credibility transfers to the new stablecoin. (3) DAI's deep liquidity pairs well with their stablecoin for swap stability. (4) By integrating with Spark, they are plugging into the Maker ecosystem's RWA yield distribution — potentially getting access to DSR-like yield for their users without running their own treasury.`,
          outcome: `The integration establishes the new stablecoin in the Maker ecosystem. It is less capital-intensive than offering competitive rates through token emissions (Compound's 2020 model) and more sustainable (backed by RWA yield rather than inflation).`,
        },
      ],

      keyTakeaway: `Spark is an Aave V3 fork built by the MakerDAO ecosystem. Its competitive advantage: the Direct Deposit Module (D3M) lets MakerDAO inject DAI liquidity at a governance-set rate — bypassing market utilisation dynamics. DAI borrowing on Spark is often cheaper than USDC on Aave because Maker subsidises the rate to drive DAI adoption. sDAI earns the DAI Savings Rate (DSR), backed by Maker's RWA yield (US Treasuries). Structural risk: the entire competitive position depends on a single governance decision. If Maker raises the D3M rate, Spark's advantage disappears.`,

      guidedPractice: [
        {
          question: `What is the Direct Deposit Module (D3M) and why does it give Spark an unusual ability to set borrow rates?`,
          options: [
            `A) D3M is a bridge for cross-chain liquidity`,
            `B) D3M allows MakerDAO to directly inject DAI into Spark's pool at a governance-set rate — bypassing the utilisation-driven rate model that governs Aave and Compound`,
            `C) D3M is a fee collection mechanism`,
            `D) D3M allows Spark to borrow DAI from Aave`,
          ],
          correct: 1,
          explanation: `On Aave and Compound: borrow rate = f(utilisation). When demand rises, rates rise automatically. Spark's D3M: Maker deposits DAI into Spark's pool at a rate set by governance, not by utilisation. Even if utilisation is high, Maker can add more DAI supply to keep the borrow rate low. This gives Spark something no other lending protocol has: a controlled borrow rate for DAI. The cost: Maker's governance decides, not the market.`,
          hint: `Who sets Spark's DAI borrow rate — market forces or governance?`,
        },
        {
          question: `sDAI earned 5% APY in 2023 while most DeFi stablecoin yields were 1–3%. Where did this yield actually come from?`,
          options: [
            `A) Protocol token emissions — SPARK token distributed to sDAI holders`,
            `B) MakerDAO's RWA portfolio (US Treasury bonds earning ~5% yield) — the DSR distributes real yield from off-chain assets back to DAI holders`,
            `C) Borrower demand on SparkLend`,
            `D) Aave was paying Maker to use its codebase`,
          ],
          correct: 1,
          explanation: `By 2023 Maker had deployed ~$1.5B into real-world assets including US Treasury bonds and corporate debt through a Coinbase partnership. These RWAs earn ~5% annually. Maker governance distributes part of this yield through the DAI Savings Rate (DSR) to sDAI holders. The yield is genuinely "real" — backed by US Treasury credit. This is different from emission yield and different from utilisation-driven yield. It is RWA yield wrapped in DeFi infrastructure.`,
          hint: `sDAI's APY is set by the DAI Savings Rate. What backs the DSR? What does Maker's RWA portfolio hold?`,
        },
        {
          question: `Jake borrows DAI from Spark at 4.1% and uses it in a strategy earning 7%. What is his net yield, and how does it compare to borrowing USDC from Aave at 6.2%?`,
          options: [
            `A) Net yield is identical — DAI and USDC are both $1`,
            `B) Spark/DAI net: 7% − 4.1% = 2.9%. Aave/USDC net: 7% − 6.2% = 0.8%. Spark provides 2.1% more net yield for the identical strategy by virtue of Maker's subsidised borrow rate.`,
            `C) Net yield from Spark: 4.1%. Net yield from Aave: 6.2%`,
            `D) DAI borrowing carries a hidden 2% fee making them equivalent`,
          ],
          correct: 1,
          explanation: `Both DAI and USDC are $1 stablecoins. The strategy generates identical 7% return regardless of which is borrowed. The only variable is the borrow cost. Spark/DAI: 7% − 4.1% = 2.9%. Aave/USDC: 7% − 6.2% = 0.8%. The 2.1% difference is entirely from Maker's D3M subsidising Spark's borrow rate. This is why DeFi researchers track DAI borrow rates: when Maker wants to increase DAI supply, they lower rates, and leveraged borrowers switch to DAI.`,
          hint: `Net yield = strategy return − borrow cost. Both strategies return 7%. The only difference is the borrow rate.`,
        },
        {
          question: `What is Spark's primary structural risk from a yield sustainability perspective?`,
          options: [
            `A) Smart contract risk — Spark has not been audited`,
            `B) Single-point governance dependency — Spark's competitive borrow rate and sDAI yield both depend entirely on MakerDAO governance decisions. One vote can eliminate both advantages.`,
            `C) Spark does not support ETH as collateral`,
            `D) DAI depeg risk eliminates all yield advantage`,
          ],
          correct: 1,
          explanation: `Connecting to L6.13's sustainability framework: Step 5 is "revenue trajectory." For Spark, revenue and competitive positioning are both governed by Maker governance. If governance raises the D3M rate: DAI borrowing becomes less competitive vs Aave USDC. If governance reduces the DSR: sDAI yield drops. Both changes happen in one governance vote. No other major lending protocol has this single-point dependency — Aave's rates are set by utilisation, not governance. Risk category: governance risk (from L1.11's checklist).`,
          hint: `From L1.11: governance risk means protocol rules can change through a vote. Which of Spark's advantages depends on a governance-set number?`,
        },
        {
          question: `Connecting to L4.3 (Compound): why did Compound's COMP liquidity mining in 2020 create a "recursive yield" opportunity that Spark's D3M subsidy does not create?`,
          options: [
            `A) COMP was more valuable than Maker's DAI`,
            `B) COMP rewards were paid for borrowing — creating a cycle where borrowing was profitable, users borrowed, earned COMP, sold it, and borrowed more. Spark's D3M simply reduces the borrow rate; it doesn't pay borrowers to borrow.`,
            `C) Spark requires USDC collateral while Compound did not`,
            `D) There is no difference — both create identical recursive opportunities`,
          ],
          correct: 1,
          explanation: `Compound's COMP in 2020: borrow 100 USDC → pay 5% interest → receive 8% in COMP rewards → net 3% profit just for borrowing. This created a recursive loop: borrow more → earn more COMP → sell COMP → borrow more. Spark's D3M: simply sets DAI borrow rate at 4.1% instead of market-rate 6.2%. Spark does not pay you to borrow — it charges you less. No recursive arbitrage loop. The 2.1% saving is real but it requires an actual productive strategy to deploy the borrowed DAI into. You cannot simply borrow DAI repeatedly to profit.`,
          hint: `In Compound's 2020 model, what happened to the borrower's net position when COMP rewards exceeded borrow costs? Does Spark's model create the same loop?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `Maker governance proposes to lower the D3M rate (cutting SparkLend's DAI borrow rate from 4.8% to 3.5%) and simultaneously raise the DSR (sDAI yield from 4.2% to 5.5%). The proposal passes. Model the impact on: (A) a trader who borrowed $200K DAI at the old rate — do they need to do anything? (B) a sDAI depositor with $500K — what is their new annual income? (C) Aave USDC borrow demand — what happens when Spark's DAI borrow rate drops to 3.5% while Aave USDC stays at 6.1%?`,
          scoringCriteria: [
            `Correctly notes that existing Spark borrows automatically benefit from the rate reduction — no action needed (variable rate)`,
            `Correctly calculates new sDAI income: $500K × 5.5% = $27,500/year vs old $500K × 4.2% = $21,000/year — $6,500/year increase`,
            `Correctly identifies that DAI at 3.5% vs USDC at 6.1% creates a 2.6% incentive to borrow DAI instead of USDC — expect capital rotation from Aave USDC borrows to Spark DAI borrows`,
            `Notes the implication for Aave: lower USDC utilisation → lower USDC supply APY on Aave as borrowers switch to Spark DAI`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `A conservative DeFi researcher is evaluating sDAI for a $1M allocation. They want to score it against the L1.11 risk checklist: smart contract risk, oracle risk, governance risk, liquidation risk, bridge risk, key-person risk. Assign a grade A (minimal) / B (manageable) / C (elevated) / D (significant) to each category for sDAI specifically. Identify the single highest-risk dimension.`,
          scoringCriteria: [
            `Smart contract: B (8 years live, multiple audits, but DAI and Maker are complex systems)`,
            `Oracle risk: A-B (no oracle for the savings rate itself — DSR is set by governance not an oracle)`,
            `Governance risk: C (single governance vote can cut DSR to near zero — this is the primary risk)`,
            `Liquidation risk: A (sDAI is pure supply, no borrowing position, no liquidation exposure)`,
            `Identifies governance risk as highest risk dimension with specific reasoning: DSR can be reduced by one vote`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.2 (Aave) and L4.4 (Morpho): a DeFi research desk is building a "stablecoin lending strategy" for a $3M allocation. Options: Aave V3 USDC Ethereum (3.2%), Morpho Optimizer USDC (4.6% with matching), sDAI/Spark (5.5% DSR). Using the sustainability framework from L6.13 and the governance risk framework from L1.11, rank all three by risk-adjusted expected yield over 12 months and design the allocation.`,
          scoringCriteria: [
            `Correctly ranks sDAI highest yield (5.5%) but with elevated governance risk (DSR can be cut)`,
            `Correctly ranks Morpho Optimizer as moderate yield (4.6%) with the "at least Aave rates" guarantee as structural floor`,
            `Correctly ranks Aave as lowest yield (3.2%) but highest certainty (market-driven, no governance dependency)`,
            `Designs a diversified allocation that does not put more than 50% in sDAI given governance risk, and provides blended yield calculation`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.6 — SOLEND
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'solend',
      title: `4.6 Solend — Solana's Lending Leader and Its Governance Crisis`,
      subtitle: `Solend dominated Solana lending. Then governance voted to forcibly take control of a whale's account. What happened next shaped how DeFi researchers think about governance risk.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.5 you studied Spark's governance risk — how a single governance vote controls rates. Solend's governance crisis in 2022 is the most dramatic illustration of that risk category in DeFi history. This lesson covers Solend's architecture and uses the crisis as a governance risk case study applicable across all protocols.`,

      hook: `June 2022: Solend governance voted to temporarily take over a whale wallet holding 95% of SOL deposits to prevent a catastrophic liquidation cascade. The vote passed. Then the community reversed it 24 hours later after global backlash. No other DeFi event has raised more questions about what "decentralised" governance actually means in practice.`,

      visualPrompt: `A timeline: June 19 2022 — whale position identified, $207M SOL collateral, $108M USDC/USDT debt, liquidation would drop SOL 20%+. June 19 — emergency governance proposal passed in 6 hours. June 20 — second vote reverses it. Arrow pointing to a "Governance Risk" label in red. Caption: "The fastest governance crisis resolution in DeFi history — and the most revealing."`,

      explanation: `Let me tell you about lending on Solana.

While Aave dominates EVM chains, Solana needed its own lending protocol. Solend became the primary choice — and then became the centrepiece of one of DeFi's most important governance debates.

**Solend's architecture:**

[Solend] — an overcollateralised lending protocol on Solana. Same fundamental model as Aave (supply collateral, borrow tokens, liquidate below health factor), optimised for Solana's high-throughput, low-fee environment.

Key architectural features:
[Isolated pools] — Solend separates high-risk assets into isolated pools that cannot contaminate the main pool. Similar in concept to Aave's isolation mode.
[Obligation accounts] — Solana's account model means each user position is a separate on-chain "obligation" account, enabling efficient batch liquidations.
[Flash loan support] — available for arbitrage and liquidation bots.

**Where Solend differs from Aave:**

Multi-pool structure: Solend has a main pool (blue-chip assets) and dozens of isolated pools for smaller tokens. This granularity lets Solend list long-tail Solana ecosystem tokens in isolation without contaminating the main pool.

Oracle dependence: Solend uses Pyth Network oracles (Solana's dominant oracle) rather than Chainlink. This creates a single oracle provider dependency.

**The June 2022 governance crisis:**

A whale held $207M in SOL as collateral on Solend with $108M in USDC/USDT debt. SOL was dropping due to the broader crypto crash.

The problem: if SOL fell enough to trigger liquidation, Solend's liquidation bots would need to sell $21M+ of SOL on-chain. Solana DEX liquidity at the time could not absorb this. Result: potential 20%+ SOL price crash, cascade of further liquidations, potential protocol insolvency.

Solend governance response: an emergency proposal to temporarily take over the whale's account — to execute the liquidation gradually through OTC rather than on-chain DEX — passed with 97% yes vote in 6 hours. Only ~1.5M SLND tokens voted total.

Global reaction: extreme criticism. DeFi's core principle is permissionlessness — no protocol should be able to take over user funds. The proposal was reversed 24 hours later.

Resolution: Solend set borrow limits per user (whale could not maintain this size position going forward) and negotiated with the whale to reduce exposure.

**What this reveals about governance risk:**

Six hours. 1.5M tokens. Protocol could override a user account. The vote was technically legal (smart contract governance) but ethically disqualifying for many. Governance with concentrated token holdings can act faster and more drastically than any DAO "decentralisation" suggests.`,

      examples: [
        {
          contextTag: `[Risk researcher, governance risk analysis]`,
          context: `Maya is scoring Solend against the L1.11 governance risk framework after studying the 2022 crisis.`,
          scenario: `Governance red flags: (1) Emergency proposal passed in 6 hours — time lock circumvented. (2) Turnout: 1.5M / ~100M eligible tokens = 1.5% participation. (3) Vote to override user funds — crossed a clear ethical line. (4) Concentrated voting power: a small number of whales can pass proposals. Against: (1) Community reversed the decision within 24 hours — self-correction worked. (2) Protocol then added borrow caps (structural improvement). (3) Post-crisis governance process was strengthened. Net assessment: governance risk grade C (elevated) — fast-moving governance with concentrated power, but demonstrated ability to self-correct.`,
          outcome: `Maya's report classifies Solend as governance risk C, notes the self-correction as a partial positive, and recommends lower allocation than Aave for risk-averse mandates. She flags that any new Solend governance crisis would be harder to recover from reputationally.`,
        },
        {
          contextTag: `[Architectural comparison, Solend vs Aave V3]`,
          context: `Priya is building a comparison of Solana vs Ethereum lending for a client interested in both ecosystems.`,
          scenario: `Solend main pool: SOL, mSOL, stSOL, USDC, USDT, BTC. Isolated pools: 40+ Solana ecosystem tokens in their own pools. Supply APY on USDC: 6-8% (higher utilisation from Solana's active trading culture). Aave comparison: single deployment per chain, isolation mode for risky assets (not a separate pool). Solend advantage: finer risk granularity — isolated pools completely separate risk from main pool. Solend disadvantage: more complex liquidity management, each pool has its own utilisation rate, smaller pools have withdrawal liquidity risk at high utilisation.`,
          outcome: `Priya documents: Solend's isolated pool architecture is more aggressive than Aave's isolation mode — fully separate liquidity pools rather than shared pool with a debt ceiling. Better risk isolation but lower liquidity efficiency.`,
        },
        {
          contextTag: `[Borrower, Solana lending rate comparison]`,
          context: `Jake wants to borrow USDC on Solana. He compares Solend and Kamino (Solana's other major lending protocol).`,
          scenario: `Solend USDC borrow: 7.2% APY. Kamino USDC borrow: 6.8% APY. Kamino launched after Solend with a cleaner governance model (no historical crisis) and more modern codebase. Solend's higher borrow rate reflects higher utilisation — Solend has more deposited capital than Kamino, attracting more borrowers. Jake's consideration: Kamino's lower rate saves $2,000/year on a $500K borrow. Kamino governance risk: newer protocol, concentrated early governance token distribution. Solend governance risk: demonstrated willingness to act aggressively but also demonstrated correction.`,
          outcome: `Jake chooses Kamino for the lower borrow rate. His reasoning: lower rate + newer codebase + no governance crisis history outweighs Solend's liquidity depth advantage at his $500K borrow size.`,
        },
      ],

      keyTakeaway: `Solend is Solana's largest lending protocol with a multi-pool architecture (main pool + 40+ isolated pools) and Pyth oracle integration. The June 2022 governance crisis — a vote to take over a whale's account passed in 6 hours, then reversed in 24 — is DeFi's most important governance risk case study. Lessons: low-turnout governance with concentrated token power can move very fast, emergency proposals can bypass timelocks, and protocol self-correction is possible but not guaranteed. Score Solend governance risk C (elevated). Always check a protocol's governance history, timelock duration, and token concentration before allocating.`,

      guidedPractice: [
        {
          question: `What was the core ethical violation in Solend's June 2022 governance proposal?`,
          options: [
            `A) The proposal charged too high a liquidation fee`,
            `B) Governance voted to temporarily take control of a specific user's wallet — overriding the permissionless property that is DeFi's foundational guarantee to users`,
            `C) The proposal was written in poor English`,
            `D) The liquidation would have made Solend more money than the user`,
          ],
          correct: 1,
          explanation: `DeFi's core promise: "your keys, your coins." No protocol, no DAO, no governance vote should be able to unilaterally control a user's position. The Solend proposal — however well-intentioned — said: "we can override user wallets if governance votes to." This is a categorical violation. Even if the liquidation would have been executed at a better price OTC, the principle matters: if governance can override one user under emergency conditions, it can override any user under any sufficiently alarming conditions.`,
          hint: `What is DeFi's most fundamental promise to users compared to traditional finance? Which protocol property does "governance takeover of a user wallet" violate?`,
        },
        {
          question: `The Solend governance vote passed with 1.5% token participation. What does this reveal about governance risk in DeFi protocols?`,
          options: [
            `A) Low participation means governance decisions are more legitimate`,
            `B) Low participation combined with concentrated token holdings means a small number of large token holders can pass almost any proposal — "decentralised" governance is a spectrum, not a binary`,
            `C) 1.5% is normal for DeFi governance`,
            `D) Low participation reduces governance risk`,
          ],
          correct: 1,
          explanation: `If 1.5% of tokens can pass an emergency proposal in 6 hours, the governance is effectively oligarchic during emergencies. Compare this to Compound's governance which requires at least 4% of COMP to reach quorum. Low participation + concentrated token distribution = governance risk. The L1.11 governance checklist should include: what is typical governance turnout? Who are the top 5 token holders by percentage? Can one whale pass a proposal alone?`,
          hint: `If only 1.5M of 100M eligible tokens voted, what does this suggest about who holds decision power in practice?`,
        },
        {
          question: `After the governance crisis, Solend added borrow caps per user. Connecting to L4.2 (Aave): how does this fix compare to Aave V3's supply and borrow cap mechanism?`,
          options: [
            `A) Aave V3 caps are stronger because they are set by a more legitimate DAO`,
            `B) Both use caps to prevent single-entity over-concentration, but Aave V3's caps are preset by governance before crisis — Solend's were added reactively after one materialised`,
            `C) Borrow caps are unique to Solend — Aave has no equivalent`,
            `D) Aave caps are per-asset; Solend caps are per-user — they solve different problems`,
          ],
          correct: 3,
          explanation: `Aave V3 supply and borrow caps: per-asset — limits total protocol-wide exposure to a given asset. Prevents over-concentration of any single risky asset. Solend's post-crisis borrow caps: per-user — limits how much any single wallet can borrow, preventing a single whale from creating systemic liquidation risk. Both solve concentration problems but at different levels. Aave's approach is defensive (limits bad assets). Solend's is operational (limits individual positions). Both are important for protocol risk management.`,
          hint: `What unit does Aave's cap apply to — an asset or a user? What unit does Solend's new cap apply to?`,
        },
        {
          question: `Solend uses Pyth Network oracles rather than Chainlink. What additional risk does this create?`,
          options: [
            `A) Pyth is less accurate than Chainlink`,
            `B) Single oracle provider dependency — if Pyth experiences a failure or manipulation on Solana, all Solend markets using Pyth are simultaneously affected with no fallback`,
            `C) Pyth only supports major assets, not Solana ecosystem tokens`,
            `D) Chainlink is free while Pyth charges fees`,
          ],
          correct: 1,
          explanation: `Aave on Ethereum uses Chainlink as its primary oracle with fallback mechanisms. Solend uses Pyth — which is the dominant Solana oracle but a single provider. If Pyth experiences a failure (wrong price feed, stale data, or manipulation), every Solend market simultaneously receives incorrect prices. This is the oracle concentration risk from L1.11's checklist. Single oracle provider = single point of failure for all price-dependent liquidations.`,
          hint: `From L1.11: oracle risk. What happens if the single oracle provider fails or is manipulated across all markets simultaneously?`,
        },
        {
          question: `Connecting to Lab 2 (L2.7, Solana): Solend suffered from the broader Solana network outages that occurred in 2021–2022. What specific lending protocol risk do network outages create?`,
          options: [
            `A) No risk — smart contracts continue operating during outages`,
            `B) Liquidation risk during outages: if the network is down, liquidation bots cannot execute. Health factors can breach 1.0 while the network is unavailable, creating bad debt when the network returns.`,
            `C) Outages increase borrow rates automatically`,
            `D) Users lose access to their deposited funds permanently`,
          ],
          correct: 1,
          explanation: `Solana experienced multiple outages in 2021–2022 lasting hours. During an outage: no transactions execute, including liquidations. If ETH drops 15% during a 6-hour outage and a borrower's health factor falls below 1.0, liquidators cannot act until the network recovers. When it does: the liquidation executes at the recovered price (possibly lower), creating bad debt. This is a lending-specific Solana risk that Ethereum L2s and mainnet largely avoid due to Ethereum's much higher availability.`,
          hint: `What is the liquidation process? Who executes it? Can they execute during a network outage?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `Apply the full L1.11 six-risk checklist to Solend (post-crisis, current state): smart contract risk, oracle risk, governance risk, liquidation risk, bridge risk, key-person risk. Assign A/B/C/D to each. Then compare to Aave V3 Ethereum on the same checklist. Which protocol is more appropriate for: (A) a $50K retail user wanting Solana exposure, (B) a $5M institutional allocation to Solana lending?`,
          scoringCriteria: [
            `Correctly identifies Solend governance risk as C (elevated) citing the 2022 crisis and low turnout governance`,
            `Correctly identifies Solend oracle risk as B-C (Pyth-only dependency) vs Aave's A (Chainlink with fallbacks)`,
            `Correctly identifies Solend liquidation risk as elevated (Solana outage risk) vs Aave`,
            `Recommends Kamino or careful Solend sizing for the $5M institutional allocation, noting that governance risk C disqualifies Solend from many institutional mandates that require A or B governance scores`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Write a 150-word "governance risk case study" brief on the June 2022 Solend event. Target audience: a new DeFi researcher who has not heard of the event. Cover: what happened, why it was significant, what changed afterwards, and the three governance risk lessons that apply to evaluating ANY DeFi protocol (not just Solend).`,
          scoringCriteria: [
            `Accurately describes the event: whale position, liquidation cascade risk, governance vote to take over wallet, reversal`,
            `Identifies the significance: first DeFi governance vote to override user funds — a categorical violation of DeFi's permissionless promise`,
            `States the post-crisis structural change: borrow caps per user added`,
            `Names three transferable lessons: (1) check governance timelock duration, (2) check token concentration/voting turnout, (3) check whether emergency powers allow fund control`,
          ],
        },
        {
          type: `judgment-protocol-eval`,
          scenario: `A Solana-focused fund wants to maximise USDC lending yield. They are evaluating Solend (7.2% APY, $800M TVL, governance risk C) vs Kamino (6.8% APY, $400M TVL, newer protocol, governance risk B+). The fund's mandate: maximum 15% governance risk tolerance, meaning protocols graded C or above on governance are limited to 20% of any allocation. Design the USDC lending allocation for a $2M Solana lending position.`,
          scoringCriteria: [
            `Correctly interprets the mandate: Solend (grade C) capped at 20% of $2M = $400K maximum`,
            `Allocates $400K to Solend (maximum permitted by mandate)`,
            `Allocates remaining $1.6M to Kamino (grade B+, passes mandate)`,
            `Calculates blended APY: ($400K × 7.2% + $1.6M × 6.8%) / $2M = ($28,800 + $108,800) / $2M = 6.88%`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 4.7 — FRAXLEND
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'fraxlend',
      title: `4.7 Fraxlend — Customisable Isolated Lending Pairs`,
      subtitle: `Fraxlend lets anyone create a lending pair for any two assets with any parameters. It is DeFi lending's most configurable primitive — and it is deeply integrated into the Frax ecosystem.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L4.6 you studied Solend's multi-pool architecture and governance risk. Fraxlend takes the isolation concept further: every market is an independent bilateral pair (not a pool with multiple assets), and the interest rate model itself can be customised per market. This lesson covers Fraxlend's unique mechanics and its role within the broader Frax ecosystem.`,

      hook: `Most lending protocols use the same interest rate curve for every market. Fraxlend uses an adaptive rate model that can be set differently for each market — rates can move faster or slower depending on how volatile the asset is. For correlated asset pairs (FRAX/DAI), rates barely move. For volatile pairs (exotic tokens), rates spike aggressively to prevent excessive borrowing. One protocol, unlimited configurations.`,

      visualPrompt: `A matrix of lending pairs: each cell shows a two-asset pair (FRAX/USDC, ETH/FRAX, CRV/FRAX, exotic_token/FRAX). Each cell has its own rate curve icon — some flat (stable pairs), some steep (volatile pairs). Caption: "Every pair in Fraxlend is its own isolated market with its own rate model. No contamination. No compromises."`,

      explanation: `Let me tell you about the lending protocol that lets you be the bank.

Most lending protocols have a fixed interest rate model applied to all markets. Fraxlend is different: every lending pair is an independent isolated market with configurable parameters. The lender sets the terms, the borrower accepts or goes elsewhere.

**Fraxlend's core architecture:**

[Fraxlend] — a protocol where each lending market is a bilateral pair: one collateral asset, one debt asset (almost always FRAX). Markets are fully isolated — a problem in one pair cannot spread to others.

[Pair creation] — anyone can deploy a new Fraxlend pair. Define: the collateral asset, the debt asset (FRAX), the oracle, the liquidation LTV, and the interest rate model.

[Whitelist vs permissionless] — some pairs are "whitelisted" by Frax governance (official, integrated into the Frax ecosystem). Others are permissionlessly deployed by external teams.

**The adaptive interest rate model — Fraxlend's key innovation:**

Traditional lending: utilisation drives rate linearly. Fraxlend: the rate curve itself adapts over time.

[Time-weighted variable rate] — if utilisation stays above the target (e.g. 80%) for multiple blocks, the rate increases faster than a standard model. If utilisation drops below target, the rate decreases more aggressively. The rate "learns" from sustained high or low utilisation.

Purpose: for stable asset pairs (FRAX/USDC), utilisation fluctuates little and rate moves slowly. For volatile collateral pairs (some memecoin/FRAX), utilisation is unpredictable and rate needs to move aggressively to disincentivise excessive borrowing quickly.

**Fraxlend's integration with the Frax ecosystem:**

The primary debt asset in Fraxlend is FRAX (Frax Finance's stablecoin). This means Fraxlend serves as both a lending protocol AND a distribution mechanism for FRAX.

[Curve integration] — Fraxlend CRV/FRAX pair allows CRV holders to borrow FRAX against their CRV. This is strategically important: CRV holders can leverage their CRV (to participate in Curve Wars) without selling it. Frax benefits because it creates FRAX borrowing demand.

[crvUSD competitor] — Curve launched crvUSD (their own stablecoin with built-in lending via LLAMMA). Fraxlend's CRV/FRAX market directly competes with crvUSD for CRV-backed borrowing.

**Fraxlend vs Aave for isolated markets:**

Aave isolation mode: debt ceiling per isolated asset, only stablecoins borrowable.
Fraxlend: fully independent pair, any rate model, FRAX as debt asset, no shared pool risk whatsoever. More flexible but requires more research per pair — there is no shared safety guarantee across pairs.`,

      examples: [
        {
          contextTag: `[Protocol researcher, adaptive rate model analysis]`,
          context: `Maya is comparing how Fraxlend's adaptive rate model handles a FRAX/USDC pair vs an exotic memecoin/FRAX pair.`,
          scenario: `FRAX/USDC pair: target utilisation 85%. Utilisation rarely deviates from 80-90%. Rate adjustment speed: slow (rate moves 0.1% per hour away from target). Result: stable, predictable rates for stablecoin borrowers. Exotic Token/FRAX pair: same target utilisation 85%. During a price spike, utilisation jumps to 98% for 48 hours. Rate adjustment speed: fast (rate moves 2% per hour above target). After 48 hours: borrow rate has increased 96 percentage points — virtually no new borrowing is rational. This aggressive rate prevents the protocol from being drained by borrowers timing a rapid price decline. Rate model outcome: same protocol, dramatically different risk management for different asset volatility profiles.`,
          outcome: `Maya documents: Fraxlend's adaptive model is its most innovative feature — it allows one protocol to simultaneously serve predictable stablecoins and unpredictable volatile assets without compromising either.`,
        },
        {
          contextTag: `[CRV holder, leverage strategy via Fraxlend]`,
          context: `Jake holds 500,000 CRV tokens ($400K value). He wants to participate in the Curve Wars without selling CRV.`,
          scenario: `Fraxlend CRV/FRAX pair: LTV 75%. Jake deposits 500K CRV → borrows $300K FRAX → deploys $300K FRAX into Curve pools to earn CRV emissions → compounds. This is the "CRV recursive strategy": use CRV as collateral to borrow FRAX to earn more CRV. Risk: if CRV drops 30% (to $0.56), his collateral value falls from $400K to $280K, with $300K debt. LTV = $300K ÷ $280K = 107% — above liquidation threshold. Jake needs to monitor CRV price closely and unwind if it approaches his liquidation price.`,
          outcome: `Jake executes the strategy but sets a CRV price alert at $0.72 (giving him buffer to unwind). He earns 14% APY on his FRAX deployment. His CRV exposure is amplified — he earns both the appreciation (or faces the depreciation) of his CRV position plus the FRAX yield.`,
        },
        {
          contextTag: `[Market creator, permissionless pair deployment]`,
          context: `A DeFi team wants to create a lending market for their governance token (GOVX) backed by FRAX on Fraxlend.`,
          scenario: `The team deploys a GOVX/FRAX pair on Fraxlend. Parameters: LTV 60% (conservative for a new token), oracle Chainlink GOVX/USD (just listed on Chainlink), interest rate model: aggressive (fast-moving rates for a volatile new token), debt cap: $500K FRAX maximum. Result: GOVX holders can borrow FRAX against their tokens without selling them. The protocol generates FRAX borrow demand. The debt cap prevents catastrophic loss if GOVX oracle is manipulated. Frax governance has no vote in this — it is fully permissionless.`,
          outcome: `The market launches in one day. 40 GOVX holders borrow $180K FRAX total within the first month. The $500K debt cap provides a hard ceiling on maximum loss from oracle manipulation.`,
        },
      ],

      keyTakeaway: `Fraxlend is a permissionless isolated pair lending protocol where each market has one collateral asset and FRAX as the debt asset, with its own configurable rate model. The adaptive time-weighted variable rate is Fraxlend's key innovation — rates adjust faster for volatile assets, slower for stable pairs. Key markets: CRV/FRAX (leveraged Curve Wars participation), ETH/FRAX, and dozens of permissionlessly created pairs. Fully isolated: no cross-pair contagion. Integration with the Frax ecosystem means Fraxlend is both a lending protocol and a FRAX distribution mechanism. Compare to Aave isolation mode: Fraxlend is more flexible but offers no shared safety guarantees across pairs.`,

      guidedPractice: [
        {
          question: `How does Fraxlend's adaptive interest rate differ from Aave's standard utilisation-based model?`,
          options: [
            `A) Fraxlend charges flat rates regardless of utilisation`,
            `B) Fraxlend's rate curve adjusts its steepness over time based on how long utilisation stays above or below target — volatile pairs get aggressively fast rate movement, stable pairs move slowly`,
            `C) Aave uses an adaptive model; Fraxlend uses a fixed model`,
            `D) Fraxlend does not use interest rates — it uses fees`,
          ],
          correct: 1,
          explanation: `Aave's kink model: rate rises at a fixed mathematical rate above the kink. Fraxlend's adaptive model: the rate curve itself evolves. If utilisation stays above target for many blocks, the rate accelerates faster than a standard kink would. This allows stable pairs (FRAX/USDC) to have slow, predictable rate movements while volatile pairs (exotic/FRAX) can have aggressive rate spikes that discourage overborrowing quickly. The adaptivity is the feature — one codebase, unlimited volatility profiles.`,
          hint: `What does "adaptive" mean in the context of the rate model? Does the slope of the curve change over time?`,
        },
        {
          question: `Why is the CRV/FRAX pair on Fraxlend strategically important to both CRV holders and Frax Finance?`,
          options: [
            `A) It is the only way to buy CRV in DeFi`,
            `B) CRV holders can borrow FRAX without selling CRV (preserving their Curve governance power), while Frax benefits from the borrowing demand that increases FRAX circulation and use`,
            `C) The pair earns Fraxlend governance tokens for depositors`,
            `D) CRV can only be used as collateral on Fraxlend, not on other protocols`,
          ],
          correct: 1,
          explanation: `Curve Wars context (from L3.5): holding veCRV means gauge voting power and CRV emission control. A holder who sells CRV loses this power. Fraxlend CRV/FRAX lets them borrow FRAX using CRV as collateral — keeping the CRV locked and productive while accessing liquidity. For Frax: every FRAX borrowed means more FRAX in circulation, increasing the stablecoin's market cap and legitimacy. The market serves both sides simultaneously.`,
          hint: `What do CRV holders value most — liquidity or their veCRV governance power? Does borrowing FRAX help them keep the power?`,
        },
        {
          question: `A borrower uses an exotic memecoin as collateral in a Fraxlend pair. The rate jumps from 12% to 108% APY in 48 hours. Should the borrower be alarmed? What does this signal?`,
          options: [
            `A) The rate jump is a bug — Fraxlend should be avoided`,
            `B) The rate jump signals that utilisation has been above target for 48+ hours — many borrowers are using this pair and the adaptive model is aggressively disincentivising more borrowing to protect the protocol from over-concentration risk`,
            `C) 108% APY means the borrower is earning 108% on their collateral`,
            `D) The rate change only affects new borrows, not existing positions`,
          ],
          correct: 1,
          explanation: `The adaptive rate model deliberately creates rates this extreme to protect the protocol. When utilisation is high for extended periods: (1) new borrowers are strongly disincentivised at 108% borrow APY, (2) existing borrowers with variable rates now face 108% cost — they should either repay or move positions, (3) the protocol protects itself from over-concentration. The existing borrower in this scenario now faces a 108% borrow rate — this is a strong signal to repay debt and exit if their strategy does not yield more than 108%.`,
          hint: `Why would the rate jump signal something about risk? Who benefits from a very high borrow rate in Fraxlend's model?`,
        },
        {
          question: `Fraxlend allows permissionless pair creation. Connecting to L4.4 (Morpho Blue's permissionless markets): what shared risk does this create for retail users across both protocols?`,
          options: [
            `A) Permissionless markets are safer because more people can audit them`,
            `B) Retail users may interact with low-quality permissionless markets (bad oracle, manipulable collateral, no audit) — both Fraxlend and Morpho Blue require users to evaluate market quality themselves, or use curated access points`,
            `C) Permissionless markets have lower interest rates`,
            `D) There is no difference — permissionless and governance-approved markets are equally safe`,
          ],
          correct: 1,
          explanation: `Morpho Blue: permissionless markets require MetaMorpho curator vetting for institutional access. Fraxlend: permissionless pairs require users to evaluate the oracle, debt cap, and LTV parameters themselves. A retail user clicking into a permissionlessly-created pair with a manipulable DEX oracle and no debt cap could lose their collateral to a well-timed oracle manipulation. The protection on both protocols: curated vaults/whitelists provide pre-screened markets. Retail users should only interact with whitelisted or curator-approved pairs.`,
          hint: `From L4.4: what risk does permissionless market creation create for users who do not evaluate each market? Does Fraxlend have the same structure?`,
        },
        {
          question: `Fraxlend's debt asset is almost always FRAX. How does this create a fundamental difference from Aave, where you can borrow any listed asset?`,
          options: [
            `A) It means Fraxlend can only be used by FRAX holders`,
            `B) Fraxlend is a FRAX distribution mechanism as much as a lending protocol — it expands FRAX's circulating supply by creating new borrowing demand, while Aave borrows already-existing assets from depositors`,
            `C) FRAX is safer than USDC so Fraxlend is inherently safer`,
            `D) It means interest rates are always lower on Fraxlend`,
          ],
          correct: 1,
          explanation: `On Aave: you borrow existing USDC that other users deposited. The USDC supply does not change. On Fraxlend: you borrow FRAX, which is minted by the Frax protocol when you borrow and burned when you repay. The act of borrowing on Fraxlend literally creates new FRAX. This is why Fraxlend is strategically central to Frax Finance: every loan grows FRAX supply. Aave is a pure intermediary (no new money created). Fraxlend is a money creation mechanism that happens to charge interest.`,
          hint: `Where does the USDC come from when you borrow on Aave? Where does the FRAX come from when you borrow on Fraxlend?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-protocol-eval`,
          scenario: `A DeFi fund is building a "Curve Wars leverage strategy": deposit CRV, borrow stablecoin, farm CRV emissions, compound. They are evaluating Fraxlend CRV/FRAX vs Aave V3 ETH eMode (using CRV as collateral in normal mode, borrowing USDC). Fraxlend: LTV 75%, adaptive rate currently 5.2%, no multi-asset pool risk. Aave: LTV 57% for CRV (non-eMode), borrow APY USDC 5.9%, isolation mode. Assume CRV price $0.80, 500K CRV to deposit. For each platform: maximum USDC/FRAX borrowable, liquidation price for CRV, and which is better for this strategy.`,
          scoringCriteria: [
            `Correctly calculates Fraxlend maximum borrow: 500K × $0.80 × 75% = $300K FRAX`,
            `Correctly calculates Aave maximum borrow: 500K × $0.80 × 57% = $228K USDC`,
            `Correctly calculates Fraxlend liquidation price: $300K debt / (500K × liquidation LTV). Requires knowing Fraxlend liquidation LTV — approximately $0.80 × (1-buffer).`,
            `Recommends Fraxlend for higher borrow capacity (75% vs 57% LTV) and lower borrow rate (5.2% vs 5.9%), noting the adaptive rate risk if CRV sentiment reverses`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `A new Fraxlend pair launches: NEWTOKEN/FRAX. Parameters: LTV 80%, oracle = single DEX TWAP with $500K liquidity, debt cap $2M FRAX, adaptive rate model (fast). Evaluate all risk dimensions: oracle risk, LTV appropriateness, debt cap adequacy, and rate model fit. What is the maximum position size you would be comfortable with as a FRAX lender, and what is the maximum you would borrow as a NEWTOKEN holder?`,
          scoringCriteria: [
            `Flags oracle risk as high: single DEX TWAP with $500K liquidity is manipulable (flash loan attack could temporarily inflate price)`,
            `Flags 80% LTV as aggressive for a new token with thin liquidity — liquidations may not clear cleanly`,
            `Notes debt cap $2M FRAX partially mitigates oracle risk — maximum loss capped at $2M`,
            `Recommends FRAX lender: only participate if oracle is upgraded to Chainlink. Recommends borrower: conservative LTV (50% max actual utilisation) given oracle risk`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Build a comparison table for the five lending protocols covered in Lab 5 so far (Aave V3, Compound V3, Morpho Blue, Spark, Fraxlend). Columns: pool architecture, primary debt asset, borrow rate mechanism, permissionless listing (yes/no), governance risk grade. Then write one sentence identifying which protocol is best suited for: (A) an institution wanting maximum safety and depth, (B) a DeFi power user wanting the best USDC rate, (C) a small DeFi project wanting to launch lending in 24 hours.`,
          scoringCriteria: [
            `Table accurately reflects all five protocols across all five columns`,
            `Correctly identifies Aave V3 for institution: depth, audits, multi-chain`,
            `Correctly identifies Morpho Optimizer or Morpho Blue for best USDC rate: peer matching or curator-managed optimization`,
            `Correctly identifies Morpho Blue or Fraxlend for 24-hour launch: permissionless pair/market creation`,
          ],
        },
      ],
    },
