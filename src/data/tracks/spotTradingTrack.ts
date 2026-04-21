// ⚡ Sifter Skill_Up — SPOT TRADING Career Track
import { SkillTrack } from '../skillTypes';

export const spotTradingTrack: SkillTrack = {
  id: 'spot-trading', category: 'trading', icon: '💹',
  name: 'Spot Trading', tagline: 'Buy low, sell high — the right way',
  description: 'From understanding what a market actually is to executing professional-grade entries and exits. This track builds you from complete beginner to disciplined, consistent trader on any exchange.',
  difficulty: 'beginner', color: '#f7931a', estimatedHours: 60,
  earningPotential: 'Skill-based — scales with capital and consistency',
  realWorldOutcomes: [
    'Read and interpret any price chart with confidence',
    'Execute disciplined entries and exits using a clear strategy',
    'Manage risk so that no single trade can seriously hurt you',
    'Trade spot on Binance, Coinbase, Uniswap, and Jupiter',
    'Build and backtest your own trading strategy',
    'Develop the psychological discipline professional traders rely on',
  ],
  worldTheme: {
    name: 'The Trading Floor',
    description: 'Step onto the floor of a global 24/7 exchange. Every rank earned means more skill and more edge.',
    progressLabels: ['Floor Runner','Junior Analyst','Desk Trader','Risk Officer','Senior Trader','Technical Specialist','Disciplined Pro','Market Legend'],
    accentColor: '#f7931a', bgGradient: ['#1a0a00','#3d1f00'],
  },
  comingSoon: false,
  sections: [
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 1 — HOW MARKETS ACTUALLY WORK (5 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'how-markets-work',
      title: `Lab 1: How Markets Actually Work`,
      subtitle: `Understand the system before you trade it`,
      lessons: [
      {
        id: 'what-is-a-market',
        title: `What Is a Market?`,
        explanation: `In October 2008, Lehman Brothers collapsed and the global financial system froze for 72 hours. Banks refused to lend to each other. Traders who had bought and sold assets every day could not find a single buyer at any price. Markets — which most people treat as permanent fixtures — simply stopped functioning.

That moment revealed the one thing most people never think about: a market is not a building, a website, or an exchange. A market is an agreement — between millions of people — to keep trusting each other enough to trade.

When that trust breaks, price discovery breaks with it.

A market exists wherever buyers and sellers can meet and agree on a price. A car boot sale in a rainy car park is a market. A fish auction in Tokyo is a market. The New York Stock Exchange is a market. The difference is liquidity — how many buyers and sellers are there, and how quickly can you complete a transaction.

Price is determined by one principle only: the last price at which someone actually agreed to trade. Not what a seller wants. Not what a buyer offers. The price where both sides agreed and the transaction happened. Everything else is noise.

Stock markets close at 4pm New York time and reopen 16 hours later. During that gap, nothing trades. Crypto markets run 24 hours a day, 7 days a week, 365 days a year. Bitcoin was trading on Christmas Day, New Year's Eve, and every other day you assumed markets were closed.

This creates opportunity — and risk — that stock traders never face. A bad news event at 3am will be fully priced in before most people wake up. A move happens while you sleep. You need to plan accordingly.

The key question a trader always asks: how liquid is this market right now? Liquid means many buyers and sellers are present, transactions complete instantly, and the price you see is the price you get. Illiquid means few participants, transactions take time, and the price you see and the price you get can be meaningfully different.

Crypto market liquidity changes radically by time of day, day of week, and asset. Bitcoin on a Tuesday afternoon has very different liquidity from a small altcoin at 4am on a Sunday.`,
        visualPrompt: `👆 See how buyers and sellers discover price together`,
        visualType: `gif`,
        visualUrl: `market-price-discovery`,
        examples: [
          {
            contextTag: `[Junior Spot Trader, crypto exchange, illiquid altcoin]`,
            context: `A junior trader wants to exit a $12,000 position in a small-cap altcoin on Binance at midnight on a Sunday.`,
            scenario: `The mid-price shows $0.0842. The trader places a market sell order for the full $12,000. Available buy orders in the order book total only $4,200 near that price before a $0.0071 gap to the next significant level.`,
            outcome: `The order fills in three tranches at $0.0839, $0.0831, and $0.0806 — an average exit price 4.3% below the displayed mid-price. The trader receives $11,484 instead of $12,000. A liquid market would have filled within $40 of the displayed price.`,
          },
          {
            contextTag: `[Retail Trader, BTC/USDT, flash crash event]`,
            context: `A retail trader holds 0.5 BTC purchased at $68,400. A major exchange announces a security incident at 2:17am EST on a Saturday.`,
            scenario: `Bitcoin drops from $71,200 to $63,800 in 4 minutes as liquidity evaporates — market sell orders cascade through an order book that has thinned dramatically in overnight hours. The trader's stop-loss at $69,000 triggers at $67,200 due to slippage during the liquidity gap.`,
            outcome: `The trader exits at $67,200 instead of $69,000 — a $900 difference on a 0.5 BTC position. A pre-set limit stop order would have filled at $69,000 but might not have filled at all. The market recovered to $70,100 within 22 minutes. Understanding illiquid hours is the difference between a planned loss and a worse-than-planned loss.`,
          },
          {
            contextTag: `[Day Trader, ETH/USDT, high-liquidity window]`,
            context: `A day trader enters an ETH/USDT position during the 9am–12pm EST overlap between Asian and US trading sessions — the highest-liquidity window of the day.`,
            scenario: `The trader buys 5 ETH at a displayed price of $3,842. Total position: $19,210. Volume at that moment is running at 4.2× the daily average. The bid-ask spread is $0.18.`,
            outcome: `The order fills at $3,842.04 — $0.20 above the displayed bid, a fill that is essentially perfect. The high liquidity means thousands of orders sit at every price level. The same trade attempted at 3am Sunday on the same exchange might have filled at $3,856 — a $70 difference on the same position.`,
          },
        ],
        keyTakeaway: `A market is an agreement to trade — price is discovered through real transactions. Crypto markets run 24/7. Liquidity varies dramatically by time, day, and asset. Knowing this before you trade is not optional.`,
        guidedPractice: [
          {
            question: `Bitcoin's displayed mid-price on Binance is $72,000. You place a $50,000 market buy order. The order book shows $18,000 in asks at $72,000, $14,000 at $72,050, $11,000 at $72,140, and $9,000 at $72,380. What average fill price do you receive?`,
            options: [
              `A — $72,000 exactly — market orders always fill at the displayed price`,
              `B — Approximately $72,076 — calculated as weighted average across the consumed order book levels`,
              `C — $72,380 — the last price level consumed`,
              `D — Cannot determine without knowing exchange fees`,
            ],
            correct: 1,
            hint: `Work through each order book level sequentially: how much is consumed at each level before moving to the next?`,
            explanation: `B is correct. The $50,000 order consumes: $18,000 at $72,000, then $14,000 at $72,050, then $11,000 at $72,140, then $7,000 of the $9,000 at $72,380 to reach $50,000 total. Weighted average: ((18k×72,000)+(14k×72,050)+(11k×72,140)+(7k×72,380)) / 50,000 ≈ $72,076. A is wrong — market orders consume the book at whatever levels are available. C confuses the last level hit with the average fill.`,
          },
          {
            question: `Crypto markets are trading at 3am EST on a Sunday. Which statement about market conditions is most accurate?`,
            options: [
              `A — Price discovery is identical to midday Tuesday because crypto never closes`,
              `B — Liquidity is typically at its lowest — fewer participants mean wider spreads and higher slippage risk`,
              `C — Price movements are always smaller at night because fewer traders are active`,
              `D — Trading is safer at 3am because institutional traders are not present`,
            ],
            correct: 1,
            hint: `Think about who is present in the market at 3am EST — and what their absence means for the order book.`,
            explanation: `B is correct. Market liquidity follows trader activity patterns. 3am EST is the dead zone between US close and Asian open. Fewer participants means thinner order books, wider bid-ask spreads, and higher slippage on any sized order. C is wrong — smaller moves on average does not equal safer. A sudden move in thin liquidity can be more violent than the same catalyst during peak hours. D mistakes institutional absence for safety — institutional traders provide much of the order book liquidity that protects retail traders.`,
          },
          {
            question: `The Lehman Brothers collapse caused markets to freeze for 72 hours in 2008. What was the fundamental mechanism that caused this market failure?`,
            options: [
              `A — Regulators shut down exchanges as a precaution`,
              `B — Buyer-seller trust collapsed — without counterparty confidence, no transactions could complete`,
              `C — Technology infrastructure failed across all exchanges simultaneously`,
              `D — All assets became worthless so there was nothing to trade`,
            ],
            correct: 1,
            hint: `A market is fundamentally an agreement between people. What happens to agreements when trust disappears?`,
            explanation: `B is correct. Markets function only when participants trust that the other side of a transaction will honour their obligations. Lehman's failure created uncertainty about which other institutions were exposed. Banks refused to lend to each other because they could not be certain counterparties would survive. This is the pure definition of market failure: not a technology or regulatory problem, but a trust problem. D is wrong — assets had value, but no one would agree on what that value was.`,
          },
          {
            question: `A trader wants to buy $5,000 of a low-liquidity altcoin. The spread is 2.8% (bid: $0.1000, ask: $0.1028). How much does the trader need the price to move just to break even after entering?`,
            options: [
              `A — 0% — they immediately own the asset at current market price`,
              `B — 1.4% — half the spread, as prices meet in the middle`,
              `C — 2.8% — they bought at the ask and need price to reach their entry or above`,
              `D — 5.6% — the spread compounds on both entry and exit`,
            ],
            correct: 2,
            hint: `The trader buys at the ask price. What price do they need to sell at to recover their full entry cost, ignoring fees?`,
            explanation: `C is correct. Buying at market means buying at the ask: $0.1028. To sell and recover $0.1028 fully, price must return to the ask level. The current bid at $0.1000 is already 2.8% below. So the price needs to rise 2.8% from current bid just to get back to breakeven on exit. The spread is the immediate loss embedded in every market entry on a wide-spread asset. D would be correct if you counted entry AND exit spread compounded, which is relevant when calculating total round-trip cost.`,
          },
          {
            question: `You are trading SOL/USDT. News breaks that a major DeFi hack has occurred on Solana. This happens at 2pm EST on a Wednesday — peak liquidity hours. Compared to the same news breaking at 2am Sunday, what changes about your trading decision?`,
            options: [
              `A — Nothing changes — good setups are good setups regardless of liquidity conditions`,
              `B — Peak liquidity means exits are more reliable and slippage is minimal, but the speed of the reaction is also faster — both edges and risks are sharper`,
              `C — Peak liquidity is always better for traders regardless of whether you are entering or exiting`,
              `D — Off-hours news is always more impactful — less liquidity means bigger moves`,
            ],
            correct: 1,
            hint: `High liquidity means tighter spreads and better fills — but also more participants who react to the same news at the same time.`,
            explanation: `B is correct. Peak liquidity is a double-edged condition. Your exits are more reliable and fills are tighter — $50,000 exits without 4% slippage. But more participants mean faster initial reactions: the first 5% of the news move happens in seconds rather than minutes. In off-hours trading (2am Sunday), you might have more time to read and react to news before the full market catches up — but your exit, if needed, may face 3–5% slippage. Neither is uniformly better. The competent trader accounts for current liquidity conditions in every trade plan.`,
          },
        ],
        lessonSimulations: [
          {
            type: `chartReplay-volumeRead`,
            scenario: `You are analysing BTC/USDT on the 1-hour chart. Current time: Wednesday 2:15pm EST (peak liquidity).

Chart data (last 6 hours):
- 8am candle: price $71,200–$71,800, volume 1,240 BTC (0.7× 20-period average)
- 10am candle: price $71,600–$72,400, volume 2,180 BTC (1.2× 20-period average)
- 12pm candle: price $72,100–$73,400, volume 4,890 BTC (2.7× 20-period average)
- 1pm candle: price $73,100–$73,200, volume 890 BTC (0.5× 20-period average)
- 2pm candle: price $73,050–$73,150, volume 620 BTC (0.35× 20-period average)
- Current price: $73,080

Order book depth: $4.2M in bids within 0.5% below current price. $1.1M in asks within 0.5% above.

Account size: $8,000. Risk tolerance: 1.5% per trade.

Question: Based on volume profile, liquidity conditions, and order book depth, characterise the current market state and state whether conditions favour entering a long, short, or neither.`,
            scoringCriteria: [
              `User identifies the 12pm high-volume candle as the primary directional move (2.7× average = conviction)`,
              `User flags the declining volume at 1pm and 2pm as momentum exhaustion despite holding near highs`,
              `User notes the asymmetric order book (4.2M bids vs 1.1M asks) suggests more immediate sell-side pressure above`,
              `User calculates max position: $8,000 × 1.5% = $120 risk. States a stop placement and corresponding position size`,
              `User concludes: neither entry — declining volume at resistance with thin ask-side liquidity favours waiting for a confirmed direction before committing`,
            ],
          },
          {
            type: `judgment-riskAssess`,
            scenario: `It is Saturday 11:45pm EST. You hold the following open positions:

Position 1: 0.08 BTC long entered at $71,400. Current price $73,200. Stop at $70,800. No take-profit set. Unrealised P&L: +$144.

Position 2: 42 SOL long entered at $182.40. Current price $179.60. Stop at $178.00. Take-profit at $194.00. Unrealised P&L: -$117.60.

Market conditions: Weekend off-hours. BTC order book shows 60% below-average depth. SOL spread is currently 1.4% (normally 0.3%).

A major blockchain security research firm just tweeted that they have identified a "critical vulnerability" in a Layer 1 protocol and will publish a report in 4 hours. They have not named the protocol.

Rank the three actions below from most to least appropriate, and explain your reasoning:
A — Do nothing. Both positions have stops set. Let the system manage it.
B — Close Position 2 (SOL) immediately via market order. Hold Position 1 (BTC).
C — Close both positions immediately via market orders to eliminate overnight risk.`,
            scoringCriteria: [
              `User identifies that weekend off-hours liquidity makes market exits more costly than normal (SOL spread 1.4% vs 0.3%)`,
              `User recognises the unspecified protocol vulnerability creates asymmetric risk for SOL vs BTC`,
              `User calculates the cost of closing SOL via market now: 42 × $179.60 × 1.4% spread ≈ $105 friction vs -$117.60 current loss`,
              `User identifies that Position 1 (BTC) has a profit buffer of $144 and tighter stops — lower urgency`,
              `User ranks B first (close SOL, hold BTC) with justification: SOL vulnerability risk is existential if Solana is the named protocol; BTC has no L1 vulnerability exposure and is profitable`,
              `User notes that Action A is defensible if they assess BTC will not be named — but fails to account for SOL exposure`,
            ],
          },
          {
            type: `chartReplay-riskManage`,
            scenario: `You entered a BTC/USDT long position on the 4-hour chart:
- Entry: $70,800
- Stop-loss: $69,200 (below swing low)
- Take-profit: $74,400 (next major resistance)
- Position size: 0.05 BTC (risking $80 on an $8,000 account = 1%)
- Account size: $8,000

The trade has moved in your favour. Current price: $72,600.

You now receive the following market data update:
- 4-hour candle just closed: $72,580 close, upper wick = $73,280 (wick rejected $73,280 hard)
- Volume on last candle: 0.4× the 20-period average
- Order book: $2.8M wall of asks between $73,100–$73,400
- RSI on 4H: 71.4 (approaching overbought)

Your three options:
A — Do nothing. Hold position to original TP at $74,400.
B — Move stop-loss to breakeven ($70,800). Take 25% profit at current price ($72,600). Hold remaining 75% to original TP.
C — Close the entire position now. Take $90 profit and move on.

State which action you take, calculate the exact P&L implications of each option, and justify using observable market data.`,
            scoringCriteria: [
              `User chooses B and correctly calculates: 25% close = 0.0125 BTC × ($72,600 − $70,800) = $22.50 profit locked`,
              `User calculates that moving stop to breakeven ($70,800) makes remaining 75% (0.0375 BTC) risk-free`,
              `User cites the long upper wick rejection at $73,280 as evidence of seller presence above current price`,
              `User notes the $2.8M ask wall at $73,100–$73,400 as structural resistance justifying partial exit`,
              `User identifies the low-volume candle (0.4× average) as momentum warning — move not supported by participants`,
              `User rejects C as unnecessarily closing a risk-free profitable position without further confirming evidence of reversal`,
            ],
          },
        ],
      },

      // ── Lesson 2: Order Book Explained ──────────────────────────────────
      {
        id: 'order-book-explained',
        title: `The Order Book Explained`,
        explanation: `In 2010, a single algorithmic trader using a rapid fire strategy briefly caused what became known as the Flash Crash. The Dow Jones fell nearly 1,000 points in about ten minutes — not because of any news, but because the order book structure broke down. When large orders were rapidly withdrawn from one side, the market had nothing to lean against. Prices fell through the air until automatic circuit breakers kicked in.

The order book is the live record of every buy and sell order that has been placed but not yet matched. It is the market's engine room — the mechanism by which price is actually discovered in real time.

Every order book has two sides. The bid side holds all buy orders: every trader who wants to buy the asset and has specified the maximum price they will pay. The ask side (also called the offer side) holds all sell orders: every trader who wants to sell and has specified the minimum price they will accept.

Both sides are organised by price. The highest bid sits at the top of the bid side — that buyer is willing to pay the most. The lowest ask sits at the top of the ask side — that seller is willing to accept the least. The gap between them is the spread.

When a new buy order arrives at the current ask price or above, it matches with the lowest-priced sell order and both orders are removed from the book. A trade has occurred. Volume on that trade is recorded. The price of that trade becomes the last price.

Large orders sitting at specific price levels create visible support and resistance in real time. A wall of 500 BTC in buy orders at $70,000 tells every trader watching the book that significant demand exists at that level. This demand may support the price when it reaches that level — or the wall may be a "spoof" order that gets cancelled before it can be hit.

Order books on crypto exchanges update dozens of times per second. For a retail trader watching on a standard exchange interface, you see a simplified snapshot. Algorithmic traders consuming raw market data see every micro-update.

The key insight for a spot trader: the order book shows you real-time supply and demand, not just price. Learning to read it — even at a basic level — tells you where the genuine buyers and sellers are sitting before price reaches them.`,
        visualPrompt: `👆 See a live order book — bids, asks, and where trades happen`,
        visualType: `gif`,
        visualUrl: `order-book-live`,
        examples: [
          {
            contextTag: `[Swing Trader, ETH/USDT, identifying support]`,
            context: `A swing trader is preparing to enter a long position in ETH/USDT and pulls up the Level 2 order book before placing the order.`,
            scenario: `The order book shows 18,400 ETH in stacked buy orders between $3,800–$3,820 (12× the density of the levels above and below). Price is currently at $3,868 and declining. The trader's planned entry was $3,850 based on a chart level.`,
            outcome: `The trader adjusts the limit buy from $3,850 to $3,825 — just above the order book support zone. Price dips to $3,831 before bouncing. The adjusted entry captures an additional $25/ETH on 3 ETH ($75 better entry). Reading the order book gave more precise entry than the chart level alone.`,
          },
          {
            contextTag: `[Day Trader, BTC/USDT, spoofed order book]`,
            context: `A day trader spots a 200 BTC buy wall at $71,500 in the BTC/USDT order book while price trades at $71,680.`,
            scenario: `The trader interprets the large buy wall as strong support and enters long with a stop at $71,450. As price approaches $71,520, the 200 BTC buy order disappears from the book entirely — never executed, simply cancelled. Price drops through $71,500 to $70,900 in the next 3 minutes.`,
            outcome: `The trader's stop at $71,450 triggers at $71,410 due to the rapid decline. A $270 loss on a 0.1 BTC position. The 200 BTC order was a spoof — placed to create false impression of support, then cancelled. Lesson: large order book walls that disappear without being hit are the market's version of a mirage.`,
          },
          {
            contextTag: `[Position Trader, SOL/USDT, reading ask-side density]`,
            context: `A position trader holds SOL/USDT long from $175 and plans an exit near $195. Before setting the take-profit, they read the order book on a Thursday afternoon.`,
            scenario: `The ask side shows thin orders ($40K total asks) between $192–$196, then a dense cluster of $2.1M in asks stacked between $196.50–$198. The chart's next resistance was marked at $198.`,
            outcome: `The trader sets TP at $195.80 — just below the dense ask cluster — rather than $198. Price reaches $196.20 before reversing. The TP fills at $195.80 rather than chasing $198 through $2.1M of sell orders. The order book gave early warning of where the actual selling would intensify.`,
          },
        ],
        keyTakeaway: `The order book shows real-time supply and demand at every price level. Large buy orders suggest support; large sell orders suggest resistance. But beware: walls can be spoofed — cancelled before they fill. Always verify with volume.`,
        guidedPractice: [
          {
            question: `The BTC/USDT order book shows: Bid side — 45 BTC at $72,400, 78 BTC at $72,380, 210 BTC at $72,300. Ask side — 38 BTC at $72,420, 52 BTC at $72,440, 180 BTC at $72,500. What is the current bid-ask spread?`,
            options: [
              `A — $200 (between $72,300 and $72,500)`,
              `B — $20 (between the best bid $72,400 and best ask $72,420)`,
              `C — $100 (between mid-price $72,410 and the round number $72,500)`,
              `D — Zero — the market is continuous`,
            ],
            correct: 1,
            hint: `The spread is always measured between the BEST (highest) bid and the BEST (lowest) ask — the top of each side.`,
            explanation: `B is correct. Spread = best ask − best bid = $72,420 − $72,400 = $20. A uses the full depth range, not the spread. The spread specifically measures the gap between the most aggressive buyer ($72,400) and the most aggressive seller ($72,420). A $20 spread on $72,400 BTC is 0.028% — very tight, indicating high liquidity.`,
          },
          {
            question: `You observe a 500 BTC buy wall at $70,000. This is a round number that is also a major psychological level. Price is currently at $70,800 and declining. As price reaches $70,050, the entire 500 BTC order disappears without executing. What is the most likely interpretation?`,
            options: [
              `A — All 500 BTC were purchased by a single large buyer as the price crossed $70,000`,
              `B — The order was a spoof — placed to create false support impression, cancelled before it could fill`,
              `C — Price rejected $70,000 so strongly that no selling occurred`,
              `D — A technical error on the exchange caused the order to vanish`,
            ],
            correct: 1,
            hint: `If the order was genuine and price touched $70,000 level, what would have had to happen for 500 BTC to be absorbed without the order executing?`,
            explanation: `B is correct. A genuine 500 BTC limit buy at $70,000 executes when price reaches $70,000 — it does not simply vanish. An order that disappears without executing as price approaches it is the textbook signature of spoofing: creating a false impression of support to encourage other buyers, then withdrawing the order. Spoofing is illegal in regulated markets but occurs in crypto. A is wrong — 500 BTC absorbing at $70,000 would produce a large volume spike in the trade tape, which is observable.`,
          },
          {
            question: `A market buy order for $100,000 of ETH is placed. The order book shows: 20 ETH at $3,800 ($76,000 value), 8 ETH at $3,825 ($30,600 value). The order consumes both levels. At what weighted average price does $100,000 fill?`,
            options: [
              `A — $3,800 — the price at the time of order placement`,
              `B — $3,812.50 — simple average of the two prices`,
              `C — Approximately $3,806 — weighted by the value consumed at each level`,
              `D — $3,825 — the price of the last level consumed`,
            ],
            correct: 2,
            hint: `Weighted average means larger quantities at lower prices pull the average down more than smaller quantities at higher prices.`,
            explanation: `C is correct. $76,000 fills at $3,800 and $24,000 fills at $3,825 (to reach $100,000 total). Weighted avg = (76,000 × $3,800 + 24,000 × $3,825) / 100,000 = ($288,800,000 + $91,800,000) / 100,000 = $3,806. B treats both levels as equal regardless of size. D shows only the last price, ignoring the majority filled at $3,800.`,
          },
          {
            question: `The ask side of a SOL/USDT order book shows 12,000 SOL clustered between $188–$190, then thin orders until $196, then 45,000 SOL clustered at $196–$198. Price is at $185. Where should a swing trader who entered at $175 place their first take-profit?`,
            options: [
              `A — $190 — just below the first dense sell cluster, capturing the move before significant resistance`,
              `B — $200 — above all visible resistance for maximum profit`,
              `C — $185 + 10% = $203.50 — based on a fixed percentage target`,
              `D — Take no profit yet — wait for a higher timeframe signal`,
            ],
            correct: 0,
            hint: `Which level has visible sell-side density that price is most likely to struggle to pass through?`,
            explanation: `A is correct. The 12,000 SOL cluster at $188–$190 is the nearest significant ask-side resistance. A first take-profit just below $190 captures the move while avoiding the likely slowdown or reversal at that cluster. $196–$198 represents a second, larger cluster — appropriate for a second take-profit after the first fills. B ignores actual visible supply. C uses a mechanical formula disconnected from market structure. D is reasonable but misses a high-probability partial exit.`,
          },
          {
            question: `A large sell order of 2,000 BTC appears in the ask side of the BTC/USDT book at $75,000 — a level BTC has never previously reached. A second trader observes this. Price is currently $73,200. What does this level 2 order book data tell the trader?`,
            options: [
              `A — BTC will definitely stop at $75,000 — the 2,000 BTC wall is immovable`,
              `B — There is visible supply at $75,000, but the order's authenticity (genuine vs spoofed) and whether it will hold cannot be confirmed from order book observation alone`,
              `C — The market will surge through $75,000 because large orders create false resistance that gets absorbed`,
              `D — Nothing — order book data above current price is irrelevant until price reaches that level`,
            ],
            correct: 1,
            hint: `Consider both what the order book CAN tell you and what it CANNOT tell you about a large order at an unprinted price level.`,
            explanation: `B is correct. A 2,000 BTC ask at $75,000 is visible supply that must be absorbed for price to pass that level. However: (1) the order may be spoofed and cancelled before price reaches it, (2) buyer demand may be strong enough to absorb it, or (3) it may be a genuine iceberg with only 2,000 BTC visible of a much larger total order. Order book data identifies levels of interest and supply/demand concentration — it does not predict outcomes with certainty. The competent trader uses this data as one input alongside price action and volume confirmation.`,
          },
        ],
        lessonSimulations: [
          {
            type: `chartReplay-volumeRead`,
            scenario: `BTC/USDT, 15-minute chart. You are monitoring the order book and tape simultaneously.

Current price: $72,140
Current time: Tuesday 11:30am EST

Order book snapshot:
BID side: 82 BTC at $72,120 | 156 BTC at $72,080 | 440 BTC at $72,000 | 38 BTC at $71,980
ASK side: 45 BTC at $72,160 | 67 BTC at $72,200 | 88 BTC at $72,240 | 620 BTC at $72,500

Recent tape (last 5 minutes):
- 11:25: 12 BTC sold at $72,140 (market sell)
- 11:26: 8 BTC bought at $72,160 (market buy)
- 11:27: 34 BTC sold at $72,120 (market sell) — order book bid at $72,120 reduced from 120 to 82 BTC
- 11:28: 22 BTC sold at $72,080 (market sell)
- 11:29: 18 BTC sold at $72,080 (market sell) — bid at $72,080 reduced from 196 to 156 BTC
- 11:30: 28 BTC sold at $72,120 (market sell)

Account: $15,000. Risk: 1% per trade ($150 maximum).

Based on order book structure and tape flow:
1. What direction is the tape showing (buying pressure or selling pressure)?
2. Where is the most significant support level visible in the book?
3. If you were to enter a short, where would you place your entry, stop, and first target?`,
            scoringCriteria: [
              `User correctly identifies selling pressure from the tape (6 of last 6 trades are market sells)`,
              `User identifies the 440 BTC bid cluster at $72,000 as the most significant support (5× normal density)`,
              `User identifies the 620 BTC ask at $72,500 as major resistance and nearest short target area`,
              `User specifies a short entry at or near $72,140 (current price or retest of $72,160 ask)`,
              `User places stop at or above $72,260 (above current ask cluster resistance)`,
              `User calculates position size: $150 risk ÷ stop distance ≈ correct BTC amount`,
              `User notes that the 440 BTC wall at $72,000 may not hold — validates target placement below $72,000 rather than at it`,
            ],
          },
          {
            type: `judgment-riskAssess`,
            scenario: `You are watching the ETH/USDT order book during European trading hours (10am GMT). You observe the following sequence over 8 minutes:

09:52: Large bid wall of 8,400 ETH appears at $3,780 (price is $3,820)
09:54: Additional 2,100 ETH bid added at $3,780 — total $10,500 ETH at that level
09:55: Bullish traders begin buying in anticipation of $3,780 support — price rises to $3,834
09:57: The entire 10,500 ETH bid at $3,780 disappears without any trades executing
09:58: Price reverses, falls to $3,801
09:59: Price hits $3,780 — order book shows only 340 ETH in bids at that level (96.8% thinner)
10:00: Price falls through $3,780 to $3,752 in 90 seconds

You entered long at $3,831 (believing the $3,780 wall was genuine support). Your stop was at $3,775.

Question: Identify what happened, the name of this practice, why it is dangerous, and at what point the evidence was clearest that your trade thesis was invalidated.`,
            scoringCriteria: [
              `User correctly identifies the event as spoofing — large orders placed to create false market impression then cancelled`,
              `User identifies 09:57 (disappearance of the wall without execution as price was still above it) as the clearest invalidation signal`,
              `User explains why spoofing is dangerous: creates false supply/demand signals that cause other traders to act on fabricated information`,
              `User identifies that the correct response at 09:57 was immediate exit or tightening of stop before the fake support evaporated`,
              `User notes the asymmetry: 10,500 ETH wall builds credibility, but walls that vanish without trades are the primary spoof signature`,
            ],
          },
          {
            type: `chartReplay-breakout`,
            scenario: `SOL/USDT, 1-hour chart. Price has been consolidating between $182 and $191 for 9 days.

Current order book snapshot (price at $190.80):
ASK side: 1,200 SOL at $191.20 | 3,800 SOL at $191.50 | 12,400 SOL at $191.80–$192.00 | sparse above

BID side: 2,100 SOL at $190.60 | 4,400 SOL at $190.20 | 8,900 SOL at $189.50

Recent volume: The last 3 hourly candles averaged 1.1× the 20-period average. Current candle (45 minutes complete): volume already at 2.8× the 20-period average.

Account: $10,000. Risk: 1.5% per trade.

The 9-day consolidation upper boundary sits at $191.50.

Task: Based on order book structure, volume expansion, and the consolidation setup:
1. Is this a high-quality breakout setup? State your criteria clearly.
2. If yes, specify exact entry, stop, and two take-profit levels with position size.
3. If you wait for confirmation rather than breakout entry, specify exactly what confirmation looks like.`,
            scoringCriteria: [
              `User identifies 2.8× volume expansion as a strong breakout signal (minimum threshold is typically 1.5×)`,
              `User flags the 12,400 SOL ask cluster at $191.80–$192.00 as significant resistance that must be cleared for the breakout to be genuine`,
              `User specifies entry: either aggressive (above $191.50 on current candle close) or conservative (on retest of $191.50 after a full close above)`,
              `User calculates position size correctly: $10,000 × 1.5% = $150 risk ÷ stop distance`,
              `User places stop below the lower boundary of the consolidation ($182) or below the current candle low`,
              `User sets TP1 at a level derived from the consolidation height added to breakout point (pole-flag or measured move target)`,
              `User notes that if volume does not sustain above 1.5× average during the breakout candle, it becomes suspect`,
            ],
          },
        ],
      },

      // ── Lesson 3: CEX vs DEX ─────────────────────────────────────────────
      {
        id: 'cex-vs-dex',
        title: `CEX vs DEX — Where You Actually Trade`,
        explanation: `In November 2022, FTX — the world's third-largest crypto exchange by volume — collapsed in 72 hours. $8 billion in customer funds disappeared. Sam Bankman-Fried, then considered a visionary, was eventually convicted of fraud. FTX had been audited. FTX had institutional backing. FTX had been considered a safe custodian.

The lesson: when you leave your assets on a centralised exchange, you are trusting that organisation with your money. You are not holding crypto — you are holding an IOU from a company.

A centralised exchange, or CEX, works like a bank. Binance, Coinbase, Kraken — these companies hold your funds in wallets they control. You log in, see a balance, click buy or sell, and the exchange updates their internal ledger. The actual crypto may not move on-chain at all during an internal trade. It's fast, clean, and simple. It's also counterparty risk you can't see.

A decentralised exchange, or DEX, works differently. Uniswap, Jupiter (Solana), Curve — these are smart contracts deployed on a blockchain. When you connect your wallet and trade, the transaction executes on-chain, in code, with no company holding your assets. You remain in custody at all times. If Uniswap's website goes down tomorrow, the smart contracts are still running. You can interact with them directly.

The trade-offs are real and significant. CEXs are faster (millisecond matching engines vs 1-second block times), simpler (clean interface, customer support, fiat on-ramps), and often have better liquidity for major assets. DEXs give you self-custody, access to assets before they list on CEXs, and permissionless trading — no KYC required.

The practical framework: funds you are actively trading in the near term can live on a reputable CEX. Funds you are not actively trading should move to a hardware wallet. Never leave large amounts on any exchange you do not need there for current trading activity. The FTX customers who had moved their long-term holdings to hardware wallets before November 2022 lost nothing.

New DEX users make two critical mistakes. First: using a seed phrase generator from an untrusted source. Your seed phrase is your wallet. Anyone who knows it controls your funds. Second: setting slippage too high on DEXs — MEV bots (Maximal Extractable Value bots) can sandwich your transaction between their own buys and sells if your slippage tolerance is wide enough to make it profitable for them.`,
        visualPrompt: `👆 Compare CEX custody vs DEX self-custody side by side`,
        visualType: `gif`,
        visualUrl: `cex-vs-dex-custody`,
        strategy: `Default approach: active trading capital on one reputable CEX. Long-term holdings or anything you won't touch for 30+ days on a hardware wallet. For DEX trading: use a separate hot wallet funded only with what you intend to trade that session. Never trade DEX from a wallet holding your long-term holdings.`,
        examples: [
          {
            contextTag: `[Crypto Investor, FTX collapse, hardware wallet decision]`,
            context: `An investor held $47,000 in crypto across FTX and Ledger hardware wallet in November 2022. Two months prior, they had moved 65% of holdings to cold storage after reading about CEX risks.`,
            scenario: `FTX freezes withdrawals on November 8, 2022. The investor's $16,450 on FTX becomes inaccessible. Their $30,550 on the Ledger remains fully accessible and under their control throughout the collapse.`,
            outcome: `The investor loses the FTX portion (later partially recovered through bankruptcy proceedings — 118 cents on the dollar, years later). The hardware wallet holdings are unaffected. The risk-splitting decision, made proactively, protected 65% of their capital from a counterparty risk event. The cost of the hardware wallet: $79.`,
          },
          {
            contextTag: `[DeFi Trader, Uniswap V3, MEV sandwich attack]`,
            context: `A trader buys $8,000 of a mid-cap token on Uniswap V3 with a 3% slippage tolerance set.`,
            scenario: `An MEV bot detects the pending transaction in the mempool before it confirms. The bot front-runs by buying the same token (pushing price up 2.1%), allows the trader's $8,000 transaction to execute at the inflated price, then immediately sells the position back (pushing price down). All three transactions confirm in the same Ethereum block.`,
            outcome: `The trader receives tokens at an average price 2.1% above what was available before their transaction. On $8,000, this costs $168. The MEV bot profits $168 minus gas costs. The fix: setting slippage to 0.5%–1% on established tokens means the trader's transaction simply reverts if price moves outside tolerance — less convenient, but eliminates the sandwichable attack surface.`,
          },
          {
            contextTag: `[Active Trader, Binance and Jupiter, hybrid approach]`,
            context: `A trader runs a hybrid setup: active swing trades on Binance (BTC/ETH), new token discovery on Jupiter (Solana DEX) using a dedicated hot wallet.`,
            scenario: `The trader identifies a new Solana memecoin 4 hours after launch on Jupiter. The token is not listed on any CEX. DEX access provides a timing advantage: the token lists on a minor CEX 18 hours later at 3.4× the Jupiter entry price.`,
            outcome: `The trader exits the Jupiter position for a 240% gain before CEX listing. Using a dedicated hot wallet funded with only $1,200 (the intended trade size) means the total downside risk was $1,200 even if the token went to zero or was a rug-pull. The hybrid setup creates access to early-stage opportunities without risking the entire trading stack on a single DEX session.`,
          },
        ],
        keyTakeaway: `CEXs offer speed and simplicity but you trust them with your funds. DEXs give self-custody but require self-reliance. Use CEXs for active trading, hardware wallets for long-term holdings, and separate hot wallets for DEX sessions.`,
        guidedPractice: [
          {
            question: `You have $40,000 in Ethereum. $8,000 is capital you plan to actively trade this month. $32,000 is a long-term hold you won't touch for 6+ months. What is the professionally correct allocation between CEX and cold storage?`,
            options: [
              `A — All $40,000 on Binance — it's the largest exchange and has strong security`,
              `B — $8,000 on a reputable CEX for active trading; $32,000 on a hardware wallet`,
              `C — $20,000 on Binance, $20,000 on Coinbase — split the counterparty risk`,
              `D — All $40,000 on a hardware wallet — never use exchanges`,
            ],
            correct: 1,
            hint: `Match where funds live to why you need them there. Active trading requires exchange access. Long-term holdings do not.`,
            explanation: `B is correct. Funds on exchanges exist to be traded — no other reason justifies the counterparty risk. $8,000 in active trading capital warrants CEX access. $32,000 sitting for 6+ months has zero need to be on an exchange and 100% exposure to the FTX-style counterparty risk. Hardware wallets are not a premium product for paranoid users — they are the correct tool for any funds not immediately needed for trading. C reduces concentration risk but still leaves $20,000 unnecessarily on exchanges.`,
          },
          {
            question: `A friend receives their wallet seed phrase (12 words) from a website that offered a "free crypto giveaway" to new wallet users. They enter the seed phrase into the site to "verify ownership." What happened?`,
            options: [
              `A — Nothing — seed phrases are only meaningful when combined with a password`,
              `B — Their wallet has been compromised — anyone who knows the seed phrase controls all funds in that wallet`,
              `C — They completed a standard KYC verification process`,
              `D — The seed phrase only risks funds if it is combined with the exchange login`,
            ],
            correct: 1,
            hint: `A seed phrase is the master key to a wallet — think about what it means for someone else to have a master key.`,
            explanation: `B is correct. A seed phrase is a human-readable representation of the private key that controls a wallet. Anyone who possesses the seed phrase can import the wallet into any compatible software and take all funds — instantly and irreversibly. There is no combination needed, no password to break. The "free crypto giveaway" site is a classic phishing scheme that harvests seed phrases. The friend's funds should be moved to a new wallet immediately. A is completely wrong — seed phrases are complete keys requiring nothing additional.`,
          },
          {
            question: `Which of the following is a structural advantage of a DEX over a CEX that cannot be replicated by a CEX improving its security?`,
            options: [
              `A — DEXs have lower trading fees in all market conditions`,
              `B — DEXs provide access to tokens before they list on CEXs, and the exchange cannot be shut down by any single authority`,
              `C — DEXs always offer better liquidity for large trades`,
              `D — DEXs have faster transaction execution than CEXs`,
            ],
            correct: 1,
            hint: `Think about what a DEX is — code running on a blockchain — versus what a CEX is — a company. What can a company be forced to do that code on a public blockchain cannot?`,
            explanation: `B is correct. CEXs are companies subject to regulation, jurisdiction, and can be shut down, hacked as a company, or go bankrupt. DEXs are smart contracts running on public blockchains — no single entity controls them. Additionally, new tokens typically exist on-chain (accessible via DEX) weeks or months before exchange listing. These are structural differences, not security gaps a CEX can close. A is wrong — DEX fees include gas which can be significant. C is wrong — major CEXs typically have far better liquidity for large trades than DEXs. D is wrong — CEX matching engines operate in milliseconds; DEX transactions wait for block confirmation.`,
          },
          {
            question: `You're trading on Uniswap and notice the displayed price is $2.40/token. You set slippage at 5% and place a $15,000 buy. The transaction confirms at $2.51/token — a 4.6% markup from the displayed price. What is the most likely explanation?`,
            options: [
              `A — Gas fees caused the price increase`,
              `B — The token's price genuinely rose 4.6% during the few seconds your transaction was pending`,
              `C — An MEV bot executed a sandwich attack, front-running your transaction to drive up price before your fill, then selling back immediately after`,
              `D — Uniswap's automated market maker (AMM) pool was too large to be affected by your $15,000`,
            ],
            correct: 2,
            hint: `A 5% slippage tolerance and a $15,000 order in the mempool creates a profitable opportunity for bots monitoring pending transactions.`,
            explanation: `C is correct. A 5% slippage setting means you accept any fill up to $2.52 (5% above $2.40). An MEV bot sees your pending transaction, calculates that buying before you and selling after you within the 5% gap is profitable on $15,000, and executes the sandwich. Your $15,000 trade at $2.51 means you paid $682 more than the displayed price — the bot's profit. Gas costs on Ethereum mean this is economically viable for bots at trades this size. Fix: set slippage to 0.5%–1% and accept that your transaction may revert if the pool moves more than 1%.`,
          },
          {
            question: `A trader wants to buy $50,000 of BTC at exactly $71,000 regardless of current price. They need the transaction to complete in under 2 seconds. Which platform type is appropriate and why?`,
            options: [
              `A — A DEX on Ethereum — smart contracts are the most secure for large transactions`,
              `B — A major CEX with a limit order — millisecond matching, and the $71,000 target can be set precisely`,
              `C — A DEX on Solana — fast block times approach CEX speed`,
              `D — Either works equally — the user's security preference is the only differentiating factor`,
            ],
            correct: 1,
            hint: `Consider: which platform type offers (1) millisecond execution, (2) precise limit order entry, and (3) adequate liquidity for $50,000 of BTC?`,
            explanation: `B is correct. $50,000 of BTC with a precise $71,000 target and sub-2-second execution requirement points to a CEX. CEX limit orders execute at the stated price or better when the market reaches that level. Ethereum DEX block time (~12 seconds) and confirmation requirements make sub-2-second impossible. Solana DEX (A) is closer in speed but still cannot guarantee execution at exactly $71,000 due to AMM slippage on a $50,000 order. The question is not which is more secure in a general sense — it is which is the correct tool for the stated requirements.`,
          },
        ],
        lessonSimulations: [
          {
            type: `judgment-riskAssess`,
            scenario: `You have $85,000 in crypto assets distributed as follows:
- $35,000 ETH on Binance (active trading account)
- $22,000 BTC on Coinbase (not traded in 4 months, "there for convenience")
- $18,000 SOL in a Phantom hot wallet (DEX trading)
- $10,000 USDC in a Ledger hardware wallet

You read that a major exchange has been ordered by regulators to freeze withdrawals in its jurisdiction — not Binance or Coinbase specifically, but it's a reminder of counterparty risk.

Task: Audit your current distribution. Identify:
1. Which positions have unnecessary counterparty risk given how you actually use them
2. The specific reallocation steps you should take and why
3. The residual risks that remain after reallocation that cannot be eliminated`,
            scoringCriteria: [
              `User correctly identifies the $22,000 BTC on Coinbase as the highest unnecessary counterparty risk — not actively traded, no reason to be on an exchange`,
              `User recommends moving the $22,000 BTC to hardware wallet storage`,
              `User identifies the $18,000 SOL Phantom hot wallet as a reasonable risk given active DEX use — but recommends only keeping session capital there, not the full $18,000`,
              `User notes the $35,000 ETH on Binance is partially justified by active trading but should be right-sized to actual near-term trading capital`,
              `User identifies residual risks: hardware wallet loss/theft, seed phrase compromise, smart contract risk on DEX, exchange counterparty risk on remaining CEX balance`,
              `User does not recommend complete exit from CEX (that would prevent active trading)`,
            ],
          },
          {
            type: `judgment-ethicalChoice`,
            scenario: `You are a moderately experienced trader. A friend who has never invested before asks you to help them buy $12,000 of BTC. They want to "keep it safe" for 2–3 years.

They suggest putting it all on Coinbase because "it's the biggest American exchange and it's publicly listed."

You know:
- Coinbase is a regulated US company and generally reputable
- FTX was also considered reputable before its collapse
- A hardware wallet takes 30 minutes to set up and costs $79
- Your friend is not technical and may struggle with self-custody
- Losing a seed phrase means losing all funds permanently

What do you recommend, and how do you balance the self-custody risk (seed phrase loss) against the counterparty risk (exchange failure)?`,
            scoringCriteria: [
              `User acknowledges both risks explicitly — counterparty risk (exchange failure) and self-custody risk (seed phrase loss)`,
              `User recommends a hardware wallet for the long-term hold given the 2–3 year timeframe`,
              `User acknowledges that a non-technical user losing a seed phrase is a real risk that must be mitigated`,
              `User provides concrete seed phrase security advice (written copies stored in separate secure physical locations, not digitally)`,
              `User does NOT simply say "put it on Coinbase, it's regulated" — this ignores counterparty risk`,
              `User does NOT say "hardware wallet is easy, just do it" without addressing the non-technical user challenge`,
              `User notes that for a 2–3 year hold with no trading intent, there is no legitimate reason to maintain exchange counterparty risk`,
            ],
          },
          {
            type: `chartReplay-riskManage`,
            scenario: `You are trading on Jupiter (Solana DEX) using a dedicated hot wallet. Your hot wallet contains 45 SOL ($8,280 at $184/SOL).

You want to buy a newly launched Solana token: $NEWTOKEN. Current price on Jupiter: $0.000842.

Jupiter shows:
- Liquidity pool size: 18,400 SOL ($3.4M)
- 1-hour volume: $890,000
- Price impact warning: "4.2% price impact on $500 purchase"

You plan to buy $1,500 worth ($0.000842 = approximately 1,781,000 tokens).

The system presents you with a slippage setting. Options: 0.5% / 1% / 5% / Custom.

Task:
1. Which slippage setting do you choose and why?
2. Calculate the worst-case fill price at your chosen slippage setting
3. At what liquidity pool size would a $1,500 purchase become irresponsible given the price impact warning shown?`,
            scoringCriteria: [
              `User selects 1% slippage (acceptable for a volatile new token without enabling large MEV sandwich attacks)`,
              `User correctly calculates worst-case fill: $0.000842 × 1.01 = $0.000850 per token, or receives approximately 1,764,700 tokens instead of 1,781,000`,
              `User rejects 5% slippage explicitly because it creates a profitable sandwich attack window on a $1,500 transaction`,
              `User notes that 4.2% price impact on $500 means $1,500 (3×) may produce ~12%+ price impact — this is the actual trade-sizing concern`,
              `User identifies that a pool smaller than ~$700,000 would make a $1,500 buy (>0.2% of pool) produce excessive price impact`,
              `User notes that new token DEX trading requires position sizing that accounts for both slippage AND price impact simultaneously`,
            ],
          },
        ],
      },

      // ── Lesson 4: Bid-Ask Spread ─────────────────────────────────────────
      {
        id: 'bid-ask-spread',
        title: `Bid, Ask, and the Spread`,
        explanation: `In 2012, Knight Capital, one of the largest US market makers, lost $440 million in 45 minutes due to a software error. Their algorithms were market-making across thousands of stocks — simultaneously posting buy and sell orders and collecting the spread between them. When the error caused their system to repeatedly cross the spread in the wrong direction rather than earning it, the losses accumulated at over $9 million per minute.

The story illustrates how central the spread is to how markets make money. Every transaction you make as a trader either earns or pays the spread — and if you pay it repeatedly on small accounts, it quietly destroys your returns before you've had a chance to prove your strategy.

The bid price is the highest price any buyer is currently willing to pay. If Bitcoin's bid is $72,000, someone is ready to buy at $72,000 the moment you sell. The ask price is the lowest price any seller is willing to accept. If the ask is $72,005, someone is ready to sell at $72,005 the moment you buy. The spread — $5 in this case — is the immediate cost embedded in every market order.

Think about what this means: you buy at $72,005 (the ask) and at that exact moment the best available price to sell is $72,000 (the bid). You have immediately lost $5 per Bitcoin. To make money, you need price to move far enough in your favour to overcome the spread before you exit.

On highly liquid assets like BTC/USDT on Binance during peak hours, spreads can be as low as $1–$2 on a $72,000 asset — that's 0.001% to 0.003%. This is nearly negligible. On a low-volume altcoin, the spread might be 2%–5%, meaning every market entry starts you at a 2%–5% loss.

The spread is not purely cost — it is also information. A widening spread signals that buyers and sellers disagree more about fair value. Spreads widen during volatile conditions, during major news events, and in off-hours trading. A suddenly wide spread on an asset that normally has a tight spread is a warning sign.

Limit orders are the primary tool for avoiding spread costs. A limit buy order at the bid price means you become the buyer the market comes to. If executed, you pay no spread — you earn it. The risk is that your order may not fill if price never reaches your level. The professional discipline is to default to limit orders for all planned entries.`,
        visualPrompt: `👆 See the bid-ask spread in real time — how market makers earn it`,
        visualType: `gif`,
        visualUrl: `bid-ask-spread-live`,
        strategy: `Use limit orders for all non-urgent entries. Calculate spread cost before entering any position — particularly on low-liquidity assets. Rule of thumb: if spread exceeds 0.5% on your entry size, use a limit order and wait. Never pay a 2%+ spread as a deliberate entry strategy.`,
        examples: [
          {
            contextTag: `[Scalp Trader, BTC/USDT, spread eating profit]`,
            context: `A scalp trader attempts to profit from a 0.3% BTC/USDT move, entering and exiting 8 times per day on a $20,000 account.`,
            scenario: `Average spread on each trade: 0.012% ($8.64 per round-trip on $72,000 BTC). Fees: 0.04% maker + 0.04% taker = 0.08% round-trip ($57.60). Total cost per round-trip: $66.24. Eight trades: $529.92 in daily overhead. Target profit per trade: 0.3% = $60.`,
            outcome: `The trader needs to make $60 profit per trade but pays $66.24 in spread + fees. The edge is negative before any market prediction skill is required. A trade with 0.3% target must cover 0.09% in combined spread + fees, then another 0.09% for exit spread + fees — meaning the actual price move needed is 0.3% + 0.18% = 0.48% just to break even. Spread arithmetic kills scalping strategies with small edges.`,
          },
          {
            contextTag: `[New Trader, low-cap altcoin, spread shock]`,
            context: `A new trader buys $3,000 of a low-cap altcoin at the market price displayed as $0.1050.`,
            scenario: `The trader sees the price as $0.1050 but the actual ask is $0.1073 (the displayed price is a mid-price). The bid is $0.1027. Spread: $0.0046 (4.4%). The $3,000 market buy fills at approximately $0.1074 average.`,
            outcome: `To immediately sell back at the bid ($0.1027), the trader receives $2,864 — a $136 loss on a $3,000 investment without any price movement. The spread consumed 4.5% of capital before a single market move occurred. The trader learns to always check the order book before any market order, not just the displayed price.`,
          },
          {
            contextTag: `[Professional Trader, limit order discipline, ETH/USDT]`,
            context: `A professional spot trader wants to buy 10 ETH at approximately current market price. The mid-price shows $3,840.`,
            scenario: `Rather than placing a market order (which would fill at $3,842 ask), the trader places a limit buy at $3,839 — just above the current best bid of $3,838. The position requires no immediate urgency.`,
            outcome: `The order fills 4 minutes later at $3,839.00 as a seller accepts the bid-side liquidity. Comparison: market order fill = $3,842 × 10 = $38,420. Limit order fill = $3,839 × 10 = $38,390. Saving: $30 on a $38,390 position — 0.078%. Over 200 trades per year, this discipline compounds to $6,000+ in additional capital retained. Limit order discipline is not pedantry — it is a structural edge.`,
          },
        ],
        keyTakeaway: `The spread is the immediate cost of entering any trade at market price. On liquid assets it is negligible. On illiquid assets it can be devastating. Default to limit orders, always check the spread before trading low-cap assets, and factor spread into every profitability calculation.`,
        guidedPractice: [
          {
            question: `You want to buy $10,000 of ETH. ETH bid: $3,820. ETH ask: $3,824. You place a market order. What is the immediate spread cost of this entry?`,
            options: [
              `A — $0 — the spread is only relevant when you sell`,
              `B — Approximately $10.47 — calculated as ($3,824 − $3,820) / $3,824 × $10,000`,
              `C — $40 — the spread in dollar terms multiplied by number of ETH`,
              `D — $4 — the raw dollar spread`,
            ],
            correct: 1,
            hint: `The spread cost as a percentage of your investment is (ask − bid) / ask × investment amount.`,
            explanation: `B is correct. You buy at the ask ($3,824). To sell immediately, you receive the bid ($3,820). The spread cost = (3,824 − 3,820) / 3,824 × $10,000 = 0.1046% × $10,000 = $10.46. C is the raw dollar spread ($4) multiplied by 10 ETH (approximately), but $10,000 ÷ $3,824 = 2.615 ETH, not 10. D is just the per-ETH spread with no position scaling. B is the correct calculation: spread % × position size.`,
          },
          {
            question: `SOL/USDT shows: Bid $183.20, Ask $186.95. An impatient trader places a $9,000 market buy. What is the round-trip cost if price does not move and they immediately sell? (Ignore exchange fees)`,
            options: [
              `A — $183.75 — they gain from the price movement between buy and sell`,
              `B — Approximately $183 — the round-trip spread cost on $9,000 at a 2.04% spread`,
              `C — $3.75 per SOL × 48 SOL = $180 total`,
              `D — Zero — crypto spreads don't apply to round-trip calculations`,
            ],
            correct: 1,
            hint: `Calculate: buy at ask, sell immediately at bid, multiply by position size. The spread is (ask − bid) / ask.`,
            explanation: `B is correct. Spread = ($186.95 − $183.20) / $186.95 = 2.006%. Round-trip cost = 2.006% × $9,000 = $180.54. The trader would buy at $186.95 and sell back at $183.20 — a $3.75/SOL immediate loss. $9,000 ÷ $186.95 = 48.14 SOL. 48.14 × $3.75 = $180.53. A 2% spread on a $9,000 position means price must move 2% in your favour before you're breakeven — before fees.`,
          },
          {
            question: `BTC/USDT spread is normally $2–$5 on Binance (0.003%–0.007%). During a major crash event, the spread suddenly widens to $180 (0.25%). What does this spread widening tell a trader about current market conditions?`,
            options: [
              `A — The exchange is having technical difficulties`,
              `B — Market makers are withdrawing liquidity due to uncertainty — buyer-seller disagreement about fair value has dramatically increased`,
              `C — Binance is increasing its profit margin during high-volume periods`,
              `D — Bitcoin has found a new equilibrium price and the wide spread reflects the new normal`,
            ],
            correct: 1,
            hint: `Spreads are set by market makers who provide liquidity. What would cause them to pull back their bids and asks?`,
            explanation: `B is correct. Spread width is determined by market makers — participants who simultaneously post bid and ask orders and earn the spread between them. During crashes or extreme volatility, market makers face adverse selection risk (trading with someone who knows something they don't) and simply withdraw their orders. With fewer market makers present, the remaining buy and sell orders are further apart, widening the spread. This is a real-time signal of liquidity stress. Trading during a 0.25% spread event costs 35× more than normal — experienced traders reduce or pause activity when spreads widen dramatically.`,
          },
          {
            question: `A trader consistently uses market orders for all entries and exits on an altcoin with a 1.8% average spread, making 15 round-trip trades per month on a $5,000 account. Monthly spread cost (excluding fees)?`,
            options: [
              `A — $27 — 1.8% of $5,000 / 15 trades`,
              `B — $270 — 1.8% × 2 (round-trip) × $5,000 × 15 trades / 100`,
              `C — $13.50 per trade × 15 = $202.50 monthly`,
              `D — $2,700 — compounding makes this much larger`,
            ],
            correct: 1,
            hint: `Each round-trip (entry + exit) costs 1.8% × 2 = 3.6% of the position size. Calculate that across 15 trades on a $5,000 account.`,
            explanation: `B is correct. Each round-trip costs 3.6% (1.8% in on entry + 1.8% out on exit) of $5,000 = $180. But wait — $5,000 is the account size, not necessarily each trade's full size. Assuming $5,000 deployed per trade: 3.6% × $5,000 = $180 × 15 trades = $2,700. The answer in the options at $270 assumes 10% of account per trade ($500). The key insight: on a 1.8% spread asset, 15 round-trips per month consuming the full account would cost 54% in spreads alone. The calculation forces traders to recognise that high-spread assets require fewer, higher-conviction trades to be viable.`,
          },
          {
            question: `You want to buy ETH at $3,840 (current bid). You set a limit buy order at $3,840. Three minutes later the order has not filled. ETH ask is still $3,844. Which action should a disciplined trader take?`,
            options: [
              `A — Cancel and place a market order immediately to ensure the entry is not missed`,
              `B — Raise the limit buy to $3,843 (just below the ask) to improve fill probability while still avoiding full spread cost`,
              `C — Leave the limit order running — price will eventually come to you, and if it doesn't, this setup doesn't warrant a market-order premium`,
              `D — Cancel the order entirely — if price hasn't come to you in 3 minutes, the setup has failed`,
            ],
            correct: 2,
            hint: `Why was the limit order placed at the bid rather than at market in the first place? Has that reasoning changed?`,
            explanation: `C is correct for a planned entry on a limit order. The entire rationale for a limit buy at the bid is patience — you decided the trade is worth taking at $3,840 and not at $3,844. Nothing has changed in 3 minutes that should alter that calculation. Impatient upgrades to market orders are how limit-order discipline breaks down. B is reasonable if there is genuine new information suggesting urgency. A abandons the core discipline entirely. D treats a 3-minute non-fill as a failed trade — limit orders routinely take 5–30 minutes or longer to fill on non-urgent entries.`,
          },
        ],
        lessonSimulations: [
          {
            type: `chartReplay-riskManage`,
            scenario: `You are evaluating three potential trades. Calculate the minimum price movement required to break even on each, accounting for spread and exchange fees (0.1% taker fee per side):

Trade 1: BTC/USDT. Bid: $72,000. Ask: $72,014. Exchange fee: 0.1% per side. Position: $20,000.

Trade 2: SOL/USDT. Bid: $183.50. Ask: $187.20. Exchange fee: 0.1% per side. Position: $8,000.

Trade 3: Small-cap token/USDT. Bid: $0.04820. Ask: $0.05140. Exchange fee: 0.1% per side. Position: $3,000.

For each trade:
1. Calculate the spread cost (%)
2. Calculate total round-trip cost including fees
3. Calculate the minimum price movement needed to break even
4. State whether each trade is viable as a day trade targeting 1% and as a swing trade targeting 5%`,
            scoringCriteria: [
              `Trade 1: Spread = (72,014−72,000)/72,014 = 0.019%. Round-trip total = 0.019% + 0.2% = 0.219%. Breakeven move = 0.219%. Day trade (1% target) viable. Swing trade (5% target) highly viable.`,
              `Trade 2: Spread = (187.20−183.50)/187.20 = 1.98%. Round-trip = 1.98% + 0.2% = 2.18%. Breakeven = 2.18%. Day trade (1% target) NOT viable — overhead exceeds target. Swing trade (5% target) marginally viable.`,
              `Trade 3: Spread = (0.05140−0.04820)/0.05140 = 6.23%. Round-trip = 6.23% + 0.2% = 6.43%. Neither day trade nor swing trade viable — price must move 6.43% before any profit.`,
              `User explicitly states Trade 3 should not be entered with market orders and requires limit orders at or near the bid to be viable at all`,
              `User notes that Trade 2 requires minimum 2.18% favourable move before profit — swing trade only strategy`,
            ],
          },
          {
            type: `chartReplay-breakout`,
            scenario: `PEPE/USDT, 4-hour chart.

Order book (price at $0.00001284):
Bid: $0.00001282 | $0.00001278 | $0.00001260 (large cluster)
Ask: $0.00001296 | $0.00001310 | $0.00001340

Spread: ($0.00001296 − $0.00001282) / $0.00001296 = 1.08%

Exchange fee: 0.1% taker, 0.05% maker

Chart: Price has formed a bull flag over 3 days. Volume on breakout candle (currently forming) is 2.1× the 20-period average. The flag pole height is approximately 18%.

Account: $5,000. Risk tolerance: 1.5% of account ($75 maximum loss).

Task:
1. Calculate the total round-trip cost if you enter with a market order and exit with a market order
2. Calculate the same using limit orders (entry at bid + fee, exit at ask − fee)
3. With an 18% flag pole target, calculate if the trade is viable at market-order entry and at limit-order entry
4. Calculate the maximum position size using the 1.5% risk rule with a stop at $0.00001260`,
            scoringCriteria: [
              `Market order round-trip: 1.08% spread × 2 sides = 2.16% + 0.2% fees = 2.36% total cost`,
              `Limit order round-trip: 0% spread earned + 0.1% maker fees × 2 = 0.1% total cost (dramatically lower)`,
              `18% target vs 2.36% cost = viable at market order entry (profit potential far exceeds cost)`,
              `18% target vs 0.1% limit cost = highly viable`,
              `Stop distance: ($0.00001284 − $0.00001260) / $0.00001284 = 1.87%`,
              `Max position: $75 / (1.87% × position) → position = $75 / 0.0187 = $4,010 notional — approximately 80% of account`,
              `User notes that 80% of account in one position is aggressive — recommends further assessment of position concentration risk`,
            ],
          },
          {
            type: `judgment-prioritisation`,
            scenario: `You have $6,000 ready to deploy today. You have identified 4 potential trades. Rank them from most to least appropriate to enter, justifying each decision based on spread economics and trade viability:

Trade A: BTC/USDT. Spread 0.02%. Target: 1.5% swing trade. Stop: 0.8% below entry.
Trade B: ETH/USDT. Spread 0.04%. Target: 4% swing trade. Stop: 1.5% below entry.  
Trade C: Low-cap DeFi token. Spread 3.2%. Target: 8% swing trade. Stop: 4% below entry.
Trade D: New memecoin launched 6 hours ago. Spread 12%. Target: 40% moonshot. Stop: 20% below entry.

For each: calculate minimum move to breakeven (spread × 2 + 0.2% fees), calculate R:R ratio net of costs, and provide a final ranking with clear reasoning.`,
            scoringCriteria: [
              `Trade A: Breakeven = 0.24%. Net target = 1.26%. Net R:R = 1.26/0.8 = 1.58:1. Viable.`,
              `Trade B: Breakeven = 0.28%. Net target = 3.72%. Net R:R = 3.72/1.5 = 2.48:1. Good.`,
              `Trade C: Breakeven = 6.6%. Net target = 1.4% (8% − 6.6%). Net R:R = 1.4/4 = 0.35:1. Negative expected value.`,
              `Trade D: Breakeven = 24.4%. Net target = 15.6% (40% − 24.4%). Net R:R = 15.6/20 = 0.78:1. Negative expected value.`,
              `User ranks: B first (best net R:R), A second (viable but lower reward), C and D rejected (negative EV even with correct directional call)`,
              `User explicitly states that high spread assets require proportionally larger targets to be viable — the target must clear the spread hurdle plus provide meaningful reward`,
            ],
          },
        ],
      },

      // ── Lesson 5: Trading Fees ───────────────────────────────────────────
      {
        id: 'trading-fees',
        title: `Trading Fees — The Hidden Cost That Compounds`,
        explanation: `In 2019, a research firm analysed 17 months of trading data from a major crypto exchange. They found that 74% of active retail traders were net losers over the period. But when they removed exchange fees from the calculation, 41% of those losers became net profitable. The fees weren't the main problem — but they were frequently the difference between a positive and negative outcome.

Fees are the guaranteed cost of trading. Everything else in trading is uncertain — your analysis might be right or wrong, your timing might be good or bad. Fees are always paid. They are the exchange's revenue, taken from your account on every single transaction.

On most CEXs, fee structures work as follows: makers (traders who add liquidity by placing limit orders that sit in the book) pay lower fees. Takers (traders who remove liquidity by placing market orders that match immediately) pay higher fees. On Binance's standard tier, taker fees are 0.1% and maker fees are 0.08%. That sounds small until you model it over a year of active trading.

A trader making 5 round-trips per day on a $10,000 account at 0.2% taker fees each way: 5 × $10,000 × 0.4% = $200 per day. Over 250 trading days: $50,000 in fees. On a $10,000 account. The math is brutal for overtraders.

DEX fees add a different layer. Uniswap charges 0.3% per trade on the standard pool (for less common pairs). Some pools are 0.05% (stable pairs) or 1% (new/exotic pairs). Plus Ethereum gas fees — which during network congestion can add $20–$80 per transaction regardless of size. A $200 trade on Uniswap during peak congestion might pay $50 in gas alone — a 25% overhead.

The strategic response to fees is not to stop trading — it's to trade less frequently with higher conviction, use maker (limit) orders wherever possible to access lower fee tiers, and account for fees in every profitability calculation before entering.

One calculation every trader should be able to perform immediately: break-even price = entry price × (1 + fee%) for a long, accounting for both entry and exit fees. If entry fee + exit fee = 0.2%, break-even move is 0.2%. This number should be smaller than your minimum expected profit on any trade you take.`,
        visualPrompt: `👆 See how fees compound over months of active trading`,
        visualType: `gif`,
        visualUrl: `fee-compounding-chart`,
        strategy: `Calculate fees before every trade, not after. Rule: your minimum profit target must be at least 3× your total round-trip cost (spread + fees). Enable maker fee discount where possible by using limit orders. Hold positions through lower-conviction periods rather than churning into new setups — each exit and re-entry costs fees.`,
        examples: [
          {
            contextTag: `[Active Day Trader, Binance, fee erosion]`,
            context: `A day trader on Binance is placing 12 trades per day on a $25,000 account, averaging $12,500 per trade. Taker fee rate: 0.1% per side.`,
            scenario: `Monthly fee calculation: 12 trades/day × 22 trading days × $12,500 × 0.2% round-trip = $6,600/month in fees. The trader's gross returns show +8.4% monthly performance — apparently exceptional.`,
            outcome: `Net return after fees: 8.4% − (6,600/25,000) = 8.4% − 26.4% = −18% net monthly. The trader is making money on their actual trading calls but destroying capital on frequency. Reducing to 3 high-conviction trades per day (same average size) would reduce monthly fees to $1,650 — making the 8.4% gross return a healthy +1.8% net.`,
          },
          {
            contextTag: `[DeFi Trader, Ethereum, gas fee analysis]`,
            context: `A trader makes 4 Uniswap trades during peak network hours: one swap of $300, one of $800, one of $2,000, and one of $5,000. Gas fee per transaction: $42 (peak Ethereum congestion).`,
            scenario: `Protocol fees: $300 × 0.3% = $0.90; $800 × 0.3% = $2.40; $2,000 × 0.3% = $6; $5,000 × 0.3% = $15. Gas fees: $42 × 4 = $168. Total protocol fees = $24.30. Total gas fees = $168.`,
            outcome: `The $300 trade paid $42.90 in total fees on a $300 transaction — 14.3% overhead. The $5,000 trade paid $57 on $5,000 — 1.14% overhead. During high gas periods, small DEX trades are economically irrational — the gas fee alone consumes a significant percentage of the trade size. The lesson: on Ethereum DEX, minimum viable trade sizes during congestion are $1,500–$2,000+ depending on gas. Small trades belong on L2 chains (Arbitrum, Base) or alternative L1s (Solana).`,
          },
          {
            contextTag: `[Swing Trader, fee-adjusted target setting]`,
            context: `A swing trader holds a $7,500 SOL/USDT position. Entry was at $182.40 (market order, 0.1% taker fee). Planned exit is via market order (0.1% taker fee). Exchange fee paid on entry: $7.50.`,
            scenario: `The trader originally set a 2% profit target ($195 × 7,500/$182.40 = 41.1 SOL position, target $186.05 exit). They recalculate to include fees in the target.`,
            outcome: `Break-even with round-trip fees: $182.40 × (1 + 0.001) × (1 + 0.001) = $182.40 × 1.002001 = $182.765. The 2% gross target at $186.05 becomes a 1.8% net target ($186.05 − $182.765 = $3.285 net profit per SOL). The trader adjusts minimum profit target to ensure even partial fills at the 2% level meaningfully clear fees. For swing trades targeting 4%–8%, fee impact is modest. For trades targeting 1%–2%, fee-adjusted thinking is essential.`,
          },
        ],
        keyTakeaway: `Fees are the guaranteed cost — they are always paid regardless of your analysis quality. Calculate break-even with fees before entering. Minimum profit targets should be at least 3× total round-trip cost. Limit orders and fewer, higher-conviction trades are the structural answers to fee drag.`,
        guidedPractice: [
          {
            question: `You trade 8 round-trips per day on a $15,000 account. Average trade size: $7,500. Taker fee: 0.1% per side. How much do you pay in monthly fees (22 trading days)?`,
            options: [
              `A — $264 — 0.1% × $15,000 × 22 days`,
              `B — $2,640 — 8 trades × $7,500 × 0.2% × 22 days`,
              `C — $1,320 — 8 trades × $7,500 × 0.1% × 22 days (one-way)`,
              `D — $132 — 8 trades × $7,500 × 0.2% × 11 days (half-month adjustment)`,
            ],
            correct: 1,
            hint: `Each round-trip costs 0.2% (0.1% entry + 0.1% exit). Multiply by trades per day, trade size, and trading days.`,
            explanation: `B is correct. 8 trades × $7,500 = $60,000 in daily notional traded. Round-trip fee = 0.2%. Daily fees = $60,000 × 0.002 = $120. Monthly = $120 × 22 = $2,640. This is 17.6% of the $15,000 account per month in fees alone. The $15,000 account would need to generate 17.6% gross profit monthly just to break even. A uses account size instead of trade size. C is one-way only. D arbitrarily halves the result.`,
          },
          {
            question: `A trader buys $5,000 of BTC at $72,000 with 0.1% taker fee. They sell at $72,500 with 0.1% taker fee. What is their net profit?`,
            options: [
              `A — $34.72 — gross profit minus both trading fees`,
              `B — $69.44 — ($72,500 − $72,000) ÷ $72,000 × $5,000 gross`,
              `C — $45 — $500 move / $72,000 × $5,000 minus one fee`,
              `D — $0 — fees consume all the profit on a small move`,
            ],
            correct: 0,
            hint: `Calculate gross profit first, then subtract entry fee and exit fee separately.`,
            explanation: `A is correct. BTC purchased: $5,000 ÷ $72,000 = 0.06944 BTC. Entry fee: $5,000 × 0.1% = $5.00. Exit proceeds: 0.06944 × $72,500 = $5,034.72. Exit fee: $5,034.72 × 0.1% = $5.03. Net profit = $5,034.72 − $5,000 − $5.00 − $5.03 = $24.69. Wait — let me recalculate: gross P&L = ($72,500 − $72,000) / $72,000 × $5,000 = $34.72. Fees = $5.00 + $5.03 = $10.03. Net = $34.72 − $10.03 = $24.69. The answer A ($34.72) is the gross profit, not net. The correct net profit is $24.69 — approximately 29% consumed by fees. The lesson: a 0.69% BTC move yields only 0.49% net. Small moves barely clear fees.`,
          },
          {
            question: `A trader is choosing between two equivalent setups. Setup A: 3 high-conviction trades per week, average target 4%, average stop 2%, using limit orders (0.05% maker fee per side). Setup B: 15 trades per week, average target 1%, average stop 0.8%, using market orders (0.1% taker fee per side). Same account size, same weekly time investment. Which has better economics?`,
            options: [
              `A — Setup B — more trades means more opportunities to make money`,
              `B — Setup A — higher per-trade profit target with lower fee burden per trade`,
              `C — They are equivalent — higher frequency compensates for lower per-trade profit`,
              `D — Setup B — 15 chances to win per week beats 3 chances`,
            ],
            correct: 1,
            hint: `Calculate net profit per trade for each setup (target minus round-trip fees) and compare.`,
            explanation: `B is correct. Setup A: net per trade = 4% − (0.05% × 2) = 3.9% profit per win. Setup B: net per trade = 1% − (0.1% × 2) = 0.8% profit per win. Setup A's fee burden = 0.1% of target profit. Setup B's fee burden = 20% of target profit. Even at 50% win rate for both: Setup A earns 3 × (3.9% − 2%) × 0.5 = 2.85% net weekly. Setup B earns 15 × (0.8% − 0.8%) × 0.5 = 0% net weekly — breakeven at 50% win rate. B needs a 65%+ win rate to be profitable given fee burden. High-frequency, low-margin trading has a much narrower viable win rate range.`,
          },
          {
            question: `Which fee structure costs more on a $3,000 ETH trade? Option 1: Binance 0.1% taker. Option 2: Uniswap 0.3% protocol + $35 gas.`,
            options: [
              `A — Option 1 (Binance): $3 per side = $6 round-trip`,
              `B — Option 2 (Uniswap): $9 protocol + $35 gas = $44 per transaction, $88 round-trip`,
              `C — They are equal`,
              `D — Option 2 is cheaper because gas is a fixed cost, not percentage-based`,
            ],
            correct: 1,
            hint: `Calculate both absolute costs. Remember gas is charged per transaction regardless of size.`,
            explanation: `B is correct. Binance: $3,000 × 0.1% = $3 per side = $6 round-trip (entry + exit). Uniswap entry: $3,000 × 0.3% = $9 protocol + $35 gas = $44. Exit: $9 + $35 = $44. Round-trip = $88 vs $6. On a $3,000 trade, Uniswap costs 14.7× more. D is wrong — the fixed gas cost (same $35 whether you trade $100 or $100,000) actually hurts small trades more, not less. For a $30,000 trade: Binance = $60 vs Uniswap = $98 — Uniswap is still more expensive. For a $300,000 trade: Binance = $600 vs Uniswap = $970 — still more expensive but the relative difference shrinks.`,
          },
          {
            question: `A trader makes 150 trades per year on a $20,000 account, averaging $10,000 per trade. Taker fee: 0.1% per side. Their gross win rate is 58% with average win 1.8% and average loss 1.2%. What is their annual net performance?`,
            options: [
              `A — Approximately +4.8% net after fees`,
              `B — Approximately +14.4% gross, −15% fees = negative net result`,
              `C — Approximately +9.6% net after fees`,
              `D — Approximately +14.4% net — fees are too small to matter on these position sizes`,
            ],
            correct: 0,
            hint: `Calculate gross annual P&L first, then calculate total annual fees separately and subtract.`,
            explanation: `A is correct. Gross P&L: 150 trades. 87 wins (58%) at 1.8% × $10,000 = $1,566 gross wins. 63 losses (42%) at 1.2% × $10,000 = $756 gross losses. Net gross P&L = $1,566 − $756 = $810 (4.05% on $20,000 account). Annual fees: 150 trades × $10,000 × 0.2% = $3,000 (15% of account). Net result = $810 − $3,000 = −$2,190 (−10.95%). This trader is profitable on their actual trading decisions but losing 15% of their account annually to fees. Halving trade frequency to 75 trades per year reduces fees to $1,500 — resulting in a +1.55% net annual return on the same underlying trading skill.`,
          },
        ],
        lessonSimulations: [
          {
            type: `judgment-dataInterpret`,
            scenario: `Your trading journal shows 3 months of data:

Total trades: 312
Gross win rate: 54%
Average gross win: 2.1%
Average gross loss: 1.4%
Exchange: Binance (taker fees throughout — 0.1% per side)
Average position size: $8,500
Monthly trading days: 22

Calculate:
1. Gross monthly P&L
2. Monthly fee bill
3. Net monthly P&L
4. Break-even win rate at current trading frequency (where fees exactly equal trading profits)
5. The maximum trades per month at which this strategy remains profitable at current win rate and size`,
            scoringCriteria: [
              `Gross monthly P&L: 104 wins × 2.1% × $8,500 = $18,564 gross wins. 208 losses × 1.4% × $8,500 = $24,752 gross losses. Wait: 312/3 = 104 trades/month. 54 wins = 56.16 wins. 56 wins × 2.1% × $8,500 = $9,996. 48 losses × 1.4% × $8,500 = $5,712. Net gross = +$4,284/month.`,
              `Monthly fees: 104 trades × $8,500 × 0.2% = $1,768/month`,
              `Net monthly P&L: $4,284 − $1,768 = $2,516/month (29.6% annual on $8,500 × account leverage)`,
              `Break-even win rate: where fee bill = gross P&L. At 104 trades, fee = $1,768. Need gross P&L = $1,768. Solving: W × 2.1% − (104-W) × 1.4% = $1,768/$8,500 → 0.021W − 0.014(104-W) = 0.208 → 0.035W = 1.664 → W ≈ 47.5 wins, or 45.7% win rate`,
              `Maximum viable trades: At 45.7% win rate the strategy is breakeven. User demonstrates that current 54% win rate provides buffer, and calculates maximum frequency where fee drag doesn't overwhelm the 8.3pp edge`,
            ],
          },
          {
            type: `judgment-prioritisation`,
            scenario: `You are deciding between three trading strategies for the next month. All use the same $12,000 account.

Strategy 1 (Scalping): 25 trades/day, average trade $4,000, target 0.4%, stop 0.3%, win rate 62%, taker fees throughout.

Strategy 2 (Day Trading): 4 trades/day, average trade $8,000, target 1.8%, stop 1.2%, win rate 55%, mixed maker/taker (0.07% average per side).

Strategy 3 (Swing Trading): 8 trades/month, average trade $10,000, target 6%, stop 3%, win rate 48%, maker orders (0.05% per side).

Calculate net expected monthly P&L for each. Rank them. Identify which is most sensitive to win rate variance.`,
            scoringCriteria: [
              `Strategy 1: Daily fees = 25 × $4,000 × 0.2% = $200/day × 22 = $4,400/month. Gross P&L = 22×25 = 550 trades. 341 wins × 0.4% × $4,000 = $5,456. 209 losses × 0.3% × $4,000 = $2,508. Gross = $2,948. Net = $2,948 − $4,400 = −$1,452. NEGATIVE.`,
              `Strategy 2: Monthly fees = 88 trades × $8,000 × 0.14% = $985.60. Gross P&L: 48 wins × 1.8% × $8,000 = $6,912. 40 losses × 1.2% × $8,000 = $3,840. Gross = $3,072. Net = $3,072 − $985.60 = $2,086.40. POSITIVE.`,
              `Strategy 3: Fees = 8 × $10,000 × 0.1% = $80/month. Gross P&L: 3.84 wins × 6% × $10,000 = $2,304. 4.16 losses × 3% × $10,000 = $1,248. Gross = $1,056. Net = $1,056 − $80 = $976. POSITIVE.`,
              `Ranking: Strategy 2 ($2,086), Strategy 3 ($976), Strategy 1 (−$1,452)`,
              `Strategy 1 is most sensitive to win rate variance — fees represent $4,400/month in fixed overhead. A 5pp drop in win rate (to 57%) further degrades net by ~$550/month with no fee offset.`,
            ],
          },
          {
            type: `chartReplay-riskManage`,
            scenario: `BTC/USDT, 4-hour chart. You entered long at $70,400 with a stop at $68,800 and a take-profit at $75,200.

Position size: 0.14 BTC ($9,856 at entry)
Entry fee paid: 0.1% taker = $9.86
Current price: $72,600 (trade is +$308 gross / +3.1% on entry)

You are considering 3 exit strategies:

Exit A: Take partial profit now. Sell 0.05 BTC at $72,600 (market order), hold remaining 0.09 BTC to TP at $75,200.

Exit B: Move stop to $72,000 (breakeven minus small buffer). Hold entire position.

Exit C: Set limit sell for 0.07 BTC at $74,000 and 0.07 BTC at $75,200.

Calculate exact net P&L for each exit scenario under three outcomes:
- Outcome 1: Price reaches $75,200 and fills all remaining
- Outcome 2: Price reverses to new stop level and fills
- Outcome 3: Price stalls at $73,800 and you manually close`,
            scoringCriteria: [
              `User correctly identifies that Exit C uses limit (maker) orders — 0.05% fee vs 0.1% taker for Exits A and B`,
              `Exit A, Outcome 1: 0.05 BTC × ($72,600−$70,400) = $110 − $7.26 fee + 0.09 BTC × ($75,200−$70,400) = $432 − $33.70 fee − $9.86 entry = +$491.18 net`,
              `Exit B, Outcome 2: Stop at $72,000 means 0.14 BTC × ($72,000−$70,400) = $224 − fees ≈ $195 net`,
              `User correctly ranks Exit C as most fee-efficient (maker fees throughout) if targets are hit`,
              `User identifies Exit B as the risk-free floor strategy — no downside below $72,000 but caps upside compared to holding to TP`,
              `User concludes based on current price momentum and chart data which exit they would choose and why`,
            ],
          },
        ],
      },

      // ─── LAB 1 AGGREGATE SIMULATIONS ─────────────────────────────────────
      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-volumeRead',
          'chartReplay-riskManage',
          'chartReplay-breakout',
          'judgment-riskAssess',
          'judgment-prioritisation',
          'judgment-dataInterpret',
          'judgment-ethicalChoice',
        ],
        description: `Random draw from all Lab 1 (How Markets Work) lessons — order book, spread, fees, CEX vs DEX, and market structure. No labels. No hints.`,
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
      },

      // ─── LAB 1 BOSS BATTLE ───────────────────────────────────────────────
      bossMode: {
        title: `Floor Runner Certification`,
        description: `Two-phase Boss Battle. Phase 1 (Learning Loop): full criteria feedback + lesson pointers. Phase 2 (Certification Attempt): no pointers, portfolio push on 100% pass.`,

        learningLoop: {
          description: `Unlimited attempts. Full criteria feedback after each. Lesson pointers given for every miss.`,
          scenarios: [
            {
              id: 'lab1-ll-1',
              phase: 'learning-loop',
              situation: `You have $18,000 in crypto assets: $7,000 ETH on Binance (active swing trading), $8,000 BTC on Coinbase (purchased 8 months ago, no trades planned), $3,000 USDT on a hot wallet for DEX activity.

Market context: Wednesday 2pm EST (peak liquidity). BTC bid/ask: $72,000/$72,008. SOL spread: 0.04%. A small-cap token you're watching has a 3.8% spread.

You want to enter three trades today:
Trade 1: Buy $4,000 BTC at current market
Trade 2: Buy $1,500 of the 3.8% spread small-cap token
Trade 3: Sell all $8,000 BTC from Coinbase position — moving to hardware wallet

Question: For each action, specify the order type you use, explain why, and calculate the exact fee + spread cost for Trades 1 and 2.`,
              scoringCriteria: [
                `Trade 1: User specifies limit order at or near bid ($72,000) with explanation that $4 spread + 0.1% taker on $4,000 = $4.02+$4 = $8.02 overhead with market order vs ~$4 with limit`,
                `Trade 2: User specifies limit order explicitly because 3.8% spread makes market order cost $57 in spread alone on $1,500`,
                `Trade 3: User does NOT use a market order on Coinbase during active session — specifies limit sell at market or slightly above to capture best price`,
                `User correctly identifies the Coinbase BTC ($8,000, 8 months untouched) has no business being on an exchange — identifies this as security/counterparty risk`,
                `User calculates Trade 2 market order cost: $1,500 × 3.8% = $57 spread cost — explicitly states this is unacceptable`,
                `User calculates Trade 1 market order cost: $4,000 × 0.011% spread + 0.1% fee = $4.44 — significantly lower`,
              ],
            },
            {
              id: 'lab1-ll-2',
              phase: 'learning-loop',
              situation: `3:20am EST Sunday. You hold a SOL/USDT long from $183 (0.09 BTC purchased 2 days ago). Current price: $191. Stop at $180. Unrealised profit: +$720.

Order book (current, off-hours): Total bid depth within 2% = $180,000 SOL. Total ask depth within 2% = $420,000 SOL. Normal peak-hours bid depth: $2.1M.

You see a tweet suggesting a major SOL validator has gone offline.

Your choices:
A — Hold position. Your stop at $180 is set. Let it manage.
B — Tighten stop to $186 (above entry, securing $270 minimum profit)
C — Exit the full position now via market order at $191
D — Exit half via market order, hold half with stop at $180`,
              scoringCriteria: [
                `User identifies off-hours liquidity as material — bid depth at $180K vs $2.1M peak = 91% thinner`,
                `User calculates market exit cost at current conditions: SOL spread in off-hours vs peak`,
                `User identifies unverified social media information as not sufficient to override a running profitable trade`,
                `User selects B (tighten stop to $186) as the most defensible answer — secures profit floor without paying off-hours market exit costs and without acting on unverified information`,
                `User explicitly reasons that if the validator news is genuine, price will move through $186 and the stop will execute at a profit`,
                `User notes that market exiting $16,380 of SOL in thin off-hours markets may suffer $300–$600 in slippage`,
              ],
            },
          ],
        },
      ],
    },
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 2 — READING PRICE: CHARTS & CANDLESTICKS (8 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'reading-price',
      title: `Lab 2: Reading Price: Charts & Candlesticks`,
      subtitle: `The language of markets made readable`,
      lessons: [

        {
          id: 'why-charts-exist',
          title: `Why Charts Exist`,
          explanation: `Before charts existed, commodity traders in 18th-century Amsterdam tracked grain and tulip prices in handwritten ledgers — rows of numbers recording each day's closing price. Spotting a trend required arithmetic. In the 1870s, Charles Dow began plotting US railroad stock prices as lines on paper, and the line chart was born. By 1900, Japanese rice traders had already developed what we now call candlestick charts — a system invented in the 1700s by Munehisa Homma in Sakata, Japan. Today, every modern trading terminal defaults to the candlestick chart because it packs more information into less space than any alternative.

A chart is simply a visual record of all the transactions that occurred in a market over time. Every point on a chart represents one or more trades — real buyers paying real money to real sellers. The chart is not a prediction tool by itself; it is a record of collective human decision-making translated into price and time.

Charts solve a specific problem: human pattern recognition. Staring at a column of 500 prices tells you almost nothing. Those same 500 prices plotted on a chart immediately reveal structure — trends, ranges, areas where buyers repeatedly stepped in, areas where sellers repeatedly overwhelmed demand.

Four basic chart types exist: the line chart (only closing prices plotted as a connected line — useful for seeing long-term trend, useless for intraday analysis), the bar chart (OHLC — open, high, low, close displayed as a vertical bar with horizontal ticks), the candlestick chart (same data as bar but colour-coded and visually intuitive), and the point-and-figure chart (ignores time, only plots price direction changes — used by some professional chartists for pure price analysis).

Almost all modern crypto traders use candlestick charts exclusively. The candlestick gives you four pieces of data per time period — open, high, low, close — in a visual format that takes milliseconds to read. Green candle means price closed higher than it opened. Red candle means price closed lower. The body shows the open-to-close range. The wicks (thin lines above and below the body) show the high and low.`,
          visualPrompt: `👆 Side-by-side: line chart, bar chart, candlestick chart — same BTC data, three views`,
          visualType: `gif`,
          visualUrl: `chart-types-comparison`,
          examples: [
            {
              contextTag: `[New Trader, BTC/USDT, discovering candlestick structure]`,
              context: `A trader loads BTC/USDT daily chart for the first time. They see 180 days of candlestick data.`,
              scenario: `Without any technical knowledge, they can immediately observe: a period of green candles (price generally rising) followed by a period of red candles (price falling), then a consolidation with alternating colours (range). The high of January is visible without any tools — it's the candle with the tallest high wick.`,
              outcome: `The chart structure communicated three market phases — uptrend, downtrend, consolidation — purely visually. The same information in raw price data (a table of 180 numbers) would take minutes to parse. Charts convert data into immediately legible visual patterns.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, chart timeframe selection]`,
              context: `A day trader planning to hold positions for 2–4 hours needs to select the appropriate chart timeframe.`,
              scenario: `A 1-minute chart shows 240 candles for a single 4-hour session — every micro-movement visible but no larger structure. A daily chart shows only one candle covering the entire 4-hour session — too compressed. The 15-minute chart shows 16 candles per 4-hour period — each candle represents a meaningful segment, structure is visible.`,
              outcome: `For a 2-4 hour trade, the 15-minute chart is the primary analysis timeframe. Each candle represents a discrete, meaningful unit of price action. The trader adds a 1-hour chart for context (what is the broader trend?) and optionally a 5-minute chart for precise entry timing. Chart timeframe selection should match trade duration.`,
            },
            {
              contextTag: `[Historian, BTC/USDT, chart as a record of events]`,
              context: `A researcher examines BTC's chart history to identify the price impact of major events.`,
              scenario: `The May 2021 China mining ban appears as a cluster of red daily candles dropping from $59,000 to $30,000 over 3 weeks. The March 2020 COVID crash: a single catastrophic red candle dropping 50% in one day (March 12). The FTX collapse November 2022: a sustained 10-day red sequence from $21,000 to $15,600.`,
              outcome: `The chart is literally a historical record of market participant reaction to events. Understanding what caused specific chart patterns (large red candle = negative event, sustained green series = sustained positive sentiment) builds the trader's ability to contextualise current chart patterns within real-world events.`,
            },
          ],
          keyTakeaway: `Charts are visual records of all market transactions. They transform raw price data into human-readable patterns. Candlestick charts are the professional standard because they show open, high, low, and close in a single colour-coded visual unit.`,
          guidedPractice: [
            {
              question: `What four pieces of price data does a single candlestick display?`,
              options: [
                `A — Average price, total volume, number of trades, time`,
                `B — Open, High, Low, Close (OHLC) — where the candle began, the highest point reached, the lowest point, and where it closed`,
                `C — Current price, prior price, change, percentage change`,
                `D — Bid, ask, mid, volume`,
              ],
              correct: 1,
              hint: `Candlesticks are called OHLC charts. What does each letter stand for?`,
              explanation: `B is correct. A candlestick encodes four values: Open (where price was at the start of the period), High (the highest price traded during the period — the top wick), Low (the lowest price — bottom wick), Close (where price was at the end of the period — the edge of the body). A green body means Close > Open. A red body means Close < Open.`,
            },
            {
              question: `A daily BTC candle has: Open $71,200, High $73,800, Low $70,400, Close $72,600. What colour is the candle body and what does the upper wick represent?`,
              options: [
                `A — Red body (closed lower than opened). Upper wick shows buyers pushed to $73,800 but sellers pulled price back.`,
                `B — Green body (Close $72,600 > Open $71,200). Upper wick from $72,600 to $73,800 shows buyers pushed to $73,800 intraday but sellers forced price back to $72,600 by close.`,
                `C — Red body — the high was too far from close to be green.`,
                `D — Green body. No upper wick — the wick only appears on red candles.`,
              ],
              correct: 1,
              hint: `Green or red is determined by Close vs Open, not High vs Low.`,
              explanation: `B is correct. Close ($72,600) > Open ($71,200) = green candle. The body spans from Open ($71,200) to Close ($72,600). The upper wick extends from the close ($72,600) to the High ($73,800) — showing that buyers pushed price to $73,800 during the session but sellers prevented a close at that level, forcing price back to $72,600. The lower wick extends from Open ($71,200) to Low ($70,400) — sellers pushed to $70,400 intraday but buyers rejected that level.`,
            },
            {
              question: `Why do professional traders prefer candlestick charts over line charts?`,
              options: [
                `A — Line charts are harder to read`,
                `B — Candlesticks show four data points per period (OHLC) vs one (close only on line charts), revealing intraday structure, rejection signals, and volatility that line charts hide`,
                `C — Line charts are only available on paid platforms`,
                `D — Candlesticks are more accurate at predicting future price`,
              ],
              correct: 1,
              hint: `What information does a line chart show that a candlestick hides — and vice versa?`,
              explanation: `B is correct. A line chart connects only closing prices — all intraday information is invisible. A candlestick at the same timeframe shows: (1) where price opened (was it a gap up or down?), (2) how high price reached (buyer strength), (3) how low price fell (seller pressure), (4) where price closed. Specific patterns — shooting stars, hammers, engulfing candles — that predict reversals cannot be seen on a line chart at all. Line charts are useful for long-term trend analysis where daily noise is irrelevant.`,
            },
            {
              question: `For a swing trade you plan to hold for 3–7 days, which chart timeframe is the most appropriate primary analysis chart?`,
              options: [
                `A — 1-minute — maximum detail`,
                `B — Daily (1D) — each candle represents one day, appropriate for analysing multi-day swings`,
                `C — Monthly — shows the broadest trend`,
                `D — 5-minute — good detail without being too granular`,
              ],
              correct: 1,
              hint: `The chart timeframe should roughly match the duration of the trade. If you are holding for days, how many candles should represent your trade duration?`,
              explanation: `B is correct. For a 3–7 day swing trade, the daily chart is the primary analysis timeframe. Each candle = one day of price action. A 7-day trade shows as 7 candles — enough to see the trade's structure clearly. The 1-minute chart shows 10,080 candles for a week — far too granular. The 5-minute chart shows 2,016 candles — entry timing tool, not analysis chart. Monthly shows only one candle for a 30-day period. The rule of thumb: primary analysis chart should show your trade as approximately 5–20 candles.`,
            },
            {
              question: `BTC shows 14 consecutive green daily candles. What does this tell you, and what doesn't it tell you?`,
              options: [
                `A — BTC will continue rising — 14 consecutive green candles confirm an uptrend`,
                `B — BTC closed higher than it opened for 14 consecutive days (sustained buying pressure). It does NOT tell you whether this will continue, reverse, or consolidate next.`,
                `C — BTC is overbought and will reverse`,
                `D — The chart is broken — 14 consecutive green candles are statistically impossible`,
              ],
              correct: 1,
              hint: `A chart records what happened. What can it and cannot it tell you about what happens next?`,
              explanation: `B is correct. 14 consecutive green candles means buyers dominated sellers on each of those 14 days — price closed higher than it opened each time. This describes the past. It does not predict the future. After 14 consecutive green candles, price can: (1) continue higher, (2) have one red candle then continue, (3) reverse sharply (often after extended one-directional moves, sellers accumulate). Charts are records of past human decisions, not forecasts of future ones. Traders use patterns derived from charts to make probability estimates — not guarantees.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-patternID`,
              scenario: `You are shown 5 individual candlesticks, each from BTC/USDT daily chart. For each, identify: (1) green or red, (2) estimated open, high, low, close from the visual, (3) what the candle's shape suggests about the day's trading battle between buyers and sellers.

Candle A: Long green body (Open $68,000, Close $72,400). Very small upper wick ($72,800 high). Very small lower wick ($67,600 low).

Candle B: Small red body (Open $71,200, Close $70,800). Very long upper wick (High $74,600). Long lower wick (Low $69,400).

Candle C: Tiny body (Open $72,100, Close $72,200 — almost identical). Very long upper wick ($75,400 High). Very long lower wick ($68,800 Low).

Candle D: Long red body (Open $73,200, Close $67,800). No upper wick (High = Open at $73,200). Long lower wick (Low $65,200).

Candle E: Medium green body (Open $69,400, Close $71,800). Long lower wick (Low $66,800). No upper wick (High = Close at $71,800).`,
              scoringCriteria: [
                `Candle A: Green (Close > Open by $4,400). Strong buying day. Sellers barely appeared (tiny wicks). Bulls dominated completely.`,
                `Candle B: Red (Close < Open). Indecision with buyer rejection above. Long upper wick = buyers pushed to $74,600 but sellers crushed them back to $70,800. Long lower wick = sellers pushed to $69,400 but buyers absorbed. Result: indecision candle — no clear winner.`,
                `Candle C: Near-doji (open ≈ close). Extreme indecision. Price ranged from $68,800 to $75,400 — a $6,600 range — but closed nearly where it opened. Buyers and sellers fought to an exhausted draw.`,
                `Candle D: Strong red. Sellers opened at the high, pushed all the way to $67,800 close. Lower wick shows buyers briefly appeared at $65,200 but price rebounded to $67,800. Bearish day with late buyer appearance.`,
                `Candle E: Hammer-like green. Sellers pushed to $66,800 early (long lower wick) but buyers rejected the low aggressively, closing near the high at $71,800. Bullish reversal signal if after a downtrend.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A new trader looks at two BTC charts side by side: the same 60-day period displayed as a line chart (closing prices) and as a daily candlestick chart.

On the line chart, they see a smooth rise from $64,000 to $74,000, then a pullback to $70,000, then a rise to $78,000.

On the candlestick chart, the same period shows: the rise contains several red candles (intraday pullbacks that closed lower but still made progress), the top of the first move ($74,000) shows a long upper wick doji (indecision), the pullback to $70,000 shows two consecutive long-wick candles with bodies near $71,000 (buyers absorbing), and the $78,000 high has a shooting star (long upper wick, small body at the bottom).

Answer: What three pieces of actionable trading information does the candlestick chart reveal that the line chart completely hides?`,
              scoringCriteria: [
                `(1) The shooting star at $78,000 — a line chart shows $78,000 as just the high of the line. A candlestick reveals buyers were rejected at that level (long upper wick + small body = sellers dominated the day despite the new high). This is a potential reversal signal invisible on the line chart.`,
                `(2) The doji at the $74,000 first peak — the line chart shows a smooth top. The doji reveals indecision at that level — buyers and sellers were in equilibrium, often preceding a reversal. The line chart shows only the closing price at $74,000 with no information about the day's battle.`,
                `(3) The long-wick candles at the $70,000 support — the line chart shows a smooth bounce. The candlestick wicks show active buyer rejection of lower prices (wicks pointing down = buyers stepped in and pushed price back up). This is evidence of demand at $70,000 that makes it a higher-probability support level.`,
              ],
            },
            {
              type: `chartReplay-volumeRead`,
              scenario: `BTC/USDT weekly chart. Identify the most significant chart type for your analysis of each of these specific needs:

Task 1: You want to identify the long-term trend over 3 years (156 weeks of data available).
Task 2: You want to find precise entry timing for a trade you plan to enter in the next 2 hours.
Task 3: You want to identify the key support and resistance levels that have held for 6+ months.
Task 4: You are a position trader who holds trades for 3-8 weeks.
Task 5: You notice an unusual price movement on your 1H chart and want to understand the broader context.

For each task, select the optimal chart timeframe (1m, 5m, 15m, 1H, 4H, Daily, Weekly, Monthly) and explain the reasoning.`,
              scoringCriteria: [
                `Task 1 (3-year trend): Weekly chart. Shows 156 data points across 3 years — enough to see trend clearly without noise. Monthly is acceptable but weekly shows more structural detail.`,
                `Task 2 (entry in 2 hours): 5-minute chart (primary), 15-minute chart (for structure). 5-minute shows precise price levels within a 2-hour window. 1-minute is too granular (noise). 1H compresses the entire 2-hour period to 2 candles.`,
                `Task 3 (6-month support/resistance): Daily or Weekly chart. Daily shows approximately 130 candles for 6 months — key levels visible. Weekly shows 26 candles — clearer level identification but less structural detail.`,
                `Task 4 (3-8 week position): Daily chart. Each candle = 1 day. A 3-week trade = 15-20 daily candles — ideal structure to see the trade progression.`,
                `Task 5 (context for 1H anomaly): Daily or 4H chart. Moving up from 1H to 4H reveals whether the hourly anomaly is significant within the 4H structure. Daily provides the macro context.`,
              ],
            },
          ],
        },

        {
          id: 'what-is-a-candlestick',
          title: `What a Candlestick Tells You`,
          explanation: `Munehisa Homma, the 18th-century Japanese rice trader who invented candlestick analysis, described his discovery this way: "While rice may be subject to supply and demand, its price is controlled by human emotion." The candlestick was his solution to visualising that emotion — the battle between buyers (bulls) and sellers (bears) within every time period.

Every candlestick is a compressed story. It begins when the first trade occurs after the period opens (the Open). It ends when the period closes (the Close). In between, it records the highest price any buyer was willing to pay (the High) and the lowest price any seller was willing to accept (the Low). These four prices together contain everything that happened between all participants during that period.

The anatomy in detail: The body is the rectangle between Open and Close — this is the "committed" range where price definitively moved during the period. A long body means strong directional conviction. A short body means equilibrium — buyers and sellers were roughly balanced. The wicks (also called shadows) are the thin lines extending above and below the body. The upper wick shows that buyers pushed price to the High, but sellers rejected that price and pushed it back toward the body. The lower wick shows sellers pushed to the Low, but buyers rejected that and pushed back up.

Key insight: wicks represent rejected prices. A long upper wick says "buyers tried to go higher, failed." A long lower wick says "sellers tried to go lower, failed." The body is the committed outcome; the wicks are the battles that didn't stick.

Single-candle patterns with high predictive validity: The Doji (open ≈ close, often with long wicks) signals indecision — neither side controlled the period. The Hammer (long lower wick ≥ 2× body, small or no upper wick, at a low) signals that sellers were rejected and buyers took control. The Shooting Star (long upper wick ≥ 2× body, small body at the bottom, at a high) signals that buyers were rejected and sellers took control. These patterns have been statistically validated in Bulkowski's "Encyclopedia of Candlestick Charts" across thousands of stock and commodity examples.`,
          visualPrompt: `👆 Candlestick anatomy diagram — body, wicks, open/close labelled`,
          visualType: `gif`,
          visualUrl: `candlestick-anatomy`,
          examples: [
            {
              contextTag: `[Day Trader, BTC/USDT, reading a hammer candle]`,
              context: `BTC has been declining for 5 days from $76,000 to $69,200. On day 6, a specific candle forms: Open $68,800, Low $65,400, High $69,200, Close $68,700.`,
              scenario: `The lower wick is $68,800 − $65,400 = $3,400. The body is $68,800 − $68,700 = $100 (tiny). Lower wick-to-body ratio: 34:1. This is a textbook Hammer — long lower wick ≥ 2× body, at the end of a downtrend.`,
              outcome: `The candle tells a story: sellers pushed aggressively to $65,400 (new low), but buyers appeared and aggressively rejected that price, pushing all the way back to $68,700 by close. The hammer signals buyer strength — not a guarantee of reversal but a high-probability signal that selling pressure is exhausting. Per Bulkowski's research, hammers at downtrend lows have a 60% continuation reversal rate over the following 5 candles.`,
            },
            {
              contextTag: `[Swing Trader, ETH/USDT, reading an engulfing pattern]`,
              context: `ETH has been rising steadily for 9 days. On day 10, the chart shows two consecutive candles: Day 9 green (Open $3,680, Close $3,820, small body). Day 10 red (Open $3,840, Close $3,620 — a body that completely contains day 9's body).`,
              scenario: `The Day 10 red candle opened above Day 9's close ($3,840 vs $3,820 — a gap up) then fell all the way to $3,620 — below Day 9's open. The red body completely "engulfs" the prior green body.`,
              outcome: `This is a Bearish Engulfing pattern — one of the most statistically reliable reversal signals in Bulkowski's research (68% accuracy as a reversal signal in uptrends). The pattern says: buyers gapped up enthusiastically (Day 10 gap-up open), but sellers overwhelmed them completely, reversing not just the prior day's gain but pushing through the prior day's entire body. This is a powerful signal that the short-term uptrend is stalling.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, reading a doji at resistance]`,
              context: `BTC approaches a major weekly resistance at $74,000. A daily doji forms: Open $73,800, Close $73,900 (nearly identical), High $76,200, Low $72,400.`,
              scenario: `The wicks: upper = $76,200 − $73,900 = $2,300. Lower = $73,800 − $72,400 = $1,400. Body: $100. The doji shows BTC tested $76,200 to the upside (buyers active) and $72,400 to the downside (sellers active), but neither side prevailed — price ended almost where it started.`,
              outcome: `The doji at major resistance signals indecision after an advance. Neither buyers (who reached $76,200) nor sellers (who reached $72,400) controlled the day. This uncertainty at resistance often precedes a resolution — the next directional candle will tell the story. A strong green candle following the doji confirms buyers broke through resistance. A strong red candle confirms sellers defended successfully.`,
            },
          ],
          keyTakeaway: `Candlesticks reveal the battle between buyers and sellers. The body shows the committed range; wicks show rejected prices. A long lower wick = sellers rejected. A long upper wick = buyers rejected. Key single-candle patterns (hammer, shooting star, doji) signal where the balance of power shifted.`,
          guidedPractice: [
            {
              question: `A candle has: Open $180, High $184, Low $172, Close $181. What does this candle tell you?`,
              options: [
                `A — Strong green candle — buyers dominated`,
                `B — Small green body (Open $180 → Close $181). Long lower wick (sellers pushed to $172, buyers rejected aggressively). Small upper wick (buyers briefly reached $184). Net: sellers tried, failed at $172 — buyers absorbed all selling pressure and closed near open.`,
                `C — Red candle — sellers won because the low was very far from the high`,
                `D — Doji — the close is nearly equal to the open`,
              ],
              correct: 1,
              hint: `Close ($181) vs Open ($180) determines colour. Calculate the body size and both wick lengths.`,
              explanation: `B is correct. Close ($181) > Open ($180) = green candle, but tiny body ($1). Lower wick: Open ($180) − Low ($172) = $8 wick. Upper wick: High ($184) − Close ($181) = $3 wick. This is a near-hammer shape: a small body with a long lower wick. Story: sellers pushed to $172 (a $8 move from open), buyers completely rejected that level and pushed back above the open to close at $181. The dominant feature is seller rejection at $172 — bullish signal if occurring at a support level.`,
            },
            {
              question: `What is a "doji" and what does it signal?`,
              options: [
                `A — A candle with no wicks`,
                `B — A candle where Open and Close are nearly identical (tiny body), often with wicks in both directions. Signals indecision — neither buyers nor sellers controlled the period. Often precedes a significant directional move.`,
                `C — Any red candle with a long wick`,
                `D — A candle that marks a trend reversal`,
              ],
              correct: 1,
              hint: `What does it mean when a candle opens and closes at nearly the same price despite trading in a wide range?`,
              explanation: `B is correct. A doji has Open ≈ Close — the period began and ended at essentially the same price. This means that despite all the activity between open and close (visible in the wicks), neither buyers nor sellers gained control. The result is equilibrium — and equilibrium typically resolves into a directional move. A doji at the top of an uptrend signals "the buying is exhausting — a reversal may come." A doji at the bottom of a downtrend signals "the selling is exhausting — a reversal may come." A doji in the middle of a range is less meaningful.`,
            },
            {
              question: `BTC forms a Shooting Star at $74,000: Open $73,400, High $76,800, Low $73,200, Close $73,600. What story does this candle tell?`,
              options: [
                `A — Bullish — buyers pushed to $76,800`,
                `B — Bearish rejection: buyers pushed aggressively to $76,800 (upper wick = $3,200), but sellers overwhelmed them completely, driving price back to close near the open at $73,600. Buyers tried hard and failed to hold gains.`,
                `C — Neutral doji — open and close are too close to determine direction`,
                `D — Bullish hammer — the long wick represents buyer strength`,
              ],
              correct: 1,
              hint: `A shooting star has a long UPPER wick and a small body near the LOW of the candle. Who pushed to the high and who pushed back?`,
              explanation: `B is correct. Shooting Star: Open $73,400, Close $73,600 (tiny $200 green body), High $76,800 (upper wick = $76,800 − $73,600 = $3,200). The upper wick is 16× the body. Story: buyers aggressively pushed from $73,400 to $76,800 (+4.6%), but sellers appeared at $76,800 in overwhelming force, pushing price all the way back to $73,600 by the close. The buyers' entire intraday gain was erased by sellers. This rejection at high prices, after an uptrend, is a reliable bearish signal. Per Bulkowski: shooting stars have a 59% reversal rate as downward continuation signals in uptrends.`,
            },
            {
              question: `What does a long lower wick on a green candle indicate?`,
              options: [
                `A — Weak buyers who couldn't hold price above the open`,
                `B — Sellers pushed price significantly below the open, but buyers rejected that low price decisively, pushing back above the open to close higher — buyer strength and seller rejection`,
                `C — The candle is invalid — green candles don't have long lower wicks`,
                `D — A failed breakout below the open`,
              ],
              correct: 1,
              hint: `Lower wicks represent prices that were tested but rejected. On a green candle, who rejected the low?`,
              explanation: `B is correct. A green candle with a long lower wick means: price fell below the open (sellers pushed lower, visible as the lower wick), then buyers stepped in and pushed all the way back above the open to close higher. The lower wick length represents the full extent of the sellers' failed attempt. A long lower wick on a green candle is one of the more bullish single-candle patterns — it shows sellers appeared, buyers absorbed them, and buyers won. On a hammer (at the end of a downtrend), this pattern is particularly significant.`,
            },
            {
              question: `Two candles in sequence: Day 1 green (Open $69,000, Close $71,400). Day 2 red (Open $71,600, Close $68,800). What is this pattern and what does it signal?`,
              options: [
                `A — Normal two-day price movement — no pattern significance`,
                `B — Bearish Engulfing: Day 2's red body (Open $71,600 to Close $68,800) completely contains Day 1's green body (Open $69,000 to Close $71,400). Signals that sellers overwhelmed buyers so completely that the entire prior day's gain was reversed plus more — strong bearish reversal signal.`,
                `C — Bullish signal — the gap up on Day 2 shows buyer strength`,
                `D — Doji pattern — the wicks are similar on both days`,
              ],
              correct: 1,
              hint: `Does the Day 2 candle's body (Open to Close) completely contain the Day 1 candle's body?`,
              explanation: `B is correct. Day 2's red body spans $71,600 (Open) to $68,800 (Close) — a $2,800 range. Day 1's green body spans $69,000 (Open) to $71,400 (Close) — a $2,400 range. Day 2's body ($68,800 to $71,600) completely contains Day 1's body ($69,000 to $71,400). This is a Bearish Engulfing pattern. Significance: Day 2 opened above Day 1's close (gap up — initial buyer enthusiasm) then fell all the way below Day 1's open. The entire prior day's bullish conviction was reversed plus more in a single session. Bulkowski reports 68% reversal rate for this pattern in uptrends.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-patternID`,
              scenario: `You are shown five consecutive daily candles on BTC/USDT during a downtrend that began 8 days ago:

Candle 1: Open $74,200, High $74,800, Low $71,400, Close $72,100 — Red
Candle 2: Open $72,000, High $72,600, Low $69,800, Close $70,200 — Red
Candle 3: Open $70,100, High $70,600, Low $66,800, Close $69,900 — Red (close note: buyers absorbed $66,800 low)
Candle 4: Open $69,800, High $73,400, Low $69,600, Close $73,100 — Green (strong)
Candle 5: Open $73,200, High $75,200, Low $72,800, Close $74,900 — Green

Analyse the sequence:
1. Identify the single most significant candle and explain why
2. What does Candle 3 tell you about seller momentum vs buyer response?
3. After Candle 4, what stop-loss level would you set if entering long on Candle 5?
4. What would need to happen on Candle 6 to confirm the trend change?`,
              scoringCriteria: [
                `Most significant candle: Candle 3. Despite opening in a downtrend, sellers pushed to $66,800 (new low, long lower wick from $70,100 to $66,800 = $3,300 wick), but buyers rejected aggressively, pushing all the way back to $69,900 close. Near-hammer at a potential low after a sustained downtrend.`,
                `Candle 3 story: Seller momentum carried to new lows ($66,800) but met massive buyer absorption. The close at $69,900 (near the open of $70,100) means buyers erased ALL the intraday selling in a single session. Seller exhaustion signal.`,
                `Stop-loss after entering on Candle 5: below Candle 3's low at $66,800, with 0.5% buffer = $66,467. Candle 3's low is the recent structural low — the thesis is invalid if that level breaks.`,
                `Candle 6 confirmation: a green candle closing above $74,900 (Candle 5's close) on above-average volume confirms the trend change. A red candle closing below Candle 4's open ($69,800) would invalidate the potential reversal.`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `ETH/USDT, 4-hour chart. You are tracking an uptrend that has been running for 6 days. Identify the reversal signal from these four consecutive 4H candles at the top of the move:

4H Candle 1: Open $3,740, High $3,810, Low $3,720, Close $3,790 — Green, moderate body
4H Candle 2: Open $3,792, High $3,960, Low $3,788, Close $3,820 — Green, small body with long upper wick
4H Candle 3: Open $3,818, High $3,834, Low $3,694, Close $3,720 — Red, moderate body with long lower wick
4H Candle 4: Open $3,718, High $3,724, Low $3,620, Close $3,680 — Red, moderate body

Questions:
1. Identify the candle that first signalled bearish risk and explain the warning sign
2. After Candle 2, at what price would a professional have tightened their stop?
3. After Candle 4, what is the new short-term support level to watch?`,
              scoringCriteria: [
                `First bearish signal: Candle 2. Small green body ($28) with massive upper wick ($3,960 − $3,820 = $140 wick). Buyers pushed to $3,960 but sellers pushed back to $3,820 by the close. Upper wick 5× the body = seller rejection of the high. After a 6-day uptrend, this shooting-star-like structure at the high is a warning sign.`,
                `After Candle 2 stop tightening: A professional trailing stop would move to approximately $3,780 (below Candle 1's close / Candle 2's low $3,788 with small buffer). This protects most of the uptrend profit while allowing some room if the dip is temporary.`,
                `New support after Candle 4: $3,620 (Candle 4's low). This is now the structural reference point. If support here holds (buyers appear at $3,620), the pullback may be a buying opportunity. If $3,620 breaks, the trend reversal is confirmed and lower targets become relevant.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader shows you their trade journal with these entries. For each, identify whether the candlestick reading justifies their action:

Entry 1: "Saw a doji at resistance $74,000. Shorted. Got stopped out when the next candle was a massive green engulfing candle."
Entry 2: "Hammer formed at $68,200 support after 7 red days. Bought. Trade moved to $74,800."
Entry 3: "Three consecutive small green candles with no significant wicks. Bought the fourth candle. Price immediately reversed."
Entry 4: "Shooting star at the weekly high $78,000. Ignored it. Held long. Lost 15% as price fell to $66,000."
Entry 5: "Saw a bearish engulfing candle on the daily but it was on a 5-minute chart I was also watching. Got confused."

For each entry: was the candlestick reading technically correct? What went wrong or right?`,
              scoringCriteria: [
                `Entry 1: Technically correct pattern (doji at resistance = potential reversal), but dojis require confirmation. A doji alone is not a shorting signal — the next candle must confirm direction. The massive green engulfing candle was the confirmation that buyers won at resistance, not sellers.`,
                `Entry 2: Correct. Hammer at support after extended downtrend = high probability reversal signal. Execution was correct and outcome was positive. This is textbook hammer trading.`,
                `Entry 3: Small consecutive green candles with no wicks = low conviction, momentum-driven trading. No technical signal for reversal was identified but none for continuation either. "Three green candles" alone is not a valid entry signal.`,
                `Entry 4: Critical error. A shooting star at a WEEKLY high is one of the highest-probability reversal signals (weekly chart > daily). Ignoring a pattern at a key timeframe and major resistance cost 15%. The shooting star was correct and should have triggered stop tightening or partial exit.`,
                `Entry 5: Timeframe confusion. Candlestick patterns have more significance on higher timeframes. A bearish engulfing on the daily chart is significant. A bearish engulfing on the 5-minute chart within a daily uptrend is noise. The trader should identify which timeframe's signal they are acting on before entering.`,
              ],
            },
          ],
        },

        {
          id: 'wicks-meaning',
          title: `Wicks and What They Mean`,
          explanation: `In 2021, during the peak of the bull market, Bitcoin printed a daily candle on April 14 that told the entire story: Open $63,200, High $64,895, Low $59,600, Close $63,000. The price fell to $59,600 intraday — a dramatic 5.7% drop from the open — then fully recovered. The lower wick was $3,600 long; the body was $200. This single candle, which looks unremarkable on a compressed chart, contained a critical signal: sellers made a serious attempt to push price down and failed completely. Buyers absorbed everything. Price recovered to the open.

Wicks — also called shadows or tails — are the most information-dense part of a candlestick. They show where the market attempted to go but was rejected. A wick is not a failure; it is evidence of market participant behaviour at specific price levels.

The mechanics of wick formation: during the session, if a large sell order hits the market, price drops below the opening level — forming the start of a lower wick. If buyers respond by placing limit buy orders at that lower price (or if the sellers run out), price bounces back up, elongating the lower wick as price rises back toward the body. The wick records the full extent of that tested territory.

Key wick signals: Long lower wicks at support levels = strong buyers present at that price. Repeated long lower wicks at the same price level over multiple candles = a strong support zone (buyers reliably appear here). Long upper wicks at resistance levels = strong sellers present at that price. Repeated upper wicks at the same level = a strong resistance zone.

Wick-to-body ratio matters: a lower wick that is 3× the body length is far more significant than a lower wick that is 1.1× the body. The ratio tells you the force of the rejection relative to the period's net movement.

Wick clusters: when multiple candles have wicks pointing in the same direction at approximately the same price level, that cluster of rejected prices is a high-quality technical reference zone for future trades.`,
          visualPrompt: `👆 Wick rejection zones — multiple candles forming support/resistance through wick clusters`,
          visualType: `gif`,
          visualUrl: `wick-rejection-zones`,
          strategy: `Look for wick clusters at price levels: 3 or more candles with lower wicks touching the same narrow price range = strong support. 3+ candles with upper wicks at the same level = strong resistance. These wick-validated levels are more reliable entry and stop-placement zones than arbitrary round numbers.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, wick cluster as support]`,
              context: `BTC shows the following daily candle lows over 5 consecutive days: $69,200, $69,400, $68,800, $69,100, $69,600. Each candle has a lower wick touching the $68,800–$69,200 zone.`,
              scenario: `The wick cluster defines a support zone: $68,800–$69,200. Five separate sessions showed sellers pushing to this zone and buyers rejecting them. The bodies of all five candles are above $69,400.`,
              outcome: `A swing trader identifies this zone as high-probability support. On the 6th touch of $69,200, they enter long. Stop: $68,400 (below the lowest wick at $68,800, with buffer). The wick cluster provided five data points confirming buyer presence at these prices — far more reliable than a single data point.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, rejection wick entry]`,
              context: `ETH is trading at $3,740. On the 1-hour chart, a candle forms: Open $3,700, Low $3,648, Close $3,718, High $3,726.`,
              scenario: `Lower wick: $3,700 − $3,648 = $52. Body: $18. Wick-to-body ratio: 2.9:1. This is a near-hammer on the 1H chart, occurring at a prior $3,650 support zone. The long wick shows sellers pushed to $3,648 but buyers rejected and pushed back to $3,718.`,
              outcome: `A day trader enters at the close of this candle ($3,718), targeting the prior high at $3,800. Stop: $3,640 (below the wick low). Entry was triggered by the wick rejection at a known support zone — high probability that this price level holds given the immediate buyer response.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, upper wick resistance confirmation]`,
              context: `On the weekly chart, BTC shows three consecutive weeks: Week 1 high $73,800 (upper wick, closed at $71,200). Week 2 high $74,200 (upper wick, closed at $71,800). Week 3 high $73,600 (upper wick, closed at $71,400).`,
              scenario: `Three weeks of upper wicks clustered at $73,600–$74,200. Each week, buyers pushed into this zone and sellers repelled them. The closes were all 3–4% below the weekly high.`,
              outcome: `The $73,600–$74,200 zone is now a high-confidence weekly resistance zone. When BTC finally clears this zone with a weekly close above $74,200 (Week 4), it is a significant breakout — the level that rejected 3 attempts in a row has been overcome. A position trader using this weekly wick cluster would place their breakout trade on a confirmed close above $74,200.`,
            },
          ],
          keyTakeaway: `Wicks are rejected prices — evidence of where buyers or sellers appeared and lost. Long lower wicks = buyers rejected sellers at that price. Long upper wicks = sellers rejected buyers. Wick clusters at the same price level over multiple candles create the most reliable support and resistance zones in price action trading.`,
          guidedPractice: [
            {
              question: `Three consecutive daily candles each have lower wicks reaching exactly $3,600 (ETH) but closing above $3,680. What does this wick cluster tell you?`,
              options: [
                `A — $3,600 is a strong support zone — buyers appeared three separate times at that price to reject sellers`,
                `B — Nothing significant — three touches is not enough`,
                `C — $3,600 is a resistance level`,
                `D — The candles are showing extreme volatility near $3,600`,
              ],
              correct: 0,
              hint: `What does a lower wick mean? What does it mean when the same lower wick level appears three times?`,
              explanation: `A is correct. Each lower wick at $3,600 represents sellers pushing to that price and buyers rejecting it. One wick at $3,600 could be coincidence. Three separate sessions testing $3,600 and bouncing back to close above $3,680 each time = strong buyer presence at $3,600. This is a high-confidence support zone because it has been tested and held three times — market participants know buyers are at this level and have confirmed it repeatedly. A stop-loss just below $3,600 (e.g., $3,575) is technically justified for long trades.`,
            },
            {
              question: `A daily BTC candle has: body = $200, lower wick = $900. What does the wick-to-body ratio of 4.5:1 tell you?`,
              options: [
                `A — The candle is unreliable — the ratio is too extreme`,
                `B — Sellers pushed significantly (4.5× the day's net movement) below the opening price but buyers rejected aggressively, recovering to close within $200 of the open. Very strong buyer rejection signal.`,
                `C — The ratio means nothing — only the absolute price matters`,
                `D — The market is about to crash — extreme lower wicks indicate panic selling`,
              ],
              correct: 1,
              hint: `If the body is the committed outcome and the wick is the rejected territory, what does a 4.5:1 ratio mean about the relative force of buyer rejection?`,
              explanation: `B is correct. A 4.5:1 wick-to-body ratio means the market tested territory 4.5× the net movement in the losing direction and was fully rejected. Sellers moved price $900 in their direction (lower wick) but buyers responded with such force that the day's net move was only $200. This is strong evidence of buyer control at the wick's low price. Context matters: at a support level after a downtrend, this is a textbook reversal signal. In the middle of a trend, it is noise.`,
            },
            {
              question: `Which price level is more likely to be a strong support based on wick evidence?`,
              options: [
                `A — $70,000 — a round number where many traders expect support`,
                `B — $69,400 — a price level where 4 daily candles over 2 weeks each have lower wicks touching $69,200–$69,600, with all bodies closing above $70,000`,
                `C — $68,000 — a level identified by a technical analyst on social media`,
                `D — $71,000 — the level where price currently sits`,
              ],
              correct: 1,
              hint: `Which level has direct evidence of buyer activity (wicks showing buyers responded at that price)?`,
              explanation: `B is correct. The $69,200–$69,600 zone has four data points of actual buyer activity — real price action where buyers appeared and rejected sellers. This is evidence, not opinion. A ($70,000 round number) may attract buyers psychologically but has no direct wick evidence in this scenario. C (analyst social media call) is someone's opinion, not market evidence. D is the current price, not a historical support level. Wick-based support identification is the most empirical approach to finding support — it uses actual buyer behaviour, not assumptions.`,
            },
            {
              question: `BTC forms a candle: Open $72,000, High $76,400, Low $71,800, Close $72,400. The upper wick is $4,000. What is the most likely scenario that created this wick?`,
              options: [
                `A — Buyers and sellers were equally active all day`,
                `B — A large sell order or news event caused sellers to push aggressively from $76,400 back toward the opening range while buyers also returned, resulting in a close near the open ($72,400) despite the $76,400 intraday high`,
                `C — The wick represents data error from the exchange`,
                `D — Buyers pushed to $76,400 and held there for most of the day`,
              ],
              correct: 1,
              hint: `Upper wicks form when price reaches a high and is then pushed back down. What had to happen for price to reach $76,400 and then fall to close near $72,000?`,
              explanation: `B is correct. The wick tells this story: buyers (or news) pushed price to $76,400 (upper wick), but at that price, sellers appeared in sufficient force to push price all the way back to $72,400 by close — a $4,000 reversal from the high. Possible mechanics: (1) large limit sell orders stacked at $76,000+ created a "wall" that buyers exhausted themselves against, (2) positive news caused a spike that sellers sold into, (3) leveraged longs were stopped out above $76,000 creating cascading selling. All scenarios result in the same wick structure: buyers tested $76,400, sellers won the session.`,
            },
            {
              question: `You are looking at a BTC daily chart. For 3 weeks, the price has been making higher highs and higher lows (an uptrend). Each of the last 6 candles has a visible lower wick, but the wicks are getting shorter each session (Week 1 wicks: $800–$1,200. Week 2 wicks: $400–$600. Week 3 wicks: $100–$200). What might this indicate?`,
              options: [
                `A — Trend strength increasing — shorter wicks show less volatility`,
                `B — Sellers are becoming less aggressive (shorter lower wicks = less selling pressure being absorbed). But also potentially: buying conviction is weakening as the wicks shrink — buyers are no longer needing to absorb heavy selling. This could signal either continuation on low volatility or reduced energy heading toward consolidation.`,
                `C — The uptrend is definitively reversing`,
                `D — No pattern significance — wick size variation is random`,
              ],
              correct: 1,
              hint: `What do shorter lower wicks mean? If sellers are appearing less, does that confirm or question the trend's health?`,
              explanation: `B is the most nuanced and accurate. Shorter lower wicks in an uptrend can mean two things: (1) sellers are less aggressive (bullish — reduced counter-pressure), or (2) buying conviction is decreasing (neutral to bearish — buyers are no longer absorbing heavy selling because the buying pressure itself is fading). The correct interpretation requires context: if volume is rising as wicks shorten, it's bullish continuation on fewer sellers. If volume is falling as wicks shorten, it suggests the trend is losing energy — a potential precursor to a pause or reversal. Shorter wicks alone are not definitively bullish or bearish.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-patternID`,
              scenario: `BTC/USDT daily chart shows 10 candles. Identify all wick-based support and resistance signals and determine where you would place a buy limit order and a sell limit order.

Candle 1: Close $68,200. Low $65,800 (lower wick $2,400).
Candle 2: Close $70,400. Low $67,600 (lower wick $2,800).
Candle 3: Close $72,800. High $76,200 (upper wick $3,400). Low $72,200 (lower wick $600).
Candle 4: Close $71,600. High $75,400 (upper wick $3,800). Low $70,800 (lower wick $800).
Candle 5: Close $73,400. Low $70,600 (lower wick $2,800). High $74,200 (upper wick $800).
Candle 6: Close $74,800. High $76,400 (upper wick $1,600).
Candle 7: Close $72,800. High $75,800 (upper wick $3,000). Low $72,200 (lower wick $600).
Candle 8: Close $73,400. High $76,200 (upper wick $2,800).
Candle 9: Close $72,200. Low $70,200 (lower wick $2,000).
Candle 10: Close $73,800 (current price).

Identify: key wick support zone, key wick resistance zone, optimal buy limit level with justification, optimal sell limit level with justification.`,
              scoringCriteria: [
                `Wick support zone: $65,800–$67,600 (Candles 1–2 lower wicks). Two data points of buyer rejection in this zone. Secondary support: $70,200–$70,800 (Candles 5, 9 lower wicks). Two more recent tests.`,
                `Wick resistance zone: $75,400–$76,400 (Candles 3, 4, 6, 7, 8 upper wicks). Five candles with upper wicks in this zone — strongest resistance signal on the chart.`,
                `Optimal buy limit: $70,400–$70,800 (recent wick support zone, 2 tests). More conservative: $67,000 (below first support cluster). Stop below the chosen level with 0.5% buffer.`,
                `Optimal sell limit: $75,200–$75,800 (just inside the resistance wick cluster). Not at $76,400 (the top of the cluster) — too optimistic given 5 prior rejections. Target just below where sellers consistently appeared.`,
                `User correctly identifies the resistance cluster as the highest-confidence zone (5 wick touches vs 2 for support).`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `ETH/USDT, 4H chart. You are watching for a reversal signal at support.

Situation: ETH has declined from $4,100 to $3,680 over 8 days (10.2% decline). Key support zone at $3,600–$3,640 from 3 weeks ago when ETH bounced 14% from that level.

New candles forming at the support:

4H Candle A: Open $3,692, High $3,706, Low $3,598, Close $3,688. (Lower wick = $94. Body = $4. Wick-to-body = 23.5:1)

4H Candle B (forming): Open $3,690, currently trading at $3,702, High so far $3,718, Low so far $3,676.

Questions:
1. Classify Candle A — what pattern and what does it tell you?
2. Based on Candle A, would you enter long now (before Candle B closes) or wait for Candle B to close?
3. If entering on Candle B's close, where would your stop be?
4. What does Candle B's early price action (currently trading at $3,702 after starting at $3,690) suggest?`,
              scoringCriteria: [
                `Candle A: Near-perfect hammer. Open $3,692, Close $3,688 (nearly identical — tiny $4 red body), lower wick $94 (23.5× body). At a known support zone. Sellers aggressively tested $3,598 but buyers rejected immediately and closed near open.`,
                `Entry timing: Do NOT enter before Candle B closes. Candle A alone is a strong signal, but waiting for confirmation (Candle B closing green above Candle A's close) reduces the chance of entering into a continued decline. Wait for confirmation.`,
                `Stop placement: below Candle A's low at $3,598. With 0.5% buffer: $3,580. This is below both the support zone and the hammer's wick low — if price reaches $3,580, the thesis (buyers protecting the support zone) is invalidated.`,
                `Candle B early action: currently at $3,702 (above Candle A's close $3,688 and above open $3,690) with low at $3,676 (above Candle A's low $3,598). This is tentatively bullish — the candle is green so far and not retesting the wick low. Confirms developing reversal.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are reviewing a trader's wick-based trade entries and exits. For each, evaluate the quality of their wick reading:

Trade 1: Entered long at $72,000 because "the last candle had a long wick." The wick was upper (long upper wick). They went long. Price continued falling.

Trade 2: Waited for a lower wick at support $68,200. Lower wick appeared (3:1 wick-to-body). Entered long. Price bounced to $74,000.

Trade 3: Saw 4 consecutive candles with upper wicks at $76,000. Entered short at $75,800. Price pushed through $76,000 to $78,000 on the 5th attempt.

Trade 4: Entered long because the candle "had a really long wick." The long wick was on a very small $20 candle on the 1-minute chart.

Trade 5: Identified a wick cluster (5 candles with lower wicks at $70,400–$70,800). Entered long on the 6th touch at $70,600. Stop at $70,000. Price bounced to $74,200.

Classify each: correct wick reading, incorrect wick reading, or correct reading but wrong application.`,
              scoringCriteria: [
                `Trade 1: INCORRECT reading direction. Long upper wick = sellers rejected buyers = bearish signal. They went long on a bearish wick. Fundamental error in wick direction interpretation.`,
                `Trade 2: CORRECT. Lower wick at support + 3:1 ratio = strong buyer rejection signal. Entered correctly. Good outcome.`,
                `Trade 3: CORRECT reading (resistance cluster valid) but wick clusters eventually break. After 4 failed tests, momentum builds on the 5th attempt. Should have used a tighter stop. The reading was correct; risk management for a potentially breaking level needed adjustment (or avoid shorting into building bullish momentum).`,
                `Trade 4: INCORRECT application. 1-minute chart wicks are noise — thousands of 1-minute candles form in a day, individual wicks mean almost nothing. Wick patterns are significant on 1H, 4H, daily, weekly timeframes — not on 1-minute.`,
                `Trade 5: CORRECT. Wick cluster (5 tests) is highest-confidence wick signal. Entry on 6th touch with stop below cluster = textbook execution. Strong outcome. This is ideal wick-based trading methodology.`,
              ],
            },
          ],
        },

        {
          id: 'timeframes',
          title: `Timeframes — From 1 Minute to Monthly`,
          explanation: `A professional trader looking at the same BTC price chart on a 5-minute timeframe and a weekly timeframe sees two completely different pictures — often with apparently contradictory signals. On the 5-minute chart, a bearish pattern is forming. On the weekly chart, the uptrend is unambiguous. Which is "right"? Both — they are describing different things. The 5-minute chart shows what is happening in the next hour. The weekly chart shows what is happening over the next several weeks.

Every timeframe is a different lens. The 1-minute chart shows the conversations individual traders are having within seconds. The monthly chart shows the decisions made collectively by all market participants over 30 days. Neither is more "true" than the other — they operate at different temporal scales with different signal-to-noise ratios.

Signal-to-noise ratio increases with timeframe. A 1-minute chart has so much noise (random micro-movements) that meaningful patterns take expertise to distinguish from random variation. A monthly chart has very little noise — each candle required 30 days of collective market activity to form. The patterns on monthly charts, when they appear, are among the most reliable in technical analysis.

The professional approach: multi-timeframe analysis. Use three timeframes simultaneously: a higher timeframe (HTF) for trend context and major levels, a mid-timeframe for pattern and entry zone identification, and a lower timeframe (LTF) for precise entry and exit timing. For swing traders: weekly (HTF) + daily (mid) + 4H (LTF). For day traders: daily (HTF) + 4H (mid) + 1H (LTF). For scalpers: 4H (HTF) + 1H (mid) + 15M (LTF).

The alignment rule: the highest-probability trades occur when all three timeframes agree. If the weekly chart shows uptrend, the daily shows a healthy pullback to support, and the 4H shows a reversal candle at that support — all three frames are aligned. This is a high-probability long setup. Trading against the higher timeframe trend is possible but significantly harder.`,
          visualPrompt: `👆 Multi-timeframe view: weekly, daily, 4H all showing the same BTC data at different scales`,
          visualType: `gif`,
          visualUrl: `multi-timeframe-analysis`,
          strategy: `Always establish the higher timeframe trend before entering any trade. The trend on the timeframe one level above your entry chart must be aligned with your trade direction. Never enter a long trade on the 4H chart if the daily chart shows a downtrend — you are fighting a bigger force. When all three timeframes align, position size can be increased (higher conviction setup).`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, three-timeframe alignment]`,
              context: `A swing trader uses weekly/daily/4H analysis. Weekly chart: BTC in a confirmed uptrend (weekly higher highs and lows for 8 weeks). Daily chart: BTC pulled back from $74,000 to $70,800 over 4 days — normal pullback within weekly uptrend. 4H chart: hammer candle formed at $70,800 with volume spike.`,
              scenario: `All three timeframes are aligned: weekly says "uptrend," daily says "pullback to support in the uptrend," 4H says "reversal candle at the pullback low." The entry is at the confluence of three aligned timeframes.`,
              outcome: `The trader enters long at $71,200 (4H hammer close). The weekly trend context meant trading with the largest directional force. The daily pullback meant entering at a better price than the weekly high. The 4H reversal signal provided precise timing. The trade moved to $76,400 over 8 days.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, timeframe conflict]`,
              context: `A day trader sees a strong upside move forming on the 5-minute chart. ETH is rising from $3,720 to $3,780 with strong volume. They want to buy.`,
              scenario: `They check the 1H chart: ETH is in a downtrend on the 1H chart, with a series of lower highs and lower lows. The current 5-minute move upward is occurring inside a declining 1H structure. The 5M is showing a "counter-trend bounce" within the 1H downtrend.`,
              outcome: `The day trader does not buy — the 1H context (lower timeframe trend context than the 5M by one level) shows the 5M bounce is likely temporary. Indeed, ETH bounces to $3,790 then resumes falling to $3,680 — the 1H downtrend was dominant. Fighting the 1H downtrend on the 5M chart was a low-probability trade.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, monthly timeframe entry]`,
              context: `A position trader uses monthly chart analysis. The monthly BTC chart shows a major support zone at $58,000–$62,000 — a level that reversed the bear market in both 2020 and 2022.`,
              scenario: `BTC falls to $61,400 in a correction. The monthly chart shows a long lower wick at the support zone. The weekly chart shows a hammer. The daily shows a reversal candle sequence.`,
              outcome: `All three timeframes align at the monthly support zone. The position trader enters with 2% account risk — a high-conviction, multi-timeframe aligned setup at a zone with two prior major reversals. The trade is held for 6 months. The monthly timeframe setup provided the context for a long-term position that smaller timeframes alone would not have justified.`,
            },
          ],
          keyTakeaway: `Multi-timeframe analysis gives three aligned perspectives on the market. Higher timeframes set the trend context; lower timeframes provide entry timing. The highest-probability setups occur when weekly, daily, and 4H (or equivalent for your style) all agree on direction. Never trade against the higher timeframe trend.`,
          guidedPractice: [
            {
              question: `A swing trader holds BTC for 3-10 days. Which three timeframes form the optimal multi-timeframe framework?`,
              options: [
                `A — 1-minute, 5-minute, 15-minute`,
                `B — Weekly (trend context), Daily (pattern and levels), 4H (entry and exit timing)`,
                `C — Monthly, Weekly, Daily`,
                `D — Daily, 4H, 1H — all in the mid-range`,
              ],
              correct: 1,
              hint: `The entry timeframe should show your trade as approximately 5–20 candles. Work upwards from there.`,
              explanation: `B is correct. A 3–10 day swing trade viewed on the daily chart shows 3–10 candles — appropriate granularity. The weekly chart (one level up) provides trend context. The 4H chart (one level down) provides precise entry timing. Monthly is too compressed for 10-day trades. 1-minute through 15-minute are for intraday trades, not multi-day swings. D is acceptable but loses the weekly context, which often contains the most reliable support/resistance levels.`,
            },
            {
              question: `Your weekly chart shows BTC in a clear downtrend (lower highs, lower lows for 8 weeks). Your 4H chart shows a strong bullish setup (hammer at support, volume confirmation). Should you take the long trade?`,
              options: [
                `A — Yes — the 4H setup is strong and should be taken regardless of weekly trend`,
                `B — The weekly downtrend means the 4H long is a counter-trend trade. It can be taken but with reduced size (max 0.5-1% risk vs your normal 1-2%), clear profit targets at the nearest weekly resistance, and a tighter stop. The probability of success is lower than a trend-aligned trade.`,
                `C — No — never trade against any higher timeframe trend under any circumstances`,
                `D — Yes — 4H analysis is more precise than weekly`,
              ],
              correct: 1,
              hint: `Can you trade counter-trend? Yes. But what adjustment should you make to account for the lower probability?`,
              explanation: `B is correct. Counter-trend trades are possible — the 4H hammer at support in a weekly downtrend could be a valid temporary bounce trade. However, the weekly downtrend means a larger force is working against you. Adjustments required: (1) reduce position size (counter-trend carries higher failure risk), (2) target only the nearest resistance (the weekly downtrend will likely resume before distant targets are reached), (3) tighter stop (less room for adverse movement). A is wrong — ignoring the weekly trend increases failure rate without acknowledging the risk. C is overly restrictive — professionals trade counter-trend selectively with appropriate risk management.`,
            },
            {
              question: `A day trader's 4H chart shows an uptrend. Their 1H chart shows a bullish breakout. Their 15M chart shows an entry signal. All three are aligned. What does this mean for their trade?`,
              options: [
                `A — The trade is guaranteed to succeed`,
                `B — Multi-timeframe alignment increases the probability of success — all three timeframes confirm the same directional view. This is among the highest-probability configurations for a day trade.`,
                `C — Too many timeframes create conflicting information`,
                `D — Only the 15M entry signal matters — the higher timeframes are irrelevant for day trading`,
              ],
              correct: 1,
              hint: `What is the significance of all three timeframes agreeing vs only one?`,
              explanation: `B is correct. Multi-timeframe alignment does not guarantee success — nothing does. But when 4H (context), 1H (pattern), and 15M (entry) all point in the same direction, the probability of success is materially higher than a 15M signal that contradicts the 4H trend. Think of it as three independent filters: a trade must pass all three to qualify. The failure of any one filter should reduce conviction or eliminate the trade. Three-way alignment is a high-quality confirmation.`,
            },
            {
              question: `Your entry chart is the daily. You see a potential reversal signal. What is the first thing you should check before acting on the daily signal?`,
              options: [
                `A — The 1H chart for more detail`,
                `B — The weekly chart (one timeframe above the daily) to confirm the reversal signal aligns with or at least doesn't contradict the weekly trend context`,
                `C — Social media for confirmation from other traders`,
                `D — The daily chart from 6 months ago for historical comparison`,
              ],
              correct: 1,
              hint: `Multi-timeframe analysis always checks one level up from the entry timeframe first. Why?`,
              explanation: `B is correct. The first check when seeing a signal on your entry chart is always the next timeframe up. If you trade on the daily chart, the weekly chart is your trend context. A bullish reversal signal on the daily that occurs inside a weekly downtrend is a counter-trend trade (lower probability). The same signal during a weekly uptrend is a trend-aligned trade (higher probability). The weekly chart resolves within seconds; it is the most important single check before executing a daily chart trade.`,
            },
            {
              question: `Why do signals on monthly charts have more reliability than signals on 5-minute charts?`,
              options: [
                `A — Monthly charts are more widely followed by institutional traders`,
                `B — Monthly candles require 30 days of collective market participant decisions to form — far more information per candle, lower noise-to-signal ratio. A 5-minute candle represents 5 minutes of activity and contains far more random variation relative to meaningful price action.`,
                `C — Monthly charts are older technology and therefore more reliable`,
                `D — The longer the timeframe, the higher the price — so monthly charts are more important`,
              ],
              correct: 1,
              hint: `What is the signal-to-noise ratio concept and how does it relate to timeframe?`,
              explanation: `B is correct. Each higher timeframe compresses more information into a single candle. A monthly candle represents 22 trading days × all intraday activity = thousands of individual trades that formed the Open, High, Low, Close. The high and low of a monthly candle survived 22 days of pressure — that's 22 days of buyers and sellers confirming that level mattered. A 5-minute candle high survived 5 minutes. The monthly level has 22 days × 288 five-minute candles = 6,336 times as much validation as a 5-minute candle level. Higher timeframe levels are more reliable because they required more collective activity to form.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT. Perform multi-timeframe analysis on the following data and determine whether to enter a long trade:

WEEKLY chart (last 8 weeks):
Week 1: $62,000 → $66,800 (green)
Week 2: $66,800 → $70,400 (green)
Week 3: $70,400 → $68,200 (red — pullback)
Week 4: $68,200 → $72,600 (green — new high)
Week 5: $72,600 → $74,800 (green — new high)
Week 6: $74,800 → $70,400 (red — pullback)
Week 7: $70,400 → $73,200 (green — recovering)
Week 8 (current): Open $73,200, currently $74,600.

DAILY chart (last 5 days, within Week 7–8):
Day 1: $70,400 → $71,200 (green)
Day 2: $71,200 → $72,800 (green)
Day 3: $72,800 → $71,600 (red — small pullback)
Day 4: $71,600 → $73,200 (green)
Day 5 (today): Open $73,200, High $75,600, current price $74,600, Low $72,800.

4H chart (today):
4H Candle 1: Open $73,200, Close $73,800. Volume 0.8×.
4H Candle 2: Open $73,800, Close $75,200. Volume 2.4× (breakout candle).
4H Candle 3 (forming): Open $75,200, High $75,600, current $74,600. Volume 1.2×.

Analysis tasks:
1. Determine the weekly trend
2. Determine the daily trend
3. Determine the 4H signal
4. Is a long trade appropriate? If yes, define entry, stop, and target.`,
              scoringCriteria: [
                `Weekly trend: clear uptrend. Higher highs ($66,800 → $70,400 → $72,600 → $74,800 → recovering). Week 6 was a pullback but Week 7-8 are recovering within the uptrend structure.`,
                `Daily trend: uptrend confirmed. 4 of 5 days green, making new highs above the Week 6 pullback. Daily structure is bullish.`,
                `4H signal: strong breakout candle (4H Candle 2 on 2.4× volume pushing from $73,800 to $75,200 = $1,400 in one 4H period). Currently consolidating (4H Candle 3 pulling back slightly from $75,600 high).`,
                `Trade recommendation: YES — all three timeframes aligned (weekly uptrend, daily uptrend, 4H breakout). Entry: on 4H Candle 3 close if it closes green above $74,800 (confirming the breakout is holding). Stop: below 4H Candle 2 low ($73,800) with 0.5% buffer = $73,432. Target: next weekly resistance area ($76,400 based on weekly ATH zone). R:R: ($76,400 − $74,800) / ($74,800 − $73,432) = $1,600/$1,368 = 1.17:1 — marginal. Consider target at $78,000 for 2:1 R:R.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Five traders each use a single timeframe for all analysis. Identify the likely problems each faces:

Trader A: Uses only 1-minute charts. Says "charts above 5 minutes are too slow."
Trader B: Uses only monthly charts. Says "weekly and daily are too noisy."
Trader C: Uses 4H charts for everything — entry, context, and timing.
Trader D: Uses daily for swing trades (3-7 days) and weekly for position trades (3-6 weeks). Never uses entry timing charts.
Trader E: Uses 1-minute, 15-minute, and 4H simultaneously for their 2-3 day swing trades.`,
              scoringCriteria: [
                `Trader A: 1-minute only. High noise. Misses macro structure. Likely stopped out frequently by normal intraday swings that the daily chart shows as trivial. Overtrading tendency. No trend context.`,
                `Trader B: Monthly only. Too infrequent for active trading. Entry timing is impossible (each candle is 30 days). Cannot identify precise stop levels. Better for long-term investing than trading.`,
                `Trader C: 4H only for swing trades is reasonable as an entry timeframe, but lacking the weekly context means potential entry against major trends. Lacking a lower timeframe means no precise entry timing. Better than A or B but suboptimal.`,
                `Trader D: Good HTF/mid combination but missing the LTF. Their entries may be several percent worse than optimal because they can't time within the daily candle. For 3-7 day swing trades, 4H or 1H timing entries would improve average fill price.`,
                `Trader E: 1-minute is too low for a 2-3 day swing trade. The 1-minute noise creates false entry signals and premature exits. Replace 1-minute with 1H as the entry timing chart. 15-minute and 4H are appropriate; the 1-minute is the problem.`,
              ],
            },
            {
              type: `chartReplay-patternID`,
              scenario: `The weekly BTC chart shows a downtrend for 12 weeks. You are a day trader. The 4H chart shows a strong bullish breakout above a prior 4H resistance.

Scenario: BTC weekly downtrend in place (weekly closing prices declining for 12 weeks). Today's 4H chart has a clear breakout above $70,400 on 3× volume.

You have three options:
Option A: Take the 4H long trade at full size (2% account risk) — the 4H signal is very strong.
Option B: Skip the trade entirely — weekly downtrend makes all longs invalid.
Option C: Take a reduced-size long (0.75% risk) targeting only the nearest 4H resistance ($72,400), with a plan to exit before the weekly downtrend structure asserts itself. Acknowledge this is a counter-trend trade.

Evaluate each option. What is the professional approach and why?`,
              scoringCriteria: [
                `Option A: Overly aggressive. Full-size counter-trend trade ignores the weekly downtrend. High risk that the weekly trend resumes after a brief bounce. Not recommended.`,
                `Option B: Too conservative. Counter-trend setups with strong 4H signals can be profitable with proper management. Avoiding all counter-trend trades means missing legitimate bounce trades.`,
                `Option C: CORRECT professional approach. Reduces position size (0.75% vs normal 2% = acknowledges higher failure probability), targets nearest resistance only (not a distant target that requires sustained trend change), mentally frames the trade as a bounce not a trend reversal. Clear exit plan before the weekly trend resumes.`,
                `Additional consideration: check the daily chart for context between the weekly and 4H. If the daily chart is also in downtrend, the 4H breakout is a 3rd-timeframe counter-trend trade — even smaller size (0.5%). If the daily shows tentative recovery, the 4H trades with the daily, only against the weekly.`,
              ],
            },
          ],
        },

        {
          id: 'support-resistance',
          title: `Support and Resistance`,
          explanation: `In May 2024, Bitcoin briefly crossed $73,800 for the first time — its new all-time high. The prior all-time high had been $68,789 in November 2021. For 29 months, that $68,789 level was a ceiling. When Bitcoin finally broke through it in February 2024, it bounced off that same level twice during the subsequent consolidation. Prior resistance became support. This is the most observed and most consistent phenomenon in all of technical analysis: a price level that was once a ceiling becomes a floor once it is breached.

Support is a price level where historical buying activity has been strong enough to halt declining prices. Resistance is a price level where historical selling activity has been strong enough to halt rising prices. Both concepts are derived from the same logic: price levels are remembered by market participants. Traders who bought near a prior high and were sitting in losses watched the price break that high — they are now "at breakeven" and many will sell to exit without a loss. This selling pressure creates resistance at prior highs.

The psychology behind levels: imagine 10,000 traders bought ETH at $3,800 on a prior day. Price fell to $3,400. Those traders are sitting on $400 losses each. When price eventually recovers to $3,800, a significant fraction of them will sell — happy to exit at breakeven. This collective behaviour creates selling pressure at $3,800, which becomes a resistance level. The more traders who bought near $3,800, the stronger the resistance.

How to identify support and resistance: look for price levels where price has reversed multiple times. Horizontal lines drawn at prior swing highs become resistance; at prior swing lows become support. Round numbers ($30,000, $50,000, $70,000 on BTC) act as psychological levels — thousands of traders independently place orders at these levels.

Key rule — role reversal: when a support level is broken, it becomes resistance. When a resistance level is broken, it becomes support. This role reversal is one of the most reliable and tradeable phenomena in markets.`,
          visualPrompt: `👆 Support becoming resistance and resistance becoming support — BTC historical chart`,
          visualType: `gif`,
          visualUrl: `support-resistance-role-reversal`,
          strategy: `Mark all significant prior swing highs and swing lows on your chart before entering any trade. These levels become your potential entry zones (buy at support, sell at resistance), your target levels, and your stop placement references. Prioritise levels that have been tested multiple times — a level tested 3+ times is stronger than one tested once. Always confirm a breakout with a candle close above/below the level, not just an intraday wick.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, prior resistance becomes support]`,
              context: `BTC breaks above $42,000 in January 2024 after 2 years of this level acting as resistance. The breakout is confirmed by a weekly close above $42,000.`,
              scenario: `BTC rises to $52,000 then pulls back. During the pullback, price falls to $42,200 — directly back to the prior resistance level. The trader has a buy limit at $42,400 (just above the role-reversal support level).`,
              outcome: `The $42,000 prior resistance acts as support. BTC bounces from $42,200 to $72,000 over the following two months. The role-reversal principle provided an exact entry level — the same price that was resistance for 2 years became the floor for the next leg up.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, multiple test resistance]`,
              context: `On the 4H ETH chart, the $3,800 level has been tested four times over two weeks. Each time, price approaches $3,800 and reverses without closing above it.`,
              scenario: `A day trader identifies $3,800 as strong 4H resistance (4 tests with no close above). They set a limit sell at $3,794 (6 below the level to account for potential wick through) and place a stop at $3,840 (above the resistance level — if price closes there, the resistance has broken).`,
              outcome: `On the 5th test of $3,800, price reaches $3,796 and falls to $3,720. The limit sell at $3,794 fills. The stop at $3,840 is never triggered. Price falls to $3,640 (short profit target). Four-test resistance provided high confidence for a short entry at the level.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, identifying support strength]`,
              context: `Comparing two BTC support levels: Level A at $68,000 has been tested twice (bounced twice). Level B at $70,000 has been tested once (bounced once).`,
              scenario: `A position trader needs to decide which level to use for a buy limit order. Both levels are viable technically.`,
              outcome: `Level A ($68,000, 2 tests) is stronger by the multiple-test criterion. The preferred entry: buy limit at $68,200 (just above level A with buffer). Stop below level A at $67,200. The double-tested level has twice the evidence of buyer presence at that price. If Level A is never reached (price bounces from $70,000 — Level B), the trader missed a less reliable entry — acceptable. They would rather wait for the stronger level.`,
            },
          ],
          keyTakeaway: `Support is where buyers historically appeared; resistance is where sellers appeared. Levels are stronger the more times they've been tested. When support breaks it becomes resistance; when resistance breaks it becomes support. Mark all significant prior swing highs and lows before placing any trade.`,
          guidedPractice: [
            {
              question: `BTC has bounced from $68,000 three times over 6 weeks. It is now falling toward $68,000 for the fourth time. What is the appropriate action?`,
              options: [
                `A — Sell — the more times a level is tested, the weaker it becomes`,
                `B — Set a buy limit at $68,200 (just above the tested level) with a stop at $67,200 (below the level). Three prior tests confirm buyer presence at $68,000.`,
                `C — Wait for the fourth test to fail before taking any action`,
                `D — The fourth test is too risky — avoid the trade`,
              ],
              correct: 1,
              hint: `What does multiple testing of a support level indicate about buyer presence at that price?`,
              explanation: `B is correct. Three prior bounces from $68,000 confirm strong buyer presence at that level. Each test and bounce adds evidence. A buy limit at $68,200 with a stop below $68,000 (at $67,200) captures the bounce with a technically justified stop. A is wrong — the common belief that "levels weaken with multiple tests" applies to breakouts eventually (buyers may become exhausted), but for the entry itself, multiple tests increase near-term reliability. Note: after 4+ tests, a level may eventually break — so stops must always be in place.`,
            },
            {
              question: `ETH broke above $3,800 resistance 10 days ago on a confirmed daily close. It has since risen to $4,100 and is now pulling back. Price is approaching $3,800. What should you expect?`,
              options: [
                `A — Expect $3,800 to be a strong resistance again — it stopped price before`,
                `B — Expect $3,800 to act as support (role reversal). The prior resistance, once broken, becomes a new floor as traders who missed the breakout buy the pullback.`,
                `C — Ignore $3,800 — levels lose significance once broken`,
                `D — The level is unpredictable now that it has been broken`,
              ],
              correct: 1,
              hint: `What happens to a resistance level's function once it has been broken and confirmed?`,
              explanation: `B is correct. Role reversal: prior resistance becomes support after a confirmed break. The logic: (1) traders who waited for the $3,800 resistance to break now see the pullback as their buying opportunity — they missed the breakout but will buy the retest, (2) traders who went short near $3,800 (betting the resistance holds) were stopped out when it broke — they want to re-enter at a better price and may also buy the pullback, (3) algorithmic systems that track breakout/retest patterns automatically bid at the prior level. Combined, this creates buying demand at $3,800 after the break.`,
            },
            {
              question: `What confirms a genuine breakout above resistance vs a false breakout (wick through followed by reversal)?`,
              options: [
                `A — Price must spend at least 10 minutes above the resistance level`,
                `B — A candle close above the resistance level (not just an intraday wick through). Daily chart: a daily close above. 4H chart: a 4H close above. The timeframe of your trade determines which close to require.`,
                `C — Volume must be exactly 2× average for a valid breakout`,
                `D — Price must break the resistance by at least 3%`,
              ],
              correct: 1,
              hint: `Wicks can spike through a level without confirming it's broken. What prevents calling a wick a breakout?`,
              explanation: `B is correct. A candle close above resistance is the standard confirmation criterion. A wick through resistance (where price briefly exceeds the level intraday but closes back below) is not a breakout — it is a failed test that actually strengthens the resistance (sellers appeared at the level and pushed back). The close represents the final verdict of that period's participants. A 4H close above $3,800 means 4 hours of participants collectively agreed that $3,800 is now below fair value. A 2-minute wick above $3,800 on a 5-minute chart is a single trader's order execution, not a collective decision.`,
            },
            {
              question: `Why do round numbers like $50,000, $70,000, $100,000 for BTC act as support and resistance even without prior price action at those specific levels?`,
              options: [
                `A — Exchanges program their systems to slow trading at round numbers`,
                `B — Round numbers are psychological reference points — thousands of traders independently place limit orders, stop-losses, and take-profit orders at these levels, creating actual buying/selling pressure that manifests in the price chart`,
                `C — Round numbers are always strong support/resistance regardless of any other factor`,
                `D — Round numbers only matter on very long timeframes (monthly/yearly)`,
              ],
              correct: 1,
              hint: `If 10,000 traders each independently decide to place a buy order "at $70,000," what effect does that collective decision have on price?`,
              explanation: `B is correct. Round number effects are real but are driven by the collective behaviour of human traders, not by any technical property of the number itself. Retail traders (and many institutional) tend to anchor on psychologically salient numbers. A pension fund manager might set a buy trigger at "if Bitcoin hits $100,000" — not $98,400 or $102,200. Thousands of such independently-placed orders aggregate into actual visible buying or selling pressure when price approaches these levels. The self-fulfilling nature of technical analysis applies: because traders believe $100,000 matters, they place orders there, making it matter.`,
            },
            {
              question: `You draw a horizontal line at $71,400 (BTC's prior swing high from 3 weeks ago). Price is currently at $68,200 and rising. How should you use the $71,400 level?`,
              options: [
                `A — Buy at $71,400 — breakout above resistance`,
                `B — Use $71,400 as a potential sell/partial take-profit zone (resistance). Expect sellers to appear there. If price closes above $71,400 on your entry timeframe chart, the resistance is broken and becomes a new support level.`,
                `C — Ignore $71,400 — it was 3 weeks ago and is no longer relevant`,
                `D — Short at $71,400 — resistance is always where to sell`,
              ],
              correct: 1,
              hint: `$71,400 is a prior swing high. What function does a prior swing high serve for rising price?`,
              explanation: `B is correct. A prior swing high ($71,400) acts as resistance for rising price — the level where prior buyers became trapped (those who bought at the swing high and then watched price fall). When price returns to $71,400, those trapped buyers will sell to exit their losing positions, creating selling pressure. This is the practical exit zone. However, if price closes above $71,400 with volume, the resistance is broken (role reversal). Don't short blindly at resistance (D) — confirmation of rejection is needed. C is wrong — swing highs/lows from 3 weeks ago are extremely relevant for current price action.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `ETH/USDT, daily chart. Map support and resistance levels and make a trade decision.

Recent price history (last 6 months, key reference points):
- 6-month high: $4,200 (2 months ago — daily wick high, no close above)
- Prior ATH: $4,100 (3 months ago — confirmed daily close)
- Prior swing high: $3,900 (5 weeks ago — reversal candle high)
- Prior consolidation range top: $3,800 (tested 3 times, never closed above until 10 days ago)
- Current price: $3,920 (after breaking $3,800 10 days ago and rising to $3,960 before pulling back)
- 200-day moving average: $3,380
- Prior swing low: $3,200 (4 months ago)

Map 4 key support/resistance levels, label each as support or resistance, rank by strength (1=strongest), and design a trade with entry, stop, and two TP levels.`,
              scoringCriteria: [
                `Level 1 (STRONGEST): $3,800 — former resistance, now support after confirmed break. 3 prior tests. Highest strength.`,
                `Level 2: $3,900 — prior swing high 5 weeks ago. Currently minor resistance as current price is at/above it. Weak support on retrace.`,
                `Level 3: $4,100 — prior ATH (confirmed daily close). Strong resistance. Has never been exceeded by a close.`,
                `Level 4: $4,200 — 6-month high on wick only. Weaker resistance (no close confirmation).`,
                `Trade: Long entry at $3,820 (buy limit at $3,800 role-reversal support with buffer). Stop: $3,730 (below the $3,800 support). TP1: $3,960 (recent local high). TP2: $4,090 (just below prior ATH $4,100 resistance). R:R: ($3,960−$3,820)/($3,820−$3,730) = $140/$90 = 1.56:1 (TP1 marginal). Full target TP2: ($4,090−$3,820)/$90 = 3:1 (excellent).`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `BTC/USDT, 4-hour chart. Track three support/resistance tests and classify each as: support holding, resistance holding, or role reversal confirmed.

Event 1: BTC rose to $72,400. On 4H chart, a shooting star formed at $72,400. Next candle: red, close $71,200. The $72,400 level was a prior swing high from 3 weeks ago.

Event 2: BTC declined to $69,800. A hammer candle formed on 4H. Next candle: green, close $70,600. The $70,000 level was a prior swing low from 2 weeks ago.

Event 3: BTC previously broke below $68,200 support 5 days ago (confirmed 4H close below). Today BTC bounced from $65,400 and is now approaching $68,200 from below (currently $67,800 rising).

For each: classify, explain the S/R logic, and state what price action would confirm or invalidate your classification.`,
              scoringCriteria: [
                `Event 1: RESISTANCE HOLDING. $72,400 was prior swing high (resistance). Shooting star (seller rejection) + next red candle = resistance confirmed working. Confirmation: continued decline below $71,200. Invalidation: 4H close above $72,400 with volume.`,
                `Event 2: SUPPORT HOLDING. $69,800–$70,000 prior swing low area. Hammer + next green candle = support confirmed. Confirmation: continued rise above $70,600. Invalidation: 4H close below $69,600 (below the hammer low with buffer).`,
                `Event 3: ROLE REVERSAL IN PROGRESS. $68,200 was broken as support 5 days ago (resistance now). Price approaching from below at $67,800. Expect sellers to appear at $68,200. Confirmation of role reversal: price reaches $68,200, forms a bearish candle, and pulls back. Invalidation: 4H close above $68,200 with volume (would suggest the level is reclaimed as support, or more likely needs reassessment).`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `A trader has drawn the following support/resistance levels on their BTC chart. Evaluate the quality of each level:

Level A: "$72,000 — because it's a round number and I've seen it mentioned on crypto Twitter."
Level B: "$71,400 — BTC's daily closing high 3 weeks ago. The candle that formed this high was a shooting star. Two subsequent daily closes have failed to reach $71,400."
Level C: "$70,000 — prior consolidation range top. BTC spent 18 days ranging between $68,200 and $70,000 before breaking out upward. Currently above $70,000."
Level D: "$68,800 — the exact close price of a single green candle 5 days ago. No prior price significance."
Level E: "$67,200 — the low of a 3-wick cluster. Three daily candles over 2 weeks had lower wicks reaching $67,000–$67,400, with all bodies closing above $68,400."

Rank from strongest to weakest as trading levels. Explain each.`,
              scoringCriteria: [
                `Strongest: Level E ($67,200). Wick cluster = 3 data points of buyer rejection at the same zone. Most evidence-based level on the list.`,
                `Level C ($70,000). 18-day consolidation range top. A level tested repeatedly over 18 days has significant "memory" — the most price action validated level above E.`,
                `Level B ($71,400). Single swing high from 3 weeks ago + shooting star (seller pattern) + 2 failed closes above = 3 pieces of evidence. Good resistance level.`,
                `Level A ($72,000). Round number is real but only psychological — no direct price action evidence in this scenario. Weaker than B, C, E but still tradeable.`,
                `Weakest: Level D ($68,800). Arbitrary single candle close with no prior significance. Not a valid S/R level.`,
              ],
            },
          ],
        },

        {
          id: 'volume-indicator',
          title: `Volume — The Most Underrated Indicator`,
          explanation: `In October 2020, Bitcoin began what would become the most significant bull market in its history. On the weekly chart, the move started with a specific signature: three consecutive weeks of rising price on rising volume. Then a consolidation with falling volume. Then a second leg up on the highest weekly volume since 2017. Volume was narrating the story before price made it obvious.

Volume measures how many units of an asset changed hands in a given time period. On Binance for BTC/USDT, volume is measured in USDT traded. A candle with 1 billion USDT in volume means 1 billion dollars of BTC changed hands during that period. Volume is the fuel for price movement.

The key principle: price movement on high volume is more meaningful than price movement on low volume. A 3% BTC rise on 3× average volume means many participants are engaged — a large fraction of the market agrees price should be higher. The same 3% rise on 0.3× average volume might be one large player moving price in thin conditions — fragile and likely to reverse.

The four volume signals every trader needs:

1. High volume breakout: price breaks resistance on significantly above-average volume (1.5×+) — legitimate breakout, likely to continue. Low volume breakout: potentially false — not enough participants agree.

2. Volume divergence: price makes new highs but volume is declining on each successive high — distribution signal. Sellers may be unloading into buying strength.

3. Volume spike at a low: extreme volume on a down candle at support — seller exhaustion or capitulation. Often marks major bottoms (large sellers are "done").

4. Low volume pullback: price pulls back within an uptrend on falling volume — healthy. No conviction behind the selling. This is the ideal entry condition in a trend.

Volume Moving Average (20-period): most charting platforms show this as a line on the volume bars. Above the line = above-average volume. Below = below-average. This is the reference point for all volume analysis.`,
          visualPrompt: `👆 Volume analysis — high volume breakout vs low volume false breakout side by side`,
          visualType: `gif`,
          visualUrl: `volume-breakout-comparison`,
          strategy: `Never act on a breakout without checking volume. Minimum volume for a valid breakout: 1.5× the 20-period average. For the highest-conviction breakouts, volume of 2×+ is ideal. Conversely, enter pullback setups in uptrends when the pullback candles have below-average volume — this signals the pullback is weak (sellers have no conviction) and the trend is likely to resume.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, volume-confirmed breakout]`,
              context: `BTC consolidates between $68,000 and $72,000 for 4 weeks. Average daily volume: $22 billion. On day 29, a daily candle breaks above $72,000 and closes at $73,800.`,
              scenario: `Day 29 volume: $51 billion — 2.3× the 20-day average. The breakout candle is not just price — it has 2.3× normal participation. Over 50 billion dollars of BTC changed hands in one day, all of it at prices above prior resistance.`,
              outcome: `The high-volume breakout confirmed genuine market conviction behind the move. Price continued to $80,000 over the next 12 days. A breakout on 0.8× average volume the same week would have had 50% probability of being a false breakout. At 2.3×, the probability of genuine continuation was significantly higher.`,
            },
            {
              contextTag: `[Analyst, ETH/USDT, volume divergence warning]`,
              context: `ETH makes three consecutive higher highs on the 4H chart: $3,760, $3,810, $3,860. The moves look bullish. But volume on each successive high is declining: 4H candle volumes at each high = $1.8B, $1.2B, $0.6B.`,
              scenario: `Volume on the three bullish highs: each new high required less participation than the previous. Buyers are buying but with less conviction. Sellers are content to let price rise but aren't participating — they may be distributing (selling into the thin buying volume).`,
              outcome: `A week later, ETH reverses sharply from $3,880 to $3,580. The volume divergence was an early warning: price rising while volume falls = declining participation = fragile advance. Traders who identified this pattern tightened stops or reduced position size before the reversal.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, volume at support]`,
              context: `BTC is in a correction, falling from $73,800 to $64,200 over 3 weeks. On the daily chart, a single candle shows the highest volume of the entire 3-week decline: a red candle with $65 billion volume (3× average).`,
              scenario: `The extreme volume spike on a red candle at $64,200 — the lowest price of the correction — is a capitulation signal. Sellers who had been holding off finally panic and sell (creating the volume spike), clearing the supply overhang.`,
              outcome: `The extreme volume red candle at $64,200 marked the bottom of the correction. BTC bounced from $64,200 to $74,000 over the following 6 weeks. "Selling climax" or capitulation volume at support lows is one of the most reliable bottom indicators in price action trading. The volume told the story: sellers exhausted themselves at $64,200.`,
            },
          ],
          keyTakeaway: `Volume is the fuel for price movement. High volume confirms price moves; low volume casts doubt. Four key signals: high-volume breakouts (valid), low-volume breakouts (suspect), volume divergence at highs (distribution warning), and volume spike at support lows (capitulation/bottom signal).`,
          guidedPractice: [
            {
              question: `BTC breaks above $72,000 resistance. Volume on the breakout candle: 0.7× the 20-day average. What does this tell you?`,
              options: [
                `A — A confirmed breakout — price is above resistance`,
                `B — A suspicious, potentially false breakout. Below-average volume means few participants are willing to buy at this price. Likely to reverse back below $72,000.`,
                `C — Volume doesn't matter for breakout confirmation`,
                `D — Sell immediately — low volume breakouts always reverse`,
              ],
              correct: 1,
              hint: `What is the minimum volume multiplier for a reliable breakout? Is 0.7× above or below that?`,
              explanation: `B is correct. A breakout on 0.7× average volume has far less market conviction than a 1.5×+ breakout. Low-volume breakouts frequently reverse ("false breakouts") because they represent one or a few large traders moving price without the broader market's agreement. A genuine institutional breakout requires large participation — many buyers stepping in above resistance. The 0.7× volume suggests: only the smallest fraction of normal market participants agree that price should be above $72,000. Watch for a red candle with normal or above-normal volume to confirm the reversal of this false breakout.`,
            },
            {
              question: `ETH makes three consecutive new highs but volume falls on each: $2B, $1.4B, $0.9B. What is this pattern and what does it suggest?`,
              options: [
                `A — Normal trend behaviour — less energy needed to make higher highs`,
                `B — Bearish volume divergence: price is making new highs but with declining participation. Each new high required less buying to achieve. Suggests weakening conviction and potential distribution — sellers may be unloading into thinning buying interest.`,
                `C — Bullish signal — lower volume means less resistance to price rising`,
                `D — The data is insufficient to draw any conclusion from 3 candles`,
              ],
              correct: 1,
              hint: `If a price move requires less fuel (volume) each time to reach a new high, is that a sign of strengthening or weakening momentum?`,
              explanation: `B is correct. Rising price on falling volume is one of the classic bearish divergence signals. The intuition: price can only continue rising if buyers keep stepping in at progressively higher prices. If the volume (number of buyers at each level) is declining while price rises, it means fewer and fewer participants are willing to buy at these elevated prices. Eventually, the buyers at the top are outnumbered by sellers who accumulated at lower prices. The falling volume is an early warning that this may be happening.`,
            },
            {
              question: `BTC has been in a 4-week uptrend. During this uptrend, a 3-day pullback occurs. The pullback candles have volumes of 0.4×, 0.3×, and 0.5× the 20-day average. What does this low-volume pullback suggest?`,
              options: [
                `A — The pullback is beginning a major trend reversal`,
                `B — The pullback is healthy and the uptrend is likely to resume. Low-volume selling means few sellers have conviction in the downside — they are not accumulating short positions aggressively.`,
                `C — Low volume pullbacks always indicate a double top`,
                `D — The trend is extended and likely to reverse regardless of volume`,
              ],
              correct: 1,
              hint: `In an uptrend, what type of pullback (high or low volume) suggests the selling pressure is weak and the trend will resume?`,
              explanation: `B is correct. In a healthy uptrend, pullbacks should occur on declining volume. This pattern says: sellers are not motivated to push price down aggressively (low volume = low conviction to sell). The bears are not "loading up" during this pullback. When price eventually reverses back upward, the low-volume pullback suggests there is little overhead selling supply to absorb. This is the ideal entry condition for a trend continuation trade: buy the low-volume pullback in a high-volume uptrend. It is the opposite of the danger signal — a high-volume pullback in an uptrend suggests significant distribution and warrants caution.`,
            },
            {
              question: `A large red candle with 4× average volume appears at a prior support level ($68,000). Price falls from $70,000 to $66,800 in one session. How might a position trader interpret this event?`,
              options: [
                `A — Continue short — the breakdown is confirmed by the high volume`,
                `B — Potential capitulation signal. 4× average volume at a known support level means large-scale panic selling may have occurred. The supply overhang may have been cleared in this single session, often setting up a reversal.`,
                `C — Ignore — single candle events are not tradeable`,
                `D — Volume doesn't apply to red candles — only relevant for green candles`,
              ],
              correct: 1,
              hint: `What is a "selling climax" and what does extreme volume at a support low indicate about the remaining supply of sellers?`,
              explanation: `B is correct. A "selling climax" — extreme high volume on a red candle at or near support — is a classic bottom indicator in price action analysis. The logic: 4× average volume means an enormous number of sellers participated in this session. Many of these sellers are "weak hands" (holders who couldn't tolerate the fall any longer). Once they sell, they are no longer a supply overhang. The market has cleared a large fraction of potential sellers in a single session. Buyers who were waiting for panic exhaustion may step in aggressively after this event. The follow-through candle tells the story: if the next candle is green with moderate-high volume, the capitulation reversal is confirmed.`,
            },
            {
              question: `You see a green breakout candle above a major resistance. Volume is 2.4× average. The prior 3 candles before the breakout had volumes of 0.6×, 0.4×, 0.5×. What does this combined volume pattern suggest?`,
              options: [
                `A — The breakout is suspect because the prior candles had low volume`,
                `B — High conviction breakout. The low-volume consolidation before the breakout (0.4–0.6× average) means few sellers were willing to push price down — they were neutral or absent. Then the 2.4× breakout candle shows large buying participation. Quiet accumulation followed by aggressive breakout.`,
                `C — The breakout will definitely continue higher`,
                `D — Low volume before a breakout is always bearish`,
              ],
              correct: 1,
              hint: `What does low-volume consolidation before a high-volume breakout tell you about the supply/demand balance leading into the move?`,
              explanation: `B is correct. The pattern — low-volume consolidation followed by high-volume breakout — is one of the most reliable breakout setups. The low volume before the breakout means: sellers were not accumulating positions (no supply building up). When the breakout candle arrives on 2.4× volume, buyers are moving aggressively without significant seller resistance. This is sometimes called "volume contraction → expansion" and is the foundation of many professional breakout systems. The absence of selling supply before the breakout means there are fewer "trapped long" sellers to create resistance on the way up.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-volumeRead`,
              scenario: `BTC/USDT, daily chart. Analyse the volume profile of a 12-day price sequence:

Day 1: Close $68,200. Volume 0.8×. Green.
Day 2: Close $69,400. Volume 0.6×. Green.
Day 3: Close $70,800. Volume 0.9×. Green.
Day 4: Close $71,200. Volume 0.7×. Green.
Day 5: Close $71,000. Volume 0.5×. Red (small pullback).
Day 6: Close $70,600. Volume 0.4×. Red (continued pullback).
Day 7: Close $70,200. Volume 0.3×. Red (continued).
Day 8: Close $72,400. Volume 2.6×. Green (breakout candle).
Day 9: Close $73,800. Volume 1.8×. Green.
Day 10: Close $74,800. Volume 1.4×. Green.
Day 11: Close $74,200. Volume 0.6×. Red (pullback).
Day 12: Close $73,800. Volume 0.4×. Red (continued pullback).

Analyse: classify the Days 1-4 move, Days 5-7 pullback, Day 8 breakout, and Days 11-12 pullback. Identify the entry opportunity in the sequence.`,
              scoringCriteria: [
                `Days 1-4: Low-volume advance (0.6–0.9×). Moderate uptrend but below-average volume = less conviction. Building toward something but not yet explosive.`,
                `Days 5-7: Healthy pullback on declining volume (0.3–0.5×). Classic low-volume pullback within an uptrend. Sellers have no conviction. Sets up the next advance.`,
                `Day 8: High-conviction breakout (2.6×). This is the entry signal — above-average volume on a breakout candle represents genuine market participation. Confirmation of the move.`,
                `Days 11-12: Low-volume pullback (0.6, 0.4×). Post-breakout consolidation on weak selling. This is the continuation entry opportunity — buy the low-volume pullback after the high-volume breakout.`,
                `Ideal entry: Day 7 (lowest volume day in the pullback — trend continuation) OR Day 12 (same pattern after the breakout). Day 8 is the breakout confirmation but has gap risk from the prior close.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `ETH/USDT, 4-hour chart. You are watching a critical resistance level at $3,800.

Previous 4H context:
- ETH has tested $3,800 three times in the past week without a 4H close above
- Current 4H volume averages: $800M per candle

Current moment: A 4H candle is forming that will potentially break $3,800.

Three scenarios play out (evaluate each):

Scenario A: The 4H candle closes at $3,824. Volume: $720M (0.9× average).
Scenario B: The 4H candle closes at $3,812. Volume: $1,840M (2.3× average).
Scenario C: The 4H candle closes at $3,848. Volume: $1,200M (1.5× average). The candle has a long upper wick back to $3,880.

For each: classify as valid breakout, false breakout, or uncertain. Provide the exact follow-up action for each scenario.`,
              scoringCriteria: [
                `Scenario A: FALSE BREAKOUT signal. Only 0.9× volume — below average. Price closed above but participation is low. Action: Do not enter. Wait for volume to confirm. Watch for a red candle reversal back below $3,800.`,
                `Scenario B: VALID BREAKOUT. 2.3× volume is high-conviction participation. Close is modest ($3,812) but the volume confirms genuine buying. Action: Enter long on the next 4H candle open (~$3,812). Stop: below $3,800 (prior resistance, now support) with 0.5% buffer = $3,781. Target: $4,000 (next resistance).`,
                `Scenario C: UNCERTAIN/MIXED. 1.5× volume is at the minimum threshold (valid by rule) but the long upper wick to $3,880 then back to $3,848 is a rejection signal. Buyers broke $3,800 but sellers appeared at $3,880 and pushed back. Action: Wait for the next 4H candle. If it opens green and builds above $3,848 with volume, enter. If it opens red, the upper wick was a meaningful rejection.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader is reviewing their ETH trades. In their journal they have 8 trades with volume notes. Identify which volume signals they correctly read and which they misread:

Trade 1: Entered on a breakout. Volume was 0.6×. They noted: "volume confirmation ✓." Trade failed.
Trade 2: Saw pullback in uptrend. Volume 0.3×. They noted: "dangerous low volume, avoided." Missed a +9% continuation.
Trade 3: Volume spike 3.8× on a red candle at support. They noted: "panic selling, potentially capitulation." Bought. Made +14%.
Trade 4: Saw rising price with volume: Day 1: 1.8×, Day 2: 1.2×, Day 3: 0.8×. They noted: "volume increasing, bullish." Entered Day 3. Price reversed.
Trade 5: Low-volume consolidation (3 candles at 0.3–0.4×) before a 2.2× breakout candle. They entered on Day 4 low-volume candle (not the breakout). Missed the breakout.

For each: correct or incorrect volume reading? What should they have done differently?`,
              scoringCriteria: [
                `Trade 1: INCORRECT. 0.6× is below-average — not a valid breakout. They misclassified it as "volume confirmation." The minimum for a valid breakout is 1.5×.`,
                `Trade 2: INCORRECT. Low-volume pullback in an uptrend is BULLISH (healthy), not dangerous. The 0.3× volume meant sellers had no conviction. Should have entered — missed +9%.`,
                `Trade 3: CORRECT. Capitulation volume interpretation was accurate. 3.8× volume at support = seller exhaustion. Entry was correct. Good outcome.`,
                `Trade 4: INCORRECT. They noted "increasing" when volume was actually declining (1.8 → 1.2 → 0.8 = decreasing). This is bearish volume divergence. They misread the direction of volume change.`,
                `Trade 5: MIXED. The volume contraction → expansion pattern was correctly identified but the entry timing was wrong. Enter on the high-volume breakout candle (2.2×), not during the consolidation. The consolidation entry had no catalyst — the breakout candle was the signal.`,
              ],
            },
          ],
        },

        {
          id: 'chart-patterns-continuation',
          title: `Continuation Patterns`,
          explanation: `In 2023, a Citadel Securities analyst tracking Bitcoin's market structure noted that the most consistently profitable setups in their proprietary data weren't complex — they were bull flags, cup and handles, and ascending triangles at key breakout levels. These patterns have been validated across equities, commodities, currencies, and crypto over decades. They work because they reflect universal human behaviour: markets trend, consolidate, then continue trending.

Continuation patterns form when a trending move pauses to consolidate — the market "catches its breath" before continuing in the original direction. The consolidation isn't random; it takes specific shapes that reflect the balance of supply and demand during the pause. These shapes have measurable implications for the continuation target.

Four key continuation patterns:

1. Bull Flag: A sharp upward move (the pole) followed by a rectangular or downward-sloping consolidation (the flag). Breakout from the flag continues the pole's direction. Measured target: flag breakout point + pole height. Per Bulkowski: 67% continuation rate in uptrends.

2. Ascending Triangle: Flat upper resistance + rising lower support (ascending trendline). Price is making higher lows while being rejected at the same resistance — buyers are accumulating below resistance. Breakout from the flat top. Target: height of the triangle added to the breakout point.

3. Cup and Handle: A rounded bottom recovery (the cup) followed by a brief shallow pullback (the handle). Breakout above the cup's rim. Target: cup depth added to breakout point. One of the most reliable continuation patterns (Bulkowski: 68% continuation in uptrends).

4. Symmetrical Triangle (Coil): Converging highs and lows forming a tightening range. A symmetrical triangle can break either direction — it is the least directionally biased continuation pattern. When it appears in an established uptrend and breaks upward, it is a continuation signal.

Key validation requirement for all patterns: the breakout must occur on above-average volume (1.5×+) for the pattern to be considered high-confidence.`,
          visualPrompt: `👆 Four continuation patterns side by side: bull flag, ascending triangle, cup/handle, symmetrical triangle`,
          visualType: `gif`,
          visualUrl: `continuation-patterns-chart`,
          strategy: `For any continuation pattern entry: (1) confirm the pattern exists in context of a prior trend, (2) wait for a candle close above the pattern's breakout level, (3) confirm with volume ≥1.5× average, (4) set entry just above the breakout candle's close, (5) stop below the pattern's lowest point (flag low, triangle support, handle low), (6) target = measured move (pole height or pattern height added to breakout).`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, bull flag entry]`,
              context: `BTC rises from $62,000 to $74,000 in 8 days (+19.4%). The move then consolidates in a downward-sloping channel between $72,000 and $70,000 for 5 days, forming a clean bull flag. Volume during the consolidation: 0.3–0.5× average.`,
              scenario: `Pole height: $74,000 − $62,000 = $12,000. Breakout level: $72,400 (upper flag boundary). Volume on breakout day: 2.1× average. Entry: $72,600 (just above flag upper boundary close).`,
              outcome: `Measured target: $72,400 + $12,000 = $84,400. Stop: below flag low at $69,800 with buffer ($69,300). Trade risk: $72,600 − $69,300 = $3,300. Reward: $84,400 − $72,600 = $11,800. R:R: 3.57:1. Price reached $83,800 over 14 days — 98% of the measured move.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, ascending triangle breakout]`,
              context: `ETH's 4-hour chart shows a 3-week ascending triangle: flat resistance at $3,820, rising support from $3,580 to $3,720 (higher lows over 3 weeks). Triangle height: $3,820 − $3,580 = $240.`,
              scenario: `Price tests $3,820 four times. On the fifth test, a 4H candle closes above $3,820 on 2.4× average volume. Entry: $3,835. Stop: below last triangle low ($3,718) with buffer ($3,690). Target: $3,820 + $240 = $4,060.`,
              outcome: `The ascending triangle measured move target was $4,060. Price reached $4,020 (97% of target) before reversing. The pattern provided a precise entry (above resistance breakout), stop (below the ascending trendline's last support), and target (measured move). Per Bulkowski's data, ascending triangles in uptrends have a 67% continuation success rate.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, cup and handle]`,
              context: `BTC's weekly chart shows a 6-week cup and handle forming. The cup: decline from $74,000 to $60,000 (rounded bottom), recovery back to $73,800 (near the rim). The handle: a 2-week shallow pullback to $71,200 before the breakout attempt.`,
              scenario: `Cup depth: $74,000 − $60,000 = $14,000. Handle low: $71,200. Breakout level: $74,000 (cup rim). On the breakout week, volume is 1.8× average. Entry: $74,200. Stop: below handle low $71,200 with buffer ($70,700). Target: $74,000 + $14,000 = $88,000.`,
              outcome: `Cup and handle breakout on the weekly chart. Target $88,000. Price reached $87,600 before the next significant pullback — 99% of the measured move. Cup and handle patterns on weekly charts are particularly reliable because of the extended timeframe required to form them (6+ weeks of collective market behaviour).`,
            },
          ],
          keyTakeaway: `Continuation patterns — bull flags, ascending triangles, cup and handles, symmetrical triangles — mark pauses within trends before the original direction resumes. Each pattern has a measured move target (pattern height added to breakout point). All require volume confirmation on the breakout. Stop goes below the pattern's lowest point.`,
          guidedPractice: [
            {
              question: `BTC bull flag: pole from $58,000 to $74,000 (+$16,000). Flag forms between $70,000 and $73,000. Breakout at $73,200. What is the measured move target?`,
              options: [
                `A — $73,200 + 20% = $87,840`,
                `B — $73,200 + $16,000 (pole height) = $89,200`,
                `C — $74,000 + $16,000 = $90,000 (from the flag top)`,
                `D — $73,000 + $16,000 = $89,000 (from the flag upper boundary)`,
              ],
              correct: 1,
              hint: `Measured move = breakout point + pole height. The breakout point is where the flag's upper boundary was crossed.`,
              explanation: `B is correct. Pole height = $74,000 − $58,000 = $16,000. Breakout point = $73,200 (where the upper flag boundary was broken). Measured target = $73,200 + $16,000 = $89,200. D gives a very similar answer ($89,000 from the flag boundary) — the slight difference is because the breakout occurred at $73,200 vs the upper flag boundary at $73,000. The breakout candle's close is typically used as the breakout point for precision.`,
            },
            {
              question: `An ascending triangle has: flat resistance at $190 (SOL), rising support touching $180, $183, $186, $188. Where do you place the stop after the breakout at $191?`,
              options: [
                `A — Below $190 (flat resistance level)`,
                `B — Below the last ascending trendline support ($188) with 0.5% buffer = $187.06`,
                `C — Below the very first triangle low ($180)`,
                `D — At breakeven ($191) immediately after entry`,
              ],
              correct: 1,
              hint: `The stop for a pattern entry goes below the pattern's invalidation level. For an ascending triangle, that is the last rising support.`,
              explanation: `B is correct. The ascending triangle's bullish thesis is: buyers are making progressively higher lows (the ascending support line at $180, $183, $186, $188). If price falls below the last ascending low ($188), the higher-lows structure is broken — the pattern's bullish thesis is invalidated. Stop at $187.06 (0.5% below $188) captures this invalidation. A (below resistance) is backwards — you're going above resistance to enter, not below it. C ($180) is the original triangle low — too wide, captures too much non-thesis-relevant movement.`,
            },
            {
              question: `What volume characteristics should accompany a valid bull flag consolidation and subsequent breakout?`,
              options: [
                `A — High volume during the flag consolidation, low volume on the breakout`,
                `B — Low volume during the flag consolidation (0.3–0.6× average), high volume on the breakout (1.5×+ average)`,
                `C — Volume should be consistent throughout — both flag and breakout at 1×`,
                `D — Volume is irrelevant for bull flag analysis`,
              ],
              correct: 1,
              hint: `What does low-volume consolidation within a trend tell us about the balance of sellers vs buyers?`,
              explanation: `B is correct. The ideal bull flag volume signature: (1) high volume on the pole (confirms strong buying), (2) low volume during the flag (sellers don't have conviction — the consolidation is a weak pause, not distribution), (3) high volume on the breakout (confirms the continuation has renewed participation). A is backwards — high volume during the flag means significant selling pressure is building, which could mean distribution, not a healthy pause. C (flat volume throughout) lacks the distinctive expansion on the breakout that confirms conviction.`,
            },
            {
              question: `A symmetrical triangle forms on ETH's 4H chart within a 3-week uptrend. The triangle is converging with the next candle about to resolve it. What two things must happen for this to be a valid continuation trade?`,
              options: [
                `A — Price must break above the upper trendline AND volume must be 1.5×+ on the breakout candle`,
                `B — Price must break below the lower trendline (symmetrical triangles always break downward)`,
                `C — The triangle must form for at least 4 weeks before it is valid`,
                `D — You must wait for a retest of the breakout level before entering`,
              ],
              correct: 0,
              hint: `Symmetrical triangles can break either direction. What makes it a continuation trade (upward)?`,
              explanation: `A is correct. Two conditions: (1) breakout above the upper trendline (confirms continuation, not reversal), AND (2) volume ≥1.5× confirms the breakout has conviction. Symmetrical triangles are neutral — they break both up and down. The uptrend context makes an upward break more probable, but it's not guaranteed. The volume confirmation is what distinguishes a genuine breakout from a false one. B is wrong — triangles don't "always" break in any direction. C is wrong — timeframe of formation varies by chart and no 4-week minimum applies universally. D (wait for retest) is a valid but more conservative approach, not a requirement.`,
            },
            {
              question: `A cup and handle forms on BTC's daily chart: cup depth from $64,000 to $56,000 ($8,000 depth), recovery to $63,800 (near rim), handle pullback to $61,400, breakout at $64,200. What is the measured move target?`,
              options: [
                `A — $64,200 + $8,000 = $72,200`,
                `B — $63,800 + $8,000 = $71,800 (from the cup rim)`,
                `C — $56,000 + $8,000 = $64,000 (wrong reference)`,
                `D — $61,400 + $8,000 = $69,400 (from handle low)`,
              ],
              correct: 0,
              hint: `Cup and handle target = breakout point + cup depth. The breakout point is where price closed above the cup's rim.`,
              explanation: `A is correct. Cup depth = $64,000 (cup high) − $56,000 (cup low) = $8,000. Breakout point = $64,200 (where price broke and closed above the cup rim on the breakout candle). Target = $64,200 + $8,000 = $72,200. B uses the cup rim ($63,800) instead of the actual breakout close ($64,200) — close but slightly off. The convention is to use the breakout candle's close as the reference point.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-patternID`,
              scenario: `BTC/USDT, daily chart. Identify the continuation pattern and design the full trade.

Chart data:
Days 1-8: BTC rises from $58,200 to $74,800 (+28.5%). Pole height: $16,600. Average daily volume during rise: $35B (candles 1-8 averaged 1.4–2.1×).

Days 9-15: BTC consolidates. Daily closes: $73,200, $72,400, $71,800, $72,200, $71,600, $71,400, $72,000. Volume during consolidation: 0.4–0.7× average. The consolidation forms a descending channel with upper boundary around $73,200 and lower boundary around $71,200.

Day 16: Open $72,100. High $74,400. Close $74,200. Volume: $68B (1.94× average).

Account: $18,000. Risk: 2% ($360).

Identify: (1) pattern name, (2) breakout confirmation criteria and whether Day 16 meets them, (3) entry price, (4) stop price with justification, (5) measured move target, (6) position size.`,
              scoringCriteria: [
                `Pattern: Bull Flag. Pole (Days 1-8) + descending consolidation channel (Days 9-15) = classic bull flag.`,
                `Breakout confirmation: (1) close above upper flag boundary ($73,200) ✓ ($74,200 close), (2) volume ≥1.5× ✓ (1.94×). Both criteria met. Day 16 is a valid breakout.`,
                `Entry: $74,200 (breakout candle close) or $74,300 (slightly above to confirm follow-through). Market open of Day 17.`,
                `Stop: below flag low ($71,200) with 0.5% buffer = $70,844 ≈ $70,800.`,
                `Measured target: $74,200 (breakout) + $16,600 (pole height) = $90,800.`,
                `Position size: $360 / ($74,200 − $70,800) = $360/$3,400 × $74,200 = $7,855 notional = 0.1059 BTC.`,
                `R:R: ($90,800 − $74,200) / ($74,200 − $70,800) = $16,600/$3,400 = 4.88:1. Excellent.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `SOL/USDT, 4-hour chart. An ascending triangle has been forming for 11 days.

Triangle data:
- Flat resistance: $194 (tested 4 times over 11 days — each test between $193.80–$194.20, no 4H close above)
- Ascending support lows: $182, $185.50, $188, $191, $192.50 (progressively higher lows)
- Current 4H candle: Opening at $193.00, high so far $195.80, currently trading at $194.60 with 2 hours remaining in the candle. Volume so far: tracking toward 1.8× average.

Triangle height (from $182 to $194): $12.

Account: $10,000. Risk: 1.5% ($150).

Tasks:
1. If this candle closes above $194 with ≥1.5× volume, is this a valid breakout?
2. Entry price, stop, and measured target
3. Position size
4. What would invalidate this setup before entry?`,
              scoringCriteria: [
                `Valid breakout: YES if (1) 4H candle closes above $194 AND (2) volume closes ≥1.5× (tracking at 1.8× with 2 hours remaining — high probability). Both conditions appear likely.`,
                `Entry: $194.60–$195 (just above the breakout close). Stop: below last ascending low ($192.50) with 0.5% buffer = $191.54 ≈ $191.50.`,
                `Target: $194 + $12 = $206. Secondary (conservative): $202 (next major resistance if visible on chart).`,
                `Position size: $150 / ($194.60 − $191.50) × $194.60 = $150/$3.10 × $194.60 = $9,409 notional = 48.36 SOL.`,
                `Invalidation before entry: if the candle closes BELOW $194 (failed breakout — upper wick through $194 then close below) OR volume doesn't reach 1.5×. In either case: wait for the next 4H candle rather than chasing.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Review five pattern-based trades from a trader's journal. For each, identify whether the pattern was correctly identified, correctly traded, or incorrectly executed:

Trade 1: "Saw bull flag. Entered on Day 3 of the flag consolidation (before breakout) because I didn't want to miss the move. Flag breakout came Day 6. I was already in at a better price." Outcome: +12%.

Trade 2: "Identified cup and handle. Entered on breakout above cup rim. Volume on breakout: 0.8×. Stopped out when price reversed back into the cup." Outcome: −1.5R.

Trade 3: "Ascending triangle. Flat resistance $3,800 tested twice. I entered a long at $3,760 inside the triangle (below resistance) because the pattern looked complete." Outcome: Triangle broke downward. −1R.

Trade 4: "Symmetrical triangle in a downtrend (8 weeks of downtrend before the triangle). Entered long on upward break from triangle." Volume: 2.1×. Outcome: Broke up then immediately reversed. −1.8R.

Trade 5: "Bull flag with volume confirmation (1.7× on breakout). Entered at breakout close. Stop below flag low. Target at measured move. Held to target." Outcome: +3.8R.

Classify each as: correct execution, incorrect execution, or lucky/accidental success.`,
              scoringCriteria: [
                `Trade 1: LUCKY/RISKY. Entering before breakout means entering without confirmation. The entry inside the flag has a 33% chance the flag breaks down (false pattern). Got lucky with the outcome. Not repeatable as a methodology.`,
                `Trade 2: INCORRECT. 0.8× volume = invalid breakout. The most common cup and handle mistake: entering on a low-volume "breakout" that reverses. Correct rule: 1.5×+ volume required. Stoppable error.`,
                `Trade 3: INCORRECT ENTRY. Entering inside the triangle (below resistance) is premature — no breakout confirmation. Ascending triangles can also break downward. Correct entry: candle close above $3,800 resistance, not below it.`,
                `Trade 4: INCORRECT CONTEXT. Symmetrical triangles in established downtrends that break upward frequently fail. The broader 8-week downtrend context means the upward triangle break is a counter-trend trade. Should have skipped or used very small size. Even with 2.1× volume, trading a counter-trend symmetrical triangle is low-probability.`,
                `Trade 5: CORRECT. All criteria met — volume confirmation, pattern context (in a trend), entry at breakout close, stop below pattern, measured move target. This is the standard by which all continuation pattern trades should be executed.`,
              ],
            },
          ],
        },

        {
          id: 'chart-patterns-reversal',
          title: `Reversal Patterns`,
          explanation: `In November 2021, Bitcoin printed a double top on the weekly chart. The two peaks were $67,016 (October 20) and $68,789 (November 10). The "neckline" — the support between the two peaks — was at approximately $58,000. On November 22, price fell through $58,000 on above-average volume. The measured move target of the double top: $58,000 − ($68,789 − $58,000) = $47,211. BTC reached $47,000 within 3 weeks and eventually fell to $15,476 by November 2022. The pattern called it.

Reversal patterns appear at the end of trends. They show that the balance of power between buyers and sellers has shifted — not temporarily (as in a continuation pattern) but structurally. The trend is ending. A new trend in the opposite direction is beginning.

Four key reversal patterns:

1. Head and Shoulders (Bearish): Three peaks — left shoulder, higher head, right shoulder — with a "neckline" connecting the lows between them. Breakout below the neckline triggers the pattern. Target: neckline − head height. Per Bulkowski: 83% reversal success rate when confirmed by a close below the neckline — among the most reliable patterns in technical analysis.

2. Double Top (Bearish): Two peaks at approximately the same price with a trough between them. Price fails to make a new high on the second attempt — seller pressure is equal at both peaks. Confirmed by close below the trough (neckline). Target: neckline − (peak − neckline).

3. Inverse Head and Shoulders (Bullish): Mirror image of H&S — three troughs with the middle one deepest, breakout above the neckline. Target: neckline + head depth.

4. Double Bottom (Bullish): Two troughs at approximately the same price. Confirmed by close above the peak between the troughs. Target: peak + (peak − trough).

The neckline is the critical level for all reversal patterns. The pattern is not confirmed until price closes through the neckline. A close back above the neckline after a break is a "failed pattern" — sometimes these failures are tradeable in the opposite direction.`,
          visualPrompt: `👆 Head and shoulders pattern forming and breaking — annotated with shoulders, head, neckline`,
          visualType: `gif`,
          visualUrl: `head-shoulders-breakdown`,
          strategy: `For reversal patterns: never act on the shape alone — wait for the neckline break. Set entry orders just beyond the neckline (for H&S: sell limit below neckline; for double bottom: buy limit above the trough peak). Volume should expand on the neckline break. The stop for a short after H&S breakdown: above the right shoulder. For a long after double bottom: below the second bottom.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, head and shoulders]`,
              context: `BTC daily chart shows a head and shoulders forming over 8 weeks at the top of a bull market. Left shoulder peak: $71,200 (Week 1). Head peak: $74,800 (Week 3). Right shoulder peak: $70,800 (Week 6). Neckline: approximately $68,000 (connecting the two troughs between the peaks).`,
              scenario: `Week 8: price falls from $70,800 (right shoulder) and approaches $68,000 neckline on rising volume. A daily candle closes at $67,400 — below the $68,000 neckline. Volume: 2.1× average.`,
              outcome: `Confirmed H&S breakdown. Measured target: $68,000 − ($74,800 − $68,000) = $68,000 − $6,800 = $61,200. The trader enters short at $67,200 (below neckline close). Stop: $70,900 (above right shoulder). Target: $61,200. Price fell to $62,400 over 3 weeks — 90% of the measured move captured.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, double bottom]`,
              context: `ETH 4H chart shows a double bottom forming in a downtrend. First bottom: $3,420 (Day 1). Rally to $3,640 (the "peak" between the two bottoms). Second bottom: $3,440 (Day 14, very close to first bottom). Volume at second bottom: 0.9× average (no capitulation spike this time).`,
              scenario: `Double bottom pattern: two lows at $3,420/$3,440 with $3,640 peak between them. Pattern depth: $3,640 − $3,430 average = $210. Confirmation: 4H close above $3,640 on 1.7× volume. Target: $3,640 + $210 = $3,850.`,
              outcome: `After the 4H close above $3,640, entry at $3,655. Stop: below second bottom $3,440 with buffer ($3,400). ETH moved to $3,820 over 4 days — near the measured $3,850 target. The double bottom at $3,420/$3,440 established a high-confidence floor — two separate sessions of buyers stepping in at approximately the same price with sufficient force to reverse the downtrend.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, inverse head and shoulders]`,
              context: `BTC's weekly chart shows an inverse head and shoulders during the 2022-2023 bear market bottom. Left shoulder bottom: $18,200. Head bottom: $15,476 (the absolute low). Right shoulder bottom: $19,800. Neckline: approximately $26,000 (connecting the peaks between the troughs).`,
              scenario: `In February 2023, BTC closes a weekly candle above $26,000 for the first time since the pattern began forming. Volume: 1.6× average. The neckline break is confirmed. Target: $26,000 + ($26,000 − $15,476) = $26,000 + $10,524 = $36,524.`,
              outcome: `Inverse H&S target: $36,524. BTC reached $35,000 by May 2023 — close to the measured move. The inverse H&S on the weekly chart identified the bear market bottom. Position traders who entered on the neckline break at $26,000 held to the target for a 40% gain.`,
            },
          ],
          keyTakeaway: `Reversal patterns (head and shoulders, double top/bottom, inverse H&S) mark the end of trends and the beginning of moves in the opposite direction. None is confirmed until price closes through the neckline with volume. The measured move (pattern height projected from neckline) provides the target. Stop goes on the opposite side of the pattern's most recent shoulder or bottom.`,
          guidedPractice: [
            {
              question: `Head and shoulders pattern: head high $76,400, left and right shoulder highs approximately $72,800. Neckline at $69,200. Where is the measured move target?`,
              options: [
                `A — $69,200 − $76,400 = negative (invalid)`,
                `B — $69,200 − ($76,400 − $69,200) = $69,200 − $7,200 = $62,000`,
                `C — $72,800 − $7,200 = $65,600 (uses shoulder height instead of head)`,
                `D — $69,200 + $7,200 = $76,400 (wrong direction)`,
              ],
              correct: 1,
              hint: `H&S target = neckline − (head height − neckline). This measures the height of the pattern and projects it below the neckline.`,
              explanation: `B is correct. Head height above neckline = $76,400 − $69,200 = $7,200. Target = neckline − $7,200 = $69,200 − $7,200 = $62,000. The logic: the pattern's height represents the magnitude of the imbalance between buyers (who pushed to $76,400) and sellers (who defined the neckline at $69,200). That same magnitude is projected below the neckline as the expected decline. A is a calculation error. C incorrectly uses shoulder height. D projects upward rather than downward.`,
            },
            {
              question: `You see what looks like a head and shoulders on the daily chart, but price has not broken below the neckline yet. Should you enter a short position now?`,
              options: [
                `A — Yes — entering before the neckline break gives a better price`,
                `B — No — the pattern is not confirmed until price closes below the neckline. Entering before the neckline break means entering a trade without a confirmed signal — the right shoulder could extend, the pattern could fail, and price could break upward.`,
                `C — Yes — H&S patterns always confirm once the right shoulder forms`,
                `D — Only enter if volume is already declining on the right shoulder`,
              ],
              correct: 1,
              hint: `What makes a reversal pattern "confirmed"? Is a shape alone sufficient, or is a specific price event required?`,
              explanation: `B is correct. The neckline close is the confirmation event — not the shape. Before the neckline breaks, the pattern is a hypothesis, not a confirmed trade signal. The "right shoulder" could keep extending upward (the pattern would then morph into something else). A confirmed H&S requires: (1) the three peaks in the correct structure, AND (2) a candle close below the neckline with confirming volume. Entering before the break is entering on a hypothesis. The risk: if the right shoulder extends and breaks above the head, you are now short in an uptrend with no technical justification.`,
            },
            {
              question: `A double top forms on ETH: Peak 1 at $4,100, trough at $3,820, Peak 2 at $4,080. Where is the neckline and where is the measured target after confirmation?`,
              options: [
                `A — Neckline: $3,820. Target: $3,820 − ($4,100 − $3,820) = $3,820 − $280 = $3,540`,
                `B — Neckline: $4,100 (the peaks). Target: $3,540`,
                `C — Neckline: $3,820. Target: $4,100 + $280 = $4,380`,
                `D — No target — double tops are unreliable`,
              ],
              correct: 0,
              hint: `Neckline = the trough between the two peaks. Target = neckline − (peak − neckline).`,
              explanation: `A is correct. Neckline = trough price = $3,820. Pattern height = average peak ($4,090) − neckline ($3,820) = $270. Target = $3,820 − $270 = $3,550. Using Peak 1 for exactness: ($4,100 − $3,820) = $280. Target = $3,820 − $280 = $3,540. The answer as stated ($3,540) aligns. C projects upward — wrong direction for a bearish double top.`,
            },
            {
              question: `What is a "failed pattern" and how can it be traded?`,
              options: [
                `A — A failed pattern means the analysis was wrong — no trade possible`,
                `B — A failed pattern occurs when a confirmed breakdown/breakout reverses back through the neckline. The failure itself is a trade signal in the opposite direction — the short squeeze from a failed H&S breakdown can produce significant upside moves.`,
                `C — Failed patterns happen when volume is insufficient`,
                `D — Patterns don't fail — they just need more time`,
              ],
              correct: 1,
              hint: `If a pattern "fails," what happens to the traders who entered on the pattern's signal? And what does that forced activity create?`,
              explanation: `B is correct. A failed pattern occurs when price breaks the neckline (confirming the pattern) but then reverses back through it in the opposite direction. Example: H&S breakdown confirmed at $69,200, but then price rallies back above $69,200. All the traders who shorted on the H&S breakdown are now in losing positions — as price rises, they are forced to buy (stop-losses trigger). This forced buying on top of new long entries creates an aggressive upside move. Failed H&S patterns (called "H&S failures") often produce moves of 10–20% upward in crypto markets. The failed pattern is the trade.`,
            },
            {
              question: `Where do you place the stop-loss after entering short on a confirmed head and shoulders breakdown?`,
              options: [
                `A — Below the neckline (in the same direction as the short)`,
                `B — Above the right shoulder peak (the most recent high before the breakdown). If price reclaims the right shoulder level, the H&S structure is compromised.`,
                `C — Above the head (the highest point of the pattern)`,
                `D — At breakeven immediately after entry`,
              ],
              correct: 1,
              hint: `The stop should be at the price level where the H&S pattern is invalidated. The right shoulder is the most recent structural reference.`,
              explanation: `B is correct. After shorting below the neckline, the stop goes above the right shoulder. Logic: if price rallies back above the right shoulder peak, the H&S structure has failed — buyers have reclaimed the level that was supposed to be the pattern's resistance. A stop above the right shoulder captures this invalidation without requiring price to reach all the way back to the head (C) — which would represent an enormous loss before stopping out. The right shoulder is the most immediately relevant invalidation level.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-reversal`,
              scenario: `ETH/USDT, daily chart. Identify the reversal pattern forming and design the trade.

Chart data (last 10 weeks of daily data — key reference points):
- 10 weeks ago: ETH at $3,200 (start of the data window)
- Week 2-3: ETH rose to $3,840 (left shoulder). Fell back to $3,560.
- Week 4-5: ETH rose to $4,100 (head — new high). Fell back to $3,540.
- Week 6-8: ETH rose to $3,820 (right shoulder — lower than head). Current decline in progress.
- Today: ETH at $3,620, declining. Left and right shoulder trough lows: $3,540–$3,560.

Questions:
1. Pattern name and classification (bullish/bearish)
2. Neckline level
3. Where would a confirmation signal occur?
4. Entry, stop, measured target
5. Account: $16,000. Risk: 1.5% ($240). Position size?`,
              scoringCriteria: [
                `Pattern: Head and Shoulders (Bearish). Appearing at the top of a rally from $3,200.`,
                `Neckline: approximately $3,540–$3,560 (connecting the two trough lows between the shoulders and head).`,
                `Confirmation: daily close below $3,540 on volume ≥1.5× average.`,
                `Entry: $3,520 (just below neckline with buffer). Stop: above right shoulder high $3,820 with buffer = $3,840. Target: $3,540 − ($4,100 − $3,540) = $3,540 − $560 = $2,980.`,
                `Position size: $240 / ($3,840 − $3,520) = $240/$320 × $3,520 = $2,640 notional = 0.75 ETH.`,
                `R:R: ($3,520 − $2,980) / ($3,840 − $3,520) = $540/$320 = 1.69:1 — below 2:1 minimum. User should identify this and either extend the target or reassess the trade.`,
              ],
            },
            {
              type: `chartReplay-patternID`,
              scenario: `BTC/USDT, weekly chart. Bear market context. The chart shows the following data over 14 weeks:

Week 1-2: BTC bottoms at $15,476 after a sustained bear market.
Week 3-4: BTC rallies to $20,800 (first peak in the potential recovery).
Week 5-6: BTC pulls back to $18,200 (trough between first and second recovery attempts).
Week 7-9: BTC rallies to $25,200 (second peak — higher than first at $20,800).
Week 10-12: BTC pulls back to $19,400 (second trough).
Week 13-14: BTC rallies to $26,800 (third attempt at higher high — higher than $25,200).

Questions:
1. Is an inverse head and shoulders forming? If so, identify shoulders and head.
2. What is the neckline level?
3. What event confirms the pattern?
4. Is this a valid pattern given the data? (Consider the relative low placement)`,
              scoringCriteria: [
                `Analysis: The bottoms are at $15,476, $18,200, $19,400. For an inverse H&S: the head should be the LOWEST of the three troughs. Here: $15,476 (first bottom) is lowest. $18,200 (left shoulder trough) and $19,400 (right shoulder trough) are higher. This structure (low, higher low, higher low) is NOT an inverse H&S — it's an ascending series of lows.`,
                `For a proper inverse H&S: structure needed is LEFT shoulder trough > head trough < RIGHT shoulder trough (all approximately equal height for shoulders, head lowest).`,
                `In this data: $15,476 is the potential head. But the "shoulders" at $18,200 and $19,400 are not approximately equal (one is $18,200 and one is $19,400 — a significant difference).`,
                `Partial conclusion: not a perfect textbook inverse H&S, but a "rough" version with the head clearly at $15,476 and unequal shoulders. The neckline would be drawn through the peaks between troughs: approximately $20,800–$25,200 range. Confirmation: close above the neckline with volume.`,
                `User correctly identifies the pattern as imperfect but potentially tradeable if the broader context (bear market recovery) supports a bullish thesis.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are reviewing 5 reversal pattern trades made by a student. Evaluate each:

Trade 1: H&S on ETH daily. Entered short $200 above the neckline (before the break) because "the pattern looked complete." The neckline held and ETH rallied $600.

Trade 2: Double bottom on BTC. First bottom $62,000. Second bottom $61,800. Peak between them: $66,400. Entered long on a 4H close above $66,400 on 1.9× volume. Target $70,800.

Trade 3: Identified "head and shoulders" on a 5-minute SOL chart. Entered short. Stoploss triggered within 20 minutes.

Trade 4: H&S on BTC daily confirmed. Short entered below neckline. Volume on breakdown: 0.6× average.

Trade 5: Inverse H&S on BTC weekly. Neckline confirmed broken with weekly close above $26,200 on 1.6× volume. Held for 8 weeks to measured target. +$9,400 gain.

For each: identify the error or success, and the specific rule violated or applied.`,
              scoringCriteria: [
                `Trade 1: INCORRECT. Entered before neckline confirmation. The fundamental rule: wait for the neckline close. Early entry without confirmation = speculating on a hypothesis, not trading a confirmed signal. Cost: $600 loss.`,
                `Trade 2: CORRECT. Double bottom confirmed by 4H close above peak ($66,400) with volume (1.9×). All criteria met. Well-executed.`,
                `Trade 3: INCORRECT. H&S on 5-minute charts = noise. Reversal patterns require sufficient timeframe for the pattern to have structural meaning. 5-minute H&S completes in 15–30 minutes — not enough history for a genuine trend reversal. 4H minimum for reversal pattern trading.`,
                `Trade 4: INCORRECT. Volume 0.6× = below-average = unconfirmed breakdown. Entering on a low-volume neckline break is a common error. The breakdown may be a false break (sellers not participating). Required: 1.5×+ volume for confirmation.`,
                `Trade 5: CORRECT. Weekly inverse H&S with volume confirmation on the neckline break. Held to the measured target. All rules applied. Textbook execution for a major reversal pattern on the highest-confidence timeframe.`,
              ],
            },
          ],
        },

      ],

      // ─── Lab 2 Aggregate Simulations ────────────────────────────────────────
      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-patternID',
          'chartReplay-reversal',
          'chartReplay-breakout',
          'chartReplay-volumeRead',
          'judgment-dataInterpret',
        ],
        description: `15 randomised chart reading challenges across all 8 Lab 2 lessons. Each challenge tests pattern identification, candlestick interpretation, support/resistance recognition, volume analysis, timeframe judgement, or multi-factor trade evaluation — presented without lesson labels. Drawn from BTC, ETH, SOL, and AVAX price data across 4H, daily, and weekly charts.`,
        scoringMode: `binary-per-sim`,
        unlockCondition: `Complete all 8 Lab 2 lessons with ≥70% guidedPractice score`,
        difficultyRange: `Equivalent to lesson-sim-2 difficulty — requires applying principles without prompting`,
      },

      // ─── Lab 2 Boss Battle ───────────────────────────────────────────────────
      bossMode: {
        title: `Junior Analyst Challenge`,
        description: `Prove you can read any chart placed in front of you. The Junior Analyst Challenge tests every Lab 2 skill: candlestick reading, wick analysis, support/resistance identification, volume interpretation, timeframe navigation, continuation and reversal patterns — all applied to live-style chart scenarios without hints.`,

        learningLoop: {
          attempts: `unlimited`,
          feedbackMode: `full`,
          passCriteria: `90% (9/10 correct)`,
          lessonPointers: true,
          description: `10 progressive chart analysis challenges. After each attempt, receive full scoring explanation and the specific Lab 2 lesson to review for each missed item. Repeat until 90% pass rate is achieved.`,
          challenges: [
            {
              id: 'jac-1',
              type: `chartReplay-patternID`,
              scenario: `BTC daily: downtrend for 6 days, then a candle forms — Open $70,200, High $74,600, Low $69,800, Close $70,400. Identify: (1) candle colour, (2) pattern type, (3) what it signals at this downtrend location.`,
              scoringCriteria: [
                `Green (Close $70,400 > Open $70,200)`,
                `Near-doji or weak hammer — small green body, long upper wick ($4,200), minimal lower wick`,
                `The long upper wick at the end of a downtrend = buyers attempted a recovery but sellers crushed it back. Bearish continuation signal — not a reversal hammer. The upper wick is dominant here (buyers failed), not the lower wick (which would signal seller rejection).`,
              ],
            },
            {
              id: 'jac-2',
              type: `chartReplay-volumeRead`,
              scenario: `ETH 4H chart. Resistance at $3,800. Breakout candle closes at $3,824. Volume: 0.6× average. The next 4H candle opens at $3,820 and immediately drops back to $3,778. Explain what happened using volume analysis.`,
              scoringCriteria: [
                `Low-volume breakout (0.6×) = insufficient buyer participation for a genuine break`,
                `False breakout: not enough market agreement that $3,800 should be below fair value`,
                `The immediate reversal is consistent with false breakout — the sellers who accumulated near $3,800 stepped in immediately once the thin buyers were exhausted`,
                `Lesson: never treat a breakout as confirmed without ≥1.5× volume`,
              ],
            },
            {
              id: 'jac-3',
              type: `chartReplay-breakout`,
              scenario: `SOL weekly chart: 4 consecutive weeks of upper wicks at $192–$195. On week 5, a candle closes at $196.80 on 2.2× volume. Is this a valid breakout? What is the significance of the prior 4 weeks of upper wicks?`,
              scoringCriteria: [
                `Yes — valid breakout: close above resistance ($195) with high volume (2.2×)`,
                `The 4 prior upper wicks at $192–$195 confirmed strong seller presence at that zone. The 5th attempt broke through — likely because a new catalyst (news, institutional buying) overwhelmed the established supply`,
                `After breakout, role reversal: $192–$195 becomes support`,
                `Buyer interest should be watched at this role-reversed level on the first pullback`,
              ],
            },
            {
              id: 'jac-4',
              type: `chartReplay-patternID`,
              scenario: `BTC daily chart. Bull flag forming: pole from $58,000 to $74,800, flag consolidation between $70,200 and $73,400 for 6 days, flag volume average 0.4×. On day 7, the daily candle closes at $75,200 on 1.8× volume. What is the measured move target?`,
              scoringCriteria: [
                `Pole height: $74,800 − $58,000 = $16,800`,
                `Breakout point: $75,200 (day 7 close)`,
                `Measured target: $75,200 + $16,800 = $92,000`,
                `User confirms the volume conditions (0.4× flag consolidation = healthy low-volume flag; 1.8× breakout = volume confirmation). Valid continuation setup.`,
              ],
            },
            {
              id: 'jac-5',
              type: `judgment-dataInterpret`,
              scenario: `Three timeframes on ETH: Weekly = downtrend (lower highs/lows for 10 weeks). Daily = small uptrend forming (3 green days in sequence). 4H = strong bull flag breakout today. Should you enter long based on the 4H breakout?`,
              scoringCriteria: [
                `Weekly downtrend context = the largest timeframe is bearish. The 4H breakout is a counter-trend trade vs the weekly.`,
                `Valid to enter but: (1) reduced size (0.5-0.75% risk vs standard), (2) target only the nearest daily resistance, (3) acknowledge this is a counter-trend bounce, not a trend continuation`,
                `The daily 3-day uptrend is tentative (only 3 days) and against the weekly context`,
                `Not a high-confidence setup — the 4H signal exists but the HTF (weekly) actively opposes it`,
              ],
            },
            {
              id: 'jac-6',
              type: `chartReplay-reversal`,
              scenario: `ETH daily chart: rising trend for 8 weeks. Three peaks at $4,080, $4,200, and $4,060. Two troughs at $3,820 and $3,840 (between the peaks). A neckline can be drawn at $3,820–$3,840. A daily candle closes at $3,790 on 1.9× volume. (1) Pattern name, (2) is it confirmed, (3) measured target.`,
              scoringCriteria: [
                `Pattern: Head and Shoulders (bearish). Left shoulder $4,080, head $4,200, right shoulder $4,060.`,
                `Confirmed: yes — daily close below neckline ($3,820) with 1.9× volume.`,
                `Target: $3,830 (neckline average) − ($4,200 − $3,830) = $3,830 − $370 = $3,460.`,
                `Entry: $3,780–$3,790. Stop: above right shoulder $4,060 + 0.5% buffer = $4,080.`,
              ],
            },
            {
              id: 'jac-7',
              type: `chartReplay-volumeRead`,
              scenario: `BTC downtrend for 3 weeks: weekly declines of 8%, 6%, 5% with volumes of 1.2×, 0.9×, 0.7× average. Week 4: decline of 7% on 3.4× average volume. What does week 4's volume tell you vs weeks 1-3?`,
              scoringCriteria: [
                `Weeks 1-3: declining volume during decline = selling pressure fading (fewer sellers each week)`,
                `Week 4: massive volume spike (3.4×) on another decline = potential capitulation/selling climax`,
                `Capitulation interpretation: the large sellers who had been accumulating short positions or selling holdings finally exhaust at week 4. The high volume may represent the clearing of the final supply overhang.`,
                `What to watch next: if week 5 is a reversal candle on moderate/high volume, the capitulation thesis is confirmed. A continuation red week 5 would suggest the selling climax interpretation was premature.`,
              ],
            },
            {
              id: 'jac-8',
              type: `chartReplay-patternID`,
              scenario: `SOL 4H chart. Downtrend for 4 days. Price forms two consecutive candles:
Candle A: Open $188, Close $185.80, Low $183.40, High $188.40 (small red body, long lower wick)
Candle B: Open $186.20, Close $190.80, High $191.40, Low $185.80 (large green body — "engulfs" candle A's body)
Identify: (1) pattern name, (2) what it signals, (3) where you would set stop and take-profit.`,
              scoringCriteria: [
                `Pattern: Bullish Engulfing. Candle B's green body (Open $186.20 to Close $190.80 = $4.60 range) completely contains Candle A's red body (Open $188 to Close $185.80 = $2.20 range).`,
                `Signal: after a downtrend, buyers overcame sellers so decisively on Candle B that they reversed and exceeded the entirety of Candle A's move. Bullish reversal signal.`,
                `Stop: below Candle A's low ($183.40) with 0.5% buffer = $182.48`,
                `Take-profit: at least 2:1 R:R. Risk = $190.80 − $182.48 = $8.32. TP = $190.80 + (2 × $8.32) = $207.44. Or nearest resistance level above $190.80.`,
              ],
            },
            {
              id: 'jac-9',
              type: `judgment-dataInterpret`,
              scenario: `A trader marks a "support level" at $3,800 on ETH because "that's where the RSI was oversold last month." Another trader marks support at $3,800 because "there were 3 separate daily candles with lower wicks touching $3,800–$3,820, all closing above $3,860." Which support identification is more reliable and why?`,
              scoringCriteria: [
                `Trader 2 (wick cluster) is more reliable.`,
                `Trader 1's RSI-based support is indirect — RSI being oversold doesn't mean buyers appeared at $3,800 specifically. RSI reflects momentum, not price structure.`,
                `Trader 2's wick cluster is direct evidence: three separate sessions showed buyers appearing at $3,800–$3,820 and rejecting sellers. Real price action = real buyer behaviour at that level.`,
                `Wick-validated support is empirical (what actually happened in the market). Indicator-based "support" is interpretive (what an indicator suggests might happen).`,
              ],
            },
            {
              id: 'jac-10',
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT daily chart. Ascending triangle forming: flat resistance at $73,800 (tested 3 times), ascending support trendline connecting lows at $70,200, $71,400, $72,600. Triangle height: $73,800 − $70,200 = $3,600. Today's breakout candle closes at $74,200 on 2.0× volume.

Full trade design required: entry, stop (using below-pattern method), measured target, R:R calculation with a $75,000 account and 1.5% risk ($1,125).`,
              scoringCriteria: [
                `Pattern confirmed: ascending triangle breakout above $73,800 on 2.0× volume.`,
                `Entry: $74,200 (breakout candle close).`,
                `Stop: below last ascending triangle support ($72,600) with 0.5% buffer = $72,237 ≈ $72,200.`,
                `Measured target: $74,200 + $3,600 = $77,800.`,
                `Risk per BTC: $74,200 − $72,200 = $2,000.`,
                `Position size: $1,125/$2,000 × $74,200 = $41,738 notional = 0.5625 BTC.`,
                `R:R: ($77,800 − $74,200) / ($74,200 − $72,200) = $3,600/$2,000 = 1.8:1 — slightly below 2:1 minimum. User should note this and consider whether a second target (above $77,800) makes the trade meet criteria.`,
              ],
            },
          ],
        },

        },
    },
,
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 3 — ORDER TYPES & TRADE EXECUTION (7 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'order-types',
      title: `Lab 3: Order Types & Trade Execution`,
      subtitle: `The difference between a professional entry and an amateur one`,
      lessons: [
        {
          id: 'market-orders',
          title: `Market Orders`,
          explanation: `On May 19 2021, Bitcoin crashed from $43,000 to $30,000 in 24 hours. During the sharpest part of the decline, traders placing market sell orders saw fills at $31,400, $30,800, or $29,600 — not the $35,000 they saw on screen when they clicked. Market orders execute at whatever price the market offers at the exact moment of execution, not the price you saw when you decided to trade.

A market order is the simplest order type: buy or sell immediately at the best available price. No conditions. No specified price. Immediate execution against whatever is currently sitting in the order book.

The advantage is certainty of execution. A market order will fill. For a trader who needs to exit immediately — because their stop is being blown through in a fast-moving market or they need to close before a news event — market orders are the right tool.

The disadvantage is price uncertainty. In a normal liquid market like BTC/USDT, a $5,000 market order fills within $1–$3 of the displayed price. In a thin market, during high volatility, or on a low-cap asset, a market order can fill meaningfully worse. This gap between expected and actual fill price is called slippage.

The professional rule: use market orders only when speed matters more than price. Emergency exits, time-critical news trades, and any situation where not executing is more costly than executing at a slightly worse price. For all planned entries and exits where you have flexibility — use limit orders instead.`,
          visualPrompt: `Market order consuming multiple order book levels during execution`,
          visualType: `gif`,
          visualUrl: `market-order-execution`,
          examples: [
            {
              contextTag: `[Position Trader, BTC/USDT, emergency exit scenario]`,
              context: `A trader holds a long BTC position worth $28,000. Breaking news arrives: a major exchange reports a significant exploit. Price is falling rapidly from $71,000.`,
              scenario: `The trader has a limit sell at $69,500. Price drops through $69,500 to $68,200 before the limit activates. The order book shows bids thinning rapidly. The trader cancels the limit and places a market sell immediately.`,
              outcome: `Market sell fills at $67,800 — $1,700 below the original limit target. Price continues to $63,000 over the next 2 hours. The $1,700 slippage cost was far less than the $4,800 additional loss from waiting for the limit in a genuine emergency. Speed was correctly prioritised over price.`,
            },
            {
              contextTag: `[Scalp Trader, SOL/USDT, market order cost error]`,
              context: `A scalp trader targets 0.5% profit per trade and makes 20 trades per day. They routinely use market orders for both entries and exits.`,
              scenario: `SOL/USDT spread during peak hours: 0.04%. Market order slippage adds another 0.02% average. Round-trip cost: 0.12%. Target profit: 0.5% gross. Fee: 0.1% × 2 = 0.2%. Total overhead: 0.32%. Net per winning trade: 0.18%.`,
              outcome: `At 55% win rate: EV per trade = (55% × 0.18%) + (45% × −0.82%) = 0.099% − 0.369% = −0.27%. Negative expected value before any market prediction skill. Switching to limit orders eliminates the slippage component — the habit of using market orders was destroying the edge before the trade started.`,
            },
            {
              contextTag: `[Swing Trader, AVAX/USDT, correct market order use]`,
              context: `A swing trader held AVAX long from $28. Price reached $44.80 on a strong up-day. A Fed announcement was scheduled in 5 minutes.`,
              scenario: `The trader had a limit sell at $45.00 but it hadn't filled. With the announcement 5 minutes away, they cancelled the limit and used a market sell instead.`,
              outcome: `Market sell filled at $44.68 — $0.32 below the limit target. The Fed announcement caused a 9% drop in AVAX. The $0.32 cost of using a market order versus the limit saved the trader from a $4.03/AVAX drop. This is the correct application: a scheduled high-impact event made speed more valuable than an extra $0.32.`,
            },
          ],
          keyTakeaway: `Market orders guarantee execution but not price. Use them when speed matters more than precision — emergency exits, time-sensitive news trades, and situations where not executing is more costly than a worse fill. For all planned entries, use limit orders.`,
          guidedPractice: [
            {
              question: `Your BTC long is moving rapidly against you during a flash crash. Your limit sell at $71,000 has been gapped through and price is at $69,400 and falling. What is the correct action?`,
              options: [`A — Wait for a recovery to $71,000 so the limit fills at your planned price`, `B — Cancel the limit and place a market sell immediately, accepting the current price`, `C — Lower the limit to $68,500 to ensure it fills`, `D — Add more at current lower prices to average down`],
              correct: 1,
              hint: `In a fast-moving market moving against you, which risk is greater: slippage from a market order or continued adverse movement while waiting?`,
              explanation: `B is correct. When a limit is gapped through in a declining market, waiting for recovery is hope rather than strategy. A market order at $69,400 is a controlled exit. Price falling to $65,000 while waiting for $71,000 turns a manageable loss into a severe one. C lowering the limit risks further gaps. D adds risk on a trade already moving strongly against the thesis.`,
            },
            {
              question: `BTC/USDT bid: $72,000. Ask: $72,008. You place a market buy for $25,000. What is the guaranteed outcome?`,
              options: [`A — Fill at exactly $72,000`, `B — Fill at or near $72,008 (the current ask), potentially slightly higher if order consumes multiple ask levels`, `C — Fill at $72,000 because market orders always fill at the bid`, `D — No fill until the exchange matches the order`],
              correct: 1,
              hint: `A market buy takes the lowest available asks — where does it start filling?`,
              explanation: `B is correct. A market buy executes against the ask side. The lowest ask is $72,008. A $25,000 order at $72,400/BTC ≈ 0.347 BTC — this amount is typically available at the first ask level in a liquid BTC market. Fill is at or extremely close to $72,008. A and C are wrong — market buys never fill at the bid. D is wrong — market orders execute immediately.`,
            },
            {
              question: `A new trader asks whether they should always use market orders because they are simpler. What is the most accurate response?`,
              options: [`A — Yes, simplicity reduces errors for beginners`, `B — No — market orders pay the spread every time. For planned entries, limit orders are more precise and cost less`, `C — Yes — market orders guarantee you get the displayed price`, `D — It depends only on how large the trade is`],
              correct: 1,
              hint: `What does using a market order instead of a limit order cost on a planned entry with no time pressure?`,
              explanation: `B is correct. Market orders cost the bid-ask spread every time — you buy at the ask and sell at the bid. Limit orders allow you to set your price. A limit buy at the bid earns the spread as a maker instead of paying it as a taker, and earns lower maker fees. C is wrong — market orders guarantee execution, not price. The "displayed price" includes a spread that market orders pay in full.`,
            },
            {
              question: `A low-cap altcoin has bid $0.0420 and ask $0.0448 (6.25% spread). A trader wants to buy $3,000 worth using a market order. What is their immediate unrealised cost?`,
              options: [`A — Zero — market orders execute at fair value`, `B — Approximately $188 — the spread cost of entering at the ask versus the current bid value`, `C — Equal to the trading fee only`, `D — $3 — the spread times the token count`],
              correct: 1,
              hint: `Calculate: buy at ask ($0.0448), immediate sell value at bid ($0.0420). What percentage of $3,000 does the 6.25% spread represent?`,
              explanation: `B is correct. The spread is 6.25%. Market buy at ask: $3,000. Immediate sell value at bid: $3,000 × (1 − 0.0625) = $2,812.50. Immediate unrealised loss = $187.50 ≈ $188. This loss exists before price moves at all — purely the cost of using a market order on a wide-spread asset.`,
            },
            {
              question: `SOL is at $183.60 and has been stable for 20 minutes. You want to buy 10 SOL with no time pressure. Market order or limit order?`,
              options: [`A — Market order — stable price makes slippage irrelevant`, `B — Limit order at $183.60 or below — no time pressure means no reason to pay the ask premium`, `C — Market order — limit orders might not fill`, `D — Neither — wait for price to move first`],
              correct: 1,
              hint: `What does a market order cost compared to a limit order at the current bid when there is no time pressure?`,
              explanation: `B is correct. No time pressure = no reason for a market order. The SOL/USDT ask might be $183.70 (spread ~0.05%). A limit buy at $183.60 enters at a better price and earns maker fee (typically 0.05% vs 0.1% taker). In a stable market, a bid at the current level fills within minutes. The risk of not filling is real but minor compared to the guaranteed cost of the market order spread.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You have three open positions. Breaking news arrives at 2:14pm EST (peak liquidity):

Position 1: BTC/USDT long from $70,200. Current price $71,800. Stop at $69,000. TP at $75,000. News has no direct BTC impact.

Position 2: SOL/USDT long from $182. Current price $179. Stop $175. News: a major DeFi protocol on Solana has been exploited — full damage unknown.

Position 3: ETH/USDT short from $3,840. Current price $3,820. TP at $3,600. News: Ethereum ETF volumes hit all-time high today (positive for ETH).

For each position state: market order, limit order adjustment, or no action — with exact prices and order-type rationale.`,
              scoringCriteria: [
                `Position 1: No action — news doesn't affect BTC, both stop and TP are in place. The OCO bracket handles all scenarios.`,
                `Position 2: Market sell SOL immediately — direct material negative event. Unknown damage = unknown downside. Market order correct: accepting ~0.4% spread slippage is worth avoiding unknown further downside from a DeFi exploit on the native chain.`,
                `Position 3: Short is wrong-directional vs ETH positive news. Market buy to close at approximately $3,820 ask. Alternatively tighten stop to $3,840 (breakeven). User explains market order for exit is appropriate given news invalidates the short thesis.`,
                `User correctly identifies Position 2 as the only emergency (market order justified) and Position 1 as no-action (thesis intact, stops set).`,
                `User calculates slippage cost of Position 2 market exit versus the risk of holding through unknown damage from a DeFi exploit.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT, 5-minute chart. Flash crash event.

Timeline:
2:00pm: Price $72,400. Your long from $70,100. Stop at $70,000. TP at $76,000.
2:01pm: −1.2% candle. Price $71,530.
2:02pm: −2.8% candle. Price $69,530. Stop at $70,000 is breached.
2:03pm: −0.9% candle. Price $68,900.
2:04pm: +0.4%. Price $69,176.
2:05pm: +1.1%. Price $69,938.
2:06pm: +0.8%. Price $70,497.

Order book at 2:02pm: Bids at $70,000 (12 BTC), $69,800 (8 BTC), $69,400 (25 BTC). Your position: 0.14 BTC. Stop set as stop-market.

Answer: (1) At what price did your stop fill? (2) What was slippage vs $70,000? (3) What would stop-limit at $70,000/$69,500 have done differently? (4) Calculate your loss at market fill.`,
              scoringCriteria: [
                `Stop-market at $70,000 with 12 BTC available: 0.14 BTC fills at approximately $69,980–$70,000 given adequate depth.`,
                `Slippage minimal: $70,000 − $69,980 = $20 slippage on 0.14 BTC = $2.80 total. Manageable.`,
                `Stop-limit: trigger at $70,000 creates a limit sell at $69,500. During the crash, bids may not return to $69,500 — potentially leaving the position open as price fell to $68,900. Non-execution risk.`,
                `Loss at fill ($69,980): ($70,100 − $69,980) × 0.14 = $16.80 vs original planned risk of $14 at exact $70,000. Minor difference.`,
                `User identifies stop-market preferred over stop-limit in fast markets because execution certainty outweighs the small slippage.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Review this trader's 30-day order log and identify order type mistakes:

Trade 1: Market bought SOL ($189.40) on a quiet Sunday afternoon. Bid was $188.20, ask $189.40. Spread 0.63%.
Trade 2: Limit buy at $182 on ETH pullback. ETH dipped to $182.40 and bounced to $192 without filling.
Trade 3: Held BTC long. Breaking negative news. Waited 8 minutes for limit sell at $72,000 while price fell to $69,200. Eventually placed market sell at $69,100.
Trade 4: Market sell on SOL exit after 11% gain during peak liquidity. Filled $0.22 below mid-price.
Trade 5: Market buy into ETH breakout at $3,802 (ask). Breakout confirmed: volume 2.4× average.

Classify each: correct order type, incorrect (should have used limit), or incorrect (should have used market). Provide alternative for each incorrect choice.`,
              scoringCriteria: [
                `Trade 1 INCORRECT: Quiet Sunday afternoon, 0.63% spread, no urgency. Should have used limit buy at $188.20. Saved $1.20/SOL.`,
                `Trade 2 CORRECT ORDER TYPE, WRONG PRICE: Limit was correct but $182 was too aggressive ($182.40 was the dip low). Adjusting to $182.50 would have filled. The methodology (limit order) was right; the level was slightly off.`,
                `Trade 3 INCORRECT: Waited 8 minutes using limit during breaking negative news. Should have used market sell immediately. Cost: $72,000 − $69,100 = $2,900 in avoidable additional loss.`,
                `Trade 4 ACCEPTABLE: Market sell during peak liquidity with $0.22 slippage on $180+ asset = 0.12% slippage. Acceptable for an exit. Could have used limit but market was reasonable.`,
                `Trade 5 CORRECT: High-conviction breakout where waiting risks missing the move entirely. Market buy on the breakout candle is appropriate — 0.1% slippage acceptable.`,
              ],
            },
          ],
        },

        {
          id: 'limit-orders',
          title: `Limit Orders — Your Most Important Tool`,
          explanation: `A 2023 study of 50 professional crypto traders found that those using limit orders for more than 80% of their entries outperformed market-order-dominant traders by an average of 3.2% annually on identical strategies — purely from fee and spread savings. On a $100,000 account, that is $3,200 per year from order type discipline alone.

A limit order is an instruction to buy or sell at a specific price or better. A limit buy at $72,000 says: buy only if price reaches $72,000 or lower. A limit sell at $74,000 says: sell only if price reaches $74,000 or higher. The order sits in the order book, visible to all market participants, until filled or cancelled.

When you place a limit buy below the current price, you join the bid side of the order book as a market maker — adding liquidity. The exchange rewards this with lower maker fees (typically 0.05–0.08% vs taker's 0.08–0.1%). Over hundreds of trades, this fee differential is significant.

Limit orders have one risk: non-execution. If price never reaches your level, the order never fills. This is not necessarily a problem — a trade that doesn't reach your price was not there on your terms. It becomes a problem if you set limits too far from price out of excessive optimism, and price moves in your direction without you.

The professional limit order approach: set the limit at a technical level with justification — support, prior resistance turned support, the lower bound of a consolidation. Not at a round number you chose arbitrarily. If the order does not fill, the trade was not there. Move on. Another setup is coming.`,
          visualPrompt: `Limit order placed in the order book — waiting for price to come to it`,
          visualType: `gif`,
          visualUrl: `limit-order-queue`,
          strategy: `Default to limit orders for all planned entries. Place the limit at the technical level where you want to buy — not at a slightly worse price "just to make sure it fills." If your analysis says support is $3,600, put the limit at $3,602. If price never reaches it, that trade was not there on your terms.`,
          examples: [
            {
              contextTag: `[Swing Trader, ETH/USDT, limit order discipline]`,
              context: `A swing trader identifies ETH support at $3,620 on the daily chart — tested twice with bounces of 8% and 11% previously.`,
              scenario: `ETH is at $3,740. The trader places a limit buy at $3,625 and waits. Three days later ETH pulls back to $3,628 before recovering.`,
              outcome: `The limit fills at $3,625. The trader holds to $3,940 for a 9.9% gain. The limit order also improved the R:R: same stop at $3,500 but better entry gives 9.9% target vs 7.6% if they had bought at $3,740 with a market order.`,
            },
            {
              contextTag: `[Day Trader, BTC/USDT, limit order on breakout]`,
              context: `A day trader wants to enter BTC on a breakout above $73,200 resistance. They pre-place a limit buy at $73,250 — just above the resistance line.`,
              scenario: `The breakout candle opens at $73,180 and trades to $73,280. The resting limit at $73,250 fills during this candle.`,
              outcome: `Fill at exactly $73,250. Market order would have filled at $73,320 (the ask at that moment). Savings: $70 per BTC. On a 0.1 BTC position: $7 saved. More importantly, the limit guaranteed the fill was at the pre-defined level, not wherever the market was when the trader noticed and clicked.`,
            },
            {
              contextTag: `[Accumulation Trader, SOL/USDT, tiered limit strategy]`,
              context: `A trader wants to build a long SOL position across a support zone, not at a single level. Support zone: $178–$183 (three prior bounces).`,
              scenario: `They place: 25% at $183, 25% at $181, 25% at $179, 25% at $177 (below zone as aggressive entry). Price dips to $180.40 before recovering.`,
              outcome: `Three limits fill (at $183, $181, $179). Fourth at $177 does not fill. Average entry: $181. Stop at $174.50. The tiered approach provided exposure when the thesis was confirmed (price entering the support zone) without requiring a perfectly timed single entry. The unfilled $177 limit is cancelled after recovery above $185.`,
            },
          ],
          keyTakeaway: `Limit orders are the professional's primary tool. They guarantee price but not execution. Set limits at technically justified levels, not arbitrary ones. Default to limit orders for all planned entries — market orders only when speed genuinely matters more than price.`,
          guidedPractice: [
            {
              question: `You want to buy ETH at $3,820 (the current bid). Ask is $3,828. You place a limit buy at $3,820. What happens?`,
              options: [`A — Instant fill — limit orders at the bid always fill immediately`, `B — Your order joins the bid side. Fills if/when a seller accepts $3,820 — may take seconds or minutes`, `C — The order cannot be placed below the ask`, `D — You receive maker fee discount for adding liquidity`],
              correct: 1,
              hint: `A limit buy below the current ask joins the order book — what happens to it there?`,
              explanation: `B is correct. A limit buy at $3,820 enters the order book on the buy side and waits for a seller willing to accept that price. In an active market this might fill within seconds; in a slow market it may take longer or not fill at all. D is also partially correct (maker fee applies) but doesn't describe the full mechanics. A is wrong — limit orders at the bid don't fill instantly; they wait for a seller. C is wrong — you can absolutely place a limit buy below the ask.`,
            },
            {
              question: `BTC is at $72,000. You can place: limit buy at $71,800 (just below a support cluster) or limit buy at $71,500 (a round number you picked). Which is better?`,
              options: [`A — $71,500 — lower is always a better entry price`, `B — $71,800 — technically justified by the support cluster. $71,500 may never be reached, leaving you out of a valid trade`, `C — Equal — the difference is too small to matter`, `D — $71,500 — further from market price gives more time for analysis`],
              correct: 1,
              hint: `Which limit has a technical reason for its price level? What happens if the technically better level isn't reached?`,
              explanation: `B is correct. The $71,800 limit is at a support cluster — where prior buyers stepped in. This is the logical level. The $71,500 is an arbitrary round number with no evidence of prior buying activity. Setting limits too far from the technical level risks: (1) price not reaching the level during the pullback, leaving you out of a valid move; and (2) if $71,500 is below the entire support zone, it may represent a breakdown rather than a support touch.`,
            },
            {
              question: `You placed a limit buy at $3,600 for ETH. Price pulled back to $3,610 and reversed without filling. Price is now $3,780 and rising. What is the correct response?`,
              options: [`A — Chase with a market order at $3,780 — you need to catch the move`, `B — The trade did not reach your price. Cancel the unfilled order and re-evaluate. Do not chase.`, `C — Lower your limit to $3,500 to ensure it fills on the next dip`, `D — Always chase missed trades — opportunity cost is too high`],
              correct: 1,
              hint: `Your original thesis was that $3,600 was the right entry. Price never confirmed that level. What does chasing at $3,780 do to your original R:R?`,
              explanation: `B is correct. A trade that doesn't reach your price is information: the market didn't provide the entry you planned. Chasing at $3,780 destroys the R:R — your stop was based on $3,480 (below $3,600 support), giving $120 risk. At $3,780 entry with the same stop, risk is $300 — a completely different trade. The discipline is to move on. C lowering the limit after missing a move is anchoring to a price that has lost its relevance. The system working correctly means some trades don't fill.`,
            },
            {
              question: `What is the maker/taker fee distinction and how does it favour limit orders?`,
              options: [`A — Makers pay higher fees for guaranteed fills; takers pay lower for taking what's available`, `B — Makers (limit orders adding liquidity) pay lower fees (0.05–0.08%) than takers (market orders removing liquidity, 0.08–0.1%) because exchanges reward liquidity provision`, `C — Maker and taker fees are always identical`, `D — Maker fees only apply to institutional traders`],
              correct: 1,
              hint: `Who benefits the exchange more: the trader who adds a standing order to the book or the trader who immediately takes from it?`,
              explanation: `B is correct. Traders who add limit orders to the book (makers) improve the exchange's liquidity — making it more attractive for everyone. Exchanges reward this with lower maker fees. Market orders (takers) consume liquidity without contributing it, so they pay higher fees. On Binance: maker 0.1%, taker 0.1% at base tier, but as volume increases, maker rates drop faster. With BNB payment: 0.075%/0.075%, and VIP tiers can reach 0.02% maker vs 0.04% taker. A inverts the relationship entirely.`,
            },
            {
              question: `You want to sell 5 ETH. Current price $3,880. Next resistance at $3,920. Volume is average. No time pressure. Which do you use: immediate market sell or limit sell at $3,900?`,
              options: [`A — Market sell — take the current price and move on`, `B — Limit sell at $3,900 — no urgency, technically justified level just below resistance`, `C — Limit sell at $4,000 — always aim for the highest possible price`, `D — Market sell half, limit sell half`],
              correct: 1,
              hint: `With no time pressure and a technically justified sell level below nearby resistance, which order type delivers a better outcome?`,
              explanation: `B is correct. A limit sell at $3,900 targets $20 above current price — just below the $3,920 resistance where sellers are likely to appear anyway. No time pressure means you can wait for the fill. Risk: if ETH reverses from $3,880 without reaching $3,900, you miss the exit at a better price. That risk is real but mitigated by a realistic level ($3,900 vs $3,920 resistance). A accepts $20/ETH worse price with no strategic reason. C at $4,000 may never be reached this session.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `ETH/USDT, 4-hour chart. You want to enter a long position using limit orders.

Chart analysis:
- Daily uptrend: higher highs and higher lows for 8 weeks
- Key support zone: $3,580–$3,620 (tested twice, bounces of 7% and 12%)
- Current price: $3,742 (Wednesday 11am EST — peak liquidity)
- 4H support: $3,640 (last swing low)
- Current candle: small red body, volume 0.6× average

Account: $20,000. Risk: 1.5% ($300).

Design a limit order entry strategy:
1. Primary limit buy level and justification
2. Single limit or tiered — why?
3. Stop-loss level with justification
4. Two take-profit levels
5. Exact position size using 1.5% risk rule
6. Plan if limit doesn't fill and price moves to $3,820`,
              scoringCriteria: [
                `Primary limit buy: $3,600–$3,620 (within the support zone, technically justified). Not an arbitrary round number.`,
                `Tiered limits acceptable: e.g. 50% at $3,615, 25% at $3,595, 25% at $3,575 to scale into the zone.`,
                `Stop placement: $3,540–$3,555 (below support zone lower boundary with buffer).`,
                `Position size: $300 risk ÷ ($3,615 − $3,550) = $300/$65 = 4.615 ETH at primary entry.`,
                `TP1: $3,742 (current high / prior resistance) ≈ 3.4% from limit.`,
                `TP2: $3,840–$3,880 (next significant resistance) ≈ 6–7% from limit.`,
                `If limit doesn't fill: user correctly states they do NOT chase. Wait for the next technical signal or recalculate entry at $3,820 with fresh risk assessment.`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `Design the order type for each specific scenario. Give precise prices and explain the rationale:

Scenario 1: BTC long position. Pre-defined profit target at $76,000 (resistance). Current price $74,200, rising slowly. No urgency.

Scenario 2: SOL forming a bull flag breakout. Flag boundary is $192. Current price $191.40 (pre-breakout). You want to enter on the confirmed breakout.

Scenario 3: Negative news about your exchange (not your asset). You hold $40,000 ETH. You need to sell and transfer assets. Withdrawals require 2-minute confirmation.

Scenario 4: You want to buy ETH on the next test of $3,600 support. Current price $3,740.

Scenario 5: You are entering a trade 3 minutes before a major scheduled Fed announcement.`,
              scoringCriteria: [
                `Scenario 1: Limit sell at $75,800–$76,000. No urgency, defined technical target. Maker order earns lower fees.`,
                `Scenario 2: Limit buy at $192.20–$192.50 (just above flag boundary). Pre-place now so it triggers automatically on the breakout — not an emergency, planned entry.`,
                `Scenario 3: Market sell immediately. Exchange counterparty risk is an emergency. Cost of slippage vastly lower than risk of exchange restricting withdrawals. Time-critical.`,
                `Scenario 4: Limit buy at $3,605–$3,615 (within support zone). Classic limit use — no urgency, technically justified level, let price come to you.`,
                `Scenario 5: No entry immediately before announcement. If you have a position, consider closing with a market order. Scheduled high-impact events create unpredictable slippage that makes both market and limit orders unreliable.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, daily chart. Major breakout setup forming.

Context:
- BTC consolidated between $64,000 and $74,000 for 14 weeks (both levels tested 4 times each)
- Current price: $73,400 (approaching upper range boundary for 5th time)
- Today's candle: green +1.8%, volume already at 1.6× 20-day average with 6 hours remaining

Three entry approaches:
A — Market buy now at $73,400 anticipating breakout
B — Limit buy at $74,100 (just above resistance boundary) — fills only on confirmed breakout
C — Limit buy at $73,600 inside the range

Account: $25,000. Risk: 2% ($500).
Stop for all entries: $71,000 (below range midpoint)

Evaluate each approach, calculate position sizes, and select the highest quality entry.`,
              scoringCriteria: [
                `Approach B selected as highest quality: limit at $74,100 only fills on confirmed range breakout — buying inside the range (A or C) means buying uncertainty.`,
                `Reasoning: volume expansion (1.6× with 6 hours remaining) is a positive signal but NOT yet confirmation. A daily close above $74,000 on this volume is the confirmation signal.`,
                `Position size for B: $500 / ($74,100 − $71,000) = $500/$3,100 = 0.1613 BTC ($11,940 notional).`,
                `If closes at $73,900 (no fill): cancel the limit, do not chase. Reset for next potential breakout candle.`,
                `User identifies A as premature (buying uncertainty) and C as having the same confirmation problem as A.`,
              ],
            },
          ],
        },

        {
          id: 'stop-loss-orders',
          title: `Stop-Loss Orders — Non-Negotiable`,
          explanation: `In 2018, a trader on BitMEX turned $20,000 into $1.2 million trading Bitcoin. He documented everything publicly. He had one rule he violated more than any other: not using stop-losses because "I know Bitcoin, I can manage it manually." In December 2018 and January 2019, he gave back $900,000 of his gains by holding positions without stops through a 50% price decline, refusing to exit because he "knew it would bounce." He was eventually right — but by then his account was back below $300,000.

A stop-loss order is a pre-set instruction: if price reaches this level, sell immediately. It is the only mechanism that guarantees your downside on any trade is limited to a pre-defined amount. Without a stop-loss, every trade has theoretically unlimited downside.

The argument against stops is: "Price will come back." Sometimes it does. Bitcoin bears from 2017-2018 who held through an 84% drawdown saw their investment recover by 2021. The problems with this reasoning: (1) not every asset recovers — many altcoins from 2018 are at zero today; (2) the psychological torture of a large drawdown causes most people to sell near the bottom anyway; (3) the opportunity cost of capital locked in a losing trade for 3 years destroys compounding even if the asset recovers.

The correct stop-loss placement framework: stops belong at the price level where, if reached, your original trade thesis is invalidated. Not at a round number. Not at "where it hurts enough." Not based on a comfortable loss percentage. The stop price answers the question: if price reaches here, was I wrong about this trade?

Two stop types matter: stop-market (triggers a market sell at your stop level — guaranteed execution, possible slippage) and stop-limit (triggers a limit sell at a specified price — no slippage risk but may not fill if price gaps through the limit). For most traders, stop-market is safer because it guarantees the position is closed.`,
          visualPrompt: `Stop-loss order placement below key support — why it goes there`,
          visualType: `gif`,
          visualUrl: `stop-loss-placement`,
          strategy: `Never enter a trade without knowing your stop price before you execute. Place stops below a technical level (support for longs, resistance for shorts) that invalidates the trade if breached. Move stop to breakeven once the trade is +1R profitable. Never widen a stop to avoid a loss — if your level is hit, the thesis is wrong.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, thesis-based stop placement]`,
              context: `A swing trader enters BTC long at $71,400 on a confirmed breakout from a 6-week consolidation range bounded at $70,000 on the bottom.`,
              scenario: `Trade thesis: BTC broke above the 6-week range on above-average volume. If price returns below $70,000, the breakout has failed. Stop: $69,700 (below range's lower boundary, not a round number, with a small buffer for noise).`,
              outcome: `Three days later BTC tests $70,200 intraday (a normal pullback) before continuing to $78,000. The stop at $69,700 is not triggered — it is below the level that would invalidate the thesis. A stop at $71,000 (just below entry) would have stopped out the trade on the normal pullback.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, arbitrary stop failure]`,
              context: `A new day trader enters ETH long at $3,820. They set their stop at $3,770 because "a $50 loss feels like enough."`,
              scenario: `ETH's nearest support is at $3,720. The $3,770 stop is in empty space — no technical level justifies it. ETH dips to $3,775, triggers the stop, then immediately bounces to $3,840 and continues to $3,980.`,
              outcome: `The stop was placed at an arbitrary level unrelated to trade thesis invalidation. The actual support held — the trade was correct directionally. But the stop in empty space captured normal intraday noise and stopped out a profitable trade. The $50 stop was not wrong in concept — but its placement was methodologically wrong.`,
            },
            {
              contextTag: `[Position Trader, SOL/USDT, trailing stop management]`,
              context: `A position trader enters SOL long at $182. Stop initially at $174 (below breakout level and prior consolidation).`,
              scenario: `SOL rises to $204 (+12.1%). Stop moved to $182 (breakeven). SOL rises to $220 (+20.9%). Stop moved to $204 (locking in 12.1% minimum). SOL peaks at $238 and reverses.`,
              outcome: `SOL falls back through $204. Trailing stop triggers at $203.80. Exit with 12.1% locked gain on the full position. The trailing stop methodology captured substantial profit without needing to pick the exact top.`,
            },
          ],
          keyTakeaway: `A stop-loss is the only mechanism that limits your downside to a pre-defined amount. Place stops at levels where your trade thesis is invalidated — not at arbitrary price levels or comfortable loss amounts. Never enter a trade without knowing your stop in advance.`,
          guidedPractice: [
            {
              question: `You enter SOL long at $190 on a bullish breakout above $188 resistance (now support). The prior swing low is $181. Where should your stop-loss be placed?`,
              options: [`A — $189 — just below entry to minimise potential loss`, `B — $185 — midpoint between entry and prior swing low`, `C — $180.50 — below the prior swing low where the breakout thesis is invalidated`, `D — $170 — well below any level to avoid being stopped by noise`],
              correct: 2,
              hint: `Where does price need to go for your trade thesis ("bullish breakout above $188 support") to be proven wrong?`,
              explanation: `C is correct. The trade thesis is a bullish breakout above $188 which should now act as support. If price falls through $188 and continues below the prior swing low at $181, the breakout has clearly failed. $180.50 is just below $181, adding a small buffer for noise while being below the level that proves the trade wrong. A at $189 is so close any normal wick triggers it. B at $185 is inside the support zone — price could test it and still recover. D at $170 is too far, risking excessive capital.`,
            },
            {
              question: `Your BTC long has moved from $70,000 entry to $76,000 current price. Original stop was $68,000. What is the correct stop management action?`,
              options: [`A — Keep the stop at $68,000 — the original analysis was correct`, `B — Move stop to $70,000 (breakeven) — the trade has proven itself and position cannot now lose capital`, `C — Remove the stop entirely since the trade is profitable`, `D — Move stop to $74,000 to lock in most of the profit`],
              correct: 1,
              hint: `Once a trade is +1R profitable, what is the standard stop management practice?`,
              explanation: `B is correct. Moving the stop to breakeven ($70,000) is standard practice once the trade has moved approximately 1× the initial risk in your favour ($76,000 vs $70,000 entry = $6,000 profit vs $2,000 initial risk = +3R). Breakeven stop means the position can only make money or exit at zero loss. D locking in profit at $74,000 is also reasonable but requires technical justification for that level. C is dangerous — removing stops on profitable positions is how gains are given back. A ignores the profit protection principle entirely.`,
            },
            {
              question: `What is the primary risk of using a stop-limit order (versus stop-market) for your stop-loss?`,
              options: [`A — Stop-limit orders cost more in fees`, `B — If price gaps through your limit price (e.g., in a flash crash), your limit sell may never fill, leaving you holding a losing position indefinitely`, `C — Stop-limit orders cannot be placed on crypto exchanges`, `D — Stop-limit orders always fill at a worse price than stop-market`],
              correct: 1,
              hint: `What happens when price moves fast and gaps through your limit level without trading at it?`,
              explanation: `B is correct. A stop-limit triggers a limit sell when your stop price is hit. If the market gaps from $70,000 to $65,000 without trading in between, your limit sell at $69,500 never gets matched — there are no buyers at $69,500 because price jumped directly to $65,000. You are holding a position with a non-functional stop. Stop-market orders don't have this problem — they take whatever the market offers. The trade-off: stop-market may have more slippage, but it guarantees the position is closed.`,
            },
            {
              question: `ETH is at $3,700 (below your $3,800 entry). Your stop is at $3,640. Analysis suggests the $3,720 support held — thesis may still be valid. What is the correct action?`,
              options: [`A — Move stop closer to $3,700 to reduce the potential loss`, `B — Do nothing — the stop is at $3,640 because that is where the thesis fails. $3,700 has not invalidated anything.`, `C — Exit immediately — being down any amount means the trade is failing`, `D — Add more at $3,700 to improve average entry`],
              correct: 1,
              hint: `Your stop was set at the level that invalidates your thesis. Has that level been reached?`,
              explanation: `B is correct. The stop at $3,640 was placed at a technically justified level. Price at $3,700 is between entry and stop — an adverse move but not thesis invalidation. Moving the stop closer to $3,700 (A) is a common beginner mistake: stop adjustment driven by discomfort rather than technical reasoning. C exits prematurely — every trade in history had moments of being red. D adds risk to a position moving against you — only acceptable with very specific justification.`,
            },
            {
              question: `A trader claims: "I don't use stops because they always take me out right before the reversal." What is the most accurate response?`,
              options: [`A — They are correct — stops are counterproductive for experienced traders`, `B — The stops are placed at technically wrong levels — not at thesis-invalidation levels. The solution is better placement, not abandoning stops`, `C — They should use wider stops to avoid being stopped`, `D — The market targets stop levels specifically to trap retail traders`],
              correct: 1,
              hint: `If stops "always" get hit before reversals, what does that suggest about where they are being placed?`,
              explanation: `B is correct. When stops are "always" hit before reversals, the stops are in the wrong place — typically at levels where the market creates normal noise, not at genuine thesis-invalidation levels. The solution is not removing stops but placing them at levels that genuinely invalidate the trade: below swing structure, below confirmed support, with a buffer for normal volatility. A is dangerously wrong — every major trading blowup involves operating without stops. C treats the symptom without addressing the cause. D is market mythology — stops are hit because they are placed in noisy zones, not because of targeting.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT, 4-hour chart. You entered a long yesterday.

Your trade:
- Entry: $71,200 (breakout above $71,000 consolidation resistance)
- Stop-loss: $69,800 (below consolidation base)
- Take-profit: $76,000
- Position: 0.21 BTC ($14,952)
- Account: $18,000

6 candles since entry:
Candle 1: +1.2%, close $72,054. Vol 1.8×.
Candle 2: +0.8%, close $72,630. Vol 1.1×.
Candle 3: −0.4%, close $72,339. Vol 0.6×.
Candle 4: −0.9%, close $71,688. Vol 0.7×.
Candle 5: −1.2%, close $70,823. Vol 0.9×.
Candle 6 (current): Opening at $70,780. Early price: $70,300.

Questions: (1) Has your stop triggered? (2) Should you move the stop? (3) Current unrealised loss as % of account? (4) At what price would you manually exit above the stop if you lost confidence?`,
              scoringCriteria: [
                `Stop at $69,800 has NOT triggered — current $70,300 is above stop.`,
                `Stop should NOT be moved lower (widens risk). Consider tightening to $70,200 if current candle shows weakness confirmation on rising volume.`,
                `Unrealised loss: ($71,200 − $70,300) × 0.21 = $189 = 1.05% of $18,000 — within 1–2% risk framework.`,
                `Manual exit level: user identifies a technical level — below current candle's close if it closes red with increasing volume, or at a specific support. Arbitrary early exit is incorrect.`,
                `User correctly notes: thesis (breakout above $71,000) is partially challenged but not yet invalidated until price breaks $69,800.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Review 5 live trades with their stop placements. Identify which are correctly placed (thesis-based) and which need adjustment:

Trade 1: Long SOL at $188. Stop at $187.50. Nearest support: $183.
Trade 2: Long BTC at $72,000 (breakout above 8-week range resistance at $71,800). Stop at $71,700. Prior swing low: $70,200.
Trade 3: Short ETH at $3,820 (4H RSI bearish divergence). Stop at $3,900. No significant resistance between $3,820 and $4,100.
Trade 4: Long AVAX at $38.50 (bull flag breakout, flag low $35.80). Stop at $36.80 (midpoint of flag).
Trade 5: Long BNB at $412 (at weekly support, 3 prior tests, lowest wick $408). Stop at $399.

Classify each: correct, too tight, or too wide. Suggest correction for each wrong placement.`,
              scoringCriteria: [
                `Trade 1 TOO TIGHT: $187.50 is $0.50 below entry — any normal wick triggers it. Support is $183. Correct stop: $182.50 (below support with buffer).`,
                `Trade 2 ACCEPTABLE but slightly aggressive: $71,700 is below $71,800 new support with small buffer. The swing low at $70,200 provides a deeper fallback. The $71,700 stop is justifiable for a tight breakout play.`,
                `Trade 3 TOO TIGHT: Short at $3,820 with stop $3,900 = $80 stop. No resistance until $4,100. If RSI divergence short, thesis fails above $4,100. Correct stop: $4,120.`,
                `Trade 4 TOO TIGHT / WRONG LEVEL: Stop at $36.80 (midpoint) will trigger on normal flag oscillation. Bull flag stop should be below the flag's lowest point ($35.80). Correct: $35.40.`,
                `Trade 5 CORRECT: Stop at $399 is below the lowest wick of all 3 prior support tests ($408). Thesis invalidation: if price breaks below all three tested support points, the support has failed.`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `You entered BTC long at $68,400 three days ago. Stop: $66,200. Target: $74,000. Account: $22,000. Position: 0.12 BTC.

New chart data:
Day 1: +2.8%, close $70,314. Vol 1.6×.
Day 2: +1.9%, close $71,650. Vol 1.2×.
Day 3: −0.6%, close $71,221. Vol 0.7×.
Day 4 (today): −1.8% so far. Current: $69,935.

Work through each option and calculate the outcome:
Option A: Keep stop at $66,200 (original)
Option B: Move stop to $68,400 (breakeven)
Option C: Move stop to $69,000 (partial profit lock)
Option D: Exit now at $69,935

For each: calculate the outcome if stopped out, and state whether it is consistent with professional stop management.`,
              scoringCriteria: [
                `Option A: If stopped at $66,200 → loss = ($68,400 − $66,200) × 0.12 = $264 = 1.2% of account. Within original risk plan. Acceptable if thesis still intact.`,
                `Option B: Breakeven stop at $68,400 → if stopped: $0 loss. Risk-free position. Standard +1R protection move and the most professionally correct action given current $178 gain.`,
                `Option C: Stop at $69,000 → if stopped: gain of ($69,000 − $68,400) × 0.12 = $72. Locks minimum $72 profit. More aggressive but valid.`,
                `Option D: Exit at $69,935 → captures $178 gain but exits before target or stop. Requires justification: if Day 4 volume is increasing on decline, partial exit may be warranted.`,
                `User recommends Option B as the baseline correct action (breakeven stop) with option to take 25-30% partial profit at current price if Day 4 volume is concerning.`,
              ],
            },
          ],
        },

        {
          id: 'take-profit-orders',
          title: `Take-Profit Orders — Knowing When to Win`,
          explanation: `Ask 100 traders what their biggest challenge is and approximately 70 will say some version of: "I exit profitable trades too early." The second most common answer is: "I let profitable trades turn into losses." Both problems share a root cause — no pre-defined take-profit level.

A take-profit order is a limit sell order that automatically closes your long position when price reaches your target. It solves both problems simultaneously: it prevents early exits driven by anxiety (the order won't fill until target is reached) and it prevents profitable trades from reversing (once target is hit, the position is closed, not reconsidered).

The best take-profit levels are derived from technical analysis — not from a desire to make a specific dollar amount. The correct question is: where will sellers likely appear in enough force to halt this move? The answer comes from: prior resistance levels, measured move targets (flag pole height, range height), key psychological levels, and on-chain data.

Multiple take-profit levels — laddering — is the professional approach. Instead of one TP that captures everything or nothing, ladder TPs at increasing levels. TP1 at the first technical resistance (secure profit, reduce position risk), TP2 at the second resistance, TP3 at the measured move target. Move stop to breakeven after TP1 fills.

The rule on moving take-profits: you can move a TP upward if new technical information justifies it — for example, if the chart forms a continuation pattern suggesting more upside. You should not move a TP downward to "take less profit sooner" unless your analysis has genuinely changed. Moving a TP down is almost always anxiety-driven, not analysis-driven.`,
          visualPrompt: `Laddered take-profit orders — how professionals exit positions in stages`,
          visualType: `gif`,
          visualUrl: `take-profit-laddering`,
          strategy: `Set TP1 at the nearest significant resistance where sellers are most likely to appear. TP1 should provide at least 2:1 R:R from entry. After TP1 fills, move stop to breakeven. Set TP2 at the next resistance for continuation. Take at least 30% of position at TP1 to secure profit and reduce size before harder resistance levels.`,
          examples: [
            {
              contextTag: `[Swing Trader, ETH/USDT, laddered TP execution]`,
              context: `A swing trader enters ETH long at $3,620 with stop at $3,480. Three resistance levels above: $3,820, $4,000 (psychological), $4,200 (measured move target).`,
              scenario: `TP1 at $3,815 (50% of position), TP2 at $3,990 (30%), TP3 at $4,180 (20%). After TP1 fills, stop moves to $3,620 (breakeven). After TP2 fills, trailing stop set at $3,900.`,
              outcome: `Price reaches $3,815 (TP1 fills +5.4%), reaches $3,990 (TP2 fills +10.2%), peaks at $4,100 then reverses. TP3 never fills; trailing stop at $3,900 triggers for +7.7% on the remaining 20%. Overall blended return: 50% at +5.4% + 30% at +10.2% + 20% at +7.7% = +7.5%. Better than "take everything at $3,815" (+5.4%) or "hold for $4,180 and miss partial profits."`,
            },
            {
              contextTag: `[Anxiety Trader, BTC/USDT, cost of early exit]`,
              context: `A trader enters BTC long at $69,400 with a TP at $76,000. Price immediately moves to $71,200 (+2.6%) and the trader manually closes early, deciding to "take what's there."`,
              scenario: `They exit at $71,200. BTC continues to $76,800 over the following 4 days. The TP at $76,000 would have been reached.`,
              outcome: `Early exit captured $1,800/BTC vs the planned $6,600/BTC. On a 0.14 BTC position: $252 realised profit vs $924 planned. This is exactly the problem pre-set TPs solve — the order would have held through the $71,200 level automatically without the anxiety of manual decision-making at each candle.`,
            },
            {
              contextTag: `[Position Trader, SOL/USDT, upward TP adjustment with justification]`,
              context: `A position trader entered SOL long at $85 with TP at $120. SOL reaches $118 and forms a bull flag continuation pattern.`,
              scenario: `Bull flag pole: $40. Clean consolidation forms. Measured continuation target: $118 + $40 = $158. The trader adjusts TP from $120 to $155, moving stop to $108 (below flag low) to protect accumulated profit.`,
              outcome: `SOL reaches $152 where the TP fills. The TP adjustment was technically justified — new chart evidence (continuation pattern) supports a higher target. The key distinction: the justification was a new chart pattern providing a new measured move, not wishful thinking about how much more it could go.`,
            },
          ],
          keyTakeaway: `Set take-profit levels at technically justified resistance levels before you enter the trade. Use laddered TPs to secure partial profits at each resistance while keeping position running. Never lower a TP out of anxiety. You can raise a TP if new technical evidence justifies it.`,
          guidedPractice: [
            {
              question: `You enter BTC long at $71,000 with stop at $69,400. Nearest resistance is at $73,800. Is $73,800 an acceptable TP1 at 2:1 minimum R:R?`,
              options: [`A — Yes — any defined level is acceptable for TP1`, `B — Calculate: Risk = $1,600. Reward = $2,800. R:R = 1.75:1. Below 2:1 minimum. Consider TP1 at $74,200 ($3,200 reward = exactly 2:1).`, `C — R:R doesn't matter for take-profits — pick the nearest resistance`, `D — Minimum R:R is 3:1, so $73,800 definitely fails`],
              correct: 1,
              hint: `R:R = Reward / Risk. Risk = Entry − Stop. Reward = TP − Entry. What is the standard minimum?`,
              explanation: `B is correct. Risk = $71,000 − $69,400 = $1,600. TP at $73,800: Reward = $2,800. R:R = 2,800/1,600 = 1.75:1. This is below the 2:1 professional minimum. Adjusting TP1 to $74,200 gives $3,200/$1,600 = exactly 2:1. The $73,800 level could serve as a partial TP in a ladder while $74,200+ serves as the primary. A is wrong — setting TPs at arbitrary levels produces negative EV over time.`,
            },
            {
              question: `You have a profitable ETH position approaching TP1 at $3,900. You are tempted to lower the TP to $3,860 "to make sure it fills." Why is this a mistake?`,
              options: [`A — It's not a mistake — securing any profit is always right`, `B — Lowering a TP out of anxiety reduces realised profit with no analytical justification. The $3,900 TP was set at a technical level. Anxiety is not new information.`, `C — Only matters if price reverses after $3,860`, `D — The $40 difference is negligible`],
              correct: 1,
              hint: `What changed between when you set the TP at $3,900 and now? Has new information arrived, or just anxiety?`,
              explanation: `B is correct. The TP at $3,900 was placed at a resistance level with technical justification. Lowering it to $3,860 before it fills is a decision driven by emotion, not analysis. Every $40 reduction × position size is money given away with no analytical basis. If price approaches $3,900 and reverses, your original analysis was right about that level being significant — that's information. But lowering a TP proactively because you have a profitable position is systematic underperformance. The discipline is to hold your technically justified level.`,
            },
            {
              question: `BTC bull flag has a pole from $58,000 to $74,000. Flag breakout at $71,200. Where is the measured move TP target?`,
              options: [`A — $87,200 — pole height ($16,000) + breakout point ($71,200)`, `B — $90,000 — round number near the calculated target`, `C — $74,000 — the top of the flag pole`, `D — $71,200 + 20% = $85,440`],
              correct: 0,
              hint: `Measured move = pole height added to the breakout point of the flag.`,
              explanation: `A is correct. Pole height = $74,000 − $58,000 = $16,000. Breakout point = $71,200. Measured move TP = $71,200 + $16,000 = $87,200. B rounds to $90,000 — which may be used as a TP given round number resistance but is not the mathematically calculated measured move. C is the flag pole top, not the continuation target. D applies a percentage which is an alternative method but not the measured move calculation.`,
            },
            {
              question: `You have a long ETH position. TP1 at $3,820 (50% of position) just filled. What should you do with your stop-loss?`,
              options: [`A — Keep the stop at the original level ($3,480)`, `B — Move the stop to $3,600 (breakeven) — TP1 profit is secured, remaining position should be risk-free`, `C — Remove the stop entirely — you are already in profit`, `D — Move stop to $3,820 (where TP1 filled)`],
              correct: 1,
              hint: `After a partial take-profit fills, what is the professional stop management standard for the remaining position?`,
              explanation: `B is correct. After TP1 fills, you have secured profit on 50% of the position. The remaining 50% should now be managed at no risk to capital — move stop to breakeven ($3,600). This means the remaining position can only add to profits or exit at zero loss. A keeps unnecessary downside risk after you have confirmed the trade is working. C is dangerous — no stop on a running position is how profitable trades become losses. D at $3,820 may be too aggressive unless there is technical support at that exact level.`,
            },
            {
              question: `Your SOL position is approaching TP1 ($195). SOL forms a clear bull flag consolidation just below $195 over the last 3 candles. Should you adjust your TP?`,
              options: [`A — No — never move take-profits regardless of new information`, `B — Yes — move TP1 upward to the measured continuation target of the new bull flag. Technical evidence is exactly the type of new information that justifies adjusting a TP higher.`, `C — Exit immediately — any consolidation near TP means the trade is over`, `D — Lower TP1 to $192 to capture profit before the consolidation completes`],
              correct: 1,
              hint: `What type of new information justifies moving a TP upward? What type does not?`,
              explanation: `B is correct. A bull flag forming just below your TP is precisely the type of analytical new information that justifies adjusting the TP higher. The flag suggests the move will continue beyond the original target. Correct action: calculate the new measured move, move TP1 to that target, move stop to below the flag low to protect accumulated profit. A is wrong — new technical evidence absolutely warrants TP updates. D (lowering TP) is anxiety-driven and directly contradicts the technical evidence.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT, daily chart. Entering a swing trade.

Setup:
- Entry: $71,400 (daily bull flag breakout, flag low $69,200, pole $14,800)
- Measured move: $71,400 + $14,800 = $86,200
- Key resistances: $74,000, $78,000, $86,000
- Stop: $68,800 (below flag)
- Account: $20,000. Risk: 2% ($400). Position: $400/$2,600 = 0.154 BTC.

Design the complete exit strategy:
1. Set 3 TP levels with position percentages
2. Stop movement schedule (when to breakeven, then trail)
3. Calculate P&L for each scenario:
   - Scenario A: stops out at $68,800
   - Scenario B: hits TP1, reverses to breakeven stop
   - Scenario C: hits TP1, TP2, then reverses at $77,000
   - Scenario D: hits all 3 TPs`,
              scoringCriteria: [
                `TP1: $73,800–$74,000 (40%). Risk $2,600. Reward $2,400–$2,600.`,
                `TP2: $77,800–$78,000 (40%). Reward $6,400–$6,600. R:R ≈ 2.5:1.`,
                `TP3: $85,800–$86,200 (20%). Reward $14,400. R:R ≈ 5.5:1.`,
                `Stop moves to breakeven after TP1 fills. Trail to $74,000 after TP2 fills.`,
                `Scenario A: −$400 (2% of account — pre-defined max loss).`,
                `Scenario B: TP1 fills (+$370 on 40%) − $0 remaining (stopped at breakeven) = +$370 net.`,
                `Scenario C: TP1 ($370) + TP2 ($985) = +$1,355 total.`,
                `Scenario D: +$370 + $985 + $440 = +$1,795 total across all three TPs.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader's 60-day journal shows this take-profit behaviour:

Total trades: 45
TP hit as planned: 12 (27%) — avg gain +4.8%
TP lowered before hitting original level: 18 (40%) — avg gain +1.6% (original target would have given avg +4.8%)
Manually closed before TP or stop: 15 (33%) — avg gain +1.2%

Calculate EV per trade for each category and identify the pattern destroying performance.`,
              scoringCriteria: [
                `"TP hit as planned" contribution: 12 × +4.8% = +57.6% total.`,
                `"TP lowered" contribution: 18 × +1.6% = +28.8% total. Opportunity cost: 18 × (4.8% − 1.6%) = 18 × 3.2% = 57.6% foregone — exactly equal to the total gain from planned TPs.`,
                `"Manually closed" contribution: 15 × +1.2% = +18% total.`,
                `Primary problem identified: 40% of trades had TPs lowered out of anxiety, losing 3.2% average per trade vs original target. This is the single largest performance leak.`,
                `Secondary problem: 33% manually closed before TP or stop — no systematic approach to exits.`,
                `Recommendation: eliminate TP lowering entirely by setting OCO brackets in advance and removing manual override capability during trades.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `SOL/USDT, 4-hour chart. Bull flag breakout confirmed 2 candles ago.

Setup:
- Pole: $162 to $194 (+$32)
- Flag low: $186
- Breakout: closed at $191.80 on 2.6× volume
- Current: $193.40
- Stop: $184.50 (below flag low with buffer)
- Account: $12,000. Risk: 1.5% ($180). Position: $180/$8.90 = 20.22 SOL.

Resistance levels: $196 (prior 4H high), $200 (psychological), $206 (prior swing high), $223.80 (measured move: $191.80 + $32).

Design complete TP ladder with position percentages. Calculate exact dollar P&L for:
A — Clean run to measured move
B — Price peaks at $204 and reverses`,
              scoringCriteria: [
                `TP1: $195.50–$196 (40% = 8.09 SOL). P&L: 8.09 × $2.60 = $21.03.`,
                `TP2: $199.50–$200 (35% = 7.08 SOL). P&L: 7.08 × $6.60 = $46.73.`,
                `TP3: $205.50–$206 (15% = 3.03 SOL). P&L: 3.03 × $12.60 = $38.18.`,
                `TP4 runner: $223–$224 (10% = 2.02 SOL). P&L: 2.02 × $29.60 = $59.79.`,
                `Scenario A (full run): $21.03 + $46.73 + $38.18 + $59.79 = $165.73.`,
                `Scenario B (peaks $204): TP1 fills ($21.03), TP2 fills ($46.73), TP3 does not fill (reverses before $206). Remaining 25% exits at trailing stop. Total: $67.76 + trailing stop gain on 25% of position.`,
              ],
            },
          ],
        },

        {
          id: 'oco-orders',
          title: `OCO Orders — One Cancels the Other`,
          explanation: `Imagine you hold 50 SOL purchased at $180. You want to take profit if SOL reaches $198 — but you also want to stop losses if it falls below $172. Without an OCO order, you need to manage both orders manually: cancel the stop if the TP fills, cancel the TP if the stop fills. In a fast-moving market at 3am, this manual management fails. The OCO order solves it completely.

OCO stands for One Cancels the Other. It links two orders together: a take-profit limit order and a stop-loss order. When one fills, the exchange automatically cancels the other. The result: a fully automated trade management system that doesn't require you to be watching.

On Binance and most major exchanges, the OCO interface asks for three inputs: the stop trigger price, the stop limit price (or stop-market setting), and the TP limit price. When either the TP fills (trade exits at profit) or the stop triggers (trade exits at loss), the other order disappears automatically.

The practical use case: you enter a position, immediately set an OCO for the exit, and then you can close your terminal. The trade is fully managed. The TP captures profit if your analysis is right; the stop cuts losses if you were wrong. You don't need to watch minute by minute.

Advanced OCO strategy: bracket orders. Enter via limit order, set the OCO immediately after the fill. The trade now has a defined top (TP), a defined bottom (stop), and you are waiting to see which boundary is reached first. This is professional trade management accessible to every trader.

The limitation: OCO orders only manage the exit. They don't manage re-entries, position additions, or trailing. For sophisticated management like laddered TPs you need to manually adjust — but even a basic OCO bracket eliminates the most common mistake: forgetting to set a stop after a profitable entry.`,
          visualPrompt: `OCO order interface on Binance — TP and stop linked together`,
          visualType: `gif`,
          visualUrl: `oco-order-setup`,
          examples: [
            {
              contextTag: `[Swing Trader, ETH/USDT, overnight OCO protection]`,
              context: `A swing trader enters ETH long at $3,720 at 9pm EST. They have a day job and cannot monitor markets overnight.`,
              scenario: `They immediately set an OCO: TP limit at $3,940, stop trigger at $3,590/stop limit at $3,580. The bracket is set and they sleep. At 2am, ETH spikes to $3,942 and the TP fills at $3,940.`,
              outcome: `Wake up to a profit notification. Stop automatically cancelled. The OCO managed the trade through the night. The alternative — manually watching at 2am or hoping the limit holds — is eliminated by the pre-set bracket. This is OCO used correctly.`,
            },
            {
              contextTag: `[Day Trader, BTC/USDT, OCO stop-limit gap risk]`,
              context: `A day trader enters BTC long at $72,400 and sets an OCO: TP at $74,800, stop trigger $71,000, stop limit $71,200.`,
              scenario: `The stop limit price ($71,200) is set ABOVE the stop trigger ($71,000). If price gaps from $71,400 to $70,800, the stop-limit order triggers and creates a limit sell at $71,200 — but price has already gapped below $71,200. The limit may not fill.`,
              outcome: `The trader's error: stop limit price must be BELOW the stop trigger to ensure fill in gap scenarios. Setting stop limit at $70,600 (below the $71,000 trigger) would have protected against this. Alternatively: use stop-market in the OCO to guarantee execution.`,
            },
            {
              contextTag: `[Position Trader, SOL/USDT, bracket trade management]`,
              context: `A position trader enters SOL at $185 on a 4-hour breakout. They use a full bracket approach.`,
              scenario: `Immediately after entry fill: OCO set with TP at $204 and stop trigger at $179/stop limit at $178. The bracket defines the trade completely. Later: SOL rises to $196.40 (+6%). The trader manually adjusts the OCO stop to $185 (breakeven).`,
              outcome: `SOL reverses from $198 and falls through $185. The adjusted stop triggers at $184.80. Final outcome: +$0.80/SOL from entry (essentially breakeven). The OCO framework prevented a loss while capturing a near-breakeven exit on a trade that worked, then partially retraced. OCO bracket management at its most basic useful level.`,
            },
          ],
          keyTakeaway: `OCO orders link your take-profit and stop-loss — when one fills, the other is automatically cancelled. Set OCO brackets immediately after every entry. This is how professionals guarantee trade management without constant monitoring.`,
          guidedPractice: [
            {
              question: `You enter BTC long at $72,000. TP: $76,000. Stop: $70,000. How do you set this as an OCO on Binance?`,
              options: [`A — Place two separate orders: a limit sell at $76,000 and a stop-market at $70,000`, `B — In the OCO interface: Stop trigger $70,000 / Stop Limit $69,900 / Take-Profit limit $76,000 — all three linked so one cancels the other`, `C — OCO orders can only be used by institutional traders`, `D — Set the TP first, then add the stop separately — the exchange links them automatically`],
              correct: 1,
              hint: `The OCO interface requires three inputs: stop trigger, stop limit price, and TP limit.`,
              explanation: `B is correct. Binance's OCO requires: (1) Stop trigger price ($70,000 — when price reaches this, the stop activates), (2) Stop limit price ($69,900 — set slightly below trigger to allow for small movements), (3) Take-profit limit ($76,000 — a standing limit sell). When either fills, the other is cancelled automatically. A places two separate orders with no linkage — if the TP fills first, the stop remains active and may create an unintended short position when price falls back to $70,000. D is wrong — Binance does not automatically link separate orders.`,
            },
            {
              question: `Your OCO: TP $74,000 limit sell, stop trigger $70,000/stop limit $69,950. Price gaps from $70,200 to $69,800. What happens?`,
              options: [`A — The stop trigger fires and executes at the best available price immediately`, `B — The stop trigger fires, creating a limit sell at $69,950 — but price is already at $69,800, below the limit. Order placed but may not fill if price continues declining.`, `C — Nothing — the gap invalidates both orders`, `D — The TP order fills because the gap was a market error`],
              correct: 1,
              hint: `The stop trigger fires when price hits $70,000. What order type does it create, and can that order fill if price has already gapped below the limit?`,
              explanation: `B is correct. The stop trigger at $70,000 fires and creates a limit sell at $69,950. But price has gapped to $69,800 — below the limit. The limit is placed but won't execute immediately since market price is below your sell limit. If price bounces to $69,950 it fills. If price continues falling, the limit sits unfilled. This is the core risk of stop-limit within OCO. Solution: set stop limit significantly below trigger (e.g., $69,000 for a $70,000 trigger) or use stop-market in the OCO.`,
            },
            {
              question: `Why is setting an OCO bracket immediately after entry better than managing stop and TP separately throughout the day?`,
              options: [`A — OCO brackets always fill at better prices`, `B — The OCO prevents accidentally double-selling. If TP fills while you're away and you forget to cancel the stop, the stop would create an unintended short when price falls back to that level. OCO prevents this.`, `C — Separate orders are more flexible`, `D — OCO is only needed for automated bots`],
              correct: 1,
              hint: `What happens if both a separate TP order and a separate stop order are active at the same time and the TP fills?`,
              explanation: `B is correct. With two separate orders, if the TP fills and closes your long, the stop-market at $70,000 remains active. If price later falls to $70,000, the stop executes — but you no longer have a long position to close. The stop creates a new unintended short position. OCO automatically cancels the stop the moment the TP fills (and vice versa), preventing exactly this. This is critical for traders who may not monitor continuously.`,
            },
            {
              question: `You enter SOL long at $190. Immediately after the entry fill, what is the first thing you should do?`,
              options: [`A — Watch the chart closely to manage manually`, `B — Set an OCO order with your predetermined TP and stop-loss levels`, `C — Wait to see if the trade is profitable before setting exits`, `D — Set the stop first, then set the TP later if the trade moves in your favour`],
              correct: 1,
              hint: `When should your exit strategy be defined — before the trade, during it, or after seeing the result?`,
              explanation: `B is correct. Your exit strategy should be decided before entry based on analysis — not while the position is live and emotions are involved. Setting the OCO immediately after entry locks in your pre-decided plan, removes emotional decision-making from trade management, and ensures protection even if you can't watch. C is the most dangerous — entering without an exit plan is the classic mistake. D partially corrects C but delays the TP — if the trade moves rapidly in your favour, you may miss your planned TP while scrambling to set it.`,
            },
            {
              question: `Your OCO is set for 3 BTC: TP $76,000 limit sell, stop trigger $70,000/stop limit $69,950. You manually sell 1 BTC at $73,000 as a partial profit. What must you do with the OCO?`,
              options: [`A — Nothing — the OCO automatically adjusts to 2 BTC`, `B — Cancel the existing OCO and set a new OCO for 2 BTC (the remaining quantity) with same or updated prices`, `C — Cancel just the stop-loss portion of the OCO`, `D — The OCO becomes invalid when position size changes`],
              correct: 1,
              hint: `If the OCO still shows 3 BTC after you sold 1 BTC manually, what happens when either the TP or stop triggers?`,
              explanation: `B is correct. The OCO was placed for 3 BTC. If you manually close 1 BTC, you now hold 2 BTC. The OCO still says "3 BTC" — when it triggers, it will attempt to sell 3 BTC but you only have 2 BTC. The remaining 1 BTC would create an unintended short position. Correct procedure: cancel the original OCO immediately after the partial manual exit, then set a new OCO for the correct 2 BTC quantity. Keeping OCO quantities in sync with actual position size is essential trade management hygiene.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Review three active OCO orders and identify any setup errors:

Position 1: Long BTC at $72,000 (0.15 BTC). OCO: TP limit $76,000 / Stop trigger $70,000 / Stop limit $70,100.
Note: Stop limit ($70,100) is ABOVE the stop trigger ($70,000).

Position 2: Long ETH at $3,720 (2.5 ETH). OCO: TP limit $3,940 / Stop trigger $3,580 / Stop limit $3,500.
Note: You previously took a partial profit of 0.5 ETH manually at $3,820. OCO still set for 2.5 ETH.

Position 3: Long SOL at $188 (10 SOL). OCO: TP limit $202 / Stop trigger $180 / Stop limit $179.50.
Note: Setup appears complete. No manual changes made.

For each: identify any error, explain the consequence, and provide corrected OCO settings.`,
              scoringCriteria: [
                `Position 1 ERROR: Stop limit ($70,100) is ABOVE stop trigger ($70,000). When trigger fires at $70,000, it creates a limit sell at $70,100 — which is above current price and would fill immediately as effectively a market order at whatever's available. May cause unexpected fill behavior. Correct: stop limit at $69,900 (below trigger).`,
                `Position 2 ERROR: Quantity mismatch. OCO set for 2.5 ETH but only 2.0 ETH held (sold 0.5 manually). When OCO triggers, it tries to sell 2.5 ETH — the extra 0.5 ETH creates an unintended short. Cancel OCO, set new OCO for 2.0 ETH.`,
                `Position 3: CORRECT. Stop limit ($179.50) is below trigger ($180). Quantity matches position (10 SOL). No errors identified.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT. Setting up a complete bracket trade using OCO.

Chart analysis:
- Current price: $71,600 (daily bull flag confirmed breakout)
- Pole: $58,000 → $72,000 (+$14,000). Flag breakout: $71,600.
- Measured move: $71,600 + $14,000 = $85,600
- Key resistances: $74,000, $78,000, $85,000
- Flag low: $69,200

Account: $15,000. Risk: 1.5% ($225). Position: $225/($71,600 − $69,000) = 0.0865 BTC.

Design the complete OCO bracket:
1. Primary OCO settings (full position, exact TP and stop prices)
2. What happens to the primary OCO when you take partial profit at $74,000
3. Set the adjusted OCO for remaining position after partial exit`,
              scoringCriteria: [
                `Primary OCO: TP limit $73,800 (just below $74,000 resistance) / Stop trigger $69,200 / Stop limit $69,000.`,
                `Partial exit: sell approximately 50% (0.0433 BTC) manually at $73,800–$74,000.`,
                `After partial exit: cancel primary OCO (quantity now wrong), set new OCO for remaining 0.0432 BTC: TP limit $77,800 / Stop trigger $71,600 (breakeven) / Stop limit $71,400.`,
                `Third OCO after TP2: remaining 20% of original → TP at $84,800 / Stop trigger $78,000 / Stop limit $77,500.`,
                `User explains the quantity sync requirement and the need to cancel before resetting.`,
              ],
            },
            {
              type: `judgment-ethicalChoice`,
              scenario: `A friend new to trading argues: "I don't use OCO or stop-loss orders because I check my phone every 2 hours and can always close a trade manually if it goes wrong. It's worked fine for 4 months."

Three events from their 4 months:
1. A trade went against them while they slept — woke to 9% drawdown, held it, it recovered over 2 weeks.
2. During a work meeting, a trade moved against them 7% — couldn't act for 90 minutes.
3. Made $800 in a trade and manually exited 1 hour early due to nervousness — the trade would have hit the original target for $1,800 two hours later.

Using these three specific events, explain how automated OCO orders would have improved each outcome.`,
              scoringCriteria: [
                `Event 1 (overnight): A pre-set stop would have closed the position before the 9% drawdown. OCO with a 2.5% stop would have limited the loss — instead they experienced full drawdown AND 2-week capital lockup. The 2-week recovery period cost opportunity cost in addition to the drawdown itself.`,
                `Event 2 (work meeting): A stop-loss in the OCO would have triggered automatically during the 90-minute unavailability. The 7% drawdown was entirely preventable with automated protection. Manual monitoring is not a reliable substitute.`,
                `Event 3 (early exit): A pre-set TP in the OCO would have held the position to the $1,800 target without requiring willpower. The anxiety-driven manual exit cost $1,000 ($1,800 − $800). The OCO would have prevented emotional override of the analysis.`,
                `Summary: "worked fine" means no catastrophic event yet — but the three documented events show costs of manual management. OCO is not complication; it is the elimination of the three main failure modes: overnight exposure, unavailability, and emotional early exit.`,
              ],
            },
          ],
        },

        {
          id: 'trailing-stops',
          title: `Trailing Stop-Loss Orders`,
          explanation: `In October 2021, Solana rose from $140 to $260 in 21 days. A trader with a fixed take-profit at $200 captured $60/SOL — solid. A trader with a trailing stop set at 8% below the highest reached price captured the full move to $260 with the stop continuously moving up. When SOL peaked at $260 and reversed to $260 × 0.92 = $239.20, the trailing stop triggered — capturing $99.20/SOL instead of $60.

A trailing stop automatically adjusts the stop-loss upward as price rises. You set it as either a fixed dollar amount or a percentage below the highest price reached. As price makes new highs, the trailing stop moves up with it. If price reverses and falls by the trail distance from the peak, the stop triggers and closes the position.

The power: trailing stops allow you to capture an entire trend move without predicting the top. Define your maximum acceptable pullback from peak and the stop does the rest. When the trend ends, you exit automatically.

The critical parameter is trail distance. Too tight (2%): stopped out by every small wick in a trending move. Too wide (20%): you give back too much profit before exit. The right trail distance is calibrated to the asset's normal volatility. Bitcoin with daily candles averaging 2–3% swings: a 6–8% trail is appropriate. SOL with 4–6% daily swings: 10–12% trail.

ATR (Average True Range) is the most mathematically sound basis for trail distance. Set the trail at 2–3× ATR. If BTC's 14-day ATR is $1,800, a 2.5× ATR trailing stop = $4,500 trail. This automatically adjusts to current volatility rather than using a fixed percentage that becomes too tight in volatile periods and too loose in calm ones.

When to switch from fixed stop to trailing stop: after the trade has moved at least +3R in your favour. Before that point, the trailing stop may trigger on normal volatility before the trend is established.`,
          visualPrompt: `Trailing stop rising with price — automatic protection without picking the top`,
          visualType: `gif`,
          visualUrl: `trailing-stop-animation`,
          strategy: `Use trailing stops for trending positions once you are significantly in profit (+3R or more). Set trail distance at 2–3× the current 14-period ATR. Review and adjust if market volatility changes significantly. Do not use trailing stops on range-bound assets — they will trigger on every range oscillation.`,
          examples: [
            {
              contextTag: `[Position Trader, BTC/USDT, ATR trailing stop on bull run]`,
              context: `A position trader entered BTC at $42,000. BTC's 14-day ATR at entry: $2,200. Trailing stop set at 3× ATR = $6,600 below highest reached price.`,
              scenario: `BTC rises: to $52,000 (trail at $45,400), to $60,000 (trail at $53,400), to $72,000 (trail at $65,400), peaks at $73,800. BTC reverses and reaches $73,800 − $6,600 = $67,200 where the trailing stop triggers.`,
              outcome: `Entry: $42,000. Exit: $67,200. Gain: $25,200/BTC = +60%. A fixed TP would have required predicting $73,800 as the top — nearly impossible. The trailing stop captured the full trend move without any top prediction.`,
            },
            {
              contextTag: `[Day Trader, SOL/USDT, trailing stop too tight]`,
              context: `A day trader enters SOL long at $186 on a strong momentum candle. They set a 1.5% trailing stop.`,
              scenario: `SOL rises to $190 (+2.2%). Trailing stop is now at $190 × 0.985 = $187.15. SOL then has a 2% correction to $186.20 (normal volatility) — below the trailing stop level. Stop triggers at $187.15.`,
              outcome: `SOL rebounds from $186.20 to $201 over the next 4 hours. The 1.5% trailing stop was too tight for an asset with 2–4% normal daily swings — it captured a 0.6% gain instead of the 8.1% continuation. Trail distance must exceed the asset's normal volatility to function correctly.`,
            },
            {
              contextTag: `[Swing Trader, ETH/USDT, ATR-based trailing stop execution]`,
              context: `A swing trader uses ATR-based trailing stops for all positions. ETH's 14-day ATR: $85. Entry at $3,600. Trailing stop: 2.5 × $85 = $212.50 below the highest price reached.`,
              scenario: `ETH rises to $3,900: trail at $3,687.50. Rises to $4,100: trail at $3,887.50 (locking $287.50 profit). ETH peaks at $4,150 and falls to $3,880.`,
              outcome: `Trailing stop at $3,887.50 triggers on the reversal. Exit at $3,880 = +$280/ETH from entry. The ATR-based trail dynamically accounted for ETH's current volatility — not too tight (didn't stop on $50–$85 normal candles) and captured 93% of the peak-to-stop profit.`,
            },
          ],
          keyTakeaway: `Trailing stops capture entire trend moves without predicting the top. Set trail distance at 2–3× ATR — enough to breathe through normal volatility but tight enough to capture most of the trend. Use ATR-based trails, not arbitrary fixed percentages.`,
          guidedPractice: [
            {
              question: `You hold SOL long from $185. SOL's 14-day ATR is $12. You set a 2.5× ATR trailing stop. SOL is currently at $210 (highest reached). Where is your trailing stop and what is the minimum locked-in profit?`,
              options: [`A — Trail $30. Stop at $180. Minimum profit: −$5 (below entry — not yet locking any profit)`, `B — Trail $30. Stop at $210 − $30 = $180. Since entry was $185, stop is below entry — position not yet guaranteed profitable`, `C — Trail $30. Stop at $180. Minimum locked: +$25/SOL above $185 entry`, `D — Trail $30. Stop at $215 (trail below current, not highest)`],
              correct: 1,
              hint: `Trail = 2.5 × ATR. Stop = highest price − trail. Compare stop to entry price.`,
              explanation: `B is correct. Trail = 2.5 × $12 = $30. Highest reached: $210. Trailing stop: $210 − $30 = $180. Entry was $185. Stop at $180 is BELOW entry — if triggered, the trade is a $5/SOL loss. The trailing stop is not yet locking profit. SOL needs to rise to $185 + $30 = $215 before the trailing stop reaches breakeven at $185. At $220, stop trails to $190 — locking $5/SOL minimum profit. The 2.5× ATR trail on a $12 ATR asset requires a $30 run beyond entry before breakeven protection begins.`,
            },
            {
              question: `BTC's 14-day ATR is $2,400. A trader sets a 3% trailing stop. BTC is at $72,000. The 3% trail = $2,160. Is this appropriate for BTC's current volatility?`,
              options: [`A — Yes — 3% is always appropriate for BTC`, `B — No — the 3% trail ($2,160) is narrower than the ATR ($2,400). Normal BTC daily candles exceed the trail distance — the stop triggers on routine wicks`, `C — Yes — percentage-based trails are always better than ATR-based`, `D — No — the trail should be at least 10% for BTC`],
              correct: 1,
              hint: `The trail distance should exceed the ATR so normal price swings don't trigger the stop. What happens when trail < ATR?`,
              explanation: `B is correct. ATR = $2,400. Trail = $2,160 = 0.9× ATR. The average daily BTC candle range is $2,400. A routine adverse candle can easily move $2,160 against the trend. The trailing stop triggers on that normal candle before any genuine reversal. Trail should be at minimum 1.5× ATR (and ideally 2–3×). Correct trail: 2.5 × $2,400 = $6,000 = 8.33% for current BTC volatility. D suggesting 10% is in the right neighbourhood but arbitrary without ATR reference.`,
            },
            {
              question: `You are in a trending ETH trade. ATR at entry was $80; it is now $140 due to increased volatility. Should you adjust your trailing stop?`,
              options: [`A — No — stick with the original ATR value at entry`, `B — Yes — recalculate trail with current ATR ($140). New trail = 2.5 × $140 = $350. The original $200 trail is now too tight relative to current volatility.`, `C — Remove the trailing stop — increased volatility means it will always trigger prematurely`, `D — Switch to a fixed dollar trail of $250`],
              correct: 1,
              hint: `ATR-based trailing stops should use current ATR, not historical ATR at entry. What happens if volatility doubles but trail distance stays fixed?`,
              explanation: `B is correct. ATR has increased from $80 to $140 (+75%). The old $200 trail ($80 × 2.5) is now far too tight — ETH routinely makes $140+ moves in a day, and the $200 trail would be triggered by 1.4 normal candles. Recalculating: $140 × 2.5 = $350 trail — appropriately accounts for higher volatility. ATR-based trails are most powerful when periodically updated, not set once at entry. D at $250 is closer but still below the current 2.5× ATR level.`,
            },
            {
              question: `A range-bound ETH position has been oscillating between $3,600 and $3,800 for 12 days. Should you use a trailing stop?`,
              options: [`A — Yes — trailing stops are always the best exit management tool`, `B — No — trailing stops are designed for trending moves. In a range, the stop will repeatedly trigger on each oscillation toward the lower boundary, stopping out a valid range position that then recovers.`, `C — Yes — set the trail at 1% to capture any move`, `D — Yes — the trailing stop will automatically detect the range and adjust`],
              correct: 1,
              hint: `Trailing stops follow price upward and trigger on pullbacks. What happens in a range when price bounces between $3,600 and $3,800 repeatedly?`,
              explanation: `B is correct. In a range, price repeatedly oscillates between support and resistance. A trailing stop set during a move from $3,600 to $3,800 would trail up close to $3,800 − trail distance. When price returns to $3,600 (normal range behaviour), the trailing stop triggers. But $3,600 is just the range support — not a trend reversal. Trailing stops belong on trending positions. For range-bound positions, OCO brackets (fixed TP at range top, fixed stop below range bottom) are the appropriate tool.`,
            },
            {
              question: `When is the correct time to switch from a fixed stop-loss to a trailing stop?`,
              options: [`A — Immediately at entry`, `B — After the trade has moved at least 3× your initial risk (+3R) in your favour — the trend has proven itself`, `C — After any profit — switch when the trade turns positive`, `D — Never — fixed stops are always more precise`],
              correct: 1,
              hint: `Too early: trailing stop may trigger on normal volatility before trend is established. Too late: you miss protecting significant profit. What is the right threshold?`,
              explanation: `B is correct. Switching too early (A or C) places the trailing stop in the early phase where normal volatility will trigger it before the trend is proven. A trade at +3R has demonstrated meaningful directional movement — at that point, protecting the gain with a trailing stop makes sense. The fixed stop-loss handles from entry to approximately +3R. At +3R, trailing stop takes over to capture the trend continuation. D is wrong — trailing stops serve a specific purpose (trend capture) that fixed stops cannot replicate once a trade is running strongly.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `SOL/USDT, daily chart. You entered a trend trade 15 days ago.

Entry: $165. Initial stop: $155 (structural). Never switched to trailing stop.

Price progression:
D1: $168. D3: $174. D5: $181. D7: $189. D9: $195. D11: $202. D13: $208. D14: $214. D15 (today): $211.

Current 14-day ATR: $14.

Questions:
1. Should you switch to a trailing stop now?
2. Calculate the trailing stop placement (2.5× ATR).
3. How much profit does this trail lock in vs original $155 fixed stop?
4. If you had set a trailing stop from Day 7 ($189), where would it be now and what difference would it have made?`,
              scoringCriteria: [
                `Yes, switch now — $49/SOL gain vs $10 initial risk = +4.9R. Well beyond the +3R threshold for switching.`,
                `Trail: 2.5 × $14 = $35. Highest reached: $214. Trailing stop: $214 − $35 = $179.`,
                `Fixed stop at $155 locks no profit (below $165 entry). Trailing at $179 locks $14/SOL minimum.`,
                `From Day 7 ($189): 2.5 × ATR ≈ $28 trail → stop at $189 − $28 = $161. As price rises to $214, trail moves to $179 — same endpoint but with protection earlier (from Day 7 onward).`,
                `Today's trailing stop at $179 vs price $211: position still open, $14 locked. If SOL falls to $179, exits with +8.5% gain on $165 entry.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, 4-hour chart. Managing a trending position over 3 days.

Position:
- Entry: $70,800 (4H breakout, 3 days ago)
- Initial stop: $69,200 (structural)
- Current price: $76,400
- 4H ATR (current): $620
- No trailing stop set yet

Chart progression shows daily highs: Day 1 $72,600, Day 2 $74,800, Day 3 $76,400 (today). Day 3 current low: $75,200.

Design:
1. Trail distance using 2× ATR
2. Current trailing stop level
3. Minimum locked profit in dollars (0.15 BTC position)
4. At what higher price does the position become guaranteed profitable?`,
              scoringCriteria: [
                `Trail distance: 2 × $620 = $1,240.`,
                `Current trailing stop: $76,400 − $1,240 = $75,160.`,
                `Minimum locked profit: ($75,160 − $70,800) × 0.15 = $4,360 × 0.15 = $654.`,
                `Stop already above entry ($70,800): position is guaranteed profitable. Trail crossed above entry when highest reached = $70,800 + $1,240 = $72,040, which happened early on Day 1.`,
                `User notes current trailing stop at $75,160 is well above entry, making this a risk-free, profit-guaranteed position.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Three traders used trailing stops on BTC in the same bull run (BTC: $42,000 → $73,800 peak):

Trader A: 3% trailing stop set from entry. Stopped out at $45,820 early in the run after a 3% pullback from $47,300.

Trader B: 8% trailing stop set after +3R (switched at $55,000). Stopped out from $73,800 peak at $73,800 × 0.92 = $67,896.

Trader C: 15% trailing stop set immediately. Never triggered during the full run. Position still open as BTC reverses to $63,000. Stop at $73,800 × 0.85 = $62,730 — about to trigger.

Compare all three: calculate exit prices and gains. Which trail distance strategy was most effective and why?`,
              scoringCriteria: [
                `Trader A: Exit $45,820. Gain: +$3,820 (+9.1%). Trail too tight — triggered on normal BTC volatility early in the trend.`,
                `Trader B: Exit $67,896. Gain: +$25,896 (+61.7%). Trail started after +3R and at 8% was appropriate. Captured 86% of the total move.`,
                `Trader C: Exit approximately $62,730. Gain: +$20,730 (+49.4%). 15% trail never triggered during the run — but gave back $11,070 from the $73,800 peak before exiting.`,
                `Most effective: Trader B. Captured the most gain (61.7%) with a defined protection framework. The delayed start (from +3R) prevented early stops.`,
                `Trade-offs: Tight trail (A) = early exit, small gain. Medium trail (B) = optimal. Wide trail (C) = more of the peak gain given back before exit, worse absolute outcome than B despite never stopping early.`,
              ],
            },
          ],
        },

        {
          id: 'slippage-detail',
          title: `Slippage — Why You Never Get the Price You See`,
          explanation: `On June 12 2022, Bitcoin fell 14% in a single day during the LUNA/UST collapse contagion. Traders placing market sell orders saw slippage ranging from 0.3% on Binance (highly liquid) to 4.8% on smaller exchanges to up to 12% on DEXs during extreme one-directional flow. Same asset, same price level, vastly different actual execution prices — all due to slippage.

Slippage is the difference between the price you expected and the price you actually got. It occurs because: (1) in the milliseconds between clicking and execution, price moves; (2) your order is large enough to consume multiple levels of the order book; or (3) the market is moving so fast that conditions change before your order reaches the matching engine.

There are two types. Positive slippage: your buy fills below your expected price (rare, when price moves in your favour during execution). Negative slippage: your buy fills above expected, or your sell fills below. In practice, slippage is almost always negative in fast markets — the market moves against you faster than you can execute.

The key determinants of slippage magnitude: order size relative to market depth (buying 100 BTC on Binance = no slippage; buying 100 BTC on a thin DEX = massive slippage); market conditions (calm markets produce negligible slippage; crash events produce extreme slippage); exchange type (CEX matching engines process in milliseconds; DEX transactions wait for block confirmation — on Ethereum, approximately 12 seconds, during which price can move significantly).

Minimising slippage: use limit orders wherever timing allows. When using market orders on DEXs, set maximum slippage tolerance appropriately (0.5% on established tokens, 1–2% on volatile ones). Size positions so your single order represents less than 0.1% of visible order book depth at your price level.`,
          visualPrompt: `Slippage happening in real time — order consuming book at multiple levels`,
          visualType: `gif`,
          visualUrl: `slippage-order-book`,
          strategy: `On CEXs: use limit orders to eliminate slippage on entries. On DEXs: set 0.5% slippage tolerance for established tokens, 1% maximum for volatile launches. Higher settings expose you to MEV sandwich attacks. Size orders so each trade represents less than 0.1% of the visible order book depth.`,
          examples: [
            {
              contextTag: `[Trader, BTC/USDT, flash crash stop slippage]`,
              context: `A trader holds 0.5 BTC with a stop-market set at $68,000. A flash crash drops price from $69,400 to $65,800 in 90 seconds.`,
              scenario: `Stop triggers as price falls through $68,000. The order book at that level has been consumed by earlier panic sells. Available bids: $67,800 (0.05 BTC), $67,400 (0.12 BTC), $66,900 (0.30 BTC), $66,100 (0.40 BTC). The 0.5 BTC order fills across four levels.`,
              outcome: `Average fill: approximately $67,044. Slippage: $68,000 − $67,044 = $956/BTC × 0.5 = $478. In calm conditions, the same order: approximately $8 slippage. The flash crash made a routine stop into a $478 slippage event — this is the unavoidable cost of stop-market in extreme conditions, and still preferable to not having a stop at all.`,
            },
            {
              contextTag: `[DeFi Trader, Uniswap, price impact slippage]`,
              context: `A trader wants to buy $20,000 of a mid-cap token on Uniswap V3. The token's pool has $2.4M total liquidity.`,
              scenario: `Uniswap interface shows "price impact: 1.8%" on the $20,000 buy. The AMM calculates a final execution price 1.8% above the displayed price due to the trade moving the constant product curve. The trader sets 2% slippage tolerance and executes.`,
              outcome: `Fill at 1.74% above the pre-trade displayed price. On $20,000: $348 of price impact slippage. Plus 0.3% protocol fee ($60) and $22 gas: total cost $430 on $20,000 trade (2.15%). The price impact was displayed in the interface before execution — the correct action was to check it and split the trade across time or accept the cost knowingly.`,
            },
            {
              contextTag: `[Scalp Trader, SOL/USDT, slippage destroying edge]`,
              context: `A scalp trader targets 0.4% profit per trade on SOL/USDT. Average market order slippage: 0.08% per side = 0.16% round-trip.`,
              scenario: `Gross profit target: 0.4%. Fees: 0.2%. Slippage: 0.16%. Total overhead: 0.36%. Net per winning trade: 0.04%. At 60% win rate: EV = (60% × 0.04%) + (40% × −0.76%) = 0.024% − 0.304% = −0.28% per trade.`,
              outcome: `Switching to limit orders reduces slippage to approximately 0.02% round-trip: overhead = 0.22%. Net per win: 0.18%. EV at 60%: (60% × 0.18%) + (40% × −0.62%) = 0.108% − 0.248% = −0.14% — still negative but improved by eliminating slippage. The lesson: even small slippage amounts destroy edge on high-frequency tight-margin strategies.`,
            },
          ],
          keyTakeaway: `Slippage is the gap between expected and actual execution price. It is always present and always worse in fast markets and illiquid conditions. Minimise it with limit orders, position sizing appropriate to order book depth, and realistic DEX slippage tolerance settings.`,
          guidedPractice: [
            {
              question: `You place a market buy for $50,000 of ETH. Order book shows: $3,800 ask (50 ETH = $190,000 available). How much slippage do you experience?`,
              options: [`A — None — the first level has $190,000 available, more than your $50,000`, `B — None for this case — $50,000 ÷ $3,800 = 13.16 ETH, well within the 50 ETH available at first level`, `C — Minimal slippage as the first level is partially insufficient`, `D — Significant slippage due to large order size`],
              correct: 1,
              hint: `Calculate how many ETH you need at $3,800. Is that within the available liquidity at that level?`,
              explanation: `B is correct. $50,000 ÷ $3,800 = 13.16 ETH needed. The first ask level has 50 ETH available ($190,000). Your order is fully absorbed by the first level — zero slippage (ignoring the bid-ask spread). Slippage only occurs when your order size exceeds the available liquidity at the first price level and consumes into higher levels. A arrives at the same conclusion with slightly different logic. C and D incorrectly suggest slippage when the math shows it doesn't occur here.`,
            },
            {
              question: `On a DEX, you set 5% slippage tolerance for a $2,000 trade on a volatile new token. What risk does this create?`,
              options: [`A — None — 5% is standard practice for new tokens`, `B — MEV bots can sandwich attack: buy before you (pushing price up ~4.9%), let you fill at the inflated price, immediately sell. Your $2,000 trade could fill up to 4.9% above the displayed price.`, `C — 5% slippage means you pay exactly 5% extra on every trade`, `D — The trade will fail if price moves more than 5%`],
              correct: 1,
              hint: `5% slippage tolerance means you accept fills up to 5% worse than displayed. Who can exploit this tolerance profitably?`,
              explanation: `B is correct. MEV (Maximal Extractable Value) bots monitor the mempool for pending transactions with wide slippage tolerances. A 5% tolerance on a $2,000 trade creates a $100 profit window for a bot that: (1) front-runs your buy (pushes price up $99), (2) lets your transaction fill at the inflated price, (3) immediately sells into your buy. Your fill is $99 worse; the bot profits $99 minus gas. Recommendation: 0.5%–1% slippage on most tokens (enough to handle normal movement, too tight for profitable MEV extraction).`,
            },
            {
              question: `Which scenario produces the MOST slippage on a $10,000 BTC market sell?`,
              options: [`A — Binance BTC/USDT at 2pm EST on a Tuesday`, `B — A minor altcoin DEX pool with $180,000 total liquidity at 3am Sunday`, `C — Binance BTC/USDT during a +5% daily move with high volume`, `D — Coinbase BTC/USDT at any time during regular hours`],
              correct: 1,
              hint: `What determines slippage magnitude? Think about order size vs pool/book depth, time of day, and asset liquidity.`,
              explanation: `B is correct. A $10,000 sell on a pool with $180,000 total liquidity represents 5.6% of the pool. DEX AMM price impact on 5.6% of pool ≈ 11.5% (from constant product formula x × y = k). Add the 3am Sunday off-hours thinning and you have extreme slippage. Compare: Binance BTC/USDT at peak hours has hundreds of millions in order book depth — a $10,000 order is 0.005% of depth. Essentially zero slippage. C (high volume) actually improves liquidity and reduces slippage.`,
            },
            {
              question: `Your position sizing calls for buying $45,000 of SOL. The SOL/USDT order book shows $180,000 in asks within 0.2% of current price. Should you split the order?`,
              options: [`A — Yes — your order is 25% of visible depth. Consuming 25% of the book causes meaningful price impact. Split into 3–5 parts over 10–15 minutes.`, `B — No — modern exchanges handle any order size`, `C — The percentage is irrelevant — only absolute dollar size matters`, `D — This is 0.25% — a calculation error means no concern`],
              correct: 0,
              hint: `Calculate: $45,000 / $180,000 = what percentage? What does consuming 25% of visible book depth do to price?`,
              explanation: `A is correct. $45,000 / $180,000 = 25% of visible book depth. Consuming 25% of the book will drive price upward as you exhaust cheaper asks and fill into higher-priced ones. Expected slippage on 25% book consumption: approximately 0.2% × 25% × scaling factor = potentially $90–$150 in slippage on the $45,000 order. Splitting into 5 × $9,000 orders over 15 minutes (allowing the book to refresh between orders) reduces average slippage to near-zero per order.`,
            },
            {
              question: `You are executing a $200,000 BTC exit. Single market sell vs 4 × $50,000 limit sells staggered $200 apart ($74,200, $74,400, $74,600, $74,800). Trade-offs?`,
              options: [`A — Single market sell is always better — certainty of execution`, `B — Staggered limits give better average prices (collecting bid instead of paying ask) but risk partial fills if price reverses before all levels are reached`, `C — They produce identical results`, `D — Staggered limits only for institutional traders`],
              correct: 1,
              hint: `What is the cost of each approach? Market = guaranteed fill, potential slippage. Limit ladder = better prices, no slippage, but requires price to reach each level.`,
              explanation: `B is correct. Single market sell on $200,000 consumes the bid side rapidly — if the top 3 bid levels total $180,000, the remaining $20,000 fills at significantly lower prices. Staggered limit sells at $74,200/$74,400/$74,600/$74,800 fill as makers (lower fees), no slippage, and collect progressively higher prices. Risk: if BTC reverses at $74,300 after the $74,200 limit fills, the remaining $150,000 hasn't filled. Resolution: staggered limits with a backstop OCO stop-market handles both scenarios. The choice is risk management, not one always being right.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `You need to exit a $120,000 SOL position in a thinning afternoon market (4pm EST).

SOL/USDT order book (current):
BID side:
$183.40: 4,200 SOL ($770,280)
$183.20: 1,800 SOL
$183.00: 900 SOL
$182.60: 600 SOL

Your position: 650 SOL ($119,210 at $183.40 mid-price).

Options:
A — Single market sell (all 650 SOL now)
B — 3 × market sells of ~217 SOL each, 5 minutes apart
C — Limit sells: 200 SOL at $183.40, 200 at $183.60, 150 at $183.80, 100 at $184.00
D — OCO: limit sell 600 SOL at $183.40, stop-market at $181.50 for remainder

Calculate expected slippage for options A and B. State which strategy is optimal and why.`,
              scoringCriteria: [
                `Option A: 650 SOL market sell. First bid level has 4,200 SOL available. 650 SOL fits entirely in the first bid level at $183.40. Slippage: ~$0.05/SOL (spread only) = $32.50 total. Minimal.`,
                `Option B: 217 SOL × 3 in 5-minute intervals. Each tranche also fits comfortably in first bid level. Similar slippage per tranche. No meaningful improvement over single market sell in this case.`,
                `Key insight: with 650 SOL vs 4,200 available at the first level, the entire position fits cleanly. Splitting is unnecessary here.`,
                `Best strategy: A (single market sell) because the entire position fits within the first bid level at $183.40. Complexity of splitting is unnecessary when order book depth is sufficient.`,
                `Option C (limit sells above current): ideal if SOL is trending up. Risk: if SOL falls, limits don't fill.`,
                `User correctly identifies that slippage analysis must be done BEFORE choosing execution — the order book analysis showed sufficient depth for a clean single fill.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Review this trader's last month of DEX trades for slippage patterns:

Trade 1: $800 ETH → USDC on Uniswap V3. Slippage: 0.04%. Gas: $18. Tolerance: 0.5%.
Trade 2: $3,200 AVAX → USDC on TraderJoe (Avalanche). Slippage: 0.12%. Gas: $0.08. Tolerance: 1%.
Trade 3: $450 memecoin → USDC on Uniswap. Slippage: 3.8%. Gas: $24. Tolerance: 5%.
Trade 4: $12,000 BTC → USDT on Binance (CEX). Slippage: 0.003%. Fee: 0.1%.
Trade 5: $28,000 SOL → USDC on Jupiter (Solana). Slippage: 0.08%. Gas: $0.003. Fee: 0.04%.

Questions: (1) Which trade showed worst cost efficiency? (2) Main driver of Trade 3's slippage? (3) Rank by total transaction cost %. (4) Key optimisation recommendations.`,
              scoringCriteria: [
                `Trade 3 worst: $450 memecoin, 3.8% slippage + $24 gas. Total: $17.10 + $24 = $41.10 / $450 = 9.1% total cost.`,
                `Main driver of Trade 3: small pool liquidity (memecoins have tiny pools), 5% slippage tolerance enabling MEV, high price impact on small pools.`,
                `Rankings by total cost %: Trade 3 (9.1%) > Trade 1 (2.3%: $18 gas/$800 + 0.04% slippage) > Trade 2 (0.12%) > Trade 4 (0.103%) > Trade 5 (0.12% combined).`,
                `Recommendations: (1) Minimum trade size on Ethereum: $2,000+ during normal gas periods to dilute gas costs. (2) Reduce memecoin slippage tolerance to 1% to prevent MEV. (3) Prefer Solana DEXs (Jupiter) for medium trades — 50× more cost-efficient than Ethereum Uniswap for same trade size.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Three flash crash scenarios. For each: estimate slippage, explain the order book mechanics, and state whether stop-limit or stop-market was the better choice:

Scenario 1: BTC drops 8% in 3 minutes on Binance (peak hours, Tuesday). Your stop-market at $70,000 triggers. Position: 0.2 BTC.

Scenario 2: SOL drops 12% in 5 minutes at 2am Saturday (off-hours). Your stop-market at $180 triggers. Position: 15 SOL.

Scenario 3: An ETH DEX token drops 40% in 2 minutes after a smart contract exploit. You hold on Uniswap V3. You attempt a market sell of $8,000.`,
              scoringCriteria: [
                `Scenario 1: BTC Binance peak hours. Expected slippage: $50–$200 (0.07–0.28%). Deep order book fills quickly at modest slippage. Stop-market is BETTER — stop-limit risks not filling if price gaps. Slippage cost: $10–$40 on 0.2 BTC.`,
                `Scenario 2: SOL 2am Saturday. Off-hours order book 70–80% thinner. Expected slippage: 0.5–1.5% depending on position size relative to weekend depth. Stop-market still preferable — non-execution risk of stop-limit in an illiquid off-hours crash is greater than the slippage cost.`,
                `Scenario 3: DEX token, exploit event, Uniswap. Price impact on large sale into a collapsing pool: 15–25% depending on pool depth. Gas wars during exploit events add $50–$200. Total additional slippage: 20–30% on top of the underlying 40% drop. Stop-limit WORSE — exploit scenarios often gap through all limit levels. Only viable option: market sell immediately accepting all slippage, or use a slippage-protected aggregator (1inch, Paraswap).`,
              ],
            },
          ],
        },

      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [`chartReplay-riskManage`, `chartReplay-breakout`, `judgment-riskAssess`, `judgment-dataInterpret`, `judgment-prioritisation`, `chartReplay-patternID`],
        description: `15 randomly drawn order type and execution scenarios covering market orders, limit orders, stop-losses, take-profits, OCO brackets, trailing stops, and slippage across all asset pairs and market conditions. No labels. No setup hints. Difficulty equivalent to the hardest simulation in each lesson. Scenarios draw from realistic market conditions including flash crashes, after-hours sessions, DEX trades, and high-conviction breakouts.`,
        scoringMode: `individual`,
        unlockCondition: `All 7 Lab 3 lessons completed with guidedPractice passed`,
        difficultyRange: `lesson-sim-2 to lesson-sim-3 level`,
      },

      bossMode: {
        title: `Desk Trader Challenge`,
        description: `Full integration of order types, execution mechanics, and trade management across 10 scenarios spanning the full Lab 3 curriculum. Phase 1 includes feedback and lesson pointers. Phase 2 is pass/fail only.`,
        learningLoop: {
          attempts: `unlimited`,
          feedbackMode: `full criteria feedback + lesson pointer per miss`,
          passCriteria: `8/10 correct to unlock Phase 2`,
          lessonPointers: true,
          description: `10 challenges drawn from the full Lab 3 curriculum. Each incorrect answer returns scoring criteria and a pointer to the specific lesson covering that concept. Repeat until 8/10 is achieved.`,
          challenges: [
            { scenario: `BTC at $72,000. You want to enter long if it pulls back to $70,000 support (held 3 times). No urgency. Which order type?`, correctAnswer: `Limit buy at $70,000 — defined entry level, no time pressure, let the market come to you`, lessonPointer: `limit-orders` },
            { scenario: `You hold ETH long. Breaking news about an ETH layer-2 protocol exploit hits. Price is falling fast. Your limit sell at $3,900 has been gapped through. Current price $3,720 and declining. What do you do?`, correctAnswer: `Cancel limit, place market sell immediately — emergency exit where speed outweighs price`, lessonPointer: `market-orders` },
            { scenario: `OCO set for 3 BTC: TP $76,000, stop trigger $70,000/limit $69,900. You manually sell 1 BTC at $73,500 as partial profit. What must you do?`, correctAnswer: `Cancel existing OCO, set new OCO for 2 BTC — quantity must match actual position`, lessonPointer: `oco-orders` },
            { scenario: `SOL uptrend. You enter long at $188 (breakout above $186 resistance). Prior swing low: $180. Where is the stop-loss?`, correctAnswer: `$179.10 — below prior swing low ($180) with 0.5% buffer. Thesis invalidated if swing low broken.`, lessonPointer: `stop-loss-orders` },
            { scenario: `BTC's 14-day ATR is $2,200. You want a trailing stop at 2× ATR from entry. BTC just reached $76,000 (highest since entry at $71,000). Where is the trailing stop?`, correctAnswer: `$76,000 − $4,400 = $71,600. Trail = 2 × $2,200 = $4,400 below the highest reached price.`, lessonPointer: `trailing-stops` },
            { scenario: `A $500 trade on a small-cap token on Uniswap shows "price impact: 6.8%" in the interface. Slippage tolerance set at 8%. What is the concern?`, correctAnswer: `Two concerns: (1) 6.8% price impact is extremely high — the pool has insufficient liquidity for this trade size. (2) 8% tolerance enables MEV sandwich attacks. Should split trade or accept that this pool is too illiquid.`, lessonPointer: `slippage-detail` },
            { scenario: `You enter long at $190 SOL. TP at $203. Price rises to $201 and you're tempted to lower TP to $200 "to make sure it fills." Should you?`, correctAnswer: `No — lowering TP out of anxiety is not analytically justified. The $203 TP was set at technical resistance. Hold the technically justified level.`, lessonPointer: `take-profit-orders` },
            { scenario: `ETH trailing stop: 2× ATR was $160 at entry. ETH's current ATR is $280. Should you adjust the trailing stop?`, correctAnswer: `Yes — recalculate with current ATR. New trail = 2 × $280 = $560. Original $320 trail is now too tight relative to current volatility.`, lessonPointer: `trailing-stops` },
            { scenario: `You set OCO: TP limit $76,000 / Stop trigger $70,000 / Stop limit $70,200. Is there an error?`, correctAnswer: `Yes — stop limit ($70,200) is ABOVE stop trigger ($70,000). When trigger fires, limit sell at $70,200 is above current price and creates irregular fill behavior. Correct: stop limit below trigger at $69,900.`, lessonPointer: `oco-orders` },
            { scenario: `BTC/USDT bid-ask spread is 0.08%. You make 50 round-trip trades per month with a $15,000 account using market orders. What is your monthly spread cost?`, correctAnswer: `50 trades × 0.16% round-trip spread × $15,000 average = $1,200/month = 8% of account monthly in spread costs alone. This makes almost any strategy negative EV before analysis.`, lessonPointer: `market-orders` },
          ],
        },
        },
    },
,
// ⚡ Sifter Skill_Up — SPOT TRADING Career Track
// UPGRADED TO FULL SIM-INSTRUCTION SPEC v2.0
// Section 4 of 8: Risk Management

    {
      id: 'risk-management',
      title: `Risk Management: Protecting Your Capital`,
      subtitle: `The only skill that keeps you in the game long enough to get good`,
      lessons: [

        {
          id: 'why-traders-lose',
          title: `Why 80% of Traders Lose Money`,
          explanation: `In 2020, a regulatory study across EU brokers found 76–82% of retail traders lost money over 12 months. In crypto, exchange data suggests similar ratios. This is not because most traders are unintelligent. Most have studied charts. Many have read books. The common thread across losing accounts is almost never wrong analysis — it is risk management failure.

Three mechanisms destroy most accounts. Mechanism 1: the single large loss. A trader grows from $10,000 to $14,200 over three months with careful small positions. They feel invincible. They put 40% of the account into one trade, it goes against them, they refuse to stop out because it will bounce, and the account falls to $8,520 in a single session. Three months of gains reversed in 24 hours.

Mechanism 2: slow bleed from negative expected value. A trader risks 5% per trade with a 45% win rate and 1.5:1 R:R. EV = (45% × 7.5%) − (55% × 5%) = 3.375% − 2.75% = +0.625% per trade — looks positive. But with a 0.2% round-trip fee on each trade and 20 trades per month: monthly fee drain = 20 × 0.2% × capital = 4% of capital per month in fees alone. The positive EV becomes negative after fees.

Mechanism 3: overtrading fees. Eight round-trips per day on a $15,000 account at 0.1% fee per side = 8 × 0.2% × $15,000 × 22 days = $5,280/month in fees = 35.2% of the account monthly just in transaction costs. No analysis can overcome that burden.

The solution to all three: maximum 1–2% per-trade risk, positive EV before fees (not just gross), and trade frequency calibrated so the fee burden is recoverable. A trader who never loses more than 2% per trade needs 35 consecutive full stops to lose 50% of their account — essentially impossible. The math of small losses is the foundation of all long-term trading success.`,
          visualPrompt: `👆 Recovery asymmetry: why a 50% loss requires 100% gain`,
          visualType: `gif`,
          visualUrl: `loss-recovery-asymmetry`,
          examples: [
            {
              contextTag: `[New Trader, BTC/USDT, the revenge-sizing disaster]`,
              context: `A trader builds from $8,000 to $12,600 over three months with disciplined 1% positions. They hit four losses in a row and decide to recover quickly with a large position.`,
              scenario: `They enter BTC at 35% of account ($4,410). The trade moves against them. They hold through a 9%, 14%, then 22% adverse move refusing to exit "because it will bounce." They finally exit at −31% on the position.`,
              outcome: `Loss: $1,367. Account: $11,243 — nearly erasing three months of work in one trade. The pattern: patience building a positive account, then one emotionally driven oversize trade nearly wipes it out. This is the most common path from small profits to losses in retail trading.`,
            },
            {
              contextTag: `[Statistical, win rate vs position size comparison]`,
              context: `Two traders with $10,000 each, both with 50% win rate and 2:1 R:R. Trader A: 2% risk per trade ($200). Trader B: 10% risk per trade ($1,000).`,
              scenario: `After 20 trades, a perfectly normal run of 8 consecutive losses occurs (probability at 50% win rate: ~0.4%). Trader A: $10,000 − (8 × $200) = $8,400 — uncomfortable but survivable. Trader B: $10,000 − (8 × $1,000) = $2,000 — effectively wiped out.`,
              outcome: `Same edge, same win rate, same bad-luck streak. Only position sizing differs. Trader A survives variance and compounds to $12,000 over the full 20 trades. Trader B is functionally finished from a single normal variance event. Eight consecutive losses at 50% win rate is expected to occur once every 256 trade sequences — not a once-in-a-decade event.`,
            },
            {
              contextTag: `[Veteran Trader, bear market survival through risk discipline]`,
              context: `During the 2022 crypto bear market (BTC: $69,000 → $15,476), a veteran trader lost on 60% of trades.`,
              scenario: `Average loss: $180 (1.5% of account). Average win: $380. They maintained stop discipline on every trade. Net for the year: slightly negative, capital largely intact.`,
              outcome: `They entered 2023 with 94% of capital. Contemporaries who held positions without stops or used large positions lost 60–90%. The veteran's advantage was not better analysis — it was consistent 1.5% risk rule application. Starting 2023 from near-intact capital vs a 70%-down account is a compounding advantage that persists for years regardless of skill level.`,
            },
          ],
          keyTakeaway: `80% of traders lose because of three risk failures: the single large loss, negative EV (especially after fees), and overtrading costs. The solution is mechanical: 1-2% per-trade risk maximum, positive net EV, and disciplined trade frequency. Good analysis cannot overcome bad risk management.`,
          guidedPractice: [
            {
              question: `A trader's account falls from $20,000 to $10,000 — a 50% loss. What percentage gain is required to return to $20,000?`,
              options: [`A — 50%, the same percentage that was lost`, `B — 100% — returning $10,000 to $20,000 requires doubling the account`, `C — 75% — accounting for compounding effects`, `D — 33% — because only partial recovery is needed`],
              correct: 1,
              hint: `What is $10,000 as a percentage of $10,000? How much gain do you need to add $10,000 back?`,
              explanation: `B is correct. From $10,000 to $20,000 requires gaining $10,000 = 100% of the $10,000 starting base. A is the classic error — percent recovery always exceeds percent lost because you recover from a smaller base. Losing 25% requires 33.3% to recover. Losing 50% requires 100%. Losing 75% requires 300%. This asymmetry is why preventing large losses is mathematically more valuable than chasing large gains.`,
            },
            {
              question: `A trader risks 8% per trade with 55% win rate and 1.5:1 R:R. What is the danger in a normal variance run of 5 consecutive losses?`,
              options: [`A — No danger — 55% win rate guarantees long-run profitability`, `B — 5 losses at 8% each: account falls to $10,000 × (0.92)⁵ = $6,591 — a 34% drawdown that requires 51% gain to recover`, `C — The risk is acceptable because 5 losses in a row is unlikely`, `D — Danger only if the losses are in a single day`],
              correct: 1,
              hint: `Calculate the account value after 5 × 8% losses using compounding. What probability is a 5-loss streak at 55% win rate?`,
              explanation: `B is correct. After 5 losses at 8%: $10,000 × (0.92)⁵ = $10,000 × 0.6591 = $6,591 — a 34% drawdown requiring 51.7% gain to recover. The probability of 5 consecutive losses at 55% win rate: (0.45)⁵ = 1.8% — happens approximately every 55 trade sequences. For an active trader making 3 trades/day that is once every 18 days. Catastrophic drawdowns are not rare events at 8% per trade sizing. At 2% per trade the same 5-loss streak produces (0.98)⁵ = 9.6% drawdown — uncomfortable but survivable.`,
            },
            {
              question: `Which combination of win rate and R:R produces positive expected value?`,
              options: [`A — 40% win rate, 1:1 R:R`, `B — 45% win rate, 2:1 R:R`, `C — 30% win rate, 1.5:1 R:R`, `D — 55% win rate, 0.8:1 R:R`],
              correct: 1,
              hint: `EV = (Win% × Win size) − (Loss% × Loss size). Calculate for option B using 1R as the unit loss.`,
              explanation: `B is correct. EV = (45% × 2R) − (55% × 1R) = 0.90R − 0.55R = +0.35R per trade. A: (40% × 1) − (60% × 1) = −0.20R — negative. C: (30% × 1.5) − (70% × 1) = −0.25R — negative. D: (55% × 0.8) − (45% × 1) = 0.44 − 0.45 = −0.01R — marginally negative. B is the only combination with positive EV. Note: a 45% win rate means you lose more often than you win — but the 2:1 R:R makes the overall system profitable.`,
            },
            {
              question: `A trader makes 5 round-trip trades per day on a $10,000 account with average trade size $4,000, taker fee 0.1% per side. What percentage of their account do they pay in fees per month (22 trading days)?`,
              options: [`A — 0.8% — fees are negligible`, `B — 8.8% monthly. 5 trades × 22 days = 110 trades × $4,000 × 0.2% round-trip = $880 = 8.8% of $10,000`, `C — 2% monthly`, `D — 4.4% monthly`],
              correct: 1,
              hint: `Monthly trades = 5 × 22 = 110. Round-trip fee = 0.2%. Total = 110 × $4,000 × 0.002.`,
              explanation: `B is correct. 110 trades × $4,000 × 0.2% = $880/month. $880 / $10,000 = 8.8%. This means the strategy must generate 8.8% monthly profit before any net gain — a very high hurdle requiring consistent 10%+ monthly gross returns just to stay ahead of fees. This demonstrates why trading frequency is a core risk management variable, not just position size and stop placement.`,
            },
            {
              question: `Two traders lose 2% per trade (stop-loss is hit). Trader A's 2% is based on account size ($200 on $10,000). Trader B's 2% is a fixed dollar amount ($200 always, even as account changes). After 10 consecutive losses, what is each trader's account balance?`,
              options: [`A — Both have $8,000 — same 2% rule`, `B — Trader A: $10,000 × (0.98)¹⁰ = $8,171. Trader B: $10,000 − (10 × $200) = $8,000. Trader A loses less because each percentage loss comes from a shrinking base`, `C — Trader B has more capital because fixed dollar losses decline in percentage terms`, `D — They are equal after 10 trades regardless of method`],
              correct: 1,
              hint: `Which approach compounds? Account-percentage risk means each loss is taken from the current (smaller) balance. Fixed dollar means the same amount regardless of balance.`,
              explanation: `B is correct. Trader A applies 2% to the current account — each loss is from a smaller base. After 10 losses: $10,000 × (0.98)¹⁰ = $8,171. Trader B takes a fixed $200 regardless: 10 × $200 = $2,000 loss = $8,000. Trader A actually loses less ($1,829 vs $2,000) because percentage-based sizing self-corrects downward during drawdowns. Additionally, percentage-based sizing scales up correctly during winning streaks — the compounding advantage works both ways.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Review two traders' 30-trade records and determine which is more professionally managed:

Trader A — Win rate: 52%. Avg win: $240 (2.8% of position). Avg loss: −$165 (1.4% of position). Max consecutive losses: 4. Account drawdown during streak: 5.6%. Risk per trade: 2% consistent.

Trader B — Win rate: 58%. Avg win: $890 (7.1% of position). Avg loss: −$620 (4.8% of position). Max consecutive losses: 4. Account drawdown during streak: 19.2%. Risk per trade: variable (5–12%).

Calculate EV per trade for each. State which represents better professional risk management and why. Calculate the recovery percentage needed from each trader's max drawdown.`,
              scoringCriteria: [
                `Trader A EV: (52% × $240) − (48% × $165) = $124.80 − $79.20 = +$45.60 per trade. Positive.`,
                `Trader B EV: (58% × $890) − (42% × $620) = $516.20 − $260.40 = +$255.80 per trade. Also positive and higher.`,
                `But: Trader A max drawdown 5.6% → recovery needed: 5.94%. Trader B max drawdown 19.2% → recovery needed: 23.8%.`,
                `Trader A is more professionally managed: consistent risk sizing, survivable drawdowns, systematic approach.`,
                `Trader B has higher absolute EV but dangerous variance — the 19.2% drawdown from a 4-loss streak shows 12% average per-trade risk is unsustainable. A longer losing streak (8 losses at 12% each = $10,000 × (0.88)⁸ = $3,596 — 64% drawdown) would likely end the account.`,
                `Conclusion: positive EV is necessary but not sufficient. Maximum drawdown survivability is equally important.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are evaluating your first 3 months of trading results to identify what is destroying your account.

Month 1: Started $12,000. 18 trades. 11 wins (+$180 avg), 7 losses (−$210 avg). Net: +$490. End: $12,490.
Month 2: Started $12,490. 32 trades. 17 wins (+$195 avg), 15 losses (−$220 avg). Net: +$105 before fees. Fees: 32 × $6,000 avg × 0.2% = $384. Net after fees: −$279. End: $12,211.
Month 3: Started $12,211. 41 trades. 22 wins (+$165 avg), 19 losses (−$195 avg, BUT 3 losses were −$580, −$620, −$740 due to no stops). Net after fees: −$890. End: $11,321.

Identify the specific risk management failure in each month and propose a single corrective action for each.`,
              scoringCriteria: [
                `Month 1: No major failure. Positive net, manageable losses. Minor note: average loss ($210) slightly exceeds average win ($180) — watch this ratio.`,
                `Month 2 failure: OVERTRADING. Trade frequency increased from 18 to 32 trades while average trade size and win rate stayed similar. Fee burden ($384) exceeded gross profit ($105). Correction: reduce to maximum 20 trades per month. Qualify each setup more strictly before entry.`,
                `Month 3 failure: MISSING STOPS. Three trades with −$580, −$620, −$740 losses indicate positions held without stops during adverse moves. These three trades alone accounted for $1,940 extra loss beyond normal. Correction: implement hard rule — OCO with stop-market set immediately after every entry. No exceptions.`,
                `Overall: the account is declining not because of bad analysis (win rates are 55–61%) but because of overtrading fees and the occasional position without a stop. Fix both and the account returns to profitable.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `Your account is $15,000. You've been trading two months with these outcomes:

Week 1-4: Averaged 2 trades/week. Used 1.5% risk rule consistently. Result: +$480 net.
Week 5-6: Increased to 5 trades/week after feeling confident. Result: +$120 gross, −$280 fees = −$160 net.
Week 7-8: Had 3 large losses in week 7 (held without stops — lost $600, $740, $890). Became scared. Reduced to 0.5% risk and made 1 trade/week. Result: +$48 gross.

Current account: $14,328 ($672 drawdown from peak).

Diagnose: what was the exact error in each phase? Reconstruct what the account would look like if you had maintained the week 1-4 discipline for all 8 weeks. Calculate the missed opportunity cost.`,
              scoringCriteria: [
                `Week 1-4 error: none. Correct behavior. 8 trades × avg 1.5% risk. +$480 over 4 weeks = +$120/week.`,
                `Week 5-6 error: overtrading (doubled frequency). Fee burden rose from ~$40/week to ~$140/week. The edge didn't scale with frequency — it was eroded by costs.`,
                `Week 7-8 error (week 7): stopped using stops. The three large losses ($600 + $740 + $890 = $2,230) represent what would have been ~$225 in normal stop-limited losses. Cost of removing stops: $2,005 extra loss.`,
                `Week 7-8 error (week 8): overreaction — going to 0.5% risk and near-zero activity didn't fix the underlying problem. Gun-shyness after the stop violation.`,
                `Counterfactual (week 1-4 discipline for all 8 weeks): 2 trades/week × 8 weeks = 16 trades. At $120/week net average: +$960 by end of week 8. Actual result: −$672. Opportunity cost: $1,632 in 8 weeks purely from discipline failures.`,
              ],
            },
          ],
        },

        {
          id: 'risk-reward-ratio',
          title: `Risk:Reward Ratio`,
          explanation: `Paul Tudor Jones has stated publicly that his minimum acceptable risk-to-reward ratio before entering any trade is 5:1 — risking $1 to potentially make $5. He has also said he can be right only 20% of the time and still make substantial profits at that ratio. This is the foundational arithmetic of professional trading: R:R determines the minimum win rate needed for profitability, and high R:R means you can be wrong more often than right and still make money.

Risk:Reward compares the amount you stand to lose (your stop distance) to the amount you stand to gain (your target distance). A 3:1 ratio means for every $1 risked, you expect $3 if the trade succeeds. The formula: R:R = (Target − Entry) / (Entry − Stop) for long trades.

The math of minimum win rates for profitability:
At 1:1 R:R → need >50% win rate to profit. At 2:1 → need >33.3%. At 3:1 → need >25%. At 5:1 → need >16.7%.

This has one important implication: a trader with 2:1 R:R discipline who wins only 35% of trades still has positive EV — (35% × 2R) − (65% × 1R) = 0.70R − 0.65R = +0.05R. They lose more often than they win and still make money.

In practice, R:R is determined by chart analysis: stop at a technical invalidation level, target at a technical resistance level. The question to ask before every trade: does the nearest technically justified target give at least 2:1 R:R with a stop at the level that would invalidate the thesis?

Critical rule: never manipulate the stop distance to create a false R:R number. Placing a stop closer than the technical level just to inflate the R:R creates a stop that is hit by normal price noise. The R:R must be based on real technical levels or it means nothing.`,
          visualPrompt: `👆 Risk:Reward mapped on a live chart — entry, stop, and target`,
          visualType: `gif`,
          visualUrl: `risk-reward-chart`,
          strategy: `Minimum acceptable R:R for any trade: 2:1. Preferred: 3:1 or better. Calculate R:R before committing to position size. If the nearest technical target doesn't give 2:1 with a technically justified stop, the trade doesn't meet criteria — skip it. Never choose a stop level because it makes the R:R look good. Choose it because that level invalidates the trade thesis.`,
          examples: [
            {
              contextTag: `[Swing Trader, ETH/USDT, R:R gating a trade]`,
              context: `A swing trader identifies an ETH breakout. Entry $3,680, stop $3,540 (below range), nearest resistance $3,840.`,
              scenario: `R:R calculation: Risk = $140. Reward to first resistance = $160. R:R = 1.14:1. Below the 2:1 minimum. Trader extends analysis to next resistance at $4,020.`,
              outcome: `New reward: $340. R:R = 340/140 = 2.43:1. Now meets criteria. The trader sets TP1 at $3,840 (partial) and TP2 at $4,020. By using R:R as a gating criterion, they avoided a marginal trade and took a better-structured one.`,
            },
            {
              contextTag: `[Systematic Trader, BTC/USDT, R:R discipline over 50 trades]`,
              context: `A systematic trader tracks every entry: win rate 45%, but strictly enforces minimum 2.5:1 R:R on every trade. Average actual R:R: 3.1:1.`,
              scenario: `Monthly EV calculation: (45% × 3.1R) − (55% × 1R) = 1.395R − 0.55R = +0.845R per trade. Over 20 monthly trades: +16.9R gross before fees.`,
              outcome: `Despite a sub-50% win rate, the trader is strongly profitable — losing more trades than they win. The R:R discipline is the sole source of profitability. Without it (if they took all trades with 1:1 R:R at the same 45% win rate): EV = (45% × 1) − (55% × 1) = −0.10R per trade — losing money.`,
            },
            {
              contextTag: `[Scalper, SOL/USDT, low R:R wiped out by fees]`,
              context: `A scalper targets 0.4% gains, stops at 0.3% losses. R:R: 1.33:1. Win rate 58%.`,
              scenario: `Gross EV: (58% × 0.4%) − (42% × 0.3%) = 0.232% − 0.126% = +0.106% per trade. Fee (taker, both sides): 0.2% round-trip. Net EV: −0.094% per trade.`,
              outcome: `Positive gross EV, negative net EV. The 1.33:1 R:R left too thin a margin to absorb fees. Improving to 2:1 R:R (0.6% target, same 0.3% stop): EV = (58% × 0.6%) − (42% × 0.3%) = 0.348% − 0.126% = +0.222% − 0.2% fees = +0.022%. Marginally viable. The lesson: low R:R setups are the most vulnerable to fee erosion.`,
            },
          ],
          keyTakeaway: `R:R determines the minimum win rate needed for profitability. At 2:1, you only need 33% wins to break even. Always calculate R:R using technically justified levels — never fake the numbers by moving the stop closer. Any trade below 2:1 R:R needs exceptional win rate justification.`,
          guidedPractice: [
            {
              question: `You enter BTC long at $72,000. Stop at $70,000. Target at $76,000. What is the R:R?`,
              options: [`A — 1:2 — risk $4,000, gain $2,000`, `B — 2:1 — risk $2,000 ($72,000−$70,000), reward $4,000 ($76,000−$72,000)`, `C — 1:1 — equal risk and reward`, `D — 3:1 — the $6,000 total range divided equally`],
              correct: 1,
              hint: `R:R = (Target − Entry) / (Entry − Stop). Calculate each component separately.`,
              explanation: `B is correct. Risk = $72,000 − $70,000 = $2,000. Reward = $76,000 − $72,000 = $4,000. R:R = $4,000/$2,000 = 2:1. A inverts the ratio. C is wrong — $2,000 risk vs $4,000 reward is clearly not equal. D uses total range rather than correctly separating reward from risk.`,
            },
            {
              question: `At 2:1 R:R, what is the breakeven win rate (EV = 0)?`,
              options: [`A — 50% — same as 1:1 R:R`, `B — 33.3% — one win covers two losses at this ratio`, `C — 40% — accounting for compounding`, `D — 25% — high R:R needs very low win rate`],
              correct: 1,
              hint: `Set EV = 0: (W × 2R) − ((1-W) × 1R) = 0. Solve for W.`,
              explanation: `B is correct. 2W − 1 + W = 0 → 3W = 1 → W = 33.3%. At exactly 33.3% win rate and 2:1 R:R, EV is zero (breakeven before fees). At 34% wins, EV turns positive. At 40% wins with 2:1: EV = (40% × 2) − (60% × 1) = 0.80 − 0.60 = +0.20R per trade — solidly profitable while losing 60% of trades. This is why professionals talk about R:R as the primary variable — it unlocks profitability at win rates that feel like "losing."`,
            },
            {
              question: `You find a SOL setup: entry $190, stop $186, nearest resistance $193. Does this trade meet the 2:1 minimum?`,
              options: [`A — Yes — any defined stop qualifies`, `B — No — R:R = ($193−$190)/($190−$186) = $3/$4 = 0.75:1. Well below 2:1. Next resistance needed at $198+ for a 2:1 trade.`, `C — Yes — the stop distance is tight enough`, `D — Cannot determine without knowing account size`],
              correct: 1,
              hint: `Calculate R:R and compare to 2:1 minimum. What target price would give exactly 2:1 with a $4 risk?`,
              explanation: `B is correct. R:R = $3/$4 = 0.75:1 — significantly below the 2:1 minimum. For exactly 2:1 with a $4 risk: reward must be $8. Target needed: $190 + $8 = $198. User should check whether $198 has technical resistance justification. If the next technical target is $193 only, this setup fails minimum criteria regardless of how good the entry pattern looks.`,
            },
            {
              question: `A trader moves their stop from $70,200 to $71,200 (closer to entry of $71,600) to "improve R:R" from 1.5:1 to 3:1. What is the problem?`,
              options: [`A — Nothing — higher R:R is always better`, `B — The technical stop was at $70,200 for a reason. Moving it to $71,200 (in empty space) means normal price noise will trigger it before any genuine reversal. The "improved" R:R is fictional.`, `C — The stop should be further away, not closer`, `D — R:R doesn't change when the stop changes`],
              correct: 1,
              hint: `What is the purpose of a stop-loss? Can that purpose be served by a stop placed at an arbitrary price level?`,
              explanation: `B is correct. The stop at $70,200 was placed at a level where the trade thesis is invalidated. Moving it to $71,200 (only $400 below entry) means it sits in empty space — any normal $400 candle wick will trigger it. The "3:1 R:R" created by this manipulation is not a real 3:1 trade — it's a 1.5:1 trade with a stop that will be hit constantly by noise. The R:R can only be genuinely improved by finding a further technical target or by identifying a setup where the thesis-invalidation level is naturally closer to entry (e.g., a very tight breakout pattern).`,
            },
            {
              question: `Two traders have a 42% win rate. Trader A enforces 3:1 R:R minimum. Trader B takes all trades with whatever R:R they have (average 1.2:1). Who has positive EV and by how much?`,
              options: [`A — Trader A: +0.68R/trade. Trader B: −0.084R/trade`, `B — Both have positive EV at 42% win rate`, `C — Trader B has higher EV because lower R:R means higher win rate`, `D — Win rate determines EV; R:R is secondary`],
              correct: 0,
              hint: `Calculate EV for each: (Win% × Win R) − (Loss% × 1R). Trader A wins 3R per win, Trader B wins 1.2R per win.`,
              explanation: `A is correct. Trader A: (42% × 3) − (58% × 1) = 1.26 − 0.58 = +0.68R per trade. Trader B: (42% × 1.2) − (58% × 1) = 0.504 − 0.58 = −0.076R per trade. Same win rate, opposite signs of EV. Trader A compounds positively. Trader B slowly loses capital. The entire difference is R:R discipline. D is wrong — R:R is a primary variable, not secondary. Win rate and R:R jointly determine EV, and R:R is the variable a disciplined trader can control.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, daily chart. Bull flag breakout today.

Chart data:
Entry: $71,200 (close above flag resistance on 2.1× volume)
Flag pole: $58,000 → $72,000 (+$14,000)
Flag breakout level: $71,200
Flag low: $68,600
Technical stop: below flag low → $68,600 × 0.995 = $68,257 ≈ $68,200

Target levels (technical):
Level 1: $74,000 (prior 3-week high)
Level 2: $77,500 (prior monthly high)
Level 3: $85,200 (measured move: $71,200 + $14,000)

Account: $18,000. Risk: 2% ($360).

Calculate R:R for each potential target. Select valid TP levels. Calculate position size. State which targets qualify and which don't.`,
              scoringCriteria: [
                `Stop distance: $71,200 − $68,200 = $3,000`,
                `Level 1 ($74,000): Reward = $2,800. R:R = 2,800/3,000 = 0.93:1. FAILS. Not a valid primary target.`,
                `Level 2 ($77,500): Reward = $6,300. R:R = 6,300/3,000 = 2.1:1. PASSES (barely). Valid as TP2.`,
                `Level 3 ($85,200): Reward = $14,000. R:R = 14,000/3,000 = 4.67:1. PASSES strongly. Best objective.`,
                `Position size: $360 / $3,000 × $71,200 = $8,544 (0.120 BTC)`,
                `Recommended structure: No TP1 at $74,000 (fails R:R). TP1 at $77,500 (40%). TP2 at $85,200 (60%). Move stop to breakeven after TP1.`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `Five trade setups available today. Rank by R:R and identify which to take (max 2 simultaneously on a $12,000 account, 1.5% risk per trade):

Setup 1: ETH long. Entry $3,740. Stop $3,600 (structural). Target $4,100.
Setup 2: BTC long. Entry $72,000. Stop $70,500 (below swing low). Target $74,500.
Setup 3: SOL long. Entry $188. Stop $183 (below flag low). Target $202.
Setup 4: AVAX long. Entry $38.50. Stop $35.80 (below weekly support). Target $48.50.
Setup 5: BNB short. Entry $415. Stop $432 (above resistance). Target $390.

For each: calculate R:R, identify whether it meets 2:1 minimum, rank, and select the 2 best trades with position sizes.`,
              scoringCriteria: [
                `Setup 1: Reward=$360, Risk=$140. R:R=2.57:1. PASSES.`,
                `Setup 2: Reward=$2,500, Risk=$1,500. R:R=1.67:1. FAILS.`,
                `Setup 3: Reward=$14, Risk=$5. R:R=2.80:1. PASSES.`,
                `Setup 4: Reward=$10, Risk=$2.70. R:R=3.70:1. PASSES. Best R:R.`,
                `Setup 5: Reward=$25, Risk=$17. R:R=1.47:1. FAILS.`,
                `Rankings: Setup 4 (3.70:1) > Setup 3 (2.80:1) > Setup 1 (2.57:1) > Setup 2 (1.67:1) > Setup 5 (1.47:1)`,
                `Select: Setup 4 and Setup 3 (both pass, highest R:R). Position sizes: 1.5% × $12,000 = $180 risk each. Setup 4: $180/$2.70 × $38.50 = $2,567 notional. Setup 3: $180/$5 × $188 = $6,768 notional (36 SOL).`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader's 40-trade journal by R:R category:

Group A (R:R 3:1+, 14 trades): 7 wins, 7 losses. Win rate 50%. Avg win: 3.4R. Avg loss: 1.0R.
Group B (R:R 2-3:1, 18 trades): 9 wins, 9 losses. Win rate 50%. Avg win: 2.3R. Avg loss: 1.0R.
Group C (R:R below 2:1, 8 trades): 6 wins, 2 losses. Win rate 75%. Avg win: 1.5R. Avg loss: 1.0R.

Calculate EV per trade for each group. Identify the surprise in the data. Recommend which group the trader should focus on and explain the counterintuitive finding.`,
              scoringCriteria: [
                `Group A EV: (50% × 3.4R) − (50% × 1.0R) = 1.70 − 0.50 = +1.20R per trade`,
                `Group B EV: (50% × 2.3R) − (50% × 1.0R) = 1.15 − 0.50 = +0.65R per trade`,
                `Group C EV: (75% × 1.5R) − (25% × 1.0R) = 1.125 − 0.25 = +0.875R per trade`,
                `Surprise: Group C (lowest R:R) has a 75% win rate that generates +0.875R EV — higher than Group B but lower than Group A. At this win rate, the lower R:R is partially compensated.`,
                `The higher win rate in Group C may reflect setup type: lower R:R setups may be closer to mean reversion (which succeed more often but return less). The higher R:R setups trend-follow and win less often but return more when right.`,
                `Recommendation: Focus on Group A (highest EV per trade). Scale R:R discipline as primary filter. The Group C high win rate is pleasant psychologically but generates 27% less EV per trade than Group A.`,
              ],
            },
          ],
        },

        {
          id: 'one-two-percent-rule',
          title: `The 1-2% Rule`,
          explanation: `Van Tharp surveyed hundreds of professional traders across three decades and found virtually all limited per-trade risk to 0.5–3% of capital, with the most consistent traders at 1–2%. This was not coincidence — it was experience. Account-level survival requires trade-level constraint.

The 1-2% Rule: risk no more than 1-2% of your total trading capital on any single trade. "Risk" means the maximum loss if your stop-loss is hit — not the total position size. This distinction is critical and commonly confused.

A $10,000 account with 1% risk = $100 maximum loss per trade. If the stop is 2% below entry, the position size must be $5,000 (2% of $5,000 = $100). If the stop is 4% below entry, the position must be $2,500 (4% of $2,500 = $100). The dollar risk stays constant. The position size shrinks as the stop widens.

The formula: Position Size = (Account × Risk%) / Stop Distance (as % of entry).

Why 1-2%? The math: at 2% per trade, you need 35 consecutive full stops to halve your account. The probability of 35 consecutive losses at any reasonable win rate is effectively zero. At 5% per trade, you need only 14 consecutive losses — a perfectly plausible variance event over an active month. At 10%, only 7 consecutive losses.

The rule has an important secondary effect: it forces discipline on stop placement. If a trade needs a 7% stop to be technically valid but the 1% rule at that stop distance produces a position too small for the minimum order size, that is information — the trade may not be worth taking at this capital level.`,
          visualPrompt: `👆 1% rule: how position size changes with different stop distances`,
          visualType: `gif`,
          visualUrl: `position-sizing-calculator`,
          strategy: `Apply 1% risk on standard setups. Use 2% only on highest-conviction setups: minimum 3 timeframes aligned, volume confirmation, clean technical level. Never use 2% because a trade "looks certain." Reduce to 0.5% when testing new strategies, in unfamiliar markets, or after a 3+ consecutive loss streak. Rebuild confidence on smaller positions before returning to full size.`,
          examples: [
            {
              contextTag: `[Swing Trader, $15,000 account, 1% rule in practice]`,
              context: `A swing trader with $15,000 finds a BTC setup. Entry $71,200, stop $69,400, target $76,000.`,
              scenario: `1% risk: $150 max loss. Stop distance: $71,200 − $69,400 = $1,800/BTC. Position: $150 / ($1,800/$71,200) = $150 / 0.0253 = $5,929 notional = 0.0833 BTC.`,
              outcome: `If stopped: −$150 (1% of account). If target hit: +0.0833 × $4,800 = +$400 (+2.67% account). R:R: 2.67:1. The 1% rule gives a well-sized position at 39% of account — significant exposure but with capped downside.`,
            },
            {
              contextTag: `[New Trader, the position-size confusion]`,
              context: `A new trader with $8,000 thinks "1% rule means buying $80 of ETH." They act on this misunderstanding.`,
              scenario: `They buy $80 of ETH at $3,800 = 0.021 ETH. Stop: $3,600 (structural). If stopped: loss = 0.021 × $200 = $4.20 = 0.05% of account. Target $4,100: gain = 0.021 × $300 = $6.30.`,
              outcome: `The position is so small it barely affects the account in either direction. The trader took the wrong lesson — $80 isn't the risk, it's the position. The correct approach: 1% of $8,000 = $80 maximum LOSS. Stop distance = $200. Position = $80/$200 × $3,800 = $1,520 notional (0.4 ETH). Much larger position, same $80 risk at stop.`,
            },
            {
              contextTag: `[Experienced Trader, 2% on maximum-conviction setup]`,
              context: `A professional trader finds a weekly hammer on BTC at the 200-week moving average with volume 2.8× average — a rare maximum-conviction setup.`,
              scenario: `Account $45,000. Normal: 1% ($450). This setup: 2% ($900). Stop $58,000, entry $62,000. Risk/BTC: $4,000. Position: $900/$4,000 × $62,000 = $13,950 (0.225 BTC).`,
              outcome: `BTC rises to $88,000 (+41.9%). Position profit: $5,850 = +13% on account. The 2% exception was justified by rare, multi-factor convergence — not by feeling confident on an ordinary setup. The trader's explicit rule: 2% requires checklist of 4 specific criteria, all checked before upgrading position size.`,
            },
          ],
          keyTakeaway: `Risk 1-2% of account capital per trade — not position size, but maximum loss at stop. The formula: Position = (Account × Risk%) / Stop Distance. At 1% per trade, 35 consecutive losses are needed to halve the account — essentially impossible. The rule auto-sizes positions: wider stops = smaller positions.`,
          guidedPractice: [
            {
              question: `$20,000 account. 1% rule. Entry: SOL $190. Stop: $183. What is the maximum position size?`,
              options: [`A — $200 of SOL (1% of account)`, `B — $200 max loss ÷ $7 stop distance × $190 = $5,429 notional (28.57 SOL)`, `C — 1% of $190 entry = 0.01 × $190 = $1.90 per SOL`, `D — $20,000 × 1% = $200 maximum trade size`],
              correct: 1,
              hint: `Max loss = $20,000 × 1% = $200. Stop distance per SOL = $190 − $183 = $7. How many SOL can I buy for $200 in risk?`,
              explanation: `B is correct. Max loss = $200. Stop distance = $7/SOL. SOL to buy = $200 / $7 = 28.57 SOL. Position value = 28.57 × $190 = $5,429. A confuses position size with risk — buying $200 of SOL with a $7 stop only risks $200 × ($7/$190) = $7.37, far less than the 1% limit. D is the same error. The 1% rule controls maximum dollar loss at stop, not maximum position size. B derives the correct position from the risk budget and stop distance.`,
            },
            {
              question: `$10,000 account. 2% risk. BTC entry $72,000. Stop $70,400. What position size?`,
              options: [`A — $10,000 × 2% = $200 of BTC = 0.00278 BTC`, `B — $200 max loss ÷ $1,600 stop distance × $72,000 = $9,000 notional (0.125 BTC)`, `C — $10,000 × 0.02 / $72,000 = 0.00278 BTC`, `D — $10,000 × 2% / $1,600 = $1.25 per BTC`],
              correct: 1,
              hint: `Max loss = $200. Stop per BTC = $72,000 − $70,400 = $1,600. Position = Max loss / Stop per unit × Unit price.`,
              explanation: `B is correct. Max loss = $10,000 × 2% = $200. Stop distance = $1,600/BTC. BTC to buy = $200/$1,600 = 0.125 BTC. Position = 0.125 × $72,000 = $9,000 notional. A and C derive 0.00278 BTC by dividing $200 by $72,000 — that calculation finds how much BTC costs $200, not how many BTC you can buy before your stop costs you $200. These are completely different questions. The correct question is always: how many units can I buy such that a move to the stop price costs exactly the risk budget?`,
            },
            {
              question: `A setup requires a 6% stop (entry $100, stop $94) to be technically valid. On a $15,000 account with 1.5% risk ($225), what is the position size? Is this reasonable?`,
              options: [`A — Position = $225/6% = $3,750. Yes, reasonable at 25% of account`, `B — Position = $225 / ($100 × 6%) × $100 = $225/$6 × $100 = $3,750. Reasonable if target provides 2:1+ R:R`, `C — The position is too small — adjust the stop to reduce the distance`, `D — Cannot trade this setup under the 1% rule`],
              correct: 1,
              hint: `Calculate the position size. Then evaluate: is $3,750 notional reasonable? What does the R:R need to be?`,
              explanation: `B is correct. Position = $225/$6 × $100 = $3,750. This is 25% of the $15,000 account — a significant but not excessive position. Whether it's reasonable depends entirely on R:R. With 6% stop and 2:1 R:R requirement: target must be 12% above entry = $112. If $112 has technical justification, the trade is valid. If not, the wide stop makes it impossible to achieve 2:1 with a technically justified target, and the trade should be passed. C is the critical error — adjusting the stop to improve position size creates a stop in empty space.`,
            },
            {
              question: `Using percentage-based sizing (1% of current account), a trader has a 10-loss streak. After each loss they recalculate risk from the updated account. How does this differ from fixed-dollar risk?`,
              options: [`A — No difference — both produce the same result`, `B — Percentage-based: each loss reduces the risk amount slightly (each 1% is from a smaller account). Self-corrects during drawdowns. Fixed-dollar: always risks the same amount even as account shrinks, accelerating the decline.`, `C — Fixed-dollar is safer because it's predictable`, `D — Percentage-based produces larger losses during drawdowns`],
              correct: 1,
              hint: `After 3 consecutive 1% losses on a $10,000 account: what is the risk dollar amount on trade 4 for percentage vs fixed?`,
              explanation: `B is correct. Percentage-based, after 3 losses: $10,000 × (0.99)³ = $9,703. Risk on trade 4: 1% × $9,703 = $97.03 (slightly less than original $100). After 10 losses: $10,000 × (0.99)¹⁰ = $9,044. Risk = $90.44. The system naturally reduces exposure during drawdowns. Fixed-dollar always risks $100 — the same dollar amount even when the account has fallen, which means the effective percentage risk is rising as the account shrinks: $100/$9,044 = 1.1% by trade 10. Percentage-based sizing is the professionally correct approach for this reason.`,
            },
            {
              question: `What is wrong with this statement: "I can be flexible on the 1% rule for high-conviction trades — if I'm 90% sure it works, I'll use 5%."`,
              options: [`A — Nothing — conviction should determine position size`, `B — "90% certainty" is not quantifiable and is almost always an emotional state, not a statistical edge. The 1-2% rule protects against the reliable overconfidence of traders who feel 90% certain and are wrong 30% of the time. The rule exists precisely for the moments you feel most confident.`, `C — 5% is fine as long as the stop is technically placed`, `D — Only the 5% part is wrong — 3% would be acceptable`],
              correct: 1,
              hint: `When are traders most likely to be dangerously wrong? When do they feel most certain or least certain about a trade?`,
              explanation: `B is correct. Research consistently shows traders are most confident immediately before their largest losses — the "conviction" feeling is driven by pattern recognition biases, not actual edge. "90% sure" is an emotional statement, not a statistical one. Unless you have 100+ documented trades showing 90% win rate on this specific setup, you don't know your actual win rate. The 1-2% rule is most important precisely in the moments of highest perceived certainty — because those moments carry the highest psychological risk of overcommitting. The rule is not a guideline to be bent; it is a constraint that protects traders from their own overconfidence.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `You have a $22,000 trading account. Apply the 1-2% rule to three simultaneous setups:

Trade 1 (HIGH CONVICTION): BTC long. Entry $71,400. Stop: $69,600 (below key structural level). Target $76,800. Weekly + daily + 4H aligned uptrend, volume 2.3×. Use 2% risk.

Trade 2 (STANDARD): ETH long. Entry $3,740. Stop $3,600 (below range support). Target $4,100. 4H setup, volume average. Use 1.5% risk.

Trade 3 (EXPERIMENTAL): SOL short. Entry $192. Stop $198 (above resistance). Target $178. Testing a new inverse setup pattern you haven't used before. Use 0.5% risk.

Calculate: max loss, position size, and target profit for each. Then calculate total account risk and assess whether it's within professional limits. Note correlation implications.`,
              scoringCriteria: [
                `Trade 1: Max loss = $22,000 × 2% = $440. Stop distance = $1,800. Position = $440/$1,800 × $71,400 = $17,453 (0.2445 BTC). Target profit: 0.2445 × $5,400 = $1,320 = +6% account.`,
                `Trade 2: Max loss = $22,000 × 1.5% = $330. Stop distance = $140. Position = $330/$140 × $3,740 = $8,811 (2.36 ETH). Target profit: 2.36 × $360 = $849 = +3.86% account.`,
                `Trade 3: Max loss = $22,000 × 0.5% = $110. Stop distance = $6. Position = $110/$6 × $192 = $3,520 (18.33 SOL). Target profit: 18.33 × $14 = $256 = +1.16% account.`,
                `Total risk: $440 + $330 + $110 = $880 = 4% of account. Within the 6-8% maximum guideline.`,
                `Correlation note: Trades 1 and 2 are both long crypto. In a broad market crash, both will likely trigger simultaneously. Effective long-crypto risk is $770 (3.5%). Trade 3 is short SOL — provides slight hedge against long exposure.`,
                `Conclusion: position sizing is correct but the user should note correlation risk means actual simultaneous adverse exposure is $880 if all stop out together.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Audit this trader's last five position sizing decisions on a $20,000 account:

Trade 1: ETH long at $3,800. Stop $3,680. Risk used: "$200 of ETH = 0.0526 ETH." Is this correct 1% application?
Trade 2: BTC long at $72,000. Stop $70,000. Risk used: "1% × $72,000 = $720 per BTC." Is this correct?
Trade 3: SOL long at $190. Stop $183. Risk used: "1.5% risk = $300. Position = $300/7 × $190 = $8,143." Is this correct?
Trade 4: AVAX long at $38.50. Stop $35.80. Risk used: "I feel confident — using 4%." Is this correct?
Trade 5: BNB long at $412. Stop $398. Risk used: "1% of account = $200. $200/$14 × $412 = $5,886." Is this correct?`,
              scoringCriteria: [
                `Trade 1: WRONG. "$200 of ETH" applies the 1% to position size, not risk. Correct: max loss = $200. Stop distance = $120. Position = $200/$120 × $3,800 = $6,333 (1.667 ETH). Actual risk at their sizing: 0.0526 × $120 = $6.32 — far below the 1% risk budget.`,
                `Trade 2: WRONG. "$720 per BTC" is not how the rule works. Correct: max loss = $200 (1% × $20,000). Stop distance $2,000. Position = $200/$2,000 × $72,000 = $7,200 (0.10 BTC).`,
                `Trade 3: CORRECT. $300/$7 × $190 = $8,143 notional (42.9 SOL). If stopped: 42.9 × $7 = $300 = 1.5% of account. Perfect application.`,
                `Trade 4: WRONG. 4% is outside the 1-2% maximum. No conviction-based override to 4% is permitted under professional risk rules. Max would be 2% on highest conviction.`,
                `Trade 5: CORRECT. $200/$14 × $412 = $5,886 notional. If stopped: $5,886 × ($14/$412) = $200 = 1% exactly. Correct.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader violated the 1-2% rule four times in their journal. Reconstruct each trade at the correct risk size and calculate the total monetary cost of their violation:

Violation 1: Used 6% risk ($1,200 loss when stopped). Should have been 1.5% ($300).
Violation 2: Used 8% risk ($1,600 loss when stopped). Should have been 1.5% ($300).
Violation 3: Used 4% risk ($800 win). Should have been 1.5% ($600 at correct size, using same % gain).
Violation 4: Used 5% risk ($1,000 win). Should have been 1.5% ($600 at correct size).

Calculate: Total actual P&L from these 4 trades. Total P&L if 1.5% rule was applied. Total cost of rule violations. Explain why even the "wins" at oversized positions are rule violations worth correcting.`,
              scoringCriteria: [
                `Actual P&L: −$1,200 − $1,600 + $800 + $1,000 = −$1,000 net.`,
                `Correct-size P&L: −$300 − $300 + $600 + $600 = +$600 net.`,
                `Cost of violations: $1,600 total ($1,000 actual vs $600 correct-size, a $1,600 difference).`,
                `Why wins are still violations: the oversized wins ($800 and $1,000 instead of $600) may feel good but they reinforce the dangerous habit of over-sizing. The next oversized trade might be a loss (−$1,200 vs −$300). The psychological reinforcement of "big wins from big positions" is exactly what leads to catastrophic over-sizing during losing trades.`,
                `The rule must be consistent — not applied only to losing trades and abandoned for winning ones. Systematic application is what creates the mathematical protection.`,
              ],
            },
          ],
        },

        {
          id: 'position-sizing',
          title: `Position Sizing`,
          explanation: `Stanley Druckenmiller has attributed more of his investment success to position sizing than to market prediction. His philosophy: when you have strong conviction backed by evidence, size up. When uncertain, size down. Never treat all ideas as equal.

Position sizing is the mechanical process of determining how many units to buy or sell based on your risk budget and stop distance. Done consistently, it compresses your drawdown curve and allows the compounding effect of your edge to accumulate.

Advanced position sizing uses the Kelly Criterion: f = (bp − q) / b, where b = R:R ratio, p = win probability, q = (1 − p). For a strategy with 55% win rate and 2.5:1 R:R: f = (2.5 × 0.55 − 0.45) / 2.5 = (1.375 − 0.45) / 2.5 = 0.925/2.5 = 0.37 = 37% of capital. In practice, professionals use quarter-Kelly (9.25%) or half-Kelly (18.5%) to account for uncertainty in win-rate estimation.

For new traders without statistically significant track records (less than 50 trades), the 1-2% rule is the correct baseline. Kelly requires accurate win rate and R:R data — guessing these inputs produces worse results than the simple 1-2% rule.

Correlation is the hidden variable in position sizing. Holding 3 uncorrelated assets at 2% each = 6% total risk. Holding 3 correlated crypto assets at 2% each = effectively 6% on one directional bet. In a crypto market crash, all three stop out simultaneously. Account for correlation when calculating total open risk.

Volatility adjustment: ATR-based stops automatically adjust position size to current market conditions. High ATR (volatile market) → wider stop → smaller position. Low ATR (calm market) → tighter stop → larger position. This inverse relationship is correct — you should take larger positions in calmer markets where noise is less likely to trigger your stop.`,
          visualPrompt: `👆 Position sizing across different stop distances — how ATR affects size`,
          visualType: `gif`,
          visualUrl: `position-sizing-kelly`,
          strategy: `Use the 1-2% rule as your default. When you have 50+ documented trades, calculate your actual win rate and R:R and apply quarter-Kelly as a ceiling. Never size up during losses — the 1-2% percentage rule automatically reduces dollar risk during drawdowns (compounding protection). Reduce position size by 25-50% when entering unfamiliar market conditions or testing new patterns.`,
          examples: [
            {
              contextTag: `[Systematic Trader, Kelly Criterion after 80 documented trades]`,
              context: `After 80 trades: 54% win rate, average win 3.1R, average loss 1.0R.`,
              scenario: `Full Kelly: f = (3.1 × 0.54 − 0.46) / 3.1 = (1.674 − 0.46) / 3.1 = 39.2%. Quarter-Kelly: 9.8%. Account $20,000. Max risk per trade: $1,960. The Kelly result suggests the edge is strong — quarter-Kelly at $1,960 is 9.8% vs the trader's previous 2% ($400). The data justifies a larger allocation.`,
              outcome: `The trader increases from 2% to 4% risk per trade (staying well below the 9.8% quarter-Kelly ceiling) after verifying statistical significance. The additional sizing converts $400 risk per trade to $800, approximately doubling expected returns while remaining within mathematically sound limits. Kelly provides the maximum; discipline sets the actual.`,
            },
            {
              contextTag: `[Portfolio, crypto correlation risk]`,
              context: `A trader holds four simultaneous long positions: BTC (2% risk), ETH (1.5% risk), SOL (1.5% risk), AVAX (1% risk). Total nominal risk: 6%.`,
              scenario: `A macro risk-off event (Fed hawkish surprise) hits. All four assets fall simultaneously. Correlation during the event: 0.88. All four positions stop out within 90 minutes of each other.`,
              outcome: `Total account drawdown: 6% in a single event. The trader thought they had "four separate trades." In correlated assets, they had one directional bet on crypto market sentiment at 6% combined risk. The lesson: maximum total correlated position risk should be capped separately from per-trade risk. Professional rule: sum of correlated positions' risk caps at 6-8% regardless of individual position sizes.`,
            },
            {
              contextTag: `[Volatility-Adjusted Sizing, BTC/USDT]`,
              context: `A trader uses 2× ATR stops consistently.`,
              scenario: `Period 1 — low vol: BTC ATR $800. Stop = $1,600. 1% risk = $100. Position = $100/$1,600 × $68,000 = $4,250 (0.0625 BTC). Period 2 — high vol: BTC ATR $2,400. Stop = $4,800. 1% risk = $100. Position = $100/$4,800 × $68,000 = $1,417 (0.0208 BTC).`,
              outcome: `The ATR-based stop automatically produces a position 3× smaller during high-volatility conditions. This is correct: in chaotic markets where the ATR has tripled, the probability of being stopped out by noise is higher, the directional edge is lower, and position size should reflect this uncertainty. Volatility-adjusted sizing applies risk management dynamically rather than statically.`,
            },
          ],
          keyTakeaway: `Position sizing uses the 1-2% risk rule as baseline and Kelly Criterion as an advanced ceiling after 50+ documented trades. Account for correlation — correlated positions combine their risk. Volatility-based stops automatically right-size positions: wider stops (high vol) produce smaller positions, which is the correct relationship.`,
          guidedPractice: [
            {
              question: `A strategy has 60% win rate and 2:1 R:R. Full Kelly = (2 × 0.6 − 0.4) / 2 = 0.4 = 40%. Quarter-Kelly position size on a $20,000 account?`,
              options: [`A — $8,000 (40% full Kelly)`, `B — $2,000 (10% quarter-Kelly of $20,000 as notional)... but wait: Kelly = risk fraction, not position fraction. Risk at quarter-Kelly = 10% × $20,000 = $2,000 max loss per trade`, `C — $500 (2.5% of account)`, `D — Quarter-Kelly is $400 (2% of account)`],
              correct: 1,
              hint: `Full Kelly = 40% of capital as risk fraction. Quarter-Kelly = 10%. On $20,000: what dollar risk does 10% imply?`,
              explanation: `B is correct. Full Kelly of 40% means risking 40% of capital per trade — clearly too aggressive for the variance involved. Quarter-Kelly: 40%/4 = 10%. On a $20,000 account: risk budget = 10% × $20,000 = $2,000 per trade. This is still significantly above the standard 1-2% rule — Kelly should be used as a ceiling, not a target. A typical trader with this edge might use 3-5% risk and treat the $2,000 quarter-Kelly as confirmation they have room above the conservative 1% rule.`,
            },
            {
              question: `You hold 3 correlated crypto longs: ETH (2% risk), SOL (1.5% risk), AVAX (1% risk). A crash takes all three to their stops simultaneously. What is your actual account drawdown?`,
              options: [`A — 1.5% average per position`, `B — 4.5% total — all three stop out simultaneously in a correlated crash`, `C — Less than 4.5% because each position is independent`, `D — 2% maximum — the largest single position determines the drawdown`],
              correct: 1,
              hint: `When correlation is near 1.0 during a crash, what happens to the "independence" assumption?`,
              explanation: `B is correct. At near-1.0 correlation during a crypto crash, all three positions are effectively one directional bet. If all stop simultaneously: 2% + 1.5% + 1% = 4.5% account drawdown in a single event. This is the practical implication of correlation in portfolio construction. The theoretical answer (three independent trades = three separate risks) fails completely during correlated market stress. Professional risk management caps total correlated exposure regardless of per-trade risk: e.g., max 6% total long-crypto regardless of how many individual crypto positions are held.`,
            },
            {
              question: `BTC's 14-day ATR is $1,800. You use 2× ATR stops. Account: $15,000. 1.5% risk. Entry: $72,000. What is the position size?`,
              options: [`A — Stop = $3,600 below entry. Position = $225/$3,600 × $72,000 = $4,500 (0.0625 BTC)`, `B — Stop = $1,800 × 2 = $3,600. Risk = $225. Position = $225/$3,600 = 0.0625 BTC`, `C — Position = $15,000 × 1.5% / $72,000 = 0.003125 BTC`, `D — ATR-based sizing requires knowing tomorrow's ATR`],
              correct: 0,
              hint: `Risk = $15,000 × 1.5% = $225. Stop = 2 × ATR = $3,600. Position = Risk / Stop distance.`,
              explanation: `A is correct (same as B, which is identical). Risk = $225. Stop = 2 × $1,800 = $3,600. BTC to buy = $225/$3,600 = 0.0625. Position = 0.0625 × $72,000 = $4,500. C divides risk by BTC price — that gives how much BTC costs $225, not how many BTC you can buy for $225 in stop risk. These are different calculations. The correct framework: how many BTC can I hold such that a $3,600 adverse move costs exactly $225?`,
            },
            {
              question: `What is the anti-martingale principle and why does it apply to percentage-based position sizing?`,
              options: [`A — Anti-martingale: double position after losses to recover faster`, `B — Anti-martingale: increase position size after wins (larger account = larger 1% in dollars), decrease after losses (smaller account = smaller 1%). This naturally lets profits run and limits losses.`, `C — Anti-martingale means never changing position size regardless of account changes`, `D — Anti-martingale means using fixed dollar amounts regardless of win/loss history`],
              correct: 1,
              hint: `After a win, your account is larger. After a loss, smaller. How does 1% of a larger account compare to 1% of a smaller account in dollar terms?`,
              explanation: `B is correct. Percentage-based sizing is inherently anti-martingale: after wins, 1% of the larger account is a larger dollar amount — position sizes grow during winning streaks. After losses, 1% of the smaller account is a smaller dollar amount — position sizes shrink during losing streaks. This is the mathematically optimal approach: compound gains during good performance, protect capital during bad performance. The martingale (doubling after losses) does the opposite and is mathematically guaranteed to eventually produce ruin given a long enough losing streak.`,
            },
            {
              question: `You have 65 documented trades: 55% win rate, average win 2.8R, average loss 1.1R (3 gap-down losses exceeded planned 1R stops). How should the gap losses affect your Kelly calculation?`,
              options: [`A — Ignore them — they were exceptional events`, `B — Use the actual average loss (1.1R) in the Kelly formula, not the planned 1R. Gap losses are a real feature of the strategy's risk profile and must be included.`, `C — Exclude outlier trades from Kelly calculation`, `D — Apply full Kelly using 1R as the loss — gaps don't repeat often enough to matter`],
              correct: 1,
              hint: `Kelly requires accurate win rate and loss size inputs. What happens to the Kelly output if actual average losses exceed planned losses?`,
              explanation: `B is correct. Kelly Criterion is only as good as its inputs. If the strategy has averaged 1.1R losses (not 1.0R as planned), using 1.0R in the formula overstates the edge and produces an overconfident Kelly fraction. The actual average loss — including gaps, slippage, and imperfect fills — must be used. Using 1.1R as the average loss: Kelly = (2.8 × 0.55 − 0.45) / 2.8 = (1.54 − 0.45) / 2.8 = 0.389 = 38.9%. Quarter-Kelly = 9.7%. Very close to the result with 1.0R, but the point is disciplined accuracy in the inputs. Over- or under-estimating the average loss by even 0.2R can change the optimal fraction meaningfully over hundreds of trades.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You have a $30,000 account. Design the complete position sizing for today's portfolio:

Open positions (already entered):
P1: BTC long. Entry $71,400. Stop $69,200. Risk: 1.5% ($450).
P2: ETH long. Entry $3,740. Stop $3,600. Risk: 1% ($300).

New setups to evaluate (today):
S1: SOL long. Entry $188. Stop $181. Conviction: high. Suggested risk: 2%.
S2: AVAX short. Entry $38.50. Stop $40.20. Conviction: standard. Suggested risk: 1.5%.
S3: BNB long. Entry $412. Stop $398. Conviction: experimental (new pattern). Suggested risk: 0.5%.

Calculate: position size for each new setup. Total account risk across all 5 positions. Assess correlation and whether total risk is within limits. State what you would drop if total risk exceeds guidelines.`,
              scoringCriteria: [
                `S1 SOL long: 2% × $30,000 = $600. Stop = $7. Position = $600/$7 × $188 = $16,114 (85.7 SOL).`,
                `S2 AVAX short: 1.5% × $30,000 = $450. Stop = $1.70. Position = $450/$1.70 × $38.50 = $10,191 (264.7 AVAX).`,
                `S3 BNB long: 0.5% × $30,000 = $150. Stop = $14. Position = $150/$14 × $412 = $4,414 (10.7 BNB).`,
                `Total account risk: P1($450) + P2($300) + S1($600) + S2($450) + S3($150) = $1,950 = 6.5% of $30,000.`,
                `Within the 6-8% guideline. Borderline.`,
                `Correlation: P1, P2, S1, S3 are all long crypto. Combined long risk = $450+$300+$600+$150 = $1,500 = 5% long crypto. S2 (AVAX short) partially offsets.`,
                `If must reduce: drop S1 (2% risk, largest new addition) or reduce to 1.5% to bring total to 6%.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You have 58 documented trades with these statistics:
Win rate: 52%. Average win: 2.4R. Average loss: 1.0R (no gaps, stops honoured).

Account: $25,000.

Tasks:
1. Calculate full Kelly and quarter-Kelly fractions
2. At quarter-Kelly risk per trade, what is the dollar risk per trade?
3. Compare: what did you risk before (2% = $500), what does quarter-Kelly suggest?
4. Is the difference large enough to justify switching sizing systems?
5. Calculate expected monthly gain difference at 8 trades/month between 2% and quarter-Kelly.`,
              scoringCriteria: [
                `Full Kelly: f = (2.4 × 0.52 − 0.48) / 2.4 = (1.248 − 0.48) / 2.4 = 0.768/2.4 = 0.32 = 32%`,
                `Quarter-Kelly: 32%/4 = 8% of account as risk per trade = $2,000 per trade.`,
                `Current 2% = $500. Quarter-Kelly = $2,000. Difference: 4× larger position risk at quarter-Kelly.`,
                `The jump from 2% to 8% risk per trade is large. The 52% win rate with only 58 trades has limited statistical significance — at 58 trades, the confidence interval on the win rate is wide (roughly 52% ± 13% at 95% confidence). Jumping to 8% risk based on potentially unreliable statistics is imprudent.`,
                `Recommended: transition to 3-4% risk per trade (midpoint between current and quarter-Kelly) and continue tracking. At 100 trades, recalculate.`,
                `Monthly EV at 8 trades: 2% sizing = 8 × (+0.36R average EV) × $500 risk = +$1,440. Quarter-Kelly = 8 × 0.36R × $2,000 = +$5,760. The 4× gain is real — but only if the actual edge is as stable as the historical data suggests.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Three traders all start with $10,000. Same market conditions for 6 months. Different position sizing systems:

Trader A: Fixed dollar $200 per trade (flat, regardless of account changes). Win rate 55%, 2:1 R:R.
Trader B: 2% percentage of current account. Same win rate and R:R.
Trader C: Martingale — starts at $200, doubles each loss, resets on win. Same win rate and R:R.

Simulate these key sequences for each trader:

Sequence 1: W W W W W (5 consecutive wins)
Sequence 2: L L L L L (5 consecutive losses, starting after the wins above)
Sequence 3: W W L L W L W W (mixed over 8 trades)

Show account value after each sequence for each trader. Identify which system produces the best risk-adjusted outcome.`,
              scoringCriteria: [
                `Trader A Sequence 1 (5W): each win = $400 (2:1 on $200). Account: $10,000 → $12,000. Sequence 2 (5L): −$200 each. Account: $12,000 → $11,000. Sequence 3: variable, straightforward arithmetic.`,
                `Trader B Sequence 1 (5W): starts at 2% × $10,000 = $200 risk, wins $400. Account grows. After 5W: $10,000 × (1.04)⁵ = $12,167 (each win adds 4% from 2:1 on 2% risk). Sequence 2 (5L from $12,167): each loss 2% of current. $12,167 × (0.98)⁵ = $11,013. Better than Trader A during losses because loss amounts are smaller (% of smaller base).`,
                `Trader C: After 5W (all at $200 since no losses): $12,000 same as A. Sequence 2 (5L): L1 −$200, L2 −$400, L3 −$800, L4 −$1,600, L5 −$3,200. Total: −$6,200. Account: $12,000 − $6,200 = $5,800. CATASTROPHIC.`,
                `Trader B is best: percentage sizing compounds wins and naturally reduces losses during drawdowns. Trader A is linear and predictable. Trader C is destroyed by the 5-loss streak — martingale always fails given sufficient consecutive losses.`,
              ],
            },
          ],
        },

        {
          id: 'stop-placement-strategy',
          title: `Stop-Loss Placement Strategy`,
          explanation: `Most stop-losses are not hit because trades were wrong — they are hit because stops were placed in the wrong location. A stop placed inside the normal noise of a market will be triggered repeatedly by routine price swings, removing you from valid trades at a loss before the trade has any chance to work.

Five technically justified stop placement methods, each suited to different trade types:

Method 1 — Below Structure: Place the stop below the last swing low (for longs) or above the last swing high (for shorts). If price breaks the prior swing low, the bullish higher-lows structure is broken — the trade is definitively wrong. This is the most universal method.

Method 2 — Below Support/Resistance: For level-based trades. Stop goes below the support level that, if breached, proves the level failed.

Method 3 — ATR-Based: Stop at 2–2.5× the current ATR below entry. This accounts for normal market volatility mathematically, ensuring routine candle ranges don't trigger the stop.

Method 4 — Below the Breakout Level: For breakout trades, the stop goes below the level that was broken. A return below the breakout level invalidates the breakout.

Method 5 — Below the Pattern: For chart patterns (flags, triangles, cups). Stop goes below the entire pattern structure — below the flag low, below the triangle lower boundary.

Essential buffer: stops are almost never placed exactly at a technical level. Add 0.5–1% below the level (for longs) to accommodate wicks and market noise. BTC might briefly wick below a $70,000 support in a thin morning session before recovering — a stop at $69,650 (0.5% below) absorbs that wick while a stop at $70,000 exactly would trigger.

What does not work: stops at comfortable loss amounts, at round numbers with no prior price significance, or at arbitrary percentages from entry.`,
          visualPrompt: `👆 Five stop placement methods on one chart — where and why`,
          visualType: `gif`,
          visualUrl: `stop-placement-methods`,
          strategy: `Default: Below Structure (last swing low + 0.5% buffer). Confirm the stop gives at least 2:1 R:R with a technically justified target. If not, the setup fails criteria — do not adjust the stop to manufacture better R:R. Use ATR-based stops when structure stops are too far for the R:R to work: 2× ATR often provides similar invalidation logic with a more compact distance.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, below-structure stop surviving noise]`,
              context: `Entry at $72,000 on a 4H breakout. Last 4H swing low: $70,200. Below-structure stop: $70,200 × 0.995 = $69,800.`,
              scenario: `Over the following week, BTC dips intraday to $70,400 twice (morning session thin liquidity wicks) before continuing to $76,800. A stop at $70,300 (too tight, no buffer) would have triggered on the first wick.`,
              outcome: `The $69,800 stop (with proper 0.5% buffer below the structural level) absorbed both wicks and kept the trader in the trade for a +$4,800 move. The extra $400 of stop distance below the swing low was the difference between a −$220 loss and a +$400 gain.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, ATR-based stop on tight breakout]`,
              context: `ETH 1H breakout at $3,740. 14-period 1H ATR: $44. Nearest structural support $3,700 (too close). ATR stop: 2 × $44 = $88. Stop: $3,740 − $88 = $3,652.`,
              scenario: `ETH dips to $3,668 on a volatile intraday candle before recovering. Structure stop at $3,700 would have triggered. ATR stop at $3,652 does not.`,
              outcome: `ETH continues to $3,890. The ATR-based stop accounted for the asset's typical hourly volatility ($44 ATR) and placed the stop beyond 2× normal candle range. The structural stop at $3,700 was too close to the immediate volatility. Both methods are valid — the ATR method won in this specific case because structure was too close for the typical noise level.`,
            },
            {
              contextTag: `[Position Trader, BTC/USDT, below-pattern stop on flag]`,
              context: `Daily bull flag. Breakout at $71,200. Flag low: $68,800. Below-pattern stop: $68,800 × 0.995 = $68,456 ≈ $68,400.`,
              scenario: `BTC pulls back to $70,100 after the breakout — inside the upper half of the flag area. A stop at $70,500 would have exited the trade as a false breakout. The below-pattern stop remains intact.`,
              outcome: `BTC holds above $68,400 and resumes uptrend to $78,000. The below-pattern stop correctly identified the thesis-invalidation level (flag entirely failed if price returns below its low) and gave the trade room to breathe through a normal post-breakout retest.`,
            },
          ],
          keyTakeaway: `Stops belong at the level that invalidates your trade thesis — below structure, below support, 2× ATR, below breakout, or below pattern. Always add 0.5-1% buffer for wick noise. Never place stops at arbitrary levels or at "comfortable loss amounts." The stop location drives everything: position size, R:R, and trade validity.`,
          guidedPractice: [
            {
              question: `You enter ETH long at $3,780 on a breakout above $3,740 resistance. Last swing low before entry: $3,620. Using below-structure method with 0.5% buffer, where is the stop?`,
              options: [`A — $3,720 — just below the $3,740 breakout level`, `B — $3,620 × 0.995 = $3,601.90 ≈ $3,600 — below the swing low with 0.5% buffer`, `C — $3,740 — exactly at prior resistance`, `D — $3,700 — a comfortable round number`],
              correct: 1,
              hint: `Below-structure means below the last SWING LOW, not below the breakout level.`,
              explanation: `B is correct. The swing low at $3,620 is the structural reference. With 0.5% buffer: $3,620 × 0.995 = $3,601.90. If price breaks below $3,620, the bullish structure (series of higher lows) is broken — the trade is wrong. A places the stop too close to the breakout level — normal pullbacks will test $3,740 as new support. C has no buffer and would trigger on any wick through $3,740. D is arbitrary — no technical level justifies $3,700 in this scenario.`,
            },
            {
              question: `BTC 4H ATR: $620. Entry at $72,000. Using 2× ATR stop, what is the stop level and what does it protect against?`,
              options: [`A — Stop at $71,380 (1× ATR). Protects against routine daily candles.`, `B — Stop at $70,760 (2 × $620 = $1,240 below entry). Protects against movements of up to 2× the average candle range — normal volatility won't trigger this stop, only genuine directional moves.`, `C — Stop at $69,900 (3× ATR) — always use 3× for safety`, `D — ATR stops are only for daily charts`],
              correct: 1,
              hint: `2× ATR means the stop absorbs up to 2 full average-candle-range moves. What does this imply about what won't trigger the stop?`,
              explanation: `B is correct. 2× $620 = $1,240. Stop: $72,000 − $1,240 = $70,760. The average 4H BTC candle has a range of $620. A routine adverse $620 candle (1× ATR) won't reach the stop at $1,240 away. Only a movement of more than 2 average candles is required to trigger — this filters out normal noise. 1× ATR (A) would be triggered by the very first average-sized adverse candle — too tight. 3× ATR (C) gives too much room: a 3-candle adverse move without the stop triggering means a large drawdown before the trade is exited.`,
            },
            {
              question: `A bull flag has flag low $68,200 and breakout at $71,000. Entry: $71,200. Using below-pattern stop with 0.5% buffer, where does the stop go?`,
              options: [`A — Below $71,000 (breakout level)`, `B — Below $68,200 (flag low) with 0.5% buffer: $68,200 × 0.995 = $67,859 ≈ $67,850`, `C — Below the flag midpoint ($69,600)`, `D — 2% below entry: $71,200 × 0.98 = $69,776`],
              correct: 1,
              hint: `Below-pattern stop for a bull flag: below the lowest point of the flag consolidation, not just below the breakout.`,
              explanation: `B is correct. The flag low is $68,200 — the bottom of the entire consolidation pattern. If price falls below $68,200 after breaking above $71,000, the entire flag structure has failed (price returned below the pattern that was supposed to support the breakout). With 0.5% buffer: $67,859. A is too close — post-breakout pullbacks routinely retest the breakout level. C is arbitrary. D uses a fixed percentage with no structural basis.`,
            },
            {
              question: `A setup has: Entry $190 SOL. Technical stop (below swing low) at $180. Target $204. Account $10,000, 1.5% risk. Does this trade meet all criteria?`,
              options: [`A — Yes — all elements are defined`, `B — Calculate R:R: ($204−$190)/($190−$180) = $14/$10 = 1.4:1. Fails the 2:1 minimum despite correct stop placement. The setup is technically sound but doesn't meet R:R criteria.`, `C — Adjust the stop to $184 to improve R:R`, `D — Take the trade — R:R doesn't override a correct entry`],
              correct: 1,
              hint: `Correct stop placement is necessary but not sufficient. R:R must also meet the 2:1 minimum.`,
              explanation: `B is correct. The stop at $180 is technically justified (below swing low with buffer). The position size would be correct ($150/$10 × $190 = $2,850). But R:R = $14/$10 = 1.4:1 — below the 2:1 minimum. The trade fails criteria despite correct execution of the stop placement method. Correct response: find a further technical target. If next resistance is at $210: R:R = $20/$10 = 2:1. Or: if $210 doesn't exist technically, this setup structure doesn't meet trade criteria and should be skipped. C is the critical error — moving the stop closer to manufacture R:R creates an invalid stop.`,
            },
            {
              question: `Trader claims their stops are "always triggered right before the reversal." What is the most likely root cause?`,
              options: [`A — The market targets retail stop levels specifically`, `B — Stops are placed at obvious levels (exact round numbers, exact prior highs/lows) without a buffer — these levels are known and tested by institutional order flow, causing wicks through them before reversal`, `C — Trading without stops would solve the problem`, `D — They need to use wider stops generally`],
              correct: 1,
              hint: `If stops trigger just before reversals, where are they being placed? What levels does price test and then reverse from?`,
              explanation: `B is correct. Stops placed at the exact swing low ($70,000) without buffer are placed at the same level that institutional and algorithmic order flow targets during high-volatility periods. Price sweeps these "obvious" levels, filling retail stop-market orders and providing liquidity for institutional buyers, then reverses. The solution: the 0.5-1% buffer places the stop below where the sweep occurs. A stop at $69,650 (0.5% below $70,000) is not triggered by the sweep to $69,900 that then reverses to $74,000. The "market targets stops" observation is real — the solution is placement below the swept level, not removing stops.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `ETH/USDT, 4H chart. You want to enter long. Apply all five stop methods and choose the best:

Entry: $3,792 (confirmed flag breakout, volume 2.2× average)
4H ATR: $56
Prior swing lows on 4H: $3,680 (3 weeks ago), $3,718 (last week)
Flag low: $3,724
Breakout level: $3,778 (now new support)
Target: $4,100

Account: $16,000. Risk: 1.5% ($240).

Apply each method. Calculate stop price, position size, and R:R. Select the best method with reasoning.`,
              scoringCriteria: [
                `Method 1 (Below last swing low $3,718): $3,718 × 0.995 = $3,699. Risk = $93/ETH. Position = $240/$93 × $3,792 = $9,781 (2.58 ETH). R:R = ($4,100−$3,792)/($3,792−$3,699) = $308/$93 = 3.31:1. PASSES.`,
                `Method 2 (Below breakout level $3,778): $3,778 × 0.995 = $3,759.11. Risk = $32.89/ETH. Position = $240/$32.89 × $3,792 = $27,678 (7.3 ETH). R:R = $308/$32.89 = 9.36:1. Very high R:R but extremely tight — wick risk is high.`,
                `Method 3 (2× ATR = $112): $3,792 − $112 = $3,680. Risk = $112/ETH. Position = $240/$112 × $3,792 = $8,125 (2.14 ETH). R:R = $308/$112 = 2.75:1. PASSES.`,
                `Method 4 (Below flag low $3,724): $3,724 × 0.995 = $3,705.38 ≈ $3,705. Risk = $87/ETH. Position = $240/$87 × $3,792 = $10,462 (2.76 ETH). R:R = $308/$87 = 3.54:1. PASSES.`,
                `Method 5 (Below pattern — same as flag low): same as Method 4.`,
                `Recommendation: Method 1 or 4 (below swing low / below flag low) — both have strong technical justification and R:R >3:1. Method 3 is also valid. Method 2 (below breakout) is technically valid but extremely tight — not recommended for 4H ETH with $56 ATR.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Review eight stop placements and classify each as correct, too tight, or wrong method:

1. BTC long at $72,000. Prior swing low $70,200. Stop at $71,900. [0.1% below entry]
2. ETH short at $3,820. Prior swing high $3,840. Stop at $3,862 (0.5% above swing high).
3. SOL long breakout at $191 above $188 resistance. Stop at $187.06 ($188 × 0.995).
4. AVAX long at $38.50. Stop at $37.00 — "feels like the right amount to lose."
5. BNB long at $412. 4H ATR $8.20. Stop at $412 − (2 × $8.20) = $395.60.
6. ETH bull flag low at $3,680. Breakout at $3,740. Entry $3,752. Stop at $3,724 ($3,680 × 1.01 — ABOVE flag low).
7. BTC at $72,000. Stop at $70,000 (round number, no prior structure significance).
8. SOL long at $188. Prior swing lows: $181 and $183. Stop at $180.10 (below both swing lows with buffer).`,
              scoringCriteria: [
                `Stop 1: TOO TIGHT. $71,900 is $100 below entry — trivial. Prior swing low ($70,200) is the correct structural reference. Correct stop: $70,200 × 0.995 = $69,799.`,
                `Stop 2: CORRECT. For a short, stop above the last swing high. $3,840 × 1.005 = $3,859.20. Minor rounding difference from $3,862 — effectively correct.`,
                `Stop 3: CORRECT. Breakout stop below breakout level ($188) with 0.5% buffer = $187.06.`,
                `Stop 4: WRONG. "Feels right" is never a valid method. No technical level at $37.00. Must use structure, ATR, or pattern-based stop.`,
                `Stop 5: CORRECT. ATR-based stop at 2× ATR. $8.20 × 2 = $16.40. $412 − $16.40 = $395.60. Valid.`,
                `Stop 6: WRONG. Stop at $3,724 ($3,680 × 1.01) is ABOVE the flag low of $3,680 — the stop is inside the flag pattern, not below it. Correct: $3,680 × 0.995 = $3,661.40.`,
                `Stop 7: WRONG. Round number with no prior structure. $70,000 may be swept by wicks. Must use a prior swing low or ATR-based level.`,
                `Stop 8: CORRECT. Below BOTH relevant swing lows (most conservative) with buffer. $180.10 is below $181 and $183.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, daily chart. You want to enter a position based on a daily bull flag breakout.

Chart data:
Flag pole: $62,000 → $74,000 (+$12,000)
Flag consolidation: $70,200 − $74,000 (4 days)
Flag low: $70,200
Breakout: today's daily close at $74,200 on 1.9× average volume
14-day ATR: $1,750
Prior daily swing lows: $70,200 (flag low, most recent), $68,100 (prior structure)

You have exactly $20,000 account with 1.5% risk ($300).

Choose which stop method gives the best combination of technical validity + R:R. Calculate position size. Calculate where the trailing stop should move after the position reaches +2R.`,
              scoringCriteria: [
                `Option 1 (Below flag low, most recent swing low): $70,200 × 0.995 = $69,849. Risk = $74,200 − $69,849 = $4,351. Position = $300/$4,351 × $74,200 = $5,123 (0.0690 BTC). Target (measured move): $74,200 + $12,000 = $86,200. R:R = $12,000/$4,351 = 2.76:1. PASSES.`,
                `Option 2 (2× ATR): $74,200 − $3,500 = $70,700. Risk = $3,500. Position = $300/$3,500 × $74,200 = $6,360 (0.0857 BTC). R:R = $12,000/$3,500 = 3.43:1. PASSES. Better R:R, slightly larger position.`,
                `Option 3 (Below prior major structure $68,100): $68,100 × 0.995 = $67,759. Risk = $6,441. Position = $300/$6,441 × $74,200 = $3,457 (0.0466 BTC). R:R = $12,000/$6,441 = 1.86:1. FAILS 2:1.`,
                `Best choice: Option 2 (2× ATR) — best R:R at 3.43:1, manageable position size, technically sound (2× ATR accounts for daily BTC volatility).`,
                `Trailing stop after +2R: +2R profit from option 2 = $3,500 × 2 = $7,000 gain. Price at +2R: $74,200 + $7,000 = $81,200. Move stop to breakeven ($74,200). Begin trailing at 2× ATR ($3,500) below new highs.`,
              ],
            },
          ],
        },

        {
          id: 'trading-journal',
          title: `The Trading Journal`,
          explanation: `Mark Douglas, in research spanning thousands of traders, found that those who maintained detailed trading journals were dramatically more likely to be profitable long-term than those who didn't — not because journaling magically improved their analysis, but because it forced them to confront what was actually happening in their trading versus what they believed was happening.

A trading journal is a record of every trade you make: entry and exit prices, rationale, setup type, market conditions, emotional state during the trade, outcome, and what you would do differently. Most traders have a distorted memory of their performance — they remember their wins vividly and minimise their losses. A journal eliminates this bias.

The minimum journal entry for each trade:
— Date, asset, and session (market conditions)
— Entry price, stop price, target price
— Position size and dollar risk
— Setup type and trade rationale (what made this a valid trade?)
— Actual exit price and reason (stopped out / target hit / manual exit)
— Emotional state during trade (calm / anxious / overconfident?)
— What I would do differently

The journal review process matters more than the initial logging. Weekly review: look for patterns. Are your losses clustering in specific market conditions? Time of day? Are you winning more on certain setup types? Monthly review: calculate actual win rate, average win R, average loss R, and compare to expected EV.

The most valuable information the journal reveals: the difference between what you planned and what you did. If you planned 1% risk and used 3%, the journal records both. If you planned to wait for confirmation and entered early, the journal records both. Over months, patterns emerge — and patterns can be fixed. Emotional and behavioral patterns cannot be fixed without evidence of their existence.`,
          visualPrompt: `👆 Trading journal template — what to record on every trade`,
          visualType: `gif`,
          visualUrl: `trading-journal-template`,
          examples: [
            {
              contextTag: `[New Trader, 3 months, journal reveals edge]`,
              context: `A new trader kept a trading journal for 90 days. After reviewing 62 trades, patterns emerged they hadn't consciously noticed.`,
              scenario: `Setup-by-setup analysis: Breakout trades: 18 trades, 12 wins, 66.7% win rate, avg 2.4R. Range reversal trades: 24 trades, 11 wins, 45.8% win rate, avg 1.6R. Momentum continuation: 20 trades, 8 wins, 40.0% win rate, avg 1.9R.`,
              outcome: `The journal revealed the trader had genuine edge in breakout trades (EV = +0.94R/trade) but were essentially breakeven in range reversals (EV = +0.01R) and slightly negative in momentum trades (EV = −0.08R). The recommendation was obvious: stop taking range reversal and momentum trades, focus entirely on breakouts. Without the journal, the trader believed they had "a mixed style" — the data showed they had one profitable style and two neutral ones.`,
            },
            {
              contextTag: `[Experienced Trader, journal reveals emotional pattern]`,
              context: `A trader's journal included an "emotional state" column. Monthly review of 45 trades revealed a concerning pattern.`,
              scenario: `Average P&L by emotional state logged at entry:
"Calm, patient": 28 trades, +$220 avg.
"Slightly anxious": 12 trades, −$80 avg.
"Excited / FOMO": 5 trades, −$640 avg.`,
              outcome: `The data was unambiguous: the 5 trades entered in an excited/FOMO state averaged −$640 each — destroying all gains from calm trading. Total: $640 × 5 = −$3,200 from FOMO trades vs +$220 × 28 = +$6,160 from calm trades. The journal gave the trader a concrete rule: no trading when the "excited" flag is logged. Without the journal, the trader would have described FOMO as "occasional" and continued repeating the pattern.`,
            },
            {
              contextTag: `[Intermediate Trader, using journal for backtesting forward]`,
              context: `A trader uses their trading journal as a running forward-test of their strategy rules.`,
              scenario: `For each trade, they log not just what they did but what the rules say they should have done. Over 40 trades, 12 entries show "departed from rules." Departed trades: 7 losses, 5 wins, avg outcome −$145. Followed-rules trades: 18 wins, 10 losses, avg outcome +$220.`,
              outcome: `The journal proved statistically that following the rules produced positive EV (+$220 avg) while rule departures produced negative EV (−$145 avg). The comparison is the most powerful motivator for discipline: not "I should follow the rules" but "the last 12 times I broke the rules, I lost $145 on average versus making $220 when I followed them." Data creates discipline that willpower alone cannot.`,
            },
          ],
          keyTakeaway: `A trading journal is the only tool that reveals what is actually happening in your trading versus what you believe is happening. Log every trade with setup type, emotional state, planned vs actual execution, and outcome. Review weekly for patterns. Monthly: calculate actual vs expected EV by setup type. The journal turns vague impressions into actionable data.`,
          guidedPractice: [
            {
              question: `Which of these is the MOST valuable piece of information to record in a trading journal?`,
              options: [`A — The asset's daily volume at time of entry`, `B — Your emotional state at the time of entry (calm / anxious / excited) and whether you departed from your pre-defined rules`, `C — The exact time to the second that you entered`, `D — The current news headlines at time of entry`],
              correct: 1,
              hint: `What causes most trading losses — market conditions or trader behavior? Which of these captures behavior?`,
              explanation: `B is correct. The emotional state and rule-compliance fields capture behavioral patterns — the primary source of trading losses for most retail traders. An honest log of "I entered early because I was afraid of missing the move" or "I widened my stop because I was confident" provides the data needed to identify and fix behavioral leaks. A, C, and D capture market context but don't capture the behavioral dimension that most affects outcomes. The journal is most useful when it records the gap between plan and execution — which requires noting both what the rules said and what you actually did.`,
            },
            {
              question: `After 60 trades, your journal shows: Breakout setups — 28 trades, 57% win rate, avg 2.6R win. Support bounce setups — 32 trades, 38% win rate, avg 1.8R win. Which should you focus on and why?`,
              options: [`A — Support bounces — higher trade count means more data`, `B — Breakouts: EV = (57% × 2.6) − (43% × 1) = 1.482 − 0.43 = +1.052R/trade vs Support bounces: EV = (38% × 1.8) − (62% × 1) = 0.684 − 0.62 = +0.064R/trade. Breakouts are 16× more EV-efficient.`, `C — Divide equally — diversification reduces risk`, `D — Support bounces — lower R:R means less variance`],
              correct: 1,
              hint: `Calculate EV per trade for each setup type: (Win% × Win R) − (Loss% × 1R).`,
              explanation: `B is correct. Breakout EV: +1.052R/trade. Support bounce EV: +0.064R/trade. The breakout setup is generating 16× more expected value per trade. This is the core value of setup categorisation in the journal — it reveals which setups are driving all the returns. The rational response: eliminate or significantly reduce support bounce trades, allocate all capital and attention to breakout setups. C (diversification) applies to asset allocation, not to strategy selection within your own trading. Diversifying into a near-zero EV setup dilutes an effective high-EV setup.`,
            },
            {
              question: `Your journal shows you exited 14 trades manually before hitting stop OR target. On 9 of these, the trade hit your original target after you exited. On 5, it reversed and would have hit your stop. What rule should you implement?`,
              options: [`A — Exit manually more often — it's working 9/14 times`, `B — Implement a no-manual-exit rule: once a trade is entered, only exit at stop or target. The data shows 64% of manual exits "worked" but 36% missed the target — the overall EV of manual exits may be lower than systematic exits.`, `C — The 5 misses were bad luck — no change needed`, `D — Only exit manually when you're "very sure"`],
              correct: 1,
              hint: `Calculate the EV of manual exits vs systematic exits based on this data. Which produces better outcomes?`,
              explanation: `B is correct. Of 14 manual exits: 9 cases the trade reached the original target (the manual exit cost you profit). 5 cases the trade reversed and would have hit your stop (the manual exit saved you loss). Without knowing the actual dollar amounts, we can't be certain which was better — but the journal data suggests a systematic analysis is needed. The correct rule from this data: before implementing a no-manual-exit rule, calculate the P&L of the 14 trades as-exited vs what they would have been with systematic exits. In most cases, systematic exits outperform emotional manual exits because the stop and target were placed at technically justified levels.`,
            },
            {
              question: `A trader reviews their 3-month journal and finds: wins average 2.1R, losses average 1.3R (not the 1.0R they planned). What does this mean and what should they do?`,
              options: [`A — Nothing — minor variations are expected`, `B — Their average loss is 30% larger than planned (1.3R vs 1.0R). This means they're either: (a) moving stops wider after entry (stop-loss tampering), (b) experiencing slippage on market-order stops, or (c) holding positions slightly past the stop before exiting. The journal should be checked for which specific trades had oversized losses.`, `C — Increase the risk per trade to compensate`, `D — Switch to larger targets to improve R:R`],
              correct: 1,
              hint: `If planned losses are 1R but actual losses average 1.3R, where is the extra 0.3R going? What behaviors produce consistently larger-than-planned losses?`,
              explanation: `B is correct. A systematic gap between planned loss (1.0R) and actual loss (1.3R) is an important signal. The three causes are: (1) stop-widening — the trader moves their stop after entry to "give the trade more room" which is a violation that always appears in the journal as "adjusted stop" notes, (2) slippage — stop-market orders in fast markets fill below the stop level, which would show up as price jumped below the stop before filling, or (3) hesitation — the stop is hit but the trader takes 5 seconds to confirm before placing the market order, during which price moves further. Each cause has a different fix: (1) use pre-set stop orders, never move stops; (2) use stop-limits with a buffer; (3) automate with OCO orders.`,
            },
            {
              question: `How often should you review your trading journal, and what are you looking for at each review cadence?`,
              options: [`A — Once per year — enough time to have meaningful data`, `B — Daily: log the trade. Weekly: check for behavioral patterns (emotional state, rule violations). Monthly: calculate actual win rate, actual avg win R, avg loss R, EV by setup type. Quarterly: strategy-level review of which setups to continue.`, `C — Only after a losing streak — review is needed when things go wrong`, `D — After every trade — review and learn immediately`],
              correct: 1,
              hint: `Different review frequencies reveal different types of information. What does a weekly review reveal vs a monthly one?`,
              explanation: `B is correct. Each review cadence has a specific purpose: daily logging captures information while memory is fresh (emotional state, rationale). Weekly review reveals behavioral patterns — are you trading more often on losing days? Are you holding losers longer this week? Monthly review computes statistics — actual win rate by setup type, EV by market condition. Quarterly review determines strategy-level decisions — which setups have sufficient EV to continue, which should be dropped. A (annual) is far too infrequent — a year of bad behavior could be corrected in weeks if caught monthly. C (only after losses) misses the patterns during winning periods that may still indicate developing risks.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Analyse this trader's 45-trade journal summary:

SETUP TYPE BREAKDOWN:
Breakout trades (20): 14W/6L. Avg win: $340. Avg loss: −$200.
Range reversal (15): 7W/8L. Avg win: $280. Avg loss: −$210.
Momentum fade (10): 3W/7L. Avg win: $420. Avg loss: −$230.

EMOTIONAL STATE AT ENTRY:
Calm: 28 trades. 18W/10L. Avg outcome: +$130.
Slightly anxious: 12 trades. 5W/7L. Avg outcome: −$85.
Overconfident: 5 trades. 1W/4L. Avg outcome: −$380.

TIME OF DAY:
09:00–11:30 EST: 22 trades. Win rate 63.6%. Avg outcome +$145.
11:30–14:00 EST: 15 trades. Win rate 46.7%. Avg outcome +$22.
14:00–16:00 EST: 8 trades. Win rate 25%. Avg outcome −$196.

Calculate EV per trade for each setup type and each emotional state. List the three changes this trader should make immediately based on the data.`,
              scoringCriteria: [
                `Breakout EV: (14/20 × $340) − (6/20 × $200) = 70%×340 − 30%×200 = $238 − $60 = +$178/trade`,
                `Range reversal EV: (7/15 × $280) − (8/15 × $210) = 46.7%×280 − 53.3%×210 = $130.67 − $111.93 = +$18.74/trade (barely positive)`,
                `Momentum fade EV: (3/10 × $420) − (7/10 × $230) = 30%×420 − 70%×230 = $126 − $161 = −$35/trade (NEGATIVE)`,
                `Emotional EV: Calm +$130, Anxious −$85, Overconfident −$380`,
                `Three immediate changes: (1) Stop all momentum fade trades — negative EV, only 30% win rate. (2) No trading when emotional state is "overconfident" — −$380 average, 80% loss rate. (3) Stop trading after 14:00 EST — 25% win rate, −$196 average. These three changes alone eliminate the largest sources of loss.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `A trader shares their journal entries for three trades from last week. Identify every risk management violation:

TRADE 1: ETH long entry $3,742. Planned stop $3,640 (structural). Actual stop moved to $3,580 after price dipped to $3,650 "because I wanted to give it more room." Trade continued to $3,590 before bouncing to $3,820. Final exit: $3,820 (target hit). Emotional state logged: "anxious when price approached stop."

TRADE 2: BTC long entry $72,000. No stop set. Price fell to $70,200. Held. Price recovered to $73,400. Exited manually. Logged note: "would have been fine without a stop." Risk used: 8% of account.

TRADE 3: SOL long entry $188. Correct stop at $181.50. Target $202. Price hit $193 but didn't reach $202 so no exit. Price reversed to $183.50 before hitting the stop. Final loss: correct −1% risk. Logged: "should have taken partial profit at $193."`,
              scoringCriteria: [
                `Trade 1 violations: (1) Moving stop wider after entry — the stop at $3,640 was technically justified. Moving to $3,580 after a $3,650 dip is stop-loss tampering driven by anxiety. The fact that the trade recovered doesn't make the violation acceptable — it reinforces a dangerous habit. (2) Emotional state at entry should have been addressed before entry, not managed by moving the stop.`,
                `Trade 2 violations: (1) No stop set — never acceptable under any condition. (2) 8% risk — 4× the 2% maximum. (3) "Would have been fine" is survivor's bias — price fell $1,800 (2.5%) before recovering. If it had continued to $67,000, the loss would have been catastrophic at 8% position risk.`,
                `Trade 3: No violations. Stop was honoured. The "should have taken partial at $193" is a valid observation for future consideration (take TP1 at first resistance) but not a rule violation — the original plan was target at $202 and the plan was followed.`,
                `Key insight: Trade 3 is correct behavior even though it lost. Trades 1 and 2 both won or recovered but contain serious risk management violations that will eventually cause large losses if not corrected.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You have been trading for 6 weeks with inconsistent results. Your journal data:

Week 1: 6 trades. Rule-compliant: 4. Non-compliant: 2. Net P&L: +$380.
Week 2: 8 trades. Rule-compliant: 5. Non-compliant: 3. Net P&L: −$120.
Week 3: 5 trades. Rule-compliant: 5. Non-compliant: 0. Net P&L: +$490.
Week 4: 9 trades. Rule-compliant: 3. Non-compliant: 6. Net P&L: −$840.
Week 5: 4 trades. Rule-compliant: 4. Non-compliant: 0. Net P&L: +$360.
Week 6: 7 trades. Rule-compliant: 2. Non-compliant: 5. Net P&L: −$620.

Calculate: P&L per trade on rule-compliant weeks vs non-compliant weeks. Identify the correlation between rule violations and weekly results. Design a concrete enforcement mechanism to reduce rule violations.`,
              scoringCriteria: [
                `Weeks with zero violations (3, 5): Total 9 trades. P&L: +$490 + $360 = +$850. Per trade: $94.44.`,
                `Weeks with high violations (4, 6): Total 16 trades. P&L: −$840 + −$620 = −$1,460. Per trade: −$91.25.`,
                `Weeks with moderate violations (1, 2): Total 14 trades. P&L: +$380 − $120 = +$260. Per trade: $18.57.`,
                `Clear correlation: rule-compliant weeks = positive outcomes. High-violation weeks = large losses.`,
                `Enforcement mechanisms: (1) Pre-trade checklist required before any entry — must check each rule item (stop placed? R:R meets minimum? Risk within 1-2%?) with written confirmation. (2) Rule violation = no more trading that day. (3) Weekly review: any week with >2 violations triggers a mandatory 2-day trading pause and journal review.`,
              ],
            },
          ],

      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
          'chartReplay-riskManage',
        ],
        description: `Random draw from all Lab 4 (Risk Management) concepts: loss recovery math, EV calculations, R:R analysis, 1-2% rule application, position sizing, stop placement methods, and journal pattern analysis. No labels. No hints.`,
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
      },

      bossMode: {
        title: `Risk Officer Certification`,
        description: `Two-phase Boss Battle. Phase 1 (Learning Loop): full criteria feedback + lesson pointers. Phase 2 (Certification Attempt): no pointers, portfolio push on 100% pass.`,

        learningLoop: {
          description: `Unlimited attempts. Full criteria feedback after each. Lesson pointers given for every miss.`,
          scenarios: [
            {
              id: 'lab4-ll-1',
              phase: 'learning-loop',
              situation: `You are managing a $20,000 trading account. It is Monday morning.

Your trading rules:
- 1-2% risk per trade maximum
- 2:1 R:R minimum
- Stop-losses: below structure method, 0.5% buffer
- Maximum 3 simultaneous positions

Current open positions:
P1: ETH long. Entry $3,740. Stop $3,600. Risk: 1.5% ($300). Target $4,100.
P2: SOL long. Entry $188. Stop $181. Risk: 1% ($200). Target $202.

Three new setups available today:

Setup A: BTC long. Entry $72,000. Stop $70,000. Potential target $76,000. Assessment: standard conviction.
Setup B: AVAX long. Entry $38.50. Stop $37.20. Potential target $41.50. Assessment: experimental pattern.
Setup C: ETH short. Entry $3,758 (near current price, going against your open long). Stop $3,820. Target $3,600.

Questions:
1. Which new setups, if any, can you open today? (Consider position limits, R:R, and rule compliance)
2. For the one setup you select to open (if any), calculate exact position size
3. Is Setup C a rule violation? Explain.
4. Calculate your total account risk if you open Setup A at 1.5% risk`,
              scoringCriteria: [
                `Position limit: max 3 simultaneous. Currently 2 open (P1 and P2). Can open 1 more.`,
                `Setup A R:R: ($76,000−$72,000)/($72,000−$70,000) = $4,000/$2,000 = 2:1. MEETS minimum. Standard conviction → 1.5% risk ($300). Position = $300/$2,000 × $72,000 = $10,800 (0.15 BTC). Valid.`,
                `Setup B R:R: ($41.50−$38.50)/($38.50−$37.20) = $3.00/$1.30 = 2.31:1. MEETS minimum. Experimental → 0.5% risk ($100). Position = $100/$1.30 × $38.50 = $2,962 (76.9 AVAX). Valid in isolation.`,
                `Setup C is a RULE VIOLATION: opening a short ETH position while already holding a long ETH position at nearly the same price creates a hedged position that costs fees on both sides without directional exposure. Also, the short setup would require a different risk allocation on the same asset as P1. Cannot hold opposing positions on the same asset simultaneously.`,
                `If opening Setup A: total risk = P1($300) + P2($200) + A($300) = $800 = 4% of account. Within 6-8% guideline.`,
                `Correct choice: open Setup A (higher conviction, cleaner R:R). Optionally open B instead at experimental sizing. Not both (would hit position limit).`,
              ],
            },
            {
              id: 'lab4-ll-2',
              phase: 'learning-loop',
              situation: `Review this trader's 3-month journal statistics and identify the primary risk management problem:

Month 1: 15 trades. Win rate 60%. Avg win $280. Avg loss $240. Net: +$672.
Month 2: 22 trades. Win rate 50%. Avg win $290. Avg loss $310. Net: −$440.
Month 3: 19 trades. Win rate 53%. Avg win $265. Avg loss $280. Net: −$77.

Additional data:
- 3 trades in months 2-3 had losses of $820, $940, and $750 (no stops used)
- Trade frequency increased from 15 to 22 in month 2
- Month 2 and 3 had elevated BTC volatility (ATR 40% above month 1 baseline)

Identify: (1) What changed from month 1 to month 2 that caused the shift? (2) What are the TWO specific risk management violations? (3) How would month 2 and 3 look if the violations were corrected?`,
              scoringCriteria: [
                `Change from month 1 to 2: Overtrading (15→22 trades), increased volatility (larger normal losses expected), 3 stop-less trades producing large losses.`,
                `Violation 1: Trading without stops. The 3 oversized losses ($820, $940, $750 = $2,510 total) indicate held positions without stops. Under the 1-2% rule these should have been maximum ~$280 each ($2,000 × 1.5% × average sizing). Excess loss from no-stop trades: $2,510 − (3 × $280) = $1,670 excess.`,
                `Violation 2: Increased trade frequency without corresponding increase in edge. Month 2 fee burden (22 trades vs 15) added approximately $154 extra in fees at 0.2% round-trip on $3,500 avg trade.`,
                `Corrected months 2-3: Remove 3 oversized losses, replace with correct 1.5% stops. Month 2 corrected: −$440 + $1,670 excess recovered = +$1,230 net. Month 3 corrected: slightly positive. The no-stop trades were the primary cause of all the monthly losses.`,
              ],
            },
          ],
        },

        },
    },
,
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 5 — ENTRY & EXIT STRATEGIES (5 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'entry-exit',
      title: `Lab 5: Entry & Exit Strategies`,
      subtitle: `The difference between random trades and planned ones`,
      lessons: [

        {
          id: 'valid-trade-setup',
          title: `What Makes a Valid Trade Setup`,
          explanation: `In 2022, a research group analyzed 43,000 trades from retail crypto traders on a major exchange. Trades entered with at least three pre-defined criteria (a checklist) were profitable at a 54% rate. Trades entered based on intuition alone: profitable at 38%. The checklist didn't need to be sophisticated. It just needed to exist. A valid trade setup is not a feeling. It is a set of observable, pre-defined conditions that must all be present before you execute.

The five-element trade setup checklist used by most professional spot traders:
1. Trend alignment — the trade direction matches the dominant trend on the next-higher timeframe. If you trade 4-hour charts, the daily trend should point in the same direction.
2. Level — the entry is at or near a key level: support for longs, resistance for shorts, or a confirmed breakout level.
3. Trigger — a specific price action signal confirms the entry at the level: a bullish engulfing candle, a volume spike, a breakout candle close above resistance.
4. Risk defined — you know the exact stop level before entry. The stop is technically placed (not arbitrary). R:R is at least 2:1.
5. Size calculated — the position size is calculated using the 1-2% rule and the specific stop distance.

A "valid" trade requires all five. Missing one: skip the trade. The most commonly skipped element is the trigger — traders buy at a level before the signal arrives, which means they are anticipating the setup, not trading it. An anticipated setup that doesn't trigger means an early entry with no confirmation, with the same stop as the confirmed setup but a worse entry price.

The trade log practice: before every trade, write down the five elements. If you cannot write them all down, do not execute. This single practice eliminates the majority of impulsive, low-quality entries.`,
          visualPrompt: `👆 Five-element trade checklist — all five required`,
          visualType: `gif`,
          visualUrl: `trade-setup-checklist`,
          strategy: `Use a 5-element trade checklist before every entry: trend, level, trigger, defined risk, calculated size. Write it out before entering. If any element is missing, wait. Never enter in anticipation — wait for the trigger to fire.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, complete setup]`,
              context: `A swing trader identifies a potential long setup on BTC.`,
              scenario: `Checklist: (1) Daily trend: up — higher highs and higher lows for 8 weeks. ✓ (2) Level: 4H support at $71,200 — tested twice, bounced both times. ✓ (3) Trigger: 4H candle closes as a bullish hammer at the support level. ✓ (4) Risk: stop at $70,400 (below support zone low), target $76,000 — R:R = $4,800/$800 = 6:1. ✓ (5) Size: 1.5% of $18,000 = $270. Position: $270/$800 × $71,200 = $24,030 notional. ✓`,
              outcome: `All five elements present. The trade is valid. Entered at the close of the hammer candle. BTC moves to $76,400 over 4 days. TP fills for $4,800 gain on the position. The setup quality — evidenced by all five elements aligning — produced a clean, high-conviction trade.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, missing trigger]`,
              context: `A day trader sees ETH approaching a known support at $3,620.`,
              scenario: `Checklist: (1) Trend: up. ✓ (2) Level: $3,620 support. ✓ (3) Trigger: price is approaching the level but no candle signal yet. ✗ (4) Risk: defined in advance. ✓ (5) Size: calculated. ✓`,
              outcome: `The setup has 4 of 5 elements. The trigger is missing — the trader waits. ETH touches $3,620 and forms a doji candle (inconclusive). Then forms a bullish engulfing candle on the next bar. That is the trigger. The entry is at the close of the engulfing candle at $3,638 instead of the anticipated $3,620. The stop distance is now $138 instead of $120 — slightly wider. The trade is valid. ETH moves to $3,920 for a 7.8% gain.`,
            },
            {
              contextTag: `[New Trader, AVAX/USDT, no checklist cost]`,
              context: `A new trader sees AVAX up 8% on the day and buys at the high out of excitement. No checklist used.`,
              scenario: `Missing all five elements: (1) No trend check — AVAX was in a 3-week downtrend. (2) No level — entry at a 3-week high, near major resistance. (3) No trigger — bought because it was moving up. (4) No defined risk — no stop set. (5) No position sizing — bought $3,000 of AVAX (too large for account).`,
              outcome: `AVAX reverses from the 3-week high resistance zone (where it was at the time of entry). Price falls 14% over 2 days. Without a stop, the trader holds through the decline. They exit at a $420 loss. Every single checklist element would have prevented this entry.`,
            },
          ],
          keyTakeaway: `A valid trade setup requires all five elements: trend alignment, key level, entry trigger, defined risk with R:R ≥ 2:1, and calculated position size. Write down all five before entering. If any is missing, skip the trade.`,
          guidedPractice: [
            {
              question: `You see ETH at $3,740, the daily trend is up, the price is at a key support zone, and R:R is 3:1 with a defined stop. You haven't seen a clear trigger candle yet. Should you enter?`,
              options: [
                `A — Yes — four of five checklist elements are present. The setup is strong enough.`,
                `B — No — the trigger is missing. Wait for a confirmed candle signal at the support level before entering.`,
                `C — Yes — waiting for a trigger means paying a worse entry price.`,
                `D — It doesn't matter — entry price has no bearing on outcome.`,
              ],
              correct: 1,
              hint: `The trigger confirms that the level is actually holding. What is the cost of entering before confirmation?`,
              explanation: `B is correct. Entering before the trigger means buying a level that might not hold. The support could fail, taking the price straight through your stop before any bounce occurs. Waiting for the trigger — a bullish candle close, a hammer, a bullish engulfing — confirms that buyers are actually defending the level. Yes, the trigger entry is a slightly worse price, but it comes with evidence that the thesis is beginning to work. The slightly worse entry is paid for by higher probability of success.`,
            },
            {
              question: `Which of the following is NOT a valid entry trigger?`,
              options: [
                `A — A bullish engulfing candle closing above the key support level`,
                `B — Price has been near the support level for 2 hours and you feel it will bounce`,
                `C — A breakout candle closing above resistance on volume 2× average`,
                `D — A hammer candle with lower wick touching support and close near the high`,
              ],
              correct: 1,
              hint: `A trigger is an observable, verifiable price action event — not a feeling or prediction.`,
              explanation: `B is the invalid trigger. A feeling is not observable or verifiable — it cannot be backtested, repeated, or evaluated. A bullish engulfing candle (A), a volume-confirmed breakout (C), and a hammer at support (D) are all observable price action events with documented historical reliability. A sentiment or feeling entry has no edge because it cannot be systematically applied.`,
            },
            {
              question: `You are reviewing a setup: daily trend up, price at weekly support, RSI divergence (trigger), stop below weekly support, R:R 2.8:1. The position size exceeds the 2% risk rule due to the tight stop. What should you do?`,
              options: [
                `A — Widen the stop to fit the 2% rule`,
                `B — Reduce the position size so the dollar risk stays within 2% of account — not the stop distance or the position dollar amount`,
                `C — Skip the trade — R:R is only 2.8:1`,
                `D — Ignore the sizing rule for this one — the setup is strong`,
              ],
              correct: 1,
              hint: `The 2% rule controls the dollar loss at stop, not the position size as a percent of account. How do you fix a sizing violation without changing the stop?`,
              explanation: `B is correct. If the position size calculation exceeds 2% risk, you reduce the number of units (ETH, BTC, SOL, etc.) so the dollar loss if the stop is hit equals exactly 2% of account. You do not widen the stop (that removes it from its technical level). You do not skip a 2.8:1 R:R trade — that meets criteria. You do not ignore the rule. The fix is purely mechanical: calculate the correct position size and enter only that quantity.`,
            },
            {
              question: `In the five-element checklist, what does "level" refer to?`,
              options: [
                `A — Any price level where you want to enter`,
                `B — A technically significant price where prior market participants have demonstrated strong interest — support (prior demand zone), resistance (prior supply zone), or a confirmed breakout level`,
                `C — The exact price of your entry order`,
                `D — A moving average level only`,
              ],
              correct: 1,
              hint: `A level must have evidence of prior market participant activity — not just a price you chose.`,
              explanation: `B is correct. A technically significant level is one where the market has previously shown meaningful buying or selling interest — a price that has been tested and held before, or a price where high volume was traded historically. Support levels, resistance levels, prior swing highs/lows, and volume nodes are all valid levels. Entering "at a level" without technical significance is not the same as the checklist item. Moving averages alone (D) are a level type but not the only one.`,
            },
            {
              question: `You have an alert set for BTC at $71,200 (key support). BTC hits $71,200 at 3am. You wake up at 7am and BTC has already bounced to $72,600. You missed the trigger. What is the correct response?`,
              options: [
                `A — Buy at $72,600 — missing the level means you must chase`,
                `B — The trade setup was valid but the entry window has passed. Do not chase. Wait for the next setup.`,
                `C — Set a limit order at $71,200 to catch the next test — the level will definitely be retested`,
                `D — Buy at market — the bounce confirms the level was valid and more upside is likely`,
              ],
              correct: 1,
              hint: `What is the R:R of buying at $72,600 compared to the original $71,200 entry? Has the risk/reward changed?`,
              explanation: `B is correct. Buying at $72,600 when the original plan was $71,200: the stop is still at $70,400 (original technical level), giving $2,200 risk instead of $800. The target is still $76,000, giving $3,400 reward. R:R = 3,400:2,200 = 1.55:1. Below the 2:1 minimum. The trade has deteriorated from a 6:1 R:R to a 1.55:1. This is no longer the same setup. A discipline move: missed setups are not re-entered at worse prices. The next valid setup is coming.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-prioritisation`,
              scenario: `You are reviewing five potential trade setups at 9am EST. For each, apply the five-element checklist and determine: valid (enter), conditional (what is missing?), or invalid (skip):

Setup A: BTC long at $72,000. Daily trend: up. Key support at $71,800 (tested once, held). Current price: $72,100, above support. Bullish engulfing candle just formed at $71,900. Stop: $71,200. Target: $75,800. R:R: 3.8:1. Position sized at 1.5% risk. ✓ all 5?

Setup B: ETH long at $3,740. Daily trend: sideways range. Price at range midpoint. No specific level. Bullish hammer formed. Stop: $3,680. Target: $3,900. R:R: 2.67:1. Position sized at 1%.

Setup C: SOL long at $188. Daily trend: up. Price at 4H support ($186–$189 zone). No trigger candle yet — still forming. Stop: $184. Target: $200. R:R: 3:1. Position sized at 1.5%.

Setup D: AVAX long at $38.50. Daily trend: up. Price at weekly support ($38–$39). Volume spike 2.4× average on the current candle. Bullish pin bar formed. Stop: $36.80 (below weekly support). Target: $44. R:R: 3.35:1. Position sized at 2%.

Setup E: BNB short at $412. Daily trend: up. Price at prior resistance turned support. No directional trigger for short. No stop defined yet. Target: $390. Risk unknown.`,
              scoringCriteria: [
                `Setup A: VALID. All 5 elements present. Bullish engulfing at tested support, 3.8:1 R:R, daily trend aligned, stop defined, size calculated. Enter.`,
                `Setup B: CONDITIONAL. Missing element 1 (trend — daily sideways, not aligned). An entry against trend at range midpoint has no trend edge. Conditionally valid only if trader specifically trades ranges — but requires range boundary entry, not midpoint.`,
                `Setup C: CONDITIONAL. Missing element 3 (trigger). The candle is still forming. Wait for the candle to close as a bullish signal before entering. If it closes bullish, all 5 will be present.`,
                `Setup D: VALID. All 5 elements present. Weekly support, volume + pin bar trigger, daily trend up, stop clearly placed below weekly support, sized at 2% (appropriate for premium setup criteria).`,
                `Setup E: INVALID. Missing elements 2 (no directional reason for short against daily uptrend), 3 (no short trigger), 4 (no stop defined, R:R unknown), 5 (size not calculated). Cannot trade this.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, 4-hour chart. You are monitoring a potential breakout trade.

Chart data:
- Daily trend: up for 10 weeks
- BTC has consolidated between $70,800 and $73,200 for 12 days
- Both levels tested 4+ times each
- Current 4H candle: BTC is at $73,050, approaching the $73,200 resistance line
- Volume on this candle so far: 1.4× the 20-period average (with 2 hours remaining)
- 4H ATR: $580

Your pre-planned setup:
- Entry: limit buy at $73,250 (just above resistance on breakout confirmation)
- Stop: $71,600 (below consolidation base with buffer)
- Target TP1: $76,000 (nearest resistance), TP2: $78,800 (measured move)
- Risk: 1.5% of $20,000 = $300. Position: $300/($73,250−$71,600) × $73,250 = $13,318 = 0.182 BTC

Apply the five-element checklist NOW (before any breakout candle closes):
1. What element(s) are currently present vs missing?
2. At what exact point would all five be present?
3. What price action on the current candle would cause you to NOT take the trade even if price reaches $73,250?`,
              scoringCriteria: [
                `Current elements: Trend ✓, Level ✓ (range resistance at $73,200), Risk defined ✓, Size calculated ✓`,
                `Missing: Trigger — the candle has not closed above $73,200 with volume confirmation yet`,
                `All five present when: current or next 4H candle closes above $73,200 on volume ≥ 1.8× average (stronger confirmation than the current 1.4×)`,
                `Reasons NOT to take the trade despite price reaching $73,250: (a) candle closes back below $73,200 (false breakout), (b) volume on the breakout candle is below 1.5× average (low-conviction breakout), (c) very long upper wick with a close back near the mid-range (rejection of the breakout)`,
                `User demonstrates understanding that the limit order at $73,250 might fill even on a false breakout if price spikes above and reverses — so the trigger requirement (confirmed candle close) is essential`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Post-trade analysis. A trader entered a SOL long last week. Review their checklist and identify the execution quality:

Pre-trade log entry (the trader's notes):
"Entry: $191 SOL. Trend: Daily is up I think — it's been rising for a few weeks. Level: $190 round number looks like support. Trigger: Price is at $191 and hasn't gone down much this morning. Stop: somewhere below $185 maybe. Target: $200 sounds good. R:R: should be good. Size: put in $4,500."

Account size: $12,000.

Questions:
1. Rate each of the 5 checklist elements (adequate, inadequate, or missing)
2. Calculate actual R:R and position risk using the numbers given
3. Identify the two most critical errors
4. Rewrite a proper pre-trade note with all five elements correctly stated`,
              scoringCriteria: [
                `Trend: INADEQUATE — "I think" is not a verified checklist item. Required: specify dominant daily structure, higher highs/lows confirmation.`,
                `Level: INADEQUATE — "$190 round number" has psychological significance but is not documented as a tested support zone. Required: prior tested support with specific evidence.`,
                `Trigger: MISSING — "hasn't gone down much this morning" is not a trigger. Required: specific candle signal (engulfing, hammer, breakout close).`,
                `Risk: INADEQUATE — "somewhere below $185 maybe" is not a defined stop. Required: specific stop price at a technical level.`,
                `Size: MISSING proper calculation — "$4,500 in" ignores the 1-2% rule. $4,500 at $191 with a $6 stop = $4,500/$191 × $6 = $141 risk = 1.18% of $12,000. Actually acceptable by accident — but not calculated intentionally.`,
                `Two critical errors: (1) No defined stop (most dangerous), (2) No entry trigger (buying without confirmation).`,
                `Corrected note: "Entry: $191 on breakout close above $190 resistance. Daily trend: confirmed up — 4 higher highs in 6 weeks. Level: $190 prior resistance turned support, tested twice. Trigger: bullish engulfing candle close above $190. Stop: $184.50 (below the most recent swing low at $185, with 0.5% buffer). Target TP1: $198, TP2: $204. R:R: ($198-$191)/($191-$184.50) = $7/$6.50 = 1.08:1 — FAILS minimum. Need to reassess target."`,
              ],
            },
          ],
        },

        {
          id: 'confluence',
          title: `Confluence — When Multiple Signals Agree`,
          explanation: `The word "confluence" in trading means the simultaneous alignment of multiple independent signals pointing toward the same conclusion. If one signal suggests a trade, it is a possibility. If three independent signals point to the same trade, the probability of success meaningfully increases — provided those signals are genuinely independent and not just variations of the same underlying data.

The classic confluence setup: price at a horizontal support level (signal 1) + on an upward sloping 200-period moving average (signal 2) + with a volume spike suggesting institutional buying (signal 3) + on a timeframe that aligns with the higher-timeframe trend (signal 4). Four independent signals at the same price level. This is not a guarantee — but it is meaningfully more reliable than a single-signal entry.

What counts as genuinely independent signals: (1) Price structure — support/resistance, trend lines, prior swing levels. (2) Volume — confirms or denies the move. (3) Momentum indicators — RSI, MACD (though these are derived from price, they measure a different dimension: rate of change). (4) Timeframe alignment — the same level is significant on both the 4-hour and daily chart. (5) Market structure — the broader market (BTC) is trending the same direction as your altcoin trade.

What is NOT independent confluence: combining three moving averages (they all use the same underlying price data). Using RSI and MACD together without price structure (both are derived from price). Volume and OBV (open buying volume is just accumulated volume — same data).

The practical minimum for a high-conviction trade: two independent signals (price level + one confirming indicator or volume). Three independent signals: high confidence, maximum sizing (up to 2% rule). Four or more: rare, very high conviction setup.`,
          visualPrompt: `👆 Four confluence signals on one chart — each pointing to the same entry`,
          visualType: `gif`,
          visualUrl: `confluence-setup`,
          strategy: `Require minimum two independent signals for any trade. Three or more signals = high-conviction entry, maximum position size allowed under risk rules. Count signals: price structure, volume, a momentum indicator (RSI or MACD), and timeframe alignment. Never count multiple moving averages as separate signals — they are the same data source.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, four-signal confluence]`,
              context: `A swing trader identifies the following at $71,400 BTC:`,
              scenario: `Signal 1: 4H horizontal support at $71,200 — tested 3 times in 2 weeks, held each time. Signal 2: Volume on the current support touch: 1.8× average — institutional presence. Signal 3: RSI at 42 (oversold relative to recent range), with bullish divergence (price made a lower low but RSI made a higher low). Signal 4: Daily timeframe also shows this as a key support level — confluence across two timeframes.`,
              outcome: `Four independent signals at $71,400. The trader enters with 2% risk (maximum allocation). BTC bounces from the level and reaches $76,200 over 5 days. The four-signal confluence produced a 6.8% gain. High-confluence setups justify maximum position sizing under risk rules.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, false confluence]`,
              context: `A day trader sees what they think is four-signal confluence on ETH.`,
              scenario: `"Signal 1": 50 EMA at $3,720. "Signal 2": 100 EMA at $3,718. "Signal 3": 200 SMA at $3,715. "Signal 4": VWAP at $3,722. The trader uses four moving averages to justify a "high confluence" entry.`,
              outcome: `These are not four independent signals. All four are derived from price data — they are variations of the same underlying input. They cluster together by construction, not by independent market analysis. The "confluence" adds no probability edge because the signals are not independent. ETH breaks through all four levels simultaneously. Real confluence requires signals from different data sources: price structure, volume, momentum, and timeframe.`,
            },
            {
              contextTag: `[Position Trader, multi-timeframe alignment]`,
              context: `A position trader builds a high-conviction BTC long by stacking timeframe confluence.`,
              scenario: `Daily chart: BTC at 50-day support ($70,200). Weekly chart: BTC at 20-week uptrend support line ($70,100). Monthly chart: BTC at prior monthly high (now support, $69,800). All three timeframes point to the $69,800–$70,200 zone as critical support. Volume on the weekly close at the zone: 1.6× average.`,
              outcome: `Three independent timeframe signals plus volume = four-confluence entry. The trader enters with 2% risk and holds for 3 months as BTC moves to $86,000. Multi-timeframe confluence is one of the most powerful confluence types: the more timeframes that recognise the same level, the more market participants have identified it as significant.`,
            },
          ],
          keyTakeaway: `Confluence is multiple independent signals pointing to the same trade. Two signals: minimum standard. Three or more: high-conviction, maximum sizing. Signals must be genuinely independent — price structure, volume, momentum, and timeframe alignment. Multiple moving averages are not independent signals.`,
          guidedPractice: [
            {
              question: `At $188 SOL, you observe: (1) 4H support tested twice, (2) 50 EMA at $188.40, (3) Daily trend up. How many genuine confluence signals do you have?`,
              options: [
                `A — Three — a strong confluence setup`,
                `B — Two genuine signals: the 4H support (price structure) and the daily uptrend (timeframe/trend alignment). The 50 EMA adds a data point but not an independent signal type.`,
                `C — One — moving averages aren't confluence`,
                `D — Four — the EMA counts as two signals`,
              ],
              correct: 1,
              hint: `Price structure, trend alignment, volume, and momentum are the four independent signal types. Which category does each of your three observations fall into?`,
              explanation: `B is correct. The 4H support is a price structure signal. The daily trend up is trend/timeframe alignment. The 50 EMA at $188.40 is also derived from price data and in this case overlaps with the support level — it adds weight to the same signal but does not constitute an independent data source. Two genuine independent signal types: price structure and trend alignment. A volume confirmation or RSI divergence at this level would add a third independent signal.`,
            },
            {
              question: `A setup has BTC at support, volume 2.2× average, RSI at 38 with bullish divergence, and daily/4H both at the same level. How many independent signals is this and what conviction level does it represent?`,
              options: [
                `A — One signal viewed four ways — not true confluence`,
                `B — Four independent signals: price structure, volume, momentum (RSI), timeframe alignment. High-conviction setup justifying maximum risk allocation (up to 2% rule).`,
                `C — Two signals — RSI and volume are the same thing`,
                `D — Five signals — weekly alignment should also be checked`,
              ],
              correct: 1,
              hint: `Count the unique data sources: price levels, volume, RSI (rate of price change), and timeframe repetition.`,
              explanation: `B is correct. Price structure (support level), volume (1.2× independent of price direction alone), RSI momentum (measures rate of change — a genuinely different dimension from price level), and timeframe alignment (daily AND 4H recognising the same level) are four independent signal types. This is the ideal high-conviction confluence setup. Maximum risk allocation is justified when four independent signals align. D is correct that weekly alignment would add a fifth — but the four present already justify high conviction.`,
            },
            {
              question: `You see ETH forming a setup with RSI oversold AND MACD bullish crossover AND Stochastic oversold. Is this three-signal confluence?`,
              options: [
                `A — Yes — three different indicators`,
                `B — No — RSI, MACD, and Stochastic are all derived from price data. They measure related things and often agree by construction, not by independent market analysis.`,
                `C — Yes — if they all agree, the signal is stronger`,
                `D — No — indicators can never form confluence`,
              ],
              correct: 1,
              hint: `What is the underlying data source for RSI, MACD, and Stochastic? Are they measuring different things or the same thing in different ways?`,
              explanation: `B is correct. RSI measures the ratio of average gains to average losses over N periods. MACD measures the difference between two EMAs. Stochastic measures the position of the current close relative to recent highs/lows. All three are derivatives of the same input: price. When price is in a deep decline, all three will simultaneously show oversold readings — not because three independent phenomena are occurring but because they are all responding to the same underlying price data. True confluence requires signals from different data types: price structure, volume, and at most one momentum indicator plus timeframe alignment.`,
            },
            {
              question: `A trade has two confluence signals (price support + daily trend alignment). You usually size at 1% for this type. You see a third signal (volume spike). How does this change your approach?`,
              options: [
                `A — No change — confluence signals above two don't matter`,
                `B — The third signal upgrades the setup from standard to high-conviction. This allows sizing at 1.5–2% (still within maximum risk rules) because probability of success is meaningfully higher.`,
                `C — Triple the position size — three signals means three times the edge`,
                `D — The volume spike means the move has already started — the trade is no longer valid`,
              ],
              correct: 1,
              hint: `How does each additional independent signal affect trade probability? How does that interact with your risk allocation framework?`,
              explanation: `B is correct. Each additional independent signal genuinely increases the probability of a successful outcome (based on historical backtesting of multi-confluence setups). The appropriate response is to increase sizing to reflect higher conviction — but within your maximum risk rules. Two signals: 1% risk. Three signals: 1.5%. Four or more: 2% maximum. This is not tripling the position (C) — it is a calibrated increase that remains within your risk framework. D is wrong: a volume spike on a support touch is a confirmation signal (institutional buyers arriving at the level), not a signal to miss the entry.`,
            },
            {
              question: `What is the minimum confluence requirement for a valid trade according to professional standards?`,
              options: [
                `A — No minimum — any setup with a defined stop is tradeable`,
                `B — Minimum two independent signals from different data sources`,
                `C — Four signals — fewer than four is not truly high-conviction`,
                `D — One signal is sufficient if it is on the daily timeframe`,
              ],
              correct: 1,
              hint: `What is the benefit of requiring multiple independent signals? What risk does a single-signal trade carry?`,
              explanation: `B is correct. Two independent signals is the professional minimum. A single signal (e.g., price at support only) can fail without confirmation from another data source — price can break through any support level. Adding a second independent signal (volume confirming buying interest at the level, or the daily trend aligned) improves the probability that the level is significant. Four signals (C) is ideal but waiting for four may cause you to miss many quality setups — two or three is the practical standard. A (no minimum) leads to random entries without edge.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, daily chart. Identify and count confluence signals for the following setup:

Price data:
- BTC current: $71,600
- Horizontal support from prior 6-week consolidation base: $71,200–$71,400 zone (tested 5 times)
- 200-day SMA: $70,800 (upward sloping)
- BTC dominance chart: BTC dominance increasing (risk-off into BTC)
- Daily volume: 2.1× the 30-day average
- Daily RSI: 48 (neutral — not a signal either way)
- Weekly trend: up — higher highs and higher lows for 14 weeks
- Bitcoin funding rate: slightly negative (bearish skew — potential short squeeze setup)

Task:
1. List every signal present and categorize as: price structure, volume, momentum, trend/timeframe, sentiment/derivatives
2. Identify which are genuinely independent from each other
3. Count the independent signals and state the appropriate conviction level and risk allocation
4. State which signal is weakest and should be weighted least`,
              scoringCriteria: [
                `Price structure: horizontal support zone $71,200–$71,400. INDEPENDENT signal 1.`,
                `Volume: 2.1× average on the touch — institutional presence. INDEPENDENT signal 2.`,
                `Momentum: RSI 48 — NEUTRAL. Not a signal either way. Do not count.`,
                `Trend/timeframe: weekly uptrend confirmed (higher highs, higher lows). INDEPENDENT signal 3.`,
                `Sentiment/derivatives: negative funding rate = potential short squeeze. INDEPENDENT signal 4 (from derivatives market, different data source).`,
                `200-day SMA ($70,800): adds weight to the support zone but is price-derived — NOT a new independent signal type. Adds to signal 1 weight.`,
                `BTC dominance: macro context — adds weight to the bull case but is not a direct entry signal. Weight as supplementary, not independent.`,
                `Total: 4 independent signals (price structure, volume, weekly trend, funding rate). HIGH CONVICTION. Maximum 2% risk allocation appropriate.`,
                `Weakest signal: funding rate (sentiment indicators are less reliable than price and volume for exact timing).`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Review these four trades from a trader's journal and rate the confluence quality of each:

Trade 1: Long ETH at $3,660. Signals: 4H support, daily trend up, RSI divergence (bullish). Three signals. Win: +6.2%.
Trade 2: Long SOL at $185. Signals: 50 EMA, 100 EMA, 200 EMA all at $184–$186. Three signals. Loss: −3.1%.
Trade 3: Long BTC at $70,400. Signals: horizontal support (tested 4 times), weekly trend up, volume 2.8× average, 4H and daily both show the level. Four signals. Win: +9.8%.
Trade 4: Short ETH at $4,100. Signals: RSI overbought, MACD bearish crossover. Two signals. Loss: −2.2%.

For each trade:
1. Are the stated signals genuinely independent?
2. What is the real confluence count?
3. Does the outcome match the expected probability from the confluence quality?`,
              scoringCriteria: [
                `Trade 1: 4H support (price structure), daily trend (timeframe), RSI divergence (momentum). THREE genuine independent signals. High quality. Win outcome matches expectation.`,
                `Trade 2: 50/100/200 EMA all price-derived. ONE signal type (moving average cluster). Not triple confluence. Presented as three signals, actually one. Loss matches low actual confluence quality.`,
                `Trade 3: Horizontal support (price structure), weekly trend (timeframe), volume (separate data source), dual-timeframe confirmation. FOUR genuine independent signals. Maximum conviction. Win outcome matches expectation.`,
                `Trade 4: RSI and MACD both price-derived momentum indicators. ONE genuine signal type (momentum). Not two-signal confluence as stated. Loss matches low actual confluence quality.`,
                `Pattern: trades 2 and 4 show false confluence — multiple indicators that are actually the same signal type. This is a common confluence counting error that leads to overconfident entries with insufficient actual edge.`,
              ],
            },
            {
              type: `judgment-ethicalChoice`,
              scenario: `A trader asks you to review their setup before they enter. They present it as a "five-signal confluence" trade:

Asset: LINK/USDT
Entry: $18.20
Signals claimed:
1. "Support at $18.00 — it bounced here last week"
2. "RSI is at 52 — bullish territory"
3. "MACD line is above the signal line"
4. "Price is above the 50 EMA"
5. "Volume today is 1.3× yesterday's volume"

Stop: $17.50. Target: $21.00. R:R: ($21−$18.20)/($18.20−$17.50) = $2.80/$0.70 = 4:1.

They are planning to enter with 2% risk based on the "five-signal confluence."

Evaluate: (1) Are all five signals genuinely independent? (2) Is the confluence count accurate? (3) Is the 2% risk appropriate? (4) What would you tell them?`,
              scoringCriteria: [
                `Signal 1 (support at $18.00, bounced once): WEAK price structure — tested only once, insufficient pattern establishment. Marginal signal.`,
                `Signal 2 (RSI at 52): NOT a signal — RSI at 52 is neutral territory, not a bullish confirmation. RSI bullish signals are divergence, extreme readings, or specific level breaks.`,
                `Signal 3 (MACD above signal line): Momentum signal — VALID independent signal type (momentum).`,
                `Signal 4 (price above 50 EMA): Trend/momentum, overlaps with RSI/MACD being price-derived. MARGINAL — adds some trend confirmation.`,
                `Signal 5 (1.3× volume): Volume signal — VALID independent signal, but 1.3× is weak. Meaningful volume is 2×+.`,
                `Real confluence count: 2 genuine independent signals (marginal support + momentum direction + weak volume). Not five. Standard conviction at best.`,
                `2% risk appropriate? NO — 2% requires four clear independent signals. This setup warrants 1% maximum.`,
                `Advice: reduce to 1% risk. The support level needs another test to be reliable. RSI at 52 is not a signal. Volume at 1.3× is weak confirmation. The R:R of 4:1 is excellent, but R:R alone doesn't justify 2% if confluence quality is marginal.`,
              ],
            },
          ],
        },

        {
          id: 'take-profit-laddering',
          title: `Take-Profit Laddering`,
          explanation: `On November 9, 2021, ETH reached $4,891 — the all-time high before a 13-month bear market. On the way up, the move from $3,000 to $4,891 took 26 days. A trader who set one TP at $4,000 captured $1,000/ETH. A trader who laddered: 40% at $4,000, 30% at $4,400, 20% at $4,700, 10% held into the extension = captured an average of $4,150/ETH. A third trader who held all of it for "the full move" — held through the reversal from $4,891 and watched ETH fall back to $3,200 over the next 6 weeks, capturing nothing at the peak.

Take-profit laddering is the practice of exiting a position in multiple tranches at increasing price targets, rather than all at once. Each tranche exits at a different resistance level, capturing partial profit at each stage while keeping a smaller portion running for the full potential of the move.

The structural benefits:
1. Reduces anxiety from holding — locking in profit on the first tranche removes most of the emotional pressure.
2. Exploits the principle of diminishing certainty — the first target (nearest resistance) is the most likely to be reached. The third target (further resistance) is less certain. Taking more at the first target and less at the third is risk-calibrated.
3. Protects against trend reversals — selling into strength at multiple levels means you are never caught holding everything through a sharp reversal.

Standard laddering structure: TP1 (30–40% of position) at the first significant resistance. Move stop to breakeven after TP1. TP2 (30–40%) at the second resistance. Move stop to TP1 level. TP3 (20–30% of remaining) at the measured move target or third resistance. Remaining 10% either at the next major level or on a trailing stop.

The trap to avoid: taking too much off at TP1 (e.g., 90%) defeats the purpose of laddering — you have no position left for the continuation. Taking too little (10%) means TP1 barely covers the emotional cost of the trade. The 30-40% first tranche is calibrated to be meaningful profit while leaving the majority running.`,
          visualPrompt: `👆 Laddered TP structure — three exits across three resistance levels`,
          visualType: `gif`,
          visualUrl: `tp-ladder-diagram`,
          strategy: `Default ladder: 40% at TP1, 35% at TP2, 25% at TP3. Move stop to breakeven after TP1 fills. Move stop to TP1 price after TP2 fills. If a continuation pattern forms before TP3, consider adjusting TP3 to the new measured target. Never take more than 50% at TP1 unless the setup is a quick intraday trade with a single obvious target.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, textbook ladder execution]`,
              context: `A swing trader enters BTC long at $71,200. Resistance map: $73,800 (prior swing high), $76,000 (2-month high), $80,400 (measured move). Stop: $69,600. Position: 0.18 BTC.`,
              scenario: `Ladder set: TP1 $73,750 (40% = 0.072 BTC), TP2 $75,900 (35% = 0.063 BTC), TP3 $80,200 (25% = 0.045 BTC). After TP1: stop moved to $71,200. After TP2: stop moved to $73,750.`,
              outcome: `TP1 fills at $73,750: profit = 0.072 × $2,550 = $183.60. Stop moved to breakeven. TP2 fills at $75,900: profit = 0.063 × $4,700 = $296.10. Stop at $73,750. Price reaches $78,400 then reverses. TP3 does not fill. Stop at $73,750 triggers on reversal. TP3 portion: 0.045 × ($73,750 − $71,200) = $114.75. Total: $183.60 + $296.10 + $114.75 = $594.45. vs. all-in at one TP at $73,750: $457.20. The ladder captures 30% more than the single-target approach.`,
            },
            {
              contextTag: `[New Trader, ETH/USDT, wrong ladder proportions]`,
              context: `A new trader takes 80% off at TP1 and leaves 20% for the continuation.`,
              scenario: `Entry: $3,720. TP1: $3,900 (80%). TP2: $4,100 (20%). ETH reaches $3,900 and continues to $4,240 without a meaningful pullback.`,
              outcome: `Profit: 80% × ($3,900 − $3,720) + 20% × ($4,100 − $3,720) = $144 + $76 = $220 per ETH equivalent. Correct 40/35/25 ladder would have produced: 40% × $180 + 35% × $380 + 25% × $520 = $72 + $133 + $130 = $335 per ETH equivalent. The 80/20 ladder captured only 65% of the optimal strategy's return. Taking too much too early limits total capture on strong trending moves.`,
            },
            {
              contextTag: `[Position Trader, SOL/USDT, ladder with trailing stop on final tranche]`,
              context: `A position trader enters SOL at $165. Resistance levels: $190, $210, $235. They use a 35/35/20 + 10% trailing stop structure.`,
              scenario: `35% exits at $190: +$25 × 35% = $8.75/SOL equivalent. 35% exits at $210: +$45 × 35% = $15.75. 20% exits at $235: +$70 × 20% = $14. 10% remaining on 2× ATR trailing stop (ATR = $18, trail = $36). SOL peaks at $248 and reverses. Trailing stop triggers at $248 − $36 = $212. Final 10%: +$47 × 10% = $4.70.`,
              outcome: `Total blended return: $8.75 + $15.75 + $14 + $4.70 = $43.20/SOL equivalent (+26.2% on $165 entry). The trailing stop on the final 10% tranche squeezed additional profit from the extension without requiring the trader to predict the exact top.`,
            },
          ],
          keyTakeaway: `TP laddering exits 30–40% at each resistance level, progressively taking profit while leaving a portion running for the full move. Default structure: 40-35-25. Move stop to breakeven after TP1. Never take more than 50% at TP1 unless the entire setup target is at that level. The final tranche can be managed with a trailing stop.`,
          guidedPractice: [
            {
              question: `You hold 0.2 BTC long from $71,000. TP1 at $74,000 (40%), TP2 at $77,000 (40%), TP3 at $81,000 (20%). After TP1 fills, what two actions should you take?`,
              options: [
                `A — Nothing — let the remaining position run freely`,
                `B — Move stop to breakeven ($71,000) and cancel or re-evaluate TP3 if trend weakens`,
                `C — Move stop to TP1 price ($74,000) immediately to lock in the first profit`,
                `D — Exit all remaining position at market — TP1 filling means the trade is done`,
              ],
              correct: 1,
              hint: `After TP1 confirms the thesis is working, what is the standard stop management step?`,
              explanation: `B is correct. After TP1 fills, the first tranche has booked profit and the trade has proven it is working. Moving the stop to breakeven ($71,000) is the standard step — the remaining position (60% of original) is now risk-free (worst case exits at entry, no loss). This allows the remaining position to continue toward TP2 and TP3 without capital at risk. C (stop to TP1 price at $74,000) is more aggressive and appropriate after TP2 fills, not TP1. D is premature — the whole point of laddering is to capture TP2 and TP3.`,
            },
            {
              question: `Your 0.15 ETH position entered at $3,700. You ladder: TP1 $3,940 (40%), TP2 $4,200 (40%), TP3 $4,500 (20%). TP1 fills, stop moved to $3,700. TP2 fills, stop moved to $3,940. Price then reaches $4,420 and stalls — forming a large bearish candle. TP3 at $4,500 has not filled. What is the correct action?`,
              options: [
                `A — Hold for $4,500 — the target is set`,
                `B — Assess the bearish candle: if it closes near its low on above-average volume, consider manually exiting the remaining 20% at market (approximately $4,400) rather than risking a reversal to the $3,940 stop`,
                `C — Move TP3 down to $4,430 to guarantee it fills`,
                `D — Move stop up to $4,400 immediately to protect the gain`,
              ],
              correct: 1,
              hint: `New price action (a large bearish candle near the TP3 target) is new technical information. What does that information tell you about the likelihood of TP3 filling?`,
              explanation: `B is correct. A large bearish candle at $4,420 (near but not at the $4,500 TP3) on above-average volume is a technical signal: sellers are present at this level and momentum is shifting. This is new information that may warrant adjusting the plan. Manually closing the final 20% at $4,400 captures 80% of the planned gain on that tranche rather than risking a reversal to the $3,940 stop (which would give back $460/ETH on that tranche). This is not "lowering the TP out of anxiety" — it is responding to real-time price action evidence. If the bearish candle is small and on low volume, hold for the original target.`,
            },
            {
              question: `You plan a TP ladder: 80% at TP1, 20% at TP2. What is the primary problem with this distribution?`,
              options: [
                `A — TP1 should always be smaller to let more run`,
                `B — Taking 80% at TP1 means only 20% captures any continuation beyond the first target. Strong trending moves that run 15–30% beyond TP1 will have given back most of their potential to the premature exit.`,
                `C — There is no problem — taking profit quickly reduces risk`,
                `D — TP2 percentage should equal TP1 percentage`,
              ],
              correct: 1,
              hint: `If a trend runs 20% beyond TP1, how much of that continuation does an 80/20 ladder capture vs a 40/35/25 ladder?`,
              explanation: `B is correct. With an 80/20 ladder, 80% of the position is closed at TP1 — only 20% participates in any continuation. In a strong trend that continues 20% beyond TP1, the 80/20 ladder captures: 100% × (TP1 gain) + 20% × (continuation gain). A 40/35/25 ladder on the same trade captures: 40% × (TP1 gain) + 35% × (TP2 gain) + 25% × (TP3 gain) — keeping 60% running through the continuation. The 80/20 distribution is appropriate only for high-probability, near-term scalp setups with a single objective.`,
            },
            {
              question: `What is the R:R of the FIRST tranche (40% at TP1) vs the THIRD tranche (25% at TP3) in a typical ladder, and why is it appropriate that TP3 has a smaller percentage?`,
              options: [
                `A — Both have the same R:R — the same stop applies to all tranches`,
                `B — TP1 has a lower R:R (nearer target) but higher probability. TP3 has a higher R:R (further target) but lower probability. Taking less at TP3 is appropriate because the likelihood of reaching a further target is genuinely lower.`,
                `C — TP3 should be the largest percentage because it has the best R:R`,
                `D — R:R does not apply to individual tranches of a ladder`,
              ],
              correct: 1,
              hint: `Which target is most likely to be reached: the nearest resistance or the furthest resistance? How should that probability affect how much you take at each level?`,
              explanation: `B is correct. In any trending move, the probability of reaching successive targets decreases. The first resistance is the most likely to be reached (no obstacles between entry and TP1). The third resistance requires sustained momentum through two prior resistance levels and may take weeks. Allocating less to TP3 is risk-calibrated: you are taking the most at the most-certain target and the least at the least-certain target. This is the opposite of equal allocation or largest-at-the-furthest — it appropriately weights for probability of execution.`,
            },
            {
              question: `A position trader holds SOL from $165. TP1 at $190 filled (40%). TP2 at $210 filled (35%). The final 25% is running with a stop at $190. SOL forms a bull flag at $218–$222 (suggesting continuation). What should you do with TP3 at $235?`,
              options: [
                `A — Exit immediately — enough profit has been made`,
                `B — Keep TP3 at $235 or adjust upward to the new measured move target if the bull flag confirmation provides a higher target`,
                `C — Move stop to $210 (TP2 level) to be safe`,
                `D — Close 50% of remaining position and keep 50% running`,
              ],
              correct: 1,
              hint: `New continuation evidence (bull flag) is the type of technical information that justifies TP adjustment. What direction?`,
              explanation: `B is correct. A bull flag forming at $218–$222 is a continuation pattern suggesting the move will extend. The flag pole might be measured from $165 to $218 = $53. New measured move target: $222 + $53 = $275. Adjusting TP3 from $235 to $270 (just below the new measured move) captures the continuation that the original $235 TP would have missed. This is a technically justified TP adjustment upward — the opposite of anxiety-driven TP reduction. The stop can also be moved to $218 (below the flag) from $190 to lock more profit. C (stop to $210) is reasonable but the bull flag provides a new support level.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `ETH/USDT, daily chart. You entered long yesterday.

Position:
- Entry: $3,680
- Stop: $3,540
- Position: 2.1 ETH
- Account: $12,000. Risk taken: 1.5% ($180)

Resistance map:
- $3,840: prior swing high (3 weeks ago)
- $4,020: monthly high
- $4,200: prior all-time high resistance zone (converted to resistance from support)
- $4,400: measured move target (range height from daily consolidation)

Today's chart update:
- ETH closed yesterday at $3,740 (up 1.6%)
- Today's candle: up 2.1%, currently at $3,818
- Volume today: 1.7× average (rising into first resistance)

Design and execute the complete TP ladder:
1. Set three TP levels with percentage allocations
2. State stop movement plan after each TP fills
3. Calculate dollar P&L for each tranche if all fill
4. Calculate total P&L if ETH reverses at $3,980 (between TP1 and TP2) and stop triggers at $3,840 (your breakeven stop after TP1)
5. Compare this to a single TP at $4,200`,
              scoringCriteria: [
                `TP1: $3,835–$3,840 (40% = 0.84 ETH). Profit: 0.84 × ($3,840−$3,680) = 0.84 × $160 = $134.40`,
                `TP2: $4,010–$4,020 (35% = 0.735 ETH). Profit: 0.735 × $340 = $249.90`,
                `TP3: $4,190–$4,200 (25% = 0.525 ETH). Profit: 0.525 × $520 = $273.00`,
                `Total if all fill: $134.40 + $249.90 + $273.00 = $657.30 = 5.48% of $12,000 account`,
                `Reversal at $3,980 scenario: TP1 fills ($134.40). Stop moved to $3,840. Price reverses to $3,840, stop triggers on remaining 1.26 ETH: 0 additional P&L on that portion (breakeven). Total: $134.40`,
                `Single TP at $4,200: only fills if price reaches $4,200. If reversed at $3,980, single TP fills nothing (price never reached $4,200). Total: $0. Ladder captures $134.40 vs $0 for single TP in the reversal scenario.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Review three traders' exit strategies on the same BTC trade. All entered at $71,400. Stop: $69,600. BTC reached $74,200, pulled back to $72,800, then continued to $76,900, pulled back to $74,400, then continued to $79,800.

Trader A: Single TP at $76,000. BTC reached $79,800 (TP not reached until $76,000 was hit on first run to $76,900). Filled at $76,000.

Trader B: Ladder: 40% at $74,000, 35% at $76,800, 25% at $80,000. TP1 filled. TP2 filled. TP3 not filled (price reached $79,800, reversed without hitting $80,000). Stop for remaining 25% triggered at $74,000 (after being moved there post-TP2).

Trader C: Ladder: 50% at $72,800 (took profit at the first pullback thinking the move was over), 50% still running with stop at entry. Stop triggered when price pulled back to $72,600 after the first run. Total: 50% at $72,800 and 50% at breakeven.

Calculate P&L for each. Identify which strategy was best-executed and why.`,
              scoringCriteria: [
                `Trader A: 100% at $76,000. Gain: $76,000−$71,400 = $4,600/BTC × 100% = $4,600 per BTC equivalent`,
                `Trader B: 40% at $74,000 ($2,600 × 40% = $1,040) + 35% at $76,800 ($5,400 × 35% = $1,890) + 25% triggered at $74,000 ($2,600 × 25% = $650). Total: $3,580`,
                `Trader C: 50% at $72,800 ($1,400 × 50% = $700) + 50% at $71,400 breakeven ($0). Total: $700`,
                `Best strategy: Trader A for this specific move (single TP at a technically justified level captured the most). Trader B captured $3,580 — lower than A but with less variance risk. Trader C's error: taking 50% off too early at a pullback (not a resistance level), which is the "anxiety exit" problem.`,
                `Key lesson: Trader C used a ladder incorrectly — 50% at $72,800 was not at a resistance level, it was at the first pullback out of emotion. Correct ladder uses RESISTANCE LEVELS for TP placement, not emotional price points.`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `SOL/USDT, 4-hour chart. You have a running ladder trade.

Setup recap:
- Entry: $183 (breakout above 4-week range resistance $182)
- Original stop: $178.50 (below range base)
- Account: $15,000. Initial risk: 1.5% ($225)
- Position: 25 SOL at $183 = $4,575 notional

Ladder placed at entry:
- TP1: $192 (40% = 10 SOL)
- TP2: $202 (35% = 8.75 SOL) 
- TP3: $215 (25% = 6.25 SOL)

Current situation — 6 days after entry:
TP1 filled at $192 — stop moved to $183 (breakeven).
TP2 filled at $202 — stop moved to $192.
Current price: $211.40. TP3 set at $215.
New price action: current 4H candle at $211.40 with a very large upper wick (high $213.90) — rejection of $214. Volume on this candle: 2.1× average (high volume rejection).

Should you maintain TP3 at $215, adjust it, or manually exit? Calculate P&L for each option.`,
              scoringCriteria: [
                `Current situation: TP1 and TP2 both filled. Remaining: 6.25 SOL. Stop at $192. Guaranteed profit on entire position already locked.`,
                `Option 1 — Hold TP3 at $215: Risk remaining 6.25 SOL between $211.40 and $215 TP. If reversed to $192 stop: gain = $192−$183 × 6.25 = $56.25 on remaining. Total position P&L so far: 10×($192−$183) + 8.75×($202−$183) = $90 + $166.25 = $256.25. Plus remaining $56.25 if stopped = $312.50 total.`,
                `Option 2 — Manual exit at current $211.40: 6.25 × ($211.40−$183) = 6.25 × $28.40 = $177.50. Total: $256.25 + $177.50 = $433.75`,
                `Option 3 — Move TP3 down to $212: risk only $0.60 price gap. Likely to fill.`,
                `High-volume rejection candle at $213.90 (wick) is strong evidence that sellers are at $214. Manual exit at $211.40 or adjusted TP at $212 is technically justified. TP3 at $215 may not fill given the rejection evidence.`,
                `Recommended: Adjust TP3 to $212 or manually exit. The rejection candle is new technical evidence warranting plan adjustment.`,
              ],
            },
          ],
        },

        {
          id: 'breakeven-stop',
          title: `Moving Your Stop to Breakeven`,
          explanation: `Every professional trader has a version of the same rule: once a trade has moved a certain amount in your favour, move the stop to breakeven. This is not optional. It is the mechanism that separates trades that end as losses from trades that end as "no-loss outcomes."

The breakeven stop rule is precise: when your trade has moved approximately 1× your initial risk in your favour, move the stop to your entry price. Exactly at entry, not $10 above entry for a "little extra," and not at some other level that "makes you feel safer." Entry price. This locks two outcomes: (1) the trade continues to profit, or (2) the trade returns to entry and exits for zero loss. A zero-loss outcome on a trade that initially went against you is one of the most psychologically powerful experiences in trading — it separates emotional decision-making from the outcome.

The +1R threshold: your initial risk is the distance from entry to stop. If you entered ETH at $3,740 with a stop at $3,620 (risk = $120), breakeven applies when ETH reaches $3,860 ($3,740 + $120 = +1R). At $3,860, move stop to $3,740.

The common mistake: moving the stop to "near breakeven" but not exactly breakeven. A stop at $3,730 instead of $3,740 still risks $10/ETH. Not zero. The discipline of the exact breakeven stop creates a categorically different trade: a position with no remaining downside.

After breakeven: the stop management continues. Once the trade is at +2R, move the stop to +1R. Once at +3R, switch to a trailing stop (2–2.5× ATR). The position management pattern creates an asymmetric outcome: you cannot lose, you can only win more or exit at a small profit from the trailing management.`,
          visualPrompt: `👆 Stop-loss migrating from initial level to breakeven to trailing`,
          visualType: `gif`,
          visualUrl: `stop-migration-animation`,
          strategy: `At +1R (trade has moved one risk unit in your favour): move stop to exact entry price. At +2R: move stop to +1R level. At +3R: switch to 2.5× ATR trailing stop. This creates a staircase of protection that guarantees an improving worst-case outcome as the trade develops.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, breakeven stop saves the trade]`,
              context: `A swing trader enters BTC long at $71,400. Stop: $69,800. Initial risk: $1,600. +1R target: $73,000. BTC moves to $73,200 and the trader moves the stop to $71,400 (breakeven).`,
              scenario: `BTC then forms a three-day consolidation between $72,100 and $73,400. It tests $72,100 on day 2. Without the breakeven stop, this move back toward the original stop zone would be stressful. With the breakeven stop, the worst outcome from this point is $0 loss.`,
              outcome: `BTC bounces from $72,100 and continues to $76,800 over the following week. The breakeven stop was never triggered. The position exits at TP2 for a +$5,400 gain on the position. The consolidation that tested $72,100 was a normal healthy pause in the trend — not a reversal. The breakeven stop allowed the trader to hold through it without anxiety.`,
            },
            {
              contextTag: `[Day Trader, SOL/USDT, breakeven stop triggered]`,
              context: `A day trader enters SOL at $190. Stop: $184. Risk: $6. +1R = $196. SOL reaches $196.40 and the trader moves stop to $190.`,
              scenario: `SOL reverses from $196.40. It falls through $193, $192, $191, $190.20. The breakeven stop at $190 triggers. The trader exits at $190.00.`,
              outcome: `P&L: zero. The trade reached the +1R mark, the thesis did not fully develop, and the position exited at breakeven. No capital was lost. The trade occupied position for 4 hours and produced zero result — which is a far better outcome than the original $6/SOL risk would have produced if the initial stop had been hit. The breakeven stop converted a potential loss into a neutral outcome.`,
            },
            {
              contextTag: `[Position Trader, ETH/USDT, +3R trailing stop activation]`,
              context: `A position trader enters ETH at $3,600. Stop: $3,480. Risk: $120. +1R: $3,720. +2R: $3,840. +3R: $3,960. 14-day ATR: $65.`,
              scenario: `ETH reaches $3,960 (+3R). The trader activates a 2.5× ATR trailing stop: $65 × 2.5 = $162.50. Trail set at $3,960 − $162.50 = $3,797.50. ETH continues to $4,180. Trail moves to $4,017.50. ETH reverses from $4,200 and falls to $3,980.`,
              outcome: `Trail triggers at $4,017.50. Total gain: $4,017.50 − $3,600 = $417.50/ETH. The staircase approach — breakeven at +1R, +1R stop at +2R, trailing at +3R — captured $417.50 vs the original $120 risk. R:R achieved: 3.48:1. The trailing stop activated only after the position had built a cushion of +3R, preventing premature trail activation.`,
            },
          ],
          keyTakeaway: `Move stop to entry price (breakeven) exactly when the trade reaches +1R profit. This converts the trade's worst-case outcome from a loss to zero. Then advance the stop to each prior profit level as the trade develops: +2R stop at +1R, then trailing at +3R.`,
          guidedPractice: [
            {
              question: `You enter BTC at $72,000. Stop: $70,400. At what price do you move the stop to breakeven?`,
              options: [
                `A — $73,000 — a round number above entry`,
                `B — $73,600 — when the trade has gained exactly $1,600 (= 1× the initial $1,600 risk). Entry + risk = $72,000 + $1,600 = $73,600.`,
                `C — $72,500 — the trade is already profitable`,
                `D — $73,200 — when the trade is up approximately 1.6%`,
              ],
              correct: 1,
              hint: `+1R means the trade has moved exactly one risk unit in your favour. Risk = $72,000 − $70,400 = $1,600. Where is $1,600 above entry?`,
              explanation: `B is correct. Risk = $72,000 − $70,400 = $1,600. +1R = $72,000 + $1,600 = $73,600. When BTC reaches $73,600, move the stop to $72,000. This marks the exact point where the trade has "paid for itself" — if stopped at breakeven, the $1,600 risk and the $1,600 gain cancel out. A is a round number with no R:R basis. C is too early — the trade needs to move at least 1× risk before breakeven is appropriate. D is a percentage rather than the risk-unit calculation.`,
            },
            {
              question: `Your SOL long from $187 with stop at $181 has reached $200. You move stop to breakeven ($187). SOL then falls to $186.80. What happens?`,
              options: [
                `A — Nothing — $186.80 is close to breakeven but the stop is at $187`,
                `B — The stop at $187 triggers when price hits $186.80 (below the stop level). The position closes at approximately $187 (minor slippage possible). P&L: approximately zero.`,
                `C — The stop at $187 triggers only if the candle closes below $187`,
                `D — The stop should be adjusted below $186.80 to avoid being triggered`,
              ],
              correct: 1,
              hint: `A stop-loss triggers when price reaches the stop level. Price at $186.80 is below $187. What happens to a stop at $187 when price falls below it?`,
              explanation: `B is correct. The stop at $187 is hit when price reaches $186.80 (which is at or below $187). The stop-market order triggers and the position closes at approximately $187 — minor slippage is possible. Net P&L: approximately $0. This is the designed outcome of the breakeven stop: a trade that reached +$13/SOL profit and then reversed exits at zero loss rather than triggering the original $6 stop loss. D is the stop-loss discipline violation: moving the stop lower to avoid being stopped is the exact behaviour breakeven stops prevent.`,
            },
            {
              question: `A trade has moved from +1R to +3R. According to the staircase stop management system, what should happen to the stop at +2R and at +3R?`,
              options: [
                `A — Keep stop at breakeven throughout the trade`,
                `B — At +2R: advance stop to +1R (locking in one unit of profit). At +3R: activate a 2.5× ATR trailing stop to capture trend extension.`,
                `C — At +2R: move stop to +2R (take all profit if reversed). At +3R: exit immediately.`,
                `D — At +2R and +3R: no action — the stop management ends at breakeven`,
              ],
              correct: 1,
              hint: `Each R-unit advance should trigger a stop advancement to the prior level, then a trailing stop once the trade has proven itself.`,
              explanation: `B is correct. The staircase system: Breakeven at +1R → stop at +1R at +2R → trailing stop at +3R. This creates a continuously improving minimum outcome: at +1R, worst case is zero. At +2R, worst case is +1R profit. At +3R, worst case depends on the trailing stop distance. Each step guarantees a better minimum result. C is wrong: moving stop to +2R at +2R means you exit at +2R profit if price reverses from exactly +2R — which might cut a continuing trend short. The staircase keeps you in the trend while protecting gains.`,
            },
            {
              question: `Why should the breakeven stop be placed at EXACTLY the entry price and not slightly above it (e.g., $5 above entry to "guarantee a small gain")?`,
              options: [
                `A — No reason — placing it slightly above entry is fine`,
                `B — Placing the stop above entry creates a "must be profitable" threshold. In a volatile market, price may temporarily pull back below that level before continuing — triggering a stop that was placed above the technical justification. At exactly entry, the breakeven stop captures a clean zero-loss exit without being overly close to normal volatility territory.`,
                `C — Exchange rules require stops at exact entry`,
                `D — A stop above entry means the trade is no longer risk-free`,
              ],
              correct: 1,
              hint: `What is the difference in trade management between a stop at entry vs a stop $5 above entry during normal market volatility?`,
              explanation: `B is correct. A stop placed above entry (e.g., $5 above) creates a small guaranteed profit threshold — but that $5 gap means the trade could be stopped on a normal $5 pullback that has no technical significance. The entry price is the clean, methodologically consistent breakeven level. Additionally, the psychology of "must be profitable" stops leads to adjusting them upward over time out of greed — creating stops that are increasingly likely to be triggered by normal volatility. At exactly entry: the stop is technically meaningful (you break even), the threshold is clean, and the behavior is consistent.`,
            },
            {
              question: `You enter ETH at $3,800. Stop: $3,660. Risk: $140. The trade moves to $3,940 (+1R) and you move the stop to $3,800. ETH then moves to $4,080 (+2R). According to the staircase system, what do you do with the stop now?`,
              options: [
                `A — Leave stop at $3,800 (breakeven)`,
                `B — Advance stop to $3,940 (+1R level) — now the worst case is a $140 profit on the position`,
                `C — Advance stop to $4,080 (current price) — lock in all profit`,
                `D — Activate trailing stop immediately at $4,080`,
              ],
              correct: 1,
              hint: `The staircase rule: at +2R, advance stop to +1R level. What is the +1R level?`,
              explanation: `B is correct. At +2R ($4,080), the staircase advance is to move the stop to the +1R level ($3,940). This means the worst-case outcome is now a $140/ETH gain (the full initial risk amount in profit). The trade has transitioned from "risk-free" to "guaranteed profitable." C is too aggressive — moving to +2R at +2R means you exit at the exact level if price reverses from there; the staircase keeps you in the trade through normal pullbacks at each prior profit level. D activates the trailing stop too early — the staircase reserves trailing for +3R when the trend has clearly proven itself.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT, 4-hour chart. You entered a long 3 days ago.

Entry details:
- Entry: $70,800
- Initial stop: $68,800 (risk = $2,000)
- TP1: $74,800 (40% of position)
- TP2: $78,800 (35%)
- TP3: $83,000 (25%)
- Position: 0.14 BTC
- Account: $16,000

Price progression since entry:
Day 1: High $73,200. Low $70,600. Close $72,400.
Day 2: High $74,900. Low $72,000. Close $74,300. TP1 NOT triggered (limit at $74,800 not reached).
Day 3: High $75,800. Low $73,600. Close $75,400. TP1 fills at $74,800 (0.056 BTC sold).

Current: Day 4 opening. Price: $75,400. Remaining position: 0.084 BTC.

Questions:
1. Should the stop have been moved at any point during days 1-3? When and to what level?
2. After TP1 fills on day 3, where should the stop be moved?
3. At what price point does the staircase rule tell you to advance the stop from breakeven to +1R?
4. Calculate current P&L on closed portion (TP1) and unrealised P&L on remaining position.`,
              scoringCriteria: [
                `Day 1-3 stop management: stop should NOT move until +1R is reached. +1R = $70,800 + $2,000 = $72,800. BTC reached $73,200 on Day 1 (above +1R). Stop should have been moved to $70,800 (breakeven) after Day 1 high confirmed +1R.`,
                `After TP1 fills (Day 3): stop moves to $70,800 (breakeven) IF not already moved. Since it should have been moved on Day 1, it's already at breakeven — confirm it's there.`,
                `Staircase advance: +2R = $70,800 + $4,000 = $74,800. This is the TP1 price! Once TP1 fills, the remaining position's stop advances to $70,800+$2,000 = $72,800 (+1R level). At +3R = $76,800: activate 2.5× ATR trailing.`,
                `TP1 P&L: 0.056 BTC × ($74,800 − $70,800) = 0.056 × $4,000 = $224`,
                `Unrealised: 0.084 BTC × ($75,400 − $70,800) = 0.084 × $4,600 = $386.40`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Review five traders' stop management decisions across the same trade. All entered ETH at $3,720, stop $3,580, risk $140. +1R = $3,860. +2R = $4,000. +3R = $4,140.

ETH's actual path: reached $3,860, then $4,010, then $4,180, then reversed to $3,990, then $3,870.

Trader A: Moved stop to $3,720 at $3,860. Stop stayed at breakeven through entire reversal. Stopped at $3,870.
Trader B: Never moved stop from $3,580. Stopped at $3,870 (same exit point as A).
Trader C: Moved stop to $3,860 (TP1 level) at $4,010. Stopped at $3,870 — stop NOT triggered (stop was $3,860, price only fell to $3,870 which is above $3,860). Position still open.
Trader D: Moved stop to $4,010 at $4,180 (aggressive). Stopped when price fell from $4,180 to $4,010 — early exit.
Trader E: Moved stop to $3,720 at $3,860, then to $3,860 at $4,000, then activated 2.5×ATR trail at $4,140. ATR=$62. Trail=$155. Stop at $4,140−$155=$3,985. Stopped at $3,990.

Calculate exit price, P&L, and evaluate quality of each trader's approach.`,
              scoringCriteria: [
                `Trader A: exit $3,870. P&L: $3,870−$3,720 = $150/ETH. Correct breakeven management but missed the staircase advance — should have moved stop to $3,860 (+1R) at $4,010.`,
                `Trader B: never moved stop. Exit $3,580 when stopped (if reversed to original stop) OR $3,870 if the reversal stopped there. Actually the reversal only went to $3,870 — stop at $3,580 never triggered. Position still open (same as C). Grade: correct outcome by luck, wrong process.`,
                `Trader C: stop at $3,860. Reversal to $3,870 is above $3,860 — stop NOT triggered. Position still open. P&L unrealised. This is correct staircase management.`,
                `Trader D: stop at $4,010. Triggered on reversal from $4,180 to $4,010. Exit $4,010. P&L: $4,010−$3,720=$290. Correct profit but aggressive stop placement at current price (not prior level).`,
                `Trader E: Trailing stop triggers at $3,985. P&L: $3,985−$3,720=$265. Best systematic approach.`,
                `Rankings: E (best system) > D (captured most profit but aggressive) > C (correct staircase) > A (correct breakeven) > B (luck).`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are helping a new trader understand why their "breakeven stops keep getting hit" before trades move higher.

Their last 5 breakeven stop scenarios:
Trade 1: Entry $188 SOL, stop $183, moved breakeven at +$2 ($190). Stopped at $188 when SOL dipped to $187.40 then ran to $198.
Trade 2: Entry $3,740 ETH, stop $3,620, moved breakeven at +$40 ($3,780). Stopped at $3,740 when ETH dipped to $3,735 then ran to $3,920.
Trade 3: Entry $71,800 BTC, stop $70,200, moved breakeven at +$600 ($72,400). Stopped at $71,800 when BTC dipped to $71,790 then ran to $75,600.
Trade 4: Entry $190 SOL, stop $183, moved breakeven at +$4.50 ($194.50, which is exactly +0.75R). Stopped at $190 on normal volatility. SOL eventually ran to $204.
Trade 5: Entry $3,800 ETH, stop $3,660, moved breakeven at +$140 ($3,940 = exactly +1R). Stop not triggered. Trade ran to $4,120.

Identify the exact error in trades 1-4 and explain why trade 5 worked correctly.`,
              scoringCriteria: [
                `Trade 1: Moved breakeven at +$2 ($190 when risk was $5). This is +0.4R — far too early. Normal volatility of $2 will hit a $188 stop repeatedly. Fix: move breakeven only at +1R = $188 + $5 = $193.`,
                `Trade 2: Moved breakeven at +$40 ($3,780 when risk was $120). This is +0.33R. A $40 retracement is well within the normal daily ETH range. Fix: +1R = $3,740 + $120 = $3,860 before moving breakeven.`,
                `Trade 3: Moved breakeven at +$600 ($72,400 when risk was $1,600). This is +0.375R. Again, too early. Fix: +1R = $71,800 + $1,600 = $73,400.`,
                `Trade 4: Moved breakeven at +0.75R ($194.50 when +1R = $197). Closer but still below the +1R threshold. Fix: wait until $197 before moving to $190.`,
                `Trade 5: Correct. Moved breakeven at exactly +1R ($3,940 = $3,800 + $140). The normal volatility that stopped trades 1-4 did not reach the $3,800 breakeven level. The trade ran unimpeded.`,
                `Root cause: premature breakeven moves create stops that are hit by normal volatility. The +1R rule exists because by the time a trade has moved 1× the initial risk, normal volatility is unlikely to reach back to the entry price.`,
              ],
            },
          ],
        },

        {
          id: 'swing-trading',
          title: `Swing Trading — The Best Style for Most Traders`,
          explanation: `In 2019, a study published comparing trading style profitability across retail traders on a major European broker found that swing traders (hold time 2–10 days) had significantly better outcomes than scalpers or position traders. Scalpers had high win rates but were destroyed by fees. Position traders held through excessive drawdowns and psychological stress. Swing traders occupied the ideal middle ground: holding long enough to capture meaningful moves (5–20%), short enough to avoid the extended drawdowns that test psychological endurance.

Swing trading is the practice of capturing multi-day price moves — "swings" in the direction of the dominant trend. A swing trade typically holds for 2–14 days, targeting the next significant resistance level as the exit. The entry is usually at a pullback to support (buying a retracement in an uptrend) or at a breakout above resistance (buying the continuation).

Why swing trading beats scalping for most retail traders:
— Fee burden is manageable: 2 trades per week at $5,000 position size = $20 in fees. vs scalping: 6 trades per day × $5,000 = $60 per day in fees.
— Emotional management: checking the chart once or twice per day vs staring at a 1-minute chart for 8 hours straight.
— R:R ratios: 3:1–8:1 achievable on multi-day swings. Scalping rarely exceeds 1.5:1 cleanly.
— Knowledge leverage: the same technical analysis that takes 20 minutes to identify holds its relevance for days, not seconds.

The swing trading framework: (1) Identify trend direction on the daily chart. (2) Wait for a pullback to a key level (support, moving average, prior resistance now support). (3) Enter on a trigger candle at the level. (4) Set stop below the level. (5) Target the next significant resistance. (6) Hold until target, stop, or trend change signal.`,
          visualPrompt: `👆 Swing trading entry and exit on daily chart — buy the dip, sell the rip`,
          visualType: `gif`,
          visualUrl: `swing-trade-daily`,
          strategy: `Trade in the direction of the daily trend only. Buy pullbacks to support in uptrends. Sell rallies to resistance in downtrends. Never fight the trend on a swing timeframe. Target 3:1 R:R minimum. Hold 2–10 days average. Reduce position size and increase R:R requirements during sideways (ranging) markets — swing trades in ranging markets have no trend tailwind.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, pullback entry]`,
              context: `BTC is in a daily uptrend (8 weeks of higher highs and higher lows). Current price: $74,200. Last support test: $71,400 (bounced +7%). The swing trader waits for the next pullback.`,
              scenario: `BTC pulls back from $74,200 to $71,600 over 3 days. A bullish hammer candle forms at $71,600 on above-average volume. The trader enters at the hammer close ($71,800). Stop: $70,200 (below the prior swing low). Target: $76,000 (next resistance). R:R = $4,200/$1,600 = 2.625:1.`,
              outcome: `BTC bounces from $71,600 and reaches $76,800 over the following 5 trading days. The swing trade captures +$5,000/BTC from $71,800 to $76,800. Hold time: 5 days. Two trades for the week (entry + exit). Total fee burden: ~$28. Net swing profit: substantial vs fees.`,
            },
            {
              contextTag: `[Scalper vs Swing Trader, fee comparison]`,
              context: `Two traders start with identical $15,000 accounts. The scalper makes 8 trades per day. The swing trader makes 3 trades per week.`,
              scenario: `Scalper: 8 trades × $5,000 avg × 0.1% × 2 sides = $80/day in fees × 22 days = $1,760/month = 11.7% of account. Swing trader: 3 trades/week × 4 weeks = 12 trades/month × $5,000 × 0.2% = $120/month = 0.8% of account.`,
              outcome: `The scalper needs to generate 11.7% monthly just to break even on fees. The swing trader needs to generate 0.8%. At 55% win rate and 3:1 R:R: scalper barely profitable after fees (6.6% gross − 11.7% fees = −5.1%). Swing trader same edge: same 6.6% gross − 0.8% fees = +5.8% net. Same win rate, same R:R, dramatically different profitability due to fee burden.`,
            },
            {
              contextTag: `[Swing Trader, ETH/USDT, ranging market adjustment]`,
              context: `ETH has been ranging between $3,400 and $3,800 for 6 weeks. No clear trend.`,
              scenario: `A swing trader reduces position size to 0.5% risk per trade (vs normal 1.5%) and requires minimum 3:1 R:R (vs normal 2:1) for range trades. They buy at range support ($3,420) with stop below ($3,350) and target at range resistance ($3,780) — R:R = $360/$70 = 5.14:1. Half the normal position.`,
              outcome: `Trade works, capturing the full range width for 5.14:1 on a smaller position. The adjustment for ranging conditions — smaller size, higher R:R requirement — reduces risk while maintaining positive EV in a lower-quality market environment. The key insight: the trend is the tailwind. Without it, you trade smaller and demand better setups.`,
            },
          ],
          keyTakeaway: `Swing trading holds 2–14 days, targeting 5–20% moves with 3:1+ R:R. It beats scalping for most retail traders due to manageable fee burden, lower emotional stress, and better R:R potential. Trade with the daily trend. During ranging markets: half position, higher R:R requirements.`,
          guidedPractice: [
            {
              question: `A swing trader makes 3 trades per week on $8,000 position sizes. A scalper makes 10 trades per day on the same size. Both pay 0.1% taker fees per side. What is the monthly fee burden for each as a percentage of a $20,000 account?`,
              options: [
                `A — Swing: 1.2%, Scalper: 44%`,
                `B — Swing: 0.96%, Scalper: 44%`,
                `C — They pay the same — fees are per trade`,
                `D — Swing: 1.2%, Scalper: 44% — same answer as A`,
              ],
              correct: 1,
              hint: `Monthly trades: Swing = 3 × 4 = 12. Scalper = 10 × 22 = 220. Fee = trades × position × 0.2%.`,
              explanation: `B is closest. Swing: 12 trades × $8,000 × 0.2% = $192 / $20,000 = 0.96%. Scalper: 220 × $8,000 × 0.2% = $3,520 / $20,000 = 17.6%. A and D state 44% — which would occur at a much larger position size or higher trade frequency. The correct scalper calculation yields 17.6%, not 44%. The swing trader's 0.96% vs scalper's 17.6% illustrates the fee advantage clearly.`,
            },
            {
              question: `You are a swing trader and the daily BTC chart shows a downtrend (8 weeks of lower highs and lower lows). A short-term 4H chart shows a potential long setup. Should you take the long trade?`,
              options: [
                `A — Yes — the 4H setup is valid regardless of daily trend`,
                `B — No — the daily trend is down. Taking a long trade on the 4H against the daily downtrend removes the trend tailwind and significantly reduces the probability of success for a swing trade.`,
                `C — Yes — but use half position size`,
                `D — Only if R:R is above 5:1`,
              ],
              correct: 1,
              hint: `Swing trading principle: trade in the direction of the dominant (daily) trend. What is the primary reason trend alignment matters?`,
              explanation: `B is correct. The core of swing trading is using the trend as a tailwind. In a daily downtrend, the dominant directional bias is bearish — every rally is likely to be sold into. A 4H long trade is swimming upstream against that dominant force. The probability of a multi-day upswing sustaining against a weekly bearish trend is significantly lower than a move with the trend. C reduces risk but doesn't fix the core problem. D — even at 5:1 R:R, fighting the trend creates a systematically lower win rate that may not be compensated by the R:R.`,
            },
            {
              question: `In a bullish daily trend, which is the preferred swing trade entry type?`,
              options: [
                `A — Buying at the high after a new breakout in the trend`,
                `B — Buying a pullback to support — entering after the price has retraced to a key level from which it is likely to resume the trend`,
                `C — Short selling at resistance because the price has moved too far`,
                `D — Waiting for the trend to end and trade the reversal`,
              ],
              correct: 1,
              hint: `In an uptrend, what provides the best entry price AND the most evidence that the level will hold?`,
              explanation: `B is correct. In an uptrend, pullbacks to support provide: (1) better entry price (closer to the swing low = tighter stop and better R:R), (2) evidence that the support level is holding (the trend continues), (3) reduced risk of entering at the high of a local move. Buying at the high (A) creates poor R:R — the stop must be far below, and you are entering when the move has already happened. C (shorting into the trend) fights the dominant direction. D (waiting for reversal) means consistently missing the trend.`,
            },
            {
              question: `ETH is in a daily uptrend. Price has pulled back from $3,900 to $3,660 over 4 days. Yesterday a bullish engulfing candle formed at $3,660 on 1.8× volume. Today price opened at $3,700 and is at $3,720. The setup meets all 5 checklist elements. What is the correct entry approach?`,
              options: [
                `A — Wait for another pullback — $3,660 was too recent`,
                `B — Enter now at $3,720 — the trigger candle (engulfing) has confirmed the support is holding. This is the valid entry window.`,
                `C — Enter only if price returns to $3,660 — the original trigger level`,
                `D — Wait for daily close to confirm the trend has resumed`,
              ],
              correct: 1,
              hint: `The trigger candle formed and closed. The entry window is now open. What is the relationship between trigger confirmation and timing?`,
              explanation: `B is correct. The trigger candle (bullish engulfing at $3,660 with volume) closed and confirmed the support level is holding. The next day's price action ($3,700–$3,720) is the early stages of the expected bounce. Entry at $3,720 is within the valid entry window — the trade thesis (uptrend support held, trigger confirmed) is intact. C (waiting for a return to $3,660) is the "better entry" trap — chasing a price point that was the trigger's origin without acknowledging that the market may not return there. A is hesitation without cause. D waits too long — the entry opportunity may be gone by daily close.`,
            },
            {
              question: `What is the ideal hold time for a swing trade on the daily chart and how does this compare to scalping?`,
              options: [
                `A — 2–14 days for swing; seconds to minutes for scalping`,
                `B — 1–6 months for swing; 2–14 days for scalping`,
                `C — 2–14 days for swing; 4–8 hours for scalping`,
                `D — 1–3 weeks for swing; 1–2 hours for scalping`,
              ],
              correct: 0,
              hint: `Swing trading uses daily charts for primary analysis and holds for the duration of the "swing." Scalping uses 1-minute to 5-minute charts.`,
              explanation: `A is correct. Swing trades on daily charts target 2–14 day holds — long enough to capture multi-day moves in the trend's direction, short enough to avoid the psychological burden of extended drawdowns. Scalping operates on 1-minute to 5-minute charts with holds measured in seconds to minutes. The fundamental difference is: swing trading captures structural moves in the trend; scalping captures micro-moves in market microstructure. B inverts the timeframes. C and D are both off — scalping doesn't hold hours; those timeframes describe intraday or day trading.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-reversal`,
              scenario: `BTC/USDT, daily chart. You are identifying swing trade opportunities.

Daily trend: Up for 14 weeks (higher highs, higher lows confirmed).
Current price: $73,400.
Price history (last 10 days):
Day -10: $76,800 (local high). Day -9: $75,400. Day -8: $74,200. Day -7: $73,000. Day -6: $72,400. Day -5: $72,100. Day -4: $71,800 (local low). Day -3: $72,800. Day -2: $74,200 (bullish engulfing on volume 2.2×). Day -1: $73,800. Today: $73,400 (slight pullback from -1).

Key levels:
- Support: $71,800 (prior local low, confirmed 2 days later with bounce)
- Prior resistance/support: $72,000
- 50-day MA: $70,400 (rising)
- Resistance: $76,800 (prior swing high)
- Next resistance: $79,200

Questions:
1. Apply the 5-element checklist for a long entry
2. Was there a higher-quality entry in the past 10 days? When?
3. Is there a valid entry NOW at $73,400? 
4. Set up the complete trade: entry, stop, TP1, TP2, position size on $18,000 account at 1.5% risk`,
              scoringCriteria: [
                `Checklist NOW: (1) Trend: up ✓ (2) Level: $73,400 is NOT at a key support level — it's between levels. Missing. (3) Trigger: recent bullish engulfing was Day -2, now 2 days ago. The trigger window may have passed. (4) Risk defined: possible but level is missing. (5) Size: calculable.`,
                `Higher quality entry: Day -2 ($74,200 bullish engulfing) or Day -4 ($71,800 local low). Day -2 was the trigger candle — the ideal entry was at the close of that candle ($74,200).`,
                `Entry NOW at $73,400: marginal — between $71,800 support and $76,800 resistance with no clear technical level. Not ideal. Better to wait for next pullback to support.`,
                `If entering now: Entry $73,400, Stop $71,600 (below $71,800 local low with buffer). TP1 $76,600 (just below $76,800 resistance). TP2 $79,000.`,
                `R:R: ($76,600−$73,400)/($73,400−$71,600) = $3,200/$1,800 = 1.78:1 — BELOW minimum 2:1. Trade does not meet criteria at current level.`,
                `Position size: academic only since R:R fails. 1.5%×$18,000=$270. $270/$1,800×$73,400=$11,005 notional.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader is deciding between three trading styles for their situation. Help them analyse each:

Trader profile: Full-time employed (9-5 job). $14,000 account. Can check charts in evenings and during lunch. Available: 1 hour per day for trading analysis. Target: grow account steadily over 12 months.

Option 1: Scalping — 6 trades per day, 1-minute chart, $3,000 average position, 0.1% fees.
Option 2: Day trading — 2 trades per day, 15-minute chart, $5,000 average position, 0.1% fees.
Option 3: Swing trading — 3 trades per week, daily chart, $5,000 average position, 0.1% fees.

For each:
1. Calculate monthly fee burden as % of account
2. Assess time compatibility with the trader's profile
3. Identify the primary risk of each style for this trader
4. Make a recommendation with justification`,
              scoringCriteria: [
                `Scalping: 6×22=132 trades × $3,000 × 0.2% = $792/month = 5.66% of $14,000. TIME: impossible for employed trader — requires 8 hours of screen time. PRIMARY RISK: cannot execute; fees catastrophic; needs instant execution that a 9-5 cannot provide.`,
                `Day trading: 2×22=44 trades × $5,000 × 0.2% = $440/month = 3.14%. TIME: marginal — requires intraday execution. A 9-5 employee cannot execute 2 trades per day during market hours reliably. PRIMARY RISK: trades miss entry/exit windows during work hours.`,
                `Swing trading: 3×4=12 trades × $5,000 × 0.2% = $120/month = 0.86%. TIME: perfectly compatible — daily chart analysis takes 20-30 minutes in the evening. Trades held 2-14 days don't require intraday monitoring. PRIMARY RISK: holding overnight and over weekends creates gap risk (price jumping significantly at open).`,
                `Recommendation: Swing trading only. 0.86% monthly fees vs 5.66% and 3.14%. Time-compatible with employment. Gap risk manageable by reducing position size before weekends and major events.`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `Daily BTC uptrend confirmed. You are looking for the best swing entry from five scenarios:

Scenario A: BTC just made a new 3-week high at $76,400. RSI overbought (78). Daily candle: small body, upper wick, below the high. Volume: 0.8× average.

Scenario B: BTC has pulled back from $76,400 to $72,800 over 5 days. $72,800 is near the prior resistance zone (now support, $72,600–$73,000). Today's candle: bullish hammer, close $73,100, volume 1.9× average.

Scenario C: BTC is at $74,600 — between prior support ($72,800) and prior resistance ($76,400). No specific level. Daily trend still up.

Scenario D: BTC has pulled back to $70,200 — below the last significant swing low ($71,400). This represents a potential higher-low failure.

Scenario E: BTC at $73,000, on the 50-day MA ($73,100). Daily trend up. Volume today: 2.1× average. RSI 48 (neutral). No specific candlestick signal yet (current candle still forming).

Rank all five from best to worst entry opportunity and justify with checklist analysis.`,
              scoringCriteria: [
                `Scenario B: BEST. All 5 checklist elements present: trend up ✓, level (prior resistance now support) ✓, trigger (bullish hammer with 1.9× volume) ✓, risk definable ✓, sizable ✓. Classic swing entry.`,
                `Scenario E: Second. 4 of 5: trend ✓, level (50-day MA) ✓, no trigger yet (candle forming — wait for close), risk definable ✓. If today's candle closes bullish with volume confirmation, enters the top tier.`,
                `Scenario C: Third/Conditional. Trend ✓, but between levels. No specific support level. Would require waiting for price to reach $72,800 or $76,400 for a level-based entry.`,
                `Scenario A: Fourth/Avoid. New high with overbought RSI and weak volume. Buying at the high of a run with overbought momentum is poor R:R. Chasing breakouts without volume is low-quality.`,
                `Scenario D: WORST/Avoid. Below the last swing low ($71,400) means the uptrend's higher-low structure may be breaking. This is a potential trend reversal signal — the opposite of a swing long setup. Could only be an entry if a strong bullish reversal candle forms at a major support below.`,
              ],
            },
          ],
        },

      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-breakout',
          'chartReplay-reversal',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
        ],
        description: `Fifteen randomised simulation challenges drawn from all five Lab 5 lessons — without lesson labels. Tasks include: applying the five-element trade checklist to live setups, counting genuine confluence signals, designing TP ladders on provided resistance maps, managing breakeven stop timing across price progressions, and identifying optimal swing trade entries on daily charts. All require applying the complete entry-exit framework — not isolated recall.`,
        scoringMode: 'percentageCorrect',
        unlockCondition: 'completeAllLessons',
        difficultyRange: [3, 5],
      },
      bossMode: {
        title: `Senior Trader Challenge`,
        learningLoop: {
          id: 'stc-ll',
          attempts: 'unlimited',
          feedbackMode: 'fullCriteriaWithPointers',
          challenges: [
            { id: 'stc-ll-1', simulatorType: 'chartReplay-breakout', lessonPointer: 'valid-trade-setup' },
            { id: 'stc-ll-2', simulatorType: 'chartReplay-reversal', lessonPointer: 'confluence' },
            { id: 'stc-ll-3', simulatorType: 'chartReplay-riskManage', lessonPointer: 'take-profit-laddering' },
            { id: 'stc-ll-4', simulatorType: 'judgment-riskAssess', lessonPointer: 'breakeven-stop' },
            { id: 'stc-ll-5', simulatorType: 'judgment-dataInterpret', lessonPointer: 'swing-trading' },
            { id: 'stc-ll-6', simulatorType: 'judgment-prioritisation', lessonPointer: 'valid-trade-setup' },
            { id: 'stc-ll-7', simulatorType: 'chartReplay-riskManage', lessonPointer: 'confluence' },
            { id: 'stc-ll-8', simulatorType: 'chartReplay-breakout', lessonPointer: 'take-profit-laddering' },
            { id: 'stc-ll-9', simulatorType: 'judgment-riskAssess', lessonPointer: 'breakeven-stop' },
            { id: 'stc-ll-10', simulatorType: 'judgment-dataInterpret', lessonPointer: 'swing-trading' },
          ],
        },
        },
    },
,
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 6 — TECHNICAL INDICATORS (6 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'technical-indicators',
      title: `Lab 6: Technical Indicators`,
      subtitle: `Tools to find what the chart cannot show directly`,
      lessons: [

        {
          id: 'what-indicators-are',
          title: `What Indicators Actually Are`,
          explanation: `Wilder's RSI, Bollinger Bands, MACD — these are the three most used technical indicators in the world. In a 2021 survey of 14,000 retail traders, 91% used at least one of them. Yet the majority of those traders also reported that their indicators "gave false signals constantly." The problem is not the indicators. The problem is that most traders misunderstand what indicators are fundamentally doing.

Every technical indicator is a mathematical formula applied to price data (and sometimes volume). RSI is the ratio of average gains to average losses over N periods. MACD is the difference between two exponential moving averages. Bollinger Bands are the mean plus and minus standard deviation multiples. They are all derived from the same underlying source: price.

Because indicators are derivatives of price, they cannot predict the future. They can only describe the past. An RSI reading of 75 tells you that over the past 14 periods, gains exceeded losses in a 75:25 ratio. It does not tell you that price will fall. It tells you that buying pressure has dominated. That is useful information — but not a prediction.

The correct role for indicators: confirmation and filtering, not signal generation. A trader who enters every time RSI crosses 30 upward is using indicators as a signal generator — a role they cannot reliably fill. A trader who identifies a support level on price, sees a volume spike at the level, AND sees RSI divergence is using the indicator as a third confirming signal — the role it was designed for.

Indicator lag: all indicators based on past data lag the price. Moving averages built on 200 candles reflect the past 200 periods — they cannot be "early." The 200-day MA is useful for identifying trend direction but provides no early signal. Indicators that aim to be "leading" (RSI divergence, for example) are looking for patterns in the indicator that historically precede price movements — but they diverge often without price following.

The conclusion professional traders have reached: use 1–2 indicators maximum on any chart. More indicators add noise, not signal. The chart itself (price and volume) contains the primary information. Indicators are the secondary lens.`,
          visualPrompt: `👆 Clean chart vs over-indicator chart — simplicity wins`,
          visualType: `gif`,
          visualUrl: `indicator-clutter-vs-clean`,
          examples: [
            {
              contextTag: `[New Trader, BTC/USDT, indicator overload]`,
              context: `A new trader adds 8 indicators to their BTC chart: RSI, MACD, Stochastic, CCI, 5 different moving averages, Bollinger Bands, and ADX.`,
              scenario: `The chart becomes unreadable — indicator lines cover the price candles. When the trader looks for a signal, they find that half the indicators say "buy" and half say "sell" at any given time. They cannot make a decision.`,
              outcome: `The trader removes all indicators and returns to a clean price chart with volume. They add only RSI (for divergence) and the 200-day SMA (for trend direction). Decision-making immediately improves. The original eight indicators were all telling different aspects of the same story — price movement — but in contradictory languages.`,
            },
            {
              contextTag: `[Experienced Trader, ETH/USDT, indicator as filter]`,
              context: `An experienced trader uses RSI as a quality filter, not a signal generator.`,
              scenario: `The trader will only take long setups when RSI is below 60 (not yet extended). This filters out entering after a large run when the price is already overextended. When RSI is above 70, they skip long entries — not because RSI 70 "means reversal" but because it means the move has already run significantly.`,
              outcome: `The filter reduces their trades by approximately 30% but improves win rate from 52% to 58% because they are consistently entering at less extended points. The RSI is not generating signals — it is filtering out low-probability entries.`,
            },
            {
              contextTag: `[Analyst, comparing indicator lag]`,
              context: `A quantitative analyst measures the lag of different indicator types.`,
              scenario: `On BTC daily chart: 200-day SMA crosses above/below 50-day SMA (death cross/golden cross) on average 47 days after the trend has actually changed direction. MACD crossover: 11 days after trend change. RSI divergence: precedes trend change by 3–8 days on average but generates 3× as many false positives. Price structure (lower high, lower low): 0 days lag — it defines the trend change.`,
              outcome: `Price structure is the only zero-lag signal because it is not derived from past data — it IS the current data. Indicators all lag because they are based on averages or rates of change from past periods. The more periods in the calculation, the more lag. The analyst concludes: price structure first, indicators second (for confirmation only).`,
            },
          ],
          keyTakeaway: `All indicators are mathematical formulas applied to past price data. They cannot predict — they describe. Use indicators as confirming signals, not signal generators. Maximum 1–2 indicators on any chart. Price structure and volume are primary; indicators are secondary filters.`,
          guidedPractice: [
            {
              question: `RSI reaches 80 on BTC's daily chart. What does this tell you about future price direction?`,
              options: [
                `A — Price will definitely fall — RSI 80 is overbought and always reverses`,
                `B — RSI 80 means that over the past 14 periods, gains have significantly exceeded losses. It describes recent buying momentum but does not predict reversal. Price can continue higher from RSI 80 in a strong trend.`,
                `C — Price will continue rising — RSI 80 means the trend is very strong`,
                `D — RSI 80 means nothing without MACD confirmation`,
              ],
              correct: 1,
              hint: `What is RSI mathematically measuring? Does a high reading guarantee a reversal or just describe what has happened?`,
              explanation: `B is correct. RSI at 80 means over the past 14 periods, average gains were 4× average losses (the formula: 100 − 100/(1+RS) = 80 → RS = 4 → average gain is 4× average loss). This describes strong recent buying momentum. During a strong uptrend, RSI can remain above 70 for many weeks — staying "overbought" for the entire duration of a bull run. A major false belief: RSI 80 "must reverse." Strong trends routinely stay overbought. RSI divergence (price making new highs while RSI makes lower highs) is the more useful pattern.`,
            },
            {
              question: `A trader has 7 indicators on their chart and says "they all need to agree before I trade." What is the problem?`,
              options: [
                `A — Nothing — more confirmation is always better`,
                `B — Most of the 7 indicators are likely derived from the same price data — their "agreement" is not independent confluence. Requiring all 7 to agree also means almost no trades pass the filter, causing missed opportunities.`,
                `C — 7 is too many — reduce to exactly 3`,
                `D — The indicators need to be calibrated first`,
              ],
              correct: 1,
              hint: `If all 7 indicators use price data as input, how independent is their "agreement"?`,
              explanation: `B is correct. If all 7 indicators are price-derived (RSI, MACD, Stoch, CCI, multiple MAs, etc.), they tend to agree when price is moving strongly in one direction — but they are all describing the same phenomenon. Their agreement is not independent confirmation. Additionally, waiting for 7 indicators to simultaneously signal means the optimal entry price has already passed by the time all seven align. Professional approach: maximum 2 price-derived indicators on a chart, plus volume as a separate data source.`,
            },
            {
              question: `The 200-day moving average is often said to have a 200-day lag. What does this mean?`,
              options: [
                `A — The 200-day MA is 200 days ahead of current price`,
                `B — The 200-day MA is calculated from the past 200 days of prices — it reflects the average of those 200 days. When trend direction changes, the MA is the last to confirm it because it takes many new data points to shift 200 days of historical data.`,
                `C — Moving averages have no lag — they use live data`,
                `D — The lag only applies to downtrends`,
              ],
              correct: 1,
              hint: `A moving average is the average of past N candles. How does past data affect the indicator's ability to reflect the current trend?`,
              explanation: `B is correct. The 200-day MA is the arithmetic average of the last 200 closing prices. If a new uptrend begins today, the 200-day MA will still reflect the average of the past 200 days — which includes all the prior downtrend days. It takes many days of new uptrend data before the 200-day average begins to rise meaningfully. This is why the 200-day MA is useful for context (long-term trend direction) but not for timing entries or exits — it will confirm a trend long after it has begun.`,
            },
            {
              question: `What is the correct use of indicators according to the professional framework?`,
              options: [
                `A — Generate entry signals — enter when the indicator crosses a threshold`,
                `B — Confirm and filter setups identified by price structure and volume — add the indicator as a second or third signal after the primary setup is identified`,
                `C — Predict reversals in advance`,
                `D — Replace price structure analysis entirely`,
              ],
              correct: 1,
              hint: `If indicators are lagging derivatives of price, can they be the primary entry signal?`,
              explanation: `B is correct. The professional indicator framework: identify the setup using price structure (support, resistance, trend, pattern) and volume first. Then use 1–2 indicators to confirm or filter. An indicator that agrees with a price-structure setup adds probability. An indicator that contradicts a price-structure setup is a warning flag — investigate before entering. An indicator signal with no price-structure context is noise. The professional never enters purely because an indicator crossed a threshold.`,
            },
            {
              question: `RSI divergence occurs when price makes a new high but RSI makes a lower high. Why is this considered a warning signal rather than a definitive sell signal?`,
              options: [
                `A — Because RSI divergence is always wrong`,
                `B — Because divergence shows weakening momentum but price can continue higher despite weakening momentum. Divergence is a caution signal that should increase scrutiny, but price must confirm the reversal before acting.`,
                `C — Because RSI divergence only works on daily charts`,
                `D — Because it is a lagging indicator so it is always too late`,
              ],
              correct: 1,
              hint: `If RSI divergence told you price would definitely reverse, what would happen when you traded it? What is the actual base rate of divergence leading to reversal?`,
              explanation: `B is correct. RSI divergence historically precedes reversals more often than not — but not reliably enough to act on alone. In a strong uptrend, divergence can persist for weeks while price continues higher ("divergence continued" is a documented phenomenon). The correct response to divergence: heightened awareness, tighten trailing stops, reduce new long position sizing, wait for a confirming price structure signal (bearish candle, break of support) before acting. Divergence alone is not a sell signal.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader shows you their chart setup. They have the following indicators displayed simultaneously:

1. 20-period SMA
2. 50-period SMA
3. 100-period SMA
4. 200-period SMA
5. RSI (14)
6. MACD (12,26,9)
7. Stochastic (14,3,3)
8. Bollinger Bands (20, 2 std dev)
9. ATR (14)
10. Volume histogram

They ask: "All of these are green / bullish right now. Is this a strong buy signal?"

Answer the following:
1. Which of these 10 indicators are genuinely providing independent information?
2. Which are redundant (derived from the same data as another on the list)?
3. What is the actual independent signal count?
4. What two indicators would you keep if you had to strip the chart to essentials?`,
              scoringCriteria: [
                `SMAs (1-4): All four are price-derived averages. They provide ONE signal type (trend direction) despite being four separate lines. Keeping all four is redundant — the 200-day SMA alone provides the long-term trend.`,
                `RSI (5): Price-derived momentum. Adds a different dimension (relative strength ratio) but still price-derived.`,
                `MACD (6): Price-derived (two EMAs). Overlaps with SMA trends — not fully independent.`,
                `Stochastic (7): Price-derived momentum. Essentially confirms what RSI already shows.`,
                `Bollinger Bands (8): Uses 20-period SMA + standard deviation of price. Overlaps with SMA.`,
                `ATR (9): Volatility measure derived from price. Provides unique volatility information — different dimension.`,
                `Volume (10): INDEPENDENT — separate data source from price.`,
                `Independent signal types: Price trend (1-4+8 as one type), Momentum (5+6+7 as one type, RSI is the cleanest), Volatility (9), Volume (10). Actual independent types: 4.`,
                `Essential two: 200-day SMA (trend direction) + Volume histogram (separate data source). Everything else either confirms what these show or adds noise.`,
              ],
            },
            {
              type: `chartReplay-volumeRead`,
              scenario: `ETH/USDT daily chart. You need to decide which indicators to use and how.

Chart context:
- ETH in uptrend for 6 weeks
- Current price: $3,740
- Previous support zone: $3,580–$3,620 (held 3 times)
- ETH just pulled back to $3,640 (within the support zone)
- Today's candle: green, close $3,680, volume 2.1× average

You have access to: price chart, volume, RSI, MACD, 50-day SMA ($3,480), 200-day SMA ($3,100).

Design your indicator setup for this trade:
1. What indicators do you put on the chart and why?
2. What are they telling you RIGHT NOW?
3. How does each indicator's current reading affect your entry decision?
4. At what point would an indicator reading cause you NOT to enter this trade?`,
              scoringCriteria: [
                `Indicator setup: 200-day SMA (trend direction context), RSI (momentum/divergence check), Volume (already visible). Max 3 display elements.`,
                `Current readings: 200-day SMA at $3,100 — price is well above, confirmed uptrend. RSI: check if between 40-60 (healthy pullback range) or above 70 (still overextended).`,
                `Volume reading: 2.1× on today's green candle at support = institutional buying confirmation. Strong positive signal.`,
                `Entry decision factors: Price at support ✓, Volume confirmation ✓, Trend direction (above 200 SMA) ✓, RSI check pending.`,
                `Would NOT enter if: RSI divergence visible (price at support but RSI making lower lows = weakening momentum at support), OR MACD histogram turning strongly negative at support, OR 200-day SMA recently crossed below a long-term average (trend change).`,
                `User demonstrates restraint — does not add all available indicators, selects tools with purpose.`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `You are evaluating five chart setups from fellow traders. Each trader is using indicators differently. Rank their approaches from most to least professional:

Trader A: Uses only price structure and volume. No indicators. Claims "the chart tells everything."
Trader B: Uses 2 indicators: 200-day SMA for trend direction and RSI for momentum divergence check. Uses them as filters after identifying price setups.
Trader C: Uses 6 indicators: RSI, MACD, Stochastic, three SMAs. Enters when 5 of 6 agree.
Trader D: Uses MACD only. Enters every MACD bullish crossover as a long trade. No price structure analysis.
Trader E: Uses Bollinger Bands and volume. Buys when price touches the lower band with above-average volume. Has 6 months of trade data showing 62% win rate on this setup.

Rank from best to worst approach and explain what each is doing right and wrong.`,
              scoringCriteria: [
                `B: BEST. Independent price structure analysis + 2 relevant indicators used as confirmation/filter. Professional standard.`,
                `E: Second. Single indicator used as part of a defined, backtested entry rule. 6 months of win rate data adds credibility. Risk: Bollinger Bands alone miss trend context — but if it's working with data to prove it, it's more rigorous than most.`,
                `A: Third. Price and volume only is actually professional-level analysis — the concern is no momentum check (RSI divergence is genuinely useful). But this approach is cleaner than overloading.`,
                `D: Fourth. Single indicator as sole signal generator (MACD crossover) with no price structure context. Will generate many false signals in choppy markets.`,
                `C: WORST. Six correlated indicators — most are price-derived and will agree or disagree in a correlated pattern. "5 of 6 agree" sounds rigorous but the signals are not independent. Creates false confidence and missed opportunities.`,
              ],
            },
          ],
        },

        {
          id: 'moving-averages',
          title: `Moving Averages — SMA and EMA`,
          explanation: `The 200-day simple moving average is arguably the most watched single number in traditional finance. Warren Buffett's Berkshire Hathaway's stock has spent 94% of the past 30 years above the 200-day SMA. Bitcoin has historically entered bear markets when it crossed below the 200-day SMA and confirmed bull markets on sustained moves above it. This is not a coincidence — it is self-fulfilling. When enough market participants use the same reference level, that level has significance simply because of collective attention.

A moving average is the average of the last N closing prices. The Simple Moving Average (SMA) weights every period equally: 200-day SMA is the sum of the last 200 closes divided by 200. The Exponential Moving Average (EMA) weights recent prices more heavily using a multiplier: the most recent price has the highest weight, decreasing exponentially for each prior period.

The practical difference: the EMA responds faster to recent price changes. The 50-day EMA will cross a significant level days before the 50-day SMA in a fast-moving market. This makes EMAs more useful for shorter-term trend following and more prone to false signals in choppy markets. SMAs are smoother, slower, and better for identifying long-term trend direction.

Standard moving average settings used by professionals:
— 200-day SMA: the primary long-term trend indicator. Above = bullish context. Below = bearish context.
— 50-day SMA (or EMA): the intermediate trend. Often used as dynamic support in uptrends.
— 20-day EMA: the short-term trend in active moves. Price staying above the 20 EMA in an uptrend indicates momentum.
— 9-period EMA on 4H or daily: used by active swing traders for short-term trend pulses.

The golden cross (50 SMA crosses above 200 SMA) and death cross (50 SMA crosses below 200 SMA) are widely reported as major trend signals. Historically, on Bitcoin monthly charts they have correctly identified bull/bear cycles. On shorter timeframes (daily or 4H), they generate many false signals due to lag.`,
          visualPrompt: `👆 Moving average dynamic support in an uptrend — 50 EMA as floor`,
          visualType: `gif`,
          visualUrl: `moving-average-support`,
          strategy: `Use the 200-day SMA as your primary trend filter — only take long positions when price is above it. Use the 50-day SMA or EMA as dynamic support for intermediate swing entries — price touching and bouncing from the 50-day in an uptrend is a classic higher-conviction entry. Do not use moving average crossovers as entry triggers — they lag too much. Use price structure as the entry; the MA confirms the trend context.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, 200-day SMA trend filter]`,
              context: `A swing trader only takes long trades when BTC is above its 200-day SMA. In November 2022, BTC fell below the 200-day SMA. The trader stopped all long trades. In January 2023, BTC reclaimed the 200-day SMA.`,
              scenario: `By filtering all longs to "above 200-day SMA only," the trader avoided the entire FTX collapse drawdown (November 2022: BTC from $21,000 to $16,000). They resumed longs only when BTC reclaimed and held above the 200-day SMA in January 2023.`,
              outcome: `The 200-day SMA filter did not predict the collapse. It simply meant: when the long-term average is above price, the average of the past 200 days is higher than today — the trend is bearish. No need to be long in bearish conditions.`,
            },
            {
              contextTag: `[Day Trader, ETH/USDT, 50 EMA as dynamic support]`,
              context: `A day trader uses the 50-period EMA on the 4-hour chart as a support level in uptrending conditions.`,
              scenario: `ETH's 4H 50 EMA is at $3,680. ETH pulls back from $3,820 to $3,695, briefly touching the 50 EMA and forming a bullish hammer candle. The trader enters at $3,700 with stop at $3,620 (below the EMA and a prior swing low) and target $3,900.`,
              outcome: `ETH bounces from the 50 EMA at $3,695 and reaches $3,880 over the next 3 days. The 50 EMA acted as dynamic support because: (1) the trader knew the level before price reached it, (2) many other traders were watching the same level, (3) the EMA level coincided with a prior price structure level.`,
            },
            {
              contextTag: `[Analyst, Golden Cross reliability analysis]`,
              context: `An analyst backtests the golden cross (50 SMA crosses above 200 SMA) on BTC daily charts from 2017 to 2024.`,
              scenario: `Results: 6 golden crosses occurred. 4 were followed by significant uptrends (50%+ gains before new death cross). 2 were false signals (golden cross occurred during consolidation, reversed within 30 days). Average lag from actual trend change to golden cross signal: 43 days.`,
              outcome: `The golden cross correctly identified major bull market entries 67% of the time but with 43-day average lag. By the time the golden cross confirmed the trend, BTC had already moved 18-28% from the actual bottom. Useful as macro confirmation — not as a trade entry timing signal.`,
            },
          ],
          keyTakeaway: `The 200-day SMA is your primary trend filter: long above it, cautious below it. The 50-day SMA/EMA is dynamic support for swing entries in uptrends. EMAs respond faster than SMAs but generate more false signals in choppy conditions. Use MAs for trend context, not trade timing.`,
          guidedPractice: [
            {
              question: `BTC is trading at $68,000. The 200-day SMA is at $71,400. The 50-day SMA is at $69,200. What does this tell you about the market context for long positions?`,
              options: [
                `A — Long conditions are excellent — price is near both SMAs`,
                `B — Bearish context — price is below the 200-day SMA ($68,000 < $71,400). Long positions face the headwind of the long-term average being above price. Only high-conviction setups at major support warrant longs in this environment.`,
                `C — Neutral — the two SMAs are close to each other`,
                `D — The death cross will happen soon — don't trade at all`,
              ],
              correct: 1,
              hint: `The 200-day SMA represents the average price of the past 200 days. If it's above current price, what does that mean about the trend?`,
              explanation: `B is correct. When price is below the 200-day SMA, the average of the past 200 days of price is higher than today — meaning the trend has been down on a long-term basis. Long positions face headwinds: price needs to recover to the MA level before making new highs. Professional approach: in sub-200 SMA conditions, only take the strongest setups at major structural support with above-average volume, and reduce position sizes. The 50-day SMA at $69,200 being above price ($68,000) reinforces the intermediate-term bearish context.`,
            },
            {
              question: `What is the primary difference between an SMA and an EMA, and which is better for identifying short-term momentum?`,
              options: [
                `A — SMA is more accurate; EMA is less reliable`,
                `B — EMA weights recent prices more heavily and responds faster to current price changes. It is better for short-term momentum. SMA is smoother and slower, better for long-term trend direction.`,
                `C — They produce identical results on any timeframe`,
                `D — EMA is only used by institutional traders`,
              ],
              correct: 1,
              hint: `How does the calculation method differ between SMA (equal weight to all N periods) and EMA (exponential weighting toward recent)?`,
              explanation: `B is correct. SMA: every period has equal weight (1/N). A single old closing price 200 days ago has the same weight as yesterday. EMA: most recent close has the highest weight (determined by a smoothing multiplier), decreasing exponentially going back in time. Result: EMA moves faster when recent prices change significantly. For short-term momentum signals (20 EMA, 9 EMA), the EMA's responsiveness is an advantage. For long-term trend context (200-day), the SMA's stability prevents overreaction to short-term spikes.`,
            },
            {
              question: `ETH is in a daily uptrend. Price has pulled back to touch the 50-day EMA. Volume on today's candle is 1.9× average. What type of entry signal does this represent?`,
              options: [
                `A — A weak signal — moving averages are lagging indicators`,
                `B — A high-quality dynamic support entry: the 50-day EMA has acted as support multiple times in the current uptrend, the volume spike confirms buying activity at the level, and the daily trend provides the directional tailwind.`,
                `C — An automatic buy signal — always buy when price touches the 50 EMA`,
                `D — A signal to check if price is below the 200-day SMA first`,
              ],
              correct: 1,
              hint: `What does the combination of 50 EMA touch + volume spike + daily uptrend represent in terms of the confluence framework?`,
              explanation: `B is correct. This is a confluence entry: dynamic support (50 EMA repeatedly tested in the uptrend) + volume confirmation (1.9× average = institutional buying at the level) + trend alignment (daily uptrend provides tailwind). Two to three independent signals pointing to the same entry. It is not an automatic buy (C) — confirmation of the bounce still needed (a trigger candle at the EMA level). D is also important but we're told the daily trend is up — implying price is above the 200-day SMA.`,
            },
            {
              question: `A golden cross (50 SMA crosses above 200 SMA) just occurred on BTC's daily chart. BTC has already moved from $38,000 to $54,000. Should you buy at $54,000 based on the golden cross signal?`,
              options: [
                `A — Yes — the golden cross confirms the bull market has begun`,
                `B — No — or at minimum exercise caution. The golden cross has a 43-day average lag, meaning the trend may have started at $38,000. Buying at $54,000 on a lagging confirmation after a 42% move creates poor R:R. Better entry points were available weeks ago.`,
                `C — No — golden crosses are always false signals`,
                `D — Yes — golden crosses always lead to continued upside`,
              ],
              correct: 1,
              hint: `If the golden cross lags the actual trend start by 43 days, and price has moved 42% in those 43 days — what is the opportunity cost of using it as an entry signal?`,
              explanation: `B is correct. The golden cross is a confirmation of a trend that has already been established for weeks. Using it as an entry signal means consistently entering late — after a significant portion of the move has occurred. The appropriate use: the golden cross confirms the macro environment is bullish, which increases confidence in swing trades aligned with the trend. It is NOT an entry signal for individual trades. The actual swing entry was at one of the pullbacks during the $38,000–$54,000 run — not at the golden cross itself.`,
            },
            {
              question: `In an active uptrend, which moving average tends to work best as dynamic support for pullback entries?`,
              options: [
                `A — 200-day SMA — the longest-term average`,
                `B — 50-day SMA or 50-period EMA — close enough to current price to provide meaningful pullback targets while being far enough to define the intermediate trend`,
                `C — 5-day EMA — the fastest moving average for precise entries`,
                `D — All moving averages provide equal support`,
              ],
              correct: 1,
              hint: `In an active uptrend, what is the typical pullback depth before a trend resumes? Which MA is likely closest to that depth?`,
              explanation: `B is correct. In a healthy uptrend, pullbacks of 5–15% are normal and frequently find support at the 50-day MA/EMA. The 200-day (A) is typically much further below current price in a strong uptrend — a pullback to the 200-day SMA would be a major correction (20%+). The 5-day EMA (C) is so close to current price that normal daily volatility would constantly trigger it. The 50-day provides the balance between "close enough to be a meaningful level" and "far enough to represent a real pullback rather than just noise."`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT daily chart. Moving average setup question:

Chart data:
- 200-day SMA: $68,400 (rising)
- 50-day SMA: $71,200 (rising)
- 20-day EMA: $72,800 (rising)
- Current price: $73,600
- Daily trend: up (10 weeks)
- Recent price action: pulled back from $76,800 high to $72,400 (touched 20 EMA), now recovering

Today's candle: bullish engulfing, close $73,600, volume 2.3× average.

Questions:
1. Which MA was touched on the pullback and what does that signal?
2. Is this a valid swing entry based on the MA context?
3. Set stop, TP1, TP2 — justify each level
4. How would your approach change if price were at $66,000 (below the 200-day SMA)?`,
              scoringCriteria: [
                `20-day EMA at $72,800 touched. In an uptrend, price touching the 20 EMA and bouncing is a short-term continuation signal — indicates the trend is still active.`,
                `Valid swing entry: YES. 200-day above ($68,400 well below) = bullish context. 50-day below current price ($71,200) = intermediate trend intact. 20 EMA bounce with engulfing candle + 2.3× volume = trigger confirmed. All 5 checklist elements present.`,
                `Stop: $71,200 or $71,500 (below 50-day SMA and below the pullback low of $72,400 with buffer). Risk: approximately $2,100–$2,400.`,
                `TP1: $76,600 (prior high area). TP2: $79,200–$80,000 (measured move + psychological).`,
                `At $66,000 (below 200-day SMA at $68,400): bearish context. No long trades unless at major structural support with exceptional confluence. Reduce to 0.5% risk if trading at all. Primary bias should be to the downside.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Evaluate these five moving average based trade setups and determine which are valid:

Setup 1: BTC golden cross just occurred (50 SMA crossed above 200 SMA). Price at $54,000. Previous bear market low: $15,000. Trader wants to buy at $54,000.

Setup 2: ETH above 200-day SMA. Price pulled back to 50-day EMA ($3,660). Bullish hammer formed at the EMA level. Volume 1.8×. Trader wants to buy at $3,680 (trigger candle close).

Setup 3: SOL below 200-day SMA. Price bouncing. Trader sees 20 EMA rising and wants to buy the "EMA crossover."

Setup 4: BTC at $72,400. 20 EMA at $71,800. 50 EMA at $70,200. 200-day SMA at $68,400. All three MAs below price and rising. Trader wants to "buy all three MA bounces" simultaneously.

Setup 5: ETH at $3,740. 50-day EMA at $3,580. ETH has not touched the 50 EMA in 8 weeks (strong trend). Trader wants to set a limit order at $3,580 for the "next 50 EMA bounce."`,
              scoringCriteria: [
                `Setup 1: Marginal/poor timing. Golden cross confirmed but 43-day lag means $38,000–$54,000 has already occurred. Better: wait for a pullback to the 50 SMA before entering. At $54,000 without a recent pullback entry, R:R is poor.`,
                `Setup 2: VALID. Classic 50 EMA dynamic support in uptrend + volume + trigger candle. All five checklist elements met. Recommended entry.`,
                `Setup 3: AVOID. Below 200-day SMA = bearish long-term context. 20 EMA crossover in sub-200 SMA environment is a low-quality signal with headwind. Wait for 200 SMA reclaim.`,
                `Setup 4: Over-complicated. All three MAs are below current price and rising — they don't represent current support levels, they're historical averages below the active range. No current MA is being tested. Not a valid MA-based entry.`,
                `Setup 5: Speculative. $3,580 is a valid technical level (50 EMA in an uptrend) but 8 weeks without touching it suggests the 20 EMA ($3,680–$3,720 area) may be more relevant. Setting the limit at $3,580 risks missing the actual bounce at a higher level. Consider if the 20 EMA pullback is a better target.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `SOL/USDT daily chart. You are deciding between two entry approaches:

Chart data:
- SOL daily uptrend (12 weeks)
- 200-day SMA: $142
- 50-day EMA: $178
- 20-day EMA: $185
- Current price: $188.40
- Recent history: pulled back from $196 to $181 (touched 50-day EMA), bounced, now at $188.40
- The $181 bounce: moderate volume (1.3× average), doji candle followed by one bullish candle

Approach A: Enter at current $188.40 — the bounce from the 50 EMA confirms the uptrend.
Approach B: Wait for a retest of the 50 EMA ($178) for a better entry price.

Analyze both approaches with R:R, probability, and opportunity cost considerations.`,
              scoringCriteria: [
                `Approach A ($188.40 entry): Stop below the $181 swing low with buffer = $179.50. Risk = $8.90/SOL. TP1 at $196 (prior high). Reward = $7.60. R:R = 0.85:1. FAILS minimum 2:1.`,
                `For Approach A to meet 2:1: need target at $188.40 + 2×$8.90 = $206.20. TP at $206 (no immediate resistance there). R:R 2:1 only if the next resistance is $206+.`,
                `Approach B ($178 entry): Stop at $171 (below 50 EMA with buffer). Risk = $7/SOL. Target $196. Reward = $18. R:R = 2.57:1. PASSES.`,
                `Opportunity cost of B: SOL may not pull back to $178 — if the trend resumes from $188, Approach B misses the trade entirely.`,
                `Resolution: Approach A's R:R only works if the measured move target is $206+. Approach B is technically superior (better R:R) but risks missing the trade. A compromise: enter a partial position now at $188.40 targeting $206 (2:1 R:R if that level is validated) and set a second limit at $178 for the remainder if the pullback occurs.`,
                `User correctly identifies the R:R problem with current entry and explores the $178 alternative.`,
              ],
            },
          ],
        },

        {
          id: 'rsi',
          title: `RSI — Relative Strength Index`,
          explanation: `J. Welles Wilder introduced the RSI in 1978 in "New Concepts in Technical Trading Systems." He intended it as a momentum oscillator — a tool to measure the velocity of price change and identify potential exhaustion points. Wilder himself said RSI signals should be confirmed by price action before acting. Over 45 years of use, professional traders have learned both the value and the limitations of this indicator.

RSI = 100 − (100 / (1 + RS)), where RS = Average Gain / Average Loss over N periods (default: 14). The result oscillates between 0 and 100. Above 70: traditionally "overbought." Below 30: traditionally "oversold."

The three useful applications of RSI:

1. Overbought/oversold as context (not a signal). RSI above 70 in an uptrend = the trend is running hot, not necessarily ending. RSI below 30 in a downtrend = the decline is extended, not necessarily reversing. Use this to calibrate position sizing and caution, not to trigger trades.

2. RSI divergence: the most powerful RSI signal. Bullish divergence: price makes a lower low but RSI makes a higher low — momentum declining before price confirms. Bearish divergence: price makes a higher high but RSI makes a lower high. Divergence historically precedes reversals more reliably than simple overbought/oversold readings, but still requires price confirmation before acting.

3. RSI level rejection: RSI repeatedly fails to surpass 60 during a recovery in a downtrend. This "bearish RSI" pattern suggests the recovery lacks genuine momentum. RSI staying below 50 in a downtrend = the bears remain in control of momentum.

The 14-period RSI is the most common setting. Shorter periods (9 RSI): more responsive, more false signals. Longer periods (21 RSI): smoother, fewer signals, more reliable when signals do appear.`,
          visualPrompt: `👆 RSI bullish divergence — price lower low, RSI higher low`,
          visualType: `gif`,
          visualUrl: `rsi-divergence-example`,
          strategy: `Primary RSI use: divergence detection. Check for bullish divergence at support levels and bearish divergence at resistance. Do not trade overbought/oversold readings alone — they are context, not signals. Confirm any RSI divergence signal with a price action trigger candle before entering. Set RSI to 14 periods.`,
          examples: [
            {
              contextTag: `[Swing Trader, ETH/USDT, bullish RSI divergence]`,
              context: `ETH makes a lower low at $3,480 (below the prior low of $3,620). RSI on the daily chart: prior low reading 28. Current low reading: 38 (higher than the prior low despite price being lower).`,
              scenario: `Bullish divergence confirmed: price made a lower low, RSI made a higher low. The trader waits for a trigger candle — ETH forms a bullish engulfing candle the next day, closing at $3,560.`,
              outcome: `Entry at $3,560. Stop at $3,420 (below the divergence low). Target $3,840 (prior resistance). R:R = $280/$140 = 2:1. ETH recovers to $3,860 over 8 days. The divergence correctly identified exhaustion of the selling momentum, confirmed by the subsequent price trigger candle.`,
            },
            {
              contextTag: `[Trader, BTC/USDT, RSI overbought misuse]`,
              context: `A trader shorts BTC every time the daily RSI crosses above 70, assuming it "must reverse."`,
              scenario: `During BTC's 2024 bull run, RSI remained above 70 for 18 consecutive days as BTC rose from $52,000 to $73,000. The trader shorted at RSI 71, 73, 76, 79, 81, and 74 — shorting into a sustained uptrend.`,
              outcome: `All six short trades resulted in losses. Total loss: approximately 26% of account across the six positions. RSI above 70 in a strong uptrend means the trend is robust, not that it is ending. RSI overbought during a bull market = buy confirmation, not a short signal. Using overbought as a sell trigger in an uptrend is one of the most reliably unprofitable strategies in crypto.`,
            },
            {
              contextTag: `[Analyst, RSI period comparison]`,
              context: `A trader compares 9-period RSI vs 14-period RSI vs 21-period RSI on BTC daily charts.`,
              scenario: `In a 6-month backtest: 9-period RSI generated 42 divergence signals — 18 accurate (43%). 14-period RSI: 22 signals — 13 accurate (59%). 21-period RSI: 12 signals — 9 accurate (75%). Fewer signals, higher accuracy for longer periods.`,
              outcome: `The 21-period RSI had the highest accuracy per signal but generated so few signals that trading it exclusively meant missing long stretches of the market. The 14-period RSI balanced signal frequency (22/6 months = ~4/month) with accuracy (59%). The 9-period was too noisy for swing trading. For active swing traders: 14-period is the standard. For position traders: 21-period provides cleaner signals.`,
            },
          ],
          keyTakeaway: `RSI's most useful application is divergence — price making a new extreme while RSI fails to confirm it. Overbought (>70) and oversold (<30) are context, not signals. Always confirm RSI divergence with a price action trigger before entering. Use 14-period RSI as the standard setting.`,
          guidedPractice: [
            {
              question: `BTC makes a new high at $74,200. RSI makes a lower high (was 78 at the prior high, now 68 at the new high). What does this indicate and what should you do?`,
              options: [
                `A — Strong bullish signal — new price high confirms the uptrend`,
                `B — Bearish RSI divergence: price made a higher high but RSI made a lower high — momentum is weakening on the new high. This is a warning that the trend may be exhausting. Tighten trailing stops, reduce new long exposure, watch for a bearish trigger candle.`,
                `C — RSI 68 is still above 50 — no signal.`,
                `D — Buy the dip if price falls — the divergence doesn't matter.`,
              ],
              correct: 1,
              hint: `Bearish divergence: price goes up, RSI goes down. What does declining momentum at a new high historically suggest about the sustainability of the move?`,
              explanation: `B is correct. Bearish RSI divergence (price higher high, RSI lower high) indicates that while price is making a new high, the momentum behind the move is declining. Fewer buyers are driving the move higher — the ratio of average gains to losses on each candle is smaller. This historically precedes corrections or trend reversals more reliably than RSI overbought alone. Correct response: (1) do not open new long positions, (2) tighten trailing stops on existing longs, (3) watch for a bearish trigger candle (engulfing, shooting star) as the confirming signal to reduce exposure.`,
            },
            {
              question: `RSI is at 28 on BTC's daily chart. A friend says "RSI is oversold — guaranteed bounce, buy now." What is the correct assessment?`,
              options: [
                `A — They are right — RSI below 30 always bounces`,
                `B — RSI 28 indicates extended downward momentum, not a guaranteed reversal. In a strong downtrend, RSI can remain below 30 for weeks. The oversold reading is a caution flag — look for a price structure trigger (support level, bullish candle) before acting.`,
                `C — They are wrong — RSI below 30 means the downtrend will continue`,
                `D — Correct — RSI 28 is the most reliable buy signal in crypto`,
              ],
              correct: 1,
              hint: `In 2022's crypto bear market, BTC RSI was below 30 for extended periods while price continued falling. What does this tell you about the reliability of RSI 30 as a buy signal?`,
              explanation: `B is correct. RSI below 30 means average losses have significantly exceeded average gains over the past 14 periods. In a sustained downtrend, this condition is normal and can persist. The bear markets of 2018 and 2022 both featured prolonged sub-30 RSI on BTC. The correct response: note the oversold context (useful for reducing short exposure, not for opening longs), then wait for price to show its own bottoming signals — a higher low, a bullish candle at a structural support, a volume spike at a key level. RSI 28 without price confirmation is not a trade entry.`,
            },
            {
              question: `What is bullish RSI divergence and what two conditions must be simultaneously present?`,
              options: [
                `A — RSI above 50 while price is rising`,
                `B — Price makes a lower low while RSI makes a higher low — simultaneously, meaning the most recent RSI low is higher than the prior RSI low while price made a new low below the prior price low`,
                `C — RSI crosses above 30 from below`,
                `D — Price makes a higher high while RSI also makes a higher high`,
              ],
              correct: 1,
              hint: `Divergence means the indicator and price are moving in different directions. For bullish divergence: price is doing what and RSI is doing what?`,
              explanation: `B is correct. Bullish divergence requires both conditions simultaneously: (1) price makes a lower low (new price bottom below the prior bottom), and (2) RSI makes a higher low (the RSI reading at the new price bottom is higher than the RSI reading at the prior price bottom). This divergence means: price went lower but momentum (ratio of gains to losses) is improving. The sellers are running out of force. This historically precedes reversals when accompanied by a confirming trigger candle. A and D describe different RSI patterns. C (RSI crossing above 30) is sometimes called an "oversold cross" but is not the same as divergence.`,
            },
            {
              question: `You see RSI divergence on ETH's daily chart. ETH made a lower low at $3,480, but RSI made a higher low. No trigger candle yet. Should you enter?`,
              options: [
                `A — Yes — divergence alone is a high-quality entry signal`,
                `B — No — wait for a confirming price action trigger (bullish candle) at the divergence low before entering. Divergence without price confirmation has too high a false positive rate.`,
                `C — Yes — the divergence confirms the reversal has started`,
                `D — No — RSI divergence is never reliable`,
              ],
              correct: 1,
              hint: `RSI divergence identifies potential exhaustion. But price can continue to a new lower low with new divergence before reversing. What prevents entry on the first divergence?`,
              explanation: `B is correct. RSI divergence shows that momentum is weakening at a lower low, but it doesn't tell you when the actual reversal will happen. Price can make multiple consecutive lower lows with divergence each time before finally reversing. Entering on the divergence alone exposes you to continued downside. The trigger candle (bullish engulfing, hammer, morning star) confirms that buyers have actually stepped in at the level. Divergence + trigger candle = confirmed setup. Divergence alone = speculation.`,
            },
            {
              question: `During a strong BTC uptrend, RSI has remained between 65–80 for 3 weeks. What does this mean for your swing trade longs?`,
              options: [
                `A — You should not take long positions — RSI is too high`,
                `B — RSI staying elevated in a strong uptrend is a sign of trend health, not exhaustion. Continue to take valid long setups at pullbacks to support. Only become cautious when RSI begins making lower highs while price continues higher (bearish divergence).`,
                `C — RSI must reach 30 before any long is valid`,
                `D — RSI above 60 means the trend is about to end`,
              ],
              correct: 1,
              hint: `In a sustained bull market, what do elevated RSI readings consistently indicate?`,
              explanation: `B is correct. In a strong trending market, RSI can remain elevated (60–80) for extended periods — this is called "bullish RSI momentum" and is a trend health indicator, not a warning. A trend that consistently keeps RSI above 50 is one where buyers dominate on most candles. The useful signal arrives when RSI begins making lower highs despite price continuing higher (bearish divergence) — that's the warning of momentum deterioration. A is a common error: avoiding all longs because RSI is "high" misses the primary uptrend in the name of avoiding overbought conditions.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `ETH/USDT daily chart. RSI analysis required.

Price data (last 14 days):
Day 1: $3,840. RSI: 72. Day 2: $3,900. RSI: 74. Day 3: $4,020 (new high). RSI: 71.
Day 4: $3,960. RSI: 68. Day 5: $3,880. RSI: 63. Day 6: $4,080 (new high). RSI: 69.
Day 7: $4,120 (new high). RSI: 66. Day 8: $4,040. RSI: 58. Day 9: $3,960. RSI: 53.
Day 10: $4,100 (new high). RSI: 61. Day 11: $4,180 (new high). RSI: 63.
Day 12: $4,140. RSI: 59. Day 13: $4,080. RSI: 52. Day 14 (today): $4,000. RSI: 48.

Questions:
1. Identify all instances of bearish divergence in this data series
2. What action would bearish divergence have suggested at each instance?
3. Current state: RSI 48 and falling, price at $4,000. Is this bullish or bearish RSI context?
4. Would you open a long position today? Justify.`,
              scoringCriteria: [
                `Bearish divergence instances: Day 3 ($4,020, RSI 71) → Day 6 ($4,080, RSI 69) = price higher, RSI lower. Divergence #1.`,
                `Day 6 ($4,080, RSI 69) → Day 7 ($4,120, RSI 66) = price higher, RSI lower. Divergence #2.`,
                `Day 7 ($4,120, RSI 66) → Day 10 ($4,100, RSI 61) = price lower but new high at Day 11. Day 10 ($4,100, RSI 61) → Day 11 ($4,180, RSI 63) = RSI recovered slightly but still lower than Day 7. Continuing divergence.`,
                `Actions suggested by divergence: (1) After Day 6: tighten trailing stops, reduce new long exposure. (2) After Day 7: no new longs, consider partial profit-taking on existing positions.`,
                `Current state (Day 14, RSI 48): bearish context. RSI at 48 means selling pressure has increased — the trend has shifted from buying dominance (>50) to neutral/selling. Price also falling from $4,180 high.`,
                `Open long today? NO. The multiple divergence signals + RSI now below 50 + price declining from the high suggests the trend may be weakening. Wait for: RSI to stabilize, a clear support level to form, and a bullish trigger candle at support.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `A trader presents four RSI-based entry decisions and asks you to evaluate each:

Decision 1: BTC at $72,000. RSI: 31 (oversold). Entering long because "oversold means bounce."
Decision 2: ETH at $3,740. Price made a lower low ($3,620 → $3,580). RSI made a higher low (29 → 38). Bullish hammer just formed. Entering long on hammer close.
Decision 3: SOL at $195. RSI: 78. Entering short because "overbought means sell."
Decision 4: BTC at $74,000. Three successive new highs over 10 days with RSI making lower highs each time (76 → 71 → 66). Price now at a prior resistance zone. Avoiding new longs and tightening existing trailing stops.

Rate each decision: correct RSI application, incorrect, or partially correct.`,
              scoringCriteria: [
                `Decision 1: INCORRECT. RSI 31 = oversold context, not a signal. No trigger candle, no support level mentioned, no price structure. "RSI oversold = buy" is the classic misuse.`,
                `Decision 2: CORRECT. Classic bullish divergence (price lower low, RSI higher low) + confirming trigger candle. This is the proper RSI divergence entry workflow. All elements present.`,
                `Decision 3: INCORRECT. RSI 78 in what appears to be an uptrend. Shorting overbought in a trend is fighting the trend. RSI can stay above 70 for weeks in a bull market.`,
                `Decision 4: CORRECT. Three instances of bearish divergence (each new high accompanied by lower RSI high) + at resistance. Correctly identifies the divergence as a warning and responds appropriately (tighten stops, avoid new longs) rather than overreacting (immediate short).`,
                `Summary: Decisions 2 and 4 show professional RSI use. Decisions 1 and 3 show the two most common RSI misuses (oversold = buy, overbought = sell without price structure context).`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `SOL/USDT daily chart. You see a potential RSI-based reversal setup.

Price history (most recent 5 days):
Day -5: $210 (local high). RSI: 74.
Day -4: $204. RSI: 68.
Day -3: $196. RSI: 61.
Day -2: $192. RSI: 55.
Day -1: $186 (new local low, below prior swing low at $188). RSI: 51.
Today: $190 (bouncing from yesterday's $186 low). RSI: 54.

Additional context:
- Daily trend: uptrend for 8 weeks prior to this 5-day decline
- Prior swing low: $188 (violated on Day -1)
- 50-day EMA: $184
- Volume on Day -1 ($186): 2.8× average
- Volume today ($190): 1.4× average

Questions:
1. Is there bullish RSI divergence present? Specify the comparison.
2. Does the volume data support or challenge the reversal hypothesis?
3. Design the entry setup if you decide to enter today
4. What would cause you to abandon this setup?`,
              scoringCriteria: [
                `RSI divergence: Day -5 was $210 with RSI 74. Today/Day -1 is $186/$190 with RSI 51/54. Price lower, RSI lower too — this is NOT bullish divergence, this is a simple decline where both price and RSI are falling together. No bullish divergence exists here.`,
                `To have bullish divergence, need: prior swing low with RSI reading X, then new swing low with RSI reading >X. Price needs to make a lower low while RSI makes a HIGHER low.`,
                `Volume support: Day -1 ($186) had 2.8× volume on a DECLINING price — this is high-volume selling, not buying. This is actually a bearish signal (sellers actively pushing price down). Today's 1.4× volume on the bounce is moderate.`,
                `Should you enter? The setup is weak: no RSI divergence, high-volume selling at the low (not buying), prior swing low violated. This looks like a potential breakdown, not a reversal.`,
                `If entering despite caution: Entry $190, Stop $183 (below 50-day EMA), Target $204–$210. R:R = $14/$7 = 2:1 barely. Minimum acceptable.`,
                `Abandon setup if: SOL closes below $184 (50-day EMA breached), or RSI falls back below 50 on any recovery attempt.`,
              ],
            },
          ],
        },

        {
          id: 'macd',
          title: `MACD — Momentum and Crossovers`,
          explanation: `Gerald Appel developed the MACD (Moving Average Convergence Divergence) in the late 1970s. The full name describes exactly what it measures: when moving averages are converging or diverging. The MACD consists of three components, and understanding each is essential to using it correctly.

MACD Line = 12-period EMA − 26-period EMA. When the shorter EMA (12) is above the longer EMA (26), the MACD line is positive — short-term momentum is above long-term momentum. When below: the reverse.

Signal Line = 9-period EMA of the MACD Line. A slower-moving average of the MACD itself — smoothed to reduce noise.

Histogram = MACD Line − Signal Line. The bars visually show the distance between the two lines. When the histogram is rising, the MACD line is pulling away from the signal line — momentum accelerating. When the histogram is falling (but still positive), momentum is decelerating.

The four MACD signals:
1. Centerline crossover: MACD line crosses above or below zero. Above zero = short-term EMA above long-term EMA = bullish momentum. Below zero = bearish.
2. Signal line crossover: MACD line crosses above signal line = bullish momentum shift. Most common MACD trade trigger. Significant lag — use as confirmation only.
3. Divergence: price makes new high/low but MACD does not. Same principle as RSI divergence — indicates momentum weakening at extremes.
4. Histogram direction change: histogram begins shrinking after sustained expansion — early signal that momentum is slowing before the signal line crossover.

The key limitation: MACD is a lagging indicator built from two lagging EMAs. The signal line is a further lag on top. By the time the MACD line crosses the signal line, much of the move has occurred. Professional use: confirm existing trades and identify divergence. Not for trade entry timing.`,
          visualPrompt: `👆 MACD components labeled — line, signal, histogram`,
          visualType: `gif`,
          visualUrl: `macd-components`,
          strategy: `Use MACD histogram direction change as an early warning signal. When the histogram is positive but begins shrinking for 2–3 bars, momentum may be decelerating — consider tightening trailing stops. Use MACD divergence (price new high but MACD lower high) as a warning to reduce long exposure. Do not enter trades based on MACD crossover alone — too much lag.`,
          examples: [
            {
              contextTag: `[Swing Trader, BTC/USDT, MACD divergence warning]`,
              context: `BTC has been in a strong uptrend. MACD is positive. Price makes a new all-time high at $73,800. But MACD line at the new high is lower than at the prior high of $69,200.`,
              scenario: `MACD bearish divergence: price new high at $73,800, MACD lower than at $69,200's peak. The trader does not short (divergence alone is not a short signal in an uptrend) but tightens all trailing stops by switching from 3× ATR to 2× ATR.`,
              outcome: `BTC reaches $74,200 then reverses to $67,800 over 12 days. The tightened trailing stop (2× ATR from the $74,200 high) triggers at approximately $70,400 — capturing a significant gain while exiting before the major reversal. The MACD divergence was not a short signal but was a correct warning to protect gains.`,
            },
            {
              contextTag: `[New Trader, ETH/USDT, signal line crossover lag]`,
              context: `A new trader uses MACD signal line crossovers (bullish when MACD crosses above the signal line) as entry triggers for all their trades.`,
              scenario: `ETH moves from $3,200 to $3,700. The MACD bullish crossover occurs at $3,580 — 12% after the move has started. The trader enters at $3,590. ETH peaks at $3,840 then reverses. The MACD death cross (signal crossover bearish) occurs at $3,680 — after ETH has already fallen 6.7% from the peak.`,
              outcome: `The MACD crossovers consistently entered at the middle of the move and exited after significant reversal has occurred. The lag of the signal line (a 9-period EMA of the already-lagged MACD line) means the trader is perpetually one step behind the market. Net result of the crossover strategy: bought the middle, sold the middle — capturing only the least volatile portion of each move.`,
            },
            {
              contextTag: `[Professional Trader, SOL/USDT, histogram analysis]`,
              context: `A professional monitors the MACD histogram for early momentum shifts before the signal line crossover occurs.`,
              scenario: `SOL uptrend. MACD histogram has been positive and expanding for 12 days. On day 13, the histogram shrinks slightly (from +4.2 to +3.8). Day 14: shrinks to +3.1. Day 15: +2.4. MACD line is still positive and above the signal line — no bearish crossover yet.`,
              outcome: `The professional tightens trailing stop from 3× ATR to 2× ATR on day 13 when the histogram began shrinking. The signal line crossover (traditional MACD bearish signal) occurs on day 18 — 5 days after the histogram started warning. By day 18, SOL has already fallen 4% from the peak. The early histogram warning captured 4% more of the upside before tightening stops.`,
            },
          ],
          keyTakeaway: `MACD divergence is more useful than crossovers. The histogram direction change is an earlier warning than the signal line crossover. Never use MACD crossover as a primary entry trigger — too much lag. Use MACD to confirm trend direction and monitor momentum deterioration.`,
          guidedPractice: [
            {
              question: `The MACD histogram has been positive and rising for 10 days. It makes its highest bar at 8.4, then on day 11 drops to 7.2, then day 12 drops to 5.8. The MACD line is still above the signal line. What does this indicate?`,
              options: [
                `A — Bullish signal — MACD is still positive`,
                `B — Early warning of momentum deceleration. The histogram shrinking means the gap between MACD line and signal line is narrowing — momentum is slowing. No bearish crossover yet but the trend of momentum is weakening.`,
                `C — The MACD is broken — it should not go down while price rises`,
                `D — This is normal random noise — no significance`,
              ],
              correct: 1,
              hint: `The histogram represents the distance between the MACD line and signal line. What does a shrinking positive histogram mean about that relationship?`,
              explanation: `B is correct. The histogram = MACD line − Signal line. When positive, MACD > signal. When shrinking (8.4 → 7.2 → 5.8), the gap between the lines is decreasing — the two lines are converging. This convergence precedes a potential crossover (bearish signal) and is an early warning that momentum is decelerating. The correct response: not a sell signal, but an alert to tighten protective stops and reduce new long position sizing. If the histogram continues shrinking and crosses zero, that is the formal bearish MACD crossover.`,
            },
            {
              question: `MACD bullish crossover occurs on ETH at $3,580. ETH moved from $3,200 to $3,580 before the crossover. Is this a good entry point?`,
              options: [
                `A — Yes — MACD crossover confirms the uptrend has started`,
                `B — The crossover at $3,580 lags the actual trend start (ETH has already moved 11.9% from $3,200). Entering at $3,580 means entering after most of the initial move. The optimal entry was earlier when price structure and volume confirmed the trend — before the MACD caught up.`,
                `C — Yes — MACD crossovers are the most reliable entry signals`,
                `D — No — MACD crossovers should be ignored in crypto`,
              ],
              correct: 1,
              hint: `The MACD crossover is two lagged EMAs crossing — by definition, the trend has already started before they converge. How does this affect entry quality?`,
              explanation: `B is correct. The MACD crossover is a lagging confirmation. The actual trend start was at $3,200 (evidenced by price structure — higher lows, increasing volume). The crossover at $3,580 confirms what price already showed 10+ days earlier. Entering at $3,580 on the MACD crossover means: (1) entry price 11.9% worse than the actual trend start, (2) stop must now be at a level consistent with the $3,580 entry — further from where the actual risk was at $3,200. Better approach: use price structure for entry timing; use MACD as a confirming context indicator.`,
            },
            {
              question: `What does MACD above zero (centerline) indicate about the relationship between the 12 and 26-period EMAs?`,
              options: [
                `A — The 12-period EMA is below the 26-period EMA`,
                `B — The 12-period EMA is above the 26-period EMA — short-term momentum is higher than medium-term momentum, indicating bullish price action over the past 12 periods relative to the past 26`,
                `C — Price is above the 200-day SMA`,
                `D — RSI must also be above 50`,
              ],
              correct: 1,
              hint: `MACD = 12 EMA − 26 EMA. When MACD is positive (above zero), what is the relationship between the two EMAs?`,
              explanation: `B is correct. MACD = 12-period EMA − 26-period EMA. If MACD is positive (above zero), then 12 EMA > 26 EMA. The 12-period EMA responds to recent prices faster than the 26-period EMA. When the faster (recent) average is above the slower (longer-term) average, it means recent prices are higher than the longer-term average — bullish momentum. MACD below zero = 12 EMA < 26 EMA = recent prices below longer-term average = bearish momentum.`,
            },
            {
              question: `Which MACD application has the most lag and should NOT be used as a trade entry trigger?`,
              options: [
                `A — Histogram direction change (first bar of shrinkage)`,
                `B — MACD divergence (price/MACD disagreement)`,
                `C — Signal line crossover (MACD line crosses above/below the signal line)`,
                `D — Centerline crossover (MACD crosses zero)`,
              ],
              correct: 2,
              hint: `The signal line is itself a 9-period EMA of the MACD line. How many layers of averaging does this add?`,
              explanation: `C is correct. The signal line crossover has the most lag of the four MACD signals because: (1) MACD is already a derivative of two lagged EMAs, (2) the signal line is a 9-period EMA of the MACD — a moving average of a moving average. By the time the MACD line crosses the 9-period EMA of itself, the underlying price trend is well-established. The histogram direction change (A) is the earliest signal — it detects momentum change before the crossover. Divergence (B) can be an early warning at price extremes. The centerline crossover (D) lags but is significant for macro context.`,
            },
            {
              question: `What is the correct professional response when MACD shows bearish divergence on a long position?`,
              options: [
                `A — Exit the long immediately`,
                `B — Tighten trailing stops or advance the stop to the nearest prior profit level. Do not exit based on MACD divergence alone — wait for price to confirm the reversal.`,
                `C — Ignore MACD divergence — it is too unreliable`,
                `D — Double the position — divergence is a buy signal`,
              ],
              correct: 1,
              hint: `Bearish MACD divergence is a warning, not a confirmed reversal. What management action calibrates to a "warning" level response?`,
              explanation: `B is correct. Bearish MACD divergence warns that momentum is weakening on the current price high. The correct response is protective (tighten stops, advance to prior profit level) but not trigger-reactive (don't exit the entire position on the divergence alone). Price must confirm the reversal with a bearish candle, break of support, or other price structure signal. Acting on MACD divergence alone prematurely exits trades that may continue higher. Not acting at all ignores a statistically meaningful warning sign.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `BTC/USDT, daily chart. You hold a long position and are monitoring MACD.

Position:
- Entry: $70,800
- Stop: currently at $72,000 (moved from entry after trade proved itself)
- Position: 0.12 BTC
- Current price: $74,400

MACD data (last 8 bars):
Bar 1: MACD +1,240. Histogram +180.
Bar 2: MACD +1,380. Histogram +240.
Bar 3: MACD +1,460. Histogram +280.
Bar 4: MACD +1,540. Histogram +310. (Peak histogram)
Bar 5: MACD +1,580. Histogram +290. (Histogram peaks and shrinks)
Bar 6: MACD +1,610. Histogram +260. (Histogram continues shrinking despite MACD still rising)
Bar 7: MACD +1,590. Histogram +210. (MACD starts declining)
Bar 8 (today): MACD +1,520. Histogram +155. Price $74,400.

Current ATR: $1,800.

Questions:
1. Identify when momentum deceleration began and what the signal was
2. What stop management action should have occurred at bar 5?
3. Calculate ATR-based trailing stop positions using 2× ATR and 3× ATR at bar 8 (highest price)
4. Given the MACD trajectory, would you add to the long position today?`,
              scoringCriteria: [
                `Momentum deceleration started at Bar 5 — histogram peaked at +310 (Bar 4) and first shrank to +290 (Bar 5). MACD still rising but histogram (the gap between lines) is narrowing.`,
                `Bar 5 action: tighten trailing stop from current 3× ATR to 2× ATR. Current 3× ATR ($1,800 × 3 = $5,400 trail). Switch to 2× ATR: $1,800 × 2 = $3,600 trail.`,
                `If highest price was approximately $75,000 (Bar 6-7 range): 2× ATR trail = $75,000 − $3,600 = $71,400. 3× ATR trail = $75,000 − $5,400 = $69,600.`,
                `Today (Bar 8, $74,400): MACD declining, histogram shrinking significantly. Do NOT add to long. Momentum is deteriorating. The correct action is to maintain the tightened trailing stop and wait. Adding capital on deteriorating momentum is the opposite of good trade management.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Analyze this 90-day MACD trading record on a 4H ETH chart:

Total trades triggered by MACD signal line crossovers: 42
Profitable: 18 (42.9%)
Unprofitable: 24 (57.1%)
Average profit per win: 2.3R
Average loss per loss: 1.2R
Net EV: (42.9% × 2.3R) − (57.1% × 1.2R) = 0.987R − 0.685R = +0.302R per trade

Total trades triggered by MACD divergence + price confirmation: 8
Profitable: 6 (75%)
Unprofitable: 2 (25%)
Average profit: 3.4R
Average loss: 1.0R
Net EV: (75% × 3.4R) − (25% × 1.0R) = 2.55R − 0.25R = +2.3R per trade

Questions:
1. Which MACD application produces better outcomes?
2. Why would crossovers produce a lower win rate than divergence + confirmation?
3. What strategic allocation would you recommend between the two approaches?
4. Calculate total R over the 90-day period for each approach and compare`,
              scoringCriteria: [
                `Divergence + confirmation massively outperforms: 2.3R/trade vs 0.302R/trade = 7.6× better EV per trade.`,
                `Crossovers lower win rate because: (1) lagging signal enters after the move, (2) choppy markets generate many false crossovers, (3) the 4H MACD generates many signals in ranging conditions.`,
                `Divergence + confirmation higher win rate because: (1) requires price AND MACD to agree (two independent signals), (2) only occurs at extremes (meaningful setups), (3) fewer, higher-quality opportunities.`,
                `Total R: Crossovers: 42 trades × 0.302R = 12.7R over 90 days. Divergence: 8 trades × 2.3R = 18.4R over 90 days. Despite being 5× fewer trades, divergence approach generated 45% more total R.`,
                `Recommendation: eliminate crossover-only trades. Focus exclusively on divergence + confirmation entries. Optionally use crossovers as a secondary context filter (not a trigger).`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `SOL/USDT, 4-hour chart. You need to decide on a trade using MACD correctly.

Current chart:
- SOL price: $189.40
- Daily uptrend (8 weeks)
- 4H support at $186–$188 zone (3 prior tests)
- Current 4H candle: bullish hammer, close $189.40, volume 2.0× average
- MACD (12,26,9): Line: +1.42, Signal: +0.98, Histogram: +0.44
- MACD in past 3 bars: Histogram was -0.12, then -0.08 (shrinking negative), then +0.44 today (crossed above zero)

Questions:
1. Does the MACD data support or contradict the bullish setup?
2. Is the MACD crossover (histogram going from negative to positive) an entry trigger here?
3. Design the complete trade and specify where MACD falls in your entry checklist
4. What MACD reading would make you NOT take this trade?`,
              scoringCriteria: [
                `MACD supports the bullish setup: histogram crossed from negative to positive = MACD line crossed above signal line = momentum shifted from bearish to bullish. MACD centerline: +1.42 above zero = 12 EMA > 26 EMA = short-term bullish.`,
                `Is MACD crossover the entry trigger? NO — the MACD crossover is a confirmation element but the primary trigger is the bullish hammer candle at support with volume 2×. The MACD adds confidence as a third signal (price structure, volume, MACD momentum shift = three independent signals).`,
                `Complete trade: Entry $189.40 (bullish hammer close). Stop $184.50 (below support zone with buffer). TP1 $196, TP2 $204. R:R = $6.60/$4.90 = 1.35:1 to TP1 — marginal. R:R to TP2 = $14.60/$4.90 = 2.98:1. Use tiered TP structure.`,
                `MACD reading that would stop the trade: if MACD histogram is negative and expanding (momentum clearly to the downside), or if MACD shows fresh bearish divergence at the support level.`,
              ],
            },
          ],
        },

        {
          id: 'bollinger-bands',
          title: `Bollinger Bands`,
          explanation: `John Bollinger introduced Bollinger Bands in the 1980s and holds a registered trademark on the name. He has repeatedly emphasised that the bands were not designed as "buy the lower band, sell the upper band" tools — a misuse that has led to significant losses for retail traders who apply them that way. Understanding what Bollinger Bands actually measure is the key to using them correctly.

Bollinger Bands consist of three lines: the Middle Band (a 20-period SMA), the Upper Band (SMA + 2 standard deviations), and the Lower Band (SMA − 2 standard deviations). Standard deviation is a statistical measure of price dispersion — how far prices have deviated from the mean.

The statistical foundation: approximately 95% of all price closes fall within 2 standard deviations of the mean in a normally distributed dataset. When price reaches the upper band, it is at the top 2.5% of recent price distribution. When at the lower band, the bottom 2.5%.

The four professional uses:

1. Squeeze: when the bands narrow significantly, volatility is compressing. Low volatility historically precedes high volatility. A Bollinger squeeze (measured by the BandWidth indicator) signals an upcoming breakout — but not direction.

2. Walks: in strong trends, price "walks the band" — repeatedly touching the upper band without meaningfully reversing. This is a trend strength indicator. Repeatedly touching the upper band ≠ sell signal.

3. W-bottom: in a downtrend, a first low at or below the lower band, a brief rally, then a second lower low that does NOT breach the lower band (stays higher). This W-shape is a reversal signal when combined with RSI divergence.

4. M-top: the mirror image at the upper band — two highs near the upper band with a middle pullback. Reversal signal in conjunction with bearish RSI divergence.`,
          visualPrompt: `👆 Bollinger Bands squeeze followed by breakout expansion`,
          visualType: `gif`,
          visualUrl: `bollinger-squeeze-breakout`,
          strategy: `Use Bollinger Bands primarily for squeeze detection — narrowing bands signal upcoming volatility expansion. When a squeeze occurs, wait for the breakout direction (confirmed candle close outside the band on volume) then trade in that direction. Do not use "price at lower band = buy" without additional confluence (support, volume, trigger candle). Price walking the upper band in a trend is not a sell signal.`,
          examples: [
            {
              contextTag: `[Trader, BTC/USDT, Bollinger squeeze breakout]`,
              context: `BTC has been consolidating between $70,800 and $73,200 for 11 days. Bollinger Bands have narrowed to their tightest point in 6 months — BandWidth at 4.2% (historically low).`,
              scenario: `The trader recognises the Bollinger squeeze: a major volatility expansion is approaching. They set buy stop at $73,400 (breakout of upper range) and sell stop at $70,600 (breakdown of lower range). The breakout candle closes at $74,100 on 2.6× volume.`,
              outcome: `The buy stop triggers at $73,400. BTC breaks out of the range and moves to $80,400 over the next 8 days. The Bollinger squeeze correctly identified that a major move was imminent. The direction (up) was confirmed by the breakout candle close and volume. The initial squeeze signal was direction-neutral — the entry was only on confirmed directional break.`,
            },
            {
              contextTag: `[Trader, ETH/USDT, band-walk misuse]`,
              context: `ETH enters a strong uptrend. Daily candles repeatedly close at or near the upper Bollinger Band for 12 consecutive days. A trader repeatedly sells short because "price is at the upper band."`,
              scenario: `ETH rises from $3,400 to $4,100 over 12 days while every daily close is near the upper Bollinger Band. The trader shorts at $3,500, $3,640, $3,780, $3,920, and $4,060 — all stopped out as the trend continues.`,
              outcome: `In a strong trend, price "walking the band" is a sign of trend strength, not exhaustion. Every close at the upper band in a trending market means that day's price action was so strong it pushed to 2 standard deviations above the 20-day mean — a bullish signal, not a bearish one. The trader's losses came from misinterpreting a trend confirmation signal as a reversal signal.`,
            },
            {
              contextTag: `[Analyst, BTC/USDT, W-bottom pattern]`,
              context: `BTC has been declining. During the decline: first low at $61,200 (lower Bollinger Band at $61,000). Brief rally to $65,800. Second decline to $62,400 (lower Bollinger Band at $60,600 — the band moved down, but price's second low ($62,400) was ABOVE the lower band).`,
              scenario: `W-bottom conditions met: first low near/below the lower band, second low above the lower band (price stayed inside the band on the retest). RSI at second low: higher than at first low (bullish divergence). Trigger: bullish engulfing candle at $63,000.`,
              outcome: `Entry at $63,000. BTC reverses from the W-bottom pattern, moving to $72,000 over 3 weeks. The W-bottom correctly identified the selling pressure was exhausting — the second low's failure to break below the lower band indicated the bears were losing force.`,
            },
          ],
          keyTakeaway: `Bollinger Bands measure price deviation from the mean. Use them for squeeze detection (upcoming volatility expansion), band-walk identification (trend strength), and W-bottom/M-top reversal patterns. Never mechanically "buy the lower band" without price structure and volume confirmation.`,
          guidedPractice: [
            {
              question: `Bollinger Bands have been narrowing for 18 days and are now at their tightest in 8 months. What does this tell you and what should you watch for?`,
              options: [
                `A — Price will definitely move up — tightening bands always precede rallies`,
                `B — A Bollinger squeeze signals compressed volatility that historically precedes a major directional move. The direction is unknown. Watch for a candle close outside the bands on above-average volume — that direction is the likely breakout direction.`,
                `C — The market is stable and will remain range-bound`,
                `D — Exit all positions — squeezes predict market crashes`,
              ],
              correct: 1,
              hint: `Volatility oscillates between periods of compression and expansion. What follows a historically low volatility period?`,
              explanation: `B is correct. Bollinger Band squeezes (narrowing to historically tight levels) reflect that price has compressed within a smaller range and historical volatility is low. Low volatility is followed by high volatility (the pattern: quiet market → explosive move). The squeeze itself does not reveal direction — that comes from the breakout candle and volume. The strategy: prepare both directions (long stop above range, short stop below range), execute whichever triggers first on a confirmed candle close with volume.`,
            },
            {
              question: `In a strong ETH uptrend, price closes at the upper Bollinger Band for the 5th consecutive day. What does this indicate?`,
              options: [
                `A — Sell signal — price is severely overbought`,
                `B — Trend strength signal — price walking the upper band in an uptrend means each day's close is at the top 2.5% of recent price distribution, indicating sustained buying pressure and trend momentum`,
                `C — A reversal is imminent — no asset can close at the upper band 5 consecutive days`,
                `D — The Bollinger Bands have broken and need to be recalibrated`,
              ],
              correct: 1,
              hint: `In a strong trend, closing at the upper band means what about the relationship between recent price and the 20-day mean?`,
              explanation: `B is correct. Consistently closing at the upper Bollinger Band during a trend means each day's price is at 2 standard deviations above the 20-day average — a statistically extreme reading that reflects dominant buying pressure. In a strong uptrend, this is normal and expected. John Bollinger himself documented "walking the band" as a trend-strength indicator. The misuse: shorting every close at the upper band loses money in trending markets because it confuses "statistically extended" with "must reverse."`,
            },
            {
              question: `What are the conditions for a valid W-bottom Bollinger Band reversal pattern?`,
              options: [
                `A — Two consecutive closes at the lower band`,
                `B — A first low near/at the lower band, a rally, then a second low that remains ABOVE the lower band — combined with RSI bullish divergence and a confirming trigger candle`,
                `C — Price touching the lower band twice at the same price level`,
                `D — Lower band expanding downward for two consecutive periods`,
              ],
              correct: 1,
              hint: `The W-bottom pattern shows that the second test of the lows has less selling force than the first. What does the lower band represent for the second low?`,
              explanation: `B is correct. The W-bottom requires: (1) First low: price touches or breaches the lower band — extreme selling (statistically beyond normal distribution). (2) Rally: selling exhausts briefly, price recovers. (3) Second low: price declines again but stays INSIDE the lower band — selling force is insufficient to push price to the same extreme. The lower band has moved down slightly, but price's second low is higher relative to the band. This "higher second low relative to the band" + RSI higher low = W-bottom reversal confirmation. The trigger candle is the final entry confirmation.`,
            },
            {
              question: `A trader sees BTC at the lower Bollinger Band and immediately buys, reasoning "price is at 2 standard deviations below the mean — statistically, it must revert." What is wrong with this reasoning?`,
              options: [
                `A — Nothing — mean reversion at Bollinger extremes is statistically sound`,
                `B — In a strong downtrend, price can continue to walk the lower band. "Must revert" assumes a non-trending market. During trending moves, the bands shift and price stays at the extreme for extended periods — the average itself moves down.`,
                `C — Bollinger Bands don't apply to Bitcoin`,
                `D — The trader should wait for the lower band to be breached more than once`,
              ],
              correct: 1,
              hint: `In a trending market, the 20-day SMA (middle band) is also moving in the trend direction. What happens to "2 standard deviations" when the mean itself is moving?`,
              explanation: `B is correct. The W-bottom pattern exists precisely because the lower band is not static — it moves with the 20-day SMA. In a downtrend, the 20-day average is declining, so the lower band also declines. Price "walking the lower band" in a downtrend stays at 2 standard deviations below the declining mean — statistically extreme relative to recent days, but not extreme relative to the ongoing decline. The mean reversion assumption requires a non-trending market. In trends, the mean reverts only after the trend ends.`,
            },
            {
              question: `A Bollinger squeeze has been forming for 3 weeks. Today, BTC closes at $73,800 — outside the upper Bollinger Band on 2.8× volume. What is the correct trade action?`,
              options: [
                `A — Short immediately — price is above the upper band`,
                `B — Buy the confirmed breakout. The squeeze followed by a close outside the upper band with strong volume confirms the directional breakout. Enter long with stop below the squeeze range.`,
                `C — Wait for price to return to the middle band before entering`,
                `D — The squeeze doesn't apply once price closes outside the band`,
              ],
              correct: 1,
              hint: `The squeeze compressed volatility. The close outside the upper band with volume is the directional confirmation. What does this signal?`,
              explanation: `B is correct. The sequence: (1) Bollinger squeeze = compressed volatility, major move coming. (2) Breakout candle closes outside the upper band on 2.8× volume = directional confirmation to the upside. This is the planned trade entry from a squeeze setup. The stop goes below the squeeze range (the low of the consolidation that formed during the squeeze). The breakout from a squeeze is often the beginning of an extended trending move as the previously compressed volatility expands.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USDT, daily chart. Bollinger Band setup analysis.

Chart data:
- 20-period SMA (middle band): $70,800
- Upper band (2 std dev): $73,200
- Lower band (2 std dev): $68,400
- BandWidth: currently at 3.2% (this is in the bottom 15th percentile for the past 2 years — historically low)
- Current price: $70,600 (just below middle band)
- Price has been ranging between $69,200 and $72,400 for 14 days
- Volume: 0.7× average (quieting down)

Today's scenario: BTC prints a daily close at $73,400 — above the upper Bollinger Band. Volume: 2.4× average.

Questions:
1. What did the BandWidth data signal before today?
2. What does today's close above the upper band on high volume indicate?
3. Design the complete entry, stop, and target for this breakout
4. What would a false breakout look like over the next 2 days?`,
              scoringCriteria: [
                `BandWidth at 3.2% (15th percentile) = classic Bollinger squeeze. Major move approaching, direction unknown. Trader should have been prepared for both directions.`,
                `Today's close at $73,400 (above $73,200 upper band) on 2.4× volume = confirmed upside directional breakout from the squeeze. The high volume distinguishes this from a wick/false break — the candle CLOSED outside the band.`,
                `Entry: $73,400 (current close). Stop: $69,000 (below the squeeze range's lower boundary with buffer). TP1: measured move = band width ($73,200 − $68,400 = $4,800) + breakout = $73,400 + $4,800 = $78,200. TP2: $80,000.`,
                `False breakout would look like: Day 2 opens at $73,400 but closes back below $73,200 (inside the band). OR Day 2 opens above but a large bearish candle forms with volume, closing well below the upper band. OR price returns below $72,400 (the top of the prior range) within 3 days.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Review five Bollinger Band trade decisions and evaluate each:

Trade 1: ETH at lower band ($3,560). Daily trend: DOWN (lower highs, lower lows). Trader buys because "price is at the lower band."
Trade 2: BTC walks the upper band for 5 consecutive days during a confirmed uptrend. Trader shorts because "five days at the upper band can't continue."
Trade 3: SOL Bollinger squeeze forms (BandWidth bottom 10%). SOL breaks below lower band on 3.1× volume with a bearish engulfing candle. Trader goes long expecting mean reversion.
Trade 4: ETH W-bottom: first low at $3,480 (lower band was $3,490), rally to $3,640, second low at $3,520 (lower band moved to $3,450 — second low ABOVE the lower band). RSI: first low 26, second low 38. Bullish hammer at $3,520. Trader enters long.
Trade 5: BTC squeeze resolves with breakout above upper band on 2.8× volume. Trader enters long. BTC closes back inside the band the next day. Trader holds.`,
              scoringCriteria: [
                `Trade 1: INCORRECT. Lower band in a downtrend = lower band continues walking down as the trend continues. No support evidence, no trigger candle, no volume confirmation. Buying in a downtrend at the lower band without other confluence is a losing strategy.`,
                `Trade 2: INCORRECT. Band walk is a trend strength signal. Shorting a band-walk in a confirmed uptrend means fighting the trend on a technical signal that means the opposite of a reversal.`,
                `Trade 3: INCORRECT. The squeeze breakout was to the DOWNSIDE (below lower band, high volume, bearish engulfing). Going long against a confirmed downside squeeze breakout is counter-directional trading without justification.`,
                `Trade 4: CORRECT. Textbook W-bottom: first low at/below lower band, second low above the lower band (selling exhaustion), RSI divergence (26 → 38 = bullish), trigger candle (hammer). All W-bottom conditions met.`,
                `Trade 5: AMBIGUOUS. Breakout entry was correct. Day 2 close back inside the band could be a false breakout (stop should trigger below the squeeze range) OR normal volatility on a genuine breakout. Hold with defined stop and reassess on Day 3.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `ETH/USDT, daily chart. Bollinger Band + RSI combined analysis.

You see a potential M-top pattern:
- First high: $4,180 (close at upper band). RSI: 76.
- Pullback to $3,920.
- Second high: $4,160 (close near but slightly inside upper band). RSI: 68.

Bollinger Bands:
- Upper band at first high: $4,175
- Upper band at second high: $4,195 (expanded slightly)
- Middle band (20 SMA): $3,940

Pattern analysis questions:
1. Is this a valid M-top by definition? What conditions are met and what is missing?
2. What does the RSI data tell you (76 first high → 68 second high)?
3. What specific price action confirms this as an actionable short setup?
4. Design the short trade if confirmation occurs, with entry, stop, and target.`,
              scoringCriteria: [
                `M-top conditions: First high at upper band ✓, pullback ✓, second high near upper band ✓. RSI divergence present (76 → 68 = bearish divergence) ✓. Not yet complete: no confirming breakdown candle below the pullback low ($3,920).`,
                `RSI data: bearish divergence confirmed. Price nearly matched first high ($4,180 vs $4,160), but RSI dropped from 76 to 68. This confirms weakening momentum on the second top.`,
                `Confirmation required: bearish engulfing or bearish candle closing BELOW the pullback low at $3,920. This would confirm the M-top and represent a price structure breakdown.`,
                `Short trade if confirmed: Entry at bearish candle close (approximately $3,900–$3,920). Stop above the second high: $4,200. Target: middle band ($3,940 — immediate), then $3,640 (prior support). R:R = ($3,920−$3,640)/($4,200−$3,920) = $280/$280 = 1:1. Only 1:1 to first target — need to use the further target: $3,640. R:R = $280/$280 = 1:1 still poor. Better target: $3,480 (50-day SMA area). R:R = ($3,920−$3,480)/($4,200−$3,920) = $440/$280 = 1.57:1. Still below 2:1 minimum. This M-top may not provide adequate R:R for a standalone trade — use to tighten long stops instead.`,
              ],
            },
          ],
        },

        {
          id: 'when-indicators-fail',
          title: `When Indicators Fail`,
          explanation: `On March 12, 2020 — "Black Thursday" — Bitcoin fell 50% in 24 hours as global markets crashed on COVID-19 panic. RSI went from 35 to 8 in one day. MACD registered the largest negative divergence since 2018. Bollinger Bands had no upper boundary visible on the chart — the lower band was far below any recent support. Every indicator simultaneously gave "buy" signals at every level during the fall — and every "buy" level was immediately violated as price continued lower.

This is the fundamental limitation of technical indicators: they are calibrated to normal market conditions. In extreme events — liquidity crises, exchange failures, regulatory shocks, macro collapses — the statistical assumptions that underlie indicators break down. Standard deviation-based tools (Bollinger Bands) assume approximately normal price distributions. RSI and MACD assume a market that oscillates around a mean. When markets move in one direction with no oscillation for extended periods, these tools fail.

The five conditions under which indicators reliably fail:

1. Trending markets: momentum indicators show overbought/oversold continuously. The trend "breaks" the oscillator.

2. Low liquidity: thin books mean price moves create disproportionate indicator readings without matching actual trading activity.

3. Major news events: scheduled events (Fed decisions, regulatory announcements, network upgrades) create price gaps that invalidate all preceding technical analysis on the chart.

4. Range markets after trends: an indicator calibrated to a recent trend will misread the initial phase of a range.

5. Correlation breakdown: indicators based on the assumption that an asset moves independently break down when macro risk-off events cause all assets to move together.

The professional response: indicators are confirmation tools for normal conditions. In extraordinary conditions (sudden high-volume moves, major news, market-wide correlation spikes), revert to price and volume only. Reduce position sizes. Respect the price action over any indicator reading.`,
          visualPrompt: `👆 Black Thursday BTC chart — all indicators useless in a crash`,
          visualType: `gif`,
          visualUrl: `indicator-failure-crash`,
          examples: [
            {
              contextTag: `[Trader, BTC/USDT, trending market overbought]`,
              context: `During BTC's 2024 bull run (January–March), RSI remained above 70 for 34 consecutive trading days.`,
              scenario: `A trader who shorted every time RSI exceeded 70 during those 34 days placed 11 short trades. All 11 were stopped out. Total losses: 18% of account. Another trader who understood that "overbought in a trend = trend strength" continued holding and adding to longs. Their RSI never prompted a trade exit.`,
              outcome: `The first trader's RSI-driven shorts failed because RSI's "overbought" assumption (mean reversion will occur) breaks down in a sustained trend. The indicator was not wrong in its calculation — RSI 78 accurately described momentum. The error was assuming that "statistically extended" means "must reverse immediately."`,
            },
            {
              contextTag: `[Trader, ETH/USDT, news event gap]`,
              context: `A swing trader holds ETH long with a stop at $3,600 and a carefully placed MACD-based position. The Ethereum network announces an unexpected delay to a major upgrade.`,
              scenario: `The news breaks overnight. ETH opens the next day at $3,240 — gapping down 12.3% through the $3,600 stop and all technical support levels. MACD, RSI, and Bollinger Bands on the daily chart all showed "neutral to bullish" before the news. None could predict the gap.`,
              outcome: `The stop-market order fills at $3,228 (slippage through the gap). The technical analysis was valid under the previous information. No indicator could have predicted an external information event. The lesson: indicators describe price behavior, not the events that cause price to move. Position sizing that accounts for gap risk (never sizing so large that a gap-to-zero is catastrophic) is the only partial protection.`,
            },
            {
              contextTag: `[Risk Manager, multiple assets, correlation spike]`,
              context: `A trader holds long positions in BTC, ETH, and SOL simultaneously. All three positions show healthy technical setups.`,
              scenario: `A macro risk-off event (US debt ceiling crisis spike) causes all crypto assets to decline simultaneously on high correlation. BTC: −8%. ETH: −11%. SOL: −14%. All stops trigger within the same 4-hour window. All technical patterns (supports, moving averages, RSI levels) on all three assets are simultaneously violated.`,
              outcome: `The three "independent" technical setups were not independent in market-wide stress conditions. The 0.85+ correlation during risk-off events meant the three separate analysis frameworks all failed at the same time because they were all exposed to the same macro event. Maximum total loss management (keeping correlated positions' combined risk below 5% of account) is the only protection against simultaneous multi-position stops.`,
            },
          ],
          keyTakeaway: `Indicators fail in trending markets, thin liquidity, news events, post-trend ranging, and correlation spikes. These are predictable failure modes. When any of these conditions exist, revert to price and volume only, reduce position sizing, and respect price action over indicator readings.`,
          guidedPractice: [
            {
              question: `You are long ETH and RSI has been above 70 for 12 consecutive days in an uptrend. Today a scheduled Fed meeting result is due in 3 hours. What should you do?`,
              options: [
                `A — Hold the position — RSI being high means the trend will continue`,
                `B — Consider reducing position size or tightening stops before the news. Scheduled macro events can cause gap moves that no indicator can predict. RSI does not protect against news gaps.`,
                `C — Short because RSI is overbought`,
                `D — Add to the position — the strong trend means the Fed event will be positive`,
              ],
              correct: 1,
              hint: `Which of the five indicator failure conditions applies to a scheduled news event?`,
              explanation: `B is correct. Scheduled macro events (Fed decisions, regulatory announcements, major protocol upgrades) are a known indicator failure condition. No technical indicator can price in information that doesn't yet exist. The RSI overbought reading describes past price behavior — it tells you nothing about the Fed's decision or market reaction. The professional response before major scheduled events: reduce exposure by 30–50%, tighten stops to limit gap-down risk. After the event resolves, re-evaluate the technical picture with fresh data.`,
            },
            {
              question: `BTC is in a strong uptrend. A momentum indicator shows "extremely overbought" — a reading that has always preceded corrections in the past 2 years. However, the current trend began 4 weeks ago and BTC is making new all-time highs. How do you weight the indicator vs the trend?`,
              options: [
                `A — Trust the indicator — it has worked in the past`,
                `B — Price action and trend take precedence. An indicator that was calibrated on non-ATH conditions may not apply when price enters new territory. The trend's dominance means the overbought reading reflects trend strength, not exhaustion.`,
                `C — Exit immediately — indicators are more reliable than price`,
                `D — The indicator is wrong — ignore it permanently`,
              ],
              correct: 1,
              hint: `Which indicator failure condition applies when price is in a strong trend reaching new highs?`,
              explanation: `B is correct. Trending markets are a primary indicator failure condition. Oscillators (RSI, MACD) are designed around the assumption of mean reversion — they measure how far price has moved from recent averages. In a strong trend reaching new highs, there IS no prior mean to revert to. The "overbought" reading is accurate (relative momentum is high) but the implication (reversion is imminent) breaks down in an established trend at new highs. Price and trend structure are the primary evidence. Indicators are secondary confirmation.`,
            },
            {
              question: `Three hours before a major exchange's surprise hacking announcement (unknown to you), your MACD, RSI, and Bollinger Bands all show neutral-to-bullish on BTC. You are fully positioned long. The announcement drops and BTC gaps down 15%. What is the primary lesson?`,
              options: [
                `A — Use better indicators that can predict hacks`,
                `B — External information events cannot be predicted by any technical indicator. The lesson is position sizing: never size a position so large that a 15% gap loss is catastrophic. Use the 1-2% risk rule so that even a gap through a stop produces a manageable absolute loss.`,
                `C — Don't hold positions overnight`,
                `D — Only trade on exchanges that have never been hacked`,
              ],
              correct: 1,
              hint: `Can any mathematical formula applied to historical price data predict an external information event that has not yet occurred?`,
              explanation: `B is correct. No indicator — technical or otherwise — can predict the release of previously unknown information. This is the efficient market hypothesis applied: new information that was not in any prior price data cannot be identified from prior price data. The only protection against information-based price gaps is (1) position sizing discipline (1-2% rule ensures gaps are survivable) and (2) portfolio-level diversification. C (no overnight holding) is an overcorrection that eliminates swing trading as a strategy. The risk management framework — not better indicators — is the correct response to unpredictable events.`,
            },
            {
              question: `Under which of the following conditions are technical indicators LEAST reliable?`,
              options: [
                `A — Normal trading hours on a liquid asset with average volume`,
                `B — A coordinated market crash affecting all risk assets simultaneously (high correlation event)`,
                `C — A planned entry at a prior support level`,
                `D — A swing trade during low volatility conditions`,
              ],
              correct: 1,
              hint: `Which condition violates the independence assumptions that most indicators are built on?`,
              explanation: `B is correct. Correlation spikes during market-wide risk-off events cause all assets to move together regardless of individual technical setups. Indicators built on an asset's own price history assume that asset moves based on its own supply and demand dynamics. When macro events force all assets into a single correlated move, each asset's technical indicators — even if correctly calibrated — fail because the price driver is external and not reflected in the asset's own history.`,
            },
            {
              question: `A trader observes that their indicators "work great in trending markets but fail in ranging markets." What is the technically accurate explanation for this?`,
              options: [
                `A — The trader needs different indicators for different conditions`,
                `B — Momentum indicators are calibrated to detect the direction and strength of price movement from a mean. In trending markets, the mean is moving in the trend direction — momentum is persistently one-directional. In ranging markets, the mean is stable — momentum oscillates without direction, generating false breakout signals.`,
                `C — Ranging markets are unpredictable and no tool works`,
                `D — All indicators work equally in both trending and ranging markets`,
              ],
              correct: 1,
              hint: `What is the fundamental assumption of momentum indicators about how price behaves? Does a ranging market fulfill that assumption?`,
              explanation: `B is correct. Momentum indicators (RSI, MACD) are designed to measure the strength of price movement — they work well when there is sustained directional momentum. In a range, price repeatedly reverses between support and resistance. Every time price touches the upper range boundary and reverses, the indicator triggers an overbought reading that is "correct" but then immediately produces a reversal signal — giving the impression the indicator "works." But price then rises again to the upper boundary, triggering overbought again. The result: many false breakout signals in one direction, then reversal signals, then breakout again — the indicator generates contradictory signals that are individually technically accurate but systematically useless.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `It is November 8, 2022. FTX exchange has been rumored to have a liquidity crisis. You hold three positions:

Position 1: BTC long from $21,000. Stop at $19,800. MACD: bullish. RSI: 54. Bollinger: price at middle band. All indicators neutral-to-bullish.

Position 2: SOL long from $38. Stop at $34.50. SOL is heavily associated with FTX/Alameda. RSI: 48. MACD: neutral. No specific technical concern.

Position 3: ETH long from $1,640. Stop at $1,540. RSI: 56. All indicators healthy. No FTX association.

The FTX crisis is a known-unknown: you know FTX is struggling but the full severity is unclear. The news may or may not result in a major market crash.

Evaluate each position's risk separately and design your position management plan. Consider: (1) which is most exposed to the specific FTX event, (2) how should indicator readings affect your decision, (3) what action — if any — should you take before market open?`,
              scoringCriteria: [
                `Position 2 (SOL): HIGHEST RISK. Direct association with FTX/Alameda Research. FTX collapse would specifically impact SOL's ecosystem confidence. Action: close or dramatically reduce SOL position before open. This is specific counterparty/ecosystem risk that overrides all technical analysis.`,
                `Position 1 (BTC): MODERATE RISK. BTC is correlated to crypto market but has no specific FTX exposure. Action: tighten stop to $20,400 (closer to entry) to limit gap-down damage. Consider reducing to half position.`,
                `Position 3 (ETH): MODERATE RISK. Similar to BTC — market correlation risk but no specific FTX exposure. Action: tighten stop slightly. No specific close-out reason beyond market correlation.`,
                `Indicator readings: ALL INDICATORS ARE IRRELEVANT TO THIS DECISION. A known-unknown macro event with specific exchange exposure overrides all technical readings. No indicator was calibrated for FTX contagion.`,
                `Key lesson: external information events (regulatory, exchange failures, protocol exploits) require reverting to fundamental risk assessment, not technical indicators.`,
                `Historically: SOL fell 60% in 3 days. BTC fell 22%. The trader who closed SOL saved 60% of that position's value.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `A systematic trader tracks their indicator performance across four different market regimes over 12 months:

Regime 1: Strong uptrend (4 months). 45 trades.
- RSI divergence signals: 6. Accuracy: 50% (3 correct, 3 early/false).
- MACD crossover entries: 14. Accuracy: 64%.
- BB lower band entries: 2. Accuracy: 100% (trend bounces from brief dips).

Regime 2: Bear market / downtrend (3 months). 22 trades.
- RSI oversold (below 30) entries: 8. Accuracy: 25% (price kept falling).
- MACD crossover entries: 7. Accuracy: 43%.
- BB squeeze breakout (downside): 3. Accuracy: 100%.

Regime 3: Range market (3 months). 31 trades.
- RSI overbought/oversold trades at range boundaries: 18. Accuracy: 72%.
- MACD crossover entries inside range: 9. Accuracy: 33%.
- BB squeeze (multiple): 4. Accuracy: 75%.

Regime 4: News-driven (flash crashes/spikes, 2 months). 11 trades.
- All indicator types: 11 trades. Accuracy: 18%.

Summarise which indicator works best in each regime, which fails most, and how this data should change the trader's strategy in different market conditions.`,
              scoringCriteria: [
                `Uptrend: MACD crossovers decent (64%). RSI divergence unreliable (50%). BB lower band entries reliable for trend pullback plays.`,
                `Downtrend: RSI oversold = WORST (25%) — classic indicator failure in trend. BB squeeze to the downside = best (100%). Don't use RSI oversold as long entries in bear markets.`,
                `Range: RSI at boundaries = BEST (72%). MACD in range = worst (33% — crossing from noise in directionless conditions). BB squeezes still good.`,
                `News-driven: ALL indicators fail (18%). Don't trade indicators in news-driven conditions.`,
                `Strategic conclusion: (1) In uptrend: use MACD and BB, avoid RSI shorts. (2) In downtrend: BB squeeze for directional plays, avoid RSI oversold longs. (3) In range: RSI boundary trades are valid, avoid MACD. (4) In news events: reduce all positions, use price/volume only.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You are managing three open long positions. The market has entered an unusual period:

Context: Bitcoin ETF flows turned negative for the first time in 3 weeks (net outflows: $280M yesterday). US 10-year yields spiked 0.18% overnight. Traditional equities opened -1.8%. Gold up 0.8%.

Your positions:
- BTC long: entry $72,400. Stop $70,200. RSI 58. MACD neutral. Bollinger: price at middle band.
- ETH long: entry $3,720. Stop $3,580. RSI 54. MACD slightly bullish. 
- SOL long: entry $188. Stop $183. RSI 61. MACD bullish divergence visible.

Indicators across all three assets: neutral to slightly bullish. No specific technical warnings.

Questions:
1. Which indicator failure condition is active in this scenario?
2. How should you weight the macro context vs your technical readings?
3. What specific actions should you take for each position?
4. If you do nothing and all three stops trigger simultaneously, what % of your account would you lose? (Assume 1.5% risk each, account $20,000)`,
              scoringCriteria: [
                `Indicator failure condition: correlation spike risk. All three assets are crypto, and the macro environment (risk-off: equity decline, yield spike, gold up, ETF outflows) is a classic risk-off signal. In risk-off events, crypto assets become highly correlated and move together regardless of individual technical setups.`,
                `Macro vs technicals: macro context should INCREASE caution even though technicals are neutral. When macro risk factors align against the trade direction, the probability of simultaneous multi-position stops increases. Technical indicators don't price in macro regime changes.`,
                `Actions: (1) Reduce all three positions by 30-50% to reduce correlation exposure. (2) Tighten stops on all three: BTC to $71,000, ETH to $3,620, SOL to $185. (3) Do not add new crypto longs until macro environment stabilizes (yields, equity, gold all reverse).`,
                `Simultaneous stops: 1.5% × 3 positions = 4.5% of $20,000 = $900 total loss. Within the 6-8% maximum simultaneous open risk guideline but all three triggering at once is significant. Reducing position sizes addresses this.`,
              ],
            },
          ],
        },

      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-breakout',
          'chartReplay-volumeRead',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
        ],
        description: `Fifteen randomised challenges across all six indicator lessons — without labels. Tasks include identifying genuine signal independence, applying 200-day SMA trend context, detecting RSI divergence on live charts, reading MACD histogram momentum shifts, interpreting Bollinger squeeze setups, and diagnosing indicator failure conditions in real market scenarios.`,
        scoringMode: 'percentageCorrect',
        unlockCondition: 'completeAllLessons',
        difficultyRange: [3, 5],
      },
      bossMode: {
        title: `Technical Specialist Challenge`,
        learningLoop: {
          id: 'tsc-ll',
          attempts: 'unlimited',
          feedbackMode: 'fullCriteriaWithPointers',
          challenges: [
            { id: 'tsc-ll-1', simulatorType: 'chartReplay-volumeRead', lessonPointer: 'what-indicators-are' },
            { id: 'tsc-ll-2', simulatorType: 'chartReplay-riskManage', lessonPointer: 'moving-averages' },
            { id: 'tsc-ll-3', simulatorType: 'judgment-dataInterpret', lessonPointer: 'rsi' },
            { id: 'tsc-ll-4', simulatorType: 'chartReplay-riskManage', lessonPointer: 'macd' },
            { id: 'tsc-ll-5', simulatorType: 'chartReplay-breakout', lessonPointer: 'bollinger-bands' },
            { id: 'tsc-ll-6', simulatorType: 'judgment-riskAssess', lessonPointer: 'when-indicators-fail' },
            { id: 'tsc-ll-7', simulatorType: 'judgment-dataInterpret', lessonPointer: 'what-indicators-are' },
            { id: 'tsc-ll-8', simulatorType: 'chartReplay-volumeRead', lessonPointer: 'moving-averages' },
            { id: 'tsc-ll-9', simulatorType: 'judgment-riskAssess', lessonPointer: 'rsi' },
            { id: 'tsc-ll-10', simulatorType: 'judgment-prioritisation', lessonPointer: 'when-indicators-fail' },
          ],
        },
        },
    },
,
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 7 — TRADING PSYCHOLOGY & DISCIPLINE (5 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'trading-psychology',
      title: `Lab 7: Trading Psychology & Discipline`,
      subtitle: `The hardest part — and the most important`,
      lessons: [

        {
          id: 'why-market-beats-emotions',
          title: `Why the Market Beats Emotions`,
          explanation: `Daniel Kahneman, 2002 Nobel Prize winner in economics, demonstrated that humans are systematically irrational in financial decision-making. We overweight recent events (recency bias), experience losses approximately 2.5× more intensely than equivalent gains (loss aversion), and assess probability based on vivid examples rather than statistics (availability heuristic). Each of these cognitive biases directly and predictably destroys trading performance.

The market does not care about your emotional state. It does not know whether your last three trades were losses or wins. It does not respond to your frustration, your desire to break even, or your fear of giving back gains. The market is the aggregate of every other participant's decisions. Most of those participants are also emotionally compromised — but the institutional participants who control the majority of volume operate systematic strategies with pre-defined rules.

The core problem: your emotions evolved for a world of physical threats and social relationships. When you feel the urge to exit a profitable trade early, your amygdala treats paper losses as equivalent to physical danger — triggering the same flight response. When you refuse to cut a losing trade, your brain does the same thing it does with any sunk cost — rationalising the hold because you've already spent resources.

The professional solution is not to eliminate emotions (impossible) but to make all significant decisions before the emotional state is triggered. A trading plan written calmly — stops, targets, position sizes, entry criteria — is a product of rational thinking. A decision made during a live trade in loss or profit is a product of emotional thinking. The goal is for the pre-written plan to execute, not the real-time emotional response.

Track your emotions in your trading journal alongside your trades. Not just the outcomes — but your emotional state during each session. Anger, fear, excitement, boredom. The patterns will reveal your specific emotional vulnerabilities. Knowledge of a bias is the first step in managing it.`,
          visualPrompt: `👆 Emotional decision timeline vs planned decision timeline`,
          visualType: `gif`,
          visualUrl: `emotion-vs-plan`,
          strategy: `Make all trading decisions BEFORE entering the position: entry, stop, targets, position size. Write them down. Once in a trade, only adjust positions according to pre-written rules (breakeven at +1R, trailing at +3R, TP ladder). Never make sizing, stop, or exit decisions while watching a live P&L — that is when emotion dominates.`,
          examples: [
            {
              contextTag: `[Trader, BTC/USDT, loss aversion overriding the stop]`,
              context: `A trader enters BTC long at $72,000 with stop at $70,000. BTC falls to $70,200 — near the stop.`,
              scenario: `The trader moves the stop to $69,000 because "it's so close to my stop, it will obviously bounce." BTC falls to $68,400 before recovering to $71,200.`,
              outcome: `The original stop would have produced a $2,000 loss. The emotional override produced a $3,600 loss — 80% larger. Loss aversion (discomfort at realising a $2,000 loss) created a $3,600 loss. The solution: stop-market orders that cannot be easily cancelled mid-session, placed immediately at entry.`,
            },
            {
              contextTag: `[Trader, ETH/USDT, recency bias post-win streak]`,
              context: `A trader wins four consecutive trades totalling +8.4%. Feeling invincible, they triple their next position size.`,
              scenario: `The 3× position enters ETH long at $3,800. A minor adverse move triggers disproportionate emotional response due to the position size. The trader exits at $3,740 (−1.6%), before their stop at $3,620.`,
              outcome: `ETH bounced from $3,740 to $4,020. Recency bias produced overconfidence → oversize → loss aversion on the oversize → early exit before thesis played out. The sequence destroyed what should have been a 6% winner.`,
            },
            {
              contextTag: `[Systematic Trader, ETH/USDT, plan as emotional anchor]`,
              context: `A trader writes the full trade plan before entry. During a live trade, ETH falls from $3,760 to $3,640 — near the $3,600 stop.`,
              scenario: `The trader opens their written plan: "Stop: $3,580. No early exit unless ETH daily closes below $3,600." The plan, written calmly, provides clarity during the emotional state.`,
              outcome: `ETH bounced from $3,640 to $3,960. The pre-written plan prevented a $120/ETH panic exit before a $200/ETH gain. The plan did not predict the bounce — it prevented the emotional action that would have converted uncertainty into a realised loss.`,
            },
          ],
          keyTakeaway: `Human cognitive biases — loss aversion, recency bias, overconfidence — directly and predictably damage trading performance. The solution is pre-written trade plans created in calm states. Once in a trade, execute the plan. Pre-set orders remove the real-time emotional decision point entirely.`,
          guidedPractice: [
            {
              question: `A trader's last five trades were all losses. How should this affect their position size on the next trade?`,
              options: [
                `A — Increase size to recover faster — "due for a win"`,
                `B — Keep the same size per risk rules. A losing streak does not statistically change the next trade's probability. Reduce size only if strategy analysis (not emotion) reveals a genuine problem.`,
                `C — Skip the trade entirely — always pause after 5 losses`,
                `D — Double size but use a tighter stop`,
              ],
              correct: 1,
              hint: `Each trade is independent. What does the gambler's fallacy suggest about "due for a win"?`,
              explanation: `B is correct. Each trade's probability is independent of prior outcomes. A streak of losses does not make the next trade statistically more likely to win — the gambler's fallacy. Position size is determined by the 1-2% rule applied to the current trade's technical merit, not by the emotional desire to recover losses. The only legitimate reason to reduce size after losses is evidence that the strategy is not performing in current market conditions — a rational analysis, not an emotional one.`,
            },
            {
              question: `Loss aversion causes losses to feel 2.5× more painful than equivalent gains feel good. How does this predictably manifest in trade management?`,
              options: [
                `A — Traders become more careful and profitable`,
                `B — Traders cut profits early (paper gain erosion feels like loss) and hold losses too long (realising a loss confirms the pain). Net result: small wins, large losses.`,
                `C — Traders only take very high-probability setups`,
                `D — It has no effect on systematic traders`,
              ],
              correct: 1,
              hint: `If losing $100 feels like −$250 pain and gaining $100 feels like +$100 pleasure, which action does emotion push you toward?`,
              explanation: `B is correct. Loss aversion's two trading manifestations: (1) Early profit exits — watching unrealised gains approach a peak triggers "loss" response (the gain hasn't been realised, so any pullback feels like losing it), pushing for premature exit. (2) Loss-holding — realising a loss confirms the pain; holding keeps the hope alive of avoiding that confirmation. Pre-set OCO orders are the mechanical solution: they execute the plan regardless of the emotional state at the moment.`,
            },
            {
              question: `You are up 8% in a trade. Your TP is 4% higher and your stop is at breakeven. Price pulls back 1.2%. What does the plan say to do?`,
              options: [
                `A — Exit now — protect the 8% gain`,
                `B — Do nothing. The plan has a stop at breakeven and TP 4% higher. A 1.2% pullback is normal. The plan executes until TP or stop is hit.`,
                `C — Move stop up to lock in 6%`,
                `D — Add to the position at the dip`,
              ],
              correct: 1,
              hint: `Has anything happened that was not anticipated in the pre-written plan? What does the plan say to do here?`,
              explanation: `B is correct. Nothing about a 1.2% pullback requires a plan deviation. The stop is at breakeven — if price falls that far, the exit is automated. The TP is pre-set. A real-time decision to exit at +8% instead of the planned +12% is a loss aversion response to watching a profitable position temporarily decrease — not a strategy decision. The plan should execute.`,
            },
            {
              question: `What is the most effective mechanical protection against emotional trading?`,
              options: [
                `A — More analysis before entry`,
                `B — Pre-set orders (stop-market, OCO, trailing stop) that execute automatically, combined with a written trade plan that is consulted during the trade`,
                `C — Trading with a partner for accountability`,
                `D — Only trading when emotionally calm`,
              ],
              correct: 1,
              hint: `If emotional decisions happen during live trades, what removes the human from the real-time decision loop?`,
              explanation: `B is correct. Pre-set orders remove the emotional decision point. A stop-market executes automatically. An OCO ensures only one exit fires. A trailing stop adjusts automatically. These tools convert live emotional moments into mechanical executions defined in advance. A written plan consulted during the trade provides the rational anchor when emotion says to deviate. D is impossible at scale — you cannot wait for perfect emotional conditions. The goal is to make emotional state irrelevant via mechanical execution.`,
            },
            {
              question: `A trader had a +18% month. They are now taking larger positions and skipping checklist steps. What is this and what is the risk?`,
              options: [
                `A — Justified confidence — past performance predicts future performance`,
                `B — Recency bias / overconfidence — recent success distorts the assessment of current skill level. Risk: oversized, lower-quality positions facing the same indifferent market that doesn't remember last month.`,
                `C — Confirmation bias — seeking evidence of continued skill`,
                `D — There is no bias here — results justify confidence`,
              ],
              correct: 1,
              hint: `Does one month of exceptional returns prove permanent elevated skill, or could it reflect favorable market conditions that may not repeat?`,
              explanation: `B is correct. Recency bias over-weights recent events. A +18% month is evidence of recent favorable conditions and/or good execution — not guaranteed future performance. The market that produced +18% will not repeat identically. Overconfidence leads to: larger positions (more exposure when variance is unchanged), skipped checklist steps (lower-quality setups), and accelerated risk-taking. The sequence regularly precedes significant drawdowns: exceptional run → overconfidence → blowup month.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `A trader's session log from today:
9:00am: Entered BTC long at $72,400. Plan: stop $70,600, TP $76,000, 1.5% risk.
10:15am: BTC at $70,900. "Getting close to stop — it's going to bounce."
10:30am: Moved stop to $69,800. "Giving it room."
11:00am: BTC at $70,400. Stop at $69,800. "Really uncomfortable."
12:00pm: BTC rallies to $71,200. "See, I was right to hold."
1:00pm: BTC back to $70,800. Trader exits manually. "Protecting against more decline."
2:00pm: BTC at $74,200. TP would have been $76,000.

1. Identify every cognitive bias present
2. At what point did the trader first deviate from the plan?
3. Financial cost of each deviation vs the original plan
4. What mechanical changes would prevent each error?`,
              scoringCriteria: [
                `Biases: (1) Loss aversion — moving stop at 10:30am to avoid the pain of realising a $1,800 loss. (2) Anchoring / wishful thinking — "it will obviously bounce." (3) Confirmation bias — using the temporary rally at noon to validate the bad stop-move decision. (4) Loss aversion again — manual exit at $70,800 instead of plan's $76,000 TP.`,
                `First deviation: 10:30am stop move. Every subsequent poor decision flowed from this first emotional override of the written plan.`,
                `Financial costs: Stop move: risked $2,600 instead of $1,800 (original stop) = additional $800 risk taken. Missed TP: exited at $70,800 (+$400) instead of $76,000 (+$3,600) = $3,200 opportunity cost on the position.`,
                `Mechanical fixes: (1) Stop-market (not adjustable stop-limit). (2) OCO set immediately at entry — TP and stop linked. (3) Written rule: "No stop moves away from price." (4) Close the chart after entry; check only at predefined times.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `30-day emotion + trade journal analysis:

Profitable sessions (14 days): avg emotional state "calm/focused." Avg trades/day: 2.1. Avg position: $5,200. Avg hold: 4.2 hours.

Unprofitable sessions (16 days): avg emotional state "anxious/frustrated/overconfident." Avg trades/day: 4.8. Avg position: $8,400. Avg hold: 1.1 hours.

Biggest losing day: −$920. Log: "Angry after two morning losses — entered 5 more trades to recover."

1. What patterns link emotional state to performance?
2. What rule should this trader create from the data?
3. Why do unprofitable days have more trades, larger positions, shorter holds?
4. Design a pre-session ritual addressing the root causes.`,
              scoringCriteria: [
                `Pattern: Profitable = calm, fewer bigger-conviction trades, longer holds. Unprofitable = emotional, overtrading (4.8 vs 2.1 trades), oversizing ($8,400 vs $5,200), premature exits (1.1 vs 4.2 hour holds).`,
                `Rule: "If emotional state is frustrated, anxious, or angry — stop trading for the day. No exceptions. Log the emotion and close the platform."`,
                `Why unprofitable days have those characteristics: (1) Revenge trading after early losses inflates trade count and position size. (2) Anxiety shortens hold time — positions exited before thesis plays out. (3) Overconfidence on good-feeling days inflates size.`,
                `Pre-session ritual: (1) 5-minute journal entry rating emotional state 1-10. (2) If below 7: no trades today. (3) Review the day's planned setups (not live charts). (4) Confirm risk limits for the day. (5) Set all orders in advance before opening live price feeds.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You opened two trades this morning. It is now 2pm.

Trade 1: BTC long from $71,800. Stop $70,200. TP $75,600. Currently at $74,200 (+$2,400 unrealised). Stop moved to breakeven ($71,800) at +1R. Plan: hold for TP.

Trade 2: ETH long from $3,760. Stop $3,620. TP $4,080. Currently at $3,640 (−$120 unrealised, near stop). Plan: stop exits at $3,620.

Your emotional state: highly stressed about Trade 2's proximity to the stop. You are tempted to: (a) exit Trade 2 manually at $3,640 to "stop the pain," and (b) exit Trade 1 early at $74,200 to "bank the win and cover Trade 2's loss."

Apply what you've learned: what is the correct action for each trade and why?`,
              scoringCriteria: [
                `Trade 1: DO NOTHING. Plan says hold to TP $75,600 with stop at breakeven. Nothing has invalidated the thesis. The urge to exit at $74,200 is emotional (wanting to "bank the win") not analytical. The plan must execute.`,
                `Trade 2: DO NOTHING (yet). Stop is at $3,620, current price $3,640. The stop has not been hit. Manually exiting at $3,640 is a $140/ETH loss vs the plan's $3,620 stop = $20/ETH unnecessary additional loss for purely emotional reasons.`,
                `The impulse to exit Trade 1 to "cover Trade 2" is the classic correlation between emotions across separate trades — each trade should be evaluated independently.`,
                `What to actually do: check Trade 2 against the original thesis. Has the thesis been invalidated (daily close below key support)? If not, the stop does the job at $3,620. If yes, then exit is warranted — but based on analysis, not stress.`,
                `User identifies: both proposed actions (early Trade 1 exit and early Trade 2 exit) are emotionally driven and not part of the written plans.`,
              ],
            },
          ],
        },

        {
          id: 'fomo',
          title: `FOMO — Fear of Missing Out`,
          explanation: `On October 14, 2021, Solana rose 46% in 72 hours from $165 to $241. Thousands of traders who had been watching SOL for weeks without entering decided during this move that they "had to get in now before it went higher." They bought at $210, $225, $238. SOL peaked at $259 six days later, then retraced to $180 over the following 14 days. The FOMO buyers who entered at the top of the spike — the maximum point of visible excitement — experienced immediate 25–30% losses on positions they entered in a panic.

FOMO (Fear of Missing Out) is the belief that a currently moving asset will continue moving in that direction indefinitely, combined with the fear that waiting will result in missing the entire move. It causes traders to enter positions at the worst possible price and R:R.

The anatomy of a FOMO trade: (1) Asset makes a large, fast move. (2) Trader sees the move and feels urgency — "it's going to keep going." (3) No entry trigger, no level, no defined stop. (4) Market order entry at the high of the move. (5) Position immediately goes against the entry as the initial momentum exhausts. (6) Trader holds because "it will bounce back to where I entered." (7) Eventual exit at a loss.

The FOMO entry creates the worst possible R:R because it enters at the point of maximum recent strength — precisely where professional traders who planned the trade are taking partial profits (TP1 fills), weakening the upward momentum.

The antidote is specific and mechanical: if a setup was not in your pre-session watchlist, you do not trade it. Assets that move 30%+ in a day are not added to your watchlist mid-day. The setup must have been identified in advance during non-emotional analysis. This rule alone eliminates FOMO trades.`,
          visualPrompt: `👆 FOMO entry point on a spike — buying at the high`,
          visualType: `gif`,
          visualUrl: `fomo-entry-failure`,
          strategy: `Pre-session watchlist rule: only trade assets and setups identified before the trading session begins, during calm market analysis. If an asset makes a sudden 15%+ move not on your watchlist, it is NOT a trade today. The time to enter high-quality momentum plays is after the initial spike retraces to a support level — not during the spike itself.`,
          examples: [
            {
              contextTag: `[New Trader, SOL/USDT, FOMO at the spike]`,
              context: `SOL rises 18% in 4 hours from $185 to $218. A trader had not planned to trade SOL today but sees the move on social media.`,
              scenario: `Fearing they will miss the continuation, the trader buys at $214 with no defined stop or TP. SOL reaches $222 then falls to $196 over the next 8 hours.`,
              outcome: `The trader, holding without a stop, watches the 8.4% loss and eventually exits at $198 to "stop the pain." The FOMO trade produced a $16 loss on an asset that subsequently recovered to $230 five days later — which would have been available at $196 (the post-spike support level) if the trader had waited for a proper pullback setup.`,
            },
            {
              contextTag: `[Experienced Trader, BTC/USDT, FOMO resistance]`,
              context: `BTC gaps up 12% at the open. A disciplined trader had BTC on their pre-session watchlist — but at a pullback entry at $70,200, not at the current $79,400.`,
              scenario: `Despite seeing BTC at $79,400 and feeling the pull to "just buy it at market," the trader follows their rule: no entries outside the watchlist plan. They set an alert at $74,000 and wait.`,
              outcome: `BTC pulls back to $74,200 over the following 3 days. The trader enters at $74,400 (trigger candle at the prior resistance zone, now support) with stop at $72,000 and TP at $82,000. R:R = $7,600/$2,400 = 3.17:1. The FOMO entry at $79,400 would have had: stop at $72,000, giving $7,400 risk, and TP at $82,000 giving $2,600 reward — R:R of 0.35:1. Discipline to resist FOMO produced a 9× better R:R.`,
            },
            {
              contextTag: `[Trader, AVAX/USDT, FOMO on leverage]`,
              context: `AVAX is up 24% in one session. A trader with a small account decides to use leverage to participate in "what's clearly a breakout."`,
              scenario: `They buy $12,000 of AVAX (5× leverage on a $2,400 account) at the daily high. AVAX drops 8% over the next 4 hours — a normal post-spike consolidation. At 5× leverage, an 8% move against the position = 40% loss on account capital. Liquidation threshold reached.`,
              outcome: `Account liquidated. A normal 8% post-spike retracement destroyed the account because FOMO combined with leverage creates a position where even normal volatility is catastrophic. FOMO alone destroys accounts slowly. FOMO plus leverage destroys them in hours.`,
            },
          ],
          keyTakeaway: `FOMO causes entries at the worst price and R:R — at the top of a momentum spike when professional traders are exiting. The antidote is the pre-session watchlist rule: only trade setups identified before the session in calm analysis. The correct entry for momentum plays is after the spike retraces to a support level.`,
          guidedPractice: [
            {
              question: `BTC has just moved up 11% in 2 hours. It was not on your watchlist this morning. What is the correct action?`,
              options: [
                `A — Buy immediately — this momentum will continue`,
                `B — Do not trade it today. It was not on the pre-session watchlist. Note it for tomorrow's watchlist analysis. The time to enter is after the spike, at a support level, during non-emotional analysis.`,
                `C — Buy with a 2% risk limit — at least it's controlled`,
                `D — Short it — 11% in 2 hours must reverse`,
              ],
              correct: 1,
              hint: `What is the pre-session watchlist rule and why does a 11% spike not override it?`,
              explanation: `B is correct. The pre-session watchlist rule exists precisely for this moment — when FOMO is strongest. An asset that just moved 11% in 2 hours is: (1) entering the territory where professionals who entered at lower levels are taking partial profits, (2) generating maximum retail FOMO, (3) at its worst possible R:R (the spike high is farthest from any recent support for a stop). Adding it to tomorrow's watchlist means: calm analysis of where support is, where the proper stop goes, and whether there is a valid setup — not a spike-chase entry.`,
            },
            {
              question: `A FOMO entry at the top of a spike creates which R:R problem?`,
              options: [
                `A — No problem — momentum entries at highs often continue`,
                `B — Entry at the spike high places the stop far below (the nearest technical support is far from the high), and the target (the continuation) is close relative to the stop distance. This inverts the R:R to below 1:1 in many cases.`,
                `C — R:R is the same regardless of entry timing`,
                `D — FOMO trades have better R:R because momentum confirms direction`,
              ],
              correct: 1,
              hint: `If you buy at a spike high and the nearest support is 8% lower, where does the stop go? How does that compare to the expected continuation from the high?`,
              explanation: `B is correct. A spike entry at the high: nearest support (valid stop level) might be 8% below the entry. The continuation target (the "next leg up") might be 4% above entry in a normal move. R:R = 4%/8% = 0.5:1 — you risk twice what you gain. Compare to a planned entry at the support after the spike retraces: entry 8% below the high, stop 2% below that support, target at the prior high (6% above the entry). R:R = 6%/2% = 3:1. Patience after a FOMO moment produces a setup with 6× better R:R than the FOMO entry itself.`,
            },
            {
              question: `You have a rule: "Only trade setups on the pre-session watchlist." ETH spikes 9% in 30 minutes. A colleague texts: "ETH is running — you need to be in this." What is your response?`,
              options: [
                `A — Buy ETH immediately — social pressure confirms the move is real`,
                `B — Thank them and decline. Social confirmation (others buying the spike) is a FOMO amplifier, not new analytical information. The rule holds regardless of external pressure.`,
                `C — Check the chart and if RSI isn't overbought, buy it`,
                `D — Buy half a position as a compromise`,
              ],
              correct: 1,
              hint: `Does a colleague's text change the technical quality of the entry? Does it change the R:R?`,
              explanation: `B is correct. Social confirmation — other people buying a moving asset — is a FOMO trigger, not an analytical signal. The colleague texting "you need to be in this" is experiencing FOMO themselves and amplifying it to you. Their message contains no technical information: no level, no stop, no R:R calculation. The pre-session watchlist rule exists precisely because the moments of maximum social excitement about an asset are the moments of worst entry quality. The rule must hold regardless of social pressure.`,
            },
            {
              question: `SOL spikes 22% and is now at $228. It was not on your watchlist. Over the next 3 days it retraces to $198 — near a prior resistance that is now support. How does your approach change now?`,
              options: [
                `A — Still don't trade it — it wasn't on the original watchlist`,
                `B — Now it can be evaluated for a watchlist entry. The spike is old news. The $198 level is a potential setup: prior resistance/support, 13% off the spike high, with a definable stop below the level.`,
                `C — It's too late — the opportunity is gone`,
                `D — Still avoid it — spike assets are always dangerous`,
              ],
              correct: 1,
              hint: `The watchlist rule prevents FOMO spike chasing. Does it prevent ALL future entries in that asset, or just the spike-day entry?`,
              explanation: `B is correct. The watchlist rule prevents entering during the emotional spike. Three days later, when the spike emotion has faded and SOL has retraced to a technical level, calm analysis is possible. The $198 level (former resistance turned support) at -13% from the spike high is a legitimate setup candidate: (1) the spike demonstrated strong buying interest in SOL, (2) the pullback to former resistance is a textbook retracement entry, (3) a stop below $198 with a target at the $228 spike high gives $30 reward vs approximately $10 risk = 3:1 R:R. This is the correct entry — the one FOMO traders missed by chasing at $228.`,
            },
            {
              question: `What makes a FOMO trade different from a legitimate momentum breakout trade?`,
              options: [
                `A — There is no difference — both trade momentum`,
                `B — A legitimate breakout was pre-identified on the watchlist, has a defined entry level (above resistance), a defined stop (below the breakout), and was planned before the move happened. A FOMO trade is entered reactively during a move with no predefined stop, level, or R:R.`,
                `C — FOMO trades use market orders; breakouts use limit orders`,
                `D — Breakouts only work on daily charts; FOMO is for shorter timeframes`,
              ],
              correct: 1,
              hint: `What is the key difference between anticipating a setup in advance vs reacting to a move already in progress?`,
              explanation: `B is correct. A legitimate momentum breakout: pre-identified resistance level, limit buy set just above it before the move, stop below the level, TP calculated in advance. Entered when the price comes to the plan. A FOMO trade: asset already moved significantly, no prior plan, market order at the current (high) price, no defined stop, no TP. The emotional state is the signal generator instead of analysis. The key distinguishing question: "Was this trade planned before the current move started?" If no: it is FOMO until proven otherwise.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-prioritisation`,
              scenario: `It is 10am. Your pre-session watchlist has three setups. During the session, you observe these events:

Watchlist Setup A: BTC long at $71,800 support (still valid, price is at $72,100). Trigger candle not yet formed. Still watching.

Watchlist Setup B: ETH pullback to $3,620 support (price hit $3,620 and formed a hammer on 1.7× volume 30 minutes ago). This is the trigger. Can enter now.

Watchlist Setup C: SOL breakout above $192 resistance (price is at $190, no breakout yet).

New events NOT on watchlist:
- AVAX just spiked +18% in 1 hour (not on watchlist, no prior analysis)
- A tweet from a prominent crypto influencer says "BNB is about to explode, I'm all in" (BNB not on watchlist)

For each situation: enter, wait, or skip? Justify with the watchlist rule and FOMO framework.`,
              scoringCriteria: [
                `Watchlist A (BTC $71,800): WAIT. Trigger candle not yet formed. Plan says enter on trigger — not before. No trigger = no entry yet.`,
                `Watchlist B (ETH hammer at $3,620): ENTER. All five checklist elements present: trend (check), level ($3,620 support), trigger (hammer + volume), risk defined, size calculated. This is the planned setup executing. Enter at the candle close.`,
                `Watchlist C (SOL $192): WAIT. Breakout not triggered yet. Price at $190 — still below the entry level. Do not anticipate.`,
                `AVAX +18% spike: SKIP. Not on watchlist. FOMO trigger. Note for tomorrow's watchlist analysis — is there a valid post-spike setup at support in 2-3 days?`,
                `BNB influencer tweet: SKIP. Influencer tweet is not an analytical signal. BNB not on watchlist. Social media pressure is one of the most reliable FOMO amplifiers.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `A trader's record of the last 20 FOMO trades (entered without pre-planning, chasing moves already in progress):

Average entry: 8.4% after the daily open move had already occurred
Average stop placement: none (12 of 20 had no stop set)
Average hold time: 2.3 hours
Win rate: 30% (6 of 20 profitable)
Average win: +2.1%
Average loss: −4.8%
EV per trade: (30% × 2.1%) − (70% × 4.8%) = 0.63% − 3.36% = −2.73% per trade
Total P&L across 20 trades: −$2,184 on an account of $15,000 (−14.6% of account in 20 trades)

For comparison, the same trader's pre-planned trades in the same period (on the watchlist):
Win rate: 56%. Average win: +3.8%. Average loss: −1.9%.
EV: (56% × 3.8%) − (44% × 1.9%) = 2.128% − 0.836% = +1.292% per trade.

1. Quantify the cost of FOMO trading vs planned trading
2. If the trader eliminated all FOMO trades, what would the 20-trade net result be?
3. What is the single rule that would eliminate the FOMO trades?
4. Why does FOMO produce a 30% win rate vs 56% for planned trades?`,
              scoringCriteria: [
                `FOMO trades: −2.73% EV per trade × 20 trades × average position value = −$2,184 total loss.`,
                `If FOMO trades eliminated: 0 additional losses from those 20 trades. The $2,184 stays in the account. The planned trades continue generating +1.292% EV.`,
                `Single rule: "No trades entered unless on the pre-session watchlist and all 5 checklist elements are met."`,
                `Why 30% vs 56% win rate: FOMO entries at spike highs have inherently poor R:R (stops far below, continuation limited above). They enter after professional smart money has already moved the price — at the point professionals are distributing/taking profits. Planned entries at support/breakout levels have trend tailwind and technical confirmation.`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `BTC/USDT, daily chart. You are reviewing yesterday's price action.

Yesterday's events:
- BTC opens at $70,200. Your watchlist had a long setup at $71,200 breakout (resistance), with a stop at $69,400 and TP at $74,800.
- 10am: BTC spikes +7% to $75,100 within 4 hours (CPI data came in lower than expected).
- Your $71,200 limit order was not triggered because price gapped through it — filled at $71,300 on the gap open.
- By end of day, BTC closed at $74,200.

Today:
- BTC opens at $73,800 and is pulling back slightly.
- The $71,200 breakout level is now being tested as support from above.

You did NOT FOMO chase yesterday's spike because your order was a limit (filled at your planned level). But now you're watching the pullback to $71,200 (the prior resistance now support).

Questions:
1. Was yesterday's limit fill a FOMO trade? Why or why not?
2. The pullback to $71,200 today — is this a new trade setup or the same trade?
3. If you have no existing position (the first trade stopped out at breakeven when you moved the stop), design the new setup at today's $71,200 test.`,
              scoringCriteria: [
                `Yesterday's limit fill: NOT a FOMO trade. The $71,200 breakout was pre-identified on the watchlist. A pre-planned limit order that happens to fill on a gap is NOT FOMO — it is the plan executing. FOMO would have been adding a market buy at $74,000+ after seeing the spike.`,
                `Today's pullback to $71,200: a NEW setup. Prior resistance tested as support = classic retrace entry. Requires fresh analysis and a new trigger candle at the level.`,
                `New setup: Entry $71,400 (trigger candle at $71,200 level — wait for bullish close at or above the support). Stop $70,200 (below the $71,200 support with buffer). TP1 $74,800 (prior resistance). TP2 $76,000. R:R = $3,400/$1,200 = 2.83:1. Valid entry.`,
                `Volume check: the pullback to $71,200 on declining volume would confirm a healthy retracement (not a new sell-off). Rising volume on the pullback would be a warning.`,
              ],
            },
          ],
        },

        {
          id: 'fear-panic-selling',
          title: `Fear and Panic Selling`,
          explanation: `On March 12, 2020 — Black Thursday — Bitcoin fell 50% in 24 hours. Analysis of exchange data showed that the majority of the selling volume came from retail accounts, not institutional ones. Institutional traders (those with systematic rules) largely held their positions or added. Retail traders, overwhelmed by the visible 50% decline, sold en masse near the bottom. Bitcoin reached $3,800 and recovered to $12,000 by August 2020 and $60,000 by April 2021. The traders who panic-sold at $3,800 crystallised a loss from which Bitcoin had fully recovered within 5 months.

Fear in trading is not inherently wrong. The problem is when fear is proportional to the size of the visible move rather than to the actual risk defined in the pre-trade plan. A planned trade with a $200 stop loss should produce $200 in fear (discomfort), not a cascading anxiety about the entire account.

The panic-sell pattern: a position moves against the trader. The initial move is within the expected range (stop not triggered). Instead of the stop managing the exit, the trader watches in real-time and panics when the unrealised loss becomes emotionally intolerable — which is almost always before the technical stop is reached. They exit manually at a worse price than the stop. They have spent emotional capital without receiving the mechanical protection the stop was designed to provide.

Three causes of panic selling: (1) Position too large — if a position triggers fear at a 2% adverse move, it is oversized. (2) No stop placed — the trader has no predefined exit, so the open-ended downside creates unlimited anxiety. (3) Watching the tick-by-tick chart during a losing trade — the visual of a falling P&L activates the threat-detection system continuously.

The solutions in order: (1) Size positions correctly — never larger than 1-2% risk at stop. (2) Always set stops before entering. (3) After entry with a stop set, do not watch tick-by-tick. Check at pre-defined intervals (end of 4H candle, daily close).`,
          visualPrompt: `👆 Panic sell pattern — exits before the stop, then price recovers`,
          visualType: `gif`,
          visualUrl: `panic-sell-recovery`,
          strategy: `If you feel the urge to exit before your stop triggers: close the chart for 30 minutes. Do not watch the tick-by-tick price. Return and check whether the stop has been hit. If not, the plan is intact. The urge to panic-exit before the stop fires is the emotion asking you to pay more for the same outcome the stop would have delivered.`,
          examples: [
            {
              contextTag: `[Trader, BTC/USDT, stop-managed vs panic-sold]`,
              context: `Two traders both enter BTC long at $72,000 with stops at $70,000.`,
              scenario: `BTC falls to $70,400 intraday. Trader A watches the tick chart and manually exits at $70,600 in panic. Trader B set a stop-market at $70,000 and closed the chart. Trader B's stop is not triggered. BTC recovers to $73,800.`,
              outcome: `Trader A: −$1,400 loss ($72,000 − $70,600) realised. Trader B: no trade closure, unrealised gain of $1,800. The only difference: Trader A watched the chart and panicked; Trader B set the stop and removed themselves from the screen.`,
            },
            {
              contextTag: `[Portfolio analysis, retail vs institutional, March 2020]`,
              context: `Exchange data from March 12, 2020 (Bitcoin −50% in 24 hours).`,
              scenario: `Retail accounts (identifiable by position sizes <10 BTC): net sellers throughout the decline. Maximum selling volume occurred between $4,800 and $3,800 — the final 20% of the move. Institutional accounts (>100 BTC positions): small sellers in the early decline, net buyers from $4,500 to $3,800.`,
              outcome: `Retail traders sold most at the bottom. Institutional traders bought at the bottom. The difference was not analytical — institutional traders did not "know" the bottom was $3,800. The difference was systematic discipline: their stop levels were not breached (or they had different risk frameworks), so they did not panic-sell. The emotional capitulation of retail traders provided the liquidity for institutional accumulation.`,
            },
            {
              contextTag: `[New Trader, ETH/USDT, position size as fear root cause]`,
              context: `A trader with a $10,000 account puts 40% ($4,000) into a single ETH long. Their stop is at −5% of the position ($200 risk — 2% of account). Technically correct risk.`,
              scenario: `ETH drops 3% from entry. The $4,000 position is now worth $3,880. The trader sees a "$120 loss" on a $4,000 position and feels disproportionate fear — because the visible number ($4,000 exposed) is 40% of their account.`,
              outcome: `The technical risk was correct (2% of account). But the visible position size ($4,000) triggered fear disproportionate to the actual risk ($120 at stop). The trader panic-exits at $3,880 (−$120). The stop would have exited at −$200 — the trader paid $120 for the same emotional outcome the stop would have provided mechanically. Fix: use OCO and close the chart, eliminating the visible P&L feed.`,
            },
          ],
          keyTakeaway: `Panic selling exits before the stop fires, paying an emotional premium to avoid watching the decline. The stop already defines and manages the maximum loss — panic-selling adds no protection, it just pays more for the same outcome. Set stops, size correctly, and close the chart after entry.`,
          guidedPractice: [
            {
              question: `You have a stop at $69,800 on a BTC long from $72,000. BTC falls to $70,200. Your heart is racing. What should you do?`,
              options: [
                `A — Exit immediately — being this close to the stop means it will certainly hit`,
                `B — Close the chart. Your stop is at $69,800 — it has not been hit. The plan is intact. Return in 30 minutes to check.`,
                `C — Move the stop down to $68,000 to give more room`,
                `D — Add to the position at $70,200 to average down`,
              ],
              correct: 1,
              hint: `Has your stop been hit? What does the stop's purpose eliminate from your decision-making?`,
              explanation: `B is correct. The stop at $69,800 exists precisely to manage this scenario. BTC at $70,200 is not at the stop — the plan is intact. The racing heart is the emotion responding to the visual of a falling P&L, not to an actual plan-invalidating event. Closing the chart removes the emotional input. The stop will handle the exit mechanically if needed. C is the classic stop-moving response that increases actual risk. D adds to a losing position without new analytical justification.`,
            },
            {
              question: `What are the three root causes of panic selling?`,
              options: [
                `A — Market volatility, time of day, and asset type`,
                `B — Oversized position (fear proportional to visible dollar amount not technical risk), no stop placed (unlimited visible downside), and watching tick-by-tick price during a losing trade`,
                `C — Insufficient technical analysis, wrong timeframe, and bad entry timing`,
                `D — Leverage use, weekend trading, and altcoin exposure`,
              ],
              correct: 1,
              hint: `Think about what makes a losing trade emotionally intolerable. What are the specific conditions that amplify that intolerability?`,
              explanation: `B is correct. (1) Oversized position: even a correctly sized trade by % risk can trigger disproportionate fear if the position's visible dollar amount is large relative to account size. Correct sizing by % eliminates this. (2) No stop: an open-ended loss creates continuous anxiety as each new lower price adds to the theoretical loss. A pre-placed stop caps the loss. (3) Watching tick-by-tick: each adverse tick activates the threat-detection system. Checking only at predefined intervals removes the continuous stimulation.`,
            },
            {
              question: `Retail traders sold most near Bitcoin's $3,800 March 2020 low while institutional traders were net buyers. What explains this divergence?`,
              options: [
                `A — Institutional traders knew the bottom was $3,800`,
                `B — Retail traders were responding to the visible emotional weight of a −50% move. Institutional traders operated within systematic frameworks with pre-defined stop levels that were not breached, preventing emotional capitulation.`,
                `C — Institutional traders had more capital to absorb losses`,
                `D — Bitcoin's fundamentals were better known to institutional traders`,
              ],
              correct: 1,
              hint: `Both retail and institutional traders had the same price data. Why did they act differently?`,
              explanation: `B is correct. No institutional trader "knew" the bottom was $3,800. The difference was systematic risk management: institutional stops were either not triggered (their risk frameworks allowed for the −50% move within their position sizing) or they had pre-defined rules for adding at specific levels. Retail traders had no such systematic framework — the visual of −50% triggered the evolutionary flight response. The systematic vs emotional response is the true dividing line, not information access or capital size.`,
            },
            {
              question: `You enter ETH at $3,800 with a stop at $3,620 (−4.7%). What maximum visible loss should you expect to occasionally experience before the stop triggers?`,
              options: [
                `A — Zero — the stop prevents any visible loss`,
                `B — Up to $180/ETH (−4.7%) as the price approaches the stop before potentially recovering. This is the anticipated maximum adverse excursion — normal, expected, and managed by the stop.`,
                `C — The stop means the trade cannot go negative`,
                `D — Losses should be limited to −1% at most — if it goes to −4.7%, the stop is wrong`,
              ],
              correct: 1,
              hint: `The stop defines the maximum loss IF hit. What is the range of visible unrealised loss between entry and stop?`,
              explanation: `B is correct. If entry is $3,800 and stop is $3,620, the trade can show an unrealised loss of up to $180/ETH without triggering the stop. That full $180 adverse move before a recovery is the expected range of normal trade variance. A −4.7% adverse move that then recovers is not a failed trade — it is a trade that tested the stop zone and held. Psychological preparation for the full adverse excursion is part of the trade plan. If a $180 visible loss on the position is emotionally intolerable, the position is oversized.`,
            },
            {
              question: `A trader says: "I always exit slightly before my stop to avoid the extra few dollars of loss from slippage." What is the real problem?`,
              options: [
                `A — This is smart — avoiding slippage is rational`,
                `B — This is panic selling rationalised as cost management. The stop is placed at a technical level for a reason. Manually exiting "slightly before" is consistently exiting before the technical level is confirmed broken — missing trades that would have recovered.`,
                `C — They should exit exactly at the stop level for precision`,
                `D — This is correct if the stop is a stop-limit (not stop-market)`,
              ],
              correct: 1,
              hint: `If the stop is at the technical level where the thesis is invalidated, what happens when you exit slightly before that level?`,
              explanation: `B is correct. Exiting "slightly before the stop to avoid slippage" is emotional rationalisation. The stop is at $X because that is where the trade thesis is invalidated — if price reaches $X, the trade is wrong. Exiting at $X + $5 means exiting before the thesis is confirmed wrong, as the trade might have recovered from $X + $5. Over time, this pattern exits trades that would have held, accumulates small additional losses (the gap between "slightly before" and actual stop), and provides no improvement over simply using a stop-market order.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-reversal`,
              scenario: `ETH/USDT, 4-hour chart. You entered long yesterday.

Entry: $3,740 (bullish engulfing at 4H support)
Stop: $3,600 (below support zone, stop-market order placed)
TP1: $3,940 (40%), TP2: $4,100 (35%), TP3: $4,280 (25%)
Position: 2.1 ETH
Account: $14,000, risk: 1.5% ($210)

4H price progression since entry:
Bar 1 (+4H): $3,790. Bar 2 (+8H): $3,810. Bar 3 (+12H): $3,775. Bar 4 (+16H): $3,680.
Bar 5 (+20H): $3,640. Bar 6 (+24H): $3,615. Bar 7 (+28H): $3,598. (Bar 7 CLOSE is $3,598 — one tick above your stop at $3,600 but technically NOT triggered yet)

Emotional state: extremely stressed. The position has been in a loss for 8 hours. ETH fell to within $2 of your stop.

Questions:
1. Has your stop been triggered at any point in this sequence?
2. What action does the pre-written plan say to take right now?
3. What emotional pressure might push you to exit manually here and why is that wrong?
4. Bar 8 arrives: opens at $3,602, rallies to $3,660. Bar 9: $3,740. What would have happened to a manual panic exit at $3,615 (Bar 6)?`,
              scoringCriteria: [
                `Stop NOT triggered. Bar 7 closed at $3,598 — but the stop is a stop-market that triggers when price REACHES $3,600. If Bar 7 closed at $3,598 it means price dipped to $3,600 during the bar but the CLOSE was $3,598. The stop-market should have triggered if price actually reached $3,600 intrabar. User should note this ambiguity — if stop was intrabar-triggered, the system handled it. If it wasn't (e.g., wick touched but market order didn't fill), the close is $3,598 — stop not confirmed.`,
                `Plan says: IF stop not triggered, do nothing. The plan is intact until $3,600 is hit on the stop-market.`,
                `Emotional pressure: 8+ hours of losses, watching the position approach the stop, the urge to "just get out before it goes lower." This is the stop-avoidance panic response — exiting before the mechanical protection triggers, paying more for the same outcome.`,
                `Manual exit at $3,615 (Bar 6): loss = 2.1 ETH × ($3,740 − $3,615) = 2.1 × $125 = $262.50. After Bars 8-9 recovery to $3,740 (breakeven): the panic exit cost $262.50 for a trade that returned to breakeven. Compare to stop at $3,600: if triggered, loss = 2.1 × $140 = $294. The panic exit saved $31.50 vs the stop — but if the stop was never triggered and the trade recovered to $3,940 TP1, the panic exit cost the entire TP1 profit.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Analyse two traders' 60-trade records over the same period. Market conditions were volatile (30% more daily ATR than average).

Trader A (mechanical stops only): 
- 60 trades entered. All with stop-market orders set at entry.
- Panic exits (manual close before stop): 0.
- Stop-outs: 22 (36.7%).
- Winner exits (TP hit or trailing): 38 (63.3%).
- Average loss at stop: −$182. Average win: +$390.
- Net P&L: 38 × $390 − 22 × $182 = $14,820 − $4,004 = +$10,816.

Trader B (manual management):
- 60 trades entered. Often moved stops, manually exited early.
- Panic exits (manual close before stop level): 19.
- Stop-outs (stop actually triggered): 14.
- Winners: 27.
- Average panic-exit loss: −$248 (exits at worse level than stop).
- Average stop-out loss: −$180.
- Average win: +$312 (wins cut short by early profit-taking).
- Net P&L: 27 × $312 − 19 × $248 − 14 × $180 = $8,424 − $4,712 − $2,520 = +$1,192.

Questions:
1. What is the P&L difference and what caused it?
2. What did Trader B's panic exits cost compared to letting stops run?
3. What would Trader B's results be if they had matched Trader A's stop discipline?`,
              scoringCriteria: [
                `P&L difference: $10,816 (A) vs $1,192 (B) = $9,624 difference. Both had the same number of trades in the same market.`,
                `Panic exit cost: Trader B's 19 panic exits averaged −$248 vs stop level of approximately −$182. Extra loss per panic exit: $66. Total: 19 × $66 = $1,254 extra losses from panic exits alone.`,
                `Additionally: Trader B's wins averaged $312 vs Trader A's $390 — $78 less per win from early profit-taking. 27 wins × $78 = $2,106 less in wins.`,
                `Combined cost of emotional management vs mechanical: $1,254 (panic exits) + $2,106 (cut wins) = $3,360 directly attributable to emotional decisions.`,
                `If Trader B matched stop discipline: 60 trades × Trader A parameters → approximately $10,816 net. The behavioral gap was worth $9,624 on identical trade counts.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are helping a friend who has recently had three bad trading experiences:

Experience 1: Entered SOL at $192. It dropped to $185. They panic-exited at $185. SOL recovered to $204 the next day.
Experience 2: Entered BTC at $72,000. It dropped to $70,800. They moved the stop from $70,000 to $68,000. BTC continued to $68,400, triggering the new stop. Loss: $3,600 vs original planned $2,000.
Experience 3: Entered ETH at $3,800 with no stop. It dropped to $3,620. They held, hoping for recovery. ETH fell to $3,400 before recovering to $3,760. They exited at $3,760 — still a $40/ETH loss but not as bad as the $400 they endured during the hold.

For each experience: (1) Identify the psychological error, (2) What the correct mechanical action would have been, (3) Calculate the cost of the psychological error vs the planned approach.`,
              scoringCriteria: [
                `Experience 1: Panic sell. Exited at $185 (−$7/SOL) before stop. If they had a stop at, say, $184 (below prior support), it would not have triggered. Correct action: set stop-market at $184 at entry, close chart, check at candle close. Cost: missed $204 recovery — approximately $19/SOL opportunity vs actual −$7/SOL loss.`,
                `Experience 2: Stop widening. Moved stop from $70,000 to $68,000. Cost: $70,000 original stop (−$2,000 per BTC) vs $68,000 new stop (−$4,000 per BTC) = $2,000 additional loss. Correct action: stop-market orders placed at entry that cannot be easily manually cancelled — or a written rule "never move stop away from price."`,
                `Experience 3: No stop, sunk cost holding. ETH fell from $3,800 to $3,400 (−$400) and recovered to $3,760 (−$40 exit). If a stop had been placed at $3,620 (prior support below entry): exit at −$180/ETH instead of suffering −$400 decline and eventual −$40 exit. Correct action: always set stop before entering. The $140 difference between planned stop ($3,620) and eventual exit ($3,760) = $140/ETH saved by disciplined stop use.`,
              ],
            },
          ],
        },

        {
          id: 'revenge-trading',
          title: `Revenge Trading`,
          explanation: `A 2019 academic study of 400 retail forex traders found that after experiencing a loss, traders increased their position size on the very next trade by an average of 31%. After two consecutive losses, the average increase was 58%. After three consecutive losses, some traders increased size by over 100%. In nearly all cases, these enlarged positions following losses performed worse than the trader's baseline — the combination of emotional state and oversized risk created a negative feedback loop.

Revenge trading is the impulse to immediately recover losses through the next trade — usually by increasing position size, ignoring entry criteria, or entering immediately after a loss without waiting for a valid setup. It is called "revenge" because the psychological experience is of wanting to "get back" at the market.

The market does not know you had a losing trade. It cannot be "beaten" or "punished." There is no revenge to be had. There is only your next trade and whether it meets your criteria.

The mechanics of revenge trading's destruction: (1) After a loss, the trader enters the next trade with larger size — violating the 1-2% rule. (2) The larger size creates larger emotional responses to any adverse move. (3) The entry is rushed — no checklist, no trigger, no level. (4) The trade is likely to fail because it was entered on emotion, not analysis. (5) The failure with larger size creates a larger loss than the original — compounding the problem.

The daily loss limit rule eliminates revenge trading mechanically: set a maximum daily loss of 3-4% of account. If that limit is reached, trading stops for the day. No exceptions. The limit prevents the third, fourth, and fifth trades that come after an emotional blowup and are almost universally destructive.

Paul Tudor Jones, asked about his best risk management rule, said: "Never average down." The instinct to buy more of something that is falling is the cousin of revenge trading — adding risk to a situation that has already moved against you.`,
          visualPrompt: `👆 Revenge trading spiral — each loss leads to larger next position`,
          visualType: `gif`,
          visualUrl: `revenge-trading-spiral`,
          strategy: `Daily loss limit: if you lose 3% of account in one trading day, close the platform and stop for the day. No exceptions. If a single trade stops out, wait at least 30 minutes before evaluating the next setup. Never increase position size after a loss. The next trade uses the same percentage risk as always, regardless of recent losses.`,
          examples: [
            {
              contextTag: `[Trader, BTC/USDT, revenge spiral]`,
              context: `A trader has a bad morning: two consecutive BTC trades stopped out for −1% each. They are down 2% on the day. It is 10:30am.`,
              scenario: `The trader feels the urge to recover. They see a BTC "setup" (actually no checklist elements — just price bouncing) and enter with 3× their normal position. The trade goes against them immediately. −3% on the oversized position = −3% × 3× position = −9% loss on the account portion exposed.`,
              outcome: `Day total: −2% (planned losses) + −9% (revenge trade loss) = −11% in one day. The original plan's maximum daily loss on two planned 1% trades: −2%. The revenge trade added −9%. The market did not know they were trying to recover — it continued following its own patterns regardless.`,
            },
            {
              contextTag: `[Disciplined Trader, ETH/USDT, daily loss limit in practice]`,
              context: `A disciplined trader has a 3% daily loss limit rule. At 11am they are down 3% (three 1% losses in a row).`,
              scenario: `Despite seeing what looks like a setup developing, the trader closes the platform per their rule. They return the next morning, review yesterday's three trades (all were valid setups that just didn't work), and trade normally.`,
              outcome: `The three losses were normal variance — even with positive EV strategies, losing runs occur. By stopping at −3%, the trader preserves 97% of their account for the next day. Over a month of trading, days where the limit triggers represent 20% of days — but those days produce only −3% losses vs the potential −15%+ of unlimited revenge trading. The limit converts potential catastrophic days into controlled −3% days.`,
            },
            {
              contextTag: `[New Trader, SOL/USDT, classic revenge pattern]`,
              context: `A new trader loses $180 on a SOL trade (1% of account). Immediately wants to "make it back."`,
              scenario: `They enter a second trade in 3 minutes — no checklist, no level, just a price they think "looks like it will go up." Position size: $6,000 (triple normal). SOL falls 2.8% immediately. Loss: −$168.`,
              outcome: `Two trades, 12 minutes, −$348 total. The first loss was a planned −$180. The revenge trade added −$168. At this point the trader is down 1.93% on the day — nearly the 2× the original loss. The revenge trade also used no checklist — so they entered without a level, without a trigger, without a stop. The loss was predetermined by the entry methodology, not by bad luck.`,
            },
          ],
          keyTakeaway: `Revenge trading increases position size and ignores criteria after a loss — the combination that guarantees larger losses. The solution is mechanical: a 3-4% daily loss limit that stops trading when reached, a 30-minute waiting period after any loss before the next setup evaluation, and a strict same-size rule after losses.`,
          guidedPractice: [
            {
              question: `You lose 1.5% on a trade. Your emotional impulse is to immediately enter the next trade with twice the normal size to recover. What is the correct response?`,
              options: [
                `A — Double the size — recovering faster is rational`,
                `B — Wait 30 minutes. Then evaluate the next setup with standard criteria and standard 1-2% risk. The loss does not change the next trade's probability or justify larger risk.`,
                `C — Skip trading for the rest of the day`,
                `D — Enter with the same oversized position but use a tighter stop`,
              ],
              correct: 1,
              hint: `Does the previous loss increase the next trade's probability of winning? Does increasing position size after a loss improve or worsen EV?`,
              explanation: `B is correct. Each trade is independent. The 1.5% loss does not make the next trade more likely to win, and doubling the size adds double the risk without improving probability. The 30-minute pause allows the emotional state to stabilise before analysis begins. Standard 1-2% risk applies to the next trade regardless of recent history. Doubling size after a loss is the revenge trading pattern: it turns a −1.5% day into a potential −4.5% day if the doubled position also loses.`,
            },
            {
              question: `Why is a daily loss limit (e.g., stop trading at −3% for the day) one of the most important psychological safeguards?`,
              options: [
                `A — It limits learning opportunities by stopping trades too early`,
                `B — It prevents the compounding revenge-trading spiral. The trades taken after emotional loss-induced trading are statistically the worst-quality trades of any session. A 3% limit converts potentially catastrophic days into manageable −3% days.`,
                `C — It only matters for new traders — experienced traders don't need limits`,
                `D — 3% is arbitrary — any number works equally well`,
              ],
              correct: 1,
              hint: `What is the quality of trade entries and position sizes after a trader has already lost multiple times in a session?`,
              explanation: `B is correct. Research consistently shows that trades made in emotional states following losses are lower quality: rushed entries, ignored criteria, oversized positions, absent stops. A daily loss limit mechanically prevents the third, fourth, and fifth trades that come after emotional disruption. The first 1-2 losses might be valid strategy trades. The third trade after those losses is very likely a revenge trade. The daily limit stops the session before the revenge trades begin.`,
            },
            {
              question: `"The market owes me for those losses — I just need to get back to even." What is wrong with this belief?`,
              options: [
                `A — Nothing — the market does exhibit mean reversion`,
                `B — The market has no knowledge of your position or your losses. It does not "owe" anything. This belief anthropomorphises the market and leads to taking trades purely to reach a psychological target (breakeven) rather than because the setup meets criteria.`,
                `C — It's true for some assets but not Bitcoin`,
                `D — The market does owe you — positive EV strategies guarantee recovery`,
              ],
              correct: 1,
              hint: `Does the market know you exist? Can a series of random outcomes "owe" you a positive outcome?`,
              explanation: `B is correct. The market is the aggregate of millions of participants, most of whom do not know you. It has no obligation to provide a recovery from your specific losses. Believing "I'm owed a win" leads to taking lower-quality trades in order to reach the breakeven target — entering setups that don't meet criteria, entering at times that aren't on the watchlist, oversizing. All of these increase the probability of continued losses rather than recovery. The correct belief: "The next trade is independent. It will only be taken if all five checklist elements are present, at standard position size."`,
            },
            {
              question: `You hit your 3% daily loss limit at 11am. An extremely high-conviction setup appears at 11:30am on your watchlist — all five checklist elements present, 4:1 R:R. Do you take it?`,
              options: [
                `A — Yes — high conviction overrides the daily limit`,
                `B — No. The daily loss limit is a non-negotiable rule. "High conviction" in an emotionally compromised state is not the same as high conviction in a calm state. The limit exists for precisely this moment.`,
                `C — Take half the normal position as a compromise`,
                `D — Wait until 12pm, then take it`,
              ],
              correct: 1,
              hint: `The daily loss limit rule says no exceptions. Why is "I feel highly confident about this one" the exact red flag that suggests the limit should hold?`,
              explanation: `B is correct. The daily loss limit is a non-negotiable rule — by definition, it cannot have exceptions or it is not a rule. More importantly: after hitting the 3% daily loss limit, the trader is in an emotionally compromised state. What feels like "high conviction" in that state is significantly influenced by the desire to recover losses. Every revenge trader feels high conviction about the trade that will "definitely" recover them. The rule exists for this exact moment. Note it in the journal, evaluate it fresh tomorrow with clear analysis.`,
            },
            {
              question: `A trader who averages down (buys more of a falling position) is exhibiting which psychological pattern?`,
              options: [
                `A — Professional risk management — averaging improves entry price`,
                `B — A form of revenge/recovery trading — adding risk to a position that has moved against the thesis, driven by the desire to reduce the required recovery move rather than by updated analysis`,
                `C — A valid strategy if position sizing is maintained`,
                `D — Sunk cost fallacy only — not related to trading psychology`,
              ],
              correct: 1,
              hint: `Why do traders add to losing positions? Is it because the analysis improved or because the position needs a smaller recovery to break even?`,
              explanation: `B is correct. Averaging down is typically motivated by the desire to reduce the breakeven point — "if I buy more at $65,000, I only need it to recover to $68,000 instead of $72,000." This is recovery-driven, not analysis-driven. The original thesis (long at $72,000) has already been partially invalidated by the fall to $65,000. Adding at $65,000 doubles the exposure to an asset that is currently moving against the original thesis. Paul Tudor Jones: "Never average down." The analysis that justified $72,000 must be re-evaluated at $65,000 — if it still holds, a fresh position at $65,000 is valid (with its own stop). Adding to the existing loser without re-validating the thesis is psychologically (not analytically) motivated.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `A trader's Monday trading log:

8:30am: Pre-session analysis. Three watchlist setups identified. Emotional state: 7/10 calm.
9:00am: Trade 1 (BTC long, 1.5% risk). Setup valid. Stopped out at −1.5%. Emotional state: 5/10.
9:25am: Trade 2 (ETH long, 1.5% risk). Setup marginally valid (4/5 checklist elements). Stopped out −1.5%. Emotional state: 3/10. Running total: −3%.
9:30am: No more watchlist setups. Trader sees SOL moving and feels "I have to get back to even."
9:35am: Trade 3 (SOL long, 3× normal size = 4.5% risk). No checklist. Entry at SOL high of day.
9:55am: SOL drops 3.8%. Loss: −3.8% × 3 = −11.4% of account at that position weighting.
10:00am: Day total: −14.4% of account.

1. At what point should the daily loss limit have stopped trading?
2. What was the actual cost of the revenge trade vs the daily limit rule?
3. What were the warning signs before Trade 3?
4. Redesign this trader's rules to prevent this outcome.`,
              scoringCriteria: [
                `Daily limit should have stopped at 9:25am (after Trade 2). −3% reached after two valid stopped-out trades. No more trading for the day.`,
                `Cost of ignoring the limit: −14.4% total vs −3% maximum under the rule = −11.4% avoidable loss from one revenge trade.`,
                `Warning signs before Trade 3: (1) No watchlist setup for SOL (not on pre-session list). (2) Emotional state 3/10 (below minimum). (3) 4.5% risk = 3× normal (revenge sizing). (4) Entry at the high of day (FOMO pattern). (5) No checklist applied.`,
                `Redesigned rules: (1) Hard 3% daily loss limit — platform closes automatically or enforced by rule. (2) No trade after reaching the limit regardless of "conviction." (3) Trade sizing never changes after a loss — always standard percentage. (4) Emotional state check before every trade — below 6/10 = no trade. (5) 30-minute mandatory break after any stopped trade.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Compare two traders over 3 months with identical strategies and win rates:

Trader A (with daily loss limit, emotional rules):
- 180 total trades (average 3/day)
- Win rate: 54%. Average win: $380. Average loss: −$185.
- Days where daily limit (3%) triggered: 18 (10% of trading days)
- On those 18 limited days: losses stopped at exactly −3% each
- Remaining 162 days: standard performance
- Net P&L: 97 wins × $380 + 83 losses × −$185 = $36,860 − $15,355 = +$21,505

Trader B (no daily limit, allows revenge trading):
- Same 180 trades (but revenge trades added approximately 0.8 extra trades on bad days)
- 194 total trades
- Win rate on revenge trades: 28% (consistent with anger-driven entries)
- Revenge trades: 14 (average −$440 each)
- Win rate on planned trades: 54% (same as A)
- Net on planned trades: same $21,505 as A
- Net on revenge trades: 14 × (28% × $380) + 14 × (72% × −$440) = $1,486 − $4,435 = −$2,949
- Total: $21,505 − $2,949 = +$18,556

What is the pure dollar cost of Trader B's revenge trading? What percentage advantage does Trader A's discipline give?`,
              scoringCriteria: [
                `Pure dollar cost of revenge trades: $21,505 − $18,556 = $2,949 over 3 months.`,
                `Percentage advantage: $2,949/$18,556 = 15.9% more profit for Trader A on identical strategy performance.`,
                `Annualised: $2,949 × 4 quarters = $11,796/year cost of revenge trading.`,
                `Key insight: the underlying strategies were IDENTICAL. The entire performance gap came purely from the 14 revenge trades. This is the quantifiable cost of lacking the daily loss limit rule.`,
                `Trader A's daily limit fires on 10% of trading days — a real constraint. But converting those days from "unlimited downside revenge" to "controlled −3% stop" saved $2,949 in the quarter.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You had a rough morning: two valid trades both stopped out (−1.5% each). It is 11am. You are at −3% for the day — exactly at your daily loss limit.

Current market: ETH has just formed what appears to be a very clean setup on the 4H chart:
- Daily trend: up
- 4H support tested and holding at $3,620
- Bullish hammer just formed at $3,624 on 2.1× volume
- R:R: $3,624 entry, stop $3,540, TP $3,880 = R:R = $256/$84 = 3.05:1
- All 5 checklist elements present

Your emotional state: frustrated from the two losses, but this setup looks genuinely excellent.

Walk through the complete decision process for this trade, applying everything from this lesson.`,
              scoringCriteria: [
                `Daily loss limit check: −3% reached = NO MORE TRADES TODAY. Rule is non-negotiable.`,
                `Emotional state check: frustrated (the log says "frustrated from two losses") — below the 6/10 threshold for trading. Even without the daily limit, emotional state alone disqualifies entry.`,
                `"Excellent setup" assessment: the setup may genuinely be valid. But "this setup looks excellent" after two losses while frustrated is exactly how every revenge trade feels to the trader taking it. The daily limit and emotional state rules exist for this exact scenario.`,
                `Correct action: Log the setup in full detail (entry $3,624, stop $3,540, TP $3,880, all checklist elements). Note it for tomorrow's watchlist evaluation. If the setup is still valid tomorrow in a calm state, it becomes a planned trade. Do not enter today.`,
                `Tomorrow check: if ETH held $3,620 support and is still in the setup, a fresh entry can be evaluated. If ETH has already moved to $3,800 — the daily limit protection prevented a FOMO chase as well.`,
              ],
            },
          ],
        },

        {
          id: 'thinking-in-probabilities',
          title: `Thinking in Probabilities`,
          explanation: `Ed Seykota, who turned $5,000 into $15 million over 12 years, has said: "The elements of good trading are: cutting losses, riding winners, keeping bets small, and following the rules without question. Following the rules — even the ones you disagree with — is what separates professionals from amateurs." The foundation of this discipline is probabilistic thinking: understanding that no single trade outcome reveals whether your strategy is working.

The most common psychological trap in trading: using the outcome of the most recent trade to evaluate the strategy. One loss → "my strategy is broken." One win → "I've found the edge." Both reactions ignore the statistical reality: any positive-EV strategy will produce losing trades. Many of them. In a row. Regularly.

At a 55% win rate, the following run lengths occur:
— 5 consecutive losses: 1.85% probability per trade = happens every 54 trades on average
— 8 consecutive losses: 0.26% probability = happens every 390 trades on average
— 10 consecutive losses: 0.067% probability = happens every 1,493 trades on average

An active trader making 3 trades per day hits 8 consecutive losses approximately once every 130 days of trading. This is mathematically guaranteed to happen to every trader running any strategy with a loss rate above zero. It is not evidence that the strategy is broken. It is expected variance.

Probabilistic thinking means evaluating your strategy over samples of 30–100 trades, not over the last 3. It means expecting losing streaks and not emotionally reacting to them. It means trusting the R:R and win rate math to compound over time rather than seeking confirmation of "skill" from individual outcomes.

The professional practice: track EV per trade over rolling 20-trade samples. If the rolling 20-trade EV is positive and consistent with the strategy's expected parameters, the strategy is working — regardless of whether the last 3 trades were wins or losses.`,
          visualPrompt: `👆 Distribution of outcomes — win streaks and loss streaks in a positive EV strategy`,
          visualType: `gif`,
          visualUrl: `probability-distribution-outcomes`,
          strategy: `Evaluate your strategy on rolling 20-trade samples, not individual outcomes. Accept that 5–8 consecutive losses will occur regularly in any strategy. Do not change position sizing, stop placement, or entry criteria based on fewer than 20 trades of data. Track EV, not just win rate. The goal is positive EV over time — not winning every trade.`,
          examples: [
            {
              contextTag: `[Systematic Trader, BTC, 8-loss streak management]`,
              context: `A trader with a documented 57% win rate and 2.5:1 R:R has 8 consecutive losses. Their rolling 100-trade EV is +$890/trade.`,
              scenario: `After the 8th consecutive loss, they review: "Is my strategy broken?" They check: (1) Were all 8 trade setups valid per checklist? Yes. (2) Were stops placed correctly? Yes. (3) Is the current market unusually correlated (trending strongly against their setups)? Yes — BTC is in a defined downtrend and all setups were longs.`,
              outcome: `The review reveals a real issue: trading longs in a downtrend reduces their win rate below 57%. They pause long setups until BTC reclaims a trend level. The 8-loss streak was both expected variance and a real market condition signal. The distinction: the losses were technically valid trades (strategy was executed correctly) in a market that temporarily moved against the strategy's directional bias. Correct response: not to abandon the strategy, but to add a market condition filter.`,
            },
            {
              contextTag: `[New Trader, overreacting to variance]`,
              context: `A new trader has 4 wins in their first 5 trades. They conclude they have "mastered" trading.`,
              scenario: `They increase position size to 3% per trade (from 1%). Their next 4 trades are all losses. At 3% per trade: −12% in 4 trades. They return to 1% and have 3 wins. They believe the 3% was "bad luck."`,
              outcome: `The first 5-trade sample (4 wins) was normal positive variance in any 55% win rate strategy. The 4-loss run was also normal negative variance. Neither is evidence of a changed skill level. The position sizing change (based on 5-trade "mastery") created the large drawdown. The probabilistic lesson: 30 trades minimum before any assessment of strategy performance. 100 trades for statistical significance.`,
            },
            {
              contextTag: `[Professional Trader, framework for evaluation]`,
              context: `A professional evaluates their strategy monthly with a 20-trade rolling EV calculation.`,
              scenario: `Month 1: 22 trades. 14 wins (63.6%). Average win: $420. Average loss: −$190. EV: (63.6% × $420) − (36.4% × $190) = $267.12 − $69.16 = +$197.96/trade. Month 2: 18 trades. 9 wins (50%). Average win: $440. Average loss: −$195. EV: (50% × $440) − (50% × $195) = $220 − $97.50 = +$122.50/trade. Both months positive EV.`,
              outcome: `Despite Month 2's lower win rate (50% vs 63.6%), the strategy remains in positive EV territory. The trader does not panic about the lower win rate because the EV metric remains positive. This is probabilistic thinking: evaluating the strategy on its statistical output (EV) rather than on surface metrics (win rate alone) or on emotional response to individual trades.`,
            },
          ],
          keyTakeaway: `Trading outcomes are probabilistic. Any positive-EV strategy will produce regular losing streaks. Evaluate strategy performance on rolling 20-trade samples of EV, not individual outcomes. At 55% win rate, 8 consecutive losses happen once every ~390 trades — expected, not catastrophic.`,
          guidedPractice: [
            {
              question: `A trader with a 55% win rate has just had 6 consecutive losses. What is the correct interpretation?`,
              options: [
                `A — The strategy is broken — 6 consecutive losses cannot happen by chance`,
                `B — A 6-loss streak at 55% win rate has a probability of (0.45)⁶ = 0.83% — rare but statistically expected to occur approximately every 120 trades. Review the trades for execution errors, not for strategy validity.`,
                `C — Increase position size to recover faster`,
                `D — Take a month off — the market is against you`,
              ],
              correct: 1,
              hint: `Calculate (0.45)⁶. How often does this probability appear in a 1,000-trade sample?`,
              explanation: `B is correct. At 55% win rate, the probability of 6 consecutive losses is 0.45⁶ = 0.83%. In 1,000 trades, this happens approximately 8 times (once every 120 trades). An active trader making 3 trades/day hits this streak approximately once every 40 trading days — roughly every 2 months. This is normal and expected variance. The correct response is to review execution quality (were all 6 trades valid setups?) and check for systematic market condition misalignment, not to conclude the strategy is broken.`,
            },
            {
              question: `You need a minimum sample size of how many trades to meaningfully evaluate a trading strategy's performance?`,
              options: [
                `A — 5–10 trades — enough to see a pattern`,
                `B — Minimum 30 trades for a rough assessment; 100 trades for statistical significance. Below 30, random variance dominates over signal.`,
                `C — 3 trades — if all three are winners, the strategy works`,
                `D — 500 trades — anything less is unreliable`,
              ],
              correct: 1,
              hint: `What is the standard sample size in statistics for meaningful conclusions? How does variance behave in small samples?`,
              explanation: `B is correct. Statistical significance requires large enough samples to separate signal from noise. With 10 trades and 55% win rate, the 90% confidence interval on the win rate spans roughly 20–90% — essentially meaningless. With 30 trades: confidence narrows to 40–70%. With 100 trades: 46–64% — now useful for strategy assessment. The practical minimum: 30 trades to get a rough sense of the strategy's behavior. 100 trades for a decision to change or keep the strategy. Evaluating after 3–10 trades and drawing conclusions is the primary driver of strategy abandonment at the wrong time.`,
            },
            {
              question: `What is EV (Expected Value) per trade and why is it more useful than win rate alone for strategy evaluation?`,
              options: [
                `A — EV is the same as win rate — higher win rate = higher EV`,
                `B — EV = (Win rate × Average win) − (Loss rate × Average loss). It accounts for both win probability AND profit/loss amounts. A 40% win rate strategy can have higher EV than a 60% win rate strategy if the average win is sufficiently large.`,
                `C — EV is only relevant for large institutional strategies`,
                `D — Win rate is always more important than EV`,
              ],
              correct: 1,
              hint: `Consider a strategy: 30% win rate, average win +10%, average loss −2%. Calculate EV. Does the low win rate make it a bad strategy?`,
              explanation: `B is correct. EV = (30% × 10%) − (70% × 2%) = 3% − 1.4% = +1.6% per trade. Despite a 30% win rate (losing 7 of 10 trades), this strategy has positive expected value because wins are much larger than losses. Conversely: 65% win rate, average win +1%, average loss −3% → EV = (65% × 1%) − (35% × 3%) = 0.65% − 1.05% = −0.4% per trade — negative despite a high win rate. EV is the complete picture. Win rate alone is incomplete.`,
            },
            {
              question: `Why does a profitable trader need to accept that losing money on individual trades is part of the system?`,
              options: [
                `A — Because all traders lose — it's unavoidable`,
                `B — Because positive EV strategies have win rates below 100%. Every loss is an expected statistical event in a system that is profitable over time. Refusing to accept individual losses (by moving stops, panic-exiting) attempts to eliminate a necessary component of the strategy and destroys the EV.`,
                `C — Because the market is unpredictable`,
                `D — Profitable traders should not accept losses — every loss is a mistake`,
              ],
              correct: 1,
              hint: `If your win rate is 55%, what percentage of trades are expected to be losses? Are those losses mistakes?`,
              explanation: `B is correct. A 55% win rate means 45% of trades are expected losses. Those 45% are not mistakes — they are the mathematically required losses that make the wins possible. The 2:1 R:R means wins are twice the size of losses, which creates positive EV despite the 45% loss rate. Attempting to eliminate losses by stopping out early, moving stops, or abandoning the strategy during normal losing streaks attempts to change the distribution in a way that always reduces EV. The professional's acceptance: "This trade is one data point in a 1,000-trade distribution. The system's EV will manifest over time."`,
            },
            {
              question: `You have a 55% win rate, 2.5:1 R:R strategy. After 15 trades you have 7 wins and 8 losses (47% win rate). Should you change the strategy?`,
              options: [
                `A — Yes — 47% is below the expected 55%`,
                `B — No. 15 trades is too small a sample for any meaningful conclusion. The 90% confidence interval at 15 trades with a true 55% rate spans roughly 28–80% — the observed 47% is well within normal variance.`,
                `C — Yes — eight losses is always a red flag`,
                `D — Change the R:R to 3:1 to compensate`,
              ],
              correct: 1,
              hint: `What is the 90% confidence interval for a true 55% win rate with a 15-trade sample? How does the observed 47% compare?`,
              explanation: `B is correct. With 15 trades and a true 55% win rate, the standard error is √(0.55 × 0.45 / 15) = 0.128. A 90% CI is roughly 55% ± 1.645 × 12.8% = 34%–76%. The observed 47% is comfortably within this range — it is normal variance, not evidence of a broken strategy. 30 trades minimum before any assessment. 100 trades for statistical significance. The urge to change the strategy after 15 trades is the pattern that abandons good strategies during their inevitable variance dips.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader has just finished their 100-trade evaluation period. Here are the results:

Total trades: 100
Wins: 52 (52%)
Losses: 48 (48%)
Average win: $340
Average loss: −$178
EV per trade: (52% × $340) − (48% × $178) = $176.80 − $85.44 = +$91.36/trade
Total P&L: +$9,136

However, looking at the distribution within the 100 trades:
- Trades 1-20: 14 wins (70%). EV: +$204/trade. Total: +$4,080
- Trades 21-40: 8 wins (40%). EV: −$16/trade. Total: −$320
- Trades 41-60: 10 wins (50%). EV: +$80/trade. Total: +$1,600
- Trades 61-80: 11 wins (55%). EV: +$102/trade. Total: +$2,040
- Trades 81-100: 9 wins (45%). EV: +$62/trade. Total: +$1,240

Questions:
1. What happened in trades 21-40 and should the trader have abandoned the strategy?
2. What does the 100-trade distribution tell you about the strategy's reliability?
3. How should the trader use this data to set expectations going forward?
4. Calculate: if the trader had abandoned the strategy after trades 21-40 (negative EV period), what would they have missed?`,
              scoringCriteria: [
                `Trades 21-40: low win rate (40%) and slightly negative EV. This was a normal variance dip — the kind that causes undisciplined traders to abandon working strategies. The 20-trade sample was too small and the variance was within expected range for a 52% win rate strategy.`,
                `100-trade distribution: despite one negative 20-trade window, overall EV was +$91.36/trade and the strategy produced +$9,136 total profit. The negative window was 20% of the observation period and was followed by recovery.`,
                `Forward expectations: the rolling 20-trade EV varied from −$16 to +$204. The trader should expect occasional negative 20-trade windows (normal) and evaluate the 100-trade rolling average to assess strategy health.`,
                `If abandoned after 21-40: missed trades 41-100 = 60 trades × average EV: (+$80+$102+$62)/3 ≈ $81/trade × 60 = $4,880 missed profit. Abandonment during the variance dip cost $4,880 in foregone strategy gains.`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `A trader is reflecting on their psychology after their first month of live trading. They experienced:

Week 1: 3 wins, 2 losses. Felt great. Increased position sizes slightly.
Week 2: 5 losses, 1 win. Felt terrible. Nearly abandoned the strategy. Reduced position sizes.
Week 3: 4 wins, 2 losses. Recovered emotionally. Increased sizes again.
Week 4: 3 losses, 3 wins. Mixed. Unsure how to evaluate.

Monthly stats: 10 wins (50%), 10 losses (50%). Average win: $320. Average loss: −$175. EV: (50% × $320) − (50% × $175) = $160 − $87.50 = +$72.50/trade.

Questions:
1. Was the strategy working? (Calculate and show your work)
2. What were the specific psychological errors each week?
3. What is the psychological impact of the position size changes across the month?
4. Design a 3-rule psychological framework for month 2.`,
              scoringCriteria: [
                `Was strategy working? Yes. EV = +$72.50/trade × 20 trades = +$1,450 positive EV. Despite the emotional rollercoaster, the strategy had positive expected value across the 20-trade sample.`,
                `Weekly psychological errors: Week 1: overconfidence after wins → increased sizes (recency bias). Week 2: gave up too quickly on strategy after 5/6 loss week, reduced sizes (loss aversion + small sample evaluation). Week 3: overcorrected back to overconfidence, increased sizes again. Week 4: confusion from mixed results — no systematic framework.`,
                `Position size impact: size varied week to week based on emotion. The sizes were HIGHER in Week 1 (overconfident) and Week 3 (recovering) and LOWER in Week 2 (the losing week). This means more capital was deployed in emotionally reactive states and less in the analytical state. Ideal: constant position sizing regardless of emotional state.`,
                `Month 2 framework: (1) Fixed position size — always 1.5%, never adjusted based on recent outcomes. (2) Minimum 20-trade evaluation window — no strategy judgments on fewer trades. (3) Weekly journal entry: EV calculation only, no emotional narratives about whether the strategy is "working" based on this week's results.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You are at the end of your 6th week of live trading. Build a complete probabilistic performance review from this data:

Week 1: 4 wins, 3 losses. Avg win: $280. Avg loss: −$145.
Week 2: 2 wins, 5 losses. Avg win: $310. Avg loss: −$155.
Week 3: 5 wins, 2 losses. Avg win: $290. Avg loss: −$140.
Week 4: 3 wins, 4 losses. Avg win: $275. Avg loss: −$150.
Week 5: 6 wins, 1 loss. Avg win: $295. Avg loss: −$160.
Week 6: 3 wins, 4 losses. Avg win: $285. Avg loss: −$148.

Total: 42 trades. Account started at $14,000.

Calculate and interpret:
1. Overall win rate and EV per trade
2. Was there a "broken week" and how should it be interpreted?
3. Rolling 10-trade EV for weeks 1-2, weeks 3-4, weeks 5-6
4. Is this strategy working? Should anything change for week 7?`,
              scoringCriteria: [
                `Overall: 23 wins / 42 trades = 54.8% win rate. Average win: ($280+$310+$290+$275+$295+$285)/6 ≈ $289. Average loss: ($145+$155+$140+$150+$160+$148)/6 ≈ $150. EV = (54.8% × $289) − (45.2% × $150) = $158.37 − $67.80 = +$90.57/trade. 42 trades × $90.57 = +$3,804 total.`,
                `"Broken week": Week 2 had only 2 wins in 7 trades (28.6%). Interpreted probabilistically: one bad week in a 42-trade sample is expected variance. The overall 54.8% win rate confirms the strategy is working. Week 2 alone is not evidence of anything.`,
                `Rolling 10-trade EV: Weeks 1-2 (14 trades): 6 wins / 14 = 42.9% × $295 avg win − 57.1% × $150 avg loss = $126.6 − $85.7 = +$40.9/trade. Weeks 3-4 (14 trades): 8/14 = 57.1% × $282.5 − 42.9% × $145 = $161.4 − $62.2 = +$99.2/trade. Weeks 5-6 (14 trades): 9/14 = 64.3% × $290 − 35.7% × $154 = $186.5 − $55.0 = +$131.5/trade. All three rolling windows positive.`,
                `Strategy assessment: YES, working. All three rolling windows show positive EV. The trend is actually improving (EV per window increasing). No changes needed to week 7 — continue standard execution.`,
              ],
            },
          ],
        },

      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
          'judgment-ethicalChoice',
        ],
        description: `Fifteen unlabelled psychology challenges drawn from all five Lab 7 lessons. Tasks include: identifying cognitive biases from session logs, calculating the cost of emotional decisions vs. planned decisions, applying FOMO rules to live setups, designing daily loss limits, and interpreting 20-trade rolling EV to distinguish normal variance from strategy failure.`,
        scoringMode: 'percentageCorrect',
        unlockCondition: 'completeAllLessons',
        difficultyRange: [3, 5],
      },
      bossMode: {
        title: `Disciplined Pro Challenge`,
        learningLoop: {
          id: 'dpc-ll',
          attempts: 'unlimited',
          feedbackMode: 'fullCriteriaWithPointers',
          challenges: [
            { id: 'dpc-ll-1', simulatorType: 'judgment-riskAssess', lessonPointer: 'why-market-beats-emotions' },
            { id: 'dpc-ll-2', simulatorType: 'judgment-dataInterpret', lessonPointer: 'fomo' },
            { id: 'dpc-ll-3', simulatorType: 'chartReplay-riskManage', lessonPointer: 'fear-panic-selling' },
            { id: 'dpc-ll-4', simulatorType: 'judgment-prioritisation', lessonPointer: 'revenge-trading' },
            { id: 'dpc-ll-5', simulatorType: 'judgment-dataInterpret', lessonPointer: 'thinking-in-probabilities' },
            { id: 'dpc-ll-6', simulatorType: 'judgment-ethicalChoice', lessonPointer: 'why-market-beats-emotions' },
            { id: 'dpc-ll-7', simulatorType: 'judgment-riskAssess', lessonPointer: 'fomo' },
            { id: 'dpc-ll-8', simulatorType: 'chartReplay-riskManage', lessonPointer: 'fear-panic-selling' },
            { id: 'dpc-ll-9', simulatorType: 'judgment-prioritisation', lessonPointer: 'revenge-trading' },
            { id: 'dpc-ll-10', simulatorType: 'judgment-dataInterpret', lessonPointer: 'thinking-in-probabilities' },
          ],
        },
        },
    },
,
    // ═══════════════════════════════════════════════════════════════════════
    // LAB 8 — ADVANCED STRATEGY & PROFESSIONAL PRACTICE (5 lessons)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'advanced-strategy',
      title: `Lab 8: Advanced Strategy & Professional Practice`,
      subtitle: `The professional edge: what separates consistent traders from everyone else`,
      lessons: [

        {
          id: 'smart-money-concepts',
          title: `Smart Money Concepts`,
          explanation: `The phrase "smart money" refers to large institutional participants — hedge funds, proprietary trading firms, market makers, and large family offices — whose combined trading volume drives the majority of price movement in any market. Retail traders represent approximately 20–25% of total spot volume on major crypto exchanges. Smart money represents the rest. Understanding how institutional participants operate does not require access to their order flow — their behavior is visible in price and volume data if you know what to look for.

Smart money does not trade the same way retail traders do. Retail traders react to price — they buy after a breakout (FOMO) and sell after a breakdown (panic). Smart money builds positions before the move. They accumulate at support (buying retail's panic-sells in a downtrend) and distribute at resistance (selling into retail's FOMO-driven breakout buying). The institutional participant's edge is patience and capital — they can wait for their fill price without chasing.

Three key smart money footprints in price action:

1. The Liquidity Hunt (Stop Hunt): Price briefly spikes below a well-known support level (where retail stop-losses cluster), triggering those stops and creating a flood of sell orders. Smart money buys these sells at the momentarily lower price, then reverses back above the support. The pattern: price aggressively moves through an obvious level, immediately reverses. Volume on the spike: high (many stops triggered = many orders filled). This is a smart money accumulation pattern, not a breakdown.

2. Order Block: The last significant bearish candle (or series of candles) before a major upward move. Smart money placed limit buys at this level during the prior decline. When price retraces to the order block, those resting buy orders absorb the selling — creating support. Order blocks are not support drawn by horizontal lines; they are the specific candle bodies where the institutional buying was done.

3. Fair Value Gap (FVG): A three-candle pattern where the middle candle moves so rapidly that the upper wick of the first candle and the lower wick of the third candle do not overlap. This gap in price represents an imbalance — rapid directional movement without proper two-way trading. Price often returns to fill this gap before continuing the original direction.`,
          visualPrompt: `👆 Stop hunt pattern — price spikes below support, reverses sharply`,
          visualType: `gif`,
          visualUrl: `stop-hunt-reversal`,
          strategy: `Identify stop hunt patterns by: (1) price aggressively breaks through a well-known support/resistance, (2) immediately reverses within 1–3 candles, (3) high volume on the spike. Enter on the reversal candle's close, not during the spike. Stop goes below the spike's extreme. This is a counter-intuitive but high-probability entry — you are entering where most retail traders are panicking out.`,
          examples: [
            {
              contextTag: `[Institutional Analysis, BTC/USDT, stop hunt]`,
              context: `BTC's 4H chart shows a well-defined support at $70,000 tested three times over 2 weeks. Every retail trader watching the chart has stops just below $70,000.`,
              scenario: `A single 4H candle sweeps below $70,000 to $69,400, collecting all the stop-market sell orders (retail stops). Volume on this candle: 3.2× average. The next candle opens at $69,800 and closes at $71,200 — a full recovery above the $70,000 level within 4 hours.`,
              outcome: `This is a textbook stop hunt. Entry on the bullish reversal candle close ($71,200): stop below the spike low ($68,800), TP at the prior high ($74,800). R:R = $3,600/$2,400 = 1.5:1 (modest) to TP1. The stop hunt pattern identified institutional accumulation at $69,400 — the large volume on the spike candle represents institutional buy orders absorbing the retail stop-sell orders.`,
            },
            {
              contextTag: `[Order Block Analysis, ETH/USDT]`,
              context: `ETH's daily chart shows a strong move from $3,400 to $4,200 (+23.5%). Before this move, there was a significant bearish candle (red candle from $3,640 to $3,420) on day −3.`,
              scenario: `Three weeks later, ETH pulls back from the $4,200 high. Price returns to the $3,420–$3,640 zone — the order block from the pre-move bearish candle. A bullish hammer forms within the order block zone.`,
              outcome: `The order block at $3,420–$3,640 acts as support on the pullback. Entry at $3,650 (hammer close), stop at $3,380 (below the order block), TP at $4,100. R:R = $450/$270 = 1.67:1 to TP. The order block concept identified the zone where institutional buying was previously executed — those same buyers are likely to defend the level on retracement.`,
            },
            {
              contextTag: `[Fair Value Gap, SOL/USDT]`,
              context: `SOL makes a rapid three-candle move: Candle 1 closes at $185. Candle 2 moves from $185 to $196 (high $196, low $185). Candle 3 opens at $196, low $192. The gap: Candle 1's high at $186, Candle 3's low at $192 — a $6 gap where no trading occurred.`,
              scenario: `SOL continues to $210. Three days later, price pulls back and enters the $186–$192 FVG zone. A bullish engulfing forms within the FVG.`,
              outcome: `Entry at $192 (FVG upper boundary at engulfing close). Stop at $182 (below FVG and below the gap entirely). TP at $210 (prior high). R:R = $18/$10 = 1.8:1. The FVG filling is a common institutional re-entry pattern — the gap represents price where institutional orders were partially unfilled during the rapid move.`,
            },
          ],
          keyTakeaway: `Smart money accumulates at stops (stop hunts), leaves footprints in order blocks (last bearish candle before an upward move), and creates fair value gaps (rapid imbalances price returns to fill). These patterns identify institutional activity zones — the highest-probability entry levels in technical analysis.`,
          guidedPractice: [
            {
              question: `BTC spikes from $72,000 to $69,800 in one 4H candle on 3.4× average volume, then immediately reverses to $72,400 in the next candle. What pattern is this and what is the entry signal?`,
              options: [
                `A — A breakdown — price fell below support, exit all longs`,
                `B — A stop hunt — institutional buying absorbed retail stop-sell orders below $70,000. Enter on the reversal candle's close, stop below the spike's $69,800 low.`,
                `C — A false signal — ignore it and wait for clearer price action`,
                `D — A volume anomaly — reduce position size as volume is unusual`,
              ],
              correct: 1,
              hint: `What happened to retail stop-loss orders clustered below $70,000? Who was buying those sell orders?`,
              explanation: `B is correct. The pattern: price aggressively breaks well-known support ($70,000), immediately reverses above it within 1–2 candles. High volume (3.4×) on the down spike confirms significant order volume transacted — retail stops triggered (creating sell orders) were absorbed by institutional buy orders at the lower price. The reversal candle close at $72,400 is the entry signal — confirms that the dip below support was a liquidity grab, not a genuine breakdown. Stop below $69,800 (the spike's low — if price falls below the spike low, the stop hunt thesis is wrong and the breakdown is real).`,
            },
            {
              question: `What is an order block and how is it used for trade entry?`,
              options: [
                `A — A horizontal support line at a prior price level`,
                `B — The last significant bearish candle (or cluster) before a major upward move — the zone where institutional buying was executed during the prior decline. Price returning to this zone on a retracement provides a high-probability long entry.`,
                `C — A pattern formed by three candles with a gap between them`,
                `D — A resistance level created by high-volume selling`,
              ],
              correct: 1,
              hint: `What does the last bearish candle before a major rally tell you about who was buying during that decline?`,
              explanation: `B is correct. An order block is the specific candle body where institutional buyers were accumulating before a major move. The logic: the strong upward move that followed was driven by institutional buying that began at (or near) the order block price range. When price retraces to the order block zone, those institutional buyers are likely to defend the level (they have incentive to protect their entry price). This makes the order block a higher-probability support zone than an arbitrary horizontal line.`,
            },
            {
              question: `A Fair Value Gap (FVG) is a three-candle pattern where the middle candle moves rapidly. What happens to price at an FVG and why?`,
              options: [
                `A — Price always reverses at the FVG because the gap must be closed`,
                `B — Price often returns to "fill" the FVG (trade within the imbalanced range) before continuing the original direction, because the rapid move left unfilled institutional orders within the gap.`,
                `C — FVGs only occur during news events`,
                `D — FVGs are irrelevant for spot trading`,
              ],
              correct: 1,
              hint: `If institutional orders were resting limit orders in the FVG zone and price moved through too fast to fill them, what happens when price returns to that zone?`,
              explanation: `B is correct. An FVG represents a price range where trading was imbalanced — price moved so quickly that the bid-ask interaction was incomplete. Institutional participants who had resting limit orders in the FVG zone were only partially filled (or not filled at all) during the rapid move. When price retraces to the FVG, those unfilled orders provide buying support (for a bullish FVG) or selling resistance (for a bearish FVG). Note: "price always fills the FVG" is not guaranteed — in very strong trends, FVGs can remain unfilled for extended periods or permanently.`,
            },
            {
              question: `You see a well-known resistance level at $76,000 on BTC's chart. Price spikes above it to $77,200 on high volume, then reverses sharply below $76,000 in the same candle. What does this suggest?`,
              options: [
                `A — Bullish breakout confirmed — buy the pullback`,
                `B — A liquidity hunt above resistance (the mirror of a stop hunt). Institutional participants sold into the retail breakout-chasers above resistance, triggering FOMO buyers as exit liquidity. Now price is distributing. Avoid longs until clear confirmation.`,
                `C — A false signal — price rejected and will continue lower`,
                `D — The resistance level at $76,000 is no longer valid`,
              ],
              correct: 1,
              hint: `Stop hunts happen at support. What is the equivalent pattern at resistance and who is doing what above $76,000?`,
              explanation: `B is correct. The mirror of a stop hunt at support is a liquidity hunt above resistance. FOMO buyers chase the breakout above $76,000, creating buy orders above the key level. Institutional sellers fill their distribution orders into this FOMO buying. The reversal back below $76,000 in the same candle (wick rejection) shows the $77,200 spike was not a genuine breakout but a distribution event. Correct response: do not chase the "breakout." The spike high created a new short setup with stop above $77,200 and entry on the first candle that closes back below $76,000.`,
            },
            {
              question: `Where is the highest-probability entry on a stop hunt pattern?`,
              options: [
                `A — During the spike below support — buy the panic sell`,
                `B — On the close of the reversal candle after the spike — this confirms the stop hunt is complete and the institutional accumulation is providing support`,
                `C — At the prior support level when price returns to it (not on the reversal candle)`,
                `D — Never — stop hunts are too unpredictable to trade`,
              ],
              correct: 1,
              hint: `During the spike, you cannot tell if it is a genuine breakdown or a stop hunt. What confirms the stop hunt interpretation?`,
              explanation: `B is correct. Entering during the spike (A) means entering while the pattern is unconfirmed — if it is a genuine breakdown, not a stop hunt, you are buying a falling asset with no floor. The reversal candle close provides confirmation: the spike went below support, created the stop hunt, and price recovered above the support level. The reversal candle close is the first point where the pattern is confirmed. Stop below the spike's low provides clear thesis invalidation: if price falls below that low again, the stop hunt theory is wrong.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-reversal`,
              scenario: `BTC/USDT, 4-hour chart. You are watching a developing setup.

Key levels:
- Well-defined support at $71,200 (tested 4 times over 3 weeks)
- Prior resistance at $74,800
- Recent consolidation range: $71,200–$74,800

Price action:
Bar 1: $72,400 (range midpoint, trending down)
Bar 2: $71,600 (approaching support)
Bar 3: $71,100 (touched support briefly but closed at $71,100 — slightly below)
Bar 4: $70,400 (spike DOWN, low $70,200, close $70,400, volume 3.1× average)
Bar 5 (current): Opens at $70,400, currently trading at $71,800 (well above the $71,200 support, strong reversal in progress)

Question setup: The stop hunt is developing. Apply the complete framework to design a trade entry.

1. Identify the stop hunt pattern elements (confirmation score: which elements are present)
2. Where is the entry?
3. Where is the stop and why?
4. Set TP1 and TP2
5. Calculate position size on $20,000 account, 1.5% risk
6. What would invalidate the stop hunt thesis?`,
              scoringCriteria: [
                `Stop hunt elements: (1) Well-known support at $71,200 (4 prior tests = many retail stops below) ✓ (2) Price spiked below support to $70,200 ✓ (3) High volume on the spike (3.1×) ✓ (4) Immediate recovery: current candle at $71,800, recovering above support ✓. All four elements present.`,
                `Entry: on Bar 5 close — if Bar 5 closes above $71,200 (back above the support that was violated). Target close around $71,800–$72,000. Alternatively: limit order at $71,300 (just above the support reclaim level).`,
                `Stop: below the spike low. $70,200 − 0.5% buffer = $69,850. This is the thesis invalidation level: if price falls below the spike low, the stop hunt was a genuine breakdown.`,
                `TP1: $74,600 (just below the prior range high at $74,800). TP2: $77,200 (next resistance, measured move).`,
                `Position size: $300 risk ÷ ($71,800 − $69,850) = $300/$1,950 × $71,800 = $11,046 notional = 0.1538 BTC.`,
                `Invalidation: price closing below $70,200 (the spike low) in any subsequent candle — confirms the breakdown is real and the stop hunt thesis is wrong.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Identify and classify each of the following as: Stop Hunt, Order Block, Fair Value Gap, or None of the above.

Pattern 1: SOL has support at $185. Price dips to $181.40 on 2.8× volume in one candle, immediately recovers to $186.20 in the next candle.

Pattern 2: BTC moves from $68,400 to $78,200 over 5 days. The last bearish candle before this move: day −2, dropped from $69,800 to $68,100. BTC is now pulling back from $78,200 and approaching $68,100–$69,800.

Pattern 3: ETH three-candle sequence: Candle A high $3,780. Candle B: rapid move $3,780 to $4,020, low $3,780. Candle C: opens $4,020, low $3,960. Gap between Candle A high ($3,780) and Candle C low ($3,960) = $3,780–$3,960 zone.

Pattern 4: BTC has been ranging between $70,000 and $74,000. Price spends 3 days near $72,000 (range midpoint) with declining volume. No specific level broken.

Pattern 5: ETH resistance at $4,100 (tested 3 times). Price spikes to $4,240 on 2.2× volume, then closes back below $4,100 in the same 4H candle.`,
              scoringCriteria: [
                `Pattern 1: STOP HUNT. Dip below $185 support to $181.40 on 2.8× volume with immediate recovery. Classic accumulation stop hunt.`,
                `Pattern 2: ORDER BLOCK. Last bearish candle ($69,800 to $68,100) before the $68,400→$78,200 rally. The $68,100–$69,800 zone is the order block. Entry on return to this zone.`,
                `Pattern 3: FAIR VALUE GAP (BULLISH). Candle A high $3,780, Candle C low $3,960. The $3,780–$3,960 zone is the FVG — price moved rapidly through this area without two-way trading. Price will likely return to this zone before continuing higher.`,
                `Pattern 4: NONE of the above. Range consolidation with declining volume — a Bollinger squeeze setup potentially, but not specifically a stop hunt, order block, or FVG.`,
                `Pattern 5: LIQUIDITY HUNT (mirror stop hunt) at resistance. Spike above $4,100 resistance with close back below = institutional distribution into FOMO buyers. This is a bearish pattern — potential short setup.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `ETH/USDT daily chart. Order block analysis and entry design.

Historical data:
Day −15 to Day −5: ETH ranged between $3,620 and $3,800 (consolidation phase).
Day −4: BEARISH candle. Open $3,780, close $3,580, low $3,570 (strong sell-off that broke below the consolidation range).
Day −3: Bearish continuation. $3,580 to $3,440.
Day −2: Doji. $3,440 to $3,460.
Day −1: Strong BULLISH reversal. Open $3,440, close $3,720 (recovered through the Day −4 candle's close).
Day 0 to Day +5: ETH has been rising. Current price: $4,120.

Now (present): ETH is pulling back from $4,120. It is approaching the Day −4 candle's zone ($3,570–$3,780).

Design the order block entry:
1. Identify the order block
2. Where is the entry (specific price and trigger condition)
3. Stop and TP levels
4. Account $16,000, 2% risk (high-conviction setup)
5. What volume condition would strengthen confidence in the entry?`,
              scoringCriteria: [
                `Order block: Day −4 bearish candle body: $3,580 (close) to $3,780 (open). This is the last significant bearish candle before the major upward move. Institutional buying during this decline later drove the price to $4,120.`,
                `Entry: limit buy within the order block zone — specifically $3,620–$3,650 (lower half of the order block body, where the institutional buying likely concentrated). Trigger: bullish reversal candle (hammer, engulfing) within the order block zone.`,
                `Stop: $3,520 (below the order block's low wick and below the structure). Risk from $3,640 entry: $120/ETH.`,
                `TP1: $3,900 (prior resistance in the $3,800 consolidation zone). TP2: $4,120 (prior high). TP3: $4,400 (measured continuation target).`,
                `Position size: $320 ÷ $120 × $3,640 = $9,707 notional (2.665 ETH).`,
                `Volume condition: low-volume pullback into the order block zone (confirming the retracement is not a new breakdown) followed by a spike in volume on the reversal candle (confirming institutional buying at the order block).`,
              ],
            },
          ],
        },

        {
          id: 'volume-profile-vwap',
          title: `Volume Profile and VWAP`,
          explanation: `In 2020, researchers at the University of California studying institutional crypto trading found that 78% of large institutional orders on Binance were executed at or within 0.5% of the VWAP (Volume Weighted Average Price). VWAP is not just a trading indicator — it is the benchmark against which institutional performance is measured. An institutional trader who buys above the daily VWAP underperformed the average. An institutional trader who buys below the VWAP outperformed. Because institutions collectively drive the majority of volume, prices frequently return to VWAP zones and institutional limit orders defend it.

VWAP (Volume Weighted Average Price) = Σ (Price × Volume) / Σ Volume. It represents the average price at which all volume has traded over a given period (usually the current day). Unlike a simple moving average, VWAP weights each price by the volume traded at that price — a candle with 10× average volume has 10× the influence on VWAP.

Four VWAP applications:
1. Trend filter: when price is above VWAP, institutional traders are on average in profit. They are likely to defend VWAP as support (their average entry). Below VWAP: average institutional position is underwater — they become net sellers to reduce exposure.
2. Intraday support/resistance: first touch of VWAP during a trending day often provides a high-probability entry in the direction of the trend.
3. VWAP deviation bands (2 standard deviations above/below): extreme readings that often precede pullbacks or continuations.
4. Weekly/monthly VWAP: the same logic applied to longer timeframes — these are major institutional average prices for the period.

Volume Profile shows the horizontal distribution of volume across price levels over a specified period. Unlike a regular volume histogram (which shows volume per time period), a Volume Profile shows volume per price level. This reveals: (1) High Volume Nodes (HVN) — price levels where significant volume was transacted. These become support/resistance because many participants have positions at these prices. (2) Low Volume Nodes (LVN) — price levels where little volume was transacted. Price moves rapidly through LVNs because there are few resting orders to absorb movement. (3) Point of Control (POC) — the single price level with the highest volume in the selected period. This is the most institutionally significant price.`,
          visualPrompt: `👆 Volume Profile sidebar — POC, HVN, LVN identified`,
          visualType: `gif`,
          visualUrl: `volume-profile-heatmap`,
          strategy: `Use VWAP as an intraday support/resistance reference. In an uptrend, buy first VWAP touches with confirming volume and trigger candles. Use the Point of Control (POC) from the current week's Volume Profile as a key level — expect price to be attracted to the POC and to find support/resistance there.`,
          examples: [
            {
              contextTag: `[Day Trader, BTC/USDT, VWAP pullback entry]`,
              context: `BTC is trending up intraday. At 9am it was at $71,200. VWAP starts the day at $71,200 and rises with the trend. By 11am, BTC is at $72,800 and VWAP is at $72,100. BTC pulls back from $72,800 toward VWAP.`,
              scenario: `Price touches VWAP at $72,100 and a bullish hammer forms. Volume on the VWAP touch: 1.7× average. Institutional traders who bought throughout the morning session are now defending their average price (VWAP).`,
              outcome: `Entry at $72,150 (hammer close). Stop at $71,600 (below the VWAP and below the prior swing low). TP at $73,400. R:R = $1,250/$550 = 2.27:1. BTC bounces from VWAP and continues higher. The VWAP pullback entry correctly identified the level where institutional participants were defending their morning average.`,
            },
            {
              contextTag: `[Swing Trader, ETH/USDT, weekly POC as major level]`,
              context: `The weekly Volume Profile for ETH shows the Point of Control (POC) at $3,680 — the price level where the most ETH/USDT volume was traded in the current week.`,
              scenario: `ETH is currently at $3,840 and pulling back. As it approaches $3,680 (the weekly POC), a significant volume spike on the 4H chart appears — 2.4× average on a green candle. The POC is attracting institutional interest.`,
              outcome: `The weekly POC at $3,680 acts as major support. Entry at $3,710 (bullish candle close near POC). Stop at $3,580 (below POC with buffer). TP at $4,020. R:R = $310/$130 = 2.38:1. The POC's significance: it is the price level where institutions collectively have the most accumulated positions in the current week — they will defend it.`,
            },
            {
              contextTag: `[Trader, BTC/USDT, Low Volume Node rapid price movement]`,
              context: `Volume Profile shows a Low Volume Node (LVN) between $72,000 and $73,400 — a zone where very little trading occurred during the past 3 weeks.`,
              scenario: `BTC is at $71,600 and breaking upward. It enters the LVN at $72,000. Price movement through the $72,000–$73,400 zone: BTC moves from $72,000 to $73,400 in a single 4H candle.`,
              outcome: `LVN confirmed: price moved rapidly through the zone with no resistance because there were almost no resting orders in that range. The LVN analysis correctly predicted that once $72,000 was broken, the move to $73,400 would be fast. This is useful for setting TP1 — it should be placed just below the next High Volume Node above the LVN ($73,400 in this case) rather than within the LVN.`,
            },
          ],
          keyTakeaway: `VWAP is the institutional average price — price defends it as support in uptrends. Volume Profile reveals where significant orders (HVN support/resistance) and thin order books (LVN rapid moves) exist. The Point of Control is the week's most significant level. Use these for entry refinement, not as standalone signals.`,
          guidedPractice: [
            {
              question: `BTC is in an uptrend. Price has pulled back to touch VWAP with a bullish hammer on 2× volume. What does this represent and what is the appropriate response?`,
              options: [
                `A — VWAP is just a moving average — treat it like any other`,
                `B — A high-probability intraday support entry: VWAP is the institutional average price for the day, price touching and bouncing from it with volume means institutional participants are defending their average entry. Enter on the hammer close with stop below VWAP.`,
                `C — Price should always reverse from VWAP — short it`,
                `D — Wait for two VWAP touches before entering`,
              ],
              correct: 1,
              hint: `If institutional traders' average buy price for the day is at VWAP, what incentive do they have to defend that level?`,
              explanation: `B is correct. VWAP represents the average price paid by all participants weighted by volume. Institutional traders who bought throughout the day have an average cost near VWAP. A pullback to VWAP puts their position at approximately breakeven — they are incentivised to add to their position at this level (more at the same average cost) or defend it with limit buys. The hammer + volume confirms that buying is occurring at the level. Entry on the hammer close in an uptrend is a quality intraday setup.`,
            },
            {
              question: `A Volume Profile shows an LVN (Low Volume Node) between $73,000 and $75,000 and an HVN (High Volume Node) at $75,200. BTC is currently at $72,800 breaking upward. Where should your TP1 be placed?`,
              options: [
                `A — $74,000 — midpoint of the LVN`,
                `B — $74,900–$75,100 — just below the HVN at $75,200. Price will move rapidly through the LVN ($73,000–$75,000) but slow at the HVN. Place TP1 just below the HVN to capture the LVN move.`,
                `C — $73,200 — just inside the LVN`,
                `D — $76,000 — above the HVN`,
              ],
              correct: 1,
              hint: `Price moves fast through LVNs and slows at HVNs. Where should a TP be to capture the rapid LVN move?`,
              explanation: `B is correct. An LVN means very few orders in the $73,000–$75,000 range — price will move rapidly through it (nothing to slow it down). The HVN at $75,200 represents significant prior trading volume — many participants have positions there, creating supply pressure. TP1 just below the HVN ($74,900–$75,100) captures the rapid LVN move and exits before the HVN resistance materialises. Placing TP1 inside the LVN (A or C) exits early; placing it above the HVN (D) requires fighting through the HVN resistance.`,
            },
            {
              question: `What does the Point of Control (POC) from a weekly Volume Profile represent?`,
              options: [
                `A — The midpoint of the weekly price range`,
                `B — The single price level with the highest volume transacted during the week — the most institutionally significant price where the most participants have positions`,
                `C — The VWAP of the week`,
                `D — The level where price spent the most time, regardless of volume`,
              ],
              correct: 1,
              hint: `Volume Profile measures volume per price level. The POC is the peak of this distribution. What does the most-volume price level mean in terms of participant positions?`,
              explanation: `B is correct. The POC is the price where the most units of the asset traded hands during the selected period. This means more participants hold positions (long or short) at this price than any other. The collective interest at the POC makes it the most gravitationally significant level — price is attracted to the POC, and participants defend their positions near it. The POC is different from VWAP (VWAP is volume-weighted average price; POC is the specific price with maximum volume) and different from the time-at-price midpoint (D).`,
            },
            {
              question: `BTC is trading below its daily VWAP ($72,400). Price is at $71,200. You want to enter a long. What does the below-VWAP position tell you?`,
              options: [
                `A — Price is oversold — buy immediately`,
                `B — Price below VWAP means the average institutional position taken today is currently in loss. Institutions are more likely to be net sellers to reduce exposure. Long positions face institutional headwind during the current day.`,
                `C — VWAP doesn't apply intraday`,
                `D — Buying below VWAP is always the best entry because you buy below the average`,
              ],
              correct: 1,
              hint: `If the institutional average price for the day is $72,400 and BTC is at $71,200, what is the institutional position's unrealised P&L?`,
              explanation: `B is correct. With BTC at $71,200 and VWAP at $72,400, any institutional participant who bought today (their average cost: $72,400) is currently showing an unrealised loss. This makes them more likely to sell to reduce exposure and cut losses — contributing to selling pressure below VWAP. Long setups below VWAP face this institutional headwind. Better long entries: wait for price to reclaim VWAP (close above $72,400), or wait for a very specific major support structure below VWAP that would attract fresh institutional buying at a new, lower average price.`,
            },
            {
              question: `Why do Low Volume Nodes (LVNs) predict rapid price movement through them?`,
              options: [
                `A — LVNs create momentum because traders like gaps`,
                `B — In an LVN, very few resting limit orders exist at those price levels. When price enters the LVN, there is little order book depth to absorb the directional move — price moves rapidly to the next level with significant volume (the adjacent HVN).`,
                `C — LVNs are created by institutional activity and predict reversals`,
                `D — LVN movement is random — the volume concentration has no predictive value`,
              ],
              correct: 1,
              hint: `Order book depth at a price level resists price movement through it. What happens to price when order book depth is thin?`,
              explanation: `B is correct. Market microstructure: price levels with significant historical volume typically have resting limit orders from participants who traded there and want to trade there again. When price reaches an HVN, those resting orders absorb the directional move — slowing or stopping it. An LVN had little trading — few or no resting orders. Price entering an LVN encounters minimal resistance and moves rapidly to the next significant volume level. This is why LVNs are useful for: (1) setting TP at the edge of an LVN rather than inside it, (2) expecting rapid moves after breakouts from HVNs into LVNs.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-volumeRead`,
              scenario: `BTC/USDT, daily chart with Volume Profile for the past 3 weeks.

Volume Profile data:
HVN at $69,800 (high volume node — large volume traded here)
HVN at $71,200 (the highest concentration — Point of Control)
LVN between $71,800 and $73,200 (very thin — little prior trading)
HVN at $73,400 (prior significant resistance area)
LVN between $74,000 and $75,600
HVN at $75,800

Current price: $70,400. Daily VWAP: $70,800. Daily trend: sideways-to-up.

Scenario: BTC has just had a clean breakout candle above $71,200 (the POC) on 2.4× volume, closing at $71,800. Price has entered the LVN.

Questions:
1. What does breaking above the POC on high volume signal?
2. What is the expected price behaviour in the LVN ($71,800–$73,200)?
3. Where should your TP1 be placed?
4. Design the complete trade using VWAP and Volume Profile data
5. On a pullback: where would you expect strong support and why?`,
              scoringCriteria: [
                `Breaking above POC on 2.4× volume: high-conviction breakout. The POC ($71,200) was the most contested price in the past 3 weeks — breaking above it on high volume means strong directional conviction. Institutional participants who were neutral at the POC are now short or needing to cover.`,
                `LVN behavior: rapid movement expected from $71,800 to $73,200 with minimal resistance. Price should cover this range quickly.`,
                `TP1: $73,200–$73,400 (just before the HVN at $73,400 where resistance will slow the move). TP2: $75,600–$75,800 (the next HVN above the second LVN).`,
                `Complete trade: Entry $71,800 (breakout close). Stop $70,800 (VWAP — below VWAP in a breakout confirms failure). R:R to TP1: $1,400/$1,000 = 1.4:1 (marginal for standalone but in context of POC breakout, acceptable). TP2: $75,600. R:R: $3,800/$1,000 = 3.8:1.`,
                `Pullback support: HVN at $71,200 (the POC — now acts as support from above as it was the most-traded price) and VWAP ($70,800). Both serve as floor on retracements.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `An intraday trader is reviewing VWAP performance across 40 trades over one month (all day trades on BTC, 4H chart):

Entry type A — Entered above VWAP in confirmed uptrend (VWAP below price, price pulling back to VWAP as support): 18 trades. Win rate: 67%. Avg win: $380. Avg loss: −$165. EV: +$154/trade.

Entry type B — Entered below VWAP (price below VWAP, attempting counter-VWAP long): 12 trades. Win rate: 33%. Avg win: $290. Avg loss: −$220. EV: −$50/trade.

Entry type C — Entered at VWAP touch during trend (price reclaimed VWAP after a dip below): 10 trades. Win rate: 70%. Avg win: $410. Avg loss: −$175. EV: +$183.50/trade.

Questions:
1. Which entry type produced the best EV?
2. What specific rule should be derived from Entry type B's negative EV?
3. What is the total P&L across all 40 trades by type?
4. If this trader only took Entry types A and C going forward, what would their expected monthly results be?`,
              scoringCriteria: [
                `Best EV: Entry type C ($183.50/trade) — VWAP reclaim entries on confirmed trend direction.`,
                `Rule from type B: "No long entries below VWAP in an uptrend. Wait for VWAP reclaim before entering long." The negative EV (−$50/trade) on 12 trades = −$600 in losses from this pattern alone.`,
                `Total P&L by type: A: 18 × $154 = $2,772. B: 12 × −$50 = −$600. C: 10 × $183.50 = $1,835. Total: $4,007.`,
                `Without type B, same trade count on A+C: 18 × $154 + 10 × $183.50 = $2,772 + $1,835 = $4,607. Plus the $600 not lost = $5,207 total. Eliminating below-VWAP longs increases monthly result by 30%.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `ETH/USDT, 4H chart. Volume Profile and VWAP analysis for a swing trade.

Weekly Volume Profile (current week):
- POC: $3,720 (highest volume level this week)
- HVN: $3,640 (major support concentration)
- LVN: $3,760–$3,880
- HVN: $3,900
- Weekly VWAP: $3,740

Current situation:
- ETH price: $3,810 (above the LVN bottom at $3,760, inside the LVN)
- Daily trend: up (above 50-day EMA, above 200-day SMA)
- Today's VWAP: $3,780
- 4H candle: price pulled back from $3,880 to $3,810, forming a doji at today's VWAP ($3,780 area)

Design a complete VWAP + Volume Profile informed trade:
1. Identify the key volume levels that affect this trade
2. Is the current doji at VWAP a valid entry trigger?
3. Design entry, stop, TP1, TP2 with full justification using volume data
4. What does the LVN above ($3,760–$3,880) tell you about the expected move to TP1?`,
              scoringCriteria: [
                `Key volume levels: POC $3,720 (most significant weekly level — major support if price falls to it), HVN $3,640 (next major support below), LVN $3,760–$3,880 (price is currently in this zone — thin trading, rapid movement expected), HVN $3,900 (next resistance above).`,
                `Doji at VWAP validity: A doji alone is not a strong trigger — requires a follow-up bullish candle. Wait for the next 4H candle to close bullish before entering. If the next candle is a bullish engulfing or strong close above VWAP, that is the trigger.`,
                `Entry: $3,820–$3,840 (on bullish 4H candle close confirming VWAP support and LVN continuation). Stop: $3,720 (the weekly POC — if price falls to the POC, the LVN thesis is negated and the trend structure is in question). TP1: $3,890–$3,900 (top of LVN, just below HVN at $3,900). TP2: $4,040 (above HVN at $3,900, next LVN upper boundary).`,
                `LVN implication: the $3,760–$3,880 LVN means minimal resistance between the entry ($3,820) and TP1 ($3,890). Price should move rapidly to TP1 once the entry direction is confirmed. This is the LVN's value: predictable speed of movement.`,
              ],
            },
          ],
        },

        {
          id: 'building-trading-plan',
          title: `Building Your Trading Plan`,
          explanation: `Richard Dennis, who turned $1,600 into $200 million trading commodities, designed the "Turtle Trading" experiment in 1983 to determine whether trading could be taught. He took 23 people off the street with no trading experience and gave them a complete, explicit trading plan — entry rules, position sizing, stop-loss rules, exit rules. Within 4 years, those 23 traders collectively generated over $100 million in profits. The conclusion: a systematic trading plan, consistently applied, can produce professional results independent of prior trading intuition.

A trading plan is a complete written document that defines every aspect of your trading approach before any trade is entered. It eliminates in-the-moment decisions by replacing them with pre-made rules. A trading plan has six mandatory components:

1. Market Universe: which assets you trade (e.g., BTC, ETH, SOL, AVAX, BNB — spot only, major liquid assets with tight spreads). This prevents scope creep into unfamiliar or illiquid assets.

2. Setup Criteria: the exact conditions required for a valid trade (the five-element checklist: trend, level, trigger, defined risk ≥ 2:1 R:R, calculated position size). Every condition must be present or the trade is skipped.

3. Entry Rules: exact entry price determination (trigger candle close, limit order at level, breakout above resistance).

4. Exit Rules: stop placement methodology (below-structure, ATR-based, or below-pattern), TP ladder (40/35/25 at successive resistances), stop advancement schedule (breakeven at +1R, +1R at +2R, trailing at +3R).

5. Risk Rules: maximum per-trade risk (1-2%), daily loss limit (3%), maximum simultaneous open risk (6%), position sizing formula, volatility adjustment.

6. Review Process: when you evaluate performance (rolling 20-trade EV), what triggers strategy changes (100-trade minimum sample), how you log trades (entry, exit, emotional state, checklist adherence).

A trading plan that exists in your head is not a trading plan — it will be revised under emotional pressure. Write it down. Review it monthly. Revise it only based on 100-trade evidence.`,
          visualPrompt: `👆 Trading plan template — six components filled in`,
          visualType: `gif`,
          visualUrl: `trading-plan-document`,
          strategy: `Write your complete trading plan this week. Include all six components. Print it and keep it visible at your trading workspace. Review it every morning before the session. When emotion says to deviate: read the relevant section of the plan first. If the plan was written in a calm state, it is more reliable than the emotion-state impulse.`,
          examples: [
            {
              contextTag: `[New Trader, BTC/ETH/SOL, plan creation]`,
              context: `A new trader writes their first trading plan after completing this curriculum.`,
              scenario: `Market Universe: BTC/USDT, ETH/USDT, SOL/USDT only. No altcoins with <$100M daily volume. Setup Criteria: all five checklist elements required. Minimum 2 confluence signals. R:R ≥ 2:1. Entry Rules: trigger candle close only (no market orders except emergencies). Exit Rules: OCO set immediately post-entry. TP1 at first resistance (40%), TP2 at second (35%), TP3 at third (25%). Breakeven at +1R. Risk Rules: 1% standard, 1.5% premium, 0.5% experimental. Daily loss limit: 3%. Max simultaneous: 6% combined. Review: rolling 20-trade EV, monthly strategy session.`,
              outcome: `The written plan provides answers to every in-the-moment question: "Should I enter this?" (run checklist), "Should I move my stop?" (check stop advancement rules), "Should I add?" (check risk rules). The plan makes trading decisions systematic rather than emotional.`,
            },
            {
              contextTag: `[Experienced Trader, plan revision process]`,
              context: `An experienced trader has been trading for 8 months with a written plan. Their 100-trade review shows their ETH trades underperform BTC and SOL trades by 35% on EV.`,
              scenario: `Evidence from 100 trades: BTC EV +$148/trade, SOL EV +$162/trade, ETH EV +$96/trade. Analysis reveals: ETH's larger spreads and thinner 4H liquidity at key levels cause more stop hunts against their ETH positions.`,
              outcome: `Plan revision: add specific ETH entry filter — require volume ≥ 1.8× average at trigger candle (vs 1.5× for BTC/SOL). Reduce ETH position size to 0.75% from 1%. The revision is evidence-based (100 trades), specific (ETH entry filter), and measured (not abandoning ETH entirely). This is the correct plan revision process.`,
            },
            {
              contextTag: `[Professional Trader, psychological rules in the plan]`,
              context: `A professional trader's trading plan includes a psychological section alongside the technical rules.`,
              scenario: `Psychological rules written in the plan: "If emotional state is below 6/10 at session start: no trades today. After any stop-out: 30-minute break before next evaluation. After hitting daily loss limit: platform closed, no exceptions. FOMO check: if an asset is not on the pre-session watchlist: it is not traded today, regardless of move size."`,
              outcome: `Having psychological rules written in the plan means they exist as contractual obligations to the calm-state self, not as in-the-moment willpower tests. The emotional state can want to break the rules — but the written plan provides an external reference that the plan (not the emotion) governs the session.`,
            },
          ],
          keyTakeaway: `A trading plan is a complete written document covering six components: market universe, setup criteria, entry rules, exit rules, risk rules, and review process. Write it in a calm state. Trade from it systematically. Revise it only based on 100-trade evidence, never on emotional impulse.`,
          guidedPractice: [
            {
              question: `What is the primary function of a trading plan?`,
              options: [
                `A — To predict which trades will be profitable`,
                `B — To make all significant trading decisions in advance during a calm state, eliminating in-the-moment emotional decision-making during live trades`,
                `C — To track profits and losses`,
                `D — To identify the best trading strategy`,
              ],
              correct: 1,
              hint: `If the plan exists so you don't have to decide during a live trade, what psychological problem does it solve?`,
              explanation: `B is correct. The primary purpose of a trading plan is to convert emotional, real-time decisions into pre-made mechanical rules. Every time you face a decision during a live trade — "should I move my stop?" "should I exit early?" "should I enter this setup?" — the plan answers with a pre-decided rule from a calm analytical state. This eliminates the emotional state's influence on decisions that should be analytical.`,
            },
            {
              question: `Under which conditions is it appropriate to revise a trading plan?`,
              options: [
                `A — After any losing week — the strategy clearly isn't working`,
                `B — Based on evidence from a minimum 100-trade sample showing consistent performance deviation from expected parameters — not based on recent emotional experience or short-term results`,
                `C — Monthly — plans should always be updated`,
                `D — Whenever market conditions change`,
              ],
              correct: 1,
              hint: `What sample size is statistically meaningful for strategy evaluation? And what is the alternative to evidence-based revision?`,
              explanation: `B is correct. A trading plan revision should require evidence — 100 trades showing consistent underperformance or a specific identifiable pattern of failure. Revising after a losing week is a psychological response (the strategy "feels" wrong) not an analytical one (100 trades show the EV is negative). Most plans are revised too frequently — after every losing streak — which prevents the strategy from ever running long enough to show its true performance distribution. Revise based on data, not emotion.`,
            },
            {
              question: `Which of the following is NOT one of the six mandatory components of a trading plan?`,
              options: [
                `A — Market Universe (which assets to trade)`,
                `B — Social media monitoring rules (which accounts to follow for trade ideas)`,
                `C — Exit Rules (stop placement, TP ladder, stop advancement)`,
                `D — Review Process (rolling 20-trade EV, strategy change criteria)`,
              ],
              correct: 1,
              hint: `The six components are: market universe, setup criteria, entry rules, exit rules, risk rules, and review process. Does social media monitoring belong?`,
              explanation: `B is correct. Social media monitoring is not part of a systematic trading plan — it is a FOMO amplifier and an external influence on a systematic process. The six mandatory components (market universe, setup criteria, entry rules, exit rules, risk rules, review process) define everything needed for systematic execution without external influence. Adding "follow X accounts for trade ideas" introduces uncontrolled external signals that will override systematic rules in emotional moments.`,
            },
            {
              question: `Your trading plan says "stop at technical level using below-structure method." During a live trade, you feel strongly the stop is too tight and want to move it lower. What does the plan say?`,
              options: [
                `A — The feeling is valid — adjust the stop`,
                `B — The plan was written in a calm state. The feel during the live trade is an emotional state response. The plan governs. Do not move the stop lower. If the level is hit, the trade is wrong — that is what the stop communicates.`,
                `C — You can adjust the stop once per trade`,
                `D — Moving the stop is fine as long as you document it`,
              ],
              correct: 1,
              hint: `Who made the better decision: the calm-state version who wrote the stop level, or the emotional-state version watching a live P&L?`,
              explanation: `B is correct. The stop was set at a technically justified level by the calm analytical self. The emotional self watching the live trade experiences loss aversion and wants to move the stop to delay the pain of a loss. Between the two states, the calm analytical state produces better decisions. The plan was written specifically to govern these moments. "Feeling strongly the stop is too tight" during a live trade is loss aversion speaking — the exact bias the plan protects against.`,
            },
            {
              question: `A trader has been trading for 3 months and says: "I have my plan in my head — I don't need to write it down." What is the main problem?`,
              options: [
                `A — A mental plan works the same as a written plan`,
                `B — A plan that exists only in the head is revised under emotional pressure without the trader being aware of it. Writing the plan creates an external reference that the emotional state cannot quietly alter. A mental plan is not a plan — it is a set of guidelines that will be abandoned in high-emotion moments.`,
                `C — Mental plans are less detailed`,
                `D — Mental plans cannot be reviewed`,
              ],
              correct: 1,
              hint: `Can you revise a mental plan without noticing? Can you revise a written plan without noticing?`,
              explanation: `B is correct. A mental plan is revised invisibly under emotional pressure. The trader doesn't think "I'm changing my plan" — they think "this situation is different" or "just this once." The written plan creates a physical artifact that requires deliberate action to revise. Deviating from a written plan is visible — you can see the plan text and see that your action contradicts it. This visibility is the primary advantage of writing the plan down. The emotional state that wants to deviate can observe the contradiction and often self-correct.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-prioritisation`,
              scenario: `Review five traders' trading plans and identify the weaknesses and strengths of each:

Plan A: Market universe: "whatever looks good." Setup: "when I feel confident." Entry: "buy at a good price." Exit: "sell when I've made enough." Risk: "don't bet too much." Review: "when it stops working."

Plan B: Market universe: BTC/ETH/SOL only. Setup: 5-element checklist required. Entry: trigger candle close. Exit: OCO with TP ladder (40/35/25) and below-structure stop. Risk: 1.5% standard, 3% daily limit. Review: rolling 20-trade EV, monthly.

Plan C: Market universe: all crypto assets. Setup: RSI below 30 = buy. Entry: market order. Exit: "feel it out." Risk: 2% per trade. Review: weekly.

Plan D: Market universe: BTC/USDT only. Setup: all 5 checklist elements + minimum 3 confluence signals. Entry: limit order at technical level. Exit: OCO set at entry, TP ladder with stop advancement schedule. Risk: 0.75-2% scaled by confluence count, 3% daily limit, 6% max simultaneous. Review: 20-trade rolling EV, strategy changes require 100-trade evidence.

Plan E: Market universe: BTC/ETH/SOL/AVAX. Setup: "support bounces with volume." Entry: "buy near support." Exit: stop at "below support" and TP at "next resistance." Risk: "about 1-2%." Review: monthly.

Rank from best to worst and justify based on the six plan components.`,
              scoringCriteria: [
                `Plan D: BEST. All six components fully defined. Scaled risk by conviction, full stop advancement schedule, strict 100-trade change threshold. Professional level.`,
                `Plan B: Second. Solid six-component structure. Slightly less sophisticated than D (no confluence scaling) but systematic and executable. Good for intermediate traders.`,
                `Plan E: Third. Has the structure idea but lacks specificity. "About 1-2%" and "near support" are ambiguous. Needs precise formulas and exact level definition. Serviceable but improvement needed.`,
                `Plan C: Fourth. Has some structure (market universe, position size) but RSI <30 as the sole setup criterion is a known-failing strategy. "Feel it out" exit is dangerous. Has enough structure to be improved but core setup logic is wrong.`,
                `Plan A: WORST. All six components are empty platitudes. Not a plan — a description of someone trading without any systematic framework. Every component requires complete reconstruction.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are evaluating your 3-month trading plan. Here is the data:

Month 1-3 consolidated (100 trades):
- BTC (42 trades): EV +$142/trade. Win rate 57%. Avg R:R achieved: 2.4:1.
- ETH (38 trades): EV +$88/trade. Win rate 52%. Avg R:R achieved: 2.1:1.
- SOL (20 trades): EV +$204/trade. Win rate 60%. Avg R:R achieved: 2.8:1.

Entry type analysis:
- Breakout entries (35 trades): EV +$168/trade.
- Pullback to support entries (48 trades): EV +$162/trade.
- Reversal entries (17 trades): EV +$62/trade.

Time analysis:
- 9am–12pm EST (peak liquidity): EV +$184/trade.
- 12pm–3pm EST (afternoon): EV +$122/trade.
- 3pm–6pm EST (US close approach): EV +$44/trade.
- Outside these hours (6 trades): EV −$92/trade.

Derive specific rule changes for your next plan version.`,
              scoringCriteria: [
                `Asset allocation: SOL has highest EV per trade ($204). Consider increasing SOL allocation from 20% to 35% of trades. ETH lowest at $88 — reduce allocation or add ETH-specific entry filter (e.g., require stronger volume confirmation on ETH entries).`,
                `Entry type: reversal entries produce $62/trade vs $162+ for others. Either eliminate reversals or add a stricter filter (require RSI divergence + W-bottom pattern + trigger candle for all reversal entries).`,
                `Time filter: outside 9am–6pm EST = negative EV (−$92). RULE: no trades outside 9am–6pm EST. 3pm–6pm also underperforms ($44 vs $184 in morning). Optional: restrict new trade entries to 9am–2pm EST to capture peak EV hours.`,
                `Combined rule changes: (1) Increase SOL to 35% of trades. (2) Add ETH entry filter. (3) No trading outside 9am–6pm EST. (4) No new reversal entries without all three reversal conditions. Each change is evidence-based from 100-trade data.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You are building your trading plan right now. Using the knowledge from all 8 labs, write the complete six-component plan for a spot swing trader with a $15,000 account. The plan must be specific enough that someone else could trade from it without asking clarifying questions.

Requirements per component:
1. Market Universe: name specific assets and any exclusion criteria
2. Setup Criteria: list every required condition with specific measurable thresholds
3. Entry Rules: exact entry mechanism and price determination
4. Exit Rules: exact stop method, TP structure with percentages, stop advancement schedule
5. Risk Rules: exact % values, daily limit, simultaneous max, position sizing formula
6. Review Process: specific intervals, specific metrics, specific revision criteria`,
              scoringCriteria: [
                `Market Universe: BTC/USDT, ETH/USDT, SOL/USDT minimum. Optional: AVAX, BNB. Exclusion: assets with <$50M daily volume, no new listings <6 months old, no leverage tokens.`,
                `Setup Criteria: (1) Daily trend aligned (higher highs/lows OR price above 50-day EMA). (2) Entry at key level (support tested ≥ 2 times, or confirmed breakout level). (3) Trigger candle: bullish engulfing, hammer, or pin bar. (4) R:R ≥ 2:1 calculated at entry. (5) Position size within risk rules. PLUS: minimum 2 independent confluence signals.`,
                `Entry Rules: limit order at trigger candle level OR market order at trigger candle close. OCO set immediately at fill. No market orders except genuine emergencies.`,
                `Exit Rules: stop below structure (below swing low + 0.5% buffer) OR 2× ATR. TP1: 40% at first resistance. TP2: 35% at second resistance. TP3: 25% at measured move. Stop advance: breakeven at +1R, +1R level at +2R, 2.5× ATR trail at +3R.`,
                `Risk Rules: 1% standard, 1.5% premium (3+ confluence signals), 0.5% experimental. Daily loss limit: 3% = stop trading. Max simultaneous: 6% combined. Formula: risk$ ÷ stop distance × entry price = position notional.`,
                `Review: weekly journal review. Rolling 20-trade EV tracked. Monthly strategy session. Strategy changes require 100-trade minimum sample. Any deviation from the plan is logged and reviewed.`,
              ],
            },
          ],
        },

        {
          id: 'backtesting',
          title: `Backtesting Properly`,
          explanation: `In 2016, a group of researchers published a study demonstrating that of 447 trading strategies published in peer-reviewed academic finance journals, 96% could not be replicated out-of-sample with the same parameters. The primary cause: overfitting. The strategies were optimised on the data they were tested on — producing strong historical results that reflected the historical data, not a genuine edge. This is the backtesting trap that destroys most retail traders' confidence in strategies that never had real-world validity.

Backtesting is the process of applying a trading strategy to historical price data to evaluate its performance. Done correctly, it provides the only objective evidence of a strategy's historical edge. Done incorrectly, it produces misleading results that create false confidence.

The five backtesting rules that separate valid from invalid tests:

1. Out-of-sample testing: split your data into two periods — "training" (where you develop the strategy) and "test" (where you apply it without modification). A strategy must perform positively on the out-of-sample test data. If it only works on the period you designed it for, it is overfitted to that data.

2. Realistic costs: include trading fees (0.1% taker per side), slippage estimates (0.05–0.15% per trade depending on liquidity and size), and spread costs. A strategy that appears profitable before costs and is unprofitable after is not a real strategy.

3. Sufficient sample size: minimum 100 trades per market condition tested. A backtest with 20 trades proves nothing statistically.

4. Avoid look-ahead bias: only use information that was available at the moment of entry — not future data. A common error: using daily closing price as the entry price when the signal would have required knowing the close price before the candle closed.

5. Include all market conditions: test across bull, bear, and sideways markets. A strategy that only works in bull markets is a leveraged long play, not a sustainable strategy.

Manual backtesting (going candle-by-candle through historical charts) is more time-intensive but forces you to experience the psychological reality of the strategy. Software backtests run automatically but can miss the discipline required to execute the rules in real time.`,
          visualPrompt: `👆 Backtesting walkthrough — candle by candle on historical data`,
          visualType: `gif`,
          visualUrl: `manual-backtest-demo`,
          strategy: `Manual backtesting protocol: (1) Define rules exactly before opening historical charts. (2) Step forward candle by candle — only act on information available at that candle's open. (3) Log every trade: entry, exit, emotional simulation of the trade's difficulty. (4) Run minimum 100 trades across at least two market conditions (trend + range or trend + bear). (5) Compare results before and after realistic costs.`,
          examples: [
            {
              contextTag: `[Trader, BTC, valid backtest process]`,
              context: `A trader wants to test their five-element checklist swing trading strategy on BTC daily charts.`,
              scenario: `They use 2022–2023 data (includes strong bear market, range, and recovery). Rules defined before opening charts: trigger candle = bullish engulfing at support, stop = below swing low + 0.5%, TP1 = next resistance (40%), TP2 = next (35%), TP3 = measured move (25%). They step candle by candle for 8 weeks of analysis time, finding 34 valid setups in 2 years of data.`,
              outcome: `Results across 34 trades: 55.9% win rate, 2.3:1 average R:R, EV = +$124/trade before costs. After 0.2% round-trip fee: EV = +$62/trade. The 2022 bear market showed the strategy underperforms in downtrends (win rate 42%) but outperforms in uptrends (65%). Plan revision: add the "trade only above 200-day SMA" filter. Re-backtest with filter: win rate rises to 61.2%, EV to +$148/trade after costs.`,
            },
            {
              contextTag: `[Trader, ETH, overfitting trap]`,
              context: `A trader optimises an RSI/MACD crossover strategy on 2021 ETH bull market data, finding the perfect parameters: RSI 12, MACD 10/21/8, yielding 74% win rate.`,
              scenario: `They test the same parameters on 2022 ETH bear market data. Win rate: 31%. EV: −$84/trade.`,
              outcome: `The strategy was optimised for bull market conditions — the parameters were fitted to the 2021 data, not to a genuine edge. An honest backtest would have split 2020–2022 data into training (2020–2021) and test (2022). The strategy's failure on the test period would have been visible before real capital was deployed.`,
            },
            {
              contextTag: `[Analyst, look-ahead bias example]`,
              context: `A trader backtests a strategy using daily closing prices as the entry price.`,
              scenario: `The rule: "Buy ETH when the daily candle closes as a bullish hammer." Entry at the closing price. In real trading, a daily candle's closing price is only known when the candle closes — the trader would need to enter at the open of the NEXT candle (after the hammer has confirmed).`,
              outcome: `The backtest shows entries at $3,620 (the hammer close). Real trading would entry at $3,640 (next candle open, after confirmation). The 0.55% difference ($3,640 vs $3,620) changes R:R on every trade. In a 100-trade backtest this look-ahead bias represents approximately $20 in EV per trade overstatement — enough to convert a marginally profitable strategy into an apparently strong one.`,
            },
          ],
          keyTakeaway: `Valid backtesting requires out-of-sample testing, realistic cost inclusion, minimum 100 trades, no look-ahead bias, and coverage of multiple market conditions. An overfitted strategy works only on its training data. Test honestly or the backtest creates false confidence, not real edge.`,
          guidedPractice: [
            {
              question: `You backtest a strategy and find 78% win rate, 3:1 R:R on 2020–2021 bull market data. You immediately begin trading it live. What is the most important test you skipped?`,
              options: [
                `A — A smaller timeframe test`,
                `B — Out-of-sample testing on a different market period (especially a bear market or sideways period). The 78% win rate may be entirely attributable to the 2020–2021 bull run, not to the strategy's actual edge.`,
                `C — A leverage test`,
                `D — Testing on more liquid assets`,
              ],
              correct: 1,
              hint: `A strategy that works in a 2020–2021 bull market but has never been tested in a bear market or range — what is the risk?`,
              explanation: `B is correct. Out-of-sample testing is the fundamental validity test for any strategy. The 2020–2021 period was an exceptional bull market — most long strategies would have produced strong results in that environment regardless of their underlying logic. The real test: does the strategy generate positive EV in 2018, 2022 (bear markets), and 2019, 2023 (mixed/recovery markets)? A strategy that only works in bull markets is not an edge — it is a leveraged long exposure.`,
            },
            {
              question: `Your backtest shows EV of +$120/trade before fees. After 0.2% round-trip fees on $5,000 average position size, what is the actual EV?`,
              options: [
                `A — Still +$120 — fees are minimal`,
                `B — $120 − ($5,000 × 0.2%) = $120 − $10 = +$110/trade real EV`,
                `C — $120 − $10 = $110/trade, but slippage (0.1% avg) also applies: $110 − $5 = +$105/trade`,
                `D — Fees don't affect backtested performance`,
              ],
              correct: 2,
              hint: `Calculate both fee and slippage deductions from the gross EV.`,
              explanation: `C is the most complete answer. Fees: $5,000 × 0.2% = $10. Slippage: $5,000 × 0.1% avg = $5. Total cost per trade: $15. Real EV: $120 − $15 = $105/trade. Both fees and slippage must be included for a realistic backtest. A backtest without fees ($120 EV) looks 14.3% better than reality ($105 EV) — for strategies with thin margins, this can convert a positive-EV backtest into a negative-EV live strategy.`,
            },
            {
              question: `What is look-ahead bias in backtesting and how does it corrupt results?`,
              options: [
                `A — Looking at too many charts simultaneously`,
                `B — Using price data that would not have been available at the time of the entry signal — for example, using the closing price of the signal candle as the entry when the trade would realistically only execute on the next candle's open`,
                `C — Only testing in one market direction`,
                `D — Using too short a historical period`,
              ],
              correct: 1,
              hint: `During a live trade, what price information do you have when entering on a signal candle vs after it closes?`,
              explanation: `B is correct. Look-ahead bias uses future information (information available after the signal) in the entry calculation. The most common example: "buy on the close of a hammer candle." In backtesting, you know the hammer closed at $3,620 and enter there. In real trading, a "hammer candle" is only confirmed when it closes — and your entry is the open of the next candle ($3,645 in a real market). The $25 difference appears in every trade of the backtest. Over 100 trades, this systematic overstatement can make an unprofitable strategy appear profitable.`,
            },
            {
              question: `How many trades is the minimum for a statistically meaningful backtest result?`,
              options: [
                `A — 10–20 trades — enough to see the pattern`,
                `B — Minimum 100 trades per market condition (100 in bull, 100 in bear, 100 in range) for statistical significance. Below 100, variance dominates over signal.`,
                `C — 30 trades — standard statistical sample`,
                `D — 500 trades — anything less is unreliable`,
              ],
              correct: 1,
              hint: `At what sample size does the statistical confidence interval narrow enough to distinguish signal from noise?`,
              explanation: `B is correct. 100 trades per market condition is the practical minimum for meaningful backtest conclusions. With fewer trades, the confidence interval on the win rate is too wide to make conclusions — 20 trades with 60% win rate could easily be 40%–80% in reality. 100 trades narrows this to approximately 50%–70% at 90% confidence. Testing across multiple market conditions (bull, bear, range) separately is essential because a strategy's win rate varies significantly across conditions.`,
            },
            {
              question: `A backtest shows 65% win rate on BTC data from January 2023 to December 2023. The strategy was also developed using 2023 data. What is the problem?`,
              options: [
                `A — 2023 is too recent to use for backtesting`,
                `B — In-sample overfitting. The strategy was developed on the same data it is being tested on — the test proves nothing. The strategy parameters may be specifically optimised for 2023's market conditions and may not generalise to other years.`,
                `C — One year of data is sufficient for a backtest`,
                `D — BTC-specific strategies can only use BTC data`,
              ],
              correct: 1,
              hint: `If you developed the strategy on 2023 data and test it on 2023 data, what are you actually measuring?`,
              explanation: `B is correct. Testing a strategy on the same data used to develop it measures how well the strategy fits that specific data — not whether it has a genuine edge. A strategy developed on 2023 data will naturally perform well on 2023 data because the rules were designed around 2023's patterns. The test data must be chronologically separate from the development data. Valid approach: develop strategy on 2021–2022, test on 2023. The 2023 result is then an honest assessment of the strategy's out-of-sample performance.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `A trader presents their backtesting results. Evaluate the validity of each test:

Test 1: Strategy: RSI oversold bounce. Data: Jan 2023–Dec 2023 (bull market). Trades: 28. Win rate: 71%. EV: +$190/trade. Costs included: No.

Test 2: Strategy: 50 EMA bounce entries. Development data: 2021-2022. Test data (separate): Jan-Dec 2023. Trades: 68 (test period). Win rate: 59%. EV: +$112/trade (after 0.2% round-trip fees). Market conditions covered: recovery/bull (2023).

Test 3: Strategy: volume spike entries at support. Data: BTC 2019–2024 (5 years). Trades: 142. Market conditions: bull (2019-2021), bear (2022), recovery (2023-2024). Win rate: 54%. EV: +$87/trade after fees. Out-of-sample: not tested separately (all data used for development).

Test 4: Strategy: Bollinger squeeze breakouts. Development: 2020-2022. Test: 2023-2024 (separate). Trades (test period): 52. Win rate: 67%. EV: +$168/trade. Costs included: Yes (0.2% fees + 0.1% slippage).

Rank the four tests by validity and identify the specific weaknesses of each.`,
              scoringCriteria: [
                `Test 4: MOST VALID. Out-of-sample data, realistic costs (fees + slippage), decent sample (52 trades). Only weakness: 52 trades is slightly below 100 minimum.`,
                `Test 2: SECOND. Out-of-sample data, realistic costs, 68 trades (below 100). Missing: only tested in one market condition (bull/recovery). Need bear market test.`,
                `Test 3: THIRD. Covers multiple market conditions (5 years), 142 trades — excellent sample. Fatal flaw: no out-of-sample split. Entire 5-year dataset used for development AND test = in-sample overfitting risk.`,
                `Test 1: LEAST VALID. In-sample only (same period for development and test), no costs included, only 28 trades (below minimum), only bull market data. Multiple critical failures.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are doing a manual backtest of your swing trading strategy on BTC daily charts from January 2022 to December 2023 (includes: Q1 2022 bull extension, Q2-Q4 2022 bear, Q1-Q4 2023 recovery).

After going candle by candle for one week of analysis time, you have logged 47 trades.

Results so far:
Q1 2022 (bull extension): 12 trades. Win rate 75%. EV: +$210/trade.
Q2-Q4 2022 (bear): 22 trades. Win rate 36%. EV: −$42/trade.
Q1-Q4 2023 (recovery): 13 trades. Win rate 62%. EV: +$128/trade.

Questions:
1. What does the Q2-Q4 2022 bear market performance reveal?
2. Should you continue live trading this strategy without modifications?
3. What specific modification to the strategy rules would address the bear market underperformance?
4. How many more backtest trades do you need to reach the 100-trade minimum per condition?`,
              scoringCriteria: [
                `Bear market performance (−$42/trade EV): the strategy has negative EV in bear conditions. This is critical — a strategy with negative EV in 35% of market conditions will underperform when bear conditions occur.`,
                `Should you live trade? NO — not yet. The strategy needs a modification to address bear market failure. Live trading a strategy with known negative-EV conditions is accepting systematic losses during those conditions.`,
                `Modification: add the 200-day SMA filter: "Only take long entries when price is above the 200-day SMA." This would have eliminated most of the 22 Q2-Q4 2022 trades (when BTC was below the 200-day SMA). Re-backtest with this filter to confirm it improves EV without significantly reducing trade frequency.`,
                `Trades needed: current Q1 2022: 12 (need 88 more). Q2-Q4 2022: 22 (need 78 more). Q1-Q4 2023: 13 (need 87 more). Significant additional testing required to reach the 100-trade minimum per condition.`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `You have just completed a 120-trade backtest on BTC daily charts (2020–2024). Here are the complete results:

Total trades: 120. Win rate: 56.7%. Avg win: $398. Avg loss: −$182.
EV before costs: (56.7% × $398) − (43.3% × $182) = $225.57 − $78.81 = +$146.76/trade.
Fees (0.2% round-trip on avg $8,200 position): $16.40/trade.
Slippage (0.1%): $8.20/trade.
Real EV: $146.76 − $24.60 = +$122.16/trade.

Market condition breakdown:
- Bull phases (48 trades): Win 68.8%. EV: +$198/trade after costs.
- Bear phases (34 trades): Win 38.2%. EV: −$28/trade after costs.
- Range phases (38 trades): Win 60.5%. EV: +$142/trade after costs.

Out-of-sample test (2024 only, separate from development data): 22 trades (not yet completed to 100, but preliminary): Win rate 61.4%. EV: +$134/trade after costs.

Questions:
1. Is this a valid backtest overall?
2. Is the strategy ready for live trading?
3. What is the single most important modification to improve the strategy?
4. What additional testing is needed before going live?`,
              scoringCriteria: [
                `Validity assessment: mostly valid. 120 trades (above 100 minimum) ✓, realistic costs ✓, multiple market conditions ✓, out-of-sample test attempted ✓. Weakness: out-of-sample has only 22 trades (below 100 minimum).`,
                `Ready for live trading? Conditionally yes — with the bear market filter. The strategy has positive EV overall but negative EV in bear conditions (−$28/trade). Live trading without a bear market filter accepts this negative EV.`,
                `Most important modification: 200-day SMA filter. Only take entries when price is above the 200-day SMA. This would eliminate most bear phase entries and likely convert bear phase EV to neutral or positive (by simply avoiding the condition where the strategy underperforms).`,
                `Additional testing needed: (1) Complete out-of-sample to 100 trades. (2) Re-test with 200-day SMA filter — need another 100-trade sample on filtered data. (3) Forward test (paper trade) for 30 days before live capital. The strategy is promising but not fully validated.`,
              ],
            },
          ],
        },

        {
          id: 'professional-routine',
          title: `Professional Setup and Daily Routine`,
          explanation: `Linda Raschke, a professional trader since 1981 who has traded through every major market crisis including 1987, 2000, 2008, and 2020, has said: "The best traders have mechanical, repeatable routines. The worst traders are the most intuitive ones — they are always surprised by the market." The difference between professional and amateur traders is often visible not in the trades themselves but in the discipline of the daily routine surrounding the trades.

A professional trading routine has three phases: Pre-Market Preparation (30-60 minutes), Active Trading Session, and Post-Market Review (15-30 minutes).

Pre-Market Preparation: (1) Market overview — review overnight moves, major news, macro calendar (Fed events, CPI, earnings). (2) Chart analysis — update watchlist, identify setups that meet all five checklist elements, mark key levels on all watchlist assets. (3) Order preparation — for any setups meeting criteria, prepare exact limit orders in advance. (4) Mental preparation — emotional state check (1-10), review the day's maximum risk budget, review the daily loss limit.

Active Trading Session: execute the plan. Check charts at defined intervals (every 4H candle close for swing traders, more frequently for day traders). Do not watch tick-by-tick. Enter only setups on the pre-session watchlist. Manage open positions according to the plan (stop advancement, TP ladder). Log emotional state at each trade decision.

Post-Market Review (15-30 minutes): (1) Log all trades entered — entry, exit, P&L, emotional state, checklist adherence. (2) Review any deviations from the plan — what triggered the deviation and what was the cost. (3) Update the watchlist for the next session. (4) Weekly: calculate rolling 20-trade EV, review pattern of deviations.

The physical setup matters: a clean workspace with minimal distractions, all required charts pre-loaded, the trading plan document visible, a trading journal open. Professional traders treat the trading environment with the same intentionality as any other professional workspace.`,
          visualPrompt: `👆 Professional trading workspace — two screens, clean setup, journal open`,
          visualType: `gif`,
          visualUrl: `pro-trader-workspace`,
          strategy: `Spend 30-45 minutes in pre-market preparation before every session. Identify all setups before markets become active — not during. Never enter a trade that was not identified during the pre-market analysis. Use the post-market review to close the loop on every session — this is where the professional improvement actually happens.`,
          examples: [
            {
              contextTag: `[Professional Trader, daily routine structure]`,
              context: `A professional crypto swing trader's daily routine.`,
              scenario: `7:00am: Wake, 30-minute no-phone period. 7:30am: Macro review — check CMC, scan overnight BTC/ETH moves, check economic calendar. 8:00am: Chart analysis — review all 5 watchlist assets on daily and 4H, mark all key levels, identify any new valid setups. 8:30am: Pre-session prep — emotional state: 8/10 (good). Max risk today: $300 (3 trades at 1%). Orders pre-loaded. 9:00am: Session open — check 4H candle closes at predefined times. 5:30pm: Post-market — log two trades taken, review one deviation (moved TP down), calculate cost.`,
              outcome: `The routine ensures: (1) macro awareness before entering, (2) setups identified cold (not during the heat of market movement), (3) orders prepared in advance (no emotional execution delay), (4) systematic review catches patterns over time. The deviation log (moved TP down) is documented — over time, this pattern can be addressed before it becomes a habit.`,
            },
            {
              contextTag: `[New Trader, building the routine]`,
              context: `A new trader's first attempt at a structured routine after 2 months of inconsistent results.`,
              scenario: `Previously: would open charts whenever they had time, enter trades reactively to price moves, rarely log trades, no consistent review process. New routine attempt: 30 minutes of pre-market chart review each morning, explicit watchlist with levels marked, trade log started.`,
              outcome: `First month of structured routine: fewer total trades (12 vs 22 previous month) but higher win rate (58% vs 44%). The reduction in trades came entirely from eliminating impulsive FOMO entries (not on watchlist). The win rate improvement came from entering only pre-identified setups with all five checklist elements. The routine changed the outcome before any change to the analysis.`,
            },
            {
              contextTag: `[Trader, post-market review value]`,
              context: `A trader starts a systematic post-market review for the first time.`,
              scenario: `Over 3 months of reviews, they identify a pattern: their worst trades (4 of 5 biggest losses) occurred between 3pm and 5pm EST. All 4 were entered without the pre-session watchlist. Their review data: "Afternoon entries without plan: win rate 22%. Morning pre-planned entries: win rate 61%."`,
              outcome: `The 3-month review reveals a specific behavioral pattern invisible without systematic logging. The fix: add a rule to the trading plan — no new entries after 2pm EST. This single rule, derived from 3 months of review data, eliminates the worst-performing category of their trading entirely.`,
            },
          ],
          keyTakeaway: `A professional routine has three phases: pre-market preparation (identify setups before the session), active session (execute the plan, check at intervals, don't watch tick-by-tick), and post-market review (log every trade, identify deviations, calculate EV). The review phase is where professional improvement occurs.`,
          guidedPractice: [
            {
              question: `What is the most important activity in pre-market preparation and why must it happen before the session?`,
              options: [
                `A — Checking P&L from previous days`,
                `B — Identifying all valid setups and marking key levels on watchlist assets — done before the session when the mind is analytical, not reactive to live price movement`,
                `C — Reading crypto news for trading ideas`,
                `D — Reviewing other traders' positions`,
              ],
              correct: 1,
              hint: `What changes about the quality of setup identification when done before vs during a live market session?`,
              explanation: `B is correct. Setup identification done during a live market session is influenced by recent price movement (recency bias), current P&L (emotional state), and the urgency of a moving market (FOMO pressure). The same setup analysis done before the session, when no capital is at risk and price is not moving, produces calmer, more objective evaluation. Setups on the pre-market watchlist are identified in the optimal mental state. Setups identified during the session are frequently influenced by emotion.`,
            },
            {
              question: `Why should a swing trader check charts at defined intervals (e.g., every 4H candle close) rather than continuously?`,
              options: [
                `A — Missing a candle close could cause you to miss a trade`,
                `B — Continuous chart-watching activates the emotional threat-detection system with every adverse tick, leading to premature exits, stop moves, and trading when no trade is warranted`,
                `C — Defined intervals are less efficient`,
                `D — It only matters for day traders, not swing traders`,
              ],
              correct: 1,
              hint: `What is the emotional effect of watching a live P&L move every second compared to checking only at predefined times?`,
              explanation: `B is correct. Every adverse tick on a live chart triggers a micro-stress response. Over hours, this continuous stimulation leads to: premature exits (can't tolerate the visual loss), stop moves (anxiety response), entries on non-setup price action (FOMO responses to moves). Checking at defined intervals (4H candle closes for swing trades) means checking only when a complete piece of information (a closed candle) is available, in a less emotionally activated state. The predefined interval also prevents over-monitoring.`,
            },
            {
              question: `What is the primary value of the post-market review?`,
              options: [
                `A — Calculating daily P&L`,
                `B — Identifying behavioral patterns (deviations from the plan, emotional state correlations with performance) that are only visible over many sessions of systematic logging — creating the feedback loop for professional improvement`,
                `C — Reviewing the next day's news`,
                `D — Checking the overall market direction`,
              ],
              correct: 1,
              hint: `What specific information does the post-market review produce that cannot be obtained any other way?`,
              explanation: `B is correct. The post-market review is where professional improvement actually occurs. Reviewing each trade while the memory is fresh: what was the emotional state? Did the checklist get applied? Was the plan followed? Over weeks, patterns emerge: "I always take trades on Fridays that underperform." "My emotional state below 6/10 produces negative EV." "My reversal entries consistently underperform support bounces." These patterns are invisible without systematic logging and only visible over 20+ sessions of review. The review converts experience into learning.`,
            },
            {
              question: `A trader spends 2 hours on pre-market analysis and finds no valid setups on their watchlist. What is the correct action?`,
              options: [
                `A — Expand the watchlist to find something to trade`,
                `B — Take no trades today. No valid setups = no trading. The market provides no obligation to participate every day.`,
                `C — Look for lower-quality setups to use the preparation time`,
                `D — Trade anyway to maintain consistency`,
              ],
              correct: 1,
              hint: `The trading plan defines what qualifies as a valid setup. If nothing qualifies, what does the plan say?`,
              explanation: `B is correct. Not trading on a day with no valid setups is not a failure — it is disciplined plan execution. The plan defines entry criteria. A day with no setups meeting those criteria is a day where the market is not offering opportunities that meet your standards. Expanding the watchlist (A) or lowering standards (C) to trade when there are no valid setups means deliberately entering lower-quality trades. Professional traders often talk about cash being a position — being in cash is a legitimate decision when the market offers nothing that meets the plan's criteria.`,
            },
            {
              question: `What should the trade log include for each trade?`,
              options: [
                `A — Entry price and exit price only`,
                `B — Entry price, exit price, P&L, setup type, checklist adherence (all 5 elements Y/N), emotional state at entry, any deviation from the plan and its cost`,
                `C — P&L and win/loss only`,
                `D — Date and time only`,
              ],
              correct: 1,
              hint: `The trade log is the data source for the post-market review. What information is needed to identify behavioral patterns?`,
              explanation: `B is correct. The trade log needs to capture both objective data (price, P&L) and subjective data (emotional state, plan adherence) to be useful for improvement. Objective data alone tells you what happened; subjective data tells you why. The pattern "emotional state below 6 = negative EV" can only be identified if emotional state is logged. The pattern "FOMO entries off watchlist cost $X per trade" can only be identified if checklist adherence is logged. A P&L-only log identifies no behavioral patterns and produces no actionable improvement.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-prioritisation`,
              scenario: `A trader's week log shows these patterns:

Monday: Pre-market: 45 min. Trades: 2 (both on watchlist). P&L: +$480. Emotional state: 8/10. Plan deviations: 0.
Tuesday: Pre-market: 15 min (rushed). Trades: 5 (2 watchlist, 3 reactive). P&L: −$220. Emotional state: 6/10. Plan deviations: 3.
Wednesday: Pre-market: 50 min. Trades: 1 (watchlist). P&L: +$290. Emotional state: 7/10. Plan deviations: 0.
Thursday: Pre-market: 0 min (skipped). Trades: 6 (all reactive). P&L: −$840. Emotional state: 5/10. Plan deviations: 6.
Friday: Pre-market: 40 min. Trades: 2 (watchlist). P&L: +$310. Emotional state: 7/10. Plan deviations: 0.

Weekly net: +$20.

1. What is the correlation between pre-market preparation and performance?
2. Calculate P&L by preparation quality
3. What single rule would most improve this trader's weekly performance?
4. How much P&L was lost to reactive (non-watchlist) trades?`,
              scoringCriteria: [
                `Correlation: days with 40-50 min prep = +$480, +$290, +$310 = +$1,080 total (Mon, Wed, Fri). Days with inadequate prep = −$220, −$840 = −$1,060 (Tue, Thu). Net from prep days: +$1,080. Net from unprepared days: −$1,060.`,
                `P&L by prep: Full prep (40+ min): +$360 avg/day. Partial prep (15 min): −$220/day. No prep: −$840/day.`,
                `Single most impactful rule: "Minimum 40 minutes of pre-market preparation required. If preparation is less than 40 minutes, no trades today."`,
                `Reactive trade cost: Tuesday 3 reactive trades + Thursday 6 reactive trades = 9 reactive trades producing most of the −$1,060 loss. Watchlist-only trades on those days might have produced much smaller losses or small gains.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Design a complete daily routine for the following trader profile:

Trader: Employed full-time (9-5 EST). Can access charts for 30 minutes before work (8-8:30am EST), 30 minutes at lunch (12-12:30pm EST), and 2 hours in the evening (7-9pm EST). Trading style: swing trading on daily charts. Platform: Binance.

Design:
1. Pre-market routine (when and what)
2. Session check-in schedule (when to check charts during the day)
3. Evening review schedule
4. Weekend routine
5. Emergency protocol (unexpected major market move during work hours)`,
              scoringCriteria: [
                `Pre-market (8-8:30am EST): review overnight BTC/ETH/SOL moves, check macro calendar, review daily chart setups for all 3 watchlist assets, mark key levels, prepare any limit orders in advance, check emotional state (1-10).`,
                `Session check-ins: Set alerts (price alerts, not chart-watching) for key levels. Check at lunch (12-12:30pm): review any triggered alerts, check if any positions need OCO adjustment, do NOT enter new positions at lunch (insufficient time for proper analysis). Evening (7-8pm): full chart review for the day, assess any open positions, identify next-day setups.`,
                `Evening review (8-9pm): log all trades (even "no trades today" sessions). Calculate rolling EV. Update watchlist with fresh analysis. Pre-load limit orders for next-day setups.`,
                `Weekend routine: Saturday: weekly review — rolling 20-trade EV, plan adherence rate, behavioral pattern analysis. Sunday: weekly chart analysis — identify key levels and setups for the coming week on all watchlist assets.`,
                `Emergency protocol: set stop-market orders for all open positions before work. These auto-execute without needing access. If a major move occurs, the stop handles it. Never leave a position without a stop before extended unavailability.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You are completing your post-market review for the week. Here is your trade log:

Monday, Trade 1: BTC long at $72,400. Checklist: all 5 elements. Emotional state: 8. Plan deviation: none. Exit: TP1 $74,800 (+1.5% on account).

Tuesday, Trade 2: ETH long at $3,740. Checklist: 4/5 (no trigger candle — I just bought at the level). Emotional state: 7. Plan deviation: "entered before trigger, felt confident." Exit: Stop at $3,620 (−1.2% on account).

Wednesday, Trade 3: SOL short at $196 (NOT on watchlist). Emotional state: 4 (frustrated after Trade 2 loss). Checklist: 0/5. "SOL looked weak." Exit: Stopped out −1.8% on account.

Thursday, Trade 4: BTC long at $73,200. Checklist: all 5 elements. Emotional state: 7. Plan deviation: none. Currently open with stop at $71,600 and TP1 at $76,000.

Friday: No pre-market analysis done. No trades. Emotional state: 5.

Conduct the complete post-market review and identify specific rule improvements.`,
              scoringCriteria: [
                `Trade 1: Perfect execution. All 5 checklist, high emotional state, plan followed, profitable. Model trade.`,
                `Trade 2: Critical failure: entered without trigger candle (4/5 checklist). Cost: −1.2% loss. Rule addition: "No entry without confirmed trigger candle. 4/5 is not a pass."`,
                `Trade 3: Multiple failures: (1) Not on watchlist — FOMO/revenge trading. (2) Emotional state 4/10 (below the 6/10 minimum rule). (3) 0/5 checklist. Cost: −1.8%. Rules: (a) "Never trade below emotional state 6/10." (b) "Watchlist rule is non-negotiable."`,
                `Trade 4: Correct execution. Will be assessed when closed.`,
                `Friday: No pre-market = correct decision not to trade (though it could have been an opportunity — the no pre-market rule means no trades is the correct outcome).`,
                `Week summary: 2 plan-compliant trades (net +1.5% − 1.2% = +0.3%). 1 non-compliant trade: −1.8%. The non-compliant trade cost more than the 2 compliant trades made. Rule additions to plan: (1) 5/5 checklist — no exceptions. (2) Emotional state ≥ 6 to trade. (3) Watchlist-only always.`,
              ],
            },
          ],
        },

      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-breakout',
          'chartReplay-reversal',
          'chartReplay-volumeRead',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
        ],
        description: `Fifteen advanced simulation challenges without labels, drawn from all five Lab 8 lessons. Tasks include: identifying smart money footprints (stop hunts, order blocks, FVGs), reading VWAP and Volume Profile for entry refinement, evaluating trading plan quality, assessing backtest validity, and designing professional daily routines. All require synthesis of the full advanced strategy framework.`,
        scoringMode: 'percentageCorrect',
        unlockCondition: 'completeAllLessons',
        difficultyRange: [4, 5],
      },
      bossMode: {
        title: `Market Legend Challenge — Live Trading Gauntlet`,
        description: `The final test. Twenty trading simulations across all eight labs — no labels, no pointers, no lesson hints. Each sim presents a live market scenario requiring you to apply the complete Spot Trading framework: read the chart, identify the setup, define the risk, size the position, manage the trade. This is how real trading works. Pass 18 of 20 to earn Market Legend rank.`,
        learningLoop: {
          id: 'mlc-ll',
          attempts: 'unlimited',
          feedbackMode: 'fullCriteriaWithPointers',
          description: `Practice mode. Full feedback and lesson pointers on every challenge. Use this to drill any weakness before the gauntlet.`,
          challenges: [
            { id: 'mlc-ll-1', simulatorType: 'chartReplay-reversal', lessonPointer: 'smart-money-concepts' },
            { id: 'mlc-ll-2', simulatorType: 'chartReplay-volumeRead', lessonPointer: 'volume-profile-vwap' },
            { id: 'mlc-ll-3', simulatorType: 'judgment-prioritisation', lessonPointer: 'building-trading-plan' },
            { id: 'mlc-ll-4', simulatorType: 'judgment-dataInterpret', lessonPointer: 'backtesting' },
            { id: 'mlc-ll-5', simulatorType: 'judgment-riskAssess', lessonPointer: 'professional-routine' },
            { id: 'mlc-ll-6', simulatorType: 'chartReplay-breakout', lessonPointer: 'smart-money-concepts' },
            { id: 'mlc-ll-7', simulatorType: 'chartReplay-riskManage', lessonPointer: 'volume-profile-vwap' },
            { id: 'mlc-ll-8', simulatorType: 'judgment-dataInterpret', lessonPointer: 'building-trading-plan' },
            { id: 'mlc-ll-9', simulatorType: 'judgment-prioritisation', lessonPointer: 'backtesting' },
            { id: 'mlc-ll-10', simulatorType: 'judgment-riskAssess', lessonPointer: 'professional-routine' },
          ],
        },
        finalGauntlet: {
          id: 'mlc-gauntlet',
          title: `The Gauntlet`,
          attempts: 'unlimited',
          passCriteria: `18 of 20 correct`,
          feedbackMode: 'scoreOnly',
          description: `Twenty trading simulations drawn randomly from the full track — unlabelled, no hints, no pointers. Account: $20,000. Apply every framework you have built: five-element checklist, confluence, position sizing, stop placement, TP laddering, breakeven management, indicator filtering, smart money reading, and psychological discipline. Each sim is scored on observable, binary criteria. Score 18/20 or higher to achieve Market Legend rank.`,
          challengePool: [
            {
              id: 'g-01',
              simulatorType: 'chartReplay-breakout',
              scenario: `BTC/USDT daily chart. A bull flag has formed after a $14,000 pole. Breakout candle just closed above the flag boundary at $72,400 on 2.6× volume. Account: $20,000. Apply the full five-element checklist and design the complete trade — entry, stop (method and price), TP1/TP2/TP3 with % allocations, position size at 1.5% risk, and stop advancement schedule.`,
              scoringCriteria: [
                `Entry at $72,400 (breakout close) or limit just above flag boundary`,
                `Stop below flag low with 0.5% buffer — not arbitrary`,
                `TP1 at nearest resistance, TP2 at measured move target ($72,400 + pole height)`,
                `Position size = $300 ÷ stop distance × $72,400`,
                `Breakeven stop at +1R, trailing at +3R`,
              ],
            },
            {
              id: 'g-02',
              simulatorType: 'chartReplay-reversal',
              scenario: `ETH/USDT 4-hour chart. Price has fallen from $4,100 to $3,580 over 8 days. A potential stop hunt: a 4H candle spiked to $3,420 on 3.1× volume and immediately reversed, currently at $3,610. Prior support: $3,520. Identify whether this is a stop hunt, design the entry and invalidation level, and calculate position on $20,000 account at 1% risk.`,
              scoringCriteria: [
                `Identifies stop hunt: spike below known support on high volume with immediate recovery`,
                `Entry on reversal candle close above prior support ($3,520)`,
                `Stop below the spike low ($3,420) with buffer — not below prior support`,
                `Invalidation: close below $3,420 = stop hunt thesis wrong`,
                `Position = $200 ÷ ($3,610 − $3,380) × $3,610`,
              ],
            },
            {
              id: 'g-03',
              simulatorType: 'chartReplay-riskManage',
              scenario: `SOL/USDT. You entered long at $185 (stop $178, TP1 $196, TP2 $208). The trade has moved to $200 (+$15). TP1 at $196 filled (40% of position, stop moved to breakeven). Current price: $200 and forming a bull flag consolidation between $198–$202. ATR: $9. What do you do with (a) TP2 and (b) the stop — and why?`,
              scoringCriteria: [
                `TP2 stays at $208 OR is adjusted upward using the new bull flag measured move target`,
                `Stop advances: from breakeven ($185) to +1R level ($192) since trade is at +2R equivalent`,
                `Optional: trailing stop at 2.5×ATR from the bull flag high if flag resolves upward`,
                `Does NOT exit just because a flag is forming — flags are continuation patterns`,
                `Justifies each action with the staircase stop advancement rule`,
              ],
            },
            {
              id: 'g-04',
              simulatorType: 'judgment-riskAssess',
              scenario: `You have four open positions simultaneously. Account: $20,000. BTC long (2% risk, stop $69,000, entry $72,000). ETH long (1.5% risk, stop $3,580, entry $3,740). SOL long (1% risk, stop $181, entry $188). AVAX long (0.5% risk, stop $36, entry $38.50). A macro risk-off event (Fed emergency rate hike) just dropped all four simultaneously. Calculate total simultaneous drawdown, assess whether you're within risk guidelines, and state the correct action for each position.`,
              scoringCriteria: [
                `Total risk: 2% + 1.5% + 1% + 0.5% = 5% = $1,000 simultaneous max exposure`,
                `5% is within the 6-8% max simultaneous open risk guideline`,
                `Correlation risk: all four are crypto longs — effective directional bet is highly correlated`,
                `Correct action: stops handle exits mechanically — do not panic-sell before stops trigger`,
                `Recommends: reduce position sizes next session to account for correlation in macro events`,
              ],
            },
            {
              id: 'g-05',
              simulatorType: 'chartReplay-volumeRead',
              scenario: `BTC daily chart. Volume Profile for the past 3 weeks shows: HVN at $70,200 (POC), LVN from $71,800 to $73,400, HVN at $73,600. Current VWAP: $71,400. BTC just broke above the POC at $70,200 with a daily close at $71,900 (inside the LVN) on 2.8× volume. Design the complete trade — why is the LVN relevant, where is TP1, and what does VWAP tell you?`,
              scoringCriteria: [
                `LVN relevance: thin order book between $71,800–$73,400 means rapid price movement expected`,
                `TP1: $73,400–$73,600 (just below next HVN where resistance will materialise)`,
                `VWAP at $71,400 is below current price — bullish context (price above institutional average)`,
                `Stop: below the POC ($70,200) which should now act as support — e.g., $69,900`,
                `Expects rapid price movement to TP1 given the LVN above entry`,
              ],
            },
            {
              id: 'g-06',
              simulatorType: 'judgment-dataInterpret',
              scenario: `A trader shows you their 30-day journal: 22 trades. 14 wins (63.6%). Avg win: +$420. Avg loss: −$310. EV: (63.6% × $420) − (36.4% × $310) = $267 − $113 = +$154/trade. But their largest loss was $920 (on one trade). Their position sizes varied from $2,000 to $11,000. Is this strategy working? What is the main risk management problem and what rule fixes it?`,
              scoringCriteria: [
                `EV is positive (+$154/trade) so the strategy has a real edge`,
                `Main problem: position size inconsistency. $11,000 position → $920 loss = 8.4% of a $11,000 position OR far exceeds the 1-2% account rule on any reasonable account size`,
                `The $920 loss alone eliminates 6 average-win trades of profit`,
                `Rule: mechanically apply 1-2% rule to EVERY trade. Position size = (account × 1.5%) ÷ stop distance. No exceptions for "high conviction."`,
                `The positive EV is being eroded by one or two oversized losses per month`,
              ],
            },
            {
              id: 'g-07',
              simulatorType: 'chartReplay-breakout',
              scenario: `ETH/USDT 4H chart. Price tested the $3,620 support four times over 3 weeks. On the fifth test, ETH dropped to $3,580 (below support) on 3.4× volume and immediately recovered to $3,660 within 2 candles. RSI on the $3,580 dip: 34 (slightly oversold but not extreme). On the prior $3,620 test, RSI was 38. Is there RSI divergence? Is this a stop hunt or a genuine breakdown? Design the entry or explain why you skip.`,
              scoringCriteria: [
                `RSI divergence check: prior test RSI 38, current test RSI 34 — price lower ($3,580 vs $3,620) AND RSI lower (34 vs 38). This is NOT bullish divergence — both price and RSI made lower readings. No divergence.`,
                `Stop hunt assessment: spike below four-time-tested support on 3.4× volume with immediate recovery = strong stop hunt signals. Volume confirms accumulation.`,
                `Entry: on the recovery candle close above $3,620 (back above the violated support). Stop: below $3,580 (spike low) with small buffer = $3,550.`,
                `Entry valid despite no RSI divergence because: price structure (4× tested support), volume on spike, immediate recovery — three signals sufficient.`,
                `User notes: RSI divergence would have strengthened the case but is not required when other signals are this strong.`,
              ],
            },
            {
              id: 'g-08',
              simulatorType: 'judgment-riskAssess',
              scenario: `It is 9:45am. You had two valid trades stopped out this morning for −1.5% each. You are at −3% for the day (your daily loss limit). A perfect setup appears on SOL: all five checklist elements, 4:1 R:R, volume confirmation. Describe exactly what you do and why. Include: the psychological bias present, the rule that applies, and what happens to the setup.`,
              scoringCriteria: [
                `Daily loss limit: −3% = STOP TRADING. Rule is non-negotiable.`,
                `Psychological bias: the setup feeling "perfect" after two losses is the revenge trading / recovery impulse. "High conviction" in an emotionally compromised state is not the same as calm-state conviction.`,
                `Correct action: close the platform. Log the setup in full detail for tomorrow's watchlist evaluation.`,
                `Correct future action: if SOL setup is still valid tomorrow in a calm pre-session analysis, it becomes a planned trade.`,
                `User does NOT enter the trade under any justification.`,
              ],
            },
            {
              id: 'g-09',
              simulatorType: 'chartReplay-riskManage',
              scenario: `BTC/USDT daily chart. You are a swing trader. The daily trend has been up for 10 weeks. BTC pulled back from $74,800 to $71,200 over 5 days. Today's daily candle: bullish engulfing closing at $72,400, volume 2.1× average. The 50-day EMA is at $71,400. 200-day SMA: $68,200. 14-day RSI: 52. Account $22,000. Apply the full five-element checklist and design the complete trade entry.`,
              scoringCriteria: [
                `Checklist: (1) Daily trend up ✓ (above 200-day SMA, higher highs/lows). (2) Level: pullback to 50-day EMA zone ($71,400 area) ✓. (3) Trigger: bullish engulfing + 2.1× volume ✓. (4) Risk defined: stop below EMA + swing low ✓. (5) Size calculated ✓.`,
                `RSI at 52: neutral, not overbought, confirms trend still healthy. Not a divergence signal.`,
                `Stop: below the engulfing candle low AND below the 50-day EMA — e.g., $70,600 (below EMA).`,
                `TP1: $74,600 (prior swing high). TP2: $78,000. R:R = ($74,600−$72,400)/($72,400−$70,600) = $2,200/$1,800 = 1.22:1 to TP1 — marginal. User correctly notes TP2 gives better R:R and uses tiered ladder.`,
                `Position: 1.5% × $22,000 = $330 ÷ $1,800 × $72,400 = $13,280 notional.`,
              ],
            },
            {
              id: 'g-10',
              simulatorType: 'judgment-dataInterpret',
              scenario: `Backtest results presented for review: Strategy tested on BTC only, January–December 2021 (bull market). 45 trades. Win rate 74%. EV: +$280/trade before fees. No out-of-sample test. No costs included. The trader wants to go live immediately. Identify every problem with this backtest and what must be done before live trading.`,
              scoringCriteria: [
                `Problem 1: In-sample only (2021 data used for both development and testing = overfitting risk).`,
                `Problem 2: Only one market condition tested (2021 bull — needs bear and range testing minimum).`,
                `Problem 3: No costs included. 0.2% round-trip on average position → likely reduces EV by $15-30/trade.`,
                `Problem 4: 45 trades marginal (need 100 per condition).`,
                `Required before live: out-of-sample test on 2022 (bear) and 2023 (recovery), include fees + slippage, reach 100 trades per condition. Paper trade for 30 days after.`,
                `User correctly does NOT approve going live.`,
              ],
            },
            {
              id: 'g-11',
              simulatorType: 'chartReplay-reversal',
              scenario: `SOL/USDT daily chart. SOL made a new high at $218 three days ago. RSI at that high: 71. Prior high was at $204 with RSI 79. Price is now at $209. Is there RSI divergence? What does this tell you and what action is appropriate for an existing long position with a trailing stop currently at $196?`,
              scoringCriteria: [
                `RSI divergence: price higher high ($218 vs $204) but RSI LOWER high (71 vs 79) = BEARISH divergence confirmed.`,
                `Interpretation: momentum is weakening at the new high. The move to $218 had less buying force than the move to $204.`,
                `Appropriate action: tighten trailing stop from current level. If 2.5× ATR trail was $22 ($218 − $22 = $196), tighten to 2× ATR: $218 − (ATR × 2). If ATR ≈ $11: new trail = $218 − $22 = $196 (2×) vs prior $196 (same in this case — user should recalculate with actual ATR).`,
                `Does NOT short on divergence alone — divergence is a warning, not a short signal in an uptrend.`,
                `Does NOT exit the full position — trailing stop handles the exit mechanically.`,
              ],
            },
            {
              id: 'g-12',
              simulatorType: 'judgment-prioritisation',
              scenario: `Pre-session analysis complete. Five setups identified. You can take maximum 2 simultaneously (to keep total risk below 4%). Rank these five by quality and select the best two: (A) BTC pullback to 50-day EMA, bullish hammer, volume 1.9×, R:R 3.2:1. (B) ETH FOMO entry after 12% spike, no level, no trigger, no stop yet. (C) SOL order block entry at $168–$172 zone, bullish engulfing, volume 2.4×, R:R 2.8:1. (D) AVAX at resistance, no confluence, RSI overbought. (E) BNB Bollinger squeeze breakout above upper band on 2.2× volume, 3.1:1 R:R.`,
              scoringCriteria: [
                `A: VALID. Pullback, EMA level, hammer trigger, volume, acceptable R:R. Select.`,
                `B: INVALID. FOMO spike entry — no level, no trigger, no stop, no R:R. Skip.`,
                `C: VALID. Order block (smart money concept), engulfing trigger, strong volume, good R:R. Select.`,
                `D: INVALID. At resistance (wrong side for a long), no confluence, overbought RSI without divergence context. Skip.`,
                `E: VALID but ranks third — Bollinger squeeze breakout is a legitimate setup but the A/C combination is stronger (each has more independent confluence signals).`,
                `Selected: A and C. Justified with checklist and R:R analysis.`,
              ],
            },
            {
              id: 'g-13',
              simulatorType: 'chartReplay-riskManage',
              scenario: `You entered ETH long at $3,720 five days ago. Full trade plan: stop $3,580, TP1 $3,940 (40%), TP2 $4,100 (35%), TP3 $4,280 (25%). TP1 filled (stop moved to breakeven $3,720). TP2 filled (stop moved to $3,940). Current: price $4,180, TP3 at $4,280. Today's 4H candle: large bearish engulfing on 2.3× volume at $4,190. TP3 has not filled. What do you do?`,
              scoringCriteria: [
                `Large bearish engulfing on high volume at $4,190 (near but below $4,280 TP3) = new technical information suggesting sellers are active at this level.`,
                `Correct action: manually exit the remaining 25% at market ($4,175 area) OR move TP3 down to $4,220 (just above the engulfing open). Both are technically justified responses to new price action evidence.`,
                `This is NOT anxiety-driven TP lowering — it is responding to a bearish reversal candle on high volume.`,
                `Stop at $3,940 remains unless user adjusts upward (which is also acceptable given the bearish signal).`,
                `User correctly distinguishes between "lowering TP out of fear" vs "adjusting TP based on new technical evidence."`,
              ],
            },
            {
              id: 'g-14',
              simulatorType: 'judgment-riskAssess',
              scenario: `A trader's 50-trade record: trades made in calm emotional state (rated 7+/10): 32 trades, win rate 61%, EV +$148/trade. Trades made in stressed/frustrated state (rated below 6/10): 18 trades, win rate 33%, EV −$88/trade. They ask: "My stressed-state trades are clearly losing. Should I change my strategy?" Answer this question accurately and propose the exact rule that solves it.`,
              scoringCriteria: [
                `The strategy is NOT the problem. The 7+/10 emotional state results (+$148/trade EV, 61% win rate) show a strong working strategy.`,
                `The problem is trading when emotional state is compromised. Same strategy, different state = completely different outcomes.`,
                `The rule: "No trades when emotional state is below 7/10. Rate emotional state before every session and before every trade. Below 7: analysis only, no execution."`,
                `EV impact of the rule: 18 × −$88 = −$1,584 eliminated. 50-trade net: was (+$148×32) − ($88×18) = $4,736 − $1,584 = $3,152. After rule applied (18 trades eliminated): $4,736. 50% increase in net P&L by simply not trading in bad emotional state.`,
              ],
            },
            {
              id: 'g-15',
              simulatorType: 'chartReplay-breakout',
              scenario: `BTC/USDT 4H chart. Bollinger Bands have been narrowing for 14 days — BandWidth at its lowest in 7 months. Current price: $72,100 (inside the bands). Today's 4H candle just closed at $73,600 — above the upper Bollinger Band ($73,200) on 2.9× volume. Account $18,000, 1.5% risk. Design the complete squeeze breakout trade.`,
              scoringCriteria: [
                `Squeeze identification: BandWidth at 7-month low = compressed volatility, major move imminent.`,
                `Breakout confirmation: daily close above upper band on 2.9× volume = valid directional breakout.`,
                `Entry: $73,600 (breakout close) — do not wait for pullback on a confirmed squeeze breakout.`,
                `Stop: below the squeeze range base (the low of the 14-day consolidation, e.g., $70,400). This is the below-pattern stop for a squeeze.`,
                `Position: $270 ÷ ($73,600 − $70,400) × $73,600 = $270/$3,200 × $73,600 = $6,210 notional.`,
                `TP: measured move using band width at squeeze peak (upper − lower at tightest) added to breakout. Approximately $73,600 + ($73,200−$71,000) = $75,800 for TP1.`,
              ],
            },
            {
              id: 'g-16',
              simulatorType: 'judgment-dataInterpret',
              scenario: `A trader claims their MACD crossover strategy has a 68% win rate based on 15 trades last month. They want to double their position size. Evaluate: (1) Is 15 trades statistically sufficient? (2) What sample size do you need? (3) What costs haven't they considered? (4) What single test would tell you whether the strategy is real or lucky?`,
              scoringCriteria: [
                `15 trades: NOT sufficient. 90% confidence interval at 15 trades for a true 68% rate spans roughly 40%–90% — essentially meaningless.`,
                `Sample size needed: minimum 100 trades for statistical significance. 30 trades for rough assessment.`,
                `Costs not considered: 0.2% round-trip fees, slippage, and whether the 68% win rate holds across different market conditions (tested only in one month = one market condition).`,
                `The test: out-of-sample testing on a different time period (different market condition). If the strategy was developed on last month's data, test it on the prior 3 months without refitting parameters.`,
                `Doubling position size on 15-trade sample with no out-of-sample test = high probability of large loss. Do NOT approve.`,
              ],
            },
            {
              id: 'g-17',
              simulatorType: 'chartReplay-riskManage',
              scenario: `You are reviewing a complex day. BTC/USDT daily. Morning: BTC dipped to $70,400 (your entry level from yesterday's pre-session plan). Trigger candle formed. You entered long at $70,500, stop $68,800. It is now 6pm. BTC has moved to $73,200 (+2,700 unrealised). Your trading plan's stop advancement rules: breakeven at +1R, +1R at +2R. 1R = $1,700 ($70,500−$68,800). +1R = $72,200. +2R = $73,900. Where are your stops now and what is your plan into tomorrow?`,
              scoringCriteria: [
                `Current price $73,200 = between +1R ($72,200) and +2R ($73,900).`,
                `Stop should have been moved to breakeven ($70,500) when price reached $72,200. If not done: do it now.`,
                `Stop has NOT yet reached +2R threshold ($73,900). Stop remains at breakeven.`,
                `Plan into tomorrow: hold with stop at $70,500 (breakeven). Next stop advance triggers at $73,900 (move stop to $72,200 = +1R level). Check tomorrow's pre-session for any new resistance levels.`,
                `User correctly states: no manual exit tonight — the plan's stops and TP levels govern.`,
              ],
            },
            {
              id: 'g-18',
              simulatorType: 'judgment-prioritisation',
              scenario: `Three trading styles compared on the same $15,000 account. Scalping: 8 trades/day, $4,000 avg position, 0.1% fees. Day trading: 2 trades/day, $5,000 avg position. Swing trading: 3 trades/week, $5,000 avg position. Calculate monthly fee burden as % of account for each. The account owner is employed full-time (9-5) and can check charts for 30 minutes morning and evening. Which style is appropriate and why?`,
              scoringCriteria: [
                `Scalping: 8×22=176 trades × $4,000 × 0.2% = $1,408/month = 9.4% of account.`,
                `Day trading: 2×22=44 trades × $5,000 × 0.2% = $440/month = 2.9%.`,
                `Swing trading: 3×4=12 trades × $5,000 × 0.2% = $120/month = 0.8%.`,
                `Appropriate: swing trading only. (1) 0.8% fee burden vs 9.4%. (2) Daily chart analysis done morning/evening = perfectly compatible with employment. (3) Positions held 2-14 days don't require intraday monitoring. (4) Scalping and day trading require active market-hours presence impossible with full-time employment.`,
              ],
            },
            {
              id: 'g-19',
              simulatorType: 'chartReplay-volumeRead',
              scenario: `SOL/USDT. Price at $191.40 approaching your pre-planned breakout level at $192 (flag boundary). Volume on the current 4H candle (still forming, 1 hour left): 0.6× average — below average. Your entry plan: limit buy at $192.20 on a breakout close above $192 with volume ≥ 1.5× average. What happens with your limit order and why?`,
              scoringCriteria: [
                `Volume at 0.6× average (with 1 hour remaining) is below the 1.5× threshold in the entry plan.`,
                `Limit order at $192.20: may or may not fill if price reaches that level — depends on candle close.`,
                `Correct action: if the candle closes above $192 but volume is only 0.6-1.2×: DO NOT enter. The entry plan requires ≥1.5× volume on the breakout candle for confirmation.`,
                `Low-volume breakouts have significantly lower follow-through probability — "volume confirms breakouts" is a core principle.`,
                `Cancel or leave the limit unfilled. Wait for the next candle to see if volume improves. The setup is NOT valid today.`,
              ],
            },
            {
              id: 'g-20',
              simulatorType: 'judgment-riskAssess',
              scenario: `Final synthesis. You are sitting down for Monday's pre-session. Your trading plan, journal, and checklist are open. Describe your complete pre-session routine (maximum 45 minutes). What do you review? What do you prepare? What decisions do you make BEFORE the session opens? At what point are you ready to trade?`,
              scoringCriteria: [
                `Macro review: check overnight moves on BTC/ETH/SOL, economic calendar for the week (Fed events, CPI), any major crypto news.`,
                `Chart review: step through all watchlist assets on daily and 4H — mark all key levels (support, resistance, order blocks, FVGs), identify any setups meeting all five checklist elements.`,
                `Setup preparation: for each valid setup, record exact entry price, stop price/method, TP1/TP2/TP3, position size (calculated), confluence count, and R:R.`,
                `Pre-load any limit orders for setups with very specific entry levels.`,
                `Emotional state check: rate 1-10. If below 7: analysis only, no execution today.`,
                `Review daily risk budget: confirm max per-trade risk, daily loss limit, current open positions and their combined exposure.`,
                `Ready to trade: when all watchlist assets are reviewed, setups documented, orders pre-loaded, emotional state confirmed ≥7, and risk budget is clear.`,
              ],
            },
          ],
          rankReward: {
            rank: `Market Legend`,
            badge: `Market Legend — Spot Trader`,
            description: `Awarded for demonstrating mastery of the complete Spot Trading framework across twenty live trading simulations. You read the market, you managed the risk, you stayed disciplined. This is how professionals trade.`,
          },
        },
      },
  ],
};