// ============================================================================
// DeFi RESEARCH CURRICULUM — SECTION 3B: YIELD & LIQUIDITY DEEP DIVE (Part B)
// Lessons: staking → yield-aggregators
// ============================================================================

export const yieldLiquidityPartB = {
  id: 'yield-liquidity-b',
  lessons: [

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.6 — STAKING
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'staking',
      title: `6.6 Staking — Proof-of-Stake Yields and What You Actually Earn`,
      subtitle: `Ethereum pays validators ~3.5% APY for securing the network. Solana pays ~7%. Cosmos pays ~15%. The differences aren't random — they reflect deliberate design choices. Here's what drives staking yields across chains.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.5 you mastered concentrated liquidity strategies — the most active form of LP management. Staking is the opposite: the most passive real yield in crypto. This lesson covers the mechanics, compares yields across chains, and explains why staking rates vary so dramatically.`,

      hook: `Ethereum validators earned $3.5B in staking rewards in 2023. That's real yield — paid by the network to anyone who helps secure it. No protocol token needed, no active management. Just 32 ETH and an internet connection. But most people can't stake 32 ETH directly. Here's every option.`,

      visualPrompt: `A chain comparison bar chart: Ethereum (3.5% APY, blue), Solana (7%, green), Cosmos (14-20%, purple), Polkadot (14%, orange), Avalanche (8%, red). Below each bar: validator count (Ethereum 500K+, Solana ~2K, Cosmos per-chain 150). Caption: "Higher staking yield = fewer validators = less decentralization. The trade-off is real."`,

      explanation: `Let me tell you about the most basic form of crypto yield.

[Proof-of-Stake] blockchains need [validators] to secure the network — process transactions, propose blocks, attest to correctness. In return, validators earn [staking rewards]: newly minted tokens plus transaction fees.

This is [staking yield] — the cleanest real yield in crypto. You lock tokens, secure the network, earn rewards. No trading fees needed. No borrowers required. Just the network compensating you for the service you provide.

**How staking rewards are calculated:**

[Staking APY] = (Annual Network Emissions + Annual Transaction Fees) / Total Staked Supply

Example: Ethereum emits roughly 1,700 ETH/day in new issuance plus ~300-600 ETH/day in transaction fees (post-EIP-1559 tips). With ~33M ETH staked: annual yield ≈ 3.2-3.8%.

**Why yields differ across chains:**

[Ethereum]: ~3.5% APY. Low because: 500,000+ validators, massive staked supply, low inflation policy (EIP-1559 burns fees). Very decentralized. Very stable.

[Solana]: ~7% APY. Higher because: fewer validators (~2,000), higher inflation rate (currently ~5%), validator economics require higher rewards to compensate for hardware costs. More centralized.

[Cosmos chains (ATOM)]: ~14-20% APY. High because: individual chains with small validator sets, high inflation rates to bootstrap security, governance-controlled. Warning: Cosmos inflation often outpaces token price appreciation — real purchasing power return may be lower than headline APY.

[Polkadot (DOT)]: ~14% APY. Similar mechanics to Cosmos. High nominal, check inflation rate for real return.

**The inflation-adjusted real yield:**

[Nominal staking APY] − [Token inflation rate] = Real staking yield

Ethereum: 3.5% − 0.3% inflation (net deflationary in some periods) = ~3.2-3.5% real. Strong.
Cosmos ATOM: 20% APY − 15% inflation = ~5% real. Weaker than it looks.
Solana: 7% APY − 5% inflation = ~2% real. The headline is misleading.

Always check inflation rates (Messari, chain docs) before comparing staking yields across chains.

**Methods for ETH staking:**

[Solo staking]: run your own validator. Requires 32 ETH + hardware + 24/7 uptime. Maximum yield, maximum decentralization, maximum responsibility.

[Pooled staking (Lido, Rocket Pool)]: covered in depth in L6.7. Accepts any amount of ETH, returns liquid staking tokens.

[Exchange staking (Coinbase, Binance)]: simplest, lowest yield (exchange takes 25-50% cut). Centralized risk.

[Staking-as-a-service (StakeFish, Figment)]: professional node operation for whale stakers. Lower fees than exchanges, more trust required than solo.`,

      examples: [
        {
          title: `Ethereum real yield calculation`,
          scenario: `Validator Jake stakes 32 ETH at $3,000/ETH ($96,000). Annual staking rewards: 3.5% APY. Reward composition: ~1.5% from new ETH issuance + ~2% from priority fees (MEV + tips). Annual reward: 1.12 ETH = $3,360 at current prices. Real yield adjustment: Ethereum net issuance is near-zero/deflationary (EIP-1559 burns base fees). Effective real yield: ~3.3-3.5% — essentially all of the nominal yield is real. Compare to gold mining: zero yield. Compare to US Treasury: 4.5% but with USD inflation of 3%+ = 1.5% real. Ethereum staking at 3.5% is genuinely competitive with TradFi on a risk-adjusted basis for ETH holders.`,
          lesson: `Ethereum staking is one of the few "clean" real yields in crypto: real issuance, real fee revenue, near-zero net inflation. For long-term ETH holders, staking is the obvious baseline — it's free yield on an asset you'd hold anyway.`,
        },
        {
          title: `Cosmos ATOM — the headline vs reality`,
          scenario: `ATOM staking advertises 20% APY. Maria stakes 1,000 ATOM at $10 ($10,000). After 1 year: 1,200 ATOM earned. But ATOM's inflation rate is 15% annually (all stakers receive it proportionally, diluting non-stakers). If she hadn't staked: her 1,000 ATOM would represent 8.7% less of the total supply (diluted by others staking). Net effect: her staking protected her from dilution and earned ~5% real above inflation. Real return: 1,200 ATOM vs 1,000 start = 20% nominal. But: the network issued 15% more ATOM overall. Her 1,200 represents slightly less purchasing power than the 20% headline suggests. At $10 stable price: $12,000 vs $10,000 = 20% gain. At declining ATOM price (−10%): $10,800 vs $10,000 = 8%. Staking doesn't protect against token price decline.`,
          lesson: `High-inflation Cosmos chains have misleading nominal APYs. Staking protects against relative dilution (vs not staking) but doesn't protect against absolute token price decline. Calculate real yield (nominal − inflation) and apply your price view before sizing a Cosmos staking position.`,
        },
        {
          title: `Exchange staking vs solo — the yield comparison`,
          scenario: `Priya has 32 ETH. Option A: solo validator (3.5% APY, keeps 100%). Option B: Coinbase staking (3.5% gross APY, Coinbase takes 25% cut → 2.625% net). Option C: Lido (3.5% gross, 10% cut → 3.15% net, gets liquid stETH). Over 3 years on 32 ETH ($3,000/ETH = $96,000): Solo: 32 × 3 × 3.5% = 3.36 ETH earned = $10,080. Coinbase: 3 × 2.625% × 32 ETH = 2.52 ETH = $7,560. Lido: 3 × 3.15% × 32 ETH = 3.024 ETH = $9,072. Plus Lido: she has liquid stETH usable in DeFi (potential extra yield from L6.7). Solo wins on raw yield; Lido wins on flexibility.`,
          lesson: `Exchange staking's 25-50% fee cut is enormous over a multi-year horizon. Lido's 10% cut is much more reasonable. Solo staking wins on raw yield but requires technical setup and 24/7 uptime. For most ETH holders: Lido is the practical optimum (liquid, small fee, decentralized-ish).`,
        },
      ],

      guidedPractice: [
        {
          question: `Solana's staking APY is 7%. Solana's inflation rate is approximately 5%. What is the real staking yield?`,
          options: [`A) 7%`, `B) 12%`, `C) 2%`, `D) −5%`],
          correct: `C) 2%`,
          hint: `Real yield = Nominal APY − Inflation rate. 7% − 5% = ?`,
          explanation: `7% − 5% = 2% real staking yield. The 5% inflation means all SOL holders are diluted unless they stake. Staking protects against dilution AND earns the additional 2% real. Compare to Ethereum at 3.5% nominal − 0.3% net inflation = 3.2% real. Ethereum's lower nominal rate actually delivers more real yield than Solana's 7% headline.`,
        },
        {
          question: `What is the minimum ETH required to run your own Ethereum validator (solo staking)?`,
          options: [`A) 0.1 ETH`, `B) 16 ETH`, `C) 32 ETH`, `D) 1,000 ETH`],
          correct: `C) 32 ETH`,
          hint: `Ethereum's consensus layer requires a specific stake amount per validator. This is a fixed protocol requirement.`,
          explanation: `32 ETH is the fixed validator deposit required by Ethereum's proof-of-stake consensus. This requirement exists to make the cost of attacking the network economically prohibitive. With ETH at $3,000: 32 ETH = $96,000 minimum for solo staking. This is why liquid staking protocols (Lido, Rocket Pool) pooling smaller amounts exist — most ETH holders can't afford 32 ETH.`,
        },
        {
          question: `Connecting to L2.13 (Osmosis): Osmosis stakers are also chain validators. How does this differ from staking ETH on Lido?`,
          options: [
            `A) They're identical — staking is staking`,
            `B) Osmosis stakers = validators who secure a sovereign chain and earn 100% of DEX fee revenue. Lido stakers earn ETH network rewards only, with Lido taking a 10% cut. App-chain stakers capture all protocol revenue.`,
            `C) Osmosis has higher APY so it's better`,
            `D) Lido stakers also validate the Ethereum chain directly`,
          ],
          correct: `B) Osmosis stakers = validators who secure a sovereign chain and earn 100% of DEX fee revenue. Lido stakers earn ETH network rewards only, with Lido taking a 10% cut. App-chain stakers capture all protocol revenue.`,
          hint: `From L3.10 (Osmosis): what do OSMO stakers earn? From L6.6: what does ETH staking reward come from?`,
          explanation: `App-chain staking (Osmosis/dYdX): stake the chain's token → become a validator → earn all transaction fees from all DEX activity on that chain. The chain IS the protocol. ETH staking (via Lido): stake ETH → Lido runs validators → earn ETH network issuance + priority fees → Lido keeps 10%. The app-chain model gives validators direct exposure to protocol revenue, not just network security rewards.`,
        },
        {
          question: `A validator is "slashed." What does this mean and when does it happen?`,
          options: [
            `A) The validator's rewards are temporarily reduced`,
            `B) A portion of the validator's staked ETH is permanently destroyed as a penalty for provably malicious behavior (double voting, equivocation) or severe downtime`,
            `C) The validator is temporarily removed from the active set`,
            `D) The validator's fees are redirected to the protocol treasury`,
          ],
          correct: `B) A portion of the validator's staked ETH is permanently destroyed as a penalty for provably malicious behavior (double voting, equivocation) or severe downtime`,
          hint: `Slashing is a penalty mechanism — what behavior is it designed to prevent?`,
          explanation: `Slashing permanently destroys a portion of a validator's staked ETH for provably malicious behavior — primarily "double signing" (signing two different blocks at the same height, which could enable double-spending attacks). Minor downtime causes small inactivity penalties, not full slashing. Major slashing events: loss of 1 ETH minimum + ongoing penalties. This creates a strong economic incentive for validators to behave honestly — the penalty far exceeds any profit from cheating.`,
        },
        {
          question: `Which staking option is best for a user with 1 ETH and no interest in node operation, who wants the highest yield with liquidity?`,
          options: [
            `A) Solo validator — highest yield`,
            `B) Exchange staking — simplest`,
            `C) Lido or Rocket Pool — accepts any ETH amount, provides liquid stETH/rETH, 10% fee is lower than exchanges`,
            `D) Don't stake — keep ETH liquid`,
          ],
          correct: `C) Lido or Rocket Pool — accepts any ETH amount, provides liquid stETH/rETH, 10% fee is lower than exchanges`,
          hint: `1 ETH rules out solo (needs 32). Exchange staking has 25-50% fee. Which option combines accessibility, reasonable fees, and liquidity?`,
          explanation: `Solo: impossible (need 32 ETH). Exchange staking: simple but 25-50% of rewards go to the exchange — for long-term holders this is very expensive. Lido/Rocket Pool: accepts 0.001 ETH minimum, provides liquid stETH/rETH usable in DeFi, charges only 10% of rewards. For 1 ETH: liquid staking is clearly optimal. stETH can then be used as collateral (Aave), LP'd on Curve, or simply held to compound staking rewards automatically.`,
        },
      ],

      lessonSimulations: [
        {
          type: `cross-chain-staking-comparison`,
          scenario: `Compare staking across three chains using current data from Staking Rewards (stakingrewards.com) or chain documentation: Ethereum, Solana, and one Cosmos chain (ATOM, OSMO, or TIA). For each: nominal APY, inflation rate, real APY, validator count, minimum stake, and one key risk. Rank by real APY. What does the ranking reveal about the trade-off between yield and decentralization?`,
          answer: `Live research task. Expected: Ethereum real APY ~3.2-3.5%, 500K+ validators, 32 ETH min, slashing risk. Solana real APY ~2%, ~2K validators, any amount, outage risk. Cosmos chain: real APY 5-10% depending on chain, 150 validators, any amount, chain-specific risk. Ranking by real APY: Cosmos > Ethereum > Solana. But: ranking by decentralization: Ethereum >> Solana > Cosmos. The inverse correlation confirms the trade-off: higher yield chains are more centralized. For institutional capital: Ethereum dominates. For yield-maximizers comfortable with centralization: Cosmos.`,
        },
        {
          type: `staking-yield-modeling`,
          scenario: `Model a 2-year staking position: 5 ETH staked on Lido. Current price: $3,000/ETH. Lido APY: 3.2% (after 10% fee). Assume three price scenarios at end of year 2: ETH flat at $3,000, ETH at $6,000, ETH at $1,500. Calculate: (A) total stETH accumulated, (B) USD value in each scenario, (C) opportunity cost of not having used the stETH in DeFi (assume DeFi deployment could add 3% extra yield). Which scenario benefits most from staking?`,
          answer: {
            stethAccumulated: `5 ETH × (1 + 3.2%)^2 = 5 × 1.0651 = 5.326 stETH after 2 years.`,
            flatScenario: `5.326 × $3,000 = $15,978. Started with $15,000. Gain: $978. Pure staking yield.`,
            bullScenario: `5.326 × $6,000 = $31,956. ETH appreciation dominates. Staking added $978 on top.`,
            bearScenario: `5.326 × $1,500 = $7,989. Loss of $7,011 despite staking. Staking reduced the loss by $489 (earned rewards still) but couldn't offset price decline.`,
            defiOpportunity: `3% extra yield on stETH in DeFi = total 6.2% APY. After 2 years: 5 × 1.0627^2 = 5.648 stETH. At $3,000: $16,944 vs $15,978. DeFi adds $966 over 2 years.`,
            conclusion: `Staking is the right strategy regardless of price direction — it adds yield on top of whatever price performance occurs. The DeFi deployment on top of stETH adds meaningful income with modest additional risk.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: Staking Strategy Across Chains`,
        description: `L6.1 (yield sources) + L6.6 (staking). Build a multi-chain staking strategy.`,
        challenges: [
          {
            scenario: `You have $30,000 in crypto: $15,000 ETH, $8,000 SOL, $7,000 ATOM. Design a staking strategy for each that maximizes real yield while managing risks. For each asset: method (solo/liquid/exchange), protocol, real APY estimate, key risk, and what to do with any liquid staking tokens received. Total expected annual real yield in USD.`,
            answer: `ETH ($15,000): Lido (5 ETH → stETH). Real APY 3.2%. Annual real yield: $480. Risk: Lido smart contract, stETH depeg. Use stETH: deposit on Aave as collateral (conservative) or Curve stETH/ETH LP (moderate extra yield ~3%). SOL ($8,000): Marinade Finance (mSOL) or Jito (jitoSOL). Real APY ~2%. Annual: $160. Risk: Solana outage, Marinade smart contract. Use mSOL: Orca Whirlpool mSOL/SOL LP for extra fee yield. ATOM ($7,000): Stake directly via Keplr wallet to top-10 validator. Nominal ~16%, inflation ~10%, real ~6%. Annual real: $420. Risk: ATOM price decline, validator slashing. Keep liquid? ATOM liquid staking (Stride stATOM) gives access to Cosmos DeFi. Total annual real yield: $480 + $160 + $420 = $1,060 = ~3.5% blended real yield. Plus: DeFi deployment of stETH/mSOL could add $500-800 more. All positions are real yield — no emissions dependency.`,
          },
        ],
      },

      keyTakeaway: `Staking yield = network security compensation paid in newly minted tokens + transaction fees. Real yield = Nominal APY − Inflation rate. Key real yields: Ethereum 3.2-3.5% (lowest nominal, highest real quality), Solana ~2% real (7% nominal − 5% inflation), Cosmos 5-10% real (high nominal, high inflation). Methods: solo (32 ETH, max yield), liquid staking (any amount, liquid tokens, 10% fee), exchange (worst fee, 25-50% cut). Always calculate real yield before comparing staking APYs across chains.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.7 — LIQUID STAKING
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'liquid-staking',
      title: `6.7 Liquid Staking — Stake, Earn, and Still Use Your ETH`,
      subtitle: `Lido has $20B+ in staked ETH. Rocket Pool is more decentralized. Coinbase cbETH is the institutional choice. Here's the full comparison and why liquid staking is the biggest single innovation in ETH yield.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.6 you learned staking mechanics and why liquid staking is the practical optimum for most ETH holders. This lesson goes deep on the specific protocols — Lido (stETH), Rocket Pool (rETH), Coinbase (cbETH) — comparing their mechanics, fees, decentralization, and DeFi integrations.`,

      hook: `stETH has more liquidity than most ERC-20 tokens. It's on Aave as collateral, in Curve's biggest pools, and used by hedge funds as a base position. Yet it's just a receipt for staked ETH. Understanding why stETH became DeFi's most important yield-bearing token is understanding the liquid staking revolution.`,

      visualPrompt: `Three protocol cards side by side: Lido (blue whale, "$20B+ TVL, 10% fee, stETH"), Rocket Pool (rocketship, "$3B TVL, 15% fee, rETH, more decentralized"), Coinbase (blue coin, "cbETH, institutional, 25% fee, regulated"). Below each: DeFi integrations listed. Caption: "Same underlying ETH rewards. Three different trust models, fees, and DeFi footprints."`,

      explanation: `Let me tell you about the best of both worlds.

Staking earns you rewards, but locks your tokens. What if you could stake and still use your tokens in DeFi? That's the promise of [liquid staking] — and it's been delivered.

**How liquid staking tokens work:**

You deposit ETH. The protocol stakes it across validators. You receive a [liquid staking token (LST)] representing your staked ETH + accruing rewards. The LST is transferable, tradeable, and usable in DeFi — all while your underlying ETH is still earning staking rewards.

Two LST models:

[Rebasing model (Lido stETH)]: your stETH balance increases daily to reflect accumulated rewards. Deposit 1 ETH → receive 1 stETH. Next day: your wallet shows 1.0000095 stETH (approximate daily reward). The token balance itself grows.

[Exchange rate model (Rocket Pool rETH, Coinbase cbETH)]: your token balance stays fixed but each token becomes worth more ETH over time. Deposit 1 ETH → receive 0.95 rETH. Over time: 0.95 rETH is redeemable for 1.05 ETH (example). The exchange rate grows instead of the balance.

Both models deliver identical economic results. The difference matters for DeFi integrations: rebasing tokens (stETH) cause complications in some smart contracts (balance changes unexpectedly), while exchange-rate tokens (rETH) behave like regular ERC-20 tokens.

**Protocol comparison:**

[Lido Finance (stETH)]:
- TVL: $20B+ (dominant)
- Fee: 10% of staking rewards
- Validators: ~800 professional operators (permissioned set)
- Governance: LDO token holders
- Concern: concentrated market share (~30%+ of all staked ETH) creates centralization risk — approaching the 33% threshold that could threaten Ethereum's consensus

[Rocket Pool (rETH)]:
- TVL: $3B+
- Fee: 14-15% average
- Validators: permissionless (anyone with 8 ETH + RPL bond can run a node)
- Model: more decentralized — thousands of independent node operators
- rETH: exchange-rate token, no rebasing complexity

[Coinbase (cbETH)]:
- TVL: $2B+
- Fee: 25%
- Validators: Coinbase-operated only
- Most centralized, highest fee
- Advantage: regulatory clarity (Coinbase is a public company), simple UI, institutional-grade

[Frax Finance (frxETH/sfrxETH)]:
- Novel model: frxETH (not rebasing, no yield) → wrap to sfrxETH to earn rewards
- Higher yield because validators who use frxETH as collateral enhance the reward pool
- Smaller TVL, more experimental

**The DeFi integration layer:**

stETH's deepest integrations: Aave V3 (collateral), Curve stETH/ETH pool ($1-3B TVL), Maker (collateral for DAI), Balancer wstETH/ETH pool.

rETH integrations: Aave V3 (collateral), Balancer rETH/WETH, Uniswap V3 pools.

cbETH: Aave V3 (collateral), Coinbase's ecosystem, fewer DeFi integrations.

[wstETH (wrapped stETH)] — because stETH rebases (balance changes daily), some DeFi protocols prefer wstETH (wrapped stETH) which uses the exchange-rate model instead. wstETH balance stays fixed while its ETH redemption value grows. Aave, Maker, Balancer primarily use wstETH.`,

      examples: [
        {
          title: `stETH leverage loop — the most common ETH yield strategy`,
          scenario: `Maria stakes 10 ETH → receives 10 stETH. Deposits stETH on Aave as collateral. Borrows 5 ETH (50% LTV) against the stETH. Swaps borrowed 5 ETH for 5 stETH on Curve. Deposits new 5 stETH on Aave. Borrows 2.5 ETH. Continues loop 3-4 times. End state: ~25 ETH of stETH collateral, ~12 ETH borrowed. Net exposure: effectively 25 ETH worth of staking yield minus ~2.5% borrowing cost on 12 ETH. Gross staking yield: 25 × 3.5% = 0.875 ETH/year. Borrowing cost: 12 × 2.5% = 0.3 ETH/year. Net: 0.575 ETH/year on original 10 ETH = 5.75% vs 3.5% solo. Risk: stETH depegs → Aave health factor drops → potential liquidation.`,
          lesson: `The stETH leverage loop is one of DeFi's most popular "institutional" strategies — amplifying staking yield through recursive borrowing. Widely used by funds. The key risk is stETH depeg causing cascading liquidations — witnessed in June 2022 when 3AC's unwinding pushed stETH to a 5-7% discount.`,
        },
        {
          title: `Rocket Pool's decentralization advantage`,
          scenario: `Comparing Lido and Rocket Pool from a Ethereum-health perspective: Lido has 30%+ of all staked ETH controlled by ~800 hand-picked operators. If Lido validators collude (theoretically): they approach the 33% threshold needed to disrupt finality. Rocket Pool: 5,000+ independent node operators each staking a minimum 8 ETH + RPL collateral. Attacking this requires corrupting thousands of independent actors. The ETH community has explicitly discussed the "Lido problem" — its dominance creates a centralization risk the protocol was designed to avoid. Rocket Pool's model is architecturally more aligned with Ethereum's values.`,
          lesson: `The "right" liquid staking choice isn't purely financial. Using Rocket Pool instead of Lido (despite Lido's better liquidity) is a vote for Ethereum's decentralization. Many ETH-aligned developers stake with Rocket Pool or solo stake specifically to limit Lido's dominance.`,
        },
        {
          title: `wstETH vs stETH in DeFi — why the wrapper matters`,
          scenario: `Jake tries to put stETH in a custom smart contract. Problem: the contract holds 1.0000 stETH on day 1, then 1.0001 on day 2 (rebasing). The contract's accounting assumes balances don't change on their own — the spontaneous balance change causes calculation errors. Jake wraps stETH → wstETH. wstETH balance: fixed at 0.95 (example). Exchange rate grows from 1.00 ETH/wstETH to 1.01 over time. No unexpected balance changes. Contract works perfectly. Most DeFi protocols (Aave, Balancer, Maker) use wstETH for exactly this reason.`,
          lesson: `Understanding stETH vs wstETH is operationally critical for any DeFi integration. If you're building a strategy: use wstETH for protocol interactions, stETH for Curve pools that expect rebasing tokens. Knowing which to use prevents costly integration errors.`,
        },
      ],

      guidedPractice: [
        {
          question: `Lido charges 10% of staking rewards as a fee. If Ethereum staking yields 3.5% gross, what does an stETH holder actually receive?`,
          options: [`A) 3.5%`, `B) 3.15%`, `C) 2.5%`, `D) 10%`],
          correct: `B) 3.15%`,
          hint: `10% fee on 3.5% gross. Fee amount: 3.5% × 10% = 0.35%. Net: 3.5% − 0.35% = ?`,
          explanation: `3.5% gross × (1 − 10% fee) = 3.5% × 0.90 = 3.15%. Lido's 10% fee means holders receive 90% of gross staking rewards. On $100,000 of stETH: $3,150/year vs $3,500 for a solo validator. The $350/year cost buys: no 32 ETH minimum, no hardware, no 24/7 uptime requirement, and liquid stETH usable in DeFi.`,
        },
        {
          question: `What is the key difference between stETH (rebasing) and rETH (exchange rate) in terms of how rewards are reflected?`,
          options: [
            `A) stETH earns higher rewards`,
            `B) stETH increases your token balance daily; rETH keeps balance fixed but each rETH becomes redeemable for more ETH over time — both deliver identical economic returns`,
            `C) rETH is always worth more than stETH`,
            `D) stETH is decentralized; rETH is centralized`,
          ],
          correct: `B) stETH increases your token balance daily; rETH keeps balance fixed but each rETH becomes redeemable for more ETH over time — both deliver identical economic returns`,
          hint: `Both represent staked ETH. The difference is in HOW rewards are reflected: in the token balance, or in the exchange rate?`,
          explanation: `Rebasing (stETH): 1,000 stETH today → 1,001 stETH tomorrow. Your balance grows. Exchange rate (rETH): 950 rETH today → still 950 rETH tomorrow, but redeemable for 1,002 ETH instead of 1,000. Economic return is identical. The difference matters for DeFi smart contracts — rebasing tokens cause accounting complications, so most protocols prefer wstETH (exchange-rate wrapper for stETH) or rETH.`,
        },
        {
          question: `Why does Lido's ~30%+ market share of staked ETH concern Ethereum developers?`,
          options: [
            `A) Lido charges too high a fee`,
            `B) 33% of staked ETH is the threshold for disrupting Ethereum's consensus finality — Lido's dominance approaches this limit, creating a systemic centralization risk`,
            `C) Lido's validators are anonymous`,
            `D) stETH depegs too frequently`,
          ],
          correct: `B) 33% of staked ETH is the threshold for disrupting Ethereum's consensus finality — Lido's dominance approaches this limit, creating a systemic centralization risk`,
          hint: `Ethereum uses a 2/3 supermajority for finality. What does 33%+ of validators controlled by one entity imply?`,
          explanation: `Ethereum's consensus requires 2/3 of validators to agree for finality. If one entity controls >33% of validators, it can prevent finality (a "liveness attack") even without majority control. Lido with 30%+ approaches this critical threshold. While Lido is governance-controlled and unlikely to be malicious, it represents a single governance attack surface — if Lido's governance is compromised or coerced, Ethereum's censorship resistance weakens. This is why the Ethereum community actively encourages solo staking and Rocket Pool.`,
        },
        {
          question: `Connecting to L3.5 (Curve): why is the Curve stETH/ETH pool considered critical infrastructure for liquid staking?`,
          options: [
            `A) It's where stETH is created`,
            `B) The Curve pool provides the exit liquidity for stETH holders who need ETH immediately — without it, stETH would trade at a larger discount to ETH`,
            `C) Lido controls the Curve pool`,
            `D) Curve's stETH pool has the highest APY in DeFi`,
          ],
          correct: `B) The Curve pool provides the exit liquidity for stETH holders who need ETH immediately — without it, stETH would trade at a larger discount to ETH`,
          hint: `From L3.5: why is the Curve stETH/ETH pool "critical infrastructure"? What happens if someone needs ETH but has stETH?`,
          explanation: `From L3.5 and L2.13: stETH withdrawal from Ethereum takes 7+ days (queue-dependent). If someone needs ETH immediately, they must sell stETH on the market. Curve's stETH/ETH pool provides the lowest-slippage exit (StableSwap formula, near-peg pricing). Without this pool: stETH would trade at a significant discount to ETH (illiquidity premium). The pool's $1-3B of liquidity is what makes stETH's "liquid" claim valid. This is why Lido spends heavily on Curve liquidity incentives — it's not optional, it's structural.`,
        },
        {
          question: `A hedge fund wants to deploy $10M in ETH yield with maximum regulatory clarity. Which liquid staking option is most appropriate and why?`,
          options: [
            `A) Lido — largest TVL`,
            `B) Rocket Pool — most decentralized`,
            `C) Coinbase cbETH — operated by a regulated public company with institutional-grade compliance`,
            `D) Solo staking — maximum yield`,
          ],
          correct: `C) Coinbase cbETH — operated by a regulated public company with institutional-grade compliance`,
          hint: `"Regulatory clarity" and "institutional-grade" are the key requirements. Which option is operated by a publicly traded, regulated entity?`,
          explanation: `Coinbase is a publicly traded company regulated by US financial authorities. cbETH has known legal counterparty (Coinbase), institutional custody options, and regulatory audit trail. For a fund with compliance obligations: Coinbase cbETH is the defensible choice despite the 25% fee. The fee cost is acceptable for the regulatory simplicity — the fund can clearly explain their counterparty to compliance/legal teams. Lido (DAO, offshore) and Rocket Pool (permissionless) create legal uncertainty for institutional contexts.`,
        },
      ],

      lessonSimulations: [
        {
          type: `lst-comparison`,
          scenario: `Using DeFiLlama and each protocol's app, compare stETH, rETH, and cbETH: (1) Current ETH redemption rate for each, (2) APY net of fees, (3) Available DeFi integrations (how many protocols accept as collateral), (4) Current peg premium/discount vs ETH spot. Which LST has the best risk-adjusted yield for: a DeFi power user, an institutional investor, and someone prioritizing Ethereum's decentralization?`,
          answer: `Live research task. Expected: stETH redemption rate = 1 ETH (rebasing so always "1"), peg usually within 0.1-0.2% of ETH. rETH exchange rate > 1 ETH (accumulates over time). cbETH exchange rate growing. DeFi integrations: stETH >> rETH >> cbETH. APY net of fees: stETH (3.15%) ≈ rETH (3.0%) < cbETH (2.6%). DeFi power user: stETH (deepest integrations, most composable). Institutional: cbETH (regulatory clarity). Ethereum-aligned: rETH (most decentralized model). Note: peg analysis reveals current market conditions — during stress, stETH peg spreads widen first (more liquid market, more price discovery).`,
        },
        {
          type: `leverage-loop-simulation`,
          scenario: `Model a 2-loop stETH leverage strategy on Aave V3. Start: 5 ETH ($3,000 = $15,000). Loop 1: deposit 5 ETH → stETH, collateralize on Aave, borrow 3 ETH (60% LTV), convert to stETH. Loop 2: collateralize 3 stETH, borrow 1.8 ETH, convert to stETH. Final state: 9.8 ETH in stETH collateral, 4.8 ETH borrowed. Calculate: gross staking yield, borrowing cost (Aave USDC/ETH rate ~2.5%), net yield, health factor, and what ETH price drop would trigger liquidation.`,
          answer: {
            grossYield: `9.8 stETH × 3.15% APY = 0.309 ETH/year = $927/year.`,
            borrowingCost: `4.8 ETH borrowed × 2.5% = 0.12 ETH/year = $360/year.`,
            netYield: `$927 − $360 = $567/year on original $15,000 = 3.78% vs 3.15% unstaked. Modest leverage boost.`,
            healthFactor: `Collateral value: 9.8 stETH at $3,000 = $29,400. Debt: 4.8 ETH at $3,000 = $14,400. Liquidation threshold 82% on stETH: ($29,400 × 0.82) / $14,400 = 1.67 health factor.`,
            liquidationPrice: `Liquidation when health factor = 1. Solve: (9.8 × P × 0.82) / (4.8 × P) = 1. This simplifies to 9.8 × 0.82 / 4.8 = 1.67. Health factor doesn't depend on ETH price (both sides scale equally) UNLESS stETH depegs. If stETH depegs 15%: effective collateral = 9.8 × 0.85 × P. Then liquidation risk is real. Depeg risk is the key risk, not ETH price.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: LST Strategy Design`,
        description: `L6.6 (staking) + L6.7 (liquid staking). Complete LST deployment strategy.`,
        challenges: [
          {
            scenario: `You have 20 ETH ($60,000). Design a complete liquid staking strategy that: (1) maximizes yield while maintaining reasonable liquidity, (2) uses DeFi integrations where they add real yield without excessive risk, (3) allocates across LST providers to manage concentration risk. Show allocation by protocol, expected yield for each component, and total blended APY.`,
            answer: `Allocation: 10 ETH → Lido (stETH). 10 ETH → Rocket Pool (rETH). LST deployment: 8 stETH → Aave V3 as collateral, borrow 4 ETH-equivalent USDC → deploy USDC in Aave lending (4% real yield). 2 stETH → Curve stETH/ETH pool for swap fees (3% additional). 10 rETH → hold (accumulates exchange rate appreciation, no DeFi integration to keep this component conservative). Yield calculation: Staking base (20 ETH): 10 × 3.15% + 10 × 3.0% = $315 + $300 = $615. Aave leverage yield: $24,000 USDC earning 4% = $960 minus borrowing cost ~$800 = $160 net. Curve LP yield on 2 stETH: ~3-5% extra = $90-150. Total: $615 + $160 + $120 = $895/year = 4.97% blended APY. Risk: stETH depeg affects Aave health factor. Mitigation: monitor health factor weekly, maintain buffer above 1.5.`,
          },
        ],
      },

      keyTakeaway: `Liquid staking lets you earn ETH staking yield while keeping tokens usable in DeFi. Three models: rebasing (stETH — balance grows daily), exchange rate (rETH/cbETH — balance fixed, rate grows). Protocol comparison: Lido (largest, 10% fee, centralization concern), Rocket Pool (most decentralized, 15% fee), Coinbase cbETH (institutional clarity, 25% fee). stETH is DeFi's most composable yield-bearing token — used as Aave collateral, Curve LP, and Maker CDP. The Curve stETH/ETH pool is critical infrastructure making the "liquid" claim real.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.8 — LIQUID STAKING ON OTHER CHAINS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'liquid-staking-other-chains',
      title: `6.8 Liquid Staking on Other Chains — Jito, Stride, and the Multi-Chain LST Ecosystem`,
      subtitle: `Every major PoS chain now has liquid staking. Solana's jitoSOL adds MEV rewards. Cosmos's stATOM enables cross-chain DeFi. Here's the full map.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.7 you mastered Ethereum's liquid staking trio (Lido/Rocket Pool/Coinbase). Every major proof-of-stake chain has its own liquid staking ecosystem. This lesson maps the key protocols across Solana, Cosmos, and others — and explains the unique wrinkles each chain's LST model introduces.`,

      hook: `Jito's jitoSOL doesn't just give you staking yield — it gives you a share of MEV rewards extracted by Jito validators. The SOL you stake earns not just network security rewards but a portion of every sandwich attack, arbitrage, and liquidation on Solana. That's a different product from stETH.`,

      visualPrompt: `A multi-chain map: left column Solana LSTs (jitoSOL, mSOL, bSOL) with "MEV rewards" label. Center column Cosmos LSTs (stATOM, stOSMO, stTIA via Stride) with "IBC composability" label. Right column other chains (Avalanche sAVAX, Polkadot, BNB stBNB). Each shows TVL and APY. Caption: "Same liquid staking concept. Different yield sources. Different composability opportunities."`,

      explanation: `Let me tell you about liquid staking beyond Ethereum.

Every major [Proof-of-Stake] chain now has liquid staking protocols. The core concept is identical: stake tokens, receive liquid receipt, earn rewards. But each chain introduces unique mechanics worth understanding.

**Solana Liquid Staking:**

[Marinade Finance (mSOL)] — Solana's first and largest liquid staking protocol. Distributes stake across 100+ validators using a delegation strategy that maximizes network decentralization. mSOL accumulates staking rewards plus validator incentives. Exchange-rate model: mSOL value in SOL grows over time. TVL: $600M+.

[Jito (jitoSOL)] — the most innovative Solana LST. Jito operates validators that participate in MEV extraction. jitoSOL stakers receive: (1) normal SOL staking yield (~7%) PLUS (2) a share of MEV rewards captured by Jito validators. MEV on Solana includes liquidations, arbitrage, and sandwich profits (from L3.16). This means jitoSOL has a fundamentally different yield composition from mSOL — part market-making revenue, not just network security reward.

[Marinade mSOL vs Jito jitoSOL]:
- mSOL: pure staking yield, more decentralized validator distribution
- jitoSOL: staking yield + MEV rewards = slightly higher APY (~0.5-1% more), but MEV rewards are variable and controversial (MEV is extracted from Solana traders)

[Blaze (bSOL)] — another Solana LST focused on decentralization scoring. Smaller TVL.

**Cosmos Liquid Staking — Stride:**

[Stride Finance] — the dominant liquid staking protocol for Cosmos chains. Supports: ATOM → stATOM, OSMO → stOSMO, TIA (Celestia) → stTIA, INJ → stINJ, and many others.

How Stride works: deposit ATOM → Stride stakes it across Cosmos Hub validators → you receive stATOM → stATOM value grows relative to ATOM as rewards accrue.

[IBC composability] — stATOM can be sent via IBC to any Cosmos chain. stATOM is used as collateral on Umee (Cosmos lending), as LP on Osmosis, and as yield-bearing collateral across the IBC ecosystem. This is the "superfluid staking" concept from L3.10 — one asset serving multiple functions simultaneously.

[Cosmos staking APY + liquid staking]:
- Stake ATOM directly: ~16% nominal APY
- Stake via Stride: slightly less (Stride fee ~5-10%), but you get liquid stATOM with IBC composability
- stATOM on Osmosis LP: earn staking yield INSIDE the LP position

**Other Chains:**

[Avalanche (Benqi Finance / sAVAX)]: stake AVAX → sAVAX. Earns ~8% APY. Integrated with Aave V3 on Avalanche as collateral.

[BNB Chain (Ankr / stkBNB)]: stake BNB → stkBNB or aBNBc. TVL relatively small compared to ETH/SOL LSTs.

**The cross-chain LST thesis:**

As liquid staking matures: LSTs become the base "productive asset" on each chain. Instead of holding idle SOL or ATOM, holders stake → receive LST → deploy LST across DeFi while earning base staking yield. The chain's native token becomes a yield-bearing asset by default.`,

      examples: [
        {
          title: `jitoSOL yield decomposition`,
          scenario: `Comparing regular SOL staking vs jitoSOL in a high-MEV month: Regular staking: 7% APY from network rewards. jitoSOL: 7% staking + 1.2% MEV rewards = 8.2% total APY. The 1.2% MEV comes from Jito validators executing profitable transactions for traders using Jito bundles. During high-activity periods (new memecoin launches, market volatility): MEV rewards spike significantly. During quiet markets: MEV rewards near-zero. The variability makes jitoSOL's yield distribution different from mSOL's more stable stream. MEV controversy: the extra yield is extracted from Solana traders who pay for priority execution — jitoSOL holders benefit from the MEV economy.`,
          lesson: `jitoSOL is a qualitatively different product from mSOL: its yield includes MEV extraction that fluctuates with market activity. Higher average APY but more variable. The ethical dimension is real — you're earning a share of what's extracted from other traders.`,
        },
        {
          title: `stATOM in Cosmos DeFi — the full yield stack`,
          scenario: `Jake stakes 1,000 ATOM via Stride → receives 1,000 stATOM (auto-compounding staking rewards at ~14% nominal). He sends stATOM via IBC to Osmosis → provides stATOM/OSMO LP on Osmosis Superfluid staking pool. Now earning: (1) stATOM staking yield (embedded in exchange rate ~14%). (2) Osmosis LP swap fees (~3-5%). (3) OSMO emissions on the LP position (~4%). (4) The LP position also superfluid-stakes to secure Osmosis chain (~4% OSMO staking). Total claimed yield: 14% + 4% + 4% + 4% = 26% nominal. Real yield (subtracting Cosmos inflation): lower, but the multi-layer composability is Cosmos DeFi at its most sophisticated.`,
          lesson: `IBC composability turns LSTs into multi-layer yield instruments. Each layer adds a small amount of yield with a specific risk profile. The Cosmos ecosystem's interconnectedness is its primary competitive advantage — this strategy simply doesn't exist on Ethereum with equivalent seamlessness.`,
        },
        {
          title: `sAVAX on Aave — unlocking AVAX DeFi capital`,
          scenario: `Marcus has 500 AVAX (worth ~$15,000). Before liquid staking: either stake (earn 8%, can't use in DeFi) or use in DeFi (earn 0% staking yield). After Benqi sAVAX: stake 500 AVAX → 500 sAVAX. Deposit sAVAX on Aave V3 Avalanche as collateral. Borrow 5,000 USDC (reasonable LTV). Deploy USDC in yield strategy (Aave USDC supply at 4%). Now earning: 8% sAVAX staking yield + 4% yield on borrowed USDC − 2.5% borrowing cost = net ~10.5% vs 8% staking alone. Same capital working twice.`,
          lesson: `LSTs unlock "capital efficiency multiplication" on any chain. Instead of choosing between staking and DeFi, sAVAX/jitoSOL/stATOM let you do both simultaneously. This pattern is the fundamental value proposition of liquid staking — it applies on every chain that has it.`,
        },
      ],

      guidedPractice: [
        {
          question: `What makes jitoSOL's yield composition different from mSOL?`,
          options: [
            `A) jitoSOL has a lower fee`,
            `B) jitoSOL stakers receive normal staking rewards PLUS a share of MEV rewards extracted by Jito validators — making jitoSOL's APY higher but more variable`,
            `C) jitoSOL only stakes to Jito validators`,
            `D) mSOL earns MEV; jitoSOL does not`,
          ],
          correct: `B) jitoSOL stakers receive normal staking rewards PLUS a share of MEV rewards extracted by Jito validators — making jitoSOL's APY higher but more variable`,
          hint: `From L3.16 (MEV): what are MEV rewards? How do Jito validators capture MEV?`,
          explanation: `Jito validators use MEV extraction tools to profit from transaction ordering on Solana (arbitrage, liquidations, priority fees). jitoSOL holders receive a share of this MEV revenue on top of standard staking yield. Result: ~0.5-1% higher average APY but variable (MEV activity fluctuates). mSOL purely earns standard staking rewards from network security — more predictable, slightly lower on average.`,
        },
        {
          question: `Stride Finance provides liquid staking across many Cosmos chains. What is the primary benefit of receiving stATOM instead of regular ATOM staking?`,
          options: [
            `A) Higher staking yield`,
            `B) IBC composability — stATOM can be sent across Cosmos chains via IBC to use in DeFi (LP on Osmosis, collateral on Umee) while continuing to earn staking rewards`,
            `C) stATOM has no withdrawal delay`,
            `D) Stride eliminates Cosmos validator risk`,
          ],
          correct: `B) IBC composability — stATOM can be sent across Cosmos chains via IBC to use in DeFi (LP on Osmosis, collateral on Umee) while continuing to earn staking rewards`,
          hint: `From L2.12 (Cosmos) and L3.10 (Osmosis): what makes IBC powerful? What can stATOM do that staked ATOM cannot?`,
          explanation: `Regular staked ATOM is locked for 21 days (unbonding period) and can't be transferred. stATOM is a liquid token transferable via IBC to any Cosmos chain. This unlocks: LP on Osmosis (earning swap fees on top of staking yield), collateral on Umee (borrow against stATOM), and superfluid staking on Osmosis (secure the chain with LP tokens). The liquid token makes the staking yield accessible as productive DeFi capital.`,
        },
        {
          question: `Connecting to L6.7 (liquid staking): how does the Cosmos ATOM staking situation compare to Ethereum regarding the "33% threshold" centralization concern?`,
          options: [
            `A) Cosmos has the same 33% concern — Stride dominates`,
            `B) Cosmos chains each have their own validator sets — no single liquid staking protocol approaches dominance equivalent to Lido's ETH share`,
            `C) Cosmos has no centralization concerns`,
            `D) Stride controls 33%+ of ATOM staking`,
          ],
          correct: `B) Cosmos chains each have their own validator sets — no single liquid staking protocol approaches dominance equivalent to Lido's ETH share`,
          hint: `From L2.12: how many validators does each Cosmos chain have? How distributed is staking across them?`,
          explanation: `Cosmos Hub has 180 validators; Stride's stATOM represents maybe 5-15% of total ATOM staked — nowhere near the critical threshold. Additionally, Cosmos chains generally have smaller TVL and staking pools, meaning even large liquid staking protocols don't approach the systemic risk Lido represents for Ethereum. The 33% concern is specifically an Ethereum problem due to the scale of ETH staking and Lido's dominance.`,
        },
        {
          question: `What is the key advantage of Benqi's sAVAX over holding idle AVAX?`,
          options: [
            `A) sAVAX always appreciates faster than AVAX`,
            `B) sAVAX earns ~8% AVAX staking yield while remaining usable as DeFi collateral on Aave — idle AVAX earns nothing`,
            `C) sAVAX has better Avalanche DeFi liquidity than AVAX`,
            `D) sAVAX eliminates AVAX price risk`,
          ],
          correct: `B) sAVAX earns ~8% AVAX staking yield while remaining usable as DeFi collateral on Aave — idle AVAX earns nothing`,
          hint: `The liquid staking value proposition (from L6.7): what does stETH give ETH holders that plain ETH doesn't?`,
          explanation: `The same value proposition as all LSTs: holding AVAX = 0% yield. Staking AVAX = 8% yield but locked. sAVAX = 8% yield AND transferable/usable in DeFi as Aave collateral. The DeFi layer on top of sAVAX then enables borrowing (at 2.5%) to deploy in additional yield strategies. The base case improvement is simply: 8% yield vs 0% for idle holders who wouldn't have solo staked.`,
        },
        {
          question: `A researcher evaluating Solana DeFi sees mSOL and jitoSOL listed as separate assets with different APYs. They ask which is "better." What is the correct research framework?`,
          options: [
            `A) jitoSOL is always better — higher APY`,
            `B) Evaluate based on: yield composition (stable staking vs variable MEV), your view on MEV ethics, DeFi integrations available for each, and whether APY variability suits your planning horizon`,
            `C) mSOL is always better — more decentralized`,
            `D) They are interchangeable`,
          ],
          correct: `B) Evaluate based on: yield composition (stable staking vs variable MEV), your view on MEV ethics, DeFi integrations available for each, and whether APY variability suits your planning horizon`,
          hint: `What are the actual differences between the two? How do different investor goals map to those differences?`,
          explanation: `Research framework: (1) Yield stability: mSOL = predictable staking yield. jitoSOL = staking + variable MEV (better average, less predictable). (2) Ethics: jitoSOL MEV comes from other Solana traders — some DeFi participants prefer not to capture MEV revenue. (3) DeFi integrations: check which protocols accept each as collateral. (4) Planning horizon: variable MEV matters less for long-term holders. For yield planning: mSOL. For maximum average yield: jitoSOL. Neither is universally "better."`,
        },
      ],

      lessonSimulations: [
        {
          type: `multi-chain-lst-map`,
          scenario: `Build a reference table for liquid staking across chains. For each: Ethereum (stETH, rETH), Solana (mSOL, jitoSOL), Cosmos (stATOM via Stride), Avalanche (sAVAX). Columns: protocol, fee, net APY estimate, DeFi integrations count (check DeFiLlama), key risk. Rank by net real APY. Conclude: which chain's LST ecosystem offers the best risk-adjusted liquid staking yield?`,
          answer: `Live research task. Expected ranking by net real APY: Cosmos stATOM likely highest nominal (14% gross − 15% Stride fee → ~12% APY − ATOM inflation ~10% = ~2% real pure, but composability unlocks more). Solana jitoSOL: 8.2% − 5% SOL inflation = 2.2% real. Ethereum stETH: 3.15% − 0.3% net inflation = ~3% real (highest quality real yield). Avalanche sAVAX: 7% − 3% AVAX inflation = ~4% real. By real yield quality: Ethereum > Avalanche > Solana. By composability/DeFi integrations: Ethereum > Cosmos > Solana > Avalanche. Best risk-adjusted: Ethereum stETH — deepest integrations, highest quality real yield, most battle-tested.`,
        },
        {
          type: `cosmos-defi-stack`,
          scenario: `Design a stATOM-based Cosmos DeFi yield stack starting with 500 ATOM ($4,000). Step through each action: Stride deposit, IBC transfer, Osmosis LP, potential Umee collateral. Calculate yield at each step. Show the complete risk chain from ATOM → stATOM → Osmosis LP → borrowed USDC.`,
          answer: {
            step1: `500 ATOM → Stride → 500 stATOM. Yield: ~12% staking APY embedded. Gas: minimal (Cosmos chains cheap).`,
            step2: `IBC transfer stATOM to Osmosis. Gas: $0.01. Time: ~6 seconds.`,
            step3: `400 stATOM → Osmosis stATOM/OSMO Superfluid pool. Yield: 12% staking + 5% swap fees + 4% OSMO emissions + 4% superfluid = 25% claimed. Real yield floor (staking + fees): 17%.`,
            step4: `100 stATOM → Umee (Cosmos lending). Collateral. Borrow 50 USDC. Deploy USDC on Osmosis USDC stable pool. Yield: 12% staking + 5% USDC LP − 3% borrow cost = 14% net on that portion.`,
            riskChain: `ATOM price risk → stATOM depeg risk (Stride smart contract) → Osmosis LP IL risk (OSMO volatility) → Umee liquidation risk (if ATOM drops and stATOM depegs) → OSMO emission depreciation. Each layer adds a distinct risk vector.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: Multi-Chain LST Portfolio`,
        description: `L6.7 (Ethereum LSTs) + L6.8 (other chains). Build the optimal multi-chain liquid staking allocation.`,
        challenges: [
          {
            scenario: `You have $50,000 split across ETH ($25K), SOL ($15K), ATOM ($10K). Design a complete liquid staking + DeFi integration strategy for each. Constraints: each LST must be deployed in at least one DeFi application on top of base staking. No leverage > 50% LTV. Calculate total expected annual yield.`,
            answer: `ETH ($25,000): Lido → stETH ($22K) + Rocket Pool → rETH ($3K, decentralization allocation). Deploy: $20K stETH as Aave collateral → borrow $10K USDC at 50% LTV → Aave USDC supply (4% real). $2K stETH in Curve stETH/ETH LP (extra 3% fees). Yield: 3.15% staking on $25K + 4% on $10K USDC − 2.5% on $10K loan + 3% Curve = $787 + $400 − $250 + $60 = $997. SOL ($15,000): Jito → jitoSOL. $15K jitoSOL as collateral on Marginfi or Kamino → borrow $7.5K USDC → Aave-equivalent supply. Yield: 8.2% on $15K + 4% on $7.5K − 2.5% on $7.5K = $1,230 + $300 − $187 = $1,343. ATOM ($10,000): Stride → stATOM. IBC to Osmosis → stATOM/OSMO LP. Yield: 12% staking + 6% LP fees (conservative) = 18% = $1,800. Total annual yield: $997 + $1,343 + $1,800 = $4,140 = 8.3% blended. All real yield with DeFi multiplier. Risk: stATOM/Osmosis carries most risk (multiple layers). stETH/Aave is moderate. jitoSOL/Marginfi medium.`,
          },
        ],
      },

      keyTakeaway: `Multi-chain liquid staking: Solana (mSOL = pure staking, jitoSOL = staking + MEV), Cosmos (stATOM via Stride = liquid + IBC composability across 50+ chains), Avalanche (sAVAX = staking + Aave collateral). Each chain's LST can be deployed in that chain's DeFi ecosystem. IBC makes Cosmos LSTs uniquely composable across chains. jitoSOL's MEV component makes it qualitatively different from standard LSTs. Real yield quality: Ethereum stETH remains the highest quality (lowest inflation, deepest integrations, most battle-tested).`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.9 — RESTAKING
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'restaking',
      title: `6.9 Restaking — Using Staked Assets to Secure Other Networks`,
      subtitle: `EigenLayer lets you stake ETH once and get paid by multiple networks simultaneously. It's either the most elegant yield amplifier in DeFi — or a systemic risk hiding in plain sight.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.7-6.8 you learned that staked ETH (stETH) can be used as DeFi collateral. Restaking goes further — your staked ETH can also be used to cryptographically secure other protocols beyond Ethereum, earning additional rewards from each. EigenLayer is the protocol that makes this possible.`,

      hook: `Ethereum validators stake 32 ETH to earn ~3.5% APY. EigenLayer lets those same validators opt into securing additional protocols, earning additional rewards for each. In theory: 3.5% becomes 5%, 7%, or more — same capital, multiple income streams. The question: what happens when one of those additional protocols is attacked and the staked ETH gets slashed?`,

      visualPrompt: `A 32 ETH stake at center with arrows pointing outward to: Ethereum consensus (3.5% APY), Protocol A "AVS" (1% extra), Protocol B AVS (0.8% extra), Protocol C AVS (0.7% extra). Total: 6% yield from one stake. Red warning symbol on each AVS arrow labeled "Slashing risk." Caption: "EigenLayer: one stake, multiple income streams, multiple slashing risks."`,

      explanation: `Let me tell you about the newest way to earn yield.

You've staked your [ETH] and have [stETH]. That stETH is just sitting there earning 3.5%. What if someone could pay you to do more with it — specifically, to help secure their own network using the same cryptographic commitment you already made to Ethereum?

That's [restaking] and [EigenLayer] is the protocol that makes it happen.

**How EigenLayer works:**

[EigenLayer] is a protocol where Ethereum validators (or liquid staking token holders) can opt-in to additional slashing conditions for additional rewards.

[Restaking] — the act of using already-staked ETH as security for additional protocols beyond Ethereum. Two forms:

[Native restaking]: Ethereum validators point their withdrawal credentials to EigenLayer. EigenLayer gets authority to slash their staked ETH if they violate new rules.

[LST restaking]: holders of stETH, rETH, or cbETH deposit their LSTs into EigenLayer. The LSTs serve as restaked collateral.

**Actively Validated Services (AVSs):**

[AVS (Actively Validated Service)] — any network or protocol that uses EigenLayer's restaked ETH as security. Examples:

- [EigenDA] — a data availability layer for rollups (like Celestia but Ethereum-secured via EigenLayer)
- [Lagrange] — cross-chain state verification
- [Witness Chain] — decentralized watchtowers for optimistic rollups
- Various oracle networks, bridges, and middleware protocols

AVSs pay [restaking rewards] to validators who opt into their service. These rewards are in addition to standard ETH staking yield.

**The yield math:**

Base ETH staking: 3.5% APY
+ EigenDA restaking reward: ~0.5%
+ Additional AVS rewards: ~0.5-1%
Total: 4.5-5% APY on same staked ETH

**The critical risk — cascading slashing:**

[Correlated slashing] — if a validator restaked across multiple AVSs gets slashed in one, the slash reduces their stake below the minimum required by others, potentially triggering more slashing. The risk cascades.

[Systemic risk scenario]: if many validators restake into the same flawed AVS and that AVS is attacked, simultaneous mass slashing could drain enough validator stakes to weaken Ethereum's consensus itself. EigenLayer's growth has made this a genuine concern for Ethereum researchers.

[Operator selection] — most liquid restaking protocols (EtherFi, Kelp, Renzo) select operators for you. You're trusting their risk management to avoid operators with dangerous AVS combinations.`,

      examples: [
        {
          title: `EigenLayer restaking yield calculation`,
          scenario: `Jake is an Ethereum validator with 32 ETH. He opts into native restaking via EigenLayer and selects 3 AVSs: EigenDA ($0.40% APY reward), Lagrange ($0.25%), and a bridge security protocol ($0.35%). Total additional yield: 1.0% APY on 32 ETH = 0.32 ETH/year = ~$960 extra at $3,000/ETH. His total staking yield: 3.5% + 1.0% = 4.5% = 1.44 ETH/year vs 1.12 ETH standard. The 0.32 ETH premium has a price: he's accepted slashing conditions from 3 additional entities. If any AVS has a bug or attack that triggers slashing: he loses ETH proportional to the slash amount — potentially more than the 0.32 ETH earned.`,
          lesson: `Restaking yields are real — additional protocols genuinely pay for Ethereum's security. But the reward (0.32 ETH/year) must be weighed against the slashing risk of each AVS. An AVS with poor security is not worth 0.5% extra — the tail risk could exceed multiple years of restaking rewards.`,
        },
        {
          title: `Liquid restaking tokens (LRTs) — the retail access route`,
          scenario: `Maria has 5 stETH but can't individually evaluate AVS risk. She deposits stETH into EtherFi (a liquid restaking protocol). EtherFi selects AVSs on her behalf, stakes across them, and returns eETH (EtherFi's liquid restaking token). eETH earns: stETH staking yield (3.15%) + EtherFi's selected AVS rewards (~0.5-1%) = 3.65-4.15%. eETH is usable in DeFi (Aave is exploring it as collateral). Risk: EtherFi's operator selection — Maria trusts EtherFi to pick safe AVSs. If EtherFi chooses a bad AVS that gets slashed: eETH depeg risk. She's trading direct control for accessibility.`,
          lesson: `LRTs (eETH, ezETH from Renzo, rsETH from Kelp) are liquid restaking tokens that democratize EigenLayer access. The trade-off: you don't control which AVSs you're exposed to — you trust the LRT protocol's risk management. Diversify across LRT protocols to avoid concentration in one operator's choices.`,
        },
        {
          title: `The systemic risk debate`,
          scenario: `By early 2024: EigenLayer had $10B+ in restaked ETH. Ethereum researchers Vitalik Buterin and Justin Drake published warnings: if a large AVS (say $5B in restaked ETH) is compromised and mass slashing occurs, the simultaneous reduction in validator stakes could reduce Ethereum's consensus security meaningfully. The "social layer" concern: if AVSs ever threatened Ethereum's social consensus (e.g., by proposing to fork Ethereum for their benefit), restaked validators face a conflict of interest. EigenLayer's response: designed AVSs to not have authority over Ethereum consensus itself, only over their own domain. The debate continues.`,
          lesson: `EigenLayer's systemic risk is real and actively debated by Ethereum researchers. The protocol is designed to avoid the worst scenarios but the risks aren't zero. Evaluate restaking with eyes open to both the yield opportunity and the tail risks that the broader Ethereum community is concerned about.`,
        },
      ],

      guidedPractice: [
        {
          question: `What is an AVS in the EigenLayer context?`,
          options: [
            `A) An Automated Vault Strategy`,
            `B) An Actively Validated Service — any network that uses restaked ETH as security, paying restaking rewards to validators who opt into its slashing conditions`,
            `C) A type of Ethereum validator set`,
            `D) An arbitrage validator system`,
          ],
          correct: `B) An Actively Validated Service — any network that uses restaked ETH as security, paying restaking rewards to validators who opt into its slashing conditions`,
          hint: `EigenLayer extends Ethereum's security to other protocols. What are those other protocols called within the EigenLayer system?`,
          explanation: `AVSs are protocols that pay to access Ethereum's restaked security. Examples: EigenDA (data availability), Lagrange (cross-chain proofs), bridge security protocols. Each AVS has its own slashing conditions — validators who opt in earn AVS rewards but accept the risk that misbehavior (as defined by the AVS) results in slashed ETH.`,
        },
        {
          question: `What is the primary risk unique to restaking that doesn't exist in regular staking?`,
          options: [
            `A) Restaking pays lower yields`,
            `B) Correlated/cascading slashing — being slashed by one AVS can reduce stake below thresholds required by other AVSs, triggering further slashing; and systemic risk if many validators are restaked in the same flawed AVS`,
            `C) Restaked ETH can't be withdrawn`,
            `D) EigenLayer is controlled by a centralized team`,
          ],
          correct: `B) Correlated/cascading slashing — being slashed by one AVS can reduce stake below thresholds required by other AVSs, triggering further slashing; and systemic risk if many validators are restaked in the same flawed AVS`,
          hint: `Restaking adds new slashing conditions beyond Ethereum's own consensus rules. What happens when you have multiple slashing conditions simultaneously?`,
          explanation: `Restaking stacks multiple independent slashing risks on the same ETH. Each AVS can independently trigger a slash. If AVS A slashes your stake, your remaining stake may fall below AVS B's minimum, triggering a second slash. Cascade risk. At the systemic level: if a single popular AVS has a critical bug and triggers mass slashing of many validators simultaneously, it could meaningfully reduce Ethereum's consensus security.`,
        },
        {
          question: `Connecting to L6.7 (liquid staking): what is a liquid restaking token (LRT) and how does it differ from an LST?`,
          options: [
            `A) LRTs are identical to LSTs — both represent staked ETH`,
            `B) LSTs represent staked ETH earning Ethereum rewards. LRTs represent restaked ETH earning Ethereum rewards PLUS AVS rewards — but with additional slashing risks from AVS exposure`,
            `C) LRTs are centralized; LSTs are decentralized`,
            `D) LRTs have higher fees than LSTs`,
          ],
          correct: `B) LSTs represent staked ETH earning Ethereum rewards. LRTs represent restaked ETH earning Ethereum rewards PLUS AVS rewards — but with additional slashing risks from AVS exposure`,
          hint: `LST = liquid staking token (stETH, rETH). LRT adds one more layer. What's the extra layer?`,
          explanation: `LST: deposit ETH → protocol stakes it on Ethereum → receive token earning staking rewards. LRT: deposit ETH or LST → protocol stakes on Ethereum AND restakes into AVSs → receive token earning staking + restaking rewards. Extra yield from AVSs comes with extra slashing risk from AVS exposure. eETH, ezETH, and rsETH are LRTs — they yield more than stETH/rETH but carry AVS slashing exposure that LSTs don't have.`,
        },
        {
          question: `A validator earns 3.5% from Ethereum staking and opts into 3 AVSs for +1.0% extra. The total annual extra income from restaking is 0.32 ETH. AVS X has a critical bug — slashing event occurs. If AVS X slashes 0.5 ETH per validator: has the restaking strategy been worth it?`,
          options: [
            `A) Yes — 0.32 ETH earned over time will eventually cover the 0.5 ETH loss`,
            `B) No — the slash (0.5 ETH) exceeds the restaking premium (0.32 ETH/year). The strategy only pays off after ~18+ months without a slash, meaning the risk-reward was unfavorable`,
            `C) It depends on whether AVS X was the only bad AVS`,
            `D) The 3.5% base staking still makes it profitable`,
          ],
          correct: `B) No — the slash (0.5 ETH) exceeds the restaking premium (0.32 ETH/year). The strategy only pays off after ~18+ months without a slash, meaning the risk-reward was unfavorable`,
          hint: `Break-even: how many years of 0.32 ETH/year restaking income to cover the 0.5 ETH slash?`,
          explanation: `0.5 ETH slash / 0.32 ETH per year = 1.56 years to break even. This means the slash wiped out 18+ months of restaking rewards in a single event. Whether 1.56 years is an acceptable break-even depends on the probability of such a slash occurring. If the AVS has even a 1-in-2 chance of being exploited over 3 years: the expected value of restaking is negative. AVS selection quality is critical — one bad AVS selection can easily erase years of restaking income.`,
        },
        {
          question: `Why have Ethereum researchers like Vitalik Buterin expressed concern about EigenLayer's growth?`,
          options: [
            `A) EigenLayer's fees are too high`,
            `B) If enough validators restake into the same AVS and that AVS suffers a mass slashing event, it could materially reduce the total staked ETH securing Ethereum's consensus — a systemic risk to Ethereum itself`,
            `C) EigenLayer is a competitor to Ethereum staking`,
            `D) Restaking pays higher yields than Ethereum intended`,
          ],
          correct: `B) If enough validators restake into the same AVS and that AVS suffers a mass slashing event, it could materially reduce the total staked ETH securing Ethereum's consensus — a systemic risk to Ethereum itself`,
          hint: `What secures Ethereum? What happens to that security if a significant portion of validators get simultaneously slashed?`,
          explanation: `Ethereum's security = economic cost of attacking consensus = amount staked × ETH price. With $10B+ restaked in EigenLayer (early 2024): if a popular AVS is compromised and mass slashing occurs, billions in ETH could be burned, reducing Ethereum's economic security. Ethereum researchers are concerned this creates a new systemic risk vector that the protocol wasn't designed to handle. EigenLayer has architectural protections, but the concern is legitimate enough that it's actively debated by the Ethereum core development community.`,
        },
      ],

      lessonSimulations: [
        {
          type: `restaking-risk-evaluation`,
          scenario: `Evaluate whether to restake 10 stETH into EigenLayer via an LRT. You need to assess: (1) Which AVSs is the LRT (e.g., EtherFi eETH) currently opted into? (2) What are each AVS's slashing conditions? (3) What extra APY do these AVSs provide? (4) Calculate: break-even time if any single AVS slashes 0.5% of restaked ETH. Go/no-go decision.`,
          answer: `Live research task. Find EtherFi's current AVS exposure on their docs or EigenLayer explorer. Expected: EtherFi likely opted into EigenDA + 2-3 additional AVSs. Extra APY: 0.5-1.5% above stETH. Break-even calculation: 10 stETH × 0.5% slash = 0.05 ETH lost. Extra yield: 10 stETH × 1% = 0.10 ETH/year. Break-even: 0.05/0.10 = 6 months. If you're confident the AVS risks are very low over 6 months: go. If any AVS has recent audit failures or is very new: no-go. The research is in evaluating AVS maturity.`,
        },
        {
          type: `lrt-comparison`,
          scenario: `Compare three LRTs: EtherFi (eETH), Renzo (ezETH), Kelp DAO (rsETH). For each: TVL, extra APY above stETH, AVS exposure count, any historical depegs or incidents. Which is the "safest" LRT and why?`,
          answer: `Live research task. Expected comparison: EtherFi likely largest TVL and most established. APY premiums: all close to 0.5-1.5% above stETH. AVS exposure: check EigenLayer's dashboard. Incidents: post-EigenLayer token launch (April 2024), EZETHm depegged briefly due to withdrawal issues on Renzo. Historical depeg incidents are a key differentiator — look for LRTs with no historical depeg events. "Safest": largest TVL + most diverse AVS set + no historical depeg incidents + most audits. Typically EtherFi or Kelp based on track record.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Restaking Position Design`,
        description: `L6.8 (multi-chain LSTs) + L6.9 (restaking). Decide whether restaking adds value to an LST position.`,
        challenges: [
          {
            scenario: `You have 20 stETH ($60,000 at $3,000/ETH). Option A: hold stETH as-is (3.15% APY). Option B: deposit into EtherFi eETH (3.15% + ~0.8% restaking = 3.95%). Option C: hold stETH + use as Aave collateral to borrow USDC and deploy in Aave supply (3.15% stETH + 4% USDC yield − 2.5% borrow cost = ~4.65% without restaking). Analyze: (1) Which option has the highest yield? (2) Which has the highest risk? (3) Which is the best risk-adjusted choice? (4) Can you combine Options B and C (restake to eETH then use as Aave collateral)?`,
            answer: `Yield ranking: C (4.65%) > B (3.95%) > A (3.15%). Risk ranking: C (leverage adds liquidation risk) > B (restaking adds AVS slashing risk) > A (only stETH depeg risk). Risk-adjusted: depends on your risk tolerance. Option A: most conservative, lowest yield. Option B: adds restaking risk for +0.8% — if AVS slash probability per year is <8% (i.e., 0.8%/year extra yield / 10% reasonable loss = 12.5% slash probability tolerable), it's positive expected value. Option C: adds leverage — if ETH stays above ~$2,100 (with 60% LTV), health factor stays safe. Combination B+C: eETH is accepted as Aave collateral on some deployments — check current Aave risk parameters. If accepted: 3.95% + (4% − 2.5%) × 50% LTV = ~4.7% with both stacking. Highest yield but combined restaking + leverage risk.`,
          },
        ],
      },

      keyTakeaway: `Restaking lets staked ETH secure multiple protocols (AVSs) simultaneously, earning additional rewards from each. EigenLayer is the primary protocol; LRTs (eETH, ezETH, rsETH) provide retail access. Extra yield: ~0.5-1.5% above standard LST APY. Key risks: correlated slashing (one AVS slash cascades), systemic risk (mass slashing weakens Ethereum security), and LRT depeg risk (as seen with ezETH). AVS selection quality determines whether restaking is positive or negative expected value. Evaluate each AVS's slashing probability before committing — the math must work over your intended holding period.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 6.10 — YIELD AGGREGATORS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'yield-aggregators',
      title: `6.10 Yield Aggregators — Automate, Compound, Optimize`,
      subtitle: `Yearn Finance finds the best yield across 100 protocols and auto-compounds it. Beefy runs on 25+ chains. Pendle lets you trade future yield. Here's how aggregators turn complex DeFi into one-click strategies.`,
      difficulty: 'intermediate',
      previousLessonRef: `In L6.5 you learned about automated LP managers for V3 positions. Yield aggregators are the broader version of this idea — protocols that take your capital, deploy it across multiple yield sources, and auto-compound the returns. This lesson covers the major protocols, their mechanics, and when to use them vs managing positions manually.`,

      hook: `A Yearn vault that compounds 15% APY weekly outperforms a manually managed position compounding monthly by 1.2% annually — on $100K that's $1,200/year for doing nothing. Auto-compounding isn't glamorous. The math makes it unavoidable.`,

      visualPrompt: `Yearn vault flow: user deposits USDC → vault deploys across Aave, Compound, Morpho (finds highest yield) → earns interest → automatically converts and re-deposits → user sees higher USDC balance without any action. Side panel: compounding frequency comparison (weekly vs monthly vs manual). Caption: "The aggregator does in seconds what takes you hours. And it never forgets to compound."`,

      explanation: `Let me tell you about the ultimate lazy DeFi strategy.

Finding the best [yield] is work. Monitoring positions is work. Claiming rewards and reinvesting is work. [Yield aggregators] do all of it automatically — for a small fee.

**What yield aggregators do:**

A [yield aggregator] or [yield optimizer] takes your deposited token, deploys it across multiple protocols to maximize return, harvests rewards regularly, sells them for more of your deposited token, and re-deposits — auto-compounding your yield.

The benefit isn't just convenience. It's the mathematics of compounding frequency.

[Auto-compounding APY formula]: (1 + r/n)^n − 1, where r = annual rate, n = compounding frequency per year.

15% APY, compounded daily: (1 + 0.15/365)^365 − 1 = 16.18%
15% APY, compounded monthly: (1 + 0.15/12)^12 − 1 = 16.08%
15% APY, compounded once per year: exactly 15%

The differences are modest at typical DeFi rates. The real value is: zero manual effort, zero risk of forgetting to compound, and strategy optimization across multiple protocols.

**The major protocols:**

[Yearn Finance] — the original yield aggregator. Ethereum-focused. Strategies written by community "strategists" who earn a portion of performance fees. Best known for complex multi-step vaults that combine lending, LP, and protocol rewards.

Fees: 2% management + 20% performance (varies by vault). Older, well-audited. Best for Ethereum mainnet complex strategies.

[Beefy Finance] — multi-chain yield optimizer across 25+ chains. Simpler strategy approach — primarily auto-compounds LP farming rewards. Very wide protocol coverage, good UI.

Fees: 0-4.5% withdrawal fee (varies), no performance fee on most. Best for LP auto-compounding on any chain.

[Convex Finance] — specifically for Curve LP positions. Deposits Curve LP tokens, gets boosted CRV rewards (via Convex's accumulated veCRV), distributes as CVX + boosted CRV. One of the highest-impact aggregators for anyone in Curve pools.

Fees: 17% of all CRV rewards. Worth it because the boost (1.5-2.5x) typically exceeds the fee.

[Pendle Finance] — unique: splits yield-bearing tokens into principal (PT) and yield (YT) components. Allows: fixed-rate yield (buy PT below face value = guaranteed APR), leveraged yield speculation (buy YT for amplified yield exposure), or vanilla LP yield on the Pendle AMM.

[Yearn v3 / ERC-4626] — the emerging standard for yield-bearing vaults. ERC-4626 is the standard interface for vaults — allows any protocol to plug into any yield aggregator using a standard API.

**When to use aggregators vs direct deposits:**

Use aggregators when: position size < $50K (manual compounding not worth time), yield involves multiple protocols (Convex for Curve pools), chain gas makes manual compounding expensive.

Manage directly when: position > $200K (performance fee becomes significant), you have a specific tax strategy (auto-compounding creates taxable events in some jurisdictions), or the vault's strategy doesn't match your risk preference.`,

      examples: [
        {
          title: `Convex Finance — the Curve booster`,
          scenario: `Maria deposits into Curve's USDC/USDT pool directly. Base Curve APY: 3% from swap fees + 5% from CRV emissions = 8% total. Her veCRV boost: none (she doesn't have veCRV). Via Convex: Convex holds massive veCRV, giving all depositors a 2.5x CRV boost. Her boosted Curve APY via Convex: 3% fees + 5% × 2.5x CRV boost − 17% Convex fee = 3% + 12.5% − 2.125% fee = 13.375%. Plus CVX token rewards: +2%. Total: ~15.4% vs 8% direct. Convex's fee (17% of CRV) is more than offset by the 2.5x boost. For all Curve LP positions under $1M: using Convex is almost always better than direct Curve deposits.`,
          lesson: `Convex is not just a convenience — it's a mathematically superior product for Curve LPs because the veCRV boost (2.5x) far outpaces the 17% fee. This is the rare aggregator where the fee actually pays for itself in every scenario.`,
        },
        {
          title: `Pendle — trading future yield`,
          scenario: `Jake has 10 stETH (worth $30,000 at $3,000/ETH). He expects ETH staking yields to fall from 3.5% to 2.5% over the next 6 months (more ETH being staked reduces per-validator rewards). On Pendle: he splits his stETH into PT-stETH (principal, redeemable for 1 stETH at maturity in 6 months) and YT-stETH (yield token, receives all staking rewards for the next 6 months). He sells the YT-stETH at current yield prices (which assume 3.5% continues). Buyer of YT gets: 3.5% × 6 months × 10 stETH = 0.175 stETH worth of yield. If yield falls to 2.5% as Jake predicted: actual yield = 0.125 stETH. Buyer loses 0.05 stETH; Jake pocketed more than the actual yield delivered. Jake effectively shorted future staking yields.`,
          lesson: `Pendle is a yield derivatives market. It allows directional bets on whether future yield will be higher or lower than currently implied. DeFi researchers who develop a view on yield trajectories (staking rates, lending demand cycles) can trade that view directly on Pendle.`,
        },
        {
          title: `Auto-compounding math — why the bot wins`,
          scenario: `Priya has $50,000 in a 20% APY farm. Manual compounding (she does it every 2 weeks): (1 + 0.20/26)^26 − 1 = 21.6% effective APY. Auto-compounding vault (compounds daily): (1 + 0.20/365)^365 − 1 = 22.1% effective APY. Difference: 0.5% × $50,000 = $250/year. Vault fee: 2% of gains = $50,000 × 20% × 2% = $200/year. Net advantage after vault fee: $50. Barely worth it at 2-week manual compounding. But: if Priya only compounds monthly (realistic for busy people): effective APY = 21.4%. Vault outperforms by $350/year − $200 fee = $150 net. More importantly: Priya never misses a compounding event, never pays gas for each manual compound, and doesn't have to think about it.`,
          lesson: `The mathematical advantage of auto-compounding is modest at typical DeFi rates. The real value is behavioral: automated systems never forget, never get distracted, and never pay 5x more gas during a congestion spike. The reliability premium is the real product.`,
        },
      ],

      guidedPractice: [
        {
          question: `Convex Finance charges 17% of CRV rewards from Curve LP positions. Yet most Curve LPs use Convex anyway. Why?`,
          options: [
            `A) Convex has better UI than Curve`,
            `B) Convex's accumulated veCRV boosts CRV rewards by 2.5x — even after the 17% fee, Convex users earn significantly more CRV than direct Curve depositors without veCRV`,
            `C) Convex has lower gas fees`,
            `D) Convex's platform forces users to use it`,
          ],
          correct: `B) Convex's accumulated veCRV boosts CRV rewards by 2.5x — even after the 17% fee, Convex users earn significantly more CRV than direct Curve depositors without veCRV`,
          hint: `From L3.5 (Curve Wars): what does veCRV boost do to CRV emissions? What does Convex provide to all depositors?`,
          explanation: `Without veCRV: base Curve CRV reward. With 2.5x veCRV boost (Convex provides this to all depositors): 2.5x CRV. Convex takes 17% of CRV. Net: 2.5x × (1 − 17%) = 2.075x CRV vs direct Curve's 1x. A 107.5% improvement even after Convex's fee. Unless you personally hold enough veCRV for a 2.5x boost (requires locking large amounts of CRV), Convex is strictly superior for Curve LP positions.`,
        },
        {
          question: `What is Pendle's "PT" (Principal Token) and what does buying it below face value guarantee?`,
          options: [
            `A) PT is a governance token`,
            `B) PT represents the principal of a yield-bearing token, redeemable at face value at maturity — buying PT below face value locks in a guaranteed fixed APY equal to the discount`,
            `C) PT is a fee token`,
            `D) PT is a leveraged yield token`,
          ],
          correct: `B) PT represents the principal of a yield-bearing token, redeemable at face value at maturity — buying PT below face value locks in a guaranteed fixed APY equal to the discount`,
          hint: `If you buy $95 worth of PT today and redeem it for $100 of stETH in 6 months: what is your guaranteed return?`,
          explanation: `PT-stETH maturing in 6 months at $95 per $100 face value: buying at $95 guarantees you receive $100 at maturity. Return: $5 on $95 = 5.26% in 6 months = ~10.5% APY. This is a fixed-rate yield — you know exactly what you'll receive regardless of what happens to stETH staking rates during the 6 months. Pendle's PT market lets you lock in fixed rates when you believe variable rates will fall.`,
        },
        {
          question: `Connecting to L6.5 (V3 strategies): how is a V3 automated LP manager (Gamma) similar to Yearn Finance, and how are they different?`,
          options: [
            `A) They are identical — both auto-compound LP fees`,
            `B) Both are yield optimization automation. Difference: V3 managers focus on range management for concentrated liquidity. Yearn focuses on strategy optimization across multiple protocols (moving capital to highest yield source).`,
            `C) Yearn is decentralized; Gamma is centralized`,
            `D) Gamma charges higher fees than Yearn`,
          ],
          correct: `B) Both are yield optimization automation. Difference: V3 managers focus on range management for concentrated liquidity. Yearn focuses on strategy optimization across multiple protocols (moving capital to highest yield source).`,
          hint: `What specific problem does each solve? Gamma = range exits. Yearn = ?`,
          explanation: `Both automate yield optimization — the similarity. The difference: V3 managers (Gamma, Arrakis) solve the "in-range vs out-of-range" problem specific to concentrated liquidity. They don't switch between protocols. Yearn vaults solve the "best yield across protocols" problem — monitoring Aave, Compound, Morpho, and moving capital to whichever offers the highest rate at any moment. Yearn is multi-protocol optimization; Gamma is single-pool management.`,
        },
        {
          question: `ERC-4626 is the standard vault interface. Why does this matter for the DeFi ecosystem?`,
          options: [
            `A) It makes vaults more expensive`,
            `B) Any protocol built to the ERC-4626 standard can plug into any yield aggregator without custom integration — creating composable, interoperable yield infrastructure`,
            `C) It's only relevant for stablecoin protocols`,
            `D) ERC-4626 eliminates fees`,
          ],
          correct: `B) Any protocol built to the ERC-4626 standard can plug into any yield aggregator without custom integration — creating composable, interoperable yield infrastructure`,
          hint: `From L1.2 (DeFi stack): composability = protocols combining like Lego blocks. What does a standard interface enable?`,
          explanation: `ERC-4626 standardizes the deposit/withdraw/share mechanics of yield vaults. A protocol implementing ERC-4626 can immediately be used by: any aggregator (Yearn, Beefy, Pendle), any lending protocol as collateral, any portfolio tracker, any front-end UI — without custom integration work. It's DeFi's standard API for yield-bearing tokens. The more protocols adopt ERC-4626, the more composable the yield ecosystem becomes.`,
        },
        {
          question: `You have $10,000 in a 25% APY yield farm on Arbitrum. Gas per manual compound: $0.30. You can compound weekly. Would a yield aggregator (2% performance fee) beat manual management?`,
          options: [
            `A) Aggregator always wins`,
            `B) Manual wins easily — $0.30 gas weekly ($15.60/year) is far cheaper than the 2% performance fee ($10K × 25% × 2% = $50/year). Weekly manual compounding on Arbitrum beats the aggregator.`,
            `C) They perform identically`,
            `D) Aggregator wins because daily compounding adds 1% extra`,
          ],
          correct: `B) Manual wins easily — $0.30 gas weekly ($15.60/year) is far cheaper than the 2% performance fee ($10K × 25% × 2% = $50/year). Weekly manual compounding on Arbitrum beats the aggregator.`,
          hint: `Compare: aggregator fee ($50/year) vs gas cost of weekly manual compounding on Arbitrum ($0.30 × 52 = $15.60/year).`,
          explanation: `Performance fee: $10K × 25% yield × 2% = $50/year. Gas cost of weekly manual compounding: $0.30 × 52 = $15.60/year. Manual wins by $34.40/year. On Arbitrum's near-zero gas, manual compounding once weekly is more economical than most aggregators for reasonable position sizes. The aggregator case gets stronger on Ethereum mainnet (higher gas) and for smaller positions (where time cost of manual management matters more than the fee).`,
        },
      ],

      lessonSimulations: [
        {
          type: `aggregator-comparison`,
          scenario: `Compare depositing $20,000 USDC in three ways: (A) Aave V3 directly at 5% APY. (B) Yearn Finance USDC vault (compounds Aave + Compound + Morpho, charges 2%/20% fee structure). (C) Beefy Finance on Arbitrum (compounds a stablecoin farm at 8% with 3.5% withdrawal fee). Calculate 1-year outcome for each including fees. Which is best for a 6-month deployment?`,
          answer: {
            A: `Direct Aave: $20,000 × 5% = $1,000 gross. No fees (must manually compound — assume monthly: 5.12% effective). Net: $1,024 after 1 year.`,
            B: `Yearn: finds best across Aave/Compound/Morpho, say 5.5% before fees. Daily auto-compound: 5.65% effective. Performance fee: 20% of gains = $1,130 × 20% = $226. Management fee: 2% × $20K = $400. Wait — Yearn fee structure: 2% management on assets + 20% performance on gains. Actual Yearn USDC vault fees vary, often more modest now. Estimate: net ~4.5% after fees = $900. Not obviously better than direct for simple USDC.`,
            C: `Beefy 8% farm: $20,000 × 8.33% (daily compound effective) = $1,666 gross. 3.5% withdrawal fee at 6-month withdrawal: $21,666 × 3.5% = $758. Net: $20,908 → $21,666 − $758 = $20,908. Gain: $908. For 6-month: Beefy's withdrawal fee destroys much of the yield. At 12 months: $20,000 × 8.33% = $1,666 − $758 withdrawal = $908 net. Better than Aave but only because of higher gross yield, not efficiency.`,
            conclusion: `For 6-month USDC deployment: Aave direct is best (no withdrawal penalty, reasonable yield). Beefy's 3.5% withdrawal fee is very damaging for short deployments. For 2+ years: Beefy potentially wins on higher farm yield. Lesson: always check withdrawal fees for short time horizons.`,
          },
        },
        {
          type: `pendle-strategy`,
          scenario: `stETH currently yields 3.5% APY. Pendle offers PT-stETH maturing in 6 months at a 2% discount (PT costs 0.98 stETH per 1 stETH at maturity). You have 10 stETH. Two options: (A) Hold stETH and earn variable 3.5% for 6 months. (B) Convert 10 stETH → PT-stETH, lock in 4.08% fixed APY (2% discount over 6 months). Your view: staking yields will drop to 2.5% in the next 3 months. Which option wins under your view?`,
          answer: {
            optionA: `Variable: 3.5% for 3 months then 2.5% for 3 months. Blended: (3.5% + 2.5%) / 2 = 3.0% for 6 months. On 10 stETH: 0.15 stETH earned.`,
            optionB: `Fixed PT: 4.08% APY locked for 6 months regardless of rate changes. On 10 stETH: 4.08% × 6/12 = 2.04%. Wait — the 2% discount over 6 months IS the fixed rate. Calculation: buy 10 PT at 0.98 cost per stETH = spend 9.8 stETH. Receive 10 stETH at maturity = 0.2 stETH profit on 9.8 spent = 2.04% over 6 months = 4.08% APY.`,
            winner: `Option B wins under Jake's view. Fixed 4.08% APY vs variable 3.0% blended. Pendle's fixed rate locks in above the average of his expected variable path. If yields stay at 3.5%: Option A slightly better (3.5% vs 4.08%... actually fixed still wins). The fixed APY from PT needs to be compared carefully to the actual expected variable path.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: Yield Aggregator Portfolio`,
        description: `L6.1 (yield sources) + L6.10 (aggregators). Build a complete aggregated yield portfolio.`,
        challenges: [
          {
            scenario: `$40,000 to deploy across yield aggregators. Constraints: (1) At least one Convex position (for boosted Curve yield), (2) One Beefy position on a non-Ethereum chain, (3) Maximum 2% performance fees on any position, (4) Planned holding period: 12 months. Design the allocation, verify fee structures pass the constraint, and calculate expected blended net APY.`,
            answer: `$16,000 → Convex (USDC/USDT Curve pool). Boosted yield: ~12-15% (2.5x boost on 5% CRV emissions + 3% fees). Fee: 17% of CRV rewards (effectively ~2.5% drag on total yield). Net: ~12%. $14,000 → Beefy Finance on Arbitrum (stablecoin farm, USDC/USDT/DAI Curve). Beefy auto-compounds Convex position — similar yield 12%. 0% performance fee (Beefy most vaults use withdrawal fee model). Check: withdrawal fee 0.1% at end = $14 cost. Net after 12 months: ~12%. $10,000 → Yearn USDC vault (2% management, 20% performance — verify current vault parameters). Gross 6%: performance fee 20% × 6% × $10K = $120. Management: 2% × $10K = $200. Total fees: $320. Net: $600 − $320 = $280 = 2.8% net. Check: 2% management fee technically violates constraint interpretation. Use only if management fee is waived or reduced in newer vault versions. Alternative: Morpho Blue directly (no fees, 5% USDC). Blended: ($16K × 12% + $14K × 12% + $10K × 5%) / $40K = ($1,920 + $1,680 + $500) / $40K = $4,100 / $40K = 10.25% blended net APY.`,
          },
        ],
      },

      keyTakeaway: `Yield aggregators automate strategy execution, auto-compounding, and protocol optimization. Major protocols: Yearn (complex multi-protocol strategies, Ethereum-focused), Beefy (multi-chain LP auto-compounding), Convex (Curve boost amplification — almost always worth it), Pendle (yield trading: fixed-rate PT or leveraged YT). Auto-compounding math: meaningful for high rates or infrequent manual compounding. Use aggregators when: position < $50K, gas makes manual compounding expensive, or Convex's boost clearly outweighs its fee. Manage directly when: position > $200K, tax events from compounding matter, or aggregator strategy doesn't match your risk profile.`,
    },

  ],
}
