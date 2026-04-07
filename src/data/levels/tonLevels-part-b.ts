// ⚡ Sifter SkillUp — TON & Telegram (Island 12, Levels 166–180)
// Part B of 2 — Levels 174–180

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { TON_LEVELS_A } from './tonLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 174 — Bridging to and from TON
// ─────────────────────────────────────────────────────────────────────────────

const L174: IslandLevel = {
  id: 174, mechanic: 'match3', tier: 'pro',
  topic: 'Bridging to and from TON',

  explanation: `
Bridging to and from TON requires more care than bridging between EVM chains. TON uses a fundamentally different virtual machine and account model from Ethereum — meaning there are fewer battle-tested bridge protocols, and the ones that exist have shorter track records. The risk profile of TON bridging is meaningfully higher than, say, bridging from Ethereum to Arbitrum.

The cleanest on-ramp to TON has nothing to do with bridges: use a centralised exchange. Buy USDT on Binance, OKX, or Bybit, then send it to your TON Space wallet (USDT-TON is supported on all three). The exchange does the conversion — you bypass bridge smart contract risk entirely. This is the recommended path for most users and amounts.

For on-chain bridging, the main options are: TonBridge (ton.org/bridge), developed by the TON Foundation — the most official option for TON ↔ Ethereum. It uses lock-and-mint mechanics. Bridge fees: variable (depends on Ethereum gas). Reliability: functional but slower than EVM bridges; expect 30–60 minute settlement times during high Ethereum gas periods.

OKX Web3 Wallet bridge supports TON as a destination. Cross-chain via Orbit Bridge is another option. These third-party bridges have shorter operational history on TON than major EVM bridges have on their respective chains — treat them with corresponding caution.

Practical sizing rule: for amounts under $2,000, CEX on-ramp (Binance/OKX → send to TON Space) is simplest and safest. For amounts over $10,000, evaluate whether on-chain bridging is necessary or whether CEX routing is sufficient for your use case. Bridge risk scales non-linearly with amount.
  `.trim(),

  fact: 'TON bridging options: CEX on-ramp (safest, send USDT from Binance/OKX to TON Space), TonBridge (official, TON ↔ ETH, 30–60 min), and third-party bridges (shorter track records). CEX routing is recommended for most users.',
  plain: 'Getting money to TON: easiest is buy USDT on Binance or OKX and send directly to your TON Space wallet. The official TonBridge works but is slower than EVM bridges and TON\'s bridge ecosystem is less mature.',
  stars: [920, 1132, 1415], target: 1415, coins: 72,
  simulatorLesson: 'tonStaking',

  examples: [
    {
      contextTag: '[CEX on-ramp recommendation]',
      scenario: 'Keiko wants to put $3,000 in USDT into STON.fi on TON. She has the USDT on Ethereum.',
      outcome: 'Option A — On-chain bridge: bridge USDT from Ethereum to TON via TonBridge. Ethereum gas: ~$10. Bridge fee: ~$5. Settlement time: 45 minutes. Smart contract risk: moderate. Option B — CEX routing: send USDT to OKX → withdraw to TON network → arrives in TON Space wallet. OKX withdrawal fee: $1. Settlement time: 5 minutes. Smart contract risk: none (exchange handles conversion). For $3,000: CEX routing wins on cost, speed, and safety. She uses OKX.',
    },
    {
      contextTag: '[TonBridge for on-chain need]',
      scenario: 'Marcus runs a DeFi protocol on TON that needs programmatic access to USDT flows from Ethereum. He cannot use a CEX (requires on-chain transaction for automation).',
      outcome: 'He must use TonBridge or a programmatic bridge. He evaluates TonBridge: official, audited by the TON Foundation, 18+ months operational history, handles TON ↔ Ethereum USDT. He implements with 60-minute settlement time buffer in his protocol\'s logic, adds retry logic for bridge delays, and tests on testnet first. For programmatic use cases requiring on-chain bridge access, TonBridge is the most defensible choice — though still with less track record than major EVM bridges like Across or Stargate.',
    },
    {
      contextTag: '[Withdrawal from TON]',
      scenario: 'Amara has $8,000 USDT in TON Space after successful STON.fi trading. She wants it back on Ethereum.',
      outcome: 'Option A — TonBridge: TON → Ethereum USDT. Gas on TON side: ~$0.05. Ethereum settlement gas: ~$8–$15. Time: 45–90 minutes. Risk: bridge smart contract. Option B — CEX: send USDT from TON Space to OKX (TON network withdrawal) → withdraw USDT on Ethereum from OKX. OKX withdrawal fee: $1. Time: 10 minutes. Risk: exchange operational. For $8,000, the CEX route saves $7–$14 in gas and is faster. She sends TON USDT to OKX and withdraws on Ethereum.',
    },
  ],

  keyTakeaway: 'TON bridging is less mature than EVM bridging — fewer battle-tested options, shorter track records. CEX routing (Binance/OKX → send to TON Space) is safest for most users. Use TonBridge (official, 30–60 min) only when on-chain bridging is specifically required.',

  guidedPractice: [
    {
      question: 'Why is CEX routing (send from Binance to TON Space) recommended over TonBridge for most users?',
      options: [
        'CEX routing is free while TonBridge charges high fees',
        'CEX routing eliminates bridge smart contract risk — the exchange handles the chain conversion internally, and the user only faces exchange operational risk rather than bridge protocol risk',
        'TonBridge does not support USDT — only TON native token',
        'CEX routing is faster by 10× regardless of amount',
      ],
      correct: 1,
      hint: 'What risks exist in a bridge smart contract that do not exist in a CEX withdrawal?',
      explanation: 'TonBridge smart contract risks: code vulnerabilities that could be exploited, oracle manipulation affecting exchange rates, bridge operator key compromise. CEX risk: Binance or OKX operational failure or insolvency. For amounts under $10,000, many users find exchange operational risk more acceptable than bridge smart contract risk — especially for TON bridges with shorter operational histories than EVM bridges. Additionally: CEX routing is typically faster ($1 withdrawal fee, 5 minutes) vs TonBridge ($15 in gas, 45+ minutes).',
    },
    {
      question: 'TonBridge settles in 30–60 minutes. Why is this slower than EVM fast bridges like Across Protocol?',
      options: [
        'TonBridge is operated by volunteers with slower response times',
        'TON\'s different virtual machine requires more verification steps between TON and Ethereum than EVM-to-EVM bridges need. Additionally, TonBridge uses canonical bridge mechanics without fast liquidity pools',
        'TonBridge has a mandatory fraud proof window identical to Arbitrum\'s 7-day wait',
        'Ethereum gas prices cause delays for TonBridge settlements',
      ],
      correct: 1,
      hint: 'What enables fast bridges like Across to settle in minutes? Does TonBridge have this mechanism?',
      explanation: 'Fast EVM bridges (Across, Stargate) have liquidity pools on both chains — they provide instant settlement from existing liquidity and settle the canonical bridge transaction in the background. TonBridge uses a lock-and-mint mechanism without fast liquidity infrastructure: the TON side locks your assets, the Ethereum side mints equivalents after verifying the TON transaction. The cross-chain verification between different VM architectures (TON vs EVM) adds complexity. No fast liquidity layer = 30–60 minute wait for proper settlement.',
    },
    {
      question: 'You have $25,000 USDT on Ethereum and want to deploy it on STON.fi on TON. What approach minimises risk?',
      options: [
        'Use TonBridge in one $25,000 transaction for simplicity',
        'Use CEX routing (Ethereum USDT → Binance → send to TON Space USDT address) to avoid bridge smart contract risk at this amount. Test with $200 first, then proceed with the remainder',
        'Use multiple small TonBridge transactions to reduce single-bridge exposure',
        'Wait for TonBridge to reach a $25,000 transaction limit before proceeding',
      ],
      correct: 1,
      hint: 'At $25,000, what is the cost of a bridge failure vs the cost of a CEX withdrawal fee?',
      explanation: 'At $25,000, bridge smart contract risk becomes material. A single TonBridge exploit event could lose $25,000. CEX routing: Binance/OKX withdrawal fee for $25,000 USDT to TON ≈ $1–$5. Exchange counterparty risk at this amount is real but significantly lower probability than bridge exploit for most major exchanges. Additionally: always test the full routing path with a small amount ($200–$500) before committing large amounts to any new chain or bridge. This $5 test transaction can reveal routing issues that would otherwise affect $25,000.',
    },
    {
      question: 'Why do TON bridges have shorter track records than major EVM bridges like Across or Stargate?',
      options: [
        'TON bridges are newer technology that simply has not existed as long',
        'TON\'s fundamentally different VM and account model makes bridge development more complex. Bridges for non-EVM chains are harder to build, audit, and have less historical volume — meaning less battle-testing against real adversarial conditions',
        'TON bridges are operated by smaller teams with fewer developers',
        'Regulatory restrictions prevented TON bridges from launching before 2023',
      ],
      correct: 1,
      hint: 'Why are EVM-to-EVM bridges more mature than EVM-to-non-EVM bridges?',
      explanation: 'EVM chains (Ethereum, Arbitrum, Base, Polygon) share the same virtual machine, address format, and smart contract model. Bridges between EVM chains can reuse audited code patterns, attract the large Solidity developer community, and benefit from years of collective EVM bridging experience. TON uses different smart contract languages (FunC, Tact), a different account model, different transaction semantics, and different cryptography. Bridge developers must handle these differences correctly from scratch. Less standardisation = harder to audit = shorter battle-testing history = higher caution warranted.',
    },
    {
      question: 'What is the recommended transaction test before committing a large amount to a new bridging route?',
      options: [
        'Send the full amount — testing wastes time and duplicate fees',
        'Send $200–$500 first, confirm arrival in the destination wallet, then proceed with the full amount — the test cost is trivial insurance against routing errors or bridge failures',
        'Send $0.01 — any successful transaction proves the route works',
        'Consult the bridge\'s Discord for confirmation before sending',
      ],
      correct: 1,
      hint: 'What is the cost of a $200 test vs the cost of losing $25,000 to a routing error?',
      explanation: '$200 test transaction: worst case, $200 lost to a routing error or bridge failure. Information gained: confirmation that the entire route works (CEX withdrawal → TON network → TON Space arrival) before committing large amounts. This "fat finger" protection has saved countless users from catastrophic routing errors — sending to the wrong network, using the wrong token standard, or discovering that a bridge is broken. $200 is cheap insurance. Also: confirm the arrival address matches exactly before the large transaction. Address poisoning attacks target exactly these "I\'ve sent to this address before" scenarios.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 175 — Evaluating TON Projects for Legitimacy
// ─────────────────────────────────────────────────────────────────────────────

const L175: IslandLevel = {
  id: 175, mechanic: 'memory', tier: 'pro',
  topic: 'Evaluating TON Projects for Legitimacy',

  explanation: `
TON's rapid growth attracted both genuine builders and opportunistic scammers. In 2024, the number of rug pulls and fraud projects on TON increased proportionally with its user base. The Telegram-native environment created specific attack vectors: scammers could reach users through Telegram groups, bots, and Mini Apps that appeared official.

The TON legitimacy checklist combines universal red flags (from Island 9) with TON-specific verification steps.

Universal checks: team identifiability (are there real names and verifiable histories?), smart contract verification (is the code visible and audited?), LP lock status (is liquidity locked on-chain?), mint authority status (can the team print unlimited tokens?).

TON-specific checks: verify the jetton contract address on Tonviewer (tonviewer.com) — look for "verified" source code status. Check if the project's Telegram group is the genuine official channel (scammers often create nearly identical group names). Verify there are actual on-chain transactions (not just fake volume from related wallets). Check that the LP is locked via a verifiable lock contract visible on Tonviewer.

TON-specific red flags: projects that only communicate through Telegram (no website, no GitHub, no documentation), teams that are entirely anonymous with no prior TON development history, tokens with names designed to mimic established TON projects (TONCOIN2, Not-TON, etc.), and Mini Apps that request unusual permissions beyond wallet connection.

The honest reality: TON's ecosystem is earlier-stage than Ethereum's. Fewer projects have undergone independent audits. Fewer tools exist for rapid legitimacy verification. The appropriate risk adjustment: treat TON projects with less audit history as one risk tier higher than comparable Ethereum projects.
  `.trim(),

  fact: 'TON legitimacy checks: Tonviewer for verified contract source code and LP lock, mint authority status, team identifiability, on-chain transaction authenticity. TON-specific red flag: Telegram-only communication with no GitHub or documentation.',
  plain: 'Use Tonviewer to check TON token contracts — verified source code, LP lock, mint authority. TON projects with no website and only Telegram communication are high risk. The ecosystem is newer, so treat everything with extra caution.',
  stars: [980, 1206, 1507], target: 1507, coins: 76,
  simulatorLesson: 'rugcheck',

  examples: [
    {
      contextTag: '[Legitimacy check workflow]',
      scenario: 'Marcus finds a new TON jetton called TONFARM promising 200% APY. He runs the legitimacy checklist.',
      outcome: 'Tonviewer check: contract source code is NOT verified (red flag). Mint authority: active (red flag — unlimited token printing possible). LP: no lock visible on Tonviewer (red flag). Team: anonymous Telegram group, no GitHub, no website (red flag). On-chain activity: 5 transactions total, all from the same 2 wallets (red flag — fake volume). Score: 5/5 red flags. Decision: avoid entirely. The 200% APY exists only to attract attention — the project has all the markers of a planned rug pull.',
    },
    {
      contextTag: '[Genuine project vs impersonation]',
      scenario: 'Amara finds two Telegram channels: "@TONFinance_official" and "@TON_Finance". Both claim to be the official TON Finance DeFi protocol. She needs to verify which is real.',
      outcome: 'She goes to the TON Finance website (found via official Telegram announcement), which links to the verified official channel. She checks the jetton contract address on Tonviewer — the verified contract\'s associated links point to one of the channels, not the other. The impersonation channel (@TONFinance_official with underscore) lacks the verifiable on-chain contract connection. On-chain verification breaks the impersonation: scammers can copy a name but cannot duplicate a contract address.',
    },
    {
      contextTag: '[Early-stage legitimate project]',
      scenario: 'Keiko evaluates a new TON protocol that has no independent audit yet (too new). But the team is doxxed with prior products and the contract code is verified on Tonviewer.',
      outcome: 'No audit + verified code + doxxed team = cautiously legitimate. She treats it as a higher-risk tier than an audited Ethereum protocol — positions at 0.5% of portfolio max rather than 1.5%. She does not avoid it entirely: verified source code means the community can check for obvious vulnerabilities, doxxed team has accountability, no audit is normal for protocols under 3 months old. Her position sizing reflects the higher uncertainty, not automatic rejection.',
    },
  ],

  keyTakeaway: 'TON legitimacy verification: Tonviewer for verified contract code and LP lock, check mint authority, verify team identifiability, confirm on-chain activity is authentic. TON-only Telegram communication with no documentation is a specific red flag for the ecosystem.',

  guidedPractice: [
    {
      question: 'What is Tonviewer and what can you verify there?',
      options: [
        'Tonviewer is TON\'s official DEX — use it for swaps and liquidity provision',
        'Tonviewer is TON\'s block explorer — use it to verify jetton contract source code verification status, LP lock details, mint authority, and transaction history',
        'Tonviewer is an analytics platform that rates TON projects by quality',
        'Tonviewer is a Telegram bot that automatically checks TON project legitimacy',
      ],
      correct: 1,
      hint: 'What is the TON equivalent of Etherscan or Solscan?',
      explanation: 'Tonviewer (tonviewer.com) is TON\'s primary block explorer — equivalent to Etherscan for Ethereum or Solscan for Solana. On Tonviewer: paste a jetton contract address to see → whether source code is verified (visible and potentially audited), mint authority status (minting disabled = good), LP token lock details (is LP locked, for how long), all transaction history (can spot fake volume from related wallets), and contract interaction count. These are the equivalent of the safety checks from Island 9 applied to the TON chain.',
    },
    {
      question: 'A TON jetton has an active mint authority. What specific risk does this create for LPs?',
      options: [
        'The team can change the trading fee without notice',
        'The team can mint unlimited additional tokens and sell them into the liquidity pool — infinitely diluting existing holders and potentially draining LP value',
        'Active mint authority prevents the token from being listed on STON.fi',
        'Mint authority only affects governance votes, not token supply',
      ],
      correct: 1,
      hint: 'If the team can print unlimited tokens and sell into the LP, what happens to the pool\'s token price?',
      explanation: 'Active mint authority on a TON jetton means the team retains the ability to create new tokens at will. Mechanism of abuse: team mints 1 billion new tokens → sells them into the STON.fi LP pool → price collapses → LPs withdraw worthless tokens instead of their original deposit. This is the TON equivalent of the Solana mint authority risk. Disabled mint authority is verifiable on Tonviewer: look for "mint disabled" or the absence of a minter address in the jetton master contract.',
    },
    {
      question: 'You find two Telegram channels both claiming to be "Official TON Finance." How do you determine which is legitimate?',
      options: [
        'The channel with more subscribers is always the legitimate one',
        'Verify on-chain: the legitimate project has a verifiable jetton contract on Tonviewer that links to their official channel. Scammers can copy names but cannot duplicate a contract address already on-chain',
        'Contact Telegram support and ask them to verify which channel is official',
        'The channel with fewer recent messages is more likely to be the real one',
      ],
      correct: 1,
      hint: 'What can be verified on-chain that cannot be faked by a scammer creating a similarly-named channel?',
      explanation: 'Any Telegram channel name can be slightly modified by scammers (TON_Finance vs TONFinance). But the official project\'s jetton contract is already deployed on TON with a specific contract address. That contract\'s metadata and the project\'s official documentation will reference the real channel. On Tonviewer: look up the jetton by its verified contract address, check the project links in the contract metadata. The contract address is unique — scammers cannot create a contract with the same address. On-chain verification breaks impersonation.',
    },
    {
      question: 'Why should TON projects be treated with extra caution compared to equivalent-stage Ethereum projects?',
      options: [
        'TON is technically inferior to Ethereum and therefore less secure',
        'TON\'s ecosystem is younger with fewer independent auditors, less standardised tooling, and shorter protocol operation histories — meaning less battle-testing against adversarial conditions than comparable Ethereum DeFi',
        'TON has regulatory problems that Ethereum does not face',
        'Telegram\'s involvement makes all TON projects inherently riskier',
      ],
      correct: 1,
      hint: 'What makes Ethereum DeFi protocols safer than equivalent-stage alternatives on newer chains?',
      explanation: 'Ethereum DeFi protocols benefit from: years of adversarial testing, established audit firms with EVM expertise, standardised OpenZeppelin contract libraries that have been battle-tested, large communities of security researchers who know EVM attack surfaces. TON\'s ecosystem has: fewer audit firms with FunC/Tact expertise, less standardised contract libraries, shorter operation histories for most protocols. This does not make TON fundamentally unsafe — it means equivalent-stage TON protocols have had less adversarial testing. Appropriate adjustment: smaller position sizes, higher scrutiny of contract verification and team credibility.',
    },
    {
      question: 'A TON project has: verified source code on Tonviewer, LP locked 6 months, mint authority disabled, doxxed team, no independent audit yet. How should you classify it?',
      options: [
        'Avoid entirely — no audit means it is unsafe',
        'Cautiously legitimate — strong fundamentals (verified code, locked LP, disabled mint, accountable team) but elevated risk from lack of independent audit. Appropriate for a small position (0.5–1% portfolio) with careful monitoring',
        'Fully trusted — the four positive signals are sufficient without an audit',
        'Treat as a pure rug pull risk — only audited projects are acceptable',
      ],
      correct: 1,
      hint: 'What does each positive signal reduce? What risk does missing the audit leave?',
      explanation: 'Verified source code: allows community to check for obvious vulnerabilities (partially replaces audit). Locked LP: eliminates hard rug risk. Disabled mint: eliminates infinite dilution risk. Doxxed team: creates accountability for fraud. Missing audit: undetected code vulnerabilities from less thorough review. Net assessment: major rug pull vectors are closed; audit gap leaves code vulnerability risk open. This is a different risk profile from a pure rug pull with no verification — deserving a small position rather than zero or full allocation. Position size reflects the specific risk remaining.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 176 — TON vs Other Chains for Mass Consumer Adoption
// ─────────────────────────────────────────────────────────────────────────────

const L176: IslandLevel = {
  id: 176, mechanic: 'chain', tier: 'pro',
  topic: 'TON vs Other Chains — Mass Consumer Adoption Thesis',

  explanation: `
TON's bull case rests on a single premise: no other blockchain has a native distribution channel to 900 million users. The bear case rests on an equally clear counter: having 900 million Telegram users does not mean having 900 million crypto users. The honest evaluation requires separating the distribution advantage from the adoption reality.

The distribution advantage is structurally real. Telegram is installed on 900M devices. TON Space is one tap away from any Telegram user. No other blockchain has this. Base (Coinbase's 100M users) and Solana (pump.fun's social virality) are the closest alternatives — both are an order of magnitude smaller in potential reach.

The conversion challenge is also structurally real. Most Telegram users are on the platform for messaging and channels — not for financial applications. Converting a messaging app user to a crypto user requires changing behaviour, not just reducing friction. Notcoin and Hamster Kombat attracted 300M players — but most never progressed beyond the game to genuine DeFi or financial use of TON.

The honest comparison to other chains:

Against Solana: Solana has better DeFi infrastructure, more sophisticated users, and a stronger developer ecosystem. TON has a larger potential audience. For DeFi power users: Solana. For mass consumer apps: TON has structural advantages.

Against Base: Both target mainstream consumers. Base has Coinbase's 100M regulated users with bank-linked accounts (higher value per user). TON has 900M Telegram users with less financial sophistication on average. For regulated financial products: Base. For emerging market reach (Southeast Asia, Eastern Europe, Latin America where Telegram dominates): TON.

Against Ethereum: Different goals entirely. Ethereum optimises for security and financial infrastructure. TON optimises for consumer reach. Comparing them is like comparing a bank to a payment app.
  `.trim(),

  fact: 'TON\'s unique advantage: 900M Telegram users with one-tap wallet access. No other chain has this reach. Counter: messaging users ≠ crypto users. For DeFi sophistication: Solana leads. For regulated consumers: Base leads. For emerging market mass reach: TON leads.',
  plain: 'TON\'s strength is distribution — 900M Telegram users who could access crypto with one tap. The reality: most won\'t, at least not quickly. TON wins on reach; Solana wins on DeFi depth; Base wins on regulated consumer apps.',
  stars: [1040, 1280, 1600], target: 1600, coins: 80,
  simulatorLesson: 'solanaCompare',

  examples: [
    {
      contextTag: '[Market comparison framework]',
      scenario: 'A founder is building a peer-to-peer payment app for Southeast Asia. They evaluate Solana, Base, and TON.',
      outcome: 'Southeast Asia context: Telegram penetration is very high (Philippines, Indonesia, Vietnam). Users are mobile-first, price-sensitive, not necessarily crypto-native. Solana: best DeFi but requires MetaMask setup — too many steps for the target user. Base: Coinbase on-ramp is US-centric and requires verified accounts. TON: one-tap TON Space, familiar Telegram interface, direct access to the target demographic already using Telegram for communication. TON wins for this specific geographic and demographic use case.',
    },
    {
      contextTag: '[DeFi ecosystem comparison]',
      scenario: 'Marcus is a serious DeFi trader evaluating whether to move his $200,000 DeFi portfolio to TON.',
      outcome: 'He evaluates: protocol maturity (Ethereum/Arbitrum: 3+ years; TON: 1-2 years), liquidity depth (Ethereum: $60B+ TVL; TON: $300M TVL), available protocols (Ethereum: Aave, Compound, Uniswap, GMX; TON: STON.fi, DeDust, early lending), developer ecosystem (Ethereum: 20,000+ developers; TON: smaller but growing). For a sophisticated DeFi user with $200K: Ethereum or Arbitrum is still substantially deeper and safer. TON is appropriate as a speculative allocation (5–10% of portfolio) to capture the distribution narrative, not as a primary DeFi deployment.',
    },
    {
      contextTag: '[Honest bull/bear assessment]',
      scenario: 'Keiko asks for a balanced assessment of the TON investment thesis.',
      outcome: 'Bull: If TON converts even 2% of Telegram\'s 900M users to active DeFi participants (18M users), it would be the largest crypto user base after Ethereum. At current per-user value metrics, this would drive significant TON price appreciation. Bear: Notcoin had 35M players; most played for speculation, not genuine DeFi adoption. Hamster Kombat had 300M; most never set up TON Space. Converting messaging app users to financial app users at scale has never been successfully achieved by any platform. The distribution advantage exists; whether it translates to adoption is the unresolved question.',
    },
  ],

  keyTakeaway: 'TON\'s structural advantage (900M Telegram users, one-tap wallet) is real and unmatched. The adoption question — whether messaging users convert to crypto users at scale — is the core unresolved risk. TON leads for emerging market consumer reach; Solana for DeFi; Base for regulated consumers.',

  guidedPractice: [
    {
      question: 'What is TON\'s single most significant structural advantage over all other blockchains?',
      options: [
        'TON processes more TPS than Solana',
        'Telegram\'s 900M pre-installed user base with one-tap TON Space access — no other blockchain has a distribution channel of this scale to non-crypto-native users',
        'TON has lower transaction fees than any other public blockchain',
        'TON\'s regulatory clarity from its Telegram association',
      ],
      correct: 1,
      hint: 'What is the biggest barrier to crypto adoption? What does TON uniquely reduce?',
      explanation: 'The primary barrier to crypto adoption is onboarding friction: download wallet, understand seed phrases, buy the native gas token, configure networks. TON reduces this for 900M existing Telegram users to: tap Wallet in menu, write down seed phrase. This is an onboarding advantage that no competitor has — Base has 100M Coinbase users (smaller), Solana has no equivalent pre-installed user base. Whether this distribution advantage translates to adoption depends on whether messaging users are willing to use financial apps.',
    },
    {
      question: 'Why did Notcoin\'s 35M players and Hamster Kombat\'s 300M players not directly translate to 300M+ DeFi users?',
      options: [
        'Telegram blocked the games from integrating with TON Space',
        'Users played for speculative airdrop value rather than genuine financial utility — most never set up TON Space or explored DeFi. Gaming engagement metrics and DeFi adoption metrics are different things',
        'Most players were bots and not real Telegram users',
        'The games were only available in countries without crypto regulations',
      ],
      correct: 1,
      hint: 'Why did someone play Hamster Kombat? What would they need to do to become a DeFi user?',
      explanation: 'Play-to-airdrop motivation: tap for free tokens (zero commitment). DeFi adoption requirement: understand self-custody wallets, manage seed phrases, understand gas fees, evaluate protocol risks, make financial decisions. The psychological and educational gap between "tapping a game for free tokens" and "managing a DeFi portfolio" is enormous. Most players received airdrop tokens, sold immediately (often through centralised exchanges), and never interacted with TON DeFi protocols. The games proved Telegram distribution works; they did not prove that distribution converts to financial engagement.',
    },
    {
      question: 'For which specific use case does TON have the clearest advantage over both Solana and Base?',
      options: [
        'High-frequency DeFi trading requiring 100,000+ TPS',
        'Consumer applications in emerging markets (Southeast Asia, Eastern Europe, Latin America) where Telegram already dominates as the primary messaging platform and banking infrastructure is limited',
        'Institutional DeFi requiring regulatory compliance and SEC oversight',
        'Smart contract development requiring the most advanced tooling and largest developer ecosystem',
      ],
      correct: 1,
      hint: 'Where does Telegram already dominate? Who uses it most intensively outside the West?',
      explanation: 'Telegram\'s user density is highest in markets with strong privacy culture (Russia, Ukraine, Eastern Europe), mobile-first emerging economies (Indonesia, Philippines, Vietnam), and communities that migrated from WhatsApp for various reasons (Latin America, Middle East). These markets share: high Telegram penetration, less access to traditional banking infrastructure, and strong demand for digital financial tools. TON\'s one-tap wallet is particularly relevant here: a Philippines worker without a bank account but with Telegram has direct access to USDT storage and transfer. This use case — financial inclusion in Telegram-dominant emerging markets — is TON\'s strongest real-world argument.',
    },
    {
      question: 'What percentage of Telegram\'s 900M users would need to become active TON DeFi users for TON to match Ethereum\'s ~20M DeFi users?',
      options: [
        '50% — half of Telegram users must adopt crypto',
        '2.2% — approximately 20M users out of 900M', 
        '10% — 90M users',
        '0.1% — 900,000 users',
      ],
      correct: 1,
      hint: '20M ÷ 900M = ?',
      explanation: '20M ÷ 900M = 2.2%. If TON converts just 2.2% of its addressable Telegram user base to active DeFi participants, it matches Ethereum\'s current user count. This relatively low conversion threshold makes the bull case accessible: even with low conversion rates (typical for new financial products), TON\'s base is large enough to create significant adoption. The question remains whether conversion at even 2.2% is achievable — historical financial app adoption from messaging platforms suggests it is challenging but not impossible, particularly in emerging markets.',
    },
    {
      question: 'A DeFi-native investor has $500,000 to allocate and evaluates TON vs Arbitrum for DeFi deployment. What framework determines the decision?',
      options: [
        'Always choose the chain with the most TPS — speed determines DeFi success',
        'Match the chain to the use case: Arbitrum for sophisticated DeFi depth (GMX, $15B+ TVL, battle-tested protocols, 3+ years); TON as a speculative allocation on the distribution narrative (smaller position, higher risk/reward). Split is more rational than all-or-nothing',
        'TON always wins — 900M users guaranteed success',
        'Arbitrum always wins — TON is too early stage for serious capital',
      ],
      correct: 1,
      hint: 'What are the risk/reward profiles of each? Can they serve different portfolio roles?',
      explanation: 'Professional allocation framework: Arbitrum ($500K) for primary DeFi yield — deeper protocols, more liquidity, lower smart contract risk, established yield (GMX, Radiant, Camelot). TON ($50K or 10%) for speculative adoption narrative — higher risk, higher potential upside if distribution converts to adoption. The two serve different portfolio roles: Arbitrum for risk-adjusted return, TON for asymmetric upside. The $500K should not be all-or-nothing on either chain. A 90/10 Arbitrum/TON split captures the primary yield while maintaining meaningful exposure to the distribution narrative.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 177 — Regulatory Considerations for TON
// ─────────────────────────────────────────────────────────────────────────────

const L177: IslandLevel = {
  id: 177, mechanic: 'memory', tier: 'pro',
  topic: 'Regulatory Considerations for TON',

  explanation: `
In August 2024, Pavel Durov — Telegram's founder and CEO — was arrested in France on charges related to Telegram's moderation (or lack thereof) of illegal content. The arrest sent Toncoin's price down 15% within hours. This event crystallised the primary regulatory risk of TON: its fortunes are partially tied to Telegram's regulatory standing.

Telegram operates in a complex regulatory environment. It is incorporated in UAE (Dubai), where Durov has residency. Its users span nearly every country, including jurisdictions with restrictive media and communications laws (Russia, China, Iran, India). Telegram's relatively permissive moderation approach — refusing to share user data with most governments — has created ongoing tension with regulators in multiple countries.

TON's regulatory situation has three distinct layers:

Toncoin's token status: the SEC's 2020 enforcement against Gram (the original token) established precedent that Telegram-associated tokens can be classified as securities. Toncoin, while issued by the independent TON Foundation rather than Telegram, still faces scrutiny given the close relationship. Most major exchanges list Toncoin, but some US-focused platforms remain cautious.

TON's geographic concentration: TON's usage is heavily weighted toward jurisdictions with complex regulatory environments (Russia, CIS countries, Southeast Asia). If Telegram faced major regulatory restrictions in these markets, TON adoption would be disproportionately affected.

The Durov arrest effect: Durov's August 2024 arrest demonstrated that regulatory actions against Telegram's leadership have direct market impact on TON. The price recovered, but the event highlighted the correlation between Telegram's regulatory standing and TON's market performance.

For investors: TON carries regulatory tail risk that is partially correlated with Telegram's regulatory standing — an unusual and somewhat unique risk factor in crypto.
  `.trim(),

  fact: 'TON\'s regulatory risks: Toncoin\'s association with Telegram\'s SEC history, Durov\'s 2024 arrest caused 15% price drop, geographic concentration in complex jurisdictions. TON carries Telegram-correlated regulatory risk unlike most crypto assets.',
  plain: 'TON\'s biggest regulatory risk: it\'s tied to Telegram. If Telegram gets into legal trouble (like Durov\'s 2024 arrest), TON\'s price reacts. The SEC has already taken action against Telegram once. Know this risk before allocating significantly.',
  stars: [1100, 1354, 1692], target: 1692, coins: 84,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Durov arrest impact]',
      scenario: 'Marcus holds 5,000 TON when Durov is arrested in France in August 2024. He checks prices.',
      outcome: 'Toncoin drops 15% within 4 hours of the arrest news. Marcus had anticipated regulatory risk as a possibility and sized his TON position at 3% of portfolio — a drop from $25,000 to $21,250 costs him $3,750. His portfolio-level loss: 3% × 15% = 0.45% of total. Manageable. He chooses not to sell into panic — the arrest was for Telegram moderation issues, not TON protocol problems. Prices recover 60% of the drop within a week as the market reassesses. Position sizing around known tail risks determined his resilience.',
    },
    {
      contextTag: '[SEC precedent assessment]',
      scenario: 'Amara asks whether the SEC could go after Toncoin specifically the way it went after the original Gram tokens.',
      outcome: 'Key distinction: the SEC acted against Telegram for selling unregistered securities (Gram ICO — direct sale by Telegram to investors expecting profit from Telegram\'s efforts). Toncoin was distributed differently — no ICO by Telegram, initial supply via community mining and TON Foundation. However: the relationship between Telegram and TON remains close (Telegram integration, endorsement). A determined SEC examination would assess whether Toncoin qualifies as an investment contract under current interpretations. The risk is lower than the Gram case but non-zero. US-focused exchanges listing Toncoin have implicitly assessed it as acceptable risk — but this could change with new SEC leadership or interpretation.',
    },
    {
      contextTag: '[Geographic concentration risk]',
      scenario: 'Keiko reads that a significant portion of active TON users are in Russia and Ukraine. She asks how this affects TON\'s risk profile.',
      outcome: 'Concentration in sanctioned or restricted jurisdictions creates specific risks: if major Western exchanges restricted TON trading due to sanctions concerns (OFAC could designate if significant Russian usage were determined to be sanctions-relevant), liquidity would decrease. Additionally, Telegram being blocked in certain jurisdictions (Russia has historically blocked then unblocked Telegram multiple times) directly affects TON adoption in those markets. Geographic concentration is a risk multiplier — good for reaching those users, vulnerable if those markets face restrictions.',
    },
  ],

  keyTakeaway: 'TON carries Telegram-correlated regulatory risk: Toncoin\'s SEC history, Durov\'s regulatory entanglements causing market volatility, and geographic concentration in complex jurisdictions. Size TON positions to account for this tail risk being exercised periodically.',

  guidedPractice: [
    {
      question: 'Why did Durov\'s arrest in France cause Toncoin\'s price to drop?',
      options: [
        'Durov personally holds a large Toncoin treasury that the French government froze',
        'Markets perceived Telegram\'s regulatory standing as directly correlated with TON\'s adoption prospects — if Telegram faces major legal problems, TON\'s distribution advantage is at risk',
        'The French government announced it would shut down Telegram, destroying TON\'s user base immediately',
        'Durov is the primary TON validator and his arrest suspended block production',
      ],
      correct: 1,
      hint: 'What is TON\'s primary thesis? What threatens it?',
      explanation: 'TON\'s value proposition is built substantially on Telegram\'s 900M-user distribution. If Telegram faces severe regulatory action — operations restricted in major markets, leadership incapacitated, platform forced to change its architecture — TON\'s distribution advantage shrinks. Markets priced in the risk that Durov\'s arrest could escalate. The price recovery came when it became clear the arrest was for Telegram\'s moderation practices (not for TON specifically), that Telegram remained operational, and that Durov was eventually released on bail. The correlation between Telegram\'s regulatory standing and TON\'s market performance is the specific risk that this event demonstrated.',
    },
    {
      question: 'How does Toncoin\'s regulatory status differ from the original Gram tokens that the SEC pursued?',
      options: [
        'They are legally identical — the SEC will eventually pursue Toncoin the same way',
        'Gram was sold by Telegram directly to investors in an ICO, clearly meeting Howey test criteria. Toncoin was distributed by an independent foundation via community mining — a different structure that has survived SEC scrutiny for several years',
        'Toncoin is exempt from SEC jurisdiction because it is incorporated in UAE',
        'Gram tokens were securities; Toncoin is officially classified as a commodity by the CFTC',
      ],
      correct: 1,
      hint: 'What made Gram specifically a security under the Howey test? Does Toncoin have the same characteristics?',
      explanation: 'SEC\'s Howey test for securities: investment of money in a common enterprise, with an expectation of profits from the efforts of others. Gram: investors gave Telegram money ($1.7B) expecting profits from Telegram\'s blockchain development. Classic Howey test. Toncoin: distributed by TON Foundation (not Telegram), via community mining (not investor sale), after Telegram exited. The "profits from efforts of others" nexus is less clear when Telegram is an endorser rather than the issuer. This different structure has allowed most major exchanges to list Toncoin — but the SEC has not provided formal guidance.',
    },
    {
      question: 'What is the practical investment implication of TON\'s geographic concentration in Russia and CIS countries?',
      options: [
        'It makes TON stronger — CIS countries have rapidly growing crypto adoption',
        'It creates specific tail risks: sanctions-related exchange restrictions, Telegram blocks in those markets affecting TON adoption, and regulatory crackdowns in those jurisdictions having disproportionate impact on TON usage',
        'Geographic concentration has no investment implications — crypto is borderless',
        'CIS concentration is irrelevant as Telegram plans to migrate its user base to Western markets',
      ],
      correct: 1,
      hint: 'If 40% of your users are in markets that face significant regulatory risk, what does that mean for your downside?',
      explanation: 'Geographic concentration amplifies specific risks. If OFAC designation or sanctions applied to TON activity in Russia, major compliant exchanges would delist or restrict trading — reducing liquidity and potentially price. If Telegram were blocked in major CIS markets (Russia has done this before), TON adoption in those markets decreases. Conversely: high CIS penetration also means TON has less dependence on Western regulatory approval — it does not need SEC clearance to operate its primary user base. Both directions matter.',
    },
    {
      question: 'How should the regulatory tail risk of TON affect your position sizing relative to assets with clearer regulatory standing?',
      options: [
        'No adjustment needed — all crypto assets carry equivalent regulatory risk',
        'Smaller position sizes to ensure even a severe regulatory event (Telegram restricted, TON delisted from major exchanges, 40%+ price drop) remains a manageable portfolio-level loss rather than a catastrophic one',
        'Avoid TON entirely until it receives explicit SEC commodity classification',
        'Larger positions to compensate for the regulatory uncertainty via higher return requirement',
      ],
      correct: 1,
      hint: 'If you size TON at 10% of portfolio and it drops 40% on regulatory news, what is your portfolio impact?',
      explanation: 'Position sizing for known tail risks: a 40% drop on a 10% portfolio allocation = 4% portfolio loss. Manageable. A 40% drop on a 30% portfolio allocation = 12% portfolio loss. Potentially significant. The specific tail risk scenario for TON (Telegram regulatory crisis causing 40%+ price drop) is more concrete and probable than equivalent scenarios for assets like Bitcoin or Ethereum. This warrants position sizing at 3–7% rather than 15–25% for equivalent conviction. The regulatory risk is not a reason to avoid TON; it is a reason to size it appropriately.',
    },
    {
      question: 'A TON developer wants to release an anonymous number service that allows users in regulated jurisdictions to communicate privately. What regulatory consideration is most relevant?',
      options: [
        'The service violates TON\'s smart contract terms of service',
        'Jurisdictions with mandatory data retention or communications surveillance laws may view anonymous number services as facilitating evasion of legal requirements — creating legal risk for the developer and potentially regulatory attention on TON itself',
        'Anonymous services are uniformly legal in all jurisdictions where Telegram operates',
        'Only the user faces legal risk — the developer is protected by decentralisation',
      ],
      correct: 1,
      hint: 'Why was Telegram itself under regulatory pressure? What was the core issue?',
      explanation: 'Telegram\'s Durov arrest was related to Telegram\'s failure to moderate or provide data for illegal content — specifically around Telegram\'s position as a privacy-first platform in jurisdictions demanding access to communications. An anonymous number service on TON amplifies this existing friction: it specifically enables circumvention of phone number-based identity requirements. Jurisdictions with mandatory telecom surveillance (many countries require carriers to provide caller information on demand) would view anonymous virtual numbers as a potential evasion tool. The developer faces legal risk in those jurisdictions, and the service\'s existence could attract regulatory attention to TON\'s role in enabling privacy tools.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 178 — Building on TON: FunC, Tact, and the Developer Ecosystem
// ─────────────────────────────────────────────────────────────────────────────

const L178: IslandLevel = {
  id: 178, mechanic: 'chain', tier: 'pro',
  topic: 'Building on TON — FunC, Tact, and the Developer Ecosystem',

  explanation: `
In 2024, a Solidity developer from Ethereum tried to build a simple staking contract on TON. After three weeks of confusion, they wrote: "TON is not a different Ethereum — it is a completely different paradigm." They were right. TON's smart contract model is so different from EVM that Ethereum experience is nearly irrelevant.

TON smart contracts are called "actors" — each contract is an isolated entity that communicates with other contracts exclusively through asynchronous messages. Unlike Ethereum where Contract A can synchronously call Contract B and receive an immediate response in the same transaction, TON contracts send messages to each other and receive responses later. This actor model enables TON's parallel processing but makes multi-step interactions significantly more complex.

FunC is TON's native smart contract language — low-level, expressive, and powerful. It has a steep learning curve even for experienced developers. Think of it as analogous to writing Solidity at the assembly level. FunC provides maximum control and efficiency but requires deep understanding of TON's execution model.

Tact is a higher-level language that compiles to FunC — more accessible for developers new to TON. It adds type safety, familiar syntax patterns, and reduces the boilerplate of TON's message-handling patterns. Most new TON DeFi protocols in 2024 use Tact.

The tooling ecosystem: Blueprint is the primary development framework (equivalent to Hardhat for Ethereum) — provides project templates, local testing, and deployment scripts. Sandbox is the local testing environment — allows testing contract interactions without deploying to testnet.

For Ethereum developers: the learning curve is substantial but the ecosystem is actively growing. The TON Foundation provides grants and development support. The developer count is far smaller than Ethereum's but growing fastest among blockchain ecosystems in 2024.
  `.trim(),

  fact: 'TON uses actor model contracts with async messaging — fundamentally different from EVM. Languages: FunC (native, low-level), Tact (higher-level, preferred for new projects). Tooling: Blueprint (framework), Sandbox (testing). Smaller but fast-growing developer community.',
  plain: 'Building on TON is nothing like Ethereum. Contracts talk to each other through delayed messages, not instant calls. FunC and Tact are the languages (not Solidity). Small developer community but growing fast with good tooling.',
  stars: [1160, 1427, 1784], target: 1784, coins: 88,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Actor model confusion]',
      scenario: 'Keiko is building a lending protocol on TON. In Ethereum, she would call the price oracle synchronously: `uint price = oracle.getPrice(token)`. She tries the same approach on TON.',
      outcome: 'TON does not support synchronous cross-contract calls. She must redesign: (1) User requests a borrow → her contract sends a message to the oracle requesting the price. (2) Oracle receives the message, calculates the price, sends a response message back. (3) Her contract receives the oracle response in a later transaction and continues the borrow logic. Each step is a separate transaction. This requires careful state management — her contract must track "waiting for oracle response" states and handle the case where the oracle response is delayed or never arrives.',
    },
    {
      contextTag: '[FunC vs Tact choice]',
      scenario: 'Marcus is starting a new TON NFT marketplace contract. He evaluates FunC vs Tact.',
      outcome: 'FunC: maximum efficiency, access to low-level TON operations, existing well-audited contract examples to reference. Learning curve: 2–3 months for proficiency. Tact: more readable syntax, type safety reduces certain error classes, better tooling support for debugging, faster development. Learning curve: 2–4 weeks. For a new marketplace where development speed matters: Tact. For a protocol where every gas unit of efficiency matters (like a high-frequency trading system): FunC. He chooses Tact, planning to review gas consumption after the first version.',
    },
    {
      contextTag: '[Developer opportunity]',
      scenario: 'Amara is an experienced Solidity developer looking at the TON ecosystem for opportunities.',
      outcome: 'The opportunity is clear: fewer developers, more opportunities. Ethereum has ~20,000 Solidity developers competing for similar jobs. TON has ~1,000 FunC/Tact developers for a much smaller pool of projects. TON Foundation grants are well-funded and available for developers who can deliver TON-native products. The learning curve is real (2–4 months to become productive in Tact, 6+ for FunC) but the reduced competition and ecosystem-stage opportunity make it worthwhile for developers interested in being early to a high-growth ecosystem.',
    },
  ],

  keyTakeaway: 'TON\'s actor model (async message passing) makes it fundamentally different from Ethereum\'s synchronous call model. FunC (low-level, efficient) and Tact (higher-level, faster development) are the primary languages. Smaller developer community = more opportunity for early movers.',

  guidedPractice: [
    {
      question: 'What is the key difference between how TON contracts communicate versus Ethereum contracts?',
      options: [
        'TON contracts use JavaScript while Ethereum contracts use Solidity',
        'TON contracts communicate exclusively via asynchronous messages — Contract A sends a message to Contract B, which responds in a later transaction. Ethereum contracts can call each other synchronously within the same transaction',
        'TON contracts cannot interact with other contracts — each is fully isolated',
        'TON contracts communicate via a shared memory pool that all contracts can read and write',
      ],
      correct: 1,
      hint: 'In Ethereum, can Contract A call Contract B and get an immediate response? In TON?',
      explanation: 'Ethereum synchronous calls: `uint result = Contract_B.getPrice()` — this executes in the same transaction, returning immediately. TON async messaging: Contract A sends a message to Contract B → transaction completes → Contract B processes the message in a separate transaction → Contract B sends a response message → Contract A processes the response in yet another transaction. Three transactions for what Ethereum does in one. This is why TON can process in parallel (no synchronous dependencies between shards) but requires careful state machine design for multi-step protocols.',
    },
    {
      question: 'Why is Ethereum Solidity experience insufficient for TON development?',
      options: [
        'Solidity is legally prevented from being used on non-EVM chains',
        'TON\'s actor model (async messaging), different account model, and non-EVM execution environment require fundamentally different design patterns — Ethereum mental models actively mislead on TON',
        'Solidity code can be easily transpiled to FunC with automated tools',
        'Ethereum developers are blocked from TON grants due to conflict of interest policies',
      ],
      correct: 1,
      hint: 'If you expect synchronous calls and the platform only supports async, what happens to your design?',
      explanation: 'An Ethereum developer\'s mental model: "I call a function, it executes, I get a result." On TON, this model produces broken contracts — they send messages expecting immediate responses, but responses arrive in later transactions. The entire design of multi-step DeFi interactions (deposit → check collateral → issue loan) must be reimagined as state machines handling delayed responses. Additionally: TON\'s account model (separate code and state storage), gas model, and address format all differ from Ethereum. Solidity proficiency does not transfer — it requires learning new paradigms, not just new syntax.',
    },
    {
      question: 'For a new TON project prioritising development speed, which language is more appropriate?',
      options: [
        'FunC — native language is always more efficient',
        'Tact — higher-level syntax with type safety and better tooling support reduces development time, while producing correct FunC output. Choose FunC only for performance-critical low-level contracts',
        'Solidity — it compiles to TON bytecode via cross-compiler',
        'Both are equivalent in development speed — choose based on personal preference',
      ],
      correct: 1,
      hint: 'Higher-level language = faster development. What does Tact compile to?',
      explanation: 'Tact compiles to FunC (then to TON bytecode) — so the final execution efficiency is comparable. The development-speed difference is significant: Tact provides familiar type-safe syntax, reduces boilerplate for common TON patterns (message handling, contract initialization), and has better IDE support and error messages. For a new project with time-to-market pressure: Tact. For a protocol where every cell operation and gas unit matters (like an AMM that processes thousands of swaps): FunC after the initial Tact prototype shows where optimisations are needed.',
    },
    {
      question: 'What is Blueprint in the TON development ecosystem?',
      options: [
        'Blueprint is the official TON visual contract editor for non-developers',
        'Blueprint is the primary TON development framework — providing project templates, local testing environment, and deployment scripts, equivalent to Hardhat for Ethereum developers',
        'Blueprint is TON Foundation\'s grant management platform for developer applications',
        'Blueprint is a Tact language compiler and syntax checker',
      ],
      correct: 1,
      hint: 'What is the TON equivalent of Hardhat or Foundry?',
      explanation: 'Blueprint serves the same role as Hardhat (Ethereum): project scaffolding (`npm create ton@latest` generates a project structure), test runner (run tests locally against Sandbox), and deployment scripts (deploy contracts to testnet and mainnet). Together with Sandbox (local TON blockchain simulation for testing without real gas), Blueprint provides the development loop: write Tact contract → test locally in Sandbox → deploy to TON testnet → deploy to mainnet. The tooling is less mature than Ethereum\'s (fewer plugins, smaller community) but functional for development.',
    },
    {
      question: 'Why does the smaller TON developer community represent an opportunity for a developer willing to learn it?',
      options: [
        'TON pays higher developer salaries than Ethereum due to smaller supply of talent',
        'Fewer developers means less competition for: grant funding, protocol development contracts, first-mover advantage in building category-defining protocols (the "Uniswap of TON" is not built yet)',
        'TON Foundation hires all TON developers, providing guaranteed employment',
        'Smaller community means the protocol is less secure, which creates opportunities for auditors',
      ],
      correct: 1,
      hint: 'What category of protocols do not yet exist on TON that exist on Ethereum? Who builds them first?',
      explanation: 'Ethereum in 2017 was at a similar ecosystem stage to TON today — Uniswap, Aave, Compound, OpenSea were not yet built. Early developers who built those protocols captured enormous value as the ecosystem grew. TON in 2024 similarly lacks: mature lending protocols, advanced derivatives, NFT infrastructure comparable to OpenSea, cross-chain bridges with deep liquidity. A developer who builds the first production-grade TON lending protocol captures: protocol fees, potential token allocation, grant funding, and first-mover brand recognition. Smaller community = less competition for these founding protocol positions.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 179 — TON Ecosystem Map and Key Protocols
// ─────────────────────────────────────────────────────────────────────────────

const L179: IslandLevel = {
  id: 179, mechanic: 'match3', tier: 'pro',
  topic: 'TON Ecosystem Map — Wallets, DEXes, NFTs, Analytics',

  explanation: `
The TON ecosystem in 2024 is concentrated but growing. Unlike Ethereum's hundreds of competing protocols in each category, TON has 2–3 dominant options per segment — making navigation simpler but choice more consequential.

Wallets: TON Space (Telegram built-in, self-custody, most users), Tonkeeper (most popular standalone wallet, 5M+ downloads, clean UI, hardware wallet support via Bluetooth), MyTonWallet (web-based, advanced features for power users). For new users: TON Space. For power users wanting desktop access: Tonkeeper or MyTonWallet.

DEXes: STON.fi (dominant by volume, Mini App integrated, 0.3% fee), DeDust (second largest, vault model, 0.25% fee). No equivalent of Uniswap v3 with concentrated liquidity as a mainstream TON option yet — this is a development gap.

Lending: Storm Trade (perpetuals, not full lending), Evaa Protocol (lending/borrowing, early stage as of 2024), and several protocols in beta. Lending infrastructure is early — the Compound/Aave equivalent of TON is not yet mature.

NFT marketplaces: Getgems (dominant, equivalent to OpenSea for TON), Fragment (username/number NFTs specifically). TON NFTs use their own token standard (not ERC-721 compatible).

Analytics: Tonviewer (block explorer), ton.org/explorer (official, more basic), DeDust Analytics, STON.fi stats. Less comprehensive than Ethereum's Dune Analytics or Etherscan — analytics infrastructure is a notable gap.

Bridges: TonBridge (official, ton.org/bridge), third-party options as described in L174.

The honest ecosystem assessment: TON's DeFi is 2–3 years behind Ethereum in protocol maturity. Essential infrastructure (lending, derivatives, options, structured products) is early or absent. The distribution advantage is real; the DeFi depth remains a significant gap.
  `.trim(),

  fact: 'TON ecosystem: Wallets (TON Space, Tonkeeper, MyTonWallet), DEXes (STON.fi, DeDust), NFT (Getgems, Fragment), Analytics (Tonviewer, ton.org explorer). Lending infrastructure early-stage. DeFi 2–3 years behind Ethereum in protocol maturity.',
  plain: 'TON\'s main tools: TON Space for your wallet, STON.fi for swaps, Getgems for NFTs, Tonviewer to check contracts. Lending is still early. The ecosystem is real but young — far fewer options than Ethereum.',
  stars: [1220, 1502, 1877], target: 1877, coins: 92,
  simulatorLesson: 'tonMiniAppDex',

  examples: [
    {
      contextTag: '[Wallet selection]',
      scenario: 'Priya is new to TON. James is a power user who wants desktop access and hardware wallet support. Amara is building a TON dApp and needs testing flexibility.',
      outcome: 'Priya: TON Space in Telegram — zero friction, already in her most-used app, real self-custody. James: Tonkeeper — 5M+ downloads, iOS/Android/Chrome extension, Ledger hardware wallet support via Bluetooth, advanced token management. Amara (developer): MyTonWallet (web-based) for direct testnet connection, or Tonkeeper for its developer mode. All three are self-custodial — seed phrase applies to all. Choice depends on use pattern, not security level.',
    },
    {
      contextTag: '[DeFi gap identification]',
      scenario: 'Marcus is a sophisticated DeFi user from Ethereum. He wants to: (1) swap tokens, (2) earn yield by lending, (3) trade perpetuals, (4) buy options.',
      outcome: '(1) Swap: STON.fi or DeDust — covered, functional. (2) Lending: Evaa Protocol — early stage, limited assets, lower TVL than Ethereum equivalents. Proceed with caution. (3) Perpetuals: Storm Trade — functional but significantly smaller than GMX or Drift. (4) Options: no mature options protocol on TON as of 2024. He proceeds with (1) only, acknowledges (2) as high-risk early-stage, skips (3) and (4) as infrastructure gaps. TON\'s DeFi gaps are real — do not assume capabilities exist that do not.',
    },
    {
      contextTag: '[Analytics workflow]',
      scenario: 'Keiko wants to verify a new TON jetton before investing. She knows Etherscan for Ethereum. She asks what the equivalent TON tools are.',
      outcome: 'Tonviewer (tonviewer.com): enter jetton contract address → see source code verification status, mint authority, owner, and transaction history. Equivalent to Etherscan for token verification. ton.org/explorer: more basic but official — good for simple transaction lookups. DeDust analytics: pool TVL and volume data for DeDust pools. STON.fi stats: volume and TVL data for STON.fi pools. No equivalent to Ethereum\'s Dune Analytics for custom on-chain queries — this is a notable analytics gap on TON.',
    },
  ],

  keyTakeaway: 'TON ecosystem: dominated by STON.fi (DEX), Tonkeeper/TON Space (wallets), Getgems (NFTs), Tonviewer (analytics). Lending is early-stage, no mature derivatives or options. DeFi infrastructure is 2–3 years behind Ethereum — factor this into expectations.',

  guidedPractice: [
    {
      question: 'For a TON user who wants hardware wallet support for Ledger, which wallet should they use?',
      options: [
        'TON Space — it has the most users and Telegram integration',
        'Tonkeeper — it supports Ledger hardware wallet connection via Bluetooth, unlike TON Space which is software-only',
        'MyTonWallet — web-based wallets always support hardware wallet connections',
        'No TON wallet supports hardware wallets',
      ],
      correct: 1,
      hint: 'Which TON wallet specifically advertises hardware wallet integration?',
      explanation: 'TON Space (Telegram built-in) is software-only — convenient but keys are on your device without hardware isolation. Tonkeeper explicitly supports Ledger hardware wallet via Bluetooth connection — the private key lives on the Ledger device, never the phone. For amounts where hardware wallet security matters ($10,000+), Tonkeeper with Ledger provides the highest security tier available on TON. MyTonWallet is web-based and does not currently support direct Ledger integration for TON.',
    },
    {
      question: 'What is the most significant DeFi infrastructure gap in the TON ecosystem as of 2024?',
      options: [
        'TON has no DEX — users can only trade through centralised exchanges',
        'Mature lending/borrowing protocols — the Aave/Compound equivalent of TON is early-stage with limited asset support and lower TVL than Ethereum equivalents',
        'TON has no NFT marketplace — users cannot buy or sell digital assets on-chain',
        'TON lacks a native stablecoin, making DeFi impossible',
      ],
      correct: 1,
      hint: 'What does a mature DeFi ecosystem need beyond DEXes? What is Ethereum\'s most-used DeFi category by TVL?',
      explanation: 'Lending/borrowing protocols (Aave, Compound on Ethereum) represent the largest DeFi TVL category. They enable: using crypto as collateral without selling, leveraged positions, yield from lending idle assets. TON\'s lending infrastructure (Evaa Protocol, others) is early — limited supported assets, smaller TVL, shorter audit history, and less battle-tested against adversarial conditions. This gap means sophisticated DeFi strategies requiring lending (delta-neutral, leveraged yield, collateralised borrowing) are not yet viable at scale on TON.',
    },
    {
      question: 'Getgems is described as "dominant" for TON NFTs. What does this mean for a TON NFT buyer?',
      options: [
        'Getgems is operated by Telegram and has regulatory protection',
        'Getgems has the most listings, deepest liquidity, and widest buyer reach for TON NFTs — making it the best place to buy (more sellers) and sell (more buyers), though alternatives exist for specific categories like Fragment for usernames',
        'Getgems is the only TON NFT marketplace that accepts credit card payment',
        'Getgems provides insurance against NFT smart contract failures',
      ],
      correct: 1,
      hint: 'What does market dominance mean for buyers and sellers practically?',
      explanation: 'In marketplace economics, dominant platforms have network effects: more buyers attract more sellers, more sellers attract more buyers. Getgems having the most TON NFT listings means buyers have more selection and better price discovery; sellers have more potential buyers and faster liquidity. The alternative (listing on a smaller marketplace) means fewer buyers see your listing. Practical implication: for buying and selling most TON NFTs, start on Getgems. Fragment is the exception — it specifically handles username and anonymous number NFTs, and its specialisation means better liquidity for that specific asset class.',
    },
    {
      question: 'You want to analyse the on-chain transaction history of a TON address to check for suspicious activity. Which tool do you use?',
      options: [
        'DeDust Analytics — it provides comprehensive on-chain data for all TON addresses',
        'Tonviewer (tonviewer.com) — TON\'s primary block explorer showing full transaction history, token balances, and contract interactions for any TON address',
        'STON.fi stats — it shows trading history for all TON wallet addresses',
        'Telegram itself — Telegram records and displays TON transaction history',
      ],
      correct: 1,
      hint: 'What is the TON equivalent of Etherscan?',
      explanation: 'Tonviewer is TON\'s Etherscan equivalent. Enter any TON wallet address or jetton contract address to see: full transaction history (incoming, outgoing, smart contract interactions), current token balances, contract source code verification status (for contracts), and NFT holdings. For address analysis: look for transaction patterns, funding sources (trace where initial TON came from), and connected addresses (common source = possible cluster). The analytics capabilities are more limited than Ethereum\'s Dune Analytics for custom queries, but Tonviewer covers the essential transaction verification and investigation use cases.',
    },
    {
      question: 'TON\'s DeFi ecosystem is described as "2–3 years behind Ethereum." What does this mean for risk-adjusted return expectations?',
      options: [
        'TON DeFi is strictly worse and should be avoided',
        'Earlier-stage ecosystem = higher risk (less audited, less battle-tested) but potentially higher yield as protocols compete for liquidity with elevated APYs, and potential first-mover return if the ecosystem grows as predicted',
        'Returns on TON DeFi are 2–3 years delayed compared to Ethereum',
        'TON DeFi will catch up to Ethereum in 2–3 years automatically',
      ],
      correct: 1,
      hint: 'What does "earlier stage" mean for both risk and potential reward?',
      explanation: 'Earlier-stage ecosystem characteristics: higher smart contract risk (less audit coverage, less battle-testing), higher potential yield (protocols offer elevated rewards to attract early liquidity), and asymmetric upside (protocols that grow into leadership positions during this stage create significant value for early LPs and users). This is the same dynamic as providing liquidity to Uniswap in 2018 versus 2024: much higher risk in 2018 (less proven) but also much higher return for those who participated successfully. "2–3 years behind" means applying Ethereum\'s current risk framework to TON underestimates TON\'s risk and underestimates its potential upside.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 180 — BOSS: The Complete TON Picture
// ─────────────────────────────────────────────────────────────────────────────

const L180: IslandLevel = {
  id: 180, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: The Complete TON Picture',
  isBoss: true,

  explanation: `
You have completed TON & Telegram. Here is the synthesis.

TON is the blockchain with the world's largest potential distribution channel: 900 million Telegram users who can access self-custody crypto in three taps via TON Space. No other chain has this reach. The question is not whether the distribution advantage exists — it does — but whether messaging users convert to crypto users at meaningful scale.

The technical foundation is sound: TON's dynamic sharding processes 100,000+ TPS in production (demonstrated during Telegram gaming events), sub-cent fees, and masterchain coordination enable the scale required for a global messaging audience. TON Connect provides seamless DApp connectivity from within Telegram.

The ecosystem is early but real: STON.fi and DeDust for DEX trading, TON Space and Tonkeeper for wallets, Fragment for username and number NFTs, Getgems for general NFT trading, Tonviewer for contract verification. Lending and derivatives are early-stage gaps.

The risks are specific and manageable with appropriate sizing: Telegram-correlated regulatory risk (Durov arrest effect), TON-SEC history, earlier-stage smart contract risk, play-to-airdrop overhype, and bridging infrastructure immaturity.

For participation: CEX routing (not bridges) for on-ramping, Tonviewer + mint authority + LP lock for project verification, TEG-specific red flags (Telegram-only communication), position sizing adjusted for regulatory tail risk.

The honest TON thesis: if 2% of Telegram's 900M users become active crypto users, TON would be the world's most-used crypto platform. Whether that conversion happens — and on what timeline — is the unresolved question at the heart of every TON investment decision.
  `.trim(),

  fact: 'TON mastery: 900M Telegram distribution, dynamic sharding (100K+ TPS), TON Space self-custody wallet, STON.fi/DeDust DEXes, Fragment usernames, play-to-airdrop mechanics (honest time economics), Telegram-correlated regulatory risk, early-stage DeFi infrastructure.',
  plain: 'TON\'s unique strength: Telegram\'s 900M users. Real DeFi exists (STON.fi, Tonkeeper, Fragment). But the ecosystem is young, regulation is complex, and converting messaging users to crypto users is hard. Know all three before allocating.',
  stars: [2210, 2720, 3400], target: 3400, coins: 100,
  simulatorLesson: 'tonBoss',

  examples: [
    {
      contextTag: '[Designing a TON onboarding journey]',
      scenario: 'Design the first 30 days for a Telegram power user with zero crypto experience who wants to start using TON DeFi.',
      outcome: 'Week 1: Set up TON Space (3 minutes, write down seed phrase on paper), buy $100 USDT on Binance, send to TON Space. Week 2: Make first swap on STON.fi ($50 USDT → TON), understand the interface and fees. Week 3: Check Tonviewer — look up your own address, understand transaction history. Week 4: Provide $100 liquidity to USDT/TON pool on STON.fi, understand LP tokens and impermanent loss from small scale. Milestone: one month of active TON DeFi using genuinely, lost no more than $5 in fees, understand every step taken. Now qualified to increase allocation if desired.',
    },
    {
      contextTag: '[Evaluating a TON investment opportunity]',
      scenario: 'A friend shows you a TON DeFi project offering 150% APY on their native token LP, team anonymous, only Telegram communication, no Tonviewer contract verification.',
      outcome: 'Run the checklist: anonymous team (red flag), Telegram-only (TON-specific red flag), contract not verified on Tonviewer (red flag), 150% APY = primarily emission rewards in their own unverifiable token (red flag). Four simultaneous red flags. The honest answer: this is a high-probability rug pull or failed project. The 150% APY exists to attract capital before an exit. No verified contract means no community audit is possible. Your friend should move their capital to a verified protocol and treat this as a near-zero opportunity.',
    },
    {
      contextTag: '[TON portfolio sizing decision]',
      scenario: 'Keiko has $50,000 in crypto. She believes in TON\'s distribution thesis. She asks how much to allocate.',
      outcome: 'Framework: TON is a high-conviction speculative position with specific tail risks (Telegram regulatory, earlier-stage DeFi). Appropriate range: 5–10% of crypto portfolio for genuine believers. $50,000 × 7% = $3,500 in TON ecosystem. Split: $2,000 in Toncoin (direct exposure to distribution narrative), $1,500 in STON.fi LP (earn yield while maintaining TON exposure). CEX on-ramp to TON Space. Staged entry: $1,750 today, $1,750 in 30 days (dollar-cost averaging around regulatory volatility). If Telegram faces major regulatory action and TON drops 40%: $3,500 × 40% = $1,400 loss, representing 2.8% of total portfolio — manageable.',
    },
  ],

  keyTakeaway: 'TON\'s value proposition is the largest potential crypto distribution channel ever built into an existing consumer application. The conversion question remains open. Participate with: CEX on-ramp, verified project checks, regulatory-tail-risk-adjusted position sizing, and the honest expectation that DeFi infrastructure maturity is 2–3 years behind Ethereum.',

  guidedPractice: [
    {
      question: 'A play-to-airdrop game reaches 200M players. The total token pool is valued at $100M. What is the average allocation per player and what time investment would make it positive expected value?',
      options: [
        '$0.50 per player on average. Positive EV only if total time spent is under 30 minutes',
        '$50 per player. Positive EV if you spend less than 50 hours.',
        '$0.50 per player on average. At $0.50 expected value, it is positive EV only if the game provides entertainment value independently — the financial return alone is too small to justify dedicated farming time',
        '$500 per player. Most play-to-airdrop games are highly profitable.',
      ],
      correct: 2,
      hint: '$100M ÷ 200M players = ? Then calculate the implied hourly return for any time investment.',
      explanation: '$100M ÷ 200M = $0.50 average allocation. Even at top 5% (10M players sharing 40% = $40M ÷ 10M = $4 average): $4 ÷ X hours where X is your time investment. For 10 hours of dedicated play: $0.40/hour — well below minimum wage. The correct framework: play if the game is genuinely entertaining (time cost is zero in that case, $0.50 is pure upside). Avoid if you are only playing for the token (negative real return after opportunity cost of your time).',
    },
    {
      question: 'You want to provide liquidity on STON.fi. A new pool offers 80% APY (5% fees, 75% emissions in the project\'s own token). What critical verification steps apply specifically to TON?',
      options: [
        'No special verification — standard DeFi APY evaluation applies',
        'Check on Tonviewer: jetton contract verification status, mint authority disabled, LP lock status. Then evaluate: is the 75% emission token itself verifiable and is its supply locked? Unknown token emissions can become worthless instantly',
        'Only check the pool TVL — larger TVL means safer protocol',
        'Verify the project has a Telegram channel with over 10,000 members',
      ],
      correct: 1,
      hint: 'What does 75% APY paid in the project\'s own token depend on? What could make that 75% worth zero?',
      explanation: 'TON-specific verification: Tonviewer for contract verification (can community audit the code?), mint authority status (can they print unlimited tokens and destroy your LP?), LP lock (can they rug the pool?). Then: the 75% emission APY is paid in the project\'s own token. If that token has active mint authority, the team can print enough to make each token worthless. If the emission token is unverified, the community cannot assess the risk. The 5% fee component is the only part backed by actual trading volume — everything else depends on the project token\'s value, which is the most uncertain component.',
    },
    {
      question: 'Telegram faces major regulatory action in three countries representing 30% of TON\'s user base. How should this affect your TON position sizing going forward?',
      options: [
        'Immediately sell all TON — regulatory action means the project will fail',
        'Reassess with updated probability estimates: recalculate the realistic addressable user base with 30% removed, adjust your conviction in the distribution thesis accordingly, and consider reducing position size if the updated EV no longer justifies your current allocation',
        'Increase position — regulatory clarity reduces uncertainty, creating a buying opportunity',
        'No action needed — crypto is decentralised and regulatory actions cannot affect blockchain protocols',
      ],
      correct: 1,
      hint: 'If 30% of your addressable user base is suddenly restricted, what happens to the distribution thesis?',
      explanation: 'Systematic reassessment: original thesis assumed 900M Telegram users as addressable market. With 30% in restricted jurisdictions = ~630M addressable. Update your EV calculation: conversion needed for 20M users now requires 3.2% (up from 2.2%). This does not mean sell immediately — it means updated calculation. If 630M addressable users at the same conversion probability still produces positive EV with current position size, no action needed. If the updated calculation suggests overcrowded position relative to new risk/reward, reduce position to appropriate sizing. Rational portfolio management based on updated information, not panic selling.',
    },
    {
      question: 'What is the correct on-ramp for $10,000 USDT from Ethereum to TON for a first-time TON user?',
      options: [
        'TonBridge — the official bridge is always the most secure option',
        'CEX routing: send USDT from Ethereum to OKX or Binance → withdraw as USDT on TON network to TON Space address. Faster, cheaper, and eliminates bridge smart contract risk for this amount',
        'STON.fi bridge feature — it handles cross-chain automatically',
        'Fragment marketplace — it converts ETH to TON as part of username purchases',
      ],
      correct: 1,
      hint: 'What is the risk of TonBridge vs the risk of OKX withdrawal for $10,000?',
      explanation: 'TonBridge risks for $10,000: smart contract vulnerability (less battle-tested than EVM bridges), 30–60 minute settlement, $10–20 in Ethereum gas. OKX/Binance withdrawal risks: exchange counterparty risk (OKX/Binance are large, regulated exchanges), $1–2 withdrawal fee, 5–10 minute settlement. For a first-time TON user, OKX routing is: faster, cheaper, and eliminates bridge smart contract risk. Test first: send $200 as a routing test before committing $9,800. Verify arrival in TON Space before proceeding with the full amount.',
    },
    {
      question: 'Summarise the complete TON ecosystem in three sentences covering: the unique advantage, the critical risk, and the honest status of DeFi infrastructure.',
      options: [
        'TON has the best DeFi on any blockchain with no significant risks.',
        'TON\'s unique advantage is Telegram\'s 900M-user distribution with one-tap self-custody wallet access — unmatched by any other blockchain. The critical risk is Telegram-correlated regulatory exposure, where events affecting Telegram (like the Durov arrest) directly impact TON\'s market and adoption prospects. TON\'s DeFi infrastructure is real but 2–3 years behind Ethereum in protocol maturity — basic DEXes (STON.fi) exist, but lending, derivatives, and options infrastructure is early-stage or absent.',
        'TON is purely speculative with no real infrastructure or advantage.',
        'TON is identical to Ethereum but with more users.',
      ],
      correct: 1,
      hint: 'What is the one unique thing TON has? What is the one specific risk that differs from other chains? What is honestly missing?',
      explanation: 'The three-sentence synthesis captures: (1) The structural distribution advantage — 900M users, one-tap wallet — which is factually real and unmatched. (2) The Telegram-correlated regulatory risk — not a standard blockchain risk but a specific tail risk from association with a platform under regulatory scrutiny. (3) The honest DeFi status — neither "TON is complete" nor "TON has nothing" but the accurate middle position: basic infrastructure exists, sophisticated protocols are early or absent, and this gap should factor into capital deployment decisions.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L174–180)
// ─────────────────────────────────────────────────────────────────────────────

const TON_LEVELS_B: Record<number, IslandLevel> = {
  174: L174,
  175: L175,
  176: L176,
  177: L177,
  178: L178,
  179: L179,
  180: L180,
};

export { TON_LEVELS_B };

export const TON_LEVELS: Record<number, IslandLevel> = {
  ...TON_LEVELS_A,
  ...TON_LEVELS_B,
};
