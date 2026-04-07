// ============================================================================
// SIFTER SKILLUP — DeFi RESEARCH ANALYST Career Track
// Lab 6: Stablecoins Deep Dive (Part C — Lessons 5.11–5.15)
// Append after Part B lessons, then add aggregateSimulations + bossMode
// ============================================================================

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.11 — DEPEGS AND RISKS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'depegs-and-risks',
      title: `5.11 Depegs and Risks — Case Studies from USDC, UST, and USDT`,
      subtitle: `Every major stablecoin has depegged at least once. Each event revealed something about the mechanism's limits. Here are the three most instructive cases.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.9 you built the stablecoin metrics scorecard including peg deviation history. This lesson fills in that history — three depeg events in detail, what caused each, how the market responded, and what it reveals about each mechanism's specific failure condition.`,

      hook: `USDT depegged to $0.95 in 2018 and recovered in days. USDC depegged to $0.87 in March 2023 and recovered in 60 hours. UST depegged to $0.003 in May 2022 and never recovered. Three similar-sounding events. Three completely different causes. Three completely different outcomes. The mechanism tells you which recovery is possible.`,

      visualPrompt: `Three depeg charts side by side: USDT 2018 (dips to $0.95, recovers over 7 days — steady staircase recovery), USDC March 2023 (sharp spike down to $0.87, V-shape recovery in 60 hours), UST May 2022 (cliff drop from $1.00 to $0.003, no recovery line). Below each: "Recovery mechanism" label. USDT: "reserve quality clarification." USDC: "Fed backstop confirmation." UST: "none — death spiral." Caption: "Same word 'depeg.' Three different stories."`,

      explanation: `Let me tell you about the days when stablecoins weren't stable.

Stablecoins are supposed to be worth $1. But every major stablecoin has traded at a different price at some point. The critical question is not whether a depeg happened — it is what mechanism caused it and whether recovery is structurally possible.

**Case Study 1: USDT October 2018 — Reserve Concern Depeg**

[Cause]: Crypto exchange Bitfinex faced banking problems. Tether and Bitfinex shared banking relationships. Rumours spread that Tether's reserves were not fully backed — potentially the first major public questioning of USDT's reserves.

[Price action]: USDT fell from $1.00 to $0.95 on major exchanges over October 11–15 2018.

[Recovery mechanism]: arbitrageurs bought USDT at $0.95 and redeemed with Tether at $1.00. As redemptions demonstrated that the mechanism worked, confidence restored. Full recovery over 7 days.

[Lesson]: fiat-backed stablecoin depegs caused by confidence concerns (not actual insolvency) are recoverable through demonstrated redemption. The arbitrage mechanism worked even when sentiment was negative.

**Case Study 2: USDC March 2023 — Bank Failure Depeg**

[Cause]: Silicon Valley Bank failed on March 10. Circle disclosed $3.3B of USDC reserves were held at SVB — 8% of total backing. Unknown whether those funds would be recovered.

[Price action]: USDC fell from $1.00 to $0.87 on exchange markets over 36 hours. Peak imbalance in Curve 3pool: 76% USDC.

[Recovery mechanism]: March 12, US government (FDIC/Fed) announced all SVB depositors would be made whole. Circle confirmed full reserve recovery. USDC returned to $0.998 within hours of the announcement.

[Lesson]: fiat-backed stablecoin depegs caused by specific, verifiable events (bank failure with known resolution pathway) can be evaluated analytically. The peg broke not because the mechanism failed, but because the specific backing was temporarily uncertain. Recovery depended on external political decision.

**Case Study 3: UST May 2022 — Death Spiral**

[Cause]: large coordinated selling of UST on Curve triggered the algorithmic mechanism (burn UST, mint LUNA) which flooded LUNA supply, crashed LUNA price, reduced the backing value of new UST mints, created further UST selling.

[Price action]: UST fell from $1.00 on May 7 to $0.003 by May 13. LUNA fell from $80 to $0.0001 in the same period. 6.5 trillion new LUNA tokens minted trying to defend the peg.

[Recovery mechanism]: none. Algorithmic stablecoins have no recovery mechanism for a death spiral. Once LUNA's price falls sufficiently, the mechanism that is supposed to stabilise UST becomes the mechanism that destroys it. The cycle is self-reinforcing. No amount of minting new LUNA can restore confidence once lost.

[Lesson]: algorithmic stablecoin depegs are categorically different. Recovery is not possible without external capital injection (which never came for UST). Mechanism type determines recovery possibility — this is the most important classification in stablecoin research.

**Depeg severity framework:**

Level 1 — Temporary sentiment depeg (USDT 2018): arbitrage recovers in days. Cause: confidence concern, not mechanism failure.
Level 2 — Event-driven specific depeg (USDC 2023): recovers when specific event resolves. Cause: identifiable, bounded risk event.
Level 3 — Mechanism failure (UST 2022): no recovery. Cause: fundamental design flaw activated at scale.

Always classify before deciding whether to hold through a depeg or exit.`,

      examples: [
        {
          contextTag: `[Live depeg response decision, USDC SVB event]`,
          context: `Priya is at her desk on Saturday March 11, 2023. USDC is at $0.92 on Coinbase. She has $200K in USDC across several protocols.`,
          scenario: `Priya applies the depeg classification framework immediately. Key facts: (1) Cause is known and specific: Circle has $3.3B in SVB. (2) SVB is a regulated US bank — FDIC insured up to $250K, but Circle's $3.3B far exceeds FDIC limits. (3) Historical precedent: US government has previously backstopped systemically important financial institution failures (2008 precedent). (4) The 8% shortfall at worst case means USDC floor is $0.9175. Current market price $0.92 implies the market is at the mathematical worst case. Classification: Level 2 depeg — event-driven with identifiable resolution pathway. Decision: hold and potentially buy. Priya buys $50K USDC at $0.92 with conviction on the government backstop.`,
          outcome: `March 12: Fed backstop announced. USDC recovers to $0.998 by Monday. Priya's $50K is worth $54,348. Her $200K existing position that depegged to $184K is back to $199.6K. The classification framework gave her the conviction to act correctly rather than panic-sell.`,
        },
        {
          contextTag: `[UST death spiral — the 72-hour anatomy]`,
          context: `Maya is rebuilding the UST collapse timeline for the research library.`,
          scenario: `May 7: Entity sells $285M UST on Curve → UST breaks below $1. Terra Foundation starts buying UST using BTC reserves ($3.5B held). May 8: UST at $0.98. Foundation uses 3 billion in BTC reserves. But selling continues. May 9: BTC reserves depleted — no more ammo for direct UST purchases. Algorithm kicks in: burn UST, mint LUNA. LUNA at $30. May 10: $10B of new LUNA minted. LUNA at $15 (−50%). May 11: $100B LUNA minted. LUNA at $3. May 12: LUNA supply hits 1 trillion tokens. LUNA at $0.10. May 13: UST at $0.003. LUNA at $0.0001. 6.5 trillion LUNA total. The mechanism that was supposed to save UST printed so much LUNA that LUNA became worthless — and with it, the "backing" for UST minting.`,
          outcome: `Maya's analysis: the death spiral had a clear point of no return. When BTC reserves were depleted (May 9), the only remaining defence was the algorithmic mechanism. But the algorithmic mechanism required LUNA to maintain value to provide backing. As LUNA was minted to defend UST, LUNA fell. As LUNA fell, the backing weakened. As backing weakened, confidence fell. Each step worsened the next — a perfectly self-reinforcing collapse.`,
        },
        {
          contextTag: `[Cross-stablecoin contagion during UST collapse]`,
          context: `Jake studies how the UST collapse affected other stablecoins.`,
          scenario: `May 9-14 2022: UST collapsing. Market fear spreads: "if UST can fail, can other algorithmic stablecoins?" FRAX (85% USDC, 15% FXS algorithmic): depegs to $0.975 despite 85% real backing. DAI: briefly trades at $0.99 as USDC (one of DAI's collateral assets) faces redemption pressure. USDT: briefly dips to $0.97 as crypto market panic hits all stablecoins. Even USDC: faces slight pressure. The classification: FRAX/$DAI/USDT depegs = Level 1 (sentiment contagion, not mechanism failure). All recover within days. UST: Level 3 (mechanism failure, no recovery). The contagion test: which stablecoins had real backing to arbitrage against? Those with real backing recovered. UST had no real backing floor — it did not.`,
          outcome: `Jake documents: the 2022 contagion period created buying opportunities in FRAX, DAI, and USDT for researchers who understood the classification. The sentiment depeg in these stablecoins was entirely recoverable — buying at $0.975 was pure arbitrage for someone who understood the mechanism.`,
        },
      ],

      keyTakeaway: `Three depeg archetypes: Level 1 (sentiment/confidence — USDT 2018, $0.95, recovers in days via demonstrated redemption), Level 2 (specific event — USDC 2023, $0.87, recovers when specific risk resolves), Level 3 (mechanism failure — UST 2022, $0.003, no recovery pathway). Classification drives response: Level 1/2 depegs are potential buying opportunities for researchers with mechanism understanding. Level 3 depegs are permanent losses — never hold through. The mechanism type is the first input: fiat-backed depegs are recoverable if reserves are real; algorithmic depegs are terminal. Classify before acting.`,

      guidedPractice: [
        {
          question: `USDC depegs to $0.91 on a Saturday morning due to news about a Circle banking partner. What information do you need before deciding whether to hold, buy, or sell?`,
          options: [
            `A) The current ETH price`,
            `B) The specific cause and size of the banking exposure, whether US government deposit protection applies, and whether Circle has sufficient other reserves to cover the shortfall without the at-risk funds`,
            `C) USDC's market cap at the time of the depeg`,
            `D) Whether Tether is also depegging`,
          ],
          correct: 1,
          explanation: `Level 2 depeg decision framework: (1) How large is the specific at-risk exposure vs total reserves? (8% at SVB was manageable.) (2) Is there a credible resolution pathway? (FDIC-backed bank deposits in the US have a government backstop precedent.) (3) What is the mathematical worst-case floor? ($3.3B / $40B = 8.25% max loss → $0.9175 floor.) If current market price is below the mathematical worst case: buying is rational if you have conviction on the resolution pathway.`,
          hint: `Level 2 depegs recover when the specific event resolves. What do you need to know to assess whether this specific event will resolve?`,
        },
        {
          question: `UST fell from $1.00 to $0.003 in 6 days without recovery. What specifically made recovery impossible?`,
          options: [
            `A) The Terra team did not try hard enough to defend the peg`,
            `B) The algorithmic mechanism (burn UST, mint LUNA) required LUNA to maintain value, but defending UST by minting LUNA crashed LUNA's price, which removed the mechanism's ability to provide real backing — a self-reinforcing collapse with no external value injection possible`,
            `C) The US government chose not to backstop UST like it did USDC`,
            `D) UST had insufficient liquidity to execute the arbitrage`,
          ],
          correct: 1,
          explanation: `Recovery requires: either (1) the mechanism restores the peg internally, or (2) external capital fills the gap. For fiat-backed: external institution (Circle's reserves) or government backstops. For algorithmic: the mechanism IS the recovery — but the mechanism requires the seigniorage token (LUNA) to hold value. Once LUNA's value collapsed (from mass minting), the mechanism had nothing to back new UST. No internal recovery was possible. No external capital came (Terra Foundation's BTC reserves were depleted by May 9). Recovery was structurally impossible.`,
          hint: `What does the UST algorithmic mechanism need to work? What happened to that thing during the crisis?`,
        },
        {
          question: `During the 2022 UST collapse, FRAX briefly depegged to $0.975 despite having 85% USDC collateral. How should a researcher classify this depeg?`,
          options: [
            `A) Level 3 — algorithmic mechanism failure like UST`,
            `B) Level 1 — sentiment contagion. The FRAX mechanism was not failing (85% real collateral was intact), but fear of algorithmic stablecoins caused selling pressure that the arbitrage mechanism temporarily could not absorb`,
            `C) Level 2 — event-driven, specific to the UST collapse`,
            `D) Cannot classify without more information`,
          ],
          correct: 1,
          explanation: `Level classification: (1) Was the FRAX mechanism failing? No — $0.85 of USDC per $1 FRAX was still intact, plus FXS. (2) Was there a specific bounded event? Partially — UST's collapse was the external event, but it did not directly damage FRAX's collateral. (3) Was recovery possible? Yes — FRAX has arbitrage: buy at $0.975, redeem for $0.85 USDC + $0.15 FXS (at worst case). Level 1 is most accurate: pure sentiment contagion. The mechanism was functioning; only confidence was temporarily impaired. Recovery in days confirmed the classification.`,
          hint: `Did the UST collapse actually reduce FRAX's backing? Or did it only reduce market confidence in algorithmic mechanisms generally?`,
        },
        {
          question: `Connecting to L5.2: what single property distinguishes stablecoins that can recover from depegs vs those that cannot?`,
          options: [
            `A) Market capitalisation — larger stablecoins always recover`,
            `B) Whether the backing asset has value independent of the stablecoin's own success. Fiat-backed (dollars in a bank) and crypto-backed (ETH) have independent value. Algorithmic backing (LUNA) derived its value primarily from UST's success — when UST confidence failed, LUNA's value simultaneously collapsed.`,
            `C) The number of exchanges listing the stablecoin`,
            `D) Whether the stablecoin has governance`,
          ],
          correct: 1,
          explanation: `The key structural question from L5.2: does the backing asset's value depend on the stablecoin's success? USDC: Circle's dollars in US Treasury bills — their value is independent of USDC's market price. DAI: ETH value is independent of DAI's success. LUNA: its value was primarily as "the thing that makes UST work." When UST failed, LUNA's primary use case failed, and its price followed. Circular backing creates circular failure. Independent backing creates a recovery floor.`,
          hint: `What backed USDC during its SVB depeg? What backed UST during its collapse? Did each backing asset's value depend on the stablecoin's success?`,
        },
        {
          question: `You hold 20% of your portfolio in USDT. A credible report claims Tether's reserves are only 85% backed (15% shortfall). USDT is currently at $0.96. Should you sell immediately?`,
          options: [
            `A) Yes — any reserve shortfall means permanent loss`,
            `B) Apply the classification: (1) Cause is a reserve concern — Level 1 if unverified, Level 2 if verified with bounded shortfall. (2) Mathematical floor: $0.85 if 15% shortfall is real. Current $0.96 is above the floor. (3) Is there a recovery pathway? Yes — Tether can demonstrate reserves by executing redemptions. Decision depends on: conviction in the report's accuracy, position size vs mental stress, and whether $0.85 floor risk is acceptable.`,
            `C) No — USDT always recovers from depegs`,
            `D) Convert to USDC immediately`,
          ],
          correct: 1,
          explanation: `No single correct action — the framework provides the analysis. Key question: is the report credible enough to treat as confirmed? If unverified rumour: Level 1 sentiment depeg, arbitrage mechanism likely to resolve it. If verified: Level 2 with known shortfall — current $0.96 is above the $0.85 mathematical floor, suggesting the market hasn't fully priced the worst case. Decision: reduce to a level that makes the tail risk tolerable (if 15% shortfall = $0.85 floor, and 20% of portfolio is at risk, maximum portfolio loss = 20% × 15% = 3%). Is 3% acceptable? Informed risk management, not panic.`,
          hint: `What is the mathematical worst case for your USDT position if the report is accurate? Is that worse than the current market price? What does that tell you about market pricing of the risk?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `A new stablecoin (NEWSD) depegs from $1.00 to $0.82 overnight. News: the protocol's smart contract has a reentrancy bug that allowed $20M to be drained from the collateral vault. The stablecoin is 130% collateralised — $20M drained reduces it to ~115% collateralisation. NEWSD outstanding: $80M. Classify this depeg (Level 1/2/3), determine the mathematical floor given current collateralisation, and recommend: hold, buy at $0.82, or exit.`,
          scoringCriteria: [
            `Classification: Level 2 (event-driven — specific smart contract exploit with bounded damage). Not Level 3 because remaining 115% collateralisation provides a real floor`,
            `Mathematical floor: $80M NEWSD outstanding × $0.80 minimum (80M × collateral ratio after exploit). More precisely: if collateral was $104M before exploit and $84M after: $84M / $80M = $1.05 per NEWSD (still overcollateralised). Floor is above $1.00 mathematically.`,
            `Current $0.82 is BELOW the mathematical floor ($1.05) — this is a significant over-discount indicating panic`,
            `Recommendation: buy at $0.82 IF smart contract risk from the exploit is contained (no further exploitability). But: smart contract risk is ongoing — the exploit might not be patched. Buy with caution or wait for team to patch the vulnerability first.`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L5.10 (stablecoin pools): during the USDC SVB depeg, the Curve 3pool reached 76% USDC. Walk through exactly what would have happened to a researcher who: (A) had $300K in the 3pool LP, (B) tried to withdraw all their position at peak 76% USDC imbalance, (C) instead waited 72 hours until peg was restored and then withdrew. Calculate approximate dollar values for both withdrawal timings and identify the better strategy.`,
          scoringCriteria: [
            `Withdrawal at peak (76% USDC): $300K position gives approximately $228K USDC (76%) + $72K USDT/DAI. Total at market prices: $228K × $0.87 + $72K × $1.00 = $198.36K + $72K = $270.36K. Loss vs NAV: $29.64K`,
            `Withdrawal after recovery (72h): $300K position gives approximately $100K each of USDC/USDT/DAI (recovered composition). All at $1.00. Total: $300K. Loss vs NAV: $0`,
            `Better strategy: wait for recovery. The $29.64K loss from early withdrawal was unnecessary — the depeg was Level 2 (recoverable), and holding earned back the full value`,
            `Key insight: during Level 2 depegs, patience is rewarded. During Level 3 depegs, immediate exit is critical. Classification determines strategy.`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find the current USDC price on CoinGecko (look at the 1-year chart) and the current Curve 3pool composition on DeFiLlama or curve.fi. Record: (A) any depegs greater than 0.5% in the past year and their duration, (B) current pool composition, (C) any periods where pool composition exceeded 45% for any single stablecoin. Then find the same data for DAI. Which stablecoin has had a cleaner peg history in the past year?`,
          scoringCriteria: [
            `USDC peg history accurately recorded from CoinGecko — any SVB aftermath data if within the past year`,
            `DAI peg history recorded — typically small deviations, sometimes slight premiums`,
            `Pool composition data recorded with specific percentages`,
            `Comparison correctly identifies which had fewer/smaller deviations with supporting evidence`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.12 — CROSS-CHAIN STABLECOINS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'cross-chain-stablecoins',
      title: `5.12 Cross-Chain Stablecoins — Same Dollar, Different Risk`,
      subtitle: `USDC exists on 15+ chains. Most of those are bridged copies, not native issuance. The difference between "native USDC" and "bridged USDC" is the difference between Circle's risk and the bridge's risk.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L5.4 you learned the distinction between native USDC (Circle issues directly) and bridged USDC.e (locked on Ethereum, wrapped on Arbitrum). This lesson goes deeper across all chains: how stablecoins move cross-chain, what versions exist on each chain, and how to identify and evaluate the additional risks of cross-chain stablecoin holdings.`,

      hook: `In November 2022, the Solana wormhole bridge held $320M of bridged USDC. If wormhole had been exploited (it was separately in February 2022 for $320M), all of that USDC would have become unbacked. The bridge is the risk. Native USDC has no bridge. The distinction saved $320M in potential losses.`,

      visualPrompt: `A chain map: Ethereum (USDC native, Circle-issued) in the centre. Lines extending to Arbitrum (native USDC + USDC.e bridged), Solana (native USDC via CCTP + bridged versions), Polygon (native + bridged), BNB Chain (bridged via multiple bridges), others. Bridge security rating colour-coded on each line. Caption: "Same ticker, different risk. Always check: native or bridged?"`,

      explanation: `Let me tell you about the same stablecoin in different places.

USDC is on 15+ chains. But it's not identical on each chain — not in terms of risk. On Ethereum: Circle issues USDC directly. On Arbitrum: there is native USDC (issued by Circle via CCTP) AND USDC.e (bridged via the Arbitrum bridge from Ethereum). Same ticker, different risk profile.

**The two stablecoin movement models:**

[Lock-and-mint bridging] — the original model. User locks USDC on Ethereum in the bridge contract. The bridge mints "wrapped USDC" (USDC.e, USDC via Wormhole, etc.) on the destination chain. One-to-one correspondence between locked and minted.

Risk: the bridge smart contract is the single point of failure. If the bridge is exploited: the locked USDC on Ethereum is stolen. The minted USDC.e on the destination chain becomes unbacked. Holders of USDC.e lose value proportional to the exploit.

[Native issuance via CCTP (Circle's Cross-Chain Transfer Protocol)] — Circle's own bridge. Users burn USDC on the source chain (it is destroyed, not locked). Circle re-mints USDC on the destination chain. No bridge smart contract holding locked tokens.

Risk: much lower. Circle controls both ends. No locked pool for hackers to target. USDC backed by the same reserves regardless of chain.

**Chain-by-chain stablecoin overview:**

[Ethereum]: USDC native (Circle), USDT native (Tether), DAI native (Maker), LUSD native (Liquity). All primary origin chains.

[Arbitrum]: Native USDC (0xaf88d065...) via CCTP, USDC.e (0xFF970A61...) bridged legacy, native USDT (Tether deployed directly), DAI bridged.

[Solana]: Native USDC via CCTP, USDT native (Tether on Solana), bridged USDC from old Wormhole bridge (deprecated but still in circulation).

[BNB Chain]: USDC is bridged (no native Circle issuance historically), USDT native (Tether BNB), BUSD (deprecated, Paxos discontinued after SEC action).

[Polygon]: Native USDC via CCTP (recently added), USDC.e bridged legacy, USDT native.

**How to identify native vs bridged:**

On Ethereum L2s: check the token contract address against the official list on Circle's website or the chain's official documentation. USDC on Arbitrum: official native = 0xaf88d065...; legacy bridged = 0xFF970A....

On DeFiLlama: the stablecoin composition section shows which version is used by major protocols. Aave V3 Arbitrum migrated to native USDC in 2023.

**The BUSD case — regulatory stablecoin death:**

Paxos issued BUSD (Binance USD) under a NY regulator-approved arrangement. In February 2023, the NY DFS ordered Paxos to stop minting new BUSD and SEC sent Wells Notice. Paxos complied. Result: BUSD supply dropped from $16B to near-zero over 12 months as existing holders redeemed. No depeg. No losses. Clean regulatory wind-down. Lesson: regulatory action can terminate a stablecoin's existence without a depeg or loss event.`,

      examples: [
        {
          contextTag: `[Bridge exploit risk — Wormhole February 2022]`,
          context: `Jake studies the February 2022 Wormhole bridge exploit for the cross-chain stablecoin risk analysis.`,
          scenario: `February 2, 2022: attacker exploits a signature verification vulnerability in the Wormhole bridge smart contract on Solana. $320M worth of wETH (wrapped ETH) is minted without corresponding locked ETH on Ethereum. At the time: Wormhole's bridge contract held approximately $320M in locked USDC and other assets as collateral for Solana-side bridged assets. Had the attacker targeted USDC specifically: the locked USDC on Ethereum could have been drained. All Solana-side "bridged USDC" would have become unbacked. Jump Trading (Wormhole's operator) covered the $320M loss to restore parity — an extraordinary event that most bridges would not survive.`,
          outcome: `Jake documents: bridge risk is not theoretical. $320M in one transaction. The only reason bridge users didn't lose funds was Jump Trading's voluntary $320M injection — a one-time event that cannot be assumed for future exploits. Native USDC via CCTP has no bridge pool to exploit. The distinction is structural, not incremental.`,
        },
        {
          contextTag: `[CCTP native issuance advantages]`,
          context: `Priya explains Circle's CCTP to a fund considering cross-chain USDC deployments.`,
          scenario: `Legacy bridge model: user deposits $1M USDC on Ethereum → bridge locks it → mints $1M USDC.e on Arbitrum. The $1M USDC on Ethereum is now locked in the bridge contract — a $1M target for hackers. All Arbitrum USDC.e combined: a massive locked pool = massive exploit target. CCTP model: user burns 1M USDC on Ethereum (destroyed) → Circle verifies the burn and re-mints 1M native USDC on Arbitrum. No locked pool exists. An attacker hacking the bridge contract finds nothing locked there. The attack surface (pool of locked tokens) is eliminated. The remaining risk: Circle's own smart contract or issuance process — which carries Circle's full reputational and regulatory stake.`,
          outcome: `Priya's recommendation: for any significant cross-chain USDC deployment, verify native USDC is available and used. The CCTP switch eliminates bridge counterparty risk from the equation — the remaining risk is purely Circle's issuer risk, which is already being accepted by using USDC at all.`,
        },
        {
          contextTag: `[BUSD regulatory wind-down]`,
          context: `Maya analyses the BUSD regulatory termination for the team's regulatory risk framework.`,
          scenario: `BUSD peak supply: $16B (2022). February 2023: Paxos receives NY DFS instruction to stop minting BUSD. SEC sends Wells Notice (potential securities fraud claim). Paxos complies: no new BUSD minted after February 21. Existing BUSD: continue to be redeemable at $1.00 from Paxos until February 2024 deadline. Result: orderly decline. $16B → $8B (3 months) → $2B (6 months) → $500M (9 months). No depeg at any point. Paxos processed all redemptions at $1.00. Holders who held through the announcement: received $1.00. Holders who panic-sold at $0.995: slight loss.`,
          outcome: `Maya documents: regulatory stablecoin termination ≠ loss of value, if the reserves are real and the issuer complies. BUSD proved: well-backed stablecoins can be wound down without depositor losses even under regulatory pressure. Contrast with UST: algorithmic stablecoins face terminal depegs when the mechanism fails; fiat-backed stablecoins can undergo orderly redemption even under regulatory pressure.`,
        },
      ],

      keyTakeaway: `Cross-chain stablecoins: same ticker, different risk. Native issuance (Circle CCTP): USDC minted and burned directly by Circle — no bridge pool risk. Lock-and-mint bridging (USDC.e): USDC locked in bridge contract on source chain, wrapped on destination — bridge exploit = unbacked wrapped tokens. Identify by contract address: Arbitrum native USDC = 0xaf88d065, bridged USDC.e = 0xFF970A61. Major protocols (Aave V3, GMX) have migrated to native USDC. BUSD case: regulatory action can wind down a stablecoin without depeg or losses if reserves are real. Always verify native vs bridged before deploying to any non-Ethereum chain.`,

      guidedPractice: [
        {
          question: `Arbitrum lists two USDC tokens: native USDC (0xaf88d065) and USDC.e (0xFF970A61). For a $500K deployment on Aave V3 Arbitrum, which should you use and why?`,
          options: [
            `A) USDC.e — it has more liquidity on legacy DEXes`,
            `B) Native USDC (0xaf88d065) — no bridge smart contract risk, issued directly by Circle via CCTP, used by Aave V3 Arbitrum as its primary USDC`,
            `C) Either — the risk difference is negligible`,
            `D) USDC.e — bridged tokens are more decentralised`,
          ],
          correct: 1,
          explanation: `Native USDC eliminates the bridge risk layer entirely. The bridge contract holding locked USDC is a hackable pool — Wormhole's $320M exploit demonstrated this. CCTP native issuance: Circle burns on source and mints on destination — no locked pool to hack. Additionally, Aave V3 Arbitrum migrated to native USDC precisely because the bridge risk was identified as an unnecessary addition to Aave's risk profile. For $500K: the bridge risk difference is significant — a USDC.e exploit could affect your entire position.`,
          hint: `From L5.4: what is the risk of bridged USDC.e? Why did Aave V3 Arbitrum switch to native USDC?`,
        },
        {
          question: `The Wormhole bridge was exploited for $320M in February 2022. Jump Trading voluntarily covered the loss. Why can't this outcome be assumed for future bridge exploits?`,
          options: [
            `A) Jump Trading was legally required to cover it`,
            `B) Jump Trading's voluntary injection was a unique event driven by their specific reputational stake in Wormhole. Future bridge operators may lack the resources, willingness, or contractual obligation to make users whole`,
            `C) Bridge exploits only happen once per bridge`,
            `D) All bridge exploits are covered by DeFi insurance`,
          ],
          correct: 1,
          explanation: `Jump Trading covered $320M because they are a major trading firm with reputational stakes in the Wormhole ecosystem. Most bridge operators: are anonymous DAOs, lack the capital to self-insure $320M exploits, have no legal obligation to cover losses, and would simply fail. The Wormhole outcome was exceptional — not a precedent. Bridge users should assume exploit losses are permanent, not backstopped. This is why native issuance (CCTP) is structurally superior: the risk of a bridge exploit is eliminated, not covered.`,
          hint: `Why did Jump Trading specifically cover this loss? Does every bridge operator have the same incentive and capital?`,
        },
        {
          question: `BUSD declined from $16B to near-zero in 12 months without a depeg. What does this demonstrate about regulatory risk for fiat-backed stablecoins?`,
          options: [
            `A) Regulatory action always causes a depeg`,
            `B) Well-reserved fiat-backed stablecoins can be wound down through orderly redemption without depositor losses — regulatory risk for fiat-backed stablecoins is primarily "stablecoin becomes unavailable" not "holders lose dollar value"`,
            `C) Regulators do not have power over stablecoins`,
            `D) BUSD's decline proved it was not truly fiat-backed`,
          ],
          correct: 1,
          explanation: `BUSD's orderly wind-down: Paxos stopped minting, processed all redemptions at $1.00 through the deadline, and holders received full dollar value. The regulatory risk materialised as: (1) USDC/USDT/DAI gained market share from BUSD's decline, (2) BUSD-based DeFi positions needed to migrate, (3) no loss of dollar value for any holder who held or redeemed. This is the correct model for fiat-backed regulatory risk: "your stablecoin may be discontinued" not "you lose your dollar." Compare to UST: algorithmic stablecoins under stress lose dollar value, not just availability.`,
          hint: `Did any BUSD holder lose dollar value? What actually happened to their holdings? What changed vs what didn't change?`,
        },
        {
          question: `Connecting to L1.11 (bridge risk): you are deploying $1M in a DeFi strategy on BNB Chain using "USDC" via a third-party bridge. What is the maximum possible loss from bridge risk alone?`,
          options: [
            `A) 0% — bridges are secured by validators`,
            `B) Up to 100% — if the bridge is exploited, your locked USDC on Ethereum may be stolen, making your BNB Chain "USDC" completely unbacked and potentially worthless`,
            `C) Maximum 10% — bridges are insured up to 10%`,
            `D) Only gas costs are at risk`,
          ],
          correct: 1,
          explanation: `Bridge exploit = locked tokens stolen on source chain = wrapped tokens become unbacked on destination chain. If the bridge holding your locked USDC is drained: your BNB Chain "USDC" is a claim on an empty vault. Maximum loss = 100% of your position. This is why L1.11 classifies bridges as a major risk category. The $1B+ in bridge exploits (Wormhole $320M, Ronin $625M, Nomad $190M) are not theoretical — they are the single largest exploit category in DeFi by total loss.`,
          hint: `From L1.11 bridge risk: what happens to the wrapped token when the source-chain locked pool is exploited?`,
        },
        {
          question: `Circle's CCTP allows "native USDC" on 12+ chains. How does this change the risk calculus for cross-chain DeFi strategies vs the legacy bridge model?`,
          options: [
            `A) CCTP increases risk by creating more USDC issuance points`,
            `B) CCTP eliminates bridge pool exploit risk — there is no locked USDC to steal. The only remaining risks are Circle's own issuance integrity (same risk as Ethereum mainnet USDC) and the destination chain's protocol risks`,
            `C) CCTP makes USDC more centralised than before`,
            `D) CCTP has no practical impact on cross-chain risk`,
          ],
          correct: 1,
          explanation: `Legacy bridge model: cross-chain deployment = USDC risk + bridge contract risk + destination chain protocol risk. CCTP model: USDC is burned and re-minted, no bridge pool exists. Cross-chain deployment = USDC risk + destination chain protocol risk. The bridge risk layer is eliminated. For a $1M cross-chain deployment, this changes the risk from three-layer to two-layer. The destination chain protocol risk (Aave Arbitrum vs some newer protocol) remains and should be evaluated separately. CCTP is one of the most important security improvements in DeFi infrastructure from 2022–2024.`,
          hint: `List the risk layers in legacy bridge deployment. Which layer does CCTP eliminate? What remains?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-risk-assess`,
          scenario: `A fund wants to deploy $2M USDC across three chains: Arbitrum, Solana, and BNB Chain. For each chain, identify: (A) whether native USDC is available via CCTP, (B) the specific contract addresses or bridge mechanism for USDC on that chain, (C) the additional risk layers beyond Circle's issuer risk, (D) maximum bridge loss scenario. Design the allocation that minimises total bridge risk while maintaining cross-chain diversification.`,
          scoringCriteria: [
            `Arbitrum: native USDC via CCTP available (0xaf88d065). No bridge risk. Additional risk: Arbitrum sequencer centralisation (mitigated by fraud proofs).`,
            `Solana: native USDC via CCTP available. Old bridged versions exist but should be avoided. Additional risk: Solana network outage history.`,
            `BNB Chain: USDC historically bridged only (no CCTP historically, check current status). Higher bridge risk. Use Binance's official bridge and accept bridge risk or avoid USDC on BNB (use USDT which Tether issues natively on BNB).`,
            `Allocation: $1M Arbitrum native USDC, $700K Solana native USDC, $300K BNB Chain USDT native (avoid bridged USDC on BNB). Justification: minimises bridge risk by using native issuance wherever available.`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Using DeFiLlama's stablecoin section and each chain's official bridge documentation: map the stablecoin composition for three chains (Arbitrum, Polygon, Solana). For each chain: (A) which stablecoins are native issued vs bridged, (B) what percentage of stablecoin TVL is in bridged vs native tokens, (C) which protocols use native vs bridged versions. Identify: which chain has the highest proportion of native-issued stablecoins (lower bridge risk)?`,
          scoringCriteria: [
            `Correctly identifies native USDC (CCTP) vs legacy bridged USDC.e on Arbitrum`,
            `Correctly identifies Polygon's mix of native (recent CCTP addition) and legacy bridged`,
            `Correctly identifies Solana's native USDC via CCTP and any remaining bridged versions`,
            `Reasonable chain ranking by native proportion with supporting data`,
          ],
        },
        {
          type: `judgment-integration`,
          scenario: `Connecting to L4.12 (cross-chain lending) and L5.12: build a "cross-chain stablecoin safety matrix" covering Ethereum, Arbitrum, Solana, and BNB Chain. Columns: primary USDC version (native/bridged), primary USDT version (native/bridged), bridge risk level (A-D), recommended stablecoin for $500K DeFi deployment, and one key chain-specific stablecoin risk. This is a deliverable Marcus would use for weekly briefings.`,
          scoringCriteria: [
            `Ethereum: all native, A bridge risk, USDC or USDT, key risk = Circle/Tether issuer`,
            `Arbitrum: native USDC available, native USDT, A-B bridge risk (with CCTP), use native USDC, key risk = sequencer (mitigated)`,
            `Solana: native USDC and USDT, A-B bridge risk (with CCTP), use native USDC, key risk = network outage history`,
            `BNB Chain: USDC bridged risk elevated, USDT native, B-C bridge risk, use native USDT, key risk = bridge for USDC + Binance regulatory exposure`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.13 — STABLECOIN YIELDS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'stablecoin-yields',
      title: `5.13 Stablecoin Yields — Where Every Dollar of Stablecoin Yield Comes From`,
      subtitle: `Stablecoin yields range from 1% to 50%. The spread is not random. Each yield source has a specific economic mechanism, a specific risk, and a specific ceiling. Here is the complete map.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 4 (L6.1) introduced four yield sources. Lab 6 has covered stablecoins in depth. This lesson synthesises both — mapping every stablecoin yield source specifically, the economic mechanism behind each, and how to evaluate sustainability using the frameworks already built.`,

      hook: `In 2023, five different ways to earn yield on USDC ranged from 3.2% (Aave) to 5.5% (sDAI) to 8% (Curve 3pool via Convex) to 25% (sUSDe). Each was real. Each came from a different economic source. Each carried a different risk. Understanding all five — not just chasing the highest number — is what separates a DeFi yield researcher from a DeFi yield farmer.`,

      visualPrompt: `A yield source map: five nodes radiating from "Stablecoin." Node 1: "Lending interest" (Aave, Morpho) — real yield from borrowers. Node 2: "Swap fees" (Curve 3pool, Uniswap V3) — real yield from traders. Node 3: "DSR/Governance" (sDAI) — real yield from RWA investments. Node 4: "Funding rates" (sUSDe) — real yield from derivatives traders. Node 5: "Token emissions" (various farms) — inflation yield, not real. Each node with an APY range and risk label.`,

      explanation: `Let me tell you about making your stablecoins work.

Holding USDC does nothing. But in DeFi, USDC can earn yield from five distinct sources. Each source is structurally different. Each source has different durability through market cycles.

**Source 1: Lending Interest (Real Yield)**

Mechanism: deposit USDC on Aave, Morpho, Spark. Borrowers pay interest. You receive a share.
APY range: 2-15% depending on chain and utilisation cycle.
Sustainability: high — comes from real borrowing demand. Exists in all market conditions (lower in bear, higher in bull).
Source protocols: Aave V3, Morpho Blue, Compound V3, Spark SparkLend.

**Source 2: Swap Fees (Real Yield)**

Mechanism: provide USDC liquidity in Curve 3pool or Uniswap V3 USDC/USDT. Traders pay 0.01-0.04% per swap. You receive your share.
APY range: 2-6% from fees alone. Boosted to 7-11% via CRV/CVX emissions (partly real, partly emission).
Sustainability: high for fee component — DEX trading volume exists in all market conditions. Emission component variable.
Source protocols: Curve 3pool, Uniswap V3 USDC/USDT, Frax FraxBP.

**Source 3: RWA / Governance-Set Rate (Real Yield)**

Mechanism: MakerDAO holds US Treasury bills yielding ~5%. Passes yield to DAI holders via the DSR. sDAI earns the DSR.
APY range: 4-6% (tied to US Treasury rates plus MakerDAO's risk tolerance).
Sustainability: high as long as US Treasury rates remain elevated and MakerDAO governance continues RWA investment. Governance can reduce the DSR at any time.
Source protocols: MakerDAO sDAI, Spark sDAI.

**Source 4: Derivatives Funding Rates (Real Yield — Variable)**

Mechanism: Ethena's USDe holds ETH spot + short ETH perps. ETH longs pay funding to shorts. Ethena distributes this to sUSDe holders.
APY range: 5-50% (highly variable — depends on bull/bear cycle and market sentiment).
Sustainability: variable — positive in bull markets when longs pay. Negative in bear markets when shorts pay. Reserve fund covers negative periods.
Source protocols: Ethena sUSDe.

**Source 5: Token Emissions (Not Real Yield)**

Mechanism: protocol mints governance tokens and distributes to stablecoin depositors.
APY range: 5-500% (most extreme yields are emission-based).
Sustainability: low — depends on token price which declines as supply increases. Sell immediately or accept depreciation.
Source protocols: any protocol with "farm USDC for TOKEN_X" structure.

**The yield calendar — what correlates with market cycles:**

Bull market: lending interest spikes (high borrow demand), funding rates spike (long dominance). Peak yield: Aave USDC 15%+, sUSDe 30%+.
Bear market: lending interest falls (low borrow demand), funding rates turn negative. Durable yield: Curve swap fees 4-6%, sDAI DSR 5% (from RWAs).

The researcher's insight: in bear markets, RWA-backed yield (sDAI) becomes the best risk-adjusted stablecoin yield — lending interest falls, funding rates turn negative, but Treasuries continue paying regardless of crypto market cycles.`,

      examples: [
        {
          contextTag: `[Full yield source comparison at current market rates]`,
          context: `Jake builds the full yield source comparison for a $300K USDC allocation.`,
          scenario: `Current options (moderate bull market): Aave V3 USDC Arbitrum: 5.8% lending interest (real), Morpho Blue USDC Ethereum: 6.1% lending interest via curated vault (real), Curve 3pool via Convex: 4.2% fees + 3.8% CRV/CVX = 8.0% (fees real, emissions variable), sDAI: 5.5% DSR (RWA-backed real), sUSDe: 18% funding rate yield (real but highly variable). Risk-adjusted ranking: sDAI (5.5%, B risk), Aave/Morpho (5.8-6.1%, A risk), Curve 3pool via Convex (8.0%, A-B risk), sUSDe (18%, C risk in current volatility). Jake's allocation: $100K sDAI (stable real yield anchor), $100K Aave Arbitrum (real yield, Ethereum-secured), $100K sUSDe (high yield tactical, bull market timing). Blended: 9.77%.`,
          outcome: `Jake's blended 9.77% on stablecoins in a bull market. He sets monitoring alerts: sUSDe yield drops below 10% → rebalance to Aave. sDAI DSR cut below 4% → rebalance to Aave or Morpho. Aave utilisation above 88% → review withdrawal liquidity.`,
        },
        {
          contextTag: `[Bear market yield comparison — the RWA advantage]`,
          context: `Priya models stablecoin yields in a bear market scenario.`,
          scenario: `Bear market assumptions: ETH falls 60% from peak, crypto trading volume drops 70%, funding rates turn negative (−8% annual). Yield impacts: Aave USDC supply APY: falls from 5.8% to 2.1% (low utilisation). Curve 3pool fees: fall from 4.2% to 2.3% (lower volume). CRV/CVX emissions: also fall in dollar terms (token prices drop). Total Curve yield: ~3.8%. sUSDe: −8% funding − 3.5% stETH = −4.5% net. Reserve fund pays this to maintain peg, but sUSDe holders earn 0% or protocol pauses yield distribution. sDAI: still 5.5% (from US Treasuries — not correlated with crypto market). Winner: sDAI is now the highest yield at 5.5% vs everything else at 0-3.8%.`,
          outcome: `Priya's cycle analysis: sDAI's DSR is genuinely counter-cyclical to crypto yields. In bull markets it is below peak yields. In bear markets it becomes the best available. A researcher who understands yield cycles positions sDAI as the bear market anchor and adds sUSDe/Aave exposure only during confirmed bull phases.`,
        },
        {
          contextTag: `[Emission yield trap — the "45% USDC farm" scenario]`,
          context: `Maya evaluates a new protocol offering 45% APY on USDC deposits.`,
          scenario: `Protocol X on a new L2: 45% USDC APY. Maya's decomposition workflow (L6.1): check Token Terminal for protocol revenue. Result: protocol revenue = 1.2% real yield on TVL. Remaining 43.8% = PROT token emissions. PROT token schedule: 1M tokens/day for 12 months. Current PROT price: $0.05. Daily emission value: $50,000. TVL: $8M. Daily emission APY: $50,000 / $8M × 365 = 228% APY (much higher than 45% — something is off). Recalculate: if most PROT is being dumped immediately (reducing price), effective yield is 45% stated but real capture depends on when you sell. Maya checks PROT price trend: down 65% over 3 months. Effective emission yield to date: 45% × 35% remaining token value = 15.75%. Minus opportunity cost: 3 months × 6% = 1.5%. Net: 14.25% — still positive but far from the 45% headline.`,
          outcome: `Maya's conclusion: this is a medium-quality emission yield opportunity. Not a trap (still positive), but misrepresented as 45% when real capture is closer to 15%. She passes — the Aave/Morpho/sDAI combination gives 6-8% real yield with no token price risk. The emission opportunity requires active management (sell immediately) and token price monitoring that she does not want to add to her workflow.`,
        },
      ],

      keyTakeaway: `Five stablecoin yield sources: (1) lending interest (real, 2-15%, cycle-correlated), (2) swap fees (real, 2-6%, stable volume), (3) RWA/governance-set rate (real, 4-6%, US Treasury-correlated — counter-cyclical to crypto), (4) derivatives funding rates (real but variable, 5-50%, bull-market-dependent), (5) token emissions (not real, variable, always decompose). Bear market yield winner: sDAI/DSR. Bull market yield winner: sUSDe. Stable base yield: Curve 3pool via Convex. Always decompose before chasing the headline: "45% APY" is only valuable if you know what the 45% is made of and whether you can capture it before depreciation.`,

      guidedPractice: [
        {
          question: `sDAI earns 5.5% in a bear market while Aave USDC earns 2.1%. What fundamental difference in yield source causes this divergence?`,
          options: [
            `A) sDAI has better governance than Aave`,
            `B) sDAI's yield comes from US Treasury bills (not correlated with crypto market activity), while Aave's yield comes from crypto borrowing demand which collapses in bear markets`,
            `C) sDAI has higher TVL than Aave`,
            `D) Aave's reserve factor is higher in bear markets`,
          ],
          correct: 1,
          explanation: `sDAI/DSR yield source: MakerDAO holds $1.5B+ in US Treasuries earning ~5%. This yield exists regardless of crypto trading volumes, ETH price, or DeFi activity levels. US Treasuries do not know (or care) whether Bitcoin is at $20K or $80K. Aave yield source: crypto borrowing demand. When crypto crashes, leverage demand collapses, utilisation falls, and rates fall algorithmically. The two yield sources are in completely different economic cycles. This counter-cyclicality makes sDAI valuable as a bear market yield anchor — it pays when crypto-native yields collapse.`,
          hint: `What economic activity generates sDAI's yield? What economic activity generates Aave's yield? Which activity depends on the crypto market?`,
        },
        {
          question: `Connecting to L6.1 (yield sources): a protocol advertises 28% USDC APY. Token Terminal shows 3% real yield from borrowers. What is the yield source of the remaining 25%, and what happens to the effective yield if the emission token drops 80%?`,
          options: [
            `A) The remaining 25% is from undisclosed RWA investments`,
            `B) The remaining 25% is token emissions. Effective yield if token drops 80%: 3% real + (25% × 20% remaining value) = 3% + 5% = 8% effective. Better than nothing, but not the 28% advertised.`,
            `C) The remaining 25% will be distributed later as bonus`,
            `D) Token emissions maintain their value and 28% is sustainable`,
          ],
          correct: 1,
          explanation: `25% from token emissions × 20% remaining value = 5% capture. Plus 3% real = 8% total effective yield. This is materially less than 28% but still positive — some emission opportunities are worth pursuing if you sell tokens immediately upon earning. The key insight from L6.13: sell emission tokens immediately to lock in value. If you hold them hoping for price recovery, the 80% drop turns 25% emission into 5%. If you sell immediately as earned, you capture closer to the stated 25% at the price when earned (before the drop).`,
          hint: `From L6.1: emission yield = tokens earned × token price at time of capture. If token price drops 80%, what fraction of the original emission value do you capture?`,
        },
        {
          question: `A researcher wants maximum stablecoin yield in a confirmed bull market for a 3-month tactical position. Which yield source combination provides the highest risk-adjusted return?`,
          options: [
            `A) sDAI only — safest and most predictable`,
            `B) sUSDe (funding rate yield, 20%+ in bull) combined with some sDAI anchor — captures the bull market premium while maintaining a safety anchor. Total blended: 15-18% vs sDAI-only 5.5%`,
            `C) All emission-based farms — highest headline APY`,
            `D) Only Curve 3pool — lowest risk`,
          ],
          correct: 1,
          explanation: `Bull market yield hierarchy: sUSDe 20%+ (real, from funding rates) > Aave V3 high utilisation 8-15% (real, from borrowers) > Curve Convex 8-10% > sDAI 5.5%. For a 3-month confirmed bull position: sUSDe's funding rate yield is at its peak exactly when you want it. The risk: 3 months of negative funding is historically unusual in confirmed bull markets. Combining sUSDe (70%) + sDAI anchor (30%) gives: 70% × 20% + 30% × 5.5% = 14% + 1.65% = 15.65% blended — 3× more than sDAI-only with a safety anchor for if the bull ends unexpectedly.`,
          hint: `In a confirmed bull market, which yield source is at its absolute peak? What risk is added by using it for only 3 months?`,
        },
        {
          question: `Why is the Curve 3pool via Convex often described as the "lowest-risk real yield" stablecoin strategy?`,
          options: [
            `A) Curve has no smart contract risk`,
            `B) The 3pool fee yield comes from DEX trading volume — which persists in all market conditions — and stablecoin LP has near-zero IL. The yield does not depend on borrowing demand, funding rates, or governance decisions. It is the most independent yield source in DeFi.`,
            `C) Convex guarantees the yield through its treasury`,
            `D) The 3pool only contains fiat-backed stablecoins, eliminating all mechanism risk`,
          ],
          correct: 1,
          explanation: `Curve 3pool yield sources: (1) swap fees — paid by anyone swapping between USDC, USDT, and DAI. This volume exists in all market cycles (more volatility = more swapping for safety assets = more 3pool volume). (2) CRV/CVX emissions — variable, market-correlated, but adds to the fee base. The fee component is genuinely market-independent: even in deep bear markets, people swap between stablecoins. This is not true of lending interest (which needs borrowing demand) or funding rates (which need longs). Near-zero IL completes the picture: no price risk for LP positions.`,
          hint: `What is the source of 3pool swap fee yield? Is that source affected by whether the crypto market is bull or bear?`,
        },
        {
          question: `The DAI Savings Rate is set by MakerDAO governance at 5.5%. If US Treasury 3-month bill rate falls to 2%, what likely happens to the DSR?`,
          options: [
            `A) The DSR stays at 5.5% regardless of Treasury rates`,
            `B) MakerDAO governance will likely reduce the DSR toward the Treasury yield — the DSR is funded by RWA income (Treasuries), so paying 5.5% DSR when Treasuries yield 2% would drain the Maker Surplus Buffer`,
            `C) The DSR increases to attract more DAI holders`,
            `D) Maker would print new DAI to fund the DSR`,
          ],
          correct: 1,
          explanation: `DSR sustainability: DSR is funded from Maker's income (stability fees + RWA yield). If Treasury yields fall to 2%, Maker's RWA income falls to approximately 2% on its $1.5B portfolio = $30M/year income. If DSR stays at 5.5% and DAI supply is $7B: annual DSR payout = $7B × 5.5% = $385M — far exceeding $30M income. Governance would reduce DSR to match income. The DSR follows Treasury rates with a governance lag. This is why sDAI yield is ultimately a US Treasury rate proxy — which is both its strength (stable, non-crypto-correlated) and its limitation (falls when interest rates fall).`,
          hint: `The DSR is funded by Maker's income. If Maker's income falls (because Treasuries pay less), what has to happen to the DSR to stay solvent?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-yield-calc`,
          scenario: `Build a cycle-aware stablecoin yield strategy for $500K. The strategy must generate at least 5% in bear markets and above 10% in bull markets. Available tools: sDAI (5.5% stable), Aave V3 Arbitrum (2-10% cycle-dependent), Curve 3pool via Convex (4-8% stable-ish), sUSDe (0-30% cycle-dependent). Design the allocation for each market phase and the signals that trigger rebalancing between phases.`,
          scoringCriteria: [
            `Bear market allocation achieving 5%+: heavy sDAI (40-50%), Curve 3pool (40%), minimal Aave, no sUSDe. Blended: roughly 5-6%.`,
            `Bull market allocation achieving 10%+: sUSDe 30-40%, Aave 30%, Curve 20%, sDAI anchor 10-20%. Blended: 10-15%.`,
            `Transition signals: bull signal = ETH funding rate consistently positive >0.02%/8h for 2+ weeks. Bear signal = ETH funding rate negative >2 consecutive weeks OR crypto market cap drops >40% from ATH.`,
            `Rebalancing mechanism: quarterly review minimum; immediate review on funding rate or Aave utilisation alerts`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `Priya's fund rule: "All yield must be classifiable as real yield with a verifiable economic source." Apply this rule to evaluate five strategies: (A) sDAI 5.5%, (B) Aave V3 USDC 5.8%, (C) Curve 3pool via Convex 8% (4% fees + 4% CRV/CVX), (D) sUSDe 18%, (E) new protocol "FarmX" offering 35% APY on USDC with 30% from FARMX emissions. Which strategies pass the rule? For those that partially pass, what specific component passes and what specific component fails?`,
          scoringCriteria: [
            `sDAI: PASS — US Treasury bills are a verifiable economic source (risk: governance can change DSR)`,
            `Aave V3: PASS — borrower interest is verifiable real yield from economic activity`,
            `Curve 3pool: PARTIAL — 4% swap fees PASS (verifiable trading activity), 4% CRV/CVX FAIL (emission yield, depends on token price)`,
            `sUSDe: PASS with caveat — funding rates are verifiable real yield from derivatives traders; caveat = can go negative. Full economic source disclosure required.`,
            `FarmX: FAIL for 30% emissions component — governance token inflation is not a verifiable external economic source. Only 5% passes the rule.`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find DeFiLlama's stablecoin yields section. Filter for USDC yields above 5%. Record the top 8 opportunities with their chain, protocol, and APY. For each, identify the primary yield source from the five categories in this lesson. Calculate: what percentage of the top 8 are primarily emission-based vs real yield? What does this distribution reveal about the current market phase?`,
          scoringCriteria: [
            `Top 8 opportunities accurately recorded from DeFiLlama with chain and protocol`,
            `Yield source correctly classified for each (lending interest, swap fees, RWA, funding rates, emissions)`,
            `Percentage calculation of real yield vs emission yield correct`,
            `Market phase interpretation: if >60% of high-yield opportunities are emission-based = protocol incentive phase (many new protocols bootstrapping). If >60% real yield = mature market with genuine demand. Correct interpretation given current data.`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.14 — PRACTICE: ANALYZE THE USDC MARCH 2023 DEPEG
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'practice-analyze-depeg',
      title: `5.14 Practice — Analyzing the USDC March 2023 Depeg`,
      subtitle: `The USDC March 2023 depeg was a live stress test of DeFi's stablecoin infrastructure. Here is the full analysis: cause, market response, DeFi impact, and what you should have done.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 6 has built every analytical tool needed to evaluate a stablecoin depeg: mechanism type (L5.2), USDC specifics (L5.4), depeg classification (L5.11), pool analysis (L5.10), and yield framework (L5.13). This practice lesson applies every tool to one real event — the most important stablecoin stress test of the modern DeFi era.`,

      hook: `March 10, 2023. You wake up and USDC is at $0.93. Your DeFi positions are collateralising loans with USDC. Curve pools are showing 72% USDC. Every DeFi researcher in the world is making a decision in real time. What should you have done — and why? This lesson gives you the complete playbook.`,

      visualPrompt: `A timeline of March 10-13 2023: Friday 10 (SVB fails at market close, USDC $1.00), Saturday 11 (Circle announces $3.3B at SVB, USDC falls to $0.87), Sunday 12 (panic deepens, USDC $0.87-0.91 range), Sunday evening (Fed/FDIC announce backstop), Monday 13 (USDC recovers to $0.998). Below: five action points labeled "What researchers did: sell at $0.91, hold, buy at $0.87, exit DeFi positions, or rebalance." Caption: "60 hours. Five possible responses. Only two were correct."`,

      explanation: `Now it's your turn to analyze a real event.

The USDC depeg in March 2023 was a major stress test for DeFi's stablecoin infrastructure. Every protocol, every LP, every borrower who held USDC faced a real-time decision. Apply the full Lab 6 framework.

**Step 1: Classification (L5.11)**

Apply the three-level depeg framework immediately.

Cause: Circle has $3.3B in SVB. SVB has failed. $3.3B may or may not be recovered. Total USDC supply: $40B.

Level test: Is this mechanism failure (Level 3)? No — USDC's fiat-backing mechanism is not broken. The stablecoin itself works. Is this a bounded specific event (Level 2)? Yes — $3.3B in one bank, recoverable through FDIC process or government backstop. Is it confidence-driven (Level 1)? Partially — the panic overshoot to $0.87 is beyond the mathematical worst case.

Classification: Level 2 with Level 1 overshoot. Recovery is structurally possible if the specific event resolves.

**Step 2: Mathematical floor analysis (L5.2, L5.4)**

Worst case: $3.3B unrecoverable out of $40B total USDC = 8.25% shortfall. Mathematical floor: $0.9175 per USDC.

Market price at low: $0.87 — below the mathematical floor. Implication: market is pricing in even worse than the identified worst case. This suggests panic overshoot — the market is not rationally pricing the event.

**Step 3: Pool analysis (L5.10)**

Curve 3pool at peak: 76% USDC. This confirms: everyone is selling USDC into the pool. The pool absorbs at minimal slippage — traders are selling USDC at approximately $0.91-0.93 on Curve vs $0.87 on Coinbase (exchanges moved faster than Curve).

Signal: 76% pool composition = maximum stress. Historical: this is unprecedented imbalance.

**Step 4: Resolution pathway assessment (L5.4)**

Specific questions: (1) Is $3.3B at SVB covered by FDIC? FDIC insures up to $250K per depositor — not $3.3B. (2) Historical precedent: US government backstopped major bank failures in 2008. (3) Systemic importance: SVB served thousands of tech startups including Circle. Government likely cares about contagion.

Assessment: 70-80% probability of government backstop within 48-72 hours based on historical precedent.

**Step 5: Decision framework**

At $0.87 with 70-80% backstop probability: expected value = 0.75 × $1.00 + 0.25 × $0.875 (worst case if partial recovery) = $0.75 + $0.219 = $0.969 expected value. Buying at $0.87 has expected value of $0.099 per USDC = 11.4% expected return in 72 hours. High conviction position at this price.`,

      examples: [
        {
          contextTag: `[Researcher making the correct decision under pressure]`,
          context: `Priya applies the full framework on Saturday March 11 at 09:00 UTC.`,
          scenario: `USDC at $0.92. She runs the five-step analysis in 20 minutes: (1) Level 2 classification — mechanism intact, bounded event. (2) Mathematical floor: $0.9175 worst case. Current $0.92 is at the floor — already fully priced. (3) Pool: 64% USDC and rising — maximum stress indicator. (4) Resolution pathway: high probability of government action within 48 hours (Fed stress facilities, FDIC backstop precedent). (5) Decision: buy $100K USDC at $0.92. Conviction: the $0.87 low has not happened yet — she does not try to time the absolute bottom. She buys at $0.92 and sets a monitoring alert for any government announcement.`,
          outcome: `March 12 18:00 UTC: Fed and FDIC announce SVB depositors made whole. USDC jumps from $0.89 (where it had drifted) to $0.998 within 3 hours. Priya's $100K USDC position: bought at $0.92, now worth $108,478 ($8,478 profit in 36 hours). Her existing DeFi positions which had depegged: returned to full value. The framework gave her the conviction to act when others were panic-selling.`,
        },
        {
          contextTag: `[DeFi protocol impact — Aave USDC collateral positions]`,
          context: `Maya tracks what happened to Aave positions collateralised with USDC during the depeg.`,
          scenario: `Jake holds: $500K USDC as collateral on Aave V3 Ethereum, $400K USDC debt. At $1.00: health factor = $500K × 80% LT / $400K = 1.0 (exactly at liquidation, but let's say more realistically 78% LTV). At $0.87 USDC (Aave oracle updates): collateral = $500K × $0.87 = $435K. Health factor = $435K × 0.80 / $400K = 0.87. BELOW 1.0: LIQUIDATABLE. The USDC depeg to $0.87 pushed his health factor below 1.0 — not because ETH moved but because his "stable" collateral moved. Liquidation bots scan and start liquidating his position. He must repay USDC debt to restore health factor — but USDC is the stressed asset.`,
          outcome: `Maya documents: the USDC depeg created a situation where "stablecoin collateral" behaved like volatile asset collateral. Users who used USDC as collateral (thinking it was "safe") faced unexpected liquidations. Lesson: using a stablecoin as collateral means accepting the stablecoin's specific mechanism risks, not just its dollar stability assumption.`,
        },
        {
          contextTag: `[Post-event protocol governance response]`,
          context: `Jake studies how MakerDAO responded to the USDC SVB depeg.`,
          scenario: `Sunday March 12: MakerDAO governance activates Emergency Shutdown Protocol level procedures. Actions taken: (1) Paused new DAI mints using USDC as collateral (temporarily prevents DAI becoming undercollateralised). (2) Emergency governance vote to reduce USDC collateral factor. (3) Activated the PSM (Peg Stability Module) to allow DAI/USDC swaps — this creates DAI demand to support the peg. (4) By Monday: USDC recovered, MakerDAO resumes normal operations. Long-term response: governance discussed and began actively reducing USDC dependency in favor of ETH/stETH collateral and RWA. USDC dependency was identified as a systemic risk that the SVB event exposed.`,
          outcome: `Jake documents: the MakerDAO governance response was rapid and correct. Emergency procedures existed and were activated. The protocol survived without DAI depeg. Long-term: the event accelerated MakerDAO's RWA strategy — reducing USDC dependency is the direct policy outcome of the SVB event.`,
        },
      ],

      keyTakeaway: `USDC March 2023 depeg analysis: Level 2 (bounded event — $3.3B at SVB, 8.25% max shortfall). Mathematical floor: $0.9175 (market low of $0.87 was below floor — panic overshoot). Pool signal: 76% 3pool USDC = max stress confirmation. Resolution pathway: 70-80% government backstop probability from historical precedent. Correct action: hold existing positions, buy at $0.87-0.92 with high conviction. Outcome: peg restored in 60 hours, +11.4% return for buyers at the low. DeFi impact: Aave USDC-collateral positions faced unexpected health factor drops, MakerDAO paused new mints. The five-step depeg analysis framework — classification, floor, pool signal, resolution pathway, decision — gives the methodology to act with conviction rather than panic.`,

      guidedPractice: [
        {
          question: `Apply Step 1 (classification): USDC fell to $0.87 because $3.3B of reserves were at SVB. Is this a Level 1, 2, or 3 depeg?`,
          options: [
            `A) Level 3 — mechanism failure, no recovery possible`,
            `B) Level 2 — specific, bounded event with identifiable resolution pathway. The USDC mechanism is intact; the problem is limited to $3.3B in one bank with a known potential resolution (government backstop or FDIC process)`,
            `C) Level 1 — pure sentiment, no actual reserve concern`,
            `D) Cannot classify without knowing the final outcome`,
          ],
          correct: 1,
          explanation: `Level 2 classification criteria: specific, identifiable cause with bounded scope, and a recovery pathway exists if the event resolves. All three criteria met: (1) Specific cause: $3.3B at SVB. (2) Bounded: $3.3B / $40B = 8.25% max shortfall. (3) Recovery pathway: FDIC process or government backstop (historical precedent in 2008 strongly suggested this). Level 3 would require: USDC mechanism permanently broken, all reserves lost, no recovery possible — none of these were true.`,
          hint: `Apply the three level tests: is the mechanism broken? Is there a specific bounded event? Does a recovery pathway exist?`,
        },
        {
          question: `Step 2: USDC fell to $0.87. The mathematical worst-case floor is $0.9175 ($3.3B shortfall on $40B supply). What does trading below the floor tell you?`,
          options: [
            `A) The market has identified additional hidden reserve problems`,
            `B) The market is pricing in worse than the identified worst case — panic overshoot. This creates a buying opportunity for researchers who are confident the identified worst case is actually the real worst case`,
            `C) The mathematical floor calculation is wrong`,
            `D) USDC is trading correctly at fair value`,
          ],
          correct: 1,
          explanation: `If $0.9175 is the mathematical worst case (8.25% shortfall) and USDC trades at $0.87 — 4.75 cents below the floor — the market is either: (1) wrong about the identified worst case (maybe it's actually worse), or (2) pricing in tail risks beyond the identified event (contagion to other Circle banking partners, run on USDC generally). For a researcher who has done the homework and is confident the $3.3B is the real scope: trading at $0.87 means buying at a discount to even the worst case. This is a high-conviction buy signal for informed participants.`,
          hint: `If the mathematical worst case is $0.9175 and the market price is $0.87, what is the implied additional discount? What must the market be pricing in?`,
        },
        {
          question: `Step 3 (pool analysis): during the peak of the crisis, Curve 3pool showed 76% USDC. What does this specific number tell you about market positioning?`,
          options: [
            `A) The pool is broken — 76% of one asset means it is not working`,
            `B) 76% means maximum flight from USDC — everyone who wanted to exit USDC via Curve has already sold. This is a sentiment extreme indicator: when the most panic-driven exit pressure has been absorbed, price typically stabilises.`,
            `C) USDC deserves a 76% allocation in the pool given its size`,
            `D) The 76% means Curve is arbitraging USDC against other stablecoins`,
          ],
          correct: 1,
          explanation: `Pool composition extremes are contrarian indicators: when one asset reaches 76% of a balanced pool, most of the sellers have already sold into the pool. The pool absorbed massive USDC selling — every USDC sold into the pool was balanced by USDT/DAI leaving. When selling pressure exhausts itself (people who wanted out have exited), the remaining pool composition rebalances through arbitrage as USDC recovers. The 76% is both a confirmation of maximum stress AND an indicator that the selling wave is nearly over.`,
          hint: `When everyone who wanted to sell has already sold — what happens next? Does 76% mean "selling is just starting" or "selling is nearly exhausted"?`,
        },
        {
          question: `Why did MakerDAO correctly pause new DAI mints using USDC as collateral during the crisis?`,
          options: [
            `A) To prevent DAI from being over-supplied`,
            `B) If USDC is worth $0.87 and someone uses USDC as 1:1 DAI collateral, each $1 of collateral is actually worth $0.87 — creating undercollateralised DAI. Pausing prevents the problem from growing while the situation is unclear.`,
            `C) To drive up USDC demand by reducing DAI supply`,
            `D) Maker has a rule that prohibits minting during banking crises`,
          ],
          correct: 1,
          explanation: `DAI's PSM (Peg Stability Module) allowed USDC → DAI at 1:1. At $0.87 USDC: depositing $0.87 of real value to receive $1.00 of DAI = creating undercollateralised DAI. Pausing this mint function prevents the DAI system from becoming undercollateralised during the crisis window. Once USDC recovered to $1.00, the pause was lifted. This is exactly the kind of emergency governance action that makes DAI's governance-enabled design valuable — the immutable LUSD design (L5.7) could not have paused minting, potentially creating larger bad debt. Governance flexibility allowed the correct response.`,
          hint: `If someone deposits $0.87 worth of USDC (at depeg prices) to mint $1.00 of DAI, is the DAI fully backed?`,
        },
        {
          question: `A researcher holds $500K USDC across various DeFi positions on Saturday March 11. USDC is at $0.91. They have already classified it as Level 2 with 70% probability of recovery. Should they sell, hold, or buy more?`,
          options: [
            `A) Sell immediately — any depeg is too risky`,
            `B) Expected value analysis: 70% × $1.00 + 30% × $0.85 (bear case) = $0.955 expected value vs $0.91 current price. EV is $0.045 positive per USDC = +4.9% expected return. Hold and potentially buy more at current prices — the expected value is significantly positive.`,
            `C) Sell half and hold half — compromise always reduces risk`,
            `D) Wait for more information before deciding`,
          ],
          correct: 1,
          explanation: `EV = 70% × $1.00 + 30% × $0.85 = $0.70 + $0.255 = $0.955. Current price: $0.91. Difference: $0.045 positive expected value per USDC. On $500K: expected gain = $22,500. Decision: hold and buy more. The 30% downside scenario ($0.85 if partial recovery) produces $0.85 per USDC — a loss of $0.06 from $0.91. The 70% upside scenario ($1.00) produces $0.09 gain. Expected value analysis strongly supports holding. Selling at $0.91 locks in a loss when expected value is $0.955 — a suboptimal decision.`,
          hint: `EV = (probability of recovery × recovery price) + (probability of partial recovery × partial recovery price). What is the current price vs this EV?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-integration`,
          scenario: `Rebuild the full five-step March 2023 USDC depeg analysis as a structured brief. Step 1: classify the depeg. Step 2: calculate the mathematical floor. Step 3: interpret the 76% pool composition. Step 4: assess the resolution pathway probability. Step 5: state the correct action at each price level ($0.91, $0.87, $0.85) with specific reasoning. This brief should be reproducible — anyone reading it should be able to verify each claim.`,
          scoringCriteria: [
            `Step 1: Level 2 classification with three criteria explicitly met`,
            `Step 2: $0.9175 floor calculation shown ($3.3B / $40B = 8.25% max shortfall)`,
            `Step 3: 76% = panic extreme indicator, contrarian signal, not confirmation of fundamental break`,
            `Step 4: government backstop probability assessed with historical precedent cited`,
            `Step 5: $0.91 = hold/buy (above mathematical floor, positive EV). $0.87 = strong buy (below mathematical floor, panic overshoot). $0.85 = consider buying (genuine worst-case territory, positive EV if 70% recovery probability holds)`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `Jake held these positions on March 11, 2023: (A) $200K USDC in Aave as collateral, borrowing $150K ETH. (B) $100K in Curve 3pool LP. (C) $50K in sDAI. For each position: what specifically happened to the position's value and risk metrics during the depeg, what should Jake have done on Saturday morning, and what was the optimal Monday morning action after recovery? Calculate approximate dollar impact for each position under both "sold at $0.87" and "held to recovery" scenarios.`,
          scoringCriteria: [
            `Aave position: collateral repriced to $174K at $0.87. HF = $174K × LT / $150K ETH — may breach depending on LT. Saturday: repay some ETH debt to increase HF buffer. Monday: no action needed if recovery complete.`,
            `3pool LP: 64-76% USDC at peak. Withdrawing Saturday gives ~70% USDC at $0.87 = $87K + $30K other = $117K (vs $100K invested — gain from prior fees but loss on USDC). Waiting to Monday: pool rebalances to ~33%, withdraw at near $1.00 each = $100K+ (full recovery). Correct action: hold.`,
            `sDAI: not affected. sDAI backed by Maker's ETH/RWA collateral, not USDC. Value unchanged through entire event. No action needed.`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Using historical data from CoinGecko (USDC price March 2023) and Curve Analytics or DeFiLlama historical pool data, reconstruct the exact price timeline and pool composition timeline of the USDC SVB depeg. Record: (A) exact low price and timestamp, (B) exact peak 3pool USDC%, (C) time from Fed announcement to peg restoration, (D) maximum peg deviation duration. Then calculate: an investor who bought $100K USDC at the exact low and held to peg restoration — what was their annualised return on that position?`,
          scoringCriteria: [
            `USDC low: approximately $0.87 on March 11 around midday EST — specific timestamp varies by exchange`,
            `3pool peak: approximately 76% USDC, Saturday afternoon`,
            `Recovery timing: within 6 hours of Sunday evening Fed announcement`,
            `Annualised return calculation: ($1.00 − $0.87) / $0.87 = 14.9% gain in approximately 12-18 hours = annualised 14.9% × (8760/15) ≈ 8,700% annualised. This illustrates why depeg analysis creates exceptional short-duration opportunities.`,
          ],
        },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 5.15 — STABLECOIN HEALTH CHECK (LAB 6 CAPSTONE)
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'stablecoin-health-check',
      title: `5.15 Stablecoin Health Check — The Complete Evaluation Framework`,
      subtitle: `The Lab 6 capstone. One framework, any stablecoin. From USDT to USDe to a stablecoin nobody has heard of yet. If you can answer these eight questions, you understand the risk.`,
      difficulty: 'intermediate',
      previousLessonRef: `Lab 6 has covered every major stablecoin type, mechanism, metric, depeg case study, cross-chain risk, yield source, and the complete USDC 2023 event analysis. This capstone lesson synthesises everything into a repeatable health check framework — the eight-question evaluation that applies to any stablecoin, current or future.`,

      hook: `In 2020, a researcher who had memorised stablecoin names would not have predicted UST's collapse. A researcher who asked "what happens if LUNA drops 80%?" would have. The eight-question health check does not require memorising anything. It requires asking the right questions about any stablecoin you encounter — and following the logic wherever it leads.`,

      visualPrompt: `An eight-question checklist card with traffic-light scoring: Q1 Mechanism type (A-D), Q2 Backing quality (A-D), Q3 Backing independence (A-D), Q4 Peg enforcement (A-D), Q5 Governance risk (A-D), Q6 Oracle risk (A-D), Q7 Track record (A-D), Q8 Yield sustainability (A-D). Below: weighted score → overall grade. Caption: "Eight questions. Any stablecoin. One defensible verdict."`,

      explanation: `Now for the final challenge.

Create a framework to assess the health and risk of any stablecoin. Not just the ones you've studied — any stablecoin you encounter in the future. The framework has eight questions. Answer them honestly and you understand the risk.

**Question 1: What is the mechanism type?**

Answer: fiat-backed, crypto-backed, algorithmic, or hybrid. This determines the failure mode category. Algorithmic = potential death spiral. Fiat-backed = potential issuer insolvency or regulatory seizure. Crypto-backed = potential collateral crash.

Grade: A (fiat-backed with reserves, or crypto-backed with proven track record), B (hybrid with meaningful collateral floor), C (newer mechanism, limited track record), D (pure algorithmic).

**Question 2: What backs it and what is the backing quality?**

Answer: exactly what assets. For fiat-backed: US Treasuries (A) vs commercial paper (B) vs unsecured loans (D). For crypto-backed: ETH (A) vs altcoins (B-C). For algorithmic: governance token = circular backing = D.

**Question 3: Is the backing independent of the stablecoin's own success?**

This is the UST question. LUNA's value depended on UST's success → circular failure. ETH's value does not depend on DAI's success → non-circular.

Grade: A (fully independent), B (partially independent), D (circular — backs stablecoin's own stability).

**Question 4: What enforces the peg and how reliable is it?**

Fiat-backed: arbitrage + direct redemption (A). Crypto-backed: liquidation system (grade depends on liquidation mechanism quality). Algorithmic: seigniorage mechanism (C-D). LUSD: hard floor via permissionless redemption (A).

**Question 5: What is the governance risk?**

Who can change what parameters and how quickly? Immutable (LUSD): A, no risk. DAO governance (MakerDAO): B, requires MKR votes with timelock. Single issuer (Circle): C-D, single entity can freeze wallets. Algorithmic DAO: C, emergency powers possible.

**Question 6: What oracle does it depend on?**

Fiat-backed: no oracle needed for peg (arbitrage based on direct redemption). Crypto-backed: Chainlink (A), single DEX TWAP (D). Quality of oracle determines quality of liquidation trigger.

**Question 7: What is the track record?**

Age and stress tests passed. 5+ years, multiple market crashes survived (Aave): A. 2-4 years, survived one major crisis (DAI): A-B. Under 1 year, no significant stress test: C-D.

**Question 8: Is the yield sustainable?**

Apply L6.1 real yield test. Identify yield source. Real yield with clear economic activity: A. Emission yield: C. Circular yield (stablecoin's own token): D.

**Scoring:**

8 grades. Weight Q3 (backing independence) and Q7 (track record) most heavily — these catch the UST failure mode. A-B majority: safe for significant allocation. C majority with B's: small allocation with monitoring. D on Q3: do not allocate regardless of yield.`,

      examples: [
        {
          contextTag: `[Full health check — USDC]`,
          context: `Maya runs the complete eight-question health check on USDC for the research brief.`,
          scenario: `Q1: Fiat-backed (A). Q2: US Treasuries + Repos (A). Q3: US Treasury value is fully independent of USDC's success (A). Q4: direct redemption arbitrage with Circle, Deloitte monthly attestations (A). Q5: Circle can freeze wallets, SEC regulation could change terms, but not a DAO with emergency vote risk (B). Q6: No oracle needed — direct redemption (A). Q7: 6 years live, survived SVB 2023, resumed at $1.00 in 60 hours (A). Q8: No native yield — must deploy in external protocols. Yield from Aave/Curve is real (A for those protocols). Weighted score: 7× A, 1× B. Overall: A. Verdict: Core allocation asset. Primary risk: Circle issuer risk (wallet freeze, regulatory seizure, SVB-style reserve concentration).`,
          outcome: `Maya's scorecard: USDC earns the highest possible score with one B (governance risk from Circle). It is the benchmark stablecoin for the team's allocation. Any alternative needs to show comparable or better scores to replace it as the core holding.`,
        },
        {
          contextTag: `[Full health check — a new stablecoin]`,
          context: `A new stablecoin "NEWSD" launches with 20% APY, backed by "protocol revenues and governance token NEWGOV."`,
          scenario: `Q1: Algorithmic (D — backed by governance token). Q2: NEWGOV token — its value derives from the protocol's success, which derives from NEWSD's success (D — circular). Q3: NEWGOV depends on NEWSD's success (D — circular). Q4: algorithmic mint/burn mechanism (C-D). Q5: DAO governance with emergency powers (C). Q6: single DEX oracle for NEWGOV price (C-D). Q7: 3 months old, no market stress test (D). Q8: 20% APY — is it from real protocol revenue? If protocol revenue only generates 2% real yield: 18% is emission from NEWGOV inflation. If NEWGOV drops 80%: yield drops to 2% + 3.6% = 5.6% (D on sustainability). Weighted score: 5× D, 2× C, 1× C. Overall: D. Verdict: Do not allocate. Death spiral risk is structurally present. No track record. Circular backing.`,
          outcome: `Maya's verdict documents specifically which questions fail: Q1 (mechanism), Q2 (backing quality), Q3 (backing independence — the UST question), Q7 (no track record), Q8 (emission yield). The 20% yield is decorative — the structural failure modes are too severe for any allocation.`,
        },
        {
          contextTag: `[Full health check — USDe (Ethena)]`,
          context: `Jake runs the health check on USDe for the team's yield strategy assessment.`,
          scenario: `Q1: Synthetic/delta-neutral (B — novel mechanism, real collateral with real economic source). Q2: ETH/stETH spot + perp short hedge (B — real assets, but complex. Exchange counterparty risk for perps.) Q3: ETH value is independent of USDe's success. Funding rate payers are independent traders (B). Q4: Delta-neutral peg maintained by continuous hedge adjustment. No direct hard floor like LUSD (B-C). Q5: Ethena DAO governance controls fee distribution and reserve — can change parameters (B). Q6: Pyth + Chainlink for underlying prices (B). Q7: Launched 2024, peak $3.5B supply, no full bear market test yet (C). Q8: Funding rate yield is real (real economic source) but variable — negative in bear markets (B in bull, C overall due to variability). Weighted score: 3× B, 3× B-C, 1× C, 1× B. Overall: B. Verdict: Appropriate for tactical bull market yield allocation with position sizing reflecting exchange counterparty and cycle risk.`,
          outcome: `Jake's USDe verdict: B-grade stablecoin for yield purposes in bull phases. Not a core reserve currency (USDC/DAI for that). Not an allocation to avoid (too much real yield opportunity). Position sizing: up to 20% of stablecoin yield allocation in confirmed bull markets.`,
        },
      ],

      keyTakeaway: `Eight-question stablecoin health check: (1) mechanism type, (2) backing quality, (3) backing independence from stablecoin's own success (the UST question — weight most heavily), (4) peg enforcement mechanism, (5) governance risk, (6) oracle quality, (7) track record through stress events, (8) yield sustainability. D on Q3 (circular backing): do not allocate regardless of yield. A-B majority: core allocation. C majority: tactical with monitoring. Run this check on any stablecoin before allocating. The framework finds the UST failure mode in 5 minutes. It would have identified every major stablecoin failure before it happened.`,

      guidedPractice: [
        {
          question: `Question 3 of the health check asks: "Is the backing independent of the stablecoin's own success?" UST's LUNA failed this test. Which of these also fails this test?`,
          options: [
            `A) USDC (backed by US Treasury bills)`,
            `B) A new stablecoin backed by "protocol fees from the stablecoin's own lending platform" — if fewer people use the stablecoin, fewer protocol fees → weaker backing → less confidence → fewer people use it`,
            `C) DAI (backed by ETH)`,
            `D) LUSD (backed by ETH)`,
          ],
          correct: 1,
          explanation: `Circular backing test: does the backing asset's value depend on the stablecoin's success? US Treasuries: independent. ETH: independent. Protocol fees from the stablecoin's own lending: if stablecoin loses market share, fewer borrowers, fewer fees, weaker backing, lower confidence, more selling → feedback loop identical to UST/LUNA. Any backing that strengthens when the stablecoin grows and weakens when it shrinks is circular backing. This is the most important single question in the health check.`,
          hint: `Draw the dependency chain: if fewer people use the stablecoin → what happens to the backing asset's value? Does the backing asset's value feed back to the stablecoin's demand?`,
        },
        {
          question: `A stablecoin scores: Q1 fiat-backed (A), Q2 US Treasuries (A), Q3 independent (A), Q4 arbitrage (A), Q5 single issuer can freeze (B), Q6 no oracle needed (A), Q7 2 years live, no major stress test (B), Q8 real yield from Aave (A). What is the overall grade and primary risk?`,
          options: [
            `A) D — the issuer freeze capability makes it dangerous`,
            `B) A-B overall. Primary risk: Q5 (issuer freeze risk) and Q7 (limited stress test history). This profile is consistent with a newer fiat-backed stablecoin — strong mechanism, limited battle-testing, issuer centralisation risk.`,
            `C) C — the 2-year track record is insufficient`,
            `D) B overall, but the lack of oracle makes it unverifiable`,
          ],
          correct: 1,
          explanation: `Scorecard: 6× A, 2× B = predominantly A with two moderate concerns. The issuer freeze (Q5 = B) is a real but manageable risk — Circle and Tether both have freeze capability, which is accepted as a cost of fiat-backing. The 2-year track record with no major stress test (Q7 = B) is the more concerning gap — UST looked fine for 2 years before failing. The overall A-B grade is appropriate: safe for significant allocation with awareness that the stress test gap means unknown failure modes may exist.`,
          hint: `Count the A grades vs B grades. Is there any D? How should the absence of any D influence the overall assessment?`,
        },
        {
          question: `LUSD's health check: Q1 crypto-backed (A), Q2 ETH only 200%+ (A), Q3 independent (A), Q4 hard floor via permissionless redemption (A), Q5 no governance (A), Q6 Chainlink (A), Q7 4 years live, Black Thursday stress-tested via ETH crash scenario (A), Q8 Stability Pool variable yield (B). This is nearly a perfect score. Why is LUSD not the dominant stablecoin?`,
          options: [
            `A) LUSD has worse smart contracts than USDC`,
            `B) LUSD's near-perfect mechanism score does not translate to market cap because: it only accepts ETH (limiting supply), it has no yield for non-Stability-Pool holders (limiting demand), and it lacks the ecosystem integrations that make USDC/USDT the default choice across all of DeFi`,
            `C) LUSD is too complex for most users`,
            `D) LUSD's immutability means it cannot add features`,
          ],
          correct: 1,
          explanation: `Mechanism quality ≠ market adoption. LUSD's limitations: (1) ETH-only collateral caps total supply (can't grow beyond ETH borrowing demand). (2) No native yield for holders (Stability Pool earns variable ETH income, but there's no "sLUSD" equivalent to sDAI's DSR). (3) Limited DeFi integrations — LUSD is not as deeply embedded in Curve, Aave, or cross-chain infrastructure as USDC/DAI. The health check evaluates safety, not utility or growth potential. LUSD is the safest well-designed stablecoin; it is not the most useful or widely used.`,
          hint: `The health check measures mechanism safety. What other factors determine whether a stablecoin achieves large market cap?`,
        },
        {
          question: `Connecting to L5.13: a stablecoin with a perfect mechanism score (all A's) offers 15% yield funded by "protocol revenues from our lending market." How does Q8 (yield sustainability) grade this?`,
          options: [
            `A) A — protocol revenues are real yield`,
            `B) Requires decomposition: (1) what percentage of 15% is real protocol revenue? If protocol revenue supports only 4%, the other 11% is emission yield or circular — Q8 grade depends on the decomposition result`,
            `C) A — 15% APY confirms strong real yield`,
            `D) D — high APY is always a red flag`,
          ],
          correct: 1,
          explanation: `From L6.1 and L5.13: "protocol revenues" could mean: (A) lending interest from external borrowers (real yield), (B) governance token inflation distributed as "revenue" (emission yield), or (C) fees from the stablecoin's own ecosystem (potentially circular if the ecosystem's health depends on the stablecoin's success). The Q8 grade requires running the real yield test: if emissions stopped today, what yield remains? A perfect mechanism score with unsustainable emission yield creates a contradiction: safe stablecoin mechanism, but the yield that's attracting users won't persist. The protocol may maintain its peg while offering near-zero yield once emissions normalise.`,
          hint: `From L6.1: what is the real yield test? Apply it to "15% from protocol revenues" — what question must you ask?`,
        },
        {
          question: `A researcher uses the eight-question framework on a new stablecoin and finds: Q3 scores D (circular backing) but all other questions score A. Should they allocate given the seven A grades?`,
          options: [
            `A) Yes — seven A's outweigh one D`,
            `B) No — Q3 D (circular backing) is a structural failure mode that makes all other quality signals irrelevant. A perfect mechanism design around circular backing still collapses when the backing asset's value crashes simultaneously with stablecoin confidence. The UST precedent makes Q3 D a hard disqualifier.`,
            `C) Allocate a small percentage to capture yield`,
            `D) The framework is wrong if it produces contradictory results`,
          ],
          correct: 1,
          explanation: `Q3 is weighted most heavily because it identifies the death spiral failure mode. UST scored well on mechanism design, governance (Luna Foundation had clear leadership), oracle quality, and yield (19.5%). The only critical failure: Q3 D — LUNA's value depended on UST's success. When UST confidence broke, LUNA and UST collapsed together. Seven A's around a D on Q3 is like a building with seven structural certifications but sitting on a foundation that collapses under pressure. The D on Q3 disqualifies the stablecoin regardless of other scores.`,
          hint: `What did UST score on most dimensions before it collapsed? What was the one question it would have failed? Does that one failure matter?`,
        },
      ],

      lessonSimulations: [
        {
          type: `judgment-integration`,
          scenario: `Run the complete eight-question health check on DAI (MakerDAO). For each question: state the specific answer with supporting evidence from Lab 6 lessons, assign a grade A-D, and identify one specific risk or strength that justifies the grade. Then produce the overall verdict and recommended allocation tier (core, tactical, minimal, avoid).`,
          scoringCriteria: [
            `Q1 crypto-backed: A. Q2 ETH/stETH/RWA — ETH is A, USDC component lowers to B overall. Q3 ETH independent: A (but USDC component: B — March 2023 showed USDC risk propagates). Q4 liquidation + arbitrage: A. Q5 MakerDAO governance, adjustable DSR, collateral types: B.`,
            `Q6 Chainlink: A. Q7 6 years, Black Thursday, SVB crisis survived: A. Q8 DSR from RWA/stability fees: A (real yield).`,
            `Weighted: mostly A, one B (governance). Overall: A-. Core allocation.`,
            `Specific risks noted: USDC component (Q3 weakness), governance rate changes (Q5), complexity of multi-collateral system (Q2).`,
          ],
        },
        {
          type: `judgment-risk-assess`,
          scenario: `A colleague presents three new stablecoins they found on DeFiLlama offering high yields: Coin A (backed by "a basket of crypto assets including the team's own token"), Coin B (fully backed by USDC with 0% algorithmic component, 18-month track record, Deloitte attestation), Coin C (delta-neutral using SOL perps, 6-month track record, 30% APY). Run Q3 and Q7 specifically for each coin. Which ones pass both? Which fail? Recommend allocations.`,
          scoringCriteria: [
            `Coin A: Q3 D (team's own token is circular — identical to UST failure mode). Q7 likely D if new. Verdict: avoid. Q3 D is disqualifying.`,
            `Coin B: Q3 A (USDC backing is independent). Q7 C (18 months, no major stress test). Verdict: small tactical allocation with monitoring. Good mechanism, limited proof.`,
            `Coin C: Q3 B (SOL value independent of the stablecoin, but Solana-specific risks and exchange counterparty risk). Q7 D (6 months, no stress test, 30% yield suggests untested mechanism). Verdict: minimal allocation at most. Too young with too high yield for this risk.`,
          ],
        },
        {
          type: `judgment-data-interpret`,
          scenario: `Find one stablecoin on DeFiLlama that you have NOT studied in Lab 6 (exclude USDC, USDT, DAI, LUSD, FRAX, USDe). Run the full eight-question health check on it using publicly available information (protocol documentation, reserve reports, CoinGecko). Produce the scored checklist, overall grade, and a two-sentence investment verdict. This is the Lab 6 final boss simulation — apply everything.`,
          scoringCriteria: [
            `All eight questions answered with specific evidence (not estimates)`,
            `Grade assigned for each with one supporting sentence`,
            `Q3 (backing independence) explicitly evaluated — not just skimmed`,
            `Overall grade and verdict consistent with the individual scores. Verdict mentions the single highest-risk dimension and the single strongest safety property.`,
          ],
        },
      ],
    },
