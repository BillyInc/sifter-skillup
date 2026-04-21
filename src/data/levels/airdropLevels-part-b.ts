// ⚡ Sifter SkillUp — Airdrop Archipelago (Island 10, Levels 106–120)
// Part B of 2 — Levels 114–120

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { AIRDROP_LEVELS_A } from './airdropLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 114 — Fake Airdrop Claim Scams: Recognition and Avoidance
// ─────────────────────────────────────────────────────────────────────────────

const L114: IslandLevel = {
  id: 114, mechanic: 'match3', tier: 'pro',
  topic: 'Fake Airdrop Claim Scams — Recognition and Avoidance',

  explanation: `In March 2023, a crypto user received a Discord DM: "Congratulations! Your wallet qualifies for the Arbitrum airdrop. Claim your 3,500 ARB here: [link]." The link led to a convincing replica of the Arbitrum website. She connected her wallet and approved a transaction — which was actually a token approval giving the scammer full access. Within 3 minutes, $12,000 of assets were drained.

Fake airdrop scams are the most common and most successful phishing attack in crypto. They work because the emotional state of an airdrop announcement — excitement, urgency, desire to claim before deadline — overrides the rational verification steps users know they should take.

The anatomy of a fake airdrop:

The hook: a message claiming you qualify for an airdrop — via Discord DM, Twitter reply, Telegram, or email. The message creates urgency ("claim within 24 hours") and legitimacy ("official Arbitrum team").

The site: a professionally designed website with the correct branding, often at a domain one character different from the real one (arbitrrum.io vs arbitrum.io, airdrop-arbitrum.com).

The connect: "Connect your wallet to verify eligibility." Legitimate airdrops do not require wallet connection to check eligibility — they publish a checker tool where you paste your address.

The drain: the actual transaction is a token approval or a direct asset transfer presented as a "verification fee" or "gas optimisation." Approving it gives the scammer full access.

The rule without exceptions: legitimate airdrops are claimed through the official protocol website, found through official documentation or the protocol's verified Twitter account — never through links in DMs, emails, or Discord messages.`.trim(),

  fact: 'Fake airdrop scams use urgency + legitimacy to bypass rational verification. The rule: legitimate airdrops are never announced via DM, email, or Discord. Find the claim page through the protocol\'s official documentation only.',
  plain: 'If someone DMs you about an airdrop claim link, it\'s a scam. Always. Find the real airdrop claim page by going to the official website directly — never through any link sent to you.',
  stars: [860, 1060, 1325], target: 1325, coins: 56,
  simulatorLesson: 'airdropScamDrill',

  examples: [
    {
      contextTag: '[DM scam recognition]',
      scenario: 'Marcus receives a Twitter DM from @ArbitrumOfficial_ (note the underscore): "Your wallet qualifies for 2,800 ARB. Limited time. Claim: [link]." The profile has 12,000 followers and a blue checkmark.',
      outcome: 'Red flags: DM from any account (legitimate airdrops do not contact via DM), subtle username modification (@ArbitrumOfficial_ vs @arbitrum), urgency language, direct link in message. Marcus searches for "Arbitrum airdrop" on Google, goes to arbitrum.io directly, checks their verified Twitter for any airdrop announcement. No announcement exists. He reports the account and blocks it. The 12,000 followers and blue checkmark are purchased — meaningless indicators of legitimacy.',
    },
    {
      contextTag: '[Site verification drill]',
      scenario: 'Keiko sees a tweet claiming she qualifies for a new protocol airdrop. She clicks the link and arrives at "airdrop-starknet.com" — which looks exactly like the real Starknet website.',
      outcome: 'She checks the URL carefully: "airdrop-starknet.com" versus the real "starknet.io". Different domain entirely. Legitimate airdrop claim pages are always on the protocol\'s primary domain or a clearly linked subdomain (claim.arbitrum.io, not arbitrum-claim.com). She navigates directly to starknet.io and checks their official announcements. No matching airdrop. The site was a drainer designed to steal wallet approvals.',
    },
    {
      contextTag: '[Approval transaction red flag]',
      scenario: 'Amara is on what appears to be the correct Uniswap website. She connects her wallet to check eligibility. A transaction appears asking her to "approve UNI token access to verify your eligibility."',
      outcome: 'Legitimate eligibility checks do not require wallet connection — you paste your address into a checker. A transaction asking for token approval is a wallet drainer, not an eligibility check. Approving it grants the scammer permission to transfer all UNI from her wallet. She rejects the transaction immediately and checks her wallet approvals (revoke.cash) to ensure no prior approvals were compromised. The real Uniswap airdrop was claimable by entering your address with no wallet connection required.',
    },
  ],

  keyTakeaway: 'Fake airdrop scams use urgency, legitimate-looking sites, and wallet approval transactions to drain assets. The absolute rule: find claim pages through official documentation only — never through links in DMs, emails, or unsolicited messages.',

  guidedPractice: [
    {
      question: 'You receive a Discord DM saying "You\'ve qualified for the LayerZero airdrop. Claim here: [link]. Expires in 12 hours." What is this?',
      options: [
        'A legitimate airdrop notification — protocols use Discord to reach users directly',
        'A phishing scam — legitimate airdrops are never announced via DM, and urgency language is a manipulation tactic',
        'Possibly legitimate — check if the sender is a server moderator',
        'Legitimate if the link goes to layerzero.network domain',
      ],
      correct: 1,
      hint: 'Have you ever seen a legitimate airdrop announcement delivered via DM rather than public announcement?',
      explanation: 'No legitimate airdrop has ever been distributed via personal DM. Protocols with millions of users cannot contact each individually — they announce publicly and allow users to check eligibility. The urgency language ("expires in 12 hours") is a manipulation tactic designed to prevent the rational verification step of checking the official website. This is a scam regardless of who appears to have sent it.',
    },
    {
      question: 'You find a site at "claim-arbitrum.xyz" that looks exactly like the Arbitrum website. What is the correct verification step?',
      options: [
        'Connect your wallet — if it connects successfully, the site is legitimate',
        'Check the domain against the official Arbitrum documentation. Legitimate Arbitrum claim pages are at arbitrum.io or clearly linked subdomains — not claim-arbitrum.xyz',
        'Check if the site has HTTPS — secure sites are legitimate',
        'Look for the Twitter bird logo — scam sites cannot use it',
      ],
      correct: 1,
      hint: 'What is the authoritative source for the correct URL of an official claim page?',
      explanation: 'The domain is the only reliable legitimacy check. Scammers can copy entire website designs, add HTTPS certificates (which only prove the connection is encrypted, not that the site is legitimate), and use convincing branding. The correct URL is found in the protocol\'s official documentation (GitHub, docs site) or from their verified social media account — not from Google search results or links in messages, which can both be compromised. "claim-arbitrum.xyz" is not a subdomain of arbitrum.io — it is a completely different domain.',
    },
    {
      question: 'A legitimate airdrop claim page asks you to "connect your wallet to verify eligibility." What is wrong with this?',
      options: [
        'Nothing — wallet connection is required to prove you own the address',
        'Legitimate eligibility verification requires only your public address — connecting your wallet and approving transactions grants the site powers that a legitimate checker does not need',
        'Only hardware wallets should connect to claim pages',
        'Wallet connection is required but only if you are claiming, not checking',
      ],
      correct: 1,
      hint: 'What does "connecting a wallet" technically enable that pasting an address does not?',
      explanation: 'Pasting a public address into a checker gives the site read-only information — your balance and transaction history, all publicly visible anyway. Connecting a wallet enables the site to request transaction signatures. On a scam site, the "verify eligibility" button triggers a token approval transaction — granting the scammer permission to transfer tokens. Legitimate eligibility checkers need only your address. Any request to connect your wallet or sign a transaction during "eligibility verification" is a red flag.',
    },
    {
      question: 'How should you find the legitimate claim page for an announced airdrop?',
      options: [
        'Google "protocol name airdrop claim" and use the first result',
        'Navigate directly to the protocol\'s primary domain (e.g., arbitrum.io), find the airdrop announcement in their official blog or docs, and follow the link from there',
        'Use the link shared in the protocol\'s Discord announcement channel',
        'Ask other users in community forums for the correct link',
      ],
      correct: 1,
      hint: 'Which source of a URL is most difficult to spoof?',
      explanation: 'Google search results can include sponsored scam sites ranked above official pages. Discord channels can be compromised or contain bot messages. Community forums contain user-generated links of uncertain legitimacy. The only reliable source: navigate directly to the protocol\'s primary domain (which you type yourself or have bookmarked), find their official airdrop announcement, and follow the link from there. The primary domain is the root of trust — anything linked from it inherits its legitimacy.',
    },
    {
      question: 'After checking your Ethereum wallet on revoke.cash, you find an approval for an unknown contract with unlimited token access. What does this mean and what should you do?',
      options: [
        'This is normal — all DeFi protocols require unlimited approvals',
        'A past interaction granted this contract permission to transfer your tokens at any time. Revoke this approval immediately to prevent potential future draining',
        'The approval only activates if you visit the contract\'s website again',
        'Unlimited approvals expire after 30 days automatically',
      ],
      correct: 1,
      hint: 'What does an "unlimited token approval" give a smart contract the ability to do?',
      explanation: 'An unlimited token approval gives a smart contract permission to transfer any amount of that token from your wallet at any time — past, present, or future. The approval remains active indefinitely until you explicitly revoke it. If the contract is malicious (a scam site\'s drainer contract), it can drain your tokens at any moment after you granted approval — even months later. Revoke immediately using revoke.cash (Ethereum/EVM) or the equivalent tool for your chain. After revoking, consider migrating assets to a new wallet if the compromised wallet interacted with the malicious contract.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 115 — When to Stop Farming: Diminishing Returns Analysis
// ─────────────────────────────────────────────────────────────────────────────

const L115: IslandLevel = {
  id: 115, mechanic: 'memory', tier: 'pro',
  topic: 'When to Stop Farming — Diminishing Returns Analysis',

  explanation: `The airdrop farming landscape of 2020–2021 was genuinely different from 2024–2025. Early Uniswap users did nothing special and received $17,000. Early Arbitrum users spent $60 in gas over several months and received $1,500. Each successive cycle required more effort, more gas, and more sophistication — while delivering similar or lower per-wallet returns.

This is the diminishing returns problem: as airdrop farming becomes mainstream knowledge, the effort-to-reward ratio systematically worsens.

Why it gets harder over time: (1) More participants means more total wallets farming each opportunity — diluting each individual's share. (2) Protocols raise qualification criteria in response to farming — adding governance requirements, NFT ownership, longer time periods, higher TVL thresholds. (3) Sybil detection improves — strategies that worked in 2021 are excluded in 2024. (4) The most valuable opportunities are now identified and farmed immediately — the window of pre-announcement genuine use has narrowed.

The honest analysis for 2024–2025: straightforward airdrop farming (interact with protocol, receive tokens) is still positive EV in specific circumstances:
- Protocols you find genuinely useful regardless of airdrop
- Testnets (zero cost, always positive EV)
- Very early genuine use of protocols before farming discourse begins
- Layer 2s and new chains in their first 3–6 months of operation

It is likely negative EV in: protocols already widely known as "airdrop plays," points programmes with massive farming participation, and multi-chain farms requiring significant upfront gas investment.

The decision framework: if you would use this protocol anyway, continue. If you are doing something solely because of airdrop potential, run the honest EV calculation first.`.trim(),

  fact: 'Airdrop farming has steadily worsening EV as more participants enter each cycle. The highest EV opportunities remain: testnets (zero cost), protocols you genuinely use, and very early engagement with pre-hype ecosystems before farming discourse begins.',
  plain: 'Airdrop farming worked better in 2020. It still works — but requires more effort and delivers less per wallet each cycle. The best opportunities are still: use protocols you actually like, and do testnets for free.',
  stars: [920, 1133, 1415], target: 1415, coins: 60,
  simulatorLesson: 'airdropEligibility',

  examples: [
    {
      contextTag: '[Cycle comparison]',
      scenario: 'Three traders compare their airdrop returns across three cycles: Uniswap (2020), Arbitrum (2023), and a 2025 airdrop from a new L2.',
      outcome: 'Uniswap: gas cost $2, return $1,200+ (any genuine user). Arbitrum: gas cost $60, return ~$1,500 (consistent multi-feature engagement). 2025 L2 (widely known farm): gas cost $300, return ~$200 (massive farming dilution, sophisticated Sybil detection excluded many). Each cycle: more effort, more cost, less return. The 2025 returns are still nominally positive for those who engaged early — but the batch of late-arriving farmers received little or nothing.',
    },
    {
      contextTag: '[When to exit a farming campaign]',
      scenario: 'Amara has been farming a protocol for 4 months. The protocol just announced a points update: minimum 6 months of activity required for any allocation. She recalculates.',
      outcome: 'She is halfway through the new minimum. The protocol\'s announcement has caused 200,000 new wallets to join. Expected token value based on comparable protocols: $200–$400. Her new EV: $300 expected return × P(qualify) 65% = $195 vs $120 remaining gas cost = $75 positive. Still positive, but barely. She continues only because the protocol\'s DEX is genuinely useful for her trading — if not, she would stop.',
    },
    {
      contextTag: '[Testnet always wins]',
      scenario: 'Marcus evaluates three opportunities: Testnet A (2 hours, zero cost), Points Programme B ($2,000 deposit, expected $400 return), Widely-known L2 Farm C ($250 in gas, expected $180 return).',
      outcome: 'Testnet A: always positive EV. Complete it. Points Programme B: $400 expected on $2,000 locked = 20% return if fully realised, but non-binding with dilution risk. He skips unless the protocol is independently useful. L2 Farm C: negative EV ($180 expected < $250 gas). Skip. Simple framework: always do testnets, only do points programmes with genuine utility, avoid widely-known farms with negative EV.',
    },
  ],

  keyTakeaway: 'Airdrop farming EV systematically declines as participation grows. The consistently positive-EV activities remain: testnets (always), genuine early use of unknown protocols, and protocols you find independently useful. Calculate honestly before committing gas costs.',

  guidedPractice: [
    {
      question: 'Why does per-wallet airdrop value tend to decrease as more people farm the same protocol?',
      options: [
        'Protocols reduce allocation sizes when they detect farming behaviour',
        'A fixed token allocation divided among more wallets means each wallet receives a smaller share — total farming participation directly dilutes individual returns',
        'More participants cause technical issues that reduce distribution size',
        'Only the first 10,000 wallets receive allocations; additional wallets receive nothing',
      ],
      correct: 1,
      hint: 'If 100M tokens are allocated to users and 10,000 wallets qualify, each gets 10,000 tokens. If 1,000,000 wallets qualify?',
      explanation: 'A fixed allocation divided among 10,000 wallets: 10,000 tokens each. Divided among 1,000,000 wallets: 100 tokens each. The total value distributed is the same, but each individual receives 100× less. As farming becomes mainstream and more participants enter each protocol, the same allocation is divided among a larger pool — systematically reducing per-wallet returns.',
    },
    {
      question: 'You have been farming a protocol for 2 months when it becomes widely discussed as an "airdrop play" in major crypto media. What typically happens to your expected allocation?',
      options: [
        'Your allocation increases because early adoption is rewarded with a multiplier',
        'Your expected allocation decreases because massive new farming participation dilutes your share of the fixed allocation',
        'Allocation is unaffected — total farming participation does not change distribution amounts',
        'The protocol typically cancels their airdrop once it becomes widely farmed',
      ],
      correct: 1,
      hint: 'What happens to total participation when major media covers an airdrop opportunity?',
      explanation: 'Major media coverage triggers a flood of new farming wallets — often 10–100× the previous participation. If total qualifying wallets go from 50,000 to 500,000, your share decreases by 10×. This is the dilution curve: early, quiet participation has the highest expected allocation; well-known farming opportunities attract the most participants and deliver the worst returns per wallet. Being early to genuinely useful protocols before they become farming discussions is the consistent edge.',
    },
    {
      question: 'A protocol has been farming for 8 months. You calculate: EV = 30% chance × $500 expected − $200 gas = −$50. What should you do?',
      options: [
        'Continue — you are 8 months in and should not lose the historical activity',
        'Stop deploying additional gas costs. The EV is negative going forward — historical activity is already earned, but additional spending has negative expected return',
        'Double down — more activity improves your allocation tier',
        'Create an additional wallet to hedge the negative EV',
      ],
      correct: 1,
      hint: 'Sunk cost: past gas costs are already spent regardless of future action. What matters is future cost vs future return?',
      explanation: 'Past gas costs are sunk — irrelevant to the future decision. Your 8 months of historical activity is already in the protocol\'s database regardless of whether you spend another $200. The question is only: does spending $200 more produce positive EV? With EV = −$50, the answer is no. Stop additional gas deployment. Your existing activity may still qualify you for something; additional spending only adds to a negative-return activity.',
    },
    {
      question: 'Which of the following activities has the highest probability of positive EV regardless of market conditions?',
      options: [
        'Farming a widely-known L2 with 500,000+ wallets already active',
        'Completing a testnet where participation is free and any distribution is pure upside',
        'Depositing $5,000 into a points programme with a non-binding conversion promise',
        'Farming 10 chains simultaneously to maximise potential distributions',
      ],
      correct: 1,
      hint: 'Apply EV = P × value − cost. Which activity has cost = 0?',
      explanation: 'Testnet: cost = 0 (no real assets, testnet gas is free). EV = P × value − 0 = always ≥ 0. This is the only farming activity where the cost term is zero, making any non-zero probability of distribution automatically positive EV. The widely-known L2 has high gas costs relative to diluted allocation. The points programme risks non-binding conversion. Multi-chain farming multiplies gas costs. Only testnets are structurally zero-cost.',
    },
    {
      question: 'The "genuine use" strategy for airdrops consistently outperforms pure farming. Why?',
      options: [
        'Protocols secretly identify genuine users and give them 5× allocations',
        'Genuine use produces zero additional gas cost (you were transacting anyway), generates the organic usage patterns that score highest in modern systems, and eliminates the EV uncertainty from gas cost investment',
        'Genuine users are exempt from Sybil detection algorithms',
        'Farming requires more time than genuine use, reducing hourly return',
      ],
      correct: 1,
      hint: 'If gas cost = 0, what happens to EV regardless of probability?',
      explanation: 'Three compounding advantages of genuine use: (1) Zero incremental gas cost — you were going to transact anyway, so the airdrop EV calculation has cost = 0. (2) Organic usage patterns score higher in sophisticated systems — time weighting, protocol diversity, realistic amounts all appear naturally. (3) No risk of Sybil exclusion — genuine multi-feature use over time is exactly the pattern protocols want to reward. Farming mimics this pattern imperfectly; genuine use produces it authentically.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 116 — Building Genuine On-Chain History That Persists
// ─────────────────────────────────────────────────────────────────────────────

const L116: IslandLevel = {
  id: 116, mechanic: 'chain', tier: 'pro',
  topic: 'Building Genuine On-Chain History That Persists',

  explanation: `When ENS launched its token in November 2021, they rewarded users based on how long they had owned ENS names and whether those names were set as their primary address. Users who had registered names years earlier for genuine use — not for any airdrop expectation — received the largest allocations. Their on-chain history persisted.

This is the central insight of long-term airdrop strategy: the most valuable on-chain history is built not for future airdrops but for genuine present use. History built this way persists across scoring systems because it is authentic. Manufactured history — gaming a specific protocol for a specific window — is protocol-specific and degrades when that protocol launches.

What constitutes persistent, valuable on-chain history:

ENS name registered and set as primary address: a Web3 identity signal respected by virtually every modern airdrop. Costs one-time registration + annual renewal. Visible as "vitalik.eth" instead of "0xd8dA...6045" on analytics platforms.

Lens Protocol profile or similar social graph: on-chain social identity that signals long-term engagement with Web3 infrastructure.

Gitcoin Passport score: an aggregated identity score across multiple platforms (Twitter, GitHub, ENS, Bright ID) used by many protocols as a Sybil resistance filter.

Multi-year DeFi activity across major protocols: Uniswap, Aave, Compound, Curve — using these protocols because they are useful creates a long-term activity fingerprint that future airdrops reference.

NFT ownership with utility: owning NFTs that grant access to specific communities or protocols (Nouns governance, certain DAOs) creates on-chain identity signals beyond pure trading history.`.trim(),

  fact: 'Persistent on-chain history signals: ENS primary name, Gitcoin Passport score, multi-year DeFi activity across major protocols, and on-chain social identity. These signals transfer across multiple future airdrop scoring systems — built once, used repeatedly.',
  plain: 'The best airdrop preparation is building genuine Web3 identity: an ENS name, a Gitcoin Passport, years of real DeFi use. This history works for every future airdrop automatically — without farming any specific protocol.',
  stars: [980, 1205, 1505], target: 1505, coins: 64,
  simulatorLesson: 'airdropEligibility',

  examples: [
    {
      contextTag: '[ENS as persistent signal]',
      scenario: 'Priya registered "priya.eth" in 2021 for $25/year and set it as her primary address. She did not think about airdrops. Three protocols in 2023–2024 used ENS registration as a qualifying signal or multiplier.',
      outcome: 'Her ENS name qualified her for baseline allocations in three separate distributions she did not specifically farm. Total value from ENS-related qualifying: approximately $800 across three events. Annual cost: $25. Net benefit over 3 years: $725 on $75 total cost. ENS registration is the clearest example of persistent on-chain history that generates airdrop value across multiple events without specific farming.',
    },
    {
      contextTag: '[Gitcoin Passport strategy]',
      scenario: 'Marcus builds his Gitcoin Passport score: connects GitHub (he codes), Twitter (active account), ENS (already has), and completes Bright ID verification. Score: 22 points.',
      outcome: 'Gitcoin Passport is used as a Sybil resistance filter by multiple protocols — users below a threshold receive no allocation or reduced allocation. Marcus\'s score of 22 qualifies him for full allocation in protocols that use Gitcoin Passport. The 2-hour setup cost creates persistent qualifying status for all future protocols using the same filter. His legitimate identity signals (GitHub code, Twitter history, ENS name) cannot be faked by Sybil farmers at scale.',
    },
    {
      contextTag: '[Long-term DeFi history as signal]',
      scenario: 'Keiko has been using Aave, Uniswap, and Compound regularly for 3 years for genuine portfolio management. A new protocol launches using historical DeFi engagement as an eligibility criterion.',
      outcome: 'Keiko\'s 3-year history across three major protocols — with realistic amounts, varied actions, and consistent usage — qualifies her for the top tier without any specific farming for this new protocol. Her historical behaviour was indistinguishable from genuine engagement because it was genuine engagement. The new protocol\'s scoring system retroactively rewards her DeFi participation history she would have built anyway.',
    },
  ],

  keyTakeaway: 'Persistent on-chain history — ENS name, Gitcoin Passport, multi-year major protocol use — is built once and qualifies for multiple future distributions automatically. It is the most durable airdrop strategy because it cannot be manufactured at scale.',

  guidedPractice: [
    {
      question: 'Why does an ENS primary name improve airdrop qualification across multiple protocols?',
      options: [
        'ENS Foundation pays bounties to protocols that reward ENS holders',
        'ENS registration signals genuine Web3 identity investment — it costs money annually and requires genuine commitment, making it a reliable Sybil resistance signal adopted by many protocols',
        'ENS holders receive automatic inclusion in all Ethereum protocol airdrops',
        'ENS names appear in airdrop databases, automatically qualifying holders',
      ],
      correct: 1,
      hint: 'What does paying annual renewal fees for a Web3 name signal about user commitment?',
      explanation: 'ENS registration requires: paying registration fees ($5–$100+ depending on name length), paying annual renewal, and setting it as primary address. This multi-step commitment with real ongoing cost is difficult to replicate at Sybil scale — farming 1,000 wallets with 1,000 unique ENS names would cost thousands of dollars annually. Protocols use ENS as a genuine user signal because the economic commitment screens out bulk Sybil farms. Legitimate users who registered for genuine identity purposes benefit across every protocol that respects ENS.',
    },
    {
      question: 'What is Gitcoin Passport and why do protocols use it?',
      options: [
        'A physical passport replacement for Web3 events and conferences',
        'An aggregated identity score combining multiple verified accounts (GitHub, Twitter, ENS, biometrics) — used by protocols as a Sybil resistance threshold to qualify users',
        'A Gitcoin-issued token required for certain DeFi protocol access',
        'A passport system for cross-chain wallet portability',
      ],
      correct: 1,
      hint: 'What problem does aggregating multiple identity signals solve that a single wallet address cannot?',
      explanation: 'A single wallet address proves nothing about the person behind it. Gitcoin Passport aggregates multiple identity signals — GitHub contribution history, Twitter account age, ENS name, BrightID biometric verification — into a score. Creating a fake GitHub account with years of commits and a Twitter account with genuine history is much harder than creating a new Ethereum address. Protocols set a minimum Passport score to qualify, knowing that Sybil farmers cannot economically create thousands of high-scoring Passport profiles.',
    },
    {
      question: 'You have 3 years of consistent Aave and Uniswap usage. A new protocol launches and uses "historical DeFi engagement score" as a criterion. What is your likely advantage?',
      options: [
        'No advantage — new protocols only consider activity on their own platform',
        'Your 3-year activity on major protocols creates a high-scoring DeFi engagement history that the new protocol can verify retroactively — generating qualification without any specific farming',
        'You qualify automatically for the maximum allocation based on Aave and Uniswap',
        'You must transfer your Aave position to the new protocol to maintain qualification',
      ],
      correct: 1,
      hint: 'How does a new protocol evaluate "genuine DeFi user" without their own activity history?',
      explanation: 'New protocols have no on-platform history to reference. Instead, they use external on-chain signals to identify genuine DeFi participants: transaction history on major protocols like Aave, Uniswap, Compound, Curve. A wallet with 3 years of varied, realistic DeFi activity on these established protocols scores highly on any DeFi engagement metric. This activity was built for genuine financial purposes — but retroactively qualifies across any future protocol that values DeFi experience.',
    },
    {
      question: 'Why is building genuine on-chain history more durable than protocol-specific farming?',
      options: [
        'Protocol-specific farming generates more tokens per hour of effort',
        'Genuine history applies across multiple protocols and scoring systems simultaneously, while protocol-specific farming generates value only if that specific protocol distributes and your activity qualifies',
        'Protocol-specific farming is banned by most blockchains',
        'Genuine history cannot be tracked by Sybil detection systems',
      ],
      correct: 1,
      hint: 'How many protocols benefit from ENS registration versus farming Protocol X specifically?',
      explanation: 'Protocol-specific farming: invest time and gas → single distribution → value only if that protocol distributes and you qualify. Genuine history signals (ENS, Gitcoin Passport, major protocol usage): invest once → applicable to every future protocol that uses these signals → multiplied value across many distributions. ENS registration in 2021 has already contributed to multiple airdrops and will continue to do so. The history persists and compounds; protocol-specific farming resets with each new opportunity.',
    },
    {
      question: 'What is the minimum ENS setup that maximises airdrop qualification signals?',
      options: [
        'Registering any ENS name — the domain does not matter for scoring',
        'Registering an ENS name AND setting it as your primary address — both steps are typically required, as setting primary address signals active use rather than speculative registration',
        'Only 5-character or shorter ENS names qualify — longer names are worth less',
        'Registering ENS requires completing a KYC process that disqualifies anonymous users',
      ],
      correct: 1,
      hint: 'What distinguishes a user who registered a name and uses it versus one who registered and forgot it?',
      explanation: 'Two steps signal genuine ENS use: (1) Register the name (proves willingness to pay). (2) Set as primary address (proves you actively use it as your Web3 identity — your address resolves to "yourname.eth" when others look it up). Protocols that use ENS as a signal typically check both — registration alone signals less commitment than active use. The primary address setting is visible on Etherscan, Opensea, and most Web3 apps — it makes your identity present across the ecosystem.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 117 — Expected Value Calculator: Before You Commit Time and Gas
// ─────────────────────────────────────────────────────────────────────────────

const L117: IslandLevel = {
  id: 117, mechanic: 'memory', tier: 'pro',
  topic: 'Expected Value Calculator — Before You Commit Time and Gas',

  explanation: `Most crypto traders evaluate airdrop opportunities by how exciting they sound, not by systematic calculation. This produces predictable outcomes: farming high-profile, widely-discussed opportunities (negative EV, too many participants) while missing quiet, early opportunities (positive EV, few farmers).

The expected value (EV) framework, applied consistently before any farming commitment, produces better outcomes than intuition.

The complete formula: EV = P(airdrop) × P(qualify|airdrop) × P(value > $100|qualifies) × median_value − total_cost

Breaking down each term:
- P(airdrop): probability the protocol distributes tokens within 18 months. Signals: VC funding with no token (high), testnet only (medium), no token mentioned (low).
- P(qualify): probability your activity reaches a meaningful tier. Signals: early = high, late/post-announcement = low.
- P(value > $100): probability the tokens are worth meaningful value at distribution. Comparable recent airdrops provide the benchmark.
- median_value: expected value if you qualify and it is worth something. Historical range for meaningful protocols: $200–$2,000.
- total_cost: gas costs + opportunity cost of locked capital.

The table test: build a simple table for each opportunity before committing. Three columns: optimistic estimate, realistic estimate, pessimistic estimate. Calculate EV for each. If the realistic estimate is negative EV, decline regardless of optimistic scenarios.

One more consideration: time cost. Airdrop farming takes time to research, execute, and monitor. Assign an hourly value to your time. If realistic EV ÷ time spent < your hourly value, the opportunity has negative real return.`.trim(),

  fact: 'The airdrop EV formula: P(airdrop) × P(qualify) × P(value > $100) × median_value − total_cost. Build optimistic/realistic/pessimistic tables. If the realistic estimate is negative, decline. Always include time cost in your calculation.',
  plain: 'Before farming anything, run the numbers. Probability of airdrop × probability of qualifying × expected value minus your gas costs = expected return. If it\'s negative in the realistic case, don\'t farm it.',
  stars: [1040, 1280, 1600], target: 1600, coins: 68,
  simulatorLesson: 'airdropExpectedValue',

  examples: [
    {
      contextTag: '[Full EV table build]',
      scenario: 'Amara evaluates a new L2 with: $80M raised (a16z, Paradigm), no token, live 4 months, active testnet completed, $200M TVL, 80,000 current wallets, modest farming discussion.',
      outcome: 'Optimistic: P(airdrop) 80%, P(qualify) 80%, median $800, gas $120. EV = 0.8 × 0.8 × $800 − $120 = $392. Realistic: P(airdrop) 60%, P(qualify) 60%, median $400, gas $120. EV = 0.6 × 0.6 × $400 − $120 = $24. Pessimistic: P(airdrop) 30%, P(qualify) 40%, median $200, gas $120. EV = 0.3 × 0.4 × $200 − $120 = −$96. Realistic EV: barely positive. She proceeds only if the protocol is genuinely useful to her (reducing effective gas cost to zero).',
    },
    {
      contextTag: '[Time cost inclusion]',
      scenario: 'Marcus evaluates a farm: realistic EV = $180, estimated time to qualify properly = 8 hours over 3 months. His hourly work value: $35/hour.',
      outcome: 'Time cost: 8 hours × $35/hour = $280. Adjusted EV: $180 − $280 = −$100. Even with positive gas EV, when time cost is included the farm is negative return. He declines. If the protocol were genuinely useful to him (say, he would spend those 8 hours on it anyway for trading purposes), time cost = 0 and EV = $180 positive.',
    },
    {
      contextTag: '[Widely-known farm rejection]',
      scenario: 'Keiko evaluates a farm that has been discussed in major crypto media for 2 months. 600,000 wallets already active.',
      outcome: 'P(qualify at meaningful tier) is severely reduced: 600,000 wallets farming aggressively means massive dilution. Realistic estimate: P(qualify meaningful) = 20%. EV = 0.65 × 0.20 × $400 − $180 = $52 − $180 = −$128. Negative EV in the realistic case. She declines. The widespread discussion that made the opportunity visible is the same signal that made it low EV.',
    },
  ],

  keyTakeaway: 'The EV formula (P × P × value − cost) applied in optimistic/realistic/pessimistic scenarios removes emotional bias from airdrop decisions. If the realistic case is negative EV, decline — regardless of how exciting the opportunity sounds.',

  guidedPractice: [
    {
      question: 'You estimate: P(airdrop) = 70%, P(qualify) = 50%, median value = $600, gas cost = $150. What is the expected value?',
      options: ['$60', '$210', '$60 net positive', '$−60'],
      correct: 0,
      hint: '0.70 × 0.50 × $600 − $150 = ?',
      explanation: '0.70 × 0.50 = 0.35. 0.35 × $600 = $210 expected return. $210 − $150 gas = $60 positive EV. This opportunity has modest positive expected value — worth pursuing if the realistic estimates are accurate and the protocol provides independent utility. Not a compelling opportunity but marginally positive.',
    },
    {
      question: 'Why should you always include a "pessimistic estimate" in your EV table, not just the realistic one?',
      options: [
        'Tax authorities require pessimistic estimates for crypto income reporting',
        'The pessimistic scenario reveals the downside risk — if even a 30% probability negative outcome is catastrophic, the opportunity may be unsuitable regardless of positive EV',
        'Pessimistic estimates are always more accurate than realistic ones',
        'Protocols give higher allocations to users who expected less',
      ],
      correct: 1,
      hint: 'What does a negative pessimistic EV tell you about downside risk?',
      explanation: 'Expected value is an average across all scenarios. A positive realistic EV with a significantly negative pessimistic EV means: in the bad outcome (30% probability), you lose materially. If your financial position cannot absorb that loss, the positive EV does not make the risk acceptable. The pessimistic scenario quantifies the worst-case cost — essential for risk management alongside the expected return calculation.',
    },
    {
      question: 'Your realistic EV calculation shows $50 positive. You estimate 6 hours of farming time. Your effective hourly rate is $25. What is the time-adjusted EV?',
      options: ['$50 — time is not a monetary cost', '−$100 — EV minus time cost is negative', '$−100', '−$100 net'),
      ],
      correct: 1,
      hint: '6 hours × $25/hour = time cost. $50 EV − time cost = ?',
      explanation: '6 hours × $25/hour = $150 time cost. $50 EV − $150 time cost = −$100 time-adjusted EV. Negative. The opportunity appears marginally positive before accounting for time, but when your time has real value (either professional opportunity cost or simply your enjoyment value), the adjusted return is negative. Activities with positive gas EV but negative time-adjusted EV are not worth pursuing unless the protocol provides independent utility.',
    },
    {
      question: 'A farming opportunity has been widely discussed for 3 months with 400,000 active wallets. How does this affect your P(qualify at meaningful tier)?',
      options: [
        'Not at all — qualification criteria are fixed before farming begins',
        'P(qualify at meaningful tier) decreases significantly — massive participation increases competition for top tiers and dilutes total allocation across more wallets',
        'P(qualify) increases — more participants means more community engagement and larger airdrop pools',
        'Only matters for Tier 1 allocation — Tier 2+ are unaffected by participation count',
      ],
      correct: 1,
      hint: 'With 400,000 wallets farming, how does each wallet\'s share of a fixed allocation change?',
      explanation: 'Fixed allocation ÷ 400,000 wallets = smaller share per wallet than the same allocation ÷ 50,000 wallets. Additionally, if qualification is tiered, massive farming participation means more competition for each tier. The top tier (which receives the most) has limited spots — 400,000 farms competing for Tier 1 means very few qualify. This is why widely-discussed farming opportunities systematically underperform quiet early opportunities.',
    },
    {
      question: 'When building an EV table, what is the most important estimate to get right and why?',
      options: [
        'The optimistic estimate — this is your potential upside and drives the decision',
        'The realistic estimate — this is the probability-weighted average outcome and is the primary decision input; the optimistic and pessimistic estimates provide context for the range',
        'The pessimistic estimate — avoiding downside is more important than capturing upside',
        'The gas cost estimate — this is the only certain number in the calculation',
      ],
      correct: 1,
      hint: 'Which estimate should drive your go/no-go decision?',
      explanation: 'The realistic estimate is the decision input: it represents your best honest assessment of likely outcomes weighted by probability. Optimistic estimates create false confidence (great if everything goes right — but everything rarely goes right). Pessimistic estimates create excessive risk aversion. The realistic estimate answers: "What is the most probable outcome of this decision?" If realistic EV is positive, proceed. If negative, decline — regardless of the optimistic scenario. The purpose of including all three is to understand the range, but the realistic estimate makes the decision.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 118 — Airdrop Portfolio Management: Tracking Positions
// ─────────────────────────────────────────────────────────────────────────────

const L118: IslandLevel = {
  id: 118, mechanic: 'chain', tier: 'pro',
  topic: 'Airdrop Portfolio Management — Tracking Positions',

  explanation: `A trader who actively farmed 8 protocols over 12 months asked what his return was. He could not answer — he had no tracking system. He knew he had received tokens from several protocols, had sold some, still held others, had spent gas across all of them, and had received some income tax liability. Without records, he could not calculate his actual return, his tax position, or which protocols had been worth the effort.

Active airdrop management requires three tracking systems: pre-distribution (farming position tracker), at-distribution (receipt and immediate decisions), and post-distribution (portfolio management of received tokens).

Pre-distribution tracking: for each active farming position, record the protocol name, chain, wallet address, date started, gas spent to date, estimated tier based on current activity, and last activity date. Review monthly. This tells you which farms are on track and which have missed qualifying windows.

At-distribution: when tokens land, immediately record the receipt date, quantity, and market price at receipt (critical for tax). Make your immediate decision: sell to cover tax, sell all, or hold with a specific thesis. Document the decision reason.

Post-distribution: received airdrop tokens typically show three patterns: immediate dump (sell at receipt for certainty), staged exit (sell over weeks as price develops), or thesis hold (hold for specific catalysts). Track each received token with its cost basis (receipt price), current value, and your exit thesis. Review weekly.

Tools: Zerion and DeBank for portfolio visibility across chains. Koinly for tax tracking. A simple spreadsheet for farming activity (protocols cannot be fully tracked by any single tool).`.trim(),

  fact: 'Pre-distribution tracking records gas costs and qualification tier per protocol. At-distribution requires immediate recording of receipt date and price for tax. Post-distribution manages received tokens with cost basis and exit thesis tracking.',
  plain: 'Track everything: what you spent farming, when you received tokens (and at what price, for tax), and what you plan to do with received tokens. Without records, you can\'t calculate your real return or your tax bill.',
  stars: [1100, 1355, 1695], target: 1695, coins: 72,
  simulatorLesson: 'airdropExpectedValue',

  examples: [
    {
      contextTag: '[Pre-distribution tracking]',
      scenario: 'Marcus tracks 6 active farming positions in a spreadsheet. Monthly review reveals Protocol D\'s last activity was 45 days ago and the qualification window requires activity within the last 30 days.',
      outcome: 'Without the tracking system, Marcus would have missed the qualification window. With it, he executes one transaction on Protocol D before the window closes — maintaining his qualification. The tracking system caught a $200+ opportunity cost failure with a $2 gas transaction correction. Monthly review of farming positions takes 20 minutes and has already paid for itself.',
    },
    {
      contextTag: '[Receipt recording and immediate decision]',
      scenario: 'Keiko receives 800 PROTO tokens on August 15th at $3.20 per token ($2,560 total). Her marginal tax rate is 40%. She must decide immediately.',
      outcome: 'She records: date = August 15th, quantity = 800, price = $3.20, income = $2,560, estimated tax = $1,024. Decision: sell 320 tokens immediately at $3.20 ($1,024) to cover tax liability. Holds 480 tokens as her "thesis hold" position (already tax-covered). Documents in spreadsheet with cost basis $3.20 per token. If PROTO rises to $5, she sells all at clean capital gains rates. If it falls to $1, she has a capital loss to offset other gains — and her tax is already covered.',
    },
    {
      contextTag: '[Portfolio review identifying exit]',
      scenario: 'Amara holds received airdrop tokens from 4 protocols. Monthly review: two have risen 3× from receipt price, one is flat, one is down 60%.',
      outcome: 'The two 3× tokens trigger her staged exit rule: sell 30% at 3×. She executes on both. The flat token: hold, reviewing thesis. The 60% down token: capital loss of (original receipt value − current value), deductible against airdrop gains. She considers selling the loser to crystallise the tax loss. All four decisions are systematic and documented — not reactive to individual price moves in her feed.',
    },
  ],

  keyTakeaway: 'Three-phase airdrop tracking: pre-distribution (gas costs, qualification tier, activity dates), at-distribution (receipt date/price for tax, immediate decision), post-distribution (cost basis, exit thesis, scheduled review). Without records, returns and tax positions are unknown.',

  guidedPractice: [
    {
      question: 'Why must you record the exact date and market price of each airdrop receipt immediately?',
      options: [
        'Protocols require this for their compliance records',
        'This establishes the taxable income amount and your cost basis — incorrect receipt recording leads to over-payment of income tax and incorrect capital gains calculations',
        'Token prices at receipt affect how many tokens you receive from the protocol',
        'Receipt recording activates the token\'s smart contract functions',
      ],
      correct: 1,
      hint: 'What two tax calculations depend on knowing the exact receipt date and price?',
      explanation: 'Receipt date and price determine: (1) Income tax: the receipt value (quantity × price at receipt) is ordinary income in the tax year of receipt. (2) Cost basis: this same value is your cost basis for future capital gains calculations. If you record incorrectly (wrong date, wrong price), you either overpay income tax (using too high a price) or incorrectly calculate capital gains on future sales. The receipt moment is the most important tax event in an airdrop — it must be recorded accurately at the time.',
    },
    {
      question: 'Your monthly review shows Protocol G\'s last activity was 35 days ago and the qualification criteria require activity within 30 days. What should you do?',
      options: [
        'Nothing — you have already qualified based on past activity',
        'Execute one genuine transaction on Protocol G immediately to reset your activity window before the disqualification takes effect',
        'Contact Protocol G to explain the gap and request an exception',
        'Create a new wallet and start fresh on Protocol G',
      ],
      correct: 1,
      hint: 'What does "activity within 30 days" mean for your current status?',
      explanation: 'If the qualification window requires activity within the last 30 days and your last action was 35 days ago, you have missed the window by 5 days. If the snapshot has already occurred — you have already qualified or not based on historical activity. If the snapshot has not yet occurred — a single genuine transaction today resets your activity date. Monthly review exists to catch exactly this: activity windows closing before the snapshot. The fix (one transaction) costs $2–$5 in gas versus losing the entire potential allocation.',
    },
    {
      question: 'After receiving an airdrop, you decide to "thesis hold" 60% of received tokens. What should you document?',
      options: [
        'Nothing — holding requires no documentation',
        'The receipt date, quantity, and price (for tax/cost basis), plus the specific thesis for holding (what event or milestone would trigger your exit) and a review date',
        'Only the token contract address for future reference',
        'The holding decision must be submitted to the protocol team',
      ],
      correct: 1,
      hint: 'What information do you need to manage a held position rationally rather than emotionally?',
      explanation: 'For a thesis hold: (1) Receipt date + price → cost basis and tax record. (2) Quantity held → position size. (3) Written thesis → the specific condition that would justify selling (e.g., "sell when protocol reaches $2B TVL" or "sell if token drops 50% from receipt price"). (4) Review date → when to reassess if thesis has not triggered. Without these elements, "thesis hold" becomes "held and forgot" — a common outcome that results in watching gains evaporate because you had no pre-defined exit condition.',
    },
    {
      question: 'You hold received tokens from 3 protocols: Protocol A is up 4× from receipt, Protocol B is flat, Protocol C is down 70%. What systematic decision process applies?',
      options: [
        'Sell all of A (capturing gains), hold B (might recover), sell C (cut losses)',
        'Apply pre-defined rules: staged exit on A (sell portion at 4×), hold B against thesis, consider selling C to crystallise tax loss that offsets A\'s gains — all based on documented rules, not emotional reaction',
        'Hold all three — airdrop tokens always recover given enough time',
        'Immediately sell all three to avoid further uncertainty',
      ],
      correct: 1,
      hint: 'What makes a decision systematic versus reactive?',
      explanation: 'Systematic: apply pre-defined rules. Protocol A at 4× triggers the staged exit rule (sell 30%, document). Protocol B is assessed against the specific thesis documented at receipt — has the thesis invalidated? If not, hold. Protocol C: assess the capital loss versus your current capital gains position. If you have gains from A (or other sources), realising C\'s loss now reduces your tax bill — "tax loss harvesting." The three decisions are independent and systematic, not reactions to current price feeds.',
    },
    {
      question: 'What is the minimum information each row in a farming activity spreadsheet should contain?',
      options: [
        'Protocol name and expected return',
        'Protocol name, chain, wallet address, start date, total gas spent, current estimated tier, and last activity date — sufficient to manage qualification windows and calculate actual returns',
        'Protocol name and social media links',
        'Only gas costs — returns are recorded separately',
      ],
      correct: 1,
      hint: 'What do you need to know to answer: "Am I still qualifying? What have I spent? What might I receive?"',
      explanation: 'Protocol name: identifies the farm. Chain + wallet: which address is farming where (critical for multi-chain activity). Start date: enables time-weighted calculation and wallet age assessment. Total gas spent: tracks cost side of EV calculation. Current estimated tier: shows whether activity is on track for meaningful qualification. Last activity date: the key for monitoring qualification windows — if last activity was 28 days ago and window is 30 days, you have 2 days to act. Without all six, you cannot manage the farming position proactively.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 119 — The Current Airdrop Meta: What Works in 2025–2026
// ─────────────────────────────────────────────────────────────────────────────

const L119: IslandLevel = {
  id: 119, mechanic: 'match3', tier: 'pro',
  topic: 'The Current Airdrop Meta — What Works in 2025–2026',

  explanation: `The airdrop meta evolves faster than any other area of crypto strategy. What worked in 2021 (show up early, receive tokens) evolved into 2022–2023 (multi-feature usage, governance, time weighting). By 2024–2025, the dominant patterns have shifted further.

What consistently works in the current meta:

Genuine early adoption of infrastructure protocols: the protocols most likely to have large distributions are those building fundamental infrastructure — interoperability, restaking, data availability, modular blockchain components — with significant VC backing and no token. These are used by developers and serious DeFi participants, not primarily by airdrop farmers. Being a genuine early user creates the highest-quality signal.

Testnet completion: the only zero-cost positive EV activity in the space. Every protocol with a testnet phase should be used. Takes 1–3 hours. Always worth doing.

On-chain identity accumulation: ENS, Gitcoin Passport, Lens Protocol, Proof of Humanity — building persistent Web3 identity signals that apply across multiple future distributions.

What has stopped working: simple transaction farming (detected by pattern analysis), multi-wallet Sybil strategies (detection is now near-universal), gaming points programmes without genuine protocol use, and farming protocols widely known as "airdrop plays" (diluted by massive participation).

The honest 2025 meta: if you are a genuine DeFi participant, the airdrops come to you as a byproduct of your normal activity. If you are farming specifically for airdrops, the expected returns have declined to the point where time-adjusted EV is often negative on any widely-known opportunity.`.trim(),

  fact: 'The 2025 airdrop meta favours: genuine early infrastructure adoption, testnet completion, and persistent Web3 identity signals (ENS, Gitcoin Passport). Pure transaction farming and multi-wallet strategies have negative expected value against modern Sybil detection.',
  plain: 'What still works: testnets (free), using infrastructure protocols genuinely before they\'re hyped, and building your Web3 identity. What doesn\'t: farming obvious plays, running multiple wallets, gaming transaction counts.',
  stars: [1160, 1427, 1784], target: 1784, coins: 76,
  simulatorLesson: 'airdropEligibility',

  examples: [
    {
      contextTag: '[Infrastructure first]',
      scenario: 'In early 2024, a developer begins building on a new modular blockchain infrastructure layer — using it for genuine development work, not airdrop farming. The protocol has $120M VC backing, no token, and few users.',
      outcome: 'Six months later, the protocol announces a developer allocation for mainnet builders. The developer receives a meaningful allocation based on genuine technical engagement. Their activity — deploying contracts, testing functions, documenting APIs — was indistinguishable from what the protocol wanted to reward because it was exactly what they wanted to reward. The airdrop was a bonus on development work they were doing anyway.',
    },
    {
      contextTag: '[Identity accumulation strategy]',
      scenario: 'Amara spends one afternoon building her Web3 identity: registers "amara.eth" ($25/year), connects GitHub, Twitter, and ENS to Gitcoin Passport (score: 18), and creates a Lens Protocol profile.',
      outcome: 'Total time: 3 hours. Total cost: $25 registration + $10 gas = $35. Over the following 18 months, three protocols use ENS or Gitcoin Passport as qualifying signals. Her one-time identity investment qualifies her for baseline allocations in all three. Total received: approximately $600. Return on $35 investment: ~17×. Identity accumulation is the most durable, lowest-maintenance airdrop strategy available.',
    },
    {
      contextTag: '[Widely-known farm avoided]',
      scenario: 'Marcus evaluates a chain that has been discussed as an "airdrop play" for 4 months in major crypto media. Estimated active farming wallets: 800,000. His EV calculation: $160 expected return, $180 gas cost.',
      outcome: 'Negative EV: $160 − $180 = −$20. He declines. His friend, who did not calculate EV and farmed based on excitement, spent $180 in gas and received tokens worth $90 at distribution (worse than EV due to being in a later qualifying tier). Marcus\'s discipline in calculating EV before committing saved him $180 in gas and 12 hours of farming time. He deployed that $180 into a testnet opportunity (zero additional gas) which later distributed $340.',
    },
  ],

  keyTakeaway: 'The 2025 airdrop meta rewards genuine early infrastructure use and persistent Web3 identity. Pure farming of known opportunities has declining EV. Testnets remain the only universally positive-EV activity. The best strategy: be a genuine DeFi participant, and let the airdrops find you.',

  guidedPractice: [
    {
      question: 'Why do infrastructure protocols (interoperability, data availability, restaking) tend to have higher-quality airdrop distributions than consumer DeFi protocols?',
      options: [
        'Infrastructure protocols have larger token supplies, enabling larger distributions',
        'Their user base is primarily developers and serious DeFi users — not airdrop farmers — producing higher-quality on-chain signals and less farming dilution',
        'Infrastructure protocols are legally required to distribute more tokens than consumer DeFi',
        'They have smaller teams and distribute more per user to compensate',
      ],
      correct: 1,
      hint: 'Who uses infrastructure protocols versus who uses consumer DeFi?',
      explanation: 'Consumer DeFi (DEXes, lending) attracts both genuine users and airdrop farmers — everyone can participate regardless of sophistication. Infrastructure protocols (cross-chain messaging, restaking, data availability) require technical knowledge to use genuinely. This technical barrier reduces farming participation while retaining genuine developers and power users. The result: distributions to smaller, higher-quality wallets with better activity signals and less dilution from mass farming.',
    },
    {
      question: 'In the 2025 meta, what is the most important indicator that an airdrop opportunity is likely NOT worth farming?',
      options: [
        'The protocol has more than 5 features',
        'The opportunity is widely discussed in major crypto media and has 500,000+ active farming wallets',
        'The protocol uses Gitcoin Passport for Sybil resistance',
        'The protocol is building on an established chain rather than a new L2',
      ],
      correct: 1,
      hint: 'What is the primary driver of farming dilution?',
      explanation: 'Widespread media coverage + 500,000+ farming wallets = massive dilution of any fixed allocation + sophisticated Sybil detection from a protocol that knows it is being farmed + high gas costs from competitive farming. This combination systematically produces negative or near-zero EV for new participants. The EV for early farmers (who entered before the media coverage) may be positive; for late entrants, the opportunity has already been captured.',
    },
    {
      question: 'You are a genuine DeFi user who regularly uses 4 established protocols for your actual portfolio management. A new protocol announces a distribution based on historical DeFi engagement. What happens?',
      options: [
        'Nothing — the distribution only rewards activity on that specific protocol',
        'Your genuine 4-protocol history qualifies you without any additional action — historical engagement signals were already built',
        'You must register with the protocol team to claim your historical activity credit',
        'Your activity only counts if it occurred within 90 days of the announcement',
      ],
      correct: 1,
      hint: 'Retroactive distributions reward past behaviour. Was your behaviour visible on-chain?',
      explanation: 'All your DeFi activity is permanently recorded on the blockchain. When a protocol distributes based on historical engagement, they query this public data to identify qualified wallets. Your 4-protocol usage history — if it meets their criteria — qualifies you automatically. No action required before the announcement. This is the compounding effect of genuine DeFi participation: your historical on-chain record qualifies you for retroactive distributions you never anticipated.',
    },
    {
      question: 'What has changed most significantly between the 2021 airdrop meta and the 2025 meta?',
      options: [
        'Token allocations have increased substantially in 2025',
        'Sybil detection has improved from basic cluster analysis to sophisticated behaviour fingerprinting, making multi-wallet farming essentially non-viable; qualification criteria are now multi-dimensional instead of single-metric',
        'Fewer protocols distribute airdrops in 2025 than in 2021',
        'Airdrop gas costs have decreased due to lower chain fees in 2025',
      ],
      correct: 1,
      hint: 'What strategy worked in 2021 that would be detected and excluded in 2025?',
      explanation: 'In 2021: creating multiple wallets, farming with low-value transactions, and claiming multiple times were viable. Sybil detection was basic. In 2025: graph analysis identifies Sybil clusters reliably. Behaviour fingerprinting detects farming patterns versus genuine use. Multi-dimensional criteria (time weighting, governance, protocol diversity, wallet age, Gitcoin Passport score) cannot all be gamed simultaneously at scale. The evolution from single-metric to multi-dimensional criteria is the most significant meta change — it systematically rewards genuine users and penalises systematic farmers.',
    },
    {
      question: 'What is the honest conclusion about airdrop farming as a primary income strategy in 2025?',
      options: [
        'It remains highly profitable — the strategy has improved each year',
        'For most people, it is a positive-EV supplement to genuine DeFi activity but a negative-EV primary strategy due to time costs, gas costs, and systematic dilution of widely-known opportunities',
        'It is now illegal in most jurisdictions due to tax regulations',
        'It only works for professional teams with technical advantages',
      ],
      correct: 1,
      hint: 'What is the time-adjusted EV of the average widely-known farming opportunity?',
      explanation: 'The honest assessment: airdrop farming as a primary income source has declining viability. Most widely-known opportunities have negative time-adjusted EV. Protocol sophistication in Sybil detection has made gaming strategies unviable. The opportunities that remain positive EV (testnets, early genuine use, identity accumulation) require genuine DeFi engagement, not systematic farming. For genuine DeFi participants, airdrops are meaningful bonuses. For people whose primary DeFi activity is airdrop farming, the returns have deteriorated to the point where the time investment is often better directed elsewhere.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 120 — BOSS: Airdrop Archipelago Complete
// ─────────────────────────────────────────────────────────────────────────────

const L120: IslandLevel = {
  id: 120, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: Airdrop Archipelago Complete',
  isBoss: true,

  explanation: `You have completed Airdrop Archipelago. Here is the synthesis before the boss challenge.

Airdrops are protocol token distributions to early users — rewarding genuine engagement, not systematic farming. The Uniswap model (retroactive, equal distribution) evolved into the Arbitrum model (tiered, behaviour-scored) and continues evolving toward identity-verified, Sybil-resistant distributions that specifically reward genuine users over farmers.

The qualification framework: time weighting favours pre-announcement use. Protocol diversity rewards using multiple features. Governance participation is the hardest farming signal to fake and the most heavily weighted. Wallet age and pre-existing DeFi history are prerequisite signals.

Sybil resistance: wallet graph analysis identifies clusters. The dust trail (any inter-wallet transaction) proves connection. One identity, one wallet, one allocation is the only viable long-term strategy.

The EV framework: P(airdrop) × P(qualify) × median_value − total_cost. Apply in realistic (not optimistic) scenarios. Include time cost. Decline negative-EV opportunities regardless of excitement.

The scam layer: fake airdrops use urgency + legitimate-looking sites + wallet approval transactions. Find every claim page through official documentation only — never through DMs, emails, or forwarded links.

The tax layer: airdrops are income at receipt. Record date and price immediately. Sell enough to cover tax liability before prices can fall. Cliff risk is real and devastating.

The 2025 meta: genuine DeFi participation + persistent Web3 identity (ENS, Gitcoin Passport) + testnet completion = the best airdrop strategy. Farming widely-known opportunities is negative EV. Prove it to yourself before spending gas.`,

  fact: 'Airdrop mastery: time-weighted qualification, Sybil avoidance, honest EV calculation, scam recognition, immediate tax recording, and persistent Web3 identity. The best strategy is genuine DeFi participation — airdrops as bonus, not primary motivation.',
  plain: 'Use DeFi genuinely, build your Web3 identity, avoid obvious scams, track your tax, and calculate EV honestly before farming anything. The airdrops that find you from genuine use are more valuable than any you try to manufacture.',
  stars: [2210, 2720, 3400], target: 3400, coins: 100,
  simulatorLesson: 'airdropBoss',

  examples: [
    {
      contextTag: '[Complete framework application]',
      scenario: 'A friend shows you their airdrop strategy: 15 wallets each doing 50 $1 swaps on a widely-known L2 farm, funded from the same Binance account. They are excited about "15× allocation."',
      outcome: 'Apply the complete framework: 15 wallets + same funding source = textbook Sybil cluster, all 15 will receive zero. $1 swaps detected as farming pattern, discounted to zero. Widely-known farm with 400,000 active wallets = severe dilution. The honest conversation: the expected return is $0 (Sybil exclusion) on ~$500 in gas. You advise stopping immediately, consolidating to one genuine wallet, and engaging authentically with protocols they actually find useful.',
    },
    {
      contextTag: '[EV-positive approach identified]',
      scenario: 'Marcus evaluates his week: (1) A new L2 testnet opened (2 hours, zero cost). (2) A widely-known farm he has been considering ($200 gas, 500,000 wallets active). (3) A new infrastructure protocol (bridge aggregator) with $90M VC funding, no token, 3,000 current wallets.',
      outcome: 'Testnet: always positive EV. Complete it immediately. Widely-known farm: EV calculation yields −$40. Skip. Bridge aggregator: 3,000 wallets (pre-farm), strong signals. EV = 65% × 70% × $500 − $80 gas = $228 − $80 = $148 positive. Use the aggregator genuinely for his next cross-chain transfers regardless of airdrop. Marcus completes the testnet in 2 hours, starts using the bridge aggregator for genuine cross-chain activity, and skips the negative-EV farm.',
    },
    {
      contextTag: '[Scam avoided, receipt handled correctly]',
      scenario: 'Keiko receives: (a) a Twitter DM claiming she qualified for 2,500 PROTO tokens with a claim link, and (b) a genuine PROTO airdrop announced on PROTO\'s official Twitter (verified) with claim instructions on their official docs site.',
      outcome: '(a) Scam: Twitter DM, claim link, urgency. She deletes and blocks. (b) Legitimate: announced via verified account, claim on official domain. She navigates directly to proto.xyz (typed manually), finds the claim page linked from official docs. She claims 800 PROTO at $2.10 per token ($1,680 receipt). Immediately records: August 22nd, 800 PROTO, $2.10/token, $1,680 income. Sells 320 tokens ($672) to cover 40% tax. Documents cost basis: $2.10/token for remaining 480 PROTO.',
    },
  ],

  keyTakeaway: 'Airdrop mastery combines: genuine protocol engagement (not farming), Sybil-safe single-wallet strategy, honest EV calculation before every gas spend, immediate scam recognition, tax recording at receipt, and persistent Web3 identity accumulation. The airdrop finds the genuine user — not the other way around.',

  guidedPractice: [
    {
      question: 'A friend spent $800 in gas farming 12 protocols for 6 months and received tokens worth $400. What was their EV and what was the primary strategic error?',
      options: [
        '$400 received is always a positive return — any distribution beats zero',
        'Net EV: −$400. Primary error: not running honest EV calculation before committing — the protocols were likely widely-known farms with diluted allocations where realistic EV was negative before gas was spent',
        'The primary error was using only one wallet instead of multiple',
        'Six months is too short for meaningful airdrop qualification',
      ],
      correct: 1,
      hint: '$400 received − $800 gas = ? What precaution would have revealed this outcome in advance?',
      explanation: '$400 received − $800 gas = −$400 net loss. Pre-farming EV calculation would have identified the negative-EV opportunities among the 12 before gas was spent. If even 6 of the 12 had negative realistic EV (which is typical for widely-known farms), eliminating them would have saved ~$400 in gas while retaining positive-EV exposures. The error: committing without calculation, driven by excitement rather than systematic evaluation.',
    },
    {
      question: 'You receive a Discord DM from the "Arbitrum Official" account with a link to claim a "Season 2 airdrop." What is your exact verification process?',
      options: [
        'Click the link and connect your wallet to see if your address qualifies',
        'Ignore the DM, navigate directly to arbitrum.io by typing the URL yourself, check their official blog and Twitter for any Season 2 announcement, and only engage with a claim page found through official documentation',
        'Ask in the Arbitrum Discord server if the airdrop is real',
        'Check if the link uses HTTPS before clicking it',
      ],
      correct: 1,
      hint: 'What is the one source you should trust? Where does everything else rank?',
      explanation: 'Exact process: (1) Ignore the DM entirely — no legitimate airdrop is distributed via DM. (2) Type arbitrum.io manually (never follow links to find official sites). (3) Check their official blog and Twitter for Season 2 announcement. (4) If announced, follow the claim link from their official documentation only. HTTPS proves nothing about legitimacy. Discord verification is unreliable (accounts get hacked). The only trustworthy source is the official domain accessed directly.',
    },
    {
      question: 'You receive 2,000 airdrop tokens at $3.50 each. Your tax rate is 40%. Three months later they are worth $0.80 each. What do you owe and what should you have done?',
      options: [
        'Tax on $1,600 (current value) — tax is based on value at sale',
        'Tax on $7,000 income (receipt value), totalling $2,800 — which exceeds your current token value of $1,600. Should have immediately sold enough tokens to cover the $2,800 liability',
        'No tax — tokens lost value, so there is no gain',
        'Tax on the $5,400 decline (a capital loss)',
      ],
      correct: 1,
      hint: 'When is the taxable income event for airdropped tokens?',
      explanation: 'Income tax was triggered at receipt on 2,000 × $3.50 = $7,000. Tax owed: $7,000 × 40% = $2,800. Current value: 2,000 × $0.80 = $1,600. You owe $2,800 in cash but only have $1,600 of token value. Selling all tokens generates $1,600 plus a capital loss of $5,400 (cost basis $7,000 − proceeds $1,600) to offset future gains. But the $2,800 cash tax is still owed in full. The correct action at receipt: immediately sell 800 tokens at $3.50 = $2,800 to cover tax. The remaining 1,200 tokens at cost basis $3.50 become your hold position.',
    },
    {
      question: 'Which combination of activities has the highest expected airdrop return in the 2025 meta?',
      options: [
        'Run 20 wallets across 10 farms simultaneously for maximum coverage',
        'Complete all available testnets, register ENS, build Gitcoin Passport score, and use 3–4 infrastructure protocols with strong VC backing and no token genuinely for 6+ months',
        'Farm every protocol discussed in major crypto media within 48 hours of media coverage',
        'Deposit maximum capital into every points programme to maximise allocation',
      ],
      correct: 1,
      hint: 'Which activities have zero cost (testnet) vs negative EV (widely-known farms) vs positive identity ROI (ENS)?',
      explanation: 'The optimal 2025 portfolio: (1) Testnets — zero cost, always positive EV, complete all. (2) ENS + Gitcoin Passport — one-time setup, applies to multiple future distributions, $35 total cost. (3) Early infrastructure protocols — used genuinely, zero incremental gas cost, highest-quality signals. (4) Avoid: multi-wallet strategies (Sybil excluded), widely-known farms (negative EV after dilution and gas), points programmes without genuine utility (non-binding, diluted). This combination maximises EV while minimising gas costs and Sybil risk.',
    },
    {
      question: 'What is the single most important mindset shift for successful long-term airdrop participation?',
      options: [
        'Treat airdrops as primary income and optimise all DeFi activity around maximising them',
        'Treat airdrops as bonuses from genuine DeFi participation — use protocols because they are useful, build Web3 identity because it matters, and let the airdrops arrive as a byproduct of authentic engagement',
        'Focus exclusively on protocols with announced airdrops to maximise probability of receiving tokens',
        'Prioritise protocols with the largest VC backing regardless of genuine utility',
      ],
      correct: 1,
      hint: 'What user does every airdrop ultimately want to reward? How do you become that user?',
      explanation: 'Every protocol designing an airdrop wants to reward genuine early users — people who used the protocol because it was useful, not because of the airdrop. The most effective long-term strategy is to actually be that user: use protocols for genuine financial purposes, build a real Web3 identity, engage with governance because you care about the outcome. When you do this, you qualify for retroactive distributions you never anticipated, score highest on sophisticated criteria, avoid all Sybil detection, and build a track record that compounds across future distributions. The airdrop finds the genuine user — not the farmer who mimics genuine use.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L114–120)
// ─────────────────────────────────────────────────────────────────────────────

const AIRDROP_LEVELS_B: Record<number, IslandLevel> = {
  114: L114,
  115: L115,
  116: L116,
  117: L117,
  118: L118,
  119: L119,
  120: L120,
};

export { AIRDROP_LEVELS_B };

export const AIRDROP_LEVELS: Record<number, IslandLevel> = {
  ...AIRDROP_LEVELS_A,
  ...AIRDROP_LEVELS_B,
};
