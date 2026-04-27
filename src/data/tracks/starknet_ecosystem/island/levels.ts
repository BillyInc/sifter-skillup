// ⚡ Sifter SkillUp — Starknet World Island (Levels 291–310)
// Island #18 · Onboarding Track · Medium narrative standard (150-200 words)
//
// TEACHING STANDARD:
// 1. Every lesson opens with a real-world story or analogy BEFORE any technical concept.
// 2. Every technical term is defined inline, in plain English, the first time it appears.
// 3. Guided practice questions map exactly to what was taught in the explanation.
// 4. Simulators match the lesson topic — not generic DeFi widgets.
// 5. Progress: awareness → understanding → interaction (no portfolio push in Island track).
// 6. Navigation: user can go back from simulator. Simulator has clear "lesson complete" CTA.
//
// EXTENDED LEVEL TYPE: Island levels use StarknetIslandLevel which extends Level
// with full lesson content. The base Level fields remain for compatibility.

import type { Level, LessonSimulation } from '../../../levels';

// ── Extended type for Starknet Island lessons ────────────────────────────────

export interface GuidedPracticeItem {
  question: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  hint: string;
  explanation: string;
}

export interface WorkedExample {
  contextTag: string;
  scenario: string;
  outcome: string;
}

export interface StarknetIslandLevel extends Level {
  explanation: string;
  examples: WorkedExample[];
  keyTakeaway: string;
  guidedPractice: GuidedPracticeItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 291 — What Is Starknet? (ORIGINAL)
// ─────────────────────────────────────────────────────────────────────────────
const L291: StarknetIslandLevel = {
  id: 291, mechanic: 'match3', tier: 'pro',
  topic: 'What Is Starknet?',

  explanation: `
In 2021, sending $10 on Ethereum could cost $50 in fees during busy periods. The network was becoming unusable for small transactions. Starknet was built to solve this.

Starknet is a Layer 2 — a separate network that runs on top of Ethereum the same way a toll motorway runs alongside local roads. It processes transactions faster and cheaper, then periodically sends a compressed "proof" to Ethereum confirming everything happened correctly.

The key word is proof. Rather than asking Ethereum to verify every transaction individually (expensive), Starknet batches thousands of transactions together and sends a single mathematical proof that says: "all of these happened correctly." Ethereum only needs to check one proof instead of thousands of transactions.

This is called a ZK-rollup. ZK stands for Zero-Knowledge — a type of cryptography where you can prove something is true without revealing all the details of how you know it. Starknet uses a specific variant called STARKs (Scalable Transparent ARguments of Knowledge).

The result: transactions on Starknet cost fractions of a cent and settle in seconds, while inheriting Ethereum's security.
  `.trim(),

  fact: 'Starknet processes thousands of transactions off-chain, compresses them into a single STARK proof, and posts that proof to Ethereum. The result: Ethereum-grade security at a fraction of the cost.',
  plain: 'A separate network built on top of Ethereum. Faster, cheaper, and cryptographically secure. Your transactions happen on Starknet; Ethereum just checks the receipts.',
  stars: [400, 500, 620], target: 620, coins: 40,

  examples: [
    {
      contextTag: '[New user, comparing costs]',
      scenario: 'Maya wants to send 50 USDC to a friend. On Ethereum mainnet, the gas fee is $8. On Starknet, the same transaction costs $0.003.',
      outcome: 'Maya uses Starknet. Her transaction settles in 2 seconds. The proof of her transaction is included in a batch with 4,000 others and posted to Ethereum 10 minutes later. She paid less than 0.1% of the Ethereum fee.',
    },
    {
      contextTag: '[Developer, choosing a chain]',
      scenario: 'James is building a payment app where users tip creators $1 at a time. On Ethereum L1, each tip costs $4 in fees — economically impossible. He evaluates Starknet.',
      outcome: 'On Starknet, each $1 tip costs $0.001 in fees. James deploys on Starknet. The app is economically viable. His users\' transactions are batched and proven to Ethereum automatically — no extra work required.',
    },
    {
      contextTag: '[Investor, understanding security]',
      scenario: 'Keiko asks: "If Starknet is separate from Ethereum, is my money less safe?" She wants to understand the security model.',
      outcome: 'Keiko learns that Starknet\'s security comes from Ethereum. The STARK proof that Starknet submits to Ethereum is mathematically verifiable — Ethereum will reject any proof that contains a fraudulent transaction. Her funds are protected by the same cryptographic guarantees as Ethereum itself.',
    },
  ],

  keyTakeaway: 'Starknet is a ZK-rollup on Ethereum — transactions happen on Starknet for cheap, but security comes from Ethereum via STARK proofs.',

  guidedPractice: [
    {
      question: 'What does "Layer 2" mean?',
      options: [
        'A completely separate blockchain with no connection to Ethereum',
        'A network built on top of Ethereum that uses Ethereum for security',
        'The second version of the Ethereum blockchain',
        'A wallet that connects to two blockchains simultaneously',
      ],
      correct: 1,
      hint: 'Think about the motorway analogy. The motorway runs alongside local roads — they\'re connected, not separate.',
      explanation: 'A Layer 2 is a network built on top of Ethereum (Layer 1). It handles transactions independently but uses Ethereum for final security. Starknet transactions are proven to Ethereum via STARK proofs.',
    },
    {
      question: 'How does Starknet make transactions cheaper than Ethereum?',
      options: [
        'By reducing the security standards for transactions',
        'By batching thousands of transactions into a single proof posted to Ethereum',
        'By storing transactions off-chain permanently and never touching Ethereum',
        'By using a different consensus mechanism that requires less energy',
      ],
      correct: 1,
      hint: 'Think about cost-sharing. If 10,000 people each pay £0.01 to share a taxi receipt, the total cost is much lower per person than if each person files their own taxi claim.',
      explanation: 'Starknet batches thousands of transactions and posts a single STARK proof to Ethereum. The proof verification cost on Ethereum is shared across all transactions in the batch, making each individual transaction tiny in cost.',
    },
    {
      question: 'What does ZK stand for in ZK-rollup?',
      options: [
        'Zero-Knowledge',
        'Zero-Keying',
        'Zeta-Knowledge',
        'Zero-Cost',
      ],
      correct: 0,
      hint: 'It\'s a type of cryptography where you prove something is true without revealing all the details of how you know it.',
      explanation: 'ZK stands for Zero-Knowledge. In a ZK proof, a prover demonstrates that a statement is true (like "all these transactions are valid") without the verifier needing to see all the underlying data. Starknet uses STARKs — a specific type of ZK proof.',
    },
    {
      question: 'If Starknet goes offline for an hour, what happens to the security of your funds?',
      options: [
        'Your funds are lost because Starknet holds them',
        'Your funds are safe because the state is proven on Ethereum and cannot be altered',
        'Your funds are at risk because Ethereum won\'t know about your balance',
        'Your funds are frozen until Starknet comes back online',
      ],
      correct: 1,
      hint: 'Think about which chain holds the final proof of who owns what.',
      explanation: 'Starknet periodically posts STARK proofs to Ethereum. Even if Starknet\'s sequencer (the component that batches transactions) goes offline, the proven state on Ethereum is immutable. Your funds remain safe.',
    },
    {
      question: 'What is a "sequencer" on Starknet?',
      options: [
        'A user who verifies other users\' transactions',
        'The component that batches and orders Starknet transactions before proving them to Ethereum',
        'A smart contract that holds user funds',
        'The Ethereum node that verifies STARK proofs',
      ],
      correct: 1,
      hint: 'Think of a restaurant kitchen — it takes all the orders (transactions), prepares them in batches, and sends them out. The sequencer does the same for Starknet.',
      explanation: 'The sequencer is the component responsible for receiving transactions, ordering them, executing them, and bundling them into batches to be proved to Ethereum. It is analogous to a block producer on Ethereum.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You are explaining Starknet to a friend who asks: "If it\'s cheaper, doesn\'t that mean it\'s less secure?" Write a 3-sentence response that is accurate and jargon-free.',
      scoringCriteria: [
        'Correctly states that Starknet security comes from Ethereum',
        'Mentions STARK proofs or cryptographic verification (without requiring the term "ZK")',
        'Does not claim Starknet is identical to Ethereum — accurately notes it is a Layer 2',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to transfer $10,000 of USDC. They are considering: (A) Ethereum mainnet for $12 fee, (B) Starknet for $0.01 fee. What questions should they ask before choosing Starknet?',
      scoringCriteria: [
        'Asks about bridge risk or whether funds are already on Starknet',
        'Considers finality time or settlement guarantees',
        'Does not dismiss Starknet security — correctly notes it inherits Ethereum security',
      ],
    },
    {
      type: 'judgment-escalation',
      scenario: 'A journalist writes: "Starknet is a completely separate blockchain from Ethereum with its own security model." Is this accurate? Correct any errors in one paragraph.',
      scoringCriteria: [
        'Correctly identifies "completely separate" as the error',
        'Explains that Starknet uses Ethereum for security via STARK proofs',
        'Acknowledges Starknet does have its own execution environment and sequencer',
      ],
    },
  ],

  links: [{ label: 'Starknet.io', url: 'https://www.starknet.io' }],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 292 — ZK-Proofs Explained
// ─────────────────────────────────────────────────────────────────────────────
const L292: StarknetIslandLevel = {
  id: 292, mechanic: 'memory', tier: 'pro',
  topic: 'ZK-Proofs: Proving Without Revealing',

  explanation: `
Imagine you've found Waldo in a Where's Waldo book. Your friend doesn't believe you. To prove it without spoiling the puzzle, you cut a large hole in a piece of cardboard and hold it over the page — the hole shows exactly where Waldo is, but your friend can't see the rest of the page. You've proven you know where Waldo is, without revealing anything else. This is a Zero-Knowledge proof.

In cryptography, a ZK proof lets a prover convince a verifier that a statement is true without revealing any information beyond the statement itself. Examples: "I know the password" (without saying what it is), "I'm over 18" (without revealing my date of birth), "all these 10,000 transactions are valid" (without the verifier re-running all 10,000).

That last example is exactly what Starknet does. Rather than asking Ethereum to re-run every single transaction, Starknet runs them, generates a STARK proof (a mathematical certificate of correctness), and sends only that proof to Ethereum. Ethereum verifies the certificate — which takes milliseconds — and confirms everything is valid.

The prover does the heavy work. The verifier does almost nothing. This is why ZK-rollups can scale: proving is done off-chain (Starknet), verifying is cheap on-chain (Ethereum).
  `.trim(),

  fact: 'A ZK proof lets you prove a statement is true without revealing the underlying data. Starknet uses STARK proofs to prove thousands of transactions are valid in a single step.',
  plain: 'Prove Waldo is there without showing the book. Prove transactions are valid without re-running them. A STARK proof is the mathematical certificate that makes this possible.',
  stars: [420, 520, 650], target: 650, coins: 42,
  glossaryWord: 'zkProof',

  examples: [
    {
      contextTag: '[Age verification, Web2 context]',
      scenario: 'An online bar wants to verify you are over 18. Traditionally, you upload your full passport — they now have your name, date of birth, address, nationality.',
      outcome: 'With a ZK proof, you prove "I am over 18" without revealing your date of birth. The verifier gets a yes/no answer. Nothing else. This is ZK applied to identity.',
    },
    {
      contextTag: '[Transaction batching, Starknet]',
      scenario: '10,000 users make transactions on Starknet. Starknet must prove all 10,000 are valid to Ethereum. Without ZK: Ethereum re-runs all 10,000 (very expensive). With ZK: Starknet generates one STARK proof.',
      outcome: 'Ethereum receives one proof. It verifies the proof in milliseconds. All 10,000 transactions are confirmed as valid. Cost to Ethereum: one verification. Cost to users: shared across 10,000 people — fractions of a cent each.',
    },
    {
      contextTag: '[Soundness and completeness, researcher]',
      scenario: 'A researcher asks: "How do we know a ZK proof is trustworthy? Could Starknet generate a fake proof that Ethereum accepts?"',
      outcome: 'A valid ZK proof system has two guarantees: soundness (a fake proof cannot pass verification — the math ensures this) and completeness (a genuine proof will always pass). STARK proofs are cryptographically sound — a fraudulent batch cannot be proved without solving a problem that would take longer than the universe has existed.',
    },
  ],

  keyTakeaway: 'A ZK proof proves a statement is true without revealing how — Starknet uses this to prove thousands of transactions are valid in one cheap step on Ethereum.',

  guidedPractice: [
    {
      question: 'In the Where\'s Waldo analogy, what does the "hole in the cardboard" represent in a Starknet context?',
      options: [
        'The private key that signs a transaction',
        'The STARK proof that reveals only "all transactions are valid" without showing the transaction data',
        'The Ethereum smart contract that holds user funds',
        'The block of transactions before they are sent to Ethereum',
      ],
      correct: 1,
      hint: 'The hole shows just enough to prove the point — nothing more. What does a STARK proof show to Ethereum?',
      explanation: 'The hole in the cardboard is the ZK proof. It reveals only one piece of information (Waldo is there / all transactions are valid) without exposing the rest of the book (the full transaction details). The STARK proof tells Ethereum "all valid" without Ethereum needing to see each transaction.',
    },
    {
      question: 'What is "soundness" in a ZK proof system?',
      options: [
        'The ability of the prover to generate proofs quickly',
        'The guarantee that a fake proof cannot pass verification',
        'The size of the proof relative to the data it represents',
        'The requirement for a trusted party to set up the proof system',
      ],
      correct: 1,
      hint: 'Think about what would happen if an attacker tried to submit a fraudulent batch. What prevents Ethereum from accepting it?',
      explanation: 'Soundness means: if the statement is false, no cheating prover can generate a proof that a verifier will accept. For Starknet, this means a fraudulent batch of transactions cannot be proved — Ethereum will reject any invalid STARK proof.',
    },
    {
      question: 'Who does the heavy computational work in a ZK-rollup?',
      options: [
        'Ethereum validators, who re-run every transaction',
        'The user, who generates a proof for each transaction',
        'The Starknet prover, off-chain',
        'The Starknet sequencer and Ethereum split the work equally',
      ],
      correct: 2,
      hint: 'The point of ZK is to move expensive work away from the expensive layer (Ethereum). Who does that expensive work?',
      explanation: 'The Starknet prover runs off-chain and performs the computationally expensive task of generating STARK proofs. Ethereum only does the cheap task of verifying the proof. This is the key scalability insight: proving is expensive but done once; verification is cheap and done on-chain.',
    },
    {
      question: 'Can Starknet prove a fraudulent transaction batch to Ethereum?',
      options: [
        'Yes, if the sequencer is compromised',
        'No — the soundness property of STARK proofs makes this mathematically impossible',
        'Yes, but only if 51% of validators agree',
        'Yes, but users can dispute it within a 7-day challenge window',
      ],
      correct: 1,
      hint: 'This is what distinguishes ZK-rollups from optimistic rollups. Optimistic rollups rely on challenges. ZK-rollups rely on math.',
      explanation: 'STARK proofs are sound — a fraudulent proof cannot be generated that Ethereum will accept. This is the key advantage over optimistic rollups (which rely on a 7-day challenge window). ZK-rollups have instant mathematical finality.',
    },
    {
      question: 'What is the difference between a ZK-rollup and an optimistic rollup?',
      options: [
        'ZK-rollups are faster; optimistic rollups are cheaper',
        'ZK-rollups use cryptographic proofs for instant finality; optimistic rollups assume validity and allow a fraud challenge window',
        'ZK-rollups store data off-chain; optimistic rollups store data on Ethereum',
        'ZK-rollups require a trusted setup; optimistic rollups do not',
      ],
      correct: 1,
      hint: 'The name "optimistic" is a clue — it means "we assume no fraud and wait to see if someone challenges it."',
      explanation: 'Optimistic rollups assume transactions are valid and wait 7 days for a fraud proof. ZK-rollups prove validity mathematically before submission — no waiting, no challenges. Ethereum accepts a ZK proof immediately. This is why ZK-rollups have faster finality.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain ZK proofs to a 12-year-old who knows nothing about blockchain. You have 3 sentences. Make it accurate and memorable.',
      scoringCriteria: [
        'Uses an analogy or real-world example (not just a definition)',
        'Captures the core idea: proving something is true without showing everything',
        'Does not use unexplained jargon (ZK, cryptography, hash, etc.)',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starknet posts a STARK proof to Ethereum every 2 hours covering 50,000 transactions. The proof verification costs 0.1 ETH. A single Ethereum transaction costs 0.003 ETH. Calculate: (1) cost per transaction via Starknet, (2) cost of 50,000 individual Ethereum transactions.',
      scoringCriteria: [
        'Starknet cost per tx correctly calculated: 0.1 ETH / 50,000 = 0.000002 ETH',
        'Ethereum total correctly calculated: 50,000 × 0.003 = 150 ETH',
        'Correctly identifies the 75,000× cost difference',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A developer proposes: "We don\'t need ZK proofs. We can just trust Starknet to be honest about which transactions happened." What risks does this create?',
      scoringCriteria: [
        'Correctly identifies that trust-based systems create a single point of failure',
        'Notes that without proofs, Ethereum cannot verify Starknet\'s claims',
        'Mentions at least one concrete attack: fake balances, fake transactions, or theft',
      ],
    },
  ],

  links: [{ label: 'STARK primer', url: 'https://starkware.co/stark/' }],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 293 — Account Abstraction
// ─────────────────────────────────────────────────────────────────────────────
const L293: StarknetIslandLevel = {
  id: 293, mechanic: 'chain', tier: 'pro',
  topic: 'Account Abstraction: The Programmable Wallet',

  explanation: `
On Ethereum, your wallet works like a standard padlock — one key, one lock. You cannot change the lock without replacing the entire wallet. You cannot let someone else pay your fees. You cannot log in with your fingerprint. These limitations are hardcoded into Ethereum's design.

Starknet was built differently. Every single account on Starknet is a smart contract — a programmable piece of code that defines the rules for how that account operates. This is called Account Abstraction, often abbreviated AA.

Because your account is a program, you can customise its rules:
- Log in with email or social accounts, no seed phrase needed (Privy integration)
- Let someone else pay your transaction fees — the AVNU Paymaster covers costs on your behalf
- Set a daily spending limit — any transaction above £500 requires two approvals
- Recover your wallet through trusted friends or family, without a seed phrase
- Use your phone's Face ID or fingerprint to sign transactions

On Ethereum, these features require complex bolt-on workarounds. On Starknet, they are native — built into every wallet from day one.

The Starkzap SDK uses account abstraction to create wallets that feel like Web2 apps but live on-chain.
  `.trim(),

  fact: 'Every Starknet account is a smart contract. This is Account Abstraction — it allows programmable wallet logic: social login, gasless transactions, spend limits, and social recovery are all native.',
  plain: 'On Ethereum, your wallet is a standard lock. On Starknet, your wallet is a programmable safe — you set the rules for how it opens.',
  stars: [440, 545, 680], target: 680, coins: 44,
  simulatorLesson: 'starkzap-wallet',

  examples: [
    {
      contextTag: '[New user, Web2-familiar]',
      scenario: 'Sarah has never used crypto before. She downloads an app using Starknet + Privy. It asks for her Gmail address to create a wallet.',
      outcome: 'Sarah signs in with Gmail. Privy creates a Starknet smart contract account for her in the background. She has no seed phrase. If she loses her phone, she logs in again with Gmail and her wallet is restored. Her first transaction is free — covered by the AVNU Paymaster. She didn\'t know blockchain was involved.',
    },
    {
      contextTag: '[Security-conscious user, guardian setup]',
      scenario: 'David has £10,000 of STRK. He\'s worried about losing access. He sets up Argent X with a guardian — his hardware wallet.',
      outcome: 'Any transaction above 1,000 STRK requires both his phone AND his hardware wallet to sign. If David loses his phone, the guardian (hardware wallet) can recover the account. No seed phrase is required because the account is a smart contract with programmed recovery rules.',
    },
    {
      contextTag: '[Game developer, session keys]',
      scenario: 'A blockchain game requires users to sign a transaction for every move. Players must press "Approve" 50 times per game session. This is unusable.',
      outcome: 'The developer implements session keys — a feature of Starknet account abstraction. Players approve a session once at the start of gameplay. The session key then signs individual moves automatically for 2 hours. Players experience the game normally. No approval pop-ups.',
    },
  ],

  keyTakeaway: 'Account Abstraction means every Starknet wallet is a programmable smart contract — enabling social login, gasless transactions, spend limits, and recovery without seed phrases.',

  guidedPractice: [
    {
      question: 'What does it mean that every Starknet account is a "smart contract"?',
      options: [
        'Starknet accounts hold more tokens than Ethereum accounts',
        'The rules for how a Starknet account operates are programmable code, not hardcoded protocol rules',
        'Starknet accounts require a lawyer to create them',
        'Starknet accounts automatically earn interest on all deposits',
      ],
      correct: 1,
      hint: 'Think about what "smart contract" means: code that executes automatically according to rules. Your wallet is now that code.',
      explanation: 'A smart contract is programmable code on the blockchain. Because every Starknet account is a smart contract, the rules of how it operates (who can sign transactions, what fees to pay, how to recover) are customisable code — not fixed protocol rules like on Ethereum.',
    },
    {
      question: 'What is a "session key"?',
      options: [
        'A temporary private key that can sign transactions within a defined scope and time period',
        'A password used to log into the Starknet block explorer',
        'A unique identifier for each transaction on Starknet',
        'The master private key stored on the user\'s device',
      ],
      correct: 0,
      hint: 'Think about logging into a hotel room — you get a keycard that works for your stay, then expires. A session key is similar.',
      explanation: 'A session key is a temporary, scoped key that can sign transactions within specific rules — e.g., "sign up to 10 STRK transfers for the next 2 hours only." This is how blockchain games work smoothly: one master approval generates a session key that handles all in-game moves.',
    },
    {
      question: 'A user loses their phone which has their Argent X wallet. They have a guardian set up. What can they do?',
      options: [
        'Nothing — the funds are permanently lost without the phone',
        'Contact Argent customer service to recover the account',
        'Use the guardian to verify their identity and recover the account on a new device',
        'Submit a police report and wait for Starknet to freeze the account',
      ],
      correct: 2,
      hint: 'Guardian recovery is the whole point of setting one up. What does a guardian do?',
      explanation: 'Guardians are designated addresses (a hardware wallet, trusted person, or recovery service) that can help recover your account. Because the account is a smart contract, recovery rules are programmed in — losing your phone is not catastrophic if a guardian is set up.',
    },
    {
      question: 'How does the AVNU Paymaster enable gasless transactions for users?',
      options: [
        'It removes all transaction fees from Starknet permanently',
        'It pays the transaction fee on behalf of the user, recovering costs through app revenue or a small trade fee',
        'It uses the user\'s STRK balance without telling them',
        'It defers the fee payment to the end of the month like a credit card',
      ],
      correct: 1,
      hint: 'Think about who pays the bill — if the user pays $0, someone else must cover it. Who and how?',
      explanation: 'The AVNU Paymaster is a service that pays transaction fees on behalf of users. Apps integrate it to cover their users\' gas costs. AVNU recovers costs through swap fees or arrangements with app developers. Because Starknet accounts are smart contracts, the "who pays fees" rule is programmable.',
    },
    {
      question: 'On Ethereum, can users set a daily spending limit on their wallet?',
      options: [
        'Yes — Ethereum has this built in as an EIP standard',
        'No — Ethereum Externally Owned Accounts have fixed, unmodifiable rules',
        'Yes — any wallet app can add this feature at the protocol level',
        'No — spending limits require a multi-sig which costs thousands to deploy',
      ],
      correct: 1,
      hint: 'Think about the padlock analogy. Can you reprogram a padlock?',
      explanation: 'Ethereum\'s base accounts (EOAs) have fixed, hardcoded rules — one key, no programmable logic. Spending limits, guardians, and session keys would require smart contract wallets bolted on top. On Starknet, every account is already a smart contract, so these features are built in.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A user has no guardian set up on their Argent X wallet. They lose their phone and never wrote down a seed phrase. What is the outcome? What should they have done?',
      scoringCriteria: [
        'Correctly states the funds are at risk or lost without recovery method',
        'Correctly recommends setting up a guardian before this happens',
        'Mentions at least one guardian option: hardware wallet, trusted person, or recovery service',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Solidity developer asks: "Why should I learn Starknet\'s AA model if ERC-4337 brings account abstraction to Ethereum?" Give a 3-sentence answer that is accurate and specific.',
      scoringCriteria: [
        'Notes that Starknet AA is native (every account), not opt-in like ERC-4337',
        'Mentions at least one capability AA enables that is simpler on Starknet than ERC-4337',
        'Does not dismiss ERC-4337 — acknowledges both are valid approaches',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A game has 10,000 daily active users. Each plays 20 moves per session. Without session keys: 200,000 approval prompts per day. With session keys: 10,000 approval prompts per day. What is the UX improvement factor? What is the risk that session keys introduce?',
      scoringCriteria: [
        'Correctly calculates 20× reduction in approval prompts',
        'Identifies that session keys give the app signing authority within scope',
        'Correctly notes that a compromised session key can act within its scope — not beyond',
      ],
    },
  ],

  links: [{ label: 'Argent X', url: 'https://www.argent.xyz' }, { label: 'AA docs', url: 'https://docs.starknet.io/architecture-and-concepts/accounts/' }],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 294 — STRK Token
// ─────────────────────────────────────────────────────────────────────────────
const L294: StarknetIslandLevel = {
  id: 294, mechanic: 'match3', tier: 'pro',
  topic: 'The STRK Token: Fuel, Stake, and Vote',

  explanation: `
When Ethereum launched in 2015, its native token ETH served three purposes: pay transaction fees, reward validators securing the network, and act as collateral in DeFi. STRK plays the same role on Starknet.

STRK is Starknet's native token. It has three core functions. First, transaction fees — every transaction on Starknet requires a tiny STRK payment. This is called gas. Gas prevents spam and rewards the sequencer (the component that batches transactions). Second, staking — validators lock up STRK to participate in securing Starknet. They earn STRK rewards for doing this correctly. Third, governance — STRK holders vote on protocol upgrades via Snapshot, a voting platform. Larger STRK holders have more voting weight.

The total supply of STRK is 10 billion, with a significant portion allocated to the Starknet Foundation for ecosystem grants, a portion to early investors and team (with vesting schedules), and a portion distributed to the community through staking rewards and airdrops.

Unlike Ethereum's ETH, STRK has a defined inflation schedule tied to staking rewards. Validators earn new STRK as rewards — this is inflation, but it rewards those who actively secure the network.

Current APY for staking: approximately 5–12% depending on the pool.
  `.trim(),

  fact: 'STRK is Starknet\'s native token with three roles: pay gas fees, stake to secure the network, and vote on governance. Total supply: 10 billion.',
  plain: 'Think of STRK like ETH but for Starknet. You need it to pay fees, you can earn it by staking, and you use it to vote on how Starknet evolves.',
  stars: [460, 565, 700], target: 700, coins: 46,

  examples: [
    {
      contextTag: '[New holder, understanding utility]',
      scenario: 'Lena buys 500 STRK. She wants to know what she can do with it.',
      outcome: 'Lena discovers three uses: (1) Pay gas on Starknet — she holds 10 STRK aside for fees. (2) Stake 400 STRK in a validator pool earning 8.3% APY. (3) Vote on governance proposals using her 100 remaining STRK. Her staked tokens earn rewards while she sleeps.',
    },
    {
      contextTag: '[Validator, understanding staking economics]',
      scenario: 'A validator runs a Starknet node and opens a delegation pool. They set a 5% commission. A delegator stakes 1,000 STRK at 9% gross APY.',
      outcome: 'Gross annual rewards: 1,000 × 9% = 90 STRK. Validator commission: 90 × 5% = 4.5 STRK. Delegator net rewards: 85.5 STRK. Net APY for delegator: 8.55%. The validator earns 4.5 STRK plus their own staking rewards.',
    },
    {
      contextTag: '[Governance participant, SNIP vote]',
      scenario: 'Starknet proposes a change to the fee mechanism (SNIP-12). STRK holders vote on Snapshot. The proposal passes with 78% in favour.',
      outcome: 'The governance vote signals community support. StarkWare implements the change in the next protocol upgrade. STRK holders who voted had their votes weighted by their token balance. Holders who did not stake still vote using their wallet balance.',
    },
  ],

  keyTakeaway: 'STRK is the fuel, stake, and vote token of Starknet — hold it to pay fees, lock it to earn rewards, and use it to shape the protocol\'s future.',

  guidedPractice: [
    {
      question: 'What happens if STRK price falls 50% but gas costs in USD terms stay the same?',
      options: [
        'Gas becomes 50% cheaper in STRK terms — you pay twice as many STRK for the same USD gas cost',
        'Gas becomes 50% cheaper in USD — transaction fees automatically halve',
        'Gas becomes 50% more expensive in STRK — you pay twice as many tokens',
        'Gas is unaffected because it is denominated in USD on Starknet',
      ],
      correct: 2,
      hint: 'Gas is priced in STRK. If STRK is worth less in USD, you need more STRK to pay the same USD equivalent.',
      explanation: 'Gas is denominated in STRK. If STRK price falls 50%, each STRK is worth half as much in USD. To pay the same real-world transaction cost, users need twice as many STRK. This is why high network usage and token price both affect transaction economics.',
    },
    {
      question: 'A validator pool has 5% commission and 10% gross APY. You stake 500 STRK. What are your annual net rewards?',
      options: [
        '50 STRK (gross, ignoring commission)',
        '47.5 STRK (net after 5% commission on rewards)',
        '45 STRK (net after 10% commission on rewards)',
        '25 STRK (half of gross due to 50% commission)',
      ],
      correct: 1,
      hint: 'Commission is taken from your rewards, not your staked amount. Calculate gross rewards first, then deduct the commission percentage.',
      explanation: 'Gross rewards: 500 × 10% = 50 STRK. Commission: 50 × 5% = 2.5 STRK. Net rewards: 47.5 STRK. Your staked 500 STRK remains intact — commission only applies to the rewards earned.',
    },
    {
      question: 'What is "governance" in the context of STRK?',
      options: [
        'The process by which StarkWare decides all protocol changes without community input',
        'STRK holders voting on protocol changes via Snapshot, with votes weighted by token balance',
        'A committee of 10 elected validators who make all network decisions',
        'An automated system that changes protocol parameters based on network metrics',
      ],
      correct: 1,
      hint: 'Think about how shareholders vote in a company. STRK holders are similar to shareholders.',
      explanation: 'Governance means STRK holders vote on protocol upgrades (called SNIPs — Starknet Improvement Proposals). Votes happen on Snapshot, and each holder\'s vote is weighted by their STRK balance. This gives the community influence over Starknet\'s direction.',
    },
    {
      question: 'Why does Starknet have token inflation (new STRK created over time)?',
      options: [
        'To fund StarkWare\'s operating budget',
        'To dilute early investors and distribute tokens more widely',
        'To reward validators and delegators who secure the network with staking',
        'There is no inflation — STRK supply is fixed at 10 billion',
      ],
      correct: 2,
      hint: 'Think about why Ethereum creates new ETH for validators. The same incentive logic applies.',
      explanation: 'Staking rewards are paid in newly created STRK — this is controlled inflation. The purpose is to incentivise validators to lock up capital and run nodes that secure Starknet. Without inflation-funded rewards, validators would have no economic incentive to stake.',
    },
    {
      question: 'You hold 1,000 STRK. You want to earn staking rewards without giving up governance rights. Is this possible?',
      options: [
        'No — staked STRK cannot be used for governance voting',
        'Yes — staked STRK can still be used for governance voting on most Starknet governance systems',
        'No — you must choose between staking and governance participation',
        'Only if you hold your STRK in an Argent X wallet specifically',
      ],
      correct: 1,
      hint: 'Staking and governance are separate mechanisms. Staking is locking tokens with a validator. Governance is voting. Check whether one precludes the other.',
      explanation: 'On most Starknet governance implementations, staked STRK retains voting power. You can stake to earn rewards AND participate in governance with the same tokens. The specific mechanism depends on the governance platform — but the intent is not to force holders to choose between economic participation and governance.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have 2,000 STRK. Pool A offers 11% APY, 8% commission. Pool B offers 9% APY, 2% commission. Which gives higher net annual rewards? Show your working.',
      scoringCriteria: [
        'Pool A net: 2000 × 11% × (1-8%) = 202.4 STRK',
        'Pool B net: 2000 × 9% × (1-2%) = 176.4 STRK',
        'Correctly identifies Pool A as higher net despite higher commission',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user stakes all 10,000 STRK they own. An urgent NFT mint launches in 2 weeks. The unbonding period is 21 days. What risk did they fail to consider?',
      scoringCriteria: [
        'Correctly identifies liquidity risk — funds locked during unbonding',
        'Notes the 21-day unbonding period prevents access during the NFT mint',
        'Recommends keeping a liquid reserve for unexpected opportunities',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A journalist asks: "Is STRK just a speculative asset like a meme coin?" Write a 2-sentence response that accurately describes STRK\'s utility without hype.',
      scoringCriteria: [
        'Mentions at least two of the three utility functions: fees, staking, governance',
        'Does not make price predictions or use promotional language',
        'Accurately contrasts utility tokens with speculative assets',
      ],
    },
  ],

  links: [{ label: 'STRK staking', url: 'https://www.starknet.io/staking' }],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 295 — Cairo Language
// ─────────────────────────────────────────────────────────────────────────────
const L295: StarknetIslandLevel = {
  id: 295, mechanic: 'memory', tier: 'pro',
  topic: 'Cairo: The Language Built for Proofs',

  explanation: `
When JavaScript was created in 1995, it was designed for one purpose: making web pages interactive. It wasn't designed for proofs, safety, or financial precision. Using JavaScript to write financial contracts would be like using a butter knife to perform surgery — it's a tool, but not the right tool.

Cairo is a programming language designed from the ground up for one specific purpose: writing programs whose execution is automatically verifiable by a ZK proof. This means every Cairo program produces a mathematical trace — a record of every step it took — that can be verified by a STARK prover without re-running the program.

This has a powerful consequence: if you write a Cairo program that processes 10,000 token transfers, anyone can verify that all 10,000 transfers happened correctly by checking the proof — without re-running all 10,000 calculations. This is why Starknet uses Cairo and nothing else.

Cairo is similar to Rust in syntax (for those who know it) but different in one fundamental way: its type system is designed around field elements — the mathematical objects that ZK circuits use natively. The main native type is felt252 (a field element with 252-bit precision).

Cairo's toolchain: Scarb (build tool, like cargo for Rust), Starknet Foundry (testing framework), Starkli (CLI deployment tool).
  `.trim(),

  fact: 'Cairo is Starknet\'s native programming language, designed specifically for provable programs. Every Cairo program produces an execution trace verifiable by a STARK proof.',
  plain: 'Cairo is to Starknet what Solidity is to Ethereum — but with one superpower: every program it runs is automatically ZK-verifiable.',
  stars: [480, 590, 735], target: 735, coins: 48,
  glossaryWord: 'cairo',

  examples: [
    {
      contextTag: '[Developer choosing a language]',
      scenario: 'A developer writes a token transfer function in both Solidity (Ethereum) and Cairo (Starknet). Both compile and run correctly.',
      outcome: 'The key difference: the Cairo version produces an execution trace that STARK provers can verify. A verifier can confirm 1,000 transfers happened correctly without re-executing them. The Solidity version requires Ethereum validators to re-run the computation — it cannot be compressed into a proof.',
    },
    {
      contextTag: '[Type safety, financial contract]',
      scenario: 'A Solidity developer writes a token contract and makes a subtraction error that allows balances to underflow (go negative). This has caused real exploits.',
      outcome: 'In Cairo, the type system makes underflow impossible at the compiler level — u256 subtraction that would go below zero causes a compile-time or runtime panic before the transaction executes. The wrong state is never committed on-chain.',
    },
    {
      contextTag: '[Toolchain, new developer]',
      scenario: 'A developer new to Starknet asks: "What do I need to install to write, test, and deploy a Cairo contract?"',
      outcome: 'The answer: Scarb (builds the Cairo project), Starknet Foundry / snforge (runs tests), Starkli (deploys to Sepolia or mainnet). The Starkzap SDK connects the deployed contract to a frontend. Four tools, each with one job.',
    },
  ],

  keyTakeaway: 'Cairo is the only language that compiles to STARK-provable programs — every function you write is automatically verifiable without re-execution.',

  guidedPractice: [
    {
      question: 'What is felt252?',
      options: [
        'A 252-bit floating point number, Cairo\'s equivalent of JavaScript\'s float',
        'A field element — the native type of Cairo\'s ZK circuit — with 252-bit precision',
        'A 252-character string type used for wallet addresses',
        'A compression format for Cairo bytecode',
      ],
      correct: 1,
      hint: 'The name is "felt" (field element) + "252" (bit size). Field elements are the native mathematical objects in ZK circuits.',
      explanation: 'felt252 is a field element — the fundamental data type in Cairo\'s ZK circuit. It can hold values from 0 to P-1 where P is a large prime (~2^251). Unlike integers, arithmetic on felt252 is modular. For precise token math, u256 is preferred because its overflow behaviour is more predictable.',
    },
    {
      question: 'What is Scarb?',
      options: [
        'Starknet\'s testing framework for Cairo contracts',
        'The CLI tool for deploying contracts to Starknet',
        'Cairo\'s package manager and build tool — equivalent to cargo for Rust',
        'The language server for Cairo IDE support',
      ],
      correct: 2,
      hint: 'Think about what cargo does for Rust. Scarb does the same for Cairo.',
      explanation: 'Scarb is Cairo\'s package manager and build tool. You define your project in a Scarb.toml file, specify dependencies, and run scarb build to compile. It is the equivalent of cargo (Rust) or npm (JavaScript).',
    },
    {
      question: 'Why can\'t Ethereum use Solidity contracts as STARK-provable programs?',
      options: [
        'Solidity is not open-source, so STARK provers cannot access it',
        'Solidity was not designed to produce an execution trace compatible with STARK circuits',
        'Ethereum validators already verify Solidity — it does not need proofs',
        'Solidity contracts are too small for STARK provers to process',
      ],
      correct: 1,
      hint: 'Think about what a ZK proof requires: a program that produces a structured, verifiable trace. Was Solidity designed for this?',
      explanation: 'Solidity was designed for the Ethereum Virtual Machine (EVM), not for ZK circuits. The EVM\'s computation model is not efficiently provable by STARK provers without modification. Cairo is designed from scratch to compile to CASM (Cairo Assembly), which is what STARK provers natively verify.',
    },
    {
      question: 'A developer writes a Cairo function with a subtraction that could go below zero. What happens?',
      options: [
        'The contract deploys successfully and the subtraction silently wraps to a very large number',
        'The compiler refuses to compile if the subtraction is provably unsafe, or the runtime panics before state is committed',
        'The transaction fails silently and the state change is not committed',
        'The developer must manually add overflow checks — Cairo does not handle this automatically',
      ],
      correct: 1,
      hint: 'Cairo is a "safe" language. Think about what "safe" means in terms of invalid states being prevented.',
      explanation: 'Cairo\'s type system prevents many classes of unsafe operations at compile time. For u256 subtraction that would underflow, the Cairo runtime panics — the transaction fails before any state is committed on-chain. This is fundamentally different from the silent underflow bugs that have caused Solidity exploits.',
    },
    {
      question: 'What does Starknet Foundry (snforge) do?',
      options: [
        'Deploys Cairo contracts to Starknet mainnet',
        'Compiles Cairo source code to CASM bytecode',
        'Provides testing infrastructure for Cairo smart contracts — unit tests, fuzzing, cheatcodes',
        'Generates STARK proofs for Starknet transactions',
      ],
      correct: 2,
      hint: 'The name "Foundry" mirrors Ethereum Foundry — a testing framework. What does a testing framework do?',
      explanation: 'Starknet Foundry (snforge) is the testing framework for Cairo. It lets you write unit tests in Cairo itself, use cheatcodes (simulate different callers, timestamps), run fuzz tests, and test against a forked version of Starknet. Analogous to Ethereum Foundry for Solidity.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Solidity developer is considering learning Cairo. They ask: "Is Cairo worth learning or should I wait until Starknet supports Solidity?" Give an honest 3-sentence answer.',
      scoringCriteria: [
        'Correctly notes Cairo is required for Starknet-native contracts (not Solidity)',
        'Mentions Kakarot as the EVM compatibility layer without claiming it replaces Cairo for new development',
        'Gives a balanced answer — notes the learning curve and the demand advantage',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Cairo contract has this storage: LegacyMap::<ContractAddress, u256> for balances. A user calls transfer(recipient, 1000). What state changes? What event should be emitted?',
      scoringCriteria: [
        'Correctly identifies: caller\'s balance decreases by 1000, recipient\'s increases by 1000',
        'Correctly names the Transfer event with (from, to, amount) fields',
        'Notes the contract must check caller has sufficient balance before changing state',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A developer writes a Cairo contract but skips writing tests, saying "the compiler already catches bugs." What risks remain?',
      scoringCriteria: [
        'Correctly notes that Cairo\'s compiler catches type errors, not logic errors',
        'Gives at least one example of a logic bug the compiler cannot catch (wrong recipient, wrong amount calculation)',
        'Correctly recommends snforge tests for logic verification',
      ],
    },
  ],

  links: [{ label: 'Cairo Book', url: 'https://book.cairo-lang.org' }],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVELS 296–310: Core content with upgraded explanation + guided practice
// (Following the same standard as 291-295 above)
// ─────────────────────────────────────────────────────────────────────────────

// Helper: create a level with the upgraded standard but shorter body
// for levels 296-310 where we focus on the most critical upgrades.
// Full lesson bodies can be expanded to match 291-295 depth in production.

const L296: StarknetIslandLevel = {
  id: 296, mechanic: 'chain', tier: 'pro',
  topic: 'Your First Starknet Wallet',
  explanation: `
When online banking launched, opening an account required visiting a branch with identification documents and waiting two weeks. Today you open a bank account on your phone in ten minutes. Starknet wallets are at the same inflection point — and the experience is already closer to the ten-minute phone app than the two-week branch visit.

A Starknet wallet is a smart contract account (from Level 293) that you control. Three main options exist:

Argent X is the most popular choice for general use. You can use email or social login — no seed phrase required if you enable guardian mode. Your account has a guardian (a backup signing method) that can recover access if you lose your device. Install as a browser extension or use it through apps built on the Starkzap SDK.

Braavos is mobile-first. It supports biometric authentication — Face ID and fingerprint — as the primary signing method. No typing private keys. No seed phrases visible by default.

Cartridge Controller is for gaming. It uses passkeys (the same technology as Apple and Google Passkeys) and session keys to make gasless gameplay possible. When you play a Starknet game, Cartridge handles signing invisibly.

The Starkzap SDK can create any of these wallet types programmatically — embedding wallet creation directly into apps, with no redirect or browser extension required.
  `.trim(),
  fact: 'Three main Starknet wallets: Argent X (social login, guardian recovery), Braavos (biometric-first, mobile), Cartridge (gaming, session keys). All are smart contract accounts.',
  plain: 'Choose Argent if you want email login and backup recovery. Choose Braavos if you want Face ID. Choose Cartridge if you\'re gaming. All work on Starknet.',
  stars: [500, 615, 770], target: 770, coins: 50,
  simulatorLesson: 'starkzap-wallet',
  examples: [
    { contextTag: '[First-time user, security priority]', scenario: 'Alex wants maximum security. He creates an Argent X wallet with a hardware wallet as guardian.', outcome: 'Any transaction above 500 STRK requires both his phone and hardware wallet. If either device is lost, the other can recover access. No seed phrase ever written on paper.' },
    { contextTag: '[Mobile-first user]', scenario: 'Priya uses Braavos on her iPhone. She sets up Face ID as her signing method.', outcome: 'Every transaction requires a Face ID scan. No typing. No browser extension. Her wallet is accessible anywhere her iPhone is.' },
    { contextTag: '[Game player]', scenario: 'Marcus starts playing Loot Survivor 2. The game asks him to connect a Cartridge Controller.', outcome: 'He uses his Google account. Cartridge creates a passkey-based wallet. His first 200 game moves are all gasless via session keys. He approves once at the start.' },
  ],
  keyTakeaway: 'Pick your wallet based on your use case — Argent for general DeFi with recovery, Braavos for biometric mobile, Cartridge for gaming with session keys.',
  guidedPractice: [
    { question: 'Which wallet is best for a user who wants to play blockchain games without signing every move?', options: ['Argent X', 'Braavos', 'Cartridge Controller', 'MetaMask'], correct: 2, hint: 'Session keys are required for seamless gameplay. Which wallet specialises in this?', explanation: 'Cartridge Controller supports session keys — temporary signing permissions that handle in-game transactions automatically. It is designed specifically for this use case.' },
    { question: 'What is guardian recovery in Argent X?', options: ['A backup private key stored on Argent\'s servers', 'A designated address that can help recover your account if you lose access', 'A weekly email with your account balance', 'An automatic backup of all transactions to cloud storage'], correct: 1, hint: 'A guardian is another signing method — it can verify your identity if your primary device is lost.', explanation: 'A guardian is a trusted address (hardware wallet, trusted person, or Argent\'s recovery service) that can authorise account recovery. Because Starknet accounts are smart contracts, recovery logic is programmed in.' },
    { question: 'You want to use a Starknet wallet on iOS with Face ID. Which wallet is designed for this?', options: ['Argent X', 'Braavos', 'Cartridge Controller', 'Starkli'], correct: 1, hint: 'Which wallet positions itself as biometric-first and mobile-native?', explanation: 'Braavos is mobile-first and supports biometric signing — Face ID on iPhone, fingerprint on Android. It is designed to feel like a regular banking app on your phone.' },
    { question: 'What is a passkey?', options: ['A 24-word recovery phrase stored on your device', 'A cryptographic credential tied to your device\'s biometric system, replacing passwords', 'An API key for accessing Starknet RPC endpoints', 'A session token that expires after 30 minutes'], correct: 1, hint: 'Apple, Google, and Microsoft all support passkeys. They replace passwords with device-based authentication.', explanation: 'A passkey is a cryptographic credential created and stored on your device, authenticated using biometrics or device PIN. Cartridge Controller uses passkeys to create a signing experience that feels like logging into an app — no wallet interface visible.' },
    { question: 'Can the Starkzap SDK create Starknet wallets without a browser extension?', options: ['No — a browser extension is always required', 'Yes — Starkzap can create embedded wallets using Privy or direct signers, no extension required', 'Only on desktop, not mobile', 'Only if the app is whitelisted by Argent'], correct: 1, hint: 'The SDK is built for this exact use case — embedding wallets into apps.', explanation: 'The Starkzap SDK integrates with Privy (email/social login) to create wallets that live inside your app. No browser extension, no redirect. The user creates a wallet and starts transacting entirely within the app interface.' },
  ],
  lessonSimulations: [
    { type: 'judgment-riskAssess', scenario: 'A user creates an Argent X wallet, dismisses the guardian setup prompt, and takes a screenshot of their seed phrase. What are the two security mistakes?', scoringCriteria: ['Correctly identifies no guardian as a recovery risk', 'Correctly identifies screenshot as a security risk (screenshots sync to cloud, cloud can be hacked)', 'Provides the correct remediation for both'] },
    { type: 'judgment-dataInterpret', scenario: 'A friend asks: "Which Starknet wallet should I get?" You need more information. What three questions do you ask them before recommending?', scoringCriteria: ['Asks about primary use case (gaming / DeFi / general)', 'Asks about device preference (mobile / desktop)', 'Asks about their comfort with seed phrases vs biometrics'] },
    { type: 'judgment-dataInterpret', scenario: 'Braavos, Argent X, and Cartridge each have 50,000, 200,000, and 30,000 users respectively. A developer is building a DeFi app targeting the largest possible audience. Which wallet should they support first? Which second?', scoringCriteria: ['Correctly identifies Argent X as primary (largest user base)', 'Correctly recommends Braavos second', 'Notes that supporting multiple wallets via Starkzap SDK is straightforward'] },
  ],
  links: [{ label: 'Argent X', url: 'https://www.argent.xyz' }, { label: 'Braavos', url: 'https://braavos.app' }, { label: 'Cartridge', url: 'https://cartridge.gg' }],
};

const L297: StarknetIslandLevel = {
  id: 297, mechanic: 'match3', tier: 'pro',
  topic: 'Gasless Transactions',
  explanation: `
When Uber launched, it solved a frustrating problem: you had to carry cash to pay for taxis. Uber absorbed the payment complexity and let you focus on the ride. Gasless transactions solve the same problem in crypto: users shouldn't need to hold STRK before they can use a Starknet app.

Normally, every blockchain transaction requires a fee paid in the native token. On Starknet, that token is STRK. This creates a chicken-and-egg problem: you need STRK to pay fees, but to get STRK you need to use the app, which requires STRK for fees.

The AVNU Paymaster solves this. It is a third-party service that pays transaction fees on behalf of users. The app developer integrates the paymaster and covers fees from their revenue. The user transacts for free — from their perspective, there is no fee at all.

This is made possible by Starknet's Account Abstraction. Because accounts are smart contracts, the "who pays fees" rule is programmable. The paymaster can be specified as the fee payer in the transaction itself — Ethereum cannot do this natively.

In the Starkzap SDK, enabling gasless transactions is one line of code: feeMode: "sponsored". Every subsequent transaction is automatically routed through the AVNU Paymaster. The user sees nothing — they just interact with the app.
  `.trim(),
  fact: 'The AVNU Paymaster pays gas fees on behalf of users, enabled by Starknet\'s Account Abstraction. In Starkzap SDK: feeMode: "sponsored". The user pays nothing.',
  plain: 'Gasless means the app pays the fee. Users interact freely. Possible only because Starknet accounts are smart contracts — the "who pays" rule is programmable.',
  stars: [520, 640, 800], target: 800, coins: 52,
  simulatorLesson: 'starkzap-gasless',
  examples: [
    { contextTag: '[Consumer app, first-time user]', scenario: 'A DeFi app uses feeMode: "sponsored". A new user signs up with email via Privy and makes their first token swap.', outcome: 'The user pays $0 in fees. The AVNU Paymaster covers the transaction cost. The app covers the paymaster cost through a small swap fee margin. The user\'s experience: click "Swap," wait 2 seconds, done.' },
    { contextTag: '[Developer, integration]', scenario: 'A developer adds feeMode: "sponsored" to their Starkzap wallet connection. They test by sending a transaction on Sepolia.', outcome: 'The transaction executes. The developer\'s fee balance with AVNU is debited. The user\'s STRK balance is untouched. The developer uses AVNU\'s dashboard to top up their fee balance as needed.' },
    { contextTag: '[Business model, understanding costs]', scenario: 'An app has 1,000 daily active users making 5 transactions each. Average fee per transaction: $0.005. Daily paymaster cost: $25.', outcome: 'The app needs to earn more than $25/day to sustain gasless UX. Options: swap fee margin (0.05% on $50,000 daily volume = $25), subscription, or premium features. Gasless is a competitive differentiator worth the cost.' },
  ],
  keyTakeaway: 'Gasless transactions are powered by paymasters — third-party services that pay fees for users. In Starkzap, one line of code enables this for your entire app.',
  guidedPractice: [
    { question: 'What is the "chicken-and-egg" problem that paymasters solve?', options: ['Users need STRK to pay fees, but getting STRK requires using an app that needs STRK for fees', 'Developers need users before they can build, but users need apps before they join', 'Starknet needs validators before it works, but validators need staking rewards first', 'AVNU needs liquidity before pricing swaps, but LPs need fees before providing liquidity'], correct: 0, hint: 'Think about a new user with zero crypto. What do they need to do their first transaction?', explanation: 'New users have no STRK. Without STRK, they can\'t pay fees. Without paying fees, they can\'t transact. Without transacting, they can\'t get STRK. Paymasters break this cycle by paying fees on behalf of users, requiring no STRK from the user to get started.' },
    { question: 'How does feeMode: "sponsored" work in the Starkzap SDK?', options: ['It removes fees from the Starknet network entirely for the user', 'It routes transactions through the AVNU Paymaster, which pays fees on behalf of the user', 'It charges fees in USDC instead of STRK', 'It defers fee payment until the end of the month'], correct: 1, hint: 'Sponsored = someone else sponsors the fee. Who is that someone in the Starkzap context?', explanation: 'feeMode: "sponsored" tells the Starkzap SDK to route transactions through the AVNU Paymaster. The paymaster pays STRK fees to the Starknet network. The developer\'s paymaster account is debited. The user pays nothing.' },
    { question: 'Why is gasless UX only possible on Starknet (natively) and not Ethereum mainnet?', options: ['Ethereum mainnet does not support any form of fee abstraction', 'Ethereum mainnet fees are always paid by the transaction sender, with no native mechanism to specify a fee payer in the transaction', 'Ethereum has paymasters but they are more expensive', 'Gasless UX requires STARK proofs which only Starknet generates'], correct: 1, hint: 'Think about Account Abstraction. Ethereum EOAs have hardcoded fee rules. Starknet smart contract accounts have programmable fee rules.', explanation: 'Ethereum\'s base accounts (EOAs) require the transaction sender to pay fees — this is hardcoded. EIP-4337 adds AA to Ethereum but as a bolt-on. Starknet\'s AA is native — every account is a smart contract and fee-payer designation is programmable at the protocol level.' },
    { question: 'An app has 10,000 users making 3 transactions each per day at $0.003 per transaction. What is the daily paymaster cost?', options: ['$9', '$90', '$900', '$9,000'], correct: 1, hint: '10,000 users × 3 transactions × $0.003 per transaction.', explanation: '10,000 × 3 × $0.003 = $90/day. This is the break-even cost the app must cover through its revenue model. At scale, gasless UX is economically viable if the app monetises even modestly.' },
    { question: 'What happens if the developer\'s AVNU Paymaster account runs out of funds?', options: ['All user transactions fail with an insufficient balance error', 'Transactions fall back to user-paid mode automatically', 'Starknet covers the fees temporarily and bills the developer later', 'Users are prompted to pay fees themselves while the developer tops up'], correct: 0, hint: 'Think about what happens when a credit card runs out of funds — the transaction is declined.', explanation: 'If the paymaster account is depleted, gasless transactions fail. The developer must top up their paymaster balance. Best practice: set up automated top-ups and monitoring alerts before the balance runs out.' },
  ],
  lessonSimulations: [
    { type: 'judgment-dataInterpret', scenario: 'A DeFi app sponsors fees. Data: 5,000 daily users, 4 txs each, $0.004/tx fee, $0.10 revenue per user per day. Is the gasless model profitable? By how much?', scoringCriteria: ['Calculates daily fee cost: 5,000 × 4 × 0.004 = $80', 'Calculates daily revenue: 5,000 × 0.10 = $500', 'Correctly identifies net profit of $420/day and concludes model is profitable'] },
    { type: 'judgment-riskAssess', scenario: 'A developer enables feeMode: "sponsored" for all transactions including large token swaps of $100,000+. What risk does this create?', scoringCriteria: ['Identifies that large transactions may not be worth sponsoring (low margin on large trades)', 'Suggests conditional sponsorship (sponsor only small transactions or specific transaction types)', 'Notes paymaster draining risk if large transactions are frequent'] },
    { type: 'judgment-dataInterpret', scenario: 'A non-technical investor asks: "If gas is free for users, how does the network still work? Someone must be paying." Explain in 3 sentences.', scoringCriteria: ['Correctly explains that fees are paid by the paymaster, not waived', 'Explains that the developer/app covers the paymaster cost', 'Does not imply Starknet operates without fees — accurately states fees are shifted not eliminated'] },
  ],
  links: [{ label: 'AVNU Paymaster', url: 'https://doc.avnu.fi/avnu-paymaster/introduction' }],
};

// Remaining levels 298-310 follow the same pattern.
// For brevity in this file, they use the standard Level interface.
// Full StarknetIslandLevel upgrades for 298-310 should be written
// following the exact same standard as 291-297 above.
// Priority order for full upgrade: 299 (staking), 300 (DeFi), 301 (swaps), 310 (boss).

// REPLACEMENT BLOCK — paste over L298 through the exports section

const L298: StarknetIslandLevel = {
  id: 298, mechanic: 'memory', tier: 'pro',
  topic: 'Bitcoin on Starknet: wBTC, lBTC, tBTC',
  simulatorLesson: 'starkzap-swap',
  explanation: `When Bitcoin launched in 2009, it solved peer-to-peer digital money brilliantly. But Bitcoin sits idle — you cannot use it in DeFi, earn yield automatically, or lend it without a centralised intermediary.

Wrapped Bitcoin solves this. You lock real BTC with a custodian, and they mint an equivalent token on Starknet representing your Bitcoin exactly. This token enters DeFi protocols, earns yield, and swaps — while your real BTC sits in custody.

Three variants exist on Starknet. wBTC (Wrapped Bitcoin) is the oldest and most liquid, managed by BitGo. tBTC (Threshold Bitcoin) is decentralised — a network of nodes collectively holds the keys, not a single custodian. lBTC (Lombard) is the most powerful: your locked Bitcoin earns yield via Babylon Protocol staking while you simultaneously use lBTC in Starknet DeFi.

The Starkzap SDK treats all three as standard tokens. Swap STRK → wBTC on AVNU in one call — the transaction is real, appears on Voyager, and is your first Bitcoin position on Starknet.`,
  fact: 'Three wrapped Bitcoin variants on Starknet: wBTC (BitGo custodian), tBTC (decentralised threshold network), lBTC (Lombard — earns Babylon staking yield). All swappable via AVNU. All real transactions on Starknet.',
  plain: 'Lock real BTC, get a usable token on Starknet. lBTC is the most powerful — the locked BTC earns yield AND you use the token in DeFi simultaneously.',
  stars: [540, 665, 830], target: 830, coins: 54,
  examples: [
    {
      contextTag: '[Bitcoin holder, entering DeFi]',
      scenario: 'Sam has 0.1 BTC and wants yield without selling. He bridges to Starknet as wBTC and deposits into Vesu.',
      outcome: 'Sam earns 3.2% supply APY on his wBTC. His Bitcoin is working. He sold nothing. The Vesu position is visible on Starkscan with his wallet address.',
    },
    {
      contextTag: '[Risk-aware user, decentralisation priority]',
      scenario: 'Anna holds 0.5 BTC and is worried about custodian risk. She researches tBTC.',
      outcome: 'Anna chooses tBTC — the threshold network of nodes collectively controls reserves. No single custodian can run with her funds. Lower liquidity than wBTC, but acceptable for her risk tolerance.',
    },
    {
      contextTag: '[lBTC double yield]',
      scenario: 'A user holds lBTC — BTC locked in Babylon Protocol, represented as lBTC on Starknet. She supplies lBTC to Vesu.',
      outcome: 'She earns two yield streams simultaneously: Babylon BTC staking rewards on the locked BTC, and Vesu supply APY on the lBTC. Both accrue automatically. Impossible with native Bitcoin.',
    },
  ],
  keyTakeaway: 'Wrapped Bitcoin lets you use BTC in Starknet DeFi without selling it — choose wBTC for liquidity, tBTC for trustlessness, lBTC for double yield.',
  guidedPractice: [
    {
      question: 'What happens to your real BTC when you "wrap" it into wBTC?',
      options: [
        'It is burned and destroyed — only the wBTC token survives',
        'It is locked with a custodian and held in reserve — you can redeem wBTC back to BTC',
        'It is moved to the Starknet blockchain natively',
        'It continues to exist independently — wrapping creates new BTC',
      ],
      correct: 1,
      hint: 'Think of a coat check. You hand in your coat, get a ticket. The coat still exists — locked away. The ticket represents it.',
      explanation: 'Wrapping locks real BTC in a reserve. The custodian (BitGo for wBTC) holds the BTC and mints an equivalent wBTC token. You can redeem wBTC for BTC at any time at 1:1 by returning the token and unlocking the reserve.',
    },
    {
      question: 'What is unique about lBTC compared to wBTC and tBTC?',
      options: [
        'lBTC is completely decentralised with no custodian',
        'lBTC earns Bitcoin yield on the locked BTC via Babylon Protocol while the token is used in DeFi',
        'lBTC is cheaper to mint because Lombard subsidises gas fees',
        'lBTC is pegged to the USD not to BTC',
      ],
      correct: 1,
      hint: 'Think about what the locked BTC is doing while you hold lBTC.',
      explanation: 'Lombard stakes the locked BTC in Babylon Protocol, generating native BTC staking rewards on the reserve. You hold lBTC on Starknet and earn DeFi yields there too. Two separate yield sources on the same underlying BTC position.',
    },
    {
      question: 'You execute wallet.swap({ tokenIn: STRK, tokenOut: wBTC }) on Sepolia via Starkzap. Where does this transaction appear?',
      options: [
        'Only inside the app — it is a simulated transaction',
        'On the Bitcoin blockchain as a BTC movement',
        'On Starknet Sepolia (Voyager Sepolia) as a real transaction with a real hash',
        'On Ethereum mainnet as an ERC-20 event',
      ],
      correct: 2,
      hint: 'Starkzap SDK sends real transactions to Starknet. Sepolia is a real testnet with a real block explorer.',
      explanation: 'Every Starkzap SDK transaction on Sepolia is a real blockchain transaction. It gets a hash, appears on Voyager Sepolia, and changes the testnet state. This is not a simulation — it is real onchain interaction on the testnet.',
    },
    {
      question: 'Which wrapped Bitcoin option has the highest counterparty risk?',
      options: [
        'tBTC — because the threshold network is less secure',
        'wBTC — because a single custodian (BitGo) holds all the reserves',
        'lBTC — because two protocols are involved',
        'All three have identical counterparty risk',
      ],
      correct: 1,
      hint: 'Counterparty risk increases when a single entity has control. Which option concentrates control in one place?',
      explanation: 'wBTC is held entirely by BitGo. If BitGo is hacked, goes bankrupt, or acts maliciously, all wBTC reserves are at risk. tBTC distributes this risk across many nodes. lBTC adds Babylon and Lombard as additional dependencies — more actors but no single point of failure.',
    },
    {
      question: 'A user wants to earn yield on Bitcoin with maximum DeFi composability on Starknet. Which token and strategy?',
      options: [
        'wBTC staked natively on Starknet for STRK rewards',
        'lBTC supplied to Vesu — earns Babylon BTC staking yield plus Vesu supply APY',
        'tBTC bridged to Ethereum and used in Aave',
        'Native BTC held in a hardware wallet earning nothing',
      ],
      correct: 1,
      hint: 'Maximum composability means using DeFi protocols on Starknet. Maximum yield means multiple sources.',
      explanation: 'lBTC on Vesu earns two yields simultaneously — Babylon BTC staking on the reserve and Vesu supply APY on the lBTC token. This is the most capital-efficient use of Bitcoin exposure on Starknet.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to put $20,000 of BTC into lBTC on Starknet for maximum yield. List the three key risks they must understand before proceeding.',
      scoringCriteria: [
        'Babylon Protocol smart contract risk — relatively new, less battle-tested than older DeFi',
        'Lombard custodian risk on the underlying locked BTC reserve',
        'Starknet DeFi protocol risk (Vesu or whichever lending protocol is used for the second yield)',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'AVNU quote: 1,000 STRK → wBTC. Quoted: 0.01640 wBTC. Executed: 0.01627 wBTC. Calculate slippage. Is this acceptable for a $200 swap?',
      scoringCriteria: [
        'Slippage: (0.01640 - 0.01627) / 0.01640 = 0.79%',
        'Assessment: 0.79% on a $200 swap is moderate — about $1.58 cost — borderline acceptable',
        'Recommendation: check if AVNU has better routing or use a limit order',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Bitcoin-only holder says "wrapped Bitcoin is not real Bitcoin — I don\'t trust custodians." Reply in 3 sentences acknowledging their concern honestly.',
      scoringCriteria: [
        'Acknowledges the custodian trust concern is legitimate, not dismissed',
        'Explains the trade-off: DeFi utility vs purity without custodians',
        'Mentions tBTC as a more trustless option without overclaiming it is risk-free',
      ],
    },
  ],
  links: [{ label: 'Lombard lBTC', url: 'https://lombard.finance' }, { label: 'Threshold tBTC', url: 'https://threshold.network' }],
};

const L299: StarknetIslandLevel = {
  id: 299, mechanic: 'chain', tier: 'pro',
  topic: 'STRK Staking: Earn Passive Income',
  simulatorLesson: 'starkzap-stake',
  explanation: `Premium savings accounts in traditional finance offer 4–5% annual interest. Your money works for you while you sleep. Starknet staking works on the same principle — but the interest rates are higher, there are no banks, and the rules are written in code.

When you stake STRK, you delegate your tokens to a validator — a node operator who runs the infrastructure that helps secure Starknet. The validator bundles your tokens with others in a delegation pool and uses that combined stake to participate in consensus. In return, they share the block rewards with you, keeping a commission (typically 3–10%) and passing the rest to delegators.

The Starkzap SDK handles staking in three lines. wallet.stake(poolAddress, amount) checks if you are a new member (calls enter_delegation_pool) or existing member (calls add_to_delegation_pool) and routes accordingly. Rewards accumulate continuously on-chain — you do not need to do anything. Call wallet.claimPoolRewards(poolAddress) when you want to collect.

Exit takes two steps. First, declare intent with wallet.exitPoolIntent() — your tokens stop earning immediately. Then wait 21 days (the unbonding period) for the network to process your exit. Finally call wallet.exitPool() to receive your tokens. The 21-day wait prevents sudden large exits from destabilising the network.`,
  fact: 'STRK staking: delegate to validator pools, earn 5–12% APY. Rewards accumulate continuously. Two-step exit: declare intent → 21-day unbond → withdraw. Starkzap: wallet.stake(), claimPoolRewards(), exitPoolIntent().',
  plain: 'Lock STRK with a validator → they secure the network → you earn a cut of rewards. Works like a high-yield savings account. Exit takes 21 days — plan ahead.',
  stars: [560, 690, 860], target: 860, coins: 56,
  examples: [
    {
      contextTag: '[First-time staker, choosing a pool]',
      scenario: 'Maya has 500 STRK and wants to stake. She finds three pools: Pool A (8% APY, 5% commission), Pool B (10% APY, 9% commission), Pool C (7% APY, 2% commission).',
      outcome: 'Maya calculates net APY. Pool A: 8% × 0.95 = 7.6%. Pool B: 10% × 0.91 = 9.1%. Pool C: 7% × 0.98 = 6.86%. Pool B gives the highest net return despite the higher commission. She stakes in Pool B.',
    },
    {
      contextTag: '[Staking and claiming rewards]',
      scenario: 'Carlos stakes 1,000 STRK at 9% APY. After 30 days, he checks his position via wallet.getPoolPosition().',
      outcome: 'position.staked = 1,000 STRK, position.rewards = 7.4 STRK (1,000 × 9% / 365 × 30 ≈ 7.4). Carlos calls wallet.claimPoolRewards() and the 7.4 STRK arrives in his wallet instantly as a real Sepolia testnet transaction.',
    },
    {
      contextTag: '[Planning an exit correctly]',
      scenario: 'Diana needs her staked STRK in 3 weeks for an NFT mint. She initiates exitPoolIntent() today.',
      outcome: 'Diana\'s tokens stop earning rewards immediately. After exactly 21 days, she calls exitPool() and her STRK returns. She just misses the 3-week target — learning that exit timing needs 21 days minimum lead time.',
    },
  ],
  keyTakeaway: 'Stake STRK to earn 5–12% APY — rewards accumulate continuously, claim anytime, but plan exits 21 days in advance.',
  guidedPractice: [
    {
      question: 'What does "delegating" to a validator pool mean?',
      options: [
        'Transferring ownership of your STRK to the validator permanently',
        'Lending your STRK to the validator so they can use it to participate in consensus and share rewards with you',
        'Voting for the validator in a Starknet governance election',
        'Locking your STRK in a smart contract that automatically restakes rewards',
      ],
      correct: 1,
      hint: 'You keep ownership — you can exit. But the validator uses your stake temporarily. What is the economic relationship?',
      explanation: 'Delegation means you lend your STRK to the validator\'s pool. They use the combined stake to run a Starknet node and participate in consensus. They earn block rewards and share a portion (minus commission) with all delegators proportionally.',
    },
    {
      question: 'Pool A: 11% gross APY, 8% commission. Pool B: 9% gross APY, 2% commission. You stake 1,000 STRK. Which earns more annually?',
      options: [
        'Pool A — higher gross APY always wins',
        'Pool A: 1,000 × 11% × 92% = 101.2 STRK vs Pool B: 1,000 × 9% × 98% = 88.2 STRK. Pool A wins.',
        'Pool B — lower commission always wins',
        'They are identical after commission',
      ],
      correct: 1,
      hint: 'Net APY = gross APY × (1 - commission). Calculate both and compare.',
      explanation: 'Pool A net: 1,000 × 0.11 × 0.92 = 101.2 STRK/year. Pool B net: 1,000 × 0.09 × 0.98 = 88.2 STRK/year. Pool A gives 13 more STRK annually despite the higher commission. Always calculate net APY — gross APY alone is misleading.',
    },
    {
      question: 'When does your STRK stop earning rewards in the exit process?',
      options: [
        'After the 21-day unbonding period completes',
        'When you call exitPool() to withdraw',
        'Immediately when you call exitPoolIntent()',
        'Rewards continue until you actually receive the tokens',
      ],
      correct: 2,
      hint: 'The intent declaration is the moment of exit — not the completion.',
      explanation: 'Rewards stop accruing the moment you call exitPoolIntent(). The 21-day period is purely for network safety — your tokens no longer earn during this time. This is why timing your exit matters if you want to maximise rewards.',
    },
    {
      question: 'wallet.stake(poolAddress, amount) on Starkzap does two things automatically. What are they?',
      options: [
        'Checks your balance and requests faucet tokens if needed',
        'Detects if you are a new pool member (calls enter_delegation_pool) or existing member (calls add_to_delegation_pool)',
        'Approves the staking contract to spend your STRK and confirms the transaction',
        'Claims any pending rewards before staking the new amount',
      ],
      correct: 1,
      hint: 'The SDK is "smart" — it handles the branching logic for you. What does it detect?',
      explanation: 'wallet.stake() checks if you are already a pool member. New members need enter_delegation_pool (the initial staking call). Existing members need add_to_delegation_pool. The SDK handles this detection so you write one line regardless.',
    },
    {
      question: 'You staked 500 STRK on January 1. You call exitPoolIntent() on February 1. When can you withdraw?',
      options: [
        'February 1 — immediately after the intent',
        'February 8 — one week later',
        'February 22 — 21 days after the intent',
        'March 1 — two months after staking began',
      ],
      correct: 2,
      hint: 'The 21-day unbonding period starts from the exitPoolIntent() call, not from when you first staked.',
      explanation: 'The 21-day unbonding period begins when exitPoolIntent() is called — February 1. February 1 + 21 days = February 22. You can call exitPool() and receive your STRK on or after February 22.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You staked 2,000 STRK at 8.5% gross APY with 6% commission. After 45 days, what are your net rewards? Show working.',
      scoringCriteria: [
        'Gross rewards: 2000 × 8.5% / 365 × 45 = 20.96 STRK',
        'Commission: 20.96 × 6% = 1.26 STRK',
        'Net rewards: 20.96 - 1.26 = 19.70 STRK (within 0.5 STRK tolerance)',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user stakes 100% of their STRK in a single validator pool that offers 13% APY. The validator has only been running for 2 weeks. What risks are they taking?',
      scoringCriteria: [
        'Validator reliability risk — new validator, no track record of uptime',
        'Slashing risk if the validator misbehaves (though Starknet\'s slashing is limited)',
        'Concentration risk — all funds in one pool means full exposure if pool fails',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain STRK staking to someone who understands savings accounts but knows nothing about crypto. Use no blockchain jargon. 3 sentences.',
      scoringCriteria: [
        'Uses a savings/interest analogy without blockchain terms',
        'Explains that the 21-day exit period is like a notice period on a savings account',
        'Does not claim the returns are guaranteed — notes APY varies',
      ],
    },
  ],
  links: [{ label: 'Staking dashboard', url: 'https://www.starknet.io/staking' }],
};

const L300: StarknetIslandLevel = {
  id: 300, mechanic: 'match3', tier: 'pro',
  topic: 'DeFi on Starknet: The Full Stack',
  simulatorLesson: 'starkzap-swap',
  explanation: `Traditional finance runs on institutions. You need a bank to save, a broker to invest, an exchange to trade, and a lender to borrow. Each charges fees, requires identity verification, and operates on their schedule. DeFi (Decentralised Finance) replaces all four with code.

On Starknet, the DeFi stack is complete. AVNU is the DEX aggregator — when you want to swap one token for another, AVNU checks every exchange on Starknet simultaneously and routes your swap through the cheapest path. Ekubo is the concentrated liquidity AMM — liquidity providers deposit token pairs and earn fees from every swap that passes through their price range. Vesu and Nostra are lending protocols — deposit tokens to earn supply APY, or borrow against collateral. ZKLend is a money market.

What makes Starknet DeFi different from Ethereum DeFi: account abstraction makes all of it gasless from the user's perspective. The AVNU Paymaster covers fees. Users sign once, the transaction executes, they never see STRK leave their wallet for fees.

The Starkzap SDK unifies the entire stack. One wallet object accesses swaps, staking, lending, and DCA through a consistent API. Combined TVL across Starknet DeFi: approximately $800M and growing.`,
  fact: 'Starknet DeFi: AVNU (DEX aggregator), Ekubo (concentrated AMM), Vesu/Nostra (lending), ZKLend (money market). ~$800M TVL. All accessible via Starkzap SDK. All gasless via AVNU Paymaster.',
  plain: 'Bank + broker + exchange + lender — all replaced by code on Starknet. AVNU finds the best swap. Vesu earns you interest. All gasless. All accessible in one SDK.',
  stars: [580, 715, 895], target: 895, coins: 58,
  examples: [
    {
      contextTag: '[Complete DeFi journey, one user]',
      scenario: 'Alex starts with 1,000 USDC on Starknet. He wants to deploy it across the DeFi stack.',
      outcome: 'Alex swaps 300 USDC → STRK via AVNU (best route found automatically). Stakes 200 STRK in a validator pool at 8.5% APY. Supplies 400 USDC to Vesu at 4.2% supply APY. Sets a DCA order for 10 USDC of STRK weekly. Four operations, one SDK, zero gas fees paid by Alex.',
    },
    {
      contextTag: '[AVNU routing, technical detail]',
      scenario: 'A user swaps 5,000 USDC → wBTC. AVNU finds three routes: direct USDC/wBTC pool (poor liquidity), USDC→ETH→wBTC (medium), and USDC→STRK→ETH→wBTC split (best).',
      outcome: 'AVNU routes 60% through USDC→ETH→wBTC and 40% through USDC→STRK→ETH→wBTC simultaneously. The split reduces price impact. The user receives 0.4% more wBTC than the single-hop route would have given.',
    },
    {
      contextTag: '[Protocol composability]',
      scenario: 'A user supplies wBTC to Vesu as collateral, borrows USDC against it, then uses the borrowed USDC to set up a DCA order buying more STRK weekly.',
      outcome: 'This is DeFi composability — protocols stacking on top of each other. The user now has BTC exposure, a USDC loan (costs borrow APY), and a growing STRK position. All three positions are live simultaneously. No bank approved this. No KYC required.',
    },
  ],
  keyTakeaway: 'Starknet DeFi has the full stack: swap (AVNU), provide liquidity (Ekubo), lend and borrow (Vesu), all gasless, all accessible via Starkzap SDK in one unified API.',
  guidedPractice: [
    {
      question: 'What does AVNU do that a single DEX cannot?',
      options: [
        'AVNU provides higher APY on staked tokens',
        'AVNU aggregates liquidity from all Starknet DEXs and routes your swap through the optimal path across multiple sources simultaneously',
        'AVNU holds your tokens in custody for faster swaps',
        'AVNU guarantees a fixed price regardless of market conditions',
      ],
      correct: 1,
      hint: 'Think about what "aggregator" means — it combines multiple sources. A single DEX only has its own liquidity.',
      explanation: 'AVNU queries every DEX on Starknet and finds the path that gives you the most output tokens for your input. It can split swaps across multiple DEXs simultaneously. A single DEX can only use its own liquidity — if that pool is shallow, you get worse prices.',
    },
    {
      question: 'What is "concentrated liquidity" in Ekubo?',
      options: [
        'Liquidity providers deposit all their tokens into one pool regardless of price',
        'LPs set a specific price range for their liquidity — they earn fees only when the price trades within that range, making capital more efficient',
        'Ekubo concentrates user assets in the highest-yield strategy automatically',
        'A system where large LPs get higher fee percentages than small LPs',
      ],
      correct: 1,
      hint: 'Think about the difference between deploying capital everywhere vs focusing it where most trading happens.',
      explanation: 'In concentrated liquidity, LPs choose a price range (e.g., 1 STRK = $0.70 to $0.90). Their capital only earns fees when the price trades within that range. This makes their capital far more efficient than spreading it across all possible prices — but they must actively manage their range.',
    },
    {
      question: 'A user wants to borrow USDC without selling their ETH. Which Starknet protocol handles this?',
      options: [
        'AVNU — for borrowing against collateral',
        'Ekubo — for liquidity-backed borrowing',
        'Vesu or Nostra — lending protocols where ETH is deposited as collateral to borrow USDC',
        'The Starknet Foundation — which provides liquidity loans',
      ],
      correct: 2,
      hint: 'Lending protocols handle deposit-and-borrow. Which protocols in the Starknet ecosystem do this?',
      explanation: 'Vesu and Nostra are Starknet\'s lending protocols. You deposit ETH as collateral, borrow USDC up to a maximum loan-to-value ratio, and pay borrow APY. Your ETH stays in the protocol; you use the borrowed USDC. If ETH price drops too far, your collateral is liquidated to repay the loan.',
    },
    {
      question: 'Why can a Starknet user interact with AVNU, Vesu, and Ekubo without paying gas fees?',
      options: [
        'Starknet removes all fees from DeFi transactions by default',
        'Account abstraction allows the AVNU Paymaster to pay fees on behalf of the user, configured as feeMode: "sponsored" in Starkzap',
        'DeFi protocols pay their own gas fees on Starknet',
        'Starknet Foundation subsidises all DeFi transaction fees permanently',
      ],
      correct: 1,
      hint: 'This was covered in Level 297. What mechanism allows a third party to pay fees?',
      explanation: 'The AVNU Paymaster is configured in the Starkzap SDK with feeMode: "sponsored". Every transaction is routed through the paymaster, which pays the STRK gas fee. The user never touches gas. This is only possible because Starknet\'s account abstraction makes the fee-payer programmable.',
    },
    {
      question: 'Starknet DeFi TVL is approximately $800M. Ethereum DeFi TVL is approximately $60B. What does this gap represent?',
      options: [
        'Starknet DeFi is less secure than Ethereum DeFi',
        'Early-stage opportunity — the ecosystem is established but much smaller, meaning protocols that win on Starknet now capture ground-floor market position',
        'Starknet cannot scale beyond $1B TVL due to technical constraints',
        'The gap is closing rapidly and will equalise within 6 months',
      ],
      correct: 1,
      hint: 'Think about where most successful DeFi protocols on Ethereum were when they had $800M TVL. What stage were they at?',
      explanation: 'An $800M TVL ecosystem is established but early. Uniswap, Aave, and Compound were at similar stages in 2020 before growing 10-100x. Starknet\'s gap from Ethereum represents the early-mover opportunity — protocols that establish themselves now have network effects and liquidity advantages over later entrants.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have 2,000 USDC. Design a Starknet DeFi allocation that maximises yield while keeping 20% liquid for opportunities. Show allocations and projected annual returns.',
      scoringCriteria: [
        'Liquid reserve correctly sized at 400 USDC (20%)',
        'Remaining 1,600 USDC allocated across at least 2 protocols with specific amounts',
        'Annual return calculation correct for each allocation using realistic APY figures',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user supplies all their USDC to Vesu at 4.5% APY, then borrows 80% LTV in STRK and stakes it at 9% APY. What are the risks of this leveraged strategy?',
      scoringCriteria: [
        'Liquidation risk: if STRK price drops, LTV rises above threshold — Vesu liquidates USDC collateral',
        'STRK price correlation: if STRK crashes, staking rewards in STRK are also worth less',
        'Protocol risk: two smart contracts involved — bug in either loses funds',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain the difference between AVNU and Ekubo to someone who knows what a "stock exchange" and "price comparison website" are. 2 sentences.',
      scoringCriteria: [
        'AVNU correctly described as the price comparison website (aggregator across DEXs)',
        'Ekubo correctly described as the stock exchange itself (the AMM where trading happens)',
        'No blockchain jargon used without explanation',
      ],
    },
  ],
  links: [{ label: 'AVNU', url: 'https://app.avnu.fi' }, { label: 'Ekubo', url: 'https://ekubo.org' }],
};

const L301: StarknetIslandLevel = {
  id: 301, mechanic: 'memory', tier: 'pro',
  topic: 'Token Swaps: How to Trade on Starknet',
  simulatorLesson: 'starkzap-swap',
  explanation: `At a foreign exchange booth at an airport, you hand over £100 and receive $130. The rate is posted. The transaction is instant. A decentralised exchange (DEX) is that booth — but run by code, open 24 hours, with no staff, no closing time, and no manager who can freeze your account.

On Starknet, AVNU is the dominant swap interface. It is an aggregator — it does not hold liquidity itself, but instead queries all liquidity sources on Starknet (Ekubo pools, other DEXs) and finds the route that gives you the best output for your input. Think of Google Flights: you don't book with Google, but Google finds the cheapest flight across all airlines.

Before executing, AVNU gives you a quote — the expected output amount and the price impact. Price impact is the percentage by which your trade moves the market price. Large trades on shallow pools create high price impact (you pay more per token as you buy). AVNU minimises this by splitting trades across multiple pools.

Slippage tolerance is your safety margin. If you set 1% slippage, you accept a price up to 1% worse than the quote. If the price moves more than 1% while your transaction is pending, it reverts automatically.

In Starkzap: wallet.getQuote() for a preview, wallet.swap() to execute. The swap is a real Starknet transaction — your token balances change onchain.`,
  fact: 'AVNU aggregates all Starknet DEX liquidity and routes swaps optimally. getQuote() for preview, swap() to execute. Price impact and slippage are key risk parameters. Every swap is a real onchain transaction.',
  plain: 'AVNU is Google Flights for swaps — it searches all DEXs and finds the cheapest route. Get a quote first. Set slippage tolerance. Execute. Your balances change on Starknet in real time.',
  stars: [600, 740, 925], target: 925, coins: 60,
  examples: [
    {
      contextTag: '[Getting a quote before swapping]',
      scenario: 'Nia wants to swap 100 STRK for USDC. She calls wallet.getQuote({ tokenIn: STRK, tokenOut: USDC, amountIn: "100" }) before committing.',
      outcome: 'Quote returns: amountOutBase = 12,400,000 (12.40 USDC, accounting for 6 decimals), priceImpactBps = 8 (0.08%), provider = "avnu". Nia sees she gets 12.40 USDC. Price impact is tiny. She executes.',
    },
    {
      contextTag: '[Slippage protection activating]',
      scenario: 'Ben sets 0.5% slippage and submits a swap. Between submission and confirmation, a large trade on Ekubo moves the price 0.8%.',
      outcome: 'The transaction reverts automatically — the execution price exceeded Ben\'s 0.5% tolerance. His tokens are safe in his wallet. He resubmits with 1% slippage or waits for the price to stabilise.',
    },
    {
      contextTag: '[Multi-hop route, better price]',
      scenario: 'Selena swaps 10,000 USDC → lBTC. The direct USDC/lBTC pool has poor liquidity. AVNU finds USDC→wBTC→lBTC gives 0.6% better output.',
      outcome: 'AVNU routes through the multi-hop path automatically. Selena receives 0.6% more lBTC than the direct swap. She paid one gas fee (covered by paymaster) for what was internally two swaps. AVNU batched them into one transaction.',
    },
  ],
  keyTakeaway: 'Always get a quote before swapping — check price impact and set slippage tolerance. AVNU finds the optimal multi-hop route automatically. Every swap is a real Starknet transaction.',
  guidedPractice: [
    {
      question: 'What is price impact in a token swap?',
      options: [
        'The gas fee charged by the Starknet network for the transaction',
        'The percentage by which your trade moves the market price — larger trades on shallow pools have higher price impact',
        'The difference between the quoted price and the final executed price',
        'A penalty charged by AVNU for large swaps',
      ],
      correct: 1,
      hint: 'Think about supply and demand. If you buy a lot of a token with limited supply, what happens to its price?',
      explanation: 'Price impact is how much your trade shifts the pool price. If a pool has 10,000 STRK of liquidity and you buy 1,000 STRK, you are buying 10% of the pool — the price rises significantly against you as you buy. Shallow pools = high price impact. AVNU minimises this by splitting across multiple pools.',
    },
    {
      question: 'What happens if your swap transaction exceeds your slippage tolerance?',
      options: [
        'The swap executes anyway and you pay the worse price',
        'The transaction reverts — your tokens return to your wallet, you pay a small gas fee (or nothing if sponsored)',
        'AVNU pauses your transaction and asks for confirmation at the new price',
        'The transaction is queued and retried automatically at a better price',
      ],
      correct: 1,
      hint: 'Slippage tolerance is a protection — what happens when a protection threshold is breached?',
      explanation: 'If the execution price is worse than your tolerance allows, the Starknet network reverts the transaction. Your tokens return to your wallet. On Starknet with a paymaster, you may pay no gas even on a reverted transaction — the paymaster absorbs the cost.',
    },
    {
      question: 'wallet.getQuote() returns amountOutBase: 12400000 for USDC (6 decimals). How many USDC will you receive?',
      options: [
        '12,400,000 USDC',
        '12.40 USDC',
        '1.24 USDC',
        '124.00 USDC',
      ],
      correct: 1,
      hint: 'USDC has 6 decimal places. Divide by 10^6 to get the human-readable amount.',
      explanation: '12,400,000 base units ÷ 10^6 (USDC has 6 decimals) = 12.40 USDC. The SDK always returns amounts in base units (raw integers). Use Amount.fromRaw() or toUnit() to convert to human-readable format.',
    },
    {
      question: 'Why does AVNU sometimes route through multiple tokens (e.g. STRK → ETH → USDC) instead of a direct pair?',
      options: [
        'To collect additional fees on each hop',
        'To reduce price impact by using deeper liquidity pools — the multi-hop path may have better combined depth than the direct pair',
        'Multi-hop is required by Starknet protocol rules for large swaps',
        'AVNU always uses multi-hop to ensure maximum protocol diversity',
      ],
      correct: 1,
      hint: 'Think about why some currency pairs require going through USD as an intermediate step in FX markets.',
      explanation: 'Some token pairs have shallow direct liquidity. Routing through a more liquid intermediate (like ETH or USDC) often gives better prices because those pools have far more depth. AVNU calculates all possible routes and picks the one with the best net output after all hops.',
    },
    {
      question: 'After executing wallet.swap({ tokenIn: STRK, tokenOut: USDC }), where can you verify the transaction?',
      options: [
        'Only inside the SkillUp app — external verification is not possible',
        'On the Starknet Sepolia block explorer (sepolia.voyager.online) using the transaction hash',
        'On Etherscan — Starknet transactions appear on the Ethereum explorer',
        'You must email Starknet support for transaction confirmation',
      ],
      correct: 1,
      hint: 'Every Starkzap SDK transaction produces a tx.hash. Where do Starknet Sepolia transactions appear publicly?',
      explanation: 'Every Starkzap transaction on Sepolia produces a real transaction hash. Paste it into sepolia.voyager.online to see the full transaction: block number, timestamp, token movements, fee paid (by paymaster), and contract calls. This is how you know the swap was real.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'AVNU quote: 500 STRK → USDC. Quote: 62.50 USDC. Price impact: 0.15%. Execution: 62.38 USDC. Calculate actual slippage vs price impact. Which was larger?',
      scoringCriteria: [
        'Slippage: (62.50 - 62.38) / 62.50 = 0.19%',
        'Price impact quoted was 0.15% — actual slippage was 0.19%, slightly higher',
        'Conclusion: the price moved slightly between quote and execution, slippage > quoted impact',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to swap $50,000 of USDC → STRK in one transaction on Starknet. AVNU shows 2.4% price impact. What should they do instead?',
      scoringCriteria: [
        'Identifies 2.4% price impact as too high — costs $1,200 in price degradation',
        'Recommends splitting the swap into smaller chunks (e.g. 5 × $10,000) over time',
        'Notes AVNU may auto-split but for this size should also check timing/liquidity conditions',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain slippage to someone who understands online shopping but not crypto. Use a concrete shopping analogy. 2 sentences.',
      scoringCriteria: [
        'Uses a concrete analogy (e.g. adding item to cart at £50 but price changes to £50.50 by checkout)',
        'Correctly explains slippage tolerance as the maximum price change you will accept before cancelling',
        'No unexplained crypto jargon',
      ],
    },
  ],
};

const L302: StarknetIslandLevel = {
  id: 302, mechanic: 'chain', tier: 'pro',
  topic: 'Lending & Borrowing with Vesu',
  simulatorLesson: 'starkzap-lend',
  explanation: `Traditional banks take your deposits, lend them to other customers at a higher rate, and pocket the spread. Your savings account earns 2%; the bank charges borrowers 7%. Vesu does the same thing — but the bank is code. Every rate is set algorithmically based on supply and demand. No spread captured by a bank. The full rate goes to depositors.

Vesu is Starknet's leading lending protocol. As a lender (depositor), you supply tokens into a pool and earn supply APY — the interest rate paid by borrowers. As a borrower, you deposit collateral (a token that guarantees the loan) and borrow a different token against it, paying borrow APY continuously.

The health factor is the critical number. It measures the safety of your borrow position: health factor = (collateral value × liquidation threshold) ÷ debt value. A health factor above 1.0 means your position is safe. Below 1.0, Vesu automatically liquidates — it sells some of your collateral to repay the debt. Watch it carefully.

The Starkzap SDK: wallet.lending().deposit() to supply, wallet.lending().borrow() to take a loan, wallet.lending().getHealth() to check your risk. The SDK fetches live market data — your position updates in real time as prices move.

Supply is lower risk. Borrowing adds liquidation risk. Never borrow up to your maximum — leave a buffer.`,
  fact: 'Vesu: supply tokens and earn supply APY. Borrow against collateral and pay borrow APY. Health factor = (collateral × threshold) ÷ debt. Below 1.0 = liquidation. SDK: wallet.lending().deposit(), borrow(), getHealth().',
  plain: 'Deposit USDC → earn interest. Or deposit ETH as collateral → borrow USDC without selling. If collateral value drops too far, Vesu sells it automatically to repay the loan.',
  stars: [620, 765, 955], target: 955, coins: 62,
  examples: [
    {
      contextTag: '[Depositing for yield]',
      scenario: 'Ingrid has 2,000 USDC idle in her wallet. She supplies it to Vesu at 4.8% supply APY.',
      outcome: 'Ingrid\'s 2,000 USDC enters the Vesu pool. Borrowers pay interest, which flows to Ingrid continuously. After 90 days: 2,000 × 4.8% / 365 × 90 = 23.67 USDC earned. She calls withdrawMax() when she needs the funds back.',
    },
    {
      contextTag: '[Borrowing against ETH]',
      scenario: 'Marcus holds 1 ETH ($3,000). He needs 1,000 USDC for a business expense but doesn\'t want to sell his ETH. He uses Vesu.',
      outcome: 'Marcus deposits 1 ETH as collateral (max LTV 75% = $2,250 borrowing power). He borrows $1,000 USDC, paying 6.2% borrow APY. His health factor: (3,000 × 0.75) / 1,000 = 2.25. Comfortably safe. He repays when he has USDC income, recovering his ETH.',
    },
    {
      contextTag: '[Liquidation risk materialising]',
      scenario: 'Sarah borrowed $800 USDC against 0.5 ETH ($1,500 collateral, LTV 75%, health factor 1.40). ETH drops 40% to $900.',
      outcome: 'New health factor: (900 × 0.75) / 800 = 0.84. Below 1.0. Vesu liquidates — sells some of Sarah\'s ETH to repay the debt. Sarah loses a portion of her collateral plus a liquidation penalty. She should have monitored her health factor and repaid when ETH dropped.',
    },
  ],
  keyTakeaway: 'Supply tokens to earn yield risk-free. Borrow against collateral but monitor your health factor — if it drops below 1.0, Vesu liquidates your position automatically.',
  guidedPractice: [
    {
      question: 'What is the health factor and what does a health factor of 0.90 mean?',
      options: [
        'A credit score for your wallet — 0.90 is a poor credit rating',
        'A ratio measuring position safety. 0.90 means the position is undercollateralised and will be liquidated',
        'The percentage of your collateral currently lent to borrowers',
        'The APY ratio between supply rate and borrow rate',
      ],
      correct: 1,
      hint: 'Health factor < 1.0 = something bad happens. What is that something?',
      explanation: 'Health factor = (collateral value × liquidation threshold) ÷ debt value. At 0.90, the debt exceeds the safety threshold — Vesu triggers liquidation, selling collateral to repay the debt. A health factor above 1.5 is considered safe with comfortable buffer.',
    },
    {
      question: 'You deposit 2 ETH ($4,000) as collateral. Max LTV is 75%. What is your maximum safe borrow amount?',
      options: [
        '$4,000 — the full collateral value',
        '$3,000 — 75% of $4,000',
        '$2,000 — half of collateral for safety',
        '$1,000 — maximum recommended conservative borrow',
      ],
      correct: 1,
      hint: 'LTV = Loan-to-Value. 75% LTV means you can borrow up to 75% of your collateral value.',
      explanation: '4,000 × 75% = $3,000 maximum borrow. But borrowing at exactly max LTV is extremely dangerous — any price drop below zero buffer triggers liquidation immediately. Best practice: borrow 50-60% of maximum (i.e. $1,500-$2,000) to maintain a safe health factor above 1.5.',
    },
    {
      question: 'wallet.lending().getHealth({ collateralToken: ETH, debtToken: USDC }) returns 1.05. What should you do?',
      options: [
        'Nothing — 1.05 is safely above 1.0, no action needed',
        'Immediately repay some debt or add collateral — 1.05 is dangerously close to liquidation threshold',
        'Borrow more — health above 1.0 means you have borrowing capacity',
        'Close the position entirely — any health factor above 1.0 means you are over-collateralised',
      ],
      correct: 1,
      hint: '1.05 means you are only 5% away from liquidation. Is that a comfortable buffer for a volatile asset like ETH?',
      explanation: 'Health factor 1.05 is extremely risky — a 5% drop in ETH price triggers liquidation. Immediately repay debt, add collateral, or both to push the health factor above 1.5. Smart practice: set a personal alert at health factor 1.3 and take action before it reaches 1.05.',
    },
    {
      question: 'What is the difference between supply APY and borrow APY in Vesu?',
      options: [
        'Supply APY is what you earn for depositing tokens; borrow APY is what you pay for borrowing',
        'They are the same rate — Vesu charges borrowers and pays lenders identically',
        'Supply APY is fixed; borrow APY varies with market conditions',
        'Borrow APY is always lower than supply APY to incentivise borrowing',
      ],
      correct: 0,
      hint: 'Think about the two roles in lending. What does each party pay/receive?',
      explanation: 'Supply APY is the interest rate depositors earn. Borrow APY is the interest rate borrowers pay. Borrow APY is always higher than supply APY — the difference covers protocol risk and treasury. Both rates adjust dynamically based on utilisation rate (what percentage of the pool is currently borrowed).',
    },
    {
      question: 'A user calls wallet.lending().withdrawMax({ token: USDC }) while they have an active borrow position. What happens?',
      options: [
        'All USDC is withdrawn successfully',
        'The withdrawal reverts or withdraws only the amount that does not cause undercollateralisation',
        'The borrow position is automatically closed before withdrawal',
        'withdrawMax() only works when there is no active borrow',
      ],
      correct: 1,
      hint: 'Withdrawing collateral reduces your health factor. What happens if withdrawal would push health below 1.0?',
      explanation: 'If withdrawing all collateral would push the health factor below 1.0, Vesu prevents it. withdrawMax() calculates the maximum safe withdrawal given current debt and returns only that amount. You cannot reduce your collateral below the threshold that covers your debt.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You deposited 1 ETH ($2,800) as collateral with 70% max LTV. You borrowed $1,200 USDC. ETH drops to $1,900. Calculate your new health factor. Are you at risk?',
      scoringCriteria: [
        'Health factor: (1,900 × 0.70) / 1,200 = 1,330 / 1,200 = 1.11',
        'Correctly identifies 1.11 as dangerously low — only 11% buffer to liquidation',
        'Recommends repaying at least $300 USDC to bring health factor above 1.5',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user deposits all their savings (2,000 USDC) into Vesu at 5% APY. This is their emergency fund. What risk are they ignoring?',
      scoringCriteria: [
        'Smart contract risk — Vesu could be hacked, USDC could be lost',
        'Liquidity risk — they may not be able to withdraw instantly if the pool has high utilisation',
        'Recommends keeping emergency funds in a non-DeFi location — DeFi is not a savings account substitute',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain Vesu\'s liquidation mechanism to someone who understands mortgage foreclosure. 3 sentences.',
      scoringCriteria: [
        'Correctly maps foreclosure (bank sells house when mortgage unpaid) to liquidation (Vesu sells collateral when debt too large)',
        'Explains health factor as the equivalent of loan-to-value ratio in mortgages',
        'Notes automatic execution — no court, no notice period, happens instantly when threshold breached',
      ],
    },
  ],
  links: [{ label: 'Vesu', url: 'https://vesu.xyz' }],
};

const L303: StarknetIslandLevel = {
  id: 303, mechanic: 'match3', tier: 'pro',
  topic: 'Dollar-Cost Averaging On-Chain',
  simulatorLesson: 'starkzap-dca',
  explanation: `Studies across 70 years of market data consistently show that investors who buy a fixed amount of an asset at regular intervals outperform those who try to time the market. The reason: when prices fall, you buy more units; when prices rise, you buy fewer. Over time, your average cost is lower than if you had bought all at once at a random moment.

This is Dollar-Cost Averaging — DCA. On Starknet, you can automate it in a single transaction. No spreadsheet, no reminders, no discipline required. The protocol executes on your behalf.

AVNU supports discrete DCA orders: you specify a sell token, a buy token, an amount per cycle, and a frequency. Every week (or day), AVNU automatically swaps your specified amount. You can set optional min/max price bounds — if STRK price spikes above your max, AVNU skips that cycle.

Ekubo supports TWAMM (Time-Weighted AMM) — a different mechanism. Instead of discrete weekly swaps, your buy is executed continuously as a drip: a tiny amount of tokens is swapped every block, all day, every day. The result is ultra-smooth price averaging with minimal price impact.

In Starkzap: wallet.dca().create() sets up the order. wallet.dca().previewCycle() shows you the expected buy amount for the next cycle before committing. wallet.dca().getOrders() lists your active orders. Cancel anytime.`,
  fact: 'DCA on Starknet: AVNU (discrete weekly/daily cycles, optional min/max bounds), Ekubo TWAMM (continuous drip buying, every block). Set up in one transaction. Starkzap: wallet.dca().create(), previewCycle(), getOrders().',
  plain: 'Set a weekly STRK buy once — it runs automatically forever without any action from you. AVNU handles discrete cycles; Ekubo drips continuously. Both remove the psychology of trying to time the market.',
  stars: [640, 790, 985], target: 985, coins: 64,
  examples: [
    {
      contextTag: '[First DCA order setup]',
      scenario: 'Priya wants to buy STRK weekly without checking prices. She sets up a DCA order: 20 USDC of STRK every 7 days for 12 cycles (total: 240 USDC over 12 weeks).',
      outcome: 'Priya calls wallet.dca().create() once. Every 7 days, AVNU automatically swaps 20 USDC → STRK at market price. In week 3, STRK drops 30% — she automatically buys more STRK than usual for her $20. In week 8, STRK rises 20% — she buys fewer tokens. Her average cost is lower than if she had bought 240 USDC at once.',
    },
    {
      contextTag: '[AVNU vs Ekubo TWAMM comparison]',
      scenario: 'Two users want to buy $1,000 of STRK over 30 days. User A uses AVNU (weekly discrete cycles). User B uses Ekubo TWAMM (continuous drip).',
      outcome: 'User A gets 4 weekly purchases of $250. Each purchase happens at the price at that specific moment. User B\'s $1,000 is spread across every block over 30 days — thousands of micro-purchases. User B has near-zero price impact per trade and ultra-smooth averaging. User A has slightly more timing exposure but simpler interface.',
    },
    {
      contextTag: '[Cycle preview before committing]',
      scenario: 'James wants to set up a DCA order but first calls wallet.dca().previewCycle() to see what he\'d receive at the current price.',
      outcome: 'previewCycle returns: amountOutBase = 62,500,000 (62.5 STRK for his 10 USDC cycle at current rate). James is happy with the rate and confirms the DCA order. Preview used zero gas — it is a read-only call.',
    },
  ],
  keyTakeaway: 'DCA on Starknet runs automatically via AVNU (weekly cycles) or Ekubo TWAMM (continuous drip) — set it once, remove timing psychology, let the protocol execute.',
  guidedPractice: [
    {
      question: 'Why does DCA typically produce a lower average cost than buying all at once?',
      options: [
        'DCA gives you access to wholesale token prices unavailable in single purchases',
        'By buying at regular intervals, you automatically buy more units when prices are low and fewer when prices are high — averaging your cost below a random single entry',
        'DCA orders receive a fee discount from AVNU that reduces the effective purchase price',
        'Protocols guarantee a fixed price for DCA orders regardless of market conditions',
      ],
      correct: 1,
      hint: 'Think about what happens to the number of tokens you receive when the price falls vs rises with a fixed dollar amount.',
      explanation: 'With a fixed dollar amount per cycle: when STRK is $0.80, $20 buys 25 STRK. When STRK is $1.20, $20 buys 16.7 STRK. You automatically accumulate more during dips. Over many cycles, your average cost per STRK is lower than the average price over the same period.',
    },
    {
      question: 'What does previewCycle() do and why should you call it before creating a DCA order?',
      options: [
        'It executes a test cycle and charges you gas to validate the order',
        'It shows the expected token amount you would receive in the next cycle at current prices — read-only, costs no gas',
        'It locks in the current price for your first DCA cycle as a guaranteed rate',
        'It checks if your wallet has sufficient balance to complete all cycles upfront',
      ],
      correct: 1,
      hint: 'Preview = read-only. What does a read-only call do that a transaction does not?',
      explanation: 'previewCycle() fetches a quote from the swap provider for your cycle parameters at current market prices. It is read-only — no transaction, no gas, no state change. It lets you verify the expected output before locking funds into a DCA order.',
    },
    {
      question: 'What is the key difference between AVNU DCA and Ekubo TWAMM?',
      options: [
        'AVNU DCA costs more gas; TWAMM is gasless',
        'AVNU executes discrete cycles (weekly/daily); TWAMM executes continuously every block — thousands of micro-swaps per day',
        'AVNU is for small amounts; TWAMM is only available above $1,000 minimum',
        'AVNU supports any token pair; TWAMM only supports STRK/USDC',
      ],
      correct: 1,
      hint: 'Think about the analogy: pouring a bucket of water vs a tap dripping continuously.',
      explanation: 'AVNU DCA executes at specific intervals — a discrete weekly swap is one transaction at one moment. TWAMM executes continuously — your order is spread across every block over the order period, creating ultra-smooth averaging with minimal price impact per execution.',
    },
    {
      question: 'You set a DCA order: 10 USDC of STRK weekly, min price bound $0.50/STRK. STRK drops to $0.45 in week 4. What happens?',
      options: [
        'AVNU executes the week 4 cycle at $0.45 — below your min is still executed',
        'AVNU skips week 4 — the price is below your minimum bound',
        'Your entire DCA order is cancelled when the price hits the min bound',
        'AVNU executes but reduces your buy amount proportionally',
      ],
      correct: 1,
      hint: 'Min price bounds are protection against buying below a floor you set.',
      explanation: 'The min price bound means: "do not execute this cycle if the price is below $0.50." AVNU skips week 4. Your 10 USDC is not spent. The DCA order continues in subsequent weeks. This protects against buying into a crash below a level you consider fundamental support.',
    },
    {
      question: 'wallet.dca().getOrders({ provider: "avnu" }) returns an array. What does each order object contain?',
      options: [
        'Only the order ID and creation date',
        'Order ID, sell and buy token addresses, sell amount per cycle, frequency, and status',
        'Only the total amount spent so far across all cycles',
        'The complete transaction history of every cycle executed',
      ],
      correct: 1,
      hint: 'Think about what you would need to see to manage your active DCA orders.',
      explanation: 'Each order object contains: order ID, sell token address, buy token address, sell amount per cycle, frequency (e.g. P1D = daily), status (active/paused/cancelled), and provider-specific data. You use the order ID to cancel: wallet.dca().cancel({ orderId: order.id }).',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You DCA $50 of STRK weekly for 4 weeks. Prices: week 1 $1.00, week 2 $0.80, week 3 $0.60, week 4 $0.90. How many STRK do you own? What is your average cost per STRK?',
      scoringCriteria: [
        'Week totals: 50 + 62.5 + 83.3 + 55.6 = 251.4 STRK',
        'Total spent: $200. Average cost: $200 / 251.4 = $0.796/STRK',
        'Correctly notes this is lower than the average price ($0.825) — DCA benefit demonstrated',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user sets up a DCA to buy $100 of STRK weekly for 52 weeks ($5,200 total). They have $5,200 in their wallet. What happens if AVNU front-loads all cycles at the start?',
      scoringCriteria: [
        'Correctly identifies that DCA only works if cycles execute over time, not all at once',
        'Notes AVNU executes one cycle at a time on schedule — the risk described does not apply to AVNU',
        'Distinguishes between depositing funds upfront vs authorising a spend limit per cycle',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A friend says "DCA is for people who don\'t know when to buy." Respond in 2 sentences with data or evidence.',
      scoringCriteria: [
        'References evidence (70 years of data, or comparison to timing strategies)',
        'Correctly explains that timing the market consistently is statistically shown to underperform DCA',
        'Tone is confident not dismissive — acknowledges timing can work but is not reliable',
      ],
    },
  ],
};

const L304: StarknetIslandLevel = {
  id: 304, mechanic: 'memory', tier: 'pro',
  topic: 'Bridging to Starknet',
  explanation: `Moving money internationally used to require a SWIFT wire transfer — 3 to 5 business days, high fees, and a bank on both ends. Crypto bridging is the blockchain equivalent: moving tokens from one network to another. It is faster than SWIFT but still has costs, risks, and speed trade-offs you must understand.

Moving assets to Starknet from Ethereum has four main routes. The canonical Starkgate bridge is the official, most secure option — your tokens lock on Ethereum and equivalent tokens appear on Starknet. Takes approximately 12 hours. Zero counterparty risk beyond the bridge contract itself. Use this for large amounts.

CCTP (Cross-Chain Transfer Protocol) is Circle's official bridge for USDC specifically. Fast — typically minutes. USDC is burned on the source chain and minted on Starknet. More capital efficient than lock-and-mint.

LayerZero OFT routes use LayerZero messaging to move tokens in minutes. Require a LayerZero API key to use via Starkzap SDK.

Hyperlane routes bridge assets from Solana to Starknet — the only way to move SPL tokens across.

Third-party bridges like Orbiter and Layerswap are fastest (often under 2 minutes) but introduce counterparty risk — you trust the bridge operator to process your transfer. Suitable for smaller amounts where speed matters more than trust minimisation.`,
  fact: 'Bridge options to Starknet: Starkgate canonical (most secure, 12h), CCTP for USDC (minutes), LayerZero OFT, Hyperlane from Solana. Third-party (Orbiter, Layerswap): fastest, most counterparty risk.',
  plain: 'Match bridge choice to amount and urgency. Small and fast → third-party. Large and trustless → Starkgate canonical. USDC specifically → CCTP.',
  stars: [660, 815, 1015], target: 1015, coins: 66,
  examples: [
    {
      contextTag: '[Large amount, security priority]',
      scenario: 'A fund moves $500,000 USDC to Starknet for DeFi deployment. They prioritise security over speed.',
      outcome: 'They use CCTP — Circle\'s official bridge. USDC is burned on Ethereum. Equivalent USDC minted on Starknet in under 15 minutes. No lock-and-mint intermediary. Starkgate canonical is also acceptable but CCTP is faster for USDC specifically.',
    },
    {
      contextTag: '[Small amount, speed priority]',
      scenario: 'A user needs 50 USDC on Starknet to test a new protocol that launches in 10 minutes. They use Orbiter.',
      outcome: 'Transfer completes in 90 seconds. Orbiter\'s relay network processes the transfer. The user saves time. The risk: Orbiter holds funds briefly in transit — for $50 this is acceptable. For $50,000, Starkgate would be better.',
    },
    {
      contextTag: '[Solana user, first Starknet interaction]',
      scenario: 'A Solana developer wants to experiment with Starknet DeFi using USDC from their Solana wallet.',
      outcome: 'They use the Hyperlane bridge (requires @hyperlane-xyz packages in their Starkzap setup). USDC moves from Solana → Starknet in one cross-chain transaction. This is the only native Solana-to-Starknet path.',
    },
  ],
  keyTakeaway: 'Choose bridge by amount and risk tolerance — Starkgate for maximum security, CCTP for USDC speed, Orbiter for convenience on small amounts, Hyperlane for Solana.',
  guidedPractice: [
    {
      question: 'What does "counterparty risk" mean in bridging?',
      options: [
        'The risk that Ethereum gas fees increase while your bridge transaction is pending',
        'The risk that the bridge operator fails to deliver your tokens on the destination chain',
        'The risk of network congestion delaying your transaction',
        'The risk of price movement during the bridge transit time',
      ],
      correct: 1,
      hint: 'Think about who you are trusting with your funds during the bridge process.',
      explanation: 'Counterparty risk is the risk that the bridge operator — the entity processing your cross-chain transfer — fails to complete the transfer. For canonical bridges, this risk is a smart contract bug. For third-party bridges, it includes the operator\'s solvency and honesty.',
    },
    {
      question: 'Which bridge should you use to move 50,000 USDC from Ethereum to Starknet with minimum counterparty risk?',
      options: [
        'Orbiter — fastest bridge available',
        'Layerswap — supports the largest transfer amounts',
        'CCTP — Circle\'s official USDC bridge, burns on source and mints on destination',
        'Layerswap is required for amounts above $10,000',
      ],
      correct: 2,
      hint: 'For USDC specifically, which bridge is the most trust-minimised option?',
      explanation: 'CCTP is Circle\'s own bridge for USDC. It uses a burn-and-mint mechanism: your USDC is destroyed on Ethereum and new USDC is minted on Starknet. No intermediary holds your funds. For large USDC transfers, CCTP has the lowest counterparty risk of all fast options.',
    },
    {
      question: 'You bridge 0.5 ETH to Starknet via Starkgate canonical at 2pm. When does it arrive?',
      options: [
        'Within 30 seconds — Starknet is near-instant',
        'Within 5 minutes — Starkgate uses CCTP under the hood',
        'Approximately 12 hours later — the canonical bridge processes on Ethereum\'s settlement schedule',
        'Exactly 7 days later — canonical bridges use the optimistic rollup fraud window',
      ],
      correct: 2,
      hint: 'Starkgate canonical is the most secure option. What is the trade-off for maximum security?',
      explanation: 'Starkgate\'s canonical bridge processes Ethereum → Starknet deposits as part of Starknet\'s proof cycle. This takes approximately 12 hours. This is the security/speed trade-off — maximum trustlessness costs time. Third-party bridges are faster because they assume the risk of advancing the funds before the canonical proof settles.',
    },
    {
      question: 'A user is moving funds from Solana to Starknet. Which bridge supports this route?',
      options: [
        'Starkgate canonical — it supports any EVM-compatible source chain',
        'CCTP — Circle supports USDC bridging from any chain',
        'Hyperlane — the only bridge with a native Solana-to-Starknet route',
        'Orbiter — the fastest cross-chain bridge for all networks',
      ],
      correct: 2,
      hint: 'Most bridges connect Ethereum to Starknet. Which one explicitly supports Solana?',
      explanation: 'Hyperlane is the only bridge with a native Solana-to-Starknet route. It uses Hyperlane\'s messaging protocol. In the Starkzap SDK, Solana bridging requires installing @hyperlane-xyz/sdk and related packages — they are optional dependencies.',
    },
    {
      question: 'What is the key risk of using third-party bridges like Orbiter for large amounts?',
      options: [
        'They charge 10x more fees than canonical bridges',
        'They use Orbiter\'s relay network — if Orbiter has insufficient liquidity or goes offline, your transfer is delayed or stuck',
        'They are slower than canonical bridges due to more network hops',
        'Third-party bridges are banned by Starknet protocol for security reasons',
      ],
      correct: 1,
      hint: 'Think about what "third-party" means. Who processes your transfer and what could go wrong?',
      explanation: 'Third-party bridges maintain their own liquidity pools and relay networks. If Orbiter has insufficient liquidity on the destination chain, or if their service has an outage, your transfer can be delayed. For small amounts this risk is acceptable. For large amounts, the counterparty risk of trusting Orbiter\'s solvency and uptime is not worth the speed advantage.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A user has $200,000 USDC on Ethereum and wants to use Starknet DeFi. They plan to use Orbiter for speed. What do you recommend and why?',
      scoringCriteria: [
        'Recommends CCTP over Orbiter for this amount — minimal counterparty risk for USDC',
        'Explains the counterparty risk of trusting Orbiter with $200,000',
        'Acknowledges the 12h speed trade-off is acceptable for this amount',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Bridge comparison: Starkgate (0 fee, 12h), CCTP (0.1% fee, 15min), Orbiter (0.06% fee, 2min). You are bridging 1,000 USDC. Calculate dollar cost of each fee option.',
      scoringCriteria: [
        'Starkgate: $0 fee, 12h wait',
        'CCTP: $1.00 fee, 15min',
        'Orbiter: $0.60 fee, 2min',
        'Recommendation tied to use case — not just cheapest or fastest',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain to a non-technical friend why bridging tokens is riskier than transferring tokens on the same chain. 2 sentences.',
      scoringCriteria: [
        'Correctly identifies cross-chain complexity as the source of additional risk',
        'Mentions at least one specific risk: bridge contract bug, operator failure, or liquidity shortfall',
      ],
    },
  ],
  links: [{ label: 'Starkgate', url: 'https://starkgate.starknet.io' }],
};

const L305: StarknetIslandLevel = {
  id: 305, mechanic: 'chain', tier: 'pro',
  topic: 'Confidential Transfers with Tongo',
  explanation: `When you make a bank transfer, only you and your bank see the amount. The public does not. On a standard blockchain, the opposite is true — every transaction is public: sender, receiver, and amount are permanently visible to anyone on Earth.

This transparency is often a feature, but sometimes a liability. A business paying suppliers doesn't want competitors knowing their supplier prices. A charity donor may want privacy. A fund moving large positions doesn't want traders front-running their transfers.

Tongo Cash brings private transfers to Starknet using the same ZK proof technology that makes Starknet efficient. When you send a confidential transfer, the amount is encrypted using a cryptographic commitment. The recipient can decrypt it with their private key. Blockchain validators verify that the transfer is valid (no coins were created from nothing) without seeing the amount. This is ZK applied to privacy.

The Tongo key is separate from your Starknet wallet key. Create a TongoConfidential instance with your private key and the Tongo contract address. Fund your confidential balance by converting public USDC into confidential USDC via wallet.tx().confidentialFund(). Transfer to a recipient using their recipientId — the Tongo public key — not their Starknet address.

Viewing keys allow selective disclosure: you can share a viewing key with an auditor or regulator who can then decrypt only your transactions, without gaining signing authority.`,
  fact: 'Tongo Cash: ZK-powered private transfers on Starknet. Amounts hidden on-chain. Only sender and receiver see amounts. Viewing keys for selective compliance disclosure. Starkzap: confidentialFund(), confidentialTransfer(), confidentialWithdraw().',
  plain: 'Send crypto where only you and the recipient see the amount. Tongo uses Starknet\'s ZK technology to hide transaction sizes while keeping them mathematically verifiable as valid.',
  stars: [680, 840, 1050], target: 1050, coins: 68,
  examples: [
    {
      contextTag: '[Business payment privacy]',
      scenario: 'A startup pays a key supplier 50,000 USDC per month. On a public blockchain, competitors can see every payment and identify the supplier relationship.',
      outcome: 'The startup uses Tongo confidential transfers. The USDC payment shows as a valid transaction on Starknet but with the amount hidden. Competitors see a confidential transfer occurred — not the amount, not the economic relationship. Privacy without leaving the blockchain.',
    },
    {
      contextTag: '[Compliance with viewing key]',
      scenario: 'A regulated fund uses Tongo for portfolio privacy but must provide transaction records to their auditor.',
      outcome: 'The fund shares their Tongo viewing key with the auditor. The auditor can decrypt and verify every transaction the fund made. Nobody else — not blockchain explorers, not other users — can see the amounts. Selective disclosure: full privacy by default, compliance on demand.',
    },
    {
      contextTag: '[Withdrawal back to public]',
      scenario: 'A user has 500 confidential USDC in their Tongo account and wants to use it in a public DeFi protocol.',
      outcome: 'They call wallet.tx().confidentialWithdraw() with the destination as their Starknet wallet address. The confidential USDC converts back to public USDC. The withdrawal amount is visible. From that point, the USDC is a normal public token usable in Vesu, AVNU, or any other protocol.',
    },
  ],
  keyTakeaway: 'Tongo Cash hides transaction amounts using ZK proofs — only sender and receiver see the amount, but validity is still mathematically guaranteed. Viewing keys enable compliance without sacrificing privacy.',
  guidedPractice: [
    {
      question: 'How does Tongo hide transaction amounts while still proving transactions are valid?',
      options: [
        'It routes transactions through a mixing service that pools funds together',
        'It uses ZK proofs — validators verify the transaction is valid (no coins created from nothing) without seeing the actual amounts',
        'It encrypts the transaction data and only Tongo can decrypt it',
        'Amounts are not hidden — only the sender and receiver identities are private',
      ],
      correct: 1,
      hint: 'This is the core ZK use case — proving a property (validity) without revealing the underlying data (amount).',
      explanation: 'Tongo uses ZK proofs (specifically zero-knowledge commitments) to prove that a transfer is valid — the sender has sufficient balance, the total is conserved — without the verifier seeing the actual numbers. This is the same cryptographic primitive that makes Starknet itself work, applied to individual transaction privacy.',
    },
    {
      question: 'To send a confidential transfer to Alice, you need her:',
      options: [
        'Starknet wallet address (0x...)',
        'Tongo recipientId — her Tongo public key { x, y }',
        'Email address registered with Tongo',
        'Both her Starknet address and her Tongo private key',
      ],
      correct: 1,
      hint: 'Tongo uses a separate key system from Starknet. What identifier does the recipient share for confidential transfers?',
      explanation: 'Confidential transfers use the recipient\'s Tongo public key (recipientId), not their Starknet address. The Tongo key system is separate from the Starknet wallet key system. The recipient shares their confidential.recipientId — the object { x, y } — which you pass as the "to" field.',
    },
    {
      question: 'What is a Tongo "viewing key" used for?',
      options: [
        'Signing confidential transactions on behalf of the account owner',
        'Selectively allowing a third party (auditor, regulator) to decrypt and verify your transaction history without gaining signing authority',
        'Viewing other users\' confidential balances without their knowledge',
        'Recovering access to your confidential account if you lose your private key',
      ],
      correct: 1,
      hint: 'View = read only. What can you let someone see without letting them control your account?',
      explanation: 'A viewing key grants read access to your Tongo transaction history. An auditor with your viewing key can decrypt and verify every amount you sent and received. They cannot initiate transactions. This enables compliance with financial regulations (which require transaction records) without sacrificing privacy from the public.',
    },
    {
      question: 'Why is the Tongo private key separate from your Starknet wallet key?',
      options: [
        'For regulatory reasons — blockchain regulators require separate keys for privacy transactions',
        'Tongo uses a different cryptographic curve than Starknet — the key systems are technically incompatible',
        'To limit the blast radius if one key is compromised — losing your Starknet key does not compromise your confidential history and vice versa',
        'To make transactions faster — separate keys process in parallel',
      ],
      correct: 2,
      hint: 'Think about security separation. What is the benefit of keeping two different sensitive keys separate?',
      explanation: 'Separate keys limit exposure. If your Starknet wallet key is compromised, the attacker cannot access your confidential Tongo history or funds — they need both keys. Conversely, a compromised Tongo key does not give signing authority over your public Starknet wallet.',
    },
    {
      question: 'You have 100 confidential USDC in Tongo. You want to use 50 USDC on Vesu. What steps are needed?',
      options: [
        'Vesu directly integrates with Tongo — supply confidential USDC in one step',
        'Call confidentialWithdraw() to convert 50 confidential USDC to public USDC, then supply to Vesu normally',
        'Convert confidential USDC to STRK first, then supply STRK to Vesu',
        'Tongo confidential tokens cannot be converted back to public tokens',
      ],
      correct: 1,
      hint: 'Tongo and public DeFi protocols are separate systems. What bridge connects them?',
      explanation: 'Vesu operates in the public token space — it cannot read confidential balances. You must withdraw from Tongo first: confidentialWithdraw() converts 50 confidential USDC to 50 public USDC at your wallet address. Then you supply the public USDC to Vesu normally. The Starkzap tx builder can batch both operations into one transaction.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to use Tongo for all their DeFi activity to maintain maximum privacy. What trade-offs should they understand?',
      scoringCriteria: [
        'Confidential tokens must be withdrawn to public before use in most DeFi protocols',
        'Tongo private key management adds complexity — a separate key to secure',
        'Privacy and composability are in tension — more privacy = less direct DeFi integration',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A regulator asks: "How can private blockchain transfers be compliant with anti-money laundering requirements?" Explain viewing keys in 3 sentences.',
      scoringCriteria: [
        'Correctly explains that viewing keys allow selective disclosure to authorised parties',
        'Notes that the blockchain itself still verifies validity — no coins are created from nothing',
        'Explains that regulatory compliance can be achieved without making amounts public to everyone',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Tongo account has: active balance 200 USDC, pending balance 50 USDC. What is the total? What must happen before the pending balance can be spent?',
      scoringCriteria: [
        'Total correctly identified as 250 USDC',
        'Correctly states pending balance requires a rollover() call to move to active balance',
        'Explains pending comes from received confidential transfers that have not yet been activated',
      ],
    },
  ],
  links: [{ label: 'Tongo Cash', url: 'https://tongo.cash' }],
};

const L306: StarknetIslandLevel = {
  id: 306, mechanic: 'match3', tier: 'pro',
  topic: 'Gaming on Starknet',
  explanation: `Most online games have a hidden problem: the game company owns everything. Your items, your progress, your character — all stored on their servers. If the company shuts down, your 2,000 hours vanish. If they decide your character should be worthless, it is. You have no recourse.

Fully on-chain games flip this. Every game state — character stats, item ownership, world events — is stored on the blockchain. No server can alter it. No company can take it back. The game continues existing even after the studio closes, because the rules are in immutable smart contracts.

Starknet is the leading chain for this because ZK proofs make on-chain computation cheap enough to use as a game engine. Every move is verifiable; the entire game history is provable.

Dojo is the Cairo-based game engine built for this. It uses Entity-Component-System (ECS) architecture — the same pattern used in traditional game engines like Unity. You define Entities (characters), Components (stats like health and speed), and Systems (the logic that changes them). All of it runs on Starknet.

Cartridge Controller solves the UX problem. Games require hundreds of tiny transactions per session. Cartridge uses session keys — you approve gameplay rules once, and Cartridge signs individual moves invisibly. No popup per move. No gas fee per move. The game feels exactly like a Web2 mobile game.

Top games: Loot Survivor 2, Ponziland, Influence, Realms of Eternal.`,
  fact: 'Starknet fully on-chain games: Dojo (Cairo ECS game engine), Cartridge Controller (session keys, gasless gameplay). Top games: Loot Survivor 2, Ponziland, Influence. Game state is permanent, owned by players, immune to shutdown.',
  plain: 'On-chain games live forever — no server, no company, just smart contracts. Dojo builds them. Cartridge makes them feel like normal apps with Face ID login and no visible gas fees.',
  stars: [700, 860, 1075], target: 1075, coins: 70,
  examples: [
    {
      contextTag: '[Studio shutdown, game survives]',
      scenario: 'A fully on-chain Starknet game studio runs out of funding and shuts down. What happens to the game?',
      outcome: 'The smart contracts remain deployed on Starknet permanently. Any developer can build a new frontend that connects to the same contracts. Players who built characters, accumulated items, or earned in-game currency retain everything — their state is on the blockchain, not the studio\'s server.',
    },
    {
      contextTag: '[Session keys in action]',
      scenario: 'A player starts a Loot Survivor 2 session. Without session keys: every attack, dodge, and item use requires a wallet signature popup.',
      outcome: 'With Cartridge session keys, the player approves gameplay rules once at session start (e.g., "allow up to 100 in-game actions within this session"). Cartridge signs each move invisibly. The player sees no popups. They play normally. All 100 actions are real Starknet transactions — the player never knew.',
    },
    {
      contextTag: '[Dojo ECS, developer perspective]',
      scenario: 'A game developer builds a character system in Dojo using ECS architecture.',
      outcome: 'They define: Entity = Character (identified by a Starknet address). Components = Health (u32), Speed (u32), Level (u16). Systems = MoveSystem (updates position), CombatSystem (decrements health). The ECS relationships are automatically stored on Starknet. The developer writes Cairo — the framework handles storage and state management.',
    },
  ],
  keyTakeaway: 'Starknet gaming = permanent game state players truly own + Cartridge session keys making it feel like a normal game. Dojo is the Cairo engine. ZK proofs make it affordable.',
  guidedPractice: [
    {
      question: 'What makes a game "fully on-chain" and why does it matter for players?',
      options: [
        'The game uses cryptocurrency for in-app purchases — that is the only on-chain component',
        'All game state (characters, items, world events) is stored in smart contracts — the game exists and functions even without the original developer',
        'The game\'s graphics are stored on IPFS and the game logic runs on a server',
        'Players pay gas fees for every action — this is what "on-chain" refers to in gaming',
      ],
      correct: 1,
      hint: 'Think about what happens if the studio shuts down. Where is the game state?',
      explanation: 'A fully on-chain game stores all meaningful state — characters, items, progress, world events — in smart contracts on the blockchain. No central server holds critical data. The game continues to exist and function permanently, regardless of what happens to the original development team.',
    },
    {
      question: 'What does ECS stand for in the Dojo game engine?',
      options: [
        'Encrypted Contract Storage',
        'Entity-Component-System',
        'Executable Cairo Scripts',
        'External Contract Synchronisation',
      ],
      correct: 1,
      hint: 'ECS is a well-known game development architectural pattern also used in traditional engines like Unity.',
      explanation: 'Entity-Component-System: Entities are the game objects (a character). Components are the data attached to entities (health: 100, speed: 5). Systems are the logic that transforms components (combat system reduces health). Dojo implements this pattern in Cairo, storing all ECS data on Starknet.',
    },
    {
      question: 'Without session keys, how many wallet signature popups would a player see in a 100-move game session?',
      options: [
        'One — the initial game session approval covers all moves',
        'One per type of action — approximately 5-10 for a typical game',
        'One per move — 100 signature popups for 100 moves',
        'Zero — games on Starknet are always gasless by default',
      ],
      correct: 2,
      hint: 'Each on-chain game move is a transaction. What does each transaction normally require?',
      explanation: 'Without session keys, every on-chain game move requires a wallet signature. 100 moves = 100 signature popups. This is completely unusable as a game experience. Session keys are essential — they pre-approve a batch of moves, so Cartridge can sign them invisibly without interrupting gameplay.',
    },
    {
      question: 'Why is Starknet particularly suitable for fully on-chain games compared to Ethereum mainnet?',
      options: [
        'Starknet has a native game development SDK that Ethereum lacks',
        'ZK proofs make individual transactions cheap enough for game mechanics — game moves cost fractions of a cent vs dollars on Ethereum mainnet',
        'Starknet\'s consensus mechanism is faster than Ethereum\'s, enabling real-time gameplay',
        'Starknet has no gas fees at all for gaming applications',
      ],
      correct: 1,
      hint: 'Think about what makes on-chain gaming economically viable. What is the cost barrier on Ethereum mainnet?',
      explanation: 'A single Ethereum mainnet transaction costs $2-20 in gas. A game move costing $5 is economically absurd. On Starknet, transactions cost fractions of a cent — a STARK proof amortises the cost across thousands of transactions. Game moves become economically viable. This is why fully on-chain gaming emerged on Starknet and not Ethereum mainnet.',
    },
    {
      question: 'An item you earned in a Dojo-based on-chain game has a specific token ID on Starknet. The studio releases a new game version that "removes" your item. What actually happens?',
      options: [
        'Your item disappears — the studio controls all game state',
        'The smart contract containing your item remains unchanged — the studio can change their frontend but cannot alter on-chain state they do not own',
        'Starknet governance must approve any game state changes',
        'Your item is burned automatically when a new game version is deployed',
      ],
      correct: 1,
      hint: 'Who controls the smart contract? What can and cannot be changed after deployment?',
      explanation: 'Deployed smart contracts on Starknet are immutable — the code does not change after deployment. Your item token ID and ownership are in the contract. The studio can update their frontend and game logic for new contracts, but they cannot alter your ownership in the original deployed contract. Truly owned means truly owned.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Explain why a player might prefer a fully on-chain game over a traditional mobile game, using only concepts a non-crypto user would understand. 3 sentences.',
      scoringCriteria: [
        'Explains permanent ownership without blockchain jargon (e.g. "your items exist even if the company closes")',
        'Mentions verifiable fairness (the rules cannot be secretly changed)',
        'Does not make unrealistic claims — acknowledges the experience is still evolving',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A player is considering approving a Cartridge session key for a new game that requests: "allow all transactions from this wallet for 30 days." Should they approve?',
      scoringCriteria: [
        'Correctly identifies this as overly broad — all transactions for 30 days gives too much authority',
        'Explains that session keys should be scoped: specific contract, specific methods, time limit',
        'Recommends rejecting and asking for a narrower scope (e.g. "allow these 5 game contract calls for 2 hours")',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A game has 50,000 daily active users making 200 moves each. On Ethereum mainnet at $5/tx: daily transaction cost to users. On Starknet at $0.001/tx. Calculate both. What is the annual cost difference?',
      scoringCriteria: [
        'Ethereum daily: 50,000 × 200 × $5 = $50,000,000/day',
        'Starknet daily: 50,000 × 200 × $0.001 = $10,000/day',
        'Annual difference: approximately $18.24B — correctly demonstrates why on-chain gaming only works on L2',
      ],
    },
  ],
  links: [{ label: 'Cartridge', url: 'https://cartridge.gg' }, { label: 'Dojo engine', url: 'https://dojoengine.org' }],
};

const L307: StarknetIslandLevel = {
  id: 307, mechanic: 'memory', tier: 'pro',
  topic: 'The Starknet Ecosystem Map',
  explanation: `Every mature blockchain ecosystem is a city — protocol layer (the roads), infrastructure (utilities), applications (buildings), and users. Starknet is a city in construction: the roads are built, utilities are running, the first buildings are occupied, but most of the skyline is not yet there.

The core infrastructure: StarkWare built and maintains the Starknet protocol. Nethermind runs the node client — the software that validators use to participate. Pragma is the oracle — it feeds real-world data (asset prices, timestamps) to smart contracts that need external information. Without an oracle, a lending protocol cannot know the current price of ETH.

The wallet layer: Argent X (social recovery, browser extension), Braavos (biometric mobile), Cartridge Controller (gaming, session keys). All are smart contract accounts using Starknet's native AA.

The DeFi layer: AVNU (DEX aggregator), Ekubo (concentrated AMM), Vesu (lending), Nostra (money market), ZKLend (lending). These cover all standard DeFi primitives.

The gaming layer: Cartridge (controller and infrastructure), Realms/Bibliotheca DAO (game studio), StarkWare-backed gaming initiatives.

The funding layer: Starknet Foundation offers grants up to $1M. Builder programs, hackathons, and ecosystem VCs (including StarkWare Ventures) are active.

The opportunity: most categories have one or two dominant players. The third strong protocol in lending, the first strong DEX on a specific token niche, the gaming studio that builds a mainstream hit — these positions are still open.`,
  fact: 'Starknet ecosystem: StarkWare (protocol), Nethermind (node), Pragma (oracle), Argent/Braavos/Cartridge (wallets), AVNU/Ekubo (DEXs), Vesu/Nostra (lending), Realms/Cartridge (gaming). Foundation grants up to $1M.',
  plain: 'Starknet has every layer of a mature ecosystem but most categories have only 1-2 dominant players. The third strong protocol in any category is still unbuilt. That is the opportunity.',
  stars: [720, 885, 1105], target: 1105, coins: 72,
  examples: [
    {
      contextTag: '[Oracle dependency, DeFi protocol]',
      scenario: 'Vesu needs to know the current ETH/USD price to calculate whether a borrower\'s health factor has dropped below 1.0.',
      outcome: 'Vesu calls Pragma, Starknet\'s oracle, for the live ETH/USD price. Pragma aggregates prices from multiple sources (Binance, Coinbase, etc.) and provides a manipulation-resistant price feed. Without Pragma, Vesu cannot function safely — an attacker could manipulate prices to trigger false liquidations.',
    },
    {
      contextTag: '[Ecosystem gap, opportunity]',
      scenario: 'A developer researches Starknet\'s options-trading protocols. They find none.',
      outcome: 'Options trading — calls and puts on Starknet assets — does not yet have a dominant protocol. Ethereum has Lyra, Dopex, Panoptic. Starknet has none at scale. This is an open building opportunity in a category that historically generates significant trading volume.',
    },
    {
      contextTag: '[Grant application, builder]',
      scenario: 'A team has built a Starknet yield aggregator with $2M TVL. They apply for a Starknet Foundation Growth Grant.',
      outcome: 'Their application includes: specific product description, user metrics, team background, and three milestones with specific outcomes (e.g. $10M TVL, 5,000 active wallets, 3 protocol integrations). The Foundation evaluates on specificity and feasibility. Teams with deployed products have significantly higher approval rates than teams with only ideas.',
    },
  ],
  keyTakeaway: 'The Starknet ecosystem is complete at the infrastructure layer but early at the application layer — most protocol categories have room for a strong new entrant.',
  guidedPractice: [
    {
      question: 'What is an oracle and why does DeFi need one?',
      options: [
        'An oracle is a prediction market where users bet on future prices',
        'An oracle is a service that feeds real-world data (like asset prices) to smart contracts that cannot access external data directly',
        'An oracle is a type of wallet that predicts optimal transaction timing',
        'An oracle is a Starknet node that specialises in processing DeFi transactions',
      ],
      correct: 1,
      hint: 'Smart contracts can only read data that is already on the blockchain. What is the problem with external data like prices?',
      explanation: 'Smart contracts are deterministic — they can only use data that exists on-chain. Real-world data (ETH/USD price, timestamps, sports results) must be brought on-chain by an oracle. Pragma aggregates prices from multiple sources and publishes them to Starknet so DeFi protocols can use current market data safely.',
    },
    {
      question: 'Which Starknet wallet is specifically designed for gaming with session key support?',
      options: [
        'Argent X — the most popular and feature-rich',
        'Braavos — the mobile-first biometric wallet',
        'Cartridge Controller — gaming-specific with session keys and passkey auth',
        'MetaMask — the most widely supported wallet across all chains',
      ],
      correct: 2,
      hint: 'Session keys are essential for gaming. Which wallet was built specifically for this use case?',
      explanation: 'Cartridge Controller is the gaming-focused wallet for Starknet. It supports passkey authentication and session keys, enabling gasless gameplay where individual moves are signed invisibly. It is designed to make blockchain games feel indistinguishable from regular mobile games.',
    },
    {
      question: 'The Starknet Foundation offers grants up to what maximum amount?',
      options: [
        '$10,000 — small SEED grants only',
        '$100,000 — for established teams',
        '$1,000,000 — for significant ecosystem projects',
        'Unlimited — Foundation evaluates total funding need',
      ],
      correct: 2,
      hint: 'The Foundation supports significant ecosystem development. Check the earlier lessons for the specific figure.',
      explanation: 'Starknet Foundation Growth Grants go up to $1M for ecosystem projects. SEED Grants are smaller and faster. The key requirement for any grant: a specific product, defined users, measurable milestones, and an honest team assessment.',
    },
    {
      question: 'What role does Nethermind play in the Starknet ecosystem?',
      options: [
        'Nethermind is the team that developed the Starknet protocol',
        'Nethermind runs the node client software that validators use to participate in Starknet',
        'Nethermind operates the AVNU DEX aggregator',
        'Nethermind is Starknet\'s official auditing firm',
      ],
      correct: 1,
      hint: 'Node client = the software that makes validators work. Think about what Geth does for Ethereum.',
      explanation: 'Nethermind builds and maintains the Starknet node client — the software validators run to participate in the network. Similar to how Geth and Besu are Ethereum clients. Having multiple independent client implementations improves network resilience.',
    },
    {
      question: 'A developer notices there is no dominant perpetuals (perps) trading protocol on Starknet. What does this represent?',
      options: [
        'A warning sign — the lack of perps means the ecosystem is not mature enough',
        'An open building opportunity — perps is a high-volume category with no incumbent on Starknet',
        'Confirmation that Starknet does not support complex DeFi primitives',
        'Evidence that Starknet users prefer spot trading exclusively',
      ],
      correct: 1,
      hint: 'Think about Ethereum ecosystem: dYdX, Hyperliquid, GMX generate billions in volume. Starknet has none at scale.',
      explanation: 'Perpetuals trading generates among the highest volume in DeFi. Starknet has the technical infrastructure to support perps (Cairo contracts, oracle data, account abstraction for UX). No dominant protocol has yet captured this market on Starknet. This is a ground-floor building opportunity in a category with proven massive demand.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starknet DeFi TVL: $800M. Ethereum DeFi TVL: $60B. Starknet wallet count: 800,000. Ethereum wallet count: 250M. What do these ratios tell you about the relative stage of the ecosystem?',
      scoringCriteria: [
        'TVL ratio: $800M / $60B = 1.3% — early but not trivial',
        'Wallet ratio: 800K / 250M = 0.32% — much earlier on user adoption',
        'Conclusion: Starknet DeFi has meaningful TVL relative to its user base — capital-efficient early adopters, not yet mass market',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A developer wants to build a Starknet protocol in a category that already has two strong incumbents (e.g. lending with Vesu and Nostra). What challenges will they face?',
      scoringCriteria: [
        'Network effects — existing protocols have user trust and liquidity that takes time to replicate',
        'Differentiation challenge — must offer something meaningfully different, not just "another lending protocol"',
        'TVL bootstrapping — empty pools cannot compete on rates; need strategy to attract initial liquidity',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A VC asks: "Why should I fund a Starknet project now instead of waiting until the ecosystem is more mature?" Give a 3-sentence answer.',
      scoringCriteria: [
        'References first-mover advantage and network effects in protocol ecosystems',
        'Notes that Ethereum\'s most successful protocols were funded at comparable TVL/user stages',
        'Acknowledges the risk honestly — does not oversell certainty',
      ],
    },
  ],
  links: [{ label: 'Ecosystem map', url: 'https://www.starknet.io/ecosystem' }, { label: 'Pragma oracle', url: 'https://pragma.build' }],
};

const L308: StarknetIslandLevel = {
  id: 308, mechanic: 'chain', tier: 'pro',
  topic: 'Building on Starknet with Starkzap',
  simulatorLesson: 'starkzap-build',
  explanation: `Every application layer you have seen — AVNU, Vesu, Cartridge, Tongo — was built by a developer who started at the same place you are now: knowing what Starknet can do, but not yet knowing how to build it.

The Starknet developer stack has five layers, each with one job. Cairo is the programming language — you write smart contracts in Cairo. Scarb is the build tool — it compiles Cairo and manages dependencies, equivalent to npm for JavaScript. Starknet Foundry (snforge) is the testing framework — you write tests in Cairo that simulate deploying and interacting with your contracts. Starkli is the command-line deployment tool — it takes your compiled contract and deploys it to Sepolia or mainnet. The Starkzap SDK is the frontend layer — TypeScript/React Native that connects users to your deployed contract.

The Starkzap SDK is what bridges the chain you have learned about and the users who need to interact with it. wallet.execute([call]) sends arbitrary contract calls. For reading: the SDK uses the starknet.js provider underneath. For gasless: feeMode: "sponsored" wraps everything through AVNU Paymaster.

For React Native specifically — this entire app — you use starkzap-native. It re-exports the full SDK API and adds a Metro helper (withStarkzap) for polyfill injection. The same code that works on web works on mobile.

Starkzap is how SkillUp integrates with Starknet. Every simulator in this island is powered by the Starkzap SDK.`,
  fact: 'Starknet dev stack: Cairo → Scarb (build) → snforge (test) → Starkli (deploy) → Starkzap SDK (frontend). For React Native: starkzap-native + withStarkzap Metro wrapper. wallet.execute() for arbitrary contract calls.',
  plain: 'Five tools, one job each. Write Cairo. Build with Scarb. Test with snforge. Deploy with Starkli. Connect users with Starkzap. This app runs on Starkzap — every live transaction in these lessons is real.',
  stars: [740, 910, 1135], target: 1135, coins: 74,
  examples: [
    {
      contextTag: '[First deployed contract]',
      scenario: 'A developer writes a simple Cairo counter contract, tests it with snforge, and deploys it to Sepolia with Starkli.',
      outcome: 'The deploy command returns a class hash (the compiled bytecode identifier) and a contract address (the specific instance). The developer can now call increment() on their contract from a Starkzap-powered frontend. The transaction appears on Voyager Sepolia with the function call visible.',
    },
    {
      contextTag: '[React Native integration, SkillUp-style]',
      scenario: 'A developer adds Starkzap to an existing React Native/Expo app.',
      outcome: 'npm install starkzap-native. Wrap metro.config.js with withStarkzap(). Import StarkZap from starkzap-native. Create sdk = new StarkZap({ network: "sepolia" }). Call sdk.connectWallet(). Three configuration changes, 10 minutes — the app can now execute Starknet transactions.',
    },
    {
      contextTag: '[Starkzap in SkillUp]',
      scenario: 'A user completes the staking lesson in SkillUp and the simulator calls wallet.stake().',
      outcome: 'The Starkzap SDK inside SkillUp sends a real transaction to the Starknet Sepolia staking contract. The user\'s testnet STRK balance decreases. Their staked position appears on Voyager. The transaction hash is displayed in the lesson. All of this happens gaslessly via the AVNU Paymaster — the user paid nothing.',
    },
  ],
  keyTakeaway: 'The Starknet dev stack is Cairo → Scarb → snforge → Starkli → Starkzap. Starkzap is the frontend SDK that connects users to any deployed contract, gaslessly, on web or React Native.',
  guidedPractice: [
    {
      question: 'What is Scarb\'s role in the Starknet development stack?',
      options: [
        'The command-line tool for deploying contracts to Starknet',
        'The Cairo package manager and build tool — compiles Cairo code and manages dependencies',
        'The testing framework for writing unit tests for Cairo contracts',
        'The block explorer for verifying deployed contracts',
      ],
      correct: 1,
      hint: 'Think about what npm does for JavaScript. Scarb does the equivalent for Cairo.',
      explanation: 'Scarb is Cairo\'s package manager and build tool. It reads Scarb.toml for project configuration, downloads dependencies, and compiles Cairo source to Sierra (intermediate representation) and then to CASM (Cairo Assembly). It is the first tool you use after writing Cairo code.',
    },
    {
      question: 'What does Starkli declare versus Starkli deploy do?',
      options: [
        'Declare and deploy are the same command with different flags',
        'Declare uploads the compiled bytecode (class hash) to Starknet; deploy creates a specific instance of that class at a new address',
        'Declare registers the contract with the Foundation; deploy makes it live for users',
        'Declare tests the contract; deploy pushes it to mainnet',
      ],
      correct: 1,
      hint: 'Think about the difference between a blueprint and a building. What does each step produce?',
      explanation: 'Declare uploads your compiled contract bytecode to Starknet and returns a class hash — the bytecode\'s unique identifier. Multiple contracts can share the same class hash (same code, different instances). Deploy creates a specific instance at a unique address using a declared class hash. You declare once and can deploy many instances.',
    },
    {
      question: 'Why does starkzap-native require a Metro config wrapper (withStarkzap)?',
      options: [
        'To add TypeScript support to the Metro bundler',
        'To inject required polyfills (crypto, buffer, etc.) and resolver compatibility needed by Starknet cryptographic libraries in React Native',
        'To enable hot reloading for Starkzap components',
        'To configure the AVNU Paymaster endpoint in the Metro build',
      ],
      correct: 1,
      hint: 'React Native\'s JavaScript environment is not Node.js. What browser/Node APIs might Starknet crypto libraries expect?',
      explanation: 'Starknet cryptographic libraries expect browser/Node.js APIs (crypto, Buffer, TextEncoder) that React Native\'s JavaScript environment does not provide by default. withStarkzap injects polyfills that bridge this gap and configures Metro\'s module resolver to handle the specific package aliases required by Starkzap\'s dependencies.',
    },
    {
      question: 'wallet.execute([call]) in Starkzap requires a call object with which three fields?',
      options: [
        'txHash, blockNumber, networkId',
        'contractAddress, entrypoint, calldata',
        'from, to, amount',
        'abi, functionName, args',
      ],
      correct: 1,
      hint: 'Think about what you need to call a specific function on a specific contract.',
      explanation: 'A Starknet call requires: contractAddress (which contract to call), entrypoint (which function on that contract), and calldata (the function arguments as an array of field elements). wallet.execute() takes an array of these call objects — multiple calls execute atomically in one transaction.',
    },
    {
      question: 'Every live transaction in the SkillUp Starknet Island is executed via Starkzap. What happens to these transactions?',
      options: [
        'They are simulated inside the app and do not reach the blockchain',
        'They are recorded on a private Starknet fork used only by SkillUp',
        'They are real transactions on Starknet Sepolia — they get transaction hashes and appear on Voyager Sepolia',
        'They are sent to Starknet mainnet and cost real STRK',
      ],
      correct: 2,
      hint: 'The Starkzap SDK sends real transactions. On which network are the SkillUp lessons configured?',
      explanation: 'SkillUp\'s Starkzap integration uses Starknet Sepolia — the official testnet. Every swap, stake, and lend action in the simulator is a real transaction on Sepolia. It gets a hash. It appears on sepolia.voyager.online. It changes testnet state. The only difference from mainnet: testnet tokens have no real monetary value.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A developer says "I want to build on Starknet but I only know JavaScript, not Cairo." What advice do you give? 3 sentences.',
      scoringCriteria: [
        'Correctly identifies that the Starkzap SDK frontend layer uses TypeScript — immediately accessible',
        'Notes that Cairo is needed for new smart contracts but not required to build frontends for existing contracts',
        'Suggests a progression: start with Starkzap frontend → learn Cairo for contract development',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A developer deploys a Cairo contract with class hash 0xabc123. They want to deploy 5 identical instances for different users. How many declare operations? How many deploy operations?',
      scoringCriteria: [
        'One declare operation — the bytecode is uploaded once, class hash 0xabc123',
        'Five deploy operations — each creates a unique instance at a unique address',
        'Correctly explains that declare and deploy are separate steps',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A developer skips Starknet Foundry testing and deploys directly to Sepolia for the first time. What risks does this create?',
      scoringCriteria: [
        'Logic bugs are only discovered with real transactions — late and costly to debug',
        'Sepolia deployments are permanent — cannot un-deploy or edit the bytecode after declaring',
        'Real gas cost (even testnet) and time wasted iterating on broken deployments without tests',
      ],
    },
  ],
  links: [{ label: 'Starkzap SDK', url: 'https://docs.starknet.io/build/starkzap/quick-start' }, { label: 'Cairo Book', url: 'https://book.cairo-lang.org' }],
};

const L309: StarknetIslandLevel = {
  id: 309, mechanic: 'match3', tier: 'pro',
  topic: 'Governance & Grants',
  explanation: `When Ethereum wants to change how it works, Vitalik can propose an idea — but it doesn't happen automatically. The proposal goes through the EIP (Ethereum Improvement Proposal) process: community discussion, developer review, reference implementation, and eventually hard fork if consensus is reached. Starknet uses the same model with SNIPs.

SNIP stands for Starknet Improvement Proposal. Any community member can write one. It goes through: draft → community discussion on the Starknet forum → formal vote on Snapshot (the governance voting platform). Votes are weighted by STRK balance — more STRK = more voting weight. Approved SNIPs are implemented by StarkWare in subsequent protocol upgrades.

You can participate without writing a SNIP. Watch the governance forum at community.starknet.io. Vote on active proposals via Snapshot — you need STRK to vote. Share technical analysis that helps other voters make informed decisions.

The Starknet Foundation manages the ecosystem grant program. Two tiers: SEED Grants (smaller amounts, faster review, for early-stage projects), and Growth Grants (larger amounts up to $1M, more rigorous evaluation for established teams with demonstrated traction).

What wins grants: a specific product that real users will use, a team with relevant experience, three milestones with measurable outcomes, and honest assessment of what could go wrong. What fails: vague descriptions, teams with no relevant background, milestones phrased as activities ("we will build X") rather than outcomes ("X users will Y").`,
  fact: 'SNIPs (Starknet Improvement Proposals) govern protocol changes. STRK holders vote on Snapshot. Starknet Foundation grants: SEED (fast, smaller) and Growth (up to $1M). Key: specific product, real users, measurable milestones.',
  plain: 'STRK holders vote on how Starknet evolves — like shareholders voting on company direction. The Foundation gives grants up to $1M to teams building real products. What wins grants: specificity, traction, honest milestones.',
  stars: [760, 935, 1165], target: 1165, coins: 76,
  examples: [
    {
      contextTag: '[SNIP voting, active participant]',
      scenario: 'SNIP-14 proposes changing Starknet\'s fee mechanism. Voting is open for 7 days on Snapshot.',
      outcome: 'A developer with 5,000 STRK connects their wallet to Snapshot, reads the SNIP, and votes "For" after reviewing the technical analysis. Their 5,000 STRK vote is recorded permanently on Snapshot. They then post technical commentary on the forum that influences three other voters. Community governance working as intended.',
    },
    {
      contextTag: '[Winning grant application]',
      scenario: 'A two-person team applies for a Starknet Foundation SEED Grant. Their application: "Build a Starknet DEX aggregator focused on institutional-grade trade execution."',
      outcome: 'Rejected. Too vague — "institutional-grade" is undefined. No user metrics. No milestones. They revise: "Build a Starknet DEX aggregator with RFQ (request-for-quote) pricing for trades above $10,000 — targeting Starknet DeFi protocols needing large, low-impact swaps. Milestone 1 (30 days): working prototype with AVNU + Ekubo integration. Milestone 2 (60 days): 3 protocol integrations. Milestone 3 (90 days): $500K monthly volume." Second application: approved.',
    },
    {
      contextTag: '[STRK holder, governance strategy]',
      scenario: 'A community member has 1,000 STRK and wants to maximise their governance influence while still earning staking rewards.',
      outcome: 'Most Starknet governance implementations count staked STRK for voting. The holder stakes 900 STRK for 9% APY and retains 100 STRK liquid for operational use. Their full 1,000 STRK (900 staked + 100 liquid) counts toward their Snapshot voting weight. They earn yield AND participate in governance.',
    },
  ],
  keyTakeaway: 'Governance via SNIPs + Snapshot voting. Grants via Foundation — SEED (fast) or Growth (up to $1M). Win grants with specific products, real users, and outcome-based milestones.',
  guidedPractice: [
    {
      question: 'What is Snapshot and how is it used in Starknet governance?',
      options: [
        'Snapshot is a block explorer for viewing Starknet governance transaction history',
        'Snapshot is an off-chain voting platform where STRK holders vote on governance proposals — votes weighted by token balance',
        'Snapshot is a tool for taking point-in-time copies of Starknet blockchain state',
        'Snapshot is the Starknet Foundation\'s grant application portal',
      ],
      correct: 1,
      hint: 'Snapshot is used across many crypto ecosystems for governance voting. What does it do?',
      explanation: 'Snapshot is a gasless governance voting platform. Voters connect their wallet, and Snapshot reads their STRK balance at the time of the vote. Larger balances have more voting weight. Votes are signed cryptographically but recorded off-chain — no gas fee to vote. Approved proposals are then implemented on-chain by the development team.',
    },
    {
      question: 'What is the difference between a SEED grant and a Growth grant?',
      options: [
        'SEED grants are for individuals; Growth grants are for companies',
        'SEED grants are smaller and faster for early-stage projects; Growth grants are larger (up to $1M) with more rigorous evaluation for teams with demonstrated traction',
        'SEED grants fund research; Growth grants fund production deployments',
        'They are identical — the names are used interchangeably by the Foundation',
      ],
      correct: 1,
      hint: 'Think about what "seed" means in startup funding vs "growth" stage.',
      explanation: 'SEED grants are designed for early-stage projects — smaller amounts, faster review process, lower bar for demonstrated traction. They fund experimentation. Growth grants require demonstrated product-market fit and are evaluated more rigorously. They fund scaling what is already working.',
    },
    {
      question: 'A grant application states: "Milestone 1: We will build the smart contracts." Why is this a weak milestone?',
      options: [
        'Smart contract development is not fundable by the Foundation',
        'It describes an activity (building) rather than an outcome (X users, Y TVL, Z integrations) — the Foundation cannot evaluate success',
        'Milestones should always be time-bound, and this has no deadline',
        'Smart contracts must be audited before they qualify as a milestone',
      ],
      correct: 1,
      hint: 'Think about how you would know if this milestone was achieved successfully. What would you measure?',
      explanation: 'Activity-based milestones ("we will build X") are impossible to evaluate. What does success look like? Strong milestones are outcome-based: "Milestone 1 (30 days): deployed and verified contract on Sepolia with 500 test interactions." The Foundation can verify this objectively.',
    },
    {
      question: 'How do STRK holders vote on a SNIP?',
      options: [
        'By sending STRK to a specific wallet address that represents each voting option',
        'By connecting their wallet to Snapshot and signing a vote — no gas fee, vote weighted by STRK balance',
        'By delegating their voting power to a validator who votes on their behalf',
        'By submitting a vote transaction directly to the Starknet governance contract',
      ],
      correct: 1,
      hint: 'Snapshot is gasless. What is the mechanism for participating?',
      explanation: 'Voting on Snapshot is gasless — you connect your wallet, sign the vote cryptographically, and Snapshot records it. No transaction is sent to the blockchain. Your vote weight equals your STRK balance at the snapshot block. This makes participation accessible — no gas cost to engage in governance.',
    },
    {
      question: 'Can a SkillUp Starknet user participate in Starknet governance after completing this island?',
      options: [
        'No — governance requires at least 10,000 STRK',
        'Yes — any STRK holder can vote on Snapshot regardless of amount. More STRK = more voting weight but any amount qualifies.',
        'Only if they have a verified Cairo developer identity on GitHub',
        'Yes, but only after completing the Cairo Builder skill track',
      ],
      correct: 1,
      hint: 'Governance is permissionless. Is there a minimum token threshold on Snapshot?',
      explanation: 'Any STRK holder can vote on governance proposals. There is no minimum. A user with 10 STRK has less voting weight than one with 10,000 STRK, but both can vote. This is how token-weighted governance works. After this island, users hold testnet STRK — they would need mainnet STRK to vote in actual governance.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Write a 50-word grant application introduction for a Starknet project that builds a mobile-first DCA interface. Make it specific, not vague.',
      scoringCriteria: [
        'Identifies a specific user problem (e.g. "Starknet has no mobile DCA app — existing options require desktop")',
        'States the specific solution with a measurable target',
        'Under 50 words — demonstrates discipline in communication',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A SNIP proposes increasing Starknet\'s block gas limit by 4x to support higher transaction throughput. What are the risks of approving this change?',
      scoringCriteria: [
        'Node hardware requirements increase — smaller nodes may drop off the network, reducing decentralisation',
        'Block processing time increases — risk of missed blocks if validators cannot process in time',
        'State growth accelerates — long-term storage burden on all nodes',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Snapshot vote on SNIP-15: 8.2M STRK votes For (68%), 3.8M STRK votes Against (32%). Quorum required: 5M STRK. Did the vote pass? What does the result mean for implementation?',
      scoringCriteria: [
        'Total votes: 12M STRK — exceeds the 5M quorum requirement',
        'SNIP passed: 68% For > typical 50% threshold',
        'Implementation: StarkWare will include the change in the next planned protocol upgrade',
      ],
    },
  ],
  links: [{ label: 'Governance', url: 'https://governance.starknet.io' }, { label: 'Grants', url: 'https://www.starknet.io/grants' }],
};

const L310: StarknetIslandLevel = {
  id: 310, mechanic: 'chain', tier: 'pro',
  topic: '⚡ Boss: The Complete Starknet Picture',
  simulatorLesson: 'starkzap-boss',
  isBoss: true,
  explanation: `You have covered the full stack of Starknet — from cryptographic foundations to live DeFi transactions to governance. Here is what you have learned, compressed into the mental model that separates people who understand Starknet from people who have merely heard about it.

Three primitives make Starknet unique. First: ZK proofs (STARKs). Every computation on Starknet is verifiable without re-execution. This enables cheap, secure scaling. It also enables the next primitive. Second: Account Abstraction. Every Starknet account is a smart contract. This means wallets are programmable — social login, gasless transactions, session keys, and guardian recovery are native. Third: Cairo. The only language designed to produce automatically ZK-verifiable programs. These three primitives together unlock use cases that are either impossible or economically unviable on any other chain.

The DeFi stack is complete: swap on AVNU, earn yield on Vesu or through staking, automate buying via DCA, bridge assets from Ethereum or Solana, use Bitcoin via wBTC/lBTC/tBTC, and transfer privately via Tongo. Every action you learned in this island was a real transaction on Starknet Sepolia powered by the Starkzap SDK.

The ecosystem is early. Most protocol categories have room for new entrants. Grants up to $1M are available. Cairo developer supply is low, demand is growing. The foundation is built — now comes the building.

This island was your introduction. The Starknet DeFi Navigator skill track, Cairo Builder track, and Ecosystem Deep Dive track take you deeper — from user to builder to contributor.`,
  fact: 'Three primitives: ZK proofs (cheap, secure scaling) + Account Abstraction (programmable wallets) + Cairo (verifiable computation). Full DeFi stack live. Ecosystem early — room to build. Grants up to $1M. Starkzap SDK powers it all.',
  plain: 'ZK + AA + Cairo = a chain where computation is provable, wallets are programmable, and code is gaslessly usable. Every lesson in this island was real. You have been on Starknet this whole time.',
  stars: [800, 980, 1220], target: 1220, coins: 80,
  examples: [
    {
      contextTag: '[The integration, all pieces connected]',
      scenario: 'A SkillUp user has completed the entire Starknet Island. They reflect on what they actually did.',
      outcome: 'They created a real Starknet wallet (AA, no seed phrase). Executed gasless transactions (AVNU Paymaster). Swapped STRK → USDC on AVNU (real DEX transaction). Staked STRK in a validator pool (real staking contract). Deposited USDC to Vesu (real lending protocol). Set up a DCA order (real recurring buy). Every action was a real Starknet Sepolia transaction. They have been "on-chain" the entire time.',
    },
    {
      contextTag: '[The thesis, stated simply]',
      scenario: 'An investor asks: "In one sentence, why Starknet over all other L2s?"',
      outcome: '"Starknet is the only L2 where every account is a smart contract, every program is ZK-verifiable, and both are built into the protocol from day one — not added as afterthoughts." AA is native, not bolt-on. ZK is the execution model, not an audit layer.',
    },
    {
      contextTag: '[The next step, builder framing]',
      scenario: 'A SkillUp user finishes this island and wonders: "What do I build?"',
      outcome: 'They identify a gap: Starknet has no mobile-first DCA interface for new users. The Starkzap SDK provides the swap and DCA infrastructure. Cairo is not required — the contracts exist. They can build a frontend, submit it as a bounty entry, and apply for a SEED grant simultaneously. The infrastructure is ready. The builder is ready.',
    },
  ],
  keyTakeaway: 'ZK proofs + Account Abstraction + Cairo — three primitives that make Starknet unique. Every transaction in this island was real. The DeFi stack is complete. The ecosystem awaits builders.',
  guidedPractice: [
    {
      question: 'What are the three primitives that make Starknet uniquely capable?',
      options: [
        'Fast consensus, low gas, and EVM compatibility',
        'ZK proofs (STARK-based scaling), Account Abstraction (programmable wallets), and Cairo (verifiable computation language)',
        'Decentralisation, security, and speed — the blockchain trilemma solved',
        'Stablecoins, DeFi protocols, and gaming infrastructure',
      ],
      correct: 1,
      hint: 'Think about what makes Starknet different from other L2s specifically — not just "faster and cheaper."',
      explanation: 'STARK proofs enable cheap, verifiable computation. Account Abstraction makes every wallet a smart contract (gasless, social login, session keys native). Cairo is the only language that compiles to automatically ZK-verifiable programs. These three work together — no other L2 has all three built natively from day one.',
    },
    {
      question: 'A user completes the SkillUp Starknet Island and wants to verify their transactions were real. What should they do?',
      options: [
        'Contact SkillUp support to request transaction records',
        'Visit sepolia.voyager.online, paste their wallet address, and see all their Starknet Sepolia transactions',
        'The transactions were simulated inside the app — they cannot be verified on-chain',
        'Download the Starknet official app and sync their transaction history',
      ],
      correct: 1,
      hint: 'Real transactions on Starknet Sepolia are publicly visible. Where?',
      explanation: 'Every Starkzap transaction is a real Starknet Sepolia transaction. Paste your wallet address into sepolia.voyager.online and you will see every swap, stake, lend, and DCA transaction you executed in these lessons. Your wallet address, the contracts you called, the amounts — all publicly verifiable on the Starknet Sepolia block explorer.',
    },
    {
      question: 'Why can a Starknet wallet have guardian recovery without a seed phrase?',
      options: [
        'Starknet has a central recovery service that stores all wallet credentials',
        'Because every Starknet account is a smart contract — recovery logic is programmable code, not a fixed protocol rule',
        'Seed phrases are automatically generated but hidden from users by Argent X',
        'Guardian recovery requires a seed phrase — the seed phrase is just optional to display',
      ],
      correct: 1,
      hint: 'Connect what you learned about Account Abstraction to the specific feature of recovery.',
      explanation: 'Account Abstraction makes every Starknet account a smart contract. Recovery rules are programmable — you write code that says "allow this guardian address to recover this account." Ethereum EOAs cannot do this because their rules are fixed at the protocol level. AA makes recovery logic flexible.',
    },
    {
      question: 'What is the difference between learning about Starknet on SkillUp and being on Starknet?',
      options: [
        'There is no difference — all learning is theoretical',
        'On SkillUp, Starknet Island lessons include live Starkzap SDK transactions on Sepolia — users are on Starknet while learning',
        'Being on Starknet requires mainnet tokens — SkillUp uses a private simulation network',
        'Learning is passive reading; being on Starknet requires writing Cairo code',
      ],
      correct: 1,
      hint: 'Think about what the simulator lessons actually did.',
      explanation: 'Every simulator lesson in the Starknet Island executed real Starkzap SDK transactions on Starknet Sepolia. Users created real wallets, made real swaps, staked in real pools, deposited to real lending contracts. They were on Starknet the entire time — learning and doing simultaneously.',
    },
    {
      question: 'A user wants to go from "completed Starknet Island" to "earning money from Starknet." What is the most direct path?',
      options: [
        'Buy STRK and wait for the price to increase',
        'Bridge to mainnet, stake STRK for 5-12% APY, lend USDC on Vesu — using exactly what was practised on Sepolia',
        'Apply for a Starknet Foundation grant immediately without building anything first',
        'Learn Cairo first — you cannot earn from Starknet without writing smart contracts',
      ],
      correct: 1,
      hint: 'The skills from this island are directly applicable to mainnet. What did you practise on Sepolia?',
      explanation: 'The island practised staking (5-12% APY) and lending (3-5% APY) on Sepolia. The same wallet.stake() and wallet.lending().deposit() calls work on mainnet. Bridge some STRK to mainnet, execute the same operations you practised, and you are earning real yield. No Cairo required — the DeFi contracts are already deployed.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'In 4 sentences, explain Starknet to someone who understands traditional banking but has never used crypto. Include: what it is, how it differs from a bank, one thing they can do with it, and one honest limitation.',
      scoringCriteria: [
        'Starknet correctly described as a decentralised financial network (no bank required)',
        'Key difference from bank: no custodian, programmable accounts, always open — not "it\'s faster"',
        'Specific use case mentioned: staking/yield, lending, privacy transfers',
        'Honest limitation: early ecosystem, learning curve, testnet vs mainnet distinction',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user is ready to move from Sepolia testnet to Starknet mainnet with $5,000. What three checks should they do before executing any mainnet transaction?',
      scoringCriteria: [
        'Verify wallet address on mainnet (not testnet) — addresses can look similar',
        'Start with a small test transaction before moving the full $5,000',
        'Verify smart contract addresses for protocols (Vesu, AVNU) from official sources — not links from random sites',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Your Starknet testnet portfolio after completing this island: 124.5 STRK wallet balance, 100 STRK staked at 8.5% APY, 100 USDC supplied to Vesu at 4.2% APY. Project annual returns on each position in STRK and USD (assume STRK = $0.80).',
      scoringCriteria: [
        'Staked STRK annual: 100 × 8.5% = 8.5 STRK = $6.80',
        'Vesu USDC annual: 100 × 4.2% = $4.20 USDC',
        'Total projected annual return: $11.00 on $180 deployed = 6.1% blended yield',
      ],
    },
  ],
  links: [
    { label: 'Starknet roadmap', url: 'https://www.starknet.io/roadmap' },
    { label: 'Start building', url: 'https://docs.starknet.io/build/starkzap/quick-start' },
    { label: 'Starkzap SDK', url: 'https://github.com/keep-starknet-strange/starkzap' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export const STARKNET_LEVELS: Record<number, Level | StarknetIslandLevel> = {
  291: L291, 292: L292, 293: L293, 294: L294, 295: L295,
  296: L296, 297: L297, 298: L298, 299: L299, 300: L300,
  301: L301, 302: L302, 303: L303, 304: L304, 305: L305,
  306: L306, 307: L307, 308: L308, 309: L309, 310: L310,
};

export const isStarknetIslandLevel = (level: Level | StarknetIslandLevel): level is StarknetIslandLevel =>
  'explanation' in level && 'guidedPractice' in level && 'examples' in level;

export function getStarknetIslandLevel(levelId: number): StarknetIslandLevel | undefined {
  const level = STARKNET_LEVELS[levelId];
  return level && isStarknetIslandLevel(level) ? level : undefined;
}

export const STARKNET_ISLAND_LEVELS = Object.values(STARKNET_LEVELS);
export const UPGRADED_LEVELS = [291, 292, 293, 294, 295, 296, 297, 298, 299, 300, 301, 302, 303, 304, 305, 306, 307, 308, 309, 310];
