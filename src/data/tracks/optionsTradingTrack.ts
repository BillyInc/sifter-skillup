// ⚡ Sifter Skill_Up — OPTIONS TRADING Career Track
// Upgraded to Sifter SkillUp Simulation System v2.0
// Single track — no sub-tracks. No portfolio push. No interview mode.
import { SkillTrack } from '../skillTypes';

export const optionsTradingTrack: SkillTrack = {
  id: 'options-trading',
  category: 'trading',
  icon: '🎯',
  name: 'Options Trading',
  tagline: 'The most powerful instruments in crypto — if you understand them',
  description: 'Options let you do things that seem like magic: make money when nothing happens, insure your portfolio against crashes, bet on volatility itself. This track starts from zero and builds you into a trader who can deploy 20+ strategies without blowing up. No finance degree needed. No prior knowledge assumed.',
  difficulty: 'advanced',
  color: '#8b5cf6',
  estimatedHours: 40,
  earningPotential: 'High precision, high leverage — or steady income, depending on strategy',
  realWorldOutcomes: [
    'Read and trade options on Deribit and other crypto venues',
    'Protect a crypto portfolio against crashes using puts and collars',
    'Generate monthly income from covered calls and cash-secured puts',
    'Profit from volatility events regardless of price direction',
    'Understand Greeks and use them to manage risk',
  ],
  sections: [

    // ═══════════════════════════════════════════════════════════════════════════
    // LAB 1: OPTIONS FOUNDATIONS
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 'options-foundations',
      title: `Lab 1: What Is an Option and How Does It Work?`,
      subtitle: `Start from zero. Understand what you're actually buying before you spend a penny.`,
      lessons: [

        // ─── LESSON 1 ────────────────────────────────────────────────────────
        {
          id: 'what-is-an-option',
          title: `What Is an Option? (The Plain English Version)`,
          explanation: `Imagine you're eyeing an apartment for rent. The landlord says: "Pay me $500 today, and I'll hold this apartment for you for 3 months. At any point in those 3 months, you can rent it at the agreed price of $2,000/month — or walk away and just lose the $500."

That $500 is like an option premium. The agreed rent is like the strike price. The 3-month window is the expiry. And the key word is "can" — you have the right to rent it, but you are not forced to.

An options contract works exactly this way, but for an asset like Bitcoin or Ethereum instead of an apartment.

When you buy an option, you pay a fee (called the premium) upfront. In return, you get the right — but not the obligation — to buy or sell the asset at a pre-agreed price (the strike price) before a set date (the expiry).

Here's why this is powerful: your maximum loss is always just the premium you paid. That's it. No matter how badly the market moves against you, you cannot lose more than that upfront fee. Meanwhile, your potential gain can be many times larger.

Compare this to just buying Bitcoin. If BTC crashes 50%, you lose 50% of whatever you invested. With an option, if BTC crashes 50%, you lose only the small premium — and nothing else.

There are only two types of options. A call option gives you the right to BUY at the strike price. You buy calls when you think the price is going up. A put option gives you the right to SELL at the strike price. You buy puts when you think the price is going down — or when you want insurance against a crash.

One more thing: every option has a buyer and a seller. When you buy an option, someone else is selling it to you. The seller collects the premium immediately but takes on the obligation to fulfil the contract if the buyer wants to exercise it. Buyers have rights. Sellers have obligations.`,
          visualPrompt: `👆 See the options buyer vs seller relationship — who pays, who receives, who has rights`,
          visualType: `image`,
          visualUrl: `options-buyer-seller-diagram`,
          examples: [
            {
              contextTag: `[First-time buyer, BTC call option, understanding the basic structure, 2024]`,
              context: `Someone new to options wants to understand what they're actually getting when they pay $800 for a Bitcoin call option.`,
              scenario: `BTC is at $62,000. They pay $800 for the right to buy BTC at $65,000 any time in the next 30 days. They pay $800 upfront and that's all they can lose no matter what. If BTC goes to $75,000, they can exercise the right to buy at $65,000 — immediately worth $10,000 more than the strike — a massive profit on an $800 bet.`,
              outcome: `BTC reaches $71,000. They exercise: buy at $65,000, immediately worth $71,000. Gain: $6,000 minus the $800 premium = $5,200 profit. If BTC had crashed to $40,000 instead, they simply don't exercise the option. Their total loss: exactly $800 — the premium. No more.`,
            },
            {
              contextTag: `[Portfolio holder, ETH put option, portfolio insurance, 2022]`,
              context: `An ETH investor has 10 ETH worth $30,000. They're worried about a market crash and want to protect themselves — like buying insurance.`,
              scenario: `ETH at $3,000. They pay $150 per ETH in put option premiums ($1,500 total) for the right to SELL 10 ETH at $2,700 over the next 60 days. Their floor is now $2,700 — even if ETH crashes to $500, they can still sell at $2,700.`,
              outcome: `ETH crashes to $1,800 (−40%). Without the puts: portfolio falls from $30,000 to $18,000 — a $12,000 loss. With the puts: they sell 10 ETH at $2,700 = $27,000. Minus $1,500 premium paid = $25,500 recovered. The $1,500 in "insurance premiums" saved them $10,500. The puts worked exactly like car insurance — a small regular payment that paid off when disaster struck.`,
            },
            {
              contextTag: `[Option seller, covered call, income strategy, BTC, 2023]`,
              context: `A Bitcoin holder wants to earn income on their holdings without selling. They become an option seller — collecting premium from others who want to buy calls.`,
              scenario: `BTC at $28,000. They own 1 BTC and sell a $32,000 call option for a $400 premium. They collect $400 immediately. If BTC stays below $32,000, the option expires worthless and they keep the $400 — free money on their existing BTC. If BTC exceeds $32,000, they have to sell their BTC at $32,000 — missing the gains above that level, but they still made $400 plus the appreciation from $28,000 to $32,000.`,
              outcome: `BTC ends the month at $29,500. The call expires worthless. The seller keeps $400. They sell another call next month. Over 6 months at $400/month: $2,400 of income collected — a 14.3% annualised yield on their BTC. This is how options sellers generate consistent income.`,
            },
          ],
          keyTakeaway: `An option gives you the RIGHT (not obligation) to buy or sell an asset at a pre-agreed price before a set date. You pay a premium upfront — that's your maximum loss. Calls are for bullish bets. Puts are for bearish bets or insurance. The seller collects the premium and takes on the obligation.`,
          guidedPractice: [
            {
              question: `You pay $600 for a BTC call option with a $70,000 strike, expiring in 30 days. BTC crashes to $45,000 by expiry. What is your total loss?`,
              options: [
                `A — $25,000 (the difference between $70,000 and $45,000)`,
                `B — $600 (just the premium you paid)`,
                `C — $0 — call options can never lose money`,
                `D — $600 plus the $25,000 drop in BTC`,
              ],
              correct: 1,
              hint: `When BTC is below your strike ($70,000) at expiry, your option expires worthless. But what's the most you can ever lose on a bought option?`,
              explanation: `B is correct. When you BUY an option, your maximum loss is always the premium you paid — in this case $600. At $45,000, the $70,000 strike is way out of the money. You simply choose not to exercise and let it expire. You lose the $600 and nothing more. This is the core advantage of buying options: your downside is always limited to what you paid upfront, while a spot BTC buyer would have lost $25,000 on that same crash.`,
            },
            {
              question: `What is the difference between a call option and a put option?`,
              options: [
                `A — Calls are for short-term trading; puts are for long-term investing`,
                `B — A call gives you the right to BUY at the strike price; a put gives you the right to SELL`,
                `C — Calls are cheaper than puts`,
                `D — There is no difference — they work the same way`,
              ],
              correct: 1,
              hint: `Think about the direction you're betting on. Calls profit when price goes up. Puts profit when price goes down.`,
              explanation: `B is correct. A call option gives you the RIGHT to BUY the asset at the strike price — useful when you think price is going up. A put option gives you the RIGHT to SELL the asset at the strike price — useful when you think price is going down or when you want to protect against a crash. Think of it this way: "call" = calling the asset to you (buying it). "Put" = putting the asset away (selling it).`,
            },
            {
              question: `An option seller receives $500 premium for selling a BTC call. BTC later surges to $90,000. Who made the better deal?`,
              options: [
                `A — The seller — they already got their $500 and can't lose more`,
                `B — The buyer — they paid $500 for an option that may now be worth tens of thousands`,
                `C — They made the same — options are always zero-sum`,
                `D — Neither — options are just speculation`,
              ],
              correct: 1,
              hint: `If BTC is at $90,000 and the buyer can exercise the right to buy at, say, $70,000, what is the intrinsic value of that option?`,
              explanation: `B is correct. If the strike was $70,000, the buyer paid $500 for the right to buy BTC at $70,000. With BTC at $90,000, that right is worth $20,000 ($90k - $70k). The buyer turned $500 into something worth $20,000. The seller collected $500 but is now obligated to sell BTC at $70,000 when it's worth $90,000 — a $19,500 net loss. This is the risk of being an option seller: you get certain, limited income, but if the market moves violently against you, the losses can be large.`,
            },
            {
              question: `You own 5 ETH worth $15,000 total. You're worried about a crash. Which option strategy acts like "insurance" for your ETH?`,
              options: [
                `A — Buy ETH call options`,
                `B — Sell ETH call options`,
                `C — Buy ETH put options`,
                `D — Sell ETH put options`,
              ],
              correct: 2,
              hint: `Insurance pays you when something bad happens. What option makes money when the ETH price falls?`,
              explanation: `C is correct. Buying put options is exactly like buying insurance for your ETH. If ETH crashes, your put options increase in value — offsetting the loss on your ETH holdings. You pay a premium for this protection, just like an insurance premium. If ETH rises instead, the puts expire worthless (like insurance you paid for but didn't need to use) — and your ETH is worth more, so you come out fine either way.`,
            },
            {
              question: `What does "expiry" mean in options trading?`,
              options: [
                `A — The price at which you can buy or sell the asset`,
                `B — The date after which the option no longer exists and any unexercised rights are gone forever`,
                `C — The total profit you made on the option`,
                `D — The fee you pay to enter the trade`,
              ],
              correct: 1,
              hint: `Think about food with an expiry date — what happens to it after that date?`,
              explanation: `B is correct. An option's expiry (also called expiration date) is the deadline by which you must exercise your right — or lose it forever. After the expiry date, the option becomes worthless. This is one of the most important concepts for beginners: unlike stocks, which you can hold indefinitely, options have a limited life. A call option expiring worthless at $0 is a total loss of your premium, even if the asset eventually reaches your target price the following week.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You have $5,000 to invest in Bitcoin. You are very bullish and expect BTC (currently $62,000) to reach $75,000 within 60 days.

You have two choices:

Option A: Buy $5,000 worth of BTC spot (approximately 0.0806 BTC at $62,000).
Option B: Buy BTC call options — specifically $65,000 calls expiring in 60 days, at $800 per contract. With $5,000 you can buy 6 contracts.

Answer the following:
1. If BTC reaches $75,000 — what is Option A's profit? What is Option B's profit?
2. If BTC drops to $50,000 — what is Option A's loss? What is Option B's loss?
3. Which option has higher potential profit? Which has lower potential loss?`,
              scoringCriteria: [
                `Option A at $75,000: 0.0806 BTC × $75,000 = $6,045. Profit: $1,045.`,
                `Option B at $75,000: Each $65,000 call is worth $10,000. 6 contracts × $10,000 = $60,000. Minus $4,800 cost = $55,200 profit.`,
                `Option A at $50,000: 0.0806 BTC × $50,000 = $4,030. Loss: $970.`,
                `Option B at $50,000: All 6 calls expire worthless. Loss: $4,800 (the full premium paid).`,
                `Higher potential profit: Options (B). Lower maximum loss: Spot (A) loses $970 vs options losing $4,800. User correctly identifies the leverage vs risk trade-off.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `A friend describes this scenario to you:

"I bought an ETH call option. I paid $250 for the right to buy ETH at $3,500. ETH is currently at $3,200. The option expires in 21 days."

Answer these three questions:
1. Is this option currently "in the money" or "out of the money"? (In the money = the strike is already beaten by current price. Out of the money = current price hasn't reached the strike yet.)
2. What does ETH need to reach for this option to break even at expiry? (Hint: the breakeven = strike + premium.)
3. If ETH reaches $4,000 at expiry, what is the profit on this option?`,
              scoringCriteria: [
                `Q1: Out of the money — ETH at $3,200 is below the $3,500 strike. The option has no intrinsic value yet. It only has time value.`,
                `Q2: Breakeven = $3,500 strike + $250 premium = $3,750. ETH needs to reach $3,750 to break even.`,
                `Q3: At $4,000: intrinsic value = $4,000 - $3,500 = $500. Minus $250 premium = $250 profit per contract.`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `Three people describe their situations. Match each person to the option strategy that fits them best.

Person A: "I own 2 BTC. The market has been incredible lately — I'm up a lot. I'm nervous a crash is coming but I really don't want to sell because of taxes."

Person B: "I have $2,000 and I think SOL is going to make a massive move upward in the next month. I want as much upside as possible with my $2,000."

Person C: "I own 10 ETH and I'm happy holding long-term. I just want to earn a little extra income on my holdings each month."

Available strategies:
• Buy call options
• Buy put options (protective puts)
• Sell covered calls

Match each person to one strategy and explain why in one sentence each.`,
              scoringCriteria: [
                `Person A → Buy put options. Puts act as insurance — they protect against a crash without forcing a sale of the BTC.`,
                `Person B → Buy call options. Calls provide maximum upside leverage on a bullish directional bet with defined maximum loss.`,
                `Person C → Sell covered calls. Selling calls on owned ETH generates monthly premium income without needing to sell the ETH.`,
              ],
            },
          ],
        },

        // ─── LESSON 2 ────────────────────────────────────────────────────────
        {
          id: 'calls-and-puts-deep-dive',
          title: `Calls and Puts — Seeing the Payoff in Plain Terms`,
          explanation: `By now you know the concept. Let's make it concrete with numbers and pictures.

A call option in plain terms: You pay $1,000 today for the right to buy BTC at $65,000 anytime in the next 30 days. Right now BTC is at $63,000 — so you're betting it goes up. If BTC reaches $75,000, your right to buy at $65,000 is worth $10,000. You paid $1,000 and now have something worth $10,000. You don't even need to actually buy BTC — you can sell the option itself for $10,000 and pocket the $9,000 profit.

If BTC only reaches $65,500 by expiry, your option is barely worth $500. You lose $500 of your $1,000. If BTC never exceeds $65,000, the option expires worthless. You lose the full $1,000.

Moneyness — this just describes where the current price is relative to the strike. In the money (ITM): the option already has value right now. A $60,000 call when BTC is at $65,000 is ITM — you could exercise right now and immediately profit. At the money (ATM): the strike is very close to the current price. The option could go either way. Out of the money (OTM): the price hasn't reached the strike yet. A $70,000 call when BTC is at $65,000 is OTM — BTC needs to rise another $5,000 just to reach the strike.

OTM options are cheaper (because they're less likely to pay off). ITM options are more expensive (they already have value). Beginners often buy cheap OTM options hoping for a jackpot — this works sometimes, but OTM options expire worthless most of the time.

For put options, the logic flips. A $60,000 put when BTC is at $65,000 is OTM (BTC hasn't fallen to $60,000 yet). A $60,000 put when BTC is at $55,000 is ITM (BTC has gone below $60,000, so you can sell at the higher $60,000 strike).

The payoff picture: for calls, imagine a hockey stick shape. Below the strike: flat line (total premium lost). Above the strike: the line rises. The higher BTC goes, the more you make. For puts, the same stick but pointing the other way.`,
          visualPrompt: `👆 See the call payoff diagram and the put payoff diagram side by side`,
          visualType: `image`,
          visualUrl: `call-put-payoff-diagrams`,
          examples: [
            {
              contextTag: `[Trader learning moneyness, BTC options chain, three strike comparison]`,
              context: `A new trader opens a BTC options chain with BTC at $67,000 and needs to understand the difference between buying ITM, ATM, and OTM calls.`,
              scenario: `Three call options available: $60,000 ITM call costs $8,200. $67,000 ATM call costs $2,400. $75,000 OTM call costs $380. All expire in 30 days. The trader has $2,400 to spend.`,
              outcome: `They can buy: 1× ATM call OR 6× OTM calls. If BTC reaches $73,000: ATM call worth $6,000 profit ($6,000 - $2,400). Six OTM calls: the $75,000 strike hasn't been reached — all 6 expire worthless. The "cheaper" OTM option actually required a bigger move. The ATM option was easier to profit from. Lesson: cheap OTM options need bigger moves to pay off. ATM options cost more but activate sooner.`,
            },
            {
              contextTag: `[Put buyer, ETH, understanding put payoff direction, bearish thesis, 2023]`,
              context: `A trader believes ETH will fall significantly after a major token unlock. They want to profit from the decline.`,
              scenario: `ETH at $2,100. Trader buys a $2,000 put for $90. If ETH falls below $2,000, the put starts gaining value. Break-even: $2,000 - $90 = $1,910. At $1,500, the put is worth $500 ($2,000 - $1,500). Profit: $500 - $90 = $410.`,
              outcome: `ETH falls to $1,650 after the token unlock. Put is now worth $350. Profit: $350 - $90 = $260. The trader didn't need to short ETH (which requires borrowing and carries unlimited risk). They simply bought a put for $90 and capped their loss at exactly that amount while profiting from the decline.`,
            },
            {
              contextTag: `[New trader, call option exercise vs sell, understanding both exits]`,
              context: `A trader bought an ETH call at $3,000 strike for $150. ETH is now at $3,600. They don't know whether to exercise the option or sell it.`,
              scenario: `Call is now worth $640 on the market (intrinsic $600 + some remaining time value). Option: Exercise (actually buy ETH at $3,000 using the option, then sell it immediately at $3,600 = $600 profit - $150 premium = $450 net). OR sell the option itself for $640 - $150 = $490 profit.`,
              outcome: `Selling the option generates $490 — slightly more than exercising ($450), because the option still has some time value left. The lesson: in almost every case, it's better to sell the option itself rather than exercise it. The time value is extra money you'd leave on the table by exercising early. Most options traders never actually exercise — they buy and sell the options themselves.`,
            },
          ],
          keyTakeaway: `Calls profit when price goes UP beyond the strike. Puts profit when price goes DOWN below the strike. ITM options already have value. ATM options are at the current price. OTM options need a bigger move to profit. In most cases, sell the option rather than exercising it — you keep the remaining time value.`,
          guidedPractice: [
            {
              question: `BTC is at $67,000. Which of these calls is "in the money" (ITM)?`,
              options: [
                `A — $72,000 call (strike is above current price)`,
                `B — $65,000 call (strike is below current price — you could already buy at $65k when BTC is worth $67k)`,
                `C — $67,000 call (strike equals current price)`,
                `D — A call option is never in the money until expiry`,
              ],
              correct: 1,
              hint: `In the money for a call means the current price is already above the strike. Which strike is below $67,000?`,
              explanation: `B is correct. A $65,000 call is "in the money" because BTC ($67,000) is already above the strike ($65,000). If you exercised right now, you'd buy BTC at $65,000 and it's immediately worth $67,000 — a $2,000 gain per contract. That $2,000 is called "intrinsic value." A $72,000 call (option A) is out of the money — BTC needs to reach $72,000 first. A $67,000 call (option C) is "at the money" — right at the current price.`,
            },
            {
              question: `You buy an ETH put with a $3,000 strike for $120 premium. ETH falls to $2,600 at expiry. What is your profit?`,
              options: [
                `A — $280 ($3,000 - $2,600 = $400 intrinsic, minus $120 premium)`,
                `B — $400 (intrinsic value only)`,
                `C — $120 (the premium you paid back)`,
                `D — $0 — puts don't profit when ETH goes down`,
              ],
              correct: 0,
              hint: `Put profit = strike price minus current price minus premium paid. At $2,600 with a $3,000 strike, you can sell at $3,000 when ETH is worth $2,600.`,
              explanation: `A is correct. At $2,600, the put has intrinsic value: $3,000 (strike) - $2,600 (current) = $400. You paid $120 premium. Net profit: $400 - $120 = $280. The put gives you the right to sell at $3,000 when ETH is only worth $2,600 — a $400 advantage. Minus what you paid for that right = $280 net gain. This is exactly how put options work as both a speculative tool and portfolio insurance.`,
            },
            {
              question: `You paid $500 for an OTM BTC call. BTC moves in the right direction but only reaches your strike at expiry — not above it. What happens?`,
              options: [
                `A — You break even — you can buy at the strike price`,
                `B — You profit by the amount BTC moved`,
                `C — The option expires worthless. You need the price to go ABOVE the strike by more than the premium to profit.`,
                `D — You automatically receive the intrinsic value`,
              ],
              correct: 2,
              hint: `At exactly the strike price, the call has zero intrinsic value. You'd be buying at $X when the market price is also $X — no advantage.`,
              explanation: `C is correct. If BTC lands exactly at your strike at expiry, the call has zero intrinsic value — exercising would mean buying at $X when you could just buy in the open market for $X. The option expires worthless and you lose the $500 premium. You need BTC to go ABOVE the strike by more than the premium you paid (the breakeven) to make money. This is why breakeven = strike + premium for calls. A beginner mistake: cheering when BTC reaches the strike, not realising they're still at a loss.`,
            },
            {
              question: `Why might you sell an option that's in profit rather than exercise it?`,
              options: [
                `A — Because exercising is not allowed on crypto options`,
                `B — Because selling the option captures both the intrinsic value AND any remaining time value. Exercising early only gives you the intrinsic value.`,
                `C — Because you save on taxes by selling`,
                `D — There is no reason — always exercise`,
              ],
              correct: 1,
              hint: `An option has two components: intrinsic value (immediate profit if exercised) and time value (the value of remaining time before expiry). Exercising only captures one.`,
              explanation: `B is correct. An in-the-money option is worth: intrinsic value (what you'd get if you exercised) + time value (the extra premium for remaining time until expiry). If you exercise, you get only the intrinsic value. If you sell the option, you get intrinsic value + time value. Selling is almost always better. The only exception: deep-in-the-money options near expiry when the time value has mostly decayed to zero anyway. As a practical rule: sell the option, don't exercise it.`,
            },
            {
              question: `BTC is at $65,000. Which option costs more — a $60,000 call (ITM by $5,000) or a $70,000 call (OTM by $5,000)?`,
              options: [
                `A — The $70,000 call — it has a higher strike price`,
                `B — The $60,000 call — it's already in the money and has immediate value`,
                `C — They cost the same`,
                `D — It depends on the expiry date only`,
              ],
              correct: 1,
              hint: `An ITM option has intrinsic value right now. An OTM option has zero intrinsic value. Which would you pay more for?`,
              explanation: `B is correct. The $60,000 call is ITM — BTC ($65,000) is already $5,000 above the strike. This option has $5,000 of intrinsic value baked in right now. You'd pay at least $5,000 just to own it, plus some time value on top. The $70,000 call is OTM — BTC needs to rise $5,000 just to reach the strike. It has zero intrinsic value. It's cheaper because it's less likely to pay off. Higher strike calls (for the same expiry) are always cheaper because they need a bigger move. Lower strike calls are always more expensive because they're closer to or already in the money.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USD daily chart. BTC is at $64,000 and has been bouncing between $61,000 and $66,000 for 3 weeks.

You have $2,000 to spend on call options expiring in 30 days. Three choices:

Option A: $62,000 ITM call — costs $2,800 (you can't afford this — it's over budget)
Option B: $64,000 ATM call — costs $1,800
Option C: $68,000 OTM call — costs $350 (you could buy 5 of these)

Answer:
1. Which option(s) can you buy within your $2,000 budget?
2. If BTC moves to $69,000: calculate profit for option B (1 contract) and option C (5 contracts)
3. If BTC only moves to $65,500: which option profits more — B or C (5 contracts)?`,
              scoringCriteria: [
                `Q1: Option B ($1,800) fits in budget. Option C × 5 ($1,750) also fits. Option A does not.`,
                `Q2: At $69,000 — Option B: worth $5,000 ($69k-$64k), profit $5,000-$1,800 = $3,200. Option C (5×): each worth $1,000 ($69k-$68k), 5 × $1,000 = $5,000 - $1,750 = $3,250.`,
                `Q3: At $65,500 — Option B: worth $1,500, profit $1,500-$1,800 = -$300 (small loss). Option C (5×): $68,000 strike not reached, all 5 expire worthless. Loss: $1,750. Option B wins clearly at $65,500.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Look at these four options on ETH (ETH currently at $3,100):

Option 1: $2,800 call — costs $340 (ITM)
Option 2: $3,100 call — costs $180 (ATM)
Option 3: $3,500 call — costs $45 (OTM)
Option 4: $2,800 put — costs $55 (OTM)
Option 5: $3,100 put — costs $175 (ATM)
Option 6: $3,500 put — costs $380 (ITM)

Answer:
1. Which calls are ITM, ATM, and OTM?
2. Which puts are ITM, ATM, and OTM?
3. You are moderately bullish on ETH. Which call gives you the best balance of cost vs. probability of profit?`,
              scoringCriteria: [
                `Call moneyness: Option 1 ($2,800) = ITM (strike below $3,100). Option 2 ($3,100) = ATM. Option 3 ($3,500) = OTM (strike above $3,100).`,
                `Put moneyness: Option 4 ($2,800) = OTM (strike below $3,100 — ETH hasn't fallen to $2,800). Option 5 ($3,100) = ATM. Option 6 ($3,500) = ITM (strike above $3,100 — you could sell ETH at $3,500 when market is $3,100).`,
                `Best call for moderate bullish: Option 2 ($3,100 ATM, $180). Moderate conviction = ATM. OTM ($45) requires a big move. ITM ($340) is expensive. ATM balances cost and probability.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `You bought a BTC call option 10 days ago. Here is your position today:

Strike: $66,000
Premium paid: $1,400
Expiry: 20 days from today
Current BTC price: $70,800
Current option market price: $5,200

Calculate:
1. Your current intrinsic value (what you'd get if you exercised right now)
2. Your current time value (the extra value above intrinsic in the option's market price)
3. Your unrealised profit if you sold the option right now
4. Your profit if you exercised the option instead of selling it

Which is higher — selling or exercising? By how much?`,
              scoringCriteria: [
                `Intrinsic value: $70,800 - $66,000 = $4,800`,
                `Time value: $5,200 (market price) - $4,800 (intrinsic) = $400`,
                `Profit from selling: $5,200 - $1,400 = $3,800`,
                `Profit from exercising: $4,800 - $1,400 = $3,400`,
                `Selling is higher by $400 (the time value). User correctly concludes: always sell rather than exercise when time value remains.`,
              ],
            },
          ],
        },

        // ─── LESSON 3 ────────────────────────────────────────────────────────
        {
          id: 'strike-expiry-premium',
          title: `Strike, Expiry, and Premium — The Three Dials You Control`,
          explanation: `Every option has three settings you choose when you buy it. Getting these right is the difference between a good trade and throwing money away.

The strike price is your target. It's the price at which you can buy (call) or sell (put) the asset. For a call, pick too low a strike and you overpay for immediate value. Pick too high and you need a massive move just to break even. The rule of thumb: if you're moderately bullish, buy a call at or slightly above the current price (ATM or slightly OTM). If you're very bullish and expecting a big rally, buy a more OTM call at your price target.

The expiry date is your time limit. Every day that passes, options lose a little value just from time passing — this is called time decay, and it accelerates as expiry approaches. A 7-day option decays dramatically in the final days. A 90-day option decays more slowly.

The rule for beginners: always give your thesis more time than you think you need. If you believe BTC will rally in 2 weeks, buy a 45-day option — not a 14-day one. The extra time costs a little more premium, but it saves you from the heartbreak of being right about the direction but wrong about the timing.

The premium is the price you pay for the option — and it's driven by three things. First: intrinsic value (if the option is already in the money, the premium includes that). Second: time value (more time = more expensive). Third: implied volatility (if the market is nervous and expects big moves, all options get more expensive — even if the asset isn't moving right now).

The combination of these three dials creates the trade-off: high strike + short expiry = cheap but requires a big, fast move. Low strike + long expiry = expensive but has a high chance of ending in profit. The skill is matching these dials to your specific thesis and timeline.`,
          visualPrompt: `👆 See how strike, expiry, and IV each independently affect option premium`,
          visualType: `image`,
          visualUrl: `three-dials-premium-drivers`,
          examples: [
            {
              contextTag: `[New trader, matching strike to thesis, BTC, realistic example]`,
              context: `A trader has a clear thesis: Bitcoin's ETF inflows will push BTC from $63,000 to $70,000 over the next 5-7 weeks. They need to pick the right strike.`,
              scenario: `Options available: $63,000 ATM call (35-day) for $2,200. $68,000 OTM call (35-day) for $850. $72,000 OTM call (35-day) for $320. Their target is $70,000 in 5-7 weeks.`,
              outcome: `The best match: $68,000 call at $850. Why? Their target is $70,000. The $68,000 strike is right below that — if BTC hits $70,000, the $68,000 call is worth $2,000 ($70k-$68k), giving $1,150 profit on an $850 cost. The $72,000 call requires BTC to exceed their own target to profit — a poor match. The $63,000 ATM call at $2,200 gives more profit at $70,000 but costs 2.6× more and most of that premium is intrinsic value they're paying for upfront. The OTM call near the target is the best fit.`,
            },
            {
              contextTag: `[Beginner expiry mistake, ETH, timing miscalculation, costly lesson]`,
              context: `A beginner is bullish on ETH and buys 7-day calls because they're "so much cheaper." They're right about the direction — but get the timing wrong.`,
              scenario: `ETH at $3,000. They buy $3,100 OTM calls expiring in 7 days for $45 each. ETH rises to $3,080 by day 5 — moving in the right direction, but slowly.`,
              outcome: `Day 7: ETH reaches $3,120 — above the $3,100 strike. The call should have some value. But it's only worth $22 per contract (very little intrinsic value, almost zero time value left). They paid $45. Loss: $23 per contract. ETH moved in the right direction, but 7 days wasn't enough for a full move. Had they bought 30-day calls for $110 each, the same $3,120 ETH by day 7 would still leave 23 days of time value — each call would be worth about $95, a small loss instead of a major one. More time = more forgiving.`,
            },
            {
              contextTag: `[Experienced trader, IV timing, buying cheap before an event, BTC]`,
              context: `An experienced trader understands that option premiums get expensive right before major events. They buy options early — when IV (and thus premium) is still low.`,
              scenario: `3 weeks before the Bitcoin halving, BTC at $58,000, IV is at 28th percentile (historically cheap). The trader buys 35-day $60,000 ATM calls for $1,800 each. One week later, IV spikes as the halving approaches. The same calls now cost $3,200 — but the trader bought early.`,
              outcome: `Before the halving, the trader sells their calls for $3,200 each — a $1,400 profit per contract purely from IV expansion, even before BTC moved significantly. They bought the option cheap and sold it expensive. This is one of the most powerful applications of understanding option pricing: time your premium purchases when IV is low, before everyone else starts bidding up option prices.`,
            },
          ],
          keyTakeaway: `Strike: match to your price target. Expiry: give yourself more time than you think you need — minimum 3-4 weeks for any directional thesis. Premium is driven by intrinsic value + time + implied volatility. Buy when IV is low. The biggest beginner mistake: buying cheap short-dated OTM options that need a massive move in very little time.`,
          guidedPractice: [
            {
              question: `BTC is at $65,000. You believe it will reach $72,000 in 6 weeks. Which combination is most appropriate?`,
              options: [
                `A — $80,000 strike, 7-day expiry (cheap OTM lottery ticket)`,
                `B — $72,000 strike, 45-day expiry (your exact target with plenty of time)`,
                `C — $65,000 strike, 7-day expiry (ATM but barely any time)`,
                `D — $50,000 strike, 90-day expiry (deep ITM, very expensive)`,
              ],
              correct: 1,
              hint: `Match the strike to your target price. Match the expiry to your timeline — and give extra time as a buffer.`,
              explanation: `B is correct. Your target is $72,000 and you expect a 6-week move — the $72,000 strike at 45-day expiry matches both the price target and gives a week of extra time beyond your expected timeline. If BTC reaches $72,000 at day 35, your option is at the money with 10 days remaining — still valuable. Option A needs BTC to go $15,000 past current price in 7 days — nearly impossible. Option C has the right strike but only 7 days — timing risk is extreme. Option D is so far ITM it's extremely expensive and doesn't add value.`,
            },
            {
              question: `Two options, both on BTC at $65,000 with a $68,000 strike: one expires in 7 days, one in 90 days. Which is more expensive and why?`,
              options: [
                `A — The 7-day option is more expensive — short-term options are rare`,
                `B — The 90-day option is more expensive — more time means more chances for BTC to reach $68,000`,
                `C — They cost the same — same strike, same asset`,
                `D — Neither — options are priced the same regardless of expiry`,
              ],
              correct: 1,
              hint: `More time = more opportunity for the price to move in your favour. Would you pay more for 7 days of lottery tickets or 90 days?`,
              explanation: `B is correct. The 90-day option gives BTC 90 days to move from $65,000 to $68,000 (and beyond). The 7-day option gives only 7 days. Longer time = higher probability of reaching the strike = more valuable option = higher premium. This time premium is called "extrinsic value" or "time value." As the 90-day option approaches expiry, its time value decays — like ice melting. By the final days before expiry, even an option with 90 days of life costs as little as a 7-day option once did.`,
            },
            {
              question: `You're choosing between a 30-day option costing $800 and a 60-day option costing $1,100. Your thesis needs 5 weeks to play out. Which do you buy?`,
              options: [
                `A — The 30-day — it's cheaper and 4 weeks should be enough`,
                `B — The 60-day — it gives a one-week buffer beyond your thesis timeline and the extra $300 is worth the insurance`,
                `C — Buy both to hedge`,
                `D — Wait until there are only 10 days left so options are cheapest`,
              ],
              correct: 1,
              hint: `Your thesis needs 5 weeks. The 30-day option gives 4.3 weeks. What happens if your thesis plays out on week 5 instead of week 4?`,
              explanation: `B is correct. If your thesis plays out in exactly 5 weeks, the 30-day option may have already expired. Even if it expires during week 5 with BTC having moved in the right direction, you could still lose if your timing was off by a few days. The extra $300 for the 60-day option is insurance against timing risk. One of the most common options losses isn't from picking the wrong direction — it's from being right about direction but wrong about timing, with the option expiring before the move completes.`,
            },
            {
              question: `Why do options typically get more expensive right before a major event (like a halving or regulatory decision)?`,
              options: [
                `A — Exchanges charge higher fees during events`,
                `B — Because implied volatility (IV) rises as uncertainty increases — everyone is buying options to bet on or hedge against the event, bidding up prices`,
                `C — Options always get more expensive over time`,
                `D — The strike prices change during events`,
              ],
              correct: 1,
              hint: `Think about what happens to insurance prices when a hurricane is in the forecast. The same logic applies to options before uncertain events.`,
              explanation: `B is correct. Implied volatility (IV) is the options market's measure of expected uncertainty. When a major event is approaching — a halving, a regulatory decision, an ETF approval — nobody knows what will happen. Everyone wants to bet on or protect themselves from the outcome. This flood of demand for options drives up their prices, even if the underlying asset hasn't moved yet. Savvy traders buy options BEFORE IV spikes (when they're cheap) and sell AFTER IV has risen (when they're expensive). This is one of the most repeatable edges in options trading.`,
            },
            {
              question: `A friend says: "I buy the cheapest options I can find — the ones expiring in 3-5 days that cost only $10-30 each. I buy 50 at a time." What is the main problem with this strategy?`,
              options: [
                `A — Exchange rules limit purchases to 10 options at a time`,
                `B — Short-dated OTM options have brutal time decay and need a huge, fast move in days — they expire worthless the vast majority of the time`,
                `C — It's a great strategy — cheap options have high upside`,
                `D — You can't buy options that expire in less than 7 days`,
              ],
              correct: 1,
              hint: `What needs to happen for a $15 option expiring in 4 days to become worth $500? How often does that happen?`,
              explanation: `B is correct. Very short-dated OTM options are cheap because they have almost no chance of paying off. They need an enormous price move in a matter of days. Options also experience "gamma" acceleration — in the final days before expiry, every day that passes removes a significant portion of remaining value. Buying 50 × $15 options sounds like cheap leverage, but it's more like buying 50 lottery tickets. The probability of profit is very low, and the losses are frequent and complete. Professional traders almost never buy options with less than 14-21 days remaining unless they have a very specific, imminent catalyst.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-breakout`,
              scenario: `ETH/USD chart. ETH is at $3,200, trending upward after 3 weeks of consolidation. Volume picked up yesterday — a potential breakout signal. IV percentile: 26% (options are relatively cheap right now).

You are bullish. Your target: ETH at $3,600 within 4-6 weeks.

Design your options trade. Available calls (35-day expiry):
• $3,200 ATM call: $210
• $3,400 OTM call: $110
• $3,600 OTM call: $58
• $3,800 OTM call: $22

You have $500 to spend.

Questions:
1. Which strike best matches your $3,600 price target?
2. How many contracts of that strike can you buy with $500?
3. What is your profit if ETH reaches exactly $3,600?
4. Why is the 35-day expiry more appropriate than a 14-day expiry for a "4-6 week" thesis?`,
              scoringCriteria: [
                `Best strike: $3,600 call (matches price target exactly). User may also argue for $3,400 (closer, higher probability) — acceptable with reasoning.`,
                `$3,600 call at $58: $500 / $58 = 8 contracts (8 × $58 = $464 within budget).`,
                `Profit at $3,600: $3,600 strike = exactly ATM at expiry. Intrinsic value = $0. The call expires nearly worthless. User should catch this: to profit, ETH must EXCEED the strike + premium. Breakeven = $3,600 + $58 = $3,658. At exactly $3,600, 8 contracts × $0 = $0, minus $464 spent = $464 loss. Better choice: $3,400 call at $110 — at $3,600, intrinsic = $200, profit = ($200 - $110) × contracts.`,
                `35-day vs 14-day: Thesis is 4-6 weeks. 14-day option expires before the thesis plays out in most scenarios. 35-day gives a buffer even if the move takes the full 6 weeks.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are comparing these two options traders and their setups. Identify who has the better approach and why.

Trader A: BTC at $64,000. Buys $80,000 OTM calls expiring in 10 days for $25 each. Buys 40 contracts ($1,000 total). Thesis: "BTC feels like it wants to go higher."

Trader B: BTC at $64,000. Buys $68,000 OTM calls expiring in 35 days for $900 each. Buys 1 contract. Thesis: "Major BTC ETF review announced in 3 weeks. Based on previous similar events, BTC moved 10-15% within 2 weeks of announcement. $68,000 is my specific price target."

For each trader, identify: (1) whether the strike is appropriate, (2) whether the expiry is appropriate, (3) whether the thesis is specific enough to justify the trade.`,
              scoringCriteria: [
                `Trader A — Strike $80,000 (25% above current) with 10-day expiry: completely inappropriate. BTC needs to surge 25% in 10 days. This has almost never happened. 40 contracts of lottery tickets.`,
                `Trader A — Thesis "feels like it wants to go higher" is not a thesis. No catalyst, no target, no timeline.`,
                `Trader B — Strike $68,000 (6.25% OTM) with 35-day expiry: appropriate. Gives 2 weeks beyond the expected event for the move to materialise. Strike matches price target.`,
                `Trader B — Thesis is specific: named catalyst, historical data cited, specific price target. This is how professional trade plans are constructed.`,
                `Trader B has the clearly superior approach on all three criteria.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `BTC is at $66,000. Here is the options chain for two expiry dates:

14-day expiry:
• $66,000 ATM call: $1,200
• $70,000 OTM call: $280
• $75,000 OTM call: $65

35-day expiry:
• $66,000 ATM call: $2,100
• $70,000 OTM call: $780
• $75,000 OTM call: $240

For each option, calculate:
1. The breakeven price at expiry (strike + premium)
2. The extra premium you pay for the 35-day vs 14-day option at the same strike (the "cost of extra time")

Then answer: for a trader with a $70,000 target in 3 weeks, which specific option is most appropriate and why?`,
              scoringCriteria: [
                `14-day breakevens: ATM $67,200. OTM70 $70,280. OTM75 $75,065.`,
                `35-day breakevens: ATM $68,100. OTM70 $70,780. OTM75 $75,240.`,
                `Extra cost for time: ATM +$900. OTM70 +$500. OTM75 +$175.`,
                `Best choice for $70k target in 3 weeks: 35-day $70,000 call at $780. Reason: target matches strike, 35 days gives 2-week buffer beyond 3-week expected timeline, breakeven $70,780 is very close to target. The 14-day version ($280) risks expiring before the 3-week thesis plays out.`,
              ],
            },
          ],
        },

      ], // End Lab 1 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-breakout',
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
          'sandbox-dataModel',
        ],
        description: 'Random draw from all Lab 1 lessons — option basics, calls vs puts, strike/expiry/premium selection. No labels or hints.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'end-of-lab-third-attempt',
          passThreshold: 0.80,
        },
      },

      bossMode: {
        title: `Lab 1 Boss Battle — Real World Options Decisions`,
        learningLoop: {
          hintsEnabled: true,
          feedbackMode: 'full-criteria-with-lesson-pointers',
        },
        scenarios: [
          {
            id: 'lab1-boss-1',
            situation: `You have a $10,000 account and three situations in front of you. For each, state what type of option (call/put/neither), a rough strike, a reasonable expiry, and your maximum possible loss.

Situation 1: ETH is at $3,000. You believe ETH will reach $3,500 within 6 weeks due to a major DeFi protocol launching on Ethereum. You want leveraged upside with limited downside.

Situation 2: You own 5 BTC purchased at $40,000 average cost. BTC is now at $68,000. You are worried about a potential 30% crash before year-end but do not want to sell.

Situation 3: You have no strong directional view on SOL but notice that SOL options are historically very cheap right now (IV at 15th percentile). A major Solana upgrade is scheduled in 3 weeks.`,
            scoringCriteria: [
              `Situation 1: Buy ETH call option. Strike: near $3,500 (the target) or ATM $3,000. Expiry: 45+ days (covers the 6-week thesis with a buffer). Max loss: the premium paid per contract.`,
              `Situation 2: Buy BTC put options. Strike: somewhere below $68,000 — e.g., $55,000 or $58,000 to create a floor. Expiry: 2-3 months to cover the year-end concern. Max loss: the premium paid for the puts. This is portfolio insurance.`,
              `Situation 3: Buy a straddle (both a call and a put) or a strangle. Reason: no directional view, but cheap options + upcoming catalyst = good environment for buying. Max loss: combined premium of both options. User should NOT sell options here — cheap IV + upcoming event favours buying, not selling.`,
            ],
          },
        ],
      },
    }, // End Lab 1


    // ═══════════════════════════════════════════════════════════════════════════
    // LAB 2: THE GREEKS — WHAT MAKES OPTIONS MOVE
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 'the-greeks',
      title: `Lab 2: The Greeks — What Makes Your Option Go Up or Down`,
      subtitle: `You don't need a maths degree. You just need to understand four ideas that explain why options behave the way they do.`,
      lessons: [

        // ─── LESSON 1 ────────────────────────────────────────────────────────
        {
          id: 'delta-explained',
          title: `Delta — How Much Does Your Option Move When the Price Moves?`,
          explanation: `You bought a BTC call option. BTC just moved up $1,000. How much did your option go up?

The answer is: it depends on delta.

Delta is a number between 0 and 1 (for calls) or 0 and -1 (for puts). It tells you how much your option's price moves for every $1,000 that the underlying asset moves.

A delta of 0.5 means: BTC goes up $1,000, your call goes up $500.
A delta of 0.8 means: BTC goes up $1,000, your call goes up $800.
A delta of 0.1 means: BTC goes up $1,000, your call goes up only $100.

Think of delta like the transmission ratio in a car. A high delta (0.8) means most of the road movement transfers to your wheels — your option moves almost as much as the asset. A low delta (0.1) means most of the movement is lost in translation — your option barely responds.

ATM options (where the strike equals the current price) always have a delta of roughly 0.5. Half the asset's movement transfers to the option price.

Deep ITM options have deltas close to 1.0 — they move almost dollar-for-dollar with the asset.

Deep OTM options have deltas close to 0 — a $1,000 move in BTC barely affects them.

For puts, delta is negative: if BTC goes up $1,000, your put option goes DOWN. A put with delta -0.4 loses $400 of value when BTC rises $1,000.

Delta has a second use that beginners often don't know: it's approximately the probability that the option will expire in the money. A delta-0.3 call has about a 30% chance of being in the money at expiry. A delta-0.7 call has about a 70% chance.

This makes delta incredibly useful for choosing your trade's "confidence level." Buying a delta-0.7 call (70% probability) is a safer, higher-cost bet. Buying a delta-0.2 call (20% probability) is a cheaper, riskier lottery ticket.`,
          visualPrompt: `👆 See how delta changes as BTC moves — the option moving faster as it goes deeper ITM`,
          visualType: `gif`,
          visualUrl: `delta-animation`,
          examples: [
            {
              contextTag: `[New trader, understanding delta on a live trade, BTC call]`,
              context: `A trader owns a BTC $68,000 call with a delta of 0.35 when BTC is at $65,000. BTC then rises $3,000 to $68,000.`,
              scenario: `Starting delta: 0.35 (option is OTM). BTC moves from $65,000 to $68,000 (+$3,000). Expected option gain: 0.35 × $3,000 = $1,050. But as BTC reaches the $68,000 strike, delta rises too — ATM options have delta ~0.5. The actual gain is slightly more than the linear calculation because delta increased during the move.`,
              outcome: `BTC at $68,000: option moved from worth ~$800 (at entry) to ~$2,000 — a $1,200 gain. More than the linear delta estimate because delta grew as BTC approached the strike. This acceleration of delta is called gamma, which is covered in the next lesson. For now: understand that delta tells you the approximate movement per $1,000 move, and it's a minimum estimate because delta itself grows as price approaches and passes the strike.`,
            },
            {
              contextTag: `[Portfolio manager, using delta for position sizing, ETH]`,
              context: `A fund manager wants to gain exposure equivalent to owning 5 ETH but using options instead of buying spot. They use delta to calculate how many options to buy.`,
              scenario: `ETH at $3,200. ATM call delta: 0.51. To replicate 5 ETH exposure: divide 5 by 0.51 = approximately 10 options. Buying 10 calls with delta 0.51 each creates a "position delta" of 5.1 — roughly equivalent to holding 5 ETH.`,
              outcome: `ETH rises $400 to $3,600. 5 ETH spot: gain $2,000. 10 delta-0.51 options: gain approximately 10 × 0.51 × $400 = $2,040. The options position tracked ETH almost perfectly. But the options cost only a fraction of buying 5 ETH outright ($8,000 in premiums vs $16,000 in spot), freeing up the rest as cash. This is how institutions use delta to manage risk exposure precisely.`,
            },
            {
              contextTag: `[Beginner, confusing delta with probability, common mistake]`,
              context: `A beginner reads that delta represents probability and concludes that a delta-0.8 option is "safe" because there is an 80% chance of profit.`,
              scenario: `They buy a deep ITM BTC call with delta 0.8 at a cost of $5,500. They believe there's an 80% chance of profit. But they don't consider what happens in the 20% scenario or what the risk/reward looks like.`,
              outcome: `In the 20% scenario, BTC drops significantly. The deep ITM call loses value quickly because its high delta means every $1,000 BTC drop costs $800 on the option. The option loses $3,000 in value before the trader realises this is happening. The lesson: delta as "probability of expiring ITM" is useful for strike selection, but a high probability of expiring ITM does not mean small losses if it doesn't work out — deep ITM options can still lose large sums if the asset moves against you strongly.`,
            },
          ],
          keyTakeaway: `Delta tells you how much your option moves per $1,000 move in the underlying asset. ATM options have delta ~0.5. Deep ITM options delta ~1.0 (move dollar-for-dollar). Deep OTM options delta ~0 (barely move). Delta also approximates probability: a delta-0.3 option has roughly a 30% chance of expiring ITM.`,
          guidedPractice: [
            {
              question: `Your BTC call has a delta of 0.45. BTC rises $2,000. How much does your option gain approximately?`,
              options: [
                `A — $2,000 (same as BTC)`,
                `B — $900`,
                `C — $45`,
                `D — $4,500`,
              ],
              correct: 1,
              hint: `Delta × price move = option move. 0.45 × $2,000 = ?`,
              explanation: `B is correct. Delta 0.45 × $2,000 BTC move = $900 option gain. Your option doesn't move dollar-for-dollar with BTC — it moves at a 45% transmission rate. This is the core calculation: option gain = delta × underlying move. A would be correct only for a delta-1.0 option (deep ITM). C uses 45 cents instead of 45% (off by a factor of 100). D multiplies the other way.`,
            },
            {
              question: `You own an ETH put with delta -0.6. ETH rises $500. What happens to your put?`,
              options: [
                `A — It gains $300 — puts always gain when ETH moves`,
                `B — It loses approximately $300 — puts have negative delta, so they fall when ETH rises`,
                `C — Nothing — delta doesn't affect puts`,
                `D — It gains $500 — same as ETH`,
              ],
              correct: 1,
              hint: `Puts have negative delta. When the asset goes UP, the put goes DOWN. Calculate: -0.6 × $500 = ?`,
              explanation: `B is correct. Puts have negative delta because they gain value when the asset falls and lose value when the asset rises. Delta -0.6 × $500 rise = -$300 (a loss of $300 on your put). This is exactly what you'd expect — if ETH is rising, your bearish put bet is moving against you. The magnitude ($300) and direction (loss) both come directly from applying the delta formula.`,
            },
            {
              question: `A $70,000 BTC call with delta 0.22 and a $65,000 BTC call with delta 0.54 — which is more likely to expire in the money?`,
              options: [
                `A — The $70,000 call — it has a higher strike, which means more upside`,
                `B — The $65,000 call — its delta of 0.54 means approximately 54% probability of expiring ITM vs 22% for the $70,000 call`,
                `C — Both have the same probability — same expiry date`,
                `D — The $70,000 call because it costs less`,
              ],
              correct: 1,
              hint: `Delta approximates the probability that the option expires in the money. Higher delta = higher probability.`,
              explanation: `B is correct. The $65,000 call with delta 0.54 has approximately a 54% chance of expiring ITM. The $70,000 call with delta 0.22 has only a 22% chance. This makes intuitive sense: BTC at, say, $68,000 currently needs to fall only $3,000 to be above the $65,000 strike but needs to rise $2,000 to be above the $70,000 strike. The nearer-the-money option is more likely to finish in the money.`,
            },
            {
              question: `You want to buy a call option that will closely track BTC's price movements (high delta) to use as a BTC substitute. Which delta should you look for?`,
              options: [
                `A — Delta 0.05 — very cheap and maximum leverage`,
                `B — Delta 0.85 or higher — the option moves almost dollar-for-dollar with BTC`,
                `C — Delta 0.50 — always buy ATM options`,
                `D — Delta doesn't matter for this purpose`,
              ],
              correct: 1,
              hint: `If you want the option to behave like owning BTC, you want it to move nearly as much as BTC does. What delta achieves that?`,
              explanation: `B is correct. A delta of 0.85+ means that for every $1,000 BTC moves, your option moves approximately $850 — very close to holding spot BTC. This is called a "synthetic long" position. Deep ITM options with high delta are used by traders who want leveraged but BTC-like exposure. The trade-off: deep ITM options cost significantly more upfront because they already have high intrinsic value. Delta 0.05 (option A) barely moves — poor for tracking BTC.`,
            },
            {
              question: `BTC is at $66,000. An ATM $66,000 call has delta 0.51. If BTC falls to $61,000 (a $5,000 drop), roughly how much does the option lose?`,
              options: [
                `A — $5,000 (same as BTC)`,
                `B — Approximately $2,550, though the actual loss may be slightly less as delta decreases during the fall`,
                `C — $51`,
                `D — Nothing — options only lose value at expiry`,
              ],
              correct: 1,
              hint: `Delta 0.51 × $5,000 drop = ? But remember, as BTC falls and the option goes OTM, delta itself decreases — so the actual loss is somewhat less than the linear calculation.`,
              explanation: `B is correct. Linearly: 0.51 × $5,000 = $2,550. But in practice, the actual loss is somewhat less. As BTC falls from $66,000 to $61,000, the option moves from ATM (delta 0.51) to OTM (delta ~0.25 at $61,000). As delta decreases, each additional $1,000 drop has less and less impact on the option price. This decreasing sensitivity as the option moves OTM is actually a benefit — it's called "convexity" and means options lose value more slowly as they go OTM than they gain value when going ITM.`,
            },
          ],
          lessonSimulations: [
            {
              type: `sandbox-dataModel`,
              scenario: `You hold these options positions on BTC (BTC currently at $67,000):

Position A: 3 × $67,000 ATM calls with delta 0.51 each
Position B: 2 × $60,000 deep ITM calls with delta 0.88 each
Position C: 5 × $75,000 OTM calls with delta 0.14 each

BTC suddenly moves up $3,000 to $70,000.

Calculate:
1. How much does Position A gain?
2. How much does Position B gain?
3. How much does Position C gain?
4. Which position made the most money in absolute dollar terms?
5. Which position made the most money as a percentage of its value? (Assume: Position A each worth $2,100. Position B each worth $8,500. Position C each worth $320.)`,
              scoringCriteria: [
                `Position A gain: 3 × 0.51 × $3,000 = $4,590`,
                `Position B gain: 2 × 0.88 × $3,000 = $5,280`,
                `Position C gain: 5 × 0.14 × $3,000 = $2,100`,
                `Most absolute dollars: Position B ($5,280)`,
                `Most % gain: Position C — gained $2,100 on 5 × $320 = $1,600 original value = 131% return. Position A: $4,590 on $6,300 = 73%. Position B: $5,280 on $17,000 = 31%.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You want to buy a single ETH call option as a directional bet. ETH is at $3,200. You have a $65% conviction that ETH will reach $3,600 within 35 days.

Here are the options:
• $3,000 ITM call: delta 0.71, costs $290
• $3,200 ATM call: delta 0.51, costs $180
• $3,400 OTM call: delta 0.31, costs $92
• $3,600 OTM call: delta 0.16, costs $38

Using delta as your guide: (1) Which strike's delta most closely matches your 65% conviction level? (2) What is the breakeven at expiry for that option? (3) What is your approximate gain if ETH reaches $3,600 by expiry?`,
              scoringCriteria: [
                `65% conviction → look for delta ~0.65. Closest is $3,000 ITM at 0.71. Acceptable answer: $3,200 ATM at 0.51 (within range if user interprets 65% loosely).`,
                `If $3,000 call: breakeven = $3,000 + $290 = $3,290. If $3,200 call: breakeven = $3,200 + $180 = $3,380.`,
                `At $3,600: $3,000 call intrinsic = $600 - $290 = $310 profit. $3,200 call intrinsic = $400 - $180 = $220 profit.`,
                `User correctly uses delta as a probability proxy for strike selection.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You are managing a live BTC options position:

You bought: 4 × BTC $68,000 calls when BTC was at $65,000 (delta was 0.32 at entry)
Premium paid: $950 each ($3,800 total)

BTC has now moved to $69,500. Your calls are now ATM-ish with delta 0.49 each.
Each call is now worth $1,850.

Question 1: What was your approximate gain from the BTC move alone, using your entry delta of 0.32?
Question 2: Why is the actual gain ($3,600 total: 4 × ($1,850-$950) = $3,600) more than your entry delta predicted?
Question 3: With 4 calls now worth $1,850 each and delta 0.49, if BTC drops $2,000 back to $67,500, estimate how much the position loses.`,
              scoringCriteria: [
                `Q1: Entry delta 0.32 × $4,500 BTC move × 4 contracts = $5,760 estimated gain. But premium went from $950 to $1,850 per contract = $3,600 actual gain. The estimate overshoots because delta was 0.32 at entry but rose to 0.49 as BTC moved — the actual gain was tempered by the position going from OTM toward ATM, where delta growth increases value more slowly than the initial calculation.`,
                `Q2: The actual gain ($3,600) is less than the linear estimate because delta itself changed during the move. Starting at 0.32, it only reached 0.49. The gain accrued at varying delta rates throughout — not uniformly at 0.32.`,
                `Q3: Current delta 0.49 × $2,000 drop × 4 contracts = $3,920 estimated loss. Calls would lose roughly $980 each in value, falling back to approximately $870 each.`,
              ],
            },
          ],
        },

        // ─── LESSON 2 ────────────────────────────────────────────────────────
        {
          id: 'theta-gamma-explained',
          title: `Theta and Gamma — Time Is the Enemy (Unless You're Selling)`,
          explanation: `Here is one of the most important things beginners don't understand about options: they are melting ice cubes.

Every single day that passes, your option loses a little bit of value — even if the asset price doesn't move at all. This daily value loss is called theta, or time decay.

Theta is always negative for buyers. If your call has theta of -$15, you lose $15 of value from your option every day, just from the passage of time. Nothing needs to go wrong — the clock runs and the value shrinks.

This decay is not linear. An option expiring in 30 days loses value slowly at first. As it gets to 14 days, decay accelerates. In the final 7 days, the option loses value very rapidly each day.

This is why buying very short-dated options is so dangerous. In the last week before expiry, theta is at its most brutal. A $500 option can lose $100-200 per day just from the clock ticking.

But here's the flip side: if you SELL an option, theta works for you. Every day that passes, the option you sold loses value — and you keep the difference. Option sellers love time decay. This is why covered call sellers and iron condor traders describe options as "melting assets" — they sell them and watch them melt in their favour.

Gamma is related to delta and measures how fast delta changes. Think of it this way: delta is your speed, and gamma is your acceleration.

If you're driving at 40mph (delta 0.4), your gamma tells you how fast you'll speed up as you approach the destination. An option with high gamma (near ATM, near expiry) changes direction very quickly — a small move in BTC can cause the option's delta to jump dramatically.

High gamma is exciting if you're a buyer: a $2,000 BTC move could cause your option to suddenly behave like it's 2× more responsive to price changes. But high gamma is dangerous if you're a seller: the same move causes your short option to suddenly become much more valuable, increasing your losses rapidly.

The trade-off between theta and gamma is one of the most fundamental dynamics in options: option buyers accept paying daily theta in exchange for the gamma benefit (explosive gains if the price moves strongly). Option sellers collect daily theta but take on gamma risk (explosive losses if price moves violently).`,
          visualPrompt: `👆 See the theta decay curve — slow at first, then accelerating in the final days`,
          visualType: `gif`,
          visualUrl: `theta-decay-curve-animation`,
          examples: [
            {
              contextTag: `[New trader, experiencing theta decay, ETH call, quiet market]`,
              context: `A trader buys an ETH call option on a Monday. The market barely moves all week.`,
              scenario: `ETH at $3,100. Pays $280 for a $3,200 call with 14 days to expiry. Option theta: -$18/day. ETH doesn't move all week — stays at $3,050 to $3,150. After 7 days, the option is worth $154.`,
              outcome: `The trader loses $126 in 7 days purely from time decay ($18 × 7 = $126). ETH moved slightly against them too (-$50). Total loss: -$126 from theta. They did nothing wrong about the direction — ETH didn't crash — but time simply eroded their option's value. This is the core risk of buying options: even a correct directional view can result in a loss if the move doesn't happen fast enough.`,
            },
            {
              contextTag: `[Option seller, experiencing theta benefit, covered call programme]`,
              context: `The same ETH option from a different perspective — the person who SOLD it.`,
              scenario: `The seller of that $3,200 call collected $280. ETH barely moves for 7 days. The seller's position gains $18 of value every day — the option they sold is melting.`,
              outcome: `After 7 days, the seller could buy back the option for $154 — pocketing $126 profit from 7 days of nothing happening. The seller's job is simply to wait. Time is their ally. No analysis needed, no price prediction — just the passage of time did the work. This is the appeal of systematic option selling programmes: reliable income from selling time.`,
            },
            {
              contextTag: `[Trader, experiencing gamma, rapid delta change near expiry, BTC]`,
              context: `A trader experiences gamma firsthand when a large BTC move occurs near expiry.`,
              scenario: `BTC at $67,000 with 3 days to expiry. Short $68,000 call sold for $200. Delta is 0.38. Gamma is 0.08 (high because near expiry and near the strike). BTC suddenly surges $1,500 in one hour.`,
              outcome: `After the $1,500 surge (BTC at $68,500): the short call is now $500 ITM. Delta has risen from 0.38 to 0.72 (gamma effect: +0.08 × $1,500 ÷ $1,000 = 0.12 additional delta). The option that was sold for $200 is now worth $620. Loss: $420 in one hour. Gamma near expiry is what makes selling options in the final few days so dangerous — a moderate price move causes option values to swing dramatically. This is why professional sellers close positions before the final week, even if they're still profitable.`,
            },
          ],
          keyTakeaway: `Theta is daily value loss from time passing — you lose it as a buyer, you collect it as a seller. Gamma measures how fast delta changes — it's highest near expiry and near the strike. Near-expiry options have brutal theta (rapid decay) and dangerous gamma (explosive delta changes on any move). Option buyers need the price to move fast. Option sellers want nothing to happen.`,
          guidedPractice: [
            {
              question: `You buy a BTC call with theta of -$25/day. BTC price doesn't move for 10 days. How much value has your option lost?`,
              options: [
                `A — $0 — theta only matters at expiry`,
                `B — $250 from time decay alone`,
                `C — $25 total`,
                `D — $25 per $1,000 BTC moves`,
              ],
              correct: 1,
              hint: `Theta is the daily cost of holding an option. Multiply the daily rate by the number of days.`,
              explanation: `B is correct. Theta -$25/day × 10 days = $250 of value lost from time decay. This happens regardless of what BTC price does. If BTC didn't move at all for 10 days, the option simply lost $250 of value from the clock ticking. This is why options have urgency — the longer your thesis takes to play out, the more of your premium you lose waiting. Time decay is also why selling options can generate steady income: the seller collects those $25/day as the option they sold melts in value.`,
            },
            {
              question: `You own an ETH call that's losing $8/day from theta. You also sold a different ETH call that gains you $14/day from theta (since you're the seller). What is your net daily theta income/loss?`,
              options: [
                `A — Loss of $22/day (add both)`,
                `B — Gain of $6/day (seller's theta offsets buyer's theta loss)`,
                `C — Loss of $8/day (only count what you pay)`,
                `D — Gain of $14/day (only count what you receive)`,
              ],
              correct: 1,
              hint: `Net theta = theta you collect (from selling) minus theta you pay (from buying). +$14 collected, -$8 paid = ?`,
              explanation: `B is correct. Net theta: +$14 (from the short option you sold) - $8 (theta you pay on the long option you bought) = +$6 net daily gain. This is the principle behind iron condors and calendar spreads — you structure positions so the theta you collect from sold options exceeds the theta you pay on bought options. When theta is positive, the mere passage of time makes you money. Many professional options strategies are essentially designed to put theta in your favour.`,
            },
            {
              question: `You have a BTC call expiring in 3 days. It's only $1,000 OTM. Is this a high-gamma situation? What does that mean for the option's price behaviour?`,
              options: [
                `A — No — gamma is irrelevant near expiry`,
                `B — Yes — near expiry and near the strike is the highest gamma scenario. A moderate BTC move will cause the option's delta to change dramatically, making the option price extremely volatile.`,
                `C — Yes, but only for puts, not calls`,
                `D — High gamma means the option won't move at all`,
              ],
              correct: 1,
              hint: `Gamma is highest near the strike price AND near expiry. Both conditions are present here.`,
              explanation: `B is correct. This is the maximum gamma scenario: close to the strike AND close to expiry. What this means practically: if BTC moves up $1,500 in a day, the option that was OTM by $1,000 suddenly becomes $500 ITM. Delta could jump from 0.25 to 0.75 — tripling. The option price could go from $80 to $500+ in one day. This is why near-expiry options are either very exciting (for buyers) or extremely dangerous (for sellers). If you're a seller of this option, a $1,500 BTC move can generate enormous losses in hours. If you're a buyer, that same move can turn a near-worthless option into a very profitable one.`,
            },
            {
              question: `Why do option SELLERS love high theta environments (options with fast time decay)?`,
              options: [
                `A — Sellers lose money from theta — they'd prefer low theta`,
                `B — Sellers collect the theta as income — as the option decays, their obligation diminishes and they profit from every passing day`,
                `C — Theta doesn't affect sellers, only buyers`,
                `D — Sellers prefer options that never expire`,
              ],
              correct: 1,
              hint: `Flip the buyer's perspective: the buyer loses $25/day from theta. The seller of that same option gains... what?`,
              explanation: `B is correct. When you sell an option, you receive premium upfront. Every day that passes, the option becomes less valuable. When you eventually buy it back to close the position, you pay less than you received. The difference is your profit — and theta is what drives that difference. Professional option sellers run systematic income programmes where they sell options and collect theta every day. It's not exciting — it's like collecting rent. The risk for sellers is gamma: a large, sudden move can destroy weeks of theta income in a single day.`,
            },
            {
              question: `It's 5 days before your BTC option expires. BTC moves $3,000 toward your strike. Which scenario creates a bigger dollar gain — when you bought the option 30 days ago (delta was 0.2), or right now (delta is now 0.55)?`,
              options: [
                `A — 30 days ago: 0.2 × $3,000 = $600 gain`,
                `B — Right now: 0.55 × $3,000 = $1,650 gain — and because of high gamma near expiry, delta will continue accelerating, potentially making the gain even larger`,
                `C — Both produce the same gain`,
                `D — 30 days ago gains more because there was more time value`,
              ],
              correct: 1,
              hint: `More delta = more gain per $3,000 move. And near expiry, gamma is highest — so delta doesn't just sit at 0.55, it accelerates further as BTC moves.`,
              explanation: `B is correct. Right now, with delta 0.55, the same $3,000 BTC move creates $1,650 of gain vs $600 thirty days ago (delta 0.2). This is the "gamma payoff" — near expiry, options are more responsive to price moves. An OTM option with 5 days left can go from $100 to $2,000 on a strong enough move because gamma keeps pushing delta higher as price approaches and passes the strike. This is why some experienced traders buy short-dated options specifically around expected catalysts — the gamma payoff can be explosive. The risk: if the move doesn't happen, theta destroys the option rapidly.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `You have two open options positions on BTC (BTC at $67,000):

Position A: Long 2 × BTC $67,000 ATM calls. 25 days to expiry. Theta: -$48/day each. Delta: 0.51 each. Each currently worth $1,900.

Position B: Short 3 × BTC $72,000 OTM calls (you sold these). 8 days to expiry. Theta: +$22/day each. Delta: 0.19 each. Each currently worth $280 (you collected $450 when sold).

Answer:
1. What is your combined daily net theta (profit or loss)?
2. If BTC doesn't move for 5 days, estimate the value of Position A and Position B after 5 days.
3. Position B is showing profit (sold at $450, now worth $280). You have 8 days left. Should you close it now or hold to capture remaining theta?`,
              scoringCriteria: [
                `Q1: Position A: -$48 × 2 = -$96/day. Position B: +$22 × 3 = +$66/day. Net: -$30/day (net theta cost).`,
                `Q2: Position A after 5 days: $1,900 - ($48 × 5) = $1,660 each (if BTC flat). Position B after 5 days: $280 - ($22 × 5) = $170 each.`,
                `Q3: Position B — sold at $450, now worth $280. Profit so far: $170 each × 3 = $510. With 8 days left and $280 remaining value, the 50% profit rule suggests closing (you've captured most of the value). Remaining $280 with 8 days carries gamma risk — any sudden BTC move toward $72,000 could erase profits rapidly. Professional answer: close Position B now, lock in $510 profit, eliminate gamma risk.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `You are deciding between two options purchases on ETH (ETH at $3,300):

Option X: 7-day $3,400 OTM call. Cost: $65. Theta: -$9/day. Delta: 0.22.
Option Y: 35-day $3,400 OTM call. Cost: $185. Theta: -$5/day. Delta: 0.27.

Your thesis: ETH will reach $3,600 within 3-4 weeks.

Calculate for each option:
1. Total theta cost over 3 weeks (21 days)
2. At the 3-week mark, what is the intrinsic value if ETH reaches $3,600?
3. Which option is still alive at the 3-week mark?
4. Which option was the better choice for a "3-4 week" thesis?`,
              scoringCriteria: [
                `Option X theta over 21 days: $9 × 21 = $189. But Option X only has 7-day life — it expires after 7 days. Moot.`,
                `Option Y theta over 21 days: $5 × 21 = $105. Option Y is still alive with 14 days remaining.`,
                `Intrinsic value at $3,600: both strikes are $3,400. Intrinsic = $3,600 - $3,400 = $200.`,
                `Option X: expired worthless after 7 days — even if ETH reaches $3,600, it's too late. Full $65 loss.`,
                `Option Y at 3 weeks: intrinsic $200, plus remaining 14 days of time value (~$70). Worth ~$270. Profit: $270 - $185 = $85.`,
                `Better choice: Option Y. Option X had no chance of surviving to the 3-4 week thesis timeline. This is the core lesson: match expiry to your thesis timeline.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You sold 5 BTC $70,000 OTM calls 18 days ago for $380 each ($1,900 total received). BTC was at $65,000. There are now 12 days remaining to expiry.

Current situation:
• BTC has rallied to $69,200 — uncomfortably close to your $70,000 short strike
• Each call you sold is now worth $1,100 (you owe this if you close)
• Cost to close: 5 × $1,100 = $5,500
• You received: $1,900
• Unrealised loss: $3,600

Your theta: each call loses $38/day (you collect $38/day). So you're collecting 5 × $38 = $190/day.

Two choices:
A — Close now: realise $3,600 loss
B — Hold: collect $190/day for 12 more days = $2,280 if BTC stays below $70,000

Calculate: For option B, what does BTC need to do for the $2,280 theta income to be worth the risk? And what is your maximum additional loss if BTC surges to $75,000 at expiry?`,
              scoringCriteria: [
                `Theta income if held to expiry: 5 × $38 × 12 = $2,280. But BTC is at $69,200 — only $800 from the strike.`,
                `If BTC surges to $75,000: each call worth $5,000. Total owed: $25,000. Minus $1,900 received = $23,100 total loss.`,
                `Current loss: $3,600. Additional potential loss from $75,000 scenario: $23,100 - $3,600 = $19,500 more.`,
                `Risk/reward: risking an additional $19,500 loss to collect $2,280 in theta = terrible risk/reward ratio (8.5:1 against you).`,
                `Professional answer: close now. Take the $3,600 loss. The gamma risk of BTC breaking through $70,000 with 12 days of theta to collect is not worth the potential for a catastrophic loss.`,
              ],
            },
          ],
        },

        // ─── LESSON 3 ────────────────────────────────────────────────────────
        {
          id: 'vega-iv-explained',
          title: `Vega — Why Your Option Can Lose Value Even When Price Moves Your Way`,
          explanation: `Imagine this nightmare scenario. You buy a BTC call option. BTC moves up 8%. You should be making money. But you check your account — and you're actually down.

How is this possible?

The answer is vega — and understanding it will prevent one of the most common and confusing losses beginners face.

Vega measures how much your option's price changes when implied volatility (IV) changes. Specifically: vega tells you how much value you gain or lose for every 1% change in IV.

When IV falls — even if the asset price rises — options get cheaper. If IV falls enough, it can wipe out the delta gain from a price move. This is called volatility crush, and it's most common right after a big event (earnings, halvings, regulatory decisions).

Here's the sequence that catches beginners:
1. A big event is coming (halving, ETF decision, etc.)
2. Everyone buys options to bet on or hedge the event
3. All that buying pushes IV up — options get expensive
4. The event happens. The uncertainty is resolved.
5. IV crashes back down — options get cheaper immediately
6. Even if the price moved in your favour, the IV collapse makes your option worth less

If you paid $2,000 for an option with high IV, and after the event IV crashes, the same option might be worth only $800 — even if the asset moved 5% your way.

Vega is always positive for option buyers: you gain from IV rising, you lose from IV falling. Vega is negative for sellers: they gain when IV falls (their short option gets cheaper), they lose when IV rises.

The practical rules: buy options when IV is historically low (cheap options that can only get more expensive). Sell options when IV is historically high (expensive options that are likely to fall in price over time). Check IV percentile before any options trade — it tells you whether you're buying cheap or expensive insurance.`,
          visualPrompt: `👆 See how an IV spike before an event and IV crush after it affects option prices`,
          visualType: `gif`,
          visualUrl: `vega-iv-crush-animation`,
          examples: [
            {
              contextTag: `[Trader, vega loss despite correct direction, ETH upgrade, real scenario]`,
              context: `A trader correctly predicts ETH will rise after a major upgrade — but loses money due to volatility crush.`,
              scenario: `Before the Ethereum Shanghai upgrade: ETH at $1,900, IV at 68th percentile (options expensive because of upgrade anticipation). Trader buys $2,000 ATM calls for $120 each. Vega: 0.08 (option gains $8 for every 1% IV rise, loses $8 for every 1% IV fall).`,
              outcome: `Upgrade completes successfully. ETH rises 8% to $2,052. Delta gain: about $52 per contract. But IV crashes from 68th to 32nd percentile — a 30-point drop in IV. Vega loss: 0.08 × 30 × 100 = $240 loss from IV crush. Net on the option: +$52 delta - $240 vega = -$188 loss. A correct directional call, an 8% price move — and still a loss. The villain was buying expensive options at high IV right before an event, then watching IV crush destroy the value after.`,
            },
            {
              contextTag: `[Smart volatility buyer, low IV entry, ETF anticipation, BTC]`,
              context: `A trader learns from the vega crush lesson and buys options before IV spikes — capturing both the directional move AND the IV expansion.`,
              scenario: `3 weeks before a Bitcoin ETF decision, IV is at 22nd percentile (historically cheap). ETH — sorry, BTC — at $43,000. Trader buys ATM calls for $1,600. Vega: 0.18. Over the next 10 days, IV climbs from 22nd to 75th percentile as anticipation builds (a 53-point IV rise). Delta gain: BTC rose from $43,000 to $47,000 (+$4,000). Delta gain: 0.5 × $4,000 = $2,000. IV gain: 0.18 × 53 × 100 = $954.`,
              outcome: `Before the event, the trader sells their options. Total option value: $1,600 original + $2,000 delta + $954 vega = approximately $4,554. Profit: $2,954 — nearly double the premium paid. Crucially, they sold BEFORE the event. They captured both the directional move AND the IV expansion, without risking the IV crush that would come after the announcement.`,
            },
            {
              contextTag: `[Option seller, vega benefit, high IV environment, BTC strangles]`,
              context: `An experienced trader flips the vega relationship to their advantage by selling options when IV is high.`,
              scenario: `Post-FTX crash in late 2022, BTC IV is at 94th percentile — near all-time highs. The trader sells BTC strangles (selling both calls and puts at different strikes) collecting $2,400 per strangle. Negative vega: each strangle loses $180 for every 1% IV rise, but GAINS $180 for every 1% IV fall.`,
              outcome: `Over the next 30 days, as markets stabilise, IV falls from 94th to 48th percentile — a massive 46-point drop. Vega gain: 0.18 × 46 × 100 = $828 per strangle. BTC barely moved. Combined theta income + vega gain = $1,600 per strangle in 30 days. The seller profited by selling extremely expensive options and watching them get cheaper as fear subsided. This is the professional volatility selling trade: sell high IV, wait for IV to normalise.`,
            },
          ],
          keyTakeaway: `Vega is your option's sensitivity to implied volatility changes. Option buyers gain when IV rises, lose when IV falls. After major events, IV typically crashes — this is "volatility crush" and can cause losses even when direction was correct. Rule: buy options at low IV, sell options at high IV. Always check IV percentile before trading.`,
          guidedPractice: [
            {
              question: `You buy an ETH call with vega of 0.12. IV falls by 20 percentage points (from 65% to 45%) after a major event. How much value did your option lose from vega alone?`,
              options: [
                `A — $12`,
                `B — $240 (0.12 × 20 × 100)`,
                `C — $2,400`,
                `D — $0 — vega only matters for sellers`,
              ],
              correct: 1,
              hint: `Vega × IV change × 100 (to convert to dollar value). Vega 0.12 × 20 points of IV change × 100 = ?`,
              explanation: `B is correct. Vega 0.12 means the option changes by $12 for every 1% (1 percentage point) change in IV. IV fell by 20 percentage points. Loss: 0.12 × 20 × 100 = $240. The ×100 is because vega is expressed per 1% IV move, and we convert that to a dollar amount based on standard contract notional. This $240 loss from vega happens in addition to any delta gains or losses from the price move. If the price only moved $1,000 in your favour (delta gain ~$60 for a 0.6 delta option), the $240 vega loss would leave you net -$180.`,
            },
            {
              question: `IV percentile for BTC is currently 8% — near a 12-month low. A major regulatory announcement is expected in 2 weeks. Should you buy or sell options right now?`,
              options: [
                `A — Sell — low IV means options are cheap and will stay cheap`,
                `B — Buy — low IV means options are historically cheap. As the announcement approaches, IV will likely rise, increasing option value even before any price move`,
                `C — Neither — wait until after the announcement`,
                `D — Only trade after the announcement`,
              ],
              correct: 1,
              hint: `Low IV = cheap options. A known upcoming catalyst will likely drive IV higher. Who benefits when IV rises?`,
              explanation: `B is correct. At the 8th IV percentile, options are cheaper than 92% of recent trading days. With a known catalyst approaching, two good things happen for buyers: (1) IV will likely rise as the announcement approaches — vega gains. (2) The announcement may cause a large price move — delta gains. Buying at 8th percentile means you're paying the cheapest possible insurance for an event that could move the market significantly. After the announcement, IV will likely crush — that's when you should have already sold. C and D miss the opportunity entirely — the best time to buy was at low IV, before IV spikes.`,
            },
            {
              question: `You bought a BTC straddle (a call AND a put at the same strike) for $4,200 right before the Bitcoin halving. BTC moved 6% in the expected direction. But your straddle is now worth only $2,800 — a loss. What most likely happened?`,
              options: [
                `A — You picked the wrong strike`,
                `B — The 6% price move was not enough to overcome the volatility crush that happened after the halving — IV fell dramatically after the uncertainty resolved`,
                `C — Straddles never work on halvings`,
                `D — You should have bought only puts, not both`,
              ],
              correct: 1,
              hint: `Think about what happens to IV immediately after a major event. Everyone was nervous before — what happens to that nervousness after it's over?`,
              explanation: `B is correct. This is the classic halving straddle trap. You paid $4,200 for the straddle when IV was high (everyone nervous about the halving = expensive options). After the halving completed, the uncertainty was resolved. IV crashed immediately. Even though BTC moved 6%, the IV crush reduced the option's value more than the price move increased it. The 6% move generated maybe $2,000 in delta gain, but a 30-40 percentage point IV crush wiped out $3,400+ in vega. Net result: a loss on a trade where you predicted the direction correctly. The lesson: never buy straddles right before a major event if options are already expensive (high IV percentile).`,
            },
            {
              question: `A BTC option seller collects $1,800 premium by selling a call when IV percentile is at 85%. Over the next 30 days, IV falls from 85th to 40th percentile and BTC price stays flat. What happens to the seller's position?`,
              options: [
                `A — They lose money — IV fell against them`,
                `B — They profit from both: (1) theta — option decaying daily, and (2) vega — IV falling makes the option they sold cheaper to buy back`,
                `C — IV changes don't affect option sellers`,
                `D — They must close the position immediately when IV falls`,
              ],
              correct: 1,
              hint: `The seller is short the option. When IV falls, the option they sold gets cheaper. They sold high, can buy back low — that's profit.`,
              explanation: `B is correct. The option seller profits from two sources here. Theta: the option decays by roughly $60/day for 30 days = $1,800 of theta income. Vega: IV falling from 85th to 40th percentile means the option they sold at $1,800 might now be worth $900 — a $900 vega gain on top of the theta. Total profit: potentially $2,700+ on the $1,800 premium collected. This is why professional option sellers specifically look for high-IV environments: they get paid extra premium AND benefit from IV mean-reverting back toward normal levels. The risk: if IV rises further (unexpected event), the option gets more expensive — a loss.`,
            },
            {
              question: `What is the most important single check to do BEFORE buying any option?`,
              options: [
                `A — Check the asset's price history`,
                `B — Check the IV percentile — is it historically cheap (below 30th) or expensive (above 70th)?`,
                `C — Check the option's delta`,
                `D — Check what other traders are saying on social media`,
              ],
              correct: 1,
              hint: `This one number tells you whether options are cheap or expensive relative to recent history — and it determines whether buying or selling makes more sense.`,
              explanation: `B is correct. IV percentile is the single most important context check before any options trade. It tells you whether you're about to buy cheap insurance or overpriced insurance. Below 30th percentile: options are cheap — lean toward buying. Above 70th percentile: options are expensive — lean toward selling. Without this check, you might buy a call at the 90th IV percentile (paying top dollar) right before an event that will crush IV — and lose money even with a correct directional prediction. This is the mistake that burns most beginners. Make IV percentile your first check, every time.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-volumeRead`,
              scenario: `You are looking at this BTC options market data over a 6-week period leading up to and following a major event:

Week 1: BTC $58,000. IV percentile: 18%.
Week 2: BTC $59,500. IV percentile: 26%.
Week 3: BTC $60,000. IV percentile: 44%. (Major Bitcoin conference announced for Week 6)
Week 4: BTC $62,000. IV percentile: 62%.
Week 5: BTC $63,000. IV percentile: 78%.
Week 6: Conference happens. BTC moves to $67,000 (+6.7%). IV percentile: 29%.

A trader bought a straddle at the end of Week 1 for $2,800. They sold it at the end of Week 5 for $6,400.

Questions:
1. When was the best time to buy the straddle and why?
2. When was the best time to sell and why?
3. How much did the trader make and where did the profit come from (delta from BTC rising, or vega from IV rising, or both)?
4. What would have happened if they held through Week 6?`,
              scoringCriteria: [
                `Best time to buy: Week 1 (IV 18% — historically very cheap). Correct.`,
                `Best time to sell: Before the event — Week 5 (IV 78% — near peak). Selling before IV crush. Correct.`,
                `Profit: $6,400 - $2,800 = $3,600 profit. Sources: BTC rose ~$5,000 = delta gain. IV rose from 18th to 78th percentile = large vega gain. Both contributed.`,
                `Week 6 scenario: BTC rose to $67,000 (+$4,000 more) BUT IV crashed from 78th to 29th percentile. The straddle that was worth $6,400 would likely be worth $4,200-4,500 after IV crush. They would have earned less by holding through the event than by selling before it.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are comparing two options trades. Identify which is better and why.

Trade 1: ETH at $3,100. IV percentile: 81%. You buy a $3,100 ATM call for $210. Upcoming event: major ETH unlock in 5 days. Your thesis: ETH will rally on the unlock news.

Trade 2: BTC at $64,000. IV percentile: 19%. You buy a $64,000 ATM call for $1,600 (60-day expiry). No specific near-term event. Your thesis: BTC is forming a 3-month accumulation pattern that often resolves upward.

For each trade, evaluate: (1) IV environment (appropriate for buying?), (2) event risk / vega risk, (3) thesis quality. Then rank them.`,
              scoringCriteria: [
                `Trade 1: IV 81st percentile = very expensive options. Buying here means high vega risk from IV crush after the event. Unlock events often disappoint — even a price move may not overcome vega crush. Low-quality setup for option buying.`,
                `Trade 2: IV 19th percentile = historically cheap options. 60-day expiry gives time. No imminent event to cause IV crush. Directional thesis is pattern-based and longer-term. Good setup for option buying.`,
                `Trade 2 is clearly superior: cheap options, no IV crush risk, adequate time for thesis to develop.`,
                `Trade 1 would only be acceptable as a spread (buying a call spread to reduce vega exposure), not as a naked call purchase.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `Build a complete "Greeks snapshot" for this BTC options position:

You own 3 × BTC $66,000 ATM calls (BTC at $66,000). Options details:
• Delta: 0.51 each
• Theta: -$55/day each
• Vega: 0.14 each
• Current premium: $2,200 each
• Expiry: 28 days

Calculate for the full position (3 contracts):
1. If BTC rises $3,000 tomorrow: how much does the position gain from delta?
2. If one week passes with BTC flat: how much does the position lose from theta?
3. If IV rises 15 percentage points: how much does the position gain from vega?
4. If on the same day as Q3, BTC also rises $3,000 AND IV rises 15 points — what is the total estimated gain?`,
              scoringCriteria: [
                `Q1: Delta gain: 3 × 0.51 × $3,000 = $4,590`,
                `Q2: Theta loss: 3 × $55 × 7 days = $1,155`,
                `Q3: Vega gain: 3 × 0.14 × 15 × 100 = $630`,
                `Q4: Combined: $4,590 delta + $630 vega = $5,220 total estimated gain (assuming theta is negligible in a single day). User should note these are independent effects that stack.`,
              ],
            },
          ],
        },

      ], // End Lab 2 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-volumeRead',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-dataInterpret',
          'judgment-prioritisation',
          'sandbox-dataModel',
        ],
        description: 'Random draw from all Lab 2 Greek lessons — delta, theta, gamma, vega. No labels or hints.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'end-of-lab-third-attempt',
          passThreshold: 0.80,
        },
      },

      bossMode: {
        title: `Lab 2 Boss Battle — Greeks Under Real Conditions`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers' },
        scenarios: [
          {
            id: 'lab2-boss-1',
            situation: `You hold this options portfolio on BTC (BTC at $67,000):

Position 1: Long 4 × $67,000 ATM calls. Delta: 0.51 each. Theta: -$55/day each. Vega: 0.14 each. Cost: $2,800 each.
Position 2: Long 2 × $67,000 ATM puts. Delta: -0.49 each. Theta: -$53/day each. Vega: 0.13 each. Cost: $2,700 each.
Position 3: Short 6 × $80,000 OTM calls (you sold these). Delta: -0.11 each. Theta: +$18/day each. Vega: -0.04 each. Sold at $310 each.

Current IV: 60th percentile. A major announcement is expected in 48 hours. Historically, IV rises 35 points before this type of announcement, then crashes 50 points immediately after.

Question 1: What is your combined daily net theta across all positions?
Question 2: If IV rises 35 points before the announcement: what is your total vega gain/loss?
Question 3: BTC doesn't move. After the announcement IV crashes 50 points: what is your vega loss?
Question 4: Should you close any positions before the announcement and why?`,
            scoringCriteria: [
              `Q1: Theta: (4 × -$55) + (2 × -$53) + (6 × +$18) = -$220 - $106 + $108 = -$218/day net cost.`,
              `Q2: Vega on IV +35 points: Long calls: 4 × 0.14 × 35 × 100 = +$1,960. Long puts: 2 × 0.13 × 35 × 100 = +$910. Short calls: 6 × -0.04 × 35 × 100 = -$840 (hurts sellers when IV rises). Net vega gain pre-announcement: +$2,030.`,
              `Q3: IV crash -50 points: Long calls: 4 × 0.14 × 50 × 100 = -$2,800. Long puts: 2 × 0.13 × 50 × 100 = -$1,300. Short calls: 6 × -0.04 × 50 × 100 = +$1,200 (helps sellers when IV falls). Net vega loss post-announcement: -$2,900.`,
              `Q4: Recommendation: sell the long calls and puts BEFORE the announcement (capture the +$2,030 IV expansion gain, avoid the -$2,900 crash). Keep the short calls — they benefit from IV crush. The asymmetry: you gain $2,030 on IV rising, lose $2,900 on IV falling. Close the longs before the event.`,
            ],
          },
        ],
      },
    }, // End Lab 2

    // ═══════════════════════════════════════════════════════════════════════
    // LAB 3: CORE STRATEGIES
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'core-strategies',
      title: 'Lab 3: Core Strategies — Long Calls, Income, and Spreads',
      subtitle: 'Long calls, covered calls, cash-secured puts, and vertical spreads.',
      lessons: [
        {
          id: 'long-call-strategy',
          title: 'Long Call — Leveraged Bullish Exposure with Defined Risk',
          explanation: `In January 2023, Bitcoin sat at $16,500 in the aftermath of FTX's collapse. A trader spent $800 on one BTC $20,000 call expiring in 90 days. By mid-April, BTC hit $30,000. That call was worth $10,000 — a 1,150% return on $800 risked. Buying $800 of spot BTC at $16,500 would have returned 82%. That gap — 1,150% vs 82% — is the leverage argument for long calls.

A long call gives you the right, but not the obligation, to buy the underlying at the strike price before expiry. You pay the premium upfront. Your maximum loss is exactly the premium paid, no matter how far the asset falls. Your upside is unlimited.

Strike selection follows conviction. If you have a specific price target, set your long call strike there or slightly below. Buying deep OTM calls is buying lottery tickets — cheap, but low probability. Buying ATM calls is the most balanced: decent premium, ~50% delta, meaningful participation in any move. Buying ITM calls (below current price) is expensive but behaves almost like spot with leverage.

Expiry selection follows your timeline. Match the option's life to how long you expect the move to take. If you think a catalyst hits in 2 weeks, buy 30-day options — never 7-day, because 7-day options at OTM strikes lose almost all value from theta with no price movement. The rule: give your thesis twice the time you think it needs.

Breakeven at expiry = strike + premium paid. Anything above that at expiry is profit. Below the strike at expiry, the option expires worthless and you lose the full premium.

Profit-taking discipline separates consistent traders from gamblers. When a long call doubles, sell half to recapture your original cost. Let the rest run with a stop at breakeven. Never hold a long call with less than 10 days to expiry hoping for a rescue — theta at that point is devastating.`,
          examples: [
            {
              contextTag: '[Retail Trader, BTC halving call, 75-day expiry, 2024]',
              context: 'A retail trader with $3,000 wants BTC exposure before the April 2024 halving but cannot afford spot.',
              scenario: 'BTC at $42,000. Buys 2 × $45,000 calls expiring in 75 days for $1,400 each ($2,800 total). Maximum loss: $2,800. Breakeven: $46,400.',
              outcome: 'BTC reaches $72,000 before expiry. Each call worth $27,000. Net profit: (2 × $27,000) − $2,800 = $51,200. Equivalent spot purchase of $2,800 at $42,000 would have returned $2,000. The options returned 25× the dollar gain of spot.',
            },
            {
              contextTag: '[Fund, ETH EIP-4844 upgrade thesis, 45-day call, 2024]',
              context: 'A crypto fund positions ahead of the Dencun upgrade that would slash Layer 2 fees, expecting retail re-engagement.',
              scenario: 'ETH at $2,400. Fund buys 50 × $2,600 calls (8% OTM) for $180 each ($9,000 total). Target: $3,000+ within 45 days.',
              outcome: 'ETH hits $3,900 within 30 days post-upgrade. Each call worth $1,300. Net: $65,000 − $9,000 = $56,000 profit (622% return). $9,000 of spot ETH would have returned $5,625 (62.5%).',
            },
            {
              contextTag: '[Disciplined Trader, SOL catalyst play, 21-day call, exit by day 14]',
              context: 'A trader buys SOL calls on a specific platform launch event with a hard exit rule: sell day 14 regardless.',
              scenario: 'SOL at $95. Buys 3 × $100 calls (21-day expiry) for $8.50 each ($76.50 total). Platform launches on day 10.',
              outcome: 'SOL reaches $128 by day 12. Calls worth $28 each at day 14 exit. Proceeds: $84. Cost: $76.50. Profit: $7.50 (9.8%). Small in percentage but the discipline to exit before expiry preserved capital. Maximum loss had the trade failed: $76.50.',
            },
          ],
          keyTakeaway: 'Long call = defined risk (premium paid), leveraged upside. Match strike to price target, expiry to timeline. Never buy 7-day OTM calls without an imminent catalyst.',
          guidedPractice: [
            {
              question: 'You buy a $70,000 BTC call for $1,500 when BTC is at $67,000. At expiry BTC is at $74,000. What is your P&L?',
              options: ['A — +$4,000', 'B — +$2,500', 'C — +$7,000', 'D — +$3,000'],
              correct: 1,
              hint: 'P&L = (expiry price − strike) − premium. Breakeven = $71,500.',
              explanation: 'B. Intrinsic value: $74,000 − $70,000 = $4,000. Minus $1,500 premium = $2,500. A uses current spot at entry instead of strike. C forgets the premium. D is arithmetic error.',
            },
            {
              question: 'BTC at $60,000. You are very bullish on a 30% rally to $78,000 in 45 days. IV is at 35th percentile. You have $3,000. Which structure gives the best outcome specifically at $78,000?',
              options: ['A — 1 × $60,000 ATM call at $2,500', 'B — 6 × $75,000 OTM calls at $500 each', 'C — 10 × $80,000 calls at $300 each (above your target)', 'D — 1 × $55,000 ITM call at $7,200 (over budget)'],
              correct: 0,
              hint: 'Calculate profit at $78,000 for each affordable structure.',
              explanation: 'A. At $78,000: Option A returns $78,000 − $60,000 − $2,500 = $15,500 (620%). Option B (6 × $75k calls): each worth $3,000, minus $500 = $2,500 × 6 = $15,000 (500%). Option C: $80,000 strike is above $78,000 target — all expire worthless, full $3,000 loss. A wins in absolute terms at this exact target price.',
            },
            {
              question: 'You hold a $65,000 BTC call bought for $2,200. BTC is now at $71,000 with 8 days left. The option is worth $6,800 (up 209%). You still believe BTC will reach $80,000. What is the most disciplined action?',
              options: ['A — Hold everything to expiry', 'B — Close everything — take the $4,600 profit', 'C — Sell half to recover the original $2,200 cost, let the rest run for free', 'D — Buy more contracts to increase exposure'],
              correct: 2,
              hint: 'How do you lock in gains while preserving upside with zero original-capital risk?',
              explanation: 'C. Selling half (worth ~$3,400) exceeds the original $2,200 cost. Your remaining position is now "free" — original capital is recovered. If BTC hits $80,000 the rest profits further. If BTC reverses, you still net positive on the full trade. A risks giving back $6,800 unrealised. D increases risk in the final 8 days when theta is fastest.',
            },
            {
              question: 'Which scenario is the WORST use of a long call?',
              options: ['A — Buying 60-day calls ahead of a known protocol upgrade', 'B — Buying calls to limit downside risk with only $1,000 to deploy', 'C — Buying 7-day OTM calls with no specific catalyst, just a "feels bullish" view', 'D — Buying 90-day calls to position for a post-halving rally'],
              correct: 2,
              hint: 'Long calls need direction AND time. Which scenario lacks both a catalyst and adequate time?',
              explanation: 'C. Buying 7-day OTM calls with no catalyst is pure theta destruction. Without a known event, the option decays to near zero before any move materialises. OTM calls in the final week need a large, rapid move. Without a catalyst, this is a lottery ticket with near-zero edge.',
            },
            {
              question: 'You buy an ETH $3,500 call for $120 when ETH is at $3,200 (9% OTM). ETH finishes at $3,400 at expiry — up $200 but below your strike. P&L?',
              options: ['A — +$200 profit', 'B — −$120 full loss', 'C — +$80 ($200 move minus $120 premium)', 'D — Breakeven ($3,400 has $100 of value)'],
              correct: 1,
              hint: 'An option only has intrinsic value if price EXCEEDS the strike. $3,500 strike, price at $3,400.',
              explanation: 'B. At expiry with ETH at $3,400, the $3,500 call is still OTM — zero intrinsic value, full $120 loss. ETH moved in the right direction but not far enough. Breakeven required: $3,500 + $120 = $3,620. This is the OTM call trap: correct direction, wrong magnitude.',
            },
          ],
          lessonSimulations: [
            {
              type: 'chartReplay-breakout',
              scenario: 'BTC/USD daily. BTC at $58,500. A 6-week cup-and-handle has formed. Handle sits between $58,000–$59,000. Volume contracted to 0.7× the 20-period average. IV percentile: 31%. Available calls: $58,000 ATM (30-day) = $2,100; $62,000 OTM = $780; $65,000 OTM = $320. You have $4,200. Design a long call position: strike, quantity, total cost, breakeven, profit at $68,000. Justify using the pattern and IV level.',
              scoringCriteria: [
                'Identifies cup-and-handle as bullish continuation (61% historical resolution rate per Bulkowski)',
                'Notes low IV (31st percentile) favours buying — cheaper than average',
                'Selects strike and quantity within $4,200 budget',
                'Correctly calculates breakeven for chosen structure',
                'Correctly calculates profit at $68,000',
                'Justification explicitly connects IV percentile and chart pattern to the long call bias',
              ],
            },
            {
              type: 'judgment-riskAssess',
              scenario: 'You hold three long call positions: A) 3 × BTC $72,000 calls, 14 days left, cost $1,800 each, now worth $950. BTC at $68,000. B) 2 × ETH $3,800 calls, 35 days left, cost $210 each, now worth $380. ETH at $3,700. C) 5 × SOL $140 calls, 21 days left, cost $12 each, now worth $28. SOL at $132. You have $2,000 cash. State the specific action for each position and your reasoning covering theta, P&L, and remaining time.',
              scoringCriteria: [
                'Position A: Recommends closing or heavily reducing — 14 days left, 47% loss, BTC needs $4,000 recovery. Theta is accelerating. Continuing is high cost for low probability.',
                'Position B: Partial profit-taking — up 81% with 35 days remaining. Sell half to lock in gain, keep half for further upside.',
                'Position C: Partial profit-take or trailing stop — up 133% but SOL at $132 needs to breach $140 strike. Risk of reversal is significant.',
                'Does not recommend adding to Position A (never average down on expiring losers)',
                'Gives a specific action for each, not a vague market view',
              ],
            },
            {
              type: 'chartReplay-riskManage',
              scenario: 'You bought 4 × BTC $64,000 calls for $1,600 each ($6,400 total) 18 days ago on 45-day expiry. BTC moved from $63,000 to $71,500. Calls now worth $9,200 each. Total value: $36,800. Unrealised profit: $30,400. Delta 0.79, theta −$185/day, 27 days remain. Choose one: A) Hold all to expiry. B) Close all now. C) Sell 2, hold 2 with stop. D) Roll: sell current, buy 4 × $75,000 calls (45 days) for $2,100 each. Show the theta cost calculation for holding all 27 days, and justify your choice numerically.',
              scoringCriteria: [
                'Calculates theta cost of holding: 27 × $185 × 4 = $19,980 in theta if flat',
                'Notes $19,980 theta is significant relative to $30,400 unrealised gain',
                'For option C: selling 2 returns ~$18,400, exceeding original $6,400 cost — remaining 2 are risk-free rides',
                'For option D: 4 × $2,100 = $8,400 new cost — assesses whether time extension justifies cost',
                'Makes a specific choice with clear numerical justification',
              ],
            },
          ],
        },

        {
          id: 'covered-call-csp',
          title: 'Covered Call and Cash-Secured Put — Income on Your Holdings',
          explanation: `In 2022, while crypto markets fell 70%, Bitcoin miners in Texas ran a systematic options income programme. They held large BTC inventories and sold covered calls every month at strikes 15–20% above the market. In a bear market, they collected millions in premium that partially offset losses. When BTC occasionally rallied toward their strikes, they rolled calls higher. Income generation on held assets — regardless of market direction.

A covered call: you own the underlying and sell a call against it. You collect the premium immediately. If price stays below the strike at expiry, the call expires worthless, you keep the premium and the asset, then sell again next month. If price exceeds the strike, your asset gets called away — you sell at the strike regardless of how high price has gone. You gave up upside above the strike in exchange for certain income.

A cash-secured put: you sell a put option while holding enough cash to buy the asset if assigned. You collect premium immediately. If price stays above the strike, the put expires worthless — you earned income without buying the asset. If price falls below the strike, you are assigned and buy at the strike. Effective purchase price = strike − premium collected.

The covered call and cash-secured put have identical risk/reward payoff diagrams. They are the same strategy reached from different starting points. Use covered calls when you already own the asset. Use cash-secured puts when you want to buy the asset at a lower effective price.

Strike selection: professionals use the 20–30 delta range (20–30% assignment probability) for income strategies. This balances meaningful premium against low likelihood of being forced to sell or buy. Higher delta = more premium but more assignment risk. Lower delta = almost no premium.

Monthly yield = premium collected ÷ capital deployed. Annualised yield = monthly yield × 12. A 1.5% monthly yield on a $50,000 portfolio = 18% annualised from premium alone, before any capital gains.`,
          examples: [
            {
              contextTag: '[Long-term BTC Holder, monthly covered call income, bear market 2022]',
              context: 'A holder with 5 BTC wants income during a prolonged bear market without selling.',
              scenario: 'BTC at $30,000. Sells 5 × $35,000 calls (16.7% OTM, delta ~0.20) for $400 each monthly = $2,000/month. Monthly yield: 1.33%.',
              outcome: 'Over 9 months: 8 months of full premium collection = $16,000 income. Month 7, BTC rallied to $38,000 — called away at $35,000. Total from forced sale + prior premium = $191,000 vs $190,000 from pure spot holding. Premium income nearly matched holding through the cycle.',
            },
            {
              contextTag: '[ETH Accumulator, cash-secured put, disciplined buy-the-dip entry, 2023]',
              context: 'A trader wants to accumulate ETH at $1,700 during a consolidation phase between $1,600–$1,900.',
              scenario: 'ETH at $1,850. Sells 3 × $1,700 puts (8% OTM, 30-day) for $42 each = $126 total. Cash reserved: $5,100.',
              outcome: 'Three months unassigned: $378 income on $5,100 reserved (7.4% annualised). Month 4, ETH dips to $1,580 — assigned at $1,700. Effective cost after all prior premium: $1,700 − ($378/3) = $1,574/ETH. ETH at $1,580 — immediately in profit.',
            },
            {
              contextTag: '[Systematic Income Trader, SOL, dual programme, 2024]',
              context: 'A trader manages a $50,000 options income portfolio on Solana — covered calls on held SOL + cash-secured puts with remaining cash.',
              scenario: '100 SOL at $120 = $12,000. Cash: $38,000. Monthly: sell covered calls at $135 (delta 0.22) = $480/month. Sell CSPs at $105 (delta 0.20) = $320/month. Total: $800/month.',
              outcome: 'Annualised yield: 19.2% from premium alone. Over 6 months with SOL ranging $100–$145: covered calls assigned once, CSPs assigned twice. Programme generated $4,800 over 6 months regardless of net direction.',
            },
          ],
          keyTakeaway: 'Covered call: sell calls on held assets for monthly income. CSP: sell puts to earn premium while waiting to buy. Both collect theta. Both are the same payoff from different starting points. Target the 20–30 delta range for the income-vs-assignment balance.',
          guidedPractice: [
            {
              question: 'You own 2 BTC at $62,000. You sell 2 × $70,000 calls for $800 each. BTC rises to $78,000 at expiry. What is your total outcome?',
              options: ['A — Profit $16,000 from BTC rise only', 'B — Profit $17,600 (forced sale at $70k + $1,600 premium)', 'C — Profit $33,600 (full rally + premium)', 'D — Capped at $17,600 — you miss gains above $70k'],
              correct: 1,
              hint: 'You must sell at the strike. Calculate: sale proceeds + premium − original cost.',
              explanation: 'B is correct. Forced sale: 2 BTC × $70,000 = $140,000. Cost basis: 2 × $62,000 = $124,000. BTC gain: $16,000. Premium: $1,600. Total: $17,600. The gain from $70k to $78k ($16,000) was sacrificed in exchange for the $1,600 premium — a $14,400 opportunity cost. Whether this was worthwhile depends on your original outlook.',
            },
            {
              question: 'You sell a $48,000 BTC cash-secured put for $1,200. BTC falls to $40,000 at expiry. What is your effective purchase price and P&L?',
              options: ['A — Buy at $48,000, lose $8,000 vs market', 'B — Effective cost $46,800, unrealised loss $6,800', 'C — You buy at $40,000 (market price)', 'D — Effective cost $48,000, lose $6,800 offset by premium'],
              correct: 1,
              hint: 'Effective cost = strike − premium. P&L = current value − effective cost.',
              explanation: 'B. Effective cost: $48,000 − $1,200 = $46,800. BTC at $40,000 = −$6,800 unrealised. Without the put, you would have bought at $48,000 (−$8,000 paper loss). The $1,200 premium reduced the loss by $1,200. You are still underwater if you sold immediately, but the premium partially protected the position.',
            },
            {
              question: 'Which covered call strike maximises income while minimising chance of having your BTC called away?',
              options: ['A — ATM (delta 0.50) — highest premium, 50% assignment', 'B — 8% OTM (delta 0.32) — moderate premium, 32% assignment', 'C — 20% OTM (delta 0.18) — lower premium, 18% assignment', 'D — 50% OTM (delta 0.03) — minimal premium, near-zero assignment'],
              correct: 2,
              hint: 'The professional sweet spot is 20–30 delta: meaningful premium with low assignment probability.',
              explanation: 'C is the best balance for the stated goal. Delta 0.18 = 82% probability of expiring worthless. ATM (A) generates the most premium but a coin flip on assignment — too disruptive. Far OTM (D) generates almost nothing. The 20–30 delta range (B and C both qualify) is the standard professional income-selling zone.',
            },
            {
              question: 'You sold a $55,000 BTC CSP for $2,000. BTC falls to $50,000 with 5 days left. The put is now worth $5,200. What are your viable options?',
              options: ['A — Do nothing, accept assignment', 'B — Buy back for $5,200 to realise the $3,200 net loss now', 'C — Roll: buy back $55k put, sell $50k put next month for added credit', 'D — All three are valid depending on your outlook and goals'],
              correct: 3,
              hint: 'Three paths exist when a short put goes deep ITM. All are legitimate with different implications.',
              explanation: 'D. All are valid. A: accept assignment at effective $53,000 ($55k − $2k premium). You own BTC at $50,000 market — $3,000 underwater. Rational if long-term bullish. B: pay $5,200, net $3,200 loss. Clean exit if you no longer want the exposure. C: roll down and out — adjust strike, collect more premium, extend the trade. Requires careful math to ensure the roll credit covers the buyback cost. The right choice depends entirely on your outlook and position sizing.',
            },
            {
              question: 'A trader runs covered calls on 10 ETH for 12 months. Monthly calls at 15% OTM for $60 per ETH. ETH starts at $3,000 and ends at $3,200 (calls never assigned — ETH never broke 15% OTM). What is the covered call return vs pure spot holding return?',
              options: ['A — Both return 6.7%', 'B — Covered call 30.7%, spot 6.7% — CC significantly outperforms', 'C — Spot wins because of missed upside', 'D — Covered call 9.1%, spot 6.7% — marginal outperformance'],
              correct: 1,
              hint: 'Covered call return = ETH appreciation + all premium income. Spot return = ETH appreciation only.',
              explanation: 'B. Premium income: 10 ETH × $60 × 12 = $7,200. ETH appreciation: 10 × $200 = $2,000. Total CC return: $9,200 / $30,000 = 30.7%. Spot return: $2,000 / $30,000 = 6.7%. In flat-to-modestly-bullish markets, covered calls dramatically outperform. The trade-off: if ETH had rallied to $4,500, spot would have returned 50% while the CC caps at the strike.',
            },
          ],
          lessonSimulations: [
            {
              type: 'chartReplay-riskManage',
              scenario: 'You own 3 BTC at $65,000 ($195,000 total). Monthly covered call programme. BTC at $65,000, IV percentile: 58%. Available: ATM $65,000 call = $2,800 (delta 0.50); $70,000 call = $1,100 (delta 0.28); $75,000 call = $480 (delta 0.15); $80,000 call = $190 (delta 0.08). You are a long-term holder who does NOT want to sell. Choose your strike. Calculate monthly yield. Explain the delta-vs-premium trade-off for your choice, and why IV at 58th percentile matters.',
              scoringCriteria: [
                'Selects OTM strike (not ATM — 50% assignment risk is too high for a non-seller)',
                'References IV 58th percentile as "moderately elevated — premiums are decent, selling is appropriate"',
                'Calculates monthly yield correctly: (premium × 3) / $195,000',
                'States chosen strike delta as proxy for assignment probability',
                'Explicitly discusses the trade-off: higher strike = lower premium, lower assignment risk',
              ],
            },
            {
              type: 'judgment-riskAssess',
              scenario: 'You sold a BTC $68,000 CSP for $1,800 premium 20 days ago (30-day option, BTC was $71,000). Today BTC crashed to $61,000. The put is now worth $7,200. Three choices: A) Accept assignment in 10 days at $68,000 (effective cost $66,200). B) Buy back now for $7,200 (net $5,400 loss). C) Roll: buy back $68,000 put ($7,200), sell $64,000 put next month for $2,400 (net roll debit $4,800). State which path you choose with specific numerical justification and your BTC price outlook.',
              scoringCriteria: [
                'Correctly calculates all three outcomes',
                'Choice explicitly tied to stated BTC outlook — bullish = A or C; uncertain = B',
                'For C: correctly states new effective cost if assigned = $64,000 + $3,000 net debit from the roll = $67,000',
                'Notes that C extends risk by 30 days and only makes sense if expecting recovery',
                'Provides a specific recommendation with numbers — no vague "it depends" without resolution',
              ],
            },
            {
              type: 'sandbox-dataModel',
              scenario: 'Design a 3-month covered call income programme. Holdings: 5 ETH at $3,400 ($17,000 total). Goal: monthly income, no selling (assignment probability < 25%). Available: $3,600 call (delta 0.32) = $145; $3,800 call (delta 0.22) = $88; $4,000 call (delta 0.15) = $52; $4,200 call (delta 0.09) = $28. For your chosen strike calculate: (1) monthly income, (2) monthly yield, (3) annualised yield, (4) max profit if assigned, (5) breakeven downside after 3 months of premium.',
              scoringCriteria: [
                'Selects $3,800 or $4,000 (only options with delta < 0.25)',
                'Example $3,800: 5 × $88 = $440/month',
                'Monthly yield: $440 / $17,000 = 2.59%',
                'Annualised: 2.59% × 12 = 31%',
                'Max profit if assigned at $3,800: (($3,800 − $3,400) × 5) + $440 = $2,440',
                'Breakeven downside: $17,000 − ($440 × 3) = $15,680 → ETH at $3,136 effective cost',
              ],
            },
          ],
        },

        {
          id: 'vertical-spreads',
          title: 'Vertical Spreads — Defined Risk, Defined Reward',
          explanation: `In March 2023, Coinbase was under regulatory pressure. A trader was moderately bearish — expecting a 15–20% decline but not a collapse. IV was elevated at 85%, making naked puts expensive. Instead, they bought a bear put spread: bought $60 puts, sold $45 puts, net cost $4.50. If Coinbase fell to $45, the $15 spread was worth $10.50 — a 233% return on $4.50. The spread cost less than half a naked put and still captured the entire expected move.

A vertical spread: buy one option, sell another of the same type (both calls or both puts), same expiry, different strikes. The sold option offsets the cost of the bought option. In exchange for cheaper entry, you cap maximum profit.

Bull call spread: buy lower-strike call, sell higher-strike call. Net debit. You profit when price rises above your lower strike. Maximum gain is the spread width minus net debit.

Bear put spread: buy higher-strike put, sell lower-strike put. Net debit. Profits when price falls below the upper strike. Maximum gain is spread width minus net debit.

Credit spreads flip this around. Bull put spread: sell higher-strike put, buy lower-strike put. You collect net credit — keep it all if price stays above the short put. Bear call spread: sell lower-strike call, buy higher-strike call. Collect credit if price stays below the short call.

Key formulas for all vertical spreads:
• Spread width = upper strike − lower strike
• Max profit (debit spread) = spread width − net debit
• Max profit (credit spread) = net credit received
• Max loss (debit spread) = net debit
• Max loss (credit spread) = spread width − net credit
• Breakeven (bull call) = lower strike + net debit
• Breakeven (bear put) = higher strike − net debit

Spreads are especially powerful in high-IV environments. When IV is at the 70th+ percentile, naked options are expensive — the sold second leg of a spread refunds a large fraction of the premium cost while you still capture your target price move.`,
          examples: [
            {
              contextTag: '[Options Trader, BTC bull call spread, moderate upside, high-IV entry, 2024]',
              context: 'Trader is moderately bullish on BTC with IV at 72th percentile — making naked calls expensive.',
              scenario: 'BTC at $67,000. Target $75,000 in 30 days. Buy $67,000 call for $2,900, sell $75,000 call for $800. Net debit: $2,100. Spread width: $8,000. Max profit: $5,900. Breakeven: $69,100.',
              outcome: 'BTC reaches $74,500. Lower call worth $7,500. Upper call ($75k) just OTM = $0. Spread value: $7,500. Profit: $7,500 − $2,100 = $5,400 (257%). A naked $67k call would have returned $4,600 (159% on $2,900). The spread outperformed because it cost less and the short leg contributed no drag at $74,500.',
            },
            {
              contextTag: '[Credit Spread Seller, ETH monthly bull put spread, systematic income, 2023]',
              context: 'A systematic trader sells monthly ETH bull put spreads to collect credit with defined downside.',
              scenario: 'ETH at $1,900. Sell $1,750 put for $85, buy $1,600 put for $32. Net credit: $53. Max profit: $53. Max loss: $97. Win probability (ETH stays above $1,750): ~72%.',
              outcome: 'Over 6 months: 5 full profits ($53 × 5 = $265). One max loss ($97) when ETH dipped to $1,600. Net: $265 − $97 = $168 on $97 max risk per spread = 173% annualised return on risk capital. The defined maximum loss was essential — trader knew worst-case per spread at entry.',
            },
            {
              contextTag: '[High-IV Spread vs Naked Comparison, BTC, post-event IV crush, 2024]',
              context: 'Two accounts test naked call vs bull call spread during IV 78th percentile ahead of an SEC announcement.',
              scenario: 'BTC at $62,000. Account A: naked $62,000 call for $3,200. Account B: $62,000/$70,000 bull call spread for $1,800 net debit. BTC moves to $68,000, IV drops from 78% to 52% post-announcement.',
              outcome: 'Account A: delta gain ~$3,000, vega loss ~$780. Net ~$2,220 profit. Account B: spread gain ~$1,800. No net vega drag (long and short vegas offset). Net ~$1,800 profit at half the capital deployed. Spread ROI higher: $1,800/$1,800 = 100% vs $2,220/$3,200 = 69%.',
            },
          ],
          keyTakeaway: 'Vertical spreads: buy one option, sell another at a different strike. Cheaper entry, capped upside. Maximum loss = net debit (debit spread). Maximum profit = spread width − net debit. Ideal in high-IV environments to reduce premium paid.',
          guidedPractice: [
            {
              question: 'You buy a $60,000/$68,000 BTC bull call spread for $2,400. BTC expires at $71,000. What is your profit?',
              options: ['A — $8,600 (spread + overshoot)', 'B — $5,600 (max profit: $8,000 spread − $2,400)', 'C — $11,000 (intrinsic on lower call)', 'D — $3,000 (gain above upper strike)'],
              correct: 1,
              hint: 'At expiry above $68,000 both legs are fully ITM. Spread value is capped at the spread width.',
              explanation: 'B. At $71,000: long $60k call = $11,000, short $68k call = −$3,000. Net spread = $8,000 (the maximum). Profit: $8,000 − $2,400 = $5,600. The spread caps at $8,000 regardless of how far above $68,000 BTC goes. A incorrectly adds the overshoot. C ignores the short call obligation.',
            },
            {
              question: 'You sell a $55,000/$50,000 BTC bull put credit spread, collecting $1,200. Spread width $5,000. BTC falls to $48,000 at expiry. What is your loss?',
              options: ['A — −$1,200 (lose only the credit)', 'B — −$3,800 (spread width − credit)', 'C — −$5,000 (full spread width)', 'D — −$7,000 (loss below both strikes)'],
              correct: 1,
              hint: 'Max loss on a credit spread = spread width − credit received. The long put caps the loss at the lower strike.',
              explanation: 'B. At $48,000 below both strikes, you suffer maximum loss. Max loss = $5,000 − $1,200 = $3,800. Short $55k put: −$7,000. Long $50k put: +$2,000. Net: −$5,000. Plus $1,200 credit = −$3,800. The long put prevented a naked put loss that would have been $7,000 − $1,200 = $5,800.',
            },
            {
              question: 'BTC at $65,000. IV at 82nd percentile. You are moderately bullish with a $72,000 target in 30 days. Best structure?',
              options: ['A — Naked ATM call: maximise directional gain', 'B — $65,000/$72,000 bull call spread: match target, reduce IV cost', 'C — Cash-secured put at $60,000: collect premium', 'D — Far OTM $85,000 calls: maximum leverage'],
              correct: 1,
              hint: 'IV 82nd percentile = expensive options. Your target is $72,000 — what structure perfectly captures that move at minimum cost?',
              explanation: 'B. Selling the $72,000 call (your target) offsets the cost of buying the $65,000 call. You sacrifice gains above $72,000 — but since that is your target, you lose nothing of your intended profit. At high IV, this spread dramatically reduces the premium you pay. A overpays for time value above your target. D is extremely expensive at IV 82% and needs a move far beyond your target.',
            },
            {
              question: 'Bear put spread: ETH at $3,000. Buy $3,000 put for $180, sell $2,600 put for $60. What is the breakeven price?',
              options: ['A — $2,880 ($3,000 − $120 net debit)', 'B — $2,760 ($3,000 − $240 combined)', 'C — $2,600 (lower strike)', 'D — $3,120 ($3,000 + $120)'],
              correct: 0,
              hint: 'Breakeven for bear put spread = higher strike − net debit. Net debit = $180 − $60.',
              explanation: 'A. Net debit: $180 − $60 = $120. Breakeven: $3,000 − $120 = $2,880. Below $2,880 the spread is profitable. Maximum profit is achieved at $2,600 or below. D incorrectly adds the debit (that would be a call breakeven direction).',
            },
            {
              question: 'Compare a $60,000 naked put bought for $2,800 vs a $60,000/$53,000 bear put spread bought for $1,400. BTC crashes to $50,000. Which generates more profit and by how much in absolute terms?',
              options: ['A — Naked put: $7,200. Spread: $5,600. Naked put wins by $1,600.', 'B — Both generate $7,200.', 'C — Naked put $7,200, spread $4,200. Naked wins by $3,000.', 'D — Spread wins on ROI even if lower absolute profit.'],
              correct: 0,
              hint: 'Calculate actual dollar profit for each at $50,000. For the spread, the short $53,000 put is ITM and offsets some of the long put gain.',
              explanation: 'A. Naked put: ($60k − $50k) − $2,800 = $7,200. Bear put spread: long $60k put = $10,000. Short $53k put = −$3,000 (owe this). Spread value = $7,000. Profit: $7,000 − $1,400 = $5,600. Naked put wins by $1,600 in absolute terms. However, ROI: naked put 257% ($7,200/$2,800), spread 400% ($5,600/$1,400). The spread wins on capital efficiency even while losing on absolute dollars.',
            },
          ],
          lessonSimulations: [
            {
              type: 'chartReplay-patternID',
              scenario: 'BTC/USD daily. BTC at $71,000. Double-top pattern forming at $73,500 (tested twice). RSI divergence: price made a new high but RSI made a lower high. Volume on second top: 0.8× 20-period average. IV percentile: 68%. You are moderately bearish, targeting $63,000 in 30 days. Design a bear put spread: pick two strikes, state net debit, max profit, max loss, breakeven, profit at exactly $63,000. Explain why a spread is more appropriate than a naked put at IV 68th percentile.',
              scoringCriteria: [
                'Identifies double-top as bearish reversal pattern (83% bearish resolution rate per Bulkowski)',
                'Notes RSI divergence and declining volume as momentum confirmation',
                'Selects bear put spread with upper strike near $71,000 and lower strike near $63,000 target',
                'Correctly calculates net debit, max profit, breakeven, profit at $63,000',
                'Explains: at IV 68th percentile, naked puts are expensive. Selling the lower put reduces the vega exposure and premium cost without sacrificing target-price profit',
              ],
            },
            {
              type: 'judgment-prioritisation',
              scenario: 'ETH at $3,200. You are bullish with a $3,600 target in 30 days. IV at 74th percentile. $10,000 to deploy. Four structures: (1) 3 × $3,200 naked calls at $280 = $840 total. (2) 5 × $3,200/$3,600 bull call spreads at $120 net debit = $600 total. (3) Sell 8 × $3,000/$2,800 bull put credit spreads, collecting $55 each = +$440 credit. (4) 2 × $3,000 ITM calls at $420 = $840 total. Calculate cost/credit, max profit, max loss, and profit at exactly $3,600 for each. Rank from best to worst for your stated goal.',
              scoringCriteria: [
                'Structure 1: cost $840, unlimited max profit, max loss $840, profit at $3,600: (3 × $400) − $840 = $360',
                'Structure 2: cost $600, max profit 5 × ($400 − $120) = $1,400, max loss $600, profit at $3,600: $1,400',
                'Structure 3: credit $440, max profit $440, max loss 8 × ($200 − $55) = $1,160, profit at $3,600: +$440 (above short put, full credit)',
                'Structure 4: cost $840, profit at $3,600: 2 × ($3,600 − $3,000 − $420) = $360',
                'Correct ranking: Structure 2 best (highest profit at target, aligned strike, lower cost in high-IV); Structure 3 second (income, but no upside participation); Structure 1 third; Structure 4 worst (same profit as 1 at higher cost)',
              ],
            },
            {
              type: 'sandbox-dataModel',
              scenario: 'Build and analyse four BTC vertical spreads (BTC at $66,000). Show all calculations. A) Buy $66,000 call / sell $72,000 call. Premiums: $2,600 / $900. B) Buy $60,000 put / sell $54,000 put. Premiums: $1,800 / $650. C) Sell $63,000 put / buy $59,000 put. Premiums: $1,400 / $600. D) Sell $70,000 call / buy $75,000 call. Premiums: $650 / $200. For each: net debit/credit, max profit, max loss, breakeven, P&L at BTC = $68,000.',
              scoringCriteria: [
                'Spread A: debit $1,700, max profit $4,300, max loss $1,700, breakeven $67,700, P&L at $68k: $300',
                'Spread B: debit $1,150, max profit $4,850, max loss $1,150, breakeven $58,850, P&L at $68k: −$1,150 (BTC above all put strikes)',
                'Spread C: credit $800, max profit $800, max loss $3,200, breakeven $62,200, P&L at $68k: +$800 (both puts OTM)',
                'Spread D: credit $450, max profit $450, max loss $4,550, breakeven $70,450, P&L at $68k: +$450 (both calls OTM)',
                'All four calculated correctly and clearly labelled',
              ],
            },
          ],
        },
      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['chartReplay-breakout', 'chartReplay-patternID', 'chartReplay-riskManage', 'judgment-riskAssess', 'judgment-prioritisation', 'sandbox-dataModel'],
        description: 'Random draw from all Lab 3 lessons. Tests long calls, covered calls, CSPs, and vertical spreads under no-label conditions.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        passThreshold: 0.80,
      },

      bossMode: {
        title: 'Lab 3 Boss Battle — Strategy Selection Under Real Conditions',
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers' },
        scenarios: [
          {
            id: 'lab3-boss-1',
            situation: `You manage a $50,000 crypto options portfolio: 5 ETH at $3,100 ($15,500) + $34,500 cash. ETH at $3,100, IV percentile: 55%. A major ETH network upgrade is in 22 days. You expect ETH to move ±15% post-upgrade but do not know direction.

Execute THREE actions:
1. Generate income from 5 ETH this month (covered call)
2. Position for the post-upgrade move with defined risk, max $3,000 capital
3. Protect your ETH if the upgrade causes a crash below $2,600

For each: specify the exact option(s), strike, expiry, cost/credit, and reasoning.`,
            scoringCriteria: [
              'Action 1: Sells covered calls with expiry AFTER the upgrade (upgrade could cause assignment — choosing pre-upgrade expiry is wrong). Strike selection above current price with delta/premium calculation shown.',
              'Action 2: Selects a non-directional structure (straddle/strangle) OR a defined-risk spread within $3,000. Must explicitly state that the structure handles uncertainty of direction. Calculations shown.',
              'Action 3: Buys $2,600 (or near) put options on 5 ETH. Calculates total cost and explains the protection floor.',
              'Actions internally consistent — covered call strike is not so low it would be assigned before the upgrade if ETH moves up',
              'Total capital tracked across all three actions and does not exceed $50,000',
            ],
          },
        ],
      },
    },
    // ═══════════════════════════════════════════════════════════════════════════
    // LAB 4: ADVANCED MULTI-LEG STRATEGIES
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 'advanced-strategies',
      title: `Lab 4: Advanced Strategies — Using Multiple Options at Once`,
      subtitle: `Learn to combine options into powerful structures that profit from calm markets, big moves, or anything in between.`,
      lessons: [

        // ─── LESSON 1 ────────────────────────────────────────────────────────
        {
          id: 'straddles-strangles',
          title: `Straddles and Strangles — Betting on a Big Move (Without Picking a Direction)`,
          explanation: `Imagine you hear that the government is about to make a major announcement about Bitcoin. You have no idea if it's good news or bad news — but you're almost certain the price is going to move a lot either way.

This is the exact situation where a straddle or strangle makes sense. These are options strategies that let you profit from a big price move without needing to predict which direction it goes.

A long straddle means you buy two options at the same time on the same asset:
• One call option (profits if price goes UP)
• One put option (profits if price goes DOWN)
Both options have the same strike price and same expiry date.

If the price shoots up, your call option makes money. If the price crashes, your put option makes money. You lose only if the price barely moves at all — because then both options expire worth very little, and you've paid for both of them.

Think of it like buying tickets to two sporting events happening on the same day. If either event becomes the biggest game of the year, you cash in. If both events are cancelled, you lost the ticket money.

The total cost you paid for both options is your maximum loss. The breakeven works like this: you need the price to move more than what you paid, in either direction. If you paid $2,000 for both options and the strike is $60,000, you need BTC to reach either $62,000 (up) or $58,000 (down) just to break even. Beyond those levels, you start making money.

A long strangle is the cheaper cousin of the straddle. Instead of both options being at the exact current price (ATM), you buy options slightly away from the current price — a lower-strike put and a higher-strike call. This costs less, but the price needs to move even further before you profit.

Think of it like this: a straddle is a smaller, more expensive bet that a big move is coming soon. A strangle is a cheaper bet on a truly massive move.

When should you use these? When options are relatively cheap (low IV), and you believe something is about to happen — a major announcement, an upgrade, a regulatory decision — that will cause a significant price swing. The trap beginners fall into: buying straddles right before a major event when everyone else is doing the same — which drives option prices sky-high. If you overpay for the straddle, even a big move might not be enough to profit.`,
          visualPrompt: `👆 See how a straddle profits when price moves far in either direction`,
          visualType: `image`,
          visualUrl: `straddle-payoff-diagram`,
          examples: [
            {
              contextTag: `[Crypto trader, BTC straddle before ETF approval, January 2024]`,
              context: `A trader knew the SEC was about to decide on the first Bitcoin spot ETF. Approval would send BTC up. Rejection would send it down. Either way, it was going to move.`,
              scenario: `BTC is at $43,000. The trader buys a $43,000 straddle — one call and one put — paying $1,800 for the call and $1,700 for the put. Total cost: $3,500. Breakeven: BTC needs to move to either $46,500 (up 8%) or $39,500 (down 8%) just to break even.`,
              outcome: `ETF approval is announced. BTC jumps to $49,200 — a 14.4% move. The call option is now worth $6,200. The put is worth almost nothing. Total value: $6,200. Minus the $3,500 paid = $2,700 profit. The actual move (14.4%) was much bigger than the breakeven needed (8%), which is why the straddle worked.`,
            },
            {
              contextTag: `[Trader, BTC straddle — timing mistake, learning example, 2024]`,
              context: `A trader also wanted to trade the Bitcoin halving in April 2024 with a straddle — but waited until the day before the event to buy.`,
              scenario: `BTC at $63,000. By the day before the halving, everyone is excited and option prices have doubled. The same straddle that would have cost $4,000 a week earlier now costs $8,200. The market is implying BTC will move 13% from this event.`,
              outcome: `The halving happens. BTC moves from $63,000 to $67,000 — a 6.3% move. That sounds good, but the straddle needed a 13% move to break even. The trader paid too much. Total straddle value at expiry: about $4,000. They paid $8,200. Loss: $4,200. Lesson: buying straddles after option prices have already spiked in anticipation of an event is one of the most common and painful mistakes beginners make.`,
            },
            {
              contextTag: `[Income trader, selling straddles on ETH, range-bound market, 2023]`,
              context: `A more experienced trader noticed that ETH had been moving very little for weeks after the Shanghai upgrade. Instead of buying straddles, they sold them — betting the market would stay calm.`,
              scenario: `ETH at $1,900. The trader sells a $1,900 straddle, collecting $320 in premium. Their profit zone: ETH stays between $1,580 and $2,220 for 30 days. If ETH leaves that range, losses grow.`,
              outcome: `ETH trades quietly between $1,750 and $2,050 the entire month. Both options expire worthless. The trader keeps the full $320. They repeat this for 4 months, collecting $320 each time = $1,280 total. In month 5, ETH breaks out to $2,400. The straddle they sold loses $500. Net result after 5 months: $1,280 - $500 = $780 profit. This shows that selling straddles in calm markets can be profitable — but a single big move can wipe out several months of income.`,
            },
          ],
          keyTakeaway: `A straddle lets you profit from a big move in either direction. You pay for both a call and a put. You lose only if the market doesn't move enough to cover what you paid. Buy straddles when options are cheap and a big event is coming. Never buy them after option prices have already spiked.`,
          guidedPractice: [
            {
              question: `You buy a BTC straddle at $62,000 strike. You pay $2,000 for the call and $1,800 for the put. What does BTC need to reach for you to break even on the upside?`,
              options: [
                `A — $64,000`,
                `B — $65,800`,
                `C — $63,800`,
                `D — $66,000`,
              ],
              correct: 1,
              hint: `Add the total premium paid to the strike price to find the upside breakeven.`,
              explanation: `B is correct. Total cost: $2,000 + $1,800 = $3,800. Upside breakeven = strike + total cost = $62,000 + $3,800 = $65,800. The call option only starts making you money above $64,000 (the strike), but you also have to recover the $1,800 you spent on the put that expired worthless. You need the full $3,800 move to break even. A only adds the call premium. C only adds the put premium. D adds $4,000 instead of $3,800.`,
            },
            {
              question: `A straddle costs $4,500 total when BTC is at $68,000. What does this tell you the options market is "expecting" BTC to move?`,
              options: [
                `A — Up by exactly $4,500`,
                `B — About 6.6% in either direction`,
                `C — Nothing — straddle prices don't indicate expected moves`,
                `D — Exactly $4,500 down only`,
              ],
              correct: 1,
              hint: `Divide the straddle price by the current asset price to get the expected percentage move.`,
              explanation: `B is correct. $4,500 ÷ $68,000 = 6.6%. This is the options market's way of saying "we're pricing in about a 6.6% move in either direction." If you buy the straddle, you need the actual move to be bigger than 6.6% to profit. If you sell it, you're betting the actual move will be smaller. This number is called the "implied move" — it's one of the most useful pieces of information on the options chain.`,
            },
            {
              question: `You bought a straddle because you expected a big move after a major announcement. The announcement happens, but it's a non-event — BTC moves only 1%. What happens to your straddle?`,
              options: [
                `A — You still profit because you owned both options`,
                `B — You lose most or all of what you paid`,
                `C — You break even — one option gained while the other lost`,
                `D — You get a refund from the options exchange`,
              ],
              correct: 1,
              hint: `A straddle's enemy is a market that doesn't move. Think about what both options are worth after a tiny move.`,
              explanation: `B is correct. After a 1% move, both the call and the put are nearly worthless — the call barely gained value and the put barely lost value, but neither is significantly in the money. You paid for a big move and didn't get one. Both options decay toward zero. This is the biggest risk of straddles: if your catalyst turns out to be a "buy the rumour, sell the news" event and nothing happens, you lose the full premium paid. Always check: is the straddle cheap or expensive before buying it?`,
            },
            {
              question: `How is a strangle different from a straddle?`,
              options: [
                `A — A strangle uses calls only; a straddle uses calls and puts`,
                `B — A strangle buys options away from the current price, making it cheaper but requiring a bigger move to profit`,
                `C — A strangle expires sooner than a straddle`,
                `D — There is no difference — they are the same strategy`,
              ],
              correct: 1,
              hint: `Think about where the strikes are in each strategy — at the current price, or away from it?`,
              explanation: `B is correct. A straddle buys both options at the current price (ATM — at-the-money), which means they cost more but need a smaller move to start making money. A strangle buys a lower-strike put and a higher-strike call — both away from the current price — which makes it cheaper upfront but requires a bigger move to reach profitability. If you think the move will be huge (20%+ for example), a strangle might be more capital-efficient. If you think the move will be large but more moderate, a straddle's ATM options capture profit sooner.`,
            },
            {
              question: `Which market condition is BEST for buying a straddle?`,
              options: [
                `A — Option prices are very expensive (high IV) and a major announcement just happened`,
                `B — Option prices are historically cheap (low IV) and a known major event is coming in 2 weeks`,
                `C — The market has been very volatile all week`,
                `D — You have no opinion about whether the market will move`,
              ],
              correct: 1,
              hint: `You want to buy something when it's cheap, not expensive. And you want to buy it before the event drives up option prices, not after.`,
              explanation: `B is correct. The ideal straddle entry is: cheap options (low IV) + upcoming catalyst. This means you pay a low price for the straddle before the event drives up option costs, and then benefit from both the price move AND the rise in option prices (IV expansion) as the event approaches. Option A is the opposite — buying expensive options after the event typically leads to losses because even a big move might not exceed what you overpaid. C means options are already expensive. D has no reason to pay for a straddle if you don't expect a move.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You are looking at two potential straddle trades. Here is all the data:

Trade A — BTC at $65,000:
• Upcoming event: FOMC meeting in 10 days
• ATM straddle cost: $6,100 (9.4% of BTC price)
• Average BTC move in past 8 FOMC meetings: 7.2%
• Current IV percentile: 82nd (options very expensive right now)

Trade B — ETH at $3,200:
• Upcoming event: Major Ethereum protocol upgrade in 14 days
• ATM straddle cost: $210 (6.6% of ETH price)
• Average ETH move on past 5 protocol upgrades: 11.4%
• Current IV percentile: 24th (options historically cheap right now)

Which trade do you take, and why? Use the implied move and historical actual move to support your answer.`,
              scoringCriteria: [
                `Correctly calculates Trade A implied move: $6,100 / $65,000 = 9.4%. Historical average: 7.2%. Actual moves have been SMALLER than priced in — bad for buyers.`,
                `Correctly calculates Trade B implied move: $210 / $3,200 = 6.6%. Historical average: 11.4%. Actual moves have been LARGER than priced in — good for buyers.`,
                `User identifies Trade B as the superior trade: cheaper options + historical moves that exceed the implied move`,
                `User notes that Trade A has expensive options (82nd IV percentile) AND a historical move smaller than what's priced in — a double-negative for straddle buyers`,
                `User's recommendation is clearly stated with numerical support`,
              ],
            },
            {
              type: `chartReplay-breakout`,
              scenario: `BTC/USD daily chart. BTC has been trading in a very tight range of $63,000–$65,000 for 6 weeks. Volume is at the lowest level in 3 months. IV percentile is at the 18th — options are near their cheapest in a year.

You believe this is a classic "coiled spring" — a compression pattern that typically breaks out sharply in one direction, but you genuinely don't know which way.

Design a straddle or strangle trade:
1. Which structure do you choose and why?
2. What strike(s) do you pick?
3. What expiry do you choose (7-day, 30-day, or 60-day) and why?
4. What is your maximum loss and what does BTC need to do for you to profit?`,
              scoringCriteria: [
                `User chooses straddle or strangle — either is acceptable with justification`,
                `User references low IV (18th percentile) as the key reason to BUY rather than sell — options are cheap`,
                `Strike selection: straddle at $64,000 (midpoint of range) or strangle with $61,000 put / $67,000 call — any reasonable choice accepted`,
                `Expiry: 30-day minimum recommended (not 7-day — needs time for the breakout to develop). 60-day also acceptable.`,
                `User correctly calculates maximum loss (total premium paid) and both breakeven prices`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `You sold a BTC straddle 12 days ago — collected $4,800 total. Strike: $67,000. Expiry: 30 days from entry (18 days remaining).

BTC was at $67,000 when you sold. Today BTC is at $73,500 — up 9.7%.

Current option values:
• The call you sold (short $67,000 call): now worth $7,100
• The put you sold (short $67,000 put): now worth $80

Your current position P&L: you collected $4,800, but closing both positions would cost $7,180. That is an unrealised loss of $2,380.

You have three choices:
A — Close the entire position now, take the $2,380 loss
B — Hold and hope BTC drops back below $71,800 (your upside breakeven) in 18 days
C — Buy a $76,000 call for $1,200 to "cap" your potential loss on the short call side

For each choice, state: (1) what happens if BTC keeps rising to $78,000, (2) what happens if BTC drops back to $67,000, (3) which choice you make and why.`,
              scoringCriteria: [
                `Choice A at $78k: no further loss — locked in $2,380 loss already. At $67k: same, locked.`,
                `Choice B at $78k: short call now worth $11,000. Loss grows to ($11,000 + $80) - $4,800 = $6,280 loss. At $67k: both expire worthless, keep $4,800 — but requires BTC to fall $6,500 in 18 days.`,
                `Choice C at $78k: short call loses $11,000 but long $76,000 call gains $2,000. Net: $9,080 owed, minus $4,800 received, minus $1,200 hedge cost = $5,480 loss. But loss is now capped. At $67k: all calls expire worthless, keep $4,800 minus $1,200 hedge = $3,600 profit.`,
                `User makes a clear choice with reasoning — C is generally wisest (caps unlimited upside loss) but A is acceptable (clean exit with known loss)`,
                `User correctly identifies that B has the worst risk profile — hoping for a large reversal with potentially unlimited loss if wrong`,
              ],
            },
          ],
        },

        // ─── LESSON 2 ────────────────────────────────────────────────────────
        {
          id: 'iron-condor',
          title: `The Iron Condor — Getting Paid When the Market Does Nothing`,
          explanation: `Picture a landlord who rents out four apartments. Every month, rent comes in automatically — whether the neighbourhood is booming or quiet. The landlord doesn't need the neighbourhood to get expensive. They just need things to stay stable.

The iron condor is the options equivalent of being a landlord. You collect premium income upfront and profit when the market stays in a calm range.

Here's how it works in plain terms:

You set an upper boundary and a lower boundary for the price. You are saying: "I think the price will stay between these two boundaries until expiry." If you're right, you keep the income. If the price breaks out strongly in either direction, you face a limited, defined loss.

An iron condor is built from four options — two on the call side (upside) and two on the put side (downside):

On the upside: You sell a call at a level you think the price won't reach. You buy a call at an even higher level to protect yourself if you're wrong.

On the downside: You sell a put at a level you think the price won't fall below. You buy a put at an even lower level to protect yourself if you're wrong.

The two sold options bring in money (premium). The two bought options cost a little — but they act like a safety net. They limit how much you can lose if the price moves dramatically.

This is why it's called a "defined-risk" strategy — you always know your worst case before you enter the trade.

A real example: Bitcoin is at $65,000. You think it'll stay between $58,000 and $72,000 for the next 30 days. You set up your condor with those levels. You collect $800 in premium. If BTC stays in the zone: you keep $800. If BTC crashes to $50,000: you lose a capped amount, maybe $1,200. If BTC rockets to $80,000: same thing — a defined loss, not a catastrophic one.

The sweet spot: iron condors work best in calm, sideways markets with no major upcoming events. They struggle when markets trend strongly in one direction. Think of it as the opposite of the straddle — where a straddle profits from chaos, an iron condor profits from calm.`,
          visualPrompt: `👆 See the iron condor profit zone — the flat profit area between four strike prices`,
          visualType: `image`,
          visualUrl: `iron-condor-diagram`,
          examples: [
            {
              contextTag: `[Range trader, BTC iron condor, sideways market, 2023]`,
              context: `Bitcoin spent most of 2023 between $25,000 and $32,000. A trader noticed this pattern and used monthly iron condors to collect steady income.`,
              scenario: `BTC at $28,500. The trader sets up a condor: sell $31,000 call, buy $33,500 call (call side). Sell $26,000 put, buy $23,500 put (put side). Collects $380 total. Max loss if BTC breaks out: $2,120. Profit zone: BTC stays between $26,000 and $31,000.`,
              outcome: `Five months in a row, BTC stays in the range. The trader collects $380 × 5 = $1,900 in income. In month 6, BTC breaks above $32,000 and the call spread gets hit — a $1,400 loss. Net result over 6 months: $1,900 - $1,400 = $500 profit. The strategy worked because the 5 winning months covered the 1 losing month, with money left over. Sizing and discipline were key — the trader never used so much capital that one losing month would wipe out the account.`,
            },
            {
              contextTag: `[New trader, ETH iron condor, 50% profit target rule, 2024]`,
              context: `A new options trader learns to use iron condors and is taught one critical rule: close the trade once you've made 50% of the maximum possible profit. Don't be greedy and wait for 100%.`,
              scenario: `ETH at $3,200. Condor collects $240 premium. Maximum profit: $240. After 14 of the 30 days, the condor has decayed enough that it could be closed for $120 — exactly 50% of max profit.`,
              outcome: `The trader closes at day 14 and captures $120 profit. They reopen a fresh condor immediately. By taking 50% profit early, they free up capital for a new trade and avoid the riskiest period of the condor's life — the final 2 weeks when a surprise move could cause a large loss. Over 12 months of using this system, they average 2.2 condors per month and collect consistent income, with only 2 loss months out of 12.`,
            },
            {
              contextTag: `[Experienced trader, BTC iron condor — wrong environment, lesson]`,
              context: `A trader deploying iron condors during the Bitcoin bull run of early 2024 discovers that condors fail in trending markets.`,
              scenario: `BTC at $52,000. The trader assumes the recent rally will cool and deploys a condor: sell $58,000 call, buy $62,000 call / sell $47,000 put, buy $43,000 put. Collects $620. Within 10 days, BTC surges to $64,000 — blasting through both call strikes.`,
              outcome: `The call spread maxes out its loss: $4,000 - $620 = $3,380 loss. The trader loses 5× their collected premium in 10 days. Lesson: iron condors are a "calm market" strategy. The time to avoid them is during strong trends, after big news catalysts, or when IV is historically low (because when IV is low, it often means a breakout is coming). Always check: is the market in a range, or is it trending?`,
            },
          ],
          keyTakeaway: `An iron condor collects income when the price stays in a range. You know your maximum profit (the premium collected) and maximum loss (the spread width minus premium) before you enter. Best in calm, sideways markets. Close at 50% profit rather than holding to expiry.`,
          guidedPractice: [
            {
              question: `You set up a BTC iron condor. You sell a $70,000 call and buy a $73,000 call. You sell a $58,000 put and buy a $55,000 put. Each spread is $3,000 wide. You collect $900 total premium. What is your maximum profit?`,
              options: [
                `A — $3,000`,
                `B — $2,100`,
                `C — $900`,
                `D — $6,000`,
              ],
              correct: 2,
              hint: `Maximum profit on an iron condor is the premium you collect — you earn it if both spreads expire worthless.`,
              explanation: `C is correct. Your maximum profit is simply the $900 premium you collected. This happens when BTC stays between $58,000 and $70,000 at expiry — all four options expire worthless and you keep everything you collected. The $3,000 spread width is relevant to the maximum loss calculation, not the maximum profit. D adds both spread widths. B is the maximum loss figure ($3,000 - $900).`,
            },
            {
              question: `Using the same iron condor (collected $900, spread width $3,000 on each side), what is your maximum loss if BTC crashes to $50,000?`,
              options: [
                `A — $900 (you only lose the premium collected)`,
                `B — $3,000 (the full spread width)`,
                `C — $2,100 ($3,000 spread width minus $900 premium collected)`,
                `D — Unlimited loss`,
              ],
              correct: 2,
              hint: `The long put you bought at $55,000 caps your loss. Maximum loss = spread width minus premium received.`,
              explanation: `C is correct. At $50,000, the put spread is fully "maxed out." You lose $3,000 on the put spread (the difference between your short $58,000 put and long $55,000 put). But you already collected $900 in premium, which reduces the loss. Net maximum loss: $3,000 - $900 = $2,100. D is wrong — this is the whole point of buying the protective wings. Unlike selling a naked put (unlimited loss), the iron condor's bought options cap the damage. This defined maximum loss is what makes iron condors manageable for disciplined traders.`,
            },
            {
              question: `What kind of market condition is an iron condor DESIGNED for?`,
              options: [
                `A — A strongly trending market going in one clear direction`,
                `B — A market that is about to make a huge surprise move`,
                `C — A calm, sideways market where price stays in a range`,
                `D — A market right before a major news event`,
              ],
              correct: 2,
              hint: `Iron condors profit when both sides stay OTM — when does that happen?`,
              explanation: `C is correct. Iron condors profit when the price stays quietly between the two short strikes. That happens in sideways, calm markets. Options A, B, and D all describe conditions where price is likely to move dramatically — breaking out of the condor's profit zone. The iron condor is basically the opposite of a straddle in terms of what you're hoping for. Straddle: "please move a lot." Iron condor: "please don't move much at all."`,
            },
            {
              question: `Your iron condor collected $600. After 18 of 30 days, the position could be closed for $300 (you'd pocket $300 profit). There are 12 days left. What is the professional approach?`,
              options: [
                `A — Hold to expiry — you might collect the full $600`,
                `B — Close now and take the $300 — you captured 50% of max profit with most of the time gone`,
                `C — Add more condors to increase your income`,
                `D — Hold but add more protection on the side most at risk`,
              ],
              correct: 1,
              hint: `Think about what those final 12 days offer: a potential extra $300 gain, but what do they risk?`,
              explanation: `B is correct. This is the "50% profit rule" that many professional options traders follow. After capturing 50% of the maximum profit, the remaining opportunity ($300) comes with growing risk — the final 12 days before expiry is when option gamma increases, meaning a sudden price move can turn a profitable condor into a big loss very quickly. The logic: "I already have $300. Why risk losing it for another $300?" The 50% rule isn't perfect, but it consistently improves long-term results by avoiding the riskiest part of the trade's life.`,
            },
            {
              question: `BTC is trending strongly upward for the past 3 weeks with no signs of slowing. Should you put on an iron condor?`,
              options: [
                `A — Yes — a trending market is a great time to collect condor premium`,
                `B — Yes — but only on the put side (below the market)`,
                `C — No — a trending market is exactly when iron condors fail`,
                `D — Yes — just make your strikes very wide to be safe`,
              ],
              correct: 2,
              hint: `Iron condors profit from calm. What does a strongly trending market suggest about upcoming price behaviour?`,
              explanation: `C is correct. A strongly trending market is the most dangerous environment for iron condors. Trends continue — meaning BTC in a strong uptrend is likely to keep rising, breaking through your upper call strikes. No matter how wide you make the strikes (option D), a trend that keeps going eventually hits them. Option B (put side only) describes a different strategy — a bull put credit spread, which is actually reasonable in an uptrend. But a full iron condor with a call side in a strong uptrend is a recipe for losses. The best iron condor environments: post-event calm, range-bound consolidation, high IV with no upcoming catalysts.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-patternID`,
              scenario: `BTC/USD daily chart. It has been 3 weeks since BTC last made a significant move. Current price: $64,200. It has traded between $62,000 and $66,500 for the past 18 days. Volume is 40% below the 90-day average. IV percentile: 71% (options are relatively expensive).

You want to sell an iron condor. Using the available options below, build a condor that:
• Collects at least $500 in premium
• Has defined max loss of no more than $1,500

Available options (30-day expiry):
• $70,000 call: $185
• $68,000 call: $310
• $61,000 put: $295
• $59,000 put: $160

Show: the four legs, total premium collected, max loss, and the price range in which you profit.`,
              scoringCriteria: [
                `User correctly identifies the two-week range and elevated IV as suitable conditions for selling a condor`,
                `Selects four legs: sell $68,000 call ($310), buy $70,000 call ($185), sell $61,000 put ($295), buy $59,000 put ($160)`,
                `Net credit: $310 + $295 - $185 - $160 = $260. This is below the $500 target — user must reconsider strike selection or note the constraint`,
                `If user selects different strikes to meet the $500 target, their math must be consistent with those premium values`,
                `Max loss calculation: spread width (e.g. $2,000) minus premium collected`,
                `Profit zone stated as: between the two short strikes`,
              ],
            },
            {
              type: `judgment-prioritisation`,
              scenario: `You're reviewing four potential iron condor setups. Rank them from best to worst opportunity, explaining your reasoning for each.

Setup 1 — ETH at $3,100, IV percentile 65%, no major events for 35 days, 30-day condor, $3,000/$2,700 put spread + $3,400/$3,700 call spread, net credit $290

Setup 2 — BTC at $67,000, IV percentile 18%, earnings-equivalent event (major ETF rebalancing) in 8 days, net credit $180

Setup 3 — SOL at $145, IV percentile 72%, no major events for 40 days, SOL has been range-bound for 3 weeks, net credit $12

Setup 4 — BTC at $67,000, IV percentile 81%, BTC has been trending up 22% over the past 2 weeks with strong momentum, net credit $580`,
              scoringCriteria: [
                `Best: Setup 1 — moderate-high IV, no upcoming events, calm market, reasonable credit. Good environment.`,
                `Second: Setup 3 — high IV, range-bound, no events. Credit is small in absolute terms but SOL is cheaper. Ratio might be acceptable.`,
                `Third: Setup 2 — very low IV means small credit AND an upcoming event means the condor will likely be violated. Both factors argue against it.`,
                `Worst: Setup 4 — even though IV is high (good for selling) and credit is large, a strong 22% upward trend means the price will likely break the call side. Trending markets destroy condors.`,
                `User explicitly connects: trending market = bad for condors. High IV + no events + range-bound = good for condors. Low IV + upcoming event = worst scenario.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `You entered a BTC iron condor 22 days ago (8 days remaining):
• Sold $63,000 put — originally received $380
• Bought $60,000 put — originally paid $180  
• Sold $72,000 call — originally received $350
• Bought $75,000 call — originally paid $160
• Net credit at entry: $390

BTC is currently at $70,800 — getting close to your $72,000 short call.

Current option prices:
• $63,000 put: now worth $15 (nearly worthless)
• $60,000 put: now worth $5 (nearly worthless)
• $72,000 call: now worth $1,820 (BTC very close!)
• $75,000 call: now worth $680

Question 1: What is the current value of closing the entire condor?
Question 2: What is your current unrealised P&L?
Question 3: With 8 days left and BTC at $70,800, what do you do?`,
              scoringCriteria: [
                `Q1: Cost to close = buy back puts ($15 - $5 = $10 net) + buy back calls ($1,820 - $680 = $1,140 net). Total close cost: $1,150`,
                `Q2: Received $390, costs $1,150 to close = unrealised loss of $760`,
                `Q3: With BTC at $70,800 and only $1,200 away from the $72,000 short call, with 8 days of high-gamma risk remaining, the professional move is to close and take the $760 loss now rather than risk the full $2,610 max loss if BTC pushes above $75,000`,
                `User should NOT recommend holding — the risk/reward has deteriorated (possible additional $1,850 loss vs recovering $760 already lost)`,
                `User may suggest rolling: closing current position and re-entering a new condor at higher strikes. This is acceptable with correct calculations.`,
              ],
            },
          ],
        },

        // ─── LESSON 3 ────────────────────────────────────────────────────────
        {
          id: 'calendar-spreads',
          title: `Calendar Spreads — Profiting From the Difference in Time Decay`,
          explanation: `Here's something that surprises most beginners: two options on the same asset, with the same strike price, can lose value at very different speeds depending on how far away their expiry dates are.

An option expiring in 7 days might lose $150 of value on a single quiet day. An option expiring in 90 days might lose only $50 on the same quiet day.

That difference in decay speed is exactly what a calendar spread captures.

A calendar spread is built like this:
• You SELL a short-dated option (it decays fast — you benefit from that)
• You BUY a longer-dated option at the same strike (it decays slowly — it holds its value)

Every day that passes, the short-dated option you sold loses value faster than the long-dated option you bought. That difference goes into your pocket.

Think of it like this: you own a storage unit and you rent it out short-term to someone who pays a high monthly rate (the short option you sold). You also rent a unit long-term from a landlord at a lower daily rate (the long option you bought). The gap between what you collect and what you pay is your profit.

The ideal scenario: the price stays exactly where it is until the short-dated option expires. The short option becomes worthless (you keep the premium). The long option still has 60 days of life left, so it's still worth something. You can then sell the long option or sell another short-dated option against it for the next month.

The risk: if the price moves sharply in either direction, both options become deeply in-the-money or both become worthless — and the calendar loses its advantage.

Calendar spreads are also useful when the near-term implied volatility (IV) is much higher than longer-term IV. This is like the market saying: "We expect chaos this week, but things to calm down over the next few months." You sell the expensive near-term option and buy the cheaper longer-term one — you're capturing the difference in their prices.`,
          visualPrompt: `👆 See how the short option decays faster than the long option, creating profit`,
          visualType: `gif`,
          visualUrl: `calendar-spread-theta-decay`,
          examples: [
            {
              contextTag: `[BTC options trader, calendar spread, volatility term structure trade, 2023]`,
              context: `A trader noticed that 30-day BTC IV was at 52% while 90-day IV was only 44%. Near-term options were much more expensive relative to their time than longer-term options — a good setup for a calendar spread.`,
              scenario: `BTC at $28,000. Trader sells a 30-day $28,000 call for $1,100 (expensive because IV is 52%). Buys a 90-day $28,000 call for $1,800 (cheaper per day because IV is 44%). Net cost: $700. Each day, the short option decays about $37. The long option decays about $20. Net daily gain: $17.`,
              outcome: `Over 30 days, BTC stays between $26,000 and $30,000. The short option expires nearly worthless. The long option (now 60 days) is still worth $1,400. Net result: $1,400 received for the long option - $700 initial cost = $700 profit. 100% return on the $700 risked, purely from the difference in time decay. No directional prediction needed.`,
            },
            {
              contextTag: `[ETH trader, calendar spread, event volatility play, 2024]`,
              context: `A trader knew an Ethereum upgrade was coming in 2 weeks. Near-term options were getting very expensive. Longer-term options hadn't moved much yet.`,
              scenario: `ETH at $3,400. Sell 14-day $3,400 call for $380 (inflated by upgrade excitement). Buy 45-day $3,400 call for $510. Net cost: $130. If ETH stays near $3,400 through the upgrade, the short call decays fast and the long call holds value.`,
              outcome: `ETH moves from $3,400 to $3,650 — a moderate move. Short call expires ITM, worth $250 (partially losses but still manageable). Long call now worth $780 (45-day option with ETH higher). Position value: $780 - $250 = $530. Minus $130 initial cost = $400 profit. Even with a moderate price move, the calendar worked because the long option gained more than the short option lost.`,
            },
            {
              contextTag: `[Beginner, calendar spread gone wrong — large move, learning example]`,
              context: `A beginner tries a calendar spread for the first time on Bitcoin and encounters the strategy's main risk: a large price move.`,
              scenario: `BTC at $60,000. Trader buys a calendar spread at the $60,000 strike — sells 30-day call for $2,000, buys 90-day call for $3,200. Net cost: $1,200.`,
              outcome: `Within 10 days, BTC surges to $73,000. The short 30-day call is now deeply ITM (worth $13,000 — trader owes this). The long 90-day call is worth $14,200. Net: $14,200 - $13,000 = $1,200 — exactly the original cost. The trader barely breaks even. The calendar spread's profit zone disappeared because the price moved so far from the original strike. Lesson: calendar spreads aren't meant for volatile, trending conditions. They work best in stable, sideways markets — just like iron condors.`,
            },
          ],
          keyTakeaway: `A calendar spread earns money every day from the difference in decay speed between a short-dated option you sold and a long-dated option you bought. Best in calm markets or when near-term IV is expensive vs long-term IV. The risk is a large price move that pushes price far from your strike.`,
          guidedPractice: [
            {
              question: `You sell a 30-day option that decays at $60/day. You buy a 90-day option that decays at $25/day. What is your daily net profit from time decay?`,
              options: [
                `A — $85/day (you add both decays)`,
                `B — $35/day (short option decay minus long option decay)`,
                `C — $25/day (only the long option you own)`,
                `D — $60/day (only the short option you sold)`,
              ],
              correct: 1,
              hint: `You gain from the short option decaying (you sold it, so its losses are your gains). You lose from the long option decaying (you bought it). Net = difference.`,
              explanation: `B is correct. The short option loses $60/day in value — because you sold it, you gain $60/day as it decays. The long option loses $25/day in value — because you bought it, you lose $25/day. Net daily income: $60 - $25 = $35/day. This is the heart of how calendar spreads work — you're harvesting the difference in decay rates. A adds both decays incorrectly. C and D only consider one side.`,
            },
            {
              question: `When is a calendar spread most likely to succeed?`,
              options: [
                `A — When BTC is trending strongly upward`,
                `B — When you expect a major crash in the next 2 weeks`,
                `C — When the price stays close to the strike you chose, and near-term options are more expensive than long-term ones`,
                `D — When you have no view on the market at all`,
              ],
              correct: 2,
              hint: `Calendar spreads have two requirements: time passing (while price stays near the strike) and near-term options costing more relative to their remaining life.`,
              explanation: `C is correct. Calendar spreads need price to stay near the strike (so the short option decays to zero without getting too deep ITM). They also work best when near-term IV is elevated versus long-term IV — because then you're selling the expensive short option and buying the relatively cheaper long option. A and B both involve large price moves — exactly what ruins a calendar. D suggests no view, but you do need a view: "price will stay roughly where it is."`,
            },
            {
              question: `You enter a calendar spread. The short option was sold for $900. The long option was bought for $1,500. Net cost: $600. After 30 days, the short option expires worthless. The long option is now worth $1,100. What is your profit?`,
              options: [
                `A — $900 (you kept the short option premium)`,
                `B — $500 (long option value minus original net cost)`,
                `C — $1,100 (long option value)`,
                `D — −$400 (you lost money)`,
              ],
              correct: 1,
              hint: `At expiry of the short option: you paid $600 net for the position. Now the long option is your only remaining asset. What did you net?`,
              explanation: `B is correct. You paid $600 net to enter. The short option expired worthless (no cost to close). The long option is worth $1,100. Net profit: $1,100 - $600 = $500. A represents only the short option premium — doesn't account for what you paid for the long option. C doesn't subtract the net cost. D is wrong — the long option retained significant value.`,
            },
            {
              question: `After entering a calendar spread, BTC suddenly drops 18% in one day. What most likely happens to your calendar spread?`,
              options: [
                `A — It becomes very profitable because the short call expires worthless quickly`,
                `B — It loses value because both options drop in value, but the long option loses more than the short`,
                `C — Both options expire worthless — you keep the premium`,
                `D — Nothing changes — calendar spreads are direction-neutral in all conditions`,
              ],
              correct: 1,
              hint: `Both options are calls at the same strike. If BTC drops 18%, both calls become deeply OTM. Think about what happens to the value of each.`,
              explanation: `B is correct. If BTC drops 18%, both the short call and the long call become very deep OTM (worthless or nearly worthless). The long call you paid $1,500 for may now be worth $50. The short call you sold for $900 may be worth $20 — you'd collect $20 when buying it back (a $880 gain there). Net: you gain ~$880 from the short call but lose ~$1,450 from the long call. The long option loses more in absolute dollar terms because it cost more. This is why calendar spreads don't work well in volatile, strongly directional markets.`,
            },
            {
              question: `You notice that 30-day ETH IV is at 78% and 90-day ETH IV is at 51%. Is this a good or bad environment for a calendar spread, and why?`,
              options: [
                `A — Bad — high IV on the near-term option makes it expensive to sell`,
                `B — Good — the near-term option is priced expensively (78% IV) and the long-term option is cheaper (51% IV). You sell the expensive one, buy the cheaper one.`,
                `C — Neither — IV doesn't affect calendar spread profitability`,
                `D — Bad — you should only use calendar spreads when both IV levels are equal`,
              ],
              correct: 1,
              hint: `You are selling the near-term option. Would you rather sell it when it's expensive or cheap?`,
              explanation: `B is correct. This is exactly the ideal calendar spread setup. Near-term IV at 78% means that 30-day option is very expensive — you're collecting a fat premium when you sell it. The 90-day option at 51% IV is relatively cheaper — you're paying less for your protection. The gap between 78% and 51% IV is the "edge" in your trade. You sell expensive, buy cheap. This is a textbook volatility term structure opportunity. Option A misunderstands direction — high IV on what you're selling is a good thing.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-riskManage`,
              scenario: `You entered a BTC calendar spread at the $67,000 strike 18 days ago:
• Sold 30-day $67,000 call for $2,100 (12 days remaining)
• Bought 90-day $67,000 call for $3,500 (72 days remaining)
• Net cost at entry: $1,400

Today's situation:
• BTC is at $67,400 — almost exactly at your strike (great!)
• Short call (12 days left) now worth: $1,050
• Long call (72 days left) now worth: $2,900
• Current spread value: $2,900 - $1,050 = $1,850
• Unrealised profit: $1,850 - $1,400 = $450

Question: With 12 days left on the short option, do you:
A — Hold to expiry of the short option (12 more days)
B — Close everything now and take $450 profit
C — Only close the short call now (buy it back for $1,050) and keep the long call

For A and C, calculate what happens if BTC moves to $72,000 in the next 12 days. Show your numbers.`,
              scoringCriteria: [
                `Option A at $72,000: Short call (12d) worth ~$5,200. Long call (72d) worth ~$6,800. Spread value: $1,600. Loss vs current: went from $450 profit to $200 profit — barely worth the risk.`,
                `Option B: Clean $450 profit, no further risk. Good choice.`,
                `Option C: Buy back short call for $1,050. Now hold only the long call (bought originally for $3,500, paid $1,050 to close short = total spent $4,550 net). Long call worth $2,900. Still underwater by $1,650 on a naked long. But if BTC goes to $72,000, long call worth ~$6,800 — profit of $2,250. Higher risk, higher reward.`,
                `User correctly explains the trade-offs and makes a clear choice with reasoning`,
                `User notes that Option A with BTC pinned near $67,000 is actually the ideal outcome — maximum calendar profit occurs at expiry near the strike`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are looking at the ETH options market and see this IV data:

• 7-day ATM IV: 94%
• 30-day ATM IV: 68%
• 90-day ATM IV: 52%
• 180-day ATM IV: 48%

ETH just had a major event (a successful upgrade) and near-term IV is spiking because of residual excitement. No major events are scheduled for the next 60 days.

You are considering a calendar spread. Answer: (1) Which two expiries would you pair for the best edge? (2) What strike would you use? (3) Why does the IV data support selling near-term and buying long-term?`,
              scoringCriteria: [
                `Best pair: sell 7-day (IV 94%) and buy 30-day (IV 68%) — the largest IV gap is between 7 and 30 days`,
                `Alternatively acceptable: sell 30-day (68%) and buy 90-day (52%) — still a meaningful gap`,
                `Strike: ATM — current ETH price — is the standard choice for a calendar spread`,
                `IV reasoning: selling the 7-day option at 94% IV means collecting large premium. Buying the 30-day at 68% IV means paying less per day. The 26-point IV gap between them is the "edge."`,
                `User also notes: no upcoming events for 60 days = near-term IV likely to fall back toward the longer-term levels, which helps the short option decay faster`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `Build a calendar spread on SOL at $130. Your view: SOL will stay near $130 for the next 30 days.

Available options:
• 30-day $130 call: $8.50 (IV: 71%)
• 90-day $130 call: $14.20 (IV: 58%)
• 30-day $130 put: $8.20 (IV: 72%)
• 90-day $130 put: $13.80 (IV: 59%)

Part 1: Build a call calendar spread (sell 30d, buy 90d). Show net cost and daily theta income.
Part 2: Build a put calendar spread (sell 30d, buy 90d). Show net cost.
Part 3: If you had $1,000 to allocate, how many of each calendar spread could you buy?
Part 4: What happens to each position if SOL drops to $115 before the 30-day expiry?`,
              scoringCriteria: [
                `Call calendar: sell $8.50, buy $14.20. Net cost: $5.70. Acceptable.`,
                `Put calendar: sell $8.20, buy $13.80. Net cost: $5.60. Acceptable.`,
                `$1,000 / $5.70 = 175 call calendars. $1,000 / $5.60 = 178 put calendars. (Or expressed in contract terms if user uses standard 100-lot contracts)`,
                `At SOL $115: both calendars are hurt. For call calendar: both calls OTM and losing value — long call retains more time value but spread narrows. For put calendar: both puts go ITM — short put rises sharply, long put also rises, but short more than long. Net effect on put calendar: if SOL falls far below $130, the put calendar gains from the deep ITM long put eventually but faces short-term losses from the short put.`,
                `User recognises that a $15 (11.5%) drop is painful for these positions and may require closing`,
              ],
            },
          ],
        },

      ], // End of Lab 4 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-breakout',
          'chartReplay-patternID',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-prioritisation',
          'judgment-dataInterpret',
          'sandbox-dataModel',
        ],
        description: 'Random draw from all Lab 4 lessons — straddles, iron condors, calendar spreads. No labels. Tests both analysis and trade construction.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'end-of-lab-third-attempt',
          passThreshold: 0.80,
        },
      },

      bossMode: {
        title: `Lab 4 Boss Battle — Pick the Right Strategy for Every Market`,
        learningLoop: {
          hintsEnabled: true,
          feedbackMode: 'full-criteria-with-lesson-pointers',
        },
        scenarios: [
          {
            id: 'lab4-boss-1',
            situation: `You are managing a $30,000 options portfolio. It is the start of a new month. Here is the market environment:

BTC at $68,000. IV percentile: 66%. No major events in the next 35 days. BTC has been trading between $63,000 and $73,000 for the past 6 weeks with no breakout.

ETH at $3,300. IV percentile: 19% (very cheap options). A major Ethereum staking upgrade is announced for 28 days from now. ETH has historically moved 12-15% on major upgrades.

You must allocate your $30,000 across TWO different trades — one on BTC and one on ETH.

For each trade:
1. Name the strategy you would use
2. Build the specific trade (strikes, expiry, structure)
3. State cost/credit
4. Explain in 2-3 sentences why that strategy suits those exact market conditions`,
            scoringCriteria: [
              `BTC trade: Uses an income/neutral strategy — iron condor or covered call. Correctly matches to: high(ish) IV, range-bound market, no catalyst. Iron condor is ideal. Buying a straddle or doing a directional bet is wrong.`,
              `ETH trade: Uses a volatility-buying strategy — straddle or strangle or bull call spread. Correctly matches to: cheap options (19th IV), known catalyst (upgrade), historically large move. Selling options here is wrong.`,
              `Both trades are sized within the $30,000 total. No single trade risking more than 30-40% of the portfolio.`,
              `Explanations explicitly link the strategy to the market conditions — not just naming the strategy in isolation`,
              `Numbers are internally consistent (credits/debits, strikes, expiry relative to the events)`,
            ],
          },
        ],
      },
    }, // End Lab 4
    // ═══════════════════════════════════════════════════════════════════════════
    // LAB 5: VOLATILITY — READING AND TRADING THE MARKET'S FEAR GAUGE
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 'volatility-strategies',
      title: `Lab 5: Volatility — Understanding and Trading the Market's Fear Gauge`,
      subtitle: `Learn to read implied volatility, understand volatility crush, and use volatility as a timing tool.`,
      lessons: [

        // ─── LESSON 1 ────────────────────────────────────────────────────────
        {
          id: 'understanding-iv',
          title: `What Implied Volatility Is and Why It Changes Everything`,
          explanation: `Imagine you're shopping for car insurance. If you live in a quiet suburb with no accidents in 10 years, insurance is cheap. If you're in a city with constant fender-benders, insurance is expensive. The insurance company isn't sure what will happen — but they're pricing in what they expect.

Options work exactly the same way. The "implied volatility" (IV) of an option is the market's way of pricing in how much it expects the asset to move. High IV = expensive options. Low IV = cheap options.

But here's the powerful insight: implied volatility changes. When markets get nervous, IV spikes — options get expensive. When markets calm down after an event, IV collapses — options get cheap. Traders who understand this can buy cheap insurance before the storm and sell it when everyone else is panicking.

IV is expressed as a percentage. If BTC has an IV of 70%, the options market is pricing in a roughly 70% annual price move. That sounds wild, but crypto moves a lot. For reference, stock markets average around 15-20% IV.

IV percentile and IV rank are two ways to put current IV in context. They answer the question: "Is today's IV cheap or expensive compared to recent history?"

IV percentile: "What percentage of days in the past year had lower IV than today?" If IV percentile is 85%, options are more expensive than 85% of recent history — likely expensive, lean toward selling. If IV percentile is 15%, options are cheaper than 85% of days — likely cheap, lean toward buying.

Think of it like a house price index. If houses in your city are at the 90th percentile of historical prices, they're expensive. You might wait or sell. At the 10th percentile, they're a bargain — might be time to buy.

The most important event in an options trader's calendar is an IV spike followed by "volatility crush" — when IV drops sharply after a much-anticipated event. This happens because:
1. Before the event: everyone is nervous, they buy options, IV rises
2. After the event: the uncertainty is resolved, options sellers return, IV falls
3. Option buyers often lose money even if they predicted the direction correctly — because the option price drops faster from IV crush than it gains from the price move

This is one of the most counterintuitive things in all of options trading. We'll practice spotting it.`,
          visualPrompt: `👆 See how IV rises before an event then crashes immediately after — the "volatility crush"`,
          visualType: `gif`,
          visualUrl: `iv-crush-event-animation`,
          examples: [
            {
              contextTag: `[Options trader, ETH, IV crush after Shanghai upgrade, 2023]`,
              context: `Before Ethereum's Shanghai upgrade (which enabled ETH withdrawals), uncertainty drove IV to very high levels. After the upgrade completed smoothly, IV crashed.`,
              scenario: `Three weeks before the upgrade: ETH at $1,900, IV at 68% (75th percentile). A trader bought $1,900 ATM calls for $120 each, expecting ETH to rally.`,
              outcome: `The upgrade completed successfully. ETH moved from $1,900 to $2,050 — a 7.9% gain. The trader expected their calls to be worth ~$270. Instead, calls are worth $155. Why? IV crashed from 68% to 38% immediately after the event. The price gain of $150 intrinsic value was partially offset by $115 of vega loss from the IV crush. Net profit: $35 per contract instead of the expected $150. The trader was right on direction but still barely profited because they didn't account for volatility crush.`,
            },
            {
              contextTag: `[Volatility seller, BTC, high IV income play, post-event calm]`,
              context: `A more experienced trader watches the same upgrade from the other side. Instead of buying options, they sell them right at the peak of pre-event IV.`,
              scenario: `One week before the upgrade, BTC IV spikes to 89% (92nd percentile). The trader sells BTC strangles — collecting $680 per strangle at inflated IV. They expect IV to collapse after the upgrade and the price to stay in range.`,
              outcome: `After the upgrade: IV falls to 44%. The strangles they sold are now worth $210. They buy them back at $210, having collected $680. Profit: $470 per strangle in 8 days. The directional move was 7.9% — which stayed within their strangle's breakeven range. The IV crush did exactly what they anticipated.`,
            },
            {
              contextTag: `[New trader, understanding IV percentile, first-time option buyer]`,
              context: `A beginner reads about options and decides to buy ETH calls. They don't check IV percentile first — and pay a costly price.`,
              scenario: `ETH at $2,100. The trader sees call options "only" costing $180 and buys 5 contracts for $900 total. What they don't check: IV percentile is at 88% — options are more expensive than 88% of all recent trading days. They are buying expensive insurance.`,
              outcome: `ETH rises 5% to $2,205. The trader expects profit. Instead, their calls are worth $145 each — a loss of $175 total despite being directionally correct. IV fell from 88th to 62nd percentile as the minor rally resolved uncertainty. The lesson: always check IV percentile before buying options. Buy when IV is low (below 30th percentile). Sell when IV is high (above 70th percentile).`,
            },
          ],
          keyTakeaway: `Implied volatility (IV) is the market's fear gauge — how expensive options are. IV percentile tells you if today's IV is cheap or expensive vs history. Buy options when IV is historically low (below 30th percentile). Sell options when IV is historically high (above 70th percentile). After major events, IV usually crashes — this is "volatility crush."`,
          guidedPractice: [
            {
              question: `BTC's IV percentile is currently 92%. A friend recommends buying BTC calls because "something big is about to happen." What should you do?`,
              options: [
                `A — Buy the calls — your friend's tip sounds good`,
                `B — Be very cautious — at the 92nd percentile, options are historically very expensive. You're paying top dollar.`,
                `C — IV percentile doesn't matter for call buyers`,
                `D — The 92nd percentile means this is a rare opportunity to buy`,
              ],
              correct: 1,
              hint: `92nd percentile means these options are more expensive than 92% of all days in the past year. Would you buy any product at a 92nd-percentile price?`,
              explanation: `B is correct. Options at the 92nd IV percentile are extremely expensive by historical standards. When something "big" is expected, options prices spike because everyone else is also buying protection. By the time you buy, the event is already priced in. If the event is a non-event (or even if it happens as expected), IV collapses and you lose money even if you're directionally right. The professional rule: at high IV percentiles, lean toward SELLING options, not buying them. If you must buy, buy spreads (like a bull call spread) that reduce your exposure to IV crush.`,
            },
            {
              question: `Before a major announcement, BTC IV is at 78%. After the announcement, BTC moves up 8% and IV drops to 42%. You held a long call. What happened to your option?`,
              options: [
                `A — It gained a lot — BTC moved up 8% which is huge`,
                `B — It gained from the price move but lost from IV crush — the net result depends on which force was bigger`,
                `C — IV doesn't affect call options — only put options`,
                `D — It tripled in value because the event happened`,
              ],
              correct: 1,
              hint: `Your call gained from delta (BTC moving up). It lost from vega (IV falling from 78% to 42%). These two forces work in opposite directions.`,
              explanation: `B is correct. Two things happened to your long call: (1) BTC moved up 8% → your delta gain, let's say +$1,200. (2) IV dropped from 78% to 42% → your vega loss, let's say -$800. Net: +$400 — less than you expected. This is volatility crush in action. If the event had been even less dramatic and BTC moved only 3%, the vega loss might have exceeded the delta gain entirely — you'd lose money despite being directionally correct. This is why experienced traders almost never buy naked calls or puts heading into a known event when IV is already elevated.`,
            },
            {
              question: `What does an IV percentile of 12% tell you?`,
              options: [
                `A — The market expects a 12% move`,
                `B — Options are cheaper than they have been on 88% of recent trading days — historically cheap`,
                `C — Options are expensive — 12% is a high number`,
                `D — Only 12 traders are active in the market today`,
              ],
              correct: 1,
              hint: `IV percentile answers: "What percentage of days had lower IV than today?" If 12%, almost all recent days had higher IV — meaning today is historically cheap.`,
              explanation: `B is correct. IV percentile of 12% means only 12% of recent trading days had lower IV — today's options are cheaper than 88% of days in recent history. This is a strong signal to lean toward BUYING options rather than selling them. Cheap options mean your risk is limited and the potential upside from IV expansion is significant. When options are cheap, even a moderate catalyst can cause IV to expand significantly, adding extra profit beyond the directional move.`,
            },
            {
              question: `You buy a BTC put option 2 days before a major regulatory announcement because you fear a crash. The announcement is bad news — BTC drops 12%. But your put option only gains $200 from a $900 investment. Why?`,
              options: [
                `A — Put options don't profit when prices go down`,
                `B — You bought too far OTM`,
                `C — The put gained from BTC dropping (delta) but lost from IV crush — everyone was already braced for bad news, so options were priced at peak IV. After the announcement, IV collapsed.`,
                `D — You held too long`,
              ],
              correct: 2,
              hint: `If everyone expected bad news, IV was already sky-high when you bought. The announcement resolved uncertainty — what happens to IV after uncertainty is resolved?`,
              explanation: `C is correct. This is a classic volatility crush scenario. Before the announcement, everyone was afraid, so they bought puts, driving IV very high. By the time you bought at 2 days before the event, you were buying at peak IV. When the announcement happened: BTC dropped 12% (good for your put), but IV collapsed because the uncertainty was over (bad for your put). The two forces nearly cancelled out. The lesson: if bad news is already expected and widely feared, options prices already reflect that fear. You can't profit by buying fear when everyone else already has.`,
            },
            {
              question: `It's 3 days after a major market event. IV has crashed from 85% to 32%. BTC is now trading quietly. What is the most appropriate options action?`,
              options: [
                `A — Buy lots of options — they're on sale`,
                `B — Consider selling options — IV may continue to fall or stay low, benefiting sellers`,
                `C — Wait for IV to rise back to 85% before trading`,
                `D — Close all positions immediately`,
              ],
              correct: 1,
              hint: `After a major event, with uncertainty resolved and quiet trading, what is IV likely to do — rise further, or stay low/decline?`,
              explanation: `B is correct. After a major event with IV already crashed from 85% to 32%, the environment favours sellers, not buyers. The uncertainty is resolved. There's no imminent catalyst. IV is more likely to stay low or decline further than to spike again immediately. This is the optimal time to sell options (iron condors, covered calls, cash-secured puts) and collect premium income. Option A seems tempting ("options on sale") but "on sale" only helps buyers if IV is going to rise again — which is unlikely in the immediate post-event calm. Wait for the next approaching catalyst to buy cheap options.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-volumeRead`,
              scenario: `You are looking at a BTC options market. Here is the IV data over the past 8 weeks:

Week 1: IV percentile 28%
Week 2: IV percentile 31%
Week 3: IV percentile 45%
Week 4: IV percentile 67% (major conference announcement made)
Week 5: IV percentile 79%
Week 6: IV percentile 91% (conference 5 days away)
Week 7: IV percentile 38% (conference happened, went smoothly)
Week 8: IV percentile 25% (current)

BTC price: moved from $62,000 to $67,000 (+8%) during weeks 4-6, then pulled back to $64,500 after the conference.

Questions:
1. When was the best time to BUY a straddle and why?
2. When was the best time to SELL a straddle or iron condor and why?
3. A trader bought a call option in Week 6. BTC was up 8% overall from Week 4. Why might they have lost money despite BTC going up?`,
              scoringCriteria: [
                `Best time to buy: Week 1-2 (IV 28-31%), before the conference was announced. Cheap options + approaching catalyst = ideal buy timing.`,
                `Best time to sell: Week 6 (IV 91%) — right at peak IV before the conference. Selling at the 91st percentile with the event about to resolve.`,
                `Week 6 call buyer loss explanation: Bought at IV 91% (peak expensive). Conference happened, IV fell from 91% to 38% — a massive IV crush. Even though BTC went up, the vega loss from IV falling nearly 53 percentile points overwhelmed the delta gain from an 8% BTC move. Result: directionally correct but financially lost money.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are comparing two option buying opportunities. Decide which trade to take, or if you should take neither.

Trade 1 — BTC at $66,000:
• IV percentile: 88%
• Upcoming event: BTC halving in 3 days
• ATM call costs $3,800
• You believe BTC will rally 15% post-halving

Trade 2 — ETH at $3,100:
• IV percentile: 21%
• Upcoming event: No confirmed events for next 45 days
• ATM call costs $195
• You believe ETH is forming a bullish chart pattern

Evaluate both trades on: (1) IV appropriateness for buying, (2) catalyst quality, (3) IV crush risk. Then make a recommendation.`,
              scoringCriteria: [
                `Trade 1: IV 88th percentile = very expensive for buying. Halving in 3 days = the event is already priced in. High IV crush risk. Even if BTC rallies, the call's value might not increase much due to IV collapse post-event. This is a poor buying setup.`,
                `Trade 2: IV 21st percentile = historically cheap — good for buying. No imminent catalyst means IV crush risk is lower. The cheap entry means downside is limited.`,
                `Recommendation: Take Trade 2. Skip or avoid Trade 1 unless using a defined-risk structure like a call spread.`,
                `User correctly identifies that low IV + directional thesis = buy. High IV + imminent event = don't buy naked options.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `Build an IV-based trading plan for the next 60 days on BTC.

Current data:
• BTC at $65,000
• Current IV percentile: 19%
• Known upcoming events: FOMC in 18 days, Bitcoin layer-2 major launch in 40 days
• Historical BTC move on FOMC: avg 5.8%
• Historical BTC move on L2 launch events: avg 9.2%

Design two separate trades:

Trade A (FOMC in 18 days): What strategy, why, specific structure, cost
Trade B (L2 launch in 40 days): What strategy, why, specific structure, cost

Consider: Does the low IV (19th percentile) affect both trades the same way? Show your reasoning.`,
              scoringCriteria: [
                `Both events have low IV (19th percentile) = favours buying options. User correctly identifies this.`,
                `Trade A (FOMC): Buy 21-day straddle or strangle. Strike near $65,000. Cost is reasonable due to low IV. Rationale: FOMC creates direction uncertainty, straddle doesn't require picking direction.`,
                `Trade B (L2 launch): Buy 45-day call (directional, since L2 launches tend to be bullish for BTC ecosystem) OR a straddle for uncertainty. Either acceptable with justification.`,
                `User notes that buying at 19th percentile IV means IV may RISE toward the events, adding extra profit from vega in addition to directional gains.`,
                `User accounts for expiry — Trade A needs to expire after the FOMC (18+ days). Trade B needs to expire after the L2 launch (40+ days). Using 30-day options for Trade B would expire before the event — wrong.`,
              ],
            },
          ],
        },

        // ─── LESSON 2 ────────────────────────────────────────────────────────
        {
          id: 'skew-term-structure',
          title: `Options Skew — Why Puts Cost More Than Calls, and What It Tells You`,
          explanation: `Here's a puzzle. Two options on the same asset, same expiry, same distance from the current price — one going up, one going down. You'd expect them to cost roughly the same. But in almost every market in the world, they don't. The downside protection (put) costs significantly more.

This difference in pricing is called "skew" — and it's one of the most revealing signals in all of options trading.

Why do puts cost more? Because big crashes are more common and more sudden than equivalent rallies. Markets take the stairs up and the elevator down. When a crash comes, it comes fast. Option buyers know this, so they pay a premium for put protection. This persistent excess demand makes puts more expensive than equivalent calls.

Skew is measured by comparing the IV of OTM puts vs OTM calls at the same distance from the current price. Normal skew: OTM puts have higher IV than OTM calls. Positive skew (for calls): OTM calls are more expensive than OTM puts — this is unusual and usually signals something interesting.

What does skew tell you in crypto?

When put skew is very steep (puts much more expensive than calls): the market is fearful. Institutions are buying protection. This is common after a crash or during a crisis. Selling puts in this environment can be very profitable — you collect extra-expensive premium.

When call skew appears (calls become more expensive than puts): the market is in extreme FOMO mode. People are paying a premium for upside lottery tickets. This often happens near market tops during euphoric bull runs.

When skew is very flat (puts and calls priced similarly): the market has no strong directional fear — a relatively calm environment. This is actually when asymmetric opportunities arise for traders with directional views.

Term structure is related: it describes how IV differs across expiry dates. Normal structure: longer-dated options have higher IV than short-dated (contango). This makes sense — more time = more uncertainty. Inverted structure (near-term IV higher than long-term): signals immediate fear or event risk. This is what you see before a halving or major announcement.

Both skew and term structure are readable on any options platform like Deribit. Together they give you a map of where the market is most afraid — and where the pricing opportunities are.`,
          visualPrompt: `👆 See the options skew curve — put IV vs call IV at different strike distances`,
          visualType: `image`,
          visualUrl: `options-skew-curve`,
          examples: [
            {
              contextTag: `[Portfolio manager, reading crash skew, BTC bear market 2022]`,
              context: `During the FTX collapse in November 2022, put skew on Bitcoin became extreme. The cost of protection far exceeded the cost of equivalent upside bets.`,
              scenario: `BTC at $18,000. A trader checks the options chain and sees: 10% OTM put IV = 112%. 10% OTM call IV = 71%. Put skew = 41 percentage points above equivalent calls. This extreme skew means puts are hugely expensive relative to calls.`,
              outcome: `The trader sees an opportunity: instead of buying puts (which are now extremely expensive), they sell a cash-secured put at a deeply OTM strike ($13,000) and collect $890 — far more premium than such a deep OTM put would normally offer. BTC stays above $13,000. The trader keeps the $890. The extreme put skew gave them an unusual income opportunity by selling the "fear premium" in deep OTM puts.`,
            },
            {
              contextTag: `[Trader, reading call skew, BTC bull market euphoria, 2024]`,
              context: `In March 2024, Bitcoin broke its all-time high for the first time in 2 years. Call skew appeared — OTM calls became more expensive than OTM puts.`,
              scenario: `BTC at $70,000 and rising. A trader checks the skew: 10% OTM call IV = 82%. 10% OTM put IV = 61%. Calls are MORE expensive than puts — a rare signal of extreme bullish demand for upside.`,
              outcome: `The trader recognises this as a euphoria signal — historically, when call skew appears (calls more expensive than puts), the market is often near a near-term top. Rather than buying the expensive calls everyone is rushing to buy, the trader sells a bear call spread above the market (collecting the elevated call premium) with a predefined max loss. BTC peaks at $73,000 and pulls back. The sold call spread expires profitably. Skew reading allowed the trader to identify an overcrowded trade and position against it.`,
            },
            {
              contextTag: `[Beginner, ignoring skew, overpaying for protection]`,
              context: `A beginner buys put options to protect their ETH holdings without checking the skew. They're buying at exactly the worst time.`,
              scenario: `ETH just crashed 30% in 2 days (from $3,000 to $2,100). The beginner panics and buys protective puts at $2,000 strike for $380 each. What they don't check: current put IV = 118% (92nd percentile for puts). They are buying insurance in the middle of the fire.`,
              outcome: `ETH stabilises at $2,100 and bounces to $2,400 over the next 2 weeks. IV crashes from 118% to 52%. Their $2,000 puts, originally worth $380, are now worth $35 — an $345 loss per contract despite ETH still being lower than when they first owned it. Lesson: buying puts after a crash, when everyone is scared, means paying maximum premium. The time to buy protection is BEFORE the crash, when IV is low and markets are calm.`,
            },
          ],
          keyTakeaway: `Options skew shows you where the market is most afraid. Normally, puts cost more than equivalent calls because crashes happen faster than rallies. When put skew is extreme, selling puts can collect extra-high premium. When call skew appears (rare), the market is in euphoria — often near a top. Always check both sides of the options chain before trading.`,
          guidedPractice: [
            {
              question: `You check the BTC options chain. 10% OTM puts have IV of 95%. 10% OTM calls have IV of 58%. What does this tell you?`,
              options: [
                `A — BTC is about to go up — calls are cheaper`,
                `B — The market is fearful — puts are more expensive, suggesting demand for downside protection`,
                `C — There is no significant information in this data`,
                `D — Calls are about to get more expensive`,
              ],
              correct: 1,
              hint: `When puts cost significantly more than equivalent calls (by IV), that excess demand shows the market is paying up for downside protection. What does that signal?`,
              explanation: `B is correct. A 37-point IV gap between puts (95%) and calls (58%) means the market is strongly fearful — put buyers are paying a big premium for protection. This kind of steep put skew often appears during or just after crashes, high-uncertainty periods, or when institutional traders are buying portfolio insurance. The implication for traders: puts are expensive to buy (you'd be paying the fear premium), but selling cash-secured puts or put spreads here could earn you that elevated premium if you believe the fear is overdone.`,
            },
            {
              question: `What is a "normal" skew structure and why does it exist?`,
              options: [
                `A — Calls are normally more expensive than puts because markets go up more often`,
                `B — Puts are normally more expensive than equivalent calls because crashes are faster and more severe than rallies`,
                `C — All options at the same distance from the strike are priced identically`,
                `D — Skew only exists in stock markets, not in crypto`,
              ],
              correct: 1,
              hint: `Think about how markets typically move — do they go up slowly and crash slowly, or go up slowly and crash quickly?`,
              explanation: `B is correct. The classic saying is "markets take the stairs up and the elevator down." Crashes are typically sudden and severe. Rallies are typically gradual. Because of this asymmetry, market participants consistently pay more for put protection than for equivalent call upside. This persistent excess demand keeps put IV higher than call IV at equivalent distances from the current price. The same pattern exists in crypto, though sometimes amplified because crypto can also have rapid upside moves.`,
            },
            {
              question: `During a massive Bitcoin bull run, you check the options chain and find that 10% OTM calls cost MORE than 10% OTM puts. This is called positive call skew. What does this usually signal?`,
              options: [
                `A — A clear buy signal — calls being expensive means BTC is about to rally`,
                `B — A cautionary signal — extreme demand for calls often appears near market tops during euphoric periods`,
                `C — This is completely normal and happens all the time`,
                `D — This only means liquidity is low today`,
              ],
              correct: 1,
              hint: `When everyone is so bullish that they're paying extra for upside lottery tickets, is this typically the beginning of a move or the end?`,
              explanation: `B is correct. Positive call skew (calls more expensive than puts) is a contrarian signal. It means the crowd is so convinced BTC will go higher that they're paying a premium for upside bets. Historically, this extreme optimism often appears near local or major market tops — when the last remaining buyers finally pile in. Professional traders who notice call skew forming will often sell the expensive calls (in a defined-risk structure like a bear call spread) rather than join the crowd buying them. It's not a guarantee of a top, but it's a warning that the trade is overcrowded.`,
            },
            {
              question: `Normal term structure = longer-dated options have higher IV. What does inverted term structure (near-term IV higher than long-term IV) indicate?`,
              options: [
                `A — Nothing unusual — term structure randomly inverts`,
                `B — Immediate fear or a known upcoming event is causing near-term options to be priced much higher`,
                `C — Long-dated options are broken and need to be avoided`,
                `D — You should always buy long-dated options when this happens`,
              ],
              correct: 1,
              hint: `Why would near-term options suddenly cost more per day than long-term options?`,
              explanation: `B is correct. Inverted term structure means something specific is scaring the market in the near term — an upcoming major event, regulatory announcement, protocol upgrade, or ongoing crisis. The near-term uncertainty is so elevated that near-term options are priced more expensively per day than long-term ones. This is a classic signal for calendar spreads (sell the expensive near-term, buy the cheaper long-term). It's also a signal that the near-term event is priced in — if you're thinking of buying near-term options, the inverted structure tells you the event has already driven prices high.`,
            },
            {
              question: `You own 5 ETH and want to buy protective puts. You check: ETH just had a 25% crash yesterday, and put IV is at the 94th percentile. Is this the right time to buy your protection?`,
              options: [
                `A — Yes — the crash is happening, you need protection now`,
                `B — No — protection is at maximum expense right now. You are buying insurance in the middle of the fire at peak prices.`,
                `C — Yes — high IV puts always give better protection`,
                `D — IV percentile is not relevant to put buying decisions`,
              ],
              correct: 1,
              hint: `When is insurance most expensive — before the accident or right after it?`,
              explanation: `B is correct. Buying protective puts at the 94th IV percentile — immediately after a major crash — means paying the absolute maximum price for insurance. The people selling those puts know the worst may already have passed, and they're charging premium prices. The time to buy protection is BEFORE the crash, when everyone is calm and IV is at the 20th-30th percentile. After a crash, the protection you need has already happened. Buying now is "closing the barn door after the horse has bolted" — and paying a fortune for the privilege. If you don't own protection yet, better options might include selling OTM calls against your ETH position (covered call) to collect premium and offset losses.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `You are looking at this BTC options data snapshot:

Current BTC price: $67,000

Put side (puts at various strikes):
• $60,000 put (10.4% OTM): IV = 88%
• $58,000 put (13.4% OTM): IV = 94%
• $55,000 put (17.9% OTM): IV = 103%

Call side (calls at various strikes):
• $74,000 call (10.4% OTM): IV = 54%
• $76,000 call (13.4% OTM): IV = 51%
• $79,000 call (17.9% OTM): IV = 47%

Questions:
1. Describe the skew you see. Is it normal or unusual?
2. What does this skew tell you about current market sentiment?
3. If you wanted to sell premium to collect income, which side (put or call) would give you more premium per dollar of risk, and why?
4. If you had a moderately bullish view on BTC, would buying calls or selling puts be the smarter choice here? Explain.`,
              scoringCriteria: [
                `Skew description: Very steep put skew — puts have 34-56% higher IV than equivalent calls. This is extreme, not normal.`,
                `Sentiment: Market is very fearful. Demand for downside protection is high. Institutions or holders are buying lots of puts.`,
                `Best premium side: Selling puts collects the high IV premium (88-103%). Selling calls collects lower IV (47-54%). Selling puts gives you more income per dollar at risk.`,
                `Bullish view: Selling an OTM put (collecting 88-103% IV premium) is smarter than buying an OTM call (paying 47-54% IV). The put collection is equivalent in directional exposure but much better priced.`,
              ],
            },
            {
              type: `chartReplay-reversal`,
              scenario: `You are observing this sequence of IV events over 6 weeks on ETH:

Week 1: IV 22nd percentile, price at $2,800, no events
Week 2: IV 28th percentile
Week 3: IV 41st percentile — Ethereum Foundation announces major upgrade in 3 weeks
Week 4: IV 68th percentile
Week 5: IV 84th percentile — 1 week before upgrade
Week 6: Upgrade happens. ETH moves from $2,900 to $3,200 (+10.3%). IV: 31st percentile

A trader made the following moves:
• Week 1: Bought 10 ETH straddles for $85 each = $850 total
• Week 5: Sold those straddles for $280 each = $2,800 total
• Profit: $1,950 without waiting for the upgrade

Was this the right strategy? What would have happened if they held through Week 6?`,
              scoringCriteria: [
                `Week 1 buy: Correct — IV at 22nd percentile = cheap. Catalyst (upgrade) later announced. Perfect timing.`,
                `Week 5 sell: Correct — IV at 84th percentile = expensive. Sold before the event (before IV crush risk). Captured both IV expansion (22% → 84% percentile) and any price movement.`,
                `$1,950 profit without the event risk = excellent risk management.`,
                `What if they held to Week 6: ETH moved +10.3% (good for straddle) BUT IV crashed from 84th to 31st percentile. The straddle they paid $850 for would be worth approximately $350 after the crush (10.3% move helps delta, but the massive IV collapse dominates). They would have made only $350 profit vs $1,950 by selling earlier.`,
                `User correctly identifies: sell before the event, not after, when you're long volatility.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `Design a complete "IV playbook" for a trader over the next 30 days.

Current market state:
• BTC at $63,000
• IV percentile: 16% (very cheap options)
• Known upcoming: Bitcoin ETF quarterly rebalancing in 22 days
• Historical BTC move on ETF rebalancing: avg 7.1%
• Current ATM straddle (30-day): $3,100
• Current ATM straddle (22-day): $2,400

Step 1: Calculate implied move for both expiries
Step 2: Compare implied move to historical actual move
Step 3: Recommend which expiry to buy and why
Step 4: Calculate breakeven prices for your recommended straddle
Step 5: State your exit plan — will you hold through the event or sell before it?`,
              scoringCriteria: [
                `Step 1: 30-day implied move: $3,100/$63,000 = 4.9%. 22-day implied move: $2,400/$63,000 = 3.8%`,
                `Step 2: Historical actual move 7.1% > both implied moves. The options are pricing in a smaller move than historically occurs — buying edge.`,
                `Step 3: Buy 22-day straddle (expires just after the event in 22 days). Lower cost ($2,400) and times the trade precisely. The 30-day gives extra time but more theta cost.`,
                `Step 4: Breakeven prices: $63,000 + $2,400 = $65,400 (upside). $63,000 - $2,400 = $60,600 (downside).`,
                `Step 5: Two valid answers: (a) Hold through event — your implied move analysis says actual will exceed 3.8%, so let it play out. (b) Sell 1-2 days before the event at peak IV (when IV will be highest before the crush). Either is defensible with reasoning.`,
              ],
            },
          ],
        },

        // ─── LESSON 3 ────────────────────────────────────────────────────────
        {
          id: 'rolling-adjusting',
          title: `Rolling and Adjusting — What To Do When a Trade Goes Wrong`,
          explanation: `Every options trader, no matter how experienced, has trades that move against them. What separates professionals from beginners isn't that professionals never lose — it's that they have a clear plan for what to do when a trade is in trouble.

This lesson covers three essential skills: rolling an option, adjusting a position, and knowing when to simply close and walk away.

Rolling an option means closing your current position and opening a new one — usually with a different strike, expiry, or both. You "roll" forward in time or to a better strike.

When do you roll? Three common situations:

1. You sold a covered call and the stock is about to exceed your strike (you're about to be forced to sell). You can roll the call to a higher strike and/or further expiry — buying back the current call and selling a new one higher up. You collect additional premium and push the cap higher.

2. You bought a call that's losing value with only 2 weeks left to expiry. Rather than let it expire worthless, you might "roll forward" — sell the near-expiry call and buy one with more time. You exchange a dying option for one that has more life.

3. You sold a put that's now deep in the money (price has dropped below your strike). You buy back the current put (taking a loss) and sell a new put at a lower strike further in the future — giving the market more time to recover, and potentially collecting enough premium on the new put to offset some of the loss.

Adjusting a position means adding or changing components to the trade — like buying a protective option to cap a loss that's growing, or converting a naked position into a spread.

The "when to close" rule: before entering any options trade, you should set two exit points:
1. Profit target: "I will close this when it reaches X profit."
2. Stop loss: "I will close this if I lose Y amount."

Without these defined in advance, emotion takes over. Beginners hold losing positions because they "know it'll recover" — and watch small losses become catastrophic ones. Professionals close at their predetermined stop, realise the loss, and move to the next trade.

The maximum loss rule for bought options: if an option position loses 50-70% of its value and there are more than 2 weeks left to expiry, consider closing. Holding onto a $500 option that's now worth $150 hoping for a recovery usually results in it going to $0. Cut the loss, redeploy the $150 elsewhere.`,
          visualPrompt: `👆 See the decision tree: when to roll, when to adjust, when to close`,
          visualType: `image`,
          visualUrl: `rolling-options-flowchart`,
          examples: [
            {
              contextTag: `[Covered call writer, rolling up and out, BTC rally scenario]`,
              context: `A trader sold covered calls on their BTC at $68,000 strike when BTC was at $64,000. BTC has now risen to $70,500 and is about to breach the strike. They don't want to sell their BTC.`,
              scenario: `Current: short $68,000 call worth $3,200. BTC at $70,500. Trader doesn't want to be forced to sell at $68,000. They "roll up and out": buy back the $68,000 call for $3,200, sell a $75,000 call expiring 30 days later for $1,800. Net debit to roll: $1,400. But now their cap has moved from $68,000 to $75,000 — they've "bought themselves" more upside.`,
              outcome: `BTC peaks at $74,200 and pulls back. The rolled $75,000 call expires worthless. Net result: the trader paid $1,400 to roll, avoided being forced to sell at $68,000, and ended up keeping all of their BTC. The $1,400 roll cost was much less than the $6,500 they'd have missed by selling at $68,000 when BTC went to $74,200.`,
            },
            {
              contextTag: `[Options buyer, rolling forward to avoid expiry, ETH]`,
              context: `A trader bought ETH calls with 3 weeks to expiry. 2 weeks have passed and ETH hasn't moved yet. The calls are losing value rapidly from time decay.`,
              scenario: `ETH at $3,100 (same as when they bought). They own $3,100 calls expiring in 8 days worth $45 each (down from $180 at purchase). Still believe ETH will rally — but in 2-4 weeks, not 8 days. They "roll forward": sell the 8-day calls for $45, buy 35-day $3,100 calls for $130. Net cost of roll: $85 per contract.`,
              outcome: `ETH rallies to $3,450 over the next 25 days. The 35-day calls are now worth $380. Net position: paid original $180 + $85 roll = $265 total. Call is worth $380. Profit: $115 per contract. Without rolling, the 8-day calls would have expired worthless and the full $180 would have been lost. Rolling cost an extra $85 but saved the trade.`,
            },
            {
              contextTag: `[Iron condor trader, adjusting a breached spread, BTC]`,
              context: `A trader's iron condor has its short call strike breached with 12 days remaining. Rather than panic or ignore it, they make a calculated adjustment.`,
              scenario: `BTC iron condor: profit zone was $60,000-$72,000. BTC is now at $74,500 — above the $72,000 short call. The call spread is losing money. Position is down $800 from peak. Max loss: $1,400. Trader has two choices: close everything now (realise -$800) or buy back just the $72,000 short call to remove the uncapped risk on that leg (cost: $3,200), turning it into a long call spread.`,
              outcome: `Trader closes the entire position at -$800 rather than paying $3,200 to partially fix it. They take the defined loss while they know exactly what it is, rather than spending more to salvage a broken trade. The $800 loss is manageable. They redeploy the remaining capital into a new condor for the following month. This is disciplined position management — not perfect, but far better than holding a losing trade indefinitely.`,
            },
          ],
          keyTakeaway: `Rolling means closing your current option and opening a new one with better terms — more time or a better strike. Adjusting means adding protection to a trade that's moving against you. The most important rule: set profit targets and stop losses before you enter every trade. Never hold a losing option trade beyond your predetermined stop.`,
          guidedPractice: [
            {
              question: `You sold a covered call on your 2 BTC at a $72,000 strike for $800 premium. BTC is now at $76,000 and rising. You do not want to sell your BTC. What should you consider?`,
              options: [
                `A — Do nothing — hope BTC falls back below $72,000 before expiry`,
                `B — Roll the call up: buy back the $72,000 call and sell a new higher-strike call at a further expiry`,
                `C — Buy back the call and never sell covered calls again`,
                `D — Immediately sell all your BTC before it gets called away`,
              ],
              correct: 1,
              hint: `Rolling moves the obligation to a higher price and gives the market more time to work in your favour. You pay a cost to roll but preserve your BTC.`,
              explanation: `B is correct. Rolling up means buying back your $72,000 call (at a loss relative to what you sold it for) and selling a new call at a higher strike — say $78,000 or $80,000 — on a later expiry. You pay a "roll debit" but you move the cap higher, giving yourself more upside before being forced to sell. This is standard covered call management. A (do nothing) risks your BTC getting called away at $72,000 while BTC is at $76,000 — you'd miss $4,000 of upside per BTC. D is the opposite of what you want.`,
            },
            {
              question: `You bought a BTC call for $1,800. It's now worth $540 — a 70% loss. There are still 18 days to expiry. Your original target was $72,000 and BTC is at $65,000 — still $7,000 away. What is the disciplined action?`,
              options: [
                `A — Hold — you still have 18 days and BTC might rally`,
                `B — Average down — buy more calls to lower your cost`,
                `C — Close the position and accept the $1,260 loss. A 70% loss with 18 days left and $7,000 to go is extremely unlikely to recover.`,
                `D — Roll forward to a 90-day option automatically recovers the position`,
              ],
              correct: 2,
              hint: `At 70% down, BTC needs to move $7,000 in 18 days just to recover your entry. What are the realistic chances of that? And what if you roll — what does that cost?`,
              explanation: `C is correct — this is the hard but necessary discipline. A $1,800 call now worth $540 means you've lost $1,260. You still have $540 of value. If you close now, you recover $540. If you hold and BTC doesn't reach $72,000, you lose the remaining $540 too — turning a $1,260 loss into a full $1,800 loss. The math of hoping for recovery from a 70% drawdown is brutal: you need BTC to move more than 10% in 18 days to come close. This happens, but it's not a plan. Disciplined traders close losing positions and preserve the remaining capital for better setups.`,
            },
            {
              question: `What does "rolling forward" mean for a long option position?`,
              options: [
                `A — Moving your strike price to a lower level`,
                `B — Selling your near-expiry option and buying a further-dated option at the same or similar strike — exchanging time decay for more time`,
                `C — Doubling your position size to recover losses`,
                `D — Closing the position entirely`,
              ],
              correct: 1,
              hint: `"Rolling forward" refers to the time dimension of the option — forward in time means later expiry.`,
              explanation: `B is correct. Rolling forward means you close (sell) your current option that is running out of time and open (buy) a new option with more days to expiry. You "buy more time" for your thesis to play out. The cost: the new option costs more than you receive from closing the old one — that difference is the "roll debit." The benefit: your position gets more time to work. This is most useful when: your directional thesis is still intact but the timeline was wrong, and the option has enough remaining value to justify the roll cost.`,
            },
            {
              question: `Why is it important to set a profit target and stop loss BEFORE entering an options trade?`,
              options: [
                `A — It's not important — experienced traders manage by feel`,
                `B — Because options markets close at unexpected times`,
                `C — Because without predetermined exits, emotions take over — you hold losers hoping for recovery and sometimes sell winners too early out of fear`,
                `D — Because your broker requires it`,
              ],
              correct: 2,
              hint: `What tends to happen to people who watch their investment fall 60%? What about when it rises 30%? Do they make good decisions?`,
              explanation: `C is correct. Pre-set exits are one of the most important rules in options trading. Human psychology is terrible at managing positions in real-time: we hold losers because we "know they'll recover" (they often don't), and we sell winners too early because we fear giving back gains. Options have a specific additional danger: they can go to zero and are time-sensitive. A stock you hold indefinitely might eventually recover. An option expiring worthless in 3 days is gone forever. Setting a 50% loss stop and a 100% gain target before entering removes the emotion and forces disciplined execution.`,
            },
            {
              question: `You have a cash-secured put position on ETH: you sold a $2,800 put for $180. ETH has dropped to $2,400 — well below your strike. You have 14 days left. You are considering rolling: buy back the $2,800 put for $450, sell a new $2,500 put (30 days) for $280. Should you roll?`,
              options: [
                `A — Yes — rolling reduces your strike and buys more time`,
                `B — No — always close losing put positions immediately`,
                `C — Only roll if the net cost of rolling is less than the expected benefit, and if you genuinely want to own ETH at the new effective price`,
                `D — Roll to a longer expiry at the same $2,800 strike to avoid changing your target`,
              ],
              correct: 2,
              hint: `Rolling costs money (buy back at $450, sell new for $280 = $170 net debit). Does this make sense relative to the alternative? And what is your effective buy price after rolling?`,
              explanation: `C is correct. Roll analysis: Cost to roll = $450 (buy back) - $280 (new put) = $170 net debit. New effective purchase price: $2,500 - ($180 original credit - $170 roll debit) = $2,500 - $10 = $2,490. If you genuinely want to own ETH at $2,490 and believe it will recover, this roll makes sense — it gives 30 more days and a lower effective buy price. If you don't want to own ETH at $2,490, close the entire position. Never roll just to delay an inevitable loss. The question to ask: "Would I enter a new trade to buy ETH at $2,490?" If yes, roll. If no, close.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-prioritisation`,
              scenario: `You have four options positions. Prioritise what to do with each one, from most urgent action to least urgent, and state the specific action for each.

Position A: Long BTC call, bought for $2,200, now worth $3,800. Up 73%. 21 days to expiry. BTC trending strongly upward.

Position B: Short ETH cash-secured put at $2,900 strike. ETH now at $2,550. Put now worth $480 (sold for $165). Unrealised loss $315. 9 days to expiry.

Position C: Long SOL straddle, paid $45 total. Now worth $67. Up 49%. 28 days to expiry. SOL at strike level, still quiet.

Position D: Iron condor on BTC, collected $420. Now worth $180 (up $240, 57% of max profit captured). 16 days to expiry.

For each position, state: (1) the action, (2) the reasoning using what you've learned in this lab.`,
              scoringCriteria: [
                `Position B — Most urgent: Short put 9 days to expiry, $350 underwater, accelerating gamma risk. Action: close or roll. Cannot ignore with only 9 days left. Holding risks maximum loss materialising.`,
                `Position D — Second priority: 57% of max profit captured with 16 days left. Professional rule: close near 50% profit. Action: close, lock in $240 profit.`,
                `Position A — Third: Long call up 73%, still has 21 days. Action: sell half to lock in profit (recovering original cost), let rest run with a trailing stop near entry.`,
                `Position C — Least urgent: Straddle up 49% with 28 days. Not at profit target yet, not in danger. Action: monitor. Consider closing if it approaches 100% profit or if SOL starts moving strongly.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `You sold a BTC covered call 10 days ago:
• You own 1 BTC (bought at $61,000)
• Sold a 30-day $68,000 call for $1,400 premium
• BTC was $64,000 at time of selling the call
• Now: BTC at $71,200, 20 days to expiry remaining
• Your short $68,000 call is now worth $4,100

You are being asked to make a roll decision. Evaluate these two options:

Option A — Close the entire position: buy back the call for $4,100, sell the BTC at $71,200. 
Calculate: total proceeds, original cost, net profit.

Option B — Roll up and out: buy back $68,000 call for $4,100, sell a new $76,000 call (30 days) for $2,200.
Calculate: roll debit, new effective cap, maximum profit if BTC hits $76,000.

Which do you recommend and why?`,
              scoringCriteria: [
                `Option A: Buy back call -$4,100. Sell BTC at $71,200. Total proceeds: $71,200 + $1,400 original premium - $4,100 buyback = $68,500. Original BTC cost: $61,000. Profit: $7,500.`,
                `Option B: Roll debit: $4,100 - $2,200 = $1,900 debit. Net premium after all trades: $1,400 - $1,900 = -$500 net cost. If BTC hits $76,000: BTC worth $76,000, sold via call. Total: $76,000 - $500 net cost - $61,000 BTC cost = $14,500 profit.`,
                `Recommendation: Option B makes sense if you believe BTC will continue to $76,000. Option A is right if you're happy taking $7,500 now and avoiding further risk. Key insight: rolling costs $1,900 but unlocks $7,000 more potential profit ($76k vs $68k cap). Roll if bullish.`,
                `User presents both outcomes correctly and makes a clear, reasoned recommendation`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You have held the following position for 15 days (15 days remaining to expiry):

Trade: You bought a BTC $66,000 call for $1,900 when BTC was at $65,000.

Current situation: BTC at $63,200. Your call is worth $420. You are down $1,480 (78% loss).

The chart shows: BTC has been in a downtrend for 12 days. There are no known upcoming catalysts. IV percentile has dropped from 45% to 28%.

Answer the following:
1. Should you close, hold, or roll? Show the math.
2. If you roll forward (sell the $420 call, buy a 30-day $63,000 call for $1,100), what is your new breakeven and total cost basis?
3. What single piece of information would change your decision from close to hold?`,
              scoringCriteria: [
                `Close analysis: Down 78%, BTC in downtrend, no catalyst, 15 days left. Closing recovers $420. Holding risks losing the remaining $420 too.`,
                `Roll analysis: Sell $420, buy $1,100 new call. Net additional cost: $680. Total spent: $1,900 + $680 = $2,580. New breakeven: $63,000 + $1,100 = $64,100 on the new call basis, but $65,680 on total cost basis.`,
                `Recommendation: Close. No catalyst, downtrend, deeply underwater. Rolling increases cost and delays likely loss.`,
                `What would change the decision: A specific upcoming catalyst (major announcement, scheduled upgrade) in the next 20 days that historically moves BTC 10%+ upward. Without a catalyst, rolling is just hoping.`,
              ],
            },
          ],
        },

      ], // End Lab 5 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-volumeRead',
          'chartReplay-reversal',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-prioritisation',
          'judgment-dataInterpret',
          'sandbox-dataModel',
        ],
        description: 'Random draw from all Lab 5 volatility lessons — IV reading, skew interpretation, rolling and adjusting. No labels or hints.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'end-of-lab-third-attempt',
          passThreshold: 0.80,
        },
      },

      bossMode: {
        title: `Lab 5 Boss Battle — Volatility Mastery Under Real Conditions`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers' },
        scenarios: [
          {
            id: 'lab5-boss-1',
            situation: `You are reviewing your options portfolio 3 weeks into a month. Here is your situation:

BTC at $69,000. IV percentile: 79% (options are expensive).

Your positions:
Position 1: Long BTC straddle (bought at $64,000 strike for $4,200 total) — opened when IV was at 22nd percentile 3 weeks ago. Current straddle value: $6,800. Expiry: 9 days.

Position 2: Short ETH iron condor, sold when ETH was at $3,200 (collected $310 premium). Short put at $2,900, long put at $2,600. Short call at $3,600, long call at $3,900. ETH now at $3,550 — getting close to your $3,600 short call. Expiry: 11 days.

Market context: A major crypto regulation announcement is expected "sometime in the next 2 weeks" — no specific date confirmed.

For each position:
1. Calculate current P&L
2. State the specific risk over the next 9-11 days
3. State your specific action (close, roll, hold, adjust) with exact numbers
4. Explain how the "regulation announcement" context affects your decision`,
            scoringCriteria: [
              `Position 1: P&L: $6,800 - $4,200 = $2,600 profit (61.9% gain). Risk: 9 days to expiry, high IV (79%) may crush if the regulation news drops. The straddle is already very profitable — risk/reward favours closing.`,
              `Position 1 action: Close and take $2,600 profit. With 9 days left and IV high (announcement could cause crush), holding risks the straddle losing value if the announcement is a non-event or delayed. 61.9% return in 3 weeks is excellent.`,
              `Position 2: P&L: collected $310, currently worth approximately $180 (ETH at $3,550, near $3,600 short call). Still slightly profitable but deteriorating.`,
              `Position 2 risk: ETH at $3,550 is only $50 from the $3,600 short call. Regulation announcement could push ETH sharply in either direction. This condor is in a dangerous zone.`,
              `Position 2 action: Close or roll. With ETH $50 from the short call strike and 11 days left, the risk of max loss is high. Closing at roughly breakeven is far better than holding and risking the full spread loss.`,
              `Regulation context: Applies to both. For the straddle — if the announcement comes, IV might crush if it's positive, or spike if negative. Take profits now. For the condor — announcement could cause a large move either direction — a condor's worst enemy. Both positions should be closed before the announcement if possible.`,
            ],
          },
        ],
      },
    }, // End Lab 5


    // ═══════════════════════════════════════════════════════════════════════════
    // LAB 6: HEDGING AND PORTFOLIO PROTECTION
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 'hedging-protection',
      title: `Lab 6: Hedging — How to Protect What You Own`,
      subtitle: `Use options to protect a crypto portfolio from crashes while keeping the upside.`,
      lessons: [

        // ─── LESSON 1 ────────────────────────────────────────────────────────
        {
          id: 'protective-puts-collars',
          title: `Protective Puts and Collars — Insurance for Your Crypto Portfolio`,
          explanation: `When you own a car, you buy insurance. You pay a monthly premium. If nothing goes wrong, that money is "wasted." But if you have an accident, the insurance covers the damage and you don't lose everything.

Protective puts work exactly the same way for your crypto holdings.

A protective put means: you own the asset (say, 5 ETH) and you buy put options on it. If the price crashes, your put options increase in value — partially or fully offsetting the loss on your ETH. If the price rises, the puts expire worthless (that's your insurance premium) and you keep all the upside.

The strike price of the put is your "floor." It's the price level below which you're protected. If you buy $2,500 puts while ETH is at $3,000, you're saying: "No matter how low ETH goes, my effective floor is $2,500 minus the premium I paid."

A collar is the hedge strategy that pays for itself. Here's how it works:

1. You own the asset (say, ETH at $3,000)
2. You buy a put option to protect the downside (costs money)
3. To pay for the put, you sell a call option above the current price

By selling the call, you give up some potential upside — but the call premium you collect pays for the put protection. The result: you've protected yourself from a crash at zero net cost (or even a small credit).

A collar limits your return between the put strike (floor) and the call strike (ceiling). You give up the extreme upside, but you also eliminate the extreme downside. It's a sensible choice for anyone who holds a large position and cannot afford to see it drop dramatically.

Real use cases for collars: a miner who holds large BTC inventory and needs to protect the value of future production. An investor who has made large gains in crypto and wants to lock in most of those gains. A crypto fund protecting client capital before a volatile period.

The key trade-off: protection always costs something — either a direct premium payment (protective put) or giving up some upside (collar). There is no free protection in markets.`,
          visualPrompt: `👆 See how a collar creates a "band" of protection — floor from the put, ceiling from the sold call`,
          visualType: `image`,
          visualUrl: `collar-payoff-diagram`,
          examples: [
            {
              contextTag: `[BTC holder, protective put, large position protection, 2022]`,
              context: `An early Bitcoin investor held 10 BTC bought at $8,000 average cost (worth $600,000 at $60,000). They wanted to protect against a crash without selling.`,
              scenario: `BTC at $60,000. Investor buys 10 × $50,000 protective puts (6-month expiry) for $2,800 each = $28,000 total cost. Floor: $50,000 per BTC. If BTC falls below $50,000, losses stop (put pays out). If BTC rises, puts expire worthless — $28,000 "wasted" but they keep all upside.`,
              outcome: `BTC crashes to $20,000 over 6 months (FTX collapse). Without protection: portfolio falls from $600,000 to $200,000 — a $400,000 loss. With protective puts: each put pays out $30,000 ($50,000 - $20,000). 10 puts × $30,000 = $300,000 payout. Net portfolio: $200,000 (BTC at $20k) + $300,000 (put payout) - $28,000 (put cost) = $472,000. Protection saved $272,000 in losses. The $28,000 insurance premium was one of the best investments the holder ever made.`,
            },
            {
              contextTag: `[ETH miner, zero-cost collar, production hedging, 2023]`,
              context: `An Ethereum staking operation receives 300 ETH per quarter as rewards. They want to protect the value of those rewards against a crash but can't afford to buy puts outright.`,
              scenario: `ETH at $2,000. They buy $1,700 puts for $85 each (protection floor at $1,700). They sell $2,400 calls for $82 each (gives up upside above $2,400). Net cost: $3 per ETH × 300 = $90 for the full collar. Essentially free protection. Their "band": gain if ETH rises to $2,400, lose if ETH falls below $1,700.`,
              outcome: `ETH stays between $1,700 and $2,400 for the quarter — ends at $2,150. The puts expire worthless. The calls expire worthless. The $90 net cost is irrelevant. In a scenario where ETH crashed to $1,200, the puts would pay out $500 per ETH ($1,700 - $1,200) × 300 = $150,000 in downside protection. The staking operation locked in production value while maintaining most of the upside.`,
            },
            {
              contextTag: `[Bull market investor, collar to lock in gains, crypto fund, 2024]`,
              context: `A crypto fund had invested in SOL at $20 and SOL was now at $180 — a 9x gain. They wanted to lock in at least 7x gains while holding for potential further upside.`,
              scenario: `SOL at $180. Fund buys $140 protective puts (locking in floor at $140 = 7x gain on $20 cost). Pays $18/contract. Sells $220 calls for $16/contract. Net cost: $2/contract. Effective floor: $140. Effective ceiling: $220.`,
              outcome: `SOL spikes to $260 (fund misses gains above $220 — they're forced to sell at $220 via the call assignment). But they captured $220 - $20 = $200 per SOL of gain — still a 10x from their entry. Without the collar, they'd have 13x gains. With the collar, they guaranteed at minimum 7x and captured up to 10x while protecting against any crash below $140. The collar was a professional risk management decision appropriate to the fund's obligation to clients.`,
            },
          ],
          keyTakeaway: `A protective put is insurance for your crypto — you pay a premium for a guaranteed floor. A collar is free (or near-free) insurance achieved by also selling a call, which caps your upside but eliminates your downside. Both strategies let you keep holding your asset while limiting the damage from a crash.`,
          guidedPractice: [
            {
              question: `You own 3 BTC at $65,000 each ($195,000 total). You buy 3 × $55,000 protective puts for $1,200 each. BTC crashes to $40,000. What is your effective portfolio value?`,
              options: [
                `A — $120,000 (3 BTC × $40,000)`,
                `B — $157,400 (3 BTC at $40k + 3 puts paying $15k each − $3,600 put cost)`,
                `C — $165,000 (protected floor at $55k × 3 BTC = $165k − $3,600 = $161,400)`,
                `D — $195,000 — puts fully protect your original value`,
              ],
              correct: 1,
              hint: `Each put covers 1 BTC and pays out the difference between the strike ($55,000) and the market price ($40,000). Add that to your BTC value, minus the cost of the puts.`,
              explanation: `B is correct. BTC value: 3 × $40,000 = $120,000. Each put pays out: $55,000 - $40,000 = $15,000. Three puts: $45,000. Minus put cost: $45,000 - $3,600 = $41,400 net from puts. Total portfolio: $120,000 + $41,400 = $161,400. C is close but uses the wrong formula. D is wrong — the puts protect from $55,000 down, not back to your original $65,000 purchase price. You still lose $195,000 - $161,400 = $33,600, but that's mostly the gap between $65k (purchase) and $55k (put floor) plus the premium.`,
            },
            {
              question: `You own 10 ETH at $3,000. You want to build a zero-cost collar. You buy $2,600 puts for $120 each. What call strike do you need to sell to make the collar zero-cost?`,
              options: [
                `A — A call that is also worth $120 or more`,
                `B — Any call above $3,000 — the exact price doesn't matter`,
                `C — You can't build a zero-cost collar`,
                `D — The strike doesn't matter — all call prices are the same`,
              ],
              correct: 0,
              hint: `Zero-cost means: premium received from selling the call = premium paid for the put. What does the call need to be worth?`,
              explanation: `A is correct. To make the collar zero-cost (or near zero-cost), you need to sell a call that pays at least $120 — the same amount you're paying for the put. So you'd look at the options chain for a call worth $120 or more. Typically this will be an OTM call at a moderately higher strike (e.g., $3,300 or $3,400 might cost $120-130). Once found, you sell that call and use the premium to fully cover the put cost. B is partially true (must be above $3,000) but missing the key point about the premium matching. C is wrong — zero-cost collars are very common.`,
            },
            {
              question: `What is the key trade-off when you set up a collar?`,
              options: [
                `A — You lose all your upside permanently`,
                `B — You give up upside above the call strike in exchange for downside protection below the put strike`,
                `C — You must sell your underlying asset immediately`,
                `D — Collars only work in bear markets`,
              ],
              correct: 1,
              hint: `A collar has a floor (put strike) and a ceiling (call strike). What happens to your profit above the ceiling?`,
              explanation: `B is correct. The collar creates a "band" for your returns. Below the put strike: you're protected — losses are capped. Between the put and call strikes: you gain/lose normally with the asset price. Above the call strike: your gains are capped — the call you sold will be exercised, effectively "calling away" some upside. This is the explicit cost of the protection. Collars are not appropriate if you believe the asset will rise dramatically above the call strike — you'd miss those gains. They ARE appropriate when you want steady, protected exposure without extreme upside ambitions.`,
            },
            {
              question: `When is a protective put most affordable to buy?`,
              options: [
                `A — Right after a big crash, when you're scared`,
                `B — Before any volatility arrives — when markets are calm and IV is historically low`,
                `C — Right before a known major event`,
                `D — When the asset is at all-time highs`,
              ],
              correct: 1,
              hint: `Insurance is cheapest when the perceived risk is lowest. Think about when IV is historically low.`,
              explanation: `B is correct. The cheapest time to buy protective puts is when markets are calm, IV is low (at the 20th-30th percentile), and nothing scary is on the horizon. This is counter-intuitive — most people think about insurance AFTER something scary happens. But after a crash or during a crisis, puts become extremely expensive (high IV). The professional approach: buy put protection during calm periods. You'll pay far less premium and be prepared for when chaos eventually arrives. Think of it like buying earthquake insurance during a long quiet stretch — much cheaper than after the earthquake warnings appear.`,
            },
            {
              question: `A Bitcoin miner holds 50 BTC worth of inventory. They are worried about a price crash before they can sell the BTC next quarter. Which strategy best protects them at minimal upfront cost?`,
              options: [
                `A — Sell all 50 BTC immediately`,
                `B — Buy 50 BTC worth of put options at the current price (ATM puts)`,
                `C — Build a zero-cost collar: buy OTM puts below current price, sell OTM calls above current price`,
                `D — Do nothing — prices always recover`,
              ],
              correct: 2,
              hint: `The miner needs to keep the BTC (it's inventory to sell over time) but wants protection. What strategy provides downside protection at minimal or no cost?`,
              explanation: `C is correct. A zero-cost collar is perfect for the miner's situation: they keep the BTC inventory (needed for ongoing operations), get protection against a crash (via the puts), and pay no net premium (the calls they sell cover the put cost). The only cost: giving up some upside above the call strike — but miners typically have a target price range they want to sell at anyway. A eliminates the position entirely. B is expensive when protecting a large inventory. D is not a strategy.`,
            },
          ],
          lessonSimulations: [
            {
              type: `sandbox-dataModel`,
              scenario: `You hold 8 ETH at $3,200 each ($25,600 total). You want to protect the portfolio for the next 60 days.

Available options (60-day expiry):
• $2,800 put (12.5% OTM): $95
• $3,000 put (6.25% OTM): $165
• $3,400 call (6.25% OTM): $155
• $3,600 call (12.5% OTM): $88

Design TWO scenarios:

Scenario A — Pure protective put: Choose a put strike. Calculate total cost, floor value, and break-even on protection.

Scenario B — Zero-cost collar: Combine a put and call to create a net cost of less than $20 total. State the floor and ceiling, and the trade-off.

For each scenario, calculate: what your portfolio is worth if ETH drops to $2,200.`,
              scoringCriteria: [
                `Scenario A: Buy 8 × $3,000 puts at $165 = $1,320 total. Floor: 8 × $3,000 = $24,000 - $1,320 cost = net floor $22,680. At $2,200: ETH worth $17,600 + 8 × ($3,000-$2,200) = $17,600 + $6,400 = $24,000 - $1,320 = $22,680`,
                `Scenario B: Buy $2,800 put ($95), sell $3,600 call ($88). Net: $7/contract × 8 = $56 total. Floor: $2,800. Ceiling: $3,600. At $2,200: ETH worth $17,600 + 8 × ($2,800-$2,200) = $17,600 + $4,800 = $22,400 - $56 = $22,344`,
                `Trade-off identified: Scenario A has lower floor ($3,000) but costs $1,320. Scenario B has higher floor ($2,800) but costs only $56 by giving up gains above $3,600`,
                `User correctly calculates both scenarios at $2,200 ETH`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Three crypto holders each describe their situation. Recommend the appropriate hedging strategy for each.

Person 1: "I have 20 BTC, bought at $5,000 average cost. BTC is now at $67,000. I've made life-changing money and I'm terrified of losing it all but I don't want to sell for tax reasons. I can afford to spend 2% of portfolio on protection."

Person 2: "I'm a Solana validator. I receive 500 SOL per month as staking rewards. SOL is at $150. I need to sell most of these rewards monthly to pay operating costs, but I'm worried a crash could destroy the business."

Person 3: "I just bought 5 ETH at $3,200 yesterday. I'm a long-term holder planning to hold for 3+ years. I'm not too worried about short-term volatility."

For each person: name the strategy, explain why it fits, and describe what it costs and protects against.`,
              scoringCriteria: [
                `Person 1: Protective puts (deep ITM or ATM) or a zero-cost collar. Large gains to protect. Can afford 2% of $1.34M = $26,800 for puts. Collar could do it for near-free. Protects against catastrophic loss while avoiding forced sale/tax event. Key: buy puts well below current price to protect the bulk of the $61,000 gain per BTC.`,
                `Person 2: Monthly collars or cash-secured puts on SOL. Systematic hedging programme — each month, protect the incoming 500 SOL rewards before selling them. A collar makes most sense: buy OTM puts (floor) sell OTM calls (ceiling). Zero cost or credit. Must sell SOL monthly anyway, so capping upside above the call is acceptable.`,
                `Person 3: Likely no hedge needed — or very minimal. 3+ year horizon means short-term volatility is noise. Buying puts for a 3-year holder is expensive (must renew quarterly) and the 3-year time frame makes crashes temporary. Better approach: dollar-cost average if adding more positions. No immediate hedge required.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You manage a portfolio with: 10 BTC ($67,000 each = $670,000) and $150,000 cash = $820,000 total.

It is October. BTC has had an exceptional year (+85%). You have profits to protect.

A "hedge audit" requires you to answer:

1. What percentage of the portfolio is in BTC? Is this concentrated?
2. If BTC fell 40% to $40,200, what would the portfolio be worth with no hedge?
3. Design a collar hedge on the BTC position that costs no more than $5,000 net and protects against a drop below $55,000.
4. With the collar in place, what is the portfolio worth if BTC drops to $40,200?
5. What is the maximum gain the portfolio can make (up to the call strike) with the collar?`,
              scoringCriteria: [
                `Q1: $670k / $820k = 81.7% in BTC. Yes, highly concentrated — a standard risk management concern.`,
                `Q2: No hedge: 10 BTC × $40,200 + $150k cash = $552,000. Loss: $268,000 (32.7% portfolio drawdown).`,
                `Q3: Example collar: Buy 10 × $55,000 puts. Sell 10 × $76,000 calls. Net cost must be ≤$5,000 across 10 contracts = $500/contract or less. User must find strikes where this works.`,
                `Q4: With collar (floor at $55,000): BTC worth $402,000 + put payout 10×($55k-$40.2k) = 10×$14,800 = $148,000. Total BTC protected value: $550,000 - collar cost. + $150k cash = ~$695,000. Loss is now ~$125,000 instead of $268,000.`,
                `Q5: Maximum gain with collar (ceiling at $76,000): 10 × $76,000 = $760,000 BTC + $150k = $910,000 total. Gain from $820k: $90,000.`,
              ],
            },
          ],
        },

        // ─── LESSON 2 ────────────────────────────────────────────────────────
        {
          id: 'position-sizing-risk',
          title: `Position Sizing — The Rule That Separates Survivors from Blown Accounts`,
          explanation: `Here is the most important thing you will learn in this entire course. It is not a strategy. It is not a Greek. It is not a chart pattern.

It is this: how much of your account you risk on a single trade determines whether you survive long enough to become good.

Most people who lose money in options don't lose because they picked the wrong strategy. They lose because they bet too much on a single trade. One bad bet wipes out months of good trades.

The 1-2% rule: never risk more than 1-2% of your total account on a single options trade.

What does "risk" mean for options? It means the maximum amount you can lose. For long options (calls and puts), your maximum loss is the premium you paid. If you have a $10,000 account and follow the 2% rule, you risk maximum $200 per trade.

A practical example: You have a $10,000 account. You want to buy BTC calls. Rule: risk no more than $200. BTC calls cost $1,800 each (too expensive). Solution: don't buy 1 full contract. Instead, look for options that cost $200 or less, OR look for a spread structure that limits your max loss to $200.

For short options (selling calls, selling puts), your maximum loss is larger — the difference between the strike and zero (for puts) or the strike and infinity (for calls). This is why short options need even stricter sizing. For a cash-secured put on BTC at a $60,000 strike, your theoretical max loss is $60,000. To have only $200 at risk on that trade, you'd need a spread (a bull put spread with a $200 wide spread).

The compounding argument: if you follow the 1-2% rule and have 10 losing trades in a row (rare but possible), you lose 10 × 2% = 20% of your account. That's painful but survivable. You have 80% left to trade with. If you risk 20% per trade and have 5 losing trades in a row, you're down 100%. Game over.

Number of contracts calculation: (Account size × risk %) / maximum loss per contract = number of contracts.

Example: $20,000 account, 2% risk = $400 max risk. Option costs $800 per contract. Contracts: $400 / $800 = 0.5. Round down to 0. Don't take the trade — it's too expensive for your account. Wait for a cheaper option or use a spread.`,
          visualPrompt: `👆 See how the 1-2% rule prevents catastrophic losses even after a string of bad trades`,
          visualType: `image`,
          visualUrl: `position-sizing-survival-chart`,
          examples: [
            {
              contextTag: `[New trader, 1% rule applied, $15,000 account]`,
              context: `A new options trader starts with $15,000 and decides to follow the 1% rule strictly for their first 3 months.`,
              scenario: `1% of $15,000 = $150 maximum risk per trade. They buy BTC spreads (bull call spreads with $150 max loss), ETH strangles costing under $150, and SOL covered calls where the risk on uncovered upside is defined. Each trade risks exactly $150.`,
              outcome: `Over 3 months, they make 18 trades. 11 winners, 7 losers. Total losses: 7 × $150 = $1,050. Total gains from winners vary but average $280 each: 11 × $280 = $3,080. Net profit: $3,080 - $1,050 = $2,030. Account grows to $17,030. More importantly: they never had a single catastrophic loss that wiped out their account. They learned 18 different trades and survived every one of them. If they had risked 20% per trade, a single $3,000 loss would have taken years to recover from.`,
            },
            {
              contextTag: `[Overconfident trader, no position sizing, account blown, cautionary tale]`,
              context: `A trader starts with $8,000 and ignores position sizing because "I know what I'm doing."`,
              scenario: `They see BTC about to break out and invest $4,000 (50% of account) in OTM calls that expire in 10 days. Reasoning: "I've been right about BTC three times this month."`,
              outcome: `BTC has a small consolidation for 10 days — no breakout. The 10-day OTM calls expire worthless. The trader loses $4,000 — 50% of their account in one trade. They now have $4,000. Needing to recover, they make another large bet ($2,000) on the next trade. It also loses. They are down to $2,000. Six months of work, wiped out in two trades. Position sizing would have limited each loss to $160 (2% of $8,000) — the same two losses would have cost $320 total, leaving $7,680 intact.`,
            },
            {
              contextTag: `[Systematic options trader, growing account with position sizing, 1 year]`,
              context: `An experienced options trader documents their position sizing discipline over a 12-month period.`,
              scenario: `Starting account: $25,000. Rule: 1.5% maximum risk per trade = $375. Monthly trades: 8-12 options positions across BTC, ETH, and SOL. Win rate: 58%. Average win: $420. Average loss: $330.`,
              outcome: `12 months: approximately 120 trades. 70 winners × $420 = $29,400. 50 losers × $330 = $16,500. Net profit: $12,900. Account: $37,900 (51.6% annual return). No single losing streak threatened the account because each loss was capped at $375. The system worked not because of a high win rate (58% is good but not exceptional) but because of consistent sizing that prevented any catastrophic losses.`,
            },
          ],
          keyTakeaway: `Risk no more than 1-2% of your account on any single options trade. For long options, your risk is the premium paid. For short options, use spreads to define your maximum loss. Calculate your position size before every trade: (Account × risk%) / max loss per contract = how many contracts to buy.`,
          guidedPractice: [
            {
              question: `You have a $12,000 account and want to risk no more than 2% per trade. An ETH call option costs $350 per contract. How many contracts can you buy?`,
              options: [
                `A — 2 contracts ($700 total, within budget)`,
                `B — 0 contracts — the single contract cost ($350) exceeds your 2% rule ($240)`,
                `C — 1 contract — close enough to the 2% rule`,
                `D — 3 contracts — spread the risk`,
              ],
              correct: 1,
              hint: `2% of $12,000 = $240. One contract costs $350. Is $350 within the $240 limit?`,
              explanation: `B is correct. 2% of $12,000 = $240. One ETH call costs $350. Since $350 > $240, buying even one contract violates the 2% rule. You should either: (1) skip this trade, (2) find a cheaper option (shorter expiry, more OTM, or smaller underlying), or (3) use a spread structure with a maximum loss of $240 or less. Never "bend" the position sizing rule — that's how blown accounts start. It feels frustrating to skip a trade that seems good, but discipline here is the foundation of survival.`,
            },
            {
              question: `You have a $30,000 account. You want to sell a BTC put option. The put is at the $60,000 strike. If you sell it as a cash-secured put with no hedge, what is your maximum loss?`,
              options: [
                `A — The premium you collect (e.g., $2,000)`,
                `B — $60,000 per contract (if BTC goes to zero)`,
                `C — $30,000 (your full account)`,
                `D — $10,000`,
              ],
              correct: 1,
              hint: `A put gives the buyer the right to sell BTC at $60,000. If you sold the put and BTC goes to zero, what are you obligated to pay?`,
              explanation: `B is correct. If you sell a naked (unhedged) $60,000 put and BTC crashes to zero, you are obligated to buy BTC at $60,000 when it's worth $0 — a $60,000 loss. Even if BTC drops to $30,000, your loss is $30,000 - premium collected. For a $30,000 account, a single naked put could wipe out the entire account and more. This is why: (1) Never sell naked puts without enough capital reserved to cover assignment. (2) Use put spreads (buy a lower-strike put) to define and cap your maximum loss. (3) Even with a cash-secured put, ensure the maximum loss fits within your 1-2% position sizing rule.`,
            },
            {
              question: `A trader has a $50,000 account and a 58% win rate with an average win of $600 and an average loss of $400 per trade. If they risk 2% ($1,000) per trade and use a spread that caps each loss at exactly $1,000, what does their account look like after 50 trades?`,
              options: [
                `A — $50,000 (breakeven — wins and losses cancel out)`,
                `B — $57,400 (29 wins × $600 - 21 losses × $400 = net $9,000 but capped at account performance)`,
                `C — Approximately $57,400 account value`,
                `D — They blow up their account from too many losses`,
              ],
              correct: 2,
              hint: `Calculate: 58% win rate on 50 trades = 29 wins, 21 losses. Multiply each by average P&L.`,
              explanation: `C is correct. 29 wins × $600 = $17,400. 21 losses × $400 = $8,400. Net profit: $9,000. Account: $50,000 + $9,000 = $59,000 (approximately — slight variance from rounding). D is wrong — with 2% risk per trade and capped losses, no single trade threatens the account. The key insight: a 58% win rate with a 1.5:1 reward-to-risk ratio produces strong returns with disciplined sizing. You don't need an 80% win rate — you need consistent sizing and a positive expected value per trade.`,
            },
            {
              question: `What is the single most important reason to follow strict position sizing rules?`,
              options: [
                `A — To comply with exchange regulations`,
                `B — To ensure you are never in a large winning trade`,
                `C — To survive long enough to become good — a single large loss can end your trading career before you've had time to learn`,
                `D — So you can trade more contracts at once`,
              ],
              correct: 2,
              hint: `Think about what distinguishes traders who eventually succeed from those who quit — is it always skill, or is it also the ability to keep trading?`,
              explanation: `C is correct. The most fundamental truth in trading: you can't learn from mistakes you can't survive. A trader who risks 30% of their account on one trade might be right — but if they're wrong, they may not have enough capital left to continue. Position sizing is what keeps you in the game. Every professional trader who has been successful for 5+ years has a position sizing discipline. Every blown account can trace the failure to a moment when someone abandoned their sizing rules "just this once" because they were very confident.`,
            },
            {
              question: `You have $8,000 and want to buy a BTC straddle that costs $3,200. That's 40% of your account. But you're very confident about this trade. What should you do?`,
              options: [
                `A — Take the trade — high confidence justifies high risk`,
                `B — Reduce to the amount your position sizing rule allows, even if it means far fewer contracts`,
                `C — Use leverage to amplify the position`,
                `D — Only take it if your broker approves`,
              ],
              correct: 1,
              hint: `"I'm very confident" has preceded more blown accounts than almost any other phrase in trading. What does your position sizing rule say?`,
              explanation: `B is correct. 1-2% of $8,000 = $80-$160. A $3,200 straddle vastly exceeds that limit. The correct action: don't take the $3,200 straddle. Instead, look for a cheaper structure — a strangle on a cheaper underlying, an OTM straddle on a smaller-priced asset, or a different strategy altogether that risks $160 or less. The word "confident" is irrelevant to position sizing. Every trader who has blown up was confident. Confidence does not reduce the probability of being wrong — it only makes you more surprised when you are. High confidence warrants a good trade entry, not an oversized position.`,
            },
          ],
          lessonSimulations: [
            {
              type: `sandbox-dataModel`,
              scenario: `You are starting an options portfolio with $20,000. Set up your position sizing rules and calculate the appropriate trade sizes for each scenario below.

Your rule: 1.5% maximum risk per trade.

Scenario 1: You want to buy ETH calls. Each contract costs $280.
Scenario 2: You want to buy a BTC bull call spread. Max loss per spread: $450.
Scenario 3: You want to sell a BTC cash-secured put at $60,000 strike. No spread hedge. BTC could go to zero.
Scenario 4: You want to sell a BTC bull put spread ($60,000/$57,000 spread). Net credit $180, max loss $120.
Scenario 5: You want to buy a SOL strangle for $38 total.

For each: (1) calculate your max risk budget, (2) state how many contracts you can buy, (3) flag any scenario that is too risky for your account under the 1.5% rule.`,
              scoringCriteria: [
                `Risk budget: 1.5% of $20,000 = $300 per trade`,
                `Scenario 1: $300 / $280 = 1.07 → 1 contract ($280). OK.`,
                `Scenario 2: $300 / $450 = 0.67 → 0 contracts. Too expensive. Skip or reduce spread width.`,
                `Scenario 3: FLAG. Max loss is $60,000 per naked put — completely outside any reasonable position sizing. This trade cannot be taken without a hedge.`,
                `Scenario 4: $300 / $120 = 2.5 → 2 spreads. OK. Collects 2 × $180 = $360 credit with max loss 2 × $120 = $240 (under budget).`,
                `Scenario 5: $300 / $38 = 7.9 → 7 strangles. Max loss: 7 × $38 = $266. OK.`,
              ],
            },
            {
              type: `judgment-ethicalChoice`,
              scenario: `You are chatting with three traders in an online community. Each describes their approach. Identify what position sizing mistakes each is making and what the correct approach would be.

Trader A: "I had a great month last month — up 40%. This month I'm going to put 30% of my account into a single BTC call because I'm really feeling good about the setup. I'll make 120% if I'm right."

Trader B: "I follow the 2% rule on losses — but only on losing trades. On trades I'm confident about, I'll go up to 15% because my win rate on those is higher."

Trader C: "I had 8 losing trades in a row last week. I need to make the money back so I'm doubling my position size this week."`,
              scoringCriteria: [
                `Trader A: Classic overconfidence mistake. "Feeling good" after a winning streak and increasing size is how accounts are blown. A big loss after a big win erases all gains. Correct: maintain 2% rule regardless of recent performance.`,
                `Trader B: "Selective" position sizing. The problem: you can't reliably identify which trades are the "confident" ones before the fact. Every trader feels confident on trades they're about to lose. Correct: uniform 1-2% rule across ALL trades.`,
                `Trader C: "Revenge trading" / martingale thinking. After losses, increasing size to recover is extremely dangerous — it turns a series of small losses into a potentially catastrophic single loss. Correct: after a losing streak, reduce or maintain size. Never increase. Review whether your strategy has an edge. Take a break if needed.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You have a $40,000 options account. Here is your current portfolio:

Position 1: 3 × ETH long calls ($210 each = $630 total at risk). 18 days to expiry. Currently up 45%.
Position 2: 5 × BTC bull put spreads ($180 max loss each = $900 total at risk). 12 days to expiry. Currently up 30%.
Position 3: 1 × BTC strangle ($890 total at risk). 25 days to expiry. Currently down 20% ($712 remaining).
Position 4: You want to add a new trade — a SOL straddle costing $480.

Questions:
1. What is your total current risk (sum of maximum losses on all open positions)?
2. Is your total portfolio risk within a reasonable range for a $40,000 account?
3. Should you add Position 4 (SOL straddle at $480) given your current portfolio risk?
4. If you close Position 1 (taking profit), does that change your ability to add Position 4?`,
              scoringCriteria: [
                `Q1: Total risk = $630 + $900 + $712 = $2,242 currently at risk`,
                `Q2: $2,242 / $40,000 = 5.6% of account at risk. This is 3 positions. If 2% rule per position, 3 positions = up to 6% total — borderline acceptable. Not dangerously overexposed.`,
                `Q3: Adding $480 SOL straddle would bring total risk to $2,722 / $40,000 = 6.8%. The SOL straddle itself ($480) is 1.2% of account — within the 1.5% limit per trade. Acceptable if overall exposure is comfortable.`,
                `Q4: Closing Position 1 (profit-taking on $630 position) reduces total risk to $1,612. Adding the $480 SOL straddle brings it to $2,092. More comfortable. Also frees up mental bandwidth from 4 positions to 3.`,
              ],
            },
          ],
        },

      ], // End Lab 6 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-prioritisation',
          'judgment-ethicalChoice',
          'sandbox-dataModel',
        ],
        description: 'Random draw from all Lab 6 lessons — hedging, collar design, and position sizing. No labels or hints.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'end-of-lab-third-attempt',
          passThreshold: 0.80,
        },
      },

      bossMode: {
        title: `Lab 6 Boss Battle — Protect a Real Portfolio`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers' },
        scenarios: [
          {
            id: 'lab6-boss-1',
            situation: `You are advising a crypto investor with this portfolio:

Holdings:
• 8 BTC at $66,000 each = $528,000
• 40 ETH at $3,100 each = $124,000
• Cash: $48,000
• Total: $700,000

Situation: It is late in a bull run. BTC is up 120% this year. The investor is worried about a 30-40% drawdown but doesn't want to sell due to tax implications. They have a monthly options budget of $3,500 (cannot exceed this in premium payments).

Your task — design a complete hedging programme:

1. Which assets need the most protection and why?
2. Design a hedge for the BTC position (must fit within $3,500/month budget)
3. Design a hedge for the ETH position (or explain why it's not needed)
4. Calculate: what is the portfolio worth if BTC drops 35% to $42,900 and ETH drops 30% to $2,170, with your hedges in place?
5. What is the one thing they should absolutely NOT do (a common mistake)?`,
            scoringCriteria: [
              `Q1: BTC needs most protection — 75% of the portfolio, up 120% this year. A 35% crash would lose $184,800 on BTC alone.`,
              `Q2: BTC hedge with $3,500 budget. Options: 8 × $55,000 puts at ~$400 each = $3,200 (within budget). Or zero-cost collar: buy $55k puts, sell $75k calls. Calculations shown.`,
              `Q3: ETH hedge optional or collar. If budget already spent on BTC, collar on ETH (zero-cost) makes sense. Alternatively: ETH is 17.7% of portfolio — less critical. Acceptable to leave unhedged with reasoning.`,
              `Q4: At BTC $42,900 (35% drop): 8 BTC × $42,900 = $343,200. Put payout: 8 × ($55,000 - $42,900) = 8 × $12,100 = $96,800. BTC protected value: $343,200 + $96,800 = $440,000 (vs unhedged $343,200). ETH at $2,170: 40 × $2,170 = $86,800. Portfolio total: $440,000 + $86,800 + $48,000 cash = $574,800. Loss from $700k: $125,200 (17.9%). Without hedge: $343,200 + $86,800 + $48,000 = $478,000. Loss: $222,000 (31.7%). Hedge saved $96,800.`,
              `Q5: The one thing NOT to do: buy put options right after the crash starts (when IV is already 80th+ percentile and puts are 3-4x their normal price). Protection must be bought in advance, during calm periods.`,
            ],
          },
        ],
      },
    }, // End Lab 6
    // ═══════════════════════════════════════════════════════════════════════════
    // LAB 7: PROFESSIONAL PRACTICE — TRADING LIKE A PRO
    // ═══════════════════════════════════════════════════════════════════════════
    {
      id: 'professional-practice',
      title: `Lab 7: Professional Practice — Building a Real Trading System`,
      subtitle: `Reading options chains, building a trade plan, journaling, and avoiding the mistakes that cost beginners the most money.`,
      lessons: [

        // ─── LESSON 1 ────────────────────────────────────────────────────────
        {
          id: 'reading-options-chain',
          title: `Reading the Options Chain — Finding Opportunities in the Data`,
          explanation: `An options chain looks overwhelming the first time you open it. Rows of numbers, dozens of expiry dates, hundreds of strikes. Most beginners stare at it and give up.

But an options chain is just a menu. Once you know what you're looking for, it tells you everything you need to know about what the market thinks, where the risk is, and what trades make sense.

Let's walk through what you actually look at:

Strike price — the price at which the option gives you the right to buy (call) or sell (put). In the middle of the chain. Calls are usually listed on the right, puts on the left. Current asset price is highlighted or marked — options above are OTM calls, options below are ITM calls (and vice versa for puts).

Bid and ask — every option has two prices. The bid is what buyers are offering. The ask is what sellers are asking. The gap between them is the "spread" — and in crypto options, this spread can be large. Always aim to buy at the midpoint (halfway between bid and ask) rather than paying the full ask price.

Volume and open interest — volume tells you how many contracts traded today. Open interest tells you how many contracts are currently "open" (not yet expired or closed). High open interest at a specific strike tells you a lot of traders have positions there — it often acts as a magnet for price (called "max pain theory").

Implied volatility (IV) per strike — each option has its own IV. You'll notice OTM puts usually have higher IV than equivalent OTM calls (skew, as discussed in Lab 5). Comparing IV across strikes shows you where the market is most fearful.

Delta — how much the option price moves for every $1 move in the underlying. 0.50 = ATM. Close to 1.0 = deep ITM. Close to 0 = deep OTM. Delta is also approximately the probability that the option expires in-the-money.

How to use the chain practically:

Step 1: Identify your thesis (bullish, bearish, or neutral).
Step 2: Look at IV percentile to decide: buy or sell premium.
Step 3: Find the strike that matches your price target. Check its delta.
Step 4: Check the bid-ask spread — if it's more than 10% of the mid price, liquidity is thin. Be careful.
Step 5: Check open interest at your target strike — high OI = more liquid.
Step 6: Calculate your breakeven. Does the trade make sense?`,
          visualPrompt: `👆 See an annotated Deribit options chain with each field explained`,
          visualType: `image`,
          visualUrl: `options-chain-annotated`,
          examples: [
            {
              contextTag: `[Beginner trader, first options chain read, Deribit BTC]`,
              context: `A new trader opens Deribit for the first time and tries to understand what they're looking at. BTC is at $65,000.`,
              scenario: `They look at the 30-day expiry chain. They see a $68,000 call with: Bid $820, Ask $900, IV 62%, Delta 0.31, OI 4,200. They are mildly bullish and want to buy a call.`,
              outcome: `Following the steps: (1) Bullish thesis — call makes sense. (2) IV percentile is 54% — moderate, not cheap but not expensive. (3) $68,000 strike is 4.6% OTM. Their target is $72,000. This is the wrong strike — they should look at $72,000 calls. (4) Bid-ask spread: $900 - $820 = $80. Mid price = $860. Spread as % of mid = 9.3% — acceptable. (5) OI of 4,200 is good — liquid market. (6) Recalculating on the $72,000 call: breakeven = $72,000 + cost of that call. They find that call and make a properly analysed decision. The process matters more than any single piece of data.`,
            },
            {
              contextTag: `[Experienced trader, using open interest to anticipate max pain, BTC expiry]`,
              context: `A trader checks where the largest open interest clusters are as a major monthly BTC expiry approaches.`,
              scenario: `3 days before a big monthly BTC expiry. Largest OI clusters: $65,000 put has OI of 12,400. $70,000 call has OI of 9,800. BTC currently at $67,800. Max pain (the strike where the most options expire worthless) appears to be near $67,000-$68,000.`,
              outcome: `The trader notes that max pain gravity could hold BTC in the $66,000-$69,000 range into expiry. They sell a tight iron condor with strikes at $65,000/$63,500 put spread and $70,000/$71,500 call spread, collecting $210. With 3 days of heavy open interest acting as a natural anchor, BTC drifts to $67,400 at expiry. Both sides of the condor expire worthless. $210 collected. Max pain theory doesn't always work, but it's a useful piece of information for short-dated trades near expiry.`,
            },
            {
              contextTag: `[Trader, using IV skew from the chain to choose strategy, ETH]`,
              context: `A trader opens the ETH options chain to look for an opportunity without any prior directional thesis — they let the chain tell them what's priced attractively.`,
              scenario: `ETH at $3,100. Looking at 30-day options: 10% OTM put ($2,790) IV: 89%. ATM IV: 71%. 10% OTM call ($3,410) IV: 55%. Steep put skew — puts are much more expensive than calls. The trader had no directional view but sees selling puts as attractive given the 89% IV on OTM puts.`,
              outcome: `They sell the $2,790 put as a cash-secured put, collecting $195. ETH stays above $2,790. They keep $195. The chain's skew data led them to a trade they wouldn't have found just watching price charts. Reading the chain actively — rather than just looking at what you want to trade — reveals opportunities you might miss.`,
            },
          ],
          keyTakeaway: `The options chain shows you everything: strikes, bid-ask spreads, IV per strike, delta (probability), and open interest (where money is concentrated). Read it systematically: thesis → IV level → strike selection → liquidity check → breakeven calculation. Let the chain tell you where the opportunities are.`,
          guidedPractice: [
            {
              question: `You see a BTC call with Bid: $650, Ask: $820. What is the fair mid price, and why should you avoid paying the full ask price?`,
              options: [
                `A — Mid price: $735. Paying ask ($820) means paying $85 above fair value — that's 11.6% extra just to enter the trade.`,
                `B — Mid price: $735. But you should always pay the ask for safety.`,
                `C — You should bid $600 to get a better deal.`,
                `D — The bid-ask spread doesn't matter in options trading.`,
              ],
              correct: 0,
              hint: `Mid price = (bid + ask) / 2. Every dollar above mid is a cost you're paying to the market maker on top of the option price itself.`,
              explanation: `A is correct. Mid price: ($650 + $820) / 2 = $735. Paying the full ask of $820 means paying $85 extra per contract — that's 11.6% above mid. On options that might cost $700-800, that's a significant handicap. Always try to place a limit order at the midpoint. The market maker may fill you at or near mid, especially in liquid markets. C (bidding $600) is too low and likely won't fill. D is wrong — spreads matter a lot on small premium options where the spread can be 15-20% of the option's value.`,
            },
            {
              question: `A $75,000 BTC call has a delta of 0.18. What does this tell you?`,
              options: [
                `A — BTC needs to move $0.18 for this option to gain $1`,
                `B — There is approximately an 18% chance this call expires in-the-money`,
                `C — The option will gain $18 for every $100 BTC moves`,
                `D — This option is 18% overpriced`,
              ],
              correct: 1,
              hint: `Delta has two meanings: how much the option moves per $1 of underlying movement, AND approximately the probability of expiring ITM.`,
              explanation: `B is correct. A delta of 0.18 means approximately an 18% probability that this call finishes in-the-money at expiry (BTC above $75,000). It also means the option gains about $0.18 for every $1 BTC rises. Both interpretations are useful. The probability interpretation helps you choose strikes: if you want a 30% probability trade, look for a delta 0.30 option. If you want a 70% probability of profit (selling), sell the 0.30 delta option (70% chance it expires worthless). C correctly captures the directional movement ($18 per $100 = $0.18 per $1) but B's probability interpretation is the most useful for strategy selection.`,
            },
            {
              question: `You want to sell a put to collect income. Looking at the options chain, you see two options: $58,000 put (OI: 12,400, delta: -0.22) and $52,000 put (OI: 340, delta: -0.08). What concerns you about the $52,000 put?`,
              options: [
                `A — Its delta is too high`,
                `B — Its low open interest (OI: 340) suggests thin liquidity — the bid-ask spread might be very wide and it may be hard to close later`,
                `C — It's too far OTM to matter`,
                `D — Nothing — lower delta is always better`,
              ],
              correct: 1,
              hint: `Open interest tells you how many contracts are currently active. What happens when very few people are trading a specific option?`,
              explanation: `B is correct. Low open interest (340) signals a thinly traded option. In thinly traded options: bid-ask spreads are typically very wide (you might pay 25-30% above mid), price discovery is poor (hard to know the "fair" price), and when you want to close the position, you might not be able to find a buyer at a reasonable price. The $58,000 put with OI of 12,400 is much more liquid — you'll get better fills entering AND exiting. As a rule of thumb for options on crypto: look for OI above 500 contracts minimum for a position you plan to hold. Higher is better.`,
            },
            {
              question: `You check the options chain and notice the 10% OTM put IV is 94% while the 10% OTM call IV is 52%. Without any other information, what trade opportunity might this suggest?`,
              options: [
                `A — Buy the expensive puts because they'll go higher`,
                `B — Selling put-side premium (selling the expensive OTM puts) to collect the elevated IV, while avoiding buying the expensive side`,
                `C — Buy calls because they're cheaper`,
                `D — The IV difference is normal and there's no opportunity`,
              ],
              correct: 1,
              hint: `When something is expensive, selling it is typically more profitable than buying more of it. What is expensive here?`,
              explanation: `B is correct. Put IV at 94% vs call IV at 52% means put premium is elevated relative to calls. Selling an OTM put (at 94% IV) in this environment lets you collect the fear premium embedded in those puts. This could be done as a cash-secured put or as the put side of an iron condor. Note: selling the put means taking on the obligation to buy if price crashes — this must fit your view and position sizing. But purely from a "where is the premium?" perspective, the skew points you toward selling puts rather than buying them.`,
            },
            {
              question: `You want to buy an OTM BTC call. You see the $72,000 call has: Bid $220, Ask $580. Mid: $400. The bid-ask spread is $360 wide. What should you do?`,
              options: [
                `A — Buy at the ask ($580) immediately`,
                `B — Be extremely cautious — a $360 bid-ask spread on a $400 mid-price option means the spread is 90% of the option's value. Liquidity is very thin.`,
                `C — Place a bid at $100 and wait`,
                `D — The wide spread means the option is about to move — buy quickly`,
              ],
              correct: 1,
              hint: `Calculate: what percentage of the mid price is the bid-ask spread?`,
              explanation: `B is correct. The bid-ask spread ($360) is 90% of the mid price ($400). This is extraordinarily wide — it means market makers are uncertain about the fair price and/or there are very few buyers and sellers at this strike. If you buy at $580 and immediately sell, you'd receive only $220 — an instant 62% loss just from crossing the spread. In this case: either skip the trade entirely, look for a more liquid strike nearby, or only place limit orders at the mid price and accept that you might not get filled. Wide bid-ask spreads are one of the hidden costs beginners don't think about until after they've been burned.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-volumeRead`,
              scenario: `You are looking at the BTC options chain for 30-day expiry. BTC is at $66,500.

Strike | Call Bid | Call Ask | Call IV | Call Delta | Call OI | Put Bid | Put Ask | Put IV | Put Delta | Put OI
$72,000 | $410 | $490 | 58% | 0.22 | 3,200 | - | - | - | - | -
$70,000 | $680 | $780 | 61% | 0.29 | 6,800 | - | - | - | - | -
$66,500 | $1,850 | $2,050 | 71% | 0.51 | 8,200 | $1,780 | $1,970 | 73% | -0.49 | 7,400
$63,000 | - | - | - | - | - | $780 | $890 | 79% | -0.31 | 5,100
$60,000 | - | - | - | - | - | $430 | $520 | 86% | -0.21 | 3,800

Answer these questions from the chain:
1. Which side has steeper IV skew — puts or calls?
2. If you wanted to sell a covered call on 1 BTC you own, which strike would you choose (above 70% probability of keeping your BTC) and what would you collect at mid price?
3. If you wanted to buy protective puts for 1 BTC, which strike would give the most cost-effective protection?
4. What does the open interest pattern tell you about where traders are most active?`,
              scoringCriteria: [
                `Q1: Put skew is steeper. ATM put IV (73%) vs ATM call IV (71%) is small, but $60,000 put IV is 86% vs $70,000 call IV is 61% — a 25-point gap. Puts are more expensive the further OTM you go.`,
                `Q2: For >70% probability of keeping BTC (delta must be below 0.30): $70,000 call (delta 0.29 ≈ 29% chance of assignment = 71% chance of keeping BTC). Mid price: ($680+$780)/2 = $730. Collect $730.`,
                `Q3: Most cost-effective put protection: $63,000 put (delta -0.31) at mid ($835) gives protection from $63k down. The $60,000 put at mid ($475) is cheaper but lower floor. Both are valid with reasoning.`,
                `Q4: Highest OI at ATM ($66,500): 8,200 calls and 7,400 puts — the market is most active at the current price. Declining OI as you move further OTM/ITM. This is the normal pattern — concentration at ATM.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are reviewing this unusual BTC options chain snapshot taken 4 days before a major Bitcoin ETF quarterly rebalancing date:

Strike | Call IV | Put IV
$72,000 | 81% | 59%
$70,000 | 78% | 63%
$67,000 (ATM) | 74% | 72%
$64,000 | 67% | 79%
$62,000 | 58% | 88%

Notice something unusual: the typical put skew is reversed at the top — calls at $72,000 have higher IV (81%) than equivalent puts at $62,000 (88%). Wait, actually $62k put IV is 88% and $72k call IV is 81%, so puts are still more expensive at equivalent distances. But call IVs are unusually elevated.

Questions:
1. Is this a normal or unusual skew pattern? What might explain the elevated call IVs?
2. What does this suggest about market sentiment?
3. A trader wants to sell premium in this environment. Which specific structure would capture the most premium efficiently?`,
              scoringCriteria: [
                `Q1: Unusual — call IVs (78-81% OTM) are much higher than typical. Normal: OTM calls are 50-60% IV when puts are 80-88%. Here, calls are at 78-81%. This suggests strong demand for upside calls — a sign of "call buying fever." The ETF rebalancing may be driving expectation of upward price pressure.`,
                `Q2: Sentiment is unusual bullish — traders are buying upside calls aggressively, driving up call IV. This is a contrarian signal: when everyone is buying calls at inflated prices, it sometimes signals near-term euphoria.`,
                `Q3: Best premium structure: An iron condor or a bear call spread (sell the expensive OTM calls). Specifically, selling the $70,000 call at 78% IV collects more than normal. Pair it with buying $73,000 call for protection. On the put side, also sell the $64,000 put (79% IV) and buy $61,000 put. The elevated call IVs make this condor pay more than it normally would.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `Using the BTC options chain below (BTC at $65,000, 30-day expiry), build a complete trade with all entry details.

Available options:
• $68,000 call: Bid $890, Ask $1,020, IV 64%, Delta 0.32, OI 4,500
• $72,000 call: Bid $380, Ask $460, IV 57%, Delta 0.18, OI 2,100
• $62,000 put: Bid $710, Ask $820, IV 77%, Delta -0.29, OI 5,800
• $59,000 put: Bid $320, Ask $390, IV 83%, Delta -0.18, OI 3,200

You are mildly bullish. You want to risk no more than $800.

Build a bull call spread:
1. Which two calls do you use?
2. What is the mid price for each?
3. What is your net debit at mid prices?
4. What is the maximum profit and maximum loss?
5. What is the breakeven price?
6. Does this trade fit within your $800 risk limit?`,
              scoringCriteria: [
                `Buy $68,000 call at mid: ($890+$1,020)/2 = $955. Sell $72,000 call at mid: ($380+$460)/2 = $420.`,
                `Net debit: $955 - $420 = $535`,
                `Maximum profit: ($72,000 - $68,000) - $535 = $3,465`,
                `Maximum loss: $535 (the net debit)`,
                `Breakeven: $68,000 + $535 = $68,535`,
                `Fits within $800 limit: Yes — $535 < $800. Trade is appropriate.`,
                `User should note: the $72,000 call has lower OI (2,100) than the $68,000 call (4,500) — worth monitoring liquidity on the short leg.`,
              ],
            },
          ],
        },

        // ─── LESSON 2 ────────────────────────────────────────────────────────
        {
          id: 'trade-plan-journal',
          title: `Building a Trade Plan and Keeping a Journal`,
          explanation: `A pilot does not take off without a flight plan. A surgeon does not operate without a procedure plan. A professional options trader does not enter a position without a written trade plan.

A trade plan is simply a document — even a few lines — that answers these questions before you click "buy":

1. What is my thesis? (Why do I expect this move?)
2. What is my entry? (Strike, expiry, structure, size)
3. What is my profit target? (At what price or % gain do I close?)
4. What is my stop loss? (At what price or % loss do I close?)
5. What is the maximum I can lose? (Does this fit my position sizing rule?)
6. What are the key risks that could invalidate my thesis?

You write this down before the trade. Not after. Not while watching the price move. Before, when you are calm and thinking clearly.

The most valuable tool for improving as a trader is a trading journal. This is simply a record of every trade you make, including:

What you planned (from the trade plan above), what actually happened (how the trade unfolded), what you did (did you follow your plan, or did you deviate?), and what you learned (what would you do differently?).

Studies of trader performance consistently show that traders who keep detailed journals improve 2-3× faster than those who don't. Why? Because patterns emerge. You might notice: "I always lose money on Friday expiry trades." Or: "My straddle trades work when IV is below 30% but fail above 50%." Or: "I always close winners too early and hold losers too long."

Without a journal, you never see these patterns. You just have a vague feeling that "options are hard." With a journal, you have data — and data tells you specifically what to fix.

The five most common mistakes that journals reveal in beginners:
1. Buying OTM options without checking IV percentile
2. Holding losing positions beyond the stop loss
3. Closing winning positions too early (fear of giving back gains)
4. Overtrading — too many simultaneous positions
5. Revenge trading after losses — increasing size to "get it back quickly"`,
          visualPrompt: `👆 See a sample completed trade journal entry with all fields filled in`,
          visualType: `image`,
          visualUrl: `trade-journal-example`,
          examples: [
            {
              contextTag: `[New trader, first trade plan, BTC call]`,
              context: `A new trader creates their first formal trade plan before buying a BTC call option.`,
              scenario: `Trade plan written: Thesis: BTC appears to be forming a higher low after consolidating for 2 weeks. IV percentile: 28% (cheap options — good for buying). Entry: Buy 1 × $66,000 BTC call for $780, expiring in 35 days. Profit target: Close at $1,560 (100% gain) or if BTC reaches $70,000. Stop loss: Close if option falls to $280 (64% loss). Max loss: $780 (position sizing: 1.5% of $52,000 account = $780 ✓). Key risk: IV might stay flat or fall if no catalyst materialises.`,
              outcome: `BTC rallies to $70,500 after 22 days. Option worth $5,100. The trader's plan said to close at $1,560 or $70,000. BTC exceeded the target. They hesitated — "it might keep going." Then remembered the plan. They closed at $1,560 wait — the option is worth $5,100 not $1,560. They re-read the plan: "close at $1,560 (100% gain) OR if BTC reaches $70,000." BTC has reached $70,500. They close at $5,100. They record in their journal: "Hesitated at the profit target. Must trust the plan next time." Over 6 months, the journal reveals they always hesitate at profit targets — a costly habit they fix.`,
            },
            {
              contextTag: `[Experienced trader, journal reveals a pattern, 3 months of data]`,
              context: `After 3 months and 37 trades, an experienced trader reviews their journal and discovers a pattern they couldn't see without the data.`,
              scenario: `Journal analysis: 37 trades. 21 winners, 16 losers. Average win: $340. Average loss: $290. Net: $2,780 profit. But: 8 of the 16 losers were trades entered on Tuesdays after a weekend of "thinking about it." These 8 trades had an average loss of $420 — far worse than the $185 average loss on other days. Analysis: weekend overthinking led to lower-quality trade setups on Tuesdays.`,
              outcome: `The trader creates a rule: no new positions opened on Mondays or Tuesdays without a specific catalyst observed in real-time. Three months later, their average loss drops from $290 to $210. Total profit over the second 3-month period: $4,100 — nearly 50% more than the first period. The journal turned a vague feeling into a specific, actionable insight.`,
            },
            {
              contextTag: `[Beginner, no trade plan, emotional trading, cautionary tale]`,
              context: `A beginner skips the trade plan because it "feels unnecessary" and trades on impulse.`,
              scenario: `Sees BTC making a big move, buys calls without a plan. BTC reverses. They hold the losing calls because they're "sure it'll recover." No stop loss defined. Calls expire worthless. Then sees a tweet about ETH and buys puts on impulse. ETH rises. Puts lose 60%. Hold again. No plan. Eventually closes both at large losses.`,
              outcome: `Total loss: $2,400 across 4 trades. With a simple trade plan and stop losses: the same 4 trades would have been closed at predetermined stops. Maximum loss per trade at 50% stop: $400 each × 4 = $1,600 total. The plan would have saved $800 and more importantly would have forced the trader to close positions while they still had value to redeploy. The biggest cost of not having a plan isn't the losing trades — it's the losing trades you hold until they're worth nothing.`,
            },
          ],
          keyTakeaway: `Write a trade plan before every trade: thesis, entry, profit target, stop loss, max loss, key risks. Keep a journal of every trade. Review it monthly to find patterns. The journal is how you improve — without it, you repeat the same mistakes without knowing it.`,
          guidedPractice: [
            {
              question: `Why should you write your trade plan BEFORE entering a trade, not after the price starts moving?`,
              options: [
                `A — It doesn't matter when you write it`,
                `B — Because once a trade is live and moving, emotions (greed, fear) cloud your judgment. Before the trade, you think clearly and can set rational targets.`,
                `C — Exchanges require a written trade plan`,
                `D — To impress other traders in forums`,
              ],
              correct: 1,
              hint: `Think about the difference in your mindset when you're calm and planning vs when you're watching your position lose $500.`,
              explanation: `B is correct. Pre-trade planning happens when you're calm and rational. Post-trade "planning" happens while watching real money move — under emotional pressure. Studies in trading psychology show that in-trade decisions are consistently worse than pre-trade decisions. When your option is down 40% and moving fast, your brain is in fight-or-flight mode. It is physically incapable of the same quality of decision-making as a calm pre-trade state. The plan written before the trade is the rational mind speaking. The decision made during a losing trade is often fear speaking. Always listen to the plan.`,
            },
            {
              question: `You had a profitable options trade but deviated from your trade plan — you held past your profit target and ended up giving back 30% of the gains. How should you record this in your journal?`,
              options: [
                `A — Don't record it — the trade was still profitable overall`,
                `B — Record it as a win and move on`,
                `C — Record: the original plan, what actually happened, the deviation from plan, and what it cost you in terms of foregone profit`,
                `D — Only record losing trades — journal is for tracking losses`,
              ],
              correct: 2,
              hint: `The journal's value is in finding patterns. If you only record losses, you miss the other big problem: not executing winners properly.`,
              explanation: `C is correct. A trade that was profitable but poorly executed is still a lesson. Recording the deviation ("held past profit target, gave back 30% of gains") creates data. If you do this 8 times in 3 months, your journal will show you: "I consistently fail to take profits at my target." That is actionable information. A journal that only tracks losses misses half the problem. Many traders who struggle don't have a "picking bad trades" problem — they have an "executing good trades properly" problem. The journal reveals which one you have.`,
            },
            {
              question: `Which of the following is a properly formulated trade plan?`,
              options: [
                `A — "BTC looks bullish, buying calls."`,
                `B — "Thesis: BTC has been consolidating for 14 days with declining volume and IV at 22nd percentile. Entry: buy $66,000 call for $780, 30-day expiry. Profit target: close at 100% gain or BTC $70,000. Stop: close if down 60% ($312 remaining). Max loss: $780 = 1.6% of $48,000 account."`,
                `C — "Buying ETH puts because ETH went down yesterday."`,
                `D — "BTC call, will monitor closely."`,
              ],
              correct: 1,
              hint: `A complete trade plan answers: why (thesis), what exactly (entry), when to exit (targets + stops), and how much can you lose.`,
              explanation: `B is correct and contains all elements: thesis with specific supporting data (consolidation, declining volume, low IV), exact entry parameters (strike, type, cost, expiry), profit target with specific conditions, stop loss as a specific dollar level, and position sizing verification. A is a thought, not a plan. C has a flawed thesis (yesterday's move) and no other planning. D has no exit plan at all. Compare how different you'd feel watching a losing trade with plan B versus A/C/D — with B, you know exactly when to close and why. With the others, you're guessing.`,
            },
            {
              question: `After reviewing 3 months of journal entries, a trader notices they lose money consistently on trades where IV percentile is above 65% when buying options. What should they do?`,
              options: [
                `A — Trade more to overcome the pattern`,
                `B — Create a rule: only buy options when IV percentile is below 50%, and switch to selling strategies when IV is above 65%`,
                `C — Ignore it — 3 months of data is not enough`,
                `D — Buy more expensive options to compensate`,
              ],
              correct: 1,
              hint: `The journal revealed a specific, quantified edge. What would a rational trader do with this information?`,
              explanation: `B is correct. This is exactly what journals are for — discovering your specific edge and anti-edge. If buying options when IV > 65% consistently loses money, that is a real pattern (assuming sample size is sufficient). The rational response: codify it into a rule. "I do not buy options when IV percentile > 50%." In those environments, use selling strategies instead (covered calls, spreads, condors) which benefit from high IV. C underestimates 3 months — if you traded actively, 3 months might give you 40-100 data points, which is statistically meaningful for a specific pattern. A (trade more) is the opposite of helpful.`,
            },
            {
              question: `Which is NOT a useful thing to track in a trading journal?`,
              options: [
                `A — Whether you followed your trade plan or deviated from it`,
                `B — What you were feeling when you entered and exited the trade`,
                `C — The exact P&L of every trade`,
                `D — What your friend told you about the trade after the fact`,
              ],
              correct: 3,
              hint: `The journal should capture YOUR process, decisions, and results — not other people's opinions after the fact.`,
              explanation: `D is correct — post-trade opinions from others are not useful journal data. They're coloured by hindsight and don't reflect the information available at decision time. Useful journal data: A (plan adherence — reveals execution discipline), B (emotional state — reveals whether emotion drove decisions), C (P&L — tracks financial performance). Post-trade commentary from others introduces hindsight bias and can obscure what actually went wrong or right in YOUR process. The journal is about improving your decision-making, not collecting validating opinions.`,
            },
          ],
          lessonSimulations: [
            {
              type: `sandbox-dataModel`,
              scenario: `Write a complete trade plan for this setup:

Market data:
• BTC at $64,500
• IV percentile: 31% (relatively cheap)
• A Bitcoin ETF issuer just announced they're increasing their BTC allocation by $500M in 14 days
• ATM call (14-day): $1,200
• ATM call (35-day): $1,850
• $68,000 OTM call (35-day): $620
• $70,000 OTM call (35-day): $320
• Bull call spread ($67,000/$71,000, 35-day): Net debit $580

Your account: $32,000. Apply the 1.5% position sizing rule.

Write a complete trade plan including: thesis, strategy choice (and why), exact entry, profit target, stop loss, max loss verification, and key risks.`,
              scoringCriteria: [
                `Thesis: Specific — ETF allocation increase in 14 days is a bullish catalyst. Low IV makes options cheap to buy.`,
                `Strategy: Any of the bullish structures is valid (long call or bull call spread) with reasoning. Spread preferred in moderate IV environment for cost reduction.`,
                `Entry: Specific option(s) with exact strikes, expiry, cost per contract. Expiry must be AFTER the 14-day catalyst (35-day is correct; 14-day risks missing the move if timing is off).`,
                `Profit target: Specific — e.g., "close at 100% gain on the spread, or if BTC reaches $70,000" — not vague.`,
                `Stop loss: Specific — e.g., "close if option loses 50% of entry value ($290 remaining on spread)"`,
                `Position sizing: 1.5% of $32,000 = $480. Bull call spread at $580 slightly exceeds this. User must either: (a) note the overage and skip, (b) find a cheaper spread, or (c) justify the slight overage.`,
                `Key risks listed: IV crush post-announcement, ETF allocation delayed, BTC general market weakness.`,
              ],
            },
            {
              type: `judgment-ethicalChoice`,
              scenario: `You are reviewing your options trading journal after 6 weeks and 24 trades. Here is what you find:

Win/loss: 13 wins, 11 losses
Average win: $285
Average loss: $410
Net P&L: 13 × $285 - 11 × $410 = $3,705 - $4,510 = -$805 (net loss)

Digging deeper, you find two patterns:
Pattern 1: Trades where you followed your trade plan exactly: 9 wins out of 12 (75% win rate). Average win $310, average loss $280. Net: +$1,760.
Pattern 2: Trades where you deviated from your trade plan: 4 wins out of 12 (33% win rate). Average win $240, average loss $510. Net: -$2,565.

What are the two most important conclusions from this data, and what specific rules would you create?`,
              scoringCriteria: [
                `Conclusion 1: When you follow the trade plan, you are profitable (+$1,760 on 12 trades). When you deviate, you lose badly (-$2,565 on 12 trades). The plan is working. Deviation is the problem.`,
                `Conclusion 2: Deviating doesn't just reduce profits — it turns a profitable strategy into a losing one. The average loss when deviating ($510) is 82% higher than when following the plan ($280). Deviating both loses more trades AND loses more per loss.`,
                `Rule 1: No trade exits outside of the plan without a written note explaining why. (Forces mindfulness before deviating.)`,
                `Rule 2: If you deviated from a plan on a trade, the next trade cannot be entered until the journal entry for the deviation is completed. (Creates accountability.)`,
                `User correctly identifies that their actual strategy has a positive edge — the problem is execution, not strategy selection.`,
              ],
            },
            {
              type: `chartReplay-riskManage`,
              scenario: `You are live in a trade. You entered 12 days ago based on this trade plan:

Thesis: ETH about to break out of 3-week consolidation. Entry: long $3,200 ETH call for $190. Expiry: 30 days from entry (18 days remaining). Profit target: 150% gain ($475 or ETH at $3,600). Stop loss: option falls to $75 (60% loss).

Today:
• ETH is at $3,150 — slightly lower than entry price ($3,200)
• Your option is worth $105 — down 44.7% from $190
• There are 18 days remaining
• ETH has been in a choppy, directionless market for 12 days
• IV has dropped from 38% to 28% percentile since you entered

Three people give you advice:
Person A: "Hold — 18 days is a lot of time. It could still rally."
Person B: "Close — you're down 45%, it's close to your stop. The thesis hasn't played out."
Person C: "Double down — buy another contract to average your cost."

Who do you follow, and why? Reference your trade plan specifically.`,
              scoringCriteria: [
                `The trade plan stop loss: close at $75 (60% loss). Current value: $105 (45% loss). NOT at stop yet.`,
                `However: the thesis was "about to break out." 12 days with no breakout means the thesis has been slow to materialize.`,
                `Person B is partially right: not quite at the stop, but thesis has been violated by time (12 days of no movement).`,
                `Person A has some validity — not yet at stop. But 18 days and declining IV (less likely to expand) weakens the case.`,
                `Person C (double down) is wrong: averaging into a losing position with 18 days left and no breakout signal increases risk with no new evidence.`,
                `Best answer: Follow the plan — the stop is at $75, current value is $105. Do NOT close early, but monitor closely. If IV continues to fall or the option reaches $75, close per the plan. Do not deviate in either direction (don't close early, don't add).`,
              ],
            },
          ],
        },

        // ─── LESSON 3 ────────────────────────────────────────────────────────
        {
          id: 'common-mistakes',
          title: `The 7 Mistakes That Cost Beginners the Most Money`,
          explanation: `Every experienced options trader has made all seven of these mistakes. Most of them made them multiple times. The goal of this lesson is to help you recognise them before they happen, not after.

Mistake 1: Buying cheap "lottery ticket" options
Short-dated, far OTM calls that cost $20 each. "I'll buy 50 of them — if BTC moons, I make a fortune." These almost always expire worthless. Time decay is most brutal for short-dated OTM options. They need a massive, fast move to pay off. They rarely get one.

Mistake 2: Not checking IV percentile before buying
Buying options when IV is at the 85th percentile means paying the most expensive insurance available. Many beginners pay 2-3× the "normal" price for options right before a major event — then wonder why they lose money even when they were directionally correct.

Mistake 3: Holding losers past the stop loss
"It has to recover." "I know this trade will work eventually." This thinking costs more money than any strategy ever lost. Options can expire worthless. Stocks can recover. Options cannot recover after expiry.

Mistake 4: Selling naked options without understanding the risk
Selling an uncovered put or call seems like free money — you collect premium and if nothing happens, you win. Until something happens. The loss from a naked short option is unlimited (for calls) or catastrophically large (for puts). Never sell naked options without a defined-risk hedge until you have at least 2 years of experience.

Mistake 5: Confusing "cheap" with "good value"
An option costing $50 is not necessarily cheap. It depends on IV, time to expiry, and distance from the strike. A $50 option with 3 days to expiry and 8% OTM is effectively worth nothing. A $50 option with 45 days to expiry at ATM might be an excellent trade. Price alone tells you nothing.

Mistake 6: Trading too many products at once
Managing 12 simultaneous options positions across 6 different assets requires professional-grade attention. Beginners who try this end up monitoring nothing properly. Start with 1-2 positions in 1-2 assets until you understand your own patterns.

Mistake 7: Revenge trading after losses
A trader loses $800. They immediately place a $2,400 trade to "make it back quickly." The logic feels compelling in the moment. The math is always catastrophic. Never increase position size after a loss. If anything, reduce it temporarily while you review what went wrong.`,
          visualPrompt: `👆 See each mistake illustrated with a real P&L impact chart`,
          visualType: `image`,
          visualUrl: `seven-mistakes-overview`,
          examples: [
            {
              contextTag: `[Beginner, mistake 1+3, lottery tickets and no stop loss]`,
              context: `A beginner's first month of options trading illustrates mistakes 1 and 3 together.`,
              scenario: `Month 1: Buys 20 × BTC $80,000 calls (7-day expiry) for $15 each = $300. BTC doesn't move to $80k. Calls expire worthless. Loss: $300. Then: buys 5 × ETH $4,000 calls (14-day) for $45 each = $225. ETH moves to $3,600 then falls. Holds past the point where calls had any real value. Loss: $225. Then: buys 3 × SOL $200 calls for $8 each = $24. Expires worthless. Total first-month losses: $549.`,
              outcome: `Contrast: If the same $549 had been used on 3 × $65,000 BTC 45-day ATM calls at $183 each (higher quality, more time), and set a 60% stop loss: on a normal market with some movement, expected result would be much better risk-adjusted performance. The beginner's error was chasing cheap OTM contracts rather than selecting quality setups with defined exits.`,
            },
            {
              contextTag: `[Intermediate trader, mistake 4, naked put disaster, cautionary tale]`,
              context: `A trader who has been doing options for 4 months starts selling naked puts because "the premium is amazing."`,
              scenario: `Sells 3 × BTC $65,000 naked puts for $1,800 each = $5,400 total credit. Thinks: "As long as BTC stays above $65,000, I keep everything." Two weeks later, BTC crashes to $42,000 from $68,000 (a 38% crash in 10 days following a major regulatory shock).`,
              outcome: `Each naked put is now worth $23,000 ($65,000 - $42,000). Three puts: $69,000 of losses. Minus $5,400 in credit received: net loss $63,600 — 12× the premium collected. The trader's $50,000 account is now -$13,600. They owe money to the exchange. With a defined-risk spread (e.g., $65,000/$58,000 put spread, max loss $7,000 per spread × 3 = $21,000), the same crash would have produced a $21,000 - $5,400 = $15,600 loss — still very painful, but survivable. Naked puts = undefined risk. Always use spreads.`,
            },
            {
              contextTag: `[Experienced trader, avoiding mistake 7, account protected]`,
              context: `An experienced trader loses $1,200 in a single day when a volatility trade goes wrong. The old version of this trader would have immediately doubled down to "get it back."`,
              scenario: `Post-loss protocol: 24-hour rule — no new trades for 24 hours after a loss exceeding 5% of account. Write the journal entry first. Review the trade plan. Assess what went wrong. Only after a full day, re-evaluate if any new setups meet criteria.`,
              outcome: `The 24-hour cooling-off period prevented 3 revenge trades that, in hindsight, had poor setups and were emotionally motivated. Each of those trades (reviewed 2 days later) had major red flags the trader recognised while calm that they wouldn't have seen in the heat of the moment. The $1,200 loss was contained. The account survived intact. The trade plan for the following week produced $1,800 in profits.`,
            },
          ],
          keyTakeaway: `The seven mistakes: lottery tickets, high-IV buying, holding losers, naked options, confusing cheap with valuable, overtrading, and revenge trading. Each one is preventable with a plan, a stop loss, and the discipline to follow both. Every professional has made all seven — the goal is to make each mistake as few times as possible and as cheaply as possible.`,
          guidedPractice: [
            {
              question: `You have a $10,000 account. You lose $600 on a bad trade. You immediately feel the urge to place a $2,000 trade on a new setup to "make it back." What should you do?`,
              options: [
                `A — Place the $2,000 trade — you need to recover the loss`,
                `B — Wait at least 24 hours, review the journal entry for the losing trade, and only enter a new trade if it meets your normal criteria`,
                `C — Place a $1,000 trade as a compromise`,
                `D — Stop trading for the rest of the month`,
              ],
              correct: 1,
              hint: `The desire to "make it back" is an emotional state, not a trading strategy. What does your position sizing rule say about a $2,000 trade on a $10,000 account?`,
              explanation: `B is correct. First: $2,000 on a $10,000 account is 20% of capital on one trade — far beyond the 1-2% rule. Second: the motivation (recovering a loss) is emotional, not based on analysis. Trades placed to "recover losses" are typically worse quality than normal trades because emotional energy replaces rational analysis. The 24-hour rule serves as a circuit breaker. After a day, the emotion fades and you can assess whether the new setup actually meets your criteria — or whether you're just desperate to be in a trade. C (compromise at $1,000) is still 10% — still violates position sizing. D is overly extreme; review and return systematically.`,
            },
            {
              question: `You see 7-day BTC calls at $12 each and think "these are so cheap I'll buy 100 of them for $1,200." What is the problem with this thinking?`,
              options: [
                `A — There's no problem — cheap options are always good value`,
                `B — Short-dated OTM options have brutal time decay — 7-day options need a large, fast move in the next few days to have any value. The $1,200 will almost certainly go to zero.`,
                `C — You should buy 200 instead`,
                `D — The exchange doesn't allow buying 100 contracts`,
              ],
              correct: 1,
              hint: `What needs to happen for a 7-day $12 option to become valuable? How often does that exact move happen in exactly 7 days?`,
              explanation: `B is correct. 7-day far OTM options are the closest thing in finance to buying lottery tickets. The problems: (1) Time decay on a 7-day option is enormous — the option loses a significant fraction of its value every single day. (2) The option is far OTM — BTC needs to move significantly just to reach the strike, let alone exceed it by enough to profit. (3) Even if BTC moves in the right direction, a moderate move won't save a deeply OTM option with 3 days left. The "cheap" price is cheap because the probability of success is very low. Quality over quantity — one well-selected 45-day ATM call for $1,200 is far better risk management than 100 lottery tickets.`,
            },
            {
              question: `You sold a naked BTC call when BTC was at $63,000. You collected $1,100 in premium. BTC has now surged to $78,000. What is your approximate loss?`,
              options: [
                `A — $1,100 (you lose the premium you collected)`,
                `B — Approximately $15,000 minus $1,100 = $13,900 loss`,
                `C — Zero — BTC can't keep going up`,
                `D — $5,000 — there's a cap on call losses`,
              ],
              correct: 1,
              hint: `A short call loses when price rises. You're obligated to sell BTC at the strike price. If BTC is at $78,000 and your strike is $63,000, you owe the difference.`,
              explanation: `B is correct. As the seller of a naked call at $63,000, you are obligated to deliver BTC at $63,000 when it's worth $78,000. The buyer will exercise. Your loss: $78,000 - $63,000 = $15,000, minus the $1,100 premium you collected = $13,900 net loss. You risked a $13,900 loss to collect $1,100 — a 12.6:1 risk-to-reward ratio against you. This is the danger of naked options: the premium looks like free money until price moves against you. D is wrong — there is no cap on losses from naked calls. A is wrong — you don't just lose the premium; you owe the full intrinsic value.`,
            },
            {
              question: `Which of these options is genuinely "cheap" and which is merely inexpensive?`,
              options: [
                `A — Both: a $30 option and a $300 option can both be cheap or expensive depending on their expected payoff`,
                `B — The $30 option is always cheap and the $300 option is always expensive`,
                `C — Neither can be determined without more information`,
                `D — Options price is always a fair reflection of value`,
              ],
              correct: 0,
              hint: `Think about what makes an option valuable — it's not the absolute price, it's the relationship between price and probability of profit.`,
              explanation: `A is correct. A $30 option on a $100,000 BTC strike expiring in 2 days is extraordinarily expensive — it will almost certainly expire worthless. A $300 option on BTC's ATM strike with 45 days and low IV might be genuinely cheap relative to its expected payoff. Option prices are only meaningful when evaluated relative to: (1) current asset price, (2) IV percentile, (3) time to expiry, (4) distance to the strike, and (5) any upcoming catalysts. "Cheap" in absolute terms is meaningless. "Cheap relative to expected value" is everything.`,
            },
            {
              question: `You are currently managing 9 simultaneous options positions across BTC, ETH, SOL, BNB, and AVAX. Some are long calls, some are iron condors, one is a calendar spread. What is the main risk of running this many positions?`,
              options: [
                `A — Exchange limits prevent more than 5 positions`,
                `B — You cannot properly monitor 9 positions across 5 assets — individual trades get ignored, stops get missed, and the cognitive load prevents you from analysing new setups properly`,
                `C — More positions always means more profit`,
                `D — There is no downside to more positions if they're all well-chosen`,
              ],
              correct: 1,
              hint: `Think about what "managing a position" actually requires — checking chains, monitoring greeks, being ready to adjust. Multiply that by 9.`,
              explanation: `B is correct. Managing one iron condor requires monitoring: the chain daily, delta exposure, theta, whether any leg is getting close to the short strike, whether to close at 50% profit, etc. Multiply by 9 positions across 5 assets, each with different expiry dates, and the cognitive load becomes unmanageable. Important stops get missed. Positions approach max loss without action. New opportunities are ignored because you're too busy. Professional traders often run fewer, higher-conviction positions rather than many mediocre ones. As a beginner: 2-3 simultaneous positions maximum. Build to more only when your system is documented and the process is habitual.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-ethicalChoice`,
              scenario: `A friend messages you. They describe their current options situation:

"I've had a bad two weeks. Down $2,100 total. I have $3,400 left in my account. Tonight BTC looks like it's about to break out so I'm going to put $2,000 into 2-week $75,000 BTC calls — they're only $38 each so I can buy 52 of them. If this works I get back everything I lost and then some. I'm feeling good about this."

Identify every mistake your friend is about to make and explain the correct approach for their situation.`,
              scoringCriteria: [
                `Mistake 1: Revenge trading — "get back everything I lost" is emotional, not analytical. Correct: no new trades tonight. Journal the losses first.`,
                `Mistake 2: Position sizing violation — $2,000 on a $3,400 account = 59% of account on one trade. Correct: 1-2% = $34-$68 maximum risk per trade.`,
                `Mistake 3: Lottery ticket buying — 52 × 2-week $75,000 calls are deeply OTM short-dated options. At $38, these need BTC to surge over 15% in 2 weeks. Correct: if bullish, buy 1-2 × ATM or near-ATM calls with 30-45 day expiry instead.`,
                `Mistake 4: "Feeling good" is not a thesis. What is the specific reason BTC will break out? IV check? Chart pattern? Catalyst? Without a thesis, this is gambling.`,
                `Correct approach: Stop trading tonight. Write journal entries for the two losing weeks. Review for patterns. Next trade: maximum $34-$68 risk, documented thesis, clear plan, 30-45 day expiry.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Rate each of these trades from 1 (terrible) to 5 (excellent) and explain the rating. All trades are on an account with $15,000.

Trade A: Buy 1 × BTC ATM 35-day call for $420. IV percentile: 19%. Bullish thesis: 3-week consolidation breakout pattern. Stop loss: option falls to $168 (60% loss). Profit target: 100% gain or BTC +$4,000. Max risk: $420 = 2.8% of account.

Trade B: Buy 40 × BTC $80,000 14-day calls at $18 each = $720. No stop loss. "Moon or nothing."

Trade C: Sell 2 × ETH cash-secured puts at $2,700 for $135 each. ETH at $3,100. IV percentile: 71%. Trade plan written. Stop: buy back if puts reach $350 each.

Trade D: Sell 1 × BTC $70,000 naked call for $580. No hedge. BTC at $65,000.

Trade E: Buy 3 × $65,000/$70,000 BTC bull call spreads at $280 each = $840 total. IV percentile: 58%. Thesis: ETF inflows expected. Stop: close if each spread falls to $110. 2.8% max risk on $30k account wait — on $15,000 that's 5.6%. Over 2%.`,
              scoringCriteria: [
                `Trade A: 4-5/5. Good entry (low IV), specific thesis, proper stop, reasonable profit target. Minor issue: 2.8% slightly over 2% rule.`,
                `Trade B: 1/5. Lottery tickets + no stop loss + "moon or nothing" mindset = classic beginner trap. Near-zero probability of profit.`,
                `Trade C: 4/5. High IV environment (good for selling), cash-secured (defined risk), written plan, specific stop. Good trade.`,
                `Trade D: 1/5. Naked call = undefined maximum loss. No hedge. One large BTC move destroys the account. Never appropriate for a retail trader.`,
                `Trade E: 3/5. Good structure (defined risk), but 5.6% total risk exceeds the 2% rule. Would need to reduce to 1 spread ($280 = 1.87% of $15,000). Otherwise reasonable.`,
              ],
            },
            {
              type: `sandbox-dataModel`,
              scenario: `Design your personal "Options Trading Rules" document — a one-page set of rules you will follow for every trade.

Your document must include rules for each of these 7 areas:
1. When I will and won't buy options (IV condition)
2. When I will and won't sell options (IV condition)
3. Maximum risk per trade (position sizing)
4. Maximum number of simultaneous open positions
5. Stop loss rule
6. Profit taking rule
7. Post-loss cooling off rule

For each rule, write it as a specific, measurable statement (not vague — "be careful" is not a rule. "Close any position that loses 50% of entry value" is a rule).`,
              scoringCriteria: [
                `Rule 1 (buy): Specific IV threshold — e.g., "Only buy options when IV percentile is below 40%." Not vague.`,
                `Rule 2 (sell): Specific threshold — e.g., "Only sell options when IV percentile is above 55%." Opposite of buying rule.`,
                `Rule 3 (sizing): Specific % — e.g., "Maximum 2% of account on any single trade." Dollar amount for current account calculated.`,
                `Rule 4 (positions): Specific number — e.g., "Maximum 4 open positions at any time."`,
                `Rule 5 (stop): Specific — e.g., "Close any bought option that loses 60% of entry value. Close any short position that has tripled against me."`,
                `Rule 6 (profit): Specific — e.g., "Close long options at 100% gain or on the first day of the final week before expiry, whichever comes first."`,
                `Rule 7 (cooling off): Specific — e.g., "No new trades for 24 hours after any single loss exceeding 3% of account."`,
              ],
            },
          ],
        },

      ], // End Lab 7 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: [
          'chartReplay-volumeRead',
          'chartReplay-riskManage',
          'judgment-riskAssess',
          'judgment-prioritisation',
          'judgment-dataInterpret',
          'judgment-ethicalChoice',
          'sandbox-dataModel',
        ],
        description: 'Random draw from all Lab 7 professional practice lessons — chain reading, trade plans, journals, and mistake identification. No labels or hints.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'end-of-lab-third-attempt',
          passThreshold: 0.80,
        },
      },

      bossMode: {
        title: `Lab 7 Boss Battle — A Full Trading Day Under Real Conditions`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers' },
        scenarios: [
          {
            id: 'lab7-boss-1',
            situation: `It is Monday morning. You sit down to manage your options portfolio. Here is the full picture.

Your account: $35,000
Your rules (pre-committed): 2% max risk per trade. Max 4 open positions. Stop loss: 60% loss on long options. Close iron condors at 50% profit.

Current open positions:
Position 1: Long BTC $66,000 call. Entered 8 days ago at $1,150. Now worth $420. (Down 63%). BTC at $63,200. 22 days to expiry.
Position 2: ETH iron condor (sold 10 days ago). Collected $310. Now worth $115 (up $195, 62% of max profit). 20 days to expiry.
Position 3: SOL covered call. Own 10 SOL at $140 each ($1,400). Sold $155 call for $18. SOL now at $162. Call worth $7.50. Expiry in 8 days.

New setup available: BTC appears to be forming a bullish reversal pattern. You want to buy a $64,000 BTC call for $680 (35-day expiry). IV percentile: 33%.

For each existing position, state the specific action required by your rules. Then evaluate whether the new BTC call trade should be entered. Write the trade plan for it if yes.`,
            scoringCriteria: [
              `Position 1: Down 63% — has crossed the 60% stop loss threshold. Rule says: close. Action: close the position. Accept the loss. Record in journal. No holding, no hoping.`,
              `Position 2: Iron condor at 62% of max profit — close rule says close at 50%. Action: close immediately, lock in $195 profit. Rule has been met for 12%+ beyond trigger. Should have been closed already.`,
              `Position 3: SOL covered call — SOL at $162, short call at $155 with 8 days remaining. Call is ITM ($7.50 value). Risk: being assigned and forced to sell SOL at $155 when it's worth $162. Decision: roll the call up and out (buy back $155 call for $7.50, sell new $165+ call for next expiry) OR let it expire and accept selling at $155. Either acceptable with justification.`,
              `New BTC call: After closing positions 1 and 2, current open positions = 1 (Position 3). Adding the new BTC call = 2 positions. Within the 4-position limit. $680 = 1.94% of $35,000. Within 2% rule. IV 33% — acceptable for buying. Bullish reversal thesis is specific. Trade is acceptable.`,
              `Trade plan for new call: Must include all 6 elements: thesis (reversal pattern), entry ($64k call, $680, 35-day), profit target (e.g., 100% gain = $1,360 or BTC $67,500), stop loss (60% loss = $272 remaining), max loss ($680 = 1.94%), key risks (reversal fails, IV drops).`,
            ],
          },
        ],
      },
    }, // End Lab 7

  ], // End of all sections/labs

  // ─── TRACK METADATA ────────────────────────────────────────────────────────
  trackComplete: true,
  noFinalBoss: true,
  noPlacementTest: true,
  noPortfolioPush: true,
  completionBadge: 'Professional Options Trader',
  completionXP: 5150,
  totalLabs: 7,
  estimatedHours: 40,
}; // End optionsTradingTrack
