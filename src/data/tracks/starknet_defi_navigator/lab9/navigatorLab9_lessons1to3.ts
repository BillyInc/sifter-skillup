// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 9 — ADVANCED DEFI PRIMITIVES · LESSONS 1–3
// Written to: lesson_writing_instructions.txt v1.0 + sim_instructions_v3.md
// Dominant-concept rule applied: one dominant concept per lesson.
// Anchor → Mechanism → Label applied: every new term.
// Simulation types per lesson: all three types, no repeats within a lesson.
// Build task: Expanded Choice (4 options) — Section 20.5 (Labs 7–9).
// Portfolio push: Lab 9 Phase 2 Boss. Portfolio defense required (Lab 3+ rule).

export const LAB9_LESSONS_1_TO_3 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — Perpetual Futures (Extended)
// Dominant concept: the funding rate — not expiry — keeps a
// perpetual futures price anchored to spot by continuously
// transferring money from the crowded side to the uncrowded side.
// ─────────────────────────────────────────────────────────────
{
  id: 'perpetual-futures',
  title: 'Perpetual Futures: How the Funding Rate Anchors Price',

  explanation: `
In March 2020, the price of Bitcoin dropped from $9,000 to $4,000 in 48 hours. BitMEX was a cryptocurrency derivatives exchange where traders could hold leveraged bets on Bitcoin's price. During that crash, BitMEX processed over $700 million in forced exits in a single day. Traders who had opened 25× leveraged long positions lost their entire deposited collateral in minutes.

To understand why, you need to understand how leveraged derivatives actually work — and what keeps their price connected to the real market.

In traditional financial markets, a futures contract obligates the buyer to purchase an asset at a fixed price on a specific date. As expiry approaches, the futures price must converge to spot. But in crypto, a different instrument dominates: a contract with no expiry date. You can hold a bet on Bitcoin's price indefinitely — going up (long) or going down (short) — without the position ever naturally expiring. This is called a perpetual future, or perp.

Leverage is the multiplier applied to your exposure. You deposit $1,000 and open a 10× leveraged long position: you are exposed to $10,000 worth of price movement. A 10% favourable move returns $1,000 — doubling your deposit. A 10% adverse move returns −$1,000 — wiping your deposit. Leverage amplifies both directions equally.

Without an expiry date, there is no natural mechanism to make the perp price converge to the spot price. The solution is a payment that runs every 8 hours: traders on the dominant side pay traders on the minority side. When most traders are long and the perp trades above spot, long holders pay short holders. This payment pressure makes it expensive to hold a crowded long — pulling the perp price back toward spot. This recurring transfer between sides is called the funding rate. A positive funding rate means longs pay shorts. A negative rate means shorts pay longs.

The price used to calculate your profit, loss, and liquidation risk is not the last traded price on the exchange. It is a composite that blends the spot price with recent exchange activity, updated continuously to prevent manipulation by a single large trade. This is called the mark price. The underlying spot price it tracks is the index price. If mark exceeds index by a large margin, the funding rate rises — applying greater pressure to bring them back into alignment.

When your mark-price losses exceed your deposited collateral, the exchange force-closes your position before you can fall negative. At 10× leverage, a position is force-closed at approximately a 9% adverse move — just before your collateral is exhausted. This forced exit is called liquidation. At 20× leverage, the liquidation threshold is approximately a 4.5% adverse move.

Extended — Starknet's perpetuals protocol — executes order matching entirely on-chain. Ethereum-based perps protocols like dYdX v4 moved order matching off-chain because Ethereum's gas costs made on-chain matching uneconomical. Starknet's low fees make on-chain execution viable — every order is a transaction, every match is verifiable, no off-chain component is required.
  `.trim(),

  visualPrompt: 'Two-panel diagram. Left panel: "Funding Rate Mechanism" — a price chart showing perp price above spot (positive divergence), with an arrow labelled "Longs pay Shorts: 0.01% per 8h" pulling the perp price line downward toward the spot price line. Right panel: "Leverage and Liquidation" — a bar showing $1,000 collateral with a 10× multiplier pointing to $10,000 exposure. A price axis shows: entry price at centre, liquidation threshold at −9% (marked in red), profit zone at +10% (marked in green). Caption: "At 10× leverage, a 9% move against you liquidates the position."',
  visualType: 'static',
  visualUrl: 'perp-funding-rate-and-liquidation',

  examples: [
    {
      contextTag: '[Funding rate payment, crowded-long scenario, holding cost calculation]',
      context: 'A trader holds a $50,000 long position on ETH/USDC perpetual on Extended. The current funding rate is +0.015% per 8 hours — meaning longs pay shorts because the perp is trading above spot.',
      scenario: 'The trader holds the position for 7 days without closing. They calculate the total funding rate cost.',
      outcome: 'Three funding periods per day × 7 days = 21 funding periods. Cost per period: $50,000 × 0.015% = $7.50. Total funding paid: 21 × $7.50 = $157.50. If the price moves sideways for 7 days and the position shows zero PnL, the trader is down $157.50 purely from funding payments. High positive funding rates make long positions expensive to hold — this is the mechanism that deters holding overcrowded longs when the perp price is already above spot.',
    },
    {
      contextTag: '[Liquidation at 10× leverage, small adverse move, full collateral loss]',
      context: 'A trader opens a 10× long position on STRK/USDC at $0.80 entry price on Extended. They deposit $2,000 USDC as collateral. Their position size is $20,000.',
      scenario: 'STRK drops from $0.80 to $0.728 — a 9% adverse move. The mark price reaches the liquidation threshold.',
      outcome: 'At 10× leverage, the liquidation threshold is approximately 9% adverse. The $2,000 position size means a 9% move = $1,800 in losses, which exhausts the collateral minus the exchange\'s minimum maintenance margin. The position is force-closed. The trader loses most of their $2,000 deposit. STRK only fell $0.072 — from $0.80 to $0.728. At 10× leverage, an 8-cent move caused a complete loss. The $20,000 exposure on $2,000 collateral is what made a small price move catastrophic.',
    },
    {
      contextTag: '[Extended vs dYdX on-chain matching, Starknet fee advantage]',
      context: 'A market maker wants to place and cancel orders rapidly on a perpetuals exchange — updating quotes every 30 seconds as market conditions change. They compare Extended on Starknet versus dYdX v4 on its own Cosmos app-chain.',
      scenario: 'They calculate the cost of 2,880 order placements and cancellations per day (every 30 seconds, 24 hours).',
      outcome: 'Extended: orders are Starknet transactions at approximately $0.001 each. 2,880 × $0.001 = $2.88 per day. dYdX v4 (Cosmos app-chain): off-chain order book with on-chain settlement. Gas-free order placement — but requires running a validator or trusting the off-chain system. Extended\'s key distinction: every order is verifiable on-chain without requiring the user to trust an off-chain matching engine. Starknet\'s low fees make this economically viable — the same activity on Ethereum L1 would cost hundreds of dollars per day.',
    },
  ],

  keyTakeaway: 'The funding rate keeps a perpetual futures price anchored to spot by continuously transferring money from the side whose position is crowded to the side whose is not — making it expensive to hold a dominant position when the perp diverges from spot.',

  guidedPractice: [
    {
      question: 'A perpetual futures contract has no expiry date. What prevents the perp price from diverging indefinitely from the spot price?',
      options: [
        'A. The exchange sets the perp price equal to spot every hour',
        'B. The funding rate — a recurring payment from the dominant side to the minority side that makes it expensive to hold the majority position when the perp diverges from spot',
        'C. Leverage automatically resets the price to spot',
        'D. Arbitrageurs always close the gap instantly at zero cost',
      ],
      correct: 1,
      hint: 'Think about what the funding rate is designed to correct. Which side pays when the perp trades above spot?',
      explanation: 'B is correct. The funding rate is the mechanism that prevents indefinite divergence. When the perp trades above spot (longs dominant), longs pay shorts — making holding a long increasingly expensive until the price pressure corrects. Option A is incorrect — the exchange does not manually set prices. Option D is partially true but depends on arbitrage being profitable, which requires funding rates to make the dominant side expensive first.',
    },
    {
      question: 'You open a 5× leveraged long position with $4,000 collateral. At approximately what percentage price decline does liquidation occur?',
      options: [
        'A. 20% — five times leverage means one-fifth of the price triggers liquidation',
        'B. 5% — liquidation is always at 5%',
        'C. Approximately 18–19% — at 5× leverage, a position requires approximately 1/leverage in adverse move to exhaust collateral',
        'D. 50% — you lose half your money first',
      ],
      correct: 2,
      hint: 'Liquidation happens when losses exhaust your collateral. At 5× leverage, your exposure is 5× your collateral. How large a price move equals 100% of your collateral?',
      explanation: 'C is correct. At 5× leverage, your position size is $20,000 on $4,000 collateral. A 20% adverse move = $4,000 loss — which equals your collateral. Exchanges apply a maintenance margin buffer, so liquidation occurs at approximately 18–19%. Option A incorrectly calculates the inverse. At 10× leverage, liquidation is ~9%; at 20×, ~4.5%. The formula is approximately 1/leverage × 100% minus the maintenance buffer.',
    },
    {
      question: 'The mark price on a STRK perp is $0.85. The index price (spot) is $0.81. Which direction is the funding rate flowing, and who benefits?',
      options: [
        'A. Negative funding — shorts pay longs — because the perp is below spot',
        'B. Positive funding — longs pay shorts — because the perp is above spot, indicating longs are dominant',
        'C. Zero funding — the 4-cent gap is too small to trigger any payment',
        'D. The exchange determines the direction independently of price divergence',
      ],
      correct: 1,
      hint: 'Compare mark to index. If mark > index, which side\'s dominance is causing the perp to trade above spot?',
      explanation: 'B is correct. Mark ($0.85) > index ($0.81) means the perp trades above spot — longs are bidding it up. Positive funding: longs pay shorts. This payment pressure makes holding longs more expensive until the perp price corrects back toward $0.81. Short holders benefit by receiving funding. Option A confuses the direction — negative funding applies when perp < spot.',
    },
    {
      question: 'A trader holds a $30,000 short position on Extended. Funding rate: −0.008% per 8 hours (negative = shorts pay longs). They hold for 3 days. What is their total funding payment?',
      options: [
        'A. $30,000 × 0.008% = $2.40 total (only one period)',
        'B. $30,000 × 0.008% × 9 periods = $21.60 paid by the short holder',
        'C. $30,000 × 0.008% × 9 = $21.60 — received by the short holder',
        'D. Negative funding means the exchange pays you — $21.60 received',
      ],
      correct: 1,
      hint: 'Negative funding rate means shorts pay longs. Count funding periods: 3 per day × 3 days.',
      explanation: 'B is correct. Three 8-hour periods per day × 3 days = 9 periods. $30,000 × 0.008% = $2.40 per period × 9 = $21.60 paid by the short holder to longs. Negative funding means the perp is trading below spot — short positions are dominant. The payment pressure discourages holding the crowded short. Option C and D incorrectly reverse the direction — negative funding is a cost to shorts, not a payment received.',
    },
    {
      question: 'A trader opens a 20× long at $1.00 entry price with $500 collateral. STRK drops to $0.978. Is the position liquidated? Calculate the mark-price loss and compare to collateral.',
      options: [
        'A. No — a 2.2% move is too small to trigger liquidation at any leverage',
        'B. Yes — at 20× leverage, the liquidation threshold is ~4.5% adverse. $0.978 is a 2.2% drop, not yet at threshold.',
        'C. Yes — 20× leverage on $500 collateral means any move causes liquidation',
        'D. Yes — at 20× leverage, a 2.2% move represents $500 × 20 × 2.2% = $220 loss on $500 collateral, but liquidation at 20× occurs at approximately 4.5%, so the position is at high risk but not yet liquidated.',
      ],
      correct: 3,
      hint: 'Calculate the loss in dollars at 20× leverage on $500 collateral for a 2.2% move. Then compare to the ~4.5% liquidation threshold at 20×.',
      explanation: 'D is correct. At 20× leverage, position size = $500 × 20 = $10,000. A 2.2% move = $10,000 × 2.2% = $220 loss. The position has $500 collateral — the $220 loss reduces collateral to $280. Liquidation threshold at 20× is approximately 4.5% adverse move ($450 loss). The position is not yet liquidated, but $220 of $500 collateral is already gone. A further 2.3% drop would liquidate. Option B has the calculation backwards — B correctly identifies the threshold but incorrectly concludes liquidation has occurred.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Extended dashboard shows: STRK/USDC perp funding rate: +0.025% per 8 hours. Mark price: $0.93. Index price: $0.87. 24h open interest: $18M longs, $6M shorts. You are considering opening a long position with $3,000 collateral at 10× leverage for an expected 5-day hold. Calculate: (1) the daily funding cost, (2) the total 5-day funding cost, (3) the liquidation price, and (4) whether the funding rate creates a meaningful headwind for this strategy.',
      scoringCriteria: [
        'Daily funding: 3 periods × $30,000 × 0.025% = $22.50 per day',
        '5-day total: $22.50 × 5 = $112.50 in funding payments',
        'Liquidation price: entry $0.93 × (1 − 1/10 + maintenance buffer) ≈ $0.839 — approximately 9.8% below entry',
        'Assessment: +0.025% per 8h is a high positive rate (open interest is 3:1 long/short). $112.50 in 5 days on a $3,000 collateral position is 3.75% — significant headwind. Correct conclusion: strategy requires STRK to move more than 3.75% in your favour just to break even on funding before accounting for PnL.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A trader has three open positions on Extended: (A) 5× long, $8,000 collateral, entry $0.80, current mark $0.75 (adverse 6.25%). (B) 10× short, $3,000 collateral, entry $1.20, current mark $1.32 (adverse 10%). (C) 2× long, $20,000 collateral, entry $0.90, current mark $0.84 (adverse 6.7%). Assess each position: is it liquidated, at risk, or safe? Calculate the approximate liquidation threshold for each.',
      scoringCriteria: [
        'Position A (5×): threshold ≈ 18.5%. Current adverse move 6.25% — safe. Remaining buffer: ~12.25%.',
        'Position B (10×): threshold ≈ 9%. Current adverse move 10% — liquidated or at liquidation threshold. Position should have been closed or is being force-closed.',
        'Position C (2×): threshold ≈ 45%. Current adverse move 6.7% — safe with large buffer.',
        'Priority action: Position B is the critical issue. At 10× leverage with a 10% adverse move, the position has reached or exceeded its liquidation threshold. Trader should assess whether liquidation has already occurred.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A DeFi user who has never traded perps asks: "I have $500. Someone told me to try 50× leverage on a perp — they said I could make 10× my money if the price moves 20%. Is that right?" Respond in 4 sentences. Correct the claim, state the actual liquidation threshold at 50×, calculate what a correct 20% gain would mean, and explain the asymmetry between potential gain and liquidation risk.',
      scoringCriteria: [
        'Correct the claim: at 50× leverage, a 20% favourable move would indeed return approximately 10× the collateral ($500 × 10 = $5,000) — that part is mathematically correct',
        'Liquidation threshold: at 50× leverage, liquidation occurs at approximately 2% adverse move — a $500 position gets liquidated on a $0.02 move on a $1.00 asset',
        'Asymmetry stated clearly: to gain 10× you need a 20% favourable move; to lose everything you need only a 2% adverse move — the asymmetry is 10:1 against the trader',
        'Practical conclusion: a coin flip with $500 that pays $5,000 if heads and $0 if tails looks attractive, but 50× leverage means any 2% noise in either direction eliminates the position before any 20% trend can develop',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-perps-position',
    title: 'Open a Leveraged Position on Extended',
    instructionText:
      'Select direction, collateral, and leverage. Observe your liquidation price before executing. ' +
      'Then run the price simulation — try both a favourable and an adverse scenario. ' +
      'At 20× leverage, find how small an adverse move triggers liquidation.',
    completionCriteria: [
      'User has opened at least one position',
      'User has observed the liquidation price calculation',
      'User has triggered a liquidation scenario (adverse price move at high leverage)',
      'User has observed funding rate payment in the position summary',
    ],
  },
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Confidential Transfers (Tongo Cash)
// Dominant concept: a confidential transfer proves validity
// without revealing amount — the viewing key is what allows
// selective disclosure for compliance without breaking privacy.
// ─────────────────────────────────────────────────────────────
{
  id: 'confidential-transfers',
  title: 'Confidential Transfers: Privacy Without Sacrificing Validity',

  explanation: `
In August 2022, the US Treasury sanctioned Tornado Cash — an Ethereum protocol that mixed transaction amounts to provide financial privacy. The immediate consequence was not just legal. Because every Ethereum transaction amount is permanently visible on-chain, every wallet that had ever interacted with Tornado Cash could be identified, their transaction history inspected, and their addresses added to blocked lists by exchanges. Privacy on a public blockchain has no historical deletion option.

This is the problem that confidential transfers solve — but they solve it differently from mixing. On a standard blockchain, every transaction is fully public: sender, receiver, and amount are all visible to anyone. Mixing protocols obscure the link between sender and receiver. A different approach is to prove the transaction is valid — the amount is correct, the sender has sufficient funds, the receiver address is legitimate — without publishing the amount at all. When a user sends 5,000 USDC via a confidential transfer protocol, the on-chain record shows that a valid transfer occurred. The amount is provably hidden. This is a confidential transfer.

Starknet's architecture makes confidential transfers a natural fit. The STARK proof system — the cryptographic mechanism from Starknet Island that settles every transaction — can prove arbitrary computational statements. A proof that says "this transfer is valid and the sender's balance is sufficient" can be generated and verified without the verifier ever seeing the actual numbers. Tongo Cash is Starknet's implementation: a confidential transfer protocol that hides amounts while keeping sender and receiver addresses publicly visible for network transparency.

Hiding amounts creates a compliance question. Financial regulators, employers paying in crypto, and individuals proving income all have legitimate reasons to reveal a transaction amount to specific parties. A blanket privacy mechanism with no disclosure option would be unusable in these contexts. The solution: when a confidential transfer is executed, the sender generates a cryptographic key that grants the holder the ability to decrypt that transaction's hidden amount. Sharing this key with a regulator, auditor, or counterparty allows full disclosure of the transaction amount — without revealing any other transactions. This disclosure key is called a viewing key.

The viewing key is selective and unilateral. You choose who to share it with. It cannot be revoked after sharing, but it reveals only the single transaction it was generated for. A complete financial audit requires sharing viewing keys for every transaction you want audited — you cannot accidentally expose transactions you did not intend to disclose.
  `.trim(),

  visualPrompt: 'Two-column comparison table. Left: "Standard Transfer" — sender address visible, receiver address visible, amount visible (bold, highlighted), anyone can read. Right: "Confidential Transfer (Tongo Cash)" — sender address visible, receiver address visible, amount shows as "█████" (hidden), validity proof visible (green checkmark). Below the right column: "Viewing Key" — a key icon that, when applied, reveals the amount to the holder only. Caption: "The proof guarantees the transfer is valid. The amount is provably hidden from everyone except the viewing key holder."',
  visualType: 'static',
  visualUrl: 'confidential-transfer-viewing-key',

  examples: [
    {
      contextTag: '[Employer salary payment, amount confidentiality, viewing key for payroll audit]',
      context: 'A company pays contractors in USDC on Starknet. For competitive reasons, the company does not want salary amounts visible on-chain to other contractors, competitors, or the public. Tongo Cash is a Starknet protocol that hides transaction amounts using ZK proofs.',
      scenario: 'The payroll team executes monthly salary transfers to 12 contractors via Tongo Cash. Each transfer generates a viewing key. The company\'s auditor requests proof of payroll for the quarter.',
      outcome: 'The company shares the viewing keys for the 36 transactions (12 contractors × 3 months) with the auditor. The auditor can verify exact amounts for each payment. No other on-chain activity is exposed. Contractors cannot see each other\'s salaries by reading the blockchain — each amount appears as a cryptographic proof with no readable value without the corresponding key. The compliance requirement is satisfied without exposing business-sensitive information publicly.',
    },
    {
      contextTag: '[Regulatory compliance, selective disclosure, viewing key limitation]',
      context: 'A DeFi fund executes 200 confidential USDC transfers over 6 months via Tongo Cash for treasury management. A regulatory request requires the fund to disclose all transactions above $10,000 during the period.',
      scenario: 'The fund reviews its transaction history and identifies the 23 transfers above $10,000. They share viewing keys for those 23 transactions with the regulator.',
      outcome: 'The regulator can verify the exact amounts for the 23 disclosed transactions. The 177 transactions below $10,000 remain confidential — their viewing keys are not shared and no amount is disclosed. This demonstrates the selective disclosure design: the viewing key model allows the fund to comply with a threshold-based disclosure requirement without revealing its complete transaction history. The limitation: once a viewing key is shared, it cannot be revoked. If the regulator shares the key, that transaction amount is no longer private from whoever receives it.',
    },
    {
      contextTag: '[On-chain proof verification, Starknet native integration, no mixing required]',
      context: 'A DeFi researcher compares Tongo Cash on Starknet to Tornado Cash on Ethereum as two approaches to transaction privacy. Tornado Cash was a smart contract that pooled deposits and allowed proportional withdrawals — obscuring the link between depositor and withdrawor.',
      scenario: 'They evaluate how each protocol handles the validity question: how does each prove a transfer is legitimate without revealing private information?',
      outcome: 'Tornado Cash: privacy via obscuring the sender-receiver link — amounts were visible, sender-receiver connection was hidden. A $100 deposit and a $100 withdrawal were provably from the same pool but not provably from the same person. Tongo Cash: privacy via hiding the amount — the sender-receiver addresses remain public but the amount is hidden by a ZK proof that proves validity without revealing the number. Starknet\'s native STARK proving infrastructure makes amount-hiding proofs computationally cheap to generate and verify. The two approaches hide different information using different cryptographic mechanisms.',
    },
  ],

  keyTakeaway: 'A confidential transfer hides the transaction amount using a ZK proof that still guarantees validity — and the viewing key is what allows you to selectively prove the amount to a specific party without exposing any other transaction.',

  guidedPractice: [
    {
      question: 'What does a confidential transfer hide, and what does it keep publicly visible?',
      options: [
        'A. Hides sender address and receiver address — amount remains visible',
        'B. Hides the amount — sender address and receiver address remain publicly visible, along with a validity proof',
        'C. Hides everything — sender, receiver, and amount are all private',
        'D. Hides the receiver address — sender and amount remain visible',
      ],
      correct: 1,
      hint: 'Confidential specifically refers to the amount. What does "publicly visible" require for a blockchain to maintain transparency?',
      explanation: 'B is correct. Confidential transfers as implemented by Tongo Cash hide the amount while keeping sender and receiver addresses publicly visible. The on-chain record shows a valid transfer occurred between two known addresses. Only the amount is private. Option C describes a fully anonymous transaction — which is a different and stronger privacy guarantee than confidentiality. Option A describes the Tornado Cash model, which is amount-visible but address-link-obscuring.',
    },
    {
      question: 'A viewing key is generated when a confidential transfer is executed. What can the holder of that key do?',
      options: [
        'A. View all transactions ever made by the sender',
        'B. View the hidden amount for the specific transaction that generated the key',
        'C. Reverse or cancel the transaction if needed',
        'D. Prove to anyone that the sender has a specific total balance',
      ],
      correct: 1,
      hint: 'The viewing key is transaction-specific. What is the minimum necessary disclosure to allow compliance verification for one transaction?',
      explanation: 'B is correct. A viewing key grants access to the hidden amount of the specific transaction it was generated for — nothing else. It cannot reveal other transactions, the sender\'s total balance, or any unrelated financial information. Option A would be a full disclosure of financial history — not selective. Option C is incorrect — viewing keys are read-only; they do not grant execution authority.',
    },
    {
      question: 'A viewing key is shared with an auditor for a specific transaction. The sender later wants to make the transaction amount private again. Can they revoke the key?',
      options: [
        'A. Yes — Tongo Cash allows key revocation within 30 days',
        'B. No — once shared, a viewing key cannot be revoked. The amount is disclosed to the holder permanently.',
        'C. Yes — the sender can generate a new key to override the old one',
        'D. The transaction is re-encrypted automatically after 90 days',
      ],
      correct: 1,
      hint: 'A viewing key is a cryptographic piece of information that, once shared, exists independently. Can digital information be "un-shared"?',
      explanation: 'B is correct. Once a viewing key is shared, the recipient has a permanent copy. There is no revocation mechanism — the cryptographic information exists independently once shared. This is not a limitation specific to Tongo Cash; it is a fundamental property of how cryptographic keys work. The practical implication: share viewing keys only with parties you trust to maintain confidentiality, because the disclosure is permanent.',
    },
    {
      question: 'A ZK proof accompanies a Tongo Cash confidential transfer. What does this proof guarantee to anyone who reads the blockchain?',
      options: [
        'A. The transaction amount is correct',
        'B. The sender\'s total wallet balance',
        'C. The transfer is mathematically valid — the sender had sufficient funds and the transaction follows protocol rules — without revealing the amount',
        'D. The transaction amount, but only visible to the receiver',
      ],
      correct: 2,
      hint: 'A ZK proof proves a statement is true without revealing the underlying data. What statement does a confidential transfer need to prove for the network to accept it?',
      explanation: 'C is correct. The ZK proof proves validity — that the sender had sufficient balance, that the amount transferred matches what was committed, and that all protocol rules are followed. The proof guarantees this without revealing the actual number. This is the core property of ZK proofs from Starknet Island: proving a statement is true without revealing how. Option A would require the proof to reveal the amount — which contradicts the confidentiality purpose.',
    },
    {
      question: 'A company needs to disclose salary payments above $5,000 to a tax authority. They made 80 confidential transfers this year: 15 above $5,000 and 65 below. What is the minimum disclosure required and how is it achieved?',
      options: [
        'A. Disclose all 80 transactions — there is no selective option with confidential transfers',
        'B. Share viewing keys for the 15 transactions above $5,000 only — the 65 below remain confidential',
        'C. Disable Tongo Cash privacy retroactively for the whole year',
        'D. Disclose only the total annual amount paid — not individual transactions',
      ],
      correct: 1,
      hint: 'The viewing key is transaction-specific. To disclose exactly the transactions you need to disclose, what do you share?',
      explanation: 'B is correct. The company generates and shares viewing keys for the 15 transactions above $5,000. The tax authority can verify those specific amounts. The 65 transactions below $5,000 remain confidential — no viewing key is shared for them, no amount is disclosed. This is the selective disclosure design: you control exactly which transactions are revealed by choosing which viewing keys to share. Option A is incorrect — confidential transfers are designed to allow selective, not mandatory full, disclosure.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi fund uses Tongo Cash confidential transfers for all treasury management transactions. A regulator sends a data request for all transactions above $25,000 from the past 12 months. The fund\'s compliance officer must produce a disclosure plan. The fund executed 340 transfers total: 28 above $25,000 and 312 below. Describe the disclosure process, what the regulator receives, what remains private, and the one irreversible consequence of the disclosure.',
      scoringCriteria: [
        'Process: generate and share viewing keys for the 28 transactions above $25,000',
        'Regulator receives: the ability to decrypt and verify the exact amount for each of the 28 transactions. Sender/receiver addresses were already public.',
        'Remains private: the 312 transactions below $25,000 — no viewing keys shared, amounts remain hidden',
        'Irreversible consequence: the 28 shared viewing keys cannot be revoked. The regulator permanently holds the ability to disclose those amounts to others. The fund cannot re-establish confidentiality for those 28 transactions after key sharing.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A Starknet developer building a payroll product asks: "Why use Tongo Cash instead of just sending USDC directly? What specifically is hidden and what isn\'t?" Answer in 3 sentences, using specific information about what is visible on-chain with standard transfers versus confidential transfers, and where the viewing key fits.',
      scoringCriteria: [
        'Standard transfer: sender address, receiver address, and amount are all fully public — anyone can read the Starknet explorer and see that Wallet A sent 5,000 USDC to Wallet B',
        'Confidential transfer: sender and receiver remain public (mandatory for network transparency), but the amount is replaced by a ZK proof that proves validity without revealing the number',
        'Viewing key: generated at transfer time, allows the holder to decrypt the hidden amount for that specific transaction — enables payroll audits, tax compliance, or proof-of-payment without making amounts public to the world',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Tongo Cash on-chain explorer shows: Transaction 0xA: sender 0x1a2b, receiver 0x3c4d, amount: ████, validity proof: ✓. Transaction 0xB: sender 0x1a2b, receiver 0x5e6f, amount: ████, validity proof: ✓. You hold viewing keys for both. Key A decrypts: 12,000 USDC. Key B decrypts: 8,500 USDC. A third party (auditor) has viewing key A but not key B. What can the auditor determine and what cannot they determine about the sender\'s financial activity?',
      scoringCriteria: [
        'Auditor with key A can determine: the sender sent exactly 12,000 USDC to address 0x3c4d in transaction 0xA',
        'Auditor cannot determine: the amount of transaction 0xB — they hold no key for it. The 8,500 USDC transfer remains hidden.',
        'Auditor can determine from public blockchain data alone: the sender (0x1a2b) made two transactions, both to different receivers, both valid. No amounts for either without keys.',
        'Key insight: the viewing key model creates information asymmetry — parties with keys have more information than parties without, even about transactions involving the same sender. The auditor knows about 0xA but not 0xB, even though both are on-chain.',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-confidential',
    title: 'Confidential Transfer — Tongo Cash Demo',
    instructionText:
      'Send a standard transfer first and observe the amount on the "blockchain view." ' +
      'Then send a confidential transfer — observe what the blockchain view shows. ' +
      'Generate a viewing key and use it to reveal the hidden amount to a simulated auditor.',
    completionCriteria: [
      'User has executed one standard transfer and observed the public amount',
      'User has executed one confidential transfer and observed the hidden amount',
      'User has generated a viewing key',
      'User has used the viewing key to reveal the amount',
    ],
  },
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Flash Loans (User Perspective)
// Dominant concept: a flash loan attack exploits the atomicity
// of a single transaction — borrow, manipulate, profit, and
// repay all happen before the block closes and no external
// defence can react.
// ─────────────────────────────────────────────────────────────
{
  id: 'flash-loans-user-perspective',
  title: 'Flash Loans: What They Are and What They Do to Your Positions',

  explanation: `
In February 2020, a DeFi lending protocol called bZx was exploited twice in one week. bZx was a platform where users supplied collateral and borrowed against it. In the first attack, $360,000 was extracted in a single transaction. In the second, $600,000. Neither attack required the attacker to own any capital beforehand. Both attacks were over before a single block was finalised.

The instrument that made this possible was a flash loan. Every DeFi protocol that holds pooled capital — a lending protocol like Vesu from Lab 4, for example — holds that capital idle between user actions. A flash loan is a mechanism that lets you borrow the entire pool — $50 million, $500 million — for the duration of a single transaction. The condition: you must repay the full borrowed amount, plus a small fee, before the transaction closes. If you fail to repay, the entire transaction is reversed as if it never happened. No collateral required. No credit check. The only security is the atomicity guarantee: either the loan and the repayment both happen in full, or neither does. This is called an atomic transaction.

The attack that makes a flash loan dangerous is not the loan itself. It is what the attacker does with the capital between borrowing and repaying. Most DeFi protocols determine the price of an asset by reading from an on-chain source — often a simple DEX spot price. An attacker who borrows $50 million can use that capital to temporarily move the price on a small DEX, creating an artificial price reading. A lending protocol that reads that manipulated price will lend against the inflated collateral value before the price corrects. By the time the DEX price returns to normal — within the same transaction — the attacker has extracted the lending protocol's real funds and repaid the flash loan. This is oracle manipulation: the deliberate exploitation of a protocol's price source.

For your positions, flash loan attacks create two specific risks. First, if a protocol you have deposited into is exploited by a flash loan, your deposited funds may be partially or fully drained — exactly as the bZx depositors experienced. Second, if a flash loan attack manipulates the price oracle for a token you hold as collateral in a lending protocol, your health factor — the ratio of collateral value to borrowing from Lab 4 — may temporarily drop below 1.0, triggering an automated liquidation even though the market price of your collateral did not actually change.

Protocol defences have evolved. A time-weighted average price oracle — which calculates the average price across many blocks rather than the current spot price — is much harder to manipulate with a single-block flash loan because a single large trade cannot move the average meaningfully. This is called a TWAP oracle. Smart contract circuit breakers that limit how much the protocol's internal price can change in a single block provide a second layer. Understanding these defences helps you evaluate whether a protocol you are depositing into is protected against the attack vector.
  `.trim(),

  visualPrompt: 'Single-transaction timeline diagram. A horizontal bar labelled "One Block — One Transaction." Inside the block, four sequential steps: (1) Borrow $10M flash loan from Protocol A — (2) Use $10M to move price on DEX → oracle reads inflated price — (3) Use inflated collateral value to borrow real funds from Protocol B — (4) Repay $10M + fee to Protocol A. At the end: "Block closes. Protocol B is drained. Protocol A is whole. Net cost to attacker: zero." Arrow annotation: "If step 4 fails for any reason, entire transaction is reversed — no harm done to any protocol."',
  visualType: 'static',
  visualUrl: 'flash-loan-attack-anatomy',

  examples: [
    {
      contextTag: '[bZx oracle manipulation attack, spot price exploited, attacker zero capital]',
      context: 'bZx was a DeFi lending and margin trading platform on Ethereum. In February 2020, it used a single Uniswap pool — a small DEX with limited liquidity at the time — as its price oracle for collateral valuation.',
      scenario: 'An attacker borrowed $10 million using a flash loan from dYdX. They used part of the capital to move the price of a token on the Uniswap pool bZx read as its oracle. The inflated oracle price made the attacker\'s collateral appear more valuable. They borrowed against the inflated value, extracted $360,000 in real funds, and repaid the flash loan — all in one transaction.',
      outcome: 'The attacker started with no capital and ended with $360,000. bZx users who had deposited funds lost a proportional share of the drained pool. The root cause was not a code bug in the traditional sense — it was the use of a manipulable spot price as an oracle. The fix: TWAP oracles that average prices over many blocks cannot be moved by a single flash loan without sustaining the manipulation across multiple blocks, which becomes prohibitively expensive.',
    },
    {
      contextTag: '[Health factor liquidation via oracle manipulation, no real price change]',
      context: 'A user supplies $30,000 of wBTC to Vesu — the lending protocol from Lab 4 — as collateral, and borrows $18,000 USDC against it. Their health factor is 1.38.',
      scenario: 'A flash loan attack manipulates the on-chain price oracle for wBTC, temporarily depressing the reported wBTC price by 25%. Vesu reads the manipulated price and recalculates the health factor using the artificially low collateral value.',
      outcome: 'With wBTC price showing 25% below real value, the user\'s $30,000 collateral appears to be worth only $22,500. New health factor: ($22,500 × 0.83) / $18,000 = 1.03 — dangerously close to liquidation. If the protocol has no protection and a liquidation bot detects this, the user could be partially liquidated at the artificially low price. Protocols using TWAP oracles or circuit breakers would reject a 25% single-block price movement as invalid, protecting the user\'s position from flash-loan-induced liquidation.',
    },
    {
      contextTag: '[TWAP oracle defence, manipulation resistance, cost to attacker]',
      context: 'A lending protocol uses a 30-minute TWAP oracle for its collateral price calculations. An attacker attempts to use a $20 million flash loan to manipulate the oracle-reported price of STRK upward by 40% within a single block.',
      scenario: 'They execute the manipulation within one block and attempt to borrow against the inflated STRK value.',
      outcome: 'The TWAP oracle uses the average STRK price across the last 180 blocks (30 minutes at 10-second block times). A single block contributes 1/180 of the average. Even after moving the spot price 40% in one block, the TWAP moves by approximately 40% / 180 = 0.22%. A 0.22% price change does not materially increase collateral value. The attack fails. To move a 30-minute TWAP by 40%, the attacker would need to sustain the artificial price for 30 minutes — requiring continuous capital deployment across many blocks and making the attack economically unfeasible.',
    },
  ],

  keyTakeaway: 'A flash loan attack exploits atomicity — borrow, manipulate an oracle, profit, and repay all within one transaction before any defence can react — and TWAP oracles defend against it by making a single-block price manipulation insufficient to move the average.',

  guidedPractice: [
    {
      question: 'What is the essential condition that makes a flash loan collateral-free?',
      options: [
        'A. The borrower has a good on-chain credit score',
        'B. The loan and the repayment happen within the same atomic transaction — if repayment fails, the entire transaction is reversed as if the loan never occurred',
        'C. Flash loans are insured by the protocol\'s treasury',
        'D. The borrower must hold the borrowed tokens in escrow for 24 hours before using them',
      ],
      correct: 1,
      hint: 'What guarantees that a flash loan lender cannot lose their funds? Think about what "atomic" means for a transaction.',
      explanation: 'B is correct. Atomicity is the core guarantee: either the loan is taken AND repaid within the same transaction, or nothing happens. The protocol cannot lose funds because the entire transaction — including the return — is a single unit. If repayment fails for any reason, the Ethereum or Starknet VM reverts the transaction completely. No collateral is needed because the protocol\'s exposure window is literally zero blocks long.',
    },
    {
      question: 'An attacker uses a flash loan to manipulate a DEX spot price temporarily. Why does this damage a lending protocol that did not take any loans?',
      options: [
        'A. The flash loan directly withdraws funds from the lending protocol',
        'B. The lending protocol reads the manipulated spot price as its collateral oracle — lenders based on this inflated value release real funds against overvalued collateral',
        'C. The DEX and the lending protocol share the same smart contract',
        'D. The flash loan pays interest that reduces the lending protocol\'s reserves',
      ],
      correct: 1,
      hint: 'The lending protocol trusts an external price source. What happens when that price source reports a false value temporarily?',
      explanation: 'B is correct. The attack chain: (1) flash loan provides capital to move a DEX price; (2) the lending protocol uses that DEX price as its oracle for collateral valuation; (3) the inflated oracle value allows borrowing more than the collateral is actually worth; (4) the attacker exits with real funds before the price corrects. The lending protocol was not directly attacked — its oracle was. Option A is incorrect — the flash loan itself does not withdraw from unrelated protocols.',
    },
    {
      question: 'A protocol uses a 30-minute TWAP oracle with 180 blocks. An attacker uses a flash loan to move a token\'s spot price 60% upward in a single block. By approximately how much does the TWAP change?',
      options: [
        'A. 60% — TWAP reflects any price change immediately',
        'B. 30% — TWAP smooths by half',
        'C. Approximately 0.33% — 60% divided by 180 blocks contributes one block of influence',
        'D. 0% — TWAP completely ignores single-block movements',
      ],
      correct: 2,
      hint: 'A TWAP averages across N blocks. One block contributes 1/N of the total. What is 60% × (1/180)?',
      explanation: 'C is correct. The 30-minute TWAP uses 180 blocks. One block contributes 1/180 of the weighted average. 60% × (1/180) = 0.33%. The TWAP moves by 0.33% while the spot moved 60%. This is insufficient to move collateral values meaningfully — the attack fails to extract disproportionate funds. Option D is wrong — TWAP does reflect the block, just at 1/180 weight.',
    },
    {
      question: 'Your wBTC collateral has a real market price of $60,000. A flash loan attack temporarily depresses the oracle-reported price to $48,000. You have $30,000 borrowed against $40,000 of wBTC (at $60K/wBTC price). Will your position be liquidated during the manipulation?',
      options: [
        'A. No — a 20% oracle drop cannot trigger liquidation',
        'B. Yes — at a reported $48K price, your wBTC is valued at $32,000 by the protocol. Health factor: ($32,000 × 0.83) / $30,000 = 0.885 — below 1.0, triggering liquidation',
        'C. Only if the manipulation lasts more than 15 minutes',
        'D. No — smart contracts always verify the market price before liquidating',
      ],
      correct: 1,
      hint: 'Calculate the reported collateral value at $48K, apply the liquidation threshold (83%), and compare to your $30,000 borrow. A health factor below 1.0 triggers liquidation.',
      explanation: 'B is correct. At the manipulated price of $48,000, your wBTC (0.667 wBTC = $40K at $60K price) is now reported as 0.667 × $48,000 = $32,000. Health factor = ($32,000 × 0.83) / $30,000 = $26,560 / $30,000 = 0.885. Below 1.0 — liquidation triggered. The real market price is still $60,000 but the protocol acts on its oracle. This is why oracle quality directly determines the safety of your collateral positions.',
    },
    {
      question: 'Protocol A uses a spot DEX oracle. Protocol B uses a 30-minute TWAP oracle. Both have equal TVL. You are depositing $80,000 as collateral for a long-term borrowing position. Evaluate each protocol\'s flash loan attack exposure and state which is safer for this use case.',
      options: [
        'A. Protocol A is safer — spot oracles reflect true current market prices',
        'B. Protocol B is safer — a 30-minute TWAP requires sustaining artificial price manipulation across 30 minutes of blocks to meaningfully affect collateral valuation, making flash loan oracle attacks economically infeasible',
        'C. Both are equally safe — flash loans affect all oracles identically',
        'D. Protocol A is safer if the DEX has high liquidity — large DEXs cannot be manipulated',
      ],
      correct: 1,
      hint: 'Which oracle can be meaningfully moved by a single-block flash loan? How many blocks does a 30-minute TWAP require sustained manipulation across?',
      explanation: 'B is correct. A single-block flash loan can temporarily move a spot oracle significantly — as demonstrated in bZx. A 30-minute TWAP (180 blocks) can be moved by at most 1/180 of the single-block price impact per block. Sustaining meaningful manipulation across 180 blocks requires continuous capital deployment — economically unfeasible and detectable. Option D is incorrect — even large DEXs can be temporarily moved by sufficiently large flash loans. TVL alone does not protect spot oracles.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A DeFi analytics dashboard shows the following event: Block 450,201: STRK/USDC spot price on DEX A jumps from $0.85 to $1.28 (+50.6%). Block 450,201: Protocol X (lending) issues a borrow of $1.2M USDC against STRK collateral valued at $1.28. Block 450,201: DEX A STRK price returns to $0.85. Block 450,201: Lending transaction repaid in same block. Block 450,201: A $1.2M flash loan from Protocol Y is repaid. Interpret what happened, identify the attack type, and state the defender type that would have blocked this.',
      scoringCriteria: [
        'Attack identification: flash loan oracle manipulation. Attacker borrowed $1.2M flash loan from Protocol Y, used it to temporarily move STRK price on DEX A from $0.85 to $1.28, borrowed $1.2M USDC from Protocol X against the inflated STRK collateral value, repaid the flash loan — all in one block',
        'Key indicator: all events happen in block 450,201 — single-block atomicity confirms flash loan attack',
        'Defender that would block it: TWAP oracle on Protocol X. A 30-minute TWAP would show approximately $0.85 + (0.006% of the spike) = essentially unchanged. The collateral value would not increase sufficiently to issue the $1.2M borrow.',
        'Correct conclusion: Protocol X\'s spot oracle was the vulnerability. Protocol Y (flash loan source) was used as a tool but was not harmed — the loan was repaid.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A new DeFi user plans to deposit $100,000 into a Starknet lending protocol and borrow $60,000 USDC against it for 6 months. They ask: "The protocol is audited and has been running for 2 years — is it safe from flash loan attacks?" Write a 3-sentence response that explains the specific risk flash loans create for their position, names the one protocol feature that would significantly reduce this risk, and gives them a concrete action to verify whether the protocol has this protection.',
      scoringCriteria: [
        'Explains the specific risk: a flash loan attack that manipulates the oracle reporting their collateral\'s price could temporarily drop their reported collateral value, pushing their health factor below 1.0 and triggering liquidation — even if the real market price of their collateral did not actually change',
        'Names the protection: a TWAP oracle (time-weighted average price) that calculates price over many blocks — a single-block flash loan cannot meaningfully move a 30-minute TWAP',
        'Concrete verification action: check the protocol\'s documentation or smart contract for the oracle address, look up whether it is a spot oracle or TWAP oracle, and check the TWAP window duration — 30 minutes (180 blocks on Starknet) or longer provides meaningful protection',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You are evaluating two Starknet lending protocols for a $120,000 USDC deposit. Protocol A: spot DEX oracle (Ekubo price feed), TVL $45M, audited 4 months ago, no exploits. Protocol B: 20-minute TWAP oracle (Pragma price feed), TVL $22M, audited 6 months ago, no exploits. Produce a risk assessment comparing oracle vulnerability for each. State which is safer for a long-duration deposit and why TVL alone does not resolve the comparison.',
      scoringCriteria: [
        'Protocol A risk: spot Ekubo oracle can be manipulated in a single block via flash loan. TVL $45M means a sufficiently large flash loan could move the Ekubo price meaningfully. Flash loan attacks on spot oracles do not require breaching TVL — they manipulate the price feed the protocol trusts.',
        'Protocol B risk: 20-minute TWAP (Pragma). A flash loan can move at most 1/120 of the TWAP per block. Meaningful manipulation requires 20 minutes of sustained artificial pricing — economically infeasible.',
        'TVL argument addressed: Protocol A\'s higher TVL does not protect it from oracle manipulation — the attack targets the price feed, not the TVL directly. A large DEX can still be temporarily moved by a large enough flash loan.',
        'Recommendation: Protocol B for a long-duration $120,000 deposit. Lower TVL is a weaker signal than stronger oracle design for flash loan attack resistance. TWAP protection is a structural defence, not a probabilistic one.',
      ],
    },
  ],

  interactiveSimulator: {
    componentId: 'starkzap-flashloan-defence',
    title: 'Flash Loan Attack — What Happens to Your Position',
    instructionText:
      'Your position: $40,000 USDC deposited in a lending protocol, $25,000 borrowed. ' +
      'Watch a flash loan attack manipulate the oracle and observe the health factor impact. ' +
      'Then enable a TWAP oracle defence and observe why the same attack fails.',
    completionCriteria: [
      'User has observed a flash loan attack depressing their collateral oracle price',
      'User has seen their health factor drop below 1.0 due to oracle manipulation',
      'User has enabled the TWAP oracle defence',
      'User has observed the same attack failing to meaningfully move the TWAP',
    ],
  },
},

];  // end LAB9_LESSONS_1_TO_3
