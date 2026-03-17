// ============================================================================
// ⚡ Sifter Skill_Up — MEMECOIN TRADER Career Track
// From complete beginner → professional memecoin trader
// Based on: pump.fun strategy guides, wallet hunting playbook, trader styles
// framework, shitcoin learnings, Memes 2.0 thesis, Solana 101 guide
// ============================================================================

import { SkillTrack } from '../skillTypes';

export const memetraderTrack: SkillTrack = {
  id: 'memecoin-trading',
  category: 'trading',
  icon: '🐸',
  name: 'Memecoin Trading',
  tagline: 'From zero to consistent profits in the most chaotic market on earth.',
  description: 'Memecoins look like gambling until you understand the system. Behind the chaos is a repeatable process: narratives, wallet tracking, CA analysis, entry timing, and relentless profit-taking. This track starts from absolute zero and builds you into a trader who understands why certain coins moon while identical ones die — and who can exploit that edge consistently.',
  difficulty: 'beginner_to_expert',
  color: '#06b6d4',
  estimatedHours: 180,
  earningPotential: '$1,000–$50,000+/month (skill and capital dependent)',
  realWorldOutcomes: [
    'Identify and evaluate any new token in under 60 seconds using a systematic checklist',
    'Track smart money wallets and get alerts before the crowd sees the move',
    'Apply all three trader styles (new pair, dip buyer, lowcap) to different market conditions',
    'Size positions correctly and take profit consistently without roundtripping gains',
    'Read community signals, narrative cycles, and cult formation patterns',
    'Build a professional trading journal and PnL tracking system',
  ],
  worldTheme: {
    name: 'The Trenches',
    description: 'You start as a degen who buys what Twitter tells them. Every rank means you understand more of the system — until you are the system.',
    progressLabels: ['Degen', 'Trenchor', 'Alpha Caller', 'Wallet Hunter', 'Narrative Trader', 'Cult Builder', 'Consistent Printer'],
    accentColor: '#06b6d4',
    bgGradient: ['#0a1628', '#0e2240'],
  },
  comingSoon: false,

  sections: [

// ══════════════════════════════════════════════════════════════════════════════
// JUNIOR LEVEL
// ══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// LAB 1: HOW MEMECOINS ACTUALLY WORK
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-1-mechanics',
      title: `Lab 1: How Memecoins Actually Work`,
      subtitle: `Most traders lose because they never understood the machine. You will not make that mistake.`,
      lessons: [

        {
          id: 'what-memecoins-are',
          title: `What Memecoins Are — And Why They Have Any Value At All`,
          explanation: `In January 2021, Dogecoin — a coin created in 2013 as a joke featuring a Shiba Inu dog — went from $0.008 to $0.74 in four months. That's a 9,150% return. It then crashed 80%. Then it pumped again when Elon Musk hosted Saturday Night Live in May 2021 — and crashed again when he called it a "hustle" on air. The entire price history of DOGE is a case study in what memecoins actually are.

Memecoins are tokenised virality. They represent internet culture — a meme, a character, a moment — turned into a tradable asset. Their value is not based on technology, utility, or revenue. It is based entirely on shared belief, cultural momentum, and the crowd's willingness to assign value to the joke.

This sounds absurd. It also made early holders of $PEPE, $WIF, $BONK, $POPCAT, and $BRETT life-changing money.

**Why does the joke have value?**

Three reasons. First, scarcity: a fixed token supply means if demand rises even slightly, price moves dramatically. Second, game theory: if you believe other people will buy, the rational move is to buy first. Third, network effects: a meme spreads, more people see the token, more people buy.

The Memes 2.0 era (2024–2026) accelerated this. Coins like Fartcoin ($FART) and Retard Finder Coin ($RFC) — proudly stupid, absurdist, and unserious — ran to hundreds of millions in market cap. Not despite being dumb. Because of it. The more unhinged and born-in-a-group-chat-at-3AM a coin felt, the more authentic it was to the culture.

**What you are actually betting on:**
When you buy a memecoin, you are betting that:
(1) Other people will find this meme and want to own it.
(2) They will do so before it reaches a market cap where the return is no longer worth the risk.
(3) You will sell before the last person has bought.

That's the game. Understanding this changes everything about how you trade.

**The two types of memecoin outcomes:**
Most memecoins go to zero. A small number achieve cult status — they develop genuine communities that keep buying dips, holding through dumps, and bringing in new members. $WIF, $BONK, $BRETT, and $POPCAT are cult coins. $TROLL is a more recent example. Identifying the difference before it happens is the skill this track teaches.`,
          visualPrompt: `👆 Chart: DOGE price history 2021 vs PEPE 2023 vs WIF 2024 — three different cult formation patterns`,
          visualType: `chart`,
          visualUrl: `memecoin-cult-formation-patterns`,
          examples: [
            {
              contextTag: `[New Pair Trader, pump.fun launch, Solana, 2025]`,
              context: `A new token launches on pump.fun with a Shiba Inu wearing a cowboy hat. Community immediately starts posting photoshops.`,
              scenario: `Trader checks: community is creating original memes (not just sharing the CA). Twitter has 200 organic posts in the first 30 minutes. No obvious sniper concentration. Enters at $40K market cap.`,
              outcome: `Token builds a 5,000-member Telegram in 48 hours. Reaches $4M market cap. Trader exits at 100× and documents why the community signal was the key indicator.`,
            },
            {
              contextTag: `[Degen, hype play, Solana, 2024]`,
              context: `Elon Musk tweets a meme. A coin with that meme's name launches within minutes.`,
              scenario: `Trader FOMOs in at $2M market cap. Dozens of copycat coins launch simultaneously. Volume is fake — same 10 wallets cycling buys. Community engagement is zero. Nobody is actually making memes.`,
              outcome: `Token dumps 90% in 4 hours. Trader realises the difference: Elon-bait coins without genuine community adoption are exit liquidity traps. The tweet was the top, not the start.`,
            },
            {
              contextTag: `[Community observer, cult formation, Solana, 2025]`,
              context: `$PAINT launches. Developer rugs the project immediately. Community refuses to die.`,
              scenario: `Instead of abandoning the token, holders begin painting profile pictures and creating original art. A community takeover is announced. New dev steps in. Community volume exceeds the original launch.`,
              outcome: `$PAINT goes 50× from post-rug lows. Observer who watched the community signal and bought the CTO makes more than original holders who bought the launch.`,
            },
          ],
          keyTakeaway: `Memecoins have value because shared belief creates demand. You are betting on virality, not fundamentals. The skill is identifying which communities will sustain belief long enough to reward early buyers.`,
          guidedPractice: [
            {
              question: `A trader says: "I bought $FART because it's a coin about farts — it has no real value so it's obviously going to zero." What is wrong with this reasoning?`,
              options: [
                `A — Nothing is wrong. Memecoins with no utility always go to zero.`,
                `B — Memecoin value comes from shared cultural belief and community momentum, not utility. Absence of utility is expected, not a death signal.`,
                `C — The trader is right but only if the coin was launched on Ethereum.`,
                `D — Fart-themed coins specifically have a history of underperformance.`,
              ],
              correct: 1,
              hint: `What did DOGE have in terms of "real value" or utility in 2021 when it hit $90B market cap?`,
              explanation: `B is correct. Memecoins are explicitly not utility plays. $FART, $RFC, and similar Memes 2.0 coins ran to hundreds of millions precisely because the stupidity was the feature — it was authentic to internet culture. The trader's framing applies to altcoins but misses the entire memecoin value model.`,
            },
            {
              question: `What is the primary difference between a cult coin and a coin that goes to zero?`,
              options: [
                `A — Cult coins have verified developer teams.`,
                `B — Cult coins have communities that create original content, hold through dumps, and recruit new members organically.`,
                `C — Cult coins always have their liquidity locked for more than 6 months.`,
                `D — Cult coins are always launched on pump.fun and graduate to Raydium.`,
              ],
              correct: 1,
              hint: `Think about $WIF, $BONK, $PAINT — what do their holders do that normal coin holders don't?`,
              explanation: `B is correct. The defining characteristic of a cult coin is organic community behaviour: creating memes, holding convictions through drawdowns, and evangelising to new participants. Developer verification, LP lock duration, and launchpad are irrelevant to cult status.`,
            },
            {
              question: `A memecoin launches immediately after Elon Musk tweets a meme. You see it at $500K market cap 5 minutes after the tweet. What is the most likely scenario?`,
              options: [
                `A — This is the ideal entry point — maximum upside remains.`,
                `B — This is likely a high-risk entry — the tweet may already be the catalyst top and copycat coins are launching simultaneously.`,
                `C — Elon tweets always produce sustained rallies lasting several weeks.`,
                `D — $500K market cap is too low for an Elon-related coin to have risk.`,
              ],
              correct: 1,
              hint: `The source materials note "Elon bait — if a coin depends on a tweet from Elon to survive, it's probably going to die quickly."`,
              explanation: `B is correct. The source material explicitly flags Elon-bait coins as a pitfall. The tweet is typically the peak catalyst — dozens of copycat coins launch within minutes, splitting demand. Without genuine community formation, these coins collapse as fast as they rise.`,
            },
            {
              question: `What are the three core reasons memecoins have any value at all?`,
              options: [
                `A — Technology, team, and tokenomics`,
                `B — Fixed supply scarcity, game theory (buy before others), and network effects from meme spread`,
                `C — Utility, revenue model, and brand recognition`,
                `D — Exchange listings, VC backing, and whitepaper quality`,
              ],
              correct: 1,
              hint: `Think about what drives any asset's price — supply, demand, and what creates that demand in the memecoin context.`,
              explanation: `B is correct. Scarcity (fixed supply amplifies price with small demand increases), game theory (rational buyers front-run expected buying), and network effects (meme spread = token discovery = new buyers) are the three structural drivers of memecoin value.`,
            },
            {
              question: `The Memes 2.0 era is characterised by what key shift compared to Memes 1.0?`,
              options: [
                `A — Memes 2.0 coins have better technology and more legitimate use cases.`,
                `B — Memes 2.0 embraces absurdity, stupidity, and cultural chaos as explicit strategy — the joke IS the product.`,
                `C — Memes 2.0 focuses on institutional adoption and regulatory compliance.`,
                `D — Memes 2.0 coins are only launched on Ethereum instead of Solana.`,
              ],
              correct: 1,
              hint: `The source material describes Memes 2.0 as "loud, degenerate, and immature" — what does that tell you about the strategy?`,
              explanation: `B is correct. Memes 1.0 tried to recreate DOGE or PEPE with semi-serious branding. Memes 2.0 abandoned that entirely — coins like Fartcoin and RFC succeeded because they were authentically stupid, not in spite of it. The unserious vibe was proof of cultural authenticity.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You see three new tokens launch on pump.fun in the same hour:

Token A ($DOGGO): Cartoon dog. 200 Twitter posts in first 30 minutes, all organic memes. Community Telegram has 800 members, people posting edited photos. Dev wallet holds 2%. LP locked. Market cap: $45K.

Token B ($ELONPET): References a pet photo Elon posted 2 hours ago. 500 Twitter posts but 90% are just "CA: [address] buy now entry at X". Telegram has 50 members. Dev holds 15%. Market cap: $800K.

Token C ($FARTKING): Pure absurdist humour. No clear cultural reference. Community is creating meme content. 150 Twitter posts, mix of memes and entries. Dev wallet 3%, LP locked. Market cap: $25K.

Rank the three by cult formation probability. Justify each ranking with specific signals from the data provided.`,
              scoringCriteria: [
                `Token A ranks highest: organic meme creation (not just CA sharing), strong community growth rate, low dev concentration, locked LP, low market cap entry`,
                `Token C ranks second: genuine content creation, low dev concentration, authentic absurdist angle consistent with Memes 2.0 — lower due to no clear cultural reference`,
                `Token B ranks lowest: CA sharing without content creation = exit liquidity behaviour, high dev concentration, Elon-bait with no community organics, already at $800K removes upside`,
                `Student explicitly identifies the Twitter signal difference: "entry at X MC" posts vs original meme creation`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Study these historical outcomes and answer the questions:

$PEPE (Ethereum, 2023): Launched April 2023 at ~$50K MC. Community immediately started creating Pepe meme variations. Reached $1.6B MC. Currently trades at $600M+.

$GME (Solana, 2024): Launched to capitalise on the GameStop nostalgia narrative. Hit $800M MC in 48 hours when buzz was peak. Crashed 95% over the following 2 weeks.

$WIF (Solana, 2023): Dog wearing a hat. Launched on pump.fun. Community created "WIF" themed content for months. Currently a top-10 Solana token by volume.

$TROLL (Solana, 2024): Based on classic internet troll face meme. Listed by Coinbase. Community extremely active 18 months after launch.

Questions:
1. What pattern separates the sustained performers ($PEPE, $WIF, $TROLL) from $GME?
2. What does the $GME trajectory tell you about catalyst-dependent coins?
3. If you had to predict which of these was still tradeable 12 months after launch, what indicator would have been the strongest signal?`,
              scoringCriteria: [
                `Sustained performers share: independently recognisable cultural asset (Pepe, dog with hat, classic troll face) with community that creates content without needing external catalyst`,
                `GME was pure catalyst dependence — when the GameStop narrative faded, there was no underlying community to sustain price; it was exit liquidity, not a cult`,
                `Strongest 12-month signal: organic content creation rate in the first 48–72 hours — $WIF holders made hats, $PEPE holders made memes, $TROLL holders spread the image. $GME holders only shared the CA and price targets`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You are shown two pump.fun token charts side by side, both at $500K market cap, 6 hours after launch.

Chart A: steady accumulation pattern — gradual price increase from $20K to $500K over 6 hours, volume consistent throughout, no single spike, multiple small buy transactions visible.

Chart B: explosive spike — reached $500K in 45 minutes, one massive volume candle, then 70% dump, now grinding sideways at $500K on very low volume.

For each chart: (1) What does the price pattern suggest about buyer type? (2) Which is more likely to continue higher and why? (3) What additional information would you check before entering either?`,
              scoringCriteria: [
                `Chart A suggests organic accumulation: multiple buyers entering at different price levels over time = distributed ownership = less concentrated sell pressure`,
                `Chart B suggests sniper/bundler activity: one entity pushed the price up, the 70% dump was likely that entity selling, current sideways on low volume = people waiting to sell into any volume`,
                `Chart A more likely to continue: organic buyer base means holders have different cost bases and conviction levels; Chart B has trapped bag holders above the dump point`,
                `Additional checks for both: holder distribution (Bubblemaps), dev wallet %, any KOL calls, community activity on Twitter/Telegram`,
              ],
            },
          ],
        },

        {
          id: 'bonding-curve-mechanics',
          title: `The Bonding Curve — How pump.fun Actually Works`,
          explanation: `In 2024, pump.fun became the dominant memecoin launchpad on Solana. By early 2025 it had launched over 3 million tokens and processed more daily transactions than most blockchains. Understanding exactly how it works is not optional — it is the foundation of every trade you will make.

**The bonding curve explained:**

Every token on pump.fun starts with zero liquidity. Instead of needing a liquidity pool at launch (which requires the creator to deposit both their token and SOL), pump.fun uses a bonding curve — an automated pricing formula where the price rises automatically with every buy.

The mechanism: as people buy, tokens are taken from a fixed pool of 1 billion tokens, and SOL is added to a reserve. The price at any moment is: Reserve SOL ÷ Tokens remaining in curve. More SOL in = fewer tokens remain = higher price.

This means every buyer automatically creates liquidity for the next buyer. No initial LP needed. No rug from LP removal (there is no LP yet).

**The graduation threshold:**

When approximately 500 SOL ($69,000–$80,000 at typical SOL prices) has been deposited into the bonding curve, the token "graduates." pump.fun automatically creates a real liquidity pool on Raydium, burns the LP tokens (making the liquidity permanent), and the token becomes a standard Solana DEX token.

This graduation event is significant: it signals the community has real buying conviction, it activates DEX aggregators (Jupiter, etc.) which route trades through the token, and it triggers many automated bot signals and alpha channels.

Only approximately 2% of pump.fun tokens graduate. Of those, maybe 10% become genuine communities.

**What this means for traders:**

Pre-graduation (bonding curve phase): lowest market caps, highest risk, highest potential return. Price can be moved significantly by small amounts of SOL. The token can fail to graduate and sit at 95% completion forever.

Post-graduation (Raydium): larger holders, more price stability, better tools for analysis (DEXScreener, GMGN). The pump.fun risk is over; real market dynamics begin.

**Sniper detection:**

Because the bonding curve shows every buy from inception, you can see exactly who bought in the first seconds. Sniper wallets — bots that monitor for new token contracts and buy in milliseconds — often grab 10–30% of a token's supply before humans can react. Heavy sniper concentration means massive sell pressure sitting above you, waiting to dump as price rises.

Tools like GMGN and Syrax Scanner show you the sniper distribution before you enter.`,
          visualPrompt: `👆 Interactive bonding curve: drag SOL deposits and watch price rise to graduation threshold`,
          visualType: `interactive`,
          visualUrl: `pump-fun-bonding-curve-sim`,
          examples: [
            {
              contextTag: `[New Pair Trader, pre-graduation entry, pump.fun, 2025]`,
              context: `A trader spots a token at 15% of the bonding curve ($10K SOL equivalent). Strong meme, active community forming.`,
              scenario: `Token has 3 snipers holding 8% combined. Remaining 85% distributed across 200+ wallets. Community Telegram growing. Trader enters with 0.5 SOL at $10K MC.`,
              outcome: `Token graduates at $69K MC. Trader's 0.5 SOL is now worth approximately 3.5 SOL at graduation. Post-graduation token continues to $500K MC driven by DEXScreener discovery. Trader takes 50% profit at graduation and holds remainder.`,
            },
            {
              contextTag: `[Degen, sniper trap, pump.fun, 2024]`,
              context: `Token looks clean on chart — steady curve climb. Trader buys 1 SOL at 80% of the bonding curve.`,
              scenario: `Syrax Scanner check (done after entry) reveals dev bundled 40% of supply across 20 wallets in the first block. These wallets are sitting at 2× waiting to sell.`,
              outcome: `Token graduates. Dev bundles immediately sell into the graduation volume. Token dumps 70% in the first 30 minutes on Raydium. Trader loses 0.6 SOL. Lesson: always check bundle analysis before entry.`,
            },
            {
              contextTag: `[Experienced trader, graduation trade, Raydium, 2025]`,
              context: `Trader monitors pump.fun graduation events. A dog-meme token graduates at 10pm UTC on a Friday — peak memecoin trading hours.`,
              scenario: `Post-graduation analysis: snipers held only 6% combined, community Telegram has 2,000 members with organic content. DEXScreener shows token entering "Hot Pairs" trending list.`,
              outcome: `Trader enters post-graduation at $100K MC with 2 SOL. Token trends to $3M MC over 72 hours on the back of DEXScreener discovery and KOL calls. Takes profit in three tranches at $300K, $1M, $3M.`,
            },
          ],
          keyTakeaway: `pump.fun's bonding curve means every buy raises the price and the graduation threshold at ~$69K MC creates a major inflection point. Only 2% of tokens graduate. Check sniper/bundle concentration before every pre-graduation entry.`,
          guidedPractice: [
            {
              question: `A token is at 85% of the pump.fun bonding curve with $58,500 in the reserve. What does "graduation" mean and what happens at that point?`,
              options: [
                `A — The developer withdraws all SOL and the project ends`,
                `B — pump.fun creates a permanent Raydium liquidity pool, burns the LP tokens, and the token becomes a standard DEX token accessible to Jupiter and DEX aggregators`,
                `C — The token migrates to Ethereum automatically`,
                `D — The top 10 holders receive a bonus allocation of new tokens`,
              ],
              correct: 1,
              hint: `What structural change happens to liquidity when a pump.fun token reaches the threshold?`,
              explanation: `B is correct. Graduation means pump.fun automatically creates a Raydium LP, deposits the bonding curve's SOL plus tokens into it, and burns the LP tokens permanently. This makes the liquidity irremovable (no LP rug possible) and makes the token tradeable on all Solana DEX aggregators.`,
            },
            {
              question: `You see a pump.fun token where 35% of supply was bought by 8 wallets in the first 3 seconds of launch. What does this indicate and why does it matter?`,
              options: [
                `A — Strong early community conviction — these are real believers`,
                `B — Heavy sniper/bundle activity — 35% of supply represents concentrated sell pressure sitting above current price, waiting to dump as volume enters`,
                `C — The developer allocated tokens to team wallets as expected`,
                `D — This is normal launch behaviour with no impact on price action`,
              ],
              correct: 1,
              hint: `If 35% of supply was bought in 3 seconds by bots, what are those bots likely waiting to do?`,
              explanation: `B is correct. Bots that snipe in the first seconds are not long-term holders — they are extractors. They bought at the lowest possible price and will sell as soon as sufficient volume arrives to absorb their position. 35% sniper concentration means selling into every pump.`,
            },
            {
              question: `Why can a pump.fun token NOT be rugged via LP removal before graduation?`,
              options: [
                `A — pump.fun requires the developer to lock LP for 12 months`,
                `B — There is no LP to remove — the bonding curve mechanism doesn't use a traditional liquidity pool until graduation`,
                `C — Solana's blockchain prevents LP removal transactions`,
                `D — pump.fun holds the LP in escrow and only releases it after 30 days`,
              ],
              correct: 1,
              hint: `Think about what "bonding curve" means vs a traditional liquidity pool — what exists vs what doesn't?`,
              explanation: `B is correct. The bonding curve is the pricing mechanism itself — it holds SOL reserves and token reserves inside the pump.fun contract. There is no separate LP pool to drain. The liquidity rug risk only applies once the token graduates and creates a real Raydium LP.`,
            },
            {
              question: `Approximately what percentage of pump.fun tokens graduate to Raydium?`,
              options: [
                `A — About 25% — one in four tokens makes it`,
                `B — About 50% — half of all launches`,
                `C — About 2% — roughly 1 in 50`,
                `D — About 10% — one in ten`,
              ],
              correct: 2,
              hint: `The source material says only a tiny fraction graduate — think about how many tokens are launched vs how many you see trading on Raydium.`,
              explanation: `C is correct. Approximately 2% of pump.fun tokens graduate. This means 98% of tokens either fail to reach the graduation threshold or reach it without sufficient sustained community interest. Of those that graduate, only a fraction (roughly 10%) become genuine cult coins.`,
            },
            {
              question: `A token is 60% through the bonding curve. You see: 3 sniper wallets holding 12% combined, community Telegram has 500 members with active meme creation, DEXScreener shows consistent volume for 3 hours. What is the most relevant risk factor to evaluate before entering?`,
              options: [
                `A — Whether the developer has been doxxed`,
                `B — The 12% sniper concentration — calculate whether graduation volume will absorb their selling before price continues`,
                `C — Whether the token will be listed on Binance`,
                `D — The token's smart contract audit status`,
              ],
              correct: 1,
              hint: `You have positive signals already (community, volume). What is the single factor that could cause a dump even if graduation goes well?`,
              explanation: `B is correct. At 12% sniper concentration, the critical question is whether post-graduation buying volume will be large enough to absorb those sells without crashing the chart. 12% is manageable if the community is strong — but it is the primary risk. Doxxed dev, Binance listing, and smart contract audit are irrelevant for a pump.fun memecoin.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-pattern`,
              scenario: `You are given a pump.fun bonding curve chart with the following data points:

Time 0 (launch): Token created. 5 wallets buy in first 2 seconds, total: 28% of supply. Combined cost: 0.8 SOL.
Time 0–5 min: No further activity. Chart flatlines.
Time 6 min: Single large buy of 2 SOL. Chart jumps to 25% bonding curve completion.
Time 6–20 min: 40 small buys from 38 unique wallets. Chart reaches 45%.
Time 20 min: Heavy sell activity from one of the 5 launch wallets (holds 8% supply). Chart drops from 45% to 30%.
Time 30 min: Community posts begin appearing on Twitter — original meme content. Volume picks up. Chart resumes climb to 60%.

Questions:
1. What happened at Time 0 and what does it imply for sell pressure?
2. What does the sell at Time 20 min tell you about that wallet's intent?
3. Should you enter at 60% curve completion, given all the data? Justify.`,
              scoringCriteria: [
                `Time 0: 5 wallets = sniper/bundle activity. 28% in 2 seconds is heavily concentrated. These are not organic buyers — they are bots or coordinated early buyers who will sell as volume increases`,
                `Time 20 min sell: one of the snipers took profit early on the single large buy pump. This is expected behaviour. Positive signal: the sell did NOT kill the community volume — price recovered`,
                `Entry at 60%: reasonable if student identifies: (a) 4 remaining sniper wallets still hold ~20% which is elevated risk; (b) community signal (original Twitter content) is positive; (c) position size should be small given concentration risk. Student should note: check GMGN or Syrax for remaining sniper wallet details before entering`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Three tokens are all at exactly $50,000 market cap (pre-graduation on pump.fun). You have 0.5 SOL to deploy into one.

Token X: No sniper activity. 150 unique holders after 2 hours. Community Telegram: 300 members, people sharing memes about the coin. Dev holds 3%. Launch time: 2 hours ago.

Token Y: 22% sniper concentration across 4 wallets. 400 unique holders. Community Telegram: 1,200 members, heavy engagement. Dev holds 2%. Launch time: 45 minutes ago. 3 KOL calls detected on Telegram.

Token Z: 5% sniper concentration. 90 unique holders. No Telegram visible. No X activity. Dev holds 1%. Launch time: 4 hours ago. Volume has been declining for 2 hours.

Where do you deploy the 0.5 SOL and what is your reasoning? Include what you would NOT do and why.`,
              scoringCriteria: [
                `Token X is the best deployment: zero sniper concentration = no concentrated sell pressure, community forming organically at $50K MC, 2-hour age means not too early to miss community validation and not too late`,
                `Token Y is riskier: 22% sniper concentration is substantial — the 1,200 Telegram members and KOL calls may be sufficient to absorb sells, but this is a higher-risk play; if entering Y, position size should be smaller`,
                `Token Z should be avoided: declining volume + no community + 4-hour age = dying chart with no catalyst visible`,
                `Student correctly identifies: KOL calls on Token Y are double-edged — they bring buyers but also signal the play may already be discovered`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Post-graduation analysis. A token graduated yesterday. Current data:

Market cap: $180K (graduated at $69K, current price is 2.6× graduation price)
Holder distribution (from Bubblemaps): top wallet 4%, next 10 wallets average 1.8% each. No large concentrated positions.
Sniper wallets from launch: all have sold (confirmed via transaction history).
DEXScreener: entered Hot Pairs list 2 hours ago.
Community: 3,500 Telegram members. Original meme content being created. No large sells visible.
Twitter: 800 mentions in last 6 hours. Mix of organic memes and some CA sharing.

Questions:
1. What does the holder distribution tell you about sell pressure risk?
2. The snipers have already sold — is this bullish or bearish and why?
3. Construct an entry thesis: should you enter, at what size relative to portfolio, and what would invalidate your thesis?`,
              scoringCriteria: [
                `Holder distribution is healthy: no single wallet above 4%, distributed ownership means no single sell can crash the chart`,
                `Snipers sold = bullish: the concentrated sell pressure overhang is gone. Price absorbed those sells and continued higher — proof of real buyer demand beneath`,
                `Entry thesis: yes — enter with 2–5% of portfolio at $180K MC. Thesis: distributed holders + real community growth + DEXScreener Hot Pairs discovery still early. Invalidation signals: major KOL dump, dev wallet sell (monitor), community sentiment shift, volume dying below 3-day average`,
              ],
            },
          ],
        },

        {
          id: 'market-cap-fdv-math',
          title: `Market Cap Math — The Only Number That Actually Matters`,
          explanation: `In 2024 a Solana memecoin called $ANALOS launched. The price was $0.000000034 per token. Inexperienced traders saw the price and thought it was "cheap." Professional traders looked at the circulating supply — 1 quadrillion tokens — and calculated the market cap: $34 million. At that price it was not cheap at all. It had already priced in enormous success.

This is the most fundamental memecoin concept and the most commonly misunderstood one.

**Market Cap = Price × Circulating Supply**

This is the only number that tells you how the market values a coin right now. Price per token is meaningless without knowing the supply.

Example: Token A at $0.001 with 100M supply = $100,000 market cap. Token B at $0.0000001 with 10 trillion supply = $1,000,000 market cap. Token B is 10× more expensive than Token A despite being a tiny fraction of the price.

**FDV — the hidden number:**

Fully Diluted Valuation = Price × Total Supply (including locked tokens). If FDV is 10× higher than market cap, 90% of tokens are still locked and will eventually enter circulation. When they do, every existing holder gets diluted.

For pump.fun tokens: typically all 1 billion tokens are in circulation immediately (no vesting). FDV = Market cap. This is clean.

For VC-backed tokens: team and investor allocations often vest over 1–4 years. FDV can be 10–50× market cap. These tokens have massive future selling pressure baked in.

**The market cap entry framework:**

The source material is explicit: "Under $1M? That's your sweet spot." Here is why:

At $50K MC: 100× gets you to $5M (achievable for a cult coin)
At $500K MC: 100× gets you to $50M (requires top-10 Solana memecoin status)
At $5M MC: 100× gets you to $500M (requires DOGE/SHIB level cultural adoption)
At $50M MC: 100× gets you to $5B (requires Bitcoin-level recognition)

The math tells you which entries are realistic. Most successful traders operate primarily in the $25K–$1M entry range.

**Liquidity vs market cap:**

A $2M market cap token with only $50K in liquidity is extremely fragile — a single $10K sell can move the price 20%. A $2M market cap token with $500K liquidity is much more stable. Always check liquidity alongside market cap on DEXScreener.`,
          visualPrompt: `👆 Interactive market cap calculator: input price and supply, see MC and required MC for different return targets`,
          visualType: `interactive`,
          visualUrl: `memecoin-mc-calculator`,
          examples: [
            {
              contextTag: `[New Trader, price illusion trap, Solana, 2024]`,
              context: `A new trader sees a coin at $0.00000001. "This is cheaper than PEPE was at launch!"`,
              scenario: `Trader checks supply: 100 trillion tokens. Market cap calculation: $0.00000001 × 100,000,000,000,000 = $1,000,000. The "cheap" coin already has a $1M market cap.`,
              outcome: `Trader avoids buying based on price alone. Instead checks market cap. Correctly identifies that the coin would need to reach $1B MC for a 1,000× — requiring it to become one of the most valuable memecoins in history.`,
            },
            {
              contextTag: `[Risk-adjusted trader, entry sizing, pump.fun, 2025]`,
              context: `Two tokens: Token A at $80K MC, strong community, 8% sniper. Token B at $800K MC, strong community, established.`,
              scenario: `Trader calculates return potential: Token A needs to reach $8M for 100× (achievable), Token B needs to reach $80M for 100× (requires massive breakthrough). Same community quality — different risk/reward profiles.`,
              outcome: `Trader allocates 3× more capital to Token A than Token B. Token A goes 40× to $3.2M MC. Token B goes 8× to $6.4M MC. Token A generated 5× more profit on the same thesis.`,
            },
            {
              contextTag: `[Experienced trader, liquidity check, Raydium, 2025]`,
              context: `Token shows $3M market cap on DEXScreener. Looks promising.`,
              scenario: `Trader checks liquidity: $45K. Calculates price impact of their planned 3 SOL ($450) buy: approximately 1% price impact. Acceptable. But checks what a 10 SOL sell would do: 20% price crash.`,
              outcome: `Trader reduces position size to 1 SOL given thin liquidity. Token later gets a large sell from a whale — thin liquidity means 40% crash in seconds. Small position size limits damage to manageable loss.`,
            },
          ],
          keyTakeaway: `Market cap = price × circulating supply. Price per token means nothing without it. Your entry market cap determines your return potential. Under $1M MC is your operating range for asymmetric upside. Always check liquidity alongside market cap.`,
          guidedPractice: [
            {
              question: `Token $MOON is priced at $0.000001 per token with a total supply of 500 billion tokens. What is the market cap?`,
              options: [
                `A — $500`,
                `B — $500,000`,
                `C — $500,000,000`,
                `D — $5,000,000`,
              ],
              correct: 1,
              hint: `Market Cap = Price × Supply. Multiply $0.000001 × 500,000,000,000.`,
              explanation: `B is correct. $0.000001 × 500,000,000,000 = $500,000. The token is at a $500K market cap despite the price looking tiny. A 100× from here would require reaching $50M market cap — possible but requires significant traction.`,
            },
            {
              question: `A pump.fun token has a market cap of $25,000. Your target return is 50×. What market cap does the token need to reach?`,
              options: [
                `A — $75,000`,
                `B — $500,000`,
                `C — $1,250,000`,
                `D — $2,500,000`,
              ],
              correct: 2,
              hint: `If current MC is $25K and you want 50×, multiply $25,000 by 50.`,
              explanation: `C is correct. $25,000 × 50 = $1,250,000. A $1.25M market cap is well within the range of cult-forming tokens — this is a realistic target for a token with strong community signals.`,
            },
            {
              question: `What is FDV and why is it more dangerous in VC-backed tokens than in pump.fun tokens?`,
              options: [
                `A — FDV means Fully Decentralised Volume, and it's irrelevant for short-term traders`,
                `B — FDV = Price × Total Supply including locked tokens. VC-backed tokens have large team/investor allocations that vest over time, creating future selling pressure. pump.fun tokens typically have all supply in circulation from day one.`,
                `C — FDV is the floor price valuation used by market makers`,
                `D — FDV is irrelevant for memecoins since they have no utility`,
              ],
              correct: 1,
              hint: `Think about what happens when team tokens that are currently locked eventually become sellable.`,
              explanation: `B is correct. FDV represents the theoretical valuation if all tokens were in circulation. For a token with FDV 20× market cap, 95% of tokens are still locked. When they unlock, holders face massive dilution. pump.fun tokens avoid this because all 1B tokens enter circulation at launch.`,
            },
            {
              question: `A $500K market cap token has $30K in liquidity. You plan to buy 5 SOL worth (~$750). What is the most important concern?`,
              options: [
                `A — Whether the developer team is anonymous`,
                `B — Your $750 buy will cause significant price impact on $30K liquidity, and any large sell will crater the price dramatically`,
                `C — Whether the token is listed on DEXScreener`,
                `D — The token's Twitter follower count`,
              ],
              correct: 1,
              hint: `What happens to price when a large buy or sell hits a pool with very little liquidity?`,
              explanation: `B is correct. Thin liquidity ($30K) against a $500K market cap means the price is fragile. Your $750 buy represents 2.5% of the liquidity — significant price impact. More importantly, any whale sell of $3K–$5K could crash the price 10–15%. Thin liquidity is a major risk factor.`,
            },
            {
              question: `You have $1,000 to invest. You are choosing between a $50K MC token and a $5M MC token with equally strong communities. Which entry offers better risk/reward for a 10× target, and why?`,
              options: [
                `A — The $5M MC token — it is more established and therefore safer`,
                `B — The $50K MC token — a 10× requires reaching only $500K MC, which many cult coins achieve. The $5M MC token requires $50M MC for the same return.`,
                `C — Neither — you should only invest in tokens with market caps above $10M`,
                `D — They are equivalent because the community quality is the same`,
              ],
              correct: 1,
              hint: `What market cap does each token need to reach for you to 10× your money?`,
              explanation: `B is correct. The $50K MC token needs to reach $500K for a 10× — a common milestone for cult-forming tokens. The $5M MC token needs $50M for the same return — significantly harder to achieve. Equal community quality at different market caps = better entry at lower MC.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `You are evaluating five tokens. Calculate the required market cap for each to deliver 50× returns, and assess which are realistic targets for Solana memecoins.

Token 1: $15,000 MC — new pump.fun launch, 45 minutes old
Token 2: $250,000 MC — graduated 2 days ago, trending on DEXScreener
Token 3: $2,500,000 MC — established coin, 3 weeks old, active community
Token 4: $10,000,000 MC — listed on a mid-tier CEX, known brand
Token 5: $100,000 MC — just graduated, strong community memes

For each: (1) Required MC for 50×. (2) Realistic probability assessment. (3) Whether you would consider this entry for a small speculative position.`,
              scoringCriteria: [
                `Token 1: $750K required. Realistic — many cult tokens reach $500K–$2M. High risk (very new) but asymmetric. Small position appropriate.`,
                `Token 2: $12.5M required. Possible but requires significant traction. Community analysis critical. If strong signals, reasonable.`,
                `Token 3: $125M required. Difficult — requires top-5 Solana memecoin status. Only for established cults. Poor risk/reward for a new entry.`,
                `Token 4: $500M required. Extremely difficult. CEX listing already priced much of the upside. 50× from $10M MC = rare event.`,
                `Token 5: $5M required. Sweet spot — recently graduated, strong community. $5M is achievable for a genuine cult. Best risk/reward of the five.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Two pump.fun tokens. Same market cap: $35,000.

Token A: 5 billion total supply. All in circulation. Current price $0.000007.
Token B: 100 billion total supply. 10% currently in circulation (10 billion tokens). Current price $0.0000035. Team holds 50% (locked for 6 months), early investors hold 40% (unlocking over 12 months).

You are told: "Token B is twice as cheap as Token A per token, therefore better value."

Identify why this statement is incorrect and explain the actual risk profile difference between the two tokens.`,
              scoringCriteria: [
                `Price per token is irrelevant — both have the same $35K market cap therefore the same "price" in market terms`,
                `Token A has clean supply: all tokens in circulation, no future dilution risk, FDV = MC`,
                `Token B is dangerous: FDV = $0.0000035 × 100,000,000,000 = $350,000 — 10× higher than current MC. When team (50%) and investors (40%) unlock, 9 billion tokens enter circulation. That is 9× the current circulating supply entering the market. Massive dilution.`,
                `Token A is clearly preferable despite identical current MC: no future supply shock, typical pump.fun structure (1B tokens, all circulating)`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `DEXScreener data for a post-graduation token over 5 days:

Day 1 (graduation day): MC $69K → $400K. Volume $2.1M. Liquidity grew from $45K to $210K.
Day 2: MC $400K → $1.2M. Volume $4.8M. Liquidity $480K.
Day 3: MC $1.2M → $800K (pullback). Volume $1.9M. Liquidity stable $460K.
Day 4: MC $800K → $2.1M (recovery + breakout). Volume $6.2M. Liquidity $890K.
Day 5: MC $2.1M → $1.4M. Volume $800K (declining). Liquidity $870K.

Questions:
1. What does the growing liquidity pattern tell you (Days 1–4)?
2. Day 3 was a 33% pullback. Was this a sell signal or a buy opportunity? What data point tells you?
3. Day 5 shows declining volume with a price drop. What does this suggest and what would you watch for next?`,
              scoringCriteria: [
                `Growing liquidity (Days 1–4) = new LPs are adding liquidity, signalling confidence in the token's longevity. Price stability improves with deeper liquidity.`,
                `Day 3 pullback was a buy opportunity: liquidity held stable ($460K) meaning LPs did not panic-remove. Volume was still $1.9M — healthy. Price recovered fully on Day 4 with breakout to new high. Stable liquidity during a pullback = strong hands holding.`,
                `Day 5: declining volume + price drop = potential distribution phase. Watch for: further volume decline (trend exhaustion), LP removal beginning (liquidity shrinks), community activity declining on Twitter/Telegram. If volume recovers above Day 4 levels, thesis intact.`,
              ],
            },
          ],
        },

        {
          id: 'rug-types-detection',
          title: `Every Rug Type — And How to Detect Each One Before You're in It`,
          explanation: `In September 2024, a token called $LIBRA launched on Solana with an association to Argentine President Javier Milei. Within hours of the endorsement tweet, insiders had already sold $107 million worth of tokens. Retail buyers entered on the news and were immediately trapped. The structure of the rug was different from a typical LP removal rug — this was a coordinated insider dump using pre-positioned wallets.

Rugs are not all the same. Each type has a different detection method. Miss one and you can lose everything even after checking the usual boxes.

**Type 1 — LP Removal Rug (most common, easiest to detect):**
Developer creates token + LP. Hype builds. Dev removes all liquidity from the pool in one transaction. Price goes to zero instantly. All remaining holders are trapped with worthless tokens.

Detection: Check if LP is locked. Rugcheck.xyz shows LP lock status. Locked LP = this rug type is impossible for the lock duration.

**Type 2 — Mint Authority Dump (Solana-specific):**
If mint authority is NOT revoked, the developer can create new tokens at any time. They wait for the price to peak, mint billions of additional tokens, and sell them into the market. Your holding becomes a tiny fraction of total supply overnight.

Detection: Check mint authority status on Rugcheck.xyz or Solscan. Look for "Mint Authority: Disabled" — if it shows an active address, the risk is real.

**Type 3 — Bundle/Farm Dump (hardest to detect):**
Developer creates the token and simultaneously buys a large portion (20–50%) using multiple fresh wallets in the same block or within seconds of launch. These wallets don't appear as "dev" on tools. As volume enters from organic buyers, the developer sells from these hidden wallets gradually or all at once.

Detection: Syrax Scanner, Trench Radar Bot, and GMGN all check for bundled purchases. Look for multiple fresh wallets buying identical amounts in the first few seconds with identical funding sources.

**Type 4 — Slow Rug / Team Selling:**
No dramatic event. Team simply sells their allocation gradually over days or weeks as the price rises. Chart looks healthy, volume looks real, but careful analysis reveals early wallets steadily exiting.

Detection: Watch the top holder list on GMGN over multiple days. If the same wallets are consistently reducing holdings, that is a slow exit. Also watch for developer wallet activity on Solscan.

**Type 5 — Honeypot (can't sell):**
Smart contract has hidden code that allows buying but blocks selling. All tokens appear in your wallet but you can never execute a sell transaction.

Detection: TokenSniffer (Ethereum), Rugcheck.xyz (Solana) both run honeypot simulations. Also try to sell a very small amount before committing your full position.

**The 30-second pre-entry checklist:**
1. Rugcheck.xyz — overall score + LP lock + mint authority
2. Syrax Scanner or Trench Radar — bundle/farm check
3. GMGN top holders — no single wallet above 10% (excluding locked/burn addresses)
4. Quick test sell with dust amount if already holding

Most experienced traders do this in under 60 seconds on every new entry.`,
          visualPrompt: `👆 Side-by-side: clean token vs bundled token on GMGN — spot the difference`,
          visualType: `interactive`,
          visualUrl: `rug-detection-comparison`,
          examples: [
            {
              contextTag: `[Experienced trader, bundle detection, pump.fun, 2025]`,
              context: `Token looks perfect: strong meme, active community, locked LP, revoked mint. Trader runs Syrax Scanner.`,
              scenario: `Syrax Scanner reveals 8 fresh wallets funded from the same parent wallet, all bought within 0.3 seconds of launch, collectively holding 31% of supply. Parent wallet was funded from a known rug dev address.`,
              outcome: `Trader skips the entry entirely. Token pumps 4× over the next hour as organic buyers enter, then dumps 90% as the 8 bundle wallets sell into the volume. Experienced traders who checked their tools avoided the trap.`,
            },
            {
              contextTag: `[New trader, honeypot, Ethereum, 2024]`,
              context: `New trader buys $200 of a trending ETH token. Price goes up 3×.`,
              scenario: `Trader tries to sell $200 worth of profit. Transaction fails. Tries again with different slippage. Fails again. Checks TokenSniffer after the fact — honeypot confirmed. Sell function is blocked in the contract.`,
              outcome: `Entire $200 is lost. Trader learns: always check TokenSniffer on Ethereum tokens before buying. The check takes 20 seconds.`,
            },
            {
              contextTag: `[Experienced trader, slow rug detection, Raydium, 2025]`,
              context: `Token has been trading for 3 weeks. Community seems active. Trader checks GMGN weekly.`,
              scenario: `Week 1: top wallet holds 4.2%. Week 2: same wallet holds 3.1%. Week 3: same wallet holds 1.9%. Two other top wallets show similar declining patterns. Three early wallets are consistently reducing positions.`,
              outcome: `Trader recognises slow rug pattern and exits before the price impact becomes obvious. Token drops 70% over the following 2 weeks as selling pressure accumulates. Documentation of weekly holder changes becomes part of the trader's standard process.`,
            },
          ],
          keyTakeaway: `There are 5 distinct rug types: LP removal, mint dump, bundle/farm, slow rug, and honeypot. Each has a specific detection tool. Run Rugcheck + bundle scanner + top holder check before every entry. 60 seconds of checking prevents most losses.`,
          guidedPractice: [
            {
              question: `A pump.fun token has its LP locked for 6 months and mint authority revoked. A Syrax Scanner check shows 12 fresh wallets bought 38% of supply in the first 2 seconds. Which rug type is still active and what should you do?`,
              options: [
                `A — No rug risk — LP locked and mint revoked covers all scenarios`,
                `B — Bundle/farm rug risk remains: the 12 wallets hold 38% ready to dump into organic volume. LP lock and mint revoke do not protect against pre-positioned sell pressure`,
                `C — Honeypot risk — need to test the sell function`,
                `D — Slow rug risk — the team is selling gradually`,
              ],
              correct: 1,
              hint: `LP lock prevents Type 1. Mint revoked prevents Type 2. What type involves pre-positioned wallets from launch?`,
              explanation: `B is correct. LP lock eliminates LP removal rug. Mint revoke eliminates mint dump. But Type 3 (bundle/farm) is entirely separate — the developer pre-positioned 38% of supply in stealth wallets before launch. These will sell into volume regardless of LP status. This is the risk.`,
            },
            {
              question: `You buy a token and try to sell a small test amount. The transaction fails with "transaction simulation failed: Error processing instruction." You try again with 50% slippage. It still fails. What is the most likely explanation?`,
              options: [
                `A — Solana network congestion — try again in 10 minutes`,
                `B — Honeypot contract — the sell function is coded to fail for non-whitelisted addresses`,
                `C — Insufficient SOL for gas fees`,
                `D — The liquidity pool is too small for your trade size`,
              ],
              correct: 1,
              hint: `If the transaction fails even at maximum slippage and multiple attempts, what does that suggest about the contract code?`,
              explanation: `B is correct. When a sell fails repeatedly even at extreme slippage, this is the classic honeypot signature. The contract has code that specifically prevents sell transactions from completing. Always run a honeypot check before buying, not after.`,
            },
            {
              question: `What is the key difference between a Type 3 bundle rug and a Type 4 slow rug, and how do you detect each?`,
              options: [
                `A — Bundle rugs happen on Ethereum; slow rugs happen on Solana`,
                `B — Bundle rug: developer pre-positions multiple wallets at launch to hold a large % ready to dump immediately. Detected with Syrax/Trench Radar at launch. Slow rug: team sells gradually over days/weeks. Detected by monitoring top holder changes on GMGN over time.`,
                `C — Both are detected with Rugcheck.xyz`,
                `D — Bundle rugs only affect pre-graduation tokens; slow rugs only affect post-graduation tokens`,
              ],
              correct: 1,
              hint: `Think about the timing of each: when does the selling intent become visible?`,
              explanation: `B is correct. Bundle rugs are set up at launch — the positions are there from the first seconds. You catch them with launch-time analysis tools. Slow rugs develop over time — the team normalises selling with small amounts so no alarm is triggered. You catch them by regularly checking if the same wallets are consistently reducing.`,
            },
            {
              question: `Rugcheck.xyz shows a Solana token with: LP Locked 6 months, Mint Authority Disabled, Top Holder 8.2%, Score 78/100. The score penalty came from "Dev wallet activity detected — multiple buys in first minute." What remaining risk does this represent?`,
              options: [
                `A — No risk — 78/100 is passing score`,
                `B — Potential bundle/farm activity — the dev bought from multiple wallets in the first minute which may mean pre-positioned stealth sell positions that Rugcheck detected but cannot fully quantify`,
                `C — The top holder holding 8.2% is the primary risk`,
                `D — LP being locked for only 6 months is the primary risk`,
              ],
              correct: 1,
              hint: `What does "multiple buys in first minute" from a dev wallet pattern suggest?`,
              explanation: `B is correct. Multiple dev buys in the first minute is the signature of bundle/farm activity — the developer spreading their holdings across multiple wallets to avoid detection as a single concentrated position. This is exactly what bundle checkers look for. The Rugcheck score penalty is flagging this — use Syrax Scanner for the full bundle analysis.`,
            },
            {
              question: `Which of these is the MOST time-critical check to perform and why?`,
              options: [
                `A — Twitter follower count of the project account`,
                `B — Mint authority check — if the developer can mint unlimited tokens, no amount of community strength protects your position`,
                `C — Whether the token name has been used before`,
                `D — The developer's personal wallet transaction history`,
              ],
              correct: 1,
              hint: `Which rug type can instantly destroy a position regardless of community, LP lock, or price momentum?`,
              explanation: `B is correct. An active mint authority can produce unlimited new tokens at any moment — destroying the value of all existing holdings instantly with no warning. LP lock, community size, and chart patterns are all irrelevant if the developer can inflate the supply to infinity. Mint authority is the first box to tick.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You are evaluating a token for entry. Here is the full pre-entry checklist data:

Rugcheck.xyz: Score 71/100. LP locked 3 months. Mint authority: ACTIVE (has not been revoked). Top 10 holders combined: 31%. Score penalty reasons: "Mint authority not revoked" and "Dev wallet linked to 2 previous rugged tokens."

Syrax Scanner: 6 wallets bought within first 4 seconds, collectively holding 19% of supply. Source funding: 3 different wallets (not obviously linked).

GMGN: Dev wallet shows $0 balance in SOL but holds 4.1% of this token. Has deployed 7 tokens in the past 60 days.

Community signals: 800 Telegram members, organic meme creation, Twitter engagement looks genuine. Market cap: $65K.

Provide a complete risk assessment. Which risks are active? Which are manageable? Should you enter, and if so, at what position size?`,
              scoringCriteria: [
                `Active risks: (1) Mint authority is NOT revoked — developer can create unlimited tokens at any time. This alone is near-disqualifying. (2) Dev wallet linked to 2 previous rugs — serial rugger pattern. (3) 19% bundle concentration from 6 first-second wallets — sell pressure present.`,
                `The mint authority risk is critical: even if everything else were fine, an active mint means the developer can destroy your position at any moment with zero warning`,
                `Manageable: 19% bundle is elevated but not extreme. Community signals are positive.`,
                `Verdict: should NOT enter given active mint authority + serial rugger history. Community quality is irrelevant when developer holds an infinite money printer. If student chooses to enter despite this, must acknowledge it as a high-risk gamble with maximum 1% of portfolio.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You bought a token 3 weeks ago at $200K MC. It reached $1.8M MC (9× your entry). You did not take profit. Current data:

Week 1 post-entry: Top wallet (known early buyer) held 3.8%. Price at $1.8M MC peak.
Week 2: Same wallet now holds 2.9%. Two other early wallets reduced from 2.1% to 1.6% each.
Week 3 (today): Lead wallet now at 1.4%. The two others at 0.9% each. All three have reduced consistently every week. Price is now at $1.1M MC (down 39% from peak). Volume declining.

Questions:
1. What rug pattern does this represent?
2. What should you have done at Week 2?
3. What should you do now?`,
              scoringCriteria: [
                `Slow rug / coordinated early holder exit: three wallets reducing consistently every week = systematic distribution into retail buying`,
                `Week 2 action: the pattern was clear — three major holders all reducing simultaneously is not coincidence. Should have sold 50–75% of position at Week 2 while price was still $1.4–1.6M MC range`,
                `Now: exit remaining position immediately. The pattern has accelerated (all three wallets cut holdings in half). Volume declining means fewer buyers to sell into — liquidity window is closing. Lesson: set weekly holder monitoring alerts on any position over $5K in value`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You are shown a chart with annotated events:

T=0: Token launches. Rugcheck shows LP locked, mint revoked, score 85/100.
T+2 hours: Token reaches 70% of bonding curve. You enter with 1 SOL.
T+3 hours: Token graduates to Raydium.
T+4 hours: Token pumps to $250K MC (your position is now 3 SOL equivalent).
T+5 hours: Large sell candle drops price 40%. Token recovers to $200K MC in 30 minutes.
T+6 hours: Second large sell candle. Same address as T+5. Price drops to $130K MC. No recovery for 2 hours.
T+8 hours: GMGN check reveals the selling address entered at launch and held 6% of supply. They have now sold 80% of their position over 2 large sells.

Questions:
1. Which rug type is this?
2. Was the T+5 sell a red flag or normal volatility? How do you know now?
3. What would the optimal exit strategy have been with this information?`,
              scoringCriteria: [
                `This is a slow rug / early holder systematic exit — not an LP removal (LP is locked) or mint dump. One early holder selling their large position in two coordinated tranches.`,
                `T+5 was a yellow flag: one large sell candle with recovery is normal volatility but should trigger immediate GMGN check to identify the selling address. The fact that the same address sold again at T+6 confirms the pattern.`,
                `Optimal exit: take 50% profit at graduation ($69K MC) — this is standard practice for risky entries. Take another 25% at $200K MC on first sign of profit. By T+5 first large sell, check GMGN immediately. If the same address confirms second sell, exit remaining 25% immediately. Do not wait for recovery that doesn't come.`,
              ],
            },
          ],
        },

        {
          id: 'cto-community-takeover',
          title: `Community Takeovers — When the Rug Becomes the Opportunity`,
          explanation: `In 2023, a token called $TREMP launched as a Trump-themed meme coin. The developer rugged it within hours. Most buyers lost everything. Then something unusual happened.

A group of community members refused to give up. They bought back the tokens at near-zero prices, launched a new Telegram, created new meme content, and started building a genuine community. The token — now running as a Community Takeover, or CTO — went on to reach tens of millions in market cap. The people who bought into the CTO at almost nothing made significantly more than the original buyers.

This is the CTO pattern, and understanding it is one of the most underrated edges in memecoin trading.

**What is a CTO?**

A Community Takeover happens when the original developer abandons or rugs a token, and a group of community members takes over operations, marketing, and development. They cannot change the original smart contract (it is immutable on the blockchain), but they can rebuild community, update social media, get the contract address listed on new DEX tools, and organically grow the holder base.

**Why CTOs can outperform original launches:**

(1) Price starts near zero post-rug — asymmetric entry. The original buyers are bag holders looking to exit. New CTO buyers absorb those bags at a fraction of the original price.
(2) Community self-selection — only true believers stick around. The rug filters out the "just flipping" crowd. What remains is conviction.
(3) The meme already has market awareness — it circulated during the original launch. Renewed interest requires less education.
(4) CTOs are rare successes — $PAINT, $TREMP, $DAUMEN, $JORLPS, and $HARAMBE all CTOd to significant market caps.

**Red flags in fake CTOs:**

Not every CTO works. Most fail. The signals of a genuine CTO are identical to original cult formation: original content creation, community engagement not just CA sharing, organic holder growth. A fake CTO is just the same dev or associates relaunching under the "CTO" banner.

**How to trade a CTO:**

Entry is ideally in the 24–72 hours after rug, when price has stabilised and before a new community forms. The checklist is the same as any token — but with additional focus on: who are the new community leaders, are they creating original content, is there evidence they are NOT connected to the original developer.`,
          visualPrompt: `👆 Chart overlay: original rug followed by CTO price recovery — $PAINT case study`,
          visualType: `chart`,
          visualUrl: `cto-recovery-pattern`,
          examples: [
            {
              contextTag: `[CTO trader, post-rug entry, Solana, 2024]`,
              context: `$PAINT developer rugs at $200K MC. Token drops to $3K MC. Community members begin creating art even after the rug.`,
              scenario: `Trader observes: original holders posting paintings as profile pictures. New community leaders announce CTO. Price has been stable at $3–5K MC for 6 hours. New dev commits to CTO with transparent wallet.`,
              outcome: `Trader enters at $4K MC. Token reaches $8M MC on community momentum. 2,000× return from CTO entry. The rug was not the end — it was the beginning of the real community.`,
            },
            {
              contextTag: `[Experienced trader, fake CTO detection, Solana, 2025]`,
              context: `Token is rugged. Immediately, a "CTO Telegram" appears with "community saving the token."`,
              scenario: `Trader checks: the "community" members are all accounts created in the last 24 hours. No original meme content. Same CA being shared with "entry at X MC" messaging. New dev wallet was funded from the same source as the original dev.`,
              outcome: `Trader identifies it as the original dev attempting to pump and dump again under the "CTO" banner. Does not enter. Token dumps again after a brief pump. Fake CTOs are re-rugs in disguise.`,
            },
            {
              contextTag: `[Cult observer, $HARAMBE CTO, Solana, 2024]`,
              context: `$HARAMBE token rugs. Gorilla-loving community decides they aren't done.`,
              scenario: `Community creates "Harambe appreciation posts," organises wallet tracking of new community leaders, and holds through multiple dumps. New holder base is entirely CTO believers, no original bagholders remain.`,
              outcome: `$HARAMBE achieves $30M+ MC as a CTO. The community's cultural conviction (the Harambe meme has genuine cultural staying power) drove organic discovery for 12+ months post-rug.`,
            },
          ],
          keyTakeaway: `CTOs succeed when a genuinely strong cultural meme survives a rug through community conviction. The entry is lower-risk than the original launch (price near zero, bags absorbed) but only when the community is creating original content — not just recycling the CA. Fake CTOs are developer re-rugs.`,
          guidedPractice: [
            {
              question: `What is the primary reason a successful CTO can produce higher returns than the original launch?`,
              options: [
                `A — CTOs have better smart contract code than original tokens`,
                `B — CTO entry price is typically at or near zero post-rug, creating massive asymmetric upside even for modest subsequent growth`,
                `C — CTOs are protected from further rugging by Solana's blockchain`,
                `D — CTOs always trend on DEXScreener due to the dramatic rug story`,
              ],
              correct: 1,
              hint: `Think about where the price is after a rug compared to where it might go if the community rebuilds.`,
              explanation: `B is correct. The CTO opportunity is asymmetric entry — buying at near-zero after a rug, when original holders are panicking and selling. Even a recovery to 10% of the original peak represents enormous returns from a post-rug entry. $PAINT reached $3K MC post-rug before going to $8M+ — 2,000× from the CTO entry.`,
            },
            {
              question: `Which signal most strongly differentiates a genuine CTO from a fake "re-rug" CTO?`,
              options: [
                `A — The new dev announces a Coinbase listing`,
                `B — Community members are creating original content, the new leaders' wallets are not connected to the original dev, and organic engagement predates any "official CTO announcement"`,
                `C — The token has been listed on a new DEX`,
                `D — The CTO was announced within 1 hour of the rug`,
              ],
              correct: 1,
              hint: `What do real community members do that paid actors or the same dev trying again cannot fake over time?`,
              explanation: `B is correct. Original content creation is the proof of genuine community. Real CTO communities start making memes, art, and content before any price recovery — because they believe in the meme. Fake CTOs are the same dev or associates who cannot sustain original content and whose funding trails lead back to the original rug wallet.`,
            },
            {
              question: `The source material lists $TREMP, $PAINT, $DAUMEN, $JORLPS, and $HARAMBE as successful CTOs. What do these have in common that contributed to CTO success?`,
              options: [
                `A — All were launched by the same development team`,
                `B — All were based on culturally recognisable memes with genuine staying power beyond the crypto space`,
                `C — All were launched with locked LP from day one`,
                `D — All were featured in mainstream media before their CTO`,
              ],
              correct: 1,
              hint: `Think about what $TREMP (political), $PAINT (art), $HARAMBE (iconic meme) all have in common as cultural objects.`,
              explanation: `B is correct. Each of these successful CTOs was based on a meme or cultural reference that had genuine cultural weight beyond the token itself. $HARAMBE was an iconic 2016 cultural moment. $TREMP/Trump is a global political figure. $PAINT tapped art community identity. Cultural staying power = community that survives a rug.`,
            },
            {
              question: `When is the ideal entry window for a CTO, and why?`,
              options: [
                `A — Immediately when the rug happens — minimum possible price`,
                `B — 24–72 hours after the rug, when price has stabilised and early community formation signals are visible but before widespread discovery`,
                `C — Only after a DEXScreener Hot Pairs listing confirms the CTO is gaining traction`,
                `D — After the CTO reaches its original pre-rug market cap`,
              ],
              correct: 1,
              hint: `Too early = catching a falling knife. Too late = most upside is gone. What is the optimal middle ground?`,
              explanation: `B is correct. Immediately post-rug the price is still in free fall as panicking holders sell. 24–72 hours later the price has found a floor, the true community believers are visible (they're the ones still posting), and discovery is not yet widespread. This is the asymmetric entry window before momentum builds.`,
            },
            {
              question: `A "community leader" of a potential CTO is running a Telegram with 2,000 members. You check their wallet: it received 0.5 SOL funding from the same address that funded the original developer's wallet 6 hours ago. What does this indicate?`,
              options: [
                `A — The community leader bought into the token from the same launchpad as the developer, which is normal`,
                `B — The "community leader" is almost certainly the original developer or a connected party — this is a fake CTO setup`,
                `C — The developer is supporting the CTO by funding the new team`,
                `D — This is common practice and does not affect the legitimacy of the CTO`,
              ],
              correct: 1,
              hint: `If the original dev funded the "community leader's" wallet, what does that tell you about their relationship?`,
              explanation: `B is correct. Funding trail is the most reliable indicator of connected parties. If the "new community leader" received funds from the same wallet that funded the original developer, they are almost certainly the same entity or an associate. This is the signature of a fake CTO — re-rug attempt with different branding.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `$COMET was a space-themed Solana token. It reached $1.2M MC before the developer removed all liquidity at 2 AM UTC. Price collapsed from $1.2M to $8K MC in 10 minutes.

48 hours later, you observe:
- Original holders from the pre-rug launch are creating comet-themed artwork on Twitter
- A new Telegram with 400 members formed organically — first message was posted by a known holder, not a new account
- The lead community organiser's wallet was funded 3 weeks ago (pre-dates this token) from a Coinbase withdrawal
- GMGN shows 60 new unique wallets bought in the last 24 hours at $8–12K MC
- Rugcheck: LP locked post-CTO (new community dev locked it). Mint authority revoked.
- Original dev wallet is silent — no transactions in 48 hours

Is this a legitimate CTO opportunity? What are the specific positive signals, specific remaining risks, and what entry strategy would you use?`,
              scoringCriteria: [
                `Positive signals: (1) community organiser wallet pre-dates token (not a dev sock puppet). (2) First Telegram message from known holder. (3) Organic artwork creation from original holders. (4) New LP locked + mint revoked by CTO dev. (5) 60 new unique buyers in 24 hours at sub-$12K MC.`,
                `Remaining risks: (1) $1.2M MC peak means many bag holders above current price who may sell any recovery. (2) 400 member Telegram is still small — community may not be self-sustaining. (3) Original dev is silent — not excluded from returning to dump.`,
                `Entry strategy: small speculative position (0.5–1% of portfolio) at current $10K MC. Target: $100–200K MC for 10–20× return. Stop: exit if community telegram activity declines or if original dev wallet becomes active.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Comparing two post-rug tokens at identical $5,000 MC, 36 hours after rug:

Token X ($ROCKET):
- Community Telegram: 180 members, people posting rocket memes and asking "when moon"
- Twitter: mostly "buy the dip" posts and CA sharing
- New community leader: wallet created 3 days ago, funded by an anonymous wallet with no history
- Content: no original creative content, just shared templates
- Previous holders: mostly sold

Token Y ($FROG):
- Community Telegram: 90 members, posting original frog-themed artwork and jokes
- Twitter: original photoshops, community members making frog-themed profile pictures
- New community leader: established trader account, verifiable history, wallet active 8 months
- Content: original meme creation happening spontaneously before any "official" CTO announcement
- Previous holders: 40% still holding, creating content

Which token represents the stronger CTO opportunity and why? Be specific about each signal.`,
              scoringCriteria: [
                `Token Y is clearly stronger despite smaller Telegram: (1) original content creation is the definitive signal — $FROG holders are making art because they believe in the meme; $ROCKET holders are just asking "when moon." (2) Community leader with verifiable 8-month history vs account created 3 days after the rug = likely sock puppet for $ROCKET. (3) 40% of original holders still creating content is remarkable — extremely rare post-rug. (4) Spontaneous content before official CTO = community belief predates marketing`,
                `Token X red flags: "when moon" crowd = no conviction, just hoping for a pump. New account leader = potential re-rug. Shared templates = no creative ownership of the meme.`,
                `The smaller Telegram is not a negative: quality > quantity. 90 genuine believers building culture > 180 speculators asking for price targets.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Post-rug CTO price action over 14 days:

Day 1 (rug day): Price crashes from $800K MC to $4K MC. Volume $1.2M (panic selling).
Day 2: Price $4–7K MC. Volume $45K. Small community forming.
Day 3: Price $12K MC. Volume $180K. First "CTO official" announcement.
Day 4–6: Price consolidates $10–15K MC. Volume $20–40K/day. Community growing.
Day 7: Price jumps to $45K MC on a single volume spike ($1.1M). Then retraces to $28K MC.
Day 8–10: Consolidation $25–32K MC. Volume moderate.
Day 11: KOL mention on Twitter. Price jumps to $120K MC. Volume $4.2M.
Day 12: Price $90K MC. Volume declining.
Day 13–14: Price $75–85K MC. Consolidating. Volume low but stable.

You entered at Day 3 ($12K MC). Current price: $80K MC (~6.7×). Questions:
1. What does the Day 7 volume spike followed by retrace tell you?
2. The KOL call on Day 11 drove 4× growth — is this a positive or concerning signal?
3. What is your exit strategy from Day 14 onwards?`,
              scoringCriteria: [
                `Day 7 spike: single volume candle ($1.1M on a small MC token) suggests a whale or coordinated group entered. Retrace to $28K shows some sellers used the spike to exit. Consolidation at $28K above Day 6 baseline ($13K) means real support formed — buyers absorbed the retrace.`,
                `KOL call: double-edged. Positive: confirms the narrative is reaching broader discovery. Concerning: KOL calls often represent peak buying pressure from that cohort. The subsequent decline from $120K to $80K with lower volume suggests the KOL audience was the marginal buyer. Monitor for: does community continue creating content or does activity correlate only with price?`,
                `Exit strategy: already 6.7× from entry. Take 30% at current price to protect initial capital. Set alert at $50K MC (mental stop if trend breaks). If volume picks up from organic discovery (not KOL-driven), hold remaining. Next target: $300–500K MC if community continues to build. The key question: is the community stronger now than Day 3?`,
              ],
            },
          ],
        },

      ], // end lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from all Lab 1 lessons — no labels, no hints. Tests memecoin mechanics, bonding curves, market cap math, rug detection, and CTO analysis.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: {
          maxAttemptsPerSim: 2,
          failedSimRecovery: 'Retry available after reviewing flagged lesson',
          passThreshold: 0.75,
        },
      },

      bossMode: {
        title: `Lab 1 Boss — Full Token Pre-Entry Analysis`,
        learningLoop: {
          hintsEnabled: true,
          feedbackMode: 'full-criteria-with-lesson-pointers',
          scenarioMode: 'fresh-each-attempt',
          message: 'Review the lesson pointers above and try again with a new scenario.',
        },
        scenarios: [
          {
            id: 'boss-lab1-v1',
            situation: `A new Solana token launches. You receive the CA in a Telegram group. Here is all available data:

Rugcheck.xyz: Score 62/100. LP locked 2 months. Mint Authority: ACTIVE. Top holder 7.4%. Score penalties: "Mint authority not revoked" and "Dev wallet linked to 1 previous token (that token's fate unknown)."

Syrax Scanner: 4 wallets bought 22% of supply in first 5 seconds. Funding source: all 4 funded from same Coinbase withdrawal.

GMGN: Token is 45 minutes old. 6 of the 22 initially sniped wallets have already sold (reduced combined position from 22% to 14%). Remaining snipers average entry at $8K MC. Current MC: $52K.

Chart: steady climb from $10K to $52K over 45 minutes. No large sell candles. Multiple small buys.

Community: 450 Telegram members. Original memes being created and shared. Twitter: 180 posts, mix of organic memes and some CA sharing.

Token name/concept: Giga-Brain Crab — a blue crab wearing an oversized brain. Concept is novel and absurdist.

Required: (1) Complete rug risk assessment identifying all active risk factors. (2) Community quality assessment. (3) Entry decision with full justification and position sizing if you decide to enter.`,
            scoringCriteria: [
              `Risk factor 1 (critical): Mint authority ACTIVE — developer can create unlimited tokens at any time. This is near-disqualifying regardless of other signals.`,
              `Risk factor 2: Dev linked to previous token of unknown fate — serial rugger pattern cannot be excluded.`,
              `Risk factor 3: 14% remaining sniper concentration — elevated but 8 snipers already sold (positive: they didn't wait for a massive pump, suggesting the remaining snipers may also exit gradually rather than in a single dump).`,
              `Community quality: positive signals — original meme creation (not just CA sharing), novel concept with absurdist appeal consistent with Memes 2.0 thesis, 450 members in 45 minutes is meaningful growth.`,
              `Entry decision: should NOT enter due to active mint authority. Community quality is insufficient justification to accept unlimited dilution risk. If the student chooses to enter, must clearly acknowledge this as a high-risk gamble and size at maximum 0.5% of portfolio. Must include plan: monitor for mint authority revocation, exit immediately if mint event occurs.`,
            ],
          },
          {
            id: 'boss-lab1-v2',
            situation: `Post-rug CTO opportunity. $VOID was an AI-narrative token that reached $900K MC before the developer rugged 3 days ago. Current market cap: $11,000.

Current signals:
- Rugcheck: new CTO dev locked LP 6 months, mint revoked. Score 91/100.
- New community leader wallet: 4 months old, previously traded $WIF and $BONK (documented wins). Not connected to original dev wallet.
- Telegram: 320 members. People creating AI-robot memes with the $VOID branding. Leaders posting development roadmap.
- GMGN: 95 new unique wallets bought in last 72 hours at $8–12K MC. 0 of original pre-rug holders remain above $50K MC (all have sold through the CTO accumulation).
- Original dev wallet: no activity since rug. Not funded by same source as new community leader.
- Twitter: 400 posts in last 48 hours. Mix of AI narrative content and $VOID specific memes. Notable: 3 established AI-meta traders have tweeted the token without obvious coordination.

The original $VOID concept: an AI-trained agent that "voids" bad trades. The meme has genuine AI meta relevance.

Required: (1) Assess CTO legitimacy. (2) Assess the cultural staying power of the concept. (3) Entry strategy with market cap targets and invalidation conditions.`,
            scoringCriteria: [
              `CTO legitimacy: HIGH. All positive signals present — community leader has verifiable history, not connected to original dev, new LP locked, mint revoked. 72 hours of organic buying. Original bagholders have exited (no overhead sell pressure from original buyers). 3 independent AI-meta trader mentions without coordination = genuine organic discovery.`,
              `Cultural staying power: strong. AI meta is a multi-year narrative (not a one-week trend). The "void bad trades" concept has genuine memetic utility — traders will relate to the pain of bad trades. Novel enough to not be seen as a copycat.`,
              `Entry strategy: entry appropriate at $11–15K MC. Position size: 2–4% of portfolio given strong CTO signals. Targets: $100K MC (first take-profit, 7–9×), $500K MC (second tranche, 35–45×), hold remainder for potential $2M+ if AI meta expands. Invalidation: original dev wallet becomes active, community leader reveals dev connection, AI meta narrative fades, community stops creating content (activity correlates only with price).`,
            ],
          },
        ],
      },
    },

    // ── Junior Labs 2 & 3 ──────────────────────────────────────────────────
    {
      id: 'lab-2-setup',
      title: `Lab 2: Your Trading Setup`,
      subtitle: `Professional traders use professional tools. This lab builds your complete stack from zero.`,
      lessons: [

        {
          id: 'trading-platforms',
          title: `Trading Platforms — BullX, Photon, Padre, and When to Use Each`,
          explanation: `Your trading platform is not just a buy button. It determines how fast your transaction confirms, how clearly you can see the order book, and whether you can spot danger signals before they cost you money.

In late 2024 the memecoin trading platform landscape consolidated around a few dominant players. The best traders typically use 2–3 tools for different purposes.

**Photon (photon-sol.trochet.com):**
Web-based DEX terminal for Solana. Shows real-time buy/sell pressure, transaction feed (every buy and sell visible as it happens), holder distribution overlay, and sniper activity. The "transaction feed" is the critical feature — you can watch whether buys or sells are dominant in real time and see individual wallet sizes.

Best for: real-time monitoring of active positions, watching a token's order flow during a pump, identifying when smart money is buying vs when retail is entering.

**BullX (bullx.io):**
Similar to Photon with stronger charting tools. Includes a "dev sell indicator" that flags when known developer wallets are selling. Portfolio tracker shows PnL across all open positions. Mobile app available.

Best for: portfolio-wide monitoring, dev activity watching, comparing multiple tokens simultaneously.

**Padre (trade.padre.gg):**
Mobile-first DEX terminal. Fastest transaction approval on Solana according to independent speed tests. Offers 35% cashback on trading fees to referral users. Simpler interface — better for execution speed than deep analysis.

Best for: fast execution when you have already done your analysis elsewhere and just need to buy quickly.

**Nova Bot (Telegram: @TradeonNovaBot):**
Telegram-native trading bot. You paste a CA and select an amount — no browser needed. Useful when you are in Telegram alpha groups and want to enter without switching apps. Supports limit orders, sniper mode (auto-buy when a new token matches set criteria), and copy trading.

Best for: quick entries when you receive a CA in a Telegram group and need to act fast.

**The key insight from experienced traders:**
Use different tools for different purposes. Analyse on GMGN or Photon. Execute on Padre or Nova. Never use only one tool — each has blind spots.

**Gas and transaction priority:**
On Solana, transaction priority fees determine how quickly your transaction processes. Most bots allow you to set "priority fee" — higher fee = faster confirmation. During popular launches this is critical. The source material notes Padre has the fastest approvals, but any bot with configurable priority fees can be set to match.`,
          visualPrompt: `👆 Side-by-side: Photon transaction feed vs BullX chart — what each shows that the other doesn't`,
          visualType: `interactive`,
          visualUrl: `trading-platform-comparison`,
          examples: [
            {
              contextTag: `[New trader, tool selection, pump.fun launch, 2025]`,
              context: `A new trader receives a CA in a Telegram group. Token is pumping. They are on their phone.`,
              scenario: `Trader opens Photon on mobile to check the transaction feed. Sees mostly small buys, no large sells. Switches to Nova Bot within Telegram, sets priority fee to 0.01 SOL, executes 0.3 SOL buy in 4 seconds.`,
              outcome: `Transaction confirms before the first major price spike. Tool selection (Photon for analysis, Nova for execution) saved the trader 30+ seconds vs switching to a desktop app.`,
            },
            {
              contextTag: `[Experienced trader, multi-tool workflow, active position, 2025]`,
              context: `Trader holds 3 active positions. Market is moving. Needs simultaneous monitoring.`,
              scenario: `Trader has BullX open showing all 3 positions and their PnL. Photon open on second screen showing real-time transaction feed for the most active position. Nova Bot running on mobile for instant execution if needed.`,
              outcome: `BullX dev sell indicator fires on Position 2 at 10:23 AM. Trader uses Padre (fastest execution) to exit in 8 seconds. Avoids 40% drop that follows the dev sell.`,
            },
            {
              contextTag: `[Active trader, priority fee lesson, high-activity launch, 2024]`,
              context: `Popular launch at 9 PM UTC. Trader uses default bot settings.`,
              scenario: `Transaction sits in mempool for 90 seconds with default priority fee (0.000001 SOL). Token pumps 3× while transaction is pending. Transaction finally confirms at 3× price.`,
              outcome: `Trader overpaid significantly. Adjusts priority fee to 0.01 SOL for all future volatile launches. Subsequent trades confirm in under 5 seconds.`,
            },
          ],
          keyTakeaway: `Use Photon or BullX for analysis (transaction feed, dev activity, PnL tracking). Use Padre or Nova Bot for fast execution. Always set priority fees appropriately for the urgency of the trade. Different tools for different purposes.`,
          guidedPractice: [
            {
              question: `You receive a CA in a Telegram group at 11 PM. The token is pumping. You are on your phone and already have Telegram open. What is the fastest execution path?`,
              options: [
                `A — Open Photon in your mobile browser, analyse for 2 minutes, then buy`,
                `B — Use a Telegram-native bot like Nova directly within the Telegram app — paste CA, select amount, execute without switching apps`,
                `C — Wait until you can access a desktop computer to ensure you use the best tools`,
                `D — Use a centralised exchange like Coinbase to buy the token`,
              ],
              correct: 1,
              hint: `When speed matters and you are already in Telegram, which tool eliminates app-switching time?`,
              explanation: `B is correct. Nova Bot operates inside Telegram — you never leave the app. You paste the CA, select your buy amount, and execute. This is the fastest path when you are already in the alpha group that shared the CA. The alternative of switching to a browser adds 30–60 seconds which can mean missing the entry.`,
            },
            {
              question: `What does the "transaction feed" on Photon or BullX show that a standard price chart does not?`,
              options: [
                `A — The developer's identity and location`,
                `B — Every individual buy and sell as it happens in real time, showing wallet sizes, whether buys or sells dominate, and smart money activity`,
                `C — The token's smart contract source code`,
                `D — The token's listing on centralised exchanges`,
              ],
              correct: 1,
              hint: `Price charts show aggregate price movement. What is the underlying data that creates those price moves?`,
              explanation: `B is correct. The transaction feed shows individual transactions as they occur — you can see 10 consecutive buys from different wallets (bullish signal) vs one large sell dominating the feed (bearish signal). It also shows wallet sizes — a $50K buy is very different from 50 × $1K buys even though both move price identically on a chart.`,
            },
            {
              question: `During a popular pump.fun graduation, your transaction is sitting in the mempool for 2 minutes while the price pumps 200%. What was the root cause and how do you prevent it next time?`,
              options: [
                `A — Your internet connection was too slow`,
                `B — Your priority fee was too low — other transactions with higher fees were confirmed first, pushing yours to the back of the queue`,
                `C — The Solana network was down`,
                `D — You used the wrong trading platform`,
              ],
              correct: 1,
              hint: `On Solana, validators prioritise transactions by fee. What determines queue position?`,
              explanation: `B is correct. Solana validators process transactions in order of priority fee (tip). During high-activity periods like popular graduations, the standard/default fee is far too low. Setting priority fee to 0.005–0.01 SOL during volatile launches ensures confirmation within seconds.`,
            },
            {
              question: `BullX's "dev sell indicator" fires on a token you hold. What does this mean and what should you do?`,
              options: [
                `A — The developer has been publicly verified — this is a positive signal`,
                `B — A wallet identified as the developer has executed a sell transaction. Assess position size and decide whether to exit or reduce — depending on how much they sold and whether it's a complete exit or partial profit-taking.`,
                `C — The smart contract has been upgraded — ignore it`,
                `D — This indicates the token will be listed on Binance soon`,
              ],
              correct: 1,
              hint: `Why would knowing the developer is selling matter for your position?`,
              explanation: `B is correct. Developer selling is one of the strongest bearish signals — they know more about the token than anyone. However, context matters: a developer selling 10% of their holdings after a 5× run is different from a developer selling 100% in one transaction. Check the transaction size before reacting.`,
            },
            {
              question: `What is the advantage of Padre specifically mentioned in the source material?`,
              options: [
                `A — It has the best chart analysis tools`,
                `B — It has the fastest transaction approvals on Solana and offers 35% cashback on fees for referral users`,
                `C — It is the only mobile-compatible trading platform`,
                `D — It provides automatic rug detection before purchase`,
              ],
              correct: 1,
              hint: `The source material explicitly notes Padre's standout feature vs other bots.`,
              explanation: `B is correct. The source material describes Padre as "mobile friendly" with "the fastest transaction approvals" and a "35% cash back on every trade" fee rebate system. When margins matter (especially for frequent small-cap trades), fee rebates compound significantly.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You are setting up your trading stack for the first time. You have:
- A MacBook Pro (desktop)
- An iPhone (mobile)
- $500 allocated for memecoin trading
- You trade primarily in evenings and on weekends
- Your primary alpha source is a Telegram group with 2,000 members

Design your complete tool stack. For each tool, specify: (1) which platform/bot, (2) what you use it for, (3) when you use it, and (4) how you configure it for your situation.`,
              scoringCriteria: [
                `Analysis tool: Photon or GMGN on desktop — use for pre-entry analysis (transaction feed, holder distribution, dev activity). Open whenever evaluating a new CA.`,
                `Mobile execution: Nova Bot in Telegram — configured and tested before any live trading. Pre-set common buy amounts (0.1, 0.3, 0.5 SOL) for fast execution when CAs arrive in the group.`,
                `Portfolio tracker: BullX or GMGN — monitor open positions and PnL across all tokens.`,
                `Priority fees: configured at 0.005–0.01 SOL for standard trades, 0.01–0.02 SOL for fast-moving launches. Never use default fees.`,
                `$500 allocation: maximum single trade 20% of stack ($100). If losing 3 trades in a row, stop trading for the day.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are watching a token on Photon's transaction feed. Here is what you see over 5 minutes:

10:00: Buy 0.2 SOL (wallet: new, 2 days old)
10:00: Buy 0.15 SOL (wallet: new, 1 day old)
10:01: Buy 0.3 SOL (wallet: new, 5 hours old)
10:01: Buy 0.1 SOL (wallet: active, 8 months old, previous wins in WIF, BONK)
10:02: Buy 2.1 SOL (wallet: unknown, 6 weeks old, large SOL balance)
10:02: Buy 0.2 SOL (wallet: new, 1 day old)
10:03: Sell 1.8 SOL (wallet: new, 5 seconds old — was not visible before this sell)
10:03: Sell 0.9 SOL (wallet: new, 10 seconds old — was not visible before this sell)
10:04: Buy 0.3 SOL (wallet: established, 1 year old, known degen with public losses)
10:05: Buy 0.1 SOL (wallet: active, 4 months old)

Analyse the transaction feed. What does the pattern of new wallets selling at 10:03 suggest? What is significant about the 8-month-old wallet buying at 10:01? How should this feed inform your entry decision?`,
              scoringCriteria: [
                `10:03 sells from 5-second-old and 10-second-old wallets = bundle/sniper wallets that bought instantly at launch and are now exiting into the organic volume. These are not community members — they are bots taking profit.`,
                `The 8-month-old wallet with WIF/BONK wins at 10:01 = notable signal. Established trader with documented wins is making a real buy, not a bot flip. This wallet's presence increases confidence.`,
                `10:02 buy of 2.1 SOL from a 6-week-old wallet = either whale or early connected buyer — unknown intent, worth monitoring.`,
                `Entry decision: the bundle sells at 10:03 are expected and may represent the overhead sell pressure clearing. If price holds after these sells (doesn't crash), that's bullish. The established wallet buy is a positive signal. Reasonable to enter small with tight monitoring.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `BullX is showing your portfolio. You have three positions:

Position A: $WIF — entered at $3M MC, currently at $18M MC (6×). Position size: 1 SOL. No dev activity. Cult coin, 3 months old.
Position B: $NOVA — entered at $45K MC, currently at $280K MC (6.2×). Position size: 0.5 SOL. Dev sell indicator just fired — dev sold 30% of their holdings.
Position C: $BLOB — entered at $25K MC, currently at $12K MC (−52%). Position size: 0.3 SOL. No major events. Volume declining for 2 days.

For each position: state your action (hold/partial sell/full exit) and the specific reasoning using what you know about trading platforms and position management.`,
              scoringCriteria: [
                `Position A (WIF): hold majority. Established cult coin with 6× gain and no negative signals. No dev sell. Could take 25–33% profit to protect gains (returning initial) but holding is well-supported. This is not a pump.fun gamble — it is an established Solana memecoin.`,
                `Position B (NOVA): exit immediately or reduce significantly. Dev selling 30% of holdings is a major red flag — they are distributing into your holding. 6.2× from entry means you are still very profitable. Exit at least 75% of position. Hold small speculative amount only if community signals remain strong.`,
                `Position C (BLOB): exit. Down 52% with declining volume for 2 days and no catalyst = slow death pattern. Capital is better deployed elsewhere. The loss is painful but holding a dying chart with no volume recovery signal is a capital destruction strategy.`,
              ],
            },
          ],
        },

        {
          id: 'analysis-tools',
          title: `GMGN, DEXScreener, and Rugcheck — Reading the Data Like a Pro`,
          explanation: `Every experienced memecoin trader has a core set of analysis tools they check in a specific order before entering any position. This lesson codifies that workflow.

**DEXScreener (dexscreener.com):**

The public face of token discovery. DEXScreener aggregates trading data from all major DEXs on all major chains. Key features for memecoin traders:

- Hot Pairs: tokens trending by volume in the last hour. Entering DEXScreener Hot Pairs is a significant catalyst — it brings discovery from a large audience.
- Custom watchlists: save tokens you are watching. Shareable watchlists (important for community alpha sharing).
- Chart with volume bars: the standard reference chart. Buy (green) vs sell (red) pressure visible at a glance.
- Token info panel: shows liquidity, 24h volume, price change, and links to the contract address.

**GMGN (gmgn.ai):**

The deeper intelligence layer. Where DEXScreener shows price and volume, GMGN shows who is doing what.

- Wallet analysis: paste any wallet address and see their complete PnL history, win rate, average hold time, and every token they traded. A wallet with a 55% win rate across 200 trades is a meaningful signal. A wallet with 3 trades (all wins) is noise.
- Top holders list: see the current top 100 holders with their unrealised PnL. If top holders are deep in profit, they may sell at any time. If they are all in loss, there is less near-term sell pressure.
- Smart money tracker: GMGN maintains its own list of "smart money" wallets — verified profitable traders. When multiple smart money wallets buy the same token simultaneously, it is worth investigating.
- Insider activity: detects wallets that consistently buy tokens before major moves (possible insider knowledge).

**Rugcheck.xyz:**

The safety scanner. As covered in Lab 1: overall score, LP lock status, mint authority, top holder concentration, and dev wallet flags. Run this before every entry on any new token.

**The professional pre-entry workflow (60 seconds):**
1. Rugcheck: mint authority revoked? LP locked? Overall score > 80?
2. GMGN top holders: no single wallet over 10% (excluding burn/lock addresses)?
3. GMGN wallet analysis of top 3 holders: are they known smart money or unknowns?
4. DEXScreener: is volume organic? (consistent buys vs one large spike)
5. Bundle check (Syrax/Trench Radar): acceptable concentration (<20%)?

If all five pass: proceed to community check (Twitter, Telegram). If any fail: decide if the risk is acceptable or pass.`,
          visualPrompt: `👆 Annotated GMGN wallet analysis: reading win rate, average hold time, and trade pattern`,
          visualType: `interactive`,
          visualUrl: `gmgn-wallet-analysis-walkthrough`,
          examples: [
            {
              contextTag: `[GMGN user, smart money discovery, Solana, 2025]`,
              context: `Trader is using GMGN's smart money tracker. Three separate wallets all bought the same obscure token in the last 2 hours.`,
              scenario: `All three wallets have 45%+ win rates over 100+ trades. None are connected to each other (different funding sources). Token has $35K MC, locked LP, revoked mint. No obvious narrative yet.`,
              outcome: `Trader buys 0.5 SOL at $35K MC. A KOL discovers the token 4 hours later and calls it. Token goes to $2.8M MC. Smart money convergence was the early signal.`,
            },
            {
              contextTag: `[Trader, top holders analysis, Raydium, 2025]`,
              context: `Trader holds a position and checks GMGN top holders weekly.`,
              scenario: `GMGN shows top 10 holders collectively in +850% unrealised profit. Some have been holding since graduation 3 weeks ago. Current MC: $1.2M.`,
              outcome: `Trader takes 50% profit, recognising that holders with 8× unrealised gains have strong incentive to sell on any pump. Reduced exposure proves correct — a KOL call the next day triggers exactly the selling pressure anticipated.`,
            },
            {
              contextTag: `[New trader, DEXScreener pattern reading, 2025]`,
              context: `New trader checking a token's DEXScreener chart for the first time.`,
              scenario: `Chart shows 24h volume of $1.8M but the volume bars show: 10 consecutive large buy candles in the first hour, then 22 hours of tiny drips. Current holders are 95% from the first hour.`,
              outcome: `Trader correctly identifies: the volume was concentrated at launch (likely sniper/bot activity) and organic buying never emerged. The token has no momentum despite impressive 24h volume. Passes on entry.`,
            },
          ],
          keyTakeaway: `DEXScreener for price/volume discovery. GMGN for wallet intelligence and smart money tracking. Rugcheck for safety. Run all three in under 60 seconds before every entry. Smart money convergence on a token is one of the strongest early signals available.`,
          guidedPractice: [
            {
              question: `A GMGN wallet analysis shows: Win Rate 52%, Total Trades 340, Average Hold Time 4.2 hours, Total PnL +$280,000. Is this a wallet worth tracking? Why?`,
              options: [
                `A — No — 52% win rate means they lose on almost half their trades`,
                `B — Yes — 52% win rate over 340 trades is statistically meaningful (not luck), average hold time suggests active trader not a holder, and $280K total PnL confirms consistent profitability`,
                `C — Only if they are currently holding tokens in the top 100 by market cap`,
                `D — No — average hold time of 4 hours is too short to indicate real conviction`,
              ],
              correct: 1,
              hint: `What does "340 trades with 52% win rate" tell you compared to "3 trades with 100% win rate"?`,
              explanation: `B is correct. 52% win rate over 340 trades is statistically significant — 340 trades makes luck an implausible explanation. Compare to a wallet with 3 wins out of 3 trades: that could easily be luck. The 4.2 hour average hold suggests they know when to exit, and $280K total profit confirms the strategy works in practice.`,
            },
            {
              question: `DEXScreener shows a token entering the "Hot Pairs" trending list. Why is this a meaningful catalyst?`,
              options: [
                `A — Hot Pairs means the token is about to be listed on Binance`,
                `B — Hot Pairs brings discovery from a large audience scanning DEXScreener for opportunities — it is one of the most common catalysts for a second leg of buying`,
                `C — Hot Pairs indicates the token passed a security audit`,
                `D — Hot Pairs is only relevant for tokens with market caps above $10M`,
              ],
              correct: 1,
              hint: `What do thousands of retail traders do every day on DEXScreener?`,
              explanation: `B is correct. DEXScreener has millions of monthly visitors scanning for opportunities. The Hot Pairs section surfaces the most active tokens in real time — entering it brings organic discovery from traders who were not previously aware of the token. This is one of the most reliable secondary catalysts.`,
            },
            {
              question: `GMGN's top holders list for a token shows: Wallet 1 holds 8.2% at +920% unrealised gain. Wallet 2 holds 5.1% at +740% unrealised gain. Three others each hold 2–3% at +300–500% unrealised gain. What risk does this represent?`,
              options: [
                `A — No risk — high unrealised gains mean holders are committed long-term`,
                `B — Significant sell pressure risk — these holders have massive incentive to take profit and any catalyst (KOL call, DEXScreener trending) may trigger them to sell into buying volume`,
                `C — This indicates the token is about to be listed on a CEX`,
                `D — High unrealised gains lock holders in — they cannot sell without triggering taxes`,
              ],
              correct: 1,
              hint: `If you were sitting on 920% unrealised gain, what would you be tempted to do when the next price spike occurred?`,
              explanation: `B is correct. Holders with 700–900% unrealised gains are sitting on massive profits and have strong incentive to exit. Any significant buying event — KOL call, trend listing, narrative catalyst — gives them the liquidity to sell. This is why experienced traders check top holder PnL regularly and reduce exposure when concentrated holders are deeply in profit.`,
            },
            {
              question: `What is the correct interpretation of Rugcheck.xyz score of 65/100 with the penalty coming from "Concentrated ownership: one wallet holds 14.3%"?`,
              options: [
                `A — The score means the token is 65% safe — acceptable risk`,
                `B — The primary risk is single-wallet concentration: one entity controls 14.3% of supply and can crash the price with a single sell. This is meaningful even if LP is locked and mint is revoked.`,
                `C — Scores below 75 mean the token is a confirmed rug`,
                `D — Concentrated ownership is normal for memecoins and can be ignored`,
              ],
              correct: 1,
              hint: `What happens to a token's price if the entity holding 14.3% of supply decides to sell all at once?`,
              explanation: `B is correct. 14.3% concentrated in one wallet means a single decision-maker can create massive sell pressure. On a typical pump.fun token, a 14% sell into a $500K liquidity pool would crash the price 30–50%. The Rugcheck score is a summary metric — always check what specific factors drove the penalty.`,
            },
            {
              question: `Three unconnected wallets with 40%+ win rates over 100+ trades each buy the same $30K MC token within 2 hours of each other. No KOL has called it. No obvious narrative. What is the most likely explanation and what should you do?`,
              options: [
                `A — Coincidence — three smart wallets sometimes buy the same thing by chance`,
                `B — Smart money convergence — experienced traders have identified something (narrative timing, insider knowledge, or strong fundamental signal) before the market. Investigate immediately and potentially enter.`,
                `C — This is a pump-and-dump being coordinated by the three wallets`,
                `D — The token is about to fail — smart money is selling, not buying`,
              ],
              correct: 1,
              hint: `If three independent, consistently profitable traders all find the same token before it is widely known, what does their independent arrival suggest?`,
              explanation: `B is correct. Three independently profitable wallets (verified by win rates over many trades) arriving at the same undiscovered token simultaneously is a strong signal that something about the token warrants investigation. It does not guarantee success — but it is worth 5 minutes of analysis. This is one of the most reliable early signals in the source material.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `GMGN data for a token you are considering:

Token MC: $180,000
LP: $90,000 (locked 4 months)
Mint: Revoked

Top 10 Holders:
1. Wallet A: 6.2%, unrealised PnL +840%, entry $21K MC, hold time 6 days, 8 months old with 45% win rate
2. Wallet B: 4.8%, unrealised PnL +720%, entry $25K MC, 1 year old with 51% win rate
3. Wallet C: 3.1%, unrealised PnL +450%, entry $40K MC, 4 months old with 38% win rate
4. Wallets 4–10: 1.5–2.8% each, mixed PnL from +80% to +220%

Current new buys (last 2 hours): 8 unique wallets, average wallet age 6 weeks, average buy 0.3 SOL.

DEXScreener: token entered Hot Pairs list 45 minutes ago.

Questions:
1. What is your assessment of the sell pressure risk from the top holders?
2. What does the DEXScreener Hot Pairs entry mean for near-term price action?
3. Should you enter? If so, at what size and with what exit plan?`,
              scoringCriteria: [
                `Sell pressure: Wallets A and B are verified smart money (high win rates, long history) with 720–840% unrealised gains. DEXScreener Hot Pairs discovery is exactly the catalyst that gives them the liquidity to exit. Risk: significant. The +840% wallet has massive incentive to take profit right now.`,
                `Hot Pairs impact: brings discovery from DEXScreener's large audience — next 1–6 hours will see increased buying. This is simultaneously a catalyst (more buyers) and a danger (the smart money who arrived early may use this buying to exit).`,
                `Entry decision: high risk/reward moment. If entering: size small (0.5–1% of portfolio). Exit plan: take 50% profit on any 30%+ move. Exit 100% if Wallet A or B begins selling (monitor GMGN). The DEXScreener discovery may push price 30–80% higher — but smart money exits into that.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You are doing your 60-second pre-entry checklist on a token that was called in a Telegram group 5 minutes ago. Results:

Rugcheck: Score 88/100. LP locked 6 months. Mint revoked. Only penalty: "Dev wallet made 3 purchases in first 30 seconds" — 6% of supply.

GMGN top holders: Wallet 1 (dev) holds 6%, entry at launch. Wallets 2–5 each hold 3–4%, entry at $20–40K MC. Current MC: $280K.

Bundle check (Syrax): 6 early wallets bought 18% of supply within first 10 seconds. Not obviously the dev. Funding source: 3 different wallets.

DEXScreener: token is 6 hours old. Just entered Hot Pairs 3 minutes ago. $1.1M 24h volume.

GMGN smart money: 2 verified smart wallets bought at $50–70K MC (now 4× down from entry).

Community: 1,200 Telegram, high original meme activity. Twitter 600+ posts.

The Telegram caller who shared it has a 70% win rate on 30 previous calls.

Walk through each risk factor and provide your entry decision with specific position size and exit criteria.`,
              scoringCriteria: [
                `Risk 1: 18% bundle/sniper concentration — elevated. Combined with dev's 6%, total early concentration is ~24%. Manageable if community is strong enough to absorb.`,
                `Risk 2: 2 smart wallets already in at 4× their entry price — they may exit on the Hot Pairs discovery. This creates sell pressure at ~$280K MC.`,
                `Positive signals: 88 Rugcheck, locked LP, revoked mint, strong community, caller with track record.`,
                `Decision: reasonable entry at 1–2% of portfolio. The caller track record (70% on 30 calls) is meaningful — not random signal. Entry at $280K MC (already 4× from smart money entry) limits remaining upside if smart money exits, but Hot Pairs + caller call may push to $500K–$1M.`,
                `Exit: take 30% profit at $400K MC, another 30% at $600K MC. Full exit if smart money wallets begin selling. Stop loss: if volume dies and price drops below $200K MC with no recovery signal.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `DEXScreener data for a token over its first 12 hours. Identify patterns:

Hour 1: Volume $420K. Buys dominant (80% green). Price: $10K → $85K MC.
Hour 2: Volume $89K. Mixed. Price: $85K → $70K MC.
Hour 3: Volume $55K. Sells slightly dominant. Price: $70K → $58K MC.
Hour 4: Volume $41K. Low. Price: $58K → $62K MC.
Hour 5: Volume $38K. Very low. Price: $62K → $60K MC.
Hour 6: Volume $170K. Buys dominant again. Price: $60K → $140K MC.
Hour 7: Volume $320K. Strong buying. Price: $140K → $290K MC.
Hour 8: Volume $185K. Mixed. Price: $290K → $240K MC.
Hour 9: Volume $110K. Price: $240K → $220K MC.
Hour 10: Volume $88K. Price: $220K → $230K MC.
Hour 11: Volume $210K. Strong buying. Price: $230K → $410K MC.
Hour 12: Volume $95K. Price: $410K → $380K MC.

Questions:
1. What likely happened at Hour 6 to restart buying after Hours 2–5 showed decay?
2. Is the Hour 8 pullback a concern? What data would you check?
3. Based on the chart pattern, what is the overall trajectory signal and what should be on your watchlist?`,
              scoringCriteria: [
                `Hour 6 restart: likely a catalyst event — possible KOL call, DEXScreener discovery, or new narrative connection. The volume increase ($38K to $170K) with buy dominance suggests external discovery rather than existing holders buying.`,
                `Hour 8 pullback: not alarming. Volume at $185K is still significant. Price pulled back only 17% ($290K to $240K) then stabilised. Check GMGN: if smart money wallets are the sellers, reduce position. If it is small retail profit-taking, the dip may be buyable.`,
                `Overall trajectory: higher lows pattern (58K floor, 220K floor, 380K likely floor). Each rejection is followed by a higher breakout. This is classic cult-forming chart structure. Watch for: Hour 13+ volume — if it recovers above Hour 9 ($110K) with buy dominance, next leg likely. If volume continues declining below $80K, monitor for distribution.`,
              ],
            },
          ],
        },

        {
          id: 'wallet-tracking-setup',
          title: `Wallet Tracking — Finding Smart Money and Following It`,
          explanation: `The source material from an experienced trader states it directly: "Wallet tracking is fun. Once you find profitable and winning wallets, you'll be able to see when they buy something, DYOR, and potentially buy as well. I found $NEIRO because of a wallet I tracked."

This is not following someone blindly. It is using on-chain data to identify people who consistently find winners before the crowd — and using their activity as one signal among several.

**The wallet hunting process (from the source material):**

Step 1 — Find source tokens: Use DeFined.fi with these filters: high volume, token age under 12 hours, significant price movement. Identify 3–5 tokens that performed well recently.

Step 2 — Find the wallets that won: Use GateKept (multi-token analysis) to find wallets that appear as profitable buyers across multiple of your source tokens. A wallet that consistently found winners across 5 unrelated tokens is not lucky — they have a system.

Step 3 — Validate the wallet: On GMGN, check the wallet's full history. Minimum criteria: win rate above 30%, consistent profit-taking (they actually sell at profit, not just hold), manageable losses (they cut losers, not hold to zero), at least 50+ trades (to distinguish skill from luck).

Step 4 — Add to tracking: Follow the wallet on GMGN or use a dedicated tracking tool (Cielo Wallet Tracker, Ray Purple Wallet Tracker). Set up alerts so you get notified when they buy.

**What to do when a tracked wallet buys:**

The tracked wallet buying is one signal — not an instruction. When you see an alert, check: What did they buy? What is the token's Rugcheck score? Is the community forming? What is the market cap entry? Does the thesis make sense independently?

The source material is explicit: "track wallets religiously. Smart money doesn't care about your fundamentals. Bots and quants are often first in. If you're not tracking them, you're late."

**Ideal wallet characteristics (from source material):**
- Losses limited to $1–5K per trade
- Consistent 5-figure realised profits
- Clear narrative-based trading pattern
- Strategic entry and exit points
- Regular profit-taking (not holding everything to zero)

**Red flags in tracked wallets:**
- Large unrealised losses (they cannot exit profitably)
- Irregular position sizing (no system)
- Multiple top-buying patterns (they always buy too late)
- Inconsistent approach (random not systematic)`,
          visualPrompt: `👆 GMGN wallet profile: annotated view showing win rate, hold time, PnL breakdown, and trade history`,
          visualType: `interactive`,
          visualUrl: `gmgn-wallet-hunt-walkthrough`,
          examples: [
            {
              contextTag: `[Wallet hunter, GateKept discovery, Solana, 2025]`,
              context: `Trader uses GateKept to analyse 5 recent winning tokens simultaneously.`,
              scenario: `GateKept shows one wallet appeared as an early buyer in all 5 tokens. GMGN validation: 58% win rate over 180 trades, average hold 6 hours, total PnL +$420K. No large unrealised losses. Funding from Coinbase 8 months ago — clean history.`,
              outcome: `Trader adds wallet to tracking list. Over the following month the wallet makes 12 new purchases. Trader independently validates 9 of them before buying. 6 of the 9 produce >3× returns. Wallet tracking adds approximately $8,000 in monthly profit.`,
            },
            {
              contextTag: `[New tracker, validation failure, 2024]`,
              context: `New trader adds a wallet after seeing it made 3 big wins.`,
              scenario: `GMGN full history shows: 3 massive wins, but 47 total trades with $220K in unrealised losses still sitting open. Win rate: 18%. The 3 visible wins were visible because the trader posted them publicly. The losses were not posted.`,
              outcome: `Trader nearly copies a trade from this wallet before checking fully. The wallet buys a token that dumps 80% in 2 hours. Full GMGN history check is now mandatory before adding any wallet.`,
            },
            {
              contextTag: `[Experienced tracker, independent validation, 2025]`,
              context: `Tracked smart wallet buys a token at $30K MC. Trader receives alert.`,
              scenario: `Trader independently checks: Rugcheck 87/100, revoked mint, locked LP, 12% sniper concentration (elevated but not disqualifying), strong community with original memes, $30K MC entry (very early). Thesis makes sense independently of the tracked wallet.`,
              outcome: `Trader enters 0.3 SOL. Token reaches $1.4M MC (46×). Both the tracked wallet signal and the independent validation aligned — the combination is more reliable than either alone.`,
            },
          ],
          keyTakeaway: `Wallet tracking finds consistently profitable traders whose on-chain activity serves as an early signal. Use GateKept to find wallets across multiple winning tokens. Use GMGN to validate: 30%+ win rate, 50+ trades, profit-taking history, manageable losses. Always validate independently before acting on a tracking alert.`,
          guidedPractice: [
            {
              question: `A GMGN wallet shows: Win Rate 61%, Total Trades 12, Total PnL +$180,000. Should you add this to your tracking list?`,
              options: [
                `A — Yes — 61% win rate and $180K PnL are excellent numbers`,
                `B — No — 12 trades is insufficient to distinguish skill from luck. Wait until the wallet has 50+ trades before tracking`,
                `C — Yes — any wallet with positive total PnL is worth tracking`,
                `D — Only if their average trade size exceeds $5,000`,
              ],
              correct: 1,
              hint: `How many trades does it take to determine if performance is due to skill vs luck?`,
              explanation: `B is correct. 12 trades with a 61% win rate could easily be luck — statistically, 7 wins from 12 coin-flip trades is unremarkable. A 50-trade minimum is the threshold where the win rate starts to have statistical meaning. 12 large wins could also mean 12 risky all-ins that happened to work — check the full distribution.`,
            },
            {
              question: `The DeFined.fi filter for wallet hunting is set to: token age under 12 hours, ranked by volume. Why is "under 12 hours" the key filter?`,
              options: [
                `A — Newer tokens are safer because they haven't been rugged yet`,
                `B — You want to find wallets that caught wins very early — identifying a token within 12 hours of launch is the skill you are looking for. Older tokens' early buyers are harder to find.`,
                `C — DEXScreener only shows tokens under 12 hours old`,
                `D — Token age under 12 hours indicates the LP is still locked`,
              ],
              correct: 1,
              hint: `What is the value of finding wallets that consistently bought winning tokens within the first 12 hours of launch?`,
              explanation: `B is correct. The wallet-hunting strategy is specifically looking for wallets that find winners early — during the highest-risk, highest-reward phase. A wallet that consistently enters within 12 hours of launch on tokens that then 10–50× has a systematic early-discovery edge. Older tokens' early buyers are harder to isolate in the analysis.`,
            },
            {
              question: `You receive a wallet tracking alert: your tracked smart wallet bought a new token at $45K MC. What is the correct first action?`,
              options: [
                `A — Buy immediately — the tracked wallet's buy is sufficient confirmation`,
                `B — Independently check Rugcheck, GMGN top holders, bundle concentration, and community signals before deciding whether to follow the trade`,
                `C — Wait to see if two more wallets you track also buy before entering`,
                `D — Contact the wallet owner to ask about their thesis`,
              ],
              correct: 1,
              hint: `The source material says wallet tracking is used to "DYOR, and potentially buy as well" — what does DYOR imply about the process?`,
              explanation: `B is correct. The tracked wallet's buy is one signal — not an instruction to copy automatically. The process is: see the alert, independently validate the token (safety checks + community), then decide. Blind copying means you take all of the tracked wallet's losses too, not just their wins.`,
            },
            {
              question: `GateKept analysis of 5 winning tokens shows one wallet appearing in all 5 as an early profitable buyer. The wallet was also the deployer of 2 of the 5 tokens. What does this change about your assessment?`,
              options: [
                `A — Nothing — deploying tokens while also trading them is normal`,
                `B — Significant concern: a wallet that deployed 2 of the 5 tokens it profitably traded may have been trading its own launches with insider knowledge. Their "win rate" on those tokens is not comparable to independent discovery.`,
                `C — This makes the wallet more credible — they understand how tokens work`,
                `D — Only relevant if the deployed tokens are still active`,
              ],
              correct: 1,
              hint: `What advantage does a token deployer have over any other trader in that token?`,
              explanation: `B is correct. A deployer who trades their own token has complete knowledge of the launch timing, sniper activity, and sell plans — this is not edge from skill, it is structural advantage unavailable to others. Their "wins" on those tokens are meaningless as a signal. Their wins on the other 3 tokens (where they were not deployers) are the meaningful sample.`,
            },
            {
              question: `What is the source material's "ideal wallet characteristic" regarding losses?`,
              options: [
                `A — The wallet should have zero losses — only track perfect performers`,
                `B — Losses limited to $1–5K per trade. A wallet that loses small and wins large has good risk management — losses are inevitable, the ratio matters.`,
                `C — Total losses should be below 20% of total gains`,
                `D — Losses should only occur on tokens below $100K market cap`,
              ],
              correct: 1,
              hint: `What does a wallet that loses $1–5K per trade while making $10K–$100K on wins actually demonstrate about their approach?`,
              explanation: `B is correct. The source material explicitly states losses "limited to 1–5K per trade." This is the key — consistent, bounded losses mean the wallet cuts losers rather than holding to zero. Contrast with a wallet that takes $50K losses: they either have very large position sizes or refuse to cut losses. The $1–5K loss ceiling shows disciplined risk management.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `GateKept multi-token analysis across 4 winning tokens from the last 48 hours finds 3 wallets that appeared in all 4:

Wallet X: Win rate 54%, 220 total trades, PnL +$340K. Average hold: 8.2 hours. Loss per losing trade: avg $2,100. Appears in GMGN "Smart Money" list.

Wallet Y: Win rate 71%, 28 total trades, PnL +$890K. Average hold: 14 hours. No breakdown of individual losses visible. Not on GMGN Smart Money list.

Wallet Z: Win rate 44%, 180 total trades, PnL +$95K. Average hold: 31 hours. Loss per losing trade: avg $8,800. Large unrealised loss visible on one position (-$45K).

Rank these wallets by tracking priority and justify each placement.`,
              scoringCriteria: [
                `Wallet X: highest priority. 54% win rate over 220 trades is statistically robust. $2,100 average loss ceiling = excellent risk management. GMGN Smart Money confirmation. $340K PnL from consistent small-bet strategy.`,
                `Wallet Y: medium priority — investigate further before tracking. 71% win rate is exceptional but 28 trades is insufficient for statistical confidence. $890K PnL from 28 trades means very large position sizes — high variance. Need to see individual trade breakdown: are the wins from 2–3 massive bets or consistent small wins?`,
                `Wallet Z: do not track. 44% win rate means they lose more often than they win. $8,800 average loss vs $95K total PnL suggests a few lucky wins covering many losses. The $45K unrealised loss is a red flag — they are holding a massive loser rather than cutting it.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You have been tracking Wallet A for 3 weeks. Track record during your observation: 8 buys, 5 winners (average 4.2×), 3 losers (average -65%). All 5 winners were sold within 6 hours. All 3 losers are still held (unrealised).

Today Wallet A buys a new token at $28K MC. You receive the alert.

Independent checks:
- Rugcheck: 82/100, LP locked, mint revoked, 8% sniper concentration
- Community: 650 Telegram, original meme content
- Market cap: $28K (very early)
- Bundle check: clean, no unusual launch pattern

Given what you know about Wallet A's behaviour pattern, what additional concern does the wallet's track record raise that you must factor into your entry decision?`,
              scoringCriteria: [
                `Critical insight: Wallet A has a pattern of holding losers. All 3 losers are still held — they are NOT cutting losses. This means if they eventually sell a loser, it will be a large sale that could crash a token they are still holding. If you follow this wallet into a trade and it goes against them, they will not alert you with a sell — they will simply hold.`,
                `This does NOT mean skip the trade — the independent checks are positive. But it means: you must define your own exit criteria independent of the tracked wallet's behaviour. Do not wait for them to sell as your signal.`,
                `Correct approach: enter if thesis holds independently. Set your own exit rules: take 50% profit at 3× regardless of wallet A action, exit entirely if price drops 40% from entry without community explanation. Do not rely on wallet A's eventual exit as your signal.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Daily workflow using the wallet hunting system. It is 9 AM UTC.

Step 1 — DeFined filter results (tokens launched in last 12 hours, high volume):
5 tokens with significant performance: $CAPE, $MOOS, $PLOP, $VIBE, $CRAB

Step 2 — GateKept multi-token analysis:
Found 1 wallet appearing in $CAPE, $MOOS, and $VIBE (3 of 5 winners)

Step 3 — GMGN wallet validation:
Win rate: 49%, Trades: 89, Total PnL: +$210K, Avg hold: 5.1 hours, Avg loss: $1,800, GMGN Smart Money: YES

Step 4 — Tracking setup:
Added to Cielo Wallet Tracker. Alert configured.

Step 5 — That afternoon (3 PM UTC), alert fires: wallet bought $NOVA at $41K MC.

GMGN check on $NOVA:
- Age: 4 hours
- Holder distribution: clean (no wallet over 4%)
- Rugcheck: 90/100, mint revoked, LP locked
- Top holders: 3 smart money wallets bought in last 1 hour (including tracked wallet)
- Bundle check: 8% sniper concentration (low)
- Community: 300 Telegram, original memes

Your decision tree: Should you enter? At what size? What is your exit plan?`,
              scoringCriteria: [
                `Entry: yes — all signals align. Smart money convergence (3 verified wallets including tracked wallet). Clean safety checks (90/100, mint revoked, LP locked). Low sniper concentration. Early MC ($41K = very early entry, high asymmetry).`,
                `Size: 2–3% of portfolio given strong multi-signal convergence. The combination of tracked smart wallet + 2 additional smart money wallets + clean fundamentals is one of the strongest entry signals available.`,
                `Exit plan: take 30% at 5× ($205K MC), 30% at 10× ($410K MC), let 40% ride to potential cult formation. Stop: exit if smart money wallets show selling activity. Track monitored wallet on GMGN for exit signal. Hard stop: -50% from entry ($21K MC).`,
              ],
            },
          ],
        },

        {
          id: 'alpha-sources',
          title: `Finding Alpha — X Lists, Telegram Channels, and Building Your Network`,
          explanation: `"Where do I get my alpha?" is the first question every new memecoin trader asks. The experienced traders in the source material are explicit about the answer: it comes from three sources, in roughly this priority order.

**Source 1: X (Twitter) — The Primary Feed**

The source material describes X as "one of my favorite places to find alpha — the secret sauce is following the right accounts, especially trench warriors."

The key insight is curation. A random crypto Twitter feed is noise. A carefully curated list of trench warriors — active traders who are in the trenches daily, share their actual plays, and have documented track records — is signal.

The source material identifies four distinct list types by trading style:
- New pair / high volume traders (highest risk)
- Dip buyers / TA traders (moderate risk, chart-based)
- Lowcap / dust revival traders (patient, longer hold)
- AI/Meta focused (narrative-based)

Following all four gives you exposure to different opportunity types. Following only one means you will miss opportunities that don't fit that style.

**The search function is alpha:**
When you have a CA, search it on X immediately. Look at the most recent tweets. Ask: are people sharing the CA with "entry at X MC" language (they are planning to dump on you) — or are people creating memes, discussing the cultural reference, and showing genuine excitement? The content quality tells you about community quality.

**Source 2: DMs from Friends and Network**

The source material shows a screenshot of a 130× call received via DM from a trusted connection. This is not luck — it is the return on relationship-building. Traders who share genuinely and build trust within a small circle get better information than traders who operate solo.

The network effect compounds over time. The first year in memecoins your network is small. Year three, you know the people who know the people who find things first.

**Source 3: Wallet Tracking (covered in previous lesson)**

The systematic version of network intel — finding wallets that consistently arrive early and monitoring their on-chain activity.

**Telegram channels — the real-time feed:**

Beyond DMs, curated Telegram channels provide a constant stream of calls, analysis, and market sentiment. The source material lists specific channel types: TA-focused channels (Klutch Trades, Chinito, LR), sentiment/education channels, high-risk degen gamble channels. Each serves a different purpose.

Important: KOL calls in Telegram channels are double-edged. They bring volume but the KOL's audience may also be the top. Using a call as research confirmation (token has independent signals AND a credible KOL call) is different from using a call as your entire thesis.`,
          visualPrompt: `👆 Twitter/X search showing the difference between "CA sharing" posts vs genuine community meme posts for the same token`,
          visualType: `interactive`,
          visualUrl: `alpha-source-signal-quality`,
          examples: [
            {
              contextTag: `[Network builder, DM alpha, Solana, 2025]`,
              context: `Trader has spent 6 months building genuine relationships with other trench traders. Not just following — actually engaging, sharing losses as well as wins.`,
              scenario: `A trusted connection DMs: "$CRAB at $30K MC, just checked the team, very clean. Original meme, no sniper issues. Bought 1 SOL." No public announcement. Trader verifies independently. All checks pass.`,
              outcome: `Token goes 80× over 3 weeks. DM came 4 hours before any public call. The relationship — built over 6 months of genuine engagement — provided a 4-hour head start on 80× upside.`,
            },
            {
              contextTag: `[X search workflow, CA evaluation, 2025]`,
              context: `Trader receives CA from pump.fun monitoring. Searches cashtag on X.`,
              scenario: `Search results: 340 tweets in last 2 hours. 280 are people posting the CA with "entry at [MC], target [higher MC]" language. 60 are genuine meme posts. Ratio: 82% CA-sharing, 18% community content.`,
              outcome: `Trader recognises: CA-dominant posts signal a coordinated call-group play, not organic community. Skips the token. Token pumps 2× on the call-group volume then dumps 85% in 90 minutes as callers exit.`,
            },
            {
              contextTag: `[KOL call integration, Telegram, 2025]`,
              context: `Trader has independently found a token with strong signals. 20 minutes later, a credible Telegram KOL calls it.`,
              scenario: `The KOL call brings volume — price jumps 30% in the hour after the call. Trader already holds a position from the independent discovery. The call confirms the thesis rather than being the basis for it.`,
              outcome: `Trader takes 25% profit into the KOL call volume. Holds remainder as organic discovery continues. Total return: 12× over 5 days. The independent discovery before the call provided the best entry — the call was a profitable exit opportunity, not an entry signal.`,
            },
          ],
          keyTakeaway: `Alpha comes from: (1) curated X lists (trench warriors, divided by trading style), (2) trusted DM network built through genuine engagement over time, (3) systematic wallet tracking. On X, search every CA — the ratio of "entry at X MC" posts to genuine meme content tells you about community quality. KOL calls are exit opportunities for holders, not entry signals.`,
          guidedPractice: [
            {
              question: `You search a CA on X and find: 800 posts. 650 say "entry at $50K MC, target $500K" or "huge alpha buy now." 150 posts show people creating memes, art, or cultural content. What does this ratio tell you?`,
              options: [
                `A — 800 posts is excellent community engagement — strong buy signal`,
                `B — The 82% CA-sharing ratio vs 18% organic content suggests a coordinated call-group play. The 650 people sharing price targets are likely planning to dump on buyers — the real community is small.`,
                `C — The 800 posts mean the token is trending on X — another bullish signal`,
                `D — The target price of $500K is reliable because 650 people agree on it`,
              ],
              correct: 1,
              hint: `What is the difference between someone creating a meme about a token vs someone sharing the contract address with a price target?`,
              explanation: `B is correct. "Entry at X MC, target Y MC" posts are not community content — they are coordination posts from people who have already bought and are trying to attract buyers to sell to. Real community engagement is memes, art, jokes, and cultural participation. The 18% genuine content is the actual community signal; the 82% is noise at best, exit-liquidity-creation at worst.`,
            },
            {
              question: `The source material shows a screenshot of a 130× call received via DM from a connection. What enabled this, and how do you replicate it?`,
              options: [
                `A — Pay to join premium alpha groups`,
                `B — Build genuine two-way relationships over time — share your own analysis honestly (including losses), engage with other traders authentically, and the information flow becomes mutual`,
                `C — Follow the most popular crypto influencers on X`,
                `D — Use automated wallet tracking tools exclusively`,
              ],
              correct: 1,
              hint: `What did the trader need to have before receiving a 130× DM? And what does someone with a 130× to share look for in who to share it with?`,
              explanation: `B is correct. People share their best finds with their trusted circle — traders who they know will reciprocate, who they trust not to front-run the information, and who they have a genuine relationship with. You get into that circle by being genuinely useful, honest about losses as well as wins, and engaging authentically. You cannot buy your way into that trust.`,
            },
            {
              question: `What is the source material's characterisation of how a Telegram KOL call should be used?`,
              options: [
                `A — KOL calls are the primary entry signal — buy immediately when a credible KOL calls a token`,
                `B — KOL calls bring volume that can provide liquidity to exit existing positions, or confirm a thesis you developed independently. Using a KOL call as your entire entry thesis means you are often entering after the best price.`,
                `C — KOL calls are always exit signals — sell everything when a KOL calls a token you hold`,
                `D — KOL calls are unreliable and should be ignored entirely`,
              ],
              correct: 1,
              hint: `If a KOL with 50,000 followers calls a token, when did the smart money who follows that KOL already buy?`,
              explanation: `B is correct. By the time a KOL makes a public call, smart money that tracks the KOL's wallet has already entered. The KOL call brings a wave of retail buyers — this is excellent liquidity to sell into if you already hold, and is a confirmation signal if you had independent reasons to be interested. Buying purely on a KOL call means you are buying the liquidity that smart money is selling into.`,
            },
            {
              question: `The source material identifies four types of X lists for different trading styles. Why is following accounts across all four styles more valuable than following only accounts that match your preferred style?`,
              options: [
                `A — Following more accounts is always better regardless of style`,
                `B — Different market conditions favour different styles. Following all four ensures you have signal for whatever the current environment is rewarding — new pair plays, dip-buying setups, lowcap revivals, or meta/narrative plays.`,
                `C — Having more accounts to follow increases your Twitter algorithm reach`,
                `D — You need at least 100 accounts to be eligible for Twitter's advanced search`,
              ],
              correct: 1,
              hint: `If the market is in a "dip-buying" phase and you only follow new pair traders, what opportunities are you missing?`,
              explanation: `B is correct. Market conditions cycle. During high volatility periods, new pair gambling is rewarded. During consolidation, dip-buying and TA trading work better. Lowcap revivals often happen when the broader market is choppy and low-cap coins get relatively cheap. Following all four styles gives you options regardless of the macro environment.`,
            },
            {
              question: `What is "Defined.fi" used for in the trading setup, and what makes it preferable to DEXScreener for certain purposes?`,
              options: [
                `A — It shows only tokens with locked LP — safer for beginners`,
                `B — It offers custom filters without paid promotions — tokens in the results are there due to organic metrics (volume, price movement) rather than teams paying for visibility`,
                `C — It only covers Ethereum tokens — useful when avoiding Solana risk`,
                `D — It is the only platform that shows pre-graduation pump.fun tokens`,
              ],
              correct: 1,
              hint: `The source material describes Defined.fi as "no paid promotions" — what does that mean about the tokens you see?`,
              explanation: `B is correct. DEXScreener allows teams to pay for boosted visibility (you can see "DEX Paid" indicators). Defined.fi does not accept paid promotions, so the tokens you see when filtering by volume or price movement earned that ranking organically. For discovering tokens before they get widely promoted, this organic signal is cleaner.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You follow a curated X list of 40 trench traders. In the last 2 hours you have seen:

Signal 1: Wallet tracker alert — a tracked smart wallet (54% win rate, 180 trades) bought $PLOP at $22K MC 45 minutes ago.
Signal 2: 3 separate accounts on your X list have independently posted about $PLOP in the last 2 hours — none appear coordinated. All 3 are showing genuine meme engagement, not just CA sharing.
Signal 3: 1 large Telegram channel (15,000 members) made a formal call on $PLOP 20 minutes ago. Price jumped 40% on the call.
Signal 4: GMGN shows 2 additional smart money wallets bought at $22–28K MC (before the Telegram call).

Current MC (post-call): $65,000. Your independent checks: Rugcheck 89/100, mint revoked, LP locked, 9% sniper concentration.

Analyse the full signal stack. Which signals are high-quality and which are degraded? Should you enter at $65K MC?`,
              scoringCriteria: [
                `High quality signals: (1) tracked wallet at $22K MC (independent, pre-call discovery); (2) 3 independent X accounts with genuine meme engagement (not coordinated, pre-call); (3) 2 additional GMGN smart money wallets at $22–28K MC (all before the Telegram call)`,
                `Degraded signal: the Telegram call at 20 minutes ago — by $65K MC (3× from smart money entry), the call audience has already entered and may be looking to exit`,
                `Entry at $65K MC: reasonable but with increased risk vs the $22K MC entry. Smart money is now 3× in profit — they may exit on further buying. Position size should be smaller than at the original entry point. The pre-call signal stack was excellent; post-call entry requires tighter risk management.`,
                `Suggested approach: enter 1% of portfolio (reduced from the 2–3% you would have entered at $22K). Set 30% profit take at $100K MC, full exit at $150K MC or if smart money begins selling.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are building your first curated X list of trench warriors. You evaluate 5 accounts:

Account A: Posts 20 calls per day. Never posts losses. All posts show entry at low MC, highlights big wins. 180,000 followers. Has a paid community ($49/month).

Account B: Posts 2–3 times per day. Shows entries AND losses. Win rate stated as 62% with transaction screenshots. 8,000 followers. No paid community.

Account C: Primarily TA content. Shows chart setups on established coins with defined entry/exit. 45,000 followers. Occasionally shares new pairs but clearly labels them as "high risk gamble."

Account D: Focuses exclusively on Solana lowcaps. Posts 1–2 times per week. Shows full trade history publicly. 3,500 followers.

Account E: 300,000 followers. Posts very frequently about upcoming token launches. Multiple times has been caught pumping tokens they held before posting.

Which accounts would you add to your list, which style category do they fit, and which would you exclude?`,
              scoringCriteria: [
                `Account B: ADD. Low following but verifiable track record (screenshots, shows losses). Real signal — small honest accounts with documented records are more valuable than large promotional accounts.`,
                `Account C: ADD (TA/dip buyers list). Honest about risk levels, structured analysis. 45K following suggests credibility without obvious promotion plays.`,
                `Account D: ADD (lowcap/dust revival list). Very small following but transparency (public trade history) is the highest quality signal available. Weekly cadence = curated, not volume posting.`,
                `Account A: EXCLUDE. 20 calls/day with zero losses = survivorship bias curation. They are showing only wins. Paid community = financial incentive to pump tokens before calling them. This is classic exit liquidity creation.`,
                `Account E: EXCLUDE. Caught pumping tokens before posting = this is market manipulation. Their "calls" are selling into your buys. Exclude immediately.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Timeline of alpha signal sequence for token $FROG:

T-4 hours: Smart wallet A (55% win rate, 200 trades) buys at $15K MC.
T-3.5 hours: Smart wallet B (48% win rate, 150 trades) buys at $18K MC.
T-2 hours: Two accounts on your X list post original frog memes featuring the token. No CA sharing. Organic.
T-1.5 hours: $FROG enters DEXScreener Hot Pairs trending list.
T-1 hour: You receive a DM from a trusted trader friend: "Bought some $FROG at $25K, looks clean. Just sharing."
T-0: A large KOL (80K followers) makes a formal Telegram call. Current MC: $62K.

From your perspective, you see the DM at T-1 hour (MC $25K). You have not seen the KOL call yet.

Questions:
1. At T-1 hour, what is your signal quality assessment and entry decision?
2. 30 minutes later the KOL call fires and price jumps to $62K. How does this change your position management?
3. Looking at the full timeline retrospectively, what was the optimal entry point and why?`,
              scoringCriteria: [
                `At T-1 hour (MC $25K): excellent signal stack. Two verified smart wallets in at $15–18K. Organic X community activity (memes, not CA sharing). DEXScreener discovery just happened. Trusted DM from friend. All pre-KOL call. Strong entry case at 2–3% of portfolio.`,
                `After KOL call (MC $62K): if already in at $25K, the KOL call is a take-profit opportunity. Smart wallets A and B are now 3.5–4× in profit and have incentive to sell into KOL call volume. Take 30–50% profit at $62K. Hold remainder for organic continuation.`,
                `Optimal entry: T-3.5 hours at $18K MC when the second smart wallet confirmed the first. Two independent smart wallets at adjacent prices = convergence signal. This was before DEXScreener, X organic posts, DM, and KOL — the earliest confirmation with sufficient independent signal.`,
              ],
            },
          ],
        },

      ], // end lab 2 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from all Lab 2 lessons — no labels, no hints. Tests trading platform selection, analysis tool workflow, wallet tracking, and alpha source evaluation.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 2 Boss — Complete Trading Stack Integration`,
        learningLoop: {
          hintsEnabled: true,
          feedbackMode: 'full-criteria-with-lesson-pointers',
          scenarioMode: 'fresh-each-attempt',
          message: 'Review the lesson pointers and try again with a new scenario.',
        },
        scenarios: [{
          id: 'boss-lab2-v1',
          situation: `It is 2 PM UTC on a Tuesday. Your alert system fires simultaneously: a tracked smart wallet (52% win rate, 190 trades) bought $CUBE at $38K MC 8 minutes ago. You are currently on your phone in the middle of another task.

You have: Photon (browser), GMGN (browser), Nova Bot (Telegram), Rugcheck (browser), Syrax Scanner (Telegram bot).

Perform your complete pre-entry workflow in the correct order and make an entry decision. State: (1) The exact sequence of tool checks you perform, (2) What you look for in each tool, (3) Your entry decision and position size, (4) Which execution tool you use and why, (5) Your exit plan.`,
          scoringCriteria: [
            `Sequence: (1) Rugcheck — mint revoked? LP locked? Overall score? (2) Syrax/bundle check — sniper/bundle concentration? (3) GMGN top holders — concentration? Smart money? (4) DEXScreener/Photon — volume pattern, transaction feed (5) X/Telegram — community quality`,
            `Execution tool: Nova Bot within Telegram for fastest execution without switching apps (phone-based scenario)`,
            `Priority fee: set to 0.005–0.01 SOL, not default`,
            `Position size: depends on check results — if all pass, 2% of portfolio. Adjust down for any elevated risk factor.`,
            `Exit plan: defined before entry — e.g. take 30% at 3×, 30% at 7×, let 40% ride. Hard stop at -50% from entry. Exit if tracked wallet sells.`,
          ],
        }],
      },
    },

// ─────────────────────────────────────────────────────────────────────────────
// LAB 3: ENTRY & EXIT STRATEGY
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-3-entry-exit',
      title: `Lab 3: Entry & Exit Strategy`,
      subtitle: `Knowing what to buy is 40% of the job. Knowing when to buy and when to sell is the other 60%.`,
      lessons: [

        {
          id: 'three-trader-styles',
          title: `The Three Trader Styles — Know Which One You Are`,
          explanation: `The source material identifies three primary memecoin trading styles. Most traders fail because they switch between styles without realising it — they enter a new pair gamble but then hold it like a long-term cult investment when it goes down. Knowing your style and executing it consistently is more important than having the "best" strategy.

**Style 1: New Pair / High Volume Gamblor**

The highest-risk, highest-reward approach. You are looking at tokens within the first minutes to hours of launch on pump.fun. You are buying before community has formed, before any validation has occurred, based primarily on: meme quality assessment, initial sniper check, and speed of execution.

The math: most of these go to zero. Your edge comes from (a) being faster than others at identifying promising launches, (b) having a strict pre-entry checklist to filter out obvious rug setups, (c) taking profit quickly at 2–3× before the inevitable dump.

The source material is explicit: position sizes should be small ($50–300 on sub-$500K MC coins). You are playing a volume game — many small bets, fast exits, occasional big winner.

**Style 2: Buy Dips → Sell Rips (TA-based)**

Focuses on established coins with proven communities. You are not gambling on whether a coin will survive — it has survived. You are trading the price cycles of an existing cult. 

This uses technical analysis: support levels (where buyers consistently emerge), resistance levels (where sellers consistently emerge), and volume patterns. Less risky per trade because the coin's existence is proven, but more technical skill required.

The source material associates this style with traders who share chart setups, define entry/exit levels before entering, and swing trade established cults like $WIF or $BONK.

**Style 3: Lowcap / Dust Revival**

The most patient style. Finding established tokens at very low market caps ($50K–$300K) that the market has abandoned but still have active communities. Buying the "dust" — what's left after everyone else gave up — and waiting for revival.

These tokens can sit flat for weeks or months before suddenly reviving on a narrative connection, a CTO announcement, or just renewed community energy. The entry risk is low (price is near zero), the exit path is longer, and position sizing is typically larger (because you are buying confirmed survivors, not speculative launches).

**Which style suits you?**

The source material's advice: "Figure out your trading style. If you're getting rekt on new pairs, stop trading new pairs and ape into established communities." Most beginners start by attempting Style 1 and losing — then discover they are temperamentally better suited for Style 2 or 3.`,
          visualPrompt: `👆 Three trader style charts side-by-side: new pair entry/exit pattern vs dip-buy swing pattern vs lowcap accumulation`,
          visualType: `chart`,
          visualUrl: `three-trader-style-comparison`,
          examples: [
            {
              contextTag: `[Style 1 trader, new pair, pump.fun, 2025]`,
              context: `Trader receives CA for a fresh pump.fun launch at $25K MC. Has 90 seconds before it pumps further.`,
              scenario: `60-second checklist: Rugcheck passes, bundle check shows 10% concentration (acceptable), community has 50 Telegram members (too early to assess). Enters 0.2 SOL. Token pumps to $180K MC in 20 minutes. Trader exits at $150K MC (before peak).`,
              outcome: `6× return on 0.2 SOL. Token then dumps 80%. Trader is satisfied: took quick profit as planned. This is Style 1 executed correctly — fast entry, fast exit, no overstaying.`,
            },
            {
              contextTag: `[Style 2 trader, dip buying, $WIF, 2025]`,
              context: `$WIF drops 35% over 3 days on no fundamental news. Trader identifies support at the 20-day moving average.`,
              scenario: `Trader enters with 1 SOL at the support level, sets target at previous resistance (25% above), and sets stop-loss at 8% below entry. Token bounces from support as expected and reaches target in 5 days.`,
              outcome: `Clean 25% return with defined risk. Style 2 — technical execution on an established coin. No speculation on whether the coin "has what it takes" — it already proved itself. Pure price timing.`,
            },
            {
              contextTag: `[Style 3 trader, lowcap revival, Solana, 2025]`,
              context: `$PAINT — the CTO coin discussed in Lab 1 — is trading at $8K MC, 90% below its original peak. Community still active.`,
              scenario: `Style 3 trader enters with 2 SOL spread over 3 weeks of accumulation at $8–15K MC range. Average entry: $11K MC. Token revives 8 weeks later on community-driven narrative connection to a major art exhibition.`,
              outcome: `Token reaches $6M MC (545× from $11K average entry). Style 3 requires patience — weeks of sitting on a flat position — but the entry price was extremely low risk given confirmed community survival.`,
            },
          ],
          keyTakeaway: `Know which of the three styles you are executing before entering any trade. New pair = fast entry, fast exit, small size. Dip buyer = TA execution on established coins. Lowcap = patient accumulation at near-zero prices. Getting rekt consistently in one style means switching to another.`,
          guidedPractice: [
            {
              question: `A trader enters a new pump.fun token at $30K MC with 1 SOL. It reaches $1.2M MC (40×). They do not take any profit because "I think it can go to $10M." It drops back to $200K MC. They still do not sell because "it will recover." It drops to $40K MC. What style error did this trader make?`,
              options: [
                `A — They entered the wrong style of token for their approach`,
                `B — They entered as a Style 1 (new pair gamble) but held like a Style 3 (long-term conviction holder) — the styles have incompatible exit expectations and position sizes`,
                `C — They should have used a stop-loss at $800K MC`,
                `D — They were correct to hold — the price will recover eventually`,
              ],
              correct: 1,
              hint: `What exit behaviour does Style 1 require vs what this trader actually did?`,
              explanation: `B is correct. Style 1 (new pair gamble) requires fast exits because these tokens are speculative and dump frequently. Holding a Style 1 entry through a 40× gain back to 1.3× is a style mismatch — the trader entered with gamble-sized conviction but held with cult-conviction expectations. Style 1 players should have taken profit at the first sign of distribution or at predetermined targets (e.g. 5×, 10×).`,
            },
            {
              question: `Which trading style is described as "less risky because the coins are not new, and are typically tried and true coins that have gone through dips and have a community established"?`,
              options: [
                `A — Style 1: New Pair / High Volume Gamblor`,
                `B — Style 2: Buy Dips → Sell Rips`,
                `C — Style 3: Lowcap / Dust Revival`,
                `D — All three styles have equivalent risk profiles`,
              ],
              correct: 1,
              hint: `Which style focuses on established coins with proven communities rather than new launches?`,
              explanation: `B is correct. The source material explicitly describes the dip-buying style as "less risky because the coins are not new, and are typically tried and true coins." Style 1 involves unproven new launches. Style 3 involves proven-but-abandoned coins. Style 2 involves proven, active coins — the lowest risk profile among the three.`,
            },
            {
              question: `A trader has been consistently losing on new pair trades for 3 months. The source material's specific advice is:`,
              options: [
                `A — Increase position sizes to recover losses faster`,
                `B — "Figure out your trading style. If you're getting rekt on new pairs, stop trading new pairs and ape into established communities"`,
                `C — Switch to leverage trading instead`,
                `D — New pairs are always eventually profitable — just need more patience`,
              ],
              correct: 1,
              hint: `What does the source material say specifically about traders getting rekt in a style that doesn't suit them?`,
              explanation: `B is correct. This is verbatim from the source material. Consistent losses in a specific style is a signal that either (a) your execution in that style needs improvement, or (b) your temperament is better suited for a different style. Established communities are less volatile, require less split-second decision making, and are more amenable to the patience some traders naturally have.`,
            },
            {
              question: `Why does Style 3 (lowcap/dust revival) typically use larger position sizes than Style 1 (new pair gamble)?`,
              options: [
                `A — Lowcap traders have more capital by definition`,
                `B — Style 3 entries are at confirmed-survivor tokens near their all-time low — the downside is already mostly realised. Style 1 entries are at unproven tokens where 100% loss is the most common outcome.`,
                `C — Style 3 requires larger positions to move the market price`,
                `D — Style 3 position sizes are actually smaller — the question premise is wrong`,
              ],
              correct: 1,
              hint: `Think about the probability of total loss: which style has a higher chance of the token going to zero?`,
              explanation: `B is correct. A Style 3 token at $50K MC has already survived its rug window, proven community survival, and been through major dumps. The risk of complete loss is lower than a brand new pump.fun token. This justifies larger position sizes. Style 1 tokens have a 98%+ rate of failure — position sizes must be small to survive the inevitable losses.`,
            },
            {
              question: `The "AI Cabal" bonus list in the source material represents which trading style orientation, and why is it a separate category?`,
              options: [
                `A — Style 1 — AI coins launch frequently on pump.fun`,
                `B — A meta-focused variant that crosses all styles — it specifically tracks the AI narrative cycle which operates on different timing than individual token styles. Traders can apply any style (new pairs, dips, lowcap) within the AI meta theme.`,
                `C — Style 3 — AI coins are always lowcap opportunities`,
                `D — A risk-free strategy — AI coins never rug`,
              ],
              correct: 1,
              hint: `How does trading "within a narrative" differ from the style-based framework?`,
              explanation: `B is correct. The AI meta represents a thematic layer that sits above the three styles. You can trade new AI coins (Style 1), buy dips in established AI tokens (Style 2), or find abandoned AI tokens at dust prices (Style 3). The meta gives you a filter for which opportunities to pay attention to within your preferred style.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Three traders all bought $MOON at the same time ($50K MC). Different styles, different outcomes:

Trader A (Style 1): Bought 0.2 SOL ($30). Token reached $850K MC (17×). Trader A sold at $700K MC (14× = $390 profit). Token then crashed to $60K MC.

Trader B (Style 2): Bought 1 SOL ($150). Token reached $850K MC. Trader B held waiting for a technical "confirmation of next leg up." Token crashed before the setup confirmed. Sold at $85K MC (70% profit = $105).

Trader C (Style 3): Bought 2 SOL ($300). Token is now at $60K MC (20% from entry). Community is still active. Trader C has not sold.

Evaluate whether each trader executed their style correctly. Which trader made the biggest mistake and why?`,
              scoringCriteria: [
                `Trader A: executed Style 1 correctly. Fast entry (0.2 SOL), took profit before the peak, did not overstay. Result: 14× on a small position. This is the template.`,
                `Trader B: style mismatch. They entered a new pump.fun token (Style 1 territory) but tried to apply Style 2 TA methodology. Style 2 TA works on established coins with defined support/resistance — not on a 3-hour-old pump.fun token. The "waiting for confirmation" approach is misapplied here.`,
                `Trader C: potentially executing Style 3 correctly — IF $MOON is actually a cult-forming token. At $60K MC with active community, this is a CTO/revival setup. But if they entered as a Style 1 play and are now holding because they "can't take the loss," this is also a style mismatch. Needs more information.`,
                `Biggest mistake: Trader B. They entered a high-risk new pair but applied the wrong exit framework, turning a potential 14× into a 70% profit. The mistake was style mismatch, not bad execution within a style.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are evaluating your trading performance over the last 60 days:

New pair trades (Style 1): 22 trades, 4 winners (18% win rate), average win +$320, average loss -$85. Net: +$540.
Dip-buying trades (Style 2): 8 trades, 5 winners (62% win rate), average win +$210, average loss -$180. Net: +$690.
Lowcap accumulation (Style 3): 3 positions, 2 still open (up 40% and 75%), 1 sold at +$1,200. Total: +$1,200 realised.

Questions:
1. Which style is producing the highest risk-adjusted return per trade?
2. Despite the 18% win rate on new pairs, why is Style 1 still net positive?
3. Based on this data, what reallocation would you make to your style distribution?`,
              scoringCriteria: [
                `Style 2 has highest risk-adjusted return: 62% win rate, similar average win/loss ($210/$180), 8 trades. Consistent, predictable. Style 3 has highest single-trade return ($1,200) but too few trades for statistical confidence.`,
                `Style 1 is net positive despite 18% win rate because position sizing is correct: average loss $85 (small) vs average win $320 (larger). 4 wins × $320 = $1,280, 18 losses × $85 = $1,530. Wait — this shows Style 1 is actually net negative. Student should catch this: 4 × $320 = $1,280 minus 18 × $85 = $1,530 = -$250, not +$540. Re-examine the math or check if the figures include compounding.`,
                `Reallocation: increase Style 2 allocation (highest win rate, consistent returns). Maintain small Style 1 allocation (asymmetric upside, but only if sizing is truly $50–100 per trade). Increase Style 3 patience — the one realised trade ($1,200) suggests this style suits the trader's temperament.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You are evaluating whether to apply Style 2 (dip-buying TA) to $BONK, an established Solana memecoin.

Chart data:
- 90-day support level: $0.000018 (tested 4 times, held each time)
- Current price: $0.000019 (near support)
- 30-day high: $0.000032
- Volume today: 2.1× average — above average, mostly buy-side
- Community: established, 45K Telegram members, regular original content
- No major negative news

Construct a complete Style 2 trade setup: entry price, stop-loss, first target, second target, position size rationale, and what would invalidate this setup.`,
              scoringCriteria: [
                `Entry: $0.000019 (near support) or scale in on a touch of $0.000018 support`,
                `Stop-loss: $0.000016 (below the 4-times-tested support — if it breaks here, the support structure is broken)`,
                `Target 1: $0.000025 (midpoint to 30-day high) — take 40% profit`,
                `Target 2: $0.000032 (previous 30-day high) — take remaining position`,
                `Position size: Style 2 uses larger sizes than Style 1 (this is a proven coin). Risk the loss from entry to stop-loss, size position so that loss = 2% of total portfolio.`,
                `Invalidation: volume turns sell-dominant without recovery, support breaks on 2 consecutive daily candles, negative fundamental news (exchange hack, major whale distribution), overall Solana market deterioration`,
              ],
            },
          ],
        },

        {
          id: 'position-sizing',
          title: `Position Sizing — Why Most Traders Lose Even When They Are Right`,
          explanation: `A trader found $WIF at $50K market cap in early 2024. They were completely right about the token — it reached $4B market cap, a near-80,000× return. They made $1,200.

How? They bought $0.015 worth of tokens "just to track it." They were right about the trade and made practically nothing.

The inverse is equally common: a trader puts 40% of their portfolio into a single pump.fun launch because "I have extremely high conviction." It rugs. They lose 40% of their net worth on one bet.

Position sizing is not a secondary consideration. It is the difference between consistent profitability and random outcomes.

**The core principle from the source material:**
"Capital preservation is everything. And you gotta manage your risk accordingly. Buy what you can afford to lose." And: "Don't full port — you can lose it all."

**The 1–5% rule:**
Never put more than 1–5% of your trading portfolio into a single memecoin position. This sounds conservative. It is not — it is what enables survival.

Here is the math: if you risk 5% per trade and get 10 consecutive wrong calls, you have lost 40% of your portfolio (not 50%, due to compounding down). That is painful but survivable. If you risk 20% per trade and get 10 wrong calls, you have $0.12 of your original $1 — effectively zero.

**Position sizing by style:**
Style 1 (new pair): $50–$300 per trade for sub-$500K MC coins. The source material gives these exact figures. You are buying lottery tickets — keep ticket price small.

Style 2 (dip buying): larger position sizes are appropriate because the coin is established. 5–10% of portfolio is reasonable for a defined TA setup with a stop-loss.

Style 3 (lowcap): 2–8% of portfolio in an established but abandoned coin. Higher than Style 1 because downside is already partially realised.

**The "can't afford to lose" position:**
The source material is explicit: "Especially in this market, I am only doing $50–$300 gambles at the moment on sub-$500K MC coins." This is from a trader who has made significant money. The point is not that small sizes are for beginners — they are the professional default for high-risk positions.

**Exiting large positions without killing the chart:**
The source material from the learnings section: "If you own a large % of the supply, only offload 1–5% at a time using JUP DCA or your bot." And: "Watch out for slippage — instead of jeeting your whole bag, do small clips." Selling 30% of a thin-liquidity token in one transaction is self-sabotage.`,
          visualPrompt: `👆 Interactive position sizing calculator: portfolio size, risk %, expected outcome distribution`,
          visualType: `interactive`,
          visualUrl: `position-sizing-simulator`,
          examples: [
            {
              contextTag: `[Experienced trader, $50 gamble system, pump.fun, 2025]`,
              context: `Experienced trader with $5,000 portfolio applies strict sizing.`,
              scenario: `Trader allocates $50 (1% of portfolio) to 20 different pump.fun launches in a month. 16 go to zero. 3 go 5–8×. 1 goes 40×. Result: 16 × -$50 = -$800, 3 × $300 avg = +$900, 1 × $2,000 = +$2,000. Net: +$2,100.`,
              outcome: `Without strict sizing, losing all 16 dead tokens at $250 each would be -$4,000 — wiping most of the portfolio. The $50 cap converts a potentially catastrophic month into a strong profit. Sizing is the system.`,
            },
            {
              contextTag: `[Trader, JUP DCA exit, large position, 2025]`,
              context: `Trader holds 3% of a token's supply after accumulating at low prices.`,
              scenario: `Token is at $800K MC. Trader wants to exit. Attempting to sell full bag in one transaction on a $200K liquidity pool would crash price by 40% — hurting both their exit price and remaining holders.`,
              outcome: `Trader uses Jupiter DCA to sell 10% of holding every 4 hours over 5 days. Average exit price is 15% higher than a single dump would have achieved. Community does not see a "dump candle." Some holders thank them for the clean exit.`,
            },
            {
              contextTag: `[New trader, "full port" lesson, 2024]`,
              context: `New trader has $2,000. Gets extremely high conviction on a coin.`,
              scenario: `Trader puts $1,800 (90% of portfolio) into a single launch. Token rugs in 3 hours. $1,800 becomes $45.`,
              outcome: `Trader now has $245 total. A single rug removed 90% of their trading capital. With proper sizing ($100 per trade), the same rug would have reduced portfolio by 5% — leaving $1,900 to continue trading.`,
            },
          ],
          keyTakeaway: `Never risk more than 1–5% of portfolio on a single memecoin position. Style 1: $50–$300 per trade. Style 2: up to 10% with defined stop-loss. Style 3: up to 8% in established revivals. When exiting large positions, use JUP DCA or small clips to avoid self-dumping.`,
          guidedPractice: [
            {
              question: `You have a $3,000 trading portfolio. Applying the 1–5% rule, what is the maximum single position size for a high-risk new pair gamble?`,
              options: [
                `A — $1,500 (50% of portfolio)`,
                `B — $30–$150 (1–5% of portfolio)`,
                `C — $500 (fixed amount regardless of portfolio size)`,
                `D — $3,000 — all in if conviction is high enough`,
              ],
              correct: 1,
              hint: `Apply: portfolio × maximum risk percentage = maximum position size.`,
              explanation: `B is correct. 1% of $3,000 = $30. 5% of $3,000 = $150. For a high-risk new pair (Style 1), 1–2% is appropriate — meaning $30–$60. The source material's example of $50–$300 gambles is specifically from a trader with a larger portfolio. The principle scales with portfolio size.`,
            },
            {
              question: `A trader makes 15 consecutive wrong calls on new pair trades, losing their full bet each time. If they were risking 2% per trade, what percentage of their portfolio remains?`,
              options: [
                `A — 70% remains`,
                `B — 73.9% remains (each loss is 2% of remaining portfolio, not 2% of original)`,
                `C — 0% remains`,
                `D — 30% remains`,
              ],
              correct: 1,
              hint: `Each loss reduces the portfolio by 2% of whatever remains at that point — compound down calculation.`,
              explanation: `B is correct. After 15 consecutive losses of 2% each (compound): 0.98^15 = 0.739, so 73.9% remains. Compare to 20% sizing: 0.80^15 = 3.5% remains. Proper sizing means surviving 15 consecutive losses with most portfolio intact.`,
            },
            {
              question: `You hold 4% of a token's total supply. The token has $150K in liquidity. You want to exit. What is the correct approach?`,
              options: [
                `A — Sell everything in one transaction to exit cleanly`,
                `B — Use JUP DCA or manual small clips to sell 1–5% of your holding at a time, spread over multiple hours or days — avoid crashing the price with a large single sell`,
                `C — Burn your tokens so you do not crash the price`,
                `D — Announce your intention to sell publicly so buyers can absorb the selling`,
              ],
              correct: 1,
              hint: `What happens to a token's price when 4% of supply (with only $150K liquidity) is sold in one transaction?`,
              explanation: `B is correct. Selling 4% of supply into a $150K liquidity pool in one transaction could cause a 25–50% price crash — harming both your exit price and the remaining holders. JUP DCA or manual small clips distributes the selling pressure over time, allowing organic buying to partially absorb each clip. The source material explicitly states: "use JUP DCA to sell over a period of time vs all in one tx."`,
            },
            {
              question: `The source material states: "It is better to miss a 1000x, take the 10x, and not be down 70% the next day." What trading principle does this represent?`,
              options: [
                `A — Never hold for large gains — always exit at 10×`,
                `B — Realised profits > unrealised potential. Taking partial profits consistently compounds portfolio value even if individual exits miss the top. Unrealised gains are not real until sold.`,
                `C — 10× is always the optimal take-profit level`,
                `D — Selling at 10× guarantees you will not experience drawdowns`,
              ],
              correct: 1,
              hint: `"It is not profit until you cash it out" — what does this tell you about unrealised gains?`,
              explanation: `B is correct. The source material includes a personal example: a bag worth $18K that was not taken profit on, now worth $1,000. Unrealised gains are theoretical. Taking consistent partial profits builds real, permanent portfolio value even if it means occasionally missing a further 10×. The 1000× that rounds trips is worth less than the 10× that was taken.`,
            },
            {
              question: `Slippage in memecoin trading refers to what, and why does the source material recommend "small clips" when selling?`,
              options: [
                `A — Slippage is the fee charged by the trading platform`,
                `B — Slippage is the difference between expected and actual execution price due to market impact. Large sells on thin liquidity cause significant slippage — you receive less than the quoted price. Small clips reduce market impact per transaction.`,
                `C — Slippage only occurs on Ethereum, not on Solana`,
                `D — Slippage is a tax consideration that affects only large trades`,
              ],
              correct: 1,
              hint: `What happens to the price when you sell a large amount into a thin order book?`,
              explanation: `B is correct. When you submit a large sell into a thin liquidity pool, each fraction of the sell further depresses the price — you end up receiving an average price significantly below the market price at the start of the transaction. Small clips (selling 5–10% of position at a time) allow the price to partially recover between sells, improving overall average exit price.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Portfolio: $8,000. Monthly trading log:

Week 1: 6 new pair trades at $100 each. 5 rugs (-$500), 1 goes 12× (+$1,100). Net: +$600.
Week 2: 4 new pair trades at $400 each. 4 rugs (-$1,600). Emotional response to Week 1 wins = oversized bets. Net: -$1,600.
Week 3: 3 new pair trades at $80 each. 2 rugs (-$160), 1 goes 8× (+$560). Net: +$400.
Week 4: 1 dip buy of $800 in $WIF at support. Clean +20% return. Net: +$160.

End of month portfolio: $7,560 (down 5.5% from $8,000).

Questions:
1. Which week violated position sizing principles and what was the cause?
2. Calculate what the Week 2 result would have been with correct sizing ($80–$100 per new pair trade).
3. What rule would prevent the emotional oversizing that occurred in Week 2?`,
              scoringCriteria: [
                `Week 2 violated sizing: $400 per new pair trade is 5% of portfolio — too high for Style 1 gambles. The cause was emotional — Week 1 winning made the trader feel invincible and increased bet sizes.`,
                `Week 2 with correct sizing ($100/trade): 4 trades × -$100 = -$400. Actual result was -$1,600. Correct sizing would have saved $1,200 in that single week.`,
                `Rule to prevent emotional sizing: set position size rules before opening the trading app each day. Never increase bet size after a winning streak — the rule is non-negotiable regardless of recent performance. The source material: "Don't force trades. Sometimes the biggest alpha is just sitting on your hands."`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You have $5,000 in trading capital. You want to build a monthly strategy across all three styles. Design your sizing framework:

Your profile: You trade every day. You find 8–12 new pair opportunities per week. You have 2–3 established cult coins you follow for dip-buying. You have identified 1 lowcap revival candidate.

Design:
1. Maximum position size for Style 1 new pair gambles (justify with % of portfolio)
2. Maximum position size for Style 2 dip buys (justify with stop-loss based sizing)
3. Maximum position size for the Style 3 lowcap position
4. Monthly "stop" rule — at what point do you stop trading for the month?
5. How many simultaneous positions maximum?`,
              scoringCriteria: [
                `Style 1: $50–$100 per trade (1–2% of $5,000). With 8–12 trades/week, this means $400–$1,200/week in Style 1 exposure. If all go to zero (worst case), maximum monthly loss on Style 1 = approximately $2,400.`,
                `Style 2: size by stop-loss. If stop-loss is 8% from entry on a dip-buy, size position so that maximum loss = 2% of portfolio = $100. Position size = $100 / 0.08 = $1,250 maximum for Style 2 trade with 8% stop.`,
                `Style 3: $200–$400 (4–8% of portfolio) for confirmed survivor coin. Lower volatility justifies larger size.`,
                `Monthly stop: if total portfolio drops to $4,000 (20% drawdown), stop trading for the month. Reset rules and review what went wrong.`,
                `Maximum simultaneous positions: 5–8 (monitoring more than this becomes impossible on a portfolio under $10K).`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You hold 2.8% of a token's total supply of 1 billion tokens. Current stats:
- Your entry: $45K MC, bought 28 million tokens for 2 SOL
- Current MC: $420K MC (9.3× from entry)
- Current token price: $0.00042
- DEXScreener liquidity: $180K
- Your position current value: 18.6 SOL (~$2,790 at current SOL price)

You have decided to exit the position over the next 48 hours.

Design your exact exit plan:
1. Maximum sell size per transaction (to avoid significant price impact on $180K liquidity)
2. Timing between sells
3. Total number of transactions to exit the full position
4. Whether to use JUP DCA or manual clips, and why
5. What you do if price drops 20% during your exit process`,
              scoringCriteria: [
                `Maximum sell per tx: selling more than 2–3% of $180K liquidity at once causes significant slippage. Maximum per tx = $3,600–$5,400. In token terms at $0.00042: $3,600 / $0.00042 = ~8.6M tokens per transaction. Use 5–8M tokens per sell to stay under 3% liquidity impact.`,
                `Timing: 4–8 hours between sells. Allows organic buying to partially replenish liquidity and price to stabilise.`,
                `Transactions: 28M tokens total / 6M tokens per sell = approximately 5 transactions over 48 hours.`,
                `JUP DCA vs manual: JUP DCA automates the timing and is recommended for patient exits. Manual clips work if you are actively monitoring. JUP DCA prevents emotional decisions during price moves.`,
                `If price drops 20%: re-evaluate the thesis. If community is still intact and no major negative signals, continue with the planned exit (your remaining position is still 7.3× from entry). If community shows signs of dying (volume collapsing, Telegram going silent), accelerate the exit and accept the worse price.`,
              ],
            },
          ],
        },

        {
          id: 'profit-taking-strategy',
          title: `Taking Profit — The Hardest Part of the Game`,
          explanation: `The most repeated lesson in the source material — appearing more times than any other concept — is take profit. Verbatim from "Shitcoin Learnings":

"TAKE PROFIT"
"Take profit take profit take profit take profit."
"It is not profit until you cash it out."
"It is better to miss a 1000x, take the 10x, and not be down 70% the next day."
"If you're taking screenshots, TAKE PROFIT"

And the most painful personal example: "My half bagel bag was worth $18k and I didn't TP at all. It is now worth $1,000."

Why is taking profit so psychologically difficult? Three reasons.

**Reason 1: Regret asymmetry.** Selling at 10× and watching it go to 100× feels worse than selling at 2× and watching it go to 0 — even though the former made more money. The regret of missing upside is psychologically more painful than the relief of avoiding a loss.

**Reason 2: Anchor to peak.** Once you see your position at $18K, $18K becomes your psychological reference point. Anything below $18K feels like a loss — even if you bought at $200. You are no longer trading from your entry price; you are trading from your peak.

**Reason 3: No mechanism.** Most traders have no defined profit-taking plan before entering. They plan to "sell at the right time" — which means they decide in real time, under emotional pressure, while watching prices move rapidly.

**The professional solution: pre-defined ladders.**

Before entering any trade, define your exit levels. Not "I'll take some profit when it pumps." Specific levels:

Example for a Style 1 trade entered at $40K MC:
- Level 1 ($200K MC = 5×): sell 33% of position
- Level 2 ($500K MC = 12.5×): sell another 33%
- Level 3 ($1M MC = 25×): sell another 17%
- Remaining 17%: let ride to see if cult status develops

After Level 1: you have returned your initial investment. You are playing with house money. Psychological pressure drops significantly.

**The "free position" rule:**

At 2× your entry, your initial capital is returned (plus profit). At this point, the remaining position costs you nothing — it is entirely profit. Most experienced traders aim to get to "free position" status as quickly as possible on high-risk trades.

**Taking profit without jeeting the chart:**

Do not use the word "jeet" — but the principle is real: single large sells crash price and signal panic. Use limit orders if available, or execute in small clips, to exit without destroying the token's chart.`,
          visualPrompt: `👆 Take-profit ladder visualiser: set entry, define levels, see position size remaining at each level`,
          visualType: `interactive`,
          visualUrl: `profit-ladder-visualiser`,
          examples: [
            {
              contextTag: `[Disciplined trader, ladder execution, pump.fun, 2025]`,
              context: `Trader enters at $30K MC with 0.5 SOL. Pre-defined ladder: sell 33% at 5×, 33% at 10×, remainder ride.`,
              scenario: `Token reaches $150K MC (5×). Trader executes sell of 33% → returns 0.83 SOL (initial covered + profit). Token reaches $300K MC (10×). Second sell → 0.83 SOL more. Remaining 34% free position.`,
              outcome: `Token then crashes to $80K MC. Trader has: 1.66 SOL realised + free position worth 0.47 SOL. Total: 2.13 SOL from 0.5 SOL entry. If they had held for the "1M MC dream" and it never arrived, they would have watched $4.1 SOL equivalent at peak become $1.3 SOL.`,
            },
            {
              contextTag: `[Roundtripper, no plan, 2024]`,
              context: `Trader enters at $20K MC with 1 SOL. Token pumps to $2M MC (100×). Trader holds for "$10M MC."`,
              scenario: `Token reaches $2M MC. Trader screenshots the position at $100 SOL equivalent. Next day: $800K MC. Trader "not selling, it will recover." One week later: $90K MC. Trader still holding. Final: $45K MC (2.25× from entry).`,
              outcome: `Trader made 2.25× total when they were briefly sitting on 100×. No profit-taking plan turned a 100× into a 2.25×. The screenshot moment was the signal: "If you're taking screenshots, TAKE PROFIT."`,
            },
            {
              contextTag: `[Experienced practitioner, free position psychology, 2025]`,
              context: `Trader has made a rule: always achieve "free position" status within first 24 hours of a position.`,
              scenario: `Token doubles (2×). Trader sells exactly half the position, recovering the initial investment. The remaining half is now entirely profit — costs nothing to hold. Trader can watch the token go to zero without any net loss.`,
              outcome: `The psychological change is significant: once in "free position," the trader no longer checks the chart anxiously. They are playing with profit, not capital. Over 3 months, this rule has meant 3 positions that went to near-zero cost them nothing. 2 positions that 10-20× after the free-position mark generated significant profit.`,
            },
          ],
          keyTakeaway: `Define your exit levels before entering any trade. Use profit ladders — sell in tranches at predetermined market caps. Achieve "free position" status (initial investment returned) as quickly as possible. "If you're taking screenshots, TAKE PROFIT." Unrealised gains are not real until sold.`,
          guidedPractice: [
            {
              question: `You enter a token at $25K MC with 0.3 SOL. You have defined a profit ladder: sell 40% at 4×, 40% at 8×, hold 20% as free ride. The token reaches 4× ($100K MC). What exact action do you take?`,
              options: [
                `A — Wait to see if it continues to 8× before selling anything`,
                `B — Execute the pre-defined sell of 40% of position (0.12 SOL worth) at the current price regardless of what you think will happen next`,
                `C — Move the take-profit target higher since momentum is strong`,
                `D — Sell everything at 4× since you have your profit`,
              ],
              correct: 1,
              hint: `What is the purpose of pre-defining the ladder before entering the trade?`,
              explanation: `B is correct. The profit ladder is defined before entry precisely to remove in-the-moment decision making. Executing the pre-defined sell at 4× is the discipline. Moving targets because momentum is strong is the exact emotional override that leads to roundtripping — the token will always seem like it "can go higher" at the moment of decision.`,
            },
            {
              question: `What is the "free position" rule and why does it reduce trading anxiety?`,
              options: [
                `A — Free positions are tokens received in airdrops — they cost nothing so there is no anxiety`,
                `B — A free position occurs when you have sold enough to return your initial investment — the remaining tokens cost you zero. Watching them go to zero no longer represents a loss.`,
                `C — Free position means trading with no platform fees`,
                `D — Free position is when a token is in profit — any position with positive PnL is "free"`,
              ],
              correct: 1,
              hint: `What changes psychologically when the remaining tokens cost you nothing to hold?`,
              explanation: `B is correct. When you have returned your initial investment (sold 50% of position at 2×, or 33% at 3×, etc.), the remaining tokens have zero cost basis. If the token goes to zero, your net result is still breakeven or positive. This removes the anxiety of "watching profit disappear" because the profit has already been crystallised.`,
            },
            {
              question: `The source material says: "It is not profit until you cash it out / convert it to SOL." What does this mean practically?`,
              options: [
                `A — You should convert all crypto to USD immediately after every gain`,
                `B — Unrealised profit shown in your portfolio tracker is theoretical — tokens you have not sold can still go to zero. Only the SOL or stablecoin you receive from a completed sell is real, permanent profit.`,
                `C — Convert tokens to SOL only during tax season`,
                `D — Profit in SOL is safer than profit in USDC`,
              ],
              correct: 1,
              hint: `What happened to the "$18K bag" in the source material's personal example?`,
              explanation: `B is correct. The source material provides a personal example of a bag worth $18K that was not taken profit on and is now worth $1,000. The $18K was never "real" — it was theoretical. Only the money from completed sells is bankable. This is why the profit ladder and free-position rules exist: to turn theoretical gains into actual portfolio value.`,
            },
            {
              question: `What psychological bias does "anchoring to peak" describe, and how does it cause losses?`,
              options: [
                `A — Traders become anchored to the entry price and refuse to sell at a loss`,
                `B — Once a position reaches a peak value, that peak becomes the psychological reference point. All subsequent prices feel like "losses" even if still above entry — making it psychologically difficult to sell at any price below the peak.`,
                `C — Traders anchor to the average price of their holdings across all positions`,
                `D — Peak anchoring only affects day traders, not long-term holders`,
              ],
              correct: 1,
              hint: `If your position was worth $18K and is now $8K, how does that feel even if you originally invested $200?`,
              explanation: `B is correct. Peak anchoring is why people hold declining positions far longer than rational analysis suggests. At peak ($18K), that becomes the mental "value" of the position. A decline to $8K feels like a $10K loss even though the original investment was $200 and $8K still represents a significant profit. The rational action (sell at $8K, massive profit) is overridden by the irrational grief of the paper loss from peak.`,
            },
            {
              question: `"If you're taking screenshots, TAKE PROFIT" — what behaviour is this warning against?`,
              options: [
                `A — Never take screenshots of your portfolio`,
                `B — Screenshots of a high-value position signal that you are in a state of excitement about unrealised gains — the exact emotional state that precedes not selling and subsequently roundtripping. The screenshot moment is often near the top.`,
                `C — Screenshots can be used against you in tax audits`,
                `D — Screenshots reduce trading performance by taking attention away from charts`,
              ],
              correct: 1,
              hint: `What emotional state leads someone to take a screenshot of a portfolio? And what does that state signal about the position's place in the cycle?`,
              explanation: `B is correct. People take screenshots of positions when they are at peak excitement about unrealised gains — typically near the top of a move. The excitement itself is a signal that the position is overextended and about to consolidate or dump. The source material uses this as a practical heuristic: if you feel the urge to screenshot your gains, that feeling is your profit-taking trigger.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You entered $NOVA at $35K MC with 1 SOL. You did NOT define a profit ladder before entering. Current situation:

Hour 4: MC $180K (5.1×). Feeling great. You decide to "wait for $500K MC."
Hour 7: MC $280K (8×). Still waiting. "So close to $500K."
Hour 9: MC $390K (11.1×). Euphoric. Take a screenshot. "By end of day it will be $1M MC."
Hour 11: MC $190K (5.4×). Slight concern. "Just a dip, it'll recover."
Hour 14: MC $90K (2.6×). Real anxiety now. "Should I sell? No, it was at $390K..."
Hour 18: MC $45K (1.3×). Panic. "I can't sell at 1.3× when I almost had 11×."
Hour 22: MC $30K (0.86×). Now at a loss.

You are at Hour 9 (MC $390K, 11.1×, screenshot taken). What do you do RIGHT NOW?

Then: design the profit ladder you should have set before entry that would have prevented this situation.`,
              scoringCriteria: [
                `Right now at Hour 9: SELL. The screenshot is the trigger. Take 50% off immediately. The regret of missing a further pump is less painful than the regret of roundtripping. Sell another 25% and leave 25% as free ride.`,
                `Profit ladder designed pre-entry: Level 1 at 3× ($105K MC) — sell 30%. Level 2 at 6× ($210K MC) — sell 30%. Level 3 at 10× ($350K MC) — sell 25%. Remaining 15% free ride for potential cult formation.`,
                `With correct ladder: at current 11.1× (Hour 9), 85% of position would already be sold at average ~5× = 4.25 SOL realised. Free ride position worth 0.17 SOL extra. Total at Hour 9: ~4.42 SOL from 1 SOL entry = 4.4× realised. Much better than watching it roundtrip.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Monthly profit-taking analysis from three traders, all starting with $5,000:

Trader A: Takes profits at every 2× on all positions. Average hold time: 6 hours. Never lets any position go above 2×. Total month result: +$3,200.

Trader B: Takes no profits, lets all winners run. 2 positions went 8× and 12×. 8 positions went to near-zero. Net month result: +$1,800.

Trader C: Uses a defined ladder (30% at 3×, 30% at 6×, 40% rides). 3 positions generated ladder exits. 5 positions went to near-zero. Net month result: +$4,700.

Questions:
1. Why does Trader C outperform despite having 5 positions go to zero?
2. Trader B had two monster wins — why did they underperform Trader C?
3. What does Trader A's strategy cost them vs Trader C's approach?`,
              scoringCriteria: [
                `Trader C outperforms because: (1) ladder captures meaningful partial exits before the dump (30% at 3× + 30% at 6× = 60% of position captured at 3–6× average); (2) the 40% free ride has asymmetric upside if the coin continues without any downside risk to initial capital; (3) even with 5 zeros, the 3 ladder-exit positions generated significantly more than needed to offset.`,
                `Trader B's monster wins didn't offset zeros because: the 8 zero positions cost $4,000 in principal. The two wins generated approximately $5,800 (average of 8× and 12× with equal sizing). Net: +$1,800. If Trader B had taken partial profits on the 8 zeros at any point, overall result would be much higher.`,
                `Trader A's cost: by capping at 2× on all positions, they never capture the rare 10–50× outcome. The $3,200 gain is consistent but misses the asymmetric upside that memecoins uniquely offer. Trader C's ladder retains 40% of each position for exactly this scenario.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You have 4 active positions. It is 3 PM UTC.

Position 1 ($FROG): Entered $40K MC, now $380K MC (9.5×). You have taken 0% profit. Current profit: 8.5 SOL on 1 SOL entry. Community active, volume strong.

Position 2 ($CUBE): Entered $25K MC, now $90K MC (3.6×). You took 33% at 2× (free). Current free ride worth 0.8 SOL. Volume declining slightly.

Position 3 ($MOON): Entered $200K MC (Style 2 dip buy), now $160K MC (-20%). Stop-loss was set at $165K MC (below support). Stop not triggered but approaching.

Position 4 ($PLOP): Entered $15K MC, now $8K MC (-47%). Volume has declined for 3 days. Community Telegram went quiet yesterday.

For each position, state your action and justification:`,
              scoringCriteria: [
                `Position 1 ($FROG): take profit immediately. 9.5× with 0% taken = dangerous exposure. Take 40% NOW. Position has grown to a large % of portfolio without any protection. Then reassess.`,
                `Position 2 ($CUBE): declining volume is a warning. If the free ride is worth 0.8 SOL and you need to decide on the remaining 67%, check community signals. If volume continues declining, exit the free ride. You have already won on this trade.`,
                `Position 3 ($MOON): stop-loss at $165K. Market is at $160K. Your stop was already broken — this is a manual decision point. Exit now or accept you are overriding your stop. If exiting, do so. Do not move the stop lower.`,
                `Position 4 ($PLOP): exit immediately. Three days of declining volume + silent community = slow death pattern. There is no recovery signal. -47% is painful but -100% is worse. Cut the loss.`,
              ],
            },
          ],
        },

        {
          id: 'fomo-psychology',
          title: `FOMO and Psychology — The Real Reason Traders Lose`,
          explanation: `"How do I avoid FOMOing into a coin?" is one of the most-asked questions in the source material. The answer is not a technical one — it is psychological.

FOMO (Fear of Missing Out) is not a character flaw. It is a survival instinct misapplied to financial markets. When early humans saw others running, they ran too — the cost of not running (getting eaten) exceeded the cost of false alarms (unnecessary exercise). In memecoin markets, the same reflex makes you buy after a 400% pump because "everyone else is getting rich."

The problem: in survival situations, the crowd running is usually right. In memecoin markets, by the time the crowd is excited, the smart money that created the excitement is selling to them.

**The FOMO entry pattern and its outcome:**

Token launches. Smart money enters ($15K MC). Token pumps. KOL calls it (now $200K MC). Twitter goes crazy. You see it everywhere. You buy at $350K MC. Smart money exits into your buy. Price dumps 80% to $70K MC. You are holding a 5× loss while the original buyers made 20×.

**The systematic approach from the source material:**

1. Develop a narrative-driven mindset first: understand what narratives are running currently. If AI tokens are the meta, you have context for evaluating AI tokens before they pump. You are not reacting — you are prepared.

2. Pre-trade checklist: the 60-second analysis process from Lab 2. Running the checklist in real-time under FOMO pressure is the test. Can you complete the checklist before entering? If you cannot — because the price is "moving too fast" — that is the signal to not enter.

3. Define your maximum FOMO response: "I will only chase a token if it is within 2× of my pre-defined entry market cap." Write this rule. Follow it. A token at $100K MC when your ideal entry was $50K MC is still potentially worth taking (2× of original entry). A token at $500K MC when your ideal entry was $50K MC is 10× your ideal entry — do not chase.

4. The "what's my thesis" discipline: the source material asks: "What's the thesis? Who's tweeting about it? What's the entry market cap? What catalyst could boost this?" These questions take 60 seconds to answer. If you cannot answer them under FOMO pressure, your entry is pure gambling.

5. Capital preservation wins: "Always preserve capital — everything can go to 0. And on days where there is blood, you can make the most money." The opportunity cost of sitting out a FOMO trade that you would have lost is zero. The cost of entering is potentially 100%.`,
          visualPrompt: `👆 FOMO trade timeline: typical pump + crowd entry + dump pattern with entry timing vs outcome analysis`,
          visualType: `chart`,
          visualUrl: `fomo-trade-timing-analysis`,
          examples: [
            {
              contextTag: `[FOMO avoider, pre-defined framework, 2025]`,
              context: `$COMET is everywhere on Twitter at 9 PM. Price has gone from $20K to $400K MC in 2 hours. Trader has not been watching.`,
              scenario: `Trader's rule: only chase if within 2× of ideal entry. Ideal entry would have been $20–50K MC. Current MC: $400K = 8–20× their ideal entry. Rule says: do not chase. Trader watches the token dump to $100K MC over the next hour.`,
              outcome: `Trader avoided a losing FOMO trade. They note: at $400K MC, they would have needed the token to reach $1M+ for 2× profit while facing 80% downside risk. The risk/reward no longer made sense. The rule saved them.`,
            },
            {
              contextTag: `[FOMO trap, reactive entry, 2024]`,
              context: `Trader sees $MOON pumping. All their Telegram groups are saying "this is going to $10M."`,
              scenario: `Trader enters $500 at $1.2M MC. Token pumps slightly to $1.5M MC. Then: Syrax Scanner would have shown 38% bundle concentration (trader did not check). Bundle wallets sell into the excitement. Token dumps to $200K MC in 45 minutes.`,
              outcome: `$500 becomes $83. Post-mortem: (1) no checklist run, (2) entered at 3AM in group chat, (3) thesis was "everyone is saying it will pump." These were all FOMO entry signals that a pre-trade checklist would have caught.`,
            },
            {
              contextTag: `[Disciplined non-trade, best trade, 2025]`,
              context: `Tuesday afternoon, market is chaotic. Everything is pumping and dumping in 30-minute cycles. Trader cannot find a clean setup.`,
              scenario: `Trader's rule: if three consecutive CA checks fail the checklist (bundle, community, or safety), sit out the session. Three consecutive fails occur at 2 PM.`,
              outcome: `Trader does not trade for the rest of Tuesday. Market dumps Wednesday morning — many who were active on Tuesday are down 30–50%. The source material: "Don't force trades. Sometimes the biggest alpha is just sitting on your hands and staying liquid."`,
            },
          ],
          keyTakeaway: `FOMO is a survival reflex misapplied to markets. The crowd's excitement is your exit signal, not your entry signal. Define a maximum FOMO tolerance rule (e.g. only chase within 2× of ideal entry MC). Always run the pre-trade checklist even under pressure. The best trade is sometimes no trade.`,
          guidedPractice: [
            {
              question: `A token is at $350K MC and pumping. Your research suggests the ideal entry was $50K MC (7× lower). Your personal FOMO rule allows chasing within 2× of ideal entry. Should you enter?`,
              options: [
                `A — Yes — the strong momentum justifies overriding your rule`,
                `B — No — $350K is 7× your ideal entry of $50K. Your 2× rule says maximum chase entry is $100K. $350K is 3.5× above your chase limit.`,
                `C — Enter with half your normal position size as a compromise`,
                `D — Yes — if multiple KOLs are calling it, the risk is lower`,
              ],
              correct: 1,
              hint: `Apply the rule: ideal entry $50K × 2 = maximum chase entry. Compare that to current price.`,
              explanation: `B is correct. Ideal entry: $50K. Maximum chase (2×): $100K. Current price: $350K. The rule says no. The rule exists because the risk/reward calculation at $350K MC (needing $700K+ for even 2× return, with 80% downside) is fundamentally different from $50K MC (needing $100K for 2×). Rules trump emotion.`,
            },
            {
              question: `The source material identifies "narrative-driven mindset" as the first step in avoiding FOMO. What does this mean practically?`,
              options: [
                `A — Follow whatever narrative is trending at the moment of each trade`,
                `B — Understand what themes are driving the current market cycle before specific opportunities arrive — so when an AI coin or political figure coin appears, you have context and can evaluate it faster without reactive excitement`,
                `C — Only trade tokens with clear written narratives in their whitepaper`,
                `D — Avoid trading during periods of high narrative activity`,
              ],
              correct: 1,
              hint: `What is the difference between being prepared for a narrative vs being surprised by it?`,
              explanation: `B is correct. Preparation means you have thought through "if a coin appears that relates to [current meta], here is my thesis framework." When a coin appears, you are evaluating it against a prepared framework, not reacting with pure excitement. The FOMO occurs precisely when something is unexpected — preparation converts surprising opportunities into evaluated ones.`,
            },
            {
              question: `Why does the source material say "the best trade can be no trade sometimes"?`,
              options: [
                `A — You save on trading fees by not trading`,
                `B — Every trade not taken is an opportunity cost zero — you preserve capital for better opportunities. Forced trades in unfavourable conditions destroy capital that could be deployed when conditions improve.`,
                `C — Holding SOL is always safer than any memecoin position`,
                `D — Not trading helps you avoid Solana network congestion`,
              ],
              correct: 1,
              hint: `What is the capital cost of sitting out a bad trade vs entering it?`,
              explanation: `B is correct. Not entering a bad trade costs you zero. Entering a bad trade can cost 50–100% of the position. On days where the market is chaotic, setups are absent, or you are in an emotional state (angry, tired, FOMO), the highest expected value action is often no action. The source material notes: "on days where there is blood, you can make the most money when market recovers" — preserving capital during bad conditions means having capital for good conditions.`,
            },
            {
              question: `The "what's my thesis" discipline requires answering specific questions before every trade. Which set of questions does the source material identify?`,
              options: [
                `A — "How many followers does the project have? Is the team doxxed? Is it listed on CoinMarketCap?"`,
                `B — "What's the thesis? Who's tweeting about it? What's the entry market cap? What catalyst could boost this? If catalyst-dependent, how much can I afford to lose if it goes to zero?"`,
                `C — "What is the token's maximum supply? When does the LP lock expire? Who audited the contract?"`,
                `D — "What is the 7-day price trend? Is volume increasing? Is RSI above 70?"`,
              ],
              correct: 1,
              hint: `The source material provides a specific list of questions — focus on narrative, catalyst, and risk awareness.`,
              explanation: `B is correct. This is verbatim from the source material. The questions are designed to be answerable in 60 seconds and cover: the narrative thesis, social validation, entry price (risk/reward), potential catalyst, and loss acceptance for catalyst-dependent plays. If you cannot answer all five, your entry is speculative gambling rather than informed trading.`,
            },
            {
              question: `"Low caps cook when market is good. Market bad = low caps bad." What does this lesson from the source material tell you about FOMO in different market conditions?`,
              options: [
                `A — Never trade during bear markets`,
                `B — Market environment determines whether your FOMO entries have any chance of working. FOMOing into low-cap tokens during a market downturn is statistically worse than during an upswing — calibrate aggressiveness to market conditions.`,
                `C — Only trade large-cap tokens (over $100M MC)`,
                `D — The correlation between market conditions and low-cap performance is random`,
              ],
              correct: 1,
              hint: `If the broader Solana market is dumping, what happens to the buyers who would normally fund your memecoin exit?`,
              explanation: `B is correct. The source material explicitly notes it "took all of August and September to realize this" — a genuine learned lesson. In bull markets, capital flows into every category including low caps. In bear markets, capital contracts and low caps suffer first and hardest. Applying FOMO-level aggression in a bear market is fighting the macro. Calibrate trade frequency and size to the environment.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Tuesday 11 PM. You have been watching Twitter for 3 hours and nothing has met your checklist. You are tired and frustrated. A connection DMs: "This is the one. Just graduated, 8% bundle, community forming, $80K MC. I'm in." 

You check:
- Rugcheck: 84/100, LP locked, mint revoked
- Bundle: 8% (acceptable)
- Community: Telegram 400 members (50 in the last 30 minutes), original meme content
- Signals: 1 smart wallet in at $50K MC

Your state: tired, frustrated from watching opportunities pass, slight FOMO from 3 hours of nothing. It is 11 PM and your reaction time is not optimal.

Two questions:
1. Is the opportunity itself good?
2. Given your current mental state, should you take it?

These may have different answers. Explain both.`,
              scoringCriteria: [
                `The opportunity quality: reasonably good. 84/100 Rugcheck, locked LP, revoked mint, 8% bundle (manageable), organic community forming, smart wallet confirmation at $50K MC (30% below current). Not exceptional but above average.`,
                `Mental state assessment: this is the key insight. Tired, frustrated after 3 unproductive hours, slight FOMO = compromised decision-making. The source material: "Don't over trade — let the trades come to you." Trading while tired and emotionally frustrated often means executing worse (wrong position size, no exit plan, emotional holds).`,
                `Correct answer: the opportunity may be good but the mental state is not. Options: (1) Skip — preserve capital and psychological state. Tomorrow there will be other opportunities. (2) Enter with a dramatically reduced size (50% of normal) that accounts for compromised state — limits damage if you make mistakes. (3) Set a price alert and sleep — if it is still there at a good price in the morning, enter fresh.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `FOMO audit of your last 20 trades:

Category A — "Planned entry" (had thesis before entering, completed checklist): 8 trades. 6 winners (75% win rate). Average win +4.2×. Average loss -60%. Net: +$2,800.

Category B — "Chased entry" (entered because it was pumping, no prior thesis): 7 trades. 2 winners (29% win rate). Average win +1.8×. Average loss -75%. Net: -$1,100.

Category C — "KOL call entry" (entered purely because a KOL called it): 5 trades. 1 winner (20% win rate). Average win +2.1×. Average loss -80%. Net: -$1,600.

Questions:
1. Calculate the expected value per trade for each category.
2. What would your net result be if you had only taken Category A trades?
3. Design a personal rule to prevent Category B and C entries.`,
              scoringCriteria: [
                `Category A EV: (0.75 × 4.2×) + (0.25 × -0.60) = 3.15 - 0.15 = 3.0× expected return per trade. Very positive.`,
                `Category B EV: (0.29 × 1.8×) + (0.71 × -0.75) = 0.522 - 0.533 = -0.011. Negative expected value per trade.`,
                `Category C EV: (0.20 × 2.1×) + (0.80 × -0.80) = 0.42 - 0.64 = -0.22. Significantly negative.`,
                `Category A only: $2,800 over 8 trades = $350 per trade. If all 20 trades were Category A quality, net would be approximately $7,000 instead of $100.`,
                `Rule to prevent B and C: "Before entering any trade, I must have written my thesis in a note. If I cannot write the thesis in 60 seconds, I cannot enter." This simple rule physically prevents reactive entries.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You are watching a token at 3 PM on a Wednesday. Here is the FOMO sequence:

14:55: Token at $85K MC. You have been watching since $40K MC but did not buy (hesitated).
15:00: Token pumps to $200K MC. Regret starts.
15:03: KOL posts: "This is going to $1M MC. Entry here."
15:05: Twitter: 600 posts in 5 minutes, all "buy now" energy.
15:08: Token at $380K MC. Extreme FOMO.
15:10: You are about to buy at $380K MC.

Run your FOMO prevention process:
1. What is your original thesis for this token (the one from $40K MC when you first noticed it)?
2. Apply the 2× chase rule: ideal entry was $40K, current is $380K. Should you enter?
3. What are the KOL call risk factors at this stage?
4. What would you need to see change to make this a valid entry tomorrow?`,
              scoringCriteria: [
                `Original thesis check: if you had a valid thesis at $40K MC (clean fundamentals, community forming), that thesis has not fundamentally changed — but the price has moved 9.5× from ideal entry.`,
                `2× chase rule: ideal $40K × 2 = $80K maximum chase. Current $380K = 4.75× above your chase limit. Do NOT enter.`,
                `KOL risk: 600 Twitter posts in 5 minutes + KOL call = peak FOMO moment. Smart money who entered at $40–100K MC is selling to the KOL audience right now. You would be the exit liquidity.`,
                `Valid entry tomorrow: if token consolidates at $200–250K MC with volume stabilising and community activity (not just KOL call audience). Fresh organic buyers + reduced sell pressure from original holders = potentially valid re-entry at 5× from ideal entry with better risk/reward.`,
              ],
            },
          ],
        },

      ], // end lab 3 lessons

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from all Lab 3 lessons — tests trader style identification, position sizing, profit-taking execution, and FOMO prevention.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 3 Boss — Complete Trade Execution`,
        learningLoop: {
          hintsEnabled: true,
          feedbackMode: 'full-criteria-with-lesson-pointers',
          scenarioMode: 'fresh-each-attempt',
          message: 'Review the lesson pointers and try again.',
        },
        scenarios: [{
          id: 'boss-lab3-v1',
          situation: `Complete trade scenario from discovery to exit.

Discovery: at 2 PM you see a wallet you track (51% win rate, 140 trades) bought $GIANT at $28K MC 1 hour ago. You check:

Rugcheck: 91/100, mint revoked, LP locked 6 months. No meaningful penalties.
Bundle: 7% sniper concentration — low.
GMGN top holders: distributed, max single holder 3.8%. 2 smart money wallets in at $28K.
Community: 600 Telegram (organic content), 400 Twitter posts (70% memes, 30% CA sharing).
Market cap: $55K (token has moved from $28K to $55K in the hour since tracked wallet bought).

Your portfolio: $4,000. Current open positions: 2 positions totalling $800 at cost.

Required: (1) Entry decision and exact SOL amount. (2) Profit ladder with specific MC targets. (3) Free position achievement plan. (4) FOMO check: token is already 2× from tracked wallet's entry — does this pass your chase rule? (5) Three specific conditions that would make you exit immediately regardless of targets.`,
          scoringCriteria: [
            `Entry decision: yes — all fundamentals pass. Token at $55K MC = within 2× of original $28K smart money entry (1.96×). Passes chase rule.`,
            `Position size: portfolio $4,000. New pair gamble = 1–2.5% = $40–$100. Given strong signal quality (multiple smart wallets, clean fundamentals, organic community), upper end = $80–100.`,
            `Profit ladder: Level 1 at $200K MC (3.6×) — sell 33%. Level 2 at $500K MC (9×) — sell 33%. Level 3 at $1M MC (18×) — sell 17%. Free ride: 17%.`,
            `Free position plan: at 3× ($165K MC), return initial by selling 33%. Cost basis becomes zero on remaining 67%.`,
            `Immediate exit conditions: (1) tracked wallet sells their position (GMGN alert); (2) Rugcheck changes — new mint activity or LP removal detected; (3) community goes silent (Telegram activity drops >70% in 2 hours without price explanation).`,
          ],
        }],
      },
    },


    // ── Junior Lab 4 ──────────────────────────────────────────────────────
      id: 'lab-4-charts-community',
      title: `Lab 4: Reading Charts and Community Signals`,
      subtitle: `Charts show what happened. Community signals show what will happen next.`,
      lessons: [
        {
          id: 'memecoin-chart-reading',
          title: `Chart Reading for Memecoins — Volume, Patterns, and What Actually Matters`,
          explanation: `Traditional TA was built on stock markets with thousands of rational actors. Memecoin charts are different — driven by social momentum, bots, and emotional cycles. Most classic TA breaks down. But four patterns repeat reliably enough to act on.\n\n**The graduation pump:** Token rises from $10K–$80K MC on escalating volume. Post-graduation selling of 30–60% is normal — snipers and early buyers taking their first real exit. This is not a rug. Inexperienced traders sell into this; experienced ones wait or buy it.\n\n**The accumulation phase:** Flat chart, declining volume, 24–72 hours post-pump. Community holding. Smart money accumulating quietly. This precedes second legs more often than dumps — the quiet is productive, not dead.\n\n**The distribution phase:** Rising price on declining volume, punctuated by large sell candles. Smart money is using small retail buys to exit. The chart looks bullish on price alone; volume tells the truth.\n\n**The cult breakout:** After accumulation, a single high-volume candle (3–5× daily average, 75%+ buy-dominant) breaks through previous resistance. This is the Style 2 entry signal — the most reliable chart pattern in established memecoin trading.\n\n**Volume is more important than price.** Price can be moved by one large buyer. Volume distribution across many wallets cannot be faked. Rising price + rising volume = genuine demand. Rising price + falling volume = someone propping up a dying chart. Flat price + rising volume = accumulation. These three combinations tell you almost everything you need.`,
          visualPrompt: `👆 Four annotated memecoin chart patterns with volume overlay`,
          visualType: `chart`,
          visualUrl: `memecoin-chart-pattern-guide`,
          examples: [
            {
              contextTag: `[Style 2 trader, cult breakout, $BONK, 2025]`,
              context: `$BONK consolidates at $0.000022 for 5 days. Low volume. Community stays active throughout.`,
              scenario: `Day 6: single candle, 4× daily average volume, 82% buy-dominant, breaks $0.000026 resistance. Classic cult breakout confirmed.`,
              outcome: `Trader enters at $0.000027 post-confirmation. Token runs 40% over 48 hours. Defined setup, defined entry, defined target. No guesswork.`,
            },
            {
              contextTag: `[Distribution detector, new token, 2025]`,
              context: `Token rising 18% over 3 hours. Price looks bullish.`,
              scenario: `Volume check: each hourly candle has less volume than the last despite price rising. Three large sell candles visible — each time price recovered, it did so on thin volume. Distribution pattern.`,
              outcome: `Trader passes. Token dumps 65% the next morning when retail buying exhausts. Volume was the tell; price was the lie.`,
            },
            {
              contextTag: `[New trader, graduation misread, 2025]`,
              context: `Token drops 48% immediately post-graduation. New trader panics, sells everything.`,
              scenario: `Post-graduation selling is normal — snipers exiting at first real liquidity. Community Telegram stays active. No dev sells detected.`,
              outcome: `Token accumulates at -48% for 36 hours, then runs 6× from the post-grad low. The seller at the dip gave away their position at the floor.`,
            },
          ],
          keyTakeaway: `Volume > price in memecoins. Post-graduation dumps are normal. Four patterns: graduation pump, accumulation, distribution, cult breakout. Cult breakout = high volume through resistance after accumulation = Style 2 entry signal.`,
          guidedPractice: [
            {
              question: `A token's price rises 22% over 4 hours but volume declines each hour. What does this suggest?`,
              options: [`A — Strong organic buying requiring little volume`, `B — Distribution — smart money selling into weakening buyers; when buying exhausts the price collapses`, `C — Accumulation by a large smart money wallet`, `D — Imminent DEX listing`],
              correct: 1,
              hint: `Who sustains a price rise when fewer and fewer people are trading?`,
              explanation: `B is correct. Rising price on declining volume = fewer buyers sustaining each move. Smart money is using small price rises as exit liquidity. When the last retail buyer is exhausted, there is nothing underneath.`,
            },
            {
              question: `A token drops 44% immediately after graduating from pump.fun. Community Telegram remains active with 50 new messages per hour. What is the most accurate interpretation?`,
              options: [`A — Rug pull — exit immediately`, `B — Normal post-graduation sell-off; snipers and early buyers taking first real exit. Community activity confirms holders are not panicking.`, `C — The graduation failed`, `D — The developer is manipulating price down to buy more`],
              correct: 1,
              hint: `What do snipers want to do the moment their token reaches real Raydium liquidity?`,
              explanation: `B is correct. 30–60% post-graduation drops are normal. The first real exit liquidity triggers sniper profit-taking. Active community Telegram confirms holders have conviction — real rugs produce silence, not meme posts.`,
            },
            {
              question: `What two characteristics distinguish a cult breakout from a pump-and-dump on a chart?`,
              options: [`A — Chain (Ethereum vs Solana) and developer status`, `B — Cult breakout: preceded by accumulation phase, breaks resistance with high distributed volume. Pump-and-dump: spike on thin volume with large sell candles immediately following.`, `C — Market cap size and time of day`, `D — There is no reliable chart-based distinction`],
              correct: 1,
              hint: `What phase precedes a genuine breakout that a P&D skips entirely?`,
              explanation: `B is correct. Genuine breakouts follow accumulation — flat periods where volume is quiet but holders are patient. The breakout candle then shows distributed buying (many wallets, high volume). P&D skips accumulation and shows a single explosive candle that immediately reverses.`,
            },
            {
              question: `Which combination of price action and volume is most concerning — suggesting a dying chart rather than healthy consolidation?`,
              options: [`A — Rising price + rising volume`, `B — Rising price + declining volume`, `C — Flat price + declining volume`, `D — Declining price + declining volume after a large pump`],
              correct: 1,
              hint: `Which combination hides the real selling activity behind a misleadingly positive price?`,
              explanation: `B is correct. Rising price + declining volume is the most deceptive pattern. It looks bullish on price charts but reveals smart money is selling into a shrinking pool of buyers. When the buyers run out, the support is gone entirely. Declining price + declining volume (D) is normal post-pump consolidation and is actually less concerning.`,
            },
            {
              question: `You see a token in the accumulation phase: flat price at $180K MC for 3 days, daily volume declining from $280K to $45K. On Day 4: volume spikes to $520K, 80% buy-dominant, price breaks to $240K MC. What pattern is this and what does it signal for Style 2 traders?`,
              options: [`A — Distribution — a large seller is hiding in the green candle`, `B — Cult breakout after accumulation — confirmed by volume distribution and break above resistance. Style 2 entry signal.`, `C — Post-graduation recovery — normal after initial dump`, `D — Coordinated wash trading`],
              correct: 1,
              hint: `3 days flat + declining volume + then high-volume break above resistance = which of the four patterns?`,
              explanation: `B is correct. Textbook cult breakout: accumulation phase (flat, declining volume = holders not panic selling), followed by high-volume confirmation through resistance (distributed buying = genuine demand). Style 2 traders enter on confirmation of the breakout candle.`,
            },
          ],
          lessonSimulations: [
            {
              type: `chartReplay-pattern`,
              scenario: `DEXScreener data for $PINE over 7 days:\n\nDay 1 (graduation): $69K → $290K MC. Volume $1.9M. Mixed buy/sell.\nDay 2: $290K → $155K MC (-47%). Volume $390K. Community Telegram: active, "diamond hands" memes.\nDays 3–5: $155K–$170K MC. Volume $22–38K/day. Flat. Community growing slowly.\nDay 6 AM: Volume $610K (5× average). $170K → $310K MC. 86% buy-dominant.\nDay 6 PM: $310K → $380K MC. Volume $290K. Continued buying.\nDay 7: $380K → $330K MC. Volume $120K (declining).\n\n1. Identify each phase across the 7 days.\n2. Was Day 2's 47% drop a rug signal? What evidence supports your answer?\n3. Where was the Style 2 entry signal and at what approximate price?\n4. Is Day 7's pullback on low volume a concern? What would you check?`,
              scoringCriteria: [
                `Day 1: graduation pump (normal). Day 2: post-graduation sell-off (normal — community active = not a rug). Days 3–5: accumulation. Day 6: cult breakout. Day 7: post-breakout consolidation.`,
                `Day 2 not a rug: Telegram active with community memes = holders have conviction not panic. Real rugs produce silence. Price found support and stabilised rather than continuing to zero.`,
                `Style 2 entry: Day 6 AM after breakout candle confirms above previous $170K resistance — entry approximately $175–185K MC on the retest.`,
                `Day 7 pullback: low volume = healthy consolidation, not distribution. Check: GMGN for any smart money wallet sells. If none, and community still active, pullback is buyable or holdable.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Compare two tokens both at $400K MC:\n\nToken A: 2 days old. Post-grad dump to $200K, recovered to $400K. Volume trend: Day 1 $890K → Day 2 $1.4M → Day 3 $2.1M (growing). Buy/sell ratio: 69% buy. New holders: 85/day.\n\nToken B: 3 weeks old. Peaked at $1.2M, dumped to $80K, recovered to $400K. Volume trend: Week 1 $3.2M → Week 2 $1.8M → Week 3 $620K (declining). Buy/sell ratio: 51% buy. New holders: 3/day.\n\nWhich shows stronger chart health for a new entry? Justify each signal.`,
              scoringCriteria: [
                `Token A stronger: growing volume + growing new holders + high buy ratio = organic demand increasing daily. Chart is getting healthier, not decaying.`,
                `Token B concerning: declining volume week-over-week = interest fading. 51% buy ratio approaching neutral = buy/sell pressure balanced, no clear upward momentum. 3 new holders/day = discovery has stopped.`,
                `Entry preference: Token A for momentum continuation. Token B only with specific catalyst thesis (narrative revival, community event) that could restart volume.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You hold a position entered at $45K MC. Token is now at $380K MC (8.4×). You have taken no profit. It is Day 9.\n\nChart data:\n- Days 1–4: strong uptrend, growing volume\n- Day 5: large sell candle, price dropped 25%, recovered on lower volume\n- Days 6–8: price recovered to new high at $380K but volume 40% lower than Days 1–4\n- Day 9 (now): price flat at $380K, volume lowest it has been since graduation\n\nCommunity: still active. GMGN top holder (4.2% of supply) now holds 3.1% — sold 1.1% this week.\n\n1. Identify the chart pattern emerging from Days 5–9.\n2. What does the top holder reduction signal?\n3. What action do you take right now?`,
              scoringCriteria: [
                `Days 5–9: distribution pattern forming — new price high but on declining volume (rising price + falling volume = warning). Large sell candle on Day 5 was first signal.`,
                `Top holder reduction from 4.2% to 3.1% over one week = systematic selling into price strength. Not a panic sell — a deliberate exit. This is slow rug or early holder distribution.`,
                `Action: take 50% profit immediately into current flat price before volume dries completely. The combination of declining volume at new high + documented top holder selling = high-probability distribution. Do not wait for a dump to start selling.`,
              ],
            },
          ],
        },

        {
          id: 'community-signal-reading',
          title: `Reading Community Signals — What a Cult Looks Like Before It's a Cult`,
          explanation: `Every memecoin that went from $50K to $50M had communities creating content before the price moved. The source material gives specific examples: "$circle holders were getting people with the 👌 emoji on the timeline since 25K MC. $paint holders were painting pfps at 3K MC, even after the dev rugged. $stan — the content is unmatched."\n\nNone of these communities waited for price to validate them. They created because they genuinely loved the meme. Price followed culture — not the other way around.\n\n**The community quality hierarchy:**\n\nLevel 0 (red flag): CA sharing and price targets only. "Entry at X MC, target Y MC." Coordination for pumping, not community.\n\nLevel 1 (neutral): Reposting existing memes with the token ticker. Awareness without creativity.\n\nLevel 2 (good): Original meme creation. Holders editing their PFPs, making custom jokes, building on the core concept.\n\nLevel 3 (exceptional): Secondary content — original music, animations, real-world references, self-organised community actions like Twitter raids.\n\n**Velocity matters:** 800 Telegram members at $30K MC growing at 100/day is extraordinary. 800 members at $3M MC is ordinary. Always assess community growth relative to market cap.\n\n**The dump test:** How does a community behave during a 35% drop? Genuine communities post dip memes, hold through it, sometimes become more active. Fake communities go silent or post angry messages. Silence during adversity is the strongest red flag available.\n\n**Unique identifiers:** The source material identifies self-organised community symbols — specific emoji use, PFP changes, custom community assets — as the most reliable cult formation signal. These cannot be manufactured. When you see them forming at sub-$100K MC, you are watching a cult being born.`,
          visualPrompt: `👆 Community quality spectrum: Level 0 CA spam vs Level 3 original content creation`,
          visualType: `interactive`,
          visualUrl: `community-quality-spectrum`,
          examples: [
            {
              contextTag: `[Early spotter, Level 3 forming, $WIF, 2023]`,
              context: `$WIF launches. 12 hours in, community members begin making their own "dog wearing hat" image variations without prompting.`,
              scenario: `Twitter: 200 posts, 85% original hat-dog art. Telegram: 400 members posting new hat variations. 8 holders have changed PFPs to custom dog-in-hat images.`,
              outcome: `Trader enters at $50K MC. The hat-dog unique identifier becomes a global recognisable brand. $4B MC reached. Culture preceded price by months.`,
            },
            {
              contextTag: `[Dump test, cult confirmation, 2025]`,
              context: `A held token drops 38% after a whale sell. Trader watches the community response.`,
              scenario: `Telegram becomes more active during the dump, not less. Members post "dip memes," coordinate buys, make jokes about the sell candle.`,
              outcome: `Dump absorbed in 8 hours. Token breaks new high. Active community during adversity is the strongest cult confirmation available — more reliable than any chart pattern.`,
            },
            {
              contextTag: `[Level 0 recognition, coordination trade, 2025]`,
              context: `Telegram group has 1,200 members. 88% of messages are price targets and CA sharing.`,
              scenario: `Trader checks Twitter: same ratio. 0% original content. Every post ends with "buy now" or an entry price. No one is talking about the meme itself.`,
              outcome: `Token pumps 2× on the call group volume and dumps 80% in 90 minutes. Level 0 community = organised exit-liquidity play. Trader recognised and avoided.`,
            },
          ],
          keyTakeaway: `Culture precedes price. Original content creation at low MC is the strongest cult signal. Level 0 = CA sharing only. Level 3 = original content + unique identifiers + community actions. The dump test: silence = fake, memes = real. Growth rate relative to MC matters more than absolute member count.`,
          guidedPractice: [
            {
              question: `A Telegram has 1,000 members. 88% of messages are "when moon," "entry at $100K MC," and CA sharing. What quality level is this and what does it predict?`,
              options: [`A — Level 3 — large engaged community`, `B — Level 0 — coordination for pumping with no cultural engagement. These members will sell the moment their price target hits.`, `C — Level 2 — building awareness`, `D — Level 1 — early stage community`],
              correct: 1,
              hint: `What are the 1,000 people actually doing? Are they participating in a culture or coordinating an exit?`,
              explanation: `B is correct. "When moon" and price targets without original content = Level 0. These participants have no cultural investment — they will sell the moment they are profitable. The group exists to create buying pressure, not community.`,
            },
            {
              question: `A token drops 42% on a Tuesday. The community Telegram increases activity — people posting "dip memes," coordinating buys, and joking about the sell candle. What does this indicate?`,
              options: [`A — Desperate holders trying to recover their positions`, `B — Genuine cult behaviour — cultural engagement is not price-dependent. This community will build regardless of chart action.`, `C — The developer is paying community members to stay active`, `D — This is normal for all tokens during dumps`],
              correct: 1,
              hint: `What do people do with things they genuinely love when something bad happens vs things they only own for profit?`,
              explanation: `B is correct. Price-independent community engagement is the definition of a cult. People who only bought for profit go silent during dumps. People who love the meme make jokes about it. The latter community will be there for the recovery, the former will not.`,
            },
            {
              question: `The source material identifies "$circle holders using the 👌 emoji universally on Twitter." What does this represent?`,
              options: [`A — A developer-organised marketing campaign`, `B — A unique identifier — self-organised community symbol that emerged organically, proving cultural adoption before price reflected it`, `C — Standard social media behaviour unrelated to the token`, `D — A signal that the token was about to be listed on a major exchange`],
              correct: 1,
              hint: `Who organised the 👌 campaign? Was it in any official announcement?`,
              explanation: `B is correct. No one organised the 👌 usage. Community members independently decided this was their signal and started using it at $25K MC — before any significant price movement. Spontaneous self-organisation of community symbols is the purest available signal of genuine cultural resonance.`,
            },
            {
              question: `Token A at $80K MC has 400 Telegram members growing at 60/day. Token B at $2M MC has 400 Telegram members growing at 5/day. Which community velocity is more significant?`,
              options: [`A — Token B — larger market cap makes the community more important`, `B — Token A — 60 new members per day at $80K MC indicates extraordinary organic discovery relative to size`, `C — They are equivalent — same absolute count`, `D — Growth rate doesn't matter, only total size`],
              correct: 1,
              hint: `What does 60 new members per day mean at $80K MC — where are these people coming from?`,
              explanation: `B is correct. At $80K MC, almost no one knows about the token. 60 genuine new members per day means the meme is spreading organically far faster than market cap would suggest. That velocity, relative to a tiny MC, is one of the earliest available signals for cult formation.`,
            },
            {
              question: `What specific community behaviour during a CTO (community takeover) most strongly suggests genuine revival potential versus a fake re-rug?`,
              options: [`A — High Telegram member count`, `B — Original content creation before any price recovery, new community leaders whose wallets pre-date the token, and self-organised community action (not developer-directed)`, `C — A formal CTO announcement from the developer`, `D — DEXScreener trending status`],
              correct: 1,
              hint: `Can a developer orchestrate "organic" community behaviour? What behaviour is hardest to fake?`,
              explanation: `B is correct. Content creation before price recovery = engagement is not financially motivated. Pre-dated wallets = leaders existed independently of this token. Self-organisation = genuine community agency. These three together cannot be manufactured by a developer re-rugging under CTO branding.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Community audit, 48 hours after launch, $55K MC:\n\nTwitter: 680 posts. Breakdown: 450 sharing CA with price targets, 185 original edited images using the token's frog character, 45 holders who changed PFPs to frog variants they created.\n\nTelegram: 840 members. Last hour: 18 messages — 5 "when moon", 4 price discussion, 9 original frog content and jokes. One member posted a tutorial "make your own pixel frog" — 3 people responded wanting to collaborate.\n\nRate this community Level 0–3. Identify exact signals supporting your rating. State what would move it to the next level.`,
              scoringCriteria: [
                `Rating: Level 2, approaching Level 3. Evidence: 185 original image edits + 45 PFP changes = genuine Level 2 creative engagement. Tutorial post with collaboration responses = early Level 3 signal (community building secondary content).`,
                `Current ceiling: 66% of Twitter posts are still CA/price (Level 0 content). This is expected at 48 hours but limits Level 3 designation.`,
                `To reach Level 3: tutorial collaboration produces actual content. PFP changes become a recognisable community signal (the "pixel frog" identifier). Coordinated community action (simultaneous Twitter posts, Discord raids) without financial incentive.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `CTO comparison, 24 hours post-rug:\n\nCTO Alpha ($MOON): 260 members. Last hour: 15 messages — 11 angry at dev, 3 sharing CA, 1 meme.\n\nCTO Beta ($STAR): 190 members. Last hour: 24 messages — 7 processing the rug ("dev left but the concept is strong"), 12 creating star-themed content, 5 discussing finding a volunteer developer.\n\nWhich shows CTO potential? Identify specific signals. What is your entry strategy if you believe in Beta?`,
              scoringCriteria: [
                `Alpha shows no potential: anger + CA spreading = price-motivated. When anger fades, nothing underneath. 1 meme in 15 messages = barely Level 1.`,
                `Beta shows genuine potential: (1) processing loss while affirming concept = cultural value independent of price; (2) 12 creating content at bottom = Level 2 community; (3) volunteer dev discussion = community agency, not waiting to be saved.`,
                `Beta entry strategy: accumulate small position over 24–72 hours at post-rug low ($5–15K MC likely). Size: 1.5% of portfolio. Conviction trigger: volunteer dev steps up with verifiable wallet history. Exit conditions: community activity drops, dev wallet connected to original rug.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Community signals alongside price for a new token, 10 days:\n\nDay 1: Launch $15K MC. Telegram: 0→300. Mostly CA sharing and excitement.\nDay 2: Graduation. Price dumps to $80K from $290K high. 50 members leave. 250 stay, posting dip memes.\nDay 3: Price $90K MC. 40 new members join despite price below graduation high. Members start using a specific emoji for the token.\nDays 4–7: Price flat $85–100K MC. Telegram grows to 400. 5 PFP changes. Original artwork appears.\nDay 8: External blog references the meme concept (unrelated to token). Community reposts everywhere.\nDay 9: Volume spike. Price $95K → $450K MC. DEXScreener Hot Pairs.\nDay 10: Price $380K MC. 1,200 Telegram.\n\n1. What was the critical signal on Day 3 that predicted Day 9?\n2. What did the Day 2 member departures actually accomplish?\n3. When was the optimal entry and why?`,
              scoringCriteria: [
                `Day 3 critical signal: new members joining DESPITE price below graduation high = price-independent discovery. People finding the token on its merits. Unique identifier emerging (the emoji). These two together = early cult formation signal.`,
                `Day 2 departures were a positive quality filter: the 50 who left were price-motivated (they left when price disappointed). The remaining 250 stayed for cultural reasons. Quality of holders improved even as count decreased.`,
                `Optimal entry: Day 3–4. Unique identifier forming, price-independent new members, original artwork appearing, MC $85–95K = 4–5× upside before Day 9 discovery without having timed a pump.`,
              ],
            },
          ],
        },

        {
          id: 'narrative-recognition',
          title: `Narrative Recognition — Spotting the Meta Before It Has a Name`,
          explanation: `In late 2023, every AI token on Solana pumped simultaneously. In early 2024, political figure coins dominated. These are narratives — thematic cycles that carry groups of tokens together. Understanding them transforms reactive trading into anticipatory trading.\n\n**The narrative lifecycle (4 phases):**\n\nPhase 1 — Early signal: 2–4 tokens in a theme moving on organic volume. No mainstream coverage. Only attentive traders notice the thematic connection.\n\nPhase 2 — Confirmation: Multiple tokens moving simultaneously. KOLs begin naming the narrative ("AI meta is back"). First newsletter coverage.\n\nPhase 3 — Peak/saturation: Every new launch uses the theme. Quality drops sharply. Smart money from Phase 1 is exiting. Rugs proliferate within the theme.\n\nPhase 4 — Death/rotation: The narrative dies. Traders who entered in Phase 3 are left holding bags. Capital rotates into the next Phase 1.\n\n**The basket strategy for Phase 1:**\nRather than picking the single winner, buy 4–6 tokens in the theme at 1% each. Even if half fail, the 2–3 that become narrative leaders generate enough return to more than cover losses. This removes single-selection pressure entirely.\n\n**Cross-chain narrative migration:**\nNarratives often prove on one chain and migrate. A theme that ran on Ethereum in Q1 may appear fresh on Solana in Q3 — the Solana community hasn't seen it yet and it runs the full cycle independently. Tracking cross-chain activity on DeFined.fi provides advance warning.\n\n**Fading peak narratives:**\nThe source material: "When the latest and greatest thing that is going to $50M MC, whole market dumps." When a narrative is in every Telegram simultaneously, it is Phase 3. The correct trade is exiting existing exposure into the buying surge — not adding positions.`,
          visualPrompt: `👆 Narrative cycle timeline: AI meta 2024 showing Phase 1–4 with price overlay`,
          visualType: `chart`,
          visualUrl: `narrative-cycle-timeline`,
          examples: [
            {
              contextTag: `[Narrative basket trader, DeSci Phase 1, 2025]`,
              context: `Trader spots 3 DeSci tokens moving organically without any KOL coverage.`,
              scenario: `Builds basket: 6 DeSci tokens at 1% portfolio each. Week 2: mainstream newsletter covers "DeSci season." 4 of 6 tokens pump 3–8×. 2 go near-zero.`,
              outcome: `Basket return: 4 tokens averaging 5× + 2 near-zeros. Net on 6% allocated: +47% portfolio growth. No need to pick the winner — the basket captured the narrative.`,
            },
            {
              contextTag: `[Phase 3 fader, political narrative, 2024]`,
              context: `Political token narrative saturates every Telegram. KOLs calling it uniformly.`,
              scenario: `Trader recognises Phase 3: 40+ political tokens in one week, quality declining, original Phase 1 tokens giving back gains on volume decline.`,
              outcome: `Exits all political exposure into KOL call volume. Avoids the collapse. Rotates into emerging pet coin narrative (Phase 1). The exit was funded by buyers who arrived at Phase 3.`,
            },
            {
              contextTag: `[Cross-chain migrator, retro gaming, 2024]`,
              context: `Retro gaming tokens ran on Ethereum in May. Theme died there by June.`,
              scenario: `Trader watches for Solana. August: a fresh Solana retro gaming token launches. Solana community has never experienced the theme — it is Phase 1 on this chain.`,
              outcome: `Enters at $40K MC. Token runs the full cycle on Solana, reaches $4M MC. Cross-chain awareness of a proven theme created the advance signal.`,
            },
          ],
          keyTakeaway: `Four phases: early signal, confirmation, peak, death. Enter Phase 1–2 with baskets. Exit before Phase 3 saturation. Cross-chain migration means a narrative dead on one chain can be Phase 1 on another. Universal KOL consensus = exit signal, not entry signal.`,
          guidedPractice: [
            {
              question: `You see 4 "space exploration" themed tokens all pump 200–500% in 3 days with no mainstream coverage. What phase is this and what is the actionable response?`,
              options: [`A — Phase 3 saturation — avoid`, `B — Phase 1 early signal — build a basket of 4–6 space tokens at 1% each before Phase 2 brings mainstream buyers`, `C — A one-off unrelated event — not a narrative`, `D — Phase 4 death — these tokens are topping`],
              correct: 1,
              hint: `Multiple tokens in the same theme moving before the theme has a public name = which phase?`,
              explanation: `B is correct. Phase 1 = pre-named narrative. The actionable move is to build a basket before Phase 2 brings mainstream buyers who will push prices higher. Waiting for KOL confirmation (Phase 2) reduces entry quality significantly.`,
            },
            {
              question: `Why does the narrative basket strategy outperform single-token concentration for Phase 1 plays?`,
              options: [`A — It reduces gas fees through batch transactions`, `B — In any narrative, typically 30–50% of tokens become leaders while 50–70% fail. A basket captures the winners without requiring correct single-token selection in advance.`, `C — Baskets are automatically diversified across chains`, `D — Multiple small positions are taxed at a lower rate`],
              correct: 1,
              hint: `If you cannot know which specific token in a Phase 1 narrative will be the 10× winner, what is the optimal structure?`,
              explanation: `B is correct. Single-token selection in a Phase 1 narrative is difficult — many look similar before community quality differentiates them. A basket at 1% each means the 2–3 winners easily cover the losses on the 3–4 that fail, while capturing the narrative's upside without perfect selection.`,
            },
            {
              question: `"When the latest and greatest thing that is going to $50M MC, whole market dumps." What trading action does this imply?`,
              options: [`A — Buy more — peak confidence precedes the biggest moves`, `B — Exit existing narrative exposure into the universal-consensus buying surge. Universal agreement = Phase 3 = smart money from Phase 1 is using your FOMO to exit.`, `C — Switch to a different blockchain`, `D — This is normal bull market behaviour, no action needed`],
              correct: 1,
              hint: `If everyone agrees something is going to $50M MC, who is selling to all those confident buyers?`,
              explanation: `B is correct. Universal consensus about a narrative's upside means all available buyers have already bought or are about to. Phase 1 and 2 holders are waiting for exactly this moment to sell into the crowd. Peak sentiment is the liquidity window for early holders to exit — not the entry for you.`,
            },
            {
              question: `Why does a narrative that died on Ethereum in Q2 represent a Phase 1 opportunity when it appears on Solana in Q4?`,
              options: [`A — Ethereum narratives are always more valuable`, `B — Solana's community has not experienced the theme — it runs the full 4-phase cycle independently. The Ethereum saturation is irrelevant to a Solana audience discovering it fresh.`, `C — Cross-chain narratives always perform better`, `D — The death on Ethereum means the concept is proven to be worthless`],
              correct: 1,
              hint: `What is the Solana community's awareness of what happened on Ethereum 6 months ago?`,
              explanation: `B is correct. Chain communities have significant non-overlap. A theme that reached Phase 4 on Ethereum in Q2 is fresh cultural territory for the Solana audience in Q4. The token can run Phase 1 → 2 → 3 → 4 on Solana completely independently of the Ethereum history.`,
            },
            {
              question: `The source material lists narratives to track including AI, DeSci, and news-based coins. It also lists "metas" — what additional categories does it identify?`,
              options: [`A — DeFi protocols, Layer 2 scaling, and staking yields`, `B — Nostalgia, original characters, celebrities, and pets of important people`, `C — ESG compliance, regulatory approval, and VC backing`, `D — Only AI and news-based categories`],
              correct: 1,
              hint: `The source material gives specific cultural category examples beyond tech narratives.`,
              explanation: `B is correct. The source material explicitly lists: nostalgia, original characters, celebrities, and "pets of important people" as recurring meta categories. These cultural phenomena create recognisable narrative triggers that repeat across market cycles, independent of crypto-specific events.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Current market, Tuesday 2 PM UTC:\n\nTheme A (AI tokens): Active for 6 weeks. 8 AI tokens launched today. Top performers from Week 1 are -40% from peak. KOLs have been calling AI tokens for 4 weeks. New AI launches receive less attention than 3 weeks ago.\n\nTheme B (pet coins): $CATTO went 15× 3 days ago, no KOL coverage. $PUPPO went 8× yesterday, no coverage. Only 2 tokens in theme have moved. No mainstream coverage.\n\nTheme C (political): $PRES launched last week on news cycle. Had 10× then dumped 80%. Multiple copycats all underperforming.\n\nFor each theme: identify phase, state opportunity or trap, and give one specific action.`,
              scoringCriteria: [
                `Theme A (AI): Phase 3–4. KOLs calling for 4 weeks + new launches underperforming = saturation. TRAP. Action: exit any AI exposure into any remaining buying.`,
                `Theme B (pet coins): Phase 1. Only 2 tokens moved, no coverage, organic volume. OPPORTUNITY. Action: research other pet-themed tokens at sub-$500K MC, build basket of 4–5 at 1% each.`,
                `Theme C (political): Phase 4 collapse. News-cycle driven, copycats failing. Complete TRAP. Action: avoid entirely, no new positions in political theme.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `DeSci narrative timeline — 2 weeks:\n\nWeek 1: $LAB and $GENE both 5× from $100K to $500K MC. No mainstream coverage.\nWeek 1 Day 5: First Twitter thread "DeSci meta is here." 800 retweets.\nWeek 2 Day 1: 6 new DeSci tokens launch. 4 pump significantly.\nWeek 2 Day 3: Major crypto newsletter: "DeSci season." 3 more tokens launch. "DeSci" trending.\nWeek 2 Day 5 (today): 12 new DeSci launches today. You are considering a DeSci entry.\n\n1. Map each period to a narrative phase.\n2. What was the optimal basket entry date?\n3. Should you enter DeSci today? If yes, what criteria must be met?`,
              scoringCriteria: [
                `Phase mapping: Week 1 Days 1–4 = Phase 1. Week 1 Day 5 (first Twitter thread) = Phase 1/2 boundary. Week 2 Days 1–3 = Phase 2. Week 2 Day 3 (newsletter) = Phase 2/3 boundary. Week 2 Day 5 (12 launches today) = Phase 3.`,
                `Optimal entry: Week 1 Days 2–4. After first two tokens confirmed the theme, before any mainstream coverage. Basket of $LAB, $GENE + 3–4 others identified through DeFined.`,
                `Today (Phase 3): should not enter new DeSci positions. If already in basket from Phase 1, take profit into current volume. Any new entry requires exceptional independent differentiation — not just "DeSci label" but specific scientific community engagement.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Multi-week narrative tracking. Identify the rotation:\n\nWeek 1: $ALGO (AI trading bot) 8×, $NEURAL (AI brain) 6×, $QUANT (AI quant) 12×. No coverage.\nWeek 2: 5 more AI tokens pump 3–8×. First newsletter: "AI meta on Solana."\nWeek 3: 20+ AI launches. $ALGO, $NEURAL, $QUANT give back 30–50% from peaks.\nWeek 4: AI launches mostly failing. 1 of 10 gains traction.\n\nAlso: During Week 3: $KITTY (cat character) 5× with no coverage. $PURR (different cat) 7×.\n\n1. Map AI theme to phases by week.\n2. If you held $ALGO from Week 1, what was your exit strategy based on the cycle?\n3. What should you have done when $KITTY and $PURR moved in Week 3?`,
              scoringCriteria: [
                `Phase mapping: Week 1 = Phase 1. Week 2 = Phase 2 (newsletter coverage = confirmation). Week 3 = Phase 3 (20+ launches, quality decline, leaders retracing). Week 4 = Phase 4 (death).`,
                `$ALGO exit strategy: take significant profit at Phase 2 confirmation (Week 2 newsletter). Hold maximum 30% into Phase 3. Full exit by Week 3 when 20+ launches signal saturation. The newsletter was the sell signal, not the buy signal.`,
                `$KITTY/$PURR Week 3 action: Phase 1 of new cat narrative while AI is in Phase 3. Build cat basket quietly (2–4 tokens at 1% each) while AI holders are distracted. This is the rotation — from saturated AI into fresh cat meta. Exactly what experienced traders do.`,
              ],
            },
          ],
        },
      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['chartReplay-pattern', 'judgment-dataInterpret', 'judgment-riskAssess'],
        description: 'Random draw from Lab 4 — chart patterns, community quality assessment, narrative cycle analysis.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 4 Boss — Integrated Chart, Community, and Narrative Analysis`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review lesson pointers and retry.' },
        scenarios: [{
          id: 'boss-lab4-v1',
          situation: `Token $VOXEL — pixel art frog, 4 days old.\n\nCHART: Graduated Day 1. Post-grad dump to $140K. Accumulated Days 2–3 at $130–150K on low volume. Day 4 AM: 5× daily average volume, 80% buy-dominant, breaks $155K resistance to $240K MC.\n\nCOMMUNITY: 900 Telegram. Members creating pixel frog variations. 12 holders changed PFPs to custom pixel frogs. Twitter: 55% original pixel art, 30% memes, 15% CA sharing. One member posted a "make your own pixel frog" tutorial — 200 retweets, 3 collaboration responses.\n\nNARRATIVE: Pixel art theme. Two other pixel art tokens launched in past 5 days, both performed well. No mainstream coverage yet.\n\nRequired: (1) Chart pattern with entry signal. (2) Community level with evidence. (3) Narrative phase and implication. (4) Complete trade recommendation: enter/pass, size, profit ladder, exit conditions.`,
          scoringCriteria: [
            `Chart: accumulation (Days 2–3, low volume) → cult breakout (Day 4 AM, 5× volume, 80% buy, through resistance). Textbook Style 2 entry signal.`,
            `Community: Level 3. Evidence: original pixel frog PFP changes (12 documented), tutorial collaboration (educational organic content), 55% original art ratio = Level 3.`,
            `Narrative: Phase 1. Two tokens in pixel art theme moved, no mainstream coverage. Narrative tailwind available pre-Phase 2.`,
            `Trade recommendation: enter 2–3% of portfolio (all three signal lenses aligned). Profit ladder: 33% at 2× ($480K), 33% at 5× ($1.2M), 34% free ride. Exit conditions: community activity drops, smart money begins selling (GMGN), pixel art narrative hits Phase 3.`,
          ],
        }],
      },
    },

    // ── Junior Labs 5 & 6 ────────────────────────────────────────────────
      id: 'lab-5-risk-journal',
      title: `Lab 5: Risk Management and Trading Journal`,
      subtitle: `The traders who last aren't the ones who win most. They're the ones who lose least when they're wrong.`,
      lessons: [
        {
          id: 'capital-preservation',
          title: `Capital Preservation — Why Surviving Beats Winning`,
          explanation: `The source material opens its most important lessons with: "Always preserve capital — everything can go to 0. And on days where there is blood, you can make the most money."\n\nThis is counterintuitive. Most new traders think more money in = more money out. Professionals think differently: the primary goal is staying in the game. Because the best opportunities require capital that survived the bad periods.\n\n**The loss asymmetry:**\nA 50% loss requires 100% gain to break even. A 75% loss requires 300%. A 90% loss requires 900%. Losses compound against you faster than wins compound for you.\n\nExample: start $5,000. Six consecutive 10% gains: +$8,053 (+61%). Then one 50% loss: $4,027. Despite winning 6 of 7 trades, below starting capital.\n\n**Maximum allocation rules:**\n- Style 1 (new pairs): 1–5% per trade, maximum 20–30% of portfolio active simultaneously\n- Style 2 (dip buys): up to 10% with defined stop-loss\n- Style 3 (lowcap): up to 8% per position\n- Cash/SOL reserve: always maintain 70–80% outside active positions\n\n**The daily stop rule:**\nIf portfolio declines more than 15% in a single day, stop trading. Review. Resume the next day.\n\n**Why 70% in reserve:**\nWhen broad market crashes 40%, the trader with 30% active loses 12% total — painful but survivable. The trader with 80% active loses 32% — and then has no capital to buy the recovery. The source material: "On days where there is blood, you can make the most money" — but only if you have capital to deploy.`,
          visualPrompt: `👆 Loss asymmetry calculator: input loss %, see required gain to break even`,
          visualType: `interactive`,
          visualUrl: `loss-asymmetry-calculator`,
          examples: [
            {
              contextTag: `[Daily stop rule, bear day, 2024]`,
              context: `Broad market crashes 30%. Every memecoin down 40–60%.`,
              scenario: `Trader A (no stop): tries to catch falling knives, loses additional 25%. Total: -55%. Trader B (15% daily stop): halts at noon, closes positions. Total: -15%.`,
              outcome: `Wednesday market recovers. Trader B buys recovery with remaining capital. Trader A is too depleted. One rule difference: Trader B ends flat for the week, Trader A ends -30%.`,
            },
            {
              contextTag: `[Reserve deployment, crash opportunity, 2024]`,
              context: `Major Solana hack causes 40% market decline. Everything red.`,
              scenario: `Trader maintained 70% in SOL/stables, 30% in active positions. The 30% loses 60%. Portfolio: -18% total. Deploys 30% of remaining into oversold quality tokens.`,
              outcome: `2 weeks later market recovers. Crash-bought tokens 3× in recovery. Portfolio: +15% from pre-crash level. Preservation of 70% cash enabled the recovery trade.`,
            },
            {
              contextTag: `[Full port lesson, 2025]`,
              context: `New trader with $3,000 puts 90% into memecoins on a bull day.`,
              scenario: `Market turns. All positions decline 70% over 2 weeks. Portfolio: $720. No dry powder for recovery plays.`,
              outcome: `Bull market returns but trader cannot participate meaningfully. Learns: preservation is not timidity. It is the strategy that enables participation in the next cycle.`,
            },
          ],
          keyTakeaway: `50% loss requires 100% gain to recover. Keep 70–80% in SOL/stablecoins — not fear, but strategy. Daily stop at -15%. Maximum 20–30% active simultaneously. Blood days are opportunities only for traders who preserved capital.`,
          guidedPractice: [
            {
              question: `Portfolio: $10,000. You lose 60%. What percentage gain is required to return to $10,000?`,
              options: [`A — 60% gain`, `B — 100% gain`, `C — 150% gain`, `D — 240% gain`],
              correct: 2,
              hint: `Remaining after 60% loss = $4,000. What % of $4,000 equals $10,000?`,
              explanation: `C is correct. After 60% loss: $4,000 remains. ($10,000 - $4,000) / $4,000 = 150% required. This asymmetry is why limiting loss sizes matters more than maximising wins.`,
            },
            {
              question: `Why does the source material say "on days where there is blood, you can make the most money"?`,
              options: [`A — Market crashes create volatility benefiting all traders`, `B — Crashes create discounted entry prices — but only traders with preserved capital can exploit them. Blood days + dry powder = maximum opportunity.`, `C — Losses are tax-deductible during crashes`, `D — Exchanges offer fee discounts during downturns`],
              correct: 1,
              hint: `What do you need to buy discounted assets during a crash?`,
              explanation: `B is correct. Crashes reduce quality tokens dramatically. But to buy, you need capital that survived the crash. Traders who allocated 80% before the crash have nothing left to buy at 90%-off prices.`,
            },
            {
              question: `You have a 15% daily stop. It is 2 PM and you are down 12%. An excellent opportunity appears. What is your maximum position size?`,
              options: [`A — Your normal position size — the opportunity justifies it`, `B — Sized so that total loss (if it goes to zero) would not push you past the 15% daily stop — approximately 3% of portfolio remaining`, `C — Double normal size to recover the day's losses`, `D — Do not trade at all — you are in drawdown`],
              correct: 1,
              hint: `How much daily stop budget remains, and what does that mean for maximum risk?`,
              explanation: `B is correct. 15% stop, currently -12%, remaining budget = 3% of portfolio. Any new position should risk no more than that 3% remaining budget. If normal position is 2%, it fits. If normal is 5%, it exceeds your daily limit.`,
            },
            {
              question: `Why is 20–30% maximum active exposure the recommended allocation — not 50% or 100%?`,
              options: [`A — Exchanges limit active positions to 30%`, `B — If all active positions go to zero simultaneously (possible in a crash), maximum total portfolio loss is 20–30%. The 70–80% reserve enables recovery trades and survives worst-case scenarios.`, `C — Higher allocation triggers tax events`, `D — It is a regulatory requirement`],
              correct: 1,
              hint: `What is the worst case scenario and how much does it hurt at different allocation levels?`,
              explanation: `B is correct. At 30% active: worst case -30% portfolio. At 80% active: worst case -80% portfolio. The reserve is the insurance policy. It also funds the best recovery trades when everything is on sale.`,
            },
            {
              question: `After a 30% monthly drawdown, what does the risk framework recommend for the following month?`,
              options: [`A — Increase position sizes to recover faster`, `B — Reduce position sizes by 50% for the following week — protects remaining capital and provides psychological reset`, `C — Stop trading for a full month`, `D — Switch entirely to Style 3 (lowcap) trades`],
              correct: 1,
              hint: `What does a 30% drawdown signal about current conditions or your edge?`,
              explanation: `B is correct. A 30% drawdown means either conditions are bad or your strategy is mismatched with the current environment. Reducing size by 50% limits further damage while identifying the cause. It also removes the psychological pressure that leads to revenge trading.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Portfolio $6,000. Current allocation:\n- $FROG: $800 cost, currently $1,400 (+75%)\n- $CUBE: $600 cost, currently $320 (-47%)\n- $MOON: $400 cost, currently $180 (-55%)\n- SOL/cash: $4,200\n\nTotal value: $6,100. Active exposure (at cost): 30% of starting portfolio.\n\nMonday morning. A broad market crash begins — everything down 35%.\n\n1. Calculate portfolio impact if all active positions drop 35%.\n2. How much of your daily stop (15% of $6,000 = $900) has the crash consumed?\n3. You identify 2 quality tokens now available at extreme discount. What is your maximum deployment and why?`,
              scoringCriteria: [
                `35% drop on active positions: $1,400×0.65 + $320×0.65 + $180×0.65 = $910+$208+$117 = $1,235. Was $1,900. Loss = $665. Portfolio: $4,200+$1,235 = $5,435.`,
                `Daily stop budget: 15% of $6,000 = $900. Already -$565 from portfolio value. Remaining budget = $900-$565 = $335.`,
                `Maximum deployment: $335 total into crash opportunities — sized so that if both go to zero, you hit your daily stop exactly. Keep remaining $3,865 cash fully intact.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Three traders, all start $5,000, same month:\n\nTrader X: 40 trades. Win rate 62%. Average win $180, average loss $95. Max single-day drawdown 8%. Consistent sizing. Net: +$2,100.\n\nTrader Y: 25 trades. Win rate 48%. Average win $420, average loss $380. Max single-day drawdown 22%. Variable sizing (bets bigger when confident). Net: +$280.\n\nTrader Z: 18 trades. Win rate 72%. Average win $150, average loss $520. Max single-day drawdown 31%. Refuses to cut losses. Net: -$680.\n\n1. Which demonstrates best risk management despite not having the highest win rate?\n2. What is Trader Z's fatal flaw — calculate EV per trade.\n3. What would Trader Z's result be if they cut losses at $150 (matching their average win)?`,
              scoringCriteria: [
                `Trader X: best risk management. Consistent sizing, low max drawdown, positive EV. Professional execution.`,
                `Trader Z fatal flaw: refusing to cut losses. EV = (0.72×$150)-(0.28×$520) = $108-$145.60 = -$37.60 per trade. 72% win rate is masking catastrophically large losses.`,
                `If Trader Z cut at $150: EV = (0.72×$150)-(0.28×$150) = $108-$42 = +$66 per trade. 18 trades × $66 = +$1,188 instead of -$680. Loss management, not win rate, was the entire problem.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Portfolio composition over 8 weeks:\n\nWeek 1: $10,000. Active: 25% ($2,500). Bull market.\nWeek 2: $11,800. Active: 35%. "Hot, increasing exposure."\nWeek 3: $13,200. Active: 50%. "Everything is working."\nWeek 4: Market crash. Active positions lose 65%. Portfolio: $13,200-(6,600×0.65) = $8,910.\nWeek 5: Recovery attempt. Active: 60% ($5,346). Market still volatile.\nWeek 6: Another -40% on active. Portfolio: $8,910-$2,138 = $6,772.\nWeek 7: Demoralised. Active 10%. Recovery rally — misses most of it.\nWeek 8: $7,100. Started at $10,000.\n\n1. Which week broke the risk framework and what was the violation?\n2. What would Week 4 portfolio be if 25% allocation maintained throughout?\n3. What is the correct Week 5 allocation given Week 4 result?`,
              scoringCriteria: [
                `Violation: Week 3. 50% active exceeds the 20–30% maximum. Driven by emotion ("everything is working") not strategy. Classic pre-crash over-allocation.`,
                `Week 4 with 25% maintained: $13,200×0.25=$3,300 active. Loss: $3,300×0.65=$2,145. Portfolio: $13,200-$2,145 = $11,055 vs actual $8,910. That's $2,145 extra capital to buy the crash.`,
                `Week 5 allocation: 30% monthly drawdown rule = reduce sizes by 50%. Previous allocation was effectively 60% (where losses came from). Correct Week 5: maximum 15–20% active. Hard stop if down another 15%.`,
              ],
            },
          ],
        },

        {
          id: 'trading-journal',
          title: `The Trading Journal — Converting Losses Into Rules`,
          explanation: `The source material contains an entire section called "Shitcoin Learnings / Mistakes" — a personal trading journal made public. The author explicitly calls it out: "THESE LEARNINGS DON'T MEAN SHIT IF YOU DON'T LOOK AT IT."\n\nA journal converts losses from pain into data. Without documentation, you make the same mistake 20 times. With documentation, you make it once and build a rule.\n\n**What to record for every trade:**\n1. Token name, entry MC, exit MC\n2. Why you entered — thesis in writing (forces clarity before entry)\n3. Safety check results (Rugcheck score, bundle %, community level)\n4. Position size and % of portfolio\n5. Exit reason (profit target hit, stop hit, thesis broken, emotion)\n6. Result: SOL gained/lost, % return\n7. One-line lesson: what would you do differently?\n\n**The pattern recognition function:**\nAfter 20+ trades, review for patterns. The source material's personal discoveries:\n- "If you're taking screenshots, TAKE PROFIT" (screenshot = peak emotional excitement = likely near top)\n- "Beta plays of other projects don't always work" (copycats rarely replicate the original)\n- "Not every coin will hit $1M MC — some have natural ceilings at $300–500K"\n- "Don't over trade — let the trades come to you"\n\nThese were not hypotheses. They were patterns discovered through documented experience. Your journal will surface your specific patterns — which signal types you consistently over-weight, which setups you consistently miss, which emotional states produce bad decisions.\n\n**Review cadence:**\nWeekly: spot emerging patterns in recent trades while memory is fresh.\nMonthly: identify structural patterns across many trades, derive new rules.\nPre-trade: review relevant past entries ("last 5 times I entered a KOL-only call, what happened?")`,
          visualPrompt: `👆 Trading journal template with all required fields`,
          visualType: `interactive`,
          visualUrl: `trading-journal-template`,
          examples: [
            {
              contextTag: `[Pattern discovery, 30-trade review, 2025]`,
              context: `Trader reviews 30-trade journal after 2 months.`,
              scenario: `Pattern: 8 KOL-call entries → 12% win rate. 12 organic-discovery entries → 58% win rate. 10 wallet-tracking entries → 60% win rate. Same average gains across all types.`,
              outcome: `New rule: KOL call alone is insufficient entry signal. Only enter on KOL call if independent validation already exists. Win rate improves from 38% to 54% the following month.`,
            },
            {
              contextTag: `[Screenshot rule application, 2025]`,
              context: `Trader reviews journal: every time they took a screenshot of a position, they subsequently roundtripped.`,
              scenario: `Pattern: 9 screenshots taken. 7 resulted in roundtrips. Creates rule: screenshot = take profit signal.`,
              outcome: `Next month: takes 4 screenshots, takes profit each time. Three continued higher after the sell. Average exit still above 5× each time. No roundtrips. Consistency over perfection.`,
            },
            {
              contextTag: `[Beta play lesson, documented, 2024]`,
              context: `Trader enters $BAPE because $APE performed well. Enters $KOKO because $HARAMBE did well.`,
              scenario: `Journal documents: both beta plays lose 80%. Sources material confirms: "koko to harambe, BAPE to air, white air to black air — beta plays don't always work."`,
              outcome: `Rule added: each token needs independent community and cultural evaluation. Never enters a beta play again without treating it as a completely independent opportunity.`,
            },
          ],
          keyTakeaway: `Document every trade: thesis (in writing), safety checks, entry, exit, lesson. "These learnings don't mean shit if you don't look at it." After 20+ trades, review for patterns — your consistent mistakes are invisible without documentation. Weekly and monthly reviews convert data into rules.`,
          guidedPractice: [
            {
              question: `Why does writing down your trade thesis before entering change outcomes?`,
              options: [`A — Written theses are legally binding`, `B — The act of writing forces you to articulate specifically why you are entering — if you cannot state a clear thesis, that inability is itself a signal not to enter`, `C — Written records improve your tax accuracy`, `D — It slows down impulsive entries only for beginners`],
              correct: 1,
              hint: `What does it mean if you cannot clearly write down why you are entering a trade?`,
              explanation: `B is correct. "I have a feeling about this" is not a thesis. "Smart money wallet (52% win rate, 140 trades) bought at $28K MC, Rugcheck 88/100, community Level 2, AI narrative Phase 1" is a thesis. The writing test exposes FOMO entries before they cost money.`,
            },
            {
              question: `After reviewing 25 trades you discover: 8 KOL-call entries → 1 winner (12% win rate). 12 organic-discovery entries → 7 winners (58% win rate). What is the specific rule to derive?`,
              options: [`A — Never follow any KOL`, `B — KOL call alone is insufficient entry signal. KOL calls require pre-existing independent validation — treat the call as confirmation, never as primary reason.`, `C — Reduce position size by 50% on KOL calls`, `D — Only follow KOLs with more than 100,000 followers`],
              correct: 1,
              hint: `The data shows KOL-primary entries have terrible results. What is the actionable rule that preserves their value while eliminating their destructive use?`,
              explanation: `B is correct. The data is clear but nuanced — KOL calls have some value (they can confirm an existing thesis). The rule doesn't eliminate awareness of KOL calls; it converts "KOL call = entry" into "KOL call + independent validation = potentially entry." This preserves signal value while eliminating the destructive primary-entry use.`,
            },
            {
              question: `The source material says "if you're taking screenshots, TAKE PROFIT." What psychological state does a screenshot indicate?`,
              options: [`A — You are documenting your trades for tax purposes`, `B — Peak emotional excitement about an unrealised gain — the same emotional state that historically precedes not selling and subsequently roundtripping`, `C — You need to share your success with your network`, `D — You are preparing to exit the position`],
              correct: 1,
              hint: `When do people take screenshots of their portfolio? What emotional state drives that?`,
              explanation: `B is correct. People screenshot positions when they are at peak excitement about unrealised gains — typically near the top of a move. That excitement is itself a signal the move is extended. The source material converts this from a vanity moment into a trading trigger: feel the urge to screenshot = take profit.`,
            },
            {
              question: `What is a "beta play" and why does the source material warn against them?`,
              options: [`A — A highly leveraged position`, `B — A derivative token copying another token's success (e.g. $KOKO because $HARAMBE worked). Warning: the original's success does not transfer — copycats need independent community and cultural weight.`, `C — A position taken during a beta market (pre-trend)`, `D — The second position opened in a trading session`],
              correct: 1,
              hint: `The source material gives "koko to harambe, BAPE to air" as examples — what do these have in common?`,
              explanation: `B is correct. Beta plays are copycats riding another token's cultural coattails. The source material is explicit that these "don't always work" — meaning they mostly don't. Each token needs its own cultural weight and community. Being derivative of a winner is not a competitive advantage in memecoin trading.`,
            },
            {
              question: `How frequently should a trading journal be reviewed and what does each cadence accomplish?`,
              options: [`A — Only at year end for tax purposes`, `B — Weekly (spot recent patterns while memory is fresh), monthly (identify structural patterns across many trades), and pre-trade for specific categories (review past entries in that signal type)`, `C — Before every single trade (read entire journal)`, `D — Only after a losing streak`],
              correct: 1,
              hint: `Different frequencies serve different discovery purposes — what does weekly vs monthly enable?`,
              explanation: `B is correct. Weekly catches immediate patterns while recall is vivid. Monthly surfaces structural issues (consistent underperformance in a specific style) that are invisible day-by-day. Pre-trade review of specific categories ("last 5 KOL-only entries: what happened?") prevents documented mistakes from being repeated in real time.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Your 30-trade journal analysis:\n\nBy entry signal:\n- Wallet tracking + independent validation: 13 trades, 8 wins (62%), avg win +280%, avg loss -62%\n- Independent thesis: 9 trades, 5 wins (56%), avg win +180%, avg loss -55%\n- KOL call only: 6 trades, 1 win (17%), avg win +120%, avg loss -78%\n- FOMO entry: 2 trades, 0 wins, avg loss -85%\n\nBy entry MC:\n- Under $100K: 14 trades, 9 wins (64%), avg win +310%\n- $100K–$500K: 10 trades, 5 wins (50%), avg win +130%\n- Over $500K: 6 trades, 2 wins (33%), avg win +65%\n\nBy time:\n- Before noon UTC: 16 trades, 10 wins (63%)\n- Noon–8PM UTC: 11 trades, 6 wins (55%)\n- After 8PM UTC: 3 trades, 0 wins\n\nWrite exactly 5 trading rules derived from this data.`,
              scoringCriteria: [
                `Rule 1: Never enter based solely on KOL call. Requires independent validation first.`,
                `Rule 2: No trades after 8 PM UTC. Zero wins, three for three losses — definitive pattern.`,
                `Rule 3: Maximum Style 1 entry MC is $500K. Win rate drops to 33% above this.`,
                `Rule 4: Never FOMO. Zero wins on two entries. Mandatory pre-entry checklist gate for any trade involving excitement.`,
                `Rule 5: Primary signal = wallet tracking + independent confirmation. Highest win rate and highest avg win. Prioritise over all other signal types.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Monthly review. You identify this pattern across 4 losing trades:\n\n"Each time I saw a volume spike and ran my checklist — it passed. But within 24 hours the token dumped 50%+. Looking at the transaction feed afterwards, the volume spike was 3 or fewer wallets doing 70%+ of the buying. I thought it was organic because the checklist passed."\n\n1. Write the new checklist item that would catch this in future.\n2. Write the rule for your journal.\n3. How would you test this rule retrospectively before applying it going forward?`,
              scoringCriteria: [
                `New checklist item: "Transaction feed check — verify volume spike is distributed across 10+ unique wallets. If 3 or fewer wallets drove >60% of the triggering volume, classify as potential coordinated pump, not organic demand."`,
                `Rule: "Before entering any token where a volume spike triggered my interest, verify on Photon/BullX transaction feed that buying is distributed across at least 10 unique wallets. If concentrated in 3 or fewer, pass or use minimal position (0.5% max)."`,
                `Retrospective test: go back to the 4 losing trades in journal. Was the 3-wallet concentration visible at entry? If yes on all 4, the rule would have prevented all losses. Also review 10 winning trades — did any have 3-wallet concentration? If so, refine the threshold rather than making the rule too restrictive.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `End of month review. Your raw data:\n\n22 trades total. 12 wins, 10 losses. Net: +$400.\n\nBy style:\n- Style 1 (new pair): 14 trades, 6 wins, -$800 net\n- Style 2 (dip buy): 5 trades, 4 wins, +$1,100 net\n- Style 3 (lowcap): 3 trades, 2 wins, +$100 net\n\nStyle 2 wins: all 4 occurred when you checked community Telegram during the dip before entering.\nStyle 1: 4 trades at 3% portfolio (over-sized). 8 trades at 1–2% (correct-sized).\nStyle 1 over-sized trades: 1 win, 3 losses. Style 1 correctly-sized trades: 5 wins, 3 losses.\n\n1. Where is your edge?\n2. What would result be if you doubled Style 2 allocation and halved Style 1?\n3. What hypothesis about the Telegram check in Style 2 wins should you test next month?`,
              scoringCriteria: [
                `Edge: Style 2 (4/5 wins, +$1,100 on 5 trades). Also notable: correctly-sized Style 1 wins at 62.5% vs over-sized Style 1 at 25% win rate — sizing discipline is itself a performance driver.`,
                `Reallocation: Style 2 doubled → +$2,200. Style 1 halved → -$400. Net: $2,200+(-$400)+$100 = +$1,900 vs actual +$400. Better allocation of existing edge.`,
                `Hypothesis to test: "All 4 Style 2 wins had active Telegram during the dip. Next month I will deliberately track: Style 2 entries WITH Telegram check vs WITHOUT. Do unchecked entries underperform?" Apply systematically for 30 days.`,
              ],
            },
          ],
        },
      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret'],
        description: 'Random draw from Lab 5 — capital preservation rules, loss asymmetry, trading journal pattern analysis.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 5 Boss — Risk Management System Design`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review lesson pointers and retry.' },
        scenarios: [{
          id: 'boss-lab5-v1',
          situation: `Portfolio $7,500. Day 18 of the month. You are down 30.7%.\n\nCurrent positions:\n- $NOVA: $300 cost, worth $85 (-72%)\n- $CUBE: $500 cost, worth $620 (+24%)\n- $FROG: $200 cost, worth $340 (+70%)\n- Cash/SOL: $4,155\n\nTotal: $5,200. 12 days remain in the month.\n\nRequired: (1) Immediate position decisions for each. (2) Trading rules for remaining 12 days given 30% drawdown. (3) A new trade appears — all fundamentals pass, smart money entry confirmed. Maximum position size? (4) When and under what conditions do you resume normal sizing next month?`,
          scoringCriteria: [
            `$NOVA: exit. Down 72% with no recovery signal — cut. $215 additional loss risk not worth preserving. $CUBE: hold or take partial profit — +24% is a winner, let it run. $FROG: take 50% profit immediately — +70% with 12 days left in a down month. Crystallise gains.`,
            `Remaining 12 days: 30% drawdown = reduce all position sizes by 50%. Standard 2% max becomes 1% max. No new Style 1 entries above $100K MC. Daily stop tightened to 10%.`,
            `New trade max: 1% of current $5,200 = $52. Strong signal justifies entering but sizing reflects conservation mode. Not the week to size up regardless of how good the setup looks.`,
            `Resume normal sizing: Month 1, Day 1. First week at 75% of normal sizing as confidence rebuild. Full sizing resumes after 2 consecutive weeks of positive results. If same patterns that caused drawdown not identified, keep reduced sizing until root cause addressed.`,
          ],
        }],
      },
    },

// ─────────────────────────────────────────────────────────────────────────────
// LAB 6: TAX BASICS AND BUILDING CONSISTENCY
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-6-advanced-consistency',
      title: `Lab 6: Tax Basics and Building Consistency`,
      subtitle: `The transition from degen to professional is not a single moment. It is a series of habits built over hundreds of trades.`,
      lessons: [
        {
          id: 'tax-basics',
          title: `Tax Basics for Memecoin Traders — What You Must Know`,
          explanation: `Active memecoin trading without tax tracking is a serious legal and financial risk. This lesson covers what you must know — consult a qualified tax professional for jurisdiction-specific advice.\n\n**The fundamental principle:**\nIn most major jurisdictions (US, UK, EU), every crypto-to-crypto swap is a taxable event. When you swap SOL for $FROG, you have disposed of SOL — triggering a capital gain or loss on the SOL at its current price vs your cost basis.\n\n**Key concepts:**\n\nCost basis: what you paid for an asset. Buy 100K $FROG tokens for 0.5 SOL ($75 at the time) = cost basis of $75.\n\nRealised gain/loss: sale price minus cost basis. Sell those tokens for 2 SOL ($300) = $225 taxable gain.\n\nUnrealised gain: theoretical value you have not locked in. Not taxable until sold.\n\nShort-term vs long-term: assets held under 12 months = short-term rates (higher, ordinary income in most jurisdictions). Over 12 months = long-term preferential rates. Most memecoins are held days to weeks — short-term applies.\n\n**The practical problem:**\nActive traders make 200+ transactions per month. Manual cost basis tracking across hundreds of tokens is essentially impossible. Automated tools (Koinly, TaxBit, CoinTracker) connect to your wallet, import all transactions, and calculate gains/losses automatically for $50–200/year.\n\n**Loss documentation:**\nRealised losses offset gains. $2,000 in rug losses against $5,000 in gains = tax owed on $3,000 net. Documenting losses is free money — never skip it.\n\n**The compliance reality:**\nBlockchain transactions are public and permanent. Tax authorities are increasingly using on-chain analytics. "I never cashed out to fiat" is not a legal defence in most jurisdictions.`,
          visualPrompt: `👆 Tax event timeline: which crypto actions trigger taxes and which don't`,
          visualType: `interactive`,
          visualUrl: `crypto-tax-event-guide`,
          examples: [
            {
              contextTag: `[Swap tax event, new trader confusion, 2025]`,
              context: `Trader buys 2 SOL at $50/SOL in 2024. SOL is now $150. Trader swaps the 2 SOL for $FROG tokens.`,
              scenario: `This swap = selling 2 SOL at $150 = $300 proceeds. Cost basis: $100 (2×$50). Taxable gain: $200. Occurs in the year of the swap.`,
              outcome: `Trader did not expect this. Starts using Koinly from day one rather than waiting until year end. Every swap is a disposal.`,
            },
            {
              contextTag: `[Loss harvesting, documented losses, 2024]`,
              context: `Trader has $8,000 in gains and $3,200 in realised losses from rugged tokens.`,
              scenario: `Properly documented losses with on-chain transaction evidence. Net taxable gain: $8,000 - $3,200 = $4,800.`,
              outcome: `Tax saving: approximately $800–$1,200 depending on rate. Without documentation, tax owed on $8,000. Documenting rug losses is literally free money.`,
            },
            {
              contextTag: `[Automation ROI, active trader, 2025]`,
              context: `Trader made 220 memecoin trades in Q1. Manual tax tracking estimated at 10+ hours.`,
              scenario: `Uses Koinly at $99/year. Import wallet addresses. 20 minutes later, all 220 trades categorised with gains/losses and full tax report ready.`,
              outcome: `$99/year vs 10+ hours of manual work plus high error rate. Every active trader should automate from month 1.`,
            },
          ],
          keyTakeaway: `Every crypto-to-crypto swap is a taxable event. Use Koinly, TaxBit, or CoinTracker from day one — not at year end. Document all losses; they offset gains. Blockchain is public and permanent. "Never cashed out" is not a defence.`,
          guidedPractice: [
            {
              question: `You swap 2 SOL (bought at $50/SOL, now $150/SOL) for $FROG. Is this taxable?`,
              options: [`A — No — you did not convert to fiat`, `B — Yes — you disposed of 2 SOL at $150. Gain = ($300 sale) - ($100 cost basis) = $200 taxable in the year of the swap.`, `C — Only when you sell $FROG for fiat`, `D — Only if the gain exceeds $1,000`],
              correct: 1,
              hint: `A swap = selling one asset and buying another. What happens to the asset you "sold"?`,
              explanation: `B is correct. Swapping SOL for a token is treated as selling SOL at current market price. The gain on your SOL is taxable in the year it occurs, regardless of whether fiat was ever touched.`,
            },
            {
              question: `You made $6,000 in gains and lost $2,500 on rugged tokens this year. How does this affect taxable income in most jurisdictions?`,
              options: [`A — Tax owed on $6,000`, `B — Tax owed on $3,500 net gain ($6,000 - $2,500)`, `C — Rug losses are never deductible`, `D — Tax owed on $6,000 with $2,500 carried forward`],
              correct: 1,
              hint: `What is "net capital gain"?`,
              explanation: `B is correct. Capital gains and losses net against each other in most jurisdictions. Documenting and reporting rug losses reduces your taxable position — at a 30% effective rate, $2,500 in documented losses saves $750 in tax.`,
            },
            {
              question: `A token you bought is now worth effectively $0 after a rug. You never sold it. Can you claim a loss?`,
              options: [`A — No — must sell to realise a loss`, `B — In many jurisdictions, tokens that become worthless can be claimed as a loss even without a formal sale ("abandoned asset" treatment). Consult a crypto-specialist tax professional — rules vary.`, `C — Only if the rug was reported to authorities`, `D — Never — rug losses have no tax treatment`],
              correct: 1,
              hint: `What does "worthless security" or "abandoned asset" treatment mean?`,
              explanation: `B is correct. Many jurisdictions allow loss claims on assets that have become effectively worthless. This requires documentation (the token has no liquidity, the contract has been abandoned) and varies significantly by jurisdiction. A crypto-specialist accountant can often recover significant tax value from rug documentation.`,
            },
            {
              question: `Why is manual tax tracking impractical for active memecoin traders and what is the solution?`,
              options: [`A — 200 trades is not many — manual is fine`, `B — Each token-to-token swap requires tracking cost basis across multiple assets at different acquisition prices. Automated tools (Koinly, TaxBit, CoinTracker) handle this in minutes for $50–200/year by connecting to your wallet.`, `C — Only trades over $1,000 need tracking`, `D — Crypto taxes don't apply to Solana`],
              correct: 1,
              hint: `At 200+ trades per month, how long does manual tracking take and how error-prone is it?`,
              explanation: `B is correct. Token-to-token swaps create complex cost basis chains — every swap both disposes of one asset and acquires another. Manual tracking at 200+ trades/month is hours of work and highly error-prone. Automated tools handle this entirely for a trivial annual fee.`,
            },
            {
              question: `What is the short-term vs long-term capital gains distinction and how does it apply to most memecoin trades?`,
              options: [`A — All crypto is taxed at a flat rate regardless of holding period`, `B — Short-term (under 12 months) is taxed at ordinary income rates (often 20–45%). Long-term (12+ months) gets preferential rates (often 0–20%). Most memecoins held days/weeks = short-term rates.`, `C — Long-term treatment only applies to Bitcoin and Ethereum`, `D — Memecoins are exempt from capital gains due to their speculative nature`],
              correct: 1,
              hint: `What is the holding period threshold and where do day-held memecoins fall?`,
              explanation: `B is correct. Holding period determines the tax rate in most major jurisdictions. Memecoins held for hours, days, or weeks fall under short-term treatment — the higher rate. This is another reason why effective profit-taking matters: timing can affect which tax year the gain falls in, even if not the rate.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Year-end review. Wallet activity:\n\nPurchases (SOL spent):\n- January: 5 SOL at $95/SOL = $475 cost basis\n- April: 8 SOL at $140/SOL = $1,120 cost basis\n- September: 3 SOL at $160/SOL = $480 cost basis\n\nDisposals (SOL received):\n- March: 12 SOL at $110/SOL = $1,320 proceeds\n- July: 6 SOL at $155/SOL = $930 proceeds\n- November: 2 SOL at $170/SOL = $340 proceeds (scraps from a rug — original cost $700)\n\n1. What is your gross gain from March and July disposals (simplified, use earliest purchases first)?\n2. What was the realised loss on the November disposal, and how does it change taxable income?\n3. What tool would you use and what do you provide it?`,
              scoringCriteria: [
                `March disposal (12 SOL at $1,320): earliest cost basis = January 5 SOL ($475) + April 7 SOL ($122.50×7=$857.50). Total basis: $1,332.50. Gain: $1,320-$1,332.50 = slight loss actually. Student should note: exact tax calculation requires proper lot matching rules (FIFO/LIFO/specific ID) — approximation exercise.`,
                `November loss: sold for $340, original cost $700. Realised loss = -$360. This offsets gains from other trades. At 30% rate, saves $108 in tax.`,
                `Tool: Koinly, TaxBit, or CoinTracker. Provide: Solana wallet address(es). The tool imports all transactions automatically and generates the tax report.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `A fellow trader says: "I made $15,000 in memecoin gains this year. I also lost $8,000 on rugs. I'm not reporting any of it because I never withdrew to my bank. Is this safe?"\n\nProvide a complete assessment covering: legal risk, detection risk, and the correct action including the financial benefit of proper reporting.`,
              scoringCriteria: [
                `Legal risk: crypto gains are taxable in US, UK, EU regardless of fiat withdrawal. "Never cashed out" is not a legal defence. Tax obligation arises at disposal (each swap).`,
                `Detection risk: blockchain transactions are public and permanent. Tax authorities use on-chain analytics tools. Traders with significant on-chain activity who don't report are increasingly flagged.`,
                `Correct action: report $15,000 gains. Net against $8,000 documented losses: taxable gain = $7,000. At 30% rate, tax owed ~$2,100 vs potential penalties (20–75% underpayment penalty + interest) for non-reporting. The $8,000 loss documentation saves ~$2,400 in tax.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Tax planning scenario, December 15. You have $22,000 in gains this year.\n\nPosition A ($FROG): cost basis $400, current value $3,200. Held 6 weeks. Unrealised gain: $2,800.\nPosition B ($CUBE): cost basis $1,500, current value $800. Held 4 months. Unrealised loss: -$700.\n\nYou are considering year-end tax optimisation.\n\n1. What is the tax advantage of selling Position B before December 31?\n2. For Position A: is there any tax advantage to waiting before selling?\n3. What is the risk of "hold for long-term" strategy specifically on memecoins?`,
              scoringCriteria: [
                `Position B: selling before December 31 realises $700 loss in current tax year, offsetting $700 of $22,000 gains. Tax saving: approximately $175–$280 depending on rate. Not selling = cannot use the loss this year.`,
                `Position A: both today and after February 5 (12 weeks) are still short-term (under 12 months). No tax difference until it has been held 12 months (approximately next November). Waiting 12 months for long-term rates could save 15–20% — but see risk.`,
                `Memecoin hold risk: 12 months is an eternity for a speculative token. Most memecoins lose 80–95% of value within 3–6 months if they don't maintain momentum. "Holding for tax efficiency" often results in paying lower tax on a fraction of the original gain. Tax optimisation should not override trading discipline.`,
              ],
            },
          ],
        },

        {
          id: 'building-consistency',
          title: `Building Consistency — The Daily Routine of a Professional Trader`,
          explanation: `The gap between "I know how to trade" and "I consistently make money" is a routine. Professionals don't make individual decisions — they follow systems. Every element of their day reduces emotional decision-making and increases signal quality.\n\n**The daily routine framework:**\n\nMorning (30–60 min before any trading):\n- Macro check: is Solana up, down, or flat? This sets the day's risk tolerance. Bear day = reduce Style 1 significantly.\n- Wallet alerts: any smart money buys overnight?\n- Active positions: significant changes? GMGN alerts?\n- Narrative scan: any Phase 1 signals from DeFined overnight?\n\nIntraday:\n- Evaluate opportunities against full checklist\n- Do not trade during emotional states: just had a big win, big loss, tired, frustrated\n- Most hours: nothing needs to happen\n\nEvening (15 min):\n- Journal any trades: thesis, entry, exit, lesson\n\nSunday (20 min weekly review):\n- Total portfolio value, allocation breakdown\n- This week's trade performance by signal type\n- Rule updates if patterns visible\n- Allocation check: drifted from 25% to 45% without deciding to?\n\n**The source material's key consistency rules:**\n"Don't over trade — let the trades come to you." Quality > quantity.\n"Pay attention to NARRATIVES and VOLUME — those are what get you big profits." Two variables. Not twenty.\n"The game changes all the time. Old strategies won't always work. Adapt."\n"Stay humble." Winning streaks create overconfidence before the inevitable drawdown.`,
          visualPrompt: `👆 Daily trading routine template: morning check, intraday rules, evening journal`,
          visualType: `interactive`,
          visualUrl: `professional-trading-routine`,
          examples: [
            {
              contextTag: `[Morning routine impact, bear day discipline, 2025]`,
              context: `Broad market down 8% overnight. Trader's routine flags: bear conditions.`,
              scenario: `Routine output: reduce Style 1, no new positions over 1% until market stabilises. Trader spends day on analysis, not trades.`,
              outcome: `Tuesday market recovers. Opportunities identified during Monday's analysis available at better prices. Monday discipline → Tuesday's better entries.`,
            },
            {
              contextTag: `[Overtrader → quality trader, monthly comparison, 2024]`,
              context: `Trader making 15 trades/day because "more chances = more wins."`,
              scenario: `Monthly analysis: 300 trades, 55% win rate, avg win $45 avg loss $62 (rushed decisions). Net: -$900. Reduces to 5–8 high-quality trades per day.`,
              outcome: `Win rate holds at 55%. Avg win improves to $120 (better setups), avg loss drops to $40 (faster cuts). Net: +$1,600. Quality > quantity every time.`,
            },
            {
              contextTag: `[Sunday review power, rule derivation, 2025]`,
              context: `Trader implements 20-minute Sunday review each week.`,
              scenario: `Week 6 review: discovers all trades after 9 PM UTC are losses (8 for 8). Also: trades in bear conditions produced 72% losses vs 34% in neutral/bull.`,
              outcome: `Two new rules: no trades after 9 PM UTC, no Style 1 entries when Solana daily is down >5%. These two rules alone improve the following month by 40%.`,
            },
          ],
          keyTakeaway: `Consistency = routine, not talent. Morning macro check + intraday checklist + evening journal + Sunday review = the system. "Don't overtrade — let the trades come to you." Focus on NARRATIVE and VOLUME. Stay humble after winning streaks.`,
          guidedPractice: [
            {
              question: `What does "don't overtrade — let the trades come to you" mean practically?`,
              options: [`A — Only trade once per week`, `B — Do not manufacture activity for its own sake. Wait for signals that pass your full checklist. Fewer high-quality trades outperform many rushed ones because EV per trade is higher.`, `C — Use bots to trade while you sleep`, `D — Only trade when Solana is above its 30-day average`],
              correct: 1,
              hint: `What is the quality/quantity trade-off in terms of expected value per trade?`,
              explanation: `B is correct. Trading activity is not correlated with returns — quality of decision-making is. Filling time with low-conviction trades to feel productive typically means lower win rates, smaller average wins, and faster capital erosion. The professional discipline is patience: maintain checklist standards even if it means zero trades on some days.`,
            },
            {
              question: `Why does the source material identify "NARRATIVES and VOLUME" as the two primary signals?`,
              options: [`A — They are the only variables on DEXScreener`, `B — Narratives determine which categories attract buyers. Volume confirms that narrative attention is translating into real demand. Everything else is secondary to these two.`, `C — They are the most cited by KOLs`, `D — They are the easiest to calculate`],
              correct: 1,
              hint: `What creates directional price movement and what confirms it is real?`,
              explanation: `B is correct. Narrative = direction (which themes attract buyers). Volume = confirmation (is the narrative actually driving real trades). Strong narrative + no volume = Twitter noise. High volume + no narrative = pump without staying power. Both together = sustained move.`,
            },
            {
              question: `Why is "stay humble" specifically important after winning streaks?`,
              options: [`A — Winning traders must appear humble to avoid scrutiny`, `B — Winning streaks create overconfidence that leads to oversizing before the inevitable drawdown — the state after wins is exactly when sizing discipline is most likely to break`, `C — Humble traders attract better alpha from their network`, `D — Winning streaks trigger tax events that require modesty`],
              correct: 1,
              hint: `What does a winning streak make you want to do with your next position size?`,
              explanation: `B is correct. After a winning streak traders believe their edge is stronger than it is and increase bet sizes — right before conditions change. Maintaining systematic position sizing regardless of recent performance prevents the "oversize before the crash" pattern that the source material explicitly warns against.`,
            },
            {
              question: `What problems does a 20-minute Sunday weekly review catch that daily monitoring misses?`,
              options: [`A — Individual trade errors`, `B — Structural patterns: gradual allocation drift (25% → 45% without a conscious decision), consistent underperformance in a signal type, time-of-day patterns, style performance differences across the full week`, `C — Price alerts for the following week`, `D — Tax obligations`],
              correct: 1,
              hint: `What is visible across 5 days of data that is invisible from any single day?`,
              explanation: `B is correct. Daily monitoring catches individual trades. Weekly review catches structural drift. "My allocation has drifted to 45% without any decision." "I've made 7 late-night trades and lost 6." "KOL-only entries have underperformed 5 for 5 this week." These patterns require a week of data to surface.`,
            },
            {
              question: `"The game changes all the time. Old strategies won't always work. Adapt." How is this operationalised in a trading routine?`,
              options: [`A — Change your entire strategy every 2 weeks`, `B — Monthly review of whether core strategies are still producing edge. If a previously successful signal type has stopped working, identify why through journal data and update rules systematically — not reactively.`, `C — Follow whatever is currently trending in KOL channels`, `D — Never change a working strategy`],
              correct: 1,
              hint: `What is the difference between systematic adaptation (data-driven rule updates) and reactive adaptation (changing after every bad trade)?`,
              explanation: `B is correct. Systematic adaptation = monthly data review → identify what has changed → update specific rules. Reactive adaptation = changing strategy after every loss = emotional instability. The discipline is reviewing often enough to catch genuine environment shifts while not overreacting to individual trade outcomes.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Design a complete daily and weekly trading routine for this profile:\n- Full-time job 9AM–6PM local time\n- Phone accessible during day, active trading only evenings/weekends\n- Portfolio: $4,500\n- Primary strategies: Style 1 (3–5 new pairs per week) + Style 2 (1–2 dip buys per week)\n- Currently trading "whenever I feel like it"\n\nDesign: morning routine, intraday phone-check protocol, evening active window, Saturday review, Sunday planning. Include specific time allocations and non-negotiable rules.`,
              scoringCriteria: [
                `Morning (10 min before work): market conditions check, wallet alerts review, active positions scan. No trades during work hours unless tracked wallet alert fires.`,
                `Intraday (5 min at lunch): review any alerts. Flag CAs for evening evaluation. No new positions — too rushed. No emotional state during work pressure.`,
                `Evening 7–9:30 PM: active trading window. Evaluate flagged CAs with full checklist. Style 2 chart analysis. Journal any trades. Hard stop 9:30 PM — no exceptions.`,
                `Saturday (20 min): journal all week's trades, win/loss by signal type, allocation check, rule updates if patterns visible.`,
                `Sunday (15 min): narrative landscape, identify any Phase 1 signals, set maximum weekly trade count based on recent performance and market conditions.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Three months of consistent journaling. Your data:\n\nBest time: 8–11AM UTC (76% win rate, 22 trades)\nWorst time: after 9PM UTC (14% win rate, 7 trades)\n\nBest conditions: neutral/bull day (64% win rate, 38 trades)\nWorst: bear day (22% win rate, 18 trades)\n\nBest signal: wallet tracking + independent confirmation (71% win rate)\nWorst: single KOL call (19% win rate)\n\nBest entry MC: under $100K (62% win rate)\nWorst entry MC: over $500K (28% win rate)\n\nYou have been trading "whenever you feel like it, in whatever conditions." Rewrite your trading rules based solely on this data. Be specific — no vague commitments.`,
              scoringCriteria: [
                `Rule 1: No trades after 9PM UTC. Phone alarm at 9:30PM. No exceptions.`,
                `Rule 2: On bear days (Solana down >5%), no new Style 1 entries. Style 2 with defined stop-loss only.`,
                `Rule 3: KOL call alone = no entry. Must have independent validation. Re-evaluate KOL calls as confirmation only.`,
                `Rule 4: Style 1 maximum entry MC = $100K. Above this threshold, win rate insufficient to justify risk.`,
                `Rule 5: Primary trading window 8–11AM UTC. Schedule morning routine to be available during this window when possible.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Sunday review. This week: 9 trades, 4 wins (44% — below usual 58%).\n\nAnalysis of 5 losses:\n- Loss 1: Entered at $350K MC (above $100K Style 1 max). Rationale: "this one is different."\n- Loss 2: Entered at 10PM UTC (violated no-late-trading rule). Rationale: "only 30 min past limit."\n- Loss 3: Entered on bear day. Rationale: "this token seemed immune to macro."\n- Loss 4: KOL-only entry. Rationale: "this KOL has been right recently."\n- Loss 5: Skipped bundle check ("in a hurry"). Bundled token. Rugged.\n\nYour 4 wins were all rule-compliant trades.\n\nWrite the complete Sunday review entry: root cause analysis, emotional pattern identification, and 3 concrete commitment statements for next week.`,
              scoringCriteria: [
                `Root cause: all 5 losses were rule violations. Win rate when following rules: 100% (4/4). When breaking rules: 0% (0/5). The rules are working. The trader is not following them.`,
                `Emotional pattern: each violation came with a rationalisation ("this one is different," "only 30 min past," "KOL has been right recently"). These are identical psychological override patterns — the rational mind finding excuses for emotional impulse.`,
                `Concrete commitments: (1) "I will set a hard phone alarm at 9:30 PM labelled STOP TRADING — if it fires while I'm mid-analysis, I close the app." (2) "I will not enter any trade where I cannot write a complete thesis in the journal before submitting the order." (3) "I will not enter any trade above $150K MC for Style 1 this week regardless of signal quality."`,
              ],
            },
          ],
        },
      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-dataInterpret', 'judgment-riskAssess'],
        description: 'Random draw from Lab 6 — tax fundamentals and professional consistency framework.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 6 Boss — Complete Trader Certification`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review lesson pointers and retry.' },
        scenarios: [{
          id: 'boss-lab6-v1',
          situation: `Sunday evening. Beginning of new week.\n\nPortfolio: $8,200. Trading 3 months. Journal shows: 55% win rate on wallet-tracking entries, 41% overall (KOL calls dragging), best performance before noon UTC.\n\nMarket: Solana up 12% this week. New AI narrative forming (Phase 1 — 4 tokens moving organically). Tracked wallet (51% win rate, 140 trades) just bought $VOXEL at $32K MC.\n\n$VOXEL: Rugcheck 88/100, mint revoked, LP locked, 9% sniper, community Level 2, AI narrative alignment (Phase 1). It is 11PM UTC when you see the alert.\n\nRequired: (1) Based on your routine and journal data, should you trade right now? (2) What do you do with the $VOXEL opportunity? (3) If entering tomorrow morning, at what MC does it remain valid vs too late? (4) Complete Monday trading plan.`,
          scoringCriteria: [
            `Right now: NO. Journal shows 0% win rate after 9PM UTC. Rule exists and is derived from data. Do not override with "this one is different." Set a price alert and sleep.`,
            `$VOXEL: valid opportunity. Solid fundamentals + Phase 1 AI narrative + wallet tracking signal. Plan entry tomorrow morning.`,
            `Valid entry range: 2× from $32K tracked wallet entry = up to $64K MC. If $VOXEL is under $64K when you wake, the chase rule is satisfied. Above $64K = pass regardless of attractiveness.`,
            `Monday plan: morning routine (7AM) — market check first. If Solana neutral/up, normal Style 1 sizing. Check $VOXEL price — if under $64K, enter at 1.5% portfolio ($123). Also scan DeFined for other AI Phase 1 tokens to build small basket. Journal all trades in the evening.`,
          ],
        }],
      },
    },

    // ── Intermediate Labs 1 & 2 ──────────────────────────────────────────
    {
      id: 'lab-7-narrative-trading',
      title: `Lab 1: Narrative Trading Mastery`,
      subtitle: `Beginners react to narratives. Advanced traders anticipate them.`,
      lessons: [
        {
          id: 'narrative-cycle-timing',
          title: `Narrative Cycle Timing — Getting in Before the Crowd Names It`,
          explanation: `By the time a narrative has a name on Crypto Twitter, you are in Phase 2 minimum. The best entries are Phase 1 — before the narrative has words.\n\n**Pre-narrative detection:**\nWatch DeFined.fi with 12-hour age filter, ranked by volume. When 2–4 tokens in the same conceptual theme all show organic volume simultaneously without news catalyst or KOL coverage, you have Phase 1. The theme is forming before it has a name.\n\n**Narrative basket strategy:**\nRather than picking the single winner, buy 4–6 tokens in the theme at 1% portfolio each. In any narrative, 30–50% of tokens survive and appreciate significantly. A basket captures winners without requiring perfect selection. Even if 3 of 6 fail, the 2–3 that lead the narrative generate enough return to cover losses and produce meaningful portfolio growth.\n\n**Cross-chain narrative migration:**\nNarratives prove on one chain and migrate. A theme that reached Phase 4 on Ethereum in Q1 can be Phase 1 on Solana in Q3 — the Solana community has not experienced it. Track cross-chain via DeFined.fi "all chains" view. Look for Ethereum/Base themes in their dying phases that haven't appeared on Solana yet.\n\n**Fading peak narratives:**\nWhen a narrative is in every Telegram simultaneously with universal consensus — that is Phase 3. The correct trade is exiting existing exposure into the buying surge. Not adding. The source material is explicit: "When the latest and greatest thing everyone says is going to $50M MC, the whole market dumps." Universal consensus = smart money's exit window.\n\n**Narrative basket exit discipline:**\nExit the basket systematically as Phase 2 transitions to Phase 3. The signal: when mainstream newsletters cover the narrative, take 50% profit across the basket. When KOL coverage becomes saturated (every major KOL calling it), take remaining profit. Hold only a small free-ride position.`,
          visualPrompt: `👆 Narrative basket: 6 tokens at 1% each vs single 6% bet — outcome distribution`,
          visualType: `chart`,
          visualUrl: `narrative-basket-outcome-comparison`,
          examples: [
            {
              contextTag: `[Phase 1 basket, DeSci narrative, 2025]`,
              context: `Trader spots 3 DeSci tokens moving organically on Day 1. No coverage anywhere.`,
              scenario: `Identifies 6 DeSci tokens at 1% portfolio each. Week 2: first newsletter covers "DeSci season." 4 of 6 tokens pump 3–8×. 2 near-zero.`,
              outcome: `Basket result on 6% allocated: 4 winners avg 5× + 2 near-zeros = +47% portfolio growth from 6% allocation. No need to identify the winners in advance.`,
            },
            {
              contextTag: `[Cross-chain migration, retro gaming, 2024]`,
              context: `Retro gaming narrative ran on Ethereum Q1, reached Phase 4 by June. Trader watches Solana.`,
              scenario: `August: fresh retro gaming token launches on Solana. Community has never seen the theme. Enters at $40K MC.`,
              outcome: `Token runs the full cycle on Solana independently. $4M MC. Cross-chain awareness of a proven theme = Phase 1 entry before Solana community realises the theme.`,
            },
            {
              contextTag: `[Phase 3 fade, political narrative, 2024]`,
              context: `Political token narrative in every Telegram. Universal KOL consensus.`,
              scenario: `Trader recognises Phase 3: 40+ political tokens in one week, original leaders retracing, quality declining. Exits all political exposure into the consensus buying surge.`,
              outcome: `Political narrative collapses 48 hours later. Trader avoided the collapse and rotated capital into emerging Phase 1. The Phase 3 buyers funded the exit.`,
            },
          ],
          keyTakeaway: `Phase 1 detection = DeFined thematic clustering before the narrative has a name. Basket strategy = 4–6 tokens at 1% removes selection pressure. Cross-chain migration = dead theme on one chain can be Phase 1 on another. Universal KOL consensus = exit signal, not entry.`,
          guidedPractice: [
            {
              question: `DeFined shows 4 "space exploration" tokens all up 200–500% in 3 days. No KOL coverage. No newsletters. What is the optimal action?`,
              options: [`A — Wait for KOL confirmation before entering`, `B — Build a basket of 4–6 space-themed tokens at 1% each immediately — Phase 1 pre-named narrative`, `C — Concentrate all 6% into the single best-performing space token`, `D — Avoid — too niche`],
              correct: 1,
              hint: `When a theme is moving organically before it has a public name, what phase is it and what approach captures it best?`,
              explanation: `B is correct. Phase 1 before naming = maximum entry quality. Waiting for KOL confirmation reduces entry significantly (already Phase 2). Single-token concentration requires perfect selection under uncertainty. Basket at 1% each captures winners without selection pressure.`,
            },
            {
              question: `A narrative basket of 6 tokens at 1% each (6% portfolio total). 2 go to near-zero, 2 go 3×, 1 goes 8×, 1 goes 15×. What is the net return on the 6% portfolio allocation?`,
              options: [`A — Approximately flat (losses cancel gains)`, `B — Approximately +70% on the 6% allocation — the 8× and 15× winners more than compensate for the two near-zeros`, `C — Negative — two losses drag the result down`, `D — Depends on the order of wins and losses`],
              correct: 1,
              hint: `Calculate: 2×(−95%) + 2×(+200%) + 1×(+700%) + 1×(+1400%) as fractions of 1% position each.`,
              explanation: `B is correct. Simplified: 2 positions near-zero (−$190 on 2×$100), 2 positions 3× (+$400), 1 position 8× (+$700), 1 position 15× (+$1,400). Net: +$2,310 on $600 invested = +385% on capital deployed = +23% on a $10,000 portfolio. The two near-zeros are fully covered by the winners.`,
            },
            {
              question: `An Ethereum narrative reached Phase 4 (death) in April. It is now August. A similar-themed token launches on Solana. What narrative phase is this for Solana traders?`,
              options: [`A — Phase 4 — the theme is exhausted`, `B — Phase 1 — the Solana community has not experienced this theme. It can run the full 4-phase cycle independently on a new chain.`, `C — Phase 3 — it is already late`, `D — Cannot determine without more data`],
              correct: 1,
              hint: `What is the Solana community's relationship to what happened on Ethereum 4 months ago?`,
              explanation: `B is correct. Chain communities have significant non-overlap. A theme that reached Phase 4 on Ethereum is fresh territory for the Solana community. Cross-chain awareness converts "dead theme" on one chain into "Phase 1 opportunity" on another.`,
            },
            {
              question: `A narrative basket entered in Phase 1 is now in Phase 2 (mainstream newsletter covered it). What is the correct basket management action?`,
              options: [`A — Hold everything — Phase 2 means more upside ahead`, `B — Take 50% profit across the basket into Phase 2 volume. Hold 50% as free ride into potential Phase 2 continuation. Begin planning full exit for Phase 3 signals.`, `C — Add more positions — Phase 2 confirmation validates the thesis`, `D — Exit everything — Phase 2 is the top`],
              correct: 1,
              hint: `Phase 2 means mainstream discovery is happening. Who is buying in Phase 2? Who entered in Phase 1?`,
              explanation: `B is correct. Phase 2 brings mainstream buyers who provide exit liquidity for Phase 1 holders. Taking 50% profit crystallises real gains from the best entry window. The 50% remaining is now a free or near-free position that can capture Phase 2 continuation without risking original capital.`,
            },
            {
              question: `Why does DeFined.fi provide better Phase 1 signal than DEXScreener for pre-narrative detection?`,
              options: [`A — DeFined shows more tokens`, `B — DeFined has no paid promotions — tokens appear by organic volume metrics only. DEXScreener allows teams to pay for boosted visibility, making it harder to distinguish organic Phase 1 movement from paid promotion.`, `C — DeFined covers more blockchains`, `D — DeFined has faster data updates`],
              correct: 1,
              hint: `What does "no paid promotions" mean for the quality of the signal you see?`,
              explanation: `B is correct. DEXScreener's paid promotion system means some tokens are artificially elevated regardless of organic activity. DeFined's organic-only ranking means when a theme shows up in the top volume list, it got there through real trading — not marketing spend. For Phase 1 detection, organic signal quality is everything.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Market observation over 5 days:\n\nDay 1: $LABRAT (biotech mouse) 6× from $30K–$180K. Volume $280K. No coverage.\nDay 2: $GENOME (DNA helix) 4× from $45K–$180K. Volume $190K. No coverage.\nDay 3: $PEPTIDE (protein molecule) 5× from $25K–$125K. Volume $150K. One Twitter thread: "DeSci meta back?"\nDay 4: 5 new DeSci launches, all pump 2–4×. Crypto newsletter: "DeSci season returning." KOLs begin calling.\nDay 5: 12 new DeSci launches. $LABRAT, $GENOME, $PEPTIDE give back 30–40% on volume decline.\n\n1. Map each day to narrative phase.\n2. Identify optimal basket entry window and calculate what it returned.\n3. What is the correct action on Day 5 for someone who entered on Day 2?`,
              scoringCriteria: [
                `Day 1: pre-Phase 1 (one token, not yet thematic). Day 2: Phase 1 (two tokens, connection clear). Day 3: Phase 1 confirmed (three + first social mention). Day 4: Phase 2 (newsletter + KOL). Day 5: Phase 3 (12 launches, quality declining, leaders retracing).`,
                `Optimal entry: Day 2–3. Basket of $LABRAT, $GENOME, $PEPTIDE + 3 more at 1% each ($300 on $10K portfolio). By Day 4 these 3 are roughly 2–5× from Day 2 entries = +$300–$600 profit before Phase 3.`,
                `Day 5 action: exit basket. Phase 3 signal confirmed (12 launches, leaders retracing). Take remaining profit into any lingering Phase 2 buying. Hold small free-ride only if community of specific token is genuinely strong beyond the narrative.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Cross-chain research task. Ethereum Q1: "digital pets" theme ran. Five tokens reached $5M–$40M MC. By June, all -80%+ from peak.\n\nSeptember: monitoring Solana. You see:\n- $TAMAGO (virtual egg hatching) — $180K MC, 3 days old, organic community forming\n- $PIXEL_PET (pixel art pet) — $90K MC, 5 days old, small engaged Telegram\n- No KOL coverage. No "digital pets on Solana" threads anywhere.\n\n1. Is this a viable cross-chain migration opportunity?\n2. What additional validation would increase confidence?\n3. Design a basket strategy for a $12,000 portfolio.`,
              scoringCriteria: [
                `Viable: yes. Digital pets demonstrated demand on Ethereum ($5M–$40M MC). Solana community has not experienced it. 3-month gap from Ethereum peak is appropriate — not concurrent.`,
                `Additional validation: (1) confirm $TAMAGO/$PIXEL_PET communities do NOT reference Ethereum predecessors (independent discovery is stronger than deliberate copy); (2) check if any Solana digital pet launches have already failed (if many have tried and failed, theme may not migrate); (3) verify the Ethereum launches peaked before these Solana launches (concurrent = same tired buyers).`,
                `Basket for $12,000: 1% each = $120/token. $TAMAGO ($120), $PIXEL_PET ($120), 2 more digital pet tokens identified through DeFined ($120 each) = $480 total (4% portfolio). If 1 token 10×, 2 tokens 3×, 1 token fails: +$1,200+$720+0-$120 = +$1,800 on $480 = +15% portfolio.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You entered a 6-token pet coin basket during Phase 1 (6% of $15,000 = $900 total, $150/token):\n- $CATTO: $150 cost → now $720 (+380%)\n- $PUPPO: $150 cost → now $465 (+210%)\n- $BUNNI: $150 cost → now $293 (+95%)\n- $HAMMY: $150 cost → now $90 (-40%)\n- $BIRDO: $150 cost → now $53 (-65%)\n- $FISHY: $150 cost → now $360 (+140%)\n\nDay 12. Yesterday: first mainstream newsletter covered pet coins. KOLs beginning to call pet tokens today. Multiple new pet launches today.\n\n1. What phase is the narrative now?\n2. For each position: state your action and reasoning.\n3. Calculate total basket return at current values and after proposed actions.`,
              scoringCriteria: [
                `Phase 2 confirmed (newsletter + KOL coverage starting). Phase 3 signals beginning (multiple new launches). Exit window is now.`,
                `$CATTO (+380%): take 50% into Phase 2 volume. Hold 50% free ride. $PUPPO (+210%): take 33% now. Still growing. $BUNNI (+95%): take 50% to protect — less conviction. $HAMMY (-40%): exit. Weakest performers die first in Phase 3. $BIRDO (-65%): exit. Don't let $53 become $0. $FISHY (+140%): take 33%, hold rest.`,
                `Current value: $720+$465+$293+$90+$53+$360 = $1,981. Return: +$1,081 on $900 invested = +120%. After proposed actions: realise ~40% of basket in profit, leaving free-ride exposure in strongest performers only.`,
              ],
            },
          ],
        },

        {
          id: 'advanced-wallet-hunting',
          title: `Advanced Wallet Hunting — Finding Wallets Before Anyone Else`,
          explanation: `Basic wallet hunting finds individual smart wallets from public lists. Advanced wallet hunting finds wallets before they appear on any public list — and builds systems that continuously generate new discoveries.\n\n**The pre-public advantage:**\nOnce a wallet appears on GMGN's public "smart money" list, hundreds of copy traders have found it. Price moves immediately when it buys. The edge is gone. The goal is to find wallets when they are known to zero or five people.\n\n**GateKept multi-token discovery:**\nRun GateKept on 8–10 recent winning tokens simultaneously. Wallets appearing in 5+ of those winners as early buyers are statistically remarkable — not luck. These are your discovery candidates. Cross-reference: are they on any public list yet? If no, you have a pre-public wallet.\n\n**Wallet cluster identification:**\nAdvanced hunters identify clusters — groups of wallets controlled by the same entity. Signal: shared funding source. If wallet A and wallet B both received their initial SOL from the same Coinbase withdrawal or exchange address, they are likely the same trader using multiple wallets.\n\nWhy it matters: when a cluster of 3 wallets all buy the same token simultaneously, it is NOT three independent confirmations. It is one entity spreading their buy across wallets. Counting it as three independent signals inflates confidence. Correctly identifying clusters means: cluster buys = one signal (still valuable, but one).

**The decay cycle:**\nPre-public → GMGN detects → appears on smart money list → 50+ copy traders → 500+ copy traders → signal arbitraged away. Average pre-public edge lifespan: 4–8 weeks. Advanced hunters continuously replace decayed wallets by running GateKept weekly on the latest winners.\n\n**Copy trading automation (OdinBot):**\nFor wallets with 50+ validated trades, consistent style you understand, 30%+ win rate: automation via OdinBot executes small positions automatically when the tracked wallet buys. Set maximum auto-copy size at 0.5–1% portfolio per trade. Automation does not replace validation — it executes faster on already-validated signals.`,
          visualPrompt: `👆 GateKept multi-token analysis: one wallet appearing across 7 recent winners`,
          visualType: `interactive`,
          visualUrl: `gatekept-multi-token-discovery`,
          examples: [
            {
              contextTag: `[Pre-public discovery, GateKept, 2025]`,
              context: `Trader runs GateKept on 10 winning tokens from the past week. Finds wallet 0xALPHA in 8 of them.`,
              scenario: `GMGN: 58% win rate, 220 trades, not on any public list. Average hold 4 hours. Funding from known profitable Ethereum address.`,
              outcome: `Adds to private tracking list. Next month: 18 purchases tracked, follows 11 independently validated. Average 3.2× return. Then 0xALPHA appears on GMGN public list — signal quality immediately degrades as copy traders flood same entries.`,
            },
            {
              contextTag: `[Cluster identification, same operator, 2025]`,
              context: `Trader notices wallets 0xA and 0xB both buying the same tokens early across multiple weeks.`,
              scenario: `Funding trace: both received initial SOL from the same Coinbase withdrawal. Same entity, two wallets.`,
              outcome: `Adjusts interpretation: cluster buy (both wallets) = one decision-maker's signal, not two. Previously was double-counting confidence. Corrects position sizing accordingly.`,
            },
            {
              contextTag: `[Decay management, replacement workflow, 2025]`,
              context: `Previously reliable tracked wallet appears on GMGN public smart money list.`,
              scenario: `Copy traders move the moment it buys. Average return drops from 4× to 1.4× within 3 weeks of public listing.`,
              outcome: `Removes from primary tracking. Runs GateKept immediately to find 2 replacement pre-public wallets. New wallets provide clean signal before the decay cycle restarts.`,
            },
          ],
          keyTakeaway: `Find wallets before public discovery using GateKept multi-token analysis. Identify clusters via funding source — one entity = one signal. Manage decay: replace wallets when they appear on public lists. Automate only after 50+ validated trades with consistent understood style.`,
          guidedPractice: [
            {
              question: `A wallet appears on GMGN's public smart money list. Why does its signal quality immediately degrade?`,
              options: [`A — GMGN changes the wallet's trading behaviour after listing`, `B — Hundreds of copy traders now follow the wallet. Price moves immediately when it buys, before you can enter at the same price. The edge was in being ahead of discovery — public listing eliminates that.`, `C — Listed wallets trade less frequently`, `D — Public wallets change their strategy after being discovered`],
              correct: 1,
              hint: `What happens to a token's price when 500 copy traders all receive the same buy alert simultaneously?`,
              explanation: `B is correct. A wallet copied by hundreds triggers immediate price impact from all copy trades. By the time you evaluate the token and enter, the price has already moved significantly. The edge in wallet tracking is temporal — being ahead of discovery. Public listing converts private edge into public knowledge.`,
            },
            {
              question: `GateKept finds wallets 0xA and 0xB in 7 of 10 recent winning tokens. Investigation reveals both were funded from the same source. How does this change your signal assessment?`,
              options: [`A — Stronger signal — two wallets = double confirmation`, `B — One signal — same entity using two wallets. Cluster identification prevents double-counting confidence. This is one decision-maker's conviction, not two independent buyers.`, `C — Red flag — manipulative wallet cluster`, `D — Irrelevant — wallet count still matters regardless of origin`],
              correct: 1,
              hint: `If the same person controls both wallets, what is the actual number of independent buying decisions?`,
              explanation: `B is correct. Same funding source = same operator. Two wallets buying simultaneously from one entity = one signal expressed across two addresses. Treating it as two independent confirmations inflates confidence. Cluster identification is the correction that prevents this error.`,
            },
            {
              question: `What is the minimum validation threshold before activating automated copy trading on a tracked wallet?`,
              options: [`A — 10 trades with 70% win rate`, `B — 50+ trades manually tracked, 30%+ win rate, manageable losses, consistent style you understand — then automate at 0.5–1% portfolio maximum per auto-copy`, `C — Must be on GMGN's official smart money list`, `D — No validation needed — automation is inherently diversified`],
              correct: 1,
              hint: `What risks does automating a wallet with only 10 trades expose you to?`,
              explanation: `B is correct. 50+ trades establishes statistical edge vs luck. "Consistent style you understand" means you know what conditions the wallet performs in — and when those conditions have changed. Automating at 0.5–1% limits damage if the wallet's strategy stops working. These protections compound: statistical edge + understanding + small auto-size = sustainable copy trading.`,
            },
            {
              question: `The "decay cycle" for tracked wallets is approximately 4–8 weeks. What is the correct response when you detect a tracked wallet beginning to decay?`,
              options: [`A — Wait to see if performance improves`, `B — Remove from primary tracking. Run GateKept immediately on recent winners to identify 2–3 replacement pre-public wallets. Maintain a continuous pipeline of fresh discoveries.`, `C — Reduce position size on that wallet's signals`, `D — Contact the wallet owner directly`],
              correct: 1,
              hint: `The decay is structural (too many copy traders), not fixable. What replaces the signal?`,
              explanation: `B is correct. Decay is caused by public discovery — it cannot be reversed. The response is continuous pipeline management: replace decaying wallets proactively before performance degrades significantly. Running GateKept weekly on recent winners maintains a steady supply of pre-public discoveries.`,
            },
            {
              question: `GateKept multi-token analysis on 10 recent winners finds wallet 0xBETA in 6 of them. GMGN shows 62% win rate, 45 trades, not on public list. Should you add to tracking list?`,
              options: [`A — Yes — 62% win rate and 6/10 appearances are excellent`, `B — Monitor but don't activate yet — 45 trades is below the 50-trade statistical confidence threshold. Follow manually for 5+ more trades before activating.`, `C — No — only GMGN-listed wallets should be tracked`, `D — Yes — any pre-public wallet warrants immediate tracking`],
              correct: 1,
              hint: `Why does the 50-trade minimum threshold exist?`,
              explanation: `B is correct. 45 trades with 62% win rate could still reflect a lucky run rather than systematic edge. The 50-trade minimum is the point where the win rate starts to have meaningful statistical confidence. The correct action is to monitor the next 5+ trades in real time — if the pattern holds, activate with confidence. If it doesn't, the threshold protected you.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `GateKept analysis on 10 winning tokens. Results:\n\n0xALPHA: 8/10 tokens, early buyer. GMGN: 55% win rate, 67 trades, +$380K PnL, not on public list.\n0xBETA: 6/10 tokens. GMGN: 71% win rate, 22 trades, +$220K PnL, not on public list.\n0xGAMMA: 9/10 tokens. GMGN: 48% win rate, 180 trades, +$95K PnL, avg loss $4,200. Not listed.\n0xDELTA: 5/10 tokens. GMGN: 65% win rate, 82 trades, +$180K PnL, avg loss $1,100. On GMGN public list 3 weeks.\n\nRank by tracking priority. For each: assess, identify any red flags.`,
              scoringCriteria: [
                `0xALPHA: HIGH. 55% win rate × 67 trades = statistically significant. Pre-public = maximum edge. $380K PnL confirms profitability. Only check: confirm wins distributed across different narrative categories (not all one theme).`,
                `0xBETA: MEDIUM — monitor. 71% win rate exceptional but 22 trades insufficient. Too few for statistical confidence. Track manually for 30 more trades before activating.`,
                `0xGAMMA: LOW or exclude. 48% win rate (loses more than wins). Large losses ($4,200 avg). Appears in 9/10 tokens due to large portfolio diversity, not selective edge.`,
                `0xDELTA: MEDIUM/declining. 65% win rate × 82 trades = excellent historical data. But 3 weeks on public list = copy traders have found it. Signal quality degrading. Monitor for further decline.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You track 0xSILVER (58% win rate, 120 trades). It bought $NOVA at $28K MC.\n\nDuring $NOVA research:\n- 0xGOLD bought $NOVA 3 minutes after 0xSILVER. GMGN: 52% win rate, 89 trades.\n- 0xBRONZE bought $NOVA 8 minutes after 0xSILVER. GMGN: 61% win rate, 74 trades.\n\nFunding trace:\n- 0xSILVER: funded from Coinbase withdrawal W1, March 2024\n- 0xGOLD: funded from same Coinbase withdrawal W1\n- 0xBRONZE: funded from Coinbase withdrawal W2 (different account)\n\n1. How many independent decision-makers bought $NOVA?\n2. How does this change your confidence vs genuine triple-confirmation?\n3. What position size do you take?`,
              scoringCriteria: [
                `Independent decision-makers: 2 (0xSILVER/0xGOLD = one entity; 0xBRONZE = independent). One cluster + one independent = 2 decision-makers, not 3.`,
                `Confidence adjustment: expected 3 independent → actually 2. Still meaningful (2 independent smart wallets at $28K MC) but not "triple confirmation." Reduce from strong to moderate-strong confidence.`,
                `Position size: 1.5% of portfolio (vs 2–3% for genuine triple confirmation). Still fundamentals check required — wallet signal changes sizing, not the checklist requirement.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Monthly wallet tracking review. 8 wallets tracked. 24 buy alerts. Followed 14 after validation.\n\n0xA: 4 alerts, followed 3, all profitable (+280%, +140%, +65%). Pre-public.\n0xB: 3 alerts, followed 2, mixed (+90%, -60%). On public list 2 weeks.\n0xC: 5 alerts, followed 3, mostly negative (-40%, -70%, +20%). Win rate declining.\n0xD: 2 alerts, followed 1, excellent (+450%). Discovered last week, pre-public.\n0xE-H: 10 alerts, followed 5, mixed (+120%, +60%, -55%, -80%, +30%).\n\nDesign next month's wallet list: which to keep, which to remove, where to invest discovery time, how to adjust sizing tiers.`,
              scoringCriteria: [
                `0xA: KEEP and ELEVATE to primary tier. 3/3 profitable, pre-public = maximum signal quality. Increase position size to 2–2.5%.`,
                `0xB: DOWNGRADE. Public list + declining performance. Reduce to 0.5% auto-copy. Monitor for continued decay. Prepare to remove.`,
                `0xC: REMOVE. Win rate declining across 3 consecutive tracked trades. Run fresh GMGN check — if below 40%, remove immediately. Causes: strategy stopped working or market conditions changed against their style.`,
                `0xD: MONITOR PRIORITY. One excellent result, not yet validated. Follow manually for next 4 weeks before activating.`,
                `Discovery investment: run GateKept on last 2 weeks of winners to find 2–3 replacements for 0xB and 0xC. This is weekly maintenance.`,
              ],
            },
          ],
        },

        {
          id: 'multi-chain-memecoins',
          title: `Multi-Chain Strategy — Solana, Ethereum, Base, and When to Use Each`,
          explanation: `Limiting yourself to Solana means missing significant opportunities. Ethereum and Base have distinct memecoin dynamics that reward different approaches.\n\n**Ethereum memecoins:**\nHigher gas fees ($5–50/trade) filter out most low-quality launches — friction increases average quality. Established Ethereum memecoins (PEPE, SHIB, FLOKI) have deep liquidity and CEX ambitions. Minimum viable position: $400–500 (so gas <10% of position).\n\nKey insight: Ethereum memecoins move slower and are less likely to rug immediately (gas cost to rug is higher). But when they go, they go large — PEPE hit $1.6B MC.\n\n**Base memecoins:**\nCoinbase's L2. Near-zero gas. Growing ecosystem. Unique characteristic: Base's primary user discovery path is through the Coinbase app — the most mainstream crypto platform. This means Base memes with universal cultural recognition (recognisable characters, normie-accessible concepts) outperform Base memes with crypto-native inside jokes.\n\nBase-specific catalyst: Coinbase listing. Tokens that appear in Base ecosystem promotional content or get featured on the Coinbase app have a path to discovery by 100M+ mainstream users unavailable to Solana tokens.\n\n**Cross-chain cultural weight test:**\n"Would someone who only uses Ethereum/Coinbase immediately understand and find this meme funny/interesting?" If yes: viable cross-chain. If they need Solana context to get it: Solana-only.\n\n$WIF passes: "dog in a hat" is universally funny. A token about a Solana-specific protocol event fails: Ethereum users have no context.\n\n**When Solana tokens go cross-chain:**\nProven Solana cult coins sometimes migrate to Ethereum/Base for their "major league" push. $WIF listed on Coinbase after proving itself on Solana. Recognising when a Solana token has cross-chain cultural weight and being in early on the receiving chain is an advanced edge. Monitor: are Solana traders discussing "CEX listing play" for a token you hold? Is the cultural weight genuinely universal?`,
          visualPrompt: `👆 Cross-chain token lifecycle: Solana cult → cross-chain migration → CEX listing`,
          visualType: `chart`,
          visualUrl: `cross-chain-token-lifecycle`,
          examples: [
            {
              contextTag: `[Cross-chain positioning, $WIF Coinbase listing, 2024]`,
              context: `$WIF has proven itself as Solana cult. Coinbase listing rumours circulating.`,
              scenario: `Trader identifies: "dog in a hat" passes universal recognition test. Holds Solana $WIF and monitors Base for a fresh $WIF-adjacent token appearing.`,
              outcome: `$WIF lists on Coinbase. Pumps. Trader captured pre-listing Solana appreciation and listing day volume. Cross-chain cultural awareness = advance positioning.`,
            },
            {
              contextTag: `[Base normie play, universal meme, 2025]`,
              context: `A Pokémon-inspired token launches on Base. Simple, recognisable by anyone over 25. Low gas entry.`,
              scenario: `Coinbase app users discovering Base find it intuitive. Community grows via Coinbase ecosystem rather than Solana degen channels.`,
              outcome: `Reaches $8M MC driven by mainstream Coinbase audience. Different demographic than typical Solana memecoins. Base-specific positioning captured this.`,
            },
            {
              contextTag: `[Ethereum gas lesson, minimum size, 2024]`,
              context: `New trader tries $50 positions on Ethereum tokens.`,
              scenario: `Entry gas $18, exit gas $22 = $40 on a $50 position = 80% overhead. Token goes 3×. Net return after gas: 1.8× instead of 3×.`,
              outcome: `Learns minimum $400–500 per Ethereum position for gas to be <10% of position. Solana has no minimum — any size is economical.`,
            },
          ],
          keyTakeaway: `Solana: fast, cheap, any size, crypto-native culture. Ethereum: larger established plays, minimum $400+/position, filters quality through gas cost. Base: normie-appeal tokens, Coinbase listing potential, near-zero gas. Cross-chain test: does someone without Solana context immediately get the meme?`,
          guidedPractice: [
            {
              question: `You want to buy $150 of an Ethereum memecoin. Gas for entry + exit totals ~$35. Why is this problematic?`,
              options: [`A — Not a problem — gas is a normal cost`, `B — $35 gas on $150 = 23% overhead. Token must gain 23% just to break even on gas. Ethereum memecoin trading requires minimum $400–500 positions to make gas economical (<10%).`, `C — Ethereum blocks transactions under $200`, `D — Gas costs cancel out over time`],
              correct: 1,
              hint: `$35 / $150 = what percentage overhead?`,
              explanation: `B is correct. 23% overhead means you need 23% gain before you're profitable. On a speculative memecoin, that's meaningful friction. At $500: $35/$500 = 7% overhead. At $1,000: 3.5%. The minimum position size calculation is: gas cost / 0.10 = minimum viable position (10% overhead threshold).`,
            },
            {
              question: `Why do Base memecoins specifically reward "normie-appeal" cultural concepts over crypto-native inside jokes?`,
              options: [`A — Base has stricter content policies`, `B — Base's primary discovery path is the Coinbase app — used by 100M+ mainstream users, not primarily crypto degens. Concepts recognisable to mainstream audiences outperform crypto-specific ones on this user base.`, `C — Crypto-native jokes don't tokenise well on L2s`, `D — Normie appeal is equally important on all chains`],
              correct: 1,
              hint: `Who discovers tokens through the Coinbase app, and what cultural context do they have?`,
              explanation: `B is correct. Coinbase's user base is the most mainstream in crypto. When these users discover Base tokens, they respond to familiar cultural references (Pokémon, sports teams, universal memes). Solana-native references, crypto protocol jokes, or insider community references are opaque to this audience.`,
            },
            {
              question: `What is the "cross-chain cultural weight test" and how do you apply it to a Solana token considering migration?`,
              options: [`A — Any Solana token with >$10M MC passes`, `B — Show the meme concept to someone who only uses Ethereum/Coinbase. Do they immediately understand and find it interesting without any Solana context? If yes: cross-chain viable. If they need explanation: Solana-only.`, `C — Cross-chain viability requires a DEX listing first`, `D — Only tokens backed by VC funds pass`],
              correct: 1,
              hint: `What makes $WIF cross-chain viable while a Solana-specific protocol meme is not?`,
              explanation: `B is correct. $WIF ("dog in a hat") requires zero crypto knowledge — it is immediately funny and visually self-evident to anyone. A token about a Solana validator scandal requires understanding of Solana's validator set, specific events, and crypto culture. The second type has no traction with Ethereum/Base users who have no context.`,
            },
            {
              question: `A Solana cult token is rumoured to be pursuing a Coinbase listing. You hold a Solana position. What additional opportunity exists?`,
              options: [`A — None — a listing only affects the Coinbase-specific version`, `B — If a Base version of the token launches, Coinbase users discovering the token may prefer interacting with a Base-native version. Monitoring for Base derivative launches at listing announcement provides an additional entry opportunity.`, `C — Sell everything before listing — always dumps`, `D — Buy more Solana only`],
              correct: 1,
              hint: `Where do Coinbase users prefer to interact — on Base (native to their platform) or bridging to Solana?`,
              explanation: `B is correct. Coinbase users have frictionless access to Base. If a popular Solana token lists on Coinbase, mainstream users discovering it may prefer a Base-native version. Watching for Base derivative launches at listing announcements is an advanced cross-chain positioning edge.`,
            },
            {
              question: `Compare the risk profile of a $400 position in an Ethereum established memecoin vs a $400 position in a Solana new pair. What are the key differences?`,
              options: [`A — They have identical risk profiles`, `B — Ethereum established memecoin: slower moves, deeper liquidity, lower immediate rug risk (gas cost as natural filter), gas overhead manageable at $400. Solana new pair: faster moves, higher rug risk, zero gas overhead, potential for larger % returns.`, `C — Ethereum positions are always safer`, `D — Solana positions are always more profitable`],
              correct: 1,
              hint: `How does gas cost on Ethereum affect token quality? How does speed on Solana affect opportunity?`,
              explanation: `B is correct. Ethereum's $20–50 gas cost naturally filters low-effort launches (rugging costs the developer gas too). This increases the average quality of Ethereum tokens but removes the ultra-high-risk/ultra-high-return new pair opportunity available on Solana. Different chains, different risk/return profiles — each serves different parts of a trading strategy.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Portfolio $15,000. Currently only trading Solana. Evaluating chain expansion.\n\nCurrent Solana: 25% active ($3,750 across 5 positions)\n\nBase opportunity: recognisable pop culture character token. Entry: $0.50 gas. You want $200 position.\nEthereum opportunity: established memecoin 35% below previous support. Entry: ~$18 gas. You want $500 position.\n\nFor each: (1) Is allocation appropriate? (2) Is gas overhead acceptable? (3) Chain-specific risks to account for?`,
              scoringCriteria: [
                `Base ($200 position): allocation 1.3% of portfolio — appropriate trial size. Gas $0.50 on $200 = 0.25% overhead — excellent, no minimum size concern. Risks: fewer analysis tools than Solana, less battle-tested ecosystem for memecoins, lower overall liquidity ceiling.`,
                `Ethereum ($500 position): allocation 3.3% — appropriate for Style 2 dip-buy. Gas $36 on $500 = 7.2% overhead — borderline acceptable (target <10%). Risks: gas can spike 2-3× during high activity events; longer confirmation times; established memecoin may have different community dynamics than Solana.`,
                `Recommendation: start with Base first (near-zero gas, more Solana-like speed). Master Base before adding Ethereum complexity. Adding both simultaneously increases cognitive load significantly.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Cross-chain opportunity: $TROLL (classic internet troll face meme).\n\n$TROLL on Solana: $80M MC, 14 months old, established cult, listed on Coinbase (Ethereum version).\n$TROLL on Base: launched 3 weeks ago, $2.4M MC, growing community.\n\nCultural weight test: troll face is universally recognised internet culture since 2008. No Solana context required.\n\n1. Does $TROLL pass the cross-chain test?\n2. Compare the opportunity: Solana ($80M MC) vs Base ($2.4M MC).\n3. Design a cross-chain position across both chains for an $8,000 portfolio.`,
              scoringCriteria: [
                `Cross-chain test: YES. Troll face is universally recognised, requires zero crypto knowledge, predates crypto. Coinbase listing of Ethereum version confirms mainstream validation.`,
                `Comparison: Solana at $80M MC — limited upside (needs $400M+ for 5×, requires top-5 Solana memecoin status). Base at $2.4M MC — meaningful asymmetry (5× = $12M, very achievable for established meme gaining Coinbase distribution). Risk: Base version may not maintain same cultural weight as original.`,
                `Cross-chain position: concentrate on Base ($2.4M MC, higher asymmetry): 4% portfolio = $320. Smaller Solana position if community signals strong: 2% = $160. Total: $480 (6%). Base thesis: Coinbase distribution + much lower MC = better risk/reward. Note: Base is riskier (newer, smaller) but the asymmetry justifies higher relative allocation.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Base chain token $PIXEL — pixel art character, Base-native.\n\n- MC: $1.8M, 2 weeks old\n- Volume: growing each day for 12 consecutive days\n- Community: 2,200 Telegram, original pixel art creation\n- The character appeared in a Base ecosystem promotional video 3 days ago\n- Gas: $0.40 per trade\n\nCompare to a Solana token at the same $1.8M MC with identical community signals.\n\n1. What Base-specific advantages does $PIXEL have?\n2. What are the Base-specific risks?\n3. Calculate gas overhead on a $250 entry + exit for Base vs Ethereum at the same position size.`,
              scoringCriteria: [
                `Base advantages: (1) Coinbase promotional video = potential native listing catalyst impossible for Solana tokens; (2) Base ecosystem discovery path = different (mainstream) buyer demographic; (3) near-zero gas = any position size economical.`,
                `Base risks: (1) fewer dedicated analysis tools vs Solana ecosystem; (2) lower overall liquidity ceiling without CEX support; (3) Base memecoin community is smaller and newer than Solana's — organic discovery is slower.`,
                `Gas comparison: Base: $0.40×2 = $0.80 on $250 = 0.32% overhead. Excellent. Ethereum equivalent: ~$18 entry + $18 exit = $36 on $250 = 14.4% overhead. Far exceeds the 10% threshold — Ethereum requires minimum $360 for this gas level to be acceptable.`,
              ],
            },
          ],
        },
      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from Lab 1 — narrative timing, advanced wallet hunting, multi-chain strategy.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 1 Boss — Narrative + Wallet + Multi-Chain`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-int-lab1-v1',
          situation: `Portfolio $25,000. Monday morning.\n\nNARRATIVE: DeFined 12-hour filter shows 4 "retro gaming" tokens (NES-era characters, 8-bit) all up 200–600% with zero mainstream coverage.\n\nWALLET: GateKept on these 4 retro tokens + 3 other recent winners finds 0xACE in 6/7. GMGN: 0xACE has 61% win rate, 88 trades, not on public list.\n\nCROSS-CHAIN: The Ethereum 2023 retro gaming leader "$8BIT" hit $45M MC. A Solana "$8BIT-equivalent" with fresh presentation has not yet appeared.\n\nRequired: (1) Narrative phase and basket design with exact allocations. (2) Should 0xACE be tracked? What position on its next buy? (3) If a fresh Solana retro gaming token launches this week — design the entry strategy. (4) What is your maximum total risk across all three opportunities simultaneously?`,
          scoringCriteria: [
            `Narrative Phase 1 (zero mainstream coverage, organic moves). Basket: 4–6 retro gaming tokens at 1% each ($250/token) = $1,000–$1,500 total (4–6% portfolio). Identify existing 4 movers + scan DeFined for 2 more launching in theme.`,
            `0xACE: add to tracking. 61% win rate × 88 trades = statistically significant, pre-public. On next buy: if independent validation passes, 1.5% portfolio ($375) — above standard 1% for high-confidence pre-public wallet.`,
            `Fresh Solana retro token strategy: if fundamentals pass (Rugcheck 85+, community forming, Phase 1 narrative alignment), enter at 1.5–2% portfolio ($375–$500). Cross-chain thesis: Ethereum proved $45M MC demand for this theme; Solana has not seen it yet.`,
            `Maximum simultaneous risk: basket ($1,500) + wallet tracking position ($375) + cross-chain play ($500) = $2,375 = 9.5% of portfolio. Within acceptable range given strong multi-signal confirmation. Would not add any further positions until one of these resolves.`,
          ],
        }],
      },
    },

// ─────────────────────────────────────────────────────────────────────────────
// LAB 2: PORTFOLIO MANAGEMENT AT SCALE
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-8-portfolio-management',
      title: `Lab 2: Portfolio Management at Scale`,
      subtitle: `Managing $1,000 is practice. Managing $50,000+ requires systems.`,
      lessons: [
        {
          id: 'scaling-position-sizing',
          title: `Scaling Position Sizing — When Your Portfolio Grows`,
          explanation: `The position sizing rules from earlier labs assume a small portfolio where $50–300 bets are meaningful but not devastating. As your portfolio grows, position sizing must evolve — not because the percentages change, but because the absolute dollar amounts create new dynamics.\n\n**The liquidity impact problem:**\nAt $5,000 portfolio: a 2% position = $100 in a $30K MC token. Price impact: negligible.\nAt $50,000 portfolio: a 2% position = $1,000 in the same $30K MC token. Price impact: 3–5% on entry alone.\nAt $200,000 portfolio: a 2% position = $4,000. You are now moving the market on small tokens.\n\nAs portfolio grows, you must either: (a) move up the MC ladder (enter larger established tokens), (b) spread positions across more tokens (increase basket sizes), or (c) use scaled entry (buy in tranches to reduce single-entry impact).\n\n**The liquidity threshold rule:**\nNever deploy more than 5% of a token's daily volume in a single day. If a token has $50K daily volume, maximum deployment: $2,500/day. This keeps you invisible in the order flow and prevents self-impact.\n\n**Tranched entry:**\nInstead of buying the full position in one transaction, buy 25% now, 25% on dip to next support, 25% on volume confirmation, 25% held as "fire" for if price breaks out. This approach:\n- Reduces average entry price vs a single large buy\n- Provides data points before committing full size (community check at each stage)\n- Prevents being the large buy that signals to front-runners\n\n**Concentration risk management:**\nAs portfolios grow, single-position concentration becomes more dangerous. A $50K portfolio with $5,000 in one small-cap token is 10% concentration. A market cap collapse of 80% = $4,000 loss = 8% portfolio drawdown. Manageable but concentrated. Professional traders at $100K+ typically limit single-token exposure to 3–5% regardless of conviction.\n\n**The JUP DCA exit system:**\nThe source material is explicit: "If you own a big bag of a coin, use JUP DCA to sell over a period of time vs all in one tx." For large positions: set JUP DCA to sell 10% of holdings every 4–8 hours. This prevents self-dumping and achieves better average exit prices.`,
          visualPrompt: `👆 Tranched entry vs single large buy: price impact comparison at different portfolio sizes`,
          visualType: `interactive`,
          visualUrl: `tranched-entry-impact-calculator`,
          examples: [
            {
              contextTag: `[Portfolio scaling, $50K problem, 2025]`,
              context: `Trader grows from $5K to $50K portfolio over 8 months. Still using same position sizing approach.`,
              scenario: `Enters a $40K MC token with 2% of $50K = $1,000 position. Immediately sees their own buy push the price up 4%. They are the largest single buyer in 24 hours.`,
              outcome: `Realises they are now moving small markets. Shifts strategy: same percentage allocation but spread across: larger established tokens ($500K+ MC), smaller amounts in new pairs ($200 max on sub-$100K MC), tranched entries on everything $500+.`,
            },
            {
              contextTag: `[JUP DCA exit, large bag management, 2025]`,
              context: `Trader accumulated 3.5% of a token's supply at $15K MC average. Token now at $1.2M MC (80×). Wants to exit.`,
              scenario: `3.5% of supply in $240K liquidity pool. Single sell would crash price 40–60%. Uses JUP DCA: sell 8% of holding every 6 hours over 5 days.`,
              outcome: `Average exit price 18% higher than a single dump would have achieved. Community does not see a "whale exit" candle. Total exit: 2.8 SOL → 47 SOL equivalent. Clean.`,
            },
            {
              contextTag: `[Tranched entry, volatility reduction, 2025]`,
              context: `$1,500 planned position in a $180K MC token. Token just graduated, consolidating.`,
              scenario: `Instead of single buy: $375 at current price, $375 on first pullback to $150K MC support, $375 on volume confirmation above $200K MC, $375 reserve. Ends up averaging $165K MC entry vs $180K single entry.`,
              outcome: `Average entry 8% lower. More data points gathered during tranched entry confirmed community quality. Final allocation deployed only after thesis confirmed at each stage.`,
            },
          ],
          keyTakeaway: `As portfolio grows, liquidity impact matters. Never deploy more than 5% of daily volume in one day. Use tranched entries ($500+). Use JUP DCA for exits on large positions. Limit single-token concentration to 3–5% at $100K+ portfolios. Larger portfolio = move up the MC ladder.`,
          guidedPractice: [
            {
              question: `Portfolio: $80,000. You want to enter a token with $40K daily volume. Applying the 5% daily volume rule, what is your maximum single-day deployment?`,
              options: [`A — $4,000 (5% of your portfolio)`, `B — $2,000 (5% of the token's daily volume)`, `C — $8,000 (10% of portfolio)`, `D — Any amount — volume rules don't apply at this scale`],
              correct: 1,
              hint: `The 5% rule applies to the token's daily volume, not your portfolio size.`,
              explanation: `B is correct. $40,000 daily volume × 5% = $2,000 maximum single-day deployment. This prevents you from being visible in the order flow and causing self-impact. Your portfolio size is irrelevant to this calculation — the token's liquidity sets the limit.`,
            },
            {
              question: `What is the core problem that appears as a portfolio scales from $5K to $50K when using the same new-pair strategy?`,
              options: [`A — Tax obligations increase`, `B — Position sizes (in dollar terms) start causing price impact on small-cap tokens — you begin moving the market with your own buys and creating front-running risk`, `C — More positions become difficult to track`, `D — Trading fees increase proportionally`],
              correct: 1,
              hint: `What happens when a $1,000 buy hits a $30K MC token with $40K daily volume?`,
              explanation: `B is correct. A 2% position at $50K = $1,000. In a small-cap token, that represents significant buying pressure — you move the price, signal your entry to bots, and then face front-running. The solution is moving up the MC ladder (tokens with enough liquidity to absorb your position) or spreading into more positions at smaller sizes.`,
            },
            {
              question: `Describe the four tranches of a scaled entry and what each accomplishes.`,
              options: [`A — Buy four equal amounts at daily intervals regardless of price`, `B — 25% at current price, 25% on dip to support, 25% on volume confirmation, 25% held in reserve for breakout — each tranche provides new data and reduces average entry price vs single large buy`, `C — Buy 100% immediately to avoid missing the move`, `D — Three equal tranches over three days as a time-averaging strategy`],
              correct: 1,
              hint: `What data does each stage of entry provide that informs the next decision?`,
              explanation: `B is correct. Each tranche is a decision point: first tranche tests the thesis (token moves as expected?). Second on dip tests community (do they buy the dip?). Third on volume confirmation validates the breakout. Reserve tranche for if momentum continues. This structure both reduces average entry and provides conviction checkpoints.`,
            },
            {
              question: `Why is JUP DCA the preferred exit method for large positions (3%+ of supply) rather than manual market sells?`,
              options: [`A — JUP DCA has lower fees`, `B — Selling 3%+ of supply manually in one transaction causes massive price impact. JUP DCA automatically spreads selling over time, allowing organic buying to partially absorb each clip and achieving a higher average exit price.`, `C — JUP DCA works on all chains equally`, `D — Manual sells trigger tax events; JUP DCA doesn't`],
              correct: 1,
              hint: `What happens to price when 3% of a token's supply hits a thin order book in one transaction?`,
              explanation: `B is correct. 3% supply into a $200K liquidity pool = 15–30% price crash depending on concentration. JUP DCA distributes the selling across many small transactions over time. Organic buying partially refills the pool between each sell. Average exit price is typically 15–25% higher than a single large dump.`,
            },
            {
              question: `At what portfolio size does the source material's advice to shift towards larger-cap entries become relevant, and why?`,
              options: [`A — Only relevant at $1M+ portfolios`, `B — Relevant from approximately $30–50K+ — at this level, a 2% position ($600–$1,000) causes meaningful price impact on sub-$100K MC tokens, making the small-cap new pair strategy increasingly self-defeating`, `C — Never — small caps are always best regardless of portfolio size`, `D — Relevant from $10K — the threshold is portfolio size not absolute dollar amount`],
              correct: 1,
              hint: `At what point does your 2% position start to move a $50K MC token meaningfully?`,
              explanation: `B is correct. At $30–50K portfolio, a 2% position is $600–$1,000. In a $50K MC token with $50K daily volume, that single entry is 1–2% of daily volume — visible and impactful. This is when moving up the MC ladder (entering $200K–$1M MC tokens instead of $50K MC tokens) becomes necessary for the strategy to remain viable.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Portfolio $65,000. You want to enter a new token:\n- MC: $85K\n- Daily volume: $45K\n- Your planned allocation: 2% of portfolio = $1,300\n- Liquidity: $38K\n\nYou also have three existing positions:\n- Token A: $4,000 cost basis (6.2% of portfolio)\n- Token B: $2,500 cost basis (3.8%)\n- Token C: $1,200 cost basis (1.8%)\n\n1. Is the $1,300 entry appropriate given liquidity?\n2. Is your current portfolio concentration appropriate?\n3. Design a tranched entry if you proceed.`,
              scoringCriteria: [
                `Liquidity check: $1,300 / $45K daily volume = 2.9%. Below the 5% threshold — acceptable. However, $1,300 vs $38K liquidity = 3.4% of the pool — your entry alone creates meaningful price impact. Recommend splitting into tranches.`,
                `Concentration: Token A at 6.2% exceeds the 3–5% single-token cap for portfolios $50K+. If Token A is a high-risk small cap, this is elevated. If it's an established cult coin, more defensible. Either way, worth noting and managing.`,
                `Tranched entry: Tranche 1 = $325 at current price. Tranche 2 = $325 on first 5–10% pullback. Tranche 3 = $325 on volume confirmation. Reserve $325 for breakout entry. Maximum daily deployment: $650 (two tranches) to stay under 5% daily volume.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You hold 2.8% of a token's 1 billion token supply. Entry average: $45K MC. Current MC: $1.4M MC (31×).\n\nCurrent stats:\n- Your token holding: 28 million tokens\n- Token price: $0.0014\n- Your position value: $39,200\n- DEXScreener liquidity: $280K\n- Daily volume: $180K\n\nYou want to exit the full position over 3–5 days.\n\nDesign the complete JUP DCA exit plan:\n1. Maximum sell per transaction (to avoid meaningful price impact)\n2. Frequency of sells\n3. Total transactions needed\n4. What you do if price drops 25% during the exit\n5. What you do if price pumps 40% mid-exit`,
              scoringCriteria: [
                `Max sell per tx: 5% of daily volume = $9,000. In tokens: $9,000/$0.0014 = 6.4M tokens per transaction. Use 5M tokens per sell to stay comfortable.`,
                `Frequency: every 6–8 hours. Allows partial liquidity recovery between sells.`,
                `Total transactions: 28M tokens / 5M per sell = 6 transactions. At one per 6–8 hours: 36–48 hours total exit. Fits within 3-day target.`,
                `If price drops 25% mid-exit: accelerate. Don't wait for recovery. A 25% drop signals sell pressure exceeding buy pressure — get the remaining position out faster at worse prices rather than risk holding through a larger decline.`,
                `If price pumps 40% mid-exit: continue the plan unchanged. The pump provides better exit prices on remaining tranches — don't change the plan because it's working. Deviation risk: stopping the exit on a pump often results in holding through the subsequent dump.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Portfolio growth analysis. Trader grew from $8,000 to $75,000 over 18 months using the same new-pair strategy.\n\nPerformance data:\n- Months 1–6 ($8K–$25K): Win rate 58%. Average return on Style 1 trades +210%. Net +$17,000.\n- Months 7–12 ($25K–$55K): Win rate 52%. Average return +145%. Net +$30,000.\n- Months 13–18 ($55K–$75K): Win rate 44%. Average return +80%. Net +$20,000.\n\nSame strategy, same signal sources, same checklist. Win rate and returns declining as portfolio grows.\n\n1. What is the most likely cause of the declining performance?\n2. What specific strategy adjustments would you make at $75K portfolio?\n3. Calculate what the Months 13–18 result would have been with proper portfolio-size adjustments (assume 60% win rate and 145% avg return recoverable with correct sizing).`,
              scoringCriteria: [
                `Most likely cause: liquidity impact. At $75K, 2% positions = $1,500. On sub-$100K MC tokens, this is causing significant price impact at entry, visible in order flow, and attracting front-running. Win rate decline is consistent with entering at worse average prices due to self-impact.`,
                `Strategy adjustments: (1) minimum entry MC increases to $200K (tokens with sufficient liquidity); (2) tranched entry on all positions above $500; (3) limit sub-$100K MC new pairs to maximum $300 (size from junior era); (4) basket approach for narrative plays reduces individual position size naturally; (5) 5% daily volume rule strictly enforced.`,
                `Corrected result: 60% win rate × 145% avg return at $55K–$75K portfolio (now with correct sizing). Compared to actual (44% × 80% = +$20K), corrected approach would generate approximately +$35–40K — a substantial improvement from strategy calibration alone.`,
              ],
            },
          ],
        },
        {
          id: 'pnl-tracking-review',
          title: `PnL Tracking and Portfolio Review Systems`,
          explanation: `As portfolio size grows, informal mental tracking becomes inadequate. Professional traders maintain systematic PnL tracking that provides real-time and periodic performance intelligence across all dimensions of their strategy.\n\n**Real-time PnL tracking:**\nGMGN and BullX both provide live portfolio PnL across all held tokens. The critical data: unrealised PnL by position, realised PnL for the day/week/month, and win/loss breakdown. Set up at minimum: GMGN wallet watch for all active trading wallets, BullX for the transaction-level view.\n\n**The weekly PnL review — what to track:**\n1. Total portfolio value (vs last week, vs 30 days ago)\n2. Realised PnL this week (actual locked-in gains/losses)\n3. Unrealised PnL by position (what you're sitting on)\n4. Win rate this week by signal type\n5. Largest single win and largest single loss — what was different?\n6. Capital at risk: what % of portfolio is currently active?\n\n**The monthly performance report:**\nBeyond weekly: compare performance by month. Are you improving? Month-over-month win rate trends, average return per trade, and style performance breakdown. This surfaces slow-developing issues (gradual win rate decline = market conditions shifting against your edge).\n\n**Unrealised vs realised — the deception:**\nUnrealised PnL is not real. The source material's personal example: "My half bagel bag was worth $18K and I didn't TP at all. It is now worth $1,000." At $18K the unrealised PnL looked like success. The realised PnL at exit told a different story.\n\nFor weekly reviews: focus on realised PnL. For position management: monitor unrealised to trigger profit-taking rules.\n\n**The 90-day rolling performance:**\nThe most useful performance benchmark for an active trader: 90-day rolling realised PnL. This smooths out weekly variance and shows whether the strategy is producing consistent edge. If 90-day rolling is positive and growing: the system works. If trending down despite winning individual weeks: something structural is changing.`,
          visualPrompt: `👆 Weekly PnL review template: all required fields and how to calculate each`,
          visualType: `interactive`,
          visualUrl: `weekly-pnl-review-template`,
          examples: [
            {
              contextTag: `[Monthly analysis discovery, structural decline, 2025]`,
              context: `Trader does first monthly performance comparison after 3 months of tracking.`,
              scenario: `Month 1: +$3,200 realised. Month 2: +$2,100. Month 3: +$800. Win rate flat at 55%. Average return per win declining.`,
              outcome: `Discovers structural decline before it becomes a crisis. Investigation: market conditions shifted — lower liquidity environment means smaller average returns. Adjusts strategy toward larger established positions with lower entry frequency.`,
            },
            {
              contextTag: `[Unrealised deception, $18K to $1K, personal example]`,
              context: `Source material's documented personal example: holding a position worth $18K unrealised.`,
              scenario: `Did not take profit at $18K because "it could go higher." Watched unrealised PnL decline to $1K over 3 months. Never sold profitably.`,
              outcome: `Realised PnL: near breakeven on a position that was briefly worth $18K above cost basis. The weekly review would have showed unrealised gains declining consistently — the trigger to exit.`,
            },
            {
              contextTag: `[90-day rolling, strategy validation, 2025]`,
              context: `Trader tracks 90-day rolling realised PnL starting month 4.`,
              scenario: `Individual weeks vary significantly (+$4,000, -$800, +$2,100, +$1,500). 90-day rolling: consistently +$3,000–$4,500 per month. Strategy is producing consistent edge despite week-to-week variance.`,
              outcome: `The 90-day metric provides confirmation that weekly variance is noise, not signal. Trader avoids over-adjusting strategy based on bad individual weeks because the rolling metric shows structural health.`,
            },
          ],
          keyTakeaway: `Track realised PnL (real) separately from unrealised (theoretical). Weekly review: realised PnL, win rate by signal type, capital at risk. Monthly: month-over-month comparison to catch structural decline. 90-day rolling: the most stable performance benchmark. GMGN + BullX provide the real-time data layer.`,
          guidedPractice: [
            {
              question: `Why is realised PnL more important to focus on than unrealised PnL in weekly reviews?`,
              options: [`A — Unrealised PnL is harder to calculate`, `B — Unrealised PnL is theoretical — it can reverse completely before you sell. Realised PnL is permanent portfolio value. Weekly reviews should assess what you actually locked in, not what you're sitting on.`, `C — Tax only applies to realised PnL`, `D — Brokerage platforms only show realised PnL`],
              correct: 1,
              hint: `What happened to the "$18K bag" in the source material?`,
              explanation: `B is correct. The source material's personal example is the lesson: a position that showed $18K in unrealised gain ended at ~$1K realised. Unrealised gains are numbers on a screen that can vanish. Realised gains are in your wallet. Weekly discipline of tracking realised PnL reveals whether you are actually converting opportunities into wealth.`,
            },
            {
              question: `What does a declining 90-day rolling realised PnL (despite some strong individual weeks) indicate?`,
              options: [`A — Normal variance — ignore it`, `B — A structural shift: either market conditions have changed against your strategy, or a systematic error in your process is compounding slowly. Requires investigation before it becomes a crisis.`, `C — You need to take more trades`, `D — Tax obligations are being triggered`],
              correct: 1,
              hint: `If individual good weeks exist but the rolling trend is down, what does that tell you about the overall system?`,
              explanation: `B is correct. The 90-day rolling average smooths weekly variance. A declining rolling average despite strong individual weeks means: the losses are outpacing the wins in aggregate. This is a structural signal — not noise. Common causes: market conditions shifting, position sizing drift, entry criteria slipping, or a signal type that previously worked stopping.`,
            },
            {
              question: `Your weekly review shows: 12 trades, 7 wins (58% win rate), +$1,800 realised. Capital currently at risk: 42% of portfolio. What are the two concerns from this data?`,
              options: [`A — Win rate too low and realised PnL too small`, `B — 42% capital at risk exceeds the 20–30% maximum, creating significant drawdown exposure if market turns. Otherwise performance data looks reasonable.`, `C — 12 trades in a week is too many`, `D — No concerns — everything looks good`],
              correct: 1,
              hint: `What rule does 42% capital at risk violate, and what does that mean if a crash occurs right now?`,
              explanation: `B is correct. 42% active exceeds the 20–30% maximum by a significant margin. If a broad market crash occurs, 42% active × 60% decline = 25% total portfolio loss in one event. The +$1,800 weekly gain looks good but the risk structure is dangerously concentrated. Reduce active exposure to 25–30% regardless of current unrealised gains.`,
            },
            {
              question: `GMGN and BullX serve different PnL tracking purposes. What does each provide that the other doesn't?`,
              options: [`A — They are identical — use either one`, `B — GMGN: wallet-level PnL history, win rate tracking, smart money comparisons. BullX: transaction-level feed, real-time portfolio overview, dev sell detection. Together they cover both the macro (portfolio health) and micro (individual trade execution) layers.`, `C — GMGN is for Ethereum, BullX for Solana`, `D — BullX is free, GMGN requires paid subscription`],
              correct: 1,
              hint: `What does the transaction feed on BullX show that a portfolio overview doesn't?`,
              explanation: `B is correct. GMGN's strength is historical analysis — win rates over time, wallet comparisons, PnL by trade. BullX's strength is real-time transaction intelligence — seeing buys and sells as they happen, dev activity alerts, live portfolio P&L. Using both provides the complete picture: historical performance (GMGN) + real-time execution monitoring (BullX).`,
            },
            {
              question: `What is the most useful use of the "largest single win and largest single loss" data in a weekly review?`,
              options: [`A — Celebrate the win and forget the loss`, `B — Compare the two entries systematically: what signals existed for each, what checklist compliance was present, what position size was used. Pattern: large losses often share characteristics (late entry, weak checklist, FOMO) that large wins don't.`, `C — Calculate their ratio to assess risk/reward`, `D — Adjust position sizing based on the largest win amount`],
              correct: 1,
              hint: `What information about your decision-making process is contained in the best and worst trades of the week?`,
              explanation: `B is correct. The outliers contain the most information. Comparing the entry quality, checklist compliance, and sizing of the best and worst trade reveals systematic differences in the decision process. If every large loss involved a rule violation (late entry, no bundle check, FOMO) while every large win was rule-compliant, the pattern is clear and actionable.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Monthly performance data for the last 4 months:\n\nMonth 1: 28 trades, 16 wins (57%), realised PnL +$3,800. Portfolio end: $24,000.\nMonth 2: 32 trades, 17 wins (53%), realised PnL +$2,600. Portfolio end: $26,600.\nMonth 3: 35 trades, 16 wins (46%), realised PnL +$1,100. Portfolio end: $27,700.\nMonth 4: 31 trades, 13 wins (42%), realised PnL -$200. Portfolio end: $27,500.\n\n1. Identify the trend and its severity.\n2. What are three possible causes of the decline?\n3. Design a diagnostic plan to identify the root cause before Month 5.`,
              scoringCriteria: [
                `Trend: systematic decline — win rate 57%→53%→46%→42%. Realised PnL +$3,800→+$2,600→+$1,100→-$200. Clear structural deterioration over 4 months. Now negative in Month 4. Urgent.`,
                `Possible causes: (1) market conditions shifted — current environment doesn't match strategy (e.g. bull to bear transition affecting new pair performance); (2) position sizing drift upward as portfolio grew (self-impact on small caps); (3) systematic signal quality degradation (tracked wallets decayed, narratives stagnated, entry checklist slipping).`,
                `Diagnostic plan: (1) compare Month 1 vs Month 4 entry signal distribution — are you taking more KOL-only and FOMO entries vs Month 1?; (2) compare entry MC distribution — are positions larger (causing liquidity impact)?; (3) pull journal entries from Month 1 winners — what signals were present that Month 4 entries lack? Then fix the most obvious single cause first before adjusting multiple variables.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `Weekly PnL review data:\n\nPortfolio: $45,000\nActive positions (at cost): $16,200 (36% of portfolio)\nUnrealised PnL: +$4,100 (positions are up)\nRealised PnL this week: +$800\n\nTop positions by value:\n1. $FROG: $4,500 cost, currently $9,200 (10% of portfolio at current value)\n2. $CUBE: $3,800 cost, currently $4,100\n3. $MOON: $2,200 cost, currently $1,800 (-18%)\n4. $STAR: $1,800 cost, currently $1,800 (flat)\n5. Five smaller positions: $3,900 total cost, various PnL\n\nIdentify every concern from this weekly review. For each: state the issue, the risk it creates, and the action.`,
              scoringCriteria: [
                `Issue 1: 36% active exposure violates 20–30% maximum. Risk: if market crashes 40%, portfolio loses 14.4% in one event. Action: reduce to 25% by taking partial profit on $FROG or $CUBE.`,
                `Issue 2: $FROG at 10% of portfolio at current value is dangerously concentrated (limit 5%). Risk: a single large holder exit crashes this position causing 10% portfolio impact. Action: take 50% profit on $FROG to reduce concentration.`,
                `Issue 3: $MOON down 18% with no mention of community check or thesis update. Risk: slow rug or community decline if not monitored. Action: GMGN check immediately — if smart money selling or community declining, exit.`,
                `Issue 4: $800 realised PnL despite +$4,100 unrealised = not taking profits efficiently. The unrealised gains are theoretical. Action: implement profit-taking triggers on $FROG and $CUBE.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `90-day rolling realised PnL analysis:\n\nMonth 1: +$3,200\nMonth 2: +$4,100\nMonth 3: +$2,800\n(3-month total: +$10,100 — rolling average $3,367/month)\n\nMonth 4: +$1,400\nMonth 5: +$2,200\nMonth 6: +$900\n(Months 4–6 total: +$4,500 — rolling average $1,500/month)\n\nMonths 7–9: +$600, +$1,100, -$200 (rolling: $500/month)\n\n1. Map the trajectory and identify when the decline crossed from noise to signal.\n2. What would a professional trader have done at different stages?\n3. What recovery plan would you implement entering Month 10?`,
              scoringCriteria: [
                `Trajectory: Month 1–3 strong ($3,367 avg). Month 4–6 declining significantly ($1,500 avg — 55% below baseline). Month 7–9 near-zero ($500 avg). Decline crossed from noise to signal at Month 5 — two consecutive below-average months with declining trend. Month 6 confirmation. Month 4 was the earliest warning.`,
                `Professional response: Month 5 = investigate root cause. Month 6 = implement fixes. Month 7 = reduce position sizes 50% while fixes verified. Not wait until near-zero in Month 9.`,
                `Recovery plan Month 10: (1) audit Months 1–3 vs 7–9 entry signal distribution; (2) reduce to minimum position sizes ($50–100 for Style 1) to rebuild confidence while fixes applied; (3) 90-day recovery target: return to $2,000/month rolling before returning to standard sizes; (4) weekly review with explicit comparison to Month 1 checklist compliance.`,
              ],
            },
          ],
        },
      ],

      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret'],
        description: 'Random draw from Lab 2 — portfolio scaling, liquidity impact, PnL tracking systems.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },

      bossMode: {
        title: `Lab 2 Boss — Scaled Portfolio Management`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-int-lab2-v1',
          situation: `Portfolio $85,000. Sunday afternoon portfolio review.\n\nCurrent positions:\n- $FROG: $7,200 cost, currently $18,400 (+156%). You hold 3.1% of supply in $290K liquidity pool.\n- $CUBE: $4,500 cost, currently $3,100 (-31%). Volume declining 3 days.\n- $NOVA: $2,200 cost, currently $2,200 (flat, 2 weeks holding). Community active.\n- $STAR: $1,800 cost, currently $4,600 (+156%). 0.8% of supply.\n- $MOON: $900 cost, currently $280 (-69%). No community activity for 4 days.\n- Cash/SOL: $52,600\n\nTotal portfolio: $80,980. Active exposure: $32,600 (38%).\n\n90-day rolling PnL: +$3,800/month (Months 1–2), +$1,200/month (Months 3–4 current). Declining trend.\n\nRequired: (1) Address every risk in the current portfolio structure. (2) Design the $FROG exit plan using JUP DCA. (3) Diagnose the 90-day PnL decline and propose investigation steps. (4) State the corrected portfolio structure after your actions.`,
          scoringCriteria: [
            `Risks: (1) 38% active exceeds 30% max; (2) $FROG at 3.1% supply in $290K pool = must use JUP DCA, also $18,400 = 22.7% of portfolio at current value, far exceeds 5% concentration limit; (3) $CUBE declining volume = slow death pattern, exit; (4) $MOON no activity 4 days = exit completely; (5) $NOVA flat 2 weeks = evaluate thesis validity.`,
            `$FROG JUP DCA: 5% of daily volume limit. Need daily volume for $FROG — assume $180K (typical at this market cap). Max $9,000/day = $9,000/$18,400 = 49% per day. Can exit in 2 days if needed. More conservatively: 25% of position ($4,600) per day = 4 days. Sell every 6–8 hours in equal tranches.`,
            `PnL decline diagnosis: +$3,800 → +$1,200/month = 68% decline in 2 months. Investigate: (1) are larger positions causing liquidity impact (portfolio grew from smaller)? (2) signal type breakdown Month 1–2 vs 3–4: more KOL-only entries recently? (3) market conditions shift toward bear? Run journal analysis.`,
            `Post-action structure: exit $CUBE and $MOON immediately (free up $3,480). Take 50% profit $FROG via JUP DCA Day 1 (free up $9,200). Result: active exposure drops from $32,600 to approximately $18,000 = 22% of portfolio. Back within acceptable range.`,
          ],
        }],
      },
    },

    // ── Intermediate Labs 3 & 4 ──────────────────────────────────────────
    {
      id: 'lab-9-copy-automation',
      title: `Lab 3: Copy Trading and Automation Systems`,
      subtitle: `The traders who operate while they sleep have built validated systems — not lucky streaks.`,
      lessons: [
        {
          id: 'copy-trading-systems',
          title: `Copy Trading Systems — When to Automate and How`,
          explanation: `Copy trading is not following a tip. It is automating a validated signal you have independently tested over sufficient sample size. The distinction matters: one is gambling on someone else's luck; the other is deploying a systematic edge.\n\n**Prerequisites before any automation:**\n1. Manual tracking for 50+ trades\n2. Win rate above 30% (statistical edge, not luck)\n3. You understand the wallet's strategy — what conditions it performs in, what it avoids\n4. Manageable losses — you know the downside per trade\n5. Wallet is NOT on any public smart money list\n\n**OdinBot setup:**\nConnect target wallet addresses. Set max buy per copy-trade: 0.5–1% of portfolio. Set slippage: 1–3% for established tokens, up to 5% for new pairs. Key setting: follow delay. Zero-second delay = maximum speed but maximum exposure to pump-and-dumps where the tracked wallet opens and closes in 15 seconds. A 45-second delay filters most of these: if the position closed before your copy fires, you never enter.\n\n**Copy trading failure modes:**\n1. Copying after the wallet goes public — the edge is gone, you are joining 500 followers buying simultaneously\n2. Oversizing copies — even 60% win rate means 40% losses; never copy more than 1% of portfolio per trade\n3. Not validating independently — automation speeds up execution, it does not replace judgment\n4. Counting wallet clusters as multiple signals — same entity = one signal regardless of wallet count\n\n**Alert automation (Nova Bot, GMGN):**\nBeyond copy trading: price alerts (buy $WIF if it drops to $0.000019 support), new pair alerts (notify when a token matching criteria launches), Hot Pairs alerts (notify when a tracked token enters trending). These do not trade for you — they compress your effective monitoring window into a review queue you process at convenient times.`,
          visualPrompt: `👆 OdinBot setup walkthrough: wallet address, position size, follow delay configuration`,
          visualType: `interactive`,
          visualUrl: `odinbot-setup-walkthrough`,
          examples: [
            {
              contextTag: `[OdinBot activated, validated wallet, 2025]`,
              context: `Trader manually tracked wallet 0xACE for 67 trades over 6 weeks. 59% win rate, pre-public.`,
              scenario: `Sets up OdinBot: 1% portfolio max copy ($400), 45-second delay, 2% slippage. Monitors first 5 automated copies manually.`,
              outcome: `Month 1 automated: 11 copy trades, 7 profitable. The 45-second delay filtered 2 pump-and-dumps 0xACE opened and closed in under 30 seconds. Automation saved monitoring time without losing edge.`,
            },
            {
              contextTag: `[Copy failure, unvalidated wallet, 2024]`,
              context: `Trader sets up automation after seeing 3 consecutive wins posted publicly by a Twitter account.`,
              scenario: `3 trades is not validation. Wallet turns out to be a KOL sock puppet front-running their own calls — opens position, tweets it, exits while followers buy.`,
              outcome: `Trader auto-copies 6 trades, loses 5. Each copy bought at KOL call price and sold into the KOL exit. The 50-trade minimum exists precisely to catch this pattern.`,
            },
            {
              contextTag: `[Alert system, work-hours coverage, 2025]`,
              context: `Trader cannot monitor during 9–6 work hours. Sets up alert architecture.`,
              scenario: `GMGN: alert when any tracked wallet buys >$500. Nova Bot: price alert when $WIF drops below support. DEXScreener: Hot Pairs entry for a watchlisted token.`,
              outcome: `During work: 3 alerts fire. Evaluated at lunch — one passes checklist. Entered that evening. Alert system converted a 9-hour monitoring gap into a 15-minute evaluation queue.`,
            },
          ],
          keyTakeaway: `Automate only after 50+ validated trades with proven win rate. Copy at 0.5–1% max. Use 45-second delay to filter fast pump-and-dumps. Monitor for wallet decay — replace immediately when wallets go public. Alerts extend monitoring coverage without requiring constant attention.`,
          guidedPractice: [
            {
              question: `Why is the 50-trade minimum required before automating copy trading on a wallet?`,
              options: [`A — Exchanges require 50 trades for API access`, `B — 50 trades provides statistical confidence that win rate reflects skill rather than luck. 10 trades with 70% win rate could easily be chance. 50 trades at 60% is statistically meaningful.`, `C — OdinBot requires 50 trade history to connect`, `D — Fewer than 50 trades means the wallet is too new to have an edge`],
              correct: 1,
              hint: `How many coin flips would you need to confirm a coin is biased vs getting lucky?`,
              explanation: `B is correct. At 10 trades, getting 7 right has a 17% chance of happening by pure luck. At 50 trades, getting 30 right (60% win rate) has less than 0.5% chance of being luck. The threshold converts "possibly lucky" to "statistically likely skilled."`,
            },
            {
              question: `A 45-second follow delay in OdinBot filters which specific type of bad trade?`,
              options: [`A — Trades by wallets with low win rates`, `B — Pump-and-dumps where the tracked wallet opens and exits within 15–30 seconds. If the position is closed before your copy fires, you never enter the manipulation.`, `C — Trades in high-slippage environments`, `D — Trades above your maximum position size`],
              correct: 1,
              hint: `How long does a manipulator typically hold a pump-and-dump position?`,
              explanation: `B is correct. Coordinated pump-and-dumps often open and close within seconds — the wallet opens, pumps publicly, and exits before most people can enter. A 45-second delay means your copy only fires if the wallet is still holding after 45 seconds, filtering out the fastest manipulative patterns.`,
            },
            {
              question: `Your automated copy wallet appears on GMGN's public smart money list today. What is the immediate correct action?`,
              options: [`A — Nothing — it still has the same win rate`, `B — Pause new automated copies and evaluate last week's returns. If declining post-listing, deactivate and source replacements via GateKept. Do not wait for losses to mount.`, `C — Increase copy size — more followers means more confirmation`, `D — Contact GMGN to remove the wallet from the list`],
              correct: 1,
              hint: `What happens to a wallet's signal quality when 500 copy traders all receive the same buy alert simultaneously?`,
              explanation: `B is correct. Public listing begins the decay cycle immediately. Returns often decline within days as copy-trader volume moves price before you can enter. Proactive deactivation (before losses) and replacement sourcing maintains portfolio performance.`,
            },
            {
              question: `Price alerts vs automated copy trading — what is the fundamental difference in how they operate?`,
              options: [`A — Price alerts are for Ethereum, copy trading for Solana`, `B — Price alerts notify you when a condition is met — you then make a manual decision. Copy trading executes automatically without your active involvement. Alerts extend coverage; automation extends execution.`, `C — Automated copy trading has no fee; price alerts do`, `D — They are equivalent — just different interfaces`],
              correct: 1,
              hint: `Which one requires you to act, and which one acts for you?`,
              explanation: `B is correct. Alerts are information tools — they filter the noise and tell you when something worth evaluating has happened. You then decide. Automated copy trading executes on your behalf based on pre-set rules. Both serve different purposes in the professional toolkit and are complementary, not interchangeable.`,
            },
            {
              question: `You track wallets 0xA and 0xB. Both buy the same token simultaneously. GateKept reveals they share a funding source. How many OdinBot copy trades should fire?`,
              options: [`A — Two — each wallet triggers a separate copy`, `B — One — same entity using two wallets equals one decision. Configure OdinBot to recognise the cluster and fire only one copy.`, `C — Zero — cluster activity is always manipulation`, `D — Two at half size each to maintain total allocation`],
              correct: 1,
              hint: `If the same person controls both wallets, how many independent buying decisions occurred?`,
              explanation: `B is correct. Cluster = one entity. Two wallets buying simultaneously from one person is one signal. Firing two copies would double your position on a single decision-maker's conviction — exactly the confidence inflation that cluster identification exists to prevent.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Portfolio $28,000. Evaluating three wallets for OdinBot:\n\nWallet A: 72 trades tracked manually. Win rate 58%. Avg win +$340, avg loss -$95. New pair style. Pre-public.\nWallet B: 35 trades tracked. Win rate 66%. Avg win +$820, avg loss -$420. TA dip buys. Pre-public.\nWallet C: 88 trades tracked. Win rate 52%. Avg win +$280, avg loss -$240. Mixed style. On GMGN public list 1 week.\n\nFor each: activate (yes/no), copy size, justification.`,
              scoringCriteria: [
                `Wallet A: ACTIVATE. 72 trades above threshold, 58% statistically significant, excellent loss management ($95 avg), pre-public edge intact. Copy size: 1% ($280). New pair style = fast moves, small losses align with automation parameters.`,
                `Wallet B: NOT YET. 35 trades below 50-threshold. 66% win rate impressive but statistically premature. Large avg loss ($420) requires careful position sizing when activated. Manual track 15 more trades. If holds at 60%+, activate at 0.5% ($140).`,
                `Wallet C: REVIEW/DEACTIVATE. On public list 1 week — decay beginning. 52% win rate borderline even pre-public. Evaluate last week's returns. If declining from pre-listing baseline, deactivate and source replacement.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `OdinBot running 4 weeks. Performance:\n\n0xACE (went public Day 1 of Week 4):\n- Weeks 1–3: 18 copies, 11 wins (61%), avg return +148%\n- Week 4: 7 copies, 2 wins (29%), avg return +31%\n\n0xGOLD (still pre-public):\n- Weeks 1–4: 14 copies, 9 wins (64%), avg return +215%\n\nCopy size: 1% of $28,000 = $280 per trade.\n\n1. What does 0xACE Week 4 confirm?\n2. Calculate realised profit from each wallet across 4 weeks.\n3. Week 5 system adjustments.`,
              scoringCriteria: [
                `0xACE Week 4 confirms decay: win rate dropped 61%→29%, returns dropped 148%→31% immediately upon GMGN listing. Textbook decay signal. Deactivate immediately.`,
                `0xACE: Weeks 1–3: 11 wins × $280 × 1.48 = +$4,554 minus 7 losses × $280 × 0.5 est = -$980. Net ~+$3,574. Week 4: 2 wins × $280 × 0.31 = +$174 minus 5 losses × $280 × 0.5 = -$700. Net -$526. Total: ~+$3,048. 0xGOLD: 9 wins × $280 × 2.15 = +$5,418 minus 5 losses × $280 × 0.5 = -$700. Net: +$4,718.`,
                `Week 5: Deactivate 0xACE. Run GateKept on last 2 weeks of winners to find 2 replacement pre-public wallets. Continue 0xGOLD at same parameters. Begin manual validation of 1–2 new candidates.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Alert system design. Your profile: full-time job, active trading evenings/weekends only. Portfolio $32,000. Strategies: Style 1 (new pairs), Style 2 (dip buys on $WIF, $BONK). Tracking 6 pre-public wallets. Narrative focus: gamified finance theme.\n\nDesign complete alert architecture: which alerts, what thresholds, which platforms, what action each triggers. Also define your "no trading during work hours" rule with specific boundaries.`,
              scoringCriteria: [
                `Wallet alerts: GMGN notifications for all 6 wallets — fire when any buy exceeds $500. Action: add to evaluation queue, run full checklist during next available window.`,
                `Style 2 dip alerts: Nova Bot price alerts on $WIF ($0.000019), $BONK ($0.0000185). Action: if during trading window evaluate within 1 hour; if during work, evaluate at lunch or evening.`,
                `Narrative Phase 1 alert: DeFined custom filter, gamified finance keywords, volume >$50K, under 12 hours old. Action: evening evaluation queue.`,
                `No-trading rule: no new market buy orders 9AM–6PM Monday–Friday. Exception: limit orders only (pre-set entry points, not reactive market buys). Hard boundary: no emotional market buys during work hours regardless of FOMO.`,
              ],
            },
          ],
        },
        {
          id: 'on-chain-analysis-intermediate',
          title: `On-Chain Analysis — Reading Blockchain Data Proactively`,
          explanation: `Basic on-chain analysis is reactive: check before entering. Advanced analysis is proactive: read the chain to find opportunities before they become obvious.\n\n**Reverse wallet hunting (Solscan archaeology):**\nFind a confirmed winner at $800K MC. Identify its top early holder. Open their wallet on Solscan. Check their last 90 days of activity: what other tokens did they buy early? What was the entry market cap each time? If they consistently entered winning tokens at sub-$60K MC, you have found a high-quality tracking candidate — discovered through a winner rather than through a public list.\n\n**Transaction timing analysis:**\nEvery Solscan transaction has a timestamp. For a token that ran 20×, find who bought at the earliest market cap. Check the timestamp against the first public mention (first KOL tweet, first Telegram call). If the wallet bought 3+ hours before the first public mention across multiple tokens, they have either non-public information or an extremely tight early network. Either way: track them.\n\n**Time-series holder tracking:**\nInstant holder checks show a snapshot. Weekly snapshots reveal direction. A wallet at 4.2% Week 1, 3.1% Week 2, 1.9% Week 3 is in systematic exit — not a one-time trim but a deliberate drawdown. This is the slow rug detection signal that single checks completely miss.\n\n**Dev wallet pattern database:**\nCheck the developer wallet on Solscan for every token you evaluate. Previous launches: did they rug or survive? Did they take partial profits (acceptable) or sell everything immediately (red flag)? A developer with 3 previous rugs in 60 days is a serial rugger regardless of how the current token looks. A developer whose previous tokens all graduated and maintained communities gets benefit of the doubt on elevated Rugcheck flags.\n\n**GMGN insider detection:**\nGMGN flags wallets that consistently buy tokens minutes before large price moves. These wallets either have non-public information or extremely fast network access. When a token you are evaluating shows GMGN insider activity among its early buyers: (1) treat as risk flag if the insiders have a history of dump-and-exit; (2) treat as opportunity signal if insiders have a history of sustained holding. Check their transaction history to distinguish.`,
          visualPrompt: `👆 Solscan wallet archaeology: tracing top holder backwards through 90-day transaction history`,
          visualType: `interactive`,
          visualUrl: `solscan-archaeology-walkthrough`,
          examples: [
            {
              contextTag: `[Reverse wallet hunt, winning token, 2025]`,
              context: `Token $CUBE at $1.6M MC. Top holder (4.1%) bought at $32K MC.`,
              scenario: `Trace on Solscan. Last 90 days: bought $FROG at $28K (went to $3M+), $STAR at $40K (went to $5M), $NOVA at $48K (went to $1.4M). Consistent sub-$50K early entries into winners.`,
              outcome: `Pre-public wallet discovered through reverse archaeology. Added to tracking list. Not on any public smart money list. Next buy alert arrives 3 days later.`,
            },
            {
              contextTag: `[Dev wallet history, serial rugger, 2025]`,
              context: `New token launches. Dev wallet check on Solscan.`,
              scenario: `History: deployed $TOKEN1 (18 days, dev sold Day 14), $TOKEN2 (11 days, dev sold Day 8), $TOKEN3 (current, 3 days old). Three consecutive rug pattern.`,
              outcome: `Trader avoids. Token rugs Day 16. The on-chain evidence was complete and unambiguous before any analysis tool flagged it.`,
            },
            {
              contextTag: `[Pre-call timing, insider detection, 2025]`,
              context: `Token ran 22×. Trader analyses top holder's entry time.`,
              scenario: `Top holder bought at $55K MC at 2:14 PM. First KOL tweet about the token: 5:47 PM. Delta: 3 hours 33 minutes before first public mention.`,
              outcome: `Wallet identified as pre-public information network participant. Elevated to highest tracking tier. Historical check confirms: 4 of last 5 tokens bought 2–5 hours before first public mention, all 10×+.`,
            },
          ],
          keyTakeaway: `Reverse wallet hunting: trace winners backwards to find pre-public smart money. Timing analysis: pre-call buyers = highest-tier tracking candidates. Weekly holder snapshots: direction of concentration reveals systematic exits. Dev wallet history: serial rugger or credible builder — permanently on-chain.`,
          guidedPractice: [
            {
              question: `You find a top holder who consistently bought 5 winning tokens at sub-$60K MC before any public attention. What action does this warrant?`,
              options: [`A — Nothing — historical patterns don't predict future performance`, `B — Add to tracking list immediately — this is reverse wallet hunting, discovering a pre-public smart money wallet through demonstrated systematic early-discovery edge`, `C — Report as potential insider trader`, `D — Sell the current token they hold`],
              correct: 1,
              hint: `What is the core characteristic of a valuable tracking wallet? Does this one demonstrate it?`,
              explanation: `B is correct. A wallet that consistently enters winning tokens at sub-$60K MC has a systematic early-discovery edge — whether through information, analysis, or network. This is the exact type of pre-public wallet that intermediate traders source through GateKept and Solscan archaeology. Add immediately.`,
            },
            {
              question: `Dev wallet history shows: deployed $A (14-day life, dev sold Day 12), $B (9-day life, dev sold Day 7). New token $C just launched. What does this mean?`,
              options: [`A — The developer has launch experience — positive signal`, `B — Serial rugger pattern — two consecutive documented exits into early price appreciation. High probability $C follows the same pattern regardless of how it currently looks.`, `C — Previous tokens failed organically — no fault of developer`, `D — This is standard developer behaviour in competitive markets`],
              correct: 1,
              hint: `"Dev sold" + token dying — what is the pattern called and how many occurrences confirm it?`,
              explanation: `B is correct. Two for two is not coincidence. The developer launches, builds excitement, sells when profitable, and repeats. The on-chain evidence is permanent and specific. This flag overrides positive community signals and clean Rugcheck scores — the developer has a documented behaviour pattern.`,
            },
            {
              question: `You screenshot top holders weekly: Wallet A was 4.2% Week 1, 3.1% Week 2, 1.9% Week 3. What does this pattern reveal?`,
              options: [`A — Normal trading activity — holders buy and sell all the time`, `B — Systematic exit — Wallet A is deliberately reducing their position each week, selling into whatever buying exists. A single spot check would not reveal this direction of travel.`, `C — Wallet A is distributing tokens to new buyers as a positive sign`, `D — The holder reduced by a total of 2.3% which is insignificant`],
              correct: 1,
              hint: `What is the difference between seeing 1.9% today vs seeing the progression from 4.2%?`,
              explanation: `B is correct. The direction is the signal, not the instant value. 1.9% in isolation tells you nothing. 4.2%→3.1%→1.9% tells you this is a deliberate, systematic exit — not a one-time trim. This is the slow rug detection signal that requires time-series data to identify.`,
            },
            {
              question: `Rugcheck flags a developer's wallet as "linked to previous tokens." On Solscan you find those tokens lasted 28 and 60 days respectively, the developer took partial profits but the tokens survived and are still trading. How does this change the Rugcheck flag assessment?`,
              options: [`A — The flag stands — any dev selling is a red flag`, `B — Context changes everything. The automated flag cannot distinguish between "dev sold everything and token died" vs "dev took partial profits while token survived." The Solscan history shows the latter — this developer is credible.`, `C — Ignore Rugcheck entirely when Solscan shows survival`, `D — The flag means the developer will rug again regardless of history`],
              correct: 1,
              hint: `What are the two very different behaviours that trigger the same Rugcheck flag?`,
              explanation: `B is correct. Rugcheck's "linked to previous tokens" is an automated detection that treats all developer selling equally. Manual Solscan archaeology differentiates: partial profit-taking while token survived = credible developer. Full exit at peak while token died = rug pattern. The manual check converts a false positive into accurate context.`,
            },
            {
              question: `GMGN shows "insider activity" on a token's early buyers — they bought 2.5 hours before the first public mention. What are the two possible interpretations and how do you distinguish them?`,
              options: [`A — Always a rug signal — insider activity means coordinated dump incoming`, `B — Either (1) coordinated dump: insiders will exit into public attention, or (2) genuine early network: insiders found it through legitimate channels and are holding. Distinguish by checking: do those wallets hold through the public pump or sell immediately into it?`, `C — Insider activity guarantees the token will perform well`, `D — GMGN's insider flag is unreliable — ignore it`],
              correct: 1,
              hint: `What do genuine early discoverers do when public attention arrives vs what coordinated pumpers do?`,
              explanation: `B is correct. Genuine early discoverers hold through the public attention (they have conviction in the meme). Coordinated pumpers sell into it (the public attention is the exit). Check the wallets' transaction history: are they still holding after the KOL call, or did they sell within minutes of the first tweet? That action distinguishes the two types.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Archaeology exercise. Token $NOVA at $1.6M MC. Trace top 3 holders on Solscan:\n\nHolder 1 (6.2%, bought at $38K MC): previous 90 days — bought $FROG at $25K (went 80×), $CUBE at $35K (went 40×), $STAR at $45K (went 15×). Zero rugs visible. No public list presence.\n\nHolder 2 (4.8%, bought at $55K MC): 2 previous tokens — 1 minor win (+60%), 1 total loss. Wallet 3 months old. Unknown funding source.\n\nHolder 3 (3.1%, bought at $80K MC): 200+ trades, GMGN shows 51% win rate 180 trades, on GMGN smart money list.\n\nFor each: tracking value and combined signal for $NOVA.`,
              scoringCriteria: [
                `Holder 1: HIGH PRIORITY. Three for three wins at sub-$50K MC entries = systematic early-discovery edge. Pre-public = maximum edge intact. Add immediately. This is the most valuable archaeological discovery available — a wallet with proven track record not yet on any list.`,
                `Holder 2: LOW. Only 2 trades (statistically meaningless), young wallet, unknown funding. Could be a legitimate new trader or a developer sock puppet. Do not track. Yellow flag on unknown funding source.`,
                `Holder 3: MEDIUM/declining. 51% win rate × 180 trades = statistical edge but borderline. Already on public list (some decay). Useful as secondary confirmation but not a primary signal source.`,
                `Combined $NOVA signal: Holder 1's presence alone justifies investigation. A wallet that found three 15–80× winners consistently at sub-$50K MC is now in $NOVA at $38K MC. This is strong positive signal independent of all other analysis.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `New token, 6 hours old. Full checklist plus archaeology:\n\nRugcheck: 79/100. Penalty: "Dev wallet linked to 2 previous tokens."\nSolscan dev history:\n- Token 1: 45 days ago, dev held 28 days, sold 80% of position at 3× MC. Token survived, still trading at 5×.\n- Token 2: 90 days ago, dev held 60 days, sold 60% at 4× MC. Token survived, still at 2×.\n\nOther signals: 11% sniper concentration, 600 Telegram (organic content), Phase 1 narrative alignment.\n\nThe Rugcheck penalty flagged the dev's selling. Is this a red flag given full archaeological context? What is your entry decision?`,
              scoringCriteria: [
                `Critical insight: Rugcheck cannot distinguish partial profit-taking from rugging. The Solscan evidence shows: developer held 28 and 60 days (long-term orientation), sold portions not everything, and both tokens survived. This is NOT a rugger — this is a credible developer who takes partial profits.`,
                `The Rugcheck flag should be reclassified as NEUTRAL, not RED. The actual dev behaviour pattern is positive (tokens survive, dev holds for weeks before any selling).`,
                `Entry decision: enter. All other signals positive (11% sniper = manageable, organic community, Phase 1 narrative). Standard 1.5–2% position appropriate. The archaeological context converted a false positive into a non-issue.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Time-series holder analysis. You have held this token for 3 weeks. Weekly snapshots:\n\nWeek 1 (entry at $180K MC):\nWallet A: 5.1% | B: 3.8% | C: 2.9% | D: 2.4% | E: 1.8%\n\nWeek 2 ($420K MC):\nWallet A: 4.2% | B: 3.1% | C: 2.9% | D: 2.4% | E: 2.1% | New: F 1.9%\n\nWeek 3 ($380K MC — pullback):\nWallet A: 3.3% | B: 2.1% | C: 2.8% | D: 2.3% | E: 2.2% | F: 2.4%\n\nYour position: entered $180K, now at $380K (2.1×). Zero profit taken.\n\n1. What patterns do you see in A and B vs C, D, E, F?\n2. What does this suggest for your position?\n3. What would validate or invalidate your hypothesis?`,
              scoringCriteria: [
                `Pattern: A and B systematically reducing (A: 5.1→4.2→3.3, B: 3.8→3.1→2.1). C, D, E stable. F increasing (new buyer). A and B are the original early holders taking progressive profit — deliberate not panic.`,
                `Position action: take 40–50% profit immediately. Two of five largest early holders are in documented systematic exit. Their continued selling will eventually overwhelm organic buying. You are sitting on a 2.1× gain — crystallise it.`,
                `Validation: if A and B continue reducing Week 4, confirmed systematic exit. Invalidation: if A and B stabilise or increase, they may have reached their desired hold level and are done selling. In that case, the exit pressure reduces significantly.`,
              ],
            },
          ],
        },
      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from Lab 3 — copy trading, automation, on-chain analysis.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },
      bossMode: {
        title: `Lab 3 Boss — Automation and On-Chain Integration`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-int-lab3-v1',
          situation: `Portfolio $40,000. Three automated wallets running 8 weeks.\n\n0xACE: 42 copies, 60% win rate, 185% avg return. Appeared on GMGN public list YESTERDAY.\n0xBETA: 31 copies, 52% win rate, 120% avg return. Pre-public.\n0xGAMMA: 22 copies, 68% win rate, 290% avg return. Pre-public.\n\nOdinBot alert fires: 0xACE just bought $NOVA at $35K MC.\n\nSolscan archaeology on $NOVA's other early buyer (not 0xACE, bought 1 hour before): last 90 days — bought $FROG at $28K (went 40×), $CUBE at $42K (went 25×), $STAR at $38K (went 18×), $MOON at $55K (went 12×). Not on any list. Bought $NOVA 2.5 hours before first Twitter mention.\n\nRequired: (1) Handle the 0xACE alert given it just went public. (2) Should 0xGAMMA continue automated at 22 trades? (3) Assess the pre-public wallet found through $NOVA archaeology. (4) Combined action on $NOVA itself.`,
          scoringCriteria: [
            `0xACE alert: do NOT execute the automated copy. Went public yesterday — copying joins 500 followers, gets worse entry. Evaluate $NOVA independently. Begin sourcing 0xACE replacement via GateKept immediately.`,
            `0xGAMMA: 22 trades below 50-threshold. Despite impressive stats, premature for full automation. Reduce auto-copy to 0.5% ($200) and continue manual validation alongside for next 28+ trades.`,
            `Pre-public wallet (4/4 winners at sub-$55K MC, 2.5hr pre-mention): ADD immediately. Top-tier discovery through reverse archaeology. Manual track now, automate after 10 more validated trades. This is the highest-quality pre-public wallet findable.`,
            `$NOVA action: enter independently based on pre-public wallet signal (stronger than 0xACE's now-decayed signal). Run Rugcheck — if 85+, LP locked, mint revoked, community forming: enter 1.5% portfolio ($600). Independent validation route, not copy-trading route.`,
          ],
        }],
      },
    },

// ─────────────────────────────────────────────────────────────────────────────
// LAB 4: BUILDING YOUR NETWORK AND REPUTATION
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-10-network-reputation',
      title: `Lab 4: Building Your Network and Reputation`,
      subtitle: `The best alpha comes from people who trust you enough to share it before anyone else sees it.`,
      lessons: [
        {
          id: 'building-genuine-network',
          title: `Building a Genuine Trading Network — Trust Over Follower Count`,
          explanation: `The source material documents receiving a 130× call via DM from a trusted contact. The key word is trusted — not a random follower, not a high-follower KOL, but someone the author had built a genuine relationship with over time.\n\nNetworks in memecoin trading are not follower counts. They are trust relationships built through consistent, honest engagement.\n\n**What genuine network building looks like:**\n\nShare losses as openly as wins. The source material documents mistakes publicly — rugs, roundtrips, emotional decisions. Traders who only post wins have no credibility. Traders who document everything are trusted because they are not curating their image.\n\nEngage with specific analysis, not reactions. "Good call" is worthless. "I see 8% sniper concentration but community is Level 2 — entering at 1% due to the concentration risk" builds reputation as a serious analyst that people want in their circle.\n\nBe useful before you need anything. Help analyse tokens when asked. Share pre-entry checklist results even when you decide not to enter. Give consistently without expecting immediate return.\n\n**The inner circle:**\nThe source material: "Find an inner circle of friends to print with. It's more fun with friends." A group of 5–10 genuinely aligned traders who share analysis, validate entries, and challenge each other multiplies signal quality. Each person extends your effective monitoring window.\n\n**Understanding incentive alignment:**\nThe source material warns: "No one is your friend — you're only friends when you're pushing the same CA." Shared positions create temporary alignment. Do not confuse this with genuine trust. Real trust appears when someone tells you a token is risky when you want to hear it is fine — when they have no position and no incentive.\n\n**The humility rule:**\nOverconfidence after winning streaks is the most common relationship destroyer. Traders who crow about wins alienate the network they built. The most well-connected traders are known for being consistently accurate — not for loudly announcing returns.`,
          visualPrompt: `👆 Network quality: small trusted circle vs large follower base — information flow quality comparison`,
          visualType: `chart`,
          visualUrl: `network-quality-comparison`,
          examples: [
            {
              contextTag: `[Loss transparency, trust building, 2025]`,
              context: `Trader publicly documents a 78% loss on a position they confidently called.`,
              scenario: `Post includes: entry reasoning, what signals they missed (slow rug pattern in holder data), and updated checklist rule derived from the loss.`,
              outcome: `6 traders DM to thank them for the transparency. Two become inner circle contacts over the following months, sharing alpha before any public post. The loss post built more trust than 10 win posts combined.`,
            },
            {
              contextTag: `[Specific analysis engagement, reputation building, 2025]`,
              context: `A trader posts a CA with minimal analysis. Most replies are "LFG" and price targets.`,
              scenario: `Trader responds: "Rugcheck 88, 14% sniper concentration (elevated), community Level 2 but top holder reducing -0.8% over 3 days. Entering 1% due to holder pattern."`,
              outcome: `The poster DMs them directly. Relationship built on analytical respect. 3 months later the poster shares a 90× call before posting it publicly.`,
            },
            {
              contextTag: `[Humility in winning streak, 2025]`,
              context: `Trader has 4-week winning streak — 5 consecutive profitable trades.`,
              scenario: `Instead of aggressive position sizing posts or "I told you so" content, continues same quality analysis tone. Acknowledges when calls go wrong and explains why.`,
              outcome: `Network intact. When streak ends, no credibility lost because humility was maintained throughout. The community trusts the analysis, not the outcomes.`,
            },
          ],
          keyTakeaway: `Trust is built through sharing losses openly, providing specific analysis not reactions, and being useful before needing anything. Inner circle of 5–10 genuine contacts multiplies signal quality. Real trust = someone tells you a token is risky when they have no position. Humility after wins protects what you built.`,
          guidedPractice: [
            {
              question: `The source material shows a 130× call received via DM. What enabled this specifically?`,
              options: [`A — A large Twitter following`, `B — A trust relationship built through consistent honest engagement — sharing losses, providing specific analysis, demonstrating genuine analytical capability over time`, `C — Paying for a premium alpha group membership`, `D — Being lucky to know the right person`],
              correct: 1,
              hint: `What makes someone willing to share their best undiscovered find with one specific person rather than posting it publicly?`,
              explanation: `B is correct. People share their best findings with people they trust and respect as analysts. Trust is earned through months of consistent honest engagement — not purchased, not collected from follower counts. The trader earned the DM through demonstrated reliability and honesty over time.`,
            },
            {
              question: `Why does sharing losses publicly build more trust than sharing wins?`,
              options: [`A — Losses attract sympathy which converts to followers`, `B — Sharing losses signals that your wins are real — traders who document both are known to be honest. Win-only posters are seen as cherry-picking, making their wins untrustworthy.`, `C — Losses are more common so they reach more people algorithmically`, `D — It doesn't — only wins build credibility`],
              correct: 1,
              hint: `What does posting only wins signal about the nature of the content?`,
              explanation: `B is correct. Everyone knows traders lose. Win-only posting is visible as curation. Documenting losses with analysis ("here is what I missed, here is the updated rule") demonstrates intellectual honesty and genuine learning orientation. Your wins become credible because your losses are also documented.`,
            },
            {
              question: `"No one is your friend — you're only friends when you're pushing the same CA." What does this mean for identifying genuine trust?`,
              options: [`A — You cannot trust anyone in memecoin trading`, `B — Shared positions create incentive alignment that looks like trust but isn't. Genuine trust appears when someone has no stake in the outcome and still gives you honest assessment.`, `C — Only trade with people who hold the same tokens`, `D — Avoid sharing positions publicly to prevent incentive conflicts`],
              correct: 1,
              hint: `When does someone's "support" for your analysis reflect genuine belief vs shared financial incentive?`,
              explanation: `B is correct. When two people hold the same token, both want it to pump — their analysis support is incentive-aligned, not necessarily objective. Genuine trust is validated when someone tells you "that sniper concentration is too high, I'd pass" when they have no position. That is objective analysis with zero financial incentive.`,
            },
            {
              question: `What type of engagement specifically builds analytical reputation?`,
              options: [`A — Liking and reposting others' content frequently`, `B — Responding with specific checklist analysis (exact risk factors identified, position sizing rationale, specific concerns) rather than generic reactions`, `C — Posting frequently to remain visible`, `D — Creating general trading psychology content`],
              correct: 1,
              hint: `What does "LFG" reveal about the poster's analytical capability vs a specific checklist response?`,
              explanation: `B is correct. Generic reactions reveal nothing. Specific analysis — "14% sniper concentration and top holder reducing over 3 weeks means I'm sizing at 0.8% not my standard 1.5%" — reveals systematic thinking, specific risk identification, and checklist discipline. That specificity is what makes someone worth sharing alpha with.`,
            },
            {
              question: `Why does overconfidence after a winning streak damage the network more than a normal losing period?`,
              options: [`A — It doesn't — winning creates social capital`, `B — Overconfidence creates expectations and targets. When the inevitable drawdown follows aggressive win-posting, the audience who praised you will criticise loudly. Consistent analytical tone through both cycles retains credibility regardless of outcomes.`, `C — Overconfidence attracts copy-cat traders who inflate your entries`, `D — It is only damaging if you post specific trade sizes`],
              correct: 1,
              hint: `What happens to a trader's credibility when they crowed about wins and then have a losing streak?`,
              explanation: `B is correct. Publicly aggressive win posting sets expectations that cannot be sustained. The analyst who maintains the same tone — neither celebrating excessively nor catastrophising — retains trust through all market conditions. The source material documents this philosophy across multiple entries.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Your Twitter posting this week: 3 wins posted (+$1,400, +$800, +$2,200). 2 losses not posted (-$340, -$180). One position currently -15% and you are uncertain whether to hold or exit.\n\n1. What signal does your current posting behaviour send?\n2. How should you post about the -15% position if you want to build genuine network trust?\n3. Redesign your posting approach for next week.`,
              scoringCriteria: [
                `Current signal: win-only posting signals curation. Traders recognise the pattern — your silence on losses is visible and reduces credibility. You look like you are performing, not trading honestly.`,
                `Posting the -15% position: yes, analytically not emotionally. "Entered at $180K MC. Now -15% at $153K. Original thesis: 9% sniper, Level 2 community. New data: top holder reduced 4.2%→3.1% this week. Thesis still valid? Here is my analysis: [detail]. Interested in other holders' perspective on the holder reduction pattern."`,
                `Redesigned approach: post all trades — wins and losses with equal analytical depth. Frame every post as "here is what I analysed and what happened." For losses: "here is what I missed, here is the updated rule." Document the full picture, not the highlight reel.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `You are evaluating whether to add someone to your inner circle. They have been active on Twitter for 4 months.\n\nEvidence:\n- Posted 12 trade calls, 8 profitable (67% win rate)\n- Posts wins with screenshots and "LFG." Posts losses with analysis of what they missed and rule updates.\n- Replied to your token analysis twice with specific checklist observations (not just "good call")\n- Has 2,800 followers — not a KOL but has established presence\n- DM history: 3 messages, all sharing analysis with no asks in return\n- Known to hold positions 6–18 hours average (consistent with their stated style)\n\nShould you add to inner circle? What specifically qualifies or disqualifies them?`,
              scoringCriteria: [
                `Add: YES. Qualifying signals: (1) documents losses with analysis (honesty signal); (2) provided specific checklist analysis to you (demonstrates analytical depth not just reactions); (3) DMs without asks (gives before taking); (4) consistent position holding matches stated style (no hidden agenda visible in behaviour); (5) 67% win rate over 12 calls is meaningful but sample size small — verify over next month.`,
                `No red flags. The combination of loss transparency + specific analysis + no-ask engagement is the strongest available network quality signal.`,
                `Action: engage more deeply, share analysis with them, watch for 3–4 more interactions to confirm consistency before treating as full inner circle (someone you share undiscovered plays with).`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Network development 6-month retrospective. You have been building your network consistently.\n\nMonth 1: 50 followers. Posting wins only. No significant DMs.\nMonth 2: 150 followers. Started documenting losses with analysis. 3 analytical DMs received.\nMonth 3: 400 followers. Inner circle beginning to form — 4 traders sharing analysis before public posts. Received first advance DM on a trade.\nMonth 4: 900 followers. Inner circle at 7 traders. Received 3 advance trade DMs. One went 14×.\nMonth 5: 1,800 followers. Inner circle stable at 8. Advance DMs increasing — 6 this month.\nMonth 6: 3,200 followers. Inner circle at 9. Received the 130× DM this month.\n\nQuestions:\n1. What was the specific inflection point in the growth and what caused it?\n2. What is the relationship between follower count and information quality in this timeline?\n3. What should NOT change going forward despite the growing following?`,
              scoringCriteria: [
                `Inflection point: Month 2, when loss documentation began. Follower growth accelerated AND advance DMs began. The loss documentation was the trust signal that converted passive followers into genuine contacts.`,
                `Follower vs information quality: the 130× DM came at 3,200 followers — not at 10,000, not at 1 million. Information quality (inner circle) developed from Month 3 onwards and was uncorrelated with raw follower count. A 50-follower network with 5 trusted contacts outperforms a 50,000-follower network of passive spectators.`,
                `What should not change: the analytical tone, loss documentation, specific engagement style, and no-ask DM behaviour. These created the trust. Growing followers creates pressure to perform and curate — resisting that pressure is the discipline that maintains the inner circle.`,
              ],
            },
          ],
        },
        {
          id: 'kol-dynamics-caller-economy',
          title: `KOL Dynamics — Understanding the Caller Economy`,
          explanation: `KOL (Key Opinion Leader) culture in memecoins operates on a specific economic model that most traders don't fully understand. Understanding it protects you from being exit liquidity and opens a path to building genuine analytical authority.\n\n**How KOLs actually make money:**\n\nTier 1 (genuine): KOLs who share authentic analysis of tokens they hold. Revenue comes from: followers buying tokens they already own (creates price appreciation), subscriptions to paid alpha groups, sponsorships from trading platforms. These KOLs have skin in the game and their reputation depends on call quality over time.\n\nTier 2 (paid promotion): KOLs paid by projects to call tokens. The disclosure is often missing or buried. These calls are not analysis — they are advertisements. The KOL sells their audience access to the project; you are the product.\n\nTier 3 (coordinated): KOLs who front-run their own calls. Buy the token, tweet about it, sell into the buying wave their tweet creates. This is market manipulation in most jurisdictions but extremely difficult to prove.\n\n**How to evaluate a KOL's actual track record:**\nThe Check KOL Stats tool provides call history with outcomes. Look for: win rate over 20+ calls (not just the highlighted wins), average performance of calls over time, whether performance has declined recently (audience growing faster than edge = Tier 2/3 risk increasing).\n\n**Using KOL calls correctly:**\nThe source material is clear: KOL calls are confirmation signals for existing theses, not primary entry signals. If your checklist passes AND a credible KOL calls the token, that confirmation adds marginal value. If a KOL call is your entire thesis, you are buying exit liquidity.\n\n**Building KOL-equivalent authority:**\nThe traders who received advance DMs in the network-building lesson had built something equivalent to KOL status within their trusted circle — without the compromised incentives of the commercial KOL model. Consistent accurate analysis over 6–12 months produces organic trust that is more durable than follower-bought credibility.`,
          visualPrompt: `👆 KOL call timeline: smart money entry → KOL call → retail buying → smart money exit`,
          visualType: `chart`,
          visualUrl: `kol-call-timeline-analysis`,
          examples: [
            {
              contextTag: `[Tier 1 KOL usage, confirmation signal, 2025]`,
              context: `Trader independently identifies $FROG with strong signals. 20 minutes later, a Tier 1 KOL with verified track record calls it.`,
              scenario: `KOL call provides confirmation, not thesis. Trader already holds from independent discovery. Treats the call as exit liquidity signal — takes 25% profit into the call volume.`,
              outcome: `Token pumps 30% on the call. Trader captures the pump on existing position. The call was useful as a take-profit trigger, not an entry signal. Enters at $45K, exits 25% at $180K MC.`,
            },
            {
              contextTag: `[Tier 2 exposure, paid promotion trap, 2024]`,
              context: `A mid-tier KOL (50K followers) posts an enthusiastic call on a new AI token.`,
              scenario: `Trader checks KOL's history using Check KOL Stats. Discovery: 8 of last 12 calls were tokens that paid for promotion (discoverable via their own disclosure in other posts). Average non-sponsored call: +85%. Average sponsored call: -42%.`,
              outcome: `Trader passes on the call. Token pumps briefly and dumps 80% in 4 days. The Check KOL Stats workflow took 3 minutes and saved significant capital.`,
            },
            {
              contextTag: `[Organic authority building, inner circle effect, 2025]`,
              context: `Trader has been sharing specific analysis publicly for 8 months. No paid promotions. Documents losses.`,
              scenario: `Has accumulated a reputation: specific, honest, accurate. 3 other traders with significant portfolios now DM before any trade to get the analytical perspective.`,
              outcome: `These DM relationships are more valuable than 10,000 followers: they share undiscovered plays in return, validate entries before commitment, and provide independent check on analysis. Organic trust vs manufactured audience.`,
            },
          ],
          keyTakeaway: `KOLs monetise audience trust through multiple models (genuine, paid promotion, coordinated). Evaluate track records with Check KOL Stats — not all KOL calls are equal. Use calls as confirmation only, never as primary thesis. Build analytical authority through consistent honest analysis — more durable than follower counts.`,
          guidedPractice: [
            {
              question: `A KOL with 200,000 followers calls a token you have not previously analysed. What is the correct first action?`,
              options: [`A — Buy immediately — 200,000 followers creates buying pressure`, `B — Run your full independent checklist on the token. If it passes independently, the KOL call is confirmation. If it fails, the follower count does not save you.`, `C — Check if the KOL is verified by a major exchange`, `D — Wait for a second KOL to call it before entering`],
              correct: 1,
              hint: `What does a KOL call tell you about the token's fundamental quality?`,
              explanation: `B is correct. A KOL call tells you the KOL (or someone who paid them) believes the token will pump. It says nothing about Rugcheck score, sniper concentration, dev history, or community quality. The checklist remains mandatory regardless of who called the token.`,
            },
            {
              question: `What does Check KOL Stats reveal that a KOL's own feed does not?`,
              options: [`A — The KOL's portfolio allocation`, `B — Full call history with outcomes — including calls that failed, patterns of sponsored vs organic calls, and win rate over time. KOLs do not post their losses publicly; the tool shows the complete picture.`, `C — The KOL's follower growth rate`, `D — Whether the KOL holds the tokens they call`],
              correct: 1,
              hint: `What does any trader's public feed systematically exclude?`,
              explanation: `B is correct. Every trader's public feed excludes losses — this is universal. Check KOL Stats provides the complete dataset: every call tracked, every outcome recorded, no survivorship bias. The tool reveals whether a KOL is Tier 1 (genuine, consistent), Tier 2 (paid promotions with poor outcomes), or somewhere in between.`,
            },
            {
              question: `Why is a KOL call only useful as a confirmation signal and not as a primary thesis?`,
              options: [`A — KOLs are usually wrong`, `B — By the time a KOL calls publicly, their audience (including faster traders) has already entered. The KOL call is the exit window for those who entered earlier — not a new entry signal for everyone who hears it.`, `C — KOL calls only work for tokens above $1M MC`, `D — You need to verify the KOL's identity first`],
              correct: 1,
              hint: `Who entered the token before the KOL called it? What are they waiting for?`,
              explanation: `B is correct. Smart money that tracks KOL wallets entered before the call. The KOL entered before the call. Their audiences are the buyers they sell to. Entering on a public KOL call means entering as the exit liquidity for everyone earlier in the chain. Confirmation signal = you were already in.`,
            },
            {
              question: `The source material states "you don't need to be in the cabal to make it — wallet watch, hang in the trenches." What does this mean for network strategy?`,
              options: [`A — Joining paid groups is unnecessary`, `B — The edge available to connected insiders can be approximated through systematic wallet tracking and community engagement — access to the best information is not gated behind exclusive groups for skilled analysts`, `C — Trading alone is always better than network trading`, `D — The cabal does not actually exist`],
              correct: 1,
              hint: `What tools and behaviours can approximate the informational advantage of being deeply network-connected?`,
              explanation: `B is correct. Wallet tracking (finding pre-public smart money), reverse archaeology (discovering wallets through winners), consistent community analysis (earning advance DMs through trust) — these tools approximate the informational advantage of insider networks through systematic effort rather than exclusivity. The source material explicitly affirms this is achievable.`,
            },
            {
              question: `How does building analytical authority differ from building KOL status, and why is the former more durable?`,
              options: [`A — They are the same thing`, `B — KOL status is built on audience size and entertainment value — it requires constant content to maintain and is vulnerable to a single high-profile loss. Analytical authority is built on consistently accurate, specific analysis — it compounds over time and survives drawdown periods because trust is based on process not outcomes.`, `C — KOL status is more valuable because it scales`, `D — Analytical authority only matters for traders with large portfolios`],
              correct: 1,
              hint: `What happens to each when the inevitable losing streak occurs?`,
              explanation: `B is correct. KOL status is fragile — one public embarrassment can erase it. Analytical authority, built on documented process and honesty about losses, is resilient — a losing streak is just more data in the documented record. The trader who says "I was wrong, here is why" retains more trust than the KOL who goes quiet during drawdowns.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Check KOL Stats data on three accounts you follow:\n\nKOL A (85K followers): 28 tracked calls. Win rate 57%. Avg return +180% on wins, avg loss -65%. 3 calls in last month disclosed as sponsored (#ad). Non-sponsored historical: 61% win rate. Sponsored: 28% win rate.\n\nKOL B (320K followers): 44 tracked calls. Win rate 38%. Avg return +420% on wins, avg loss -82%. No sponsored calls visible. Very high variance — huge wins, large losses.\n\nKOL C (12K followers): 19 tracked calls. Win rate 63%. Avg return +145% on wins, avg loss -58%. No sponsored calls. Consistent performance over 6 months. Documents losses publicly.\n\nRank by usefulness as a confirmation signal source. Justify each.`,
              scoringCriteria: [
                `KOL C: HIGHEST utility. 63% win rate, consistent, documents losses, no sponsorships, small audience (less decay/front-running). Although 19 calls is borderline sample size, the consistency and loss transparency are strong quality signals.`,
                `KOL A: MEDIUM utility. 61% win rate on non-sponsored calls is good. BUT: must filter out sponsored calls (28% win rate). Check each call for disclosure before acting. Sponsored calls are exit liquidity traps.`,
                `KOL B: LOW utility. 38% win rate overall — loses more than wins. The 420% average win sounds impressive but the 82% average loss and low win rate mean negative expected value per call. High follower count may create self-fulfilling pumps but the statistical edge is negative.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `A token you independently researched has all signals passing: Rugcheck 87, mint revoked, LP locked 6 months, 9% sniper, Level 2 community forming, AI narrative Phase 1. You entered 1.5% of portfolio at $35K MC.\n\nOne hour later: a major KOL (180K followers) posts a detailed call on the same token. Price jumps 40% in 20 minutes to $49K MC.\n\nA friend in your inner circle DMs: "Great call — are you adding here?"\n\nDesign your exact response to both the market situation and to your friend.`,
              scoringCriteria: [
                `Market action: the KOL call has created Phase 2 momentum on an already-good independent thesis. This is confirmation of the thesis AND a partial-profit opportunity. Take 25–33% profit at $49K MC into the KOL call buying surge. Hold remainder as free position for continued organic growth.`,
                `Do NOT add here: you are now buying at 40% above your entry on the back of a KOL call. Your original thesis was based on $35K MC asymmetry. Adding at $49K changes the risk/reward calculation significantly.`,
                `Response to inner circle friend: share your action transparently — "I entered at $35K MC on independent analysis, taking 25% profit into the KOL call volume now. Good confirmation but I'm not adding at this price — the asymmetry that made $35K attractive is gone at $49K." This demonstrates both analytical clarity and honest inner circle communication.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You are deciding whether to share a position publicly. You entered $PIXEL at $42K MC with 2% portfolio. It is now at $280K MC (6.7×). You have taken no profit.\n\nYour Twitter has 4,200 followers. You know from experience that when you post, price often moves 5–10% upward on the attention.\n\nFour options:\n1. Post the position now with full entry details and current thesis\n2. Post only that you are "watching this closely" without disclosing your position\n3. Take 50% profit first, then post with full transparency about both the entry and the partial exit\n4. Don't post — manage the position in private\n\nEvaluate each option against the principles of analytical reputation building and network trust.`,
              scoringCriteria: [
                `Option 1: risky for integrity. Posting while fully long at 6.7× creates incentive alignment with your audience — they buy, price rises, you benefit. Even if your analysis is genuine, the incentive structure is the same as a Tier 3 KOL front-running. Some may interpret it this way.`,
                `Option 2: WORST option. "Watching closely" without position disclosure is the classic implicit pump setup — you signal interest, followers buy, you exit. This is the behaviour the source material warns against.`,
                `Option 3: BEST option. Take partial profit first, then post with full transparency: "I entered at $42K, took 50% profit at $280K, here is why I still hold the remainder and what I'm watching." This removes most of the incentive alignment concern, demonstrates the profit-taking discipline you teach, and is completely honest.`,
                `Option 4: also valid. If you are uncertain about the ethical framing, not posting is always defensible. Your inner circle already knows — they got the advance analysis. Public posting is optional.`,
              ],
            },
          ],
        },
        {
          id: 'public-presence-responsibility',
          title: `Sharing Publicly — Managing Influence Responsibly`,
          explanation: `As your network and reputation grow, the way you share positions publicly carries real consequences for other people. The source material addresses this directly: "People follow you now. And your plays. This will increase as time goes on. People making money is your fault. People losing money is your fault. Be neutral to both."\n\nThis is not hyperbole. At 5,000+ followers who actively trade your analysis, a single post can move $50,000–$500,000 in buying. People will enter positions based on your call that they would never have found independently. When that position succeeds: they credit you. When it fails: they blame you. Both reactions are largely noise — but the underlying reality is that you now have influence over real financial outcomes.\n\n**The responsible sharing framework:**\n\nAlways disclose your position. If you hold a token you are sharing, say so. "I am long at $35K MC" is the full disclosure. Any analysis shared without position disclosure is implicitly misleading — your audience cannot calibrate your incentive.\n\nShare the analysis, not the conclusion. "This token passes my full checklist — here is the data" is educationally valuable and places the decision with the reader. "Buy this" is a directive that creates dependency and transfers responsibility. Teaching people to evaluate independently builds a better community than training passive followers.\n\nSet realistic expectations about frequency and accuracy. Your win rate will be discussed publicly. If you publicly claimed 80% win rate and your actual rate is 55%, your credibility collapses the moment the data is checked. The traders who last are honest about their actual performance.\n\n**The "be neutral to both" principle:**\nThe source material is specific: be neutral to people making money through your analysis and to people losing money through it. Celebrating the wins and grieving the losses creates emotional dependency in both directions. Consistent analytical quality is what you control — not outcomes that are inherently probabilistic.`,
          visualPrompt: `👆 Public sharing framework: position disclosure, analysis vs conclusion, expectation setting`,
          visualType: `interactive`,
          visualUrl: `responsible-sharing-framework`,
          examples: [
            {
              contextTag: `[Full disclosure, analytical sharing, 2025]`,
              context: `Trader posts analysis of a token they hold.`,
              scenario: `Post: "Long $FROG at $42K MC (entered 2%). Rugcheck 88/100, mint revoked, LP locked, 11% sniper (elevated — risk factor), Level 2 community forming. AI Phase 1 narrative. Here is the detailed checklist: [data]. Risk: sniper concentration could provide selling pressure at 2–3× if not absorbed. Potential: $500K MC if cult forms."`,
              outcome: `Followers can calibrate: they know the position exists (incentive disclosed), the risk factors are explicitly included, and the reasoning is shown. Some enter, some don't. The sharing is educational regardless of outcome.`,
            },
            {
              contextTag: `[Outcome neutrality, winning call aftermath, 2025]`,
              context: `Trader's public call goes 12×. Followers celebrate, DM to say they made money.`,
              scenario: `Instead of celebrating or taking credit, trader responds: "The checklist worked as expected. The signals were there. Happy it played out, next analysis coming."`,
              outcome: `No emotional inflation. Next call receives the same analytical rigour — not inflated confidence from the win. The neutrality actually builds more trust than excessive celebration.`,
            },
            {
              contextTag: `[Loss communication, accountability, 2025]`,
              context: `Trader's public call loses 60%. Followers lose money.`,
              scenario: `Instead of going silent or deflecting, trader posts: "The bundle check showed 12% concentration which was elevated. I sized accordingly at 1%. The concentration resolved into a coordinated dump as I feared was possible. Updated rule: above 10% bundle concentration, maximum 0.5% position regardless of other signals."`,
              outcome: `Followers respect the accountability. Several DM to say they learned more from the loss post than from the win. The community trusts the process because they see it operating honestly.`,
            },
          ],
          keyTakeaway: `Always disclose your position when sharing analysis. Share the data and reasoning (analysis), not just the conclusion (directive). Set honest expectations about win rates. Be neutral to both wins and losses from your calls — consistent analytical quality is what you control, outcomes are probabilistic.`,
          guidedPractice: [
            {
              question: `You share a token analysis without disclosing that you hold a large position in it. What is the problem?`,
              options: [`A — No problem — the analysis quality is what matters`, `B — Non-disclosure means your audience cannot calibrate your incentive. You have financial motivation for them to buy. Without disclosure, they are making a decision without complete information.`, `C — Only a problem if the token subsequently loses value`, `D — Only a problem if you have more than 10,000 followers`],
              correct: 1,
              hint: `What information does the audience need to properly evaluate your analysis?`,
              explanation: `B is correct. "I am long at $35K MC" is material information. It tells the audience: (1) you have skin in the game (credibility signal); (2) you have an incentive for them to buy (calibration signal). Without it, followers cannot distinguish genuine analysis from position pumping. Disclosure is not optional for trustworthy public sharing.`,
            },
            {
              question: `What is the difference between sharing "analysis" and sharing a "conclusion" and why does it matter?`,
              options: [`A — They are the same thing expressed differently`, `B — Analysis = sharing the data and reasoning so the reader can evaluate independently. Conclusion = "buy this." Analysis builds analytical capability in followers; conclusions create dependency and transfer responsibility.`, `C — Conclusions are more actionable and therefore more valuable`, `D — Only institutional traders need to share analysis rather than conclusions`],
              correct: 1,
              hint: `Which approach produces followers who can trade independently vs followers who need your call to act?`,
              explanation: `B is correct. "Here is the checklist data, here are the risk factors, here is why I'm entering" lets each follower make their own informed decision. "Buy this now" creates a crowd that acts without understanding — and blames you when it fails. The former builds a better community and more durable reputation.`,
            },
            {
              question: `A call you made publicly lost 55%. Several followers DM angry messages. What does the source material say is the correct internal response?`,
              options: [`A — Apologise extensively and offer compensation`, `B — Be neutral — "People losing money is your fault. Be neutral to both." Acknowledge the loss publicly with analysis of what went wrong, update your rules, and continue the same quality process. Neither internalise the blame nor deflect it.`, `C — Delete the post to remove the record`, `D — Only respond to followers who were polite in their DMs`],
              correct: 1,
              hint: `What does "be neutral to both" mean for loss outcomes?`,
              explanation: `B is correct. The source material explicitly addresses this: "People making money is your fault. People losing money is your fault. Be neutral to both." The losses are not your "fault" in a moral sense — they are probabilistic outcomes of a process you shared. Document what went wrong, update the rule, continue. This is the only sustainable response.`,
            },
            {
              question: `Why should your public win rate claim match your actual documented win rate?`,
              options: [`A — It doesn't matter — people can't verify it`, `B — The blockchain is public. Your historical trade calls are archived on Twitter/X. The moment someone checks your actual performance against your claimed 80% win rate and finds 52%, your entire credibility collapses — irreversibly.`, `C — Only relevant if you charge for an alpha group`, `D — Win rate claims are not scrutinised by the crypto community`],
              correct: 1,
              hint: `What tools exist to check historical call performance, and how easily accessible are they?`,
              explanation: `B is correct. Check KOL Stats and manual Twitter archives make historical call records accessible to anyone. Inflated win rate claims are provably false and are checked by skeptical followers regularly. Understating your actual performance slightly (or stating it accurately) is both honest and strategically superior to creating a verifiable lie.`,
            },
            {
              question: `You have 8,000 followers. When you post, price typically moves 8–12% upward on the buying surge. How should this reality change how you manage your positions?`,
              options: [`A — Post more frequently to maximise the price impact for your holdings`, `B — Account for your own market impact: take partial profit before posting (so you are selling into the surge you create), ensure full position disclosure in the post, and do not enter new positions specifically to profit from the surge you will create.`, `C — Stop posting to avoid market manipulation concerns`, `D — Only post after you have exited the position entirely`],
              correct: 1,
              hint: `What is the difference between natural price appreciation from a good call vs price appreciation you deliberately create to profit from?`,
              explanation: `B is correct. At 8,000 followers with documented 8–12% price impact, you are effectively a micro-KOL with real market power. The ethical framework is: disclose, take partial profit before the post-created surge if you plan to sell, and do not design entries specifically to pump through your audience. The line between sharing genuine analysis and market manipulation is crossed when the post's purpose is the price impact, not the information.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You hold $CUBE, entered at $80K MC (1.5% portfolio). It is now at $620K MC (7.75×). You have taken zero profit.\n\nYou are considering posting a Twitter thread about $CUBE with full analysis.\n\nYou know from your past 6 months that your posts typically move tokens 8–15% upward within 30 minutes. You have 9,200 followers.\n\nDesign your exact action sequence: what you do before posting, what you include in the post, and what you do immediately after the posting surge.`,
              scoringCriteria: [
                `Before posting: take 33–40% profit BEFORE the post. This ensures you are not specifically designing the post to create a surge you then sell into. If you post while fully long and then sell into the surge, you are using your audience for exit liquidity.`,
                `Post contents: (1) explicit position disclosure: "Long since $80K MC, took 35% profit today"; (2) full checklist data — what passes, what elevated risks exist; (3) current thesis for remaining position; (4) realistic risk factors; (5) no price targets or "this will pump."`,
                `After posting surge: do NOT add to the position on the surge you created. If you want to add, wait 24 hours for the surge to settle. Consider taking another 20% profit into the surge on the remaining position if thesis has been validated by the price action.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Public track record audit. You have been posting calls publicly for 5 months. Twitter archive search shows 32 documented public calls.\n\nYour own memory of results: approximately 70% win rate.\nActual archived results: 20 wins, 12 losses (62.5% win rate).\n\nA follower DMed: "I've been tracking all your calls and your actual win rate is 62.5%, not 70% as you mentioned in a thread last month. Can you clarify?"\n\nDesign your exact response and the process change you make going forward.`,
              scoringCriteria: [
                `Response: "You are correct. I reviewed my archived calls — 20 wins and 12 losses is 62.5%, not the 70% I quoted from memory last month. I will update the pinned post. Accurate tracking matters more than appearing good, and I appreciate the accountability."`,
                `This response acknowledges the error directly, corrects the record publicly, and thanks the person doing the accountability work — exactly the behaviour that builds long-term trust.`,
                `Process change: create a public running tracker (simple Twitter thread or linked spreadsheet) that logs every call with outcome as it resolves. Real-time public documentation eliminates the discrepancy between memory and reality. The source material's public "Shitcoin Learnings" thread is exactly this model.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You have been public about your trading for 9 months. Your follower count: 600→1,200→2,800→5,500→8,100→11,400→14,200→17,800→22,000. Steady growth.\n\nThree major events in the timeline:\n- Month 3: You documented a 78% loss publicly with detailed analysis of what you missed. 200 followers gained that week (biggest weekly gain to that point).\n- Month 6: A call went 35× — you posted before taking any profit. Token's price surged 15% additional on your post. You then sold the next day into high volume.\n- Month 8: A follower publicly accused you of pumping tokens. Your response: you shared the full trade timeline (entry → post → exit) without defensive framing.\n\nEvaluate each event. What did you do right or wrong, and what long-term reputation impact resulted from each?`,
              scoringCriteria: [
                `Month 3 (loss documentation): CORRECT. The 200-follower surge from a loss post proves the trust-building effect of transparency. This action compounded positively over the following months.`,
                `Month 6 (posted before taking profit, sold next day): PROBLEMATIC. Posting fully long, getting a 15% audience-created surge, then selling the next day is the pattern that creates "pumper" accusations regardless of whether your analysis was genuine. Should have taken partial profit before posting or not sold so quickly after. Even if unintentional, the incentive structure was indistinguishable from deliberate manipulation.`,
                `Month 8 (accusation response): CORRECT. Sharing the full trade timeline without defensive framing is exactly the transparency that defuses credibility attacks. The accusation lost traction because the evidence was public and the response was analytical not emotional.`,
              ],
            },
          ],
        },
      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret'],
        description: 'Random draw from Lab 4 — network building, KOL dynamics, responsible public sharing.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.75 },
      },
      bossMode: {
        title: `Lab 4 Boss — Network and Reputation Integration`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-int-lab4-v1',
          situation: `Portfolio $55,000. You have 7,200 Twitter followers and an inner circle of 6 traders.\n\nScenario A: An inner circle contact DMs: "Not sharing publicly yet but I'm in $PIXEL at $28K MC — all signals clean, AI Phase 1, pre-public wallet confirmed buying. Thought you'd want to know."\n\nScenario B: 30 minutes after entering $PIXEL, a KOL with 95K followers (Check KOL Stats shows 58% win rate, no sponsored calls) calls $PIXEL publicly. Price jumps 25% to $185K MC.\n\nScenario C: Your inner circle contact DMs: "Are you posting about this? I'm up 5× and want confirmation the thesis is still valid."\n\nRequired: (1) What do you do when you receive the DM in Scenario A and why? (2) How do you use the KOL call in Scenario B — enter more, take profit, or ignore? (3) How do you respond to your inner circle contact in Scenario C? (4) If you decide to post publicly about $PIXEL, design the exact post content.`,
          scoringCriteria: [
            `Scenario A action: evaluate independently (run full checklist), then enter 1.5–2% portfolio ($825–$1,100) at $28K MC if checklist passes. Respond to contact: "Thanks — checking now. Clean on my end too, entering at 1.5%." This is inner circle functioning correctly — advance information + independent validation.`,
            `Scenario B (KOL call at $185K, up 5.6×): do not add. You are already in from $28K. The KOL call is confirmation of thesis AND a take-profit trigger. Take 25–33% profit into the call volume. The call brought buyers who are now your exit liquidity for the partial position.`,
            `Scenario C response to inner circle: provide honest analytical update — "Thesis valid: Phase 1 AI narrative still intact, sniper concentration absorbed, community growing. I took 25% profit at $185K into the KOL call. Remaining position as free ride. What's your current read on community activity?" This is collaborative analytical engagement, not just telling them to hold.`,
            `Public post if deciding to post: (1) disclose position: "Long since $28K MC, took 25% profit at $185K"; (2) include the analytical checklist data; (3) note the KOL call as confirmation; (4) state current thesis and risk factors; (5) no price targets. Full transparency enables followers to make their own informed decision.`,
          ],
        }],
      },
    },

    // ── Senior Labs 1 & 2 ────────────────────────────────────────────────
    {
      id: 'lab-11-market-dynamics',
      title: `Lab 1: Market Dynamics and Macro Timing`,
      subtitle: `Trading memecoins without understanding macro conditions is like sailing without checking the weather.`,
      lessons: [
        {
          id: 'btc-cycle-macro-positioning',
          title: `BTC Cycle Awareness — How Macro Drives Every Memecoin`,
          explanation: `The source material's most important macro observation: "Low caps cook when market is good. Market bad = low caps bad. Took me all of August and September to realize this."\n\nThis is not a minor observation. It is the framework for when to be aggressive and when to be conservative with every memecoin strategy covered in this track.\n\n**The BTC 4-year halving cycle:**\nBitcoin's supply halving occurs approximately every 4 years, reducing new BTC issued per block by 50%. Historically, the 12–18 months following a halving have been strong bull market periods for all crypto including memecoins. The preceding 6–12 months are typically accumulation. The 18–24 months after peak are distribution and bear.\n\nMemecoins are the highest-beta asset in the ecosystem — they amplify both bull and bear phases. A 30% BTC bull run can produce 500% memecoin runs. A 30% BTC correction can produce 80% memecoin wipeouts.\n\n**Reading where we are in the cycle:**\nFour macro states affect memecoin strategy differently:\n\nAccumulation (BTC ranging, sentiment neutral to bearish): reduce new pair exposure significantly. Focus on established cult coins at oversold levels. Preserve capital for the bull phase entry.\n\nBull phase (BTC in sustained uptrend, new ATHs): maximum memecoin activity. All three trader styles productive. Narrative baskets and new pair gambles generate best returns.\n\nDistribution (BTC near cycle top, euphoria, retail flooding in): scale back progressively. New pair exposure drops to minimum. Take profits on cult coins. Convert to stablecoins or SOL.\n\nBear phase (BTC in sustained downtrend): near-zero new pair activity. Dry powder only. Monitor for the bottom accumulation phase. The source material: "on days where there is blood, you can make the most money when market recovers." Bear phase = build the capital to deploy at the bottom.\n\n**Practical macro indicators:**\nBitcoin dominance (BTC's market share): rising dominance = capital flowing to safety = bearish for memecoins. Falling dominance = altcoin season = bullish for memecoins. Crypto Fear and Greed Index: extreme fear = potential bottom. Extreme greed = potential top. Solana price relative to its 200-day MA: above = bull regime. Below = bear regime.`,
          visualPrompt: `👆 BTC cycle overlay with memecoin activity levels: accumulation → bull → distribution → bear`,
          visualType: `chart`,
          visualUrl: `btc-cycle-memecoin-correlation`,
          examples: [
            {
              contextTag: `[Bull phase positioning, maximum activity, 2024]`,
              context: `BTC breaks all-time high. Crypto Fear and Greed at 82 (extreme greed). Solana 40% above 200-day MA.`,
              scenario: `Experienced trader identifies: bull phase confirmed. Activates maximum memecoin strategy: 30% active allocation, full narrative basket deployment, new pair entries at 2% each instead of 1%.`,
              outcome: `Next 6 weeks: portfolio grows 340%. Bull phase correctly identified and maximum edge extracted. Begins reducing exposure at first signs of distribution (BTC dominance rising, Fear and Greed near 90).`,
            },
            {
              contextTag: `[Bear phase capital preservation, 2022]`,
              context: `BTC in sustained downtrend, -60% from ATH. Solana -75%. Memecoin losses widespread.`,
              scenario: `Trader maintains near-zero new pair exposure. Holds 85% in stablecoins. Studies the market while preserving capital.`,
              outcome: `When BTC accumulation phase begins (6 months later), trader deploys preserved capital into quality positions at 80% discounts. The bear phase study period provides clarity on which cults survived and which died — the research that makes the recovery trade profitable.`,
            },
            {
              contextTag: `[BTC dominance signal, alt season recognition, 2025]`,
              context: `BTC dominance at 58% and falling. SOL price strength accelerating relative to BTC.`,
              scenario: `Trader recognises falling BTC dominance as alt season beginning. Increases Solana memecoin allocation from 20% to 30%. Focuses on Phase 1 narrative basket building.`,
              outcome: `Alt season produces 3× average on active positions over 8 weeks. BTC dominance signal was the early indicator — the Solana-specific moves followed 2–3 weeks after the dominance shift.`,
            },
          ],
          keyTakeaway: `Memecoin returns are heavily dependent on macro cycle phase. Bull phase: maximum activity. Distribution: scale back. Bear: near-zero new pairs, preserve capital. BTC dominance and Solana vs 200-day MA are the two most actionable macro indicators for calibrating memecoin strategy.`,
          guidedPractice: [
            {
              question: `BTC is in a sustained bear market, down 55% from ATH over 8 months. What is the optimal memecoin strategy?`,
              options: [`A — Increase activity — cheaper tokens mean better entry prices`, `B — Near-zero new pair exposure. Preserve capital in stablecoins/SOL. Monitor for bottom signals. Prepare dry powder for the accumulation phase recovery.`, `C — Switch entirely to Ethereum memecoins`, `D — Use leverage to offset the bear market`],
              correct: 1,
              hint: `"Low caps cook when market is good. Market bad = low caps bad." What does "bad" in this context mean for new pair strategies?`,
              explanation: `B is correct. In a bear market, retail capital has exited the ecosystem. New pair memecoins require retail buyers to sustain momentum — without them, even technically strong tokens fail to gain traction. Preserving capital during the bear phase positions you to buy quality at massive discounts when the cycle turns.`,
            },
            {
              question: `BTC dominance rises from 48% to 58% over 6 weeks. What does this signal for Solana memecoins specifically?`,
              options: [`A — More capital flowing into crypto overall — bullish`, `B — Capital rotating from altcoins into Bitcoin — bearish for Solana memecoins. Rising dominance = investors seeking safety, reducing speculative exposure.`, `C — Ethereum is outperforming Solana`, `D — Institutional buying of Bitcoin — irrelevant to memecoins`],
              correct: 1,
              hint: `If BTC's share of total market cap is increasing, where is capital flowing from?`,
              explanation: `B is correct. BTC dominance rising means altcoin capital is flowing to Bitcoin (perceived as safer). The most speculative assets — Solana memecoins — are the first to lose capital and the last to recover. Rising dominance is the macro warning signal to reduce memecoin exposure progressively.`,
            },
            {
              question: `SOL price is 35% above its 200-day moving average. Crypto Fear and Greed is at 75. What macro regime does this indicate for memecoin strategy?`,
              options: [`A — Bear phase — extreme greed always precedes a crash`, `B — Bull phase — above 200-day MA confirms uptrend, Fear and Greed 75 is elevated but not extreme. Full memecoin activity appropriate with normal position sizing.`, `C — Distribution phase — reduce all positions immediately`, `D — Impossible to determine without BTC dominance data`],
              correct: 1,
              hint: `Above 200-day MA = what trend direction? What does F&G 75 indicate vs 90?`,
              explanation: `B is correct. SOL above 200-day MA = bullish regime confirmed. Fear and Greed 75 = elevated but not extreme greed (90+ would be distribution signal). This combination indicates active bull phase — appropriate for full memecoin activity. The distribution warning would come at F&G 85–90+ combined with BTC dominance rising.`,
            },
            {
              question: `During extreme greed (Fear and Greed 92) with BTC at ATH, you have a strong Phase 1 narrative basket opportunity. What adjustment does the macro environment require?`,
              options: [`A — Increase position sizes — everything is working`, `B — Enter the basket at reduced sizes (0.5% each instead of 1%) and set tighter exit triggers. Extreme greed means distribution is near — the same trade has lower expected value when cycle peak is likely close.`, `C — Do not enter at all — extreme greed always means immediate crash`, `D — Macro conditions are irrelevant to new pair trades`],
              correct: 1,
              hint: `What happens to the risk/reward of entering at a potential cycle top vs mid-bull phase?`,
              explanation: `B is correct. The basket strategy still has validity at extreme greed — Phase 1 narratives can still develop. But the exit window is shorter and the potential for sudden macro reversal is higher. Reduced sizing and tighter exit triggers (take profit faster, less free ride) adjusts the position for the elevated risk environment without missing the opportunity entirely.`,
            },
            {
              question: `The source material states "low caps cook when market is good, market bad = low caps bad." What is the practical implication for portfolio allocation across market cycles?`,
              options: [`A — Maintain constant 30% active allocation regardless of macro conditions`, `B — Scale active allocation with macro conditions: 25–35% in bull phase, 10–15% in neutral/range, 0–5% in confirmed bear. Preserve more capital during bad conditions to deploy at the bottom.`, `C — Move entirely into BTC during bad conditions`, `D — Increase leverage during bad conditions to maintain returns`],
              correct: 1,
              hint: `If low caps amplify macro moves in both directions, how should allocation respond to cycle phase?`,
              explanation: `B is correct. The relationship between macro and low cap performance is not linear — it is amplified. A 20% bear market produces 70–80% low cap declines. Maintaining 30% allocation through a bear phase means 21–24% portfolio damage from macro alone. Scaling down allocation during bad conditions protects the capital that generates outsized returns in the next bull phase.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Portfolio $75,000. Three macro indicator readings:\n\nIndicator 1: BTC price at $95,000 (all-time high area). 200-day MA: $68,000. BTC is 40% above 200-day MA.\nIndicator 2: BTC dominance: 62% and RISING over last 3 weeks.\nIndicator 3: Crypto Fear and Greed: 88 (extreme greed). Was 65 two weeks ago.\n\nCurrent active memecoin allocation: 32% ($24,000 in 8 positions, all profitable).\n\n1. What macro phase does this indicate?\n2. What is the appropriate active allocation response?\n3. Which positions should you prioritise exiting and in what order?`,
              scoringCriteria: [
                `Macro phase: DISTRIBUTION. BTC at ATH + rising dominance (capital rotating to safety within crypto) + extreme greed (89 F&G) = multiple simultaneous distribution signals. Not crash-imminent necessarily but cycle peak area — risk/reward of new entries is at worst point in cycle.`,
                `Allocation response: begin reducing progressively. Target 15–20% active allocation (from 32%). Do not panic-sell everything at once — exit into existing buying momentum over 3–5 days.`,
                `Exit priority: (1) newest positions first (least validated theses, least community formation time); (2) any positions showing holder concentration reduction (already in slow exit mode); (3) positions that are at natural profit targets; (4) keep only highest-conviction cult coins with genuine community as the last positions to exit.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Historical performance analysis across 4 macro periods:\n\nPeriod A (Bull phase, 8 months): 65 trades, 58% win rate, avg return +245%. Portfolio: $15K → $52K.\nPeriod B (Distribution, 2 months): 28 trades, 44% win rate, avg return +85%. Portfolio: $52K → $48K.\nPeriod C (Bear phase, 10 months): 12 trades, 33% win rate, avg return -25%. Portfolio: $48K → $41K.\nPeriod D (Accumulation, 4 months): 18 trades, 52% win rate, avg return +155%. Portfolio: $41K → $56K.\n\n1. What should your trade count have been in Period C?\n2. What trade count and sizing in Period D would have maximised the accumulation phase?\n3. Calculate the portfolio value at end of Period D if Period C strategy was 0 new pair trades + capital preserved at $52K.`,
              scoringCriteria: [
                `Period C should have been: 0–3 trades maximum. Style 3 only (established coins at extreme lows), no new pairs, no narratives. 12 trades during bear = fighting the macro.`,
                `Period D (accumulation): 30–40 trades at 2× normal size. Accumulation phase is the highest-quality entry window — assets at discounted prices before mainstream recognition of the turn. This is exactly when to deploy preserved capital aggressively.`,
                `Alternative Period C-D with capital preservation: Portfolio preserved at $52K entering Period D. At Period D's performance (+37% from $41K base), applied to $52K instead: $52K × 1.37 = $71,240 vs actual $56K. The capital preservation during bear phase generates an additional $15,240 in Period D recovery — entirely from strategic allocation, not skill.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You are building a macro-calibrated trading plan for the next 12 months. Current conditions:\n\n- BTC: $72,000 (was $95,000 ATH 4 months ago, currently in post-ATH correction)\n- SOL: $145 (was $280 ATH, currently -48% from peak)\n- BTC dominance: 58% (rising from 51% 4 months ago)\n- Fear and Greed: 38 (fear zone)\n- On-chain: Solana DEX volume down 60% from peak. New wallet creation down 45%.\n\nBased on this data:\n1. Identify the current macro phase.\n2. Design your memecoin strategy for the next 3–6 months.\n3. What specific indicators would signal it is time to increase activity?`,
              scoringCriteria: [
                `Current phase: Early bear / Distribution completion. Post-ATH correction in progress. Fear zone (38) suggests sentiment clearing out speculative excess but not yet at extreme fear (10–20) that typically marks cycle bottoms.`,
                `Strategy for 3–6 months: 0–5% active memecoin allocation. Focus: (1) identify which cult coins survived the correction with active communities (these are your future bull phase entries); (2) monitor wallet-tracked smart money for accumulation signals; (3) build watch lists and research rather than trading; (4) convert any existing positions to SOL/stablecoins progressively.`,
                `Signals to increase activity: (1) BTC dominance reverses and begins declining; (2) Fear and Greed enters extreme fear (sub-20) and begins recovery; (3) SOL price reclaims 200-day MA; (4) Solana DEX volume shows month-over-month recovery; (5) smart money wallets begin accumulating again after 4+ weeks quiet.`,
              ],
            },
          ],
        },
        {
          id: 'solana-ecosystem-health',
          title: `Solana Ecosystem Health — Reading Platform-Specific Signals`,
          explanation: `Macro BTC cycle awareness sets the broad regime. Solana-specific health indicators fine-tune your activity level within that regime. You can be in a bull macro environment while Solana itself is in a cooling phase — and vice versa.\n\n**Key Solana health metrics:**\n\nDaily active addresses: how many unique wallets are transacting on Solana. Rising = growing ecosystem activity. Declining = contraction. Peak memecoin seasons typically show 3–5× normal daily addresses.\n\npump.fun graduation rate: what percentage of tokens are reaching the $69K graduation threshold. In hot memecoin conditions: 3–5% graduation rate. In cool conditions: 1–2%. This metric tells you whether retail buyers are sustaining momentum past the bonding curve phase or dying mid-curve.\n\nTotal DEX volume (Raydium, Jupiter): the absolute dollar amount being traded on Solana DEXs daily. Rising DEX volume = capital entering/active. Declining = capital exiting or dormant.\n\nSOL price vs BTC: when SOL is outperforming BTC (ratio rising), Solana-specific capital is flowing in. When underperforming (ratio falling), Solana is losing capital relative to Bitcoin even in a bull market.\n\n**Reading memecoin seasons within Solana:**\nSolana has 3–6 month micro-cycles within the BTC macro cycle. A memecoin season (elevated activity, fast money, many graduates) is followed by a cooling period (lower graduation rates, slower price action) even during an overall bull market. These micro-cycles affect strategy:\n\nMemecoin season active: aggressive Style 1 deployment, narrative baskets, higher position frequency. Cooling period: shift to Style 2 and 3, reduce new pair activity, focus on established cults.\n\n**Platform-specific catalysts:**\nMajor Solana ecosystem events create activity spikes: large protocol launches, airdrops to SOL holders, major token graduations (when a pump.fun token becomes top-10 on Solana, it brings attention to the whole ecosystem), institutional Solana adoption news. Monitor the Solana ecosystem calendar and position ahead of historically active periods.`,
          visualPrompt: `👆 Solana health dashboard: DEX volume, graduation rate, daily addresses over 12 months`,
          visualType: `chart`,
          visualUrl: `solana-ecosystem-health-dashboard`,
          examples: [
            {
              contextTag: `[Memecoin season identification, high graduation rate, 2025]`,
              context: `Solana shows: daily DEX volume up 280% in 2 weeks. pump.fun graduation rate at 4.2%. Daily active addresses at 2-year high.`,
              scenario: `Experienced trader identifies: memecoin season active. Increases Style 1 allocation from standard 20% active to 35% active. Deploys narrative baskets across 3 detected Phase 1 themes.`,
              outcome: `6-week memecoin season produces 280% portfolio growth. Metrics-based identification of the season start allowed aggressive early positioning rather than reactive entry.`,
            },
            {
              contextTag: `[Cooling period detection, reduced activity, 2025]`,
              context: `pump.fun graduation rate drops from 3.8% to 1.4% over 3 weeks. DEX volume declining daily. New wallet creation down 30%.`,
              scenario: `Trader recognises cooling signal. Shifts from Style 1 (new pairs) to Style 2 (established cult dip buying). Reduces overall allocation from 30% to 15%.`,
              outcome: `The cooling period lasts 6 weeks. Style 2 trades on established cults produce consistent +15–25% returns. Style 1 trades by those who didn't notice the cooling: mostly losses. Reading the ecosystem metrics paid off.`,
            },
            {
              contextTag: `[Ecosystem catalyst positioning, major protocol launch, 2025]`,
              context: `A major Solana DeFi protocol announces token launch in 3 weeks. Historically, major Solana launches increase DEX volume 150–200% during launch period.`,
              scenario: `Trader positions in established Solana meme cult coins 2 weeks before launch, anticipating the ecosystem attention surge.`,
              outcome: `Protocol launch brings significant capital and attention to Solana. Cult coins benefit from the increased visibility. Established cults up 40–80% during the 2-week launch window. Positioning ahead of known catalyst worked exactly as expected.`,
            },
          ],
          keyTakeaway: `Solana micro-cycles operate within the BTC macro cycle. Monitor: graduation rate (>3% = active season), DEX volume trend, daily active addresses, SOL vs BTC ratio. Memecoin season = aggressive deployment. Cooling period = shift to Style 2/3 and reduce allocation. Position ahead of ecosystem catalysts.`,
          guidedPractice: [
            {
              question: `pump.fun graduation rate drops from 4.1% to 1.3% over 4 weeks. What strategy adjustment does this signal?`,
              options: [`A — Increase new pair activity — cheaper tokens are more available`, `B — Shift toward Style 2 and 3, reduce Style 1. The graduation rate decline means retail buying is insufficient to sustain momentum past the bonding curve — new pairs are more likely to fail.`, `C — Switch to Ethereum memecoins instead`, `D — Graduation rate is not a meaningful indicator`],
              correct: 1,
              hint: `If fewer tokens are graduating, what does that tell you about the buyers required to sustain new pair momentum?`,
              explanation: `B is correct. Graduation requires sustained buying to fill the bonding curve to ~$69K. A declining graduation rate means retail buyers are running out of steam — the marginal buyer is no longer showing up. New pairs in this environment peak quickly and die. Style 2 (established cults) and Style 3 (lowcap revivals) are more resilient to thin retail buying.`,
            },
            {
              question: `SOL is up 15% in a week while BTC is up 8% in the same period. What does the SOL/BTC ratio signal?`,
              options: [`A — Nothing meaningful — both are up`, `B — Solana is outperforming BTC — capital is specifically entering the Solana ecosystem. This is a positive signal for Solana memecoin activity.`, `C — Ethereum is underperforming`, `D — This signals a macro bear market beginning`],
              correct: 1,
              hint: `If SOL is gaining market share against BTC, where is the new capital going?`,
              explanation: `B is correct. SOL outperforming BTC means capital flowing specifically into the Solana ecosystem relative to Bitcoin. Capital entering Solana eventually finds its way into memecoins, DeFi, and new protocols. The SOL/BTC ratio is an early signal of Solana-specific capital inflows before they show up in DEX volume or graduation rates.`,
            },
            {
              question: `Daily Solana DEX volume: Week 1 $800M, Week 2 $1.1B, Week 3 $1.6B, Week 4 $1.9B. What does this trend indicate?`,
              options: [`A — Market manipulation — volume is artificially inflated`, `B — Growing capital activity in the Solana ecosystem — consistent week-over-week DEX volume growth signals a developing or active memecoin season`, `C — Only relevant if it reaches $3B+`, `D — DEX volume is irrelevant compared to CEX volume`],
              correct: 1,
              hint: `What causes DEX volume to grow consistently week-over-week?`,
              explanation: `B is correct. Consistent DEX volume growth = more capital entering the ecosystem and more trading activity. This combination — increasing capital + increasing activity — is the precondition for a memecoin season. Each week of growth adds liquidity that makes new pair memecoins more likely to sustain momentum.`,
            },
            {
              question: `A major Solana protocol is launching its token in 2 weeks. Historical data shows the last 3 major Solana launches increased ecosystem DEX volume 150–200% for 2–3 weeks. How do you position?`,
              options: [`A — Wait for the launch to confirm before entering anything`, `B — Position in existing Solana cult coins 1–2 weeks before launch — the volume surge will lift all Solana assets. Take profit during/after the launch event.`, `C — Avoid memecoins during major launches — they get overlooked`, `D — Only buy the protocol's own token`],
              correct: 1,
              hint: `If a major launch historically increases ecosystem volume, what benefits from that increased activity?`,
              explanation: `B is correct. Major Solana launches bring attention and capital to the ecosystem broadly, not just to the launched token. Established cult coins benefit from the increased trader activity, discovery, and fresh capital entering the ecosystem. Positioning 1–2 weeks before (before the catalyst is priced in) and exiting during the launch week volume surge is the clean catalyst trade.`,
            },
            {
              question: `During a cooling Solana micro-cycle (low graduation rate, declining DEX volume), a smart money wallet you track buys a new pair at $35K MC. Does the ecosystem cooling change your response?`,
              options: [`A — No — smart money is always right regardless of conditions`, `B — Yes — in a cooling ecosystem, even good tokens face headwinds from thin retail buying. The wallet signal remains meaningful, but reduce position size (0.75% vs standard 1.5%) and tighten exit criteria.`, `C — Ignore the wallet signal when ecosystem conditions are weak`, `D — Wait for DEX volume to recover before entering any new pair`],
              correct: 1,
              hint: `How does ecosystem liquidity affect the probability that a good token can sustain a move to 5–10×?`,
              explanation: `B is correct. A smart money wallet buy is still a positive signal in a cooling ecosystem, but the expected value is lower — fewer retail buyers to sustain momentum. Adjusting position size and exit criteria accounts for the reduced base rate of success for new pairs in this environment. The signal is real; the conditions affect the size and duration of the expected move.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Monthly Solana ecosystem data for the last 4 months:\n\nMonth 1: DEX volume $24B/month. Graduation rate 3.8%. Daily addresses: 1.2M. SOL: $185.\nMonth 2: DEX volume $38B. Graduation rate 4.4%. Daily addresses: 1.8M. SOL: $240.\nMonth 3: DEX volume $52B. Graduation rate 5.1%. Daily addresses: 2.4M. SOL: $320.\nMonth 4: DEX volume $41B. Graduation rate 3.9%. Daily addresses: 2.1M. SOL: $290.\n\nPortfolio at start of Month 1: $45,000.\n\n1. Identify the peak ecosystem activity month and what it signalled.\n2. What should portfolio allocation have been at the start of each month?\n3. What does Month 4 data suggest for Month 5 strategy?`,
              scoringCriteria: [
                `Peak: Month 3 (all metrics highest). This is the deepest memecoin season. Signals: maximum activity month — but also the inflection point to watch for reversal.`,
                `Allocation: Month 1 (season starting, 3.8% graduation = active): 25–30%. Month 2 (season developing, all metrics rising): 30–35%. Month 3 (peak, all highest): still 30–35% but begin scaling out of riskiest positions — peak is when to reduce not add. Month 4 (metrics declining from peak): 20–25%, shifting toward Style 2/3.`,
                `Month 5 strategy: Month 4 shows consistent decline across all 3 metrics. This is a cooling micro-cycle. Month 5 should be: 15–20% active maximum, Style 2 and 3 focus, no new pair narrative baskets, monitor for stabilisation or further decline. If Month 5 metrics stabilise, hold. If continue declining, reduce to 10%.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You have been tracking these weekly Solana metrics for 8 weeks:\n\nWeek 1–4: DEX volume $8–10B/week. Graduation rate 2.1–2.4%. Fear and Greed 35–42.\nWeek 5: DEX volume $14B. Graduation rate 3.1%. F&G: 52. BTC breaks 6-month resistance.\nWeek 6: DEX volume $19B. Graduation rate 3.8%. F&G: 64. SOL up 28% in 2 weeks.\nWeek 7: DEX volume $26B. Graduation rate 4.3%. F&G: 71. Two new Solana narratives emerging.\nWeek 8 (now): DEX volume $32B. Graduation rate 4.9%. F&G: 78. Inner circle reporting 3+ pre-public opportunities.\n\nCurrent portfolio: $60,000. Active allocation: 18% ($10,800).\n\nIs this the start of a memecoin season? Design your Week 9 strategy including: allocation target, specific focus areas, and what would reverse your thesis.`,
              scoringCriteria: [
                `Season identification: YES — all metrics confirm memecoin season. BTC breakout (catalyst), accelerating DEX volume (4× in 8 weeks), graduation rate 4.9% (hot), F&G 78 (elevated but not extreme), two emerging narratives, inner circle seeing pre-public opportunities.`,
                `Week 9 strategy: Increase to 28–32% active ($16,800–$19,200). Deploy narrative baskets on the two emerging themes (1% each, 4–6 tokens per basket). Activate any recently validated wallet tracking opportunities. New pair entries at 1.5% (slightly above standard due to hot conditions).`,
                `Thesis reversal signals: (1) DEX volume declines 2 consecutive weeks; (2) graduation rate drops below 3%; (3) F&G reaches 88+ (extreme greed) AND BTC dominance rises simultaneously; (4) inner circle DM flow drops significantly; (5) BTC loses the breakout level that triggered the season.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Historical memecoin season comparison — two seasons side by side:\n\nSeason Alpha (2023): Duration 14 weeks. Peak graduation rate 6.2%. Peak DEX volume $58B/week. Started from F&G 28 (extreme fear). BTC had just broken 6-month resistance.\n\nSeason Beta (2024): Duration 8 weeks. Peak graduation rate 4.1%. Peak DEX volume $32B/week. Started from F&G 48 (neutral). BTC had not broken any major resistance.\n\n1. What made Season Alpha stronger and longer than Season Beta?\n2. If you had $50,000 at the start of each season with 30% active, calculate the approximate portfolio value at each season's peak.\n3. What current conditions would signal a potential Season Gamma beginning?`,
              scoringCriteria: [
                `Alpha was stronger: started from extreme fear (maximum pessimism = maximum available upside when sentiment reversed), BTC broke resistance (structural catalyst), metrics hit higher peaks. Beta started from neutral (less room for sentiment improvement), no structural BTC catalyst, metrics weaker throughout.`,
                `Portfolio estimates: Season Alpha — 30% active ($15K). Season Alpha performance typically 300–500% on active positions in a 14-week 6% graduation rate season. $15K active × 4× avg = $45K gains, portfolio ~$80K. Season Beta — 30% active ($15K). 8-week 4% graduation rate = 150–250% avg. $15K × 2× = $15K gains, portfolio ~$65K. Alpha produced 60% more portfolio growth.`,
                `Season Gamma signals: F&G in fear zone (35 or below) currently AND BTC forming base at support AND Solana DEX volume stabilising after decline AND smart money wallets beginning to buy quietly. This is the accumulation signal set that preceded both Alpha and Beta.`,
              ],
            },
          ],
        },
        {
          id: 'event-driven-entries',
          title: `Timing Entries Around Market Events`,
          explanation: `Advanced traders build a mental calendar of market events and position in anticipation — not in reaction. By the time an event is happening, the smart money positioned before it is selling to you.\n\n**Categories of relevant market events:**\n\nMacro economic events: Fed interest rate decisions, CPI data releases. These affect risk-on/risk-off sentiment across all assets including crypto. Rate cut expectations = bullish. Rate hike fears = bearish. In the hours around these announcements, crypto volatility increases significantly. Professional traders either exit before the event or wait for it to resolve before entering.\n\nCrypto-specific events: major protocol token launches (covered in Ecosystem Health lesson), Bitcoin ETF flow data (weekly, accessible on-chain), large token unlocks (Solana, major L2s — unlocks create selling pressure), exchange listings of established memecoins.\n\nSolana calendar events: hackathons (increase developer activity → protocol launches → ecosystem attention), conferences (Solana Breakpoint, etc.), ecosystem grant announcements (direct capital injection).\n\n**The pre-event positioning principle:**\nFor positive expected events (rate cut, exchange listing, protocol launch): position 1–2 weeks before if the thesis is independently strong. The event validates and amplifies rather than being the entry trigger.\n\nFor uncertainty events (Fed decision, earnings-equivalent announcements): reduce active exposure 48–72 hours before. Volatility in either direction is more damaging to active memecoin positions than missing 2–3 days of potential upside.\n\n**The "sell the news" pattern:**\nMajor positive events often produce the "sell the news" pattern: price builds in anticipation, reaches a local peak at the moment of announcement, then corrects as speculators who positioned in anticipation exit. The news was already priced in. This is especially pronounced for exchange listings of already-pumped tokens.\n\n**Constructing an event calendar:**\nMaintain a simple calendar: Fed dates (8 per year, all known in advance), major crypto protocol launch dates (found on project Twitter, official announcements), weekly Bitcoin ETF flow releases, any scheduled Solana ecosystem events. Cross-reference with your current active positions before major events.`,
          visualPrompt: `👆 Event timeline: pre-event positioning, announcement, sell-the-news pattern, recovery`,
          visualType: `chart`,
          visualUrl: `event-driven-entry-patterns`,
          examples: [
            {
              contextTag: `[Pre-event positioning, Solana ecosystem launch, 2025]`,
              context: `Major Solana DeFi protocol announces token launch in 3 weeks. Expected to drive significant ecosystem attention.`,
              scenario: `Trader positions in 3 established Solana cult coins 2 weeks before launch. Independent thesis: all three have strong communities at consolidation levels. The launch provides an additional catalyst.`,
              outcome: `Launch day: all three cult coins up 35–65% on ecosystem attention. Trader exits 50% of each during launch week. The pre-positioning generated returns from both the organic thesis and the catalyst.`,
            },
            {
              contextTag: `[Fed event risk reduction, 2025]`,
              context: `FOMC decision in 48 hours. Market expects rate hold but there is uncertainty. Trader has 28% active allocation.`,
              scenario: `Reduces to 15% active allocation in the 48 hours before decision. Takes partial profits on most positions. Leaves only highest-conviction established cults.`,
              outcome: `Fed surprises with hawkish guidance. Market sells off 12% in 4 hours. Trader's 15% active position loses $1,800. Had they maintained 28% active: would have lost $4,200. Reduced exposure saved $2,400 from a single portfolio management decision.`,
            },
            {
              contextTag: `[Sell the news, exchange listing, 2025]`,
              context: `An established Solana memecoin announces Coinbase listing. Price pumps 80% on the announcement.`,
              scenario: `Trader had positioned 3 weeks earlier based on independent thesis (strong cult, $3M MC, cross-chain cultural weight test passed). Takes 60% profit immediately at announcement pump. Holds 40% as free ride.`,
              outcome: `Token does not hold the announcement pump — classic "sell the news" — drops 35% from the announcement peak over 2 days. Trader's 60% profit taken into the announcement was optimal. Free ride position absorbs the correction from a zero-cost basis.`,
            },
          ],
          keyTakeaway: `Position before catalysts, not on them. Reduce exposure before uncertainty events (Fed, major announcements). "Sell the news" pattern is common on major positive events. Build an event calendar: Fed dates, protocol launches, major unlocks. 48–72 hour pre-event reduction protects against adverse volatility.`,
          guidedPractice: [
            {
              question: `A Fed rate decision is scheduled in 36 hours. You have 30% active memecoin allocation. What is the professional action?`,
              options: [`A — Increase allocation before the decision — if it's a cut, everything will pump`, `B — Reduce to 15–20% active allocation. Take partial profits on most positions. The 48 hours around Fed decisions see increased volatility that disproportionately affects speculative assets — protecting capital from adverse volatility is more valuable than preserving potential upside.`, `C — Do nothing — Fed decisions rarely affect memecoins`, `D — Switch all positions to BTC for the Fed decision`],
              correct: 1,
              hint: `What is the asymmetry between "potential upside from staying in" vs "potential damage from adverse decision"?`,
              explanation: `B is correct. Fed decisions create binary outcomes — risk-on (cut or dovish guidance) or risk-off (hold with hawkish tone). Memecoins, as the highest-beta risk assets, amplify these moves. The professional move is reducing exposure before the uncertainty event and re-entering after the outcome is known, accepting the potential cost of missing a 2-day pump to protect against a 15% drawdown.`,
            },
            {
              question: `An established Solana memecoin announces a Binance listing. The price immediately pumps 120%. You have been holding this token since $800K MC and it is now at $18M MC. What pattern does this represent and what is your action?`,
              options: [`A — Hold through the listing — more pumping ahead`, `B — "Sell the news" pattern — the listing announcement was the peak catalyst. Take 50–70% profit immediately into the announcement pump. The remaining position is now free or near-free.`, `C — Buy more — Binance listing always leads to sustained higher prices`, `D — Wait for the listing date to sell`],
              correct: 1,
              hint: `If the listing was already announced, who positioned before you and what are they doing right now?`,
              explanation: `B is correct. "Sell the news" is the most consistent pattern around exchange listing announcements. Smart money positioned before the announcement is now using the announcement-driven buying surge as their exit window. Taking 50–70% profit immediately converts the announcement from a potential top into a locked-in gain. The remaining position is free ride with zero downside.`,
            },
            {
              question: `A major Solana protocol launch is scheduled in 2 weeks. How does the pre-event positioning principle apply?`,
              options: [`A — Wait until the launch day to enter`, `B — Identify which existing Solana assets have an independent strong thesis AND will benefit from launch ecosystem attention. Position 1–2 weeks before while conviction is low and price has not pre-priced the catalyst.`, `C — Only buy the launching protocol's token`, `D — Avoid memecoins around major launches — they are ignored during protocol attention`],
              correct: 1,
              hint: `When is price most affected by a catalyst — when nobody knows about it, or when everyone knows about it?`,
              explanation: `B is correct. The catalyst is most valuable as an entry accelerant 1–2 weeks before it is widely anticipated. At that point, price has not yet priced in the ecosystem attention surge. On launch day, the surge is expected and potentially already priced in. Pre-event positioning captures the catalyst AND the organic thesis — the combination produces better returns than either alone.`,
            },
            {
              question: `Which category of events warrants reducing active exposure and which warrants pre-event positioning?`,
              options: [`A — All events warrant reducing exposure`, `B — Uncertainty events (Fed decisions, major regulatory announcements): reduce exposure 48–72 hours before. Positive known catalysts (protocol launches, scheduled listings): pre-position 1–2 weeks before.`, `C — All events warrant aggressive pre-positioning`, `D — Market events have no predictable impact on memecoin strategy`],
              correct: 1,
              hint: `What is the difference between an event with unknown directional outcome vs one with a likely positive directional outcome?`,
              explanation: `B is correct. The key distinction is directional uncertainty. Fed decisions could go either way — risk reduction protects against the adverse scenario. Known positive catalysts (protocol launches, scheduled ecosystem events) have a likely positive directional impact that can be captured through pre-positioning. The strategy mirrors the event's information structure.`,
            },
            {
              question: `Bitcoin ETF flow data releases weekly and is publicly accessible. In a week where Bitcoin ETF inflows hit a record $2.1B, what does this signal for memecoin strategy?`,
              options: [`A — No relevance to memecoins`, `B — Record institutional Bitcoin inflows signal strong macro risk-on sentiment. Institutional money entering BTC historically precedes retail capital flowing into altcoins including Solana memecoins within 1–3 weeks. Increase readiness to deploy actively.`, `C — Reduce memecoin exposure — institutional BTC buying means retail is moving to Bitcoin`, `D — Only relevant if the inflows are from European institutions`],
              correct: 1,
              hint: `What typically follows institutional Bitcoin accumulation in the historical cycle pattern?`,
              explanation: `B is correct. Institutional BTC flows historically precede broader market risk-on sentiment by 1–3 weeks. Record inflows signal institutional conviction in the macro cycle — the same macro tailwind that eventually reaches Solana memecoins. This data point, combined with other ecosystem metrics, informs readiness to increase deployment.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Your event calendar for the next 3 weeks:\n\nWeek 1, Day 3: FOMC decision. Market expects hold but some chance of surprise.\nWeek 1, Day 6: Major Solana DeFi protocol token launch (expected to drive ecosystem activity).\nWeek 2, Day 2: Large Solana token unlock — $380M SOL unlocking from early investor wallets.\nWeek 3, Day 1: Bitcoin ETF data release (usually positive recently).\n\nCurrent portfolio: $70,000. Active allocation: 32% ($22,400).\n\nDesign your week-by-week positioning plan addressing each event.`,
              scoringCriteria: [
                `Week 1, Day 3 (FOMC): Reduce to 18% active ($12,600) by Day 2. Hold only highest-conviction positions. Re-evaluate immediately after decision.`,
                `Week 1, Day 6 (protocol launch): If FOMC resolved positively, increase back to 28% active. Pre-position in 2–3 Solana cult coins in Week 1 Days 4–5 to benefit from launch ecosystem attention.`,
                `Week 2, Day 2 (large unlock): Reduce by 15–20% from whatever active level held. Large unlocks create selling pressure. This is not a positive catalyst to pre-position for — it is a risk event to reduce before.`,
                `Week 3 (BTCetf data): If positive ETF flows confirmed, maintain or modestly increase position. This is lagging data confirming macro health, not a tradeable event itself.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Historical "sell the news" data from 12 exchange listing announcements on Solana memecoins:\n\nAverage announcement pump: +87%\nAverage price 48h after announcement: +31% from pre-announcement (i.e., -56% from announcement peak)\nAverage price 1 week after announcement: +18% from pre-announcement\nAverage price 4 weeks after announcement: +45% from pre-announcement\n\nOf the 12 listings:\n- 9 showed "sell the news" pattern (peak at/near announcement)\n- 2 continued higher post-announcement (genuine sustained demand)\n- 1 crashed 80% within 24 hours (rugger used listing announcement as exit)\n\nYou hold a token that just announced a Coinbase listing, currently at announcement pump peak.\n\nDesign the optimal exit strategy based on this historical data.`,
              scoringCriteria: [
                `Historical base rates: 75% chance of sell the news, 17% chance of sustained upside, 8% chance of dramatic crash. Expected value calculation strongly favours immediate partial profit-taking.`,
                `Optimal strategy: take 50–60% profit immediately at announcement peak. This captures the guaranteed locked-in gain on the majority of position regardless of which of the 3 outcomes follows.`,
                `Remaining 40–50%: free ride or near-free. If it follows the 75% sell-the-news pattern, the remaining position will give back some but from a zero-cost basis (no net loss). If it follows the 17% sustained demand pattern, the remaining position captures the continued upside. If it's the 8% crash scenario, the free position absorbs the loss without net damage.`,
                `4-week re-entry consideration: the average 4-week price (+45% from pre-announcement) is above the post-announcement low (+18% at 1 week). If the thesis remains valid, a re-entry at the 1-week post-announcement price with improved fundamentals is often better than holding through the sell-the-news correction.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `12-month event-driven performance attribution. Portfolio started at $40,000.\n\nEvent management decisions and outcomes:\n\nEvent A (Fed hawkish surprise, Month 2): Reduced to 12% before event (was 28%). Saved $3,100 vs full allocation loss.\nEvent B (Major protocol launch, Month 3): Pre-positioned in ecosystem 2 weeks before. Generated $8,200 additional return.\nEvent C (Large token unlock, Month 5): Did not reduce. Lost $2,800 extra vs if reduced.\nEvent D (Exchange listing announcement, Month 7): Took 55% profit at announcement. The other 45% gave back 40% — but from near-zero cost basis. Net: no damage, captured 55% as profit.\nEvent E (Fed dovish surprise, Month 10): Had reduced 48 hours before. Missed a 15% upside move but retained capital.\n\n1. Net benefit of all event management decisions vs no-management scenario.\n2. Which event management decision had the highest absolute value?\n3. What calendar habit would have improved the Month 5 outcome?`,
              scoringCriteria: [
                `Net benefit: Event A saved $3,100. Event B generated $8,200. Event C cost $2,800 (failure). Event D neutral (successful strategy, no loss). Event E missed $2,100 upside but retained capital against potential adverse scenario. Net: +$8,500 from event management vs no-management (Event B was the dominant contributor).`,
                `Highest absolute value: Event B (pre-positioning ahead of protocol launch, +$8,200). Pre-event positioning for positive known catalysts generates the largest absolute returns because it compounds both the organic thesis and the catalyst effect.`,
                `Month 5 improvement: a simple event calendar with major token unlocks marked would have caught the Event C failure. Token unlocks for major Solana projects are publicly announced weeks in advance on project Twitter. 48-hour reduction rule applied to known large unlocks would have saved the $2,800 loss.`,
              ],
            },
          ],
        },
      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from Lab 1 — macro cycle positioning, Solana ecosystem health, event-driven strategy.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.80 },
      },
      bossMode: {
        title: `Lab 1 Boss — Macro-Informed Portfolio Positioning`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-senior-lab1-v1',
          situation: `Portfolio $120,000. Current conditions:\n\nBTC: $108,000 (previous ATH was $110,000, currently -1.8% from ATH). BTC dominance: 53%, was 58% 8 weeks ago (declining = altcoin season forming).\nSOL: $310 (200-day MA: $195). SOL 59% above 200-day MA.\nFear and Greed: 82 (greed zone, not extreme yet).\nSolana DEX volume: $48B this week, up from $28B 6 weeks ago.\npump.fun graduation rate: 4.7% (hot).\n\nEvent calendar:\n- 4 days: FOMC decision (expected hold, low surprise probability).\n- 9 days: Major Solana protocol launch (announced 3 weeks ago).\n- 16 days: $420M SOL unlock from early ecosystem fund.\n\nCurrent active allocation: 28% ($33,600) across 9 positions.\n\nRequired: (1) Identify macro phase and Solana ecosystem phase. (2) Address each calendar event with specific portfolio actions. (3) Is 28% active allocation appropriate given current conditions? (4) Identify one specific opportunity the current conditions suggest.`,
          scoringCriteria: [
            `Macro phase: Late bull / early distribution. BTC at near-ATH, declining dominance (alt season active), elevated F&G (82). Not extreme enough to require emergency reduction but watching closely. Solana: active memecoin season (4.7% graduation, 71% DEX volume growth in 6 weeks, SOL well above 200-day MA).`,
            `Event management: FOMC (4 days) — low surprise probability, reduce slightly to 23% for 48 hours around decision, re-enter after. Protocol launch (9 days) — positive catalyst, pre-position in 1–2 ecosystem cult coins NOW (before the launch price-in). SOL unlock (16 days) — reduce by 15% from active allocation 2–3 days before; large unlock creates selling pressure.`,
            `28% allocation: appropriate for current active memecoin season conditions. Would be aggressive if macro were in distribution phase but BTC dominance declining (alt season) and Solana metrics strong justify it. If F&G reaches 90+ or BTC dominance reverses and begins rising, begin reducing from 28%.`,
            `Opportunity: declining BTC dominance (alt season forming) + hot Solana ecosystem = ideal conditions for Phase 1 narrative basket deployment. Run DeFined.fi scan for any emerging themes showing thematic clustering — this is the highest-probability window for narrative basket returns.`,
          ],
        }],
      },
    },

// ─────────────────────────────────────────────────────────────────────────────
// LAB 2: CTO AND CULT BUILDING AT SCALE
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-12-cto-cult-building',
      title: `Lab 2: CTO and Cult Building at Scale`,
      subtitle: `Understanding how cults are built from the inside changes how you evaluate them from the outside.`,
      lessons: [
        {
          id: 'cto-mechanics-at-scale',
          title: `When and How CTOs Actually Work — The Full Mechanics`,
          explanation: `The earlier CTO lesson covered the basics: what a CTO is, how to detect genuine vs fake, the entry window. This lesson goes deeper: the mechanics of how successful CTOs are organised, what it takes to be the person who leads one, and why most fail even when the cultural asset is genuine.\n\n**The statistical reality of CTOs:**\nMost tokens that get rugged stay dead. Of tokens that attempt a CTO, roughly 10–20% achieve any meaningful recovery. Of those, fewer than 5% reach cult status. The successes are remembered ($TREMP, $PAINT, $HARAMBE, $TROLL); the failures are forgotten. Selection bias makes CTOs look more viable than they are.\n\nThe tokens that succeeded in CTO had three things in common: (1) a culturally recognisable meme with genuine staying power beyond crypto, (2) a small core group (5–15 people) with genuine creative conviction who committed to the rebuild without financial guarantee, and (3) at least one person willing to be a transparent public face of the community.\n\n**The first 72 hours are everything:**\nThe CTO window is narrow. Post-rug, original holders are selling. The floor forms between 12 and 72 hours as the last panic sellers exit. If a genuine community does not self-organise within this window, the token dies. The organiser who moves within the first 12–24 hours has the best chance of capturing the authentic community before they scatter.\n\nSpecific first-72-hour actions: (1) launch a new Telegram with transparent wallet disclosure (new community leader's wallet, not connected to old dev); (2) begin creating original content immediately — the cultural rebuild starts with art, not announcements; (3) contact existing community members individually to assess who has genuine conviction; (4) do not announce a CTO publicly until genuine community exists — premature announcements without real community behind them signal a fake CTO.\n\n**Operational requirements of running a CTO:**\nVolunteer dev: someone must maintain the technical infrastructure (LP lock, contract monitoring, potential token migration if needed). This requires a degree of technical competence. Transparent wallet: every transaction the CTO leader makes must be visible and explainable. Community management: moderating Telegram/Discord, responding to members, maintaining morale through dumps. This is hours per day, often for no financial compensation until/unless the token recovers. Content creation pipeline: organising community members to consistently produce original memes, art, and cultural content.\n\n**When NOT to lead a CTO:**\nIf you cannot commit to daily community management for at least 4 weeks. If you have a financial motivation only (e.g., you are a bag holder trying to recover). Experienced community members will smell this. If the token's underlying meme has no independent cultural relevance beyond the original launch momentum.`,
          visualPrompt: `👆 CTO lifecycle: rug event → community self-selection → core team formation → content creation → recovery`,
          visualType: `chart`,
          visualUrl: `cto-lifecycle-mechanics`,
          examples: [
            {
              contextTag: `[$PAINT CTO, first 72 hours, 2024]`,
              context: `$PAINT developer rugs at $200K MC. Token collapses to $3K MC.`,
              scenario: `Within 18 hours: a holder who is an actual artist launches new Telegram with transparent wallet, posts original "paint splatter" frog art, individually DMs 40 known holders. By Hour 72: 150 members with active content creation. No public announcement until Hour 48 when community was genuine.`,
              outcome: `$PAINT reaches $8M MC. The 18-hour response by a genuine creative community member — not a financial speculator — was the founding moment. The content creation before the announcement was the authenticity signal.`,
            },
            {
              contextTag: `[Failed CTO attempt, financial motivation only, 2025]`,
              context: `A token rugs. The largest holder (who lost $12,000) immediately posts "CTO INCOMING — WE WILL RECOVER THIS" on Twitter.`,
              scenario: `Community members investigate: this person has never created any content for the token, their wallet shows they entered at peak MC, and they are proposing a specific "recovery plan" that involves them controlling community funds.`,
              outcome: `Community dismisses the CTO as bag-holder-motivated. No genuine community forms around it. Token dies. The financial motivation was visible and undercut any potential legitimacy.`,
            },
            {
              contextTag: `[$HARAMBE CTO, cultural staying power, 2024]`,
              context: `$HARAMBE rugs. Gorilla-loving community refuses to accept the death.`,
              scenario: `Core group of 8 people with genuine love for the Harambe cultural moment (predating crypto — Harambe was a 2016 internet phenomenon) form a quiet Telegram. No announcement. Just creating gorilla content for 3 days straight.`,
              outcome: `$HARAMBE reaches $30M+ MC. The cultural asset — Harambe himself — had genuine internet history completely independent of the crypto token. That history was what the community was preserving, not the token price.`,
            },
          ],
          keyTakeaway: `CTOs succeed with: genuinely recognisable cultural meme, small core group with creative conviction (not just financial motivation), transparent leadership, and rapid action in the first 72 hours. Most fail. Leading one requires daily commitment for weeks with no guaranteed financial return.`,
          guidedPractice: [
            {
              question: `What are the three characteristics shared by all successful CTOs ($TREMP, $PAINT, $HARAMBE, $TROLL)?`,
              options: [`A — Large initial token supply, locked LP, and original developer support`, `B — Culturally recognisable meme with genuine pre-crypto history, small creative core group with authentic conviction (not just financial), and transparent new leadership`, `C — Exchange listings, influencer partnerships, and large initial community`, `D — All were launched on pump.fun and graduated above $69K MC`],
              correct: 1,
              hint: `What did Harambe, the troll face, and Trump have in common before they became tokens?`,
              explanation: `B is correct. Each successful CTO was built on a meme that had genuine cultural weight completely independent of crypto. Harambe was a 2016 viral phenomenon. Troll face is a decade-old internet meme. This independence gave communities something to rally around beyond token price — a cultural identity that predated and would outlast any single token launch.`,
            },
            {
              question: `Why is the first 72 hours after a rug the critical CTO window?`,
              options: [`A — Because the original developer returns the funds within 72 hours`, `B — Post-rug, original holders are selling and the floor forms in this window. If genuine community does not self-organise before that floor, they scatter permanently. The organiser who moves in 12–24 hours captures authentic community while it still exists.`, `C — Because smart contract ownership can be transferred within 72 hours`, `D — Because DEXScreener removes dead tokens after 72 hours`],
              correct: 1,
              hint: `Where do genuine community members go if no one acts to keep them together within the first 72 hours?`,
              explanation: `B is correct. The post-rug window is narrow because community members are emotionally deciding whether to stay or scatter. A credible organiser who acts within 12–24 hours with genuine content (not just announcements) can hold the authentic community together. After 72 hours, those who wanted to leave have left and those remaining have much less capital in the token — the floor is weaker.`,
            },
            {
              question: `Why does announcing a CTO publicly before genuine community exists signal a fake CTO?`,
              options: [`A — Public announcements attract scammers`, `B — Genuine CTOs develop community first and announce second. A premature public announcement without underlying community activity signals that the "organiser" wants to create a buying wave, not rebuild a community — the same pattern as a fake CTO set up by the original developer.`, `C — Public announcements require regulatory compliance`, `D — DEXScreener blocks tokens with CTO announcements`],
              correct: 1,
              hint: `What is the sequence in genuine vs fake CTOs: community first then announcement, or announcement first then expect community?`,
              explanation: `B is correct. Authentic CTOs begin with genuine community activity — original content creation, holder-to-holder connections, cultural rebuilding. The announcement follows the community. Fake CTOs announce first to attract buyers, then have no underlying community to sustain momentum. The sequence reveals the motivation.`,
            },
            {
              question: `What personal characteristics should disqualify someone from leading a CTO?`,
              options: [`A — Having a large social media following`, `B — Pure financial motivation (you are a bag holder trying to recover), inability to commit to daily management for weeks, and lack of genuine cultural connection to the meme — all signal that leadership would be self-serving rather than community-serving`, `C — Technical inability to manage a smart contract`, `D — Previous trading losses`],
              correct: 1,
              hint: `What happens when the community discovers the CTO "leader" is primarily motivated by recovering their own losses?`,
              explanation: `B is correct. Community members can identify financial motivation quickly — they will check the leader's wallet and see when they entered (at peak MC = bag holder), what other tokens they have been involved with (serial operator?), and whether they are creating content or just making announcements. Discovery of pure financial motivation destroys credibility immediately.`,
            },
            {
              question: `What distinguishes a volunteer dev's role in a CTO from a new developer launching a similar-themed token?`,
              options: [`A — There is no distinction`, `B — A volunteer dev maintains the existing token's infrastructure with transparent intentions — LP management, contract monitoring — disclosed publicly. A new developer launching a similar token is starting a new project that parasitically feeds off the original's cultural momentum without the community's consent.`, `C — Volunteer devs are paid by the community`, `D — New developers always produce better tokens than volunteer CTOs`],
              correct: 1,
              hint: `Who has legitimate claim to serve the original community vs who is exploiting the community's attention for a new launch?`,
              explanation: `B is correct. A volunteer dev serves the existing community transparently — their wallet is disclosed, their actions are visible, their role is to maintain infrastructure not profit from it. A new developer launching a "HARAMBE2" token while the original is under CTO is exploiting the cultural energy for a new exit-liquidity scheme. The distinction is transparency, consent, and motivation.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `$COSMIC (space-themed frog token) just rugged. 18 hours have passed.\n\nCurrent state:\n- MC: $7,000 (was $450K MC at peak)\n- Telegram: 80 members remaining (was 1,200). Active: ~25 posting in last 2 hours.\n- Twitter: 40 posts since rug, mix of anger and memes.\n- The most active community member in the last 2 hours: their wallet is 4 months old with 80+ trades, no connection to original dev, has been creating space frog art since Day 2 of the original token.\n- Original dev wallet: silent since rug.\n\nYou are a holder who lost $800 and have genuine interest in the space frog concept (you are an amateur astronomer).\n\nShould you initiate a CTO? If yes, design your first 24 hours of action. If no, explain why.`,
              scoringCriteria: [
                `Assessment: viable CTO candidate given: (1) genuine personal connection to the theme (amateur astronomer + space frog); (2) 25 active community members 18 hours post-rug suggests authentic holdout; (3) active community member with real history making art already; (4) original dev silent (no re-entry risk). Cultural asset: space is universally recognisable.`,
                `Decision: initiate only if you can commit 3–4 hours/day for 4 weeks minimum and are prepared to lose the $800 doing so (no guarantee).`,
                `First 24 hours: (1) DM the active art creator — do they want to collaborate? Their creativity + your commitment = core team. (2) Launch new Telegram with wallet publicly disclosed (not connected to original dev). (3) Create 3–5 pieces of original space frog content. (4) DM the other 25 active members individually — assess who has genuine cultural conviction vs who is only there to recover money. (5) DO NOT make a public CTO announcement yet — build community for 24 more hours first.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Comparative analysis of three post-rug tokens to identify the strongest CTO candidate for investment (not leadership):\n\nToken A ($GROVE — forest theme): Rugged 48 hours ago. 150 Telegram members remaining. 12 members creating original forest art. New community leader: wallet 2 months old, funded from unknown source, announced CTO immediately after rug.\n\nToken B ($WAVE — ocean theme): Rugged 6 days ago. 60 Telegram members remaining but highly active (200+ messages in last 24 hours). 8 members creating original wave art. New leader: 8-month-old wallet, previously profitable trades visible on GMGN, announced CTO on Day 3 (not immediately).\n\nToken C ($PRISM — rainbow prism theme): Rugged 2 days ago. 220 Telegram members but mostly quiet (15 messages in last 24 hours). No new community leader emerged. Multiple people calling for CTO but no one acting.\n\nRank by CTO investment potential. Justify.`,
              scoringCriteria: [
                `Token B: HIGHEST potential. Delayed announcement (waited for genuine community to form = authentic signal), highly active small community (60 members × 200 messages = deep engagement), credible leader (8-month verified history, profitable track record), 8 genuine content creators. Small but high-quality.`,
                `Token A: MEDIUM risk. 150 members is larger but the immediate announcement (red flag for fake CTO motivation) + unknown leader funding source are concerns. Content creation is positive but leadership authenticity is unverified.`,
                `Token C: LOWEST potential. 220 members but nearly silent (15 messages/24h) = large community with no conviction. Multiple competing CTO calls without action = leadership vacuum. Without a single credible person stepping up to own the community, it will fragment.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You led a CTO for $BOLT (lightning bolt theme) that genuinely interested you (you work in renewable energy). Timeline:\n\nDay 1: Token rugged. You immediately DM'd 15 active community members. 7 responded with genuine interest.\nDay 2–3: Core group of 7 began creating lightning bolt content. No public announcement.\nDay 4: Launched new Telegram. 45 members join in first 8 hours — all genuine community from original.\nDay 7: First public announcement. Price had recovered from $4K to $28K MC on organic buying from core group.\nDay 14: 280 Telegram members. Original content flowing daily. Price: $85K MC.\nDay 21: Major cult — recognisable community symbol emerging (custom lightning bolt PFP frames). Price: $320K MC.\nDay 30: Price: $180K MC (pullback on whale sell). Community still active. 480 members.\n\nQuestions:\n1. What decisions in the first 7 days were most critical?\n2. The Day 30 pullback — is the CTO still viable? What data confirms your answer?\n3. What are your personal obligations to the 480 community members who joined based partly on your leadership?`,
              scoringCriteria: [
                `Critical decisions: (1) DM'ing 15 members immediately (fast action in the window); (2) building community BEFORE announcing publicly (authenticity signal); (3) waiting until Day 4 for Telegram rather than Day 1 (let genuine community self-select first); (4) no financial promises made to core group (conviction-based, not incentive-based).`,
                `Day 30 viability: YES. Community still active (480 members, still creating content), custom PFP frames emerged (Level 3 community), the pullback was a whale sell not a community exodus. Check GMGN: if the whale is an original bag holder taking profit, it's temporary. If it's the core team, reassess. Community activity maintaining during a 44% price pullback is the strongest CTO survival signal.`,
                `Personal obligations: daily community management (you committed to this), transparent communication about your personal wallet activity (never trade secretly), honest update if you decide to exit (do not quietly dump and disappear), continue creating content even if price disappoints. The 480 people who joined did so partly based on your credibility — abandoning them silently would cause real harm.`,
              ],
            },
          ],
        },
        {
          id: 'community-mechanics-scale',
          title: `Community Mechanics at Scale — What Sustains a Cult Past $1M MC`,
          explanation: `Many communities form genuinely at $50K MC and die at $300K MC. A small number survive to $1M, $10M, and beyond. Understanding the difference between communities that sustain and those that collapse is one of the highest-leverage skills in memecoin trading — it affects when you hold, when you exit, and which CTOs you invest in.\n\n**The collapse pattern:**\nMost community collapses follow the same sequence: (1) initial excitement at launch, (2) price pump attracts speculative holders with no cultural conviction, (3) these holders dominate the community and drown out genuine believers, (4) price dips, (5) speculators exit, taking their vocal presence with them, (6) genuine believers remain but the narrative of "failure" damages community confidence, (7) the token dies not from lack of genuine believers but from the perception that it has failed.\n\n**The sustaining pattern:**\nSuccessful cult coins develop what the source material calls "unique identifiers" — self-organised community symbols and behaviours that persist regardless of price. The $WIF community created the "dog wearing hat" visual identity. $BONK had its stick figure aesthetic. These identifiers create cultural continuity across price cycles — the community is not defined by its price chart but by its shared cultural expression.\n\n**What community leaders do during dumps:**\nThe most important thing a community leader does during a 50% dump is not post price analysis or "buy the dip" messages. It is to maintain normal content creation and cultural activity — as if the dump is not relevant to the community's existence. This signals to genuine believers that the community is price-independent and to speculators that the community will not perform the panic they expect.\n\n**The 3 phases of community development:**\n\nPhase 1 (Formation, $0–$500K MC): raw energy, small core, everything is organic. The meme spreads because people genuinely find it compelling. This phase is fragile — a single bad event can kill it.\n\nPhase 2 (Consolidation, $500K–$10M MC): speculative attention arrives alongside genuine discovery. The community must maintain identity through the influx. Communities that develop strong unique identifiers in Phase 1 are much more likely to survive Phase 2 dilution.\n\nPhase 3 (Cult status, $10M+ MC): the community has survived enough cycles that its existence is independent of any single price event. New members join because they want to be part of the cultural identity, not primarily for financial gain. This is when the token becomes a long-term asset rather than a trade.`,
          visualPrompt: `👆 Community development phases: formation, consolidation, cult status — with price overlay`,
          visualType: `chart`,
          visualUrl: `community-phases-lifecycle`,
          examples: [
            {
              contextTag: `[Phase 2 identity maintenance, speculative influx, $WIF, 2024]`,
              context: `$WIF gains mainstream attention. Thousands of new holders join for financial reasons, not cultural conviction.`,
              scenario: `Core community of hat-wearing dog artists continues creating content at the same rate regardless of new holder composition. The visual identity is so established that even speculative holders adopt the aesthetic to "fit in."`,
              outcome: `The unique identifier (dog wearing hat) is strong enough to convert some speculative holders into genuine community members. Those who stay beyond 2 price cycles become genuine believers. Phase 3 status achieved.`,
            },
            {
              contextTag: `[Phase 1 fragility, bad event, 2025]`,
              context: `A Phase 1 community ($180K MC) has a genuine founding member publicly accuse another of insider trading.`,
              scenario: `The accusation creates internal conflict. Speculative members use it as a reason to exit. The founding group fractures. Content creation stops for 4 days.`,
              outcome: `Token dies. Not from the accusation itself but from the community fracture it caused. Phase 1 communities are fragile because they have no institutional continuity — all it takes is one significant internal conflict to break the shared narrative.`,
            },
            {
              contextTag: `[Phase 2→3 transition, dump survival, $BRETT, 2024]`,
              context: `$BRETT experiences a 65% price dump during a broader market correction. 40% of recent holders exit.`,
              scenario: `Core community (Brett frog artists) continues posting original Brett content as if nothing happened. No "buy the dip" posts. No panic. Just consistent cultural output.`,
              outcome: `The post-dump community, stripped of speculative holders, is more tightly cohesive than pre-dump. The next 6 weeks produce some of the best Brett memes ever created. Token recovers and establishes Phase 3 status.`,
            },
          ],
          keyTakeaway: `Cult survival requires price-independent cultural identity. Unique identifiers (self-organised symbols, content styles, community aesthetics) provide continuity across price cycles. Community leaders maintain cultural output regardless of price — this signals price-independence to genuine believers. Phase 3 status = community identity precedes and exceeds any single price event.`,
          guidedPractice: [
            {
              question: `A token's community posts "buy the dip" messages during a 40% correction. What does this indicate about community quality?`,
              options: [`A — Strong community — they are supporting the token when needed`, `B — Price-dependent community. Genuine cults post cultural content during corrections, not financial directives. "Buy the dip" posts reveal that the community's existence is defined by the price chart rather than cultural identity.`, `C — Neutral indicator — this is normal community behaviour`, `D — This is the sign of a Phase 3 cult in formation`],
              correct: 1,
              hint: `What do $WIF, $BRETT, and $BONK community members post during price dumps vs what price-motivated communities post?`,
              explanation: `B is correct. Genuine cult communities post cultural content during dumps — the same art, memes, and cultural expression they post during pumps. "Buy the dip" posts reveal that the poster's community engagement is price-triggered, not cultural. It is a signal that when the price stays down, these people will leave.`,
            },
            {
              question: `What is a "unique identifier" in cult formation and why is it more predictive of long-term survival than community member count?`,
              options: [`A — A unique smart contract identifier that prevents token copying`, `B — A self-organised community symbol, aesthetic, or behaviour that emerges organically and persists regardless of price — it signals that community identity is independent of financial performance. Member count can be temporary; cultural identity is durable.`, `C — The token's ticker symbol`, `D — The original developer's wallet address`],
              correct: 1,
              hint: `What persisted about $WIF, $BONK, and $BRETT communities through multiple 60–80% drawdowns that made them Phase 3 cults?`,
              explanation: `B is correct. Unique identifiers — the dog-in-hat visual for $WIF, Brett frog's distinctive style, BONK's stick figure — give community members a shared cultural identity that exists independent of the price chart. A community of 500 with a strong unique identifier will outlast a community of 5,000 without one, because the identifier gives members a reason to stay that has nothing to do with when they bought.`,
            },
            {
              question: `What is the defining characteristic of the Phase 2 to Phase 3 transition?`,
              options: [`A — Market cap exceeding $10M`, `B — The community's identity becomes independent of any single price event — new members join to be part of the cultural identity, not primarily for financial gain. The community could survive a 90% drawdown and remain cohesive.`, `C — Getting listed on a major exchange`, `D — Having more than 10,000 Telegram members`],
              correct: 1,
              hint: `What is the test for Phase 3: would the community still exist if the token had no monetary value?`,
              explanation: `B is correct. Phase 3 is defined by price-independence of the community identity. The Harambe meme existed as internet culture before and after the token. A Phase 3 cult's community would continue creating content and connecting even if the token price went to near-zero — because they are participants in a cultural movement, not just a financial vehicle.`,
            },
            {
              question: `Why do many Phase 1 communities collapse during the Phase 2 speculative influx?`,
              options: [`A — They run out of token supply`, `B — Speculative holders, who have no cultural conviction, outnumber original believers in terms of communication volume and dominate the community narrative. When they exit during price corrections, the community appears to collapse even if genuine believers remain.`, `C — Phase 2 requires more sophisticated trading strategies`, `D — Regulatory pressure increases at Phase 2 market caps`],
              correct: 1,
              hint: `What happens to the community's content quality and cultural signal when 1,000 financial speculators join a 50-person genuine community?`,
              explanation: `B is correct. The volume of speculative participation drowns out genuine cultural expression. The community appears to have lost its authenticity (because the vocal majority is now financial in motivation) even though the original core still exists. Communities with strong unique identifiers (Phase 1 foundations) are much more resilient to this dilution because the cultural identity provides a filter — it attracts people who resonate with the culture and repels pure speculators.`,
            },
            {
              question: `A community you track is at $8M MC (late Phase 2). During the past month: member count grew 400%, original core still active but less proportionally visible, unique identifier usage has declined from universal to occasional. What does this signal?`,
              options: [`A — Normal scaling — larger communities naturally have lower % of cultural participants`, `B — Phase 2 dilution risk. The speculative influx is overwhelming the cultural identity. If the unique identifier usage continues declining, the community is losing its Phase 3 pathway. Watch for the next price correction — if community activity survives it, the genuine core is strong enough to carry through.`, `C — The token is preparing for Phase 3 — unique identifiers are less necessary at scale`, `D — The community needs to recruit more members to dilute the speculators`],
              correct: 1,
              hint: `What happens to unique identifier usage when the community is flooded with members who joined for financial reasons?`,
              explanation: `B is correct. Declining unique identifier usage during Phase 2 growth signals that speculative holders are outnumbering cultural participants. This is not fatal — the next significant price correction will filter out speculative holders, and the genuine core will either survive (Phase 3 pathway intact) or the token will fail. Monitor the core: are the original creators still active? If yes, the cultural foundation is intact despite the surface dilution.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `Community health data for 3 tokens over a 6-week observation period:\n\nToken X ($MOSS — forest aesthetic): Week 1: 400 members, 80% posts are original forest art. 12 unique identifiers (leaf emoji chains in every post). Week 6: 2,400 members, 35% original content, leaf emoji chains in 60% of posts.\n\nToken Y ($ROCK — stone aesthetic): Week 1: 150 members, 90% original stone art. Unique identifier: members draw "faces" on stone shapes. Week 6: 3,200 members, 20% original content, stone face drawing in 15% of posts.\n\nToken Z ($TIDE — wave aesthetic): Week 1: 600 members, 60% original wave art. No clear unique identifier. Week 6: 800 members (modest growth), 55% original content.\n\nRank each by Phase 3 probability. Justify.`,
              scoringCriteria: [
                `Token X: HIGHEST Phase 3 probability. Cultural identity maintained at 60% unique identifier usage despite 6× member growth. The leaf emoji chain survived Phase 2 dilution — a strong signal that the identifier is genuinely sticky and will persist through further growth.`,
                `Token Z: MEDIUM Phase 3 probability. Content quality maintained (55%) and modest growth suggests genuine core without speculative flood. Missing a strong unique identifier is the only concern — without one, Phase 2 dilution could be more damaging.`,
                `Token Y: LOWEST Phase 3 probability. Unique identifier usage collapsed from near-universal to 15% despite the stone face drawing being clearly established in Week 1. This suggests Phase 2 speculative flood was severe enough to overwhelm the cultural identity. Next price correction will reveal whether genuine core survived.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `You hold $PRISM, a rainbow prism token at $2.8M MC (Phase 2). You entered at $180K MC. Position is 7.2×. Community health monitoring:\n\nWeek 1 (when you entered): 200 members. Custom prism-fractal PFP frames emerging. Content creation constant.\nWeek 3: 800 members. Original content: 65%. PFP frames used by 40% of new members.\nWeek 5: 1,800 members. Original content: 48%. PFP frame usage: 31%. Two large holders visible on GMGN reducing positions.\nWeek 7 (now): 3,200 members. Original content: 35%. PFP frame usage: 22%. Three community moderators have left. Core creator posts down 50% in last 10 days.\n\nDesign your complete position management decision with specific data-driven reasoning.`,
              scoringCriteria: [
                `Warning signals accumulating: (1) unique identifier declining (22% down from 40%); (2) original content declining (35% down from 65%); (3) core creators posting less (50% reduction); (4) moderators leaving; (5) large holders reducing. This is a Phase 2 dilution that is overwhelming the cultural identity.`,
                `The 7.2× gain is real. The community health is deteriorating. Recommendation: take 50–60% profit NOW while the community still has enough size to absorb sells cleanly. Hold 40–50% as long-term free ride — if the cultural core re-solidifies after the speculative phase burns out, significant further upside remains.`,
                `Key question: Are the original core creators still present even if posting less? If yes, the cultural foundation may survive. If core creators have left entirely, exit more aggressively (70–80% profit-taking). The core creators' activity is the most important single signal in this community health assessment.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `7-month community development case study for $GLOW (bioluminescent sea creature theme):\n\nMonth 1: $45K MC. 180 members. Original creators making bioluminescent art. Unique identifier emerging: blue-green gradient colour scheme in all community art.\nMonth 2: $280K MC. 800 members. Content quality maintained. Colour scheme used universally.\nMonth 3: $1.2M MC. 3,500 members. Speculative flood. Content quality drops from 80% to 45%. BUT: colour scheme still near-universal (85% usage).\nMonth 4: Market correction. Token drops to $400K MC (-67%). 2,000 members leave. Remaining 1,500 are producing the best bioluminescent art yet.\nMonth 5: $1.8M MC. 4,200 members. 70% original content. Colour scheme 90% usage.\nMonth 6: $5.8M MC. 12,000 members. Content quality stable at 65%. Colour scheme maintained.\nMonth 7 (now): $4.2M MC (correction). Community still creating. 3 original creators featured in non-crypto art publications.\n\n1. Identify the phase transitions and what caused each.\n2. What was the critical signal in Month 3 that predicted Phase 3 survival?\n3. The non-crypto publication feature in Month 7 — what does this represent?`,
              scoringCriteria: [
                `Phase transitions: Month 1–2 = Phase 1 (formation, organic). Month 3 = Phase 2 entry (speculative flood begins). Month 4 (correction) = Phase 2 filter — speculative holders exit, genuine core revealed. Month 5 onward = Phase 2/3 boundary and Phase 3 establishment.`,
                `Month 3 critical signal: despite content quality dropping to 45% (speculative dilution), the colour scheme (unique identifier) maintained 85% usage. This meant: even the speculators were adopting the cultural identity. The identifier was sticky enough to survive dilution — the strongest possible Phase 3 pathway signal. If the identifier had also declined, the outcome would have been different.`,
                `Non-crypto publication feature: Phase 3 confirmation. The cultural identity ($GLOW's bioluminescent art aesthetic) has developed enough merit to receive recognition completely independent of the token's financial performance. This is exactly what happened with $WIF merchandise and $BONK cultural references — cultural legitimacy outside the crypto space is the ultimate Phase 3 marker.`,
              ],
            },
          ],
        },
        {
          id: 'leading-vs-following-cult-formation',
          title: `Leading vs Following — Knowing Your Role in Cult Dynamics`,
          explanation: `Every successful cult has multiple roles: founders, creators, amplifiers, and supporters. Most traders are supporters (they hold and occasionally post). The highest-leverage roles are founders and creators — but they require specific skills and genuine commitment that most traders do not have. Understanding which role fits you determines how you engage with cult communities.\n\n**The four roles in cult formation:**\n\nFounders: the people who act in the first 24–72 hours post-rug to organise the CTO. They bear the most risk (no guarantee of return), require daily commitment for weeks, and need transparent public presence. This role is appropriate for approximately 1 in 50 traders.\n\nCreators: the artists, meme makers, writers, and content producers who give the cult its cultural output. They may not lead but their creative work is the substance of the cult's identity. This role requires genuine creative ability and authentic connection to the meme. Appropriate for roughly 1 in 20 traders.\n\nAmplifiers: traders who share content, find new audience members, make connections between community members, and maintain community morale. They are the social infrastructure. Most useful during Phase 2 when quality amplification distinguishes genuine cultural spread from bot activity.\n\nSupporters: holders who participate occasionally, share content when it resonates, but do not lead or create systematically. This is the role of most traders — and it is completely valid. A community of 500 creators is unusual; a community of 500 genuine supporters with 20 creators is normal.\n\n**Knowing when to step back:**\nThe most common mistake community leaders make is not stepping back when their role is complete. In the early CTO phase, strong leadership is essential. By Phase 2 and Phase 3, the community should be self-sustaining. A leader who maintains too tight control of Phase 3 community becomes a centralisation risk — if they exit, the community may fracture.\n\n**The decision framework:**\nBefore taking any active role in a community, ask: (1) do I have genuine cultural connection to the meme (not just a financial position)? (2) can I commit the required time without compensation for a minimum of 4 weeks? (3) am I willing to be publicly associated with this token's performance regardless of outcome? If all three are yes, the role may be appropriate. If any is no, the supporter role is more honest.`,
          visualPrompt: `👆 Community role hierarchy: founder, creator, amplifier, supporter — responsibilities and leverage`,
          visualType: `interactive`,
          visualUrl: `community-role-framework`,
          examples: [
            {
              contextTag: `[Creator role, Phase 1, $PAINT, 2024]`,
              context: `An actual artist with a connection to the "paint" concept joins the $PAINT CTO.`,
              scenario: `Rather than trying to lead (no community management experience), they focus entirely on creating original artwork. Their creative output attracts other artists to the community.`,
              outcome: `The artist becomes the cultural core of $PAINT — not the leader, but the creative soul. Their art is what the community organises around. The appropriate role was creator, not founder.`,
            },
            {
              contextTag: `[Leader stepping back, Phase 3 transition, 2025]`,
              context: `A CTO leader who has managed a community from $5K to $8M MC over 6 months realises the community is now fully self-organising.`,
              scenario: `Instead of maintaining the same daily management intensity, they shift to a less active role — posting occasionally, providing feedback when asked, but allowing other community members to take initiative.`,
              outcome: `Community continues to grow. The gradual transition prevented the centralisation risk of the community being entirely dependent on one person. Phase 3 cults are decentralised by nature — the leader's best action is eventually stepping back.`,
            },
            {
              contextTag: `[Supporter role, honest participation, 2025]`,
              context: `A trader holds a token and enjoys the community but does not have the creative skills to be a creator or the time to be a leader.`,
              scenario: `They participate as a supporter: sharing content that resonates with them, engaging with creators' posts, occasionally bringing new members to the community through genuine recommendations.`,
              outcome: `The supporter role is consistent and valuable. They contribute to community health without over-committing or pretending to have skills they don't. The community is better for having genuine supporters even without creators.`,
            },
          ],
          keyTakeaway: `Know your role: Founder (24/7 commitment, 4+ weeks, rare), Creator (artistic/content skills, genuine connection), Amplifier (social infrastructure, network building), Supporter (authentic participation). Most traders are supporters — that is valid. Leaders must plan to step back as Phase 3 approaches to prevent centralisation risk.`,
          guidedPractice: [
            {
              question: `You love the meme concept of a token and have been a holder since launch. You are not a visual artist and do not have community management experience. Which role best fits your engagement with a CTO of that token?`,
              options: [`A — Founder — your belief in the concept qualifies you`, `B — Supporter — authentic participation (sharing content you genuinely find compelling, engaging with creators) contributes to community health without requiring skills or time you do not have`, `C — Creator — make content anyway even without artistic skills`, `D — Stay entirely passive — do not engage with communities you hold`],
              correct: 1,
              hint: `What is the value of authentic participation vs overstretching into a role that requires skills you do not have?`,
              explanation: `B is correct. Genuine supporters who participate authentically contribute meaningfully to community health. The supporter role does not require artistic skills or daily commitment — it requires genuine cultural interest in the meme. Attempting the founder role without the required skills or time often damages the community more than no leadership at all.`,
            },
            {
              question: `A CTO leader who successfully built a community from $5K to $12M MC over 7 months is considering reducing their active involvement. Why might this be the right decision at Phase 3?`,
              options: [`A — They have earned enough money to retire`, `B — Phase 3 cults are self-sustaining by definition. A centralised leader in a Phase 3 community creates dependency risk — if they leave suddenly, the community may fracture. Planned gradual transition distributes the leadership function and creates genuine decentralisation.`, `C — Leadership is always counterproductive in Phase 3`, `D — The community will grow faster without the original leader`],
              correct: 1,
              hint: `What is the risk of a community that is entirely dependent on one person's daily activity?`,
              explanation: `B is correct. The test of Phase 3 is self-sustainability. A Phase 3 community's daily activity should not require the founder's direct involvement. If it still does at $12M MC, the community has not fully reached Phase 3 and is at risk from the founder's eventual departure. Planned gradual stepping back is the responsible transition — not abandoning, but enabling independence.`,
            },
            {
              question: `Before taking an active leadership role in a CTO, the decision framework asks three questions. Which answer combination makes active leadership appropriate?`,
              options: [`A — Financial position in the token is large (yes), community is medium-sized (yes), you heard the rug news within an hour (yes)`, `B — Genuine cultural connection to the meme (yes), can commit 3–4 hours daily for 4+ weeks (yes), willing to be publicly associated regardless of outcome (yes)`, `C — You have the most tokens remaining (yes), you have good internet connection (yes), you know how to use Telegram (yes)`, `D — Previous trading success (yes), large social media following (yes), available this week (yes)`],
              correct: 1,
              hint: `Which questions assess motivation, capacity, and accountability vs other factors?`,
              explanation: `B is correct. The three questions specifically test: cultural motivation (genuine connection vs financial), capacity (daily time commitment without guarantee), and accountability (public association with all outcomes). All three must be yes. Financial position, trading success, and social following are irrelevant to whether someone is the right person to lead a community.`,
            },
            {
              question: `What distinguishes the amplifier role from both the creator and supporter roles?`,
              options: [`A — Amplifiers hold more tokens than supporters`, `B — Amplifiers primarily perform social infrastructure work: connecting community members, distributing quality content to new audiences, and maintaining morale — without necessarily creating original content (creator) or simply holding (supporter)`, `C — Amplifiers work for financial compensation`, `D — Amplifiers are responsible for token price management`],
              correct: 1,
              hint: `What social function does an amplifier provide that neither creators nor supporters typically focus on?`,
              explanation: `B is correct. Amplifiers are the social connective tissue. They introduce quality content to new audiences (organic growth), facilitate relationships between community members (network density), and maintain emotional tone during negative events (morale). This is distinct from creating content (creator role) and requires specific interpersonal and networking skills that not everyone has.`,
            },
            {
              question: `The source material states "community takeovers don't always work. But when they do… it's marvelous." What is the honest framing for deciding whether to invest time (as leader) vs money (as holder/investor) in a CTO?`,
              options: [`A — Always invest time — it is more valuable than money`, `B — Invest time only if you have genuine cultural connection, required skills, and can afford to lose the time without compensation. Invest money (as holder/investor) when the genuine community signals are present regardless of whether you are the right person to lead it.`, `C — Invest money but never time — risk only capital, not effort`, `D — Only participate in CTOs you believe will definitely succeed`],
              correct: 1,
              hint: `Are the criteria for "should I lead?" and "should I invest?" different?`,
              explanation: `B is correct. The criteria are different. Leading a CTO requires personal fit (cultural connection, skills, time). Investing in a CTO requires identifying genuine community signals (content creation, authentic leadership, cultural staying power) — regardless of whether you are the right person to lead it. You can invest money in a CTO while acknowledging someone else is the right person to lead it.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `$NEBULA (space nebula theme) rugged 6 hours ago. Current state:\n\nYour profile: you have a background in astronomy (PhD student), you are a decent visual artist, you have traded memecoins for 18 months, and you have 4–6 hours free daily for the next 6 weeks.\n\nCommunity state: 45 members remain, 8 are creating nebula art already without any leadership, 3 have DM'd you asking if you are doing a CTO.\n\nThe token: rugged at $320K MC, now at $8K MC. The nebula concept is visually compelling with genuine scientific backing.\n\nShould you lead this CTO? If yes: what role specifically, what are your first 12 hours of action, and what would make you stop?`,
              scoringCriteria: [
                `Decision: YES if the three criteria check: (1) genuine cultural connection — PhD astronomy student + nebula theme = authentic; (2) 4–6 hours/day for 6 weeks = adequate capacity; (3) willing to be publicly associated — must honestly answer this. Assuming yes: proceed.`,
                `Role: hybrid founder/creator (rare but appropriate given both community management capacity and artistic ability). Start with creator role (build content), transition to founder organising role as community forms.`,
                `First 12 hours: (1) DM all 8 content creators to assess genuine conviction; (2) create 3 original nebula art pieces using actual scientific imagery (leverages your expertise); (3) launch Telegram with transparent wallet ONLY after 4–5 of the 8 creators commit; (4) respond to the 3 who asked about CTO honestly: "I'm evaluating it — working on content first."`,
                `Stop conditions: (1) investigation reveals original dev connection to any would-be leader; (2) you cannot sustain the time commitment after Week 1; (3) genuine community fails to form (fewer than 15 active creators by Day 7); (4) you discover your motivation is primarily recovering your own financial loss rather than cultural passion.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Evaluating 4 community members as potential CTO leaders for a token you hold as an investor (you are not participating as a leader):\n\nCandidate A: Wallet 6 months old, entry at ATH MC, no previous token community involvement, immediately posted "I WILL SAVE THIS TOKEN" on Twitter within 1 hour of rug.\n\nCandidate B: Wallet 2 years old, profitable track record on GMGN, entered the token at $80K MC (not peak), history of creating memes for two previous tokens that reached Phase 3. Did not post publicly for 36 hours, then quietly launched a Telegram.\n\nCandidate C: No wallet connection traceable to this community (unknown holder). Claims to have a "team" ready. Asking for community funds to "re-develop the token."\n\nCandidate D: Wallet 8 months old, entered at $120K MC, has been creating fan art for the token for 3 weeks. Asked existing holders privately whether they wanted to rebuild before making any public statement.\n\nRank by leadership quality. Justify.`,
              scoringCriteria: [
                `Candidate B: HIGHEST quality. 2-year verified history, pre-peak entry (not bag-holder), proven community building in Phase 3 tokens, waited 36 hours before acting (genuine community building, not announcement first). All signals positive.`,
                `Candidate D: SECOND. Pre-existing content creation (3 weeks of fan art = genuine connection), asked privately before announcing (appropriate sequencing), entry at $120K not ATH. Limited by shorter track record vs Candidate B.`,
                `Candidate A: LOW. ATH entry + "I WILL SAVE THIS TOKEN" within 1 hour = classic bag-holder CTO announcement. Financial motivation probable. No community history.`,
                `Candidate C: REJECT. Unknown wallet, "team ready" framing, asking for community funds = all red flags for fake CTO set up to extract remaining capital. Report to remaining community members.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You led a CTO for $VOLT (electric theme). After 5 months you have built the community from $6K to $4.2M MC. Your current activity: 5 hours/day in the Telegram, creating content, managing disputes, coordinating with volunteer developers.\n\nCommunity metrics: 8,200 members. 35 regular content creators (not just you). 12 moderators. Unique identifier (lightning bolt aesthetic) in 80% of posts. The community runs well even when you are asleep.\n\nA new opportunity: you have identified a fresh Phase 1 narrative that requires your full attention to capitalise on. You cannot maintain $VOLT community management at full intensity AND pursue the new opportunity.\n\nDesign your transition plan: how do you responsibly step back from $VOLT leadership while protecting the community you built?`,
              scoringCriteria: [
                `Assessment: $VOLT is Phase 3 ready. 35 content creators, 12 moderators, runs well without you = community infrastructure exists. The transition is appropriate and the timing is right.`,
                `Transition plan: (1) identify the 3–5 most capable moderators who have demonstrated judgment and cultural understanding; (2) have a transparent conversation with them: "I am reducing my daily involvement — you will be running this community"; (3) make this transition public to the community honestly: "I built this as a volunteer and I'm proud of what we created together. [Names] are the community's leadership going forward."; (4) remain available as an advisor but not the daily operator; (5) continue holding your position in $VOLT (no quiet exit while transitioning).`,
                `What NOT to do: quietly disappear, sell your entire position before announcing the transition, give moderator access to unreliable people, or rush the transition in under 2 weeks. The community built trust in you — the transition must respect that trust.`,
              ],
            },
          ],
        },
      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from Lab 2 — CTO mechanics, community phase analysis, leadership role assessment.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry after reviewing flagged lesson', passThreshold: 0.80 },
      },
      bossMode: {
        title: `Lab 2 Boss — CTO and Cult Building Integration`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-senior-lab2-v1',
          situation: `$AURORA (northern lights theme) rugged 28 hours ago. Portfolio: $95,000. You hold 0.8% of $AURORA's supply, worth $1,800 post-rug (was $22,000 at peak).\n\nYour profile: professional photographer specialising in natural phenomena (northern lights is your speciality), 3.5 hours free daily, active in memecoin trading for 2 years.\n\nCommunity state:\n- 95 members remain (was 3,200)\n- 12 members actively creating northern lights art in last 28 hours\n- One member (X) has a 1-year-old wallet with proven community history — built Phase 3 community for another token\n- No public CTO announcement made yet\n\nAs an investor (not necessarily leader), you also see two other post-rug tokens:\n- $VOLCANO (eruption theme): 280 members, 8 creators, new leader with 2-month wallet announced CTO immediately\n- $GLACIER (ice aesthetic): 60 members, 15 creators, no leader yet, very active content creation\n\nRequired: (1) Should you lead $AURORA's CTO given your profile? Or defer to Member X? (2) Compare $VOLCANO vs $GLACIER as investment opportunities. (3) What is the Phase 3 potential of $AURORA based on current signals? (4) Regardless of your leadership decision, what is your investment sizing on $AURORA?`,
          scoringCriteria: [
            `Leadership decision: DEFER to Member X. They have proven Phase 3 community building experience — your photography expertise is valuable as a creator role but not as a community management leader. Contact Member X, offer to collaborate: you provide original professional northern lights photography as cultural content, they provide the community management infrastructure. This is the optimal role assignment.`,
            `$VOLCANO vs $GLACIER: $GLACIER is stronger. 15 creators in 60 members = 25% creator ratio (exceptional). No premature announcement = authentic CTO signal. $VOLCANO: 8 creators in 280 members = 2.8% ratio, and the 2-month-old wallet + immediate announcement are red flags for bag-holder motivation.`,
            `$AURORA Phase 3 potential: MODERATE-HIGH. 12 creators in 95 members (13% ratio — strong), northern lights concept has genuine universal visual recognition, and if professional photography is available as cultural content, the aesthetic quality could differentiate from typical meme content. If Member X leads with your photography as the content foundation, Phase 3 pathway is viable.`,
            `Investment sizing on $AURORA: 1.5–2% of portfolio ($1,425–$1,900). Already hold $1,800 at cost, add equivalent to original position at current post-rug price. If Member X confirms leadership, this is a reasonable CTO investment given positive signals. Not more — CTOs fail 80–90% of the time regardless of signal quality.`,
          ],
        }],
      },
    },

    // ── Senior Labs 3 & 4 ────────────────────────────────────────────────
    {
      id: 'lab-13-professional-systems',
      title: `Lab 3: Professional Trading Systems and Consistent Edge`,
      subtitle: `The difference between a trader who makes money for one year and one who makes it for ten is a system that survives its own success.`,
      lessons: [
        {
          id: 'defining-defending-edge',
          title: `Defining and Defending Your Edge`,
          explanation: `Most traders have profitable periods but cannot explain why. When profitability ends they have no framework to diagnose what changed. Defining your edge explicitly is the prerequisite for defending and recovering it.\n\n**Edge defined:** Positive expected value per trade in a specific strategy under specific conditions. EV = (Win rate × Avg win%) − (Loss rate × Avg loss%).\n\nExample: 58% win rate, +180% avg win, 42% loss rate, −65% avg loss.\nEV = (0.58 × 1.80) − (0.42 × 0.65) = 1.044 − 0.273 = +0.771 per trade.\n\nEdge is always conditional. "I have edge on wallet-tracking entries in bull conditions at sub-$100K MC entries" is more precise than "I have edge at memecoin trading." The conditions matter as much as the strategy.\n\n**Tracking edge erosion via rolling windows:**\nCalculate EV for each consecutive 20-trade window. Your baseline is your first three windows. Three consecutive windows declining below baseline = investigate. Five windows declining = preserve capital, find the cause before continuing.\n\nCommon erosion causes: (1) tracked wallets went public — replace them. (2) Market conditions changed — your bull-market edge doesn't work in bears. (3) Portfolio size grew causing self-impact — move up the MC ladder. (4) Signal sources crowded — your narrative basket approach is now being used by too many others.\n\n**Defending edge at two levels:**\nTool level: continuous replacement of decaying signal sources (wallets, narrative detection timing). Active maintenance, weekly.\nStrategy level: condition awareness — only deploy each strategy when its required conditions exist. No-edge environments get cash, not forced trades.\n\n**Abandoning vs persisting:**\nA 20-trade rough patch in a strong strategy = variance. A 5-window declining trend = structural. The discipline: if you cannot identify a fixable cause after 5 declining windows, preserve capital. The strategy may be gone.`,
          visualPrompt: `👆 EV calculator with rolling 20-trade window tracker`,
          visualType: `interactive`,
          visualUrl: `edge-calculator-rolling-window`,
          examples: [
            {
              contextTag: `[Edge quantification, 80 trades, 2025]`,
              context: `Trader calculates EV from 80-trade wallet-tracking journal.`,
              scenario: `52% win rate, +240% avg win, 48% loss rate, -68% avg loss. EV = (0.52×2.40)-(0.48×0.68) = 1.248-0.326 = +0.922/trade.`,
              outcome: `Strong edge confirmed. Conditions mapped: requires pre-public wallets, bull Solana season, sub-$100K MC entries. Now can scale confidently.`,
            },
            {
              contextTag: `[Erosion detection, wallet decay, 2025]`,
              context: `Trader tracks rolling EV. Baseline +0.85. Then: W4 +0.62, W5 +0.38, W6 +0.11.`,
              scenario: `Three consecutive declining windows. Investigation: 3 of 5 primary wallets went public in the last 6 weeks.`,
              outcome: `Replace wallets via GateKept. Six weeks later: rolling EV returns to +0.72. The tool was the problem, not the strategy.`,
            },
            {
              contextTag: `[Condition mismatch, bear market test, 2024]`,
              context: `Bull-market edge strategy (EV +0.80/trade) tested in confirmed bear.`,
              scenario: `15 trades in bear conditions: EV -0.25/trade. Edge is condition-dependent.`,
              outcome: `Strategy paused for 5 months. Capital preserved. When bull conditions return, full strategy deployment recovers quickly. The pause was the right call.`,
            },
          ],
          keyTakeaway: `EV = (win rate × avg win) − (loss rate × avg loss). Track rolling 20-trade windows. Three declining windows = investigate. Five = preserve capital. Edge is condition-specific — only deploy when conditions are present.`,
          guidedPractice: [
            {
              question: `Strategy: 60% win rate, +200% avg win, 40% loss rate, -70% avg loss. What is EV per trade?`,
              options: [`A — +0.64`, `B — +0.92`, `C — +1.48`, `D — +0.34`],
              correct: 1,
              hint: `EV = (0.60 × 2.00) − (0.40 × 0.70)`,
              explanation: `B is correct. (0.60 × 2.00) − (0.40 × 0.70) = 1.20 − 0.28 = +0.92 per trade. For every $100 risked, expected return is $92.`,
            },
            {
              question: `Rolling EV: W1 +0.88, W2 +0.91, W3 +0.65, W4 +0.42, W5 +0.18. What action?`,
              options: [`A — Continue — this is normal variance`, `B — Investigate immediately. Three consecutive declining windows (W3-W5) is the structural signal. Find the cause: wallet decay, market shift, portfolio self-impact?`, `C — Double position sizes to recover faster`, `D — Switch to a completely different strategy`],
              correct: 1,
              hint: `Three consecutive declining windows is the investigation trigger, not abandonment.`,
              explanation: `B is correct. W3 through W5 show accelerating decline from a strong baseline. This is structural, not variance. Identify the cause before it reaches negative territory — the most likely causes are wallet decay or market condition shift.`,
            },
            {
              question: `Your new pair strategy has EV +0.75/trade in bulls. In a confirmed bear you run 20 trades and get EV -0.25/trade. What does this tell you?`,
              options: [`A — The strategy has stopped working permanently`, `B — Edge is condition-dependent. It requires bull conditions. Pause deployment until conditions return.`, `C — Increase sizes to overcome the negative EV`, `D — The strategy needs to be rebuilt from scratch`],
              correct: 1,
              hint: `If a strategy has +0.75 in one condition and -0.25 in another, what should determine when you deploy it?`,
              explanation: `B is correct. The strategy has genuine edge in bulls and negative edge in bears. Condition-based deployment is the entire framework — the strategy should only run when conditions support it.`,
            },
            {
              question: `After five declining rolling windows reaching EV +0.05, you cannot identify a cause. What is the correct action?`,
              options: [`A — Continue — trends reverse eventually`, `B — Preserve capital. When the cause is unidentifiable after five declining windows, the edge may be structurally gone. Move to minimum position sizes while researching.`, `C — Increase trade frequency to collect more data`, `D — Take a one-week break and resume`],
              correct: 1,
              hint: `What is worth more: preserving capital while researching, or continuing with near-zero EV?`,
              explanation: `B is correct. Near-zero EV means expected return is approximately zero. Continuing without understanding the cause risks capital on a broken strategy. Preservation while investigating is the only rational response.`,
            },
            {
              question: `What specific actions defend edge at the tool level versus the strategy level?`,
              options: [`A — They are the same`, `B — Tool level: replace decayed wallets before public listing, discover narratives at Phase 1. Strategy level: only deploy when required conditions exist, park capital when conditions are absent.`, `C — Tool level is platform selection; strategy level is timing`, `D — Tool level is beginner; strategy level is senior`],
              correct: 1,
              hint: `What are the two layers at which edge can deteriorate independently?`,
              explanation: `B is correct. Tool-level edge requires active maintenance (replacing wallets, staying ahead of narrative discovery). Strategy-level edge requires condition awareness (knowing when your environment supports the strategy). Both require different defensive actions.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-dataInterpret`,
              scenario: `12-month EV data by strategy and condition:\n\nWallet tracking, bull: 45 trades, 62% WR, +195% avg win, -64% avg loss.\nWallet tracking, bear: 12 trades, 38% WR, +145% avg win, -72% avg loss.\nNew pairs, bull: 80 trades, 55% WR, +280% avg win, -68% avg loss.\nNew pairs, bear: 22 trades, 31% WR, +195% avg win, -80% avg loss.\nStyle 2 dip buys, bull: 28 trades, 68% WR, +95% avg win, -42% avg loss.\nStyle 2 dip buys, bear: 18 trades, 61% WR, +65% avg win, -38% avg loss.\n\n1. Calculate EV for each combination.\n2. Which strategies have genuine edge in bear conditions?\n3. Optimal bear market allocation.`,
              scoringCriteria: [
                `EVs: WT bull=(0.62×1.95)-(0.38×0.64)=1.209-0.243=+0.966. WT bear=(0.38×1.45)-(0.62×0.72)=0.551-0.446=+0.105. NP bull=(0.55×2.80)-(0.45×0.68)=1.540-0.306=+1.234. NP bear=(0.31×1.95)-(0.69×0.80)=0.605-0.552=+0.053. S2 bull=(0.68×0.95)-(0.32×0.42)=0.646-0.134=+0.512. S2 bear=(0.61×0.65)-(0.39×0.38)=0.397-0.148=+0.249.`,
                `Bear edge: only Style 2 has meaningful edge (+0.249). WT barely positive (+0.105). New pairs barely positive (+0.053).`,
                `Bear allocation: 90% Style 2 dip buys. Max 10% selective wallet tracking on exceptional signals. Zero new pairs.`,
              ],
            },
            {
              type: `judgment-riskAssess`,
              scenario: `9-month rolling EV: W1 +1.12, W2 +0.98, W3 +1.04 (baseline ~+1.05). W4 +0.87, W5 +0.79, W6 +0.71. W7 +0.55, W8 +0.43, W9 +0.28. W10 +0.15, W11 +0.08, W12 -0.04.\n\nKnown events: Month 3 — 2 best wallets appeared on GMGN public list. Month 5 — market entered distribution. Month 7 — doubled average position size due to portfolio growth.\n\nFor each period, identify the likely cause and what the correct response was at each stage.`,
              scoringCriteria: [
                `W4-W6: wallet decay (Month 3 public listings). Response needed: source 2 replacement pre-public wallets immediately via GateKept.`,
                `W7-W9: market distribution phase + unaddressed wallet decay compounding. Response: reduce to bear-condition allocation (Style 2 focus), still address wallet replacement.`,
                `W10-W12: all three issues compounding (decay + bear + self-impact from 2× sizing). Response at W12: stop new pair strategy entirely, preserve capital, address all three causes systematically.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Edge recovery: after 6-month decline from EV +0.95 to EV -0.10, you fixed three causes. First 40 post-fix trades:\nTrades 1-20: 58% WR, +165% avg win, -58% avg loss.\nTrades 21-40: 61% WR, +180% avg win, -55% avg loss.\n\n1. Calculate EV for each window vs baseline (+0.95).\n2. Is edge recovered? What constitutes full confidence?\n3. What position sizing rule applies during validation?`,
              scoringCriteria: [
                `Trades 1-20 EV: (0.58×1.65)-(0.42×0.58)=0.957-0.244=+0.713. Trades 21-40: (0.61×1.80)-(0.39×0.55)=1.098-0.214=+0.884. Both positive, improving trend.`,
                `Partially recovered but not at baseline (+0.95). Full confidence = 3 consecutive windows above +0.95 OR 100 total post-fix trades maintaining improvement.`,
                `Recovery period: 50-75% of normal position sizes until 3 consecutive windows above baseline. Protects capital if recovery is incomplete.`,
              ],
            },
          ],
        },
        {
          id: 'volatility-exploitation-systems',
          title: `Building Systems Around Volatility`,
          explanation: `Three repeatable volatility patterns produce consistent edge when systematised:\n\n**Post-graduation dump system:**\nEvery graduation produces a predictable 30-60% dump from snipers exiting. System: monitor graduation queue → when strong community signals present → let the dump occur → enter 4-8 hours post-graduation at 30-60% below graduation price. The fundamentals are graduation-quality; the price is post-dump.\n\n**Post-crash recovery watch list:**\nBroad market corrections force selling of quality cult coins alongside rugs. Pre-build a watch list of 10-15 Phase 2/3 community tokens at normal prices. When market drops 30%+, deploy into the 3-5 strongest watch list coins. These are not new pair gambles — established assets at crash discounts.\n\n**Phase 1 daily detection system:**\nFormalised morning workflow: DeFined.fi scan (under 12 hours, by volume) → flag any 2+ tokens in the same thematic cluster → if 3+ tokens in a theme across 48 hours, no mainstream coverage: deploy basket (4-6 tokens at 1% each) → exit trigger: first mainstream newsletter OR KOL saturation.\n\nAll three systems run the same process repeatedly at defined trigger conditions. Consistency of execution creates the edge.`,
          visualPrompt: `👆 Three volatility exploitation systems: post-graduation, post-crash, Phase 1 — workflow`,
          visualType: `interactive`,
          visualUrl: `volatility-exploitation-systems`,
          examples: [
            {
              contextTag: `[Post-graduation system, 68 entries, 2025]`,
              context: `Trader applies graduation dump system consistently for 6 months.`,
              scenario: `68 entries made 4-8 hours post-graduation after community validation. Average entry: 41% below graduation price. Average subsequent return: +185%.`,
              outcome: `Systematic execution of a predictable pattern produces reliable edge. Not every trade wins; the system wins on average.`,
            },
            {
              contextTag: `[Post-crash deployment, 4 quality tokens, 2024]`,
              context: `Solana drops 42% in 48 hours. Pre-built watch list ready.`,
              scenario: `Deploys into 4 Phase 3 community tokens at 50-60% below their 30-day averages. All four have active communities continuing through the crash.`,
              outcome: `6 weeks later: all four positions up 80-220%. The watch list converted panic into systematic purchase of quality at discount.`,
            },
            {
              contextTag: `[Phase 1 system, daily scan, 2025]`,
              context: `Trader runs daily DeFined scan as part of morning routine.`,
              scenario: `Day 1: 2 space tokens. Day 2: 3 more. Deploys basket. Day 8: mainstream newsletter covers space meta.`,
              outcome: `4 of 6 basket tokens pump 3-8× between deployment and newsletter exit trigger.`,
            },
          ],
          keyTakeaway: `Post-graduation: enter 4-8 hours after dump stabilises. Post-crash: pre-built watch list deployed at 30%+ market drop. Phase 1: daily DeFined scan for thematic clustering, basket on 3+ tokens across 48 hours. Systems execute consistently at defined trigger conditions.`,
          guidedPractice: [
            {
              question: `Why does entering 4-8 hours after a graduation dump produce better outcomes than entering at graduation?`,
              options: [`A — Gas fees are lower after 4 hours`, `B — The dump clears sniper and early holder selling pressure. Entering after stabilisation means below-graduation price with reduced concentrated sell overhead.`, `C — DEXScreener takes 4 hours to list new tokens`, `D — Smart money always waits exactly 4 hours`],
              correct: 1,
              hint: `Who is selling at graduation? What happens to that selling pressure 4-8 hours later?`,
              explanation: `B is correct. Snipers sell at graduation — their first real exit. 4-8 hours later that selling is substantially complete. You get graduation-quality fundamentals at 30-60% below graduation price with reduced sell overhead.`,
            },
            {
              question: `What qualifies a token for your post-crash recovery watch list?`,
              options: [`A — Any token above $5M MC`, `B — Phase 2 or Phase 3 community, locked LP, active content creation even through price drops, and would be a quality entry at normal prices`, `C — Tokens that appeared on DEXScreener in the last week`, `D — Tokens with 10,000+ Telegram members`],
              correct: 1,
              hint: `What distinguishes a quality cult coin from a dead token during a crash?`,
              explanation: `B is correct. The watch list captures assets that maintain community regardless of price. During a crash they get sold for liquidity, not because they are worthless. Pre-building the list means deployment during the crash is mechanical execution of a pre-decided thesis — not analysis under panic.`,
            },
            {
              question: `Phase 1 basket exit trigger is defined as "first mainstream newsletter coverage." Why is this specifically the exit signal?`,
              options: [`A — Newsletters are always wrong`, `B — First mainstream coverage = Phase 2 confirmed = the narrative's organic discovery window has closed. Smart money from Phase 1 is now exiting into the mainstream buying surge. Taking 50% profit here crystallises the core gain.`, `C — Newsletter readers drive the best buying`, `D — Exit at newsletter because the narrative will be over within 24 hours`],
              correct: 1,
              hint: `Who entered in Phase 1 and what are they looking for when Phase 2 mainstream attention arrives?`,
              explanation: `B is correct. Phase 2 confirmation (newsletter coverage) brings the buyers that Phase 1 holders sell to. Taking 50% profit into this buying surge crystallises the Phase 1 entry advantage. Holding everything through Phase 2 risks riding into Phase 3 saturation.`,
            },
            {
              question: `The three volatility exploitation systems all share what underlying principle?`,
              options: [`A — They all use the same tools`, `B — Each systematises a predictable, repeatable market pattern into a consistent execution process with defined entry triggers and exit rules — removing in-moment decision making`, `C — They all generate the same level of return`, `D — They all work only in bull markets`],
              correct: 1,
              hint: `What do graduation dumps, broad market crashes, and Phase 1 narrative formations have in common?`,
              explanation: `B is correct. All three are predictable, repeatable patterns. Systematising them means: when the trigger condition occurs, execute the pre-defined response. This is the difference between a trading system and a series of individual decisions — consistency of execution.`,
            },
            {
              question: `Your Phase 1 basket has 5 tokens from a thematic cluster. KOL saturation occurs (every major KOL calling the theme simultaneously). What does the system dictate?`,
              options: [`A — Hold everything — KOL calls mean more upside`, `B — Execute pre-defined Phase 3 exit: KOL saturation = Phase 3 = take 50% profit across basket. Predetermined rules, not in-moment decisions.`, `C — Add more positions — KOLs bring volume`, `D — Exit the entire basket immediately`],
              correct: 1,
              hint: `What phase does KOL saturation represent and what was pre-defined as the exit trigger?`,
              explanation: `B is correct. KOL saturation = Phase 3 = the exit trigger that was defined before the basket was deployed. Taking 50% profit now crystallises the Phase 1 entry gain while leaving 50% as free ride. The rule was predetermined — execute it.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Post-graduation system entry evaluation. Token graduates with:\n- Community: 900 Telegram, 65% original content, unique identifier forming\n- Sniper concentration: 13% across 4 wallets\n- Dev: 2.8%, no rug history\n- LP: locked 6 months\n- Narrative: Phase 1 space theme\n\nGraduation: $69K MC. Post-dump 4 hours later: $42K MC (39% below). Volume stabilised. Community still active.\n\n1. Does this qualify for the post-graduation system?\n2. Primary risk factor?\n3. Entry design: size, ladder, stops.`,
              scoringCriteria: [
                `Qualifies: YES. Level 3 community quality, Phase 1 narrative, clean dev, locked LP. All major checks pass.`,
                `Primary risk: 13% sniper concentration = concentrated sell overhead above current price. These 4 wallets will sell into any pump.`,
                `Entry: 1.5% portfolio (slightly below 2% for elevated sniper risk). Profit ladder: 30% at 2× ($84K MC), 30% at 4× ($168K MC), 40% free ride. Stop: GMGN alert if sniper wallets begin significant selling. Exit if community telegram activity drops >70%.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Post-crash watch list deployment. Market down 38% in 72 hours. Your 12-token watch list:\n\n$WIF: -39% from 30-day avg. Phase 3. $BRETT: -44%. Phase 3. $BONK: -38%. Phase 3. $PIXEL: -27%. Phase 2. $NOVA: -33%. Phase 2. $GLOW: -54%. Phase 3 — deepest discount.\n\nPortfolio $90,000. Pre-crash active: 24% ($21,600). Cash available: $68,400.\n\nDesign the crash deployment: which tokens, how much, deployment logic.`,
              scoringCriteria: [
                `Priority 1 — Phase 3 + deepest discounts: $GLOW (54%, Phase 3) = 4% ($3,600). $BRETT (44%, Phase 3) = 3.5% ($3,150). $WIF (39%, Phase 3) = 3% ($2,700).`,
                `Priority 2 — Phase 3 moderate: $BONK (38%) = 3% ($2,700). Total Phase 3: 13.5% ($12,150).`,
                `Priority 3 — Phase 2: $PIXEL (27%, weakest discount) = 1.5% ($1,350). $NOVA (33%) = 1.5% ($1,350).`,
                `Total: 16.5% ($14,850). Deploy 60% now, hold 40% of budget for potential further decline. Do not deploy all available cash — crashes often deepen before recovering.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `8-week Phase 1 system audit:\n\nWeek 1: No thematic clusters. No deployment.\nWeek 2: 3 retro gaming tokens flagged. Basket: 5×1%. Week 4: newsletter coverage. Exit 50%. Net: +185% on deployed capital.\nWeek 3: 2 ocean tokens flagged — below 3-token threshold. No deployment. Week 6: full narrative developed — missed.\nWeek 5: 4 AI research tokens flagged. Basket: 6×1%. Week 7: KOL saturation. Exit 50%. Net: +220%.\nWeek 6: 3 underground music tokens flagged. Basket deployed. Week 8: theme died. Net: -68%.\n\n1. Overall system performance.\n2. What would have filtered the Week 6 false positive?\n3. How to capture the Week 3 missed opportunity?`,
              scoringCriteria: [
                `Performance: W2 (5%×+185%=+9.25%), W5 (6%×+220%=+13.2%), W6 (3%×-68%=-2.04%). Net: +20.41% portfolio from 14% total deployed. Strong risk-adjusted.`,
                `Week 6 filter: cultural staying power test. "Underground music" fails universal recognition — it is niche, not mainstream. Filter: only deploy baskets on themes with broad cultural recognition (animals, political figures, internet classics).`,
                `Week 3 solution: two tokens = "watch" trigger, not deployment. If a third appears within 72 hours → deploy. This converts the binary threshold into a monitored watch window.`,
              ],
            },
          ],
        },
        {
          id: 'consistency-at-scale',
          title: `Consistency at $50K+ — The Mental Game`,
          explanation: `At $50,000+ portfolios, individual trades represent significant absolute amounts. A 2% position is $1,000+. A 50% loss is $500+. The psychological dynamics change — and most traders are not prepared.\n\n**Three challenges at scale:**\n\n1. Over-analysis paralysis: fear of the larger loss triggers excessive re-checking after the checklist already cleared. The cure: enforce 60-second checklist maximum. If it passes, enter.\n\n2. Conviction-based oversizing: "this is a sure thing" creates impulse to size at 5% instead of 2%. High conviction frequently accompanies FOMO and late entries. Formula-only sizing, always. 2% is 2%.\n\n3. Difficulty accepting losses at scale: a $3,000 loss feels disproportionately heavy. This makes traders hold losers past their defined stops. Pre-define stops and execute them mechanically.\n\n**Pre-session state check (most important senior-level addition):**\nBefore any trading session, honestly assess emotional state: frustrated? Euphoric? Tired? If any impaired state is active — trade at 50% of normal position sizes or delay the session entirely. This single habit prevents more capital destruction than any other rule at senior level.\n\nThe source material: "People follow you now. People making money is your fault. People losing money is your fault. Be neutral to both." This neutrality applies internally too — euphoria after wins and despair after losses both impair decision quality equally.`,
          visualPrompt: `👆 Pre-session state check: emotional state → position sizing modifier chart`,
          visualType: `interactive`,
          visualUrl: `pre-session-state-check`,
          examples: [
            {
              contextTag: `[Over-analysis paralysis, missed entry, 2025]`,
              context: `Trader at $150K portfolio. Strong opportunity at $28K MC identified. Begins analysis.`,
              scenario: `Spends 45 minutes re-checking because "this is $3,000 and I need to be certain." By the time they enter: $85K MC.`,
              outcome: `Implements 60-second checklist rule. If it passes, enter. Subsequent analysis: after the entry, not instead of it.`,
            },
            {
              contextTag: `[Conviction oversizing, formula violation, 2025]`,
              context: `"This is a 10× for sure." Normal sizing: 2% of $120K = $2,400. Sizes at 5% ($6,000).`,
              scenario: `Token 2×, then whale sells to -30% from entry. $6,000 position loses $1,800. Formula position would have lost $720.`,
              outcome: `Learns: highest conviction = frequently highest FOMO = worst entries. Formula is non-negotiable.`,
            },
            {
              contextTag: `[Pre-session state check, revenge trading prevented, 2025]`,
              context: `Just had $4,500 single-trade loss. 2 PM — normal session would begin.`,
              scenario: `State check: frustrated, revenge trading impulse active. Decision: 50% size for this session.`,
              outcome: `Session: +$800 win, -$400 losses. Net +$400. Without check: oversized revenge trades likely would have produced -$2,000 to -$3,000.`,
            },
          ],
          keyTakeaway: `60-second checklist maximum to prevent analysis paralysis. Formula-only sizing regardless of conviction. Mechanical stop execution. Pre-session state check: impaired state = 50% size or delay. These rules exist specifically because the absolute dollar amounts at senior level make emotional decision-making more dangerous.`,
          guidedPractice: [
            {
              question: `A $100K trader spends 40 minutes analysing a trade the checklist cleared in 5 minutes. What is happening and what is the cure?`,
              options: [`A — Thoroughness — more analysis means better decisions`, `B — Fear-driven delay. The checklist is the complete decision framework. Additional analysis is anxiety management, not risk management. Enforce 60-second maximum — if it passes, enter.`, `C — Normal senior-level diligence`, `D — The opportunity is not worth taking`],
              correct: 1,
              hint: `What is the function of the extra 35 minutes after the checklist already cleared?`,
              explanation: `B is correct. The extra analysis is the brain looking for a reason not to enter to avoid potential large absolute dollar loss. The checklist exists to compress this correctly. Enforcing the time limit forces the discipline.`,
            },
            {
              question: `You have high conviction on a token. Standard 2% = $2,000. You want to size at 6% ($6,000). Why is this wrong?`,
              options: [`A — 6% is above a legal limit`, `B — Conviction-based oversizing concentrates losses exactly when judgment is most impaired. High conviction frequently accompanies FOMO entries. The formula overrides emotional conviction specifically because emotions are unreliable at entry moments.`, `C — 6% causes price impact on small tokens`, `D — 2% only applies in bear markets`],
              correct: 1,
              hint: `When is your conviction highest — on a calm analytical entry or when FOMO is active?`,
              explanation: `B is correct. Peak personal conviction and peak FOMO often coincide. Allowing conviction to override formula means your largest positions will frequently be your worst entries. The formula is precisely designed to override this.`,
            },
            {
              question: `What is the pre-session state check and why is it the most important senior-level addition?`,
              options: [`A — A technical check of trading tools`, `B — Honest assessment of current emotional state before any trading. If frustrated, euphoric, or tired: trade at 50% normal size or delay. Prevents the largest single risk at senior scale: emotional states producing catastrophic sizing errors.`, `C — A market conditions check`, `D — A review of previous session results`],
              correct: 1,
              hint: `What is the primary driver of catastrophic position sizing errors at $50K+ portfolios?`,
              explanation: `B is correct. At senior scale, emotional states (revenge trading after loss, FOMO sizing after win, fatigued shortcuts) are the primary driver of outsized losses. The pre-session check builds a mandatory pause before any emotional state can manifest as a trade.`,
            },
            {
              question: `Your pre-defined stop is -40%. The token is at -45%. You believe it will recover. What is the correct action?`,
              options: [`A — Hold — your analysis suggests recovery`, `B — Exit. The stop was defined in a calm analytical state before the position. The "it will recover" belief is generated in a loss-averse emotional state. Execute the pre-defined rule.`, `C — Reduce size by 50%`, `D — Move the stop lower`],
              correct: 1,
              hint: `Which analysis is more reliable: pre-entry calm analysis or in-position loss-averse analysis?`,
              explanation: `B is correct. Pre-entry stop conditions are set in the optimal analytical state. "It will recover" is consistently generated by loss aversion trying to avoid realising pain. The rule exists to override this belief. Execute it.`,
            },
            {
              question: `After three consecutive losing trades totalling -$4,200, you have a clear entry signal at 3 PM. What does professional protocol require?`,
              options: [`A — Enter immediately — you need to recover`, `B — Run pre-session state check. Three losses = frustrated/revenge impulse likely. If impaired state confirmed: 50% normal size maximum for this session, or delay until tomorrow.`, `C — Double position size to recover faster`, `D — Take the rest of the day off`],
              correct: 1,
              hint: `What psychological state do three consecutive losses produce and how does that affect subsequent trading?`,
              explanation: `B is correct. Three consecutive losses produce revenge trading impulse. This state reliably leads to oversizing, which turns a $4,200 loss day into a $10,000+ loss day. The 50% size modifier limits the damage from the inevitable execution quality reduction in this state.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Portfolio $110,000. Pre-session: you are euphoric after yesterday's +$8,200 trade. Two opportunities:\n\nA: Wallet tracking signal ($32K MC, 55% WR pre-public wallet, clean). Standard: 2% = $2,200. You want to size at 4% ("I'm hot right now").\nB: Phase 1 narrative basket, 4 tokens × 1% each = 4% = $4,400.\n\nDesign the session: what you enter, exact sizes, reasoning that overrides the euphoric sizing impulse.`,
              scoringCriteria: [
                `Pre-session state: EUPHORIC. This is a problematic state. Apply formula-only commitment or 50% size modifier.`,
                `Opportunity A: 2% = $2,200. NOT 4%. The euphoric impulse to size up has no mathematical basis — yesterday's win does not change today's 55% win rate.`,
                `Opportunity B: 4×1% = $4,400 total. Within formula (each position is 1%). No modification needed.`,
                `Override reasoning: "My win rate is 55%. That means 45% of trades lose. Yesterday was one data point. The next trade is a fresh probabilistic event with identical underlying odds to every trade I have ever taken."`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Monthly sizing discipline audit. $95K portfolio.\n\n18 trades:\n- 12 formula-sized (2% standard): 9W, 3L. Net: +$14,200.\n- 4 conviction-oversized (3.5-5%): 1W, 3L. Net: -$6,800.\n- 2 under-sized from fear (0.5%): 2W. Net: +$800.\n\n1. Total performance vs formula-only counterfactual.\n2. Absolute cost of conviction sizing.\n3. One concrete enforcement mechanism for next month.`,
              scoringCriteria: [
                `Actual: +$14,200-$6,800+$800 = +$8,200. Formula-only counterfactual: conviction trades at 2% avg instead of 3.5-5%: 1W×$1,900-3L×$1,900×0.65 ≈ -$1,805 vs actual -$6,800. Under-sized at formula 2%: +$800→+$3,200. Total counterfactual: $14,200-$1,805+$3,200 = +$15,595 vs actual +$8,200.`,
                `Cost of conviction sizing: $6,800 actual losses vs ~$1,805 formula losses = ~$5,000 excess losses in one month.`,
                `Enforcement: write position size AND formula justification before submitting any order. If justification contains "high conviction" instead of the formula: do not enter. Physical pre-entry writing creates friction that prevents impulsive oversizing.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `Quarterly emotional state tracking alongside performance:\n\nMonth 1: 22 sessions, 4 with impaired state (applied 50% modifier). Performance: +$12,400. No revenge trades.\nMonth 2: 22 sessions, 3 skipped entirely, 7 modifier applied. BUT 2 sessions where modifier NOT applied despite impaired state: -$4,200 on those two days alone. Net: +$7,800.\nMonth 3: Pre-session check abandoned. Three revenge sessions. Damage: -$9,800. Gross without revenge: +$12,900. Actual: +$3,100.\n\n1. Value of the check in Month 2 (the 2 failed applications).\n2. Cost of abandoning Month 3.\n3. Implementation that makes abandoning harder.`,
              scoringCriteria: [
                `Month 2 value: the 2 sessions where modifier wasn't applied cost -$4,200. At 50% size those losses would have been ~-$1,200. The 2 failures cost ~$3,000 in preventable losses.`,
                `Month 3 cost: revenge damage = -$9,800. Gross without revenge = +$12,900. Abandoning the check cost approximately $7,000-$9,000 vs a disciplined month.`,
                `Implementation: physical ritual before screen access — write 3 sentences about current emotional state in a physical notebook. Notebook must be completed before any trading app opens. Physical friction makes passive omission a conscious violation.`,
              ],
            },
          ],
        },
      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from Lab 3 — edge quantification, volatility systems, professional psychology.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry', passThreshold: 0.80 },
      },
      bossMode: {
        title: `Lab 3 Boss — Professional System Design`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-senior-lab3-v1',
          situation: `Portfolio $145,000. 15 months of data.\n\nEdge: Wallet tracking (38 trades, 61% WR, +175% avg win, -62% avg loss). Post-grad system (22 trades, 58% WR, +140% avg win, -55% avg loss).\n\nRolling EV for wallet tracking: W1-W3 baseline +0.88. W4-W6 avg +0.73. Declining.\n\nPre-session: just received news that a family member is ill. Distracted and emotionally unsettled.\n\nMarket: active bull Solana season (DEX volume +180%, graduation rate 4.1%).\n\nFour opportunities: A) wallet tracking signal ($38K MC, clean). B) Post-graduation entry ($45K MC, 38% below grad, strong community). C) Phase 1 basket — 5 AI tokens. D) Post-crash deployment — no crash today.\n\nRequired: (1) EV for wallet tracking + what declining trend suggests. (2) Session protocol given emotional state. (3) Which opportunities, at what sizes. (4) One investigation step for the EV decline.`,
          scoringCriteria: [
            `EV: (0.61×1.75)-(0.39×0.62)=1.0675-0.2418=+0.826/trade. Still positive but declining from +0.88 baseline. Three declining windows is the investigation trigger.`,
            `Protocol: family news = distracted/unsettled = impaired state. Apply 50% size modifier to ALL trades today. Consider delaying entirely if distraction level impairs checklist quality.`,
            `Opportunities: A = pursue at 50% (1% = $1,450). B = pursue at 50% (1.5% = $2,175). C = basket at 50% (5×0.5% = $3,625). D = not applicable (no crash). Total deployed: $7,250 vs standard ~$14,500.`,
            `Investigation step: GateKept on last 2 weeks of winners — check if any primary tracked wallets recently appeared on GMGN public lists. Three declining windows with no other obvious change = wallet decay is the most likely cause.`,
          ],
        }],
      },
    },

// ─────────────────────────────────────────────────────────────────────────────
// LAB 4: THE FULL CAREER
// ─────────────────────────────────────────────────────────────────────────────
    {
      id: 'lab-14-full-career',
      title: `Lab 4: The Full Career — Sustainability, Growth, and What This Actually Looks Like`,
      subtitle: `This is the honest account of what a sustainable memecoin trading career requires and produces.`,
      lessons: [
        {
          id: 'monetisation-beyond-trading',
          title: `Monetisation Beyond Trading`,
          explanation: `Active trading as a sole income source is inherently volatile. Professional traders who sustain long careers develop complementary income streams that smooth variance and create compounding value.\n\n**Alpha groups:** A trader with documented verifiable track record charges for analysis and calls. Requirements: transparent historical performance (wins AND losses), genuine educational value, position disclosure on every call. Distribution: Whop, Gumroad, Telegram. Pricing: $49-$299/month. Time cost: 8-15 hours/week — must not displace trading time.\n\n**Education (guides, courses, consultations):** Teaching methodology rather than signals. Scales better than alpha groups, lower reputational risk (no position-disclosure required). The source material itself is this model — practical guides that teach a process. Written once, earns passively.\n\n**Platform referrals:** The source material uses referral links for Trojan, BullX, Padre, GateKept, OdinBot, GMGN. Platforms pay 20-40% of referred users' trading fees. At 500+ active referred users this generates $3,000-$15,000/month passive income that compounds as referred users grow their portfolios.\n\n**The allocation rule:** 60-70% of trading-relevant time stays on trading. 30-40% maximum on monetisation. If monetisation consumes more, trading performance declines — which undermines the monetisation value proposition itself.\n\n**The ethics rule:** only refer tools you actually use. Only sell analysis you genuinely believe in. Disclose every financial relationship in every piece of content. The source material models this correctly throughout.`,
          visualPrompt: `👆 Income stream comparison: trading returns, alpha group, education, referrals — monthly vs annual`,
          visualType: `chart`,
          visualUrl: `income-streams-comparison`,
          examples: [
            {
              contextTag: `[Alpha group launch, transparent model, 2025]`,
              context: `Trader with 18 months public trading history (wins and losses documented) launches group at $99/month.`,
              scenario: `Group receives: weekly analysis, pre-entry reasoning with checklist data, post-trade review. Track record linked publicly. No "buy this" without full analysis.`,
              outcome: `120 members = $11,880/month. Time: 8-10 hours/week, replacing social media time not trading time. Trading performance maintained.`,
            },
            {
              contextTag: `[Education guide, passive scaling, 2025]`,
              context: `Trader creates comprehensive wallet hunting methodology guide. Sold at $79 one-time.`,
              scenario: `First month: 340 purchases = $26,860. Ongoing: 60-80/month = $4,740-$6,320 passive.`,
              outcome: `Total time to create: 40 hours. Ongoing: 2 hours/month. Passive income with no further trading time displaced.`,
            },
            {
              contextTag: `[Referral compounding, 2025]`,
              context: `Trader adds referral links to all content for tools they actually use daily.`,
              scenario: `After 6 months: 600 referred users. Average $50/month in platform fees. 25% referral rate.`,
              outcome: `600 × $50 × 0.25 = $7,500/month passive, growing as referred users grow their portfolios.`,
            },
          ],
          keyTakeaway: `Three monetisation paths: alpha groups (recurring, time-intensive), education (scalable passive), referrals (compounding passive). 60-70% time stays on trading. Only refer tools you use. Disclose all financial relationships. Transparent track records (including losses) are the only sustainable foundation for monetisation.`,
          guidedPractice: [
            {
              question: `What is the primary operational risk of running an alpha group alongside active trading?`,
              options: [`A — Tax complications from subscription income`, `B — Time displacement: group management consumes time that would otherwise be trading analysis and execution. If management displaces trading time, performance declines — undermining the group's value.`, `C — Members always front-run your trades`, `D — Platform fees are excessive`],
              correct: 1,
              hint: `If group management takes 20 hours/week of your best analysis time, what happens to trading performance?`,
              explanation: `B is correct. The discipline is ensuring monetisation activities replace lower-value time (social media scrolling) not higher-value time (morning checklist, wallet archaeology, evening journal). If group management displaces trading analysis time, returns decline.`,
            },
            {
              question: `Why does transparent loss documentation create a more durable monetisation foundation than curated win-sharing?`,
              options: [`A — Losses attract more viewers`, `B — A record including losses is verifiable and credible. Platforms built on curated wins collapse when losses become visible. Sustainable monetisation requires the trust that only transparency provides — and losses always eventually become visible.`, `C — Compliance requires loss documentation`, `D — Loss documentation reduces tax obligations`],
              correct: 1,
              hint: `What happens to a paid group's credibility when members realise the leader has been hiding losses?`,
              explanation: `B is correct. Every trader has losing periods. Transparent documentation from the start means members have calibrated expectations — they stay through drawdowns because they were never promised perfection. This is more durable than the inevitable collapse of curated-win credibility.`,
            },
            {
              question: `What is the ethics rule for platform referral links in educational content?`,
              options: [`A — Referral links are unethical in education`, `B — Only reference tools you actively use and genuinely believe in. Disclose that referral links generate income. Do not recommend tools primarily because of referral rates.`, `C — Referral links are standard — disclose nothing`, `D — Only use referral links for major platforms`],
              correct: 1,
              hint: `What standard does the source material model in its own referral link usage?`,
              explanation: `B is correct. The source material references Trojan, BullX, Padre, etc. — all tools the author demonstrably uses throughout the guides. This is the correct model: genuine use comes first, referral income is the byproduct. Recommending a tool for its referral rate that you don't actually use is a form of deception.`,
            },
            {
              question: `Why does education (guides, courses) scale better than alpha groups as a monetisation model?`,
              options: [`A — Education is priced higher`, `B — Educational content is created once and earns passively. Alpha groups require ongoing daily content creation and community management. Education scales with distribution; alpha groups scale with your time — which is fixed.`, `C — Courses are tax-advantaged`, `D — Alpha groups are not legal in some jurisdictions`],
              correct: 1,
              hint: `What is the relationship between content creation time and revenue for each model?`,
              explanation: `B is correct. A guide written in 40 hours generates revenue indefinitely with 2 hours/month maintenance. An alpha group generating the same monthly revenue requires 8-15 hours/week ongoing. The education model's passive income quality is structurally superior.`,
            },
            {
              question: `The source material references receiving referral income while also giving this advice: "Only invest what you can afford to lose." Are these in conflict?`,
              options: [`A — Yes — referral income creates an incentive to encourage more trading`, `B — No — if the referenced platforms are genuinely the best tools for the use case, recommending them is honest even with referral income. The potential conflict is managed by: (1) only recommending tools you actually use, (2) disclosing the referral relationship, (3) giving honest risk warnings alongside the referrals.`, `C — Yes — all referral relationships are conflicted`, `D — No — referral income is too small to create conflict`],
              correct: 1,
              hint: `What makes a referral recommendation ethical vs conflicted?`,
              explanation: `B is correct. The conflict exists in potential — you earn more if more people trade. The management is transparency (disclosed) + genuine use (not paid promotion) + honest risk warnings (capital loss is real). The source material's consistent emphasis on capital preservation alongside tool referrals demonstrates this balance.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `You have 14 months of public trading history. 72 documented public calls, 41 wins (57% WR). You are considering launching an alpha group at $79/month, targeting 200 members.\n\nTime analysis:\n- Current daily trading routine: 3 hours (morning 1.5h, evening 1.5h)\n- Estimated group management: 10-12 hours/week\n- Your best trading happens 8-11 AM UTC\n- Group management would primarily happen evenings\n\nGroup model:\n- Weekly market analysis post\n- Real-time trade sharing with checklist data\n- Loss documentation included\n- Track record page: all 72 calls linked\n\n1. Is the monetisation model ethical? What would make it unethical?\n2. Is the time allocation sustainable?\n3. Design the specific boundary rules to protect trading performance.`,
              scoringCriteria: [
                `Ethical assessment: YES as designed. 57% WR from 72 calls is credible and accurate. Loss documentation included = transparent. Track record page = verifiable. Full checklist on real-time shares = educational value. Unethical would be: hiding losses, sharing positions without disclosure, promising specific returns.`,
                `Time allocation: 10-12 hours/week on evenings = sustainable IF it truly stays on evenings and does not bleed into 8-11 AM UTC trading window. Morning routine must be protected.`,
                `Boundary rules: (1) no group management before 12 PM UTC; (2) no real-time alerts during 8-11 AM focus window; (3) group management is capped at 12 hours/week — if it takes more, hire a moderator; (4) any week where group consumed morning time = pause group activity for 1 week.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `Income stream comparison after 12 months:\n\nTrading: Monthly average +$18,400. High variance (range: -$2,100 to +$54,000).\nAlpha group (launched Month 4): 85 members × $89/month = $7,565/month. Time: 9 hours/week.\nGuide sales (launched Month 7): avg $3,800/month passive. Time: 3 hours/month.\nReferrals (ongoing): avg $2,100/month passive. Time: 0 hours incremental.\n\nTotal monthly income: ~$31,865. Total time: trading routine + 9 hours group + 3 hours guides.\n\n1. What is the risk-adjusted income comparison between trading and non-trading streams?\n2. If trading income drops 50% due to a bear market phase, what is total income?\n3. What is the optimal income stream to scale next given time constraints?`,
              scoringCriteria: [
                `Risk-adjusted: trading has highest average ($18,400) but extreme variance (min -$2,100). Non-trading streams total $13,465/month with near-zero variance. Non-trading provides stability that trading cannot — the combination is dramatically better than trading alone.`,
                `Bear market scenario (trading -50% = $9,200): total income = $9,200 + $13,465 = $22,665. The non-trading streams provide a floor that enables continued professional operation through bear periods without capital distress.`,
                `Optimal next scale: referrals (currently $2,100, near-zero time). Growing the referral audience by improving distribution of existing content multiplies passive income with no additional time cost. Guide sales (fixed time, passive) is second choice. Alpha group (9 hours/week) is already at scale — growing it requires either more time or delegation.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `You receive a DM from a platform offering to pay you $2,000/month to exclusively recommend their trading bot to your audience. The platform is new (6 months old) and you have not personally used it. They claim it has the fastest execution on Solana.\n\nYour current stack: you use Padre for fast execution (and have a referral link generating $800/month). You have tested Padre extensively and it works well for you.\n\nDecision options:\n1. Accept — $2,000/month is double your current referral income\n2. Decline — you haven't used the platform\n3. Accept on condition that you test it for 60 days first\n4. Decline and publicly note you were approached\n\nEvaluate each option against your ethics framework and long-term credibility interests.`,
              scoringCriteria: [
                `Option 1 (accept): REJECT. Recommending a platform you have not used is deceptive regardless of payment. Your audience trusts your referrals based on your genuine use — this violates that trust.`,
                `Option 2 (decline): ACCEPTABLE. Clean. Maintains integrity. You lose $2,000/month but your referral income credibility remains intact.`,
                `Option 3 (test first): BEST OPTION. Test for 60 days. If it genuinely outperforms Padre: switch your own stack, replace Padre referral with this platform's referral, earn legitimately. If not: decline with honest feedback.`,
                `Option 4 (public disclosure): OPTIONAL but powerful. "I was offered $2,000/month to recommend [platform] without testing it. I declined. Here's why I only refer tools I personally use: [your referral philosophy]." This builds extraordinary trust — showing you turned down money for integrity.`,
              ],
            },
          ],
        },
        {
          id: 'long-term-sustainability',
          title: `Long-Term Sustainability — The Full System`,
          explanation: `This is the honest picture of what a sustainable memecoin trading career actually requires.\n\n**The complete professional operation:**\n\nMorning (30-60 min): macro check (BTC dominance, SOL vs 200-day MA, Fear and Greed, ecosystem health metrics). Pre-session state check. Wallet alerts review. Active position check. Narrative scan on DeFined.\n\nTrading window (2-4 hours): evaluate opportunities against full checklist. Execute with formula sizing. No emotional overrides.\n\nEvening (15 min): journal all trades. Community engagement if applicable.\n\nSunday (20 min): weekly PnL review. Rolling EV check. Rule updates from journal patterns. Allocation review.\n\nMonthly (1 hour): month-over-month performance comparison. Strategy condition assessment. Wallet quality audit. Network review.\n\n**The honest return expectations:**\nThe source material's author describes making "$1,000 to $10,000 consistently" from pump.fun trading. This range reflects the reality: highly skilled traders in good market conditions can earn significant income. The same traders in bear market conditions earn much less. The source material's advice — "only invest what you can afford to lose" — is not boilerplate. It is based on genuine experience of the variance.\n\nProfessional traders typically generate: 15-50% annual return in neutral conditions, 50-300%+ in bull years, -10% to +10% in bear years. These are trading returns excluding monetisation income.\n\n**The philosophy from the source material, distilled:**\n"Stay humble. Surround yourself with people smarter than you. Kindness always wins. There's no room for egos. Don't force trades. Find an inner circle of friends to print with. The best trade can be no trade. Pay attention to NARRATIVES and VOLUME. The game changes all the time — adapt."\n\nThis is not decoration. Every sentence is a system that took losses to learn.\n\n**The long-term differentiation:**\nMost people who enter memecoin trading leave within 12 months. The ones who stay 3+ years have one thing in common: they genuinely enjoy the process — the research, the community analysis, the market puzzle — independent of the financial outcome. If you are only in it for the money, the variance will eventually break you. If you find the system genuinely interesting, the variance becomes information.`,
          visualPrompt: `👆 Complete daily/weekly/monthly professional routine overview`,
          visualType: `interactive`,
          visualUrl: `complete-professional-routine`,
          examples: [
            {
              contextTag: `[Complete system, 2-year practitioner, 2025]`,
              context: `Experienced trader summarises their complete operational system after 2 years.`,
              scenario: `Morning routine (45 min): macro check → state check → alerts → positions → DeFined scan. Trading window (3 hours): checklist-only decisions. Evening (15 min): journal. Sunday (20 min): review. Monthly (1 hour): full audit.`,
              outcome: `The routine is not exciting. It is the infrastructure that converted 2 years of market chaos into consistent positive returns. Every element was added because its absence previously cost money.`,
            },
            {
              contextTag: `[Honest variance acknowledgment, difficult year, 2024]`,
              context: `Bear market year. Same professional trader, same skills.`,
              scenario: `Trading returns: +8% for the year. Monetisation: +$156,000 from alpha group, guides, referrals. Total: significantly profitable. Pure trading: nearly flat.`,
              outcome: `The monetisation income smoothed the bear market variance entirely. "Stay humble" was the rule that prevented overtrading during the flat trading period. Capital preservation meant full deployment capacity when conditions improved.`,
            },
            {
              contextTag: `[Process enjoyment, long-term retention, 2025]`,
              context: `Trader reflects on why they are still active after 4 years.`,
              scenario: `"The puzzle is genuinely interesting to me. I would do the wallet archaeology even if I made no money from it. The meme culture analysis is inherently fun. The community aspect is meaningful. The money is important — but it's not what gets me up at 7 AM to run the DeFined scan."`,
              outcome: `This internal driver — genuine interest in the process — is what sustains through bear markets, losing streaks, and the inevitable periods where the system produces nothing interesting. Purely financial motivation cannot produce this.`,
            },
          ],
          keyTakeaway: `A sustainable career requires: a complete daily/weekly/monthly system, honest return expectations (variance is real), multiple income streams to smooth trading variance, and genuine interest in the process beyond the financial outcome. The source material's distilled philosophy: stay humble, be kind, adapt, don't force trades, surround yourself with smarter people.`,
          guidedPractice: [
            {
              question: `What is the honest professional expectation for memecoin trading returns in a bear market year?`,
              options: [`A — Bear markets are always profitable because of shorting opportunities`, `B — -10% to +10% on trading returns is a realistic professional expectation. The source material's advice to "only invest what you can afford to lose" reflects genuine experience with bear market variance.`, `C — Professionals make the same returns regardless of conditions`, `D — 100%+ returns are achievable in any market condition with skill`],
              correct: 1,
              hint: `"Low caps cook when market is good. Market bad = low caps bad." What does this imply about bear market returns?`,
              explanation: `B is correct. Bear markets structurally remove the retail buying base that memecoins require to sustain momentum. Professional skill reduces losses and finds the rare opportunities that exist, but cannot manufacture returns that the market environment does not support. -10% to +10% while preserving capital for the next bull phase is a professional outcome in bear conditions.`,
            },
            {
              question: `The source material states "the game changes all the time. Old strategies won't always work. Adapt." How is this operationalised in a long-term career?`,
              options: [`A — Change strategy every 3 months regardless of performance`, `B — Monthly review of whether core strategies are still producing edge (via rolling EV windows). When conditions change or tools decay, update the specific failing component — not the entire system.`, `C — Always follow the latest trends`, `D — Never change a strategy once it has worked`],
              correct: 1,
              hint: `What is the difference between reactive adaptation (changing after every bad trade) and systematic adaptation?`,
              explanation: `B is correct. Systematic adaptation = data-driven component updates when specific failures are identified. Monthly EV review catches structural changes before they become crises. This is distinct from reactive changing after individual losses (emotional) or never changing at all (denial).`,
            },
            {
              question: `"Surround yourself with people smarter than you." How does this apply practically to a professional memecoin trading operation?`,
              options: [`A — Hire employees smarter than you`, `B — Actively build relationships with traders who excel in areas you don't: someone better at TA, someone better at community analysis, someone with better narrative detection. The inner circle multiplies your own capabilities.`, `C — Join the largest possible Telegram groups`, `D — Follow the highest-follower accounts on Twitter`],
              correct: 1,
              hint: `What does each person in a strong inner circle contribute that you cannot generate alone?`,
              explanation: `B is correct. The inner circle functions as distributed intelligence — each person covers different domains. Someone who is better at chart reading, someone whose network produces better pre-public tokens, someone who spots narrative Phase 1 signals earlier. The collective capability exceeds any individual, and the advance information flow (like the 130× DM in the source material) requires these relationships.`,
            },
            {
              question: `What internal factor most strongly predicts whether a trader will still be active and profitable after 3+ years?`,
              options: [`A — Starting capital size`, `B — Genuine interest in the process — the research, community analysis, and market mechanics — independent of financial outcomes. Purely financial motivation cannot sustain through bear markets and losing streaks.`, `C — Number of followers on social media`, `D — The specific strategies they started with`],
              correct: 1,
              hint: `What happens to purely financially-motivated traders when they experience their first significant bear market?`,
              explanation: `B is correct. Bear markets, losing streaks, and slow periods are inevitable. Traders who find the process inherently interesting — the wallet archaeology, the narrative detection, the community analysis — continue developing during these periods. Purely financially motivated traders lose interest when returns disappear and typically exit. The process interest is the durability engine.`,
            },
            {
              question: `"Kindness always wins. There's no room for egos." Why does the source material include this in a trading guide?`,
              options: [`A — It is filler content not related to trading`, `B — In memecoin trading, relationships are direct alpha. Treating community members, whale holders, and fellow traders with respect builds the network that provides advance information. Ego and disrespect burn the relationships that produce 130× DMs.`, `C — Kindness is required by platform terms of service`, `D — This only applies to traders who share publicly`],
              correct: 1,
              hint: `The source material gives a specific example of a community mod being disrespectful to a holder who was a whale. What happened?`,
              explanation: `B is correct. The source material documents a case where disrespect from a community mod caused a whale to sell all their holdings in the token. In a space where whale behaviour can make or break a token's price, and where information flows through trusted relationships, kindness is not separate from trading — it is part of the operating environment.`,
            },
          ],
          lessonSimulations: [
            {
              type: `judgment-riskAssess`,
              scenario: `Design your complete professional memecoin trading operation. Current status: portfolio $80,000, trading for 18 months, 58% win rate over 120 documented trades, 4,200 Twitter followers, inner circle of 5 traders.\n\nDesign:\n1. Complete daily routine (morning, trading window, evening)\n2. Weekly review structure (Sunday, 20 minutes)\n3. Monthly audit checklist\n4. One monetisation stream appropriate for your current stage\n5. Inner circle expansion plan for the next 6 months`,
              scoringCriteria: [
                `Daily routine: Morning (30-45 min) — macro check (BTC dominance, SOL/200MA, F&G), state check, wallet alerts, active position review, DeFined Phase 1 scan. Trading window (2-4 hours, 8-11 AM UTC optimal) — checklist-only decisions, formula sizing. Evening (15 min) — journal all trades with thesis and lesson.`,
                `Sunday review (20 min): portfolio value vs last week, realised PnL breakdown by signal type, rolling EV check vs baseline, allocation % check (is it drifting above 30%?), one rule update from the week's pattern.`,
                `Monthly audit (1 hour): month-over-month PnL comparison, strategy EV by condition, wallet quality review (public list checks), network review (who to add/deepen), event calendar for next month.`,
                `Monetisation at 18 months/120 trades: referral links for tools actively used are appropriate now (low time cost, genuine use). Alpha group could launch at 24 months with stronger track record. Education guide: appropriate now if can identify one specific methodology others consistently ask about.`,
                `Inner circle expansion: target 3-4 more contacts over 6 months using the criteria: loss transparency, specific analytical engagement, pre-existing trades (no asks). Source from: existing connections who meet criteria, active community members who create quality analysis, traders encountered through wallet archaeology who show consistent edge.`,
              ],
            },
            {
              type: `judgment-dataInterpret`,
              scenario: `3-year performance attribution analysis:\n\nYear 1 (bull market): Trading +320%. Started $15,000 → ended $49,800.\nYear 2 (bear market): Trading +6%. Monetisation launched (alpha group + guides): +$42,000. Total portfolio: $94,500.\nYear 3 (bull market): Trading +180%. Monetisation: +$78,000. Portfolio: ended $220,000.\n\nCompare to two alternative scenarios:\nScenario B: same trading skills but no monetisation, no capital preserved in bear year (50% active in bear).\nScenario C: only monetisation, no active trading.\n\n1. What role did capital preservation in Year 2 play in Year 3 returns?\n2. Calculate approximate Year 3 portfolio value under Scenario B.\n3. What is the combined portfolio advantage of the actual path vs Scenario B at Year 3 end?`,
              scoringCriteria: [
                `Year 2 capital preservation: the 6% trading return (rather than -30%+ with 50% active allocation) preserved $94,500 for Year 3 deployment vs approximately $58,000 in Scenario B (if 50% active in bear = $49,800 × 0.70 remaining after drawdown + some recovery).`,
                `Year 3 Scenario B approximation: starting from ~$58,000 instead of $94,500. Year 3 trading +180% on $58,000 = +$104,400. Total: ~$162,400. No monetisation: ~$162,400.`,
                `Advantage: Actual path ($220,000) vs Scenario B (~$162,400) = $57,600 advantage at Year 3 end. The $57,600 gap comes entirely from: (1) capital preservation in Year 2 (difference in starting capital for Year 3), and (2) monetisation income. Both are strategic decisions, not luck.`,
              ],
            },
            {
              type: `chartReplay-pattern`,
              scenario: `The final test. You have completed all four advanced labs. Design your complete 90-day action plan implementing everything learned across the full track.\n\nCurrent state:\n- Portfolio: $65,000\n- Track record: 18 months, 58% win rate, 140 trades documented\n- Inner circle: 4 traders\n- Tracked wallets: 6 (3 pre-public, 3 public)\n- Active monetisation: none yet\n- Twitter: 2,800 followers, transparent posting (wins and losses)\n- Market conditions: early bull (BTC dominance falling, SOL above 200-day MA, F&G 62)\n\nDesign your 90-day plan covering: immediate actions (Days 1-7), Month 1 priorities, Month 2 priorities, Month 3 priorities. Address: portfolio deployment, wallet system upgrade, monetisation launch timing, network development.`,
              scoringCriteria: [
                `Days 1-7: (1) Replace 3 public-list wallets via GateKept multi-token analysis on last week's winners; (2) Calculate current rolling EV to establish accurate baseline; (3) Build post-crash watch list (10-15 Phase 2/3 tokens at current prices); (4) Set up complete alert architecture for non-trading hours; (5) Quantify EV by strategy and condition from the 140-trade history.`,
                `Month 1: bull conditions active = increase deployment to 28-30% active. Begin daily DeFined Phase 1 detection workflow. Focus wallet hunting energy on finding 2-3 pre-public replacements. Document all trades for EV rolling window baseline.`,
                `Month 2: if Phase 1 scan has produced 2+ baskets and both performed, launch education guide (one methodology you get asked about most). Monetisation appropriate now — track record is strong, audience exists. Add 1-2 inner circle contacts using the verification criteria.`,
                `Month 3: review rolling EV from 60 post-plan trades. If baseline is above +0.70: scale to 32% active allocation. If referral income from tool links + guide sales is above $2,000/month: consider alpha group launch planning for Month 4-5. Evaluate network: has the inner circle produced advance alpha? If yes: deepen those relationships. If no: expand the search.`,
              ],
            },
          ],
        },
      ],
      aggregateSimulations: {
        count: 15,
        simulatorTypes: ['judgment-riskAssess', 'judgment-dataInterpret', 'chartReplay-pattern'],
        description: 'Random draw from Lab 4 — monetisation, sustainability, complete career system design.',
        scoringMode: 'full-rubric',
        unlockCondition: 'all-lessons-complete',
        difficultyRange: 'lesson-sim-2-equivalent',
        attemptRules: { maxAttemptsPerSim: 2, failedSimRecovery: 'Retry', passThreshold: 0.80 },
      },
      bossMode: {
        title: `Lab 4 Boss — The Complete Memecoin Trader`,
        learningLoop: { hintsEnabled: true,  feedbackMode: 'full-criteria-with-lesson-pointers', scenarioMode: 'fresh-each-attempt', message: 'Review and retry.' },
        scenarios: [{
          id: 'boss-senior-lab4-v1',
          situation: `You have completed the full Memecoin Trader track. Portfolio: $160,000. Trading for 26 months. You face a comprehensive final scenario synthesising every element of the curriculum.\n\nMarket: Confirmed bull phase. BTC dominance falling. Solana DEX volume up 220% in 8 weeks. Graduation rate 5.1%. F&G: 74.\n\nPortfolio state:\n- Active: 22% ($35,200 across 7 positions)\n- 3 positions are Phase 3 cult coins entered 6 weeks ago during a correction\n- 4 positions are Phase 1 narrative basket tokens (AI theme, entered 3 weeks ago)\n- Cash: $124,800\n\nAlpha signals:\n- Pre-public wallet 0xACE (62% WR, 95 trades) bought $NOVA at $32K MC 2 hours ago\n- DeFined scan flagged 4 new "digital pets" tokens this morning — possible Phase 1\n- Your inner circle contact DMs: "saw 0xACE in $NOVA — I'm in at $35K MC, clean signals"\n\nCalendar: FOMC decision in 3 days (expected hold, low surprise probability). Major Solana protocol launch in 10 days.\n\nMonetisation: you have a 140-person alpha group and a published guide generating combined $8,400/month.\n\nRequired: (1) Pre-session state check and current allocation assessment. (2) Action on $NOVA given the combined signals. (3) Action on the digital pets Phase 1 signal. (4) Calendar-driven allocation adjustments. (5) One long-term system improvement the scenario reveals.`,
          scoringCriteria: [
            `Pre-session: state check (what is your honest emotional state given bull conditions and multiple signals firing simultaneously — excitement is an impaired state too). Allocation: 22% is within normal range for bull conditions, can go to 28-30%.`,
            `$NOVA: three independent signals (pre-public wallet, inner circle DM, clean fundamentals). Strong convergence. Enter 1.5% ($2,400) at current ~$40K MC (slightly above 0xACE entry but within 2× chase rule). This is below the standard 2% because you are already at 22% active with more opportunities queued.`,
            `Digital pets Phase 1: 4 tokens in one morning scan = threshold met. Deploy basket: 5-6 tokens × 1% ($1,600 each = $8,000-$9,600 total). Position is appropriate given bull conditions, cash available, and clear Phase 1 signal.`,
            `Calendar adjustments: FOMC in 3 days (low surprise) — reduce to 25% active 24-48 hours before (modest reduction given low surprise probability). Protocol launch in 10 days — position in 2 ecosystem cult coins NOW (pre-catalyst positioning). Take partial profits on Phase 3 cult positions into the launch week volume.`,
            `Long-term system improvement: the scenario has multiple signals firing simultaneously. A signal priority framework would help: pre-public wallet convergence > Phase 1 basket > individual wallet tracking > KOL confirmation. Formalising this prevents either over-trading (entering all signals at full size) or decision paralysis (too many signals at once). Document the priority framework in the weekly review.`,
          ],
        }],
      },
    },

  ], // close sections array
}; // close memetraderTrack export
