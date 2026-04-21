// ============================================================================
// DeFi RESEARCH CURRICULUM — SECTION 1: FOUNDATIONS (Part B2, Lessons 13–16)
// Lessons: first-dashboard-token-terminal → defi-landscape-map
// ============================================================================

export const defiFoundationsPartB2 = {
  id: 'defi-foundations-b2',
  lessons: [

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.13 — TOKEN TERMINAL
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'first-dashboard-token-terminal',
      title: `1.13 Token Terminal — Treating DeFi Like a Business`,
      subtitle: `TVL tells you where the money is. Token Terminal tells you if the protocol makes money.`,
      difficulty: 'foundation',
      previousLessonRef: `In L1.12 you learned DeFiLlama tracks TVL — deposits. Token Terminal is the complement: it tracks revenue — what protocols actually earn. Together they give you the complete financial picture.`,

      hook: `A protocol with $5B TVL and $0 revenue is a money-losing startup. One with $200M TVL and $50M annual revenue is a profitable business. Token Terminal is how you tell them apart in 60 seconds.`,

      visualPrompt: `Two dashboards side by side: DeFiLlama (bar chart showing TVL over time, large numbers) and Token Terminal (line charts showing Fees and Revenue, P/S ratio visible). Caption: "DeFiLlama = how much is deposited. Token Terminal = how much is earned. You need both."`,

      explanation: `Let me tell you about the second tool every researcher masters.

[Maria] knew [TVL] from [DeFiLlama]. But she wanted more: how much money do these protocols actually MAKE?

Her mentor said: "That's where [Token Terminal] comes in. It treats [DeFi] protocols like public companies."

**The three metrics that matter:**

**[Protocol Fees]** — total fees paid by users to use the protocol. This is gross revenue — the total economic activity flowing through it.

Examples: swap fees paid to Uniswap's liquidity pools, interest paid by Aave borrowers, trading fees paid to GMX.

**[Protocol Revenue]** — the portion of fees that goes to the protocol itself (treasury or token holders) — NOT to liquidity providers or users.

This is the critical distinction most beginners miss:
- Uniswap: $500M fees/year, $0 protocol revenue (100% to LPs, none to UNI holders currently)
- GMX: $120M fees/year, $84M protocol revenue (70% to stakers, 30% to treasury)

UNI holders receive nothing from Uniswap's massive fee generation. GMX stakers receive real ETH cash flows. Same "DeFi protocol" framing — completely different value capture.

**[P/S Ratio (Price-to-Sales)]** — token market cap divided by annualized protocol revenue. DeFi's version of a stock's P/E ratio.

P/S = 10 means investors pay $10 for every $1 of annual revenue. Lower P/S = cheaper (potentially undervalued). Higher P/S = expensive (must justify with growth or moat).

**[DAU (Daily Active Users)]** — unique wallets interacting per day. More meaningful than TVL for usage-based protocols. Growing DAU = organic adoption.

**Why fees ≠ revenue matters for token holders:**

This is the most important concept in protocol token valuation:

- If fees go 100% to LPs → token has zero direct cash flow backing
- If fees go 30% to treasury → some cash flow, rest to service providers
- If fees go 70% to stakers → strong cash flow backing for token holders

Always check Token Terminal before buying any governance token. Ask: "Does holding this token give me any claim on the protocol's revenue?"

**The research workflow:**
1. Search any protocol on tokenterminal.com
2. Check 30d and 90d revenue trends (growing or falling?)
3. Calculate Revenue/TVL from DeFiLlama data (capital efficiency)
4. Compare P/S to category peers (is it cheap or expensive vs similar protocols?)
5. Check DAU trend — growing users confirm genuine adoption`,

      examples: [
        {
          title: `Uniswap vs GMX — same word "fees," completely different outcomes`,
          scenario: `Token Terminal data: Uniswap V3 generates ~$600M in annual fees. All of it goes to liquidity providers. UNI token holders receive $0 directly. UNI's value is speculative — based on the "fee switch" thesis (if Uniswap governance votes to take a cut, UNI holders would receive revenue). GMX generates ~$120M in annual fees. 70% ($84M) goes directly to GMX stakers in ETH. P/S for GMX at $600M market cap: 600/84 = 7.1x. UNI's effective P/S: infinite (zero revenue to holders). This is why GMX pioneered "real yield" — it was one of the first protocols to actually distribute protocol revenue to token holders in ETH, not in its own token.`,
          lesson: `Protocol fees and protocol revenue are completely different. Never confuse "this protocol generates fees" with "this token gives you a claim on those fees." Always check Token Terminal.`,
        },
        {
          title: `Capital efficiency — revenue per dollar of TVL`,
          scenario: `Protocol A: $5B TVL (DeFiLlama), $20M annual revenue (Token Terminal). Revenue/TVL = 0.4%. Protocol B: $300M TVL, $18M annual revenue. Revenue/TVL = 6%. Protocol B generates 15x more revenue per dollar of locked capital. TVL headline looks better for Protocol A — but Protocol B has real product-market fit. Its TVL is "working" — each dollar deposited is generating meaningful economic activity. Protocol A's TVL is mostly idle, likely incentive-driven capital that will leave when rewards end.`,
          lesson: `Revenue/TVL = capital efficiency. High efficiency = users are actually using the protocol, not just parking capital for rewards. Low efficiency = mercenary capital, often a house of cards.`,
        },
        {
          title: `Revenue trend as a leading indicator`,
          scenario: `Maria tracks a lending protocol monthly on Token Terminal: Jan $2.1M → Feb $1.8M → Mar $1.5M → Apr $1.1M. Revenue declining consistently. Cross-reference DeFiLlama: TVL stable at $800M throughout. Conclusion: deposits are stable, but fewer people are borrowing (lower utilization from L1.8 = lower interest paid = lower revenue). This signals: bear market entering, or a competitor is pulling borrowers away. She reduces her position in the governance token before the market prices in the declining revenue.`,
          lesson: `Declining revenue with stable TVL = utilization dropping = product weakness or market cooling. Revenue trend is a leading indicator. Price often follows 3-6 months later.`,
        },
      ],

      guidedPractice: [
        {
          question: `What does Token Terminal show that DeFiLlama doesn't?`,
          options: [
            `A) TVL history`,
            `B) Revenue and P/S ratios — financial metrics showing how much protocols actually earn and at what valuation`,
            `C) Number of users by country`,
            `D) Real-time gas prices`,
          ],
          correct: `B) Revenue and P/S ratios — financial metrics showing how much protocols actually earn and at what valuation`,
          hint: `DeFiLlama = deposits. Token Terminal = income statement. What does the income statement show?`,
          explanation: `DeFiLlama focuses on TVL (the balance sheet). Token Terminal adds the income statement layer: fees paid by users, revenue captured by the protocol, P/S valuation multiple, DAU. Together they give a complete financial picture of any protocol.`,
        },
        {
          question: `Protocol A: $100M annual fees, $0 protocol revenue. Protocol B: $20M annual fees, $14M protocol revenue. Which is more valuable to token holders?`,
          options: [
            `A) Protocol A — 5x more fees means more activity`,
            `B) Protocol B — token holders actually receive $14M in cash flows; Protocol A gives token holders nothing directly`,
            `C) Equal — fees and revenue are the same thing`,
            `D) Depends on which chain they're on`,
          ],
          correct: `B) Protocol B — token holders actually receive $14M in cash flows; Protocol A gives token holders nothing directly`,
          hint: `Protocol A's $100M in fees goes entirely to LPs. Who gets Protocol B's $14M revenue?`,
          explanation: `Protocol A's fees go 100% to service providers (LPs) — token holders receive nothing. Protocol B distributes $14M to token holders via staking rewards or buybacks. From a fundamental token valuation perspective, Protocol B's token has direct cash flow backing. Protocol A's token value is entirely speculative — betting that a future fee switch will be turned on.`,
        },
        {
          question: `Connecting to L1.10 (yield): if a protocol has $30M annual revenue and distributes 80% to stakers, what is the maximum sustainable real yield for a $500M staking pool?`,
          options: [`A) 6% APY`, `B) 4.8% APY`, `C) 30% APY`, `D) 2.4% APY`],
          correct: `B) 4.8% APY`,
          hint: `Distributed = $30M × 80% = $24M. Pool = $500M. Yield = $24M / $500M.`,
          explanation: `$30M × 80% = $24M distributed to stakers annually. $24M / $500M staked = 4.8% APY. This is the maximum real yield at current revenue — the true floor if no token emissions are added. Connecting to L1.10: this is real yield (from actual protocol revenue), not inflationary. If the protocol advertises 12% APY, the extra 7.2% must come from token emissions — and will deflate as tokens are minted.`,
        },
        {
          question: `A protocol's P/S ratio is 4x. Its closest competitor's P/S is 35x. Both have similar growth rates and risk profiles. What does this suggest?`,
          options: [
            `A) The 4x protocol is much riskier`,
            `B) The 4x protocol may be undervalued relative to its revenue — a potential opportunity worth investigating`,
            `C) The 35x protocol generates more revenue`,
            `D) P/S ratio doesn't apply to DeFi`,
          ],
          correct: `B) The 4x protocol may be undervalued relative to its revenue — a potential opportunity worth investigating`,
          hint: `Lower P/S = paying less per dollar of revenue. If risk and growth are similar, which is cheaper?`,
          explanation: `P/S 4x = market values the protocol at 4x annual revenue. P/S 35x = 35x annual revenue. With similar growth and risk, the 4x protocol is dramatically cheaper on a revenue basis. But investigate why the discount exists — it could be justified (worse product, legal risk, technical debt) or genuinely overlooked. The P/S comparison surfaces the question; research answers it.`,
        },
        {
          question: `Protocol revenue drops 40% over 3 months. TVL stays constant. Using L1.8 (lending) knowledge, what is the most likely explanation?`,
          options: [
            `A) An exploit drained protocol funds`,
            `B) Utilization rate dropped — fewer users are borrowing despite the same deposits, generating less interest income`,
            `C) The team changed fee structures`,
            `D) TVL data is incorrect`,
          ],
          correct: `B) Utilization rate dropped — fewer users are borrowing despite the same deposits, generating less interest income`,
          hint: `From L1.8: TVL = deposits (supply). Revenue from lending = interest from borrowers (demand). If supply is constant but revenue falls, what changed?`,
          explanation: `In lending protocols, revenue = interest paid by borrowers. If TVL (deposits) stays constant but revenue falls 40%, borrowing demand dropped significantly. Same supply, less demand = lower utilization = lower rates = lower revenue. This is classic early bear market behavior: leverage demand drops before depositors exit. Revenue trend often leads TVL trend by 1-3 months.`,
        },
        {
          question: `Combining L1.12 (DeFiLlama) and L1.13: a protocol shows $4B TVL on DeFiLlama but only 1,500 DAU on Token Terminal. What does this extreme discrepancy reveal?`,
          options: [
            `A) The protocol is very popular with a small community`,
            `B) Very few users control most of the TVL — likely whale-dominated, team-owned, or heavily incentivized capital that is fragile and will exit when rewards end`,
            `C) DAU is always much lower than TVL`,
            `D) The protocol recently launched and users haven't discovered it yet`,
          ],
          correct: `B) Very few users control most of the TVL — likely whale-dominated, team-owned, or heavily incentivized capital that is fragile and will exit when rewards end`,
          hint: `$4B TVL / 1,500 DAU = $2.67M per user. Does that suggest organic retail adoption?`,
          explanation: `$2.67M average per user is extreme. Compare to Uniswap: ~$5B TVL / 200K DAU = $25K average — much more distributed. The 1,500 DAU scenario screams: team-owned TVL, a few whales farming incentives, or a protocol that bootstrapped TVL artificially. When incentives end, those 1,500 wallets will withdraw the $4B simultaneously. Never mistake TVL concentration for health.`,
        },
      ],

      lessonSimulations: [
        {
          type: `financial-comparison`,
          scenario: `Compare three protocols using Token Terminal + DeFiLlama data (research live or use these approximations):

Uniswap: $600M annual fees, $0 protocol revenue, $4B market cap, 500K DAU, $5B TVL
Curve: $80M annual fees, $40M protocol revenue, $400M market cap, 80K DAU, $4B TVL
GMX: $120M annual fees, $84M protocol revenue, $600M market cap, 15K DAU, $500M TVL

For each: (A) P/S ratio, (B) Revenue/TVL (capital efficiency), (C) Fee-to-revenue conversion rate, (D) Who actually benefits from holding the token?`,
          answer: {
            Uniswap: `P/S: undefined/infinite ($0 revenue). Capital efficiency: 0% (revenue to protocol). Fee conversion: 0% to token holders. Token benefit: speculative fee switch only.`,
            Curve: `P/S: $400M / $40M = 10x. Capital efficiency: $40M / $4B TVL = 1%. Fee conversion: 50%. Token benefit: veCRV holders earn 50% of protocol fees directly in stablecoins.`,
            GMX: `P/S: $600M / $84M = 7.1x. Capital efficiency: $84M / $500M TVL = 16.8% (excellent). Fee conversion: 70%. Token benefit: GMX stakers earn ETH directly from trading fees.`,
            conclusion: `For fundamental token value: GMX and Curve distribute real revenue. Uniswap is purely speculative. GMX at 7.1x P/S with 16.8% capital efficiency is the most "value-like" — but GMX has lower DAU and TVL, meaning more concentration risk. Curve has 10x P/S and the influential veCRV governance system. Uniswap dominates volume but offers no fundamental token value currently.`,
          },
        },
        {
          type: `trend-analysis`,
          scenario: `Jake tracks a lending protocol for 5 weeks on Token Terminal:
W1: $9M revenue, TVL $1.5B (DeFiLlama)
W2: $10.5M revenue, TVL $1.7B
W3: $9.8M revenue, TVL $1.9B
W4: $8.2M revenue, TVL $2.0B
W5: $7.1M revenue, TVL $2.1B

Revenue is falling while TVL is rising. What's happening and what should Jake do?`,
          answer: `Pattern: TVL growing (new deposits arriving) but revenue falling (borrowers leaving or utilization dropping). Revenue/TVL ratio: W1 = 0.6%, W5 = 0.34% — utilization declining significantly. Likely cause: incentive program attracting deposits while borrowing demand is softening. The "mercenary capital" thesis — deposits are arriving for rewards, not for genuine use. When rewards end, TVL will drop. What Jake should do: (1) check if there's an active incentive program ending soon, (2) monitor utilization rate directly, (3) if holding the governance token, consider reducing position — declining revenue with rising TVL is a bearish fundamental signal.`,
        },
        {
          type: `live-research`,
          scenario: `Open tokenterminal.com. Search Aave. Extract: 30-day fees, 30-day revenue, DAU (if available). Then open defillama.com to get Aave's current TVL. Calculate: Revenue/TVL, P/S ratio (use Aave's current market cap from CoinGecko). Compare to Morpho (same category). Which has better capital efficiency? Which offers better value to token holders?`,
          answer: `Live research task. Expected format: "Aave: $Xm 30d fees, $Ym 30d revenue, $Zb TVL, $Wm market cap. Revenue/TVL = Y/Z%. P/S = W/Y*12. Morpho: smaller TVL, potentially higher capital efficiency as newer protocol. Token Terminal comparison: Morpho has been distributing fees to MORPHO stakers since [date] while Aave's revenue to AAVE holders is indirect (Safety Module). Conclusion: Morpho may show higher capital efficiency despite smaller TVL due to focused design and direct revenue distribution."`,
        },
      ],

      bossMode: {
        title: `Boss Battle: DeFiLlama + Token Terminal Full Protocol Scorecard`,
        description: `Combining L1.12 (DeFiLlama) + L1.13 (Token Terminal) + L1.10 (yield) + L1.11 (risks). Build a complete investment-grade protocol analysis.`,
        challenges: [
          {
            scenario: `Pick any DeFi protocol. Using BOTH DeFiLlama and Token Terminal, produce a one-page protocol scorecard covering: TVL + trend (DeFiLlama), Fees + Revenue + trend (Token Terminal), P/S ratio, Capital efficiency (Revenue/TVL), DAU trend, Risk score from L1.11 checklist, Yield type from L1.10, and a Buy/Hold/Avoid recommendation with price reasoning.`,
            answer: `Example with Compound V3: TVL $2.1B (+8% 30d, DeFiLlama). Fees $3.2M/month, Revenue $640K/month (20% take rate, Token Terminal). P/S: $640K × 12 = $7.68M annual revenue. Market cap $420M. P/S = 55x — expensive. Capital efficiency: $7.68M / $2.1B = 0.37% — low. DAU: 8K stable. Risk score: A- (audited, established, conservative). Yield type: real (lending interest). Recommendation: Hold at current P/S. At 55x, the market is pricing in significant growth that current metrics don't support. A lower P/S entry point (20-25x) would be more compelling. Not a sell (safe, real yield) but not a buy at current valuation.`,
          },
          {
            scenario: `You have $10,000 to allocate across two protocols in the same category (both are DEXs). Protocol X: $1B TVL, $30M annual fees, $0 protocol revenue, P/S = N/A, growing 15%/month. Protocol Y: $200M TVL, $8M annual fees, $5.6M protocol revenue (70%), P/S = 5x (at $28M market cap), growing 8%/month. How do you split the $10,000 and why — using both DeFiLlama and Token Terminal metrics?`,
            answer: `Analysis: Protocol X has 3.7x more fees but zero revenue to token holders. Its value is entirely speculative. Protocol Y at P/S 5x with 70% fee distribution is cheap on fundamentals — $5.6M real yield backing a $28M market cap. Growth: X grows faster (15% vs 8%/month). Risk: X likely has higher emission incentives driving TVL growth (check). Allocation: 70% Protocol Y ($7,000) + 30% Protocol X ($3,000). Reasoning: Protocol Y is the core holding — cheap P/S, real yield, real revenue. Protocol X is the growth bet — if growth continues and they add revenue capture, upside is larger. Never put 100% in speculative no-revenue protocol regardless of growth rate.`,
          },
        ],
      },

      keyTakeaway: `Token Terminal is your DeFi income statement. Key distinctions: protocol fees (gross activity) vs protocol revenue (what token holders actually capture). P/S ratio measures valuation. Revenue/TVL measures capital efficiency. Always check: does holding this token give you any claim on protocol revenue? If no → token value is speculative. If yes → calculate the yield and compare to the P/S.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.14 — READING A PROTOCOL PAGE
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'reading-a-protocol-page',
      title: `1.14 Reading a Protocol Page — Five Numbers, Complete Picture`,
      subtitle: `TVL, Volume, Fees, Revenue, Users. Five numbers that tell everything about a protocol. Here's exactly how to read them.`,
      difficulty: 'foundation',
      previousLessonRef: `In L1.12 you learned TVL from DeFiLlama. In L1.13 you learned fees and revenue from Token Terminal. This lesson combines both into one unified framework — the five-number read you'll use on every protocol, every time.`,

      hook: `"$1B TVL, $100M daily volume, $300K daily fees, $100K daily revenue, 50K users." Can you instantly tell if this is healthy, growing, or dying? After this lesson: yes — in 90 seconds.`,

      visualPrompt: `A protocol dashboard with five metrics, each color-coded: TVL (blue bar chart, trend arrow), Volume (green line, high frequency), Fees (gold, smaller than volume), Revenue (purple, fraction of fees), Users/DAU (orange, separate panel). Arrows show the relationships between metrics. Caption: "Five numbers. One complete health snapshot. Know what each tells you — and what it hides."`,

      explanation: `Let me tell you about [Maria]'s first deep dive.

[Maria] had [DeFiLlama] and [Token Terminal] open. She saw a protocol with big numbers. But what did they all mean together?

TVL: $1B · Volume: $100M/day · Fees: $300K/day · Revenue: $100K/day · Users: 50,000

Her mentor said: "Each number tells a different story. Together they tell the complete story."

**Metric 1: TVL** (from DeFiLlama)
Total deposits. The balance sheet. A snapshot of trust and capital committed.
Healthy: growing steadily, no sudden drops. Red flag: rapid decline or concentrated (few whales).

**Metric 2: Volume**
[Volume] — the total dollar value of transactions processed. For DEXes: swap volume. For lending: borrow origination volume.

[Capital efficiency ratio] = Volume / TVL (daily). How hard is each deposited dollar working?
- Active DEX (Uniswap): 15-30% daily turnover
- Passive DEX (low traffic): 0.5-2% daily
- Active lending: 5-15% utilization change daily
Low efficiency = idle capital = mercenary deposits that will leave.

**Metric 3: Fees**
Total fees paid by users. Gross revenue. For DEXes: swap fees. For lending: borrower interest.
Fee rate check: Fees / Volume = implied fee tier. Does it match what the protocol claims?
Example: $300K fees / $100M volume = 0.3% — matches Uniswap's 0.3% standard pool fee.

**Metric 4: Revenue**
From L1.13: the protocol's share of fees (not LPs' share).
[Take rate] = Revenue / Fees. What % does the protocol itself keep?
Uniswap take rate: 0% (currently). GMX take rate: ~70%. Aave: ~10-15% reserve factor.

**Metric 5: DAU (Daily Active Users)**
Real humans (wallets) using the protocol daily. The most honest metric — hard to fake at scale.
[User growth rate]: Are DAU growing month-over-month? Growing users = expanding product-market fit. Declining users = churn.

**The five-number health framework:**

Healthy protocol = all five growing, fees/revenue consistent with volume, DAU growing.

Warning combinations:
- High TVL + low Volume = dead capital (mercenary or idle)
- Rising Fees + falling DAU = fee hike driving users away
- Growing TVL + falling Revenue = utilization dropping (bear signal)
- High Revenue + low DAU = whale-dominated, fragile
- All five growing = genuine product-market fit`,

      examples: [
        {
          title: `Reading Uniswap — the dominant DEX`,
          scenario: `DeFiLlama + Token Terminal: Uniswap V3. TVL $5B. Volume $1B/day. Fees $3M/day (0.3% average). Revenue $0/day. DAU 200K. Read: Volume/TVL = 20% daily turnover — excellent (the liquidity is being used). Fee rate = $3M/$1B = 0.3% — consistent with stated fees. Take rate = 0% — all fees go to LPs. DAU = 200K — massive organic user base. Verdict: the biggest, most-used DEX by nearly every metric. UNI token has zero fundamental backing from these numbers — but the moat and user base are the thesis.`,
          lesson: `Uniswap is healthy on 4 of 5 metrics. Revenue is the gap. That gap IS the UNI investment thesis debate. Understanding this completely takes less than 2 minutes with the five-number framework.`,
        },
        {
          title: `The dead protocol with impressive TVL`,
          scenario: `Protocol Z: TVL $600M (looks solid). Volume $800K/day. Fees $2,400/day. Revenue $480/day. DAU 180. Read: Volume/TVL = 0.13% — almost nothing is trading. Fee rate = 0.3% — consistent but negligible amounts. Revenue/day = $480 — meaningless. DAU = 180 — 180 wallets hold $600M. Protocol Z TVL is 99% mercenary capital. The real product: a $600M façade with 180 users. When incentives end, the TVL will collapse to reflect the real usage.`,
          lesson: `TVL without volume is a lie. Always check all five. A high TVL + low everything else = incentive farming shell that will implode.`,
        },
        {
          title: `Comparing two lending protocols by capital efficiency`,
          scenario: `Protocol A: TVL $3B, Fees $4.5M/day (from borrowers), Revenue $675K/day (15% take), DAU 22K. Protocol B: TVL $3B, Fees $900K/day, Revenue $450K/day (50% take), DAU 9K. Same TVL — different everything else. Protocol A: higher utilization (more borrowers), lower take rate. Protocol B: lower utilization, higher take rate (but still less absolute revenue: $450K vs $675K). For lenders: Protocol A is better — more borrower demand = higher supply APY. For token holders: Protocol A also wins in absolute revenue ($675K vs $450K) despite the lower take rate.`,
          lesson: `Same TVL can hide completely different business models. Protocol A has real product-market fit in lending. Protocol B may be optimizing for fee capture on smaller usage.`,
        },
      ],

      guidedPractice: [
        {
          question: `What does Volume measure for a DEX, and how is it different from TVL?`,
          options: [
            `A) Volume = total tokens deposited; TVL = daily swaps`,
            `B) Volume = total dollar value of swaps processed; TVL = total deposits. Volume shows activity, TVL shows capital committed`,
            `C) They measure the same thing with different names`,
            `D) Volume only counts completed trades; TVL counts pending`,
          ],
          correct: `B) Volume = total dollar value of swaps processed; TVL = total deposits. Volume shows activity, TVL shows capital committed`,
          hint: `TVL is the bank balance. Volume is the number of transactions run through the bank per day.`,
          explanation: `TVL = all deposits in pools (the "bank balance"). Volume = all swaps executed using those pools (the "transactions"). High TVL + low volume = money parked but not used. High volume relative to TVL = capital working efficiently.`,
        },
        {
          question: `A DEX has $2B TVL and $6M daily volume. Capital efficiency = 0.3%/day. Is this healthy?`,
          options: [
            `A) Yes — 0.3% daily is standard`,
            `B) No — 0.3% daily indicates almost no trading activity relative to deposits; active DEXes see 15-30%`,
            `C) Can't tell without knowing the fee rate`,
            `D) Healthy for stablecoin-only pools`,
          ],
          correct: `B) No — 0.3% daily indicates almost no trading activity relative to deposits; active DEXes see 15-30%`,
          hint: `Compare to an active DEX: Uniswap generates ~$1B daily volume on $5B TVL = 20%. How does 0.3% compare?`,
          explanation: `0.3% daily turnover means $2B of deposited capital generates only $6M in trades per day. Over a year that's 109% annual turnover — sounds okay until you realize Uniswap turns over 7,300% annually (20% × 365). The TVL is almost entirely idle, likely earning emission rewards without generating real trading fees. When rewards end, those deposits have no reason to stay.`,
        },
        {
          question: `Protocol fees are $500K/day. Protocol revenue is $25K/day. What is the take rate, and what does it tell you?`,
          options: [
            `A) 5% take rate — protocol keeps 5% of fees, rest goes to LPs/users`,
            `B) 95% take rate — protocol is very extractive`,
            `C) 2% take rate — standard for all protocols`,
            `D) Can't calculate without knowing TVL`,
          ],
          correct: `A) 5% take rate — protocol keeps 5% of fees, rest goes to LPs/users`,
          hint: `Take rate = Revenue / Fees = $25K / $500K = 5%.`,
          explanation: `5% take rate means for every $100 in user fees, $5 goes to the protocol and $95 goes to LPs or depositors. This is relatively standard for lending protocols (Aave's reserve factor is 10-15%). The take rate tells you how much of the economic activity the token holders capture — critical for fundamental token valuation.`,
        },
        {
          question: `Combining L1.12 and L1.14: DAU drops 30% while TVL stays flat. What are the two most likely explanations?`,
          options: [
            `A) User growth is pausing and TVL will drop next`,
            `B) Either: (1) small users left while large users/whales stayed (concentration increasing), or (2) a competing protocol pulled away retail users while TVL stays due to slower-moving institutional deposits`,
            `C) The data tools are reporting incorrectly`,
            `D) Lower DAU always means the protocol is failing`,
          ],
          correct: `B) Either: (1) small users left while large users/whales stayed (concentration increasing), or (2) a competing protocol pulled away retail users while TVL stays due to slower-moving institutional deposits`,
          hint: `TVL and DAU can diverge because large wallets move TVL; small wallets move DAU. What does it mean when they disconnect?`,
          explanation: `When DAU falls but TVL holds: large capital stays while retail leaves. This could mean retail is moving to a competitor (bad — product losing ground), or retail used the protocol for specific incentives that ended while institutional capital (slower-moving) stays. Research which: check if a competitor's DAU grew during the same period, and check if there was an incentive program that ended.`,
        },
        {
          question: `Protocol reports: TVL +20%, Volume +40%, Fees +40%, Revenue +40%, DAU +35%. Is this the ideal profile?`,
          options: [
            `A) No — revenue should always exceed TVL growth`,
            `B) Yes — all five metrics growing with volume/fees/revenue growing faster than TVL indicates improving capital efficiency and genuine organic growth`,
            `C) No — DAU should grow faster than TVL`,
            `D) Depends on which chain the protocol is on`,
          ],
          correct: `B) Yes — all five metrics growing with volume/fees/revenue growing faster than TVL indicates improving capital efficiency and genuine organic growth`,
          hint: `What does it mean when volume and fees grow faster than TVL?`,
          explanation: `This is the ideal profile: TVL +20% (deposits growing), but volume/fees/revenue +40% (capital efficiency improving — each deposited dollar generating more activity). DAU +35% shows broad user adoption, not just whale activity. All five metrics growing with efficiency improving = genuine product-market fit. This is what healthy DeFi protocol growth looks like.`,
        },
      ],

      lessonSimulations: [
        {
          type: `five-number-scorecard`,
          scenario: `Score these three fictional protocols on each of the five metrics (A-F grade each):

Protocol Alpha: TVL $400M (+25%/mo), Volume $200M/day, Fees $600K/day, Revenue $0, DAU 45K (+20%/mo)
Protocol Beta: TVL $80M (-8%/mo), Volume $160M/day, Fees $480K/day, Revenue $240K/day, DAU 22K (flat)
Protocol Gamma: TVL $1.5B (flat), Volume $15M/day, Fees $45K/day, Revenue $22K/day, DAU 2.5K (declining)`,
          answer: {
            Alpha: `TVL: A (fast growth). Volume: A (50% daily turnover — exceptional). Fees: A (proportional to volume). Revenue: F (nothing for token holders). DAU: A (growing). Verdict: excellent DEX product, zero token value. Best for: LPs. Worst for: governance token holders.`,
            Beta: `TVL: D (declining). Volume: A (200% daily turnover of TVL — extraordinary — means the small TVL is working very hard). Fees: A. Revenue: B (50% take rate, $240K/day is substantial for size). DAU: C (flat, not growing). Verdict: losing TVL but hyper-efficient usage. Declining TVL might be losing mercenary capital while retaining real users. Most interesting to research further — could be gem or could be structural decline.`,
            Gamma: `TVL: C (stable but large). Volume: F (1% daily turnover — nearly dead). Fees: D. Revenue: D. DAU: F (declining). Verdict: $1.5B TVL sitting almost completely idle with declining users. Classic mercenary capital trap. Will collapse when incentives end. Avoid.`,
            ranking: `Alpha > Beta (for product health) > Gamma. Alpha for LP yield. Beta for token value. Gamma: avoid.`,
          },
        },
        {
          type: `live-research`,
          scenario: `Open defillama.com and tokenterminal.com. Pick a lending protocol you haven't researched before. Extract all five metrics. Calculate: capital efficiency (Volume or utilization / TVL), take rate (Revenue / Fees), DAU trend (compare current to 90 days ago). Write three sentences: one describing the protocol's health, one identifying the biggest strength, one identifying the biggest concern.`,
          answer: `Format expected: "Protocol health: [X] shows [metric trend]. Biggest strength: [highest-performing metric and why it matters]. Biggest concern: [weakest metric or concerning pattern]. Example: 'Morpho shows growing TVL (+15% 30d) with stable DAU (12K). Biggest strength: 18% capital efficiency (Revenue/TVL) — one of the highest in lending. Biggest concern: P/S of 45x means the market is pricing in aggressive growth that hasn't fully arrived yet.'"`,
        },
        {
          type: `scenario-decision`,
          scenario: `Jake is choosing between two lending protocols to deposit $8,000 USDC for 6 months. Using the five-number framework:

Protocol X: TVL $2B (growing), daily fees $3M, revenue $300K (10% take), DAU 18K (growing 5%/mo), 2 years old, audited
Protocol Y: TVL $400M (growing faster, +30%/mo), daily fees $2.4M, revenue $1.2M (50% take), DAU 12K (growing 15%/mo), 8 months old, audited

Which would you choose for $8,000 and why?`,
          answer: `Analysis: Protocol Y has better capital efficiency ($2.4M fees / $400M TVL = 0.6% daily vs $3M / $2B = 0.15%), better take rate (50% vs 10%), faster DAU growth (15% vs 5%). But: 8 months old vs 2 years is a meaningful difference in battle-testing (L1.11). For $8,000 with a 6-month horizon: Protocol X. Reasoning: (1) 2 years battle-tested with no incidents > 8 months, (2) the extra revenue efficiency of Y doesn't change the deposit APY you earn as a lender (that's set by borrower demand, not the take rate), (3) for 6 months, you want reliability not maximum upside. Protocol Y is the more interesting research subject — consider adding a small position (10%) to track it while holding the bulk in X.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Complete Protocol Report Card`,
        description: `Using L1.12–L1.14 (all five metrics) + L1.10 (yield) + L1.11 (risks). Build a complete report card for any protocol.`,
        challenges: [
          {
            scenario: `Compare Curve Finance and Uniswap V3 using all five metrics from DeFiLlama + Token Terminal. Then answer: (A) Which is better for LPs? (B) Which is better for governance token holders? (C) Which has the stronger competitive moat? (D) Which would you allocate capital to today and why?`,
            answer: `Curve vs Uniswap: TVL roughly similar ($3-5B each, check live). Volume: Uniswap wins (higher general token volume). Uniswap: 0% take rate (all fees to LPs — better for LPs). Curve: ~50% take rate to veCRV holders — better for token holders. Moat: Uniswap = general DEX dominance and developer ecosystem. Curve = stablecoin/LST DEX specialization + the entire veCRV bribe economy. Allocation: (A) LPs → Uniswap V3 concentrated positions (higher potential APY). (B) Token holders → Curve veCRV (direct revenue distribution). (C) Moat → depends on thesis: general vs specialized. (D) Personal call based on market view — neither is "wrong," they serve different purposes.`,
          },
          {
            scenario: `Protocol Q has: TVL $800M (stable 6 months), Volume $40M/day, Fees $120K/day, Revenue $60K/day, DAU 8K (declining from 12K peak 3 months ago). Use all five metrics to write a 3-sentence bear thesis and a 3-sentence bull thesis.`,
            answer: `Bear thesis: DAU has declined 33% from peak (12K → 8K) indicating user churn — potentially losing to competitors. Capital efficiency at 5% daily is moderate and declining with lower DAU. If this trend continues, revenue will follow users downward, and at a P/S of [calculate live], any multiple compression would be painful. Bull thesis: TVL is stable despite DAU decline — suggesting remaining users are larger, more committed capital. Revenue/TVL is improving (60K / $800M is higher than average for the category). Lower DAU might reflect a transition from retail farming to institutional users who transact less frequently but with larger amounts.`,
          },
        ],
      },

      keyTakeaway: `Five metrics tell the complete protocol story: TVL (capital committed), Volume (activity), Fees (gross revenue), Revenue (protocol capture), Users/DAU (adoption breadth). Healthy = all five growing with Volume/TVL efficiency improving. Red flags: TVL high + Volume low (idle capital), DAU falling (churn), Revenue falling with stable TVL (utilization dropping). Read all five — TVL alone is always incomplete.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.15 — PRACTICE: COMPARE 3 PROTOCOLS
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'practice-compare-3-protocols',
      title: `1.15 Practice Session — Uniswap, Curve, and Aave Side by Side`,
      subtitle: `Three protocols. Three business models. One framework. This is where research becomes instinct.`,
      difficulty: 'foundation',
      previousLessonRef: `This is your first live practice session — applying everything from L1.1–L1.14 to three real protocols you will encounter constantly. Open DeFiLlama and Token Terminal as you go through this lesson.`,

      hook: `Uniswap, Curve, and Aave. If you can analyze all three confidently — explaining their primitives, yield types, risks, and metrics — you can analyze almost any DeFi protocol that exists.`,

      visualPrompt: `Three analysis cards side by side. Uniswap (blue header, "General DEX," x*y=k formula visible). Curve (orange header, "Stablecoin DEX," StableSwap label). Aave (purple header, "Lending," interest rate curve). Each card shows TVL, volume/utilization, fee structure, and risk level. Caption: "Three protocols. Three primitives. Three risk profiles. One framework."`,

      explanation: `Now it's your turn.

[Maria]'s mentor gave her an assignment: compare [Uniswap], [Curve], and [Aave] using what you've learned. Three different protocols. Three different purposes.

Your job: understand what makes each unique.

**Uniswap — The General DEX**

What it does: swap any [ERC-20] token against any other. Uses the constant product formula (x × y = k from L1.7). V3 introduced concentrated liquidity — LPs set price ranges and earn more fees within range but face more [impermanent loss].

Business model: LPs earn 0.01%–1% of each swap. Protocol earns 0% currently (fee switch not activated). UNI token value = speculative bet on future fee switch.

Who uses it: anyone swapping tokens anywhere. Dominant general-purpose DEX by volume.

From L1.14: Volume/TVL ~20% daily (excellent). Take rate: 0% (zero fundamental token value currently).

**Curve — The Stablecoin Specialist**

What it does: optimized AMM for swapping assets that should have near-equal value (USDC/USDT, stETH/ETH). Uses the [StableSwap formula] — different math from Uniswap that minimizes slippage for correlated pairs.

Business model: LPs earn swap fees. CRV emissions incentivize specific pools. veCRV holders earn 50% of all protocol fees directly. This created the "Curve Wars" — protocols bribe veCRV holders to direct CRV emissions to their pools.

[veCRV] — vote-escrowed CRV. Lock CRV for up to 4 years → receive veCRV. veCRV earns protocol fees AND votes on which pools get CRV emissions. The longer you lock, the more veCRV you receive.

Why it's different from Uniswap: try swapping $10M USDC for USDT on Uniswap's 0.01% pool vs Curve's 3pool. Curve's specialized math gives you dramatically less slippage on correlated assets.

**Aave — The Lending Standard**

What it does: deposit tokens to earn interest. Borrow tokens against overcollateralized positions. Covered fully in L1.8.

Business model: borrowers pay interest → lenders receive most of it → Aave protocol keeps a reserve factor (10-15%). AAVE Safety Module stakers earn protocol emissions + can receive reserve factor allocation.

From L1.11 (risks): Aave is among the safest protocols — 3+ years, 20+ audits, $5B+ TVL, 24h timelock. The gold standard for DeFi security.

| Metric | Uniswap | Curve | Aave |
|--------|---------|-------|------|
| Type | General DEX | Stable DEX | Lending |
| Formula | x × y = k | StableSwap | Interest rate model |
| Best for | Any token swap | Stable/correlated pairs | Earn/borrow |
| LP yield source | Swap fees (real) | Fees + CRV (mixed) | Lending interest (real) |
| Token value | Speculative | veCRV earns fees | Governance + Safety |
| Main risk | Impermanent loss | IL (low for stables) | Liquidation cascade |`,

      examples: [
        {
          title: `Why Curve dominates stablecoin swaps`,
          scenario: `Marcus wants to swap $1M USDC for USDT. On Uniswap V3's best USDC/USDT pool: slippage ~0.01% (concentrated liquidity helps). On Curve's 3pool: slippage ~0.002% — 5x better. For a $1M swap that's $100 vs $20 in price impact. For institutional volume ($100M+): Curve saves $8,000+ per swap. This is why 90%+ of large stablecoin swaps route through Curve — the specialized math genuinely outperforms Uniswap for this specific use case.`,
          lesson: `AMM design is optimized for specific use cases. x × y = k is general. StableSwap is specialized for correlated assets. Using the wrong AMM costs real money at scale.`,
        },
        {
          title: `The Curve Wars — why governance is economically powerful`,
          scenario: `Frax Finance wants deep liquidity for their FRAX stablecoin on Curve. Deep liquidity = low slippage = users prefer FRAX. To attract Curve LPs, they need CRV emissions directed to the FRAX pool. CRV emissions are directed by veCRV vote. Solution: accumulate veCRV (or bribe veCRV holders via Votium). Protocols spent hundreds of millions bribing veCRV holders. Convex Finance built a veCRV accumulation engine and became a power broker. The entire economy grew around who controlled Curve's emissions. This is DeFi governance as economic warfare.`,
          lesson: `Governance tokens aren't just for voting on temperature checks. When governance controls the flow of billions in liquidity incentives, those votes are worth real money. Understanding this is how you understand the "Curve Wars" thesis entirely.`,
        },
        {
          title: `Aave vs Uniswap — different primitives, completely different risks`,
          scenario: `Sarah has $10,000. On Uniswap V3 ETH/USDC concentrated position at ±10% range: earns ~15% APY in fees. Risk: if ETH moves outside her range, she earns nothing and suffers impermanent loss until price returns. On Aave USDC supply: earns 5% APY from lending interest. Risk: smart contract bug, borrower defaults beyond collateral (extremely rare). Same $10,000. Completely different risk profiles. Neither is "better" — it depends on her market view and time availability (Uniswap V3 requires active range management; Aave doesn't).`,
          lesson: `Different primitives = different risks = different management requirements. Comparing them requires comparing the full picture, not just APY.`,
        },
      ],

      guidedPractice: [
        {
          question: `Why does Curve give less slippage than Uniswap for USDC/USDT swaps?`,
          options: [
            `A) Curve has more TVL than Uniswap for stable pairs`,
            `B) Curve uses a different mathematical formula (StableSwap) specifically designed for assets that should trade at near-equal prices, minimizing price movement during trades`,
            `C) Curve charges lower fees`,
            `D) Curve uses a centralized order book for stable pairs`,
          ],
          correct: `B) Curve uses a different mathematical formula (StableSwap) specifically designed for assets that should trade at near-equal prices, minimizing price movement during trades`,
          hint: `From L1.7: Uniswap uses x × y = k. Curve uses StableSwap. Why would different math matter for USDC/USDT?`,
          explanation: `Uniswap's x × y = k assumes prices can vary widely — so it starts moving price immediately when you trade. For USDC/USDT (which should always be $1 each), that price movement is wasteful. Curve's StableSwap formula is flat near the 1:1 price point, only moving price significantly for very large trades. Result: dramatically less slippage for same-value asset swaps.`,
        },
        {
          question: `Sarah provides liquidity to Uniswap. Marcus deposits USDC on Aave. Both risk "losing value." What are the different mechanisms?`,
          options: [
            `A) Both face liquidation risk from borrowers`,
            `B) Sarah faces impermanent loss (her LP value vs just holding); Marcus faces smart contract risk and the small chance of bad debt if borrowers aren't liquidated in time`,
            `C) Both face the same risks`,
            `D) Marcus faces impermanent loss; Sarah faces liquidation`,
          ],
          correct: `B) Sarah faces impermanent loss (her LP value vs just holding); Marcus faces smart contract risk and the small chance of bad debt if borrowers aren't liquidated in time`,
          hint: `Different primitives = different risk mechanisms. LP risk is about price divergence. Lending risk is about borrower behavior.`,
          explanation: `Impermanent loss (Sarah): when ETH price moves, Uniswap's pool rebalances — she ends up holding more of the cheaper asset. If ETH drops 50%, she holds more ETH than a simple holder would have. Bad debt risk (Marcus): if ETH crashes faster than liquidation bots act, some loans become undercollateralized — lenders absorb the loss (rare on Aave with conservative LTV ratios).`,
        },
        {
          question: `Connecting to L1.10 (yield): which of the three protocols currently offers the most direct real yield to governance token holders?`,
          options: [
            `A) Uniswap — highest trading volume = most fees`,
            `B) Curve — veCRV holders directly receive 50% of all trading fees in stablecoins`,
            `C) Aave — AAVE holders receive all lending interest`,
            `D) All three distribute equal real yield to token holders`,
          ],
          correct: `B) Curve — veCRV holders directly receive 50% of all trading fees in stablecoins`,
          hint: `From L1.13: Token Terminal. Which token holders actually receive cash flows directly from protocol activity?`,
          explanation: `Uniswap: 100% of fees → LPs, 0% → UNI holders (currently). Aave: lending interest → depositors, not specifically AAVE holders (AAVE stakers earn Safety Module emissions, not direct interest). Curve veCRV: directly receives 50% of all Curve trading fees in 3CRV (stablecoins). veCRV is the clearest direct real-yield governance token of the three.`,
        },
        {
          question: `A new user wants to deploy $3,000 for 3 months with minimal active management. Which of the three protocols is most appropriate?`,
          options: [
            `A) Uniswap V3 concentrated liquidity — highest yield potential`,
            `B) Aave USDC supply — stable yield, no active management, withdraw anytime`,
            `C) Curve veCRV locked position — highest long-term yield`,
            `D) All three require equal management`,
          ],
          correct: `B) Aave USDC supply — stable yield, no active management, withdraw anytime`,
          hint: `"Minimal active management" and "3-month timeframe" rules out V3 (needs range management) and veCRV (locked up to 4 years). What's left?`,
          explanation: `Aave USDC: deposit → earn interest automatically → withdraw anytime. Zero active management needed. Uniswap V3 concentrated liquidity: requires monitoring price ranges, repositioning when out of range, claiming fees — incompatible with "minimal management." veCRV: locked positions, wrong time horizon entirely. For $3,000 over 3 months with no babysitting: Aave.`,
        },
        {
          question: `The "Curve Wars" happened because veCRV holders vote on CRV emissions. Why does controlling those votes have economic value worth hundreds of millions?`,
          options: [
            `A) Voting rights are prestigious`,
            `B) CRV emissions are distributed to LPs in pools with the most votes — directing billions in incentive capital that protocols need for deep liquidity and user adoption`,
            `C) veCRV holders can change Curve's trading fees`,
            `D) Voting power controls Curve's treasury`,
          ],
          correct: `B) CRV emissions are distributed to LPs in pools with the most votes — directing billions in incentive capital that protocols need for deep liquidity and user adoption`,
          hint: `What do CRV emissions do for a specific pool? Why would a protocol want their pool to receive more emissions?`,
          explanation: `CRV emissions attract LPs to specific pools → more LPs = deeper liquidity = less slippage = more trades = more protocol revenue. Protocols with stablecoins (Frax, MIM, LUSD) desperately needed deep Curve pools to make their stablecoins viable. Controlling veCRV votes meant controlling which protocols got liquidity → enormous economic power → entire bribe market emerged. Convex Finance built a business around accumulating this voting power.`,
        },
        {
          question: `Connecting to L1.11 (risks): rank Uniswap, Curve, and Aave by overall protocol safety (most to least safe). Justify.`,
          options: [
            `A) Uniswap > Curve > Aave`,
            `B) Aave > Uniswap > Curve`,
            `C) All three are equally safe as top protocols`,
            `D) Curve > Aave > Uniswap`,
          ],
          correct: `B) Aave > Uniswap > Curve`,
          hint: `Consider: years deployed, audit count, TVL stability, governance controls (timelocks), and historical incidents.`,
          explanation: `Aave: 3+ years, 20+ audits, conservative governance with 24h+ timelocks, $5B+ TVL stable for years, zero major exploits. Slight edge in safety. Uniswap: also 4+ years, multiple audits, immutable core contracts (V2 especially), very limited governance attack surface because there's little to steal through governance. Curve: similarly long history but CRV emissions and governance complexity create more attack surface; the 2023 vyper compiler exploit affected Curve pools ($70M). All three are A-tier safe — but Aave and Uniswap's V2 (immutable) edges out Curve slightly.`,
        },
      ],

      lessonSimulations: [
        {
          type: `live-comparison`,
          scenario: `Open DeFiLlama and Token Terminal. For Uniswap, Curve, and Aave:
(1) Record current TVL and 30-day change
(2) Record 30-day fees and revenue (Token Terminal)
(3) Calculate take rate (Revenue/Fees)
(4) Calculate P/S (Market cap from CoinGecko / annualized revenue)
(5) Identify who receives the fees (LPs, token holders, both)
(6) Score each A-D for: LP yield quality, token holder value, protocol safety`,
          answer: `Live research task. Expected approach: Uniswap (TVL ~$5B stable, fees ~$600M/yr, revenue $0, P/S infinite, LPs win, token holders nothing, A for LPs F for token holders). Curve (TVL ~$2-4B, fees ~$80M/yr, revenue ~$40M, P/S ~10x, veCRV holders earn, A- for veCRV, B for LPs). Aave (TVL ~$10B, fees ~$300M/yr, revenue ~$30-50M, P/S depends on AAVE price, depositors earn most, A for depositors, B for stakers). Record actual numbers for your own reference.`,
        },
        {
          type: `portfolio-allocation`,
          scenario: `Priya has $12,000 to learn DeFi by doing. She wants exposure to all three primitives (DEX LP, stablecoin LP, lending), wants real yield (not just emissions), and can check positions twice per week. Design her allocation across Uniswap, Curve, and Aave with specific assets, chains (considering gas from L1.6), and yield source (L1.10).`,
          answer: `Design: $4,000 Aave V3 Arbitrum — USDC supply (~4% real yield, lending interest, zero management, L2 gas savings). $4,000 Curve 3pool on Arbitrum — USDC/USDT/DAI (~3-6% real swap fees, minimal IL on stable pairs, L2 gas). $4,000 Uniswap V3 Arbitrum — ETH/USDC at ±15% range (~10-15% fees if in range, active management needed twice/week). Total: diversified across all three primitives. All on Arbitrum (gas from L1.6). All real yield (L1.10) — Aave from borrowers, Curve from stable swappers, Uniswap from ETH traders. Risk: Uniswap position needs monitoring (L1.11 — IL risk if ETH moves outside range).`,
        },
        {
          type: `scenario-decision`,
          scenario: `The "Curve Wars" thesis: Convex Finance accumulates veCRV to control CRV emissions. Jake wants to participate. He can: (A) buy CRV and lock as veCRV for 4 years, (B) deposit into Convex and receive cvxCRV (liquid, no lockup), (C) just provide liquidity to a Curve pool without any CRV/veCRV. Compare the three approaches for someone with $5,000 and a 12-month horizon.`,
          answer: `Option A (lock CRV as veCRV 4 years): maximum governance power + maximum fee earnings + maximum CRV yield boost. But 4-year lockup is terrible for 12-month horizon — illiquid. Not appropriate. Option B (Convex cvxCRV): similar yield to veCRV, liquid (can exit), slightly less governance power as Convex votes. Much better for 12-month horizon. Appropriate. Option C (just LP without votes): earn base swap fees + some CRV emissions, no governance power, simplest. For beginners: Option C first (understand the base layer), then Option B once you understand the Convex/Curve relationship. Never lock for 4 years until you've been in the ecosystem long enough to be confident.`,
        },
      ],

      bossMode: {
        title: `Boss Battle: Foundation Integration Test`,
        description: `Applying ALL of L1.1–L1.15. This is the first comprehensive test of Section 1 knowledge.`,
        challenges: [
          {
            scenario: `Jake is building a $20,000 DeFi "learning portfolio." Requirements: earn yield while learning, understand all three major primitives, minimize catastrophic loss risk, use L2 for gas efficiency. Design the portfolio: allocations, protocols, chains, assets, yield source for each position, risk assessment, and one specific thing to monitor for each position weekly. Apply L1.1 (what DeFi is) through L1.15 (comparing protocols) in your reasoning.`,
            answer: `Portfolio: $6,000 Aave V3 USDC on Arbitrum — L1.8 lending primitive, 4-5% real yield from borrowers (L1.10), A-tier safety (L1.11), L2 gas (L1.6), non-custodial wallet required (L1.5). Monitor: health factor of any positions you create, supply APY trend. $6,000 Curve 3pool on Arbitrum — L1.7 AMM + L1.9 stablecoins, 3-6% real fees (L1.10), minimal IL (L1.7), low risk (L1.11). Monitor: CRV emission levels, trading volume trend. $5,000 Uniswap V3 ETH/USDC on Arbitrum — L1.7 AMM, concentrated LP, 10-15% fee yield (L1.10, real), higher risk (IL if ETH moves). Monitor: is ETH within your price range? (Check twice/week). $3,000 held as ETH in Ledger hardware wallet — L1.5 cold storage, reserve/learning buffer. Use DeFiLlama (L1.12) to track TVL health of all positions. Use Token Terminal (L1.13) to track revenue trends monthly. Total philosophy: 4 positions, all real yield, all on Arbitrum for gas efficiency, covering lending + stable LP + active LP primitives.`,
          },
          {
            scenario: `You're explaining DeFi to your skeptical parent. They ask: "Why would I use Aave instead of my bank?" Use specific numbers and connect the concepts from L1.1 (DeFi vs TradFi), L1.8 (lending mechanics), L1.9 (stablecoins), and L1.10 (where yield comes from) to give an honest answer — including the risks.`,
            answer: `Honest answer: "Your bank pays 0.5% on savings. Aave currently pays 4-5% on USDC — 8-10x more. Here's why: your bank lends your money at 7-8% and keeps the difference. Aave's smart contract (L1.4) connects you directly to borrowers who pay the interest — no middleman keeping most of the spread. The yield is real (L1.10) — it comes from actual borrowers paying interest, not from new coins being printed. USDC (L1.9) is backed 1:1 by real dollars held by Circle, so your $10,000 stays at $10,000 in value. The risks you should know: (1) Aave's code could have a bug — it's been audited 20+ times over 3 years with zero major exploits, but no code is perfect. (2) If you wanted your money back and there was a bank run (unlikely), you'd have to wait for borrowers to repay. (3) You hold the keys (L1.5) — if you lose your wallet phrase, the money is gone, unlike a bank that can reset your password. For a portion of savings you won't need immediately: the extra 3.5-4.5% is real, the risk is manageable, and you actually own your money rather than trusting a bank."`,
          },
        ],
      },

      keyTakeaway: `Uniswap (general DEX, x×y=k, LPs earn everything), Curve (stablecoin DEX, StableSwap, veCRV earns fees), Aave (lending, interest rate model, depositors earn). Three protocols covering three fundamental primitives. Analyzing all three from memory — primitives, yield type, risks, metrics — is the foundation of DeFi research fluency.`,
    },

    // ─────────────────────────────────────────────────────────────────────
    // LESSON 1.16 — DeFi LANDSCAPE MAP
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'defi-landscape-map',
      title: `1.16 The DeFi Landscape Map — Where Everything Fits`,
      subtitle: `You've learned all the pieces. Now build the complete map — every category, every major protocol, how they all connect.`,
      difficulty: 'foundation',
      previousLessonRef: `This is the capstone of Section 1. You've learned DeFi's building blocks (L1.1–L1.11) and research tools (L1.12–L1.15). Now map the entire ecosystem so you can navigate any part of it instantly.`,

      hook: `A DeFi researcher who can't draw the landscape map is like a geographer who can't draw a world map. After this lesson, you can sketch the full DeFi ecosystem from memory — and know where any new protocol fits the moment you encounter it.`,

      visualPrompt: `A full ecosystem wheel: center circle = base infrastructure (blockchains, oracles). Inner ring = core primitives (DEXs, Lending, Stablecoins, Derivatives). Middle ring = meta-protocols (Yield Aggregators, Liquid Staking, Bridges, Governance). Outer ring = user layers (Research Tools, Wallets, Analytics). Arrows show value flows between layers. Caption: "Every protocol fits somewhere on this map. Learn the map, navigate anything."`,

      explanation: `Now for the real test.

[Maria]'s mentor said: "You've learned the pieces. Now put them together."

Your task: understand the [DeFi] landscape as a complete system — every category, the major protocols in each, and how they connect to each other.

This isn't about memorizing 300 protocol names. It's about understanding the architecture.

**Layer 1: Base Infrastructure**

[Blockchain / Settlement Layer] — the foundation (L1.2). Ethereum, Arbitrum, Optimism, Base, Solana, BNB Chain, Polygon. Everything lives here.

[Oracles] — price feeds that bring real-world data on-chain. [Chainlink] dominates. Without oracles, lending protocols can't value collateral, derivatives can't settle.

**Layer 2: Core Primitives (The "what")**

[DEXes] — token swaps. Uniswap (general), Curve (stable), Balancer (weighted pools), dYdX (derivatives/perps), Orca/Raydium (Solana).

[Lending] — deposit/borrow. Aave, Compound, Morpho, Euler, Kamino (Solana).

[Stablecoins] — price-stable assets (L1.9). USDC (Circle), USDT (Tether), DAI/USDS (MakerDAO), FRAX (Frax Finance), LUSD (Liquity).

[Derivatives] — synthetic exposure, options, perpetuals. dYdX, GMX, Synthetix, Lyra.

**Layer 3: Meta-Protocols (Built on primitives)**

[Yield Aggregators] — automatically optimize yield across lending protocols. Yearn Finance, Beefy Finance, Pendle (yield-stripping).

[Liquid Staking] — stake ETH and receive a liquid token. Lido (stETH), Rocket Pool (rETH), Coinbase (cbETH).

[Bridges] — move assets cross-chain. Across Protocol, Stargate, Wormhole, LayerZero, Circle CCTP.

[Governance / DAOs] — protocol self-governance. Snapshot, Tally, Compound Governor Bravo.

**Layer 4: Research and User Tools**

[Data / Analytics] — DeFiLlama (TVL), Token Terminal (revenue), Dune Analytics (custom queries), Nansen (wallet tracking), Arkham (blockchain intelligence).

[Portfolio Trackers] — DeBank, Zapper.

[Research Tools] — Twitter/X, Messari, The Block.

**How they connect — the value flow map:**

User → DEX or Lending → generates fees → split between LPs/lenders and protocol → protocol revenue → distributed to token holders via governance → governance votes on emissions → emissions flow to yield aggregators → yield aggregators auto-optimize for users → loop.

Bridges → cross-chain movement → enables capital to flow to highest yield → compresses yield differentials across chains.

Oracles → price feeds → enables lending liquidations → enables derivatives settlement → enables synthetic stablecoins.

**The research skill: "Where does it fit?"**

When you encounter any new protocol: (1) which layer? (2) which category? (3) which primitive(s) does it use from L1.3? (4) who are the existing players in that category? (5) what makes it different?

A protocol combining Lending + Yield Aggregation = something like Morpho + Yearn interaction. A protocol combining Stablecoins + Derivatives = something like Synthetix sUSD. Category + differentiation = instant framework for understanding any new project.`,

      examples: [
        {
          title: `Mapping a new protocol instantly`,
          scenario: `Jake sees a new protocol "EigenLayer" announced. His framework: Layer = meta-protocol (built on Ethereum staking). Category = Restaking (new category — extending Ethereum validator security to other protocols). Primitives used = Staking (L1.3) + yield generation mechanism. Who are peers? None yet (it's creating the category). Differentiation = "programmable trust" — using ETH staking to secure other protocols beyond Ethereum itself. Category: Liquid Staking/Restaking layer. This is a new Layer 3 category being created. Framework applied in 60 seconds.`,
          lesson: `The landscape map is a classification system. Every new protocol fits into it — sometimes creating a new sub-category. The faster you classify, the faster you understand.`,
        },
        {
          title: `Following value flows across the map`,
          scenario: `User deposits ETH → Lido mints stETH (Liquid Staking) → user deposits stETH on Aave as collateral (Lending) → borrows USDC → swaps USDC for more stETH on Curve (DEX, stable pair) → deposits new stETH back on Aave. This is a "recursive staking loop" — a common yield strategy. It touches: Liquid Staking → Lending → DEX → Lending again. Each step is a different category on the landscape map. A researcher who understands the map can trace this strategy instantly. One who doesn't gets lost at "what is stETH."`,
          lesson: `Complex DeFi strategies are just chains of simple moves across the landscape. Know the map, understand any strategy.`,
        },
        {
          title: `Using the map for competitive analysis`,
          scenario: `Maria is researching Morpho Blue (lending). Landscape map says: same category as Aave (Lending), Layer 2 (meta-protocol built on existing lending infrastructure). Peers: Aave, Compound, Euler. Differentiation: modular design — anyone can create an isolated lending pool with custom collateral and liquidation parameters. Where does it sit on the map? Challenger to Aave in lending, but with a platform model (others build markets on top). This immediately tells Maria: compare TVL, fees, revenue to Aave. Look for use cases Aave can't serve. That's the research thesis.`,
          lesson: `The landscape map tells you who competes with whom. Competition analysis follows automatically from category placement.`,
        },
      ],

      guidedPractice: [
        {
          question: `What is the purpose of building a DeFi landscape map?`,
          options: [
            `A) To memorize every protocol name`,
            `B) To understand how DeFi categories connect, who leads each, and where any new protocol fits — so you can navigate the entire ecosystem from first principles`,
            `C) To impress people on Twitter`,
            `D) To submit to DeFiLlama for verification`,
          ],
          correct: `B) To understand how DeFi categories connect, who leads each, and where any new protocol fits — so you can navigate the entire ecosystem from first principles`,
          hint: `The map is about relationships, not memorization.`,
          explanation: `The landscape map is a mental model — a framework for instantly categorizing and understanding any new protocol. When you can place something on the map, you immediately know: who the competitors are, which primitives it uses, which risks apply, and which metrics to use for evaluation.`,
        },
        {
          question: `Which category would Lido Finance belong in on the landscape map?`,
          options: [
            `A) DEX — it helps you swap ETH`,
            `B) Liquid Staking — it lets you stake ETH and receive stETH (a liquid, yield-bearing token) in return`,
            `C) Lending — you can borrow against stETH`,
            `D) Stablecoin — stETH maintains a stable value`,
          ],
          correct: `B) Liquid Staking — it lets you stake ETH and receive stETH (a liquid, yield-bearing token) in return`,
          hint: `Lido's core function: take ETH → stake it for Ethereum validator rewards → give you a liquid token representing your staked ETH.`,
          explanation: `Lido is Liquid Staking — Layer 3 meta-protocol. It takes your ETH, stakes it across Ethereum validators, and gives you stETH (liquid, transferable). You can then use stETH on Aave (lending), Curve (DEX), or in yield strategies. Note: you CAN borrow against stETH on Aave — but that's Aave's function, not Lido's.`,
        },
        {
          question: `Connecting to L1.2 (the DeFi stack): oracles are "base infrastructure." Why does everything above them on the stack depend on oracles working correctly?`,
          options: [
            `A) Oracles provide gas for transactions`,
            `B) Oracles bring real-world prices on-chain — without accurate prices, lending protocols can't calculate collateral values, derivatives can't settle, and stablecoins can't maintain pegs`,
            `C) Oracles route transactions to the fastest block`,
            `D) Oracles provide random number generation for DeFi`,
          ],
          correct: `B) Oracles bring real-world prices on-chain — without accurate prices, lending protocols can't calculate collateral values, derivatives can't settle, and stablecoins can't maintain pegs`,
          hint: `From L1.11: oracle manipulation is one of the six major risk categories. Why is it so impactful?`,
          explanation: `Oracles are the bridge between blockchain data (where prices are a calculation) and real-world prices (what ETH actually trades for). Lending: needs ETH price to calculate LTV and trigger liquidations. Derivatives: need price to settle contracts. Algorithmic stablecoins: need prices to expand/contract supply. If Chainlink's price is wrong, every protocol relying on it gets wrong inputs → wrong outputs → potential catastrophic loss.`,
        },
        {
          question: `A new protocol lets you take yield-bearing stETH, strip out the yield component into a separate token, and sell the "future yield" token to someone else while keeping the "principal" token. Which landscape categories does this touch?`,
          options: [
            `A) Only DEX`,
            `B) Liquid Staking (stETH) + Derivatives (yield tokenization) + DEX (the tokens need to be tradeable) — this is Pendle Finance's model`,
            `C) Only Lending`,
            `D) Stablecoins + Bridges`,
          ],
          correct: `B) Liquid Staking (stETH) + Derivatives (yield tokenization) + DEX (the tokens need to be tradeable) — this is Pendle Finance's model`,
          hint: `Trace the components: stETH comes from liquid staking. Splitting yield is a derivative concept. The resulting tokens need a market.`,
          explanation: `This is Pendle Finance. It takes yield-bearing tokens (stETH from Lido = Liquid Staking layer), strips the yield into PT (Principal Token) and YT (Yield Token) = derivatives layer, and creates AMM pools for trading these tokens = DEX layer. When you understand the landscape map, you can instantly trace multi-category protocols like Pendle and understand who benefits and how.`,
        },
        {
          question: `A yield aggregator like Yearn Finance sits in which layer and what does it do?`,
          options: [
            `A) Layer 1 (base infrastructure) — it provides the foundational yield calculation`,
            `B) Layer 3 (meta-protocol) — it builds on lending and DEX primitives to automatically optimize and compound yield for users`,
            `C) Layer 4 (research tool) — it analyzes yield opportunities`,
            `D) Layer 2 (core primitive) — it's the source of original yield`,
          ],
          correct: `B) Layer 3 (meta-protocol) — it builds on lending and DEX primitives to automatically optimize and compound yield for users`,
          hint: `From L1.2: the DeFi stack has layers. Yearn doesn't create original yield — it optimizes yield from other protocols.`,
          explanation: `Yearn is a meta-protocol (Layer 3): it sits on top of Aave, Compound, Curve (Layer 2 primitives) and automatically moves your deposits to whichever protocol pays the best rate, auto-compounds, and manages the complexity for you. It creates no original yield itself — it captures and optimizes yield that exists in the Layer 2 protocols.`,
        },
      ],

      lessonSimulations: [
        {
          type: `build-the-map`,
          scenario: `Build your DeFi landscape map from scratch. Using a blank page (or the template below), fill in:
(1) Three blockchains for the base layer
(2) Three protocols in each of: DEXes, Lending, Stablecoins
(3) Two protocols in each of: Liquid Staking, Yield Aggregators, Bridges
(4) Three research tools in the outer layer
(5) Draw three arrows showing how capital flows between categories

Then: add one protocol you researched from this section's practice sessions (L1.15) to the correct category.`,
          answer: {
            baseLayer: `Ethereum, Arbitrum, Solana (minimum). Also acceptable: Optimism, Base, BNB Chain, Polygon.`,
            DEXes: `Uniswap (general), Curve (stablecoins), Balancer (weighted) / dYdX (perps) / Orca (Solana).`,
            Lending: `Aave, Compound, Morpho / Euler / Kamino.`,
            Stablecoins: `USDC (Circle), DAI (MakerDAO), FRAX (Frax Finance) / LUSD (Liquity) / USDT (Tether).`,
            LiquidStaking: `Lido (stETH), Rocket Pool (rETH).`,
            YieldAggregators: `Yearn Finance, Beefy Finance / Pendle.`,
            Bridges: `Across Protocol, Stargate / Circle CCTP.`,
            ResearchTools: `DeFiLlama, Token Terminal, Dune Analytics.`,
            flows: `Liquid Staking → Lending (stETH as collateral on Aave). Lending → DEX (borrow stablecoins → swap on Curve). Yield Aggregators → Lending (Yearn deposits into Aave/Compound).`,
          },
        },
        {
          type: `protocol-classification`,
          scenario: `Classify each protocol (which layer? which category? which primitive from L1.3?):
1. GMX — perpetuals DEX on Arbitrum, LPs provide liquidity, traders take leveraged positions, GLP stakers earn ETH from trading losses
2. Pendle Finance — splits yield-bearing tokens into principal and yield components, creates markets for each
3. Across Protocol — cross-chain bridge using Uniswap V3-style liquidity
4. Frax Finance — partially collateralized stablecoin with its own lending market (Fraxlend) and liquid staking (frxETH)
5. Nansen — blockchain analytics tracking smart money wallet movements`,
          answer: {
            GMX: `Layer 2 (core primitive). Category: Derivatives/Perp DEX. Primitive: Swap + LP (GLP holders are the counterparty to traders). Chain: Arbitrum + Avalanche.`,
            Pendle: `Layer 3 (meta-protocol). Category: Yield Derivatives. Primitives: Swap (to trade PT/YT) + Yield decomposition from Liquid Staking/Lending tokens. Sits on top of Lido, Aave, Compound.`,
            Across: `Layer 3 (meta-protocol). Category: Bridges. Uses: intent-based architecture with Uniswap V3 liquidity pools for fast settlement. Not a primitive — depends on existing DEX infrastructure.`,
            Frax: `Multi-layer. Category: Stablecoin (FRAX) + Lending (Fraxlend) + Liquid Staking (frxETH). One of the most integrated protocols in DeFi — spans three categories. Primitives: Stablecoin mechanism + Lending + Staking.`,
            Nansen: `Layer 4 (research/user tools). Category: Analytics/Data. Not a DeFi protocol — doesn't hold or move funds. Research infrastructure.`,
          },
        },
        {
          type: `competitive-analysis`,
          scenario: `Using the landscape map as a framework: you're researching Morpho Blue as a potential investment. The landscape map tells you its category (Lending) and its layer (Layer 2/meta). Now use the map to structure your complete competitive analysis: who are its direct competitors? What are the adjacent categories it could expand into? What protocols does it depend on (risks)?`,
          answer: {
            directCompetitors: `Aave V3 (largest), Compound V3 (Ethereum/Base focus), Euler V2 (post-hack recovery), Spark Protocol (MakerDAO's lending arm), Kamino (Solana).`,
            adjacentExpansion: `Yield Aggregators (integrate Morpho as yield source), Liquid Staking (accept LSTs as collateral), Stablecoins (create a stablecoin backed by Morpho vault positions like Maker does with Spark).`,
            dependencies: `Oracles (Chainlink — if oracle fails, positions mispriced), Ethereum (settlement layer — if ETH goes down, Morpho goes down), Underlying collateral assets (if the collateral (e.g., ETH, stETH) depreciates rapidly, bad debt risk). Also depends on liquidator bot ecosystem — without efficient liquidators, protocol accumulates bad debt.`,
            researchConclusion: `Morpho's differentiation from Aave: modular design allows custom markets. This means it can serve niches Aave's standardized approach can't (e.g., highly specific collateral types). The competitive risk: Aave V4 may adopt similar modularity. The opportunity: first-mover in the "platform" model for lending.`,
          },
        },
      ],

      bossMode: {
        title: `Boss Battle: Section 1 Final Integration`,
        description: `The complete Section 1 boss. Applying every lesson from L1.1–L1.16. This is your proof of mastery.`,
        challenges: [
          {
            scenario: `Build a "Section 1 cheat sheet" — a single paragraph for each of the following that someone who skipped Section 1 could read to get fully up to speed: (1) What DeFi is and why it exists. (2) The four primitives and a protocol example for each. (3) How to evaluate yield sustainability. (4) The six risk categories with one example each. (5) How to read a protocol using DeFiLlama + Token Terminal. Include at least one number in each paragraph.`,
            answer: `(1) DeFi: DeFi replaces banks with self-executing smart contracts. Instead of trusting a bank paying 0.5% on savings, you lend directly to borrowers on Aave and earn 4-5%. No credit check, no office hours, 24/7, censorship-resistant. Risk: code bugs are permanent, no FDIC insurance. (2) Four primitives: Swap (Uniswap — exchange any token, $1B+ daily volume), Lend/Borrow (Aave — $10B+ TVL, earn interest or borrow against collateral), Liquidity Provision (Uniswap V3 — deposit token pairs, earn 0.3% of every swap), Staking (Lido — stake ETH, earn ~3.5% APY in stETH). Every DeFi protocol combines these four. (3) Yield: Real yield = Protocol Revenue / TVL (e.g., Uniswap 10% for LPs from $300M fees / $3B TVL). Emission yield = token printing, deflates as tokens are sold — often collapses from 200% to 8% in 3 months. Test: if emissions stopped, would yield exist? Yes = real. No = Ponzi. (4) Six risks: Smart contract bugs (Wormhole, $320M, signature verification error). Oracle manipulation (Mango Markets, $114M, price feed exploit). Bridge exploits (Ronin, $625M, validator key compromise). Governance attacks (Beanstalk, $182M, flash-loan voting, no timelock). Liquidation cascades (March 2020, DAI depeg during ETH crash). Rug pulls (anonymous team + no timelock + extreme APY = avoid). (5) Protocol reading: DeFiLlama shows TVL (trust barometer) and trends (sudden drop = investigate). Token Terminal shows fees (gross revenue) vs revenue (protocol capture) and P/S ratio (valuation). Capital efficiency = volume/TVL (should be 15-30% for active DEX). DAU trend = adoption health. Always apply yield type (real vs emission) and risk checklist before depositing.`,
          },
          {
            scenario: `A friend shows you "DeltaYield Protocol" — it's brand new (1 month old), offers 300% APY on ETH, the team is anonymous, there's one audit from "CryptoSecure Firm" (you've never heard of it), no timelock, and the TVL has gone from $0 to $20M in 2 weeks. Using your landscape map (L1.16), classify it. Using your yield framework (L1.10), decompose the yield source. Using your risk checklist (L1.11), score it. Give a final recommendation with specific reasoning.`,
            answer: `Classification (L1.16): Layer 3 (meta-protocol likely, built on Ethereum). Category: Yield/Farming protocol. Primitives: probably Lending + token emissions. No established category position. Yield decomposition (L1.10): 300% APY on ETH from a 1-month-old protocol with no established revenue source = 99%+ token emissions. Real yield from ETH lending: maybe 2-5% max in current market. The 295%+ gap = DELTA token printing. This will collapse as the token dumps. Risk checklist (L1.11): Smart contract: F (1 month, unknown audit firm). Oracle: unknown. Governance: F (no timelock, anonymous team can execute anything). Rug pull: F (anonymous + no timelock + extreme APY = textbook rug profile). TVL: C (growing fast but could be team-owned or incentive-chasing). Recommendation: AVOID with any meaningful capital. Score: F/D overall. If you must touch it: $50 maximum as entertainment. The "fastest-growing TVL" story is the oldest trick in DeFi. $20M went in — most of it will leave faster than it arrived when the first early farmer takes profits.`,
          },
        ],
      },

      keyTakeaway: `The DeFi landscape has four layers: base infrastructure (blockchains + oracles), core primitives (DEX, lending, stablecoins, derivatives), meta-protocols (yield aggregators, liquid staking, bridges), and research tools. Every protocol fits somewhere on this map. When you encounter any new protocol: classify its layer, name its category, identify its primitives, name its competitors, and trace where value flows. This framework applies to everything you'll encounter in Sections 2–20.`,
    },

  ],
}
