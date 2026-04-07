// ⚡ Sifter SkillUp — Security & Research (Island 17, Levels 231–240)
// Part B of 2 — Levels 236–240 (Boss: L240)
//
// Chain: islandId=17
// Prerequisite: Alt-Chain Ecosystems (Island 14)
// Primary Simulators: rugcheck, onchainAnalysis, mevProtect

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { ISLAND_SECURITY_LEVELS_A } from './island17SecurityLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 236 — Crypto Tax Advanced: DeFi, Staking, and Cross-Chain
// ─────────────────────────────────────────────────────────────────────────────

const L236: IslandLevel = {
  id: 236, mechanic: 'match3', tier: 'pro',
  topic: 'Crypto Tax Advanced — DeFi, Staking, and Cross-Chain',

  explanation: `
In 2022, a UK trader made £180,000 gross from memecoin trading but netted only £12,000 after losses. They filed no tax return assuming "I barely made anything." HMRC disagreed: each of 340 trades was a taxable disposal event. Gross gains were £180,000. The losses offset them, but the taxpayer still owed £4,200 in residual capital gains tax plus £3,100 in late filing penalties because the gross gains exceeded the reporting threshold even before losses. Not filing was the mistake — not the trading.

DeFi tax is more complex than simple buy-sell because more events are taxable disposals than most users expect.

Liquidity provision: when you add tokens to a Uniswap pool, you exchange your tokens for LP tokens — this is a disposal of your original tokens at the current market price. Your cost basis resets. When you remove liquidity, you dispose of LP tokens and receive tokens — another disposal. Impermanent loss is generally not recognised as a loss until realisation. In the UK: LP provision is treated as a barter transaction (disposal + acquisition at market value). In the US: broadly similar treatment, though formal IRS guidance is still evolving.

Staking rewards: both the UK (HMRC) and US (IRS) treat staking rewards as income at the market value when received. The received value becomes your cost basis. When you later sell the staked rewards, any gain above that basis is capital gain.

Cross-chain bridges: moving assets across chains via a bridge is generally treated as non-taxable in most jurisdictions (you receive the "same" asset on the other chain). However, the tax implications of what you do after bridging (swaps, yield, etc.) apply normally.

Wash sale rules: the US wash sale rule (30-day waiting period to harvest losses) does not currently apply to crypto — you can sell at a loss and re-buy the same asset immediately. The UK has a 30-day "bed and breakfasting" rule that prevents this: if you sell and re-buy within 30 days, the sale is matched against the re-purchase, defeating the loss harvest.
  `.trim(),

  fact: 'DeFi taxable events: LP provision (disposal of tokens at market value), LP removal (disposal of LP tokens), staking rewards (income at receipt value). US: wash sale rule does not apply to crypto. UK: 30-day bed-and-breakfasting rule prevents loss harvesting within 30 days. Every swap is a disposal — track cost basis for all.',
  plain: 'In DeFi, almost everything is taxable. Adding liquidity counts as selling your tokens. Staking rewards are income the day you receive them. Moving assets between chains is usually fine, but swapping is always a taxable sale. In the UK, selling at a loss and immediately buying back doesn\'t work — you must wait 30 days. Use Koinly or CoinTracker to track automatically.',
  stars: [660, 810, 1010], target: 1010, coins: 40,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[DeFi LP, understanding tax on liquidity provision]',
      scenario: 'James adds $10,000 of ETH (cost basis $6,000) and $10,000 of USDC to a Uniswap v3 pool. Six months later he removes the liquidity, receiving $9,500 ETH and $10,500 USDC due to impermanent loss. What are the taxable events?',
      outcome: 'Event 1 (LP provision): James disposes of ETH at $10,000 (current market value) — capital gain = $10,000 − $6,000 = $4,000 gain. He disposes of $10,000 USDC at cost basis $10,000 — zero gain. He acquires LP tokens at total cost basis $20,000. Event 2 (LP removal 6 months later): James disposes of LP tokens (cost basis $20,000) and receives ETH + USDC worth $20,000. If total received = $20,000, the disposal of LP tokens results in zero gain (basis = proceeds). The ETH received has a new cost basis of $9,500 (market value at receipt). The impermanent loss of $500 in value relative to hold is not directly recognised — it is embedded in the LP token disposal calculation. James owes tax on the initial $4,000 ETH gain. His new ETH cost basis is $9,500.',
    },
    {
      contextTag: '[Staking reward recipient, calculating tax correctly]',
      scenario: 'Amara stakes 10 ETH and receives 0.5 ETH in staking rewards over the year, received incrementally (0.1 ETH at a time at different prices: $1,800, $1,900, $2,100, $2,000, $1,850). She sells all 0.5 ETH at end of year for $2,200 each. What is her tax?',
      outcome: 'Step 1 (Income): each 0.1 ETH receipt is income at that day\'s market price. Total income recognised: (0.1 × $1,800) + (0.1 × $1,900) + (0.1 × $2,100) + (0.1 × $2,000) + (0.1 × $1,850) = $180 + $190 + $210 + $200 + $185 = $965 total income. Step 2 (Cost basis): each 0.1 ETH tranche has its own cost basis (the income value recognised at receipt: $180, $190, $210, $200, $185). Step 3 (Capital gain on sale at $2,200): total proceeds = 0.5 × $2,200 = $1,100. Total cost basis = $965. Capital gain = $1,100 − $965 = $135. Total tax events: $965 income tax + $135 capital gains tax. Without tracking each receipt price, Amara would have no cost basis and would owe tax on the full $1,100 proceeds.',
    },
    {
      contextTag: '[UK trader, navigating bed and breakfasting rules]',
      scenario: 'Priya holds 2 ETH with a cost basis of £4,000 (current price £2,000 each = £4,000 total). She wants to harvest a capital loss to offset other gains. She sells both ETH at £4,000 and plans to immediately re-buy.',
      outcome: 'In the UK: if Priya sells 2 ETH at £4,000 and re-buys 2 ETH within 30 days at the same price, the bed and breakfasting rule matches her sale against the re-purchase — her sale price becomes her re-buy price, resulting in zero loss recognised. To harvest the loss legitimately in the UK: she must wait 31+ days before re-purchasing. Risk: ETH price changes during the 31-day wait. Alternative UK approach: sell the ETH from her personal account and immediately buy the same ETH in a spouse\'s account — the bed-and-breakfasting rule is specific to the same person, not household. This is legal tax planning (not evasion). Priya should consult a UK crypto tax accountant before executing — the rules are specific and the penalties for errors are significant.',
    },
  ],

  keyTakeaway: 'DeFi creates taxable events far beyond simple buy-sell — LP provision and removal, staking reward receipts, and token swaps each trigger tax obligations; the US and UK have meaningfully different loss harvesting rules (no wash sale restriction in US; 30-day rule in UK), making jurisdiction-specific professional advice important for active DeFi users.',

  guidedPractice: [
    {
      question: 'You provide 5 ETH (cost basis $8,000 total) to a Uniswap v2 pool. Is this a taxable event in most jurisdictions?',
      options: [
        'No — you are still effectively holding ETH, just in a different form',
        'Yes — you are disposing of your 5 ETH at current market value and receiving LP tokens in exchange. This is a taxable disposal triggering capital gains tax on the difference between your cost basis ($8,000) and the market value at the time of provision.', // ✓
        'Only if the value of the LP tokens exceeds your ETH cost basis at the time of provision',
        'No — tax is only triggered when you remove liquidity and receive tokens back',
      ],
      correct: 1,
      hint: 'You hand over ETH and receive a different token (LP token) in exchange. Is exchanging one asset for another a disposal?',
      explanation: 'Token exchange = disposal in virtually all tax jurisdictions. When you provide ETH to a Uniswap pool, you exchange your ETH for LP tokens — even though the LP tokens represent a claim on that same pool. Tax authorities treat this as: you sold your ETH at current market value, and purchased LP tokens at that same value. Your ETH holding is disposed of; your new asset is LP tokens with a cost basis equal to the ETH value at provision time. This is particularly impactful if your ETH has significant unrealised gains: an LP provision forces recognition of those gains even if you intended to "stay in ETH through the pool." This is one of the most commonly overlooked DeFi tax events.',
    },
    {
      question: 'The IRS (US) treats staking rewards as income when received. What practical implication does this have for your tax strategy?',
      options: [
        'You should stake as many tokens as possible to maximize income, since staking income is taxed at a lower rate than capital gains',
        'You must track the market value of every staking reward at the moment of receipt — this becomes your cost basis. Failing to track means you either overpay tax (no basis) or underpay (using incorrect basis). Daily automated tracking via Koinly or CoinTracker is essential for meaningful staking rewards.', // ✓
        'Staking rewards are only taxable when they are transferred out of the staking contract to your wallet',
        'Staking rewards received on a hardware wallet are not taxable because the IRS does not monitor hardware wallet activity',
      ],
      correct: 1,
      hint: 'If you receive 0.01 ETH as a staking reward and its value at receipt is $18, what is your income? What is your cost basis when you later sell it?',
      explanation: 'Staking reward tracking requirements: each reward receipt is both an income event (at market value when received) and a cost basis establishment event. If you receive 365 daily staking rewards and sell them all at once at year end without records, you have no cost basis documentation — tax software will default to $0 basis, charging you capital gains on the full sale price. With proper tracking: your income is distributed across 365 days at different prices; your cost basis for each tranche is the income value recognised. The capital gain on sale is only the increase above the income-recognised basis. For ETH stakers earning ~4% APY, the difference between proper tracking and no tracking can be thousands of dollars in overpaid tax on a $100,000+ staked position.',
    },
    {
      question: 'Why does the absence of a US wash sale rule for crypto create a tax planning opportunity that does not exist for stocks?',
      options: [
        'Crypto wash sale exemption means crypto losses are deducted at a higher rate than stock losses',
        'US crypto holders can sell an asset at a loss to realise the capital loss for tax purposes, then immediately re-buy the same asset, maintaining their position. With stocks, the 30-day wash sale rule would disallow the loss if the same stock is re-purchased within 30 days.', // ✓
        'Crypto losses can be used to offset ordinary income without limitation, unlike stocks',
        'The absence of wash sale rules means crypto gains are not taxable either, creating a tax-free category',
      ],
      correct: 1,
      hint: 'What is the wash sale rule\'s purpose for stocks? What becomes possible if crypto does not have the same restriction?',
      explanation: 'Tax loss harvesting strategy for US crypto holders: you hold 1 BTC at a cost basis of $50,000, currently worth $35,000 — unrealised loss of $15,000. You sell the BTC at $35,000, realising the $15,000 loss (which offsets other capital gains or up to $3,000 of ordinary income per year). You immediately re-buy 1 BTC at $35,000. Your new cost basis is $35,000. Your market position is unchanged (you still hold 1 BTC). Tax result: you captured a $15,000 loss without sacrificing your Bitcoin position. For stocks, the IRS wash sale rule would disallow this loss if you re-buy within 30 days. For crypto (as of 2024), no such rule exists — you can execute the loss harvest and immediate re-buy on the same day. Note: Congress periodically proposes extending wash sale rules to crypto; this may change.',
    },
    {
      question: 'You bridge 1 ETH from Ethereum to Arbitrum using the canonical bridge. Is this a taxable event?',
      options: [
        'Yes — moving assets between chains is equivalent to selling on one chain and buying on another',
        'Generally no — bridging is typically treated as moving the same asset to a different network, not as a disposal. You receive the same economic exposure to ETH on Arbitrum. However, the specific ETH you receive may have a different token address (WETH vs ETH), and formal guidance varies by jurisdiction.', // ✓
        'Yes, but only if the bridge charges a fee above 0.1% of the transfer value',
        'Bridging is taxable only if you bridge to a chain with a different consensus mechanism than Ethereum',
      ],
      correct: 1,
      hint: 'What economic event does bridging represent — are you changing your economic exposure or just the network your assets sit on?',
      explanation: 'Bridge tax treatment: the dominant interpretation in most jurisdictions is that bridging is a non-taxable event because you retain the same economic exposure (1 ETH before = 1 ETH after, just on a different network). Your cost basis transfers unchanged. The complication: technically, you deposit ETH into the bridge contract (disposal?) and receive Wrapped ETH or an equivalent on the destination chain (acquisition?). The IRS has not formally ruled on cross-chain bridges. Most tax software (Koinly, CoinTracker) treat bridge transfers as non-taxable by default. The practical risk: if regulation or guidance changes to treat bridges as disposals, prior bridge transfers could become retroactively taxable events — a reason to keep detailed records of all bridge transactions regardless of current treatment.',
    },
    {
      question: 'A UK crypto trader sells ETH at a £5,000 loss on November 1st, then re-buys identical ETH on November 15th. Is the £5,000 loss usable for tax purposes?',
      options: [
        'Yes — capital losses are always recognised when you sell at below cost basis',
        'No — the UK\'s 30-day bed and breakfasting rule matches the November 1st sale against the November 15th re-purchase (same asset, within 30 days). The sale proceeds become the re-buy cost basis, effectively cancelling the loss realisation. The £5,000 loss is deferred, not recognised.', // ✓
        'Yes, but only if the re-purchase was made using proceeds from a different asset sale',
        'Partially — 50% of the loss is recognised immediately and 50% is deferred until the re-purchased ETH is sold',
      ],
      correct: 1,
      hint: 'What is the UK 30-day rule designed to prevent? Does the re-purchase within 30 days fall within its scope?',
      explanation: 'UK bed and breakfasting rule (TCGA 1992, s.106A): designed specifically to prevent artificial loss creation by selling and immediately re-buying the same asset. The mechanics: if you sell an asset and re-acquire the same asset within 30 days, the disposal is matched against the re-acquisition rather than your original cost basis. Result: your disposal proceeds become your new acquisition cost — the transaction is treated as if it never created a real economic change. The £5,000 loss is deferred into the new holding\'s adjusted cost basis. It is not recognised until the re-purchased ETH is ultimately sold more than 30 days after acquisition. To legitimately harvest the loss in the UK: wait 31+ days before re-purchasing, accept the market risk of being out of position during that period.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 237 — Incident Response: Advanced Recovery Procedures
// ─────────────────────────────────────────────────────────────────────────────

const L237: IslandLevel = {
  id: 237, mechanic: 'chain', tier: 'pro',
  topic: 'Incident Response — Advanced Recovery After a Compromise',

  explanation: `
In 2023, a crypto developer discovered at 2:47 AM that their hot wallet was being actively drained. They had 4 minutes to act before the attacker swept the remaining funds. They watched $180,000 leave and did nothing — not because they lacked technical knowledge, but because they panicked and could not remember which steps to take first. They did not have an incident response plan.

Advanced incident response is the difference between minimising a loss and watching it become total. The first 5 minutes determine everything.

The first-5-minute protocol: (1) Identify the scope — which wallets are affected? Is the attack ongoing? (2) Stop the bleeding — revoke all token approvals from the compromised wallet immediately (using revoke.cash or Etherscan's token approval page). An approver contract that already has permission can drain your wallet even after you move your ETH. (3) Transfer safe assets — move any assets not yet touched to a new wallet whose seed phrase was generated on a clean device. (4) Do not send additional funds to the compromised wallet under any circumstances.

Evidence preservation: do not wipe the compromised device. Do not delete browser extensions or apps. Law enforcement forensics require the original device state. Take screenshots of every extension, every recently opened file, every recent email. This evidence helps identify the attack vector and supports any insurance or law enforcement claim.

Exchange notification: if you identify the attacker is moving funds toward a centralised exchange, submit an emergency report immediately to that exchange's security team (Binance: binance.com/en/support → report suspicious; Coinbase: coinbase.com/security). Include all transaction hashes and the exchange deposit address. Exchanges have frozen funds in similar incidents within hours when reports arrive fast.

Recovery prospects (honest): on-chain transactions are irreversible. Recovery is only possible if the attacker uses a centralised exchange (KYC-linked) or if a jurisdictional subpoena can compel a mixer to reveal transaction records (rare). FBI IC3 and Action Fraud (UK) accept reports, primarily for documentation that aids in civil asset recovery claims. Chainalysis and CipherTrace provide professional forensics for law enforcement that have led to asset recovery in high-profile cases.
  `.trim(),

  fact: 'First 5 minutes: (1) Revoke all token approvals on the compromised wallet, (2) transfer remaining assets to a clean-keyed wallet, (3) do not wipe the device (preserve forensic evidence). Recovery channels: exchange security (fastest), FBI IC3 / Action Fraud (for law enforcement), Chainalysis (professional forensics). On-chain transactions are irreversible without exchange cooperation.',
  plain: 'If your wallet is being drained right now: first, revoke all token approvals (revoke.cash) so the attacker can\'t keep draining via approved contracts. Then move remaining assets to a new wallet. Don\'t wipe your computer — police need to see the malware. Report to the exchange the attacker is using immediately. Irreversible means irreversible, but fast action stops ongoing losses.',
  stars: [680, 830, 1040], target: 1040, coins: 40,
  simulatorLesson: 'approvalRevoke',

  examples: [
    {
      contextTag: '[Wallet compromise, first 5-minute response]',
      scenario: 'James receives a Etherscan alert at 11:23 PM: his hot wallet just sent 2 ETH he did not authorise. His wallet still holds $15,000 in USDC and several NFTs. He has 5 minutes before the attacker scripts the next drain.',
      outcome: 'Minute 1: Open revoke.cash on a clean device (not the potentially compromised computer). Connect a different hardware wallet. Check which contracts have approval to spend James\'s USDC. There is a malicious contract with unlimited USDC approval. Revoke it immediately — this costs ~$5 in gas and prevents the attacker from draining USDC even if they still have access. Minute 2-3: On MetaMask mobile (different device), initiate a transfer of USDC to a fresh wallet address (seed phrase generated on the clean phone, never touched the compromised computer). Set gas to "Fast." Minute 4: Transfer NFTs using the same clean mobile. Minute 5: Check remaining balance — compromised wallet is now empty of valuable assets. The attacker may drain the remaining $50 in ETH for gas, but the $15,000 USDC and NFTs are safe. Post-incident: do not touch the compromised device; begin forensics.',
    },
    {
      contextTag: '[Post-compromise, evidence preservation]',
      scenario: 'Amara\'s MetaMask was drained of $45,000. She wants to report to law enforcement and her insurance provider. She is about to factory reset her laptop to "clean it." What should she do instead?',
      outcome: 'Stop: do not factory reset. The malware on the laptop is evidence. Steps to preserve it safely: (1) Disconnect from the internet (pull the ethernet, disable WiFi). This stops any active data exfiltration. (2) Photograph the screen — installed browser extensions, recently opened files, downloads folder, email inbox. (3) Take a full disk image if technically capable — a forensics professional can do this. (4) Write down all recent actions on the laptop: every new extension installed, every file downloaded, every website visited in the 72 hours before the incident. (5) Keep the laptop powered on but internet-disconnected until law enforcement reviews it. Filing with FBI IC3: submit the report with all wallet addresses, transaction hashes, and the timeline of events. Action Fraud (UK): similar process. The device examination helps identify the attack vector — which is the most important input for any future civil recovery or insurance claim.',
    },
    {
      contextTag: '[Large-scale theft, exchange notification race]',
      scenario: 'Priya\'s $200,000 crypto portfolio is drained at 3 AM. She traces the attacker wallet on Etherscan and finds it sending funds to a Binance deposit address. She has 20 minutes before the funds might be moved internally.',
      outcome: 'Immediate action: navigate to binance.com/en/support → Security → Report Suspicious Activity. In the report: include the exact Binance deposit address (the on-chain destination), all transaction hashes from Priya\'s wallet to the attacker wallet and from the attacker wallet to the Binance deposit, and a clear statement: "These are proceeds from a theft of my accounts. I request an emergency hold on this Binance account pending law enforcement investigation." Email a copy to security@binance.com with the same information. Binance has frozen funds in similar circumstances when the report is specific and arrives before internal transfer. Success rate: variable — depends on whether the account is flagged before manual withdrawal, and whether the account was used for legitimate activity before (making immediate freeze less likely). Follow up with a formal law enforcement request for international mutual legal assistance (MLA) through FBI if US-based.',
    },
  ],

  keyTakeaway: 'Incident response speed is everything — revoking token approvals and moving remaining assets in the first 5 minutes limits ongoing loss; preserving forensic evidence (not wiping the device) is the only path to law enforcement cooperation and potential recovery; on-chain finality means recovery requires an exchange to freeze funds before internal transfer.',

  guidedPractice: [
    {
      question: 'Why is revoking token approvals the first priority action — even before moving your remaining assets — when a wallet is actively being drained?',
      options: [
        'Token approval revocation is faster than asset transfer, so it saves more time',
        'An attacker with an existing token approval can continue draining your wallet indefinitely — even after you move assets to a new address or generate a new wallet — if the approved contract has permission to spend from the original wallet. Revoking approvals stops the automated draining pipeline.', // ✓
        'Moving assets creates taxable events, while revocation does not',
        'Token approvals are what give attackers admin access to your hardware wallet device',
      ],
      correct: 1,
      hint: 'If you approved Uniswap to spend your USDC last year, does Uniswap still have that permission? What if a malicious contract has the same permission?',
      explanation: 'ERC-20 token approvals are persistent and infinite by default. When you approve a contract to spend your USDC, that approval remains active until you revoke it — regardless of whether you\'re actively using the protocol. An attacker who compromises your wallet can query all active approvals and drain tokens from any approved contract in a single transaction, even after you\'ve moved your ETH. Example: you approved Uniswap, Aave, and an unknown malicious contract to spend your USDC. The malicious contract executes transferFrom(your_address, attacker_address, MAX_UINT256) — draining your full USDC balance even if you\'ve moved ETH elsewhere. Revocation cancels this permission. Always revoke first, then move assets; the approval is the more dangerous remaining attack surface.',
    },
    {
      question: 'What specific information should you include in an emergency exchange security report for the best chance of a freeze?',
      options: [
        'Your personal details and a description of what happened in plain language',
        'The specific exchange deposit address that received the funds, every transaction hash in the chain from your wallet to the deposit address, timestamps, amounts, and a clear statement that these are theft proceeds — enabling the exchange security team to look up the specific account and flag it for review without any ambiguity', // ✓
        'A police report number — exchanges will not act without official law enforcement involvement',
        'The private keys of the attacker\'s wallet so the exchange can verify ownership of the funds',
      ],
      correct: 1,
      hint: 'What does an exchange security team need to act in 10 minutes? What do they need to look up immediately?',
      explanation: 'Exchange security teams handle hundreds of reports daily. The difference between a freeze and no action is specificity and speed. A vague report ("my crypto was stolen, please help") requires investigation before action. A specific report ("deposit address 0x1234...5678 received $200,000 from our victim wallet via transaction 0xABCD...at 03:17 UTC — these are theft proceeds") gives the security team exactly what they need to immediately pull up the deposit account and flag it. Include: (1) The exact deposit address (so they can find the specific account). (2) All transaction hashes (so they can verify the chain of custody independently). (3) A timeline of events. (4) Your contact information for follow-up. Exchange security teams have frozen accounts within minutes of a specific report arriving before the attacker manually withdraws. Vague reports get reviewed during business hours — specific reports get emergency attention.',
    },
    {
      question: 'After a wallet compromise, you want to create a new wallet on your existing laptop. Why is this a serious mistake?',
      options: [
        'Your existing wallet software is linked to the compromised account and cannot generate genuinely new wallets',
        'If your laptop is compromised (which it is, given the attack originated there), any seed phrase generated on it may be captured by the same malware — creating a new "clean" wallet on an infected machine gives the attacker immediate access to that wallet too', // ✓
        'Laptop hardware wallets cannot generate secure seed phrases because they lack a hardware random number generator',
        'The same IP address would be used for the new wallet, allowing the attacker to identify it',
      ],
      correct: 1,
      hint: 'What is on the laptop that caused the original compromise? Does creating a new wallet remove that?',
      explanation: 'Seed phrase generation security: the seed phrase must be generated in a completely clean environment to be trusted. If malware is on the laptop, it may monitor clipboard activity, screenshot the seed phrase display, or intercept the wallet software\'s entropy source. Any seed phrase generated on a compromised device should be treated as potentially known to the attacker. Clean alternatives: (1) Hardware wallet — generates seed phrase entirely within its secure element, never displayed on the computer. (2) A factory-reset phone that has never connected to the compromised computer. (3) An offline device running Tails OS from a clean USB drive. The most dangerous mistake after a compromise is to assume a "new wallet" on the same infected machine provides any safety.',
    },
    {
      question: 'Realistic expectation: your wallet was drained of $80,000 to an unknown address that then used Tornado Cash. What is the honest probability of recovery?',
      options: [
        'High — law enforcement can reverse blockchain transactions in most jurisdictions',
        'Very low — Tornado Cash breaks the on-chain transaction graph, meaning there is no identifiable destination for law enforcement to subpoena; recovery would require the attacker to make a subsequent OPSEC mistake (use a KYC exchange, reuse a linked address) that investigators can exploit', // ✓
        'Moderate — blockchain forensics firms can trace through Tornado Cash in most cases',
        'Guaranteed — Tornado Cash transactions are recorded on-chain and are fully traceable by government agencies',
      ],
      correct: 1,
      hint: 'What does Tornado Cash technically do to the transaction graph? What does law enforcement need to subpoena?',
      explanation: 'Tornado Cash breaks the on-chain graph by design: deposits and withdrawals are cryptographically decoupled. There is no transaction hash linking a specific deposit to a specific withdrawal. On-chain investigators can see that funds entered Tornado Cash and that funds left Tornado Cash — but cannot prove which specific withdrawal corresponds to which deposit. Law enforcement can: (1) subpoena Tornado Cash\'s frontend operators (historically ineffective as contracts are permissionless). (2) Issue sanctions on the protocol (done in 2022 by OFAC). (3) Monitor wallets that withdrew from Tornado Cash during the relevant time period and wait for one to interact with a KYC exchange. Recovery pathway: the attacker makes a subsequent OPSEC error — withdraws from Tornado Cash and then deposits to Coinbase, for example. This is how some Tornado Cash-routed hacks have eventually led to identifications. For $80,000: file FBI IC3 and retain documentation, but expect no recovery absent an attacker mistake.',
    },
    {
      question: 'You notice suspicious activity on your hardware wallet — transactions you did not initiate are appearing in the signing queue. Your hardware wallet itself shows the correct address but the computer shows different transactions. What does this indicate and what should you do?',
      options: [
        'The hardware wallet has a firmware bug — update the firmware immediately',
        'Active transaction tampering malware is on your computer. It is intercepting your signing requests and substituting different transactions. Reject all pending transactions on the hardware wallet device, disconnect the wallet, and treat the computer as fully compromised — never reconnect the hardware wallet to this computer.', // ✓
        'Your MetaMask is out of sync with the hardware wallet — reinstall MetaMask to fix the display',
        'This is a normal display discrepancy caused by network latency — confirm the transactions to resolve',
      ],
      correct: 1,
      hint: 'The hardware wallet shows something different from your computer. Which one can malware control?',
      explanation: 'Transaction tampering malware: a sophisticated attack that intercepts the communication between your computer wallet interface (MetaMask) and the hardware wallet signing request. The malware shows you what you want to see on the computer screen but submits a different transaction to the hardware wallet for signing. The hardware wallet cannot verify the computer\'s display — it signs what it receives. The defence: always read the transaction details on the hardware wallet\'s own screen before confirming, not on the computer. If the hardware wallet screen shows different details than the computer, this is definitive evidence of active tampering. Correct response: reject on device, treat computer as fully compromised, do not reconnect the hardware wallet. After a full computer reformat, reconnect and verify the hardware wallet firmware has not been modified (check firmware hash against manufacturer).',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 238 — Smart Contract Security for Non-Developers
// ─────────────────────────────────────────────────────────────────────────────

const L238: IslandLevel = {
  id: 238, mechanic: 'rugpull', tier: 'pro',
  topic: 'Smart Contract Security — Non-Developer Evaluation Guide',

  explanation: `
In 2022, Nomad bridge was drained of $190 million in 2 hours — not by a single sophisticated attacker, but by hundreds of copycats who saw the initial exploit transaction, read the attack pattern on-chain, and replicated it themselves with zero coding. The vulnerability was visible in the contract code for anyone who knew what to look for. The contract had not been formally audited before launch.

You do not need to write code to evaluate smart contract security. Etherscan and Solidity have enough readable structure that a non-developer can identify key risk indicators in under 10 minutes.

Step 1 — Check contract verification: open the contract on Etherscan. Is the source code verified (marked with a green checkmark)? Unverified contracts hide their logic entirely — you are trusting code you cannot read. Legitimate protocols virtually always verify their source code.

Step 2 — Find the owner and admin functions: search the verified code for "onlyOwner," "onlyAdmin," "pause," "blacklist," and "mint." These are the admin functions that give deployers special powers. A "pause" function can freeze user withdrawals. A "blacklist" can prevent specific addresses from transferring. An "unlimited mint" function can inflate supply to zero.

Step 3 — Check proxy contracts: if the contract is a proxy (usually identifiable by an "implementation" function or "upgradeTo" in the ABI), the logic can be changed after deployment. The contract you evaluated today may not be the contract that runs tomorrow. Check whether the upgrade requires a multisig with a timelock.

Step 4 — Use automated scanners: GoPlus Security API (gopluslabs.io) scans a token contract for common issues: mint authority active, transfer pausable, honeypot (can buy but not sell), trading tax above threshold. TokenSniffer provides similar automated scoring. These catch obvious red flags in seconds.

Step 5 — Check ownership renouncement: if the owner address is 0x000...0000 (the burn address), the contract's admin functions can never be called — the contract runs autonomously forever. Renounced ownership removes the risk of an admin function being abused.
  `.trim(),

  fact: 'Smart contract red flags without coding knowledge: unverified source code, active admin functions (pause, blacklist, unlimited mint), unrenounced ownership (admin can still act), proxy without timelock (logic can change silently). Tools: GoPlus Security API, TokenSniffer (automated scan), Etherscan (manual verification + source code), DeFi Safety (protocol scorecards).',
  plain: 'You don\'t need to code to check if a smart contract is risky. On Etherscan: is the source code public (verified)? Does the owner control special functions like "pause" or "blacklist"? Is it a proxy contract that can be upgraded silently? Run it through GoPlus Security for an automatic scan. If ownership is "renounced," the admin can\'t touch it anymore.',
  stars: [700, 850, 1060], target: 1060, coins: 40,
  simulatorLesson: 'opsecBuilder',

  examples: [
    {
      contextTag: '[Token investor, running a quick contract check]',
      scenario: 'Marcus wants to buy a new token called $NOVA. He has the token contract address. He has 10 minutes and no coding experience. Walk through his evaluation.',
      outcome: 'Minute 1-2 (Etherscan): paste contract address → check if source code is verified (green checkmark). It is verified. Mint 3-4 (GoPlus scan): go to gopluslabs.io → "Token Security" → enter contract address → results show: "Mint Authority: Active" (dev can create more tokens at will), "Transfer Pausable: Yes" (dev can freeze trading), "Trading Tax: 5% buy, 8% sell" (high sell tax — honeypot indicator). These three flags together constitute a very high-risk profile. Minute 5-7 (Etherscan source code): search for "onlyOwner" — found on mint function and pause function. Owner address: 0x9876... not the zero address (not renounced). Minute 7-10 (Ownership history): the owner address deployed 3 other contracts in the past 6 months, all abandoned. Conclusion: 4 independent red flags. Marcus does not buy.',
    },
    {
      contextTag: '[DeFi depositor, checking proxy upgrade risk]',
      scenario: 'Amara is evaluating a lending protocol. Etherscan shows the main contract is a proxy. She wants to understand the upgrade risk before depositing $25,000.',
      outcome: 'Proxy evaluation steps: (1) Open the proxy contract on Etherscan → check ABI for "upgradeTo" or "upgradeToAndCall" functions. Found — this confirms the implementation can be changed. (2) Find who controls upgrades: look at the ProxyAdmin contract. The ProxyAdmin is controlled by a 4-of-7 multisig (shown in Etherscan\'s contract interactions). (3) Check if a timelock exists: the multisig has a 48-hour timelock — any upgrade must wait 48 hours after proposal before execution. (4) Check the current implementation: the most recently pointed implementation was last changed 8 months ago and has a Trail of Bits audit. Assessment: the upgrade risk is real but mitigated — 4-of-7 multisig means no single actor can upgrade, 48-hour timelock gives users time to exit if a suspicious upgrade is proposed, and the 8-month-old implementation has an audit. Amara deposits $25,000 with a Etherscan alert set for any proxy upgrade event.',
    },
    {
      contextTag: '[Security educator, explaining renounced ownership]',
      scenario: 'Priya is explaining to a workshop participant why some protocols advertise "ownership renounced" as a security feature. The participant is confused — shouldn\'t the owners be able to help if something goes wrong?',
      outcome: 'Ownership renouncement explained: in Solidity, the "owner" has access to powerful admin functions — pausing trading, blacklisting addresses, changing fees, minting tokens. These powers are necessary during development but create centralisation risk in production. When the deployer calls renounceOwnership(), the owner address is set to 0x000...0000 (the zero address, which nobody controls). The admin functions become permanently inaccessible — no one, including the original team, can pause trading or mint more tokens. This is a trust-minimisation feature: instead of asking users to "trust us not to use these functions," the deployer proves the functions can never be used. Trade-off: if there is a critical bug, the team also cannot pause the contract to limit damage. This is why mature protocols use timelocked multisig governance instead of outright renouncement — maintaining emergency response capability while limiting admin abuse.',
    },
  ],

  keyTakeaway: 'Non-developers can evaluate smart contract security in 10 minutes using Etherscan (source verification, admin function search, proxy upgrade check) and automated scanners (GoPlus, TokenSniffer) — the key red flags are unverified source code, active admin functions without renouncement, and proxy contracts without timelocked multisig control.',

  guidedPractice: [
    {
      question: 'A token contract shows "Transfer Pausable: Yes" in GoPlus Security. What does this mean for your investment?',
      options: [
        'Pausing is a safety feature — it means the dev can stop trading during a hack to protect users',
        'The contract owner can freeze all token transfers at any time — meaning they can prevent you from selling your tokens indefinitely. This is a honeypot mechanism: you can buy tokens, but the owner can pause transfers so you can never sell them.', // ✓
        'Transfer pausing only applies to new token minting, not existing holder transfers',
        'This flag means the token has advanced security features that protect against MEV attacks',
      ],
      correct: 1,
      hint: 'If an owner pauses transfers and you want to sell, what happens when you try to execute the sell transaction?',
      explanation: 'Transfer pausable function mechanics: the pause function calls the Pausable contract (often from OpenZeppelin), which sets a global paused state. When paused, any call to transfer() or transferFrom() reverts — your sell transaction fails at execution with an error. You cannot sell, transfer to another wallet, or use the token in any DeFi protocol. This is one of the most reliable honeypot mechanisms: buy volume is encouraged (unaffected), but all sell attempts fail silently or revert. GoPlus detecting "Transfer Pausable: Yes" + unrenounced owner is the highest-risk combination for a new token. The defensive counter: check that ownership is renounced (making pause function forever inaccessible) OR that the pause function is protected by a timelock (not instantly executable). Active pausable with live unrenounced owner = do not buy.',
    },
    {
      question: 'A DeFi protocol\'s proxy contract points to an implementation last changed 2 years ago. A governance proposal today suggests upgrading to a new implementation. What is the minimum security you should verify before the upgrade executes?',
      options: [
        'The upgrade vote should pass with at least 75% approval to be legitimate',
        'The new implementation code should be publicly available and independently audited before the governance vote; the timelock should be long enough (48-72+ hours) for users to review the code and exit if they disagree with the changes; and the upgrade should not add new admin functions that reduce protocol decentralisation.', // ✓
        'Check whether the upgrade increases the protocol\'s TVL projections',
        'Verify that the team announced the upgrade on Twitter at least 7 days before the vote',
      ],
      correct: 1,
      hint: 'What three things make a proxy upgrade safe for existing depositors? Code availability, review time, and what else?',
      explanation: 'Proxy upgrade security checklist: (1) Code availability: the new implementation source code must be publicly available — ideally on GitHub and verified on Etherscan — before the governance vote, not after. Users voting for unreviewed code changes cannot make informed decisions. (2) Independent audit: a 2-year-old implementation is audited; the new one is not unless explicitly stated. Any significant logic change deserves a fresh audit before deployment. (3) Timelock duration: the minimum time between "upgrade approved by governance" and "upgrade executed" must be sufficient for users to review the new code and exit if they disagree. For $100M+ TVL, 48-72 hours is the minimum; 7 days is better. (4) New admin surface: check whether the new implementation adds admin functions not present in the original. Upgrades that quietly add "owner can pause" capabilities should be treated with extreme suspicion.',
    },
    {
      question: 'What does GoPlus Security\'s "Honeypot" detection specifically check for?',
      options: [
        'Whether the token contract has a referral mechanism that rewards early buyers',
        'Whether the token\'s sell function is blocked or manipulated — simulating a buy and sell transaction to verify both can execute successfully. A honeypot buy succeeds but the simulated sell fails or returns much less than expected.', // ✓
        'Whether the token has been listed on a centralised exchange, which indicates legitimacy',
        'Whether the token\'s deployer has previously deployed successful tokens',
      ],
      correct: 1,
      hint: 'The word "honeypot" suggests a trap. What does the trap look like from the buyer\'s perspective?',
      explanation: 'GoPlus honeypot simulation: the scanner simulates both a buy transaction and a sell transaction against the token\'s contract code, without actually executing on-chain. If the simulated sell fails, reverts with an unexpected error, or returns significantly less than the buy amount (indicating a hidden tax), it flags as a honeypot. This detects: (1) Transfer pausable tokens where sell fails when paused. (2) Blacklist-on-sell tokens that blacklist any address that attempts to sell. (3) Extremely high hidden sell taxes (99% sell tax returns 1% of value). (4) Broken sell logic that always reverts. The limitation: sophisticated honeypots can detect simulation environments and behave normally during GoPlus scanning while failing for real users. GoPlus is the first line of defence, not the only check.',
    },
    {
      question: 'You find a DeFi protocol with: verified source code, no pause or mint functions, ownership renounced, no proxy. Is this definitively safe?',
      options: [
        'Yes — this protocol has passed all smart contract security checks and is safe to use',
        'No — the absence of admin function risks does not mean the protocol is free from logic vulnerabilities, economic attack vectors, or oracle manipulation risks. Renounced ownership and no admin functions are necessary but not sufficient conditions for safety.', // ✓
        'Yes — renounced ownership with no admin functions means even a compromised deployer cannot harm users',
        'Partially — it is safe for small deposits but large deposits require an additional audit check',
      ],
      correct: 1,
      hint: 'What types of smart contract vulnerabilities do audit firms actually find? Are they all about admin functions?',
      explanation: 'The admin function checks eliminate centralisation risk — they do not eliminate code logic vulnerabilities. Bugs that exist regardless of admin function status: (1) Reentrancy vulnerabilities (the The DAO hack in 2016 used a renounced-equivalent contract). (2) Price oracle manipulation (a contract with no admin functions can still be exploited if it uses a manipulable spot price oracle). (3) Integer overflow/underflow. (4) Flash loan attack vectors. (5) Economic design flaws (liquidation cascades, collateralisation math errors). (6) Access control logic errors (a non-owner function that unintentionally allows a specific exploit pattern). The admin function checklist is a screening filter that removes the most obvious rug pull structures. Passing this filter is a necessary threshold, not a sufficient one. Audits by qualified firms are the next layer of verification.',
    },
    {
      question: 'DeFi Safety is a platform that scores protocols on security practices. What does a high DeFi Safety score measure that individual smart contract scanners do not?',
      options: [
        'The total value locked in the protocol — higher TVL correlates with higher security',
        'Process maturity: documentation quality, team transparency, admin key management practices, community governance health, and historical security incident response — holistic protocol governance assessment beyond just code scanning', // ✓
        'The number of users who have reviewed and confirmed the protocol is safe',
        'The protocol\'s compliance with MiCA and other financial regulations',
      ],
      correct: 1,
      hint: 'GoPlus scans code. DeFi Safety scores process. What elements of protocol security are not visible in code alone?',
      explanation: 'DeFi Safety\'s scoring framework evaluates: (1) Documentation: are the contracts documented? Is the architecture explained? Can a developer understand what the protocol does without reading the raw code? (2) Team: is the team identifiable? Do they have verifiable credentials? (3) Admin key management: multisig structure, key holder disclosure, timelock implementation and duration. (4) Testing: does the protocol have unit tests, integration tests, economic simulation? (5) Oracle security: which price feeds are used and how? (6) Community governance: is governance participation meaningful and active? (7) Past incidents: how did the team respond to previous vulnerabilities or near-misses? These process factors are not visible in code — they require reading documentation, governance forums, and post-mortems. Code scanning catches technical vulnerabilities; DeFi Safety scoring assesses operational security maturity.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 239 — Advanced MEV Protection: Searchers, Builders, and Proposers
// ─────────────────────────────────────────────────────────────────────────────

const L239: IslandLevel = {
  id: 239, mechanic: 'chain', tier: 'pro',
  topic: 'Advanced MEV Protection — Searchers, Builders, and Proposers',

  explanation: `
In 2023, MEV-Boost was running on over 90% of Ethereum validators. A system designed to democratise MEV extraction had become critical infrastructure that every validator used — and that most did not fully understand. The MEV supply chain had quietly become central to Ethereum's economic model.

The complete MEV supply chain has three actors: searchers, builders, and proposers (validators).

Searchers are sophisticated bots (often hedge funds or individual MEV researchers) that constantly scan the Ethereum mempool and simulate pending transactions. When they find a profitable opportunity — a sandwichable swap, a liquidatable position, a price discrepancy across DEXs — they construct a "bundle": a set of transactions ordered to extract maximum value, with a bribe payment attached.

Builders aggregate bundles from multiple searchers and construct entire block bodies, including all regular pending transactions plus the MEV bundles. They compete to build the most valuable block by solving a complex optimisation problem: which transactions in which order maximise total fees plus MEV? The winning builder submits their block to validators.

Proposers (Ethereum validators) use MEV-Boost to auction off their block proposal right. They run MEV-Boost software, which connects to a "relay" that collects builder bids. The relay shows validators the value of the best available block without revealing its contents (avoiding validator-builder collusion). Validators take the highest-value block. This extra income explains why validator APY often exceeds the base staking reward rate.

PBS (Proposer-Builder Separation): this design — where the proposer does not build the block — was formalised after the Merge. It is currently implemented voluntarily via MEV-Boost. Future Ethereum upgrades (enshrined PBS) will build this separation into the protocol itself, potentially improving decentralisation.

User protection options beyond Flashbots Protect: MEV Blocker RPC (aggregates multiple private mempool builders), CowSwap batch auctions (no pending mempool order to front-run), 1inch Fusion (intent-based, uses solvers), and Uniswap X (cross-chain intent architecture).
  `.trim(),

  fact: 'MEV supply chain: searchers (find opportunities, submit bundles) → builders (construct optimal blocks from bundles) → proposers/validators (take highest-value builder bid via MEV-Boost relay). PBS separates these roles. User protection beyond Flashbots: MEV Blocker RPC, CowSwap (batch auctions), 1inch Fusion, UniswapX (intent-based, no mempool exposure).',
  plain: 'The MEV extraction chain: bots find sandwich opportunities → block builders stack those sandwiches into the most profitable block → validators pick that block for extra income. MEV-Boost is the software that connects validators to block builders. For users: Flashbots Protect is the simplest fix (private mempool). CowSwap eliminates the issue structurally by matching trades off-chain before they appear on-chain at all.',
  stars: [720, 880, 1100], target: 1100, coins: 40,
  simulatorLesson: 'mevProtect',

  examples: [
    {
      contextTag: '[Validator operator, understanding MEV-Boost economics]',
      scenario: 'James runs 3 Ethereum validators (96 ETH staked). Without MEV-Boost, his APY is 4.1%. With MEV-Boost, it is 6.3%. He wants to understand where the extra 2.2% comes from.',
      outcome: 'The extra 2.2% APY is MEV income distributed as follows: searchers detect opportunities in the public mempool (sandwich attacks, arbitrage, liquidations). They pay builders to include their bundles in a specific order. Builders pass most of this value to validators as "block value" — the bid for the right to propose a specific block. James\'s MEV-Boost relay shows him block bids from multiple builders; he takes the highest. Over a year, the MEV income flowing to his 96 ETH represents value extracted from: DeFi users whose swaps were sandwiched, arbitrage opportunities between DEXs (which is a social good — keeping prices efficient), and liquidation bonuses. The breakdown varies: in low-volatility periods, sandwich MEV dominates. In high-volatility periods, arbitrage MEV from large price moves across DEXs dominates. James\'s income is real — it comes from somewhere.',
    },
    {
      contextTag: '[DeFi user, comparing MEV protection options]',
      scenario: 'Amara makes 3 large DeFi swaps per week, averaging $15,000 each. She wants the best MEV protection for her specific usage. She evaluates: Flashbots Protect RPC, MEV Blocker, CowSwap.',
      outcome: 'Flashbots Protect: routes to Flashbots\' builder network. Free. Eliminates most sandwich attacks. Limitation: transaction may be delayed if Flashbots builder is not winning blocks in a given slot. 99% effective against sandwich bots. MEV Blocker RPC: routes to multiple builder networks simultaneously (not just Flashbots). Provides "MEV kickbacks" — if a backrunner profits from your transaction, MEV Blocker returns a portion of that profit to you. Better for large trades. CowSwap: orders matched off-chain in batch auctions. No pending mempool presence. Direct buyer-seller matching eliminates MEV structurally (not just protects against it). Execution price may differ slightly from spot due to batch settlement. Best for pairs with active CowSwap solver competition. Recommendation: use MEV Blocker RPC for general DeFi use on MetaMask, use CowSwap specifically for large ETH/stablecoin swaps above $10,000.',
    },
    {
      contextTag: '[Protocol builder, understanding PBS implications]',
      scenario: 'Priya is building a DeFi protocol and wants to understand how PBS (Proposer-Builder Separation) affects her protocol\'s security. She has heard that centralised builders could pose risks.',
      outcome: 'PBS centralisation concern: as of 2024, roughly 80% of Ethereum blocks are built by 3-4 major block builders (BeaverBuild, Titan Builder, rsync-builder). This concentration means a small number of entities control which transactions are included in most blocks. Risk 1 (Censorship): a builder that receives a government directive to exclude transactions from specific addresses has significant market power to enforce it — they build 80% of blocks. Risk 2 (Timing games): large builders can hold transaction inclusion until the last moment of a block slot, giving them more time to find optimal MEV bundles — at the cost of normal user latency. Risk 3 (Miner extractable value for protocols): protocols whose state changes are visible to builders can have their internal mechanics exploited. For Priya\'s protocol: design with commit-reveal schemes for sensitive operations, use private RPCs for large transactions, and consider protocol-level MEV mitigation (like CowSwap\'s batch auction design) if user fairness is critical.',
    },
  ],

  keyTakeaway: 'The MEV supply chain (searchers → builders → validators) is now central to Ethereum\'s economics — MEV-Boost runs on 90%+ of validators, giving block builders significant influence over transaction inclusion and ordering; users\' best protection is eliminating mempool exposure entirely through private RPCs or intent-based systems like CowSwap.',

  guidedPractice: [
    {
      question: 'What is the role of a "relay" in MEV-Boost and why is it necessary?',
      options: [
        'The relay is a backup system that processes transactions when the primary mempool is congested',
        'The relay is a trusted intermediary between builders and validators that shows validators the block\'s value without revealing its contents — preventing validators from selectively including only the most profitable transactions themselves (validator-builder collusion) while still allowing them to choose the highest-value block.', // ✓
        'The relay converts MEV rewards from ETH to stablecoins before paying validators',
        'The relay stores transaction bundles from searchers and automatically submits them to the blockchain',
      ],
      correct: 1,
      hint: 'Why would showing validators the full block contents before they commit to it be dangerous? What does the relay hide?',
      explanation: 'Without a relay: if validators received the full block content from builders, they could extract additional MEV themselves — by reordering transactions within the received block before proposing it. This is "validator front-running" and would undermine the searcher-builder relationship. With a relay: the builder sends a sealed block with only the value (bid amount) visible. The validator commits to the sealed block (and receives payment) before seeing the contents. Once committed, the relay reveals the full block. This design: (1) Prevents validators from modifying the block after seeing its contents. (2) Allows validators to choose the most valuable block fairly. (3) Protects searcher-constructed bundles from being reorganised by validators. The relay is a trust layer — it must be trusted not to collude with builders. Ultra Sound Money and BloXroute are major relays with different trust models (some requiring signed commitments, others more permissive).',
    },
    {
      question: 'CowSwap eliminates MEV structurally rather than just protecting against it. What is the specific mechanism?',
      options: [
        'CowSwap uses Flashbots private mempool to hide all orders from MEV bots',
        'CowSwap collects orders off-chain and settles them as a batch at a uniform clearing price in a single on-chain transaction — there is no individual pending order in the mempool for bots to target, and the batch settlement\'s final state is known before it appears on-chain, providing nothing for a frontrunner to exploit', // ✓
        'CowSwap routes all trades through Uniswap\'s private execution layer, which charges MEV bots directly',
        'CowSwap uses zero-knowledge proofs to hide trade intentions until after block inclusion',
      ],
      correct: 1,
      hint: 'What do sandwich bots need to exist — a pending order they can see before it executes. Does CowSwap create such an order?',
      explanation: 'CowSwap\'s MEV-elimination mechanism: users sign trade intents off-chain (no on-chain transaction, nothing in the mempool). In each batch window, "solvers" collect all signed intents and compute the optimal settlement — matching buyers and sellers directly (CoW = Coincidence of Wants) or routing through AMMs. The solver submits one settlement transaction with all matched trades. What a sandwich bot sees in the mempool: a single settlement transaction with already-determined outcomes. To frontrun this: a bot would need to insert a transaction before the settlement that somehow changes the clearing price — but since the settlement price is determined by the batch solver, not by AMM state at execution time, frontrunning the settlement does not change individual order outcomes. The batch architecture severs the causal link between "I can see your order" and "I can profit by frontrunning it."',
    },
    {
      question: 'Builder centralisation means 3-4 entities build 80% of Ethereum blocks. What specific risk does this create for transaction censorship?',
      options: [
        'Centralised builders charge higher fees that increase costs for all Ethereum users',
        'If regulators require major builders to exclude transactions from sanctioned addresses, 80% of blocks might exclude those transactions — making them effectively uncensorable only in the remaining 20% of blocks, significantly degrading the censorship-resistance property Ethereum is designed to guarantee', // ✓
        'Centralised builders can delay transactions from competing DeFi protocols to favour their own products',
        'Builder centralisation only affects MEV extraction, not transaction censorship which is validator-controlled',
      ],
      correct: 1,
      hint: 'Ethereum\'s censorship resistance relies on no single actor controlling transaction inclusion. What happens when 3-4 builders collectively control 80% of blocks?',
      explanation: 'Censorship-resistance requires that no entity can prevent a valid transaction from ever being included. Ethereum\'s PoS design distributes this across 900,000+ validators — no single validator controls more than a tiny fraction of blocks. MEV-Boost centralisation concentrates block building in 3-4 entities. If OFAC or another regulator requires these builders to exclude transactions from certain addresses (as happened with Tornado Cash addresses post-OFAC sanctions), the sanctioned transactions can still be included by validators who do not use MEV-Boost — but they must build blocks themselves, forgoing the MEV-Boost income. At 10% of validators building their own blocks, 10% of blocks can include censored transactions — they will eventually get included, but with significant delay. This is a real and ongoing debate in Ethereum governance. PBS enshrined in the protocol is proposed as a more decentralised long-term solution.',
    },
    {
      question: 'MEV Blocker RPC offers "MEV kickbacks" — returning some MEV profit to the user. How is this mechanically possible?',
      options: [
        'MEV Blocker takes a fee from all transactions and redistributes it to users who report sandwich attacks',
        'MEV Blocker routes transactions to multiple builders simultaneously and includes terms that allow backrunners (bots that profit from the price impact after your transaction) to compete to include your transaction — splitting a portion of the backrun profit back to the transaction sender via the Coinbase field.', // ✓
        'MEV Blocker connects to Ethereum validators directly, bypassing builders, and returns their MEV income to users',
        'MEV kickbacks are funded by MEV Blocker\'s venture capital investors as a user acquisition strategy',
      ],
      correct: 1,
      hint: 'Why would a backrunner pay to include your transaction? What do they get from the price impact you create?',
      explanation: 'Backrun MEV mechanics: your large swap creates a price impact — after your ETH → USDC trade, ETH is cheaper on Uniswap than on other DEXs. An arbitrage bot (backrunner) sees this and immediately arbitrages the price discrepancy, buying ETH on Uniswap (now cheaper) and selling on other venues. The backrunner profits from the price discrepancy your trade created. MEV Blocker\'s innovation: it includes your transaction in a bundle that explicitly allows competitive backrunning, but requires backrunners to bid for the right to backrun it. The winning backrunner pays a portion of their profit via the "Coinbase" field (a payment to the transaction sender that validators pass through). Your transaction gets the benefit of the backrun revenue instead of losing it entirely to MEV bots. The sandwich attack (frontrun + backrun) is still prevented — only the backrun component is monetised and returned.',
    },
    {
      question: 'What is the difference between MEV-Boost and enshrined PBS, and why does the distinction matter?',
      options: [
        'MEV-Boost is run by validators; enshrined PBS is run by the Ethereum Foundation',
        'MEV-Boost is an opt-in external software where validators voluntarily connect to relays and builders — it can be turned off and requires trust in relay operators. Enshrined PBS builds the proposer-builder separation directly into the Ethereum protocol, making it mandatory, trustless, and resistant to relay collusion.', // ✓
        'Enshrined PBS eliminates MEV entirely by making all transaction ordering random',
        'The distinction is primarily legal — MEV-Boost is regulated while enshrined PBS is not',
      ],
      correct: 1,
      hint: 'What does "enshrined" mean in the context of Ethereum protocol changes? How does an in-protocol feature differ from external software?',
      explanation: 'MEV-Boost (current state): voluntary external software run by ~90% of validators. Relies on trusted relays to provide the sealed-block auction. If a relay is dishonest, it could collude with builders to extract additional value. Validators who distrust relays can opt out — but lose MEV income if they do. Enshrined PBS (proposed): Proposer-Builder Separation written directly into the Ethereum consensus layer. No relay needed — the cryptographic commitment scheme is enforced by the protocol itself. All validators participate automatically. Builder bids are cryptographically verifiable without trusting a third-party relay. Censorship resistance improves because the in-protocol design can include anti-censorship mechanisms (e.g., "inclusion lists" that force certain transactions into blocks). Enshrined PBS is a multi-year development effort — it requires significant protocol changes and is one of the major items on Ethereum\'s post-Merge roadmap.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 240 — BOSS: The Complete Security & Research Picture
// ─────────────────────────────────────────────────────────────────────────────

const L240: IslandLevel = {
  id: 240, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: The Complete Security & Research Picture',
  isBoss: true,

  explanation: `
You have completed Island 17 — Security & Research. Here is the synthesis before the boss challenge.

Address poisoning is industrialised: bots generate look-alike addresses within seconds of any transaction. Clipboard hijacking malware substitutes addresses at paste time. The definitive fix: hardware wallet address book (address flows from device storage, bypassing clipboard) or QR code transfer (optical transmission with no clipboard surface). For every large transfer: verify the complete address on the hardware wallet's own screen.

MEV extracts $500M+ annually from Ethereum users. The attack taxonomy: sandwich (frontrun + backrun around your swap), frontrunning (copy your transaction with higher gas), JIT liquidity (steal LP fees on large trades), liquidation races. Flashbots Protect RPC eliminates sandwich attacks at zero cost — change MetaMask RPC, done. CowSwap eliminates MEV structurally via off-chain batch auction matching.

Protocol security evaluation: read the audit report (severity, fix status, acknowledged findings). Check for post-audit upgrades introducing unreviewed code. The Euler Finance hack came through code added after 6 audits. Proxy contracts can change logic silently — always check whether upgrades require timelocked multisig. Automated tools: GoPlus Security (honeypot, mint authority, pausable), DeFi Safety (governance health).

On-chain investigation methodology: follow the money (forward trace), find the funding source (backward trace), use entity labels (Arkham, Nansen), correlate across chains (bridge events), build SQL queries on Dune for pattern detection. Exchange deposit addresses are the critical junction: KYC-linked identity, subject to law enforcement subpoena.

Advanced OPSEC scales with portfolio value: dedicated device eliminates software attack surfaces; LLC structure separates identity from holdings; geographic multisig defeats physical coercion; succession planning with attorney prevents permanent loss at death.

DeFi tax complexity: every swap is a disposal, LP provision is a disposal, staking rewards are income at receipt. US: no wash sale rule (loss harvest + immediate re-buy is valid). UK: 30-day bed-and-breakfasting rule defeats same-asset loss harvest. Track every event with Koinly or CoinTracker.

Incident response: first 5 minutes — revoke approvals, move assets to clean-keyed wallet, preserve forensic evidence. Exchange notification with specific transaction data is the only realistic recovery path. On-chain transactions are irreversible without exchange intervention.

Smart contract security without code knowledge: verify source code (Etherscan checkmark), identify admin functions (onlyOwner, pause, blacklist, mint), check proxy upgrade controls (timelocked multisig), run automated scans (GoPlus, TokenSniffer). Renounced ownership eliminates admin abuse risk.

MEV supply chain: searchers → builders → proposers (validators). MEV-Boost is voluntary software enabling the auction. Enshrined PBS will make it protocol-native. Builder centralisation (~80% of blocks from 3-4 entities) creates censorship-resistance risk for the Ethereum network.
  `.trim(),

  fact: 'Security & Research synthesis: address poisoning (hardware address book, QR workflow), MEV (sandwich taxonomy, Flashbots Protect, CowSwap batch auction), protocol evaluation (audit severity, post-upgrade code, GoPlus), on-chain investigation (forward/backward trace, Arkham/Dune), OPSEC at scale (dedicated device, geographic multisig), DeFi tax (every swap = disposal, staking = income), incident response (revoke first, preserve evidence), smart contract checks (verification, admin functions, proxy controls).',
  plain: 'This island covered the full security stack: stop address poisoning with hardware address books, protect swaps from MEV bots with Flashbots or CowSwap, evaluate protocols by reading their actual audit reports, investigate suspicious transactions on-chain with Etherscan and Arkham, protect large holdings with geographic multisig and dedicated devices, track every DeFi event for tax, and have an incident response plan ready before you need it.',
  stars: [2200, 2700, 3400], target: 3400, coins: 100,
  simulatorLesson: 'securityBoss',

  examples: [
    {
      contextTag: '[Security researcher, full protocol evaluation]',
      scenario: 'Amara wants to deposit $150,000 into a new lending protocol. She evaluates: 1 audit (Trail of Bits, 3 months ago), 1 High finding "Acknowledged — oracle manipulation requires 15-block sustained price deviation" (protocol uses 30-min TWAP Chainlink), proxy contract with 4-of-7 multisig + 72-hour timelock, total TVL $45M, GoPlus shows no honeypot/pausable/mint flags, DeFi Safety score 78/100.',
      outcome: 'Risk assessment across all dimensions: Audit quality: Trail of Bits is top-tier; the 1 acknowledged High is mitigated by the 30-min TWAP (15-block manipulation of a Chainlink TWAP requires sustained capital commitment beyond the economic benefit for $45M TVL). Proxy safety: 4-of-7 multisig with 72-hour timelock is strong — no single actor can upgrade silently, community has 72 hours to exit if a suspicious upgrade is proposed. TVL signal: $45M for a 3-month-old protocol is meaningful but not years-of-security-history. GoPlus clean: no obvious token-level exploits. DeFi Safety 78/100 suggests good but not perfect governance maturity. Decision: the security architecture is sound. Amara deposits $80,000 (not the full $150,000 — 3-month track record earns partial trust, not full trust) and sets Etherscan alerts for: any proxy upgrade proposal, any large withdrawal (>$5M), and oracle price deviation events.',
    },
    {
      contextTag: '[Incident in progress, real-time response]',
      scenario: 'Marcus receives an alert at 2:17 AM: his hot wallet just approved an unknown contract for unlimited USDC spend and that contract called transferFrom in the same block — draining 8,000 USDC. His wallet still holds 4 ETH and 3 NFTs. He has a hardware wallet. Walk through his next 10 minutes.',
      outcome: 'Minute 1 (Revoke): open revoke.cash on his phone. Connect his Ledger hardware wallet. Revoke all remaining approvals on the hot wallet immediately. Cost: $3 in gas. This stops any further automated draining via approved contracts. Minute 2-4 (Move ETH): create a new MetaMask wallet on his phone (fresh seed phrase, generated on clean mobile — not the same device as the hot wallet). Transfer 4 ETH from hot wallet to the new wallet. Set gas to "Fast." Minute 4-7 (Move NFTs): use mobile OpenSea or a transfer tool to move NFTs from hot wallet to new wallet. Minute 7-9 (Trace attack): open Etherscan. Find the malicious contract address from the approval transaction. Check Arkham — it is linked to a known drainer kit. Post to relevant crypto security Twitter accounts with the contract address to warn others. Minute 10 (Preserve evidence): take screenshots of every recent action on the laptop that may be compromised. Do not wipe it. Total recovered: 4 ETH + 3 NFTs. Unrecoverable: 8,000 USDC.',
    },
    {
      contextTag: '[Tax calculation, complex DeFi year]',
      scenario: 'Priya\'s DeFi activity for the year (US, simplified): bought ETH at $1,500 total basis, provided to Uniswap LP at $2,000 (current value), removed LP at $2,200 (ETH + USDC), received $800 in staking rewards (at $1,900 average price), sold all staking rewards at $2,100. Calculate her taxable events and amounts.',
      outcome: 'Event 1 (LP provision at $2,000): disposed of ETH with $1,500 basis at $2,000 value. Capital gain: $500. Acquired LP tokens at $2,000 basis. Event 2 (LP removal at $2,200): disposed of LP tokens ($2,000 basis) at $2,200 value. Capital gain: $200. Event 3 (Staking rewards, $800 received at $1,900 avg): ordinary income = $800. Cost basis of staking rewards = $800. Event 4 (Sale of staking rewards at $2,100 total): proceeds $2,100, basis $800, capital gain = $1,300 × (short-term if held less than 1 year = taxed as ordinary income). Total: $500 + $200 = $700 capital gains (from ETH cost basis appreciation). $800 ordinary income (staking rewards). $1,300 short-term capital gain (staking reward appreciation). Without proper tracking: Priya would have missed the LP provision disposal event ($500 gain) entirely.',
    },
  ],

  keyTakeaway: 'Security mastery is not about any single tool or technique — it is about having layered, proportionate defences at every level: technical (hardware wallet, private RPC, contract verification), operational (incident response plan, dedicated device, geographic multisig), financial (tax tracking, succession planning), and investigative (on-chain forensics methodology) — and knowing which layer applies to which threat.',

  guidedPractice: [
    {
      question: 'Your on-chain wallet monitor alerts you: an unknown address just called "approve(maliciousContract, MAX_UINT256)" on your USDC. You have 2 minutes before the draining transaction executes. What is the single most important action?',
      options: [
        'Transfer all USDC to a new wallet address immediately',
        'Revoke the malicious approval immediately using revoke.cash — this cancels the unlimited spend permission before the draining transaction executes. If successful, the malicious contract loses the ability to call transferFrom and the drain is prevented.', // ✓
        'Contact your exchange to freeze your account',
        'Disconnect your MetaMask from all connected sites immediately',
      ],
      correct: 1,
      hint: 'An approval gives a contract permission to spend your tokens in future transactions. What cancels that permission?',
      explanation: 'Approval attack timing: the attacker\'s malicious contract now has MAX_UINT256 approval to spend your USDC. It will call transferFrom in a subsequent transaction (usually in the next block or immediately via a bot). The revoke transaction sets your approval to 0 — cancelling the permission. If your revoke transaction is included before the draining transaction: the drain fails (the contract tries to transferFrom but your approval is now 0). If the drain executes first: revocation prevents further draining but the already-executed drain cannot be reversed. Gas strategy: submit the revoke transaction with a high gas tip (above the likely gas of the attacker\'s drain bot) to maximise the chance of front-running the drain in the block ordering. This is a valid use of MEV-style gas competition by the victim.',
    },
    {
      question: 'You find a DeFi protocol with: no audit, no verified source code, GoPlus shows "Mint Authority Active + Transfer Pausable," 4,000% APY, and a Telegram group with 50,000 members. What is the correct assessment?',
      options: [
        'High risk but potentially high reward — the 4,000% APY justifies a small speculative position',
        'Clear scam indicators: unverified contract (cannot review code), active mint authority (team can print infinite tokens), transfer pausable (team can prevent selling), and 4,000% APY is mathematically unsustainable and used to attract capital before an exit. The community size is irrelevant — social proof is easily manufactured. Do not interact.', // ✓
        'Moderate risk — the high APY compensates for the security flags',
        'Safe if you only invest what you can afford to lose — the risk is known and acceptable',
      ],
      correct: 1,
      hint: 'Count the independent red flags. Is any single one acceptable? What do they collectively indicate?',
      explanation: 'Red flag aggregation: each flag independently is a warning; all four together is a textbook rug pull setup. (1) No verified source code: you cannot read what the contract does. (2) Mint authority active: the team can create infinite tokens and sell them against your investment. (3) Transfer pausable: the team can prevent you from selling — a honeypot mechanism. (4) 4,000% APY: mathematically unsustainable; the "yield" comes from new depositor capital (Ponzi structure), not real protocol revenue. The 50,000 Telegram members are the social proof manufactured to attract the next depositor before the exit. The correct response is zero interaction — not even connecting your wallet to the site, as malicious dApps can request approvals through connection flows. The "I\'ll only risk what I can afford to lose" framing is a cognitive bias that normalises interacting with known scams.',
    },
    {
      question: 'You are setting up security for a $500,000 portfolio. Rank these security measures in order of implementation priority: (A) Geographic multisig, (B) Hardware wallet, (C) Flashbots Protect RPC, (D) Dedicated crypto device.',
      options: [
        'A → D → C → B',
        'B → C → D → A — Hardware wallet is the foundational layer every holder needs; Flashbots Protect is a 2-minute configuration protecting every swap; dedicated device eliminates the malware attack surface; geographic multisig is the capstone for the largest holdings requiring physical coercion resistance.', // ✓
        'C → B → A → D',
        'D → A → B → C',
      ],
      correct: 1,
      hint: 'What is the most impactful security improvement for the widest range of threats? What is the most operationally complex to implement?',
      explanation: 'Security implementation priority logic: (B) Hardware wallet — foundational. Protects private keys from every software attack. Zero hardware wallet = zero security regardless of other measures. Should be first step at any portfolio value. (C) Flashbots Protect RPC — 2-minute MetaMask configuration change. Eliminates sandwich MEV on every subsequent swap. Highest impact per unit of effort of any security measure. Do immediately after hardware wallet setup. (D) Dedicated device — requires acquiring a separate device, significant setup, and discipline. Eliminates the software attack surface (browser extensions, email malware). High impact, moderate effort. Implement after the quick wins (B, C). (A) Geographic multisig — requires coordinating multiple hardware wallets in different physical locations, legal structure setup, key holder briefing, and succession planning. Highest operational complexity. Most important for the highest-value holdings where physical threat model applies. Final implementation after foundational layers are solid.',
    },
    {
      question: 'A sophisticated on-chain investigator is tracing stolen funds. The attacker mixed the funds through Tornado Cash 60 days ago. What investigative approaches could still lead to identification?',
      options: [
        'None — Tornado Cash is mathematically untraceable and no investigation can proceed past it',
        'Monitor all wallets that withdrew from Tornado Cash in the 60-day window following the attack deposit for any subsequent KYC exchange deposits, cross-chain bridge events, ENS registrations, or any other identity-linking actions. The mixer breaks the direct chain but the attacker must eventually interact with identifiable infrastructure.', // ✓
        'Request the Tornado Cash smart contract to reveal the withdrawal address — this is possible through a court order',
        'Compare the exact amounts deposited and withdrawn from Tornado Cash to narrow the suspect list',
      ],
      correct: 1,
      hint: 'Tornado Cash breaks the on-chain graph. What does it not break? When must the attacker re-emerge from anonymity?',
      explanation: 'Post-mixer investigation strategy: Tornado Cash breaks the transaction graph — you cannot prove which specific withdrawal corresponds to which deposit. What investigators can do: (1) Temporal profiling: attackers typically deposit and withdraw within a specific time range. Monitor all withdrawals from the attacker\'s used denomination pool during the 2-4 week period after the deposit. This creates a "suspect set" of withdrawal addresses. (2) Amount analysis: if the attacker deposited 100 ETH across 10 × 10 ETH leaves, they withdraw 10 × 10 ETH. Matching deposit timing to withdrawal timing can narrow suspects. (3) Post-withdrawal monitoring: every wallet in the suspect set is monitored for any subsequent action. The moment a suspect wallet deposits to Binance, mints an ENS name, or interacts with any KYC-linked service, investigators have their target. (4) Gas wallet correlation: wallets that withdrew from Tornado Cash and then received gas from the same funding address as the original attack wallet are strongly linked. Most significant real-world MEV or hack identifications through Tornado Cash used this patient post-withdrawal monitoring approach.',
    },
    {
      question: 'Your UK-based friend earned £20,000 from DeFi yield farming this year (£12,000 from staking rewards, £8,000 from LP fees). They plan to offset this with a £15,000 crypto loss by selling and immediately re-buying on the same day. Will this work?',
      options: [
        'Yes — capital losses always offset capital gains and income in the UK',
        'No — the £15,000 loss from the same-day sale and re-purchase is disallowed by the UK\'s 30-day bed and breakfasting rule. The sale is matched against the re-purchase at the same price, resulting in zero loss recognised. The friend must wait 31+ days before re-purchasing to harvest the loss.', // ✓
        'Yes — the wash sale rule does not apply in the UK, same as the US',
        'Partially — the rule only applies to losses above £10,000 in a single transaction',
      ],
      correct: 1,
      hint: 'Apply the UK 30-day rule: same asset, same person, within 30 days. Does this transaction meet all three conditions?',
      explanation: 'UK bed and breakfasting rule application: the friend sells Crypto X at a £15,000 loss and re-buys the same Crypto X on the same day. Same asset: yes. Same person: yes. Within 30 days: yes (same day). TCGA 1992 s.106A applies: the sale is matched against the re-purchase. Sale proceeds = re-purchase cost = same price (same day). Net capital gain/loss from the matched transaction = zero. The £15,000 loss is not recognised. The friend still has £20,000 in taxable DeFi income. Additionally, the staking rewards (£12,000) are income, not capital gains — capital losses cannot offset income tax in the UK (only capital gains). The friend should consult a UK crypto tax accountant for legitimate tax planning. Valid approaches: harvest losses from other positions held more than 30 days, or genuinely crystallise the loss by waiting 31+ days to re-buy.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: `Your on-chain monitoring tool sends three simultaneous alerts at 11:47 PM:\n\n1. Your primary hot wallet just approved "Unknown Contract 0xDEAD...BEEF" for unlimited USDC spend (you did not initiate this)\n2. The same unknown contract is queued to call transferFrom in approximately 90 seconds (you can see it in the mempool)\n3. Your hot wallet holds: 2.5 ETH, 15,000 USDC, and a Bored Ape NFT worth approximately $40,000\n\nYou have a Ledger hardware wallet plugged in. Your phone is on a separate carrier from your laptop. You also see the attack contract has already drained 4 other wallets in the past 2 hours.\n\nDescribe your exact actions in priority order and explain the reasoning behind each step. Time is critical.`,
      scoringCriteria: [
        'Correctly identifies revocation as the first action — opens revoke.cash on a separate device (phone), connects the hardware wallet, and revokes the malicious USDC approval before the 90-second drain executes. Explicitly states why revocation takes priority over asset movement (approval gives ongoing drain capability even after assets move).',
        'Immediately creates a new wallet on the clean phone (not the potentially compromised laptop) — recognises that new wallet seed phrases must be generated on clean hardware not previously connected to the compromised hot wallet.',
        'Transfers assets in correct order based on value and transfer speed: USDC first (ERC-20 transfer, fast), then ETH, then the Bored Ape (NFT transfer may be slower and is the highest-value single asset — prioritise starting it early).',
        'Uses high gas ("Fast" or manual gas tip increase) on both the revoke and asset transfer transactions to outcompete the attacker\'s drain transaction in block ordering.',
        'Does not wipe the laptop — recognises the attack vector must be preserved for forensic investigation, and makes a conscious decision to keep it disconnected from internet but not reformatted until investigation is complete.',
      ],
    },
    {
      type: 'judgment-escalation',
      scenario: `You are reviewing a governance proposal on a DeFi protocol you have $80,000 deposited in. The proposal reads:\n\n"Upgrade Proposal #47 — Risk Parameter Optimisation\nThis proposal upgrades the liquidation logic contract to a new implementation that improves capital efficiency by 35%.\nNew implementation contract: 0xNEW...CODE (not yet verified on Etherscan)\nAudit: Planned post-deployment — expected within 60 days of upgrade execution\nTimelock: 24 hours (standard)\nVoting period: 48 hours\nCurrently passing with 67% approval"\n\nYou have 18 hours remaining in the voting period. What do you do?`,
      scoringCriteria: [
        'Immediately withdraws or plans to withdraw the $80,000 within the 24-hour timelock period if the proposal passes — recognises that the upgrade will execute 24 hours after vote close, giving a specific exit window, and correctly plans around that timeline.',
        'Votes against the proposal with a detailed forum explanation: unverified contract code, audit planned post-deployment (not pre-deployment), and 24-hour timelock on a liquidation logic change (insufficient review time for $X in TVL affected).',
        'Attempts to rally other community members to vote against — posts in the protocol\'s governance forum, Discord, and relevant Twitter accounts with the specific concerns about unverified code and post-deployment audit. Recognises this is a responsibility to the broader protocol community, not just personal protection.',
        'Correctly identifies that a legitimate protocol upgrade should have: verified source code before the vote, completed audit before execution, and a minimum 72-hour timelock for liquidation logic changes (core protocol logic affecting user funds).',
        'Sets Etherscan monitoring alerts for the upgrade execution transaction and the new implementation contract, so they receive immediate notice if the upgrade executes and can respond if the new implementation shows unexpected behaviour.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L236–L240)
// ─────────────────────────────────────────────────────────────────────────────

const ISLAND_SECURITY_LEVELS_B: Record<number, IslandLevel> = {
  236: L236,
  237: L237,
  238: L238,
  239: L239,
  240: L240,
};

export { ISLAND_SECURITY_LEVELS_B };

export const ISLAND_SECURITY_LEVELS: Record<number, IslandLevel> = {
  ...ISLAND_SECURITY_LEVELS_A,
  ...ISLAND_SECURITY_LEVELS_B,
};
