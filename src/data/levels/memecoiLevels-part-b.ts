// ⚡ Sifter SkillUp — Memecoin Markets (Island 9, Levels 91–105)
// Part B of 2 — Levels 99–105

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';
import { MEMECOIN_LEVELS_A } from './memecoiLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 99 — The Psychology of FOMO and Panic Selling
// ─────────────────────────────────────────────────────────────────────────────

const L99: IslandLevel = {
  id: 99, mechanic: 'match3', tier: 'pro',
  topic: 'The Psychology of FOMO and Panic Selling',

  explanation: `In June 2024, a memecoin called POPCAT went from $0.003 to $0.087 in 48 hours. A trader saw the chart, felt their heart rate increase, bought at $0.082 (near the top), watched it fall to $0.041 over the next 6 hours, panicked, and sold at $0.038. One week later, POPCAT was at $0.14. Every emotional decision in this sequence was wrong in the same direction: buy on greed, sell on fear.

FOMO — Fear Of Missing Out — is the primary driver of bad memecoin entries. It activates when you see a chart already up 500% and imagine it going to 1,000%. The feeling is urgent: "I need to get in NOW before I miss it." This urgency is the trap. The best entries are never urgent. The best entries come from planning, research, and patience — not from seeing a vertical chart and feeling left behind.

Panic selling is FOMO's mirror. When a position drops 30%, a specific fear activates: "It's going to zero." This fear is amplified by the speed of memecoin moves — a 50% drop in 20 minutes feels existential. The same traders who bought into FOMO often panic sell at exactly the worst moment.

Two tools counteract both: pre-set rules and position sizing. If your rules say "sell 25% at 3×," you execute regardless of feeling. If your position is 1% of portfolio, a 50% drop costs you 0.5% — not enough to activate panic. The size of the position determines the intensity of the emotion. Small positions enable rational decisions.`.trim(),

  fact: 'FOMO (Fear Of Missing Out) drives buying at tops. Panic selling drives selling at bottoms. Both are predictable emotional responses to price movement. Pre-set rules executed without discretion are the only reliable defence.',
  plain: 'FOMO makes you buy when a token is already up 500%. Panic makes you sell when it drops 30%. Both feel urgent and logical in the moment. Both are usually wrong. The antidote: rules made before the trade, executed during it.',
  stars: [910, 1120, 1400], target: 1400, coins: 70,
  simulatorLesson: 'memecoin',

  examples: [
    {
      contextTag: '[FOMO entry catastrophe]',
      scenario: 'Marcus sees BONK up 800% in 3 days on Twitter. Twenty people in his group chat are discussing it. He feels he is missing out. He buys $2,000 at the exact local peak.',
      outcome: 'Token drops 65% over the next 4 days. Marcus now holds $700 worth. He refuses to sell at the stop-loss level he should have set. A month later, it\'s at $300. His FOMO entry bought him into everyone else\'s exit liquidity. The social pressure in the group chat was the exact signal the token was near peak distribution — not near the beginning.' },
    {
      contextTag: '[Panic sell at the bottom]',
      scenario: 'Amara entered a memecoin correctly — small position, after research. It drops 40% over 3 hours. She panics and sells. 6 hours later it\'s up 60% from her exit.',
      outcome: 'If Amara had sized her position at 1% of portfolio, a 40% drop would cost her 0.4% of total portfolio — not enough to panic about. The panic was a function of oversizing, not of rational risk assessment. At correct sizing, she would have had the psychological capacity to hold through volatility. Position size is the emotional regulation tool.' },
    {
      contextTag: '[Pre-set rules working]',
      scenario: 'Keiko writes her rules before buying: "Enter 1.5% of portfolio. Sell 30% at 3×. Stop-loss at -35%. Do not look at the chart more than twice daily." She enters and the token drops 20% in hour 1.',
      outcome: 'Keiko checks her rules: -20% is within her stop-loss tolerance of -35%. She does not act. The token recovers to +180% by day 3. She sells 30% as planned. The rule that saved her: "Do not look at the chart more than twice daily." Constant price checking amplifies every emotion. Her rules were written to protect her from herself.' },
  ],

  keyTakeaway: 'FOMO and panic selling are predictable emotional responses that produce predictable bad outcomes — buying tops, selling bottoms. Pre-set rules (entry criteria, profit targets, stop-loss) executed without discretion are the only reliable defence.',

  guidedPractice: [
    {
      question: 'A memecoin you have been watching is up 600% in 48 hours. You feel a strong urge to buy immediately. What is the most rational response?',
      options: [
        'Buy immediately — momentum this strong continues',
        'Apply your checklist: assess current price relative to market cap, liquidity, holder distribution, and whether your entry criteria are met — ignore the emotional urgency',
        'Buy half now, half tomorrow to average in over the pump',
        'Wait until it pulls back 20%, then buy the dip',
      ],
      correct: 1,
      hint: 'The urgency feeling is the problem. What is the solution?',
      explanation: 'FOMO feels urgent. The antidote is a process that takes time. Running the five-point checklist (liquidity, holders, buy/sell ratio, velocity, LP age) takes 3–5 minutes and forces methodical thinking that interrupts emotional urgency. The checklist result — pass or fail — is what determines action, not the strength of the FOMO feeling. A 600% move may or may not have further upside; the checklist evaluates current conditions, not past performance.',
    },
    {
      question: 'Why does position sizing affect emotional response to price drops?',
      options: [
        'Smaller positions move less in dollar terms and feel less significant emotionally',
        'Larger positions trigger stronger loss aversion because absolute dollar loss is higher — leading to panic decisions that smaller positions do not trigger',
        'Position size has no effect on emotional response — discipline is independent of size',
        'Exchanges flag large positions for extra security checks, reducing emotional decisions',
      ],
      correct: 1,
      hint: 'Does a 40% drop feel the same on $50 vs $5,000?',
      explanation: 'Loss aversion is not proportional — humans feel the pain of a $1,000 loss more intensely than the pleasure of a $1,000 gain. A 40% drop on a $50 position ($20 lost) does not trigger panic. A 40% drop on a $5,000 position ($2,000 lost) activates intense emotional response. At 1–2% portfolio sizing, even a total loss rarely exceeds a few hundred dollars for most traders — below the threshold that triggers irrational decision-making.',
    },
    {
      question: 'What cognitive bias causes traders to hold a losing memecoin position long after their stop-loss should have triggered?',
      options: [
        'Confirmation bias — they only read positive news about the token',
        'Sunk cost fallacy — they cannot accept that the money already lost is gone, and hold hoping to "recover" what was never theirs to keep',
        'Dunning-Kruger effect — overconfidence in their ability to time the recovery',
        'Availability heuristic — they remember the tokens that recovered and forget the ones that didn\'t',
      ],
      correct: 1,
      hint: 'Why do people hold losers? What are they trying to recover?',
      explanation: 'The sunk cost fallacy: "I\'ve already lost $400, so I can\'t sell — I need to wait until I break even." The $400 already lost is gone regardless of future action. The rational question is: if I owned zero of this token right now, would I buy it at the current price? If no — sell. The entry price is irrelevant to future decisions. Holding a loser to avoid "realising" the loss is pure psychology with no logical basis.',
    },
    {
      question: 'You see 20 people in your Telegram group all posting about the same memecoin, which is up 400% today. What does this social signal actually indicate?',
      options: [
        'Strong organic community support — a bullish signal for further gains',
        'The token is likely near peak distribution — widespread social awareness usually coincides with late-stage buying, not early-stage opportunity',
        'It has been officially endorsed by influencers — a verification of legitimacy',
        'The community size will sustain buying pressure for another 24–48 hours',
      ],
      correct: 1,
      hint: 'Who is selling when everyone in the group chat is buying?',
      explanation: 'When a token appears in 20 group chats simultaneously, it means early holders have been promoting it while distributing their positions. The social buzz IS the exit strategy for smart money — they accumulate early and quietly, then promote widely to attract exit liquidity. Widespread group chat discussion is often the signal the opportunity has passed, not a signal it is beginning. The best entries happen before the group chat discovery.',
    },
    {
      question: 'What is the purpose of the rule "do not check the chart more than twice daily" for a memecoin position?',
      options: [
        'Frequent chart checking causes technical analysis errors due to data overload',
        'Constant price monitoring amplifies every fluctuation emotionally — reducing check frequency reduces the emotional inputs that drive FOMO and panic decisions',
        'DEX data is only updated twice daily, so more frequent checks show outdated information',
        'Checking charts too often violates the terms of service of most trading platforms',
      ],
      correct: 1,
      hint: 'What happens emotionally when you watch a price move every 5 minutes?',
      explanation: 'Every price movement creates an emotional response. Watching a chart every 5 minutes means 288 emotional responses per day — each one a potential irrational decision opportunity. A -3% move at 10am that recovers by 11am feels catastrophic at 10am and irrelevant at 11am. By reducing check frequency to twice daily, you only see the meaningful moves (not noise) and make fewer total emotional decisions. Your rules handle intraday movements; you check whether the rules need to be executed twice a day.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 100 — Rugpull Anatomy: How They Execute Step by Step
// ─────────────────────────────────────────────────────────────────────────────

const L100: IslandLevel = {
  id: 100, mechanic: 'memory', tier: 'pro',
  topic: 'Rugpull Anatomy — How They Execute Step by Step',

  explanation: `In November 2021, the Squid Game token — themed around the hit Netflix series — reached $2,861 before collapsing to $0.0007 in 5 minutes. The dev had built a sell restriction into the contract: buyers could purchase but not sell. When the dev drained the $3.36M liquidity pool, there was nothing buyers could do. This was a perfect rug pull: technically legal (no hacking, just deceptive contract code), undetectable without reading the contract, and devastating for buyers.

A rug pull is not a hack — it is an intentional exit by the creator. The anatomy is consistent:

Phase 1 — Setup: token deployed with deceptive contract code (hidden sell restriction, hidden drain function, or changeable fees). Mint authority left active. LP not locked.

Phase 2 — Build: social media presence created (Twitter, Telegram), influencers paid, bots simulate volume and holder growth. Coordinated wallets create the appearance of organic demand.

Phase 3 — Pump: real buyers enter based on visible momentum. Price rises, creating more visible momentum. Smart money accumulates during the rise.

Phase 4 — Exit: either the LP is drained directly (hard rug), or the dev sells their allocation in a coordinated dump (soft rug). Happens in seconds. Liquidity collapses. Token is effectively worthless.

Detection: read the contract (GoPlus Security, TokenSniffer), check LP lock status, verify mint authority is revoked, trace top wallets. A 30-second check eliminates the most obvious rugs.`.trim(),

  fact: 'Rug pulls follow a consistent four-phase pattern: setup (deceptive contract), build (artificial momentum), pump (real buyers enter), exit (LP drain or coordinated dump). GoPlus Security and TokenSniffer detect most contract-level traps in seconds.',
  plain: 'A rug pull is when the creators take all the money and disappear. The pattern is always the same: build hype, get buyers in, then drain the liquidity. The tools to detect them (GoPlus, TokenSniffer) take 30 seconds to run.',
  stars: [975, 1200, 1500], target: 1500, coins: 74,
  simulatorLesson: 'rugcheck',

  examples: [
    {
      contextTag: '[Hard rug detection]',
      scenario: 'James is evaluating a new token. He pastes the contract address into GoPlus Security. The report shows: "Sell function disabled," "Honeypot detected," "Owner can change fees to 99%."',
      outcome: 'Three critical red flags in the contract scan. "Sell function disabled" means buyers literally cannot sell — only the developer can move tokens. "Honeypot" confirms: this is a contract designed to trap buyers. "Fee manipulation" means even if selling worked, the fee could be set to 99%, taking virtually everything. James closes the tab. This token was designed as a trap — no checklist passing matters when the contract prevents exit.' },
    {
      contextTag: '[Soft rug (coordinated dump)]',
      scenario: 'Amara holds a token that has 5×ed. Suddenly, on DEXScreener, she sees a massive red candle: price drops 70% in 90 seconds. She checks the transaction log.',
      outcome: 'The top 3 wallets (which held 45% combined) all sold simultaneously. LP is still intact — this was a soft rug, not a drain. The price is damaged but not zero. She exits immediately with 60% of her original value. Soft rugs are survivable with fast action; hard rugs (LP drained) are not — there is nothing to sell into. The 45% concentration was the visible warning sign she noted before entering but chose to accept as managed risk.' },
    {
      contextTag: '[Locked LP vs unlocked]',
      scenario: 'Keiko compares two tokens: Token A has LP locked for 180 days via Team Finance (verifiable on-chain). Token B has no LP lock.',
      outcome: 'Token A: the liquidity cannot be removed for 180 days regardless of developer intent — a hard rug is technically impossible during that period (though a soft rug via selling tokens is still possible). Token B: the dev can drain the LP at any moment. This single data point changes her risk assessment fundamentally. She enters Token A with 1.5% of portfolio; she avoids Token B entirely or sizes it at 0.3% as lottery-ticket speculation.' },
  ],

  keyTakeaway: 'Rug pulls are intentional four-phase operations — not hacks. GoPlus Security and TokenSniffer detect contract-level traps in seconds. LP lock status and mint authority revocation are the two non-negotiable checks before any entry.',

  guidedPractice: [
    {
      question: 'What is a "honeypot" smart contract and why is it dangerous?',
      options: [
        'A smart contract that pays bonus rewards for holding over 30 days',
        'A contract designed to allow purchases but prevent or heavily penalise sales — buyers are trapped and cannot exit',
        'A secure multi-sig contract that protects the liquidity pool',
        'A contract that auto-compounds staking rewards into the token price',
      ],
      correct: 1,
      hint: 'What does "honeypot" mean colloquially? Apply that to a smart contract.',
      explanation: 'A honeypot lures victims in but does not let them out. In token contracts, a honeypot allows the buy function to work normally but disables, blocks, or heavily taxes the sell function. Buyers can acquire the token at normal prices but cannot exit — creating a one-way trap. All buying eventually benefits only the contract creator who can drain the liquidity. GoPlus Security\'s "Honeypot Detected" alert is the single most important warning to respect.',
    },
    {
      question: 'A token\'s liquidity pool is locked via Team Finance for 365 days. What does this prevent and what does it NOT prevent?',
      options: [
        'It prevents all forms of rug pull for 365 days',
        'It prevents a hard rug (LP drain) during the lock period — but does NOT prevent a soft rug where the dev sells their own token allocation into the market',
        'It guarantees the token will still have value after 365 days',
        'It prevents any wallet from selling more than 1% of supply per day',
      ],
      correct: 1,
      hint: 'LP lock secures the pool. Does it secure the developer\'s token allocation?',
      explanation: 'LP lock prevents the liquidity pool itself from being drained. The SOL and tokens in the pool are locked and cannot be withdrawn. However, the developer typically holds a separate allocation of tokens (from the initial mint). A locked LP does not prevent the developer from selling these tokens into the pool — a "soft rug." The price collapses as their tokens flood the market, even though the pool technically still exists. LP lock is necessary but not sufficient protection.',
    },
    {
      question: 'What does an active "mint authority" on a Solana token mean for holders?',
      options: [
        'The developer has the right to update the token\'s logo and metadata',
        'The developer can create new tokens at any time, inflating supply and diluting existing holders',
        'Mint authority proves the token is a legitimate, developer-managed project',
        'Active mint authority means the token is still in its launch phase and will stabilise soon',
      ],
      correct: 1,
      hint: 'If the developer can "mint" (create) new tokens, what happens to the value of existing tokens?',
      explanation: 'Active mint authority means the developer can print unlimited additional tokens. This destroys existing holders in two ways: (1) supply inflation collapses price for existing holders, and (2) the developer\'s new tokens can be sold directly into the liquidity pool. For memecoins, mint authority revocation is non-negotiable — check Solscan, confirm "Mint Authority: None." An active mint authority is an open invitation to unlimited dilution.',
    },
    {
      question: 'In the Squid Game token rug pull, buyers could not sell. What contract feature enabled this?',
      options: [
        'A standard Solana feature that prevents selling before a token is listed on a major exchange',
        'A custom sell restriction function written into the contract code — buyers could purchase but the sell function was designed to always fail',
        'Solana Foundation blocked trading after identifying the Netflix trademark violation',
        'The token used a deflationary mechanism that automatically burned sell transactions',
      ],
      correct: 1,
      hint: 'Solana does not have built-in sell restrictions. Who wrote the Squid token contract?',
      explanation: 'The Squid Game token developers wrote custom code that blocked the sell function for all addresses except their own. Buyers could interact with the buy function normally. Any attempt to sell returned a transaction error. This is detectable by reading the contract or running GoPlus Security — the tool identifies whether standard sell functions are present and accessible. The lesson: a token that rises without anyone selling is not a healthy market. It is a trap.',
    },
    {
      question: 'GoPlus Security flags a token with: "Owner not renounced," "Can pause trading," "Fee can be changed to 100%." No honeypot detected. Should you invest?',
      options: [
        'Yes — no honeypot detected means the contract is safe',
        'No — three critical administrative risks remain: the owner can pause trading (temporary soft lock), modify fees to 100% (economic honeypot), and has not renounced control (can upgrade or modify the contract)',
        'Yes, but only with a very small position due to minor flags',
        'The flags are standard for new token launches and will clear once the team renounces ownership',
      ],
      correct: 1,
      hint: '"Can pause trading" — what does that mean for your exit if activated?',
      explanation: '"Can pause trading" = the developer can stop all buys and sells at any time. Combined with "Fee can be changed to 100%" — if trading is paused and then restarted with 100% fees, all attempted sales send proceeds to the fee collector (the developer). "Owner not renounced" means they retain admin control over all these functions. Three serious red flags without a honeypot is still a dangerous contract. No honeypot detected means the obvious trap is not there; it does not mean the contract is safe.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 101 — Bonding Curve Mechanics: pump.fun's Graduation Model
// ─────────────────────────────────────────────────────────────────────────────

const L101: IslandLevel = {
  id: 101, mechanic: 'chain', tier: 'pro',
  topic: 'Bonding Curve Mechanics — pump.fun\'s Graduation Model',

  explanation: `When pump.fun launched in January 2024, it introduced something genuinely novel: a token launch mechanism that required zero developer capital, zero pre-seeded liquidity, and zero traditional market making. The mechanism is the bonding curve — and understanding its mathematics changes how you evaluate every pump.fun token.

The bonding curve formula: price rises as a mathematical function of tokens sold. pump.fun uses a specific curve where price approximately doubles every time the percentage of total supply sold increases meaningfully. At 10% of the curve filled: early buyers have a very low cost basis. At 50% filled: mid-curve buyers paid significantly more. At 85% filled (the graduation threshold): price is approximately 45–50× higher than the launch price.

The graduation mechanism: pump.fun collects SOL from all buys minus refunds from sells. When approximately 85 SOL accumulates (matching roughly $69,000 market cap at typical SOL prices), graduation triggers automatically. The 85 SOL plus all remaining unsold tokens are deposited into a Raydium pool and the LP tokens are burned — permanently locking the liquidity.

Why this matters for entry timing: buying at 10% of the curve means paying roughly 1/45th of the graduation price. Buying at 80% of the curve means paying close to the graduation price — where open-market selling begins immediately. The bonding curve makes early entry dramatically more profitable but also riskier (most tokens never reach graduation). Late curve entry concentrates risk: if it doesn't graduate, you exit at a loss against the curve.`.trim(),

  fact: 'pump.fun\'s bonding curve: price rises from launch to ~45–50× at graduation ($69K market cap / ~85 SOL). Early buyers (10% curve) pay ~1/45th of graduation price. Late buyers (80% curve) pay near-graduation price with full open-market risk after.',
  plain: 'The bonding curve means early buyers always pay less. At 10% filled, you pay almost nothing. At 80% filled, you pay near the graduation price — and then open-market selling starts immediately after. Know where you are on the curve.',
  stars: [1040, 1280, 1600], target: 1600, coins: 78,
  simulatorLesson: 'solanaPump',

  examples: [
    {
      contextTag: '[Early vs late curve entry]',
      scenario: 'Two traders find the same token. Trader A buys at 8% of the curve (very early). Trader B buys at 78% of the curve (late). Token graduates.',
      outcome: 'At graduation, the token price is approximately 45× the launch price. Trader A (bought at 8% curve): price at entry was roughly 3–4× launch price. At graduation: up ~12–15×. Trader B (bought at 78% curve): price at entry was roughly 35–40× launch price. At graduation: up ~12–15%. The same graduation event is profoundly different for each. Post-graduation selling by Trader A\'s cohort (who have enormous profits) creates significant sell pressure that damages Trader B\'s position.' },
    {
      contextTag: '[Never-graduating token]',
      scenario: 'Amara buys at 45% of the curve. The token gets to 72% then sells back to 30% as holders exit. It stabilises at 35% indefinitely.',
      outcome: 'A token stuck on the bonding curve below graduation is not worthless — you can still sell back into the curve at the current curve price. But the price at 35% is lower than Amara\'s entry at 45%. She exits with a loss — but the exit is clean and immediate. Compare to a graduated token\'s thin Raydium pool: on the bonding curve, exit liquidity is guaranteed at the curve price. The curve is a better-capitalised exit than a thin Raydium pool.' },
    {
      contextTag: '[Graduation event trading]',
      scenario: 'Marcus tracks a token approaching graduation at 82% of the curve. He knows the graduation SOL threshold is about to be hit.',
      outcome: 'He anticipates: at graduation, the 85 SOL seeds a Raydium pool. Early holders (8–40% curve) will immediately have 10–40× profits and may sell. This creates a predictable post-graduation dip. He waits for the dip (30–50% below graduation price) and buys into the newly opened Raydium pool — getting a lower price than the graduation event while benefiting from any subsequent organic momentum.' },
  ],

  keyTakeaway: 'pump.fun\'s bonding curve makes early entry (~1/45th of graduation price) dramatically cheaper than late entry (~full graduation price). Most tokens never graduate — but those that do reward early buyers enormously. Know your curve position before entering.',

  guidedPractice: [
    {
      question: 'A pump.fun token is at 15% of its graduation curve. Graduation price is approximately $0.069. Approximately what is the current price?',
      options: [
        '$0.069 (same as graduation price)',
        'Approximately $0.003–$0.006 (significantly below graduation price, following the curve formula)',
        '$0.034 (exactly half of graduation price)',
        '$0.00069 (1% of graduation price)',
      ],
      correct: 1,
      hint: 'At 15% of curve completion, what fraction of the graduation price does the curve formula produce?',
      explanation: 'The bonding curve price at 15% completion is roughly 3–8% of the graduation price — significantly lower. At $0.069 graduation price, 15% curve completion corresponds to approximately $0.002–$0.005. The curve is deliberately steep: early buyers get very low prices; most of the price appreciation happens in the upper portion of the curve. This is the mechanism that rewards early discovery so dramatically — and punishes late entry on tokens that nearly graduate but fall back.',
    },
    {
      question: 'Why does buying at 80% of the curve carry more risk than buying at 20%?',
      options: [
        'pump.fun charges higher fees for late-curve purchases',
        'At 80%, you pay near graduation price — if graduation doesn\'t happen or price dumps post-graduation, there is little curve support below your entry',
        'Late-curve buyers automatically receive fewer tokens per SOL',
        'Solana transaction fees increase proportionally with curve completion percentage',
      ],
      correct: 1,
      hint: 'If the token fails to graduate from 80%, where does the curve price go?',
      explanation: 'At 80% curve completion, the token price is close to the graduation level. If the token fails to reach graduation (needs ~20% more buying), sellers exit back down the curve. A token dropping from 80% to 40% curve completion represents a price drop of approximately 70–80% from the 80% level. Early buyers (20% curve) have a 60-percentage-point cushion before they are at a loss. Late buyers (80% curve) have a narrow margin. The curve\'s leverage is double-edged: amplified upside early, amplified downside late.',
    },
    {
      question: 'What happens to the liquidity pool at pump.fun graduation?',
      options: [
        'The developer receives the accumulated SOL as compensation for creating the token',
        'The ~85 SOL accumulated in the curve plus remaining tokens are deposited into a Raydium pool and LP tokens are burned — permanently locking the liquidity',
        'Pump.fun retains 50% of the SOL as a platform fee; remainder goes to Raydium',
        'The graduation SOL is distributed proportionally to all token holders',
      ],
      correct: 1,
      hint: 'Who receives the graduation SOL? And what does "burning LP tokens" mean?',
      explanation: 'At graduation, the contract automatically deposits the ~85 accumulated SOL and remaining token supply into a Raydium AMM pool. Crucially, the LP (Liquidity Provider) tokens representing ownership of this pool are burned — sent to a zero address permanently. This means no one (including the developer) can ever withdraw the seeded liquidity. The pool exists in perpetuity. This is why graduated tokens have a guaranteed liquidity floor — the initial ~85 SOL cannot be removed. It is also why early holders who helped build that SOL pool are rewarded proportionally.',
    },
    {
      question: 'At what point in the bonding curve do the largest absolute price gains occur?',
      options: [
        'Uniformly throughout the curve — each percentage adds the same price increment',
        'In the upper portion of the curve (70–100%) — each additional buyer has a larger price impact as the formula steepens near graduation',
        'At the very beginning (0–10%) — when discovery happens',
        'At exactly 50% — the midpoint produces maximum momentum',
      ],
      correct: 1,
      hint: 'The curve formula produces larger price increments for each SOL added in the later stages. Where is price impact largest?',
      explanation: 'The bonding curve formula is non-linear: the price impact of each additional SOL of buying increases as the curve fills. The first 85 SOL of buying spread across the entire 0–100% of the curve, but the price effect of each SOL is smallest at the beginning and largest near graduation. This means the last 15% of curve completion drives proportionally the most price appreciation — and also why graduation itself (the final step) causes visible jumps in price.',
    },
    {
      question: 'A token sits at 88% curve completion but graduation has not triggered. What explains this?',
      options: [
        'pump.fun delayed the graduation due to high network congestion',
        'Net selling has occurred — sellers have taken profits and sold back into the curve, reducing the accumulated SOL below the ~85 SOL graduation threshold',
        'The token needs 95% completion before graduation triggers',
        'The developer manually paused the graduation mechanism',
      ],
      correct: 1,
      hint: 'Graduation triggers when accumulated SOL reaches the threshold. What reduces accumulated SOL?',
      explanation: 'The graduation threshold is based on accumulated SOL in the curve pool, not on a percentage counter. When holders sell back into the curve, the contract refunds their SOL — reducing the accumulated pool. A token can be at "88% completion" by one metric but have net selling pulling the SOL pool below the graduation threshold. This explains why tokens sometimes appear close to graduation but remain stuck — wave after wave of selling prevents the SOL from accumulating to the ~85 required.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 102 — Seeding Liquidity: What Founders Do at Launch
// ─────────────────────────────────────────────────────────────────────────────

const L102: IslandLevel = {
  id: 102, mechanic: 'memory', tier: 'pro',
  topic: 'Seeding Liquidity — What Founders Do at Launch',

  explanation: `In March 2024, the team behind a Solana memecoin seeded $150,000 of SOL into their Raydium pool at launch, locked it for 12 months via Team Finance, and publicly shared the lock transaction on Twitter before revealing the token. Within 6 hours, the token had $4M in volume. The transparency of the liquidity commitment was part of the trust signal.

Understanding what founders do at launch explains much of what you see on DEXScreener. Direct Raydium launches require founders to seed both sides of the pair — their token and SOL. The amount and lock status of this initial liquidity determines how protected buyers are in the early phase.

LP lock mechanics: when a founder seeds liquidity, they receive LP tokens representing their ownership of the pool. Locking means sending these LP tokens to a time-lock contract (Team Finance, Streamflow) that prevents withdrawal for a specified period. Burning means sending LP tokens to a zero address permanently — never withdrawable. Burn > lock for trust, because lock has an end date.

The founder allocation problem: even with locked LP, founders often retain a personal token allocation separate from the pool. This allocation can be sold freely into the market at any time (soft rug potential). Legitimate projects with locked LP should also have a vesting schedule for the founder allocation — not an immediate, liquid dump.

On-chain verification: Solscan shows LP lock status in seconds. Look for the LP token address being held by a known lock contract (Team Finance or Streamflow addresses are recognisable). Compare lock expiry date to the project\'s stated roadmap timeline.`.trim(),

  fact: 'LP lock: LP tokens sent to a time-lock contract — can be withdrawn after the expiry. LP burn: LP tokens sent to zero address — never withdrawable. Burn > lock for trust. Verify on-chain via Solscan in 30 seconds.',
  plain: 'Locking liquidity means the founders can\'t take the pool back — for a set time. Burning it means they can never take it back. Check which one was done and for how long. Locks that expire in 30 days are not real protection.',
  stars: [1105, 1360, 1700], target: 1700, coins: 82,
  simulatorLesson: 'lpSeed',

  examples: [
    {
      contextTag: '[Lock vs burn comparison]',
      scenario: 'Marcus compares two tokens. Token A: LP locked for 60 days via Team Finance. Token B: LP burned (sent to zero address). Which provides stronger protection?',
      outcome: 'Token B (burned LP) is definitively stronger — the liquidity can never be removed regardless of what happens to the team. Token A\'s 60-day lock means the team can drain the pool on day 61. If the project\'s roadmap extends beyond 60 days, the lock provides only partial protection. For a memecoin with no roadmap, 60-day lock is reasonable. For any project claiming 12-month development plans, 60-day lock is inadequate.' },
    {
      contextTag: '[Founder allocation red flag]',
      scenario: 'Amara checks a token: LP locked for 6 months (good signal). But on Solscan, she sees the founder wallet holds 15% of total token supply, unlocked and liquid.',
      outcome: 'Locked LP + liquid founder allocation = soft rug risk remains. The founder cannot drain the pool (hard rug) but can sell their 15% allocation freely. If 15% of supply hits the market, price drops 40–60% depending on pool depth. She factors this into position sizing: not zero, because the LP lock is genuinely positive, but sizes much smaller than she would with a locked LP + vested founder tokens.' },
    {
      contextTag: '[Verifying a lock on-chain]',
      scenario: 'Keiko sees a project claim "LP locked for 365 days" on Twitter. She verifies.',
      outcome: 'She opens Solscan, finds the LP token address, checks its current holder. The LP tokens should be held by a Team Finance or Streamflow contract address. She checks the lock contract on Team Finance\'s interface to confirm: 365 days, unlock date 12 months from today, covering 100% of the LP tokens. The claim matches on-chain reality. She notes the verification result and factors it into her risk assessment — but also checks founder token allocation separately.' },
  ],

  keyTakeaway: 'LP lock (temporary) vs LP burn (permanent) are fundamentally different trust signals. Verify both on Solscan in 30 seconds. Locked LP with liquid founder allocation still carries soft rug risk — check both independently.',

  guidedPractice: [
    {
      question: 'What is the difference between "locked" and "burned" LP tokens?',
      options: [
        'They are the same — both permanently remove liquidity from developer control',
        'Locked LP tokens are held in a time-lock contract and become withdrawable after expiry. Burned LP tokens are sent to a zero address and are permanently inaccessible',
        'Locked LP earns yield; burned LP does not',
        'Only burned LP qualifies for Team Finance verification badges',
      ],
      correct: 1,
      hint: 'What happens to locked tokens after the lock period ends?',
      explanation: 'Locked LP: the developer sends LP tokens to a smart contract that prevents withdrawal until a specified date. On that date, the developer can retrieve their LP tokens and drain the pool. Burned LP: LP tokens are sent to address 0x0000...0000 — mathematically impossible to retrieve from. Burning is permanent; locking is temporary. For any project with a timeline extending beyond the lock expiry, the "lock" is only partial protection.',
    },
    {
      question: 'A project locked 100% of LP for 30 days but the founder holds 20% of token supply in an unlocked wallet. What specific risk remains?',
      options: [
        'No risk — LP lock protects all holders regardless of founder wallet',
        'Soft rug risk: the founder can sell their 20% token allocation into the locked pool at any time, crashing price without touching the LP',
        'The 30-day lock will expire before the founder can sell due to Solana transaction limits',
        'The risk is only significant if the founder sells over 10% at once',
      ],
      correct: 1,
      hint: 'LP lock protects the pool. Does it protect against someone selling tokens into the pool?',
      explanation: 'The locked pool protects the SOL/token pair from being drained by the developer. But the pool still functions as a market — anyone can sell tokens into it. A founder with 20% unlocked tokens can sell all of them into the pool simultaneously. The pool absorbs the selling pressure, dropping price dramatically. The LP remains locked (the pool exists) but the token price has been devastated by the founder\'s dump. This is the "soft rug" — technically no pool draining, but economically equivalent for buyers.',
    },
    {
      question: 'How do you verify an LP lock claim on Solana?',
      options: [
        'Trust the project\'s Twitter announcement — legitimate projects don\'t lie about locks',
        'Check Solscan for the LP token\'s current holder address — it should be held by a known lock contract (Team Finance, Streamflow), then verify the lock details on that contract\'s interface',
        'Look for the "Verified LP Lock" badge on DEXScreener (automatically applied)',
        'Email the project team and request a lock transaction ID',
      ],
      correct: 1,
      hint: 'On-chain verification: where are the LP tokens currently held?',
      explanation: 'On Solscan, find the LP token address (visible on DEXScreener under the pool info). Check who currently holds that LP token. If held by a Team Finance or Streamflow contract address (which are publicly known and recognisable), the lock claim has on-chain basis. Then visit Team Finance\'s unlock schedule interface, paste the LP token address, and confirm: lock duration, unlock date, and percentage of LP covered. A 30-second verification process eliminates unverifiable claims.',
    },
    {
      question: 'Why is a 30-day LP lock insufficient for a project claiming 12 months of development?',
      options: [
        'It is sufficient — 30 days provides full launch-phase protection',
        'A 12-month roadmap requires commitments extending beyond day 30. After lock expiry, the developer can drain the pool on day 31 — at the exact moment the project is supposedly still under development',
        'Solana LP locks are automatically extended by the network if development continues',
        '30-day locks are only valid for tokens under $100K market cap',
      ],
      correct: 1,
      hint: 'What can the developer do on day 31?',
      explanation: 'A developer committed to 12 months of legitimate development has no reason to unlock liquidity on day 31. The mismatch between a 30-day lock and a 12-month roadmap signals the lock was set for marketing purposes (looks serious) not for genuine commitment. Credible long-term projects lock LP for 6–18 months or burn it entirely. Evaluate the lock duration relative to the project\'s stated timeline: the lock period should encompass the entire active development phase.',
    },
    {
      question: 'What does "vesting schedule for founder tokens" mean and why does it matter alongside LP lock?',
      options: [
        'A vesting schedule determines when the LP lock expires',
        'Founder tokens released gradually over time (e.g., 10% per month for 10 months) rather than all at once — preventing concentrated selling from the team while development occurs',
        'Vesting schedules are only used for employee compensation, not founder allocations',
        'A vesting schedule automatically burns founder tokens if they are not used within 30 days',
      ],
      correct: 1,
      hint: 'If founders receive their full allocation immediately, what can they do on day 1?',
      explanation: 'Without vesting, founders receive all their tokens at launch and can sell them all on day 1 (soft rug). Vesting releases tokens gradually — 10% per month for 10 months means the founder can sell at most 10% of their allocation each month. This aligns incentives: the founder\'s remaining 90% token value depends on the project succeeding. LP lock + founder vesting together close both the hard rug (pool drain) and soft rug (founder dump) vectors. Both are necessary; neither alone is sufficient.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 103 — Playing Catalysts: Listings, Tweets, and News Events
// ─────────────────────────────────────────────────────────────────────────────

const L103: IslandLevel = {
  id: 103, mechanic: 'match3', tier: 'pro',
  topic: 'Playing Catalysts — Listings, Tweets, and News Events',

  explanation: `In April 2024, Elon Musk posted a single image of a Shiba Inu dog with no caption. Within 4 hours, DOGE was up 8%, WIF was up 40%, and a new token called "MAGA HAT DOG" (launched that morning) went 200× before collapsing. Catalysts — external events that drive attention and buying — are the most powerful and most dangerous force in memecoin markets.

Catalysts fall into three categories:

Listing catalysts: a major exchange (Binance, Coinbase, Kraken) listing a token dramatically expands its accessible buyer pool. The pattern: rumour of listing → pre-listing pump → listing announcement → peak → sell the news decline. Traders who buy on confirmed rumours and sell on announcement consistently outperform those who buy on announcement.

Influencer catalysts: a large account (Elon Musk, influential CT accounts) mentions a token. Effect is immediate, intense, and brief. Characteristics: spike in the first 15–30 minutes, rapid distribution, quick collapse. Position size is tiny; entry is only on existing positions (not new entries on the spike).

News and cultural catalysts: real-world events create memecoin themes (election seasons, sports events, viral internet moments). DOGE during "Doge Day," TRUMP during election cycles, sports-themed tokens during major tournaments. These have a longer time horizon than influencer mentions — weeks, not hours.

The professional approach to catalysts: identify them before they happen, not after. Once Twitter is discussing the catalyst, the move is often mostly priced in.`.trim(),

  fact: 'Catalysts (exchange listings, influencer mentions, news events) drive memecoin price spikes. The pattern: buy the rumour, sell the news. Professional catalyst trading means identifying events before public awareness — not reacting after.',
  plain: 'Catalysts are events that drive price up fast. Exchange listings, Elon tweets, viral trends. By the time everyone knows about them, the move is usually over. Find them early or don\'t chase them at all.',
  stars: [1170, 1440, 1800], target: 1800, coins: 86,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Exchange listing play]',
      scenario: 'James spots on-chain activity: a specific wallet that has historically front-run Binance listings just bought a large position in a lesser-known token.',
      outcome: 'He does not know for certain a listing is coming. He treats it as a high-probability signal. He buys a 1.5% position — sized for the uncertainty. Five days later, Binance announces the listing. The token spikes 180% on announcement. He sells 50% on the spike (catching the "sell the news" peak), holds the rest for 48 hours of post-listing momentum. His total return: approximately 2.3× on the position. The on-chain front-runner signal was his edge.' },
    {
      contextTag: '[Influencer mention]',
      scenario: 'Amara holds a small position in WIF (a dog-themed Solana memecoin). At 2am, a major crypto influencer with 3M Twitter followers posts a positive tweet about it.',
      outcome: 'WIF spikes 35% in 15 minutes. Amara\'s existing position is now significantly up. She sells 40% into the spike — not because the tweet is negative, but because influencer-driven spikes are notoriously short-lived (typically reverting 50–70% within 2–4 hours as momentum chasers exit). She holds 60% for potential sustained momentum. The spike was not a buy signal — it was an exit opportunity for existing holders.' },
    {
      contextTag: '[Cultural catalyst timing]',
      scenario: 'It\'s 6 weeks before the US Presidential election. Keiko researches election-themed memecoins that performed well during the 2020 election cycle.',
      outcome: 'She identifies TRUMP and similar political memecoins. Historical data: these tokens peak in the 2 weeks before election day as political attention maximises. She buys small positions 6 weeks out. Three weeks before the election, political media coverage intensifies. Her positions are up 3–8×. She begins staged exits 10 days before the election — before peak media saturation. The catalyst was predictable; the timing of the build-up was learnable from history.' },
  ],

  keyTakeaway: 'Catalysts drive memecoin price spikes but are most profitable when identified before public awareness. Listing rumours outperform listing announcements. Influencer spikes are exit opportunities for existing holders, not entry signals for new buyers.',

  guidedPractice: [
    {
      question: 'What does "buy the rumour, sell the news" mean for exchange listing catalysts?',
      options: [
        'Buy when you hear a rumour; sell immediately when you hear news about any token',
        'Accumulate positions when listing rumours circulate (pre-announcement); sell when the official listing is announced, as the announcement often marks the price peak',
        'Only buy tokens after they are officially listed on major exchanges',
        'Sell all your tokens when you hear negative news rumours',
      ],
      correct: 1,
      hint: 'When does the "smart money" buy? When does the "dumb money" buy? Who exits first?',
      explanation: 'Exchange listing rumours attract early, informed buyers who bid the price up. When the listing is officially announced, it reaches the widest audience — including those who could not enter earlier. This peak awareness is often the peak price: the informed buyers who entered on rumour now have an exit opportunity as new money floods in. "Sell the news" means using the announcement (when everyone learns about the catalyst) as the exit point rather than holding for further gains that often don\'t materialise.',
    },
    {
      question: 'A major influencer with 5M followers just tweeted positively about a token you do NOT currently hold. It\'s up 25% in 5 minutes. What is the appropriate action?',
      options: [
        'Buy immediately — the influencer\'s reach will drive continued gains for hours',
        'Do not buy a new position — influencer-driven spikes typically revert 50–70% within hours as momentum chasers exit. The opportunity for this catalyst has passed',
        'Buy half a position now and the other half in 30 minutes to average into momentum',
        'Check if the influencer has mentioned the token before and buy if this is a repeat mention',
      ],
      correct: 1,
      hint: 'Who is selling into your buy at +25%? How long do these spikes typically last?',
      explanation: 'An influencer spike 5 minutes in progress means existing holders (who had lower entries) are now selling into your potential buy. The spike\'s buyers become the exit liquidity for those positioned before the tweet. Historical data on influencer spikes: 70–80% of price gain is typically retraced within 2–4 hours. The trade has been made by people who were already positioned; buying at the peak of the spike means buying at the exact point the informed sellers are exiting.',
    },
    {
      question: 'You identify an upcoming cultural catalyst (World Cup final) 3 weeks in advance. When is the optimal entry for a soccer-themed memecoin?',
      options: [
        'During the final itself — maximum real-world event attention drives maximum buying',
        'As early as possible before widespread public awareness — entry 3 weeks out captures the build-up phase before media saturation peaks',
        'One week before the final — when media coverage is building but not yet at peak',
        'After the final if the team wins — outcome confirmation drives sustained buying',
      ],
      correct: 1,
      hint: 'When does your competition (other traders) enter? Before or after you?',
      explanation: 'Optimal catalyst entry is before the catalyst becomes widely discussed. Three weeks out: few traders have identified the theme. You accumulate at low prices. Two weeks out: early mover traders enter, pushing price up. One week out: mainstream crypto media discusses soccer tokens. Final week: peak media coverage, peak buying, often peak price. Your staged exits happen during peak coverage — when everyone else is buying. Entering during the event itself means entering after the build-up gains are complete.',
    },
    {
      question: 'What on-chain signal can indicate an upcoming exchange listing before the official announcement?',
      options: [
        'Exchange employees always buy in advance and leave detectable on-chain footprints',
        'Wallets with a history of front-running previous listings (identifiable by their trading patterns) accumulating a token before any public announcement',
        'Token contract updates that include the exchange\'s official wallet address as an approved minter',
        'A sharp decrease in trading volume — exchanges suppress activity before listing to prevent front-running',
      ],
      correct: 1,
      hint: 'Who knew about past listings in advance? Can you identify their wallets from historical trades?',
      explanation: 'On-chain analysts have identified wallets that consistently bought specific tokens 3–10 days before their Binance or Coinbase listings — suggesting information advantages. These wallets are public addresses visible on explorers. By tracking their activity (via Nansen or CIELO), you can detect their new accumulation positions in real time. This is not guaranteed information about upcoming listings — it is a high-probability signal based on behavioural patterns. The approach: smaller position size (signal, not certainty), quick exit on listing announcement.',
    },
    {
      question: 'A token\'s price dropped 40% after a major influencer announced "selling my position." You did not hold it before. Should you buy the dip?',
      options: [
        'Yes — influencer selling creates an oversold dip perfect for a bounce entry',
        'Evaluate carefully: an influencer\'s sell announcement often causes sustained sell pressure as followers exit. The dip may continue rather than bounce — check on-chain selling momentum before deciding',
        'Yes — influencers always regret selling quickly and re-enter, driving the price back up',
        'Never buy dips after influencer sells — the token is permanently damaged',
      ],
      correct: 1,
      hint: 'What happens to other holders when an influencer announces they are selling?',
      explanation: 'When a notable holder announces selling, followers who bought because of that holder\'s earlier endorsement now exit simultaneously. This creates continued selling pressure — not a clean dip to buy. Check on-chain data: is selling volume subsiding (potential bounce) or accelerating (continued fall)? A 40% drop on influencer sell news can continue to 70% if the community was primarily driven by that influencer\'s endorsement. Buy-the-dip logic applies to tokens with organic communities; it is riskier for influencer-dependent tokens.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 104 — Memecoin Tax: Cost Basis, Wash Sales, and Tracking
// ─────────────────────────────────────────────────────────────────────────────

const L104: IslandLevel = {
  id: 104, mechanic: 'memory', tier: 'pro',
  topic: 'Memecoin Tax — Cost Basis, Wash Sales, and Tracking',

  explanation: `In April 2023, a UK trader received an HMRC inquiry for £47,000 in tax liability. He had made 1,200 memecoin trades over 18 months and never tracked his cost basis. His total net gain was approximately £30,000 — but he owed tax on £120,000 of gross gains because he could not prove his cost basis on the losing trades. The lesson cost him £17,000 more than his actual gains.

Every sale, swap, or disposal of a cryptocurrency is a taxable event in most jurisdictions (UK, US, Australia, most of Europe). This means every time you swap PEPE for SOL, you have "disposed" of PEPE — triggering a capital gain or loss on the difference between what you paid for it (cost basis) and what you received for it.

Cost basis is what you paid for the token, including the SOL or ETH you used to buy it (which also had a cost basis at time of purchase). In high-volume memecoin trading, tracking cost basis manually is practically impossible — automated tools are necessary.

Key tools: Koinly (best for UK/Australia/Europe), CoinTracker (strong US focus), TaxBit (institutional-grade). All connect to your wallet via API, import all transaction history, and calculate gains/losses automatically.

Important nuances: most jurisdictions do not apply wash sale rules to crypto (you can sell a losing token and re-buy immediately without disallowing the loss). Short-term gains (held under 12 months) are taxed as income in most places — often the highest rate. Long-term gains (held over 12 months) usually receive preferential tax treatment.`.trim(),

  fact: 'Every crypto swap or sale is a taxable event in most jurisdictions. Cost basis = what you paid for it. Use Koinly or CoinTracker to track automatically. Gross gains (not net) create the tax liability — proving cost basis on losses is what reduces your bill.',
  plain: 'Every time you sell or swap a memecoin, it\'s a taxable event. You owe tax on the profit. If you can\'t prove what you paid for it (cost basis), you might owe tax on the full sale price. Use Koinly — it tracks everything automatically.',
  stars: [1235, 1520, 1900], target: 1900, coins: 90,
  simulatorLesson: 'onchainAnalysis',

  examples: [
    {
      contextTag: '[Cost basis disaster prevented]',
      scenario: 'Priya makes 150 memecoin trades over 6 months. She did not track cost basis. At tax time, her accountant tells her she owes tax on $85,000 of gross disposal proceeds. She argues she only made $12,000 net profit.',
      outcome: 'Without cost basis records, she cannot prove what she paid for each token she sold. The tax authority defaults to treating all proceeds as gains. She must either pay $85,000 × tax rate or spend months reconstructing transactions from blockchain history. She connects her wallet to Koinly retroactively — it reconstructs her entire history. Her actual tax bill: $12,000 net profit × tax rate. Lesson: connect Koinly before your first trade, not after.' },
    {
      contextTag: '[Wash sale advantage]',
      scenario: 'Marcus has $5,000 of gains from a successful WIF trade. He also holds a BONK position currently at -$3,000 loss. It\'s December 28th.',
      outcome: 'In most crypto jurisdictions (unlike stocks), there is no wash sale rule. Marcus sells BONK on December 28th for a $3,000 loss, offsetting his $5,000 gain to a net $2,000 taxable gain. On December 29th, he buys BONK back at the same price. His tax bill is on $2,000 instead of $5,000 — a significant saving. He must check his jurisdiction\'s specific rules, but for most crypto traders in the UK and US, this "tax loss harvesting" is legal and effective.' },
    {
      contextTag: '[Short vs long term]',
      scenario: 'Keiko bought SOL 14 months ago at $25. It\'s now $150. She considers selling. She also bought a memecoin 3 weeks ago at $0.001. It\'s now $0.005.',
      outcome: 'SOL (held 14 months): qualifies for long-term capital gains treatment in most jurisdictions — lower tax rate (10–20% vs income tax rate of potentially 40–45%). Memecoin (held 3 weeks): short-term gain, taxed as income at her marginal rate. She sells the SOL (long-term rates) and holds the memecoin for 9 more months to qualify for long-term treatment — if she still believes in the position. The holding period dramatically affects her actual after-tax return.' },
  ],

  keyTakeaway: 'Every swap or sale is a taxable event. Gross sale proceeds create tax liability — cost basis records reduce it. Connect Koinly or CoinTracker before your first trade. Most jurisdictions allow tax loss harvesting in crypto (no wash sale rule).',

  guidedPractice: [
    {
      question: 'You swap 10,000 PEPE (bought for $200) for 1 SOL (worth $150). What is your taxable gain or loss?',
      options: [
        'No taxable event — you did not sell for cash, you swapped for another crypto',
        'A $50 capital loss — you disposed of an asset worth $150 that cost you $200',
        'A $200 capital gain — the full original cost is treated as income',
        'A $150 capital gain — the value received is the taxable amount',
      ],
      correct: 1,
      hint: 'Disposal value minus cost basis = gain or loss. $150 − $200 = ?',
      explanation: 'Swapping crypto for crypto is a taxable disposal in most jurisdictions. You received $150 of value (1 SOL) and your cost basis was $200 (what you paid for the PEPE). $150 − $200 = -$50 capital loss. This loss can offset other capital gains. The key insight: you don\'t need to sell for fiat currency for a taxable event to occur. Every swap between any two tokens is a disposal of the first token at current market value.',
    },
    {
      question: 'What is "cost basis" and why does it matter for tax calculation?',
      options: [
        'The current market price of a token — used to calculate how much your portfolio is worth',
        'What you originally paid for a token (including fees) — subtracted from disposal proceeds to calculate your taxable gain or loss',
        'The minimum price a token has ever traded at — the base from which gains are measured',
        'The cost of setting up your trading account and wallet',
      ],
      correct: 1,
      hint: 'Taxable gain = disposal proceeds minus... what?',
      explanation: 'Cost basis is your acquisition cost: price paid × quantity, plus any fees (gas, exchange fees). It is the number subtracted from your disposal proceeds to calculate taxable gain. If you bought 1,000 BONK for $50 and sold for $300, your taxable gain is $250. Without a cost basis record, tax authorities may treat the full $300 as your gain. Correct cost basis records are the difference between paying tax on $250 and paying tax on $300 — a 17% over-payment with no legal basis.',
    },
    {
      question: 'In most cryptocurrency jurisdictions, does a "wash sale" rule apply?',
      options: [
        'Yes — selling a crypto at a loss and rebuying within 30 days disallows the loss deduction',
        'No — most jurisdictions allow you to sell a losing crypto position, claim the loss, and immediately rebuy the same asset without disallowing the loss',
        'Yes, but only for tokens with market cap over $10M',
        'No wash sale rule exists anywhere — all crypto losses are always deductible',
      ],
      correct: 1,
      hint: 'What does the wash sale rule prevent in stock markets? Does your jurisdiction apply it to crypto?',
      explanation: 'The US wash sale rule prevents claiming a tax loss on a stock if you buy the same or "substantially identical" security within 30 days before or after the sale. For crypto, the IRS has not explicitly applied wash sale rules (as of 2024 — check for updates), allowing "tax loss harvesting": sell at a loss, claim the deduction, and immediately rebuy. UK HMRC does have a "bed and breakfasting" 30-day rule for crypto. Always verify your specific jurisdiction\'s current rules — tax law changes.',
    },
    {
      question: 'Why does the difference between "short-term" and "long-term" capital gains matter for memecoin traders?',
      options: [
        'Short-term gains are taxed at 0%; long-term gains are taxed at standard income rates',
        'In most jurisdictions, short-term gains (under 12 months) are taxed at income tax rates (potentially 40–45%); long-term gains (over 12 months) receive lower preferential rates (10–20%)',
        'The distinction only applies to gains over $50,000',
        'Long-term and short-term gains are taxed identically for cryptocurrencies',
      ],
      correct: 1,
      hint: 'How long did you hold it? What rate does your country apply to each holding period?',
      explanation: 'Holding period dramatically affects after-tax returns. A $10,000 short-term gain at a 40% income tax rate costs $4,000 in tax. The same $10,000 gain held 12+ months at a 20% long-term rate costs $2,000. The $2,000 difference represents 20% of your profit — significant. Memecoin traders who flip tokens in days always pay the highest tax rate. Holding winning positions past the 12-month mark (where psychologically and financially feasible) meaningfully improves after-tax outcomes.',
    },
    {
      question: 'What is the most practical first step to ensure you can accurately report memecoin taxes?',
      options: [
        'Keep a manual spreadsheet of every trade you make',
        'Connect your wallets to a crypto tax tool (Koinly, CoinTracker) before making any trades — the tool imports all future transactions automatically from the blockchain',
        'Only trade on centralised exchanges that provide tax reports',
        'Consult a tax attorney before each individual trade',
      ],
      correct: 1,
      hint: 'When is the easiest time to set up tax tracking — before or after 500 trades?',
      explanation: 'Koinly and CoinTracker connect to your wallet via public address (no private key required — safe). They import all on-chain transactions, calculate cost basis using your chosen method (FIFO, LIFO, specific identification), and generate tax reports. Set up before your first trade: the tool captures everything from day one. Retroactive reconstruction from blockchain history is possible but time-consuming. Setting up costs 15 minutes; failing to set up can cost thousands in overpaid tax or hours in reconstruction.' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 105 — BOSS: Memecoin Markets Complete
// ─────────────────────────────────────────────────────────────────────────────

const L105: IslandLevel = {
  id: 105, mechanic: 'match3', tier: 'pro',
  topic: 'BOSS: Memecoin Markets Complete',
  isBoss: true,

  explanation: `You have completed Memecoin Markets. This is the synthesis before the boss challenge.

Memecoins are pure narrative speculation — no fundamental floor, no revenue, no product. Value = community attention × momentum. Every strategy here exists because price can go to zero at any moment, and the only edge is information advantage combined with ruthless risk management.

The complete toolkit: DEXScreener five-point checklist (liquidity, holders, buy/sell ratio, velocity, LP age) × bundle detection (Solscan wallet tracing) × contract scanning (GoPlus Security, TokenSniffer) × liquidity pool math (LP/MC ratio, pool impact calculation) × wallet tracking (Nansen, CIELO smart money) × pump.fun bonding curve mechanics (curve position, graduation mechanics) × exit strategy (staged exits, moonbags, stop-losses) × position sizing (1–3% per position, 5–10% total memecoin exposure).

The psychological layer: FOMO drives bad entries. Panic drives bad exits. Pre-set rules executed mechanically — not emotionally — are the only reliable defence. The size of your position determines the intensity of your emotions. Small positions enable rational decisions.

The legal layer: every swap is a taxable event. Cost basis records are the difference between paying tax on actual gains vs gross proceeds. Connect Koinly before your first trade.

The honest assessment: most memecoin traders lose money over time. The winners are early, disciplined, and treat it as structured speculation within a loss-capped framework — not as a path to wealth replacement. Know that going in.`.trim(),

  fact: 'Memecoin mastery requires: DEXScreener checklist, bundle detection, contract scanning, LP math, smart money tracking, pump.fun mechanics, staged exits, position sizing, FOMO/panic resistance, and tax tracking. The edge is information + discipline — not luck.',
  plain: 'You now have the full memecoin toolkit. Use it with small positions, pre-set rules, and honest expectations. Most tokens fail. The few that don\'t reward the disciplined, early, and well-researched.',
  stars: [2210, 2720, 3400], target: 3400, coins: 100,
  simulatorLesson: 'memecoinBoss',

  examples: [
    {
      contextTag: '[Full framework application]',
      scenario: 'A friend shows you their memecoin portfolio: 60% in one token (DOGWIF2), mint authority active, LP unlocked, bought at the top of a Twitter influencer spike. They ask if they should hold.',
      outcome: 'Apply the framework: 60% in one token = catastrophic sizing violation (max 2%). Mint authority active = unlimited dilution risk. LP unlocked = hard rug possible anytime. Bought on influencer spike = entered at peak distribution. Four compounding red flags. The honest answer: this portfolio structure is dangerous independent of which token it holds. The advice: sell enough to bring the position under 5% of total portfolio immediately, regardless of current P&L. Then evaluate the remaining position with clear eyes.' },
    {
      contextTag: '[DEXScreener synthesis]',
      scenario: 'You open DEXScreener on a new Solana token: 2 hours old, $85,000 liquidity, 420 holders, 61% buy ratio, varied buy sizes ($50–$1,800), top 10 holders own 22%. GoPlus shows no honeypot, mint revoked, LP locked 30 days.',
      outcome: 'Score the checklist: liquidity ($85K) ✓, holders (420) ✓, buy/sell ratio (61% — slightly elevated but not suspicious) ✓, velocity (varied sizes) ✓, LP age (2 hours — early but not 2 minutes) ✓. Contract: no honeypot ✓, mint revoked ✓, LP locked ✓. Concentration: 22% top 10 — healthy ✓. This is a clean signal by memecoin standards. Entry: 1.5% of portfolio. Staged exit: 30% at 3×, 30% at 7×, moonbag the rest. Stop-loss: -35%.' },
    {
      contextTag: '[Long-term perspective]',
      scenario: 'Over 12 months of memecoin trading, Marcus made 120 trades. 85 lost money. 30 broke even. 5 went 5–20×. His net result: +47% on his memecoin allocation (8% of total portfolio).',
      outcome: '47% on 8% of portfolio = 3.76% total portfolio contribution. Not spectacular, but positive from a strategy with an 8% total exposure limit. The 5 winning trades compensated for all 85 losers. Lesson: the win rate does not need to be high. Position sizing and staged exits ensure the rare winners produce outsized returns relative to the many small losses. 85 losers at 1–2% portfolio each = 85–170% of the allocation lost over time. 5 winners at 10–20× each = 50–100% returned. Positive expectancy requires the winners to be sized right.' },
  ],

  keyTakeaway: 'Memecoin mastery is not about picking winners — it is about systematic information advantage (checklists, contract scanning, wallet tracking) combined with ruthless position sizing (1–3% max) and mechanical exit execution. The edge is process, not prediction.',

  guidedPractice: [
    {
      question: 'A new token passes all five DEXScreener checklist points but GoPlus shows "mint authority active." Should you enter?',
      options: [
        'Yes — the five-point checklist is the primary evaluation; GoPlus is secondary',
        'No or very cautiously — active mint authority means the developer can print unlimited tokens at any time, destroying existing holder value regardless of other positive signals',
        'Yes — mint authority is always active for the first 30 days of any new token',
        'Only if the team has a doxxed identity and roadmap',
      ],
      correct: 1,
      hint: 'What can a developer with active mint authority do to your position overnight?',
      explanation: 'An active mint authority is a single overriding red flag. The developer can mint billions of additional tokens at any moment — dropping price proportionally. A clean five-point checklist means the current state looks good; an active mint authority means the current state can be destroyed instantly by one transaction. At minimum, apply the smallest possible position size (0.5% rather than 1.5%) and set a tighter stop-loss. Better: wait for mint authority to be revoked before entering seriously.',
    },
    {
      question: 'You hold a memecoin that has gone 8× from your entry. You have not taken any staged exits as planned. The token is correcting 25% from its peak. What do you do?',
      options: [
        'Hold — 25% corrections are normal and the trend is still up',
        'Execute the exit plan immediately — sell the planned 30% at this stage, regardless of whether you missed the ideal exit, to enforce the discipline of the framework',
        'Set a new stop-loss at -40% from the current price and reassess',
        'Sell everything now to capture remaining gains before further decline',
      ],
      correct: 1,
      hint: 'The plan existed for a reason. Why is late execution better than no execution?',
      explanation: 'Late execution of a staged exit plan is better than no execution. The plan was designed to enforce profit-taking even when greed argues "it might go higher." A 25% correction from the top while still 6× above your entry means you have significant profit to protect. Selling 30% now locks in real gains. The remaining position\'s outcome — whatever it is — is now playing with secured profits. The psychological shift from "I need to get my peak price" to "I\'ve already won" enables calmer decision-making for the remainder.',
    },
    {
      question: 'What is the maximum realistic edge in memecoin trading, and where does it come from?',
      options: [
        'Picking the one token out of a hundred that goes 1000× — pure information edge',
        'Information advantage (early detection via on-chain tools, smart money tracking) combined with process discipline (sizing, staged exits, stop-losses) — not prediction, but systematic reduction of bad outcomes',
        'Using faster internet connections to front-run slower traders',
        'Having a larger portfolio to diversify across more tokens',
      ],
      correct: 1,
      hint: 'Can anyone consistently predict which memecoin will 100×? What can be consistently controlled?',
      explanation: 'No one consistently predicts 100× memecoins — the market is too random and adversarial. The edge comes from two controllable factors: information advantage (DEXScreener checklist, bundle detection, contract scanning, smart money tracking — knowing more than average buyers) and process discipline (sizing, exits, stops — systematically avoiding catastrophic losses while participating in the occasional winner). The information edge finds better opportunities; the process edge ensures the bad ones don\'t ruin you.',
    },
    {
      question: 'You made $15,000 in memecoin gains over 6 months. You have 800 separate transactions. What is your most urgent tax action?',
      options: [
        'Nothing — gains under $20,000 are tax-free in most jurisdictions',
        'Connect all wallets to Koinly immediately and generate a tax report to understand your actual liability — gross gains may be significantly higher than net gains',
        'Pay tax on the $15,000 net gain — it is straightforward',
        'Only report trades that resulted in fiat withdrawals to a bank account',
      ],
      correct: 1,
      hint: 'What if your gross disposal proceeds are $80,000 but your cost basis proves $65,000 in losses?',
      explanation: 'Without a tax report, you cannot know your actual liability. $15,000 net gain might reflect $80,000 gross proceeds minus $65,000 provable cost basis — but if you cannot prove the cost basis on the $65,000 of losses, the tax authority may assess you on $80,000 of gains. 800 transactions make manual calculation impossible. Koinly imports your entire on-chain history, calculates cost basis on every transaction, and outputs the correct net taxable amount. This is not optional for active traders — it is the difference between accurate tax payment and massive over-payment.',
    },
    {
      question: 'Summarise the complete memecoin risk management framework in the correct order of operations.',
      options: [
        'Find token → buy → set stop-loss → track performance → sell at peak',
        'Identify candidate → run DEXScreener checklist → check contract (GoPlus) → verify LP lock + mint authority → trace early wallets for bundles → size at 1–3% → set staged exit targets and stop-loss before buying → execute plan mechanically',
        'Follow smart money wallet → copy their position → sell when they sell',
        'Check market cap → buy if under $1M → sell at $10M',
      ],
      correct: 1,
      hint: 'What happens before entry vs after? What is mechanical vs discretionary?',
      explanation: 'The correct order matters because each step gates the next. DEXScreener checklist eliminates most tokens in 90 seconds. GoPlus eliminates contract traps. LP/mint verification eliminates the most common rug vectors. Bundle detection reveals coordinated insider risk. Position sizing caps maximum loss before it happens. Exit plan and stop-loss creation commits you to rational decisions before emotion enters. Buying comes last — after all filters have been applied. Mechanical execution of the plan (not discretionary adjustment during the trade) is what separates the framework from gambling.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part B (L99–105)
// ─────────────────────────────────────────────────────────────────────────────

const MEMECOIN_LEVELS_B: Record<number, IslandLevel> = {
  99: L99,
  100: L100,
  101: L101,
  102: L102,
  103: L103,
  104: L104,
  105: L105,
};

export { MEMECOIN_LEVELS_B };

export const MEMECOIN_LEVELS: Record<number, IslandLevel> = {
  ...MEMECOIN_LEVELS_A,
  ...MEMECOIN_LEVELS_B,
};
