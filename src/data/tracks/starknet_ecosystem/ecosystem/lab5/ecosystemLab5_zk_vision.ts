// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// JUNIOR · LAB 5 — STARKNET'S ZK VISION AND ROADMAP
// 5 Lessons + Aggregate Sims + Build Task + Boss Battle
//
// Lesson type classification:
//   L5.1 — TYPE A: cause/effect, roadmap mechanics, no derivation
//   L5.2 — TYPE A: conceptual comparison (ZK use cases, privacy models)
//   L5.3 — TYPE A: four-dimension competitive framework, judgment
//   L5.4 — TYPE A: market behaviour, regulatory analysis, business model
//   L5.5 — TYPE A: thesis frameworks, falsifiability, judgment
//
// All five lessons are Type A — conceptual/narrative.
// Learner: zero DeFi knowledge. Plain English first, always.

// ─────────────────────────────────────────────────────────────
// L5.1 — Starknet Roadmap: Decentralisation, Volition, Recursive Proofs
// TYPE A — Dominant concept: three roadmap items will change
// Starknet's security model, cost structure, and throughput —
// and each introduces specific new trade-offs users must understand.
// ─────────────────────────────────────────────────────────────

export const LAB5_LESSON_1 = {
  id: 'l5-1-starknet-roadmap',
  title: 'Starknet Roadmap: Decentralisation, Volition, Recursive Proofs',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
In 2008, Toyota was the world's largest car manufacturer. They had a problem: as they scaled production globally, the cost of quality control became unsustainable. Their solution was not to hire more inspectors — it was to redesign the production architecture itself, using a system called the Toyota Production System, where defects were caught at each step rather than inspected out at the end. The change took years and involved architectural changes at every level of the company. But it was not optional if Toyota wanted to continue scaling.

Starknet faces a version of this problem. Its current architecture works well at current scale. But the decisions made at launch — centralised sequencer, full data on Ethereum, individual proof submission — create bottlenecks and costs that will limit what is possible at 10× or 100× the current transaction volume. The roadmap items in this lesson are Starknet's architectural redesign for scale.

ROADMAP ITEM 1 — SEQUENCER DECENTRALISATION

As covered in L1.2, Starknet's sequencer is currently operated by a single entity: StarkWare. Every transaction on Starknet passes through this one checkpoint. The risks: outage risk (one entity failing halts everything) and censorship risk (one entity controlling transaction inclusion).

The decentralisation roadmap moves the sequencer from one operator to many. Multiple sequencer nodes, operated by different parties, would take turns proposing and finalising transaction batches. This is similar to how Ethereum itself is secured: not by one validator, but by hundreds of thousands.

What changes for users when this happens:
— Censorship becomes practically impossible: no single operator can exclude transactions, because other operators would include them.
— Outage risk is dramatically reduced: no single point of failure means no single entity's downtime can halt all transactions.
— New complexity emerges: decentralised sequencers must coordinate, creating new consensus overhead and potentially slightly slower block production.

For ecosystem analysts: sequencer decentralisation is the single most important risk reduction event on Starknet's roadmap. Until it is live, the centralised sequencer risk (flagged in L1.5 and L1.2) remains the primary infrastructure concern. When it ships, that risk largely resolves.

ROADMAP ITEM 2 — VOLITION (PER-TRANSACTION DATA AVAILABILITY CHOICE)

Recall from L1.2: Starknet posts all transaction data to Ethereum (the DA layer). This provides maximum security — anyone can reconstruct Starknet's state from Ethereum alone. But posting to Ethereum is expensive, and this cost contributes to Starknet's transaction fees.

Data availability means: all the data needed to reconstruct Starknet's current state is publicly accessible. Today, Starknet posts full state diffs to Ethereum — expensive but maximally secure.

Volition changes this from a network-wide setting to a per-transaction user choice. When Volition is live, each transaction will offer two options:

Option 1 — Ethereum DA (ZK-Rollup mode): your transaction data is posted to Ethereum. Maximum security — your balance can always be proven from Ethereum's public records. Higher cost.

Option 2 — Off-chain DA (Validium mode): your transaction data is stored by an off-chain data availability committee (a group of designated parties who commit to storing the data). Significantly cheaper — data does not go on Ethereum. Lower security: if the off-chain committee goes offline or colludes to withhold data, your balance cannot be proven from Ethereum alone.

This is a fundamental architectural change: the security model becomes per-transaction rather than universal. A user can choose maximum security for their largest transactions and minimum cost for smaller, less critical operations.

What this means for ecosystem analysis: after Volition, protocols will need to decide — and communicate — which mode they use for their users. A lending protocol holding large collateralised positions should use Ethereum DA (maximum security). A gaming app processing thousands of small in-game moves might use off-chain DA (cost efficiency). Analysts will need to assess which mode each protocol runs in — because the risk profile is different.

ROADMAP ITEM 3 — RECURSIVE PROOF COMPOSITION

Currently, when Starknet finalises a batch of transactions, it submits one STARK proof to Ethereum. Ethereum verifies that one proof. The cost of verification is roughly fixed regardless of how many transactions were in the batch — meaning Starknet spreads the verification cost across all transactions in a batch.

In 2023, StarkWare achieved something significant: they proved a STARK proof using another STARK proof. Starknet verified its own verification. This is called recursive proof composition.

Here is why it matters: instead of submitting 10 separate proofs to Ethereum (10 × the verification cost), Starknet can generate a proof that those 10 proofs are all valid, then submit that one meta-proof to Ethereum. Ethereum verifies one proof — the cost of verifying 10 proofs has been compressed to the cost of verifying one.

The consequence: Starknet's transaction throughput ceiling increases dramatically, because the bottleneck (Ethereum verification cost) is amortised over exponentially more transactions.

With current proofs batching 10,000 transactions: verification cost per transaction = total verification cost ÷ 10,000. With recursive proofs allowing 100,000 transactions per meta-proof: verification cost per transaction = total verification cost ÷ 100,000. A 10× reduction in the per-transaction cost of Ethereum security.

For ecosystem analysis: recursive proofs are the mechanism that makes Starknet's scaling thesis mathematically credible. The cost of security does not grow linearly with the number of users — it grows logarithmically. This is what allows ZK rollups to eventually support mainstream-scale transaction volumes without the per-transaction fee becoming prohibitive.

THE THREE ROADMAP ITEMS TOGETHER

Decentralisation removes the censorship and outage risk from the sequencer. Volition gives users per-transaction control over the security-cost trade-off. Recursive proofs compress the cost of Ethereum verification, enabling dramatically higher throughput.

None of these are incremental improvements. Each is an architectural change with specific new trade-offs. An ecosystem analyst who tracks Starknet must monitor progress on all three — because they change the risk profile of every protocol deployed on Starknet.
  `.trim(),

  keyTakeaway: `Three roadmap items will reshape Starknet's architecture — sequencer decentralisation (removes the single-operator risk), Volition (per-transaction security-cost choice), and recursive proof composition (compresses verification cost enabling 10× throughput scaling) — each introduces specific new trade-offs that analysts must understand before they ship.`,

  visualPrompt: `Three vertical columns, each representing one roadmap item. Column 1 "Sequencer Decentralisation": shows current state (one node labelled StarkWare with caution badge) → future state (multiple nodes, distributed). Change label: "Censorship and outage risk removed." Column 2 "Volition": shows a transaction splitting into two paths — Ethereum DA path (shield icon, "higher cost, maximum security") and Off-chain DA path (speed icon, "lower cost, committee risk"). Change label: "Per-transaction security choice." Column 3 "Recursive Proofs": shows current state (10 proofs → Ethereum, 10× cost) → future state (10 proofs → 1 meta-proof → Ethereum, 1× cost). Change label: "10× throughput scaling." All three columns have a "Ships when?" question mark below, indicating these are roadmap items, not current features.`,
  visualType: 'static',
  visualUrl: 'starknet-roadmap-three-items',

  examples: [
    {
      contextTag: '[Analyst assessing protocol risk before decentralisation]',
      context: 'A Starknet lending protocol holds $45M in user deposits. An analyst is writing a risk section for a research report covering this protocol.',
      scenario: 'She notes: the sequencer is still centralised under StarkWare. In March 2023, Arbitrum\'s centralised sequencer went offline for 78 minutes — all positions on Arbitrum were frozen during that period, including lending health factors that could not be managed. Starknet faces the same structural risk.',
      outcome: 'Her report risk section states: "Sequencer centralisation risk is the primary infrastructure exposure for this protocol. An outage of comparable duration to the 2023 Arbitrum incident could prevent liquidations during a volatile price period, creating under-collateralised positions. This risk resolves when Starknet\'s sequencer decentralisation ships. Timeline: watch StarkWare blog and SNIP governance for progress. Rating: high risk, known roadmap mitigation."',
    },
    {
      contextTag: '[Volition choice for different protocol types]',
      context: 'Volition has shipped. Two Starknet protocols are deciding which DA mode to use for their users.',
      scenario: 'Protocol A (Vesu — lending, $50M TVL): chooses Ethereum DA. Rationale: users\' collateral must be provable at all times. If the off-chain DA committee went offline during a market crash, users could not prove their collateral existed — catastrophic for a lending protocol. Protocol B (Loot Survivor 2 — gaming, small transaction sizes): chooses off-chain DA. Rationale: each move is worth cents, not thousands of dollars. The cost saving from off-chain DA meaningfully reduces per-move fees, improving game economics. If the DA committee went offline briefly, the worst case is a temporary inability to prove historical game state — recoverable, not catastrophic.',
      outcome: 'Both protocols made rational DA mode choices for their risk profiles. For analysts: the correct question after Volition is not "which mode does Starknet use?" but "which mode does this specific protocol use for its users, and is that appropriate for the assets at stake?"',
    },
    {
      contextTag: '[Recursive proofs enabling cost reduction]',
      context: 'An analyst is calculating the cost trajectory for Starknet transactions as recursive proofs improve batch compression.',
      scenario: 'Current state: Ethereum verification cost per proof batch = $200. Average transactions per batch: 10,000. Per-transaction verification cost: $0.02. With recursive proofs at first iteration: 100,000 transactions per meta-proof. Per-transaction cost: $0.002 — a 10× reduction. With further recursive recursion (proving meta-proofs with meta-meta-proofs): 1,000,000 transactions per ultimate proof. Per-transaction cost: $0.0002.',
      outcome: 'At $0.0002 per transaction verification cost, Starknet can process 1 million transactions for $200 of Ethereum security fees. This makes ZK-proof security economically viable for applications that currently cannot afford on-chain security (micropayments, gaming, social apps). The analyst notes: "Recursive proofs are the mechanism that makes Starknet\'s mainstream-scale thesis mathematically credible. The security cost per user approaches zero as batch size approaches infinity."',
    },
  ],

  guidedPractice: [
    {
      question: 'What specific risk does sequencer decentralisation most directly address?',
      options: [
        'A. The risk that STARK proofs are mathematically flawed',
        'B. The risk that a single operator (StarkWare) going offline or choosing to censor transactions halts or compromises all Starknet activity',
        'C. The risk that Ethereum\'s gas costs make Starknet uneconomical',
        'D. The risk that Cairo developers leave the ecosystem',
      ],
      correct: 1,
      hint: 'What are the two specific risks created by having one entity operate the sequencer?',
      explanation: 'B is correct. Sequencer centralisation creates two risks: outage risk (one operator offline = all transactions freeze, as happened with Arbitrum\'s 78-minute outage) and censorship risk (one operator can exclude specific addresses). Decentralisation addresses both: no single operator can halt everything, and no single operator can censor indefinitely. Option A is about proof system correctness — unrelated to decentralisation. Option C is about Ethereum costs — addressed by recursive proofs, not sequencer decentralisation.',
    },
    {
      question: 'Volition gives users a per-transaction choice between Ethereum DA and off-chain DA. What is the specific security risk introduced by the off-chain DA option?',
      options: [
        'A. Off-chain DA is slower — transactions take longer to confirm',
        'B. If the off-chain DA committee goes offline or withholds data, users cannot prove their balance from Ethereum alone — making it impossible to withdraw or prove ownership of funds',
        'C. Off-chain DA requires users to pay in a different token',
        'D. Off-chain DA transactions cannot be included in STARK proofs',
      ],
      correct: 1,
      hint: 'Data availability means: your balance can be proven from the public record. What happens to proof if the data is off-chain and unavailable?',
      explanation: 'B is correct. The entire value of data availability is that anyone can prove state (balances, positions) from publicly accessible data. Off-chain DA moves the data from Ethereum (permanently public) to a committee (private, trusted). If that committee withholds or loses data, the proof chain breaks — you cannot independently verify your balance or prove ownership to a third party. This is the security trade-off for cost reduction. A lending protocol with $50M TVL should not use off-chain DA — the cost saving does not justify the risk of being unable to prove collateral during a dispute or DA failure.',
    },
    {
      question: 'Starknet currently batches 10,000 transactions per STARK proof submitted to Ethereum. Verification costs $200 per proof. With recursive proofs allowing 100,000 transactions per meta-proof, what is the new per-transaction verification cost?',
      options: [
        'A. $0.02 — unchanged from current',
        'B. $0.002 — the verification cost is spread across 10× more transactions',
        'C. $2.00 — recursive proofs are more expensive per transaction',
        'D. $0 — recursive proofs eliminate verification costs entirely',
      ],
      correct: 1,
      hint: 'Current cost per transaction: $200 ÷ 10,000 = $0.02. New cost: $200 ÷ 100,000 = ?',
      explanation: 'B is correct. $200 ÷ 100,000 = $0.002. The verification cost is fixed (one proof submitted to Ethereum costs $200 regardless of how many transactions it covers). By covering 10× more transactions in one meta-proof, the per-transaction cost falls by 10×. This is the scaling mechanism: as batch size grows through recursive composition, the per-transaction cost of Ethereum security approaches zero asymptotically. Option D is wrong — costs are not eliminated, just amortised across more transactions.',
    },
    {
      question: 'A lending protocol (TVL $40M) is deciding which Volition mode to use after it ships. Should they choose Ethereum DA or off-chain DA, and why?',
      options: [
        'A. Off-chain DA — it reduces costs for users, which is always the right priority',
        'B. Ethereum DA — the $40M TVL represents real user assets that must be provable at all times. The security premium of Ethereum DA is justified at this scale. Off-chain DA mode introduces the risk that users cannot prove their collateral if the committee fails.',
        'C. It does not matter — Volition is a frontend UX change with no security implications',
        'D. Off-chain DA — STARK proofs already guarantee security regardless of DA mode',
      ],
      correct: 1,
      hint: 'What is the worst case if the DA committee goes offline while a user has $40M in collateral that urgently needs to be proven for a liquidation?',
      explanation: 'B is correct. For a lending protocol holding $40M of collateral: the ability to prove balances at any moment is not optional — it is the security guarantee the users are relying on. A DA failure during a market crash could prevent liquidations of unhealthy positions, creating cascading insolvency risk. The cost savings from off-chain DA are not worth this exposure at $40M TVL. Option D incorrectly suggests STARK proofs provide DA security — proofs verify computation correctness, but the data being computed on must be available for the proof to be useful.',
    },
    {
      question: 'Which roadmap item most directly addresses Starknet\'s long-term throughput ceiling — its ability to process orders of magnitude more transactions as the ecosystem grows?',
      options: [
        'A. Sequencer decentralisation — more nodes means more transactions processed',
        'B. Volition — more users choose off-chain DA, reducing Ethereum congestion',
        'C. Recursive proof composition — compresses verification cost so batch sizes can grow without proportional cost increase, enabling exponential throughput scaling',
        'D. Cairo language improvements — faster code means faster transactions',
      ],
      correct: 2,
      hint: 'The throughput ceiling is the bottleneck of Ethereum verification cost. Which roadmap item specifically addresses the cost of verification per transaction?',
      explanation: 'C is correct. The fundamental throughput ceiling is: each proof submission to Ethereum costs a fixed amount. The more transactions per proof, the lower the per-transaction cost. Recursive proof composition allows exponentially more transactions per ultimate proof submission — meaning the verification cost per transaction decreases as scale increases, rather than remaining constant. Option A is wrong — decentralisation addresses censorship/outage risk, not throughput. Option B reduces some costs but does not fundamentally change proof batching economics. Option D is about code performance, not proof batching economics.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starknet recursive proof data: current proof batch size 10,000 transactions, verification cost per proof $200. With recursive proof iteration 1: 100,000 transactions per meta-proof. With recursive proof iteration 2: 1,000,000 transactions per meta-meta-proof. Calculate the per-transaction verification cost at each stage. State what transaction volume Starknet could support at Ethereum\'s current gas capacity (capable of verifying approximately 1,000 proofs per day) at each stage.',
      scoringCriteria: [
        'Current: $200 ÷ 10,000 = $0.02 per tx. Daily capacity: 1,000 proofs × 10,000 tx = 10M transactions/day',
        'Iteration 1: $200 ÷ 100,000 = $0.002 per tx. Daily capacity: 1,000 × 100,000 = 100M transactions/day',
        'Iteration 2: $200 ÷ 1,000,000 = $0.0002 per tx. Daily capacity: 1,000 × 1,000,000 = 1B transactions/day',
        'Correctly identifies: at iteration 2, Starknet\'s theoretical daily transaction capacity (1 billion) exceeds current global Visa transaction volume (~200M/day) — making ZK-proof security economically viable at payment-network scale',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Volition has shipped. A protocol is choosing DA mode for a new product: a per-game-move transaction system for Loot Survivor 2. Each move costs $0.001 in transaction fee. Players make approximately 200 moves per gaming session. The off-chain DA committee is operated by 5 parties with a 3-of-5 quorum requirement to withhold data. State: (1) whether off-chain DA is appropriate for this use case, (2) the specific failure scenario and its impact on users, (3) whether the 3-of-5 committee structure adequately mitigates the risk.',
      scoringCriteria: [
        'Off-chain DA is appropriate for this use case: $0.001 per move × 200 moves = $0.20 per session. The asset at stake per session is negligible. Ethereum DA would add disproportionate cost relative to the value at risk.',
        'Specific failure scenario: if the DA committee withholds data, players cannot prove their historical game state (achievements, items earned in sessions during the outage). For in-game items worth cents, this is recoverable — the game could replay from last verified checkpoint.',
        '3-of-5 quorum assessment: 3 parties must collude to withhold data — harder than single-party failure but not impossible. For a gaming app, this risk is acceptable. For a financial protocol, it would not be.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A non-technical board member of a Starknet-based startup asks: "Why does Starknet\'s decentralisation roadmap matter for our protocol\'s long-term value?" Explain in two sentences without using the words "sequencer", "STARK", "DA", "recursive", or "proof".',
      scoringCriteria: [
        'Correctly conveys that centralised control today creates business risk — if the single operator managing transaction processing goes offline or faces regulatory pressure, the startup\'s product becomes temporarily inaccessible to users',
        'Correctly conveys the value of the roadmap: moving control to many independent operators removes that single point of failure — making the protocol as reliable as any decentralised internet infrastructure rather than dependent on one company\'s uptime',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L5.2 — ZK Use Cases Beyond DeFi
// TYPE A — Dominant concept: ZK proofs enable three non-DeFi
// use cases — identity, gaming, and private computation — and
// the privacy mechanism matters for regulatory analysis:
// ZK-based privacy with viewing keys is structurally different
// from mixer-based privacy.
// ─────────────────────────────────────────────────────────────

export const LAB5_LESSON_2 = {
  id: 'l5-2-zk-use-cases-beyond-defi',
  title: 'ZK Use Cases Beyond DeFi',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
In 2019, a 23-year-old applying for a loan was told by the bank: "We need to verify your income. Please provide three years of tax returns, bank statements from every account, and an employment letter." He earned enough to qualify. But the verification process required sharing data he would rather keep private — the exact balances of all his accounts, his investment portfolio, his freelance income sources. The bank needed one fact: "this person earns above £X per year." To verify that one fact, they required access to everything.

Zero-knowledge proofs solve exactly this problem. They allow one party to prove a specific fact to another without revealing anything beyond that fact. You can prove you are over 18 without revealing your date of birth. You can prove you earn above £50,000 without revealing your exact salary. You can prove you hold enough collateral without revealing your entire portfolio.

DeFi is the first major application of ZK proofs. But the use cases extend far beyond token swaps and lending. This lesson covers three, plus a critical distinction in how privacy technology works — because getting that distinction right matters for regulatory analysis.

USE CASE 1 — IDENTITY AND VERIFIED CREDENTIALS

The age verification problem described above is representative of a class of problems: proving a claim about yourself without revealing everything about yourself. Traditional verification requires showing the document. ZK-based verification requires only proving the claim.

Practical applications on Starknet:
— Age verification without revealing date of birth (e.g., accessing age-restricted content)
— Income verification without revealing full financial details (lending, housing)
— Credential verification without revealing the issuing institution or exam score (only "passed" vs "failed")
— KYC compliance without revealing personal details to each protocol separately (verify once, use everywhere)

StarkWare has explored collaboration with World ID (Worldcoin's identity system) to bring ZK-based proof-of-personhood to Starknet. The mechanism: prove you are a unique human without revealing which human you are.

Current status: experimental. No major production deployment of ZK identity on Starknet as of current data. The technical infrastructure exists; the adoption challenge is getting institutions to accept ZK proofs as legally sufficient verification — a regulatory, not technical, barrier.

USE CASE 2 — PROVABLY FAIR GAMING

Covered briefly in L4.4 (Dojo gaming): when every game move is a blockchain transaction, the game logic itself is on-chain. This has a specific implication: cheating becomes mathematically impossible.

In a traditional game, the developer's server decides whether a card shuffle was fair or a dice roll was random. Players must trust the developer. With ZK proofs, the game can generate randomness and then prove to anyone that the randomness was generated fairly — without revealing the random value itself until the appropriate moment.

Applications: card games where shuffle fairness can be proven, lotteries where randomness is verifiable, competitive games where move legality is provably enforced. Any game where "was this fair?" is a meaningful question is a candidate for ZK-based verification.

The constraint: current implementation on Starknet requires developer effort and adds computation overhead. Most games do not yet use ZK proofs for fairness verification — they use the simpler Dojo model (game logic on-chain, which achieves move verification but uses simpler randomness). Full ZK-based randomness proofs are an active area of development.

USE CASE 3 — PRIVATE COMPUTATION

The most technically advanced use case: computing on data that is never revealed, then proving the computation was done correctly.

Practical example: a hospital wants to analyse patient data across 10 hospitals to find patterns in treatment outcomes. Under current law, sharing patient data across institutions for research is heavily regulated — and for good reason. ZK-based private computation would allow each hospital to encrypt their patient data, send it to a shared computation system, run the analysis on the encrypted data, and produce a result — all without any individual hospital's data being readable by the others or by the computation system.

The result is provably correct. The patient data was never exposed.

Current Starknet status: even more experimental than ZK identity. The computational overhead of operating on fully encrypted data is significant. This use case is a 5–10 year horizon, not a 1–2 year horizon. But it is the use case that makes ZK proofs relevant to healthcare, finance, government, and any domain where data privacy and computation accuracy are both required.

THE PRIVACY MECHANISM DISTINCTION — TONGO VS TORNADO CASH

Before analysing any privacy protocol, you need to understand the two fundamentally different approaches to privacy on blockchains.

APPROACH 1 — MIXER-BASED PRIVACY (Tornado Cash model)

Tornado Cash is a protocol on Ethereum that was sanctioned by OFAC (the US Treasury's Office of Foreign Assets Control) in August 2022. It has since been used to obfuscate billions of dollars in criminal proceeds, including funds stolen in DeFi hacks.

How it works: many users deposit a fixed amount (e.g., 1 ETH) into a pool. When they withdraw, they can withdraw to a different address. Because hundreds of people deposited 1 ETH, no one can tell which input deposit corresponds to which output withdrawal. Privacy by crowd — the transaction link is broken by the pool.

The regulatory problem: the mixer works equally well for someone hiding income from criminals and someone protecting a legitimate financial transaction. The mechanism does not distinguish. OFAC sanctioned it because it provides "unacceptable" privacy — no ability to audit even when lawfully required.

APPROACH 2 — ZK-BASED PRIVACY WITH VIEWING KEYS (Tongo model)

Tongo is Starknet's ZK-based privacy protocol. It hides transaction amounts using cryptographic commitments — no pooling required. When you transact privately on Tongo, the amount is hidden from public view, but the mathematical proof confirms that no new tokens were created (preventing counterfeiting).

The key architectural difference: viewing keys. Tongo allows a user to grant a specific party (their accountant, a regulator with a court order) access to read their transaction history — without revealing it publicly. The privacy is selective and auditable, not absolute.

Key difference for regulatory analysis: mixer-based privacy cannot support compliance — the mechanism structurally prevents any auditor from tracing funds. ZK-based privacy with viewing keys supports compliance — a regulator can audit, but cannot surveil without the key holder's consent or a court order. This is exactly the distinction regulators cite when discussing "acceptable" vs "unacceptable" privacy technology.

For a regulated fund, hedge fund, or institution considering blockchain privacy: Tornado Cash is legally off-limits post-OFAC sanction. Tongo's viewing key architecture may be the only path to privacy that is compatible with regulatory compliance frameworks — because it demonstrates that the funds can be audited if lawfully required.
  `.trim(),

  keyTakeaway: `ZK proofs enable three non-DeFi use cases — identity (prove facts without revealing data), gaming (mathematically provable fairness), and private computation (compute on encrypted data) — and ZK-based privacy with viewing keys (Tongo) is fundamentally different from mixer-based privacy (Tornado Cash) in ways that matter for regulatory compliance.`,

  visualPrompt: `A four-panel diagram. Panel 1 "ZK Identity": icon of a passport fading away, replaced by a single green tick labelled "Claim verified." Arrow annotation: "Prove you are 18 without showing your date of birth." Panel 2 "ZK Gaming": icon of a dice with a verification certificate below. "Move legality provably enforced. Cheating mathematically impossible." Panel 3 "Private Computation": three hospital icons sending encrypted data to a central computation node, output is result only (no raw data). "Compute on encrypted data, prove result is correct." Panel 4 "Privacy Comparison": two columns — "Mixer (Tornado Cash): crowd hides the link. No compliance path. OFAC sanctioned." vs "Viewing Keys (Tongo): transaction hidden but auditable with key. Compliance compatible." Red X on mixer, green tick on viewing keys. Clear visual distinction between the two approaches.`,
  visualType: 'static',
  visualUrl: 'zk-use-cases-and-privacy-comparison',

  examples: [
    {
      contextTag: '[ZK identity for lending without full financial disclosure]',
      context: 'A DeFi lending protocol wants to offer undercollateralised loans (loans with less than 100% collateral) — similar to traditional credit. To do this, they need to verify creditworthiness without requiring a full financial disclosure on a public blockchain.',
      scenario: 'Using ZK identity infrastructure: a user generates a ZK proof from their verified bank account data showing they have maintained a balance above £5,000 for 12 months. The proof is submitted to the lending protocol. The protocol can verify the claim is true without ever seeing the actual balance, the bank name, or any other financial details.',
      outcome: 'The protocol can offer reduced-collateral loans to verified users while maintaining full privacy of their financial background. This is not yet in production — it requires institutions to accept ZK proofs as legally sufficient verification, which is still an open regulatory question. But the technical feasibility exists on Starknet today.',
    },
    {
      contextTag: '[Tongo vs Tornado Cash for a regulated institution]',
      context: 'A small hedge fund wants privacy for its on-chain trading activity — their trade sizes and timing could give competitors information about their strategy. They are evaluating Tornado Cash and Tongo.',
      scenario: 'Their compliance officer reviews both. Tornado Cash: sanctioned by OFAC in 2022. Using it in any jurisdiction where OFAC sanctions apply is illegal for a regulated entity. The mechanism offers no compliance path — no way to audit even when legally required. Tongo: uses ZK cryptographic commitments to hide transaction amounts. Grants a viewing key to their compliance officer and legal team. If a regulator issues a lawful audit request, the fund can provide the viewing key. The privacy is real and useful; the auditability is maintained for lawful purposes.',
      outcome: 'The compliance officer approves Tongo: "The viewing key architecture means we can comply with a court order or regulatory audit without making our trading history publicly visible. This is the distinction the FCA and OFAC have been signalling they will accept: privacy that can be audited, not privacy that prevents auditing." Tornado Cash cannot be considered — it is sanctioned.',
    },
    {
      contextTag: '[ZK private computation for healthcare research]',
      context: 'A medical research consortium wants to analyse whether a specific treatment protocol reduces 30-day readmission rates across 8 hospitals in England. Individual hospital data is protected by patient confidentiality law (UK GDPR). Sharing raw data between hospitals requires extensive regulatory approval.',
      scenario: 'The consortium explores ZK-based private computation: each hospital encrypts their patient outcome data. The encrypted data is submitted to a shared computation system. The computation runs on the encrypted data and produces a result (treatment X reduces readmission by Y%) without any hospital\'s raw data being readable by the computation system or other hospitals.',
      outcome: 'The technical feasibility exists in research. The computational overhead at this scale makes it impractical with current infrastructure — a full ZK proof of a computation over 8 hospitals\' data would take days rather than minutes. This is a 5–10 year horizon, not a 2–3 year one. But it establishes the direction: ZK proofs can eventually enable research that is currently blocked by privacy regulation, without compromising that regulation.',
    },
  ],

  guidedPractice: [
    {
      question: 'A user wants to prove they are over 18 to access an age-restricted service, without revealing their date of birth. How does ZK identity make this possible?',
      options: [
        'A. The user sends their ID document to the service, which verifies and deletes it',
        'B. The user generates a mathematical proof that their date of birth is more than 18 years ago — without revealing the date itself. The service verifies the proof (which is valid) without ever seeing the underlying date.',
        'C. A trusted third party verifies the age and sends a confirmation to the service',
        'D. The user pays a fee that is only available to adults, which serves as proof of age',
      ],
      correct: 1,
      hint: 'ZK proofs allow proving a fact about data without revealing the data. What fact needs to be proven, and what data does not need to be revealed?',
      explanation: 'B is correct. The fact to prove: "this user\'s birthdate is more than 18 years before today." The data not revealed: the actual date of birth. A ZK proof constructs a mathematical argument that is only satisfiable if the claim is true — the verifier can check the argument is valid without being given the underlying data. This is the core ZK property applied to identity verification.',
    },
    {
      question: 'Why was Tornado Cash sanctioned by OFAC, and why does this make it unusable for regulated institutions?',
      options: [
        'A. Tornado Cash was hacked and users lost money — regulators sanctioned it for fraud',
        'B. Tornado Cash\'s mixer mechanism provides no compliance path — it structurally prevents any audit of fund flows even when lawfully required, meaning a regulated institution using it cannot demonstrate compliance with anti-money-laundering laws',
        'C. Tornado Cash is only sanctioned in the United States — other jurisdictions permit it for institutional use',
        'D. Tornado Cash was sanctioned because it charged fees, which violates DeFi principles',
      ],
      correct: 1,
      hint: 'What does OFAC\'s concern about Tornado Cash relate to? What ability does the mixer design structurally prevent?',
      explanation: 'B is correct. OFAC sanctioned Tornado Cash in August 2022 specifically because the mixer mechanism cannot be audited — the pool design structurally breaks transaction links for all users, making it impossible to distinguish legitimate privacy users from those laundering criminal proceeds. For a regulated institution, anti-money-laundering laws require the ability to demonstrate the provenance of funds when lawfully required. Tornado Cash\'s mechanism prevents this by design — not just in practice, but architecturally. Option C is incorrect — OFAC sanctions have global reach for US-regulated entities and counterparties.',
    },
    {
      question: 'What is the specific feature of Tongo\'s architecture that makes it compliant-compatible in a way that Tornado Cash is not?',
      options: [
        'A. Tongo charges lower fees',
        'B. Viewing keys — Tongo allows users to grant specific parties (accountant, regulator with court order) the ability to read their private transaction history without making it publicly visible. Auditability is selective, not eliminated.',
        'C. Tongo is backed by regulated financial institutions, giving it legal standing',
        'D. Tongo uses a public ledger where transaction amounts are visible to everyone',
      ],
      correct: 1,
      hint: 'What does a regulatory audit require? Does Tornado Cash support this? Does Tongo?',
      explanation: 'B is correct. A regulatory audit requires the ability to trace funds when lawfully required. Tornado Cash cannot support this — the pool mechanism permanently breaks the audit trail. Tongo\'s viewing key architecture preserves selective auditability: the transaction is hidden from the public, but the key holder can grant access to a regulator or auditor when required. This is precisely the distinction regulators have signalled they will accept: privacy that is selective and revocable, not privacy that is absolute and irrevocable.',
    },
    {
      question: 'A ZK private computation system analyses encrypted medical records from 8 hospitals to find treatment outcome patterns. Why does the computation overhead currently make this impractical?',
      options: [
        'A. ZK proofs can only be applied to financial data, not healthcare data',
        'B. Generating a ZK proof of a computation over large datasets requires significantly more processing time than the computation itself — at the scale of 8 hospitals\' records, a proof might take days rather than minutes using current hardware',
        'C. Medical data cannot be encrypted — it must be analysed in plaintext',
        'D. The hospitals have not agreed to share data, making the computation impossible',
      ],
      correct: 1,
      hint: 'What is the relationship between the size of the data being computed on and the time required to generate a ZK proof of that computation?',
      explanation: 'B is correct. ZK proofs are computationally expensive to generate — the prover must construct a mathematical argument that the computation was correct, which requires processing proportional to the complexity of the computation. For large datasets like 8 hospitals\' patient records, this overhead makes the proof generation impractically slow with current infrastructure. This is why the use case is a 5–10 year horizon — it waits for proving hardware to catch up with the computational requirements. The mechanism is correct in theory; the current infrastructure cannot execute it at required scale and speed.',
    },
    {
      question: 'A hedge fund\'s compliance officer is evaluating Tongo for portfolio privacy. She needs to know: can they comply with a regulator\'s lawful audit request while using Tongo? What is the answer?',
      options: [
        'A. No — ZK privacy means no audit is ever possible',
        'B. Yes — Tongo\'s viewing key architecture allows the fund to grant a specific regulator or auditor read access to their private transaction history, on demand and under legal compulsion, without making the history publicly visible',
        'C. Only if the fund uses the Ethereum DA mode for their Tongo transactions',
        'D. Yes, but only if the fund self-reports monthly to the regulator',
      ],
      correct: 1,
      hint: 'Viewing keys are a mechanism for selective, revocable disclosure. What does that mean for a lawful audit request?',
      explanation: 'B is correct. The fund holds a viewing key that decrypts their Tongo transaction history. When a regulator issues a lawful audit request — a court order, an FCA investigation, an OFAC inquiry — the fund can provide that viewing key, giving the regulator complete read access to the relevant history. The privacy was real and useful during normal operations; the auditability is maintained for lawful purposes. This is the compliance architecture that Tornado Cash\'s design prevents entirely.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'A government regulatory body proposes banning all ZK privacy protocols on the grounds that they "enable criminal activity." Evaluate the argument for and against the proposal. Specifically address: (1) where the argument is valid for Tornado Cash, (2) where it fails to apply to Tongo\'s viewing key architecture, (3) what the regulatory risk to Starknet\'s ecosystem is if such a ban passed without distinguishing between the two models.',
      scoringCriteria: [
        'Correctly validates the argument for Tornado Cash: the mixer model structurally prevents lawful audit — regulators cannot trace funds even with a court order, creating a real anti-money-laundering gap that explains the OFAC sanction',
        'Correctly explains why it fails for Tongo: viewing keys allow selective, revocable disclosure — a court order can compel the key holder to disclose, giving regulators the same audit capability they have with a bank account while preserving normal-use privacy',
        'Correctly identifies the Starknet ecosystem risk: a blanket ban that does not distinguish between mixer-based and ZK viewing-key privacy would eliminate Tongo and close the compliance-compatible privacy path, potentially suppressing legitimate institutional use of Starknet privacy features',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A ZK identity proof system shows 500,000 verified identities on Starknet. Cost per proof verification: $0.001. Traditional KYC (know-your-customer) cost per user: $15–$50. Calculate: (1) the annual cost of verifying 500,000 identities using ZK proofs (assuming one verification per user per year), (2) the equivalent cost using traditional KYC at both the low and high end, (3) the cost difference. State what this implies for the commercial case for ZK identity at scale.',
      scoringCriteria: [
        'ZK annual cost: 500,000 × $0.001 = $500 per year for all verifications',
        'Traditional KYC low end: 500,000 × $15 = $7.5M. High end: 500,000 × $50 = $25M',
        'Cost difference: $7.5M–$25M vs $500 — a 15,000× to 50,000× cost reduction at this scale',
        'Correctly identifies the commercial implication: at scale, ZK identity is not merely cheaper — it changes the economics of identity verification so fundamentally that it enables use cases previously impossible (e.g., verifying identity for a $0.001 micropayment where a $15 KYC cost would be prohibitive)',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a one-paragraph overview of ZK use cases beyond DeFi for a government technology advisory briefing. The audience: policymakers with no blockchain background who are evaluating whether ZK technology represents a net positive or net risk for society. Your paragraph must cover identity, gaming, and private computation — and must address the privacy distinction honestly (acknowledging both the legitimate uses and the risks that have already materialised with mixer-based privacy). 150 words maximum.',
      scoringCriteria: [
        'Correctly explains ZK identity in plain language: proves facts about a person without revealing personal data — enables age verification, income verification, and credential checking with less privacy exposure than current systems require',
        'Correctly explains gaming briefly: mathematical proof of fairness in competitive games — eliminates cheating that is impossible to detect in traditional systems',
        'Correctly addresses the privacy distinction honestly: distinguishes ZK privacy with audit capability (Tongo model, analogous to sealed court documents — private but openable by judicial order) from mixer-based privacy (Tornado Cash — structurally prevents any audit, leading to OFAC sanctions). Does not conflate the two.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L5.3 — Starknet's Competitive Position
// TYPE A — Dominant concept: four dimensions produce a structured
// competitive analysis that is honest about both Starknet's
// advantages and its genuine gaps versus ZKSync Era.
// ─────────────────────────────────────────────────────────────

export const LAB5_LESSON_3 = {
  id: 'l5-3-competitive-position',
  title: "Starknet's Competitive Position",
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
In the early 2000s, mobile phone analysts compared Nokia, Motorola, and Sony Ericsson on four dimensions: hardware quality, battery life, network coverage, and price. Nokia led on most dimensions for most of the decade. Then Apple launched the iPhone in 2007 — and the framework needed a fifth dimension: operating system and app ecosystem. Nokia's strength on existing dimensions was real and meaningful. But a new dimension had emerged that Nokia had no answer for.

Competitive analysis frameworks work until they don't — and knowing which dimensions matter for a given competitive environment is itself a skill. In the ZK rollup landscape, the four dimensions that matter right now are:

1. Proof system quality: what security assumptions does the proof system require? Is there a trusted setup? What are the transparency properties?

2. Developer ecosystem maturity: how many developers can build on this chain? How good is the tooling? How long would it take a new team to ship?

3. User experience: how do users onboard and interact? What do wallets look like? How fast and cheap are transactions? When can they withdraw to Ethereum?

4. Application ecosystem: how much TVL? How many protocol categories are served? Are the leading protocols high-quality?

This lesson applies these four dimensions to a Starknet vs ZKSync Era comparison — the two most comparable ZK rollups in terms of technology ambition and current market position.

DIMENSION 1 — PROOF SYSTEM QUALITY

Starknet (STARKs): no trusted setup. Security comes from hash functions alone. Mathematical proof that the setup ceremony concern does not exist — because no setup ceremony ever happened. No trusted party needs to have behaved honestly for the security to hold.

ZKSync Era (SNARKs): trusted setup ceremony completed before launch. Large, multi-party ceremony (hundreds of participants) with strong procedural safeguards. Security holds if at least one participant was honest — widely considered practically secure, but with a trust assumption that STARKs do not require.

Starknet score: 5/5. ZKSync Era score: 4/5. Starknet leads on the strongest theoretical security foundation.

DIMENSION 2 — DEVELOPER ECOSYSTEM MATURITY

Starknet (Cairo): ~3,000 active Cairo developers. Cairo is 3–4 years old in modern form. Package ecosystem: 47+ packages. IDE support: VS Code extension available. Documentation: strong official docs, thinner community coverage. Job market: narrow but growing.

ZKSync Era (Solidity/EVM): ~150,000 Solidity developers. EVM compatibility means protocols deploy from Ethereum with minimal changes. Deep package ecosystem (npm, OpenZeppelin). Full VS Code support inherited from Ethereum. Job market: inherits Ethereum's developer base.

Starknet score: 2/5. ZKSync Era score: 4/5. ZKSync leads significantly — EVM compatibility is the decisive factor.

DIMENSION 3 — USER EXPERIENCE

Starknet: native Account Abstraction. Every wallet is a programmable smart contract. Face ID onboarding (Braavos), no seed phrase required, session keys (Cartridge Controller). AVNU Paymaster enables gasless transactions. Finality: a few hours to L1.

ZKSync Era: EVM-compatible wallets — standard MetaMask. No native Account Abstraction (EIP-4337 is an add-on, not native). Gas fees: requires ETH. Finality: faster than optimistic rollups but comparable to Starknet on L1 finality timing.

Starknet score: 4/5. ZKSync Era score: 3/5. Starknet leads on UX architecture — native AA is a genuine differentiation that ZKSync cannot match without protocol-level changes.

DIMENSION 4 — APPLICATION ECOSYSTEM

Starknet: $800M+ TVL. DEXs (AVNU, Ekubo), Lending (Vesu, Nostra), Oracles (Pragma), Gaming (Dojo, Loot Survivor 2). Strong protocol variety. Community of early adopters.

ZKSync Era: $500M–$1B TVL range. Primarily DeFi primitives. Fewer protocol-level innovations specific to ZKSync (most protocols are Ethereum ports). Gaming: minimal. Ecosystem less diverse than Starknet.

Starknet score: 3/5. ZKSync Era score: 3/5. Roughly comparable TVL, with Starknet ahead on diversity (gaming, native AA protocols) and ZKSync ahead on EVM-ported protocol count.

SYNTHESIS: WHERE STARKNET LEADS AND LAGS

Starknet leads: Proof system (strongest theoretical security), User experience (native Account Abstraction), Protocol diversity (on-chain native gaming, AA-native DeFi).

Starknet lags: Developer ecosystem (1:50 developer ratio vs ZKSync's full Solidity inheritance), which compounds into slower protocol growth and fewer deployed applications over time.

THE CRITICAL VARIABLE

The dimension where Starknet's competitive position is most at risk: developer ecosystem. If EVM-compatible ZK rollups (ZKSync, Polygon zkEVM) capture Ethereum developers at scale, they could build a richer application ecosystem despite weaker proof system properties. A large mediocre application ecosystem may outcompete a small excellent one — users go where the apps are.

The counter-argument: Account Abstraction as a native property of every wallet may eventually be the decisive user acquisition advantage. Any application that requires Face ID onboarding, session keys, or gasless transactions can only be built natively on Starknet — these features exist on ZKSync as add-ons, not as the foundational architecture.

The analyst\'s job: monitor developer count growth (is Cairo\'s ecosystem closing the gap?) and AA-native application adoption (are applications that require AA choosing Starknet?). These two metrics are the leading indicators of whether Starknet\'s competitive position strengthens or weakens over the next 12–24 months.
  `.trim(),

  keyTakeaway: `Starknet leads on proof system quality (STARK, no trusted setup) and user experience (native Account Abstraction), lags on developer ecosystem maturity (Cairo 1:50 vs Solidity), and is roughly comparable on application ecosystem — with the developer gap being the primary competitive risk to monitor.`,

  visualPrompt: `A four-row scoring grid. Rows: Proof System Quality, Developer Ecosystem, User Experience, Application Ecosystem. Columns: Starknet score (1-5) and ZKSync Era score (1-5). Starknet row scores: 5, 2, 4, 3. ZKSync scores: 4, 4, 3, 3. Each cell colour-coded: green if higher score, amber if equal, red if lower. Below the grid: two callout boxes — "Starknet leads: proof security + native AA" and "Starknet lags: developer pool (1:50 vs Solidity)." A trend arrow for developer ecosystem pointing toward Starknet with label "closing gap — watch Cairo developer count."`,
  visualType: 'static',
  visualUrl: 'starknet-vs-zksync-four-dimension-comparison',

  examples: [
    {
      contextTag: '[Protocol team using the framework to choose deployment chain]',
      context: 'A DeFi team wants to build a mobile-first lending protocol with Face ID login and no seed phrase for users. They are choosing between Starknet and ZKSync Era.',
      scenario: 'They apply the four dimensions. Proof system: comparable for their use case. Developer ecosystem: their team knows Solidity (ZKSync advantage), but they have budget for one Cairo hire. User experience: Face ID login and no seed phrase require native Account Abstraction — native on Starknet, add-on (EIP-4337) on ZKSync with worse UX consistency. Application ecosystem: roughly comparable TVL.',
      outcome: 'They choose Starknet. The specific product feature — Face ID onboarding and no seed phrase — is architecturally native on Starknet and architecturally awkward on ZKSync. The developer ecosystem gap is real (they budget for one Cairo specialist hire) but the AA advantage is decisive for their product. The four-dimension framework pointed to the right conclusion by separating the dimensions rather than making a blanket "which chain is better?" judgment.',
    },
    {
      contextTag: '[Analyst monitoring competitive gap over 12 months]',
      context: 'An analyst set up a dashboard 12 months ago to monitor the two leading indicators of Starknet\'s competitive position: Cairo developer count and AA-native application adoption.',
      scenario: 'Current readings: Cairo developers: 3,200 (was 2,800 twelve months ago — 14% growth). ZKSync developer count: approximately 8,000 (inherited Solidity base has not grown on ZKSync specifically). AA-native apps deployed on Starknet: 12 (up from 6 twelve months ago). AA apps on ZKSync: 3 (EIP-4337 add-on, slower adoption).',
      outcome: 'Cairo developer growth (14%) outpaces most comparable-stage language ecosystems. AA-native apps on Starknet growing 2× in 12 months. The analyst updates her report: "Starknet\'s competitive position on the two critical variables has strengthened over the past 12 months. The developer gap is closing (slowly) and AA-native applications are building on Starknet specifically. Monitor for the next 12 months: can Cairo developer growth sustain 10%+ quarterly growth? That is the pace required to close the developer gap within 3–4 years."',
    },
    {
      contextTag: '[TVL per developer revealing different productivity]',
      context: 'An analyst is preparing a competitive analysis for a VC who asks: "ZKSync has higher absolute TVL than Starknet. Is it winning?"',
      scenario: 'The analyst runs the TVL-per-developer analysis from L2.5. ZKSync: $800M TVL, ~8,000 developers = $100K/developer. Starknet: $800M TVL, ~3,000 developers = $267K/developer. Starknet generates 2.67× more TVL per developer.',
      outcome: 'The analyst\'s response: "On absolute TVL they are comparable. But Starknet generates $267K TVL per developer vs ZKSync\'s $100K. Starknet\'s ecosystem is more capital-efficient per developer. The limiting factor is developer count, not architectural quality. If Starknet can grow to 10,000 Cairo developers at the same per-developer productivity, it would have $2.67B TVL without any other changes. The developer count is the bottleneck, not the platform."',
    },
  ],

  guidedPractice: [
    {
      question: 'On the proof system quality dimension, Starknet scores 5/5 and ZKSync Era scores 4/5. What specific difference justifies this gap?',
      options: [
        'A. Starknet\'s proofs verify faster than ZKSync\'s',
        'B. Starknet uses STARKs, which require no trusted setup — security comes from hash functions alone. ZKSync uses SNARKs, which required a trusted setup ceremony before launch. Both are considered practically secure, but STARKs have stronger theoretical trust properties.',
        'C. Starknet has more validators checking its proofs',
        'D. ZKSync\'s proofs have been hacked previously while Starknet\'s have not',
      ],
      correct: 1,
      hint: 'Recall the STARK vs SNARK distinction from L2.3. What is the specific security property difference?',
      explanation: 'B is correct. The proof system quality score reflects the trust assumptions required. STARKs need no trusted setup — their security is unconditional on any ceremony. SNARKs require a trusted setup ceremony — security holds if at least one participant was honest, which is widely accepted as practically secure given large multi-party ceremonies, but is a stronger assumption than "no assumption at all." Option A is wrong — STARK proofs are typically larger and slower to verify than SNARK proofs, not faster.',
    },
    {
      question: 'On the developer ecosystem dimension, ZKSync scores 4/5 and Starknet scores 2/5. What is the primary driver of ZKSync\'s advantage?',
      options: [
        'A. ZKSync has better documentation than Cairo',
        'B. ZKSync is EVM-compatible — it inherits the full Ethereum Solidity developer base (~150,000) and tooling ecosystem. Cairo has ~3,000 developers and a significantly younger tooling ecosystem.',
        'C. ZKSync pays developers higher salaries than the Starknet Foundation',
        'D. ZKSync has a larger team working on its tools than StarkWare',
      ],
      correct: 1,
      hint: 'What is the single biggest determinant of available developers and tooling maturity for ZKSync?',
      explanation: 'B is correct. EVM compatibility is the decisive factor. ZKSync accepts Solidity — the language of the 150,000-strong Ethereum developer community. Their entire tooling ecosystem (Hardhat, Foundry, OpenZeppelin libraries, VS Code plugins, Stack Overflow coverage) transfers directly. Starknet requires Cairo — a separate language with ~3,000 developers, younger tooling, and a narrower package ecosystem. This is a structural advantage for ZKSync that does not require any ZKSync-specific quality to be better — it is simply inherited from Ethereum.',
    },
    {
      question: 'On the user experience dimension, Starknet scores 4/5 and ZKSync Era scores 3/5. What specific feature drives Starknet\'s UX advantage?',
      options: [
        'A. Starknet has lower gas fees than ZKSync',
        'B. Native Account Abstraction — every Starknet wallet is a programmable smart contract by default. This enables Face ID login, guardian recovery without seed phrases, session keys, and gasless transactions natively. On ZKSync, these features require EIP-4337, which is an add-on with less consistent UX.',
        'C. Starknet transactions confirm faster than ZKSync transactions',
        'D. Starknet has a more attractive wallet interface',
      ],
      correct: 1,
      hint: 'Recall from L2.4: what is the architectural difference between native AA on Starknet vs EIP-4337 on other chains?',
      explanation: 'B is correct. Account Abstraction is native to Starknet — every wallet is a programmable contract from the ground up. This means Face ID login, no seed phrases, session keys, and gasless transactions work consistently because they are part of the foundational architecture. On ZKSync (and Ethereum), EIP-4337 is an add-on standard — it works, but with less consistent implementation across wallets and protocols. "Native" vs "add-on" is the core UX distinction.',
    },
    {
      question: 'Which of the four competitive dimensions represents Starknet\'s primary risk to its competitive position over the next 12–24 months?',
      options: [
        'A. Proof system quality — other chains might find a way to eliminate trusted setup',
        'B. Developer ecosystem — if EVM-compatible chains capture Ethereum developers at scale, they build richer application ecosystems faster than Starknet\'s smaller Cairo developer pool can match',
        'C. User experience — other chains might add native AA',
        'D. Application ecosystem — Starknet might lose TVL to competitors',
      ],
      correct: 1,
      hint: 'Which dimension shows the largest current gap, and which gap has the longest timeline to close?',
      explanation: 'B is correct. The developer ecosystem gap (2/5 vs 4/5) is the largest current weakness and the slowest to close — growing a language ecosystem from 3,000 to 150,000 developers takes years of coordinated investment in education, tooling, and job market development. An EVM-compatible chain that captures developer mindshare can build applications faster than a smaller developer pool can match, regardless of superior proof system quality. Option A is less likely — eliminating the need for a trusted setup is a fundamental mathematical property of STARKs. Option C is possible but ZKSync adding native AA would require protocol-level changes, not just software updates.',
    },
    {
      question: 'An analyst monitoring Starknet\'s competitive position identifies two leading indicators. Cairo developer count grew 14% over 12 months. AA-native apps deployed doubled from 6 to 12. How should she interpret these signals?',
      options: [
        'A. Starknet is winning — 14% developer growth and doubling app count are both excellent',
        'B. Both signals are positive but require context. 14% developer growth on a base of 3,000 = 420 new developers. ZKSync starts with 150,000 — 14% would be 21,000 new developers. Starknet\'s AA-native app doubling is meaningful as a thesis validation signal.',
        'C. The signals are contradictory — developer growth and app growth should be correlated, not independent',
        'D. Neither signal is meaningful — only TVL matters for competitive analysis',
      ],
      correct: 1,
      hint: 'What is the absolute number of new Cairo developers represented by 14% growth on a 3,000-person base? How does this compare to the absolute scale of the Solidity ecosystem?',
      explanation: 'B is correct. 14% growth on 3,000 = 420 new Cairo developers. This is positive trajectory — but in absolute terms, ZKSync growing its developer base by even 5% from 150,000 adds 7,500 developers: nearly 18× as many in absolute terms. The percentage growth rates are comparable; the absolute additions are not. However, AA-native apps doubling is a genuinely positive signal: these are applications that only make sense on Starknet, validating the differentiation thesis. The analyst should report both with appropriate context — not dismiss either signal, but not overstate their magnitude.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Use the four-dimension framework to score Starknet vs ZKSync Era on each dimension (1–5 scale). Provide one specific data point justifying each score. Calculate the total scores. State: where does Starknet lead most decisively, where does it lag most decisively, and what is the single metric that would most change the relative scores if it shifted meaningfully over 12 months?',
      scoringCriteria: [
        'Proof system: Starknet 5 (STARK, no trusted setup — no setup ceremony required), ZKSync 4 (SNARK, trusted setup completed with safeguards). Starknet +1.',
        'Developer ecosystem: Starknet 2 (~3,000 Cairo developers, 47 packages), ZKSync 4 (~150,000 Solidity developers via EVM compatibility). ZKSync +2.',
        'UX: Starknet 4 (native AA, Face ID, session keys, gasless transactions), ZKSync 3 (EIP-4337 add-on, MetaMask standard). Starknet +1.',
        'Application ecosystem: Starknet 3 ($800M TVL, diverse), ZKSync 3 ($800M TVL, DeFi-concentrated). Tied. Total: Starknet 14, ZKSync 14. Metric most likely to shift: Cairo developer count — if it grows to 10,000+, the developer dimension score would improve from 2 to 3–4, shifting the total to Starknet\'s favour.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'EVM compatibility (supported by ZKSync, Polygon zkEVM, Linea) allows Ethereum protocols to deploy without rewriting code. Starknet requires Cairo. Model the 12-month protocol migration risk: given that Starknet has approximately 40 protocols deployed and ZKSync has approximately 80, estimate how many of the next 50 new DeFi protocols might choose EVM-compatible chains over Starknet due to Cairo friction. State your assumptions and what evidence would change your estimate.',
      scoringCriteria: [
        'Reasonable estimate: 35–45 of the next 50 new protocols would likely choose EVM-compatible chains. Assumption: teams without existing Cairo expertise face a 4-month learning curve — at current developer supply, most teams will default to Solidity + EVM-compatible chain.',
        'Counter-assumption: if the protocol specifically needs native AA (e.g., mobile-first, gasless, session key features), Starknet becomes more compelling — estimate 5–10 of those 50 might specifically seek Starknet\'s AA properties.',
        'Evidence that would change the estimate: (a) Cairo bootcamps producing 500+ new Cairo developers in 12 months would reduce the learning curve barrier, (b) a major Ethereum protocol (Aave, Uniswap) porting to Starknet would signal ecosystem viability and attract follower protocols.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a 200-word "competitive landscape" section of a Starknet ecosystem report. Be honest about where Starknet lags (developer ecosystem, absolute TVL vs Arbitrum) without being dismissive of its genuine advantages (proof system, native AA, on-chain gaming). The audience is a sophisticated institutional investor who can handle nuance.',
      scoringCriteria: [
        'Correctly states Starknet\'s genuine advantages with evidence: STARK proofs (no trusted setup, strongest theoretical security), native Account Abstraction (Face ID onboarding, session keys — native, not add-on), ZK-native on-chain gaming (Dojo ecosystem)',
        'Honestly states the gaps without dismissing: developer ecosystem (Cairo ~3,000 vs Solidity ~150,000 — the primary growth constraint), TVL vs Arbitrum ($800M vs $20B+), protocol count vs Ethereum',
        'Synthesis is balanced and specific: identifies the two competitive battlegrounds (developer ecosystem growth pace and AA-native application adoption) that will determine whether Starknet\'s architectural advantages translate to market share',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L5.4 — The Tongo Case: Privacy as a Product
// TYPE A — Dominant concept: Tongo's business model is privacy
// as a service for legitimate users — and its viewing key
// architecture makes it the only privacy protocol compatible
// with regulated institutional use post-Tornado Cash.
// ─────────────────────────────────────────────────────────────

export const LAB5_LESSON_4 = {
  id: 'l5-4-tongo-privacy-product',
  title: 'The Tongo Case: Privacy as a Product',
  trackType: 'A',
  lessonNumber: 4,

  explanation: `
In 1997, Switzerland's banking secrecy laws — which had protected depositor anonymity since 1934 — began to erode under international pressure related to money laundering and tax evasion. By 2009, Swiss banks were disclosing depositor information to US authorities under treaty obligations. By 2014, most Swiss banking secrecy had been dismantled for international tax purposes.

But Swiss banking secrecy had served legitimate purposes: a dissident hiding assets from an authoritarian government, a domestic violence survivor protecting finances from an abusive partner, a business protecting sensitive payment information from competitors. The dismantling of secrecy affected all of these users equally.

The lesson for DeFi privacy: the regulatory battle over financial privacy is not new. The question has always been how to provide privacy for legitimate users without enabling the illegitimate ones. Traditional banking answered this through selective disclosure to authorities — you have privacy from other private parties but not from regulators with lawful authority. Tongo attempts to replicate this model in code.

WHO PAYS FOR PRIVACY AND WHY

Privacy is not a single use case. Three distinct user types pay for on-chain privacy:

USER TYPE 1 — BUSINESSES WITH COMPETITIVE INFORMATION
A company executing a large on-chain acquisition or investment does not want its competitors to observe the trade before it settles. In traditional finance, institutional trades are executed via dark pools — private venues specifically designed to prevent information leakage. On a public blockchain, every transaction is publicly visible by default.

A business paying for Tongo is paying for competitive information protection — the same service that dark pools provide in traditional finance.

USER TYPE 2 — HIGH-NET-WORTH INDIVIDUALS AND FUNDS
A fund holding $50M in on-chain assets does not want its portfolio composition to be publicly readable. If a whale sells a large position, other traders can front-run the move. If a fund's portfolio is known, competitors can build reverse-trades.

User Type 2 pays for financial privacy — preventing informed trading by observers of their positions.

USER TYPE 3 — INDIVIDUALS IN HIGH-RISK SITUATIONS
A journalist in an authoritarian country receiving payments for their work. A domestic violence survivor who needs to receive funds without an abuser tracking the source. A political activist in a jurisdiction where their financial relationships could be used against them.

These are the clearest cases of legitimate privacy need — and the cases where the alternative to financial privacy is physical safety.

TONGO'S BUSINESS MODEL

Tongo charges a fee per transaction for privacy protection. The fee is denominated in STRK. The revenue model: more private transactions = more fee revenue. The protocol does not require a token for governance — the token, if any, is a fee payment mechanism.

The competitive landscape: Aztec (Ethereum), Aleo (a new L1 built specifically for private computation), and Namada (in the Cosmos ecosystem) all offer some form of on-chain privacy. The key differentiators:

Aztec: uses a different privacy approach (programmable privacy via Noir language). Larger developer community than Tongo because Ethereum has more developers overall. Not natively on Starknet.

Aleo: a separate L1 blockchain built entirely around ZK proofs and privacy. Not a rollup or Layer 2. A complete ecosystem rebuild rather than a privacy layer on top of an existing ecosystem.

Namada: targets Cosmos ecosystem specifically. Not directly competing for Starknet users.

Tongo's competitive advantage: native to Starknet. Users who already have STRK and use Starknet DeFi protocols do not need to bridge to a different chain for privacy — Tongo is available within the ecosystem they already use.

THE REGULATORY LANDSCAPE POST-TORNADO CASH

August 2022 was a defining moment for DeFi privacy. OFAC sanctioned Tornado Cash — the first time a software protocol (not a company) was placed on the US sanctions list. The legal status of Tornado Cash remains contested: some courts have argued that open-source code cannot be sanctioned; others have upheld the sanction.

What this established, practically: any regulated institution, US person, or US counterparty cannot use Tornado Cash without legal risk. This is settled regardless of the ongoing legal debate.

Tongo's argument: the viewing key architecture creates a compliance path that Tornado Cash's design cannot. When a regulator with lawful authority requires disclosure, a Tongo user can provide their viewing key. This is analogous to a bank disclosing account records under a court order — the privacy was real, the disclosure is controlled, the compliance is possible.

Whether this argument is accepted by regulators remains to be seen. The legal framework for ZK-based privacy with selective disclosure has not been fully litigated in major jurisdictions as of current data. This is the primary regulatory risk for Tongo and for any institution considering its use.

TVL ADOPTION AS ECOSYSTEM SIGNAL

Tongo's TVL as a percentage of total Starknet TVL is a proxy for privacy demand among current Starknet users. A low percentage suggests the current Starknet user base is primarily DeFi-native users who either do not need privacy (small positions) or are not yet aware of Tongo. A higher percentage, particularly if driven by institutional depositors, would validate the commercial thesis.

This metric should be tracked quarterly alongside: institutional adoption announcements (regulated fund partnerships), regulatory clarity (positive or negative signals from OFAC, FCA, or EU MiCA framework), and Aztec's traction on Ethereum (a direct comparable with a larger potential user base).
  `.trim(),

  keyTakeaway: `Tongo's business model is privacy as a service for three legitimate user types — businesses protecting competitive information, funds protecting portfolio privacy, and individuals in high-risk situations — and its viewing key architecture is the only path to regulatory compliance that Tornado Cash's design structurally cannot provide.`,

  visualPrompt: `A three-row user type diagram. Row 1 "Businesses": icon of a corporate building with a trade arrow that is hidden from a competitor icon watching the blockchain. Label: "Competitive information protection — dark pool equivalent." Row 2 "Funds/HNW": icon of a portfolio with masked amounts and no public visibility. Label: "Portfolio privacy — prevents front-running." Row 3 "At-risk Individuals": icon of a person with a shield protecting their payment history from a threatening figure. Label: "Physical safety — financial privacy as protection." Below all three rows: a competitive comparison table showing Tongo, Aztec, Aleo, Namada — with "Native to Starknet" as Tongo\'s unique column entry. Final box: "Regulatory risk: viewing key compliance path — legally untested in major jurisdictions as of current data."`,
  visualType: 'static',
  visualUrl: 'tongo-business-model-use-cases',

  examples: [
    {
      contextTag: '[Regulated fund evaluating Tongo post-Tornado Cash]',
      context: 'A UK-based crypto hedge fund wants to execute large on-chain STRK purchases without broadcasting their position to competitors who monitor public blockchain activity.',
      scenario: 'Their compliance team reviews Tongo. The viewing key architecture means: their portfolio privacy is real (no public observer can read their position), but they hold the viewing key and can provide it to the FCA or a court order. They document in their compliance manual: "Tongo transactions are auditable by the firm, by the FCA under compulsion, and by courts via legal process. They are not auditable by competitors or the public."',
      outcome: 'The compliance team approves Tongo use for transactions above £100,000 where competitive information leakage is a material risk. The legal qualification: "We accept that the regulatory framework for ZK viewing-key privacy has not been fully litigated in UK jurisdiction. We have received specialist counsel opinion that the viewing key architecture is distinguishable from Tornado Cash\'s sanctioned mechanism. We maintain a legal opinion on file."',
    },
    {
      contextTag: '[Tongo TVL tracking as ecosystem signal]',
      context: 'An analyst is building a quarterly tracking dashboard for Tongo adoption.',
      scenario: 'Q1 data: Tongo TVL = $8.2M = 1.0% of Starknet total TVL ($800M). Q2 data: Tongo TVL = $14.7M = 1.8% of Starknet TVL ($815M). Q3 data: Tongo TVL = $22.1M = 2.6% of Starknet TVL ($850M). The growth in Tongo\'s share of TVL is accelerating: from 1.0% to 1.8% to 2.6%.',
      outcome: 'Her Q3 report notes: "Tongo\'s TVL share of Starknet has nearly tripled in two quarters — from 1.0% to 2.6%. More importantly, the growth rate is accelerating rather than plateauing, suggesting organic adoption rather than one-time depositor events. Q4 monitoring: look for institutional announcements that explain the acceleration. If a regulated fund or institution publicly confirms Tongo use, it would validate the commercial thesis significantly."',
    },
    {
      contextTag: '[Aleo vs Tongo competitive analysis]',
      context: 'A DeFi researcher asks: "Why would someone use Tongo on Starknet instead of Aleo, which was built specifically for privacy?"',
      scenario: 'An analyst compares: Aleo requires bridging from Ethereum/Starknet to Aleo\'s own chain. User already holds STRK and uses AVNU and Vesu on Starknet. To use Aleo: bridge STRK → Aleo equivalent → use Aleo privacy protocol → bridge back. Multiple bridging steps, each with bridge risk and time delay. Tongo: the user uses the same wallet they already have, within the same Starknet ecosystem, paying in STRK they already hold.',
      outcome: 'The competitive advantage is ecosystem integration, not privacy mechanism quality. Both Tongo and Aleo offer ZK-based privacy. Tongo\'s advantage: zero bridging friction for existing Starknet users. A user who is already using Starknet DeFi daily has near-zero marginal effort to add Tongo to their workflow. Aleo requires a multi-step cross-ecosystem migration for each privacy transaction. For users embedded in the Starknet ecosystem, native availability wins on user experience alone.',
    },
  ],

  guidedPractice: [
    {
      question: 'Why would a business executing a large on-chain acquisition use Tongo, even if their activity is entirely legal?',
      options: [
        'A. To avoid paying taxes on the acquisition',
        'B. To prevent competitors from observing the trade before settlement — the same reason institutional trades in traditional finance use dark pools. Publicly visible large trades can be front-run, reducing the quality of execution.',
        'C. Because on-chain transactions cannot be tracked without privacy protocols',
        'D. To avoid KYC requirements for large purchases',
      ],
      correct: 1,
      hint: 'Think about what information a publicly visible large trade gives to competitors observing the blockchain.',
      explanation: 'B is correct. A large on-chain acquisition by a known entity is visible to anyone monitoring the blockchain. Competitors who see the trade can infer the entity\'s strategy, adjust their own positions accordingly, or front-run the trade (buying the target asset before the large purchase pushes the price up, then selling at the higher price). This is exactly the information leakage that dark pools prevent in traditional finance — Tongo provides the same protection on-chain. The motivation is competitive advantage, not illegality.',
    },
    {
      question: 'Tongo\'s TVL represents 1.8% of Starknet\'s total TVL. How should an analyst interpret this figure?',
      options: [
        'A. Tongo has failed — 1.8% is too low to be meaningful',
        'B. 1.8% suggests privacy demand exists among current Starknet users but is not yet the dominant use case. The more meaningful signal is the growth trend — whether this percentage is rising or falling over consecutive quarters.',
        'C. Tongo has succeeded — 1.8% TVL share makes it one of the top Starknet protocols',
        'D. The percentage cannot be interpreted without knowing the dollar value',
      ],
      correct: 1,
      hint: 'What does 1.8% TVL tell you about current demand, and what additional data would make the signal more meaningful?',
      explanation: 'B is correct. 1.8% represents real but limited current demand. The absolute figure ($14.7M at $815M total TVL) is meaningful — it is not zero. But whether the thesis is progressing depends on the trend: is this percentage growing each quarter? If Tongo is going from 1.0% to 1.8% to 2.6%, the adoption is accelerating — a positive thesis signal. If it peaked at 2.0% and is declining, the initial users tested and left — a negative signal. Trend is more diagnostic than snapshot for an early-stage product.',
    },
    {
      question: 'What is the primary legal risk for a regulated institution considering Tongo for portfolio privacy?',
      options: [
        'A. Tongo charges fees, which constitutes investment advice under most regulatory frameworks',
        'B. The legal framework for ZK-based privacy with selective disclosure (viewing keys) has not been fully litigated in major jurisdictions — it is distinguished from Tornado Cash by design, but courts and regulators have not formally validated the distinction in binding precedent',
        'C. Using Tongo means the institution\'s activities are completely anonymous and auditable by no one',
        'D. Tongo is illegal because it was built on Starknet, which is not yet regulated',
      ],
      correct: 1,
      hint: 'What is the difference between "distinguished from Tornado Cash in design" and "legally validated as different from Tornado Cash in practice"?',
      explanation: 'B is correct. The viewing key architecture is a genuine technical distinction from Tornado Cash\'s design. But regulatory and legal frameworks move more slowly than technology. As of current data, no major court or regulator has issued a binding ruling that viewing-key ZK privacy is legally distinct from sanctioned mixer-based privacy. An institution using Tongo today does so on specialist counsel\'s legal opinion, not on settled precedent. This is a real legal risk — not a reason to definitely avoid, but a reason to document the legal basis carefully and monitor regulatory developments.',
    },
    {
      question: 'Why is Tongo\'s native presence on Starknet a competitive advantage over Aleo for existing Starknet users?',
      options: [
        'A. Tongo uses better privacy technology than Aleo',
        'B. Existing Starknet users can access Tongo without bridging assets to another chain — zero additional ecosystem friction. Aleo requires multi-step bridging from Starknet, each step introducing bridge risk, delay, and cost.',
        'C. Tongo charges lower fees than Aleo for the same privacy level',
        'D. Tongo is regulated and Aleo is not',
      ],
      correct: 1,
      hint: 'Think about what a Starknet user must do to use Aleo vs to use Tongo.',
      explanation: 'B is correct. For a Starknet user holding STRK and using AVNU and Vesu daily, Tongo is a one-step addition to their existing workflow — same wallet, same network, STRK payment. Aleo requires: bridge STRK to Aleo equivalent, learn Aleo\'s interface, execute the private transaction, bridge back. Each bridging step introduces smart contract risk, time delay, and fees. The privacy mechanism quality may be comparable — but user experience friction is a real adoption barrier, and Tongo wins on friction for the Starknet user base.',
    },
    {
      question: 'A DeFi researcher claims "Tongo is just a money laundering tool like Tornado Cash." Write the specific technical counter-argument.',
      options: [
        'A. Tongo is not a money laundering tool because it charges fees that go to legitimate developers',
        'B. Tongo\'s viewing key architecture enables selective, revocable disclosure to authorities — a regulator with a court order can compel the key holder to reveal their transaction history. Tornado Cash\'s pool mechanism structurally prevents any disclosure. These are categorically different privacy models.',
        'C. Tongo is not a money laundering tool because it is built on Starknet, which is regulated',
        'D. No on-chain privacy protocol should be called a money laundering tool without specific evidence',
      ],
      correct: 1,
      hint: 'What specific technical feature of Tongo makes it compatible with lawful authority disclosure, and how does this differ from Tornado Cash\'s architecture?',
      explanation: 'B is correct. The specific technical counter-argument: Tongo\'s viewing key allows controlled disclosure when lawfully compelled — the privacy is analogous to a bank\'s duty of confidentiality, which is overridden by court orders. Tornado Cash\'s design has no disclosure mechanism — no court order can compel disclosure because the mechanism structurally eliminates the audit trail. The claim conflates two categorically different privacy architectures. A correct technical critique of Tongo would need to address the viewing key specifically — claiming the viewing key is insufficient compliance or can be destroyed before an audit request.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'Post-Tornado Cash OFAC sanctions, a regulated UK fund wants to use Tongo for portfolio privacy on their $30M Starknet allocation. They ask their compliance officer to assess: (1) what legal steps they must complete before transacting, (2) what Tongo\'s viewing key architecture enables that Tornado Cash did not, (3) what the residual regulatory risk is despite the viewing key distinction.',
      scoringCriteria: [
        'Legal steps before transacting: obtain specialist counsel legal opinion specifically addressing Tongo viewing key architecture under UK financial regulations and OFAC secondary sanctions risk; document the legal basis in compliance manual; notify board of residual regulatory uncertainty; set up internal access to the viewing key by compliance officer before first transaction',
        'What viewing keys enable: selective, revocable disclosure to FCA, courts, or OFAC under lawful compulsion — the same audit capability a bank provides. Tornado Cash cannot provide this because the pool mechanism permanently breaks the audit trail for all transactions.',
        'Residual risk: viewing key compliance path has not been validated in binding UK or EU court precedent as of current data. The legal opinion is a reasonable-basis standard, not a certainty. First-mover regulatory risk remains for early institutional adopters.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Tongo quarterly TVL data: Q1 $8.2M (1.0% of Starknet TVL), Q2 $14.7M (1.8%), Q3 $22.1M (2.6%), Q4 $31.5M (3.5%). Starknet total TVL has grown from $820M to $900M over the same period. Calculate Tongo\'s quarter-on-quarter TVL growth rate for each quarter. Identify the growth pattern (accelerating, stable, decelerating). State what type of depositor would be most consistent with this pattern.',
      scoringCriteria: [
        'Q1→Q2: ($14.7M - $8.2M) / $8.2M = 79% growth. Q2→Q3: ($22.1M - $14.7M) / $14.7M = 50% growth. Q3→Q4: ($31.5M - $22.1M) / $22.1M = 43% growth.',
        'Pattern: decelerating — growth rate falling from 79% to 50% to 43% per quarter, though absolute TVL continues to rise',
        'Decelerating growth at a high base is consistent with an early adopter wave that is maturing — the initial enthusiast users have already deposited, and the next growth phase requires either new user type conversion (institutional) or broader awareness. This is a normal S-curve inflection point, not a failure signal.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A Starknet community member posts: "Tongo is just a money laundering tool like Tornado Cash — Starknet should ban it." Write a two-sentence response that is accurate about both the technology and its legitimate use cases. Your response must not dismiss the concern, must acknowledge what happened with Tornado Cash, and must explain the specific architectural difference.',
      scoringCriteria: [
        'Acknowledges the concern is legitimate: Tornado Cash was sanctioned precisely because its mixer design enabled money laundering without any compliance path — the concern about on-chain privacy protocols enabling criminal activity has a real historical basis',
        'Accurately explains the specific architectural difference: Tongo\'s viewing key architecture allows the holder to grant auditors or regulators access to their transaction history under lawful compulsion — unlike Tornado Cash, which permanently broke the audit trail. This design makes Tongo compatible with the same compliance framework that banks use (confidential by default, auditable under court order).',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L5.5 — Long-Term Thesis
// TYPE A — Dominant concept: three independent thesis frameworks
// evaluate Starknet's long-term position — technology, developer
// ecosystem, and application layer — each with specific
// falsifiability conditions.
// ─────────────────────────────────────────────────────────────

export const LAB5_LESSON_5 = {
  id: 'l5-5-long-term-thesis',
  title: 'Long-Term Thesis',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
In 1997, Jeff Bezos wrote Amazon's first shareholder letter. It contained a line that became famous: "It's all about the long term." He also wrote something less quoted: "We will make bold rather than timid investment decisions where we see a sufficient probability of gaining market leadership advantages." He was not saying Amazon would definitely win. He was saying the thesis was strong enough to justify large bets on uncertain outcomes.

A good investment thesis for Starknet — or any emerging technology — has three properties: it identifies a specific mechanism by which the technology creates value, it defines what evidence would confirm the thesis, and it defines what evidence would falsify it. A thesis that cannot be falsified is not a thesis — it is a hope.

This lesson presents three independent thesis frameworks for evaluating Starknet's long-term position. Each one is separately evaluable. Each one can be true independently of the others. And each one has a specific falsifiability condition — the data that, if observed, would indicate the thesis is not playing out.

THESIS 1 — THE TECHNOLOGY THESIS

Claim: STARKs become the dominant ZK proof system as global blockchain transaction volumes scale to mainstream levels.

Mechanism: as transaction volume grows, the bottleneck shifts from "can we process this?" to "can we verify this on Ethereum affordably?" STARKs scale more efficiently than SNARKs at very high volume (recursive proof composition compounds the advantage). The trusted setup concern of SNARKs, while manageable at current scale, becomes a more material governance risk as stakes increase. STARKs have no such concern by design.

Evidence that would confirm the thesis:
— Ethereum adoption of STARK-based verification for its own operations (direct institutional endorsement)
— Major SNARK-based chains migrating to STARK proofs as their primary proof system
— STARK proof generation becoming faster than SNARK generation through prover hardware improvements (removing the current cost disadvantage)

Falsifiability condition: if SNARK-based ZK rollups (ZKSync, Polygon zkEVM) achieve 10× Starknet's TVL and user count at mainstream scale without evidence of trust-assumption problems, the technology differentiation is insufficient to drive adoption — the proof system choice matters less than developer ecosystem and UX at scale.

THESIS 2 — THE DEVELOPER ECOSYSTEM THESIS

Claim: Cairo fluency becomes a premium skill as ZK applications expand beyond DeFi — into identity, gaming, healthcare, and government applications — where ZK-native development is required.

Mechanism: EVM-compatible ZK rollups allow Solidity developers to deploy existing Ethereum applications. But genuinely ZK-native applications — those that require ZK proofs at the application level, not just at the rollup level — require Cairo or a comparable ZK-native language. As these applications emerge, Cairo developers are uniquely positioned to build them. Early Cairo fluency compounds into a hard-to-replicate advantage.

Evidence that would confirm the thesis:
— Major non-DeFi applications (ZK identity systems, ZK healthcare analytics, ZK government credentials) deploying on Cairo
— Cairo developer salaries rising relative to Solidity developer salaries (market pricing the scarcity)
— University courses, bootcamps, and corporate training programs specifically teaching Cairo (institutional investment signals belief in the skill's value)

Falsifiability condition: if ZK-native application development on EVM-compatible chains becomes as capable as on Cairo (through future ZK compiler improvements or new ZK-compatible Solidity dialects), the Cairo advantage disappears. In that case, the larger Solidity community captures the ZK application layer without needing to learn Cairo.

THESIS 3 — THE APPLICATION LAYER THESIS

Claim: first-mover advantages in DeFi liquidity and user network effects compound on Starknet — Ekubo's 92% DEX market share and Vesu's lending depth create self-reinforcing advantages that are structurally hard to displace.

Mechanism: DeFi protocols generate network effects through liquidity. More liquidity → better prices → more users → more trading fees → more LP rewards → more liquidity. This flywheel is self-reinforcing. The first AMM to achieve depth on any chain typically maintains dominance because challengers face the bootstrapping problem: you cannot offer good prices without liquidity, and you cannot attract liquidity without good prices. Ekubo's 92% market share is not maintained by being technically superior — it is maintained by having liquidity that competitors cannot easily replicate.

Evidence that would confirm the thesis:
— Ekubo maintains above 75% Starknet DEX market share for 24+ consecutive months despite new entrants
— Vesu maintains above 50% lending TVL for 24+ consecutive months
— Starknet protocols with 12+ months of operation show meaningfully higher protocol integrations (composability depth) than protocols on competing chains at the same stage

Falsifiability condition: if a well-capitalised new entrant successfully bootstraps a Starknet DEX above 30% market share in 12 months through sustained liquidity incentives, the flywheel advantage is not as durable as claimed. This would suggest that liquidity on Starknet is more mercenary (following incentives) than sticky (driven by actual trading need).

THE COUNTER-THESIS

An intellectually honest thesis presentation must include the strongest counter-argument.

The strongest counter-thesis to Starknet: EVM-compatible ZK rollups (ZKSync, Polygon zkEVM) capture developer mindshare at scale because the 150,000-person Solidity developer base never needs to learn Cairo. The applications they build on EVM-compatible chains become "good enough" versions of everything Cairo can build natively. STARK proofs don't provide enough additional security value (in practice, not in theory) to justify the switching cost. Starknet gets squeezed: Arbitrum takes the TVL-maximising position and ZKSync takes the ZK-rollup position, leaving Cairo-native development as a niche.

For this counter-thesis to be correct: (1) EVM-compatible ZK chains must achieve comparable or better UX to Starknet (closing the Account Abstraction gap) and (2) no major non-DeFi ZK application category must emerge that requires Cairo-level ZK-native development. Both are plausible. Neither is inevitable.

The thesis investor's bet: the counter-thesis assumes ZK-native development remains as achievable on EVM-compatible chains as on Cairo. The thesis investor bets that it does not — that genuinely ZK-native applications (where the proof is part of the application logic, not just the rollup infrastructure) require Cairo-level design and will emerge at scale.

That bet is not yet proven or disproven as of current data. That is what makes it a thesis.
  `.trim(),

  keyTakeaway: `Three independent thesis frameworks evaluate Starknet's long-term position — technology (STARKs dominate at scale), developer ecosystem (Cairo fluency becomes a premium skill for ZK-native apps), and application layer (liquidity flywheels compound) — and the strongest counter-thesis is that EVM-compatible chains build "good enough" versions of everything Cairo can natively, without requiring developers to switch.`,

  visualPrompt: `A three-column thesis framework card. Column 1 "Technology Thesis": claim (STARKs dominant at scale), mechanism (recursive proofs + no trusted setup), confirmation signal (Ethereum adopts STARKs), falsification (SNARKs achieve 10× TVL without trust issues). Column 2 "Developer Ecosystem Thesis": claim (Cairo = premium skill for ZK-native apps), mechanism (EVM chains cannot do truly ZK-native), confirmation (non-DeFi ZK apps on Cairo), falsification (EVM chains achieve ZK-native parity). Column 3 "Application Layer Thesis": claim (liquidity flywheels compound), mechanism (Ekubo 92% market share is self-reinforcing), confirmation (market share holds 24+ months), falsification (new entrant reaches 30% in 12 months). Below all three: "Counter-thesis: EVM-compatible chains capture mindshare → Cairo becomes niche. This thesis is not yet proven or falsified."`,
  visualType: 'static',
  visualUrl: 'starknet-three-thesis-frameworks',

  examples: [
    {
      contextTag: '[Analyst testing the technology thesis against current data]',
      context: 'An analyst is evaluating which of the three thesis frameworks is most supported by current Starknet data: TVL growth 40%, developer count growth 25%, transaction count growth 150%.',
      scenario: 'She maps each growth metric to the thesis it most directly supports. Transaction count growth 150%: most consistent with the Application Layer Thesis — actual usage is accelerating, which feeds the liquidity flywheel. Developer count growth 25%: consistent with the Developer Ecosystem Thesis — the Cairo developer pool is growing, though still much smaller than Solidity. TVL growth 40%: consistent with both the Application Layer Thesis and the Technology Thesis, but TVL growth alone does not specifically validate technology choice.',
      outcome: 'Her analysis: "The 150% transaction count growth most strongly supports the Application Layer Thesis — actual protocol usage is accelerating at a rate that suggests the liquidity flywheel is activating. The Developer Ecosystem Thesis is the weakest current signal (25% growth, still 1:50 vs Solidity). The Technology Thesis is neither confirmed nor challenged by this data — it requires different evidence (Ethereum\'s own proof system choices, SNARK-based chain behaviour at scale)."',
    },
    {
      contextTag: '[Testing the falsifiability of the application layer thesis]',
      context: 'A new Starknet DEX launches in Q1 with $20M in liquidity mining incentives. By Q3, it holds 28% of Starknet\'s DEX market share.',
      scenario: 'The analyst checks the falsifiability condition: "If a well-capitalised new entrant successfully bootstraps above 30% market share in 12 months through sustained incentives, the flywheel advantage is not as durable as claimed." The new entrant reached 28% — very close to the 30% threshold. She investigates: the 28% market share is almost entirely concentrated in one incentivised pool. Organic (non-incentivised) trading volume on the new DEX is 8%, vs Ekubo\'s 84% organic share.',
      outcome: 'The analyst concludes: "The falsifiability threshold of 30% was approached but not reached, and the 28% share is largely incentive-driven. The underlying thesis remains intact: when incentives are stripped, the natural liquidity gravity returns to Ekubo. The relevant falsifiability test was not yet triggered — it requires 30%+ organic market share, not total market share. Continue monitoring organic volume after incentive period ends."',
    },
    {
      contextTag: '[Counter-thesis stress test]',
      context: 'ZKSync Era announces that it has successfully implemented native Account Abstraction support equivalent to Starknet\'s, and that major Ethereum DeFi protocols are now deploying on ZKSync with full AA features.',
      scenario: 'An analyst stress-tests whether this announcement changes the thesis. She checks her theses: Technology Thesis — unchanged (STARK vs SNARK distinction remains regardless of AA). Developer Ecosystem Thesis — unchanged (Cairo fluency still required for ZK-native apps even if ZKSync adds AA). Application Layer Thesis — slightly weakened (ZKSync AA reduces the UX differentiation, making it a more direct substitute for Starknet for users who valued AA)',
      outcome: 'Her update: "ZKSync\'s AA implementation reduces Starknet\'s UX dimension advantage from 4/5 to potentially 3.5/5 in the competitive scoring framework. The Technology Thesis and Developer Ecosystem Thesis are unchanged — they depend on proof system and language choice, not UX architecture. The Application Layer Thesis depends on whether the existing Starknet liquidity flywheel can retain users despite reduced UX differentiation. Monitor whether Starknet\'s user growth decelerates following ZKSync\'s AA launch."',
    },
  ],

  guidedPractice: [
    {
      question: 'The Technology Thesis claims STARKs become dominant at mainstream scale. What is the specific mechanism that would drive this outcome?',
      options: [
        'A. STARKs are more aesthetically elegant than SNARKs — developers prefer them',
        'B. As transaction volume scales, STARK recursive proof composition becomes increasingly cost-efficient per transaction, while SNARKs\' verification costs do not compress as efficiently — making STARKs cheaper per transaction at very high volumes',
        'C. STARKs will be mandated by Ethereum\'s governance process',
        'D. SNARKs will eventually be hacked, forcing a migration to STARKs',
      ],
      correct: 1,
      hint: 'What specific cost mechanism changes at high transaction volumes, and which proof system benefits more from that change?',
      explanation: 'B is correct. The mechanism is recursive proof composition: STARKs can recursively compress many proofs into one, amortising verification cost exponentially as volume grows. SNARKs also support some recursive composition, but STARKs\' mathematical properties make this more naturally efficient at extreme scale. As transaction volumes grow from millions to billions per day, the per-transaction verification cost advantage of STARKs over SNARKs widens. This is the mechanism — not preference, not mandate, not SNARK failure.',
    },
    {
      question: 'The Developer Ecosystem Thesis claims Cairo fluency becomes a premium skill. What is the specific falsifiability condition that would indicate this thesis is wrong?',
      options: [
        'A. If no new Cairo bootcamps are announced',
        'B. If ZK-compatible Solidity dialects or EVM ZK compilers mature to the point where EVM-compatible chains can build ZK-native applications equally as well as Cairo — making Cairo\'s ZK-native advantage disappear',
        'C. If Cairo developer salaries fall relative to Solidity',
        'D. If Starknet\'s TVL falls below ZKSync\'s',
      ],
      correct: 1,
      hint: 'The thesis depends on Cairo being uniquely capable for ZK-native development. What specific development would remove that unique capability?',
      explanation: 'B is correct. The thesis rests on Cairo being uniquely positioned for ZK-native development — applications where ZK proofs are part of the application logic, not just the rollup infrastructure. If EVM-compatible chains develop ZK compilers or Solidity dialects that achieve the same capability, Solidity developers on ZKSync or Polygon zkEVM could build the same ZK-native applications without learning Cairo. In that scenario, the 150,000-person Solidity developer base captures the ZK application layer and Cairo\'s premium skill narrative does not materialise.',
    },
    {
      question: 'Starknet\'s Ekubo holds 92% of Starknet DEX market share. According to the Application Layer Thesis, what mechanism maintains this dominance?',
      options: [
        'A. Ekubo is technically superior to all other DEXs and users recognise this',
        'B. The liquidity flywheel: more liquidity enables better trade prices, which attracts more trading volume, which generates more fees for liquidity providers, which attracts more liquidity providers — a self-reinforcing cycle that competitors cannot easily break without large capital commitment',
        'C. Ekubo has an exclusive arrangement with the Starknet Foundation preventing competition',
        'D. There are regulatory barriers preventing other DEXs from operating on Starknet',
      ],
      correct: 1,
      hint: 'How does liquidity depth create a self-reinforcing advantage for the first DEX to achieve it?',
      explanation: 'B is correct. The flywheel mechanism: (1) deep liquidity → better trade prices (less slippage), (2) better prices → more trading volume, (3) more volume → more fee revenue for liquidity providers, (4) more LP revenue → more capital deployed into the DEX, (5) more capital → deeper liquidity → back to (1). A new entrant cannot break this cycle by being slightly better technically — they need to simultaneously offer better prices (requires more liquidity) AND attract liquidity providers (requires more volume). This bootstrapping problem is the moat.',
    },
    {
      question: 'The falsifiability condition for the Application Layer Thesis is: a new Starknet DEX reaches 30%+ organic market share in 12 months. Why is "organic" the key word here?',
      options: [
        'A. Organic growth is always better than incentivised growth',
        'B. Incentive-driven market share disappears when incentives end — it is not a test of whether the flywheel has been disrupted, only of whether capital can be temporarily rented. Organic market share (trading activity not funded by incentives) tests whether users genuinely prefer the new protocol over Ekubo.',
        'C. Organic is a regulatory requirement for DEX market share reporting',
        'D. Organic volume is more profitable per transaction than incentivised volume',
      ],
      correct: 1,
      hint: 'If a DEX attracts liquidity by paying higher incentives, what happens to that liquidity when the incentives stop?',
      explanation: 'B is correct. Incentivised market share is mercenary capital — it follows rewards, not genuine competitive preference. If a new DEX reaches 30% market share through $20M in liquidity mining, and that share disappears when mining ends, the flywheel thesis is not falsified — Ekubo\'s liquidity depth remained the durable preference. The thesis is falsified only if a new entrant captures 30%+ market share that persists after incentives end, indicating that users genuinely prefer it over Ekubo for reasons other than short-term rewards.',
    },
    {
      question: 'Starknet shows 12-month data: TVL growth 40%, developer count growth 25%, transaction count growth 150%. Which thesis is most directly supported by the 150% transaction count growth — and which thesis is neither confirmed nor challenged by this data?',
      options: [
        'A. Developer Ecosystem Thesis is most supported; Technology Thesis is neither confirmed nor challenged',
        'B. Application Layer Thesis is most supported (150% tx growth feeds the liquidity flywheel); Technology Thesis is neither confirmed nor challenged (proof system comparison requires different evidence)',
        'C. Technology Thesis is most supported; Developer Ecosystem Thesis is neither confirmed nor challenged',
        'D. All three theses are equally supported by 150% transaction growth',
      ],
      correct: 1,
      hint: 'Map each growth metric to the thesis mechanism it most directly tests. What specific evidence is needed to confirm or challenge the Technology Thesis?',
      explanation: 'B is correct. 150% transaction count growth feeds the Application Layer Thesis mechanism directly: more actual use → more volume → more fees → more LP rewards → more liquidity → more use. This is the flywheel activating. The Technology Thesis requires different evidence — specifically, how Ethereum chooses its own proof systems and whether SNARK-based chains hit proof verification cost ceilings at scale. Neither happening nor not happening is captured by transaction count growth. Developer count growth (25%) is the signal for the Developer Ecosystem Thesis — still positive, but slower than needed to close the Solidity gap.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: '12-month Starknet ecosystem data: TVL +40% ($800M → $1.12B), developer count +25% (3,000 → 3,750), transaction count +150% (60M → 150M transactions), Ekubo DEX market share: held at 88% (down from 92% — a new DEX launched and captured 4% organically). Map each data point to the thesis it most strongly supports or challenges. Rate each thesis as "confirmed," "neutral," or "challenged" based on the data. Overall: is the Starknet investment thesis strengthening or weakening?',
      scoringCriteria: [
        'Transaction count +150%: supports Application Layer Thesis (flywheel activating) — confirmed',
        'Developer count +25%: consistent with Developer Ecosystem Thesis trajectory but still 1:40 ratio vs Solidity — neutral (growing but slow)',
        'TVL +40%: supports Application Layer Thesis — neutral to confirmed (in line with thesis but not accelerating)',
        'Ekubo market share from 92% to 88% (4% organic loss to new entrant): Application Layer Thesis challenged if trend continues — new entrant organically reaching 4% in 12 months suggests the flywheel is not impenetrable. Overall: Application Layer Thesis neutral-to-challenged on market share; Technology Thesis unchanged; Developer Ecosystem Thesis progressing slowly.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'Evaluate the strongest counter-thesis to Starknet: EVM-compatible ZK rollups capture developer mindshare, STARK proofs don\'t provide enough additional security value to justify the Cairo rewrite cost, and Starknet gets squeezed between Arbitrum (TVL leader) and ZKSync (EVM-ZK leader). For the counter-thesis to be correct, what specific conditions must hold? What evidence currently exists for and against each condition?',
      scoringCriteria: [
        'Condition 1 for counter-thesis: EVM-compatible chains must capture developer mindshare → Evidence for: ZKSync and Polygon zkEVM have more deployed protocols due to EVM compatibility. Evidence against: Cairo developer count growing 25% annually, AA-native apps unique to Starknet',
        'Condition 2: STARK security premium insufficient to justify Cairo → Evidence for: no documented SNARK ceremony failure in major chains. Evidence against: no comparable scale test has occurred; STARK advantage at mainstream scale is untested',
        'Condition 3: Starknet squeezed between Arbitrum and ZKSync → Evidence for: Arbitrum\'s TVL dominance ($20B vs $800M). Evidence against: Starknet\'s AA-native ecosystem and gaming category have no ZKSync equivalent',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a three-sentence investment thesis for Starknet from a 5-year perspective. Include: (1) the specific mechanism creating long-term value, (2) the condition under which the thesis is strongest, (3) the single assumption that, if wrong, would invalidate the thesis. The thesis must be falsifiable — not just "blockchain will grow."',
      scoringCriteria: [
        'Sentence 1 identifies a specific mechanism: e.g., "Starknet\'s STARK proof system and native Account Abstraction create architectural advantages that compound as ZK-native applications (identity, healthcare, gaming) require proof-level integration rather than rollup-level infrastructure."',
        'Sentence 2 identifies the condition of maximum strength: e.g., "The thesis is strongest if non-DeFi ZK applications requiring Cairo-level design emerge and achieve scale — every such application permanently expands the addressable market for Cairo developers and Starknet\'s ecosystem."',
        'Sentence 3 identifies a specific falsifying assumption: e.g., "This thesis fails if EVM-compatible ZK compilers mature to achieve ZK-native application development equivalence with Cairo — in that scenario, the 150,000-person Solidity developer base builds every ZK application without needing to learn Cairo."',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 5 — AGGREGATE SIMS, BUILD TASK, BOSS
// ─────────────────────────────────────────────────────────────

export const LAB5_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: [
    'judgment-dataInterpret',
    'judgment-riskAssess',
    'judgment-communication',
  ],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 5 lessons. Tests roadmap analysis, ZK use case assessment, four-dimension competitive scoring, Tongo privacy mechanics, and three-thesis framework application. No lesson labels. No hints.',
};

export const LAB5_BUILD_TASK = {
  id: 'ecosystem-lab-5-build',
  title: 'Starknet Thesis — Choose Your Argument',
  labProgressionNumber: 5,
  selectionMode: 'user-choice-2',
  type: 'research-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–90 minutes',

  availableTasks: [
    {
      id: 'build-5a-thesis',
      title: 'Option A: Long-Form Thesis',
      estimatedMinutes: 80,
      description: `Identify one specific Starknet capability that creates a durable competitive advantage. Build a structured argument with: (1) three supporting arguments (each citing specific data or mechanism), (2) the counter-argument you are most aware of, (3) one falsifiability condition — the data that, if observed, would require you to revise your thesis. Do not write "blockchain is growing" — write a thesis that can be proven wrong. Output: thesis.md`,
      scoringCriteria: [
        'One specific capability (not "Starknet has many advantages")',
        'Three supporting arguments with specific data or mechanism — not just assertions',
        'Counter-argument acknowledged honestly — not dismissed',
        'Falsifiability condition is specific and observable — not "if the thesis fails"',
      ],
    },
    {
      id: 'build-5b-matrix',
      title: 'Option B: Competitive Positioning Matrix',
      estimatedMinutes: 75,
      description: `Score Starknet vs three L2 competitors (you choose which three) across all four competitive dimensions from L5.3. For each cell: provide a specific data point justifying the score. Conclude with: one dimension where Starknet\'s position is improving fastest, one where it is most at risk, and one sentence synthesis of whether Starknet\'s competitive position is strengthening or weakening overall. Output: competitive-matrix.md`,
      scoringCriteria: [
        'All four dimensions scored for Starknet + three competitors (16 cells total)',
        'Each cell has a specific data point — not a general impression',
        'Improvement and risk dimensions are identified with justification',
        'Synthesis conclusion is specific and directional — not "it depends"',
      ],
    },
  ],

  outputType: 'written-document',
  outputFormat: 'markdown',
  outputPath: '/junior/lab-05-zk-vision/',
};

export const LAB5_BOSS = {
  phase1: {
    id: 'ecosystem-lab-5-boss-phase1',
    title: 'Lab 5 Boss — Phase 1: ZK Vision Gauntlet',
    description: 'Unlimited attempts. Hints available. 8 tasks from pool of 20. Pass 80% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,
    taskPool: { totalTasks: 20, drawPerAttempt: 8, passMark: 0.80 },
  },

  phase2: {
    id: 'ecosystem-lab-5-boss-phase2',
    title: 'Lab 5 Boss — Phase 2: ZK Vision Certification',
    description: 'No hints. Portfolio push on 100% pass. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are presenting a Starknet ecosystem analysis to the investment committee of a multi-strategy crypto fund. They have capital allocated to Arbitrum and ZKSync already. They are evaluating whether to allocate to Starknet.

TASK 1 — Roadmap Risk Assessment
The committee asks: "What are the three most important risks on Starknet's roadmap that, if they don't ship on time, materially affect our investment thesis?" For each: name the roadmap item, the risk it addresses, and what remains exposed if it is delayed 12 months.

TASK 2 — Competitive Positioning Defence
The committee challenges: "ZKSync just announced native Account Abstraction support equivalent to Starknet's. How does this change Starknet's competitive position?" Respond using the four-dimension framework. Be specific about which dimensions are affected and which are not.

TASK 3 — Thesis Statement
The committee asks for a one-paragraph investment thesis for Starknet, 150 words maximum. Requirements: one specific mechanism, one confirmation signal to monitor quarterly, one falsifiability condition. If you cannot articulate a falsifiable thesis, the committee will not allocate.
    `.trim(),

    scoringCriteria: [
      'Task 1: All three roadmap items (decentralisation, Volition, recursive proofs) identified with their specific risk addressed and their delayed-12-months exposure. Sequencer decentralisation delay = centralisation risk persists (censorship + outage). Volition delay = no per-transaction cost optimisation, limiting gaming/micro-transaction use cases. Recursive proofs delay = throughput ceiling remains, limiting mainstream-scale expansion.',
      'Task 2: ZKSync AA adoption affects UX dimension (from 3/5 toward 4/5 — closing the gap). Proof system dimension unchanged (STARK vs SNARK unaffected by AA). Developer ecosystem unchanged. Application ecosystem slightly affected (ZKSync more attractive for UX-focused protocols). Net assessment: UX advantage narrows but does not disappear if implementation quality differs; proof system and developer ecosystem advantages unchanged.',
      'Task 3: One specific mechanism (not generic "blockchain growing"). Quarterly confirmation signal is specific and observable. Falsifiability condition is specific and observable — not "if the thesis fails" but a named data point at a named threshold.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/junior/lab-05-zk-vision/',
      files: [{ filename: 'zk-vision-investment-brief.md', type: 'narrative' }],
      commitMessage: 'Passed Lab 5 ZK Vision — Junior Ecosystem Deep Dive',
      badgeEarned: 'ZK Vision Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const LAB5_META = {
  id: 'ecosystem-junior-lab-5',
  title: "Starknet's ZK Vision and Roadmap",
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'junior' as const,
  labNumber: 5,
  estimatedHours: 5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Labs 1–4 complete',
  description: 'Roadmap mechanics (decentralisation, Volition, recursive proofs), ZK use cases beyond DeFi, four-dimension competitive framework, Tongo privacy business model, and three-thesis long-term investment analysis.',
  nextLab: 'Intermediate Level — Lab 6: Protocol Research Methodology',
};
