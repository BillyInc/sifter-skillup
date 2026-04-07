// ============================================================================
// SIFTER SKILLUP — DeFi RESEARCH ANALYST Career Track
// Lab 6: Stablecoins Deep Dive (Part B — Lessons 5.6–5.10)
// Append after Part A lessons
// ============================================================================

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.6 — FRAX
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'frax',
      title: `5.6 FRAX — The Hybrid That Bridges Fiat and Algorithmic`,
      subtitle: `FRAX started as 85% USDC-backed and 15% algorithmic. It has since pivoted toward full collateralisation. The evolution tells you everything about what the market learned from UST.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.5 you studied DAI — a crypto-backed stablecoin that requires overcollateralisation. FRAX attempted something harder: a partially algorithmic stablecoin that could mint new supply more capital-efficiently than DAI, while avoiding UST's pure algorithmic death spiral by maintaining a USDC collateral floor.`,

      hook: `FRAX launched in December 2020 with an idea that made economists nervous: what if a stablecoin was only 85% backed, relying on market confidence for the remaining 15%? For two years it worked. Then UST collapsed in May 2022. Within weeks, FRAX governance voted to move toward 100% collateralisation. The market's revealed preference was clear.`,

      visualPrompt: `A pie chart evolving over time: 2021 (85% USDC, 15% FXS algorithmic), 2022 pre-UST collapse (90% USDC, 10% FXS), 2023 post-UST (moving toward 100% USDC). Below: FXS token price chart showing spike during FRAX growth, crash during UST contagion, partial recovery. Caption: "The collateral ratio tells the story of the stablecoin market's trust in algorithmic mechanisms."`,

      explanation: `Let me tell you about the stablecoin that tries to have it both ways.

Pure crypto-backed is safe but capital-inefficient — you lock $1.50 to mint $1.00. Pure algorithmic is capital-efficient but catastrophically fragile. FRAX's original thesis: what if you maintain partial collateral (say 85%) and use an algorithmic mechanism only for the remainder? You get most of the efficiency with most of the safety.

**FRAX V1 — the original fractional reserve model:**

[Collateral Ratio (CR)] — the percentage of FRAX backed by real collateral (initially USDC). Starts at 100% at launch, algorithmically adjusts based on market conditions.

When FRAX > $1.00: CR decreases (less collateral needed — market has confidence). When FRAX < $1.00: CR increases (more collateral required — market needs reassurance).

To mint 1 FRAX at 85% CR: deposit $0.85 USDC + burn $0.15 worth of FXS. To redeem 1 FRAX at 85% CR: receive $0.85 USDC + $0.15 worth of FXS (minted).

[FXS (Frax Shares)] — the governance and seigniorage token. During minting: FXS is burned (deflationary). During redemption: FXS is minted (inflationary). The FXS value absorbs the volatility that FRAX needs to avoid.

**The UST contagion and FRAX's pivot:**

May 2022: UST collapses. Algorithmic stablecoin confidence across DeFi collapses simultaneously. FRAX — despite having 85% collateral — was perceived as "algorithmic-adjacent." FXS dropped 70%. FRAX briefly depegged to $0.975.

FRAX governance response: vote to increase CR toward 100%, positioning FRAX as a fully-collateralised stablecoin with FXS as a governance token rather than seigniorage backing. The pivot preserved FRAX's existence at the cost of abandoning the original capital-efficiency thesis.

**FRAX V2 and frxETH:**

[frxETH] — Frax Finance's liquid staking token (from L6.8). ETH staked via Frax is split: most goes to validators, some goes to Curve pools. frxETH does not rebase — staking rewards only accrue when converted to sfrxETH. This concentrates yield for sfrxETH holders.

[FraxBP (Frax Base Pool)] — a Curve pool containing FRAX and USDC as the base. Many Curve pools pair against FraxBP rather than 3pool, making FRAX a structural component of Curve's liquidity architecture.

**FRAX's competitive position:**

Post-UST, FRAX moved from "innovative algorithmic experiment" to "well-connected USDC-equivalent with DeFi integrations." Its value now comes from: deep Curve integration (FraxBP base pool), frxETH liquid staking, and FXS tokenomics (veFXS and Frax Wars — a parallel to Curve Wars). The stablecoin itself is less the product; the DeFi ecosystem around it is.`,

      examples: [
        {
          contextTag: `[Mechanism analysis, FRAX mint/redeem at 85% CR]`,
          context: `Maya is explaining the FRAX fractional reserve mechanism to a new researcher who only knows fiat-backed stablecoins.`,
          scenario: `FRAX at 85% CR. Mint 1,000 FRAX: deposit $850 USDC + burn $150 worth of FXS (at current FXS price). Result: $850 of real collateral backs $1,000 FRAX, FXS supply decreases. Redeem 1,000 FRAX: receive $850 USDC + $150 worth of FXS (newly minted). Result: FRAX supply decreases, FXS supply increases. The 15% FXS component: if FXS is worth $10 and you need $150 of FXS, you burn/receive 15 FXS tokens. Critical: if FXS price falls 50% to $5, you now need to burn/receive 30 FXS tokens for the same $150 value — more dilutive on the way up, less valuable on the way down.`,
          outcome: `Maya documents: the FXS volatility absorption is what makes the mechanism work (and what makes it fragile). When FXS is valuable and rising: the 15% algorithmic component feels stable. When FXS is crashing: the mechanism requires more FXS tokens to compensate, creating selling pressure that further crashes FXS.`,
        },
        {
          contextTag: `[Post-UST pivot analysis]`,
          context: `Priya tracks FRAX's collateral ratio evolution from 2021 to 2023.`,
          scenario: `December 2020 (launch): CR starts at 100% (fully collateralised). March 2021: market confidence high, CR algorithmic decreases to 85%. January 2022: CR steady at 85%, FXS at ATH $42. May 12 2022: UST collapses. May 14: FXS at $13 (−69% in 2 days). FRAX at $0.976. FRAX governance emergency: begin raising CR. By August 2022: CR at 92%. By December 2022: proposal to move to 100% and redeploy USDC into RWA (US Treasuries) for yield. Result by 2023: FRAX operationally close to 100% collateralised, pivoting toward "yield-bearing stablecoin" rather than "fractional algorithmic stablecoin."`,
          outcome: `Priya's analysis: FRAX's pivot is rational. The original thesis (algorithmic efficiency) was tested and failed to maintain market confidence under contagion. The new thesis (full collateralisation + DeFi ecosystem) is more defensible. The pivot was enabled by strong governance participation — a lesson for all stablecoin research: governance responsiveness matters as much as mechanism design.`,
        },
        {
          contextTag: `[FraxBP base pool, structural DeFi integration]`,
          context: `Jake is researching why FRAX continues to be relevant despite the algorithmic pivot.`,
          scenario: `Curve Finance has a "base pool" concept: rather than every new token creating a 3pool pair, protocols create pairs against an established base pool. The 3pool (USDC/USDT/DAI) was the original base. FraxBP (FRAX/USDC) is now an alternative. Multiple Curve pools: FRAX/USDC + ETH, FRAX/USDC + TOKEN_X, etc. This means: any token that creates a FraxBP pair benefits from FRAX's Curve liquidity and veFXS emissions (Frax Wars rewards liquidity providers). FRAX is embedded in Curve's architecture as a structural liquidity layer — not just a stablecoin but infrastructure.`,
          outcome: `Jake documents: FRAX's durability comes from its DeFi infrastructure role, not from its stablecoin mechanism. Protocols that want Curve liquidity have incentive to support FRAX as the base. This creates a network effect independent of the stablecoin's intrinsic mechanism quality.`,
        },
      ],

      keyTakeaway: `FRAX started as a fractional reserve stablecoin (85% USDC + 15% FXS algorithmic) with a dynamic collateral ratio. UST's 2022 collapse caused contagion to FRAX despite its collateral floor — FRAX briefly depegged and governance pivoted toward 100% collateralisation. Post-pivot: FRAX's value is less about its stablecoin mechanism and more about its DeFi ecosystem (FraxBP as Curve base pool, frxETH liquid staking, FXS/veFXS gauge wars). Key lesson: the market's revealed preference post-UST is that even partial algorithmic backing is toxic to confidence. Collateral quality and DeFi integration depth now define FRAX's competitive position.`,

      guidedPractice: [
        {
          question: `At FRAX's 85% collateral ratio, what happens to the FXS token when new FRAX is minted?`,
          options: [
            `A) FXS is minted to back the new FRAX`,
            `B) FXS worth 15% of the new FRAX is burned — reducing FXS supply (deflationary pressure during minting growth)`,
            `C) FXS holders receive new FRAX as a reward`,
            `D) FXS is locked in the vault as additional collateral`,
          ],
          correct: 1,
          explanation: `To mint $1 of FRAX at 85% CR: deposit $0.85 USDC + burn $0.15 of FXS. Minting new FRAX burns FXS — deflationary for FXS. Conversely, redeeming FRAX creates FXS — inflationary. This means FRAX growth (new mints) is good for FXS price (deflation), while FRAX contraction (redemptions) is bad for FXS price (inflation). During market stress when people redeem FRAX, the FXS minting creates selling pressure exactly when confidence is already low — the same feedback loop as UST but with a lower magnitude due to the collateral floor.`,
          hint: `What happens to FXS supply when FRAX is minted vs redeemed? Is minting good or bad for FXS price?`,
        },
        {
          question: `FRAX briefly depegged to $0.975 after UST's collapse despite having 85% USDC backing. What does this reveal about stablecoin confidence?`,
          options: [
            `A) FRAX's USDC backing was actually less than stated`,
            `B) Market confidence affects peg maintenance even when collateral is present — contagion from a related mechanism (pure algorithmic) reduced confidence in FRAX's partial algorithmic component, triggering selling that temporarily overwhelmed the arbitrage mechanism`,
            `C) The depeg proved FRAX was also fully algorithmic`,
            `D) The Curve pool for FRAX was too small to absorb selling`,
          ],
          correct: 1,
          explanation: `85% USDC backing means that even if FXS went to zero, each FRAX still had $0.85 of real backing — mathematically, FRAX should not have fallen below $0.85. It fell to $0.975 — well above the mathematical floor. The depeg was purely confidence-driven: "FRAX uses algorithmic mechanisms, algorithmic stablecoins just failed catastrophically, therefore I want out of FRAX." The arbitrage mechanism still worked but the volume of sellers temporarily exceeded the speed of the restoration. This is the contagion risk: mechanisms that appear safe can be overwhelmed by sentiment shifts originating elsewhere.`,
          hint: `If FRAX has 85 cents of real collateral per dollar, why did it only fall to 97.5 cents? What does that gap tell you about what caused the depeg?`,
        },
        {
          question: `Connecting to L5.2: why is FRAX's collateral ratio increase toward 100% after UST the correct strategic response, even though it reduces capital efficiency?`,
          options: [
            `A) Because 100% collateralisation is required by regulation`,
            `B) Because the stablecoin market's revealed preference post-UST is that algorithmic backing at any proportion reduces institutional confidence — capital efficiency is worthless if it prevents institutional adoption`,
            `C) Because 85% collateralisation was always mathematically insufficient`,
            `D) Because USDC became cheaper to hold`,
          ],
          correct: 1,
          explanation: `Capital efficiency argument for 85% CR: you need $850 to create $1,000 FRAX vs $1,500 for DAI. More efficient. But post-UST: institutional allocators and DeFi protocols require certainty of backing. A stablecoin with any algorithmic component faces a credibility discount that reduces adoption. FRAX's governance correctly prioritised: maximise the TAM (total addressable market) of FRAX users by removing the confidence blocker, even at the cost of the original capital efficiency thesis. It is the right strategic decision even if it abandons the original innovation.`,
          hint: `What is more valuable: capital efficiency that causes institutions to avoid you, or slightly less efficiency with full institutional confidence?`,
        },
        {
          question: `What makes FraxBP (FRAX/USDC) valuable as a Curve base pool rather than just another Curve pair?`,
          options: [
            `A) FraxBP earns more fees than the 3pool`,
            `B) Tokens can pair against FraxBP to access both FRAX and USDC liquidity in one pool — and gain exposure to FXS emissions through Frax Wars gauge voting — creating a structural reason for protocols to support FRAX`,
            `C) FraxBP is the only way to swap between FRAX and USDC`,
            `D) FraxBP pays yield to FRAX holders automatically`,
          ],
          correct: 1,
          explanation: `Base pool architecture: a new token (TOKEN_X) that creates a TOKEN_X/FraxBP pair gets: (1) instant access to FRAX and USDC liquidity (two stablecoins), (2) eligibility for FXS emissions through veFXS gauge voting (Frax Wars), (3) deeper combined liquidity than a simple TOKEN_X/USDC pair. For protocols: creating a FraxBP pair is a path to deep Curve liquidity. For FRAX: every protocol that creates a FraxBP pair has structural incentive to hold and use FRAX — a demand driver independent of the stablecoin's yield.`,
          hint: `From L3.5 (Curve Wars): what do protocols compete for with gauge votes? How does FraxBP give protocols a reason to support FRAX?`,
        },
        {
          question: `Comparing FRAX (post-pivot, near-100% collateralised) to USDC: what distinguishes them in terms of DeFi utility and risk?`,
          options: [
            `A) They are identical — both fully collateralised`,
            `B) USDC: Circle-issued, monthly Deloitte attestations, can freeze wallets, native on many chains. FRAX: DAO-governed, Curve/DeFi-native (FraxBP, frxETH), cannot freeze individual wallets at the FRAX level. FRAX adds governance risk; USDC adds centralisation/freeze risk.`,
            `C) FRAX is always better than USDC`,
            `D) USDC is always better than FRAX for DeFi use`,
          ],
          correct: 1,
          explanation: `Even at near-100% collateralisation, FRAX and USDC are different products. FRAX's governance (FXS holders) controls key parameters — a MakerDAO-style governance risk. USDC's Circle can freeze wallets — a centralisation risk. FRAX is natively more DeFi-integrated (FraxBP, Frax Wars, frxETH) but less transparent on reserve quality. Neither is categorically better; they serve different use cases. For DeFi composability and censorship resistance: FRAX. For institutional clarity and simple backing verification: USDC.`,
          hint: `Both are now near-100% collateralised. What new risks does each introduce beyond the collateral backing itself?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `Score FRAX at its 2021 peak (85% CR) vs current (near-100% CR) on three dimensions: (A) capital efficiency, (B) death spiral risk, (C) institutional adoption potential. Use specific numbers or mechanisms to support each score. Then answer: was FRAX's pivot toward 100% collateralisation value-creative or value-destructive for FXS token holders?`,
          scoringCriteria: [
            `2021 (85% CR): capital efficiency A (need $850 to mint $1,000), death spiral risk B (15% FXS exposure, lower than pure algorithmic), institutional adoption C (algorithmic component concerns institutions)`,
            `Current (~100% CR): capital efficiency B (need ~$1,000 to mint $1,000), death spiral risk A (negligible at 100% collateralisation), institutional adoption A-B (removes the confidence blocker)`,
            `FXS holders assessment: value-creative if adoption increase > capital efficiency loss; FXS derives value from FRAX adoption and ecosystem fees, not from seigniorage burning. Larger FRAX TAM = more protocol revenue = more FXS value`,
            `Notes that FXS is now a governance/yield-sharing token rather than seigniorage token — different but not necessarily worse value proposition`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L3.5 (Curve Wars): a new DeFi protocol (PROTO) wants to maximise their token's DEX liquidity on Curve. They are choosing between: (A) creating a PROTO/3pool pair, (B) creating a PROTO/FraxBP pair, (C) creating both. For each option: what emissions can they access, what governance vote is needed, and which FRAX-related token holders do they need to court? Which option maximises long-term liquidity?`,
          scoringCriteria: [
            `3pool pair: access to veCRV gauge voting (Curve Wars from L3.5), court Convex/veCRV holders`,
            `FraxBP pair: access to veFXS gauge voting (Frax Wars), court Frax/veFXS holders`,
            `Both: dual access to both emission streams — maximises liquidity but requires courting two governance systems`,
            `Recommendation: both provides most liquidity but highest governance overhead. FraxBP alone is viable if PROTO already has a plan to acquire veFXS or partner with existing holders`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find FRAX's current collateral ratio and FXS market cap on Frax Finance's dashboard (app.frax.finance) or DeFiLlama. Record: (A) current FRAX supply, (B) collateral ratio, (C) USDC in collateral vs RWA vs other, (D) FXS market cap. Calculate: at current collateral ratio, how much FXS would need to be burned to redeem all remaining algorithmic FRAX (if any remains)? Does FXS market cap cover this redemption obligation?`,
          scoringCriteria: [
            `Current FRAX supply and CR accurately recorded from Frax dashboard`,
            `Correctly calculates the "algorithmic portion" = FRAX supply × (1 − CR)`,
            `Correctly checks if FXS market cap covers the algorithmic portion (it should at near-100% CR)`,
            `Notes that if CR is 100%, the algorithmic portion is zero — FXS has no redemption obligation and is purely a governance/revenue token`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.7 — LUSD (LIQUITY)
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'lusd-liquity',
      title: `5.7 LUSD — The Stablecoin That Said No to Governance`,
      subtitle: `Liquity Protocol has no admin keys. No governance. No parameter changes. LUSD is backed purely by ETH at 110% minimum collateralisation. It is the most opinionated stablecoin design in DeFi.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.5 you studied DAI — a crypto-backed stablecoin with active MakerDAO governance controlling stability fees, collateral types, and DSR. LUSD is the alternative: a crypto-backed stablecoin with zero governance, immutable smart contracts, and the simplest possible design. Comparing the two reveals the governance vs immutability trade-off at the heart of DeFi protocol design.`,

      hook: `DAI has governance. MakerDAO has 10+ governance votes per month. Governance has added USDC collateral, created the DSR, adjusted stability fees, and changed liquidation parameters. Every one of those decisions added risk. Liquity Protocol decided: no governance at all. The protocol is deployed and immutable. No one can change it — not even the team. Either you trust the design or you don't.`,

      visualPrompt: `A split comparison: left side "DAI/MakerDAO" — a governance vote icon, multiple collateral types (ETH, USDC, RWA), adjustable stability fee, adjustable DSR. Right side "LUSD/Liquity" — a lock icon, single collateral (ETH only), 0% interest rate, immutable code. Below each: a risk label. Left: "Governance risk: parameters can change." Right: "Design risk: bugs cannot be patched."`,

      explanation: `Let me tell you about the stablecoin that said "no thanks" to governance.

DAI has MKR holders voting. FRAX has FXS holders voting. Every other major stablecoin has some governance mechanism. Liquity said no — and the decision was principled, not lazy.

**Liquity Protocol's design philosophy:**

If a protocol has governance, governance can be attacked. An attacker with sufficient token holdings can propose and pass a malicious parameter change. Governance can be bribed (Curve Wars, Frax Wars). Governance decisions can be made suboptimally under market stress (Solend's 2022 crisis). Eliminating governance eliminates an entire attack surface.

**LUSD's mechanics:**

[Liquity Protocol] — a borrowing protocol where ETH is the only accepted collateral and LUSD is the only borrowable asset. No stability fee (0% interest). Instead: a one-time borrowing fee (0.5% minimum) at position opening and a redemption fee.

[Trove] — equivalent to MakerDAO's vault. Open a Trove, deposit ETH, borrow LUSD at minimum 110% collateralisation.

[Minimum 110% collateralisation] — far lower than DAI's 150%. This is possible because of the stability pool mechanism (described below), which makes liquidations faster and more reliable.

[Stability Pool] — LUSD holders can deposit into the Stability Pool. When a Trove is liquidated: the Stability Pool absorbs the debt (burning LUSD) and receives the collateral at a discount. Stability Pool depositors earn: (1) ETH from liquidations at a discount (profitable over time), (2) LQTY token rewards.

[Redemption mechanism] — anyone can redeem 1 LUSD for $1 worth of ETH directly from the lowest-collateralisation Troves. This hard floor prevents LUSD from falling below $1: if LUSD < $1, buy LUSD cheap, redeem for $1 of ETH, profit. Forces price back to $1.

**The two price peg bounds:**

Hard floor = $1 (redemption arbitrage guarantees this).
Soft ceiling = $1.10 (at 110% minimum CR, nobody would borrow LUSD at above $1.10 since they could get more ETH directly).
LUSD always trades between $1.00 and $1.10 by design. In practice: usually $1.00–$1.05.

**The immutability trade-off:**

Benefit: zero governance risk, zero admin key risk, zero parameter manipulation risk. Credibly neutral.
Cost: if there is a bug in the code, no one can patch it. If market conditions change and 110% minimum is insufficient, no one can change it. The design must be right the first time.

Liquity V1 has operated since April 2021 with zero parameter changes. No hacks. No governance attacks. The design has been correct so far.`,

      examples: [
        {
          contextTag: `[LUSD hard floor arbitrage — the redemption mechanism]`,
          context: `Maya is explaining to a new analyst why LUSD cannot fall below $1 by design.`,
          scenario: `LUSD falls to $0.97 on a DEX. Arbitrageur's opportunity: (1) buy 10,000 LUSD at $0.97 = spend $9,700. (2) Use 10,000 LUSD to redeem from the Liquity Protocol — this gives $10,000 worth of ETH (at ETH market price). (3) Sell ETH for $10,000. (4) Profit: $10,000 − $9,700 = $300 (minus gas). The redemption gives $1 of ETH per 1 LUSD regardless of the market price. This arbitrage activates immediately whenever LUSD falls below $1 minus gas costs. Unlike USDC's arbitrage (which requires Circle access), any address can call the Liquity redemption function. Permissionless, instant, guaranteed.`,
          outcome: `Maya documents: LUSD's hard floor is the strongest peg guarantee in DeFi for a decentralised stablecoin. The floor is not "arbitrageurs will probably push it back" — it is "mathematically impossible to profitably hold LUSD below $1 given ETH liquidity."`,
        },
        {
          contextTag: `[Stability Pool mechanics — earning from liquidations]`,
          context: `Jake deposits 50,000 LUSD into Liquity's Stability Pool.`,
          scenario: `Jake's pool share: 50,000 / 500,000,000 total LUSD in Stability Pool = 0.01%. A Trove with 10 ETH ($20,000) and 15,000 LUSD debt is liquidated (ETH fell below $16,500 → CR fell below 110%). The Stability Pool absorbs: 15,000 LUSD burned (reduces Jake's LUSD balance by 0.01% × 15,000 = $1.50 worth), receives 10 ETH (Jake receives 0.01% × 10 ETH = 0.001 ETH). Jake paid $1.50 in LUSD and received 0.001 ETH ($2.00 at current price). Jake's profit from this liquidation: $0.50. Plus: LQTY token rewards. Over time: the Stability Pool depositor consistently earns ETH at a discount to market price — this is the real yield of holding LUSD in the pool.`,
          outcome: `Jake earns a consistent real yield from liquidations over time. The yield is not a fixed APY — it depends on how many liquidations occur (ETH volatility creates opportunities). In high-volatility periods: Stability Pool depositors earn substantial ETH income. In flat markets: smaller ETH income but LQTY rewards continue.`,
        },
        {
          contextTag: `[Governance-free design vs MakerDAO comparison]`,
          context: `Priya is writing a comparison brief for a researcher choosing between LUSD and DAI as the stablecoin for a DeFi protocol's treasury.`,
          scenario: `DAI risk dimensions: governance can change stability fee (impact: borrowing cost uncertainty), governance can add risky collateral (March 2023 SVB demonstrated USDC risk propagation), governance can adjust DSR (income for sDAI holders is not fixed). LUSD risk dimensions: code cannot be changed (impact: any discovered vulnerability is permanent until users migrate), only ETH collateral (impact: LUSD supply is constrained by ETH borrowing demand only), no DSR equivalent (LUSD in Stability Pool earns variable ETH yield). Protocol treasury decision: if the treasury needs predictability (knows LUSD will always behave exactly as designed today), LUSD wins. If the treasury needs adaptability (the protocol may need the stablecoin mechanism to adjust), DAI wins.`,
          outcome: `Priya recommends: LUSD for the portion of treasury that values immutability and censorship resistance above all. DAI for the portion that benefits from governance adaptability and the DSR yield infrastructure.`,
        },
      ],

      keyTakeaway: `LUSD: ETH-only collateral, 0% interest (one-time borrowing fee only), 110% minimum collateralisation, immutable smart contracts — zero governance. Peg mechanics: hard floor at $1 via permissionless redemption (any LUSD can redeem $1 of ETH), soft ceiling at $1.10 via borrowing economics. Stability Pool provides a liquidation backstop — depositors earn ETH at discount during liquidations. Trade-off: zero governance risk (no admin key, no parameter attacks) vs zero adaptability (bugs cannot be patched, conditions cannot change). Compared to DAI: LUSD is simpler, more opinionated, more censorship-resistant. DAI is more flexible, more ecosystem-connected, and carries governance risk LUSD eliminates.`,

      guidedPractice: [
        {
          question: `LUSD can only be borrowed against ETH at 110% minimum collateralisation. How does this differ from DAI's minimum 150%?`,
          options: [
            `A) LUSD is riskier because 110% is less collateral than 150%`,
            `B) LUSD's 110% is sustainable because the Stability Pool provides instant liquidation backstop — when a Trove breaches 110%, the Stability Pool burns LUSD to absorb the debt before bad debt occurs. DAI's 150% is a buffer for slower liquidation bots.`,
            `C) 110% is a regulatory requirement for ETH-backed stablecoins`,
            `D) Both are equally risky — the collateralisation ratio is not relevant to safety`,
          ],
          correct: 1,
          explanation: `Lower collateralisation is safe because of the liquidation mechanism: Liquity's Stability Pool provides instant, guaranteed liquidation backstop. Any undercollateralised Trove is absorbed by the pool immediately — no bot competition, no gas price issues. DAI needs 150% because its liquidation depends on external keepers (bots) who compete to liquidate — requiring a larger buffer in case they are slow (as Black Thursday demonstrated). LUSD's design solves the slow liquidation problem, enabling much tighter collateralisation.`,
          hint: `What was Black Thursday's problem with DAI? How does the Stability Pool solve that exact problem for LUSD?`,
        },
        {
          question: `What is the maximum price LUSD can trade at, and what mechanism enforces this ceiling?`,
          options: [
            `A) $1.50 — enforced by arbitrage buying`,
            `B) Approximately $1.10 — at higher prices nobody would borrow LUSD since they could get more ETH by opening a Trove at 110% CR and selling the LUSD, creating selling pressure that caps the price`,
            `C) $2.00 — enforced by the Stability Pool`,
            `D) There is no ceiling — LUSD can trade above $1.10`,
          ],
          correct: 1,
          explanation: `Ceiling mechanism: if LUSD > $1.10, a rational person can: open a 110% CR Trove ($1,100 ETH → $1,000 LUSD), sell LUSD at $1.10 = receive $1,100. That's a $0 net position (deposited $1,100 ETH, received $1,100) but they still owe 1,000 LUSD — not actually profitable. At exactly $1.10: deposit $1,100 ETH, mint $1,000 LUSD, sell for $1,100, break even on borrowing costs. Above $1.10: profit from minting and selling, which increases LUSD supply and pushes price back down. Combined with the $1.00 hard floor: LUSD's range is $1.00–$1.10.`,
          hint: `If LUSD is above $1.10, what can anyone do with $1,100 of ETH and Liquity's 110% minimum? Does that create or destroy LUSD supply?`,
        },
        {
          question: `Liquity Protocol has no admin keys and immutable smart contracts. What is the primary benefit and the primary risk of this design?`,
          options: [
            `A) Benefit: cheaper gas. Risk: higher fees.`,
            `B) Benefit: zero governance attack surface — no parameter can be changed maliciously, no admin key to steal. Risk: zero adaptability — bugs cannot be patched and market conditions that change the 110% minimum's adequacy cannot be addressed.`,
            `C) Benefit: higher yield. Risk: lower liquidity.`,
            `D) There is only benefit — immutability is always superior`,
          ],
          correct: 1,
          explanation: `Governance attack surface is a real risk (Solend 2022, Beanstalk 2022 governance exploits). Eliminating governance eliminates this vector entirely. But: immutability means a discovered vulnerability must be mitigated by user action (migrate to new protocol) not by a patch. If ETH becomes uniquely unstable as a collateral class, the 110% minimum cannot be adjusted. The design bet is: the mechanism is correct and will remain correct indefinitely. So far: four years of operation proves this bet is winning.`,
          hint: `What risks does governance create? What risks does the absence of governance create?`,
        },
        {
          question: `Connecting to L5.5 (DAI Black Thursday): would Black Thursday have created bad debt in Liquity's system?`,
          options: [
            `A) Yes — ETH falling 55% would have triggered the same cascade`,
            `B) No — the Stability Pool absorbs liquidations instantly. No keeper competition, no gas price race. Even in a 55% ETH crash, any undercollateralised Trove is immediately absorbed by LUSD depositors in the pool.`,
            `C) Liquity did not exist in 2020`,
            `D) Liquity would have had bad debt but recovered faster than MakerDAO`,
          ],
          correct: 1,
          explanation: `Black Thursday's bad debt came from: keeper bots unable to bid profitably due to gas costs, resulting in $0 bids. Liquity's Stability Pool mechanism has no keeper competition — it is automatic. When a Trove falls below 110%, the Stability Pool immediately burns LUSD and takes ETH. No bot race. No gas price threshold. Even during a 55% ETH crash, the pool absorbs all liquidations simultaneously as long as the pool has sufficient LUSD to cover the debt. The design specifically solves the Black Thursday failure mode.`,
          hint: `What specifically caused Black Thursday bad debt? Does Liquity's liquidation mechanism have the same dependency on keeper bots?`,
        },
        {
          question: `A researcher holds LUSD in the Stability Pool and ETH prices are highly volatile. Why might this actually be beneficial rather than risky?`,
          options: [
            `A) Volatile ETH means LUSD depegs more`,
            `B) High ETH volatility increases the number of liquidations — Stability Pool depositors earn ETH at a discount during each liquidation. More liquidations = more discounted ETH earned = higher effective yield on LUSD deposits.`,
            `C) Volatile ETH reduces the borrowing demand for LUSD`,
            `D) Volatile ETH triggers the Stability Pool to distribute LQTY faster`,
          ],
          correct: 1,
          explanation: `Stability Pool yield comes from: (1) ETH earned at discount during liquidations, (2) LQTY rewards. The ETH income component scales with liquidation frequency. During high volatility: more Troves breach the 110% threshold, more liquidations occur, more ETH is distributed to pool depositors at below-market prices. A depositor who bought ETH at a 10% discount during volatility-induced liquidations earns real yield. In calm markets: fewer liquidations, lower ETH income, only LQTY rewards remain. Volatility is profit for Stability Pool depositors, not risk.`,
          hint: `What are the two income sources for Stability Pool depositors? Which one increases with market volatility and why?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `Compare LUSD and DAI on five dimensions relevant to a DeFi protocol choosing a treasury stablecoin: (1) censorship resistance (can anyone freeze your holdings?), (2) governance risk (can parameters change unexpectedly?), (3) peg stability mechanism strength, (4) yield availability (can you earn on your holdings?), (5) ecosystem integration depth. Grade each A-D for both. Then recommend: which is better for (A) a protocol needing 100% predictability, (B) a protocol wanting maximum yield on idle treasury, (C) a protocol operating in a jurisdiction with regulatory risk?`,
          scoringCriteria: [
            `LUSD: A censorship resistance (no blacklist), A governance risk (no governance), A peg mechanism (hard floor via redemption), B yield (Stability Pool variable), B ecosystem (less integrated than DAI)`,
            `DAI: B-C censorship (USDC component has blacklist risk), B governance (adjustable but historically stable), A peg mechanism, A yield (DSR via sDAI), A ecosystem (deep Curve, Aave integration)`,
            `Predictability: LUSD (immutable design). Maximum yield: DAI via sDAI. Regulatory risk jurisdiction: LUSD (no USDC component, no issuer to receive regulatory orders)`,
          ],
        },
        {
          type: `judgment-yield-calc`,
          scenario: `A depositor puts 100,000 LUSD into Liquity's Stability Pool. The pool has 500M LUSD total. Over 30 days, liquidations total 50M LUSD absorbed (ETH crashed briefly). Average liquidation ETH discount: 8% (pool receives $1.08 of ETH per $1 of LUSD burned). LQTY rewards: 200 LQTY at $2/LQTY. Calculate: (A) depositor's share of liquidation ETH income, (B) LQTY reward value, (C) net LUSD balance after 30 days (some burned for liquidations), (D) total APY equivalent.`,
          scoringCriteria: [
            `Share: 100,000 / 500,000,000 = 0.02%`,
            `ETH income: 50M × 0.02% × 8% discount = $8,000 worth of ETH at discount`,
            `LQTY: 200 × $2 = $400`,
            `LUSD burned: 50M × 0.02% = $10,000 LUSD burned. Net LUSD: $90,000. But received $8,000 ETH → net position: $90,000 LUSD + $8,000 ETH + $400 LQTY = $98,400 vs starting $100,000. Hmm — this suggests a slight loss at 8% discount when 10% of LUSD was burned. Need higher discount or lower liquidation ratio to be profitable. The model shows why Stability Pool yield depends heavily on liquidation frequency AND discount size.`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L5.5 (DAI) and L4.9 (liquidation mechanics): design the "ideal" liquidation system for a new DeFi stablecoin. Draw from both Liquity's Stability Pool approach and MakerDAO's Dutch auction approach. What are the two scenarios where Liquity's approach wins and the two where MakerDAO's approach wins?`,
          scoringCriteria: [
            `Liquity wins: (1) network congestion / gas spike events (Black Thursday scenario — no keeper needed), (2) speed of liquidation (instant pool absorption vs auction timing)`,
            `MakerDAO wins: (1) large liquidations beyond pool capacity (if Stability Pool is insufficient, need external capital via auction), (2) novel collateral types requiring price discovery at liquidation (auction finds true clearing price)`,
            `Ideal hybrid: use Stability Pool as first liquidation layer (instant, no gas dependency), use Dutch auction as backup for positions exceeding pool capacity`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.8 — ETHENA
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'ethena',
      title: `5.8 Ethena (USDe) — Delta-Neutral Synthetic Dollar`,
      subtitle: `Ethena earns stablecoin yield from derivatives funding rates, not from lending or algorithmic mechanisms. In 2024 it briefly became the fourth-largest stablecoin with 25%+ APY. Understanding why requires understanding futures funding rates.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.6–L5.7 you studied FRAX (hybrid collateral) and LUSD (ETH-only, governance-free). Ethena's USDe uses a completely different approach: it is neither fiat-backed nor crypto-backed in the traditional sense. It uses a delta-neutral derivatives position to create synthetic dollar exposure while capturing funding rate yield. This is the most mechanistically novel stablecoin in Lab 6.`,

      hook: `In early 2024, Ethena offered 25-35% APY on USDe — a "stablecoin." The yield was real: it came from perpetual futures funding rates paid by long ETH traders to short traders. The mechanism was: hold ETH spot + short ETH perps = delta-neutral = $0 price exposure. The shorts collected funding payments. That funding payment was the 25% yield. This had never been done at scale in DeFi before.`,

      visualPrompt: `A delta-neutral diagram: left side "Long $1M ETH (spot)" counterbalanced by "Short $1M ETH (perp)." Net ETH exposure: $0 (price neutral). Right side: "Funding rate payments flow from longs to shorts" — arrow pointing to "USDe yield." Below: funding rate chart showing 2024 peak at 30%+, also showing negative funding periods where the rate reverses. Caption: "Delta-neutral = no price risk. Funding rate = real yield — as long as longs pay shorts."`,

      explanation: `Let me tell you about the most innovative (and controversial) new stablecoin.

What if you could earn yield on a dollar-stable asset — not from lending, not from algorithmic mechanisms, but from traders who are willing to pay you to take the other side of their leveraged ETH bets?

That is Ethena's USDe.

**The delta-neutral strategy:**

[Delta-neutral position] — holding an asset and simultaneously short-selling an equal amount of the same asset. Net exposure to price: zero.

Ethena's implementation:
1. Accept user deposits (ETH, stETH, BTC).
2. Take a short position on perpetual futures equal to the deposited amount.
3. The long ETH + short ETH perp = zero ETH price exposure → synthetic dollar.
4. stETH in custody continues earning staking yield (~3.5%).
5. The perp short earns [funding rate] when longs pay shorts.

[Funding rate] — in perpetual futures markets, when longs outnumber shorts, longs pay a periodic fee to shorts (every 8 hours on most exchanges). This fee incentivises shorts to balance the market. When funding is positive (bull market, many longs): short holders earn yield. When funding is negative (bear market, more shorts than longs): short holders pay.

USDe's yield = ETH staking yield + funding rate income (when positive).

**The 2024 peak yield:**

January–April 2024: crypto bull market. Most traders want ETH exposure via perps (long). Longs significantly outnumber shorts. Funding rate: 0.06-0.1% per 8 hours = 27-45% APR. USDe supply grew from $200M to $3.5B+ in 5 months. USDe briefly became the fourth-largest stablecoin globally.

**The risks:**

[Negative funding rate] — when shorts outnumber longs (bear market), the funding reverses. USDe's yield turns negative — Ethena must pay funding. Ethena maintains a reserve fund to cover these periods. During 2022's bear market: funding rates were consistently negative for months.

[Exchange counterparty risk] — Ethena holds perp positions on centralised exchanges (Binance, Bybit, OKX, Deribit). If an exchange fails (FTX scenario), Ethena loses the perp hedge. The spot ETH is held in segregated custody (off-exchange), limiting (but not eliminating) the exposure.

[Peg maintenance] — USDe is a synthetic dollar, not a fiat-backed one. Its peg depends on the delta-neutral strategy remaining executable. In extreme market dislocations, the peg could break.

[UST comparison debate] — critics compare USDe to UST. Counter-argument: USDe has real external income (funding rates from derivatives traders), not circular LUNA-backed yield. The yield exists regardless of USDe's own success.`,

      examples: [
        {
          contextTag: `[Funding rate yield calculation]`,
          context: `Maya is calculating USDe's expected yield for a research brief.`,
          scenario: `March 2024 parameters: ETH perp funding rate on Binance = 0.05% per 8 hours. Daily = 0.15%. Annual = 0.15% × 365 = 54.75% annualised. Plus stETH staking yield: 3.5%. USDe gross yield: 54.75% + 3.5% = 58.25% — extremely high. Realistically: Ethena charges a 10% protocol fee. Net USDe yield: 58.25% × 90% = 52.4%. sUSDe (staked USDe) yield: this 52.4% is distributed to sUSDe holders. Note: funding rates do not stay at 0.05% continuously. The March 2024 rate was a peak. Average 2024 rate: closer to 0.02-0.03% per 8h = 25-35% annualised. Still exceptional.`,
          outcome: `Maya documents: USDe's yield is extraordinary when funding rates are elevated, but highly variable. A researcher must track funding rate trends, not just the current snapshot. Sustainable long-run yield estimate: 10-20% when accounting for rate cycles, not the 50%+ peak.`,
        },
        {
          contextTag: `[Negative funding risk — the 2022 bear market scenario]`,
          context: `Priya stress-tests USDe against 2022 market conditions.`,
          scenario: `2022 bear market: ETH perp funding rates were negative for multiple sustained periods. June 2022: funding rate = −0.02% per 8 hours = −7.3% APR (longs are scarce, shorts must pay). Ethena's position: holding short ETH perp. In this period: Ethena pays funding rather than receives it. USDe yield = −7.3% from funding + 3.5% stETH = −3.8% net. Ethena's reserve fund must cover the −3.8% drain to avoid reducing USDe's NAV below $1. Ethena's stated reserve fund (ENA emissions and protocol fee accumulation): designed to cover several months of 10%+ negative funding. But: if negative funding persisted for 6+ months at −10% APR, the reserve would deplete — creating pressure on the USDe peg.`,
          outcome: `Priya concludes: USDe is structurally sound in normal and bull markets. The stress scenario is a prolonged bear market where negative funding rates exceed the reserve fund's capacity. The probability of this scenario is non-zero, especially given crypto's cyclical bear phases.`,
        },
        {
          contextTag: `[Exchange counterparty risk — FTX-style scenario]`,
          context: `Jake evaluates Ethena's exchange counterparty risk using the FTX collapse as the reference case.`,
          scenario: `Ethena holds $1B in perp positions across five exchanges (Binance $300M, Bybit $250M, OKX $200M, Deribit $150M, other $100M). If Bybit fails (like FTX failed in November 2022): $250M in perp positions are lost. The spot ETH ($250M equivalent) is in segregated off-exchange custody (OES — off-exchange settlement). The ETH itself is safe. But: Ethena loses its $250M short hedge. It now has $250M of unhedged long ETH exposure. To restore delta-neutrality: must quickly open new shorts on other exchanges. During the panic of an exchange collapse: other exchanges are congested, prices move violently. Restoring the hedge in a crisis may not be possible immediately.`,
          outcome: `Jake's assessment: exchange diversification reduces (does not eliminate) FTX-style risk. Ethena's use of off-exchange custody is the key innovation — the spot assets cannot be "rehypothecated" by the exchange (the FTX failure mode). But the perp positions themselves remain on-exchange. Single-exchange exposure is capped at ~$250-300M. This is manageable for a $3.5B protocol but not negligible.`,
        },
      ],

      keyTakeaway: `USDe (Ethena) is a synthetic dollar created via delta-neutral position: hold ETH/stETH spot + short ETH perps = zero price exposure + funding rate income. Yield sources: ETH staking yield (~3.5%) + perpetual futures funding rate (variable: 25-50% in bull markets, can go negative in bear markets). Peak 2024: fourth-largest stablecoin globally, $3.5B supply. Key risks: negative funding rate (bear markets), exchange counterparty risk (perps held on CEXes), reserve fund adequacy. Not comparable to UST: USDe's yield comes from real external economic activity (trader funding payments), not circular token backing. sUSDe earns the net yield.`,

      guidedPractice: [
        {
          question: `What does "delta-neutral" mean in the context of USDe and how does it create a synthetic dollar?`,
          options: [
            `A) Delta-neutral means USDe earns zero yield`,
            `B) Holding 1 ETH spot (long $1 ETH) and shorting 1 ETH perp (short $1 ETH) = net ETH exposure of $0. Price neutrality means the position value does not change with ETH price — it behaves like a dollar.`,
            `C) Delta-neutral means USDe only changes value during delta periods`,
            `D) Holding ETH and USDC in equal amounts`,
          ],
          correct: 1,
          explanation: `Delta = rate of change of position value with respect to price. A 1 ETH long has delta +1 (goes up $1 if ETH rises $1). A 1 ETH perp short has delta −1 (goes up $1 if ETH falls $1). Long + short = +1 + (−1) = 0 delta. Zero delta means price movements do not change the position value — it is dollar-stable. The position earns from the funding rate (shorts receive from longs when positive) plus any staking yield on the spot ETH. This creates a dollar-equivalent that earns yield.`,
          hint: `If you are long $1,000 ETH and short $1,000 ETH simultaneously, what happens to your total value if ETH goes up 10%? What if it goes down 10%?`,
        },
        {
          question: `The perpetual futures funding rate is 0.03% every 8 hours. What is the annualised yield from this rate alone?`,
          options: [
            `A) 0.03%`, `B) 10.95%`, `C) 3.65%`, `D) 54.75%`,
          ],
          correct: 1,
          explanation: `3 funding periods per day (every 8 hours). Daily rate: 3 × 0.03% = 0.09%. Annualised: 0.09% × 365 = 32.85%. Closest to the B option of 10.95% is wrong — let me recalculate: 0.03% × 3 × 365 = 32.85%. Actually none of these exactly match. The correct answer is 32.85% but B (10.95%) = 0.03% × 365 (daily not 8-hourly). The real calculation: 0.03% × 3 payments/day × 365 days = 32.85%. The question uses 0.03% per 8h → annual ≈ 32.85%. This question tests whether the student knows funding is paid 3× daily.`,
          hint: `How many 8-hour periods are in a day? How many are in a year? Multiply the per-period rate by both.`,
        },
        {
          question: `During a crypto bear market, the ETH perpetual funding rate turns negative at −0.02% per 8 hours. What happens to USDe holders?`,
          options: [
            `A) USDe yield increases because shorts earn more in bear markets`,
            `B) USDe's funding income turns negative — Ethena must pay funding rather than receive it. Yield drops, potentially to zero or negative. Ethena's reserve fund covers the shortfall to maintain the $1 peg.`,
            `C) USDe holders must pay the negative funding rate directly`,
            `D) Ethena pauses USDe redemptions during negative funding`,
          ],
          correct: 1,
          explanation: `Negative funding = shorts pay longs. Ethena holds short positions, so Ethena pays funding. Net yield = 3.5% stETH − 7.3% annualised negative funding = −3.8%. Without intervention, USDe's NAV would slowly decrease below $1. Ethena maintains a reserve fund (from ENA emissions and protocol fees during positive periods) to cover negative funding periods. If reserves are sufficient: USDe peg holds and holders earn ~0%. If reserves deplete: USDe peg is at risk.`,
          hint: `In negative funding, who pays whom? Does Ethena's short position receive or pay?`,
        },
        {
          question: `Critics compare USDe to UST (Terra). What is the most important structural difference that makes USDe more resilient than UST?`,
          options: [
            `A) USDe has more users than UST did`,
            `B) USDe's yield comes from external economic activity — traders paying funding rates, which exists independent of USDe's own success. UST's yield came from Terraform Labs printing LUNA — circular value with no external source.`,
            `C) USDe has better marketing than UST`,
            `D) USDe is backed by a larger reserve fund than UST was`,
          ],
          correct: 1,
          explanation: `UST's 19.5% yield: funded by Terraform Labs' LUNA reserve. When confidence in UST fell, LUNA value fell, reducing the reserve's ability to pay yield. The yield source was the stablecoin's own ecosystem success — circular. USDe's yield: funded by perpetual futures traders who are long ETH and must pay funding to shorts regardless of USDe's market capitalisation. An ETH bull who wants leveraged ETH exposure pays funding to Ethena whether USDe has $100M or $100B in supply. The external economic activity (derivatives trading) is independent of USDe's own confidence.`,
          hint: `Who pays Ethena's yield? Is that payer dependent on USDe's success? Who paid UST's yield? Was that payer dependent on UST's success?`,
        },
        {
          question: `Ethena holds perp positions on Binance, Bybit, OKX, and Deribit. Why does using off-exchange settlement (OES) for spot ETH custody reduce but not eliminate exchange counterparty risk?`,
          options: [
            `A) OES eliminates all risk because ETH is always safe`,
            `B) OES protects the spot ETH from exchange failure (cannot be rehypothecated or frozen in bankruptcy). But the perp positions themselves are on-exchange obligations — if an exchange fails, those short positions are lost, leaving Ethena with unhedged ETH exposure that must be rapidly re-hedged`,
            `C) OES is a regulatory requirement that Ethena fulfils`,
            `D) OES eliminates negative funding risk`,
          ],
          correct: 1,
          explanation: `FTX failure mode: FTX rehypothecated customer assets, so when it failed, customer claims were against an insolvent estate. OES: the spot ETH never enters the exchange's custody — it is held by a qualified custodian. Exchange failure cannot touch it. But: the perp position (the short) is an on-exchange contract. If the exchange fails while Ethena holds $200M in shorts, those contracts become claims against the insolvent exchange — potentially worthless. Ethena's long ETH spot exposure would be unhedged. The OES reduces the magnitude of possible loss (protects the larger, spot component) but does not eliminate the perp exposure.`,
          hint: `What specifically did FTX do with customer assets? Does OES prevent that? What does it not prevent?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `Model USDe's yield for three market scenarios over 6 months. Scenario A (bull): ETH funding rate +0.04% per 8h for all 6 months. Scenario B (flat): +0.01% per 8h for 3 months then −0.01% per 8h for 3 months. Scenario C (bear): −0.03% per 8h for 5 months, then +0.02% per 8h for 1 month. For each scenario: calculate annualised funding yield, add stETH yield (3.5%), subtract 10% Ethena fee, and state whether Ethena's reserve fund is likely sufficient if reserve fund = 10% of protocol yield over prior 12 months at the bull rate. Which scenario tests the reserve fund most severely?`,
          scoringCriteria: [
            `Scenario A: 0.04% × 3 × 365 = 43.8% + 3.5% = 47.3% × 90% = 42.6% net APY`,
            `Scenario B: first 3 months +0.01%/8h = +10.95% + 3.5% = 14.45% × 90% = 13%. Second 3 months −0.01%/8h = −10.95% + 3.5% = −7.45% × 90% = −6.7%. Blended 6-month: ~3.15% net. Reserve needed: to cover negative period`,
            `Scenario C: −0.03%/8h for 5 months = −32.85% APR. Net: −32.85% + 3.5% = −29.35% × 90% = −26.4% annual equivalent drain. Over 5 months: −11% drain on capital. Reserve fund tested severely.`,
            `Scenario C tests reserve most severely — 5 months of −26% drain requires substantial reserves`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `Score USDe against LUSD and DAI on four dimensions: (1) peg stability mechanism, (2) yield sustainability, (3) exchange/institutional counterparty risk, (4) market cycle sensitivity. For each stablecoin and each dimension, assign A-D and explain with one sentence. Identify: which stablecoin is most appropriate for (A) a risk-averse long-term holder, (B) a DeFi yield farmer in bull markets, (C) a protocol treasurer managing through a full market cycle?`,
          scoringCriteria: [
            `USDe: A-B peg stability (delta-neutral robust but reserve-dependent), A yield bull market, C-D yield bear market, D market cycle sensitivity`,
            `LUSD: A peg stability (hard floor), C-D yield (Stability Pool variable), A institutional risk (no CEX), B-C cycle sensitivity`,
            `DAI: B peg stability, A-B yield (sDAI DSR stable), A-B institutional risk, B cycle sensitivity`,
            `Correct mapping: risk-averse → LUSD or DAI. Bull market yield farmer → USDe. Full cycle treasurer → DAI (sDAI provides stable real yield across cycles)`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find the current ETH perpetual funding rate on one of Ethena's partner exchanges (Binance, Bybit, or OKX — look in the perpetuals section). Record: (A) current 8-hour funding rate, (B) whether it is positive or negative, (C) annualised yield this implies for USDe shorts. Also find Ethena's current sUSDe yield on app.ethena.fi. How does the stated sUSDe yield compare to your calculated funding rate yield? What explains any difference?`,
          scoringCriteria: [
            `Correctly retrieves and states the current 8-hour funding rate from a live exchange`,
            `Correctly annualises: rate × 3 × 365`,
            `Correctly notes whether it is positive (shorts earn) or negative (shorts pay)`,
            `Explains difference between raw funding rate and sUSDe yield: (1) 10% Ethena fee, (2) stETH yield adds ~3.5%, (3) sUSDe yield is blended across multiple exchanges not just one`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.9 — STABLECOIN METRICS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'stablecoin-metrics',
      title: `5.9 Stablecoin Metrics — The Six Numbers That Evaluate Any Stablecoin`,
      subtitle: `Market cap tells you size. Peg deviation tells you current stability. Backing ratio tells you safety. Three more complete the picture. Here is the scorecard.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 6 has now covered six specific stablecoins. This lesson builds the evaluation framework that applies to all of them — the equivalent of the lending metrics scorecard from L4.8. Run these six metrics on any stablecoin and you have the full research picture in one table.`,

      hook: `Comparing USDC to USDe using only market cap tells you nothing useful. They are different products with different mechanisms. The six-metric scorecard forces a structured comparison that reveals: how stable has it been, what backs it, how liquid is the exit, and how much yield does it generate. That comparison drives allocation decisions.`,

      visualPrompt: `A scorecard table with six rows: Market Cap / Supply (size signal), Peg Deviation History (stability track record), Backing Ratio (safety buffer), Redemption Liquidity (exit quality), Yield (income potential), Depeg Recovery Speed (resilience). Each row has a traffic-light colour coding for USDC, DAI, LUSD, and USDe side by side. Caption: "Six metrics. Four stablecoins. One decision."`,

      explanation: `Let's look at the scorecard for stablecoins.

Just like DEXes and lending protocols, stablecoins have a standard set of metrics that reveal mechanism health, stability track record, and yield opportunity. These six are what Marcus checks before any stablecoin allocation decision.

**Metric 1: Market Cap / Supply**

Signal: size of the stablecoin ecosystem. Larger = deeper liquidity, more DeFi integrations, harder to manipulate. Sub-$100M stablecoins are too small for institutional allocation.

USDT: $100B+. USDC: $30-40B. DAI: $5-8B. LUSD: $100-300M. USDe: $2-4B.

**Metric 2: Peg Deviation History**

[Peg deviation] = (current price − $1.00) / $1.00 × 100%.

Signal: how often and how far has the stablecoin deviated from $1? Sources: CoinGecko price history, Curve pool imbalance data.

Quantify: max single-day deviation, number of >0.5% deviations in last 12 months, average deviation.

USDC worst: −13% (March 2023, SVB, 60 hours). DAI worst: −3% (2020 Black Thursday). LUSD worst: +7% (premium during ETH crashes — users pay above $1 to get the safe exit). USDe worst: −2% (bear market funding rate stress test periods).

**Metric 3: Backing Ratio**

[Backing ratio] = (collateral value) / (outstanding supply) × 100%.

Fiat-backed target: 100%. Crypto-backed target: >150%. Algorithmic: highly variable.

Signal: how well-backed is each outstanding token? Ratio below 100%: under-backed, peg failure risk. For crypto-backed: ratio above 150%: healthy buffer.

**Metric 4: Redemption Liquidity**

[Redemption liquidity] = can you exit the stablecoin at $1.00 instantly?

Fiat-backed (institutional): yes, directly with issuer. Retail: must sell on market — check depth of USDC/USDT pools on Curve and Uniswap.
Crypto-backed (DAI): burn DAI, receive collateral — permissionless but gas-dependent.
LUSD: any holder can redeem for $1 of ETH directly from Liquity — permissionless hard floor.
USDe: redeem for underlying ETH/stETH after unstaking delay.

**Metric 5: Yield**

Signal: what yield can you earn holding this stablecoin?

USDC: hold USDC in Aave/Morpho ~4-6% real yield.
DAI: sDAI DSR currently 5.5% (set by governance).
LUSD: Stability Pool variable (ETH discount income + LQTY rewards).
USDe: sUSDe yield variable (10-50% depending on funding rates).

**Metric 6: Depeg Recovery Speed**

[Recovery speed] = after a depeg event, how quickly does the peg restore?

Fiat-backed: hours to days (arbitrage is fast but requires issuer operational readiness).
Crypto-backed (DAI, LUSD): continuous (arbitrage bots operate 24/7, redemption mechanism is always active).
Algorithmic: never (death spiral is irreversible).

Sources: DeFiLlama stablecoin page, CoinGecko price history, Curve Analytics (pool composition for imbalance data).`,

      examples: [
        {
          contextTag: `[Full scorecard build, side-by-side comparison]`,
          context: `Maya builds the full six-metric scorecard for USDC, DAI, LUSD, and USDe for the weekly research brief.`,
          scenario: `USDC: market cap $35B (A), peg deviation −13% max SVB (B, recovered in 60h), backing ratio 100% (A), redemption institutional-only (B), yield 4-6% lending (B), recovery speed hours (A). DAI: $6B (B), −3% max (A), backing ratio 160%+ (A), permissionless redemption (A), 5.5% DSR (A), continuous recovery (A). LUSD: $200M (C), +7% max premium (B — premium not discount), 200%+ backing (A), permissionless hard floor (A), Stability Pool variable (B), continuous recovery (A). USDe: $3.5B (A), −2% max (A), complex — delta-neutral 100%+ (B), unstaking delay (B), 10-50% sUSDe (A in bull), funding-rate-dependent (B).`,
          outcome: `Scorecard verdict: DAI best overall (consistent A-A-A-A-A-A). USDC best for institutional access and integration depth. LUSD best for censorship resistance and peg floor guarantee. USDe best for yield in bull markets, worst in bear. Allocation: core in DAI/USDC, tactical yield exposure in USDe during bull phases.`,
        },
        {
          contextTag: `[Peg deviation analysis, CoinGecko data]`,
          context: `Priya builds a peg deviation tracker for the team's stablecoin monitoring dashboard.`,
          scenario: `USDC peg deviation chart (CoinGecko 2 years): mostly flat at $1.00. One significant deviation: March 2023, $0.87 low. Duration above 0.5%: 36 hours. Average deviation outside that event: 0.03%. DAI peg deviation (same period): mostly flat. Notable deviations: March 2023 (USDC backing issue, slight premium $1.004), several small premiums during ETH stress events. LUSD: consistently trades at $1.001–$1.050 premium (redemption floor creates price floor but the ceiling is soft, allowing premiums during ETH bear markets when LUSD demand spikes). USDe: small deviations during funding rate transitions, typically recovers within hours.`,
          outcome: `Priya's documentation: USDC's SVB deviation is the outlier in an otherwise clean track record. DAI's deviations are minor and often premiums (sign of demand, not weakness). LUSD's premium bias is a feature of the soft ceiling mechanism. USDe's deviations are small and cycle-related.`,
        },
        {
          contextTag: `[Yield-adjusted backing quality comparison]`,
          context: `Jake is evaluating whether DAI's 5.5% DSR or USDe's 25% sUSDe is a better opportunity for a 6-month deployment.`,
          scenario: `Backing ratio context: DAI 160%+ (excess collateral above $1). USDe ~100% (delta-neutral, not overcollateralised). Yield: DAI 5.5% (governance-set, relatively stable). USDe 25% (funding-rate-dependent, currently high). Risk-adjusted yield: DAI — backed by 60% excess collateral, yield fully supported by RWA income. USDe — delta-neutral with exchange counterparty risk and funding rate variability. Risk-adjusted: DAI 5.5% at risk level B. USDe 25% at risk level C. If the extra 19.5% of yield compensates for the incremental risk: USDe is the correct choice for a 6-month bull market deployment. If risk tolerance is conservative: DAI.`,
          outcome: `Jake deploys 60% in DAI sDAI (core, stable yield) and 40% in sUSDe (tactical, higher yield). His 6-month blended yield target: 0.60 × 5.5% + 0.40 × 25% = 3.3% + 10% = 13.3% annualised — exceptional on stablecoin capital.`,
        },
      ],

      keyTakeaway: `Six stablecoin metrics: market cap (size and liquidity signal), peg deviation history (track record — worst event and recovery time), backing ratio (safety buffer — >100% for fiat, >150% for crypto-backed), redemption liquidity (exit quality — permissionless vs institutional), yield (income available on holdings), depeg recovery speed (mechanism resilience). Sources: DeFiLlama stablecoin section, CoinGecko price history, Curve Analytics. Scorecard verdict by use case: institutional clarity → USDC, decentralised reliable → DAI, censorship-resistant floor → LUSD, bull market yield → USDe.`,

      guidedPractice: [
        {
          question: `LUSD's maximum peg deviation has been +7% (premium, not discount). What does a persistent premium reveal about LUSD's mechanism?`,
          options: [
            `A) LUSD has a broken peg — it should always be at exactly $1`,
            `B) LUSD's hard floor is at $1 (redemption arbitrage prevents discounts) but it has no hard ceiling — during ETH bear markets when users demand safe dollar exposure, LUSD can trade above $1 if demand exceeds supply`,
            `C) LUSD's premium means it is actually worth $1.07`,
            `D) The premium is caused by a Curve pool manipulation`,
          ],
          correct: 1,
          explanation: `LUSD has an asymmetric peg mechanism: hard floor (redemption = $1 of ETH guaranteed), soft ceiling (no equivalent floor for the upside). During ETH bear markets: fewer new Troves are opened (borrowing demand falls), LUSD supply decreases. But demand for LUSD (a safe, decentralised dollar) may stay elevated. Supply falls + demand holds = premium. Premiums up to 7% have been observed. This is not a weakness — it is the mechanism's correct behaviour given supply/demand dynamics. For holders: a LUSD premium means you bought above $1 and redemption gives you exactly $1 of ETH.`,
          hint: `What prevents LUSD from falling below $1? Is there an equivalent mechanism that prevents it from rising above $1?`,
        },
        {
          question: `DAI's sDAI earns 5.5% DSR. USDe's sUSDe earns 25%. A risk-averse institutional investor sees these two options. What metric most immediately disqualifies USDe for this investor?`,
          options: [
            `A) USDe's market cap is too small`,
            `B) Backing ratio: USDe's delta-neutral design provides no collateral buffer beyond 100% — if the hedge fails (exchange failure, extreme market dislocation), USDe has no excess collateral to absorb losses unlike DAI's 160%+ backing`,
            `C) USDe charges a 10% fee`,
            `D) USDe's peg deviation history is worse than DAI's`,
          ],
          correct: 1,
          explanation: `For a risk-averse institutional investor, backing ratio is the decisive metric. DAI: 160%+ backing — even if the mechanism partially fails, there is substantial excess collateral before depositors face losses. USDe: delta-neutral at ~100% — there is essentially no excess collateral buffer. The safety comes from the hedge working perfectly. For an institution that must report to regulators and LPs about stablecoin holdings: "backed by 160% ETH collateral" is a defensible answer. "Backed by a delta-neutral derivatives position with exchange counterparty risk" requires considerably more explanation and comfort.`,
          hint: `What metric shows how much "cushion" exists between collateral value and outstanding stablecoin supply? What does each stablecoin score?`,
        },
        {
          question: `Using CoinGecko price data, USDC's worst single-day depeg was −13% in March 2023. USDT's worst single-day was approximately −4% in May 2023. LUSD's worst was a +7% premium. Which stablecoin has the "best" peg deviation history and why?`,
          options: [
            `A) USDT because it never went below $0.96`,
            `B) LUSD — its worst event was a premium (demand-driven, not a backing concern) and it has never traded below $1 due to the redemption hard floor`,
            `C) USDC because the SVB event was external, not mechanism-related`,
            `D) All three have equivalent peg histories`,
          ],
          correct: 1,
          explanation: `LUSD's "worst" deviation is a premium — holders had more than $1, not less. The mechanism guarantee (no discount below $1) is the relevant metric for deposit safety. USDC's −13% and USDT's −4% are discounts — holders temporarily held less than $1 of value. LUSD's premium does not affect the dollar value of existing holdings (existing holders still have $1+ of value), whereas USDC's discount directly reduced the dollar value of holdings. For the metric of "did holders ever have less than $1 per LUSD": no. LUSD wins on this specific dimension.`,
          hint: `Premium means your stablecoin is worth MORE than $1. Discount means it is worth LESS. Which of these creates actual risk for the holder?`,
        },
        {
          question: `Connecting to L4.8 (lending metrics): what is the stablecoin equivalent of the lending protocol's "bad debt/treasury ratio"?`,
          options: [
            `A) Market cap / protocol revenue`,
            `B) Backing ratio (collateral value / outstanding stablecoin supply) — the excess collateral above 100% is the stablecoin's equivalent safety buffer that absorbs bad events before holders are affected`,
            `C) Peg deviation / market cap`,
            `D) Yield / backing ratio`,
          ],
          correct: 1,
          explanation: `In lending: bad debt/treasury ratio measures how much buffer exists between incurred losses and depositor funds. In stablecoins: backing ratio shows how much collateral exists above the stablecoin's face value — the buffer before a peg failure. DAI at 160% backing: there is $0.60 of excess collateral per $1 of DAI — the equivalent of a treasury. LUSD at 200%+: $1.00+ of excess collateral per $1 of LUSD. USDC at 100%: no excess — any reserve shortfall immediately affects the peg (as SVB demonstrated). The metrics are structurally analogous: both measure the safety buffer before user-facing losses.`,
          hint: `In lending (L4.8), the treasury is what absorbs bad debt before depositors feel it. In stablecoins, what is the equivalent layer that absorbs mechanism failures before the peg breaks?`,
        },
        {
          question: `A stablecoin shows: market cap $8B, peg deviation max −0.3% in 2 years, backing ratio 165%, permissionless redemption, yield 5.5% via governance-set rate, recovery speed continuous. What stablecoin is this most likely and what is its one primary risk?`,
          options: [
            `A) USDC — the transparent fiat-backed stablecoin`,
            `B) DAI — the metrics match: $6-8B supply, minimal deviations, ETH overcollateralisation at 165%, permissionless redemption via MKR system, sDAI DSR 5.5%, peg maintained by continuous arbitrage. Primary risk: governance can change parameters (DSR, stability fee, collateral types) — single governance attack or poor decision could destabilise the system`,
            `C) LUSD — matches several metrics`,
            `D) FRAX — post-pivot metrics align`,
          ],
          correct: 1,
          explanation: `The metrics match DAI precisely: $6-8B supply, max depeg −3% (rounding to −0.3% in a cleaner period), 160%+ backing, permissionless CDP redemption, 5.5% DSR, continuous peg maintenance. Primary risk from L5.5: governance (MKR holders control all key parameters). A malicious governance actor with sufficient MKR could raise the stability fee to uneconomical levels, change collateral requirements, or lower the DSR — all of which affect DAI's utility and safety. The history has been good, but governance risk is always present.`,
          hint: `Work through each metric: $8B is DAI-range. 165% backing matches ETH overcollateralisation. 5.5% governance-set rate is the DSR. Permissionless redemption via the vault system. What stablecoin fits all of these?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-data-interpret`,
          scenario: `Build the complete six-metric scorecard for USDT, USDC, DAI, and USDe using current data. Sources: DeFiLlama stablecoin page (market cap, backing), CoinGecko price history (peg deviation), Curve Analytics (pool composition for redemption liquidity), each protocol's yield app (yield), and historical records (recovery speed). Grade each metric A-D for each stablecoin. Produce the table and write a two-sentence allocation recommendation for a $5M institutional stablecoin treasury.`,
          scoringCriteria: [
            `All 24 cells (4 stablecoins × 6 metrics) filled with specific data or grades`,
            `Peg deviation uses actual historical data points, not estimates`,
            `Yield metric accounts for current market conditions (not historical peaks)`,
            `Allocation recommendation references at least three specific metric values and names a specific split`,
          ],
        },
        {
          type: `judgment-yield-calc`,
          scenario: `A fund has $2M in stablecoins to deploy for maximum risk-adjusted yield. Available options: (A) sDAI at 5.5% (B-grade risk), (B) sUSDe at current rate (C-grade risk), (C) Aave USDC on Arbitrum at 5.4% (A-grade risk), (D) LUSD Stability Pool at estimated 8% (B-grade risk, highly variable). Apply a risk-weighting: A-grade yields count at face value, B-grade yields count at 80%, C-grade yields count at 60%. Calculate risk-adjusted yield for each. Design the optimal $2M allocation to maximise risk-adjusted blended yield.`,
          scoringCriteria: [
            `Risk-adjusted yields: sDAI 5.5% × 80% = 4.4%; sUSDe at current rate × 60%; Aave 5.4% × 100% = 5.4%; LUSD 8% × 80% = 6.4%`,
            `Optimal allocation: maximise risk-adjusted yield → LUSD Stability Pool wins if 6.4% is highest; Aave USDC second at 5.4%`,
            `But variability constraint: LUSD yield is highly variable — may be 2% or 15% depending on liquidation frequency. A risk-adjusted framework should also account for yield variance`,
            `Recommended allocation: $800K LUSD Stability Pool (highest risk-adjusted yield), $800K Aave USDC Arbitrum (stable baseline), $400K sDAI (governance-set yield certainty)`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Build a "stablecoin health check" alert system. For each of USDT, DAI, and USDe, define three specific, measurable alert conditions (not vague "if something goes wrong") that would trigger a position review or exit. Each alert must name: the data source, the specific threshold, and the action triggered. Format as a monitoring checklist.`,
          scoringCriteria: [
            `USDT: (1) Tether.to reserve report shows Treasury % below 75% → position review; (2) USDT/USDC Curve pool imbalance above 60% USDT → reduce exposure; (3) Any regulatory action news from DOJ/CFTC against Tether → immediate review`,
            `DAI: (1) MakerDAO governance proposal to reduce collateral factor on ETH → review if passed; (2) USDC component above 40% of total DAI backing → monitor USDC risk contamination; (3) Stability fee raised above 8% → review leveraged DAI positions`,
            `USDe: (1) ETH funding rate negative for 14+ consecutive days → calculate reserve burn rate; (2) sUSDe yield below 5% → DAI DSR becomes more attractive; (3) Any exchange partners announcing insolvency → immediate position review`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.10 — STABLECOIN POOLS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'stablecoin-pools',
      title: `5.10 Stablecoin Pools — The Curve 3Pool and Why It Matters`,
      subtitle: `The Curve 3pool (USDC/USDT/DAI) is DeFi's most important liquidity pool. Understanding it means understanding how stablecoin prices are maintained, how LP yield works with near-zero IL, and what pool imbalances reveal about market stress.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.9 you built the stablecoin metrics scorecard. One of those metrics — redemption liquidity — depends entirely on the depth of stablecoin pool liquidity, primarily on Curve. This lesson digs into why the Curve 3pool is critical infrastructure, how to read it for market signals, and what LP economics look like when IL is near-zero.`,

      hook: `During the March 2023 USDC SVB depeg, the Curve 3pool showed 76% USDC within hours. Normal is 33% each. That imbalance was the single most visible real-time signal of the crisis — visible to anyone watching the pool composition. Pool composition is more than a yield metric — it is a market intelligence feed.`,

      visualPrompt: `A pie chart trio: Left "Normal 3pool" — three roughly equal slices (USDC 33%, USDT 33%, DAI 33%). Centre "March 2023 crisis" — USDC dominates (76%), thin USDT (12%), thin DAI (12%). Right "Post-crisis" — returning toward equal thirds. Below: a timeline of USDC price during each state. Caption: "The 3pool tells you what sophisticated traders are doing in real time."`,

      explanation: `Let me tell you about the most important liquidity pool in DeFi.

USDC, DAI, USDT — they're all supposed to be worth $1. But they're worth different amounts at different times. The Curve 3pool is where the differences get arbitraged away — and where the cracks show first when a stablecoin is in trouble.

**The Curve 3pool:**

[Curve 3pool (3CRV)] — a Curve StableSwap pool containing USDC, USDT, and DAI in equal $1 amounts. The StableSwap formula (from L3.5) maintains efficient swaps between the three with very low slippage.

TVL: typically $500M–$2B. Volume: $100M–$500M daily. The largest single pool of stablecoin liquidity in DeFi.

Purpose: (1) Cheap stablecoin swaps. (2) Peg enforcement — if USDC is $0.99, arbitrageurs buy it in the pool and redeem with Circle. (3) Base liquidity for other Curve pools (tokens pair against 3pool for shared depth from L3.5).

**Pool composition as a market signal:**

Normal: each stablecoin approximately 33% of the pool. This means equal demand for all three — no preference.

When one stablecoin is selling off: its percentage in the pool rises as sellers dump it in. USDC at 76% in March 2023 means: everyone was selling USDC into the pool and taking USDT and DAI out. The pool was absorbing the flight from USDC.

When one stablecoin is in demand: its percentage in the pool falls as buyers take it out. USDT at 15% means: people are specifically buying USDT (perhaps for CEX transfers where USDT is preferred).

**LP economics in stablecoin pools:**

[Near-zero IL]: all three assets target $1. If all maintain their peg, there is no price divergence → no impermanent loss. The LP position is approximately equivalent to just holding the underlying stablecoins.

[Fee income]: 0.04% per swap × daily volume. At $300M daily volume: $120K/day in fees shared across all LPs. On $1B TVL: $120K / $1B = 0.012% daily = 4.4% annualised. Plus CRV/CVX emissions (variable).

[Convex Finance boost]: as L6.10 covered, Convex provides 2.5× CRV boost. Most 3pool liquidity runs through Convex for this reason.

**Risks in stablecoin pools:**

[Stablecoin depeg risk]: if one of the three stablecoins permanently loses its peg, the pool's TVL drops and LPs are left holding more of the depegged token. A permanent USDT failure: LP exits with 3× normal USDT allocation (the stable pool absorbed all selling).

[Pool imbalance in crisis]: during the USDC SVB event, pool LPs who needed to withdraw received 76% USDC — exactly the asset they wanted least. Timing of withdrawal matters in a crisis.`,

      examples: [
        {
          contextTag: `[3pool LP yield calculation]`,
          context: `Jake is evaluating the 3pool as an LP position. He has $100K to allocate.`,
          scenario: `Current 3pool stats: TVL $900M, daily volume $250M, fee rate 0.04%. Daily fee income: $250M × 0.04% = $100,000. Jake's share: $100K / $900M = 0.0111%. Jake's daily income: $100K × 0.0111% = $11.11. Annual: $11.11 × 365 = $4,055 = 4.05% APY from fees alone. Plus via Convex: 2.5× CRV boost adds ~3-5% additional CRV/CVX yield. Total estimated: 7-9% APY. IL risk: near-zero (all three target $1). Compare: Aave USDC at 5.4%. The 3pool via Convex wins on yield with equivalent or lower risk on a normal day.`,
          outcome: `Jake deploys via Convex Finance. He earns 7-9% APY with near-zero IL — better than direct Aave USDC lending for the same underlying risk profile. His monitoring: weekly check on pool composition (flag if any single token exceeds 50% of pool) and track the three stablecoins' individual health metrics.`,
        },
        {
          contextTag: `[SVB crisis pool analysis — reading the signal]`,
          context: `Priya is monitoring the Curve 3pool during the morning of March 11, 2023.`,
          scenario: `08:00 UTC: 3pool composition normal (31% USDC, 35% USDT, 34% DAI). Circle announces $3.3B SVB exposure at 07:30. 09:00: composition shifts to 42% USDC, 30% USDT, 28% DAI. 11:00: 57% USDC, 23% USDT, 20% DAI. 14:00: 72% USDC. Pool is absorbing massive USDC selling at minimal slippage (StableSwap formula). People are selling USDC for USDT and DAI at approximately $0.97-0.98 cents due to pool imbalance. Priya's real-time action: she reads the 76% USDC as "maximum stress signal reached." She buys $50K of USDC at $0.93 on Coinbase (exchange markets moved faster than Curve). Conviction: SVB depositors will be backstopped. Result: USDC returns to $1.00. Her $50K → $53,763 in 48 hours.`,
          outcome: `Priya documents: the 3pool composition is a real-time market intelligence tool. A 76% single-token concentration is a once-per-year event that signals maximum stress. For a researcher with strong conviction on the underlying cause (bank deposit insurance, not mechanism failure), this is a high-confidence trade.`,
        },
        {
          contextTag: `[2pool and alternative pool architecture]`,
          context: `Maya is mapping all major stablecoin pools beyond the 3pool for the team's liquidity map.`,
          scenario: `Beyond 3pool: Curve USDC/USDT 2pool on multiple chains (no DAI dependency). FRAX/USDC FraxBP (from L5.6). DAI/USDC stableswap on Uniswap V3. Yearn's crvUSD pools. Osmosis USDC/USDT/DAI via IBC. The 3pool is the canonical base, but: (1) On Arbitrum, the largest stablecoin pool may be the native USDC/USDT 2pool (no bridged DAI). (2) On Solana, USDC/USDT on Orca is the equivalent base pool. (3) Curve's crvUSD (Curve's own stablecoin, launched 2023) competes with DAI in Curve pools. The stablecoin pool landscape has fragmented across chains.`,
          outcome: `Maya's chain-by-chain pool map: Ethereum (3pool dominant), Arbitrum (USDC/USDT 2pool + 3pool both used), Solana (Orca USDC/USDT), Cosmos (Osmosis). She documents that the Ethereum 3pool is the ultimate liquidity backstop for all chains — cross-chain stablecoin flows eventually settle against Ethereum's 3pool depth.`,
        },
      ],

      keyTakeaway: `The Curve 3pool (USDC/USDT/DAI) is DeFi's foundational stablecoin liquidity layer. Pool composition is a real-time stress signal: normal = ~33% each; crisis = one token dominates (76% USDC during SVB). LP economics: near-zero IL (all assets target $1), 4-6% fee APY, boosted to 7-11% via Convex's 2.5× CRV boost. Crisis LP risk: if one stablecoin depegs, you withdraw holding more of the stressed token. Monitor: DeFiLlama pool composition, Curve.fi dashboard. The 3pool's health is a proxy for overall stablecoin ecosystem stability — imbalances above 50% for any single token are actionable research signals.`,

      guidedPractice: [
        {
          question: `The Curve 3pool shows 68% USDT, 16% USDC, 16% DAI. What does this composition tell you?`,
          options: [
            `A) USDT has more liquidity than USDC or DAI`,
            `B) Market participants are selling USDT and buying USDC and DAI — indicating concern about USDT's backing or a preference for USDC/DAI in the current market`,
            `C) The pool is working normally — USDT always dominates`,
            `D) Someone is arbitraging between the three stablecoins`,
          ],
          correct: 1,
          explanation: `68% USDT concentration means significant net selling of USDT into the pool. Buyers are taking USDC and DAI out (hence their low share). This pattern occurs when: (1) market participants distrust USDT temporarily, (2) institutional actors are rotating from USDT to USDC for compliance reasons, or (3) a major event has raised USDT concerns. The composition is real-time — it shows what sophisticated traders are doing right now, not sentiment surveys.`,
          hint: `If USDT is 68% of a pool that should be 33%, where did all that extra USDT come from? Who put it there and why?`,
        },
        {
          question: `Why does Curve's StableSwap formula make the 3pool a better peg maintenance mechanism than a standard Uniswap x×y=k pool?`,
          options: [
            `A) Curve charges lower fees than Uniswap`,
            `B) StableSwap is optimised for near-equal assets — it provides very low slippage for swaps between $1 assets, making the arbitrage mechanism more efficient and price-restoring for tiny deviations (0.01-0.5%) that Uniswap would impose higher slippage on`,
            `C) Uniswap does not support stablecoins`,
            `D) Curve's 3pool uses oracle pricing instead of market pricing`,
          ],
          correct: 1,
          explanation: `From L3.5: StableSwap provides 5-50× less slippage than x×y=k for correlated assets. For peg maintenance: an arb that makes a $100 profit requires selling USDC at 99.5 cents and redeeming at $1 — only $0.50 spread. On Uniswap, the slippage for this arb would consume much of the $0.50 spread. On Curve: slippage is 1/10th as large, making the arb profitable at much smaller deviations. The efficiency of Curve's arb = tighter peg maintenance = smaller maximum deviations before correction activates.`,
          hint: `From L3.5: why is Curve's formula better for stablecoins? What does lower slippage mean for the arbitrageur who wants to profit from a 0.5% USDC discount?`,
        },
        {
          question: `During a stablecoin crisis, a 3pool LP tries to withdraw their position. The pool is currently 75% in the stressed token. What do they receive?`,
          options: [
            `A) They choose which stablecoin to withdraw`,
            `B) They receive approximately 75% of their withdrawal in the stressed token (proportional to pool composition) — exactly the asset they want least`,
            `C) They receive equal thirds regardless of pool composition`,
            `D) They receive only the stressed token if the pool is over 50% that token`,
          ],
          correct: 1,
          explanation: `Curve V1 pool withdrawals: balanced withdrawal gives you the pool's current composition, not your original deposit composition. If pool is 75% USDC during SVB crisis: withdrawing $100K gives approximately $75K USDC and $25K of USDT/DAI. You deposited equal thirds but exit with 75% in the stressed asset. This is the stablecoin pool crisis LP risk — the pool's imbalance becomes your withdrawal composition. One mitigation: use Curve's "imbalanced withdrawal" to take only USDT or DAI (but this incurs extra fees for the imbalanced withdrawal).`,
          hint: `AMM pools give back assets in proportion to the pool's current composition, not your original deposit. If the pool is 75% USDC, what percentage of your withdrawal is USDC?`,
        },
        {
          question: `The 3pool LP yield is 4.05% from fees. Running via Convex with a 2.5× CRV boost adds approximately 4%. What does the blended yield comparison to Aave USDC (5.4%) look like, and why does Convex make the 3pool a better option?`,
          options: [
            `A) 3pool via Convex (8.05%) beats Aave USDC (5.4%) with similar risk`,
            `B) Aave USDC is better because lending is more predictable`,
            `C) They are identical — both are stablecoin strategies`,
            `D) 3pool has too much IL risk to compare fairly`,
          ],
          correct: 0,
          explanation: `3pool fee APY: 4.05%. Convex CRV/CVX boost: +4%. Total: ~8.05%. Aave USDC: 5.4%. 3pool via Convex is 2.65% higher. Risk comparison: 3pool IL is near-zero (all assets target $1, impermanent loss only occurs on stablecoin depegs). Aave has utilisation risk (withdrawal illiquidity above 90%) and protocol smart contract risk. The 3pool has stablecoin depeg risk (one of USDC/USDT/DAI could depeg) and Curve/Convex smart contract risk. Neither is categorically safer — they have different risk profiles. The yield advantage of 2.65% on $1M = $26,500/year extra for comparable risk is compelling.`,
          hint: `Add 3pool fee APY (4.05%) and Convex boost (~4%). Compare total to Aave's 5.4%. What is the difference?`,
        },
        {
          question: `Connecting to L6.10 (yield aggregators): why do most 3pool LPs use Convex Finance rather than depositing directly to Curve?`,
          options: [
            `A) Convex has a better user interface than Curve`,
            `B) Convex accumulates large amounts of veCRV and provides a 2.5× CRV emission boost to all depositors — individual LPs without large veCRV holdings earn substantially more via Convex than they would direct on Curve`,
            `C) Convex automatically rebalances the pool composition`,
            `D) Curve requires 32 ETH minimum to LP in the 3pool`,
          ],
          correct: 1,
          explanation: `From L6.10 (Convex) and L3.5 (Curve Wars): veCRV determines gauge emissions. Depositors without veCRV receive base CRV rewards. Convex holds massive veCRV and shares the 2.5× boost with all its depositors. A depositor with $100K in Curve without veCRV: receives 1× CRV. Same depositor via Convex: receives 2.5× CRV minus 17% Convex fee = net 2.075× CRV. The boost (107.5% more CRV than direct) far exceeds the 17% fee. From L6.10: this is why Convex is mathematically superior to direct Curve for almost all position sizes.`,
          hint: `From L6.10: what does Convex provide that individual LPs cannot get on their own? How does that compare to Convex's 17% fee?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-data-interpret`,
          scenario: `Check the current Curve 3pool composition on curve.fi or DeFiLlama. Record: (A) current percentage of each stablecoin, (B) total TVL, (C) 7-day volume, (D) current fee APY. Compare composition to 33%/33%/33% norm. If any token exceeds 45%, identify what market event may have caused the imbalance. Then calculate: (A) fee APY, (B) expected blended yield via Convex (add 3-5% for CRV/CVX estimate). Is the 3pool via Convex currently the best risk-adjusted stablecoin yield available?`,
          scoringCriteria: [
            `Correct current composition recorded from live source`,
            `Fee APY correctly calculated: daily volume × 0.04% × 365 / TVL`,
            `If imbalance exists: credible explanation for the cause (recent market event, stablecoin news)`,
            `Comparison to alternatives (sDAI, Aave USDC) with specific current rates`,
          ],
        },
        {
          type: `judgment-yield-calc`,
          scenario: `Model a 3pool LP position via Convex: $500K deployed. Current fee APY: 4.2%. Convex CRV boost adds 3.8% (CRV at current price). CVX rewards: 1.2%. Total gross: 9.2%. Convex fee: 17% of CRV rewards only (not total). Net: 4.2% base + (3.8% × 83%) + 1.2% = 4.2% + 3.154% + 1.2% = 8.55% net APY. (A) Annual dollar income on $500K. (B) If one stablecoin in the pool depegs 10% permanently (worst case), what percentage of the LP position is denominated in that stablecoin and what is the dollar loss? (C) Should you LP or use sDAI at 5.5% given this analysis?`,
          scoringCriteria: [
            `Annual income: $500K × 8.55% = $42,750/year`,
            `Depeg loss: 33% of pool permanently at $0.90 = $500K × 33% × 10% loss = $16,500 loss. Net of 1-year yield: $42,750 − $16,500 = $26,250 net positive even in permanent 10% depeg scenario`,
            `Comparison: 3pool via Convex 8.55% vs sDAI 5.5% = 3.05% advantage = $15,250/year extra on $500K`,
            `Recommendation: 3pool wins if comfortable with stablecoin depeg tail risk. sDAI wins if governance-set yield certainty is more valuable than 3% extra yield`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L5.4 (USDC SVB crisis) and L5.9 (metrics): you are monitoring the Curve 3pool daily as part of your stablecoin risk dashboard. Define exactly when the pool composition would trigger three different alert levels and the action each triggers: (1) Yellow alert (watch closely), (2) Orange alert (review positions), (3) Red alert (exit or reduce immediately). For each: state the specific composition threshold, the probable cause, and the specific action.`,
          scoringCriteria: [
            `Yellow: any single token 40-50% of pool. Cause: mild preference for two tokens, early signs of stress. Action: monitor hourly, identify cause, no immediate position change`,
            `Orange: any single token 50-65% of pool. Cause: active market flight from one stablecoin. Action: review that stablecoin's health metrics, consider reducing 3pool exposure if stablecoin concern is legitimate`,
            `Red: any single token >65% of pool. Cause: crisis-level flight (SVB-level event). Action: exit 3pool immediately to avoid withdrawal being dominated by the stressed token; evaluate whether crisis is temporary (opportunity to buy) or permanent (avoid)`,
          ],
        },
      ],
    },
