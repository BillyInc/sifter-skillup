// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 3 — STAKING AND DELEGATION · LESSONS 1–3
// Written to sim_instructions_v3 + Lab 11 standard
// Portfolio push: Lab 3 Phase 2 Boss

export const LAB3_LESSONS_1_TO_3 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — Proof-of-Stake and Why It Needs Stakers
// ─────────────────────────────────────────────────────────────
{
  id: 'pos-and-stakers',
  title: 'Proof-of-Stake: The Security Model Behind Staking',
  explanation: `
In December 2021, a group of Ethereum validators was automatically penalised after their signing keys were accidentally duplicated across primary and backup servers. Both servers signed the same block simultaneously. The Ethereum network detected this as an attempt to cheat — it did not matter whether the mistake was intentional. Within hours, those validators had lost portions of their own staked ETH, automatically and irreversibly.

This is the mechanism that secures a proof-of-stake network. Validators must lock up their own tokens before they can participate. If they break the rules — intentionally or not — the protocol destroys a portion of those tokens immediately. You cannot participate without posting something real that you stand to lose.

This mechanism — locking tokens and losing them for misconduct — is called proof-of-stake, abbreviated PoS. The consensus mechanism is what the network uses to agree on which transactions are valid and in what order they happened. Starknet uses PoS via Ethereum, which provides its final security layer. PoS replaces energy-intensive proof-of-work mining with economic stakes.

Validators lock up tokens — this is what staking means — and are then chosen to propose and vote on new transaction blocks in proportion to how much they have staked. Honest validators earn new token rewards. Validators that cheat — by double-signing blocks, as in the December 2021 example — have a portion of their staked tokens automatically destroyed by the protocol. This destruction is called slashing. It is not a fine that can be appealed. It executes in the same block the violation is detected.

Starknet's native staking launched in 2024. Unlike Ethereum's staking (which requires running a full validator node), Starknet allows any STRK holder to participate through delegation pools. A validator runs the infrastructure. Delegators contribute STRK to the validator's pool, share in the rewards, and never need to run any software themselves.

The total annual reward pool is determined by the network's inflation schedule — new STRK minted and distributed as staking rewards. If 500 million STRK is staked and the network emits 50 million STRK per year in rewards, the gross APY is 10%. As more STRK is staked, the APY per token decreases — the same reward pool is shared among more participants.

Understanding this supply/demand dynamic for staking yield is essential. APY is not fixed — it responds to how much total STRK is staked across the network.
  `.trim(),
  visualPrompt: 'Two diagrams: Left — PoS security model showing validator stake locked, block proposal, honest behaviour earning rewards, slashing destroying stake on misconduct. Right — Starknet delegation pool showing validator at top, delegators contributing STRK below, rewards flowing back down with commission deducted.',
  visualType: 'static',
  visualUrl: 'pos-staking-delegation-model',
  examples: [
    {
      contextTag: '[Slashing event, real consequence of validator misconduct]',
      context: 'In Ethereum\'s PoS history, multiple validators have been slashed for double-signing — proposing two conflicting blocks in the same slot, typically due to misconfigured backup nodes running simultaneously.',
      scenario: 'A validator running a backup node alongside their primary node accidentally has both nodes active simultaneously. Both sign a block for the same slot. The Ethereum consensus layer detects the double-signing via a slashing proof submitted by another validator.',
      outcome: 'The validator loses an initial penalty (approximately 1 ETH) plus an additional penalty proportional to how many other validators were slashed around the same time. Their ability to propose blocks is suspended. Delegators who staked with that validator also experience a proportional reduction in their delegated balance. This is why professional validators invest heavily in infrastructure isolation to prevent double-signing.',
    },
    {
      contextTag: '[Starknet delegation, first-time staker]',
      context: 'A STRK holder with 2,000 tokens wants to earn staking rewards without running a validator node. She researches Starknet\'s delegation model.',
      scenario: 'The holder finds a validator pool operated by Nethermind — a professional blockchain infrastructure company — with 8.2% gross APY and 5% commission. She calls wallet.stake(poolAddress, Amount.parse("2000", STRK)) via the SkillUp staking simulator. The SDK automatically detects this is her first entry and calls enter_delegation_pool.',
      outcome: 'The 2,000 STRK is now in the Nethermind pool. Rewards begin accumulating immediately — they accumulate continuously on-chain. Her net APY: 8.2% × (1 - 0.05) = 7.79%. Annual net reward: 2,000 × 7.79% = 155.8 STRK. She never ran any software. She can check her position anytime via wallet.getPoolPosition().',
    },
    {
      contextTag: '[APY dilution, network-wide staking growth]',
      context: 'In Q1 2025, 300 million STRK was staked on Starknet at an average APY of 11%. By Q3 2025, total staked grew to 600 million STRK as more holders discovered staking.',
      scenario: 'The network\'s annual reward emission is fixed at 33 million STRK per year. With 300 million staked: APY = 33M / 300M = 11%. With 600 million staked: APY = 33M / 600M = 5.5%.',
      outcome: 'Early stakers earned 11% while late stakers earn 5.5% — the same total reward pool shared among twice as many tokens. This is not an error or protocol change — it is the natural economic consequence of more participants sharing a fixed reward. Stakers who joined early had a first-mover yield advantage that diminished as the network matured.',
    },
  ],
  keyTakeaway: 'A validator who tries to cheat automatically loses a portion of their own staked tokens — this automatic financial penalty is the mechanism that secures the network without requiring anyone to trust the validators.',
  guidedPractice: [
    {
      question: 'What is slashing and why does it make PoS economically secure?',
      options: [
        'A. Slashing is a fee charged by validators on delegator rewards',
        'B. Slashing is the automatic destruction of a validator\'s staked tokens when they attempt to cheat — making dishonesty directly costly rather than just against the rules',
        'C. Slashing is the process of reducing token supply to control inflation',
        'D. Slashing is when a validator voluntarily exits their stake early',
      ],
      correct: 1,
      hint: 'Think about what makes a deterrent effective. Is it enough to say "cheating is against the rules" or does something tangible need to be lost?',
      explanation: 'B is correct. Slashing makes cheating economically irrational — a validator who attempts to sign conflicting blocks automatically loses a portion of their own staked tokens. The economic loss is the deterrent. Without slashing, a validator might cheat if the potential reward exceeded the reputational cost. With slashing, the financial penalty makes cheating a net-negative outcome regardless of intent.',
    },
    {
      question: 'Starknet has 400M STRK staked and emits 40M STRK per year in rewards. What is the current gross APY? If staking grows to 800M STRK with the same emission, what does APY become?',
      options: [
        'A. Current: 10% APY. At 800M: 5% APY — the fixed reward pool is now shared among twice as many tokens',
        'B. Current: 40% APY. At 800M: 20% APY — calculated incorrectly as reward / stakers',
        'C. APY stays at 10% regardless — the protocol maintains a fixed APY by adjusting emissions',
        'D. Current: 10% APY. At 800M: 10% APY — more staking increases the reward pool proportionally',
      ],
      correct: 0,
      hint: 'APY = annual rewards / total staked. The emission is fixed at 40M STRK. What happens when the denominator doubles?',
      explanation: 'A is correct. Current: 40M / 400M = 10%. At 800M: 40M / 800M = 5%. The reward pool is fixed — more participants means each participant earns a smaller share. This is fundamental to understanding staking yield: it is not a guaranteed rate but an emergent rate from the ratio of emissions to total staked capital.',
    },
    {
      question: 'What is the difference between a validator and a delegator in Starknet staking?',
      options: [
        'A. Validators earn more; delegators earn less — they do the same thing at different rates',
        'B. Validators run the node infrastructure and take a commission; delegators contribute STRK to the validator\'s pool and earn rewards without running any software',
        'C. Validators stake mainnet tokens; delegators stake testnet tokens',
        'D. Validators can unstake immediately; delegators must wait 21 days',
      ],
      correct: 1,
      hint: 'Think about who does the technical work and who provides the economic capital. Both are needed, but they have different roles.',
      explanation: 'B is correct. Validators run the actual node infrastructure — servers, software, uptime monitoring. They take a commission (typically 3–10%) from the rewards their pool generates. Delegators contribute STRK to the pool without running any software, earning their proportional share of rewards minus the validator\'s commission.',
    },
    {
      question: 'A validator is slashed. You have 1,000 STRK delegated to their pool and the slash reduces the pool by 2%. How much STRK do you lose?',
      options: [
        'A. Zero — slashing only affects the validator\'s own stake, not delegators',
        'B. 20 STRK — your 2% proportional share of the slash',
        'C. 1,000 STRK — your entire delegation is at risk',
        'D. The slash percentage multiplied by the validator\'s self-stake only',
      ],
      correct: 1,
      hint: 'Slashing affects the entire pool proportionally. If the pool loses 2% of its value, what happens to each participant\'s share?',
      explanation: 'B is correct. Slashing reduces the total pool value proportionally — every participant in the pool (validator and all delegators) experiences the same percentage loss. A 2% slash on a pool where you have 1,000 STRK costs you 20 STRK. This is validator selection risk — delegators share in the validator\'s operational risks, including infrastructure failures that could cause slashing.',
    },
    {
      question: 'Why does wallet.stake() automatically choose between enter_delegation_pool and add_to_delegation_pool?',
      options: [
        'A. It randomly selects between the two to distribute load',
        'B. It detects whether you are a new pool member (enter) or an existing one (add) — calling the wrong function would fail',
        'C. enter_delegation_pool is for amounts above 1,000 STRK; add_to_delegation_pool is for smaller amounts',
        'D. The SDK always uses enter_delegation_pool for the first transaction of each session',
      ],
      correct: 1,
      hint: 'The staking contract has two different functions for a reason. What is the contract-level difference between joining a pool for the first time vs adding to an existing position?',
      explanation: 'B is correct. The Starknet staking contract treats first-time pool entry differently from adding to an existing position — different function signatures, different internal state updates. Calling the wrong one would revert. wallet.stake() reads your current pool membership status and routes to the correct function automatically, abstracting this complexity from the developer and user.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starknet network data: Total STRK supply: 10,000,000,000. Currently staked: 1,800,000,000 STRK (18% of supply). Annual emission for staking rewards: 162,000,000 STRK. Calculate: (1) current gross staking APY, (2) if staking participation grows to 30% of supply, what does APY become assuming same emission? (3) what is the annual USD value of staking rewards if STRK = $0.80?',
      scoringCriteria: [
        'Current APY: 162,000,000 / 1,800,000,000 = 9%',
        'At 30% staking: 3,000,000,000 STRK staked. APY: 162,000,000 / 3,000,000,000 = 5.4%',
        'Annual USD value at 9% APY: 1,800,000,000 × 9% × $0.80 = $129,600,000 total rewards across all stakers',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You have 50,000 STRK to stake. Validator A: established node operator, 3 years operating, 99.8% uptime, 7% commission, 8.5% APY, self-stake 500,000 STRK. Validator B: launched 2 months ago, no public track record, 1% commission, 10% APY, self-stake 10,000 STRK. Analyse the risk-adjusted yield of each and recommend which to use, explaining the specific risks each commission/APY combination signals.',
      scoringCriteria: [
        'Validator A net APY: 8.5% × (1 - 0.07) = 7.905%. Annual reward: 50,000 × 7.905% = 3,952.5 STRK',
        'Validator B net APY: 10% × (1 - 0.01) = 9.9%. Annual reward: 50,000 × 9.9% = 4,950 STRK',
        'Risk analysis: Validator B\'s low commission (1%) is unsustainable long-term and may indicate a bootstrap strategy that will raise commission later. Low self-stake (10,000 STRK) means the validator has little skin in the game. 2 months of operation is insufficient track record.',
        'Correct recommendation: Validator A — the 997.5 STRK annual difference does not compensate for unknown validator reliability risk with B.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend who understands savings accounts but not crypto asks: "What is staking? Is it safe? Why would a blockchain need my tokens?" Explain in 4 sentences using only analogies from traditional finance. Do not use the words validator, consensus, PoS, or delegation.',
      scoringCriteria: [
        'Staking correctly analogised: like posting a bond or security deposit that earns interest',
        'Safety correctly explained: your tokens can be penalised if the entity you stake with misbehaves — analogous to a guarantor being liable if the borrower defaults',
        'Why blockchain needs tokens: correctly explains the economic security model without technical jargon',
        'Zero unexplained crypto terminology in the response',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Validator Selection Criteria
// ─────────────────────────────────────────────────────────────
{
  id: 'validator-selection',
  title: 'Validator Selection: Choosing Where to Stake',
  explanation: `
In 2008, investors who had put all their pension savings into a single stock — even a blue-chip one — learned an expensive lesson about concentration risk. Spreading across many validators is the staking equivalent of portfolio diversification. But diversification alone is not enough — you must also select validators worth spreading across.

A validator's commission is the percentage of gross rewards they retain before distributing the remainder to delegators. A 5% commission on 10% gross APY gives delegators 9.5% net APY. Commission rates vary from 0% (often a temporary promotional rate to attract initial delegation) to 15%+ (premium validators offering additional services). Low commission is not inherently better — a validator charging 0% may be unable to sustain operations and raise commission sharply later, or may exit entirely.

Historical uptime is the percentage of time a validator was online and actively participating in consensus. Missed blocks cost delegators in two ways: directly (missed rewards during downtime) and indirectly (reputation damage and potential slashing if downtime triggers inactivity penalties). Professional validators publish uptime statistics; target validators with 99.5% or higher measured over at least 6 months.

Self-stake is how much of the validator's own STRK they have staked in their own pool. High self-stake signals alignment — the validator suffers alongside delegators if their infrastructure fails. A validator with 1,000,000 STRK self-staked has much stronger incentive to maintain uptime than one with 1,000 STRK self-staked.

Pool size affects your staking experience in one specific way: very large pools concentrate network stake (a centralisation concern) while very small pools may have operational instability. A pool with too little delegation may not cover its operating costs, putting its long-term viability at risk.

The optimal validator selection combines: competitive commission, verified uptime history of 6+ months, meaningful self-stake relative to pool size, professional team identity (not anonymous), and pool size that does not create excessive network centralisation.
  `.trim(),
  visualPrompt: 'Validator comparison card showing 4 validators side by side: each card shows commission %, uptime %, self-stake amount, pool size, team identity (public/anonymous), and a colour-coded overall rating (green/yellow/red). One card clearly shows red flags: 0% commission, anonymous, 2 months old.',
  visualType: 'static',
  visualUrl: 'validator-selection-comparison',
  examples: [
    {
      contextTag: '[Commission rate as sustainability signal]',
      context: 'A new validator launches on Starknet with 0% commission to attract delegation. Within 8 months they have accumulated 5,000,000 STRK in their pool.',
      scenario: 'A delegator with 10,000 STRK notices the validator announces a commission increase from 0% to 8% effective in 30 days. They calculate the impact.',
      outcome: 'At 8.5% gross APY with 8% commission: net APY changes from 8.5% (with 0% commission) to 8.5% × 0.92 = 7.82%. Annual income change: 10,000 × (8.5% - 7.82%) = 68 STRK/year reduction. The delegator decides whether to stay (still competitive) or move to another validator. This bait-and-switch (0% then raise) is a recognised validator strategy — experienced stakers factor in the likelihood of future commission increases when selecting based on current rates.',
    },
    {
      contextTag: '[Uptime incident, delegator impact]',
      context: 'Validator X experiences a 72-hour outage due to a data centre power failure. Their uptime drops from 99.8% to 99.4% for the month. During the outage, no rewards were distributed to the pool.',
      scenario: 'A delegator with 5,000 STRK in Validator X\'s pool calculates their missed rewards during the 72-hour window.',
      outcome: '72 hours = 3 days. At 8% APY: daily reward = 5,000 × 8% / 365 = 1.096 STRK/day. Missed reward: 1.096 × 3 = 3.29 STRK. Dollar value at $0.80: $2.63. The direct loss is small, but persistent downtime (multiple incidents) compounds into meaningful missed rewards. More importantly, extended downtime on some networks can trigger inactivity slashing — which costs delegators far more than missed rewards.',
    },
    {
      contextTag: '[Concentration risk, network health]',
      context: 'The top 5 validators on a PoS network control 68% of total stake. A governance proposal to reduce minimum validator stake threshold passes, allowing more validators to enter.',
      scenario: 'A delegation strategy audit at a DeFi fund recommends distributing their 10,000,000 STRK stake across validators controlling no more than 5% of network stake each.',
      outcome: 'The fund distributes across 15 validators. This reduces their contribution to any single validator\'s dominance, supporting network decentralisation. They sacrifice marginal yield optimisation (they could earn slightly more by concentrating in the highest-APY validator) in exchange for contributing to a healthier network distribution. Professional institutional stakers often have explicit decentralisation mandates as part of their staking policy.',
    },
  ],
  keyTakeaway: 'A validator's commission rate is the least important of the five selection criteria — a 0% commission from an operator with three months of track record and no self-stake is far riskier than 8% from one with two years of verified uptime.',
  guidedPractice: [
    {
      question: 'A validator offers 0% commission. Should this make you more or less confident in their long-term viability?',
      options: [
        'A. More confident — lower commission means more rewards for delegators, showing the validator is generous',
        'B. Less confident — 0% commission means the validator earns nothing from operating the pool. This is typically a temporary bootstrap strategy, suggesting commission will increase or the validator may exit',
        'C. Neither — commission rate has no bearing on validator reliability',
        'D. More confident — validators with 0% commission are certified by the Starknet Foundation',
      ],
      correct: 1,
      hint: 'Validators have operating costs: servers, bandwidth, monitoring, team salaries. At 0% commission, who pays for these costs?',
      explanation: 'B is correct. Running a validator node has real ongoing costs. At 0% commission, the validator earns no income from delegation — they must fund operations from their own capital. This is typically a promotional rate to attract initial delegation, after which commission is raised. A validator earning 0% indefinitely is either self-subsidising (not sustainable) or planning to raise commission later. Factor likely future commission into your selection, not just the current rate.',
    },
    {
      question: 'You are comparing two validators. Validator A: 5% commission, 99.7% uptime over 18 months, 2,000,000 STRK self-stake. Validator B: 3% commission, 6 months operating, uptime data unavailable. For 10,000 STRK staked at 9% gross APY, calculate net annual rewards for each and state which carries more risk.',
      options: [
        'A. A: 855 STRK net. B: 873 STRK net. Validator B is better — higher net reward with lower commission.',
        'B. A: 10,000 × 9% × 95% = 855 STRK. B: 10,000 × 9% × 97% = 873 STRK. Validator B earns 18 more STRK per year but carries significantly more risk — no uptime history and unknown operational quality.',
        'C. Both earn exactly 900 STRK — commission only affects the validator\'s income, not delegator rewards.',
        'D. A: 855 STRK. B: 873 STRK. Validator A is better because older validators always perform better.',
      ],
      correct: 1,
      hint: 'Net APY = gross APY × (1 - commission). Then multiply by staked amount. After calculating, assess the risk difference.',
      explanation: 'B is correct. Validator A: 9% × 0.95 = 8.55% net. 10,000 × 8.55% = 855 STRK. Validator B: 9% × 0.97 = 8.73% net. 10,000 × 8.73% = 873 STRK. The 18 STRK difference ($14.40/year at $0.80) is trivial compared to the risk of choosing a validator with no verified uptime history. If Validator B has a single 1-week outage, the delegator misses approximately 17 STRK in rewards — wiping out the entire annual commission saving.',
    },
    {
      question: 'What does a validator\'s self-stake tell you about their incentive alignment?',
      options: [
        'A. Nothing — validators are required to self-stake by the protocol regardless of preference',
        'B. High self-stake signals that the validator shares in the consequences of their own operational failures — they lose their own tokens if slashing occurs or if poor uptime drives delegators away',
        'C. Self-stake determines the commission rate — higher self-stake validators charge higher commission',
        'D. Self-stake is purely a marketing metric used to attract delegation, with no economic significance',
      ],
      correct: 1,
      hint: 'Imagine a restaurant owner who eats their own food vs one who never does. Which is more likely to maintain quality?',
      explanation: 'B is correct. A validator with 500,000 STRK self-staked loses 500,000 × slash% if they are slashed — a very personal financial consequence. A validator with 1,000 STRK self-staked loses almost nothing from the same slash event. High self-stake creates aligned incentives: the validator is motivated to maintain excellent uptime and infrastructure because they personally bear the same risks as their delegators.',
    },
    {
      question: 'A network has 20 validators. The top 3 validators collectively control 71% of total stake. You have 100,000 STRK to delegate. Should you concentrate in the top validator for maximum yield or distribute?',
      options: [
        'A. Concentrate in the top validator — maximum yield is always the right choice',
        'B. Distribute across several validators — contributing to a pool that already controls 30%+ of stake increases centralisation risk, and your yield difference from diversifying is minimal',
        'C. The distribution of stake across validators has no impact on your individual returns',
        'D. Always choose the newest validator — small validators have higher APY',
      ],
      correct: 1,
      hint: 'What happens to the network if the top 3 validators all experience simultaneous problems? What does your stake concentration contribute to?',
      explanation: 'B is correct. At 71% concentration in 3 validators, the network is vulnerable — if those validators collude or fail simultaneously, consensus breaks down. Distributing your 100,000 STRK across 5–8 validators contributes to a healthier decentralised network while sacrificing at most 0.2–0.3% in APY from optimal single-validator rates. For large stakes, decentralisation is both ethically sound and practically risk-reducing for the ecosystem you depend on.',
    },
    {
      question: 'Validator uptime is 97.3% over the past 3 months. Is this acceptable?',
      options: [
        'A. Yes — 97.3% uptime is excellent by any measure',
        'B. No — 97.3% uptime means 2.7% downtime = approximately 2 days of missed rewards per month. Professional validators target 99.5%+.',
        'C. Acceptable for a new validator but not for an established one',
        'D. Uptime percentage is irrelevant — only commission matters for delegator returns',
      ],
      correct: 1,
      hint: 'Calculate how many hours 2.7% downtime represents per month (720 hours in a month).',
      explanation: 'B is correct. 97.3% uptime = 2.7% downtime. In a 720-hour month: 720 × 2.7% = 19.4 hours of downtime. At 9% APY, that is approximately 19.4/8,760 × 9% = 0.02% of annual rewards missed per month — small individually but meaningful across many months and compounded. Professional validators benchmark 99.5%+, meaning under 3.5 hours downtime per month. 97.3% falls well below professional standards.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have 20,000 STRK to stake. Three validators available. Validator A: 6% commission, 99.8% uptime (24 months), 1,500,000 STRK self-stake, pool size 25,000,000 STRK (controls 8% of network). Validator B: 4% commission, 99.6% uptime (12 months), 200,000 STRK self-stake, pool size 8,000,000 STRK (controls 2.5% of network). Validator C: 2% commission, 98.1% uptime (4 months), 50,000 STRK self-stake, pool size 3,000,000 STRK. Gross APY across all: 8.5%. Calculate net APY for each, then rank by risk-adjusted quality with reasoning.',
      scoringCriteria: [
        'Validator A net: 8.5% × 0.94 = 7.99%. Validator B net: 8.5% × 0.96 = 8.16%. Validator C net: 8.5% × 0.98 = 8.33%',
        'Risk ranking: B first (best balance of track record, self-stake, uptime, and commission), A second (excellent track record but concerns about network concentration at 8%), C last (highest net APY but 98.1% uptime and 4-month track record are below acceptable threshold)',
        'Recommendation: split 15,000 STRK to B and 5,000 to A for decentralisation — avoid C until 12+ months of uptime data is available',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Your 30,000 STRK is split across two validators: 20,000 in Validator X (your primary) and 10,000 in Validator Y (backup). Validator X announces they are raising commission from 5% to 12% in 45 days. Gross APY is 9%. Calculate: (1) your current net APY on the X position, (2) your net APY after the increase, (3) annual STRK income change, (4) whether it is worth moving to a new validator given that moving incurs a 21-day unbonding period with no rewards.',
      scoringCriteria: [
        'Current net APY on X: 9% × 0.95 = 8.55%. Annual: 20,000 × 8.55% = 1,710 STRK',
        'Post-increase net APY on X: 9% × 0.88 = 7.92%. Annual: 20,000 × 7.92% = 1,584 STRK',
        'Annual loss: 1,710 - 1,584 = 126 STRK/year',
        'Moving cost: 21 days of zero rewards = 20,000 × 8.55% / 365 × 21 = 98.2 STRK in missed rewards',
        'Net assessment: moving costs 98.2 STRK upfront but saves 126 STRK annually — break-even in 9.5 months. If the new validator has equal quality, moving is worth it.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a one-paragraph validator selection policy for a family office with 500,000 STRK to stake. Include minimum acceptable thresholds for commission, uptime, self-stake, track record, and pool concentration. No jargon — write as if it will be read by a non-technical board member.',
      scoringCriteria: [
        'Commission threshold specified: maximum acceptable rate stated (e.g., not above 10%) with reasoning',
        'Uptime threshold specified: minimum 99.5% over minimum 12 months',
        'Self-stake threshold: minimum meaningful amount relative to pool size (e.g., 1%+ of pool)',
        'Concentration policy: no single validator to represent more than 5-8% of network stake',
        'Written in plain English — no technical blockchain jargon that would confuse a board member',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Position Management
// ─────────────────────────────────────────────────────────────
{
  id: 'staking-position-management',
  title: 'Managing Your Staking Position',
  explanation: `
A savings account at a bank updates your balance once per month and sends you a paper statement. You are expected to do nothing between statements. Staking on Starknet is the opposite: rewards accumulate every block (approximately every 2 seconds), you can claim them anytime, and you can add more tokens or begin the exit process at any moment. The position is live and responsive — but that also means it requires occasional attention.

Your staking position has three core metrics to monitor. The staked amount is the STRK you have deposited and is earning rewards. The rewards amount is the STRK that has accumulated since your last claim — earned but not yet withdrawn. The total is staked plus rewards. A healthy position shows rewards growing smoothly over time.

Claiming rewards does not exit your stake. wallet.claimPoolRewards(poolAddress) sends your accumulated rewards to your wallet while leaving your original stake fully active. You can then do whatever you want with the claimed rewards: hold them, swap them, or re-stake them.

Re-staking claimed rewards — compounding — increases your staking base and therefore your future rewards. The compounding effect is real: 1,000 STRK staked at 9% APY earns 90 STRK in year 1. If you re-stake those 90 STRK, year 2 earns 97.9 STRK from 1,090 STRK. After 10 years of compounding: 1,000 × (1.09)^10 = 2,367 STRK — 137% more than the original stake, entirely from compounding.

Adding to an existing position uses wallet.addToPool(poolAddress, amount). The Starkzap SDK automatically detects your membership and routes to the correct contract function. Adding does not reset your reward accrual — rewards continue accumulating on the existing position while the new amount begins earning from its deposit block.

Using wallet.getPoolPosition() regularly is the discipline that separates attentive stakers from those who lose track. A position health check every 2–4 weeks catches: unexpected reward stalls (possible validator downtime), growing rewards that have passed your claim threshold, and positions approaching situations where rebalancing between validators makes sense.
  `.trim(),
  visualPrompt: 'Staking position dashboard showing three metrics: Staked Amount (bar, static), Rewards (accumulating bar growing over time), Total (sum). Below: three action buttons — Claim Rewards, Add to Pool, Begin Exit. Timeline showing reward compounding over 5 years vs not compounding.',
  visualType: 'static',
  visualUrl: 'staking-position-dashboard',
  examples: [
    {
      contextTag: '[Compounding vs not compounding, 5-year comparison]',
      context: 'Two stakers each begin with 5,000 STRK at 9% APY. Staker A claims and holds rewards every year. Staker B re-stakes all rewards every year.',
      scenario: 'After 5 years, both calculate their positions.',
      outcome: 'Staker A: 5,000 STRK staked + (5,000 × 9% × 5) = 2,250 STRK in claimed rewards. Total: 7,250 STRK. Staker B: 5,000 × (1.09)^5 = 7,694 STRK. Difference: 444 STRK ($355 at $0.80). Over 10 years: Staker A holds 9,500 STRK. Staker B holds 11,836 STRK — 2,336 STRK more. Compounding is most powerful over long time horizons where the exponential growth compounds significantly.',
    },
    {
      contextTag: '[Reward claim timing, tax and strategic considerations]',
      context: 'Carlos has 10,000 STRK staked and has accumulated 285 STRK in rewards over 4 months. He is trying to decide when to claim.',
      scenario: 'Carlos considers three approaches: (A) claim immediately and re-stake, (B) wait until end of tax year, (C) claim when rewards exceed 500 STRK. He asks a DeFi advisor for input on timing strategy.',
      outcome: 'Each approach has merit for different reasons. A: maximises compounding but may create frequent taxable events (jurisdiction-dependent). B: bundles all reward income into one tax event, simplifying reporting. C: minimises transaction frequency (fewer gas events) while still capturing rewards periodically. The optimal strategy depends on the user\'s tax situation — stakers should consult a tax professional as staking rewards are typically treated as income when received in most jurisdictions. No approach is universally best.',
    },
    {
      contextTag: '[Adding to an existing position, SDK behaviour]',
      context: 'Priya has 3,000 STRK staked in the Nethermind pool with 47 STRK in accrued rewards. She receives 2,000 additional STRK and wants to add them to her position.',
      scenario: 'Priya calls wallet.addToPool(poolAddress, Amount.parse("2000", STRK)) via the staking simulator.',
      outcome: 'The SDK detects Priya is already a pool member and calls add_to_delegation_pool. Her staked amount updates to 5,000 STRK. Her 47 STRK in rewards is preserved and continues accumulating — adding to the pool does not reset or forfeit existing rewards. The new 2,000 STRK begins earning from the block it was added. Pool position now shows: Staked 5,000, Rewards 47, Total 5,047.',
    },
  ],
  keyTakeaway: 'Claiming rewards and exiting your stake are two entirely separate operations — claiming only moves accrued rewards to your wallet while your staked principal stays active and keeps earning.',
  guidedPractice: [
    {
      question: 'You have 1,000 STRK staked at 9% APY. After 30 days, what are your accrued rewards?',
      options: [
        'A. 90 STRK — 9% annual rate applied to 1,000 STRK',
        'B. 7.4 STRK — 1,000 × 9% / 365 × 30',
        'C. 0.75 STRK — 1,000 × 9% / 12 (monthly)',
        'D. 22.5 STRK — 1,000 × 9% / 4 (quarterly)',
      ],
      correct: 1,
      hint: 'Rewards accrue daily. Convert the annual rate to a daily rate and multiply by 30 days.',
      explanation: 'B is correct. Daily rate: 9% / 365 = 0.02466% per day. Over 30 days: 1,000 × 0.02466% × 30 = 7.4 STRK. Option A incorrectly applies the full annual rate. Option C uses monthly (incorrect denominator). Option D uses quarterly (incorrect). The actual accrual is daily and visible in real-time via getPoolPosition().',
    },
    {
      question: 'You call wallet.claimPoolRewards(poolAddress). What happens to your staked STRK?',
      options: [
        'A. Your staked STRK is returned along with rewards — claiming exits the position',
        'B. Nothing — claiming rewards sends accumulated rewards to your wallet while your original stake remains fully active and continues earning',
        'C. Claiming rewards resets the reward counter but your stake stays locked for another 21 days',
        'D. Claiming rewards triggers a partial unstake equal to the reward amount',
      ],
      correct: 1,
      hint: 'Claiming rewards and exiting your stake are two completely separate operations. What does "claim rewards" specifically do?',
      explanation: 'B is correct. claimPoolRewards() only moves accumulated rewards to your wallet. Your staked amount stays in the pool, continues earning, and is not touched. To exit your stake, you must separately call exitPoolIntent() and then exitPool() after the unbonding period. These are distinct operations that should not be conflated.',
    },
    {
      question: 'After 1 year, Staker A has 10,000 STRK staked plus 900 STRK in rewards (not compounded). Staker B re-staked their 900 STRK immediately. In year 2 at the same 9% APY, how much more does Staker B earn than Staker A?',
      options: [
        'A. 0 STRK — compounding does not take effect until year 3',
        'B. 81 STRK — Staker B earns 9% on 900 more STRK = 81 extra STRK in year 2',
        'C. 900 STRK — Staker B doubled their rewards by re-staking',
        'D. 9 STRK — the compounding effect is 1% of the additional stake',
      ],
      correct: 1,
      hint: 'Staker B has 10,900 STRK earning in year 2; Staker A has 10,000 STRK. How much more does the extra 900 STRK earn at 9% APY?',
      explanation: 'B is correct. Extra 900 STRK × 9% = 81 STRK additional in year 2. This seems small, but it is 81 STRK earned purely from the compounding decision in year 1. Over 10 years, the compounding advantage grows exponentially — the 81 STRK in year 2 becomes the base for further compounding in subsequent years.',
    },
    {
      question: 'wallet.getPoolPosition(poolAddress) returns: staked: 8,000 STRK, rewards: 0 STRK, total: 8,000 STRK. You staked 2 weeks ago. Is this normal?',
      options: [
        'A. Yes — rewards take 30 days to start accumulating',
        'B. No — rewards should be accruing continuously from the moment you enter the pool. Zero rewards after 2 weeks suggests a validator downtime issue worth investigating.',
        'C. Yes — rewards are only credited when the validator distributes them monthly',
        'D. Yes — rewards show zero until you manually trigger accumulation',
      ],
      correct: 1,
      hint: 'Rewards accrue every block on Starknet — starting from the moment of entry. What does zero rewards after 14 days suggest?',
      explanation: 'B is correct. Staking rewards on Starknet accrue with every block — they are continuous and automatic. After 2 weeks (approximately 14 days × 86,400 seconds / 2 seconds per block = 604,800 blocks), rewards should be clearly visible and non-zero. Zero rewards after 2 weeks is a red flag — the most likely cause is validator downtime, where the validator was not producing blocks and therefore not generating rewards.',
    },
    {
      question: 'You have 5,000 STRK staked and 312 STRK in accrued rewards. You want to add 1,000 more STRK to your position. What happens to your 312 STRK in rewards when you call addToPool?',
      options: [
        'A. The 312 STRK rewards are automatically claimed when you add more to the pool',
        'B. The 312 STRK rewards continue accumulating — addToPool does not touch accrued rewards',
        'C. The 312 STRK rewards are forfeited — you must claim them before adding more stake',
        'D. The 312 STRK rewards are added to your new stake automatically',
      ],
      correct: 1,
      hint: 'addToPool only adds new STRK to your existing position. It does not claim, forfeit, or alter your existing reward balance.',
      explanation: 'B is correct. addToPool is an independent operation that increases your staked amount. Your existing rewards (312 STRK) remain in the rewards balance and continue accumulating normally. They are only affected when you call claimPoolRewards(). There is no interaction between adding stake and reward accumulation — each is managed independently.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You staked 15,000 STRK six months ago at 8.8% APY. You have never claimed rewards. Calculate: (1) current accrued rewards, (2) if you re-stake the rewards now and continue for another 6 months at the same APY, how much additional reward does compounding generate vs not re-staking? (3) at STRK = $0.75, what is the dollar value of the compounding advantage?',
      scoringCriteria: [
        'Accrued rewards after 6 months: 15,000 × 8.8% / 2 = 660 STRK',
        'Re-staked scenario: (15,000 + 660) × 8.8% / 2 = 689 STRK in next 6 months',
        'Not re-staked scenario: 15,000 × 8.8% / 2 = 660 STRK in next 6 months',
        'Compounding advantage: 689 - 660 = 29 STRK over 6 months',
        'Dollar value: 29 × $0.75 = $21.75 from re-staking — small per period but exponentially growing',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'getPoolPosition() returns: staked 20,000 STRK, rewards 2.1 STRK, total 20,002.1 STRK. You staked this position 45 days ago expecting approximately 220 STRK in rewards by now (based on 9% APY). Diagnose what may be happening and list three things you should check or do.',
      scoringCriteria: [
        'Expected rewards: 20,000 × 9% / 365 × 45 = 221.9 STRK. Actual: 2.1 STRK — 98.6% less than expected.',
        'Diagnostic 1: Check validator uptime on Starknet explorer — likely extended downtime or the validator is not producing blocks',
        'Diagnostic 2: Verify the pool address is correct — you may have checked the wrong pool',
        'Action: Begin exitPoolIntent() to start the exit process and move to a different validator while the exit processes — the 21-day unbonding applies but the situation warrants investigation',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain the difference between "claiming rewards" and "exiting your stake" to someone who uses a savings account at a traditional bank. 3 sentences using only savings account analogies.',
      scoringCriteria: [
        'Claiming rewards correctly analogised: like withdrawing the interest that has accumulated without closing the account',
        'Exiting stake correctly analogised: like closing the savings account — the principal returns but the account stops earning',
        'Correctly notes the exit has a notice period (like a fixed-term savings account with an early withdrawal delay)',
      ],
    },
  ],
},

];  // end LAB3_LESSONS_1_TO_3
