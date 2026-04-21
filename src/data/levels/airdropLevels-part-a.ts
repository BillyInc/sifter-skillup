// ⚡ Sifter SkillUp — Airdrop Archipelago (Island 10, Levels 106–120)
// Part A of 2 — Levels 106–113
//
// L106–L108: preserved exactly from islands9_18Levels.ts
// L109–L113: generated to complete the island
// Chain: Arbitrum Sepolia (islandId=10)
// Simulators: airdropEligibility, sybilDetector, airdropScamDrill,
//             airdropExpectedValue, airdropBoss

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 106 — What Is an Airdrop and Why Do Protocols Do Them? (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L106: IslandLevel = {
  id: 106, mechanic: 'match3', tier: 'pro',
  topic: 'What Is an Airdrop and Why Do Protocols Do Them?',
  explanation: `In September 2020, Uniswap distributed 400 UNI tokens to every address that had ever used its protocol. At listing they were worth ~$1,200. At peak, over $16,000. 250,000 users received this — for doing nothing more than using a product they already liked.

That airdrop changed crypto. But it was an outlier — not a template.

Protocols airdrop tokens for interconnected reasons: to decentralise governance (transfer control from founders to users), to reward early users who took risk during unproven periods, to bootstrap activity on new chains or products, and to generate word-of-mouth growth without paid marketing.

The economic logic is explicit: the protocol gives you tokens of uncertain future value in exchange for genuine on-chain activity. You took risk using something unproven; they reward you with ownership.

The key insight about qualification is that protocols reward genuine engagement, not systematic gaming. Uniswap gave identical tokens to a user who traded once for $100 and someone who traded a hundred times for millions. Later protocols became sophisticated: measuring time-weighted values, protocol diversity, governance participation, and on-chain behaviour that distinguishes genuine users from airdrop farmers.

Realistic expectations: most airdrops deliver $50–$500 per wallet for moderate participation. A small number deliver $1,000–$5,000 for heavy engagement. Uniswap-scale payouts require being early to exactly the right protocol at the right moment — not something that can be systematically replicated.`.trim(),
  fact: 'Uniswap distributed 400 UNI to 250,000 users in 2020 — a retroactive airdrop for past genuine usage. Most airdrops deliver $50–$500 per qualifying wallet. Exceptional outliers cannot be systematically predicted.',
  plain: 'Protocols give tokens to their early real users as a reward and to share ownership. Most payouts are modest. The huge ones like Uniswap require being early to exactly the right protocol — not achievable by design.',
  stars: [380, 470, 590], target: 590, coins: 36,
  simulatorLesson: 'airdropEligibility',
  examples: [
    { contextTag: '[Historical windfall]', scenario: 'Kenji used Uniswap in July 2020 to swap $150 of ETH. He forgot about it. In September 2020, 400 UNI appeared in his wallet.', outcome: 'Kenji did nothing to game the airdrop — he just used a product he liked. This is the purest form: retroactive reward for genuine past behaviour. UNI peaked at ~$44 → $17,600 for one forgotten swap.' },
    { contextTag: '[Modern criteria]', scenario: 'A new L2 announces an airdrop with a scoring system: bridge volume, transaction count, protocols used, governance votes, and time since first transaction.', outcome: 'Modern airdrops measure the pattern of usage, not just whether you used it. A user who bridged $500 fifteen times across 6 months and voted twice scores higher than someone who bridged $10,000 once.' },
    { contextTag: '[Realistic expectations]', scenario: 'Maria has been using a new chain for 3 months. She asks: "Should I expect a Uniswap-level airdrop?"', outcome: 'Uniswap was the historical outlier. Realistic expectation: $200–$800 for consistent engagement. Planning finances around a huge airdrop is not prudent. The protocol usage itself needs to have independent value.' },
  ],
  keyTakeaway: 'Airdrops reward genuine early users who took risk during unproven periods. Most deliver $50–$500 per wallet. Strategy: use protocols you genuinely find useful — the airdrop is a bonus, not the primary reason.',
  guidedPractice: [
    { question: 'Why did Uniswap distribute UNI tokens to early users?', options: ['To reward highest-volume traders with bonus returns', 'To decentralise governance, reward early risk-takers, and create community ownership', 'To compete with Binance by offering higher trading incentives', 'As a regulatory requirement before going public'], correct: 1, hint: 'Decentralisation and reward for early risk. What was the strategic purpose?', explanation: 'Uniswap\'s UNI distribution served multiple purposes: moving governance to users, rewarding those who used an unproven protocol when it could have failed, and creating a community invested in its success.' },
    { question: 'What behaviour is most consistently rewarded in modern airdrop criteria?', options: ['Holding the largest position in the protocol\'s liquidity pools', 'Consistent, varied, genuine protocol usage over time across multiple features', 'Being among the first 1,000 users regardless of activity', 'Following the protocol on social media'], correct: 1, hint: 'Modern criteria distinguish genuine users from farmers. What pattern does genuine engagement produce?', explanation: 'Modern protocols reward varied, consistent usage: multiple action types (bridge + swap + LP + governance), repeated over time, spread across the protocol\'s features. This pattern signals genuine adoption rather than tactical farming.' },
    { question: 'Why can\'t the Uniswap airdrop be replicated by design?', options: ['Uniswap has patents on its airdrop mechanism', 'It was retroactive — rewarded past behaviour that happened before anyone knew an airdrop was coming', 'Only large-cap protocols can afford airdrops of that size', 'The SEC banned airdrops after Uniswap'], correct: 1, hint: 'Retroactive = rewards what already happened. Can you go back in time to use a protocol?', explanation: 'The Uniswap airdrop rewarded behaviour that happened before any announcement. Those users used Uniswap because they liked it. Once protocols announce airdrops, behaviour shifts from genuine use to farming — which modern criteria detect and discount.' },
    { question: 'One user made a single $50,000 bridge. Another made 20 bridges of $100 each over 4 months. Who typically scores higher?', options: ['The $50,000 user — volume always wins', 'The 20-transaction user — consistent repeated behaviour signals genuine engagement', 'Equal — volume is the only metric', 'Neither — governance participation is the only signal that matters'], correct: 1, hint: 'What signals genuine repeated protocol adoption?', explanation: 'Multiple transactions over time signal genuine ongoing use — someone for whom the protocol is genuinely useful. A single large transaction could be capital movement or testing. Protocols reward the pattern of engagement, not just capital size.' },
    { question: 'What is a "retroactive" airdrop?', options: ['An airdrop that happens after a token lists on a CEX', 'Tokens distributed based on past user activity before any airdrop was announced', 'An airdrop for users who connect their wallet after launch', 'A second airdrop for those who received the first'], correct: 1, hint: 'Retro = looking back. Retroactive = rewarding what already happened.', explanation: 'A retroactive airdrop distributes tokens based on historical behaviour before any announcement. Users qualified by genuinely using the protocol. This is the most valuable form — subsequent announced airdrops have lower value because farming behaviour distorts the signal.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 107 — Qualification Criteria: How Protocols Score Users (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L107: IslandLevel = {
  id: 107, mechanic: 'memory', tier: 'pro',
  topic: 'Qualification Criteria: How Protocols Score Users',
  explanation: `After the Uniswap airdrop, protocols watched hundreds of wallets that appeared genuine but were actually one person running automation across dozens of wallets. They built scoring systems to identify and exclude these Sybil farmers.

Modern airdrop scoring measures across five dimensions: transaction volume (total value moved through the protocol), transaction count (how many times you used it), protocol diversity (how many different features you used), time weighting (did you use it before or after the airdrop was announced?), and governance participation (did you vote?).

Time weighting is the most powerful dimension. Using a protocol before it was widely known signals genuineness — you had no reason to be there except actual interest. Using it only after the airdrop announcement scores near zero.

Additional signals some protocols use: whether your wallet had pre-existing history (not created 3 weeks ago for farming), whether you interacted on other chains (multi-chain users signal sophistication), and whether you held funds during specific snapshot periods (not just moved money in and out).

The practical implication is counterintuitive: the wallets that received the largest Arbitrum and Blur airdrops were not farming accounts. They were active traders and DeFi users for whom these protocols were genuinely useful. Farming as a primary strategy underperforms genuine adoption as a secondary strategy.`.trim(),
  fact: 'Time weighting is the most powerful scoring dimension — pre-hype usage scores 3–5× higher than post-announcement activity. The highest allocations went to wallets that used protocols genuinely before airdrops were announced.',
  plain: 'Protocols reward earlier use more, varied use more, and governance participation most. Using a protocol after an airdrop is announced earns almost nothing in sophisticated scoring systems.',
  stars: [440, 540, 680], target: 680, coins: 38,
  simulatorLesson: 'airdropEligibility',
  examples: [
    { contextTag: '[Time weighting advantage]', scenario: 'Two users both have $5,000 in a protocol. User A deposited 8 months ago. User B deposited 3 weeks ago after the airdrop was announced.', outcome: 'User A receives significantly higher allocation despite identical current TVL. Time weighting recognises A took risk when unproven. Most protocols weight pre-hype usage 3–5× higher.' },
    { contextTag: '[Protocol diversity wins]', scenario: 'Maria uses only the bridge — 15 transactions, $20,000 total. James uses bridge + DEX + lending + governance — 12 transactions, $8,000 total.', outcome: 'James likely scores higher. Protocol diversity signals genuine exploration. Many protocols specifically reward users who accessed multiple product categories, not just one.' },
    { contextTag: '[Wallet age matters]', scenario: 'A wallet created in 2024 solely to farm a specific protocol. Versus a wallet with 2 years of diverse on-chain history.', outcome: 'Modern Sybil detection checks wallet age and prior history. A wallet created to farm one protocol scores significantly lower. Multi-year wallets with diverse activity are treated as genuine users.' },
  ],
  keyTakeaway: 'Highest airdrop allocations go to wallets that used protocols early, consistently, across multiple features, with pre-existing on-chain history. Late tactical farming scores near zero in sophisticated systems.',
  guidedPractice: [
    { question: 'Why does time weighting favour users who interacted before an airdrop announcement?', options: ['Earlier users receive lower gas costs and more available tokens', 'Pre-announcement users took risk on an unproven protocol — rewarded for genuine adoption, not tactical farming', 'Protocols can only track transactions before their announcement date', 'Time weighting is not actually used in modern criteria'], correct: 1, hint: 'Risk and timing: who genuinely believed in the protocol before it was popular?', explanation: 'Pre-announcement users chose the protocol based on its actual utility, not airdrop expectation. They took risk on something unproven. Time weighting rewards genuine early adoption — the exact behaviour protocols want to incentivise for future growth.' },
    { question: 'A farmer does 50 $1 swaps in one day. A genuine user makes 8 swaps over 4 months totalling $12,000. Who scores better?', options: ['The farmer — 50 transactions always beats 8', 'The genuine user — protocols analyse patterns, amounts, and time distribution, not raw counts', 'Equal — transaction count alone determines ranking', 'The farmer scores higher but gets flagged and excluded'], correct: 1, hint: 'Modern criteria look at patterns. What does 50 identical $1 transactions in one day signal?', explanation: 'Modern scoring analyses patterns, not raw counts. Fifty identical micro-transactions in one day signals automation or intentional gaming. Eight varied transactions over four months at realistic amounts looks like genuine portfolio management.' },
    { question: 'What does governance participation signal to airdrop scoring systems?', options: ['That you hold minimum balance of existing governance token', 'Genuine investment in the protocol\'s future — voting on proposals signals long-term alignment', 'That you passed KYC verification', 'That you qualified for a previous airdrop season'], correct: 1, hint: 'Why would a genuine user vote on governance when nobody is forcing them?', explanation: 'Voting on governance takes intentional effort and signals you care about the protocol\'s direction. It is the hardest farming signal to fake authentically. Protocols weight it heavily as a genuine user indicator.' },
    { question: 'You used a protocol once in its first month, spending $200. A second user used it monthly for 8 months, spending $5,000. Who typically receives larger allocation?', options: ['You — first month users always get the largest retroactive allocation', 'The second user — sustained 8-month engagement demonstrates ongoing genuine use', 'Equal — most protocols use uniform distribution', 'The $5,000 user purely because of dollar amount'], correct: 1, hint: 'Consistency over time versus a single early interaction. Which signals deeper adoption?', explanation: 'While early usage is time-weighted positively, sustained monthly use over 8 months demonstrates the protocol became part of their genuine DeFi workflow. Most scoring systems reward both early adoption AND sustained engagement. The 8-month user shows the higher signal.' },
    { question: 'A wallet only interacts with protocols known to be planning airdrops, during their farm windows. How does Sybil detection identify this?', options: ['IP address matching with other farming wallets', 'Wallet history pattern — only ever engaging with hyped protocols signals farming, not genuine use', 'Private key generated from known farming software', 'Social media accounts linked to the wallet'], correct: 1, hint: 'What does a genuine DeFi user\'s wallet history look like versus a pure farming wallet?', explanation: 'Sybil detection analyses wallet history holistically. A wallet only ever interacting with airdrop-hyped protocols during their farm windows has a very different fingerprint from genuine users who show broad DeFi exploration including non-hyped protocols. This pattern gets flagged and scored down.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 108 — Sybil Resistance: How Protocols Detect Multi-Wallet Farming (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L108: IslandLevel = {
  id: 108, mechanic: 'chain', tier: 'pro',
  topic: 'Sybil Resistance: How Protocols Detect Multi-Wallet Farming',
  explanation: `After the Arbitrum airdrop in 2023, thousands of wallet clusters were retroactively excluded when Arbitrum's team identified Sybil patterns. These appeared to be independent wallets but were operated by the same person. The excluded wallets received nothing.

Sybil attacks — named after a 1973 novel about a person with multiple personalities — attempt to gain multiple allocations by creating multiple independent-looking wallets. Modern detection uses graph analysis: mapping which wallets funded each other, which were created simultaneously, which share funding sources, and which make identical transactions in the same block.

The most revealing patterns: all wallets funded from the same CEX withdrawal address, created within 24 hours of each other, making identical transaction amounts across wallets, and eventually sending proceeds back to a single collection address.

The "dust trail" is particularly damning. Any transaction between two wallets — even $0.001 — proves they are connected. If Wallets A, B, C all eventually send to Wallet D, Sybil detection identifies A, B, C as a cluster regardless of how independently they behaved otherwise.

The absolute rule: one genuine identity, one wallet, is the only sustainable strategy. Multi-wallet farming has declining expected value as detection improves, and improving detection makes past "clean" clusters retroactively identifiable. The risk-adjusted return is negative for most farmers.`.trim(),
  fact: 'Sybil detection uses wallet graph analysis — shared funding sources, same-day creation, identical transaction patterns, and the "dust trail" (any transaction between wallets proves connection). Arbitrum excluded thousands of clusters in 2023.',
  plain: 'Running multiple wallets to multiply airdrop allocations will eventually be caught. Protocols trace wallet funding connections to identify clusters owned by the same person. One wallet, one allocation.',
  stars: [500, 615, 770], target: 770, coins: 40,
  simulatorLesson: 'sybilDetector',
  examples: [
    { contextTag: '[Caught by graph analysis]', scenario: 'Ahmad funds 10 wallets from his Binance account on the same day, runs identical transactions. Expects 10× allocation.', outcome: 'Graph analysis instantly flags: all 10 wallets funded from same CEX address on same day, identical patterns. All 10 allocations set to zero. Ahmad receives nothing. $500 in gas wasted across all wallets.' },
    { contextTag: '[Legitimate multi-wallet]', scenario: 'Maria has a hot wallet and hardware cold wallet for 3 years. Different usage patterns. She worries about Sybil exclusion.', outcome: 'Legitimate multi-wallet use with different purposes and 3-year histories is not Sybil behaviour. Sybil detection targets identical-pattern clusters, not wallets with different histories serving different purposes.' },
    { contextTag: '[Dust trail exposure]', scenario: 'A farmer runs 5 seemingly independent wallets. At the end of the season, transfers all tokens to one collection address.', outcome: 'The collection transaction is the most damning link. Any transaction between wallets proves connection. Sybil analysis runs retroactively — the collection transaction retroactively identifies all 5 as a cluster.' },
  ],
  keyTakeaway: 'Sybil detection traces wallet funding graphs — any connection between wallets, including a single historical transaction, proves they are linked. One identity = one wallet = one allocation. Multi-wallet farming is negative expected value.',
  guidedPractice: [
    { question: 'What is the primary technical method protocols use to identify Sybil wallets?', options: ['Email address verification linked to wallets', 'Graph analysis of funding sources, creation dates, and transaction patterns to identify clusters', 'IP address tracking across all DeFi transactions', 'On-chain KYC tied to government ID'], correct: 1, hint: 'Protocols can\'t see IPs or emails in most cases. What on-chain data reveals wallet relationships?', explanation: 'Graph analysis maps every on-chain interaction: which wallets funded which others, which were created together, which made identical transactions. This creates a network graph where coordinated wallets appear as obvious clusters — even without IP or identity data.' },
    { question: 'Which pattern most clearly indicates Sybil activity?', options: ['One wallet with 500 transactions and $50,000 volume', '20 wallets all funded from the same CEX address on the same day, each making identical transactions', 'A wallet that used 15 different DeFi protocols over 2 years', 'A wallet that connected to a protocol the day before a funding announcement'], correct: 1, hint: 'Identical pattern + same source + same timing across many wallets = one person.', explanation: '20 wallets funded from one source on the same day with identical transactions is a textbook Sybil cluster. No legitimate scenario produces this pattern. One person split their farming across 20 wallets hoping for 20× allocation.' },
    { question: 'Why is transferring proceeds from multiple wallets to one collection address risky?', options: ['Tax authorities track collection addresses', 'This creates the "dust trail" — a direct on-chain link proving all wallets are controlled by one entity', 'Protocol smart contracts detect collection addresses and penalise', 'Transaction fees reduce effective airdrop value'], correct: 1, hint: 'What does any transaction between two wallets prove about their relationship?', explanation: 'Any transaction between wallets — even $0.001 — proves connection. If Wallets A, B, C all send to Wallet D, Sybil detection identifies A, B, C as a cluster. The collection transaction that seems routine is often the most damning link.' },
    { question: 'Arbitrum excluded Sybil clusters after distribution was announced. What was the consequence?', options: ['Excluded wallets received reduced 10% allocation', 'Excluded wallets received nothing — all identified cluster allocations set to zero', 'Excluded wallets could appeal within 48 hours', 'Tokens were locked for 4 years instead of distributed'], correct: 1, hint: 'What is the point of Sybil detection if farmers still receive something?', explanation: 'Sybil exclusions are absolute: identified clusters receive zero. Total exclusion is the only deterrent that makes multi-wallet farming negative expected value — the cost of gas across all wallets exceeds zero return.' },
    { question: 'You have two legitimate wallets with different purposes and 3-year histories. Are you at risk of Sybil exclusion?', options: ['Yes — any multiple wallets equals Sybil', 'No — different patterns, histories, and purposes are distinguishable from farming clusters', 'Must contact the protocol team before the snapshot', 'Merge wallets immediately to avoid detection'], correct: 1, hint: 'What distinguishes legitimate multi-wallet use from Sybil farming?', explanation: 'Legitimate multi-wallet use has differentiated purposes, histories, and patterns. A trading wallet and a cold storage wallet look completely different on-chain. Sybil detection targets wallets that make identical transactions at identical times from identical funding — the coordinated farming pattern, not the existence of multiple wallets.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 109 — Qualifying Criteria: What Counts as Genuine Activity
// ─────────────────────────────────────────────────────────────────────────────

const L109: IslandLevel = {
  id: 109, mechanic: 'match3', tier: 'pro',
  topic: 'Qualifying Criteria — What Counts as Genuine Activity',

  explanation: `In March 2023, Arbitrum distributed ARB tokens using a tiered point system. Users who bridged once and made three transactions received Tier 1 (625 ARB). Users with governance votes, multiple protocols, consistent activity over months, and higher TVL received Tier 6+ (10,250 ARB). Same chain, same snapshot — but a 16× difference in allocation based entirely on behaviour quality.

Understanding what counts as genuine activity versus what gets discounted or excluded is the most practical knowledge an airdrop participant can have.

What consistently qualifies: using a protocol for its actual stated purpose (swapping on a DEX because you want the token, not just to generate a transaction), holding positions for meaningful time periods (not depositing and withdrawing in the same hour), voting on governance proposals (shows genuine investment in the outcome), bridging with realistic amounts spread over time, and using multiple protocol features (lending + borrowing + LP, not just one function repeatedly).

What gets discounted or excluded: micro-transactions clearly below any rational purpose (swapping $1 when gas costs $0.50), transactions clustered in one 24-hour window, activity that only started after the airdrop was publicly rumoured, using only the protocol's simplest feature while ignoring others, and wallet creation dates that coincide suspiciously with farming season start.

The framework: before any activity, ask "Would I do this if there were no airdrop?" If yes, it qualifies. If the only reason is the airdrop, it is detectable as farming.`.trim(),

  fact: 'Arbitrum\'s tiered system rewarded genuine multi-feature use 16× more than minimal single-bridge activity. Genuine activity means using the protocol for its stated purpose — detected by pattern, not just transaction count.',
  plain: 'Use the protocol because it\'s useful, not just to generate transactions. Vote in governance, use multiple features, hold positions over time. Single-purpose farming is visible to scoring systems.',
  stars: [560, 690, 860], target: 860, coins: 42,
  simulatorLesson: 'airdropEligibility',

  examples: [
    {
      contextTag: '[Tier difference reality]',
      scenario: 'Two Arbitrum users at snapshot: User A bridged $200 and made 5 swaps on GMX. User B bridged $1,500, traded on GMX, provided LP on Camelot, voted on two governance proposals, and used Aave to borrow over 4 months.',
      outcome: 'User A: Tier 2 (~1,250 ARB, worth ~$1,500 at listing). User B: Tier 5+ (~6,000 ARB, worth ~$7,200 at listing). Same chain, same snapshot date — the $1,300 difference in bridged amount produced a 4.8× difference in allocation. The behavioural breadth was the determining factor, not capital size.',
    },
    {
      contextTag: '[Farming detection via pattern]',
      scenario: 'Marcus wants to qualify for an upcoming chain airdrop. He plans to do 200 $1 swaps over two days to hit the transaction threshold.',
      outcome: 'Most modern systems detect this pattern instantly: 200 identical micro-swaps in 48 hours, all at irrational amounts for the gas cost, clustered in time. The protocol scores this as bot-like behaviour and discounts or excludes it. A better approach: 20 real swaps over 3 months at amounts that make financial sense — a pattern indistinguishable from genuine DeFi use.',
    },
    {
      contextTag: '[Governance as signal]',
      scenario: 'Priya has used a DeFi protocol regularly for 6 months but never voted in governance. An airdrop is announced with governance as a scoring factor.',
      outcome: 'Governance votes cast before the airdrop announcement carry maximum weight — genuine historical engagement. Votes cast immediately after the announcement still count but at lower weight. Priya votes on the next available proposal. Her 6-month usage history is the strong signal; the late governance vote adds marginal points but demonstrates her genuine awareness of protocol direction.',
    },
  ],

  keyTakeaway: 'Genuine activity means using protocols for their stated purpose across multiple features over time — not generating transactions. Ask "would I do this without the airdrop?" If no, scoring systems are likely designed to detect it.',

  guidedPractice: [
    {
      question: 'You swap $1 of ETH on a DEX 100 times over one week, purely to hit a transaction count threshold. Why does this strategy fail?',
      options: [
        'DEXes have minimum trade sizes that prevent $1 swaps',
        'Transaction patterns analysis flags this as bot-like behaviour — identical small amounts, irrational relative to gas cost, clustered in time. Modern scoring discounts or excludes it',
        'Transaction count thresholds were removed from all modern airdrop criteria',
        'This is effective — 100 transactions always qualifies for maximum allocation',
      ],
      correct: 1,
      hint: 'Would any genuine DeFi user swap $1 exactly 100 times in one week?',
      explanation: 'Genuine users make transactions that make financial sense: amounts large enough to justify gas costs, varied amounts reflecting real decisions, spread over time. 100 × $1 swaps with gas at $0.50 each is a $50 net loss with no rational purpose except transaction count farming. This pattern is visible in the data and triggers farming flags in modern scoring systems.',
    },
    {
      question: 'What is the most powerful single action you can take to improve your airdrop score on most modern protocols?',
      options: [
        'Bridge the maximum possible amount in one transaction',
        'Vote on a governance proposal — it signals genuine investment in the protocol\'s direction and is the hardest farming behaviour to replicate authentically',
        'Use the protocol daily for 30 consecutive days',
        'Refer 10 friends through the protocol\'s referral programme',
      ],
      correct: 1,
      hint: 'What action requires genuine understanding of the protocol and genuine interest in its future?',
      explanation: 'Governance voting requires reading proposals, forming an opinion, and actively participating in the protocol\'s direction. It is difficult to fake authentically at scale (you would need to read and vote on real proposals) and signals long-term alignment. Protocols consistently apply significant multipliers to wallets with governance participation because it is the clearest genuine-user signal that farming behaviour does not naturally produce.',
    },
    {
      question: 'A wallet deposited $10,000 into a lending protocol, then withdrew it one hour later. How does this score?',
      options: [
        'Highly — $10,000 TVL is a strong contribution regardless of duration',
        'Poorly — time-weighted TVL scoring heavily discounts brief deposits. A $10,000 deposit held for 1 hour contributes far less than $500 held for 3 months',
        'Normally — protocols only check the snapshot balance, not deposit duration',
        'It depends on whether the deposit was made before or after the snapshot',
      ],
      correct: 1,
      hint: 'Does a 1-hour deposit represent genuine protocol use or capital movement?',
      explanation: 'Modern scoring uses time-weighted TVL: your balance × duration. $10,000 held for 1 hour = $10,000 × (1/720 month) = tiny time-weighted contribution. $500 held for 3 months = $500 × 3 = $1,500 time-weighted. The $500 holder scores higher. The protocol recognises the $10,000 one-hour deposit as capital temporarily parked for a transaction rather than genuine protocol adoption.',
    },
    {
      question: 'Which combination of activities produces the highest typical airdrop score?',
      options: [
        'One very large bridge transaction followed by immediate withdrawal',
        'Bridging with moderate amounts, using the DEX, providing LP, borrowing against a lending position, and voting on one governance proposal — all over 4+ months',
        'Making the maximum number of transactions possible in the shortest time',
        'Following the protocol on Twitter and joining their Discord server',
      ],
      correct: 1,
      hint: 'Which option looks like someone who genuinely uses DeFi as part of their financial life?',
      explanation: 'The combination that scores highest is the combination that looks exactly like a genuine, engaged DeFi user: moderate-sized diverse transactions across multiple protocol features (not just one), spread over months (not days), including protocol governance. This is not a gaming strategy — it is the description of how someone who genuinely finds the protocol useful would actually behave. That convergence is intentional: airdrops are designed to reward genuine users.',
    },
    {
      question: 'How does wallet age affect airdrop scoring, and what does it signal?',
      options: [
        'Wallet age has no effect — only recent activity counts',
        'Wallets with longer history score higher because they demonstrate pre-existing genuine crypto engagement, not accounts created specifically for farming',
        'Older wallets are penalised for holding assets without current activity',
        'Only wallets created after a protocol launched can qualify for its airdrop',
      ],
      correct: 1,
      hint: 'What does a 3-year-old wallet with diverse history signal versus a 3-week-old wallet?',
      explanation: 'A 3-year-old wallet has a track record: it existed and transacted before this specific protocol launched, suggesting the owner is a genuine crypto participant who found this protocol useful. A wallet created three weeks before the farming window started has no such history — it was built for this purpose. Most scoring systems check wallet age and prior on-chain activity as baseline signals of genuine engagement before evaluating farming-specific metrics.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 110 — Ecosystem Strategy: Which Chains Have Live Potential
// ─────────────────────────────────────────────────────────────────────────────

const L110: IslandLevel = {
  id: 110, mechanic: 'memory', tier: 'pro',
  topic: 'Ecosystem Strategy — Which Chains Have Live Airdrop Potential',

  explanation: `In 2022, a researcher identified LayerZero as a likely airdrop candidate: major VC funding ($135M from a16z and Sequoia), protocol live with significant TVL, no public token, and a team that had discussed community ownership. Two years later, the ZRO airdrop distributed tokens to hundreds of thousands of users who had bridged through LayerZero.

The framework for identifying ecosystems with live airdrop potential has four signals:

Funding without token: protocols that raised significant VC funding but have not yet launched a governance token are structurally incentivised to distribute tokens eventually — their investors need an exit mechanism and the protocol needs decentralisation. Major VC funding (a16z, Paradigm, Sequoia, Multicoin) with no public token is signal one.

Active protocol with token placeholder: governance contracts that reference a not-yet-deployed token address, or protocol documentation that mentions "future governance token," signal pre-distribution phase.

Points or testnet programmes: protocols explicitly tracking user activity points (Blast, EigenLayer, Hyperliquid historically) are building the scoring infrastructure needed for a distribution. Points programmes without a stated purpose are airdrop-preparation.

TVL without token incentive: a protocol attracting significant TVL ($100M+) without token rewards is attracting genuine users — the signal quality is higher because there is no farming incentive. When the token launches, these users receive proportionally higher allocations.

The caveat: identifying potential is not the same as certainty. Many protocols with all four signals never launch tokens, cancel programmes, or distribute very low values.`.trim(),

  fact: 'Four signals of live airdrop potential: major VC funding with no token, token placeholder in contracts, active points/testnet programme, and significant TVL with no token incentive. Presence of all four is the strongest indicator — but not a guarantee.',
  plain: 'To find the next airdrop opportunity: look for protocols with big investors but no token yet, that are actively tracking user points, and have real TVL from genuine users. That combination is the strongest signal.',
  stars: [620, 760, 950], target: 950, coins: 44,
  simulatorLesson: 'airdropEligibility',

  examples: [
    {
      contextTag: '[LayerZero retrospective]',
      scenario: 'In early 2022, a DeFi researcher evaluates LayerZero: $135M raised from a16z and Sequoia, no public token, cross-chain messaging protocol live with $2B+ in bridged value, no token mentioned in any documentation.',
      outcome: 'Four signals present: large VC funding, no token, significant TVL, core infrastructure protocol. The researcher begins genuinely using LayerZero-powered bridges (Stargate, Radiant Capital) as part of their normal DeFi activity. Two years later, ZRO distributes. Their usage history qualifies them for a meaningful allocation. The signal identification was correct; the timing was 2 years — requiring patience.',
    },
    {
      contextTag: '[Points programme identification]',
      scenario: 'Amara notices a new DeFi protocol has launched a "points" dashboard showing accumulated activity scores but with no stated reward. She researches their investors.',
      outcome: 'Points dashboard with no stated purpose + $80M from Paradigm + active protocol with $500M TVL and no governance token = strong airdrop preparation signal. She begins genuinely using the protocol\'s features — not just accumulating points, but using the lending and DEX functions she finds genuinely useful. When the airdrop launches, genuine usage history earns her a higher multiplier than pure points farming.',
    },
    {
      contextTag: '[False positive caution]',
      scenario: 'James identifies a chain with all four signals: VC funding, no token, points programme, $1B TVL. He commits 6 months of gas costs farming it.',
      outcome: 'The protocol delays their token indefinitely, then announces the points programme will not convert to tokens. James spent approximately $800 in gas for zero return. Airdrop potential identification is probabilistic, not certain. The correct response to even strong signals: only engage via protocols genuinely useful to your DeFi activity. The gas cost of farming is only rational if you would use the protocol anyway.',
    },
  ],

  keyTakeaway: 'Identify airdrop candidates by four signals: major VC funding with no token, token placeholders in contracts, active points programmes, and meaningful TVL without token incentives. Then engage genuinely — treating the airdrop as bonus, not primary purpose.',

  guidedPractice: [
    {
      question: 'A protocol raises $200M from a16z but has no public token and $3B in TVL. What does this suggest?',
      options: [
        'The protocol is too established to need a token anymore',
        'Strong airdrop potential — large VC backing requires an exit mechanism and protocols at this scale typically decentralise governance via token distribution',
        'They are applying for a CEX listing which requires no token',
        'This is a red flag — legitimate protocols always launch tokens with their initial raise',
      ],
      correct: 1,
      hint: 'How do a16z and similar VCs realise returns on their investment in a protocol without a public token?',
      explanation: 'VC investors need liquidity events. For a crypto protocol, a token launch is typically the primary mechanism. A protocol with $200M raised, $3B TVL, and no token is in the pre-distribution phase — the token launch is how investors will eventually be able to realise returns and how the protocol will transfer governance to the community. This structural logic makes eventual token distribution highly probable, though not certain.',
    },
    {
      question: 'What does a "points programme" without a stated reward purpose typically signal?',
      options: [
        'A gamification feature for user engagement with no financial component',
        'Airdrop preparation — the protocol is building the scoring infrastructure needed to distribute tokens to active users when ready',
        'A beta testing programme where points convert to protocol fee discounts',
        'A bug bounty system rewarding security researchers',
      ],
      correct: 1,
      hint: 'Why would a protocol build a points tracking system if not to eventually use those points for something?',
      explanation: 'Points programmes require significant engineering to build and maintain. A protocol that tracks user activity points with no stated purpose is investing in that infrastructure for a reason — typically to use the points as the scoring basis for a future token distribution. The points data allows them to identify and reward genuine users at distribution time. Blast, EigenLayer, and Hyperliquid all ran points programmes before their respective distributions.',
    },
    {
      question: 'A protocol has $800M TVL with zero token incentives. Why does this signal higher-quality airdrop potential?',
      options: [
        'Higher TVL protocols always distribute larger per-wallet allocations',
        'TVL without token incentives means users are there for genuine utility, not yield farming. The user base is authentically engaged, making their addresses higher-quality recipients',
        'Protocols without token incentives are legally required to distribute tokens eventually',
        'Higher TVL creates more fees, which fund larger airdrop allocations',
      ],
      correct: 1,
      hint: 'Why do people normally provide liquidity to DeFi protocols? What changes if there\'s no token reward?',
      explanation: 'Most DeFi TVL is attracted by token emissions (farming rewards). Remove token incentives and TVL represents genuine users who find the protocol\'s actual function valuable — borrowers who need loans, traders who want liquidity, protocols who use the infrastructure. This is a higher-quality user base. When the token eventually launches, these genuine users receive allocations. Their historical activity is also a stronger signal in Sybil detection systems.',
    },
    {
      question: 'You identify a strong airdrop candidate with all four signals. What is the correct approach to participating?',
      options: [
        'Maximise transaction count as quickly as possible to ensure qualification',
        'Use the protocol genuinely for its intended purpose as part of your normal DeFi activity — treating the airdrop as a potential bonus, not the primary motivation',
        'Create multiple wallets to multiply your allocation across all four signals',
        'Wait until the airdrop is officially announced before engaging to ensure qualification rules are clear',
      ],
      correct: 1,
      hint: 'What user behaviour do protocols actually want to reward? What does genuine engagement look like?',
      explanation: 'The correct approach mirrors what the protocol wants to reward: genuine users who find the protocol useful. Using it for its intended purpose generates the organic usage patterns that score highest in sophisticated systems. Maximising transaction count looks like farming. Multiple wallets risks Sybil exclusion. Waiting for the announcement means you miss the pre-announcement time-weighting multiplier. Genuine usage is both the ethical approach and the highest-scoring approach.',
    },
    {
      question: 'You spend $600 in gas farming a protocol with all four signals. The airdrop distributes tokens worth $300. What was the outcome and what should you have done differently?',
      options: [
        'The airdrop was a success — $300 received is always better than $0',
        'Negative return: you lost $300 net. The correct approach: only engage via protocols genuinely useful to your normal DeFi activity. If the protocol provides no independent value, the farming cost cannot be justified',
        'This outcome is normal — airdrops always return less than gas costs',
        'You should have used more wallets to increase the return',
      ],
      correct: 1,
      hint: 'What is the net return? What would have made the gas cost rational regardless of the airdrop?',
      explanation: '$300 received − $600 gas = −$300 net loss. The activity was not worth doing for the airdrop alone. The rational framework: use protocols that provide genuine value to your DeFi life. If the protocol\'s features are useful to you, the gas cost is justified by the utility regardless of any airdrop. The airdrop then becomes genuine upside on top of protocols you would use anyway. Farming protocols purely for airdrop returns, with no independent utility, has negative expected value after accounting for gas costs and uncertain distribution.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 111 — Multi-Chain Farming: Cost vs Expected Value Analysis
// ─────────────────────────────────────────────────────────────────────────────

const L111: IslandLevel = {
  id: 111, mechanic: 'chain', tier: 'pro',
  topic: 'Multi-Chain Farming — Cost vs Expected Value Analysis',

  explanation: `In retrospect, farming Arbitrum before the March 2023 airdrop had exceptional expected value: the median qualifying wallet received approximately 1,250 ARB (~$1,500 at launch). The median gas cost to qualify was approximately $50–$80 across several months of activity. A 15–25× return on gas costs invested.

But this calculation only works in retrospect. Before the snapshot, no one knew the airdrop was coming, the allocation tier structure, or the token price. Expected value analysis requires honest probability estimates about all three — and those estimates are usually more uncertain than farming guides suggest.

The honest multi-chain EV framework:

P(airdrop happens) × P(you qualify given activity) × estimated token value − gas costs = expected value

For a protocol with all four signals and 6 months of genuine activity: P(airdrop) might be 60%. P(qualifying) at a meaningful tier: 70%. Estimated value (historical median): $400. Gas cost: $100.

EV = 0.60 × 0.70 × $400 − $100 = $68.

Not the hundreds or thousands some guides promise. The expected value of multi-chain farming, when computed honestly, is often modestly positive to slightly negative — not the systematic wealth generator it is sometimes portrayed as.

The one scenario where the math strongly works: if you would use the protocol anyway for genuine DeFi purposes. Then gas cost is near zero (you were going to spend it anyway), and the airdrop is pure upside.`.trim(),

  fact: 'Arbitrum airdrop EV in hindsight: ~$1,500 median return on ~$60 gas = 25× return. But EV only computes positively in hindsight. Prospective EV calculations are honest only when accounting for probability of airdrop, qualifying tier, AND realistic token value at distribution.',
  plain: 'The math of airdrop farming is usually better-looking in hindsight than in advance. When you account for probability of receiving anything, the expected value is modest at best. The exception: when the protocol provides genuine value regardless of airdrop.',
  stars: [680, 840, 1050], target: 1050, coins: 46,
  simulatorLesson: 'airdropExpectedValue',

  examples: [
    {
      contextTag: '[Honest EV calculation]',
      scenario: 'James evaluates whether to spend 3 months and $200 in gas farming a new L2 with strong airdrop signals. He builds an honest EV model.',
      outcome: 'P(airdrop in 12 months) = 55%. P(qualifying at Tier 2+) = 65%. Expected token value at distribution based on comparable airdrops: $350. EV = 0.55 × 0.65 × $350 − $200 = $125 − $200 = −$75. Negative expected value. He only proceeds if he finds the L2 genuinely useful for existing DeFi activity, which would reduce his effective gas cost to near zero.',
    },
    {
      contextTag: '[Genuine use case positive EV]',
      scenario: 'Amara already uses a specific DEX on a new chain for her regular token swaps — she would be there anyway. The chain has airdrop signals.',
      outcome: 'Her effective gas cost for airdrop purposes: $0 (she was going to spend it anyway). EV = P(airdrop) × P(qualify) × expected value − $0 = pure upside. Even with pessimistic probability estimates (30% × 60% × $400), her EV is $72 on zero additional cost. When gas cost is zero, any positive probability of airdrop is positive EV. This is why "use protocols you find genuinely useful" is not just ethical advice — it is mathematically superior strategy.',
    },
    {
      contextTag: '[Portfolio of farms]',
      scenario: 'Marcus evaluates 8 airdrop candidates simultaneously. He calculates EV for each using consistent probability estimates.',
      outcome: 'Results: 3 candidates have positive EV even with pessimistic estimates (protocols he would use anyway). 3 have slightly negative EV (marginal gas costs, uncertain distributions). 2 are clearly negative EV (high gas cost, low probability, no independent utility). He engages actively with the 3 positive EV protocols, monitors the 3 marginal ones, and skips the 2 negative EV ones entirely. Portfolio approach applied to EV analysis rather than farming everything.',
    },
  ],

  keyTakeaway: 'Airdrop EV = P(airdrop) × P(qualifying) × estimated value − gas costs. When computed honestly, most prospective farming is modestly positive to slightly negative EV. The exception: protocols you find genuinely useful, where gas cost approaches zero.',

  guidedPractice: [
    {
      question: 'You estimate: 50% chance of airdrop, 60% chance of qualifying at meaningful tier, $500 expected value, $150 gas cost. What is your expected value?',
      options: ['$150', '$0', '$0 (breakeven — EV is zero)', '$−0'),
      ],
      correct: 0,
      hint: '0.50 × 0.60 × $500 − $150 = ?',
      explanation: '0.50 × 0.60 = 0.30. 0.30 × $500 = $150 expected return. $150 − $150 gas = $0. This farming opportunity is exactly breakeven in expectation — neither positive nor negative EV. Whether to proceed depends on your risk tolerance: you might receive $500 (positive outcome) or $0 (negative outcome from probability failing). Expected value of $0 does not mean you get $0 — it means the probability-weighted outcome is neutral.',
    },
    {
      question: 'Why is retrospective EV calculation (after an airdrop happens) misleading for future farming decisions?',
      options: [
        'Retrospective calculations use different formulas than prospective ones',
        'Retrospective calculations use actual outcomes (P = 1, actual value known) rather than probabilities. Prospective decisions face uncertain P(airdrop), P(qualifying), and unknown future token values',
        'Only the first airdrop for each protocol can be used for retrospective analysis',
        'Retrospective calculations are more accurate because they include more data',
      ],
      correct: 1,
      hint: 'In hindsight, the Arbitrum airdrop happened with probability 1. Before the snapshot, what was the probability?',
      explanation: 'Retrospective: Arbitrum airdrop happened (P=1), 1,250 ARB distributed (known), $1.20 token price at listing (known). EV = 1 × 1 × $1,500 = $1,500 vs $60 gas. Looks amazing. Prospective (before snapshot): P(airdrop within 12 months) = maybe 50%, P(qualifying at 1,250+ ARB tier) = maybe 40%, P(token > $0.50 at listing) = maybe 70%. EV = 0.50 × 0.40 × 0.70 × $1,500 = $210 vs $60 gas = $150 positive. Still positive — but very different from the retrospective $1,500 comparison.',
    },
    {
      question: 'What makes "protocols you already use" the mathematically superior airdrop strategy?',
      options: [
        'You are guaranteed a higher allocation by being a genuine user',
        'Your effective incremental gas cost for airdrop purposes approaches zero, making any positive probability of receiving tokens positive EV',
        'Protocols detect genuine users and give them 3× the allocation of farmers',
        'The fewer protocols you use, the higher your score per protocol',
      ],
      correct: 1,
      hint: 'What happens to EV = P × value − gas_cost when gas_cost = 0?',
      explanation: 'EV = P(airdrop) × P(qualify) × value − gas_cost. If gas_cost = 0 (you were transacting anyway), then EV = P × value, which is always positive as long as P > 0 and value > 0. Even a 10% probability of a $100 airdrop = $10 positive EV on zero additional cost. This is why the strategy "use protocols you find genuinely useful" dominates "farm protocols for airdrop returns" — it converts every protocol interaction into zero-cost airdrop exposure.',
    },
    {
      question: 'A farming guide claims: "Spend $500 farming these 5 chains for guaranteed $5,000+ in airdrops." What is wrong with this claim?',
      options: [
        'You cannot farm 5 chains simultaneously due to wallet limitations',
        'Airdrop returns are never guaranteed — probability of each event occurring, probability of qualifying, and token value at distribution are all uncertain. The $5,000 estimate requires all probabilities to resolve favourably',
        'The $500 gas cost is underestimated for 5 chains',
        'Nothing — this is a reasonable expected return for well-funded protocols',
      ],
      correct: 1,
      hint: 'What would "guaranteed" require? How many uncertain variables are involved?',
      explanation: 'For $5,000 to be guaranteed: every chain must airdrop (5 separate probability events, each < 100%), you must qualify at the claimed tier (not certain), the tokens must hold value at distribution (market risk), and you must not be Sybil-excluded (farming risk). Multiplying these probabilities together: even if each individual probability is 80%, five events at 80% each = 0.8^5 = 33% probability of all succeeding simultaneously. "Guaranteed" returns are impossible in airdrop farming.',
    },
    {
      question: 'After honest EV analysis, you find 2 of 6 evaluated protocols have positive EV and 4 have negative EV. What is the optimal strategy?',
      options: [
        'Farm all 6 — more farms = more chances of a big return',
        'Farm only the 2 positive EV protocols (that you also find genuinely useful), skip or minimally engage with the 4 negative EV ones',
        'Skip all 6 — any negative EV in the portfolio makes the strategy invalid',
        'Farm the 4 negative EV protocols more intensively to improve their returns',
      ],
      correct: 1,
      hint: 'What does negative EV mean for your expected outcome on those 4 protocols?',
      explanation: 'Negative EV means the expected cost exceeds the expected return. Farming all 6 adds the negative EV of 4 protocols to your total outcome — reducing your overall expected return. The optimal strategy: deploy gas only on positive EV opportunities. Skip negative EV opportunities unless the protocol has genuine utility for you (which would make the effective gas cost zero, potentially turning it positive EV). Portfolio EV = sum of individual EVs — negative EV positions always reduce the total.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 112 — Testnet Participation and Points Programmes
// ─────────────────────────────────────────────────────────────────────────────

const L112: IslandLevel = {
  id: 112, mechanic: 'memory', tier: 'pro',
  topic: 'Testnet Participation and Points Programmes',

  explanation: `In 2023, EigenLayer launched a restaking programme with no token and no stated distribution. Users deposited ETH into their restaking contracts and accumulated "points" with no announced conversion rate. By early 2024, over $15 billion had been deposited. When the EIGEN token launched, points converted to tokens — but at a conversion rate significantly lower than most participants anticipated. The airdrop delivered value, but far less per-point than speculative estimates suggested.

Testnet participation and points programmes are the primary mechanism modern protocols use to identify and reward early users before mainnet launch. Understanding both — and their risks — is essential for anyone engaging with pre-launch protocols.

Testnet participation: protocols run test networks using fake currency before launching with real assets. Testnets let protocols debug their systems with real user behaviour. Some protocols reward testnet participants (those who reported bugs, used test features, maintained nodes) with mainnet allocations.

Points programmes: on mainnet but pre-token, protocols track user activity in a points system. Unlike testnets, real assets are used. Points are meant to be converted to tokens but this is rarely legally binding — the protocol can cancel, dilute, or change conversion rates at any time.

Key risks: points programmes can be cancelled without compensation, conversion rates are set at launch and often disappoint, points accumulated early may be diluted by later farming, and the "points to token" conversion is a non-binding promise.

The practical approach: testnet participation is zero-cost and worth completing. Points programmes require real assets — only participate if you find genuine value in the protocol independently.`.trim(),

  fact: 'EigenLayer accumulated $15B+ in deposits via points programme before EIGEN launched. Conversion rates were lower than anticipated. Points programmes are non-binding — protocols can cancel, dilute, or change terms at any time.',
  plain: 'Points programmes track your activity before a token exists. They might become tokens — or they might not. They\'re not a contract. Testnets cost nothing and are worth doing. Points programmes with real assets carry real risk.',
  stars: [740, 910, 1140], target: 1140, coins: 48,
  simulatorLesson: 'airdropEligibility',

  examples: [
    {
      contextTag: '[Points dilution reality]',
      scenario: 'Keiko accumulated 50,000 points in a protocol\'s points programme over 4 months. At launch, the protocol issues 100M tokens with 10% allocated to points holders. Total points accumulated by all users: 5 billion.',
      outcome: 'Keiko\'s 50,000 out of 5 billion total points = 0.001% of the points allocation. 10M tokens × 0.001% = 100 tokens. At $1 per token: $100. Her gas costs over 4 months: approximately $180. Net result: -$80. The points programme sounded promising but massive farming diluted every individual\'s share. This is the dilution risk — points are meaningful only relative to total points across all participants.',
    },
    {
      contextTag: '[Testnet worth doing]',
      scenario: 'A major protocol announces a testnet phase where users test their DEX interface using fake tokens. Participation is free (just gas on testnet, which is also free).',
      outcome: 'Marcus spends 2 hours completing the testnet tasks: swapping, providing liquidity, testing the UI. Zero real cost. When the protocol launches and distributes to testnet participants, Marcus qualifies for an allocation based on his testnet activity. The testnet-to-mainnet reward pathway has been used by numerous protocols (Arbitrum, Optimism, LayerZero). Zero-cost participation with potential upside is always positive EV.',
    },
    {
      contextTag: '[Cancelled programme]',
      scenario: 'Amara deposits $8,000 into a points programme for 5 months, accumulating significant points. The protocol announces they are pivoting strategy and the points programme is discontinued with no conversion.',
      outcome: 'Her $8,000 was returned (the protocol returned deposits), but her 5 months of effort and gas costs generated zero return. Points programmes are not contracts — the protocol can cancel without compensation for participant effort. She recovers her principal but loses time, gas costs, and opportunity cost of having $8,000 locked for 5 months. This risk is real and undisclosed in most points programme announcements.',
    },
  ],

  keyTakeaway: 'Testnet participation is zero-cost and positive EV — always complete it. Points programmes use real assets with non-binding conversion promises — only participate via protocols with genuine independent utility. Dilution risk is the most underestimated points programme risk.',

  guidedPractice: [
    {
      question: 'Why is testnet participation always positive expected value?',
      options: [
        'Testnet tokens are worth money from the start',
        'Cost is zero (testnet gas is free, assets are fake) while potential reward (mainnet allocation) is non-zero — any positive probability × non-zero reward on zero cost = positive EV',
        'Protocols are legally required to reward all testnet participants',
        'Testnet activity is weighted 10× higher than mainnet activity in scoring systems',
      ],
      correct: 1,
      hint: 'Apply the EV formula: P(reward) × value − cost. What is the cost?',
      explanation: 'EV = P(reward) × value − cost. On a testnet: cost = 0 (no real assets, testnet gas is free). Therefore EV = P(reward) × value, which is always ≥ 0 as long as P > 0 and value > 0. Even if P(reward) = 5% and value = $50, EV = $2.50 on zero cost. You cannot lose money on testnet participation — the only cost is time, not capital.',
    },
    {
      question: 'You accumulate 100,000 points in a programme where 200 million total points exist. The protocol allocates 5M tokens to points holders. How many tokens do you receive?',
      options: [
        '100,000 tokens — one token per point',
        '2,500 tokens — your 0.05% of total points × 5M token allocation',
        '500,000 tokens — bonus multiplier for early participation',
        '50 tokens — the protocol caps individual allocations at 50',
      ],
      correct: 1,
      hint: '100,000 ÷ 200,000,000 = ? Then multiply by 5,000,000.',
      explanation: '100,000 / 200,000,000 = 0.05% of total points. 0.05% × 5,000,000 tokens = 2,500 tokens. At $1 per token: $2,500. This is why total points accumulated by all participants matters enormously — your absolute point count is irrelevant; your percentage of total matters. When farming becomes widespread, individual shares are diluted by the total pool.',
    },
    {
      question: 'What is the primary legal risk of depositing assets into a points programme?',
      options: [
        'Points programmes are illegal in most jurisdictions',
        'Points are non-binding — the protocol can change conversion rates, cancel the programme, or delay indefinitely without owing participants compensation beyond returning their deposited assets',
        'Tax authorities treat points as income at the time of accumulation',
        'Deposited assets can be seized if the protocol faces regulatory action',
      ],
      correct: 1,
      hint: 'Is a points programme a legally binding contract to issue tokens?',
      explanation: 'Points programmes are typically described in terms like "may convert to tokens" or "subject to future governance decisions" — deliberately non-binding language. The protocol retains the right to change conversion rates (often lower than implied), extend timelines indefinitely, or cancel entirely. Users\' principal deposits are usually protected, but the "points to tokens" promise is a social commitment, not a legal one. This is the key distinction from a security or a binding agreement.',
    },
    {
      question: 'EigenLayer accumulated $15B in its points programme. Why did actual per-user token allocations disappoint many participants?',
      options: [
        'EigenLayer cancelled the points programme without any token distribution',
        'The massive total deposits meant each individual\'s percentage share was very small — $15B from millions of participants severely dilutes each person\'s proportional claim',
        'EIGEN tokens launched at a very high price making the allocation seem small in quantity',
        'EigenLayer only distributed to participants who deposited before a specific date',
      ],
      correct: 1,
      hint: 'If $15B deposited by millions of people, what is each person\'s share of the total points?',
      explanation: 'When a points programme attracts $15B from potentially millions of users, each individual\'s percentage of total points is tiny. Even a depositor with $50,000 (well above average) represents 0.00033% of $15B total. The token allocation for 0.00033% of points was modest relative to speculative estimates that assumed much lower total participation. Dilution is the core mechanism: the more people farm a points programme, the less each individual receives.',
    },
    {
      question: 'A points programme requires depositing $5,000 in a protocol you do not find independently useful. The estimated return is $800. Should you participate?',
      options: [
        'Yes — any positive return is worth pursuing',
        'Evaluate carefully: $5,000 at risk for a non-binding $800 promise carries meaningful downside (cancelled programme, lower actual conversion, capital locked during opportunity cost period) that makes this risk-adjusted return marginal at best',
        'Yes, if the protocol has raised more than $50M from VCs',
        'Only if you have other funds available — never use your last $5,000',
      ],
      correct: 1,
      hint: 'What happens to your $5,000 if the programme is cancelled or conversion rate changes?',
      explanation: 'The $800 estimate is based on uncertain conversion rates that protocols can change. Your $5,000 is locked for the programme duration (opportunity cost). If cancelled: $5,000 returned but time and opportunity cost lost. If conversion rate reduced: $800 estimate becomes $200 actual. For a protocol you would use anyway, this risk is acceptable (zero additional opportunity cost). For a protocol you find no independent value in, locking $5,000 for a non-binding $800 promise has a risk-adjusted return that is probably negative.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 113 — Tax Treatment of Received Airdrops
// ─────────────────────────────────────────────────────────────────────────────

const L113: IslandLevel = {
  id: 113, mechanic: 'chain', tier: 'pro',
  topic: 'Tax Treatment of Received Airdrops',

  explanation: `In 2023, thousands of Arbitrum airdrop recipients discovered they owed income tax on their ARB tokens — not just capital gains tax when they sold, but income tax when they received them. In the US, the IRS treats airdropped tokens as ordinary income at their fair market value on the date of receipt. In the UK, HMRC similarly treats airdrops as miscellaneous income. The discovery of this tax obligation after spending or losing the tokens created genuine hardship for some recipients.

The tax treatment of airdrops follows a consistent logic in most major jurisdictions:

Receipt = taxable income event: when you receive airdropped tokens, you owe income tax on their fair market value at the time of receipt. You must record the date and value of every airdrop.

Cost basis established: the value at which you were taxed (fair market value at receipt) becomes your cost basis for future capital gains calculations. If you received 1,000 ARB at $1.20, your cost basis is $1,200. If you later sell at $0.80, you have a capital loss of $0.80 × 1,000 = $800 (which offsets other gains).

The cliff scenario: a token that is worth $5,000 on receipt day but falls to $500 over the following months creates a situation where you owe income tax on $5,000 but only have $500 of value remaining. This cliff risk is one of the most significant and underappreciated airdrop tax risks.

Practical management: sell enough tokens at receipt to cover your anticipated tax liability. Never spend or transfer airdropped tokens before securing sufficient funds for tax payment.`.trim(),

  fact: 'Airdrops are taxable income at receipt in most jurisdictions (US, UK, Australia) at fair market value on the day received. This value becomes your cost basis. The cliff risk: owing tax on $5,000 when the token is later worth $500.',
  plain: 'When you receive airdropped tokens, you owe income tax on their value that day — before you sell anything. Record the receipt date and value. Sell some immediately to cover the tax if the token value is significant.',
  stars: [800, 985, 1230], target: 1230, coins: 52,
  simulatorLesson: 'airdropScamDrill',

  examples: [
    {
      contextTag: '[Cliff risk materialised]',
      scenario: 'James receives 2,000 PROTO tokens on March 1st. Trading price: $4.00 per token. Total value: $8,000. He holds all tokens hoping for further gains. By December, PROTO is at $0.40.',
      outcome: 'James owes income tax on $8,000 (the receipt value). At a 40% marginal rate: $3,200 in tax. But his tokens are now worth only 2,000 × $0.40 = $800. He must pay $3,200 in tax on income that is now worth $800. He also has a capital loss of $8,000 − $800 = $7,200, which offsets future gains — but the cash tax liability must still be paid. The cliff risk was real and devastating.',
    },
    {
      contextTag: '[Immediate sell to cover tax]',
      scenario: 'Amara receives 5,000 PROTO tokens on launch day at $3.50 per token ($17,500 total). Her marginal tax rate is 45%. She estimates her tax liability immediately.',
      outcome: 'Tax liability: $17,500 × 45% = $7,875 owed in income tax. She immediately sells 2,250 tokens at $3.50 = $7,875. This covers her tax liability. She retains 2,750 tokens as a free position (the tax cost is already covered). If PROTO rises, her remaining 2,750 tokens generate gains taxed at capital gains rates (lower). If it falls to zero, she still paid her tax correctly and walks away without additional liability.',
    },
    {
      contextTag: '[Cost basis in practice]',
      scenario: 'Keiko received 1,000 ENS tokens in November 2021 at $20 each ($20,000 income reported). She sells 500 ENS three years later at $35 each.',
      outcome: 'Her cost basis per token: $20 (the income tax value). Proceeds: 500 × $35 = $17,500. Cost basis: 500 × $20 = $10,000. Capital gain: $7,500. She already paid income tax on the $20,000 receipt value in 2021. Now she pays capital gains tax only on the $7,500 appreciation above cost basis. Double-counting the original income is correctly avoided by the cost basis system — but only if she recorded the receipt correctly at the time.',
    },
  ],

  keyTakeaway: 'Airdrops create income tax liability at receipt (based on fair market value that day), which becomes your cost basis for future capital gains. Cliff risk: owing tax on high-value tokens that later collapse. Sell enough at receipt to cover estimated tax.',

  guidedPractice: [
    {
      question: 'You receive 3,000 airdropped tokens on January 15th at $2.50 per token. Your marginal income tax rate is 40%. How much income tax do you owe and when?',
      options: [
        '$0 — airdropped tokens are not income until sold',
        '$3,000 income tax, due when you file for the tax year containing January 15th',
        '$3,000 income tax, due only when you sell the tokens',
        '$1,200 income tax at 40% on $3,000 total value',
      ],
      correct: 1,
      hint: '3,000 tokens × $2.50 = $7,500 value received. 40% × $7,500 = ?',
      explanation: '3,000 × $2.50 = $7,500 total receipt value. 40% × $7,500 = $3,000 income tax owed. This is due in your income tax filing for the year of receipt — not when you sell. The receipt date triggers the income event. This is why recording every airdrop receipt date and value at the time of receipt is essential — retroactive reconstruction is difficult and error-prone.',
    },
    {
      question: 'You received 1,000 tokens at $5 each (paid income tax at receipt). You later sell at $3 each. What is your capital gains position?',
      options: [
        'A $2,000 capital gain (selling at $3 generates income)',
        'A $2,000 capital loss (sold at $3 vs cost basis of $5 per token)',
        'Zero — you already paid tax at receipt',
        'A $5,000 capital gain (full sale proceeds)',
      ],
      correct: 1,
      hint: 'Cost basis = $5 (income tax value). Proceeds = $3. Gain/loss = proceeds − cost basis.',
      explanation: 'Cost basis per token: $5 (the value on which you paid income tax at receipt). Sale proceeds: 1,000 × $3 = $3,000. Cost basis: 1,000 × $5 = $5,000. Capital gain/loss: $3,000 − $5,000 = −$2,000 capital loss. This loss can offset other capital gains in the same tax year, reducing your overall tax liability. The income tax you paid at receipt was on the $5 value; the capital loss reflects the subsequent decline.',
    },
    {
      question: 'What is "cliff risk" in the context of airdrop taxation?',
      options: [
        'The risk that an airdrop will be distributed from a cliff vesting schedule',
        'Owing income tax on the high receipt value of tokens that have since fallen dramatically — you may owe more tax than your current token value',
        'The risk of losing airdrop qualification at the last moment before snapshot',
        'Tax penalties for reporting airdrops late to tax authorities',
      ],
      correct: 1,
      hint: 'What happens if you receive tokens worth $10,000 on day 1 but they fall to $500 by tax filing time?',
      explanation: 'Cliff risk: tokens received at $10,000 trigger $4,000 income tax (at 40%). If tokens fall to $500 by filing time, you have $3,500 left but owe $4,000. You must pay $4,000 in cash even though your remaining position covers only $500 of it. The tokens can be sold for a capital loss of $9,500 (offsetting future gains) but the cash tax payment is still required immediately. Many airdrop recipients face this scenario when they hold received tokens through price collapses.',
    },
    {
      question: 'What is the optimal immediate action when receiving a large airdrop at significant market value?',
      options: [
        'Hold all tokens — selling immediately realises tax and misses potential gains',
        'Sell enough tokens to cover your estimated income tax liability, securing the funds before any price decline',
        'Transfer tokens to a hardware wallet to delay the taxable event',
        'Hold for 12 months to qualify for long-term capital gains rates on all tokens',
      ],
      correct: 1,
      hint: 'The income tax is owed regardless of whether you sell. What do you need to pay it?',
      explanation: 'Income tax on airdrop receipt is owed regardless of whether you sell the tokens. The tax liability is denominated in your local currency. To pay it, you need local currency. Selling enough tokens immediately at the receipt price to cover estimated tax liability (typically: receipt value × marginal rate) ensures you always have funds to pay. If you hold all tokens and they fall 90%, you still owe the full tax on the original receipt value — but now lack the funds to pay it.',
    },
    {
      question: 'Your tax jurisdiction requires you to report the fair market value of received airdrops. You receive tokens on a day they are illiquid (very few trades, wide bid-ask spread). How do you value them?',
      options: [
        'Use zero — illiquid tokens have no market value',
        'Use the last traded price on the receipt date, even if illiquid, as this is the best available market data. Document your methodology.',
        'Use the token\'s whitepaper target price',
        'Wait until the token is liquid before reporting',
      ],
      correct: 1,
      hint: 'Tax authorities require best available market data. What is available for illiquid tokens?',
      explanation: 'Use the last traded price at the time of receipt as the fair market value, even if the market is illiquid. Document your methodology — the price source, timestamp, and basis for your valuation. Illiquid markets create genuine uncertainty in valuation, and tax authorities typically accept reasonable, documented methodologies. Using zero (treating illiquid = worthless) is aggressive and likely incorrect. Waiting to report until the token is liquid is not legally permitted — the taxable event occurs at receipt.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L106–113)
// ─────────────────────────────────────────────────────────────────────────────

export const AIRDROP_LEVELS_A: Record<number, IslandLevel> = {
  106: L106,
  107: L107,
  108: L108,
  109: L109,
  110: L110,
  111: L111,
  112: L112,
  113: L113,
};
