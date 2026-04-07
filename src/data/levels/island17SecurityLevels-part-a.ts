// ⚡ Sifter SkillUp — Security & Research (Island 17, Levels 231–240)
// Part A of 2 — Levels 231–235
//
// Chain: islandId=17
// Prerequisite: Alt-Chain Ecosystems (Island 14)
// Primary Simulators: rugcheck, onchainAnalysis, mevProtect
// NOTE: 10 levels only (shorter island)

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 231 — Address Poisoning: Advanced Mechanics and Prevention
// ─────────────────────────────────────────────────────────────────────────────

const L231: IslandLevel = {
  id: 231, mechanic: 'rugpull', tier: 'pro',
  topic: 'Address Poisoning — Advanced Mechanics and Prevention',

  explanation: `
In August 2023, a trader sent $20 million in USDT to an address they had copied from their transaction history. The address matched the first 4 and last 4 characters of their intended recipient — but the middle characters were different. The attacker had seeded that look-alike address into their history with a $0 dust transaction days earlier. The trader lost everything.

You covered address poisoning basics in Island 3. At the advanced level, the attack is industrialised and the defences are more systematic.

Modern address poisoning bots monitor the mempool in real-time. When they detect an outgoing transaction, they extract the sender and recipient addresses, generate a vanity address matching the first 4 and last 4 hex characters of the recipient, and send a dust transaction back — all within seconds. The generated address appears identical in wallet UIs that truncate addresses (0x1234...5678 format). The bot repeats this for millions of wallets continuously.

Clipboard hijacking malware is the second-layer attack: malware silently replaces whatever address you copy the instant it reaches your clipboard. You visually verify the correct address before copying — then paste the malicious one. Defeats visual verification done pre-copy.

Hardware wallet address book (the definitive fix): Ledger and Trezor both support named address book entries stored in the device itself. When sending to a saved contact, the hardware wallet displays the device-stored address — bypassing the clipboard and the host computer entirely. Both poisoning and clipboard hijacking are defeated in one step.

QR code transfer workflow: for high-value transactions, the recipient generates a QR code directly from their wallet. You scan it. Address flows camera → wallet, never touching the text clipboard. No copy-paste attack surface at all.

Multi-confirmation rule: for any transfer above $5,000, verify the complete address character-by-character on the hardware wallet's own display before confirming — not on the browser or computer screen, which malware can modify.
  `.trim(),

  fact: 'Address poisoning bots auto-generate look-alike vanity addresses within seconds of any transaction. Clipboard hijacking malware replaces addresses at paste time. Defences: hardware wallet address book (bypasses clipboard entirely), QR code transfer (no clipboard), character-by-character verification on device display.',
  plain: 'Attackers generate addresses matching yours in the first and last characters, plant them in your history, and wait for you to copy-paste the wrong one. Malware can also swap addresses in your clipboard silently. Fix: save addresses in your hardware wallet\'s address book — when you send, the device fills the address itself, no clipboard involved.',
  stars: [560, 690, 860], target: 860, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[High-value user, hardware wallet address book setup]',
      scenario: 'Amara regularly sends large USDC payments to three business partners. She has previously been copying addresses from her transaction history each time. She wants to eliminate the poisoning risk permanently.',
      outcome: 'Setup on Ledger Live: navigate to Accounts → Send → Add to Address Book → paste each partner\'s verified address (verified by phone call, ENS reverse lookup, and email confirmation in parallel) → save with a name ("Alice Business", "Bob Supplier"). From now on: when sending, select from address book — the Ledger hardware device fills the address field directly from its own secure storage. The host computer\'s clipboard is never involved. Even if Amara\'s MacBook is infected with clipboard-hijacking malware, the malware has no opportunity to intercept the address flow. One-time setup, permanent protection for those three addresses.',
    },
    {
      contextTag: '[Developer, identifying a clipboard hijacking infection]',
      scenario: 'Marcus is testing a payment flow. He copies his test wallet address (0x1234...ABCD) and pastes it into a form. He notices the pasted address is 0x1234...XY99 — different last characters. He investigates.',
      outcome: 'This is live clipboard hijacking malware. Immediate steps: (1) Do not complete any transaction on this machine. (2) Disconnect from the internet (stops the malware phoning home). (3) Do not enter any seed phrases or private keys on this device ever again — the malware likely also keylogging. (4) On a clean device, move any funds from wallets that touched this machine to new wallets whose seed phrases were generated elsewhere. (5) Factory reset or reformat the infected machine before any future use. Post-incident: trace how the malware arrived — likely a malicious npm package, a trojanised app, or a browser extension. Marcus checks his recently installed packages and extensions.',
    },
    {
      contextTag: '[Security educator, QR code transfer workflow]',
      scenario: 'Priya is teaching a crypto security workshop. A participant asks: "What is the safest possible way to send $50,000 between two hardware wallets without any risk of address substitution?"',
      outcome: 'Gold standard workflow: (1) On the receiving hardware wallet (Ledger/Trezor), navigate to the receive screen — the device generates and displays a QR code of the receiving address on the device screen. (2) The sender scans that QR code directly with their sending wallet app. (3) The sending hardware wallet displays the scanned address on its own screen — verify it matches what you saw on the receiving device. (4) Confirm the send. In this workflow: the address is generated by hardware, transmitted optically (QR), received by hardware, verified on hardware. The address never exists as a text string in any clipboard, browser, or host OS. Even a fully compromised computer cannot intercept or substitute the address. This is the workflow used by Bitcoin OGs transferring significant cold storage.',
    },
  ],

  keyTakeaway: 'Address poisoning is industrialised and automated — the real defence is eliminating the copy-paste step entirely, either via hardware wallet address books (pre-verified contacts stored on-device) or QR code transfer (optical transmission bypassing all clipboard attack surfaces).',

  guidedPractice: [
    {
      question: 'Why does clipboard hijacking malware defeat address verification done before copying?',
      options: [
        'Because the malware encrypts your clipboard, making verification impossible',
        'You verify the correct address visually before copying, but the malware replaces the clipboard contents at the moment of copy — so the correct address never reaches the clipboard; what you paste is the malicious substitute', // ✓
        'Because clipboard hijacking only activates during blockchain transactions, not during normal verification',
        'The malware modifies the source page to show the malicious address before you copy',
      ],
      correct: 1,
      hint: 'When exactly does the malware intervene — before you copy, or at the moment of copying?',
      explanation: 'The timing of clipboard hijacking is what makes pre-copy verification useless. You look at "0x742d35Cc6634C0532925a3b844Bc9e7595f6E9a3" on screen, confirm it is correct, press Ctrl+C — and at that exact moment, the malware intercepts the copy operation and writes its own address ("0x742d35Cc6634C0532925a3b844Bc9e7595f6DEAD") to the clipboard instead. When you paste, you paste the malicious address. Your verification was of the correct address, but you never actually copied that address. This is why hardware wallet address books are the correct defence: the address flow goes directly from device memory to the transaction field, bypassing the clipboard entirely.',
    },
    {
      question: 'An address poisoning bot generates "0x1a2b3c...f4e5d6" to poison transactions to "0x1a2b3c...f4e5d6". Wait — those look identical. What character positions does the attack actually change?',
      options: [
        'The attacker changes random characters throughout the middle of the address',
        'The attacker keeps the first 6 and last 6 characters identical to the target, changing only the middle 28 characters — which are hidden by "..." in standard wallet truncation, making the addresses visually indistinguishable in any UI that abbreviates', // ✓
        'The attacker only changes one character in the middle, relying on users not reading carefully',
        'The attacker changes the last 4 characters, which most users never check',
      ],
      correct: 1,
      hint: 'How does wallet UI truncation display an address like 0x1a2b3c4d5e...a1b2c3d4e5f6?',
      explanation: 'Standard wallet UI truncation: "0x1a2b3c...d4e5f6" — showing the first 6 characters, an ellipsis, and the last 6. This means 28 of the 40 hex characters (the middle section) are completely hidden. Address poisoning exploits exactly this: vanity address generators are used to create addresses that match the first 6 and last 6 characters of the target. The middle 28 can be anything. The poisoned address displays identically in every major wallet UI. This is not a bug in any specific wallet — it is an inherent property of address truncation that any wallet using the 0x1234...5678 format is vulnerable to. Full-address verification on a hardware wallet display (which shows all 42 characters) defeats it.',
    },
    {
      question: 'You need to send 3 ETH to a new contact. You have their address from an email. What is the safest verification workflow before saving it to your hardware wallet address book?',
      options: [
        'Copy-paste the address directly from the email — emails are secure channels',
        'Triple-verify via at least two independent channels: call the contact to read back the full address verbally, cross-reference with their ENS reverse lookup if they have one, and have them send it again via a different channel (Signal, not same email). Only save to address book after all three match.', // ✓
        'Verify the first and last 4 characters match what the contact told you verbally',
        'Send a $1 test transaction first — if the contact confirms receipt, the address is correct',
      ],
      correct: 1,
      hint: 'Email can be intercepted. Verbal read-back is independent. What if the contact\'s email was compromised when they sent the address?',
      explanation: 'Multi-channel verification is the gold standard for new address setup. Email alone: if the contact\'s email was compromised (or the email was intercepted in transit), the attacker could have replaced the address before you received it. Verbal read-back (phone call, video call): the contact reads their address aloud character-by-character — this is a completely independent channel from email. ENS reverse lookup: if they have an ENS name, you can independently look up their associated address. Second-channel send (Signal/Telegram): asking them to resend via a different app means an attacker would need to compromise two separate services. The $1 test transaction (option 4) is useful but incomplete: it confirms you reached the right address once, but does not protect against an address substitution that happens after the test.',
    },
    {
      question: 'What makes the QR code transfer workflow resistant to both address poisoning and clipboard hijacking simultaneously?',
      options: [
        'QR codes are encrypted, so attackers cannot read or modify the address data',
        'The address is transmitted optically from the receiving hardware device directly to the scanning app — the address never exists as a text string in any OS clipboard or browser where malware could intercept or substitute it', // ✓
        'QR codes display the full address visually, making truncation-based deception impossible',
        'Hardware wallets verify QR code addresses against a blockchain registry before accepting them',
      ],
      correct: 1,
      hint: 'Trace the path of the address: hardware device → optical transmission → scanning app. At what point could clipboard malware intercept?',
      explanation: 'Clipboard hijacking requires the address to pass through the OS clipboard. Address poisoning requires the address to be copied from a text source. In the QR workflow: the receiving hardware wallet generates the address internally and displays it as a QR code. The sending app\'s camera captures it optically. The sending hardware wallet reads the decoded address directly into its signing flow. The address exists as a text string only inside the sending hardware wallet\'s secure element — not on the host computer, not in the OS clipboard, not in a browser text field. There is no point in this flow where clipboard-resident malware can intercept. Even a fully compromised host computer cannot modify an address traveling camera→hardware wallet.',
    },
    {
      question: 'Your hardware wallet displays the full destination address on its screen before you confirm a transaction. Your computer screen shows a different address. What should you do?',
      options: [
        'Trust the computer screen — the hardware wallet display may have a rendering bug',
        'Trust the hardware wallet display absolutely and investigate the discrepancy — the hardware wallet generates its display from its own verified firmware, while the computer screen can be modified by malware. The discrepancy proves active malware on your computer.', // ✓
        'Send a small test amount using the computer-displayed address to determine which is correct',
        'Cancel the transaction and reinstall the hardware wallet firmware to fix the display bug',
      ],
      correct: 1,
      hint: 'Which display can malware control — the computer screen or the hardware wallet\'s own screen?',
      explanation: 'This scenario describes a transaction tampering attack: malware on the host computer has modified the address shown in the browser/wallet app, but cannot reach the hardware wallet\'s own display (which is driven by the device\'s own firmware and secure element). The hardware wallet shows what you are actually about to sign. The computer screen shows what the malware wants you to believe you are signing. The discrepancy is definitive evidence of active malware. Correct response: (1) Reject the transaction on the hardware wallet. (2) Do not enter any seed phrases on this machine. (3) Treat the computer as fully compromised — disconnect, do not use for crypto again before a full reformat. This is why hardware wallets with screens exist: the screen-on-device is the final ground truth that cannot be spoofed by host malware.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 232 — MEV: How Bots Steal From Your Swaps
// ─────────────────────────────────────────────────────────────────────────────

const L232: IslandLevel = {
  id: 232, mechanic: 'chain', tier: 'pro',
  topic: 'MEV — How Bots Steal From Your Swaps',

  explanation: `
In 2022, MEV bots extracted over $700 million from Ethereum users — not by hacking contracts, but by rearranging the order of transactions inside blocks. If you have ever received less from a Uniswap swap than the interface quoted, MEV is likely the reason.

MEV (Maximal Extractable Value) is the profit block builders can make by controlling which transactions appear in a block and in what order. Validators and sophisticated searcher bots exploit this control to extract value from ordinary user transactions.

Sandwich attack (most common): a bot detects your pending swap in the mempool. It places a buy order immediately before yours (frontrun), pushing the price up. Your swap executes at the worse price. The bot places a sell order immediately after yours (backrun), profiting from the price impact your trade created. Your slippage tolerance setting determines how much you can be sandwiched — at 1% slippage, you could lose up to 1% on every large swap to sandwich bots. On a $50,000 ETH swap with 1% slippage: up to $500 extracted by bots per transaction.

Frontrunning: the bot simply copies your transaction with a higher gas fee, gets included first, and takes the price impact before you. Your transaction then executes at a worse price or fails.

Just-in-time (JIT) liquidity: a sophisticated attack targeting Uniswap v3 concentrated liquidity. A bot adds liquidity to a pool exactly one block before a large trade, earns the trading fee, then removes liquidity immediately after. Retail LPs who provided liquidity all week earn less because JIT bots collect fees on large trades.

Liquidation MEV: when a borrower in Aave falls below the liquidation threshold, MEV bots race to liquidate first — winning the liquidation bonus. First to liquidate gets the bonus; others get nothing. This creates gas wars between bots.

Flashbots Protect RPC: submit your transaction via the Flashbots private mempool endpoint instead of the public Ethereum mempool. Your transaction goes directly to block builders and is invisible to sandwich bots scanning the public mempool. Cost: zero. Setup: change MetaMask RPC from the default Ethereum RPC to https://rpc.flashbots.net. This single change eliminates sandwich attacks for the vast majority of users.
  `.trim(),

  fact: 'MEV attack types: sandwich (buy before + sell after your swap), frontrunning (copy your tx with higher gas), JIT liquidity (earn your LP fees on large trades), liquidation MEV (race to liquidate). Defence: Flashbots Protect RPC (private mempool, free, prevents sandwich bots seeing your transaction).',
  plain: 'MEV bots watch the Ethereum mempool (all pending transactions) and rearrange them to extract value. A sandwich bot sees your swap, buys before you (raising the price), lets your trade happen at the worse price, then sells after. Fix: use Flashbots Protect RPC in MetaMask — your transactions go private and sandwich bots can\'t see them.',
  stars: [580, 710, 890], target: 890, coins: 40,
  simulatorLesson: 'walletDrainerDrill',

  examples: [
    {
      contextTag: '[DeFi trader, calculating sandwich attack loss]',
      scenario: 'Marcus submits a $30,000 USDC → ETH swap on Uniswap with 0.5% slippage tolerance. A sandwich bot detects it. What is the maximum the bot can extract?',
      outcome: 'Sandwich mechanics on $30,000 at 0.5% slippage: the bot frontruns Marcus\'s buy, moving the ETH price up approximately 0.5% within the pool. Marcus\'s swap executes at the maximum allowed slippage (just within his 0.5% tolerance). The bot\'s backrun sells ETH at the elevated price. Bot profit: approximately 0.3-0.5% of trade size = $90–$150 extracted from Marcus\'s swap. At $30,000 per trade and 3 large trades per week: $270–$450 per week lost to MEV. Annualised: $14,000–$23,000. Over a year of active trading, MEV is a significant hidden cost. Switching to Flashbots Protect RPC: eliminates this cost at zero additional fee.',
    },
    {
      contextTag: '[LP provider, understanding JIT liquidity attacks]',
      scenario: 'Amara provides liquidity on Uniswap v3 USDC/ETH concentrated range ($1,800–$2,200). She earns fees from small trades throughout the day but notices her fee earnings per dollar of liquidity are lower than the pool\'s reported volume would suggest.',
      outcome: 'JIT liquidity bots are likely skimming her largest fee opportunities. How it works: a MEV bot monitors the mempool for large Uniswap swaps. One block before a $500,000 ETH swap, the bot adds $10M in concentrated liquidity in the exact same range Amara uses. That single large trade generates fees — the $10M JIT position collects 99% of them because it represents 99% of the pool\'s liquidity at that moment. The bot removes liquidity immediately after. Amara, providing $50,000 all week, collects a small fraction of the fee from that large trade because she was diluted by the JIT position for exactly that block. Mitigation: JIT attacks are very hard to defend against as an LP — they are structural to public mempool Uniswap. High-volume, frequent small trades (which JIT bots do not target) are better for retail LPs than rare large trades.',
    },
    {
      contextTag: '[Security researcher, explaining MEV supply chain]',
      scenario: 'Priya is explaining to her team why Ethereum validators earn more than their staking reward rate implies. Her team knows about 4% staking APY but asks why some validators earn 6-8%.',
      outcome: 'MEV-Boost: most Ethereum validators run MEV-Boost software, which allows them to outsource block construction to specialised "block builders." Builders compete to offer validators the most valuable block — by including profitable MEV transactions. Validators accept the highest bid. The MEV extracted (sandwich profits, arbitrage, liquidation bonuses) flows from DeFi users → searcher bots → block builders → validators. Validators using MEV-Boost earn their base 4% staking yield plus a share of extracted MEV — bringing effective APY to 6-8% during high MEV periods. The implication: staking yield is partly subsidised by MEV extraction from DeFi users. Users protecting themselves with Flashbots Protect RPC reduce the MEV available to extract, which marginally reduces validator MEV income. This is a real tension in Ethereum\'s economic model.',
    },
  ],

  keyTakeaway: 'MEV bots extract hundreds of millions annually from Ethereum users by sandwiching swaps, frontrunning transactions, and racing to liquidate — Flashbots Protect RPC is the free, immediate fix for sandwich attacks that every DeFi user should enable in MetaMask before their next swap.',

  guidedPractice: [
    {
      question: 'In a sandwich attack, what is the bot\'s exact sequence of actions around your transaction?',
      options: [
        'The bot submits a transaction after yours and outcompetes your transaction by paying higher gas',
        'The bot places a buy order before your swap (frontrun, raising the price), allows your swap to execute at the worse price within your slippage tolerance, then places a sell order after your swap (backrun, profiting from the price impact your trade created)', // ✓
        'The bot copies your exact transaction and submits it simultaneously, causing your transaction to fail',
        'The bot monitors your transaction after it confirms and replaces it with a higher-value version',
      ],
      correct: 1,
      hint: 'Why is it called a "sandwich"? What surrounds your transaction?',
      explanation: 'The sandwich has three layers: (1) Bot\'s frontrun buy — placed immediately before your transaction in the same block, at a slightly higher gas fee to guarantee priority. This buy pushes the token price up within the pool. (2) Your swap — executes at the elevated price, within your slippage tolerance. You receive fewer tokens than the pre-transaction quote. (3) Bot\'s backrun sell — placed immediately after your transaction. The bot sells the tokens it bought at step 1 at the now-elevated price (elevated by your swap\'s volume), locking in profit. The bot\'s profit = the price impact your swap created, captured by its surrounding transactions. Your loss = the difference between the pre-sandwich quote and what you actually received.',
    },
    {
      question: 'How does setting a lower slippage tolerance affect your sandwich attack exposure?',
      options: [
        'Lower slippage tolerance increases sandwich risk because bots prefer tight-slippage transactions',
        'Lower slippage tolerance reduces the maximum the bot can extract (the bot can only move price within your tolerance before your transaction reverts) — but too low a tolerance causes legitimate transactions to fail when pools move naturally', // ✓
        'Slippage tolerance has no effect on sandwich attacks — bots extract the same amount regardless',
        'Lower slippage tolerance causes transactions to execute faster, leaving less time for bots to insert',
      ],
      correct: 1,
      hint: 'If you set 0.1% slippage, what happens to your transaction if the bot moves price by 0.2%?',
      explanation: 'Slippage tolerance is your maximum acceptable price deviation. If you set 0.1%: the bot can frontrun and move the price up to 0.1% before your transaction reverts (you receive 0.1% worse price). If you set 1%: the bot can extract up to 1% of your trade. Lower slippage = lower maximum extraction per sandwich. The trade-off: pools naturally fluctuate between when your transaction is submitted and when it is included. Setting 0.1% slippage on a volatile pool may cause your transaction to revert repeatedly during normal price movements, wasting gas. Practical setting: 0.1% for stablecoin pairs (tiny natural fluctuation), 0.3-0.5% for ETH/USDC (moderate volatility). Flashbots Protect is the better solution — it eliminates the attack rather than just limiting extraction.',
    },
    {
      question: 'Why does using Flashbots Protect RPC prevent sandwich attacks without requiring you to change your swap behaviour?',
      options: [
        'Flashbots encrypts your transaction so bots cannot read the swap details',
        'Transactions submitted to Flashbots go directly to block builders via a private channel, never appearing in the public Ethereum mempool where bots scan for sandwich opportunities — bots cannot attack what they cannot see', // ✓
        'Flashbots automatically splits your swap into smaller amounts that are below the sandwich threshold',
        'Flashbots adds a time delay to your transaction so bots cannot frontrun it in the same block',
      ],
      correct: 1,
      hint: 'Where do sandwich bots find your transaction before it is included in a block? What changes if it never appears there?',
      explanation: 'The mempool is the public waiting room for unconfirmed Ethereum transactions. All transactions broadcast via the default Ethereum RPC appear in the public mempool, visible to every MEV bot in real-time. Bots scan the mempool continuously, simulate the effect of each pending swap, calculate sandwich profitability, and submit their surrounding transactions if profitable. Flashbots Protect bypasses the public mempool entirely: your transaction is sent via an encrypted private channel to Flashbots\' block builder network, which includes it in a block directly. Sandwich bots monitoring the public mempool never see it. They cannot sandwich what they cannot see. The user experience is identical — the swap executes normally — but the private submission channel eliminates the attack vector.',
    },
    {
      question: 'MEV-Boost allows validators to earn more than the base staking yield. What is the source of that extra income and who ultimately pays for it?',
      options: [
        'MEV-Boost creates new ETH through an inflationary mechanism that increases validator rewards',
        'The extra income comes from MEV extraction — value taken from DeFi users through sandwich attacks, frontrunning, and liquidation races. DeFi users executing swaps and being sandwiched are the ones who ultimately fund the elevated validator returns.', // ✓
        'Validators with MEV-Boost receive a subsidy from the Ethereum Foundation for running the software',
        'Block builders pay validators from their own treasury to include their pre-built blocks',
      ],
      correct: 1,
      hint: 'MEV is not created from nothing. If a bot profits from a sandwich attack, where does that profit come from?',
      explanation: 'MEV is a redistribution, not creation. The total value in a swap is fixed. A sandwich attack takes value from the user (who receives fewer tokens than the non-sandwiched price) and transfers it to: the searcher bot (profits the sandwich), the block builder (pays the searcher\'s bid for block inclusion), and the validator (receives the builder\'s bid for the most valuable block). When Ethereum validators report 6-8% APY including MEV, the MEV portion is funded by DeFi users who paid more than market price for their swaps. This is why Flashbots\' research arm frames MEV protection as an Ethereum values issue: the current MEV supply chain creates a subsidy from retail users to validators and sophisticated bots. MEV Blocker RPC and CowSwap\'s batch auction architecture attempt to eliminate this redistribution at the protocol level.',
    },
    {
      question: 'CowSwap uses "batch auctions" to eliminate MEV. What is the mechanism and why does it defeat frontrunning?',
      options: [
        'CowSwap batches transactions into groups of 100 and submits them all at once, making individual frontrunning too expensive',
        'CowSwap collects orders off-chain, matches buyers and sellers directly (CoW = Coincidence of Wants) at a uniform clearing price settled atomically, then submits only the final settlement on-chain. There is no pending order visible in the mempool for bots to frontrun.', // ✓
        'CowSwap uses a private blockchain for order matching, making transactions invisible to Ethereum MEV bots',
        'CowSwap pays users a rebate equal to the MEV that was extracted, effectively making MEV free',
      ],
      correct: 1,
      hint: 'If orders are matched off-chain and only the final settlement appears on-chain, what does a frontrunning bot see in the mempool?',
      explanation: 'CowSwap\'s batch auction architecture: users sign orders off-chain (no on-chain pending transaction — nothing for bots to frontrun). CowSwap\'s "solvers" collect all open orders in a batch window, find the optimal matching (including direct buyer-seller matches that bypass AMM fees entirely — the "CoW" or Coincidence of Wants), calculate a uniform clearing price for all matched trades, and submit one atomic settlement transaction. What appears in the mempool: a single settlement transaction with a known outcome already. Frontrunning this settlement is not profitable because the clearing price is already determined — inserting before it does not change the execution price of any individual order. The batch auction structure severs the link between "visible pending order" and "exploitable price impact" that makes frontrunning profitable.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 233 — Protocol Security Evaluation for Advanced Users
// ─────────────────────────────────────────────────────────────────────────────

const L233: IslandLevel = {
  id: 233, mechanic: 'trait', tier: 'pro',
  topic: 'Protocol Security Evaluation — Reading Audits and Governance',

  explanation: `
In March 2023, Euler Finance was exploited for $197 million. The protocol had been audited six times by five different firms. The exploit used a vulnerability in a feature added after the last audit — a function that allowed a new type of donation to a liquidity pool that the auditors never reviewed. The lesson was not "audits are useless." It was: audits are only as good as what they cover, and upgrades after audits create new unreviewed surfaces.

Protocol security evaluation is a skill set that goes well beyond checking whether an audit exists. At the advanced level, you read the audit report itself.

Severity classifications in audit reports: Critical — can lead to direct loss of funds, must be fixed before deployment. High — significant risk, strong fix recommendation. Medium — risk under specific conditions, fix recommended. Low — minor risk or code quality issue. Informational — code quality suggestions, no security impact. A report with 0 Criticals but 3 unpatched Highs deserves more scrutiny than a report with 2 Criticals that were fixed and verified.

Finding status: "Fixed" (patched and re-verified by the auditor), "Acknowledged" (team aware but chose not to fix — always read why), "Risk Accepted" (team decided the risk is acceptable given constraints). "Acknowledged" findings are the most important to read: they represent known vulnerabilities the team decided to live with.

Audit firm quality: Trail of Bits — strongest reputation for economic attack vectors and complex DeFi logic. OpenZeppelin — most ERC-standard expertise, well-regarded for token and governance contracts. Certora — uses formal verification (mathematical proof, not just code review). Dedaub — strong at finding historical exploit patterns. Spearbit — top-tier boutique, alumni of leading firms.

Protocol upgrade governance risk: when a protocol upgrades via a proxy contract, the implementation contract changes but the proxy address stays the same. An upgrade approved by governance can introduce new code that was never audited. Check: has the upgrade been audited? When was the timelock? Did community members have time to review the proposal?
  `.trim(),

  fact: 'Audit severity: Critical (fix before deploy) > High > Medium > Low > Informational. Key red flags: "Acknowledged" findings (known unfixed vulnerabilities), upgrades after last audit (new unreviewed surface). Top audit firms by specialty: Trail of Bits (economic attacks), Certora (formal verification), OpenZeppelin (ERC standards), Dedaub (exploit pattern analysis).',
  plain: 'Audits aren\'t pass/fail certificates — they list specific vulnerabilities by severity. Always check whether high-severity findings were actually fixed. "Acknowledged" means "we know about it and didn\'t fix it." Euler had 6 audits but was hacked through code added after the last one. Always check when the last audit was and whether any upgrades happened since.',
  stars: [600, 730, 920], target: 920, coins: 40,
  simulatorLesson: 'rugcheck',

  examples: [
    {
      contextTag: '[DeFi depositor, reading an audit report]',
      scenario: 'Before depositing $40,000 into a new lending protocol, James reads its Certora audit report. He finds: 0 Critical findings, 1 High ("oracle price manipulation under low liquidity conditions — Acknowledged, team notes this requires coordinated multi-block attack"), 3 Medium (all marked Fixed), 5 Low (all marked Fixed).',
      outcome: 'The audit picture is mixed. The 1 High "Acknowledged" is the key item. James reads the full finding: the attacker would need to manipulate an oracle price for 3+ consecutive blocks, requiring sustained capital commitment. The risk is real but has a high attack cost. Mitigation check: does the protocol use a TWAP oracle (time-weighted average, harder to manipulate briefly) or a spot oracle (snapshots current price, easier to manipulate)? If spot oracle → risk is more actionable than stated. If TWAP over 30+ minutes → risk is much lower than it sounds. James checks: the protocol uses a 30-minute TWAP on Chainlink. The acknowledged risk is effectively mitigated by the TWAP. He proceeds with the deposit, but sets a monitoring alert for oracle anomalies.',
    },
    {
      contextTag: '[Security reviewer, evaluating a governance upgrade proposal]',
      scenario: 'A DeFi protocol\'s governance forum posts an upgrade proposal: "Implement new liquidation mechanism — improves efficiency by 40%. Timelock: 48 hours. Audit: pending (will be submitted post-vote)." Amara evaluates the security implications.',
      outcome: 'Critical red flag: "audit pending (will be submitted post-vote)" means the community is being asked to approve code changes that have not been independently reviewed yet. The 48-hour timelock gives some protection — sophisticated users can review the raw code during this window — but a liquidation mechanism change affecting $200M in TVL deserves a full audit before governance vote, not after. Amara posts to the forum: "Request: (1) Delay vote until audit is complete and published. (2) Extend timelock to 7 days minimum for a change of this significance. (3) Publish the diff between old and new code alongside the proposal." This is responsible governance participation — the protocol\'s security is the community\'s responsibility, not just the team\'s.',
    },
    {
      contextTag: '[Protocol researcher, comparing Trail of Bits vs Certora]',
      scenario: 'Priya is evaluating two DeFi protocols. Protocol A was audited by Trail of Bits. Protocol B was formally verified by Certora. She wants to understand what each guarantees.',
      outcome: 'Trail of Bits audit: expert human security researchers manually review code looking for vulnerabilities, economic attack vectors, and logical flaws. Extremely good at finding complex DeFi-specific issues (price oracle manipulation, flash loan attack vectors, governance exploits). Does not guarantee the absence of all bugs — it guarantees that the specific things reviewers looked for were not found. Certora formal verification: mathematical proof that specific properties hold for all possible inputs. Example: "The protocol\'s total assets will always equal or exceed total liabilities" — proved mathematically, not just tested. Certora cannot verify properties not specified — it proves what you ask it to prove. Best-in-class protocols do both: Trail of Bits for attack vector discovery, Certora for mathematical invariant verification of core financial properties. Protocol B having Certora verification is a strong signal but does not substitute for manual review of attack vectors.',
    },
  ],

  keyTakeaway: 'Protocol security evaluation requires reading audit reports for severity, fix status, and acknowledged findings — then checking for post-audit upgrades that introduced new unreviewed code. An audit is a point-in-time assessment; security is an ongoing process.',

  guidedPractice: [
    {
      question: 'An audit report lists a High-severity finding as "Acknowledged — team accepts risk as attack requires >$50M capital commitment." Should this satisfy a user planning to deposit $2M?',
      options: [
        'Yes — if the attack costs $50M to execute, no attacker would target a $2M deposit',
        'Partly — the $50M attack cost makes this safe for individual deposits, but the protocol\'s total TVL matters: if TVL is $80M, the $50M attack cost makes financial sense for an attacker targeting the full protocol, not just this user\'s deposit', // ✓
        'No — any acknowledged High finding should disqualify a protocol from any deposit',
        'Yes — the team\'s risk acceptance signals they have taken mitigating steps even if not documented',
      ],
      correct: 1,
      hint: 'The attacker targets the total TVL, not your individual deposit. If the protocol holds $80M, is $50M attack cost acceptable?',
      explanation: 'Attack economics are always about total TVL, not individual deposits. An attacker committing $50M capital to exploit a vulnerability will target the maximum extractable value — the full protocol TVL. At $80M TVL: invest $50M → extract $80M → profit $30M (60% return on capital). The attack is financially rational. At $10M TVL: invest $50M → extract $10M → lose $40M. The attack does not make sense. Individual deposit size is irrelevant — the attacker does not target deposits individually. When reading "acknowledged" findings with capital-cost thresholds, always compare the stated attack cost to the protocol\'s total TVL. If TVL > attack cost, the acknowledgment provides false reassurance.',
    },
    {
      question: 'A protocol was audited 18 months ago and has since upgraded its core liquidation logic via governance. You are evaluating it now. What is the primary security question?',
      options: [
        'Whether the original 18-month-old audit found any Critical findings',
        'Whether the post-upgrade liquidation code was independently audited and whether the audit report is publicly available — the original audit provides zero coverage for the new liquidation logic, which is an entirely new unreviewed attack surface', // ✓
        'Whether the protocol has been in production for 18 months without an exploit',
        'Whether the governance vote that approved the upgrade met quorum requirements',
      ],
      correct: 1,
      hint: 'What does an 18-month-old audit tell you about code added 6 months ago?',
      explanation: 'Audit coverage is specific to the code reviewed at the time. An 18-month-old audit covers the code as it existed 18 months ago — nothing more. If the protocol has deployed a governance upgrade changing the liquidation logic since then, that new code has zero audit coverage from the original report. This is exactly how Euler Finance was exploited: the vulnerable "donateToReserves" function was added in an upgrade that was not covered by any of the six prior audits. Due diligence for an upgraded protocol: find the most recent governance proposals, identify which code changes were deployed, verify those specific changes have a separate audit report. If no post-upgrade audit exists, the upgrade represents unreviewed code — treat it as unaudited regardless of the original audit\'s quality.',
    },
    {
      question: 'What distinguishes a Certora formal verification from a traditional manual audit?',
      options: [
        'Certora uses automated tools to scan for known vulnerability patterns; manual audits are entirely human-reviewed',
        'Certora mathematically proves that specific properties hold for all possible inputs — providing exhaustive correctness guarantees for those properties. Manual audits apply expert human judgment to find vulnerabilities, covering a broader range of attack types but without mathematical exhaustiveness.', // ✓
        'Certora formal verification can only be applied to smart contracts above $100M TVL',
        'Manual audits are performed after deployment; Certora verification must be done before deployment',
      ],
      correct: 1,
      hint: 'What does "for all possible inputs" mean for a property like "total assets always ≥ total liabilities"?',
      explanation: 'Formal verification vs audit trade-off: Formal verification (Certora): the team writes formal specifications ("invariants") — mathematical statements about properties the code must always satisfy. Certora\'s Prover checks these invariants against the code for all possible inputs, not just tested cases. If it proves the invariant, the property is guaranteed. Limitation: you only prove the properties you specify. If you fail to specify an important property, formal verification says nothing about it. Manual audit: expert humans try to find vulnerabilities using knowledge of attack patterns, DeFi-specific logic errors, and adversarial thinking. Cannot exhaustively check all cases, but can identify property violations you did not think to formally specify. The complement: formal verification for core financial invariants (solvency, conservation of value) + manual audit for attack vector discovery = best-in-class security.',
    },
    {
      question: 'A governance proposal adds a new ERC-20 token as accepted collateral. The proposal passes the 48-hour timelock. No additional audit was performed. What security risk does this introduce?',
      options: [
        'Minimal risk — ERC-20 tokens are standardised and cannot introduce new vulnerabilities',
        'Adding a new collateral token introduces oracle risk (is the price feed manipulation-resistant for this specific asset?), liquidity risk (can the protocol liquidate this collateral in adverse conditions?), and token contract risk (does the token\'s contract have non-standard behaviour like transfer fees or rebasing that breaks the protocol\'s accounting assumptions?)', // ✓
        'The risk is fully mitigated by the timelock — 48 hours allows the community to review',
        'Only stablecoin collateral additions are risky; volatile asset additions are safe by definition',
      ],
      correct: 1,
      hint: 'What three specific risks does a new collateral asset introduce that were not present with existing assets?',
      explanation: 'New collateral additions are one of the highest-risk governance actions in DeFi — they expand the protocol\'s attack surface in three dimensions simultaneously. (1) Oracle risk: the new token\'s price feed must be manipulation-resistant specifically for this token\'s market depth and liquidity profile. A token with thin on-chain liquidity can have its oracle manipulated with less capital. (2) Liquidation risk: in adverse conditions (large price drop, low DEX liquidity), can the protocol liquidate the collateral before it becomes undercollateralised? The protocol\'s liquidation logic must handle the new token\'s specific liquidity depth. (3) Token contract risk: non-standard ERC-20 implementations (transfer fees, rebasing, blacklisting) can break lending protocol accounting. USDT\'s fee mechanism (now disabled but historically present) caused issues in several early DeFi integrations. Each of these risks requires protocol-specific analysis — an audit is the correct mitigation, not a 48-hour timelock.',
    },
    {
      question: 'You are comparing two protocols: A has a Trail of Bits audit from 2 weeks ago with 0 Critical, 0 High findings. B has a Certora formal verification from 6 months ago with all core invariants proven, but has deployed two governance upgrades since without additional audit. Which is more secure for a $100,000 deposit today?',
      options: [
        'B — formal verification is always more rigorous than a traditional audit',
        'A — the Trail of Bits audit is current and covers the code exactly as it exists today. B\'s post-upgrade code is unreviewed; the formal verification applies only to the pre-upgrade codebase, providing no coverage of the two upgrades deployed since.', // ✓
        'Both are equivalent — the type of audit does not matter as long as one exists',
        'B — six months of production operation without exploit demonstrates real-world security',
      ],
      correct: 1,
      hint: 'What does B\'s formal verification cover — the current code or the code from 6 months ago?',
      explanation: 'Recency and coverage together determine audit value. Protocol B\'s Certora verification: excellent quality, but certified properties apply to the codebase at verification time. Two subsequent governance upgrades = new code that is completely outside the verified specification. The invariants proved 6 months ago may not hold for the upgraded logic — indeed, if the upgrades changed core financial mechanics, the original invariants need to be re-proved for the new code. Protocol A\'s Trail of Bits audit: 2 weeks old, covers exactly what is running today, found no significant vulnerabilities. For a current deposit, Protocol A has demonstrably better security coverage of the code actually running. The combination: current manual audit + formal verification of current code is best. Choose the option that covers the code as deployed today.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 234 — On-Chain Investigation: Reading Blockchain Data Like ZachXBT
// ─────────────────────────────────────────────────────────────────────────────

const L234: IslandLevel = {
  id: 234, mechanic: 'memory', tier: 'pro',
  topic: 'On-Chain Investigation — Reading Blockchain Data Like ZachXBT',

  explanation: `
In February 2023, Euler Finance was drained of $197 million. Within 48 hours, on-chain investigator ZachXBT had traced the attacker's wallets through 17 intermediate addresses, identified that the attack wallet had been funded from a Tornado Cash withdrawal that shared a gas-funding pattern with a North Korean Lazarus Group wallet, and published a detailed thread with every transaction hash. This was pure on-chain forensics — no inside information, no privileged access. Just blockchain data and methodology.

On-chain investigation methodology follows a systematic framework: follow the money, trace funding sources, identify exchange deposits, build the timeline, correlate patterns.

Step 1 — Origin trace: where did the attacker get their funds? Check the wallet that funded the attack wallet. If it was Tornado Cash, check the timing and amounts of deposits and withdrawals — unusual patterns (same amount, same time offset as a known pattern) can link wallets through a mixer.

Step 2 — Forward trace: where did the funds go after the exploit? Track every outgoing transaction. Funds moving to a known exchange deposit address (labelled by Arkham or Nansen) are a breakthrough — the exchange holds KYC for that deposit.

Step 3 — Entity labelling: use Arkham Intelligence (entity mapping with ML labels), Breadcrumbs.app (visual transaction graph), Etherscan (internal transactions, verified contract labels). Nansen for smart money and wallet labelling.

Step 4 — Cross-chain correlation: many attackers bridge to a different chain to obscure the trail. Track bridge transactions (Hop, Across, Wormhole events). The bridged amount and timing are still visible on both chains.

Step 5 — Dune Analytics custom queries: build SQL queries to analyse patterns across thousands of transactions — same-amount transfers, coordinated timing, wallet age clustering.

The Euler Finance attacker ultimately returned $177 million after on-chain investigators identified them — a direct outcome of the public nature of blockchain data.
  `.trim(),

  fact: 'On-chain investigation workflow: (1) Origin trace (funding source), (2) Forward trace (where funds went), (3) Entity labelling (Arkham, Nansen, Etherscan), (4) Cross-chain correlation (bridge events), (5) Dune SQL for pattern analysis. Key tools: Arkham (entity ML labelling), Breadcrumbs (visual graph), Etherscan (internal txs), Dune (custom SQL).',
  plain: 'Every blockchain transaction is public and permanent. On-chain investigators trace hackers by following: where the attack wallet got its funding, every hop the stolen funds made, which exchanges received deposits (those exchanges have KYC). Tools: Arkham labels wallet identities, Etherscan shows every transaction, Dune runs SQL on the full history. Even mixers can\'t hide patterns if amounts and timing match known actors.',
  stars: [620, 760, 950], target: 950, coins: 40,
  simulatorLesson: 'flashbotsProtect',

  examples: [
    {
      contextTag: '[Investigator, tracing a protocol exploit]',
      scenario: 'A DeFi protocol loses $8M. The attacker\'s wallet address is known (from the exploit transaction). James begins the investigation. Walk through his first 30 minutes.',
      outcome: 'Minute 1-5: Open Etherscan. Look at the exploit wallet\'s full history. Find the funding transaction — the wallet was funded 4 days ago with 0.3 ETH from wallet 0xABCD. Check 0xABCD: it withdrew 0.3 ETH from Tornado Cash. Minute 5-15: Open Arkham. Search the exploit wallet — no entity label, but Arkham\'s graph shows 3 other wallets funded from the same 0xABCD source. Check those wallets: two are dormant, one sent funds to a Binance deposit address 6 hours after the exploit. Minute 15-25: Export the Binance deposit address. File an emergency contact with Binance security (binance.com/en/support → suspicious activity). Include transaction hashes and the deposit address. Binance may freeze the funds if KYC account is identified within hours. Minute 25-30: Publish preliminary findings on Twitter/X with all transaction hashes. Community amplification accelerates the investigation.',
    },
    {
      contextTag: '[Researcher, using Dune Analytics for pattern detection]',
      scenario: 'Amara suspects a token team is wash-trading their token\'s volume to attract organic buyers. She wants to prove it with on-chain data.',
      outcome: 'Dune query approach: write SQL to find all buy and sell transactions for the token on Uniswap. Group by wallet address. Identify wallets that both buy and sell the same token multiple times within the same day. Check whether those wallets are funded from the same source. Query pattern: SELECT wallet, COUNT(buys), COUNT(sells), SUM(buy_volume), SUM(sell_volume) FROM token_transactions GROUP BY wallet HAVING buys > 5 AND sells > 5 ORDER BY buy_volume DESC. If the top 10 volume wallets are all funded from the same deployer wallet and execute alternating buys/sells with identical amounts, the wash-trading pattern is documented. Amara publishes the Dune dashboard link — the data is public, reproducible, and irrefutable.',
    },
    {
      contextTag: '[Security researcher, correlating through Tornado Cash]',
      scenario: 'Priya is investigating whether a known scammer\'s wallet and a new anonymous wallet are controlled by the same person. Both used Tornado Cash, making direct connection hard. How does she correlate?',
      outcome: 'Tornado Cash correlation methodology: Tornado Cash uses fixed denomination pools (0.1 ETH, 1 ETH, 10 ETH, 100 ETH). The deposit amount and timing vs withdrawal timing create a unique temporal pattern. If Wallet A deposited 1 ETH into Tornado Cash on Day 1 at 14:23 UTC and Wallet B withdrew 1 ETH on Day 3 at 09:17 UTC, the 2 day 18 hour 54 minute gap is a specific data point. Cross-reference: did the known scammer\'s wallet show similar deposit-to-withdrawal timing patterns in other transactions? If the timing offset matches a pattern across multiple deposits, it suggests the same person (who habitually waits a specific interval between deposit and withdrawal). Correlation through Tornado Cash is probabilistic, not certain — but combined with other signals (similar gas prices, same gas top-up wallet, same contract interaction patterns), it builds a compelling case.',
    },
  ],

  keyTakeaway: 'On-chain investigation is systematic forensics — follow the money forward and backward, use entity labelling tools (Arkham, Nansen) to convert addresses into identities, and exploit the blockchain\'s permanent public record: every transaction, every bridge, every exchange deposit is permanently documented and cross-referenceable.',

  guidedPractice: [
    {
      question: 'Why is discovering that a hacker\'s funds reached a centralised exchange deposit address so significant for investigators?',
      options: [
        'Centralised exchanges can reverse blockchain transactions from their deposit addresses',
        'Centralised exchanges hold KYC identity documentation for every account — when law enforcement subpoenas the exchange with the deposit address, the exchange provides the real-world identity of the account holder who owns that deposit address', // ✓
        'Exchange deposit addresses automatically freeze incoming funds from known exploit wallets',
        'Finding exchange addresses confirms the hacker made a mistake that allows the protocol to recover funds',
      ],
      correct: 1,
      hint: 'What does a user have to provide to open a centralised exchange account? What happens when that account receives funds from an exploit?',
      explanation: 'KYC-chain connection: to receive funds from a CEX deposit address, the account holder completed identity verification — typically government ID, selfie, and sometimes address proof. The exchange links that KYC information to every deposit address assigned to the account. When investigators identify that stolen funds reached "Binance deposit address 0x1234...," that address is tied to a specific verified identity in Binance\'s database. Law enforcement submits a subpoena or MLA (Mutual Legal Assistance) request. The exchange is legally required to provide the account holder\'s identity. This is how the 2022 Bitfinex hackers were caught: years of layering through mixers, and then they deposited to a Coinbase account in their real names. The blockchain\'s permanent record made the final connection possible.',
    },
    {
      question: 'An attacker bridges stolen ETH from Ethereum to Polygon to obscure the trail. Can investigators still follow the funds across chains?',
      options: [
        'No — cross-chain bridges anonymise the source of funds, making the trail untraceable',
        'Yes — bridge contracts emit on-chain events on both chains recording the bridge amount, destination address, and transaction hash. Investigators match the withdrawal on Polygon to the deposit on Ethereum by amount and timing, then continue tracing from the Polygon address.', // ✓
        'Partially — investigators can see the bridge deposit but not the receiving address on the destination chain',
        'Only if the bridge protocol cooperates with the investigation voluntarily',
      ],
      correct: 1,
      hint: 'Bridge transactions happen on-chain on both the source and destination chains. What information is recorded?',
      explanation: 'Cross-chain tracing methodology: every bridge emits on-chain events. On Ethereum: a "Deposit" event recording the sender address, amount, destination chain, and intended receiver. On Polygon: a "Claim" or "Mint" event recording the receiver address and corresponding Ethereum transaction hash. Investigators correlate: find the Ethereum bridge deposit from the attacker\'s wallet → look up the corresponding Polygon claim event using the same amount and bridge reference hash → continue tracing from the Polygon receiver address. Bridge transactions are not anonymous — they are transparent on both chains. Attackers use bridges to try to break investigator attention (forcing cross-chain context switching) but cannot actually obscure the connection. The Ronin bridge hack funds were traced through Ethereum → Tornado Cash → various chains before Binance froze $5.8M based on on-chain intelligence.',
    },
    {
      question: 'What is the "dust analysis" technique and how does it help connect anonymous wallets?',
      options: [
        'Dust analysis measures the smallest transaction amounts in a wallet to estimate its total value',
        'Investigators send tiny "dust" amounts to suspect wallets and track what they do with it — but more commonly, they identify that multiple anonymous wallets all received the same small dust amount from an identified funder wallet, revealing common origin', // ✓
        'Dust analysis is a Dune Analytics query that identifies bot wallets by their transaction frequency',
        'Dust refers to the small ETH amounts left in wallets after gas fees, which can identify wallet age',
      ],
      correct: 1,
      hint: 'If 20 wallets all received 0.001 ETH from the same funding wallet on the same day, what does that suggest about their ownership?',
      explanation: 'Dust funding analysis: when an attacker or Sybil farmer creates multiple wallets for a coordinated operation (airdrop farming, governance attack, wash trading), they need to fund each wallet with a small amount of ETH for gas. They typically send a tiny "dust" amount (0.001-0.01 ETH) from a single source wallet to all their operational wallets. This creates a visible pattern: one funding wallet → 50 dust transactions → 50 wallets on the same day. On-chain investigators identify the funding wallet, then trace all wallets it funded. Arbitrum used exactly this analysis to identify and disqualify 600,000+ Sybil airdrop wallets: wallets funded from the same source on the same date, showing the same interaction patterns, were clustered and removed from airdrop eligibility.',
    },
    {
      question: 'You are investigating a wallet that transferred funds through 8 intermediate hops before reaching a final address. Why would an attacker use this layering strategy and what is its limitation?',
      options: [
        'Layering is used to reduce transaction fees across multiple hops',
        'Layering attempts to break the investigator\'s attention and create a time-consuming trail — the limitation is that every hop is permanently recorded on-chain and investigators can trace all hops systematically; layering adds effort but not true anonymity on a transparent blockchain', // ✓
        'Each hop converts the funds to a different token, making value tracking impossible',
        'Layering is used to split the funds across multiple owners who each hold a fragment',
      ],
      correct: 1,
      hint: 'Is any of the 8 hops invisible? What is the purpose of each hop if all are visible?',
      explanation: 'Layering on transparent blockchains: the strategy is borrowed from traditional money laundering (placement → layering → integration). On a transparent blockchain, layering does not create invisibility — every hop is permanently recorded. Its purpose is: (1) Time cost — forcing investigators to trace each hop takes hours to days. (2) Attention dilution — each hop creates a new address for investigators to search. (3) False dead ends — some hops may lead to inactive wallets, creating branches investigators must check. (4) Cross-investigator handoff difficulty — publishing a 8-hop trace is harder to understand than a 1-hop trace. The fundamental limitation: the blockchain records everything. Automated tools (Breadcrumbs, Arkham) can trace 8 hops in seconds. Layering delays human investigators but does not defeat systematic tool-assisted investigation. Mixing services (Tornado Cash) are the only tool that actually breaks the on-chain transaction graph — layering alone does not.',
    },
    {
      question: 'On Etherscan, you open a transaction and find the "Internal Transactions" tab shows 14 calls to different contract addresses. The main transaction shows only a simple ETH transfer. What does this reveal?',
      options: [
        'The transaction failed — successful transactions do not generate multiple internal calls',
        'The simple ETH transfer triggered complex smart contract logic — the 14 internal calls reveal the actual execution path: which DeFi protocols were touched, which function calls were made, and where value actually flowed during the transaction. This is the real transaction, not the surface-level view.', // ✓
        'The 14 internal calls are gas refund transactions automatically generated by Ethereum',
        'Internal transactions indicate that the transaction interacted with a proxy contract, suggesting an upgrade was performed',
      ],
      correct: 1,
      hint: 'A DeFi exploit might appear as a simple ETH transfer on the surface. Where is the attack logic hidden?',
      explanation: 'The internal transactions tab is where investigations actually happen in DeFi. The main transaction view shows the top-level call — often just "0 ETH transfer to ContractX." The internal transactions reveal: ContractX called liquidate() on Aave → Aave called transfer() on USDC → USDC transferred to the caller → caller called swapExactTokensForETH on Uniswap → Uniswap returned ETH → and so on. An exploit that looks like a simple ETH withdrawal in the main view might have 50 internal calls showing the complete attack sequence. For investigations, always check internal transactions before concluding "this was just a transfer." Flash loan attacks are particularly well-hidden in the main transaction view — the entire borrow-exploit-repay sequence happens in internal calls within a single top-level transaction.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 235 — Advanced OPSEC: Protecting a Significant Portfolio
// ─────────────────────────────────────────────────────────────────────────────

const L235: IslandLevel = {
  id: 235, mechanic: 'trait', tier: 'pro',
  topic: 'Advanced OPSEC — Protecting a Significant Crypto Portfolio',

  explanation: `
In 2021, a crypto trader in the Netherlands was physically restrained in their home while attackers forced them to sign transactions transferring $11 million in crypto. The attackers had identified the victim through their public social media posts about crypto gains, cross-referenced their wallet address with ENS registration data, and found their home address through a domain registration. No cryptographic security protects against a threat holding a weapon to your family.

Advanced OPSEC (operational security) calibrates defences to the actual threat model. Most people face consumer threats. As holdings grow, the threat profile escalates.

Threat level 1 — Consumer (holdings up to ~$50K): phishing emails, SIM swap attacks, malware. Defences: hardware wallet, hardware-key 2FA (YubiKey, not SMS), separate email address for crypto, antivirus.

Threat level 2 — Semi-targeted ($50K–$500K): on-chain analysts identifying your wallet as high-value, social engineering of exchange accounts, targeted phishing with personal context. Defences: never publicly associate wallet addresses with your identity, use a separate "public-facing" wallet with small balances, consider an LLC structure for holdings, use a PO box not a home address for all crypto-related accounts.

Threat level 3 — Targeted ($500K+): physical surveillance, home address identification, coercion attacks ($5 wrench), coordinated social engineering of multiple contacts. Defences: geographic multisig key distribution (no single location can produce a signing quorum), dedicated signing device that never connects to the internet (air-gapped), never discuss holdings with anyone outside your legal and security team, succession planning with an attorney.

Dedicated device policy: one computer that is used only for crypto — no email, no browsing, no social media. Reduces the software attack surface dramatically. Malware for crypto targeting often hides in browser extensions, email attachments, and npm packages — none of which appear on a dedicated clean device.

Personal threat model document: write down who might target you, how they would find you, and what they would need to succeed. Update it as holdings change. Most security failures happen because people apply consumer-level defences to targeted-level threats.
  `.trim(),

  fact: 'OPSEC threat levels: consumer (phishing/SIM swap — hardware wallet + YubiKey), semi-targeted (on-chain identification — separate public wallet, LLC, PO box), targeted (physical coercion — geographic multisig, air-gapped device, attorney succession planning). Dedicated crypto-only device eliminates browser/email/extension malware surface.',
  plain: 'The right security depends on how much crypto you hold and who might target you. At $10K, a hardware wallet stops most threats. At $1M, people can find your home address from public blockchain data and show up in person. Geographic multisig (keys in multiple cities) means coercing one person doesn\'t unlock the funds. Write your threat model down.',
  stars: [640, 780, 980], target: 980, coins: 40,
  simulatorLesson: 'walletSetup',

  examples: [
    {
      contextTag: '[High-value holder, calibrating threat model]',
      scenario: 'Marcus has accumulated $800,000 in crypto over 3 years. He has a Ledger, 2FA on exchanges, and uses MetaMask with Flashbots. He publicly mentions being "heavily in crypto" on Twitter and has registered his ENS name under his real identity. What are his top 3 security gaps?',
      outcome: 'Gap 1 (Identity linkage): his Twitter mentions + ENS registration link his public identity to his wallet. An on-chain investigator can find his wallet address via ENS, check the Ledger-grade balance, and associate it with his Twitter identity. Fix: create a second "public" wallet with no ENS or Twitter links for any public interaction; keep the main wallet completely separate from public identity. Gap 2 (No multisig): at $800,000, a single Ledger is a single point of failure — physically stolen or coerced. Fix: migrate main holdings to a 3-of-5 multisig with keys in different cities. Gap 3 (Social media signals): "heavily in crypto" posts are reconnaissance data for targeted attackers. Fix: never post portfolio signals, positions, or gains publicly. The Ledger + 2FA + Flashbots are excellent for consumer threats — but insufficient for the semi-targeted threat profile he has inadvertently created.',
    },
    {
      contextTag: '[Security architect, designing a dedicated device setup]',
      scenario: 'Amara manages $2M in crypto and wants to set up a dedicated signing device. She is choosing between a dedicated laptop and a dedicated air-gapped tablet.',
      outcome: 'Dedicated laptop (networked): runs only MetaMask + hardware wallet interface. No email, no other browsers, no extensions. Eliminates most malware attack surfaces. Risk: still connected to the internet, so software supply chain attacks (malicious npm package, drive-by download) remain possible. Best for: operational DeFi use where internet connectivity is needed for approvals. Air-gapped tablet (never connected): for large transfers only. The tablet never connects to Wi-Fi or Bluetooth. Transactions are prepared on a separate online device, exported via QR code, signed on the air-gapped tablet, and the signed transaction is exported back. Risk: more cumbersome workflow. Best for: treasury/vault signing where $100K+ moves are involved and operational friction is acceptable. Recommendation: dedicated networked laptop for DeFi operations up to $50K, air-gapped tablet for treasury-level transactions above $50K. The friction of air-gapped signing is proportionate to the amount at stake.',
    },
    {
      contextTag: '[Succession planner, protecting against incapacitation]',
      scenario: 'Priya holds $600,000 in a 3-of-5 multisig with keys distributed across 5 trusted people. She has not told her family how to access the funds in case of her death. She asks for a succession architecture.',
      outcome: 'Succession architecture: Level 1 (existence document): a sealed letter with her attorney, released upon death certificate, stating: "I hold significant crypto assets. The following people have been given instructions to help recover them. Contact [Key Holder 1], [Key Holder 2], and [Key Holder 3] immediately." Level 2 (key holder instructions): each of the 5 key holders has a sealed envelope with instructions: "In the event of Priya\'s death, contact the other key holders listed in the letter from her attorney. When 3 of you have connected, use these instructions to execute the recovery transaction." Level 3 (technical guide): a simple 1-page technical guide in each envelope explaining how to access and use the multisig key they hold. The attorney coordinates, the key holders execute, the family receives funds. At no point does the attorney or any single key holder have enough information to steal the funds — and the family does not need any technical knowledge to initiate the process.',
    },
  ],

  keyTakeaway: 'OPSEC effectiveness requires honest threat model calibration — consumer defences (hardware wallet, 2FA) are necessary but insufficient at high portfolio values where physical coercion, identity correlation, and targeted social engineering become realistic threats requiring geographic multisig, identity separation, and succession planning.',

  guidedPractice: [
    {
      question: 'Why does publicly linking your real identity to your ENS name create a security risk beyond just privacy?',
      options: [
        'ENS names are taxable assets in most jurisdictions, creating unintended tax disclosure',
        'Anyone can look up your ENS name, find your wallet address, check your on-chain balance, and connect your known wealth to your real identity and potentially your home address — converting you from an anonymous holder to a known high-value target for physical or social engineering attacks', // ✓
        'ENS names linked to real identities attract regulatory scrutiny from tax authorities',
        'Real-name ENS registrations require KYC with ENS Labs, exposing personal documents',
      ],
      correct: 1,
      hint: 'If someone knows your name → ENS → wallet address → balance, what have they now established about you?',
      explanation: 'The identity chain: Real name (public) → ENS reverse lookup → wallet address (on-chain) → balance and transaction history (public blockchain) → net worth estimate (public). Add: LinkedIn/Twitter for employer/city → property records for home address (often public in many jurisdictions) → physical location of a known high-value crypto holder. This chain is fully automated and takes minutes. Security researchers have demonstrated the complete chain from "Twitter username" to "home address" using only public sources. At holdings above $100K, connecting your public identity to your wallet addresses creates a semi-targeted threat profile. Mitigation: use a separate pseudonymous ENS name for public interaction, keeping your main wallet completely separate from any public identity.',
    },
    {
      question: 'What is the "dedicated device policy" and which specific attack surfaces does it eliminate?',
      options: [
        'Using your phone only for crypto and your computer only for personal tasks — separating channels',
        'A separate computer used exclusively for crypto operations with no email, browser extensions, social media, or general browsing — eliminating the malware delivery channels of phishing emails, malicious extensions, drive-by downloads, and compromised npm packages that typically infect general-use computers', // ✓
        'A hardware wallet that is dedicated to a single DeFi protocol rather than used across multiple platforms',
        'Dedicating 4 hours per week to reviewing security updates and patching software',
      ],
      correct: 1,
      hint: 'How does crypto-targeting malware typically reach a victim\'s computer? Which channels are eliminated by a single-purpose device?',
      explanation: 'Crypto malware delivery channels: (1) Malicious email attachments (phishing PDF, Word macro). (2) Browser extensions (fake MetaMask, clipboard hijackers disguised as productivity tools). (3) Drive-by downloads from compromised websites. (4) Malicious npm packages installed during developer work. (5) Social media links to malware payloads. A dedicated crypto device eliminates all five: no email client (no attachments), no browser extensions installed (clean browser), no general browsing (no drive-by), no npm development environment, no social media. The attack surface reduction is not incremental — it is categorical. The attacker who successfully phished your email cannot reach your crypto if your email never ran on the same device as your wallet software. Dedicated device is one of the most effective security improvements for holdings above $100K.',
    },
    {
      question: 'Geographic distribution of multisig keys defeats physical coercion attacks. Why must the distribution be across different countries, not just different cities in the same country?',
      options: [
        'International key distribution creates favourable tax treatment for multisig wallets',
        'A government or organised crime group with sufficient resources can simultaneously coerce multiple people within the same country or jurisdiction. Cross-country distribution means coordinating simultaneous coercion across different legal systems and physical logistics — dramatically increasing attack complexity and cost.', // ✓
        'Keys in different countries use different encryption standards, increasing security diversity',
        'Cross-country distribution is only required if the crypto is held under a trust structure',
      ],
      correct: 1,
      hint: 'What can a single government or local criminal organisation coordinate within its jurisdiction that it cannot across international borders?',
      explanation: 'Jurisdiction boundary as a security layer: a $5 wrench attack on one person yields one multisig key (insufficient). To execute a coercion attack on a 3-of-5 multisig with keys in different countries, the attacker must coordinate simultaneous coercion of 3 people in 3 countries — different time zones, different legal systems, different physical logistics, different law enforcement responses. This is a nation-state-level operation for most scenarios. Additionally: a government subpoena or court order forcing a key holder to sign can only be issued within that government\'s jurisdiction. A key holder in Singapore cannot be compelled by a US court order without international legal process (MLA). For government-coercion scenarios, having keys in non-aligned jurisdictions (e.g., Singapore, Switzerland, and Argentina) means no single government can obtain signing quorum through legal compulsion.',
    },
    {
      question: 'Your friend holds $50,000 in crypto and asks: "Is a hardware wallet enough security?" What is the honest answer?',
      options: [
        'Yes — a hardware wallet is the gold standard and provides complete protection at any portfolio size',
        'For $50,000 with consumer threat exposure, a hardware wallet plus hardware-key 2FA on exchanges covers the realistic threat model well. The answer changes if holdings grow significantly, if you publicise your holdings, or if you operate in a high-risk environment — at which point additional OPSEC layers (identity separation, multisig) become appropriate.', // ✓
        'No — hardware wallets have multiple known vulnerabilities that make them ineffective security',
        'A hardware wallet is enough only if paired with a VPN and a dedicated browser',
      ],
      correct: 1,
      hint: 'What threats does a hardware wallet specifically defeat? What threats does it not address?',
      explanation: 'Hardware wallet defences and limitations: A hardware wallet eliminates: private key extraction from the host computer (key never leaves the device), malware signing fraudulent transactions (all signing requires physical confirmation on the device), remote theft without physical access. A hardware wallet does not protect against: physical theft of the device (passphrase protects, but the device is a target), physical coercion (attacker forces you to sign on the device), exchange hacks if funds remain on exchanges (hardware wallet only protects self-custodied funds), address poisoning (you might still sign the wrong address despite hardware confirmation). For $50,000: the realistic threat is phishing and exchange compromise — hardware wallet plus hardware-key 2FA covers both. For $1M+: the realistic threat escalates to include targeted physical and social engineering where hardware wallet alone is insufficient.',
    },
    {
      question: 'You discover your home address appears in a public property record database, linked to your real name, which is linked to your ENS name and therefore your crypto wallet. What is the correct response?',
      options: [
        'Immediately transfer all crypto to a new wallet address to break the connection',
        'Prioritise removing the identity linkages: (1) Update ENS records to a pseudonymous identity. (2) Migrate significant holdings to a new wallet with no public identity link. (3) Consider a registered agent service for your LLC (if you have one) to remove your home address from public filings. (4) Implement physical security measures at your residence. (5) Enable geographic multisig if holdings are significant enough to justify it.', // ✓
        'Delete all social media accounts and change your legal name',
        'Contact ENS Labs to have your name removed from the public registry',
      ],
      correct: 1,
      hint: 'The linkage is identity → ENS → wallet → wealth → home address. Which link is most actionable to break first?',
      explanation: 'Response prioritisation: The chain is: name → ENS → wallet → home address. Breaking it at the ENS-wallet link is most actionable. (1) Update ENS: change primary ENS name records to not reveal the main wallet, or transfer the ENS name to a separate pseudonymous wallet. (2) Migrate holdings: create a new wallet with no public history or ENS linkage and migrate significant holdings to it. The old wallet\'s on-chain history is permanent and always traceable, but if you stop using it for significant transactions, your active wealth becomes harder to identify. (3) LLC + registered agent: if holdings are under an LLC, replace your home address in public filings with a registered agent service address (costs $50-200/year, completely standard). (4) Physical security: inform a trusted person about the exposure, brief your household on security protocols. Transferring crypto to a new wallet alone (option 1) does not break the identity linkage — your name, property records, and past ENS association remain accessible.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L231–L235)
// ─────────────────────────────────────────────────────────────────────────────

export const ISLAND_SECURITY_LEVELS_A: Record<number, IslandLevel> = {
  231: L231,
  232: L232,
  233: L233,
  234: L234,
  235: L235,
};
