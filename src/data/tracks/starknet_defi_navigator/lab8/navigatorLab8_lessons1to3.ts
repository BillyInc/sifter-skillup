// ⚡ Sifter SkillUp — Starknet DeFi Navigator
// INTERMEDIATE · LAB 8 — BRIDGING AND CROSS-CHAIN CAPITAL MOVEMENT · LESSONS 1–3
// Written to: lesson_writing_instructions.txt + sim_instructions_v3.md
// Build task: Expanded Choice (4 options) — Labs 7–9 range per Section 20.5
// Portfolio push: Lab 8 Phase 2 Boss

export const LAB8_LESSONS_1_TO_3 = [

// ─────────────────────────────────────────────────────────────
// LESSON 1 — Bridge Mechanics
// Dominant concept: every bridge moves assets through either
// lock-and-mint or burn-and-mint — and the trust model of
// that mechanism, not its speed, determines your actual risk.
// ─────────────────────────────────────────────────────────────
{
  id: 'bridge-mechanics',
  title: 'Bridge Mechanics: Lock-and-Mint vs Burn-and-Mint',

  explanation: `
In February 2022, Wormhole — a bridge connecting Solana to Ethereum — lost $320 million in a single transaction. An attacker found a flaw in the contract that was supposed to verify that ETH had been deposited on Ethereum before minting wETH on Solana. The flaw let them mint 120,000 wETH without depositing anything. The minted wETH was real and tradeable. The ETH that was supposed to back it did not exist.

To understand why this was possible, you need to understand what every bridge actually does. You hold 2 ETH on Ethereum. You want 2 ETH on Starknet. Ethereum and Starknet are separate blockchains — your Ethereum wallet cannot directly spend its balance on Starknet. A bridge solves this by locking your 2 ETH inside a smart contract — the self-executing code from Starknet Island — on Ethereum, then minting 2 new tokens on Starknet that represent a claim on that locked ETH. Your Starknet tokens are worth 2 ETH as long as the bridge contract holds 2 real ETH in reserve. This is called lock-and-mint bridging.

The Wormhole attacker exploited exactly this model. The Solana contract trusted a message claiming ETH had been deposited on Ethereum. It had not been. The minted wETH had no locked backing. Every bridge that uses lock-and-mint carries one fundamental risk: if the bridge contract is exploited, or if the entity controlling the locks acts dishonestly, your minted tokens become worthless IOUs with no underlying collateral.

A different mechanism exists specifically to avoid this problem for stablecoins. Circle — the company that issues USDC — runs a protocol where you do not lock USDC on the source chain. Instead, you burn it. The source chain USDC is permanently destroyed. Circle's attestation service sees the confirmed burn and authorises the destination chain to mint an identical amount of native USDC. There is no locked collateral to steal. The destination USDC is not a representation — it is real, first-class USDC issued directly by Circle. This is called burn-and-mint bridging. CCTP — Circle's Cross-Chain Transfer Protocol — uses this mechanism.

Not all bridges are operated by the chain they serve. A canonical bridge is one operated directly by the chain's own team, secured by the chain's own validation system. For Starknet, Starkgate is the canonical bridge: every withdrawal is settled using Starknet's STARK validity proof — the same cryptographic guarantee that secures every transaction on the network. No additional trust is required. A third-party bridge uses its own separate validation mechanism — typically a set of validators who sign messages, or an optimistic system where messages are assumed valid unless challenged. Third-party bridges are faster and support more chains, but they add a trust assumption that canonical bridges do not require.
  `.trim(),

  visualPrompt: 'Two-column diagram. Left: "Lock-and-Mint" — Step 1: ETH deposited into bridge contract on Ethereum (padlock icon). Step 2: Bridge mints wETH on Starknet. Red annotation: "If bridge contract is exploited, locked ETH is drained — minted wETH becomes worthless." Right: "Burn-and-Mint (CCTP)" — Step 1: USDC burned on source chain (flame icon, balance drops to zero). Step 2: Circle attestation service confirms burn (checkmark). Step 3: Native USDC minted on destination. Green annotation: "No locked collateral to steal — source token is destroyed before destination token exists."',
  visualType: 'static',
  visualUrl: 'bridge-lock-mint-vs-burn-mint',

  examples: [
    {
      contextTag: '[Lock-and-mint exploit, all LPs affected simultaneously, no exit opportunity]',
      context: 'Wormhole was a multi-chain bridge connecting Solana, Ethereum, and other networks. In February 2022, an attacker exploited a signature verification flaw that allowed the Solana-side contract to mint wETH without verifying a real ETH deposit had occurred on Ethereum.',
      scenario: 'A user had bridged $45,000 of ETH to Solana via Wormhole six months earlier. Their wETH sat in a Solana DeFi protocol earning yield. At the time of the exploit they had no pending transactions and were not actively using the bridge.',
      outcome: 'The attacker minted 120,000 wETH with no backing. Wormhole\'s bridge contract no longer held enough real ETH to redeem all outstanding wETH. The user\'s $45,000 in wETH lost its backing the moment the exploit executed — not because they did anything wrong, but because lock-and-mint means every holder of bridge-issued tokens depends on the bridge contract being permanently uncompromised. There was no warning and no time to exit.',
    },
    {
      contextTag: '[CCTP burn-and-mint, native USDC on destination, no locked-collateral risk]',
      context: 'A DeFi investor holds $80,000 USDC on Ethereum. They want to move it to Starknet to supply to Vesu — the lending protocol from Lab 4 — as collateral for a borrow position. They compare a lock-and-mint bridge (which would produce "bridged USDC" — a representation token) versus CCTP (which produces native Starknet USDC).',
      scenario: 'The investor chooses CCTP. They burn $80,000 USDC on Ethereum. Circle\'s attestation service confirms the burn in approximately 8 minutes. Native USDC is minted on Starknet.',
      outcome: 'The Starknet USDC is first-class USDC issued directly by Circle — accepted by Vesu at full value, no de-peg risk from bridge compromise. There is no locked collateral on Ethereum that an attacker could target. The only trust required is in Circle\'s attestation service. Using a lock-and-mint bridge instead would have produced "bridged USDC" whose long-term value depends on the bridge contract remaining uncompromised indefinitely — a permanently open risk for a long-hold position.',
    },
    {
      contextTag: '[Canonical vs third-party trust model comparison, large one-way transfer]',
      context: 'A portfolio manager needs to move $200,000 of ETH from Ethereum to Starknet for an LP position on Ekubo — the concentrated AMM from Lab 7. They are comparing Starkgate (canonical, ~5-minute deposit, 12-hour withdrawal) versus a third-party bridge (5-minute deposit, 5-minute withdrawal, 7-of-10 multisig validator set, 0.05% fee).',
      scenario: 'They are planning to hold the LP position for at least 90 days. Withdrawal speed is not urgent. The decision reduces to security model and cost.',
      outcome: 'Starkgate: no bridge fee (standard gas only, ~$8). Trust model: Starknet\'s STARK validity proof — no trust assumption beyond what they already accepted by choosing Starknet. Third-party: $200,000 × 0.05% = $100 fee. Trust model: requires 7 of 10 specific validators to remain honest and uncompromised for the entire 90-day holding period. For a $200,000 position held 90 days, $100 in savings does not compensate for adding a 7-of-10 multisig trust requirement on top of Starknet\'s existing security. The manager uses Starkgate.',
    },
  ],

  keyTakeaway: 'Every bridge is either lock-and-mint — where minted tokens depend on locked collateral that can be stolen — or burn-and-mint — where the source token is destroyed before the destination token is created, eliminating locked-collateral risk entirely.',

  guidedPractice: [
    {
      question: 'You deposit 5 ETH into a bridge contract on Ethereum. The bridge mints 5 wETH on Starknet. What determines the real value of your wETH?',
      options: [
        'A. The current ETH market price on Ethereum',
        'B. Whether the bridge contract still holds the 5 ETH you locked — if the contract is compromised, your wETH becomes worthless',
        'C. The total trading volume of the bridge',
        'D. The number of validators in the bridge\'s validator set',
      ],
      correct: 1,
      hint: 'Your wETH is a representation — a claim on something. What is it a claim on, and what happens if that underlying is no longer there?',
      explanation: 'B is correct. In lock-and-mint bridging, your wETH is only as valuable as the locked ETH backing it. If the bridge contract is exploited and the ETH is drained, your Starknet wETH becomes an IOU with no collateral — exactly what happened in the Wormhole exploit. The market price of ETH is irrelevant if the backing no longer exists. Option D affects how hard the bridge is to attack, but does not directly determine your token\'s value.',
    },
    {
      question: 'CCTP is used to move 50,000 USDC from Ethereum to Starknet. What happens to the source chain USDC?',
      options: [
        'A. It is locked in the bridge contract and released when the user later withdraws',
        'B. It is transferred to Circle\'s treasury on Ethereum',
        'C. It is permanently burned — destroyed — before the destination USDC is minted',
        'D. It remains in the user\'s Ethereum wallet as a backup in case the transfer fails',
      ],
      correct: 2,
      hint: 'Burn-and-mint means the source token is permanently destroyed. Which option describes that?',
      explanation: 'C is correct. CCTP burns (permanently destroys) the Ethereum USDC first. Only after the burn is confirmed does Circle\'s attestation service authorise the minting of 50,000 native USDC on Starknet. This is what eliminates locked-collateral risk — there is no pool of locked USDC sitting on Ethereum for an attacker to drain. Option A describes lock-and-mint, which is the mechanism CCTP specifically avoids.',
    },
    {
      question: 'Starkgate is described as a canonical bridge. What makes it different from a third-party bridge?',
      options: [
        'A. It is faster than all third-party bridges for deposits',
        'B. Its security relies on Starknet\'s own STARK validity proof — the same cryptographic guarantee securing every Starknet transaction — rather than a separate validator set',
        'C. It charges lower fees than all third-party bridges',
        'D. It supports more token types than any third-party bridge',
      ],
      correct: 1,
      hint: 'Think about what trust model each bridge type uses. Canonical means the chain\'s own team runs it using the chain\'s own security mechanism.',
      explanation: 'B is correct. Starkgate\'s security is derived from Starknet\'s STARK validity proof — the same system the user already trusted when choosing Starknet. No new trust assumption is required. A third-party bridge introduces a separate requirement: you must also trust its validators, multisig signers, or optimistic watchers. Options A, C, and D may or may not be true in specific situations but are not what defines a canonical bridge.',
    },
    {
      question: 'A bridge uses a 5-of-9 multisig to validate cross-chain messages. How many validators must be compromised before an attacker can forge a valid message?',
      options: [
        'A. 9 — all validators must collude for a forge to succeed',
        'B. 5 — the minimum threshold needed to produce an accepted signature',
        'C. 1 — any single compromised validator can act alone',
        'D. 3 — a simple majority of the required threshold',
      ],
      correct: 1,
      hint: 'A multisig requires a minimum threshold of signatures to be valid. What happens if exactly that threshold is reached by malicious actors?',
      explanation: 'B is correct. A 5-of-9 multisig requires exactly 5 valid signatures to produce an accepted message. An attacker who compromises exactly 5 validators can produce a forged message the bridge contracts will accept. Compare this to Starkgate: forging a Starkgate withdrawal would require breaking Starknet\'s STARK proof system — a cryptographic problem with no known solution at current computing power.',
    },
    {
      question: 'You need to move $120,000 from Ethereum to Starknet: $70,000 is USDC, $50,000 is ETH. Which bridge combination minimises locked-collateral risk while using the best available mechanism for each asset?',
      options: [
        'A. Both via a third-party lock-and-mint bridge — fastest option for both',
        'B. USDC via CCTP (burn-and-mint, no locked collateral), ETH via Starkgate (canonical lock-and-mint, no added trust) — different mechanisms suited to each asset\'s available options',
        'C. Both via Starkgate — canonical for both',
        'D. Both via CCTP — burn-and-mint for both assets',
      ],
      correct: 1,
      hint: 'CCTP only supports USDC. For ETH, which lock-and-mint option adds the fewest new trust assumptions?',
      explanation: 'B is correct. CCTP eliminates locked-collateral risk for USDC — strictly better than lock-and-mint for that asset. ETH has no burn-and-mint path to Starknet, so Starkgate is optimal: canonical lock-and-mint using Starknet\'s own proof, no new trust required. Option C uses Starkgate for USDC when CCTP would be strictly lower risk. Option D is impossible — CCTP does not support ETH.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'You are moving $90,000 ETH from Ethereum to Starknet for a 6-month LP strategy. Two options: (A) Starkgate canonical bridge — STARK validity proof, 5-minute deposit, 12-hour withdrawal, no bridge fee. (B) Third-party bridge — 8-of-12 multisig, 4-minute deposit, 4-minute withdrawal, 0.04% fee. Produce a risk assessment for each. Identify the specific trust model, quantify the fee difference, and recommend one with a written rationale.',
      scoringCriteria: [
        'Option A trust model: Starknet STARK validity proof — no trust assumption beyond the chain itself; cannot be forged without breaking STARK cryptography',
        'Option B trust model: 8-of-12 multisig — requires 8 specific validators to remain honest and uncompromised simultaneously for the full 6-month hold; a concrete, addressable attack surface',
        'Fee calculation: Option A = $0 bridge fee (gas only ~$8). Option B = $90,000 × 0.04% = $36 plus gas. Difference = $28.',
        'Recommendation: Starkgate. $28 in savings does not compensate for adding an 8-of-12 multisig trust assumption on a $90,000 position held 6 months. Withdrawal speed is irrelevant for a planned 6-month hold.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A bridge dashboard shows the following: Bridge A — TVL $2.1B, last audit 4 months ago, validator set 11-of-15 multisig, 0 exploits in 3 years, supports ETH/USDC/USDT. Bridge B — TVL $180M, last audit 14 months ago, validator set 5-of-8 multisig, 1 partial exploit patched 18 months ago, supports 40+ tokens. You need to move $60,000 USDC from Ethereum to Starknet. Interpret each data point and determine which bridge is most appropriate.',
      scoringCriteria: [
        'TVL interpretation: $2.1B TVL signals market confidence and battle-testing at scale. $180M is smaller but not negligible. Higher TVL is also a larger attack target.',
        'Audit recency: 4 months acceptable; 14 months means 14 months of code changes since last independent review — unreviewed changes may have introduced new vulnerabilities.',
        'Validator threshold: 11-of-15 requires 11 validators compromised; 5-of-8 requires only 5 — Bridge A is harder to attack by threshold compromise.',
        'USDC-specific insight: for USDC specifically, CCTP burn-and-mint is the optimal path — eliminates locked-collateral risk entirely, making the bridge comparison moot for USDC. This is the correct recommendation.',
        'If CCTP unavailable: Bridge A preferred — higher threshold, recent audit, clean exploit history.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A colleague who is new to DeFi asks: "I just want to move my USDC from Ethereum to Starknet. Why does the bridge type matter? Aren\'t they all just moving money?" Write a 3-sentence response explaining the core difference between lock-and-mint and burn-and-mint, stating the specific risk each carries, and recommending what they should use for USDC.',
      scoringCriteria: [
        'Correctly explains lock-and-mint: the bridge holds USDC locked on Ethereum and mints a representation on Starknet — the representation is only valuable as long as the bridge contract is not exploited',
        'Correctly explains burn-and-mint (CCTP): the source USDC is destroyed, Circle confirms the destruction, and native USDC is minted — no locked pool to steal from',
        'Correct recommendation: for USDC, use CCTP — it removes the locked-collateral risk that lock-and-mint bridges permanently carry',
        'Response is understandable without prior DeFi knowledge; no jargon used without definition',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 2 — Ethereum to Starknet
// Dominant concept: the right Ethereum-to-Starknet bridge
// depends on token type, transfer size, and acceptable wait
// time — Starkgate for security, CCTP for native USDC, and
// Orbiter only for small amounts where gas cost is prohibitive.
// ─────────────────────────────────────────────────────────────
{
  id: 'eth-to-starknet-bridges',
  title: 'Ethereum to Starknet: Three Paths, Three Trade-offs',

  explanation: `
You hold $150,000 on Ethereum: $90,000 in ETH, $60,000 in USDC. You want all of it on Starknet to begin an LP position on Ekubo — the concentrated AMM from Lab 7 — and to supply USDC to Vesu — the lending protocol from Lab 4. You open a bridge interface and see three options: Starkgate, CCTP, Orbiter. They all move funds from Ethereum to Starknet. They do not all carry the same risk.

Starkgate is operated directly by StarkWare — the team that built Starknet. It uses lock-and-mint mechanics from Lesson 1. What makes it different from third-party lock-and-mint bridges is its trust model: withdrawals from Starknet to Ethereum require a STARK validity proof to be generated and submitted to Ethereum's L1 verifier contract — the same cryptographic guarantee that settles every Starknet transaction. You do not add a new trust assumption. Starkgate supports ETH, STRK, USDC, USDT, wBTC, and DAI. Deposits arrive in approximately 2–5 minutes. Withdrawals take up to 12 hours because they require proof generation and L1 verification — this is the cost of the strongest available security, not a performance limitation.

For USDC specifically, CCTP is available as a superior alternative. Using burn-and-mint mechanics from Lesson 1, your Ethereum USDC is permanently destroyed and Circle's attestation service authorises the minting of native USDC on Starknet in approximately 7–10 minutes. The resulting Starknet USDC is not a bridge-issued representation — it is first-class USDC issued directly by Circle, accepted by Vesu and Ekubo at full value. For any USDC transfer, CCTP strictly reduces risk compared to Starkgate: there is no locked collateral to exploit. The trade-off is that CCTP only works for USDC.

Orbiter is a third-party bridge that works through liquidity relayers: operators who maintain pre-funded balances on multiple chains. When you initiate a transfer, a Starknet-side relayer pays you from their existing balance in 1–3 minutes. They are later reimbursed by collecting your Ethereum deposit. Orbiter charges a flat fee plus a small percentage — totalling approximately $2–4 on small transfers. At amounts below $5,000, Ethereum gas costs for Starkgate (~$8–12) represent a meaningful percentage of the transfer, and Orbiter's lower absolute fee makes economic sense. Above $5,000, Starkgate's security advantage is clear. Above $50,000, Orbiter has a maximum transfer size per transaction that would require multiple sequential transfers.
  `.trim(),

  visualPrompt: 'Three-column comparison table. Header: "Ethereum → Starknet". Columns: Starkgate, CCTP, Orbiter. Rows: Mechanism (lock-and-mint / burn-and-mint / relayer payout), Tokens (ETH/STRK/USDC/USDT/wBTC/DAI / USDC only / ETH/USDC/USDT), Deposit speed (2–5 min / 7–10 min / 1–3 min), Withdrawal speed (up to 12 hrs / 7–10 min / 1–3 min), Trust model (Starknet STARK proof / Circle attestation / Third-party relayers), Best for (any token, large amounts / USDC transfers / small amounts where gas cost > bridge fee). Trust model row colour-coded: green for Starkgate, teal for CCTP, yellow for Orbiter.',
  visualType: 'static',
  visualUrl: 'eth-to-starknet-bridge-comparison',

  examples: [
    {
      contextTag: '[Large ETH transfer via Starkgate, security-first, withdrawal timing non-urgent]',
      context: 'A DeFi investor plans to move $180,000 of ETH from Ethereum to Starknet for a 4-month Ekubo LP position. They will not need to withdraw back to Ethereum during that period. They compare Starkgate against a third-party bridge charging 0.05% with a 7-of-10 multisig and 5-minute withdrawals.',
      scenario: 'Since withdrawal speed is not a factor for a 4-month hold, the comparison reduces to security model and cost.',
      outcome: 'Starkgate cost: standard Ethereum gas (~$9). Third-party cost: $180,000 × 0.05% = $90 plus gas. The $81 difference does not compensate for adding a 7-of-10 multisig trust assumption on a $180,000 position. The investor deposits via Starkgate. ETH arrives in 4 minutes. The 12-hour withdrawal restriction is irrelevant given their 4-month timeline. When they eventually exit, the 12-hour wait is planned for in advance.',
    },
    {
      contextTag: '[USDC via CCTP, native token on destination, no bridge representation risk]',
      context: 'An investor plans to supply $55,000 USDC to Vesu on Starknet as lending collateral. They currently hold the USDC on Ethereum. They compare Starkgate lock-and-mint (produces "bridged USDC") versus CCTP burn-and-mint (produces native USDC).',
      scenario: 'They evaluate which path is appropriate for a USDC position that will serve as long-term lending collateral on Vesu.',
      outcome: 'Starkgate-bridged USDC means their Vesu collateral value depends on both Vesu\'s security and Starkgate\'s security simultaneously. CCTP removes the Starkgate dependency — the resulting Starknet USDC is native, not a representation. There is no locked pool on Ethereum that an attacker could target to invalidate their collateral. The investor uses CCTP. Transfer takes 8 minutes. The $55,000 USDC on Starknet carries no bridge representation risk for the duration of their Vesu position.',
    },
    {
      contextTag: '[Small transfer via Orbiter, fee calculation, appropriate scale threshold]',
      context: 'A developer wants to move $700 of ETH from Ethereum to Starknet to test a new LP range strategy before deploying full capital. They need funds available in under 5 minutes. At current Ethereum gas prices, a Starkgate deposit would cost approximately $9 in gas.',
      scenario: 'They compare Starkgate ($9 gas, ~4 minutes) versus Orbiter ($1.90 flat + 0.06% = $2.32 total, ~2 minutes) for this $700 test.',
      outcome: 'For a $700 transfer, the Starkgate gas cost represents 1.29% of the amount. Orbiter\'s $2.32 represents 0.33%. For a testing amount where capital efficiency matters and the risk at $700 is proportionate, Orbiter is appropriate. When the developer deploys the full $60,000, they will use Starkgate — at that scale, the $9 gas represents 0.015% and the security advantage is clear. The scale threshold: once the Starkgate gas cost falls below approximately 0.2% of the transfer amount, Starkgate is unambiguously preferable.',
    },
  ],

  keyTakeaway: 'Use CCTP for USDC transfers to eliminate locked-collateral risk, Starkgate for ETH and other tokens when security is the priority, and Orbiter only for small amounts where Ethereum gas costs are a significant percentage of the transfer.',

  guidedPractice: [
    {
      question: 'Starkgate withdrawals from Starknet to Ethereum take up to 12 hours. What is the correct explanation for this delay?',
      options: [
        'A. Starkgate is congested — too many users withdrawing creates a processing queue',
        'B. Ethereum\'s finality rules require a 12-hour waiting period for all L2 withdrawals',
        'C. A STARK validity proof must be generated and submitted to Ethereum\'s L1 verifier contract — the 12 hours is the cost of cryptographic security, not a performance limitation',
        'D. Starkgate manually reviews withdrawals above $10,000 for compliance',
      ],
      correct: 2,
      hint: 'Starkgate uses Starknet\'s own security mechanism. What does Starknet submit to Ethereum to prove its state is valid?',
      explanation: 'C is correct. Starkgate withdrawals require a STARK validity proof to be generated and submitted to the L1 verifier contract on Ethereum. This process — sequencing transactions, generating the proof, and publishing it — takes up to 12 hours. It is not a queue or a compliance check. It is the mechanism by which Starkgate achieves canonical security. The wait is the price of cryptographic certainty rather than trusting a third party.',
    },
    {
      question: 'You move 40,000 USDC from Ethereum to Starknet using Starkgate lock-and-mint. An exploit later drains all locked USDC from the Starkgate contract on Ethereum. What happens to your Starknet USDC?',
      options: [
        'A. Nothing — your USDC is already on Starknet and the exploit cannot reach it',
        'B. Your Starknet "USDC" becomes a worthless representation — the locked backing no longer exists, so the minted token has no value',
        'C. Your USDC is automatically returned to your Ethereum wallet',
        'D. The transfer is reversed by Starkgate\'s security system',
      ],
      correct: 1,
      hint: 'In lock-and-mint bridging, your Starknet tokens are representations whose value is backed by locked collateral. What happens to a representation when its backing is destroyed?',
      explanation: 'B is correct. Your Starknet USDC from Starkgate is not native USDC — it is a lock-and-mint representation whose value is backed by locked USDC on Ethereum. If the bridge contract is exploited and the locked USDC is drained, your Starknet token loses its backing and becomes worthless. This is precisely why CCTP is superior for USDC: burn-and-mint leaves no locked pool on Ethereum to exploit.',
    },
    {
      question: 'You need to move $3,500 ETH from Ethereum to Starknet quickly for a market opportunity. Starkgate gas cost is $9. Orbiter total fee is $2.60. Which is appropriate and why?',
      options: [
        'A. Always use Starkgate — canonical security is non-negotiable regardless of amount',
        'B. Orbiter — $2.60 versus $9 for a $3,500 transfer; the $6.40 fee saving is meaningful at this scale, and the security trade-off is proportionate to the amount',
        'C. Neither — amounts under $5,000 should not be bridged',
        'D. Orbiter — third-party bridges are always better for ETH transfers',
      ],
      correct: 1,
      hint: 'At $3,500, the Starkgate gas cost is approximately 0.26% of the transfer. How does the proportional cost compare to Orbiter, and is the security difference proportionate to the amount at risk?',
      explanation: 'B is correct. At $3,500, the fee difference is $6.40. Starkgate gas at $9 represents 0.26% of the amount. For a small test transfer where speed matters, Orbiter is a reasonable tool. The security model difference matters more at larger amounts held for longer periods. Option A is overly absolute — the canonical security premium is most valuable when the amount and duration justify it. Option D is incorrect — Orbiter is not categorically better; it is appropriate only at scales where gas friction is significant.',
    },
    {
      question: 'A trader holds ETH and USDC on Ethereum and wants to bridge both to Starknet. Which bridge combination minimises risk for each asset?',
      options: [
        'A. ETH via Orbiter, USDC via Orbiter — fastest for both',
        'B. ETH via Starkgate, USDC via Starkgate — canonical for both',
        'C. ETH via Starkgate, USDC via CCTP — canonical lock-and-mint for ETH, burn-and-mint eliminating locked-collateral risk for USDC',
        'D. ETH via CCTP, USDC via Starkgate — burn-and-mint for ETH, canonical for USDC',
      ],
      correct: 2,
      hint: 'CCTP only exists for USDC. For ETH, what is the lowest-trust lock-and-mint option?',
      explanation: 'C is correct. CCTP eliminates locked-collateral risk for USDC and is strictly better than any lock-and-mint path for that asset. ETH has no burn-and-mint option, so Starkgate is the best available: canonical lock-and-mint with no added trust assumption. Option B uses Starkgate for USDC when CCTP would be strictly safer. Option D is impossible — CCTP does not support ETH.',
    },
    {
      question: 'You bridge $100,000 USDC via CCTP. Your Ethereum USDC balance is now zero. Your Starknet USDC balance shows 100,000. Where does the locked USDC collateral on Ethereum sit?',
      options: [
        'A. In Starkgate\'s bridge contract on Ethereum as backing',
        'B. In Circle\'s treasury on Ethereum',
        'C. It does not exist — the Ethereum USDC was permanently destroyed during the burn step. There is no locked collateral.',
        'D. Split between Ethereum and Starknet until you confirm the transfer',
      ],
      correct: 2,
      hint: 'CCTP is burn-and-mint. What happened to the Ethereum USDC in the first step of the process?',
      explanation: 'C is correct. CCTP burns (permanently destroys) the Ethereum USDC before Circle\'s attestation authorises the mint. There is no locked collateral anywhere. The Starknet USDC is native — issued by Circle, not backed by a locked pool. Your Ethereum balance is zero because the USDC no longer exists there. This is the fundamental difference from Starkgate lock-and-mint, where the Ethereum side retains locked tokens indefinitely.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'You are deploying the LP strategy from your Lab 7 portfolio onto Starknet and need to bridge: $120,000 USDC, $70,000 ETH, and $15,000 STRK (currently on Ethereum). Available options: Starkgate (supports all three tokens, ~$9 gas per transaction), CCTP (USDC only, ~$5 gas), Orbiter (ETH and USDC, max $15,000 per transaction, 0.06% + $1.50 flat). Produce a bridge plan specifying which bridge to use for each asset, the trust model for each, and calculate total bridge fees.',
      scoringCriteria: [
        'USDC $120,000: CCTP specified. Rationale: burn-and-mint eliminates locked-collateral risk. Fee: ~$5 gas.',
        'ETH $70,000: Starkgate specified. Rationale: canonical lock-and-mint, STARK proof, no added trust. Fee: ~$9 gas.',
        'STRK $15,000: Starkgate specified — only supported bridge. Fee: ~$9 gas.',
        'Orbiter correctly excluded: max $15,000 per transaction means 5+ sequential transactions for $70,000 ETH at 0.06% + $1.50 each = $42 + $7.50 = $49.50 total — more expensive AND less secure than Starkgate at this scale.',
        'Total fees: CCTP ~$5 + Starkgate ETH ~$9 + Starkgate STRK ~$9 = ~$23. Clearly superior to Orbiter for ETH.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Starkgate dashboard shows: ETH deposits today 4,230 ETH ($14.2M), USDC deposits today $8.4M, USDC withdrawals pending $2.1M (8–12 hours estimated), total Starkgate TVL locked on Ethereum $1.9B, last L1 proof submission 47 minutes ago. You need to deposit $200,000 ETH and plan to withdraw $50,000 USDC back to Ethereum within 36 hours. Interpret each data point and determine whether your withdrawal timeline is achievable.',
      scoringCriteria: [
        '$1.9B TVL with $22.6M in daily activity: healthy, functioning bridge — no signs of stress or backlog',
        'Last proof 47 minutes ago: proofs are being generated regularly. Standard cadence is every 2–8 hours depending on transaction volume.',
        '$2.1M in pending withdrawals: normal operational volume, not an unusual backlog',
        'Withdrawal timeline: 8–12 hours per proof cycle means the $50,000 USDC withdrawal will complete within one to two proof cycles — well inside the 36-hour window with 3–4 cycles of margin',
        'Correct conclusion: both transactions are viable. $200,000 ETH deposit arrives in ~5 minutes. $50,000 USDC withdrawal completes within 36 hours with significant margin.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A colleague says: "I\'ve heard Starkgate withdrawals take 12 hours. That sounds completely broken — why would anyone use it over a third-party bridge that takes 5 minutes?" Explain in 3 sentences: what causes the 12-hour delay, what it guarantees, and when the speed trade-off is or is not worth making.',
      scoringCriteria: [
        'Correctly explains the cause: a STARK validity proof must be generated and submitted to Ethereum L1 — this is a cryptographic process, not a queue or limitation',
        'Correctly states the guarantee: the proof makes the withdrawal cryptographically verifiable — you wait for certainty rather than trusting a validator multisig to be honest',
        'Correct trade-off: 12-hour wait is worth it for large amounts or long holds where security premium matters; third-party bridges are acceptable for small, time-sensitive amounts where the added trust is proportionate to the amount at risk',
      ],
    },
  ],
},

// ─────────────────────────────────────────────────────────────
// LESSON 3 — Solana to Starknet via Hyperlane
// Dominant concept: there is no canonical bridge between
// Solana and Starknet — Hyperlane connects them with a
// permissionless validator model that is meaningfully weaker
// than Starkgate's cryptographic security.
// ─────────────────────────────────────────────────────────────
{
  id: 'solana-to-starknet-hyperlane',
  title: 'Solana to Starknet: Hyperlane and the Permissionless Bridge',

  explanation: `
You have been earning yield in Solana DeFi for six months. You want to move $40,000 of that capital to Starknet to access Ekubo LP strategies from Lab 7. You open Starkgate — the canonical bridge from Lesson 2 — and find it connects Ethereum and Starknet only. There is no canonical bridge between Solana and Starknet: Starknet is an Ethereum L2 and its canonical bridge is designed for the Ethereum↔Starknet relationship. Solana is a separate Layer 1 blockchain entirely outside that system. Moving capital from Solana requires a third-party solution.

Hyperlane is a permissionless interoperability protocol that enables message passing between blockchains. For bridging, the sequence works like this: you initiate a transfer on Solana. Hyperlane's on-chain contracts record the transfer message. A set of validators monitoring both chains observe the message and produce attestations — cryptographic signatures confirming the message is valid. Once enough validators have attested, the Starknet-side contract processes the message and releases your tokens. This sequence of on-chain recording, validator attestation, and destination execution is called interchain message passing.

The word "permissionless" refers to who can participate as a validator. Anyone can run Hyperlane validator software without needing approval from Hyperlane or any central authority. The default Solana→Starknet configuration uses a known set of validators with a multisig threshold — for example, 5-of-8 or 6-of-10 depending on the route. This threshold is the attack surface: an attacker who compromises enough validators to reach the threshold can forge a cross-chain message. Compare this to Starkgate, where forging a withdrawal requires breaking Starknet's STARK proof system — a cryptographic problem that has no known solution.

For USDC transfers specifically, Hyperlane integrates with CCTP — the burn-and-mint protocol from Lesson 2. USDC moving from Solana to Starknet via Hyperlane's CCTP integration uses burn-and-mint mechanics: the Solana USDC is destroyed, Circle attests to the burn, and native USDC is minted on Starknet. In this case, Hyperlane's validators are message routers, not the security bottleneck — Circle's attestation service is, which has an established trust model.

For non-USDC assets — wSOL, for example — the Hyperlane transfer uses lock-and-mint mechanics. For amounts below approximately $20,000, direct Hyperlane is a practical option. For larger amounts, routing through Ethereum as an intermediate hop — Solana→Ethereum via Wormhole or Allbridge, then Ethereum→Starknet via Starkgate — provides a more battle-tested security track record for the final leg, at the cost of additional fees and a longer transit time.
  `.trim(),

  visualPrompt: 'Two-path flow diagram from Solana to Starknet. Path A (top, labelled "Direct — Hyperlane"): Solana → Hyperlane validator set (6 validator nodes, label "5/8 threshold") → Starknet. Annotation split: "USDC: burn-and-mint via CCTP — Circle attests" and "Other tokens: lock-and-mint via Hyperlane validators." Path B (bottom, labelled "Intermediate Hop"): Solana → Wormhole/Allbridge → Ethereum → Starkgate → Starknet. Annotation: "Higher assurance for large non-USDC amounts — Starkgate STARK proof on the final leg." Cost/time comparison row: Path A = 1 bridge, ~8 min, ~0.05%. Path B = 2 bridges, ~25 min, ~$20–35 total fees.',
  visualType: 'static',
  visualUrl: 'solana-to-starknet-hyperlane-paths',

  examples: [
    {
      contextTag: '[USDC from Solana to Starknet via Hyperlane CCTP path, Circle attests, burn-and-mint]',
      context: 'A DeFi investor holds $22,000 USDC on Solana, earned from Marinade — a Solana liquid staking protocol — yield strategies. They want to supply this USDC to Vesu on Starknet as lending collateral.',
      scenario: 'They bridge $22,000 USDC via Hyperlane using the CCTP integration path. Transfer initiates on Solana and completes on Starknet in approximately 9 minutes.',
      outcome: 'The Solana USDC is burned (CCTP path, not locked). Hyperlane validators route the message. Circle\'s attestation service confirms the burn and authorises the mint. The investor receives 22,000 native Starknet USDC — not a Hyperlane-issued representation. Because the CCTP integration is used, Hyperlane\'s validator threshold is not the security bottleneck for this transfer — Circle is. The trust model is equivalent to any other CCTP transfer, regardless of the Hyperlane routing layer.',
    },
    {
      contextTag: '[Large non-USDC transfer, intermediate Ethereum hop for security, cost analysis]',
      context: 'An investor wants to move $85,000 of wETH from Solana to Starknet for a 6-month Ekubo LP position. They compare: (A) Direct Hyperlane lock-and-mint — 6-of-10 multisig, $42.50 fee (0.05%), 9 min. (B) Wormhole to Ethereum (~$8 fee, ~15 min) then Starkgate to Starknet (~$9 gas, ~5 min) — $17 total fees, 20 min.',
      scenario: 'They evaluate the security models and costs of each path for a large, long-duration position.',
      outcome: 'Path A costs $42.50 and uses only Hyperlane (6-of-10 multisig, less battle-tested at this scale). Path B costs $17 and uses Wormhole for the Solana→Ethereum leg plus Starkgate\'s STARK proof for the Ethereum→Starknet leg. Path B is $25.50 more expensive but provides Starkgate\'s canonical security for the final leg — the point where the capital is settled on Starknet. For $85,000 held 6 months, paying $25.50 more for the more established security track record is appropriate. The investor uses Path B.',
    },
    {
      contextTag: '[Hyperlane validator model vs Starkgate, attack surface comparison]',
      context: 'A developer researching bridge security compares Hyperlane\'s Solana→Starknet configuration (6-of-10 multisig ISM) with Starkgate\'s canonical model for a technical blog post on bridge security trade-offs.',
      scenario: 'They identify the minimum attack requirement for each system.',
      outcome: 'Hyperlane 6-of-10: an attacker needs to compromise exactly 6 validators — identifiable entities whose keys can be targeted, monitored, or socially engineered. Starkgate: an attacker would need to find a flaw in Starknet\'s STARK proof system — a cryptographic problem that has no known solution at current computing capacity. The developer concludes: Hyperlane is not insecure in absolute terms; it is secure for normal use cases. The distinction matters for very large amounts or long holding periods where the difference between "compromise 6 known validators" and "break modern cryptography" is the relevant comparison.',
    },
  ],

  keyTakeaway: 'Moving capital from Solana to Starknet requires Hyperlane — USDC transfers use the CCTP integration for burn-and-mint security, while large non-USDC transfers may warrant the Ethereum intermediate hop for Starkgate\'s cryptographic security on the final leg.',

  guidedPractice: [
    {
      question: 'Why can\'t you use Starkgate to bridge assets from Solana to Starknet?',
      options: [
        'A. Starkgate is too slow for Solana transaction speeds',
        'B. Starkgate connects Ethereum and Starknet only — it is a canonical L1↔L2 bridge, and Solana is a separate Layer 1 with no relationship to Starknet\'s validity proof system',
        'C. Starkgate does not support USDC for Solana users',
        'D. Solana and Starknet use incompatible token standards',
      ],
      correct: 1,
      hint: 'A canonical bridge connects a specific pair of chains. What is Starkgate\'s chain pair?',
      explanation: 'B is correct. Starkgate is an Ethereum↔Starknet bridge — its security mechanism is specifically designed for the Starknet↔Ethereum settlement relationship using Starknet\'s validity proof. Solana is a separate Layer 1 blockchain with no connection to Starknet\'s proof system. Starkgate has no mechanism to read or verify Solana-side transactions. Hyperlane provides the cross-chain messaging layer that Starkgate\'s architecture was never designed to offer.',
    },
    {
      question: 'What does "permissionless" mean when applied to Hyperlane\'s validator model?',
      options: [
        'A. Transfers through Hyperlane carry no fees',
        'B. Anyone can run a Hyperlane validator without needing approval from Hyperlane or any central authority',
        'C. Users can transfer any token regardless of whether it is listed',
        'D. Validators are anonymous and cannot be identified',
      ],
      correct: 1,
      hint: 'Permissionless in blockchain contexts means no gatekeeping authority controls participation. Apply that to who can become a validator.',
      explanation: 'B is correct. Permissionless means there is no application or approval process to become a Hyperlane validator — anyone can run the validator software. This reduces centralisation risk compared to bridges where a single company controls the validator set. The trade-off: validators are still concrete entities whose keys could be targeted, unlike Starkgate\'s cryptographic proof which requires breaking mathematics rather than compromising individuals.',
    },
    {
      question: 'You move $18,000 USDC from Solana to Starknet via Hyperlane\'s CCTP integration. What security model applies?',
      options: [
        'A. Hyperlane\'s validator multisig — the validators are the primary security mechanism for all Hyperlane transfers',
        'B. Starknet\'s STARK proof — the transfer inherits Starknet\'s native security',
        'C. Circle\'s attestation service — CCTP burns the source USDC and Circle must attest to the burn before minting, making Circle\'s attestation the critical gate regardless of Hyperlane routing',
        'D. Both Hyperlane validators and Circle simultaneously — both must be compromised to forge the transfer',
      ],
      correct: 2,
      hint: 'When CCTP is used, what entity confirms the burn and authorises the mint?',
      explanation: 'C is correct. When Hyperlane routes USDC via the CCTP integration, Circle\'s attestation service is the critical gate — the same trust model as any standard CCTP transfer. Circle must confirm the Solana-side burn before the Starknet mint is authorised. Hyperlane validators handle message routing, but the burn-and-mint mechanism means the USDC security model does not depend on the Hyperlane threshold being uncompromised.',
    },
    {
      question: 'Hyperlane\'s Solana→Starknet route uses a 6-of-10 multisig ISM. How many validators must be compromised for an attacker to forge a bridge message?',
      options: [
        'A. 10 — all must collude',
        'B. 1 — a single compromised validator can act alone',
        'C. 6 — the minimum threshold needed to produce a valid attestation',
        'D. 4 — one less than the required threshold',
      ],
      correct: 2,
      hint: 'A multisig requires a minimum threshold. How many malicious signatures equal that threshold?',
      explanation: 'C is correct. A 6-of-10 multisig requires exactly 6 valid signatures. An attacker who compromises exactly 6 validators can produce a valid attestation the bridge accepts. This is a concrete, addressable attack surface. Compare to Starkgate: forging a withdrawal requires breaking Starknet\'s STARK proof — currently computationally infeasible. Neither bridge is "broken," but the nature of the trust model is fundamentally different.',
    },
    {
      question: 'You have $75,000 of wSOL on Solana to bridge to Starknet for a 5-month hold. Path A: direct Hyperlane lock-and-mint, $37.50 fee (0.05%), 9 min. Path B: Wormhole to Ethereum ($12 fee, 18 min) then Starkgate ($9 gas, 5 min) = $21 total, 23 min. Which is more appropriate and what is the fee difference?',
      options: [
        'A. Path A — faster and cheaper by $16.50; Hyperlane is sufficiently secure for any amount',
        'B. Path B — $21 versus $37.50; Path A actually costs more AND offers a lower security assurance for a large, long-duration position',
        'C. Path A — the $16.50 savings justifies the security difference at this amount',
        'D. Path B — Path B is always preferable regardless of amount or cost',
      ],
      correct: 1,
      hint: 'Calculate Path A fee: $75,000 × 0.05%. Compare to Path B: $12 + $9. Which is cheaper, and what does the cheaper option\'s security model look like?',
      explanation: 'B is correct. Path A fee: $75,000 × 0.05% = $37.50. Path B fee: $12 + $9 = $21. Path B is $16.50 cheaper AND uses Starkgate\'s STARK proof for the final Starknet leg. Path A costs more and provides a weaker security assurance. This is an unusual case where the more secure path is also less expensive — making Path B the clear choice. For smaller amounts (under ~$10,000) where Path B fees represent more than 0.5% of the transfer, direct Hyperlane may be more economical despite the security difference.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-communication',
      scenario: 'A Solana DeFi user messages you: "I have $30,000 in yield tokens I want to move to Starknet. I tried Starkgate but it doesn\'t even show Solana. Is it broken?" Write a 4-sentence response: explain why Starkgate doesn\'t support Solana, identify what to use instead, distinguish the best path for USDC versus non-USDC assets at this amount, and give a specific recommendation.',
      scoringCriteria: [
        'Correctly explains Starkgate limitation: Starkgate connects Ethereum and Starknet only — it is not broken; Solana is simply outside its scope',
        'Correctly identifies Hyperlane as the Solana→Starknet solution',
        'Distinguishes USDC vs non-USDC: USDC via Hyperlane CCTP integration (burn-and-mint, Circle attests, equivalent security to standard CCTP). Non-USDC at $30,000: evaluate Ethereum intermediate hop for Starkgate\'s security on the final leg',
        'Specific recommendation for $30,000: USDC portion via Hyperlane CCTP. Non-USDC: at $30,000, consider the intermediate hop — the fee comparison ($21 via Wormhole+Starkgate vs ~$15 direct Hyperlane) is marginal and the security difference is meaningful at this scale.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'You are moving $95,000 from Solana to Starknet: $60,000 USDC and $35,000 wETH. Options for the wETH: (A) Direct Hyperlane lock-and-mint — 6-of-10 validators, $17.50 fee, 9 min. (B) Wormhole to Ethereum then Starkgate — $20 total, 23 min. Produce a risk assessment for the wETH transfer only. Compare trust models, state the minimum attacker requirement for each, and recommend with written rationale.',
      scoringCriteria: [
        'Option A trust model: Hyperlane 6-of-10 validator multisig. Minimum attacker requirement: compromise 6 of 10 validators to forge a message.',
        'Option B trust model: Wormhole (guardian multisig, 13-of-19 threshold based on Wormhole\'s published validator set) + Starkgate STARK proof for the Starknet settlement leg.',
        'Risk comparison: Option B creates a two-stage attack requirement with different mechanisms — guardian compromise for Wormhole AND cryptographic break for Starkgate final leg; effectively higher combined requirement.',
        'Fee comparison: Option A $17.50 versus Option B $20 — Option B is $2.50 more expensive.',
        'Recommendation: Option B for $35,000 held long-term. $2.50 additional cost for meaningfully stronger assurance on the Starknet final leg is appropriate. USDC portion separately via Hyperlane CCTP.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Hyperlane Solana→Starknet dashboard shows: all-time bridged volume $48M, daily volume $320K, 0 exploits in last 30 days, validator set 8 validators with 5-of-8 threshold, last audit 6 months ago by a recognised firm, transfer fee 0.05%. You are considering bridging $12,000 USDC and $9,000 wSOL. Interpret each data point. Is $21,000 total appropriate for direct Hyperlane?',
      scoringCriteria: [
        '$48M all-time, $320K daily: smaller than major bridges — less battle-tested at scale, but active and functioning',
        '5-of-8 threshold: requires 5 validators compromised to forge. Concrete but not trivial attack requirement.',
        '0 exploits in 30 days: positive but limited sample window — not a security guarantee',
        '6-month audit age: acceptable for current use; would watch for upcoming re-audit',
        'USDC $12,000: CCTP integration applies — Circle is the security bottleneck, not Hyperlane validators. Appropriate at this amount.',
        'wSOL $9,000: lock-and-mint via Hyperlane. At $9,000, the direct Hyperlane path is proportionate. The Ethereum intermediate hop becomes worth considering above ~$25,000–$30,000 for non-USDC assets.',
        'Conclusion: $21,000 total is within appropriate range. Both transfers recommended as described.',
      ],
    },
  ],
},

];  // end LAB8_LESSONS_1_TO_3
