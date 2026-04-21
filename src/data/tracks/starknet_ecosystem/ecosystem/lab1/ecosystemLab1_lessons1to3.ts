// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// JUNIOR · LAB 1 — PROTOCOL LANDSCAPE · LESSONS 1–3
// Type classifications: L1.1 Type A · L1.2 Type A · L1.3 Type A
// Learner: zero DeFi knowledge. Plain English first, always.

// ─────────────────────────────────────────────────────────────
// L1.1 — The Full Starknet Map: Every Category
// TYPE A — Dominant concept: seven protocol categories determine
// which questions and metrics to use when analysing any protocol.
// ─────────────────────────────────────────────────────────────

export const LAB1_LESSON_1 = {
  id: 'l1-1-starknet-map',
  title: 'The Full Starknet Map: Every Category',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
In the summer of 2020, something unusual happened. A new category of financial apps — apps with no banks, no employees, no company offices — crossed $1 billion in total deposits for the first time. By September that same year, the number had hit $10 billion. By 2021, it crossed $100 billion. This explosion happened across dozens of different applications doing completely different things.

Analysts trying to make sense of it faced an immediate problem: how do you compare an app that lets you swap currencies with one that lets you borrow money? How do you evaluate a gaming platform alongside a price-reporting service? The answer — once someone thought of it — was obvious: categorise them. The moment you know what category something belongs to, you know exactly what questions to ask.

Starknet today has the same challenge. There are hundreds of protocols, products, and services. Without a map, it is overwhelming. With the map, you can pick up any new protocol, place it in its category, and immediately know what data to look for, what risks matter, and what metrics measure success.

This lesson gives you that map. Seven categories. Every Starknet protocol belongs to one.

ONE NUMBER YOU NEED TO KNOW FIRST

Throughout this track, one metric appears constantly: TVL. Before anything else, you need to know precisely what it means.

Picture a swimming pool. People fill it with money. TVL is the water level right now — the total dollar value of tokens currently sitting inside a protocol's smart contracts. A protocol with $100M TVL has $100M of real user funds actively deployed inside it.

TVL stands for Total Value Locked. It is the dollar value of all tokens deposited into a protocol's smart contracts at this moment. It is the primary metric for comparing how much any protocol is being used. You will use it every day in this track.

CATEGORY 1 — TOKEN EXCHANGES (DEXs)

When you travel internationally and arrive at the airport, you visit a currency exchange booth. You hand over pounds, they check the current rate, and you receive euros. The whole thing takes 30 seconds. No bank account required. No credit check. No manager approving the transaction.

Starknet has the same concept, but for crypto tokens. You arrive with STRK and want USDC. A protocol finds the current rate, executes the swap, and you receive USDC — all in a single transaction. No company holds your tokens during the swap. No account is required.

This is called a DEX — Decentralised Exchange. AVNU is Starknet's primary DEX aggregator: it searches every other DEX simultaneously to find you the best rate. Ekubo is the largest individual DEX on Starknet — the actual trading venue where most liquidity lives.

Key metric: daily trading volume.

CATEGORY 2 — LENDING DESKS

You have a savings account earning 3% annual interest because the bank lends your deposits to other customers. You might also have a mortgage — you borrowed money using your house as collateral. The bank earns the gap between what it pays you and what it charges borrowers.

DeFi lending removes the bank. You deposit USDC directly into a lending protocol. Borrowers on the other side take that USDC and pay interest. That interest flows directly to you — no bank capturing the spread. Or you deposit ETH as collateral and borrow USDC against it without selling your ETH. The loan rules are enforced in code, automatically, 24 hours a day.

These are called Lending Protocols. Vesu and Nostra are Starknet's two main lending protocols. No application process. No credit score. No opening hours.

Key metrics: TVL, utilisation rate (% of deposits actively borrowed), supply APY.

CATEGORY 3 — WALLETS

Before using any DeFi protocol, you need a wallet — your bank app and debit card combined into one piece of software. It holds your tokens and approves every action you take. Without a wallet, you cannot interact with anything on Starknet.

What makes Starknet wallets unique: every wallet is a programmable smart contract, not just a key. This unlocks features that are impossible on most other blockchains — log in with Face ID, recover your account without a seed phrase, let a game sign moves on your behalf without interrupting you every time.

The main Starknet wallets: Argent X (general use, social login), Braavos (mobile-first, biometric sign-in), Cartridge Controller (built for gaming).

Key metrics: monthly active wallets, wallet creation rate.

CATEGORY 4 — ON-CHAIN GAMES

When you buy items in a mobile game, those items live on the company's server. If the company shuts down, your items disappear. You never owned them — the company did.

On Starknet, some games store every action directly on the blockchain. Every fight, every item earned, every achievement lives in permanent code that no company can delete. Your items are tokens in your wallet. You own them the way you own cash.

These are called On-Chain Games. Dojo is the game engine developers use to build them. Loot Survivor 2 and Ponziland are two of the most active Starknet games.

Key metrics: daily active users (DAU), transactions from gaming activity.

CATEGORY 5 — PRICE REPORTERS (ORACLES)

A lending protocol needs to know the current price of ETH at every moment. If a user's ETH collateral crashes 50% in value, the protocol must act immediately.

The problem: a smart contract cannot browse the internet. It can only read data that has already been written onto the blockchain by an external service. A dedicated infrastructure layer must continuously post accurate prices onto the chain so that DeFi protocols can read them.

This price-reporting infrastructure is called an Oracle. Pragma is Starknet's primary oracle. Without Pragma, every lending protocol on Starknet would lose its price feeds simultaneously.

Key metrics: number of protocols depending on it, price update frequency.

CATEGORY 6 — BORDER CROSSINGS (BRIDGES)

Your USDC on Ethereum and your USDC on Starknet are completely separate. Even though both are worth $1, they exist on different networks. Moving assets between them requires a checkpoint — a bridge.

A bridge locks your USDC on Ethereum and mints equivalent USDC on Starknet. When you return, it burns the Starknet USDC and releases your Ethereum USDC. Starkgate is Starknet's official bridge — built into the protocol itself. Third-party bridges like Orbiter offer faster transfers with slightly more counterparty risk.

Key metrics: 30-day bridge volume, bridge TVL.

CATEGORY 7 — CONSTRUCTION TOOLS (DEVELOPER TOOLS)

Every protocol in every category above was built by developers using tools. Scarb compiles Cairo code. Starknet Foundry runs tests. The Starkzap SDK connects deployed contracts to users. These tools never appear in TVL rankings — but the entire ecosystem depends on their quality.

Key metrics: GitHub stars, monthly active developers, time-to-first-deployment.

THE MAP IN ONE SENTENCE EACH

DEXs — swap one token for another, instantly, no account required.
Lending — deposit to earn interest, or borrow against your own collateral.
Wallets — hold your tokens and authorise your transactions.
Games — games whose rules and assets live permanently on-chain.
Oracles — write real-world prices onto the blockchain for DeFi to read.
Bridges — move assets between Ethereum and Starknet.
Developer Tools — build, test, and deploy everything above.

Every protocol you will analyse in this track belongs to one of these seven. The category tells you which questions matter. Start there every time.
  `.trim(),

  keyTakeaway: `Starknet's ecosystem has seven categories — DEXs, Lending, Wallets, Games, Oracles, Bridges, and Developer Tools — and identifying which category a protocol belongs to immediately tells you which metrics and risks to analyse.`,

  visualPrompt: `A layered city diagram. Bottom: Developer Tools (Scarb, Starkzap SDK). Second layer: Bridges (left edge, entry/exit) and Oracles (centre, feeding up). Third layer: DEXs (AVNU, Ekubo) and Lending (Vesu, Nostra). Top layer: Wallets (Argent, Braavos, Cartridge) and Games (Dojo, Loot Survivor 2). Arrows show dependencies. Each category distinct colour. TVL bars beside DEX and Lending. Labels outside shapes only.`,
  visualType: 'static',
  visualUrl: 'starknet-ecosystem-category-map',

  examples: [
    {
      contextTag: '[Junior analyst, first ecosystem brief]',
      context: 'A research analyst is asked to summarise the Starknet ecosystem. She opens DefiLlama and sees 23 protocol names with no structure.',
      scenario: 'She applies the seven-category map, sorting all 23 into DEXs, Lending, Wallets, Games, Oracles, Bridges, and Developer Tools. She immediately sees strong DEX coverage but only one oracle — Pragma.',
      outcome: 'The map turned 23 undifferentiated names into a structured ecosystem picture with one clear risk observation: oracle concentration. The category gave her the question to ask. Without the map, she had a list. With it, she had an analysis.',
    },
    {
      contextTag: '[Protocol claiming multiple categories]',
      context: 'A new protocol claims to be simultaneously a DEX, a lending market, and a price oracle in one contract.',
      scenario: 'An analyst asks: "What happens if the oracle component is manipulated?" In a single-category DEX, oracle manipulation hits only the DEX. In this combined protocol, it misprices trades and triggers wrong liquidations simultaneously.',
      outcome: 'Category blurring concentrates failure modes. A bug in one function cascades across all functions. She rates the combined protocol as high-risk specifically because of the multi-category architecture.',
    },
    {
      contextTag: '[TVL interpreted correctly]',
      context: 'A journalist writes: "Starknet has $800M TVL — that means users have $800M in profits locked inside."',
      scenario: 'An analyst reads the claim. TVL is total deposits, not profits. A user depositing $10,000 USDC into Vesu adds $10,000 to TVL — that is their deposit, not their gain.',
      outcome: 'TVL = deposits. Not profits. The analyst corrects the record: $800M TVL means $800M of user funds are currently being used inside Starknet protocols — a measure of adoption, not of return.',
    },
  ],

  guidedPractice: [
    {
      question: 'Ekubo allows users to swap STRK for USDC at the current market rate without an account or giving the protocol custody of their tokens. Which category?',
      options: [
        'A. Lending — it involves exchanging one asset for another',
        'B. DEX — enables token swaps without a central custodian or account',
        'C. Oracle — it needs prices to execute the swap',
        'D. Bridge — it moves value from one token to another',
      ],
      correct: 1,
      hint: 'Which category specifically enables token swaps without an intermediary holding funds?',
      explanation: 'B is correct. Ekubo is a DEX — direct token swaps, no custody, no account. Lending (A) involves borrowing and interest. Oracle (C) reports prices but does not execute swaps. Bridge (D) moves assets between different networks, not between tokens on the same network.',
    },
    {
      question: 'Pragma writes the current ETH/USD price onto Starknet every few minutes. If Pragma stopped working, which category is most immediately and critically affected?',
      options: [
        'A. DEXs — they need prices to calculate swap rates',
        'B. Games — game assets need accurate valuations',
        'C. Lending protocols — they use Pragma\'s price to determine whether collateral still covers outstanding loans, and cannot safely liquidate without it',
        'D. Bridges — they need to verify asset values on both sides',
      ],
      correct: 2,
      hint: 'Which category\'s core safety mechanism requires real-time price data to function?',
      explanation: 'C is correct. Lending protocols calculate health factors using the current collateral price. Without oracle data, they cannot detect undercollateralised positions or trigger liquidations safely. AMMs like Ekubo use internal pool pricing, not oracles. Games and bridges have much weaker oracle dependencies.',
    },
    {
      question: 'A Starknet ecosystem report shows: DEXs $312M TVL, Lending $170M TVL, Bridges $85M, Games $12M, Developer Tools $0 TVL. What does the $0 for Developer Tools tell you — and is this a problem?',
      options: [
        'A. Nobody is using developer tools — serious problem',
        'B. Developer tools do not hold user funds — $0 TVL is correct and expected. The right metrics are GitHub stars and monthly active developers.',
        'C. Developer tools have not launched yet',
        'D. All their value is locked in the DEX category',
      ],
      correct: 1,
      hint: 'TVL measures funds deposited into contracts. Do developers deposit money into Scarb or Starknet Foundry?',
      explanation: 'B is correct. TVL measures tokens held in smart contracts. Developer tools (Scarb, Starknet Foundry, Starkzap SDK) are software for building — developers do not deposit money into them. $0 is expected. Measuring developer tools by TVL is like measuring a hammer factory by how many nails it keeps in storage.',
    },
    {
      question: 'You want to deploy a new DeFi protocol and need Ethereum users to deposit their USDC. Which infrastructure must you integrate with first?',
      options: [
        'A. An Oracle — to know the current USDC price',
        'B. A Bridge — Ethereum USDC and Starknet USDC are on separate networks',
        'C. A DEX — to let users swap into USDC before depositing',
        'D. A Wallet — to hold USDC during the transfer',
      ],
      correct: 1,
      hint: 'Ethereum assets and Starknet assets live on separate networks. Which category moves assets between networks?',
      explanation: 'B is correct. Ethereum USDC cannot reach Starknet directly. A bridge locks it on Ethereum and mints equivalent on Starknet. Only then can users deposit it into your protocol. Oracles, DEXs, and wallets are all useful but none solve the cross-network problem.',
    },
    {
      question: 'Protocol A (DEX): $50M TVL, $8M daily volume, 12,000 daily active wallets. Protocol B (Lending): $50M TVL, $200,000 daily volume, 400 daily wallets. Both have identical TVL. Which performs better for its category, and why does comparing them by volume miss the point?',
      options: [
        'A. Protocol A — higher volume always means better performance',
        'B. Both equal — TVL is the only metric that matters for both',
        'C. Protocol A performs strongly for a DEX (volume and users are its key metrics). Protocol B\'s low volume is normal for lending — lending revenue comes from interest over time, not transaction frequency. The right metric for B is utilisation rate.',
        'D. Protocol B performs better — lower volume means less exploitation risk',
      ],
      correct: 2,
      hint: 'How does each category generate value? Does a lending protocol need high swap volume to succeed?',
      explanation: 'C is correct. DEXs earn per swap — high volume means high fee revenue. Lending earns interest accrued over time on outstanding loans — the relevant metrics are utilisation rate and APY, not swap volume. Comparing Protocol B\'s volume to Protocol A\'s is a category error. Use category-appropriate metrics.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A DefiLlama snapshot shows: DEX $312M TVL (7 protocols), Lending $170M TVL (4 protocols), Oracle $0 TVL (1 protocol — Pragma), Bridge $85M TVL (3 protocols), Gaming $12M TVL (6 protocols). Identify: (1) which category is the critical weakness despite showing $0 TVL, (2) the specific systemic risk this creates, (3) why $0 TVL is misleading for this category.',
      scoringCriteria: [
        'Correctly identifies Oracle as the critical weakness — not because of $0 TVL but because only one protocol (Pragma) serves the entire ecosystem\'s price data needs',
        'Correctly states the systemic risk: if Pragma fails, all lending protocols lose price feeds simultaneously — a single point of failure for the entire DeFi stack',
        'Correctly identifies that $0 TVL is the wrong metric for oracles — they do not hold user funds, so TVL is not a relevant measure of their health or adoption',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A new Starknet protocol claims to be simultaneously a DEX, a lending market, and a price oracle in one contract. Their marketing states this reduces the number of contracts users touch. Identify three specific risks created by combining all three categories into one protocol.',
      scoringCriteria: [
        'Risk 1: Oracle manipulation now simultaneously misprices DEX trades AND triggers wrong lending liquidations — one attack has double impact vs separate protocols',
        'Risk 2: A bug in one category\'s code directly exposes both others — in a three-protocol stack, a lending bug cannot drain the DEX; in the combined protocol, it can',
        'Risk 3: Auditing is significantly harder — auditors must check interactions between three systems, increasing the probability of missed vulnerabilities at intersection points',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You are speaking to a traditional finance analyst who covers equity markets. She has no DeFi experience. Explain the Starknet DeFi ecosystem in plain terms. Use exactly three category names. Zero blockchain jargon. Do not use: "decentralised", "protocol", "smart contract", "on-chain", "blockchain".',
      scoringCriteria: [
        'Uses exactly three category names from the seven and correctly describes what each does in plain English',
        'Analogies map to familiar traditional finance concepts — stock exchanges, banks, or financial infrastructure',
        'Zero prohibited words used — the explanation stands alone without any blockchain background',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L1.2 — Infrastructure: Sequencer, DA Layer, and L1 Settlement
// TYPE A — Dominant concept: three infrastructure components
// determine security, cost, and speed for every application above.
// ─────────────────────────────────────────────────────────────

export const LAB1_LESSON_2 = {
  id: 'l1-2-infrastructure',
  title: 'Infrastructure: Sequencer, DA Layer, and L1 Settlement',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
In March 2022, hackers stole $625 million from the Ronin Bridge — the infrastructure layer powering Axie Infinity, a game with millions of players. The hack was not a bug in the game. It was a vulnerability in the bridge's underlying infrastructure. Players using the game every day had no idea this infrastructure existed. They found out about it when their money was gone.

Infrastructure is invisible until it fails. Every DeFi protocol on Starknet depends on three infrastructure components beneath it. If those components have weaknesses, everything above them is at risk — regardless of how well-built the applications themselves are.

COMPONENT 1 — THE SEQUENCER

Picture a busy airport check-in counter with hundreds of passengers arriving simultaneously. Someone has to decide who gets processed first, sort them into a queue, and process them one by one. Without that sorting, it is chaos — everyone rushes at once and nobody gets through.

On Starknet, thousands of transactions arrive every second from users everywhere. The sequencer receives them all, decides the order, executes them (updating balances, recording swaps, applying lending positions), and packages them into a batch for proving. From your perspective: you submit a transaction and it appears as "pending" within seconds. That quick response is the sequencer working.

The critical fact: Starknet's sequencer is currently operated by a single company — StarkWare. One entity controls the order of every transaction on the network. This creates two specific risks.

Risk 1 — Outage: If the sequencer goes offline, no new transactions can be processed. In March 2023, Arbitrum's centralised sequencer went offline for 78 minutes. Every Arbitrum DeFi protocol froze — no swaps, no loan repayments, no withdrawals — for the entire outage. Funds were safe but completely inaccessible. Starknet carries the same risk today.

Risk 2 — Censorship: A centralised sequencer could, in theory, choose not to process specific addresses or transaction types — under legal order, business pressure, or regulatory requirement.

Decentralising the sequencer is on Starknet's roadmap. It is a known weakness being actively addressed.

COMPONENT 2 — THE DATA AVAILABILITY LAYER

Here is a question: if Starknet's servers all disappeared tomorrow, what would happen to your funds?

The answer is: nothing — because Starknet does not store its records only on its own servers. Every time Starknet proves a batch of transactions, it posts the raw transaction data to Ethereum. This data is the permanent record. If everything at StarkWare vanished tonight, anyone could reconstruct the complete Starknet state — every balance, every position — by reading the data on Ethereum.

Data availability means: all the data needed to reconstruct Starknet's current state is publicly accessible. If this data disappears, your funds cannot be proven — no one can demonstrate your balance exists.

Starknet currently posts full state data to Ethereum — the most secure option. The trade-off is cost: Ethereum blockspace is expensive, which contributes to Starknet's transaction fees.

This is called the Data Availability layer, or DA layer. Starknet's choice of Ethereum as its DA layer is the most battle-tested option available.

COMPONENT 3 — L1 SETTLEMENT

Your swap is processed by the sequencer. Your wallet shows the new balance. Is the transaction final?

Not yet — not in the complete sense. The sequencer has processed your transaction and included it in a batch. But until Ethereum verifies the STARK proof containing that batch, the transaction has not reached absolute finality.

L1 settlement is the moment Ethereum accepts Starknet's state update as permanent and irreversible. After this point, no force can alter the outcome. The mathematics of the STARK proof make it impossible to change a settled state.

L1 settlement typically happens a few hours after sequencer processing. The gap between sequencer confirmation and L1 settlement is the proof-generation window — normal and expected. For most DeFi activity, it is irrelevant. For very large capital movements requiring absolute certainty, it matters.

The entity that produces the proof is called the prover (StarkWare's prover service, receiving batches from the sequencer). The entity that verifies it is Ethereum. Ethereum acts as the verifier.

WHY ALL THREE MATTER TOGETHER

These three components form a chain. The sequencer processes. The DA layer records. Ethereum settles. Weakness in any one affects everyone above it.

Current Starknet profile: sequencer is centralised (known weakness, roadmap fix), DA is on Ethereum (maximum security), settlement is on Ethereum (maximum finality). This profile tells you precisely what risk you carry when you use Starknet today.
  `.trim(),

  keyTakeaway: `Three infrastructure layers underpin every Starknet protocol — the sequencer processes transactions, the DA layer records them permanently, and L1 settlement makes them irreversible — and a weakness in any one affects everything built above it.`,

  visualPrompt: `Vertical stack. Top: application protocols (DEXs, Lending, Games). Middle layer — three boxes: SEQUENCER (StarkWare, centralised, yellow caution badge), DA LAYER (data on Ethereum, green shield), L1 SETTLEMENT (Ethereum verification, green tick, "hours" clock). Bottom: Ethereum security foundation. Arrows flow upward. Each middle box shows one risk label below it: sequencer = single point of failure, DA = cost/security trade-off, L1 = finality gap.`,
  visualType: 'static',
  visualUrl: 'starknet-infrastructure-three-layers',

  examples: [
    {
      contextTag: '[User during sequencer outage]',
      context: 'A Starknet user\'s lending health factor has dropped to 1.05 — dangerously close to the 1.0 liquidation threshold. She needs to repay part of her loan immediately.',
      scenario: 'The Starknet sequencer goes offline for 90 minutes. She cannot submit any transactions. Her collateral price continues to fall. When the sequencer restores, her health factor is 0.97. The liquidation engine closes her position.',
      outcome: 'The sequencer outage directly caused a preventable liquidation. Her funds were not stolen — but the 90-minute window of inaccessibility at a critical moment turned a manageable risk into a loss. This is the concrete consequence of centralised sequencer infrastructure.',
    },
    {
      contextTag: '[DA layer protecting a user in an extreme scenario]',
      context: 'A hypothetical: StarkWare faces unexpected bankruptcy and shuts down all systems with no warning. A user has $40,000 in a Vesu lending position.',
      scenario: 'Because Starknet posts all state data to Ethereum, every balance up to the last posted batch is recorded permanently on Ethereum. The user\'s $40,000 position is provably hers — she can demonstrate this by reading Ethereum\'s records directly.',
      outcome: 'A new sequencer could be launched by any technically capable party, resuming from the last proven state. Her balance is provable because the record exists on Ethereum — not on StarkWare\'s servers. DA layer protection: the existence of your funds does not depend on any single company\'s survival.',
    },
    {
      contextTag: '[Protocol needing immediate finality — wrong expectation]',
      context: 'A DeFi derivatives protocol builds on Starknet, assuming "confirmed by sequencer = final" — because sequencer confirmation appears within seconds.',
      scenario: 'They design settlement to release collateral immediately on sequencer confirmation. A STARK proof fails to verify on Ethereum for a batch containing their settlements. The transactions in that batch must be re-sequenced.',
      outcome: 'The team conflated soft finality (sequencer confirmation, seconds) with hard finality (L1 settlement, hours). For most DeFi applications this gap is irrelevant — proof failures are extremely rare. For a derivatives settlement system, the distinction was critical and their design did not account for it.',
    },
  ],

  guidedPractice: [
    {
      question: 'Starknet\'s sequencer is currently operated by a single company. What are the two specific risks this creates for users of DeFi protocols on Starknet?',
      options: [
        'A. Fee increases and incorrect transaction processing',
        'B. Outages halting all transaction processing, and theoretical censorship of specific addresses or transaction types',
        'C. Private key loss and balance visibility issues',
        'D. Risk applies only to transactions above $10,000',
      ],
      correct: 1,
      hint: 'A single operator creates: (1) an availability risk when it goes offline, and (2) a control risk over what it processes.',
      explanation: 'B is correct. A centralised sequencer creates availability risk (if it goes offline, all processing halts — as happened with Arbitrum\'s 78-minute outage) and censorship risk (a single operator could exclude specific addresses under legal or business pressure). Option A misdescribes the failure modes. Options C and D do not accurately represent sequencer risks.',
    },
    {
      question: 'What does "data availability" mean for Starknet, and why does it matter for your funds if StarkWare\'s servers disappeared?',
      options: [
        'A. Starknet\'s website is always accessible so you can check your balance',
        'B. All transaction data is posted to Ethereum — your balance can be proven from Ethereum\'s public records even if Starknet\'s own systems disappear',
        'C. Transactions are viewable within 30 seconds of submission',
        'D. StarkWare stores backup copies on private servers',
      ],
      correct: 1,
      hint: 'Which component ensures your balance exists in a public, permanent record independent of any single company?',
      explanation: 'B is correct. Starknet posts raw transaction data to Ethereum permanently. Even if every Starknet server disappeared, anyone could reconstruct complete Starknet state from Ethereum\'s records. Your balance is provable independently of StarkWare\'s existence. Option A confuses web interface availability with blockchain data. Option D describes a private backup — the opposite of public verifiability.',
    },
    {
      question: 'You submit a swap at 2pm. Your wallet shows the new balance immediately. Is this transaction absolutely final at 2pm?',
      options: [
        'A. Yes — once your wallet shows the balance, it is permanent',
        'B. No — the sequencer has processed it (soft finality) but Ethereum has not yet verified the STARK proof. Full finality comes in a few hours.',
        'C. Yes — STARK proofs are instantaneous',
        'D. No — you must wait 7 days, like optimistic rollups',
      ],
      correct: 1,
      hint: 'The sequencer processed it quickly. Which component provides mathematical irreversibility, and how long does it take?',
      explanation: 'B is correct. Sequencer confirmation = soft finality. The transaction will almost certainly be included in the next proof. But until Ethereum verifies and accepts that proof, it is not mathematically irreversible. This gap is a few hours. For most DeFi activity it is irrelevant. For very large moves it matters. Option A confuses wallet display with L1 finality. Option D describes optimistic rollups, not Starknet.',
    },
    {
      question: 'The 2022 Ronin Bridge hack stole $625M by exploiting infrastructure weaknesses, not application bugs. What does this tell you about the relationship between infrastructure and application safety?',
      options: [
        'A. Ronin was a special case that does not apply to Starknet',
        'B. Applications can be perfectly coded and still be compromised through infrastructure weaknesses — security is only as strong as the weakest layer',
        'C. Infrastructure attacks only affect bridges',
        'D. Infrastructure security only matters for protocols above $100M',
      ],
      correct: 1,
      hint: 'If the foundation has a weakness, what does that mean for everything built on top of it?',
      explanation: 'B is correct. Ronin demonstrates that perfect application code is insufficient if infrastructure is weak. For Starknet analysts: evaluating a protocol means evaluating the infrastructure it depends on — sequencer, DA layer, and settlement security. The lesson applies across all protocols regardless of category or size.',
    },
    {
      question: 'Starknet posts all transaction data to Ethereum (expensive but maximally secure). What specific risk does a cheaper off-chain DA alternative introduce?',
      options: [
        'A. No trade-off — Ethereum DA is always strictly better in every dimension',
        'B. Cheaper DA reduces costs but introduces a new failure mode: if the off-chain DA provider goes offline, transaction data is inaccessible and balances cannot be proven from Ethereum alone',
        'C. Off-chain DA is more secure because it uses newer technology',
        'D. The DA choice only affects protocol developers, not end users',
      ],
      correct: 1,
      hint: 'Every architectural choice has a cost and a benefit. What do you give up if you choose something cheaper?',
      explanation: 'B is correct. Posting to Ethereum is expensive but maximally secure — the data lives on the most battle-tested chain in existence. Off-chain DA is cheaper but introduces a new failure mode: if the DA provider disappears, the data proving your balance does not exist on Ethereum. Your funds could become temporarily or permanently inaccessible. This is the security-cost trade-off at the core of every DA decision.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Open the Ecosystem Read simulator and navigate to the Proof tab. Find the most recent STARK proof submitted to Ethereum. Record: (a) the block range it covers, (b) the number of transactions batched into this single proof, (c) using the per-transaction verification cost shown, calculate what each user paid for Ethereum\'s security in this batch.',
      scoringCriteria: [
        'Correctly reads the block range from the proof data',
        'Correctly records the transaction count',
        'Correctly calculates per-transaction cost: total proof verification cost ÷ transaction count, stated in cents or fractions of a cent',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Starknet\'s sequencer goes offline for 6 hours. Walk through three scenarios: (a) A user tries to submit a new swap during the outage. (b) A transaction processed by the sequencer 30 minutes before the outage has not yet been included in a STARK proof. (c) A transaction included in a STARK proof submitted to Ethereum 2 hours before the outage. For each: what is the user\'s experience and are their funds at risk?',
      scoringCriteria: [
        '(a): Transaction cannot be submitted — sequencer unavailable. Funds stay in wallet unsent. No loss, but action blocked.',
        '(b): Transaction was sequenced but not yet proven. It will be included in the next proof once the sequencer restores. Pending status. Funds safe.',
        '(c): The STARK proof was already accepted by Ethereum before the outage. This is L1 settlement — completely irreversible. The outage has zero effect on it.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend keeps her savings in a regular bank account. She asks: "Why would I keep money in Starknet instead of a bank?" Explain in two sentences why Starknet posting data to Ethereum gives her a specific protection a bank cannot offer. Do not use: "blockchain", "decentralised", "on-chain", "smart contract".',
      scoringCriteria: [
        'Correctly identifies the key protection: her balance is in a public, permanent record that no single company controls or can delete — unlike a bank where her balance exists only in the bank\'s private database',
        'Makes the contrast concrete and accurate: if the bank fails, her balance is in the bank\'s system. If Starknet\'s operating company fails, her balance is in a public record accessible to anyone.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L1.3 — Protocol Deep Dives: AVNU, Ekubo, Vesu, Extended
// TYPE A — Dominant concept: protocols in the same category solve
// the same user problem differently. Knowing the difference is
// the core skill of ecosystem analysis.
// ─────────────────────────────────────────────────────────────

export const LAB1_LESSON_3 = {
  id: 'l1-3-protocol-deep-dives',
  title: 'Protocol Deep Dives: AVNU, Ekubo, Vesu, Extended',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
In 2023, a DeFi protocol called dYdX was doing more daily trading volume than most centralised exchanges. It was the largest perpetuals exchange in DeFi. The team made a striking decision: Ethereum was not built for what they needed, so they left and launched their own blockchain.

The lesson for ecosystem analysts: within the broad label "DeFi", radically different products exist. A perpetuals exchange and a spot DEX are both "decentralised trading" — but they serve completely different users, carry completely different risks, and generate completely different revenue. When you see a protocol for the first time, your job is not just to categorise it. It is to understand exactly what it does within its category and how it differs from everything else.

This lesson goes inside four specific Starknet protocols.

AVNU — THE PRICE COMPARISON SITE

Before Google Flights, booking a flight meant calling airlines one by one. British Airways. Then Virgin. Then EasyJet. Different prices, different availability, every call separate. Google Flights changed everything by checking every airline simultaneously and showing you the best option instantly.

AVNU is Google Flights for Starknet token swaps. It is a DEX aggregator — it does not hold liquidity itself. When you want to swap STRK for USDC, AVNU simultaneously queries every DEX on Starknet — Ekubo, JEDI, Haiko, and others — and finds the routing path that gives you the most USDC for your STRK. Sometimes that means one direct route. Sometimes it means splitting: 60% through Ekubo, 40% through JEDI, because the combined route beats either alone.

You interact with AVNU as your interface. AVNU routes your trade through whichever protocol(s) offer the best price and keeps a small margin — typically fractions of a percentage point.

Key metric: daily trading volume routed through AVNU.

EKUBO — THE TRADING FLOOR ITSELF

If AVNU is Google Flights, Ekubo is the airline — the place where actual trading happens.

Ekubo is an AMM — an Automated Market Maker. Instead of matching buyers with sellers directly, Ekubo holds paired token pools. An STRK/USDC pool might contain 1 million STRK and 12 million USDC. When you buy STRK with USDC, you add your USDC to the pool and withdraw STRK. The ratio of tokens in the pool determines the price.

What makes Ekubo different from older AMMs: concentrated liquidity. Earlier AMM designs spread capital across all possible prices — most sitting idle at prices that never happened. Concentrated liquidity lets providers specify the price range where their capital is deployed. You think STRK will trade between $0.60 and $1.20? Deploy your capital only there. You earn fees on every trade in your range. Capital is not wasted.

This is why Ekubo handles approximately 92% of Starknet's spot DEX volume — its capital efficiency means better prices than older AMM designs using the same liquidity.

Key metrics: TVL and daily volume. Volume/TVL ratio shows how hard the liquidity is working.

VESU — THE LENDING POOL

You have ETH worth £5,000 that you expect to increase in value. You do not want to sell it. But you need £2,000 right now.

Vesu solves this. You deposit ETH into Vesu as collateral. Vesu lets you borrow USDC against that collateral — without selling the ETH. Your ETH stays in the Vesu contract, still appreciating. You pay interest on the USDC loan. When you repay, your ETH returns.

Vesu manages this through one critical number: the health factor. It is the ratio of your collateral's current value to your loan, adjusted for the liquidation threshold. If this ratio falls below 1.0 — because collateral lost value or you borrowed too much — Vesu automatically liquidates. It sells enough collateral to repay the loan and closes your position.

Health factor above 1.5: safe. Between 1.0 and 1.2: danger zone — act immediately. Below 1.0: liquidation in progress.

Vesu also works for depositors. Deposit idle USDC and earn supply APY — currently 3–8% depending on market conditions — paid by borrowers on the other side.

Key metrics: TVL, utilisation rate (% of deposits actively borrowed), supply APY, borrow APY.

EXTENDED — THE PERPETUALS EXCHANGE

You believe STRK will fall in price next month. In a spot market, you can only profit from a falling price if you already own STRK (sell it, buy back cheaper). What if you want to bet on a price fall without owning STRK first?

Perpetuals let you do this. A perpetual futures contract lets you take a leveraged position on whether an asset's price will rise or fall, with no expiry date. Unlike a standard futures contract (which expires on a fixed date), a perpetual stays open as long as you want — as long as you keep paying a periodic cost.

That periodic cost is the funding rate — the payment between traders on opposite sides that keeps the contract price aligned with the real spot price. When most traders are betting on a price rise (going long), longs pay shorts a small fee every few hours. When most are short, shorts pay longs. High positive funding rate means the market is very bullish — longs are overcrowded and paying to hold their positions.

Extended is the primary perpetuals protocol on Starknet. It allows leveraged positions — with 5× leverage, a $1,000 deposit controls a $5,000 position. A 10% price move in your favour = 50% return on your deposit. A 10% move against you = 50% loss. Your position is liquidated automatically if losses approach your deposit.

Extended is the highest-risk product in Starknet's DeFi stack. Rapid, total loss of deposited capital through leverage is a real outcome.

Key metrics: open interest (total value of all active leveraged positions), daily volume, funding rate.

FOUR PROTOCOLS — ONE PRINCIPLE

AVNU finds you the best price across all venues.
Ekubo is the venue where most actual trading happens.
Vesu lets you borrow against your holdings without selling them.
Extended lets you bet on price direction with leverage.

Knowing not just the category but the specific problem each protocol solves — that is the difference between recognising a name and actually understanding the ecosystem.
  `.trim(),

  keyTakeaway: `Four Starknet protocols — AVNU (routes trades), Ekubo (holds liquidity), Vesu (lends against collateral), Extended (leveraged perpetuals) — each solve a different user problem, and understanding the difference determines which metrics and risks matter for each.`,

  visualPrompt: `Four side-by-side protocol cards. AVNU (orange): routing diagram, one input splitting into three paths merging into one output. Label: DEX Aggregator. EKUBO (blue): liquidity pool with concentrated range highlighted. Label: Concentrated AMM, "92% of Starknet DEX volume". VESU (green): balance scale with ETH/USDC, health factor "1.4" shown. Label: Lending Protocol. EXTENDED (red): chart with 5× leverage indicator. Label: Perpetuals Exchange. Key metric label below each card. No text inside icons.`,
  visualType: 'static',
  visualUrl: 'starknet-four-protocol-comparison',

  examples: [
    {
      contextTag: '[User matching goal to protocol]',
      context: 'Four people each arrive with 1,000 USDC and different goals.',
      scenario: 'Person A: convert to STRK at best rate → AVNU. Person B: earn interest on idle USDC → Vesu supply position. Person C: bet STRK price rises with leverage → Extended 3× long. Person D: provide liquidity to earn swap fees → Ekubo STRK/USDC pool.',
      outcome: 'All four used different protocols for the same starting capital because they had different goals. The framework — not the protocol name — guided each decision correctly.',
    },
    {
      contextTag: '[Perpetuals scale comparison showing opportunity]',
      context: 'Extended (Starknet perpetuals) has $8M open interest. Hyperliquid (competing perpetuals exchange) has $3B open interest. Ratio: 1:375.',
      scenario: 'An analyst asks whether this gap signals failure or opportunity. Perpetuals demand clearly exists at scale — Hyperliquid proves it. Starknet\'s fast finality and low fees are theoretically well-suited to high-frequency trading.',
      outcome: 'The gap does not signal failure or opportunity on its own. It signals Starknet\'s perpetuals market is at early stage. Whether the gap is closeable depends on additional data: user growth trend on Extended, whether Starknet\'s current user base has trading culture and capital that perpetuals require.',
    },
    {
      contextTag: '[Concentrated liquidity explained for a traditional finance reader]',
      context: 'A traditional finance analyst familiar with investment bank market-making asks why Ekubo\'s "concentrated liquidity" is considered more efficient.',
      scenario: 'She understands market-making: a bank quotes prices only in the realistic range of an asset, not at $0.01 or $1 million. Concentrated liquidity is the same principle applied to a decentralised exchange.',
      outcome: 'Liquidity providers select the range where they expect trading to occur. Capital is not wasted at prices that never happen. The analyst immediately recognises this as standard market-making logic. The innovation is implementing it in code without a central market-maker — not the concept itself.',
    },
  ],

  guidedPractice: [
    {
      question: 'A user wants to swap 500 USDC for STRK and get the best possible rate across all Starknet DEXs. Which protocol does she use?',
      options: [
        'A. Ekubo — it has the most liquidity',
        'B. AVNU — it aggregates all DEXs simultaneously and routes to the best price',
        'C. Vesu — it handles all asset exchanges on Starknet',
        'D. Extended — it offers the fastest execution',
      ],
      correct: 1,
      hint: 'Which protocol queries multiple DEXs simultaneously to find the best rate — rather than offering its own liquidity?',
      explanation: 'B is correct. AVNU is the aggregator — its entire purpose is to route trades through whichever DEX combination gives the best output. Going directly to Ekubo would give only Ekubo\'s rate, missing potentially better rates on JEDI or a split route. Vesu is a lending protocol. Extended is for leveraged perpetuals, not spot swaps.',
    },
    {
      question: 'A user deposits 2 ETH (worth $6,000) into Vesu as collateral. She borrows $3,000 USDC. The liquidation threshold is 75%. What is her health factor?',
      options: [
        'A. 0.75 — she is being liquidated',
        'B. 1.5 — safe, collateral is 1.5× her borrowing limit',
        'C. 2.0 — extremely safe, borrowed only half of maximum',
        'D. Cannot be calculated without the current USDC interest rate',
      ],
      correct: 1,
      hint: 'Health factor = (collateral value × liquidation threshold) ÷ debt. ($6,000 × 0.75) ÷ $3,000 = ?',
      explanation: 'B is correct. ($6,000 × 0.75) ÷ $3,000 = $4,500 ÷ $3,000 = 1.5. She has $4,500 borrowing capacity and $3,000 debt — 50% above the danger threshold. If ETH fell 33% to $4,000: ($4,000 × 0.75) ÷ $3,000 = 1.0 — liquidation threshold exactly. Health factor does not depend on USDC interest rate.',
    },
    {
      question: 'The Extended funding rate for a long STRK position is +0.08% every 8 hours. You hold a $10,000 long. What do you pay in 24 hours, and what does positive funding tell you about market sentiment?',
      options: [
        'A. $8/day. Positive funding means more shorts than longs.',
        'B. $24/day. Positive funding means more longs than shorts — longs pay shorts to keep the contract price aligned with spot.',
        'C. $0 — funding only applies to shorts.',
        'D. $8/day. Positive funding means the exchange charges extra for high volatility.',
      ],
      correct: 1,
      hint: '0.08% per 8 hours = 3 payments per day. 3 × (0.08% × $10,000) = ? When longs are dominant, who pays whom?',
      explanation: 'B is correct. 0.08% × $10,000 = $8 per period × 3 periods = $24/day. Positive funding means longs dominate — more traders bet price rises than falls. To keep the perpetuals price aligned with spot, the overcrowded side (longs) pays the other side (shorts). This discourages excess bullishness.',
    },
    {
      question: 'Ekubo: $200M TVL, $35M daily volume. Uniswap v3: $4B TVL, $800M daily volume. Calculate volume/TVL ratio for each. What does a similar ratio between a large and small DEX tell you?',
      options: [
        'A. Ekubo 0.175, Uniswap 0.2. Uniswap is more efficient.',
        'B. Ekubo 17.5%, Uniswap 20%. Ratios are similar — both use concentrated liquidity and achieve comparable capital efficiency.',
        'C. Cannot compare — different chains.',
        'D. Ekubo 5.7, Uniswap 0.2. Ekubo is far more efficient.',
      ],
      correct: 1,
      hint: 'Volume/TVL = daily volume ÷ TVL. Ekubo: $35M ÷ $200M = ? Uniswap: $800M ÷ $4,000M = ?',
      explanation: 'B is correct. Ekubo: 17.5%. Uniswap v3: 20%. Remarkably similar — both use concentrated liquidity, which is why both achieve high capital efficiency despite radically different sizes. Volume/TVL measures how hard each dollar of liquidity works per day. Similar ratios mean similar quality, regardless of absolute size.',
    },
    {
      question: 'A trader opens a $20,000 position on Extended with 10× leverage, shorting STRK (betting price falls). STRK rises 8%. How much has the trader lost?',
      options: [
        'A. $1,600 — 8% of $20,000. Position continues.',
        'B. $16,000 — 8% of the $200,000 effective position. The $20,000 deposit is nearly wiped out and the position is likely liquidated.',
        'C. $800 — 8% of $20,000 ÷ 10.',
        'D. Nothing — a short gains when price rises.',
      ],
      correct: 1,
      hint: '10× leverage: $20,000 deposit controls $200,000. An 8% move against a $200,000 position = how much loss relative to the $20,000 deposit?',
      explanation: 'B is correct. $200,000 × 8% = $16,000 loss. The $20,000 deposit is 80% wiped out. Extended would likely trigger liquidation before 10% to protect against further losses. Option A ignores leverage multiplier. Option D confuses direction — a short profits on price falls, not rises.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Open the Ecosystem Read simulator, navigate to the TVL tab. Find the current TVL for Ekubo and its daily trading volume. Calculate the volume/TVL ratio. Compare to Uniswap v3\'s typical ratio of 18–22%. State whether Ekubo\'s capital efficiency is above, below, or comparable — and what this tells you about Ekubo\'s liquidity quality.',
      scoringCriteria: [
        'Correctly reads Ekubo TVL and daily volume from the simulator and calculates volume/TVL ratio',
        'Correctly compares to the Uniswap v3 benchmark and states whether Ekubo is above, below, or comparable',
        'States a specific conclusion: high ratio = efficient capital use comparable to Uniswap v3; low ratio = capital sitting idle, weaker liquidity quality',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Extended (Starknet perpetuals) has $8M open interest. Hyperliquid has $3B open interest — a ratio of 1:375. Determine: does this gap tell you Extended is failing, or that it represents an early-stage opportunity? State which interpretation is supported by this data alone and which requires additional assumptions. Identify two specific data points that would make a more confident judgement possible.',
      scoringCriteria: [
        'Correctly identifies that the raw gap supports neither conclusion on its own — it shows size difference but not causation (structural vs early-stage)',
        'Correctly identifies that opportunity interpretation (B) requires additional data: Starknet user base size, perpetuals trading behaviour of current Starknet users',
        'Correctly identifies that failure interpretation (A) requires additional data: Extended user growth trend over 6 months, whether Starknet\'s infrastructure limits perpetuals trading specifically',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user has $15,000 on Starknet: $8,000 supplying USDC to Vesu at 5.4% APY, $5,000 in an Ekubo STRK/USDC liquidity pool, $2,000 on Extended as collateral for a 3× long STRK position. STRK falls 25% overnight. Walk through what happens to each position: (a) the Vesu USDC deposit, (b) the Ekubo liquidity pool, (c) the Extended long with 3× leverage.',
      scoringCriteria: [
        '(a) Vesu USDC supply: USDC is dollar-denominated and unaffected by STRK price. The $8,000 position is unchanged. Supply APY continues.',
        '(b) Ekubo STRK/USDC LP: contains STRK, so 25% STRK price fall reduces dollar value of the STRK portion. Impermanent loss also occurs — the AMM rebalances by giving the depositor more STRK (the falling asset) and less USDC.',
        '(c) Extended 3× long: 25% STRK fall causes 75% loss on the $2,000 position (25% × 3 = 75%). Position reduced to ~$500 and likely triggers automatic liquidation depending on Extended\'s threshold.',
      ],
    },
  ],
};
