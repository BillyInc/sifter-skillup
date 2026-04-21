// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// JUNIOR · LAB 2 — STARK TECHNOLOGY AND ZK FUNDAMENTALS
// 5 Lessons + Aggregate Sims + Build Task + Boss Battle
//
// Lesson type classification:
//   L2.1 — TYPE A: conceptual mechanism (what STARKs prove vs don't prove)
//   L2.2 — TYPE A: process flow, step-by-step lifecycle, cause/effect
//   L2.3 — TYPE A: conceptual comparison (Cairo VM, STARK vs SNARK)
//   L2.4 — TYPE A: user-facing features, cause/effect, policy
//   L2.5 — TYPE A: comparison framework, judgment, no derivation
//
// Learner: zero DeFi knowledge. Plain English first, always.
// Every term: real-world situation → what it does → then name it.

// ─────────────────────────────────────────────────────────────
// L2.1 — What STARKs Prove and Why It Matters for Users
// TYPE A — Dominant concept: a STARK proof proves that a
// computation was executed correctly — not that the inputs
// were honest or the protocol was safe.
// ─────────────────────────────────────────────────────────────

export const LAB2_LESSON_1 = {
  id: 'l2-1-what-starks-prove',
  title: 'What STARKs Prove and Why It Matters for Users',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
In 2015, a group of cryptographers published a paper that changed what was considered mathematically possible. They showed that one party could prove to another that they had correctly performed a computation — without revealing any of the inputs, and without the verifier having to redo the computation themselves. The verifier could check a short mathematical certificate and be certain the computation was done correctly.

Before this, if you wanted to trust a calculation, you had two options: do it yourself, or trust the person who did it. This research created a third option: receive a proof so mathematically watertight that you could verify the result was correct without trusting anyone and without repeating the work. This was the breakthrough that made Starknet possible.

The certificates this research produced are called zero-knowledge proofs. Starknet uses a specific type called STARKs. Before you can analyse any Starknet protocol intelligently, you need to understand one thing precisely: what a STARK proof actually proves — and crucially, what it does not prove.

WHAT A STARK PROOF PROVES

Imagine a locksmith gives you a locked safe and tells you: "The correct combination is stored inside an envelope inside the safe. The envelope is sealed. I can prove to you mathematically that I know what's in the envelope, without opening the safe and without telling you the combination."

A STARK proof works on this same principle, applied to computation. On Starknet, when a batch of transactions is processed, the system generates a STARK proof saying: "These transactions were executed correctly. Every swap produced the correct output. Every loan was recorded accurately. Every balance was updated according to the rules. I can prove this to Ethereum without Ethereum re-executing every single transaction."

Ethereum then checks this mathematical certificate. If the certificate is valid, Ethereum accepts the state update as permanent. The key property: Ethereum does not process each transaction individually. It verifies one certificate that covers all of them. This is what makes Starknet fast and cheap.

When a developer writes Cairo code, it is written for humans to read — not for a computer to run directly. Compilation is the process of translating that human-readable code into a format the Starknet network can actually execute. The Cairo VM — Cairo's execution environment — runs the compiled instructions and produces a STARK proof of that execution. Think of compilation like translating a recipe from English into a precise set of robot-kitchen instructions that a machine can follow exactly.

WHAT A STARK PROOF DOES NOT PROVE

Here is the part that confuses most people and matters enormously for analysing DeFi protocols.

A STARK proof proves that the computation ran correctly according to the rules written in the code. It does not prove that:

— The code had no bugs. A correctly-executed buggy program produces a valid proof of a buggy outcome.
— The inputs came from trustworthy sources. If a price oracle provided a wrong price, the proof confirms that the computation used that wrong price correctly.
— The protocol was designed honestly. A malicious protocol can generate perfectly valid STARK proofs while stealing user funds, as long as the theft is consistent with what the code says.

Think of it this way. A calculator will produce a correct answer to any arithmetic you give it. If you type 2 + 2, it returns 4 — correctly. If you type 2 + 2 to calculate the amount a user should receive and your code has a bug that subtracts 1 from every result, the calculator correctly returns 3. The calculation was correct. The result is wrong. A STARK proof is that calculator applied to Starknet transactions. It verifies that the machine did exactly what the code said. If the code was buggy, the proof confirms the bug was applied correctly.

This distinction matters for every risk assessment in this track. "The protocol uses STARKs" does not mean "the protocol is safe." It means the execution can be verified. You still need audits, code review, and track record to know whether the code being executed is sound.

USER-LEVEL IMPLICATIONS

For you as a user, two things follow from understanding what STARKs prove:

First: your transaction cannot be secretly altered after being included in a proof. Once the STARK proof containing your swap is verified by Ethereum, the outcome is mathematically locked. No one can change what happened to your funds in that batch — the mathematics make it impossible.

Second: if a STARK proof is rejected by Ethereum — if Ethereum's verifier contract says "this proof is invalid" — the entire batch of transactions is not accepted. The transactions in that batch do not happen. They are re-sequenced in the next batch. Your funds are not lost — the transaction simply did not go through and will be retried.

These two implications together define Starknet's security model from a user's perspective: execution is protected but code quality is not. Both matter. Only one is guaranteed by the proof system.
  `.trim(),

  keyTakeaway: `A STARK proof guarantees that computation was executed exactly as the code specified — it does not guarantee the code had no bugs, the inputs were honest, or the protocol was safe. Both execution integrity and code quality are needed for user safety.`,

  visualPrompt: `Two-column diagram. Left column labelled "WHAT STARKS PROVE": checklist with green ticks beside each item — "Execution followed the code exactly", "Every balance update is consistent", "Ethereum can verify without re-executing". Right column labelled "WHAT STARKS DO NOT PROVE": checklist with red crosses — "The code had no bugs", "The price oracle was accurate", "The protocol design is honest". Below both columns, a single box labelled "IMPLICATION": "A valid proof on a buggy protocol = correctly proven theft." Clean, no text inside icons. Labels outside shapes.`,
  visualType: 'static',
  visualUrl: 'stark-proof-proves-vs-not-proves',

  examples: [
    {
      contextTag: '[Attacker exploiting a smart contract bug, valid proof]',
      context: 'A Starknet lending protocol has a bug in its liquidation logic. When a specific sequence of calls is made, the protocol allows a user to withdraw more than their collateral is worth — effectively draining other depositors\' funds.',
      scenario: 'An attacker discovers the bug and executes the exploit. The sequence of transactions is unusual but valid according to the protocol\'s code. Starknet\'s prover generates a STARK proof for the batch containing the attacker\'s transactions. Ethereum verifies the proof and accepts it.',
      outcome: 'The proof is valid — the computation was executed exactly as the code specified. The attacker stole $2.3M in user funds, and the STARK proof confirmed every step was mathematically correct. The STARK proof did not protect users from the bug. Only a code audit identifying the vulnerability before deployment could have prevented this.',
    },
    {
      contextTag: '[Proof rejected by Ethereum — what happens to users]',
      context: 'A Starknet proof submitted to Ethereum contains 8,000 transactions from the past two hours. During verification, Ethereum\'s verifier contract identifies an inconsistency and rejects the proof.',
      scenario: 'All 8,000 transactions in that batch are not accepted on Ethereum. Users who submitted swaps, lending deposits, and staking actions in the past two hours see their transactions return to pending status.',
      outcome: 'No funds are lost. The rejected proof does not mean the transactions were fraudulent — it usually means a technical error in the proof generation process. The sequencer re-includes the transactions in the next batch and generates a new proof. Users experience a delay, not a loss. The proof rejection is a quality control mechanism working as intended.',
    },
    {
      contextTag: '[Oracle feeding wrong price, valid proof still produced]',
      context: 'Pragma — Starknet\'s price oracle — experiences a data feed failure. For 4 minutes, it reports ETH at $1,200 when the actual market price is $1,800. A Starknet lending protocol reads this wrong price and initiates liquidations of ETH-collateralised positions that should not have been liquidated.',
      scenario: 'The liquidation transactions execute correctly according to the protocol\'s code. The code says: "if collateral value < loan value, liquidate." It reads ETH at $1,200. It calculates that collateral is insufficient. It liquidates. Every step is done exactly as specified. Starknet generates a STARK proof confirming all of this.',
      outcome: 'The proof is valid. The liquidations are mathematically proven to have followed the code correctly. But the underlying data was wrong, causing real financial harm to affected users. The STARK proof system proved execution correctness. It could not guarantee oracle accuracy — that is a separate layer of the infrastructure stack, outside what the proof system covers.',
    },
  ],

  guidedPractice: [
    {
      question: 'A Starknet protocol generates a valid STARK proof for a batch of transactions that includes an attacker stealing user funds through a code bug. What does the valid proof tell you?',
      options: [
        'A. The theft did not happen — a valid proof means all transactions were legitimate',
        'B. The theft happened exactly as the buggy code specified — the proof confirms execution correctness, not code correctness',
        'C. The proof system failed — a valid proof should have detected the theft',
        'D. The attacker must have broken Ethereum\'s security to generate a valid proof for stolen funds',
      ],
      correct: 1,
      hint: 'What specifically does a STARK proof guarantee — and what does it say nothing about?',
      explanation: 'B is correct. A STARK proof proves that computation was executed according to the code. If the code contains a bug that allows theft, the proof confirms the theft was executed correctly according to that buggy code. The proof system has no way to evaluate whether the code\'s design was safe or intended. Option A is wrong — valid proofs can confirm harmful outcomes. Option C misunderstands what proof failure means. Option D is wrong — no Ethereum security was broken.',
    },
    {
      question: 'A Starknet proof submitted to Ethereum is rejected by the verifier contract. What happens to the 5,000 transactions included in that batch?',
      options: [
        'A. All 5,000 transactions are permanently cancelled — user funds are lost',
        'B. The transactions are not accepted and return to pending status — they will be included in the next batch and re-proven. No funds are lost.',
        'C. Half the transactions are accepted and half are cancelled — Ethereum processes what it can',
        'D. The transactions are automatically reversed and users receive compensation',
      ],
      correct: 1,
      hint: 'A rejected proof means the batch was not accepted. What happens to transactions that are not included in an accepted batch — are they gone, or pending?',
      explanation: 'B is correct. A rejected proof means Ethereum did not accept that batch\'s state update. The transactions inside it are not finalised — they return to pending and will be re-included in the sequencer\'s next batch. The prover generates a new proof for the new batch. No funds are lost because the transactions simply did not go through yet. Option A incorrectly treats rejection as cancellation with fund loss.',
    },
    {
      question: 'What is compilation in the context of Starknet, and why does it happen before a STARK proof can be generated?',
      options: [
        'A. Compilation is the process of auditing Cairo code for security vulnerabilities before deployment',
        'B. Compilation translates human-readable Cairo code into machine-executable instructions that the Cairo VM can run — only after this translation can the VM execute the code and produce a STARK proof of that execution',
        'C. Compilation is how Starknet compresses transactions before sending them to Ethereum',
        'D. Compilation is the process of converting STARK proofs into a format Ethereum can read',
      ],
      correct: 1,
      hint: 'Recall the Primer L0.3 pipeline: write code → compile → test → deploy. What does compilation produce, and what needs it to happen next?',
      explanation: 'B is correct. Cairo code as written by developers is human-readable. The Cairo VM — Starknet\'s execution environment — needs machine instructions, not human-readable text. Compilation translates the code into the format the VM can execute. Only after the VM executes the compiled instructions can it generate a STARK proof of that execution. Option A describes auditing, not compilation. Option C describes transaction batching. Option D describes proof verification, the opposite direction.',
    },
    {
      question: 'A DeFi analyst evaluating a Starknet protocol reads: "This protocol uses STARK proofs — execution is mathematically guaranteed." Which part of this claim is accurate and which is misleading?',
      options: [
        'A. Both parts are accurate — STARK proofs guarantee execution and therefore safety',
        'B. "Uses STARK proofs" is accurate. "Mathematically guaranteed" overstates what proofs cover — execution according to the code is proven, but code quality, oracle accuracy, and protocol design honesty are not.',
        'C. Both parts are misleading — STARK proofs are unproven technology',
        'D. "Mathematically guaranteed" is accurate. "Uses STARK proofs" may be false — it should be verified independently.',
      ],
      correct: 1,
      hint: 'Separate the two claims: (1) does the protocol use STARKs? (2) what does mathematical guarantee actually cover?',
      explanation: 'B is correct. Starknet protocols do use STARK proofs — that is verifiable. But "mathematically guaranteed" as a standalone claim misleads users into thinking proofs guarantee safety, when they guarantee only execution correctness. A protocol with a perfectly working proof system can still have buggy code, manipulated oracles, or dishonest design. Both proof integrity and code quality are needed for user safety — only one is covered by the proof system.',
    },
    {
      question: 'Your swap transaction is included in a Starknet batch. The STARK proof for that batch is verified and accepted by Ethereum. What can you now say with certainty about your transaction?',
      options: [
        'A. Your swap was executed at the correct market price at the time of submission',
        'B. Your transaction outcome was executed exactly as the code specified, and that outcome is now mathematically irreversible — no one can change what happened to your funds in that batch',
        'C. The protocol you used has no bugs and your funds are permanently safe',
        'D. Your transaction is final but can still be reversed by StarkWare if there is an error',
      ],
      correct: 1,
      hint: 'What does L1 settlement provide once Ethereum accepts the proof? And what does the proof itself guarantee?',
      explanation: 'B is correct. Once Ethereum accepts the STARK proof and the state update is final (L1 settlement), the outcome of your transaction is mathematically irreversible — the mathematics make it impossible for anyone to alter what happened. Option A overstates the guarantee — the proof does not verify that the price input was accurate, only that the calculation using that price was correct. Option C is wrong — proof verification says nothing about code quality. Option D is wrong — L1 settlement is irreversible; StarkWare cannot reverse it.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A STARK proof submitted to Ethereum was rejected by the verifier contract. The batch contained 6,000 transactions processed over the past 90 minutes. A Starknet forum post claims: "The proof rejection means Starknet has been hacked and user funds are at risk." Evaluate this claim. What does the proof rejection actually mean for: (a) the 6,000 transactions in the batch, (b) the sequencer, (c) user funds? State whether the forum post\'s claim is accurate.',
      scoringCriteria: [
        '(a) Correctly identifies: the 6,000 transactions are not accepted on Ethereum — they return to pending status and will be re-included in the next batch',
        '(b) Correctly identifies: the sequencer regroups the transactions and generates a new proof for the next batch — this is a normal error-recovery process',
        '(c) Correctly identifies: user funds are not lost — the transactions simply did not go through yet. The forum post\'s claim is inaccurate — a proof rejection is a quality control event, not a hack.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A new Starknet DeFi protocol launches with the marketing headline: "Every transaction is protected by STARK proof technology — your funds are mathematically secure." The protocol has not been audited. It uses Pragma as its price oracle. Identify the two specific risks that the STARK proof system does NOT protect users against, and state what additional protection each risk requires.',
      scoringCriteria: [
        'Risk 1: Code bugs — the STARK proof verifies execution of the code, not correctness of the code\'s design. An unaudited protocol with bugs can produce valid proofs of buggy, harmful outcomes. Protection required: independent code audit by a recognised security firm.',
        'Risk 2: Oracle manipulation or failure — if Pragma reports a wrong price, the protocol uses that wrong price correctly and the proof confirms it. Protection required: oracle redundancy (multiple price sources), circuit breakers, or maximum deviation checks.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A non-technical investor asks: "This Starknet protocol says the proof is valid — that means my money is safe, right?" Explain in two sentences why a valid proof does not mean the protocol is safe. Your explanation must be accurate and must not use the words "cryptographic", "zero-knowledge", "computation", or "verifier".',
      scoringCriteria: [
        'Accurately conveys that a valid proof confirms the protocol did exactly what its code said — it does not confirm the code was written correctly or safely',
        'Makes the distinction concrete with an example or analogy: a calculator confirms your arithmetic is correct, but if you typed the wrong formula, a correct calculation of the wrong formula still gives you the wrong answer',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L2.2 — Starknet Transaction Lifecycle: Sequencer to L1
// TYPE A — Dominant concept: a Starknet transaction passes through
// five stages from submission to L1 finality — each stage has a
// different level of finality and a different party responsible.
// ─────────────────────────────────────────────────────────────

export const LAB2_LESSON_2 = {
  id: 'l2-2-transaction-lifecycle',
  title: 'Starknet Transaction Lifecycle: Sequencer to L1',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
Think about what happens when you send an international bank transfer. You submit the payment at 3pm. Your bank records it as pending. Your bank sends it to the receiving bank's country through the SWIFT network — this takes hours. The receiving bank processes it overnight. The next morning, it shows as completed in both systems. There were five or six distinct stages between "you pressed send" and "the money arrived." Each stage had a different level of certainty about whether it would complete.

Starknet transactions work the same way. There is a journey between "you submitted a swap" and "that swap is mathematically permanent on Ethereum." Five stages. Each stage means something different. Understanding what each stage means — and who is responsible at each point — is how you assess when a transaction is truly final, and what can go wrong at each step.

STAGE 1 — SUBMITTED (MEMPOOL)
What happens: you sign and send a transaction from your wallet. It enters Starknet's mempool — a waiting area for transactions that have not yet been processed.
What you see: your wallet shows the transaction as pending.
Who is responsible: your wallet and your internet connection.
What can go wrong: you used too low a fee and the sequencer deprioritises your transaction. You submitted to the wrong network (testnet vs mainnet). Your wallet failed to broadcast the transaction.
Timing: less than a second from tap to submission.

STAGE 2 — ACCEPTED ON L2 (SEQUENCER PROCESSED)
What happens: the sequencer picks up your transaction from the mempool, executes it (updates balances, applies the swap, records the action), and includes it in a batch of transactions.
What you see: your new balance appears in your wallet. Voyager shows the transaction as "Accepted on L2."
Who is responsible: the sequencer (currently operated by StarkWare).
What can go wrong: the sequencer could be offline (outage). Your transaction could be excluded by the sequencer for any reason (censorship risk from centralisation). The sequencer could execute the transaction incorrectly (mitigated by the proof system catching errors later).
Timing: seconds to a minute after submission under normal conditions.

STAGE 3 — PROVING (PROOF GENERATION)
What happens: the sequencer sends its batch of transactions to StarkWare's prover service. The prover takes all the transactions in the batch and generates a STARK proof — a mathematical certificate that all of them were executed correctly.
What you see: nothing changes in your wallet. The transaction is still shown as "Accepted on L2."
Who is responsible: StarkWare's prover service.
What can go wrong: proof generation fails (rare but possible — the batch is re-attempted). Proof generation takes longer than usual for large batches.
Timing: minutes to a few hours depending on batch size and network load.

The entity that produces the proof is called the prover — StarkWare's prover service receives batches from the sequencer and generates STARK proofs. The entity that verifies the proof is called the verifier — Ethereum runs a STARK verifier smart contract that checks the proof.

STAGE 4 — PROOF SUBMITTED TO ETHEREUM
What happens: the prover submits the STARK proof to Ethereum's verifier contract. Ethereum processes this as a normal Ethereum transaction — which means it also goes through Ethereum's mempool and block production.
What you see: still "Accepted on L2" on Voyager. The proof submission is visible on Ethereum block explorers as a separate transaction.
Who is responsible: StarkWare's infrastructure submitting to Ethereum.
What can go wrong: Ethereum congestion could delay the proof submission. Gas costs on Ethereum could make proof submission expensive.
Timing: typically within the same window as proof generation.

STAGE 5 — ACCEPTED ON L1 (ETHEREUM VERIFIED)
What happens: Ethereum's verifier contract checks the STARK proof. If valid, Ethereum accepts the state update as permanent. Your transaction is now settled on Ethereum — mathematically irreversible.
What you see: Voyager shows "Accepted on L1" with an Ethereum block number.
Who is responsible: Ethereum's consensus mechanism. At this point, no single entity can alter the outcome.
What can go wrong: extremely rare — if the proof is invalid, Ethereum rejects the entire batch (transactions return to pending, no funds lost). If Ethereum itself experiences a serious incident, but this is the most battle-tested system in DeFi.
Timing: a few hours after the transaction was accepted on L2, depending on batch size and proof generation time.

THE GAP BETWEEN STAGES 2 AND 5

For most users in most situations, Stage 2 (Accepted on L2) is sufficient. Your balance is updated. Your swap has been processed. For the vast majority of DeFi activity — routine swaps, lending deposits, staking — you do not need to wait for Stage 5.

Stage 5 (Accepted on L1) matters when:
— You are moving very large sums where mathematical permanence is required
— You are building a protocol that settles positions between parties and needs absolute finality
— You are bridging funds from Starknet back to Ethereum (Starkgate uses L1 finality as the point at which withdrawal is released)

Knowing which stage your use case requires is a practical skill that every DeFi user on Starknet eventually needs.
  `.trim(),

  keyTakeaway: `A Starknet transaction passes through five stages — submitted, accepted on L2, proving, proof submitted, accepted on L1 — and soft finality (L2 acceptance) is sufficient for most DeFi activity while hard finality (L1 settlement) is required for large withdrawals and cross-chain operations.`,

  visualPrompt: `A horizontal five-stage timeline diagram. Stage 1 (grey): "Submitted" — icon of wallet send button. Label: "Mempool, <1 second." Stage 2 (yellow): "Accepted on L2" — sequencer icon. Label: "Seconds, balance updates, soft finality." Stage 3 (orange): "Proving" — mathematical certificate icon. Label: "Minutes to hours, prover generates STARK proof." Stage 4 (orange-red): "Proof submitted to Ethereum" — Ethereum logo. Label: "Ethereum processes proof transaction." Stage 5 (green): "Accepted on L1" — green tick and Ethereum block. Label: "Hours, mathematically irreversible." A dotted bracket below stages 1-5 labelled "SOFT FINALITY: Stage 2 sufficient for most DeFi." A solid bracket below stages 1-5 labelled "HARD FINALITY: Stage 5 required for withdrawals." Arrows connect each stage.`,
  visualType: 'static',
  visualUrl: 'starknet-transaction-lifecycle-five-stages',

  examples: [
    {
      contextTag: '[User checking when a bridge withdrawal is safe to act on]',
      context: 'A user bridges 10,000 USDC from Starknet back to Ethereum using Starkgate. She initiates the withdrawal at 9am. Her Starknet wallet immediately shows the 10,000 USDC as deducted.',
      scenario: 'She checks Starkgate\'s interface at 9:05am and sees the withdrawal is in "pending" status. She checks Voyager — her transaction shows "Accepted on L2" but "Accepted on L1: pending." She needs the USDC on Ethereum by noon.',
      outcome: 'L1 finality for the Starkgate withdrawal will arrive a few hours after the transaction was accepted on L2. If the proof batch is submitted and verified by 11am, she will have her USDC on Ethereum in time. She checks again at 10:30am — Voyager shows "Accepted on L1" with an Ethereum block number. The 10,000 USDC is now available on Ethereum. Planning for the 2–4 hour gap between L2 acceptance and L1 finality prevented any problem.',
    },
    {
      contextTag: '[Protocol incorrectly treating L2 acceptance as final settlement]',
      context: 'A DeFi protocol on Starknet uses on-chain events as settlement signals. When they see "Accepted on L2," they release collateral to the counterparty.',
      scenario: 'A rare proof generation failure causes a batch containing one of their settlement transactions to be rejected by Ethereum. The transaction returns to pending. The sequencer re-includes it in the next batch. But the protocol already released collateral based on the L2 acceptance signal. The re-executed transaction in the new batch creates a duplicate settlement.',
      outcome: 'The protocol released collateral based on soft finality, not hard finality. For a settlement system where releasing collateral is a one-way action with financial consequences, L2 acceptance was an insufficient signal. The correct design is to listen for "Accepted on L1" before releasing collateral in high-stakes settlement flows. For casual swaps and deposits, L2 acceptance is fine.',
    },
    {
      contextTag: '[User confused by 3-hour pending status]',
      context: 'A user makes a small STRK swap on AVNU at 2pm. By 2:05pm, their wallet shows the new token balance. But when they check Voyager to share the transaction with a friend, they see "Accepted on L1: pending" with a clock icon.',
      scenario: 'The friend says: "That says pending — did your swap fail?" The user is confused because their balance already shows the correct amount.',
      outcome: 'The swap succeeded at Stage 2 (L2 acceptance) — that is why the balance updated. The "pending" on Voyager refers specifically to L1 finality (Stage 5), which takes a few hours. For a small STRK swap, L1 finality is completely irrelevant — the transaction is done. "Accepted on L1: pending" does not mean the swap is still in progress. It means the mathematical proof to Ethereum has not yet been submitted. Understanding the five stages prevents this confusion.',
    },
  ],

  guidedPractice: [
    {
      question: 'A user submits a swap transaction on Starknet. Within 10 seconds, their wallet shows the new token balance and Voyager shows "Accepted on L2." What has happened at this point?',
      options: [
        'A. The transaction is completely final — "Accepted on L2" means it is settled on Ethereum',
        'B. The sequencer has processed the transaction and updated the state — this is soft finality. The STARK proof has not yet been generated or submitted to Ethereum.',
        'C. The transaction is still in the mempool — wallet balance updates are preliminary',
        'D. The prover has verified the transaction and submitted a proof to Ethereum',
      ],
      correct: 1,
      hint: 'Match "Accepted on L2" to its stage in the lifecycle. Which entity is responsible at this stage, and what has not happened yet?',
      explanation: 'B is correct. "Accepted on L2" means the sequencer has executed the transaction and included it in a batch. The state has been updated — your balance is correct. But this is Stage 2. Proof generation (Stage 3), proof submission to Ethereum (Stage 4), and Ethereum verification (Stage 5) have not happened yet. Soft finality is real and sufficient for most purposes — but mathematical irreversibility on Ethereum comes only at Stage 5.',
    },
    {
      question: 'What is the difference between the "prover" and the "verifier" in Starknet\'s architecture?',
      options: [
        'A. The prover is Ethereum; the verifier is StarkWare',
        'B. The prover is StarkWare\'s service that generates the STARK proof; the verifier is Ethereum\'s smart contract that checks whether the proof is valid',
        'C. The prover and verifier are both run by StarkWare — Ethereum has no role in verification',
        'D. The prover checks transactions for fraud; the verifier approves them for inclusion',
      ],
      correct: 1,
      hint: 'Who produces the mathematical certificate, and who checks it?',
      explanation: 'B is correct. The prover generates — it takes the batch of transactions and produces the STARK proof (mathematical certificate). StarkWare\'s prover service does this work. The verifier checks — it receives the proof and confirms it is mathematically valid. Ethereum runs a STARK verifier contract that performs this check. The direction is: StarkWare proves → Ethereum verifies. Option A has the roles reversed. Option C incorrectly removes Ethereum from the verification step.',
    },
    {
      question: 'A user\'s Starknet transaction has been "Accepted on L2" for 3 hours and "Accepted on L1" is still showing as pending. Should the user be concerned?',
      options: [
        'A. Yes — 3 hours of L1 pending means the transaction has failed',
        'B. No — the gap between L2 acceptance and L1 finality is normally a few hours. The transaction is processed; L1 finality is the proof reaching Ethereum. The user\'s funds are safe.',
        'C. Yes — L1 pending means the sequencer has not yet processed the transaction',
        'D. No — but the user should resubmit the transaction to speed up L1 finality',
      ],
      correct: 1,
      hint: 'What is the normal timing gap between Stage 2 (L2 accepted) and Stage 5 (L1 accepted)?',
      explanation: 'B is correct. The gap between L2 acceptance and L1 finality is normally a few hours — proof generation, proof submission to Ethereum, and Ethereum processing all take time. A 3-hour gap is within the normal range and is not a sign of failure. The transaction has been processed by the sequencer; the funds are correctly reflected. L1 finality will follow. Option A incorrectly interprets a normal gap as failure. Option D is wrong — you cannot speed up L1 finality by resubmitting.',
    },
    {
      question: 'For which of the following use cases is waiting for L1 finality (Stage 5) most critical?',
      options: [
        'A. A user swapping 50 USDC for STRK on AVNU',
        'B. A user checking their staking rewards',
        'C. A protocol releasing $500,000 of collateral to a counterparty as final settlement, after which the counterparty will immediately withdraw to Ethereum',
        'D. A user depositing 100 USDC into Vesu',
      ],
      correct: 2,
      hint: 'Think about which operation is irreversible and has high financial stakes. For which one would a re-sequenced transaction (if L2 acceptance was treated as final) cause the most damage?',
      explanation: 'C is correct. Releasing $500,000 of collateral based on L2 acceptance risks a double-release if the batch is re-sequenced (rare but possible). For high-value, one-way settlement with immediate downstream action, L1 finality is the correct signal. Options A, B, and D are routine DeFi operations where L2 acceptance is perfectly sufficient — the stakes of a re-sequenced transaction are negligible or recoverable.',
    },
    {
      question: 'At Stage 3 (proof generation), what is happening and what can go wrong?',
      options: [
        'A. Ethereum is verifying individual transactions — a failure means some transactions are rejected',
        'B. StarkWare\'s prover is generating a mathematical certificate for all transactions in the batch — a failure means the entire batch is re-attempted with a new proof, no funds are lost',
        'C. Users are re-confirming their transactions via wallet popups',
        'D. The sequencer is deciding which transactions to include in the final proof',
      ],
      correct: 1,
      hint: 'Stage 3 is between the sequencer (Stage 2) and Ethereum (Stages 4–5). Who does the work at Stage 3 and what is the output?',
      explanation: 'B is correct. At Stage 3, StarkWare\'s prover takes all transactions the sequencer batched and generates a STARK proof — the mathematical certificate that all of them were executed correctly. If proof generation fails (rare), the batch is re-attempted: the sequencer regroups the transactions and the prover tries again. No funds are lost. Option A describes Ethereum\'s verifier role (Stage 5). Option C is wrong — users take no action during proof generation. Option D describes Stage 2 (sequencer work), not Stage 3.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Open the Ecosystem Read simulator and navigate to the Transactions tab. Find a recent Starknet transaction that shows both "Accepted on L2" and "Accepted on L1" status. Record: (a) the timestamp when it was accepted on L2, (b) the timestamp when it was accepted on L1, (c) the gap in hours and minutes between the two. Then find a second transaction that shows "Accepted on L2" but L1 still pending. Explain what stage this second transaction is currently in and what will happen next.',
      scoringCriteria: [
        'Correctly reads L2 and L1 timestamps from the simulator and calculates the gap accurately',
        'Correctly identifies the pending transaction as being in Stage 3 or 4 — proof generation or proof submission — and states this is normal and expected',
        'Correctly explains what happens next: the prover will generate the proof, it will be submitted to Ethereum, and Ethereum will verify it — moving the transaction to Stage 5',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Starknet transaction shows "Accepted on L2" at 14:00 and "Accepted on L1: pending" at 17:00 — three hours later. A user posts: "My transaction is still pending after 3 hours — Starknet is broken." Evaluate this claim. State what is actually happening at 17:00, whether there is cause for concern, and at what point the user should genuinely start investigating.',
      scoringCriteria: [
        'Correctly identifies that 3 hours of L1 pending is within the normal range — proof generation and Ethereum verification typically take a few hours. The transaction has been processed (L2 accepted); L1 finality is still in progress.',
        'Correctly states there is no cause for concern at 3 hours for a routine DeFi transaction',
        'Correctly states a reasonable investigation threshold: if L1 finality has not arrived after 8–12 hours (significantly above normal), checking the Starknet status page or governance forums for reported issues would be appropriate',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi derivatives protocol on Starknet requires "immediate L1 finality" for settlement — their legal terms say settlement is final when confirmed on Ethereum. A user makes a $200,000 trade and wants to withdraw to Ethereum immediately after settlement. The protocol requires waiting for L1 finality before releasing funds. Walk through: (a) is "immediate L1 finality" technically possible on Starknet, (b) what is the realistic wait time, (c) is the protocol\'s requirement reasonable for this use case?',
      scoringCriteria: [
        '(a) Correctly identifies that immediate L1 finality is not possible — proof generation takes minutes to hours, and Ethereum verification adds additional time. "Immediate" L1 finality is not part of Starknet\'s architecture.',
        '(b) Correctly states the realistic wait: a few hours from L2 acceptance to L1 settlement under normal conditions',
        '(c) Correctly evaluates the protocol\'s requirement as reasonable for a $200,000 withdrawal with legal settlement implications — the stakes justify waiting for mathematical irreversibility rather than acting on soft finality alone',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L2.3 — Cairo VM and Why Cairo Exists
// TYPE A — Dominant concept: Cairo is the only language that
// generates STARK proofs natively — and STARKs (no trusted setup)
// are fundamentally different from SNARKs (trusted setup required).
// ─────────────────────────────────────────────────────────────

export const LAB2_LESSON_3 = {
  id: 'l2-3-cairo-vm-stark-vs-snark',
  title: 'Cairo VM and Why Cairo Exists',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
When you drive a car, you do not need to understand combustion engineering to get to your destination. But if you are an automotive analyst evaluating which car manufacturer has the best long-term prospects, understanding the difference between an internal combustion engine and an electric motor matters enormously. The choice of engine architecture determines what becomes possible — and what stays impossible.

Starknet's choice of Cairo as its programming language, and STARK proofs as its security system, is exactly like this engine choice. You do not need to write Cairo to use Starknet. But to analyse whether Starknet has a real advantage over its competitors, you need to understand why these architectural choices matter and what they make possible.

WHY DOES STARKNET NEED A DIFFERENT LANGUAGE AT ALL?

Every blockchain has a virtual machine — a software environment that executes smart contract instructions. Ethereum's virtual machine is called the EVM (Ethereum Virtual Machine). Every Solidity contract you have ever heard of compiles down to EVM instructions.

Starknet uses a different virtual machine: the Cairo VM. The reason for this is not arbitrary. Every instruction that runs inside the Cairo VM is designed from the ground up to generate a STARK proof as it executes. This is what makes Starknet's security model work — the proof is not added on top of the execution, it is produced during the execution itself.

Think of it this way. A standard calculator is designed to produce correct answers. A STARK-proof calculator is designed to produce correct answers and simultaneously generate an unbreakable receipt proving it did the calculation correctly. Building that receipt-generating capability into every operation required building a new calculator from scratch. You cannot add it to an existing one as a plugin.

This is why Starknet cannot simply accept Ethereum's Solidity contracts. Solidity compiles to EVM instructions — instructions that were never designed to generate STARK proofs. To get the proof, you need code that runs on the Cairo VM. The Cairo VM requires Cairo. There is no shortcut.

STARK VS SNARK — A DISTINCTION THAT MATTERS FOR COMPETITIVE ANALYSIS

There are two main families of zero-knowledge proof systems used by blockchains today. Both can prove that computation was done correctly. They differ in one critical way that has significant implications for security and trust.

SNARK-based systems (used by ZKSync Era, Polygon zkEVM, Linea):

Before a SNARK system can be used, it requires a one-time ceremony called a trusted setup. During this ceremony, a group of participants jointly generate a piece of secret mathematical material. This material is then destroyed — if it is truly destroyed and no participant kept a copy, the system is secure. If even one participant kept their share of the secret material, they could potentially generate false proofs that would look valid. The ceremony is a one-time event: if the setup was honest, the system is secure forever after.

The phrase "trusted setup" is slightly misleading — the goal is to not have to trust anyone. The ceremony is designed so that even if all but one participant was dishonest, the one honest participant destroys the entire secret. In practice, major SNARK ceremonies have involved hundreds of participants across different countries and backgrounds to make collusion virtually impossible.

But "virtually impossible" is not the same as "mathematically impossible."

STARK-based systems (used by Starknet):

STARKs require no trusted setup at all. Their security comes from hash functions — mathematical operations that are considered unconditionally secure under standard cryptographic assumptions. There is no ceremony. There is no shared secret to destroy. There is no scenario in which a past participant could generate a false proof because no shared secret ever existed.

This means Starknet's proof system is "trustless" in a stronger sense than SNARK-based systems. There was no ceremony to trust. No group of participants needed to behave honestly for the security to hold.

The trade-off: STARK proofs are larger than SNARK proofs. Posting larger proofs to Ethereum costs more. As proof compression technology improves, this gap narrows — but it is a real current cost difference.

WHAT THIS MEANS FOR ECOSYSTEM ANALYSIS

When comparing Starknet to ZKSync, Polygon zkEVM, or other ZK rollups, you now have the language to be precise:

"Both use ZK proofs" — true but incomplete.
"ZKSync uses SNARKs (trusted setup); Starknet uses STARKs (no trusted setup)" — precise and differentiating.

For protocols evaluating which ZK rollup to build on, the STARK/SNARK distinction is a real security question. For users evaluating which Layer 2 to trust with large capital, it is a meaningful consideration. For ecosystem analysts, it is the primary technical differentiator between Starknet and its ZK rollup competitors.

All ZK rollups are not the same. The proof system is the engine architecture. Knowing the difference puts you ahead of the majority of DeFi participants who use these labels interchangeably.
  `.trim(),

  keyTakeaway: `Cairo exists because generating STARK proofs requires code specifically designed for the Cairo VM — and STARKs have a fundamental security advantage over SNARKs used by competing ZK rollups: no trusted setup ceremony is required, meaning security relies on mathematics alone rather than on a group of participants having behaved honestly.`,

  visualPrompt: `Two-part diagram. Part 1 (left half): "Why Cairo Exists" — a stack showing: (1) Human-readable Cairo code → (2) Compilation → (3) Cairo VM executes → (4) STARK proof generated simultaneously. Arrow annotation: "The proof is produced during execution, not added after." Below: comparison showing EVM instructions (Solidity/Ethereum) with red cross labelled "Cannot generate STARK proofs natively." Part 2 (right half): "STARK vs SNARK" — two columns. SNARK column: icon of a ceremony with multiple people, a shared secret, and a "destroy" action. Label: "Trusted setup required — security depends on honest participants." STARK column: icon of a hash function with a no-ceremony symbol. Label: "No trusted setup — security from mathematics alone." Green tick on STARK column. Yellow caution on SNARK column. Trade-off label below: "STARK proofs are larger but have stronger trust assumptions."`,
  visualType: 'static',
  visualUrl: 'cairo-vm-stark-vs-snark-comparison',

  examples: [
    {
      contextTag: '[Ethereum developer asking why they must learn Cairo]',
      context: 'A senior Solidity developer with 4 years of experience building Ethereum DeFi protocols wants to deploy on Starknet. She asks her team lead: "Can\'t we just compile our existing Solidity contracts for Starknet?"',
      scenario: 'The team lead explains: Solidity compiles to EVM instructions. EVM instructions were designed for Ethereum\'s execution environment — not for generating STARK proofs. The Cairo VM is a completely different execution environment, designed from the ground up so that every instruction it executes simultaneously contributes to building the STARK proof. There is no compatibility layer.',
      outcome: 'The developer understands: Starknet is not EVM-compatible by design, not by accident. The choice to use the Cairo VM was a deliberate architectural decision to enable STARK proofs. Porting to Starknet requires rewriting in Cairo — this is the Cairo learning curve that represents Starknet\'s developer onboarding friction. The friction is real. The reason for it is fundamental, not arbitrary.',
    },
    {
      contextTag: '[Analyst comparing Starknet to ZKSync for a research report]',
      context: 'A research analyst is writing a comparative report on ZK rollups. She needs to explain why "both use ZK proofs" is an insufficient description.',
      scenario: 'ZKSync Era used a trusted setup ceremony (the "Phase 2 ceremony") with several hundred participants. The ceremony was designed so that even if all but one participant was dishonest, security holds. In practice, this is considered extremely secure. Starknet\'s STARK system required no ceremony — the security comes from hash functions with no shared secret ever created.',
      outcome: 'Her report states: "ZKSync\'s SNARK-based proof system has strong practical security via a large trusted setup ceremony. Starknet\'s STARK-based system has stronger theoretical security guarantees — no trusted setup means there is no ceremony whose integrity anyone needs to accept. For users deploying very large capital and seeking maximum assurance, this distinction is meaningful. For everyday DeFi use, both are considered secure."',
    },
    {
      contextTag: '[Non-technical user understanding the trade-off]',
      context: 'A user reads: "Starknet uses STARKs. Other ZK rollups use SNARKs. STARKs are better." She asks an analyst whether this simple claim is accurate.',
      scenario: 'The analyst explains the trade-off. STARK security advantage: no trusted setup, security from mathematics alone, no ceremony to question. STARK cost disadvantage: STARK proofs are larger than SNARK proofs, meaning higher Ethereum gas costs for proof submission. This is partly why Starknet transaction fees were historically higher than some competitors.',
      outcome: '"STARKs are better" is accurate for security assumptions but incomplete. SNARK proofs are smaller and cheaper to verify on Ethereum — a meaningful practical advantage. As STARK proof compression improves (and it has improved significantly with StarkWare\'s development work), the cost gap narrows. The accurate framing: STARKs have stronger theoretical trust properties; SNARKs have historically been cheaper. The gap in practical security is small; both are considered very secure for real-world use.',
    },
  ],

  guidedPractice: [
    {
      question: 'Why can\'t Ethereum Solidity developers simply deploy their existing contracts on Starknet without rewriting them in Cairo?',
      options: [
        'A. Legal reasons — Starknet does not have permission to run Ethereum code',
        'B. Solidity compiles to EVM instructions, which were never designed to generate STARK proofs. The Cairo VM requires Cairo code specifically designed to produce proofs during execution.',
        'C. Starknet deliberately refuses Solidity to protect Cairo developers from competition',
        'D. Solidity contracts are too large to fit within Starknet\'s block limits',
      ],
      correct: 1,
      hint: 'What is the fundamental requirement of the Cairo VM, and why does Solidity not meet it?',
      explanation: 'B is correct. The Cairo VM requires instructions designed from the ground up to generate STARK proofs during execution. Solidity compiles to EVM instructions — a completely different instruction set designed for Ethereum\'s execution environment, not for STARK proof generation. There is no compatibility layer because the proof capability is architectural, not a feature that can be added. Options A, C, and D are all incorrect characterisations of the constraint.',
    },
    {
      question: 'What is a "trusted setup" in the context of SNARK-based proof systems, and what is the security risk it creates?',
      options: [
        'A. A trusted setup is a security audit performed before a blockchain launches — if the audit fails, the blockchain is unsafe',
        'B. A trusted setup is a one-time ceremony where participants jointly generate secret mathematical material that must be destroyed. If any participant kept their share, they could potentially generate false proofs that appear valid.',
        'C. A trusted setup means users must trust the blockchain\'s team, which is the same for all blockchain projects',
        'D. A trusted setup is a mechanism for verifying user identities before they can use the protocol',
      ],
      correct: 1,
      hint: 'What happens during the ceremony, what must be destroyed, and what is the consequence if it is not destroyed?',
      explanation: 'B is correct. A trusted setup ceremony involves multiple participants generating a shared mathematical secret. After the ceremony, each participant destroys their portion. If even one participant retained their share, they could use it to generate false proofs — proofs that would appear valid but prove incorrect computations. The ceremony is designed to make this nearly impossible by using many independent participants across many countries. But it is a cryptographic trust assumption, not a mathematical certainty.',
    },
    {
      question: 'ZKSync Era and Polygon zkEVM use SNARK-based proofs. Starknet uses STARK-based proofs. What is the primary security advantage STARKs have over SNARKs?',
      options: [
        'A. STARKs are faster — they generate proofs more quickly',
        'B. STARKs require no trusted setup — their security comes from hash functions alone, with no ceremony whose integrity anyone needs to trust',
        'C. STARKs are supported by Ethereum directly, while SNARKs are not',
        'D. STARK proofs are smaller and cheaper to verify on Ethereum',
      ],
      correct: 1,
      hint: 'What is the defining difference between a system that requires a trusted setup and one that does not?',
      explanation: 'B is correct. The primary security advantage of STARKs is the absence of a trusted setup. No ceremony was ever required, no shared secret was ever created, and no group of participants needs to have behaved honestly for the security to hold. STARK security is based purely on hash functions — mathematical properties that hold unconditionally. Option A is incorrect — STARK proof generation is typically slower than SNARK generation. Option D is wrong — STARK proofs are actually larger, not smaller.',
    },
    {
      question: 'What is the main trade-off of using STARKs instead of SNARKs?',
      options: [
        'A. STARKs cannot prove financial transactions — they only work for gaming applications',
        'B. STARK proofs are larger than SNARK proofs, which has historically meant higher Ethereum gas costs for proof submission',
        'C. STARKs require a trusted setup that is more complex than SNARK setups',
        'D. STARKs can only be verified by Starknet, not by Ethereum directly',
      ],
      correct: 1,
      hint: 'If STARKs have a stronger security property, there must be a cost somewhere. What is the practical downside?',
      explanation: 'B is correct. STARK proofs are mathematically larger than SNARK proofs. Larger proofs cost more gas to post to Ethereum — this is a real current cost difference that has historically contributed to higher transaction fees on Starknet compared to SNARK-based competitors. As proof compression technology improves, this gap narrows. Option C is wrong — STARKs specifically require no trusted setup. Option D is wrong — Ethereum does verify STARK proofs via the verifier contract.',
    },
    {
      question: 'A report on ZK rollups states: "Starknet, ZKSync, and Polygon zkEVM are similar — they all use zero-knowledge proofs." As an ecosystem analyst, what is the key distinction missing from this description?',
      options: [
        'A. The description is accurate — all three use zero-knowledge proofs and are therefore equivalent',
        'B. The description is accurate but incomplete — Starknet uses STARK proofs (no trusted setup), while ZKSync and Polygon zkEVM use SNARK proofs (trusted setup required). The proof system is a fundamental security architecture difference, not a minor implementation detail.',
        'C. The description is wrong — ZKSync does not use zero-knowledge proofs',
        'D. The description is incomplete because it does not mention which programming languages each supports',
      ],
      correct: 1,
      hint: 'All three do use ZK proofs. But what kind of ZK proofs — and why does the type matter for security analysis?',
      explanation: 'B is correct. "All use ZK proofs" groups them incorrectly. The proof system architecture — STARK vs SNARK — determines the trust assumptions, the proof size, and the verification cost. These are materially different security properties. For deep analysis or large capital deployment, this distinction matters. Option A treats the description as complete — it is not. Option C is incorrect — ZKSync does use ZK proofs (SNARK-based). Option D is also true but less fundamental than the proof system difference.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-communication',
      scenario: 'A developer messages you: "I have 4 years of Solidity experience and I want to build on Starknet. Why can\'t I just use Solidity? Why is Cairo necessary?" Write a two-sentence explanation for a technical audience that accurately explains the architectural reason — without dismissing the difficulty of learning a new language.',
      scoringCriteria: [
        'Correctly explains that Solidity compiles to EVM instructions not designed for STARK proof generation — the Cairo VM requires instructions specifically architected to produce proofs during execution',
        'Accurately acknowledges that the learning curve is real: Cairo is a different language with different syntax, tooling, and ecosystem maturity — not a small step from Solidity',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'ZKSync Era used a SNARK-based trusted setup ceremony before launch. The ceremony involved 350 participants across different countries. You are an ecosystem analyst asked: "What question should you ask about the integrity of that ceremony, and what would an honest answer look like?" State the specific question and what a transparent, honest response from the ZKSync team would contain.',
      scoringCriteria: [
        'Correctly identifies the question: "Can you verify that all 350 participants destroyed their portion of the secret mathematical material after the ceremony, and is there a publicly verifiable record of this?"',
        'Correctly describes what an honest answer would contain: a public record of the ceremony (typically published), the list of participants and their attestations, and an acknowledgement that the security assumption is that at least one participant behaved honestly — not that all 350 can be individually verified to have destroyed their share',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Cairo adoption data: Starknet has approximately 3,000 active Cairo developers. Ethereum has approximately 150,000 active Solidity developers. The ratio is roughly 1:50. Interpret what this ratio means for Starknet\'s developer ecosystem risk — specifically, identify two risks this ratio creates and one factor that could reduce those risks over time.',
      scoringCriteria: [
        'Risk 1: Small talent pool makes hiring difficult for protocols building on Starknet — competing for 3,000 developers vs 150,000 means higher salaries, longer hiring timelines, and fewer qualified candidates per role',
        'Risk 2: A smaller developer community means fewer open-source libraries, fewer answers to common problems in forums, and fewer auditors experienced in Cairo — compounding the hiring problem with an ecosystem maturity gap',
        'Factor reducing risk: Cairo\'s Rust-like syntax means Rust developers (growing community of ~3M) can learn Cairo faster than starting from zero — the relevant talent pipeline is broader than just current Cairo developers',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L2.4 — Account Abstraction as a User-Facing Feature
// TYPE A — Dominant concept: account abstraction makes three
// things possible that are impossible on standard Ethereum wallets
// — guardian recovery, gasless transactions, and session keys.
// These lower DeFi onboarding friction meaningfully.
// ─────────────────────────────────────────────────────────────

export const LAB2_LESSON_4 = {
  id: 'l2-4-account-abstraction',
  title: 'Account Abstraction as a User-Facing Feature',
  trackType: 'A',
  lessonNumber: 4,

  explanation: `
When online banking first launched in the late 1990s, you could access your account through a website. But accessing it required a username, a password, and often a hardware token that generated a 6-digit code every 30 seconds. If you lost the token, you were locked out until you called the bank and verified your identity in person. If someone stole your password and your token, they could access your money.

By 2010, banks had introduced biometric authentication — fingerprint, then Face ID. You do not type a password. You do not carry a hardware token. You look at your phone and you are in. The bank still verifies it is you. But the method changed completely. The friction dropped dramatically. More people used online banking. The financial system reached more people.

Crypto wallets in 2022 were stuck in the 1999 model. To use any DeFi protocol, you needed a seed phrase — a list of 12 or 24 random words. If you lost the seed phrase, your funds were gone permanently. No bank to call. No account recovery. Every transaction required manually approving a popup in a browser extension. This friction kept DeFi inaccessible to anyone who was not already technical.

Starknet solved this — not with a workaround, but by building a fundamentally different wallet architecture from the ground up.

WHAT ACCOUNT ABSTRACTION IS (PLAIN ENGLISH FIRST)

On standard Ethereum, your wallet is a pair of cryptographic keys. Your private key signs transactions. Your public key is your address. The key is the account — there is nothing between them. If the key is compromised, the account is compromised. If the key is lost, the account is lost. The private key is your identity in the system.

On Starknet, every wallet is a programmable smart contract. Your wallet is not just a key — it is a small program that defines the rules for how it can be used. You can program those rules: "allow Face ID to sign transactions," "allow a trusted friend's address to help recover this account," "allow this game to execute moves without asking me to approve each one." The rules are in the contract. The contract is your account.

This is called Account Abstraction — the idea that the account itself is an abstract programmable layer, not a fixed key pair. It is native to every Starknet wallet by default, without any plugins or upgrades required.

THREE FEATURES THAT MATTER FOR USERS

FEATURE 1 — GUARDIAN RECOVERY (NO SEED PHRASE REQUIRED)

Standard Ethereum wallet: if you lose your seed phrase, your funds are permanently and irreversibly gone. There is no recovery. This has caused billions of dollars in permanently lost crypto.

With Account Abstraction on Starknet: you can designate a guardian — a trusted address (another wallet, a hardware device, or even a trusted friend's address) that can help you recover your account if you lose access. You do not need a seed phrase. If your phone is stolen, your guardian can authorise you to migrate your account to a new device.

This completely changes the risk profile for new users. You do not need to securely store a 24-word phrase that, if lost or found, determines the fate of your entire crypto portfolio.

FEATURE 2 — GASLESS TRANSACTIONS (APPS CAN PAY YOUR FEES)

Standard Ethereum model: every transaction requires ETH to pay gas fees. A new user who wants to try a DeFi app but only has USDC cannot do anything — they first need to acquire ETH just to pay fees. This is a significant onboarding barrier.

With Account Abstraction, a protocol or application can act as a paymaster — it pays the transaction fees on behalf of the user. The user might pay fees in USDC, or the app might absorb the fee cost entirely as part of a promotional campaign or as a service. On Starknet, the AVNU Paymaster already does this — you can execute swaps with zero gas cost to you.

For ecosystem analysis: gasless transactions lower the onboarding cost of new users to near zero. This is a direct user acquisition advantage over chains that require native token ownership before any interaction is possible.

FEATURE 3 — SESSION KEYS (APPS CAN ACT WITHIN YOUR APPROVED LIMITS)

Standard model: every single action in a DeFi app or game requires a wallet approval popup. You play a game for an hour — you see 200 approval prompts. This experience is unusable.

With Account Abstraction, you can grant a session key — a temporary, limited permission for an application to act on your behalf without asking for approval each time. You define the limits: "this game can execute moves in this game contract for the next 7 days, up to $5 per transaction, and cannot touch any other asset." The key expires automatically. The limits are enforced by code, not by trust.

Cartridge Controller — Starknet's gaming wallet — uses session keys so that playing an on-chain game feels like playing any other mobile game. You approve once. The game runs. You are not interrupted by approval popups.

WHAT THIS MEANS FOR ECOSYSTEM ANALYSIS

Account Abstraction is not a feature for crypto-native power users. It is the technology that makes DeFi feel like a normal app. This matters for ecosystem analysis in a specific way:

Ethereum requires seed phrases and browser extensions. Starknet does not. This is why mobile-native wallets with Face ID login exist on Starknet but not natively on Ethereum. This is why a mobile game on Starknet can process 200 moves without 200 approval prompts.

For any metric that measures user acquisition, retention, and demographic reach — monthly active wallets, wallet creation rate, mobile vs desktop usage ratio — Account Abstraction is the underlying enabler. A Starknet protocol reaching users who have never used crypto before is, in part, a product of AA removing the barriers that stopped those users from starting.
  `.trim(),

  keyTakeaway: `Account Abstraction makes three things possible on Starknet that are impossible with standard Ethereum wallets — guardian recovery (no seed phrase required), gasless transactions (apps pay fees), and session keys (apps act within approved limits) — and these three features collectively lower DeFi onboarding friction enough to reach demographics that standard crypto wallets cannot.`,

  visualPrompt: `Three-column comparison. Column header row: "Standard Ethereum Wallet" vs "Starknet Account Abstraction." Row 1 — Account Recovery: left (Ethereum) = "Lost seed phrase = permanent loss" with red icon of a key with X. Right (Starknet) = "Guardian recovery — trusted address can restore access" with green icon of two people. Row 2 — Fees: left = "Must own ETH first" with red coin icon. Right = "Paymaster covers fees — zero ETH required to start" with green zero symbol. Row 3 — App Interaction: left = "Every action = approval popup" with red endless-popup icon. Right = "Session keys — approve once, app runs within limits" with green single-tick icon. Below the table: label "For ecosystem analysis: AA is why Starknet can reach non-crypto users."`,
  visualType: 'static',
  visualUrl: 'account-abstraction-three-features',

  examples: [
    {
      contextTag: '[New user onboarding without seed phrase]',
      context: 'A 17-year-old wants to try Starknet DeFi after seeing it mentioned on social media. She has a smartphone and $30 of USDC she received as a gift. She has never used crypto before.',
      scenario: 'She downloads Braavos — Starknet\'s mobile-first wallet. She sets it up using Face ID — no seed phrase appears. The app explains that a guardian (her email address, which connects to Braavos\' recovery service) can help her recover access if she loses her phone. She has USDC, she has a wallet, she has Face ID login. She opens AVNU and executes a swap — the AVNU Paymaster covers the gas fee automatically.',
      outcome: 'She entered DeFi in 10 minutes with zero seed phrase risk and zero ETH required for fees. The entire experience was native-app level. This is Account Abstraction working as intended — the technology she never thought about made an impossible onboarding possible. For ecosystem analysts, this user is the demographic AA is designed to unlock.',
    },
    {
      contextTag: '[Gaming without approval popups]',
      context: 'A player starts an on-chain Starknet game built on Dojo. The game moves are blockchain transactions — every move is permanent and provably fair. A standard crypto gaming experience requires wallet approval for every single move.',
      scenario: 'The Cartridge Controller (gaming wallet) uses session keys. On first launch, the player approves a session key: "This game contract can execute moves on my behalf for the next 30 days, up to 0.01 STRK per transaction, cannot touch any other asset or contract." After that single approval, the game runs like a normal mobile game — no prompts, no delays, no friction.',
      outcome: 'The player completes a 45-minute gaming session with 380 on-chain moves. They approved exactly once. Session keys made the difference between a functional game and an unplayable approval-interrupt nightmare. Loot Survivor 2 and Ponziland both use this model.',
    },
    {
      contextTag: '[Analyst connecting AA to user acquisition metrics]',
      context: 'A Starknet analytics report shows: 80% of new wallets created in November were via mobile, with Face ID as the primary authentication method. Ethereum\'s new wallet creation is 95% desktop/browser-extension. Average time-to-first-transaction: Starknet 8 minutes, Ethereum 45 minutes (including seed phrase setup and ETH acquisition for gas).',
      scenario: 'An analyst reads these numbers and asks: what is driving the mobile and speed differences?',
      outcome: 'The analyst correctly attributes both differences to Account Abstraction. Mobile-first wallets are possible because AA allows Face ID authentication and recovery without a seed phrase — features that require the wallet to be a programmable contract, not a fixed key. The 8-minute onboarding is possible because gasless transactions mean new users do not need to acquire ETH before using the protocol. For any protocol designing a user acquisition strategy, these numbers mean: Starknet can reach demographics that standard crypto cannot.',
    },
  ],

  guidedPractice: [
    {
      question: 'A user sets up a Starknet wallet on Braavos using Face ID. She does not write down a seed phrase. Three months later, her phone is stolen. What happens to her funds?',
      options: [
        'A. Her funds are permanently lost — without a seed phrase, there is no recovery possible',
        'B. She can use her guardian recovery — a trusted address she designated when setting up can help her restore access to her account on a new device',
        'C. Braavos automatically transfers her funds to a backup address when a theft is detected',
        'D. She must contact StarkWare to manually recover her account',
      ],
      correct: 1,
      hint: 'Account Abstraction makes one specific recovery method possible that standard wallets cannot support. What is it?',
      explanation: 'B is correct. Because every Starknet wallet is a programmable smart contract, users can designate a guardian — a trusted address that can authorise account recovery on a new device. The guardian cannot steal funds; they can only authorise the account owner to migrate to a new device. Option A describes the standard Ethereum model — permanent loss without seed phrase — which Account Abstraction specifically solves. Options C and D do not describe real mechanisms.',
    },
    {
      question: 'A new user wants to try Starknet DeFi but only has USDC — no ETH or STRK for gas fees. The AVNU Paymaster covers gas costs for AVNU swaps. What does this mean for her ability to start using DeFi?',
      options: [
        'A. She still cannot start — all DeFi requires native token ownership for fees',
        'B. She can execute swaps on AVNU immediately — the Paymaster pays the gas costs on her behalf. She does not need STRK or ETH first.',
        'C. She can execute one free swap per day, then must acquire STRK for subsequent fees',
        'D. The Paymaster only covers fees for users who stake STRK first',
      ],
      correct: 1,
      hint: 'What does a Paymaster do, and what does that mean for a user with no native token?',
      explanation: 'B is correct. A Paymaster — enabled by Account Abstraction — is a contract that pays transaction fees on behalf of users. The AVNU Paymaster covers gas costs for AVNU swaps, meaning a user with only USDC can execute swaps without owning STRK or ETH. This removes the "you need the native token before you can do anything" onboarding barrier that exists on standard Ethereum. Options A, C, and D all impose restrictions that the Paymaster specifically eliminates.',
    },
    {
      question: 'A Starknet game processes 200 player moves per hour, each requiring a blockchain transaction. An Ethereum game with the same design would require 200 wallet approval popups per hour. How does Account Abstraction on Starknet solve this?',
      options: [
        'A. Starknet processes 200 moves as one batch transaction — users approve once per batch',
        'B. Session keys allow a player to grant the game contract limited permission to execute moves on their behalf without individual approval prompts — within defined limits that expire automatically',
        'C. Starknet games do not require blockchain transactions for each move',
        'D. Account Abstraction removes all approval requirements permanently for any app',
      ],
      correct: 1,
      hint: 'Which Account Abstraction feature specifically allows an app to act on behalf of a user within approved limits?',
      explanation: 'B is correct. Session keys allow a user to grant a specific contract limited, time-bounded permission to act on their behalf. The player sets the limits at the start (e.g., "this game contract, up to 0.01 STRK per move, for 30 days") and the key operates within those limits without further prompts. The key expires automatically. Option A describes transaction batching, which is different. Option D incorrectly implies session keys remove all approvals permanently — they are limited and time-bounded.',
    },
    {
      question: 'Braavos reports that 80% of its new wallets in November were created via Face ID on mobile. What does this tell you about Starknet\'s user demographics compared to traditional DeFi?',
      options: [
        'A. Starknet users are less sophisticated — Face ID means they cannot manage seed phrases',
        'B. Starknet is reaching a mobile-first, less technically-experienced user demographic that traditional DeFi could not reach due to seed phrase and browser-extension requirements',
        'C. The 80% figure reflects a bug in Braavos — most users still use seed phrases',
        'D. Mobile users are higher risk to DeFi protocols — they make smaller deposits',
      ],
      correct: 1,
      hint: 'Why would mobile-first onboarding with Face ID reach different users than desktop browser-extension onboarding with seed phrases?',
      explanation: 'B is correct. Face ID mobile onboarding is the standard for consumer apps that reach broad demographics — banking apps, payment apps, social media. Seed phrase desktop browser-extension onboarding has historically reached only technically comfortable early adopters. The 80% mobile figure suggests Starknet\'s Account Abstraction is successfully lowering the barrier for non-crypto-native users to onboard. For ecosystem analysis, this represents demographic expansion — new users, not just users switching from other chains. Option A incorrectly frames ease of onboarding as a negative.',
    },
    {
      question: 'A session key grants an app permission to execute transactions "on behalf of the user for 30 days, up to $5 per transaction, only on the AVNU contract." The user\'s wallet contains $10,000 USDC. How much of their USDC can the app access using this session key?',
      options: [
        'A. All $10,000 — once a session key is granted, the app has full wallet access',
        'B. Only what is necessary for AVNU transactions within the $5-per-transaction limit — the key is explicitly scoped to the AVNU contract and cannot touch any other assets',
        'C. $150 maximum — $5 per transaction × 30 days',
        'D. None — session keys cannot authorise actual asset transfers',
      ],
      correct: 1,
      hint: 'Session keys are scoped — they define exactly what is permitted. What do the specific limits in this key allow?',
      explanation: 'B is correct. Session keys enforce their scope programmatically. This key is limited to: the AVNU contract only, transactions up to $5 each, for 30 days. The app cannot access any other assets, cannot execute transactions on any other contract, and cannot exceed $5 per transaction. The $10,000 USDC in the wallet is protected by the scope. Option A is the standard seed phrase risk — a compromised key with full access — which session keys specifically prevent. Option C miscalculates by assuming maximum daily usage; actual usage could be far less.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Braavos reports: 80% of new wallets created last month used Face ID as primary authentication. Average time from app download to first transaction: 8 minutes. Ethereum\'s comparable figure is 45 minutes (including seed phrase setup and ETH acquisition for gas fees). You are writing the "user acquisition" section of a Starknet ecosystem report. Interpret what these three data points tell you about Starknet\'s growth potential relative to Ethereum DeFi.',
      scoringCriteria: [
        'Correctly identifies that the 80% mobile/Face ID figure indicates Starknet is reaching a mobile-first demographic that standard crypto wallets historically could not — not just converting existing crypto users',
        'Correctly interprets the 8 vs 45 minute onboarding gap as a direct effect of Account Abstraction: no seed phrase setup, no ETH acquisition required for fees',
        'States a specific growth implication: the 37-minute reduction in onboarding friction represents a meaningfully lower acquisition barrier — protocols on Starknet can target users who would not have completed Ethereum DeFi onboarding at all',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'An app on Starknet requests a session key scoped to: "all transactions from this wallet, all contracts, unlimited amount, for 30 days." A security researcher calls this dangerous. Explain specifically why this scope is dangerous — and state what the correct scoping should be for an app that only needs to execute DCA (automated purchase) orders on AVNU.',
      scoringCriteria: [
        'Correctly identifies why this scope is dangerous: "all contracts, unlimited amount" means the app could drain the entire wallet to any address, transfer all assets, or interact with any protocol — effectively identical to full private key compromise for 30 days',
        'Correctly states the appropriate scoping for a DCA app: limited to the AVNU contract only, capped at a maximum per-transaction amount consistent with the DCA strategy (e.g. $100 per transaction), and with a 30-day expiry that is appropriate for the service',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A smartphone user understands Face ID and Apple Pay but has never used crypto. They ask: "What is account abstraction and why does Starknet make such a big deal about it?" Explain in two sentences using only analogies from smartphone banking or payment apps. Do not use: "seed phrase", "private key", "cryptographic", "smart contract", or "blockchain".',
      scoringCriteria: [
        'Correctly conveys the core idea: your account on Starknet works like a banking app with Face ID and account recovery — you are not dependent on a single password that, if lost, permanently locks you out',
        'Correctly conveys the practical benefit: apps can act on your behalf (like how Apple Pay can complete a purchase without you entering your card number each time) within limits you set once — no interruptions for every small action',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L2.5 — Starknet vs Ethereum vs Other L2s
// TYPE A — Dominant concept: different Layer 2s make different
// architectural trade-offs. Understanding those trade-offs lets
// you evaluate which chain fits which protocol's requirements.
// ─────────────────────────────────────────────────────────────

export const LAB2_LESSON_5 = {
  id: 'l2-5-starknet-vs-other-l2s',
  title: 'Starknet vs Ethereum vs Other L2s',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
The smartphone market in 2010 looked superficially unified: multiple manufacturers made touchscreen phones. But Apple, Samsung, BlackBerry, and Nokia had made completely different architectural decisions — different operating systems, different app ecosystems, different hardware philosophies. Saying "they are all smartphones" was technically true and analytically useless. The differences between the architectures determined which use cases each could serve, which developers built for them, and ultimately which survived.

Today's Layer 2 landscape has the same dynamic. Arbitrum, Optimism, Starknet, ZKSync, and Polygon zkEVM are all "Layer 2s" in the same way that 2010's handsets were all "smartphones." The label tells you almost nothing. The architecture tells you everything.

This lesson gives you precise, defensible positioning statements for each major L2 — so that when you are asked "how does Starknet compare to Arbitrum?" you have a specific, accurate answer that goes beyond "they are both Layer 2s."

UNDERSTANDING THE TWO SECURITY MODELS

Before comparing specific chains, you need the two security models from Primer L0.1 — recall them precisely.

Optimistic rollups (Arbitrum, Optimism): transactions are posted to Ethereum immediately, assumed valid. Anyone who spots a fraud has a 7-day window to challenge it. During that 7-day window, you cannot withdraw funds to Ethereum. No challenge period ends in days, not hours.

ZK rollups (Starknet, ZKSync, Polygon zkEVM): transactions are proven mathematically valid before posting to Ethereum. No challenge window. Withdrawals are faster. The trade-off: generating the proof takes compute time.

ETHEREUM — THE SECURITY BENCHMARK

Ethereum is not a Layer 2 — it is the Layer 1 that all these rollups report back to. It sets the security standard that every rollup either inherits or approximates.

TVL: $60B+. The liquidity benchmark — more DeFi capital than all other chains combined.
Fees: historically the most expensive per transaction ($5–200+ during congestion events).
Finality: 12–15 minutes for standard finality on Ethereum itself.
Developer ecosystem: the largest — 150,000+ Solidity developers, the deepest library ecosystem.
Use case: the reference point against which every L2 is compared.

ARBITRUM — THE MARKET LEADER BY TVL

Arbitrum is an optimistic rollup built by Offchain Labs. It is currently the largest Layer 2 by TVL.

TVL: $20B+. The dominant L2 by capital.
Security model: optimistic. 7-day withdrawal delay to Ethereum.
Compatibility: fully EVM-compatible. Any Ethereum Solidity contract can deploy on Arbitrum with minimal changes.
Developer ecosystem: the largest among L2s, directly inheriting Ethereum's tooling.
Key advantage: for teams with existing Ethereum code, Arbitrum is the path of least resistance — deploy in days, not months.
Key limitation: 7-day withdrawal delay for moving large capital back to Ethereum. Centralised sequencer (same risk as Starknet).

OPTIMISM — THE PROTOCOL INNOVATOR

Optimism is also an optimistic rollup. It has contributed more to L2 infrastructure design than its TVL suggests.

TVL: $8B+. Significant but below Arbitrum.
Security model: optimistic. Same 7-day withdrawal delay.
Key innovation: the OP Stack — Optimism's code that other chains (Base, built by Coinbase) use to launch their own rollups. The OP Stack creates a network of interconnected chains (the Superchain).
Key advantage: if the OP Stack ecosystem grows, Optimism-compatible chains share liquidity and composability.
Key limitation: same optimistic trade-offs as Arbitrum on withdrawal timing.

ZKSYNC ERA — THE EVM-COMPATIBLE ZK ROLLUP

ZKSync Era is a ZK rollup built by Matter Labs. Its defining goal is to be EVM-compatible — allowing Ethereum Solidity developers to deploy with minimal changes, while still using ZK proofs.

TVL: $500M–$1B range.
Security model: ZK rollup using SNARKs (trusted setup, covered in L2.3).
Compatibility: EVM-compatible but with some limitations — not all EVM features work identically.
Key advantage: ZK proof speed without requiring Cairo. Ethereum developers can bring existing code.
Key limitation: SNARK trusted setup (L2.3 distinction). EVM compatibility constrains some ZK-native optimisations — the architecture makes trade-offs to maintain compatibility.

POLYGON ZKEVM — THE EVM-EQUIVALENT ZK ROLLUP

Polygon zkEVM is built by Polygon Labs. Its goal is even more ambitious than ZKSync: not just compatible but equivalent — exactly the same bytecode as Ethereum.

TVL: $50M–$200M range.
Security model: ZK rollup using SNARKs.
Compatibility: highest EVM equivalence of any ZK rollup — the goal is byte-for-byte identical to Ethereum execution.
Key advantage: if you have Ethereum bytecode, it runs. No rewriting.
Key limitation: achieving full EVM equivalence makes ZK proof generation slower and more expensive — the EVM was not designed for ZK proving. SNARK trusted setup applies.

LINEA — ENTERPRISE-FOCUSED ZK ROLLUP

Linea is built by ConsenSys (the company behind MetaMask and various Ethereum infrastructure).

TVL: $50M–$150M range.
Security model: ZK rollup.
Key characteristic: targets enterprise Ethereum deployments and MetaMask users.
Weakest developer ecosystem of the ZK rollups listed here.
Primary advantage: ConsenSys distribution — MetaMask integration and enterprise relationships.

STARKNET — THE ZK-NATIVE ROLLUP

Starknet's architecture decisions are optimised for maximum ZK proof security, not for EVM compatibility.

TVL: $800M+.
Security model: ZK rollup using STARKs — no trusted setup (L2.3).
Compatibility: not EVM-compatible. Requires Cairo. This is the biggest onboarding barrier.
Key advantage 1: STARK proofs — no trusted setup, strongest theoretical proof security.
Key advantage 2: Account Abstraction native to every wallet — enables Face ID, session keys, gasless transactions.
Key advantage 3: Cairo is designed specifically for ZK proving — applications built in Cairo can be more efficiently proven than EVM code adapted to ZK.
Key limitation: Cairo learning curve. Smaller developer pool. TVL is a fraction of Arbitrum's.

THE FRAMEWORK FOR COMPARING L2s

When a protocol asks "where should we deploy?", the answer depends on three requirements:

Fast withdrawals (no 7-day wait): ZK rollups — Starknet, ZKSync, Polygon zkEVM. (Eliminates optimistic rollups.)
Existing Solidity code, no rewrite: ZKSync Era or Polygon zkEVM. (Eliminates Starknet.)
Strongest proof security (no trusted setup): Starknet. (Eliminates all SNARK-based options.)
Largest existing user base: Arbitrum. (Largest TVL, deepest liquidity.)

No single L2 wins all four. This is the honest reality of the current landscape — every deployment decision involves trade-offs. Knowing what those trade-offs are, specifically, is the analysis. "They are all Layer 2s" is not.
  `.trim(),

  keyTakeaway: `Different Layer 2s make irreconcilable trade-offs — Arbitrum leads on TVL and compatibility but has 7-day withdrawals, ZKSync and Polygon zkEVM offer ZK proofs with EVM compatibility but SNARK trusted setups, and Starknet offers the strongest proof security and Account Abstraction but requires Cairo and has the smallest developer pool.`,

  visualPrompt: `A comparison table with five rows (chains) and five columns (TVL, Security model, EVM compatible, Withdrawal speed, Key trade-off). Ethereum row: $60B+, N/A (base layer), Yes, 12-15 min, Cost/speed. Arbitrum row: $20B+, Optimistic, Yes, 7-day to L1, Withdrawal delay. Starknet row: $800M+, ZK-STARK (no setup), No, Hours, Cairo required. ZKSync Era row: $800M, ZK-SNARK (setup), Partial, Hours, Trusted setup + EVM limits. Polygon zkEVM row: $150M, ZK-SNARK (setup), Yes (equivalent), Hours, Slower proving. Colour-code cells: green for advantages, amber for trade-offs, red for limitations. No text inside cells — just values and colour.`,
  visualType: 'static',
  visualUrl: 'l2-comparison-table',

  examples: [
    {
      contextTag: '[Protocol team choosing deployment chain]',
      context: 'A DeFi lending protocol team has built their entire system in Solidity and has 18 months of testing behind it. They need: fast withdrawals (no 7-day delay), no code rewrite, and launch within 3 months.',
      scenario: 'They apply the framework. Fast withdrawals eliminates Arbitrum and Optimism (7-day delay). No rewrite eliminates Starknet (Cairo required). ZKSync Era and Polygon zkEVM remain. ZKSync has higher TVL and a slightly larger developer community. Polygon zkEVM has higher EVM equivalence but slower proof generation and lower TVL.',
      outcome: 'The team chooses ZKSync Era: no code rewrite, ZK-based fast withdrawals, reasonable existing TVL and liquidity. They accept the SNARK trusted setup trade-off as acceptable given the ceremony\'s scale. The decision was made by understanding the trade-offs, not by choosing "the best L2."',
    },
    {
      contextTag: '[TVL comparison contextualised by developer count]',
      context: 'A report states: "Starknet has $800M TVL vs Arbitrum\'s $20B — Starknet is 25× smaller and losing the Layer 2 race." An analyst evaluates whether this framing is fair.',
      scenario: 'She checks developer counts: Arbitrum has inherited Ethereum\'s 150,000+ Solidity developer base (EVM-compatible, zero switching cost). Starknet has approximately 3,000 Cairo developers. TVL-per-developer: Starknet $267K, Arbitrum $133K. Starknet\'s TVL per developer is approximately 2× higher despite the total being 25× smaller.',
      outcome: 'The absolute TVL comparison is accurate. The framing is misleading. Starknet is generating $267K TVL per developer vs Arbitrum\'s $133K — meaning its per-developer capital efficiency is roughly double. The constraint is developer count, not protocol quality. Whether Starknet can grow its developer pool is the critical variable — not whether its current TVL matches Arbitrum\'s.',
    },
    {
      contextTag: '[Explaining the 7-day delay to a user considering Arbitrum]',
      context: 'A user has $50,000 in a DeFi position on Arbitrum and wants to understand her withdrawal options before committing more capital.',
      scenario: 'She asks: "How long does it take to get my money back to Ethereum from Arbitrum?" The analyst explains: Arbitrum is an optimistic rollup. The standard withdrawal to Ethereum L1 requires waiting for the 7-day challenge window to close. After 7 days, the funds are available on Ethereum. Third-party fast bridges (like Across Protocol) can move funds in minutes — but they charge a fee (typically 0.05–0.3%) and introduce bridge counterparty risk.',
      outcome: 'She understands she has two paths: standard withdrawal (7 days, no bridge risk), or fast bridge (minutes, small fee, small counterparty risk). She decides her $50,000 position is long enough that the 7-day standard withdrawal is acceptable. She would not accept a 7-day lock on funds she might need urgently. This is the practical user-level implication of the optimistic vs ZK model.',
    },
  ],

  guidedPractice: [
    {
      question: 'A user has $100,000 on Arbitrum and needs to move it back to Ethereum in the next 48 hours. What is the fastest guaranteed withdrawal method?',
      options: [
        'A. Standard Arbitrum withdrawal — completes in 48 hours',
        'B. Standard Arbitrum withdrawal takes 7 days — she would need to use a fast bridge (like Across Protocol) which completes in minutes but charges a fee and introduces bridge counterparty risk',
        'C. All Layer 2 withdrawals to Ethereum are instant',
        'D. She should move to Starknet first, then to Ethereum',
      ],
      correct: 1,
      hint: 'Arbitrum is an optimistic rollup. Recall the challenge window timing.',
      explanation: 'B is correct. Standard Arbitrum → Ethereum withdrawal requires the 7-day challenge window — she cannot complete it in 48 hours without a third-party fast bridge. Fast bridges like Across Protocol move funds in minutes by using liquidity providers on the destination chain, but charge a fee (typically 0.05–0.3%) and introduce the risk of the bridge itself failing. Option A incorrectly states 48 hours for the standard withdrawal.',
    },
    {
      question: 'A protocol team has an existing Solidity codebase and wants to deploy on a ZK rollup with minimal rewriting. Which options should they evaluate?',
      options: [
        'A. Starknet — it is the best ZK rollup',
        'B. ZKSync Era or Polygon zkEVM — both support Solidity/EVM code and use ZK proofs. Starknet requires Cairo and is not an option without a complete rewrite.',
        'C. Arbitrum — it uses ZK proofs and accepts Solidity',
        'D. All ZK rollups accept Solidity — they can choose any',
      ],
      correct: 1,
      hint: 'Which ZK rollups are EVM-compatible? What happens to Solidity code on Starknet?',
      explanation: 'B is correct. ZKSync Era and Polygon zkEVM are EVM-compatible ZK rollups — Solidity code can deploy with minimal changes. Starknet requires Cairo — a complete rewrite. Arbitrum (Option C) is an optimistic rollup, not a ZK rollup. Option D is wrong — Starknet does not accept Solidity.',
    },
    {
      question: 'A TVL table shows: Ethereum $60B, Arbitrum $20B, Optimism $8B, Starknet $800M, ZKSync $800M. A report uses this to conclude "ZK rollups are failing — they have far less TVL than optimistic rollups." What is wrong with this conclusion?',
      options: [
        'A. The TVL figures are incorrect',
        'B. The comparison conflates absolute TVL (where Arbitrum has a historical advantage from EVM compatibility and earlier launch) with architectural quality. ZK rollups are generally younger and started from smaller developer bases. TVL alone does not measure which security model is superior.',
        'C. The conclusion is correct — TVL is the only relevant metric for comparing rollups',
        'D. ZK rollups have more TVL than shown — the report is using outdated data',
      ],
      correct: 1,
      hint: 'TVL reflects many factors: age of the network, developer ecosystem size, EVM compatibility, marketing, and security model. Can one number capture all of these?',
      explanation: 'B is correct. Arbitrum has EVM compatibility — any Ethereum protocol can deploy in days, giving it an enormous developer and liquidity advantage that has nothing to do with proof security. Starknet requires Cairo rewriting — a significant barrier that explains much of the TVL gap independently of architectural quality. Comparing TVL between EVM-compatible and non-EVM-compatible chains without controlling for developer ecosystem size is an incomplete comparison.',
    },
    {
      question: 'Which of the following correctly distinguishes Starknet from ZKSync Era?',
      options: [
        'A. Both use STARK proofs and require Cairo — they are architecturally identical',
        'B. Starknet uses STARK proofs (no trusted setup) and requires Cairo. ZKSync Era uses SNARK proofs (trusted setup) and is EVM-compatible with Solidity. Different proof systems, different compatibility, different developer ecosystems.',
        'C. ZKSync is faster than Starknet because it does not require proof generation',
        'D. Starknet is EVM-compatible and ZKSync requires Cairo',
      ],
      correct: 1,
      hint: 'Use two dimensions: proof system type and EVM compatibility. Which chain uses which proof type and accepts which language?',
      explanation: 'B is correct. Starknet: STARK proofs (no trusted setup, L2.3), Cairo required, Account Abstraction native. ZKSync Era: SNARK proofs (trusted setup required), EVM-compatible, Solidity accepted. These are fundamentally different architectures despite both being ZK rollups. Option A is entirely wrong. Option C mischaracterises proof generation — ZKSync also requires proof generation. Option D has the compatibility reversed.',
    },
    {
      question: 'A protocol needs all three: fast withdrawals (no 7-day delay), no code rewrite from Solidity, and maximum proof security (no trusted setup). Which single L2 satisfies all three?',
      options: [
        'A. Starknet — it has the best proof security',
        'B. ZKSync Era — it has fast withdrawals and accepts Solidity',
        'C. No single L2 satisfies all three. Fast withdrawals + no rewrite = ZKSync or Polygon zkEVM (SNARK, has trusted setup). Maximum proof security (no trusted setup) = Starknet (requires Cairo, no Solidity). The team must choose which requirement to compromise on.',
        'D. Arbitrum — it is the largest L2 and offers the best of all three',
      ],
      correct: 2,
      hint: 'Map each requirement to which chains satisfy it, then find the intersection. Is there any chain in the intersection of all three?',
      explanation: 'C is correct. Fast withdrawals eliminates optimistic rollups (Arbitrum, Optimism). No code rewrite eliminates Starknet. Maximum proof security (no trusted setup) eliminates ZKSync and Polygon zkEVM. There is no chain that satisfies all three simultaneously with current technology. This is not a failure of the ecosystem — it reflects genuine architectural trade-offs. The protocol must rank the three requirements and accept the compromise on whichever they rank lowest.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'TVL table: Ethereum $60B, Arbitrum $20B, Optimism $8B, Starknet $800M, ZKSync Era $800M. Developer counts: Ethereum/Arbitrum/Optimism ~150,000 (shared Solidity base), ZKSync Era ~5,000 (EVM-compatible, some switching from Ethereum), Starknet ~3,000 (Cairo-specific). Calculate TVL-per-developer for Arbitrum and Starknet. What does the ratio tell you about Starknet\'s performance relative to its developer pool size — and what is the critical question this raises?',
      scoringCriteria: [
        'Correctly calculates Arbitrum TVL per developer: $20B ÷ 150,000 = ~$133,333 per developer',
        'Correctly calculates Starknet TVL per developer: $800M ÷ 3,000 = ~$267,000 per developer — approximately 2× higher',
        'Correctly identifies the critical question: if Starknet can grow its Cairo developer pool to even 15,000 developers while maintaining per-developer efficiency, its TVL would be expected to grow proportionally. The constraint is developer supply, not architectural quality.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol team is considering where to deploy. Requirements: (a) fast withdrawals — no 7-day delay, (b) EVM compatibility — existing Solidity contracts with no rewrite, (c) maximum proof security — no trusted setup. Apply the framework from the lesson. State which chains satisfy each requirement, which chains satisfy two of three requirements, and what the team should do given that no chain satisfies all three.',
      scoringCriteria: [
        'Correctly maps requirements: (a) fast withdrawals: Starknet, ZKSync, Polygon zkEVM (eliminates Arbitrum, Optimism). (b) EVM compatible: ZKSync, Polygon zkEVM (eliminates Starknet). (c) No trusted setup: Starknet only (eliminates ZKSync, Polygon zkEVM).',
        'Correctly identifies that ZKSync and Polygon zkEVM satisfy two of three (fast withdrawals + EVM compatible but require trusted setup). Starknet satisfies two of three (fast withdrawals + no trusted setup but requires Cairo).',
        'Correctly concludes the team must rank requirements: if no code rewrite is non-negotiable and fast withdrawals are required, ZKSync Era is the best fit despite the trusted setup. If maximum proof security is non-negotiable, they must accept the Cairo rewrite cost.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A reporter publishes: "All ZK rollups are the same — they all use zero-knowledge proofs." Write a two-sentence correction that is technically accurate and uses the STARK/SNARK distinction. Your correction must not be dismissive of the reporter — acknowledge what is correct in their statement before correcting it.',
      scoringCriteria: [
        'Acknowledges the accurate part: it is correct that all ZK rollups use zero-knowledge proofs to verify transactions without posting each one to Ethereum individually',
        'Provides the accurate distinction: Starknet uses STARK proofs (no trusted setup ceremony required — security from mathematics alone), while ZKSync and Polygon zkEVM use SNARK proofs (a trusted setup ceremony was required before launch). The proof system is a fundamental security architecture difference, not a minor implementation detail.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 2 — AGGREGATE SIMULATIONS
// ─────────────────────────────────────────────────────────────

export const LAB2_AGGREGATE_SIMS = {
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
  description: 'Random draw from all 5 Lab 2 lessons. Tests STARK proof boundaries, transaction lifecycle, Cairo/VM distinction, Account Abstraction features, and L2 comparative analysis. No lesson labels. No hints.',
};

// ─────────────────────────────────────────────────────────────
// LAB 2 — BUILD TASK
// Platform-specified (Lab progression = 2 — no learner choice)
// ─────────────────────────────────────────────────────────────

export const LAB2_BUILD_TASK = {
  id: 'ecosystem-lab-2-build',
  title: 'Finality Comparison: STARK Proofs vs Optimistic Rollups',
  labProgressionNumber: 2,
  selectionMode: 'platform-specified',
  type: 'research-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '45–60 minutes',

  description: `
Write a one-page technical brief explaining how Starknet's STARK-based ZK proof gives users stronger finality guarantees than optimistic rollups.

The brief must include:

1. A timeline diagram comparing two withdrawal paths:
   - Path A: Starknet → Ethereum (ZK proof model)
   - Path B: Arbitrum → Ethereum (optimistic model)
   For each: mark the key stages, the responsible party at each stage, and the time at each stage.

2. Specific time differences:
   - Starknet: approximate time from L2 acceptance to L1 finality
   - Arbitrum: minimum time from L2 acceptance to L1 finality

3. One real user scenario where this difference matters:
   Choose a specific scenario (e.g., a user needing to withdraw $200,000 USDC to Ethereum within 48 hours to meet a financial commitment). Show which chain's model serves the user and which does not.

Output: case-study.md in /junior/lab-02-stark-technology/
  `.trim(),

  outputType: 'written-document',
  outputFormat: 'markdown',
  verificationMethod: 'rubric',

  scoringCriteria: [
    'Timeline diagram present with both paths and all stages labelled with responsible parties',
    'Specific time differences stated accurately: Starknet hours vs Arbitrum 7 days minimum',
    'User scenario is specific — names the amount, the time constraint, and which model serves or fails the user',
    'No technical errors in describing the proof or challenge window mechanics',
    'Written in plain English that a non-technical reader could follow',
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 2 — BOSS BATTLE
// ─────────────────────────────────────────────────────────────

export const LAB2_BOSS = {
  phase1: {
    id: 'ecosystem-lab-2-boss-phase1',
    title: 'Lab 2 Boss — Phase 1: ZK Technology Gauntlet',
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
    id: 'ecosystem-lab-2-boss-phase2',
    title: 'Lab 2 Boss — Phase 2: ZK Technology Certification',
    description: 'No hints. Portfolio push on 100% pass. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are briefing a DeFi protocol team that must choose between Starknet, Arbitrum, and ZKSync Era for deployment.

TASK 1 — Proof System Analysis
Explain to the team: (a) what a STARK proof proves and what it does not prove, (b) why this matters for their user risk assessment, (c) what additional protection they must provide beyond what the proof system offers.

TASK 2 — Transaction Lifecycle Implications
The protocol requires that large settlements (above $100,000) only release collateral after L1 finality. Walk through: which chains satisfy this requirement, what the user experience implication is on each chain, and what the realistic time difference is.

TASK 3 — L2 Selection Recommendation
The team has an existing Solidity codebase (no Cairo). They need fast withdrawals and acceptable proof security. Make a specific recommendation with a justification that acknowledges the trade-off they are accepting.
    `.trim(),

    scoringCriteria: [
      'Task 1: STARK proofs correctly described as proving execution correctness — not code quality or oracle accuracy. Implication correctly stated: audits are required independently of proof system. Additional protection named specifically (audit + oracle redundancy).',
      'Task 2: L1 finality timing correctly stated for each chain. User experience implication correct: Starknet/ZKSync hours, Arbitrum 7 days. The requirement eliminates Arbitrum for time-sensitive settlement.',
      'Task 3: ZKSync Era correctly recommended for this specific set of requirements (Solidity compatible + ZK fast withdrawals). The trade-off accepted (SNARK trusted setup) is correctly identified and acknowledged — not dismissed.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/junior/lab-02-stark-technology/',
      files: [
        { filename: 'stark-technology-brief.md', type: 'narrative' },
      ],
      commitMessage: 'Passed Lab 2 STARK Technology — Junior Ecosystem Deep Dive',
      badgeEarned: 'ZK Technology Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

// ─────────────────────────────────────────────────────────────
// LAB 2 META
// ─────────────────────────────────────────────────────────────

export const LAB2_META = {
  id: 'ecosystem-junior-lab-2',
  title: 'STARK Technology and ZK Fundamentals',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'junior' as const,
  labNumber: 2,
  estimatedHours: 4,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Lab 1 complete',
  description: 'What STARK proofs prove (and don\'t), the five-stage transaction lifecycle, why Cairo exists, Account Abstraction\'s three user features, and precise positioning statements for every major L2.',
  nextLab: 'Lab 3 — Tokenomics and Governance',
};
