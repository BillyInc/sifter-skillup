// ⚡ Sifter LevelUp — Alt-Chain Ecosystems (Island 14, Levels 211–230)
// Part B of 2 — Levels 219–230 (Boss: L226)
//
// Chain: islandId=14
// Prerequisite: Final Frontier (Island 16)
// Primary Simulators: bridge, defi, onchainAnalysis

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { ALT_CHAIN_LEVELS_A } from './island14AltChainLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 219 — Cross-Chain Liquidity Fragmentation
// ─────────────────────────────────────────────────────────────────────────────

const L219: IslandLevel = {
  id: 219, mechanic: 'chain', tier: 'pro',
  topic: 'Cross-Chain Liquidity Fragmentation — The Multi-Chain Problem',

  explanation: `
In 2024, Ethereum's total DeFi TVL was approximately $80 billion — but that capital was spread across 20+ chains and hundreds of protocols. A whale wanting to swap $50 million of USDC to ETH on Arbitrum would find only $200 million of liquidity in the best Arbitrum pool. On Ethereum mainnet, a $4 billion pool would absorb the same trade with minimal slippage. The multi-chain world had created a liquidity fragmentation tax that every large DeFi user pays on every trade.

Liquidity fragmentation is the central unsolved problem of the multi-chain ecosystem. Each chain's pools are siloed: $200M on Arbitrum, $150M on Base, $300M on Optimism. Aggregated, this $650M could absorb large trades efficiently. Siloed, each pool handles only a fraction of what Ethereum mainnet's deep single pool could.

The fragmentation manifests in three concrete costs: higher slippage on large trades (thinner pools = more price impact per dollar traded), worse lending rates (less borrowing demand per chain = lower yields for depositors), and higher bridge costs when rebalancing between chains (every capital movement incurs fees and risk).

Partial solutions in 2024: bridge aggregators (Li.Fi, Socket) find the cheapest route across multiple bridges for a given transfer. Intent-based systems (UniswapX, 1inch Fusion) let professional "solvers" fill your order from their own inventory across chains without you explicitly bridging. Superchain native messaging reduces fragmentation within OP Stack chains. AggLayer reduces it within Polygon CDK chains.

The honest assessment: fragmentation within chain families (same security model, same technology) is solvable. Fragmentation between genuinely different chain types (Ethereum L2s vs Solana vs TON) is structurally persistent — these chains cannot share liquidity without a trusted intermediary, and a trusted intermediary is itself a security risk.
  `.trim(),

  fact: 'Liquidity fragmentation costs: higher slippage on large trades (thinner individual pools), lower lending yields (less per-chain borrowing demand), bridge fees to rebalance. Partial solutions: bridge aggregators (Li.Fi, Socket), intent-based solvers (UniswapX, 1inch Fusion), within-family unification (Superchain, AggLayer). Cross-family unification is structurally limited.',
  plain: 'When $80B in DeFi is spread across 20 chains, each chain\'s pools are smaller than if everything were on one chain — which means worse prices for big trades, lower yields from lending, and bridge fees whenever you move money. Solutions exist within chain families (Superchain, AggLayer), but liquidity between Ethereum, Solana, and TON will always be fragmented because they\'re genuinely different systems.',
  stars: [580, 710, 890], target: 890, coins: 40,
  simulatorLesson: 'chainEvaluator',

  examples: [
    {
      contextTag: '[Large trader, calculating slippage cost of fragmentation]',
      scenario: 'Marcus wants to swap $2M USDC → ETH. He compares: Ethereum mainnet Uniswap v3 ($4B pool, 0.05% fee tier) vs Arbitrum Uniswap v3 ($180M pool, 0.05% fee tier). He calculates the slippage cost difference.',
      outcome: 'Slippage calculation: $2M trade against $4B pool = 0.05% price impact (using the x*y=k AMM formula approximation). Total cost: $1,000 in slippage + $100 fee = $1,100. $2M trade against $180M pool = ~1.1% price impact. Total cost: $22,000 in slippage + $100 fee = $22,100. Difference: $21,000 more on Arbitrum. The fragmentation tax on this one trade is $21,000. Marcus uses Li.Fi bridge aggregator to check: he can route through multiple Arbitrum pools + a solver that uses Ethereum mainnet liquidity → back to Arbitrum. The solver fills from their own inventory at a 0.1% spread ($2,000) and bridges the settlement later. Marcus saves $19,000 by using an intent-based solver rather than trading directly on Arbitrum.',
    },
    {
      contextTag: '[Protocol designer, choosing where to concentrate liquidity]',
      scenario: 'Amara\'s DeFi protocol is live on 6 chains. Total liquidity: $30M distributed equally ($5M each). She wants to improve trade execution for her users. She considers concentrating all liquidity on 2 chains.',
      outcome: 'Analysis: $5M per chain pool executes $100K trades with 2% slippage. $15M single-chain pool executes the same $100K trade with 0.67% slippage — 3× less price impact. Concentrating on 2 chains: better user experience for the 80% of users on those chains, worse for the 20% on other chains (they must bridge first). Decision framework: identify which 2 chains have the highest trading volume (likely Arbitrum + Base for EVM-native users). Concentrate $20M on those two. Maintain $5M on each of the remaining 4 chains for base liquidity. Net result: 80% of users get significantly better execution; 20% face some bridge friction. Periodic rebalancing: monitor cross-chain volume and shift liquidity allocation quarterly to match actual user distribution.',
    },
    {
      contextTag: '[DeFi researcher, evaluating intent-based solutions]',
      scenario: 'Priya evaluates UniswapX for a $500K USDC → ETH swap. She wants to understand what the "solver" actually does and why it provides better prices than direct AMM trading.',
      outcome: 'UniswapX solver mechanics: Priya signs an order specifying minimum ETH output for her $500K USDC input. Solvers (professional market makers with inventory on multiple chains) compete to fill her order. A winning solver might: (1) Have $2M ETH in inventory on Arbitrum — they swap their ETH for her USDC instantly, at a price 0.3% better than AMM slippage. (2) The solver then rebalances their inventory later across chains at wholesale rates. (3) The solver charges a 0.1% spread for this service. Net result: Priya gets ETH at 0.3% better than AMM slippage (saving $1,500 on a $500K trade) minus the 0.1% solver spread ($500) = net saving of $1,000 vs direct AMM trading. The solver provides professional market-making as a service, aggregating cross-chain liquidity into a single quoted price without Priya needing to bridge.',
    },
  ],

  keyTakeaway: 'Liquidity fragmentation is the core economic cost of the multi-chain world — thin per-chain pools create higher slippage, worse yields, and bridge fees; intent-based solvers (UniswapX, 1inch Fusion) are the most effective current mitigation, filling orders from professional inventory rather than routing through fragmented AMM pools.',

  guidedPractice: [
    {
      question: 'Why does a $50M trade experience more slippage on Arbitrum ($200M pool) than on Ethereum mainnet ($4B pool), even though both use the same Uniswap v3 code?',
      options: [
        'Arbitrum\'s AMM algorithm is less efficient than Ethereum mainnet\'s implementation',
        'Pool depth (liquidity depth) determines slippage — a $50M trade is 25% of the $200M Arbitrum pool (massive relative impact) but only 1.25% of the $4B mainnet pool (minimal impact). The same AMM formula produces different price impact depending on the ratio of trade size to pool size.', // ✓
        'Arbitrum charges additional sequencer fees that increase effective slippage',
        'Ethereum mainnet validators prioritise large trades for faster inclusion, reducing effective slippage',
      ],
      correct: 1,
      hint: 'What fraction of the pool does a $50M trade represent on each chain? How does that fraction determine price impact?',
      explanation: 'AMM slippage mathematics: in a constant product AMM (x*y=k), price impact scales with the proportion of the pool being traded. $50M vs $200M pool = 25% of pool → substantial price movement. $50M vs $4B pool = 1.25% of pool → minimal price movement. The code is identical — the pool depth is different. Fragmented liquidity means each chain\'s pool is a fraction of what unified global liquidity would be. A rational large trader should: (1) calculate slippage on each chain\'s pools, (2) compare against intent-based solver quotes, (3) route to whichever provides best execution. For $50M trades, an intent-based solver or OTC desk will virtually always beat direct AMM trading on any single chain except the deepest Ethereum mainnet pools.',
    },
    {
      question: 'How does a "bridge aggregator" like Li.Fi differ from a single bridge like Across Protocol?',
      options: [
        'Bridge aggregators are more secure because they verify every bridge\'s smart contract before using it',
        'A bridge aggregator queries multiple individual bridges simultaneously and routes your transfer through whichever combination offers the best rate, speed, and safety — optimising across the entire cross-chain transfer market rather than being locked into one bridge\'s pricing and liquidity.', // ✓
        'Bridge aggregators are slower than single bridges because they must coordinate across multiple protocols',
        'Li.Fi provides insurance on all bridge transfers, while individual bridges like Across do not',
      ],
      correct: 1,
      hint: 'What does "aggregator" mean in the context of DEX aggregators (1inch)? How does the same principle apply to bridges?',
      explanation: '1inch aggregates DEX liquidity to find the best swap price; Li.Fi aggregates bridge routes to find the best transfer path. Single bridge (Across): one liquidity pool, one fee structure, one set of supported chains. Best option for Across-supported routes when Across has the best terms. Li.Fi: queries Across, Hop, Stargate, CCTP, native bridges simultaneously. For a given transfer (e.g., $100K USDC Arbitrum → Base), it might find: Across offers 0.05% fee, 2-minute speed; CCTP offers 0.00% fee (Circle\'s official bridge), 5-minute speed; Hop offers 0.1% fee, 30-second speed. Li.Fi presents the optimised option for your priorities (fee vs speed). For large transfers, the fee difference can be significant: 0.1% vs 0.05% on $1M = $500 saved by using the aggregator over defaulting to one bridge.',
    },
    {
      question: 'UniswapX uses "solvers" who fill orders from their own inventory. What risk does the solver take that the user does not?',
      options: [
        'The solver takes regulatory risk by acting as a market maker without a broker-dealer licence',
        'The solver takes inventory risk — they hold ETH or USDC across chains and their profit depends on being able to rebalance inventory at better prices than they paid users. If market prices move against them between filling user orders and rebalancing, the solver loses money.', // ✓
        'The solver takes smart contract risk by interacting with UniswapX\'s untested contracts',
        'The solver takes no risk — they simply route orders through AMMs and collect a spread with zero inventory commitment',
      ],
      correct: 1,
      hint: 'If a solver fills your $500K ETH order from their inventory and ETH price then falls 2%, what happens to the solver?',
      explanation: 'Solver economics: to fill a $500K USDC → ETH order instantly, the solver sends ETH from their inventory to the user and receives USDC. The solver now holds more USDC and less ETH than before. They must rebalance: buy ETH with USDC on the market to restore their inventory. If ETH price rises while they\'re rebalancing: they pay more USDC for the same ETH (loss). If ETH price falls: they buy ETH cheaper (profit). The solver\'s spread (0.1%) is the fee for taking this directional inventory risk between filling the order and rebalancing. Successful solvers: sophisticated market makers who can hedge this inventory risk efficiently (e.g., hedge with ETH futures while rebalancing spot). Unsuccessful solvers: lose money on bad market timing. Competition among solvers drives spreads down toward the efficient cost of capital and hedging, benefiting users.',
    },
    {
      question: 'Why is unified liquidity across the Superchain (OP Stack chains) more achievable than unified liquidity between Ethereum and Solana?',
      options: [
        'The Superchain has more total TVL than Solana, making aggregation easier',
        'OP Stack chains share the same security model (Ethereum-secured), EVM execution environment, and governance infrastructure — making trustless native message passing mathematically provable within the family. Ethereum-to-Solana liquidity unification requires trusting an intermediary who operates across fundamentally different security and execution models.', // ✓
        'Ethereum and Solana liquidity cannot be unified because they use different hash functions',
        'Superchain liquidity is unified because all OP Stack chains use the same token standard',
      ],
      correct: 1,
      hint: 'What must you trust when moving assets between Ethereum and Solana? What eliminates that trust requirement within the Superchain?',
      explanation: 'Trust requirement analysis: within the Superchain, cross-chain messages can be proved using shared Ethereum L1 security. A message from Base to Optimism can be verified by a contract on Ethereum that both chains trust. No third-party bridge operator needed — the proof is mathematical and Ethereum-enforced. Ethereum to Solana: Ethereum and Solana are independent security systems. There is no shared trusted base layer. A bridge between them requires: either a set of validators who monitor both chains and sign cross-chain messages (trust assumption: these validators are honest and secure), or a complex ZK proof system that can verify Ethereum state transitions on Solana\'s VM and vice versa (technically extremely challenging, not in production). Any current Ethereum-Solana bridge is a trusted intermediary — it cannot be made trustless given the incompatible underlying security models. This fundamental gap limits cross-ecosystem liquidity unification to bridge-mediated solutions with their associated trust risks.',
    },
    {
      question: 'A DeFi protocol is deciding whether to launch on 10 chains simultaneously or focus on 2 chains. What is the core economic argument for focusing?',
      options: [
        'Launching on fewer chains reduces regulatory risk by limiting geographic exposure',
        'Concentrated liquidity on 2 chains creates deeper pools that provide better trade execution, higher lending yields (more borrowing demand per pool), and easier protocol maintenance — while fragmented liquidity across 10 chains creates thin pools that serve users poorly on every chain and spreads development and security resources too thin.', // ✓
        'Multi-chain deployment requires more smart contract audits, which is more expensive',
        'Users prefer fewer chain options — more chains confuse non-technical users',
      ],
      correct: 1,
      hint: 'What happens to trade execution quality as the same total liquidity is split across more chains? What happens to operational complexity?',
      explanation: 'Concentration vs fragmentation trade-off: $50M total liquidity deployed on 2 chains ($25M each) vs 10 chains ($5M each). Trade execution: a $100K trade against a $25M pool = 0.4% slippage. Same trade against $5M pool = 2% slippage — 5× worse. Lending yields: $25M per chain attracts more borrowing demand, maintaining higher utilisation and better yields. $5M per chain is too shallow for large borrowers to meaningfully use, keeping utilisation and yields low. Operational complexity: each additional chain requires a deployment, monitoring infrastructure, emergency response capability, and separate security review for chain-specific risk. 10 chains = 10× operational burden with no improvement in user experience if liquidity is thin. The concentrated strategy: pick the 2 chains where your target users are, build deep liquidity there, add chains only when proven user demand exists.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 220 — Chain Incentive Cycles: Ecosystem Grants and TVL Volatility
// ─────────────────────────────────────────────────────────────────────────────

const L220: IslandLevel = {
  id: 220, mechanic: 'match3', tier: 'pro',
  topic: 'Chain Incentive Cycles — Ecosystem Grants and TVL Volatility',

  explanation: `
In August 2021, Avalanche launched its "Rush" programme — $180M in AVAX token incentives distributed to DeFi protocols and LPs over 3 months. TVL on Avalanche went from $300M to $12B in 90 days. When the incentive programme ended, TVL dropped back to $2B within 60 days. The mercenary capital had arrived, extracted the incentive tokens, and left. What remained was the portion of users and protocols that found genuine value in Avalanche independent of the rewards.

Chain incentive cycles follow a predictable pattern that every crypto investor should recognise.

Phase 1 — Grant announcement: a chain announces a large ecosystem development fund. The announcement itself raises the chain\'s native token price (speculative anticipation of TVL growth).

Phase 2 — Protocol deployment: protocols deploy on the chain to access the grants. Most are Ethereum protocol forks with minimal chain-specific innovation — they are "mercenary deployments" optimising for grant capture.

Phase 3 — TVL spike: liquidity miners deposit capital to earn the grant-funded APY. TVL grows rapidly. The chain\'s metrics look impressive. More grants are allocated to "proven demand."

Phase 4 — Emission exhaustion: grant rewards end or decline. APY falls to market rate or below. Mercenary LPs withdraw, move capital to the next incentivised chain. TVL falls 50-80% from the peak.

Phase 5 — True baseline: what remains is the TVL supported by genuine protocol product-market fit — the LPs and borrowers who found real utility beyond the incentive. Fantom\'s Rush programme peaked at $8B TVL, fell to $400M when Andre Cronje left and incentives ended. The genuine baseline was $400M. Avalanche Rush peaked at $12B, settled to $2B — indicating $2B of genuine ecosystem demand.

The investment lesson: evaluate chains at their incentive-adjusted baseline TVL, not peak incentive TVL. A chain with $2B TVL post-incentive and growing native protocol development is more valuable than a chain with $12B peak TVL driven purely by temporary emissions.
  `.trim(),

  fact: 'Chain incentive cycle: grant announcement → protocol deployment (mercenary forks) → TVL spike → emission exhaustion → TVL decline 50-80% → true baseline. Historical examples: Avalanche Rush ($300M → $12B → $2B), Fantom ($8B → $400M). Evaluation metric: post-incentive baseline TVL and native protocol development, not peak TVL.',
  plain: 'Every time a blockchain announces a big incentive programme, TVL spikes as people chase the rewards — then falls when rewards end. Avalanche paid $180M in AVAX and TVL went 40×... then dropped 80% when the programme ended. The permanent signal isn\'t the peak — it\'s what\'s left after incentives disappear. That\'s the real demand for using the chain.',
  stars: [600, 730, 910], target: 910, coins: 40,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Analyst, evaluating a new chain\'s TVL]',
      scenario: 'Amara is evaluating Chain X which launched 6 months ago. TVL peaked at $8B during a $200M grant programme, now sits at $1.2B with incentives running at 50% of original rate. She needs to estimate the true baseline.',
      outcome: 'Analysis: current TVL ($1.2B) is still partially supported by remaining incentives (50% of original). To estimate true baseline: identify what portion of current TVL is in protocols with native utility vs emission-only protocols. Check: what are the top 10 protocols by TVL? If the top 5 are basic Uniswap and Compound forks offering 4× Ethereum yields only because of incentives, the organic floor is lower. If the top 3 are chain-native innovations with unique utility, those have genuine retention. Estimate: the 50% reduction in incentives from peak caused a 85% TVL drop — very sensitive to incentives. When incentives fully end, expect another 50-60% decline. True baseline estimate: $400-600M. Decision: evaluate the chain\'s native DeFi innovation (not forks), developer activity, and unique use cases before treating $1.2B current TVL as sustainable.',
    },
    {
      contextTag: '[Protocol team, evaluating whether to accept a chain grant]',
      scenario: 'James\'s DeFi protocol receives grant offers from three chains: Chain A ($2M in native tokens, 6-month incentive period), Chain B ($500K in stablecoins, no strings attached), Chain C (no grant but access to a 50,000-user active community). He evaluates.',
      outcome: 'Chain A ($2M tokens, 6 months): the native tokens have price risk — if Chain A\'s token falls 70% during the 6 months, the real value is $600K. The 6-month incentive attracts mercenary LPs who leave when incentives end, giving his protocol a false sense of product-market fit. It costs his team 3 months of deployment work. Chain B ($500K stablecoins): certain value, no price risk. Can fund development directly. No user retention mechanism — just capital. Chain C (community, no grant): 50,000 active users are worth more than $2M if they genuinely engage with the protocol. User acquisition at $40/user (typical Web3 cost) = $2M equivalent, but with genuine retention. James takes Chain B for operational capital and negotiates separately with Chain C for community partnership. Avoids Chain A\'s mercenary dynamics.',
    },
    {
      contextTag: '[Investor, identifying post-incentive winners]',
      scenario: 'Priya wants to identify which chains from the 2021-2022 incentive cycle have genuine long-term value. She reviews post-incentive TVL for: Avalanche ($2B remaining), Fantom ($400M remaining), Harmony ($50M remaining), Celo ($30M remaining).',
      outcome: 'Post-incentive baseline analysis: Avalanche ($2B): multiple native DeFi innovations survived (Trader Joe, Benqi), enterprise subnet adoption growing independently of DeFi incentives, TVL supported by genuine activity. Positive signal. Fantom ($400M): heavily dependent on Andre Cronje who departed; few native innovations survived; TVL stabilised at much lower level. Moderate signal with concentration risk. Harmony ($50M): suffered a $100M bridge hack — trust destroyed permanently. Below-baseline TVL reflects ongoing reputation damage. Negative signal. Celo ($30M): transitioned focus from DeFi to real-world payments and mobile. New direction has different metrics than TVL. Inconclusive — requires evaluating the payments adoption story separately. Investment implication: Avalanche has demonstrated genuine post-incentive demand; Fantom is a watch-and-wait; Harmony is structurally damaged; Celo requires a different evaluation framework.',
    },
  ],

  keyTakeaway: 'Chain incentive programmes reliably inflate TVL 5-40× during the programme then deflate 50-80% when incentives end — evaluate chains by their post-incentive TVL baseline and native protocol development activity, not by peak grant-funded metrics.',

  guidedPractice: [
    {
      question: 'Why do mercenary capital providers leave when chain incentives end, even if the chain continues to operate normally?',
      options: [
        'Mercenary capital providers are legally prohibited from holding funds on incentivised chains beyond the programme period',
        'Mercenary LPs optimise for yield rather than chain loyalty — they deposit capital specifically to earn the incentive APY. When that APY normalises to market rate, there is no differential incentive to remain on this chain vs the next incentivised chain. Capital migrates to wherever the next grant programme offers above-market yields.', // ✓
        'The smart contracts used during incentive programmes automatically expire, forcing withdrawals',
        'Mercenary capital leaves because the incentive tokens they earned are locked for 12 months, giving them no reason to maintain liquidity',
      ],
      correct: 1,
      hint: 'What made this chain attractive to mercenary capital specifically? What changes when the incentive programme ends?',
      explanation: 'Mercenary capital\'s decision function: "Where can I earn the highest risk-adjusted APY?" During Chain X\'s $200M incentive programme: Chain X offers 40% APY (base 5% + 35% in grant token emissions). Mercenary LP deposits and earns 35% extra. Programme ends: Chain X offers 5% APY (market rate — same as Ethereum Aave). Chain Y just announced a new programme offering 30% APY. Mercenary LP withdraws from Chain X, deposits on Chain Y. The LP has zero chain loyalty — loyalty is economically irrational when yield is the only value proposition. The only capital that stays is capital that found genuine utility (lower fees for frequent use, specific protocols only available on this chain, community belonging). The key design question for chains: what makes staying rational after incentives end?',
    },
    {
      question: 'A new L1 chain launches with a $500M ecosystem development fund. Six months in, TVL is $15B. An analyst says the chain has "proven product-market fit." What is wrong with this analysis?',
      options: [
        'Nothing — $15B TVL is objective evidence of adoption regardless of incentives',
        'The $15B TVL may be almost entirely incentive-driven mercenary capital. Without knowing the post-incentive baseline (which requires waiting for incentives to end or phase down), there is no way to distinguish genuine product-market fit from grant-funded TVL inflation. True product-market fit is demonstrated by TVL that persists after incentives stop.', // ✓
        'The analyst should wait for $50B TVL before declaring product-market fit',
        'The chain needs to have been operating for at least 2 years before claiming product-market fit',
      ],
      correct: 1,
      hint: 'What does "product-market fit" mean — users who need the product regardless of financial incentives, or users who come for the incentives?',
      explanation: 'Product-market fit definition: users who repeatedly return to use a product because it solves a genuine problem, independent of financial incentives. $15B TVL from a $500M grant programme represents users who are there for the incentives, not necessarily for the product. The analyst\'s error is confusing correlation (high TVL coincides with large grants) with causation (high TVL proves genuine demand). The correct methodology: (1) Track TVL velocity as incentive rates decline — does TVL hold as APY approaches market rate? (2) Identify how many protocols in the TVL are chain-native innovations vs incentive-seeking forks. (3) Measure developer activity after the grant announcement period — are developers staying to build? (4) Wait for the incentive wind-down to observe the true retention rate. This takes 6-12 months. Any TVL figure cited during active large incentive programmes should be heavily discounted when assessing product-market fit.',
    },
    {
      question: 'Fantom\'s TVL fell from $8B to $400M when incentives ended and Andre Cronje departed. What does this reveal about the ecosystem\'s underlying strength?',
      options: [
        'It reveals that Fantom\'s technology was fundamentally flawed and no longer functional after Andre Cronje\'s departure',
        'It reveals that the $8B TVL was primarily supported by two non-durable factors: incentive emissions and one influential developer\'s presence. An ecosystem resilient to single-developer departure would show TVL retention across multiple independent protocol teams, not 95% TVL loss.', // ✓
        'It reveals that the $400M remaining TVL is zero and the chain is effectively dead',
        'It reveals that all DeFi chains are subject to the same dynamics and Fantom is not uniquely fragile',
      ],
      correct: 1,
      hint: 'Two specific factors caused the TVL decline. What do each reveal about the ecosystem\'s structure?',
      explanation: 'Dual fragility diagnosis: Factor 1 (Incentive dependency): 95% of TVL leaves when incentives end = 95% of capital was mercenary. Only 5% of users found genuine utility. Contrast with Ethereum: removing all ETH staking rewards would not cause 95% TVL loss — DeFi users are there for the protocols, not for incentive programmes. Factor 2 (Key-person dependency): Andre Cronje\'s departure triggered a confidence crisis and development stall — multiple Fantom-native protocols lost their lead developer simultaneously. A mature ecosystem distributes development across dozens of independent teams. If one developer\'s departure causes 90% protocol abandonment, the "ecosystem" was one developer wearing different hats. Fantom\'s genuine post-shock baseline ($400M) represents the users who remained despite both negative factors. This is the real ecosystem — small but potentially growing from a clean floor.',
    },
    {
      question: 'A chain wants to use its ecosystem fund to create durable TVL rather than temporary mercenary capital. Which grant design is more likely to achieve this?',
      options: [
        'A $100M flat liquidity mining programme distributed to all LPs proportional to their deposits over 6 months',
        'A $30M milestone-based programme: $5M to protocols that reach 6 months of sustained operation, $10M to those that achieve genuine user retention metrics (returning users, not just TVL), $15M to protocols that develop chain-native features unavailable on other chains — all paid in stablecoins over 18 months', // ✓
        'A $200M one-time airdrop to all wallets that bridge to the chain in the first month',
        'A $50M grants programme distributed exclusively to EVM protocol forks to accelerate ecosystem coverage',
      ],
      correct: 1,
      hint: 'Which programme rewards mercenary behaviour? Which rewards the behaviours that create durable ecosystems?',
      explanation: 'Incentive design alignment: Option 1 (flat liquidity mining): directly rewards capital deposit, not usage or retention. Attracts mercenary LPs who will leave when emissions end. Creates the exact TVL inflation + crash cycle described. Option 2 (milestone-based stablecoins): rewards protocol longevity (6 months operation shows commitment), genuine user retention (returning users signal real utility), and chain-native innovation (unique features create ecosystem lock-in). Stablecoin payment removes the "sell the grant token" mercenary dynamic. 18-month distribution prevents front-loading. Option 3 (one-time bridge airdrop): attracts wallet farmers — the ultimate mercenary behaviour. Option 4 (EVM forks only): forks are the lowest-innovation mercenary deployment. The correct design creates incentives aligned with the behaviours that make ecosystems self-sustaining: protocol longevity, genuine user retention, and differentiated utility.',
    },
    {
      question: 'You are evaluating two chains for a long-term DeFi deployment. Chain A has $5B TVL with no active incentive programme (3-year history). Chain B has $12B TVL, currently in month 4 of a $300M incentive programme. Which is the better signal of genuine ecosystem value?',
      options: [
        'Chain B — higher TVL always indicates more economic activity and better liquidity',
        'Chain A — $5B TVL with no active incentives represents genuine demand from users who stay without financial inducement. Chain B\'s $12B TVL cannot be distinguished from incentive-driven inflation without waiting for the programme to end.', // ✓
        'Both are equivalent — TVL is TVL regardless of what caused it',
        'Chain B — a $300M grant programme indicates confidence in the ecosystem\'s future',
      ],
      correct: 1,
      hint: 'Which TVL figure do you understand — sustained for 3 years without incentives, or currently being inflated by $300M in grants?',
      explanation: 'Signal quality analysis: Chain A\'s $5B TVL: the result of 3 years of organic ecosystem development with no artificial inflation. This capital has stayed through bull and bear cycles without incentive support — it is there because users found genuine utility. It is a reliable forward indicator of the ecosystem\'s sustainable capacity. Chain B\'s $12B TVL: $300M grant programme is actively inflating it. The true baseline could be anywhere from $1B to $10B — you simply cannot know without data from after the programme ends. Deploying $500K into Chain B\'s current environment means deploying into a pool that may shrink 70-80% in 8 months. Chain A\'s pool size is predictable and tested. The heuristic: TVL that persisted through the absence of incentives is a stronger signal than TVL that exists during active incentives. Historical accuracy: this analysis predicted Avalanche Rush\'s post-incentive collapse 6 months before it happened.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 221 — DeFi Across Alt-Chains: Protocol Comparison
// ─────────────────────────────────────────────────────────────────────────────

const L221: IslandLevel = {
  id: 221, mechanic: 'trait', tier: 'pro',
  topic: 'DeFi Across Alt-Chains — Protocol Landscape Comparison',

  explanation: `
In 2024, Aave was deployed on 12 different chains simultaneously. The same smart contract code, audited once, providing lending infrastructure across Ethereum, Arbitrum, Optimism, Base, Polygon, Avalanche, and more. For a user wanting to borrow USDC against ETH collateral: the security of the interaction depends on which chain they use, not just which protocol. The same Aave contract has different risk profiles on different chains.

Multi-chain protocol deployment is now the default for major DeFi protocols — but the chain choice for each protocol matters independently from the protocol choice.

Lending leaders by chain: Ethereum (Aave v3, Compound v3, Morpho), Arbitrum (Aave v3, Radiant, Silo Finance), Base (Moonwell, Seamless Protocol), Optimism (Aave v3, Exactly Protocol), Avalanche (Benqi, Aave v3), Polygon (Aave v3, Compound), Solana (Kamino Finance, MarginFi, Drift).

DEX leaders by chain: Ethereum (Uniswap v3, Curve), Arbitrum (Camelot, GMX), Optimism (Velodrome), Base (Aerodrome), Avalanche (Trader Joe, Pharaoh), Polygon (QuickSwap, Uniswap v3), Solana (Jupiter aggregator, Raydium, Orca), TON (STON.fi, DeDust).

The "follow the protocol" heuristic: rather than finding the best protocol on your chosen chain, follow a protocol you trust to the chain where it has the deepest TVL and longest track record. Aave on Ethereum mainnet ($10B TVL, 4 years) is categorically safer than Aave on a new chain ($50M TVL, 3 months) — same code, different risk profile.

Chain-native vs ported protocols: Camelot (Arbitrum-native DEX), Kamino (Solana-native lending), Aerodrome (Base-native ve(3,3) DEX) are built specifically for their chain's properties. Ported Ethereum protocols may miss chain-specific optimisations available to native builders.
  `.trim(),

  fact: 'Protocol deployment hierarchy: trust the protocol where it has deepest TVL + longest track record. Same Aave code has different risk on Ethereum ($10B, 4 years) vs new chain ($50M, 3 months). Chain-native leaders: Camelot (Arbitrum DEX), Kamino (Solana lending), Aerodrome (Base DEX), Velodrome (Optimism DEX), STON.fi (TON DEX).',
  plain: 'Aave and Uniswap are on 12 chains each. Using Aave on Ethereum (billions locked for years) is safer than Aave on a new chain (millions locked for months) even though it\'s the same code. Follow protocols you trust to where they have the most history and depth. Also, chains often have native-built protocols (Camelot on Arbitrum, Aerodrome on Base) that are better than ports because they\'re designed specifically for that chain.',
  stars: [620, 760, 950], target: 950, coins: 40,
  simulatorLesson: 'l2FeeWars',

  examples: [
    {
      contextTag: '[DeFi allocator, choosing chain for USDC lending]',
      scenario: 'James wants to deposit $200,000 USDC in a lending protocol. He compares: Aave v3 on Ethereum ($8B TVL, 4 years), Aave v3 on Arbitrum ($2B TVL, 2 years), Moonwell on Base ($600M TVL, 1 year). How does he choose?',
      outcome: 'Risk-adjusted analysis: Aave v3 Ethereum: maximum security — $8B TVL across 4 years of adversarial testing at scale. ETH-secured. Supply APY: 5.2%. Aave v3 Arbitrum: same Aave code, Ethereum-secured L2, but 75% less TVL and 2 years less history. The difference in TVL matters at this amount — $200K is 0.01% of Ethereum Aave but 0.01% of a smaller pool. Supply APY: 5.8%. Moonwell Base: Compound fork (different codebase from Aave), 1 year track record, $600M TVL. Highest yield at 6.2% but shortest track record. James\'s decision: $120K on Aave v3 Ethereum (security floor), $60K on Aave v3 Arbitrum (same protocol, slightly higher yield, manageable L2 risk), $20K on Moonwell Base (exploratory position, diversification into a well-audited Compound fork). Weighted APY: 5.4%.',
    },
    {
      contextTag: '[Solana DeFi user, understanding Kamino vs Solana ports of Ethereum protocols]',
      scenario: 'Amara is deploying $50,000 on Solana. She compares Kamino Finance (Solana-native lending, $1B TVL) vs Aave on Solana if it existed (hypothetical). Why does Kamino\'s native design matter?',
      outcome: 'Kamino Solana-native advantages: (1) Built around Solana\'s account model and Sealevel parallel execution — positions are structured to maximise throughput within Solana\'s specific architecture. An Ethereum protocol port would use account structures designed for Ethereum\'s sequential EVM, not Solana\'s parallel processor. (2) Kamino integrates native Solana oracle solutions (Pyth network, Switchboard) optimised for Solana\'s 400ms block times — Chainlink on Solana has different latency properties. (3) Liquidation mechanism designed for Solana\'s transaction model — liquidation bots operate in Solana\'s mempool, which works differently from Ethereum\'s. Native builders understand these mechanics; Ethereum porters often discover edge cases post-launch. (4) Kamino concentrates liquidity in Orca and Raydium pools natively — protocols built for Ethereum AMMs would require adapters with additional smart contract attack surface.',
    },
    {
      contextTag: '[Yield optimizer, building a multi-chain portfolio]',
      scenario: 'Priya wants to optimise $100,000 across 4 chains using the best protocol on each. She uses the "follow the protocol" heuristic. Her risk tolerance: moderate.',
      outcome: 'Portfolio construction: Ethereum ($40,000): Aave v3 USDC supply (5.2% APY). Maximum security, deepest TVL, longest track record. Core position. Arbitrum ($30,000): Camelot USDC/USDT LP (7.5% APY). Camelot is Arbitrum-native with concentrated liquidity designed for Arbitrum\'s ecosystem. LP risk is stable (USDC/USDT correlation), yield comes from real trading fees + moderate GRAIL emissions. Base ($20,000): Aerodrome USDC/USDbC stable pool (8% APY). Base-native ve(3,3) DEX, strong Coinbase backing, stable pool minimises IL risk. Solana ($10,000): Kamino Finance USDC supply (7.1% APY). Solana-native, $1B TVL, 18-month track record. Weighted APY: 6.5%. This portfolio follows the heuristic: trusted protocols where they have the most established presence on each chain.',
    },
  ],

  keyTakeaway: 'The same protocol code has different risk profiles on different chains — follow protocols you trust to where they have deepest TVL and longest track record, and prefer chain-native protocols (Camelot, Kamino, Aerodrome) that are built for their chain\'s specific architecture over generic Ethereum ports.',

  guidedPractice: [
    {
      question: 'Why does Aave v3 on a new chain with $50M TVL and 3-month history carry more risk than Aave v3 on Ethereum with $10B TVL and 4-year history, even though the contract code is identical?',
      options: [
        'The chain team may have modified Aave\'s code for their deployment, introducing new vulnerabilities',
        'Adversarial testing at scale over time is a critical component of security — $10B TVL for 4 years means thousands of motivated attackers have attempted exploits and failed. $50M TVL for 3 months has faced minimal adversarial testing. A vulnerability undetected at small scale may only be exploitable once TVL grows.', // ✓
        'Aave charges higher fees on smaller deployments, increasing the cost to users',
        'Ethereum mainnet Aave has more validators securing it than Aave on other chains',
      ],
      correct: 1,
      hint: 'What changes between 3 months and 4 years of a protocol being live? What changes between $50M and $10B TVL?',
      explanation: 'Security is not binary (audited/not audited) but continuous (time under adversarial conditions at meaningful stakes). New chain deployment risks: (1) Unknown chain-specific interaction bugs: a contract that works correctly on Ethereum may have subtle interaction issues with a new chain\'s precompiles, gas metering, or block timing. These surface only in production. (2) Oracle integration differences: price feeds on a new chain may have different latency, update frequency, or manipulation resistance. (3) Liquidation infrastructure immaturity: if the chain\'s DeFi ecosystem is new, the liquidation bot ecosystem may not be sufficiently competitive — creating liquidation delays during market stress. (4) Governance attack surface: smaller deployment = lower cost for a governance attack. None of these risks exist in the Aave contract code — they are emergent properties of the deployment environment. A 4-year, $10B environment has resolved these.',
    },
    {
      question: 'Camelot is Arbitrum-native while Uniswap v3 is a port. For a user providing LP on Arbitrum, what specific advantage does a chain-native DEX offer?',
      options: [
        'Chain-native DEXes have lower smart contract risk because they were audited by Arbitrum\'s security team',
        'Camelot was designed around Arbitrum\'s specific token ecosystem (GRAIL emissions aligned with Arbitrum\'s native token incentives), LP structures optimised for Arbitrum\'s 250ms block times and Camelot\'s dual-AMM model, and integration with Arbitrum\'s native yield ecosystems (Pendle, Radiant) that Uniswap\'s generic code cannot natively compose with', // ✓
        'Chain-native DEXes are exempt from gas fees because they are officially endorsed by the chain team',
        'Uniswap v3 on Arbitrum has a bug that makes it less efficient than on Ethereum — native DEXes avoid this',
      ],
      correct: 1,
      hint: 'What can a protocol designed from scratch for Arbitrum do that a code port from Ethereum cannot? Think about integration depth.',
      explanation: 'Chain-native design advantages: Camelot\'s dual liquidity AMM (Spnl for stable pairs, Nitro for volatile pairs) was designed after studying which token pairs generate the most volume on Arbitrum specifically. Camelot\'s GRAIL emissions are structured around Arbitrum\'s existing DeFi ecosystem — specifically designed to pair with Pendle (yield tokenisation) and Radiant (cross-chain lending). This composability depth is architectural: native protocols design their economics around the existing ecosystem. Ported protocols bring their own incentive token and economic model from Ethereum, which may not align with the new chain\'s ecosystem structure. Additionally: Camelot\'s team actively participates in Arbitrum governance (they understand the ARB grant programme deeply, having received and deployed ARB ecosystem grants effectively). A ported Uniswap deployment has no such ecosystem integration.',
    },
    {
      question: 'Jupiter is not a protocol — it is an aggregator routing through Raydium, Orca, and other Solana DEXes. Why is an aggregator particularly important on Solana?',
      options: [
        'Solana\'s transaction fees are so high that users must aggregate multiple swaps to make them economical',
        'Solana\'s DeFi ecosystem has many competing AMMs (Raydium, Orca, Phoenix, Lifinity) with fragmented liquidity. Jupiter finds the best route across all pools, including split routes that use multiple pools simultaneously — critical for getting good prices on Solana where no single pool dominates the way Uniswap dominates Ethereum.', // ✓
        'Jupiter is the only Solana protocol with regulatory approval to operate in the US',
        'Aggregators are important on Solana because Solana transactions cannot be submitted directly to DEXes',
      ],
      correct: 1,
      hint: 'Ethereum has Uniswap as a dominant DEX with extremely deep pools. Does Solana have an equivalent single dominant DEX?',
      explanation: 'Solana liquidity landscape: unlike Ethereum where Uniswap v3 dominates with deep pools, Solana\'s DEX ecosystem is more fragmented across Raydium (traditional AMM), Orca (whirlpools concentrated liquidity), Phoenix (central limit order book), Lifinity (proactive market maker), and others. Each has different liquidity for different token pairs. A direct trade on any single venue may get poor execution for certain pairs. Jupiter: queries all venues simultaneously, finds optimal route (may split across 3 pools to minimise impact), and executes as a single transaction using Solana\'s composability. Jupiter handles 80%+ of Solana\'s DEX volume as a result — it is the default trade execution layer. For DeFi users on Solana: never trade directly on a DEX, always use Jupiter. This is the opposite of Ethereum, where direct Uniswap v3 interaction for the main ETH/USDC pair often beats aggregator routing.',
    },
    {
      question: 'You want maximum yield on $50,000 USDC across Solana. You compare Kamino (lending, 7.1% APY), MarginFi (lending, 7.8% APY), and a new protocol "SolanaMax" (lending, 22% APY, launched 2 months ago). How do you allocate?',
      options: [
        'All $50,000 into SolanaMax — maximum yield is the objective',
        '$30,000 Kamino, $20,000 MarginFi, $0 SolanaMax — the 22% APY from a 2-month-old protocol is almost certainly emission-driven or unsustainable; Kamino and MarginFi have track records and meaningful TVL on Solana; the marginal yield gain from SolanaMax does not compensate for unproven protocol risk', // ✓
        '$20,000 each split evenly across all three — diversification reduces risk',
        '$45,000 Kamino, $5,000 SolanaMax — a token position in the new protocol captures upside',
      ],
      correct: 1,
      hint: 'What does 22% APY on a 2-month-old Solana lending protocol tell you about the source of that yield? Is real USDC borrowing demand 3× higher than on Kamino?',
      explanation: 'Yield source analysis: Kamino and MarginFi\'s 7-8% USDC yields represent real borrowing demand — traders borrowing USDC to lever Solana positions, pay for leveraged yield farming, etc. This yield is market-rate for Solana DeFi. SolanaMax at 22%: what generates 22% yield on USDC borrowing? Either (1) unsustainable emission programme distributing their own token (which will fall when emissions end/token price drops), or (2) structural risk attracting a yield premium (younger protocol, unusual collateral types, lower liquidation protections). Neither justifies a $50K position in a 2-month-old protocol. The rational allocation: concentrated in protocols with demonstrated track records. A 2-month-old protocol needs 12+ months of clean operation and $500M+ TVL before deserving a meaningful position. Note: $0 to SolanaMax is not "leaving money on the table" — it is avoiding the likely outcome of 22% APY that lasts 3 months before a protocol failure or emission collapse.',
    },
    {
      question: 'Velodrome (Optimism) and Aerodrome (Base) use the same ve(3,3) tokenomics model. If both offer equivalent APY for the same LP position, which should a security-conscious investor prefer?',
      options: [
        'Aerodrome — Base has higher TVL overall so Aerodrome has more liquidity',
        'Velodrome — older deployment (launched mid-2022 vs Aerodrome mid-2023), longer adversarial testing period at meaningful TVL, and the original implementation of the ve(3,3) model in the OP Stack ecosystem. Aerodrome forked Velodrome\'s code — the original has longer-running security validation.', // ✓
        'Neither — ve(3,3) tokenomics have been proven vulnerable and both should be avoided',
        'Aerodrome — Coinbase backing of Base provides institutional security guarantees for all Base protocols',
      ],
      correct: 1,
      hint: 'If two protocols have identical code and economics, which property matters most for a security-focused investor?',
      explanation: 'Track record comparison: Velodrome launched June 2022 on Optimism — 2+ years of production operation with meaningful TVL. It survived the 2022-2023 bear market, multiple stress tests, and operated through Optimism ecosystem changes. Aerodrome launched August 2023 on Base — it is a direct fork of Velodrome. The code is proven (inherited from Velodrome\'s audits and track record). However, Aerodrome itself is only 1 year old. A security-conscious investor values additional operational history. At equivalent APY: choose Velodrome\'s proven 2-year track record over Aerodrome\'s 1-year track record. This will change over time: as Aerodrome accumulates its own operational history, the preference may shift toward it (given Base\'s stronger institutional backing and growing TVL). But "same code + more history" wins in security-first evaluation.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 222 — Multi-Chain Security Risks at Scale
// ─────────────────────────────────────────────────────────────────────────────

const L222: IslandLevel = {
  id: 222, mechanic: 'rugpull', tier: 'pro',
  topic: 'Multi-Chain Security Risks at Scale',

  explanation: `
In 2022, bridge hacks alone accounted for $2 billion in losses across four major incidents: Ronin ($625M), Wormhole ($320M), Nomad ($190M), and Harmony Horizon ($100M) — all in a single calendar year. The common thread: cross-chain infrastructure is the highest-value, most attack-incentivised target in all of DeFi, and in 2022, the security practices did not match the stakes.

Multi-chain deployment multiplies security risk in ways that are not immediately intuitive.

The bridge attack surface: every chain adds at least one cross-chain bridge — either a canonical bridge (official, often secured by the chain\'s own validators) or third-party bridges (faster but with independent trust models). Each bridge is a smart contract holding the assets in transit. Bridges are disproportionately targeted because they concentrate large amounts of value in relatively simple contracts that must trust cross-chain state — a harder problem than securing a single-chain contract.

The "weakest link" property: in a multi-chain portfolio, your security is bounded by the weakest chain/bridge combination you use. If Chain X has excellent security but you bridge funds through a third-party bridge with a known vulnerability, you have Chain X security downstream and bridge vulnerability upstream. The entire position is vulnerable regardless of Chain X's security quality.

Depth vs breadth trade-off: every new chain you add to your portfolio adds: a new set of smart contract risks (the protocols on that chain), a new bridge risk (to get there), a new chain-specific OPSEC complexity (different RPC endpoints, different wallet configurations, different monitoring requirements). For most users: deep positions on 2-3 chains provide better risk-adjusted returns than shallow positions on 10 chains, because the breadth adds attack surface without adding proportionate diversification benefit.

The 2022 bridge hack year: Ronin used a multisig with only 5/9 required signatures; 4 were compromised by social engineering. Nomad had a single line of incorrect initialisation code — once discovered, the exploit was replicated by 300 independent attackers simultaneously. Wormhole had a signature verification bypass that allowed unauthorised minting.
  `.trim(),

  fact: '2022 bridge hack year: Ronin $625M (5/9 multisig social engineering), Wormhole $320M (signature verification bypass), Nomad $190M (initialisation bug, 300 copycat attackers), Harmony $100M (multisig compromise). Security principle: every new chain adds a bridge risk + protocol risk + operational complexity. Depth on 2-3 chains > breadth on 10.',
  plain: 'Bridges between chains are the most hacked part of crypto — $2 billion lost in one year. Every chain you add to your portfolio means another bridge to use, another set of contracts to trust, and more things to monitor. For most people, using 2-3 chains deeply is safer and simpler than spreading thinly across 10 chains. The weakest bridge you use is your security ceiling.',
  stars: [640, 780, 980], target: 980, coins: 40,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[Security analyst, evaluating bridge risk]',
      scenario: 'Amara has $100,000 to deploy across Ethereum and Arbitrum. She compares using the canonical Arbitrum bridge (7-day withdrawal, Ethereum-secured) vs Across Protocol (instant, third-party liquidity pool, audited). How does she evaluate the security trade-off?',
      outcome: 'Canonical bridge analysis: Ethereum-secured — fraud proofs on Ethereum mainnet. No third-party trust assumption. Security ceiling: Ethereum. Withdrawal: 7 days (standard optimistic rollup window). Deposit: ~10 minutes. Smart contract: Arbitrum\'s own bridge, most audited in their ecosystem. Across Protocol analysis: third-party bridge with its own smart contracts and liquidity pools. Audited (Trail of Bits, twice). $800M in total historical volume without exploit. Instant withdrawal (LP-funded). Smart contract risk: Across\'s contracts independently. Assessment: for $100K with a 6-month investment horizon, Across\'s instant bridging is acceptable at this amount — the security track record is strong and the 7-day restriction is a real operational constraint. For $2M+ with no time pressure: canonical bridge is the correct choice. Bridge choice should scale with amount and time horizon: small amounts = convenience bridges acceptable; large amounts = canonical bridge for the security guarantee.',
    },
    {
      contextTag: '[Portfolio manager, deciding chain breadth]',
      scenario: 'Marcus manages $500,000 across DeFi. He is currently on 7 chains: Ethereum, Arbitrum, Base, Optimism, Avalanche, Solana, and Polygon. He monitors 14 different protocols. He wants to simplify without losing significant yield.',
      outcome: 'Audit of 7-chain complexity: (1) 6 different bridge relationships, each a potential exploit vector. (2) 7 different chain monitoring setups (RPC endpoints, block explorers, alerts). (3) 14 protocol approvals to manage and monitor for security changes. (4) 7 different gas tokens needed for emergency transactions. (5) 7 different regulatory postures to understand. Consolidation analysis: compare yields on each chain — if Avalanche and Polygon each provide only 0.5% more yield than equivalent positions on Arbitrum or Base, the yield premium doesn\'t compensate for the added complexity and bridge risk. Recommendation: consolidate to 3 chains (Ethereum, Arbitrum, Base) covering 70% of DeFi liquidity depth. Migrate Avalanche and Polygon positions to Arbitrum equivalents. Maintain Solana for the unique native DeFi opportunities not replicated elsewhere. Result: 3-chain focus, 8 protocols, 2 bridge relationships. Significant complexity reduction with minimal yield impact.',
    },
    {
      contextTag: '[Security researcher, analysing the Nomad exploit]',
      scenario: 'Priya explains to her team why the Nomad bridge was drained by 300 independent attackers, not just the original discoverer. What does this reveal about open-source blockchain security?',
      outcome: 'Nomad forensics: the original exploit was a single contract call. Once executed and visible on-chain, any user could read the call data, see that it worked, and replicate it with their own receiving address — no technical knowledge required beyond copy-paste with address substitution. The bug: Nomad initialised a security parameter (trusted root) to 0x00 (zero bytes) — this meant any message with a zero "committed root" was considered valid by the contract. Attackers simply sent messages claiming any amount, to any address, with zero root — and the contract accepted them as valid cross-chain messages. The attack required no cryptography, no advanced knowledge, no special access. Once public, it was replicable in 30 seconds. The lesson: bridge security depends entirely on correctness of implementation. A single initialisation error in a contract holding $190M created an exploit accessible to everyone. This is why bridge audits must be exhaustive — the attack surface is both high-value and, when exploited, globally replicable.',
    },
  ],

  keyTakeaway: 'Multi-chain breadth multiplies attack surface — bridges are the highest-value exploit target in DeFi ($2B lost in 2022 alone) and each new chain adds a bridge risk, protocol risk, and operational complexity; depth on 2-3 carefully chosen chains provides better risk-adjusted outcomes than breadth on 10.',

  guidedPractice: [
    {
      question: 'Why did the Nomad bridge exploit allow 300 independent attackers to drain funds simultaneously, rather than just the original discoverer?',
      options: [
        'Nomad\'s bridge contract had a backdoor that was shared among a hacking group',
        'The bug created an exploit that required only copying the original successful transaction and substituting the receiving address — no cryptographic knowledge needed. Once any transaction exploiting the bug appeared on-chain, the attack method was publicly visible and replicable by anyone in minutes.', // ✓
        'Nomad\'s team shared the vulnerability details publicly before patching the contract',
        'The exploit used a known exploit toolkit that was freely available on GitHub before the attack',
      ],
      correct: 1,
      hint: 'What makes a blockchain exploit "replicable" by non-technical users? What was special about the Nomad bug\'s simplicity?',
      explanation: 'Nomad\'s bug simplicity: the trusted root parameter was set to 0x00 during an upgrade. The bridge validation logic: "if the message\'s committed root matches any proven root OR equals zero, accept the message." With zero as a trusted root, any message payload was valid. The exploit transaction: send a message claiming "transfer 1000 WBTC to my_address" with committed root = 0x00. The bridge accepted it and released funds. Replication: any observer of the original exploit transaction could: (1) See that the call worked. (2) Copy the exact function call. (3) Change only the receiving address to their own. (4) Submit. No understanding of cryptography, bridges, or smart contracts required — just copy-paste with address substitution. This is the "crowdsourced exploit" risk unique to public blockchains: once a successful exploit transaction is public, it is immediately replicable by anyone who can use a blockchain explorer and a basic transaction sender.',
    },
    {
      question: 'A user holds $200K on Ethereum and wants to deploy to Arbitrum for higher DeFi yields. They have two bridge options: canonical Arbitrum bridge (7-day return window) and Hop Protocol (instant, third-party). How should they decide?',
      options: [
        'Always use the fastest bridge — time is money and the yield differential justifies speed',
        'Consider the amount and time horizon: $200K with a planned 6+ month deployment has no urgency for instant withdrawal. The canonical bridge\'s 7-day window is irrelevant for long-term deployment and provides Ethereum-level security. Hop Protocol is appropriate for amounts under $50K or when frequent rebalancing is needed.', // ✓
        'Always use the canonical bridge — third-party bridges are always riskier regardless of amount',
        'Use Hop for the outbound transfer and canonical bridge for the return transfer',
      ],
      correct: 1,
      hint: 'When does the 7-day withdrawal window actually matter? For a 6-month deployment, does waiting 7 days to return matter?',
      explanation: 'Bridge choice decision framework: The canonical bridge\'s only "cost" is the 7-day return window. For a 6-month DeFi deployment: the first 6 months you won\'t return at all, then 7 more days is a 3.8% time extension — trivial. The canonical bridge\'s benefit: Ethereum-level security, no third-party smart contract risk, no independent liquidity pool vulnerability. Hop Protocol benefit: instant return. When is instant return valuable? Active traders who rebalance weekly, emergency exit scenarios, or capital deployed for days not months. For $200K with a 6-month horizon: the instant return benefit is near-zero, and the canonical bridge\'s security advantage is real. The practical rule: use canonical bridges for large long-term deployments; use fast bridges for tactical movements of moderate amounts with frequent rebalancing needs.',
    },
    {
      question: 'You are deployed across 8 chains using 8 different third-party bridges. Statistically, how does this compare to being deployed across 2 chains using 2 canonical bridges?',
      options: [
        'The 8-chain setup is safer because diversification reduces the impact of any single bridge failure',
        'The 8-chain setup has 4× more bridge exploit exposure — each additional third-party bridge is an independent smart contract risk. Historical 2022 data shows ~$500M in average losses per major bridge exploit. 8 bridge relationships multiplies this exposure independently; the 2-chain canonical setup has no third-party bridge risk at all.', // ✓
        'Bridge risk is uniform regardless of how many bridges are used — one exploit affects all equally',
        'The 2-chain setup is riskier because all eggs are in 2 baskets',
      ],
      correct: 1,
      hint: 'Are third-party bridge exploits correlated (all fail together) or independent (each fails separately)? How does independent risk multiply?',
      explanation: 'Independent risk multiplication: third-party bridge exploits are largely independent events — a Hop Protocol bug does not cause an Across Protocol bug. With 8 independent bridge relationships: the probability of at least one bridge exploit over a 2-year period is significantly higher than with 2 canonical bridges. Expected value calculation: if each third-party bridge has a 2% annual exploit probability (rough historical estimate for major audited bridges), 8 bridges = 1 - (0.98^8) ≈ 15% annual probability of at least one exploit. 2 canonical bridges (near-zero exploit probability given Ethereum security): <1%. The diversification argument fails for bridge risk specifically because: (1) Exploits steal the assets on the exploited bridge, not just that bridge\'s portion of your portfolio if you moved through that bridge. (2) Bridges are points of transit, not pools of savings — the risk is at crossing time, not during holding.',
    },
    {
      question: 'The Ronin bridge ($625M hack) used a 5-of-9 multisig but only 4 signers needed to be compromised. How?',
      options: [
        'The 5-of-9 threshold was reduced to 4-of-9 by a governance vote that was not publicly disclosed',
        'Axie Infinity\'s parent company Sky Mavis had been temporarily granted approval to sign transactions on behalf of other validators. This exception was never revoked, giving attackers effectively a 5th key by compromising Sky Mavis and 4 independent validators — with Sky Mavis counting as the 5th despite owning only one validator slot in the original design.', // ✓
        'Three of the 9 validators were controlled by Axie Infinity founders who conspired to execute the hack',
        'The 5-of-9 scheme had a known bug that allowed 4 signatures to override the 5th requirement',
      ],
      correct: 1,
      hint: 'What was the "exception" that Sky Mavis had been granted that was never cleaned up?',
      explanation: 'The Ronin post-mortem: Sky Mavis (Axie Infinity developers) had been temporarily whitelisted to sign transactions on behalf of Axie DAO validators in November 2021 to reduce friction during a high-traffic period. This exception was supposed to be temporary but was never revoked when traffic normalised. By March 2022 (4 months later), the arrangement was still active. This meant Sky Mavis\'s node effectively counted as a separate trusted signer, even though Sky Mavis also controlled their own validator. The attackers compromised Sky Mavis\'s systems (via a fake job offer phishing attack on a developer) — giving them access to Sky Mavis\'s validator key + the temporary whitelisted key. Combined with 3 other validators also compromised via the same phishing campaign: 4 compromised + 1 via Sky Mavis whitelisting = 5 signatures. The security lesson: temporary exceptions to multisig structures must be revoked immediately and audited regularly. "Temporary" infrastructure security modifications have a strong historical tendency to become permanent.',
    },
    {
      question: 'Your multi-chain portfolio spans Ethereum, Arbitrum, Base, and Solana. You want to add Cosmos ecosystem (IBC-based chains) for additional yield. What security considerations are specific to adding a completely different blockchain ecosystem?',
      options: [
        'Cosmos chains use the same security as Ethereum because they are all proof-of-stake',
        'Adding Cosmos requires a new bridge ecosystem (IBC or third-party Cosmos-Ethereum bridges), a new wallet setup (Cosmos wallets like Keplr vs EVM wallets like MetaMask), new smart contract risk surface (CosmWasm vs Solidity security auditing norms), and understanding independent validator sets with different economic security levels per Cosmos chain.', // ✓
        'Cosmos is safer than EVM chains because IBC (Inter-Blockchain Communication) is formally verified',
        'No additional security considerations are needed if the Cosmos chain has a TVL above $1B',
      ],
      correct: 1,
      hint: 'What is categorically different about Cosmos vs EVM chains — wallet, bridge, contracts, and chain security?',
      explanation: 'Cross-ecosystem expansion multiplies complexity across every dimension: (1) Bridge risk: moving assets from Ethereum to Cosmos requires crossing a bridging infrastructure (Gravity Bridge, Axelar, or IBC-based wrappers) with its own security model. IBC itself is well-audited, but the Ethereum-Cosmos bridge infrastructure is a third-party trust layer. (2) Wallet OPSEC: Cosmos chains use Bech32 addresses and Cosmos wallets (Keplr, Leap). A user managing MetaMask + Keplr simultaneously has two separate key management systems — double the seed phrase risk. (3) Smart contract security: CosmWasm (Cosmos\'s smart contract VM) has a smaller auditor pool and different vulnerability classes than Solidity. EVM-chain auditors may not be qualified for CosmWasm contracts. (4) Chain security heterogeneity: each Cosmos chain has its own validator set with different economic security. Osmosis ($200M+ bonded ATOM-equivalent) is more secure than a small Cosmos chain with $5M staked. EVM users accustomed to Ethereum-inherited security must evaluate each Cosmos chain independently.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 223 — The Long-Term Multi-Chain Landscape
// ─────────────────────────────────────────────────────────────────────────────

const L223: IslandLevel = {
  id: 223, mechanic: 'match3', tier: 'pro',
  topic: 'The Long-Term Multi-Chain Landscape',

  explanation: `
In 2023, Ethereum processed 12% of all global crypto transactions. In the same year, Ethereum L2s processed a combined 35% — more than Ethereum mainnet itself. The narrative had shifted from "will Ethereum scale?" to "Ethereum has scaled, just not on the base layer." At the same time, Solana processed 35%, Tron processed 10%, and all other chains combined accounted for the remaining 8%. Three ecosystems dominated 95% of all crypto transactions.

The long-term multi-chain landscape is actively debated. Two competing frameworks:

The consolidation thesis: Ethereum L2s become so cheap and fast that alt-chains lose their fee advantage. Ethereum\'s brand recognition, regulatory clarity (as a decentralised protocol with no company controlling it), and DeFi depth create winner-take-most network effects. Most chains merge into the Ethereum ecosystem either as L2s or by supporting cross-chain standards. The Superchain and AggLayer accelerate this: chains that join a shared ecosystem gain interoperability, while independent chains become increasingly isolated.

The fragmentation persistence thesis: genuine technical specialisation prevents consolidation. Solana\'s high-frequency trading performance is fundamentally different from Ethereum\'s architecture — not just a matter of being "faster." TON\'s 900M user distribution through Telegram creates a user acquisition channel no Ethereum L2 can replicate. Bitcoin\'s monetary property as digital gold is independent of smart contract capability. Regulation creates jurisdiction-specific chains that cannot merge into a global system. The ecosystem remains diverse indefinitely.

The most likely reality (as of 2024): partial consolidation within ecosystems (OP Stack Superchain, Polygon AggLayer, Cosmos IBC) combined with persistent diversity between fundamentally different chain types. Three or four major ecosystems (Ethereum + L2s, Solana, Bitcoin, possibly TON/other) coexist with significant capital in each. The "winner takes all" scenario requires either regulatory homogenisation (unlikely) or one chain solving every technical trade-off simultaneously (structurally impossible).
  `.trim(),

  fact: 'Transaction distribution (2023): Ethereum mainnet 12%, Ethereum L2s 35%, Solana 35%, Tron 10%, others 8%. Consolidation thesis: L2 improvements collapse fee advantages of alt-chains. Fragmentation thesis: genuine technical differences (Solana\'s speed, TON\'s distribution, Bitcoin\'s monetary property) are structural, not temporary. Likely reality: within-ecosystem consolidation + between-ecosystem persistence.',
  plain: 'By 2023, Ethereum L2s already processed more transactions than Ethereum mainnet — Ethereum scaled through layers. But Solana still had 35% of transactions because its speed creates genuinely different applications. The future is probably: Ethereum + its L2s dominate DeFi and institutional use; Solana dominates high-frequency consumer apps; Bitcoin remains digital gold; TON captures mobile-first emerging markets. They serve different users, not the same users.',
  stars: [660, 810, 1010], target: 1010, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Long-term investor, building a multi-ecosystem portfolio]',
      scenario: 'Marcus wants to build a portfolio that performs well under both the consolidation and fragmentation scenarios. He is allocating $100,000 across ecosystems for a 5-year horizon.',
      outcome: 'Scenario-resilient allocation: consolidation scenario winners: ETH (the base layer wins), major L2 tokens (OP, ARB), protocols with deepest Ethereum ecosystem moats. Fragmentation scenario winners: SOL (Solana ecosystem deepens), individual protocol tokens across chains, infrastructure protocols that work cross-chain. Hedged portfolio: $40,000 ETH (wins in both scenarios — L2 fees go to ETH stakers even in L2-dominant future). $20,000 ARB + OP split (wins in consolidation, somewhat protected in fragmentation if Superchain/AggLayer succeed). $20,000 SOL (wins in fragmentation if Solana retains high-frequency niche). $15,000 BTC (digital gold thesis independent of smart contract outcome). $5,000 cross-chain infrastructure tokens (LayerZero, Chainlink — win in either scenario as they serve all chains). This allocation avoids betting exclusively on one outcome.',
    },
    {
      contextTag: '[Ecosystem analyst, evaluating TON\'s long-term position]',
      scenario: 'Amara is asked whether TON (Telegram\'s blockchain) will be a major player in 5 years. She evaluates the consolidation vs fragmentation thesis for TON specifically.',
      outcome: 'TON fragmentation case: 900M Telegram users represent a distribution channel no Ethereum L2 can replicate through DeFi adoption alone. TON\'s Mini App architecture lets users access blockchain apps without leaving Telegram — a genuinely different acquisition path. The play-to-airdrop model (Notcoin, Hamster Kombat) demonstrated that TON can onboard tens of millions of mobile-first users. TON consolidation vulnerability: if Telegram were to integrate another chain (Base via Coinbase partnership, for example), TON\'s unique distribution advantage would evaporate overnight. Additionally: TON\'s DeFi ecosystem (STON.fi, DeDust) is underdeveloped relative to EVM chains — Telegram users interested in real DeFi still bridge to Ethereum. Amara\'s conclusion: TON maintains a 5-year position in the mobile consumer market but does not challenge Ethereum\'s DeFi dominance. Its success is conditional on Telegram\'s continued growth and partnership exclusivity — a concentration risk.',
    },
    {
      contextTag: '[Developer, planning a 3-year project roadmap]',
      scenario: 'Priya is building a DeFi protocol and must decide today which chains to prioritise for a 3-year development roadmap. She faces the consolidation vs fragmentation uncertainty.',
      outcome: 'Chain strategy under uncertainty: primary chain (must-have): Ethereum L2 (specifically Arbitrum or Base) — wins in both consolidation (becomes the dominant chain) and fragmentation (maintains DeFi leadership in EVM ecosystem). This is the non-controversial choice for DeFi. Secondary chain (ecosystem bet): Solana — if fragmentation persists, Solana\'s high-frequency DeFi market is worth $10B+ in opportunity. If consolidation wins, Solana retreats to a niche but doesn\'t disappear. EVM compatibility layer: deploy on all major OP Stack chains via the Superchain once native messaging launches — one codebase, multiple chains, no multi-chain operational overhead. Avoid: small independent L1s with unproven track records, chains entirely dependent on one grant programme for TVL, and non-EVM chains without large existing developer communities (high migration cost if they fail). This strategy: concentrated on high-probability outcomes, with a hedge on Solana\'s persistence.',
    },
  ],

  keyTakeaway: 'The most likely long-term outcome is partial consolidation within chain families (Superchain, AggLayer, IBC) combined with persistent fragmentation between genuinely different chain types — Ethereum dominates DeFi and institutional use while Solana persists in high-frequency consumer applications and Bitcoin maintains its monetary property thesis independently.',

  guidedPractice: [
    {
      question: 'Ethereum L2s processed 35% of global crypto transactions in 2023 vs Ethereum mainnet\'s 12%. What does this reveal about Ethereum\'s scaling strategy?',
      options: [
        'It reveals that Ethereum mainnet is failing and users are abandoning it for L2s',
        'It validates the rollup-centric roadmap: Ethereum mainnet becomes the settlement and security layer while L2s do execution. The 35% L2 share means Ethereum\'s ecosystem processes 47% of global transactions total — L2s did not replace Ethereum, they extended it.', // ✓
        'L2 transactions should not be counted because they are not "real" Ethereum transactions',
        'The 35% L2 share means Ethereum has already lost the transaction volume race to Solana',
      ],
      correct: 1,
      hint: 'If L2s inherit Ethereum security and eventually settle on Ethereum, whose transactions are they?',
      explanation: 'Ethereum ecosystem transaction accounting: L2 transactions are Ethereum ecosystem transactions. They use Ethereum security (fraud proofs or ZK proofs on Ethereum mainnet), pay sequencer fees that flow to Ethereum (for data availability through EIP-4844 blobs), and use Ethereum as their canonical settlement layer. The 35% L2 + 12% mainnet = 47% of global transactions in the Ethereum ecosystem. This is the intended outcome of Ethereum\'s roadmap: mainnet specialises in security and settlement (expensive, slow, necessary), L2s specialise in execution (cheap, fast, abundant). The total share proves the strategy is working — users are transacting in the Ethereum ecosystem at 4× the rate of Ethereum mainnet alone. Vitalik Buterin\'s rollup-centric roadmap, published in 2020, specifically predicted this outcome.',
    },
    {
      question: 'Why is Solana\'s performance advantage over Ethereum L2s potentially permanent rather than temporary?',
      options: [
        'Ethereum L2s are limited by law to slower transaction speeds in regulated markets',
        'Solana\'s 400ms block times and parallel transaction processing (Sealevel) are properties of its consensus and execution architecture — not simply a matter of less congestion. Optimistic rollup L2s have 250ms sequencer blocks but lack parallel execution. ZK rollups improve this but still settle proofs to Ethereum in batches, introducing proof generation latency. Solana\'s single global state with parallelism is architecturally distinct.', // ✓
        'Solana has 10× more validators than any Ethereum L2, providing more processing capacity',
        'Solana\'s performance advantage is temporary — Ethereum L3s will achieve equivalent speed within 12 months',
      ],
      correct: 1,
      hint: 'Is Solana faster because it\'s less congested, or because its architecture processes transactions differently?',
      explanation: 'Architecture vs congestion: Solana\'s speed comes from architectural choices, not just low traffic. Key innovations: (1) Sealevel parallel execution: transactions that don\'t share state (different wallet pairs) are processed simultaneously. Ethereum\'s EVM processes transactions sequentially. (2) Gulf Stream: Solana\'s mempool protocol pushes transactions to the next validator before the current block is finalised, eliminating mempool queuing latency. (3) Turbine block propagation: Solana breaks blocks into small "shreds" for efficient propagation. These architectural properties produce sub-second finality that Ethereum L2s cannot replicate without fundamental redesign. Ethereum L3s (L2s on L2s): reduce fees further but don\'t solve the parallelism gap. The 400ms Solana block time vs Ethereum\'s 12-second block time is an architectural difference — optimistic rollups inherit Ethereum\'s block time structure for their security mechanism.',
    },
    {
      question: 'The "winner takes all" consolidation scenario requires one chain solving every major trade-off. Why is this structurally unlikely?',
      options: [
        'Winner-take-all is impossible because blockchain technology prevents one chain from being fastest and most decentralised simultaneously',
        'Different applications have genuinely different, conflicting requirements: maximum decentralisation (Ethereum mainnet), maximum speed (Solana), mass consumer distribution (TON), monetary scarcity (Bitcoin). Optimising for one requires compromising another — no single chain can maximise all simultaneously, making multi-ecosystem coexistence structurally stable.', // ✓
        'Winner-take-all is blocked by antitrust regulation that prevents one blockchain from gaining 50%+ market share',
        'Users will always prefer choice, making multi-chain ecosystems socially inevitable',
      ],
      correct: 1,
      hint: 'What does Ethereum sacrifice to achieve decentralisation? What does Solana sacrifice for speed? Can both sacrifices be eliminated simultaneously?',
      explanation: 'Fundamental trade-off analysis: Ethereum prioritises decentralisation → accepts slower finality and higher base-layer cost. This is an intentional design choice that cannot be reversed without compromising decentralisation. Solana prioritises throughput → accepts higher hardware requirements for validators (reducing validator count compared to Ethereum\'s 900,000+) and periodic network instability under extreme load. Bitcoin prioritises monetary scarcity and security → accepts no general-purpose smart contracts. TON prioritises Telegram distribution → accepts dependency on a centralised platform. Each trade-off reflects a genuine design value that a different application or user group legitimately prefers. A single chain cannot be simultaneously: maximally decentralised, maximally fast, monetarily scarce, and controlled by one distribution channel. The requirements are mutually exclusive at the architectural level.',
    },
    {
      question: 'Within-ecosystem consolidation (Superchain, AggLayer, IBC) is more achievable than cross-ecosystem consolidation. What makes within-ecosystem consolidation technically feasible?',
      options: [
        'Chains within the same ecosystem pay lower gas fees to each other as a native discount',
        'Chains within the same ecosystem share a common security model, execution environment, and governance infrastructure — enabling trustless native message passing provable on a shared base layer. Cross-ecosystem consolidation requires trusting an intermediary who operates across incompatible security and execution models.', // ✓
        'Within-ecosystem chains are operated by the same company, enabling coordinated upgrades',
        'Within-ecosystem consolidation is achievable because all chains within an ecosystem use the same programming language',
      ],
      correct: 1,
      hint: 'What allows an OP Stack chain to trust a message from another OP Stack chain without a third-party bridge? What shared foundation enables this?',
      explanation: 'Shared trust foundation: OP Stack Superchain chains all: (1) Inherit security from Ethereum (same L1 settlement). (2) Use the same VM (EVM). (3) Follow the same OP Stack specification. A message from Base to Optimism can be verified on Ethereum — both chains post state roots to the same L1, and a cross-chain message can be proved by showing it exists in a valid state on the source chain\'s Ethereum-certified state root. No third party needed. Contrast with Ethereum-to-Solana: completely different VMs (EVM vs SVM), different security models (Ethereum PoS vs Solana PoS with different validator economics), different state representations. A message from Ethereum cannot be verified natively on Solana — it requires a bridge operator who monitors both chains and claims the state is correct. That trusted operator is the unavoidable third party. This fundamental difference makes within-ecosystem consolidation a smart contract engineering problem (solvable) and cross-ecosystem consolidation a trust problem (requires accepting new assumptions).',
    },
    {
      question: 'You are advising an institution that wants crypto exposure for a 10-year horizon. Under both consolidation and fragmentation scenarios, which asset is most resilient?',
      options: [
        'The native token of the chain with the highest current TVL',
        'ETH — in the consolidation scenario, Ethereum mainnet is the settlement layer that all L2 activity pays fees to, making ETH the monetary base of the winning ecosystem. In the fragmentation scenario, Ethereum remains the dominant DeFi chain and ETH retains its monetary premium as the most battle-tested programmable money asset.', // ✓
        'A diversified basket of all L1 tokens equally weighted',
        'BTC — Bitcoin is independent of the smart contract ecosystem debate',
      ],
      correct: 1,
      hint: 'Which asset benefits from L2 adoption (ETH gets paid for security and data) AND from direct Ethereum DeFi adoption (ETH is the base asset)?',
      explanation: 'ETH\'s cross-scenario resilience: Consolidation scenario: L2s become dominant → all L2 transactions pay data availability fees to Ethereum mainnet in ETH (EIP-4844 blobs), and Ethereum security is paid for by L2 bridging activity. More L2 usage = more ETH demand for security. ETH becomes the settlement currency of the internet of blockchains. Fragmentation scenario: Ethereum maintains its DeFi dominance as the deepest, most battle-tested DeFi chain. ETH is the native collateral asset for all major DeFi protocols. Its monetary premium (9+ years of no inflation cheats, well-understood supply schedule) is a Schelling point for DeFi collateral. The BTC option (option 4) is also resilient under fragmentation but does not benefit from Ethereum L2 adoption. For an institution wanting both digital gold exposure AND Ethereum ecosystem exposure in one asset: ETH captures both. Note: this analysis does not account for regulatory changes that could specifically target ETH.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 224 — Developer Tooling Comparison Across Chains
// ─────────────────────────────────────────────────────────────────────────────

const L224: IslandLevel = {
  id: 224, mechanic: 'memory', tier: 'pro',
  topic: 'Developer Tooling — Cross-Chain Comparison',

  explanation: `
In 2023, a team of three Solidity developers decided to build on Solana for the first time. They expected to be productive within a week. Three months later, they had rewritten their core contract twice, discovered that Rust's borrow checker interacted with Anchor's account model in unexpected ways, and found that their Ethereum-native mental models for gas optimisation were actively harmful on Solana's fee structure. Blockchain development tooling is not interoperable.

Developer tooling determines productivity, security culture, and ecosystem quality as much as the underlying blockchain technology.

EVM tooling (Ethereum, Arbitrum, Base, Optimism, Polygon, Avalanche C-Chain): the most mature ecosystem. Foundry (Rust-based testing framework — fast, powerful, becoming the standard for serious development), Hardhat (JavaScript/TypeScript — most tutorials, legacy support), OpenZeppelin Contracts (audited, reusable contract library), Etherscan (verification and debugging), Remix (browser-based IDE for beginners). Cross-chain: any EVM chain uses this tooling identically. Deploying an Ethereum contract to Arbitrum: change one RPC endpoint in the config file.

Solana tooling: Anchor (the standard framework, similar to what Hardhat is for Ethereum — dramatically simplifies Rust/Solana development), Seahorse (Python-like syntax that compiles to Solana programs — lower barrier to entry), Solana CLI, Solana Playground (browser-based). Security research tooling is less mature than EVM — fewer automated audit tools, smaller specialist auditor pool.

Starknet tooling: Starknet Foundry (snforge + sncast — parallel to Ethereum Foundry), Cairo language (Rust-influenced, designed for ZK provability), Scarb (package manager). Developer experience is improving rapidly but Cairo is a genuinely new language requiring significant learning.

Cross-chain development frameworks: LI.FI SDK (cross-chain transfers in one API), Axelar SDK (cross-chain message passing and asset transfers), Wormhole SDK (cross-chain messaging, multi-chain native).
  `.trim(),

  fact: 'EVM tooling: Foundry (testing, becoming standard), Hardhat (legacy, tutorials), OpenZeppelin (security library), Etherscan (debugging). Solana: Anchor (primary framework), Seahorse (Python-like). Starknet: Starknet Foundry, Cairo language. Cross-chain: LI.FI SDK, Axelar SDK, Wormhole SDK. EVM chains share tooling identically — changing chain = changing one config line.',
  plain: 'Each blockchain has its own development language and tools that don\'t transfer between ecosystems. EVM chains (Ethereum, Arbitrum, Base) all share the same tools — learn once, deploy anywhere. Solana requires learning Rust + Anchor (different paradigm). Starknet requires Cairo (a new language). This tooling gap is a major reason ecosystems don\'t collapse into one — developer communities are sticky.',
  stars: [680, 830, 1040], target: 1040, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Ethereum developer, expanding to a new chain]',
      scenario: 'Amara is a senior Solidity developer who wants to deploy her protocol on Base, Arbitrum, and Optimism. She estimates the development time for each new chain deployment.',
      outcome: 'EVM chain expansion estimate: each new EVM chain deployment requires: (1) Network configuration update in Foundry/Hardhat (30 minutes per chain). (2) Deploy script parameterisation for chain-specific addresses (constructor arguments, oracle addresses, token addresses — 2-4 hours per chain). (3) Verification on each chain\'s block explorer (1 hour per chain). (4) Testing against each chain\'s forked state (2-3 hours per chain). (5) Bridge integration testing (4-8 hours per chain, if using a bridge). Total per chain: approximately 1-2 days. For 3 additional chains: 3-6 days of engineering. No re-audit required if contract code is unchanged — the same audit covers the same bytecode on any EVM chain. Security risk: the chain-specific risk (oracle integration, L2 sequencer trust) still applies, but the contract code risk is already assessed.',
    },
    {
      contextTag: '[Solana developer, evaluating cross-chain expansion to EVM]',
      scenario: 'James is an Anchor (Solana) developer who wants to expand his protocol to Arbitrum. He estimates the cost.',
      outcome: 'Cross-ecosystem migration estimate: (1) Language learning: Rust → Solidity is a significant paradigm shift. Solidity is simpler in some ways (no borrow checker), more dangerous in others (easier to introduce reentrancy vulnerabilities). Estimated 1-2 months to become productive. (2) Framework migration: Anchor account model → EVM account/state model. The mental model for how data is stored and accessed is completely different. (3) Complete contract rewrite: there is no tooling to translate Anchor programs to Solidity — full rewrite required. (4) New audit: rewritten code requires a full Solidity-specialised audit ($50-200K for complex protocols). (5) EVM tooling setup: Foundry, Hardhat, OpenZeppelin. Total estimate: 4-8 months for a protocol of moderate complexity, $50-200K in audit costs. This is why Solana-native protocols rarely expand to EVM chains — the cost-benefit often favors staying native and deepening on Solana.',
    },
    {
      contextTag: '[Cross-chain developer, using LI.FI SDK]',
      scenario: 'Priya\'s DeFi protocol needs to accept deposits from any chain and bridge them to Arbitrum. She evaluates building her own bridge integration vs using LI.FI SDK.',
      outcome: 'Custom bridge integration: develop integrations with Across, Hop, Stargate (3 bridge APIs), handle each bridge\'s smart contract interactions, build error handling and fallback logic, maintain as bridges update their APIs. Estimated time: 3-4 months. Security: each bridge integration requires independent review. LI.FI SDK: single API that queries 10+ bridges, returns best route, handles execution. npm install @lifi/sdk — 1-2 weeks to integrate. LI.FI maintains bridge integrations and updates. Security: users trust LI.FI\'s bridge routing — if LI.FI includes a compromised bridge, funds could be routed through it. Recommendation: LI.FI for speed and breadth, with configuration to whitelist only audited bridges (Across, Hop, CCTP — exclude less proven bridges). The 3-month development saving justifies the slight trust overhead for most protocols.',
    },
  ],

  keyTakeaway: 'EVM chains share tooling identically (change one config line to deploy to a new EVM chain), while cross-ecosystem expansion (EVM to Solana, Ethereum to Starknet) requires complete rewrites and re-audits — developer tooling creates ecosystem lock-in that is as sticky as network effects and liquidity.',

  guidedPractice: [
    {
      question: 'An Ethereum developer wants to deploy to Arbitrum. What is the minimum code change required?',
      options: [
        'Rewrite all Solidity contracts to use Arbitrum\'s custom opcodes and APIs',
        'Update the network configuration (RPC endpoint, chain ID) in the deployment script — no contract code changes required for standard Solidity contracts. Arbitrum is EVM-equivalent and executes the same bytecode as Ethereum.', // ✓
        'Translate Solidity to Arbitrum\'s proprietary language (Nitro Solidity)',
        'Redesign the contract architecture to use Arbitrum\'s optimistic rollup-specific data structures',
      ],
      correct: 1,
      hint: 'What does "EVM-equivalent" mean for a developer deploying existing contracts?',
      explanation: 'EVM equivalence: Arbitrum, Base, Optimism, and Polygon all execute the Ethereum Virtual Machine bytecode. Solidity compiles to EVM bytecode — the same binary that Ethereum executes. Deploying to Arbitrum: change foundry.toml or hardhat.config.js network settings from Ethereum to Arbitrum\'s RPC and chain ID. Run deploy script — the same bytecode deploys on Arbitrum\'s EVM. Contract behaviour: functionally identical to Ethereum with minor differences (BLOCKHASH returns Arbitrum\'s hash, not Ethereum\'s; certain precompile addresses differ slightly). For the vast majority of contracts: truly zero code changes. Only contracts that explicitly depend on Ethereum mainnet-specific properties (L1 block numbers, specific precompile addresses) need updates. This is why EVM chains have dominated multi-chain deployment — the friction is near-zero for any developer already working in Solidity.',
    },
    {
      question: 'Why is Anchor considered essential for Solana development rather than raw Rust?',
      options: [
        'Anchor provides legal compliance features that raw Rust programs cannot include',
        'Writing raw Solana programs in Rust requires manually handling account validation, serialisation, and cross-program invocation boilerplate that Anchor automates with macros — the same security-critical code that, when written incorrectly, causes most Solana exploits. Anchor handles this correctly by default, significantly raising the security floor.', // ✓
        'Anchor is faster than raw Rust because it uses a different execution engine',
        'Anchor is required by Solana Labs for all mainnet deployments',
      ],
      correct: 1,
      hint: 'What does Anchor\'s #[account] macro do that a developer would have to manually implement in raw Rust?',
      explanation: 'Anchor\'s value: raw Solana programs in Rust must manually: validate that account owners match expected programs, check that account data has the correct discriminator (to prevent account confusion attacks), handle deserialization of account data (with correct error handling), and manage cross-program invocations (CPIs) with correct signer seeds. Each of these, if done incorrectly, is a potential exploit. Anchor\'s #[account] macro generates this validation code from type annotations automatically. Account validation that takes 50 lines of raw Rust becomes 5 lines with Anchor. More importantly: Anchor\'s generated code has been audited — manual validation code in each program must be audited separately. The Wormhole hack ($320M) involved a missing validation check that Anchor would have generated automatically. Anchor is not optional for security-conscious Solana development.',
    },
    {
      question: 'What makes Cairo (Starknet\'s language) different from Solidity in a way that benefits ZK proof generation?',
      options: [
        'Cairo is a subset of Python, making it easier to learn for the largest developer community',
        'Cairo is designed so that all operations are provable in ZK circuits by default — it natively represents computation as polynomial constraints compatible with STARK proof systems. Solidity\'s EVM opcodes include operations (like KECCAK256) that are extremely expensive to represent as ZK constraints.', // ✓
        'Cairo contracts execute 10× faster than Solidity contracts because they use Rust under the hood',
        'Cairo was designed to be interoperable with all EVM chains without requiring a ZK proof layer',
      ],
      correct: 1,
      hint: 'Why does a ZK rollup need to prove that computation was executed correctly? What makes some operations "ZK-unfriendly"?',
      explanation: 'ZK-friendly computation: ZK proofs work by representing computation as polynomial constraints. Operations that have clean polynomial representations are "ZK-friendly" (cheap to prove). Operations that require complex circuits are "ZK-unfriendly" (expensive to prove). KECCAK256 (Ethereum\'s native hash): requires ~200,000 constraints per call — extremely expensive in ZK. Poseidon hash (ZK-native, used in Cairo): ~200 constraints — 1,000× cheaper. Cairo was designed from the ground up to use ZK-friendly operations. Every Cairo operation has an efficient ZK circuit representation. This is why Starknet can generate proofs efficiently for Cairo programs, while ZK-EVM projects (proving Ethereum\'s EVM operations) spend enormous engineering effort making ZK-unfriendly EVM operations provable. The trade-off: Cairo requires developers to learn a new language. The benefit: native ZK efficiency that no EVM-compatible chain can match without significant performance penalty.',
    },
    {
      question: 'A developer needs their dApp to support deposits from Ethereum, Arbitrum, and Solana into a single Optimism smart contract. What is the most practical approach?',
      options: [
        'Build three separate bridge integrations (one per source chain) and maintain them independently',
        'Use a cross-chain SDK (LI.FI or Socket) for the EVM chains (Ethereum, Arbitrum → Optimism), and a separate Solana-to-EVM bridge (Wormhole or Allbridge) for Solana → Optimism — then wrap both in a unified user interface that abstracts the underlying bridge routing from the user', // ✓
        'Require users to bridge funds to Ethereum mainnet first, then bridge again to Optimism',
        'Deploy the same smart contract on all source chains and use an oracle to track deposits cross-chain',
      ],
      correct: 1,
      hint: 'EVM-to-EVM (Ethereum, Arbitrum → Optimism) uses a different bridge infrastructure than non-EVM-to-EVM (Solana → Optimism). Which SDKs cover each?',
      explanation: 'Multi-chain deposit architecture: EVM-to-EVM path: LI.FI SDK routes Ethereum or Arbitrum deposits through the best available bridge (Across, Hop, CCTP) to Optimism. Single SDK, one integration, 10+ bridges supported. The SDK handles bridge selection, quote generation, and transaction execution. Solana-to-EVM path: Wormhole (specifically Wormhole Connect or Portal Bridge) bridges Solana-native assets to EVM. Wormhole SDK provides a developer interface for this integration. UI abstraction: the user selects their source chain and asset. The backend routes through the appropriate bridge. The user\'s Optimism smart contract receives assets regardless of source chain. This is the standard architecture for multi-chain deposit acceptance — leverage existing aggregators for EVM routes (well-audited, maintained) and use the most established Solana bridge for the non-EVM route. Building all bridges from scratch would require 6+ months of security-critical development.',
    },
    {
      question: 'Foundry vs Hardhat — what determines which a new EVM developer should learn first in 2024?',
      options: [
        'Foundry is always better — Hardhat is outdated and should not be learned',
        'Foundry (Rust-based, fast tests, preferred for new professional development) if starting fresh and performance matters. Hardhat (JavaScript/TypeScript, most tutorials and educational content) if onboarding quickly using existing learning resources or inheriting a JavaScript-based codebase. The ecosystem is transitioning to Foundry for new projects.', // ✓
        'Hardhat is required for deployment to all major EVM chains; Foundry only supports Ethereum mainnet',
        'Foundry is for security researchers; Hardhat is for application developers',
      ],
      correct: 1,
      hint: 'What are the two most important factors for a new developer: speed of learning vs quality of tooling for professional work?',
      explanation: 'Foundry vs Hardhat trade-offs: Foundry advantages: test execution in Rust (10-100× faster than Hardhat\'s JavaScript tests for large test suites), cheatcodes for direct EVM manipulation in tests (time travel, impersonation, etc.), forge test (native, no additional packages), cast for CLI interactions. Used by most professional auditing firms and leading protocols. Hardhat advantages: JavaScript/TypeScript (most web developers already know it), largest tutorial library, plugin ecosystem, ethers.js integration familiar from frontend development. Most "build a DeFi app in a day" tutorials use Hardhat. The transition: the professional Ethereum development community has largely moved to Foundry over 2022-2023. New teams starting projects choose Foundry. Existing JavaScript-heavy teams stay with Hardhat. For a new developer in 2024: start with Hardhat for learning (tutorials), transition to Foundry when joining a professional team or prioritising test performance.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 225 — Yield Opportunities Across Alt-Chains
// ─────────────────────────────────────────────────────────────────────────────

const L225: IslandLevel = {
  id: 225, mechanic: 'chain', tier: 'pro',
  topic: 'Yield Opportunities Across Alt-Chains — Risk-Adjusted Comparison',

  explanation: `
In March 2024, stablecoin USDC yield rates varied dramatically by chain: Ethereum mainnet Aave (4.8%), Arbitrum Aave (5.5%), Base Seamless (5.9%), Solana Kamino (7.2%), Avalanche Benqi (4.6%), TON STON.fi stable pools (12%), and a new chain "AlphaChain" offering 35%. The yield differential across chains is not random — it encodes real information about risk, liquidity depth, and ecosystem maturity that yield seekers must interpret correctly.

Cross-chain yield comparison requires a risk-adjusted framework, not simply ranking by headline APY.

Risk-adjusted yield = nominal APY − expected annual loss rate from risk factors.

Chain security risk: Ethereum mainnet and Ethereum-secured L2s (Arbitrum, Base, Optimism) have the lowest chain-level risk. Independent chains (Solana, Avalanche) have strong but shorter track records. New independent chains carry significant unproven risk.

Protocol maturity risk: Aave and Compound on any chain are the most battle-tested protocol code. New protocol forks without a track record carry higher smart contract risk.

Liquidity risk: can you exit quickly? A $500K position on Ethereum mainnet Aave exits in minutes. The same position on a low-TVL protocol on a new chain may face utilisation caps that prevent withdrawal for hours or days during market stress.

Emission sustainability: sustainable yield (from real user borrowing fees) vs emission-funded yield (from protocol token distribution). When emissions end, only the sustainable portion remains.

The yield premium hierarchy: Ethereum mainnet ≈ lowest risk (floor yield). Ethereum L2s ≈ small premium for L2 risk. Established independent chains (Solana, Avalanche) ≈ moderate premium for chain-specific risk. New chains ≈ significant premium for unproven track record. High-emission new protocols ≈ highest APY but highest collapse risk.

Any USDC yield above 8-10% on established chains is almost certainly emission-funded and temporary. Yield above 15% on any chain should be treated with extreme scepticism.
  `.trim(),

  fact: 'Risk-adjusted yield framework: sustainable yield (real borrowing fees) is durable; emission-funded yield collapses when emissions end. Risk hierarchy: Ethereum mainnet ≈ floor, L2s (Arbitrum, Base) ≈ small premium, established independent chains (Solana, Avalanche) ≈ moderate premium, new chains ≈ large premium. USDC yields above 10% on established chains = primarily emissions. Above 15% = extreme scepticism.',
  plain: 'Higher yield across chains usually means higher risk. Ethereum Aave gives 5% because it\'s the safest (deepest, oldest, most tested). Solana Kamino gives 7% because Solana adds some chain risk. TON pools at 12% are mostly emissions that will collapse. AlphaChain at 35% is almost certainly a combination of emissions and/or rug risk. The yield difference tells you what the market thinks about the risk — not what the protocol wants you to think.',
  stars: [700, 860, 1070], target: 1070, coins: 40,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Yield analyst, building a risk-adjusted comparison table]',
      scenario: 'Marcus builds a spreadsheet to compare $100K USDC deployment across 5 chains. He needs to adjust each headline yield for risk to find the true expected return.',
      outcome: 'Risk-adjusted table: Ethereum Aave (4.8% nominal). Risk factors: near-zero. Adjusted yield: 4.7%. Arbitrum Aave (5.5% nominal). L2 risk premium: -0.2% (Ethereum-secured L2, minimal incremental risk). Adjusted: 5.3%. Base Moonwell (5.9% nominal). Protocol risk: Moonwell is a Compound fork with $500M TVL and 18 months operation. -0.3%. Adjusted: 5.6%. Solana Kamino (7.2% nominal). Solana chain risk: -0.5%, Kamino protocol risk: -0.3%. Adjusted: 6.4%. TON STON.fi (12% nominal). Emission analysis: 60% of 12% yield is in TON/STON tokens. -4% expected emission collapse within 12 months. Liquidity risk: -1%. Adjusted real yield: ~3%. AlphaChain protocol (35% nominal). 2-month history, unknown smart contract, almost certainly unsustainable emissions. Expected annual return: likely negative (exploit or emission collapse). Adjusted: discard. Conclusion: Solana Kamino offers the best risk-adjusted yield at 6.4%.',
    },
    {
      contextTag: '[Conservative allocator, evaluating TON STON.fi yield]',
      scenario: 'Amara sees TON STON.fi advertising 12% APY on USDT stable pairs. She investigates the yield sources before depositing $20,000.',
      outcome: 'Yield source investigation: STON.fi UI shows: 12% APY breakdown — 3.5% from trading fees, 8.5% from STON token emissions. Fee sustainability: 3.5% is real, based on current trading volume. Sustainable indefinitely if volume holds. Emission sustainability: 8.5% in STON tokens. STON token: evaluate price history, emission schedule. STON has maintained price over 12 months — modest positive signal. However: STON emissions require ongoing token purchase pressure to maintain price. If purchase pressure declines, STON price falls, USD-denominated yield drops. Risk-adjusted decision: Amara deploys $10,000 (not $20,000). Sets a rule: exit if STON price falls 30% (USD yield drops to ~7% — still above market rate, but the trend signals further decline). The 3.5% fee yield is the floor — she cannot lose below that unless trading volume collapses too.',
    },
    {
      contextTag: '[Sophisticated yield farmer, timing cross-chain yield rotation]',
      scenario: 'Priya identifies a pattern: every time a new chain launches a major grant programme, USDC yields spike to 20-30% for 3-6 months then collapse to 5-6%. She wants to systematically exploit this pattern.',
      outcome: 'Strategy: (1) Monitor new chain grant programme announcements. When a new programme launches, immediately assess: how long is the programme (30M in grants over 6 months)? What chains have established bridging infrastructure? (2) Enter 2 weeks after launch — initial launch has bridge risk; 2 weeks of bridge operation without exploit reduces risk. (3) Calculate bridge cost: if bridge round trip is $50, minimum position size is $10,000 (bridge cost < 1% of position). (4) Set exit trigger: when yield drops to within 2% of market rate (e.g., below 7%), exit regardless of programme status. (5) Exit before programme end is announced — pre-announcement TVL withdrawals are orderly; post-announcement exits cause liquidity crunches. Risk: bridge exploit during transit, smart contract exploit on new chain. Position limit: never more than 15% of portfolio in any one new-chain emission play. This strategy captured 25-35% APY during Arbitrum Nova, Base early launch, and Blast launch periods.',
    },
  ],

  keyTakeaway: 'Cross-chain yield comparison requires separating sustainable yield (durable borrowing fee income) from emission-funded yield (temporary token distribution), then discounting each by the chain and protocol risk profile — the result is risk-adjusted yield that allows honest comparison across ecosystems.',

  guidedPractice: [
    {
      question: 'USDC lending yields: Ethereum Aave 4.8%, Solana Kamino 7.2%, new chain protocol 22%. What does the yield difference between Ethereum and Solana most accurately indicate?',
      options: [
        'Solana Kamino is a better protocol than Ethereum Aave, deserving a higher yield',
        'The 2.4% Solana premium reflects the market\'s pricing of incremental risks: Solana chain-specific risk (independent validator set, different security model), Kamino protocol risk (shorter track record than Aave), and potentially some emission component in the 7.2% total. It is the market\'s risk-adjusted spread, not a measure of protocol quality.', // ✓
        'Solana has higher USDC borrowing demand than Ethereum, creating a supply shortage that raises rates',
        'The difference is purely geographic — Solana users pay more because they are in higher-income regions',
      ],
      correct: 1,
      hint: 'Why would rational capital accept 4.8% on Ethereum when 7.2% is available on Solana? What keeps capital on Ethereum despite the lower yield?',
      explanation: 'Risk-adjusted equilibrium: in efficient markets, higher yields on riskier assets attract capital until the risk-adjusted return equalises with safer alternatives. The 2.4% Solana premium has not yet been arbitraged away — meaning capital is deciding the incremental risks are worth approximately 2.4% to compensate. What keeps capital at 4.8% on Ethereum? Risk-averse capital: institutional, conservative DeFi users, and large holdings that prioritise preservation over marginal yield. They value Ethereum\'s 4+ years at $10B TVL over Solana\'s 2 years at $2B TVL — worth a 2.4% yield sacrifice. The persistent spread shows the market\'s collective judgment that Solana\'s incremental risk is real and meaningful — not free money. Any individual can choose to take the extra 2.4% by accepting Solana\'s risk profile.',
    },
    {
      question: 'A USDC lending pool on a new chain offers 18% APY. You determine that 4% comes from real borrowing fees and 14% from protocol token emissions. Emissions are scheduled for 6 more months. What is your expected annualised yield if you invest today for 12 months?',
      options: [
        '18% — the advertised yield for the first 6 months averages out to 18% annually',
        'Approximately 9% — 6 months at 18% (4% fees + 14% emissions) followed by 6 months at approximately 4% (fees only, assuming protocol survives and emission token retains value). Average: (18% + 4%) / 2 = 11%, further discounted for emission token price risk and protocol risk. Realistic range: 7-11% depending on emission token price sustainability.', // ✓
        '4% — only the sustainable fee yield should be counted for a 12-month horizon',
        '18% — the protocol will launch new emission programmes after 6 months to maintain the yield',
      ],
      correct: 1,
      hint: 'What happens to the 14% emission yield at month 6? What yield do you earn in months 7-12?',
      explanation: 'Multi-period yield calculation: Month 1-6: 18% APY (4% fees + 14% emissions in protocol tokens). Month 7-12: approximately 4% APY (fees only — assuming emissions end exactly at 6 months and protocol token value holds for conversion). 12-month average: (6 months × 18% + 6 months × 4%) / 12 = (9% + 2%) = 11% simple average. Complications: (1) Emission tokens may decline in value during months 1-6 as recipients sell — reducing effective emission yield below 14%. (2) Protocol token may be illiquid — you may not be able to sell emission tokens at full face value. (3) Protocol may not survive 12 months — smart contract risk is higher at 6% than at Aave. Realistic risk-adjusted range: 7-11%, not the headline 18%. This is the key mental model: never evaluate emission-funded yield over a horizon that extends past the emission schedule.',
    },
    {
      question: 'Liquidity risk is often overlooked in yield comparisons. How does it specifically affect a $500K USDC position on a small-TVL protocol?',
      options: [
        'Liquidity risk means the protocol may run out of USDC liquidity to pay yield',
        'If the protocol has $2M total USDC deposited and you hold $500K (25% of the pool), during market stress when other depositors withdraw, you may find the pool\'s utilisation at 95%+ (most USDC is borrowed). You must wait for borrowers to repay loans before you can withdraw — potentially hours or days during volatile market conditions.', // ✓
        'Liquidity risk only applies to DEX LP positions, not lending protocol deposits',
        'A $500K position is too small to affect the liquidity of any major DeFi protocol',
      ],
      correct: 1,
      hint: 'In a lending protocol, can you always withdraw instantly? What happens when almost all deposits are borrowed out?',
      explanation: 'Lending protocol liquidity mechanics: utilisation rate = borrowed capital / total deposited capital. When utilisation is 80%: 20% of deposits are available to withdraw immediately. At 95% utilisation (common during market stress): only 5% withdrawable. At 100%: no withdrawals until borrowers repay. A $500K position in a $2M total pool (25% share): if you want to withdraw $500K but only $200K is available (90% utilisation), you withdraw $200K immediately and must wait for borrowers to repay the remaining $300K. During a market crash, borrowers are actually repaying loans as they deleverage — so liquidity often returns within hours. But during a protocol-specific emergency (if your position is in an exploited protocol), 100% utilisation may persist longer. Size positions relative to pool depth: $500K is appropriate for $10M+ TVL pools; for $2M pools, $100K is the maximum position that maintains adequate liquidity buffer.',
    },
    {
      question: 'Comparing Avalanche Benqi (4.6% APY, Aave fork, $400M TVL) vs Optimism Exactly Protocol (6.5% APY, novel fixed-rate lending mechanism, $80M TVL). Which offers better risk-adjusted yield?',
      options: [
        'Exactly Protocol — higher yield always represents better risk-adjusted opportunity in competitive markets',
        'Benqi offers better risk-adjusted yield: the 1.9% Exactly premium does not adequately compensate for Exactly\'s 5× lower TVL (less adversarial testing), novel mechanism (unproven at scale — fixed-rate lending has specific risks Aave-fork lending doesn\'t), and shorter track record. Benqi\'s Aave-fork code is extensively battle-tested.', // ✓
        'Both are equivalent — the market has efficiently priced both to the same risk-adjusted yield',
        'Exactly Protocol is safer because it operates on Optimism (Ethereum-secured) while Benqi is on Avalanche (independent security)',
      ],
      correct: 1,
      hint: 'Does the 1.9% yield premium at Exactly compensate for: 5× lower TVL, novel unproven mechanism, AND shorter track record?',
      explanation: 'Risk-premium adequacy analysis: 1.9% premium at Exactly compensates for three independent additional risks: (1) TVL depth: $80M vs $400M — 5× less adversarial testing. Small TVL means unprofitable-to-attack conditions that provide a security floor. As TVL grows toward $400M+, attack incentive increases without proportionate security increase. (2) Mechanism novelty: Exactly\'s fixed-rate lending requires more complex interest rate mathematics and new liquidation mechanics. Novel mechanisms have bugs that Aave-fork mechanisms (reviewed 100+ times by auditors globally) do not. (3) Track record: less time in production. The total risk premium required for these three factors combined: market practitioners often use 3-5% as a rough threshold for novel mechanism risk on significant capital. At 1.9%, the yield does not adequately compensate. An appropriate sizing: $20K exploratory position in Exactly (novel mechanism exposure, limited upside risk) combined with $100K in Benqi (core position at appropriate risk-adjusted yield). The novel protocol deserves a small position to monitor, not a core allocation.',
    },
    {
      question: 'How should you interpret a USDC yield of 35% on a 3-week-old protocol on a chain that launched 2 months ago?',
      options: [
        'This is a legitimate arbitrage opportunity — early DeFi investors who take this risk deserve higher rewards',
        'This is almost certainly unsustainable emission-funded yield on a new protocol with minimal adversarial testing. The 35% rate requires: the protocol token (used to pay emissions) to maintain its value AND the chain to operate without exploits AND the protocol code to contain no vulnerabilities — all three simultaneously over your investment horizon. Historical base rate: the majority of protocols with these characteristics have either been exploited or had their emission tokens collapse within 12 months.', // ✓
        'The 35% yield is fair compensation for the risks involved — rational participants have priced this correctly',
        'This is fine for a small position — the worst case is losing the yield, not the principal',
      ],
      correct: 1,
      hint: 'What percentage of 3-week-old protocols on 2-month-old chains with 35% APY have survived 12 months with principal intact? What do base rates tell you?',
      explanation: 'Base rate analysis: the question is not whether this specific protocol is safe (we cannot know) but whether the yield justifies the risk given the base rate of similar opportunities. Historical base rate analysis: of DeFi protocols fitting this description (3-week-old, 2-month-old chain, 35%+ APY), an estimated 70-80% have either: (a) been exploited, (b) had emission token collapse, or (c) been rugged within 12 months. The 20-30% that survived and paid 35% would need to compensate for the 70-80% losses. At 35% yield on a 12-month investment: expected value = 0.25 × 135% + 0.75 × 0% (total loss scenario) = 33.75% of principal on average. This is barely above 0% return and worse than 5% at Aave on an absolute basis when accounting for loss scenarios. The worst case is not "losing the yield" (option 4\'s framing) — the worst case is total loss of principal to an exploit. At these parameters, the worst case is the most common case.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 226 — BOSS: The Complete Alt-Chain Ecosystem Picture
// ─────────────────────────────────────────────────────────────────────────────

const L226: IslandLevel = {
  id: 226, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: The Complete Alt-Chain Ecosystem Picture',
  isBoss: true,

  explanation: `
You have completed Island 14 — Alt-Chain Ecosystems. Here is the full synthesis before the boss challenge.

Multi-chain persistence: no single chain wins because each optimises different trade-offs — Solana for speed, Ethereum for decentralisation, Avalanche for enterprise customisation, TON for mobile distribution. Developer tooling (Solidity/EVM, Rust/Anchor, Cairo) creates sticky ecosystems that reinforce chain diversity.

Polygon: enterprise dominance through active business development and an EVM-compatible sidechain (PoS), now building toward ZK-secured CDK chains unified by AggLayer. MATIC → POL migration aligns token economics with multi-chain staking. Nike, Starbucks, Reddit built on Polygon PoS.

Arbitrum: DeFi TVL leader among L2s, native-built protocols (GMX, Pendle, Camelot) exploiting Arbitrum\'s specific properties. ARB DAO with $3-4B treasury — highest-stakes L2 governance. Stylus adds Rust/C/C++ contract capability. Optimistic rollup means 7-day withdrawal window for full security.

Optimism: Superchain architecture (OP Stack open-sourced, 20+ chains, shared security). Bicameral governance (Token House + Citizens\' House). RetroPGF funds open-source public goods from sequencer revenue — a values-aligned funding experiment. Velodrome (ve(3,3)) is the native DEX.

Avalanche: three-chain architecture (X/C/P), enterprise subnet model (customisable validators, gas tokens, privacy), Evergreen packaged product. JPMorgan used Spruce subnet for live $182M transaction. AVAX demand tied to subnet validator staking. Benqi + Trader Joe on C-Chain.

Abstract: consumer chain thesis — native account abstraction, passkey wallets, session keys. Targeting non-crypto-native users via gaming and consumer apps. Base does distribution; Abstract does developer infrastructure.

Liquidity fragmentation: multi-chain distributes the $80B TVL across chains, thinning each pool. Solutions: bridge aggregators (Li.Fi, Socket), intent-based solvers (UniswapX, 1inch Fusion), within-family unification (Superchain, AggLayer). Bridge risk is the highest-value attack surface — 2022 year of $2B bridge hacks.

Chain incentive cycles: grant announcements → mercenary TVL spike → emission exhaustion → 50-80% TVL decline → genuine baseline. Evaluate chains by post-incentive baseline TVL, not peak metrics.

Protocol comparison: follow the protocol you trust to where it has deepest TVL and longest track record. Same Aave code is categorically safer on Ethereum ($10B, 4 years) than new chain ($50M, 3 months). Chain-native protocols (Camelot, Kamino, Aerodrome) often outperform Ethereum ports.

Risk-adjusted yield: sustainable yield (borrowing fees) is durable; emission yield collapses on schedule. Yield above 8-10% on established chains = primarily emissions. Above 15% = extreme scepticism warranted. Risk hierarchy: Ethereum < L2 < established independent chains < new chains < new protocols on new chains.

Multi-chain landscape: within-family consolidation (Superchain, AggLayer, IBC) is achievable; cross-ecosystem consolidation requires a trusted intermediary. Long-term: Ethereum + L2s, Solana, Bitcoin, and possibly TON coexist as major ecosystems.
  `.trim(),

  fact: 'Alt-Chain synthesis: multi-chain persistence (technical specialisation, tooling inertia), Polygon (enterprise PoS + ZK CDK/AggLayer), Arbitrum (DeFi TVL leader, GMX/Pendle native, Stylus, ARB DAO), Optimism (Superchain, bicameral governance, RetroPGF), Avalanche (subnet/enterprise), Abstract (consumer chain/native AA), liquidity fragmentation (bridge aggregators, intent solvers), chain incentive cycles (evaluate baseline not peak), risk-adjusted yield framework.',
  plain: 'This island covered why multiple chains persist (different specialisations, developer tooling), the major L2 ecosystems (Arbitrum\'s DeFi depth, Optimism\'s public goods model, Polygon\'s enterprise focus), enterprise blockchains (Avalanche subnets), consumer chains (Abstract), why liquidity is fragmented and how to work around it, and how to evaluate yield across chains risk-adjusted rather than by headline APY.',
  stars: [2400, 2950, 3700], target: 3700, coins: 100,
  simulatorLesson: 'altChainBoss',

  examples: [
    {
      contextTag: '[Portfolio manager, building a complete multi-chain allocation]',
      scenario: 'Amara manages $300,000 for a crypto-native investor with a 3-year horizon and moderate risk tolerance. She builds a complete multi-chain allocation using everything from this island.',
      outcome: 'Step 1 (Chain selection): primary chains based on security and ecosystem depth. Ethereum mainnet ($80K, 27%): floor security, core DeFi protocols, stETH staking. Arbitrum ($90K, 30%): DeFi depth, native GMX exposure for perp protocol thesis, Pendle for yield tokenisation. Base ($60K, 20%): Coinbase distribution advantage, cbBTC, Aerodrome LP. Solana ($50K, 17%): Kamino lending, Jupiter trading, unique high-frequency DeFi that doesn\'t exist on EVM. Bitcoin ($20K, 7%): monetary property, independent of smart contract outcomes. Step 2 (Protocol selection): each chain → deepest TVL + longest track record protocols. Step 3 (Bridge risk mitigation): only canonical bridges for large transfers, fast bridges for amounts under $20K. Step 4 (Yield assessment): all positions checked for sustainable vs emission yield. No positions in protocols offering above 10% USDC yield on established chains. Expected weighted yield: 6.8% from lending/LP positions + price appreciation upside.',
    },
    {
      contextTag: '[Ecosystem evaluator, using the 5-factor framework]',
      scenario: 'Marcus evaluates a new L1 chain against the 5-factor framework before considering any allocation.',
      outcome: '5-factor framework applied: Factor 1 (Security model): how secured? The chain uses its own validator set with $200M in total stake. Not Ethereum-secured. Moderate security — better than a brand-new chain, weaker than an Ethereum L2. Factor 2 (TVL and age): $1.5B TVL, 18 months old. Meaningful but limited adversarial testing at scale. Factor 3 (Developer activity): 200+ active GitHub contributors, growing by 15% quarter-over-quarter. Positive. Factor 4 (Liquidity depth): top DEX has $80M in the largest pool. Large trades ($200K+) will face 1%+ slippage. Moderate. Factor 5 (Unique differentiation): the only chain with a live, working zkEVM Type 1 — not available anywhere else. Strong differentiation. Verdict: 2 strong factors (developer activity, differentiation), 2 moderate (TVL/age, liquidity), 1 acceptable (security). Appropriate for a 5-8% exploratory portfolio allocation — not a core position at current metrics.',
    },
    {
      contextTag: '[Grant evaluator, assessing a chain\'s ecosystem programme]',
      scenario: 'Priya is evaluating whether to recommend a $50M ecosystem grant programme for a chain to its governance body. The proposal: $50M in native tokens over 12 months to DeFi protocols deploying on-chain.',
      outcome: 'Grant design analysis: problem 1 (mercenary dynamics): flat token distribution to "any DeFi protocol deploying" attracts Ethereum forks that deploy for the grant, capture it, and leave. 12 months of incentives will produce a TVL spike followed by collapse. Problem 2 (metric selection): TVL is the wrong metric to maximise — genuine ecosystem health = unique users, developer retention, protocols with post-incentive survival. Recommendation: restructure to milestone-based in stablecoins. $15M for protocols with 6 months of sustained operation post-grant. $20M for protocols achieving 10,000+ unique monthly active users (not just TVL). $15M for protocols building chain-native features unavailable on other EVM chains. Evaluation period: 18 months, not 12. This redesign targets durable ecosystem development rather than temporary TVL inflation. Expected result: fewer protocols deploy (those who need the token subsidy rather than the chain\'s genuine properties), but those that do have stronger product-market fit.',
    },
  ],

  keyTakeaway: 'Alt-chain mastery means evaluating each chain by its genuine technical differentiation (not marketing), assessing protocols by track record and TVL depth (not headline yield), understanding that liquidity fragmentation creates systematic costs that bridge aggregators and intent systems partially mitigate, and applying risk-adjusted yield analysis that separates sustainable earnings from temporary emissions.',

  guidedPractice: [
    {
      question: 'Apply the 5-factor framework to Arbitrum: (1) Security — Ethereum-secured L2. (2) TVL — $15B peak, $10B sustained for 2+ years. (3) Developer activity — 500+ active ecosystem developers, ARB DAO funding growth. (4) Liquidity depth — deepest DeFi TVL among all L2s. (5) Differentiation — DeFi-native protocols (GMX, Pendle), Stylus, largest L2 DAO treasury. What is the appropriate allocation conclusion?',
      options: [
        'Moderate allocation — Arbitrum is unproven and should only receive 5% of a portfolio',
        'Core allocation — Arbitrum scores strongly on all 5 factors: Ethereum security inheritance eliminates chain-level risk, 2+ years sustained TVL proves adversarial testing, active developer community demonstrates ecosystem health, deepest L2 liquidity enables large position execution, and native-built DeFi innovation creates durable ecosystem identity. It warrants a substantial core position (25-35% of a DeFi-focused portfolio).', // ✓
        'Maximum allocation — Arbitrum should receive 80%+ of any crypto portfolio',
        'No allocation — Arbitrum\'s 7-day withdrawal window makes it unsuitable for any position',
      ],
      correct: 1,
      hint: 'When a chain scores well across all 5 factors, what does that imply about position sizing?',
      explanation: '5-factor scoring: Security (Ethereum-secured): maximum score — no independent chain risk. TVL and age (2+ years, $10B sustained): maximum score — extensive adversarial testing. Developer activity (500+ developers, growing ecosystem): high score. Liquidity depth (deepest L2 DeFi): maximum score for an L2. Unique differentiation (GMX, Pendle, Stylus, ARB DAO): high score — genuine innovation, not just Ethereum fork. Total: 5 high scores across 5 factors = high-conviction core position appropriate. The 7-day withdrawal concern (option 4): this is a managed operational constraint, not a fundamental risk. With fast bridges (Across, Hop), you can exit quickly if needed at modest cost. The 7-day full security withdrawal is for users who prioritise maximum security over speed — fast bridges trade that security for convenience. The 7-day window does not prevent allocation; it informs the exit planning.',
    },
    {
      question: 'A chain\'s grant programme ends. TVL drops from $8B to $800M in 60 days. Three months later, TVL has grown to $1.1B organically. What does this pattern tell you?',
      options: [
        'The chain is fundamentally broken — $6.9B in TVL left and never returned',
        'The $800M post-incentive floor is the genuine demand baseline. The subsequent organic growth to $1.1B (37% increase without incentives) demonstrates that the remaining protocols have real product-market fit and are attracting users independent of grants. This is an encouraging signal for long-term ecosystem health.', // ✓
        'The $8B was all genuine demand; the 90% decline was caused by a smart contract bug',
        'A chain with this TVL volatility should be avoided entirely regardless of post-incentive performance',
      ],
      correct: 1,
      hint: 'What does organic TVL growth after incentive removal signal about the remaining protocols?',
      explanation: 'Post-incentive pattern interpretation: $8B → $800M: incentives ended, mercenary capital left. Expected. $800M floor → $1.1B organic: three months without any incentive programme, TVL grew 37.5%. This is the signal that matters. Organic TVL growth means: real users are finding real utility in the protocols that survived the incentive removal. These protocols are attracting new users because the protocols solve real problems, not because of yield subsidies. Avalanche showed exactly this: post-Rush TVL stabilised at $2B and then grew to $3B organically as Benqi, Trader Joe, and enterprise subnets attracted genuine users. Compare to Fantom: post-Cronje departure TVL settled at $400M and then declined further (organic decay rather than growth) — indicating the remaining protocols lacked genuine product-market fit. Organic growth post-incentive is the most reliable signal of a chain\'s genuine ecosystem value.',
    },
    {
      question: 'You are choosing between providing liquidity on Velodrome (Optimism) vs Aerodrome (Base) for the same USDC/USDT stable pair. Velodrome offers 8.5% APY; Aerodrome offers 9.1% APY. What additional information do you need before deciding?',
      options: [
        'Just choose Aerodrome — it has higher APY and Base has Coinbase backing',
        'You need: (1) Breakdown of fee vs emission yield for each (sustainable vs temporary). (2) Pool depth — which pool has more TVL, affecting IL risk and exit liquidity. (3) veVELO vs veAERO vote allocation — which pool has more sustained emission direction ensuring ongoing rewards. (4) Chain-specific risk assessment — Base vs Optimism security and liquidity profile for your position size.', // ✓
        'The 0.6% difference is too small to matter — just pick either one randomly',
        'You should choose Velodrome because it has a longer track record',
      ],
      correct: 1,
      hint: 'What if Aerodrome\'s extra 0.6% is entirely from token emissions that will end next month? What if Velodrome\'s pool is 3× deeper, improving your exit liquidity?',
      explanation: 'Decision framework for comparable protocols: the 0.6% APY difference is meaningful at large position sizes ($50K × 0.6% = $300/year) but not the only relevant variable. Yield decomposition: if Velodrome\'s 8.5% = 6% fees + 2.5% emissions and Aerodrome\'s 9.1% = 3% fees + 6.1% emissions, the fee-only comparison is 6% vs 3% — Velodrome wins on sustainability despite lower headline APY. Pool depth: a deeper pool provides better emergency exit (can exit $200K without meaningful slippage) and lower IL sensitivity. veToken vote allocation: which pool has stronger vote commitment in the current epoch determines emission sustainability. Chain risk: Base and Optimism are both Ethereum-secured L2s — equivalent chain risk for most users. Position-size-dependent: at $5K, Aerodrome\'s higher headline APY wins (fee difference is $30/year, not worth the analysis). At $200K, the detailed decomposition matters significantly.',
    },
    {
      question: 'Why is a bridge aggregator (Li.Fi) preferable to a single bridge (Hop) for most cross-chain transfers, and when should you use a canonical bridge instead?',
      options: [
        'Bridge aggregators are always better — never use single bridges or canonical bridges',
        'Li.Fi queries multiple bridges simultaneously to find optimal route (best fee, speed, supported tokens) — better for most transfers where price and speed matter. Canonical bridges should be used for large amounts ($100K+) or long-term deployments where zero third-party trust is worth the 7-day withdrawal window trade-off.', // ✓
        'Canonical bridges are always more expensive — only use aggregators to save fees',
        'Bridge aggregators are only useful for cross-chain swaps — for simple transfers, a single bridge is always better',
      ],
      correct: 1,
      hint: 'When does the canonical bridge\'s 7-day window matter? When does the bridge aggregator\'s routing advantage matter?',
      explanation: 'Bridge selection decision tree: Li.Fi / Socket aggregator: use for amounts under $50-100K, frequent rebalancing (where 7-day windows are prohibitive), when multiple destination chains are being considered (aggregator finds optimal route across all), and when bridge fee optimisation matters (aggregator finds cheapest route). Single bridges (Hop, Across): use when you have a specific bridge preference based on their unique properties (Across for fastest speed, Circle\'s CCTP for zero-fee USDC transfers on supported chains). Canonical bridges: use for amounts above $100K with a deployment horizon of 1+ months, when accepting zero third-party trust is worth the 7-day return window, and for maximum security guarantees where Ethereum-level settlement is required. The 7-day window is only a constraint if you need to return funds quickly — for a 6-month DeFi deployment, 7 days to withdraw is a non-issue.',
    },
    {
      question: 'You are designing a DeFi protocol that will launch on three chains: Arbitrum (primary), Base (secondary), and Solana (exploratory). How do you allocate your security audit budget and which components need separate audits?',
      options: [
        'One audit covering Arbitrum is sufficient — the same audit applies to all EVM chains',
        'One audit for the Arbitrum/Base EVM contracts (same bytecode, audit covers both). A completely separate audit for the Solana Anchor program (different language, different vulnerability classes, different auditor expertise required — Solana-specialist auditors, not EVM auditors). Any bridge integration code requires its own security review regardless of chain.', // ✓
        'Three separate full audits — one per chain, regardless of code similarity',
        'No audit is needed for the exploratory Solana deployment until TVL exceeds $10M',
      ],
      correct: 1,
      hint: 'What is the same between Arbitrum and Base deployments? What is categorically different about the Solana program?',
      explanation: 'Audit budget allocation logic: Arbitrum + Base EVM deployment: same Solidity bytecode, same EVM execution environment. A single audit covering the contract code is valid for both chains. Chain-specific risk (oracle integration, L2 sequencer trust) should be addressed in a chain-specific security review — but the core contract logic audit applies to both. Cost: one full audit, valid for both EVM chains. Solana Anchor program: completely different language (Rust), completely different execution model (account-based programs vs account-less EVM contracts), completely different vulnerability classes (missing account validation, CPI reentrancy, signer seed manipulation). EVM auditors are not qualified to audit Anchor programs — requires Solana-specialist firms (Ottersec, Neodyme, Kudelski Security). Cost: separate full audit. Bridge integration: any cross-chain bridge code introduces new attack surface regardless of chain. A separate security review of the bridge integration logic (how your contracts handle cross-chain messages, validate bridge deposits) is required for each bridge used. Total: 2 core audits (EVM + Solana) + bridge integration reviews per bridge used.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: `A friend shows you their current DeFi allocation:\n\n- $50,000 USDC in "DeltaFi" protocol on Chain X (launched 3 months ago, 28% APY — breakdown: 5% borrowing fees, 23% in DeltaFi token emissions). DeltaFi token has no liquidity beyond the protocol's own pool.\n- $30,000 ETH bridged to Chain X via "FastBridge" (third-party, $40M TVL, 4 months old).\n- $20,000 in Chain X's native token (currently up 300% from launch).\n\nChain X: launched 5 months ago, $600M TVL, own validator set (80 validators), currently has a $100M grant programme running with 2 months remaining.\n\nYour friend says: "I'm making $1,400/month in yield. Why would I move?"\n\nGive a complete risk assessment and your recommendation.`,
      scoringCriteria: [
        'Correctly identifies the emission cliff: 23% of 28% APY (82% of total yield) is in DeltaFi tokens with no external liquidity. When the grant programme ends in 2 months, emission yield will collapse — the sustainable 5% floor is a 1/5 reduction in total yield. Friend should model the $280/month they will actually earn post-incentive.',
        'Flags the FastBridge risk specifically: a 4-month-old bridge with $40M TVL holding $30,000 of the friend\'s ETH is a significant concentration in unproven cross-chain infrastructure. Recommends migrating to a canonical bridge or at minimum a larger, more established bridge.',
        'Addresses the Chain X concentration: all three positions are exposed to Chain X failing (exploit, validator compromise, or regulatory action). Recommends no more than 30-40% of total portfolio on any single independent chain.',
        'Quantifies the expected value honestly: $1,400/month for 2 more months ($2,800 total) vs the risk of losing $30,000-$50,000 in positions. Frames the decision as: is $2,800 of additional yield worth the tail risk exposure?',
        'Provides a concrete migration recommendation: exit the emission yield position now (before the grant programme ends and the cliff hits), move the $30K via FastBridge back to an established chain using a canonical bridge, retain some Chain X native token as a smaller speculative position if conviction in Chain X long-term is genuine.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: `You are comparing two chains for a $200,000 deployment over 18 months:\n\nChain A: Ethereum L2 (ZK rollup), $8B TVL, 18 months old, top protocol Aave v3 ($3B TVL), USDC lending 5.4% APY (all from borrowing fees), canonical bridge 45-minute withdrawal, DeFi ecosystem: 40 protocols.\n\nChain B: Independent L1, $2B TVL, 36 months old, top protocol "LendX" ($400M TVL, 2 years on this chain), USDC lending 8.1% APY (6.2% borrowing fees + 1.9% in LNDX emissions), fast bridge 5-minute withdrawal (third-party, $200M TVL), DeFi ecosystem: 15 native protocols.\n\nBased on the risk-adjusted yield framework and the 5-factor chain evaluation, which chain would you recommend and why? Quantify where possible.`,
      scoringCriteria: [
        'Applies the 5-factor framework to both chains and scores them: Chain A wins on security (Ethereum-secured ZK rollup vs independent validator set), TVL age (18 months vs 36 months, but 36 months of independent track record is solid), liquidity depth (Aave $3B vs LendX $400M). Chain B has a longer track record but lower security model.',
        'Correctly decomposes Chain B\'s yield: 6.2% sustainable (borrowing fees) + 1.9% LNDX emissions. Over 18 months, the emission portion may decline or collapse depending on LNDX emission schedule. The fair comparison is 5.4% (Chain A) vs 6.2% sustainable yield on Chain B — a 0.8% difference.',
        'Quantifies the yield difference: $200K × 0.8% = $1,600/year additional sustainable yield on Chain B. Over 18 months: $2,400 in additional sustainable yield. Then calculates whether this justifies Chain B\'s risks (independent chain risk, smaller protocol TVL, third-party bridge).',
        'Addresses the bridge risk specifically: Chain A\'s 45-minute canonical bridge has near-zero bridge smart contract risk. Chain B\'s 5-minute third-party bridge with $200M TVL holds your funds in transit — at $200K (0.1% of bridge TVL), this is acceptable but noteworthy.',
        'Provides a nuanced recommendation: possibly split (e.g., $140K Chain A, $60K Chain B) to capture some of Chain B\'s yield premium while limiting concentration in the higher-risk independent chain setup. Or recommends Chain A exclusively if the $2,400 yield difference over 18 months is insufficient to justify Chain B\'s additional risk factors.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 227 — Avalanche Subnet Deep Dive
// ─────────────────────────────────────────────────────────────────────────────

const L227: IslandLevel = {
  id: 227, mechanic: 'trait', tier: 'pro',
  topic: 'Avalanche Subnet Architecture — Deep Dive',

  explanation: `
In 2023, DFK Chain (DeFi Kingdoms) launched as an Avalanche subnet. The game required 500,000 transactions per day at sub-cent costs with a custom gas token (JEWEL) — requirements impossible on any shared chain. As a dedicated subnet, DFK Chain handled its own throughput entirely, used JEWEL as native gas, and maintained complete independence from Avalanche C-Chain congestion. A game-specific blockchain, secured by Avalanche\'s consensus.

Subnet architecture in depth: a subnet is a sovereign network of validators defining their own rules but operating within Avalanche\'s consensus framework. Each subnet has its own virtual machine — it could run an EVM (most common), a custom VM, or even a non-Ethereum VM entirely.

Key subnet parameters: validator set (who runs nodes — permissioned or permissionless), virtual machine (EVM fork, custom, or standard EVM), gas token (AVAX or any custom token), gas price (set by subnet), transaction speed (subnet-specific, not shared with C-Chain), and privacy (subnet transactions can be isolated from public view).

The subnet economic model: Avalanche validators must stake AVAX on the Primary Network to validate any subnet. This means subnet operators either run their own validators (staking AVAX themselves) or pay existing Avalanche validators to validate their subnet. This creates a cost floor for subnet deployment — meaningful AVAX stake is required, which anchors AVAX demand.

Subnet vs L2 rollup comparison: an Avalanche subnet has its own validator set and full consensus independence — it does not inherit Avalanche security for transaction validity the way an Ethereum L2 inherits Ethereum security. If all subnet validators collude, they can manipulate the chain state (unlike an L2 where Ethereum proofs prevent this). The trade-off: subnets have complete independence and customisability; L2 rollups have stronger inherited security but less independence.

AvalancheGo and the subnet ecosystem: the primary node software. Subnet-EVM (a fork of the Ethereum client adapted for Avalanche) is the standard VM for EVM-compatible subnets. Ava Labs maintains Subnet-EVM and provides tools (subnet-cli, Avalanche Network Runner) for deployment.
  `.trim(),

  fact: 'Subnet key parameters: validator set (permissioned/permissionless), VM (EVM fork or custom), gas token (AVAX or custom), isolated throughput. Economic model: subnet validators must stake AVAX on Primary Network (anchors AVAX demand). Security distinction: subnets have independent consensus (no Ethereum-level proof inheritance) vs Ethereum L2s which inherit mainnet security.',
  plain: 'Avalanche subnets are dedicated blockchains within the Avalanche ecosystem. Each has its own validators, its own gas token, and its own transaction speed completely separate from other subnets. A game can have a subnet just for its own transactions — no competition with other apps. The trade-off: subnets are responsible for their own security (validators can collude), unlike Ethereum L2s where Ethereum itself enforces correctness.',
  stars: [720, 880, 1100], target: 1100, coins: 40,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[Enterprise architect, designing a financial subnet]',
      scenario: 'A consortium of 5 insurance companies wants to build a shared claims settlement ledger. They want: only their own validators, USD-denominated fees, regulatory compliance built in, 10,000 TPS capacity. They evaluate an Avalanche subnet.',
      outcome: 'Subnet design: (1) Permissioned validator set: each of 5 insurance companies runs 2 validators = 10 total validators. Each stakes AVAX on Primary Network (cost: ~2,000 AVAX per validator = 20,000 AVAX total stake, ~$600,000 at $30 AVAX). (2) Custom gas token: deploy a stablecoin-pegged gas token (USDG) — transactions pay fees in USDG (tied to USD), eliminating crypto price volatility from operational costs. (3) Custom EVM configuration: deploy KYC-gated transaction verification — every transaction must be from a whitelisted address. (4) Throughput: dedicated subnet, isolated from all other Avalanche activity. 10,000 TPS is achievable (Avalanche consensus supports this). (5) Privacy: subnet transactions are visible only to validators — not public on Avalanche explorer. Legal structure: the consortium registers the subnet as a shared infrastructure entity. Regulatory compliance: AVAX staking requirement handled by each company\'s compliance team.',
    },
    {
      contextTag: '[Gaming company, DFK subnet case study]',
      scenario: 'Amara is studying the DeFi Kingdoms (DFK) subnet as a model for her gaming company. She wants to understand why DFK moved from Harmony (a different chain) to an Avalanche subnet.',
      outcome: 'DFK\'s migration reasons: Problem on Harmony: DFK shared Harmony\'s blockspace with all other Harmony apps. During high traffic periods, DFK players experienced failed transactions and high fees. Additionally, Harmony suffered a $100M bridge hack in 2022, severely damaging trust and ecosystem. Subnet advantages: (1) Isolated throughput: DFK Chain handles only DFK transactions — no competition from other apps for blockspace. (2) Custom gas: JEWEL token (the game\'s native currency) is the gas token — players use their in-game currency for fees, no need to acquire AVAX. (3) Speed: DFK set their own block time (optimised for game loop — faster than needed for financial transactions). (4) Independence: DFK Chain\'s security depends only on DFK\'s own staked validators, not on Harmony\'s broader ecosystem health. Tradeoff accepted: DFK must maintain their own validator set and AVAX staking — higher operational overhead than using a shared chain.',
    },
    {
      contextTag: '[Validator operator, evaluating subnet validation income]',
      scenario: 'Marcus operates 5 Avalanche validators (staking 2,000 AVAX each). He is approached by a new DeFi subnet to validate their chain for $5,000/month in payment. He evaluates.',
      outcome: 'Validation income analysis: current income from Primary Network: ~8% APY on 10,000 AVAX × $30/AVAX = $300,000 stake value × 8% = $24,000/year ($2,000/month) in AVAX rewards. Subnet validation offer: $5,000/month additional = $60,000/year in additional income. Total income with subnet: $84,000/year — 3.5× increase. Risk factors: (1) Technical overhead: running subnet validation requires additional hardware or server capacity. Marginal cost: $200-500/month. (2) Uptime requirement: if Marcus\'s validators have downtime that causes subnet issues, the subnet operator may terminate the agreement. (3) Subnet reputation risk: if the subnet is associated with fraudulent activity, Marcus\'s validators are associated with it. He requires background check on subnet operator and audited smart contracts. Net income calculation: $60,000 additional - $3,000/year additional server costs = $57,000 net additional income. Marcus accepts pending legal review of the subnet operator.',
    },
  ],

  keyTakeaway: 'Avalanche subnets provide genuinely isolated, customisable blockchain infrastructure with enterprise-grade configurability — but they trade Ethereum-level security inheritance for operational independence, and the mandatory AVAX staking creates a real economic link between subnet adoption and AVAX token demand.',

  guidedPractice: [
    {
      question: 'A subnet uses JEWEL (a game token) as its gas token instead of AVAX. What is the user experience impact and the technical mechanism?',
      options: [
        'The JEWEL gas token means players must acquire JEWEL separately to use the blockchain — a friction point',
        'For DFK players who already hold JEWEL as in-game currency, using JEWEL for gas eliminates the need to ever acquire AVAX — they play, earn JEWEL, and that same JEWEL pays for their transactions. The technical mechanism: the subnet EVM is configured with a custom fee token contract that accepts JEWEL for transaction fees instead of the default AVAX.', // ✓
        'Custom gas tokens on subnets require validators to hold both JEWEL and AVAX, increasing costs',
        'JEWEL as a gas token means transactions are free — the token is just a display unit with no real fee',
      ],
      correct: 1,
      hint: 'Who normally needs AVAX to use an Avalanche chain? Who actually uses DFK Chain and what currency do they already have?',
      explanation: 'Gas token customisation value: on the Avalanche C-Chain, gas requires AVAX. A new player who wants to try DeFi Kingdoms must: download a wallet, buy AVAX on an exchange, bridge or transfer AVAX to their wallet, then play. Custom JEWEL gas: a player earns JEWEL by playing (quest rewards, hero leveling, etc.). That same JEWEL pays for every blockchain transaction within DFK Chain. No AVAX acquisition required. No external exchange interaction. The player\'s in-game economic loop is self-contained within the game token. Technical implementation: the Subnet-EVM allows configuration of a custom fee manager contract that accepts any ERC-20 token for fees. The fee manager burns or redistributes the JEWEL collected as fees — creating a deflationary mechanism aligned with the game economy. This is not possible on any shared chain — custom gas tokens require a dedicated VM with customisable fee logic.',
    },
    {
      question: 'What is the critical security difference between an Avalanche subnet and an Ethereum optimistic rollup?',
      options: [
        'Avalanche subnets are faster than Ethereum rollups because they don\'t wait for Ethereum finality',
        'An Ethereum L2 rollup\'s transaction validity is enforced by Ethereum mainnet (fraud proofs or ZK proofs on L1) — the L2 sequencer cannot create invalid transactions without Ethereum detecting it. An Avalanche subnet\'s transaction validity is enforced by its own validator set — if a majority of subnet validators collude, they can create fraudulent state transitions with no external check.', // ✓
        'Avalanche subnets are more secure because they use Avalanche\'s superior consensus algorithm',
        'The security difference is only relevant for enterprise use cases — for DeFi, both provide equivalent protection',
      ],
      correct: 1,
      hint: 'Who detects invalid transactions in an Ethereum rollup? Who would need to detect them in an Avalanche subnet?',
      explanation: 'Security inheritance vs. independent security: Ethereum L2 security model: the sequencer (operator) can censor or reorder transactions but cannot create invalid state transitions. If the sequencer submits an invalid batch (claiming someone spent ETH they don\'t have), an Ethereum fraud prover will detect and challenge it on L1. The sequencer\'s computational claim is verified independently by Ethereum\'s global validator set. Avalanche subnet security model: if all 10 subnet validators (e.g., the 5 insurance companies from the enterprise example) collectively decide to create a fraudulent state, there is no external validator checking their work. The Avalanche Primary Network validators do not verify subnet transaction validity — they only validate that subnet validators are meeting their Primary Network obligations. The subnet\'s security ceiling is the economic stake and reputation of its own validator set. For low-stakes applications (gaming, internal corporate settlement), this is acceptable. For $1B+ in user DeFi capital, Ethereum L2 security inheritance is categorically safer.',
    },
    {
      question: 'Why does requiring subnet validators to also stake AVAX on the Primary Network benefit the AVAX token economics?',
      options: [
        'It forces subnet operators to buy AVAX, creating artificial demand that benefits existing AVAX holders',
        'Each subnet validator must hold a meaningful AVAX stake on the Primary Network, regardless of what token is used in the subnet itself. As more subnets launch (enterprise deployments, gaming chains, DeFi chains), each requires its validators to stake AVAX — expanding AVAX demand proportionally with subnet ecosystem growth, even if those subnets use entirely different gas tokens.', // ✓
        'The Primary Network stake is returned to subnet operators after 1 year, so it has no long-term AVAX impact',
        'Primary Network staking for subnet validators is optional and most subnet operators choose to waive it',
      ],
      correct: 1,
      hint: 'If 100 enterprise subnets each require their 10 validators to stake 2,000 AVAX each, how much AVAX is locked in Primary Network stakes?',
      explanation: 'AVAX demand mechanics: the subnet validator requirement creates a direct mathematical link between ecosystem growth and AVAX demand. 100 subnets × 10 validators each × 2,000 AVAX minimum stake = 2,000,000 AVAX locked in Primary Network validation stakes. At $30/AVAX: $60M in AVAX locked, not freely circulating. This locked stake grows linearly with subnet count and validator count. The critical insight: even an enterprise subnet using a custom gas token (no AVAX transactions at all within the subnet) still requires its validators to maintain AVAX stakes on the Primary Network. Enterprise blockchain adoption directly drives AVAX staking demand. This is unlike Ethereum where layer 2 chains do not require ETH to be staked by L2 validators (though they pay ETH for data availability). Avalanche\'s architecture explicitly creates this token demand linkage as an economic design choice.',
    },
    {
      question: 'A gaming company runs a subnet with 10 validators they control entirely. A hacker compromises 6 of the 10 validator nodes. What can the hacker do?',
      options: [
        'Nothing — Avalanche\'s consensus prevents any validator from creating invalid transactions',
        'The hacker controls 60% of the validator set, giving them the ability to: reorganise recent blocks (replacing legitimate transactions with fraudulent ones), freeze the chain (refuse to produce new blocks), or create invalid state transitions (mint tokens that don\'t exist, transfer assets from users without authorisation) — because there is no external validation of subnet state.', // ✓
        'The hacker can only steal the AVAX staked by the compromised validators, not the subnet\'s assets',
        'The Avalanche Primary Network automatically detects the invalid blocks and restores the legitimate state',
      ],
      correct: 1,
      hint: 'Who enforces transaction validity on the subnet — only the subnet validators, or also Ethereum/Avalanche mainnet validators?',
      explanation: 'Majority validator compromise consequences: Avalanche\'s consensus (Snowflake/Avalanche protocol) finalises blocks when a sufficient threshold of validators agree. With 6 of 10 validators controlled by an attacker: the attacker has a 60% majority — sufficient to reach consensus on any block the attacker constructs. The attacker can: (1) Build a fraudulent block that transfers all users\' tokens to the attacker\'s address. The 6 controlled validators vote to finalize this block. The 4 legitimate validators are outvoted. (2) Create tokens from nothing (if the game has a mint function the attacker can call). (3) Replay or reorganise previous transactions. External check: the Avalanche Primary Network does not verify subnet block contents — it only verifies that subnet validators are participating in Primary Network consensus. The subnet\'s internal state is invisible to Primary Network validators. This is why permissioned subnets with small validator sets are appropriate for lower-stakes applications — the attack model is realistic for high-value targets.',
    },
    {
      question: 'How does the Subnet-EVM differ from the standard Ethereum EVM, and why does this matter for deploying existing Ethereum contracts?',
      options: [
        'Subnet-EVM is incompatible with Solidity — all contracts must be rewritten in Avalanche\'s proprietary language',
        'Subnet-EVM is a fork of the Ethereum execution client (Go-Ethereum) with Avalanche-specific modifications: configurable gas tokens, custom precompiles for Avalanche features, and adjustable block parameters. Existing Solidity contracts deploy identically — the EVM bytecode execution is the same. Only contracts that explicitly depend on mainnet-specific features (Ethereum precompile addresses, specific gas mechanics) may need review.', // ✓
        'Subnet-EVM requires a higher version of Solidity than standard Ethereum, making older contracts incompatible',
        'Subnet-EVM processes transactions 10× faster than Ethereum EVM due to a different execution engine',
      ],
      correct: 1,
      hint: 'If Subnet-EVM is a fork of Go-Ethereum, what parts are the same and what parts are customised?',
      explanation: 'Subnet-EVM compatibility: Go-Ethereum (Geth) is Ethereum\'s primary execution client. Subnet-EVM forks Geth and adds: (1) Custom fee manager (allows AVAX or any ERC-20 as gas token). (2) Allowlist precompiles (permissioned transaction submission for enterprise). (3) Configurable consensus parameters (block time, gas limits). (4) Avalanche-specific chain ID and network configuration. What stays identical: EVM opcode execution, Solidity contract bytecode, event emission, storage layout, ABI encoding. Deployment impact: an Ethereum developer can take their existing Hardhat/Foundry project, change the network configuration to point to a Subnet-EVM RPC endpoint, and deploy without any code changes. The contract bytecode is identical. The same Etherscan-compatible block explorer (Snowtrace for Avalanche, or a Subnet-EVM explorer) displays the verified source code and ABIs in the same format. The developer experience for deploying to Subnet-EVM is materially the same as deploying to Arbitrum or Base — one config file change.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 228 — Polygon AggLayer Technical Deep Dive
// ─────────────────────────────────────────────────────────────────────────────

const L228: IslandLevel = {
  id: 228, mechanic: 'chain', tier: 'pro',
  topic: 'Polygon AggLayer — Technical Architecture',

  explanation: `
In January 2024, Polygon launched AggLayer v1 with a simple but profound claim: any ZK-proved chain that connects to AggLayer gains the ability to exchange assets with any other connected chain without a bridge. The security guarantee comes from ZK proofs aggregated into a single Ethereum-verified proof — eliminating the bridge smart contract as an attack surface.

AggLayer architecture: at its core, the AggLayer is a smart contract on Ethereum that aggregates ZK proofs from multiple connected chains. Each connected chain (a Polygon CDK chain) posts its state root and a ZK proof of valid state transitions to the AggLayer. The AggLayer aggregates these proofs into a single proof submitted to Ethereum.

Cross-chain transactions on AggLayer: a user on Chain A wants to move 1,000 USDC to Chain B (both CDK chains connected to AggLayer). The mechanism: Chain A\'s state transition includes "burn 1,000 USDC from Alice\'s account." Chain B\'s state transition includes "mint 1,000 USDC to Alice\'s account." The AggLayer verifies that the total USDC burned across chains equals the total minted — a cross-chain conservation law. This cross-chain state is committed atomically and proved by the aggregated ZK proof verified on Ethereum.

Why this is different from bridges: a conventional bridge holds assets in a smart contract on the source chain and mints representations on the destination chain. The bridge contract is an attack surface — $320M hacked from Wormhole by forging a message that the bridge contract accepted. AggLayer: no bridge contract holding assets. The cross-chain conservation is verified by the ZK proof itself — you cannot fake a burn-without-mint (the ZK proof would fail). The security surface is the ZK proof cryptography, not a smart contract.

Current limitations: AggLayer v1 (2024) supports Polygon CDK chains only. Chains must use Polygon\'s ZK proof system (PLONK-based). The ecosystem of connected chains is growing but requires the CDK framework as an entry point. Non-CDK chains (Arbitrum, Base) cannot currently connect to AggLayer.
  `.trim(),

  fact: 'AggLayer: Ethereum-deployed contract aggregating ZK proofs from multiple Polygon CDK chains. Cross-chain conservation: ZK proof verifies burned assets on Chain A equal minted assets on Chain B — no bridge smart contract needed. Security surface: ZK cryptography (not bridge validator set). Limitation: CDK chains only (2024). Comparison: bridges require trusting a validator set; AggLayer requires trusting ZK proof correctness.',
  plain: 'AggLayer is a ZK-based cross-chain system where moving assets between connected chains is proved mathematically (not trusted to a bridge validator). The proof checks: if you burned 1,000 USDC on Chain A, exactly 1,000 USDC must appear on Chain B. No bridge contract holding your money — just math checked by Ethereum. The downside: only chains built with Polygon\'s CDK framework can connect (2024).',
  stars: [740, 900, 1120], target: 1120, coins: 40,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[Developer, building on AggLayer for cross-chain composability]',
      scenario: 'James builds a lending protocol on CDK Chain A. He wants users from CDK Chain B (a different DeFi chain) to use their Chain B assets as collateral for loans on Chain A. Without AggLayer, this requires a bridge. With AggLayer?',
      outcome: 'AggLayer cross-chain collateral flow: (1) Alice holds 10 ETH on Chain B. She wants to borrow USDC on Chain A\'s lending protocol. (2) Alice initiates a cross-chain message: "Lock 10 ETH on Chain B, collateralise it on Chain A." (3) Chain B state transition: Alice\'s 10 ETH is locked (not burned — just locked in a reserve contract). Chain A state transition: Alice receives a "credit position" representing her 10 ETH collateral. (4) AggLayer aggregates both state transitions in its proof. Ethereum verifies the aggregated proof. The lock-on-B and credit-on-A are now atomically settled. (5) Alice borrows USDC on Chain A using her Chain B ETH as collateral. (6) If she repays: the reverse process unlocks her ETH on Chain B. This cross-chain collateralisation is not possible with conventional bridges (requires bridging the ETH to Chain A first, losing it from Chain B).',
    },
    {
      contextTag: '[Security analyst, comparing AggLayer to Wormhole]',
      scenario: 'Priya is comparing the security models of AggLayer and Wormhole for a $10M DeFi deployment that requires cross-chain functionality.',
      outcome: 'Wormhole security model: 19 "guardian" validators monitor both source and destination chains. To approve a cross-chain message, 13 of 19 must sign. Security assumption: trust that 13+ guardians are non-colluding and have secure keys. Wormhole hack ($320M): a signature verification bypass allowed forging guardian signatures — the code trusted a signature that was not actually from a guardian. Smart contract risk + validator trust. AggLayer security model: no guardian validators. Cross-chain state conservation is proved by ZK proof. Security assumption: trust that the PLONK proof system is cryptographically sound (no efficient ZK forgery known — a hardened mathematical assumption). Smart contract risk: the AggLayer contract on Ethereum must correctly verify the aggregated proof (one auditable contract). Risk difference: Wormhole\'s attack required forging one malicious message. AggLayer\'s attack would require breaking PLONK cryptography (effectively impossible with current computing). For $10M deployment: AggLayer is categorically safer if using CDK chains.',
    },
    {
      contextTag: '[Investor, evaluating the AggLayer ecosystem growth]',
      scenario: 'Amara wants to understand how AggLayer growth affects POL token value and the Polygon ecosystem.',
      outcome: 'POL demand from AggLayer: CDK chains connecting to AggLayer must use Polygon\'s infrastructure. Each CDK chain\'s validators must stake POL on Polygon\'s staking layer (similar to AVAX staking for subnets). 10 CDK chains × 10 validators each × 2,000 POL minimum stake = 200,000 POL locked in validation stakes. Additionally: each CDK chain pays POL for AggLayer proof aggregation services (fees to the AggLayer contract, which flow to the Optimism Collective-equivalent Polygon Collective). AggLayer revenue at scale: if 100 CDK chains each process 1M transactions/day, and pay $0.001 per proof aggregation: $100,000/day = $36.5M/year in AggLayer fees. These fees go to Polygon protocol operations, funded in POL. Ecosystem compound effect: more CDK chains → more AggLayer connectivity → more cross-chain composability available → more attractive for new CDK chains to join → more POL staked. Virtuous cycle similar to Ethereum\'s network effect but within the CDK ecosystem.',
    },
  ],

  keyTakeaway: 'AggLayer replaces bridge validator trust with ZK proof cryptography — eliminating the bridge smart contract attack surface that cost the industry $2B+ in 2022 — but is currently limited to Polygon CDK chains, making it a powerful solution within its ecosystem that cannot yet serve cross-ecosystem liquidity unification.',

  guidedPractice: [
    {
      question: 'How does AggLayer\'s "cross-chain conservation law" prevent asset duplication that would undermine cross-chain transfers?',
      options: [
        'AggLayer uses smart contract locks that prevent assets from existing on two chains simultaneously',
        'The ZK proof aggregated by AggLayer includes a mathematical constraint: the total assets burned/locked across all source chains must equal the total assets minted/unlocked across all destination chains. If these don\'t balance, the ZK proof fails and Ethereum rejects the aggregated state update.', // ✓
        'AggLayer uses a centralised oracle to verify that burned assets actually disappeared before allowing minting',
        'Assets on CDK chains use a unique serial number system that prevents the same asset appearing twice',
      ],
      correct: 1,
      hint: 'ZK proofs can encode arbitrary mathematical constraints. What constraint prevents "print money from nothing" in the cross-chain context?',
      explanation: 'Conservation constraint in ZK circuits: the AggLayer\'s ZK circuit includes a balance constraint across all state transitions in a batch. For all assets of type X: Σ(minted on all chains) = Σ(burned on all chains). This is a zero-sum constraint — every unit created on a destination chain must correspond to exactly one unit destroyed on a source chain. If a malicious chain operator tried to submit a state transition that mints 1,000 USDC without a corresponding burn on another chain, the ZK proof would fail to satisfy the conservation constraint — the prover cannot generate a valid proof for an invalid state transition. Ethereum\'s verification of the aggregated proof is the enforcement mechanism. The conservation law is not a smart contract rule (hackable) but a mathematical constraint in the proof system (not hackable without breaking the underlying cryptography).',
    },
    {
      question: 'What is the fundamental difference between the security assumption of AggLayer vs a conventional bridge validator set?',
      options: [
        'AggLayer requires more validators than conventional bridges, making it more decentralised',
        'Conventional bridges require trusting a set of validators (humans who could be compromised, coerced, or malicious). AggLayer requires trusting the mathematical soundness of ZK cryptography (PLONK proof system) — a hardened assumption that no one knows how to break efficiently. Human trust vs cryptographic trust.', // ✓
        'AggLayer is less secure because it relies on Ethereum\'s validator set rather than dedicated bridge validators',
        'Both have equivalent security — bridges just express the security as validator signatures while AggLayer uses proofs',
      ],
      correct: 1,
      hint: 'Can you bribe a mathematical proof? Can you bribe a validator?',
      explanation: 'Trust assumption comparison: conventional bridge (Wormhole, Hop): security relies on N validators being non-colluding and having secure key management. Each validator is a human-operated server with a private key. Attack vectors: compromise validator keys (Ronin: 5 keys compromised via social engineering), exploit the validator key management system, corrupt a sufficient number of validators through bribery or legal coercion. These are all practical attack vectors. AggLayer (ZK-based): security relies on PLONK being a computationally sound proof system — meaning no efficiently computable algorithm can generate a valid PLONK proof for an invalid statement. This is a hardened cryptographic assumption backed by decades of mathematics research. Attack vectors: break PLONK (requires solving mathematical problems believed to be computationally infeasible), exploit bugs in the proof verification contract (one smart contract, auditable). The second category is practical risk (smart contract bugs exist); the first is theoretical (no known efficient PLONK break). AggLayer trades "trust humans" for "trust math" — a categorically more robust security model.',
    },
    {
      question: 'A chain wants to connect to AggLayer but uses Arbitrum\'s Nitro rollup technology rather than Polygon CDK. What is the obstacle?',
      options: [
        'Arbitrum chains can connect to AggLayer after paying a one-time integration fee to Polygon',
        'AggLayer requires connected chains to generate ZK proofs in Polygon\'s proof format (PLONK-based, using Polygon\'s specific circuit architecture). Arbitrum Nitro uses a different proof system (fraud proofs for Arbitrum, or STARK-based proofs for Arbitrum Nova). AggLayer cannot aggregate incompatible proof formats — the chain must be rebuilt using Polygon CDK to connect.', // ✓
        'Arbitrum chains are blocked from AggLayer by Ethereum\'s smart contract rules that prevent multi-proof systems',
        'AggLayer only supports chains that launched after AggLayer — existing chains like Arbitrum cannot retroactively connect',
      ],
      correct: 1,
      hint: 'AggLayer aggregates ZK proofs. What happens when you try to aggregate a proof from a completely different proof system?',
      explanation: 'Proof system compatibility: ZK proof systems are not interchangeable. A PLONK circuit generates proofs in a specific format that is verified by a specific PLONK verifier. A STARK-based circuit generates differently structured proofs. The AggLayer\'s aggregation circuit is specifically designed to recursively compose PLONK proofs (using PLONK\'s recursive composition capability) — it cannot aggregate STARK proofs or fraud proof attestations without being fundamentally redesigned. This is the core limitation of AggLayer v1: it is an intra-ecosystem solution for Polygon CDK chains. The long-term vision: ZK proof standards and aggregation layers that can compose proofs from different systems (similar to how USB-C can handle different devices). This is technically possible but requires significant standardisation work. In 2024, Polygon CDK is the only on-ramp to AggLayer connectivity.',
    },
    {
      question: 'Why does AggLayer specifically eliminate the bridge smart contract attack surface that caused the 2022 bridge hacks?',
      options: [
        'AggLayer uses more complex smart contracts than conventional bridges, making them harder to hack',
        'Conventional bridges hold user assets in smart contracts that can be exploited by forging cross-chain messages. AggLayer eliminates this: assets are locked or burned on the source CDK chain (secured by that chain\'s ZK proofs) and minted on the destination chain only when the ZK proof is verified by Ethereum. No centralised asset pool is held in a bridge contract.', // ✓
        'AggLayer requires all assets to be wrapped in a special token format that is hack-resistant',
        'AggLayer replaces bridge smart contracts with oracle-verified transfers that are monitored for exploits in real time',
      ],
      correct: 1,
      hint: 'Where were the $625M in Ronin and $320M in Wormhole hack proceeds held before being stolen? Does AggLayer have that same storage location?',
      explanation: 'Bridge attack surface anatomy: conventional bridges maintain a pool of assets on the source chain that represents all assets that have been bridged. Ronin bridge: held 173,600 ETH and 25.5M USDC in one smart contract address. Wormhole: held $320M in wrapped assets. These centralised pools are the high-value target that attackers pursue by forging messages that allow them to withdraw the pool\'s assets. AggLayer: no pool. When Alice moves 1,000 USDC from Chain A to Chain B, the 1,000 USDC is not held anywhere — it is burned (destroyed) on Chain A and minted (created) on Chain B. The ZK proof verifies the conservation. There is no "bridge wallet" holding $320M that can be drained by forging a message. The only smart contract involved is the AggLayer verifier on Ethereum — which contains no user assets, only the verification logic. An exploit of the AggLayer verifier could potentially break the proof verification, but would not directly give the attacker access to user funds (those are on the CDK chains).',
    },
    {
      question: 'As more CDK chains connect to AggLayer, what specific benefit do all previously connected chains gain?',
      options: [
        'Each new chain connection increases the transaction speed for existing chains because of shared validation',
        'Each new CDK chain connection expands the unified liquidity and composability space available to all connected chains — a new CDK chain with $500M in gaming assets provides new collateral types and liquidity sources that all existing CDK chains can access natively through AggLayer cross-chain operations.', // ✓
        'New chain connections reduce gas fees for all existing chains by distributing the AggLayer proof costs',
        'The benefit is only to the new chain — existing chains gain nothing from additional connections',
      ],
      correct: 1,
      hint: 'If 5 CDK chains each have $100M in unique assets, and they all connect to AggLayer, what can a user on any single chain access?',
      explanation: 'Network effect of AggLayer connectivity: with 2 CDK chains connected, each can access the other\'s liquidity. With 10 CDK chains connected, each can access 9 others\' liquidity — not 2×, but 5× improvement. The mathematical structure: each new chain adds N-1 new cross-chain connections (where N is the current total). This creates superlinear growth in total composable liquidity. Example: 5 CDK chains each with $100M TVL, all connected via AggLayer. A DeFi user on Chain A has access to: $100M on Chain A + $400M across B, C, D, E. For collateral purposes: $500M total accessible liquidity. With 20 CDK chains: the same user has access to $2B total AggLayer-connected liquidity, with all cross-chain operations verified by ZK proofs and settled on Ethereum. This network effect is the strategic moat Polygon is building — each new CDK chain makes the entire AggLayer ecosystem more valuable for all participants.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 229 — Multi-Chain OPSEC and Portfolio Tracking
// ─────────────────────────────────────────────────────────────────────────────

const L229: IslandLevel = {
  id: 229, mechanic: 'trait', tier: 'pro',
  topic: 'Multi-Chain OPSEC and Portfolio Tracking',

  explanation: `
In 2023, a DeFi researcher with $2M spread across 8 chains realised they had no accurate picture of their total net worth. Their portfolio tracking spreadsheet was 3 weeks out of date. They had approved token spending to 47 different smart contracts — some deployed months ago with no memory of what they were for. Two of those approvals were to contracts that had since been flagged as malicious by GoPlus Security. The attack surface of the multi-chain portfolio had grown invisibly.

Multi-chain portfolio management requires systematic tracking across three dimensions: position tracking, approval management, and OPSEC hygiene.

Position tracking tools: DeBank (free, tracks positions across 40+ chains including LP positions, lending positions, staking), Zapper (similar scope, stronger data visualisation), Zerion (portfolio tracking with DeFi position details). For tax purposes: Koinly and CoinTracker import transaction history from all major chains and calculate cost basis automatically.

Approval management: every time you interact with a DeFi protocol, you approve it to spend your tokens. These approvals persist indefinitely unless revoked. Over time, a multi-chain user accumulates dozens of active approvals — each a potential attack surface if the approved contract is later exploited or upgraded maliciously. Tools: revoke.cash (batch approval revocation), Etherscan Token Approval Checker (Ethereum only), Unrekt.net (multi-chain). Best practice: audit approvals quarterly. Revoke any approval to contracts you no longer actively use.

Multi-chain OPSEC architecture: separate wallets for different purposes and risk levels. Hot wallet (daily DeFi): small balance, many protocol interactions, highest approval surface. Cold wallet (savings): hardware wallet, minimal DeFi interaction, no browser wallet connection. Research wallet: connects to new protocols, receives airdrops — completely isolated from main holdings. Monitoring: set Etherscan alerts (and chain-specific equivalents) for any transaction from your wallets. Zerion and DeBank send mobile notifications. Consider Tenderly or Forta for advanced monitoring.

Cross-chain emergency checklist: if one wallet is compromised, you need to immediately know: which other wallets are linked (funded from same source?), which approvals are active on all chains, which protocols hold funds. Having this documented beforehand — not during an incident — is the difference between a contained loss and a total loss.
  `.trim(),

  fact: 'Multi-chain tracking tools: DeBank, Zapper, Zerion (position tracking), Koinly/CoinTracker (tax). Approval management: revoke.cash, Etherscan Token Approvals (audit quarterly, revoke unused). Wallet segmentation: hot (DeFi, small balance), cold (savings, hardware), research (new protocols, isolated). Emergency checklist: pre-document which wallets are linked, all active approvals, all protocol positions.',
  plain: 'Tracking a multi-chain portfolio requires tools (DeBank, Zapper) because manual tracking becomes impossible at 5+ chains. Token approvals are a hidden attack surface — every protocol you\'ve ever approved can still drain your tokens unless you revoke. Revoke.cash shows all approvals across chains so you can clean them up. Best practice: separate wallets for daily DeFi (small, many approvals), savings (hardware, minimal activity), and testing new protocols (isolated from everything).',
  stars: [760, 920, 1150], target: 1150, coins: 40,
  simulatorLesson: 'approvalRevoke',

  examples: [
    {
      contextTag: '[Portfolio manager, quarterly security audit]',
      scenario: 'Amara runs her quarterly security audit of her multi-chain portfolio. She uses DeBank to check positions and revoke.cash to audit approvals. Walk through her process.',
      outcome: 'Quarterly audit workflow: Step 1 (DeBank position inventory): open DeBank, enter main wallet. Record: current position on each chain (protocol, asset, value), staking positions, LP positions, any borrowing positions (health factors). Export to spreadsheet. Step 2 (revoke.cash approval audit): connect wallet to revoke.cash. Switch through chains (Ethereum, Arbitrum, Base, Optimism). For each chain: list all active approvals sorted by last interaction date. Flag any approval older than 6 months where the protocol is not actively used. Flag any approval with infinite (MAX_UINT256) spend limit. Step 3 (Revocation): revoke all flagged approvals. Prioritise any approvals to contracts GoPlus flags as suspicious. Cost: approximately $30 in gas across 4 chains to revoke 12 old approvals. Step 4 (Documentation update): update emergency checklist with current wallet balances, active approvals, and protocol positions. Time investment: 2 hours, quarterly. Risk reduction: eliminated 12 potential attack vectors.',
    },
    {
      contextTag: '[Security incident, applying wallet segmentation]',
      scenario: 'Marcus\'s research wallet (used for testing new protocols) is drained of $800 — its entire balance. He investigates. The compromise was via a malicious NFT contract he approved 3 months ago. He assesses the damage to his overall portfolio.',
      outcome: 'Damage assessment: Research wallet: $800 lost (entire balance of the research wallet — by design). Main hot wallet: not connected to the exploited contract. Not compromised. Cold wallet (Ledger): never connected to any DApp. Not compromised. The wallet segmentation worked: the attacker exploited an approval on the research wallet. The research wallet had no connection to Marcus\'s main holdings — different seed phrase, never funded from the main wallet directly. The maximum loss was bounded by the research wallet\'s designed balance ($800). If Marcus had used one wallet for both research and main DeFi: the same approval could have drained $200,000+ in main holdings. The $800 is a painful lesson but not a catastrophic loss. Marcus: revokes all remaining approvals on the research wallet, creates a new research wallet with fresh seed, resumes testing with a new $500 budget.',
    },
    {
      contextTag: '[Tax preparer, organising multi-chain transaction history]',
      scenario: 'Priya needs to prepare her crypto taxes. She has transacted on 6 chains over the past year: 847 total transactions. She has never tracked cost basis. She evaluates Koinly vs manual tracking.',
      outcome: 'Koinly integration process: (1) Connect wallet addresses for all 6 chains. Koinly imports transaction history automatically from on-chain data. (2) Koinly categorises transactions: swap (disposal + acquisition), LP provision (disposal), staking reward (income), bridge (neutral). (3) Review and correct miscategorised transactions — DeFi-specific events (LP provision, yield harvest) may require manual labelling. (4) Koinly applies cost basis methods (FIFO, LIFO, specific identification — jurisdiction-dependent). (5) Export tax report (Form 8949 for US, HMRC format for UK, capital gains summary for others). Manual alternative: with 847 transactions across 6 chains, manual tracking would require 80-120 hours of work. Koinly automates 85% of this. Remaining 15%: reviewing miscategorised transactions, particularly DeFi-specific events that Koinly\'s algorithm doesn\'t always identify correctly. Koinly cost: $179/year for unlimited transactions. ROI: ~80 hours of work saved.',
    },
  ],

  keyTakeaway: 'Multi-chain portfolios require systematic quarterly audits covering position tracking (DeBank/Zapper), approval management (revoke.cash — revoke anything unused), and wallet segmentation (hot/cold/research isolation) — the invisible accumulation of stale approvals and undocumented positions is the most common security failure mode for experienced multi-chain DeFi users.',

  guidedPractice: [
    {
      question: 'Why do token approvals persist as a security risk even after you stop using a protocol?',
      options: [
        'Approvals automatically expire after 30 days of inactivity on most chains',
        'ERC-20 approvals are permanent on-chain until explicitly revoked. If you approved Uniswap for unlimited USDC spend 18 months ago and stop using Uniswap, that approval remains active indefinitely. If Uniswap\'s contract is later exploited or upgraded with malicious logic, the attacker can use your old approval to drain your USDC without any further action from you.', // ✓
        'Token approvals only apply to the specific transaction they were created for',
        'Protocols automatically revoke approvals when you disconnect your wallet from their UI',
      ],
      correct: 1,
      hint: 'What is the difference between an approval transaction (which creates the permission) and the spending of that permission (a separate later transaction)?',
      explanation: 'Approval persistence mechanics: ERC-20 approve(spender, amount) creates an on-chain allowance stored in the token contract. The allowance remains until: (1) You submit a revoke transaction (approve(spender, 0)), (2) The approved spender spends exactly the approved amount (exhausting the allowance). For unlimited approvals (MAX_UINT256 = 2^256 - 1), condition 2 never occurs practically. This means: every DeFi interaction you\'ve ever done with an approval still has that approval active unless you explicitly revoked it. A user who has interacted with 30 protocols over 3 years has 30+ active approvals across chains. Each approval is a standing permission for that contract to spend your tokens. If any of those 30 protocols are later exploited, upgraded maliciously, or acquired by bad actors, they can use your still-active approval to drain your tokens instantly.',
    },
    {
      question: 'What is the key operational advantage of using a separate "research wallet" for testing new protocols?',
      options: [
        'Research wallets receive better yields than main wallets because they are seen as long-term capital',
        'Compromise of the research wallet is bounded to the research wallet\'s balance — exploits, malicious approvals, and drainer contracts only access what is in the research wallet. Your main holdings (in separate wallets with different seed phrases) are completely unaffected regardless of what happens to the research wallet.', // ✓
        'Research wallets are exempt from tax reporting because they are used for experimental purposes',
        'Protocol teams give lower fees to research wallets to incentivise testing of their new features',
      ],
      correct: 1,
      hint: 'If the research wallet is compromised by a malicious contract, what can the attacker access? What can they not access?',
      explanation: 'Isolation architecture: wallets are isolated by their seed phrases (or private keys). A separate research wallet has a completely different seed phrase from your main wallet. The seed phrase controls all access — nothing on one wallet can compromise another wallet unless the attacker learns the second wallet\'s seed phrase or private key. If a malicious protocol drains your research wallet: they gained access to the research wallet\'s private key (or used an approval to drain funds). But the main wallet\'s seed phrase was never involved in the research wallet\'s transactions. The attacker has no path from "research wallet approval" to "main wallet access." Maximum loss = research wallet balance (designed to be small: $500-$2,000 for most research purposes). The $800 Marcus lost in the example is a bounded loss by design — a cost of exploration, not a catastrophic compromise.',
    },
    {
      question: 'DeBank shows your portfolio across 7 chains. You have a borrowing position on Chain D with a health factor of 1.08. What is the priority action?',
      options: [
        'Nothing — 1.08 health factor is above the liquidation threshold of 1.0',
        'Immediately add collateral or repay debt to bring the health factor to 1.5+. A health factor of 1.08 is dangerously close to the liquidation threshold — a 7.4% adverse price move in the collateral assets will trigger automatic liquidation. This risk exists across chains without manual monitoring.', // ✓
        'Switch DeBank to a different chain — the 1.08 reading is a DeBank display error',
        'Close the position entirely — any health factor below 1.5 means the position should be unwound',
      ],
      correct: 1,
      hint: 'At what health factor does liquidation trigger? How much price movement separates 1.08 from the liquidation trigger?',
      explanation: 'Health factor emergency: lending protocols liquidate when health factor ≤ 1.0 (where health factor = collateral value × liquidation threshold / debt value). At 1.08: liquidation triggers if collateral value drops by approximately (1 - 1/1.08) = 7.4%. For volatile collateral (ETH, BTC): a 7.4% price drop can happen in minutes during market volatility. Actions ranked by urgency: (1) Add collateral immediately (fastest — no new transaction complexity). (2) Repay partial debt (reduces debt, raises health factor). (3) Set automated monitoring alert at health factor 1.3 to catch issues before they become critical. The cross-chain context: without DeBank or similar tools, you might not notice a health factor deterioration on Chain D while managing positions on other chains. This is precisely why multi-chain portfolio dashboards are not optional for users with lending positions — liquidation happens automatically regardless of whether you\'re watching.',
    },
    {
      question: 'You are setting up Koinly for the first time and import 3 years of transactions. Koinly marks 200 transactions as "uncategorised." What should you prioritise reviewing first?',
      options: [
        'Review them in chronological order — oldest transactions first for proper cost basis ordering',
        'Prioritise transactions with the largest USD values and those marked as potential disposal events (swaps, LP additions, withdrawals) — these have the largest tax impact. DeFi-specific events (LP provision, yield harvesting, protocol deposits) are commonly miscategorised and require manual review.', // ✓
        'Ignore uncategorised transactions under $100 — the tax impact is too small to matter',
        'Delete uncategorised transactions — they likely represent failed transactions with no tax impact',
      ],
      correct: 1,
      hint: 'Which types of transactions create the largest taxable events? Which types does Koinly most commonly miscategorise?',
      explanation: 'Tax review prioritisation: impact × frequency. Highest impact miscategorisations: (1) LP provision (Koinly may classify as internal transfer, missing the disposal of underlying tokens). (2) Yield farming harvest (may not recognise as income if harvested to a complex aggregator contract). (3) Cross-chain bridges (should be neutral; if Koinly marks as disposal, creates false gains/losses). (4) Protocol deposits (should be neutral; if marked as disposal, overstates gains). Why DeFi is complex for Koinly: DeFi interactions involve non-standard contract calls that don\'t match simple "send/receive" patterns. Koinly\'s algorithm identifies standard swaps correctly but struggles with multi-step DeFi transactions. The $100 threshold advice (option 3) is wrong: even small transactions accumulate. 100 × $50 = $5,000 in income from small yields that must be reported. Always review the full uncategorised list, sorting by absolute USD value to tackle the highest-impact items first.',
    },
    {
      question: 'Your multi-chain emergency checklist should include which specific information to enable rapid response to a compromise?',
      options: [
        'Your seed phrases, stored digitally for quick access during an emergency',
        'Wallet addresses for all your wallets (not seed phrases — never digitally store seed phrases), the current list of active approvals for each chain, the protocols holding your funds with approximate balances, and the contact information for exchanges where you have accounts (for reporting stolen funds).', // ✓
        'Your exchange login credentials in case you need to quickly sell all assets',
        'The IP addresses of the blockchain RPC nodes you use for transaction submission',
      ],
      correct: 1,
      hint: 'In an emergency, what information do you need to quickly understand your attack surface and know what to protect?',
      explanation: 'Emergency checklist contents: During a compromise, you need to act in seconds to limit damage. You need: (1) Wallet addresses: to check which wallets are active, which have funds, which are connected to compromised infrastructure. NOT seed phrases — if this checklist is itself compromised, you don\'t want seed phrases on it. (2) Active approvals per chain: to know what to revoke immediately. The fastest action is often revoking approvals — without this list, you must manually query each chain. (3) Protocol positions: to know where funds are and whether they can be moved quickly. A lending position with 1.5 health factor can stay; a lending position with 1.1 health factor needs immediate attention. (4) Exchange contacts: if stolen funds hit a CEX deposit address, the faster you contact the exchange\'s security team, the higher the freeze probability. Critically absent from the checklist: seed phrases (security risk), private keys (same), any data that if stolen would itself enable a larger theft.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 230 — Future Chain Landscape
// ─────────────────────────────────────────────────────────────────────────────

const L230: IslandLevel = {
  id: 230, mechanic: 'match3', tier: 'pro',
  topic: 'Future Chain Landscape — Where Alt-Chains Go From Here',

  explanation: `
In 2024, Ethereum processed a combined 5 million transactions per day across mainnet and all L2s. In 2030, projections suggest 500 million per day if adoption continues its historical growth trajectory. No current blockchain architecture handles 500 million transactions per day with adequate decentralisation. The future chain landscape requires innovations that are still in early research or early deployment.

Key trends shaping the 2025-2030 chain landscape:

ZK proof generation commoditisation: in 2024, generating a ZK proof for a batch of 1,000 transactions takes 10-30 minutes and requires specialised hardware. By 2027-2028, improvements in proof generation algorithms and purpose-built ZK hardware (similar to how Bitcoin mining moved to ASICs) are expected to reduce proof generation time to seconds. This makes real-time ZK proof generation economically viable for every transaction batch — potentially enabling ZK rollups to be as responsive as optimistic rollups while maintaining their security advantages.

Shared sequencers: currently, each L2 chain has its own sequencer that orders transactions. Shared sequencers (Espresso Systems, Astria) allow multiple L2s to use the same sequencer infrastructure, enabling atomic cross-L2 transactions: a transaction that simultaneously updates state on Arbitrum and Base in the same block, guaranteed to succeed or fail together. This enables cross-L2 composability that is currently impossible.

Decentralised sequencers: current L2 sequencers are centralised (one entity orders transactions). Decentralised sequencer designs (Arbitrum BOLD, Optimism\'s proposed decentralisation, Espresso) distribute ordering across multiple parties — reducing censorship risk and single-point-of-failure vulnerability.

Modular blockchain stacks: chains increasingly specialise in one layer (execution, settlement, data availability, consensus) and compose with other specialised layers. Celestia provides data availability as a service. EigenDA provides DA using restaked ETH. This modular approach allows chain designers to optimise each component independently — the opposite of monolithic L1 design.

Interoperability standards: EIP-7683 (cross-chain intents standard), Chainlink CCIP (Cross-Chain Interoperability Protocol), LayerZero v2, and IBC adaptations for EVM all aim to standardise how chains communicate — potentially enabling a future where cross-chain interactions are as simple as same-chain interactions.
  `.trim(),

  fact: 'Near-future chain landscape (2025-2028): ZK proof commoditisation (proof generation dropping from minutes to seconds), shared sequencers (atomic cross-L2 transactions via Espresso/Astria), decentralised sequencers (BOLD, reduced censorship risk), modular stacks (Celestia/EigenDA for data availability), interoperability standards (EIP-7683, CCIP, LayerZero v2).',
  plain: 'The next 3-5 years: ZK proofs will become fast enough to use for every transaction (not just batches). Multiple L2 chains will share infrastructure so a single transaction can update two chains at once. Each chain will specialise in one job (data storage, computation, settlement) rather than doing everything. Cross-chain transactions will eventually feel as easy as same-chain transactions. This isn\'t speculation — specific teams are building each piece today.',
  stars: [780, 950, 1180], target: 1180, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Developer, evaluating shared sequencer for cross-L2 app]',
      scenario: 'Marcus is building a trading app where users can place orders on both Arbitrum (for deep DeFi liquidity) and Base (for Coinbase user access). He wants orders to be atomically filled across both chains. He evaluates Espresso shared sequencer.',
      outcome: 'Current problem: a user places limit orders on both Arbitrum Camelot and Base Aerodrome for the same trade. The orders are on different chains — if one fills, the other may not fill simultaneously, leaving the user partially executed with unhedged exposure. Espresso shared sequencer solution: both Arbitrum and Base use Espresso as their sequencer. When Marcus\'s app submits the two-chain order, Espresso includes both sides in the same sequencing batch — guaranteed atomic execution. Either both fill in the same batch or neither fills. Cross-L2 atomic composability. Current status: Espresso is in testnet (2024) with mainnet integration planned for 2025. Arbitrum and Base both using Espresso simultaneously is a further coordination challenge — each L2 must adopt the same shared sequencer.',
    },
    {
      contextTag: '[Data analyst, evaluating Celestia vs Ethereum for data availability]',
      scenario: 'Amara is building a new L2 rollup and choosing her data availability (DA) layer. She compares: Ethereum DA (post-EIP-4844 blobs), Celestia (dedicated DA chain), and EigenDA (restaked ETH DA). Her priorities: cost and throughput.',
      outcome: 'Ethereum blob DA: $0.01-0.10 per blob (128KB) post-EIP-4844. Limited to 3-6 blobs per block. Cost at capacity: $0.00001-0.001 per transaction. Throughput ceiling: ~1MB/minute of data availability. Celestia: $0.001-0.01 per blob. No hard limit per block (Celestia scales its own capacity). Cost advantage: 10-100× cheaper than Ethereum DA. Throughput: currently higher than Ethereum blobs. Trade-off: Celestia has its own security assumptions (Celestia validator set, $1.5B staked TIA). EigenDA: uses restaked ETH security. $0.001-0.01 per blob. Security inherited from Ethereum via EigenLayer restaking. Availability guarantee: slashing conditions on restakers who don\'t store data. Amara\'s decision: for a new chain prioritising cost and throughput with some security compromise accepted: Celestia. For a chain where Ethereum security inheritance is paramount: EigenDA or Ethereum blobs. For the highest throughput at lowest cost: Celestia wins in 2024.',
    },
    {
      contextTag: '[Infrastructure investor, evaluating LayerZero v2]',
      scenario: 'Priya is evaluating whether to invest in protocols built on LayerZero v2 as an infrastructure bet on cross-chain interoperability becoming mainstream.',
      outcome: 'LayerZero v2 analysis: LayerZero is a messaging protocol that allows smart contracts on one chain to send verified messages to smart contracts on another chain. v2 specifically introduced "DVN" (Decentralised Verifier Networks) — configurable security where each application chooses its own message verification threshold. Investment thesis: if cross-chain applications become mainstream (requiring LayerZero messaging), LayerZero\'s token (ZRO) earns fees per message. At current volumes: limited revenue. At 10× message volume: meaningful revenue. Risks: (1) Competing standards (CCIP, IBC, AggLayer) may win the interoperability race. (2) If Superchain/AggLayer make OP Stack cross-chain communication native, the need for LayerZero on those chains decreases. (3) LayerZero\'s DVN security model places trust in the application developer\'s verifier configuration — a misconfigured DVN creates bridge risk. Assessment: LayerZero is a high-potential infrastructure bet with significant standard-competition risk. Appropriate for 2-3% portfolio allocation as a cross-chain thesis hedge.',
    },
  ],

  keyTakeaway: 'The 2025-2030 chain landscape will be shaped by ZK proof speed improvements (enabling real-time ZK proofs), shared sequencers (enabling atomic cross-L2 transactions), modular data availability (Celestia, EigenDA), and emerging interoperability standards — each solving a current limitation that makes the multi-chain UX expensive and complex for users.',

  guidedPractice: [
    {
      question: 'Why would faster ZK proof generation (from 30 minutes to under 1 second) significantly change the competitive landscape between ZK rollups and optimistic rollups?',
      options: [
        'Faster ZK proofs would allow ZK rollups to process more transactions per second than optimistic rollups',
        'The 30-minute proof generation time makes ZK rollups effectively slower to finality than optimistic rollups (which have immediate "soft" finality for most uses). At sub-1-second proof generation, ZK rollups gain hard Ethereum finality in near-real-time — combining optimistic-rollup\'s UX speed with ZK\'s mathematical security, eliminating optimistic rollups\' only remaining advantage.', // ✓
        'Faster proofs would reduce gas costs for ZK rollup verification on Ethereum, making them cheaper than optimistic rollups',
        'The speed improvement only matters for private transactions — public ZK rollup transactions are already fast enough',
      ],
      correct: 1,
      hint: 'What does an optimistic rollup have that a ZK rollup currently lacks in terms of user-visible speed? What happens if ZK proof generation becomes instant?',
      explanation: 'Current UX comparison: Optimistic rollup (Arbitrum, Base): transactions have "soft finality" in seconds (the sequencer confirms inclusion quickly). Users can transact freely. The 7-day withdrawal window is for security — but for most in-chain DeFi activity, the soft finality is sufficient. ZK rollup (zkSync, Scroll): transactions must wait for a ZK proof to be generated and verified before they can be considered final. Currently: 10-30 minutes. Users must wait for proof generation before certain operations are available. With sub-1-second ZK proofs: ZK finality is as fast as optimistic rollup soft finality, but with the mathematical security guarantee of ZK proofs (no 7-day fraud window needed). The UX becomes identical; the security is categorically superior for ZK rollups. This is the roadmap moment when ZK rollups become the default and optimistic rollups lose their primary competitive advantage (immediate UX while waiting for ZK proofs to generate).',
    },
    {
      question: 'What is the fundamental innovation of shared sequencers (Espresso, Astria) and why don\'t current L2s provide this?',
      options: [
        'Shared sequencers reduce transaction fees by processing transactions more efficiently than individual L2 sequencers',
        'Shared sequencers allow multiple L2s to use the same transaction ordering service, enabling atomic cross-L2 transactions — state updates on multiple L2s guaranteed to succeed or fail together in the same sequencing batch. Current L2s each have independent sequencers that cannot coordinate atomic state across chains.', // ✓
        'Shared sequencers eliminate the need for bridges by routing transactions through a central hub',
        'Shared sequencers provide faster block times because they combine the processing power of multiple L2s',
      ],
      correct: 1,
      hint: 'What coordination is required for a transaction to atomically update two separate chains simultaneously? What prevents this with today\'s architecture?',
      explanation: 'Atomicity problem: a transaction is "atomic" if it either fully succeeds or fully fails with no partial state. On one chain: easy — all operations in a transaction are atomic by definition. Across two chains: requires that the sequencer for Chain A and the sequencer for Chain B agree to include the cross-chain transaction in the same "batch moment." With independent sequencers: Chain A\'s sequencer processes Chain A transactions; Chain B\'s sequencer processes Chain B transactions independently. There is no coordination layer that can say "include this transaction on A and that transaction on B simultaneously." Result: cross-chain operations are non-atomic — the Chain A side might succeed while Chain B fails (or vice versa), leaving the user in an inconsistent state. Shared sequencer solution: one entity (Espresso, Astria) orders transactions for both Chain A and Chain B. It can include "Transaction set X: update A and B simultaneously" as an atomic batch. If A fails, B reverts. Cross-L2 composability as a first-class feature.',
    },
    {
      question: 'Celestia provides "data availability" as a separate service. What does data availability mean and why is it critical for rollup security?',
      options: [
        'Data availability means making blockchain data available to users for download — essentially a blockchain storage service',
        'Data availability guarantees that the data underlying a rollup\'s state transition has been published and verifiable by anyone who wants to check it. Without data availability guarantees, a rollup operator could post a valid ZK proof for a batch but withhold the actual transaction data — preventing anyone from proving fraud or reconstructing the state.', // ✓
        'Data availability is Celestia\'s term for transaction throughput — higher DA means faster transactions',
        'Data availability provides backup copies of blockchain data in case of validator failures',
      ],
      correct: 1,
      hint: 'What is the difference between a valid ZK proof (math checks out) and the underlying transaction data being accessible? Why does it matter if the data is hidden?',
      explanation: 'Data availability (DA) definition: DA is the guarantee that transaction data is available to anyone who requests it, not just the proof of its validity. The rollup security gap: a ZK proof verifies the computation is correct given the inputs. But if the inputs (the actual transactions) are hidden by the operator, no one can: (1) Verify what transactions were actually included. (2) Reconstruct the current state from scratch. (3) Detect if the operator is excluding or censoring transactions. Even a valid ZK proof can accompany withheld data — the math checks out but no one can see what was proved. Solution: the transaction data must be published somewhere publicly accessible. Options: Ethereum blobs (expensive but maximally secure), Celestia (cheaper dedicated DA layer with its own security), EigenDA (cheaper, uses restaked ETH security). Without DA, a valid proof is necessary but not sufficient for rollup security. With DA, validators (or any full node) can reconstruct the complete state from the published transaction data and verify correctness independently.',
    },
    {
      question: 'EIP-7683 defines a cross-chain intents standard. How does a standardised intent format improve the cross-chain user experience?',
      options: [
        'EIP-7683 reduces gas fees by compressing cross-chain messages into a smaller format',
        'A standardised intent format allows any EIP-7683-compatible solver to fill orders on any compatible chain — users sign one intent describing what they want (e.g., "swap 1 ETH for at least 3,000 USDC on any chain within 30 minutes"), and solvers across the ecosystem compete to fill it optimally without the user specifying bridge routes or destination chains.', // ✓
        'EIP-7683 makes cross-chain transactions faster by reserving block space on destination chains',
        'The standard requires all chains to share the same mempool, enabling instant cross-chain awareness',
      ],
      correct: 1,
      hint: 'What does a "standard" enable that proprietary formats don\'t? How does solver competition in a unified standard market benefit users?',
      explanation: 'Standard vs proprietary: UniswapX uses its own intent format; 1inch Fusion uses its own. A solver for UniswapX cannot fill 1inch Fusion orders — fragmented liquidity across competing solver networks. EIP-7683 proposes: one standard intent format that all protocols accept. A solver who integrates EIP-7683 can fill orders from UniswapX, 1inch Fusion, and any other compatible DEX simultaneously. User experience improvement: (1) More solvers compete for your order (better price discovery). (2) You don\'t choose which DEX or bridge — the solver competition selects the best route. (3) Cross-chain is implicit — you specify "1 ETH → 3,000 USDC anywhere" and the solver finds the best execution venue across all chains. (4) New chains automatically become accessible — any chain that adopts EIP-7683 is instantly available to all EIP-7683 solvers. Standardisation creates network effects: more users → more solvers competitive → better prices → more users.',
    },
    {
      question: 'Modular blockchain design separates execution, settlement, data availability, and consensus into specialised layers. What is the primary benefit of this approach over monolithic L1 design?',
      options: [
        'Modular chains are simpler to develop because each team only needs to build one component',
        'Each layer can be independently optimised for its specific function — a DA layer optimised purely for cheap large-scale data storage, an execution layer optimised for smart contract throughput, and a settlement layer optimised for maximum security. No single design choice compromises all layers simultaneously.', // ✓
        'Modular chains eliminate the need for validators by distributing each function to different service providers',
        'Modular design allows chain operators to turn off layers they don\'t need, reducing operational costs',
      ],
      correct: 1,
      hint: 'A monolithic L1 must trade-off between DA cost, execution speed, and security simultaneously. What does separating these layers allow?',
      explanation: 'Monolithic trade-off problem: Ethereum\'s base layer must simultaneously provide execution (process smart contracts), settlement (provide finality), data availability (store transaction data), and consensus (agree on ordering). Optimising any one dimension constrains others. Making DA cheaper requires changing the consensus mechanism (which affects security). Increasing execution speed requires changes that affect decentralisation. Everything is coupled. Modular specialisation: Celestia does only DA — it doesn\'t process smart contracts, doesn\'t settle ZK proofs, just stores and makes data available. This single focus allows extreme optimisation: large block sizes that would be dangerous for a monolithic chain (requiring all validators to process everything) are manageable for DA nodes that only need to sample data availability. Similarly, a ZK proof settlement layer (Ethereum) specialises in verifying proofs and providing finality — it doesn\'t need to be cheap for data storage because that\'s Celestia\'s job. Specialisation enables each component to reach near-optimal performance for its specific function.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L219–L230)
// ─────────────────────────────────────────────────────────────────────────────

const ALT_CHAIN_LEVELS_B: Record<number, IslandLevel> = {
  219: L219,
  220: L220,
  221: L221,
  222: L222,
  223: L223,
  224: L224,
  225: L225,
  226: L226,
  227: L227,
  228: L228,
  229: L229,
  230: L230,
};

export { ALT_CHAIN_LEVELS_B };

export const ALT_CHAIN_LEVELS: Record<number, IslandLevel> = {
  ...ALT_CHAIN_LEVELS_A,
  ...ALT_CHAIN_LEVELS_B,
};
