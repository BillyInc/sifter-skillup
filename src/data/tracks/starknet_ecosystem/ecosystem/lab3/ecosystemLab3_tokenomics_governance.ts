// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// JUNIOR · LAB 3 — TOKENOMICS AND GOVERNANCE
// 5 Lessons + Aggregate Sims + Build Task + Boss Battle
//
// Lesson type classification:
//   L3.1 — TYPE A/B MIXED: applies Primer L0.2 concepts to STRK specifically;
//           includes unlock calculation (Type B layer)
//   L3.2 — TYPE A: process and policy — SNIP governance workflow
//   L3.3 — TYPE A: market behaviour — veToken, fee switch, governance minimisation
//   L3.4 — TYPE B: four-step framework with required FDV calculation,
//           dilution multiplier, monthly unlock modelling
//   L3.5 — TYPE A: five-dimension governance risk framework, judgment
//
// Learner: zero DeFi knowledge. Plain English first, always.
// Every term: real-world situation → what it does → then name it.

// ─────────────────────────────────────────────────────────────
// L3.1 — STRK Token: Distribution, Vesting, Supply Schedule
// TYPE A/B MIXED — Dominant concept: STRK has a known future
// inflation schedule. Applying the Primer L0.2 vocabulary to
// the specific STRK data tells you what dilution risk looks like
// in practice.
// ─────────────────────────────────────────────────────────────

export const LAB3_LESSON_1 = {
  id: 'l3-1-strk-token-distribution',
  title: 'STRK Token: Distribution, Vesting, Supply Schedule',
  trackType: 'A/B',
  lessonNumber: 1,

  explanation: `
In Primer L0.2, you learned the concepts: circulating supply, total supply, FDV, vesting, dilution. Those were the building blocks. This lesson applies every one of them to STRK — Starknet's native token — specifically. When you finish, you will be able to read STRK's tokenomics documentation, calculate what is coming, and assess what it means.

STRK's total supply is 10 billion tokens. That is the absolute maximum — no more will ever be created. But on any given day, most of those tokens are not in public hands. They are locked across four categories, each releasing on a different schedule.

WHERE THE STRK SUPPLY LIVES

Category 1 — StarkWare and early investors: approximately 32.9% of total supply. This includes 17% held by StarkWare, 8.1% by early shareholders, and 7.8% by employees. All of this was subject to a 4-year vesting schedule starting from launch. Some early tranches have begun releasing.

Category 2 — Starknet Foundation treasury: approximately 50.1% of total supply. This is the largest single allocation. The Foundation uses this for grants, ecosystem development, and staking rewards. There is no hard vesting schedule on the treasury — the Foundation decides how quickly to distribute it based on ecosystem needs.

Category 3 — Community provisions: approximately 9% allocated to early community members, early DeFi adopters, and ecosystem participants via past distribution programs.

Category 4 — Grants and future incentives: the remaining supply is reserved for ongoing ecosystem grants and future staking incentive programs.

WHAT THE FOUR RED FLAGS LOOK FOR

When you read any protocol's tokenomics documentation — including STRK's — four specific things can signal risk. You should check for all four, every time.

Red flag 1 — Insider allocation above 40%: Team + investors combined. For STRK, StarkWare + shareholders + employees = 32.9%. This is below 40%. No red flag triggered.

Red flag 2 — Vesting cliff under 6 months: A short cliff means insiders can sell fast after launch. STRK's team and investor vesting started with a cliff before any tokens unlocked. The cliff period was substantial — insiders could not sell from day one. No red flag triggered.

Red flag 3 — No published emission schedule: Is there a known schedule for when tokens enter circulation? STRK has published vesting schedules for the insider allocations. The Foundation treasury has less certainty because there is no hard schedule — it distributes based on ecosystem needs. Partial yellow flag — not a hard red, but worth noting.

Red flag 4 — Treasury controlled by a single multisig with no timelock: The Starknet Foundation treasury is managed by the Foundation, which uses multi-signature controls. The specifics of the signing threshold matter for a full assessment. Partial yellow — needs verification per protocol.

THE SUPPLY SCHEDULE IN PRACTICE

Understanding that tokens will enter circulation is one thing. Knowing how to assess whether the market can absorb them is another.

Here is the mechanic: take the monthly unlock volume (in tokens) and compare it to the current daily trading volume. If monthly unlocks are equivalent to 3–5 days of trading volume, the market can likely absorb it without significant pressure. If monthly unlocks represent 30+ days of trading volume, sustained sell pressure is a real risk.

For any month's STRK unlocks, the formula is:

Monthly unlock volume ÷ daily trading volume = days of volume to absorb the unlock

If this number is under 5: low pressure. Between 5 and 20: moderate pressure. Above 20: high pressure — monitor closely around the unlock date.

WHY AN ANALYST MUST MODEL DEMAND AGAINST DILUTION

The unlock schedule creates known future inflation. Inflation reduces the price per token if demand does not grow proportionally. An analyst evaluating STRK must therefore model two things simultaneously:

1. Supply side: how many new STRK enter circulation per quarter over the next 24 months?
2. Demand side: what will drive new buyers of STRK? Staking yields, protocol fee capture, governance rights, speculative demand?

If supply grows faster than demand, price falls. If demand grows faster than supply, price rises. The supply schedule is known and published. The demand growth is uncertain. The difference between them is the analyst's primary job to assess.

This is what separates a surface-level tokenomics review ("the allocation looks reasonable") from a rigorous one ("at current demand growth rates and the Q3 unlock schedule, STRK faces approximately X% dilution pressure in months Y through Z").
  `.trim(),

  keyTakeaway: `STRK's 10-billion-token supply is distributed across four categories with different vesting schedules — applying the four red flags framework shows insider allocation is below the 40% threshold, but the Foundation treasury's flexible distribution timeline requires ongoing monitoring.`,

  visualPrompt: `Two-part diagram. Part 1 (left): A pie chart of STRK total supply with four segments: StarkWare/investors/employees 32.9% (red-amber), Foundation treasury 50.1% (blue), Community provisions 9% (green), Grants/incentives remaining (grey). Each segment labelled with percentage and category name. Part 2 (right): A timeline bar showing token unlock flow by quarter over 24 months. Foundation treasury shown as irregular releases (flexible). Insider vesting shown as regular monthly releases after the cliff. A horizontal dotted line labelled "Daily trading volume" with annotation "Unlocks above this line = significant pressure." Clean, no text inside shapes.`,
  visualType: 'static',
  visualUrl: 'strk-token-distribution-vesting-timeline',

  examples: [
    {
      contextTag: '[Analyst applying red flags to STRK]',
      context: 'A junior analyst is producing a STRK tokenomics section for an ecosystem research report. She applies the four red flags framework systematically.',
      scenario: 'Red flag 1: insider allocation 32.9% — below 40% threshold. Clear. Red flag 2: cliff was substantial — insiders could not sell from launch. Clear. Red flag 3: vesting schedule for insiders is published; Foundation treasury has no hard schedule. Partial yellow. Red flag 4: Foundation uses multi-signature controls — specifics require direct verification.',
      outcome: 'Her assessment: STRK triggers zero hard red flags and two yellow flags (Foundation treasury flexibility and multisig specifics requiring verification). She rates STRK tokenomics as "cautiously positive with monitoring requirements" and notes the specific items to verify before upgrade. This is a rigorous assessment — not just "the allocation looks reasonable."',
    },
    {
      contextTag: '[Monthly unlock vs daily volume calculation]',
      context: 'An analyst is assessing STRK dilution pressure for the next quarter. She has: monthly unlock volume of 50 million STRK, current price of $0.55, current daily STRK trading volume of 8 million STRK.',
      scenario: 'She applies the formula: 50M monthly unlock ÷ 8M daily volume = 6.25 days of volume needed to absorb the unlock. This falls in the moderate pressure range (5–20 days). In dollar terms: 50M × $0.55 = $27.5M of STRK entering circulation per month.',
      outcome: 'Her report notes: "Monthly unlocks represent approximately 6.25 days of trading volume — moderate sell pressure. At current demand levels, this does not represent a crisis, but will create headwinds for price appreciation unless demand grows to absorb the supply. Monitor the unlock dates and watch for any acceleration in on-chain staking activity as a demand signal."',
    },
    {
      contextTag: '[Staking demand absorbing supply pressure]',
      context: 'Starknet activates staking rewards for STRK holders. Validators earn 8% APY for staking STRK. The announcement coincides with a quarter where 150 million STRK enter circulation from vesting.',
      scenario: 'An analyst watches on-chain data. Within 30 days of staking going live, 600 million STRK are staked — a significant portion of circulating supply locked up and unavailable for selling. Despite the 150M token unlock, price remains stable.',
      outcome: 'Staking demand absorbed the supply pressure. The 600M STRK locked in staking effectively removed that capital from the sell-side — stakers are committed, not selling. The analyst notes: "Staking yield above 6% is consistently absorbing unlock supply in the current market. This is the demand signal that most directly offsets dilution risk for STRK. Monitor staking APY and total staked amount as the primary indicators."',
    },
  ],

  guidedPractice: [
    {
      question: 'STRK has a total supply of 10 billion tokens. StarkWare, shareholders, and employees hold approximately 32.9% combined. According to the four red flags framework, does this trigger the insider allocation red flag?',
      options: [
        'A. Yes — any allocation above 30% to insiders is a red flag',
        'B. No — the four red flags framework triggers the insider allocation warning above 40%. At 32.9%, STRK is below that threshold.',
        'C. Yes — 32.9% is too close to 40% to be comfortable',
        'D. The framework does not apply to Starknet because StarkWare is a reputable company',
      ],
      correct: 1,
      hint: 'The red flag threshold is a specific number from the framework. What is it, and where does 32.9% fall relative to it?',
      explanation: 'B is correct. The four red flags framework triggers on insider allocation above 40% combined (team + investors). At 32.9%, STRK is below this threshold — no red flag is triggered. Option A invents a 30% threshold that does not exist in the framework. Option C applies subjective comfort rather than the defined threshold. Option D incorrectly suggests reputation overrides systematic analysis.',
    },
    {
      question: 'The Starknet Foundation holds approximately 50.1% of total STRK supply in its treasury and distributes it based on ecosystem needs with no hard schedule. Which red flag does this most closely relate to, and is it a full red flag or a yellow flag?',
      options: [
        'A. Red flag 1 (insider allocation) — 50.1% is well above 40%',
        'B. Red flag 3 (no published emission schedule) — yellow flag, not a hard red. The insider allocation is already categorised separately; Foundation treasury flexibility is a monitoring concern, not a crisis.',
        'C. Red flag 4 (treasury control) — this is a critical red flag requiring immediate action',
        'D. No flag triggered — foundations are always trustworthy by design',
      ],
      correct: 1,
      hint: 'Which red flag specifically concerns whether there is a known schedule for when tokens enter circulation? Is the Foundation treasury the same as an insider allocation?',
      explanation: 'B is correct. Red flag 3 asks whether there is a published emission schedule. The Foundation treasury has no hard vesting schedule — it distributes based on ecosystem needs. This is a yellow flag: it creates supply uncertainty (you cannot precisely model when Foundation tokens enter circulation) but is not a crisis — the Foundation has a mandate to support the ecosystem, not sell for profit. Red flag 1 applies to team/investors, not the Foundation. Option D is wrong — systematic analysis applies regardless of entity type.',
    },
    {
      question: 'Monthly STRK unlocks are 60 million tokens. Current daily STRK trading volume is 10 million tokens. Apply the absorption formula. What is the result, and how should you classify the dilution pressure?',
      options: [
        'A. 0.17 days — negligible pressure, no monitoring required',
        'B. 6 days of volume needed to absorb the monthly unlock — moderate pressure range (5–20 days). Monitor unlock dates.',
        'C. 60 days — high pressure, expect significant price decline',
        'D. The formula cannot be applied without knowing the current STRK price',
      ],
      correct: 1,
      hint: 'Monthly unlock ÷ daily volume = days of volume to absorb. 60M ÷ 10M = ?',
      explanation: 'B is correct. 60M ÷ 10M = 6 days. The 5–20 day range is "moderate pressure" — the market needs 6 days of full trading volume to absorb one month of unlocks. This is manageable but not invisible. Monitoring the unlock dates and watching demand signals (staking, new protocol adoption) around those dates is the appropriate response. Option A incorrectly inverts the calculation. Option C overstates the result. Option D is wrong — the absorption ratio is in tokens, not dollars.',
    },
    {
      question: 'An analyst says "STRK\'s tokenomics are fine because the insider allocation is under 40%." What is missing from this assessment?',
      options: [
        'A. Nothing — under 40% is the only metric that matters',
        'B. The assessment checks only red flag 1. A complete assessment also requires: vesting cliff duration (red flag 2), published emission schedule for all categories (red flag 3), and treasury control specifics (red flag 4).',
        'C. The analyst should also check if STRK has a veToken model',
        'D. The only thing missing is knowing whether StarkWare has a good reputation',
      ],
      correct: 1,
      hint: 'How many red flags does the framework have? Which ones does the analyst\'s statement address?',
      explanation: 'B is correct. The four red flags framework has four criteria. The analyst checked only one — insider allocation. A rigorous assessment requires all four: cliff duration, emission schedule completeness, and treasury control specifics. Passing one of four flags is not equivalent to passing all four. Option A is wrong — four flags, not one. Option C introduces a separate framework (veToken) that is not part of the four red flags check. Option D substitutes reputation for systematic analysis.',
    },
    {
      question: 'STRK staking rewards go live and 800 million STRK are staked within 60 days. The monthly unlock during this period is 40 million STRK. How does the staking demand change your assessment of dilution risk in this period?',
      options: [
        'A. Staking has no effect on dilution — it only affects the staker, not the overall supply',
        'B. 800 million STRK staked means 800 million tokens are locked away from the sell side. The 40M monthly unlock enters a market where a large portion of supply is committed to staking and unavailable for selling — significantly reducing effective sell pressure relative to the raw unlock volume.',
        'C. Staking increases dilution — more STRK is being created as staking rewards',
        'D. The assessment remains unchanged — dilution is always determined by the vesting schedule alone',
      ],
      correct: 1,
      hint: 'Think about the demand side. Stakers are committing their STRK and not selling it. What does that do to the effective float available for sale?',
      explanation: 'B is correct. Staking removes tokens from the actively-traded float — stakers are not selling. 800M staked tokens represent committed demand that absorbs selling pressure. The 40M monthly unlock enters a market where 800M tokens are locked in staking, effectively meaning the circulating, sell-eligible supply is much smaller than total circulating supply suggests. This is a classic example of why demand analysis (staking participation) must accompany supply analysis (unlock schedule).',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'STRK data: total supply 10 billion, current circulating supply 1.8 billion (18%), current price $0.60. Monthly unlocks for next 6 months: Month 1: 45M STRK, Month 2: 45M, Month 3: 80M (large cliff event), Month 4: 45M, Month 5: 45M, Month 6: 45M. Current daily trading volume: 12M STRK per day. Calculate: (1) current market cap, (2) FDV, (3) absorption ratio for each of the 6 months, (4) which month represents the highest dilution risk and why.',
      scoringCriteria: [
        'Market cap correctly calculated: 1.8B × $0.60 = $1.08B',
        'FDV correctly calculated: 10B × $0.60 = $6B',
        'Absorption ratios correctly calculated: Months 1/2/4/5/6: 45M ÷ 12M = 3.75 days. Month 3: 80M ÷ 12M = 6.67 days',
        'Month 3 correctly identified as highest dilution risk: the cliff event at 80M tokens is nearly double the normal monthly unlock and requires 6.67 days of full trading volume — the largest concentration of supply pressure in the 6-month window',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A new Starknet protocol token has: 45% team allocation (founders + early employees), 1-month cliff, 24-month linear vesting, no published post-vesting emission schedule, treasury held by a 2-of-3 multisig where all three signers are co-founders. Apply the four red flags framework. Count how many flags are triggered and rate the overall tokenomics risk.',
      scoringCriteria: [
        'Red flag 1 triggered: 45% team allocation exceeds the 40% threshold',
        'Red flag 2 triggered: 1-month cliff means insiders can sell starting in month 2 — well under the 6-month minimum',
        'Red flag 3 triggered: no published post-vesting emission schedule — supply becomes unpredictable after the 24-month vest',
        'Red flag 4 triggered: 2-of-3 multisig with all signers being co-founders is not adequately independent — a coordinated decision by 2 of the 3 controls the treasury with no independent check. Overall rating: all four flags triggered = high risk.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'An investor asks: "Is STRK inflationary?" Write a two-sentence answer that is technically accurate about both the current state (is new STRK being created?) and the 24-month trajectory (what happens to circulating supply over the next two years?). Do not use the words "dilution", "vesting", or "FDV" without first explaining them in plain English.',
      scoringCriteria: [
        'Correctly states current state: STRK has a fixed total supply of 10 billion tokens — no new STRK is ever created. However, locked tokens are being released into circulation on a schedule, which increases the tradeable supply over time.',
        'Correctly states 24-month trajectory: over the next two years, a significant volume of STRK from team and Foundation allocations will become tradeable — this increases the circulating supply and puts downward price pressure if demand does not grow proportionally.',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L3.2 — Starknet Governance: SNIP Process, Voting, Foundation Role
// TYPE A — Dominant concept: Starknet governance works through a
// structured proposal process — but StarkWare's technical
// upgrade authority currently sits above community votes.
// ─────────────────────────────────────────────────────────────

export const LAB3_LESSON_2 = {
  id: 'l3-2-starknet-governance',
  title: 'Starknet Governance: SNIP Process, Voting, Foundation Role',
  trackType: 'A',
  lessonNumber: 2,

  explanation: `
In 2020, the DeFi protocol Compound — a lending platform on Ethereum — made history. Token holders voted to adjust a protocol parameter that affected how interest was distributed. No company made the decision. No board approved it. Token holders proposed, debated, and voted. When the vote passed, the protocol automatically implemented the change. This was on-chain governance working as designed.

But governance in crypto is not just about voting. Governance is about power — and power in crypto ecosystems is never as simple as "everyone votes and the majority wins." Understanding Starknet's governance means understanding who can vote, what they can vote on, and — critically — what happens even when they don't vote.

THE SNIP PROCESS — HOW PROPOSALS BECOME REALITY

SNIP stands for Starknet Improvement Proposal. It is the formal mechanism for proposing changes to the Starknet protocol — anything from adjusting fee parameters to adding new protocol features to changing governance rules themselves.

The process has four stages, in order:

Stage 1 — Draft: Anyone can write a SNIP. A SNIP is a structured document with a specific format: title, abstract, motivation, specification, and backwards compatibility assessment. The author posts it to the Starknet community forum (community.starknet.io) for initial visibility.

Stage 2 — Community discussion: The forum post opens a discussion period. Community members, developers, and Foundation staff comment, ask questions, raise concerns, and propose modifications. This typically runs for 2–4 weeks. The goal is to surface issues before a formal vote.

Stage 3 — Snapshot vote: Once a SNIP is sufficiently developed, it moves to a formal vote on Snapshot — a gasless (free) voting platform where STRK holders vote in proportion to their holdings. One STRK = one vote. There is no minimum holding to vote. Votes are held open for a defined period (typically 5–7 days). The Foundation posts official announcements when votes open.

Stage 4 — Implementation: If the vote passes (typically by simple majority), the SNIP is passed to StarkWare for implementation. StarkWare's engineering team reviews and implements the change.

THE CRITICAL LIMIT OF COMMUNITY GOVERNANCE

Here is the honest reality: the SNIP process governs what the community can propose and vote on. It does not govern everything.

StarkWare currently retains the technical authority to upgrade Starknet's core protocol contracts directly — with a timelock, but without requiring a community vote. This was covered in L1.5 and is worth repeating here in the governance context: the governance process operates alongside StarkWare's technical authority, not above it.

This means: if a community vote contradicts what StarkWare believes is technically necessary, StarkWare retains the ability to act. This is a known and documented centralisation point. The decentralisation roadmap includes moving toward a model where the community has genuine binding authority over protocol upgrades. That transition is underway but incomplete.

For a STRK holder, this means: your vote on Snapshot is meaningful for signalling community preferences and for decisions within the scope the Foundation facilitates. It is not yet a binding veto over core protocol changes.

GOVERNANCE MINIMISATION — A DIFFERENT PHILOSOPHY

Before going further, it is worth understanding that not all DeFi protocols want maximum governance. Some deliberately limit what governance can control.

The argument goes like this: governance is an attack surface. A large governance power means a determined attacker or coordinated group of whales can vote to extract value from the protocol. The more decisions are governable, the more attack surface exists. Governance minimisation means deliberately keeping certain parameters fixed — not controllable by any vote — to protect users from governance attacks.

Curve Finance took the opposite approach: its veToken model gives governance enormous power over which pools receive liquidity rewards. This created the "Curve Wars" — a sustained campaign by protocols to accumulate as much veCRV as possible to direct Curve's reward flows. Maximum governance power created maximum governance competition.

Uniswap, by contrast, long resisted activating its fee switch (a governance decision that would redirect fees to token holders). Even with a fee switch in its code, Uniswap's community was slow to vote to activate it — partly from legitimate governance minimisation philosophy, partly from concerns about regulatory exposure.

For Starknet analysis: understanding where on the governance-minimisation spectrum a protocol sits tells you how much governance risk it carries and how much governance value it offers.
  `.trim(),

  keyTakeaway: `Starknet governance works through the four-stage SNIP process — draft, discuss, Snapshot vote, implement — but StarkWare's technical upgrade authority currently sits above community votes, meaning community governance is meaningful for signalling but not yet binding over core protocol changes.`,

  visualPrompt: `A four-stage horizontal flow diagram. Stage 1 box: "SNIP Draft" — icon of a document with pen. Sub-label: "Anyone can write." Stage 2 box: "Community Discussion" — icon of a speech bubble group. Sub-label: "Forum debate 2–4 weeks." Stage 3 box: "Snapshot Vote" — icon of a ballot and STRK token. Sub-label: "STRK-weighted, gasless, 5–7 days." Stage 4 box: "StarkWare Implementation" — icon of a gear. Sub-label: "Engineering review and deploy." Arrows connect stages left to right. BELOW the flow diagram, a separate box in amber with label "ABOVE THE PROCESS: StarkWare technical upgrade authority — timelock applies, community vote not required." An upward arrow from the implementation box to this amber box labelled "StarkWare retains independent authority."`,
  visualType: 'static',
  visualUrl: 'starknet-snip-governance-process',

  examples: [
    {
      contextTag: '[Community SNIP changing fee parameters]',
      context: 'Starknet developers propose SNIP-18 — a proposal to reduce the minimum gas price on Starknet to improve cost competitiveness against ZKSync. The SNIP is posted to the community forum.',
      scenario: 'Over three weeks, 47 forum comments are posted. Developers raise a concern: reducing the minimum gas price could reduce sequencer revenue, potentially affecting StarkWare\'s operational costs. The SNIP author revises the proposal to include a phased reduction rather than an immediate one. After revision, the community forum sentiment shifts positive. SNIP-18 moves to Snapshot vote.',
      outcome: 'The Snapshot vote passes with 78% in favour. The SNIP moves to StarkWare for implementation. StarkWare reviews it over two weeks and implements the phased fee reduction in the next protocol upgrade. The process worked as designed — community feedback improved the proposal before the vote, and StarkWare implemented what passed.',
    },
    {
      contextTag: '[STRK holder understanding their vote\'s real scope]',
      context: 'A STRK holder votes on Snapshot to reject a proposed protocol upgrade that would change the sequencer\'s fee model. The vote fails — 55% against, 45% for. Despite the vote, StarkWare announces it will implement the upgrade anyway.',
      scenario: 'The holder is upset. She understood that governance votes were binding. But reading the Starknet Foundation documentation carefully, she finds: "Snapshot votes represent community sentiment. Core protocol upgrades remain within StarkWare\'s technical authority during the current phase of decentralisation."',
      outcome: 'Her vote was not binding for a core protocol upgrade. This is the current honest reality of Starknet governance. Her vote contributed to a strong community signal (55% rejection) that may influence StarkWare\'s timeline or approach — but it did not have binding veto power. This does not make governance useless: strong community opposition is real reputational and business pressure on any team. It does mean users should not assume their vote is always the final word.',
    },
    {
      contextTag: '[Curve Wars as governance maximalism example]',
      context: 'A traditional finance analyst covering DeFi asks: "What is the point of governance tokens if they just vote on abstract parameters nobody understands?" The analyst is told about the Curve Wars.',
      scenario: 'Curve Finance gives veToken holders (veCRV) the power to direct which liquidity pools receive weekly CRV reward emissions. Controlling veCRV = controlling where liquidity flows. DeFi protocols that want deep liquidity for their token pairs need Curve to direct rewards to their pool. So they buy veCRV, or they bribe veCRV holders to vote for their pool.',
      outcome: 'The analyst understands: governance tokens with real economic power — like directing hundreds of millions in liquidity rewards — become economically valuable assets, not just voting tokens. The Curve Wars emerged because veCRV control over reward direction had tangible dollar value. This is governance maximalism: maximum governance power creates maximum governance competition. The analyst now understands why governance minimisation exists as a counterphilosophy.',
    },
  ],

  guidedPractice: [
    {
      question: 'What is the correct sequence of stages in the Starknet SNIP process?',
      options: [
        'A. Snapshot vote → Community discussion → Draft → StarkWare implementation',
        'B. Draft → Community discussion → Snapshot vote → StarkWare implementation',
        'C. StarkWare implementation → Draft → Community discussion → Snapshot vote',
        'D. Draft → Snapshot vote → Community discussion → StarkWare implementation',
      ],
      correct: 1,
      hint: 'Think about what logically comes first: writing the proposal, or voting on it?',
      explanation: 'B is correct. The process is sequential: Draft (write the proposal) → Community discussion (forum debate, typically 2–4 weeks) → Snapshot vote (STRK-weighted, gasless, typically 5–7 days) → StarkWare implementation (engineering review and deploy). Discussion comes before the vote because community feedback often improves proposals before they are formally voted on. Voting before discussion would lock in decisions before concerns are raised.',
    },
    {
      question: 'A SNIP passes with 67% of the vote. StarkWare then decides not to implement it because their engineering team believes it creates a security risk. Is this possible under the current Starknet governance structure?',
      options: [
        'A. No — a passed Snapshot vote is legally binding on StarkWare',
        'B. Yes — StarkWare retains technical upgrade authority during the current decentralisation phase. A Snapshot vote represents community preference and is meaningful as a signal, but is not yet binding over core protocol decisions.',
        'C. No — the Foundation would force implementation on StarkWare\'s behalf',
        'D. Yes — StarkWare can ignore any vote that costs them money',
      ],
      correct: 1,
      hint: 'Recall the critical limit of community governance from this lesson. What authority does StarkWare retain?',
      explanation: 'B is correct. StarkWare currently retains technical upgrade authority over core protocol contracts — with a timelock, but without a community vote being binding. A Snapshot vote is a powerful community signal that creates real reputational and business pressure. But if StarkWare\'s engineering team identifies a genuine security concern, they retain the authority to not implement it during the current phase of decentralisation. This is a documented and known characteristic of Starknet\'s current governance structure.',
    },
    {
      question: 'What is "governance minimisation" and why do some DeFi protocols deliberately adopt it?',
      options: [
        'A. Governance minimisation means limiting how many STRK tokens can vote — reducing whale dominance',
        'B. Governance minimisation means deliberately keeping certain protocol parameters outside of governance control — reducing the attack surface for coordinated governance attacks or whale manipulation',
        'C. Governance minimisation means simplifying the voting process so more people participate',
        'D. Governance minimisation is a strategy used only by failed protocols that cannot attract governance participation',
      ],
      correct: 1,
      hint: 'Governance is an attack surface. What does reducing the scope of what governance can change do to that attack surface?',
      explanation: 'B is correct. Governance minimisation reduces what can be changed by vote. The logic: every governable parameter is a potential attack vector — a coordinated group of whales or attackers could vote to extract value. Fewer governable parameters means fewer attack vectors. The trade-off is reduced flexibility — the protocol cannot respond as quickly to market changes. Uniswap applied this philosophy by being slow to activate its fee switch even though it had the technical capability.',
    },
    {
      question: 'Voting on Snapshot is described as "gasless." What does this mean and why does it matter for governance participation?',
      options: [
        'A. Gasless means the vote costs nothing in transaction fees — making participation free for all STRK holders regardless of how many tokens they hold',
        'B. Gasless means the vote is processed off-chain without blockchain verification — making it faster but less secure',
        'C. Gasless means only large STRK holders can participate because they do not pay gas',
        'D. Gasless means the vote cannot be changed once submitted',
      ],
      correct: 0,
      hint: 'Recall the AVNU Paymaster concept from L2.4. What does "gasless" specifically mean for a user trying to take an action?',
      explanation: 'A is correct. Gasless means there is no transaction fee to vote — you do not need to spend STRK or ETH to submit your vote. This matters enormously for governance participation: if voting cost $5 in fees, small STRK holders (who might have voting power worth $20) would rationally not vote — the cost exceeds their proportional impact. Gasless voting removes this barrier, making participation accessible to all holders regardless of position size. Option B is partly true (Snapshot is off-chain signature-based) but "less secure" overstates the concern for its intended purpose.',
    },
    {
      question: 'On-chain data shows that in the last 6 Starknet governance votes, three wallets collectively held 73% of voting power and voted the same way on every proposal. All 6 proposals passed. What does this tell you about the quality of Starknet\'s current governance?',
      options: [
        'A. Nothing concerning — governance that passes proposals efficiently is good governance',
        'B. This indicates significant voting power concentration. If 3 wallets control 73% of votes and coordinate, they can effectively determine all governance outcomes regardless of what the broader community wants. This is governance capture by a small number of large holders.',
        'C. This is evidence that STRK has a high governance participation rate — 3 wallets is better than 0',
        'D. This is only a problem if those 3 wallets vote against StarkWare\'s preferences',
      ],
      correct: 1,
      hint: 'What does 73% voting power in 3 wallets mean for the remaining STRK holders\' ability to influence outcomes?',
      explanation: 'B is correct. 73% in 3 wallets means those 3 wallets can pass or reject any proposal with a simple majority — the remaining holders are effectively bystanders. This is governance capture: a small coordinated group determines all outcomes. The concern is not whether those 3 wallets have voted fairly so far — it is that the governance structure gives them permanent determinative power regardless of broader community preference. This is a meaningful governance risk indicator and should be disclosed in any ecosystem research.',
    },
  ],

  lessonSimulations: [
    {
      type: 'starkzap-ecosystem-read',
      scenario: 'Open the Ecosystem Read simulator and navigate to the Governance tab. Find the three most recent SNIPs on the Starknet governance forum. For each SNIP, record: (1) the SNIP number, (2) its title, (3) its current stage (draft, discussion, vote, implemented), (4) which category it falls into: protocol parameter change, new feature, or governance process change.',
      scoringCriteria: [
        'Correctly identifies three recent SNIPs with their numbers and titles from the simulator',
        'Correctly identifies the current stage of each — distinguishing between active discussion, open vote, and implemented',
        'Correctly categorises each by type: protocol parameter changes affect existing protocol rules, new features add new capabilities, governance process changes affect how governance itself works',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A SNIP proposes giving the Starknet Foundation unilateral emergency pause capability on all DeFi protocols deployed on Starknet, without requiring a community vote, with a maximum pause duration of 72 hours. The stated justification is "rapid response to exploit scenarios." Identify the three governance risks that approving this SNIP would create.',
      scoringCriteria: [
        'Risk 1: Concentration of emergency power in one entity (the Foundation) without on-chain checks creates a single point of governance failure — a compromised Foundation multisig could pause all DeFi simultaneously',
        'Risk 2: "Emergency" is subjective — without a precise technical definition of what constitutes an emergency requiring a pause, the Foundation could interpret business or regulatory pressures as qualifying',
        'Risk 3: Protocols that have deployed to Starknet based on permissionlessness assumptions would have their foundational security guarantee retroactively removed — existing users did not consent to a pause capability when they deposited funds',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A STRK holder with 500 STRK asks: "My vote on Snapshot is so small compared to the whales — is there any point in participating?" Write a two-sentence response that is honest about the current limits of their governance power but accurately represents the value of participation — without being falsely encouraging or dismissive.',
      scoringCriteria: [
        'Honestly acknowledges that 500 STRK represents a small fraction of total voting power and that concentrated large holders have dominant influence in practice',
        'Accurately identifies genuine value of participation: high participation rates and community consensus signals are real reputational and business pressure on teams even where votes are non-binding, and cumulative small-holder turnout can prevent proposals from passing without broad community support',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L3.3 — Protocol Token Design Patterns
// TYPE A — Dominant concept: three design patterns shape how
// DeFi protocol tokens create or fail to create economic value
// for holders — veToken locking, the fee switch, and governance
// minimisation.
// ─────────────────────────────────────────────────────────────

export const LAB3_LESSON_3 = {
  id: 'l3-3-token-design-patterns',
  title: 'Protocol Token Design Patterns',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
When a new DeFi protocol launches with a token, the token usually does one of several things: it gives holders voting rights, it gives holders a share of protocol fees, it gives holders boosted rewards for staying long-term, or some combination of these. The specific design of these mechanics determines whether the token is economically valuable, or merely decorative.

Three token design patterns appear in Starknet protocols — and across DeFi broadly — that you will encounter repeatedly in this track. Understanding each one means you can quickly assess any new protocol's token and know immediately what economic rights it carries and what risks it creates.

PATTERN 1 — THE VE-TOKEN MODEL

In 2020, Curve Finance — the largest stablecoin exchange on Ethereum — introduced a mechanic that changed how DeFi governance tokens were valued. Curve Finance is a decentralised exchange specialising in trading between stablecoins (USDC, DAI, USDT) and similar assets. It holds billions of dollars in liquidity.

The mechanic was simple: lock your Curve tokens (CRV) for a fixed period in exchange for boosted voting power, protocol fee sharing, and boosted liquidity rewards. The longer you lock, the more power you receive. Lock for 4 years = 4× the voting power. Lock for 1 year = 1× the voting power.

The reason this mattered: Curve's voting power controlled which liquidity pools received CRV reward emissions. Every DeFi protocol that wanted deep liquidity for its token pair on Curve needed CRV rewards flowing to its pool. And controlling veCRV (vote-escrowed CRV) meant controlling where those rewards flowed.

DeFi protocols realised they could acquire veCRV or bribe veCRV holders to vote their pools into the reward schedule. Protocol treasuries started accumulating veCRV. A secondary market emerged for buying votes. Billions of dollars were ultimately spent competing for control of Curve's reward distribution. This was called the Curve Wars.

The ve-token model is now a standard DeFi mechanism. Starknet protocols that adopt it create the same dynamics in miniature:

— Locking tokens reduces circulating sell pressure (locked tokens cannot be sold).
— Long-term lockers receive higher rewards, incentivising commitment over speculation.
— Voting power concentrates in the hands of those willing to commit longest.
— Secondary markets for token voting influence can emerge.

When you see a protocol with a veToken model: check the average lock duration and the percentage of total supply locked. A high average lock duration (e.g. 2+ years) and a high locked percentage (e.g. 60%+) signal strong holder conviction and low short-term sell pressure. A low average duration signals people are locking briefly to capture rewards without committing — a weaker signal.

PATTERN 2 — THE FEE SWITCH

Imagine you own shares in a company that earns $10 million in revenue per year. The company currently pays that revenue to its operational partners — not to you as a shareholder. Someone proposes activating a mechanism to redirect 10% of revenue to shareholders instead. The operational partners earn a little less. Shareholders receive direct income for the first time.

This is exactly the fee switch in DeFi. DEX trading fees (e.g. 0.3% on every swap) typically go to liquidity providers — the people who deposited capital to enable trading. Token holders receive nothing. A fee switch is a protocol parameter that, when activated, redirects a portion of trading fees from liquidity providers to the protocol treasury or directly to token holders.

Uniswap — the largest decentralised exchange on Ethereum — has had a fee switch in its code since it launched. For years, the community debated whether to activate it. Arguments against: if LP returns drop, liquidity providers withdraw, liquidity gets thinner, traders get worse prices, volume falls, and paradoxically the protocol earns less overall. Arguments for: token holders are investing in the protocol's future — they deserve economic rights, and the protocol needs treasury income.

A fee switch is a governance power: whoever controls governance decides whether token holders capture protocol value. For ecosystem analysis, a protocol with an active fee switch is generating income for token holders. A protocol with an inactive fee switch is not — token value depends entirely on speculation about future activation and adoption growth.

PATTERN 3 — GOVERNANCE MINIMISATION

Some protocols deliberately limit what their governance can control. The argument is covered in L3.2 — governance is an attack surface, and fewer governable parameters means fewer ways for coordinated actors to extract value.

In practice, governance minimisation often means certain protocol parameters are set at launch and cannot be changed by vote — fee tiers, collateral ratios, liquidation thresholds. The protocol is more predictable for users (no surprise changes via governance vote) but less flexible in responding to market conditions.

For token analysis: a protocol with extensive governance minimisation has tokens that are worth less from a governance rights perspective — there is simply less to govern. The token's value must come from fee share, staking yield, or speculative adoption growth instead.

READING A NEW TOKEN IN 60 SECONDS

When you encounter a new Starknet protocol token, three questions in order:

1. What economic rights does holding give me? (Fee share? Staking yield? Governance-only?)
2. Is there a veToken model or a fee switch? (Either creates real economic value for committed holders.)
3. How much of governance is minimised? (Less governable = token value must come from elsewhere.)

The answers tell you whether the token is primarily a speculation vehicle (governance-only, no fee share) or a yield-generating asset (fee switch active, veToken model, or staking rewards). Both can be valid investments — but they carry completely different risk/return profiles.
  `.trim(),

  keyTakeaway: `Three token design patterns determine a DeFi token's economic value: the ve-token model (lock for voting power and fee share), the fee switch (redirect fees from LPs to token holders), and governance minimisation (fewer governable parameters reduce attack surface but reduce governance value).`,

  visualPrompt: `Three side-by-side pattern cards. Card 1 (Ve-Token — purple): diagram showing CRV → locked → veCRV with longer lock = more power. Below: "Locks supply, boosts commitment, creates liquidity competition." Key metric label: "Average lock duration + % supply locked." Card 2 (Fee Switch — green): diagram showing trading fees splitting — arrow to LP (large) and arrow to token holders (smaller, labelled "switch on"). Below: "Active = holders earn. Inactive = speculation only." Card 3 (Governance Minimisation — grey): diagram showing parameters with some locked (padlock icon) and some governable (ballot icon). Below: "Fewer attack surfaces. Less governance value." Three-question checklist at bottom: "1. Economic rights? 2. Ve-token or fee switch? 3. Governance scope?"`,
  visualType: 'static',
  visualUrl: 'token-design-patterns-three-cards',

  examples: [
    {
      contextTag: '[Curve Wars explained to a traditional finance analyst]',
      context: 'A fund manager who invests in traditional equity markets tries to understand why DeFi protocols spent hundreds of millions of dollars trying to accumulate Curve\'s governance token (veCRV).',
      scenario: 'The analyst explains: Curve Finance controls the distribution of CRV rewards to liquidity pools. Controlling veCRV = controlling where hundreds of millions in rewards flow per year. A DeFi protocol that gets Curve to direct rewards to its liquidity pool gets free liquidity subsidy — effectively cutting its liquidity costs. Accumulating veCRV is like buying a distribution deal with the dominant platform in your market.',
      outcome: 'The fund manager understands: it is not "buying votes for fun." It is acquiring control over a critical resource allocation mechanism. The Curve Wars were a rational economic competition for access to subsidised liquidity. The analogy: if a major grocery chain\'s shelf space was allocated by vote, every food brand would buy as many votes as possible to guarantee their products got displayed.',
    },
    {
      contextTag: '[Fee switch decision at Uniswap]',
      context: 'Uniswap has had a fee switch in its code since 2018. In 2024, the community finally activated a version of it — after 6 years of debate. A DeFi analyst is asked to explain why it took so long.',
      scenario: 'The debate had three dimensions: (1) economic: activating the switch redirects fees from LPs to UNI holders. LP returns drop. If LPs withdraw, liquidity thins, prices worsen for traders, volume falls. (2) regulatory: US regulators were watching. Directing protocol revenue to UNI holders could be characterised as a security-like arrangement. (3) governance: large UNI holders had conflicting interests — some were LPs who would lose income.',
      outcome: 'The 6-year delay illustrates that a fee switch is not simply a technical toggle — it redistributes economic interests. When activated, it created winners (UNI holders) and losers (LPs receiving a smaller share). Every stakeholder with conflicting interests had an incentive to delay. Understanding this dynamic is essential for any protocol with an inactive fee switch: the switch represents latent value for token holders, but activation requires winning a multi-stakeholder governance battle.',
    },
    {
      contextTag: '[Analyst evaluating a new Starknet protocol token]',
      context: 'A new Starknet DeFi protocol launches with a token and publishes its tokenomics documentation. An analyst applies the three-question framework in 60 seconds.',
      scenario: 'Question 1: Economic rights — governance voting only, no fee share, no staking yield. Question 2: Ve-token or fee switch — fee switch exists in code but is marked "pending governance activation." No veToken model. Question 3: Governance minimisation scope — fee tiers, collateral ratios, and oracle selection are all governable.',
      outcome: 'The analyst\'s 60-second assessment: "Governance-only token at launch — speculation vehicle with optionality on fee switch activation. The fee switch represents the key value catalyst: if activated, token holders earn protocol income. The governable scope is broad, which means real governance power but also real governance attack surface. Hold thesis: buying optionality on fee switch activation and hoping governance quality is high enough to avoid extractive proposals."',
    },
  ],

  guidedPractice: [
    {
      question: 'A protocol\'s token has a veToken model. Current data: 70% of total supply is locked, average lock duration is 2.8 years. What does this tell you about short-term sell pressure and holder conviction?',
      options: [
        'A. High sell pressure — 70% locked means 70% of holders want to sell but cannot',
        'B. Low sell pressure and high conviction — 70% locked means 70% of supply is committed to staking for years and unavailable for sale. Average 2.8-year lock suggests holders are making multi-year commitments, not short-term plays.',
        'C. Neutral — lock duration and lock percentage have no relationship to sell pressure',
        'D. High sell pressure — all locked tokens will unlock simultaneously causing a large sell event',
      ],
      correct: 1,
      hint: 'Locked tokens cannot be sold. What does a high lock percentage and long average duration imply about the sellers available in the market?',
      explanation: 'B is correct. 70% locked = 70% of total supply is unavailable for sale right now. Average 2.8 years of lock means most of those tokens will not be available for 2+ more years. This dramatically reduces short-term circulating sell pressure. Holders who locked for 2.8 years on average made a long-term commitment — they were not seeking quick liquidity. This is the strongest positive signal the veToken mechanic produces. Option A inverts the logic — locked = unavailable to sell, not unable to sell by choice.',
    },
    {
      question: 'A DEX protocol activates its fee switch. LP returns drop from 12% APY to 10.8% APY (10% of fees redirected to token holders). The total liquidity in the protocol is $80M. Model the first-order risk.',
      options: [
        'A. No risk — 1.2 percentage point reduction is too small to matter',
        'B. Some LPs who were choosing this DEX over alternatives specifically for its 12% yield may withdraw and redeploy to a DEX still offering 12%. If a meaningful portion of the $80M exits, liquidity thins, trading prices worsen, volume falls, fee revenue falls, and the fee switch generates less income for token holders than expected.',
        'C. The fee switch guarantees protocol revenue will increase because token holders will now buy the token',
        'D. All $80M liquidity will immediately exit when the fee switch activates',
      ],
      correct: 1,
      hint: 'Think about LP decision-making. LPs can always move capital elsewhere. What happens if they do?',
      explanation: 'B is correct. LP capital is mobile — if competing DEXs offer higher yields, rational LPs will withdraw and redeploy. A 1.2 percentage point reduction is meaningful in a competitive yield environment. If liquidity withdraws, the DEX\'s trading efficiency falls, volume follows, and fee revenue (from which both LPs and token holders earn) decreases. The fee switch may generate less token holder income than anticipated if the liquidity base contracts. This is the classic liquidity-governance trade-off that Uniswap debated for 6 years.',
    },
    {
      question: 'Two protocols are compared. Protocol A: veToken model with active fee switch and 65% of supply locked for average 2.5 years. Protocol B: governance-only token, no veToken model, fee switch exists in code but has never been activated. How would you characterise the difference in their tokens\' current economic value?',
      options: [
        'A. Both tokens have equal value — governance rights are always worth the same',
        'B. Protocol A\'s token has direct current economic value: locking earns fee share and boosted rewards. Protocol B\'s token is currently governance-only — its value is speculative, dependent on future fee switch activation. Protocol A creates yield; Protocol B creates optionality.',
        'C. Protocol B is more valuable — an inactive fee switch preserves LP loyalty',
        'D. Protocol A is more valuable only if you are a large holder who can influence the veToken votes',
      ],
      correct: 1,
      hint: 'What economic rights does each token give its holder today — not in the future?',
      explanation: 'B is correct. Protocol A\'s token gives current economic rights: fee share through the active fee switch and boosted rewards through the veToken model. Holders earn today. Protocol B\'s token gives governance rights over a protocol where the fee switch exists but has not been activated — token holders earn nothing from protocol revenue today. Protocol B\'s value is the optionality that the community eventually votes to activate the switch. Both can be rational investments — Protocol A is a yield investment, Protocol B is an option on future value activation.',
    },
    {
      question: 'What is the primary downside of governance minimisation for a token holder?',
      options: [
        'A. Governance minimisation makes tokens completely worthless',
        'B. Governance minimisation reduces the scope of what holders can vote on — fewer governable parameters means less governance power, so token value must come from other sources (fee share, staking yield) rather than from the power to change protocol rules',
        'C. Governance minimisation means the team can do anything without any community input',
        'D. Governance minimisation increases attack surface because fewer people participate in voting',
      ],
      correct: 1,
      hint: 'If fewer things can be governed, what happens to the value of governance rights?',
      explanation: 'B is correct. Governance minimisation is explicitly about reducing the scope of what can be changed by vote. If the fee tier, collateral ratio, and oracle selection are all fixed and cannot be governed, the governance token\'s value from governance rights is reduced. Token value must come from other sources. This is a rational design choice (fewer attack surfaces) with a real trade-off (less governance value). Option C is wrong — governance minimisation limits what can be voted on, not all community input. Option D inverts the attack surface logic.',
    },
    {
      question: 'A new Starknet protocol token: governance-only, no fee share, no staking yield, no veToken model. The fee switch exists in code and is described as "under community consideration." How should an analyst characterise this token\'s investment thesis?',
      options: [
        'A. Strong buy — governance tokens always appreciate over time',
        'B. Speculation vehicle with optionality. Current economic rights: none (governance only, no income). Value thesis: depends on fee switch activation and adoption growth generating fees worth capturing. Risk: fee switch may never activate, or activation may be delayed years as Uniswap\'s was.',
        'C. Avoid entirely — governance-only tokens have no value',
        'D. Strong hold — the fee switch guarantees future income',
      ],
      correct: 1,
      hint: 'What economic rights does the token provide today vs what it might provide in the future?',
      explanation: 'B is correct. Today the token has no direct economic rights — no fee share, no yield. The only value is governance rights (over a protocol with limited actual governance scope) and the option on future fee switch activation. This makes it a speculation vehicle — the investment thesis depends on believing (a) adoption grows enough that activated fees would be meaningful, (b) governance activates the switch, and (c) the protocol does not get outcompeted before that happens. All three are uncertain. The Uniswap example shows this process can take years. Option A is baseless. Option C dismisses optionality that can have real value. Option D is wrong — "under consideration" is not a guarantee.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'A Starknet protocol\'s veToken data: total supply 500M tokens, currently locked in ve-contract: 340M (68%), average lock duration: 2.1 years, maximum lock duration: 4 years. Token price: $0.40. Fee switch is active — 15% of all trading fees redirect to ve-token holders. Last 30-day trading volume: $28M. Fee tier: 0.3%. Calculate: (1) monthly fee revenue from trading, (2) ve-token holder share at 15%, (3) annualised yield on locked tokens at current price. State whether the yield is attractive relative to a 5% risk-free rate benchmark.',
      scoringCriteria: [
        'Monthly fee revenue correctly calculated: $28M × 0.3% = $84,000',
        'Ve-token holder share correctly calculated: $84,000 × 15% = $12,600 per month = $151,200 annualised',
        'Locked token value correctly calculated: 340M × $0.40 = $136M. Annualised yield: $151,200 ÷ $136M = 0.11% — significantly below the 5% risk-free benchmark',
        'Correctly concludes: the current fee yield is not competitive at this price and volume level. The investment thesis must rely on volume growth (more fees) or price appreciation of the locked tokens, not current yield alone.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A DeFi protocol on Starknet has $60M in total liquidity and generates 8.5% APY for liquidity providers. It proposes activating a fee switch that would redirect 15% of trading fees to token holders. LP returns would drop from 8.5% to 7.2% APY. Two competing DEXs on Starknet offer 8.0% and 8.8% APY respectively. Model: (1) which LPs would likely leave, (2) how much liquidity might exit, (3) what the cascading effect on fee revenue would be.',
      scoringCriteria: [
        'Correctly identifies that LPs earning 8.5% who see it drop to 7.2% are now earning below one competitor (8.0%) and well below the other (8.8%) — rational LPs optimising for yield would start evaluating alternatives',
        'Correctly estimates liquidity at risk: the portion of LPs whose sole criterion is APY maximisation — likely 20–40% of the pool — could realistically migrate if alternatives are easily accessible',
        'Correctly traces the cascade: if 25% of $60M ($15M) exits, trading depth thins, spreads widen, volume falls, fee revenue falls, the 7.2% APY for remaining LPs also falls — a self-reinforcing exit if volume decline is significant enough',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A traditional finance analyst who understands dividend yield but has never used crypto asks: "What were the Curve Wars?" Explain in two sentences. Do not use the words "governance", "protocol", "DeFi", "AMM", "liquidity mining", or "smart contract".',
      scoringCriteria: [
        'Correctly explains what veCRV controlled: locked Curve tokens gave holders the right to direct the platform\'s reward distributions — similar to controlling which products receive shelf space subsidies on a dominant retail platform',
        'Correctly explains why this created economic competition: companies that needed their token pairs prominently featured on Curve\'s platform spent hundreds of millions acquiring this voting power or paying bribes to those who held it — a rational economic competition for access to a subsidised distribution channel',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L3.4 — Reading Tokenomics Documentation Critically
// TYPE B — Dominant concept: four structured steps applied to
// any tokenomics document produce a rigorous, calculable risk
// assessment — allocation audit, timeline analysis, value accrual
// check, and incentive alignment test.
// ─────────────────────────────────────────────────────────────

export const LAB3_LESSON_4 = {
  id: 'l3-4-reading-tokenomics-critically',
  title: 'Reading Tokenomics Documentation Critically',
  trackType: 'B',
  lessonNumber: 4,

  prerequisiteCheck: `
PREREQUISITE CHECK
──────────────────────────────────────────────────────────────────────────────
REQUIRED    Primer L0.2 — FDV, circulating supply, dilution, vesting
REQUIRED    Lab 3 L3.1 — The four red flags framework applied to STRK
RECOMMENDED Lab 3 L3.3 — Fee switch and value accrual concepts
──────────────────────────────────────────────────────────────────────────────
  `,

  explanation: `
In 2021, a DeFi protocol called Wonderland (TIME token) attracted billions of dollars in deposits with a promise of 80,000% APY. The tokenomics documentation described a complex bonding and rebasing mechanism. Most investors did not read it carefully. Those who did noticed: the mechanism only sustained those yields by constantly minting new tokens, which diluted existing holders at roughly the same rate as the yield was paid. You were not actually earning — you were spinning in place while the number of tokens increased. The protocol collapsed in January 2022 with over $1B in losses.

Tokenomics documentation is where the honest and dishonest information about a token coexists. Both are technically present. Your job is to extract the honest information and expose the misleading framing.

This lesson gives you a four-step framework to apply to any tokenomics document — structured, sequential, and calculable.

LAYER 1 — THE REAL-WORLD ANCHOR

This framework exists because tokenomics fraud and confusion consistently follow the same patterns: presenting large community allocations that are actually locked for 10 years (so insiders control early value), presenting high yields that are funded by inflation (so you earn tokens worth less), and presenting governance rights as value when the governance has nothing meaningful to control.

The Wonderland collapse was a documented example of step 2 failure: nobody modelled the timeline of new token creation vs yield claimed. Had any major analyst done the absorption calculation correctly, the Ponzi structure would have been obvious.

LAYER 2 — THE FOUR-STEP MECHANISM

STEP 1 — ALLOCATION AUDIT

Read the tokenomics document and extract every allocation category with its percentage:
— Team: X%
— Investors: Y%
— Community: Z%
— Treasury: W%
— Ecosystem rewards: V%

Then calculate:
Insider total = Team % + Investor % (do not include Foundation/Treasury)

If insider total > 40%: red flag 1 triggered.

Next: ask whether the "community" allocation is genuinely accessible early or effectively locked for years. A "60% community" allocation that unlocks uniformly over 10 years gives the community 6% per year — less than the team if the team's 20% vests in 4 years. The label "community" is meaningless without the unlock schedule.

STEP 2 — TIMELINE ANALYSIS

For each allocation category, extract:
— Cliff: months before first token release
— Vesting period: months of gradual release after cliff
— Total tokens: absolute number

Then calculate for each category:
Monthly unlock volume = total tokens in category ÷ vesting period (months)

Then sum all monthly unlocks across all categories for each month.

Then compare each month's total unlock to current daily trading volume:
Absorption ratio = monthly unlock ÷ daily volume

Plot this across 24 months. Identify the highest-pressure months. Flag any month where absorption ratio > 20 days as high risk.

STEP 3 — VALUE ACCRUAL CHECK

Ask one question: if I hold this token, what do I receive?

Three possible answers:

A) Governance rights only: you can vote. Votes influence protocol direction. No direct economic return. Token value is pure speculation on adoption.

B) Fee share: a portion of protocol trading fees, borrowing interest, or revenue goes to token holders (directly or via buybacks). The token has direct economic yield.

C) Staking yield: protocol mints or distributes new tokens to stakers. Yield is paid in the same token — check whether the staking yield is simply inflationary (new tokens minted, diluting everyone) or revenue-funded (actual protocol income distributed to stakers).

The dilution multiplier formula:
FDV ÷ current market cap = dilution multiplier

If FDV ÷ market cap = 10: potential 10× dilution as locked tokens unlock. A token yielding 8% staking APY on an inflationary model while facing 10× dilution is paying you 8% to watch your principal fall 90%.

STEP 4 — INCENTIVE ALIGNMENT TEST

Ask: are the people who matter incentivised to make this succeed long-term?

Team: long vesting (4+ years with substantial cliff)? They need the protocol to succeed for years to capture their tokens' value. Short vesting? They may benefit from hype, not execution.

Large early investors: same question. Did early investors negotiate short cliffs or large initial unlocks? A fund that receives 10M tokens with a 1-month cliff has every incentive to promote and sell, not build.

Founders with governance control: if founders hold enough tokens to control governance outcomes and their tokens vest in 2 years, they have 2 years to use governance to benefit themselves before moving on.

The test is simple: would the people making decisions still benefit from long-term protocol success in year 3 and year 5? If their tokens are all vested by year 2, the answer may be no.

LAYER 3 — THE FORMULAS

Dilution multiplier:
FDV ÷ current market cap

Monthly unlock absorption ratio:
Monthly unlock volume (tokens) ÷ daily trading volume (tokens)

Monthly unlock in USD:
Monthly unlock volume (tokens) × current price

Annualised staking yield (inflation-adjusted):
(Staking APY %) − (annual inflation rate from new token issuance %)

A staking yield of 8% on a token minting 12% more tokens annually = real yield of −4%. You are losing ground.

LAYER 4 — WHAT PRECEDES AND FOLLOWS THIS STEP

This four-step framework follows L3.1 (STRK token as the first application) and L3.3 (understanding value accrual patterns). It precedes L3.5 (governance risk framework) — the two together form a complete protocol analysis toolkit. In Lab 6, you will combine this tokenomics framework with revenue sustainability analysis to build a full protocol research report.
  `.trim(),

  keyTakeaway: `A rigorous tokenomics review follows four steps — allocation audit (insider % vs 40% threshold), timeline analysis (monthly unlock absorption ratio), value accrual check (governance-only vs fee share vs real yield), and incentive alignment test (does the team benefit from 5-year success?) — and the dilution multiplier (FDV ÷ market cap) is the single most revealing number in any tokenomics document.`,

  visualPrompt: `A four-step vertical checklist. Step 1 "Allocation Audit": formula "Insider % = Team + Investors. Flag if >40%." Step 2 "Timeline Analysis": formula "Monthly unlock ÷ daily volume = absorption days. Flag if >20." Step 3 "Value Accrual Check": three outcome boxes — "Governance only (speculation)", "Fee share (direct yield)", "Staking (check inflation)." Formula: "FDV ÷ market cap = dilution multiplier." Step 4 "Incentive Alignment": question "Does the team still benefit in year 5?" Two outcomes: "Long vest = aligned" (green), "Short vest = misaligned" (red). Clean, sequential flow. No text inside formula boxes.`,
  visualType: 'static',
  visualUrl: 'tokenomics-four-step-framework',

  examples: [
    {
      contextTag: '[Wonderland collapse as framework validation]',
      context: 'In late 2021, Wonderland (TIME token) offered staking yields of 80,000%+ APY. The tokenomics described a rebasing mechanism — stakers received frequent "rebases" that increased their token balance.',
      scenario: 'Applying Step 3 (value accrual check): the staking yield was paid entirely in new TIME tokens minted from the protocol treasury. Applying the inflation-adjusted yield formula: staking yield was positive, but the protocol was minting new tokens at a rate that mathematically could not be sustained without constant new deposits. The yield was funded by dilution, not revenue. Step 2 (timeline analysis): with no meaningful vesting constraints on the treasury, supply growth was essentially unconstrained.',
      outcome: 'A rigorous step 3 analysis would have revealed that the "80,000% APY" was inflationary yield with no revenue backing — you earned more tokens, but each token was worth proportionally less as supply inflated. The protocol collapsed in January 2022. The four-step framework, applied correctly at launch, would have identified this as governance-only + inflationary yield with a dilution multiplier that made the stated APY economically impossible to sustain.',
    },
    {
      contextTag: '[Community allocation framing exposed]',
      context: 'A new DeFi protocol whitepaper states: "60% community allocation — the most community-friendly tokenomics in DeFi." The team holds 15% and investors hold 10%. FDV at launch: $500M.',
      scenario: 'An analyst applies Step 1 and Step 2. Insider total: 15% + 10% = 25% — below 40%, no red flag 1. Step 2 on the community allocation: 60% of total supply, unlocking uniformly over 10 years = 6% per year. Team tokens vest over 3 years. Early investor tokens vest over 2 years. By year 3, all team and investor tokens are liquid — 25% of supply in strong hands. The community has received 18% (6% × 3 years).',
      outcome: 'At year 3, insiders hold fully liquid tokens representing 25% of supply. The community has received 18% — less than the insiders despite a nominally "60% community" allocation. The "community-first" narrative is technically true (60% allocated to community) but structurally misleading when the timeline reveals insiders become fully liquid long before the majority of community tokens unlock.',
    },
    {
      contextTag: '[FDV vs market cap revealing dilution risk]',
      context: 'A Starknet protocol token: current price $2.50, circulating supply 40M tokens, total supply 400M tokens. Current market cap: $100M.',
      scenario: 'An analyst calculates Step 3 dilution multiplier: FDV = $2.50 × 400M = $1B. Dilution multiplier = $1B ÷ $100M = 10×. The token has 10× more supply to come than is currently tradeable. Step 2: the remaining 360M tokens vest over 48 months = 7.5M tokens per month. Daily trading volume: 2M tokens. Absorption ratio: 7.5M ÷ 2M = 3.75 days per month — moderate pressure.',
      outcome: 'FDV of $1B means at current price, 10× more value needs to enter without price falling — requiring demand to grow 10× to absorb full supply at this price. The monthly absorption is manageable (3.75 days), but the total dilution scale means this token\'s price requires sustained demand growth over 4 years just to hold current value. The analyst\'s report notes: "Fair value at current adoption levels implies significant overvaluation on FDV basis. Investment thesis requires 4-year demand growth narrative."',
    },
  ],

  guidedPractice: [
    {
      question: 'A tokenomics document shows: Team 18%, Investors 24%, Foundation 35%, Community 23%. What is the insider allocation percentage and does it trigger red flag 1?',
      options: [
        'A. 77% — the Foundation and community are also insiders. Red flag triggered.',
        'B. 42% (team + investors). Red flag 1 triggered — above the 40% threshold.',
        'C. 18% — only the founding team counts as insiders. No red flag.',
        'D. 42% — red flag 1 triggered. The Foundation\'s 35% should also be noted separately as a monitoring concern.',
      ],
      correct: 3,
      hint: 'Insider allocation = Team + Investors only. Calculate and compare to 40%.',
      explanation: 'D is correct. Insider allocation = 18% (team) + 24% (investors) = 42%. This exceeds the 40% threshold — red flag 1 is triggered. The Foundation\'s 35% is separately noted as a monitoring concern (flexibility of distribution without hard schedule), but it is not counted in the insider calculation. Options A incorrectly includes the Foundation and community. Option C uses only the founding team. Option B is numerically correct but misses the important Foundation note.',
    },
    {
      question: 'Monthly token unlocks are 8M tokens. Daily trading volume is 1.5M tokens. The absorption ratio is 5.3 days. According to the framework, how do you classify this pressure level?',
      options: [
        'A. Low pressure — under 5 days',
        'B. Moderate pressure — in the 5–20 day range. Monitor unlock dates.',
        'C. High pressure — above 20 days',
        'D. Cannot classify without knowing the token price',
      ],
      correct: 1,
      hint: '8M ÷ 1.5M = 5.3 days. Which range does this fall into: under 5 (low), 5-20 (moderate), or above 20 (high)?',
      explanation: 'B is correct. 8M ÷ 1.5M = 5.3 days — in the 5–20 day moderate pressure range. The market needs 5.3 days of full trading volume to absorb one month of unlocks. This is manageable but worth monitoring around unlock dates. The classification does not require the token price — the absorption ratio is calculated in token units, not dollars.',
    },
    {
      question: 'A token offers 12% staking APY. The protocol mints 16% more tokens annually to fund staking rewards (no revenue-backed yield). What is the inflation-adjusted real yield?',
      options: [
        'A. 12% — staking yield is the yield, regardless of how it is funded',
        'B. −4% — the 16% annual token inflation reduces the value of your holdings faster than the 12% staking APY replenishes it. You earn more tokens but each is worth proportionally less.',
        'C. 28% — add staking yield plus inflation for total token growth',
        'D. 0% — inflation and staking yield always cancel out exactly',
      ],
      correct: 1,
      hint: 'Apply the formula: staking APY − annual inflation rate from new token issuance = real yield.',
      explanation: 'B is correct. Real yield = 12% − 16% = −4%. You are earning 12% more tokens annually through staking, but the total token supply is growing 16% annually — your percentage ownership is shrinking faster than it is growing. In dollar terms (assuming flat demand), your purchasing power falls 4% per year despite "earning" 12% staking. This is the Wonderland trap: inflationary yield creates the appearance of income while destroying real value.',
    },
    {
      question: 'A protocol has a $120M market cap and a $1.8B FDV. What is the dilution multiplier and what does it mean for a potential investor?',
      options: [
        'A. 15× — at current price, 15× more supply will enter circulation than currently exists. Demand must grow 15× to maintain current price as all tokens unlock.',
        'B. 1.5× — minor dilution, acceptable for most investments',
        'C. 0.07× — the market cap is a fraction of FDV, which is bullish',
        'D. The dilution multiplier cannot be calculated from these figures',
      ],
      correct: 0,
      hint: 'Dilution multiplier = FDV ÷ market cap. $1.8B ÷ $120M = ?',
      explanation: 'A is correct. $1.8B ÷ $120M = 15×. This means 15× more token supply is coming relative to what is currently circulating. At the current price, demand must grow 15× to absorb all future supply without price falling. This is a high-dilution scenario requiring a strong demand growth narrative to justify the current price. Most investors apply a significant discount to FDV-heavy tokens — the current market cap price implies a lot of future demand that has not yet materialised.',
    },
    {
      question: 'A protocol\'s founding team holds 20% of total supply with a 6-month cliff and 18-month linear vest. By month 25 (2 years and 1 month after launch), what percentage of the team\'s tokens are fully liquid?',
      options: [
        'A. 0% — vesting lasts forever',
        'B. 100% — all team tokens are fully vested and liquid. The 6-month cliff plus 18 months of linear vesting = 24 months total. By month 25, all tokens are unlocked.',
        'C. 50% — half vested by month 25',
        'D. 83% — 25 months of a 30-month vest',
      ],
      correct: 1,
      hint: 'Map the timeline: month 0–6 = cliff (nothing released). Month 7–24 = 18 months of linear vesting (equal monthly releases). By month 24, what percentage has vested?',
      explanation: 'B is correct. The timeline: months 1–6 = cliff, zero tokens released. Months 7–24 = 18 months of linear vesting. 18 months ÷ 18 months = 100% of team tokens fully vested by month 24. By month 25, all team tokens are liquid. For the incentive alignment test: by month 25, the founding team has zero vesting-based incentive to continue building. Whether they do depends on governance token value and equity stakes, not vesting. This is a moderate-duration cliff — not as strong as a 4-year vest, but better than a 1-month cliff.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'Apply all four steps to this tokenomics summary. Token: NOVA. Total supply: 200M. Allocations: Team 22%, Investors 20%, Foundation 25%, Community 33%. Vesting: Team 6-month cliff + 36-month linear. Investors 3-month cliff + 24-month linear. Foundation: no hard schedule. Community: unlocks uniformly over 60 months. Current price: $1.20. Circulating supply: 15M (7.5% of total). Daily trading volume: 1.8M tokens. Fee switch: in code, not yet activated. Calculate: insider %, FDV, dilution multiplier, monthly unlock in month 4 (after team cliff but before investor cliff expires... wait — investor cliff is 3 months so by month 4 investors are vesting). State your overall risk rating.',
      scoringCriteria: [
        'Step 1: Insider % = 22% + 20% = 42% — red flag 1 triggered (above 40%)',
        'Step 2: Month 4 unlocks: Team vesting starts month 7 (not yet). Investor cliff ends month 3 — in month 4 investors begin vesting: 40M tokens ÷ 24 months = 1.67M/month. Community: 66M ÷ 60 = 1.1M/month. Total month 4 unlock: 2.77M. Absorption ratio: 2.77M ÷ 1.8M = 1.54 days — low pressure',
        'Step 3: FDV = 200M × $1.20 = $240M. Dilution multiplier = $240M ÷ (15M × $1.20) = $240M ÷ $18M = 13.3×. Fee switch not active — governance only currently.',
        'Overall risk: Red flag 1 triggered (42% insider), 13.3× dilution multiplier (high), governance-only token currently. Moderate-high risk. Monitor month 7 when team vesting starts.',
      ],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol\'s whitepaper says "community allocation: 60%." A footnote explains the 60% unlocks uniformly over 10 years. The team holds 25% with a 2-year vest (no cliff). Investors hold 15% with a 1-year vest. Apply Steps 1 and 2. By year 2, what percentage of total supply has the team received vs the community? State whether the "community-first" framing is accurate.',
      scoringCriteria: [
        'By year 2: team has received 100% of their 25% (fully vested) = 25% of total supply fully liquid. Investors have received 100% of their 15% (fully vested year 1) = 15% liquid. Community has received 12% of total supply (6% per year × 2 years of 60% allocation).',
        'By year 2: insiders hold 40% of total supply fully liquid. Community has received 12%. The "60% community" allocation is accurate on paper but structurally misleading — insiders become fully liquid 8 years before the community reaches its full allocation.',
        'The "community-first" framing is not accurate as a description of early economic distribution — it accurately describes the final destination of tokens after 10 years, not the near-term power dynamics.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a three-sentence tokenomics summary for STRK that a potential investor could use to make an informed decision. Your summary must include: (1) one specific strength from the framework analysis, (2) one specific risk or monitoring requirement, (3) the current dilution multiplier using a STRK price of $0.60 and total supply of 10B. Use no jargon without definition.',
      scoringCriteria: [
        'Strength correctly identified and stated specifically: e.g. insider allocation at 32.9% is below the 40% threshold, indicating a lower-than-average insider concentration for a major blockchain project',
        'Risk or monitoring requirement correctly identified and stated: e.g. the Starknet Foundation treasury (50.1% of supply) has no hard distribution schedule — future token releases from this allocation are unpredictable and should be monitored for ecosystem announcements',
        'Dilution multiplier correctly calculated and stated: FDV = 10B × $0.60 = $6B. Current market cap requires knowing circulating supply — if 18% circulating: 1.8B × $0.60 = $1.08B market cap. Dilution multiplier = $6B ÷ $1.08B = 5.56×',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L3.5 — Evaluating a Protocol's Governance Risk
// TYPE A — Dominant concept: five dimensions determine governance
// risk — token concentration, upgrade power, voter participation,
// emergency controls, and treasury control.
// ─────────────────────────────────────────────────────────────

export const LAB3_LESSON_5 = {
  id: 'l3-5-governance-risk-framework',
  title: 'Evaluating a Protocol\'s Governance Risk',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
In 2022, the governance system of Mango Markets — a DeFi lending protocol on Solana — was used against its users. An attacker took out a large leveraged position in Mango's own token (MNGO), manipulated the price upward, used the inflated collateral to borrow $117 million from the protocol, and then proposed a governance vote to forgive his loan and return a smaller amount to the protocol. Because he held enough governance tokens from his manipulation profits, he could pass the vote. Technically, the governance process worked exactly as designed. The outcome was theft.

This lesson teaches you to evaluate governance risk before depositing funds — not after. The five-dimension framework turns governance assessment from a vague impression ("the team seems trustworthy") into a structured, specific analysis.

REFERENCE CARD — THE FIVE DIMENSIONS

Apply these in order for any protocol.

DIMENSION 1 — TOKEN CONCENTRATION
Question: What percentage of tokens (and voting power) is held by the top 10 wallets?
Threshold: above 40% concentration in top 10 wallets = high concentration risk.
Why it matters: if a small number of addresses can coordinate, they can pass any vote. Governance becomes a tool of the largest holders, not the community.
Data source: on-chain explorers (Voyager, Starkscan), token distribution dashboards.

DIMENSION 2 — UPGRADE POWER
Question: Can the team upgrade contracts without a community vote? Is there a timelock?
Red flags: no timelock = critical. Single signer = critical. Timelock + multisig with independent members = acceptable current risk.
Why it matters: upgrade power is the most direct path to theft or protocol change without community consent. A team that can upgrade without a vote in under 24 hours can effectively rewrite the rules instantly.
Data source: audit reports (should list upgrade mechanisms), protocol documentation.

DIMENSION 3 — VOTER PARTICIPATION
Question: What percentage of eligible tokens typically votes in governance proposals?
Threshold: under 5% participation = governance is captured by whales — any motivated large holder can determine outcomes.
Why it matters: low participation creates a governance vacuum. The protocol appears to have community governance, but in practice a handful of large addresses control every vote by default.
Data source: Snapshot vote history (snapshot.org), governance dashboards.

DIMENSION 4 — EMERGENCY CONTROLS
Question: Does any single party have unilateral pause capability? Who? Under what conditions?
Acceptable: multisig-controlled emergency pause with transparent trigger conditions and limited duration.
Unacceptable: single-party, no trigger definition, indefinite duration.
Why it matters: emergency pause capability that is not precisely constrained can be used for reasons other than emergencies. This is both a security risk and a censorship risk.
Data source: audit reports, protocol documentation, on-chain analysis of pause functions.

DIMENSION 5 — TREASURY CONTROL
Question: Who signs treasury transactions? Is it a multisig? How many signers? What is the threshold? Are signers independent?
Acceptable: 3-of-5 or higher multisig, signers from diverse organisations, with a timelock on large disbursements.
Unacceptable: single signer, 2-of-2 where both are co-founders, no timelock.
Why it matters: the treasury is the protocol's financial asset. A single compromised or malicious signer can drain it. Co-founder-only multisigs are not meaningfully independent — a coordinated decision by the co-founding team is effectively a unilateral decision.
Data source: multisig addresses (visible on block explorers), team documentation.

RATING SCALE

For each dimension, rate 1–5:
1 = minimal governance risk (strong decentralisation)
2 = low risk (acceptable controls)
3 = moderate risk (some concerns, watch)
4 = high risk (significant concern)
5 = critical risk (should not deposit meaningful capital without investigation)

Overall score = average of five dimensions. Above 3.5 average = material governance risk.

TWO WORKED EXAMPLES

Example A — well-designed governance (fictional but realistic):
Dimension 1: Top 10 wallets hold 22% — score 1
Dimension 2: 7-day timelock, 3-of-5 multisig with 2 external auditors — score 2
Dimension 3: Average voter turnout 14% of eligible tokens — score 2
Dimension 4: Emergency pause requires 4-of-6 multisig approval, max 72 hours, auto-expiring — score 2
Dimension 5: 4-of-6 treasury multisig, 3 external signers, 48-hour timelock on disbursements >$100K — score 2
Overall: 1.8/5 — low governance risk

Example B — poorly designed governance (fictional but realistic):
Dimension 1: Top 3 wallets hold 71% — score 5
Dimension 2: No timelock, 2-of-3 multisig all co-founders — score 5
Dimension 3: Average voter turnout 1.2% — score 5
Dimension 4: Founding team has unilateral pause, no defined trigger, no expiry — score 5
Dimension 5: 2-of-3 multisig, all co-founders, no timelock — score 5
Overall: 5.0/5 — critical governance risk. Do not deposit.
  `.trim(),

  keyTakeaway: `Five dimensions — token concentration, upgrade power, voter participation, emergency controls, and treasury control — produce a structured 1–5 rating for governance risk, with an average above 3.5 indicating material risk that warrants investigation before depositing funds.`,

  visualPrompt: `A five-row assessment table. Column headers: Dimension, Key Question, Red Flag Threshold, Data Source. Rows: 1 "Token Concentration" / "Top 10 wallet %" / ">40%" / "Voyager/Starkscan". 2 "Upgrade Power" / "Timelock? Multisig? Independent?" / "No timelock = critical" / "Audit reports". 3 "Voter Participation" / "% eligible tokens voting" / "<5% = whale capture" / "Snapshot history". 4 "Emergency Controls" / "Unilateral pause? Who? When?" / "Single party, no trigger = critical" / "Audit reports + docs". 5 "Treasury Control" / "Multisig? Independent signers?" / "Single signer = critical" / "Block explorer + docs". Below the table: a rating scale bar from 1 (green, minimal risk) to 5 (red, critical risk), with 3.5 marked as "Material risk threshold."`,
  visualType: 'static',
  visualUrl: 'five-dimension-governance-risk-framework',

  examples: [
    {
      contextTag: '[Mango Markets governance attack as anchor]',
      context: 'In October 2022, an attacker manipulated Mango Markets\'s governance to legitimise $117M in extracted funds. The attacker held enough MNGO governance tokens (acquired through the manipulation) to pass a proposal forgiving his loans.',
      scenario: 'Applying the five dimensions retrospectively: Dimension 1 (concentration): after manipulation, the attacker controlled sufficient tokens to swing any vote — critical. Dimension 2 (upgrade power): governance could authorise fund transfers — high risk. Dimension 3 (voter participation): low enough that a single large holder could determine outcomes — critical.',
      outcome: 'Three of five dimensions showed critical or high risk before the attack if analysed correctly. The Mango attack was a governance attack, not a code exploit — the governance mechanism worked exactly as designed. The framework would have flagged: "a single party holding >50% of votes with no multisig requirement on treasury disbursements = critical governance risk." This is the exact configuration Mango had.',
    },
    {
      contextTag: '[Applying the framework to a fictional new Starknet protocol]',
      context: 'A new Starknet DeFi protocol invites ecosystem analysts to review its governance structure before its public launch. You have access to their documentation and on-chain data.',
      scenario: 'D1: Top 10 wallets hold 31% — score 2. D2: 5-day timelock, 3-of-5 multisig with 2 independent security researchers — score 2. D3: Not launched yet — score N/A (flag as monitoring item post-launch). D4: Emergency pause requires 3-of-5 multisig approval, 48-hour maximum, condition defined as "active exploit or imminent exploit identified by audit" — score 2. D5: 4-of-6 treasury multisig, 3 signers from different organisations, 24-hour timelock on disbursements above $50K — score 1.',
      outcome: 'Average score: 1.75/5 (excluding D3). Governance risk: low. Post-launch monitoring requirement: track voter participation rate for first 6 governance votes. If turnout stays above 8%, governance remains healthy. If it falls below 5%, re-assess. The pre-launch analysis is positive — but voter participation cannot be assessed until real votes happen.',
    },
    {
      contextTag: '[Concentration risk detected on-chain]',
      context: 'On-chain data for Protocol X shows: top 10 wallets hold 61% of circulating supply. The most recent 4 governance votes all passed with 78–82% approval. Voter turnout averaged 3.2% of eligible tokens.',
      scenario: 'An analyst applies the framework. D1: 61% in top 10 — score 5, critical. D3: 3.2% participation — score 5, whale capture. The math: if 3% of eligible tokens typically votes, and a whale holds enough to represent 2% of total supply, they may control 60%+ of active votes in any given governance round. With low turnout, a small number of coordinated large holders determines every outcome.',
      outcome: 'The 78–82% approval rates on all 4 votes look like strong community support. But 3.2% turnout means the "community" is effectively 3.2% of holders deciding for everyone else. And with 61% concentration in top 10 wallets, those 3.2% of participating voters likely include the same large holders dominating every vote. The analyst rates D1 and D3 both as 5 (critical) and flags the protocol as high governance risk regardless of other dimensions.',
    },
  ],

  guidedPractice: [
    {
      question: 'Protocol X\'s top 10 wallets hold 48% of tokens. Three of those wallets are known to belong to the founding team. According to Dimension 1, what is the risk rating and why?',
      options: [
        'A. Score 1 — 48% is below 50% so it is acceptable',
        'B. Score 4–5 — above 40% concentration is high risk. Additionally, founding team concentration within the top 10 means coordinated decision-making by a small group can control governance outcomes.',
        'C. Score 2 — known team wallets are trustworthy and do not count toward concentration risk',
        'D. Cannot rate without knowing total supply',
      ],
      correct: 1,
      hint: 'The threshold is 40%. Where does 48% sit relative to that threshold?',
      explanation: 'B is correct. 48% exceeds the 40% threshold — dimension 1 rates high risk (4–5). The additional context that 3 of the top 10 are founding team wallets compounds the concern: a coordinated decision by the founding team could control governance outcomes even without voting all their tokens. Option A invents a 50% threshold that does not exist in the framework. Option C incorrectly treats team identity as a governance risk discount.',
    },
    {
      question: 'A protocol\'s upgrade key is controlled by a 2-of-3 multisig with no timelock. All three signers are co-founders. How does this rate on Dimension 2?',
      options: [
        'A. Score 1 — multisig means multiple people must agree, which is good',
        'B. Score 5 — critical. No timelock means upgrades can happen without any community reaction window. Co-founder-only signers means the multisig is not independently controlled — any 2 of 3 co-founders can upgrade contracts immediately with no external check.',
        'C. Score 3 — moderate. A timelock would fix this.',
        'D. Score 2 — 2-of-3 multisig is an industry standard',
      ],
      correct: 1,
      hint: 'Two criteria matter here: is there a timelock (community reaction window), and are the signers independent (not all from the same organisation)?',
      explanation: 'B is correct. The combination of no timelock and co-founder-only signers is a critical score (5). No timelock means any upgrade can be deployed instantly — zero community reaction time. Co-founder-only signers means this is effectively a centralised upgrade key disguised as a multisig — all three decision-makers are from the same organisation with aligned interests. A genuine multisig improvement would require: timelock (minimum 48–72 hours) and independent signers from different organisations.',
    },
    {
      question: 'A protocol\'s last 8 governance votes averaged 2.8% voter turnout. What does this mean for Dimension 3, and what is the practical implication for a holder with 0.001% of total supply?',
      options: [
        'A. Score 1 — 2.8% is above 0% so there is some participation',
        'B. Score 5 — below the 5% threshold. Practically: with 2.8% participation, a wallet holding 1.5% of total supply represents more than half of all active votes in any given vote. A small number of coordinated large holders determine every outcome. A holder with 0.001% has essentially no voting influence.',
        'C. Score 3 — 2.8% is low but typical for DeFi governance',
        'D. Score 4 — concerning but not critical until it drops below 1%',
      ],
      correct: 1,
      hint: 'The threshold is 5%. How does 2.8% relate to this threshold, and what happens mathematically when a single whale holds even 1% of total supply in a 2.8% turnout environment?',
      explanation: 'B is correct. 2.8% turnout triggers score 5 (critical) — below the 5% threshold. The practical math: if 2.8% of total supply participates and a whale holds 1.5% of total supply, that whale represents 1.5/2.8 = 54% of the active vote. They effectively control governance. For the 0.001% holder, their vote is 0.001/2.8 = 0.0036% of active votes — negligible influence. Governance appears democratic but is whale-controlled in practice.',
    },
    {
      question: 'A protocol\'s emergency pause function can be triggered by a single co-founder with no defined conditions and no expiry. How does this rate on Dimension 4?',
      options: [
        'A. Score 1 — rapid response capability is a safety feature',
        'B. Score 5 — critical. Single-party control, no trigger definition (subjective activation), no expiry creates a mechanism that can be used for non-emergency reasons with no constraints or accountability.',
        'C. Score 3 — pause capability is standard and this is within normal parameters',
        'D. Score 2 — a single founder is trusted by the community',
      ],
      correct: 1,
      hint: 'Three criteria: who controls it (single party vs multisig), under what conditions (defined vs undefined), and for how long (expiry vs indefinite)?',
      explanation: 'B is correct. Score 5 on all three criteria: single-party control (not multisig), no defined trigger conditions (subjective — the founder decides what qualifies as an emergency), no expiry (could pause indefinitely). An acceptable emergency pause: requires multisig approval, has specifically defined technical trigger conditions (e.g. "oracle deviation >15% or active exploit confirmed by audit"), and expires automatically after 48–72 hours.',
    },
    {
      question: 'After applying all five dimensions to Protocol Y, you rate: D1 = 2, D2 = 3, D3 = 4, D4 = 2, D5 = 3. What is the average score and what is your overall risk assessment?',
      options: [
        'A. Average 2.8 — below the 3.5 threshold, so governance risk is acceptable',
        'B. Average 2.8 — below the 3.5 material risk threshold, but Dimension 3 (voter participation) rated 4 should be flagged as a specific monitoring item even though the overall score is acceptable',
        'C. Average 3.5 — exactly at the threshold, automatically a high risk rating',
        'D. Average 3.5 — cannot assess without knowing which dimension D3 corresponds to',
      ],
      correct: 1,
      hint: '(2 + 3 + 4 + 2 + 3) ÷ 5 = ? Compare to the 3.5 threshold. Then check whether any single dimension warrants special attention.',
      explanation: 'B is correct. (2 + 3 + 4 + 2 + 3) ÷ 5 = 14 ÷ 5 = 2.8. Below the 3.5 material risk threshold — overall governance risk is acceptable. However, Dimension 3 (voter participation = 4, high risk) is a specific concern that the average masks. A rigorous analysis notes: "Overall governance risk is moderate (2.8). Specific concern: voter participation is weak (score 4). Monitor post-launch voting turnout — if it falls below 5%, the overall risk should be re-rated upward."',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-riskAssess',
      scenario: 'Apply all five governance risk dimensions to the following protocol. Ekubo (Starknet\'s concentrated AMM) based on publicly available information: D1 — No native governance token as of current data. Liquidity is managed by a core team with protocol-level parameters set at deployment. D2 — Core contract upgrades require StarkWare foundation involvement with timelock mechanisms. D3 — No on-chain voting mechanism exists currently for Ekubo-specific decisions. D4 — Emergency capability exists through contract ownership. D5 — Protocol fees and treasury are controlled by Ekubo\'s core development team. Rate each dimension 1–5 and calculate the overall score. State whether you would deposit $50,000 into Ekubo based on this assessment alone.',
      scoringCriteria: [
        'Correctly identifies that Ekubo\'s governance is currently centralised (no community governance token) — D1: cannot rate concentration (no token), flag as centralised governance model. D2: timelock exists but centralised — score 3-4. D3: no community voting — not rated, flagged as monitoring. D4: centralised emergency control — score 3-4. D5: team-controlled treasury — score 3-4.',
        'Correctly notes that absence of community governance does not automatically mean high risk — it means the protocol is currently operated by its development team. The relevant question is whether the team is trustworthy and the contracts are audited.',
        'States a reasoned conclusion: deposit decision based on governance score alone would be cautious (moderate-high score) but governance is only one of several factors — code audit quality and track record are equally important for this type of assessment.',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'On-chain governance data for Protocol Z: total eligible voting supply: 420M tokens. Last 5 governance votes: vote 1 had 12.6M tokens participating (3.0%), vote 2 had 14.2M (3.4%), vote 3 had 11.8M (2.8%), vote 4 had 15.1M (3.6%), vote 5 had 13.4M (3.2%). Top wallet analysis: single largest wallet holds 9.8M tokens. In vote 5, this wallet voted yes with 9.8M out of 13.4M participating tokens. State: (1) the dimension 3 risk rating, (2) what the largest wallet\'s vote 5 participation represents as a percentage of active votes, (3) whether governance is functionally centralised.',
      scoringCriteria: [
        'Average participation: (3.0 + 3.4 + 2.8 + 3.6 + 3.2) / 5 = 3.0% — below the 5% threshold. D3 rating: 5 (critical)',
        'Largest wallet vote 5 participation: 9.8M out of 13.4M = 73.1% of all active votes — this single wallet cast nearly three-quarters of all participating votes',
        'Correctly concludes governance is functionally centralised: one wallet controls the outcome of any vote where it participates, regardless of what other token holders prefer. The governance structure appears decentralised on paper (open voting) but is in practice a single-wallet dictatorship at current participation levels.',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'A protocol asks you to write a balanced governance risk section for their token listing on a DeFi data aggregator. Their governance data: top 10 wallets hold 44% of tokens, 6-day timelock on upgrades with 3-of-5 multisig (2 external members), average voter turnout 6.2%, emergency pause requires 3-of-5 multisig with 72-hour maximum, treasury is 4-of-7 multisig with 3 external members. Write a balanced paragraph that is honest about concentration risk without being dismissive.',
      scoringCriteria: [
        'Honestly states the concentration concern: top 10 wallet concentration at 44% exceeds the 40% warning threshold — this means a small number of large holders have significant influence over governance outcomes',
        'Accurately credits the positive elements: 6-day timelock, independent multisig members, 6.2% voter turnout (above the 5% warning threshold), constrained emergency controls, and diversified treasury multisig',
        'Presents a balanced assessment: the concentration concern is real and should be monitored, but the structural controls (timelock, independent multisig, emergency constraints) meaningfully reduce the risk that concentration creates — a large holder can influence but not unilaterally control the protocol given the structural protections in place',
      ],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 3 — AGGREGATE SIMULATIONS, BUILD TASK, BOSS
// ─────────────────────────────────────────────────────────────

export const LAB3_AGGREGATE_SIMS = {
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
  description: 'Random draw from all 5 Lab 3 lessons. Tests STRK supply modelling, SNIP governance process, veToken/fee switch analysis, four-step tokenomics framework, and five-dimension governance risk assessment. No lesson labels. No hints.',
};

export const LAB3_BUILD_TASK = {
  id: 'ecosystem-lab-3-build',
  title: 'Governance Risk Assessment — Two Starknet Protocols',
  labProgressionNumber: 3,
  selectionMode: 'platform-specified',
  type: 'research-document',
  hints: true,
  portfolioPush: false,
  estimatedTime: '60–75 minutes',
  simulator: 'starkzap-ecosystem-read',

  description: `
Apply the five-dimension governance risk framework to two Starknet protocols of your choice.

For each protocol, assess all five dimensions using publicly available data:

1. Token concentration — % held by top 10 wallets (Voyager or Starkscan)
2. Upgrade power — timelock duration and multisig structure (audit report or documentation)
3. Voter participation — average % of eligible tokens voting in last 3+ governance votes (Snapshot)
4. Emergency controls — who can pause, under what conditions, for how long (documentation)
5. Treasury control — multisig threshold, signer count, independent signers (on-chain data)

For each dimension: state the specific data found, rate it 1–5, and give a one-sentence justification.

Calculate the average score for each protocol. State overall risk rating.

Output: governance-risk-assessment.md in /junior/lab-03-tokenomics/
  `.trim(),

  outputType: 'written-document',
  outputFormat: 'markdown',
  verificationMethod: 'rubric',

  scoringCriteria: [
    'Both protocols assessed across all five dimensions with specific data cited for each',
    'Each rating (1–5) has a one-sentence justification tied to the specific data found',
    'Data sources named for each dimension (Voyager, Starkscan, Snapshot, documentation)',
    'Average scores calculated correctly for both protocols',
    'Overall risk assessment states clearly whether the protocol is low/moderate/high risk and why',
  ],
};

export const LAB3_BOSS = {
  phase1: {
    id: 'ecosystem-lab-3-boss-phase1',
    title: 'Lab 3 Boss — Phase 1: Tokenomics Gauntlet',
    description: 'Unlimited attempts. Hints available. 8 tasks from pool of 20. Pass 80% for Phase 2 unlock.',
    hints: true,
    portfolioPush: false,
    taskPool: { totalTasks: 20, drawPerAttempt: 8, passMark: 0.80 },
  },

  phase2: {
    id: 'ecosystem-lab-3-boss-phase2',
    title: 'Lab 3 Boss — Phase 2: Tokenomics Certification',
    description: 'No hints. Portfolio push on 100% pass. Fresh scenario per attempt.',
    hints: false,
    portfolioPush: true,

    scenario: `
You are producing a tokenomics and governance risk assessment for a new Starknet DeFi protocol being considered for a Foundation Growth Grant.

TASK 1 — Tokenomics Four-Step Framework
Apply all four steps to the following token data:
Total supply: 300M. Team: 20% (6-month cliff, 36-month vest). Investors: 18% (3-month cliff, 24-month vest). Foundation: 30% (no hard schedule). Community: 32% (60-month uniform). Current price: $0.80. Circulating supply: 22M. Daily trading volume: 3.5M tokens. No fee switch active. Governance-only token.

Calculate: insider %, FDV, dilution multiplier, month 7 total unlock, month 7 absorption ratio.
State: overall tokenomics risk rating with specific justification.

TASK 2 — Governance Five-Dimension Assessment  
Assess this protocol: Top 10 wallets hold 39% of tokens. Upgrade key: 3-of-5 multisig, 4-day timelock, 2 independent external security researchers among signers. Voter participation: 7.8% average over 4 votes. Emergency pause: 3-of-5 multisig required, 48-hour maximum, trigger defined as "confirmed active exploit." Treasury: 4-of-6 multisig, 3 external signers, 72-hour timelock on disbursements above $100K.

Rate each dimension 1–5. Calculate average. State overall governance risk rating.

TASK 3 — Grant Recommendation
Based on your Tasks 1 and 2 assessments, write a two-paragraph Foundation grant evaluation summary. Include: (1) specific tokenomics risks the Foundation should require the team to address before granting, (2) specific governance strengths that make the protocol suitable for a growth grant. Be balanced and specific — cite numbers from your analysis.
    `.trim(),

    scoringCriteria: [
      'Task 1: Insider % = 20+18 = 38% (below 40%, no red flag 1). FDV = 300M × $0.80 = $240M. Market cap = 22M × $0.80 = $17.6M. Dilution multiplier = 13.6×. Month 7: team vesting starts (6-month cliff + 1 month = month 7): 60M ÷ 36 = 1.67M/month. Investor vesting month 7 (cliff ends month 3, so month 7 = month 4 of vest): 54M ÷ 24 = 2.25M/month. Community: 96M ÷ 60 = 1.6M/month. Total month 7: 5.52M. Absorption: 5.52M ÷ 3.5M = 1.58 days — low pressure. Value accrual: governance-only. 13.6× dilution multiplier is the primary risk.',
      'Task 2: D1 = 2 (39%, just below 40% threshold, low-moderate). D2 = 1 (4-day timelock, 2 independent external signers, strong). D3 = 1 (7.8%, above 5% threshold, healthy). D4 = 1 (multisig, defined trigger, time-limited). D5 = 1 (4-of-6, independent, timelock). Average = 1.2 — very low governance risk.',
      'Task 3: Specific tokenomics risk cited correctly (13.6× dilution multiplier + governance-only token). Specific governance strength cited correctly (D2–D5 all score 1, strong structural controls). Recommendation is balanced — clear about the dilution concern while crediting the governance structure.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/junior/lab-03-tokenomics/',
      files: [{ filename: 'tokenomics-governance-assessment.md', type: 'narrative' }],
      commitMessage: 'Passed Lab 3 Tokenomics and Governance — Junior Ecosystem Deep Dive',
      badgeEarned: 'Tokenomics Certified — Junior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
  },
};

export const LAB3_META = {
  id: 'ecosystem-junior-lab-3',
  title: 'Tokenomics and Governance',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'junior' as const,
  labNumber: 3,
  estimatedHours: 5,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 5,
  prerequisite: 'Labs 1–2 complete',
  description: 'STRK supply analysis, SNIP governance process, veToken/fee switch patterns, four-step tokenomics framework, and five-dimension governance risk assessment. The complete toolkit for evaluating any DeFi token.',
  nextLab: 'Lab 4 — Developer Ecosystem and Tooling',
};
