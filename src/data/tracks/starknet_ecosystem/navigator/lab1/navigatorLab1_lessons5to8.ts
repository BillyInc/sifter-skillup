// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 1 — DeFi Mental Models · LESSONS 5–8
// Combine with navigatorLab1_lessons1to4.ts and navigatorLab1_boss.ts

export const LAB1_LESSONS_5_TO_8 = [

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Risk Taxonomy in DeFi
// ─────────────────────────────────────────────────────────────
{
  id: 'defi-risk-taxonomy',
  title: 'Risk Taxonomy in DeFi',
  explanation: `
Euler Finance was a DeFi lending protocol on Ethereum with $750 million in deposits. In 2023, it was exploited for $197 million in a single transaction. The code had been audited. The protocol had $750M in TVL. Fourteen months later, through extraordinary on-chain negotiation, the hacker returned 90% of the funds. Not all DeFi stories end this way. The Euler story illustrates that DeFi risk is multidimensional — smart contract risk is just one category.

Smart contract risk: bugs in protocol code. Even audited code has vulnerabilities. More complex protocols have larger attack surfaces.

Oracle risk: price feed manipulation or failure. Most DeFi protocols depend on external price feeds. If the oracle is wrong — through attack, error, or delay — protocols can trigger false liquidations or enable theft.

Liquidity risk: inability to exit at fair value. In a high-utilisation lending pool, you may not be able to withdraw immediately because all funds are borrowed.

Counterparty risk: exists in DeFi through borrower defaults (handled by liquidation), stablecoin depegs, and bridge operator failures.

Regulatory risk: government action restricting a protocol — affecting front-end websites even if underlying smart contracts remain accessible.

Governance risk: token holders voting to change protocol parameters against your interests — fees, collateral ratios, or other terms.

Bridge risk: bridge contracts are an additional attack surface. Bridge exploits have been among DeFi's most costly events.

Composability risk: cascading failure. When protocols build on each other, a failure in one propagates through many. Your protocol's code may be perfect, yet you lose funds because a dependency failed.

Self risk: phishing attacks, approving malicious contracts, losing keys. The leading cause of individual DeFi losses.
  `.trim(),
  visualPrompt: 'Nine risk categories as a matrix: rows are categories, columns are impact and probability. Each cell colour-coded green/yellow/red.',
  visualType: 'static',
  visualUrl: 'defi-risk-taxonomy-matrix',
  examples: [
    {
      contextTag: '[Composability risk cascade, 2022]',
      context: 'Several DeFi protocols built on top of each other experienced cascading failures when Celsius (a centralised lender) became insolvent, unable to repay loans to on-chain protocols.',
      scenario: 'Protocol A had lent funds to Celsius via an on-chain arrangement. When Celsius defaulted, Protocol A\'s expected repayments failed. Protocol A\'s depositors — who had no direct Celsius exposure — lost funds.',
      outcome: 'Users of Protocol A did nothing wrong but lost money because their protocol depended on Celsius. Identifying composability risk requires mapping every protocol your protocol interacts with, not just the one you use directly.',
    },
    {
      contextTag: '[Oracle manipulation, Mango Markets 2022]',
      context: 'In October 2022, Avraham Eisenberg manipulated the MNGO token price on Mango Markets (Solana) to drain $114 million from the protocol treasury.',
      scenario: 'Eisenberg bought MNGO futures on Mango, then drove up the MNGO spot price by buying heavily on FTX. Mango\'s oracle used spot price to value his position. His collateral value spiked — allowing him to borrow $114 million. He drained the treasury.',
      outcome: 'The oracle reported the true current market price — it was not technically wrong. But the protocol\'s design allowed a single trader to manipulate it with enough capital. This is oracle risk. Starknet\'s Pragma oracle uses time-weighted average prices to reduce this attack vector.',
    },
    {
      contextTag: '[Self risk, phishing attack, BadgerDAO 2022]',
      context: 'In 2022, BadgerDAO users lost $120 million when an attacker injected malicious scripts into the protocol\'s front-end website.',
      scenario: 'Users visited the legitimate BadgerDAO website. The attacker had injected code prompting users to approve unlimited token spending for an attacker-controlled address. Users approved what looked like a normal transaction.',
      outcome: 'The smart contracts were not exploited. The users\' own actions — approving a transaction they did not understand — caused the loss. Self risk is the most preventable category. Before approving any transaction: read what you are approving, verify the contract address against official sources, and be suspicious of unlimited approval requests.',
    },
  ],
  keyTakeaway: 'Smart contract risk is only one of nine distinct ways you can lose money in DeFi — identifying which risks apply to each specific position is what separates managed exposure from blind hope.',
  guidedPractice: [
    {
      question: 'You supply USDC to a Starknet lending protocol at 95% utilisation. What risk does this primarily represent?',
      options: [
        'A. Smart contract risk — high utilisation strains the contract code',
        'B. Liquidity risk — at 95% utilisation, only 5% of deposits can be withdrawn immediately',
        'C. Oracle risk — high utilisation affects price feeds',
        'D. Counterparty risk — borrowers are more likely to default at high utilisation',
      ],
      correct: 1,
      hint: 'At 95% utilisation, how much of the total deposit pool is available for withdrawal right now?',
      explanation: 'B is correct. At 95% utilisation, only 5% of total deposits can be withdrawn immediately. If you need funds urgently, you must wait for borrowers to repay. This is liquidity risk — inability to exit at fair value on demand. Option A is incorrect — utilisation is an economic metric, not a code strain.',
    },
    {
      question: 'Your Starknet DeFi protocol uses Pragma for price data and AVNU for liquidation routing. A critical bug is discovered in Pragma. Which risk category applies?',
      options: [
        'A. Smart contract risk — the protocol\'s own code is vulnerable',
        'B. Oracle risk — your protocol depends on Pragma\'s price data',
        'C. Composability risk — your protocol uses Pragma as a dependency, so its failure cascades to you',
        'D. Both B and C — it is oracle risk AND composability risk simultaneously',
      ],
      correct: 3,
      hint: 'Multiple risk categories can apply simultaneously. What category is Pragma? What category describes the dependency?',
      explanation: 'D is correct. Oracle risk (Pragma is an oracle — a bug means wrong prices) AND composability risk (your protocol depends on Pragma — a failure propagates to you even though your own code is fine). Risk categories are not mutually exclusive.',
    },
    {
      question: 'A user approves "unlimited spend" of their USDC for an address found in a tweet claiming to be the official AVNU contract. What risk category is this?',
      options: [
        'A. Smart contract risk — the real AVNU contract has a vulnerability',
        'B. Regulatory risk — approving unlimited spend may violate financial regulations',
        'C. Self risk — the user signed a transaction without verifying the contract address against official AVNU documentation',
        'D. Composability risk — AVNU interacts with other protocols that could drain funds',
      ],
      correct: 2,
      hint: 'Who made the mistake that created the risk? What action could have prevented it?',
      explanation: 'C is correct. The user approved an unknown contract address from Twitter without verifying it. This is self risk: the loss is caused by the user\'s own action. Correct action: never trust addresses from social media; always verify against official documentation; never approve unlimited spend without careful verification.',
    },
    {
      question: 'A government bans DeFi for its citizens. You hold $50,000 in a Starknet DeFi protocol. What actually happens?',
      options: [
        'A. Your funds are frozen immediately by the blockchain',
        'B. The front-end website may be blocked, but the smart contract is still running — your funds are accessible via direct contract interaction',
        'C. The Starknet Foundation freezes your account on government request',
        'D. Your funds are automatically returned to your wallet',
      ],
      correct: 1,
      hint: 'A government cannot reach into a deployed smart contract. What can they actually affect?',
      explanation: 'B is correct. Governments can restrict front-end websites (servers in their jurisdiction). They cannot delete or modify deployed smart contracts on a decentralised blockchain. Your funds remain in the smart contract, accessible via direct RPC calls or alternative front-ends. Option C is wrong — the Starknet Foundation does not have account control.',
    },
    {
      question: 'Rank the top three risk categories for depositing $100,000 into a 3-month-old Starknet lending protocol with $800,000 TVL and one audit.',
      options: [
        'A. Regulatory, governance, self — in that order',
        'B. Smart contract risk first (new, short track record), liquidity risk second (low TVL), composability risk third (Pragma and AVNU dependencies not yet stress-tested)',
        'C. Self risk, bridge risk, oracle risk — in that order',
        'D. All categories are equally important and cannot be ranked',
      ],
      correct: 1,
      hint: 'What makes this protocol specifically risky? 3 months old, $800K TVL — what does each tell you?',
      explanation: 'B is correct. Smart contract risk is highest — the protocol is only 3 months old, bugs often surface over time. The audit reduces but does not eliminate this. Liquidity risk is second — at $800K TVL, your $100,000 is 12.5% of TVL, meaning withdrawal constraints if utilisation spikes. Composability risk is third — Pragma and AVNU dependencies deserve scrutiny for a young protocol.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'You hold $200,000 across three Starknet positions: (1) $80,000 USDC in Vesu (lending, 18 months old, $45M TVL, two audits), (2) $70,000 in STRK staking via Nethermind validator, (3) $50,000 in an Ekubo LP for a token launched 3 weeks ago ($1.2M liquidity). Identify the dominant risk category for each and rate overall risk level (Low/Medium/High) with one-sentence justification.',
      scoringCriteria: [
        'Position 1: Smart contract risk (dominant) rated Low-Medium — Vesu is established with audits and track record',
        'Position 2: Validator reliability rated Low — Nethermind is a major established operator',
        'Position 3: Smart contract + liquidity + composability risk rated High — 3-week-old token, thin liquidity, LP has IL exposure to unproven asset',
        'Overall: 25% allocation to the high-risk LP identified as dominant portfolio concern',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Starknet protocol publishes: Smart contract audit by Trail of Bits (2 months ago), bug bounty ($250K max), 14 months in production, $62M peak TVL, $41M current TVL. Also: relies on Pragma oracle (used by 12 other protocols), can be upgraded by a 3/5 multisig controlled by the founding team. Identify two non-smart-contract risks this data reveals and explain what each means for a $50,000 depositor.',
      scoringCriteria: [
        'Governance risk: 3/5 multisig by founding team means 3 founders can upgrade the contract without community vote — changing parameters against depositor interests',
        'Composability risk: Pragma shared by 12+ protocols means a Pragma exploit affects all simultaneously — systemic risk',
        'For each risk: specific implication for $50,000 depositor stated',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A first-time DeFi user says: "I checked — the protocol has been audited. Doesn\'t that mean it\'s safe?" Correct their thinking in 4 sentences. Explain what audits do and do not cover, and name at least one risk category an audit does not address.',
      scoringCriteria: [
        'Explains what an audit does: checks for known vulnerability patterns in code at the time of audit',
        'Explains what it does not do: cannot guarantee zero bugs, does not cover oracle attacks or governance risk',
        'Names at least one non-smart-contract risk',
        'Does not dismiss audits — acknowledges they meaningfully reduce smart contract risk',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 6 — Settlement and Custody
// ─────────────────────────────────────────────────────────────
{
  id: 'settlement-and-custody',
  title: 'Settlement and Custody: Finality Without Trust',
  explanation: `
In 1974, Herstatt Bank in Germany failed mid-trading day. Banks in Europe had already paid Deutsche Marks to Herstatt. But Herstatt failed before making the corresponding US dollar payments. $620 million in expected dollars never arrived. This is Herstatt risk — the gap between delivering one side of a trade and receiving the other.

This gap exists in traditional finance everywhere. When you buy a share on the London Stock Exchange, the trade executes at 10am but settles at T+2 — two business days later. For two days, you have sold your cash but do not yet have the shares. Your counterparty has agreed to deliver but has not yet done so.

DeFi eliminates Herstatt risk through atomic settlement. In a DeFi swap, the token you are selling and the token you are receiving change hands in the same transaction. The transaction either completes both sides or neither — guaranteed by the Starknet protocol itself.

Finality is when a transaction is irreversible. On Starknet, L2 finality arrives within seconds — the sequencer accepts it and includes it in a block. Full finality occurs when the STARK proof is accepted by Ethereum — typically 2–12 hours. For most DeFi purposes, L2 finality is sufficient.

Custody means who controls access to an asset. Self-custody: you hold the keys — no intermediary controls them. Third-party custody: you give assets to another entity who holds the keys. In self-custody, losing keys loses assets. In third-party custody, counterparty failure loses assets.

Starknet account abstraction creates a third option: delegated custody. Your wallet is a smart contract with programmable rules. A guardian can help you recover access without ever holding your keys — social recovery, biometrics, and time locks are all native.
  `.trim(),
  visualPrompt: 'Timeline: Traditional T+2 settlement (trade → 2-day gap highlighted red → settlement) vs DeFi atomic (trade = settlement, single point). Below: custody spectrum from self-custody through delegated to third-party.',
  visualType: 'static',
  visualUrl: 'settlement-finality-custody',
  examples: [
    {
      contextTag: '[T+2 settlement risk, SVB collapse]',
      context: 'In March 2023, Silicon Valley Bank collapsed over a weekend. Institutions with Treasury bond trades in T+2 settlement faced complications when their counterparty bank failed.',
      scenario: 'A fund had executed $50M of Treasury bond purchases Thursday. Settlement was due Monday. SVB collapsed Friday night. The fund\'s counterparty for one $12M trade had partial dependency on SVB for clearing.',
      outcome: 'Settlement eventually completed, but the episode highlighted the settlement gap risk. In DeFi, trades settle atomically at execution — there is no two-day window where a counterparty failure can affect settlement.',
    },
    {
      contextTag: '[L2 vs L1 finality, merchant decision]',
      context: 'A merchant accepts USDC as payment for a $5,000 service via Starknet. They ask: when is this payment safe to treat as final?',
      scenario: 'The transaction achieves L2 finality in 4 seconds. Full Ethereum-backed finality comes when the STARK proof is submitted — approximately 2 hours.',
      outcome: 'For most merchants, L2 finality is sufficient — the transaction cannot be reversed by any normal Starknet mechanism. For a $5,000,000 transaction where an adversary might try to exploit sequencer behaviour, waiting for L1 finality provides mathematical certainty.',
    },
    {
      contextTag: '[Delegated custody recovery, Argent Guardian]',
      context: 'Elena has $40,000 in a Starknet wallet secured with Argent X using a hardware wallet as guardian. She loses her phone. She has no seed phrase written down.',
      scenario: 'In a traditional non-custodial wallet, losing the device without a seed phrase means total permanent loss. Elena has a guardian. She reinstalls Argent X on a new phone, connects to her account address, and initiates guardian recovery.',
      outcome: 'Her hardware wallet signs the recovery transaction. After a 24–48 hour security delay (designed to let the real owner cancel fraudulent recovery), her new phone is authorised. She regains access to all $40,000. No seed phrase required. No company held her keys.',
    },
  ],
  keyTakeaway: 'When both sides of a trade complete in the same transaction — or neither completes — no party can fail before delivery, eliminating the delivery-gap risk that has collapsed financial institutions for decades.',
  guidedPractice: [
    {
      question: 'What is the fundamental difference between T+2 settlement and atomic settlement?',
      options: [
        'A. T+2 is slower; atomic is faster — same mechanism, different speed',
        'B. T+2 has a 2-day gap where one party has delivered but the other has not; atomic means both sides complete simultaneously or neither does',
        'C. Atomic settlement requires both parties to be online simultaneously',
        'D. T+2 is guaranteed by government insurance; atomic has no guarantees',
      ],
      correct: 1,
      hint: 'The Herstatt Bank collapse: one party delivered Deutsche Marks, the other failed before delivering dollars. Atomic settlement eliminates this how?',
      explanation: 'B is correct. Atomic means indivisible — both sides happen in the same transaction. No window of vulnerability. Option A describes speed, which is a feature but not the defining characteristic. Option C is false. Option D misstates the guarantee mechanisms.',
    },
    {
      question: 'A Starknet transaction achieves L2 finality after 4 seconds. A friend says "it\'s not really final until it\'s on Ethereum." Are they right?',
      options: [
        'A. Completely correct — L2 finality means nothing without Ethereum confirmation',
        'B. Partially right — L2 finality suffices for almost all DeFi purposes; Ethereum L1 finality adds mathematical certainty from the STARK proof after 2–12 hours',
        'C. Wrong — L2 finality is identical to L1 finality for all practical purposes',
        'D. L2 finality does not exist — all transactions wait for L1 confirmation',
      ],
      correct: 1,
      hint: 'What makes L2 finality meaningful and what does the additional Ethereum confirmation add?',
      explanation: 'B is correct. L2 finality (4 seconds) means the Starknet sequencer accepted and ordered the transaction — it cannot be reversed by normal network activity. L1 finality (2–12 hours) adds STARK proof verification on Ethereum — providing cryptographic certainty. The friend is right that L1 is "more final," but wrong to dismiss L2 as meaningless.',
    },
    {
      question: 'What is the difference between self-custody, third-party custody, and delegated custody on Starknet?',
      options: [
        'A. They differ only in who pays gas fees',
        'B. Self-custody: you hold keys alone. Third-party: a company holds keys. Delegated: a smart contract with guardian rules — you control it but a guardian can help recover without ever holding your keys.',
        'C. All three are equivalent once the Starknet Foundation verifies your identity',
        'D. Delegated custody means equal control shared with Starknet validators',
      ],
      correct: 1,
      hint: 'Who can move assets in each case, and who can help recover access if you lose it?',
      explanation: 'B is correct. Self-custody: only your key controls assets; lose the key, lose assets. Third-party: a company holds assets — their failure = your loss (Celsius). Delegated custody (Argent with guardian): a smart contract with programmed recovery rules — a guardian can help recover but never independently move your assets.',
    },
    {
      question: 'Herstatt Bank failed in 1974, creating what risk for FX trading counterparties?',
      options: [
        'A. The risk that foreign currencies would devalue overnight',
        'B. The risk that one party delivers their side of a currency exchange but the counterparty fails before delivering the other side',
        'C. The risk that a bank\'s own currency reserve would be insufficient',
        'D. The risk that settlement systems would be hacked during a banking failure',
      ],
      correct: 1,
      hint: 'Herstatt received Deutsche Marks from counterparties. What did it fail to deliver?',
      explanation: 'B is correct. Herstatt received Deutsche Marks but failed before making corresponding US dollar payments. The European banks had delivered their side — the Deutsche Marks were gone — and received nothing in return. Atomic settlement in DeFi eliminates this gap entirely.',
    },
    {
      question: 'Elena loses her phone with Argent X. She has a hardware wallet set as guardian. No seed phrase written down. What is the correct statement?',
      options: [
        'A. Her funds are permanently lost without the seed phrase',
        'B. She can contact Argent X customer support to recover her account',
        'C. Her guardian (hardware wallet) can sign a recovery transaction, restoring access after a security delay',
        'D. She must wait for Starknet governance to vote on releasing her funds',
      ],
      correct: 2,
      hint: 'Account abstraction allows programmable recovery rules. What did Elena program into her account?',
      explanation: 'C is correct. Elena programmed a guardian recovery mechanism. Her hardware wallet signs a recovery transaction. After a security delay (cancellable if fraudulent), her new device is authorised. No seed phrase required — the recovery logic is in the smart contract. Option A describes traditional wallets without AA.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-communication',
      scenario: 'Explain settlement risk to a traditional finance professional who trades bonds but has never used DeFi. Make the connection to Herstatt Bank explicit. Explain how DeFi eliminates it. Use their T+2 knowledge as your foundation. 4 sentences.',
      scoringCriteria: [
        'References T+2 and the delivery gap as the bond professional\'s familiar concept',
        'Connects Herstatt to the delivery gap: one party delivers, counterparty fails before the other side arrives',
        'Explains atomic settlement in traditional finance vocabulary: both sides of a trade occur in one indivisible step',
        'Does not use unexplained blockchain jargon throughout',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user receives $180,000 USDC on Starknet. They must send $180,000 EUR to a supplier within 24 hours. Option A: convert USDC→EUR on a regulated exchange (1 hour), then SWIFT to supplier (T+2). Option B: pay supplier directly in USDC if they accept it. Compare settlement risk and speed of each path.',
      scoringCriteria: [
        'Path A timeline: ~1 hour conversion + 2 business days SWIFT = 2+ days total',
        'Path A risks: counterparty risk during SWIFT transmission, exchange custody risk during conversion',
        'Path B timeline: minutes if both on Starknet, no SWIFT gap',
        'Path B settlement risk: atomic — USDC either arrives or does not, no delivery gap',
        'Correctly recommends Path B if supplier accepts USDC as lower settlement risk and faster finality',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Comparing two platforms: Platform A fully non-custodial (8.2% APY). Platform B custodial staking where you send funds to their wallet and receive an IOU token (8.9% APY). List the specific risks unique to Platform B that Platform A does not have. Calculate how many years the extra 0.7% yield takes to compensate for a 50% principal loss if Platform B fails.',
      scoringCriteria: [
        'Platform B unique risks: counterparty risk (company can freeze/lose funds), regulatory risk (company can be shut down), operational risk (company can be hacked at custody level)',
        'Break-even: 50% of $100,000 = $50,000 lost. Extra yield = 0.7% × $100,000 = $700/year. Break-even = $50,000 / $700 = 71.4 years',
        'Correct conclusion: the 0.7% premium takes 71+ years to compensate for a 50% loss',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 7 — Reading DeFi Data
// ─────────────────────────────────────────────────────────────
{
  id: 'reading-defi-data',
  title: 'Reading DeFi Data: TVL, Volume, and Protocol Health',
  explanation: `
In 2020, SushiSwap launched as a fork of Uniswap. Within 72 hours, it reported $1 billion in Total Value Locked. Investors assumed it was an enormous success. Within a week, the anonymous founder sold $13 million of governance tokens and TVL collapsed. The metric alone had told an incomplete story.

Total Value Locked (TVL) is the total dollar value of assets deposited into a protocol at current prices. TVL can increase because of real user deposits, asset price appreciation, or leveraged re-deposits of borrowed funds. Understanding which driver is behind TVL changes its meaning entirely.

Volume measures the total value of transactions in a period — usually 24 hours. Volume is harder to fake than TVL and often better reflects actual product-market fit. A protocol with $500M TVL and $2M daily volume is very different from one with $50M TVL and $40M daily volume.

Protocol revenue is the clearest health indicator — the actual fees collected by the protocol treasury, not fees going to liquidity providers. Protocols generating real revenue from real users are fundamentally different from those funding their appearance with token emissions.

A protocol health check requires four data points. TVL and trend — growing organically or declining? Volume/TVL ratio — how efficiently is deployed capital generating fees? Protocol revenue — is there real fee income? Active unique wallets — is there a growing real user base or are a few bots creating fake activity?

DefiLlama is the standard source for cross-protocol data. Voyager and Starkscan are Starknet-specific block explorers for direct contract inspection.
  `.trim(),
  visualPrompt: 'Four-panel health dashboard: TVL trend chart, Volume/TVL ratio gauge (0% to 200%+), Protocol Revenue bar chart, Active Wallets 30-day count.',
  visualType: 'static',
  visualUrl: 'defi-protocol-health-dashboard',
  examples: [
    {
      contextTag: '[Leveraged TVL inflation]',
      context: 'Protocol X launches a yield farming program. Users deposit USDC, receive X tokens as rewards, deposit those X tokens elsewhere, and use borrowed funds to repeat the cycle.',
      scenario: 'Protocol X reports $200M TVL. Analysis shows $120M is re-deposited borrowed funds — the same $80M of real user deposits leveraged 2.5× through a loop.',
      outcome: 'Real TVL is $80M. The $200M headline is artificially inflated. When X token price falls, leveraged positions unwind, TVL collapses, and late entrants lose money. Protocol health requires understanding what backs TVL, not just reading the headline number.',
    },
    {
      contextTag: '[Volume/TVL ratio analysis]',
      context: 'An investor compares two Starknet protocols. Protocol A: $45M TVL, $18M daily volume (40% turnover). Protocol B: $200M TVL, $1.2M daily volume (0.6% turnover).',
      scenario: 'Which is being used more efficiently and generating more fee income per dollar deployed?',
      outcome: 'Protocol A is 67× more capital-efficient. $18M of trading on $45M of capital means the capital generates active fees. Protocol B has $200M sitting idle, generating $1.2M volume — just 0.6% daily turnover. High TVL is a vanity metric if capital is not being put to work.',
    },
    {
      contextTag: '[Revenue vs emissions]',
      context: 'Two Starknet lending protocols: both $80M TVL, both 8% APY to depositors. Protocol A generates $6.5M/year from borrowers. Protocol B generates $1.8M and supplements with token emissions.',
      scenario: 'An investor examines both before depositing $500,000.',
      outcome: 'Protocol A: 8% APY fully backed by real borrower interest ($6.5M / $80M = 8.1%). Protocol B: needs $6.4M/year total. Real revenue $1.8M (2.25%). Remaining 5.75% from token emissions. Protocol B\'s yield depends on their token not losing value. Protocol A\'s yield is independent of any token price.',
    },
  ],
  keyTakeaway: 'Total Value Locked is the most cited metric in DeFi and the least reliable on its own — the volume-to-TVL ratio and daily protocol revenue tell you whether capital deployed is actually being used.',
  guidedPractice: [
    {
      question: 'Protocol A has $100M TVL, $80M from leveraged re-deposits. Protocol B has $30M TVL, all genuine deposits. Which has more "real" TVL?',
      options: [
        'A. Protocol A — $100M TVL is $100M regardless of source',
        'B. Protocol B — $30M of genuine capital represents more real commitment than $20M inflated to $100M through leverage',
        'C. Both equal — leverage is a legitimate DeFi strategy',
        'D. Cannot determine without knowing the protocols\' ages',
      ],
      correct: 1,
      hint: 'What happens to leveraged TVL when collateral values fall? What happens to genuine TVL?',
      explanation: 'B is correct. Protocol A has $20M of real capital leveraged to $100M — it will collapse in a downturn as positions unwind. Protocol B\'s $30M is more stable. TVL quality matters as much as TVL quantity.',
    },
    {
      question: 'DEX A: $500M TVL, $250M daily volume. DEX B: $50M TVL, $100M daily volume. Which generates more fees per dollar of liquidity?',
      options: [
        'A. DEX A — more total volume generates more total fees',
        'B. DEX B — at 200% daily turnover vs 50%, it generates 4× more fees per dollar deployed',
        'C. They are equivalent — volume/TVL ratio is not the right comparison',
        'D. DEX A — larger TVL means lower price impact attracting more volume',
      ],
      correct: 1,
      hint: 'DEX A volume/TVL: $250M/$500M = 50%. DEX B: $100M/$50M = 200%. Which LP earns more per dollar deposited?',
      explanation: 'B is correct. DEX B\'s 200% daily turnover means each dollar deployed generates 4× more fee income than DEX A\'s 50% turnover. For a liquidity provider, efficiency per dollar matters more than total pool size.',
    },
    {
      question: 'A protocol shows growing TVL for 3 months but falling protocol revenue over the same period. What is the most concerning interpretation?',
      options: [
        'A. Nothing — TVL growth is always a positive sign',
        'B. New users deposit but do not transact — capital is idle and growth is not creating real economic activity',
        'C. The protocol is cutting fees to attract TVL, which is a smart growth strategy',
        'D. Revenue falls are expected during bear markets regardless of TVL',
      ],
      correct: 1,
      hint: 'TVL growing while revenue falls means what about the relationship between deposits and usage?',
      explanation: 'B is correct. TVL growing while revenue falls suggests capital arrives but is not put to work. This can reflect: token emissions attracting depositors who will exit when emissions stop, or a market phase where people park but do not transact. Neither is positive without context.',
    },
    {
      question: 'A protocol has 50,000 wallet interactions in 30 days. The top 5 wallets account for 38,000 of them. What does this tell you?',
      options: [
        'A. The protocol has a very loyal core user base',
        'B. The active user count is heavily distorted — 5 wallets (likely bots) account for 76% of activity, suggesting real human users are far fewer',
        'C. Normal distribution — in all products, power users generate most activity',
        'D. The 5 wallets are likely the founding team managing the protocol',
      ],
      correct: 1,
      hint: 'Five wallets generating 76% of interactions — what does extreme concentration suggest?',
      explanation: 'B is correct. When 5 wallets create 76% of activity, the distribution is extreme — far beyond normal user concentration. This is a strong signal of bot activity or wash trading. Real protocols with genuine users have much broader activity distribution.',
    },
    {
      question: 'Protocol data: $12M TVL, $800K daily volume, $5,400/day revenue, 3,200 unique wallets in 30 days. Calculate volume/TVL ratio and annualised revenue/TVL ratio. What do these indicate?',
      options: [
        'A. Vol/TVL 6.7%, Rev/TVL 16.4%. This is a healthy growing protocol with real revenue.',
        'B. Vol/TVL 6.7% daily. Annual revenue: $5,400 × 365 = $1,971,000. Rev/TVL: $1,971,000 / $12,000,000 = 16.4%. Both ratios are strong — 6.7% daily turnover and 16.4% annual revenue/TVL indicate real use.',
        'C. Vol/TVL 6.7%. Rev/TVL 0.045%/day. Too small to evaluate meaningfully.',
        'D. Cannot calculate without knowing the number of LPs.',
      ],
      correct: 1,
      hint: 'Volume/TVL: $800K / $12M. Annual revenue: $5,400 × 365, then divide by $12M.',
      explanation: 'B is correct with full calculation. 6.7% daily turnover and 16.4% annual revenue/TVL are both strong indicators of real activity — comparable to established protocols at this size. Combined with 3,200 unique wallets, this is a healthy profile.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Evaluate three Starknet protocols for a $50,000 USDC allocation. Protocol A: $85M TVL, $12M daily volume, $3,200/day revenue, 8,500 unique wallets, 8 months old, one audit. Protocol B: $320M TVL, $4M daily volume, $800/day revenue, 1,200 unique wallets, 2 months old, no audit. Protocol C: $22M TVL, $18M daily volume, $6,100/day revenue, 4,200 unique wallets, 14 months old, two audits. For each: calculate volume/TVL and annualised revenue/TVL. Rank by overall health and recommend your allocation.',
      scoringCriteria: [
        'Protocol A: Vol/TVL 14.1%, Rev/TVL 1.37%. Protocol B: Vol/TVL 1.25%, Rev/TVL 0.09%. Protocol C: Vol/TVL 81.8%, Rev/TVL 10.1%',
        'Ranking: Protocol C first (highest turnover, strong revenue, longest track record, two audits), Protocol A second, Protocol B third (low efficiency, no audit, very new)',
        'Allocation is defensible and ties reasoning to calculated metrics',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol claims $400M TVL and 15,000 monthly active wallets. On-chain analysis shows: the top 12 wallets hold 65% of TVL, all 12 were created on the same day, and they all received deposits from the same funding wallet. The protocol is 6 weeks old and unaudited. List the red flags, categorise each by risk type, and provide a one-sentence overall assessment.',
      scoringCriteria: [
        '12 wallets created same day from same source — likely team/fake wallets inflating TVL (governance risk indicator)',
        '6 weeks old, no audit — elevated smart contract risk',
        '65% TVL concentration in 12 wallets — liquidity risk (they can exit simultaneously)',
        'Overall assessment must clearly recommend not depositing and explain the wash TVL concern',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend says: "I found a protocol with $2 billion TVL! It must be the safest place to put my savings." Correct their reasoning in 4 sentences. Use specific data examples from this lesson.',
      scoringCriteria: [
        'Correctly challenges TVL as a single metric',
        'Provides at least one counter-example (leveraged TVL, wash TVL, or the SushiSwap example)',
        'Names at least two additional metrics: volume/TVL ratio, protocol revenue, wallet concentration, audit status, or age',
        'Does not dismiss TVL entirely — acknowledges it is one signal among several',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 8 — Your First DeFi Transaction on Starknet
// ─────────────────────────────────────────────────────────────
{
  id: 'first-defi-transaction',
  title: 'Your First DeFi Transaction on Starknet',
  explanation: `
Every expert DeFi user remembers their first transaction. For most it was: open a wallet, figure out gas fees, wait, wonder if it worked, eventually check a block explorer they did not understand. Most gave up before making meaningful progress.

A transaction on Starknet goes through four stages. First, construct the call: which contract address, which function (entrypoint), and with what parameters (calldata). Second, your wallet signs the transaction — you authorise the action. Third, the Starknet sequencer receives your transaction, orders it, executes it, and includes it in a block. Fourth, the resulting state change appears on-chain: balances change, events are emitted, and the transaction hash is viewable on the block explorer.

The Starkzap SDK handles all of this. wallet.swap({ tokenIn: STRK, tokenOut: USDC, amountIn: "100" }) is a single function call that constructs the call, routes through AVNU for best price, signs with your wallet, submits to Starknet, and returns a transaction object. You call tx.wait() to confirm acceptance.

Before your first transaction with real tokens, testnet practice is essential. Starknet Sepolia is a full replica of Starknet mainnet but with tokens that have no monetary value. Claim 10 STRK from the in-app faucet. When you swap or stake on testnet, the transaction is processed by real Starknet infrastructure — it is not a simulation. It gets a real hash, viewable on sepolia.voyager.online.

After any transaction, the block explorer tells you: was it accepted or reverted? What exactly happened (events emitted)? How much gas was used? What state changed? Reading a block explorer is the proof that the transaction occurred and exactly how it was executed.
  `.trim(),
  visualPrompt: 'Four-step transaction flow: Construct Call → Sign → Sequencer Processes → Confirmed (block explorer screenshot with green status, tx hash, events). AVNU logo on the swap step.',
  visualType: 'static',
  visualUrl: 'starknet-transaction-flow',
  examples: [
    {
      contextTag: '[First swap on Starknet Sepolia]',
      context: 'Sofia has completed the Starknet Island onboarding. She has 10 testnet STRK. She wants to execute her first swap: 5 STRK for testnet USDC.',
      scenario: 'She opens the SkillUp swap simulator. The app calls wallet.getQuote() and returns: "5 STRK ≈ 0.62 USDC, price impact 0.03%, gas: sponsored." She confirms and the app calls wallet.swap().',
      outcome: 'The transaction submits. Within 4 seconds, tx.wait() resolves. The app shows a hash: 0x0312...a8f2. On sepolia.voyager.online she sees: status "Accepted on L2," events showing 5 STRK transferred to AVNU and 0.618 USDC returned to her wallet. Her first real Starknet transaction is complete.',
    },
    {
      contextTag: '[Failed transaction, understanding reverts]',
      context: 'Marcus tries to swap 15 STRK but only has 10. He enters 15, ignores the balance warning, and confirms.',
      scenario: 'The Starkzap SDK sends the transaction. The sequencer executes it: at the transfer step, the STRK contract checks Marcus\'s balance — 10 STRK — against the requested 15 STRK — and panics with "insufficient balance." The entire transaction reverts.',
      outcome: 'Marcus\'s wallet shows no change in balance. The transaction hash on Voyager shows status "Reverted" with the error message. His gas fee was covered by paymaster. He restarts with 8 STRK and the second attempt succeeds. Reverts are not catastrophes — they are the protocol rejecting an invalid instruction. No funds are lost.',
    },
    {
      contextTag: '[Block explorer analysis after staking]',
      context: 'After staking 5 STRK in the SkillUp stake simulator, Priya copies her transaction hash to sepolia.voyager.online.',
      scenario: 'She wants to verify exactly what happened on-chain.',
      outcome: 'She sees four events: Approval (STRK allowance to staking contract), StakeEntered (amount, validator pool), Delegated (on-chain delegation recorded), Transfer (STRK from wallet to pool). The block explorer transforms "staking" into a concrete sequence of contract interactions she can verify herself.',
    },
  ],
  keyTakeaway: 'Every transaction you execute on Starknet Sepolia creates a real hash, changes real contract state, and appears on a public block explorer — the only difference from mainnet is that the tokens have no monetary value.',
  guidedPractice: [
    {
      question: 'What does "calldata" contain in a Starknet transaction?',
      options: [
        'A. The encrypted private key used to sign the transaction',
        'B. The function parameters — the specific inputs passed to the contract function being called',
        'C. The transaction fee in STRK',
        'D. The block number where the transaction should be included',
      ],
      correct: 1,
      hint: 'Think about calling a function in any program — beyond which function, what else do you need to specify?',
      explanation: 'B is correct. Calldata contains function parameters — for a swap: the token pair, amount, and slippage tolerance. For a stake call: the pool address and stake amount. The contract uses calldata to know exactly what the caller wants to do.',
    },
    {
      question: 'A transaction reverts. What happens to your token balances?',
      options: [
        'A. Balances change as intended — the revert only affects the gas fee',
        'B. Balances return to exactly their pre-transaction state — all state changes are cancelled',
        'C. Balances change partially — steps completed before the revert are permanent',
        'D. Balances are frozen until the next block',
      ],
      correct: 1,
      hint: 'Atomic execution means all-or-nothing. If a transaction fails, what happens to all its state changes?',
      explanation: 'B is correct. Atomic execution means if a transaction reverts, all state changes are rolled back. Balances return to exactly what they were before. No partial states. No half-executed transfers.',
    },
    {
      question: 'Where do you verify a completed Starknet swap?',
      options: [
        'A. In the SkillUp app notification log — only the app can show transaction details',
        'B. On sepolia.voyager.online using your transaction hash — status, events, balance changes, gas used, and exact function called',
        'C. On Etherscan — Starknet transactions appear on the Ethereum explorer',
        'D. You cannot verify independently without specialised developer tools',
      ],
      correct: 1,
      hint: 'Starknet is a public blockchain. Where does public blockchain data appear?',
      explanation: 'B is correct. Sepolia Voyager is the Starknet Sepolia block explorer. Any Starknet transaction is publicly visible there with your transaction hash. This is independent verification — you do not need to trust the app to tell you it worked.',
    },
    {
      question: 'What does the Starkzap SDK do before submitting a swap transaction?',
      options: [
        'A. Submits the transaction immediately to avoid price change',
        'B. Gets a quote from AVNU to determine the optimal route and expected output, then constructs the transaction',
        'C. Checks with the Starknet Foundation for transaction approval',
        'D. Converts STRK to ETH for gas payment first',
      ],
      correct: 1,
      hint: 'What information is needed before a swap can be constructed? What must be determined first?',
      explanation: 'B is correct. Before submitting, the SDK calls getQuote() to get: the optimal route, expected output, and calldata to pass to AVNU\'s contract. Option D is wrong — fees are in STRK and sponsored by AVNU Paymaster.',
    },
    {
      question: 'Why is practicing on Starknet Sepolia testnet valuable, and what is the one critical difference from mainnet?',
      options: [
        'A. Testnet uses simulated transactions — it is not real infrastructure, just a game environment',
        'B. Testnet uses real Starknet infrastructure and real transaction processing — the only difference is testnet tokens have no monetary value, so mistakes have no financial consequence',
        'C. Testnet is slower because it has fewer validators',
        'D. Testnet transactions do not appear on any block explorer',
      ],
      correct: 1,
      hint: '"Testnet" refers to token values, not the underlying infrastructure. What is real and what is not?',
      explanation: 'B is correct. Starknet Sepolia is real infrastructure — real sequencers, real contracts, real transaction processing, real block explorers. The only difference: Sepolia STRK is free from a faucet and has no monetary value. This is why testnet practice builds real skills with no financial risk.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You executed a testnet swap: 5 STRK → USDC. Voyager shows events: Approval: +5 STRK allowance for AVNU. Transfer: -5 STRK from your wallet to AVNU pool. Transfer: +0.621 USDC from AVNU pool to your wallet. Quoted price was 0.128 USDC/STRK. Calculate your actual execution price and slippage. Was this acceptable?',
      scoringCriteria: [
        'Execution price: 0.621 / 5 = 0.1242 USDC per STRK',
        'Slippage: (0.128 - 0.1242) / 0.128 = 2.97%',
        'Assessment: ~3% slippage on a small testnet swap indicates thin testnet liquidity — acceptable on testnet, would investigate on mainnet',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Before your first mainnet DeFi transaction, list the three checks you should perform on the specific transaction you are about to sign — not general DeFi risk advice, but the specific three things to verify in the moment before clicking confirm.',
      scoringCriteria: [
        'Check 1: Verify the contract address matches official protocol documentation (not a search result)',
        'Check 2: Read transaction details — confirm token amounts, direction, and whether approval is unlimited or specific',
        'Check 3: Verify slippage tolerance is appropriate for current conditions — not left at default without checking',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain the complete lifecycle of a Starknet swap to a software developer who writes code but has never used blockchain. Use concepts they understand: function calls, APIs, databases, HTTP status codes. 5 sentences maximum.',
      scoringCriteria: [
        'Correct sequence: construct function call → sign (like signing an API request) → submit to sequencer (POST request) → sequencer processes and writes state (database transaction) → confirmation returned (200 OK with hash)',
        'At least one appropriate software analogy used correctly',
        'Does not introduce unexplained blockchain concepts',
        'Mentions a revert is equivalent to a 4xx — action did not complete, state unchanged',
      ],
    },
  ],
},

];  // end LAB1_LESSONS_5_TO_8
