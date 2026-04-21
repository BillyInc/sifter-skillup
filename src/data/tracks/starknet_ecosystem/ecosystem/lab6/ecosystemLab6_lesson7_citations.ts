// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// INTERMEDIATE · LAB 6 — L6.7
// Citation Standards and Conflict Disclosure
// TYPE A — Dominant concept: a research report is only as credible as
// its citations — citing correctly is not bureaucracy, it is the mechanism
// by which your reader can verify every claim you make
// ─────────────────────────────────────────────────────────────

export const LAB6_LESSON_7 = {
  id: 'l6-7-citations-conflict-disclosure',
  title: 'Citation Standards and Conflict Disclosure',
  trackType: 'A',
  lessonNumber: 7,

  previousLessonRef: `L6.6 taught the six-section professional research report structure: Executive Summary → Protocol Analysis → Risk Assessment → Competitive Analysis → Investment Thesis → Disclosure and Methodology. Each section has a specific purpose and non-negotiable content requirements. In this lesson we zoom into the Disclosure and Methodology section — specifically how to cite on-chain data correctly and how to disclose conflicts of interest with professional precision.`,

  hook: `In August 2024, a well-known DeFi researcher published a detailed report on a lending protocol. The report had strong analysis, good formatting, and a clear thesis. But in the methodology section, the data source was listed as "various sources including DefiLlama and on-chain data."

A week later, a reader noticed that the TVL figure in the report was $18M higher than what DefiLlama showed on the cited date. The researcher had used DefiLlama data from two different pages — one showing all chains, one showing only Starknet — and combined them without noticing the overlap.

When challenged, the researcher could not explain the discrepancy because the original citation did not include a URL, an access date, or the specific endpoint used. There was no trail to follow.

The report was retracted.

A citation is a link. It connects your claim to its evidence. A broken link does not just weaken one claim — it breaks the chain of trust for everything else you have published.`,

  explanation: `
In DeFi research, you work with two categories of data: on-chain data (pulled directly from the blockchain) and sourced data (aggregated by third parties like DefiLlama or CoinGecko). Each category requires different citation standards.

PART 1 — CITING ON-CHAIN DATA

On-chain data is data you collect directly from the blockchain, typically through:
— A Dune Analytics query you wrote yourself
— A block explorer (Voyager, Starkscan)
— A direct RPC call to a Starknet node
— An Apibara stream you are running

ON-CHAIN CITATION FORMAT

Every on-chain data citation must contain five elements:

1. DATA SOURCE TYPE: "On-chain data, Starknet Mainnet" or "On-chain data, Starknet Sepolia"
2. ACCESS METHOD: How you retrieved it. "Dune Analytics query", "Voyager block explorer", "Direct RPC call via Blast API"
3. QUERY OR ENDPOINT: For Dune: the query URL or query ID. For RPC: the specific method called. For Voyager: the contract address and function queried.
4. TIMESTAMP: The exact date and block number you queried at. "As of 2025-11-15, block #1,247,391"
5. REPRODUCIBILITY NOTE: How a reader can reproduce your query. "Query available at [Dune URL]" or "Call starknet_call with entry_point: 0x02e4263... at block 1,247,391"

EXAMPLE — CORRECT ON-CHAIN CITATION:
"Daily unique wallets executing swaps on AVNU: 285 (30-day average).
Source: On-chain data, Starknet Mainnet, Dune Analytics.
Query: decoded_starknet.avnu_exchange_evt_swap, COUNT(DISTINCT taker_address) grouped by DATE_TRUNC('day', block_time), averaged over 30-day window ending 2025-11-15, block #1,247,391.
Query reproducible at: dune.com/queries/[your_query_id]."

EXAMPLE — INCORRECT ON-CHAIN CITATION:
"AVNU has about 285 daily users (on-chain data, accessed recently)."

What is wrong: "about" introduces vagueness into a precise number. "Recently" cannot be verified. There is no query trail. A reader cannot confirm this number independently.

WHY BLOCK NUMBER MATTERS

On-chain data changes with every block. A figure that was true at block 1,247,391 may not be true at block 1,247,500. When you include the block number in your citation, you are making a specific claim: "this is what was true at this exact moment in the blockchain's history." This moment is immutable — anyone who queries the same block will get the same answer. Block numbers are the closest thing to a universal timestamp in blockchain research.

THE PROBLEM OF DECIMAL PRECISION

When you read a raw on-chain value, you must apply the correct decimal conversion before citing it. STRK has 18 decimal places. USDC has 6. A raw value of 285,000,000 from a USDC transfer event is not $285M — it is $285.

Always state the raw value AND the decimal-adjusted interpretation in your methodology note:
"Raw: 285,000,000 (6 decimal places). Adjusted: $285 USDC."

Omitting the decimal context is a common error that has caused research to be embarrassingly wrong.

PART 2 — CITING SOURCED DATA

Sourced data is data you collected from a third-party service that aggregated it from on-chain or off-chain sources. Examples:
— TVL data from DefiLlama
— Token price data from CoinGecko or CoinMarketCap
— Transaction counts from Starknet network statistics dashboards
— Fee revenue data from Token Terminal

SOURCED DATA CITATION FORMAT

1. PROVIDER NAME AND SPECIFIC PAGE: Not just "DefiLlama" — "DefiLlama, Protocol: Vesu, All Chains, TVL chart"
2. URL: The exact URL you were on when you recorded the data
3. ACCESS DATE: The specific date you accessed it — because dashboards change
4. SNAPSHOT DESCRIPTION: What the chart or table showed at that moment
5. METHODOLOGY NOTE IF KNOWN: If DefiLlama uses a specific TVL calculation methodology (e.g., counting only certain token types), note this

EXAMPLE — CORRECT SOURCED CITATION:
"Vesu TVL: $45.2M as of 2025-11-15.
Source: DefiLlama, Protocol page: defillama.com/protocol/vesu.
All chains, all asset types, denominated in USD.
Accessed 2025-11-15 at 14:23 UTC. Note: DefiLlama TVL includes supplied assets net of borrowed amounts for lending protocols."

EXAMPLE — INCORRECT SOURCED CITATION:
"TVL is $45M (DefiLlama)."

What is wrong: No URL, no access date, no description of which chart or filter was used. DefiLlama has multiple TVL views (all chains, single chain, net TVL, gross TVL) that give different numbers. "DefiLlama" alone does not tell the reader which one.

THE THREE SOURCES OF CITATION FAILURE

Failure Type 1 — Mixing methodologies without noting it:
You cite DefiLlama for Vesu TVL and Dune for Nostra TVL in the same comparison. But DefiLlama and Dune measure TVL differently. DefiLlama may include borrowed amounts in its TVL calculation that Dune excludes. Your comparison is apples to oranges — and if you do not acknowledge this, a reader who notices will discredit your entire report.

Correct approach: use the same data source for both sides of any comparison. If you must use different sources, explicitly acknowledge the methodology difference and the direction of bias it introduces.

Failure Type 2 — Snapshots vs averages:
You cite "AVNU daily volume: $18M" without stating whether this is today's number, yesterday's number, or a 30-day average. A single day's volume can be 10× the average during a liquidity incentive event. A 30-day average is a more stable representation but includes incentive-period distortions.

Correct approach: always state the period. "AVNU 30-day average daily volume: $18M (2025-10-16 to 2025-11-15, source: Dune query #[ID])."

Failure Type 3 — Outdated citations:
You cite a figure that was true in March but publish in November. In DeFi, TVL, user counts, and APYs can change by 50% in a month. A 6-month-old citation is not just stale — it may actively mislead a reader who is making a current decision.

Correct approach: for any claim that requires current data, the citation must be from within the past 30 days. If it is older, state the date explicitly and note: "This figure may have changed significantly since collection."

PART 3 — CONFLICT OF INTEREST DISCLOSURE

A conflict of interest exists when you have a financial or personal relationship with the subject of your research that could influence your conclusions — or could reasonably appear to do so.

Conflicts in DeFi research include:

FINANCIAL CONFLICTS:
— You hold the protocol's governance token
— You are an LP in the protocol's pools
— You have deposited capital in the protocol
— A fund or entity you are affiliated with holds a position
— You have received tokens, grants, or compensation from the protocol team

NON-FINANCIAL CONFLICTS:
— You know the protocol founders personally
— You previously worked for the protocol team
— You are a competitor researcher (your employer may benefit from a negative report)
— You publicly endorsed the protocol before conducting this research

THE DISCLOSURE STANDARD

Professional financial research follows a simple rule: disclose anything that a reasonable person would want to know before deciding whether to rely on your analysis.

This does not mean a conflict invalidates your research. Some of the best research in DeFi is produced by researchers who hold positions in the protocols they cover — because their depth of knowledge comes from genuine engagement. What matters is transparency.

DISCLOSURE FORMAT

A professional conflict disclosure contains:
— Whether you hold any financial position in the protocol or its token
— Whether you received any compensation from the protocol
— Whether you have any professional relationship with the protocol team
— When you last updated your position disclosure (positions change)
— A standard disclaimer that this is not financial advice

EXAMPLE — COMPLETE CONFLICT DISCLOSURE:

"Disclosure (as of 2025-11-15):
The author holds 12,000 STRK tokens (approximately $4,800 at publication price). The author has no direct position in Vesu's governance token or protocol pools. No compensation was received from Vesu, their team, or any entity affiliated with Vesu for this report. The author is employed by [Fund Name], which holds no position in Vesu as of this disclosure date.

This report is independent research and does not constitute financial advice. Readers should conduct their own due diligence before making investment decisions. Protocol parameters, TVL, and market conditions may have changed since data collection.

Data collected: 2025-11-14 to 2025-11-15. Analysis completed: 2025-11-15."

WHAT "NOT FINANCIAL ADVICE" ACTUALLY MEANS

The phrase "not financial advice" (NFA) is standard in DeFi research, but using it does not eliminate your professional responsibility. The standard means: you are stating your analysis and conclusion, but you are not providing personalised advice to a specific individual's financial situation. A reader should read your thesis, not copy your trade.

Using NFA in a disclosure also does not indemnify you from providing materially false information. If your report contains fabricated data or deliberately misleading analysis, NFA disclaimer does not protect you from consequences.

THE PRACTICAL STANDARD

When in doubt about whether to disclose something: disclose it. The cost of over-disclosing is zero — readers appreciate transparency. The cost of under-disclosing is your entire research credibility, potentially permanently.

Professional analysts in traditional finance are required by regulation to disclose all conflicts. DeFi research does not have equivalent regulatory requirements yet — but the same trust dynamics apply. The analysts whose work is repeatedly cited are those who are known to disclose fully and cite precisely.

BUILDING A CITATION HABIT

The easiest way to maintain citation discipline is to record citations as you collect data — not after you have finished writing. Keep a research log:

Date | Data type | Source | URL | Query/method | Value recorded | Block/snapshot | Notes

When you write the report, you pull citations directly from this log. You never have to reconstruct where a number came from because you recorded it when you had it.

A citation is not an afterthought. It is the foundation that makes your analysis trustworthy.
  `.trim(),

  keyTakeaway: `On-chain data citations must include: data type, access method, query or endpoint, block number and timestamp, and reproducibility instructions. Sourced data citations must include: provider name and specific page, URL, access date, snapshot description, and methodology notes. Conflict disclosure must include: all financial positions in the protocol, all compensation received, professional relationships, and a standard NFA disclaimer. The rule: cite it when you collect it, disclose it when you have it.`,

  visualPrompt: `Two side-by-side citation templates. Left panel: "ON-CHAIN CITATION TEMPLATE" — five numbered lines with fill-in fields: (1) Source type: "On-chain data, [network]", (2) Access method: "[Dune/Voyager/RPC]", (3) Query/Endpoint: "[query URL or method name]", (4) Timestamp: "[YYYY-MM-DD], block #[number]", (5) Reproducibility: "Query at [URL] / Call [method] at block [N]". Right panel: "SOURCED DATA CITATION TEMPLATE" — five numbered lines: (1) Provider: "[DefiLlama/CoinGecko] — [specific page name]", (2) URL: "[exact URL]", (3) Access date: "[YYYY-MM-DD] at [HH:MM UTC]", (4) Snapshot: "[what the chart showed]", (5) Methodology: "[how provider calculates this metric]". Below both: a red "COMMON FAILURE" box listing the three failure types. Colour scheme: blue for on-chain panel, amber for sourced data panel.`,
  visualType: 'static',
  visualUrl: 'citation-template-dual-panel',

  examples: [
    {
      contextTag: '[Decimal precision error in research]',
      context: 'A researcher publishes a report stating "Ekubo processed $18 billion in monthly trading volume." The actual figure from Dune was $18M. The error: the researcher read a raw on-chain value of 18,000,000,000,000,000,000,000 (18 × 10^21) and applied 6 decimal places (USDC precision) instead of 18 decimal places (STRK precision).',
      scenario: 'The published report was shared widely on Twitter and cited in two other research pieces before the error was caught. The researcher had written: "Source: Dune Analytics, Ekubo volume data" with no query link, no block number, and no raw value documentation. When another researcher queried the same data, they got $18M — 1,000 times less than the reported figure.',
      outcome: 'The researcher issued a correction, but the report had already been shared 800 times with the incorrect figure. Three months later, the incorrect $18B figure still appeared in aggregated ecosystem metrics on a crypto data site that had scraped the original report. The citation failure — no raw value, no decimal documentation, no query link — meant the error was undetectable until someone independently queried the same data. A citation with the raw value (18,000... = 18M at 18 decimal places) would have caught the error before publication.',
    },
    {
      contextTag: '[Methodology mixing creating false comparison]',
      context: 'A researcher compares Vesu and Nostra TVL: "Vesu: $45M TVL (DefiLlama), Nostra: $23M TVL (Dune)." The comparison implies Vesu is 2× larger.',
      scenario: 'A careful reader checks both sources. DefiLlama counts supplied assets minus borrowed amounts (net TVL). The Dune query the researcher used counts only supplied assets (gross TVL) for Nostra. Applying the same gross methodology to both: Vesu gross TVL is $78M, Nostra gross TVL is $23M — Vesu is actually 3.4× larger, not 2×. The published comparison understated Vesu\'s dominance by 70% because the researcher mixed methodologies without noting it.',
      outcome: 'The researcher should have either: (1) used the same source (DefiLlama) for both protocols, or (2) explicitly noted: "These figures use different methodologies — DefiLlama net TVL for Vesu vs Dune gross TVL for Nostra. For a true comparison, apply the same methodology: Vesu net TVL [X], Nostra net TVL [Y]." Mixing without noting is not just an academic problem — it led to a materially incorrect market share assessment that influenced at least two subsequent research reports.',
    },
    {
      contextTag: '[Conflict disclosure preventing credibility damage]',
      context: 'A researcher publishes a bearish research report on a Starknet lending protocol, identifying risks in its oracle design. The researcher holds 50,000 tokens of a competing protocol.',
      scenario: 'Two days after publication, someone posts on Twitter: "This researcher holds [competing_protocol] tokens — they benefit financially if this report causes capital to leave [protocol being criticized] and flow to their competitor." If the researcher had not disclosed the competing position, this accusation would destroy the report\'s credibility.',
      outcome: 'Because the researcher disclosed upfront: "The author holds 50,000 [CompetingProtocol] tokens (approximately $15,000 at publication). The author has no direct position in [AnalysedProtocol]." — the response was: "Disclosed conflict. The analysis stands independently. Readers can weigh this accordingly." The research remained credible because the potential conflict was visible, not hidden. Disclosure is not an admission of bias — it is evidence of integrity.',
    },
  ],

  guidedPractice: [
    {
      question: 'You run a Dune Analytics query and find: Vesu deposit events show 45,000,000,000 in raw value (u256). The deposit token is USDC. What is the correct citation and adjusted value?',
      options: [
        'A. $45B USDC — cite as "Dune Analytics, Vesu deposits"',
        'B. $45,000 USDC — cite as "Dune Analytics, Vesu deposits, raw value 45,000,000,000 / 10^6 = $45,000" with query URL and block number',
        'C. $45M USDC — cite as "Dune Analytics, Vesu data"',
        'D. $45 USDC — cite as "On-chain"',
      ],
      correct: 1,
      hint: 'USDC has 6 decimal places. What is 45,000,000,000 divided by 10^6?',
      explanation: 'B is correct. USDC has 6 decimal places. 45,000,000,000 / 10^6 = $45,000 USDC. The citation must include: the raw value (45,000,000,000), the decimal conversion (÷ 10^6), the result ($45,000), the query URL, and the block number. This is the reproducibility standard. Without the raw value documentation, a reader who checks your work and gets a different number cannot tell whether you made a decimal error or they did. Option A (÷ 10^0) and C (÷ 10^3) and D (÷ 10^9) are all wrong decimal conversions that would slip through without raw value documentation.',
    },
    {
      question: 'You need to compare Ekubo daily volume (from Dune) to Uniswap v3 daily volume on Arbitrum (from DefiLlama). These two sources measure "volume" differently — Dune counts on-chain event amounts, DefiLlama uses a proprietary aggregation that may include off-chain orders. What is the correct approach?',
      options: [
        'A. Use both sources as-is and list them side by side — the reader can figure out the difference',
        'B. Use only one source for both protocols, OR explicitly note the methodology difference in your report and state the direction of bias it may introduce',
        'C. The comparison is impossible — do not attempt it',
        'D. Use Dune for both and estimate Uniswap v3 from the raw on-chain data',
      ],
      correct: 1,
      hint: 'What is the professional standard when two sides of a comparison use different methodologies?',
      explanation: 'B is correct. There are two legitimate approaches: use the same data source for both (ideally Dune for both, though getting clean Uniswap v3 on-chain data requires a separate query), or explicitly acknowledge the methodology difference and its directional bias. For example: "Ekubo volume from Dune (on-chain events, may undercount if some volume is via off-chain routes); Uniswap v3 volume from DefiLlama (proprietary aggregation). DefiLlama typically counts 5-10% more volume than raw on-chain events for Uniswap due to off-chain order matching. This comparison should be interpreted directionally, not as a precise figure." Option A (presenting without noting) is the classic mixing-methodologies failure. Option C abandons the comparison unnecessarily. Option D is correct in principle but DefiLlama may be more current and accessible for Uniswap data.',
    },
    {
      question: 'Your research report was written in September. You cite: "Starknet TVL: $1.2B (DefiLlama, September)." You publish in November. What should you do before publishing?',
      options: [
        'A. Nothing — the September figure is accurate as of when you wrote it',
        'B. Recheck the TVL and update the figure if it has changed significantly, or explicitly note "TVL as of September 2025 — readers should verify current figure" and explain why you cannot update (e.g., you are citing a specific historical date for a before/after comparison)',
        'C. Change the citation date to November without rechecking the data',
        'D. Remove the TVL figure since it is now outdated',
      ],
      correct: 1,
      hint: 'DeFi TVL can change by 50% in two months. What is the responsibility of a researcher publishing data-sensitive claims?',
      explanation: 'B is correct. If you are publishing in November and the report was written in September, the September TVL is 2 months stale. You have two legitimate options: (1) Update the figure to current data — access DefiLlama, get the current TVL, update the citation with the new date. (2) Explicitly preserve the September figure if it is needed for historical comparison (e.g., "TVL was $1.2B in September 2025, compared to $[current figure] in November 2025 — a change of $X / X%"). Option C (changing the date without updating the data) is fabrication. Option A (publishing stale data without acknowledgment) misleads readers who will assume the figure is current. Option D wastes a relevant data point.',
    },
    {
      question: 'You are writing a bullish report on a Starknet protocol. You hold 8,000 of its governance tokens (worth $2,400). You also hold 50,000 STRK (worth $19,000). Which of the following is the correct disclosure?',
      options: [
        'A. "The author holds no financial position in the analysed protocol." (STRK is not a position in that specific protocol)',
        'B. "The author holds 8,000 [Protocol] governance tokens (approximately $2,400) and 50,000 STRK (approximately $19,000). No compensation was received from the protocol team."',
        'C. "The author holds [Protocol] tokens" — no amounts needed',
        'D. No disclosure needed since the position is small',
      ],
      correct: 1,
      hint: 'What must a conflict disclosure contain, and what is the standard for what to include?',
      explanation: 'B is correct. The disclosure must include: all financial positions related to the subject of research, the approximate value at publication, and explicit statement of whether compensation was received. Option A is technically incorrect — you do hold the protocol\'s governance token, which is a direct financial position in the entity you are writing about. Stating "no position" when you hold the token is a material misrepresentation. STRK is also relevant to disclose because your report is about a Starknet protocol — a bullish Starknet report benefits your STRK holdings. Option C omits amounts, which is insufficient. Option D applies no threshold — even a $1 position creates a technical conflict and should be disclosed.',
    },
    {
      question: 'A research peer argues: "On-chain data from Dune is objective — it is directly from the blockchain, so I do not need to include a query link or methodology note." What is wrong with this argument?',
      options: [
        'A. Nothing — on-chain data is indeed objective and requires no citation methodology',
        'B. On-chain data is objective in the raw form, but your query (what you counted, how you filtered, which decimal conversion you applied, which time window you used) is not. Two researchers querying the same blockchain for "Ekubo daily volume" with different query logic will get different answers. The query is what must be citable and reproducible.',
        'C. Dune Analytics is not reliable enough to cite',
        'D. Only off-chain data requires methodology notes',
      ],
      correct: 1,
      hint: 'What is the difference between the raw blockchain data and the query you run against it?',
      explanation: 'B is correct. The blockchain is objective — every event and transaction is immutable and verifiable. But the act of querying the blockchain involves choices that affect the result: which contract addresses to include, whether to count unique wallets or total transactions, how to convert decimal values, what time window to use, how to handle duplicate events, whether to include failed transactions. Two researchers using Dune to measure "AVNU daily volume" can get answers that differ by 20% because of different query logic. The citation must include the query so a reader can (1) reproduce your result and (2) identify any query logic that might bias the output. The blockchain is objective; the analyst\'s query is not.',
    },
  ],

  lessonSimulations: [
    {
      type: 'judgment-dataInterpret',
      scenario: 'You collected the following data for a research report. Write the correct citation for each data point:\n\n1. You queried Dune and found: Nostra borrow events total raw value 12,500,000,000,000 (USDC, 6 decimals). Query run on block #1,301,445, date 2025-11-20. Your Dune query ID is 4287651.\n\n2. You found Nostra TVL on DefiLlama at defillama.com/protocol/nostra-finance showing $28.4M on their "Starknet Only" filter, accessed 2025-11-20 at 16:30 UTC.\n\n3. You hold 5,000 STRK tokens personally.\n\nFor each: (1) write the citation, (2) state the adjusted value for data points 1 and 2, (3) write the disclosure statement for item 3.',
      scoringCriteria: [
        'Data point 1 citation: includes raw value (12,500,000,000,000), decimal conversion (÷ 10^6 = $12,500,000,000 — wait, that is $12.5B which is suspicious. Actually: 12,500,000,000,000 / 10^6 = $12,500,000 = $12.5M), block number (#1,301,445), date (2025-11-20), Dune query ID (4287651)',
        'Data point 1 adjusted value: $12,500,000 / 10^6 = $12.5M USDC total borrows. Note: this is a running total of all borrow events, not current outstanding borrows — must clarify in methodology',
        'Data point 2 citation: includes URL (defillama.com/protocol/nostra-finance), filter applied (Starknet Only), access date and time (2025-11-20 at 16:30 UTC), value ($28.4M)',
        'Data point 2 methodology note: states that DefiLlama shows this as net TVL or gross TVL (needs to be verified from their methodology) and that Starknet Only filter was applied',
        'Disclosure: states 5,000 STRK held with approximate value, explicitly states no direct position in Nostra protocol itself',
      ],
    },
    {
      type: 'judgment-communication',
      scenario: 'You are peer-reviewing a research report on Ekubo. The methodology section states:\n\n"Data sources: DefiLlama for TVL, Dune for volume, CoinGecko for token price. On-chain data verified. Report written November 2025."\n\nIdentify every specific professional citation failure in this methodology section and write a corrected version that meets the citation standards from this lesson.',
      scoringCriteria: [
        'Identifies failure 1: "DefiLlama for TVL" lacks URL, access date, which specific page/filter, and whether TVL is net or gross',
        'Identifies failure 2: "Dune for volume" lacks query ID/URL, block number, time window (daily/weekly/30-day), and decimal conversion documentation',
        'Identifies failure 3: "CoinGecko for token price" lacks which price (open/close/average), which date, and URL',
        'Identifies failure 4: "On-chain data verified" is meaningless without specifying what was verified, against what, and by what method',
        'Corrected version includes: specific URLs for each source, access dates, filter/query descriptions, block numbers for on-chain data, time windows for aggregated metrics',
      ],
    },
    {
      type: 'sandbox-research-writer',
      scenario: 'Write the complete Disclosure and Methodology section for a research report on Vesu with the following details: You collected data on 2025-11-14. You hold 2,000 Vesu governance tokens worth $800. You have no affiliation with the team. TVL data from DefiLlama, volume data from your Dune query ID 3847291 at block #1,247,391. Write the section in full professional format.',
      sections: ['investment-thesis'],
      scoringCriteria: [
        'Disclosure explicitly states 2,000 Vesu governance tokens held with dollar value (~$800)',
        'Disclosure explicitly states no compensation received from Vesu or affiliated entities',
        'Methodology states data collection date (2025-11-14) not just month',
        'Methodology includes Dune query ID (3847291) and block number (#1,247,391)',
        'Methodology includes DefiLlama citation with enough specificity to reproduce',
        'Standard NFA disclaimer present',
      ],
    },
  ],
};

export const LAB6_LESSON_7_META = {
  labId: 'ecosystem-intermediate-lab-6',
  lessonNumber: 7,
  title: 'Citation Standards and Conflict Disclosure',
  type: 'A',
  estimatedMinutes: 30,
  unlocks: 'Lab 6 Aggregate Simulations',
  prerequisite: 'Lab 6 Lesson 6 — Structuring a Professional Research Report',
  simulatorTypes: ['judgment-dataInterpret', 'judgment-communication', 'sandbox-research-writer'],
  note: 'Final lesson of Lab 6. After this lesson, users proceed to 15 Aggregate Simulations drawn from all 7 lessons, then the Build Task (full research report on Ekubo or Vesu), then Boss Battle Phase 1 and Phase 2.',
};
