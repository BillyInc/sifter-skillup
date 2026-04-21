// ⚡ Sifter SkillUp — Advanced Crypto (Island 18, Levels 121–135)
// Part A of 2 — Levels 121–128
//
// Chain: islandId=18
// Prerequisite: Airdrop Archipelago (Island 10)
// Primary Simulators: onchainAnalysis, governance, defi
// NOTE: Island 18 level numbers (121–135) precede Islands 12–17 in the sequence

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 121 — ZK Proofs in Practice (Without the Maths)
// ─────────────────────────────────────────────────────────────────────────────

const L121: IslandLevel = {
  id: 121, mechanic: 'match3', tier: 'pro',
  topic: 'ZK Proofs in Practice — Without the Maths',

  explanation: `
In 2023, a journalist wanted to prove to a publisher that she had won a Pulitzer Prize without sending her private documents. She proved it using a ZK credential — a digital attestation that confirmed the fact without revealing the supporting papers. That is zero-knowledge in one sentence: prove something is true without showing why it is true.

Zero-knowledge (ZK) proofs are the cryptographic engine behind some of the most important blockchain advances of the past three years. The core idea: a prover can convince a verifier that a statement is correct — "this batch of 1,000 Ethereum transactions is valid" — without the verifier having to check every transaction individually.

Two main ZK systems power today's rollups. SNARKs (Succinct Non-interactive Arguments of Knowledge) produce tiny proofs (a few hundred bytes) verified in milliseconds. They require a one-time trusted setup ceremony to generate initial parameters. If that ceremony is compromised, security fails. STARKs (Scalable Transparent Arguments of Knowledge) need no trusted setup — their randomness is publicly verifiable. Proofs are larger (tens of kilobytes) but the transparency removes the trusted-setup risk entirely. Starknet uses STARKs; Polygon zkEVM, zkSync use SNARKs.

Beyond scaling, ZK proofs enable privacy credentials (prove you're over 18 without showing your passport), private voting (prove your vote is valid without revealing how you voted), and ZK coprocessors that let smart contracts access verified off-chain data.
  `.trim(),

  fact: 'ZK proofs let you verify a statement is true without revealing the underlying data. SNARKs are compact but require a trusted setup; STARKs are larger but fully transparent. Both power ZK rollups and privacy applications on Ethereum and Starknet.',
  plain: 'Think of ZK proofs like a magic trick: you prove you know the answer without showing your work. Blockchains use this to verify thousands of transactions at once (rollups) or to prove facts about yourself (age, nationality) without exposing your documents.',
  stars: [340, 420, 530], target: 530, coins: 40,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[User, privacy credential use case]',
      scenario: 'Amara wants to access an age-restricted DeFi protocol that requires proof of being over 18. She does not want to upload her passport to a smart contract.',
      outcome: 'With a ZK identity credential: Amara uses a government-verified credential service that issues a ZK proof. She submits the proof to the protocol smart contract. The contract verifies the proof is valid — confirming she is over 18 — without ever seeing her name, date of birth, or passport. The proof is mathematically binding: she cannot fake it. Her privacy is preserved; compliance is achieved.',
    },
    {
      contextTag: '[Developer, ZK rollup context]',
      scenario: 'Marcus is building on zkSync Era. He wants to understand why zkSync is faster than Arbitrum for settling transactions to Ethereum mainnet.',
      outcome: 'Arbitrum (optimistic rollup): posts transactions to Ethereum and waits 7 days for a fraud challenge window before finalising. zkSync (ZK rollup): generates a SNARK proof that mathematically proves the entire batch is valid. Ethereum verifies the proof — typically in under 1 hour — and finalises the batch. No waiting for challenges because validity is mathematically proven, not optimistically assumed. For applications needing fast Ethereum finality, ZK rollups are objectively superior.',
    },
    {
      contextTag: '[Investor, evaluating ZK projects]',
      scenario: 'Priya is evaluating three ZK ecosystem projects: Polygon zkEVM, zkSync Era, and Starknet. She wants to understand their fundamental differences.',
      outcome: 'Polygon zkEVM: Type 2 zkEVM (high Ethereum compatibility), uses SNARK-based proof system, targets existing Ethereum dApps with minimal migration. zkSync Era: Type 4 zkEVM (transpiles Solidity to ZK-compatible format), SNARK-based, fastest growing ecosystem, native account abstraction. Starknet: not a zkEVM at all — uses Cairo language and STARKs, requires learning Cairo for development but gains STARK transparency advantages and no trusted setup. Trade-offs are real: Starknet's superior theoretical security requires a new developer ecosystem.',
    },
  ],

  keyTakeaway: 'ZK proofs mathematically verify a statement is true without revealing underlying data — enabling both ZK rollup scaling (verify 1,000 transactions in one proof) and privacy applications (prove facts about yourself without exposing documents).',

  guidedPractice: [
    {
      question: 'What is the core advantage of STARKs over SNARKs from a trust perspective?',
      options: [
        'STARKs produce smaller proofs that cost less gas to verify on Ethereum',
        'STARKs require no trusted setup — their randomness is publicly verifiable, eliminating the risk that a compromised ceremony could undermine the entire proof system', // ✓
        'STARKs are faster to generate because they use simpler mathematics than SNARKs',
        'STARKs are compatible with all EVM smart contracts without code changes',
      ],
      correct: 1,
      hint: 'What happens to SNARK security if the trusted setup ceremony produces compromised parameters?',
      explanation: 'SNARK trusted setup: a ceremony where participants generate secret parameters. If the ceremony is compromised — even one participant acts maliciously and keeps their "toxic waste" — the SNARK system\'s security breaks entirely. The attacker can forge proofs. STARKs generate randomness from publicly verifiable sources (hash functions). No ceremony, no toxic waste, no single point of failure. This is why Starknet specifically chose STARKs: for a financial system holding billions in value, the removal of the trusted-setup assumption is worth the larger proof size.',
    },
    {
      question: 'Why does a ZK rollup achieve faster Ethereum finality than an optimistic rollup?',
      options: [
        'ZK rollups use more validators which process transactions faster',
        'ZK rollups post transactions directly to Ethereum without any settlement layer',
        'ZK rollups generate a mathematical validity proof that Ethereum verifies in minutes — no fraud challenge window required since validity is proven, not assumed', // ✓
        'ZK rollups pay higher gas fees to Ethereum validators for faster inclusion',
      ],
      correct: 2,
      hint: 'How does optimistic rollup finality work? What replaces the fraud window in a ZK rollup?',
      explanation: 'Optimistic rollups assume transactions are valid and wait 7 days for anyone to submit a fraud proof if they are wrong. If no fraud proof arrives, transactions finalise. ZK rollups prove validity mathematically upfront — a SNARK or STARK proves the entire batch is correct. Ethereum\'s smart contract verifies the proof (cheap because verification is fast). No waiting period needed because there is nothing to challenge — the math already proved it. Result: ZK rollup finality in ~1 hour vs optimistic rollup finality in 7 days.',
    },
    {
      question: 'A protocol wants to allow users to prove they are unique humans without revealing their identity. Which ZK application category does this fall into?',
      options: [
        'ZK coprocessor — processing off-chain computation and proving it to smart contracts',
        'ZK rollup — batching multiple identity checks for efficiency',
        'ZK privacy credential — proving a fact (uniqueness) without revealing the underlying personal data', // ✓
        'ZK bridge — moving the identity proof across chains',
      ],
      correct: 2,
      hint: 'The user is proving something about themselves (uniqueness) without showing their actual personal information.',
      explanation: 'ZK privacy credentials are proofs about personal attributes — age, nationality, uniqueness — generated from verified identity documents, without revealing the documents themselves. Worldcoin uses ZK proofs of iris scans to prove uniqueness without storing biometric data on-chain. Gitcoin Passport aggregates multiple ZK attestations to create a Sybil-resistance score. ZK coprocessors are different — they process arbitrary off-chain data (Ethereum storage, historical data) and prove the computation to smart contracts. The classification matters because the threat model and implementation are different.',
    },
    {
      question: 'If a developer uses Polygon zkEVM, what is the main compatibility advantage over building on Starknet?',
      options: [
        'Polygon zkEVM has much lower transaction fees than Starknet',
        'Polygon zkEVM is a zkEVM — existing Solidity smart contracts deploy with minimal changes; Starknet requires rewriting contracts in Cairo, a different language entirely', // ✓
        'Polygon zkEVM offers native ZK privacy for all transactions by default',
        'Polygon zkEVM proof generation is 100× faster than Starknet\'s STARK proofs',
      ],
      correct: 1,
      hint: 'What smart contract language does Starknet require? What does Polygon zkEVM accept?',
      explanation: 'The EVM compatibility spectrum is the central developer trade-off in ZK ecosystems. Type 1 zkEVMs are byte-for-byte Ethereum-identical (hardest to build, none fully deployed). Type 2 (Polygon zkEVM) are EVM-compatible — Solidity contracts compile and run almost identically. Developers use the same tools: Hardhat, Foundry, MetaMask. Starknet is not an EVM at all — contracts must be written in Cairo, a ZK-native language with different semantics. Migrating a complex DeFi protocol from Solidity to Cairo is a significant development effort. The developer migration cost vs STARK security advantage is the genuine trade-off Polygon zkEVM solves.',
    },
    {
      question: 'What does a ZK coprocessor enable that a standard Ethereum smart contract cannot do natively?',
      options: [
        'It allows smart contracts to execute off-chain transactions without gas costs',
        'It enables smart contracts to access and verify historical Ethereum data (like average price over 90 days) with a ZK proof — something impossible on-chain without the full data stored in expensive storage', // ✓
        'It processes multiple smart contract calls simultaneously to reduce latency',
        'It creates private smart contract state invisible to other participants',
      ],
      correct: 1,
      hint: 'What data does a smart contract not have access to natively? What is expensive to store on-chain?',
      explanation: 'Ethereum smart contracts only have access to current state — they cannot read historical block data, large datasets, or off-chain computation results. A ZK coprocessor (like Axiom or Herodotus) reads historical Ethereum data off-chain, runs a computation, and generates a ZK proof of the result. The smart contract verifies the proof cheaply and trusts the result — getting access to complex verified queries (average price over 90 days, whether an address held ETH in 2020) without paying the gas cost to store all that data on-chain. This enables entirely new oracle-free application architectures.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 122 — DAO Governance: Voting Mechanics and Attacks
// ─────────────────────────────────────────────────────────────────────────────

const L122: IslandLevel = {
  id: 122, mechanic: 'governance', tier: 'pro',
  topic: 'DAO Governance — Voting Mechanics and Attacks',

  explanation: `
On April 17, 2022, Beanstalk — an algorithmic stablecoin protocol — was drained of $182 million in a single transaction. The attacker did not exploit a smart contract bug. They exploited the governance system. Using a flash loan to borrow $1 billion in tokens, they instantly acquired enough voting power to pass a malicious governance proposal — transferring all protocol funds to themselves — and repaid the loan in the same block. The governance system had no time-lock.

DAO governance gives token holders control over protocol parameters, treasury spending, and upgrades. The mechanics that make it work also create its attack surface. Understanding both is essential before participating in any governed protocol.

Core mechanics: a governance proposal is submitted on-chain, enters a voting period (typically 3–7 days), requires a quorum (minimum participation threshold), and if it passes, a time-lock delay (24–72 hours typically) before execution. This delay is the critical defence the Beanstalk governance lacked.

Common legitimate governance actions: changing fee parameters, adding new collateral types, allocating treasury grants, upgrading contract logic via proxy.

Attack vectors: flash loan governance attacks (borrow voting power for one block, pass a proposal — requires no time-lock to succeed), low-turnout manipulation (if quorum is 4% and 95% of tokens are passive, a small group controls outcomes), and governance griefing (submitting endless proposals to exhaust voter attention and gas costs).

Defence mechanisms: time-locks (delay between vote passing and execution), vote delay periods (voting power snapshot before proposal), higher quorum thresholds, and governance guardians with veto power.
  `.trim(),

  fact: 'DAO governance attack vectors: flash loan voting power (no time-lock = instant execution), low turnout manipulation, governance griefing. Defences: time-locks delay execution after votes pass, vote delay snapshots prevent flash loan attacks, quorum thresholds ensure meaningful participation.',
  plain: 'DAOs are governed by token votes. The Beanstalk hack showed that if votes execute immediately, attackers can borrow billions in tokens, vote yes on stealing everything, and return the loan — all in one transaction. Time-locks (waiting periods after a vote passes) prevent this.',
  stars: [360, 450, 560], target: 560, coins: 40,
  simulatorLesson: 'governance',

  examples: [
    {
      contextTag: '[DeFi user, evaluating a new protocol]',
      scenario: 'Marcus is considering depositing $20,000 into a new lending protocol. He checks the governance documentation and finds: 24-hour voting period, 2% quorum, no time-lock between vote and execution.',
      outcome: 'This governance design is dangerous. 24-hour voting: too short for community to mobilise against a malicious proposal. 2% quorum: any holder of 2% of tokens can pass proposals — a low threshold for a motivated attacker. No time-lock: a passed proposal executes immediately, removing the last defence window. Marcus should treat this governance design as a security red flag equivalent to an unaudited contract. Established protocols like Uniswap and Aave have 48-hour+ voting periods, 4% quorum, and 48-72 hour time-locks precisely because these parameters emerged from hard-won lessons.',
    },
    {
      contextTag: '[Governance participant, delegation decision]',
      scenario: 'Amara holds 50,000 UNI tokens but does not have time to follow every proposal. She wants to participate in governance without monitoring daily.',
      outcome: 'Delegation is the answer. Amara delegates her voting power to a Uniswap governance delegate — a community member who has published their governance philosophy and voting history. Her 50,000 UNI counts toward their voting power on proposals she cannot follow. She can revoke or change delegation anytime. The key step: research the delegate\'s track record (vote history is on-chain and transparent) before delegating. Passive token holders not delegating are equivalent to absent voters — they inflate the true participation denominator without contributing to governance.',
    },
    {
      contextTag: '[Protocol builder, governance design]',
      scenario: 'Keiko is designing governance for a new DeFi protocol with $30M in TVL. She is choosing between a 48-hour time-lock and a 7-day time-lock.',
      outcome: 'For a $30M protocol: 48-hour time-lock is a reasonable starting position, with a plan to extend as TVL grows. The trade-off is governance agility vs security window. A 7-day time-lock gives users maximum time to exit before a dangerous proposal executes, but slows legitimate emergency responses. Recommendation: implement a tiered system — routine parameter changes get 48-hour lock, upgrades to core contract logic get 7-day lock, emergency security patches can be executed by a multisig guardian within 24 hours. The guardian\'s power should be limited strictly to security-only interventions.',
    },
  ],

  keyTakeaway: 'DAO governance is only as secure as its time-lock, quorum, and vote delay design — the Beanstalk hack proved that a governance system with no time-lock is equivalent to having no security at all, regardless of how strong the underlying smart contracts are.',

  guidedPractice: [
    {
      question: 'Why did Beanstalk\'s governance design allow a $182M theft in a single transaction?',
      options: [
        'Beanstalk\'s smart contracts had a critical code vulnerability that was exploited directly',
        'Beanstalk had no time-lock between vote passing and execution, allowing a flash loan to borrow voting power, pass a malicious proposal, and execute it — all in the same block before the loan was repaid', // ✓
        'Beanstalk\'s team members voted in favour of the malicious proposal intentionally',
        'The attacker used a compromised validator to manipulate which transactions were included',
      ],
      correct: 1,
      hint: 'Flash loans must be repaid in the same block. What does that mean for governance timing?',
      explanation: 'Flash loans exist entirely within a single block — borrow, use, repay, all in one atomic transaction. If governance execution happens in the same block as the vote, flash loans can manufacture temporary voting supermajority with borrowed capital. The Beanstalk attacker borrowed ~$1B in governance tokens via Aave flash loan, voted for a proposal that transferred the $182M treasury to their wallet, the proposal executed immediately (no time-lock), and they repaid the flash loan — all atomically. Time-locks prevent this: if execution is delayed 24+ hours, flash loans cannot hold voting power across blocks, making this attack impossible.',
    },
    {
      question: 'A governance proposal at a protocol with 2% quorum, 3-day voting, and 48-hour time-lock receives 1.8% participation and passes with 85% of voters approving. Does it execute?',
      options: [
        'Yes — 85% approval is strong consensus and the time-lock adds sufficient security',
        'No — the proposal fails because it did not reach the 2% quorum threshold, and no time-lock timer starts', // ✓
        'Yes — quorum only applies to contentious votes with near-50/50 outcomes',
        'No — all governance proposals need at least 51% of total token supply to pass',
      ],
      correct: 1,
      hint: 'Quorum is a minimum participation requirement — what happens if you do not meet a minimum threshold?',
      explanation: 'Quorum is a gate: the proposal does not pass if minimum participation is not reached, regardless of the approval percentage among those who did vote. 1.8% participation falls below the 2% quorum — the proposal fails. This mechanism exists because a proposal passed by 0.001% of token holders with 99% approval among that tiny group does not represent meaningful community consensus. Quorum requirements ensure that at least a minimum fraction of the governance community is engaged. Time-locks only start when a proposal successfully passes quorum.',
    },
    {
      question: 'What is a "vote delay" parameter and why does it prevent flash loan governance attacks?',
      options: [
        'Vote delay is the waiting period between a proposal passing and execution — the same as a time-lock',
        'Vote delay is a snapshot of voting power at a block before the proposal — meaning tokens acquired after the snapshot (like via flash loan) have no voting power on that proposal', // ✓
        'Vote delay slows down the voting contract to reduce gas consumption during high-traffic periods',
        'Vote delay requires voters to lock tokens for 24 hours before casting their vote',
      ],
      correct: 1,
      hint: 'When is voting power measured — at the moment of voting or at some earlier block?',
      explanation: 'Flash loan governance attacks work because the attacker holds massive tokens during the one block of the attack. Vote delay defeats this: governance systems snapshot voting power at a block that is N blocks before the proposal starts (OpenZeppelin Governor uses this). When the attacker flash-borrows tokens, those tokens were not held at the snapshot block — they have zero voting power on any open proposals. The attacker cannot accumulate enough voting power in the one block of a flash loan to influence an already-open vote. Vote delay and time-lock are complementary: vote delay prevents flash-loan attacks on open votes, time-lock prevents flash-loan attacks on instant execution.',
    },
    {
      question: 'A major DeFi protocol has 10% of tokens voting regularly; the rest are passive. An actor acquires 5.5% of total tokens. What governance risk does this create?',
      options: [
        'No risk — 5.5% of tokens is not a majority of total supply',
        'The actor controls 55% of regular voting participation — effectively a governance majority, able to pass proposals if they coordinate with any 0.1% of other active voters', // ✓
        'The actor can only participate in governance after a 6-month lock period',
        'The protocol\'s smart contract automatically detects concentrated token ownership and prevents single-wallet voting',
      ],
      correct: 1,
      hint: 'Governance majority is relative to who actually votes, not total supply.',
      explanation: 'Governance power is relative to participation. If 10% of tokens vote and you hold 5.5% of total supply, you cast 55% of all votes. This is a practical governance majority — you can pass proposals with minimal support from any other voter. This is the real-world attack surface in most DeFi protocols: governance is technically decentralised (no single holder >50% of supply) but practically centralised (a small active bloc controls outcomes because the rest are passive). Delegation and higher quorum thresholds are the mitigations. Always check active voting participation, not just token distribution.',
    },
    {
      question: 'Which governance design is more secure for a protocol holding $500M in TVL?',
      options: [
        '2% quorum, 24-hour voting, no time-lock — maximises governance speed and responsiveness',
        '10% quorum, 7-day voting period, 72-hour time-lock, with a guardian multisig for emergency security patches — gives users maximum time to exit and makes attacks expensive and slow', // ✓
        '4% quorum, 3-day voting, 1-hour time-lock — balances speed and security',
        'No on-chain governance — governance decisions made by founders with multisig override',
      ],
      correct: 1,
      hint: 'At $500M TVL, what is the cost of an attacker taking 30 days to execute a governance attack vs the benefit of 1-hour response time for legitimate changes?',
      explanation: 'At $500M TVL, the asymmetry is: a malicious governance pass steals $500M; a legitimate governance change that takes 7 days longer is an inconvenience. The higher the TVL, the more the security parameters should bias toward delay. 10% quorum is high but appropriate — it ensures meaningful community engagement on decisions affecting $500M. 72-hour time-lock gives users 3 days to withdraw funds if a dangerous proposal passes. The guardian multisig for emergencies handles the legitimate concern about needing to respond quickly to security vulnerabilities — but it should be limited strictly to security-only actions (pausing the protocol, not changing treasury allocations).',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 123 — Tokenomics Design: Vesting, Supply, and Incentive Alignment
// ─────────────────────────────────────────────────────────────────────────────

const L123: IslandLevel = {
  id: 123, mechanic: 'chain', tier: 'pro',
  topic: 'Tokenomics Design — Vesting, Supply, and Incentive Alignment',

  explanation: `
In April 2022, exactly 12 months after launch, Aptos protocol's VC investors received their full token allocation in a single block. Within 24 hours, the token price dropped 40%. The investors had waited exactly as long as their vesting contract required — and sold. This is a vesting cliff, and it is one of the most predictable events in crypto markets.

Tokenomics — the economics of a token's supply and distribution — determines whether the long-term incentives of the protocol are aligned between founders, investors, the community, and the protocol itself. Understanding the key parameters helps you evaluate both investment risk and protocol sustainability.

Vesting schedules define when allocated tokens become available. Linear vesting releases tokens gradually over time (for example, 1/36th per month over 3 years). Cliff vesting releases nothing until a date, then everything at once (the Aptos scenario). Best-in-class design: long linear vesting (3–4 years), no cliff or a short cliff (6 months), with team tokens aligned to the same schedule as investors.

Supply parameters: circulating supply (tokens currently available to trade) vs total supply (all tokens that will ever exist). Fully Diluted Valuation (FDV) = price × total supply — a higher FDV relative to market cap signals significant future sell pressure as tokens vest.

Red flags: team/VC allocation above 30% combined, cliff vesting at 12 months, immediate unlock at launch, emission schedules that halve every year. Green flags: community allocation above 50%, 3–4 year linear vesting with no cliff, fees redistributed to token holders, transparent on-chain vesting contracts.
  `.trim(),

  fact: 'Tokenomics red flags: short VC vesting cliff, high team allocation, immediate unlock at launch. Green flags: community majority allocation, 3–4 year linear vesting, fees flowing to token holders. FDV = price × total supply — high FDV vs market cap signals future sell pressure.',
  plain: 'Tokenomics is how a token\'s supply is distributed and when it unlocks. If 40% goes to VCs who can sell after 1 year, expect selling at month 12. If most tokens go to the community with 4-year unlock, incentives are aligned. FDV shows the true "inflated" market cap when all tokens eventually unlock.',
  stars: [380, 470, 590], target: 590, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Investor, pre-launch token evaluation]',
      scenario: 'James evaluates a new DeFi protocol launching with: 20% team (1-year cliff, 2-year linear), 25% VCs (1-year cliff, 2-year linear), 15% treasury, 40% community (farming over 4 years). Token price implies $200M market cap with $1.2B FDV.',
      outcome: 'The allocation is concerning. Combined team + VC = 45% — above the 30% red flag threshold. 1-year cliff means in 12 months, 45% of total supply begins unlocking. The FDV/market cap ratio is 6× — meaning 5× more tokens exist but are not yet circulating; significant future sell pressure is baked in. The 40% community allocation is positive but the distribution timeline matters: farming rewards over 4 years spreads community tokens gradually, while the cliff puts VC/team tokens into a much faster unlock. James should wait at least 14 months post-launch before considering a position — after the cliff event resolves and price adjusts.',
    },
    {
      contextTag: '[Token holder, spotting vesting risks]',
      scenario: 'Priya holds tokens in Protocol X. She checks the tokenomics page and notices: 30 million tokens unlock in 45 days (the 1-year VC cliff), current circulating supply is 50 million, current market cap is $150M.',
      outcome: 'This is a 60% supply increase event in 45 days. If VCs sell even 50% of their newly unlocked tokens, that is 15 million new tokens hitting the market — equivalent to 30% of current circulating supply. At current price, that sell pressure is $90M. Historical patterns: cliff unlock events reliably produce 20–40% price drops in the weeks around the unlock date as holders front-run anticipated selling. Priya should model her exit timeline: sell before the cliff if she wants to avoid the event; or wait 60+ days after the cliff when sell pressure has cleared. Never hold through a large cliff event without a plan.',
    },
    {
      contextTag: '[Protocol designer, tokenomics architecture]',
      scenario: 'Keiko is designing the tokenomics for a new DEX. She is choosing between: Option A — 50% community, 20% team (4y linear), 15% investors (4y linear), 15% treasury. Option B — 60% community, 15% team (2y cliff), 15% investors (2y cliff), 10% treasury.',
      outcome: 'Option A is significantly better designed. 35% combined team/investor allocation with 4-year linear vesting means: no cliff events, team stays aligned for 4 years, sell pressure is gradual (1/48th per month). Option B has a 2-year cliff — both team and investors unlock 30% of total supply simultaneously in 24 months. Even though the combined allocation is lower (30%), the cliff creates a concentrated sell event. The 4-year linear in Option A is also better for team retention: team members who leave after 2 years lose their unvested allocation, maintaining alignment. Recommendation: Option A, with the addition of an on-chain vesting contract (transparent and auditable) rather than trust-based agreements.',
    },
  ],

  keyTakeaway: 'Tokenomics red flags (short VC vesting, high team allocation, cliff events) predict predictable sell pressure — always calculate FDV vs market cap to understand the full supply picture and check vesting schedules before taking any significant position.',

  guidedPractice: [
    {
      question: 'A token has: price $0.50, circulating supply 100M tokens, total supply 1B tokens. What is the FDV and what does it imply?',
      options: [
        'FDV = $50M (price × circulating supply). This is the real valuation of the project.',
        'FDV = $500M (price × total supply). At current price, the project is valued at $500M once all tokens are in circulation — 10× the current market cap — implying significant future sell pressure as the remaining 900M tokens vest and enter circulation.', // ✓
        'FDV = $50M and there is no sell pressure because most tokens are locked.',
        'FDV = $500M but it is irrelevant because locked tokens cannot be sold.',
      ],
      correct: 1,
      hint: 'FDV = price × total supply. What does a 10× gap between market cap and FDV mean for future supply?',
      explanation: 'FDV (Fully Diluted Valuation) = price × total supply = $0.50 × 1B = $500M. Current market cap = price × circulating supply = $0.50 × 100M = $50M. The 10× gap means 900M tokens are locked but will eventually enter circulation. If price stays constant, the market cap must grow from $50M to $500M to absorb the supply — or the price falls. Historically, high FDV/market cap ratios are associated with price underperformance as vesting unlocks materialise. This is not a reason to avoid a project — but it is critical information for position sizing and timing.',
    },
    {
      question: 'What is the difference between a vesting cliff and linear vesting?',
      options: [
        'A vesting cliff releases tokens gradually every day; linear vesting releases all tokens at once at the end',
        'A vesting cliff releases nothing until a specific date then releases a large allocation at once; linear vesting releases tokens gradually over time at a fixed rate', // ✓
        'A vesting cliff only applies to team tokens; linear vesting applies to community tokens',
        'A vesting cliff is more investor-friendly; linear vesting is more community-friendly',
      ],
      correct: 1,
      hint: 'Picture a cliff: you walk a flat path then suddenly drop off a height. How does that apply to token unlocks?',
      explanation: 'Cliff vesting: 0 tokens released for the cliff period, then a large unlock at the cliff date. Example: 1-year cliff means nothing for 12 months, then 100% of the allocation unlocks. This is predictable concentrated sell pressure. Linear vesting: tokens release gradually — 1/36th per month for a 3-year vest means small, consistent sell pressure. Combined schedules (common): a 1-year cliff followed by 2 years of linear vesting means 33% unlocks at month 12, then 2.7% per month until full vest. Always look for cliff dates when evaluating existing holdings.',
    },
    {
      question: 'A protocol shows: 45% team + investor allocation with 3-year linear vesting and fees directed to a protocol treasury (not token holders). What incentive misalignment does this create?',
      options: [
        'No misalignment — team and investors holding tokens for 3 years demonstrates long-term commitment',
        'Token holders earn no direct protocol revenue (fees go to treasury, not token holders). Team and investors hold tokens for price appreciation only — creating pressure for token price speculation rather than building genuine protocol utility.', // ✓
        'The misalignment is only a concern if the team holds more than 50% of total supply',
        'Directing fees to treasury is always better than distributing to token holders due to tax considerations',
      ],
      correct: 1,
      hint: 'Who benefits from protocol fees in this design? Who holds the tokens?',
      explanation: 'Incentive alignment requires token holders\' financial interests to match protocol usage. When fees go to the treasury rather than token holders, token value derives purely from speculative price appreciation — not from cash flows. This aligns team and investors with price speculation rather than building genuine utility (since their tokens only gain value if price rises, not if the protocol generates more fees). Best design: portion of fees distributed to token holders who stake/lock, creating a direct link between protocol revenue and token value. This way, building more usage (more fees) directly benefits token holders rather than relying on speculation.',
    },
    {
      question: 'When checking tokenomics for a new protocol, you find no on-chain vesting contract — just a blog post saying tokens will vest over 4 years. What is the risk?',
      options: [
        'Blog post vesting commitments are legally binding in most jurisdictions',
        'Without an on-chain vesting contract, there is no technical enforcement of the schedule — the team can mint and sell tokens at any time, making the vesting schedule a promise rather than a code-enforced guarantee', // ✓
        'Blog post vesting is equivalent to on-chain vesting since the community would punish violations',
        'On-chain vesting contracts are only necessary for tokens above $100M market cap',
      ],
      correct: 1,
      hint: 'What is the difference between a promise and a smart contract? Which one is enforceable without trusting humans?',
      explanation: 'On-chain vesting contracts are transparent and trustless: the smart contract physically holds the tokens and releases them only according to the coded schedule. No human decision is required — no one can accelerate the vesting. Blog post or PDF vesting agreements are promises: the team controls the token contract and can mint or transfer tokens at will. Multiple projects have violated announced vesting schedules when facing financial pressure. Due diligence: look up the team\'s multisig wallet address, check it holds the team allocation, and verify whether it is locked by a transparent on-chain vesting contract (like Sablier or TokenVesting). If tokens are held in a plain multisig with no vesting enforcement, the vesting is not real.',
    },
    {
      question: 'Protocol A has 60% community allocation distributed via liquidity mining over 5 years. Protocol B has 60% community allocation distributed as an immediate airdrop at launch. Which has better incentive alignment for long-term liquidity?',
      options: [
        'Protocol B — immediate distribution gives the community maximum tokens to participate in governance',
        'Protocol A — gradual distribution via liquidity mining keeps ongoing incentives to provide liquidity for 5 years; Protocol B\'s immediate airdrop gives tokens to wallets that may sell immediately with no ongoing liquidity incentive', // ✓
        'Both are equivalent — total community allocation is the same in both cases',
        'Protocol B is better because liquidity mining emissions cause inflation that damages token price',
      ],
      correct: 1,
      hint: 'Which creates ongoing incentive to stay active in the protocol? Which might just result in immediate sell pressure?',
      explanation: 'Liquidity mining (Protocol A): tokens are distributed over time to wallets actively providing liquidity. This creates continuous incentive to stay in the protocol — stop providing liquidity, stop earning tokens. Five years of ongoing rewards builds a durable liquidity base. Immediate airdrop (Protocol B): tokens go to wallets based on a past snapshot. Recipients have no obligation to continue participating — many will sell immediately (airdrop farming). The airdrop creates one large sell event at launch. Protocol A\'s gradual distribution builds the protocol\'s liquidity depth over time; Protocol B\'s front-loaded distribution may produce better initial token distribution numbers on paper but worse liquidity sustainability.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 124 — On-Chain Analysis: Reading Etherscan and Dune Like a Pro
// ─────────────────────────────────────────────────────────────────────────────

const L124: IslandLevel = {
  id: 124, mechanic: 'memory', tier: 'pro',
  topic: 'On-Chain Analysis — Reading Etherscan and Dune Like a Pro',

  explanation: `
In August 2022, ZachXBT published a thread tracing a $620 million Axie Infinity hack to North Korean state hackers. Starting from a single wallet address, he followed transactions through 12 mixer services, 27 intermediate wallets, and 4 exchanges — eventually identifying exchange deposit addresses that North Korea had used in prior documented hacks. Every step used publicly available on-chain data. No privileged access. Just the blockchain.

On-chain analysis is the practice of reading blockchain data to understand who did what, when, and with whose money. For everyday users, the same skills that track hackers help evaluate token projects, understand whale behaviour, and verify protocol health.

The core tool is Etherscan (Ethereum), Solscan (Solana), or BaseScan (Base). Every transaction shows: sender, receiver, amount, timestamp, gas fee, and the internal calls a smart contract made. The "internal transactions" tab reveals what happened inside a transaction — particularly important for DeFi because a single swap may involve 5 internal contract calls.

Dune Analytics lets you run SQL queries against Ethereum's entire transaction history. The platform has thousands of community-built dashboards tracking protocol TVL, wallet activity, token flows, and custom metrics. You do not need to write SQL — search the dashboard library for the metric you need.

Nansen and Arkham add entity labels: they tag known exchange wallets, DeFi protocol contracts, known hackers, and whales with readable names. This converts raw addresses into meaningful actors.

The investigative workflow: follow the money (trace from origin wallet forward), identify exchange deposits (large round-number deposits to labelled exchange addresses), use time correlation (transactions from the same actor often cluster in time), and look for funding patterns (all wallets funded from the same source are likely the same actor).
  `.trim(),

  fact: 'On-chain analysis tools: Etherscan/Solscan/BaseScan (raw transaction data), Dune Analytics (custom SQL queries on-chain history), Nansen/Arkham (entity labelling). The investigative workflow: follow the money → identify exchange wallets → time correlation → funding pattern analysis.',
  plain: 'Every blockchain transaction is public and permanent. Tools like Etherscan let you see exactly who sent what to whom, when. Dune Analytics runs statistics on the whole blockchain. Nansen labels wallets with names (Binance Hot Wallet, Known Hacker). Together they let you investigate any wallet\'s history completely.',
  stars: [400, 490, 610], target: 610, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Investor, due diligence on a new protocol]',
      scenario: 'Marcus is considering investing in a new DeFi protocol. He checks the deployer wallet on Etherscan before investing $10,000.',
      outcome: 'What Marcus finds: the deployer wallet was funded 3 days ago by a wallet that funded 5 other protocol deployers — all of which were later abandoned. The deployer also holds a 40% token allocation in an unverified vesting contract. Red flags: fresh wallet (no history of legitimate development), funding pattern from a serial rug-puller wallet, opaque token allocation. These on-chain findings contradict the protocol\'s marketing which shows "experienced team." Marcus does not invest. The $10,000 decision took 15 minutes of on-chain research. The protocol was abandoned 3 weeks later.',
    },
    {
      contextTag: '[Whale watcher, reading large wallet behaviour]',
      scenario: 'Amara wants to understand whether large ETH holders are accumulating or distributing. She opens Nansen\'s "Smart Money" dashboard and looks at whale transaction activity over 7 days.',
      outcome: 'The dashboard shows: Smart Money wallets (wallets with strong historical trading performance) increased ETH holdings by 12% on aggregate over the past 7 days. Their stablecoin holdings decreased by 8% — consistent with converting stablecoins to ETH. Three separate wallets each accumulated 500+ ETH in the $1,800–$1,850 range. This is a buy signal in the whale watcher\'s toolkit: historically, Smart Money accumulation at a price range has preceded price moves. Amara treats this as one data point, not a trade signal, but notes the correlation.',
    },
    {
      contextTag: '[Security researcher, tracing a suspicious transaction]',
      scenario: 'Priya receives an alert: a protocol she uses just sent $2M to an unknown wallet. She traces the transaction on Etherscan to determine if this is a hack or legitimate treasury activity.',
      outcome: 'Priya opens the transaction on Etherscan. The internal transactions tab shows: the $2M left the protocol\'s governance treasury (labelled "Uniswap Governor Timelock" by Etherscan), went to a wallet labelled "Gauntlet Network" (a risk management firm). She finds the corresponding governance proposal on Snapshot — a 48-hour vote that passed 5 days earlier, approving a $2M risk management contract with Gauntlet. This is a legitimate governance-approved payment. The alarm was a monitoring alert with no context. The on-chain data immediately resolved the ambiguity: legitimate governance output, not a hack.',
    },
  ],

  keyTakeaway: 'On-chain analysis turns public blockchain data into actionable intelligence — trace wallet funding patterns to identify connected actors, check deployer history before investing, and use entity labels from Nansen/Arkham to convert raw addresses into meaningful names.',

  guidedPractice: [
    {
      question: 'On Etherscan, what does the "Internal Transactions" tab of a transaction reveal that the main transaction view does not show?',
      options: [
        'The gas price paid by the sender compared to the block\'s base fee',
        'The smart contract calls made within the transaction — revealing what DeFi protocols actually did internally, like which pools were accessed during a swap, which loans were repaid, and which collateral was moved', // ✓
        'The private wallet balance of the sender before and after the transaction',
        'The time it took for miners or validators to include the transaction in a block',
      ],
      correct: 1,
      hint: 'A single token swap might involve 5 contracts interacting. Where would you see those intermediate contract calls?',
      explanation: 'A simple Uniswap swap appears as one transaction from the user\'s perspective but internally may involve: calling the Router → Router calls the Pool → Pool calls the Token contract to transfer funds → Pool calls an oracle → Router returns tokens to user. Each internal call appears in the Internal Transactions tab. For security analysis, internal transactions reveal what a contract actually did — critical for identifying whether a transaction is a legitimate DeFi action or a malicious drain. During an exploit, internal transactions show the exact attack path: which function was called, what was drained, and where it went.',
    },
    {
      question: 'ZachXBT identifies that 12 wallets were all funded from the same single wallet on the same day. What does this pattern suggest?',
      options: [
        'The 12 wallets are likely independent users who happened to receive funds from a centralised exchange on the same day',
        'The 12 wallets are likely controlled by the same actor — common funding source and date suggests coordinated setup, used to disperse funds or create the appearance of multiple independent participants', // ✓
        'The funding pattern is irrelevant — only the wallets\' current holdings matter for analysis',
        'This pattern proves the wallets are Sybil wallets created by a protocol to farm its own airdrop',
      ],
      correct: 1,
      hint: 'If you wanted to control 12 wallets and disguise them as independent, how would you set them up? What would the on-chain evidence look like?',
      explanation: 'Common funding source is one of the strongest on-chain signals of wallet clustering. If one wallet sends ETH to 12 other wallets on the same day — particularly if those wallets then perform similar actions — this strongly suggests a single controller. The alternative (12 independent users all receiving funds from the same source at the same time) is statistically unlikely. This pattern is used to: de-anonymise Sybil airdrop farmers (Arbitrum disqualified 600,000+ wallets this way), trace hack proceeds, identify coordinated token manipulation, and connect pseudonymous teams to their development history.',
    },
    {
      question: 'You are evaluating a Dune Analytics dashboard showing a protocol\'s TVL grew from $5M to $85M in 7 days. What additional on-chain data would you check to determine if this is genuine growth?',
      options: [
        'The protocol\'s Twitter follower count and Discord member growth over the same period',
        'Wallet diversity (how many unique depositors), whether large wallets are the same entity, whether the TVL growth coincides with high emission rewards that will end soon', // ✓
        'The USD price of the protocol\'s token over the same period',
        'Whether the protocol has a verified smart contract on Etherscan',
      ],
      correct: 1,
      hint: 'Can one whale artificially inflate TVL? Can high temporary rewards attract capital that will leave when rewards end?',
      explanation: 'A 17× TVL increase in 7 days requires examination. Genuine growth metrics: 1,000+ unique new depositors (Dune query: distinct depositor addresses), deposits from wallets with no prior relationship to the protocol, TVL growth persisting after emission launch period ends. Warning signs: 80% of TVL from 5 wallets, TVL spike coincides exactly with emission launch, wallets are all funded from the same source (mercenary capital will leave when rewards end). TVL that concentrates in few wallets is fragile — when those whales exit, 80% of TVL leaves simultaneously. Diversity of depositors is the better health metric.',
    },
    {
      question: 'Arkham labels an Ethereum wallet as "Binance Hot Wallet 14." You see this wallet receiving $50M from a known hacker\'s address. What does this tell you?',
      options: [
        'Binance is involved in the hack and actively assisted the hacker',
        'The hacker sent proceeds to a Binance deposit address — Binance now holds KYC information on whoever controls this deposit address. Law enforcement can subpoena Binance to identify the account holder.', // ✓
        'The $50M is now permanently lost because Binance exchange wallets cannot be frozen',
        'The transaction is irreversible, so the entity labelling is only useful for academic analysis',
      ],
      correct: 1,
      hint: 'What does Binance know about every wallet that has ever deposited funds into their exchange?',
      explanation: 'Centralised exchanges are where on-chain tracing and real-world identity intersect. To deposit to Binance, you must complete KYC (government ID). If a hacker sends stolen funds to a Binance deposit address — even through 10 mixing steps — Binance holds the KYC identity of that deposit\'s account holder. Law enforcement subpoenas Binance (which Binance must comply with in their operating jurisdictions) and receives the identity. This is exactly how the 2022 Bitfinex hackers were caught: they eventually moved funds to a Coinbase account linked to their real identities. Entity labelling by Arkham/Nansen turns a 42-character hex address into actionable investigative intelligence.',
    },
    {
      question: 'You notice a wallet made 200 small ETH swaps in 8 hours, all buying the same token in identical $50 increments. What type of behaviour does this most likely indicate?',
      options: [
        'A small retail investor who manually executes $50 purchases throughout the day',
        'A trading bot — the identical size, systematic timing, and high frequency are characteristic of automated execution, likely a DCA bot or a market manipulation bot accumulating tokens while minimising price impact', // ✓
        'A protocol treasury rebalancing its token holdings',
        'A newly launched token airdrop claiming bot',
      ],
      correct: 1,
      hint: 'What human behaviour produces 200 identical transactions in 8 hours? What non-human behaviour does?',
      explanation: 'Bots are identifiable by their inhuman precision: identical transaction amounts, systematic timing intervals, zero human reaction time to market events. This pattern — 200 × $50 in 8 hours — is a DCA bot or accumulation bot. DCA bots are legitimate (private investors automating their buying strategy). Manipulation bots are not: wash trading bots create fake volume by buying and selling between controlled wallets, price manipulation bots accumulate slowly to avoid moving price then dump. Identifying bot behaviour matters for: determining whether trading volume is genuine (wash trading inflates volume metrics), evaluating whether a token\'s price increase is organic or bot-driven, and understanding liquidity depth (if 90% of trading is bots, real exit liquidity may be much lower).',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 125 — Stablecoin Mechanics and De-Peg Risk
// ─────────────────────────────────────────────────────────────────────────────

const L125: IslandLevel = {
  id: 125, mechanic: 'match3', tier: 'pro',
  topic: 'Stablecoin Mechanics and De-Peg Risk',

  explanation: `
On March 11, 2023, USDC — the most regulated and transparent stablecoin in crypto — fell to $0.87 on Coinbase. Circle, the issuer, had $3.3 billion of USDC reserves held in Silicon Valley Bank, which had just collapsed. Within 48 hours, USDC recovered to $1.00 after the US government guaranteed all SVB deposits. But for those 48 hours, the "stable" coin was neither stable nor certain to recover.

Stablecoins maintain their $1 peg through fundamentally different mechanisms — and those mechanisms determine what can break them.

Fiat-backed (USDC, USDT): a company holds $1 in cash or cash equivalents for every token in circulation. Trust requirement: trust that the company actually has the money (USDC publishes monthly Deloitte attestations; USDT's reserves have historically been less transparent). De-peg risk: counterparty failure (if the issuer goes bankrupt or bank holds fail), regulatory seizure, or market panic causing redemptions the issuer cannot process fast enough.

Crypto-overcollateralised (DAI by MakerDAO): $1 of DAI requires depositing $1.50–$3.00 of ETH, WBTC, or other accepted collateral. If collateral drops below the threshold, positions are automatically liquidated. De-peg risk: liquidation cascade (fast collateral price crash where liquidations create more selling pressure, crashing price further, triggering more liquidations — a death spiral that nearly happened in March 2020).

Algorithmic stablecoins (UST, formerly): used a "burn/mint" mechanism with a companion token (LUNA) rather than real collateral. In May 2022, UST lost its peg, the mechanism failed, and both UST and LUNA went to approximately zero — $40 billion in value destroyed in 72 hours. This model is now widely regarded as fundamentally broken.
  `.trim(),

  fact: 'Three stablecoin models: fiat-backed (USDC/USDT — trust the issuer), crypto-overcollateralised (DAI — trust the smart contract + liquidation mechanics), algorithmic (UST — proven fatally broken). Risk hierarchy: USDC (counterparty) < DAI (liquidation cascade) < algorithmic (bank run = zero).',
  plain: 'Stablecoins stay at $1 in different ways. USDC: the company holds real dollars (but SVB showed that can fail). DAI: locked crypto backs it, automatically sold if price falls too much. UST: used a token algorithm — and in 2022 went to zero in 3 days, destroying $40B. Know which model you\'re using and what breaks it.',
  stars: [420, 510, 640], target: 640, coins: 40,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Risk analyst, comparing stablecoins for treasury allocation]',
      scenario: 'A DAO treasury holds $2M in stablecoins. The governance team is choosing between USDC, USDT, DAI, and FRAX. They want maximum security for funds that will sit 12+ months.',
      outcome: 'Risk ranking: USDC (most transparent reserves, US regulated, monthly Deloitte attestation — but carries SVB-type counterparty risk if Circle\'s banking relationships fail). USDT (largest market cap but most historically opaque about reserves — choose last for a transparency-focused DAO). DAI (no counterparty — decentralised smart contract, backed by overcollateralised crypto, but vulnerable to liquidation cascade in extreme market conditions; USDC comprises ~40% of DAI collateral now, adding secondary counterparty risk). Recommended: split 60% USDC, 30% DAI, 10% USDT — diversify counterparty risk. Never put 100% in any single stablecoin regardless of perceived safety.',
    },
    {
      contextTag: '[DeFi user, evaluating a new protocol\'s stablecoin yield]',
      scenario: 'James finds a protocol offering 18% APY on its own algorithmic stablecoin, XSTABLE, backed by its governance token XGOV. He compares it to 5% APY on USDC in Aave.',
      outcome: 'XSTABLE is a governance-token-backed algorithmic stablecoin — structurally identical to UST/LUNA. The 18% APY is paid in XGOV, which has no utility outside the protocol. This creates a reflexive loop: high XSTABLE yields attract capital → capital buys XGOV → XGOV price rises → yield looks attractive → repeat. Unwinding: XSTABLE loses peg → sellers dump XGOV to exit → XGOV crashes → XSTABLE collateral collapses → death spiral. The 5% USDC yield in Aave represents real market demand for borrowed capital. The 18% XSTABLE yield is a Ponzi-adjacent emission schedule. James chooses Aave.',
    },
    {
      contextTag: '[Market analyst, monitoring de-peg risk]',
      scenario: 'Amara holds $50,000 in DAI. She notices: ETH has dropped 35% in 3 days, DAI is trading at $0.98 on Curve, and the DAI Savings Rate dropped from 8% to 5% this morning.',
      outcome: 'Three simultaneous warning signals. $0.98 DAI peg deviation on Curve suggests arbitrage hasn\'t fully corrected the peg — unusual for a functioning stablecoin. ETH -35% in 3 days means many DAI positions may be near their liquidation threshold. Lower DSR (DAI Savings Rate) means MakerDAO governance is reducing the yield incentive to hold DAI, possibly to manage reserve spending. These signals suggest elevated liquidation risk and a potential peg instability event. Amara should consider reducing her DAI position by 30–50% and moving to USDC or on-chain T-Bills until market conditions stabilise. This is risk management, not panic.',
    },
  ],

  keyTakeaway: 'The three stablecoin models (fiat-backed, crypto-overcollateralised, algorithmic) have fundamentally different risk profiles — fiat-backed faces counterparty failure, DAI faces liquidation cascades, and algorithmic models are proven to fail catastrophically when confidence breaks.',

  guidedPractice: [
    {
      question: 'Why did USDC fall to $0.87 in March 2023 despite Circle holding enough dollars to back every token?',
      options: [
        'Circle was revealed to have fraudulently minted USDC without corresponding dollar reserves',
        'Market panic about $3.3B of reserves being trapped in the collapsed Silicon Valley Bank caused a sell-off — even though Circle ultimately had sufficient total reserves, the uncertainty about accessing that specific portion drove a temporary depeg', // ✓
        'The Federal Reserve announced it would not support stablecoin redemptions, causing a confidence collapse',
        'USDC was technically deppegged because Ethereum network congestion prevented arbitrageurs from restoring the peg',
      ],
      correct: 1,
      hint: 'Circle had total reserves exceeding USDC supply. Why did the peg still break temporarily?',
      explanation: 'Stablecoin pegs depend on confidence in redemption availability, not just solvency. Circle had total reserves exceeding USDC supply — they were solvent. But $3.3B of those reserves were in Silicon Valley Bank, which had just been seized by regulators. In the 36 hours before the US government guaranteed all SVB deposits, nobody knew if that $3.3B would be recoverable. Uncertainty about near-term redemption availability caused panic selling — USDC holders sold at $0.87 rather than risk being unable to redeem at all. This shows: even a well-backed stablecoin can depeg temporarily due to liquidity perception risk, not solvency. Recovery came only when the US government\'s deposit guarantee restored confidence.',
    },
    {
      question: 'MakerDAO\'s DAI requires 150% collateralisation for ETH-backed positions. ETH price falls 40% in 24 hours. What happens?',
      options: [
        'DAI automatically adjusts its $1 peg to reflect the new lower collateral value',
        'Positions that fall below the 150% collateralisation ratio are automatically liquidated — their ETH collateral is sold to repay the DAI loan, potentially creating cascading sell pressure if many positions liquidate simultaneously', // ✓
        'MakerDAO governance votes to accept lower collateralisation temporarily until ETH recovers',
        'DAI holders can redeem their DAI for ETH directly during the collateral crisis',
      ],
      correct: 1,
      hint: 'What does the 150% minimum do to a position when collateral value drops 40%? What happens to the collateral?',
      explanation: 'A 150% collateralisation ratio means: if you borrow 100 DAI, you must hold at least $150 of ETH. If ETH drops 40%, your $150 of ETH is now worth $90. You\'ve violated the 150% minimum (you now have only $90 / 100 DAI = 90% collateralisation). MakerDAO\'s liquidation bots automatically sell your ETH to repay the DAI loan. Problem: many positions liquidate simultaneously → many forced ETH sales → ETH price falls further → more positions liquidate → cascade. March 2020: ETH dropped 50% in one day, triggering $8M in MakerDAO liquidations that caused ETH to temporarily trade at $0 in the auction system because gas was too high for liquidators. The system survived but created a $4M shortfall that MKR holders had to repay.',
    },
    {
      question: 'Why is algorithmic stablecoin collateralised by its own governance token structurally more fragile than fiat-backed or crypto-overcollateralised models?',
      options: [
        'Algorithmic stablecoins use more complex smart contracts, which creates more potential for bugs',
        'The governance token\'s value depends on the stablecoin\'s success; when the stablecoin loses confidence, the governance token crashes too — destroying the collateral simultaneously, creating a death spiral with no external collateral source to stop it', // ✓
        'Algorithmic models require trusted validators to maintain the peg, introducing centralisation risk',
        'Governance tokens cannot be used as collateral in DeFi, limiting the stablecoin\'s utility',
      ],
      correct: 1,
      hint: 'In the UST/LUNA model, what happens to LUNA when UST loses confidence? What is backing UST at that point?',
      explanation: 'The fundamental flaw: algorithmic stablecoins backed by governance tokens create circular dependency. LUNA\'s value derived from UST\'s success → UST was backed by LUNA → if UST confidence broke, LUNA fell → LUNA falling meant UST collateral collapsed → which broke UST further → which crashed LUNA further. No external value source (no real dollars, no battle-tested ETH) could break the reflexive spiral. Compare: USDC depeg in March 2023 — Circle had real dollars in banks unrelated to USDC\'s existence. Those dollars\' value didn\'t fall because USDC depegged. The collateral was independent of the stablecoin. That independence is the crucial structural difference. The algorithmic model with native token collateral cannot survive a loss of confidence.',
    },
    {
      question: 'You want to hold $100,000 in stablecoins for 18 months with minimum risk. You are considering 100% USDC, 100% USDT, or a 60/30/10 split (USDC/DAI/USDT). Which is the best risk management choice?',
      options: [
        '100% USDC — the most transparent and regulated stablecoin minimises risk',
        'The 60/30/10 split — diversification across issuers and collateral models means no single failure mode (Circle counterparty, Maker liquidation cascade, or Tether reserve opacity) destroys the entire holding', // ✓
        '100% USDT — largest market cap provides maximum liquidity to exit if needed',
        '100% DAI — no centralised counterparty means no regulatory or bank failure risk',
      ],
      correct: 1,
      hint: 'What single event could destroy 100% USDC? 100% USDT? What event could simultaneously destroy USDC + DAI + USDT?',
      explanation: 'Risk diversification applies to stablecoins as much as to any asset. 100% USDC: one Circle bank failure or regulatory seizure could depeg the entire holding. 100% USDT: one reserve transparency revelation or regulatory action could trigger a bank run. 100% DAI: one severe crypto market crash could trigger liquidation cascades. A simultaneous failure of USDC, DAI, and USDT would require: Circle to fail (bank crisis), ETH/BTC to crash 70%+ in 24 hours (DAI cascade), AND Tether to collapse — three independent catastrophic scenarios simultaneously. The 60/30/10 split makes each position survivable even in worst-case scenarios for each issuer, while maintaining meaningful diversification.',
    },
    {
      question: 'A new stablecoin advertises "fully decentralised, no counterparty risk, backed by protocol revenue and governance tokens." What single question identifies whether this carries extreme de-peg risk?',
      options: [
        '"What is the protocol\'s TVL?" — high TVL indicates sufficient backing',
        '"Is the backing independent of the stablecoin\'s own success?" — if the collateral value depends on the stablecoin protocol succeeding, the reflexive feedback loop makes it vulnerable to catastrophic de-peg', // ✓
        '"Is the smart contract audited?" — unaudited contracts are the primary stablecoin risk',
        '"What is the circulating supply?" — smaller supply stablecoins carry lower de-peg risk',
      ],
      correct: 1,
      hint: 'UST was backed by LUNA — whose value depended on UST\'s success. What is the question that reveals this circular dependency?',
      explanation: 'The single most important question for any stablecoin: "Does the value of the collateral depend on this stablecoin continuing to exist and function?" If yes, you have circular dependency — the UST/LUNA problem. Governance token backing, protocol revenue from the protocol itself, or any collateral whose value derives from the stablecoin\'s success creates this reflexive loop. If no — if collateral is ETH (exists independently), real dollars (exist independently), or US Treasuries (exist independently) — the stablecoin has a floor value anchored to external reality. The auditing question matters but is secondary. Circular collateral dependency is the structural flaw that makes certain stablecoins guaranteed to eventually fail, not just occasionally vulnerable.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 126 — Advanced DeFi Yield: Looping and Delta-Neutral
// ─────────────────────────────────────────────────────────────────────────────

const L126: IslandLevel = {
  id: 126, mechanic: 'liquidation', tier: 'pro',
  topic: 'Advanced DeFi Yield — Looping and Delta-Neutral',

  explanation: `
In November 2022, a DeFi trader had $100,000 in ETH deposited in Aave, borrowed $60,000 USDC, bought more ETH with the USDC, deposited that ETH back to Aave, borrowed more USDC, and repeated the loop 4 times. The effective position: $260,000 of ETH exposure with $160,000 of USDC debt. The ETH supply APY was 3.5%. The USDC borrow APY was 4.5%. Net yield on the loop: 3.5% × 2.6 − 4.5% × 1.6 = 9.1% − 7.2% = 1.9% net on the original $100,000. When ETH dropped 30%, the trader was liquidated.

Looping (also called recursive borrowing) is a yield amplification strategy: deposit collateral, borrow against it, buy more collateral, deposit again, repeat. Each iteration increases both yield and liquidation risk proportionally. The yield increase is linear; the liquidation risk increase is non-linear.

Delta-neutral strategies solve a different problem: they seek to earn DeFi yield without directional exposure to crypto price movements. The most common approach: hold spot ETH + short ETH perpetual futures. The spot ETH earns staking yield (~4% APY). The short perpetual earns funding rate when positive (traders pay longs to maintain positions during bull markets — historically +0.01% to +0.1% per 8 hours, annualised up to 30%+). The net position: zero directional exposure to ETH price, with combined staking + funding rate yield.

Risks of delta-neutral: funding rate reversal (if market turns bearish, shorts pay longs — negative funding destroys the yield thesis), basis risk (spot and perpetual prices diverge during extreme market moves), and platform risk on the exchange holding the short position.
  `.trim(),

  fact: 'Looping amplifies yield by recursive borrowing but amplifies liquidation risk equally — a 3× loop at 150% collateral ratio liquidates at a 33% collateral price drop instead of 50%. Delta-neutral (long spot + short perp) earns funding rate + staking yield with zero directional crypto exposure, but funding rate reversal eliminates the strategy\'s thesis.',
  plain: 'Looping: borrow money to buy more collateral, repeat. Makes yields higher but also makes liquidation much closer. Delta-neutral: hold crypto while shorting the same amount in futures — price moves cancel out. You just earn the yield from both sides. If the funding rate goes negative (bears pay bulls), the strategy loses money.',
  stars: [440, 540, 670], target: 670, coins: 40,
  simulatorLesson: 'liquidation',

  examples: [
    {
      contextTag: '[Yield farmer, calculating loop liquidation price]',
      scenario: 'Marcus has $50,000 ETH in Aave (ETH price: $2,000). He loops to 2.5× leverage (deposits, borrows USDC, buys ETH, re-deposits). Aave\'s ETH liquidation threshold is 82.5%. What is his liquidation price?',
      outcome: 'At 2.5× leverage: $125,000 ETH position, $75,000 USDC debt. Collateral ratio = $125,000 / $75,000 = 166%. Liquidation threshold = 82.5%, meaning liquidation occurs when ETH value / USDC debt = 82.5% → ETH value = $75,000 × 82.5% = $61,875. Liquidation ETH price = $61,875 / 62.5 ETH = $990 per ETH. That\'s a 50.5% drop from current price. The 2.5× loop bought more yield (amplified staking and supply APY) but moved the liquidation price from around $1,000 (at 1× leverage) to $990 — not dramatically worse at this leverage. At 4× leverage, the liquidation price would be $1,400 — only a 30% drop away. This is where looping becomes genuinely dangerous.',
    },
    {
      contextTag: '[Institutional yield desk, delta-neutral implementation]',
      scenario: 'Priya manages $2M of stablecoin yield for a family office. She proposes a delta-neutral ETH strategy: $1M in stETH (earning 4% APY staking yield) + $1M short ETH perpetual on a major exchange (capturing funding rate, historically +15-25% APY in bull markets). The family office asks about risks.',
      outcome: 'Risk 1 (Funding rate reversal): In bear markets, shorts pay longs — funding becomes negative. At -0.1% per 8 hours, annual yield of the short position becomes -110%, wiping out staking yield. Risk management: monitor funding rate daily; close position if funding rate stays negative for 72+ hours. Risk 2 (Exchange risk): The $1M short position is on a centralised exchange. FTX held $2B of customer funds when it collapsed. Risk management: use a top-3 CEX (Binance/OKX/Bybit), never more than $500K per exchange, maintain emergency close capability. Risk 3 (Liquidation risk): if the exchange short is liquidated, you hold $1M of spot ETH with no hedge. Risk management: maintain 20% margin buffer, set automatic close orders. The strategy is viable at $2M with these controls.',
    },
    {
      contextTag: '[Risk analyst, comparing looping vs delta-neutral]',
      scenario: 'James evaluates two strategies for $100,000: (A) 3× ETH loop in Aave — projected 12% APY if ETH stays flat. (B) Delta-neutral stETH + short perp — projected 18% APY if funding rate holds positive.',
      outcome: 'Strategy A risk: liquidation at ETH -33%. No funding rate dependency. Liquidation is automatic and unrecoverable — account drained. Yield is locked in as long as ETH doesn\'t drop 33%. Strategy B risk: funding rate dependency. If funding turns negative for 3+ months (2022 bear market scenario), APY goes to zero or negative. Position can be manually closed without loss to principal. Key difference: looping creates liquidation risk (loss of principal), delta-neutral creates yield rate risk (loss of yield, not principal). For a risk-averse investor with long-term capital, B is preferable — loss scenario is "I earned 0%" not "I lost 33% of my capital".',
    },
  ],

  keyTakeaway: 'Looping amplifies yield by multiplying leverage — but equally amplifies liquidation risk, moving your liquidation price dangerously close to the current price; delta-neutral strategies eliminate directional risk but expose you to funding rate reversal, which can turn a profitable yield strategy cash-flow negative.',

  guidedPractice: [
    {
      question: 'A 4× ETH loop in Aave (80% collateral ratio, 82.5% liquidation threshold) has $200,000 ETH exposure and $150,000 USDC debt. At what ETH price does liquidation occur?',
      options: [
        'When ETH drops 50% from current price — the same as an unlevered position',
        'When ETH value × 82.5% = USDC debt → ETH value = $150,000 / 0.825 = $181,818. If current ETH value is $200,000, liquidation occurs at a ~9% price drop — much closer than an unlevered position', // ✓
        'When ETH drops below the original purchase price — the break-even point',
        'Looped positions cannot be liquidated — they automatically de-leverage when the collateral ratio falls',
      ],
      correct: 1,
      hint: 'Liquidation threshold = debt / collateral value. Solve for the collateral value at liquidation.',
      explanation: 'Liquidation formula: liquidation occurs when collateral value × liquidation threshold = debt. $150,000 / 0.825 = $181,818 required collateral value. Current collateral: $200,000. Drop to liquidation: ($200,000 - $181,818) / $200,000 = 9.1%. At 4× leverage, a 9.1% adverse price move liquidates the position — extremely tight. Compare to 1× leverage at the same 82.5% threshold: you would need to borrow against $200,000 to be liquidated, and with no debt, there is no liquidation. This is the critical insight: every increment of additional leverage dramatically compresses the liquidation buffer. Looping past 3× is speculative leverage that professional traders use with active monitoring and automated stop-losses.',
    },
    {
      question: 'During a bear market, ETH perpetual funding rates turn negative (-0.05% per 8 hours = -54% annualised). What happens to a delta-neutral stETH + short ETH perp strategy?',
      options: [
        'The strategy becomes more profitable because short positions earn more in bear markets',
        'The short perp position now costs -54% annualised, while stETH earns +4% staking yield — net return is -50%, meaning the strategy loses money every day until closed or funding normalises', // ✓
        'The funding rate turns negative but the position automatically closes to prevent losses',
        'The position becomes unhedged (delta-positive) when funding rates are negative',
      ],
      correct: 1,
      hint: 'Funding rate is what shorts earn (positive) or pay (negative). If you\'re short and funding is negative, what direction does your P&L go?',
      explanation: 'Funding rate direction: in bull markets, longs pay shorts (positive funding — short earns income). In bear markets, shorts pay longs (negative funding — short pays out). At -0.05% per 8 hours × 3 per day × 365 = -54.75% annualised: the short position bleeds 54.75% per year. Add the stETH +4% yield: net = -50.75% annualised. The strategy that was earning 18-25% in bull conditions is now losing 50%+ in this bear scenario. This is why delta-neutral requires active monitoring: a sustained negative funding environment makes the strategy cash-flow-negative. The positions must be manually closed (with no loss to principal at close) to stop the bleeding. Unlike liquidation risk, funding rate losses are recoverable — you lose yield, not the principal.',
    },
    {
      question: 'Why is basis risk a concern for a delta-neutral strategy during extreme market events?',
      options: [
        'Basis risk means the two assets in the pair (stETH and ETH) have different on-chain gas fees',
        'During extreme moves, spot and perpetual prices can diverge — the perpetual might trade at a significant discount or premium to spot, meaning the "equal and opposite" positions are no longer perfectly hedged and the position takes on directional exposure', // ✓
        'Basis risk only applies when the position is created, not during holding',
        'Basis risk means the funding rate database is inaccurate, making APY projections unreliable',
      ],
      correct: 1,
      hint: 'If spot ETH = $1,800 and ETH perp = $1,650 during a crash, are long spot + short perp perfectly neutral?',
      explanation: 'Basis = difference between spot price and perpetual price. Normally small (0.1-0.5%) and quickly arbitraged away. During extreme events: March 2020, ETH spot fell to $90 while ETH perp temporarily fell to $75 — a $15 basis (16%). A perfect delta-neutral (long spot + short perp) would have: lost $90-$75 = $15 per ETH as the perpetual was oversold vs spot. To exit: close spot at $90, close perp at $75 — P&L reflects the $15 negative basis. In extreme cases, basis risk can produce meaningful losses even for a "market-neutral" position. Mitigation: use perp exchanges with good circuit breakers, avoid holding through extreme news events without monitoring.',
    },
    {
      question: 'You want to loop ETH in Aave to amplify yield. What is the most important risk management rule before executing?',
      options: [
        'Never loop more than 2× because Aave limits all users to 2× maximum leverage',
        'Calculate your exact liquidation price before entering, then verify you have a buffer of at least 30-40% between current ETH price and liquidation price — and set price alerts to de-leverage manually before reaching that threshold', // ✓
        'Loop only during bull markets when ETH price is rising to maximise profits',
        'Keep the loop to 24 hours or less to avoid accumulating interest charges',
      ],
      correct: 1,
      hint: 'What is the one scenario that causes permanent loss in a looped position? How do you prevent it?',
      explanation: 'Liquidation is the catastrophic outcome of looping — it is permanent and automatic. Risk management: calculate your liquidation price precisely (not approximately) before entering. Set price alerts at 20% above your liquidation price. At the alert, begin de-leveraging: repay part of the USDC loan → some ETH is freed → can be sold or kept, reducing the loop ratio. At 10% above liquidation, close the loop fully. This converts the catastrophic (liquidation) outcome into a managed exit. The 30-40% buffer is the minimum acceptable safety margin for a position you will not monitor 24/7. If you cannot actively monitor the position (including during your sleeping hours), you should not loop at all — ETH can move 20% in 4 hours.',
    },
    {
      question: 'A yield farmer compares two stablecoin strategies: (A) Supply USDC to Aave for 5% APY. (B) Loop USDC/ETH on Aave at 3× leverage for projected 15% APY net of borrowing costs. The farmer says "both are stablecoin strategies so they have the same risk." What is wrong with this analysis?',
      options: [
        'Strategy B is also risk-free because borrowing USDC against ETH has no directional exposure',
        'Strategy A carries zero liquidation risk (no borrowing). Strategy B carries significant liquidation risk because ETH collateral value determines the position health — if ETH drops 25%, the loop may liquidate, converting a "stablecoin strategy" into a loss of principal', // ✓
        'Both strategies have the same risk because USDC is a stablecoin',
        'Strategy A has higher risk because smart contract exposure to Aave is greater for suppliers than borrowers',
      ],
      correct: 1,
      hint: 'In Strategy B, what asset backs the USDC loan? What happens if that asset\'s price falls significantly?',
      explanation: 'Strategy B is not a stablecoin strategy despite involving USDC — it is a leveraged ETH position denominated in USDC. The $150K USDC debt is secured by ETH collateral. If ETH falls 25%, the collateral may not cover the debt at Aave\'s liquidation threshold, triggering automatic liquidation. The farmer loses ETH collateral (the "real asset" backing the strategy). This is directional ETH exposure packaged as a yield strategy. Compare: Strategy A — USDC supply earns interest, risk is Aave smart contract risk + USDC depeg risk only, no liquidation possible. Never conflate "the loan is in stablecoins" with "the strategy is stablecoin risk." The relevant risk is the collateral asset\'s volatility, not the denomination of the debt.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 127 — Real-World Asset (RWA) Tokenisation
// ─────────────────────────────────────────────────────────────────────────────

const L127: IslandLevel = {
  id: 127, mechanic: 'trait', tier: 'pro',
  topic: 'Real-World Asset Tokenisation — The $16T Opportunity',

  explanation: `
In March 2024, BlackRock — the world's largest asset manager with $10 trillion under management — launched BUIDL, a tokenised money market fund on Ethereum. Within 8 weeks, it reached $500 million in assets. BlackRock was not doing this as an experiment. They were doing it because tokenised assets settle in seconds instead of days, operate 24/7, and can be used as collateral in DeFi protocols without ever leaving the blockchain. Institutional infrastructure met public blockchains.

Real-world asset (RWA) tokenisation is the process of creating a blockchain token that represents ownership of an off-chain asset. The asset stays in the real world; the token moves on-chain. Categories: government bonds (most developed), corporate debt, real estate, commodities (gold, oil), trade finance receivables, private equity, and carbon credits.

The mechanics of a tokenised bond: an issuer (Ondo Finance, Franklin Templeton, BlackRock) creates a Special Purpose Vehicle (SPV) that legally holds US Treasury bonds. The SPV issues tokens — each token represents a fractional claim on the SPV's bond holdings. Yield: the bond coupon flows from the US Treasury → to the SPV → distributed to token holders. Redemption: redeem token → SPV sells the corresponding bonds → returns USD to the holder.

The trust model is non-negotiable: the token is only as safe as the underlying custodian. The US Treasury bonds exist in the real world, held by a bank or custodian. The smart contract does not hold bonds — it records who owns the claim. If the custodian fails, is seized by regulators, or has misrepresented the holdings, the token loses its backing.

Key protocols: Ondo Finance (USDY — tokenised T-Bills, ~5% APY), Centrifuge (trade finance, ~6-10% APY), Maple Finance (institutional loans, higher yield, higher risk), Franklin Templeton's FOBXX (~4.5% APY, oldest tokenised fund, originally on Stellar, now multi-chain).
  `.trim(),

  fact: 'RWA tokenisation: a token represents ownership of an off-chain asset held by a custodian/SPV. The token is only as safe as the custodian. Key protocols: Ondo (USDY — tokenised T-Bills), Centrifuge (trade finance), Franklin Templeton FOBXX, BlackRock BUIDL. Primary risk: off-chain custody, not smart contract.',
  plain: 'RWA tokens are like receipts for real assets sitting in a bank vault. USDY token = your share of US government bonds held by Ondo. The yield is real (from actual bonds), but the token\'s safety depends on trusting the company holding the bonds, not the Ethereum smart contract. If the company fails, the bonds may be gone.',
  stars: [460, 560, 700], target: 700, coins: 40,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[DeFi user, evaluating USDY vs USDC]',
      scenario: 'Amara holds $30,000 stablecoins in DeFi. She is comparing USDC (earning 5% via Aave) with USDY from Ondo Finance (tokenised T-Bills, currently yielding 5.3%). She wants the safest option.',
      outcome: 'USDC risk: Circle (USDC issuer) trust + Aave smart contract risk. USDY risk: Ondo Finance (entity trust) + SPV legal risk + custodian (Clear Street) holding the T-Bills + Ethereum smart contract risk. USDY carries more trust layers than USDC despite slightly higher yield. The 0.3% extra yield is the risk premium for the additional custodial layers. For $30,000, USDY is likely acceptable — Ondo is well-capitalised with institutional backers. For $500,000, the concentration in one less-tested SPV structure deserves more caution. Key question: can Amara redeem USDY directly, or does she need to use a secondary market? If redemption requires Ondo\'s approval, that adds meaningful liquidity risk.',
    },
    {
      contextTag: '[Institutional DeFi, using RWA as collateral]',
      scenario: 'A DeFi protocol governance proposal suggests accepting BlackRock BUIDL tokens as collateral for a stablecoin loan. The proposal projects this will attract $200M in new TVL. James evaluates the risks.',
      outcome: 'BUIDL collateral risks: (1) BlackRock trust — accepting that $10T AUM institution holding bonds is lower risk than most alternatives. (2) Redemption speed — BUIDL redeems only on US business days; a DeFi liquidation event during a weekend cannot access the collateral until Monday. This creates a 72-hour window where the protocol cannot liquidate BUIDL collateral in an emergency. (3) Regulatory seizure — if a BUIDL holder is sanctioned, the entire SPV may freeze until legal resolution. Recommendation: accept BUIDL as collateral at 90% LTV (lower than typical 95% for stablecoins) with a 5-day liquidation buffer, and explicitly document the weekend redemption limitation in the collateral terms.',
    },
    {
      contextTag: '[Yield seeker, evaluating Centrifuge trade finance]',
      scenario: 'Priya finds a Centrifuge pool offering 9% APY on trade finance receivables — invoices from a manufacturing company in Germany. She compares this to 5% on tokenised T-Bills.',
      outcome: 'Trade finance yield premium: 4% above T-Bills reflects real credit risk. T-Bills: backed by the US government (essentially zero default risk). Manufacturing invoice: backed by the creditworthiness of the invoice debtor. If the debtor defaults, the invoice loses value. Centrifuge specific risks: (1) Junior tranche vs senior tranche — junior absorbs first losses (higher yield, higher risk); senior has first claim (lower yield, lower risk). Ask which tranche. (2) Originator risk — Centrifuge relies on the pool originator to collect invoices honestly and report defaults accurately. (3) Liquidity: trade finance pools have lock-up periods (30–90 days); you cannot exit immediately. For Priya\'s risk tolerance: 5–10% of portfolio in a senior Centrifuge tranche is reasonable as diversification; not a core holding.',
    },
  ],

  keyTakeaway: 'RWA tokenisation brings real yield (from real bonds, real loans, real assets) on-chain — but every RWA token depends on an off-chain custodian, SPV, or institution that exists entirely outside the blockchain\'s security model, making custodian risk the primary concern, not smart contract risk.',

  guidedPractice: [
    {
      question: 'BlackRock\'s BUIDL token represents ownership of US Treasury bonds. If Ethereum has a critical security failure, what happens to the underlying T-Bills?',
      options: [
        'The T-Bills are lost because they are linked to Ethereum\'s blockchain state',
        'The T-Bills are unaffected — they are held by a custodian in the real world, independent of Ethereum. Ethereum failure would prevent token transfers, but the underlying asset ownership would still be recorded in the off-chain SPV structure', // ✓
        'The T-Bills automatically convert to USDC stablecoins as a safety mechanism',
        'BlackRock would issue replacement tokens on a new blockchain using the same underlying assets',
      ],
      correct: 1,
      hint: 'The token lives on Ethereum. The bonds live where?',
      explanation: 'RWA tokens are pointers to real-world assets, not the assets themselves. The BUIDL token on Ethereum records who has a claim on the BUIDL SPV\'s T-Bill holdings. The T-Bills are in a brokerage account held by a custodian under BlackRock\'s SPV structure. If Ethereum disappears tonight: the T-Bills still exist; BlackRock still holds them; the SPV legal entity still operates. The challenge would be proving ownership claims without the blockchain registry — requiring courts to recognise the off-chain SPV shareholder records instead. The blockchain makes ownership transfer fast and global; it is not the asset itself. This is fundamentally different from native crypto assets where the blockchain IS the asset (ETH only exists on Ethereum).',
    },
    {
      question: 'Ondo Finance\'s USDY yields 5.3% APY on tokenised T-Bills. US Treasuries yield 5.25%. Where does the 0.05% difference come from?',
      options: [
        'USDY earns additional yield from Ondo\'s lending activities in DeFi',
        'Ondo Finance takes a management fee (0.05-0.15%) from the T-Bill yield before passing the remainder to USDY holders — the net token yield reflects T-Bill rate minus Ondo\'s fee', // ✓
        'USDY earns exactly what T-Bills earn — the 0.05% difference is a market pricing error',
        'The extra yield comes from USDY holders providing liquidity to Ondo\'s internal market-making',
      ],
      correct: 1,
      hint: 'Protocol operators charge fees. Where does Ondo\'s revenue come from?',
      explanation: 'RWA protocol fees: the operator (Ondo, Franklin Templeton, BlackRock) incurs real costs — legal SPV setup and maintenance, auditing, KYC/AML compliance, custodian fees, smart contract audits. These costs are funded by taking a spread between the gross T-Bill yield and the net token yield. Ondo charges ~0.15% annually on USDY. At 5.25% T-Bill rate: 5.25% - 0.15% ≈ 5.10% to token holders (market rates fluctuate). The 0.15% fee is the price of the on-chain wrapper, legal compliance, and liquidity infrastructure. Compare to Vanguard Treasury ETFs charging 0.05%: on-chain adds meaningful compliance cost but also adds DeFi composability (USDY usable as collateral in protocols like Morpho).',
    },
    {
      question: 'A tokenised real estate RWA protocol promises 12% APY from commercial property rental income. What is the primary risk the smart contract CANNOT protect against?',
      options: [
        'Smart contract exploits draining the token contract',
        'The property manager misrepresenting rental income, tenants defaulting on leases, or the custodian holding the property incorrectly — none of which are visible or verifiable on-chain, making them impossible for the smart contract to prevent', // ✓
        'ETH gas price fluctuations reducing the USD value of yield distributions',
        'Token holder concentration making it possible for one holder to control governance decisions',
      ],
      correct: 1,
      hint: 'The smart contract can verify on-chain data. What is definitively off-chain in a real estate investment?',
      explanation: 'Smart contracts are perfect for: enforcing token transfer rules, distributing on-chain yield, recording ownership. Smart contracts are completely blind to: whether the property manager actually collected the rent, whether tenants paid, whether the building has been maintained, whether the "property" actually exists, whether the custodian actually holds the deed. All of these are off-chain facts that the smart contract must trust a human oracle to report honestly. This is why real estate RWA carries more risk than T-Bill RWA: T-Bills have automated coupon payments with minimal counterparty complexity; commercial real estate has multiple parties (tenant, property manager, custodian, oracle) each of whom could misrepresent. The yield premium over T-Bills compensates for this off-chain risk complexity.',
    },
    {
      question: 'You want to use USDY as collateral in a DeFi lending protocol to borrow USDC. What additional risk does this create vs using ETH as collateral?',
      options: [
        'No additional risk — USDY as collateral is safer than ETH because it is a stablecoin',
        'If Ondo Finance faces regulatory issues, USDY could lose its $1 peg or be frozen, triggering an undercollateralisation event. Unlike ETH (liquidated by selling on-chain), USDY redemption requires Ondo\'s approval — the protocol may not be able to liquidate USDY collateral quickly in an emergency', // ✓
        'USDY collateral creates higher smart contract risk because it involves two protocols instead of one',
        'The risk is identical to using USDC as collateral — both are dollar-pegged tokens',
      ],
      correct: 1,
      hint: 'What happens to your USDY collateral if Ondo is temporarily suspended? Can the lending protocol liquidate it immediately?',
      explanation: 'Collateral liquidation requires the ability to sell the collateral quickly. ETH: liquid on every major DEX, can be liquidated instantly on-chain. USDY: redemption requires submitting a request to Ondo Finance, which processes redemptions on US business days. In an emergency at 2am Saturday, the lending protocol holds USDY collateral that it literally cannot redeem until Monday morning. If USDC price changes significantly over the weekend, the protocol may become undercollateralised with no liquidation mechanism available. Some protocols mitigate this by maintaining secondary USDY liquidity pools (sell USDY for USDC on a DEX) but those pools have limited depth. Real-world asset settlement mechanics are the primary reason DeFi protocols price RWA collateral conservatively (lower LTV than comparable liquid assets).',
    },
    {
      question: 'Franklin Templeton\'s FOBXX tokenised money market fund was the first regulated tokenised fund (launched 2021). What distinguishes it as the "gold standard" compared to newer RWA protocols?',
      options: [
        'FOBXX uses more advanced smart contract technology than newer RWA protocols',
        'FOBXX is registered under the Investment Company Act (SEC-regulated), audited by a Big 4 firm, with a 3-year+ track record of accurate redemptions and regulatory compliance — a significantly higher trust threshold than newer protocols with less regulatory history', // ✓
        'FOBXX earns higher yield than comparable T-Bill protocols due to its superior fund management',
        'FOBXX was created before DeFi existed, meaning it has no smart contract risk at all',
      ],
      correct: 1,
      hint: 'What does 3 years of regulatory compliance and audited operations demonstrate that a new protocol cannot show?',
      explanation: 'Trust in financial products is built through demonstrated regulatory compliance over time. FOBXX: SEC-registered investment company (highest US investor protection standard), audited financial statements, 3+ years of accurate daily NAV reporting, successful redemptions in all market conditions, fund structure that survives Franklin Templeton as a company (the SEC registration creates investor protections independent of the issuer). Newer RWA protocols (including Ondo, launched 2023): high-quality teams, transparent operations — but 1-2 years of operations, fewer regulatory filings, and untested redemption processes in extreme market stress. The trust hierarchy: regulatory track record > reputation > audits > marketing. FOBXX\'s lower yield vs newer protocols is partly the market pricing its superior regulatory trust.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 128 — Web3 Identity: ENS, Lens Protocol, and Proof of Humanity
// ─────────────────────────────────────────────────────────────────────────────

const L128: IslandLevel = {
  id: 128, mechanic: 'match3', tier: 'pro',
  topic: 'Web3 Identity — ENS, Lens Protocol, and Proof of Humanity',

  explanation: `
In 2021, vitalik.eth sold at auction for 0.3 ETH. In 2023, the most valuable ENS names (single-character, three-character, and dictionary words) traded for hundreds of ETH. What started as a naming convenience had become a digital identity standard recognised across 500+ wallets, DeFi protocols, and NFT marketplaces.

Web3 identity is the set of tools that let you build a persistent, portable, user-controlled digital identity on a blockchain. The contrast with Web2: on Twitter, your followers are Twitter's data. On Facebook, your posts belong to Facebook. If the platform bans you, your identity disappears. Web3 identity puts that data in your wallet.

ENS (Ethereum Name Service) is the foundational layer — it converts wallet addresses (0x742d…) into readable names (alice.eth). An ENS name is an NFT on Ethereum, owned by your wallet, transferable. You set your primary ENS name and it appears in any app that reads ENS. Beyond naming, ENS records store: your avatar, Twitter handle, website, email, and cross-chain wallet addresses (Bitcoin, Solana, etc.).

Lens Protocol takes identity further: it stores your social graph on-chain. Your followers are stored in your Lens Profile NFT, not on Lens Company servers. Your posts are on-chain. If Lens the company shuts down, a different front-end can read your followers and posts from the blockchain — you never lose your audience. This portability is the core thesis.

Sybil resistance — proving you are a unique human and not a bot running multiple wallets — is the hardest identity problem. Proof of Humanity (video verification), Worldcoin (iris scan), and Gitcoin Passport (aggregate credential scoring) each attempt this from different angles. No perfect solution exists yet; each trades privacy for Sybil resistance.
  `.trim(),

  fact: 'Web3 identity layers: ENS (wallet → readable name, stores cross-chain addresses + metadata), Lens Protocol (on-chain social graph — followers and posts owned by the user, portable across front-ends), Proof of Humanity/Worldcoin/Gitcoin Passport (Sybil resistance — proving you are a unique human).',
  plain: 'ENS turns your wallet address into a readable name (alice.eth) that works across all crypto apps. Lens puts your social followers on-chain — if the app disappears, you keep your audience. Proof of Humanity tries to prove you\'re a real unique person, not a bot. All three put data back in your control instead of a company\'s.',
  stars: [480, 590, 730], target: 730, coins: 40,
  simulatorLesson: 'metamask',

  examples: [
    {
      contextTag: '[Crypto user, setting up ENS]',
      scenario: 'Marcus wants to set up an ENS name. He finds marcus.eth is taken but marcus2024.eth is available for $5/year. He wants to understand what to set up beyond just registration.',
      outcome: 'Step 1: Register marcus2024.eth on app.ens.domains — 1-year registration costs $5 + gas (~$5-15 on Ethereum). Step 2: Set as Primary ENS Name — this makes his wallet show as "marcus2024.eth" in MetaMask, Uniswap, OpenSea, and any ENS-integrated app. Step 3: Set Records — add his avatar (IPFS-hosted image), website, and a "contenthash" pointing to his personal site if he has one. Step 4: Add cross-chain addresses — add his Bitcoin address in the BTC record so anyone can pay him BTC by sending to marcus2024.eth. Total setup: 30 minutes. Result: a portable digital identity that follows him across every Web3 application forever.',
    },
    {
      contextTag: '[Social media creator, Lens Protocol migration]',
      scenario: 'Amara has 12,000 Twitter followers. She is worried about Twitter\'s future under new ownership and wants to migrate to a censorship-resistant social platform. She evaluates Lens Protocol.',
      outcome: 'Lens Protocol on Polygon: she creates a Lens Profile NFT — this is her on-chain social identity. Every post is an on-chain "publication" NFT. Every follow is a recorded interaction. Front-ends (Hey.xyz, Orb, others) read the same Lens data — if any front-end is shut down, she moves to another with all followers and posts intact. Limitation: she cannot "migrate" Twitter followers to Lens — those followers chose to follow a Twitter account, not a blockchain address. She builds a Lens audience separately. The value of Lens is forward-looking: once you have a Lens audience, you own it permanently. She should start posting on both simultaneously, treating Lens as the permanent archive of her content.',
    },
    {
      contextTag: '[Airdrop farmer, Gitcoin Passport evaluation]',
      scenario: 'Priya wants to qualify for airdrops that use Gitcoin Passport for Sybil resistance. She checks her current passport score and finds it is 8/20 required.',
      outcome: 'Gitcoin Passport is a composite score from multiple credentials: Google account (2 points), GitHub with 30+ days of activity (2 points), Twitter with 150+ followers (3 points), ENS name (2 points), on-chain voting history (1 point), BrightID verification (5 points), and others. To reach 20/20: Priya needs BrightID verification (video-call with a BrightID community member — highest trust, hardest to fake), ENS registration ($5 + gas), and LinkedIn verification. The composite approach is the key insight: one credential is easy to fake; 10 independent credentials each requiring real-world effort create a reliable Sybil signal. Gitcoin Passport does not store credentials on-chain — it stores ZK proofs that you control accounts without revealing which accounts.',
    },
  ],

  keyTakeaway: 'Web3 identity (ENS for naming, Lens for portable social graphs, Gitcoin Passport for Sybil resistance) shifts data ownership from platforms to users — but social portability only works if the audience also migrates, making adoption the primary barrier to Web3 identity\'s vision.',

  guidedPractice: [
    {
      question: 'What makes ENS names valuable beyond just replacing wallet addresses with readable text?',
      options: [
        'ENS names give their holders priority access to new token launches and airdrops',
        'ENS names are NFTs that store rich metadata (avatar, website, cross-chain addresses, social handles) and are recognised by 500+ applications — making them a universal digital identity layer that travels with the owner across the entire Web3 ecosystem', // ✓
        'ENS names are required to use most DeFi protocols and are checked for compliance purposes',
        'ENS names earn passive income from fees when other users look up the associated address',
      ],
      correct: 1,
      hint: 'What data does an ENS record store beyond the wallet address? Where does that data appear?',
      explanation: 'ENS is a universal identity namespace. The records attached to a .eth name include: ETH address (primary), BTC address, Solana address, avatar (displayed in Uniswap, OpenSea, any ENS-aware app), website (via contenthash — can point to a decentralised website on IPFS), email, Twitter, and custom text fields. When you set a primary ENS name, it appears everywhere — your Uniswap profile, your OpenSea page, your ENS-integrated wallet. This makes .eth names valuable as digital real estate: short, memorable names (3-character, dictionary words, famous terms) represent premium namespace with cross-application recognition. The "vitalik.eth sells for 0.3 ETH" story illustrates speculative namespace value for premium identifiers.',
    },
    {
      question: 'How does Lens Protocol preserve your social graph even if the Lens company shuts down?',
      options: [
        'Lens automatically backs up data to multiple cloud servers in different jurisdictions',
        'All Lens data (profiles, follows, posts) is stored as NFTs on Polygon — any front-end application can read the same blockchain data independently, so a new front-end can give you access to your full audience and content history without needing Lens the company\'s servers', // ✓
        'Lens requires users to download their social graph locally before the platform shuts down',
        'Lens data is mirrored to Ethereum mainnet which guarantees its permanent preservation',
      ],
      correct: 1,
      hint: 'If a Twitter replacement reads the same blockchain data as Twitter, what does the user keep?',
      explanation: 'The portability thesis: on centralised platforms, data lives on servers the company controls. The company goes bankrupt → servers go offline → your data disappears. On Lens: all social interactions are on-chain. Your profile is an NFT. Your followers are stored in the blockchain as recorded "follow" transactions. Your posts are on-chain publications. Any developer can build a front-end that reads Lens smart contracts — just like any browser can read Ethereum data. If Lens the company disappears but the contracts exist, someone builds a new front-end in 2 weeks that restores access to all Lens content. Contrast with Twitter: if Twitter disappeared, there is no alternative Twitter — the follower relationships live nowhere else.',
    },
    {
      question: 'Worldcoin uses iris scanning to prove uniqueness. What is the primary privacy concern with this approach?',
      options: [
        'Iris scanning is inaccurate and produces false positives that incorrectly link multiple people',
        'Biometric data (iris patterns) is permanently identifiable — if Worldcoin\'s database is hacked or iris data is cross-referenced with other biometric databases, the unique anonymity guarantee breaks, and the biometric cannot be "reset" like a password can', // ✓
        'Iris scanning only works for humans — it cannot verify corporate entities or AI agents',
        'The privacy concern is Worldcoin\'s terms of service, not the technical implementation',
      ],
      correct: 1,
      hint: 'If your password is leaked, you can change it. If your iris scan is leaked, what can you change?',
      explanation: 'Biometrics and privacy have a fundamental incompatibility: biometrics are permanent and unique identifiers that cannot be revoked if compromised. Password leaked? Change it. Private key compromised? Generate new wallet. Iris pattern leaked? You have one pair of eyes for life. Worldcoin\'s technical approach: they claim to delete the raw iris scan after generating a ZK proof (IrisCode), storing only the mathematical representation. But: the IrisCode is still biometrically derived — if the ZK system is ever broken or if a sufficiently large database of IrisCodes allows statistical de-anonymisation, the permanent identifier risk remains. Many privacy advocates consider trading permanent biometric data for Sybil resistance an unacceptable trade-off. ZK-based solutions like Gitcoin Passport (aggregating existing accounts without biometrics) attempt to solve Sybil resistance without creating permanent biometric risk.',
    },
    {
      question: 'A protocol decides to reward "genuine users" using Gitcoin Passport score as the qualification criterion. An attacker wants to fake a high Passport score. Which credentials are hardest to fake?',
      options: [
        'Email verification — the attacker needs a unique email address for each fake identity',
        'BrightID verification (live video call with a trusted community member who vouches for uniqueness) and in-person Proof of Humanity registration — these require real social interaction that cannot be automated or cheaply replicated at scale', // ✓
        'Twitter account with 150+ followers — buying followers is expensive and detectable',
        'GitHub account with 30+ days of commit history — creating fake commits requires sustained effort',
      ],
      correct: 1,
      hint: 'Which credentials require physical presence or live human interaction? Which can be automated?',
      explanation: 'Sybil resistance strength scales with the cost of faking each credential. Email: $0 and automated. GitHub commit history: can be scripted. Twitter followers: buyable for $5-50. ENS name: $5 registration. These are low-cost credentials — an attacker creating 1,000 Sybil wallets can achieve them for thousands of dollars. BrightID: requires a live video call with an existing BrightID community member who vouches that you are a unique person they have not previously vouched for. Creating 1,000 fake BrightID verifications requires 1,000 distinct social interactions — impractical to fake at scale. Proof of Humanity requires a deposit, a video recording of yourself holding a sign, and community validation. The composite score works because high-value credentials (BrightID, PoH) provide the core Sybil signal, while lower-value credentials supplement but don\'t substitute.',
    },
    {
      question: 'You own alice.eth. You want to receive Bitcoin payments at the same address. What ENS feature enables this?',
      options: [
        'ENS does not support non-Ethereum blockchains — a separate Bitcoin naming service is required',
        'ENS supports multi-coin address records — you can add a Bitcoin address to your alice.eth record, and any ENS-aware Bitcoin wallet can resolve "alice.eth" to your Bitcoin address', // ✓
        'Alice.eth can receive Bitcoin by converting ETH to BTC automatically using a built-in bridge',
        'You need to register alice.btc as a separate ENS name pointing to your Bitcoin address',
      ],
      correct: 1,
      hint: 'ENS is a naming protocol for addresses, not just Ethereum addresses. What other address types does ENS support?',
      explanation: 'ENS supports SLIP-44 multi-coin address records — a standardised way to store addresses for any blockchain in a single ENS record. Supported by default: Bitcoin (BTC), Litecoin, Dogecoin, Solana, and 1,000+ others. When you add a Bitcoin address to your alice.eth record, a Bitcoin wallet that implements ENS resolution (like Unstoppable Domains-compatible wallets) will look up alice.eth on Ethereum, find the BTC record, and return your Bitcoin address. Result: people can send you BTC by typing "alice.eth" instead of your 34-character Bitcoin address — the same name works across all supported chains. This cross-chain resolution is one of ENS\'s most underutilised features and is a strong argument for ENS as the universal Web3 identity namespace rather than chain-specific naming services.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L121–L128)
// ─────────────────────────────────────────────────────────────────────────────

export const ISLAND_ADVANCED_CRYPTO_LEVELS_A: Record<number, IslandLevel> = {
  121: L121,
  122: L122,
  123: L123,
  124: L124,
  125: L125,
  126: L126,
  127: L127,
  128: L128,
};
