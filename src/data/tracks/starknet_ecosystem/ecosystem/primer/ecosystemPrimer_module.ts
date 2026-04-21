// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// PRIMER MODULE — "Before You Begin"
// Three mandatory micro-lessons. Unlocks before Lab 1.
// No portfolio push. No build task.
//
// Lesson type classification (per Section 0, lesson_writing_instructions_v2-1):
//   L0.1 — TYPE A: cause/effect, no math, no tool steps
//   L0.2 — TYPE A/B MIXED: conceptual + dilution calculation layer
//   L0.3 — TYPE C: developer pipeline workflow IS the mechanism
//
// Learner: zero DeFi knowledge. May be a teenager finishing school.
// Rule: plain relatable English ALWAYS before any technical term.
// Every term follows: real-world situation → what it does → then name it.

// ─────────────────────────────────────────────────────────────────────────────
// PRIMER L0.1 — What Is a Layer 2? (And Why Does It Exist?)
// TYPE A — Conceptual / Narrative
// Dominant concept: Ethereum gets congested and expensive.
// Layer 2s are separate networks that process transactions cheaply
// and report back to Ethereum for security.
// ─────────────────────────────────────────────────────────────────────────────

export const PRIMER_L0_1 = {
  id: 'primer-l0-1-what-is-a-layer2',
  title: 'What Is a Layer 2? (And Why Does It Exist?)',
  trackType: 'A',
  lessonNumber: 1,
  module: 'primer',

  explanation: `
Think about the last time you were stuck in traffic on a busy motorway. Every car wants to get to the same city. The motorway can only handle so many cars at once. The more cars that join, the slower everything gets — and the more expensive it becomes to even get on (toll prices go up when demand spikes).

In 2021, Ethereum hit exactly this problem — but with people trying to send cryptocurrency instead of cars trying to reach a city. Ethereum had become incredibly popular. Hundreds of thousands of people were all trying to make transactions at the same time. The network could only process about 15 transactions per second. When demand exceeded that, a bidding war started. People paid higher and higher fees just to get their transaction processed faster.

At the peak of the congestion, sending $10 worth of cryptocurrency on Ethereum cost $50 to $200 in fees. That is like calling a taxi to travel 200 metres and being charged £300 for the ride. The transaction makes no economic sense.

Something had to be built to solve this.

---

THE BYPASS ROAD

Engineers who build cities solve traffic jams by building bypass roads — separate routes that run alongside the main road. Most traffic moves onto the bypass. The main road stays clear for essential use. Both roads lead to the same place.

A Layer 2 is that bypass road for Ethereum. It is a completely separate network that runs alongside Ethereum. Transactions happen on the Layer 2 — fast and cheap, because far fewer people are competing for space. But here is the key part: the Layer 2 does not operate independently forever. Periodically, it bundles up everything that happened on it and sends a compressed summary back to Ethereum, proving that all of it was valid. Ethereum then stamps it as permanently settled.

You get the speed and low cost of the bypass. You still get the security of the main road.

The separate network that processes transactions cheaply and regularly reports back to Ethereum for security — that is what a Layer 2 is. Starknet is a Layer 2.

---

TWO DIFFERENT WAYS TO PROVE EVERYTHING WAS VALID

Both types of Layer 2 send their transaction records back to Ethereum. But they use completely different methods to prove those records are honest, and this difference matters for you as a user.

METHOD ONE: ASSUME IT IS FINE, CHALLENGE IF NOT

Imagine you submit an expense report to your employer. Your employer does not check every receipt — they approve the report immediately and pay you. But there is a rule: if anyone spots something suspicious in the next 7 days, they can flag it and trigger a full audit. You only get the money after those 7 days pass without a challenge.

Some Layer 2s work exactly like this. They post transactions to Ethereum immediately and assume they are all valid. Anyone who thinks a transaction was fraudulent has a 7-day window to challenge it. During those 7 days, your money cannot leave the Layer 2 — you have to wait for the challenge window to close before withdrawing to Ethereum.

This is called the optimistic model. Arbitrum and Optimism are two well-known Layer 2s that use it. They are called optimistic rollups because they optimistically assume all transactions are valid unless proven otherwise.

METHOD TWO: PROVE IT IS CORRECT BEFORE POSTING IT

Now imagine a different expense report process. Before your employer even sees your report, an automated system verifies every single receipt mathematically. By the time your employer receives the report, it comes with a cryptographic certificate that says: "I have checked all of this. Every number is correct. It is mathematically impossible for this to be wrong." Your employer can verify that certificate in seconds without re-checking everything themselves.

No waiting period. No challenge window. It is settled the moment Ethereum verifies the certificate.

This is the validity proof model. Instead of assuming validity and waiting for challenges, it proves validity upfront with mathematics. There is no 7-day waiting period because there is nothing to challenge — the proof already confirms everything is correct.

Starknet uses this second method. The mathematical certificate it generates is called a STARK proof. The next lessons will explain how that proof works. For now, the key point: Starknet proves everything is correct before posting to Ethereum, so withdrawals are not stuck waiting for a challenge window.

---

WHY THIS MATTERS FOR YOU

If you use a Layer 2 built on the optimistic model and you want to move your money back to Ethereum, you wait 7 days. No exceptions. That is the trade-off for the simplicity of the system.

If you use Starknet, your transactions are financed and proven mathematically. Moving money back to Ethereum does not require a 7-day wait for potential challenges — because the mathematics have already settled the matter.

Understanding this distinction will matter when you reach Lab 2 and Lab 5, where we compare Starknet to other Layer 2s in detail.
  `.trim(),

  keyTakeaway: 'A Layer 2 is a separate network that processes transactions cheaply and reports back to Ethereum for security — Ethereum validates the summary without processing every individual transaction itself.',

  visualPrompt: 'Two-column diagram. Left column labelled OPTIMISTIC ROLLUP: shows transactions posting to Ethereum immediately, then a 7-day clock icon, then a green tick at day 7. Right column labelled VALIDITY PROOF (STARKNET): shows transactions being checked by a proof generator, then a certificate icon, then an immediate green tick on Ethereum with no waiting period. Below both columns, a shared box labelled ETHEREUM acting as the security foundation for both. Clean, no text inside the diagram — labels only on the outside.',
  visualType: 'static',
  visualUrl: 'layer2-optimistic-vs-validity',

  examples: [
    {
      contextTag: '[New crypto user, first time hearing about Ethereum fees]',
      context: 'A university student wants to send 50 USDC to a friend using Ethereum. USDC is a stablecoin — a cryptocurrency whose value is pegged to $1, so 50 USDC = exactly $50.',
      scenario: 'She opens her Ethereum wallet and enters the transaction. Her wallet shows the gas fee to process it: $34. She is being charged $34 to send $50 — a 68% fee. She cancels the transaction and researches alternatives.',
      outcome: 'She discovers Starknet. The same transaction on Starknet costs $0.003 in fees. She bridges her USDC to Starknet — moves it from Ethereum onto the Layer 2 — and completes the transfer. Her friend receives the full $50. The Layer 2 solved the exact problem that made Ethereum unusable for small transactions.',
    },
    {
      contextTag: '[User comparing withdrawal times between two Layer 2s]',
      context: 'A DeFi user has $3,000 on Arbitrum (an optimistic rollup) and $3,000 on Starknet (a validity proof Layer 2). She needs the money on Ethereum mainnet urgently for a time-sensitive investment.',
      scenario: 'She initiates withdrawals from both on Monday. Her Starknet withdrawal completes and arrives on Ethereum within hours once the next proof is submitted. Her Arbitrum withdrawal enters the 7-day challenge window — it will not arrive on Ethereum until the following Monday at the earliest.',
      outcome: 'The Starknet withdrawal was available when she needed it. The Arbitrum withdrawal arrived 7 days too late for the opportunity. The difference was the withdrawal model: validity proof vs optimistic assumption.',
    },
    {
      contextTag: '[Someone asking why Ethereum itself is not just faster]',
      context: 'A friend who has been following blockchain news asks: "Why not just upgrade Ethereum to be faster instead of building all these Layer 2s on top of it?"',
      scenario: 'Ethereum has been working on upgrades since 2020. The transition to Proof of Stake in 2022 improved energy consumption but did not dramatically increase transaction speed. Increasing Ethereum\'s base throughput requires trade-offs with decentralisation and security that the community has not been willing to make.',
      outcome: 'Layer 2s emerged as the practical solution: let Ethereum remain secure and decentralised at the base layer, and handle the volume of activity on specialised networks built on top of it. This is the same philosophy as keeping motorway infrastructure intact and building bypasses, rather than demolishing and rebuilding the motorway itself.',
    },
  ],

  guidedPractice: [
    {
      question: 'In 2021, sending a transaction on Ethereum could cost $200 in fees even when only a small amount of value was being moved. What was the root cause of these high fees?',
      options: [
        'A. Ethereum developers were charging users a premium for using a popular blockchain',
        'B. Too many people tried to use Ethereum at the same time, triggering a bidding war for the limited space in each block',
        'C. Cryptocurrency transactions always cost a fixed percentage of the amount being sent',
        'D. The high fees were caused by hackers stealing money during the transaction process',
      ],
      correct: 1,
      hint: 'Think about what happens to prices when lots of people want the same limited thing at the same time — like concert tickets or petrol during a shortage.',
      explanation: 'B is correct. Ethereum can only process around 15 transactions per second. When demand exceeded that limit, users bid against each other to get their transactions included first — whoever paid the highest fee got processed. This is exactly like a ticket auction: limited supply, high demand, prices go up. Option A is wrong — Ethereum has no central authority charging fees. Option C is wrong — fees are not a percentage of the amount. Option D is wrong — fees have nothing to do with hacking.',
    },
    {
      question: 'What is the core job of a Layer 2?',
      options: [
        'A. To replace Ethereum entirely with a faster blockchain',
        'B. To process transactions separately from Ethereum and periodically report back to Ethereum for security',
        'C. To store cryptocurrency offline so hackers cannot access it',
        'D. To create new cryptocurrencies that are faster than Ethereum',
      ],
      correct: 1,
      hint: 'Think about the bypass road analogy. What does the bypass road do, and what does it still connect to?',
      explanation: 'B is correct. A Layer 2 processes transactions on its own network — faster and cheaper — and then regularly sends a summary back to Ethereum. Ethereum provides the underlying security. The Layer 2 provides the speed and low cost. Option A is wrong — Layer 2s work with Ethereum, not instead of it. Option C describes a hardware wallet, not a Layer 2. Option D is wrong — a Layer 2 uses existing cryptocurrencies, it does not create new ones.',
    },
    {
      question: 'You have $5,000 on an optimistic rollup Layer 2 and need the money on Ethereum mainnet by Friday. Today is Monday. Can you guarantee the money arrives on time?',
      options: [
        'A. Yes — Layer 2 withdrawals always complete within 24 hours',
        'B. No — optimistic rollups have a 7-day challenge window, so the money cannot arrive until next Monday at the earliest',
        'C. Yes — you can pay a higher fee to skip the waiting period',
        'D. No — Layer 2 withdrawals are permanently locked and cannot be moved back to Ethereum',
      ],
      correct: 1,
      hint: 'Recall how the optimistic model works. What happens immediately after you request a withdrawal, and how long must you wait?',
      explanation: 'B is correct. Optimistic rollups assume all transactions are valid and post them to Ethereum, but allow a 7-day challenge window before the withdrawal is finalised on Ethereum. Starting Monday, the earliest the money can arrive is the following Monday. Option A is wrong — this describes a validity proof system like Starknet, not an optimistic rollup. Option C is wrong — no fee can bypass the 7-day security window. Option D is wrong — withdrawals are possible, just delayed.',
    },
    {
      question: 'What makes Starknet\'s approach to security different from the optimistic rollup approach?',
      options: [
        'A. Starknet asks users to manually verify that their transactions are correct',
        'B. Starknet generates a mathematical proof that all transactions are correct before posting to Ethereum — no challenge window needed',
        'C. Starknet stores all transaction records off-chain forever, never touching Ethereum',
        'D. Starknet is faster because it skips the Ethereum verification step entirely',
      ],
      correct: 1,
      hint: 'Think about the expense report analogy. What did the second method do before submitting anything?',
      explanation: 'B is correct. Starknet generates a STARK proof — a mathematical certificate that proves all transactions are correct — before posting anything to Ethereum. Ethereum verifies the certificate, not each individual transaction. Because the math has already confirmed everything, there is nothing to challenge. Option A is wrong — users verify nothing manually. Option C is wrong — Starknet posts to Ethereum regularly. Option D is wrong — Ethereum verification is not skipped, it is made faster by the proof.',
    },
    {
      question: 'A user on Starknet wants to withdraw funds to Ethereum. A user on Arbitrum (optimistic rollup) wants to do the same thing. Both initiate withdrawals at 9am on Monday. What is the realistic difference in when each receives their funds on Ethereum?',
      options: [
        'A. No difference — both complete within the same day',
        'B. Starknet: hours (next proof submission). Arbitrum: 7 days minimum due to the challenge window',
        'C. Starknet: 7 days. Arbitrum: hours',
        'D. Both take exactly 7 days — all Layer 2 withdrawals use the same security period',
      ],
      correct: 1,
      hint: 'Match each network to its security model. Which one uses a challenge window, and which one uses a mathematical proof?',
      explanation: 'B is correct. Starknet uses validity proofs — the next proof submission to Ethereum finalises the withdrawal, typically within hours. Arbitrum uses the optimistic model — a 7-day challenge window must pass before the withdrawal reaches Ethereum. This is a real, practical difference between the two approaches that affects how DeFi users plan their capital movements.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A DeFi analytics report states: "Arbitrum processed $4.2 billion in transactions last week. Starknet processed $800 million. Arbitrum is clearly the superior Layer 2." You need to evaluate whether this conclusion follows from the data. Identify two pieces of information missing from this comparison that would be required to make a fair judgement, and explain why each matters.',
      scoringCriteria: [
        'Identifies that transaction volume alone does not account for the different ages of the two networks — Arbitrum launched in 2021, Starknet reached full deployment later',
        'Identifies that the withdrawal model difference matters for certain use cases — optimistic rollup users may keep funds on Arbitrum longer to avoid the 7-day wait, inflating its on-chain volume',
        'States that "superior" requires defining superior for what purpose — high volume favours Arbitrum, fast finality and no withdrawal wait favours Starknet',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You have $8,000 in a DeFi lending position on an optimistic rollup Layer 2. The protocol you are using shows signs of a potential exploit — the token price has dropped 18% in two hours and on-chain activity is unusual. You want to move your funds to Ethereum mainnet immediately to be safe. Walk through what happens when you initiate a withdrawal and identify the specific risk this creates.',
      scoringCriteria: [
        'Correctly identifies that a withdrawal from an optimistic rollup starts a 7-day challenge window — the funds cannot arrive on Ethereum mainnet for 7 days',
        'Identifies the specific risk: if an exploit is underway, the funds remain on the Layer 2 for 7 more days during which the attack could progress',
        'Notes that third-party fast bridges exist that can move funds within minutes but introduce their own counterparty risk — this trade-off is correctly identified as the decision the user faces',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Your younger sibling is 16 and has just received £200 in birthday money. They want to try sending some to a friend using cryptocurrency but looked up Ethereum and saw the fees. They ask you: "What even is Starknet and why would I use it instead of just doing it on Ethereum?" Explain in three sentences using no technical jargon. Do not use the words "protocol", "rollup", "cryptographic", or "validity proof".',
      scoringCriteria: [
        'Explains that Ethereum is congested and expensive — correctly characterises the fee problem without using jargon',
        'Explains that Starknet is a separate network that is cheaper and faster but still uses Ethereum\'s security — the relationship between the two is correctly described in plain English',
        'Uses zero jargon from the prohibited list and remains accurate — the explanation could be understood by someone with no technical background',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMER L0.2 — What Is a Token's Economic Life? (Supply, Inflation, Dilution)
// TYPE A/B MIXED — Conceptual with required calculation layer
// Dominant concept: tokens have lifecycle economics. Locked tokens
// unlocking = inflation. Inflation dilutes your holdings if demand
// does not grow to absorb the new supply.
// ─────────────────────────────────────────────────────────────────────────────

export const PRIMER_L0_2 = {
  id: 'primer-l0-2-token-economic-life',
  title: 'What Is a Token\'s Economic Life? (Supply, Inflation, Dilution)',
  trackType: 'A/B',
  lessonNumber: 2,
  module: 'primer',

  explanation: `
In 2022, the Solana blockchain had a problem that confused a lot of people. Solana's staking rewards were generating new SOL tokens at a rate of about 8% per year — meaning 8% more SOL came into existence every year. Some holders were excited: "I'm earning 8% on my SOL just by holding it." Others were losing money in real terms even while earning those rewards.

How could you earn 8% and still lose money?

The answer is inflation. If the total number of tokens grows faster than the number of people who want to buy and hold them, the price per token drops. Earning 8% more tokens while each token is worth 20% less leaves you worse off than when you started. The Solana stakers who were actively staking earned the new tokens and roughly kept pace with inflation. The non-stakers — those who simply held SOL without staking — got diluted. More tokens existed, their slice of the pie shrank, and they received nothing extra to compensate.

This lesson is about understanding what actually happens to a token over its economic life, so that when you analyse any protocol in this track, you can spot whether the tokenomics work in your favour or against you.

---

THE PIE SLICE PROBLEM

Imagine a pizza cut into 100 slices. You own 10 of them — that is 10% of the pizza. The restaurant then cuts the pizza into 200 slices. Your 10 slices have not changed, but they now represent only 5% of the pizza. You own the same physical slices, but your share of the total has been halved.

Tokens work the same way. If 100 million tokens exist and you hold 1 million, you own 1% of the total supply. If 50 million new tokens are minted and added to circulation, you now hold 1 million out of 150 million — roughly 0.67% of the supply. Your slice of the pie just shrank. Nothing was taken from you, but the total pie grew while your piece stayed the same size.

This shrinking of your percentage ownership when new tokens enter circulation is called dilution.

---

NOT ALL TOKENS ARE IN YOUR HANDS YET

Every major cryptocurrency project starts with a total number of tokens already planned. But most of those tokens are not immediately available. Some are held by the founding team. Some by early investors. Some are set aside for future rewards. Almost none of it hits the market on day one.

The tokens that are actually available to buy and sell right now are called the circulating supply. The total number of tokens that will ever exist — including all the ones not yet released — is called the total supply.

For example: imagine a project creates 1 billion tokens. On launch day, only 100 million are in circulation. The other 900 million are locked up, to be released gradually over the next four years. Today's circulating supply is 100 million. The total supply is 1 billion.

Now: if someone tells you the project has a market cap of $50 million, they calculated that using the circulating supply (100 million tokens × $0.50 per token = $50 million). But what is the project really worth if all 1 billion tokens were in circulation at that same price? 1 billion × $0.50 = $500 million. That number — what the entire project would be worth if all tokens existed today — is called the Fully Diluted Valuation, or FDV.

A $50 million market cap with a $500 million FDV means 90% of the tokens have not entered circulation yet. That is 10× more supply coming. If demand does not grow by 10× to absorb all of that, the price per token will fall.

THE FORMULA:
FDV = current token price × total supply (all tokens, not just circulating)

If FDV is far larger than current market cap, the gap represents future dilution risk.

---

THE RELEASE SCHEDULE: VESTING

If those locked tokens were released all at once, the price would collapse immediately — too much supply hitting the market too fast. So projects release tokens gradually over time on a schedule. This release schedule is called vesting.

Here is a typical structure: investors who funded the project early get their tokens locked for 12 months after launch — this is called the cliff. After 12 months, tokens start releasing gradually — maybe 1/24th of their allocation per month for two years. By month 36 from launch, all investor tokens have been released.

Why does this matter to you? Because you can predict when large amounts of new tokens will enter circulation. If 200 million tokens are scheduled to unlock in a specific month, and the current daily trading volume is 5 million tokens, the market will need 40 days of average trading volume just to absorb one month's unlock. If buyers do not show up, the price will be under pressure.

Vesting schedules are publicly available in project documentation. Reading them is a fundamental skill for evaluating any protocol. You will do exactly this in Lab 3.

---

LOCKING TOKENS FOR POWER: VOTE-ESCROW

Some protocols take a different approach. Instead of simply giving token holders governance rights, they require holders to lock their tokens voluntarily in exchange for extra voting power. The longer you lock, the more power you get.

For example: lock your tokens for 4 years and receive 4× the voting power. Lock for 1 year and receive 1× voting power. You can unlock early, but you lose the voting power bonus.

This system encourages long-term commitment. If you lock your tokens for 4 years, you clearly believe in the project's future — you are willing to give up liquidity to prove it. And during those 4 years, your tokens are not for sale, which reduces sell pressure on the market.

Tokens locked this way are called vote-escrowed tokens, often written as ve-tokens. You will encounter this mechanism frequently in Lab 3 when we analyse Starknet protocol tokenomics.

---

THE NUMBERS YOU NEED TO KNOW EVERY TIME

Before you analyse any token in this track, you will need four numbers:

1. Circulating supply — tokens tradeable today
2. Total supply — all tokens including locked
3. FDV — what the whole project is worth at today's price (total supply × price)
4. Vesting schedule — when do locked tokens start flowing into circulation?

These four numbers tell you whether the price you see today reflects the full picture, or whether there is a flood of new supply waiting behind a locked door.
  `.trim(),

  keyTakeaway: 'A token\'s price is shaped by how much supply exists now versus how much is coming — FDV reveals the full dilution picture, and vesting schedules tell you when that future supply will hit the market.',

  visualPrompt: 'Three-part horizontal diagram. Part 1: a circle divided into two segments — a small bright segment labelled CIRCULATING SUPPLY (100M) and a large grey segment labelled LOCKED (900M). A price tag shows $0.50. Part 2: a bar chart showing monthly token unlock amounts over 36 months — a flat line for months 1-12 (cliff period), then a rising step from month 12 as vesting begins, with a spike annotation at month 24 labelled "Large unlock event." Part 3: two rows — ROW A (Demand grows with supply): token price stays flat. ROW B (Demand flat, supply grows): token price arrow points down. Clean diagram with labels outside, no text inside shapes.',
  visualType: 'static',
  visualUrl: 'token-supply-dilution-vesting',

  examples: [
    {
      contextTag: '[First-time token buyer evaluating a new project]',
      context: 'A 19-year-old is considering buying tokens in a new Starknet DeFi protocol. The project\'s website shows a market cap of $30 million and a token price of $0.30. He thinks the project looks undervalued compared to similar projects that are worth $300 million.',
      scenario: 'He reads the tokenomics documentation more carefully. Total supply: 1 billion tokens. Circulating supply: 100 million (10% of total). FDV at $0.30 per token = $300 million. The remaining 900 million tokens vest over 36 months — roughly 25 million new tokens per month entering circulation.',
      outcome: 'The project is not undervalued at $30 million — it is valued at $300 million on a fully diluted basis, exactly in line with the protocols he was comparing it to. He also calculates that 25 million new tokens enter circulation monthly, against a current daily volume of 2 million tokens. The monthly unlock is 12.5× the daily volume — significant supply pressure. He revises his assessment from "undervalued" to "fairly valued with meaningful dilution risk."',
    },
    {
      contextTag: '[Holder during a large vesting unlock]',
      context: 'A DeFi researcher holds 50,000 tokens of a Starknet protocol. Token price: $1.20. She bought them three months ago. The project\'s vesting schedule shows that the founding team\'s 12-month cliff expires this week — 120 million team tokens are about to become available.',
      scenario: 'The current circulating supply is 80 million tokens. The team\'s 120 million tokens unlocking this week will increase circulating supply by 150% in a single event. Daily trading volume is 3 million tokens. The market needs 40 days of full volume just to absorb the unlock if sellers start selling immediately.',
      outcome: 'Over the two weeks following the cliff, the token price falls from $1.20 to $0.74 — a 38% decline. The researcher had identified the unlock risk in advance and sold half her position at $1.18 before the cliff. She buys back at $0.76 two weeks later. Her position is larger in token count and similar in dollar value. Understanding the vesting schedule made the cliff predictable, not a surprise.',
    },
    {
      contextTag: '[Comparing two protocols on FDV alone]',
      context: 'Two Starknet lending protocols are compared side by side. Protocol A: token price $2.00, circulating supply 50 million, market cap $100 million, total supply 60 million, FDV $120 million. Protocol B: token price $0.50, circulating supply 20 million, market cap $10 million, total supply 500 million, FDV $250 million.',
      scenario: 'A new analyst sees Protocol B at $0.50 per token and thinks it is cheaper than Protocol A at $2.00 per token. She considers buying Protocol B because "it has room to go up."',
      outcome: 'Protocol A has an FDV of $120 million — 480 million more tokens could enter circulation, representing 8× the current supply. Protocol B has an FDV of $250 million — only 10 million more tokens are coming, a 20% increase. Protocol A is actually more expensive on a fully diluted basis, and Protocol B has far less dilution risk despite being "cheaper" per token. The per-token price is almost meaningless without knowing total supply.',
    },
  ],

  guidedPractice: [
    {
      question: 'A token has a price of $2.00. Circulating supply is 50 million tokens. Total supply is 400 million tokens. What is the Fully Diluted Valuation (FDV)?',
      options: [
        'A. $100 million (50M × $2.00)',
        'B. $800 million (400M × $2.00)',
        'C. $400 million (200M × $2.00, using the average of circulating and total)',
        'D. $2 million (dividing the price by the total supply)',
      ],
      correct: 1,
      hint: 'FDV = current price × total supply (all tokens, including locked ones).',
      explanation: 'B is correct. FDV = $2.00 × 400,000,000 = $800 million. This tells you what the project would be valued at if all 400 million tokens existed in circulation today at the current price. Option A calculates the current market cap using only circulating supply — a different and smaller number. Options C and D use incorrect formulas.',
    },
    {
      question: 'A project launches with 200 million total tokens. On day one, 20 million are in circulation. The remaining 180 million vest over 3 years. If demand stays flat (price stays at $1.00 per token), what happens to the value of your 1 million tokens over those 3 years?',
      options: [
        'A. Your tokens stay worth $1 million — price is guaranteed to stay stable',
        'B. Your tokens increase in value because you hold a larger percentage of the supply over time',
        'C. Your tokens decrease in value as new supply enters circulation and dilutes your percentage ownership — if price falls proportionally, 1M tokens in a 200M pool is worth less than 1M in a 20M pool',
        'D. Nothing changes — the number of tokens you hold does not change, so your value does not change',
      ],
      correct: 2,
      hint: 'Think about the pizza slice analogy. If the pizza is cut into more slices and you keep the same number, what happens to your share?',
      explanation: 'C is correct. You start holding 1M out of 20M circulating = 5% of the supply. After full vesting, you hold 1M out of 200M = 0.5% of the supply. If demand stays flat and the total value of the project stays the same, your 0.5% share is worth 10× less than your 5% share was. The number of tokens you hold did not change, but their purchasing power did. Option D ignores how dilution works.',
    },
    {
      question: 'A project\'s token vesting schedule shows a 12-month cliff for team tokens, followed by 24 months of linear vesting. If the team holds 100 million tokens, how many tokens enter circulation each month after the cliff?',
      options: [
        'A. 100 million all at once on month 12',
        'B. 8.33 million per month for 12 months after the cliff',
        'C. 4.17 million per month for 24 months after the cliff',
        'D. The team cannot sell their tokens after a cliff',
      ],
      correct: 2,
      hint: 'Linear vesting means the tokens are released in equal amounts over the vesting period. 100 million tokens spread equally over 24 months = how many per month?',
      explanation: 'C is correct. 100 million ÷ 24 months = 4.17 million tokens per month. The cliff means nothing is released for the first 12 months. After month 12, linear vesting begins — equal amounts each month for the next 24 months. Option A describes an instant cliff-release (cliff without vesting), which is not how this structure works. Option B uses 12 months instead of 24.',
    },
    {
      question: 'You are comparing two tokens. Token X: $5.00 price, 10 million circulating, 12 million total supply. Token Y: $0.20 price, 50 million circulating, 2 billion total supply. Which has the larger FDV?',
      options: [
        'A. Token X — it has a higher price per token',
        'B. Token Y — it has more total supply and its FDV is $400 million vs Token X\'s $60 million',
        'C. They are equal — price differences cancel out the supply differences',
        'D. Token X — because its market cap of $50 million is larger than Token Y\'s $10 million market cap',
      ],
      correct: 1,
      hint: 'Calculate FDV for each: price × total supply. Token X = $5 × 12M = ? Token Y = $0.20 × 2,000M = ?',
      explanation: 'B is correct. Token X FDV = $5.00 × 12,000,000 = $60 million. Token Y FDV = $0.20 × 2,000,000,000 = $400 million. Token Y looks cheap at $0.20 per token but has 40× more supply coming. Its FDV is nearly 7× larger than Token X. This is exactly why price per token is not a useful comparison — you must look at FDV to understand the true scale of each project.',
    },
    {
      question: 'A project has 500 million tokens unlocking this month. Current daily trading volume is 5 million tokens. The current price is $0.80. If sellers sell at the average daily volume rate, roughly how many days would it take to absorb the full unlock — and what does this tell you about near-term price risk?',
      options: [
        'A. 10 days — manageable, limited price impact expected',
        'B. 100 days — the monthly unlock is 20× daily volume, creating sustained sell pressure that could depress price for months',
        'C. 1 day — token markets always immediately absorb new supply',
        'D. 500 days — every token takes one day to sell regardless of market conditions',
      ],
      correct: 1,
      hint: 'Divide total unlock (500M) by daily volume (5M) to get the number of days required at current pace. Then think about what sustained selling pressure means for price.',
      explanation: 'B is correct. 500M ÷ 5M per day = 100 days of sell pressure at the current trading pace. This does not mean price will fall for exactly 100 days — but it signals that there is substantially more sell pressure entering the market than the current daily volume can absorb quickly. Buyers would need to increase dramatically to offset this. This is the key calculation you make when evaluating vesting schedule risk for any protocol.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You are evaluating a Starknet DeFi protocol token before deciding whether to include it in a research report. Here is the data: Token price: $1.40. Circulating supply: 80 million. Total supply: 600 million. Team allocation: 150 million tokens (25%), currently in the last 6 months of a 24-month linear vest. Current daily trading volume: 4 million tokens. Calculate: (1) the current market cap, (2) the FDV, (3) how many team tokens are released per month for the remaining 6 months, (4) how many days of trading volume each monthly team unlock represents. State whether this creates material dilution risk and why.',
      scoringCriteria: [
        'Market cap correctly calculated: 80M × $1.40 = $112 million',
        'FDV correctly calculated: 600M × $1.40 = $840 million',
        'Monthly team unlock correctly calculated: 150M total team tokens ÷ 24 months = 6.25M per month',
        'Days of volume per unlock: 6.25M ÷ 4M daily volume = 1.56 days — correctly identified as low risk because the unlock is absorbed in under 2 days of normal trading',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A friend messages you: "I just bought 10,000 tokens of a new Starknet protocol at $0.50 each. The market cap is only $5 million — this thing could 100× easily." You look up the tokenomics: total supply is 1 billion tokens, only 10 million are currently circulating, and the remaining 990 million vest over 48 months starting in 3 months. Identify the three specific risks your friend has not considered, and calculate what the token price would need to be for the FDV to reach 100× the current market cap.',
      scoringCriteria: [
        'Risk 1: Current market cap of $5M uses only 1% of total supply — FDV is already $500M (1B × $0.50), not $5M. The project is not small.',
        'Risk 2: 990 million tokens begin vesting in 3 months — a 99× increase in circulating supply. Without proportional demand growth, price will be under severe pressure.',
        'Risk 3: 100× market cap = $500M market cap target, which requires FDV of $50 billion at full dilution — the calculation correctly identifies this as requiring the project to be valued at $50 per token fully diluted.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-sentence explanation of what FDV means for someone who has never heard of it but understands how a company\'s stock market value works. Your explanation must use an analogy from traditional finance and must not use the words "token", "blockchain", or "crypto".',
      scoringCriteria: [
        'Correctly maps FDV to an equivalent concept in traditional finance — for example, fully diluted market cap for a company with unvested employee stock options or outstanding convertible bonds',
        'Accurately conveys that FDV represents the total project value if all planned units of ownership were in circulation today — not just the current tradeable portion',
        'Uses zero prohibited words and remains accurate to the FDV definition',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMER L0.3 — What Does a Developer Actually Do? (A Non-Coder's Workflow Map)
// TYPE C — Procedural / Workflow-First
// Dominant concept: you don't need to write code to evaluate developer
// tooling. You need to understand what developers do and why each tool
// exists in the pipeline.
// ─────────────────────────────────────────────────────────────────────────────

export const PRIMER_L0_3 = {
  id: 'primer-l0-3-developer-workflow',
  title: 'What Does a Developer Actually Do? (A Non-Coder\'s Workflow Map)',
  trackType: 'C',
  lessonNumber: 3,
  module: 'primer',

  explanation: `
You are about to evaluate developer tools for Starknet — Scarb, Cairo, Starknet Foundry, Starkli, and the Starkzap SDK. You will not write a single line of code in this track. But you cannot evaluate something you do not understand at all.

Here is what you actually need to know: not how to use the tools, but what job each tool does in the sequence. A developer building on Starknet goes through six steps every time. Each step has one job. Each step has one tool. When a tool is missing, slow, or confusing, that specific step breaks — and that is what creates "developer onboarding friction," the thing you will be measuring in Lab 4.

The six-step pipeline is what you are learning in this lesson. You will use this map every time you assess a developer tool.

---

LAYER 1 — WHAT YOU ARE BUILDING TOWARD

By the end of this lesson, you will be able to look at any developer tool in the Starknet ecosystem and immediately answer three questions:

1. Which step of the pipeline does this tool serve?
2. What breaks if this tool is missing or poor quality?
3. What does its adoption level tell you about the ecosystem's maturity?

That is the deliverable. Not code. A mental map that makes every tool evaluation in Lab 4 fast and grounded.

---

LAYER 2 — THE SIX STEPS (THE PIPELINE)

Think of building a DeFi protocol like building a house. You need architectural plans, raw materials, a builder, safety inspections, a final build crew, and then someone to connect the house to roads and utilities so people can actually reach it. Skip any of those, and the house either does not get built or no one can use it.

Developer tooling works the same way. Here are the six steps, in order:

STEP 1 — INSTALL THE BUILD TOOL
What happens: The developer sets up the tool that will manage the entire project — installing it, configuring it, and downloading any libraries the project depends on.
What it produces: A working project environment. Nothing can be built without this.
What breaks if skipped: Nothing else in the pipeline can start.
Starknet tool: Scarb — Cairo's package manager and build environment.
Analogy: This is like setting up your workspace before any work begins — getting a desk, plugging in your computer, installing the right software.

STEP 2 — WRITE THE SOURCE CODE
What happens: The developer writes the actual instructions that define what the protocol does — what it accepts, what it calculates, what it outputs, what rules it enforces.
What it produces: Human-readable code files (source code).
What breaks if this step is poor: The logic is wrong. The protocol does the wrong thing — allows unauthorised withdrawals, calculates fees incorrectly, or has vulnerabilities that attackers can exploit.
Starknet tool: Cairo — the programming language all Starknet contracts are written in.
Analogy: This is writing the architectural plans for the house. The plans must be correct — every structural decision happens here.

STEP 3 — COMPILE
What happens: The developer runs a process that translates their human-readable code into a format the Starknet network can actually execute. Computers do not read English-like code — they need specific machine instructions. Compilation is that translation.
What it produces: Machine-executable files (Sierra and CASM on Starknet).
What breaks if this step fails: The code cannot be deployed. Compilation also catches certain types of errors before real money is at risk — if the translation fails, the developer knows something is wrong before deploying to a live network.
Starknet tool: Scarb (also handles compilation — it manages the translation process as part of step 1's environment).
Analogy: This is like translating architectural plans from English into a technical construction specification that builders can actually follow.

STEP 4 — WRITE TESTS
What happens: Before deploying code that will hold real user funds, the developer writes a second set of code — test code — that checks whether the main code behaves correctly. Tests check specific scenarios: "If a user tries to withdraw more than they deposited, does the contract reject it? If the price oracle gives a wrong price, does the contract handle it correctly?"
What it produces: A test file that describes what the correct behaviour should be in every scenario.
What breaks if skipped: Bugs go undetected until they are deployed with real money at stake. Most DeFi exploits happen because edge cases were not tested.
Starknet tool: Starknet Foundry (also called snforge) — Starknet's testing framework.
Analogy: This is like commissioning an independent structural engineer to check whether the architectural plans will produce a building that does not collapse.

STEP 5 — RUN THE TESTS
What happens: The developer executes the test code against the main code. Each test either passes (the code behaved correctly) or fails (the code did something wrong). Failing tests must be investigated and fixed before moving forward.
What it produces: A test results report — green ticks for passing tests, red failures for broken behaviour.
What breaks if skipped: Deploying untested code is like building a bridge and skipping the safety load tests. You will only discover the problem when real weight is applied.
Starknet tool: Starknet Foundry / snforge runs the tests in a simulated environment.
Analogy: The structural engineer runs stress tests on the plans. If anything fails, go back to step 2 and fix it.

STEP 6 — DEPLOY
What happens: The developer publishes the compiled, tested code to the Starknet network. Once deployed, the code is permanent — it cannot be edited. It lives at a specific address on the blockchain and anyone in the world can interact with it.
What it produces: A live smart contract at a specific address on Starknet (or first on a test network called Sepolia, to check everything works before going live with real funds).
What breaks if this step has friction: Developers get stuck at the finish line. Poor deployment tools cause failed deployments, incorrect configurations, or contracts deployed to the wrong network.
Starknet tool: Starkli — the command-line tool for deploying Cairo contracts to Starknet.
Analogy: This is getting the building permit, the final inspection, and physically opening the building to the public.

CONNECTING THE HOUSE TO THE CITY: THE SDK

There is a seventh element that is not a step in building the contract — it is what connects the contract to real users. A deployed contract sitting at a Starknet address cannot be used by normal people unless a website or app provides a way to interact with it. The bridge between a contract and its users is the SDK.

Starknet tool: Starkzap SDK — a set of pre-built functions that frontend developers (the people who build apps and websites) use to communicate with deployed contracts, handle wallets, execute swaps, manage fees, and build user interfaces on top of Starknet contracts.

Without the SDK, a contract is a locked room with no door handle. The SDK installs the door handle.

---

LAYER 3 — THE CONSTRAINT

This is called a development pipeline. The constraint is sequencing: each step depends on the previous one being complete and correct. You cannot compile (step 3) without code (step 2). You cannot meaningfully test (steps 4–5) without something that compiles. You cannot deploy (step 6) without passing tests. Skipping any step does not save time — it creates a failure that surfaces later, usually after real money is involved.

---

LAYER 4 — WHERE THIS SITS IN YOUR TRACK

This pipeline map is a prerequisite for Lab 4, where you will evaluate each of these tools from an ecosystem analyst's perspective. You will not be asked to use any of them. You will be asked questions like: "Starknet Foundry has 800 GitHub stars. Ethereum's equivalent has 8,000. What does this gap tell you about the maturity of Starknet's testing ecosystem?" To answer that, you need to know that Starknet Foundry serves step 4 and 5 — and that a weak testing framework means more bugs reach deployment.

That is the analysis. This lesson gives you the foundation to do it.
  `.trim(),

  keyTakeaway: 'A developer\'s workflow follows six steps — install, write, compile, test, run tests, deploy — and each step has one dedicated Starknet tool; understanding which step each tool serves tells you what breaks when that tool is weak.',

  visualPrompt: 'A horizontal pipeline diagram with six numbered boxes connected by right-pointing arrows. Box 1: INSTALL — icon of a toolbox, label "Scarb". Box 2: WRITE CODE — icon of a document with lines, label "Cairo". Box 3: COMPILE — icon of two documents with a conversion arrow, label "Scarb". Box 4: WRITE TESTS — icon of a checklist, label "Starknet Foundry". Box 5: RUN TESTS — icon of a tick/cross result screen, label "snforge". Box 6: DEPLOY — icon of a rocket, label "Starkli". Then a separate box below the pipeline labelled SDK with a two-headed arrow pointing at Box 6 and to a person icon labelled USERS, tool label "Starkzap SDK". Each box uses a distinct colour. Pipeline flows strictly left to right — the sequential dependency is visually obvious.',
  visualType: 'static',
  visualUrl: 'developer-pipeline-starknet-tools',

  examples: [
    {
      contextTag: '[Ecosystem analyst assessing developer onboarding]',
      context: 'An analyst is writing a report on Starknet developer onboarding friction. A survey of 45 developers who tried to build on Starknet shows that 34% abandoned the process before completing their first deployment.',
      scenario: 'The analyst uses the six-step pipeline to classify the drop-off: Step 1 (Scarb installation): 4% abandoned — they could not get the environment set up. Step 3 (Compilation): 8% abandoned — their code compiled successfully on one machine but not another due to version conflicts. Steps 4–5 (Testing): 12% abandoned — they could not figure out how to write tests in Starknet Foundry because documentation was incomplete. Step 6 (Deployment): 10% abandoned — Starkli deployment commands failed with unclear error messages.',
      outcome: 'The report identifies the testing step (steps 4–5) as the largest friction point — 12% of developers dropped off at Starknet Foundry. The analyst recommends: the Foundation prioritise Starknet Foundry documentation improvement above all other tooling initiatives. Without this, 12% of interested developers never complete a deployment.',
    },
    {
      contextTag: '[Developer skips testing, consequences materialise]',
      context: 'A team of two developers builds a Starknet lending protocol in 6 weeks. Feeling confident in their code, they skip formal testing (steps 4–5) and deploy directly to mainnet.',
      scenario: 'The protocol launches with $200,000 in user deposits on day one. On day three, an attacker discovers an edge case in the borrowing logic — a scenario the developers had never tested. By exploiting the untested path, the attacker drains $147,000 from the protocol in a single transaction. The transaction is mathematically valid; the STARK proof confirms it. There is no recourse.',
      outcome: 'The exploit was not detectable without running the specific edge case through a test. The code did exactly what the developers wrote — they just wrote something that allowed the edge case. This is the failure mode of skipping steps 4–5. The $147,000 loss is the cost of treating testing as optional.',
    },
    {
      contextTag: '[Non-technical founder evaluating SDK quality]',
      context: 'A startup founder — not a developer — is deciding whether to build her DeFi product on Starknet or on Ethereum. She cannot evaluate the code directly, but she wants to assess whether building on Starknet will be fast or slow.',
      scenario: 'Her technical co-founder shows her two data points. Starkzap SDK: a developer can execute a gasless swap in 3 lines of code, total setup time under 30 minutes to first working transaction. Ethereum equivalent (ethers.js + custom paymaster): same functionality requires a custom paymaster contract, 4 library integrations, and approximately 2–3 days of setup for a developer who already knows the stack.',
      outcome: 'The founder concludes: building on Starknet via Starkzap reduces their time-to-MVP by approximately 2–3 developer days on the frontend alone. She does not understand what the SDK code looks like. She understands what it does, what it connects (the deployed contract to the user), and how its quality translates into business impact (faster product, lower dev cost). This is exactly what ecosystem analysis looks like from a non-coder perspective.',
    },
  ],

  guidedPractice: [
    {
      question: 'A developer has finished writing their Cairo contract code. What is the next step in the pipeline before they can test it?',
      options: [
        'A. Deploy it to Starknet immediately so they can test it with real transactions',
        'B. Compile it — translate the human-readable Cairo code into machine-executable instructions that Starknet can run',
        'C. Write the SDK integration so users can interact with it',
        'D. Submit it to an auditing firm for review',
      ],
      correct: 1,
      hint: 'Think about the pipeline order: install → write → ? → test → run tests → deploy. What must happen between writing and testing?',
      explanation: 'B is correct. The pipeline sequence is: write code (step 2), then compile (step 3), then write and run tests (steps 4–5). Compilation translates Cairo code into the machine format that the test environment can execute. Without compilation, there is nothing for the tests to run against. Option A skips steps 3–5 entirely. Option C (the SDK) comes after deployment. Option D (audit) is an external process that happens after deployment — not part of the build pipeline.',
    },
    {
      question: 'Starknet Foundry (snforge) has 850 GitHub stars. Ethereum Foundry — the equivalent tool for Ethereum development — has 7,400 GitHub stars. Which step of the developer pipeline does Starknet Foundry serve, and what does the star gap tell you?',
      options: [
        'A. Step 6 (deployment) — the gap means Starknet is harder to deploy to than Ethereum',
        'B. Steps 4–5 (writing and running tests) — the gap signals that Starknet\'s testing ecosystem is significantly less mature, which means fewer tutorials, fewer community answers to common problems, and more developers abandoning at this step',
        'C. Step 2 (writing code) — developers prefer Cairo to Solidity so fewer stars are needed',
        'D. Step 1 (install) — Starknet Foundry is newer so it has not accumulated stars yet, but quality is equal',
      ],
      correct: 1,
      hint: 'Match Starknet Foundry to its pipeline step first. Then think about what GitHub stars signal about a tool\'s community and ecosystem maturity.',
      explanation: 'B is correct. Starknet Foundry serves steps 4–5 — testing. A nearly 9× gap in GitHub stars means the Starknet testing community is much smaller. Fewer stars means fewer tutorials, fewer people answering questions in forums, fewer plugins and extensions, and less battle-tested reliability. For an ecosystem analyst, this signals a genuine friction point: developers who reach the testing step on Starknet find less help and guidance than they would find testing on Ethereum. Option D gives the tool a pass without evidence. Options A and C misidentify which step the tool serves.',
    },
    {
      question: 'A DeFi protocol on Starknet has been live for 8 months without any exploits. The team announces they are releasing a major upgrade that rewrites 60% of the contract logic. They plan to skip formal testing (steps 4–5) to save two weeks of development time. What is the specific risk this creates?',
      options: [
        'A. No risk — the contract has already proven itself over 8 months of live use',
        'B. The rewritten 60% of the code is untested. Bugs in that new code could be exploited. A prior 8-month clean record applies only to the original 40% of code that was not rewritten',
        'C. The only risk is reputational — users will distrust a protocol that skips testing',
        'D. Minimal risk — major exploits only happen to protocols in their first week of launch',
      ],
      correct: 1,
      hint: 'A clean track record applies to the code that was running. What happens when 60% of the code is replaced?',
      explanation: 'B is correct. The 8-month clean record is evidence that the original code had no exploits. It says nothing about the new code being written now. The 60% rewrite creates 60% new attack surface that has never been tested against edge cases. Option A incorrectly applies past performance to new, untested code. Option C understates the financial risk — reputational risk is secondary to the direct loss of user funds. Option D is false — major exploits happen at any age when untested code is deployed.',
    },
    {
      question: 'A startup wants to build a mobile DeFi app on Starknet. They have smart contract developers (who write and deploy Cairo contracts) and frontend developers (who build the mobile interface). Which tool connects the deployed contract to the mobile app\'s users?',
      options: [
        'A. Starkli — it handles the connection between the contract and user devices',
        'B. Scarb — it manages the package dependencies for the frontend app',
        'C. The Starkzap SDK — it provides pre-built functions for frontend developers to connect wallets, execute transactions, and interact with deployed contracts from a mobile interface',
        'D. Cairo — it can be run directly in a browser or mobile app to interact with contracts',
      ],
      correct: 2,
      hint: 'Which element in the pipeline sits between the deployed contract and the end user? Think about what the "door handle" analogy referred to.',
      explanation: 'C is correct. The Starkzap SDK is the bridge between a deployed Starknet contract and a frontend (web or mobile app). It provides functions that let frontend developers connect user wallets, submit transactions, read contract state, and handle fees — without needing to understand the underlying contract code. Starkli (option A) is the deployment tool — it does not run in a user\'s app. Scarb (option B) is the build tool for Cairo code, not frontend packages. Cairo (option D) does not run in a browser or mobile app.',
    },
    {
      question: 'An ecosystem report claims: "Starknet\'s developer tooling is mature and comparable to Ethereum\'s." You are evaluating this claim. Using the six-step pipeline, which two data points would most directly test whether this claim is accurate?',
      options: [
        'A. The number of Starknet protocols listed on DefiLlama, and the total Starknet TVL',
        'B. Starknet Foundry\'s GitHub stars compared to Ethereum Foundry, and the average time for a developer to go from zero to first deployed contract on Starknet vs Ethereum',
        'C. The price of the STRK token compared to ETH over the last 12 months',
        'D. The number of employees at StarkWare compared to the Ethereum Foundation',
      ],
      correct: 1,
      hint: 'A tooling maturity claim is about the tools in the pipeline. Which data points directly measure how those tools perform compared to Ethereum\'s?',
      explanation: 'B is correct. Starknet Foundry vs Ethereum Foundry GitHub stars measures community size and tooling maturity for the testing steps (steps 4–5). Time-to-first-deployment is an end-to-end measure of the entire pipeline — how long does it actually take a new developer to go through all six steps on each chain? These two data points directly evaluate the tooling claim. Option A measures ecosystem output (apps and value), not tooling quality. Option C measures token price, not developer experience. Option D measures company size, not developer workflow quality.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A developer survey collected data from 60 developers who attempted to build on Starknet for the first time. Results: 8 abandoned at Step 1 (Scarb installation — version conflicts with their OS). 3 abandoned at Step 2 (Cairo syntax too unfamiliar). 18 abandoned at Steps 4–5 (Starknet Foundry documentation too sparse — could not figure out how to write tests). 11 abandoned at Step 6 (Starkli deployment error messages were not clear enough to debug). 20 completed all six steps successfully. Calculate the completion rate. Identify which pipeline step creates the most friction. State one specific recommendation the Starknet Foundation should prioritise to improve the completion rate.',
      scoringCriteria: [
        'Completion rate correctly calculated: 20 out of 60 = 33.3%',
        'Steps 4–5 (Starknet Foundry) correctly identified as the largest friction point — 18 developers (30%) abandoned at this stage, more than any other',
        'Recommendation is specific to the identified friction point: prioritise Starknet Foundry documentation — specifically testing tutorials and common error explanations — not generic "improve tooling" language',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You are reviewing a grant application from a team building a new Starknet development tool. Their tool sits between Step 3 (compilation) and Step 4 (writing tests) — it automatically analyses compiled code and highlights common vulnerability patterns before a developer writes tests, reducing the burden on the testing step. The team is requesting $200,000 to build it. Assess two things: (1) Is this the right place in the pipeline to intervene — why or why not? (2) What happens to developers who skip this tool and proceed straight from compilation to testing without it?',
      scoringCriteria: [
        'Correctly identifies that intervening between steps 3 and 4 is valuable because it catches issues before they enter the testing step — developers who find issues here can fix them with less rework than finding them later',
        'Correctly identifies what happens without the tool: developers proceed to write tests blind — they test for scenarios they think of but may miss common vulnerability patterns that an automated analyser would catch. The missed patterns stay in the code until deployment or exploit.',
        'Does not claim the tool eliminates the need for testing — correctly frames it as a supplement that reduces testing burden, not a replacement for steps 4–5',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You are writing the "developer tooling" section of a Starknet ecosystem report for a non-technical VC audience. The section must explain: (1) what the six-step pipeline is, (2) where Starknet\'s tooling is strong, (3) where it has gaps. You have 150 words. Write the section. Use no jargon without definition. Do not use the words "compile", "CLI", "repository", or "framework" without first explaining what each means.',
      scoringCriteria: [
        'Explains the pipeline in plain language that a non-technical reader could follow — uses analogy or plain description rather than technical shorthand',
        'Identifies at least one specific Starknet tooling strength with evidence (e.g. Starkzap SDK reducing time-to-first-transaction) and at least one specific gap with evidence (e.g. Starknet Foundry community size vs Ethereum Foundry)',
        'Stays within 150 words and avoids undefined jargon — any technical term used is immediately explained in the same sentence',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMER MODULE META
// ─────────────────────────────────────────────────────────────────────────────

export const PRIMER_MODULE_META = {
  id: 'primer-module-before-you-begin',
  title: 'Before You Begin',
  track: 'starknet-ecosystem-deep-dive',
  level: 'junior' as const,
  unlockCondition: 'starknet-island-complete',
  unlocksLab: 'lab-01-protocol-landscape',
  lessonCount: 3,
  portfolioPush: false,
  buildTask: false,
  estimatedTime: '45–60 minutes total',
  description: 'Three mandatory micro-lessons that close the foundational knowledge gaps identified in the v2.2 audit. Covers Layer 2 mechanics, token supply economics, and developer pipeline structure. All three must be completed before Lab 1 unlocks.',
  lessons: [
    PRIMER_L0_1,
    PRIMER_L0_2,
    PRIMER_L0_3,
  ],
};
