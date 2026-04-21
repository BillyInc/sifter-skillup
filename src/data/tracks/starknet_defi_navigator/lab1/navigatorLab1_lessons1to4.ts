// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// JUNIOR · LAB 1 — DeFi Mental Models · LESSONS 1–4
// Written to sim_instructions_v3 standard
// Combine with navigatorLab1_lessons5to8.ts and navigatorLab1_boss.ts

export const LAB1_LESSONS_1_TO_4 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — What DeFi Actually Replaces
// ─────────────────────────────────────────────────────────────
{
  id: 'what-defi-replaces',
  title: 'What DeFi Actually Replaces',
  explanation: `
Lehman Brothers was one of the largest investment banks in the United States, managing hundreds of billions in client assets. In 2008, it collapsed overnight. Customers found their money — which felt safe in a trusted institution — had been used for risky bets they knew nothing about. They had no recourse. The bank's insolvency became their problem too.

This is the core problem DeFi (Decentralised Finance) was built to solve. DeFi removes the intermediary — the bank, broker, or exchange — that sits between you and your money.

In traditional finance, intermediaries are everywhere. A bank takes deposits and lends them out. A brokerage holds stocks. A clearinghouse confirms trades happened. Each charges fees. Each can freeze accounts, fail, or use assets without permission.

DeFi replaces each with a smart contract — a program deployed on a blockchain that executes exactly as written. The rules are public. No one can change them or freeze your funds.

With Celsius, your ETH was legally their property — they could freeze it, lend it, or lose it, and you had no recourse. In a DeFi protocol, your ETH sits in a smart contract that only your wallet can instruct. No company holds it. This is what non-custodial means.

Anyone with a wallet address can use that same protocol — no application, no identity check, no geographic filter. The code does not know who you are. This is what permissionless means.

The trade-off is real: you are responsible for your own security. Lose your keys, lose everything. Make a mistake — no one reverses it. DeFi removes the intermediary and gives you full responsibility.

In a traditional stock trade, you pay on Monday but the shares arrive on Wednesday — two business days later. In that window your counterparty could fail and your payment might never be matched with delivery. In 1974, Herstatt Bank — a German foreign exchange bank — collapsed while trades were mid-settlement, leaving counterparties with delivered payments and no assets received.

In a DeFi swap, both sides complete in the same transaction. Either your payment and the tokens arrive together, or nothing happens at all. This is what atomic settlement means.
  `.trim(),
  visualPrompt: 'Two-column comparison: Traditional Finance (bank icon, intermediary fees, T+2 settlement, custodial) vs DeFi (smart contract icon, no intermediary, atomic settlement, non-custodial).',
  visualType: 'static',
  visualUrl: 'defi-vs-tradfi-comparison',
  examples: [
    {
      contextTag: '[Remittance user, cross-border payment]',
      context: 'A worker in Dubai sends money monthly to family in the Philippines. Using Western Union, the fee is 6.2% plus a 2–3 day wait.',
      scenario: 'The same worker uses a DeFi protocol on Starknet to send 500 USDC directly to a family member\'s wallet. The fee is $0.003. The recipient receives the full amount in under 10 seconds.',
      outcome: 'The worker saved $31 in fees (6.2% of $500) and 2 days of waiting. Her sister holds USDC in a non-custodial wallet — no local agent can deduct additional fees. The transfer was atomic: either it arrived in full or it did not happen at all.',
    },
    {
      contextTag: '[Startup founder, accessing lending without a bank]',
      context: 'A startup founder in Nigeria has $80,000 of ETH and needs $40,000 in liquidity for operating expenses. No local bank will lend against crypto collateral.',
      scenario: 'The founder deposits ETH into Vesu — a lending protocol on Starknet — as collateral and borrows 40,000 USDC against it at 6.2% borrow APY. The transaction takes 12 seconds. No application form, no KYC beyond owning a wallet.',
      outcome: 'The founder has the liquidity. The ETH remains in the Vesu smart contract — not with a custodian who could freeze it. On repayment, the ETH returns immediately. No bank relationship required.',
    },
    {
      contextTag: '[2022 Celsius Network collapse, custodial risk]',
      context: 'Celsius Network was a centralised crypto lending platform. In June 2022, it froze customer withdrawals. Customers had $8.7 billion of assets on the platform they could not access.',
      scenario: 'A user had deposited 5 ETH to earn 6% yield. When Celsius froze withdrawals, those 5 ETH were locked — legally Celsius property, not the user\'s. Celsius filed for bankruptcy two months later.',
      outcome: 'The user lost access for over a year and ultimately received a fraction back. Had they used a non-custodial DeFi protocol on Starknet, their ETH would have remained in a smart contract they controlled — Celsius could not have touched it.',
    },
  ],
  keyTakeaway: 'DeFi removes the company between you and your money — the protocol executes automatically, and no intermediary can freeze, lose, or restrict your funds.',
  guidedPractice: [
    {
      question: 'What does "non-custodial" mean in DeFi?',
      options: [
        'A. The protocol stores your private key in a secure database',
        'B. You hold your own assets at all times — no intermediary ever controls them',
        'C. Your funds are insured by a government deposit scheme',
        'D. The protocol requires identity verification before you can withdraw',
      ],
      correct: 1,
      hint: 'Think about the Celsius example. Why could Celsius freeze the user\'s funds? What would have prevented it?',
      explanation: 'B is correct. Non-custodial means no intermediary ever holds your assets. Your funds sit in a smart contract only you can instruct — or directly in your wallet. Celsius could freeze funds because users transferred custody to Celsius. Option C describes traditional bank insurance, which does not exist in DeFi. Option D describes a permissioned system — the opposite of DeFi.',
    },
    {
      question: 'Maria sends $500 via Western Union at 6.2% fee. She sends the same via DeFi for $0.003. What is the approximate percentage fee reduction?',
      options: [
        'A. Approximately 50%',
        'B. Approximately 99%',
        'C. Approximately 10%',
        'D. 100% — DeFi has no fees',
      ],
      correct: 1,
      hint: 'Western Union: 6.2% of $500 = $31. DeFi: $0.003. Calculate the reduction.',
      explanation: 'B is correct. Reduction: ($31 - $0.003) / $31 = 99.99%. DeFi fees are not zero (D is wrong) — they are extremely small. Options A and C dramatically understate the difference.',
    },
    {
      question: 'What is atomic settlement and why does it eliminate counterparty risk?',
      options: [
        'A. Settlement happens very quickly — usually within 10 seconds',
        'B. Both sides of a trade complete in a single transaction — either both happen or neither does, so no party can fail before delivery',
        'C. Settlement is guaranteed by a clearinghouse that steps in if one party fails',
        'D. Both parties must sign before the transaction executes',
      ],
      correct: 1,
      hint: 'Counterparty risk is about the gap — what happens during the gap and why atomic settlement eliminates it.',
      explanation: 'B is correct. Atomic means indivisible — both asset and payment happen in the same transaction. If anything fails, the entire transaction reverts. There is no moment where one party has delivered and the other has not. Option A describes speed, not the mechanism. Option C describes a clearinghouse — the traditional solution DeFi replaces.',
    },
    {
      question: 'A DeFi protocol is "permissionless." A user in Iran tries to access it. What happens?',
      options: [
        'A. Access is blocked — the protocol detects location via IP address',
        'B. The user must apply for access and wait for approval',
        'C. The user can access the smart contract directly — it does not know or care about location',
        'D. The user needs a VPN but the protocol works normally with one',
      ],
      correct: 2,
      hint: 'A smart contract on Starknet has no concept of geography. It only sees a wallet address and a function call.',
      explanation: 'C is correct. Smart contracts are permissionless — they process any valid transaction from any wallet address. A website built on top of a DeFi protocol might block IPs (a frontend restriction), but the underlying smart contract is accessible to anyone who can send a transaction.',
    },
    {
      question: 'A DeFi protocol charges 0.3% swap fee distributed to liquidity providers. A traditional exchange charges 0.5% distributed to shareholders. What is the most important structural difference?',
      options: [
        'A. DeFi fees are lower — 0.3% vs 0.5%',
        'B. The DeFi fee goes to liquidity providers who took market risk; the exchange fee goes to shareholders who took no market risk',
        'C. DeFi fees are unpredictable while exchange fees are fixed',
        'D. The exchange charges more because it provides better customer service',
      ],
      correct: 1,
      hint: 'Focus not on the amount but on who receives the fee and what they did to earn it.',
      explanation: 'B is correct. In DeFi, fees go to liquidity providers — participants who deposited their own assets to make trading possible, taking real market risk. In traditional exchanges, fees go to the exchange (and shareholders), who extracted value without taking market risk. The fee amount difference is real but secondary to the distribution mechanism.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'You have $10,000 in a DeFi lending protocol earning 8% APY. A friend says you should move it to a centralised exchange offering 9% APY for a higher return. Assess the full risk trade-off in 3–4 sentences. Identify the specific risk the advice ignores. Assess the full risk trade-off in 3–4 sentences. Identify the specific risk the friend is ignoring.',
      scoringCriteria: [
        'Identifies custodial risk: the centralised exchange holds funds and can freeze or lose them',
        'Notes the 1% APY difference ($100/year on $10,000) is small relative to the risk of total loss',
        'Recommends staying non-custodial or explicitly quantifying what counterparty risk the user accepts',
        'Does not dismiss the higher return — acknowledges the trade-off honestly',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Traditional wire transfer: $1,000 sent internationally, 3.5% fee, T+2 settlement, $12 receiving bank fee. DeFi transfer: $1,000 USDC, $0.004 fee, 8-second settlement. Calculate: (1) total cost difference in dollars, (2) time saved, (3) traditional cost and DeFi cost each as a percentage of the transfer amount.',
      scoringCriteria: [
        'Traditional total cost: $1,000 × 3.5% = $35 + $12 = $47',
        'DeFi total cost: $0.004',
        'Cost difference: approximately $47',
        'Traditional cost as % of transfer: 4.7%. DeFi cost as % of transfer: 0.0004%',
        'Time saved: approximately 2 business days',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Your non-technical parent asks: "What is DeFi and why would I use it instead of my bank?" Explain in 4 sentences. Do not use the words: blockchain, smart contract, protocol, permissionless, or non-custodial.',
      scoringCriteria: [
        'Explains the core benefit: financial services without a company in the middle',
        'Uses an everyday analogy (vending machine, ATM, recipe, or similar)',
        'Mentions at least one concrete benefit: lower fees, faster transfers, or always accessible',
        'Mentions at least one honest limitation: you are responsible for your own security, no one to call if you make a mistake',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Tokens and Token Types
// ─────────────────────────────────────────────────────────────
{
  id: 'tokens-and-token-types',
  title: 'Tokens and Token Types',
  explanation: `
When a casino gives you chips, the chips represent money and work like money inside the casino. They are a token of your deposit. Blockchain tokens work on the same principle — a programmable record of ownership or value stored on a blockchain.

On Starknet, every token is a balance entry in a smart contract. There is no physical object. When you "hold" 100 USDC, what exists is a number — 100 — stored against your wallet address inside the USDC smart contract. Sending USDC means changing that number from your address to someone else's.

STRK is Starknet's native token — it pays transaction fees, secures the network through staking, and grants governance rights. Unlike other tokens, STRK is understood by the Starknet protocol itself.

Stablecoins like USDC and USDT maintain a fixed value of $1.00. USDC is backed by actual US dollars and US Treasury bonds held by Circle, a regulated company. USDT is issued by Tether and holds a mix of assets. Both target $1.00, but their backing and audit practices differ.

Wrapped tokens represent an asset from another chain. wBTC is Bitcoin on Starknet — you lock real BTC with a custodian and receive wBTC at 1:1. You can use wBTC in Starknet DeFi while your BTC sits locked.

Yield-bearing tokens are the most powerful type. When you hold lBTC, your locked Bitcoin earns Babylon staking rewards — the token itself becomes worth more automatically.

LP tokens are receipts. When you deposit into an exchange pool on Ekubo, you receive LP tokens proving your share of that pool. These fluctuate as trading fees accumulate and as the pooled asset prices change.
  `.trim(),
  visualPrompt: 'Token type hierarchy: Native (STRK) → Stablecoins (USDC/USDT) → Wrapped (wBTC) → Yield-bearing (lBTC) → LP tokens. Each with icon, short description, and risk indicator.',
  visualType: 'static',
  visualUrl: 'token-types-hierarchy',
  examples: [
    {
      contextTag: '[USDC vs USDT risk, $50,000 position]',
      context: 'An investor wants to park $50,000 in a stablecoin on Starknet to earn lending yield. They compare USDC and USDT.',
      scenario: 'USDC: Circle publishes monthly reserve attestations by Grant Thornton, holds cash and short-term US Treasuries only. USDT: Tether has faced legal action from the New York AG and holds a broader asset mix. Both trade at $1.00 most of the time.',
      outcome: 'The investor chooses USDC for this size because of Circle\'s transparent reserve reporting. USDT\'s reserve opacity represents additional risk not compensated by higher yield. For $5,000 the decision might differ; for $50,000, counterparty quality matters more.',
    },
    {
      contextTag: '[lBTC yield stacking]',
      context: 'A Bitcoin holder with 0.5 BTC wants to maximise yield while maintaining exposure. They research lBTC from Lombard Finance on Starknet.',
      scenario: 'The holder bridges BTC to Starknet as lBTC. Her locked BTC earns Babylon Protocol staking rewards (~3% APY). She then supplies lBTC to Vesu on Starknet, earning 2.8% supply APY. Both yields accrue simultaneously.',
      outcome: 'Keiko earns approximately 5.8% combined APY on her Bitcoin without selling it. Two separate yield streams on the same underlying asset — impossible with native Bitcoin.',
    },
    {
      contextTag: '[LP token misunderstanding]',
      context: 'A liquidity provider deposits 1,000 USDC and 1,000 STRK into an Ekubo pool. He receives LP tokens. Two weeks later, STRK price rises 40%.',
      scenario: 'The LP assumes their tokens still represent 1,000 USDC + 1,000 STRK. He checks Ekubo before withdrawing.',
      outcome: 'The LP tokens now represent 1,118 USDC and 799 STRK — the pool rebalanced as STRK rose, selling some STRK and buying USDC. His total position value is up, but he has fewer STRK than if he had simply held both assets. He earned 47 USDC in trading fees. This difference from holding is called impermanent loss.',
    },
  ],
  keyTakeaway: 'The type of token you hold determines what risk you are exposed to — stablecoins protect dollar value while yield-bearing and LP tokens change in value as market conditions shift.',
  guidedPractice: [
    {
      question: 'What does "holding 500 USDC" actually mean at a technical level?',
      options: [
        'A. You have 500 digital coins stored in your device\'s memory',
        'B. You have a number — 500 — stored against your wallet address inside the USDC smart contract on Starknet',
        'C. Circle holds $500 in a bank account specifically designated for your wallet',
        'D. Your wallet contains a cryptographic file worth $500',
      ],
      correct: 1,
      hint: 'A smart contract is code and data on the blockchain. Where does your balance live?',
      explanation: 'B is correct. A token balance is a number stored in a mapping inside the token\'s smart contract. "Sending" USDC means changing that number. No physical object, no file. Option C is close — Circle holds real dollars — but they do not segregate per individual wallet.',
    },
    {
      question: 'What is the most important difference between USDC and USDT for a DeFi user evaluating risk?',
      options: [
        'A. USDT has a longer track record — created before USDC',
        'B. USDC publishes transparent reserve attestations; USDT has been less transparent and its issuer faced regulatory action',
        'C. USDC earns staking yield automatically; USDT does not',
        'D. USDT is only available on Ethereum; USDC works across multiple chains',
      ],
      correct: 1,
      hint: 'The key risk dimension for a stablecoin is: do the backing assets actually exist and can you verify them?',
      explanation: 'B is correct. Circle publishes monthly attestations from Grant Thornton. Tether has had less transparent reporting and faced a $41M NYDFS settlement in 2021. Option A (USDT is older) is true but irrelevant to current risk. Option C is false. Option D is false — both are multi-chain.',
    },
    {
      question: 'A yield-bearing token like lBTC becomes more valuable over time without the holder doing anything. Where does this value increase come from?',
      options: [
        'A. The issuing company prints more dollars and deposits them into a reserve',
        'B. Other users buy the token, driving up price through demand',
        'C. The underlying locked BTC earns real staking rewards via Babylon Protocol, reflected in the token\'s increasing value',
        'D. The protocol inflates the token supply and distributes new tokens to holders',
      ],
      correct: 2,
      hint: 'lBTC represents Bitcoin locked in Babylon Protocol. That BTC is being staked. Where do staking rewards come from?',
      explanation: 'C is correct. lBTC\'s increasing value comes from real BTC staking rewards earned by the underlying locked Bitcoin. Babylon pays validators with BTC-denominated rewards. These flow to lBTC holders through the token\'s increasing redemption value. Options A and D describe different mechanisms. Option B is speculative price appreciation, not yield.',
    },
    {
      question: 'Marcus deposits equal values of USDC and STRK into an Ekubo pool. STRK price doubles. When he withdraws, he will have:',
      options: [
        'A. Exactly the same amounts he deposited, plus trading fees',
        'B. More USDC and less STRK than he deposited — the AMM automatically sold STRK as it became more expensive',
        'C. More STRK and less USDC — the pool rewards LPs with the appreciating asset',
        'D. More of both tokens — the price increase created value from nothing',
      ],
      correct: 1,
      hint: 'An AMM maintains balance between assets. As STRK becomes more expensive, what does it have to sell to maintain balance?',
      explanation: 'B is correct. As STRK price rises, traders buy STRK from the pool and sell USDC into it. By the time Marcus withdraws, the pool has more USDC and less STRK than when he deposited. He has fee income, but fewer STRK than if he had simply held. This is the impermanent loss mechanism.',
    },
    {
      question: 'A protocol launches a "yield token" promising 200% APY. Protocol revenue: $10,000/month. Total tokens staked: $5,000,000. Is this yield sustainable?',
      options: [
        'A. Yes — 200% APY is high but possible if the protocol grows quickly',
        'B. No — monthly revenue of $10,000 supports only 0.2% monthly yield on $5M staked, not the 16.7% monthly required for 200% APY',
        'C. It depends on the token price — if the token appreciates, APY stays accurate',
        'D. Yes — protocols can subsidise yield from their treasury indefinitely',
      ],
      correct: 1,
      hint: 'Calculate: 200% APY on $5,000,000 requires paying $10,000,000 per year. Revenue is $120,000 per year. Compare.',
      explanation: 'B is correct. Required annual payout: $10M. Actual revenue: $120K/year. Deficit of $9.88M/year must be covered by printing new tokens — which dilutes holders and eventually collapses. Option A ignores the math. Option D is false — treasuries are finite.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A user holds: 2,000 USDC, 500 STRK (price $0.80), 0.1 wBTC (BTC at $65,000), and 100 lBTC (price $650/token, earning 4.2% APY). Calculate: (1) total portfolio value in USD, (2) projected annual yield from lBTC in USD assuming constant prices, (3) which asset represents the largest portfolio concentration risk.',
      scoringCriteria: [
        'Total: $2,000 + $400 + $6,500 + $65,000 = $73,900',
        'lBTC annual yield: $65,000 × 4.2% = $2,730',
        'Largest concentration: lBTC at $65,000 / $73,900 = 87.9% — correctly identified as dominant concentration risk',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A new stablecoin launches on Starknet promising 15% APY "backed by real-world assets" — commercial real estate loans, venture debt, and US Treasuries. No audit published yet. A user wants to deposit $30,000. List three questions they must answer before depositing, and explain what each answer changes about their decision.',
      scoringCriteria: [
        'Question 1: Has an independent auditor confirmed the assets exist and are correctly valued?',
        'Question 2: If 50% of depositors withdraw simultaneously, can the real estate loans be liquidated fast enough?',
        'Question 3: Where does the 15% APY come from — is it from real asset income or new token inflation?',
        'Each question must state what the answer changes about the decision',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A friend says: "I bought 100 LP tokens in an Ekubo pool. The pool went up and I made money. Does that mean LP tokens always go up?" Correct their thinking in 3 sentences. Be specific about what drives LP token value.',
      scoringCriteria: [
        'Explains LP token value has two components: accumulated trading fees (always positive) and market value of underlying assets (can fall)',
        'Mentions impermanent loss: if one pooled asset moves significantly, the LP may have fewer of the appreciating asset than if they had just held both',
        'Concludes LP tokens can decrease in value if underlying assets fall, even with fee income',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Prices, Markets, and Liquidity
// ─────────────────────────────────────────────────────────────
{
  id: 'prices-markets-liquidity',
  title: 'Prices, Markets, and Liquidity',
  explanation: `
In 2010, a programmer paid 10,000 Bitcoin for two pizzas — worth about $41 at the time. Those Bitcoin would be worth over $600 million today. The price of Bitcoin was whatever two parties agreed it was. That is still true.

A price is the last agreed exchange rate between a buyer and a seller. On a blockchain, prices emerge from one of two mechanisms: order books or AMMs.

An order book works like an auction. Buyers post bids — the maximum they will pay. Sellers post asks — the minimum they will accept. A trade happens when a bid meets an ask. Traditional exchanges and centralised crypto exchanges (Binance, Coinbase) use order books.

An AMM (Automated Market Maker) holds a pool of two assets and uses a mathematical formula to calculate prices automatically. On Ekubo (Starknet's main AMM), if a pool has 10,000 USDC and 10,000 STRK, each STRK is priced at 1 USDC. Buy 1,000 STRK and the pool now has 11,000 USDC and 9,000 STRK — STRK price rises because it is scarcer.

If a pool holds only $20,000 of STRK, buying $5,000 of it depletes a quarter of the supply — the price spikes sharply against you. If the same pool holds $2,000,000, buying $5,000 barely registers. The ability of a market to absorb trades without moving the price is its liquidity. Liquidity in AMMs comes from liquidity providers — people who deposit token pairs into the pool.

The difference between the price quoted before your trade and the average price you actually paid is your price impact. Buying 10 STRK in a pool of 10,000,000 STRK moves price negligibly. Buying 1,000,000 STRK in the same pool moves it dramatically — you are buying 10% of the entire pool.

Multiply the current price of a token by the number of tokens in circulation. That number — the market capitalisation, or market cap — represents the total value the market assigns to the entire token supply at this moment. It can be misleading — it assumes every token is worth the current price, but selling a large position in a thin market would drive the price down dramatically.

A token where $2M trades hands daily on a $4M total valuation is being actively used. A token where only $5,000 trades daily on a $400M stated valuation is not. The total value of trades in a given period — the volume — tells you whether the stated price is based on real market activity or a handful of transactions.
  `.trim(),
  visualPrompt: 'Split diagram: order book (bids/asks meeting at a price) vs AMM (two pool buckets connected by a curve formula). Below: liquidity depth bar from "thin" to "deep" with price impact arrows.',
  visualType: 'static',
  visualUrl: 'orderbook-vs-amm-liquidity',
  examples: [
    {
      contextTag: '[Thin liquidity on a new DEX]',
      context: 'A new Starknet DEX launches with a STRK/USDC pool containing $20,000 total liquidity ($10,000 each). A trader wants to buy $5,000 of STRK.',
      scenario: 'The trader submits at 0.5% slippage tolerance. Price impact is 25% — buying $5,000 of STRK from a $10,000 STRK pool means buying half the pool. The transaction reverts because price moved more than 0.5%.',
      outcome: 'AVNU then routes to Ekubo, which has $2,000,000 liquidity. The same $5,000 trade has 0.25% price impact — within tolerance. Deep liquidity produced a better outcome.',
    },
    {
      contextTag: '[Market cap vs realisable value]',
      context: 'A new token launches with 100 billion tokens. A developer buys 90 billion at $0.001. The remaining 10 billion trade between users at $0.001 — market cap: $100,000,000.',
      scenario: 'A journalist reports "$100M market cap in first day." Investors buy. The developer holds 90% of supply. Volume on launch day: $50,000.',
      outcome: 'True realisable value is far below $100M. If the developer sells even 1% of their position, it floods the thin market and drives price to near zero. Volume of $50,000 means 99.95% of the stated $100M "value" never actually traded. This is a common manipulation tactic.',
    },
    {
      contextTag: '[AMM price impact, practical calculation]',
      context: 'An Ekubo STRK/USDC pool has $1,000,000 USDC and $1,000,000 STRK at $1.00/STRK. A trader wants to buy 50,000 STRK.',
      scenario: 'Buying 50,000 STRK from a pool of 1,000,000 STRK is 5% depletion. Price impact: ~5.26%. The trader will pay $1.0526 per STRK on average — $2,631 more than the stated price.',
      outcome: 'The trader splits into 5 × 10,000 STRK trades over 5 hours, allowing arbitrageurs to rebalance between each. Each smaller trade has under 1% price impact, saving approximately $2,000. Understanding price impact changed the strategy.',
    },
  ],
  keyTakeaway: 'A thin pool means a small trade moves the price significantly — the shallower the liquidity, the more you overpay relative to the quoted price.',
  guidedPractice: [
    {
      question: 'An AMM pool has 500,000 USDC and 500,000 STRK. You buy 50,000 STRK. After your purchase, approximately how many STRK remain in the pool?',
      options: [
        'A. 500,000 STRK — your purchase does not affect pool balance',
        'B. 450,000 STRK — you removed 50,000 from the pool',
        'C. 550,000 STRK — the pool minted new STRK for your purchase',
        'D. 475,000 STRK — the AMM retains 50% of purchased tokens as a fee',
      ],
      correct: 1,
      hint: 'You are buying STRK from the pool and paying USDC into it. Where does the STRK you receive come from?',
      explanation: 'B is correct. You pay USDC into the pool and receive STRK from the pool. The pool\'s STRK decreases by ~50,000 and its USDC increases. Every trade changes pool reserves. AMMs do not mint new tokens.',
    },
    {
      question: 'Which of these tokens would you expect to have the deepest liquidity on Starknet?',
      options: [
        'A. A newly launched meme token with $50,000 market cap, 2 days old',
        'B. USDC — the largest stablecoin integrated across all major Starknet protocols',
        'C. A governance token for a $5M TVL protocol with 3 months of operation',
        'D. wBTC with $2M of liquidity in one pool on one DEX',
      ],
      correct: 1,
      hint: 'Deep liquidity comes from: market size, breadth of integration across multiple pools, and time in market.',
      explanation: 'B is correct. USDC has the deepest liquidity — most widely used, integrated into every major Starknet protocol, highest volume. Option A is thin by definition. Option C has limited liquidity. Option D has only $2M in one pool.',
    },
    {
      question: 'A token has 100M total supply, 10M circulating supply, and last trade price $2.50. What is the correct market cap?',
      options: [
        'A. $250,000,000 — price × total supply',
        'B. $25,000,000 — price × circulating supply',
        'C. $50,000,000 — price × (circulating supply × 2 for safety)',
        'D. Cannot calculate without knowing trading volume',
      ],
      correct: 1,
      hint: 'Market cap uses circulating supply — tokens actually in the market. Total supply includes locked or unminted tokens.',
      explanation: 'B is correct. Market cap = $2.50 × 10,000,000 = $25,000,000. Option A uses total supply — that is Fully Diluted Valuation (FDV), a different metric. The distinction between $25M market cap and $250M FDV is significant.',
    },
    {
      question: 'A trader wants to buy $1,000,000 of STRK from a pool with $100M liquidity. Is this likely to cause significant price impact?',
      options: [
        'A. Yes — $1M is a very large trade regardless of pool size',
        'B. No — $1M is 1% of the $100M pool, causing ~1% price impact — manageable for most strategies',
        'C. Yes — any trade above $100,000 causes significant impact in DeFi',
        'D. No — AMMs have no price impact on any trade size',
      ],
      correct: 1,
      hint: 'Price impact scales with what fraction of the pool your trade represents. $1M / $100M = ?',
      explanation: 'B is correct. Price impact in a constant-product AMM is approximately equal to the trade fraction. $1M / $100M = 1%. Roughly $10,000 extra on a $1M trade — meaningful but manageable. Option D is false — all AMMs have price impact.',
    },
    {
      question: 'STRK has $50M daily volume and $400M market cap. An identical token has $500K daily volume and $400M market cap. What does the volume difference tell you?',
      options: [
        'A. Nothing — volume and market cap are unrelated',
        'B. STRK at 12.5% volume/market cap has high real demand; the other at 0.125% suggests its $400M market cap is based on very few actual transactions',
        'C. The lower-volume token is less risky because fewer people are trading it',
        'D. The lower-volume token will grow its volume to match STRK over time',
      ],
      correct: 1,
      hint: 'Volume/market cap ratio measures how much of the stated value actually transacts daily. Low ratio = price based on few trades.',
      explanation: 'B is correct. At 0.125%, only 0.125% of the token\'s $400M stated value transacts daily — the price could be easily manipulated and does not represent what you could realistically sell at. Option C is backwards — low volume often means illiquidity risk.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You evaluate two Starknet tokens: Token A ($4M market cap, $2M daily volume, 6 months old, audited, on AVNU and Ekubo). Token B ($400M market cap, $180K daily volume, 2 weeks old, unaudited, on one small DEX). Calculate the volume/market cap ratio for each and interpret what it means about price credibility. Recommend which has more credible price discovery.',
      scoringCriteria: [
        'Token A ratio: $2M / $4M = 50% daily turnover — high real activity relative to size',
        'Token B ratio: $180K / $400M = 0.045% — very low, $400M market cap based on tiny transaction volume',
        'Correctly identifies Token A as having more credible price discovery despite smaller market cap',
        'Notes Token B\'s unaudited status and single-DEX listing as additional risk factors',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You want to buy $200,000 of a token with $500,000 total liquidity across two Ekubo pools. AVNU shows 38% price impact. Give a complete assessment including effective purchase price and alternatives.',
      scoringCriteria: [
        'States that 38% price impact means paying ~$276,000 effective cost for $200,000 face value — a $76,000 overpayment',
        'Explains the $200,000 purchase consumes 40% of total liquidity, fundamentally moving the market',
        'Recommends buying $20K–$50K at a time over multiple days to allow arbitrageurs to rebalance',
        'Does not simply say "do not buy" — provides an actionable path if the user wants the position',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Explain to someone who understands how a supermarket works but knows nothing about finance: what an AMM is, why it needs liquidity providers, and what they earn. Use the supermarket as your central analogy. 4 sentences.',
      scoringCriteria: [
        'AMM explained as a vending machine or automatic system — no human market maker needed',
        'Liquidity provider analogy works within supermarket context (stockist, supplier, shelf-stacker)',
        'LP earnings correctly described as a share of every transaction that passes through the pool',
        'No unexplained jargon — no AMM, slippage, pool, or liquidity without an everyday equivalent',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 4 — Yield: Where It Comes From
// ─────────────────────────────────────────────────────────────
{
  id: 'yield-sources-and-reality',
  title: 'Yield: Where It Comes From and Whether It Is Real',
  explanation: `
In 2022, the Terra/Luna protocol offered 20% APY on its UST stablecoin through Anchor Protocol. $18 billion flowed in. Within two weeks in May 2022, both UST and Luna collapsed to near zero. The 20% came entirely from the Terra Foundation printing new Luna tokens to subsidise deposits — when confidence collapsed, the printing stopped and $40 billion in value evaporated.

Yield is not free. It always comes from somewhere. Understanding the source determines whether yield is real or a temporary subsidy.

There are three legitimate yield sources in DeFi. Trading fees are earned when you provide liquidity and a portion of every swap goes to you — real revenue from real economic activity. Lending interest is paid by borrowers who want capital and are willing to pay for it — the same mechanism as a bank savings account. Staking rewards come from either real protocol revenue distributed to stakers (sustainable) or new token inflation (depends on whether demand absorbs the new supply).

APY (Annual Percentage Yield) accounts for compounding. Earn 1% per month and reinvest it, and your annual return is not 12% — it is approximately 12.68% because each month you earn on a slightly larger base. APR (Annual Percentage Rate) is the simple rate without compounding.

Inflated APYs have a signature: the yield token is the same as the protocol's governance token, and the APY depends on that token maintaining its price. If the token is printed faster than demand absorbs supply, the token price falls, dollar APY falls, and eventually the structure unwinds.

A useful heuristic: if you cannot identify who is paying the yield and why they are economically motivated to pay it, the yield is probably funded by printing new tokens.
  `.trim(),
  visualPrompt: 'Three yield taps flowing into a bucket: "Trading Fees" (steady, blue), "Lending Interest" (steady, green), "Staking Rewards" (split: half blue real revenue, half red inflation). A fourth bucket "Fake Yield" has a red tap with a warning sign.',
  visualType: 'static',
  visualUrl: 'yield-sources-diagram',
  examples: [
    {
      contextTag: '[Terra/Luna collapse, fake yield case study]',
      context: 'Anchor Protocol was a savings product built on the Terra blockchain that promised 20% annual yield on deposits. It offered 20% APY on UST deposits in 2021–2022. The Terra Foundation explicitly subsidised the 20% rate by spending Luna token reserves.',
      scenario: 'An investor asks: what happens if the Luna token price falls significantly? Can the Foundation continue subsidising the 13% gap between actual yield (7%) and the promised 20%?',
      outcome: 'In May 2022, Luna fell 99.9% in 3 days. The Foundation could not sustain the subsidy. UST lost its peg. The entire $40 billion ecosystem collapsed. The 20% APY was backed by Luna token value, which proved to be circular. The investor\'s question was exactly the right one to ask.',
    },
    {
      contextTag: '[Vesu USDC lending, legitimate yield verification]',
      context: 'Vesu on Starknet shows 5.2% supply APY on USDC. A user deposits $10,000 and wants to verify the yield source before depositing more.',
      scenario: 'They check Vesu\'s dashboard: USDC pool utilisation 74%. Total deposited: $2,400,000. Total borrowed: $1,776,000. Borrow APY: 7.1%.',
      outcome: 'The math confirms the yield. Borrowers pay 7.1% on $1,776,000 = $126,000/year. After Vesu\'s 15% reserve factor, $107,100 goes to depositors. $107,100 / $2,400,000 = 4.46% APY — close to the quoted 5.2% (rates fluctuate with utilisation). The yield source is real: borrowers paying interest for capital.',
    },
    {
      contextTag: '[APY vs APR, borrower comparison]',
      context: 'A user decides between two borrowing options. Protocol A: 8% borrow APR. Protocol B: 8.5% borrow APY. They assume Protocol A is cheaper.',
      scenario: 'They calculate both in annual terms for a $100,000 loan held for 1 year.',
      outcome: 'Protocol A: $100,000 × 8% APR = $8,000 annual interest. Protocol B: $100,000 × 8.5% APY = $8,500. Protocol A is cheaper by $500. Always convert to the same compounding basis before comparing lending or borrowing rates.',
    },
  ],
  keyTakeaway: 'Every yield has a payer — and if you cannot identify who is paying and why they are economically motivated to do so, the yield is almost certainly funded by printing new tokens, which stops when the token value collapses.',
  guidedPractice: [
    {
      question: 'A DeFi protocol offers 50% APY on its governance token. Where is this yield most likely coming from?',
      options: [
        'A. Real trading fees generated by the protocol\'s DEX',
        'B. Lending interest paid by borrowers',
        'C. New governance token inflation — the protocol is printing new tokens as rewards',
        'D. Bitcoin staking rewards routed through the protocol',
      ],
      correct: 2,
      hint: '50% APY requires paying $500,000/year for every $1,000,000 staked. Is there a real payer?',
      explanation: 'C is the most likely. 50% APY is very high — very few protocols generate enough real revenue to sustain it. Most high-APY governance token programs print new tokens. This dilutes existing holders while appearing to pay yield. Ask: what is the circulating supply growth rate? What is the real protocol revenue?',
    },
    {
      question: 'Protocol X offers 8% APR. Protocol Y offers 8% APY. You borrow for exactly 1 year. Which charges you less?',
      options: [
        'A. Protocol X — APR is always cheaper than APY for the same number',
        'B. Protocol Y — APY accounts for compounding so the rate is effectively higher',
        'C. They are identical',
        'D. Cannot determine without knowing the compounding frequency',
      ],
      correct: 0,
      hint: 'APY already includes compounding. For a borrower, which stated rate is actually less?',
      explanation: 'A is correct. APY includes compounding — 8% APY means you pay 8% total over the year including compounding effects. APR of 8% simple is less than 8% APY. As a borrower, APR is better. As a depositor, APY is better because compounding works in your favour.',
    },
    {
      question: 'A lending pool has $5,000,000 USDC deposited and $3,750,000 borrowed at 8% borrow APR. What is annual interest income to depositors before protocol fees?',
      options: [
        'A. $400,000 — 8% of total deposits',
        'B. $300,000 — 8% of total borrowed amount',
        'C. $650,000 — 8% of deposits plus 8% of borrowed',
        'D. $200,000 — 8% of the difference',
      ],
      correct: 1,
      hint: 'Borrowers pay interest on the amount they borrowed, not on the total pool.',
      explanation: 'B is correct. Interest is paid by borrowers on their borrowed amount: $3,750,000 × 8% = $300,000 per year. This $300,000 is distributed to depositors after the protocol fee. Depositors do not pay interest — they receive it.',
    },
    {
      question: 'A protocol\'s staking reward APY falls from 15% to 4% over 3 months. No protocol parameters changed. What is the most likely explanation?',
      options: [
        'A. The protocol team reduced rewards maliciously',
        'B. More STRK was staked — the same total reward pool is now shared among more stakers, reducing each staker\'s share',
        'C. The staking rewards were paid in a token that lost value',
        'D. The protocol ran out of funding',
      ],
      correct: 1,
      hint: 'Total reward emissions are often fixed. What happens to each person\'s share when more people join?',
      explanation: 'B is correct. If total rewards are fixed at 1,000,000 STRK/year and staking grows from 10M to 25M STRK staked, each staked STRK earns less. Higher participation naturally dilutes individual yields. This is not malicious — it is the economic mechanism of a fixed reward pool.',
    },
    {
      question: 'A new Starknet protocol promises 200% APY on its token. TVL $800,000. Daily revenue $320. Is this yield sustainable? Calculate required annual revenue vs actual.',
      options: [
        'A. Yes — the protocol is early and revenue will grow to match the yield',
        'B. No — 200% APY on $800K TVL requires $1,600,000/year. Actual revenue: $320 × 365 = $116,800. Annual shortfall: $1,483,200 must be funded by printing new tokens',
        'C. Cannot determine without knowing the token\'s current price',
        'D. Yes — 200% APY is reasonable for a new protocol in its growth phase',
      ],
      correct: 1,
      hint: 'Annual revenue: $320 × 365. Required payout: 200% × $800,000. Compare.',
      explanation: 'B is correct. Required: $1,600,000/year. Actual: $116,800/year. Shortfall: $1,483,200 covered by printing new tokens. As recipients sell reward tokens, price falls, dollar APY falls, TVL drains. Option A and D ignore the math.',
    },
  ],
  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol advertises "real yield" — 100% of protocol fees to token stakers. Fee dashboard: $2,200/day. Tokens staked: $15,000,000. New feature expected to increase fees to $10,000/day. Calculate current APY from fees, projected APY after launch, and assess whether this is sustainable real yield.',
      scoringCriteria: [
        'Current annual fees: $2,200 × 365 = $803,000. Current APY: $803,000 / $15,000,000 = 5.35%',
        'Projected annual fees: $10,000 × 365 = $3,650,000. Projected APY: $3,650,000 / $15,000,000 = 24.3%',
        'Correctly identifies this as real yield — fee-backed — and therefore sustainable if the fee projection materialises',
        'Notes the risk: 24.3% depends on the feature actually generating $10,000/day, which is a projection',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'You have $20,000 to allocate across three yield sources: (1) STRK staking at 8.5% APY, (2) USDC lending on Vesu at 5.2% APY, (3) STRK/USDC LP on Ekubo at 18% APY (estimated, including fees and incentives). For each: identify the yield source, the primary risk, and your recommended allocation if you want 60% of $20,000 in low-risk positions.',
      scoringCriteria: [
        'Correctly identifies yield sources: staking = STRK inflation rewards, lending = borrower interest, LP = trading fees + incentive tokens',
        'Primary risks: staking = STRK price, lending = smart contract + utilisation, LP = impermanent loss + incentive sustainability',
        'Low-risk 60% ($12,000) correctly allocated to USDC lending — only stablecoin, lowest volatility',
        'Reasoning for LP allocation addresses whether the 18% is from real fees or temporary incentives',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A family member says: "A crypto app says I can earn 300% on my savings. My bank gives 4%. Is this real?" Respond honestly in 4 sentences. Include: the source question they should ask, one red flag the number signals, and one way to verify.',
      scoringCriteria: [
        'Asks the source question: "Where does this yield come from? Who is paying it and why?"',
        'Correctly identifies 300% as a red flag — requires paying $3,000/year per $1,000 deposited, which very few protocols generate in real revenue',
        'Provides a verification method: check the protocol\'s actual fee revenue on DefiLlama or the protocol dashboard',
        'Honest and balanced — does not dismiss all DeFi yield, acknowledges real yield exists at lower rates',
      ],
    },
  ],
},

];  // end LAB1_LESSONS_1_TO_4
