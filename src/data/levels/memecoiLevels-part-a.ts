// ⚡ Sifter SkillUp — Memecoin Markets (Island 9, Levels 91–105)
// Part A of 2 — Levels 91–98
//
// L91–L94: carried from islands9_18Levels.ts (preserved exactly)
// L95–L98: generated to complete the island
// Chain: Solana Devnet (islandId=9)
// Simulators: memeTokenProfile, dexscreener, bundleDetector, lpSeed,
//             onchainAnalysis, memeExitStrategy, memePortfolioSize, solanaPump

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 91 — What Is a Memecoin? (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L91: IslandLevel = {
  id: 91, mechanic: 'match3', tier: 'pro',
  topic: 'What Is a Memecoin?',
  explanation: `In January 2021, Dogecoin — a 2013 joke token featuring a Shiba Inu dog — surged 15,000% in weeks on Reddit-driven attention. No product. No revenue. Just coordinated community belief and the self-reinforcing loop of viral spread.

Memecoins are tokens whose value derives entirely from community attention, cultural narrative, and the expectation that others will buy later. This makes them simultaneously the most transparent and most dangerous category in crypto — transparent because the value driver is explicit, dangerous because attention evaporates without warning.

The professional distinction: understanding memecoins is not the same as recommending them. They are worth studying because they reveal how financial markets respond to pure narrative — and because that knowledge protects you from manipulation.

Key vocabulary you need before anything else: market cap (all tokens × current price), fully diluted valuation or FDV (all tokens ever × price, including locked ones), liquidity (actual money in the trading pool — different from market cap), holders (unique wallets owning the token), and the bonding curve (the price formula used by launch platforms like pump.fun where each purchase raises the price slightly for the next buyer).

The critical rule before any memecoin entry: size positions at 1–2% of portfolio maximum. Most go to zero. The winners compensate, but only with disciplined position sizing.`.trim(),
  fact: 'Memecoins derive value entirely from community attention and narrative momentum — no product, no revenue, no fundamental floor. 97%+ fail within weeks. Position size max 1–2% per token.',
  plain: 'A coin whose price is driven entirely by memes, community, and hype — not by anything it does. Most fail completely. A small number produce big returns. Treat them like lottery tickets with a research filter.',
  stars: [390, 480, 600], target: 600, coins: 38,
  simulatorLesson: 'memeTokenProfile',
  examples: [
    { contextTag: '[First encounter]', scenario: 'Priya sees PEPE up 400% in 3 days and asks: "What makes this worth anything?"', outcome: 'The honest answer: PEPE is worth what someone will pay for it. It\'s a self-fulfilling attention loop. She sizes any position at 1% of portfolio, sets an exit plan before buying, and does not put money she cannot lose.' },
    { contextTag: '[Survival question]', scenario: 'James asks why Dogecoin survived 10+ years when 99% of memecoins failed.', outcome: 'DOGE was first (2013), received Elon Musk\'s consistent promotion, was listed everywhere, and had a decade to build genuine community identity. These conditions cannot be manufactured by launching "a coin like Doge" today.' },
    { contextTag: '[Sizing reality]', scenario: 'Keiko has $200 total to speculate with and asks if memecoins are right for her.', outcome: 'At $200, 2% per position = $4. The math doesn\'t work for meaningful participation. Memecoins make sense as 1–5% of a larger portfolio where winners\' gains can absorb the many losses. With $200 total, the cognitive overhead isn\'t worth it.' },
  ],
  keyTakeaway: 'Memecoins are pure narrative investments — value = community attention × momentum, no fundamental floor. Size positions at 1–2% maximum and define your exit before you enter.',
  guidedPractice: [
    { question: 'What is the primary driver of a memecoin\'s price?', options: ['Revenue from the underlying product or service', 'Community attention, viral narrative, and the expectation of more buyers', 'Quality of the development team and their roadmap', 'Security of the blockchain it runs on'], correct: 1, hint: 'What does a memecoin actually produce or offer?', explanation: 'Memecoins produce nothing. No revenue, no product, no cash flow. Price is driven entirely by community attention and the expectation that more people will want it. When attention shifts, there is no fundamental floor.' },
    { question: 'Why did Dogecoin survive when most memecoins fail?', options: ['It had better technology than others', 'First-mover status (2013), consistent celebrity promotion, and exchange listings over 10 years', 'The Dogecoin team continuously added new features', 'It converted to a utility token with real use cases'], correct: 1, hint: 'DOGE launched in 2013. What does time build that cannot be replicated?', explanation: 'Dogecoin was the first major joke coin, received Elon Musk\'s repeated promotion, was listed everywhere, and had 10 years to build genuine brand recognition. These conditions are historically unique — not replicable.' },
    { question: 'What does "liquidity" mean for a memecoin trading at $500K market cap?', options: ['$500K worth can be sold without affecting price', 'The actual amount you can sell depends on the pool — often far less than market cap', 'You can always sell 10% of market cap instantly', 'Market cap and liquidity are the same number'], correct: 1, hint: 'Market cap = all tokens × price. Liquidity = actual money in the trading pool.', explanation: 'A $500K market cap token may have only $15,000 in its liquidity pool. Selling $3,000 could drop price 20%. Market cap is theoretical; liquidity is what you can actually access without destroying price.' },
    { question: 'What is a bonding curve in pump.fun token launches?', options: ['A guarantee the token price always increases', 'A formula where each purchase slightly raises price — early buyers pay less, later buyers pay more', 'The schedule determining when developer tokens unlock', 'A chart pattern for predicting memecoin moves'], correct: 1, hint: 'Pump.fun price rises with every purchase. What drives this?', explanation: 'A bonding curve sets price based on quantity sold. Each token purchased increases the price for the next buyer. Early buyers get the lowest prices; late buyers pay the highest. At ~$69K market cap, the token graduates to Raydium.' },
    { question: 'What is the maximum portfolio allocation recommended per memecoin position?', options: ['10–20% — memecoins need meaningful allocation to matter', '25% — standard high-risk allocation', '1–2% — sized to survive a total loss without material portfolio damage', '5–10% — standard speculative allocation'], correct: 2, hint: 'Most memecoins go to zero. What allocation survives that?', explanation: '1–2% means a total loss on that position costs you 1–2% of your portfolio — survivable. At 20%, a total loss is catastrophic. Memecoin position sizing is not about optimism — it\'s about surviving the inevitable losses while staying in the game for the occasional winner.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 92 — Reading DEXScreener: The Five-Point Checklist (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L92: IslandLevel = {
  id: 92, mechanic: 'memory', tier: 'pro',
  topic: 'Reading DEXScreener: The Five-Point Checklist',
  explanation: `In March 2024, a Solana memecoin called BOME launched on pump.fun and reached $1B market cap in 3 days. Traders who identified it early used one key skill: reading DEXScreener data in the first 5 minutes after launch to separate genuine momentum from manufactured hype.

DEXScreener is the primary on-chain analytics tool for memecoin traders. It shows live trading data directly from blockchain transactions — price, volume, holder count, liquidity pool size, and transaction history. Unlike CoinMarketCap (which relies on self-reported data), DEXScreener reads blockchain state directly.

The five-point checklist for any new token — check these in order:

1. Liquidity pool size: is there enough to trade meaningfully? Under $10K = trap. $50K+ = viable.
2. Holder count and distribution: how many unique wallets own it? Top 10 holders combined % — under 30% is healthy.
3. Buy/sell ratio: more buys than sells in the last hour = accumulation. Extreme buy ratio can mean manipulation.
4. Transaction velocity: consistent small buys vs occasional huge buys. Organic buyers buy in varying amounts.
5. Liquidity age: how old is the LP? Under 5 minutes = maximum danger zone. 1+ hour with stable chart = better signal.

Complete this checklist in 90 seconds. If two or more red flags appear, move on. Hundreds of tokens launch daily — scarcity is not real.`.trim(),
  fact: 'DEXScreener reads live on-chain data: liquidity pool size, holder distribution, buy/sell ratio, transaction velocity, and LP age. Check all five in 90 seconds. Two red flags = move on.',
  plain: 'DEXScreener is your radar for new tokens. It shows real blockchain data — not self-reported numbers. The five-point checklist separates genuine launches from manufactured pumps.',
  stars: [455, 560, 700], target: 700, coins: 42,
  simulatorLesson: 'dexscreener',
  examples: [
    { contextTag: '[Quick rejection]', scenario: 'Marcus opens DEXScreener on a new Solana token: $4,200 liquidity, 12 holders, 94% buy ratio, all buys in same 30-second window, LP 2 minutes old.', outcome: 'Four red flags in 30 seconds: tiny liquidity, almost no holders, suspicious buy ratio, and fresh LP. Marcus closes the tab. 8 minutes later, the token crashes 97%. The checklist saved him from a rug.' },
    { contextTag: '[Genuine signal]', scenario: 'Amara sees a token: $180,000 liquidity, 340 holders, 68% buy ratio, varied buy sizes from $20–$2,000, LP 4 hours old with steady price action.', outcome: 'All five points pass: meaningful liquidity, genuine holder distribution, moderate buy bias, organic-looking transaction sizes, established LP. She does not guarantee it succeeds — but the risk profile is acceptable for a small position. She buys 1.5% of her portfolio.' },
    { contextTag: '[Manipulation detection]', scenario: 'Keiko sees a token with 800 holders but all transactions are exactly $247.13 each. Buy/sell ratio is 99% buys.', outcome: 'Coordinated bot activity: identical transaction amounts and extreme buy ratios are the fingerprint of automated scripts simulating organic buying. Real humans buy in irregular amounts. She avoids it despite the high holder count — the metric was manufactured.' },
  ],
  keyTakeaway: 'The DEXScreener five-point checklist — liquidity size, holder distribution, buy/sell ratio, transaction velocity, and LP age — takes 90 seconds and eliminates the majority of traps before you risk capital.',
  guidedPractice: [
    { question: 'A token has $8,000 liquidity and $2M market cap. What does this mean for your $500 trade?', options: ['You can exit easily — $500 is small relative to $2M market cap', 'Selling $500 into an $8,000 pool causes ~6% price impact — your exit will cost you significantly', 'The $2M market cap guarantees $8,000 minimum liquidity at all times', '$500 is too small to matter in either direction'], correct: 1, hint: 'Impact = trade size ÷ pool size. $500 ÷ $8,000 = ?', explanation: '$500 ÷ $8,000 = 6.25% price impact. You receive approximately $469 for your $500 position — before fees. In a thin pool, you are competing with everyone else trying to exit. Simultaneous exits cascade: each sale pushes price lower for the next seller.' },
    { question: 'What does a 99% buy ratio on DEXScreener suggest?', options: ['Extremely strong organic demand — a genuine breakout', 'Possible bot or coordinated buying to create artificial FOMO — real markets have both buyers and sellers', 'The sell function is broken in the contract', 'Market makers are providing liquidity artificially'], correct: 1, hint: 'Real markets always have both buyers and sellers. What does 99% buys suggest about sellers?', explanation: 'Markets with genuine participation always have some sellers — profit takers, people who changed their minds, arbitrageurs. A 99% buy ratio means almost no one is selling — which is unusual in organic markets and often indicates bot activity buying to create the appearance of FOMO.' },
    { question: 'Why does liquidity pool age matter when evaluating a new token?', options: ['Older LPs charge higher fees', 'LP age indicates how long the token has survived — very new LPs (under 5 min) are in the maximum rug-pull danger window', 'Tokens with older LPs are ineligible for exchange listings', 'DEXScreener cannot read data from pools under 1 hour old'], correct: 1, hint: 'When do most rug pulls happen relative to launch?', explanation: 'Most rug pulls occur within the first few minutes of launch — the dev creates the pool, attracts buyers, then drains the liquidity. A 2-minute-old LP has survived only 2 minutes of potential attacks. A 4-hour-old LP with stable price action has survived thousands of potential exit points. Age is a proxy for survival.' },
    { question: 'You see 340 holders on DEXScreener. Top 10 wallets hold 72% of supply. Is this healthy?', options: ['Yes — 340 holders is strong community size', 'No — 72% in top 10 means 10 wallets can crash the price whenever they choose to sell', 'The holder count is more important than concentration', 'Concentration only matters above 90%'], correct: 1, hint: 'What happens when the top 10 (who hold 72%) decide to sell simultaneously?', explanation: '72% in 10 wallets means those 10 wallets control price. If even 5 of them sell simultaneously, they dump 36% of supply into the market — collapsing price. Healthy holder distribution: top 10 under 30%, ideally under 20%. 340 total holders sounds good until you realize 10 of them hold nearly three-quarters of all tokens.' },
    { question: 'What does "transaction velocity" tell you that price alone does not?', options: ['Higher velocity always means higher future price', 'The pattern of buys (consistent small amounts vs occasional huge buys) reveals whether buying is organic or coordinated', 'Velocity determines when the LP lock expires', 'It shows how many exchanges have listed the token'], correct: 1, hint: 'Organic humans buy differently than bots. What patterns separate them?', explanation: 'Organic buyers purchase in irregular amounts at irregular intervals ($127, $43, $890, $12, $2,300...). Bot activity appears as identical or pattern-based amounts at regular intervals ($247.13, $247.13, $247.13...). Velocity also shows momentum: 50 transactions in the last 5 minutes vs 50 transactions in the last 2 hours tells you very different things about current interest.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 93 — Bundle Detection and Coordinated Launches (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L93: IslandLevel = {
  id: 93, mechanic: 'chain', tier: 'pro',
  topic: 'Bundle Detection and Coordinated Launches',
  explanation: `In February 2024, on-chain researchers identified a pattern: the top 20 wallets of a newly launched Solana token had all been funded from the same source wallet 11 minutes before launch. All 20 bought within the first 4 seconds. This was not organic discovery — it was coordinated insider pre-buy.

Bundling refers to coordinated wallet groups that participate in a token launch together. The "bundle" is the set of transactions submitted simultaneously or in rapid sequence from related wallets. Detection requires tracing wallet funding sources and identifying patterns invisible to casual observers.

Three bundle patterns to recognise:

Funding source bundles: multiple wallets funded from the same parent wallet before launch. Check on Solscan — trace each early buyer's wallet back one transaction. If they all share a common funder, they share a common controller.

Timing bundles: 10+ wallets buy within the same 2-second window at launch. Even if individually funded, simultaneous execution requires coordination — no unrelated humans react identically in 2 seconds.

Sniper bundles: the first 5–10 transactions of a token are all from wallets that have never interacted before and never interact again. Created specifically for this launch, used once, discarded.

The implication: if 15–20 wallets collectively own 40–60% of supply and are coordinated, they will exit as a group too — collapsing price simultaneously. Knowing a token is bundled does not mean avoid (some bundled tokens still run), but it means the risk profile is fundamentally different.`.trim(),
  fact: 'Bundle detection traces early buyer wallets to a common funding source or simultaneous transaction timing. Coordinated wallets owning 40–60% of supply will exit as a group. Knowing this changes your risk assessment.',
  plain: 'Bundle detection = finding out if the early buyers all work together. If they do, they\'ll sell together too. That\'s the rug. Check Solscan: trace every big early wallet back one transaction to see if they share a source.',
  stars: [520, 640, 800], target: 800, coins: 46,
  simulatorLesson: 'bundleDetector',
  examples: [
    { contextTag: '[Funding source trace]', scenario: 'James finds a new Solana token. He opens Solscan, checks the top 5 early buyers, traces each wallet back one transaction. All 5 received SOL from the same wallet address at 14:32 UTC. The token launched at 14:43 UTC.', outcome: 'Same funding source, 11 minutes before launch. These are controlled wallets — the launcher pre-loaded them and bought across multiple wallets to look like organic demand. James knows these wallets hold an estimated 35% of supply and will exit together. He watches but doesn\'t enter.' },
    { contextTag: '[Timing bundle]', scenario: 'Amara checks a token\'s transaction log. Transactions 1–12 all occurred within a 1.8-second window at launch. The wallets have no prior transaction history.', outcome: 'Timing bundle + fresh wallets = classic sniper operation. No 12 unrelated humans discover and buy a token within 1.8 seconds. These are bots, either controlled by the dev or by snipers watching for new launches. Either way, these early holders have the lowest cost basis and will sell into any pump. Amara skips.' },
    { contextTag: '[Partial bundle — still tradeable]', scenario: 'Marcus finds a token where 3 of the top 20 wallets share a funding source (holding 8% combined), but the other 17 wallets (holding 32% combined) appear independently funded with varied amounts and timing.', outcome: 'Partial bundle: 8% coordinated, 32% apparently organic. The risk from the 3 coordinated wallets is manageable — they can dump 8%, painful but survivable if the token has momentum. He enters a small position, sets a stop mentally at 30% below his entry, and watches for the inevitable coordinated sell from those 3 wallets.' },
  ],
  keyTakeaway: 'Bundle detection — tracing early buyer wallets to common funding sources or simultaneous timing — reveals coordinated insider groups that will exit together, fundamentally changing the risk profile of any memecoin position.',
  guidedPractice: [
    { question: 'The top 8 holders of a new token all received their initial SOL from the same wallet address 15 minutes before launch. What does this tell you?', options: ['The token has strong community backing — one supporter funded early believers', 'All 8 wallets are controlled by the same entity — they collectively hold insider supply and will exit as a coordinated group', 'Common funding is normal — exchanges often fund multiple users simultaneously', 'The token is safer because one accountable person is behind all wallets'], correct: 1, hint: 'Who has the power to send SOL from a wallet? How many people control one wallet?', explanation: 'One wallet = one private key = one controller. If 8 wallets were all funded from the same source, one person (or coordinated group) controls all 8. They bought across 8 wallets to simulate organic demand. When they exit, all 8 sell simultaneously. Their combined holdings (often 30–50% of supply) hit the market as a single coordinated dump.' },
    { question: 'Transactions 1–15 of a new token all occur within a 2-second window. What explains this?', options: ['Extremely high organic demand — the token was perfectly marketed pre-launch', 'Automated bots executing simultaneously — no unrelated humans react identically within 2 seconds', 'The blockchain records transactions in batches, making them appear simultaneous', 'DEXScreener timestamps are inaccurate for the first minute after launch'], correct: 1, hint: 'How fast can a human react, open a browser, connect wallet, and execute a trade?', explanation: 'Human reaction time is 200–300ms minimum. Opening a browser, connecting a wallet, entering an amount, and confirming a transaction takes at minimum 10–30 seconds for an experienced user. 15 transactions in 2 seconds from 15 separate wallets requires automation. These are bots — either the dev\'s own sniper wallets or third-party snipers watching for new launches.' },
    { question: 'A bundled wallet group holds 45% of a token\'s supply. The token is currently 5× from launch. What is the primary risk?', options: ['The token cannot pump further because 45% is already at profit', 'Coordinated exit: all 45% can hit the market simultaneously, collapsing price far faster than organic selling', 'The 45% creates price stability — large holders don\'t want their own investment to crash', 'Bundled wallets are legally required to disclose before selling'], correct: 1, hint: 'What happens to price when 45% of supply is sold at once?', explanation: 'If 45% of supply enters the market simultaneously, the liquidity pool cannot absorb it without catastrophic price collapse. Organic selling trickles — individual sellers making individual decisions. Coordinated selling is a single decision affecting 45% of supply. The price impact is proportionally devastating. This is why knowing bundle % is as important as knowing the price chart.' },
    { question: 'How do you check if early buyers share a funding source on Solana?', options: ['Use the DEXScreener "bundle check" feature in the advanced tab', 'Open Solscan, click each early buyer wallet, view their transaction history — trace the first transaction that funded their SOL balance', 'Email Solana Foundation with the token address for a security report', 'Check if wallet creation dates are within 24 hours of launch'], correct: 1, hint: 'Where does SOL come from before it can be used?', explanation: 'Every Solana wallet needs SOL to pay gas. Before a coordinated launch, the controller sends SOL to each of their wallets. On Solscan, click a suspicious wallet → view all transactions → the first incoming SOL transaction shows the funding source. If multiple early buyer wallets trace to the same funder, they\'re controlled. This takes 2–3 minutes to check 5–10 wallets.' },
    { question: 'You detect a partial bundle: 4 wallets share a funding source (12% of supply), while 16 other early wallets appear independently funded (38% of supply). How does this change your approach vs a full bundle?', options: ['Partial bundles are safe — only full bundles are dangerous', 'The 12% coordinated risk is manageable with appropriate position sizing; the 38% organic holding provides real price support, making a small position more defensible', 'Partial bundles always perform better than fully bundled tokens', 'Ignore it — concentration matters more than funding source'], correct: 1, hint: 'What is the maximum damage if the 12% exits simultaneously?', explanation: 'A 12% coordinated dump is significant but survivable if the token has organic momentum. Compare to a 45% dump from a full bundle — catastrophic. The 38% organic holders act as real price support (they make independent decisions, so exits are staggered). A partial bundle changes risk from "inevitable coordinated collapse" to "one painful event amid ongoing organic trading." Position size accordingly: smaller entry, wider stop.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 94 — Liquidity Pools and Price Impact on New Tokens (preserved)
// ─────────────────────────────────────────────────────────────────────────────

const L94: IslandLevel = {
  id: 94, mechanic: 'memory', tier: 'pro',
  topic: 'Liquidity Pools and Price Impact on New Tokens',
  explanation: `In May 2021, the Shiba Inu token had a $10B market cap with $30M in liquidity. The LP/MC ratio: 0.3%. Anyone attempting to sell more than a few hundred thousand dollars would have collapsed the price against themselves. The market cap figure was technically accurate — and functionally meaningless for large exits.

Every DEX trade happens against a liquidity pool — a reserve of two tokens locked in a smart contract. For a SOL/NEWTOKEN pool, one side is SOL (the trading currency) and the other is NEWTOKEN. The pool's pricing formula is x*y=k: the product of both sides must always equal a constant. When you buy NEWTOKEN, you add SOL and remove NEWTOKEN — changing the ratio and raising the price.

Price impact is the difference between the expected price and the actual executed price, caused by this ratio shift. On a $1M pool, a $1,000 trade causes 0.1% price impact. On a $10,000 pool, a $1,000 trade causes 10% impact.

The LP/MC ratio tells you how much of the theoretical market cap is actually liquid. A 5% ratio means 5% of market cap is accessible as real exits. A 0.3% ratio means you are looking at a nearly illiquid ghost market.

Before entering any memecoin position, calculate: what percentage of the liquidity pool is your position size? If it's over 2%, your exit will be significantly worse than the current price.`.trim(),
  fact: 'Price impact = trade size ÷ pool size. LP/MC ratio = liquidity ÷ market cap — the percentage of market cap that is actually liquid. Under 1%: functionally illiquid. Your position as % of pool determines your actual exit cost.',
  plain: 'The liquidity pool determines actual exit ability, not market cap. Check LP/MC ratio — under 1% means you may be unable to exit without destroying the price. Calculate your position as a % of the pool before entering.',
  stars: [585, 720, 900], target: 900, coins: 50,
  simulatorLesson: 'lpSeed',
  examples: [
    { contextTag: '[LP/MC reality check]', scenario: 'Priya sees a token: $2M market cap, trending on Twitter, up 300% today. She checks DEXScreener: $18,000 liquidity pool.', outcome: 'LP/MC = $18,000 / $2,000,000 = 0.9%. If Priya buys $500, she adds to the pool. If she tries to sell $500 into an $18,000 pool, that\'s 2.8% of the pool — roughly 2.8% price impact. But if everyone else is also trying to sell, the pool is actively shrinking. She calculates her realistic exit first.' },
    { contextTag: '[Position sizing with pool math]', scenario: 'Marcus has $3,000 to deploy. Token has $45,000 liquidity pool. He wants to put in $3,000 — but checks the pool math first.', outcome: '$3,000 ÷ $45,000 = 6.7% of the pool. Buying 6.7% of a pool causes approximately 6.7% price impact just on entry — he effectively pays 6.7% more than the displayed price. He reduces his position to $900 (2% of pool), accepts a ~2% entry impact, and knows a 2% pool exit is painful but survivable.' },
    { contextTag: '[Cascade selling]', scenario: 'Keiko holds $1,500 in a token. The dev team announces they are stepping back. Three other large holders start selling simultaneously.', outcome: 'First seller dumps $2,000 into a $15,000 pool — drops price 13%. Second seller faces a $13,000 pool and dumps $1,500 — drops another 11.5%. Third seller faces $11,500 pool. By the time Keiko sells her $1,500, the pool is around $8,000 and she receives about $1,200 instead of $1,500. The cascade reduced everyone\'s exit by 20–30%. Thin pools punish simultaneous exits exponentially.' },
  ],
  keyTakeaway: 'LP/MC ratio reveals actual exit liquidity — under 1% is functionally illiquid despite the market cap figure. Calculate your position as a percentage of the pool before entering; over 2% means significant price impact on exit.',
  guidedPractice: [
    { question: 'A memecoin has $500K market cap and $3,000 liquidity pool. LP/MC ratio?', options: ['16.7%', '0.6%', '60%', '6%'], correct: 1, hint: '$3,000 ÷ $500,000 = ?', explanation: '$3,000 / $500,000 = 0.006 = 0.6%. Dangerously illiquid. The $500K market cap is nearly theoretical — you can realistically access only a few thousand dollars without catastrophic price impact.' },
    { question: 'You buy $500 into a $5,000 liquidity pool. Approximate price impact?', options: ['1%', '5%', '10%', '50%'], correct: 2, hint: 'Price impact ≈ trade size ÷ pool size.', explanation: '$500 / $5,000 = 10%. Your single trade moved price approximately 10% against you. You effectively paid 10% more than the displayed price — $50 of loss purely from execution.' },
    { question: 'Why is selling into a thin pool more dangerous than buying?', options: ['Selling fees are higher than buying fees', 'Each sell drops price, making simultaneous exits cascade — each seller gets a worse price than the last', 'Selling requires waiting for buyer confirmation', 'Pools prevent selling more than 5% of supply at once'], correct: 1, hint: 'If your sell drops price 10%, what happens to the next seller?', explanation: 'In thin pools each sell drops price. During a crash, multiple people try to exit simultaneously — each subsequent seller gets progressively worse price. This cascade explains why memecoins can drop 90% in minutes.' },
    { question: 'What LP/MC ratio indicates a token has reasonable exit liquidity?', options: ['0.5%+', '2–10%+', '50%+', 'Any ratio above 0%'], correct: 1, hint: 'Need enough liquidity to sell a meaningful position without catastrophic impact.', explanation: '2–10%+ LP/MC means you can exit reasonable positions without extreme price impact. Under 1% means even small positions are difficult to exit. Under 0.3% and the market cap figure is essentially meaningless.' },
    { question: 'You have a $2,000 memecoin position. Liquidity pool is $20,000. Approximate exit loss to price impact?', options: ['$20 (1%)', '$200 (10%)', '$0 (DEX exits are free)', '$1,000 (50%)'], correct: 1, hint: '$2,000 / $20,000 = 10% of pool. What does selling 10% of pool cause?', explanation: 'Selling $2,000 into a $20,000 pool causes ~10% price impact. You receive approximately $1,800 rather than $2,000 — a $200 loss to execution before fees. This is why knowing pool depth before entry is non-negotiable.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 95 — On-Chain Analysis: Reading Wallets Like a Pro
// ─────────────────────────────────────────────────────────────────────────────

const L95: IslandLevel = {
  id: 95, mechanic: 'chain', tier: 'pro',
  topic: 'On-Chain Analysis — Reading Wallets Like a Pro',

  explanation: `In 2023, a crypto researcher noticed a wallet that had bought BONK at launch, WIF three days after launch, and MYRO two days after launch — all before they went viral. The wallet was not lucky. It was skilled. The researcher began tracking it. Every purchase the wallet made was a real-time signal about where attention was moving.

On-chain analysis for memecoin trading means reading blockchain transaction data to understand who is buying, when they bought, and what their track record looks like. Two tools dominate: Nansen (labels known wallets — exchanges, whales, smart money) and CIELO (Solana-native wallet tracker that follows wallets across time).

The core technique: identify wallets with a strong track record of early memecoin entries. Follow them. When they buy something new, investigate it immediately. This is called "smart money tracking" — not blindly copying, but using informed wallets as a discovery signal.

What to check on any wallet you want to follow: win rate on last 30 trades, average hold time, position sizes relative to their portfolio, whether they are currently holding or exiting. A wallet that is still holding is a very different signal from a wallet that bought yesterday and already sold 80%.

Solscan (Solana's block explorer) shows every transaction: token purchases, sales, transfers, approvals. Reading this data turns the blockchain from a ledger into a map of where informed money is moving.`.trim(),

  fact: 'Smart money tracking uses tools like Nansen and CIELO to follow wallets with proven early-entry track records. A wallet\'s current holdings, win rate, and position size changes are real-time signals about memecoin momentum.',
  plain: 'Find wallets that are consistently early to good memecoins, then track what they buy next. Not to blindly copy — to use as a discovery signal to investigate further.',
  stars: [650, 800, 1000], target: 1000, coins: 54,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Wallet discovery process]',
      scenario: 'Amara finds a wallet (call it Wallet A) that bought BONK at $50K market cap, WIF at $200K market cap, and MYRO at $80K market cap — all before 10× moves. She wants to track it.',
      outcome: 'She adds Wallet A to CIELO\'s watchlist. CIELO sends a notification when Wallet A buys. She receives an alert: Wallet A bought 450 SOL worth of a new token "PNUT" at $120K market cap. She opens Solscan, runs the five-point checklist, checks for bundles. Clean signals. She buys 1.5% of her portfolio. The wallet\'s track record is signal — not guarantee. She still does her own check.',
    },
    {
      contextTag: '[Reading a wallet\'s exit signals]',
      scenario: 'Marcus tracks a smart money wallet that bought a token last week. Today, he sees on Solscan that the wallet sold 60% of its position.',
      outcome: 'A partial exit by a tracked smart wallet is a soft sell signal. The wallet is taking profit — it believes the risk/reward has changed. Marcus does not panic-sell immediately (smart money exits are also imperfect), but he raises his mental stop-loss and reduces his own position by 30%. Watching exit behaviour is as valuable as watching entry behaviour.',
    },
    {
      contextTag: '[Avoiding the copy-paste trap]',
      scenario: 'Keiko discovers a wallet with a 90% win rate over 50 trades. She decides to copy every trade automatically, with no additional research.',
      outcome: 'Dangerous. Win rate on past trades does not guarantee future performance. The wallet may be running a coordinated operation where they pump tokens they already own, then the "smart money" signal brings in followers who provide exit liquidity. She uses the wallet as a discovery signal only — then independently evaluates each token with her own checklist before entering.',
    },
  ],

  keyTakeaway: 'On-chain wallet tracking (Nansen, CIELO, Solscan) reveals where informed money is moving in real time — use smart money wallets as discovery signals, not copy-paste instructions, and always apply your own checklist.',

  guidedPractice: [
    {
      question: 'What is "smart money tracking" in the context of memecoin analysis?',
      options: [
        'Using AI algorithms to predict memecoin prices from chart patterns',
        'Identifying wallets with strong early-entry track records and using their new purchases as discovery signals to investigate further',
        'Following the investment strategy of traditional hedge fund managers',
        'Tracking the total market cap of all memecoins to identify macro trends',
      ],
      correct: 1,
      hint: 'Smart money = wallets that are consistently early. What do you do with that information?',
      explanation: 'Smart money tracking identifies wallets with proven records of early, profitable memecoin entries. When these wallets buy something new, it is a signal worth investigating — not automatically copying. You use the signal to discover tokens worth analysing, then apply your own checklist. The wallet\'s track record suggests informed conviction; your checklist confirms or rejects the opportunity.',
    },
    {
      question: 'A tracked smart money wallet bought a token yesterday and has already sold 75% of its position today. What does this signal?',
      options: [
        'Strong conviction — the wallet is rotating into a better position',
        'The wallet has lost confidence or is taking profit — a soft sell signal worth noting in your own risk management',
        'The wallet made a technical error and is correcting it',
        'This is normal behaviour — smart wallets always sell 75% on day 2',
      ],
      correct: 1,
      hint: 'Why would a wallet sell 75% of a position within 24 hours?',
      explanation: 'Selling 75% within 24 hours indicates the wallet is taking substantial profit or has changed its view on the trade. Neither is guaranteed to apply to your situation — the wallet may have a different cost basis, different portfolio size, or different time horizon than you. But it is a meaningful data point: the person who was confident enough to buy yesterday is now confident enough to take most of their profit today.',
    },
    {
      question: 'What is the risk of blindly copying every trade made by a wallet with a 90% win rate?',
      options: [
        'No risk — a 90% win rate is statistically proven to be reliable',
        'The wallet may be the creator or coordinated pump operator — your "copy" provides exit liquidity for them as they sell into your buy',
        'You will pay higher fees by following rather than leading',
        'CIELO charges premium fees for copy-trading functionality',
      ],
      correct: 1,
      hint: 'What if the wallet\'s 90% win rate is because they own the tokens before promoting them?',
      explanation: 'A coordinated operation: the wallet accumulates a token early, then their wallet\'s buy activity (visible on-chain) attracts copy-traders. The copy-traders\' buying creates the pump the wallet needs to exit profitably. The wallet\'s 90% win rate is partly because copy-traders provide their exit liquidity. Blindly following without understanding the wallet\'s actual strategy can make you a tool for someone else\'s profit.',
    },
    {
      question: 'What information does Solscan provide that DEXScreener does not?',
      options: [
        'DEXScreener and Solscan show identical information from different interfaces',
        'Solscan shows individual wallet transaction histories — every token bought, sold, and transferred — enabling wallet-level research that DEXScreener\'s token-focused view does not provide',
        'Solscan shows price predictions based on on-chain data',
        'Solscan only works for tokens over $1M market cap',
      ],
      correct: 1,
      hint: 'DEXScreener focuses on tokens. What does Solscan focus on?',
      explanation: 'DEXScreener shows token-level data: price, liquidity, holder count, transaction velocity. Solscan (a block explorer) shows wallet-level data: every transaction a specific address has ever made, what tokens they hold currently, when they bought and sold, how much. This wallet-level view is what enables smart money tracking — you can evaluate a wallet\'s entire history, not just its current position.',
    },
    {
      question: 'You want to evaluate a wallet as a reliable "smart money" signal. What metrics matter most?',
      options: [
        'Their total SOL balance — larger wallets are more reliable',
        'Win rate on last 30 trades, average hold time, typical position size, and whether they are currently holding or exiting their tracked tokens',
        'How many Twitter followers the wallet\'s owner has',
        'Whether the wallet has been active for more than 2 years',
      ],
      correct: 1,
      hint: 'What tells you if a wallet is actually skilled at early entries vs just lucky once?',
      explanation: 'Win rate across many trades (not just one) demonstrates consistent skill. Average hold time tells you if they are scalpers (hours) or trend followers (days/weeks) — different signals for different strategies. Position size relative to portfolio shows conviction level. Current holding status tells you if the signal is still active: a wallet that bought 3 days ago and has not sold yet has different implications than one that has already exited 80%.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 96 — Exit Strategy: When and How to Sell
// ─────────────────────────────────────────────────────────────────────────────

const L96: IslandLevel = {
  id: 96, mechanic: 'match3', tier: 'pro',
  topic: 'Exit Strategy — When and How to Sell',

  explanation: `In April 2024, a trader held a Solana memecoin that had gone 40× from his entry. He had no exit plan. He watched it go to 50×, then 45×, then 35×, then 20×. He sold at 18×. His friend, who had entered at the same time and sold 30% at 10×, 30% at 20×, and kept 40% as a "moonbag," ended up with a better average exit than 18×. The difference: one had a plan, one did not.

Staged exits — selling portions of your position at predetermined price targets — are the professional standard for memecoin trading. The logic: you cannot know the top. Selling fractions along the way guarantees partial profits regardless of where the peak is.

A simple framework: sell 25% of your position at 3×, sell another 25% at 5–10×, and let the remaining 50% ride as your "moonbag" — a position sized so that even if it goes to zero, you have already secured meaningful profit.

The moonbag concept: once you have sold enough to cover your initial investment and some profit, the remaining tokens cost you nothing psychologically. You can hold without anxiety because you have already won. This changes the emotional dynamic of holding.

Stop-loss discipline: define a maximum loss before entering. Common rule — exit if the token drops 30–40% from your entry. This prevents the most common memecoin outcome: watching a 3× position turn back into a 0.5× because you could not admit the trade was over.`.trim(),

  fact: 'Staged exits — selling 25% at 3×, 25% at 5–10×, holding 50% as a moonbag — guarantee partial profits regardless of where the peak is. Define your exit plan before entering; the moment of entry is the moment of maximum clarity.',
  plain: 'Sell in stages, not all at once. Take some profit at 3×, more at 5–10×, and let the rest ride for free. Set a stop-loss before you buy. Never hold waiting for "just a bit more" without a plan.',
  stars: [715, 880, 1100], target: 1100, coins: 58,
  simulatorLesson: 'memeExitStrategy',

  examples: [
    {
      contextTag: '[Staged exit execution]',
      scenario: 'Priya buys 1,000 SOL worth of a token (2% of her 50,000 SOL portfolio). She sets her plan: sell 250 SOL worth at 3×, sell 250 SOL worth at 7×, hold 500 SOL worth as moonbag.',
      outcome: 'Token hits 3×: she sells 250 SOL worth, receives 750 SOL. Token hits 7×: she sells 250 SOL worth, receives 1,750 SOL. Token then dumps 90%. Her moonbag (500 SOL worth at entry, now worth ~350 SOL at 7× entry with 90% dump) is worth about 3,500 SOL × 0.1 = 350 SOL. Total out: 750 + 1,750 + 350 = 2,850 SOL from a 1,000 SOL entry. Without the plan, she might have held through the dump and exited at 18× with nothing staged — or worse, 0.5× on the way down.' },
    {
      contextTag: '[Stop-loss enforcement]',
      scenario: 'Marcus buys a memecoin at $0.0012. Sets mental stop at $0.00084 (30% below entry). Token drops to $0.00082 — below his stop.',
      outcome: 'He executes the stop. Painful: he is down 32%. Three days later, the token is at $0.0002 — an 83% loss from his entry. His stop-loss saved him from an 83% drawdown. This is the purpose: stops exist for the 80% scenario, not the 20% where the token would have recovered. Executing a stop is not failure — it is the strategy working.' },
    {
      contextTag: '[Moonbag psychology]',
      scenario: 'Keiko buys $500 of a token. It goes 4×. She sells $300 worth (recovering her initial $500 + $700 profit). Now holds $700 worth of tokens at current price.',
      outcome: 'Her moonbag cost her nothing — she has already recovered her initial $500 and has $700 profit in hand. If the moonbag goes to zero: she still made $700 net. If it goes another 10×: she makes $7,000 on top of the $700 already secured. The zero-cost moonbag eliminates the psychological pressure of holding — she no longer needs it to work. This is why staged exits produce better average outcomes than all-or-nothing.' },
  ],

  keyTakeaway: 'Staged exits (sell portions at 3×, 5–10×, moonbag the rest) guarantee partial profits at every target. Define your exit plan and stop-loss before entering — clarity is highest at entry, not during a 90% dump.',

  guidedPractice: [
    {
      question: 'What is the primary advantage of staged exits over selling your entire position at once?',
      options: [
        'Staged exits reduce trading fees by spreading transactions over time',
        'You cannot predict the exact top, so selling portions at multiple targets guarantees partial profits regardless of where the peak occurs',
        'Staged exits are required by most DEXes for positions over $10,000',
        'Selling in stages delays tax obligations across multiple financial years',
      ],
      correct: 1,
      hint: 'If you could predict the exact top, selling all there would be optimal. But can you?',
      explanation: 'No trader can consistently identify the exact peak. Staged exits solve this by removing the need to be exactly right. By selling 25% at 3×, you lock in that profit even if the token only reaches 3.1× before dumping. By selling another 25% at 7×, you capture that gain even if the token never reaches 10×. The remaining moonbag captures unlimited upside. Multiple targets beat one perfect prediction because perfect predictions do not exist.',
    },
    {
      question: 'What is a "moonbag" and why does it change the psychology of holding?',
      options: [
        'A small initial buy designed to test whether a token is safe before deploying full capital',
        'The portion of a position held after recovering your initial investment — it costs nothing psychologically because profit is already secured',
        'A bag of tokens purchased during the full-moon phase for luck',
        'The maximum position size recommended for speculative tokens',
      ],
      correct: 1,
      hint: 'What is your psychological state when holding something that "costs nothing"?',
      explanation: 'Once staged exits have returned your initial investment plus profit, the remaining tokens represent pure upside. You cannot lose money you have already taken off the table. This changes holding from an anxious "I need this to work" to a relaxed "this is free exposure." Psychologically, zero-cost holdings are held more patiently and sold less impulsively — exactly the right behaviour for the portion most likely to produce extraordinary returns.',
    },
    {
      question: 'You set a 30% stop-loss before buying a memecoin. It triggers. The token recovers 15% after you exit. Was the stop-loss a mistake?',
      options: [
        'Yes — you exited at exactly the wrong time, proving stop-losses are unreliable',
        'No — stop-losses are designed for the scenarios where the token continues falling. This 15% recovery is in the minority of cases; the majority of 30% drops continue much lower',
        'Yes — you should wait for 50% drops before stopping out of memecoins',
        'No — but you should immediately re-enter to recapture the missed recovery',
      ],
      correct: 1,
      hint: 'Stop-losses exist for when the drop continues. How often do memecoins recover after a 30% drop vs continue falling?',
      explanation: 'A stop-loss triggered at -30% that is followed by a 15% recovery feels like a mistake in hindsight. But stop-losses are evaluated across all the times they trigger, not just this one instance. In memecoins, the majority of 30% drops continue to 60%+, not recover. If you remove your stop-loss because of the occasional recovery, you will eventually hold a position from -30% all the way to -95%. The stop-loss\'s purpose is protecting against the more common, more damaging outcome.',
    },
    {
      question: 'Why should you define your exit plan and stop-loss before entering a memecoin, not after?',
      options: [
        'DEXes require pre-set exit plans for compliance reasons',
        'Clarity is highest before entry — once in a trade, emotional bias (FOMO, loss aversion) distorts judgment and makes rational exit decisions harder',
        'Pre-defined exits are tax-advantaged in most jurisdictions',
        'Entry-time planning is a legal requirement for Solana-based tokens',
      ],
      correct: 1,
      hint: 'When are you more rational: before or after you have money at stake?',
      explanation: 'Before entry, you have no position — your judgment is unbiased by fear of loss or greed for gain. After entry, cognitive biases activate: loss aversion (holding a loser hoping to break even), sunk cost fallacy (can\'t sell because I\'ve already lost X), and recency bias (last token recovered, so this will too). The pre-entry plan is a commitment device: you make the rational decision now, binding yourself to execute it even when emotion argues otherwise.',
    },
    {
      question: 'You enter a memecoin with $1,000. Your staged exit plan: sell $250 at 3×, sell $250 at 7×, hold $500 as moonbag. The token hits 3× but you hesitate, thinking "it might go straight to 10×." What is the correct action?',
      options: [
        'Hold everything — executing partial exits too early reduces potential maximum return',
        'Execute the plan: sell $250 at 3× as planned. The plan was made with clear judgment; hesitation mid-trade is emotion, not analysis',
        'Modify the plan to sell at 5× instead, compromising between the plan and your new feeling',
        'Sell everything at 3× to guarantee the profit before it reverses',
      ],
      correct: 1,
      hint: 'The plan was made with clear judgment. Mid-trade feelings are made under emotional pressure. Which is more reliable?',
      explanation: 'Executing the plan at 3× is correct even if the token reaches 10×. Here\'s why: if you abandon the plan at 3×, you will also abandon it at 7× ("it might go to 20×"), and at 10× ("it might go to 50×"), and eventually hold through the dump. The plan is not about finding the optimal exit — it is about preventing the worst outcome (holding all the way back down). "It might go higher" is always true and never a reason to deviate from a pre-committed plan.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 97 — Portfolio Sizing for Volatile Assets
// ─────────────────────────────────────────────────────────────────────────────

const L97: IslandLevel = {
  id: 97, mechanic: 'memory', tier: 'pro',
  topic: 'Portfolio Sizing for Volatile Assets',

  explanation: `In 2022, a trader with $80,000 in savings put $32,000 (40%) into a single Solana memecoin that had just 4×ed. The token went to zero. He lost $32,000 — 40% of everything. He continued trading with the remaining $48,000, made steady returns, but never fully psychologically recovered from the single catastrophic position.

Position sizing is the most impactful risk management decision a speculative trader makes. It determines not just financial outcomes, but psychological resilience — the ability to keep trading rationally after losses.

The Kelly Criterion — a mathematical formula for optimal bet sizing — simplified for memecoins: never risk more than you can afford to lose entirely on a single position. For most people, that means 1–3% of total portfolio per memecoin.

The practical framework:
- Core portfolio (70%): stable assets — BTC, ETH, stablecoins. These do not go to zero.
- Speculative layer (20–25%): higher-risk positions — altcoins with fundamentals, DeFi positions.
- Lottery tickets (5–10%): memecoins and high-risk speculation.

Within the 5–10% memecoin allocation: further diversify across 5–10 positions. At 1–2% per token, a total loss of any single position costs 1–2% of your total portfolio. A 10× on any single position adds meaningful return.

The maths of ruin: if you risk 40% on one bet and lose, you need a 67% gain just to break even. If you risk 2% on each of 20 bets and they all go to zero (impossible, but worst case), you lose 40% total — the same dollar amount spread across 20 independent events instead of one.`.trim(),

  fact: 'Position sizing for memecoins: 1–3% per position, total memecoin allocation 5–10% of portfolio. At 2% per position, a total loss costs 2% of portfolio. A 10× produces 20% return on that allocation — meaningful without being ruinous.',
  plain: 'Never put more in one memecoin than you can afford to lose entirely. The 1–2% rule: each position is small enough that a total loss doesn\'t hurt, but a 10× is still exciting. Ten small bets beat one big bet every time.',
  stars: [780, 960, 1200], target: 1200, coins: 62,
  simulatorLesson: 'memePortfolioSize',

  examples: [
    {
      contextTag: '[40% catastrophe prevented]',
      scenario: 'James has $50,000 and wants to put $15,000 (30%) into a memecoin that\'s up 5× this week. His friend with strict sizing rules has $50,000 too.',
      outcome: 'Friend\'s approach: $1,000 (2%) per memecoin, 10 positions max = $10,000 total memecoin exposure. If one 10×s, that $1,000 becomes $10,000 — adding $9,000 to the portfolio (+18%). If all 10 go to zero: lose $10,000 (-20%), painful but survivable. James\'s approach: $15,000 in one token. If it 10×s: +$135,000. If zero: -$15,000 (-30%), potentially devastating. The sizing difference is the difference between a recoverable and a ruinous outcome.',
    },
    {
      contextTag: '[Portfolio layer separation]',
      scenario: 'Amara has $30,000 and wants to trade memecoins seriously. She designs her portfolio structure.',
      outcome: '$21,000 (70%): BTC and ETH in cold storage. $7,500 (25%): established altcoins and DeFi positions. $1,500 (5%): memecoin allocation, split into 15 positions of $100 each. At this scale: a 10× on one position adds $900 (+3% on memecoin allocation, +0.1% on total portfolio). A total loss of all 15: -$1,500 (-5% of portfolio). The structure ensures memecoins cannot ruin her overall financial position while still providing meaningful upside exposure.',
    },
    {
      contextTag: '[The maths of recovery]',
      scenario: 'Two traders each start with $10,000. Trader A loses 50% on a single bet: now has $5,000. Trader B loses 2% on 25 sequential small bets: now has $6,065.',
      outcome: 'Trader A needs a 100% gain to break even from $5,000. Trader B needs a 65% gain to break even from $6,065. But more importantly: Trader A\'s single catastrophic loss required optimal timing to avoid. Trader B\'s 25 small losses required 25 mistakes — far harder to achieve simultaneously. Diversified small positions are not just financially better — they require more mistakes to produce catastrophic outcomes.',
    },
  ],

  keyTakeaway: 'The memecoin sizing rule: 1–3% of total portfolio per position, total memecoin allocation 5–10%. This means any single total loss costs 1–3% of portfolio — survivable. Ten 10×ers on 2% positions add 180% to that allocation.',

  guidedPractice: [
    {
      question: 'You have a $20,000 portfolio. Following the 2% rule, what is your maximum single memecoin position?',
      options: ['$2,000', '$400', '$200', '$4,000'],
      correct: 1,
      hint: '2% of $20,000 = ?',
      explanation: '2% × $20,000 = $400. If this position goes to zero, you lose $400 — 2% of your portfolio. If it 10×es, it becomes $4,000 — you gained $3,600 (+18% of your memecoin allocation if you have 5–10% allocated to memecoins). The math works: the loss is survivable, the win is meaningful.',
    },
    {
      question: 'Why is a 40% single position more dangerous than 20 × 2% positions, even if the total dollar amount is the same?',
      options: [
        'They are equally dangerous — same total dollars at risk',
        'A 40% single loss requires a 67% gain to recover. 20 small losses are independent events — one mistake does not compound into catastrophe',
        'Multiple small positions have higher transaction fees that erode returns',
        'Regulations require disclosure for positions over 10% of portfolio',
      ],
      correct: 1,
      hint: 'If you lose 40%, what gain do you need to get back to your starting point?',
      explanation: 'Losing 40%: $10,000 → $6,000. To get back to $10,000 from $6,000 requires a 67% gain ($4,000 / $6,000). The asymmetry of losses means large losses require disproportionately large recoveries. 20 × 2% positions means each is an independent event — one going to zero costs 2%, not 40%. You have 19 other chances to generate return without needing to recover from a single catastrophic event.',
    },
    {
      question: 'Your total portfolio is $50,000. You want 8% in memecoins, split across 8 positions. What is each position size?',
      options: ['$500', '$5,000', '$400', '$50'],
      correct: 0,
      hint: '8% of $50,000 = ? Then divide by 8 positions.',
      explanation: '8% × $50,000 = $4,000 total memecoin allocation. $4,000 ÷ 8 positions = $500 per position. Each position represents 1% of total portfolio. A total loss of all 8 positions: -$4,000 (-8% of portfolio). A 10× on one position: +$4,500 net, adding 9% to total portfolio from one win. The structure is designed so wins are meaningful and losses are survivable.',
    },
    {
      question: 'What is the "core portfolio" layer in a three-tier portfolio structure and why does it need to be protected?',
      options: [
        'The most speculative layer — highest risk, highest return potential',
        'The stable foundation (BTC, ETH, stablecoins — 60–70% of portfolio) that provides financial stability and psychological resilience for speculative trading',
        'The layer reserved for DeFi yield strategies generating consistent income',
        'Emergency cash reserves kept in a bank account separate from crypto',
      ],
      correct: 1,
      hint: 'What do you trade FROM if your memecoin layer is depleted?',
      explanation: 'The core portfolio is psychologically and financially foundational. If it remains intact, you can continue trading from a position of strength even after memecoin losses. If the core is compromised, losses in the speculative layer feel existential rather than acceptable. Protecting the core (by keeping memecoins to 5–10% of total portfolio) means you can lose your entire memecoin allocation and still have 90–95% of your portfolio intact. This is the difference between a bad month and a financial crisis.',
    },
    {
      question: 'A memecoin has gone 5× since you bought it. You have not taken any profit. Should you now increase your position because it\'s "proven itself"?',
      options: [
        'Yes — proven momentum justifies larger allocation',
        'No — adding at 5× violates position sizing discipline. The position is now worth 5× your original allocation as a % of portfolio; further additions compound an already oversized position',
        'Yes — but only if smart money wallets are still holding',
        'Only if the token has a strong community and roadmap',
      ],
      correct: 1,
      hint: 'If you bought 2% and it 5×ed, what is it now as a % of your portfolio?',
      explanation: 'A 2% position that 5×es is now approximately 9–10% of your total portfolio (depending on what else moved). It has already grown beyond your intended maximum memecoin exposure for a single token. Adding more would compound an already-oversized position. The correct action is considering a partial exit to bring it back toward your target sizing — not adding. "It\'s proven itself" is exactly the thinking that leads to catastrophic overconcentration.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 98 — pump.fun vs Raydium: Solana Launch Venues Compared
// ─────────────────────────────────────────────────────────────────────────────

const L98: IslandLevel = {
  id: 98, mechanic: 'chain', tier: 'pro',
  topic: 'pump.fun vs Raydium — Solana Launch Venues Compared',

  explanation: `In 2024, a developer wanted to launch a Solana memecoin. They had two primary choices: pump.fun (bonding curve, no upfront liquidity needed) or Raydium (direct DEX listing requiring liquidity provision). The choice determined their token's entire launch profile.

pump.fun is the dominant memecoin launchpad. It requires no upfront capital — the bonding curve mechanism provides liquidity automatically. A token launches at near-zero price and graduates to Raydium when it reaches approximately $69,000 market cap (about 85 SOL in the bonding curve pool). The platform charges 1% on all trades and creators can set a 0–5% additional creator fee. pump.fun's main advantages: zero cost to launch, automatic price discovery, built-in audience (thousands of traders watch pump.fun directly), simple UI.

Raydium is Solana's largest AMM DEX. Launching directly on Raydium bypasses the bonding curve but requires the developer to provide initial liquidity — typically 5–50 SOL minimum to create a meaningful pool. Raydium listings require a pool creation fee (~0.4 SOL) and the developer provides both sides of the pair (SOL + new token). Direct Raydium launches are used by more established projects that want to appear more legitimate, have a larger community pre-launch, or want control over initial pricing.

The practical difference for traders: pump.fun tokens that have not graduated are still on the bonding curve — they can only drop to zero, not further. Graduated pump.fun tokens or direct Raydium launches have open market dynamics. Checking whether a token is still on the bonding curve vs in Raydium changes how you evaluate the exit mechanism.`.trim(),

  fact: 'pump.fun: no upfront liquidity, bonding curve to $69K market cap, 1% fee, automatic graduation to Raydium. Direct Raydium: requires 5–50 SOL liquidity upfront, immediate open market, chosen by established projects.',
  plain: 'pump.fun = easy launch, bonding curve, built-in audience. Raydium direct = requires your own liquidity, more control, chosen by projects with an existing community. Most memecoins start on pump.fun.',
  stars: [845, 1040, 1300], target: 1300, coins: 66,
  simulatorLesson: 'solanaPump',

  examples: [
    {
      contextTag: '[Comparing launch strategy]',
      scenario: 'A team wants to launch a memecoin with a small existing community of 500 Telegram members. They debate pump.fun vs Raydium direct.',
      outcome: 'pump.fun: community watches the bonding curve fill in real time — creates visible momentum. No upfront liquidity cost. Risk: if the community doesn\'t push it to $69K graduation, it stays on the curve indefinitely. Raydium direct: requires 10 SOL to seed a pool. Looks more "serious." But without a launch mechanism attracting new buyers, the initial pool may sit flat. Decision: pump.fun, because the built-in audience of traders watching new launches provides external discovery. 500 members need help from pump.fun\'s ecosystem.' },
    {
      contextTag: '[Recognising a bonding curve position]',
      scenario: 'James finds a token on DEXScreener at $35,000 market cap. He notices the volume and price action look unusual — price only moves in one direction. He checks the token address.',
      outcome: 'The token is still on pump.fun\'s bonding curve — it has not graduated to Raydium. On the bonding curve, price only increases with net buying. There are no traditional sell orders — the bonding curve is the only market maker. This means the price action is deterministic: more buys = higher price, with no limit order sellers to cap moves. He identifies this as a pump.fun token at 51% of the graduation curve and adjusts his expectations accordingly.' },
    {
      contextTag: '[Post-graduation risk]',
      scenario: 'Amara sees a token just graduated from pump.fun to Raydium — $69,000 cap, now trading on open market. She asks: what changes at graduation?',
      outcome: 'Before graduation: bonding curve provided guaranteed liquidity at all prices. After graduation: open AMM market on Raydium. The 85 SOL (approximately $12,000–$15,000) seeded into the Raydium pool at graduation is the only liquidity. Sellers can now set any price. The first minutes post-graduation are volatile: holders from the curve try to exit, new buyers discover the token on Raydium. The graduation creates real price discovery for the first time — and often a sharp initial sell-off as curve holders take profit.' },
  ],

  keyTakeaway: 'pump.fun uses a bonding curve (zero liquidity needed, automatic graduation at $69K) while Raydium direct launches require upfront liquidity provision. Knowing which mechanism a token uses tells you how it prices, how it can exit, and what graduation means for holders.',

  guidedPractice: [
    {
      question: 'What happens to a pump.fun token\'s price mechanics after it graduates to Raydium?',
      options: [
        'The bonding curve continues operating inside Raydium for 30 days',
        'The token transitions to standard AMM pricing — the bonding curve ends, open market supply/demand determines price, and traditional sell orders can now suppress the price',
        'Graduation locks the price at the $69K graduation level for 48 hours',
        'Nothing changes — pump.fun and Raydium use identical pricing mechanisms',
      ],
      correct: 1,
      hint: 'Bonding curves only move up with buying. AMMs have sellers too. What changes?',
      explanation: 'On the bonding curve, price only rises with net buying — sellers sell back into the curve at a lower price, but there are no independent sell orders capping upside. After Raydium graduation, it becomes a standard AMM: buyers and sellers establish price together. Holders from the curve who want profit now sell into the open market. This selling pressure often causes a sharp post-graduation dip before (if the token has real community) recovering.',
    },
    {
      question: 'Why does a direct Raydium launch require the developer to provide SOL upfront?',
      options: [
        'Raydium charges SOL as a listing fee to prevent spam',
        'An AMM pool requires both sides of the pair to exist before trading can begin — the developer must seed initial SOL and token liquidity',
        'Direct launches require a Raydium governance vote funded by SOL',
        'SOL is used as collateral that is returned after 90 days of trading',
      ],
      correct: 1,
      hint: 'What is an AMM pool made of, and where does that come from at launch?',
      explanation: 'An AMM pool is a pair of two tokens — SOL and NEWTOKEN. For a trader to buy NEWTOKEN with SOL, the pool must already contain NEWTOKEN (to receive) and SOL (to give back). The developer creates the pool by depositing both: NEWTOKEN (which they created) and SOL (from their own wallet). Without seeding liquidity, there is nothing for buyers to buy against. pump.fun eliminates this requirement by using the bonding curve mechanism to build liquidity from buyer purchases.',
    },
    {
      question: 'A pump.fun token is at $42,000 market cap (61% of the $69K graduation threshold). What does this tell you about the current price mechanism?',
      options: [
        'The token is about to be delisted from pump.fun for low volume',
        'It is still on the bonding curve — price movement is deterministic (up with net buying, down with net selling back to the curve), and it has not yet transitioned to open market dynamics',
        '61% completion means 61% of the token supply has been distributed to buyers',
        'The token has 39% remaining until the dev can unlock their allocation',
      ],
      correct: 1,
      hint: 'At 61% of graduation, what is the pricing mechanism still in effect?',
      explanation: 'At 61% of graduation threshold, the token is still on pump.fun\'s bonding curve. Price only rises as more tokens are purchased from the curve — there are no external sellers. This is fundamentally different from a Raydium-listed token. Buyers are purchasing from the curve at algorithmically set prices. Sellers can sell back to the curve at the current curve price. At 61%, the token needs 39% more buying pressure to reach the graduation SOL target.',
    },
    {
      question: 'What is the practical advantage of pump.fun for a small project with no existing community?',
      options: [
        'pump.fun guarantees every token reaches $69K market cap',
        'pump.fun\'s built-in audience of traders monitoring new launches provides organic discovery without requiring the project to bring all buyers themselves',
        'pump.fun tokens are exempt from Solana transaction fees',
        'pump.fun provides marketing support and social media promotion for new tokens',
      ],
      correct: 1,
      hint: 'Who is watching pump.fun.new and what are they looking for?',
      explanation: 'Thousands of traders monitor pump.fun\'s new launch feed, specifically looking for early entries into potentially viral tokens. A project launching on pump.fun immediately reaches this existing audience — they do not need to bring their own buyers from scratch. A direct Raydium launch reaches only people who already know about the token. This discovery mechanism is pump.fun\'s primary value proposition for small or new projects: distribution.',
    },
    {
      question: 'At pump.fun graduation (~$69K market cap), approximately how much SOL is seeded into the Raydium pool?',
      options: [
        '$69,000 worth (matching market cap)',
        'Approximately 85 SOL (the SOL accumulated in the bonding curve from all buys)',
        '1,000 SOL — the standard Raydium listing requirement',
        'Zero — graduation is automatic and requires no liquidity seeding',
      ],
      correct: 1,
      hint: 'Where does the Raydium pool liquidity come from at graduation?',
      explanation: 'The bonding curve accumulates SOL as buyers purchase tokens. At graduation (~$69K market cap), approximately 85 SOL has been collected. This SOL, along with the remaining token supply, is automatically deposited into a Raydium pool by pump.fun\'s graduation mechanism. The developer burns their LP tokens (locking the liquidity). At $150/SOL, that\'s ~$12,750 of initial Raydium liquidity — relatively thin, which is why post-graduation volatility is high.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L91–98)
// ─────────────────────────────────────────────────────────────────────────────

export const MEMECOIN_LEVELS_A: Record<number, IslandLevel> = {
  91: L91,
  92: L92,
  93: L93,
  94: L94,
  95: L95,
  96: L96,
  97: L97,
  98: L98,
};
