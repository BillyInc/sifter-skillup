// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 9 — ADVANCED DEFI PRIMITIVES
// LESSONS 4–5 + AGGREGATE SIMS + BUILD TASK + BOSS BATTLE
// Written to: lesson_writing_instructions.txt v1.0 + sim_instructions_v3.md
// Build task: Expanded Choice (4 options) — Section 20.5 (Labs 7–9).

export const LAB9_LESSONS_4_TO_5 = [

// ─────────────────────────────────────────────────────────────
// LESSON 4 — MEV and Transaction Ordering
// Dominant concept: sandwich attacks require a public mempool
// to work — Starknet has no public mempool, so the relevant
// MEV risk comes from the sequencer's ordering power, not
// from front-running bots watching pending transactions.
// ─────────────────────────────────────────────────────────────
{
  id: 'mev-transaction-ordering',
  title: 'MEV and Transaction Ordering: Starknet\'s Different Attack Surface',

  explanation: `
In 2021, a single MEV bot on Ethereum — a specialised program that exploits transaction ordering — extracted $45 million in profit over 12 months by watching pending transactions before they were included in blocks. Every time a large Uniswap trade appeared, the bot inserted its own trades before and after it, profiting from the predictable price impact. Every dollar the bot extracted came from the traders whose transactions it surrounded.

To understand this attack, you need to understand where the opportunity comes from. On Ethereum, before a transaction is included in a block, it sits in a public waiting area visible to anyone. A validator choosing which transactions to include can see a pending trade for $500,000 of ETH and decide to include their own transactions around it first. This public waiting area is called the mempool.

The specific attack pattern that costs traders the most is called a sandwich attack. An attacker sees your pending $100,000 USDC → ETH swap. They insert a buy order before yours — pushing the ETH price up. Your swap executes at the inflated price. They immediately insert a sell order after yours — capturing the price difference. You received less ETH than the market price would have given you. The attacker captured the difference, and you paid it without knowing.

Starknet does not have a public mempool. When you submit a transaction to Starknet, it goes directly to the sequencer — the component that orders and batches transactions for proof generation. Until the transaction is included, it is not visible to the public. Front-running bots cannot see pending transactions because there is no public pool to watch. Sandwich attacks of the Ethereum variety are structurally impossible on Starknet today.

This changes the MEV risk, not eliminates it. A centralised sequencer that processes all transactions has complete ordering authority. The sequencer could, in principle, reorder your transaction to prioritise its own or a favoured party's trades. This form of value extraction requires no mempool visibility — the sequencer simply knows your transaction exists before it decides the final ordering. This is called sequencer MEV or sequencer ordering risk.

Starknet's sequencer is currently operated by StarkWare — the team behind Starknet. There is no evidence of ordering abuse, and decentralisation of the sequencer is a stated roadmap goal. The practical user defence remains the same as on Ethereum: set a tight slippage tolerance. If the price moves against you more than your stated tolerance allows, your transaction reverts rather than executing at a worse price. On Starknet, AVNU — the aggregator from Lab 2 — routes swaps through optimal paths that minimise price impact, reducing the surface area for any ordering-based extraction.
  `.trim(),

  visualPrompt: 'Two-column comparison. Left: "Ethereum — Public Mempool." Timeline: your $100K swap enters mempool (visible to all) → bot sees it → bot buys ETH before you → your swap executes at inflated price → bot sells. Red annotation: "You paid 0.8% extra. Bot captured it." Right: "Starknet — No Public Mempool." Timeline: your swap goes directly to sequencer (not publicly visible) → sequencer orders transactions → your swap executes. Green annotation: "No bot can see your pending transaction. Sequencer ordering risk exists — it is held by one party, not a competitive market of bots."',
  visualType: 'static',
  visualUrl: 'mev-ethereum-vs-starknet',

  examples: [
    {
      contextTag: '[Sandwich attack on Ethereum, quantified cost, no user error]',
      context: 'A trader submits a $180,000 USDC → ETH swap on Uniswap with 1% slippage tolerance. The transaction enters Ethereum\'s public mempool. An MEV bot detects it.',
      scenario: 'The bot executes a front-run buy of $90,000 ETH before the trader\'s transaction, pushing the ETH price up 0.6%. The trader\'s swap executes at the elevated price. The bot immediately sells, capturing the price difference.',
      outcome: 'The trader received approximately 0.6% less ETH than the market price implied — approximately $1,080 extracted. The bot\'s profit: approximately $900 after gas costs. The trader did nothing wrong — they set a standard 1% slippage tolerance, which allowed the attack to succeed without reverting their transaction. A tighter 0.2% tolerance would have caused the transaction to revert rather than execute at the manipulated price, but the trader would then need to resubmit.',
    },
    {
      contextTag: '[Starknet no-mempool advantage, tight slippage on AVNU swap]',
      context: 'A trader submits an $80,000 STRK → USDC swap via AVNU on Starknet. The transaction goes directly to the Starknet sequencer — not to a public mempool.',
      scenario: 'An MEV bot operator monitors the Ethereum mempool for front-running opportunities. They cannot see the Starknet transaction before it is included.',
      outcome: 'The AVNU swap executes at the quoted price plus the standard 0.3% fee with no front-running. The $80,000 transaction is not visible to any external party until it appears in the block. The no-public-mempool design means the bot has no opportunity to insert transactions around it. The trader\'s practical defence — setting AVNU slippage to 0.5% — ensures the transaction reverts if any sequencer-level ordering did produce adverse pricing, but on a normal trade this protection simply enables clean execution.',
    },
    {
      contextTag: '[Sequencer ordering risk, centralisation trade-off, user mitigation]',
      context: 'A researcher documenting Starknet MEV risk for a published report compares Ethereum\'s decentralised MEV (competitive bots) with Starknet\'s centralised sequencer risk.',
      scenario: 'They ask: is Starknet MEV-free or does the risk exist in a different form?',
      outcome: 'Starknet is not MEV-free — it is MEV-different. On Ethereum, MEV is competitive: many bots monitor the mempool and compete to extract value, distributing the risk across an adversarial market. On Starknet, the sequencer holds complete ordering authority. If the sequencer chose to abuse this authority, it could extract value from every transaction. The researcher notes: the risk is centralised (one party), not distributed (many bots). The current mitigation is trust: StarkWare operates the sequencer under reputational and legal constraints. The roadmap mitigation is decentralisation: a competitive validator set with ordering authority distributed across parties.',
    },
  ],

  keyTakeaway: 'Sandwich attacks require a public mempool to work — Starknet has none, eliminating bot-based front-running — but the centralised sequencer holds complete ordering authority, creating a concentrated sequencer MEV risk that tight slippage tolerance and AVNU routing partially defend against.',

  guidedPractice: [
    {
      question: 'What is the mempool and why does its absence on Starknet prevent sandwich attacks?',
      options: [
        'A. The mempool stores completed transactions — its absence means transactions cannot be finalised',
        'B. The mempool is the public waiting area where pending transactions are visible before inclusion — without a public mempool, bots cannot see your transaction before it is ordered and cannot insert trades around it',
        'C. The mempool is Starknet\'s fee calculation system',
        'D. The mempool prevents double-spending — without it, every Starknet transaction must be verified manually',
      ],
      correct: 1,
      hint: 'Sandwich attacks require the bot to see your transaction before it is included. Where does a transaction sit before inclusion on Ethereum?',
      explanation: 'B is correct. The mempool is a public holding area on Ethereum where unconfirmed transactions wait before validators include them. Its public visibility is what enables bot-based front-running and sandwich attacks. Starknet transactions go directly to the sequencer — never to a public pool — so bots have no visibility window to exploit. Option D confuses mempool with consensus mechanism.',
    },
    {
      question: 'A sandwich attack extracts value from your swap. Which of the following is the correct description of the mechanism?',
      options: [
        'A. The bot steals tokens from your wallet before the transaction executes',
        'B. The bot inserts a buy before your swap (pushing price up) and a sell after (locking in the difference), so your swap executes at a worse price than the market rate',
        'C. The bot delays your transaction by 10 minutes to capture more price movement',
        'D. The bot cancels your transaction and substitutes its own',
      ],
      correct: 1,
      hint: 'Both the bot\'s buy and your swap and the bot\'s sell all execute in sequence in the same block. What does the price look like when your transaction executes?',
      explanation: 'B is correct. The sandwich requires three ordered transactions: bot buy → your swap → bot sell. The bot buy inflates the price, your swap executes at the inflated price, and the bot sell captures the difference. You receive fewer tokens than a clean execution would have provided. The bot extracts exactly what you overpaid. No tokens are stolen — you simply received less than market rate for your trade.',
    },
    {
      question: 'You set a 3% slippage tolerance on a $50,000 Uniswap swap. A bot sandwiches you and the actual price impact is 2.8%. What happens to your transaction?',
      options: [
        'A. The transaction reverts — 2.8% exceeds your 3% tolerance',
        'B. The transaction executes — 2.8% is within your 3% tolerance, so the swap completes at the sandwiched price',
        'C. The transaction executes but you receive a refund for the extra 2.8%',
        'D. The transaction is held for 30 seconds while the bot\'s transaction is reviewed',
      ],
      correct: 1,
      hint: 'Slippage tolerance is a maximum acceptable price deviation. If the actual slippage is within the tolerance, does the transaction execute or revert?',
      explanation: 'B is correct. Your 3% tolerance means the transaction will execute as long as slippage is 3% or below. A 2.8% sandwich attack stays within your tolerance — the transaction executes and you receive $50,000 × 2.8% = $1,400 less than fair market price. This is why tight slippage tolerance is important: a 0.5% tolerance would have reverted the transaction at 2.8% slippage, preventing the extraction (though you would need to resubmit).',
    },
    {
      question: 'Starknet\'s sequencer is currently operated by StarkWare. What form of MEV risk does this create, even without a public mempool?',
      options: [
        'A. No risk — without a mempool, MEV is impossible on Starknet',
        'B. The sequencer holds complete ordering authority and could insert favourable transactions or reorder yours — a centralised form of ordering risk held by one party rather than distributed across competing bots',
        'C. The sequencer creates identical risk to Ethereum\'s decentralised MEV',
        'D. Sequencer MEV only applies to transactions above $10,000',
      ],
      correct: 1,
      hint: 'The sequencer sees all incoming transactions and determines their order. What power does that give it, even without public visibility?',
      explanation: 'B is correct. Ordering authority enables MEV regardless of whether a mempool exists. The sequencer knows every incoming transaction and controls the order they execute. It could theoretically insert its own transactions with priority or reorder to extract value. The key distinction from Ethereum: Ethereum MEV is competitive (many bots, adversarial market), while sequencer MEV is concentrated (one party). There is no evidence of StarkWare abusing this power, and sequencer decentralisation is on the roadmap.',
    },
    {
      question: 'You are making a $90,000 STRK → USDC swap on Starknet via AVNU. Which slippage setting best balances execution reliability with MEV protection?',
      options: [
        'A. 5% — ensures the transaction always executes regardless of market conditions',
        'B. 0.1% — guarantees near-perfect execution or reverts',
        'C. 0.3–0.5% — tight enough to revert if sequencer ordering produces meaningful adverse price impact, while allowing normal execution in liquid markets',
        'D. 0% — no slippage tolerated at any time',
      ],
      correct: 2,
      hint: 'Consider two failure modes: too loose (allows extraction), too tight (transaction reverts in normal conditions and wastes gas). What range works for a liquid Starknet market?',
      explanation: 'C is correct. 0.3–0.5% is appropriate for a liquid STRK/USDC market on Starknet via AVNU. It is tight enough that any meaningful adverse price impact (from sequencer ordering or normal slippage) would revert the transaction rather than allow extraction. It is loose enough that normal price fluctuation between quote and execution does not cause unnecessary reverts. Option A is dangerously loose — 5% allows substantial extraction. Option B is too tight for a $90,000 trade — even a small network delay could push slippage to 0.15–0.2%.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'You are comparing MEV exposure for three DeFi actions on Starknet: (A) $200,000 STRK → USDC swap via AVNU with 0.5% slippage. (B) $80,000 USDC → ETH swap via a small Ekubo pool with 2% slippage. (C) Supply $150,000 USDC to Vesu — no price execution involved. Assess the MEV risk of each action, state the specific risk type for each, and rank them from highest to lowest exposure.',
      scoringCriteria: [
        'Action A (AVNU swap, 0.5%): Low sequencer MEV risk. AVNU multi-hop routing minimises single-pool price impact. 0.5% tolerance limits sequencer ordering extraction.',
        'Action B (small Ekubo pool, 2% slippage): Higher MEV risk. Small pool means large $80K trade has more single-pool price impact. 2% slippage allows more extraction if sequencer reorders. Two compounding risks: pool size and tolerance.',
        'Action C (Vesu supply): Negligible MEV risk. Supply transactions do not involve price execution against a pool — no front-run opportunity exists for the supply action itself.',
        'Ranking highest to lowest: B > A > C. Action B has the highest exposure from combined pool-size and loose tolerance factors.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'AVNU swap quote for $120,000 STRK → USDC: route = STRK/USDC direct (85%) + STRK/ETH + ETH/USDC (15%), estimated output 143,280 USDC, price impact 0.18%, fee 0.3%. You set slippage to 0.4%. Network is congested — block times are slightly delayed. The transaction is submitted. Final executed output: 142,944 USDC. Calculate the actual slippage, determine whether your tolerance was breached, and assess whether the outcome is acceptable.',
      scoringCriteria: [
        'Expected output from quote: 143,280 USDC. Actual output: 142,944 USDC. Difference: 336 USDC.',
        'Actual slippage: 336 / 143,280 = 0.234%.',
        'Tolerance check: 0.234% < 0.4% tolerance — transaction executed within tolerance.',
        'Outcome assessment: acceptable. 0.234% actual slippage on a $120,000 trade during network congestion is reasonable. The 0.4% tolerance correctly allowed the trade to execute. If slippage had reached 0.4% or above, the transaction would have reverted — the tolerance worked as a protection boundary.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A user says: "Starknet has no MEV because there\'s no mempool. I don\'t need to worry about slippage on Starknet — my swaps are always safe." Respond in 3 sentences: correct the specific claim, explain the sequencer ordering risk that does exist, and give one practical action they should take on every swap.',
      scoringCriteria: [
        'Correct the claim: Starknet does not have a public mempool, which eliminates bot-based sandwich attacks. However, "no MEV" is incorrect — MEV risk exists in a different form.',
        'Sequencer risk explained: the centralised sequencer holds complete ordering authority. It could theoretically reorder transactions or insert its own. This is concentrated sequencer MEV — not distributed bot MEV, but a real ordering risk held by one party.',
        'Practical action: set slippage tolerance to 0.3–0.5% on every swap. If sequencer ordering produces adverse price impact beyond this tolerance, the transaction reverts rather than executing at a worse price.',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-mev-defence',
    title: 'MEV Defence — Slippage Tolerance Practice',
    instructionText:
      'Set up a $50,000 STRK → USDC swap. First try 5% slippage — observe a simulated sandwich attempt. ' +
      'Then reset to 0.5% slippage and observe the defence. ' +
      'Finally, execute the real swap via AVNU with your chosen slippage setting.',
    completionCriteria: [
      'User has set slippage > 2% and observed a sandwich simulation',
      'User has set slippage ≤ 0.5% and observed the protection mechanism',
      'User has executed a real swap via starkzap with appropriate slippage',
    ],
  },
},

// ─────────────────────────────────────────────────────────────
// LESSON 5 — Liquid Staking and Staking Derivatives
// Dominant concept: an LST lets you earn staking yield while
// keeping capital composable in DeFi — but using it as
// collateral means your health factor tracks the LST price,
// not the underlying token, which introduces a de-peg risk
// that pure staking does not carry.
// ─────────────────────────────────────────────────────────────
{
  id: 'liquid-staking',
  title: 'Liquid Staking: Composable Yield and the De-Peg Risk',

  explanation: `
In May 2022, stETH — the liquid staking token issued by Lido for Ethereum — briefly traded at 0.95 ETH instead of the expected 1.0 ETH peg. Users who had deposited stETH as collateral on Aave — the Ethereum lending protocol — suddenly saw their health factors deteriorate. They had not made any trades. The ETH market price had not crashed. Their positions were weakening because the receipt token they used as collateral had temporarily separated in value from the asset it represented.

To understand why this matters, you need to understand what liquid staking solves and what it introduces.

Native staking on Starknet — as covered in Lab 3 — locks STRK in a delegation pool for an unbonding period of 21 days. While locked, that STRK earns yield but cannot be used elsewhere. You cannot swap it, lend it, or use it as collateral. Your capital is productive in one way and frozen in all others.

A liquid staking protocol receives your STRK, stakes it on your behalf, and gives you a receipt token that represents your staked position plus accumulated rewards. This receipt token is tradeable and usable in DeFi immediately. You earn the staking yield continuously while holding a token you can sell, lend, or deposit at any time. A receipt token that represents a staked position and accrues yield to its holder is called a liquid staking token, or LST.

On Starknet, LST implementations are early-stage. The core concept — stake native token, receive composable receipt — is well-established from Ethereum (stETH via Lido, rETH via Rocket Pool) and Solana (mSOL via Marinade, jitoSOL via Jito). The specific protocols available on Starknet at any given time should be verified on current DeFi dashboards.

The added risk is in two forms. First, using an LST as collateral in Vesu means your health factor — from Lab 4 — is calculated using the LST's current price, not the underlying STRK price. If the LST de-pegs from STRK — even temporarily — your reported collateral value drops without the underlying market moving. The stETH incident on Aave illustrates exactly this: real ETH was unchanged, but stETH collateral positions were at liquidation risk.

The second form is counterparty risk. Unlike native staking where your STRK is locked in a Starknet protocol contract, LST protocols introduce an additional layer: the liquid staking protocol must remain solvent and correctly manage the underlying validator positions. A failure in the liquid staking protocol — technical or economic — could affect the LST's value independently of the underlying asset's market price.

The trade-off is clear: native staking offers the yield with fewer layers of risk; liquid staking offers the yield plus composability with one additional risk layer added.
  `.trim(),

  visualPrompt: 'Three-panel comparison. Panel 1 "Native Staking": STRK locked → earns 8% APY → cannot use in DeFi. Panel 2 "Liquid Staking": STRK deposited to LST protocol → receives LST receipt token → LST earns 8% APY → LST usable as Vesu collateral. Panel 3 "De-Peg Risk": LST price axis shows normal = 1:1 STRK; de-peg event = 0.95 STRK. Health factor calculation bar shows how 5% LST price drop changes health factor even with STRK price unchanged. Annotation: "Your health factor tracks the LST price — not the STRK price."',
  visualType: 'static',
  visualUrl: 'liquid-staking-lst-depeg-risk',

  examples: [
    {
      contextTag: '[stETH de-peg on Aave, health factor impact, no ETH price change]',
      context: 'Lido is a liquid staking protocol on Ethereum that issues stETH in exchange for staked ETH. In May 2022, stETH briefly traded at 0.95 ETH on secondary markets — a 5% de-peg from its expected 1:1 parity with ETH. Aave accepted stETH as collateral at its current market price.',
      scenario: 'A user had deposited $200,000 of stETH as Aave collateral and borrowed $120,000 USDC. ETH market price was unchanged. During the de-peg, Aave calculated collateral using stETH\'s market price of 0.95 ETH.',
      outcome: 'Reported collateral value: $200,000 × 0.95 = $190,000. Health factor: ($190,000 × 0.83) / $120,000 = $157,700 / $120,000 = 1.31 — still above 1.0 but reduced from the original ($200,000 × 0.83) / $120,000 = 1.38. A larger de-peg or a more aggressive borrow position could have triggered liquidation. The lesson: stETH collateral health is determined by the stETH/ETH exchange rate, not the ETH/USD price. A user who did not account for de-peg risk could be liquidated even in a stable ETH market.',
    },
    {
      contextTag: '[LST composability advantage, staking yield plus DeFi yield simultaneously]',
      context: 'A STRK holder is evaluating two strategies: (A) native staking at 9% APY — 21-day unbonding, capital locked. (B) Staking via an LST protocol at 8.5% APY — receives LST immediately, deposits LST into Vesu as collateral, borrows USDC at 5% APY and lends it for 11% APY.',
      scenario: 'They calculate the net yield for each strategy on $50,000 STRK.',
      outcome: 'Strategy A: $50,000 × 9% = $4,500 per year. Capital locked for 21 days on exit. Strategy B: $50,000 × 8.5% = $4,250 LST yield. Borrow $30,000 USDC at 5% cost ($1,500/year), lend at 11% ($3,300/year) = $1,800 net from the lending loop. Total: $4,250 + $1,800 = $6,050 per year — 21% effective APY on the original $50,000. Strategy B generates $1,550 more per year but carries three risk layers: native staking risk, LST de-peg risk, and the lending position\'s health factor. Strategy A carries only native staking risk.',
    },
    {
      contextTag: '[Starknet LST early-stage, cross-chain LST comparison, Marinade mSOL on Solana]',
      context: 'A DeFi analyst comparing liquid staking ecosystems notes that Ethereum and Solana both have mature LST markets. Marinade Finance is a Solana liquid staking protocol that issues mSOL — it holds approximately $1.3B in staked SOL and offers deep mSOL/USDC liquidity on Orca. Jito is a competing Solana protocol that includes MEV rewards in its jitoSOL yield.',
      scenario: 'They assess how Starknet\'s LST ecosystem compares for a user considering deploying $100,000 in STRK for maximum composable yield.',
      outcome: 'Solana mSOL: deep liquidity (easy exit), battle-tested ($1.3B TVL), widely accepted as collateral on MarginFi. Starknet LSTs: early-stage — lower TVL, developing liquidity, fewer collateral acceptance venues. For $100,000, the Starknet LST trade-off is higher risk for potentially higher native yield as early liquidity provider. The analyst notes: the LST primitive is structurally sound on Starknet; the maturity gap versus Solana is a current-state observation, not a permanent limitation.',
    },
  ],

  keyTakeaway: 'A liquid staking token lets you earn staking yield while keeping capital composable in DeFi — but using it as collateral means your health factor tracks the LST price rather than the underlying token price, adding a de-peg risk that native staking does not carry.',

  guidedPractice: [
    {
      question: 'What specific problem does liquid staking solve that native staking does not?',
      options: [
        'A. Liquid staking earns higher APY than native staking',
        'B. Native staking locks capital during the unbonding period — liquid staking issues a receipt token that is immediately tradeable and usable in DeFi',
        'C. Liquid staking eliminates all staking risk',
        'D. Native staking requires a validator licence — liquid staking removes this requirement',
      ],
      correct: 1,
      hint: 'What happens to your capital during a 21-day unbonding period in native staking? What does liquid staking do to that locked capital?',
      explanation: 'B is correct. Native staking on Starknet locks STRK in a delegation pool — the 21-day unbonding period from Lab 3 means that capital is frozen during that time. Liquid staking issues an LST receipt immediately, converting the locked position into a tradeable token. The yield continues to accrue to the LST holder. Option A is incorrect — LST APY may be slightly lower than native staking due to protocol fees. Option C is incorrect — liquid staking adds risk layers rather than removing them.',
    },
    {
      question: 'You deposit 10,000 STRK into a liquid staking protocol and receive 10,000 xSTRK in return. Six months later, the exchange rate is 1 xSTRK = 1.04 STRK. What has happened?',
      options: [
        'A. xSTRK de-pegged from STRK — it is now worth more than it should be',
        'B. Your 10,000 xSTRK now represents 10,400 STRK — the accumulated staking rewards are embedded in the rising exchange rate',
        'C. You lost 400 STRK due to slashing penalties',
        'D. The LST protocol minted 400 extra xSTRK and distributed them to your wallet',
      ],
      correct: 1,
      hint: 'In a reward-bearing LST model, staking rewards are reflected in the exchange rate rather than by adding new tokens to your balance. What does 1.04× mean?',
      explanation: 'B is correct. Reward-bearing LSTs accumulate yield by increasing the exchange rate. Your 10,000 xSTRK represents 10,400 STRK — the 400 STRK difference is the 6-month staking reward embedded in the rate. Your xSTRK token count is unchanged; the value per token has increased. This is different from a rebasing model, where your balance would increase to 10,400 xSTRK at a 1:1 rate. Both accumulate yield; they differ in how it is expressed.',
    },
    {
      question: 'You use 20,000 xSTRK (currently 1:1 with STRK, total value $16,000) as collateral in Vesu. You borrow $9,000 USDC. xSTRK de-pegs to 0.92 STRK. What is your new health factor?',
      options: [
        'A. Health factor unchanged — the STRK/USD price did not move',
        'B. Health factor = ($14,720 × 0.83) / $9,000 = 1.36',
        'C. Health factor = ($16,000 × 0.83) / $9,000 = 1.48 — de-peg does not affect Vesu collateral',
        'D. Health factor = ($16,000 × 0.92 × 0.83) / $9,000 = 1.36',
      ],
      correct: 3,
      hint: 'Vesu uses the LST market price for health factor. If xSTRK is at 0.92 STRK, what is the dollar value of 20,000 xSTRK at $0.80/STRK?',
      explanation: 'D is correct. At de-peg: 1 xSTRK = 0.92 STRK. If STRK = $0.80, then 1 xSTRK = $0.736. 20,000 × $0.736 = $14,720 collateral value. Health factor = ($14,720 × 0.83) / $9,000 = $12,218 / $9,000 = 1.358. Option A is incorrect — Vesu uses LST market price, not underlying STRK price. The de-peg directly affects health factor even if the STRK/USD rate is unchanged.',
    },
    {
      question: 'An LST protocol fails — the smart contract has a critical vulnerability and is drained. You hold 5,000 xSTRK. What happens to the STRK you originally staked?',
      options: [
        'A. Your STRK is safe — it is on the Starknet consensus layer and cannot be affected by an LST protocol failure',
        'B. Your xSTRK is now worthless — the protocol can no longer redeem xSTRK for STRK, and the underlying STRK may be lost depending on how the vulnerability worked',
        'C. The LST protocol automatically returns your STRK to your wallet',
        'D. Your STRK is locked for 21 days but safe — the LST failure only delays redemption',
      ],
      correct: 1,
      hint: 'The LST protocol holds your staked STRK. If the protocol is compromised, who controls those underlying STRK?',
      explanation: 'B is correct. When you stake via an LST protocol, your STRK moves into the protocol\'s custody — it stakes on your behalf. If the protocol contract is exploited, the underlying STRK held by that contract is at risk. This is the counterparty risk layer unique to liquid staking. Option A is incorrect — your STRK is not sitting in your native Starknet account; the LST protocol is the custodian.',
    },
    {
      question: '$40,000 STRK. Option A: native staking at 9.5% APY. Option B: LST at 8.8% APY — LST deposited as Vesu collateral, $20,000 USDC borrowed at 4.5% cost, lent at 10% APY. Calculate the net annual yield for each option and identify the risk layers each carries.',
      options: [
        'A. A: $3,800. B: $2,040 net yield. A is superior.',
        'B. A: $3,800. B: LST yield = $3,520. Lending loop = ($20,000 × 0.10) − ($20,000 × 0.045) = $2,000 − $900 = $1,100 net. Total B = $4,620. B generates more yield.',
        'C. A: $3,800. B: $3,520 only — lending yield is offset by borrow cost exactly.',
        'D. Both strategies produce identical yield — the only difference is risk.',
      ],
      correct: 1,
      hint: 'Calculate the lending loop separately: gross lending income minus borrow cost. Then add to the LST yield.',
      explanation: 'B is correct. Option A: $40,000 × 9.5% = $3,800/year. Option B: LST = $40,000 × 8.8% = $3,520. Lending net = ($20,000 × 10%) − ($20,000 × 4.5%) = $2,000 − $900 = $1,100. Total = $3,520 + $1,100 = $4,620. Option B generates $820 more annually. Risk layers for B: native staking risk (same as A), LST de-peg risk (unique to B), lending health factor risk (unique to B — a STRK price drop or LST de-peg could trigger liquidation). Option A: only native staking risk. Option B pays $820/year for taking on two additional risk layers.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-communication',
      scenario: 'A user holding 8,000 STRK asks: "Should I use native staking or get an LST? I want to use Vesu to borrow USDC against my staked position." Respond in 4 sentences: explain what native staking gives them and what it does not, explain what the LST option adds and what it costs in added risk, state the specific new risk the LST introduces for their Vesu position, and give them a concrete rule for deciding.',
      scoringCriteria: [
        'Native staking: earns 9%+ APY, 21-day unbonding, cannot use as Vesu collateral because locked staked STRK is not a tradeable token — their Vesu requirement makes native staking alone insufficient',
        'LST adds: a tradeable receipt token that can be deposited as Vesu collateral, enabling borrowing against their staked position while still earning yield',
        'New risk added: de-peg risk. If the LST trades below STRK (even temporarily), Vesu calculates collateral at the LST price — their health factor can drop below 1.0 even if STRK/USD price is unchanged',
        'Decision rule: LST is appropriate here because their explicit goal (Vesu borrow against staked STRK) requires composable collateral. They should maintain a health factor above 1.5 to buffer against a 10%+ de-peg without being liquidated.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi investor holds 30,000 xSTRK as Vesu collateral (exchange rate 1 xSTRK = 1.02 STRK, STRK price $0.85). They have borrowed $18,000 USDC. Scenario: xSTRK de-pegs to 0.88 STRK simultaneously with STRK falling 12% to $0.748. Calculate their health factor under this combined scenario and assess whether their position survives.',
      scoringCriteria: [
        'Combined xSTRK dollar value: 30,000 xSTRK × 0.88 STRK/xSTRK × $0.748/STRK = 30,000 × $0.6582 = $19,748',
        'Health factor: ($19,748 × 0.83) / $18,000 = $16,391 / $18,000 = 0.91',
        'Position does not survive — health factor 0.91 is below 1.0. Liquidation is triggered.',
        'Key insight: the double stress scenario (de-peg + underlying price drop) is the primary risk unique to LST positions. Native staking would only have the 12% price drop component — health factor would be ($30,000 × 0.88/xSTRK × $0.748 = different calculation note: if native staking, no de-peg). Native STRK at $0.748: $30,000 × 1.02 × $0.748 / ... The LST compound risk is what makes this survivable with native staking but not with the LST.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'LST comparison table: Protocol A (Ethereum) — stETH, $32B TVL, 3.8% APY, de-peg history: max 5% in May 2022, recovery 6 days, accepted on Aave/Compound. Protocol B (Solana) — mSOL (Marinade), $1.3B TVL, 7.1% APY, 0 de-peg events in 2 years, accepted on MarginFi/Kamino. Protocol C (Starknet) — early LST, $8M TVL, 9.2% APY, no de-peg history (too new), 1 protocol accepting it as collateral. You are allocating $75,000 across these for a 12-month DeFi strategy. Interpret each data point and construct an allocation rationale.',
      scoringCriteria: [
        'Protocol A: highest TVL ($32B), battle-tested, known de-peg (5% max, recovered in 6 days). Deep liquidity enables large position. APY 3.8% lowest. Risk: known and bounded.',
        'Protocol B: mSOL has no de-peg events in 2 years, meaningful TVL ($1.3B), higher APY (7.1%), wide collateral acceptance. Strongest risk/reward profile in the set.',
        'Protocol C: highest APY (9.2%), but lowest TVL ($8M), only one collateral venue, no de-peg history because too new (not a positive signal — insufficient data). Early-stage risk is not reflected in the APY premium alone.',
        'Allocation rationale: weight Protocol B most heavily for risk-adjusted return (high APY, clean history, good liquidity). Modest Protocol A allocation for liquidity optionality. Small Protocol C allocation only if comfortable with early-stage risk — not more than 10–15% of total at this TVL.',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-liquid-stake',
    title: 'Liquid Staking — Stake STRK, Receive LST, Use as Collateral',
    instructionText:
      'Stake STRK and receive the LST receipt token — uses the real starkzap SDK on Sepolia. ' +
      'Watch the yield accumulate in your LST balance. ' +
      'Then deposit the LST to Vesu as collateral and observe your health factor.',
    completionCriteria: [
      'User has staked STRK and received LST receipt',
      'User has observed the yield accumulation mechanism',
      'User has deposited LST to Vesu (simulated) and seen health factor',
      'User has observed what happens to health factor on a simulated de-peg',
    ],
  },
},

];  // end LAB9_LESSONS_4_TO_5


// ─────────────────────────────────────────────────────────────
// AGGREGATE SIMULATIONS — Lab Level (15 total)
// Placed AFTER all lessons, BEFORE bossMode.
// ─────────────────────────────────────────────────────────────

export const LAB9_AGGREGATE_SIMULATIONS = {
  count: 15,
  simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'judgment-communication'],
  drawPerSession: 5,
  scenarios: [
    // — Lesson 1: Perpetual Futures —
    {
      type: 'judgment-dataInterpret',
      scenario: 'Extended shows: STRK/USDC perp funding rate −0.018% per 8h. Mark price $0.79. Index price $0.84. 24h open interest: $4M longs, $11M shorts. Interpret the funding direction and state which side is crowded.',
      scoringCriteria: [
        'Negative funding: shorts pay longs — shorts are dominant',
        'Mark $0.79 < index $0.84: perp trading below spot — short sellers are driving it down',
        'OI confirms: $11M shorts versus $4M longs — shorts are the crowded side',
        'Implication: holding short positions costs 0.018% × 3 = 0.054% per day in funding payments to long holders',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A trader holds two positions on Extended: (A) 15× long, $5,000 collateral, entry $0.90, mark $0.836 (adverse 7.1%). (B) 8× short, $10,000 collateral, entry $1.10, mark $1.023 (adverse 7%). Which position is at greater liquidation risk?',
      scoringCriteria: [
        'Position A threshold: ~6.2% at 15×. Current adverse: 7.1% — exceeded. Position A is at or past liquidation.',
        'Position B threshold: ~11.5% at 8×. Current adverse: 7% — safe with 4.5% remaining buffer.',
        'Position A is at greater liquidation risk — threshold exceeded.',
        'Action: Position A requires immediate assessment; may already be liquidated.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain to someone unfamiliar with crypto why a 20× leveraged position can be wiped out by a 5% price move. Use a specific dollar example with $1,000 collateral.',
      scoringCriteria: [
        '$1,000 collateral at 20× = $20,000 exposure',
        '5% adverse move on $20,000 = $1,000 loss — equals entire collateral',
        'Exchange closes the position just before that point (maintenance margin) — at ~4.5% adverse',
        'Response explains leverage amplifies both gains and losses equally, and that small moves at high leverage equal large collateral percentages',
      ],
    },
    // — Lesson 2: Confidential Transfers —
    {
      type: 'judgment-riskAssess',
      scenario: 'An employee was paid $12,000 via Tongo Cash confidential transfer. They received a viewing key. Their employer is now demanding the viewing key "for payroll records." Should they share it? What are the consequences and what is the one irreversible outcome?',
      scoringCriteria: [
        'Sharing is a personal decision — but the irreversible consequence must be stated: once shared, the key cannot be revoked',
        'The employer will permanently hold the ability to disclose or share that amount with others',
        'The employee cannot re-establish confidentiality for that specific transaction after sharing',
        'Assessment: sharing for legitimate payroll records is reasonable; the employee should understand this is permanent disclosure to anyone the employer subsequently shares it with',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain the difference between Tornado Cash privacy and Tongo Cash privacy in 3 sentences. What each hides, what each reveals, and which is more useful for financial compliance.',
      scoringCriteria: [
        'Tornado Cash: hides sender-receiver link via mixing. Amount visible. The connection between depositor and withdrawor is obscured.',
        'Tongo Cash: hides amount via ZK proof. Sender and receiver addresses remain public. The amount is provably hidden.',
        'Compliance utility: Tongo Cash is more useful for financial compliance — amounts can be selectively disclosed via viewing keys while sender-receiver linkage (already public) allows transaction flow to be verified.',
      ],
    },
    // — Lesson 3: Flash Loans —
    {
      type: 'judgment-dataInterpret',
      scenario: 'Protocol X uses a 10-minute TWAP oracle (60 blocks). An attacker attempts to move the STRK/USDC spot price 80% upward in 3 consecutive blocks. What is the approximate TWAP movement after the 3-block manipulation, and is it sufficient to substantially inflate collateral values?',
      scoringCriteria: [
        'Each block contributes 1/60 of the TWAP weight',
        '3 blocks: 80% × (3/60) = 4% TWAP movement',
        '4% collateral inflation on typical borrow ratios: insufficient to enable meaningful over-borrowing',
        'Conclusion: 10-minute TWAP with 60 blocks provides meaningful but not complete protection; 30-minute TWAP (180 blocks) provides stronger defence against 3-block manipulation',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You have $60,000 USDC deposited in a Starknet lending protocol. You learn the protocol uses a single Ekubo pool as its price oracle for the collateral token, with no TWAP smoothing. Assess your flash loan exposure and state two specific actions that would reduce your risk.',
      scoringCriteria: [
        'Risk: spot oracle with no TWAP smoothing is directly manipulable by a flash loan in a single block',
        'The $60,000 deposit is at risk if a flash loan attack drains the protocol',
        'Action 1: withdraw and move to a protocol using a TWAP oracle (e.g. Pragma feed with 20+ minute window)',
        'Action 2: if staying, reduce borrowed amount to keep health factor above 1.5 — buffer against temporary oracle-induced health factor drops',
      ],
    },
    // — Lesson 4: MEV —
    {
      type: 'judgment-riskAssess',
      scenario: 'You are submitting a $200,000 STRK → USDC swap via AVNU on Starknet. You have set 2% slippage tolerance. Identify the specific MEV risk, whether your slippage setting is appropriate, and what setting you should use instead.',
      scoringCriteria: [
        'MEV risk: sequencer ordering risk — centralised sequencer could reorder to produce adverse price execution',
        '2% slippage is inappropriate for a $200,000 swap — allows up to $4,000 extraction before reverting',
        'Recommended setting: 0.3–0.5% for a liquid STRK/USDC pair via AVNU multi-hop routing',
        'No sandwich risk on Starknet (no public mempool) but sequencer ordering risk justifies tight slippage',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Your colleague says: "I always set 5% slippage so my transactions never fail." Explain in 2 sentences why this creates a specific financial risk and what they should set instead.',
      scoringCriteria: [
        '5% slippage means any adverse price impact up to 5% is accepted — on a $100,000 swap, that allows up to $5,000 in extraction before the transaction reverts',
        'On Starknet: set 0.3–0.5% for liquid markets. The transaction may occasionally revert in congested conditions, but each resubmission costs minimal gas and prevents extraction',
      ],
    },
    // — Lesson 5: Liquid Staking —
    {
      type: 'judgment-dataInterpret',
      scenario: 'xSTRK (LST): current exchange rate 1.06 STRK. STRK price: $0.82. You hold 15,000 xSTRK as Vesu collateral with $8,500 borrowed. The xSTRK exchange rate drops to 1.01 STRK (partial de-peg) while STRK price is unchanged. Calculate the new health factor.',
      scoringCriteria: [
        'New xSTRK dollar value: 15,000 × 1.01 × $0.82 = $12,423',
        'Previous collateral: 15,000 × 1.06 × $0.82 = $13,038',
        'New health factor: ($12,423 × 0.83) / $8,500 = $10,311 / $8,500 = 1.21',
        'Previous health factor: ($13,038 × 0.83) / $8,500 = 1.27. De-peg reduced health factor from 1.27 to 1.21. Position still safe but de-peg impact quantified: 0.06 health factor reduction from a 4.7% LST exchange rate drop.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A user wants to stake 50,000 STRK for 12 months and also use the staked position as Vesu collateral to borrow $20,000 USDC. They ask which approach carries lower risk: (A) native staking + separate $20,000 USDC borrow collateralised by their liquid STRK holdings, or (B) LST + use LST as Vesu collateral for the borrow. Assess each and recommend.',
      scoringCriteria: [
        'Option A: staked STRK is locked and cannot be used as Vesu collateral. The user would need separate STRK holdings for the borrow. If they have them, this approach isolates staking risk from borrowing risk — no de-peg exposure on the borrow collateral.',
        'Option B: LST enables the borrow against staked position. Risk layers: native staking risk + LST protocol risk + LST de-peg affecting health factor. De-peg and protocol failure could both threaten the $20,000 borrow position.',
        'Recommendation: if the user has separate liquid STRK available for collateral, Option A is lower-risk — isolates risk layers. If LST is the only path to use staked capital as collateral, Option B is acceptable with conservative health factor (>1.6).',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain in 3 sentences: what an LST is, why it is more useful than native staking for DeFi composability, and what specific new risk it introduces for anyone using it as lending collateral.',
      scoringCriteria: [
        'LST definition: a tradeable receipt token issued by a liquid staking protocol in exchange for staked native tokens — it accrues staking yield via an increasing exchange rate',
        'Composability advantage: unlike locked native staking positions, an LST can be traded, lent, or used as collateral immediately — letting the holder earn staking yield and participate in DeFi simultaneously',
        'Collateral risk: when used as Vesu collateral, health factor is calculated using the LST market price — a de-peg (LST trading below its underlying value) reduces reported collateral value and can trigger liquidation even if the underlying token price is unchanged',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A trader plans to hold a 10× short on Extended for 14 days. Current funding rate: −0.02% per 8h (negative = shorts pay longs). Entry price: $1.00. Collateral: $6,000. Position size: $60,000. Calculate: (1) total funding cost over 14 days, (2) the price move required to break even after funding, (3) the liquidation price.',
      scoringCriteria: [
        'Funding cost: 3 periods/day × 14 days = 42 periods. $60,000 × 0.02% × 42 = $504 total funding paid.',
        'Break-even price move: $504 / $60,000 = 0.84% adverse needed just to cover funding costs. For a short, this means STRK must fall more than 0.84% to overcome funding costs alone.',
        'Liquidation price: at 10× short, adverse move threshold ≈ 9%. Short liquidation if price rises to approximately $1.00 × (1 + 0.09) = $1.09.',
        'Assessment: negative funding is a material headwind for shorts at this rate. $504 in 14 days on $6,000 collateral = 8.4% collateral consumed by funding alone.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain to a DeFi user in 3 sentences: what MEV is, why it does not manifest the same way on Starknet as on Ethereum, and what risk does remain on Starknet that the user should protect against.',
      scoringCriteria: [
        'MEV definition: value extracted from users by reordering or inserting transactions — on Ethereum, competitive bots watch the public mempool to front-run and sandwich trades',
        'Starknet difference: no public mempool means transactions are not visible before inclusion — bots cannot see pending transactions and sandwich attacks of the Ethereum type are structurally impossible',
        'Remaining risk: centralised sequencer ordering risk — the sequencer sees all incoming transactions and controls ordering. Tight slippage tolerance (0.3–0.5%) ensures adverse ordering causes transaction reverts rather than extraction.',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// BUILD TASK — Lab 9 (Expanded Choice: 4 options)
// ─────────────────────────────────────────────────────────────

export const LAB9_BUILD_TASK = {
  id: 'lab9-build-task',
  title: 'Lab 9 Build Task — Advanced DeFi Primitives',
  level: 'intermediate',
  progressionModel: 'expanded-choice-4-options',

  prompt: `
You have completed Lab 9. Choose one of the four build tasks below.
Each task takes 1–2 hours and produces a document or analysis ready for your portfolio.
  `.trim(),

  options: [
    {
      id: 'bt-a',
      title: 'Option A — Perpetuals Position Simulator',
      description: `
Build a perpetuals risk calculator in a spreadsheet or document.
The calculator must accept: entry price, direction (long/short), leverage (2×–50×), collateral amount, and funding rate (% per 8h).
It must output: position size, liquidation price, daily funding cost, 7-day funding cost, PnL at +5%, +10%, +20%, −5%, −10% price moves, and a verdict (safe/warning/liquidated) at each scenario.
Test with: (A) 10× long, $2,000 collateral, entry $0.90, funding +0.015%. (B) 25× short, $1,500 collateral, entry $1.10, funding −0.010%. Show all working.
      `.trim(),
      artifact: 'perps-risk-calculator.md or .xlsx',
      verificationCriteria: [
        'Liquidation price formula applied correctly: entry × (1 − 1/leverage + maintenance buffer) for long, inverse for short',
        'Daily funding cost = 3 × position size × funding rate (%)',
        'All five price scenarios calculated correctly for both test cases',
        'Verdict column correctly identifies liquidation at adverse move exceeding threshold',
        'Test case A and B both worked through with matching results',
      ],
    },
    {
      id: 'bt-b',
      title: 'Option B — Flash Loan Attack Analysis',
      description: `
Produce a written analysis of one real flash loan attack that occurred on any DeFi protocol (historical, documented publicly).
Your analysis must cover: what the target protocol did (in plain language), how the flash loan was used (step by step), what oracle vulnerability was exploited, how much was extracted, what protocol fix was implemented after, and whether a TWAP oracle would have prevented it.
Conclude with: a one-paragraph risk assessment for a user who currently has $50,000 deposited in a protocol using the same oracle type as the attacked protocol.
      `.trim(),
      artifact: 'flash-loan-attack-analysis.md',
      verificationCriteria: [
        'Attack steps described clearly and correctly — not generic, specific to the chosen attack',
        'Oracle vulnerability correctly identified — spot vs TWAP comparison is the frame',
        'TWAP analysis is quantified: how much would the TWAP have moved given the manipulation, and why is that insufficient for the attack to succeed',
        'User risk assessment is specific and actionable — names the oracle type and states a concrete recommended response',
      ],
    },
    {
      id: 'bt-c',
      title: 'Option C — LST Risk Assessment',
      description: `
Produce a risk assessment for using an LST as Vesu collateral on Starknet.
Your assessment must include: (1) a comparison of two existing LST options (or one Starknet LST versus stETH as a reference), covering TVL, APY, de-peg history, and collateral acceptance. (2) A worked health factor scenario showing what happens at 10% STRK price drop + 8% LST de-peg simultaneously on a $60,000 position with $35,000 borrowed. (3) A set of three specific conditions under which you would immediately exit the LST collateral position. (4) A recommendation: at what minimum health factor should an LST-collateral position be maintained?
      `.trim(),
      artifact: 'lst-risk-assessment.md',
      verificationCriteria: [
        'Comparison covers TVL, APY, de-peg history, and collateral acceptance with real or realistic data',
        'Health factor scenario: combined STRK drop + de-peg calculated correctly. $60,000 × (1−0.10) × (1−0.08) = $49,680. HF = ($49,680 × 0.83) / $35,000 = 1.18.',
        'Three exit conditions are specific observable events, not vague criteria',
        'Minimum health factor recommendation is justified by the scenario — HF 1.18 at combined stress means pre-stress HF must be well above 1.5 to survive',
      ],
    },
    {
      id: 'bt-d',
      title: 'Option D — MEV Defence Audit',
      description: `
Audit your own or a hypothetical DeFi strategy for MEV exposure on Starknet.
The strategy must include at least: two swap transactions (specify token pair, size, venue), one lending action (deposit or borrow), and one liquid staking action.
For each action: identify the specific MEV risk type (sequencer ordering, no risk, oracle risk), rate it low/medium/high, state the recommended slippage tolerance or other mitigation, and calculate the maximum extractable value at your chosen tolerance before the transaction would revert.
Conclude with a one-paragraph defence summary.
      `.trim(),
      artifact: 'mev-defence-audit.md',
      verificationCriteria: [
        'All four actions audited with correct MEV risk type identified',
        'Swap actions include specific slippage tolerance with MEV resistance calculation',
        'Lending action correctly classified as no direct MEV exposure',
        'LST action correctly identifies oracle-related risk as the MEV-adjacent concern',
        'Defence summary is specific — names the primary Starknet MEV risk (sequencer ordering) and the primary defence (slippage tolerance)',
      ],
    },
  ],
};


// ─────────────────────────────────────────────────────────────
// BOSS BATTLE — Lab 9
// ─────────────────────────────────────────────────────────────

export const LAB9_BOSS_MODE = {
  id: 'lab9-boss',
  title: 'Boss Battle — Advanced DeFi Primitives',

  phase1: {
    label: 'Phase 1 — Learning Loop',
    hintsEnabled: true,
    portfolioPush: false,
    drawCount: 8,
    taskPool: [
      { id: 'tp-01', type: 'judgment-riskAssess',
        task: '20× long, $500 collateral, entry $1.00. Price drops to $0.956. Is the position liquidated? Calculate the threshold and current loss.',
        scoringCriteria: ['Threshold at 20×: ~4.5% adverse. Drop is 4.4% — not yet liquidated but at the edge.', '$500 × 20 = $10,000 position. 4.4% × $10,000 = $440 loss on $500 collateral. One more 0.1% move liquidates.', 'Correct assessment: at liquidation threshold — immediate attention required.'] },
      { id: 'tp-02', type: 'judgment-dataInterpret',
        task: 'Perp: mark $0.72, index $0.80. Funding rate: −0.022% per 8h. Is this positive or negative funding, who pays, and what does the rate tell you about market sentiment?',
        scoringCriteria: ['Negative funding: shorts pay longs (perp below spot)', 'Mark < index: short sellers dominant — perp trading below spot', 'Market sentiment: majority is short. Funding pressure discourages continued short accumulation.'] },
      { id: 'tp-03', type: 'judgment-communication',
        task: 'Explain viewing keys to a compliance officer in 2 sentences — what they enable and what their limitation is.',
        scoringCriteria: ['What they enable: selective disclosure of a hidden transaction amount to specific parties — compliance without public revelation', 'Limitation: once shared, cannot be revoked. The recipient permanently holds the ability to disclose the amount.'] },
      { id: 'tp-04', type: 'judgment-riskAssess',
        task: 'A protocol uses a spot oracle from a $500K TVL Ekubo pool. A flash loan of $5M is available. Assess the manipulation risk.',
        scoringCriteria: ['A $5M flash loan can move a $500K pool significantly — price impact of 10× the pool TVL could shift the price substantially in one block', 'No TWAP means the protocol reads the manipulated spot price immediately', 'Assessment: high manipulation risk. Protocol should use a deeper liquidity source or TWAP oracle.'] },
      { id: 'tp-05', type: 'judgment-dataInterpret',
        task: '30-min TWAP oracle, 180 blocks. Attacker moves spot price 120% in 5 blocks. Calculate the TWAP impact.',
        scoringCriteria: ['5 blocks out of 180 = 5/180 contribution', '120% × (5/180) = 3.33% TWAP movement', 'Insufficient to enable meaningful over-borrowing. Attack fails. Attacker would need to sustain manipulation for many more blocks.'] },
      { id: 'tp-06', type: 'judgment-riskAssess',
        task: 'You are executing a $150,000 swap on AVNU Starknet with 1.5% slippage. Identify the specific risk and the correct setting.',
        scoringCriteria: ['Risk: 1.5% slippage allows up to $2,250 extraction before reverting', 'Starknet MEV risk: sequencer ordering (no mempool front-running, but sequencer ordering exists)', 'Correct setting: 0.3–0.5% for a liquid market on AVNU. Reduces potential extraction by 3–5×.'] },
      { id: 'tp-07', type: 'judgment-communication',
        task: 'Explain in 2 sentences why Starknet has no sandwich attacks but is not MEV-free.',
        scoringCriteria: ['No sandwich attacks: no public mempool means bots cannot see pending transactions and insert transactions around them', 'Not MEV-free: the centralised sequencer holds ordering authority and could, in principle, extract value by reordering transactions.'] },
      { id: 'tp-08', type: 'judgment-dataInterpret',
        task: 'xSTRK: exchange rate 1.05 STRK. STRK price $0.90. You hold 12,000 xSTRK as Vesu collateral. Borrow: $7,500 USDC. Health factor?',
        scoringCriteria: ['xSTRK dollar value: 12,000 × 1.05 × $0.90 = $11,340', 'Health factor: ($11,340 × 0.83) / $7,500 = $9,412 / $7,500 = 1.255', 'Position is above 1.0 but below the comfortable 1.5 buffer.'] },
      { id: 'tp-09', type: 'judgment-riskAssess',
        task: 'xSTRK de-pegs from 1.05 to 0.97 STRK (same $0.90 STRK price). Use the position from tp-08. Does the health factor drop below 1.0?',
        scoringCriteria: ['New value: 12,000 × 0.97 × $0.90 = $10,476', 'Health factor: ($10,476 × 0.83) / $7,500 = $8,695 / $7,500 = 1.159', 'Position survives — health factor 1.159, above 1.0. But the de-peg eroded 0.10 from the HF.'] },
      { id: 'tp-10', type: 'judgment-communication',
        task: 'Explain in 3 sentences what a flash loan is, what it is used for legitimately, and how it becomes an attack.',
        scoringCriteria: ['A flash loan is an uncollateralised loan from a DeFi protocol that must be repaid within the same atomic transaction — if not repaid, the entire transaction reverses.', 'Legitimate uses: arbitrage, collateral swaps, liquidation execution — all using borrowed capital for one transaction without long-term credit.', 'Attack form: borrow large sum → temporarily manipulate a price oracle → borrow from a lending protocol at inflated collateral value → extract and repay flash loan before oracle corrects.'] },
      { id: 'tp-11', type: 'judgment-dataInterpret',
        task: 'Perp: 12× long, $3,500 collateral, entry $0.80. Current mark $0.75 (adverse 6.25%). Funding rate +0.009% per 8h. Daily funding cost? Is this below the liquidation threshold?',
        scoringCriteria: ['Position size: $3,500 × 12 = $42,000', 'Daily funding: 3 × $42,000 × 0.009% = $11.34/day', 'Liquidation threshold at 12×: ~7.7%. Current adverse 6.25% — below threshold. Position is risky but not liquidated.'] },
      { id: 'tp-12', type: 'judgment-riskAssess',
        task: 'You are choosing between two Starknet lending protocols for a $100,000 deposit: Protocol A uses spot Ekubo oracle, Protocol B uses Pragma TWAP (20 min). Both have similar TVL and audit history. Which do you choose and why?',
        scoringCriteria: ['Protocol B is the correct choice for a large deposit', 'Pragma TWAP is significantly more resistant to flash loan oracle manipulation', 'Spot oracle (Protocol A) can be manipulated in one block via flash loan — $100,000 deposit is at risk from this attack vector', 'TVL and audit history being equal, oracle design is the deciding factor'] },
      { id: 'tp-13', type: 'judgment-dataInterpret',
        task: 'Native staking: 9% APY. LST: 8.6% APY. $25,000 STRK. LST deposited as Vesu collateral, $12,000 USDC borrowed at 4% cost, lent at 9.5% APY. Net yield of each strategy?',
        scoringCriteria: ['Native staking: $25,000 × 9% = $2,250/year', 'LST yield: $25,000 × 8.6% = $2,150. Lending loop: $12,000 × 9.5% − $12,000 × 4% = $1,140 − $480 = $660 net. Total: $2,810.', 'LST strategy yields $560 more annually. Risk: de-peg risk on collateral + lending health factor risk not present in native staking.'] },
      { id: 'tp-14', type: 'judgment-communication',
        task: 'An auditor asks: "Can you prove you received a specific payment in USDC without revealing how much you receive from other sources?" Explain in 2 sentences how viewing keys solve this.',
        scoringCriteria: ['Viewing keys are transaction-specific — you can share the key for the specific payment in question without sharing keys for any other transactions', 'The auditor can verify the exact amount of that one transaction. All other confidential transactions remain hidden — no other viewing keys have been shared.'] },
      { id: 'tp-15', type: 'judgment-riskAssess',
        task: 'Cross-chain comparison: Extended (Starknet, on-chain order book), dYdX v4 (Cosmos app-chain, off-chain order book with on-chain settlement), Drift (Solana, off-chain order book). A trader wants the most verifiable execution with no off-chain trust assumption. Which protocol and why?',
        scoringCriteria: ['Extended is correct: fully on-chain order matching on Starknet means every order and match is a verifiable on-chain transaction', 'dYdX v4: off-chain order book requires trusting the off-chain matching engine for order placement, even with on-chain settlement', 'Drift: off-chain order book, similar trust assumption to dYdX for order matching', 'Extended\'s Starknet-native low fees make on-chain matching economically viable — the feature not possible on Ethereum L1 or off-chain models'] },
    ],
  },

  phase2: {
    label: 'Phase 2 — Portfolio Push',
    hintsEnabled: false,
    portfolioPush: true,

    portfolioDefensePrompt: `
Looking at your Lab 7 and Lab 8 portfolio work:
In Lab 7 you built an LP strategy on Ekubo. In Lab 8 you designed a cross-chain capital movement plan.
Answer: if you used a liquid staking token (LST) as Ekubo LP collateral, what specific new risk would that introduce versus using native STRK?
And: if your Lab 8 bridge strategy involved a STRK perp hedge, what would the break-even hold duration look like at a +0.02% per 8h funding rate on a $50,000 hedge position?
    `.trim(),

    scenario: `
You are the Advanced DeFi Strategist for a $400,000 fund allocating across Starknet's advanced primitives.

The CIO has requested a strategy memo covering four dimensions:

Section 1 — Perpetuals Hedge
The fund has $120,000 in STRK. Design a perpetuals hedge using Extended: specify direction (long/short), leverage, collateral, and funding rate threshold above which you close the hedge. Calculate the liquidation price and the 14-day funding cost at a 0.018% rate.

Section 2 — Oracle Risk Audit
The fund uses three protocols: (A) a lending protocol with spot oracle, $90,000 deposited; (B) a lending protocol with 20-min TWAP oracle, $80,000 deposited; (C) Vesu for LST collateral, $70,000. Rate each Low/Medium/High flash loan oracle risk. Calculate how much a successful flash loan attack on Protocol A could extract from the fund's position assuming 65% LTV.

Section 3 — MEV Mitigation Policy
Define the fund's swap execution policy: maximum slippage tolerance for trades under $10,000, between $10,000–$100,000, and above $100,000. State the rationale for each threshold. Calculate the maximum extractable value (in dollars) before revert at each slippage setting.

Section 4 — LST Collateral Stress Test
The fund holds $70,000 xSTRK as Vesu collateral with $40,000 borrowed. Run two stress scenarios: (A) STRK falls 15%, LST de-peg 0%. (B) STRK falls 8%, LST de-peg 10%. Calculate health factor under each and state which scenario is more dangerous and why.
    `.trim(),

    scoringCriteria: [
      'Section 1: hedge direction, leverage, and collateral specified with clear rationale. Liquidation price correctly calculated. 14-day funding: 42 periods × position size × 0.018% shown.',
      'Section 1: funding threshold is specific and observable (e.g. "close if rate exceeds 0.03% per 8h for 3 consecutive periods").',
      'Section 2: Protocol A (spot oracle) = High flash loan risk. Protocol B (TWAP) = Low. Protocol C (Vesu LST) = Medium (LST de-peg risk, not flash loan oracle).',
      'Section 2: extraction calculation = $90,000 × LTV × fraction extractable at inflated collateral. Correct working shown.',
      'Section 3: slippage policy is specific numbers, not ranges. Rationale connects amount to extraction risk in dollars.',
      'Section 3: maximum extractable value = swap amount × slippage tolerance %. Shown for each tier.',
      'Section 4A: STRK −15%, no de-peg. xSTRK value: $70,000 × 0.85 = $59,500. HF: ($59,500 × 0.83) / $40,000 = 1.234.',
      'Section 4B: STRK −8%, de-peg 10%. xSTRK value: $70,000 × 0.92 × 0.90 = $58,044. HF: ($58,044 × 0.83) / $40,000 = 1.204.',
      'Section 4: Scenario B is more dangerous (lower HF: 1.204 vs 1.234) despite smaller STRK price drop — the combined de-peg amplifies the health factor deterioration. This is the key LST insight.',
      'Portfolio defense answered correctly: LST adds de-peg risk to LP collateral; perp hedge funding break-even calculated with 42-period × position × 0.02% formula.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-defi-portfolio',
      folderPath: '/intermediate/lab-9-advanced-primitives/',
      files: [
        {
          filename: 'advanced-primitives-strategy.md',
          type: 'narrative' as const,
          content: `# Lab 9 — Advanced DeFi Primitives: Certification

## Portfolio Defense

**Lab 7 LP + LST collateral risk:**
[Specific explanation of de-peg risk introduced when using LST as Ekubo LP collateral versus native STRK]

**Lab 8 perp hedge funding break-even:**
Position size: $[amount]. Funding rate: 0.02% per 8h = 3 × $[size] × 0.0002 = $[daily cost]/day. Break-even: $[total round-trip cost] / $[daily funding] = [days] days.

## Section 1 — Perpetuals Hedge

**Instrument:** Extended (@extendedapp) on Starknet
**Direction:** [Long / Short] — rationale: [why this direction hedges the $120K STRK exposure]
**Leverage:** [N]×  |  **Collateral:** $[amount]
**Entry price:** $[price]  |  **Liquidation price:** $[price]

**Liquidation calculation:**
Entry × (1 ± 1/[leverage] ± maintenance buffer) = $[liquidation price]

**14-day funding cost:**
$[position size] × 0.018% × 42 periods = $[total]

**Funding rate close threshold:**
[Specific rate and duration that triggers hedge closure — observable criterion]

## Section 2 — Oracle Risk Audit

| Protocol | Oracle Type | Flash Loan Risk | Rationale |
|---|---|---|---|
| A ($90K) | Spot DEX | High | Single-block manipulation possible |
| B ($80K) | 20-min TWAP | Low | 120 blocks required for meaningful movement |
| C ($70K) | Vesu/LST | Medium | De-peg risk, not direct flash loan oracle |

**Protocol A extraction if exploited:**
$90,000 × [LTV] × [extractable fraction] = $[maximum exposure]

## Section 3 — MEV Mitigation Policy

| Trade Size | Max Slippage | Rationale | Max Extractable Before Revert |
|---|---|---|---|
| < $10,000 | [%] | [rationale] | $[amount] |
| $10K–$100K | [%] | [rationale] | $[amount] |
| > $100K | [%] | [rationale] | $[amount] |

## Section 4 — LST Collateral Stress Test

**Starting position:** $70,000 xSTRK collateral, $40,000 borrowed, liquidation threshold 83%.

**Scenario A — STRK −15%, no de-peg:**
xSTRK value: $70,000 × 0.85 = $59,500
Health factor: ($59,500 × 0.83) / $40,000 = [HF]

**Scenario B — STRK −8%, LST de-peg 10%:**
xSTRK value: $70,000 × 0.92 × 0.90 = $58,044
Health factor: ($58,044 × 0.83) / $40,000 = [HF]

**More dangerous scenario:** [A or B] — because [explanation of why combined de-peg amplifies or moderates the risk]

**Minimum health factor policy for LST collateral positions:**
Maintain HF > [N] to survive the combined stress scenario above with [margin] of buffer.

## Verified by Sifter SkillUp — [date]`,
        },
      ],
      commitMessage: 'Passed Lab 9 Advanced DeFi Primitives — Intermediate Starknet DeFi Navigator',
      badgeEarned: 'Advanced Primitives Certified — Intermediate',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only' as const,
  },
};


export const NAVIGATOR_LAB_9_META = {
  id: 'navigator-intermediate-lab-9',
  title: 'Advanced DeFi Primitives',
  trackId: 'starknet-defi-navigator',
  level: 'intermediate' as const,
  labNumber: 9,
  estimatedHours: 6.0,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 8 Phase 2 complete',
  description: 'Perpetual futures (Extended) — funding rate, leverage, liquidation. Confidential transfers (Tongo Cash) — ZK privacy, viewing keys. Flash loans — atomicity, oracle manipulation, TWAP defence. MEV — Starknet sequencer model, sandwich attack prevention. Liquid staking — LST mechanics, de-peg risk, health factor impact.',
  crossChainCoverage: 'Extended vs dYdX v4 (Ethereum) vs Drift (Solana) — market depth, funding rates, fee structure, liquidation mechanics. Flash loans: Aave (Ethereum) vs MarginFi (Solana) vs Starknet. Liquid staking: stETH/rETH (Ethereum), mSOL/jitoSOL (Solana), Starknet early-stage LSTs.',
  nextLab: 'Lab 10 — Institutional DeFi Operations',
};
