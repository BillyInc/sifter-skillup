// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// SENIOR · LAB 9 — STRATEGIC ECOSYSTEM ANALYSIS
// Part 2 of 2: L9.3–L9.5 + Aggregate Sims + Build Task + Boss Battle + Final Boss + Lab Meta
//
// Prerequisite: ecosystem_lab9_part1.ts (SQL Primer + L9.1 + L9.2)

// ─────────────────────────────────────────────────────────────
// L9.3 — Protocol Lifecycle Analysis
// TYPE A — Growth, maturity, decline signals; DAU trajectory is
// the leading indicator, TVL the lagging one.
// ─────────────────────────────────────────────────────────────

export const LAB9_LESSON_3 = {
  id: 'l9-3-protocol-lifecycle-analysis',
  title: 'Protocol Lifecycle Analysis',
  trackType: 'A',
  lessonNumber: 3,

  explanation: `
In September 2021, SushiSwap was processing $500M in daily volume and had a $1.2B token market cap. Two years later, daily volume was $22M — a 96% decline. The decline did not happen overnight. It was visible in on-chain data months before the token price reflected it: daily active users peaked in October 2021 and had been declining for 11 consecutive months by the time the volume collapse became widely reported. Analysts who measured DAU monthly would have seen the signal in early 2022. Analysts who watched TVL alone saw nothing until late 2023.

Protocols follow lifecycle patterns analogous to businesses: growth, maturity, and decline. Each phase has observable signals in on-chain data. Identifying the current phase determines where to concentrate research attention — and whether a protocol deserves a bullish thesis, a maintenance rating, or a decline warning.

GROWTH SIGNALS (protocol is expanding its user base and economic activity)

Signal 1 — Increasing daily active users over 3+ consecutive months.
This is the most reliable leading indicator. New users trying a protocol for the first time suggests product-market fit strengthening. DAU growth before TVL growth is the pattern that precedes TVL expansion.

Signal 2 — New protocol integrations being added.
When Protocol B adds Protocol A as a liquidity source or price oracle, it is a deliberate decision that integrating Protocol A improves Protocol B\'s product. Each new integration represents external validation. Count integrations from documentation and on-chain contract interaction analysis.

Signal 3 — Developer activity: growing contributor count, recent code commits, active issue resolution.
GitHub data (public for open-source protocols) shows whether the team is actively building. Protocols in growth phase add features, fix bugs within days, and have rising contributor counts.

Signal 4 — Revenue increasing faster than incentives.
Protocols in growth typically use token incentive programs to subsidise early liquidity. A protocol transitioning from subsidy to organic revenue shows: fee revenue growing as a percentage of total yield paid. Dune revenue queries (fee_amount × protocol_fee_share, aggregated weekly) reveal this transition.

MATURITY SIGNALS (protocol has reached equilibrium — growth has plateaued)

Signal 1 — Stable DAU with slight month-over-month decline.
Flat or slowly declining DAU after a growth phase means the protocol has captured most of its accessible market and is not growing into new user segments.

Signal 2 — TVL plateau.
TVL stabilises when the incentive programs driving deposits are priced into yield expectations. New depositors match withdrawals — no net growth.

Signal 3 — Revenue focus replacing growth focus.
Mature protocols introduce fee parameters, reduce token emissions, and optimise for sustainability. Governance proposals shift from "add feature X" to "adjust fee tier to increase protocol revenue."

Signal 4 — Key team departures or slower GitHub commits.
A mature protocol\'s founding team often moves to new projects. Commit frequency drops from daily to weekly. This is normal for mature infrastructure, but declining maintainer activity in a rapidly evolving technical environment is a risk flag.

DECLINE SIGNALS (protocol is losing users and relevance)

Signal 1 — DAU declining over 3+ consecutive months with no event-based explanation.
The critical qualifier is "no event-based explanation." A DAU drop during a bear market is expected. A DAU drop while competitor protocols on the same chain are growing is the signal that distinguishes structural decline from market-cycle normalisation.

Signal 2 — TVL drawdown that exceeds the market-wide drawdown.
If ETH price falls 20% and a protocol\'s TVL falls 35%, the excess 15% decline is protocol-specific capital flight. Users are leaving, not just prices falling.

Signal 3 — Protocol integrations being removed by partner protocols.
When a dependent protocol removes your protocol from its routing options — or replaces your oracle with a different one — that is the most reliable decline signal. It requires active engineering effort to remove an integration, signalling strong motivation.

Signal 4 — Competitive alternatives gaining relative market share on the same chain.
Measure share, not absolute figures. If a new DEX launches with superior fees and its user count grows from 0 to 30% of Ekubo\'s while Ekubo\'s user count stays flat, Ekubo\'s competitive position is declining even if its absolute DAU holds.

SQL EVIDENCE FOR LIFECYCLE CLASSIFICATION

Monthly DAU trend (the core lifecycle query):

  SELECT
    DATE_TRUNC('month', block_time) AS month,
    COUNT(DISTINCT taker_address) AS monthly_unique_users,
    LAG(COUNT(DISTINCT taker_address)) OVER (ORDER BY DATE_TRUNC('month', block_time)) AS prev_month_users,
    (COUNT(DISTINCT taker_address) - LAG(COUNT(DISTINCT taker_address)) OVER (ORDER BY DATE_TRUNC('month', block_time)))
      / NULLIF(LAG(COUNT(DISTINCT taker_address)) OVER (ORDER BY DATE_TRUNC('month', block_time)), 0)::FLOAT * 100
    AS mom_growth_pct
  FROM decoded_starknet.avnu_Exchange_evt_Swap
  WHERE block_time >= NOW() - INTERVAL '6 months'
  GROUP BY month
  ORDER BY month ASC;

LAG(...) OVER (ORDER BY ...) is a window function that retrieves the value from the previous row. Here it gets last month\'s user count. The final calculation computes month-over-month growth percentage. Six consecutive months of this data generates a lifecycle phase classification with quantitative backing.

CLASSIFICATION FRAMEWORK

Three signals in the same direction = confident lifecycle classification.
Two signals in the same direction, one contradictory = provisional classification, note contradictions.
Conflicting signals = inconclusive — state what additional data would resolve the ambiguity.

Example classification:
Protocol X: DAU +15% MoM (growth signal), TVL +8% MoM (growth signal), 2 new integrations this quarter (growth signal), GitHub commits daily (growth signal). Classification: Growth — confident. Bullish thesis supported.

Protocol Y: DAU -3% MoM for 4 consecutive months (decline signal), competitor Z gained 25% market share (decline signal), one major integration removed (decline signal), TVL flat (neutral). Classification: Decline — confident. Research downgrade warranted.
  `.trim(),

  keyTakeaway: `DAU trajectory (leading indicator) and TVL trajectory (lagging indicator) combined with integration activity and developer signals produce three-signal lifecycle classifications — Growth, Maturity, or Decline — and the SQL window function LAG() OVER (ORDER BY month) enables quantitative month-over-month growth calculation that converts opinion-based lifecycle guessing into evidence-based classification.`,

  examples: [
    {
      contextTag: '[SushiSwap DAU as 11-month early warning]',
      context: 'An analyst reviewing SushiSwap in February 2022 compares on-chain DAU data vs TVL.',
      scenario: 'DAU query: SushiSwap monthly unique users peaked October 2021 (11,200 DAU). By February 2022: 6,800 DAU — a 39% decline in 4 months. TVL query: SushiSwap TVL in February 2022 was $3.8B — down only 8% from October peak. The TVL looked relatively stable while the user base had already declined 39%.',
      outcome: '"DAU-to-TVL divergence is the early warning signal: users are leaving before capital leaves. Capital stays longer because of liquidity mining lock-ups, withdrawal friction, and yield-seeking behavior. By the time TVL falls 39%, the user base has already been declining for many months. Research that only watches TVL misses the leading signal entirely."',
    },
    {
      contextTag: '[Ekubo lifecycle classification with three signals]',
      context: 'An analyst runs the monthly DAU query for Ekubo and pulls supporting data from Labs 7 and 8.',
      scenario: 'Query results: Month 1: 5,100 DAU. Month 2: 5,800 (+14%). Month 3: 6,200 (+7%). Month 4: 6,600 (+6%). Month 5: 6,900 (+5%). Month 6: 7,050 (+2%). Additionally: 2 new protocol integrations in the past quarter. GitHub shows daily commits. No integrations removed. TVL: +22% over 6 months.',
      outcome: 'Classification: Growth — confident. DAU growth slowing (from 14% to 2% MoM) suggests approaching maturity, but all four signals remain positive. Provisional note: "DAU growth deceleration visible — reclassify to Maturity within 2–3 months if MoM growth falls below 1%."',
    },
    {
      contextTag: '[Competitor share gain as decline signal]',
      context: 'A new Starknet DEX ("Quantum") launches with lower fee tiers and gains 8,000 DAU within 90 days of launch.',
      scenario: 'At Quantum launch, Ekubo had 7,000 DAU. 90 days later: Ekubo 7,100 DAU (+1.4%), Quantum 8,000 DAU. Quantum now has more DAU than Ekubo, despite launching 3 years later. Ekubo\'s TVL: unchanged. Ekubo\'s market share: from 100% to 47% of Starknet DEX users.',
      outcome: '"Ekubo\'s absolute DAU is flat — but its competitive position has declined materially. Market share fell from 100% to 47% in 90 days. Reclassification: Maturity trending toward Decline. Watch for: integration removal (partner protocols switching routing to Quantum), TVL migration, developer talent signal (is Ekubo team matching Quantum\'s feature pace?)"',
    },
  ],

  guidedPractice: [
    {
      question: 'Protocol A: DAU +12% this month, TVL -5%, 1 new integration added. Protocol B: DAU -4% for 3 consecutive months, TVL +2%, no new integrations. Classify both with the three-signal framework.',
      options: ['A. Both in Growth — TVL is the most important signal', 'B. Protocol A: inconclusive (mixed signals — DAU growing, TVL falling, integration added). Protocol B: Decline — provisional (3 signals: 3-month DAU decline, no new integrations, flat TVL in a growing market is relative decline). Protocol A\'s mixed signals require additional data: is TVL falling because of price decline (not user flight) or because users are withdrawing liquidity?', 'C. Protocol A: Growth. Protocol B: Maturity', 'D. Both in Decline — TVL changes are definitive'],
      correct: 1,
      explanation: 'B is correct. Protocol A has mixed signals: DAU growing (growth signal), TVL declining (decline signal), integration added (growth signal). Without knowing whether TVL decline is price-driven or user-driven, the classification is inconclusive — state the ambiguity and identify what additional data resolves it (compare TVL decline to underlying asset price decline). Protocol B has three signals pointing to Decline: 3 consecutive months of DAU decline is the most reliable signal, zero integration activity confirms no new growth vectors, and TVL rising slightly in a growing market means Protocol B is losing market share.',
    },
    {
      question: 'Why is DAU described as a "leading" indicator while TVL is "lagging"?',
      options: ['A. DAU is more accurate than TVL', 'B. Users stop actively trading a protocol before they withdraw their deposited capital. Capital stays longer due to yield lock-ups, withdrawal gas costs, and inertia. The sequence is: users stop engaging → DAU falls → some time later, users withdraw capital → TVL falls. DAU decline predicts TVL decline by weeks to months.', 'C. TVL data is available with a delay', 'D. DAU is easier to calculate'],
      correct: 1,
      explanation: 'B is correct. The mechanism is behavioral: a user who has stopped actively using a protocol still leaves capital deposited if the yield is acceptable or withdrawal friction is high. Trading activity (measured by DAU) stops before capital withdrawal (measured by TVL). This sequence is consistent enough across DeFi history (SushiSwap, Compound on some chains, many smaller protocols) that DAU is reliably earlier than TVL as a signal of protocol health changes.',
    },
    {
      question: 'The LAG() window function in the lifecycle query retrieves "the value from the previous row." What must the ORDER BY in the OVER clause specify for this to produce the previous month\'s user count?',
      options: ['A. ORDER BY monthly_unique_users — sort by the count itself', 'B. ORDER BY month (the DATE_TRUNC(\'month\', block_time) alias) — orders rows chronologically so that the "previous row" is literally the previous calendar month. Without ORDER BY month, LAG() would return the "previous row" in whatever undefined order the database happens to return results, producing meaningless comparisons.', 'C. ORDER BY taker_address', 'D. ORDER BY is not needed for LAG()'],
      correct: 1,
      explanation: 'B is correct. LAG() retrieves the value N rows earlier in the result set. The ORDER BY in the OVER clause determines what "N rows earlier" means — it defines the sequence. ORDER BY month makes "previous row" = "previous calendar month." Without it, the sequence is undefined and LAG() returns a random previous row\'s value. For any time-series window function (LAG, LEAD, running totals), the OVER (ORDER BY time_column) is mandatory and must sort by the time field.',
    },
    {
      question: 'A protocol shows: 3 months of DAU decline, TVL flat, 2 integrations removed, active GitHub commits. The active GitHub commits contradict the decline signals. How should this be classified?',
      options: ['A. Growth — GitHub commits override other signals', 'B. Provisional Decline — three signals point to decline (DAU trend, integration removal × 2). Active GitHub commits are noted as a contradicting signal that suggests the team is still building, possibly preparing a product pivot or upgrade. Classification: "Declining by current metrics — watch for a product-driven reversal in the next 60 days. If no DAU inflection occurs despite active development, reclassify to Decline — confirmed."', 'C. Maturity — contradictory signals always mean maturity', 'D. Inconclusive — no classification possible with contradictory signals'],
      correct: 1,
      explanation: 'B is correct. Three signals in decline direction outweigh one contradicting signal for classification purposes — but the contradiction is noted as a potential inflection catalyst. A team actively committing code while user metrics decline is a pattern that can resolve as either: (a) successful product pivot (new feature drives DAU recovery, reclassify to Growth) or (b) team effort not translating to user retention (confirmed decline). The correct action: provisional decline classification with a 60-day watchlist and a stated inflection condition (DAU growth resuming).',
    },
    {
      question: 'You run the 6-month DAU trend for a Starknet protocol and get: M1: 1,200 M2: 1,350 (+12.5%) M3: 1,480 (+9.6%) M4: 1,510 (+2.0%) M5: 1,490 (-1.3%) M6: 1,460 (-2.0%). Classify the lifecycle stage and state the specific transition point visible in this data.',
      options: ['A. Growth — DAU is still higher than Month 1', 'B. Transitioning from Growth to Maturity. The transition point is visible between M3 and M4: growth decelerated from 9.6% to 2.0% — an 80% reduction in growth rate in one month. M5 and M6 show first negative MoM figures — the Growth phase has ended and Maturity is confirmed. The classification is Maturity, not Decline, because the DAU decline is small (-2% MoM) and only 2 months deep.', 'C. Decline — any negative MoM is a decline signal', 'D. Growth — deceleration is not a lifecycle change'],
      correct: 1,
      explanation: 'B is correct. The data shows a clear Growth-to-Maturity transition. The transition is confirmed by: (1) growth rate deceleration from 12.5% to 2.0% over 3 months — classic S-curve maturation, (2) first negative MoM values in M5/M6, showing the growth phase has ended. Decline classification would require 3+ consecutive negative months with worsening trajectory — at -1.3% and -2.0%, the decline is too shallow and recent to be classified as Decline. Correct classification: Maturity, with a watch for whether -2% MoM deepens or stabilises.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-sql',
      scenario: 'Write and run the 6-month monthly DAU trend query for AVNU using the mock dataset. The query must include the LAG() window function to compute month-over-month growth percentage. After running: (1) export as Portfolio Artifact PA-L9-005, (2) classify AVNU\'s lifecycle stage based on the six months of data, (3) state which signal is most influential in your classification.',
      scoringCriteria: ['Query includes DATE_TRUNC(\'month\') grouping, COUNT(DISTINCT taker_address), LAG() OVER (ORDER BY month) for previous month users, and MoM growth % calculation with NULLIF denominator', 'Portfolio Artifact PA-L9-005 exported with chart visualisation', 'Lifecycle classification stated (Growth, Maturity, or Decline) based on the specific mock data MoM trend', 'Most influential signal identified: whether DAU MoM trend is consistently positive, flat, or negative'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'Three Starknet protocols\' 6-month DAU data: Protocol A: 1,100 → 1,250 → 1,380 → 1,490 → 1,540 → 1,530. Protocol B: 3,200 → 3,100 → 2,950 → 2,840 → 2,780 → 2,700. Protocol C: 420 → 820 → 1,600 → 2,900 → 4,200 → 5,800. Classify each protocol, identify the most interesting one for investment thesis purposes, and state what additional non-DAU signal you would need to confirm your thesis.',
      scoringCriteria: ['Protocol A: Late Growth / Early Maturity — growth decelerating from 12% to near 0%, M5→M6 first negative sign (-0.6%)', 'Protocol B: Decline — confident. 6 consecutive months of negative MoM decline (-3.1% to -2.8% range). Linear decline trajectory.', 'Protocol C: Strong Growth — 5 consecutive months of >50% MoM growth. Exceptional trajectory — either organic breakout or heavily incentivised growth that may reverse.', 'Most interesting for thesis: Protocol C — but with the highest uncertainty. Confirmation signal needed: fee revenue trend (is Protocol C generating revenue, or is growth entirely subsidy-driven?). Incentive-only growth reverts; revenue-backed growth compounds.'],
    },
    {
      type: 'judgment-riskAssess',
      scenario: 'A protocol is in Maturity stage: 18 months of flat-to-slightly-declining DAU, $45M TVL unchanged, 1 senior engineer departed last month, GitHub commits slowed from daily to twice-weekly. A competitor DEX launches with 50% lower fees and gains 3,000 DAU in its first 60 days. Model: what decline signals should you watch for in the next 30 days, and at what specific threshold would you reclassify from Maturity to Decline?',
      scoringCriteria: ['30-day decline signals to watch: DAU acceleration (from current slight negative MoM to -5%+ MoM), TVL outflow (first week of net TVL decline after 18 months of stability), protocol integration removal (any partner protocol switching routing to competitor), fee revenue erosion (competitor\'s lower fees drawing high-volume traders away)', 'Reclassification threshold: Decline classification triggered by any two of: (a) DAU decline accelerating to -5% MoM for 2 consecutive months, (b) Net TVL outflow >10% in 30 days beyond market price decline, (c) One major protocol integration removed, (d) Developer departure of second senior engineer', 'Notes that a single competitor gaining DAU does not immediately reclassify — the question is whether the existing protocol\'s absolute DAU declines in response, not whether a competitor grows'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L9.4 — Publishing Ecosystem Research
// TYPE A — Research credibility requires original data, sourced
// comparisons, actionable conclusion, and a falsifiability condition.
// ─────────────────────────────────────────────────────────────

export const LAB9_LESSON_4 = {
  id: 'l9-4-publishing-ecosystem-research',
  title: 'Publishing Ecosystem Research',
  trackType: 'A',
  lessonNumber: 4,

  explanation: `
In January 2024, a widely-shared DeFi research report claimed "Starknet has reached 50,000 daily active users." The claim spread through crypto Twitter, was cited in three ecosystem articles, and was referenced in a grant application. Six weeks later, a Dune analyst queried decoded_starknet event tables and found: 6,400 unique wallet addresses had interacted with Starknet protocols on the highest-activity day in the period cited. The 50,000 figure was derived from API endpoint hits — not wallet interactions. 7× the actual figure. The original report had no query link, no methodology note, and no falsifiability condition.

A research claim without verifiable evidence is commentary. Commentary is not worthless — but it is not research. When a false commentary claim propagates as research, it damages everyone who cited it: the grant application that used the figure was rejected after the correction, the three articles issued corrections, and the author's reputation suffered for 18 months.

This lesson defines the minimum standards for publishable ecosystem research at the Senior level.

THE MINIMUM RUBRIC FOR LAB 9 RESEARCH OUTPUT

Three original data points: three specific numerical claims derived from queries you ran yourself, with Portfolio Artifact IDs cited. Not from a dashboard. Not from a blog post. From your own SQL queries on Dune.

Two sourced comparisons: two comparisons to reference data from named, publicly accessible sources (DefiLlama, TokenTerminal, a Starknet Foundation published report, a public Dune dashboard with a stated author). The comparison must be quoted with the source URL and the date retrieved.

One actionable conclusion: one specific recommendation that a reader can act on. Not "the ecosystem is growing." Something a VC can use to adjust an investment thesis, a developer can use to decide where to build, or a user can use to decide where to deposit capital.

One falsifiability condition: one statement of what data would prove your main conclusion wrong. A research claim that cannot be falsified is an opinion, not a thesis. This is not a weakness — it shows intellectual honesty and analytical rigour.

MIRROR FORMAT (LONG-FORM ON-CHAIN BLOG)

Mirror is a blockchain-native publication platform. Posts are stored on Arweave (permanent) and associated with an Ethereum wallet (attributed). Starknet ecosystem research published on Mirror reaches the community's primary long-form reading platform.

Required structure:
  TITLE (max 60 characters — shorter is almost always better)
  TL;DR (3 bullet points, max 15 words each — the reader decides whether to continue from here)
  CONTEXT (150 words — why does this research matter now? What changed?)
  ANALYSIS (600–1,000 words — the data, the argument)
    • Lead with original data from your queries
    • Layer in sourced comparisons
    • Build toward the actionable conclusion
    • State the falsifiability condition in the final paragraph
  CONCLUSION (100 words — thesis in one paragraph, falsifiability in one sentence)
  APPENDIX (data sources: Dune query links or artifact IDs, methodology notes, any simplifications acknowledged)

STARKNET FORUM FORMAT (DISCOURSE — TECHNICAL COMMUNITY)

The Starknet community forum (community.starknet.io) hosts governance debates, research, and protocol analysis. Audience: protocol developers, power users, and governance participants — more technically literate than Mirror readers.

Required structure:
  TITLE (specific — include protocol name and the specific claim)
  SUMMARY (50 words — accessible to non-technical readers, no jargon without definition)
  TECHNICAL ANALYSIS (detailed, with Dune query links, methodology, assumptions)
  OPEN QUESTIONS (what you do not know — builds credibility rather than undermining it)
  CALL FOR FEEDBACK (3–5 specific questions you want community members to address)

SANDBOX-RESEARCH-WRITER ADVANCED MODE

The sandbox-research-writer in advanced mode provides:
  • Word count tracking per section with minimum/maximum targets
  • Required-sections checklist (the four minimum rubric items)
  • One-tap Mirror publish (via Mirror API — requires wallet connection)
  • Export to Starknet Forum markdown

Writing in the sandbox produces a draft with all required sections. The platform auto-checks: are three artifact IDs cited? Are two sourced comparisons present with URLs? Is there one statement containing "falsified if" or equivalent? Only when all checklist items are satisfied does the Publish button activate.

CREDIBILITY TACTICS THAT WORK

Name your sources explicitly: "According to DefiLlama's Starknet chain page (accessed 2024-11-15), Starknet TVL was $842M" — not "Starknet has $842M TVL."

State your methodology and its limitations: "This analysis measures unique wallets interacting with AVNU's Exchange contract directly — users routing through third-party interfaces or aggregators may not be captured."

Acknowledge what you don't know: "I could not find on-chain evidence of when the yield aggregator gap was identified — the absence of protocol deployment events on Voyager suggests no attempt has been made, but I cannot rule out unreported private development."

Address obvious objections in the body: if your analysis shows Starknet lagging on metric X, do not omit it hoping readers won't notice. Address it directly and explain why it is or is not a thesis-changing concern. Researchers who omit unfavorable data are caught and lose credibility permanently.
  `.trim(),

  keyTakeaway: `Publishable Senior-level ecosystem research requires three original data points (Dune query artifacts), two sourced comparisons (named public sources with URLs), one actionable conclusion (specific, addressable by the reader), and one falsifiability condition (what data would disprove the thesis) — and the sandbox-research-writer advanced mode checklist enforces all four before the publish button activates.`,

  examples: [
    {
      contextTag: '[The 50,000 DAU misinformation anatomy]',
      context: 'A researcher encounters the widely-shared "50,000 Starknet DAU" claim in a grant application she is reviewing for the Foundation.',
      scenario: 'She queries decoded_starknet event tables and finds peak daily unique wallets: 6,400. She traces the original claim: a blog post cited "API calls to Starknet RPC nodes" — which count every JSON-RPC request including automated bots checking prices, block explorers loading pages, and node health monitoring. None of these require a user wallet interaction. The API call number was real but measured the wrong thing.',
      outcome: '"The 50,000 figure is an API call count, not a user count. A correct on-chain DAU analysis finds 6,400 unique wallet addresses per peak day. The grant application using this figure should revise to the correct metric before resubmission. Methodology note required: state whether DAU is measured as unique wallet addresses, API calls, or app sessions — they produce radically different numbers."',
    },
    {
      contextTag: '[Falsifiability in practice]',
      context: 'An analyst publishes a thesis: "Starknet will capture 3% of Ethereum DEX volume by Q4 2025."',
      scenario: 'Her falsifiability condition: "This thesis is falsified if Starknet\'s 12-month rolling DEX volume falls below 1.2% of Ethereum\'s equivalent figure as of Q4 2025 — even accounting for Ethereum base ecosystem growth. Additional falsification: if EVM-compatible ZK-rollups (ZKSync, Linea) capture the majority of new developer deployments from Ethereum, the premise that Starknet\'s unique advantages (AA, Cairo) justify a premium market share over EVM-compatible L2s is disproven regardless of absolute TVL growth."',
      outcome: '"A falsifiable thesis is a stronger investment signal than an unfalsifiable one. Any investor reading this knows exactly what would make the thesis wrong — they can form a view on those conditions independently. An analyst who publishes a falsifiable thesis and is subsequently wrong has more credibility than one whose thesis is so vague it can never be tested."',
    },
    {
      contextTag: '[Forum vs Mirror format decision]',
      context: 'An analyst has finished a technical analysis of Vesu\'s interest rate model and wants to publish her findings.',
      scenario: 'She considers the audience: Mirror would reach broad crypto readers who may not understand interest rate model mechanics. The Starknet Forum would reach Vesu developers and governance participants who can engage with the mathematical details and potentially improve the protocol. Her decision: Forum for technical analysis (to improve the protocol) + a Mirror summary (to inform broader ecosystem understanding).',
      outcome: '"Technical research that could drive protocol improvement belongs in the Forum first — where the people who can act on it are listening. Mirror amplifies after the technical community has had the opportunity to respond and refine. Publishing the reverse order (Mirror first) risks spreading unreviewed technical claims to a wider audience before experts have vetted them."',
    },
  ],

  guidedPractice: [
    {
      question: 'A research draft states: "Starknet\'s TVL has grown significantly in recent months." Applying the minimum rubric, what is wrong with this claim?',
      options: ['A. Nothing — the claim is clear', 'B. Fails two rubric criteria: (1) "significantly" is not specific — no original data point cited, no artifact ID, no specific number. (2) "recent months" is not time-bounded — no date range. Corrected: "Starknet TVL grew from $612M to $842M between August and November 2024, a 37.6% increase (Source: DefiLlama Starknet chain page, accessed 2024-11-15; confirmed by sandbox-sql PA-L9-006)."', 'C. The claim is too short', 'D. "Recently" should be "in the short term"'],
      correct: 1,
      explanation: 'B is correct. The original claim fails: (1) No original data point — "significantly" is not measurable and has no artifact ID. (2) No sourced comparison — "grown" is not anchored to a reference number or external source. The corrected version provides: a specific percentage (37.6%), a specific time period (August–November 2024), a named external source with access date (DefiLlama, 2024-11-15), and a query artifact ID (PA-L9-006). All four elements are required for a publishable claim.',
    },
    {
      question: 'What is the purpose of the "open questions" section in the Starknet Forum format?',
      options: ['A. To admit that your research is incomplete and therefore invalid', 'B. To demonstrate that you know the limits of your analysis and to invite the community\'s expertise on unresolved questions. Stating open questions builds credibility — readers who know the answer can provide it, improving the research. Researchers who omit open questions appear unaware of gaps, which is less credible than acknowledging them.', 'C. To raise doubts about your own conclusion', 'D. Required by Starknet Forum moderation rules'],
      correct: 1,
      explanation: 'B is correct. Open questions signal intellectual honesty. In technical communities (protocol developers, sophisticated users), researchers who acknowledge what they don\'t know are more credible than those who present analysis as complete. Open questions also drive engagement — a community member who knows the answer to your open question will reply, generating discussion and improving the research. The section converts your publication from a monologue into a dialogue.',
    },
    {
      question: 'A Mirror post\'s TL;DR reads: "Starknet is a great ZK-rollup with a promising future. It is growing. Developers should build here." Applying the 15-word-per-bullet and specificity requirements, what is wrong?',
      options: ['A. Too short — needs more words', 'B. All three bullets fail the specificity requirement. "Great ZK-rollup" is an opinion, not a data-backed claim. "Growing" is not specific (growing in what metric, by how much?). "Developers should build here" is actionable but has no supporting evidence in the TL;DR. Corrected example: "• Starknet DEX capital efficiency (18% vol/TVL) matches Arbitrum despite 25× smaller TVL. / • Lending user growth 41% MoM vs 8% for DEXs — ecosystem maturing beyond spot trading. / • Yield aggregator and mobile DCA gaps remain open — fastest-to-build opportunities for 2024."', 'C. TL;DR cannot contain numbers', 'D. The third bullet uses imperative language'],
      correct: 1,
      explanation: 'B is correct. A TL;DR is the reader\'s decision filter — they use it to decide whether the full report is worth reading. Vague claims ("great," "growing," "promising") cannot be evaluated for relevance. Specific claims with numbers and named metrics let the reader immediately assess whether the research addresses their specific question. Each TL;DR bullet should function as a one-sentence finding, not a one-sentence assertion of quality.',
    },
    {
      question: 'Your research concludes: "Starknet\'s lending protocols will overtake DEXs as the dominant activity category by Q3 2025." Write the most useful falsifiability condition for this claim.',
      options: ['A. "If Starknet lending TVL falls."', 'B. "This thesis is falsified if DEX daily active users exceed lending protocol daily active users by more than 2× as of Q3 2025 (measured by UNION ALL query across decoded Ekubo/AVNU/AVNU swap events vs Vesu/Nostra deposit events) — or if a structural event (Ekubo fork, new DEX incentive program) materially changes DEX competitive dynamics before that date."', 'C. "If market conditions change."', 'D. "If anyone disagrees with the analysis."'],
      correct: 1,
      explanation: 'B is correct. An effective falsifiability condition: (1) states a specific measurable threshold (2× DAU ratio), (2) specifies the measurement methodology (UNION ALL query across named decoded tables), (3) specifies the measurement date (Q3 2025), and (4) acknowledges structural events that could change the baseline. Option A is too vague — "TVL falls" could happen for price reasons unrelated to the thesis. Option C is an evasion. Option D is not falsifiability — it is an invitation to debate without resolution criteria.',
    },
    {
      question: 'A research draft has three original data points (PA-L9-001, 002, 003), two sourced comparisons (DefiLlama + TokenTerminal), but no falsifiability condition. The author argues that "my conclusion is based on hard data so it doesn\'t need a falsification condition." Evaluate this argument.',
      options: ['A. Correct — hard data does not need falsification conditions', 'B. Incorrect. Hard data supports a claim but does not make the claim irrefutable. The thesis (interpretation of the data) must be falsifiable even if the underlying data is accurate. Example: the data might show Vesu growing 41% MoM (accurate). The thesis "Vesu will continue growing at this rate for 12 months" is a projection — it is falsified if growth falls below 10% MoM for 3 consecutive months. Without a falsification condition, the reader cannot distinguish a rigorous thesis from an assertion that happens to cite data.', 'C. Correct if the data is from on-chain sources', 'D. The minimum rubric can be waived for Senior-level research'],
      correct: 1,
      explanation: 'B is correct. Data supports conclusions — it does not make conclusions unfalsifiable. The difference between "Vesu grew 41% MoM last month" (verifiable fact, no falsification needed) and "Vesu will capture 30% of Starknet lending TVL by Q3 2025" (thesis, requires falsification condition) is the difference between reporting and analysis. Senior-level research makes analytical claims, not just factual reports. All analytical claims require falsification conditions. The minimum rubric\'s four requirements apply regardless of data quality.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-research-writer',
      scenario: 'Open sandbox-research-writer in advanced mode. Draft the executive summary section of an ecosystem state report on Starknet DeFi. The summary must include: (a) one original data point from a query artifact (cite any PA-L9-XXX from your prior Lab 9 work), (b) one comparison to another chain using a named external source, (c) one actionable conclusion, (d) one falsifiability condition. Use the Mirror format template. Maximum 250 words.',
      scoringCriteria: ['One original data point present with artifact ID (e.g., "AVNU averaged 285 DAU over the past 30 days — PA-L9-001")', 'One cross-chain comparison with named source and access date (e.g., "Arbitrum recorded 28,000 DAU over the same period per DefiLlama, accessed 2024-11-15")', 'One actionable conclusion — specific and addressable (e.g., "Protocols building on Starknet should prioritise user acquisition over TVL optimisation — the capital efficiency gap has closed but the user base gap has not")', 'One falsifiability condition (e.g., "This analysis is falsified if DAU growth exceeds TVL growth by <1.5× in the next quarter, suggesting capital rather than users is the binding constraint")'],
    },
    {
      type: 'judgment-communication',
      scenario: 'A community member responds to your published Starknet research on Mirror: "Your data shows AVNU has 285 DAU but Starknet foundation reports 15,000 monthly active users. Your numbers must be wrong." Write a two-sentence professional response that defends your methodology without being dismissive and invites the commenter to engage constructively.',
      scoringCriteria: ['Correctly explains the methodological difference: 285 is daily unique wallets executing on-chain swap transactions via the AVNU Exchange contract — the Foundation\'s 15,000 MAU likely counts app visits or broader wallet connections including non-swap interactions', 'Professional tone: does not dismiss the comment, acknowledges the valid point that different metrics produce different numbers, invites the commenter to share the Foundation\'s methodology so both figures can be placed in context', 'Does not simply capitulate — defends the on-chain measurement as the correct metric for the claim being made, while acknowledging other valid metrics exist for different purposes'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'You publish an ecosystem report and 48 hours later the Starknet Foundation announces a $15M liquidity incentive program for DEXs. Your report contained no mention of pending incentive programs. Two data points in your report (Ekubo DAU, AVNU volume trend) are likely to be affected. What should you do, and what does this situation say about the falsifiability condition you should have included?',
      scoringCriteria: ['Required action: publish a 1-paragraph addendum within 72 hours — note the incentive announcement, explain which data points will be affected (DAU and volume will likely spike due to incentive farming), and state that short-term data from the next 30–60 days should be interpreted with incentive effects in mind', 'Falsifiability reflection: the original analysis assumed organic growth conditions. A missing falsifiability condition should have been: "This analysis is predicated on the absence of major new liquidity incentive programs — a significant new incentive program would inflate DAU and volume metrics beyond organic trend, requiring the analysis to be re-run 60 days after incentive program completion"', 'Notes that this situation does not invalidate the original research — it contextualises it. Pre-incentive baselines become more valuable, not less, once incentives launch (they establish what organic activity looked like)'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// L9.5 — Grant Proposal Writing
// TYPE A — The four Foundation scoring criteria applied to
// full grant proposal drafting; sandbox-research-writer as tool.
// ─────────────────────────────────────────────────────────────

export const LAB9_LESSON_5 = {
  id: 'l9-5-grant-proposal-writing',
  title: 'Grant Proposal Writing',
  trackType: 'A',
  lessonNumber: 5,

  explanation: `
In 2023, the Starknet Foundation's Grants Committee reviewed 147 applications. 23 were approved. The rejection rate was 84%. Post-rejection interviews with the committee revealed the most common failure mode: teams that could build what they proposed but could not demonstrate that they had thought rigorously about what success looks like or what failure looks like.

The technical capability of the team was not usually the problem. The problem was the proposal's thinking, not the team's building.

THE FOUR CRITERIA FOUNDATION REVIEWERS SCORE

Every Starknet Foundation grant application is evaluated against four criteria. A proposal that fails any single criterion is rejected regardless of how well it scores on the other three.

CRITERION 1 — SPECIFIC PRODUCT
Definition: not "we will build X" but "Y users will do Z by date W, and we will prove it happened via specific verification method V."

Wrong: "We will build a yield aggregator for Starknet DeFi."
Right: "By Day 90, our yield aggregator vault will be live on Starknet mainnet accepting USDC deposits and routing automatically between Vesu and Nostra based on APY differential. Success metric: $500,000 total value deposited within 30 days of launch. Verifiable by querying our vault contract on Voyager."

The specificity requirement serves two purposes: (1) it forces the team to have thought through what they are actually building, which is a signal of execution capability; (2) it creates an accountability mechanism — the Foundation can verify the milestone without access to the team's systems.

CRITERION 2 — TEAM CREDIBILITY
Definition: relevant shipped products, specific technical skills, demonstrated Starknet experience.

Wrong: "Our team has 5 years of blockchain experience."
Right: "Lead developer has 3 deployed Cairo contracts on Starknet mainnet (Voyager links: [X], [Y], [Z]). Protocol specialist shipped Yearn v2 vault integration at Idle Finance ($12M TVL at peak). Third team member contributed 847 lines of Cairo to the OpenZeppelin Contracts for Cairo repository (GitHub: [link])."

The specificity rule applies to team credibility exactly as it applies to product specification. "5 years of experience" is unverifiable. Specific contract addresses, GitHub contributions, and prior shipped products are independently verifiable in 30 seconds.

CRITERION 3 — MILESTONE SPECIFICITY
Definition: outcomes that are measurable, time-bounded, and verifiable without access to the team's systems.

The activity-vs-outcome distinction:
Activity (rejected): "Milestone 1: Deploy contracts to testnet."
Outcome (accepted): "Milestone 1: By Day 45, vault contracts deployed to Starknet Sepolia. 5 unique test wallets have deposited USDC and executed automatic rebalancing within the same transaction. Rebalancing triggered by >0.5% APY differential between Vesu and Nostra. Verifiable via Sepolia testnet on Starkscan."

The three-part outcome formula: [specific state or metric] by [date] via [verification method accessible to the Foundation without the team's help].

CRITERION 4 — HONEST RISK ASSESSMENT
Definition: the single most likely failure mode for THIS specific project, with a specific mitigation plan and a stated decision point for pivoting if the mitigation fails.

Wrong: "Market conditions could affect our project."
Right: "Primary risk: Vesu and Nostra APY convergence — if both protocols stabilise at identical USDC supply rates, the yield aggregator's value proposition (routing to the higher yield) disappears. Mitigation: within 30 days of APY convergence detection (defined as spread below 0.1% for 7 consecutive days), we expand routing to include STRK staking APY as a third destination. Decision point: if 3-route rebalancing still produces <0.2% yield improvement over passive Vesu deposit at Day 90, we present a product pivot proposal to the Foundation before proceeding."

The failure mode must be specific to your project. The mitigation must have a specific threshold and action. The decision point shows the team knows when to stop rather than burn grant money proving a dead hypothesis.

GRANT TIER SELECTION

Choosing the wrong tier is an automatic rejection signal:
  SEED Grant ($25K–$150K): for teams with no prior Starknet deployment. Fund: first shipped product on mainnet. Milestone structure: 2–3 milestones, Day 60–90 deployment target.
  GROWTH Grant ($150K–$1M): requires demonstrated traction (prior mainnet deployment with verified users). Fund: scaling a proven product. Milestone structure: 3–5 milestones, 6–12 month timeline.
  RESEARCH Grant ($10K–$50K): for analysis, documentation, and protocol research with no code deliverable. Milestone: published report, specific community outcome.

Applying for a GROWTH Grant with no prior Starknet deployment = immediate rejection. The committee does not suggest a SEED Grant as an alternative — they reject and expect the team to apply correctly.

THE GRANT PROPOSAL STRUCTURE

  TITLE: [Specific product name] — [what it does for Starknet in one clause]
  GRANT TIER: [Seed / Growth / Research] — [specific amount requested]
  EXECUTIVE SUMMARY: 3 sentences. What are you building? Who benefits? What does success look like?
  TEAM: specific credentials per person. Verifiable links only.
  PRODUCT SPECIFICATION: the right version of Criterion 1. Include a user flow (not a technical architecture).
  MILESTONE PLAN: 3-column table: Milestone | Outcome (not activity) | Verification method
  RISK ASSESSMENT: primary risk, mitigation, decision point.
  BUDGET: line-item breakdown. Foundation will reject lump-sum budget requests.
  `.trim(),

  keyTakeaway: `Grant proposals fail Criterion 1 when they say "we will build X" instead of "Y users will do Z by date W verified by V"; Criterion 2 when they say "years of experience" instead of specific contract addresses; Criterion 3 when milestones describe activities rather than verifiable outcomes; and Criterion 4 when risk assessment names "market conditions" instead of the specific failure mode most likely to prevent this exact project from succeeding.`,

  examples: [
    {
      contextTag: '[Criterion 1 rewrite from activity to outcome]',
      context: 'A team submits: "Our product will make it easier for users to earn yield on Starknet."',
      scenario: 'Foundation reviewer flags: no specificity. Team rewrites: "Our yield aggregator will route users\' idle USDC automatically between Vesu (3.8% APY) and Nostra (4.2% APY) — always depositing in whichever offers the higher rate at time of deposit. A $10,000 deposit that currently earns 3.8% on Vesu would earn approximately $40 more per year using the aggregator (0.4% APY improvement). Measurable: compare 90-day yield of 100 identically-sized control deposits on Vesu alone vs aggregator vault, using on-chain data."',
      outcome: '"Criterion 1 passed. The rewrite specifies: what the product does (routes automatically), by how much it improves yield (0.4% improvement example), how that improvement will be verified (on-chain comparison of control deposits). The Foundation reviewer can evaluate whether $120K in grant funding justifies this specific improvement for this specific user action."',
    },
    {
      contextTag: '[Criterion 4 specific risk assessment]',
      context: 'A team building a Starknet mobile DCA app writes in their risk assessment: "Risk: regulatory restrictions on crypto apps in certain jurisdictions."',
      scenario: 'Foundation reviewer: too generic. Team rewrites: "Primary risk: Apple App Store rejection. Apple has rejected crypto wallet apps under Section 4.3 (duplicate functionality) and 3.1.1 (virtual currencies). Mitigation: legal review of App Store guidelines completed before submission (allocated $3K in budget); app framed as DeFi savings tool, not a crypto wallet. Decision point: if iOS rejected and appeal fails within 30 days, launch Android-only while pursuing re-submission. Android represents 72% of Braavos mobile wallet installs per Foundation usage data — Android-first is a viable launch strategy."',
      outcome: '"Criterion 4 passed. The rewrite specifies: (1) specific failure mode (App Store rejection, not general regulation), (2) specific mitigation (legal review + framing strategy), (3) specific decision point (30-day rejection window, Android pivot), (4) data supporting the decision point (72% Android metric). The reviewer now knows this team has thought through the exact mechanism most likely to delay their launch."',
    },
    {
      contextTag: '[Milestone table with three-part outcome formula]',
      context: 'A grant application submits a milestone plan as bullet points without verification methods.',
      scenario: 'Original: "Milestone 1: Build contracts. Milestone 2: Test on testnet. Milestone 3: Launch." Reviewer asks for the three-column table format. Rewritten: M1 (Day 45): Vault contract deployed on Sepolia. 5 test wallets execute automatic rebalancing between 2 destinations. Triggered by >0.3% APY differential. Verifiable: Starkscan [contract address]. M2 (Day 75): Mainnet deployment. First 10 live depositors verified via Voyager. M3 (Day 90): $500K TVL reached. 30-day Voyager TVL chart published in Foundation report.',
      outcome: '"The three-column format forces the team to specify verification before getting funded. A reviewer can confirm Milestone 1 was met by looking up the testnet contract address on Starkscan — no contact with the team required. This is the Foundation\'s operational requirement: milestones must be verifiable independently."',
    },
  ],

  guidedPractice: [
    {
      question: 'A grant application reads: "Milestone 1: We will deploy our contracts to mainnet." Apply the activity-vs-outcome framework. What is missing?',
      options: ['A. The milestone needs a longer description', 'B. Activity (deploying contracts) is listed, not outcome. Missing: (1) what the contracts do after deployment — what user action is now possible, (2) a specific success metric — how many users, what amount deposited, what function called, (3) a verification method — which block explorer shows the contract as deployed and functional. Rewrite: "By Day 60, vault contract deployed to Starknet mainnet. First 10 wallets deposit USDC and execute one rebalancing. Verifiable: Voyager contract [address] shows 10+ unique depositors."', 'C. The timeline is too short', 'D. Milestones should not mention smart contracts'],
      correct: 1,
      explanation: 'B is correct. "Deploy to mainnet" is an activity — it describes what the team does, not what changes in the world as a result. Outcomes describe what users can do, what metrics are achieved, and how the Foundation can verify completion. The three-part formula: [specific state] by [date] via [external verification]. Any milestone that the team could mark "complete" by sending one transaction to deploy an empty contract fails the specificity test.',
    },
    {
      question: 'Which team credential statement best meets Criterion 2?',
      options: ['A. "Our team has 12 combined years of DeFi experience."', 'B. "Lead developer deployed STRK-USDC concentrated liquidity vault on Starknet mainnet January 2024 (Voyager: 0x04AB...). Protocol engineer contributed 1,200 lines of Cairo to Vesu\'s risk parameter module (GitHub PR #187). Third member previously built Ethereum yield aggregator processing $8M peak TVL (Etherscan: 0x07CD...)."', 'C. "Our team has worked on major DeFi protocols."', 'D. "We have been building in the Starknet ecosystem since 2022."'],
      correct: 1,
      explanation: 'B is correct. Every credential is independently verifiable in under 60 seconds: Voyager contract address confirms a mainnet deployment exists. GitHub PR link shows the specific code contribution. Etherscan address shows the prior protocol and its TVL. A reviewer can verify all three credentials before finishing their coffee. Options A, C, and D are unverifiable assertions — they require trusting the team\'s self-description rather than checking evidence.',
    },
    {
      question: 'A team applying for a $400K Growth Grant has one prior Starknet deployment: a testnet contract with 12 test transactions. The Foundation reviewer\'s single most likely rejection reason?',
      options: ['A. The budget is too high', 'B. Growth Grants require demonstrated traction — defined as a mainnet deployment with verified active users. A testnet contract with 12 test transactions is a technical proof-of-concept, not a demonstrated product with traction. Rejection reason: "Applicant has not met the Growth Grant traction prerequisite. Recommendation: Deploy to mainnet, demonstrate $50K TVL or 100 active users, then reapply for Growth Grant. Alternatively, apply for SEED Grant ($100-150K) for mainnet deployment milestone."', 'C. The team does not have enough members', 'D. The budget breakdown is missing'],
      correct: 1,
      explanation: 'B is correct. The Growth Grant\'s defining requirement is demonstrated traction — evidence that a real product has real users on the real network. A testnet deployment with test transactions is not traction; it is development. The $400K amount is a secondary issue — even if the amount were appropriate, the missing traction disqualifies the application at the first filter. The correct path: SEED Grant to build the mainnet v1, then Growth Grant to scale it.',
    },
    {
      question: 'The primary risk in a yield aggregator grant application is written as: "We might not be able to find enough users." What is wrong with this risk assessment?',
      options: ['A. It is too short', 'B. "Not finding enough users" is a consequence, not a root cause. The Foundation expects the root cause behind user acquisition failure. Better: "Primary risk: insufficient yield differential — if Vesu and Nostra APY rates converge to within 0.1%, the aggregator\'s core value proposition (routing to higher yield) disappears. Without a meaningful yield differential, user incentive to deposit into the aggregator vs directly into Vesu is minimal." The consequence (no users) follows from the cause (no yield differential) — address the cause, not the symptom.', 'C. User acquisition is not a valid risk', 'D. Should not mention users in the risk section'],
      correct: 1,
      explanation: 'B is correct. Risk assessments that describe consequences rather than causes give the Foundation no information about what will actually go wrong or how the team will prevent it. The Foundation wants to know: what specific technical, market, or operational condition is most likely to cause this project to fail? That condition must be specific to this project (APY convergence for a yield aggregator) and have a proposed mitigation (add third yield destination if APY spread <0.1%). Generic consequences (low users, slow adoption, market conditions) appear in every failing application.',
    },
    {
      question: 'A SEED Grant application for a mobile DCA app includes the following budget: "$120,000 total — split equally across team salaries, infrastructure, and marketing." What is the Foundation\'s likely response?',
      options: ['A. Accept — the total is within SEED range', 'B. Request a line-item breakdown before evaluation. Lump-sum or category-only budgets signal that the team has not planned their spending — which is itself a credibility risk. Line-item expected: developer salaries ($X for N months), Dune API subscription ($Y/month), cloud hosting ($Z/month), legal review App Store ($A), security audit ($B), contingency ($C = total × 10%). Each line item should be justified by the milestone it enables.', 'C. Reject for including marketing in a SEED Grant', 'D. Approve if the team credentials are strong'],
      correct: 1,
      explanation: 'B is correct. A $120K grant with "$40K for salaries" is unverifiable and unaccountable — the Foundation cannot assess whether salary allocation is appropriate without knowing how many people, for how many months, at what rate. The line-item breakdown enables two Foundation checks: (1) is the budget proportionate to the deliverables promised? (2) are the line items internally consistent with the milestone timeline? Teams with detailed budgets demonstrate operational planning capability — a prerequisite for execution.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-research-writer',
      scenario: 'Use sandbox-research-writer to draft a complete Starknet Foundation SEED Grant proposal for the mobile DCA app gap identified in Lab 8. The draft must score all four criteria: (1) Criterion 1 — specific product with 3-part outcome formula, (2) Criterion 2 — team credentials with verifiable links, (3) Criterion 3 — milestone table with outcome + verification for 3 milestones, (4) Criterion 4 — primary risk (App Store rejection) with specific mitigation and decision point. Maximum 400 words.',
      scoringCriteria: ['Criterion 1: product description includes specific user action, measurable success metric (e.g., 200 unique wallets complete one DCA order within 30 days of launch), and verification method (AVNU DCA contract events on Voyager)', 'Criterion 2: at least 2 team credentials with verifiable format (contract addresses, GitHub links, prior product TVL)', 'Criterion 3: milestone table format with 3 milestones — each has outcome (not activity), date, and external verification method', 'Criterion 4: App Store rejection as the primary risk, specific mitigation (legal review + framing strategy), decision point with timeline (if iOS rejected in 30 days, launch Android-first)'],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'The Foundation grants committee has received three applications for a yield aggregator. Rank them 1–3 and identify the single weakest element in the top-ranked application. Application A: $115K SEED, lead dev has 2 Cairo mainnet contracts (Voyager links provided), milestone 1 is "deploy to mainnet by Day 60 with 10 live depositors," risk: APY convergence with specific mitigation. Application B: $350K Growth, team has 5 years DeFi experience (no specifics), milestone 1 is "complete development," risk: "market conditions." Application C: $115K SEED, solo developer, no prior Starknet deployments, milestone 1 is "build MVP," risk: "smart contract bugs."',
      scoringCriteria: ['Ranking: A (1st), C (2nd), B (3rd)', 'Application A ranked 1st: passes all 4 criteria. SEED tier correct (has mainnet deployments but no yield aggregator traction). Specific product (10 depositors Day 60). Verifiable credentials. Outcome milestone. Specific risk with mitigation.', 'Application C ranked 2nd despite solo/no deployments: fails Criterion 2 but passes Criterion 3 (outcome milestone implied) and 4 (bug risk is at least project-specific). A SEED resubmission with a co-developer would strengthen it.', 'Application B ranked 3rd: fails all four criteria. Growth Grant tier wrong (no traction). Credentials unverifiable. Activity milestone. Generic risk.', 'Weakest element in Application A: team credibility — 2 Cairo contracts is sufficient for SEED but on the minimum threshold. A third verifiable credential or prior DeFi vault experience would strengthen the application.'],
    },
    {
      type: 'judgment-communication',
      scenario: 'You submitted a grant application and received this rejection note: "Criterion 1 not met — milestone deliverables are activities, not outcomes. Criterion 4 not met — risk assessment describes consequences, not causes." Write a 100-word response to the Foundation that acknowledges both rejection reasons and requests a 7-day extension to resubmit revised milestones and risk assessment.',
      scoringCriteria: ['Acknowledges both rejection reasons specifically — does not dispute them or ask for clarification on what they mean', 'Criterion 1 fix stated: "I will revise milestones to follow the [specific metric] by [date] verified by [method] format"', 'Criterion 4 fix stated: "I will identify the specific root cause most likely to prevent deployment (APY convergence / App Store rejection / [relevant cause]) and state a specific mitigation and decision point"', 'Request is professional and specific: 7-day extension requested, not open-ended'],
    },
  ],
};

// ─────────────────────────────────────────────────────────────
// LAB 9 — AGGREGATE SIMULATIONS, BUILD TASK, BOSS BATTLE
// ─────────────────────────────────────────────────────────────

export const LAB9_AGGREGATE_SIMS = {
  count: 15,
  simulatorTypes: ['sandbox-sql', 'sandbox-research-writer', 'judgment-dataInterpret', 'judgment-riskAssess', 'judgment-communication', 'starkzap-ecosystem-read'],
  drawPool: 'all-lessons-in-lab',
  userSeesLabel: false,
  unlockCondition: 'all-lessons-complete',
  scoringMode: 'full-rubric',
  description: 'Random draw from all Lab 9 content (SQL Primer L1–L4 + L9.1–L9.5). Tests on-chain query writing, systemic risk mapping, lifecycle classification, research publication standards, and grant proposal evaluation. No labels. No hints.',
};

export const LAB9_BUILD_TASK = {
  id: 'ecosystem-lab-9-build',
  title: 'Senior Ecosystem Research Deliverable',
  labProgressionNumber: 9,
  selectionMode: 'user-choice-4',
  type: 'research-document',
  simulator: 'sandbox-sql + sandbox-research-writer',
  hints: true,
  portfolioPush: false,
  estimatedTime: '90–150 minutes',

  availableTasks: [
    {
      id: '9a',
      title: 'Option A: Published Ecosystem State Report on Mirror',
      difficulty: 'standard',
      estimatedMinutes: 120,
      description: `
Publish a full Starknet ecosystem state report to Mirror using sandbox-research-writer.

MINIMUM RUBRIC (all four required):
• 3 original data points from Dune queries (cite artifact IDs PA-L9-XXX)
• 2 sourced comparisons to other chains (DefiLlama or TokenTerminal, with access dates)
• 1 actionable conclusion (specific enough for a developer, investor, or protocol to act on)
• 1 falsifiability condition (state what data would disprove your main thesis)

Required sections (Mirror format): TL;DR (3 bullets ≤15 words each), Context (150 words), Analysis (600+ words), Conclusion (100 words), Appendix (query links).

Output: ecosystem-state-report.md in /senior/lab-09-strategic-analysis/
      `,
      scoringCriteria: [
        'Three artifact IDs cited with specific numerical claims (not vague assertions)',
        'Two named sourced comparisons with URLs and access dates',
        'Actionable conclusion names a specific actor and a specific decision they can make',
        'Falsifiability condition specifies a measurable threshold and a verification method',
        'Word count minimum 800 words for the Analysis section',
      ],
    },
    {
      id: '9b',
      title: 'Option B: Starknet Foundation Grant Proposal for a Real Protocol Gap',
      difficulty: 'standard',
      estimatedMinutes: 100,
      description: `
Draft a complete grant proposal for one of the four Lab 8 gaps (options protocol, yield aggregator, RWA onboarding, or mobile DCA — or a new gap you have identified through your Lab 9 SQL analysis).

PROPOSAL MUST INCLUDE:
• Specific product — 3-part outcome formula for each milestone
• Team profile — what credentials the ideal team needs (even if hypothetical)
• Milestone table — 3 milestones with outcome, date, and verification method
• Risk assessment — primary failure mode, specific mitigation, decision point
• Budget line items — at least 5 categories with justification
• Grant tier selection — correct tier with justification

Output: grant-proposal-[gap-name].md in /senior/lab-09-strategic-analysis/
      `,
      scoringCriteria: [
        'Criterion 1 met: milestones use 3-part outcome formula for all 3 milestones',
        'Criterion 2 met: team credentials described with verifiable format (even if hypothetical)',
        'Criterion 3 met: milestone table present with date, outcome, and verification columns',
        'Criterion 4 met: primary risk is project-specific (not "market conditions"), mitigation is specific, decision point is stated',
        'Grant tier correctly selected with justification referencing traction requirements',
      ],
    },
    {
      id: '9c',
      title: 'Option C: SQL-Based Competitive Analysis Dashboard',
      difficulty: 'advanced',
      estimatedMinutes: 140,
      description: `
Build a set of 5 Dune queries that together produce a comparative view of Starknet DeFi vs one competitor chain (Arbitrum, Solana, or Ethereum). Export all 5 as Portfolio Artifacts.

REQUIRED QUERY SET (all 5 must be present):
Q1 — DAU comparison: Starknet vs competitor by protocol category (DEX, lending, perps)
Q2 — Volume/TVL ratio comparison: normalised capital efficiency across both chains
Q3 — Protocol concentration: top-3 protocol share by category, both chains
Q4 — User growth trend: 6-month MoM growth for top protocol in each category
Q5 — Revenue/user: fee revenue divided by DAU for DEX protocols on both chains

Each query exported as PA-L9-XXX with chart visualisation.

Synthesis write-up (300 words): one paragraph per category (DEX, lending, perps) plus a conclusion paragraph with one actionable recommendation.

Output: competitive-dashboard-queries.md + 5 exported artifacts in /senior/lab-09-strategic-analysis/
      `,
      scoringCriteria: [
        'All 5 queries syntactically correct and producing non-zero results in demo mode',
        'All 5 exported as Portfolio Artifacts with chart visualisations',
        'Synthesis write-up covers all three protocol categories with specific numbers from queries',
        'Volume/TVL and revenue/user used as normalised metrics (not absolute TVL comparison)',
        'One actionable recommendation in conclusion paragraph cites at least 2 specific query results as evidence',
      ],
    },
    {
      id: '9d',
      title: 'Option D: Protocol Lifecycle Analysis Report — Three Starknet Protocols',
      difficulty: 'standard',
      estimatedMinutes: 110,
      description: `
Apply the growth/maturity/decline framework (L9.3) to three Starknet protocols using SQL evidence.

For each protocol (choose 3 from: AVNU, Ekubo, Vesu, Nostra, Extended):
• Run the 6-month monthly DAU trend query (export as Portfolio Artifact)
• Classify lifecycle stage with confidence level (confident / provisional / inconclusive)
• List the three signals that drive your classification (at least 2 must come from query results)
• State one risk event that would cause a stage reclassification

Cross-protocol synthesis (200 words): which protocol is at the most critical lifecycle inflection point and why? What does the combined lifecycle picture tell you about Starknet DeFi's development stage?

Output: lifecycle-analysis-report.md + 3 Portfolio Artifacts in /senior/lab-09-strategic-analysis/
      `,
      scoringCriteria: [
        'Three 6-month monthly DAU trend queries run with LAG() window function, exported as PA-L9-XXX',
        'Lifecycle classification stated for each protocol with confidence level (confident/provisional/inconclusive)',
        'At minimum 2 of 3 signals per protocol derived from query results (not assumptions)',
        'Reclassification trigger stated for each protocol: specific threshold that would change the classification',
        'Synthesis identifies the most critical inflection protocol with specific data backing the selection',
      ],
    },
    {
      id: '9e',
      title: 'Option E: User-Proposed Senior Research Deliverable',
      difficulty: 'user-defined',
      description: `
Propose your own Senior-level research deliverable. Submit a 50-word proposal for Foundation review.

APPROVAL CRITERIA (all three required):
• Covers skills from at least 3 different Lab 9 lessons (SQL queries, systemic risk, lifecycle, publishing, or grants)
• Has measurable quality criteria — the platform can objectively assess whether it meets the standard
• Estimated completion time under 40 hours

SUBMISSION PROCESS:
Submit your proposal in sandbox-research-writer using the proposal template. Platform (AI) reviews within 24 hours. If approved: build your deliverable. If not approved: platform suggests the most similar curated option (A–D).
      `,
    },
  ],

  outputType: 'written-document',
  outputFormat: 'markdown',
  outputPath: '/senior/lab-09-strategic-analysis/',

  completionRequired: true,
  completionStatus: 'not-started',
};

export const LAB9_BOSS = {
  phase1: {
    id: 'ecosystem-lab-9-boss-phase1',
    hints: true,
    portfolioPush: false,

    taskPool: {
      totalTasks: 22,
      drawPerAttempt: 10,
      taskSelectionMethod: 'random-weighted',
      masteryThreshold: 0.80,
      passMark: 8,
    },

    tasks: [
      { id: 'p1-t01', type: 'sandbox-sql', estimatedMinutes: 10, description: 'Write a DAU query with COUNT(DISTINCT) for a specified Starknet protocol. Include month-over-month growth using LAG() window function. Export result.' },
      { id: 'p1-t02', type: 'sandbox-sql', estimatedMinutes: 8, description: 'Write a UNION ALL query ranking 4 protocols by 30-day unique users. Use correct field names for each protocol from the schema reference.' },
      { id: 'p1-t03', type: 'sandbox-sql', estimatedMinutes: 10, description: 'Write a query for cumulative STRK staking inflow with a window function. Include decimal conversion. Export with chart.' },
      { id: 'p1-t04', type: 'judgment-dataInterpret', estimatedMinutes: 7, description: 'Protocol shows DAU +15% MoM but TVL -8% MoM for 3 consecutive months. Classify lifecycle stage, identify the leading vs lagging indicator, and state what additional query resolves the ambiguity.' },
      { id: 'p1-t05', type: 'judgment-riskAssess', estimatedMinutes: 8, description: 'Trace the contagion chain if Pragma goes offline for 30 minutes during a 15% ETH price drop. Identify which protocols are affected at each step, distinguish recoverable from terminal impact at each step.' },
      { id: 'p1-t06', type: 'judgment-communication', estimatedMinutes: 6, description: 'A research claim states "Starknet processed $1.2B in DEX volume last week." Identify whether this claim meets the minimum publication rubric. Rewrite it so it does.' },
      { id: 'p1-t07', type: 'sandbox-research-writer', estimatedMinutes: 12, description: 'Draft a 150-word executive summary for a Starknet ecosystem report. Must include one artifact ID citation, one sourced comparison with URL, one actionable conclusion, and one falsifiability condition.' },
      { id: 'p1-t08', type: 'judgment-riskAssess', estimatedMinutes: 7, description: 'A grant proposal\'s risk section reads: "Smart contract bugs could affect our protocol." Apply Criterion 4 and rewrite the risk assessment for a yield aggregator with specific failure mode, mitigation, and decision point.' },
      { id: 'p1-t09', type: 'judgment-dataInterpret', estimatedMinutes: 8, description: 'SQL query returns: Vesu unique borrowers grew 42% MoM, Nostra grew 18% MoM, AVNU grew 8% MoM, Ekubo grew 3% MoM. Generate two competing hypotheses for the lending growth divergence and state which additional query tests each hypothesis.' },
      { id: 'p1-t10', type: 'judgment-communication', estimatedMinutes: 6, description: 'A developer asks: "Why should I use a decoded Dune table instead of starknet.events for AVNU analysis?" Give a 3-sentence technical answer using concrete examples of what breaks with the wrong choice.' },
      { id: 'p1-t11', type: 'sandbox-sql', estimatedMinutes: 9, description: 'Write a volume/TVL normalised comparison query for two DEX protocols using mock data. Include human-readable ETH conversion and NULLIF denominator for avg trade size.' },
      { id: 'p1-t12', type: 'judgment-riskAssess', estimatedMinutes: 9, description: 'Apply the dependency graph methodology to Vesu. List all external dependencies, classify each as terminal/recoverable, identify second-order exposures. Rank dependencies by severity.' },
      { id: 'p1-t13', type: 'starkzap-ecosystem-read', estimatedMinutes: 7, description: 'Use the ecosystem read simulator to pull current Starknet TVL, 30-day fee revenue, and daily active users. Compare to Arbitrum on the same three metrics. Calculate Starknet as a percentage of Arbitrum for each. Identify which metric shows Starknet closest to parity.' },
      { id: 'p1-t14', type: 'judgment-dataInterpret', estimatedMinutes: 7, description: 'Explain the NULLIF(x, 0) pattern in SQL volume queries. Why is it necessary? What happens without it? Give a specific example from the AVNU volume trend query.' },
      { id: 'p1-t15', type: 'sandbox-research-writer', estimatedMinutes: 12, description: 'Apply the four-criteria Framework to evaluate a grant proposal excerpt. Identify which criteria pass and which fail. Rewrite the failing criteria to passing standard.' },
      { id: 'p1-t16', type: 'judgment-communication', estimatedMinutes: 6, description: 'Convert a DAU query result into a publishable intelligence claim: one Claim sentence, one Evidence citation, one Implication, one Limitation. Use realistic numbers from mock data.' },
      { id: 'p1-t17', type: 'judgment-dataInterpret', estimatedMinutes: 8, description: 'Explain how Solana\'s 40% volume/TVL ratio can coexist with $0.25 revenue-per-user — while Starknet\'s 18% vol/TVL produces $5 revenue-per-user. State what bot activity does to each metric and why both metrics together tell the complete story.' },
      { id: 'p1-t18', type: 'sandbox-sql', estimatedMinutes: 10, description: 'Given a Starknet protocol with 6 months of monthly DAU data from the mock dataset, write the full lifecycle classification query including LAG() MoM calculation. Classify the protocol. State the reclassification trigger.' },
      { id: 'p1-t19', type: 'judgment-riskAssess', estimatedMinutes: 8, description: 'A new Starknet yield aggregator wants to expand to 5 routing destinations including a newly launched protocol with no audit history. Map the dependency risk this creates. State the criteria for adding unaudited protocols.' },
      { id: 'p1-t20', type: 'judgment-communication', estimatedMinutes: 7, description: 'Write a Mirror TL;DR (3 bullets, ≤15 words each) for a research report where the key findings are: AVNU 285 DAU (Arbitrum-proportional), Vesu 41% MoM user growth, mobile DCA gap is fastest-to-close. Each bullet must be specific and testable.' },
      { id: 'p1-t21', type: 'judgment-dataInterpret', estimatedMinutes: 7, description: 'A grant application is rejected for "Criterion 1 not met." The original milestone read: "By Day 90, deploy yield aggregator vault and onboard users." Diagnose the specific failure and rewrite to pass Criterion 1.' },
      { id: 'p1-t22', type: 'sandbox-sql', estimatedMinutes: 8, description: 'Write a UNION ALL query that compares weekly STRK token inflows to the staking contract vs weekly STRK outflows (from_address = staking contract). Calculate net weekly staking change and cumulative total.' },
    ],

    scenario: `LEARNING LOOP — Lab 9 Strategic Ecosystem Analysis.
Each session draws 10 tasks from the pool of 22. Tasks rotate on every attempt.
Criteria feedback and lesson pointers available after each session.
Pass 8 of 10 tasks (80%) to unlock Phase 2.`,

    feedbackFormat: 'phase1-full-criteria-with-lesson-pointers',
  },

  phase2: {
    id: 'ecosystem-lab-9-boss-phase2',
    hints: false,
    portfolioPush: true,

    scenario: `
You are an ecosystem researcher presenting to the Starknet Foundation's Strategic Investment Committee. The committee is deciding on a $500K grant budget allocation for Q1 2025. They have read your prior reports but have not seen the specific data you will present today.

The session has three tasks. Complete all three. No hints are given. Your portfolio artifact is generated only if you meet all scoring criteria.

TASK 1 — ON-CHAIN EVIDENCE SYNTHESIS (40% of score)

Run two SQL queries from the sandbox-sql simulator:
  Q1: 6-month monthly DAU trend for Ekubo (include MoM growth % using LAG).
  Q2: Cross-protocol unique user ranking for Ekubo, AVNU, Vesu, and Extended (past 30 days).

From the query results, write a 200-word research summary that:
  (a) Classifies Ekubo's lifecycle stage with three specific signals from the data.
  (b) States Ekubo's competitive position relative to the other three protocols.
  (c) Identifies one systemic risk created by Ekubo's market position.
  (d) Cites both query artifacts in the text (PA-L9-XXX format).

TASK 2 — STRATEGIC GRANT ALLOCATION (35% of score)

The committee has $500K and four projects to consider:
  Project A: Mobile DCA app — $120K SEED request. Team has 2 Cairo mainnet contracts.
  Project B: Yield aggregator — $115K SEED request. Team has 1 deployed Starknet vault.
  Project C: Options protocol — $450K Growth request. Team has no prior Starknet deployment.
  Project D: Oracle diversity project — $75K Research request. Team has no code deliverable.

Allocate the $500K across these four projects (you may give $0 to any project). For each allocation:
  — State the amount and grant tier justification.
  — State the most important milestone the Foundation should require.
  — State whether the project as described passes all four criteria (if not, what must be revised).

TASK 3 — SYSTEMIC RISK BRIEFING (25% of score)

Write a 150-word systemic risk briefing for the committee covering:
  (a) The single highest-priority systemic risk in Starknet DeFi today.
  (b) The contagion chain if that risk materialises (minimum 4 steps).
  (c) One specific action the Foundation should fund to reduce this risk.
  The briefing must cite on-chain evidence (query results or known concentration data).
    `,

    scoringCriteria: [
      'Task 1: Ekubo lifecycle classification stated with confidence level and three signals — at least two derived from query results. Competitive position stated relative to AVNU/Vesu/Extended with specific user counts. Systemic risk correctly identified as 92% DEX concentration creating single-point-of-failure. Both artifact IDs cited.',
      'Task 2: Project A approved at $120K SEED — passes all criteria (has deployments, SEED tier correct, amount within range). Project B approved at $115K SEED — passes all criteria. Project C revised to $100K SEED Phase 1 (no prior Starknet deployment disqualifies Growth Grant; must demonstrate mainnet MVP first). Project D approved at $75K Research but milestone must specify a verifiable output (published report, specific community adoption metric — not just "research completed"). Total allocation ≤$500K.',
      'Task 3: Oracle concentration (Pragma single feed, 6 protocols) or sequencer centralisation identified as highest priority systemic risk. Contagion chain has minimum 4 sequential steps with causal connections between each. Foundation action is specific and fundable (oracle redundancy program, sequencer decentralisation grant, protocol-level oracle failsafe requirement). On-chain evidence cited.',
    ],

    portfolioArtifact: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/senior/lab-09-strategic-analysis/',
      files: [
        { filename: 'strategic-analysis-committee-brief.md', type: 'narrative' },
        { filename: 'sql-query-artifacts.json', type: 'data', description: 'Exported Portfolio Artifacts from Phase 2 queries' },
      ],
      commitMessage: 'Passed Lab 9 Strategic Ecosystem Analysis — Senior Ecosystem Deep Dive',
      badgeEarned: 'Strategic Ecosystem Analysis Certified — Senior',
    },

    feedbackFormat: 'phase2-criteria-pass-fail-only',
    xpAwarded: 800,
    verificationLink: 'https://sifter.app/verify/[unique-id]',
  },
};

// ═══════════════════════════════════════════════════════════════
// SENIOR FINAL BOSS — STARKNET ECOSYSTEM DEEP DIVE
// Synthesises Labs 7, 8, and 9. Pass unlocks Senior Certification.
// Full branch scenarios required per Section 18.
// ═══════════════════════════════════════════════════════════════

export const ECOSYSTEM_FINAL_BOSS = {
  id: 'ecosystem-final-boss',
  level: 'senior',
  labsSynthesised: ['Lab 7 — Cross-Chain Competitive Analysis', 'Lab 8 — Ecosystem Gaps and Opportunity Analysis', 'Lab 9 — Strategic Ecosystem Analysis'],
  portfolioArtifactsRequired: ['Lab 7 cross-chain report', 'Lab 8 gap memo', 'Lab 9 strategic analysis brief'],
  hints: false,
  attempts: 'unlimited-fresh-scenario',

  description: `
Final Boss — Senior Ecosystem Deep Dive.

A solo interview session that synthesises all three Senior labs. The interviewer is a Partner at a $200M crypto fund evaluating a significant Starknet ecosystem position. Your goal: demonstrate that you can produce original on-chain research, identify systemic risks, classify protocol lifecycles, connect gaps to opportunities, and make defensible investment recommendations.

Four core questions are asked. Your answer to each determines which branch fires. Each branch has three paths: Strong (escalate), Partial (probe deeper), Incorrect (redirect with teaching moment).

No hints. No lesson pointers on failure. Pass unlocks Senior Certification.

A new scenario is generated for each attempt.
  `,

  coreQuestions: [
    {
      questionId: 'fb-q1',
      question: `Your portfolio from this track shows a cross-chain competitive analysis, a gap opportunity memo, and a strategic committee brief. Walk me through your most important finding — the one you would lead with if you had 2 minutes to pitch an investment thesis on Starknet.`,
      branches: {
        strong: {
          triggerDescription: 'Candidate leads with a specific, data-backed claim from their portfolio artifacts, not a general statement about Starknet. References specific numbers (DAU, TVL, growth rate, market gap size) and connects them to an investment thesis.',
          followUpQuestion: `Your data shows Starknet's DEX capital efficiency matches Arbitrum's. What is the most important condition that would cause this efficiency advantage to disappear, and how quickly could that condition emerge?`,
          scoringCriteria: [
            'Identifies specific risk: EVM-compatible ZK-rollup achieving comparable AA support would remove Starknet\'s unique efficiency advantage (not just "more competition")',
            'Timeline realistic: 12–24 months for ZKSync or Polygon zkEVM to implement equivalent AA — longer for EVM compatibility to be overcome',
            'States what would need to be true for Starknet to maintain advantage despite EVM competition: Cairo developer ecosystem must grow faster than EVM-ZK developer migration rate',
          ],
        },
        partial: {
          triggerDescription: 'Candidate states a claim that is directionally correct but lacks specific numbers or does not connect to a portfolio artifact.',
          followUpQuestion: `You mentioned [the claim they made]. What specific Dune query would I run to verify that claim myself, and what would I look for to know whether the number I get is accurate?`,
          scoringCriteria: [
            'States the correct table (decoded_starknet.[protocol]_evt_[event])',
            'States the correct metric (COUNT DISTINCT for users, SUM/1e18 for volume)',
            'Identifies the key verification step: compare to a known benchmark or check decimal conversion plausibility',
          ],
        },
        incorrect: {
          triggerDescription: 'Candidate makes a general statement about ZK technology or Starknet\'s roadmap without connecting to specific measurable ecosystem data.',
          redirectStatement: 'Investment theses need to be grounded in measurable current-state data, not technology narratives. Let me push on a specific claim. Starknet\'s DEX capital efficiency — measured as daily volume divided by TVL — is approximately 18%, matching Arbitrum\'s. That is a specific, verifiable claim I can test on Dune in 30 seconds. Give me a second specific, measurable, currently-verifiable claim about Starknet DeFi.',
          followUpQuestion: `Now explain how you would verify that claim using the Dune schema — which table, which fields, which aggregation.`,
          scoringCriteria: [
            'States a specific measurable claim (not a technology assertion)',
            'Correctly identifies the Dune table for the stated claim',
            'Correctly identifies the SQL aggregation (COUNT DISTINCT, SUM, GROUP BY DATE_TRUNC)',
          ],
        },
      },
    },
    {
      questionId: 'fb-q2',
      question: `From your ecosystem gap analysis, you identified gaps in options, yield aggregation, RWA, and mobile DCA. I\'m evaluating a $1M deployment into the highest-conviction opportunity. Which of the four gaps gives me the highest expected return on capital and why?`,
      branches: {
        strong: {
          triggerDescription: 'Candidate selects yield aggregator with specific reasoning: highest infrastructure readiness, no specialist expertise required, self-sustaining revenue model, compounding ecosystem benefit. Correctly identifies options as highest potential but highest execution risk.',
          followUpQuestion: `You\'re recommending the yield aggregator. A yield aggregator\'s value proposition disappears if protocol APY rates converge. Give me a specific, measurable definition of "APY convergence" and state the exact mitigation action the team should take when it occurs.`,
          scoringCriteria: [
            'Convergence defined precisely: Vesu-Nostra USDC APY spread <0.1% for 7+ consecutive days (or equivalent specific threshold)',
            'Mitigation action specific: add STRK staking APY as third routing destination within 30 days of convergence detection',
            'Decision point stated: if 3-route rebalancing produces <0.2% improvement over passive Vesu deposit at Day 90, present product pivot proposal',
          ],
        },
        partial: {
          triggerDescription: 'Candidate correctly identifies the infrastructure readiness concept but cannot articulate the specific self-sustaining revenue model or the APY convergence risk.',
          followUpQuestion: `You said the yield aggregator has high infrastructure readiness. What does that mean specifically — which components already exist on Starknet today that a yield aggregator team does not need to build from scratch?`,
          scoringCriteria: [
            'Correctly identifies: Vesu and Nostra (yield destinations already deployed), AVNU Paymaster (gasless execution), session keys / Account Abstraction (automatic rebalancing without user action per-rebalancing)',
            'Notes that the remaining build is integration layer and UI — not protocol development — which reduces build time and team expertise requirements',
          ],
        },
        incorrect: {
          triggerDescription: 'Candidate selects options protocol or RWA without acknowledging the execution constraints (specialist expertise requirement or regulatory cost) that make them lower-expected-return for a standard VC deployment.',
          redirectStatement: 'Options and RWA are larger market opportunities — but investment return depends on probability of execution multiplied by market size, not market size alone. The options gap on Starknet requires an options market-making specialist who understands Greeks management under thin liquidity — a rare profile. The RWA gap requires $1.5M in legal costs before any code is written. Your $1M capital goes further in a gap where the execution constraint is solvable by available talent today.',
          followUpQuestion: `Given that framing — probability of execution × market size — reconsider the four options and rank them. Justify your top choice using both the market size and the execution probability you assign to each.`,
          scoringCriteria: [
            'Yield aggregator or mobile DCA correctly ranked 1st-2nd on probability × market size basis',
            'Execution probability correctly lower for options (specialist expertise) and RWA (regulatory timeline)',
            'Ranking is explicit with justification, not just reassertion of original choice',
          ],
        },
      },
    },
    {
      questionId: 'fb-q3',
      question: `Walk me through the single most dangerous systemic risk in Starknet DeFi today. I want a step-by-step failure scenario — as if you\'re briefing a risk committee.`,
      branches: {
        strong: {
          triggerDescription: 'Candidate identifies oracle concentration (Pragma single feed for 6+ protocols) or sequencer centralisation, and traces a specific step-by-step contagion chain with at least 4 sequential steps and causal connections between each.',
          followUpQuestion: `You described the Ekubo-to-Pragma-to-lending-cascade scenario. At which step does the failure become terminal versus recoverable, and what is the specific mechanism that determines which path it takes?`,
          scoringCriteria: [
            'Terminal vs recoverable correctly identified at the Pragma price restoration step: if restoration happens within 30 minutes and LTV ratios are conservative, simultaneous liquidations are manageable (recoverable). If restoration is delayed >2 hours in high-volatility conditions, bad debt accumulates beyond protocol reserves (terminal).',
            'Determining mechanism: the margin between the protocol\'s LTV threshold and the ETH price level at restoration — protocols with conservative LTV (65% max) have a larger price recovery buffer; protocols at aggressive LTV (80%+) face terminal risk from smaller price moves.',
            'Notes that Starknet\'s current scale ($120M lending TVL) makes most scenarios recoverable — the risk becomes terminal at higher TVL as liquidation impact on thin DEX liquidity increases.',
          ],
        },
        partial: {
          triggerDescription: 'Candidate identifies the correct top-level risk (Ekubo concentration or oracle concentration) but cannot trace the specific mechanism connecting Ekubo failure to lending protocol damage.',
          followUpQuestion: `You identified Ekubo as the critical risk. What is the specific mechanism connecting an Ekubo outage to damage in Starknet\'s lending protocols — Vesu and Nostra? They\'re a completely different protocol category. How does a DEX outage affect a lending protocol?`,
          scoringCriteria: [
            'Correctly identifies the Pragma oracle mechanism: Pragma derives on-chain prices from DEX trading activity. Without Ekubo (92% of DEX liquidity), the remaining 8% produces a thin, easily-manipulated price signal.',
            'Correctly identifies the lending protocol dependency: Vesu and Nostra use Pragma\'s on-chain price feed to calculate health factors for STRK-collateralised positions.',
            'States the consequence: incorrect health factor calculation → missed liquidations (bad debt accumulation) or incorrect liquidations (user harm).',
          ],
        },
        incorrect: {
          triggerDescription: 'Candidate identifies a risk that is real but not the highest-priority systemic risk (e.g., smart contract bugs, bridge hacks, regulatory risk) without a contagion chain.',
          redirectStatement: 'Smart contract bugs and bridge hacks are real risks — but they\'re protocol-specific, not systemic. A bug in Vesu damages Vesu users. The systemic risks I\'m asking about create contagion across unrelated protocols: one failure propagates to multiple protocols simultaneously even if each protocol\'s own code is perfect. There are two such risks on Starknet today. One is infrastructure (the sequencer). One is market structure (concentrated DEX liquidity and its effect on oracle pricing). Walk me through the market structure one.',
          followUpQuestion: `Trace the contagion from concentrated DEX liquidity to oracle pricing to lending protocol damage — three specific steps, each with a causal mechanism.`,
          scoringCriteria: [
            'Step 1 correctly stated: Ekubo holds 92% of Starknet DEX liquidity — DEX outage removes 92% of price discovery capacity for on-chain assets including STRK.',
            'Step 2 correctly stated: Pragma oracle reads on-chain prices from DEX trading — without Ekubo, price signal from remaining 8% of liquidity is thin and easily manipulated.',
            'Step 3 correctly stated: Vesu and Nostra use Pragma STRK price to calculate health factors — distorted price produces incorrect health factors — missed or incorrect liquidations.',
          ],
        },
      },
    },
    {
      questionId: 'fb-q4',
      question: `I\'m going to ask you to defend a research claim you published in your portfolio. Looking at your Lab 9 strategic brief — what was your most important original finding that came from your own SQL queries, not from a published report?`,
      branches: {
        strong: {
          triggerDescription: 'Candidate clearly states a specific finding from their own query artifacts (citing a PA-L9-XXX artifact ID), explains what the query measured, and states why this finding is not available in any published dashboard or report.',
          followUpQuestion: `Your finding was [the finding they stated]. Give me the falsifiability condition — what specific data outcome would force you to reverse that finding?`,
          scoringCriteria: [
            'Falsifiability condition is specific and measurable: states a concrete threshold (number, ratio, trend duration) that would disprove the finding',
            'Verification method is independent: could be verified by anyone with Dune access, no access to the candidate\'s systems required',
            'Correctly distinguishes between findings that are falsified (the analysis was wrong) vs findings that are superseded (new data changed conditions) — both are valid, each has different implications for research credibility',
          ],
        },
        partial: {
          triggerDescription: 'Candidate references a finding from their portfolio but cannot recall the specific query that produced it or cannot state a falsifiability condition.',
          followUpQuestion: `You said [their finding]. If I were to reproduce your analysis on Dune today, which table and which fields would I query to get the underlying data? Walk me through the SQL structure.`,
          scoringCriteria: [
            'States the correct table (decoded_starknet.[protocol]_evt_[event] or starknet.token_transfers for staking data)',
            'States the correct field names for the metric claimed (taker_address for AVNU users, position_owner for Vesu borrowers, etc.)',
            'States the correct aggregation (COUNT DISTINCT for users, SUM/1e18 for volume, LAG OVER for MoM trend)',
          ],
        },
        incorrect: {
          triggerDescription: 'Candidate describes a finding that was from a published report or DefiLlama dashboard rather than their own SQL analysis, or cannot distinguish original data from sourced data.',
          redirectStatement: 'The minimum rubric for Lab 9 research requires three original data points from queries you ran yourself — distinct from sourced comparisons from DefiLlama or published reports. The difference matters: a finding you queried yourself can be reproduced and verified by anyone with Dune access. A figure from DefiLlama reflects their methodology, which you may or may not agree with. Tell me one number that came from a query you wrote, with the artifact ID it generated.',
          followUpQuestion: `State the artifact ID, the query you wrote, and the specific number it returned. Then tell me why that number is analytically interesting — what does it tell you that DefiLlama wouldn\'t show?`,
          scoringCriteria: [
            'States a Portfolio Artifact ID (PA-L9-XXX format)',
            'Describes the query correctly: table, aggregation function, WHERE filter, time range',
            'Explains why the finding is analytically distinct from dashboard data: on-chain data measures wallet interactions (economic intent), not API calls or app sessions',
          ],
        },
      },
    },
  ],

  onPass: {
    unlocks: 'Senior Certification — Starknet Ecosystem Deep Dive',
    portfolioPush: {
      repoName: 'starknet-ecosystem-deep-dive',
      folderPath: '/senior/certification/',
      files: [
        { filename: 'final-boss-transcript.md', type: 'narrative', description: 'Final boss interview transcript with scoring summary' },
      ],
      commitMessage: 'Senior Certified — Starknet Ecosystem Deep Dive',
      badgeEarned: 'Senior Ecosystem Analyst — Starknet Ecosystem Deep Dive',
    },
    xpAwarded: 1500,
  },

  onFail: {
    feedbackFormat: 'pass-fail-criteria-only',
    message: 'Not all criteria met. A new scenario will be generated for your next attempt. No lesson pointers are provided at this level.',
  },
};

// ═══════════════════════════════════════════════════════════════
// LAB 9 — META
// ═══════════════════════════════════════════════════════════════

export const LAB9_META = {
  id: 'ecosystem-senior-lab-9',
  title: 'Strategic Ecosystem Analysis',
  trackId: 'starknet-ecosystem-deep-dive',
  level: 'senior' as const,
  labNumber: 9,
  estimatedHours: 14,
  portfolioPushThisLab: true,
  portfolioPushPhase: 2,
  lessonCount: 9, // 4 SQL Primer micro-lessons + 5 main lessons
  prerequisite: 'Labs 1–8 complete. Intermediate certified.',
  description: `Senior capstone lab. Four SQL Primer micro-lessons teach Dune schema and query fundamentals. Five main lessons cover: on-chain data as competitive intelligence (SQL query writing), systemic risk mapping (dependency graphs and contagion chains), protocol lifecycle analysis (growth/maturity/decline classification), publishing ecosystem research (Mirror and Forum format standards), and grant proposal writing (four-criterion evaluation framework). Lab 9 is the synthesis of all prior track skills. The Final Boss is a live interview simulation testing original research defense.`,
  nextLab: 'Final Boss — Senior Certification: Starknet Ecosystem Deep Dive',
  finalBossUnlockedByThisLab: true,
  sqlPrimerIncluded: true,
  sqlPrimerLessonCount: 4,
  simulatorTypesUsed: [
    'sandbox-sql',
    'sandbox-research-writer',
    'judgment-dataInterpret',
    'judgment-riskAssess',
    'judgment-communication',
    'starkzap-ecosystem-read',
  ],
};

// ═══════════════════════════════════════════════════════════════
// LAB 9 COMBINED EXPORT
// ═══════════════════════════════════════════════════════════════

export const LAB9 = {
  id: 'ecosystem-senior-lab-9',
  title: 'Strategic Ecosystem Analysis',
  meta: LAB9_META,

  sqlPrimerLessons: [
    LAB9_SQL_PRIMER_1,
    LAB9_SQL_PRIMER_2,
    LAB9_SQL_PRIMER_3,
    LAB9_SQL_PRIMER_4,
  ],

  lessons: [
    LAB9_LESSON_1,
    LAB9_LESSON_2,
    LAB9_LESSON_3,
    LAB9_LESSON_4,
    LAB9_LESSON_5,
  ],

  aggregateSimulations: LAB9_AGGREGATE_SIMS,
  buildTask: LAB9_BUILD_TASK,
  bossMode: LAB9_BOSS,
};

export const FINAL_BOSS = ECOSYSTEM_FINAL_BOSS;
