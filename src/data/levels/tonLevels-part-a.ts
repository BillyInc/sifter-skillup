// ⚡ Sifter LevelUp — TON & Telegram (Island 12, Levels 166–180)
// Part A of 2 — Levels 166–173
//
// RENUMBERING NOTE: This was formerly Island 13.
// New sequence: I11 (Base) → I12 (TON) → I13 (Coinbase) → ...
//
// Chain: TON Testnet (islandId=12)
// Simulators: tonWallet, tonMiniAppDex, fragmentTrading, tonStaking,
//             rugcheck, defi, tonBoss

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 166 — TON History: From Telegram to Open Source Community
// ─────────────────────────────────────────────────────────────────────────────

const L166: IslandLevel = {
  id: 166, mechanic: 'match3', tier: 'pro',
  topic: 'TON History — From Telegram to Open Source Community',

  explanation: `
In 2018, Telegram raised $1.7 billion in one of the largest ICOs in history to build a blockchain. In 2020, the SEC sued them, alleging the tokens were unregistered securities. Telegram paid an $18.5 million settlement and walked away — returning money to investors and abandoning the project they had built.

What happened next was unusual. Rather than the project dying, an open-source community took the codebase and continued building. The TON Foundation — a group of independent developers and contributors — relaunched the project as "The Open Network." Telegram, the company, officially distanced itself. Toncoin, the network's native token, was not issued by Telegram.

Then in 2023, Telegram reversed course. It officially endorsed TON again, integrated TON Space (a self-custody wallet) directly into the Telegram app, and began building mini apps on top of TON infrastructure. The reasoning: Telegram needed a blockchain that could serve its 900 million users at scale, and TON was the only chain designed to do it.

This history matters for two reasons. First, the SEC's 2020 action created lasting regulatory uncertainty around TON and Toncoin — some exchanges are cautious about listing it, and institutional investors in regulated jurisdictions approach it carefully. Second, the relationship between Telegram and TON is collaborative but distinct: Telegram provides distribution, TON provides the blockchain. They are separate entities with aligned interests, not one company.

Understanding this structure explains why TON's user growth is real (Telegram genuinely has 900M users) while the regulatory environment remains complex.
  `.trim(),

  fact: 'TON was built by Telegram, abandoned after SEC enforcement in 2020, relaunched by an independent open-source community, then re-endorsed by Telegram in 2023. Telegram and TON Foundation are separate entities with aligned but distinct interests.',
  plain: 'Telegram built a blockchain, got sued by the SEC, gave up on it. Independent developers kept building it. Telegram later came back and built its wallet on top of it. Now 900M Telegram users can access TON without downloading anything extra.',
  stars: [440, 540, 676], target: 676, coins: 40,
  simulatorLesson: 'tonWallet',

  examples: [
    {
      contextTag: '[Regulatory history context]',
      scenario: 'Marcus asks why some exchanges are cautious about listing Toncoin even though it has 900 million potential users.',
      outcome: 'The 2020 SEC enforcement established that the original Gram tokens (TON\'s predecessor) were unregistered securities. Although the open-source community relaunched with a different structure — no ICO, community mining of initial supply — the history creates regulatory caution. US-regulated exchanges evaluate whether Toncoin itself might face similar classification. Most have listed it (Binance, OKX, Bybit), but the regulatory history explains why the path was more complicated than for other large-cap tokens.',
    },
    {
      contextTag: '[Understanding the Telegram/TON relationship]',
      scenario: 'Priya sees that Telegram integrated TON Space into its app and assumes Telegram controls TON.',
      outcome: 'The distinction is important: Telegram built and maintains the app, built TON Space as a wallet feature, and endorses TON. But TON\'s blockchain is maintained by the TON Foundation — an independent organisation. Telegram cannot change TON\'s protocol rules, mint Toncoin, or access user wallets. If Telegram were to shut down, the TON blockchain would continue operating. The relationship resembles Apple supporting Bitcoin payments in an app — Apple did not create Bitcoin.',
    },
    {
      contextTag: '[Community continuation significance]',
      scenario: 'Keiko asks: "Why does it matter that the community continued after Telegram left?"',
      outcome: 'Most blockchain projects die when their founding company loses interest. TON\'s continuation by an independent community demonstrated it had value beyond its corporate creator. This transition also changed TON\'s regulatory profile — a community-run network is harder to classify as an unregistered security than one directly controlled by a company that raised $1.7B from investors. The community continuation was both a survival event and a legitimisation event for the project.',
    },
  ],

  keyTakeaway: 'TON was built by Telegram, abandoned after SEC enforcement, relaunched by an independent open-source community, then re-endorsed by Telegram in 2023 for distribution. Telegram and TON Foundation are separate — understanding this distinction explains both TON\'s unique strengths and its regulatory complexity.',

  guidedPractice: [
    {
      question: 'Why did Telegram abandon the TON project in 2020?',
      options: [
        'Telegram ran out of funding to continue development',
        'The SEC filed an enforcement action alleging the original TON tokens (Grams) were unregistered securities — Telegram settled for $18.5M and returned investor funds',
        'Telegram decided to build on Ethereum instead',
        'Technical limitations made it impossible to scale the TON blockchain',
      ],
      correct: 1,
      hint: 'What US regulatory body was involved and what was their concern?',
      explanation: 'The SEC\'s 2020 enforcement action claimed Telegram\'s 2018 ICO sold unregistered securities. Telegram had raised $1.7B from investors who expected to profit from Gram tokens. The SEC\'s framework: investors bought tokens expecting profits from Telegram\'s efforts — meeting the Howey test definition of a security. Rather than fight the SEC in court, Telegram settled ($18.5M), returned investor funds, and walked away from the project it had spent years building.',
    },
    {
      question: 'What is the relationship between Telegram and the TON Foundation?',
      options: [
        'The TON Foundation is a subsidiary wholly owned by Telegram',
        'They are separate entities: the TON Foundation is an independent open-source community that maintains the TON blockchain; Telegram is a messaging app company that endorses and builds on TON but does not control it',
        'Telegram controls TON through board seats at the TON Foundation',
        'The TON Foundation is a regulatory fiction — Telegram operates it under a different name',
      ],
      correct: 1,
      hint: 'Who can change TON\'s protocol rules? Who can access TON Space wallets?',
      explanation: 'The TON Foundation is independent of Telegram. Telegram cannot modify TON\'s protocol, mint Toncoin, or access user wallets. Telegram built TON Space (a wallet feature in its app) and endorses TON — but as a distribution partner, not a controller. If Telegram ceased operations, the TON blockchain would continue. This separation is important for regulatory analysis: TON is not Telegram\'s token, even though Telegram is its primary distribution channel.',
    },
    {
      question: 'Why was the open-source community\'s continuation of TON after Telegram\'s exit significant?',
      options: [
        'It allowed the community to change TON\'s fundamental architecture',
        'It demonstrated TON had independent value beyond its corporate creator, and changed its regulatory profile from "company-controlled token" to "community-run network"',
        'It meant the community received all of Telegram\'s $1.7B fundraise',
        'The community continuation gave TON legal protection from future SEC actions',
      ],
      correct: 1,
      hint: 'What happens to most blockchain projects when the founding company leaves? What does continued existence signal?',
      explanation: 'Most company-backed blockchain projects collapse when the company exits. TON\'s survival demonstrated genuine technical merit and community belief independent of Telegram. The structural change — from corporate-controlled to community-maintained — also changes the regulatory analysis: a decentralised community network has a stronger case against securities classification than one directly operated by a company that ran an ICO. The continuation was simultaneously a survival demonstration and a decentralisation legitimisation.',
    },
    {
      question: 'In 2023, why did Telegram re-endorse TON after years of distance?',
      options: [
        'The SEC approved TON and gave Telegram permission to re-engage',
        'Telegram needed a blockchain capable of serving 900M users at scale, and TON — originally designed for this exact purpose — was the most technically aligned option',
        'The TON Foundation paid Telegram to re-endorse the project',
        'Telegram\'s re-endorsement was a legal requirement of their 2020 SEC settlement',
      ],
      correct: 1,
      hint: 'What was Telegram\'s core strategic need? What was TON designed to do?',
      explanation: 'Telegram\'s 900M users represent an extraordinary crypto distribution opportunity. To capture it, Telegram needed a blockchain fast enough to handle messenger-scale transaction volumes, cheap enough for micro-transactions, and architecturally suited for mini apps and embedded wallets. TON was originally designed by Telegram engineers for exactly these requirements. No other blockchain came close. Re-endorsing TON — despite the regulatory history — was strategically rational: it was the only chain that could match Telegram\'s scale ambitions.',
    },
    {
      question: 'A friend says "TON is just Telegram\'s coin — same thing." What is the most accurate correction?',
      options: [
        '"You\'re right — Telegram controls TON and profits from all Toncoin transactions"',
        '"TON is maintained by an independent open-source foundation. Telegram is a distribution partner that built its wallet on TON — but Telegram does not control the blockchain, cannot change its rules, or access user wallets"',
        '"Actually they\'re completely separate — Telegram has nothing to do with TON"',
        '"That\'s partially correct — Telegram owns 50% of the TON Foundation"',
      ],
      correct: 1,
      hint: 'What can Telegram do with TON? What can it not do?',
      explanation: 'The accurate framing: Telegram is TON\'s largest distribution partner and endorser. Telegram built TON Space, integrates TON into its app, and actively promotes TON adoption. But Telegram does not control the protocol, cannot mint Toncoin, and cannot access user wallets. The TON Foundation — independent developers — maintains the blockchain. "Same thing" overstates Telegram\'s control. "Nothing to do with" understates the endorsement. The accurate answer: distribution partner, not controller.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 167 — TON Technical Architecture: Sharding and the Masterchain
// ─────────────────────────────────────────────────────────────────────────────

const L167: IslandLevel = {
  id: 167, mechanic: 'memory', tier: 'pro',
  topic: 'TON Architecture — Sharding and the Masterchain',

  explanation: `
When TON's engineers designed the network in 2018, they faced a specific engineering problem: how do you build a blockchain that could serve 900 million Telegram users simultaneously? At the time, Ethereum could handle 15 transactions per second. A messaging app might need 100,000 per second during peak hours.

Their solution was dynamic sharding — a three-tier architecture unlike any other major blockchain.

The masterchain is the top layer. It coordinates the entire network, records the state of all shard chains, and finalises blocks. Think of it as the directory of the whole system.

Workchains are application-specific execution environments. TON currently has one workchain (the basechain where most contracts live), but the architecture supports up to 2^32 separate workchains — each potentially running different virtual machines or consensus rules. Different industries could have dedicated workchains optimised for their specific needs.

Shards are the scalability mechanism. Each workchain can be split into up to 2^60 shards — parallel processing lanes that each handle a subset of accounts and transactions. When network load increases, TON automatically splits a shard into two. When load decreases, shards merge back. This "infinite sharding" is dynamic and automatic.

Why this matters for practical performance: Ethereum's 15 TPS is a single execution thread. TON's sharding means parallel processing across potentially millions of execution threads. Theoretical throughput: millions of TPS. Practical throughput in 2024: TON regularly processes 100,000+ TPS during Telegram gaming events — more than any other public blockchain.

The architectural trade-off: cross-shard communication (a contract on Shard A calling a contract on Shard B) is asynchronous. This makes developing TON smart contracts more complex than Ethereum, where everything shares a single global state.
  `.trim(),

  fact: 'TON\'s three-tier architecture: masterchain (coordinator), workchains (app-specific environments), shards (automatic parallel lanes). Dynamic sharding splits/merges automatically with load. Practical throughput: 100,000+ TPS during Telegram gaming events.',
  plain: 'TON can process millions of transactions per second by splitting work across parallel lanes (shards) automatically. The masterchain keeps everything coordinated. This is why it can serve 900M Telegram users — no other chain could.',
  stars: [500, 616, 770], target: 770, coins: 44,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Scale event proof]',
      scenario: 'During the Notcoin airdrop claim period, 35 million users tried to claim tokens simultaneously over 48 hours. Amara asks how TON handled this without collapsing.',
      outcome: 'TON\'s dynamic sharding automatically scaled to the load. As claim transactions flooded in, the network split high-traffic shards into parallel processing lanes. Each lane handled a subset of accounts. No single bottleneck. Ethereum mainnet with its single execution thread would have faced gas prices of hundreds of dollars per transaction in this scenario. TON processed the 35M claims at sub-cent fees. The sharding architecture was the enabling technology for a user event this size.',
    },
    {
      contextTag: '[Developer, understanding async contracts]',
      scenario: 'Marcus is an Ethereum developer learning TON. He writes a contract that calls another contract and expects an immediate synchronous response — like Ethereum.',
      outcome: 'His contract fails in unexpected ways. TON\'s cross-shard communication is asynchronous: Contract A sends a message to Contract B, the message is queued, delivered in a later block, and Contract B\'s response arrives even later. Unlike Ethereum\'s synchronous call model (call → response in the same transaction), TON contracts must be designed to handle delayed responses. This is the key architectural difference that makes TON development harder but enables its scalability.',
    },
    {
      contextTag: '[Comparison to Ethereum sharding]',
      scenario: 'Keiko reads that Ethereum also planned sharding (danksharding). She asks how TON\'s sharding compares.',
      outcome: 'Ethereum\'s sharding plan evolved to focus on data sharding (blobs via EIP-4844) rather than execution sharding — because cross-shard execution proved very difficult. TON solved cross-shard execution using an asynchronous messaging model from the start. The trade-off: TON\'s async model complicates development; Ethereum\'s approach keeps execution synchronous but processes it on L2s instead. Different architectural choices for the same scalability goal.',
    },
  ],

  keyTakeaway: 'TON\'s three-tier architecture (masterchain + workchains + automatic sharding) enables 100,000+ TPS by processing transactions across parallel execution lanes. Cross-shard communication is asynchronous — the key difference from Ethereum that enables scale but complicates development.',

  guidedPractice: [
    {
      question: 'What problem was TON\'s sharding architecture designed to solve?',
      options: [
        'Reducing the cost of smart contract deployment',
        'Enabling a blockchain to handle the transaction volume of a 900M-user messaging application — far beyond what any single-thread blockchain could manage',
        'Replacing Ethereum\'s proof-of-work with a faster consensus mechanism',
        'Enabling cross-chain asset transfers between TON and Ethereum',
      ],
      correct: 1,
      hint: 'What was Telegram\'s core use case requirement that existing blockchains could not meet?',
      explanation: 'Telegram\'s 900M users sending blockchain transactions simultaneously could generate 100,000+ TPS during peak events. Ethereum at 15 TPS, Bitcoin at 7 TPS, and Solana at 65,000 TPS (single-threaded) all fall short at different points. TON\'s dynamic sharding — automatically splitting work across parallel lanes — was specifically designed to scale horizontally as user load increases. This is the foundational architectural requirement that drove TON\'s design.',
    },
    {
      question: 'What is the TON masterchain and what role does it play?',
      options: [
        'The primary transaction processing layer where all user transactions execute',
        'The top coordination layer that records the state of all shard chains and finalises the overall network state — the directory of the whole system',
        'The layer that handles cross-chain bridges to Ethereum',
        'A special shard reserved for high-priority Telegram transactions',
      ],
      correct: 1,
      hint: 'If shards are the execution lanes, what coordinates them all?',
      explanation: 'The masterchain does not execute most transactions — that is the shards\' job. The masterchain records the final state of all shard chains, coordinates the network, and provides the canonical reference point for the entire system. Think of it as the ledger that tracks what each shard has done. Validators on the masterchain verify shard block summaries, ensuring the overall state is consistent even across thousands of parallel processing lanes.',
    },
    {
      question: 'What does "dynamic sharding" mean in TON\'s context?',
      options: [
        'The number of validators can be changed dynamically by the foundation',
        'Shard chains automatically split into two when load is high and merge back when load decreases — the network scales horizontally in real time without manual configuration',
        'Smart contracts can dynamically choose which shard to execute on',
        'TON\'s shards can dynamically change their consensus rules based on governance votes',
      ],
      correct: 1,
      hint: 'What happens to the number of processing lanes as transaction volume increases?',
      explanation: 'Dynamic sharding means the network itself manages parallelism automatically. Under high load: a busy shard splits into two, each handling half the accounts. Both sub-shards now process transactions in parallel. Under low load: adjacent shards merge to reduce coordination overhead. This self-scaling eliminates the need for manual configuration or hard-coded capacity limits. The Notcoin airdrop (35M simultaneous claimers) and Hamster Kombat (300M players) both triggered automatic shard scaling.',
    },
    {
      question: 'Why is cross-shard communication in TON asynchronous rather than synchronous?',
      options: [
        'TON\'s team did not implement synchronous communication due to time constraints',
        'Synchronous cross-shard calls would require shards to pause and wait for each other — eliminating the parallelism benefit. Async messaging allows each shard to continue processing independently',
        'Asynchronous communication is required by the SEC for regulatory compliance',
        'TON\'s masterchain enforces async communication to prevent spam attacks',
      ],
      correct: 1,
      hint: 'If Shard A must wait for Shard B to respond before continuing, what happens to parallelism?',
      explanation: 'Synchronous cross-shard calls would create dependencies: Shard A pauses while waiting for Shard B, Shard B pauses while waiting for Shard C. This chain of dependencies collapses parallel execution into sequential execution — eliminating the scalability benefit. Asynchronous messaging breaks these dependencies: Shard A sends a message to Shard B and continues processing other transactions. Shard B processes the message when it arrives and sends a response message. No shard waits for another. This is why TON can scale to millions of TPS: each shard operates independently.',
    },
    {
      question: 'TON processed 100,000+ TPS during Telegram gaming events. How does this compare to other major blockchains?',
      options: [
        'It is slower than Solana (65,000 TPS) and equivalent to Ethereum L2s',
        'It exceeds Solana\'s single-thread throughput (65,000 TPS) and represents orders of magnitude more than Ethereum mainnet (15 TPS) — made possible by parallel shard execution',
        'It is equivalent — most blockchains process 100,000+ TPS under normal conditions',
        'The 100,000 TPS claim is theoretical; in practice TON handles 1,000 TPS maximum',
      ],
      correct: 1,
      hint: 'Compare: Ethereum 15 TPS, Solana 65,000 TPS, TON during peak gaming?',
      explanation: 'Ethereum mainnet: ~15 TPS (single execution thread). Solana: up to 65,000 TPS (single-threaded, highly optimised). TON: 100,000+ TPS during Hamster Kombat peak (parallel sharded execution, demonstrated in production). TON\'s measured production performance during Telegram gaming events exceeded Solana\'s theoretical maximum — achieved through horizontal sharding rather than optimising a single execution thread. This is real, measured throughput, not theoretical specifications.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 168 — TON Space: The Built-In Telegram Wallet
// ─────────────────────────────────────────────────────────────────────────────

const L168: IslandLevel = {
  id: 168, mechanic: 'chain', tier: 'pro',
  topic: 'TON Space — The Built-In Telegram Wallet',

  explanation: `
In September 2023, Telegram added a "Wallet" button to its main menu. Tapping it opened TON Space — a full self-custody crypto wallet without downloading any additional app. For 900 million Telegram users, the path from "I have never used crypto" to "I have a self-custody wallet with a seed phrase" became a three-minute, in-app experience.

This is the single most significant distribution event in crypto wallet history by potential reach.

TON Space is genuinely self-custodial. Telegram generates a 12-word seed phrase on the device — Telegram's servers never see it. The private key is stored locally. This is the same security model as MetaMask or Phantom: lose the seed phrase, lose access. No customer support can help.

What users can do directly in TON Space within Telegram: send and receive Toncoin, hold jettons (TON's ERC-20 equivalent), view NFTs, interact with Telegram Mini App-based DeFi protocols (STON.fi, DeDust), and connect to external DApps via TON Connect.

TON Connect is the protocol that allows external websites and apps to connect to a user's TON Space wallet — equivalent to MetaMask's "Connect Wallet" button for Ethereum. When a TON DApp requests connection, the user approves it in Telegram. No private key ever leaves the device.

The practical significance: before TON Space, reaching crypto-naive users required convincing them to download MetaMask, understand seed phrases, and configure networks. With TON Space, 900M existing Telegram users can access self-custody DeFi in three minutes without leaving an app they already use daily. The distribution barrier is the lowest in crypto history.
  `.trim(),

  fact: 'TON Space is Telegram\'s built-in self-custody wallet — 12-word seed phrase, locally stored keys, Telegram never sees the private key. 900M Telegram users can access self-custody crypto without downloading additional apps.',
  plain: 'TON Space is a real crypto wallet built into Telegram. Three taps and you have a self-custody wallet. 900 million people already have Telegram. This is why TON\'s user potential is unlike any other blockchain.',
  stars: [560, 690, 862], target: 862, coins: 48,
  simulatorLesson: 'tonMiniAppDex',

  examples: [
    {
      contextTag: '[Non-crypto user onboarding]',
      scenario: 'Priya\'s friend uses Telegram daily but has never owned crypto. Priya shows her TON Space.',
      outcome: 'Step 1: Open Telegram → Menu → Wallet. Step 2: TON Space opens, generates a seed phrase on-device. Step 3: Friend writes down the 12 words on paper. Step 4: Wallet is live — she can receive Toncoin. Total time: 4 minutes. No app download, no browser extension, no Ethereum network configuration, no gas currency confusion. She now has a real self-custody wallet. Her first crypto experience required zero prior knowledge. This is the distribution hypothesis: lower friction means more users.',
    },
    {
      contextTag: '[Security verification]',
      scenario: 'Marcus wonders if Telegram can see his TON Space private key and access his funds.',
      outcome: 'TON Space generates the seed phrase on the device using local cryptography. The seed phrase and derived private key are stored in the device\'s secure enclave (or app storage, depending on device). Telegram\'s servers receive no key material. Telegram cannot access TON Space funds any more than Apple can access a locally stored MetaMask wallet. The architecture is genuinely non-custodial — verified by independent audits of the TON Space implementation. However: if Telegram\'s app is compromised, the key storage could theoretically be accessed.',
    },
    {
      contextTag: '[TON Connect comparison]',
      scenario: 'Keiko wants to use STON.fi (TON\'s leading DEX) with her TON Space wallet.',
      outcome: 'She opens STON.fi\'s mini app inside Telegram. The DEX requests wallet connection via TON Connect. A popup appears in Telegram: "STON.fi wants to connect to your wallet." She approves. STON.fi can now see her address and request transaction signatures — but cannot access her private key. Each swap generates a transaction request that she approves with a tap in Telegram. The flow is identical in structure to MetaMask + Uniswap on Ethereum: connect wallet, approve transactions. The UX is just embedded in Telegram.',
    },
  ],

  keyTakeaway: 'TON Space is Telegram\'s built-in self-custody wallet — genuine 12-word seed phrase, locally stored keys, Telegram has no access. TON Connect allows DApps to request wallet connections inside Telegram. The 900M-user distribution potential is unmatched by any other wallet in crypto.',

  guidedPractice: [
    {
      question: 'Is TON Space custodial or self-custodial, and what does that mean for recovery?',
      options: [
        'Custodial — Telegram holds your keys and can recover your wallet if you lose access',
        'Self-custodial — your seed phrase is generated on-device and Telegram never sees it. If you lose your seed phrase and all devices, your funds are permanently unrecoverable',
        'Hybrid — Telegram holds an encrypted backup of your seed phrase for emergency recovery',
        'Custodial for the first 30 days, then transitions to self-custody',
      ],
      correct: 1,
      hint: 'Who generated the seed phrase and where is it stored?',
      explanation: 'TON Space generates the 12-word seed phrase locally on your device. Telegram\'s servers never receive the key material. This is genuine self-custody: you control the key, you bear the responsibility. Losing your seed phrase with no device backup means permanent loss — Telegram support cannot help. This is the same model as MetaMask or Phantom. The non-negotiable rule applies identically: write down the seed phrase on paper, store it securely offline.',
    },
    {
      question: 'Why is TON Space\'s distribution significant compared to other crypto wallets?',
      options: [
        'TON Space charges zero fees, while MetaMask and Phantom charge monthly fees',
        'TON Space is accessible to Telegram\'s 900M existing users without any additional download — reducing the barrier from "multi-step wallet setup" to "three taps in an app they already use daily"',
        'TON Space is the only wallet that supports multiple blockchains simultaneously',
        'TON Space received regulatory approval in 150 countries, making it the most legally compliant wallet',
      ],
      correct: 1,
      hint: 'What is the primary friction point for new crypto wallet users? How does TON Space address it?',
      explanation: 'Traditional crypto wallet adoption requires: find and download MetaMask, understand browser extensions or mobile apps, create and secure a seed phrase, understand network configurations, acquire the gas token. Each step loses a large fraction of potential users. TON Space collapses this to: open Telegram (already installed) → Menu → Wallet → write down 12 words. The 900M existing Telegram users already have the distribution channel. The friction reduction is the largest in crypto history — no other wallet has pre-existing relationships with this many potential users.',
    },
    {
      question: 'What does TON Connect enable and how is it used?',
      options: [
        'TON Connect is the bridge between TON and Ethereum for cross-chain asset transfers',
        'TON Connect is the protocol allowing DApps to connect to TON Space — requesting wallet addresses and transaction signatures without accessing the private key',
        'TON Connect enables TON validators to connect to the masterchain',
        'TON Connect is Telegram\'s peer-to-peer payment system for direct user transfers',
      ],
      correct: 1,
      hint: 'What is the TON equivalent of MetaMask\'s "Connect Wallet" button?',
      explanation: 'TON Connect is the DApp connectivity standard for TON — equivalent to WalletConnect or MetaMask\'s injection on Ethereum. When a TON DApp wants to interact with a user\'s wallet, it requests connection via TON Connect. A popup appears in Telegram: the user approves and the DApp receives their address. For transactions (swaps, approvals, contract calls), the DApp sends a transaction request through TON Connect; the user approves in Telegram. The private key never leaves the device — only transaction signatures are shared.',
    },
    {
      question: 'A Telegram user opens TON Space and taps "Create Wallet." A 12-word seed phrase appears. What should they do immediately?',
      options: [
        'Take a screenshot for safe backup in their photo library',
        'Write all 12 words in order on paper, store the paper securely offline, then confirm by re-entering the words in the app',
        'Copy the words to their phone\'s Notes app for easy access',
        'Share the words with a trusted family member via Telegram for backup',
      ],
      correct: 1,
      hint: 'What storage method is safe for a seed phrase? What methods are compromised by digital access?',
      explanation: 'Screenshots sync to cloud storage (iCloud, Google Photos) — accessible to anyone who compromises your cloud account. Notes apps sync to cloud. Telegram messages sync to Telegram\'s servers. Any digital storage is a potential compromise vector. Paper: requires physical access to steal. Offline physical storage is the only acceptable backup method for a seed phrase. Write all 12 words in exact order on paper, store in a safe or secure location, consider a second copy at a separate location. This is non-negotiable regardless of how user-friendly the wallet interface is.',
    },
    {
      question: 'Can Telegram access the funds in a user\'s TON Space wallet?',
      options: [
        'Yes — Telegram operates the wallet and can access funds in emergencies',
        'No — TON Space generates and stores keys locally; Telegram\'s servers never receive the private key or seed phrase. Telegram has no more access than any other party without the seed phrase',
        'Yes, but only for wallets that have completed KYC verification',
        'Telegram can view balances but cannot initiate transactions without the user\'s approval',
      ],
      correct: 1,
      hint: 'Where is the private key stored and who generated it?',
      explanation: 'TON Space generates cryptographic keys on the user\'s device. The private key is stored in the device\'s secure app storage. Telegram\'s servers are not involved in key generation or storage — they see the same public information anyone can see on the TON blockchain (public addresses and transaction history). Telegram cannot initiate transactions, cannot view private keys, and cannot recover wallets. Independent security audits have confirmed this architecture. The self-custody model is genuine, not a marketing claim.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 169 — Toncoin Utility: Fees, Staking, Governance
// ─────────────────────────────────────────────────────────────────────────────

const L169: IslandLevel = {
  id: 169, mechanic: 'match3', tier: 'pro',
  topic: 'Toncoin Utility — Fees, Staking, Governance',

  explanation: `
Toncoin (TON) has three distinct utility functions — gas fees, validator staking, and governance. Understanding each helps evaluate the token's long-term value and demand drivers.

Gas fees are the most immediate utility. Every transaction on the TON network costs a small amount of TON, paid to validators. Unlike Ethereum where fees can spike to $50+ during congestion, TON fees are consistently sub-cent — fractions of $0.01 per transaction. At 900 million potential users making daily transactions, gas demand alone represents substantial token utility. Notably, TON uses a fee burn mechanism: a portion of every fee is permanently destroyed, reducing total supply.

Validator staking secures the network through proof-of-stake. Running a validator requires a significant TON stake — the minimum is 300,000 TON (approximately $1.5M at $5/TON). This high barrier means most TON holders participate through nominator pools — delegating TON to validators in exchange for a share of staking rewards. Current staking yield: approximately 4–6% APY. Total staked: roughly 35% of circulating supply, which is the standard level indicating a healthy proof-of-stake network.

Governance allows TON holders to vote on protocol upgrades and parameter changes. Unlike Ethereum (where protocol changes are decided by core developers) or Tezos (pure on-chain governance), TON uses a hybrid model: technical decisions go through validator consensus, while broader governance decisions involve token holder voting.

Token economics note: Toncoin has no hard cap — it is technically inflationary. However, the combination of fee burns, staking lock-up (reducing circulating supply), and increasing demand from a growing network creates a deflationary pressure that, at sufficient scale, could outpace issuance.
  `.trim(),

  fact: 'Toncoin utility: sub-cent gas fees (with partial burns), validator staking via nominator pools (4–6% APY, 35% of supply staked), and governance voting. No hard supply cap — inflation offset by fee burns and staking demand at scale.',
  plain: 'Toncoin pays for transactions (very cheap), secures the network through staking (earn 4–6% APY), and enables governance voting. No fixed supply cap, but fee burns and staking reduce effective inflation.',
  stars: [620, 763, 954], target: 954, coins: 52,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Fee economics at scale]',
      scenario: 'Marcus calculates: if 100 million Telegram users each made 5 transactions per day at $0.002 each, what is the daily TON fee revenue?',
      outcome: '100M users × 5 transactions × $0.002 = $1M per day in TON fee revenue to validators. At current adoption (far fewer active users), actual daily fees are much lower — but the calculation shows why the distribution potential matters for token economics. Each active user generating $0.01/day in fees creates real demand for TON. At full Telegram user activation, the network effect on TON demand would be substantial.',
    },
    {
      contextTag: '[Nominator staking]',
      scenario: 'Amara holds 5,000 TON ($25,000) and wants to participate in staking. She cannot run a validator (requires 300,000 TON minimum).',
      outcome: 'She uses a nominator pool — a smart contract that aggregates small stakers and delegates their combined TON to a validator. She selects a pool with good validator performance, deposits 5,000 TON. Her annual yield: 5,000 × 5% APY = 250 TON/year (~$1,250 at $5/TON). Unstaking period: approximately 36 hours (one election cycle). The nominator pool handles the validator relationship — she just deposits and collects rewards.',
    },
    {
      contextTag: '[Inflation vs deflation evaluation]',
      scenario: 'Keiko reads that Toncoin has no hard supply cap and asks if this makes it a bad investment.',
      outcome: 'No hard cap = technically inflationary, but this misses the full picture. Bitcoin has a hard cap but no fee burn. Ethereum has no hard cap but burns fees (and has become net deflationary during high-activity periods). TON\'s fee burns mean each transaction permanently removes TON from supply. At sufficient daily transaction volume (driven by 900M Telegram users), burns could outpace issuance. The practical question is not "is there a cap?" but "does demand growth outpace inflation?" — the same question for any monetary asset.',
    },
  ],

  keyTakeaway: 'Toncoin\'s three utilities — sub-cent gas fees (with burns), nominator pool staking (4–6% APY), and governance — create real demand drivers. No supply cap, but fee burns and staking lock-up create deflationary pressure that scales with network usage.',

  guidedPractice: [
    {
      question: 'Why are Toncoin transaction fees consistently sub-cent while Ethereum fees regularly exceed $5?',
      options: [
        'TON has lower security than Ethereum, which reduces the cost of validation',
        'TON\'s dynamic sharding automatically scales capacity to match demand — preventing the fee auctions that occur on single-thread blockchains like Ethereum when demand exceeds capacity',
        'The TON Foundation subsidises all transaction fees below $0.01',
        'Toncoin\'s low price makes fees appear cheap in dollar terms',
      ],
      correct: 1,
      hint: 'What happens to fees when a blockchain\'s capacity is exceeded? How does sharding change this?',
      explanation: 'Ethereum fees spike when demand exceeds the network\'s 15 TPS capacity — users bid higher fees to get included in the next block. TON\'s sharding automatically adds processing capacity when demand increases. When 10,000 transactions arrive simultaneously, TON splits shards and processes them in parallel — no user needs to outbid others for scarce block space. The automatic capacity scaling eliminates the fee auction mechanism that makes Ethereum expensive during high demand.',
    },
    {
      question: 'What is a nominator pool and who should use it?',
      options: [
        'A pool of validators who collectively nominate the next TON Foundation leadership',
        'A smart contract that aggregates TON from smaller holders and delegates it to a validator — allowing holders with less than 300,000 TON to earn staking rewards',
        'A pool of high-frequency traders who nominate which tokens should list on STON.fi',
        'The governance mechanism for nominating TON protocol upgrades',
      ],
      correct: 1,
      hint: 'What is the validator minimum stake? Who cannot meet it? What alternative exists?',
      explanation: 'Running a TON validator requires 300,000 TON minimum (~$1.5M at $5/TON) — accessible only to large institutional stakeholders. Most TON holders have far less. Nominator pools are smart contracts that aggregate deposits from many smaller holders: each contributor earns staking rewards proportional to their contribution, while the pool as a whole meets the validator stake requirement. The validator operator earns a commission (typically 5–10%); nominators receive the remainder. This is analogous to ETH liquid staking pools like Lido or Rocket Pool.',
    },
    {
      question: 'The TON fee burn mechanism removes TON from supply with each transaction. What impact could this have at scale?',
      options: [
        'No impact — burns are too small to matter relative to total supply',
        'At sufficient transaction volume (potentially driven by 900M Telegram users), daily burns could outpace new TON issuance — creating net deflation despite having no hard supply cap',
        'Fee burns immediately reduce the staking rewards paid to validators',
        'Fee burns are only activated during periods of high network congestion',
      ],
      correct: 1,
      hint: 'What happened to Ethereum\'s supply after EIP-1559 introduced fee burns during high-activity periods?',
      explanation: 'Ethereum became net deflationary during high-activity periods after EIP-1559 — fee burns exceeded new ETH issuance. TON\'s partial fee burn creates the same mechanism: each transaction permanently removes TON. At 100M daily active users making 5 transactions each at $0.002 = $1M/day in fees, with a portion burned. The deflationary effect scales with activity. This is why TON\'s distribution advantage (900M Telegram users) is relevant to token economics — not just adoption, but the burn rate that comes with adoption.',
    },
    {
      question: 'Toncoin\'s staking yield is 4–6% APY with approximately 35% of supply staked. Is 35% staking ratio healthy?',
      options: [
        'No — healthy blockchains have 80%+ staked; 35% is dangerously low',
        'Yes — 35% is within the typical range for major proof-of-stake networks (Ethereum is ~28%, Solana ~70%). It represents meaningful security commitment without excessive liquidity withdrawal',
        'No — staking locks up supply and creates artificial scarcity, which is harmful',
        'The staking ratio is irrelevant — only total staked value in USD matters for security',
      ],
      correct: 1,
      hint: 'Compare to Ethereum (~28% staked) and Solana (~70% staked). Where does 35% fall?',
      explanation: '35% staking ratio is within the healthy range for a major proof-of-stake network. Ethereum: ~28% staked. Cosmos: ~60–70%. Solana: ~70%. TON: ~35%. Each network has different staking mechanics that affect optimal ratio. Too low: network security is cheap to attack (attackers don\'t need much capital to get 33% stake). Too high: most supply is illiquid, reducing market efficiency. 35% represents meaningful security commitment while keeping significant supply liquid for trading and DeFi use.',
    },
    {
      question: 'How does TON governance differ from Ethereum\'s and Tezos\'s governance models?',
      options: [
        'TON uses pure token voting on all decisions, identical to Tezos',
        'TON uses a hybrid model: technical decisions go through validator consensus, while broader protocol changes involve token holder voting — unlike Ethereum (core developer-led) or Tezos (pure on-chain voting)',
        'TON has no governance mechanism — all decisions are made by Telegram',
        'TON governance is identical to Ethereum\'s — community forums then developer implementation',
      ],
      correct: 1,
      hint: 'Who makes decisions in Ethereum? Who in Tezos? Where does TON sit?',
      explanation: 'Governance spectrum: Ethereum (off-chain consensus among core developers, miner/validator social agreement for hard forks — minimal on-chain governance), Tezos (pure on-chain governance — token holders vote on protocol upgrades that auto-implement), TON (hybrid — validators handle technical consensus for network operations, broader governance uses token holder voting for major protocol decisions). TON\'s hybrid attempts to balance technical expertise (validator consensus) with stakeholder participation (token voting) — avoiding both Ethereum\'s developer centrality and Tezos\'s governance vulnerability to plutocratic token holders.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 170 — Telegram Mini Apps: DeFi and Games Inside the Messenger
// ─────────────────────────────────────────────────────────────────────────────

const L170: IslandLevel = {
  id: 170, mechanic: 'memory', tier: 'pro',
  topic: 'Telegram Mini Apps — DeFi and Games Inside the Messenger',

  explanation: `
In 2024, a game called Hamster Kombat became the fastest-growing application in internet history — reaching 300 million users in three months. Users tapped a hamster on screen to earn virtual coins. They did this inside Telegram. No app store. No download. No crypto wallet required. When the HMSTR token launched, those in-app coins converted to token allocations.

Telegram Mini Apps are web applications embedded inside Telegram chats. Technically, they run as WebApps — standard web pages rendered inside Telegram's built-in browser with access to Telegram's user API (username, profile picture, language, and with permission, TON Space wallet). Any developer can build a Mini App and distribute it as a Telegram bot — users access it by opening the bot's chat.

The DeFi applications are the substantively important category. STON.fi (TON's leading DEX) operates as a Mini App: users open the STON.fi bot, connect their TON Space wallet via TON Connect, and execute swaps — all inside Telegram. No browser extension, no separate wallet app, no network configuration. The UX resembles an in-app payment flow.

This changes the DeFi accessibility calculus dramatically. The primary barriers to DeFi adoption have been: need a separate wallet app, need to understand browser extensions, need to know which network to configure. Mini Apps + TON Space eliminate all three for Telegram's 900M users. The DeFi protocols come to users rather than users going to DeFi protocols.

The gaming applications generate controversy. Play-to-airdrop mechanics (tap repeatedly to earn points → points convert to tokens at launch) attract enormous user numbers — but the users are often performing mindless repetitive actions for speculative token value rather than engaging with a genuine product.
  `.trim(),

  fact: 'Telegram Mini Apps are web applications inside Telegram — no download, no separate wallet. DeFi protocols (STON.fi, DeDust) operate as Mini Apps connecting to TON Space. Hamster Kombat reached 300M users — the fastest growing app in internet history.',
  plain: 'Mini Apps are websites that run inside Telegram. DeFi protocols, games, and services all work inside the Telegram chat interface. No extra downloads. Your TON Space wallet connects directly. This is why TON\'s user potential is real.',
  stars: [680, 836, 1045], target: 1045, coins: 56,
  simulatorLesson: 'tonMiniAppDex',

  examples: [
    {
      contextTag: '[DeFi Mini App experience]',
      scenario: 'James opens STON.fi inside Telegram for the first time. He has TON Space set up. He wants to swap 10 TON for USDT.',
      outcome: 'Step 1: Search "STON.fi" in Telegram, open the bot. Step 2: A web interface loads inside Telegram. Step 3: Tap "Connect Wallet" → TON Connect popup → approve in Telegram. Step 4: Select TON → USDT, enter 10 TON. Step 5: Review rate and fees. Step 6: Confirm → transaction request appears in Telegram → approve. Step 7: 10 TON converted to USDT in his TON Space wallet. Total time: 90 seconds. No browser, no extension, no separate wallet app. The entire flow happened in Telegram.',
    },
    {
      contextTag: '[Play-to-airdrop mechanics]',
      scenario: 'Amara spent 3 months tapping Hamster Kombat for 2 hours per day. She asks Keiko what she should realistically expect from the HMSTR token launch.',
      outcome: 'Keiko sets honest expectations: Hamster Kombat had 300M users — each earning points for a fixed token pool. Even if Amara was in the top 5% of earners: 300M × 5% = 15M top earners sharing a limited allocation. At typical play-to-airdrop distribution rates, top earners of popular games often receive $50–$500. Spending 180 hours × 2h/day = 360 hours total. If she received $200: $0.55/hour. Less than minimum wage. The time cost of play-to-airdrop participation is rarely calculated honestly.',
    },
    {
      contextTag: '[Developer, building a Mini App]',
      scenario: 'Priya wants to build a creator tip jar as a Telegram Mini App — readers tip newsletter writers in USDC via TON.',
      outcome: 'She builds a standard web app with Telegram Mini App SDK integration. The app detects the Telegram user context (username, profile), requests TON Connect for wallet access. When a reader tips: they approve the TON transaction in TON Space within Telegram. The writer receives USDT to their TON Space address. Distribution: she shares the bot username in her newsletter — readers type it in Telegram and the Mini App opens. No App Store approval, no server costs beyond a basic web host, no wallet infrastructure beyond TON Connect integration. Development time: 2 weeks.',
    },
  ],

  keyTakeaway: 'Telegram Mini Apps are embedded web applications with Telegram user context and TON Space integration — enabling DeFi access without any additional downloads. DeFi Mini Apps (STON.fi) represent genuine utility; play-to-airdrop gaming should be evaluated for its time economics before participating.',

  guidedPractice: [
    {
      question: 'What is a Telegram Mini App technically, and what makes it different from a regular mobile app?',
      options: [
        'A native application downloaded from Telegram\'s proprietary app store',
        'A web application (standard HTML/CSS/JS) embedded in Telegram with access to user context and TON Space — requiring no download, no App Store approval, and no separate installation',
        'A Telegram-specific programming language that runs only inside the messenger',
        'An encrypted messaging feature that allows apps to communicate through Telegram\'s servers',
      ],
      correct: 1,
      hint: 'What technology does a Mini App run on? Where does it run?',
      explanation: 'Mini Apps are standard web technologies — any developer already knowing HTML/CSS/JavaScript can build one. They run inside Telegram\'s built-in WebView (a browser embedded in the app). The Telegram Mini App SDK provides access to: user context (username, language, theme), TON Connect for wallet interactions, and Telegram\'s payment APIs. No App Store submission, no Apple or Google approval, no download friction for users. Distribution is instant: share your bot username and any Telegram user can access it immediately.',
    },
    {
      question: 'How does STON.fi operate as a Telegram Mini App?',
      options: [
        'STON.fi runs on Telegram\'s servers, with Telegram holding user funds for faster execution',
        'Users open the STON.fi bot in Telegram, a web-based DEX interface loads inside the app, users connect TON Space via TON Connect, and execute swaps — with each transaction approved inside Telegram',
        'STON.fi is a Telegram group chat where users post buy and sell orders for manual matching',
        'STON.fi operates identically to Uniswap — users must access it through a separate browser',
      ],
      correct: 1,
      hint: 'What are the steps from opening Telegram to completing a token swap on STON.fi?',
      explanation: 'STON.fi as Mini App: open STON.fi bot in Telegram → web DEX interface loads inside Telegram → connect TON Space wallet via TON Connect (one approval tap) → select tokens to swap → review rate and fees → confirm → approve transaction in Telegram → swap complete. The entire interaction happens inside Telegram. Contrast with Ethereum DeFi: install MetaMask → configure network → fund with ETH for gas → go to Uniswap in a separate browser → connect MetaMask → approve two separate transactions. The Mini App model eliminates 5+ steps.',
    },
    {
      question: 'Hamster Kombat reached 300M users. Why does this number not translate directly to 300M genuine crypto users?',
      options: [
        'The user count is inflated — Telegram bots count the same user multiple times',
        'Most users were engaging with a simple tapping game for speculative token value — not using a DeFi protocol, learning about crypto, or making financial decisions. Game participation does not equal crypto adoption',
        'Hamster Kombat required KYC which most users failed',
        'Telegram restricted Hamster Kombat to users in 50 countries, limiting genuine reach',
      ],
      correct: 1,
      hint: 'What were users actually doing in Hamster Kombat? Is that "using crypto"?',
      explanation: 'Users in Hamster Kombat tapped a cartoon hamster repeatedly to earn in-game points — a mindless action with no financial, educational, or crypto-native component. Most users had no TON Space wallet, no understanding of TON, and no intention to interact with DeFi. They were playing a simple mobile game for speculative airdrop value. When the token launched at lower-than-expected values, many "crypto users" had no idea how to claim, sell, or store the tokens. Game participation metrics measure entertainment engagement, not crypto adoption.',
    },
    {
      question: 'A play-to-airdrop game offers an expected $150 token allocation. You estimate it requires 200 hours of in-game time to earn top allocations. What is the hourly return?',
      options: [
        '$0.75/hour — should be compared to the minimum wage in your jurisdiction',
        '$0.75/hour', '$150', '$15/hour'],
      correct: 0,
      hint: '$150 ÷ 200 hours = ?',
      explanation: '$150 ÷ 200 hours = $0.75/hour — significantly below minimum wage in any developed country. This calculation is almost never made explicit in play-to-airdrop promotions, which instead focus on total token allocation and speculative upside. The honest evaluation: if the game is entertaining enough that you would play it anyway for free, the $0.75/hour is a bonus. If you are only playing for the airdrop, the opportunity cost of 200 hours is almost certainly better deployed elsewhere.',
    },
    {
      question: 'What genuine user advantage do Telegram Mini App DeFi protocols offer over traditional DeFi interfaces?',
      options: [
        'Mini App DeFi protocols charge zero fees — they are subsidised by Telegram',
        'They eliminate the need for a separate wallet app, browser extension, network configuration, and standalone DeFi website visit — reducing DeFi access from 10+ steps to 3–4 taps inside an already-installed app',
        'Mini Apps have access to more liquidity than standalone DeFi protocols',
        'Telegram verifies Mini App DeFi protocols, providing security guarantees to users',
      ],
      correct: 1,
      hint: 'Count the steps to use Uniswap with MetaMask vs STON.fi inside Telegram.',
      explanation: 'Traditional DeFi path: install MetaMask (or Phantom) → create wallet → secure seed phrase → configure network → acquire gas token → navigate to DeFi site → connect wallet → approve spending → execute. Mini App DeFi path: open Telegram (already installed) → open bot → connect TON Space → approve transaction. The friction reduction is real and significant for the 99% of Telegram users who are not DeFi natives. The protocols themselves (liquidity, slippage, smart contract risk) remain identical — the UX friction is what changes.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 171 — Fragment: On-Chain Telegram Username and Number Trading
// ─────────────────────────────────────────────────────────────────────────────

const L171: IslandLevel = {
  id: 171, mechanic: 'chain', tier: 'pro',
  topic: 'Fragment — On-Chain Telegram Username and Number Trading',

  explanation: `
In October 2022, Telegram launched Fragment — a marketplace where Telegram usernames and anonymous phone numbers are auctioned and traded as NFTs on the TON blockchain. The username @bitcoin sold for $400,000. @doge sold for $200,000. Short, premium usernames became scarce digital assets with real secondary markets.

Fragment works through a clean mechanism. Telegram moved premium username ownership to the TON blockchain — meaning possession is determined by on-chain NFT ownership rather than a Telegram account database entry. If you own the NFT for @name on TON, you control that Telegram username. Transfer the NFT and the username changes hands atomically — no Telegram support required.

Anonymous numbers add another dimension. Telegram offers virtual phone numbers that allow users to sign up for Telegram without using their real phone number — providing privacy from carriers and governments. These anonymous numbers are also tokenised on Fragment: own the NFT, own the number. These are especially valued in jurisdictions with phone number surveillance.

The investment thesis has two components. Short premium usernames (@crypto, @nft, @defi) have inherent scarcity and branding value — similar to domain names in the early internet. Their value depends on continued Telegram growth and TON adoption. Anonymous numbers have functional utility in privacy markets.

The risk is concentrated: Fragment's value is entirely dependent on Telegram's continued operation and growth. If Telegram faced regulatory shutdown, username NFTs on Fragment would have limited residual value. This is a different risk profile from most crypto assets — it is platform-dependent rather than protocol-independent.
  `.trim(),

  fact: 'Fragment is a TON-based marketplace where Telegram usernames and anonymous phone numbers are tokenised as NFTs. @bitcoin sold for $400K. Username value depends entirely on Telegram\'s continued growth — platform-dependent risk.',
  plain: 'Fragment lets you buy and sell Telegram usernames as NFTs on TON. Own the NFT, own the username. Short premium names sold for hundreds of thousands of dollars. The value depends entirely on Telegram staying popular and legal.',
  stars: [740, 910, 1138], target: 1138, coins: 60,
  simulatorLesson: 'fragmentTrading',

  examples: [
    {
      contextTag: '[Username valuation]',
      scenario: 'Marcus sees @crypto listed on Fragment for 50,000 TON ($250,000). He asks how to evaluate whether this is fairly priced.',
      outcome: 'Evaluation framework: (1) Length — shorter = rarer. 4-letter usernames are extremely scarce. (2) Keyword value — @crypto is a high-traffic search term with obvious branding utility for crypto projects. (3) Comparables — what did similar names sell for? @defi, @nft, @btc are reference points. (4) Platform risk — is Telegram growing or declining? (5) Liquidity — can you resell? Fragment trading volume indicates market liquidity. At $250K for @crypto, he would need to believe a crypto company or brand would pay more. He considers the domain name analogy: crypto.com sold for $12M — @crypto at $250K seems plausible if Telegram becomes a primary crypto interface.',
    },
    {
      contextTag: '[Anonymous number utility]',
      scenario: 'Amara is a journalist in a country with phone number surveillance. She wants to use Telegram without linking her real number to her account.',
      outcome: 'She purchases an anonymous TON number on Fragment — a virtual number that allows Telegram registration without a real phone carrier. She uses this number to create a separate Telegram account for professional communications. The number is an NFT on TON — she can sell it later if she no longer needs it. The functional utility (genuine privacy from number-based surveillance) rather than speculation drives her purchase decision. This is Fragment\'s strongest use case: legitimate privacy need with functional utility.',
    },
    {
      contextTag: '[Platform-dependent risk]',
      scenario: 'Keiko holds 5 premium Fragment usernames worth approximately 30,000 TON total ($150,000). She asks about the primary risk.',
      outcome: 'Platform risk: her username NFTs have value because Telegram has 900M users and those usernames matter for identity and branding. If Telegram faced a major regulatory shutdown in key markets, was acquired and changed direction, or faced a security breach that drove user migration to Signal/WhatsApp, the demand for premium Telegram usernames could collapse rapidly. Unlike a domain name (internet protocols are not controlled by one company), Fragment usernames are entirely dependent on one platform\'s continued operation and growth. This is a concentrated, platform-specific risk with no easy hedge.',
    },
  ],

  keyTakeaway: 'Fragment tokenises Telegram usernames and anonymous numbers as TON NFTs — creating genuine scarcity and transferability. Value depends entirely on Telegram\'s continued growth and regulatory standing. This is platform-dependent risk unlike most crypto assets.',

  guidedPractice: [
    {
      question: 'How does Fragment change the ownership model for Telegram usernames?',
      options: [
        'Usernames are still controlled by Telegram\'s database — Fragment just provides a secondary market',
        'Premium username ownership is moved to the TON blockchain as NFTs — whoever holds the NFT controls the username, transferable without Telegram support',
        'Fragment only handles username display rights — account access remains with Telegram',
        'Usernames on Fragment are leased for 1-year terms, not permanently owned',
      ],
      correct: 1,
      hint: 'What determines who controls a username — the NFT or Telegram\'s servers?',
      explanation: 'The key innovation: Telegram moved the ownership record for premium usernames from its centralised database to the TON blockchain. The NFT holder is the username\'s owner. Transfer the NFT (on TON) and the username transfers atomically — no Telegram support ticket, no verification process, no waiting period. This is the same principle as ENS names: blockchain-recorded ownership replaces centralised database control. The atomicity is valuable: username purchase and transfer are settled in one on-chain transaction with cryptographic finality.',
    },
    {
      question: 'What makes anonymous TON numbers on Fragment valuable beyond speculation?',
      options: [
        'Anonymous numbers earn staking rewards on the TON blockchain',
        'They provide genuine privacy utility — allowing Telegram registration without a real phone carrier, protecting users from phone number surveillance in jurisdictions where this is a legitimate safety concern',
        'Anonymous numbers grant access to premium Telegram features not available to regular users',
        'They are required for Fragment username purchases — a prerequisite for participating in the marketplace',
      ],
      correct: 1,
      hint: 'Who has legitimate reasons to not want their real phone number linked to their Telegram account?',
      explanation: 'Journalists protecting sources, activists in authoritarian countries, business people maintaining privacy from clients, and anyone concerned about phone number data sharing have legitimate privacy needs. An anonymous TON number allows Telegram registration independent of a real carrier — the carrier cannot link the number to a person, and governments cannot request subscriber information from a carrier for a number that doesn\'t exist in a carrier database. This functional utility creates demand independent of speculative username markets.',
    },
    {
      question: 'What is the primary risk of holding premium Fragment usernames as investments?',
      options: [
        'TON blockchain bugs could destroy username NFTs',
        'Platform risk — username value depends entirely on Telegram\'s continued operation and growth. Telegram regulatory shutdown, acquisition, or user migration could collapse demand rapidly',
        'Fragment\'s smart contracts could be upgraded to change username ownership rules',
        'Other messaging platforms can claim the same usernames, reducing their scarcity',
      ],
      correct: 1,
      hint: 'What provides the underlying demand for a Telegram username? What happens if that demand disappears?',
      explanation: 'A Telegram username has value because Telegram has 900M engaged users and a username provides identity and discoverability within that ecosystem. This value is entirely contingent on Telegram\'s continued existence and growth. Domain names (DNS) are independent of any single company — even if GoDaddy failed, domain names would still work because DNS is a decentralised protocol. Telegram usernames have no such independence: they exist within Telegram\'s platform. Telegram regulatory action (like the Durov arrest in 2024), platform decline, or major competitor growth all represent material risks to username valuations.',
    },
    {
      question: 'The username @defi sold on Fragment for 100,000 TON ($500,000 at $5/TON). What framework would you use to evaluate this price?',
      options: [
        'Compare to TON market cap — usernames should be valued as a fixed percentage of TON market cap',
        'Use a domain name analogy: (1) keyword value and branding utility, (2) length and scarcity, (3) comparable sales for similar username types, (4) Telegram growth trajectory, (5) buyer pool depth — how many entities would pay this for the branding',
        'Fragment usernames should always be avoided as speculative assets with no fundamental value',
        'Compare to @defi\'s Twitter handle value — social media usernames trade at consistent multiples',
      ],
      correct: 1,
      hint: 'What determines the value of a domain name? Apply the same framework.',
      explanation: 'Domain name valuation framework applied to usernames: (1) Keyword quality — @defi is a high-value, frequently searched term with obvious branding utility for DeFi projects. (2) Scarcity — 4-letter usernames are fixed in quantity. (3) Comparables — what did @crypto, @nft, @btc sell for? (4) Platform trajectory — is Telegram growing? (5) Buyer pool — how many DeFi companies, exchanges, or influencers could justify $500K for @defi? The domain name analogy holds: defi.com might sell for $200K+. @defi at $500K requires believing Telegram becomes the primary DeFi distribution channel for that to justify the price.',
    },
    {
      question: 'You own the NFT for @example on Fragment. Someone wants to buy it. How does the transfer work?',
      options: [
        'They contact Telegram support to request the username transfer',
        'They purchase the NFT on Fragment — the TON blockchain records the new owner, and Telegram automatically assigns the @example username to the new NFT holder\'s linked Telegram account',
        'You must manually release the username in Telegram settings, then the buyer claims it on Fragment',
        'Transfers require a 30-day waiting period for Telegram to verify ownership change',
      ],
      correct: 1,
      hint: 'Ownership is determined by the NFT on TON. What happens when the NFT transfers?',
      explanation: 'The transfer is atomic and on-chain: the buyer sends TON (or the agreed payment), the Fragment contract transfers the username NFT to their TON wallet, and Telegram\'s system — which reads ownership from the TON blockchain — automatically assigns the @example username to the new owner\'s Telegram account linked to that TON wallet. No support ticket, no manual steps, no waiting period. The blockchain transaction is the transfer. This atomicity and trustlessness is the core value of tokenising username ownership on-chain versus a centralised marketplace.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 172 — Play-to-Airdrop: The Model, Notcoin, and Hamster Kombat
// ─────────────────────────────────────────────────────────────────────────────

const L172: IslandLevel = {
  id: 172, mechanic: 'memory', tier: 'pro',
  topic: 'Play-to-Airdrop — Notcoin, Hamster Kombat, and the Model',

  explanation: `
In May 2024, Notcoin launched its token after a 6-month Telegram tap-to-earn game. 35 million players had accumulated points by tapping a coin on screen. The token launched on major exchanges, giving each player a token allocation proportional to their points. Notcoin became one of the most-watched token launches of 2024, generating significant early trading volume.

The play-to-airdrop model has a specific structure: build a free Telegram Mini App game, attract users through viral Telegram sharing, let users accumulate points through simple repetitive actions, then convert points to tokens at launch. This model exploits Telegram's distribution at near-zero cost.

For the project: it is a remarkably cheap user acquisition strategy. 35 million users who never paid anything, attracted through social sharing. When the token launches, those users become potential traders and community members. For exchanges, these launches generate massive trading volume on listing day.

For participants, the honest analysis requires calculating time economics. Notcoin: players who spent 1 hour per day for 6 months (180 hours) often received $100–$300 in token value at launch. That is $0.55–$1.67/hour — below minimum wage in most countries. Some top-tier players received $1,000–$3,000 from significantly more investment. The upside case depends on the token appreciating after launch.

Hamster Kombat scaled the model 10× to 300M players but diluted per-player allocations proportionally. HMSTR's launch disappointed many — the massive player base divided a finite token pool, producing smaller-than-expected allocations.

Evaluation framework before participating: (1) Is the game entertaining enough to play for free? (2) What is the realistic expected allocation per hour invested? (3) What is the project's actual legitimacy beyond the game?
  `.trim(),

  fact: 'Play-to-airdrop: free Telegram game → points → token allocation at launch. Notcoin: 35M players, $100–$300 median allocation after 180 hours of play ($0.55–$1.67/hour). Hamster Kombat: 300M players, lower per-player allocations due to pool dilution.',
  plain: 'Play-to-airdrop games let you earn token allocations by playing a simple game in Telegram. The math: most players earn less than minimum wage for their time. Play because it\'s fun, not as a primary income strategy.',
  stars: [800, 984, 1230], target: 1230, coins: 64,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Notcoin case study]',
      scenario: 'James played Notcoin for 3 months, tapping for 45 minutes per day. He estimates 135 hours total. He received 1,000 NOT tokens worth $150 at launch.',
      outcome: '$150 ÷ 135 hours = $1.11/hour. Below minimum wage in most developed countries. However: (1) The game was genuinely entertaining for him — he played while watching TV, not as a dedicated task. (2) NOT tokens appreciated 40% in the first month — his allocation grew to $210. (3) He learned about TON ecosystem through the experience. His actual assessment: good entertainment value, poor return for dedicated time investment. He would not quit his job to play Notcoin.',
    },
    {
      contextTag: '[Hamster Kombat dilution]',
      scenario: 'Amara played Hamster Kombat for 4 months with 2 hours per day (240 hours). She expected a large allocation because she was in the top 10% of players.',
      outcome: 'HMSTR allocated tokens to 300M players — a pool 10× larger than Notcoin. Top 10% = 30 million players. Even strong performers received modest allocations because the pool was so large. Amara received 50,000 HMSTR worth approximately $80 at launch. $80 ÷ 240 hours = $0.33/hour. Had she known in advance that 300M players would be competing, she could have calculated the dilution risk. The lesson: more total players = more dilution of fixed token pools, even for top performers.',
    },
    {
      contextTag: '[Legitimate vs speculative play-to-airdrop]',
      scenario: 'Keiko evaluates two new Telegram play-to-airdrop games. Game A: tapping mechanics, anonymous team, no verifiable on-chain activity. Game B: actual blockchain strategy game, doxxed team with prior games, verifiable on-chain token structure.',
      outcome: 'Game A characteristics: low legitimacy signals, pure gambling on token launch, typical of most play-to-airdrop projects. Time investment: not recommended unless willing to lose all invested time. Game B characteristics: genuine product, team accountable, on-chain verifiable tokenomics. The token allocation at launch has real infrastructure behind it. Even at $0.80/hour, Game B represents legitimate time-valued airdrop participation. The distinction between genuine product + airdrop (Game B) and pure airdrop game (Game A) matters for time allocation.',
    },
  ],

  keyTakeaway: 'Play-to-airdrop mechanics generate enormous user counts but deliver modest per-player returns when diluted across large player bases. Calculate expected hourly return before investing time. Only meaningful if (1) the game has genuine entertainment value, or (2) the project has legitimate substance beyond the game.',

  guidedPractice: [
    {
      question: 'A play-to-airdrop game expects 100M players competing for a token pool valued at $50M. What is the approximate average allocation per player?',
      options: ['$5,000', '$500', '$50', '$0.50'],
      correct: 2,
      hint: '$50M ÷ 100M players = ?',
      explanation: '$50M ÷ 100M players = $0.50 per player on average. In reality, distribution is skewed toward top players — but even top 1% (1M players) sharing 40% of the pool ($20M) receive $20 per person on average. The math of large player counts and fixed token pools almost always produces disappointing individual allocations. This is the dilution problem: the viral growth that makes play-to-airdrop successful for the project destroys per-player value for participants.',
    },
    {
      question: 'Why did Hamster Kombat\'s 300M users produce lower per-player allocations than Notcoin\'s 35M users?',
      options: [
        'Hamster Kombat had a smaller total token pool than Notcoin',
        'More players competing for a fixed token pool means each player receives a smaller proportional share — 300M players dilutes per-player allocation roughly 8.6× compared to 35M players with the same total pool',
        'Hamster Kombat changed its distribution rules at the last minute',
        'Most Hamster Kombat players were bots that received no allocation',
      ],
      correct: 1,
      hint: 'Fixed pool ÷ 35M vs fixed pool ÷ 300M — which produces a larger individual share?',
      explanation: 'If both games distributed a $100M token pool: Notcoin at 35M players = ~$2.86 average. Hamster Kombat at 300M players = ~$0.33 average. The same game with 10× more players produces 10× less per player. Viral growth that makes a play-to-airdrop game famous is simultaneously the mechanism that dilutes per-player value. The most successful play-to-airdrop participation (highest time-adjusted return) is in games before they go viral — when player count is low and dilution is minimal.',
    },
    {
      question: 'What is the most important calculation to make before participating in a play-to-airdrop game?',
      options: [
        'The probability that the token will 100× after launch',
        'Expected allocation (estimated token value × your likely percentage of total points) ÷ estimated hours to earn that allocation = expected hourly return — compared to your opportunity cost',
        'Whether the game has a good Telegram star rating',
        'The total number of players already participating',
      ],
      correct: 1,
      hint: 'You are trading time for tokens. What calculation makes a job worth doing?',
      explanation: 'Time has value. Before participating: estimate (1) total players who will participate, (2) realistic allocation percentile you can achieve, (3) expected token value at launch based on comparable projects, (4) hours required for your target allocation tier. Expected hourly return = (allocation × token price) ÷ hours. Compare to: your hourly wage, other activities you could be doing, or simply whether the game is entertaining enough to play for free. If the hourly return is below $1 and the game is not inherently fun, the time is better spent elsewhere.',
    },
    {
      question: 'What distinguishes a legitimate play-to-airdrop project from a pure speculation game?',
      options: [
        'Legitimate projects always have more players than speculation games',
        'Legitimate projects have verifiable on-chain tokenomics, doxxed or credentialed teams with prior products, an actual product beyond the game, and a token utility beyond pure speculation',
        'Legitimate projects distribute tokens through centralised exchanges immediately',
        'Speculation games are those requiring payment to participate; legitimate ones are always free',
      ],
      correct: 1,
      hint: 'What makes a crypto project legitimate beyond its user acquisition mechanics?',
      explanation: 'Red flags for pure speculation games: anonymous team with no prior products, no on-chain verifiable token structure, no stated use case beyond "earn points, get tokens," no actual product or service the token governs or enables. Legitimate signals: team can be verified (prior products, GitHub, LinkedIn), tokenomics are on-chain and auditable, the project has a genuine product the token is connected to, and the game mechanics relate to actual protocol usage rather than mindless tapping. Most play-to-airdrop games are pure speculation games — a few (like those with genuine blockchain game mechanics) qualify as legitimate.',
    },
    {
      question: 'You enjoy a Telegram play-to-airdrop game and play it casually while commuting. You spend 0 additional time on it. A token launches and you receive $40 in allocation. How should you evaluate this outcome?',
      options: [
        'Poor outcome — $40 is not worth the time investment',
        'Excellent outcome — you received $40 for entertainment you would have consumed anyway. The hourly return is effectively infinite because the incremental time cost was zero',
        'Below average — most players receive over $100',
        'It depends on the gas costs to claim the tokens',
      ],
      correct: 1,
      hint: 'What was your incremental cost for the $40 received?',
      explanation: 'If you played the game for entertainment and would have spent that commute time on a game anyway, the incremental time cost of the airdrop is zero. $40 on $0 incremental investment = infinite return on marginal time. This is the correct framing: play-to-airdrop is positive for people who genuinely enjoy the games AND receive token allocations. It is poor time allocation for people who force themselves to play a game they find tedious solely for speculative token value. The distinction is about whether the activity has independent entertainment value.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 173 — TON DeFi: STON.fi and DeDust
// ─────────────────────────────────────────────────────────────────────────────

const L173: IslandLevel = {
  id: 173, mechanic: 'chain', tier: 'pro',
  topic: 'TON DeFi — STON.fi and DeDust',

  explanation: `
By 2024, TON's DeFi ecosystem had two dominant DEXes that together handled the majority of on-chain token trading. Understanding their differences helps navigate TON DeFi effectively.

STON.fi is the largest TON DEX by trading volume and TVL. It uses an Automated Market Maker (AMM) model similar to Uniswap v2 — a constant product formula (x*y=k) for most pairs. The key differentiator is accessibility: STON.fi operates as a Telegram Mini App, making it accessible directly from the messenger without any additional downloads. Swap fees: 0.3% for standard pairs, 0.1% for stable pairs. Users can provide liquidity (LP) in any token pair and earn proportional trading fees plus STON.fi liquidity mining rewards.

DeDust is STON.fi's main competitor. It uses a different liquidity architecture — a "vault" model where liquidity is pooled in separate vault contracts for each asset rather than paired pool contracts. This design has advantages for certain trading strategies and enables more sophisticated liquidity management. DeDust's fee structure: 0.25% for standard pairs (slightly lower than STON.fi). DeDust has attracted significant TVL, particularly for higher-volume traders who prefer its interface and fee structure.

Practical considerations for users: STON.fi is the better starting point — superior Mini App integration, larger liquidity for most pairs, and more familiar UX. DeDust becomes relevant for pairs where it has deeper liquidity, for LP providers seeking slightly lower fee competition, or for power users wanting more advanced position management.

Yield opportunities: USDT/TON stable-ish pairs on STON.fi have offered 5–15% APY combining fees and liquidity mining. Higher-risk pairs (newer jettons) offer 20–50%+ APY but with significant impermanent loss and token depreciation risk.
  `.trim(),

  fact: 'STON.fi: largest TON DEX, AMM model, 0.3%/0.1% fees, Telegram Mini App. DeDust: vault-based liquidity model, 0.25% fee, preferred by advanced traders. Combined they handle the majority of TON on-chain trading.',
  plain: 'STON.fi is the Uniswap of TON — biggest, most accessible, works inside Telegram. DeDust is the alternative DEX with slightly different architecture and lower fees. Start with STON.fi.',
  stars: [860, 1058, 1323], target: 1323, coins: 68,
  simulatorLesson: 'tonMiniAppDex',

  examples: [
    {
      contextTag: '[First swap on TON]',
      scenario: 'Priya has 20 TON in her TON Space wallet and wants to convert half to USDT. She uses STON.fi Mini App.',
      outcome: 'She opens the STON.fi bot in Telegram, connects her TON Space wallet via TON Connect. She selects TON → USDT, enters 10 TON. Rate shown: 10 TON = 49.80 USDT (at TON $5, 0.3% fee = 0.03 TON). She checks the slippage (0.5% default — adjustable), confirms the transaction appears in Telegram, approves. 10 TON swaps to 49.80 USDT in her TON Space wallet. Gas: ~0.01 TON ($0.05). Total cost: ~$0.20 in fees and gas for a $50 swap — 0.4% all-in.',
    },
    {
      contextTag: '[LP comparison between DEXes]',
      scenario: 'Marcus wants to provide $5,000 in USDT/TON liquidity to earn yield. He compares STON.fi and DeDust.',
      outcome: 'STON.fi USDT/TON pool: 7.2% APY from fees + 3.8% STON.fi rewards = 11% total. Pool TVL: $8M. DeDust USDT/TON pool: 6.8% APY from fees (0.25% fee rate) + 2.1% DeDust rewards = 8.9% total. Pool TVL: $3.5M. STON.fi: higher APY, deeper liquidity (less slippage on his position\'s exits). DeDust: lower fee for traders (means his LP may attract more volume) but lower reward. He chooses STON.fi — the higher total APY and deeper liquidity reduce IL risk relative to yield.',
    },
    {
      contextTag: '[Risk evaluation for new jetton LP]',
      scenario: 'Amara sees a new TON jetton (token) offering 80% APY in its STON.fi LP pool.',
      outcome: '80% APY breaks down: 5% from trading fees, 75% from the project\'s own token emissions (liquidity mining). The 75% emission APY depends on: (1) the project token maintaining value — if it drops 90%, her 75% APY becomes 7.5% effective. (2) If the token is a rug pull, she loses both her USDT position and any accumulated rewards. She checks: GoPlus on TON blockchain for jetton contract risks, project team legitimacy, LP lock status. The 80% APY is the compensation for taking these risks — high yield on TON DeFi always has high corresponding risk.',
    },
  ],

  keyTakeaway: 'STON.fi (largest, Mini App integrated, 0.3% fee) and DeDust (vault model, 0.25% fee) are TON\'s primary DEXes. Start with STON.fi for accessibility. High APY pools on new jettons reflect high risk — evaluate underlying project legitimacy before providing liquidity.',

  guidedPractice: [
    {
      question: 'What is the primary accessibility advantage of STON.fi over typical DEXes?',
      options: [
        'STON.fi charges zero fees on the first swap for new users',
        'STON.fi operates as a Telegram Mini App — accessible directly from the Telegram messenger without separate browser, extension, or app download',
        'STON.fi supports more blockchains than any other DEX',
        'STON.fi has a centralised order book that reduces slippage to zero',
      ],
      correct: 1,
      hint: 'How do users access STON.fi versus how they access Uniswap?',
      explanation: 'Accessing Uniswap: open a browser, navigate to app.uniswap.org, have MetaMask installed and connected, have ETH for gas. Accessing STON.fi: open Telegram, search for the STON.fi bot, connect TON Space (one tap). The entire user journey happens inside an app already installed on 900M devices. This accessibility difference — not technical superiority — is STON.fi\'s most meaningful competitive advantage in reaching new DeFi users.',
    },
    {
      question: 'A STON.fi pool shows 50% APY: 8% from fees and 42% from liquidity mining rewards. What is the realistic sustained yield?',
      options: [
        '50% — the total APY is what matters regardless of source',
        'Likely 8% sustained — liquidity mining rewards are usually temporary incentives that decrease over time or end entirely. Fee-based APY is more durable as it depends on trading volume',
        '42% — the liquidity mining is the base yield',
        '0% — all DeFi yields are temporary and unsustainable',
      ],
      correct: 1,
      hint: 'Liquidity mining rewards are paid in project tokens. What happens when the mining programme ends?',
      explanation: 'Liquidity mining (emission rewards) is typically a time-limited incentive: a fixed amount of tokens distributed over months to bootstrap pool depth. When the programme ends or token supply runs out, the emission component disappears. Fee-based yield (8%) persists as long as the pool has trading volume. The 42% emission APY is temporary compensation for early liquidity provision — the realistic long-term yield after mining ends is closer to 8%. High-APY pools that are primarily emission-driven should be evaluated for how long the mining programme runs and whether fee-based yield is sufficient after it ends.',
    },
    {
      question: 'DeDust\'s vault-based liquidity model differs from STON.fi\'s paired pools. What practical benefit does this create?',
      options: [
        'Vault-based liquidity eliminates impermanent loss for all LPs',
        'Each asset\'s liquidity is managed in separate vault contracts, allowing more flexible cross-pool routing and potentially more efficient liquidity utilisation for complex trades',
        'Vault contracts automatically rebalance LP positions during price movements',
        'DeDust\'s vault model requires less initial capital, making LP provision more accessible',
      ],
      correct: 1,
      hint: 'If asset liquidity is in separate vaults rather than fixed pairs, what routing flexibility does this enable?',
      explanation: 'STON.fi standard AMM: liquidity exists in fixed pairs (TON/USDT pool, TON/STON pool, etc.). A trade routing through multiple pairs must hop between pools. DeDust\'s vault model: assets are stored in single-asset vaults, with liquidity assembled dynamically for trades. This enables more efficient routing for complex trades involving multiple assets and potentially better price discovery. The practical difference is most visible for larger trades and less common trading pairs, where DeDust\'s routing flexibility can provide better execution than paired pool systems.',
    },
    {
      question: 'You want to provide $3,000 in USDT/TON liquidity on STON.fi. What impermanent loss risk do you face?',
      options: [
        'No IL risk — USDT is a stablecoin, so the pair is perfectly correlated',
        'Significant IL risk — if TON price changes substantially (up or down), the AMM rebalances your position, leaving you with less TON (if it pumps) or less USDT (if it dumps) than if you had simply held both assets separately',
        'IL only occurs on STON.fi if you withdraw during a price movement',
        'STON.fi\'s algorithm prevents IL by auto-rebalancing outside the contract',
      ],
      correct: 1,
      hint: 'USDT is stable, TON is volatile. What happens to a 50/50 USDT/TON position when TON price doubles?',
      explanation: 'USDT/TON is an impermanent loss-heavy pair because one asset (USDT) is stable and one (TON) is highly volatile. When TON doubles: the AMM rebalances — you end up with more USDT and less TON than your original split. If you had held the tokens separately and TON doubled, your portfolio would be worth more. The difference is impermanent loss. For a $3,000 position with TON doubling from $5 to $10: IL is approximately 5.7% of initial value. At 11% APY, this break-even point is approximately 6 months — you need to hold the position long enough for fees to exceed IL.',
    },
    {
      question: 'What is the most important first check before providing liquidity to any jetton pair on STON.fi?',
      options: [
        'Verify the pool has been live for at least 90 days',
        'Check the jetton\'s mint authority status and LP lock on the TON blockchain explorer — active mint authority means the developer can print unlimited tokens, destroying your LP position value',
        'Confirm the pool has a minimum of $1M in TVL',
        'Verify the project has a verified STON.fi partnership badge',
      ],
      correct: 1,
      hint: 'What is the equivalent of the GoPlus contract check for Solana memecoins — applied to TON jettons?',
      explanation: 'TON jettons have the same fundamental risks as Solana SPL tokens. Active mint authority: the developer can print unlimited tokens and dump them into the LP — destroying your position. LP lock verification: if the project\'s own LP tokens are not locked, they can drain the pool instantly. Both checks are non-negotiable before providing liquidity to any new jetton pair. On TON: use Tonviewer (tonviewer.com) to check jetton contract details and LP lock status. Same principles, different chain.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L166–173)
// ─────────────────────────────────────────────────────────────────────────────

export const TON_LEVELS_A: Record<number, IslandLevel> = {
  166: L166,
  167: L167,
  168: L168,
  169: L169,
  170: L170,
  171: L171,
  172: L172,
  173: L173,
};
