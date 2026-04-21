// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// JUNIOR · LAB 1 — PROTOCOL LANDSCAPE · LESSONS 4–5 + LAB STRUCTURE
// Type classifications: L1.4 Type C · L1.5 Type A
// Learner: zero DeFi knowledge. Plain English first, always.

// ─────────────────────────────────────────────────────────────
// L1.4 — Analytics Tools: Dune, DefiLlama, Voyager, Starkscan
// TYPE C — Tool-first. Navigating the four tools IS the mechanism.
// Dominant concept: every ecosystem claim must be backed by verifiable
// on-chain data. This lesson teaches you to find and read that data.
// ─────────────────────────────────────────────────────────────

export const LAB1_LESSON_4 = {
  id: 'l1-4-analytics-tools',
  title: 'Analytics Tools: Dune, DefiLlama, Voyager, Starkscan',
  trackType: 'C',
  lessonNumber: 4,

  explanation: `
LAYER 1 — WHAT YOU ARE BUILDING TOWARD

By the end of this lesson, you can open any of four analytics tools, navigate to a Starknet protocol, and find specific data to answer the question you are investigating. You will know which tool to open for which question — and you will never again accept an unverified claim in a research report.

Important scope note: this lesson teaches you to read and navigate existing dashboards. Writing your own SQL queries is a Senior-level skill covered with full hands-on instruction in Lab 9. Today you learn to use what is already built.

LAYER 2 — THE FOUR TOOLS

TOOL 1: DEFILLAMA — defillama.com
What it shows: TVL, fee revenue, and protocol revenue for every DeFi protocol across every blockchain.

Navigate step by step:
1. Go to defillama.com/chain/Starknet
2. You see all Starknet protocols ranked by TVL — highest deposits at the top
3. Click any protocol name to open its detail page
4. On the detail page: TVL chart shows how deposits changed over time. "Fees" and "Revenue" tabs show income breakdown.
5. Use the time buttons (1D, 7D, 30D, 1Y) to change the period
6. The "Info" tab shows audit status, launch date, chains

Three numbers appear for each protocol:

TVL (Total Value Locked): dollar value of tokens currently deposited in this protocol's smart contracts — how much user money is inside right now.

Fees: what users paid to use this protocol — all trading fees, borrowing interest, or swap costs. A measure of total user spending.

Revenue: what the protocol kept from those fees. Revenue is always a subset of fees — the portion that goes to the protocol treasury or token holders. A protocol with high fees and zero revenue is giving all income to its users (liquidity providers). A protocol with high revenue is keeping a cut — this matters for token value analysis.

The constraint: DefiLlama shows TVL and revenue, not individual transactions or wallet activity. For users and transaction-level data, use Dune.

TOOL 2: DUNE ANALYTICS — dune.com/starknet
What it shows: community-built dashboards that query on-chain data. Every transaction on Starknet is recorded on its blockchain. Dune provides a way to query that raw data. Community analysts have already built hundreds of dashboards answering common questions.

Scope: you are reading existing dashboards, not writing queries. Writing queries is Lab 9.

Navigate step by step:
1. Go to dune.com/starknet — this opens the official Starknet community page
2. You see a list of dashboards: "STRK Staking Overview," "AVNU Volume," "Vesu Protocol Metrics," etc.
3. Click any dashboard to open it
4. Inside: each panel is one chart or table. Read the title and axis labels before the numbers.
5. Most dashboards show 30-day data by default. Look for a time filter at the top.
6. Numbers are often in raw units (STRK amounts, not USD). Check the axis label.

What Dune adds that DefiLlama cannot: unique wallets (users) and transaction counts. DefiLlama measures money. Dune measures activity and people.

TOOL 3: VOYAGER — voyager.online
What it shows: every individual transaction on Starknet, in real time. Every block, every contract, every wallet balance. The raw record of Starknet's entire history.

Navigate step by step:
1. Go to voyager.online
2. Home screen shows recent blocks and transactions in real time
3. To look up a wallet: paste the address into the search bar — see full transaction history and current balances
4. To look up a transaction: paste the transaction hash — see every detail: function called, inputs, outputs, fee paid, time processed
5. To check L1 finality: look for "L1 Accepted" status on a transaction page — this confirms Ethereum has verified the proof containing this transaction
6. To look up a contract: paste the contract address — see all interactions with it

The constraint: Voyager shows raw data. Function names and contract addresses require knowing what the protocol does to interpret. For known protocols (AVNU, Vesu), function names are readable.

TOOL 4: STARKSCAN — starkscan.co
What it shows: same underlying blockchain data as Voyager, but with better visual presentation, protocol labels already applied, and richer analytics.

Navigate step by step:
1. Go to starkscan.co
2. Home screen shows recent transactions with protocol labels: "AVNU — Swap", "Vesu — Deposit" — not raw function calls
3. Token transfer view: click "Transfers" to see all token movements sorted by value, token type, or time
4. Contract analytics: click any contract address to see interaction history, top callers, event logs
5. The "DEX" section shows aggregated trading volume across all Starknet DEXs

The difference from Voyager: Starkscan is more readable. Voyager is more complete. Analysts use Starkscan first (readability) and Voyager second (to verify specific raw values).

LAYER 3 — THE CONSTRAINT

This is called cross-tool data validation. The constraint: never report a single data point from a single source without checking it against at least one other source.

DefiLlama, Dune, Voyager, and Starkscan all read from the same underlying blockchain — but they calculate and present data differently. A TVL figure on DefiLlama uses their methodology. The same protocol's TVL on a Dune dashboard may differ slightly because the query uses different contract addresses or timing. Neither is wrong — they measure slightly different things. Cross-validation prevents you from treating one source as absolute truth.

LAYER 4 — WHERE THIS SITS IN THE TRACK

These four tools appear in every lab from here to Lab 9. DefiLlama is your first stop for TVL and revenue comparisons. Dune is your source for user counts and volume trends. Voyager is your ground truth for individual transaction verification. Starkscan is your quick-read interface for protocol activity.

The Lab 1 Build Task requires data from all four tools. Research tasks in Labs 6–9 require citing specific tool outputs as evidence. Start navigating now.
  `.trim(),

  keyTakeaway: `Four tools — DefiLlama (TVL and revenue), Dune (users and volume), Voyager (individual transactions), Starkscan (readable protocol activity) — provide the verifiable on-chain data that every ecosystem claim must be backed by.`,

  visualPrompt: `Four equal-sized panels in a 2×2 grid. Panel 1 (DefiLlama — green): protocol listing with TVL, Fees, Revenue columns labelled. Sub-label: "Overview and comparison." Panel 2 (Dune — orange): dashboard with line chart and table, cursor on a panel. Sub-label: "Users, volume trends." Panel 3 (Voyager — purple): transaction detail with "Accepted on L2 ✓" and "Accepted on L1 ✓" status. Sub-label: "Individual transaction verification." Panel 4 (Starkscan — blue): transfer list with labels "AVNU Swap", "Vesu Deposit". Sub-label: "Readable protocol activity." Decision tree at top: "What are you looking for?" with four branches to each panel.`,
  visualType: 'static',
  visualUrl: 'analytics-tools-navigation-guide',

  examples: [
    {
      contextTag: '[Analyst catching a misleading claim]',
      context: 'A crypto article states: "Ekubo TVL grew 40% last month — explosive user growth."',
      scenario: 'The analyst opens DefiLlama: TVL is up 40%. She opens a Dune dashboard for Ekubo daily active wallets: up only 3% over the same period. STRK price is up 35% over the period.',
      outcome: 'TVL grew because the dollar value of STRK deposits increased, not because significantly more users joined. 40% TVL on 35% price appreciation and 3% user growth is price appreciation, not explosive user growth. Three sources, one corrected claim. She cites all three.',
    },
    {
      contextTag: '[New analyst finding her first transaction]',
      context: 'A junior analyst has completed her first testnet swap using the Starkzap SDK. She has the transaction hash.',
      scenario: 'She navigates to sepolia.voyager.online and pastes the hash. The transaction page loads: "From" (her wallet), "To" (AVNU contract), status "Accepted on L2" with timestamp, "Accepted on L1: pending."',
      outcome: 'She can explain exactly what happened: sequencer processed it (L2 accepted), but STARK proof has not yet been submitted to Ethereum (L1 pending). Her USDC balance is updated. The transaction is almost certainly final — but the mathematical proof to Ethereum is still being built. She verified this herself, not taking anyone\'s word.',
    },
    {
      contextTag: '[Comparing TVL and revenue to identify business model]',
      context: 'Two Starknet protocols on DefiLlama. Protocol A: $80M TVL, $120K monthly fees, $0 revenue. Protocol B: $30M TVL, $45K monthly fees, $22.5K revenue.',
      scenario: 'Protocol A has fees but no revenue — all fees go to liquidity providers. Protocol B keeps 50% of fees as revenue.',
      outcome: 'Protocol A is depositor-first — all income goes to users. This attracts TVL but builds no treasury. If incentives end, what keeps users? Protocol B has a sustainable business model — fees flow to the protocol. For token holders, Protocol B has value accrual. The TVL comparison made Protocol A look dominant. The revenue analysis reveals Protocol B has the stronger long-term model. She uses both.',
    },
  ],

  guidedPractice: [
    {
      question: 'You want to find how many unique wallets interacted with Vesu in the past 30 days. Which tool do you open first?',
      options: [
        'A. DefiLlama — shows all protocol metrics including user counts',
        'B. Dune Analytics — has community dashboards tracking unique wallet activity over time',
        'C. Voyager — contains every transaction so you can count wallets manually',
        'D. Starkscan — shows top callers for any contract',
      ],
      correct: 1,
      hint: 'Which tool is the source for user counts and activity metrics, with pre-built dashboards already answering this question?',
      explanation: 'B is correct. Dune is the primary tool for user counts and volume trends — community dashboards already track unique wallets by protocol. DefiLlama (A) measures TVL and revenue, not user counts. Voyager (C) has the raw data but counting unique wallets manually from individual transactions requires writing a SQL query — Lab 9 content. Starkscan (D) shows top callers but is not the best tool for comprehensive unique wallet counts over time.',
    },
    {
      question: 'DefiLlama shows Protocol X: $50M TVL, $180,000 monthly fees, $0 monthly revenue. What does $0 revenue tell you?',
      options: [
        'A. The protocol is not yet live',
        'B. All fee income goes to liquidity providers or depositors — the protocol keeps nothing for itself',
        'C. A bug is preventing revenue from being recorded',
        'D. The protocol is unprofitable and will shut down',
      ],
      correct: 1,
      hint: 'DefiLlama defines Revenue as the portion of fees the protocol keeps. If fees = $180K but revenue = $0, where is that $180K going?',
      explanation: 'B is correct. Revenue = the protocol\'s cut of fees. $0 revenue means the entire $180,000 in fees goes to liquidity providers or depositors. This is a design choice, not a failure. It attracts liquidity (users earn more) but builds no protocol treasury. Not a bug, not a sign of failure — a deliberate "depositor-first" model.',
    },
    {
      question: 'You look up a transaction on Voyager and see: "Accepted on L2: Yes. Accepted on L1: No." What does this mean?',
      options: [
        'A. The transaction failed — "Not accepted on L1" means rejection',
        'B. The sequencer processed it (soft finality) but Ethereum has not yet verified the STARK proof. Balance is updated. L1 finality follows in a few hours.',
        'C. The transaction is stuck and needs manual intervention',
        'D. The transaction is final on Starknet but permanently excluded from Ethereum\'s record',
      ],
      correct: 1,
      hint: 'Recall the two stages: sequencer confirmation (L2) and Ethereum verification (L1). Is "not yet" the same as "rejected"?',
      explanation: 'B is correct. "Accepted on L2" = sequencer processed it, balance updated, included in the next proof batch. "Not yet accepted on L1" = the STARK proof containing this transaction is still being generated. This is the normal intermediate state — a few hours after L2 acceptance, L1 will follow automatically. Not failed, not stuck.',
    },
    {
      question: 'DefiLlama shows a protocol\'s TVL rose 75% over 30 days. A Dune dashboard shows unique daily wallets grew 7.5% over the same period. STRK price rose 65%. How should you characterise this growth?',
      options: [
        'A. Strong organic growth — 75% TVL proves mass user adoption',
        'B. Primarily price-driven — 65% STRK price increase explains most of the 75% TVL increase. 7.5% user growth confirms limited new user acquisition.',
        'C. Suspicious activity suggesting manipulation',
        'D. Irrelevant — user count is the only metric that matters',
      ],
      correct: 1,
      hint: 'If STRK rose 65% and TVL rose 75%, how much of that TVL increase came from existing deposits becoming worth more in dollar terms?',
      explanation: 'B is correct. A 65% STRK price rise would automatically cause approximately 65% of the TVL increase — existing deposits in STRK are simply worth more dollars. The remaining ~10 percentage points likely come from new deposits. The 7.5% user growth confirms this: a small number of additional users, not mass adoption. Report: "TVL growth was primarily price-driven" — cite both sources.',
    },
    {
      question: 'You want to verify a claim that "AVNU processed $5M in volume yesterday." Which approach is correct?',
      options: [
        'A. Only DefiLlama — it is the most authoritative source for all DeFi metrics',
        'B. Check Dune (AVNU volume dashboard) and Starkscan (DEX volume section). If both show approximately $5M, the claim is likely accurate. One source alone risks accepting a methodology error as ground truth.',
        'C. Only Voyager — raw transaction data is the only reliable source',
        'D. No verification needed — claims from established protocols are always accurate',
      ],
      correct: 1,
      hint: 'Why might two tools show different numbers for the same metric? How does cross-validation protect against this?',
      explanation: 'B is correct. Dune and Starkscan both track volume but use different queries and methodologies. Both showing $5M = corroborated claim. Significant divergence = investigate methodology difference (different time boundaries, failed transaction treatment, contract address filters). DefiLlama (A) measures TVL and revenue, not transaction volume. Voyager (C) has raw data but aggregating it manually for daily volume is impractical. Option D is never acceptable in research.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Open the Ecosystem Read simulator. Navigate to the TVL tab and find the top 5 Starknet protocols by TVL. For each of the top 5, record: (1) protocol name, (2) TVL figure, (3) 30-day TVL change %, (4) which of the seven ecosystem categories it belongs to. Then identify: which category dominates the top 5 by total TVL, and which category is entirely absent from the top 5.',
      scoringCriteria: [
        'Correctly identifies all 5 protocols from the simulator with TVL figures',
        'Correctly categorises each using the seven-category framework from L1.1',
        'Correctly identifies the dominant category by summing TVL, and the absent category from the top 5',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A claim states "Protocol X processed 50,000 transactions from 3,200 unique wallets in the past 7 days." Calculate transactions-per-wallet. Interpret whether this high ratio suggests a small number of heavy users or a large number of light users. State which is supported and what single follow-up data point would confirm it.',
      scoringCriteria: [
        'Correctly calculates: 50,000 ÷ 3,200 = 15.6 transactions per wallet per week',
        'Correctly interprets 15.6 as suggesting concentrated heavy usage: bots, liquidity managers, or professional traders — or a protocol designed for frequent interaction (DCA, automated strategies)',
        'States a specific follow-up: distribution of transactions across wallets — if 10% of wallets account for 80% of transactions, it confirms concentrated heavy usage',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A journalist writes: "Starknet has $800M TVL — that means users have $800M in profits locked inside these protocols." Correct this in two sentences for a financial news audience. State what TVL actually measures, contrast it with what was claimed, and use no blockchain jargon.',
      scoringCriteria: [
        'Correctly defines TVL as user deposits currently held inside the protocols — not profits',
        'Correctly contrasts: depositing $10,000 USDC into Vesu adds $10,000 to TVL regardless of whether the depositor is in profit or loss — TVL measures money currently in use, not returns earned',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L1.5 — Ecosystem Actors: Foundation, StarkWare, Ecosystem Funds
// TYPE A — Dominant concept: ecosystems have power structures.
// Understanding who controls what determines where risk concentrates.
// ─────────────────────────────────────────────────────────────

export const LAB1_LESSON_5 = {
  id: 'l1-5-ecosystem-actors',
  title: 'Ecosystem Actors: Foundation, StarkWare, Ecosystem Funds',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
In 2016, a hacker drained $60 million from The DAO — a smart contract on Ethereum holding $150 million of user funds. The community faced an urgent decision: let the hack stand, or rewrite the blockchain to return the funds. They chose to rewrite history. But who actually made that decision? A small group of core developers and large miners who together had enough influence to push through a controversial software change. The ecosystem that claimed to be governed by code alone turned out to have informal power concentrated in very few hands.

Power is always somewhere. In every ecosystem, someone controls the infrastructure, the treasury, and the rules. Understanding who holds that power tells you where real risk lives — not the risks written in whitepapers, but the risks that materialise when things go wrong.

ACTOR 1 — STARKWARE: THE BUILDER AND OPERATOR

StarkWare is the company that built Starknet. Founded in 2018 by cryptography researchers including Eli Ben-Sasson, StarkWare invented the STARK proof technology, wrote the initial code, and launched the network.

Today, StarkWare:
— Operates Starknet's sequencer (processes all transactions — covered in L1.2)
— Runs the prover service that generates STARK proofs for Ethereum
— Develops and maintains the core Starknet protocol

The critical power concentration: StarkWare can upgrade Starknet's core protocol contracts without a mandatory community vote. There is a timelock — a required waiting period before any upgrade takes effect. This gives the community time to react and exit if they disagree. But the upgrade decision belongs to StarkWare, not the community.

This is a documented centralisation risk. In March 2023, Arbitrum's centralised sequencer went offline for 78 minutes. All Arbitrum DeFi froze — no swaps, no repayments, no withdrawals. Funds were safe but inaccessible. Starknet carries this same risk while its sequencer remains centralised. StarkWare has publicly committed to decentralisation. The roadmap is real — but incomplete.

ACTOR 2 — THE STARKNET FOUNDATION: THE ECOSYSTEM STEWARD

The Starknet Foundation is a separate non-profit organisation. Its job is not to build the protocol — StarkWare does that. The Foundation supports ecosystem growth through grants, governance facilitation, and builder programs.

The Foundation controls a significant treasury — over $100 million in STRK tokens — for ecosystem development. It distributes this through two programs:

SEED Grants: $10,000–$150,000 for early-stage projects. Faster review. For teams with an idea and some evidence of ability but no shipped product yet.

Growth Grants: up to $1,000,000 for projects with demonstrated traction. More rigorous evaluation. For teams that have already shipped something and are scaling.

The Foundation also manages the SNIP process — Starknet Improvement Proposals. Anyone can propose a protocol change. It goes through community discussion, Snapshot vote (STRK holders vote, weighted by holdings), then implementation by StarkWare if approved. The Foundation facilitates this process — it does not control the outcome. And critically: the Foundation does not override StarkWare's technical authority.

ACTOR 3 — ECOSYSTEM VENTURE FUNDS

Several VC firms have invested in Starknet projects and hold STRK tokens from early investments. Notable active ecosystem investors include Geometry Ventures, Variant, and others.

Two reasons they matter:

First: STRK token unlocks. These funds hold tokens with vesting schedules (covered in Primer L0.2). Their unlock events create predictable supply additions — quantifiable supply pressure that you can monitor. Their token positions and release schedules are publicly visible.

Second: capital deployment. These funds actively invest in protocols building on Starknet. A fund that backed Starknet infrastructure is likely to back the next infrastructure-layer protocol. Tracking active funds tells you where capital will flow next.

ACTOR 4 — BUILDER PROGRAMS AND HACKATHONS

StarkWare and the Foundation run hackathons and accelerators. The Starknet Catalyst program is a structured accelerator for projects building on Starknet.

For ecosystem analysts: hackathon participation and accelerator cohort quality are leading indicators — a 6–12 month preview of what new protocols will launch. The project submitting a compelling hackathon entry today is often the protocol raising a Foundation grant or venture capital next year.

THE POWER MAP

StarkWare: sequencer + prover + protocol upgrades (with timelock). Centralisation risk being addressed.
Foundation: grants treasury + governance facilitation. Does not control the protocol.
Ecosystem VCs: STRK token holders + capital deployment. Unlock schedules create predictable supply events.
Builder programs: future protocol pipeline indicator.

For any protocol you analyse: ask who controls the upgrade keys. Is there a timelock? Is it a multisig? How many signers? These answers tell you how much counterparty risk a user accepts when they deposit funds.
  `.trim(),

  keyTakeaway: `The Starknet ecosystem has four key actor types — StarkWare (protocol operator), Foundation (ecosystem steward), ecosystem VCs (capital and tokens), and builder programs (pipeline indicator) — and knowing who controls what is the foundation of any protocol risk assessment.`,

  visualPrompt: `Four quadrants. Top-left (StarkWare — red border): server/key icon. Labels: Sequencer operator, Prover, Protocol upgrade control, yellow caution badge "Timelock, not vote-gated." Top-right (Foundation — blue border): treasury/ballot icon. Labels: Grants treasury $100M+, SNIP governance, Builder programs. Bottom-left (Ecosystem VCs — green border): briefcase/STRK icon. Labels: Token holders, Protocol investment, Vesting unlocks. Bottom-right (Builder Programs — orange border): hackathon trophy. Labels: 6–12 month pipeline, Catalyst accelerator. Centre: Starknet logo. Arrows from all four quadrants to centre. No text inside icons.`,
  visualType: 'static',
  visualUrl: 'starknet-ecosystem-power-map',

  examples: [
    {
      contextTag: '[Protocol assessing deployment risk]',
      context: 'A DeFi protocol team is deciding between Starknet and a competitor ZK rollup. Primary concern: can the network operator change the rules after we deploy?',
      scenario: 'They review Starknet\'s power structure. StarkWare can upgrade core contracts with a 7-day timelock but without a mandatory community vote. The competitor ZK rollup has a 2-day timelock, same single-operator model.',
      outcome: 'The team chooses Starknet: the 7-day timelock gives more reaction time if they need to migrate users. Their risk assessment was based on the power structure, not just the technology. A longer timelock is a real and meaningful protection difference.',
    },
    {
      contextTag: '[Analyst reading grant distribution as ecosystem signal]',
      context: 'The Foundation announces: $12M distributed across 32 projects in 12 months. 18 SEED grants, 14 Growth grants.',
      scenario: 'The analyst interprets: 14 Growth grants means 14 projects have demonstrated traction. 12 months ago the Foundation reported 4 Growth-stage grants. That is a 3.5× increase in traction-stage projects.',
      outcome: 'Her report states: "14 Growth grants signals that the ecosystem has at least 14 protocols achieving product-market fit — a meaningful maturity indicator." Grant distribution is an ecosystem growth signal, not just a spending number.',
    },
    {
      contextTag: '[VC token unlock creating supply pressure]',
      context: 'An investor note warns that a large Starknet ecosystem VC has 40 million STRK unlocking next month. Current STRK daily trading volume: 8 million per day.',
      scenario: 'The analyst calculates: 40M unlock ÷ 8M daily volume = 5 days of full sell pressure if the fund sells everything. The fund has said publicly they are long-term holders — but this is not a binding on-chain commitment.',
      outcome: 'She notes it in her report: "40M STRK unlock represents 5× daily trading volume — a material near-term supply event. The fund\'s stated long-term intent reduces but does not eliminate risk. Monitoring on-chain token flows the week following cliff expiry is recommended." She cannot predict what the fund will do. She can quantify the risk if they do sell.',
    },
  ],

  guidedPractice: [
    {
      question: 'StarkWare can upgrade core Starknet contracts without a community vote, but must wait for a timelock period first. What is the purpose of the timelock for the community?',
      options: [
        'A. Legal compliance only — no community action is possible during it',
        'B. The community can evaluate the proposed change and, if they strongly disagree, withdraw funds or migrate to another protocol before the upgrade takes effect',
        'C. StarkWare tests the upgrade internally — users have no relevant action',
        'D. The timelock blocks the upgrade unless 51% of STRK holders vote to approve',
      ],
      correct: 1,
      hint: 'What can you do with extra time when you disagree with an imminent decision you cannot stop?',
      explanation: 'B is correct. The timelock gives stakeholders — protocols, users, depositors — time to assess impact and potentially migrate if they disagree. It does not prevent the upgrade but prevents sudden changes with no notice. Option C is wrong — the timelock is for community reaction. Option D describes a vote-gated upgrade, which is not how Starknet\'s current system works.',
    },
    {
      question: 'The Starknet Foundation controls over $100M in STRK grants. What does it evaluate, and what does it NOT control?',
      options: [
        'A. The Foundation evaluates grants and controls the Starknet protocol — it can require StarkWare to implement any feature it funds',
        'B. The Foundation evaluates grant applications but does not control the protocol. StarkWare retains technical upgrade authority independently of Foundation approval.',
        'C. The Foundation only distributes grants — no evaluation role',
        'D. The Foundation controls protocol upgrades through the SNIP process and can block StarkWare changes',
      ],
      correct: 1,
      hint: 'Separate the Foundation\'s mandate (ecosystem support, grants) from the protocol operator\'s mandate (building and running the network).',
      explanation: 'B is correct. The Foundation\'s mandate is ecosystem support and grants. It does not control StarkWare or the core protocol. The SNIP governance process facilitates community proposals, but StarkWare retains the technical upgrade authority. Option A incorrectly gives the Foundation protocol control. Option D overstates the SNIP process\'s authority over StarkWare.',
    },
    {
      question: 'In March 2023, Arbitrum\'s centralised sequencer went offline for 78 minutes. What correctly describes the impact on Arbitrum users?',
      options: [
        'A. Users lost all funds — an outage means the blockchain lost its records',
        'B. Users could not submit new transactions, but funds and already-settled positions were safe — the outage froze activity without destroying records',
        'C. No practical effect — users used other Layer 2s as substitutes',
        'D. Only large positions were affected — small transactions bypass the sequencer',
      ],
      correct: 1,
      hint: 'What does the sequencer process? What happens to already-settled positions when new processing stops?',
      explanation: 'B is correct. The sequencer processes new incoming transactions. An outage means no new transactions are accepted. Already-settled transactions remain intact. Users with urgent active positions — like an approaching liquidation — could not act. Users with static deposits were safe but could not move anything. Option A confuses an outage with a hack. All transactions go through the sequencer regardless of size.',
    },
    {
      question: 'A VC fund holds 50M STRK unlocking next month. Current daily STRK trading volume is 6M tokens. How many trading days would it take to absorb full liquidation of the fund\'s position — and what does this tell you about near-term price risk?',
      options: [
        'A. 8.3 days — manageable, limited impact expected',
        'B. 8.3 days — this represents significant supply pressure. Selling 6M/day when 50M is available creates sustained downward pressure for over a week if the fund fully liquidates.',
        'C. 1 day — large sales are absorbed instantly by market makers',
        'D. 50 days — funds can only sell 1M tokens per day legally',
      ],
      correct: 1,
      hint: 'Divide 50M tokens by 6M daily volume. What happens to price when sustained selling equals the full daily volume capacity?',
      explanation: 'B is correct. 50M ÷ 6M = 8.3 days. If the fund sold at the full daily volume rate for 8.3 days, they would absorb the entire daily volume every single day. This level of concentrated selling would push the price down, reducing proceeds and potentially triggering cascading sells from other holders. This is why large unlock events are flagged — the math shows the potential supply pressure.',
    },
    {
      question: 'You are analysing a Starknet protocol. Upgrade key: 2-of-3 multisig, all three co-founders. No timelock. No audit. Rank these three findings by severity of risk to a depositor.',
      options: [
        'A. 1st: no audit. 2nd: no timelock. 3rd: co-founder multisig.',
        'B. 1st: no timelock. 2nd: co-founder multisig. 3rd: no audit.',
        'C. All three are equally serious.',
        'D. 1st: co-founder multisig. 2nd: no audit. 3rd: no timelock.',
      ],
      correct: 0,
      hint: 'Which risk creates an undetectable, immediate threat to funds — and which creates a detectable but fast-moving threat?',
      explanation: 'A is most defensible. No audit: undetected bugs can be exploited at any time without warning — the team may not know the vulnerability exists. No timelock: if the team acted maliciously, they could push a fund-draining upgrade immediately after a user deposits — zero reaction time. Co-founder multisig: some governance (2-of-3 required), but all from the same organisation is insufficient independence. Note: Option B is also defensible — reasonable analysts may rank the timelock absence first. The skill is justifying the ranking with specific reasoning, not memorising one answer.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol team assesses the risk from StarkWare\'s current control over the core Starknet protocol. They know: (1) StarkWare can upgrade with a 7-day timelock, (2) StarkWare has committed to decentralisation, (3) StarkWare\'s top-tier VCs would be damaged by a malicious upgrade. Evaluate whether this risk is acceptable for a protocol holding $5M of user funds — and state the one specific event that would most dramatically change this assessment in either direction.',
      scoringCriteria: [
        'Correctly identifies practical constraints on malicious action: VC relationships, legal exposure, reputational destruction, and the 7-day window where users could exit if given warning',
        'Correctly identifies the residual risk: commitments are voluntary, not enforced on-chain. A sudden corporate crisis, acquisition, or regulatory order could change the calculus rapidly.',
        'States a specific event changing the assessment: (a) sequencer decentralisation dramatically reduces risk, or (b) StarkWare acquisition by or legal order from a government entity dramatically increases it',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'The Foundation reports: $15M in grants over 12 months — 22 SEED grants averaging $180K each, and 9 Growth grants averaging $780K each. For an ecosystem report, interpret what these figures tell you about Starknet\'s current maturity stage — and state one thing this data cannot tell you.',
      scoringCriteria: [
        'Correctly identifies the 9 Growth grants as the most important signal: nine projects have achieved traction — the ecosystem has moved past "ideas only" stage',
        'Correctly notes 22 SEED vs 9 Growth is expected and healthy: most projects are early, with a smaller number proving out',
        'Correctly identifies what the data cannot tell you: grant distribution does not reveal whether funded projects succeeded — a $780K grant can still result in a failed protocol. Grant data shows Foundation confidence and pipeline, not guaranteed outcomes.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A sceptic posts: "StarkWare built Starknet — they control it forever. No amount of \'foundation\' or \'governance\' changes that." Write a two-sentence response. Be accurate about both the current reality (StarkWare does hold significant control) and the direction of travel — without dismissing the valid concern or overpromising on things that have not happened yet.',
      scoringCriteria: [
        'Accurately acknowledges the current reality: StarkWare operates the sequencer and holds upgrade authority with a timelock — this is a real and documented centralisation point, not a misconception',
        'Accurately represents direction of travel without overpromising: the sequencer decentralisation roadmap exists and progress is being made, but the sceptic\'s concern remains valid until decentralisation is actually achieved',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 1 — AGGREGATE SIMULATIONS
// ─────────────────────────────────────────────────────────────

export const LAB1_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: [
    'starkzap-ecosystem-read',
    'judgment-dataInterpret',
    'judgment-riskAssess',
    'judgment-communication',
  ],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 1 lessons. Tests ecosystem categorisation, infrastructure risk, protocol comparison, analytics navigation, and power structure analysis. No lesson labels. No hints.',
};

// ─────────────────────────────────────────────────────────────
// LAB 1 — BUILD TASK
// Platform-specified (Lab progression = 1 — no learner choice)
// ─────────────────────────────────────────────────────────────

export const LAB1_BUILD_TASK = {
  id: 'ecosystem-lab-1-build',
  title: 'Ecosystem Map — Protocol Landscape',
  labProgressionNumber: 1,
  selectionMode: 'platform-specified',
  type: 'research-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '45–60 minutes',
  simulator: 'starkzap-ecosystem-read',

  description: `
Using the Ecosystem Read simulator and DefiLlama, build a structured ecosystem map of Starknet.

For each of the seven protocol categories from L1.1, identify two Starknet protocols. For each:

1. One sentence describing what it does — plain English, no jargon without definition.
2. One key metric appropriate to its category:
   - DEX: daily trading volume (USD)
   - Lending: TVL and current supply APY
   - Oracle: number of protocols depending on it
   - Bridge: 30-day bridge volume (USD)
   - Gaming: daily active users (DAU)
   - Wallets: monthly active wallets
   - Developer Tools: GitHub stars
3. The data source for each metric (DefiLlama, Dune dashboard name, or Voyager).

Output: a structured markdown table with columns: Category | Protocol | Description | Key metric | Data source.

14 rows total (7 categories × 2 protocols). At least one metric cross-validated across two tools.
  `.trim(),

  outputType: 'written-document',
  outputFormat: 'markdown-table',
  verificationMethod: 'rubric',

  scoringCriteria: [
    'All 7 categories present with 2 protocols each — 14 rows total',
    'Each protocol description is plain English with no undefined jargon',
    'Each metric is category-appropriate (TVL for lending, volume for DEX, DAU for gaming)',
    'Each metric has a named data source — not "from the internet"',
    'At least one metric is verified by cross-checking two tools (noted in source column)',
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 1 — BOSS BATTLE
// ─────────────────────────────────────────────────────────────

export const LAB1_BOSS = {
  phase1: {
    id: 'ecosystem-lab-1-boss-phase1',
    title: 'Lab 1 Boss — Phase 1: Protocol Landscape Gauntlet',
    description: 'Unlimited attempts. Hints available. 8 tasks from pool of 20. Pass 80% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,
    taskPool: {
      totalTasks: 20,
      drawPerAttempt: 8,
      passMark: 0.80,
    },
  },

  phase2: {
    id: 'ecosystem-lab-1-boss-phase2',
    title: 'Lab 1 Boss — Phase 2: Ecosystem Certification',
    description: 'No hints. Portfolio push on 100% pass. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are producing a protocol landscape briefing for a team considering building their first DeFi product on Starknet.

TASK 1 — Ecosystem Overview (200 words)
Include: three largest categories by TVL with specific figures from DefiLlama, the single most important infrastructure risk for any protocol deploying on Starknet today, and one specific ecosystem gap representing an opportunity.

TASK 2 — Protocol Comparison: Ekubo vs Vesu
Compare on four dimensions: (1) user problem solved, (2) revenue mechanism, (3) primary user risk, (4) one metric to monitor weekly.
For each metric cited: record the current value and the source.

TASK 3 — Power Structure Risk Assessment (two paragraphs, plain English)
Cover StarkWare's current sequencer control and the timelock system for a non-technical user audience.
    `.trim(),

    scoringCriteria: [
      'Task 1: Three categories with specific TVL figures from DefiLlama — not estimated. Infrastructure risk specifically identified as sequencer centralisation. Gap is specific — named category or product type with evidence.',
      'Task 2: All four dimensions answered for both protocols. Revenue mechanisms accurate. Risks are protocol-specific. Metrics cited with current values and tool source.',
      'Task 3: Sequencer control explained accurately in plain English. Timelock explained as a reaction window. Honest about risk without creating alarm.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/junior/lab-01-protocol-landscape/',
      files: [
        {
          filename: 'ecosystem-landscape-briefing.md',
          type: 'narrative',
        },
      ],
      commitMessage: 'Passed Lab 1 Protocol Landscape — Junior Ecosystem Deep Dive',
      badgeEarned: 'Protocol Landscape Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

// ─────────────────────────────────────────────────────────────
// LAB 1 META
// ─────────────────────────────────────────────────────────────

export const LAB1_META = {
  id: 'ecosystem-junior-lab-1',
  title: 'Protocol Landscape',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'junior' as const,
  labNumber: 1,
  estimatedHours: 4,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Starknet Island complete · Primer Module complete',
  description: 'Seven ecosystem categories, three infrastructure components, four key protocols, four analytics tools, and four power structure actors. Foundation for all analysis in Labs 2–9.',
  nextLab: 'Lab 2 — STARK Technology and ZK Fundamentals',
};
