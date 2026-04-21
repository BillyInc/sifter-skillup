/**
 * On-Chain Sleuth Track — Simulator Definitions
 * Interactive MCQ / match / build simulators for each lesson.
 * All feed into SimulatorFactory (mcq | build | match).
 * These are the quick-check simulators embedded in each lesson,
 * separate from the full lessonSimulations scenario blocks.
 */
import type { SimulatorDef } from './SimulatorFactory';

export const ONCHAIN_SIM_DEFS: Record<string, SimulatorDef> = {

  // ── Lab 1, Lesson 1: What IS a Blockchain ────────────────────────────────
  blockchainBasics: {
    key: 'blockchainBasics', title: 'Blockchain Fundamentals', icon: '⛓️',
    subtitle: 'Match each blockchain property to what it means for investigators',
    type: 'match',
    pairs: [
      { left: 'Permanent', right: 'Transactions can never be deleted or altered' },
      { left: 'Transparent', right: 'Every transaction is visible to anyone with an internet connection' },
      { left: 'Pseudonymous', right: 'No name attached — but a full history exists' },
      { left: 'Distributed', right: 'Lives on thousands of computers simultaneously' },
      { left: 'Immutable', right: 'Once written, evidence never expires or disappears' },
    ],
  },

  // ── Lab 1, Lesson 2: Block Explorers ─────────────────────────────────────
  explorerNavigation: {
    key: 'explorerNavigation', title: 'Block Explorer Routing', icon: '🔭',
    subtitle: 'Match each blockchain to its correct explorer',
    type: 'match',
    pairs: [
      { left: 'Ethereum', right: 'etherscan.io' },
      { left: 'Solana', right: 'solscan.io' },
      { left: 'BNB Chain', right: 'bscscan.com' },
      { left: 'Arbitrum', right: 'arbiscan.io' },
      { left: 'Base', right: 'basescan.org' },
    ],
  },

  // ── Lab 1, Lesson 2: Block Explorers — MCQ drill ─────────────────────────
  explorerFields: {
    key: 'explorerFields', title: 'Reading Etherscan Fields', icon: '📋',
    subtitle: 'Predict what each Etherscan field tells you',
    type: 'mcq',
    questions: [
      {
        prompt: 'A transaction shows Value: 0 ETH. Does this mean nothing was transferred?',
        options: ['Yes — zero ETH means zero value moved', 'No — check Tokens Transferred for ERC-20 movements', 'Probably — only major hacks show 0 ETH', 'Yes — ETH and tokens always move together'],
        correct: 'No — check Tokens Transferred for ERC-20 movements',
        explain: 'Most DeFi transactions show 0 ETH because ETH is only used for gas. Millions in USDC, WBTC, or DAI can move while the ETH value field shows zero.',
      },
      {
        prompt: 'You paste a 42-character hex string into Etherscan and see a "Contract" tab with source code. What did you paste?',
        options: ['A transaction hash', 'A wallet address (EOA)', 'A contract address', 'A block number'],
        correct: 'A contract address',
        explain: 'Contract addresses show a Contract tab with deployable code. Wallet addresses (EOAs) show transaction history only. Transaction hashes show a single transaction detail page.',
      },
      {
        prompt: 'A transaction has 47 Internal Transactions listed. What does this tell you?',
        options: ['47 separate wallets received ETH', 'The transaction triggered 47 contract-to-contract calls during execution', '47 tokens were transferred', 'The transaction was attempted 47 times'],
        correct: 'The transaction triggered 47 contract-to-contract calls during execution',
        explain: 'Internal transactions are contract-to-contract calls that happen within a single transaction\'s execution. A complex DeFi exploit might have 50+ internal transactions representing each step of the attack.',
      },
      {
        prompt: 'A transaction has gas price 180 Gwei when the network average is 15 Gwei. What does this 12x premium suggest?',
        options: ['The sender made a mistake and overpaid', 'The sender needed priority block inclusion — urgency, bot activity, or front-running', 'High gas always means high value transaction', 'The network was congested for all users'],
        correct: 'The sender needed priority block inclusion — urgency, bot activity, or front-running',
        explain: 'Gas price is a bid for block position. 12x normal rates indicates someone needed their transaction included before others could respond — common in hacks racing against white-hat bots, MEV, or time-sensitive exploit windows.',
      },
      {
        prompt: 'A "Failed" transaction appears on Etherscan. The analyst ignores it. What might they miss?',
        options: ['Nothing — failed transactions have no effect', 'The Input Data still shows what function was called and with what parameters — revealing intent', 'Failed transactions are hidden after 24 hours', 'Only the gas fee, which is irrelevant'],
        correct: 'The Input Data still shows what function was called and with what parameters — revealing intent',
        explain: 'Failed transactions are permanent and fully readable. Input Data shows exactly what was attempted — including calls to malicious contracts. A failed "setApproval" call to a drainer contract reveals both the target and the attacker\'s contract address.',
      },
    ],
  },

  // ── Lab 1, Lesson 3: Anatomy of a Transaction ────────────────────────────
  txAnatomy: {
    key: 'txAnatomy', title: 'Transaction Field Identifier', icon: '🔬',
    subtitle: 'Match each transaction field to what investigators use it for',
    type: 'match',
    pairs: [
      { left: 'Timestamp', right: 'Build timelines and identify timezone signatures' },
      { left: 'Gas Price', right: 'Detect urgency, bot activity, or front-running' },
      { left: 'Input Data', right: 'Identify which contract function was called' },
      { left: 'Internal Transactions', right: 'See contract-to-contract calls hidden from the main view' },
      { left: 'Tokens Transferred', right: 'Find the real value movement when ETH value shows zero' },
    ],
  },

  txReadDrill: {
    key: 'txReadDrill', title: 'Transaction Read Drill', icon: '⚡',
    subtitle: 'Given transaction data, identify the correct interpretation',
    type: 'mcq',
    questions: [
      {
        prompt: 'From: 0xHACKER | To: 0xVAULT | Value: 0 ETH | Tokens Transferred: Vault → Hacker: 18,000,000 USDC | Hacker → FlashPool: 17,800,000 USDC\n\nWhat net amount did the hacker keep?',
        isCode: true,
        options: ['18,000,000 USDC', '17,800,000 USDC', '200,000 USDC', '0 USDC — both transfers cancel out'],
        correct: '200,000 USDC',
        explain: 'Hacker received 18M USDC from the vault and repaid 17.8M to the flash loan pool. Net kept: 18M − 17.8M = 200,000 USDC. This is the classic flashloan exploit pattern — borrow, exploit, repay, pocket the difference.',
      },
      {
        prompt: 'A wallet was created 48 hours before an attack. It received 0.5 ETH from 0xPREP_WALLET, then made the attack transaction. What does the 48-hour creation timing suggest?',
        options: ['Nothing unusual — new wallets are created constantly', 'Planned operation — the attacker created the wallet specifically for this attack', 'The wallet is owned by an exchange', 'The attacker is a beginner who just started using crypto'],
        correct: 'Planned operation — the attacker created the wallet specifically for this attack',
        explain: 'A wallet created days before an attack with a clear funding trail from a preparation wallet is a strong indicator of a planned, deliberate operation — not an opportunistic exploit. This is attack preparation evidence.',
      },
      {
        prompt: 'Input Data shows function: "exploit(uint256 amount, address target)"\n\nWhat does this function name tell you?',
        isCode: true,
        options: ['Nothing — function names are auto-generated', 'The contract was written specifically to attack — legitimate contracts do not have functions named "exploit"', 'The contract is a legitimate DeFi protocol with an "exploit" feature', 'The function name is encrypted and unreadable'],
        correct: 'The contract was written specifically to attack — legitimate contracts do not have functions named "exploit"',
        explain: 'Function names in contract code are chosen by the developer. A function literally called "exploit" was deliberately named by someone writing malicious code. This is direct evidence of malicious intent in the contract design.',
      },
    ],
  },

  // ── Lab 2, Lesson 1: Linking Wallets ─────────────────────────────────────
  walletLinkingTechniques: {
    key: 'walletLinkingTechniques', title: 'Wallet Linking Techniques', icon: '🔗',
    subtitle: 'Match each linking technique to its description',
    type: 'match',
    pairs: [
      { left: 'Shared funding source', right: 'Both wallets funded from the same origin wallet' },
      { left: 'Timing fingerprint', right: 'Consistent activity hours suggest same timezone operator' },
      { left: 'Gas refill pattern', right: 'A master wallet repeatedly tops up multiple operational wallets' },
      { left: 'Shared contract interaction', right: 'Both wallets called the same obscure non-standard contract' },
      { left: 'Dust correlation', right: 'Tiny amounts sent to suspected linked wallets to confirm cluster' },
    ],
  },

  clusterBuildDrill: {
    key: 'clusterBuildDrill', title: 'Cluster Evidence Strength', icon: '🧩',
    subtitle: 'Rate the strength of each wallet-linking evidence type',
    type: 'mcq',
    questions: [
      {
        prompt: 'Two wallets were funded from the exact same origin wallet on different days, both received exactly 0.1 ETH, and both sent funds to Tornado Cash within 1 hour of each receipt. How strong is this cluster link?',
        options: ['Weak — coincidence is possible', 'Moderate — one factor is compelling', 'Strong — three independent corroborating patterns all pointing the same direction', 'Definitive proof of same owner'],
        correct: 'Strong — three independent corroborating patterns all pointing the same direction',
        explain: 'Shared funding source + identical amounts + identical behaviour pattern = three independent corroborating factors. Each alone is weak; together they build a strong probabilistic case. Not definitive (definitive requires off-chain confirmation) but strong enough to warrant serious investigation.',
      },
      {
        prompt: 'Wallet 0xX always transacts between 01:00–06:00 UTC, never on weekends. Wallet 0xY shows the same exact pattern. What timezone does this suggest?',
        options: ['UTC timezone — active during business hours', 'East Asia (UTC+8 to +9) — 01:00–06:00 UTC = 09:00–14:00 CST/JST', 'US East Coast — those are peak US hours', 'Europe — those are European morning hours'],
        correct: 'East Asia (UTC+8 to +9) — 01:00–06:00 UTC = 09:00–14:00 CST/JST',
        explain: '01:00–06:00 UTC corresponds to 09:00–14:00 in UTC+8 (China, Singapore) or 10:00–15:00 in UTC+9 (Japan, Korea). This is classic East Asian business hours. Combined with no weekend activity, this suggests a professional operator in East Asia. This technique was used in Lazarus Group attribution.',
      },
      {
        prompt: 'You trace a hacker\'s cluster and find that wallet 0xGAS_REFILL sent ETH to 12 different operational wallets over 6 months, always in amounts of exactly 0.05 ETH. What is 0xGAS_REFILL?',
        options: ['An exchange hot wallet doing automated distributions', 'The master controller wallet — it manages gas for the entire operational cluster', 'A DeFi protocol paying gas rebates', 'An airdrop distribution contract'],
        correct: 'The master controller wallet — it manages gas for the entire operational cluster',
        explain: 'Consistent gas refills in identical amounts to a set of operational wallets is the signature of a master controller. Someone controlling 12 wallets must keep them funded for gas — they do it from a central management wallet. 0xGAS_REFILL is now the most important investigation target.',
      },
    ],
  },

  // ── Lab 2, Lesson 2: Investigation Tools ─────────────────────────────────
  toolSelection: {
    key: 'toolSelection', title: 'Investigation Tool Router', icon: '🛠️',
    subtitle: 'Match each investigation task to the best tool',
    type: 'match',
    pairs: [
      { left: 'Visual fund flow across 15 wallets', right: 'Breadcrumbs or MetaSleuth' },
      { left: 'Check if a wallet belongs to a known entity', right: 'Arkham Intelligence' },
      { left: 'Find ALL wallets that received from 0xHACKER', right: 'Dune Analytics (SQL query)' },
      { left: 'Detailed transaction history for one address', right: 'Etherscan' },
      { left: 'Multi-chain fund flow across Ethereum + Polygon', right: 'MetaSleuth' },
    ],
  },

  toolDrill: {
    key: 'toolDrill', title: 'Tool Selection Drill', icon: '⚙️',
    subtitle: 'Choose the correct tool for each investigation scenario',
    type: 'mcq',
    questions: [
      {
        prompt: 'You need to check 500 wallets against a known phishing contract. Manual Etherscan checking would take 8 hours. What is the fastest approach?',
        options: ['Etherscan manual — most accurate', 'Arkham — it bulk-checks wallets automatically', 'Python + Etherscan API — automated loop, 500 × 0.2s = ~100 seconds', 'MetaSleuth — drag all 500 addresses in'],
        correct: 'Python + Etherscan API — automated loop, 500 × 0.2s = ~100 seconds',
        explain: '500 wallets × 0.2 second API rate limit = 100 seconds automated vs 8+ hours manual. The Etherscan API is free and returns the same data as the website. Python automation is the correct tool for bulk checking.',
      },
      {
        prompt: 'An Arkham search shows a wallet labelled "Binance: Deposit Address #44521". What does this immediately tell investigators?',
        options: ['The wallet is safe — Binance is a regulated exchange', 'The wallet is KYC-linked — Binance holds verified identity data that law enforcement can subpoena', 'Binance controls this wallet — the funds belong to Binance', 'The label may be wrong — Arkham is not reliable'],
        correct: 'The wallet is KYC-linked — Binance holds verified identity data that law enforcement can subpoena',
        explain: 'A Binance deposit address requires KYC to create. Binance knows who owns this address. Law enforcement can subpoena that information. For investigators, a CEX label on any wallet in the fund flow is the single most important finding — it creates a legal path to real-world identity.',
      },
    ],
  },

  // ── Lab 3, Lesson 1: Tornado Cash ────────────────────────────────────────
  tornadoCashMechanics: {
    key: 'tornadoCashMechanics', title: 'Tornado Cash Mechanics', icon: '🌪️',
    subtitle: 'Match each Tornado Cash concept to its correct definition',
    type: 'match',
    pairs: [
      { left: 'Anonymity set', right: 'Number of other depositors a withdrawal could be confused with' },
      { left: 'Denomination pool', right: 'Fixed-size deposit bucket — 0.1, 1, 10, or 100 ETH' },
      { left: 'Timing correlation', right: 'Matching deposit and withdrawal timing to narrow the set' },
      { left: 'Opsec error', right: 'Post-withdrawal behaviour that re-links the clean address' },
      { left: 'Zero-knowledge proof', right: 'Cryptographic proof of deposit note without revealing which deposit' },
    ],
  },

  tornadoDrill: {
    key: 'tornadoDrill', title: 'Tornado Cash Tracing Drill', icon: '🔍',
    subtitle: 'Apply Tornado Cash analysis to investigation scenarios',
    type: 'mcq',
    questions: [
      {
        prompt: 'A hacker deposits 500 ETH into Tornado Cash using the 100 ETH pool (5 deposits). The 100 ETH pool has 30 other active depositors in that period. What is the anonymity set per withdrawal?',
        options: ['500 (total ETH deposited)', '5 (number of the hacker\'s deposits)', '31 (hacker + 30 others)', '30 (other depositors only)'],
        correct: '31 (hacker + 30 others)',
        explain: 'The anonymity set is the total number of depositors who could be responsible for any given withdrawal: the hacker plus the 30 other depositors = 31. A withdrawal from this pool is one of 31 possible sources. This is a small anonymity set — much more traceable than the 10 ETH pool with thousands of depositors.',
      },
      {
        prompt: 'A hacker correctly uses Tornado Cash, then sends ETH from their "clean" withdrawal address to fund the same gas management wallet they\'ve used for 2 years. What happened?',
        options: ['Nothing — the Tornado link is broken permanently', 'The Tornado anonymity is defeated — the clean address is now linked to known infrastructure via the gas wallet', 'Only the gas wallet is now suspicious', 'The hacker needs to use Tornado again to fix this'],
        correct: 'The Tornado anonymity is defeated — the clean address is now linked to known infrastructure via the gas wallet',
        explain: 'This is the most common Tornado Cash failure. The cryptography worked — Tornado broke the direct link. But the hacker\'s own behaviour after withdrawal rebuilt the link by connecting the clean address to their known infrastructure. This opsec error is how most Tornado Cash users are ultimately traced.',
      },
      {
        prompt: 'Which denomination provides better anonymity: 0.1 ETH pool (2,000 active depositors) or 100 ETH pool (25 active depositors)?',
        options: ['100 ETH — larger amounts mean more serious users', '0.1 ETH — 2,000 depositors creates a much larger anonymity set', 'Both are equal — denomination doesn\'t affect anonymity', '100 ETH — law enforcement focuses on small amounts'],
        correct: '0.1 ETH — 2,000 depositors creates a much larger anonymity set',
        explain: 'Counter-intuitively, smaller denomination pools provide better anonymity because more people use them. A withdrawal from a 2,000-person pool is 1/2,000 probability; from a 25-person pool it\'s 1/25. Sophisticated launderers use the highest-volume pools, not the largest denominations.',
      },
    ],
  },

  // ── Lab 3, Lesson 2: Cross-Chain Tracing ─────────────────────────────────
  bridgeTypes: {
    key: 'bridgeTypes', title: 'Bridge Type Identifier', icon: '🌉',
    subtitle: 'Match each bridge type to its traceability characteristic',
    type: 'match',
    pairs: [
      { left: 'Lock-and-mint bridge', right: 'Most traceable — 1:1 deposit/withdrawal matching in contract logs' },
      { left: 'Liquidity bridge', right: 'Funds pooled — source/destination in event logs but not 1:1' },
      { left: 'Centralised bridge (CEX)', right: 'Off-chain link — requires exchange cooperation to trace' },
      { left: '7-day fraud window', right: 'Investigator advantage — time to alert destination chain ecosystem' },
      { left: 'Instant bridge', right: 'Speed advantage for hacker — investigators must act within minutes' },
    ],
  },

  crossChainDrill: {
    key: 'crossChainDrill', title: 'Cross-Chain Trace Drill', icon: '⛓️',
    subtitle: 'Apply cross-chain investigation logic to real scenarios',
    type: 'mcq',
    questions: [
      {
        prompt: 'A hacker moves 1,000 ETH via the official Arbitrum bridge which has a 7-day withdrawal delay. What is the investigative opportunity?',
        options: ['None — the bridge crossing breaks traceability', '7 days to alert Arbitrum DEXs and CEXs, prepare monitoring, and coordinate before funds become spendable', 'The funds can be reversed during the 7-day window', 'Only 1 day — the delay is 7 days total but investigative window is shorter'],
        correct: '7 days to alert Arbitrum DEXs and CEXs, prepare monitoring, and coordinate before funds become spendable',
        explain: 'The 7-day fraud-proof window is an investigator\'s advantage. Funds are locked and cannot be spent on Arbitrum during this time. This gives a full week to alert all Arbitrum ecosystem participants, contact CEX compliance teams, and set up monitoring — before the hacker can move a single token on the destination chain.',
      },
      {
        prompt: 'You are tracing funds from Ethereum through Arbitrum to BNB Chain. Which tool combination is correct?',
        options: ['Etherscan for all three — it covers all EVM chains', 'Etherscan + Arbiscan + BscScan for chain detail, MetaSleuth for the cross-chain overview', 'MetaSleuth only — it replaces all chain-specific explorers', 'Dune Analytics — it queries all chains simultaneously'],
        correct: 'Etherscan + Arbiscan + BscScan for chain detail, MetaSleuth for the cross-chain overview',
        explain: 'Each EVM chain has its own explorer: Etherscan (Ethereum), Arbiscan (Arbitrum), BscScan (BNB Chain). Chain-specific explorers give granular transaction detail. MetaSleuth provides the cross-chain visual overview. Professional investigators use both — neither alone covers the full picture.',
      },
    ],
  },

  // ── Lab 4, Lesson 1: OSINT Fundamentals ──────────────────────────────────
  osintSources: {
    key: 'osintSources', title: 'OSINT Source Mapper', icon: '🕵️',
    subtitle: 'Match each OSINT source to its primary investigative value',
    type: 'match',
    pairs: [
      { left: 'GitHub profile', right: 'Developer identity — often lists wallet addresses and real name' },
      { left: 'WHOIS lookup', right: 'Domain registrant email — searchable across platforms' },
      { left: 'Twitter/X', right: 'Public statements, project links, and username correlation' },
      { left: 'ENS name', right: 'Self-identified wallet — person publicly linked address to a name' },
      { left: 'LinkedIn', right: 'Real name and employment — especially useful for project founders' },
    ],
  },

  osintEvidenceDrill: {
    key: 'osintEvidenceDrill', title: 'OSINT Evidence Strength', icon: '📊',
    subtitle: 'Rate the strength of each OSINT attribution finding',
    type: 'mcq',
    questions: [
      {
        prompt: 'A GitHub profile lists "My deployment wallet: 0xDEV" in the README. That wallet deployed the malicious contract. How strong is this attribution?',
        options: ['Weak — GitHub profiles can be faked', 'Strong direct attribution — the developer publicly self-identified their wallet, creating an unambiguous on-chain to identity link', 'Moderate — need a second source to confirm', 'Invalid — self-reported information is not evidence'],
        correct: 'Strong direct attribution — the developer publicly self-identified their wallet, creating an unambiguous on-chain to identity link',
        explain: 'Public self-identification of a wallet address is the strongest possible OSINT link. The person stated their wallet, you traced their wallet to the crime. No inference is required. This is equivalent to finding the defendant\'s business card at the crime scene.',
      },
      {
        prompt: 'You have 4 independent OSINT data points all pointing to "Alex Chen": GitHub username match, Twitter profile photo match, ENS name resolution, and WHOIS domain email match. Your attribution confidence should be:',
        options: ['25% — one data point per source', 'Around 95%+ — four independent corroborating sources pointing to the same identity', '50% — it\'s still possible to be wrong', '100% — four sources is definitive proof'],
        correct: 'Around 95%+ — four independent corroborating sources pointing to the same identity',
        explain: 'Attribution confidence compounds with each independent corroborating source. Four independent paths to the same identity — each sourced from a different platform with different data types — creates very high confidence. Not 100% (that requires legal confirmation like KYC data) but high enough to warrant responsible disclosure.',
      },
      {
        prompt: 'Before naming someone publicly in an investigation, the professional standard requires:',
        options: ['100% certainty — never publish without absolute proof', 'A minimum of 80%+ confidence from multiple independent sources AND 24-48 hours private disclosure before publication', 'Only one strong piece of evidence if it\'s compelling enough', 'Law enforcement confirmation first'],
        correct: 'A minimum of 80%+ confidence from multiple independent sources AND 24-48 hours private disclosure before publication',
        explain: 'The professional community standard (as demonstrated by ZachXBT) is: strong multi-source evidence (80%+ confidence), a clear confidence statement in the publication, and 24-48 hours private notice to the named party before going public. This protects the innocent while still enabling timely disclosure.',
      },
    ],
  },

  // ── Lab 5, Lesson 1: Etherscan API ───────────────────────────────────────
  apiBasics: {
    key: 'apiBasics', title: 'Etherscan API Fundamentals', icon: '🔌',
    subtitle: 'Match each API concept to its correct definition',
    type: 'match',
    pairs: [
      { left: 'Rate limit', right: 'Max 5 calls/second on free tier — use time.sleep(0.2)' },
      { left: 'txlist endpoint', right: 'Returns complete transaction history for a wallet address' },
      { left: 'tokentx endpoint', right: 'Returns ERC-20 token transfer history for a wallet' },
      { left: 'HTTP 429', right: 'Too Many Requests — you exceeded the rate limit' },
      { left: 'status: "0"', right: 'API returned no results — wallet may have no transactions' },
    ],
  },

  apiCodeDrill: {
    key: 'apiCodeDrill', title: 'API Script Logic', icon: '🐍',
    subtitle: 'Predict the output or identify the fix for each code snippet',
    type: 'mcq',
    questions: [
      {
        prompt: 'for wallet in wallets:\n    response = requests.get(url).json()\n    # No delay between calls\n    # 500 wallets\n\nThis script throws HTTP 429 after ~20 calls. Fix?',
        isCode: true,
        options: ['Change requests.get to requests.post', 'Add time.sleep(0.2) inside the loop after each call', 'Reduce wallets list to 100', 'Use a different API endpoint'],
        correct: 'Add time.sleep(0.2) inside the loop after each call',
        explain: 'HTTP 429 = rate limit exceeded. Etherscan free tier = 5 calls/second maximum. Without a delay, a loop fires calls as fast as Python can execute — far exceeding the limit. time.sleep(0.2) = 5 calls/second maximum, exactly at the limit.',
      },
      {
        prompt: 'value = tx["value"]  # from Etherscan API\nprint(value)  # outputs: "18000000000000000000"\n\nWhat is this value in ETH?',
        isCode: true,
        options: ['18,000,000,000 ETH', '18 ETH (divide by 1e18 — values are in Wei)', '0.000000018 ETH', '18,000 ETH'],
        correct: '18 ETH (divide by 1e18 — values are in Wei)',
        explain: 'Ethereum values in the API are in Wei, the smallest unit. 1 ETH = 1,000,000,000,000,000,000 Wei = 1e18 Wei. To convert: 18000000000000000000 / 1e18 = 18 ETH. Always divide API value fields by 1e18 for ETH amounts.',
      },
    ],
  },

  // ── Lab 5, Lesson 2: Dune Analytics ──────────────────────────────────────
  duneSQLBasics: {
    key: 'duneSQLBasics', title: 'Dune Analytics SQL Basics', icon: '🗃️',
    subtitle: 'Match each Dune table to what it contains',
    type: 'match',
    pairs: [
      { left: 'ethereum.transactions', right: 'Every ETH transaction — from, to, value, timestamp, hash' },
      { left: 'ethereum.token_transfers', right: 'Every ERC-20 transfer — contract, from, to, value, timestamp' },
      { left: 'ethereum.logs', right: 'Every smart contract event — raw topic data for advanced queries' },
      { left: 'SELECT DISTINCT "to"', right: 'Returns unique recipient addresses without duplicates' },
      { left: 'EXISTS subquery', right: 'Find rows where a related condition is true in another table' },
    ],
  },

  duneSQLDrill: {
    key: 'duneSQLDrill', title: 'Dune SQL Query Builder', icon: '💻',
    subtitle: 'Identify the correct SQL for each investigation task',
    type: 'mcq',
    questions: [
      {
        prompt: 'Find all unique wallets that received ETH from 0xHACKER after Jan 1 2024.\n\nWhich query is correct?',
        isCode: true,
        options: [
          'SELECT "from" FROM ethereum.transactions WHERE "to" = \'0xHACKER\' AND block_time > \'2024-01-01\'',
          'SELECT DISTINCT "to" FROM ethereum.transactions WHERE "from" = \'0xHACKER\' AND block_time > \'2024-01-01\'',
          'SELECT * FROM ethereum.transactions WHERE value > 0 AND block_time > \'2024-01-01\'',
          'SELECT "to" FROM ethereum.token_transfers WHERE "from" = \'0xHACKER\'',
        ],
        correct: 'SELECT DISTINCT "to" FROM ethereum.transactions WHERE "from" = \'0xHACKER\' AND block_time > \'2024-01-01\'',
        explain: 'SELECT "to" gets recipient addresses. DISTINCT removes duplicates if the hacker sent to the same address multiple times. WHERE "from" = 0xHACKER filters for outgoing transactions from the hacker. The first option has from/to swapped — it would find who sent TO the hacker.',
      },
      {
        prompt: 'What is the key difference between using the Etherscan API vs Dune Analytics?',
        options: [
          'Etherscan is free; Dune requires payment',
          'Etherscan API checks addresses you already know; Dune discovers unknown addresses matching a behaviour pattern',
          'Dune is faster; Etherscan is more accurate',
          'Etherscan covers all chains; Dune covers only Ethereum',
        ],
        correct: 'Etherscan API checks addresses you already know; Dune discovers unknown addresses matching a behaviour pattern',
        explain: 'Etherscan API = lookup tool. You provide an address, it returns data. Dune = search tool. You describe a pattern, it finds all addresses matching it across all historical data. For discovery ("find all wallets that did X") you need Dune. For depth on a known address, use Etherscan.',
      },
    ],
  },

  // ── Lab 6, Lesson 1: Writing Reports ─────────────────────────────────────
  reportStructure: {
    key: 'reportStructure', title: 'Investigation Report Structure', icon: '📝',
    subtitle: 'Put the investigation report sections in the correct order',
    type: 'match',
    pairs: [
      { left: 'First section written', right: 'Executive summary — 3 sentences covering who, what, how much' },
      { left: 'Always included visually', right: 'Fund flow diagram from Breadcrumbs or MetaSleuth' },
      { left: 'Required before naming anyone', right: 'Confidence level with stated evidence chain' },
      { left: 'Never omitted', right: 'Limitations section — what you don\'t know and what might change conclusions' },
      { left: 'Final section', right: 'Victim resources — FBI IC3, FTC, exchange contact points' },
    ],
  },

  disclosureDrill: {
    key: 'disclosureDrill', title: 'Responsible Disclosure Decisions', icon: '⚖️',
    subtitle: 'Choose the correct disclosure action for each scenario',
    type: 'mcq',
    questions: [
      {
        prompt: 'You have 80% confidence an individual is responsible for a $2M rug pull. You have given them 24 hours private notice and they did not respond. What do you do?',
        options: [
          'Wait until 100% confidence before publishing',
          'Publish with confidence clearly stated as 80%, evidence chain documented, limitations noted',
          'Publish immediately without confidence caveats — 80% is enough',
          'Do nothing — 80% is too low to publish anything',
        ],
        correct: 'Publish with confidence clearly stated as 80%, evidence chain documented, limitations noted',
        explain: 'Professional investigators publish well-evidenced findings below 100% confidence, with the confidence level clearly stated. The evidence chain lets readers evaluate independently. Stating limitations demonstrates intellectual honesty. Waiting for 100% certainty would mean almost nothing ever gets published — and more victims would be harmed in the meantime.',
      },
      {
        prompt: 'You publish an investigation. Someone DMs with new evidence that could exonerate the named individual. What do you do?',
        options: [
          'Ignore it — the investigation is published',
          'Verify the evidence immediately; if valid, post a public update or retraction explaining what changed',
          'Delete the investigation and pretend it never happened',
          'Demand video proof before considering the evidence',
        ],
        correct: 'Verify the evidence immediately; if valid, post a public update or retraction explaining what changed',
        explain: 'Investigations are the best available analysis at a point in time — not permanent verdicts. New evidence that changes conclusions must be addressed publicly. A professional retraction increases credibility — it demonstrates that truth matters more than being right. Ignoring exculpatory evidence is both unethical and legally dangerous.',
      },
      {
        prompt: 'A lawyer sends a cease-and-desist demanding you remove your investigation. Your evidence is solid and well-documented. What is the correct first response?',
        options: [
          'Remove the investigation immediately to avoid legal risk',
          'Consult a lawyer familiar with crypto and defamation law before responding or acting',
          'Post about the legal threat publicly to show you won\'t back down',
          'Contact the named individual directly to negotiate',
        ],
        correct: 'Consult a lawyer familiar with crypto and defamation law before responding or acting',
        explain: 'Legal threats are a common intimidation tactic in crypto investigations. A well-evidenced, confidence-rated investigation with responsible disclosure is the best legal defence against defamation claims. Do not remove, respond, or escalate before getting legal advice. Consulting a lawyer first is always the correct first step.',
      },
    ],
  },

};
