// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// INTERMEDIATE · LAB 6 — L6.6
// Structuring a Professional DeFi Research Report
// TYPE A — Dominant concept: a professional research report has a mandatory
// structure where each section serves a distinct analytical function —
// knowing the structure lets you produce and consume research efficiently
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_6 = {
  id: 'l6-6-research-report-structure',
  title: 'Structuring a Professional DeFi Research Report',
  trackType: 'A',
  lessonNumber: 6,

  previousLessonRef: `L6.5 taught the five-step research workflow: form a falsifiable hypothesis, collect data from multiple sources, apply a systematic analytical framework, present findings with uncertainty acknowledged, and publish with citations. In this lesson we move from the workflow to the output — the document that carries your research from private analysis to public record.`,

  hook: `In 2022, a research analyst at a crypto hedge fund published a DeFi protocol analysis on Mirror. It had good data, a clear thesis, and was well-written. Within 48 hours, the protocol team publicly challenged it — not the thesis, but the methodology. The analyst had not separated her data section from her interpretation section. Protocol TVL numbers appeared in the same paragraphs as her opinion about their trajectory. Readers could not tell which claims were verifiable fact and which were informed judgment. The protocol team exploited this blur to discredit the entire report.

The analyst rewrote the report with a clear structure: data in one section, analysis in another, thesis in a third. The same conclusions, presented with professional discipline. The protocol team had nothing left to attack. The report went on to be cited by three other researchers.

Structure is not bureaucracy. It is armour.`,

  explanation: `
A professional DeFi research report follows a standard six-section structure. The structure is not arbitrary — each section has a specific purpose, and the sequence is designed to take a reader from knowing nothing about the protocol to being able to make an informed decision.

THE SIX-SECTION STRUCTURE

SECTION 1 — EXECUTIVE SUMMARY (100–200 words)

The executive summary is written last but read first. Its job is to answer one question in two minutes: what is this protocol, is it worth my capital, and what is the primary risk I accept if I deploy?

A professional executive summary has four mandatory components:
— What the protocol does (one sentence, no jargon)
— One specific key metric (TVL, daily volume, or active users — with a number and a source)
— Its competitive position on the chain (one specific claim)
— Its primary risk (one sentence)

What it must not contain: qualifications, caveats, background history, or the analyst's feelings about the space. The executive summary is a briefing, not an essay.

The most common failure: the executive summary describes the protocol's category rather than the specific protocol. "A decentralised lending protocol built on Starknet that allows users to supply and borrow assets" is a category description. "Vesu is Starknet's largest lending protocol by TVL ($45M as of November 2025), operating a multi-collateral pool model with Pragma oracle integration" is a specific description. The difference is specificity, and specificity is what makes a report credible.

SECTION 2 — PROTOCOL ANALYSIS (300–500 words)

This section contains only verifiable data. No opinions. No interpretations. No theses. Every claim must be traceable to a source.

The protocol analysis answers four questions:
1. How does the mechanism work? (technical description, not marketing copy)
2. What are the current operating metrics? (TVL, volume, users, revenue — with sources and dates)
3. What does the fee model look like? (where fees come from, where they go, what percentage stays with the protocol)
4. What is the growth trajectory? (at least three data points over time — not just the current snapshot)

The most common failure: using marketing language from the protocol's own documentation. "Revolutionary AMM design with deep liquidity" is not analysis — it is the protocol's self-description. "Ekubo uses a tick-spacing model with 1 basis point increments, resulting in approximately 22% capital efficiency measured as daily volume / TVL, compared to Uniswap v3's 32% on Arbitrum" is analysis.

When no data exists for a metric you need, you state: "Data not available — monitoring required." This is professional. Inventing numbers is not.

SECTION 3 — RISK ASSESSMENT (250–400 words)

The risk assessment is the most analytically demanding section. It requires you to reason about what could go wrong, not just what is going well.

Four risk categories must be present:

SMART CONTRACT RISK
This covers: audit status, auditor tier, audit age, upgrade frequency since last audit, access control configuration, oracle dependency, and known unresolved findings.

Assessment format: "[Protocol] was last audited [date] by [firm] ([tier]). [N] findings were identified. [M] were resolved before mainnet. [K] remain unresolved: [description]. Since the audit, [number] upgrades have been deployed, covering [scope]. Residual risk: [specific]."

MARKET AND LIQUIDITY RISK
For lending protocols: what is the maximum withdrawal scenario? If 40% of depositors exit simultaneously, can the remaining borrowers be liquidated in time? What is the historical depth of secondary market liquidity for collateral assets?

For DEXs: what happens to LP positions in a 50%+ price move? What is the impermanent loss scenario?

REGULATORY AND COMPLIANCE RISK
Does the protocol involve assets that regulators in major jurisdictions are targeting? Is there any KYC/AML process? Is the team pseudonymous in a jurisdiction where protocol operators face personal liability?

ECOSYSTEM AND PROTOCOL DEPENDENCY RISK
What other protocols does this one depend on? If Pragma oracle goes offline, what happens? If Ekubo DEX has a major exploit, how is this protocol affected? These are not theoretical — they are modellable dependencies that should be explicitly mapped.

Each risk category should be rated: LOW / MEDIUM / HIGH, with a one-sentence justification for the rating.

SECTION 4 — COMPETITIVE ANALYSIS (200–300 words)

This section answers: compared to what? Every protocol competes with something — another protocol on the same chain, a protocol on a competing chain, or simply the alternative of not using DeFi at all.

Two comparisons are required:
1. Intra-chain: compare to the closest Starknet competitor on the same protocol type
2. Cross-chain: compare to the most mature implementation of this protocol type on any chain

The comparison must use the same metrics. If you compare TVL, compare TVL for both protocols. If you compare fee APY, compare fee APY for both. Selective comparison (my metric for Protocol A, different metric for Protocol B) is a well-known manipulation technique that legitimate research avoids.

The most common failure: describing competitors rather than comparing them. "Nostra is another Starknet lending protocol that offers similar functionality" is a description. "Vesu currently holds 61% of Starknet lending TVL vs Nostra's 39%. Vesu's USDC supply APY has averaged 5.4% vs Nostra's 4.9% over the past 30 days, measured from DefiLlama and Dune respectively" is a comparison.

SECTION 5 — INVESTMENT THESIS (200–300 words)

This is the analyst's judgment section — the only section where opinion is appropriate. The investment thesis states what the analyst believes and why.

The thesis must contain four elements:

BULL CASE: Two or three specific reasons the protocol could outperform expectations. Each reason must name a specific catalyst — an event or condition that would trigger it. "Starknet ecosystem grows" is not a specific catalyst. "Starknet TVL crossing $5B triggers institutional allocation that historically flows first to the largest lending protocol — currently Vesu" is a specific catalyst.

BEAR CASE: Two or three specific scenarios that would invalidate the thesis. These should be as specific as the bull case. "Market crashes" is not specific. "Nostra launches a new collateral type capturing STRK-native yields, drawing liquidity from Vesu's primary pool, reducing Vesu's TVL by 20%+" is specific.

POSITION RECOMMENDATION: State explicitly what allocation is appropriate, at what conditions, for what time horizon. "Moderate allocation at 3-7% of a Starknet DeFi portfolio, for an 18-month hold, conditional on smart contract risk not increasing (no major upgrades without new audit)."

FALSIFIABILITY CONDITION: One specific, measurable condition that would cause the analyst to reverse the thesis. "This thesis is falsified if Vesu's TVL share of Starknet lending falls below 40% for two consecutive months, indicating competitive erosion rather than ecosystem growth."

SECTION 6 — DISCLOSURE AND METHODOLOGY (50–100 words)

Every professional research report ends with two declarations:

DISCLOSURE: Does the analyst hold a position in this protocol's token? Have they received compensation from the protocol? Are they affiliated with any entity that is long or short this protocol? If yes to any: state it explicitly. If no: state "The author holds no position in [protocol token] and received no compensation from the protocol team for this report." Failure to disclose is a credibility-destroying event.

METHODOLOGY NOTE: Where did the data come from? When was it collected? What tools were used? "On-chain data from Dune Analytics (queries available at [link]), TVL data from DefiLlama (snapshot: [date]). All data points represent conditions as of [date] and may have changed."

WHY THE STRUCTURE MATTERS FOR CONSUMING RESEARCH

When you read someone else's research, knowing this structure lets you immediately identify what they are missing. If the risk section has no specific unresolved audit findings — that is an omission. If the investment thesis has no falsifiability condition — that is a red flag. If the competitive analysis uses different metrics for each protocol — that is cherry-picking.

A well-structured report lets a sceptical reader verify every verifiable claim and clearly identify which claims are judgment. A poorly structured report blurs this distinction — sometimes accidentally, sometimes deliberately.

The structure is not a bureaucratic requirement. It is the difference between analysis and advocacy.
  `.trim(),

  keyTakeaway: `A professional DeFi research report has six mandatory sections in a specific order: Executive Summary (what + one metric + position + risk), Protocol Analysis (verifiable data only, no opinion), Risk Assessment (four categories: smart contract / market / regulatory / ecosystem), Competitive Analysis (same metrics for all compared protocols), Investment Thesis (bull case + bear case + position recommendation + falsifiability condition), and Disclosure + Methodology. Each section has a specific purpose — mixing them destroys the report's credibility.`,

  visualPrompt: `A clean six-row table. Each row: section name, purpose (one word), primary question answered, what NOT to include, length range. Row 1: Executive Summary / Overview / "What + is it worth + primary risk" / "Caveats, history" / 100-200w. Row 2: Protocol Analysis / Data / "How it works + metrics + fees + trend" / "Opinions, marketing language" / 300-500w. Row 3: Risk Assessment / Risk / "What could go wrong (4 categories)" / "Hedging language without specifics" / 250-400w. Row 4: Competitive Analysis / Context / "Compared to what?" / "Different metrics per protocol" / 200-300w. Row 5: Investment Thesis / Judgment / "What I believe + bull + bear + position" / "Unspecified catalysts, no falsifiability" / 200-300w. Row 6: Disclosure + Methodology / Accountability / "Positions held + data sources" / "Omission" / 50-100w. Colour coding: blue for data sections (2, 4), amber for analysis sections (3, 5), grey for bookend sections (1, 6).`,
  visualType: 'static',
  visualUrl: 'research-report-structure-table',

  examples: [
    {
      contextTag: '[Executive Summary: bad vs good]',
      context: 'Two analysts both write about Vesu. The first writes a generic category description. The second writes a specific, metric-backed summary.',
      scenario: `ANALYST A's EXECUTIVE SUMMARY:
"Vesu is a decentralised lending protocol built on Starknet. It allows users to deposit assets and borrow against their collateral. The protocol uses an algorithmic interest rate model that adjusts based on utilisation. It has been audited by a reputable security firm and has been operating since early 2024. The team is doxxed and has prior DeFi experience. Overall the protocol appears to be a legitimate project in the growing Starknet DeFi ecosystem."

ANALYST B's EXECUTIVE SUMMARY:
"Vesu is Starknet's largest lending protocol by TVL, currently holding $45M across five collateral types (data: DefiLlama, November 2025). The protocol uses Pragma oracle with TWAP protection and a kink-model interest rate that adjusts supply APY based on utilisation. Starknet's DeFi ecosystem growing 3× in 2025 positions Vesu as the default lending venue for incoming capital — similar to Aave's role on Ethereum. Primary risk: a single audit firm (Peckshield, 6 months ago), no upgrade since, but one unresolved Medium finding on oracle fallback behaviour."`,
      outcome: 'Analyst A wrote 130 words that a reader could have learned from the Vesu website. Analyst B wrote 115 words that a reader could only get from original research. Analyst B\'s summary is immediately useful — it has a specific number, a source, a specific risk, and a specific competitive comparison. A reader can make a preliminary decision from Analyst B\'s summary alone. They cannot from Analyst A\'s.',
    },
    {
      contextTag: '[Risk section: omission example]',
      context: 'A researcher publishes a risk section for a Starknet lending protocol that includes smart contract and market risk sections but omits ecosystem dependency risk.',
      scenario: 'Three months after the report is published, Pragma oracle experiences a 45-minute outage due to a Starknet node issue. The lending protocol — which depends entirely on Pragma for its health factor calculations — pauses all borrows during this window. A large ETH price move during the outage results in positions being liquidated at delayed prices. Some users incur losses they believe would not have happened had the oracle been live.',
      outcome: 'The researcher\'s report was read by several users who deposited based on it. They could reasonably claim the risk section gave them incomplete information — Pragma dependency was not mentioned. The correct risk section would have included: "Ecosystem dependency: Vesu uses Pragma oracle for all collateral pricing. A Pragma outage pauses health factor calculation, which pauses new borrows and may delay liquidations. Mitigation: Pragma has 99.8% uptime over the past 12 months and has a fallback oracle architecture. Risk rated: LOW but monitored." The omission was not malicious — but it was a failure of professional completeness.',
    },
    {
      contextTag: '[Investment thesis: falsifiability discipline]',
      context: 'Two analysts both make bullish investment theses about Ekubo. One includes a falsifiability condition; the other does not.',
      scenario: `ANALYST A (no falsifiability): "We believe Ekubo will continue to be the dominant DEX on Starknet as the ecosystem grows. Our bull case is significant fee income growth. Our bear case is competition from other DEXs. We recommend a moderate allocation for long-term holders."

ANALYST B (with falsifiability): "Bull case: Starknet TVL crosses $5B in 2026 (specific catalyst: Foundation liquidity incentive programme conclusion driving TVL from incentive to organic basis). At $5B TVL with current volume/TVL ratio, Ekubo fee revenue reaches $15M+ annually, justifying a higher token multiple. Bear case: A new Starknet DEX launches with deeper STRK/USDC liquidity via a Curve-style liquidity war, drawing router traffic from Ekubo. Falsifiability condition: This thesis is falsified if Ekubo's share of Starknet DEX volume falls below 70% (currently 92%) for 3 consecutive months, indicating structural competitive loss rather than temporary volatility."`,
      outcome: 'Six months later, Ekubo\'s market share drops from 92% to 74% for two months and then recovers to 81%. Analyst A cannot update their thesis — they have no stated condition for revision. Analyst B updates immediately: "Market share reached 74% for two months, approaching but not crossing the 70% threshold. Monitoring continued. Recovery to 81% indicates competitive threat was real but Ekubo\'s liquidity depth defended its position. Thesis intact but confidence reduced from high to moderate pending 3-month trend confirmation." Analyst B\'s thesis is a living document. Analyst A\'s is a frozen opinion.',
    },
  ],

  guidedPractice: [
    {
      question: 'You are writing the Protocol Analysis section for a DEX report. You have the following data: "Daily trading volume: $18M. TVL: $82M. Fee tier: 0.3%." Which additional data point is most critical to include before the section is complete?',
      options: [
        'A. The founders\' backgrounds and LinkedIn profiles',
        'B. The protocol\'s marketing roadmap for Q2',
        'C. A time-series showing how volume and TVL have changed over the past 3-6 months (the growth trajectory)',
        'D. The number of social media followers the protocol has',
      ],
      correct: 2,
      hint: 'The Protocol Analysis section requires four things: mechanism, current metrics, fee model, and growth trajectory. Which of these four is missing from the data provided?',
      explanation: 'C is correct. The Protocol Analysis section requires a growth trajectory — at least three data points over time showing whether TVL and volume are growing, stable, or declining. A current snapshot ($18M volume, $82M TVL) tells you the state of the protocol today. It does not tell you whether the protocol is in early growth (same numbers as last month = stagnation) or strong growth (up 40% from last month = momentum). The trend is often more predictive than the current level. A, B, and D are not part of the Protocol Analysis section — they belong in due diligence conversations, not a research report.',
    },
    {
      question: 'An analyst writes: "Protocol X is riskier than Protocol Y because Protocol X\'s team is anonymous." In which section does this claim belong, and what would make it a properly professional claim?',
      options: [
        'A. It belongs in the Protocol Analysis section and is already properly formatted',
        'B. It belongs in the Risk Assessment section, and it needs: a specific risk category, a specific consequence of anonymity, and a risk rating (LOW/MEDIUM/HIGH)',
        'C. It belongs in the Executive Summary because it is a key risk',
        'D. It should not appear in a research report because it is subjective',
      ],
      correct: 1,
      hint: 'Which section handles risks, and what does a properly professional risk claim require?',
      explanation: 'B is correct. The claim is a risk assessment claim and belongs in the Risk Assessment section. But as written, it is incomplete. A professional risk claim requires: (1) which category it falls into (regulatory/compliance risk), (2) the specific consequence (anonymous teams may face reduced accountability in jurisdictions where operators face personal liability for protocol outcomes — if a user loses funds and seeks legal recourse, an anonymous team cannot be held accountable), (3) a risk rating (MEDIUM for most DeFi protocols — many successful protocols have pseudonymous teams). It is not subjective — it is a real risk category. But it needs specificity to be useful.',
    },
    {
      question: 'You are writing a competitive analysis comparing Vesu (Starknet) to Aave v3 (Arbitrum). You have Vesu\'s supply APY (5.4%) but not Aave v3\'s current rate. What should you do?',
      options: [
        'A. Use Vesu\'s 5.4% and state "Vesu has higher yields than Aave v3" using the assumption that Aave is lower',
        'B. Use an old Aave v3 APY from memory (approximately 3%) and note it is approximate',
        'C. Pause the Competitive Analysis section, collect Aave v3\'s current APY from DefiLlama or Aave\'s app, use both numbers with sources and dates, or explicitly note "Aave v3 Arbitrum current data not collected — comparison limited to TVL only"',
        'D. Skip the cross-chain comparison and only compare Vesu to Nostra',
      ],
      correct: 2,
      hint: 'What is the professional standard when you do not have the data needed for a specific comparison?',
      explanation: 'C is correct. The professional standard is: collect the data, or explicitly acknowledge the gap. Option A is cherry-picking — using your own protocol\'s data while leaving a blank for the competitor is a comparison manipulation technique. Option B introduces an uncited, potentially wrong number, which is worse than having no number. Option D avoids the problem by reducing the scope — acceptable if you note the limitation, but cross-chain comparisons are required in professional research. The correct approach: spend 5 minutes on DefiLlama or Aave\'s app to get the current Aave v3 Arbitrum USDC supply APY, note the collection date, and use both numbers. If you genuinely cannot access the data, state the limitation explicitly.',
    },
    {
      question: 'An analyst\'s investment thesis concludes: "We are bullish on this protocol and recommend a position." What is missing from this conclusion?',
      options: [
        'A. Nothing — bullish recommendation is clear enough',
        'B. Three things: a specific position size recommendation (% of portfolio), a time horizon, and a falsifiability condition (what specific outcome would cause the analyst to reverse the thesis)',
        'C. A list of all the protocol\'s positive features to support the bullish view',
        'D. Comparison to the S&P 500 performance',
      ],
      correct: 1,
      hint: 'Review the four elements of a professional investment thesis. Which three are missing from "we are bullish and recommend a position"?',
      explanation: 'B is correct. A professional investment thesis requires four elements: bull case, bear case, position recommendation (specific: "3-7% of a Starknet DeFi portfolio"), and falsifiability condition ("this thesis is falsified if X happens"). "We are bullish and recommend a position" provides none of these with any actionable specificity. It is the research equivalent of a weather forecast that says "it might be different tomorrow." Without a specific position size, the reader cannot calibrate how much to invest. Without a time horizon, the reader cannot plan. Without a falsifiability condition, the thesis cannot be updated or reversed — it becomes a permanent opinion rather than a working hypothesis.',
    },
    {
      question: 'A researcher holds 10,000 STRK tokens and publishes a bullish research report on Starknet ecosystem protocols. What must appear in the report, and what is the consequence of omitting it?',
      options: [
        'A. Nothing special — holding tokens does not affect the analysis',
        'B. The researcher must disclose their STRK holding in the Disclosure section. Omission constitutes a conflict of interest failure that, if discovered, will destroy the report\'s credibility and the researcher\'s reputation',
        'C. The researcher should not publish bullish research if they hold the token — it is always biased',
        'D. The disclosure only matters if the holding is worth more than $10,000',
      ],
      correct: 1,
      hint: 'What is the disclosure standard in professional financial research?',
      explanation: 'B is correct. The professional standard is full disclosure of any financial interest that could create a conflict of interest — regardless of size. The disclosure does not invalidate the analysis. Many excellent research reports are written by analysts who hold the token — the reader deserves to know this so they can weight the analysis accordingly. The consequence of omission: if a reader later discovers the analyst held STRK while writing bullish STRK ecosystem research without disclosing it, they will question every conclusion in every report the analyst has ever written. Professional credibility is a one-time asset — you build it over years and lose it in a moment. Disclosure is the mechanism that preserves it.',
    },
  ],

  lessonSimulations: [
    {
      type: 'sandbox-research-writer',
      scenario: 'Write the Executive Summary and Risk Assessment sections for a research report on Nostra Finance, a Starknet lending and stablecoin protocol. Use what you know about Nostra from the course and supplement with any available data. Executive Summary: follow the four-mandatory-component structure (what + one metric + competitive position + primary risk). Risk Assessment: cover all four categories (smart contract, market/liquidity, regulatory, ecosystem dependency). Rate each risk LOW/MEDIUM/HIGH with one-sentence justification.',
      sections: ['executive-summary', 'risk-assessment'],
      scoringCriteria: [
        'Executive Summary includes: what Nostra does (one specific sentence, not a category description)',
        'Executive Summary includes: one specific metric with a number and implied source',
        'Executive Summary includes: competitive position relative to Vesu or Starknet lending overall',
        'Executive Summary includes: primary risk identified specifically (not "market risk" generically)',
        'Risk Assessment covers all four categories: smart contract, market/liquidity, regulatory, ecosystem dependency',
        'Each risk category includes a LOW/MEDIUM/HIGH rating with justification',
        'Ecosystem dependency specifically mentions oracle dependency (Pragma) and its implication',
        'No marketing language in the risk section — all claims are analytical',
      ],
    },
    {
      type: 'judgment-dataInterpret',
      scenario: 'You are reviewing a peer\'s research report section. The "Protocol Analysis" section contains these three sentences:\n\n1. "Ekubo is revolutionising the Starknet DEX landscape with its innovative concentrated liquidity design."\n2. "TVL is approximately $82M as of last month."\n3. "We believe Ekubo will continue to dominate Starknet trading."\n\nIdentify every specific professional standard violation in these three sentences and state how each should be corrected.',
      scoringCriteria: [
        'Sentence 1 violation: "revolutionising" and "innovative" are marketing language. Correction: replace with a specific technical claim — e.g. "Ekubo uses a tick-spacing concentrated liquidity model with 1 basis point increments"',
        'Sentence 2 violation: "approximately" and "last month" lack precision. Correction: state the exact number with the exact collection date — e.g. "$82M TVL as of [specific date], source: DefiLlama"',
        'Sentence 3 violation: "We believe Ekubo will continue to dominate" is an opinion claim that belongs in the Investment Thesis section, not the Protocol Analysis section. Protocol Analysis contains only verifiable data, no opinions',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'Write a complete Investment Thesis section for Pragma Network (Starknet\'s primary oracle). Your thesis should cover: bull case with specific catalysts, bear case with specific scenarios, a position recommendation with size and time horizon, and a falsifiability condition. Note: Pragma does not currently have a publicly tradable token — your thesis should address whether and how an investor gains exposure to Pragma\'s success, and what conditions would create a direct investment opportunity.',
      scoringCriteria: [
        'Bull case includes: at least two specific catalysts with named conditions that would trigger them (not general statements like "ecosystem grows")',
        'Bull case addresses the exposure mechanism: how does an investor benefit from Pragma success today given no public token?',
        'Bear case includes: at least one specific scenario that would damage Pragma\'s position (e.g. Starknet protocols building alternative oracle aggregation)',
        'Position recommendation is specific: exposure mechanism stated (indirect via protocols that use Pragma, or direct investment if token launches), conditions for entry, time horizon',
        'Falsifiability condition is measurable: specific metric and threshold that would cause thesis reversal',
      ],
    },
  ],
};

export const LAB6_LESSON_6_META = {
  labId: 'ecosystem-intermediate-lab-6',
  lessonNumber: 6,
  title: 'Structuring a Professional DeFi Research Report',
  type: 'A',
  estimatedMinutes: 35,
  unlocks: 'Lab 6 Lesson 7 — Citation Standards and Conflict Disclosure',
  prerequisite: 'Lab 6 Lesson 5 — The Research Workflow',
  simulatorTypes: ['sandbox-research-writer', 'judgment-dataInterpret', 'judgment-communication'],
};
