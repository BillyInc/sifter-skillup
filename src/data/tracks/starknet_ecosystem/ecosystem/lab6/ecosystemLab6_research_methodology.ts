// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// INTERMEDIATE · LAB 6 — PROTOCOL RESEARCH METHODOLOGY
// 5 Lessons + Aggregate Sims + Build Task + Boss Battle
//
// Prerequisite: Labs 1–5 complete. Junior certified.
//
// Lesson type classification:
//   L6.1 — TYPE A: audit reading, risk assessment (no code evaluation)
//   L6.2 — TYPE B: tokenomics checklist with FDV calc, supply pressure model
//   L6.3 — TYPE A: four-source moat framework, composability, judgment
//   L6.4 — TYPE B: revenue formula (DEX = volume × fee; lending = interest spread)
//   L6.5 — TYPE A: research workflow, process, judgment
//
// Intermediate level: learner has Junior foundation.
// Terminology can be used without full re-anchoring — callback phrases apply.
// Still: never use jargon without a one-clause definition on first appearance.

// ─────────────────────────────────────────────────────────────
// L6.1 — Reading Smart Contract Audits
// TYPE A — Dominant concept: a smart contract audit lists
// vulnerabilities by severity and category. Knowing the category
// changes what risk the finding represents — a Critical oracle
// manipulation is a different threat than a Critical access control.
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_1 = {
  id: 'l6-1-reading-audits',
  title: 'Reading Smart Contract Audits',
  trackType: 'A',
  lessonNumber: 1,

  explanation: `
In 2016, a company called The DAO raised $150 million from thousands of investors by selling tokens that represented governance rights over a pool of Ethereum funds. Three months later, an attacker drained $60 million through a vulnerability in the smart contract code. The vulnerability — called re-entrancy — was known in the security community. It had been written about. But The DAO's code had not been audited by a firm that would have caught it.

After that event, smart contract audits became standard practice. Today, every credible DeFi protocol has been audited before launch. But an audit report is only useful if you know how to read it. This lesson teaches you to extract what matters from an audit report — not to evaluate the code itself, but to assess the risk profile it describes.

WHAT AN AUDIT REPORT IS

A smart contract audit is a security review of a protocol's code by an independent firm. The firm's developers read the code in detail, attempt to find vulnerabilities before attackers do, and produce a written report listing every issue they found.

The report lists vulnerabilities by severity:
— Critical: funds at immediate risk of being stolen or permanently locked. A protocol with an unresolved Critical finding should not hold user funds.
— High: significant risk that could lead to fund loss under specific conditions. Requires urgent resolution.
— Medium: limited risk — conditions for exploitation are difficult or impact is bounded. Should be resolved before mainnet launch.
— Low: minor issue — minimal financial risk. Code quality or efficiency concern.
— Informational: no security risk — documentation, code clarity, or gas optimisation suggestions.

The count of findings by severity is the first thing you read. But the category of each finding tells you more than the severity count alone.

SIX VULNERABILITY CATEGORIES — AND WHY CATEGORY MATTERS

Two protocols might each have one Critical finding. But a Critical finding involving oracle manipulation tells you a completely different story from a Critical finding involving access control. The category determines the attack path — which tells you whether the risk is systematic or isolated.

CATEGORY 1 — RE-ENTRANCY
What it is: a contract calls an external contract (e.g., sending ETH to a user's address). Before the first call finishes, the external contract calls back into the original. If the original contract has not updated its state yet (e.g., recorded that the withdrawal happened), the second call can withdraw again. This cycle can drain the entire contract.
Why it matters: re-entrancy was responsible for the $60M DAO hack in 2016. Modern Cairo and Solidity have safeguards, but re-entrancy in complex cross-protocol interactions remains a real risk.

CATEGORY 2 — INTEGER OVERFLOW/UNDERFLOW
What it is: in programming, numbers have a maximum value. If arithmetic exceeds this maximum (overflow) or drops below the minimum (underflow), the number wraps around to a completely wrong value — a balance could become effectively infinite, or a price calculation could return zero.
Why it matters: modern languages (Rust, newer Solidity versions, Cairo) handle this automatically. But older contracts or custom arithmetic logic can still be affected.

CATEGORY 3 — ACCESS CONTROL
What it is: some functions in a contract should only be callable by specific addresses — the admin, the protocol team, a specific contract. If the access control check is missing or misconfigured, an attacker can call a privileged function from any address.
Why it matters: access control failures are directly exploitable — an attacker who can call the "drain treasury" function will drain the treasury. These are often among the highest-severity findings because the attack path is straightforward.

CATEGORY 4 — ORACLE MANIPULATION
What it is: a protocol reads a price from an oracle (e.g., Pragma gives it the current ETH/USD price). If the oracle can be manipulated — by temporarily moving a low-liquidity price feed through a large trade — the protocol may act on a fake price. Attackers use this to borrow more than their collateral is worth, or to trigger incorrect liquidations.
Why it matters: oracle manipulation is particularly dangerous in lending protocols (where collateral valuations drive liquidations). Using a price from a low-liquidity AMM pool as an oracle — rather than a robust multi-source oracle like Pragma — is the classic vulnerability.

CATEGORY 5 — LOGIC ERRORS
What it is: the code does exactly what it says — but what it says is wrong for the intended use case. The protocol behaves as programmed, but the programming itself is incorrect. This is harder to find than missing access checks because there is no single "wrong" pattern — the evaluator must understand the protocol's intent.
Why it matters: logic errors can enable economic exploits that are mathematically valid. The contract does not fail — it does exactly what it says, and what it says is wrong.

CATEGORY 6 — ECONOMIC EXPLOITS
What it is: the code has no bugs in the traditional sense, but the protocol's economic design contains an attack path. Flash loans (borrow enormous capital with no collateral for one transaction) combined with governance votes, price manipulation, or arbitrage can exploit protocols that were not designed with flash loan scenarios in mind.
Why it matters: economic exploits cannot always be found by reading code — they require modelling the protocol's economic dynamics. This is why some auditors specifically do economic/game theory analysis as a separate engagement from code review.

WHAT "RESOLVED" MEANS — AND WHAT RESIDUAL RISK REMAINS

When an audit report lists a finding as "resolved," it means the protocol team submitted a code fix and the auditor verified that the specific finding was addressed. It does not mean:
— The fix itself introduced no new vulnerabilities (new code is new attack surface)
— The audit covered every possible vulnerability (auditors are human and have time limits)
— The protocol is now safe from economic exploits not in the original audit scope

For any finding labelled "resolved," residual risk remains: the fix was not audited at the same depth as the original code. A Critical finding "resolved" is substantially better than "unresolved" — but it is not equivalent to "this attack path was never possible."

AUDIT STALENESS

An audit covers the code at a specific point in time. When a protocol deploys upgrades after an audit, the audit no longer covers the upgraded code. A protocol whose last audit is 18 months old with 3 major upgrades since has a stale audit — the code running today has not been independently reviewed.

Stale audit risk = unreviewed code changes since the last audit. The larger the changes and the longer the gap, the higher the residual risk.

HOW TO ASSESS A PROTOCOL FROM ITS AUDIT

Step 1: Count findings by severity. Any unresolved Critical or High = do not deposit.
Step 2: Identify the category of the most severe finding. Oracle manipulation Critical differs from access control Critical — know what you are dealing with.
Step 3: Check audit date and upgrade history. A 6-month-old audit with no upgrades since = relatively fresh. An 18-month-old audit with 4 upgrades since = stale.
Step 4: Check who audited. Tier-1 firms (OpenZeppelin, Trail of Bits, Certora, Peckshield) are more thorough and harder to fool than unknown firms. An audit from an unknown firm is better than no audit — but the assurance is weaker.
  `.trim(),

  keyTakeaway: `An audit's severity count (Critical, High, Medium) tells you how many issues were found — but the vulnerability category (re-entrancy, oracle manipulation, access control, logic error) tells you what the specific attack path is, and audit staleness tells you how much unreviewed code exists between the audit date and today.`,

  visualPrompt: `A two-panel diagram. Panel 1 "Severity Pyramid": a downward triangle divided into five tiers — Critical (red, top), High (orange), Medium (amber), Low (yellow), Informational (grey, bottom). Each tier shows a one-line description. Panel 2 "Six Vulnerability Categories": six boxes in a 2×3 grid. Each box: category name + one-sentence attack path + one real exploit example. Re-entrancy: DAO 2016 $60M. Integer overflow: balanced issue. Access control: direct function call. Oracle manipulation: lending protocol price feed. Logic errors: economic design flaw. Economic exploits: flash loan governance attack. Each box colour-coded by typical severity: red for re-entrancy and access control, orange for oracle and economic, amber for logic, yellow for integer.`,
  visualType: 'static',
  visualUrl: 'audit-severity-and-category-framework',

  examples: [
    {
      contextTag: '[Analyst reading a Starknet lending protocol audit]',
      context: 'A Starknet lending protocol (Vesu-equivalent fictional: "Lendr") publishes its audit report from a Tier-1 firm. The audit summary: 1 Critical (resolved), 3 High (2 resolved, 1 unresolved), 8 Medium (all resolved), 15 Low (all resolved).',
      scenario: 'The analyst reads the Critical finding category: oracle manipulation. The protocol was using an Ekubo pool spot price as its collateral oracle — vulnerable to flash loan manipulation. The resolved fix: migrated to Pragma as the primary oracle with a time-weighted average price. She reads the unresolved High: access control on a fee-collection function callable by any address (currently collecting zero fees, so no immediate financial risk).',
      outcome: 'Her assessment: "Critical finding resolved with appropriate fix (Pragma oracle migration). One High unresolved — access control on fee collection. Current financial risk is minimal since fee switch is inactive, but the unresolved finding is a known weakness. I would deposit below $10,000 pending resolution. Above $10,000 I wait for the High to be resolved and re-audited." This is a structured, evidence-based risk assessment, not an impression.',
    },
    {
      contextTag: '[Stale audit risk materialising]',
      context: 'A Starknet protocol was audited 20 months ago with all findings resolved at that time. Since then, they have shipped 4 major upgrades including a complete rewrite of their liquidation engine.',
      scenario: 'An attacker reads the public audit report and notes: the liquidation engine listed in the audit is not the liquidation engine currently running. The current engine was written after the audit and has never been independently reviewed. The attacker finds a logic error in the new liquidation engine that allows them to trigger liquidations of healthy positions.',
      outcome: 'The attack drains $3.2M from the protocol. The protocol\'s response: "We were audited." The analyst\'s response: "The audit covered code that no longer runs. Upgrades to core protocol components — especially the liquidation engine — require their own audit. A 20-month-old audit of replaced code provided no protection for the replaced code." Audit staleness is not a technicality — it is a real risk that materialised here.',
    },
    {
      contextTag: '[Non-technical investor misreading "all resolved"]',
      context: 'A non-technical investor reads: "Protocol X\'s audit found 2 Critical and 4 High vulnerabilities. All have been resolved." She interprets this as: "The protocol has been checked and is safe."',
      scenario: 'An analyst explains: "Resolved" means the specific issues identified were fixed and the fixes were verified by the auditor. It does not mean the protocol has zero vulnerabilities — it means the ones found during this particular audit engagement, at this point in time, with this audit scope, were addressed. Auditors find vulnerabilities based on their time budget and expertise — they do not certify that no other vulnerabilities exist.',
      outcome: 'The investor revises her interpretation: "The protocol had 2 Critical and 4 High findings, all addressed. The audit provides meaningful security assurance — more than an unaudited protocol — but is not a guarantee of safety. I should also check the audit date, upgrade history, and auditor reputation." This is the correct, calibrated interpretation of "all resolved."',
    },
  ],

  guidedPractice: [
    {
      question: 'An audit report shows: 1 Critical (unresolved), 2 High (resolved), 8 Medium (resolved). Should you deposit $50,000 into this protocol? Why?',
      options: [
        'A. Yes — 2 of 3 major findings are resolved, which is a passing score',
        'B. No — an unresolved Critical means funds are at immediate risk of being stolen or permanently locked. No amount of resolved lower-severity findings offsets an unresolved Critical.',
        'C. Yes — the $50,000 deposit will help the protocol fix the Critical by generating fee revenue',
        'D. It depends on what the Critical finding category is',
      ],
      correct: 1,
      hint: 'What does a Critical severity finding mean in an audit context?',
      explanation: 'B is correct. Critical severity means funds are at immediate risk. An unresolved Critical is an open attack path — the auditor has told the world where the vulnerability is, and it has not been fixed. Depositing $50,000 into a protocol with an unresolved Critical is depositing $50,000 into a protocol the auditor has flagged as actively exploitable. Option D would be relevant for assessing the nature of the risk, but the correct action (do not deposit) does not change based on the category — an unresolved Critical of any category is disqualifying.',
    },
    {
      question: 'A Critical finding is categorised as "oracle manipulation." A Critical finding at a different protocol is categorised as "access control." What is the key difference in what each vulnerability means?',
      options: [
        'A. They are the same severity — the category does not matter',
        'B. Oracle manipulation: the attack path requires the attacker to move a price feed (typically via a large flash loan trade) before exploiting the incorrect price. Access control: the attack path is direct — any address can call the privileged function immediately with no setup.',
        'C. Access control is always more dangerous than oracle manipulation',
        'D. Oracle manipulation only affects DEXs; access control only affects lending protocols',
      ],
      correct: 1,
      hint: 'Think about the steps an attacker needs to take to exploit each. Which requires more setup?',
      explanation: 'B is correct. Oracle manipulation requires economic setup — the attacker needs to move a price feed by executing large trades in the underlying market, which costs capital and may only be feasible with flash loans. It is exploitable but requires preparation. Access control failures are typically directly exploitable — if the function checks no permissions, any address can call it immediately. Both are Critical severity (immediate fund risk), but the attack complexity is very different. Knowing this helps assess how quickly an exploit could be executed.',
    },
    {
      question: 'A protocol\'s last audit was 18 months ago. Since then, they have deployed 3 major upgrades covering approximately 60% of the codebase. What is the "audit coverage" of the currently running code?',
      options: [
        'A. 100% — the original audit covered the protocol architecture, which has not changed',
        'B. Approximately 40% — the original audit covered the old codebase, but 60% of the currently running code was written after the audit and has not been independently reviewed',
        'C. 0% — any change invalidates the entire audit',
        'D. 60% — the new code was reviewed internally by the team',
      ],
      correct: 1,
      hint: 'An audit covers the code at a specific point in time. What happens to code written after the audit date?',
      explanation: 'B is correct. The original audit covered code that has since been partially replaced. The 40% of code that has not changed still has some audit coverage (though stale). The 60% written after the audit has never been independently reviewed — no auditor has checked it for vulnerabilities. This is the stale audit risk: a protocol can claim "we are audited" while running code that has never been reviewed. Internal review by the team (option D) is not equivalent to independent audit — the team wrote the code and may not spot their own errors.',
    },
    {
      question: 'What does it mean when an audit finding is listed as "Informational"?',
      options: [
        'A. The finding is critical but the auditor wants to inform the public before the protocol fixes it',
        'B. The finding represents no security risk — it is a code quality, documentation, or gas efficiency suggestion with no financial impact',
        'C. The finding was too complex for the auditor to classify properly',
        'D. The finding has been resolved and is now only informational',
      ],
      correct: 1,
      hint: 'Where does Informational sit in the severity hierarchy: Critical, High, Medium, Low, Informational?',
      explanation: 'B is correct. Informational is the lowest severity level — below Low. It represents code quality feedback with no security or financial implications: "this function could be renamed for clarity," "this constant could be extracted for readability," "this loop could be more gas-efficient." Informational findings do not affect whether a protocol is safe to use. They affect code quality over time. Option D is wrong — resolved findings appear in a separate "resolved" section, not reclassified as Informational.',
    },
    {
      question: 'An audit by an unknown firm with no reputation shows "0 Critical, 0 High, 5 Medium, 8 Low." A different protocol has an audit by Trail of Bits (a Tier-1 firm) showing "1 Critical (resolved), 2 High (resolved), 10 Medium (resolved)." Which provides stronger security assurance and why?',
      options: [
        'A. The unknown firm — zero Critical and High findings means it is safer',
        'B. Trail of Bits — a Tier-1 firm\'s audit, with findings resolved, provides stronger assurance than an unknown firm\'s clean report. An unknown firm may lack the expertise to find Critical and High vulnerabilities that exist.',
        'C. Both provide identical assurance — audit severity counts are objective',
        'D. The unknown firm — fewer findings means less risk',
      ],
      correct: 1,
      hint: 'What does "0 Critical found" mean if the auditing firm lacks the expertise to find Critical vulnerabilities?',
      explanation: 'B is correct. A clean audit from a weak auditor is a false negative risk — the vulnerabilities may exist but were not found. Trail of Bits found real Critical and High vulnerabilities (which is what good auditors do) and verified the fixes. That is evidence of a thorough engagement. An unknown firm\'s clean report could mean: (1) the protocol truly has no major vulnerabilities, or (2) the auditors were not skilled enough to find them. You cannot distinguish the two without assessing auditor quality. A resolved Critical from Trail of Bits is better than a "clean" report from an unvetted firm.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Starknet protocol publishes an audit summary from Peckshield (a recognised Tier-1 firm, 2 months ago). Findings: 2 Critical (both resolved — one access control, one re-entrancy), 4 High (3 resolved, 1 unresolved — the unresolved High is an economic exploit requiring a flash loan of >$500M to execute, and the protocol\'s maximum TVL is $12M), 11 Medium (all resolved), 22 Low (all resolved). The protocol has deployed no upgrades since the audit. Assess: (1) would you deposit $5,000 today, (2) would you deposit $50,000 today, (3) what specific condition would change your answer on the $50,000 decision?',
      scoringCriteria: [
        '$5,000 deposit: yes — Critical findings resolved by a Tier-1 firm, fresh audit (2 months), no upgrades since. The unresolved High requires a $500M+ flash loan to exploit on a $12M TVL protocol — economically impractical. Risk is low enough for a small deposit.',
        '$50,000 deposit: marginal — $50,000 is 0.4% of TVL. The unresolved High economic exploit requires $500M+ to execute but is still technically unresolved. Reasonable to deposit at this scale but with position monitoring.',
        'Condition that changes $50,000 decision: if TVL grows to $500M+ (making the flash loan attack economically viable at that scale), or if the unresolved High is newly assessed as exploitable with lower capital — re-evaluate immediately.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A Starknet lending protocol\'s last audit was 22 months ago. All findings were resolved at that time. Since the audit: they deployed a new liquidation engine (replacing the old one entirely), added a second collateral type (stETH, not in the original audit), and integrated a new oracle (Chainlink on Starknet, not available at audit time). Estimate: what percentage of the currently running code is covered by the original audit? What are the three highest-priority components requiring an immediate re-audit?',
      scoringCriteria: [
        'Audit coverage estimate: the liquidation engine and new oracle integration are entirely new code (not covered). The stETH collateral addition required new validation logic (not covered). Estimate: 40-55% of critical path code is unreviewed — the highest-risk components are entirely post-audit.',
        'Three highest-priority re-audit components: (1) Liquidation engine — directly handles user fund liquidations, critical for solvency. (2) Chainlink oracle integration — the oracle is the price truth for all liquidations; a manipulable integration is a Critical risk. (3) stETH collateral validation — new collateral type with different risk properties (liquid staking token with depeg risk) not covered by original audit scope.',
        'Conclusion: the 22-month gap with core component replacement makes the original audit effectively stale for risk assessment purposes. Would not deposit above $5,000 without a re-audit of the three flagged components.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A non-technical investor friend asks: "Protocol X\'s last audit found 2 Critical and 4 High findings. They say all have been resolved. That means it\'s totally safe now, right?" Write a two-sentence response that is accurate about what "resolved" means and what residual risk remains.',
      scoringCriteria: [
        '"Resolved" correctly explained: the auditor verified that the specific code changes addressed those specific issues — the attack paths identified in those findings have been closed. It does not mean the protocol has no remaining vulnerabilities or that the fixes themselves introduced no new issues.',
        'Residual risk correctly identified: any new code written as part of the fixes is not audited to the same depth as the original review, and no audit covers every possible attack path — only the ones within the auditor\'s scope and findings during that engagement.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L6.2 — Evaluating Tokenomics Models
// TYPE B — Dominant concept: a seven-point tokenomics checklist
// produces a structured risk score, and the FDV/market cap ratio
// (dilution multiplier) is the single most revealing number —
// combined with supply pressure modelling to assess near-term risk.
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_2 = {
  id: 'l6-2-tokenomics-evaluation',
  title: 'Evaluating Tokenomics Models',
  trackType: 'B',
  lessonNumber: 2,

  prerequisiteCheck: `
PREREQUISITE CHECK
──────────────────────────────────────────────────────────────────────────────
REQUIRED    Primer L0.2 — FDV, circulating supply, vesting, dilution basics
REQUIRED    Lab 3 L3.4 — Four-step tokenomics framework and dilution multiplier
RECOMMENDED Lab 3 L3.1 — STRK token as applied example
──────────────────────────────────────────────────────────────────────────────
  `,

  explanation: `
In Lab 3 you learned the four-step tokenomics framework (allocation audit, timeline analysis, value accrual check, incentive alignment test) and the four red flags. This lesson adds two new analytical tools: a seven-point structured checklist that produces a scoreable output, and a supply pressure model that calculates whether the market can absorb upcoming unlocks.

The difference between Lab 3 and Lab 6 is depth: Lab 3 taught you to identify risks. Lab 6 teaches you to quantify them.

LAYER 1 — WHY QUANTIFICATION MATTERS

In 2021, a DeFi protocol called Wonderland (TIME token) attracted $1.5B in deposits by offering >80,000% APY. A qualitative assessment said "the yield looks unsustainably high." A quantitative assessment showed: the protocol was minting 0.64% more tokens every 24 hours, meaning annual inflation of approximately 233%. A staking yield of 80,000% on a token inflating 233% annually produces a real yield that is mathematically negative — you earn tokens, but each token is worth 233% less each year. Quantification exposed what qualitative assessment could only suggest.

LAYER 2 — THE SEVEN-POINT TOKENOMICS CHECKLIST

Apply in this order. Each point is binary: pass or fail. Six or seven passes = low risk. Four or five = moderate risk. Three or below = high risk.

POINT 1 — Insider allocation under 40%?
Formula: (team allocation % + investor allocation %) < 40%.
Pass: below 40%. Fail: at or above 40%.
Note: Foundation/DAO treasury is NOT counted as insider allocation — it has a different mandate (ecosystem development, not profit extraction).

POINT 2 — Vesting cliff over 6 months?
Check: when do the first insider tokens unlock?
Pass: more than 6 months after launch. Fail: under 6 months — insiders can sell soon after launch.

POINT 3 — Emission schedule published?
Check: is there a complete, time-specific release schedule for all allocation categories?
Pass: full schedule published with dates or block numbers. Fail: vague ("tokens will be distributed over time") or missing categories.

POINT 4 — Value accrual mechanism exists?
Check: does holding the token generate economic return (fee share, staking yield from protocol revenue, buyback)?
Pass: at least one revenue-backed value accrual mechanism exists and is currently active.
Fail: governance-only token with no current economic rights, or yield funded entirely by token inflation (inflationary staking).

POINT 5 — FDV/market cap ratio under 5×?
Formula: FDV ÷ current market cap.
FDV = total supply × current price. Market cap = circulating supply × current price.
Pass: ratio < 5×. Moderate concern: 5×–10×. High concern: above 10×.
A 10× ratio means 10× more supply is coming than currently exists — demand must grow 10× to absorb it at current price.

POINT 6 — Treasury controlled by multisig with more than 3 signers?
Check: the protocol's treasury wallet — how many signers, what threshold?
Pass: 4+ signers (at least some independent), 3-of-N or higher threshold.
Fail: single signer, 2-of-2 where both are co-founders, or no multisig.

POINT 7 — Token distribution on-chain verifiable?
Check: can you independently verify the allocation percentages by looking at on-chain wallet balances?
Pass: all major allocation wallets are publicly labelled and the on-chain balances match the claimed percentages.
Fail: allocation claims cannot be verified on-chain — the team says the distribution is correct but on-chain data does not confirm it.

LAYER 3 — THE SUPPLY PRESSURE MODEL

Even with a passing checklist score, a protocol can face severe near-term price pressure if large unlock events coincide with low trading volume. This is the supply pressure model.

Inputs:
— Monthly unlock volume (tokens): from the vesting schedule
— Current daily trading volume (tokens): from Dune or DefiLlama
— Current token price (USD)

Calculations:
Monthly unlock in USD = monthly unlock (tokens) × current price
Daily volume absorption capacity (tokens): daily trading volume
Days to absorb monthly unlock = monthly unlock (tokens) ÷ daily volume (tokens)

Risk classification:
Under 5 days: low pressure
5–20 days: moderate pressure — monitor unlock dates
Above 20 days: high pressure — sustained selling likely during unlock window

Combined with FDV/market cap ratio:
If FDV/market cap > 10× AND monthly unlock absorption > 20 days: critical dilution risk — both long-term and near-term supply are problematic.

LAYER 4 — HOW THIS CONNECTS TO THE RESEARCH PROCESS

The seven-point checklist and supply pressure model feed directly into the Lab 6 Build Task (full protocol research report) and Lab 9 (grant evaluation). A research report without a tokenomics score is incomplete. A grant evaluation that does not model unlock pressure is missing a key risk dimension. These tools are not academic exercises — they are the structured outputs that justify conclusions in professional ecosystem research.
  `.trim(),

  keyTakeaway: `A seven-point tokenomics checklist (insider allocation, cliff, emission schedule, value accrual, FDV ratio, treasury multisig, on-chain verifiability) produces a scoreable risk assessment — and the supply pressure model (monthly unlock ÷ daily volume) quantifies whether the market can absorb upcoming unlocks without sustained sell pressure.`,

  visualPrompt: `Two-panel diagram. Panel 1 "Seven-Point Checklist": a scorecard table with seven rows. Each row: criterion name, pass/fail condition, example pass/fail. Colour coding: green tick for pass conditions, red X for fail conditions. A "Checklist Score" gauge at the bottom: 7/7 = low risk (green), 5-6/7 = moderate (amber), ≤4/7 = high risk (red). Panel 2 "Supply Pressure Model": a formula diagram showing three inputs (monthly unlock tokens, daily volume tokens, current price) → two calculations (monthly unlock USD, days to absorb) → risk classification (under 5 days: low, 5-20: moderate, above 20: high). A 2×2 risk matrix at the bottom: x-axis = FDV/market cap ratio, y-axis = absorption days — quadrant labels: low risk, near-term risk only, long-term risk only, critical dilution risk.`,
  visualType: 'static',
  visualUrl: 'tokenomics-checklist-and-supply-pressure-model',

  examples: [
    {
      contextTag: '[Analyst applying the full checklist to a Starknet DEX token]',
      context: 'A new Starknet DEX launches with a token. The analyst applies the seven-point checklist using the protocol\'s published tokenomics documentation and on-chain data.',
      scenario: 'Point 1: Team 18% + Investors 19% = 37% — PASS (< 40%). Point 2: 12-month cliff — PASS (> 6 months). Point 3: Complete 36-month vesting schedule published with monthly release amounts — PASS. Point 4: Fee switch active, 10% of trading fees to token holders — PASS. Point 5: FDV $240M, Market cap $18M, ratio = 13.3× — FAIL (> 10×). Point 6: 4-of-6 multisig treasury, 2 independent signers — PASS. Point 7: All major allocation wallets labelled on Voyager, balances match claims — PASS. Score: 6/7.',
      outcome: 'Assessment: Moderate risk (6/7). One failure: FDV ratio of 13.3× is the primary concern — 13× more supply coming than currently circulating. Recommendation: acceptable for positions under $5,000. For larger positions, model the quarterly unlock volume against trading volume to assess when the highest pressure months are.',
    },
    {
      contextTag: '[Supply pressure model applied to a near-term unlock event]',
      context: 'A Starknet protocol has a large team token unlock in 6 weeks. The analyst models the supply pressure.',
      scenario: 'Monthly unlock: 80M tokens. Current price: $0.45. Monthly unlock in USD: $36M. Current daily trading volume: 3M tokens/day. Absorption calculation: 80M ÷ 3M = 26.7 days. Classification: high pressure (above 20 days). FDV/market cap ratio: 8×.',
      outcome: 'The analyst flags the position: "The 6-week unlock event represents 26.7 days of full trading volume at current pace — sustained sell pressure is likely during the unlock window. Combined with an 8× FDV/market cap ratio, this is a near-term risk event. Recommendation: reduce position or hedge before the unlock date. Re-evaluate after the first 30 days post-unlock to see whether organic buying absorbs the supply."',
    },
    {
      contextTag: '[On-chain verifiability check catching a discrepancy]',
      context: 'A protocol claims: "Community allocation: 55%. Team allocation: 20%." An analyst checks on-chain.',
      scenario: 'She opens Voyager and identifies the team\'s labelled wallet: balance 220M tokens. Total supply: 1B tokens. Team wallet = 22% of total supply — 2 percentage points above the claimed 20%. She also checks the "community" multisig: balance 470M tokens. The remaining 310M tokens are in unlabelled wallets that match no published allocation.',
      outcome: 'The 310M unlabelled tokens (31% of supply) do not match any published category. She flags: "Point 7 fails — the on-chain distribution does not match the published allocation. There are 310M tokens in unlabelled wallets. This is either undisclosed team/investor allocation or treasury not publicly acknowledged. Request documentation from the team before including this protocol in any research report." On-chain verification caught what the whitepaper concealed.',
    },
  ],

  guidedPractice: [
    {
      question: 'A protocol has: Team 22%, Investors 21%, Foundation 35%, Community 22%. What is the insider allocation percentage and does it pass or fail Point 1?',
      options: [
        'A. 80% — includes Foundation. Fails.',
        'B. 43% — Team + Investors. Fails (above 40%).',
        'C. 22% — team only. Passes.',
        'D. 43% — Team + Investors. Passes (40% is not a hard threshold).',
      ],
      correct: 1,
      hint: 'Insider allocation = Team + Investors only. Foundation is not counted. Calculate and compare to 40%.',
      explanation: 'B is correct. 22% (team) + 21% (investors) = 43% — above the 40% threshold. Point 1 fails. Foundation allocation (35%) is not counted as insider allocation — the Foundation has an ecosystem development mandate and different incentive structure from team/investor profit extraction. Option A incorrectly includes Foundation. Option C uses only the team. The 40% threshold is a hard pass/fail criterion in this checklist.',
    },
    {
      question: 'Monthly unlock = 60M tokens. Daily trading volume = 8M tokens. Token price = $0.80. Calculate the monthly unlock in USD, the absorption ratio (days), and the risk classification.',
      options: [
        'A. $48M; 7.5 days; moderate pressure.',
        'B. $48M; 0.13 days; low pressure.',
        'C. $60M; 7.5 days; moderate pressure.',
        'D. $48M; 7.5 days; high pressure.',
      ],
      correct: 0,
      hint: 'Monthly unlock USD = 60M × $0.80. Absorption days = 60M ÷ 8M. Risk: under 5 = low, 5-20 = moderate, above 20 = high.',
      explanation: 'A is correct. Monthly unlock USD: 60M × $0.80 = $48M. Absorption days: 60M ÷ 8M = 7.5 days. Risk classification: 7.5 days falls in the 5–20 day "moderate pressure" range — the market needs 7.5 days of full trading volume to absorb one month of unlocks. This warrants monitoring the unlock date but is not a crisis. Option B incorrectly calculates absorption. Option C uses wrong USD calculation. Option D misclassifies 7.5 days as high pressure.',
    },
    {
      question: 'A protocol\'s token has a staking yield of 15% APY. The protocol issues new tokens to fund staking — total supply grows 20% annually to pay stakers. Does this pass or fail Point 4 (value accrual mechanism exists)?',
      options: [
        'A. Pass — 15% APY is a real economic return for holders',
        'B. Fail — the yield is inflationary (funded by minting new tokens, not protocol revenue). Real yield = 15% − 20% = −5%. Holders lose purchasing power despite "earning" a positive APY.',
        'C. Pass — whether the yield is inflationary or not does not affect whether value accrual exists',
        'D. Fail — staking yields never qualify as value accrual mechanisms',
      ],
      correct: 1,
      hint: 'Point 4 requires revenue-backed value accrual, not just token-denominated yield. If the protocol mints tokens to pay yield, who is ultimately paying?',
      explanation: 'B is correct. Point 4 specifically requires that the value accrual mechanism be revenue-backed — funded by actual protocol income (trading fees, interest spread, protocol revenue), not by minting new tokens. Inflationary staking (minting tokens to pay stakers) is not a revenue-backed mechanism — it is a wealth transfer from non-stakers to stakers, funded by dilution. The real yield = staking APY − annual inflation rate = 15% − 20% = −5%. Option A confuses nominal yield with real yield. Option D is too absolute — staking qualifies if funded by protocol revenue.',
    },
    {
      question: 'A protocol\'s FDV is $1.8B and its current market cap is $120M. What is the dilution multiplier and what does it imply?',
      options: [
        'A. 15× — at current price, 15× more supply will enter circulation than currently exists. Demand must grow 15× to maintain price as all tokens unlock.',
        'B. 1.5× — minor dilution, no near-term concern.',
        'C. $1.68B — the absolute gap between FDV and market cap.',
        'D. 0.067× — the market cap as a fraction of FDV.',
      ],
      correct: 0,
      hint: 'Dilution multiplier = FDV ÷ market cap. $1.8B ÷ $120M = ?',
      explanation: 'A is correct. $1.8B ÷ $120M = 15×. This means 15× more token supply is coming relative to what currently exists in circulation. At the current price, demand must increase 15× as the locked tokens unlock — otherwise, the price will fall proportionally. A 15× multiplier is a high-concern signal (threshold for checklist failure is > 5×). Option B dramatically understates the ratio. Option C is a dollar difference, not the multiplier. Option D inverts the calculation.',
    },
    {
      question: 'A protocol claims "community allocation: 60%." The emission schedule shows this 60% unlocks uniformly over 10 years. The team holds 25% vesting over 3 years. By year 3, what percentage of total supply has the team received vs the community?',
      options: [
        'A. Team 0%, community 18% — team\'s cliff has not expired',
        'B. Team 25% (fully vested by year 3), community 18% (6% per year × 3 years). Team tokens are fully liquid before the majority of community tokens unlock.',
        'C. Team 25%, community 60% — both fully distributed by year 3',
        'D. Team 8.3%, community 18% — equal vesting pace',
      ],
      correct: 1,
      hint: 'Team: 25% over 3 years = fully vested by year 3. Community: 60% over 10 years = 6% per year × 3 years = 18%.',
      explanation: 'B is correct. By year 3: team has received 100% of their 25% allocation — fully vested, fully liquid. The community has received 18% of total supply (6%/year × 3 years). Despite a "60% community" headline, by year 3 the team holds 25% fully liquid vs the community\'s 18% received. Insiders become fully liquid years before the community reaches majority allocation. This is the "community-first framing is structurally misleading" finding — technically accurate for the 10-year horizon, misleading for the early years when power matters most.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Apply the seven-point checklist to this Starknet protocol token. Team: 22%, cliff 9 months, 36-month linear vest. Investors: 20%, cliff 6 months, 24-month linear vest. Foundation: 30%, flexible distribution. Community: 28%, 48-month uniform vest. Total supply: 500M. Circulating supply: 25M (5%). Price: $1.60. Daily trading volume: 2.5M tokens. Treasury: 3-of-5 multisig, 2 independent. All major wallets labelled on-chain matching claims. Fee switch active since month 3, 12% of trading fees to token holders. Score all seven points. Calculate FDV, market cap, and dilution multiplier. Run supply pressure model for month 4 (investor vesting begins month 7, team month 10, community month 1 of unlock is happening now). State overall risk rating.',
      scoringCriteria: [
        'Points: P1 pass (42% — wait, 22+20=42% — FAIL). P2 pass (9-month team cliff > 6 months). P3 pass (full schedule). P4 pass (fee switch active, revenue-backed). P5 fail (FDV = 500M × $1.60 = $800M; market cap = 25M × $1.60 = $40M; ratio = 20× — critical). P6 pass (3-of-5, 2 independent). P7 pass. Score: 5/7.',
        'Month 4 unlock: community 28% / 48 months = 2.92M tokens/month. Absorption: 2.92M ÷ 2.5M = 1.17 days — low pressure. But the 20× FDV ratio dominates the risk assessment.',
        'Overall: High risk (5/7, failing P1 and P5). Primary concern: 20× dilution multiplier with 42% insider allocation above the 40% threshold. Fee switch (P4 pass) is a positive — it creates real economic value accrual that partially offsets dilution risk. Not recommended for significant positions until dilution pressure becomes clearer in 12–18 months.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol has $200M market cap and $2B FDV. Monthly unlock volume for the next 6 months averages 15M tokens. Token price: $1.00. Current daily trading volume: $2M (2M tokens). Model the supply pressure. Then model a scenario where a market correction drops the price to $0.60 while the unlock continues. State the combined risk and whether you would maintain a $30,000 position through the next 6 months.',
      scoringCriteria: [
        'Base case: monthly unlock in USD = 15M × $1.00 = $15M. Absorption days: 15M tokens ÷ 2M daily volume = 7.5 days. Moderate pressure. FDV/market cap = $2B/$200M = 10× — checklist P5 fails.',
        'Price drop scenario: at $0.60, market cap drops to $120M. FDV becomes $1.2B (10× ratio maintained). But daily volume in tokens may also drop as participants exit — assume volume falls 30% to 1.4M tokens/day. Absorption days: 15M ÷ 1.4M = 10.7 days. Pressure increases from moderate to higher-moderate.',
        'Position decision: at $30,000 in a 10× dilution scenario with 7.5-day absorption under normal conditions and potential volume compression in a correction: a risk-conscious position would be reduced to $10,000-15,000 or hedged before the high-pressure unlock months. The combination of structural dilution (10×) and near-term supply pressure is too concentrated for full position maintenance.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write the tokenomics section of a research report on a Starknet protocol in 150 words. Use the following data: total supply 300M, circulating 30M (10%), price $2.20, FDV $660M, insider allocation 38%, 12-month cliff, fee switch active (8% of fees to token holders), monthly unlocks starting in month 13 averaging 8M tokens, daily trading volume 3.2M tokens. Include: FDV, circulating supply, dilution multiplier, unlock schedule with absorption ratio, value accrual mechanism. Make one risk assessment statement.',
      scoringCriteria: [
        'FDV correctly stated: $660M. Circulating supply: 30M (10% of total). Dilution multiplier correctly calculated: $660M ÷ (30M × $2.20) = $660M ÷ $66M = 10×.',
        'Unlock schedule with absorption: starting month 13, 8M tokens/month. Absorption: 8M ÷ 3.2M = 2.5 days — low pressure. This is a positive signal.',
        'Value accrual: fee switch active, 8% of trading fees to token holders — revenue-backed, not inflationary. Risk statement: "Primary risk is the 10× dilution multiplier — 10× more supply entering circulation over the vesting period. This is partially offset by the fee switch providing revenue-backed yield and the low unlock absorption ratio (2.5 days) suggesting market capacity is adequate."',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L6.3 — Competitive Moat Analysis
// TYPE A — Dominant concept: four sources of DeFi competitive moat —
// liquidity depth, protocol integrations (composability), user
// network effects, and token incentives — and the first three are
// durable while the fourth evaporates when emissions end.
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_3 = {
  id: 'l6-3-competitive-moat',
  title: 'Competitive Moat Analysis',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
In 1997, Warren Buffett wrote to Berkshire Hathaway shareholders about what he called "economic moats" — the structural advantages that allow a business to defend its market position against competitors. A great business, he argued, is not one with a good product today, but one with walls around it that make it difficult for competitors to enter and take market share. The wider and deeper the moat, the safer the castle.

DeFi protocols have moats too — but they work differently from traditional businesses. A DeFi protocol cannot rely on patents, regulatory licenses, or exclusive supplier relationships. Its moats come from the economic dynamics of how DeFi liquidity and user behaviour self-organise. Understanding these moats is how you distinguish a protocol that is temporarily popular from one that is structurally defensible.

Four sources of DeFi competitive moat — from most durable to least durable.

MOAT SOURCE 1 — LIQUIDITY DEPTH (MOST DURABLE)

Imagine two currency exchange kiosks at an airport. Kiosk A has a huge inventory of every currency at tight rates. Kiosk B opened last week with a small inventory. Even if Kiosk B offers slightly better rates, most travellers will use Kiosk A — they know it can handle any amount without running out.

In DeFi, the same logic applies. Deeper liquidity means better trade prices (less slippage — the price shift caused by large trades). Better prices attract more traders. More traders pay more trading fees. More fees attract more liquidity providers. More liquidity providers create deeper liquidity. This is a self-reinforcing flywheel: more liquidity → better prices → more volume → more fees → more LPs → more liquidity.

The first DEX to achieve significant liquidity on a chain typically maintains dominance because challengers face the bootstrapping problem: you cannot offer good prices without liquidity, and you cannot attract liquidity without good prices. Ekubo's 92% Starknet DEX market share is a direct expression of this flywheel — not because Ekubo has the best technology, but because it achieved liquidity depth first.

MOAT SOURCE 2 — PROTOCOL INTEGRATIONS (DURABLE)

Composability means protocol A can call protocol B within the same transaction — the output of one becomes the input of another, with no trust required between the protocols. This is different from integration (which requires coordination between teams) — composability happens at the smart contract level.

Composability creates lock-in because protocols that build on top of you cannot easily switch. If 7 lending protocols use AVNU's price data, and a competitor DEX wants them to switch, each of those 7 protocols must: rewrite their price feed integration, test that the new integration works correctly, get that change audited, and accept the timeline and cost of the migration. The switching cost grows with every integration that depends on you.

AVNU integrates with Ekubo, JEDI, and 4 other DEXs. 7 lending protocols use AVNU's price data. This creates two layers of moat for AVNU: (1) its routing aggregation is more valuable as more DEX liquidity sources exist, and (2) the 7 protocols that read its price data create switching costs for AVNU — those protocols would need to find and verify an alternative price source.

MOAT SOURCE 3 — USER NETWORK EFFECTS (MODERATELY DURABLE)

Some protocols become more valuable as more users join — not because of liquidity or integrations, but because of reputation, social proof, or competitive dynamics. Gaming is the clearest example: a multiplayer game with 10,000 players is more valuable to each player than one with 100 players, because there are more people to play against.

In DeFi, this is less prominent than in gaming but still relevant: a lending protocol with a large, stable depositor base develops a reputation for reliability that attracts risk-averse capital. A protocol with consistent historical performance (no exploits, stable yields) attracts conservative institutions. Reputation itself is a network effect.

MOAT SOURCE 4 — TOKEN INCENTIVES (TEMPORARY)

Liquidity mining — paying token rewards to liquidity providers — can bootstrap initial liquidity and user adoption. Many successful protocols have used this strategy effectively. But token incentives are not a durable moat.

When emissions end, mercenary capital leaves. If the only reason LPs are in a pool is the token reward, they exit when the reward stops. If the protocol has not built genuine liquidity depth, user network effects, or composability depth during the incentive period, it is left with an empty pool.

Token incentives are a tool for moat construction — not a moat themselves. The question for any protocol running a liquidity mining program: are they using the incentive period to build the first three moat types, or are they simply renting liquidity that will disappear when emissions end?

WORKED EXAMPLE 1 — AVNU MOAT ANALYSIS

AVNU is a DEX aggregator — it routes token swaps through the best combination of available DEXs. Applying the four-source framework:

Liquidity depth: AVNU does not hold its own liquidity — it routes through other protocols. This moat is therefore borrowed from the DEXs it routes through. If Ekubo disappeared, AVNU's routing quality would collapse. AVNU's liquidity depth moat is dependent, not independent. Score: medium.

Protocol integrations: 7 lending protocols use AVNU's price data. AVNU integrates with Ekubo, JEDI, and 4 others. The integration depth creates lock-in. Score: high.

User network effects: AVNU benefits from being the default routing entry point for Starknet DeFi — users who learn to use AVNU first tend to stay. But this is not a strong network effect (users can switch to a competing aggregator easily). Score: low.

Token incentives: none currently relevant. Score: N/A.

AVNU's strongest moat: protocol integrations (composability lock-in from lending protocols using its data). AVNU's most fragile moat: liquidity depth (entirely borrowed from underlying DEXs).

WORKED EXAMPLE 2 — EKUBO MOAT ANALYSIS

Ekubo is a concentrated AMM — the primary spot DEX by volume on Starknet.

Liquidity depth: 92% of Starknet DEX volume. Classic flywheel — deep liquidity attracts volume, volume generates fees that attract more liquidity. Score: very high.

Protocol integrations: AVNU, several other aggregators, and at least 5 lending protocols route through or price against Ekubo. Score: high.

User network effects: LPs choose Ekubo because other LPs are in Ekubo (more competition = more volume through any given range = more fees per range). Score: medium-high.

Token incentives: not a primary mechanism for Ekubo's current market position.

Ekubo's moat is the strongest of any Starknet protocol: both liquidity depth and protocol integrations are high, and they reinforce each other (more integrations → more volume → more liquidity → better prices → more integrations).
  `.trim(),

  keyTakeaway: `DeFi competitive moats come from four sources — liquidity depth (self-reinforcing flywheel), protocol integrations (composability lock-in), user network effects (reputation and social dynamics), and token incentives (temporary) — and the first two are the most durable because they create structural switching costs that competitors cannot easily overcome with better technology or lower fees.`,

  visualPrompt: `A four-row moat framework card. Row 1 "Liquidity Depth" (dark green, most durable): flywheel diagram — liquidity → better prices → more volume → more fees → more LPs → back to liquidity. Label: "Bootstrapping problem prevents challengers." Row 2 "Protocol Integrations" (green): lock-in diagram showing 7 protocols depending on AVNU's price data, each with a switching cost arrow. Label: "Composability creates structural dependencies." Row 3 "User Network Effects" (amber): reputation curve showing trust building over time. Label: "Moderately durable — depends on product quality." Row 4 "Token Incentives" (red, temporary): emission curve that drops to zero, with liquidity line dropping in parallel. Label: "Rented liquidity — disappears when emissions end." Durability bar on the right side — longest for Row 1, shortest for Row 4.`,
  visualType: 'static',
  visualUrl: 'defi-four-moat-sources-framework',

  examples: [
    {
      contextTag: '[New DEX competing with Ekubo\'s composability moat]',
      context: 'A well-capitalised new DEX launches on Starknet with a concentrated liquidity design comparable to Ekubo\'s and 0.01% lower fee tiers on major pairs. Their thesis: better price execution will capture market share.',
      scenario: 'The analyst models the 12-month competitive challenge. Week 1: the new DEX attracts $5M in initial liquidity from LPs chasing higher farming rewards. Their TVL/volume ratio is strong. Week 4: AVNU\'s routing algorithm detects that the new DEX offers marginally better execution on some pairs and begins routing 8% of trades there. Ekubo still captures 84% of AVNU-routed volume due to deeper pools on major pairs.',
      outcome: 'Month 6: the new DEX\'s farming rewards slow. Mercenary LPs begin withdrawing. TVL falls from $12M to $4M. Without TVL, AVNU routes less volume to them. Without volume, fee income falls, making LP rewards less attractive. A year after launch, the new DEX holds 4% of Starknet DEX market share — still alive, but far from displacing Ekubo. The analyst notes: "Fee advantage is insufficient against the liquidity depth flywheel. To displace Ekubo, a challenger would need to offer meaningfully superior returns to LPs for long enough to build comparable depth — requiring $50M+ in sustained incentives."',
    },
    {
      contextTag: '[AVNU\'s composability moat working as expected]',
      context: 'A new DEX aggregator launches on Starknet, offering slightly better UI than AVNU and claiming 0.01% better average execution. 5 DeFi protocols had already integrated AVNU\'s price data into their contracts.',
      scenario: 'The 5 protocols\' developers evaluate whether to switch their price feed from AVNU to the new aggregator. Switching requires: rewriting the oracle integration, testing in a staging environment, getting an audit for the changed code, and timing the migration to avoid disrupting active positions. Estimated timeline: 6 weeks per protocol. Estimated cost: $20,000–$40,000 per audit.',
      outcome: 'None of the 5 protocols switched. The switching cost — 6 weeks of engineering, $20,000–$40,000 audit cost, and migration risk — was not justified by a 0.01% execution improvement. AVNU\'s composability moat held perfectly: the integrations created structural lock-in that a slightly better alternative could not overcome. The new aggregator captured 12% of retail swap volume (where switching cost is near-zero) but zero of the professional protocol integrations.',
    },
    {
      contextTag: '[Token incentives building vs renting liquidity]',
      context: 'Two Starknet protocols both ran 6-month liquidity mining programs, each paying $3M in token rewards. Protocol A used the incentive period to build composability — they got 4 lending protocols to use their price feed and 2 gaming protocols to use their swap routing. Protocol B paid rewards and made no integration investments.',
      scenario: 'Month 7 (first month after emissions end): Protocol A\'s TVL drops 20% as mercenary LPs exit, but volume falls only 8% because the 4 lending protocols continue to route through them. Protocol B\'s TVL drops 65% and volume drops 70% — almost all activity was incentive-driven.',
      outcome: 'Protocol A retained its composability moat after emissions ended. The liquidity mining program funded a period during which it built real structural advantages. Protocol B was left with no moat after $3M spent — a cautionary example of renting liquidity without building the structural assets that make it sticky. The analyst\'s lesson: evaluate liquidity mining programs not by TVL during the incentive period, but by how many integrations and composability dependencies were built that will outlast the incentives.',
    },
  ],

  guidedPractice: [
    {
      question: 'Ekubo holds 92% of Starknet DEX market share. A new DEX launches with 0.02% lower fee tiers and $15M in initial liquidity. According to the liquidity depth moat framework, why is this insufficient to displace Ekubo?',
      options: [
        'A. 0.02% lower fees are not enough to matter to traders',
        'B. Ekubo\'s existing liquidity depth means it can offer better price execution (less slippage) than the new DEX despite the fee difference — and the flywheel means every day Ekubo operates, it reinforces its depth advantage',
        'C. Ekubo has regulatory approval that prevents new competitors',
        'D. Starknet users are loyal to Ekubo by habit and will not switch regardless of price',
      ],
      correct: 1,
      hint: 'Deep liquidity enables lower slippage. Compare the impact of lower fees vs lower slippage for a large trade.',
      explanation: 'B is correct. On a $10,000 trade, a 0.02% fee difference saves $2. But a 0.5% slippage difference (from executing in a shallow pool vs a deep pool) costs $50. Traders optimise for total execution cost, not just fee tier. Ekubo\'s deep liquidity enables lower slippage that more than compensates for the new DEX\'s fee advantage on most trade sizes. And the flywheel operates every day: Ekubo\'s volume generates fees, attracting more LPs, deepening liquidity further. The new DEX must simultaneously offer better prices (requiring deep liquidity) to attract volume (to attract LPs to deepen liquidity). The bootstrapping problem makes this extremely difficult.',
    },
    {
      question: 'What is composability, and how is it different from integration?',
      options: [
        'A. Composability and integration are synonyms — both mean one protocol works with another',
        'B. Integration requires coordination between teams (API agreements, partnership discussions). Composability happens at the smart contract level — protocol A can call protocol B directly in a single transaction with no trust required and no team coordination needed.',
        'C. Composability requires protocol teams to hold each other\'s tokens',
        'D. Integration is on-chain; composability is off-chain',
      ],
      correct: 1,
      hint: 'What distinguishes a direct smart contract call (no permission needed) from an API integration (requires the other party\'s agreement)?',
      explanation: 'B is correct. Integration in the traditional sense requires both parties to agree, build to each other\'s APIs, maintain compatibility, and coordinate changes. Composability happens at the protocol level — smart contract A can call smart contract B directly in a transaction without any agreement between teams. This is why composability creates stronger lock-in than typical integrations: the lock-in is at the code level, not the relationship level. You cannot "break the partnership" to force protocols to switch — they switch only when they rewrite their own code.',
    },
    {
      question: 'A protocol runs a $5M liquidity mining program for 6 months, achieving $80M TVL during the program. When emissions end, TVL falls to $8M. What does this pattern tell you about the protocol\'s moat?',
      options: [
        'A. The protocol was highly successful — peak TVL of $80M proves strong demand',
        'B. The TVL was rented, not earned — 90% of the deposited capital was mercenary (following rewards). The protocol failed to build durable moats (composability integrations, liquidity flywheel) during the incentive period. The $5M program produced no lasting advantage.',
        'C. The 90% TVL decline is normal — all protocols experience this after mining ends',
        'D. The protocol should immediately launch another incentive program to recover the TVL',
      ],
      correct: 1,
      hint: 'What does the TVL ratio (peak vs post-emission) tell you about the quality of the capital attracted?',
      explanation: 'B is correct. A 90% TVL decline after emissions end is a clear signal that virtually all the capital was incentive-driven — it had no organic reason to stay. Compare to a protocol that used its incentive period to build composability: they might see 30–40% TVL decline (mercenary exits) but retain 60–70% of organic capital that stays because the protocol offers genuine utility. The $5M was spent renting liquidity, not building a moat. A subsequent program would produce the same outcome unless the underlying product offering changes.',
    },
    {
      question: 'AVNU integrates with Ekubo and 5 other DEXs. Seven lending protocols use AVNU\'s price data. Which of AVNU\'s moat sources is strongest, and which is most fragile?',
      options: [
        'A. Strongest: user network effects. Fragile: liquidity depth.',
        'B. Strongest: protocol integrations (7 lending protocols create composability lock-in). Fragile: liquidity depth (AVNU holds no liquidity itself — all its liquidity is borrowed from underlying DEXs it routes through).',
        'C. Strongest: liquidity depth. Fragile: protocol integrations.',
        'D. Strongest: token incentives. Fragile: user network effects.',
      ],
      correct: 1,
      hint: 'What asset does AVNU actually own, and what does it depend on from others?',
      explanation: 'B is correct. AVNU\'s composability moat (7 lending protocols using its price data) is strong — each integration creates switching costs for those protocols. This is an asset AVNU built. AVNU\'s liquidity depth, however, is borrowed — it routes through Ekubo and others but holds no liquidity itself. If Ekubo disappeared or stopped routing to AVNU, AVNU\'s quote quality would collapse immediately. This dependence is AVNU\'s most fragile position: its core value proposition (best price routing) depends on the continued health and cooperation of its liquidity sources.',
    },
    {
      question: 'A new DeFi protocol is considering running a $2M liquidity mining program to bootstrap adoption. From a moat-building perspective, what should be the primary goal during the incentive period?',
      options: [
        'A. Maximise TVL at peak — the highest TVL number creates the best market perception',
        'B. Use the TVL and volume generated during incentives to build composability integrations and get other protocols to depend on yours — creating lock-in that will outlast the incentive period when mercenary capital exits',
        'C. Lock all TVL in long-term positions to prevent it from leaving',
        'D. Use the TVL to generate fees that fund the next incentive program',
      ],
      correct: 1,
      hint: 'Token incentives are temporary. What durable moats can be built during the window the incentives provide?',
      explanation: 'B is correct. The incentive period creates a window: elevated TVL and volume make the protocol attractive for integrations. Other protocols that would not bother integrating with a small new protocol may integrate during the period of high activity. The goal is to use the incentive-driven attention to secure composability dependencies — other protocols calling your contracts, using your price feeds, routing through your liquidity — that will survive the incentive period. When emissions end, mercenary capital exits, but the composability integrations remain. The protocol keeps its moat after losing its rented liquidity.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'AVNU aggregator data: integrates with Ekubo (92% Starknet DEX volume), JEDI, and 4 other DEXs. Seven Starknet lending protocols use AVNU\'s price data in their collateral valuation. AVNU daily volume: $6M. Ekubo daily volume: $5.5M (most AVNU volume routes through Ekubo). Apply all four moat sources to AVNU. Rate each moat 1–5 (1=weak, 5=strong). Identify the most significant threat to AVNU\'s competitive position.',
      scoringCriteria: [
        'Liquidity depth: 2/5 — AVNU holds no liquidity. Its routing advantage depends entirely on Ekubo\'s health. If Ekubo weakens or stops cooperating, AVNU\'s core value degrades immediately.',
        'Protocol integrations: 4/5 — 7 lending protocols with switching costs. Each integration requires audit and engineering effort to change.',
        'User network effects: 2/5 — traders use the interface that gives best execution. Switching to a new aggregator is low-friction (no audit needed for end users).',
        'Token incentives: N/A. Most significant threat: Ekubo itself launching a competing aggregator product. If Ekubo routes directly to users at better prices (cutting out AVNU\'s margin), AVNU loses its primary liquidity source and its primary routing advantage simultaneously.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A new Starknet DEX launches with $8M initial capital and a design that claims "superior concentrated liquidity implementation" over Ekubo. They have secured $2M in liquidity mining rewards for 6 months. Model their 12-month competitive challenge against Ekubo\'s composability moat, specifically: which Ekubo integrations would they need to displace, what that switching cost is per integration, and whether their $2M incentive budget is sufficient to build a competitive moat.',
      scoringCriteria: [
        'Integrations to displace: at minimum, they need AVNU to route significant volume to them (requires outperforming Ekubo on price execution consistently), and they need at least 2-3 lending protocols to use their price feed (switching cost: ~6 weeks engineering + $25,000 audit per protocol)',
        'Total switching cost to replace Ekubo\'s top 5 integrations: 5 protocols × $25,000 audit = $125,000, plus 5 × 6 weeks engineering = substantial developer time. The integrations themselves are not the primary cost — the trust-building period is.',
        '$2M conclusion: insufficient to build the composability moat required to displace Ekubo. The $2M can attract mercenary liquidity (LP TVL during emissions), but building composability lock-in requires engineering investment from partner protocols, which follows demonstrated reliability (6-12 months of operation), not just incentive capital.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A VC partner asks: "You keep saying first-mover advantage in DeFi is about liquidity depth, not technology. Why? Our portfolio company has better technology than Ekubo — why can\'t they just win?" Explain in three sentences, using Ekubo and the Starknet ecosystem as the specific example. Do not use the words "flywheel," "moat," or "composability."',
      scoringCriteria: [
        'Correctly explains the liquidity bootstrapping problem: a new DEX can only offer good prices if it has deep liquidity, but it can only attract liquidity providers if it offers high trading volume, which requires good prices — this circular dependency means the incumbent\'s depth advantage is self-maintaining, not just historically accumulated',
        'Makes the problem concrete using Ekubo: Ekubo\'s 92% market share generates daily fees that make it the highest-income pool for liquidity providers; a new DEX with better technology but less depth generates less fee income per dollar of liquidity, making it less attractive to the liquidity providers needed to make its better technology relevant',
        'States why technology alone cannot break this: building comparable liquidity depth requires $50-100M in sustained incentives over 12-18 months to demonstrate to liquidity providers that volume will remain after incentives end — during which time Ekubo continues to compound its lead',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L6.4 — Protocol Revenue and Sustainability
// TYPE B — Dominant concept: three DeFi revenue models (DEX
// trading fees, lending interest spread, perpetuals funding)
// each have specific formulas, and a protocol is only sustainable
// if revenue exceeds operating costs including incentive spend.
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_4 = {
  id: 'l6-4-protocol-revenue',
  title: 'Protocol Revenue and Sustainability',
  trackType: 'B',
  lessonNumber: 4,

  prerequisiteCheck: `
PREREQUISITE CHECK
──────────────────────────────────────────────────────────────────────────────
REQUIRED    Lab 1 L1.3 — DEX, lending, and perpetuals as protocol types
REQUIRED    Lab 3 L3.3 — Fee switch and value accrual concepts
RECOMMENDED Lab 6 L6.3 — Liquidity depth moat (context for LP incentive cost)
──────────────────────────────────────────────────────────────────────────────
  `,

  explanation: `
In 2022, an analyst named Cobie published a piece called "The Real Yield Problem." His argument: most DeFi protocols were paying yield funded by token inflation — they had no real revenue. A protocol paying 20% APY to stakers while generating 0.5% in actual trading fees was not a sustainable business; it was a wealth transfer from future token holders to current ones. The "real yield" movement that followed demanded that DeFi protocols demonstrate revenue — not token emissions — as the basis for any yield paid to holders.

This lesson teaches you to calculate protocol revenue from first principles, model sustainability, and identify the failure modes of unsustainable revenue models.

LAYER 1 — WHY REVENUE MODELLING MATTERS

A protocol with $50M TVL and $0 in annual revenue is a different proposition from one with $50M TVL and $2M in annual revenue. TVL measures adoption — how much money people trust in the protocol. Revenue measures economic viability — whether the protocol generates enough value to justify its operating costs and to reward token holders. A protocol that cannot cover its costs through revenue will eventually run out of runway and either fail or inflate its token to survive.

LAYER 2 — THREE REVENUE MODELS AND THEIR FORMULAS

MODEL 1 — DEX TRADING FEES

Every swap on a DEX pays a fee. This fee is typically expressed as a percentage of the trade value. On standard Uniswap: 0.3% of every trade. On Ekubo (Starknet): configurable by pool, typically 0.05–0.3% depending on the pair.

The fee goes to liquidity providers by default. If a fee switch is activated, a portion redirects to the protocol treasury.

Formula:
Total daily fee revenue = daily trading volume × fee tier
Protocol revenue (if fee switch active) = total daily fee revenue × protocol share %
Annualised protocol revenue = daily protocol revenue × 365

Example: Ekubo daily volume $5.5M. Average fee tier across pools: 0.10%. Total daily fee = $5.5M × 0.10% = $5,500. If fee switch activates at 10% share: protocol daily revenue = $550. Annualised: $550 × 365 = $200,750. This is the protocol's income, not the LP income.

For DEX aggregators like AVNU: the fee model is different. AVNU charges a small aggregator margin (0.05%) on top of the underlying pool's fee. AVNU's revenue = aggregator margin × total routed volume.

MODEL 2 — LENDING INTEREST SPREAD

A lending protocol earns revenue from the difference between what borrowers pay and what depositors receive.

Borrowers pay borrow APY on their outstanding debt.
Depositors receive supply APY on their deposits.
The protocol keeps the spread.

Formula:
Annual interest generated = total borrows × borrow APY
Annual interest distributed to depositors = total deposits × supply APY
Protocol net interest revenue = annual interest generated − annual interest distributed

Example: Vesu — $50M deposits, $35M borrows (70% utilisation). Borrow APY: 8%. Supply APY: 5%.
Annual interest generated: $35M × 8% = $2.8M
Annual interest distributed: $50M × 5% = $2.5M
Protocol net interest revenue: $2.8M − $2.5M = $300,000

What happens at different utilisation rates:
At 70% utilisation: $300,000 net revenue (above example)
At 40% utilisation: borrows = $20M. Interest generated: $20M × 8% = $1.6M. Interest distributed: $50M × 5% = $2.5M. Net: $1.6M − $2.5M = −$900,000. The protocol is paying more to depositors than it earns from borrowers. This is unsustainable and would trigger an interest rate adjustment (most lending protocols raise supply APY when utilisation is low and lower it when high, to equilibrate).

The failure mode of lending protocols: utilisation falls below the break-even point. If a competing protocol offers higher supply APY, depositors migrate, reducing AVNU's deposit base. Fewer deposits means the utilisation rate rises (same borrowers, fewer deposits) — which paradoxically increases revenue per deposit, but too high utilisation makes borrowing expensive, reducing borrowers, which reduces revenue again.

MODEL 3 — PERPETUALS FUNDING FEES

Recall from L1.3 (Extended): perpetuals protocols earn when longs pay shorts (or vice versa) a funding rate every 8 hours. The protocol takes a small percentage of each funding payment.

Formula:
Funding fee revenue per 8-hour period = open interest × funding rate × protocol fee share
Daily revenue = funding fee revenue × 3 (three 8-hour periods)
Annualised revenue = daily revenue × 365

Example: Extended (Starknet perps). Open interest: $8M. Average funding rate: 0.03% per 8 hours. Protocol fee share: 10% of funding payments.
Per 8-hour period: $8M × 0.03% × 10% = $24
Daily: $24 × 3 = $72
Annualised: $72 × 365 = $26,280

This is low compared to DEX or lending revenue because Open Interest on Starknet is $8M vs Hyperliquid's $3B. Perpetuals revenue scales directly with open interest — Starknet's perps ecosystem is early stage.

LAYER 3 — THE SUSTAINABILITY TEST

A protocol is sustainable if:
Revenue (from all sources) > Operating costs (incentive programs + development + infrastructure)

The sustainability ratio:
Sustainability ratio = annual protocol revenue ÷ annual incentive spend

If sustainability ratio < 1: the protocol spends more on incentives than it earns in revenue — not sustainable without token inflation.
If sustainability ratio = 1: break-even — incentives are exactly covered by revenue.
If sustainability ratio > 1: revenue exceeds incentive spend — sustainable and potentially generating surplus.

Most early-stage DeFi protocols have a sustainability ratio below 1. This is acceptable during growth phases — the bet is that revenue will grow faster than incentive costs. The concern is protocols that have been running for 18+ months with a ratio still well below 1 — the growth thesis is not materialising.

PROTOCOL P/E RATIO

Borrowed from traditional equity analysis:
Protocol P/E ratio = fully diluted valuation (FDV) ÷ annualised protocol revenue

A lower P/E ratio means you are paying less per dollar of revenue — more attractive.
A higher P/E ratio means the market is pricing significant future growth into the current valuation.

Ethereum DeFi benchmark: mature protocols like Uniswap have traded at P/E ratios of 100–300× when fee switch is fully active. Early-stage protocols might trade at 1,000×+ — almost entirely pricing in future growth.

LAYER 4 — WHERE THIS CONNECTS

Revenue analysis feeds directly into the Lab 6 Build Task (the sustainability section of the protocol research report) and Lab 9's protocol lifecycle analysis. A protocol moving from growth to maturity stage shows revenue becoming the primary focus — the sustainability ratio becomes the most important metric at that stage.
  `.trim(),

  keyTakeaway: `Three DeFi revenue models — DEX fees (volume × fee tier × protocol share), lending interest spread (borrower interest − depositor interest), and perpetuals funding (open interest × funding rate × protocol share) — each have calculable formulas, and a protocol is only sustainable when annual revenue exceeds annual incentive spend.`,

  visualPrompt: `Three revenue model cards in a row. Card 1 "DEX Trading Fees" (blue): formula tree — Daily Volume × Fee Tier = Total Fees. Total Fees × Protocol Share % = Protocol Revenue. Example: $5.5M × 0.10% × 10% = $550/day. Card 2 "Lending Interest Spread" (green): balance diagram — left side "Borrow APY × Total Borrows = Interest IN" ($2.8M), right side "Supply APY × Total Deposits = Interest OUT" ($2.5M), middle "Spread = Protocol Revenue" ($300K). Utilisation rate dial from 0% to 100% with break-even zone marked. Card 3 "Perps Funding" (orange): funding flow diagram — open interest $8M × funding rate 0.03% × protocol share 10% = $24 per 8h period. All three cards show the sustainability ratio formula below: Revenue ÷ Incentive Spend. Green zone >1, amber zone = 1, red zone <1.`,
  visualType: 'static',
  visualUrl: 'defi-three-revenue-models',

  examples: [
    {
      contextTag: '[DEX revenue calculation and P/E ratio]',
      context: 'AVNU aggregator: daily routed volume $6M. Aggregator margin: 0.05%. Protocol revenue cut: 100% of the margin (AVNU keeps all aggregator margin). FDV: $150M (hypothetical if AVNU had a token).',
      scenario: 'An analyst calculates AVNU\'s revenue profile. Daily revenue: $6M × 0.05% = $3,000. Annual revenue: $3,000 × 365 = $1.095M. Protocol P/E ratio: $150M ÷ $1.095M = 137×. Industry benchmark for mature DeFi aggregators: 50–200× P/E. AVNU at 137× is in the reasonable range for a growing protocol.',
      outcome: 'At $137 P/E, the market is pricing approximately 10–15 years of current revenue at today\'s valuation — implying significant volume growth expectations. The analyst notes: "AVNU\'s P/E at 137× is within the range for growing protocols. The key growth assumption: routed volume must grow to $60M/day (10× current) to justify this valuation at market P/E. Monitor: is weekly AVNU volume showing consistent growth? If volume plateaus below $15M/day, the current valuation implies future growth that is not materialising."',
    },
    {
      contextTag: '[Lending protocol sustainability test]',
      context: 'A Starknet lending protocol: $50M total deposits, $35M total borrows (70% utilisation). Borrow APY 8%, Supply APY 5%. Annual incentive spend: $400,000 (paid in the protocol\'s token to attract depositors).',
      scenario: 'The analyst calculates the sustainability ratio. Protocol net interest revenue: ($35M × 8%) − ($50M × 5%) = $2.8M − $2.5M = $300,000. Annual incentive spend: $400,000. Sustainability ratio: $300,000 ÷ $400,000 = 0.75. Below 1 — the protocol spends 25% more on incentives than it earns.',
      outcome: 'The analyst flags: "This protocol\'s current model is unsustainable at current utilisation and incentive levels. They are spending $400K to acquire $300K of revenue. The break-even analysis: they need either (a) utilisation to rise to ~82% at current rates to generate $400K net revenue, or (b) incentive spend to fall to $300K. The incentive program is running for 3 more months — after it ends, monitor whether utilisation holds or depositors migrate when rewards stop."',
    },
    {
      contextTag: '[Perpetuals revenue at scale — Hyperliquid comparison]',
      context: 'An analyst is comparing Extended (Starknet perpetuals) and Hyperliquid (dominant perpetuals exchange on Ethereum L2) on revenue potential.',
      scenario: 'Extended open interest: $8M. Hyperliquid open interest: $3B. Both using 0.03% funding rate, 10% protocol fee share. Extended annual revenue: $8M × 0.03% × 10% × 3 × 365 = $26,280. Hyperliquid annual revenue: $3B × 0.03% × 10% × 3 × 365 = $9.85M.',
      outcome: 'The ratio of $9.85M vs $26,280 represents a 375× revenue gap — directly proportional to the open interest gap. The analyst notes: "Perpetuals revenue scales linearly with open interest. Extended is not a less-well-designed protocol — it is an early-stage protocol with a 375× smaller user base at this stage. If Starknet attracts perpetuals traders to bring open interest to $100M, Extended\'s annualised revenue would reach $328,500. If open interest reaches $1B: $3.3M annually. The path to meaningful perpetuals revenue requires substantial user and capital base growth, not protocol improvement."',
    },
  ],

  guidedPractice: [
    {
      question: 'A DEX has daily volume of $8M, fee tier of 0.15%, and a fee switch active directing 12% of fees to the protocol treasury. What is the daily protocol revenue and the annualised figure?',
      options: [
        'A. Daily: $1,440. Annual: $525,600.',
        'B. Daily: $12,000. Annual: $4,380,000.',
        'C. Daily: $960. Annual: $350,400.',
        'D. Daily: $1,440. Annual: $432,000.',
      ],
      correct: 0,
      hint: 'Daily total fee = volume × fee tier. Protocol revenue = total fee × protocol share. Annual = daily × 365.',
      explanation: 'A is correct. Daily total fee = $8M × 0.15% = $12,000. Protocol revenue = $12,000 × 12% = $1,440. Annualised = $1,440 × 365 = $525,600. Option B applies 12% incorrectly (using 100% of fees). Option C uses a different calculation. Option D uses 300 days instead of 365.',
    },
    {
      question: 'A lending protocol has $40M deposits, $28M borrows (70% utilisation), borrow APY 9%, supply APY 6%. Calculate: annual interest generated, annual interest distributed to depositors, and net protocol revenue.',
      options: [
        'A. Generated $2.52M, distributed $2.4M, net $120,000.',
        'B. Generated $2.52M, distributed $1.68M, net $840,000.',
        'C. Generated $3.6M, distributed $2.4M, net $1.2M.',
        'D. Generated $1.68M, distributed $2.4M, net −$720,000.',
      ],
      correct: 0,
      hint: 'Interest generated = total borrows × borrow APY. Interest distributed = total deposits × supply APY. Net = generated − distributed.',
      explanation: 'A is correct. Interest generated: $28M × 9% = $2.52M. Interest distributed: $40M × 6% = $2.4M. Net protocol revenue: $2.52M − $2.4M = $120,000. Option B incorrectly uses borrows for the distribution calculation. Option C uses deposits for both calculations. Option D inverts the formula.',
    },
    {
      question: 'A lending protocol has $50M deposits and $35M borrows at 8% borrow APY and 5% supply APY. Utilisation drops from 70% to 40% (borrows fall to $20M). What happens to the protocol\'s net interest revenue?',
      options: [
        'A. Net revenue improves — lower utilisation means lower risk',
        'B. Net revenue collapses: at 40% utilisation, interest generated ($20M × 8% = $1.6M) is less than interest distributed ($50M × 5% = $2.5M) — the protocol is paying depositors more than borrowers are paying it. Net: −$900,000.',
        'C. Net revenue is unchanged — lower utilisation does not affect the interest rates',
        'D. Net revenue falls slightly but remains positive',
      ],
      correct: 1,
      hint: 'Calculate interest generated and distributed at 40% utilisation. Compare to 70% utilisation result.',
      explanation: 'B is correct. At 40% utilisation: borrows = $20M. Interest generated = $20M × 8% = $1.6M. Interest distributed = $50M × 5% = $2.5M. Net = $1.6M − $2.5M = −$900,000. The protocol is paying depositors $900,000 more than it earns from borrowers — a negative revenue situation. Compare to 70% utilisation: net = $300,000 positive. This demonstrates why utilisation rate is the critical metric for lending protocol health — below a break-even utilisation rate, the model becomes loss-making.',
    },
    {
      question: 'A protocol\'s annual revenue is $400,000. Its annual incentive spend (liquidity mining + staking rewards to attract users) is $1.2M. What is the sustainability ratio and what does it mean?',
      options: [
        'A. 3.0 — the protocol earns 3× more than it spends. Sustainable.',
        'B. 0.33 — the protocol earns only 33 cents for every dollar it spends on incentives. Not currently sustainable — it must rely on token inflation or treasury drawdown to fund the gap.',
        'C. The sustainability ratio cannot be calculated without TVL data.',
        'D. 0.33 — this is acceptable for early-stage protocols and requires no action.',
      ],
      correct: 1,
      hint: 'Sustainability ratio = revenue ÷ incentive spend. What does a ratio below 1 mean?',
      explanation: 'B is correct. $400,000 ÷ $1,200,000 = 0.33. A ratio below 1 means incentive spend exceeds revenue — the gap ($800,000) must be funded from somewhere: treasury drawdown, new token issuance (inflation), or external investment. This is common and acceptable for early-stage protocols with a clear growth trajectory. It becomes a problem when the ratio remains below 1 for 18+ months without improvement — it signals the growth thesis is not materialising and the protocol is on a slow path to insolvency.',
    },
    {
      question: 'A protocol has FDV of $300M and annualised protocol revenue of $600,000. What is the Protocol P/E ratio and how does it compare to mature DeFi protocols (50–200× P/E)?',
      options: [
        'A. 500× — significantly above the mature protocol benchmark, implying the market expects substantial revenue growth.',
        'B. 0.002× — the revenue is negligible relative to FDV.',
        'C. 50× — within the mature protocol range.',
        'D. 500× — this is a normal ratio for any DeFi protocol and requires no interpretation.',
      ],
      correct: 0,
      hint: 'P/E = FDV ÷ annual revenue. $300M ÷ $600,000 = ? Compare to the 50-200× benchmark.',
      explanation: 'A is correct. $300M ÷ $600,000 = 500×. At 500× P/E, the market is pricing in revenue growth of approximately 2.5–10× before the valuation looks reasonable relative to mature protocol benchmarks. This is not necessarily wrong for an early-stage, growing protocol — many successful protocols traded at 500×+ before revenue caught up with adoption. It is a signal to monitor: the valuation is almost entirely pricing in future growth, not current revenue. If revenue growth does not materialise, the valuation is difficult to sustain.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'AVNU aggregator data. Daily routed volume: $5M. Aggregator margin: 0.05%. Protocol revenue cut: 100% of the 0.05% margin. TVL (value of liquidity AVNU holds): $0 (AVNU is an aggregator — it holds no liquidity). FDV (assuming a hypothetical AVNU token at current market implied value): $120M. Calculate: (1) daily AVNU protocol revenue, (2) annualised AVNU protocol revenue, (3) Protocol P/E ratio, (4) daily volume required to achieve a P/E of 100× at current FDV.',
      scoringCriteria: [
        'Daily revenue: $5M × 0.05% = $2,500. Annualised: $2,500 × 365 = $912,500.',
        'P/E ratio: $120M ÷ $912,500 = 131.5×. Within the mature protocol benchmark range (50–200×).',
        'Volume for 100× P/E: target annual revenue = $120M ÷ 100 = $1.2M. Daily revenue needed = $1.2M ÷ 365 = $3,288. Volume needed = $3,288 ÷ 0.05% = $6.58M/day. Current volume ($5M) is below this threshold — the 100× P/E target requires daily volume growth to $6.6M+.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A lending protocol has $50M deposits, $35M borrows (70% utilisation), borrow APY 8%, supply APY 5%. Annual incentive spend: $500,000. Now model two scenarios: (a) a market correction drives utilisation from 70% to 35% as borrowers repay loans. (b) A competing protocol launches with 6.5% supply APY, causing $15M in deposits to migrate. For each scenario: calculate new net interest revenue, new sustainability ratio, and the specific action the protocol should take.',
      scoringCriteria: [
        'Scenario (a): borrows = $17.5M (35%). Interest generated = $17.5M × 8% = $1.4M. Distributed = $50M × 5% = $2.5M. Net = −$1.1M. Sustainability ratio = −$1.1M ÷ $500K = −2.2×. Action: immediately reduce supply APY to reduce distribution cost (the protocol\'s interest rate model should auto-adjust to maintain spread), and temporarily pause new incentive programs until utilisation recovers.',
        'Scenario (b): deposits = $35M (after $15M migration). Borrows unchanged at $35M. New utilisation = 100% — at cap, potentially triggering supply crunch. Interest generated = $35M × 8% = $2.8M. Distributed = $35M × 5% = $1.75M. Net = $1.05M. Action: raise supply APY competitively (at least 6.5% to match competitor) to attract deposits back, even at temporary revenue cost.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a two-paragraph sustainability analysis for a fictional Starknet DeFi protocol. Use this data: Protocol type — concentrated AMM DEX. Daily volume: $4M. Fee tier: 0.15% average. Fee switch active: 8% of fees to protocol treasury. Annual liquidity mining incentive spend: $200,000. Annual development cost (team salaries etc.): $150,000. No token issued yet. Include: primary revenue source, daily and annual protocol revenue, sustainability ratio, and whether the model is currently sustainable.',
      scoringCriteria: [
        'Paragraph 1 (revenue): Daily fee revenue = $4M × 0.15% = $6,000 total fees. Protocol share = $6,000 × 8% = $480/day. Annual protocol revenue = $480 × 365 = $175,200. Primary revenue source correctly identified as trading fees via the active fee switch.',
        'Paragraph 2 (sustainability): Total annual costs = $200,000 (incentives) + $150,000 (development) = $350,000. Sustainability ratio = $175,200 ÷ $350,000 = 0.50. Not currently sustainable — the protocol earns 50 cents per dollar of operating cost. Context required: early-stage DEX at $4M daily volume. For sustainability, volume must reach approximately $8M/day or costs must fall. Given the liquidity flywheel dynamics (L6.3), growing volume to $8M/day is achievable if the liquidity base grows proportionally.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L6.5 — Building a Research Process
// TYPE A — Dominant concept: systematic research follows five
// steps — hypothesis, on-chain data, off-chain data, thesis,
// publish and revise — and the sandbox-research-writer produces
// a structured, section-by-section output that meets the rubric.
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_5 = {
  id: 'l6-5-research-process',
  title: 'Building a Research Process',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
In 2020, a DeFi analyst published a research report claiming that a major lending protocol was insolvent — that its bad debt exceeded its protocol reserves. The report went viral. The protocol's token fell 35% in 24 hours. The team published a rebuttal showing the analyst had misread the protocol's reserve mechanism — the bad debt claim was based on a misunderstanding of how the protocol's risk fund worked. The token recovered most of its losses within a week.

The episode illustrates both the power and the responsibility of published DeFi research. A structured research process — one that separates data collection from interpretation, tests hypotheses rigorously before publishing, and builds in accountability — is not just a professional standard. It is a safeguard against causing financial harm through careless analysis.

THE FIVE-STEP RESEARCH WORKFLOW

STEP 1 — HYPOTHESIS FORMATION

Before opening any data tool, write a specific claim in a single sentence. This is your hypothesis — the thing you are investigating, not the conclusion you expect to reach.

Bad hypothesis: "I will research Ekubo."
Good hypothesis: "Ekubo maintains dominant DEX market share because its liquidity depth creates a composability moat that new entrants cannot overcome in less than 12 months."

The hypothesis determines what data you need and what would count as evidence for or against it. Without a specific hypothesis, you collect data without knowing what you are looking for.

STEP 2 — ON-CHAIN DATA COLLECTION

Using the four analytics tools from L1.4 (DefiLlama, Dune, Voyager, Starkscan), collect the specific data that addresses your hypothesis. Collect both confirming and disconfirming data — do not only look for evidence that supports your conclusion.

For the Ekubo hypothesis above: collect Ekubo's market share trend over 12 months (DefiLlama), the number and nature of protocol integrations using Ekubo (Dune), and the TVL trajectory of the two most recent Ekubo competitors (DefiLlama). Also look for disconfirming evidence: any period where Ekubo's market share fell significantly, and what caused it.

STEP 3 — OFF-CHAIN DATA COLLECTION

On-chain data shows what happened. Off-chain data explains why. The three primary off-chain sources:

Protocol documentation: audit reports (how many findings, what categories, what resolved), tokenomics documents, governance proposals, team blog posts.

Team background: previous projects shipped, relevant experience, public social media and conference talks. Look for red flags: anonymous teams with no track record, teams that previously ran projects that failed under suspicious circumstances.

Market context: news events, protocol announcements, macro conditions that might explain on-chain patterns. If Ekubo's volume spiked in a specific week, was there a news event? If volume dropped, was it a market-wide correction or Ekubo-specific?

STEP 4 — THESIS FORMULATION

After collecting both on-chain and off-chain data, write a thesis statement — a conclusion that is supported by the data, acknowledges the key uncertainties, and includes a falsifiability condition.

Thesis structure:
[Claim] because [mechanism] as evidenced by [specific data]. However, this thesis is uncertain if [specific risk]. This thesis would be falsified if [specific observable condition].

STEP 5 — PUBLICATION AND REVISION

Publishing creates accountability. A research report that exists in a private document is not research — it is notes. Publication means:
— Specific claims can be verified by others
— Errors can be identified and corrected
— The analyst is accountable for the quality of their reasoning

Revision is not failure — it is how research improves. If new data contradicts your thesis, update the thesis. If you made an error, publish a correction. The analyst who published the incorrect insolvency claim recovered credibility by acknowledging the error promptly and explaining how it happened. The analyst who doubled down and refused to correct did not.

THE SANDBOX-RESEARCH-WRITER

The sandbox-research-writer is a structured writing environment that guides you through each section of a protocol research report. It provides:
— Word count targets per section (executive summary: 150–250 words; protocol overview: 200–300; tokenomics: 150–200; competitive moat: 200–300; risks: 150–200; thesis: 100–150)
— Required data fields that must be filled before the section can be submitted (e.g., executive summary requires: one TVL or volume figure, one competitive position statement, one primary risk)
— A self-check rubric that flags missing required elements before the draft is exported

For the Lab 6 Build Task, you will use the sandbox-research-writer to produce a full protocol research report on Ekubo or Vesu. Every section must meet its word count and required data fields. The rubric will check before you can export.
  `.trim(),

  keyTakeaway: `Systematic research follows five steps — hypothesis formation, on-chain data, off-chain data, thesis formulation, and publish and revise — and the hypothesis must be specific enough that it can be falsified by data, not just confirmed by it.`,

  visualPrompt: `A five-step vertical flowchart. Step 1 "Hypothesis": a blank hypothesis template — "[Protocol] maintains [claim] because [mechanism]." Icon: pencil and document. Step 2 "On-Chain Data": icons of DefiLlama, Dune, Voyager, Starkscan, with arrows pointing to a "Data Collected" box. Callout: "Collect both confirming AND disconfirming data." Step 3 "Off-Chain Data": three source boxes — Audit reports, Team background, Market context. Arrow to "Context Layer." Step 4 "Thesis Formulation": thesis template — "[Claim] because [mechanism] evidenced by [data]. Falsified if [condition]." Step 5 "Publish and Revise": publish icon with a feedback loop arrow back to Step 4 labelled "New data? Update thesis. Error? Correct publicly." Each step connected by a downward arrow. Red box at Step 2: "Never collect only confirming data."`,
  visualType: 'static',
  visualUrl: 'five-step-research-workflow',

  examples: [
    {
      contextTag: '[Hypothesis that guides data collection correctly]',
      context: 'An analyst is assigned to write a research report on Vesu (Starknet lending protocol). She considers two approaches to starting.',
      scenario: 'Approach A: "I will research Vesu." She opens DefiLlama and starts noting numbers without a clear objective. After two hours, she has a spreadsheet full of data but no structure for what the report should argue. Approach B: "Vesu\'s revenue model is currently unsustainable because its net interest revenue falls below incentive spend at the current utilisation rate, making the 12-month outlook for the protocol treasury concerning." She knows exactly what data she needs: Vesu TVL, utilisation rate, borrow/supply APY, incentive spend, and treasury balance.',
      outcome: 'Approach B produces a focused report in half the time. The hypothesis tells her what to collect, what to look for, and what would constitute evidence against her claim (e.g., if treasury balance is growing despite low utilisation, her concern may be overestimated). Hypothesis-first research is structurally more efficient because it defines the boundaries of the investigation.',
    },
    {
      contextTag: '[Disconfirming data changing the thesis]',
      context: 'An analyst begins with the hypothesis: "Ekubo\'s market share dominance is primarily explained by token incentives from their liquidity mining program."',
      scenario: 'She collects on-chain data: Ekubo market share trend over 18 months. She finds: Ekubo\'s liquidity mining program ended 6 months ago. Market share has not declined since — it held at 88–92%. She checks off-chain data: the liquidity mining program was relatively small ($1.5M total). Most major pool integrations were established before the mining program began.',
      outcome: 'The disconfirming data falsifies her original hypothesis. She updates: "Ekubo\'s market share dominance is primarily explained by composability lock-in (7+ protocol integrations predating liquidity mining) and the self-reinforcing liquidity depth flywheel — not by the incentive program, which was a minor contributing factor." The original hypothesis was wrong. Collecting disconfirming data caught it before publication.',
    },
    {
      contextTag: '[Publishing a correction after an error]',
      context: 'An analyst publishes a research report claiming Protocol X has $8M in annualised revenue based on a Dune dashboard reading. Three days later, another analyst points out she misread the dashboard — the $8M figure was total protocol lifetime revenue, not annualised. Actual annual revenue is $1.8M.',
      scenario: 'She has two options: (a) publish a quiet correction in the report\'s appendix and hope nobody notices the original claim. (b) Publish a clear, prominent correction: "Correction: my original report stated $8M in annualised revenue. This figure was a lifetime cumulative number, not annualised. The correct annual revenue figure is $1.8M. I have updated the sustainability analysis accordingly. The thesis holds — the protocol remains unsustainable at current incentive spend — but the margin of unsustainability is different than originally stated."',
      outcome: 'She publishes option (b). Her credibility takes a short-term hit on the error, but gains long-term credibility from the transparent correction. Readers now trust her reports more: she demonstrates that she corrects errors when found rather than concealing them. Option (a) would have been discovered eventually and caused a larger credibility loss.',
    },
  ],

  guidedPractice: [
    {
      question: 'An analyst begins a research project by saying "I will research Ekubo and see what I find." What is wrong with this approach and how should it be corrected?',
      options: [
        'A. Nothing — exploring data without preconceptions produces more objective research',
        'B. Without a specific hypothesis, the analyst has no criteria for which data is relevant, what counts as evidence, or what conclusion the research should test — this produces unfocused data collection that is easy to cherry-pick. Correct approach: form a specific, falsifiable hypothesis first.',
        'C. The problem is choosing Ekubo — a more popular protocol would generate more interest',
        'D. The approach is fine as long as the analyst works quickly',
      ],
      correct: 1,
      hint: 'A hypothesis defines what data you need and what would count as evidence against your conclusion. Without it, what guides your data collection?',
      explanation: 'B is correct. Without a hypothesis, data collection has no structure — you collect what seems interesting, which tends to be confirming data rather than a balanced sample. The risk: you build a narrative around whatever data you happened to collect, creating a self-fulfilling research process. A specific hypothesis ("Ekubo\'s market share is maintained primarily by composability lock-in, not technology") tells you exactly which data to collect (integration count, market share trend, competitor performance) and what would constitute disconfirmation.',
    },
    {
      question: 'What is the most important reason to collect disconfirming data during the data collection step?',
      options: [
        'A. Regulators require balanced research',
        'B. Data that contradicts your hypothesis is the only evidence that can tell you whether your hypothesis is correct — confirming data alone cannot distinguish a true hypothesis from a convenient narrative',
        'C. Disconfirming data is required for academic publications but not for DeFi research',
        'D. It takes more time, which demonstrates thoroughness to readers',
      ],
      correct: 1,
      hint: 'If you only look for evidence that supports your conclusion, what is the risk?',
      explanation: 'B is correct. Confirming data tells you that your hypothesis is consistent with the evidence. Disconfirming data tests whether the hypothesis could be wrong. If you only collect confirming data, you cannot distinguish between "this hypothesis is true" and "I found data that fits this hypothesis while ignoring data that contradicts it." The analyst who found that Ekubo\'s market share held after liquidity mining ended collected disconfirming data — and that forced a better hypothesis.',
    },
    {
      question: 'An analyst publishes a research report with a factual error (wrong revenue figure). Another analyst publicly points out the error. What should the original analyst do?',
      options: [
        'A. Delete the report and repost with the correction, without acknowledging the error',
        'B. Publish a prominent, specific correction: name the error, state the correct figure, update the affected analysis, and if the thesis changes, explain how. Long-term credibility comes from transparent error correction, not from pretending errors did not happen.',
        'C. Wait to see if anyone else notices before deciding whether to correct',
        'D. Respond publicly that the other analyst is wrong, buying time to investigate',
      ],
      correct: 1,
      hint: 'What behaviour builds long-term credibility in research — concealing errors or correcting them transparently?',
      explanation: 'B is correct. Research credibility is built over time through demonstrated intellectual honesty — being willing to correct errors publicly when found. Readers who see an analyst correct an error gain more trust than they lose from the error itself, because they now know the analyst prioritises accuracy over ego. Option A attempts to hide the error — readers who read both versions will discover the concealment, which is worse than the original error. Option C delays inevitable disclosure. Option D creates an adversarial dynamic that makes correction harder.',
    },
    {
      question: 'A correctly formed thesis statement should include three elements. Which option correctly identifies all three?',
      options: [
        'A. The claim, the supporting data, and the author\'s background',
        'B. The claim, the mechanism that supports it, and a falsifiability condition — the specific observable event that would require revising the thesis',
        'C. The claim, the recommendation, and the disclaimer',
        'D. The hypothesis, the data sources, and the word count',
      ],
      correct: 1,
      hint: 'A good thesis does more than state a conclusion — it explains why and tells you what would prove it wrong.',
      explanation: 'B is correct. A thesis with only a claim ("Ekubo is the strongest DEX on Starknet") is an assertion, not a thesis. Adding the mechanism explains why the claim is true ("because its liquidity depth creates a composability moat that competitors cannot replicate without $50M+ sustained incentives"). Adding the falsifiability condition makes it testable ("this thesis would be falsified if a new Starknet DEX achieves 30%+ organic market share in 12 months"). All three elements together constitute a rigorous, accountable research thesis.',
    },
    {
      question: 'The sandbox-research-writer has a "required data fields" feature that flags when a section is missing required elements. Why is this feature valuable rather than restrictive?',
      options: [
        'A. It prevents analysts from publishing any negative views about protocols',
        'B. It ensures that every section of the report contains the minimum evidence needed to support its claims — a research report with an executive summary but no specific data point is an opinion, not research',
        'C. It limits the report length, which makes it easier to read',
        'D. It automatically fact-checks the data against DefiLlama',
      ],
      correct: 1,
      hint: 'What is the difference between a research report that includes a specific data point vs one that makes claims without data?',
      explanation: 'B is correct. The required data fields ensure that claims are backed by evidence. An executive summary that says "this protocol is performing well" with no specific metric is an impression, not a finding. An executive summary that says "this protocol processed $5M in daily volume (30-day average, DefiLlama) with 92% DEX market share on Starknet" is a researched finding that can be verified and challenged. The feature is not restrictive — it is quality control that distinguishes research from opinion.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-research-writer',
      scenario: 'Draft a 200-word executive summary for a research report on Ekubo (Starknet\'s concentrated AMM). Your executive summary must include: (1) what Ekubo does in one sentence, (2) one specific key metric (TVL or volume with source), (3) its competitive position on Starknet (one sentence with a specific claim), (4) its primary risk (one sentence). Use the sandbox-research-writer to draft and check against the required data fields rubric before submitting.',
      scoringCriteria: [
        'Ekubo\'s function correctly described in one sentence: a concentrated automated market maker (AMM) enabling token swaps on Starknet with liquidity providers deploying capital in specific price ranges',
        'Specific metric cited with source: e.g., "Ekubo processes approximately $5–6M in daily trading volume (DefiLlama, 30-day average)" or "Ekubo holds approximately $200M TVL across its liquidity pools (DefiLlama)"',
        'Competitive position stated specifically: "Ekubo commands approximately 92% of Starknet DEX trading volume — a position maintained by liquidity depth and composability integrations with 7+ lending protocols that create structural switching costs"',
        'Primary risk stated specifically: "The primary risk is that Ekubo\'s dominant position depends on sustained LP participation — if a competing protocol offers materially higher LP returns, mercenary capital migration could trigger a volume decline feedback loop"',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'A research report on Ekubo claims: "Ekubo has 90% market share of Starknet DEX volume." Identify: (1) the specific data source you would use to verify this claim, (2) the specific query or tool navigation to find the figure, (3) the additional context needed to evaluate whether 90% market share is a moat or a concentration risk, (4) what data point would cause you to add a concentration risk warning.',
      scoringCriteria: [
        'Data source: DefiLlama Starknet chain page (protocol breakdown by volume) or a Dune dashboard specifically tracking DEX volume split across Starknet protocols',
        'Navigation: DefiLlama → Starknet chain → Protocols tab → sort by 30-day volume → calculate Ekubo\'s share of total DEX volume',
        'Additional context needed: (a) is the 90% stable or declining? (declining = competitor gaining share). (b) What is the second-largest DEX\'s share? (c) Are most of Ekubo\'s integrations single-sourced — if multiple protocols depend exclusively on Ekubo, a failure creates cascading risk',
        'Concentration risk warning trigger: if Ekubo\'s 90% share means 7+ protocols use it as a single source for price data or liquidity routing — this creates systemic risk. A warning note is appropriate: "Ekubo\'s dominance creates concentration risk — a failure or exploit would simultaneously affect all dependent protocols with no fallback"',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You published a research report two weeks ago rating Protocol X as "strong buy" based on its revenue growth and composability moat. Today, an audit firm publishes a previously undisclosed Critical finding in Protocol X\'s code — an access control vulnerability that allows an attacker to drain the fee collection contract. The team has confirmed the finding and paused the fee switch pending a fix. Write a two-sentence update for your report readers that is honest about the change in thesis without being alarmist.',
      scoringCriteria: [
        'First sentence: accurately reports the material change — a previously undisclosed Critical access control vulnerability has been identified and disclosed by an audit firm, and the protocol has paused the fee switch as a precautionary measure while a fix is developed',
        'Second sentence: honest thesis update without overclaiming risk — the "strong buy" thesis was based partly on the active fee switch as a revenue-backed value accrual mechanism; with the fee switch paused, value accrual is suspended until the fix is deployed and the correction audited, downgrading the near-term thesis to "hold pending audit remediation" while noting that the underlying composability moat is unchanged',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 6 — AGGREGATE SIMS, BUILD TASK, BOSS
// ─────────────────────────────────────────────────────────────

export const LAB6_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: [
    'sandbox-research-writer',
    'judgment-dataInterpret',
    'judgment-riskAssess',
    'judgment-communication',
  ],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  difficultyRange: 'lesson-sim-2-equivalent',
  description: 'Random draw from all 5 Lab 6 lessons. Tests audit reading, tokenomics seven-point checklist, composability moat analysis, DEX/lending/perps revenue calculation, and five-step research process. No lesson labels. No hints.',
};

export const LAB6_BUILD_TASK = {
  id: 'ecosystem-lab-6-build',
  title: 'Full Protocol Research Report',
  labProgressionNumber: 6,
  selectionMode: 'user-choice-2',
  type: 'research-document',
  simulator: 'sandbox-research-writer',
  hints: true,
  portfolioPush: false,
  estimatedTime: '90–120 minutes',

  availableTasks: [
    {
      id: 'build-6a-ekubo',
      title: 'Option A: Ekubo Protocol Research Report',
      description: `Full research report on Ekubo (Starknet concentrated AMM). Required sections:
1. Executive Summary (150–250 words): function, key metric with source, competitive position, primary risk
2. Protocol Overview (200–300 words): what it does, how it works, TVL and volume trends
3. Audit Status: most recent audit firm, date, finding counts by severity, any unresolved findings
4. Revenue Model: daily volume, fee tier, calculated daily and annual protocol revenue (if fee switch active)
5. Competitive Moat: apply four-source framework. Rate each source 1–5. Overall moat strength.
6. Risks: minimum 3 specific risks with mechanism and mitigation
7. Thesis (100–150 words): specific claim, mechanism, falsifiability condition

Uses sandbox-research-writer. Output: protocol-research-ekubo.md`,
    },
    {
      id: 'build-6b-vesu',
      title: 'Option B: Vesu Protocol Research Report',
      description: `Full research report on Vesu (Starknet lending protocol). Same section structure as Option A, adapted for lending:
Revenue Model section: total deposits, total borrows, utilisation rate, borrow APY, supply APY, calculated net interest revenue, sustainability ratio.

Output: protocol-research-vesu.md`,
    },
  ],

  outputType: 'written-document',
  outputFormat: 'markdown',
  outputPath: '/intermediate/lab-06-research-methodology/',

  scoringCriteria: [
    'All 7 sections present with minimum word counts met',
    'Every claim supported by a specific data point with source named',
    'Revenue calculation is numerically correct and methodology shown',
    'Thesis includes all three elements: claim, mechanism, falsifiability condition',
    'At least one risk is specific to this protocol — not a generic "smart contract risk"',
  ],
};

export const LAB6_BOSS = {
  phase1: {
    id: 'ecosystem-lab-6-boss-phase1',
    title: 'Lab 6 Boss — Phase 1: Research Methodology Gauntlet',
    description: 'Unlimited attempts. Hints available. 8 tasks from pool of 20. Pass 80% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,
    taskPool: { totalTasks: 20, drawPerAttempt: 8, passMark: 0.80 },
  },

  phase2: {
    id: 'ecosystem-lab-6-boss-phase2',
    title: 'Lab 6 Boss — Phase 2: Research Methodology Certification',
    description: 'No hints. Portfolio push on 100% pass. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are a DeFi analyst presenting a protocol due diligence report to an investment committee evaluating a $2M allocation to a Starknet DeFi protocol.

The committee is evaluating Protocol NOVA: a Starknet concentrated AMM with a token. Here is the available data:

Audit: Tier-1 firm, 8 months ago. 1 Critical (access control — resolved), 2 High (resolved), 7 Medium (resolved). 2 major upgrades since the audit.

Tokenomics: Total supply 400M. Circulating 40M (10%). Price $0.90. Team 24%, cliff 8 months, 30-month vest. Investors 18%, cliff 6 months, 24-month vest. Foundation 30%, flexible. Community 28%, 60-month uniform. No fee switch active. Treasury: 3-of-5 multisig, 2 independent. All wallets labelled on-chain matching claims. Daily trading volume: 4.5M tokens.

Revenue: Daily volume $3.5M. Fee tier 0.12%. Protocol treasury currently receives 0% of fees (no fee switch). Annual liquidity mining spend: $280,000.

Moat: 4 lending protocols use NOVA's price data. NOVA integrates with Ekubo and 2 other DEXs. Market share: 8% of Starknet DEX volume.

TASK 1 — Audit Assessment
Given the audit data plus 2 post-audit upgrades, what percentage of current code is covered by the original audit? What is the residual risk and what action should the investment committee require before allocating?

TASK 2 — Tokenomics Checklist and Supply Pressure
Apply all 7 checklist points. Calculate FDV, market cap, dilution multiplier. Calculate supply pressure for month 8 (when team vesting begins). Overall tokenomics risk rating.

TASK 3 — Revenue Sustainability
Calculate annualised protocol revenue. Calculate sustainability ratio. If the fee switch were activated at 10% of fees, recalculate both. State whether the current or post-switch model is sustainable.

TASK 4 — Investment Recommendation
Based on all three tasks, provide a specific recommendation: allocate $2M, allocate a reduced amount with conditions, or do not allocate. Justify with the three most important factors from your analysis.
    `.trim(),

    scoringCriteria: [
      'Task 1: Post-audit upgrades cover unknown % of code. With 2 major upgrades, estimate 30-50% of code has changed since audit. Residual risk: unreviewed upgraded code. Required action: commission a targeted re-audit of the 2 upgraded components before allocation.',
      'Task 2: P1 pass (42% — wait: 24+18=42% — FAIL). P2 pass (8-month team cliff). P3 pass. P4 fail (no fee switch active, governance-only token). P5: FDV = 400M × $0.90 = $360M; market cap = 40M × $0.90 = $36M; ratio = 10× — fail (P5 threshold = 5×). P6 pass. P7 pass. Score: 4/7 — high risk. Month 8 unlock: team 24% = 96M tokens ÷ 30 months = 3.2M/month. Absorption: 3.2M ÷ 4.5M daily = 0.71 days — low pressure. Despite low unlock pressure, 4/7 checklist and 10× FDV are high risk flags.',
      'Task 3: Current annual revenue = $0 (no fee switch). Sustainability ratio = $0 ÷ $280,000 = 0. With 10% fee switch: daily fees = $3.5M × 0.12% = $4,200. Protocol share = $4,200 × 10% = $420/day. Annual = $153,300. Sustainability ratio = $153,300 ÷ $280,000 = 0.55. Neither current nor post-switch model is sustainable at current volume and incentive spend.',
      'Task 4: Recommendation must be specific. Strongest justification for "do not allocate now": (1) unreviewed post-audit code upgrades represent material smart contract risk. (2) 4/7 tokenomics checklist failures including no value accrual and 10× dilution multiplier. (3) Zero current protocol revenue with sustainability ratio 0.55 even at optimistic post-fee-switch scenario. Conditional allocation structure: allocate up to $500K after (a) re-audit of upgraded components, (b) fee switch activated and generating minimum $100K/year verified revenue, (c) tokenomics checklist re-scored at 5/7+.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/intermediate/lab-06-research-methodology/',
      files: [{ filename: 'protocol-due-diligence-nova.md', type: 'narrative' }],
      commitMessage: 'Passed Lab 6 Protocol Research Methodology — Intermediate Ecosystem Deep Dive',
      badgeEarned: 'Research Methodology Certified — Intermediate',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const LAB6_META = {
  id: 'ecosystem-intermediate-lab-6',
  title: 'Protocol Research Methodology',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'intermediate' as const,
  labNumber: 6,
  estimatedHours: 6,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Labs 1–5 complete. Junior level certified.',
  description: 'Audit severity and category reading, seven-point tokenomics checklist with supply pressure modelling, four-source composability moat analysis, three DeFi revenue formulas with sustainability test, and five-step research workflow with sandbox-research-writer.',
  nextLab: 'Lab 7 — Cross-Chain Competitive Analysis',
};
