// ⚡ Sifter SkillUp — Final Frontier (Island 16, Levels 196–210)
// Part A of 2 — Levels 196–203
//
// Chain: Ethereum / Multi-chain (islandId=16)
// Prerequisites: Coinbase Deep Dive (Island 15)
// Primary Simulators: defi, onchainAnalysis
//
// Covers: ZK proofs (SNARKs/STARKs/recursive), private computation,
//   RWA tokenisation, tokenised bonds, AI×crypto agents, DePIN,
//   account abstraction at scale, CBDCs

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 196 — ZK Proofs in Depth: SNARKs, STARKs, and Recursive Proofs
// ─────────────────────────────────────────────────────────────────────────────

const L196: IslandLevel = {
  id: 196, mechanic: 'match3', tier: 'pro',
  topic: 'ZK Proofs in Depth — SNARKs, STARKs, and Recursive Proofs',

  explanation: `
In 2022, Polygon zkEVM proved a batch of 1,000 Ethereum transactions in one cryptographic proof small enough to fit in a tweet — 288 bytes. Verifying that proof on Ethereum mainnet cost less than a single token transfer. This was not a magic trick. It was the result of decades of cryptographic research colliding with a practical need: how do you prove computation is correct without redoing all the work?

Zero-knowledge proofs come in two main families. SNARKs (Succinct Non-interactive ARguments of Knowledge) produce extremely compact proofs — typically a few hundred bytes — that verify in milliseconds. The catch: most SNARK variants require a trusted setup, a one-time ceremony where participants generate public parameters. If all participants in that ceremony collude, they could theoretically forge proofs. Groth16 (used by Zcash) is the most efficient SNARK. PLONK and Halo2 are newer variants with universal setups (one ceremony works for all circuits, not just one).

STARKs (Scalable Transparent ARguments of Knowledge) require no trusted setup at all — their security relies only on hash functions. The downside: STARK proofs are larger (tens of kilobytes vs hundreds of bytes for SNARKs) and take longer to verify on-chain. Starknet uses STARKs. The transparency makes them particularly suited to contexts where trust in setup participants cannot be assumed.

Recursive proofs change the game. A recursive proof proves that a proof is valid — allowing many proofs to be compressed into one. Polygon's Plonky2 recursively aggregates thousands of transaction proofs into a single proof. Ethereum could eventually verify the entire state of all L2s in one recursive STARK submitted once per day.

zkEVM types (by Ethereum compatibility): Type 1 (Taiko — fully identical to Ethereum, slowest to prove), Type 2 (Scroll — EVM-equivalent, matches bytecode), Type 3 (Polygon zkEVM — most opcodes match), Type 4 (ZkSync Era — compiles Solidity to a different VM, fastest proving).
  `.trim(),

  fact: 'SNARKs: tiny proofs, fast verify, require trusted setup (Groth16, PLONK, Halo2). STARKs: larger proofs, no trusted setup, hash-function security (used by Starknet). Recursive proofs compress many proofs into one — enabling a single daily proof covering all L2 state.',
  plain: 'ZK proofs let you prove something is true without revealing how. SNARKs are tiny but need a setup ceremony. STARKs are larger but need no ceremony. Recursive proofs stack many proofs into one — like a zip file for cryptographic truth.',
  stars: [500, 615, 770], target: 770, coins: 44,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Developer, choosing a ZK proof system]',
      scenario: 'Marcus is building a ZK rollup. He must choose between Groth16 SNARKs, PLONK, and STARKs. He evaluates each based on proof size, verification cost, and trust assumptions.',
      outcome: 'Groth16: 288-byte proof, cheapest on-chain verification (~200k gas), but requires a circuit-specific trusted setup ceremony. If his circuit changes, a new ceremony is needed. PLONK: universal setup (one ceremony for all circuits), slightly larger proofs, more flexible. STARKs: no trusted setup, largest proofs (~100KB), most expensive to verify on Ethereum (~5M gas). Since his L2 will evolve rapidly (new circuits as features are added), he chooses PLONK — universal setup avoids repeated ceremonies while keeping proofs manageable.',
    },
    {
      contextTag: '[Understanding recursive proofs]',
      scenario: 'Priya explains to a non-technical friend why Polygon can batch 10,000 transactions into one small proof on Ethereum mainnet.',
      outcome: 'Step 1: Each transaction generates a proof that it is valid. Step 2: A recursive prover takes those 10,000 proofs and generates a "proof that 10,000 proofs are all valid." Step 3: That single recursive proof is posted to Ethereum — verification takes ~200k gas regardless of whether there are 10 or 10,000 underlying transactions. The cost is amortised across all transactions: 10,000 transactions sharing 200k gas = 20 gas per transaction. This is why ZK rollups achieve sub-cent fees while inheriting Ethereum\'s security.',
    },
    {
      contextTag: '[zkEVM type comparison]',
      scenario: 'Keiko is deploying an existing Ethereum DeFi contract to a zkEVM chain. She evaluates compatibility and speed trade-offs.',
      outcome: 'Type 1 (Taiko): deploys identically — zero code changes. Proving time: 10 minutes per block. Best for: existing Ethereum contracts that must run unmodified. Type 2 (Scroll): EVM bytecode compatible — no code changes. Proving time: 3 minutes. Best for: production deployment needing speed. Type 4 (ZkSync Era): Solidity compiles to ZkSync\'s zkVM — some edge cases differ. Proving time: 30 seconds. Best for: high-throughput applications willing to handle edge cases. She chooses Scroll: zero code changes required, 3-minute proving is acceptable, battle-tested EVM equivalence.',
    },
  ],

  keyTakeaway: 'SNARKs are compact but need trusted setup; STARKs are transparent but larger. Recursive proofs aggregate thousands of proofs into one — this is the mechanism enabling ZK rollups to post a single daily proof to Ethereum covering millions of transactions at sub-cent cost per user.',

  guidedPractice: [
    {
      question: 'What is the main security trade-off between SNARKs and STARKs?',
      options: [
        'SNARKs are more secure than STARKs because they use more complex mathematics',
        'SNARKs require a trusted setup ceremony (if all participants collude, proofs could be forged). STARKs require no trusted setup — their security relies only on hash functions',
        'STARKs require a trusted setup; SNARKs do not',
        'Both require identical trusted setups — the difference is only proof size',
      ],
      correct: 1,
      hint: 'What does "transparent" in STARK stand for? What transparency does it provide?',
      explanation: 'SNARK security depends on toxic waste from a trusted setup ceremony — if all participants collude to preserve their secrets, they could generate false proofs. The Zcash ceremony involved 88 participants, requiring all 88 to collude to compromise security. STARKs use hash functions (SHA-256 class) as their only cryptographic assumption — no ceremony required. The trade-off: STARK proofs are orders of magnitude larger than SNARK proofs, making on-chain verification more expensive.',
    },
    {
      question: 'What does "recursive" mean in recursive ZK proofs?',
      options: [
        'The proof verifies itself without any external verification',
        'A proof is generated that proves many other proofs are all valid — compressing thousands of individual transaction proofs into one final proof that Ethereum verifies',
        'The proof is generated repeatedly until it reaches minimum size',
        'Recursive proofs are only used in STARKs, not SNARKs',
      ],
      correct: 1,
      hint: 'If you had 10,000 proofs and wanted to verify them all in one Ethereum transaction, what would a recursive proof do?',
      explanation: 'Recursive proof composition: a ZK prover can prove "I have 10,000 valid proofs." The resulting meta-proof is verified by Ethereum in a single transaction. Gas cost for verification is fixed regardless of how many proofs are aggregated — so each underlying transaction pays a microscopic fraction of the total verification cost. Polygon\'s Plonky2, Starknet\'s SHARP prover, and Scroll all use recursive proof aggregation as a core scaling mechanism.',
    },
    {
      question: 'A developer needs a zkEVM that runs existing Ethereum Solidity contracts with zero code changes. Which type should they choose?',
      options: [
        'Type 4 — fastest proving time',
        'Type 1 or Type 2 — highest Ethereum compatibility, running unmodified EVM bytecode at the cost of slower proving time',
        'Type 3 — balance of compatibility and speed',
        'Any type — all zkEVMs run unmodified Solidity without changes',
      ],
      correct: 1,
      hint: 'Which zkEVM type prioritises full EVM equivalence at the bytecode level?',
      explanation: 'Type 1 (full Ethereum equivalence — identical at consensus level) and Type 2 (EVM-equivalent — identical bytecode execution) both run unmodified Ethereum smart contract bytecode. Type 4 (language-compatible) compiles Solidity to a different virtual machine — which introduces edge case differences and may break contracts that rely on specific EVM behaviours (gas costs, specific opcodes). For zero-change deployment of production Ethereum contracts, Type 1 or 2 is mandatory, accepting slower proving times as the cost.',
    },
    {
      question: 'Why does PLONK\'s universal setup make it more practical than Groth16 for evolving protocols?',
      options: [
        'PLONK produces smaller proofs than Groth16',
        'Groth16 requires a new trusted setup ceremony for every new circuit (new feature = new ceremony). PLONK\'s universal setup works for all circuits — update the protocol without a new ceremony',
        'PLONK is open-source while Groth16 is proprietary',
        'PLONK verification is free on Ethereum mainnet',
      ],
      correct: 1,
      hint: 'What happens to Groth16 security if you change the circuit?',
      explanation: 'Groth16\'s trusted setup parameters are specific to a single circuit. If you change the circuit (add a new opcode, modify fee logic, add a feature), the old parameters are invalidated and a new ceremony must be organised — potentially requiring hundreds of participants and months of coordination. PLONK\'s universal setup generates a single set of parameters that can be reused for any circuit of up to a specified size. Evolving L2 protocols that constantly add features choose PLONK or Halo2 (a derivative) to avoid the ceremony bottleneck.',
    },
    {
      question: 'Starknet uses STARKs rather than SNARKs. What practical advantage does this provide?',
      options: [
        'STARK proofs are cheaper to verify on Ethereum than SNARK proofs',
        'No trusted setup ceremony is required — Starknet\'s security relies only on collision-resistant hash functions, which are based on standard, well-understood cryptography with no ceremony risk',
        'STARKs produce smaller proofs that settle faster',
        'STARKs allow Starknet to avoid posting any data to Ethereum',
      ],
      correct: 1,
      hint: 'What is the defining security assumption of STARKs?',
      explanation: 'STARKs rely only on hash functions (specifically collision-resistant hash functions from the SHA family) for their security. These are the same functions securing Bitcoin\'s proof of work and HTTPS — deeply studied, no ceremony required. For Starknet, this means: anyone can verify the system\'s security assumptions without trusting that a setup ceremony was run correctly. The trade-off is proof size (STARKs can be 100KB+ vs SNARKs at 200-300 bytes) — but recursive aggregation makes this manageable at the L2 level.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 197 — Private Computation: What ZK Enables Beyond Scaling
// ─────────────────────────────────────────────────────────────────────────────

const L197: IslandLevel = {
  id: 197, mechanic: 'memory', tier: 'pro',
  topic: 'Private Computation — What ZK Enables Beyond Scaling',

  explanation: `
In 2023, a hospital in Zurich verified a patient\'s HIV status for a clinical trial without ever seeing the actual test result. A ZK proof on-chain confirmed: "this patient satisfies the inclusion criterion" — the criterion was checked, the sensitive data never left the patient\'s device. This is not science fiction. It is the second major application of zero-knowledge proofs, one that has nothing to do with blockchain scaling.

ZK proofs allow you to prove a statement is true without revealing the underlying data. "I am over 18" can be proven without revealing your birthdate. "My bank balance exceeds $10,000" can be proven without revealing the exact balance. "I am not on a sanctions list" can be proven without revealing your identity to the verifier.

Aztec Network is the most mature private computation platform on Ethereum. It enables private ERC-20 tokens — token balances that are visible only to the holder, while the ZK proof guarantees the balance is correct and no double-spending occurs. A private Aztec USDC transfer is computationally identical to a public Ethereum transfer, but the amounts and participants are shielded.

Sealed-bid auctions on-chain become possible: each bidder submits a ZK proof that their bid is within a valid range, without revealing the bid amount until the auction closes and the winning proof is revealed. This prevents front-running and collusion — both impossible when bids are public.

The performance cost is real: generating a ZK proof for a complex computation takes 10–1,000× longer than the computation itself. A private DeFi swap on Aztec takes ~2 seconds to generate the proof on a modern laptop. Private ML inference (proving a neural network computed a result correctly without revealing model weights) currently takes minutes. Hardware acceleration — ZK-specific ASICs — is the critical bottleneck being actively solved.
  `.trim(),

  fact: 'ZK proofs enable private computation: prove a statement is true without revealing the underlying data. Applications: private token balances (Aztec), sealed-bid auctions, credential verification, private ML. Performance cost: proof generation is 10–1,000× slower than the underlying computation.',
  plain: 'ZK proofs prove something is true without showing the private details. Private DeFi, secret auction bids, credential checks that don\'t reveal your data — all possible. The catch: generating the proof is slow. Better hardware is being built to fix this.',
  stars: [560, 690, 860], target: 860, coins: 48,
  simulatorLesson: 'zkSnarksVsStarks',

  examples: [
    {
      contextTag: '[Private DeFi with Aztec]',
      scenario: 'James holds $50,000 in USDC and wants to participate in DeFi without revealing his balance to the entire public blockchain. He evaluates Aztec Network.',
      outcome: 'On Aztec: he deposits USDC into the Aztec contract. His balance becomes a private ZK state — only he can see it. When he transacts, he generates a ZK proof on his device that proves: "I have sufficient balance, I am sending exactly X to Y, I am not double-spending." The proof is verified on-chain without revealing the amount or counterparty. His $50,000 position is invisible to blockchain analytics — Arkham Intelligence and Chainalysis see only that funds entered the Aztec contract, not what happened inside.',
    },
    {
      contextTag: '[Credential verification]',
      scenario: 'Priya wants to access a DeFi protocol that requires KYC compliance (confirmed identity) without sharing her passport with a blockchain protocol.',
      outcome: 'She registers with a licensed identity provider (e.g., Fractal ID). The provider verifies her identity and issues a ZK credential: a cryptographic proof that "this wallet belongs to a KYC-verified person who is not on sanctions lists." The DeFi protocol verifies the ZK credential on-chain — confirming compliance without ever receiving her name, address, or passport details. The identity provider issues the proof; they do not reveal the underlying data to the protocol. This is the privacy-preserving KYC model for compliant DeFi.',
    },
    {
      contextTag: '[Sealed-bid auction]',
      scenario: 'Marcus is building an on-chain art auction where bids must remain secret until the auction ends — preventing other bidders from outbidding by a minimal amount after seeing everyone else\'s bids.',
      outcome: 'Design: each bidder submits a ZK proof that their bid is above the reserve price and within a valid format, without revealing the bid amount. All bids are cryptographically committed (hashed) on-chain. At auction end, the auctioneer reveals each bid alongside its ZK proof of validity. The smart contract verifies all proofs, selects the highest valid bid, and processes payment. No bidder could have seen anyone else\'s bid during the auction. Front-running is impossible because bids are not visible in the mempool or on-chain.',
    },
  ],

  keyTakeaway: 'ZK proofs enable private computation — proving statements true without revealing underlying data. Aztec makes DeFi private. Credential systems can prove compliance without revealing identity. The performance bottleneck (slow proof generation) is being solved by specialised ZK hardware.',

  guidedPractice: [
    {
      question: 'What is the core property that makes ZK proofs useful for privacy applications?',
      options: [
        'ZK proofs encrypt data so it is unreadable by anyone except the prover',
        'A ZK proof proves a statement is true without revealing the underlying data that makes it true — allowing verification without disclosure',
        'ZK proofs anonymise all on-chain transactions automatically',
        'ZK proofs store data off-chain where blockchain explorers cannot access it',
      ],
      correct: 1,
      hint: 'What does "zero-knowledge" mean in the context of what the verifier learns?',
      explanation: 'The defining property of zero-knowledge: the verifier learns only whether the statement is true or false — nothing else. "I am over 18" proves true or false. The verifier learns only that the prover satisfies the condition — not their birthdate, not how much over 18. This is categorically different from encryption (which hides data) or hashing (which is one-way). ZK proofs allow a claim to be verified while the verifying party learns nothing more than the answer.',
    },
    {
      question: 'How does Aztec Network achieve private token balances on Ethereum?',
      options: [
        'Aztec stores balances on a private database off-chain',
        'Users\' balances are stored as ZK-proved private state — each transaction generates a proof of validity without revealing amounts or participants, verified on Ethereum\'s public chain',
        'Aztec uses a separate Ethereum chain with restricted validator access',
        'Balances are encrypted using the user\'s Ethereum private key and unreadable by others',
      ],
      correct: 1,
      hint: 'Aztec posts transactions to Ethereum — so how does privacy work if the chain is public?',
      explanation: 'Aztec uses UTXO-style private notes. Your balance is a set of cryptographic commitments (hashes) in the Aztec contract — visible on Ethereum but revealing nothing. When you spend, you generate a ZK proof: "I own a note worth X, I am spending Y, the change is X-Y, no double-spend." The proof is verified on Ethereum without revealing X, Y, or your identity. Only you (with your viewing key) can decrypt your own notes. Blockchain analytics tools see activity in the Aztec contract — not the amounts or participants inside.',
    },
    {
      question: 'Why is proof generation the main performance bottleneck for ZK applications?',
      options: [
        'ZK proof generation requires a live internet connection to a centralised server',
        'Generating a ZK proof requires intensive computation — typically 10–1,000× more work than executing the underlying computation itself, creating latency and cost for user-facing applications',
        'Proof generation is slow only for SNARKs; STARK proofs generate instantly',
        'The bottleneck is Ethereum verification speed, not proof generation',
      ],
      correct: 1,
      hint: 'What does it computationally mean to "prove" that a computation was done correctly without redoing it?',
      explanation: 'Proving a computation requires constructing a cryptographic witness — a structure that lets any verifier confirm the computation was correct without re-executing it. This witness construction involves intensive polynomial arithmetic, elliptic curve operations, or hash-chain construction (depending on SNARK vs STARK). A simple token transfer might take 0.1ms to execute but 2 seconds to prove. Complex computation like ML inference can take minutes. ZK-specific hardware accelerators (GPUs, FPGAs, eventually ASICs) are being developed to reduce this by 100–1,000× — making real-time ZK applications practical.',
    },
    {
      question: 'A sealed-bid auction uses ZK proofs. What specific attack does this prevent?',
      options: [
        'It prevents the auctioneer from setting a reserve price',
        'It prevents last-second sniping — bidders cannot see others\' bids and outbid by a minimal margin, because bids are cryptographically committed without revealing amounts until the auction closes',
        'It prevents the winning bidder from backing out of the transaction',
        'ZK proofs guarantee the auctioned item is authentic',
      ],
      correct: 1,
      hint: 'In a public on-chain auction, what can a sophisticated bidder do if they can read all other bids?',
      explanation: 'Public on-chain bids allow "sniping": a bidder watches all bids in the mempool, places a bid $1 above the current highest, and wins by minimal margin. In a sealed-bid ZK auction: all bids are cryptographic commitments (hash of the bid) posted before the reveal phase. The ZK proof proves the commitment is a valid, properly formatted bid — without revealing the amount. During the reveal phase, commitments are opened and proofs are verified. No bidder can see any other bid until all are revealed simultaneously, eliminating sniping entirely.',
    },
    {
      question: 'A KYC-verified user proves compliance to a DeFi protocol using a ZK credential. What does the DeFi protocol learn?',
      options: [
        'The user\'s full legal name, address, and identity provider',
        'Only that the user\'s wallet is associated with a valid KYC credential from a trusted issuer — no personal data is revealed to the protocol',
        'The user\'s KYC score and identity hash',
        'All KYC credentials are stored on-chain, so the protocol can always access them',
      ],
      correct: 1,
      hint: 'What is the minimum information needed to verify compliance? What information is NOT needed?',
      explanation: 'The DeFi protocol needs to know: "is this wallet controlled by a KYC-verified person not on sanctions lists?" The answer is boolean: yes or no. The ZK proof provides exactly this — without revealing name, address, nationality, document numbers, or the identity provider\'s internal data about the user. The protocol verifies the proof cryptographically and proceeds. This is a practical implementation of data minimisation: providing only the information necessary for the specific decision, no more.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 198 — RWA Tokenisation: The $16T Opportunity
// ─────────────────────────────────────────────────────────────────────────────

const L198: IslandLevel = {
  id: 198, mechanic: 'chain', tier: 'pro',
  topic: 'RWA Tokenisation — The $16T Opportunity',

  explanation: `
In January 2024, BlackRock — the world\'s largest asset manager with $10 trillion under management — launched BUIDL on Ethereum: a tokenised money market fund holding US Treasury bills. Within six weeks, it accumulated $500 million. When the world\'s largest asset manager moves onto a public blockchain, the decade-long question "will institutions ever use crypto?" has been answered.

Real-world asset (RWA) tokenisation converts ownership rights to physical or financial assets into blockchain tokens. The asset classes span an enormous range: government bonds (the current dominant use case), corporate debt, real estate, commodities (gold, oil), private equity, trade finance invoices, carbon credits, and infrastructure.

The tokenisation value proposition is specific: it enables 24/7 settlement (traditional bonds settle T+2 business days), fractionalisation (a $1 million Treasury can be split into 1,000 tokens of $1,000 each), programmability (automatic coupon payments, collateral posting, instant rehypothecation), and global accessibility (anyone with a blockchain wallet can hold tokenised Treasuries, not just US brokerage account holders).

Current protocols by category: Ondo Finance (USDY, tokenised money market funds — 4.5% yield, widely integrated in DeFi as collateral), Centrifuge (trade finance, auto loans, mortgages — private credit on-chain), Maple Finance (institutional undercollateralised loans), Franklin Templeton (FOBXX on Polygon — the first registered US mutual fund as a blockchain token), BlackRock BUIDL (Ethereum, institutional).

The critical trust architecture: every tokenised asset requires an off-chain custodian — a legal entity holding the actual bond, property, or gold. The blockchain token is only as secure and redeemable as the custodian\'s legal standing and operational health. The smart contract enforces rules; the custodian holds reality.
  `.trim(),

  fact: 'RWA tokenisation converts real-world asset ownership to blockchain tokens. Key protocols: Ondo (tokenised Treasuries), Centrifuge (private credit), BlackRock BUIDL, Franklin Templeton FOBXX. Every tokenised RWA depends on an off-chain custodian — the token\'s value is only as good as the custodian\'s reliability.',
  plain: 'Tokenised real-world assets are traditional financial assets (bonds, real estate, loans) represented as blockchain tokens. Ondo offers tokenised US Treasury yield. BlackRock put a money market fund on Ethereum. The key risk: someone still has to hold the real asset off-chain.',
  stars: [620, 763, 954], target: 954, coins: 52,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[DeFi protocol integrating tokenised Treasuries]',
      scenario: 'A DeFi protocol wants to earn yield on its $10M idle USDC treasury without converting to volatile crypto assets. They evaluate Ondo USDY.',
      outcome: 'Ondo USDY: yield-bearing token backed by US short-term Treasuries and bank deposits. Current yield: 4.7% APY. The protocol purchases $10M USDY, which increases in value daily as yield accrues (rebasing token). The $10M remains liquid — USDY can be used as DeFi collateral (Morpho, Aave), instantly converted back to USDC via Ondo\'s redemption. Risk: Ondo\'s custodian (Nassau-based bank) must remain solvent, and USDY is restricted to non-US users. The protocol earns $470,000 annually on otherwise idle funds while maintaining liquidity.',
    },
    {
      contextTag: '[Centrifuge private credit]',
      scenario: 'Marcus wants 8% yield on $50,000 by investing in tokenised real-world loans — not crypto speculation, but actual business loans.',
      outcome: 'Centrifuge Tinlake pools: companies (solar energy installers, auto dealers, freight forwarding firms) tokenise their loan receivables. Investors supply DAI/USDC and receive pool tokens representing their share. DROP (senior) tokens: first to be repaid, lower yield (5–6%). TIN (junior) tokens: absorb losses first, higher yield (8–10%). Marcus buys $50,000 of DROP tokens in a solar energy pool. Monthly interest from underlying solar loans flows to his wallet. Lockup: 90-day redemption notice required. Risk: underlying loans can default; Centrifuge\'s legal framework enforces recovery through traditional courts.',
    },
    {
      contextTag: '[Institutional comparison: BUIDL vs direct T-Bills]',
      scenario: 'Keiko\'s family office evaluates BlackRock BUIDL vs buying US Treasury bills directly for $2M. She compares operational efficiency.',
      outcome: 'Direct T-Bills: purchase through broker (T+2 settlement), manual coupon tracking, no weekend liquidity. BUIDL on Ethereum: tokenised money market fund, yield accrues daily as token balance increases, 24/7 on-chain transferability, instant rehypothecation as DeFi collateral, ERC-20 compatibility with DeFi infrastructure. BUIDL minimum: $5M (institutional). Yield equivalent to money market rates (~5.2% in 2024). The operational efficiency — real-time yield accrual, programmable collateral — is the value add over direct T-Bills at institutional scale.',
    },
  ],

  keyTakeaway: 'RWA tokenisation brings Treasuries, real estate, and private credit onto blockchains — enabling 24/7 settlement, fractionalisation, and DeFi integration. Every tokenised RWA depends on an off-chain custodian; the token\'s value and redeemability are functions of that custodian\'s legal and operational health.',

  guidedPractice: [
    {
      question: 'What does "tokenisation" of a real-world asset actually mean?',
      options: [
        'The physical asset is destroyed and replaced by a blockchain token',
        'Ownership rights to the asset are represented as a blockchain token — the underlying asset remains in off-chain custody while the token enables on-chain transfer and programmability',
        'The asset\'s value is calculated and stored on-chain permanently',
        'Tokenisation is only possible for financial assets, not physical ones like real estate',
      ],
      correct: 1,
      hint: 'If the asset is tokenised but real, where is the actual asset?',
      explanation: 'Tokenisation does not move the physical or financial asset onto the blockchain — it moves a representation of ownership rights. A tokenised US Treasury: the bond is held in a special purpose vehicle (SPV) or custodial account. The token represents a legal claim on the SPV\'s assets. If the token is redeemed, the SPV sells or distributes the underlying bond. The blockchain provides a transferable, programmable record of who owns the claim — not the asset itself.',
    },
    {
      question: 'Why did BlackRock\'s BUIDL launch on Ethereum signal a major shift for crypto adoption?',
      options: [
        'BlackRock launched BUIDL to speculate on ETH price appreciation',
        'The world\'s largest asset manager using a public blockchain for a registered investment fund validates blockchain infrastructure for institutional-grade financial products at global scale',
        'BUIDL was BlackRock\'s first digital product of any kind',
        'BUIDL uses a private Ethereum fork, not the public chain',
      ],
      correct: 1,
      hint: 'What question about institutional crypto adoption does BlackRock\'s choice answer?',
      explanation: 'BUIDL is a registered money market fund — a mainstream financial product holding US Treasuries — deployed on public Ethereum. BlackRock manages $10T and operates under the strictest regulatory scrutiny. Their decision to use Ethereum mainnet (not a private chain, not a proprietary ledger) demonstrates that public blockchain infrastructure meets institutional regulatory, operational, and security standards. This is the most credible possible signal that the technology is production-ready for traditional finance.',
    },
    {
      question: 'What specific advantage does a tokenised Treasury offer over holding T-Bills directly?',
      options: [
        'Tokenised Treasuries yield more than direct T-Bills due to crypto premium',
        '24/7 transferability, real-time yield accrual, programmability as DeFi collateral, and fractionalisation — operational efficiencies not available with traditional T+2 settlement securities',
        'Tokenised Treasuries are guaranteed by Ethereum\'s security, not just the US government',
        'Only tokenised Treasuries are accessible to international investors',
      ],
      correct: 1,
      hint: 'What are the operational friction points of holding traditional T-Bills?',
      explanation: 'Traditional T-Bills settle T+2 (2 business days), pay coupons semi-annually with manual tracking, cannot be used as collateral in DeFi without a broker, cannot be transferred on weekends, and require a brokerage account in a supported jurisdiction. Tokenised Treasuries: settle instantly 24/7, accrue yield in real-time (rebasing or yield-generating tokens), can be posted as collateral in Aave, Morpho, or Maker directly, are transferable globally to any wallet with the appropriate whitelist status. The yield is equivalent — the operational improvement is the value proposition.',
    },
    {
      question: 'What is the primary risk when investing in any tokenised real-world asset?',
      options: [
        'Smart contract risk — tokenised RWAs are uniquely vulnerable to code exploits',
        'Custodian risk — the token\'s value and redeemability depend entirely on the off-chain entity holding the actual asset remaining solvent and legally operational',
        'Liquidity risk — tokenised RWAs have no secondary market',
        'Price risk — tokenised RWAs fluctuate more than the underlying assets',
      ],
      correct: 1,
      hint: 'Who actually holds the bond or real estate? What happens to your token if they face problems?',
      explanation: 'Every tokenised RWA has an off-chain custodian — a legal entity that holds the actual asset. If that custodian becomes insolvent, is seized by regulators, has operational failures, or faces legal challenges, the token\'s redeemability is at risk. The blockchain token enforces programmatic rules, but it cannot force an insolvent custodian to return assets. This is custodian counterparty risk — the same risk you have with any bank or brokerage, but it is easy to underestimate when the token appears to be "on-chain" and therefore "decentralised."',
    },
    {
      question: 'Ondo\'s USDY token is described as "yield-bearing." What does this mean mechanically?',
      options: [
        'USDY holders receive USDC distributions weekly that they must manually reinvest',
        'The USDY token\'s balance in your wallet increases daily as underlying Treasury yield accrues — each token is worth more each day, reflecting accumulated interest without requiring reinvestment',
        'Yield is paid in Ondo\'s governance token (ONDO) rather than dollars',
        'USDY yields are paid at fixed quarterly intervals like a traditional bond coupon',
      ],
      correct: 1,
      hint: 'If a rebasing token\'s balance increases in your wallet, where does the increase come from?',
      explanation: 'USDY uses a rebasing mechanism: the token supply expands daily to distribute accumulated Treasury yield. If you hold 1,000 USDY today and Treasuries yield 4.7% annually (≈0.013% daily), tomorrow you hold 1,001.3 USDY, each still worth $1. Your total value increases without any action required. This is the DeFi-native way to represent a yield-bearing instrument — each token maintains its $1 peg while total supply grows, distributing yield automatically across all holders without requiring them to claim or reinvest.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 199 — RWA: How Tokenised Bonds Work
// ─────────────────────────────────────────────────────────────────────────────

const L199: IslandLevel = {
  id: 199, mechanic: 'match3', tier: 'pro',
  topic: 'RWA — How Tokenised Bonds Work',

  explanation: `
In 2023, the city of Lugano, Switzerland issued a CHF 100 million bond directly on a public blockchain — the first Swiss city to do so. Bond buyers received digital tokens representing their ownership. Coupon payments (interest) flowed automatically to token holders via smart contract every six months. Secondary trading happened on-chain, with settlement in minutes rather than the T+2 days of traditional bond markets. The bond was audited, legally documented, and fully redeemable at maturity.

The mechanics of a tokenised bond follow a precise structure. Step 1: an issuer (government, corporation, or SPV) establishes a legal vehicle — a Special Purpose Vehicle (SPV) — that holds the underlying bond or receivables. Step 2: the SPV issues ERC-20 tokens representing proportional ownership in the SPV. Step 3: investors buy tokens with stablecoin or fiat. The token price equals the bond\'s current market value divided by the number of tokens outstanding.

Yield flows through a defined path: bond coupon payment → received by SPV → distributed to token holders via smart contract → delivered to each holder\'s wallet automatically. This eliminates the manual coupon tracking and reinvestment steps in traditional bond portfolios.

Redemption at maturity: the bond matures, the SPV receives principal repayment, the smart contract burns tokens and distributes principal to holders. This process is trustless from the smart contract\'s perspective — but entirely dependent on the SPV successfully recovering the principal from the bond issuer.

The legal risk layer: if the issuer defaults, the SPV holds a defaulted bond. Token holders\' recourse is through the SPV\'s legal structure — which determines how recovery proceeds in bankruptcy. This is bond default risk packaged in a token — the blockchain does not eliminate it.
  `.trim(),

  fact: 'Tokenised bonds use an SPV (Special Purpose Vehicle) holding the bond, issuing ERC-20 tokens as proportional ownership. Coupon flows: bond issuer → SPV → smart contract → token holders automatically. Redemption: bond matures → SPV receives principal → smart contract burns tokens and pays holders.',
  plain: 'A tokenised bond is a traditional bond wrapped in an SPV that issues blockchain tokens. You buy tokens, receive automatic interest payments, and get your principal back at maturity when the bond matures. Default risk is the same as any bond — the blockchain packaging does not remove it.',
  stars: [680, 836, 1045], target: 1045, coins: 56,
  simulatorLesson: 'rwaEvaluator',

  examples: [
    {
      contextTag: '[Walking through the full structure]',
      scenario: 'Amara is considering buying Ondo OUSG (tokenised US Treasuries). She asks: what does she actually own and what are all the steps in the legal and technical chain?',
      outcome: 'Legal chain: US Treasury bills → held by Ondo Finance Ltd (Cayman Islands) in accounts at a licensed prime broker → OUSG token issued on Ethereum by Ondo\'s smart contract → Amara\'s wallet holds OUSG. Economic chain: Treasury coupon → Ondo Finance → rebasing increases OUSG token balance → Amara\'s token count increases daily. Redemption: Amara submits redemption request → Ondo sells Treasury position → USDC transferred to Amara\'s wallet within 1 business day. Risk chain: US Treasury default (near-zero), Ondo Finance insolvency (low, but possible), smart contract exploit (audited, non-zero), regulatory change restricting her access (non-zero in her jurisdiction).',
    },
    {
      contextTag: '[Coupon mechanics]',
      scenario: 'Marcus holds 10,000 tokens in a Franklin Templeton tokenised bond fund (FOBXX) paying 5.2% annual yield. He asks: how exactly does the coupon reach his wallet?',
      outcome: 'Franklin Templeton\'s money market portfolio earns interest daily from its underlying securities. Each day, the fund\'s NAV (net asset value) per token increases by 5.2%/365 = 0.014%. The smart contract on Polygon records updated token values — his 10,000 tokens are each worth $1.000143 on day 1, $1.000285 on day 2, etc. After one year: 10,000 tokens × $1.052 = $10,520. No manual coupon claim required. The interest accumulates in the token\'s value automatically. When he redeems, he receives $10,520 for his 10,000 tokens.',
    },
    {
      contextTag: '[Default risk analysis]',
      scenario: 'Keiko compares two tokenised bond products: OUSG (US Treasuries, SPV in Cayman) and a Centrifuge pool (European SME loans, SPV in Netherlands). She evaluates default risk on each.',
      outcome: 'OUSG default risk: US Treasury default (virtually zero — US government can print dollars), Ondo Finance operational failure (low, regulated Cayman SPV). Total default risk: very low, largely equivalent to holding T-Bills directly. Centrifuge SME pool: underlying SME loan default rate historically 3–8% in European markets. Pool structure: senior tranche absorbs losses last (protected unless defaults exceed junior buffer). If 5% of loans default: junior tranche loses value, senior tranche protected. Risk: fundamentally different from Treasuries — credit risk of small European businesses. Higher yield (7%) reflects this higher default probability.',
    },
  ],

  keyTakeaway: 'Tokenised bonds follow a legal chain (bond → SPV → ERC-20 token) with automatic coupon flows through smart contracts. The blockchain improves operational efficiency but does not change the underlying credit risk — a tokenised corporate bond defaults the same way a paper corporate bond does when the issuer cannot pay.',

  guidedPractice: [
    {
      question: 'What is the role of an SPV in a tokenised bond structure?',
      options: [
        'The SPV writes the smart contract that issues the tokens',
        'The SPV is the legal entity that holds the actual bond, issues tokens representing proportional ownership, receives coupon payments, and distributes proceeds to token holders — it is the bridge between the real-world asset and the blockchain token',
        'The SPV guarantees the token price will not fall below par value',
        'SPVs are optional — some tokenised bonds hold assets directly in smart contracts',
      ],
      correct: 1,
      hint: 'Who legally owns the bond? Who holds it? What is the legal structure connecting bond ownership to token ownership?',
      explanation: 'The SPV (Special Purpose Vehicle) is a bankruptcy-remote legal entity created solely to hold the underlying asset and issue tokens. It is bankruptcy-remote, meaning if the token issuer\'s parent company goes bankrupt, the SPV\'s assets (the bonds) are protected. The SPV holds the bonds, receives coupon payments from the bond issuer, passes them through the smart contract to token holders, and at maturity receives the principal repayment and distributes it to token holders (burning the tokens). It is the legal engine of the entire structure.',
    },
    {
      question: 'A tokenised bond pays 5% annual coupon. How does the coupon reach token holders?',
      options: [
        'Token holders must manually claim coupons through the issuer\'s website quarterly',
        'The bond issuer pays coupon to the SPV, which distributes to token holders via smart contract — either by increasing each token\'s value (rebasing) or by sending stablecoin directly to each wallet',
        'Coupons are automatically reinvested in new tokens without option to receive cash',
        'Coupon payments are batch-processed annually by Ethereum validators',
      ],
      correct: 1,
      hint: 'The smart contract handles distribution — but first the coupon must flow through the legal structure.',
      explanation: 'The coupon flow: bond issuer makes coupon payment (e.g., 2.5% semi-annually) → SPV receives it → smart contract distributes to all token holders proportionally. The mechanism varies by protocol: rebasing (each token\'s value increases; all holder balances rise automatically), yield-streaming (continuous micro-distributions accrue in the holder\'s wallet), or manual claim (holder calls a function to receive accumulated coupon). Rebasing is most DeFi-composable because the increased token value is usable as collateral without separate claiming.',
    },
    {
      question: 'A corporate bond defaults. The same bond is tokenised via an SPV. What happens to token holders?',
      options: [
        'The smart contract automatically recovers funds from the issuer',
        'Token holders face the same default as traditional bond holders — their recourse is through the SPV\'s legal structure and bankruptcy proceedings against the bond issuer; tokenisation does not alter the underlying credit risk',
        'Token holders are fully insured by the blockchain network',
        'The token automatically converts to equity in the defaulted company',
      ],
      correct: 1,
      hint: 'The blockchain records ownership, but who actually owes the money?',
      explanation: 'Tokenisation is ownership packaging, not risk transformation. The credit risk belongs to the bond issuer — if they cannot pay, neither can the SPV. Token holders\' recourse in default: the SPV\'s legal team pursues recovery through bankruptcy proceedings, bond indenture agreements, and collateral enforcement. This process is identical to traditional bond default recovery — the token holders are the beneficial owners of the defaulted bond claim. The blockchain cannot compel an insolvent issuer to pay. Recovery depends on the issuer\'s remaining assets and legal enforcement.',
    },
    {
      question: 'How does 24/7 settlement of tokenised bonds differ from traditional T+2 bond settlement?',
      options: [
        'Tokenised bonds are faster only for domestic transactions; cross-border settlement is still T+2',
        'Traditional bonds settle 2 business days after trade (T+2) — weekends and holidays add delays. Tokenised bonds transfer on-chain instantly at any time: weekends, holidays, 3am — settlement is near-real-time globally',
        'T+2 settlement is required by regulation for all bonds including tokenised ones',
        'Tokenised bond settlement is still T+2 because SPV processing takes 2 business days',
      ],
      correct: 1,
      hint: 'What causes T+2 delay in traditional bond markets? Is that delay present in an on-chain token transfer?',
      explanation: 'Traditional T+2 settlement exists because of the custody chain: broker, clearing house (DTC/Euroclear), custodian bank, and counterparty broker must all coordinate to update records. This takes 2 business days. Weekends and holidays add further delays. Tokenised bonds transfer via Ethereum/Polygon transactions — settlement finalises in the next block (12 seconds on Ethereum). The SPV still processes redemptions during business hours, but secondary market transfers between wallet addresses happen instantly 24/7. For large institutions that need to rebalance portfolios or post collateral over weekends, this operational improvement is genuinely significant.',
    },
    {
      question: 'You are comparing a 5% tokenised US Treasury (Ondo OUSG) with a 7% tokenised European SME loan pool (Centrifuge). Which risk factors explain the yield difference?',
      options: [
        'The 2% yield difference is purely a technology premium for Centrifuge\'s more complex smart contracts',
        'SME loans carry meaningful credit default risk (businesses can fail) vs near-zero US Treasury default risk — the 2% premium compensates for expected credit losses and recovery uncertainty',
        'Centrifuge charges 2% more in fees than Ondo, reducing net yield to 5%',
        'Tokenised SME loans pay higher yield because they settle faster',
      ],
      correct: 1,
      hint: 'What is the historical default rate for small European business loans vs US government bonds?',
      explanation: 'US Treasuries: US government default probability is near-zero (the US can issue dollars to pay dollar-denominated debt). Expected credit loss: essentially 0%. Centrifuge SME pool: European small and medium businesses have historical default rates of 3–8% depending on sector and economic cycle. Even a senior tranche with a 10% loss buffer faces meaningful exposure if a recession occurs. The 2% yield premium reflects: higher expected credit losses, higher recovery uncertainty (SME bankruptcies have complex creditor hierarchies), and less liquidity. Investors comparing these two products are comparing very different credit profiles.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 200 — AI × Crypto: Autonomous Agents Managing DeFi
// ─────────────────────────────────────────────────────────────────────────────

const L200: IslandLevel = {
  id: 200, mechanic: 'memory', tier: 'pro',
  topic: 'AI × Crypto — Autonomous Agents Managing DeFi',

  explanation: `
In November 2024, Virtuals Protocol launched on Base and reached $1 billion in market cap within 6 weeks. Its product: tokenised AI agents — autonomous programs you could invest in that earned revenue by performing on-chain tasks. One agent, named LUNA, managed a DeFi yield optimisation strategy and distributed earned fees to its token holders. This was not a metaphor. It was an AI model with a wallet, executing transactions on Base without human intervention, and paying dividends.

AI agents in crypto combine two technologies: large language model reasoning (deciding what to do) and blockchain execution (doing it). The practical architecture: an LLM reads on-chain data (token prices, APYs, liquidation risks), applies a strategy (defined in its system prompt), and generates transaction calls (swap, supply, withdraw) that are signed by a wallet and broadcast to the chain.

The most practical current applications are narrow: DCA agents (buy $200 of ETH every Monday, automatically), liquidation monitors (add collateral when health factor drops below 1.5), and arbitrage bots (spot price differences between DEXs and trade instantly). These require precise, bounded instructions — not general intelligence.

The emerging applications are more complex: Virtuals Protocol agents that autonomously allocate across DeFi protocols, ARC (Autonomous Research Council) agents that write and execute research-based trading strategies, and cross-chain agents using bridges to optimise positions across L2s.

The fundamental risk: an AI agent with wallet access can execute any transaction it decides is appropriate. Ambiguous instructions lead to unexpected behaviour. In 2024, a poorly constrained agent deployed with "maximise yield" as its sole instruction proceeded to take maximum leverage — a strategy technically correct for yield maximisation but catastrophically risky if the market moved. Clear, bounded instructions with spending limits and operation type restrictions are not optional features — they are the primary safety mechanism.
  `.trim(),

  fact: 'AI agents in crypto use LLMs for decision-making and blockchain wallets for execution. Current mature uses: DCA, liquidation monitors, arbitrage. Emerging: Virtuals Protocol tokenised agents, autonomous portfolio managers. Critical requirement: bounded instructions, spending limits, operation type restrictions, and kill switches.',
  plain: 'AI bots can now manage your DeFi — buying, lending, bridging — without you doing anything. Virtuals Protocol lets you invest in AI agents that earn revenue. The risk: an AI with vague instructions and a wallet can do very unexpected things. Always set strict limits.',
  stars: [740, 910, 1138], target: 1138, coins: 60,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Virtuals Protocol tokenised agent]',
      scenario: 'Priya considers investing in LUNA, a Virtuals Protocol AI agent on Base that claims to earn 12% APY by optimising yield across Aerodrome and Moonwell. She evaluates the investment.',
      outcome: 'LUNA token: $4M market cap. Claimed revenue: $480K annually (12% yield on $4M). Revenue source: LUNA\'s strategy earns fees managing DeFi positions; 30% of fees distributed to LUNA token holders. Risks: (1) Agent strategy performance — APY depends on DeFi market conditions, not guaranteed. (2) Agent key management — who controls the wallet? If compromised, all managed funds could be lost. (3) Smart contract risk in Virtuals\' protocol. (4) Token price risk — LUNA could fall regardless of agent performance. She invests 1% of her portfolio — treating it as a speculative bet on the agent category.',
    },
    {
      contextTag: '[Liquidation monitor agent]',
      scenario: 'Marcus has $80,000 in Moonwell (50,000 ETH collateral, $30,000 USDC borrowed) and worries about overnight liquidation if ETH drops sharply. He builds a monitoring agent.',
      outcome: 'Agent system prompt: "Every 5 minutes, check my Moonwell health factor. If health factor drops below 1.4, add 500 USDC from my reserve wallet to my Moonwell position. If health factor drops below 1.2, add 2,000 USDC. If health factor drops below 1.1, repay $10,000 USDC of debt immediately. Maximum daily spend: $15,000. Only these three operations permitted — no other actions." The agent runs overnight. When ETH drops 12%, health factor falls to 1.35 — agent adds 500 USDC. ETH recovers. No liquidation. The agent prevented a $15,000 penalty (typical liquidation bonus) for $3 in gas.',
    },
    {
      contextTag: '[Instruction ambiguity failure]',
      scenario: 'Keiko deploys an agent with the instruction: "Manage my $20,000 DeFi position to maximise yield." She gives it full wallet access. Three days later, she checks and finds her position has been levered 5× through recursive borrowing.',
      outcome: 'The agent interpreted "maximise yield" correctly from a pure optimization standpoint — recursive leverage (borrow → deposit → borrow again) multiplies yield exposure. At 5× leverage with 12% APY, the effective yield is 60%. The agent was not wrong by its instructions. But ETH dropped 8% and the health factor fell to 1.05 — one more 2% drop would trigger liquidation of the entire $20,000 position. The failure: no leverage restriction, no spending limit, no operation type restriction. A correct system prompt would have specified: "maximum 1.5× leverage, no recursive borrowing, only supply and withdraw operations."',
    },
  ],

  keyTakeaway: 'AI agents combine LLM reasoning with blockchain execution — enabling automated DeFi strategies. Tokenised agents (Virtuals Protocol) represent investable on-chain AI entities. The primary risk is instruction ambiguity: an agent will optimise exactly what you tell it to, including unexpected approaches. Bounded instructions, spending limits, and operation restrictions are mandatory safety infrastructure.',

  guidedPractice: [
    {
      question: 'What are the two core technologies combined in a crypto AI agent?',
      options: [
        'Blockchain and cloud storage',
        'A large language model (for decision-making and reasoning) and a blockchain wallet (for executing transactions on-chain)',
        'A trading algorithm and a price oracle',
        'A smart contract and a machine learning model for price prediction',
      ],
      correct: 1,
      hint: 'One technology decides what to do; the other does it. What are they?',
      explanation: 'AI crypto agents are a composition of two systems: the LLM (GPT-4, Claude, Llama) acts as the reasoning layer — it reads on-chain data, interprets strategy instructions, and decides which transaction to execute. The blockchain wallet (usually a smart wallet or EOA with programmatic access via AgentKit or similar SDKs) is the execution layer — it signs and broadcasts the transaction the LLM decided on. Neither component alone creates the autonomous agent. The intelligence without the wallet cannot act; the wallet without the intelligence cannot decide.',
    },
    {
      question: 'What made Virtuals Protocol significant in the AI × crypto space?',
      options: [
        'It was the first blockchain to run an LLM fully on-chain',
        'It created tokenised AI agents — autonomous on-chain entities whose economic output (fees earned) could be invested in, with token holders receiving revenue distributions from the agent\'s DeFi activity',
        'It proved AI agents could predict crypto prices with 90% accuracy',
        'Virtuals Protocol replaced human governance in all Base DeFi protocols',
      ],
      correct: 1,
      hint: 'What can an investor do with a Virtuals agent token that they cannot do with a regular AI tool?',
      explanation: 'Virtuals Protocol created a new primitive: tokenised AI agents as investable assets. Each agent has a token. The agent earns revenue by performing on-chain tasks (yield optimisation, trading, content generation in gaming). Revenue is distributed to token holders. This means investors can gain economic exposure to AI agent performance without running the agent themselves — similar to holding equity in a company that runs AI services. The tokenisation creates a market for AI agent performance, with token prices reflecting perceived agent quality and earnings capacity.',
    },
    {
      question: 'Why is "maximise yield" a dangerous instruction for an autonomous DeFi agent?',
      options: [
        'Because agents cannot understand yield calculations',
        'Because it leaves the optimisation strategy unconstrained — a technically correct interpretation could include recursive leverage, cross-chain borrowed positions, or concentrated high-risk strategies that are mathematically yield-maximising but unacceptably risky for the user',
        'Because DeFi yields are variable and no strategy can truly maximise them',
        '"Maximise yield" is a valid instruction; the danger is giving agents too much capital',
      ],
      correct: 1,
      hint: 'What strategies technically maximise yield? Would you want your agent to use all of them?',
      explanation: 'Recursive leverage (borrow → deposit → borrow again) can produce 50–100% APY on stablecoin positions — higher than any non-leveraged strategy. From a pure maximisation standpoint, it is correct. But one adverse price movement liquidates everything. "Maximise yield" does not specify: acceptable risk level, maximum leverage, permitted operation types, maximum transaction size. An instruction that seems intuitive to a human contains deep ambiguity for an optimiser. Precise instructions must specify what to do and what not to do: "supply and withdraw only, maximum 1× leverage, maximum 15% of portfolio per operation."',
    },
    {
      question: 'What is the correct kill switch mechanism for an autonomous DeFi agent?',
      options: [
        'Delete the agent\'s code file to stop it',
        'Revoke the wallet\'s permission to interact with DeFi protocols — or transfer all assets to a separate cold wallet — so the agent cannot execute further transactions regardless of its decisions',
        'Change the agent\'s system prompt to "do nothing"',
        'Kill switches are not possible once an agent has on-chain wallet access',
      ],
      correct: 1,
      hint: 'An agent\'s code runs on a server you may not control. What controls what it can actually do on-chain?',
      explanation: 'The kill switch operates at the wallet permission level, not the code level. Options: (1) Smart wallet (ERC-4337): revoke all session keys or operator permissions — the agent\'s wallet cannot sign transactions for any DeFi protocol. (2) Multisig requirement: require 2-of-3 signatures for all transactions — the agent provides one signature but cannot execute alone. (3) Asset transfer: move all assets to a cold wallet the agent cannot access. Changing the system prompt is not reliable — the code running the agent may cache previous instructions or continue on a previous reasoning chain. Wallet-level controls are the reliable mechanism.',
    },
    {
      question: 'ARC (Autonomous Research Council) agents write and execute research-based trading strategies. What distinguishes this from a simple DCA bot?',
      options: [
        'ARC agents use a different blockchain than DCA bots',
        'A DCA bot executes a fixed rule (buy $200 ETH every Monday) — ARC agents dynamically interpret research signals (on-chain data, narrative strength, protocol metrics) and modify strategy based on reasoning, not just a fixed rule',
        'DCA bots require human approval for each transaction; ARC agents do not',
        'ARC agents are fully decentralised; DCA bots run on centralised servers',
      ],
      correct: 1,
      hint: 'What inputs does each type of agent use to decide what to do?',
      explanation: 'DCA bots are rule-based: fixed time, fixed amount, fixed asset, no interpretation. They execute a predetermined schedule regardless of market conditions. ARC-style research agents use LLM reasoning to interpret variable inputs — on-chain metrics (TVL changes, wallet inflows/outflows, protocol revenue), narrative signals (announcement sentiment analysis), comparative protocol metrics — and generate dynamic strategy recommendations. The agent might increase ETH allocation when on-chain data shows accumulation patterns, or reduce position when negative regulatory news is detected. This is qualitatively different from rule execution: it is automated interpretation and strategy adaptation.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 201 — DePIN: Decentralised Physical Infrastructure Networks
// ─────────────────────────────────────────────────────────────────────────────

const L201: IslandLevel = {
  id: 201, mechanic: 'chain', tier: 'pro',
  topic: 'DePIN — Decentralised Physical Infrastructure Networks',

  explanation: `
In 2023, a Helium hotspot owner in Austin, Texas earned $3.40 in HNT tokens for providing LoRaWAN coverage to IoT devices — GPS trackers, smart meters, and sensors — in her neighbourhood. Her router cost $400. Across the network: 900,000 hotspots in 182 countries, collectively providing coverage that would cost Verizon or AT&T billions to deploy. Token incentives built a global wireless network that no company could have afforded to build through traditional capital expenditure.

DePIN — Decentralised Physical Infrastructure Networks — is the category of blockchain protocols that use token incentives to coordinate the deployment of real-world infrastructure by distributed participants. Instead of a corporation spending billions on centralised infrastructure, the protocol issues tokens to anyone who contributes infrastructure capacity.

The protocol archetype: hardware providers (hotspot operators, storage node runners, GPU providers) contribute physical capacity. The network measures their contribution (coverage area, uptime, storage proven, compute delivered). The smart contract issues tokens proportional to contribution. Token value reflects network demand — if real users pay to use the network (data transmission, storage, compute), tokens earn real economic value from that revenue.

Key examples: Helium (decentralised mobile/LoRaWAN network, $23 monthly average revenue per hotspot in peak 2022). Filecoin (decentralised storage — 17 exabytes of storage capacity, clients pay FIL for storage). Render Network (decentralised GPU compute — 3D rendering and AI inference). Hivemapper (decentralised mapping — dashcam owners earn HONEY tokens for driving and mapping roads).

The critical sustainability question: what happens when token emissions decrease? In early phases, token rewards often exceed the revenue from actual network use. This works while token price is high and emissions are large. As emissions decrease (like a halving schedule), operators must earn primarily from usage fees — or hardware becomes unprofitable and they exit. Networks that fail to achieve sufficient real-world demand before the emission subsidy ends typically see hardware exits and network degradation.
  `.trim(),

  fact: 'DePIN uses token incentives to coordinate deployment of real-world infrastructure by distributed hardware operators. Key networks: Helium (wireless), Filecoin (storage), Render (GPU compute), Hivemapper (mapping). Sustainability risk: if real-world usage fees don\'t replace token emission subsidies before emissions decrease, operators exit.',
  plain: 'DePIN pays everyday people to run physical infrastructure (WiFi routers, storage drives, cameras) using crypto tokens. Helium built a global wireless network this way. The key question: do enough real users pay for the service to make hardware worthwhile when the token reward runs out?',
  stars: [800, 985, 1231], target: 1231, coins: 64,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Helium economics analysis]',
      scenario: 'James is considering buying a Helium hotspot ($400) to earn HNT tokens. He evaluates the investment.',
      outcome: 'Current HNT earnings for his location (suburban Austin): estimated $4–12/month based on coverage witnesses and data transfer. At $4/month: payback period = 100 months (8+ years) — unprofitable. At $12/month: payback = 33 months. But HNT price has declined 95% from 2021 peak — rewards that earned $300/month in 2021 earn $8/month in 2024. The honest evaluation: DePIN hardware investments are highly sensitive to token price. At current prices, most residential Helium hotspots are marginal investments. The exception: hotspots in dense IoT device areas with real data transfer revenue.',
    },
    {
      contextTag: '[Filecoin storage provider]',
      scenario: 'Priya has 100TB of spare hard drive capacity in her home office. She evaluates running a Filecoin storage provider node.',
      outcome: 'Requirements: 100TB storage, fast internet (1Gbps+), 32GB RAM, ~$5,000 in FIL as collateral (slashed if data is lost). Earnings: FIL block rewards (~8 FIL/block × her storage share) + client storage fees. At current FIL price ($5): $40–$120/month earnings on $5,000 capital + hardware. Her electricity cost: $50/month. Net: breakeven to slightly positive. Key insight: Filecoin\'s storage market is real — enterprises actually pay for storage. But the entry barrier (FIL collateral, technical complexity) limits participants. She decides the technical overhead and capital at risk make it unattractive vs simply providing storage through AWS.',
    },
    {
      contextTag: '[Render Network GPU compute]',
      scenario: 'Marcus owns four NVIDIA RTX 4090 GPUs he uses for gaming. He evaluates listing them on Render Network for idle time compute.',
      outcome: 'Render Network: 3D artists and AI researchers rent GPU compute for rendering and inference. Marcus lists his GPUs at 0.05 RNDR per OctaneBench minute. At current utilisation (4 hours/day × 4 GPUs), he earns ~0.6 RNDR/day = ~$0.30/day at current RNDR price. His electricity cost: $0.12/day. Net: $0.18/day profit — small but positive. Key difference from Helium/Filecoin: Render has genuine enterprise demand (VFX studios, game developers, AI labs) paying real USD for compute. This real demand makes the economics more stable than purely token-subsidy-dependent networks.',
    },
  ],

  keyTakeaway: 'DePIN protocols use token incentives to build physical infrastructure networks without centralised capital expenditure. Sustainability depends on transitioning from token emission subsidies to real usage fee revenue before emissions decrease. Networks with genuine enterprise demand (Filecoin, Render) have more durable economics than those dependent primarily on token speculation.',

  guidedPractice: [
    {
      question: 'What is the core mechanism that allows DePIN networks to build infrastructure without centralised capital?',
      options: [
        'DePIN networks raise venture capital that is distributed to hardware operators',
        'Token incentives: hardware operators contribute physical capacity and receive tokens from the protocol in proportion to their contribution — effectively crowdsourcing infrastructure deployment through economic incentives',
        'DePIN networks use government subsidies allocated through smart contracts',
        'Hardware manufacturers contribute equipment in exchange for protocol governance rights',
      ],
      correct: 1,
      hint: 'Who provides the hardware? Why do they do it? What do they receive?',
      explanation: 'The DePIN mechanism: (1) A protocol defines what infrastructure is needed (wireless coverage, storage, compute, mapping). (2) A smart contract measures each operator\'s contribution (coverage witnesses, storage proofs, compute delivered, distance mapped). (3) Tokens are minted and distributed proportionally. (4) Operators are economically incentivised to deploy hardware because tokens have expected value. This bootstraps a global network without any company needing to own all the hardware. Helium deployed 900,000 hotspots this way — no traditional infrastructure company could afford equivalent capital expenditure.',
    },
    {
      question: 'Helium hotspot operators earned $300/month in 2021 but $4/month in 2024 for the same hardware. What explains this difference?',
      options: [
        'Helium reduced the coverage area requirements in 2024',
        'HNT token price declined 95%+ from peak — the token reward in HNT quantity may be similar, but its USD value collapsed with the token price; real network usage fees (data transfer) have not grown enough to compensate',
        'Helium reduced block rewards by 50% in 2022',
        'New hardware requirements made older hotspots incompatible',
      ],
      correct: 1,
      hint: 'If you earn 10 HNT/month and HNT goes from $50 to $5, what happens to your USD earnings?',
      explanation: 'DePIN hardware operator economics are directly tied to token price. When HNT was $50: 6 HNT/month = $300. When HNT dropped to $5: same 6 HNT/month = $30. A 90% token price decline creates a 90% revenue decline for operators. This is the core DePIN economic risk: operator profitability is hostage to token price rather than based on a stable revenue model. Networks that transition to charging real users (IoT data transfer fees, storage client payments) in stablecoins or major cryptocurrencies have more durable operator economics than those depending purely on new token issuance.',
    },
    {
      question: 'Hivemapper pays dashcam drivers HONEY tokens for mapping roads. What is the real-world use case that creates demand for this data?',
      options: [
        'Hivemapper sells map data to crypto protocols for on-chain navigation',
        'Mapping companies (navigation apps, logistics firms, municipalities) need frequently updated road imagery — Hivemapper sells this data to customers who pay with HONEY, creating real revenue that backs the token\'s value',
        'HONEY tokens are purely speculative — there is no real-world data buyer',
        'Hivemapper maps only blockchains, not physical roads',
      ],
      correct: 1,
      hint: 'Why is road imagery valuable to companies outside of crypto?',
      explanation: 'Up-to-date road imagery and 3D map data is valuable to: navigation companies (Waze, Apple Maps need frequent updates), logistics firms (delivery route optimization), municipalities (infrastructure monitoring), autonomous vehicle companies (HD map maintenance). Hivemapper sells this data as a B2B service — customers pay in HONEY or USD. HONEY received from customers is distributed to dashcam contributors. This creates a real demand side for the token: companies need the data, pay for it, and that payment flows to the camera operators. The test of DePIN sustainability: is there a non-speculative buyer paying for the output?',
    },
    {
      question: 'What is the "emission cliff" risk for DePIN networks?',
      options: [
        'When the protocol runs out of tokens to issue entirely',
        'When scheduled token emission reductions occur before real usage fee revenue has grown enough to compensate — causing operator profitability to collapse and triggering hardware exits that degrade network quality',
        'When too many hardware operators join simultaneously, reducing individual rewards',
        'When the token price rises so fast that hardware operators sell all their tokens at once',
      ],
      correct: 1,
      hint: 'Many DePIN protocols have halving-like schedules. What happens if operators depend on emissions just as emissions decrease?',
      explanation: 'Most DePIN protocols issue tokens at decreasing rates over time (like Bitcoin halvings). In early phases, high emission rates subsidise operators even when real usage is minimal. The emission cliff: when emissions decrease significantly, operators who were earning primarily from token issuance (not real usage fees) see their revenue drop dramatically. If real usage fees haven\'t grown to compensate, hardware becomes unprofitable and operators exit. Network quality degrades as nodes go offline. The network enters a death spiral if user adoption is insufficient. Networks that transition to primarily usage-fee revenue before the emission cliff survive; others fail.',
    },
    {
      question: 'Why does Render Network have more durable economics than a pure token-incentive DePIN model?',
      options: [
        'Render Network has a lower hardware cost barrier than Helium',
        'Render has real enterprise customers (VFX studios, AI labs) paying market rates for GPU compute — revenue is driven by demand for the service itself, not just by new token issuance attracting speculators',
        'Render Network does not issue tokens — it uses traditional subscription fees',
        'GPU compute is more valuable than wireless coverage because it scales with AI adoption',
      ],
      correct: 1,
      hint: 'Who actually pays for GPU compute on Render? What would they be paying without Render?',
      explanation: 'Render Network serves professional GPU compute demand: 3D rendering for VFX (Avatar sequels used similar distributed GPU compute), AI model training and inference, architectural visualisation. These customers would otherwise pay AWS or specialised compute providers at $2–$10/GPU-hour. Render charges competitive rates. Operator earnings include: RNDR token rewards (the subsidy) + real compute fees from clients (the durable revenue). As token emissions decrease, Render\'s economics are partially supported by real enterprise demand rather than purely speculative. This makes it more resilient than networks where all operator revenue comes from new token minting with no underlying service buyer.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 202 — Account Abstraction at Scale: ERC-4337 and Beyond
// ─────────────────────────────────────────────────────────────────────────────

const L202: IslandLevel = {
  id: 202, mechanic: 'match3', tier: 'pro',
  topic: 'Account Abstraction at Scale — ERC-4337 and Beyond',

  explanation: `
In 2024, a consumer app called Coinbase Wallet onboarded 1 million new users in six months — none of them wrote down a seed phrase. Their wallet was created with Face ID. Their first transaction required no ETH for gas. They didn\'t know they were using a blockchain. This was ERC-4337 account abstraction in production, and it represents the most significant UX shift in Ethereum since MetaMask itself.

Account abstraction (AA) separates the concept of "who authenticates" from "who pays gas" from "who owns the account." In traditional Ethereum (EOA — Externally Owned Account): a private key owns the account, pays gas, and is the only way to authenticate. Lose the key → lose everything.

ERC-4337 replaces the EOA with a smart contract wallet. The authentication method is configurable: passkeys (biometrics via device secure enclave), multisig (require 2-of-3 keys), social recovery (designated contacts approve recovery), or time-locked operations (no large transaction without 24h delay). The gas payer is also configurable via a Paymaster contract: the app developer can pay gas (gasless UX), a user can pay gas in USDC instead of ETH (no ETH required), or traditional self-payment in ETH.

Key deployed implementations: Coinbase Smart Wallet (Base), Argent (Ethereum, StarkNet), Safe (formerly Gnosis Safe — the dominant multisig), ZkSync Era\'s native AA (AA is built into the protocol, not added as a layer), Starknet (fully native AA from genesis — every account is a contract).

EIP-7702 (in development): allows a traditional EOA to temporarily upgrade to smart contract account behavior for a single transaction — enabling existing wallets to use AA features without migration. EIP-3074 is a similar concept, currently in competition with EIP-7702 for inclusion.

The end state: every blockchain account is programmable. Seed phrases become optional. Recovery is social. Gas is invisible. This is not a future vision — it is operational on Base, ZkSync, and Starknet today.
  `.trim(),

  fact: 'ERC-4337 turns Ethereum accounts into programmable smart contracts. Key capabilities: biometric authentication (passkeys), social recovery (no seed phrase), gasless transactions via Paymaster, and batched operations. Deployed: Coinbase Smart Wallet, Argent, Safe. Natively implemented: ZkSync Era and Starknet.',
  plain: 'Account abstraction makes crypto wallets work like phone apps: use Face ID instead of a seed phrase, pay fees automatically, recover your account if you lose your phone. Coinbase Smart Wallet already does this. ZkSync and Starknet have it built in.',
  stars: [860, 1058, 1323], target: 1323, coins: 68,
  simulatorLesson: 'metamask',

  examples: [
    {
      contextTag: '[Consumer app UX]',
      scenario: 'Marcus is building a tip-the-creator app. His target users are Instagram creators and their fans — average age 22, never used crypto. He implements Coinbase Smart Wallet.',
      outcome: 'User journey: download app → sign up with email → Face ID creates a smart wallet (no seed phrase shown) → first tip: tap "Send $5" → Face ID confirmation → done. Technical implementation: Paymaster contract pays ETH gas (Marcus budgets $0.003/transaction, handles 1M transactions for $3,000). Transaction batching: approve USDC + send USDC in one Face ID confirmation instead of two. Result: users experience a Venmo-like flow with no concept of "blockchain," "gas," or "seed phrase." Onboarded 50,000 users in 3 months — conversion rate 3× higher than his previous non-AA implementation.',
    },
    {
      contextTag: '[Social recovery]',
      scenario: 'Keiko holds $45,000 across various Base DeFi protocols via her smart wallet. Her phone is stolen. She demonstrates recovery to her skeptical husband.',
      outcome: 'Her Argent smart wallet was configured with 3 recovery guardians: her sister\'s wallet, her hardware wallet, and Argent\'s Recovery Service (a fallback). Recovery process: any 2 of 3 guardians approve recovery request → smart contract initiates 24-hour time lock → Keiko provides her new device (links new Face ID) → after 24 hours, new device is the authenticator. No seed phrase needed at any point. Her husband\'s traditional MetaMask wallet: if he loses his seed phrase, $45,000 is gone forever. Argent: recoverable within 25 hours. The security trade-off: guardians must themselves be secure.',
    },
    {
      contextTag: '[EIP-7702 upgrade path]',
      scenario: 'James has a 5-year-old Ethereum EOA with $80,000 in various tokens. He wants AA features (gasless UX for a new app) without migrating to a new wallet and moving all his assets.',
      outcome: 'EIP-7702 (when deployed): James\'s existing EOA signs a special authorisation transaction that temporarily upgrades it to smart contract wallet behavior. For that session, his wallet can: use a Paymaster (gasless transactions in the app), batch multiple operations in one transaction, and use passkey authentication. At the end of the session, the wallet reverts to standard EOA behavior. His $80,000 stays at his existing address — no migration, no gas to move tokens. This is the backwards-compatible path enabling existing Ethereum users to access AA features without wallet migration.',
    },
  ],

  keyTakeaway: 'ERC-4337 makes Ethereum accounts programmable smart contracts — enabling biometric authentication, social recovery without seed phrases, gasless transactions via Paymasters, and batched operations. This is deployed today on Base, ZkSync, and Starknet. EIP-7702 extends these features to existing EOAs without migration.',

  guidedPractice: [
    {
      question: 'What is the fundamental difference between a traditional Ethereum EOA and an ERC-4337 smart account?',
      options: [
        'EOAs can only hold ETH; smart accounts can hold any token',
        'An EOA is controlled by a single private key with no configurable logic. An ERC-4337 smart account is a programmable contract — authentication method, gas payment, and account recovery are all configurable',
        'Smart accounts are cheaper to use than EOAs',
        'EOAs are deprecated in ERC-4337 and no longer supported by MetaMask',
      ],
      correct: 1,
      hint: 'What is hardcoded in an EOA that an ERC-4337 smart account makes configurable?',
      explanation: 'EOA: one private key = one authentication method = one gas payer = one recovery option (the key). Change nothing. If the key is compromised or lost, there is no recourse. ERC-4337: the authentication method is pluggable (passkeys, hardware keys, multisig, social logins). The gas payer is pluggable (self, Paymaster contract, app developer). Recovery is pluggable (social guardians, time-locked backup keys, Argent\'s recovery service). Each of these parameters is set in the smart contract\'s code, not hardcoded into the key pair.',
    },
    {
      question: 'What is a Paymaster contract and why is it essential for consumer app onboarding?',
      options: [
        'A Paymaster is a smart contract that reimburses users for failed transactions',
        'A Paymaster pays ETH gas fees on behalf of users, enabling gasless transactions — users can interact with dApps without holding ETH, removing the "you need ETH for gas" barrier that blocks mainstream adoption',
        'Paymasters convert ETH to stablecoins automatically for each transaction',
        'Paymasters are used only by validators to pay for block production',
      ],
      correct: 1,
      hint: 'What is the most common complaint from non-crypto users trying to use their first DeFi app?',
      explanation: '"I have USDC, why do I need ETH for gas?" is the most common new user friction point in DeFi. Paymaster contracts resolve this: the app developer (or a sponsorship pool) deploys a Paymaster that pre-funds ETH gas. When a user executes a transaction, the Paymaster covers the gas. From the user\'s perspective: tap, Face ID, done — no ETH required. App developers typically budget $0.002–$0.01 per sponsored transaction — cheaper than customer acquisition cost, and far better than losing the user to the "need ETH for gas" confusion.',
    },
    {
      question: 'Why does Starknet\'s native account abstraction differ from ERC-4337\'s approach?',
      options: [
        'Starknet uses private keys like Ethereum; ERC-4337 does not require keys',
        'ERC-4337 adds AA as a layer on top of Ethereum EOA infrastructure. Starknet has AA built into the protocol — every account is a contract from genesis, making AA features uniformly available with lower overhead',
        'Starknet\'s AA only supports passkeys; ERC-4337 supports any authentication method',
        'ERC-4337 is more secure than Starknet\'s AA because it uses Ethereum validators',
      ],
      correct: 1,
      hint: 'ERC-4337 is an application-layer standard. What is Starknet\'s AA?',
      explanation: 'ERC-4337 is a workaround: it adds smart account functionality without changing the Ethereum protocol, using a separate mempool (User Operations pool) and bundler infrastructure to relay UserOps to the blockchain. This adds complexity and overhead. Starknet built AA into the protocol itself — the account model at the VM level treats every account as a contract. There is no EOA concept. Authentication, gas payment, and signature verification are fully programmable for all accounts by default, with no extra infrastructure layer. The result: lower overhead, more consistent behaviour, and simpler developer experience.',
    },
    {
      question: 'A user\'s Argent smart wallet has 3 guardians configured (sister\'s wallet, hardware wallet, Argent Recovery Service). What is the minimum required for account recovery?',
      options: [
        'All 3 guardians must approve simultaneously',
        'Any 2 of the 3 guardians approve the recovery request — the standard 2-of-3 threshold ensuring recovery is possible even if one guardian is unavailable',
        'Only Argent Recovery Service can approve — other guardians are optional confirmations',
        'Recovery requires 1 guardian approval plus a 90-day waiting period',
      ],
      correct: 1,
      hint: 'What does "2-of-3 multisig" mean for recovery?',
      explanation: 'Argent\'s recovery uses a 2-of-3 threshold: any combination of 2 guardians from the 3 can approve recovery. This design handles real-world scenarios: if the sister\'s phone is broken (1 guardian unavailable), the hardware wallet + Argent Service = 2 approvals = recovery succeeds. If the hardware wallet is lost (1 unavailable), sister + Argent Service = 2 = recovery succeeds. Requiring all 3 would make recovery impossible if any guardian is unavailable. The 24-hour time lock adds protection against attacker-initiated fake recovery: the user has 24 hours to cancel if recovery was not initiated by them.',
    },
    {
      question: 'What problem does EIP-7702 solve that ERC-4337 deployment alone does not?',
      options: [
        'EIP-7702 reduces gas costs for ERC-4337 transactions',
        'ERC-4337 requires using a new smart wallet address — existing Ethereum users with years of history on their EOA address cannot easily migrate. EIP-7702 allows an existing EOA to temporarily access AA features without moving assets to a new address',
        'EIP-7702 adds passkey support to ERC-4337 wallets',
        'EIP-7702 is a replacement for ERC-4337, not a complement',
      ],
      correct: 1,
      hint: 'What happens to all the tokens, DeFi positions, and history at an existing EOA address if the user migrates to a new smart wallet?',
      explanation: 'Migrating to an ERC-4337 smart wallet creates a new address. The user must: move all tokens (gas cost, multiple transactions), re-link to all dApps (governance positions, LP NFTs, staking receipts), lose historical context at the old address. For a user with 5 years of DeFi history at one address, migration is extremely disruptive. EIP-7702 allows the existing EOA to temporarily behave as a smart account for specific transactions — accessing Paymaster, batching, and passkey features without permanent migration. The address stays the same. All existing positions remain. The user gets AA features at their existing address.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 203 — CBDCs: Government Digital Currencies and DeFi Implications
// ─────────────────────────────────────────────────────────────────────────────

const L203: IslandLevel = {
  id: 203, mechanic: 'memory', tier: 'pro',
  topic: 'CBDCs — Government Digital Currencies and DeFi Implications',

  explanation: `
In 2023, Nigeria\'s central bank made a policy decision that inadvertently became the world\'s largest CBDC experiment: it withdrew 90% of cash from circulation in 60 days, forcing its 200 million citizens to use either eNaira (its CBDC) or private stablecoins. The result was revealing — eNaira adoption was minimal, while USDC and USDT usage surged. Citizens chose private dollar stablecoins over their government\'s digital currency.

A Central Bank Digital Currency (CBDC) is digital money issued directly by a central bank — technically equivalent to a digital version of physical cash, but with programmability. There are two structural models: retail CBDCs (citizens hold them directly in digital wallets) and wholesale CBDCs (only commercial banks access them for interbank settlement). Most public interest and concern focuses on retail CBDCs.

The genuine innovations CBDCs could deliver: instant domestic and cross-border settlement (payments in seconds, not days), financial inclusion for unbanked populations (no bank account required, just a mobile phone), and reduction in remittance costs (international transfers currently cost 6.4% on average; CBDC settlement could cost fractions of a cent).

The legitimate surveillance concerns are also real: programmable money can theoretically have spending controls (cannot buy alcohol), geographic restrictions (cannot spend outside your home region), expiry dates (unspent stimulus expires in 90 days), or automatic tax withholding. These capabilities exist technically if implemented. Whether any government would actually implement them depends on political constraints, legal frameworks, and citizen resistance.

China\'s eCNY has 261 million users and has processed $250B in transactions — by far the most advanced retail CBDC. The EU Digital Euro is in design phase. The US CBDC is politically contested — legislative efforts in 2024 sought to prohibit it. The technical infrastructure is built; the political will varies enormously by country.

DeFi implications: if CBDCs integrate with public blockchains, programmable government money could enhance DeFi. If implemented on private permissioned blockchains (as most current CBDCs are), they compete with but do not integrate into DeFi.
  `.trim(),

  fact: 'CBDCs are digital central bank money — retail (citizens) or wholesale (banks only). China\'s eCNY: 261M users, $250B processed. EU Digital Euro in design. US CBDC politically contested. Programmability enables: instant settlement, financial inclusion, potential spending controls. Most are private chains, not integrating with DeFi.',
  plain: 'CBDCs are government-issued digital cash. China has the largest one. The useful parts: instant payments, cheaper remittances. The concerning parts: governments could program spending restrictions. Most CBDCs run on private chains and don\'t connect to public DeFi.',
  stars: [920, 1132, 1415], target: 1415, coins: 72,
  simulatorLesson: 'governance',

  examples: [
    {
      contextTag: '[Nigeria eNaira vs USDC adoption]',
      scenario: 'Amara is a Nigerian entrepreneur who used both eNaira and USDC for cross-border payments in 2023. She compares the experience.',
      outcome: 'eNaira: accepted only by Nigerian government institutions and selected merchants. Cross-border use: impossible — no foreign entity accepts eNaira. Exchange rate: fixed to naira (which declined 40% vs USD in 2023). eNaira was essentially a digital form of an already depreciating currency. USDC: accepted by global crypto exchanges, international suppliers, and Binance Pay — directly avoiding naira depreciation. Result: Amara invoices international clients in USDC, pays Nigerian suppliers in eNaira for naira-denominated goods, and holds reserves in USDC. Private stablecoins won because they solved her actual problems (currency stability, international acceptance) that eNaira could not.',
    },
    {
      contextTag: '[CBDC spending controls analysis]',
      scenario: 'Marcus reads a news article claiming "CBDCs will allow governments to turn off your money." He evaluates what is technically possible vs politically likely in different contexts.',
      outcome: 'Technically possible: the Bahamas Sand Dollar CBDC already has geographic restrictions (cannot be spent outside the Bahamas). The EU Digital Euro legal framework explicitly prohibits programmable spending restrictions and requires anonymity up to transaction amounts equivalent to physical cash. The US political environment: a 2024 Congressional bill sought to ban all retail CBDCs citing surveillance risk. Technically possible ≠ politically implemented. In functioning democracies, the constraint is not technical capability but political cost of such restrictions. In authoritarian contexts (China\'s eCNY), the calculus is different — but even China has not implemented expiring money or individual spending controls in its deployed system.',
    },
    {
      contextTag: '[Wholesale CBDC for institutional settlement]',
      scenario: 'Keiko\'s employer (a Japanese bank) explains how the Bank of Japan\'s wholesale CBDC pilot reduces settlement risk.',
      outcome: 'Current interbank settlement (RTGS): banks settle transactions through the Bank of Japan in batches with T+1 delay; overnight exposure to counterparty credit risk. Wholesale CBDC: banks hold digital BOJ yen directly; cross-bank payments settle instantly on the CBDC ledger with no counterparty credit exposure — payment is final the moment the CBDC transfers. For a large bank processing $50B/day, eliminating overnight credit exposure reduces capital requirements and risk management costs significantly. Wholesale CBDCs have no direct surveillance implication for citizens — they operate only between banks and the central bank.',
    },
  ],

  keyTakeaway: 'CBDCs offer real improvements (instant settlement, financial inclusion, cheap remittances) alongside legitimate concerns (programmable spending controls). Most current CBDCs operate on private chains, not integrating with DeFi. Political and legal constraints — not just technical capability — determine what programmable features are actually implemented.',

  guidedPractice: [
    {
      question: 'What is the difference between a retail CBDC and a wholesale CBDC?',
      options: [
        'Retail CBDCs are used for small purchases; wholesale for large ones',
        'Retail CBDCs are held directly by citizens and businesses. Wholesale CBDCs are held only by commercial banks for interbank settlement — citizens never interact with them directly',
        'Retail CBDCs use blockchain technology; wholesale CBDCs use traditional banking infrastructure',
        'Wholesale CBDCs earn higher interest rates than retail CBDCs',
      ],
      correct: 1,
      hint: 'Who holds each type? Who are the direct users?',
      explanation: 'Retail CBDC: a digital version of physical cash held by anyone — citizens, businesses, merchants — in digital wallets. This is the type generating public concern about surveillance and control. Wholesale CBDC: a digital settlement instrument between commercial banks and the central bank, used for interbank clearing — ordinary citizens never hold it. The Bank of England, Bank of Japan, and BIS have all noted that wholesale CBDCs raise minimal civil liberties concerns because they are purely an interbank infrastructure upgrade. The surveillance concerns are specific to retail CBDCs.',
    },
    {
      question: 'Nigeria\'s CBDC adoption was low while USDC usage surged. What does this reveal about CBDC design requirements?',
      options: [
        'Nigerians are generally resistant to digital payments',
        'A CBDC must solve real problems better than available alternatives — Nigerian USDC adoption surged because it solved the naira depreciation problem that eNaira (a digital naira) did not; political issuance alone does not create adoption',
        'CBDCs can only succeed in technologically advanced countries',
        'The eNaira failed because Nigeria\'s internet infrastructure was inadequate',
      ],
      correct: 1,
      hint: 'What problem was USDC solving that eNaira could not?',
      explanation: 'The eNaira is a digital naira — it inherits all of naira\'s limitations: currency depreciation, limited international acceptance, domestic use only. It offers convenience improvements over physical cash but does not solve the fundamental problem Nigerian businesses face: naira\'s 40% annual depreciation erodes savings and makes international trade expensive. USDC is dollar-denominated — stable, globally accepted, and convertible. Citizens chose USDC because it solved their actual problem (dollar savings, international payments). A CBDC must offer genuine utility improvements over existing alternatives to achieve voluntary adoption.',
    },
    {
      question: 'Which current CBDC is the most widely deployed and what is its scale?',
      options: [
        'US dollar CBDC — the most widely used currency globally',
        'China\'s eCNY — 261 million registered users and $250 billion in processed transactions, by far the most advanced retail CBDC deployment in 2024',
        'EU Digital Euro — covering 350 million European citizens',
        'Bahamas Sand Dollar — the first CBDC, now the most adopted',
      ],
      correct: 1,
      hint: 'Which country launched its CBDC earliest and has had the longest time for adoption?',
      explanation: 'China\'s eCNY (also called the digital yuan or e-CNY) launched in pilot in 2020 and has expanded to all major Chinese cities. With 261 million registered wallets and $250B in processed transactions, it is orders of magnitude larger than any other CBDC. The Bahamas Sand Dollar was the first to launch but serves a population of 400,000. The EU Digital Euro and US CBDC remain in design/political stages as of 2024. China\'s combination of authoritarian implementation capacity and large population makes it the only CBDC with meaningful scale data.',
    },
    {
      question: 'The EU Digital Euro legal framework prohibits programmable spending restrictions. Why is this legally significant?',
      options: [
        'It prevents the EU from upgrading the Digital Euro in the future',
        'It demonstrates that CBDC programmability and spending controls are not technically coupled — democratic jurisdictions can legally prohibit surveillance features while still gaining CBDC efficiency benefits, showing the technology\'s capabilities and legal constraints are independent',
        'EU law prohibits all digital currencies, making the Digital Euro illegal',
        'The prohibition means the EU Digital Euro cannot be used for online purchases',
      ],
      correct: 1,
      hint: 'If the EU prohibits spending controls in law, what does this tell you about the relationship between technical capability and political implementation?',
      explanation: 'The EU Digital Euro legislation explicitly prohibits: targeted spending restrictions, geographic limitations, expiry dates for individual users, and profiling. This legal framework shows that technical programmability and political implementation are independent. The capability to restrict spending exists in any programmable system — but in a democracy, political constraints can prohibit that capability\'s use. The same argument applies to other regulated democracies. The risk is highest in jurisdictions where rule of law is weaker and political constraints on executive action are fewer.',
    },
    {
      question: 'If a country\'s CBDC operates on a private permissioned blockchain, what is the primary DeFi integration challenge?',
      options: [
        'Private blockchain CBDCs are more expensive to use than public DeFi protocols',
        'Private blockchain CBDCs are not composable with public DeFi protocols — they cannot be used as collateral in Aave, traded on Uniswap, or integrated into open smart contracts without a specific bridge or API integration',
        'Private blockchain CBDCs automatically integrate with Ethereum through Layer 0 bridges',
        'Private CBDC blockchains run faster than Ethereum, creating settlement conflicts',
      ],
      correct: 1,
      hint: 'If a CBDC lives on a permissioned chain that public smart contracts cannot access, how can it interact with Ethereum DeFi?',
      explanation: 'Ethereum DeFi composability requires that assets be native ERC-20 tokens or wrapped equivalents accessible to any smart contract. A CBDC on China\'s private blockchain, the ECB\'s permissioned ledger, or the BIS\'s proprietary infrastructure cannot be directly addressed by an Ethereum smart contract — the networks are not connected. Integration requires: a licensed bridge operator wrapping CBDC tokens into an ERC-20 (like how real dollars become USDC through Circle), regulatory approval for that wrapping mechanism, and technical infrastructure maintained by licensed entities. This is a significant obstacle to CBDC-DeFi integration and is unlikely to be resolved without explicit policy decisions.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L196–203)
// ─────────────────────────────────────────────────────────────────────────────

export const ISLAND_FINALFRONTIER_LEVELS_A: Record<number, IslandLevel> = {
  196: L196,
  197: L197,
  198: L198,
  199: L199,
  200: L200,
  201: L201,
  202: L202,
  203: L203,
};
