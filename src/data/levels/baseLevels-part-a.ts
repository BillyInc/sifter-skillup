// ⚡ Sifter SkillUp — Base Ecosystem (Island 11, Levels 151–165)
// Part A of 2 — Levels 151–158
//
// RENUMBERING NOTE: This was formerly Island 12.
// New sequence: I10 (Airdrop) → I11 (Base) → I12 (TON) → I13 (Coinbase)
//               → I14 (Final Frontier) → I15 (Alt-Chain) → I16 (Security)
//               → I17 (Advanced Crypto) → I18 (Starknet)
//
// Chain: Base Sepolia (islandId=11)
// Simulators (from island12_13_15Sims.tsx):
//   cbBtcExplainer, aerodromeSwap, baseMemeculture, agentKitDemo, baseBoss
//   plus existing: bridge, defi, metamask, rugcheck, onchainAnalysis

import type { Level } from './levels';
import type { IslandLevel, GuidedPracticeItem, WorkedExample } from './bitcoinBayLevels-part-a';

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 151 — What Base Is: Coinbase's L2 and Its Strategic Position
// ─────────────────────────────────────────────────────────────────────────────

const L151: IslandLevel = {
  id: 151, mechanic: 'match3', tier: 'pro',
  topic: 'What Base Is — Coinbase\'s L2 and Strategic Position',

  explanation: `
In August 2023, Base processed more transactions on its launch week than any L2 in history. It was not built by a startup — it was built by Coinbase, a publicly traded company with 100 million verified users and $3 billion in annual revenue. That corporate backing makes Base categorically different from every other L2.

Base is an Ethereum Layer 2 built using the OP Stack — the same open-source framework that powers Optimism. It processes transactions off Ethereum mainnet (fast, cheap) and posts proofs back to Ethereum for security. Like all OP Stack chains, it inherits Ethereum's security while operating at a fraction of the cost.

Three things make Base strategically distinct. First, Coinbase deliberately chose not to issue a Base token. Unlike Arbitrum (ARB) or Optimism (OP), there is no BASE token. Coinbase earns revenue from sequencer fees — the small charges for processing transactions — paid in ETH. This sidesteps regulatory token risk entirely.

Second, Base has a one-tap on-ramp from Coinbase exchange. Any of Coinbase's 100 million users can move funds from their exchange account to Base without bridging from a separate wallet. This removes the biggest friction point in L2 adoption.

Third, Coinbase is a publicly listed US company regulated by the SEC. This gives Base a regulatory clarity that no other L2 can claim — and makes it the natural choice for institutional DeFi and consumer applications requiring compliance certainty.

The result: Base rapidly accumulated $8B+ in TVL, outpacing Optimism despite launching years later.
  `.trim(),

  fact: 'Base is Coinbase\'s OP Stack L2 — no native token, sequencer revenue in ETH, one-tap Coinbase on-ramp, and the regulatory clarity of a publicly listed US company. Reached $8B+ TVL faster than any previous L2.',
  plain: 'Base is an Ethereum L2 built by Coinbase. Fast, cheap, no token, connects directly to your Coinbase account. The safest-feeling L2 for mainstream users because Coinbase is a regulated company.',
  stars: [440, 540, 680], target: 680, coins: 40,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[New DeFi user, choosing an L2]',
      scenario: 'Amara has $2,000 on Coinbase and wants to try DeFi for the first time. She compares Base, Arbitrum, and Optimism.',
      outcome: 'Base: one tap from her Coinbase account, no separate bridge, familiar Coinbase branding, Coinbase support if something goes wrong. Arbitrum: better DeFi depth but requires MetaMask setup and a bridge from a separate wallet. Optimism: similar to Base but no Coinbase on-ramp. For a first-time DeFi user, Base\'s Coinbase integration eliminates the most confusing step. She chooses Base.',
    },
    {
      contextTag: '[Institutional, regulatory angle]',
      scenario: 'A fintech company wants to build a consumer payment app on a blockchain. They need regulatory certainty. Their legal team evaluates available L2s.',
      outcome: 'Arbitrum and Optimism are run by foundations with uncertain regulatory status. Base is operated by Coinbase — a NASDAQ-listed company with established SEC relationships, existing compliance infrastructure, and a US banking charter in progress. For a regulated fintech, building on Base means their infrastructure partner has cleared many of the same regulatory hurdles they face. Base wins the evaluation.',
    },
    {
      contextTag: '[Developer, comparing L2 ecosystems]',
      scenario: 'Marcus is building a consumer app targeting mainstream users. He evaluates Base vs Polygon vs Arbitrum.',
      outcome: 'Polygon: low fees but less DeFi depth, reputation for centralisation. Arbitrum: deepest DeFi TVL but no natural mainstream on-ramp. Base: Coinbase\'s 100M user base is a potential distribution channel, ERC-4337 smart accounts enable seedless UX, and account abstraction is well-supported. For a consumer app targeting non-crypto-native users, Base\'s mainstream on-ramp and account abstraction support wins.',
    },
  ],

  keyTakeaway: 'Base is Coinbase\'s OP Stack L2 — no token (sequencer fees in ETH), direct Coinbase on-ramp, and the regulatory clarity of a publicly listed company. It is the most accessible and institutionally credible L2 for mainstream adoption.',

  guidedPractice: [
    {
      question: 'Why did Coinbase choose not to issue a BASE token?',
      options: [
        'Coinbase lacked the technical capability to issue an L2 governance token',
        'Issuing a token creates regulatory risk (potential securities classification). Coinbase earns sequencer revenue in ETH instead — capturing L2 value without token regulatory exposure',
        'Base plans to issue a token in 2026 once regulatory clarity improves',
        'The OP Stack framework does not support native token issuance',
      ],
      correct: 1,
      hint: 'What happened to tokens that regulators classified as securities? What does Coinbase avoid by not issuing one?',
      explanation: 'The SEC has pursued multiple enforcement actions against crypto tokens it classified as unregistered securities. Coinbase, as a publicly listed company with an existing SEC relationship, faces significant legal risk from any token that could be classified this way. By earning revenue through sequencer fees (paid in ETH — an established commodity), Coinbase captures L2 economic value without issuing a token that could trigger securities regulation. This is a deliberate, legally-informed decision.',
    },
    {
      question: 'What makes Base\'s Coinbase on-ramp strategically significant?',
      options: [
        'It allows free ETH transfers between Coinbase and Base',
        'It eliminates the most confusing step in L2 adoption — bridging from a separate wallet — for Coinbase\'s 100M existing users',
        'It gives Base users priority access to Coinbase exchange listings',
        'It allows Base users to earn Coinbase stock rewards',
      ],
      correct: 1,
      hint: 'What is the biggest friction point for new DeFi users trying to reach an L2?',
      explanation: 'For most users, the biggest L2 barrier is bridging: install MetaMask, buy ETH, configure the L2 network, find a bridge, approve, wait, confirm arrival. Base eliminates all of this for Coinbase users — one tap sends funds from their exchange account directly to Base. For 100 million users already on Coinbase, the journey from "I have money on an exchange" to "I\'m using DeFi" goes from 10 confusing steps to 1.',
    },
    {
      question: 'Base is built on the OP Stack. What does this mean for its security?',
      options: [
        'Base relies entirely on Optimism\'s validators for security',
        'Base inherits Ethereum\'s security — it posts transaction proofs to Ethereum mainnet, which is secured by 900,000+ validators',
        'Base has its own independent validator set separate from both Optimism and Ethereum',
        'OP Stack security depends on the Coinbase sequencer being honest at all times',
      ],
      correct: 1,
      hint: 'What does an L2 post to Ethereum mainnet and why?',
      explanation: 'Base, like all OP Stack chains, posts transaction data and fraud proofs to Ethereum mainnet. This means the security of Base transactions ultimately depends on Ethereum\'s consensus — 900,000+ validators worldwide. If Base\'s sequencer (operated by Coinbase) tried to post a fraudulent state, fraud provers can challenge it on Ethereum. Coinbase operating the sequencer adds centralisation risk for censorship — but cannot steal funds because the canonical state is on Ethereum.',
    },
    {
      question: 'How does Base\'s TVL growth compare to other L2s?',
      options: [
        'Base grew slowly due to lack of DeFi protocols at launch',
        'Base reached $8B+ TVL faster than any previous L2 — the Coinbase on-ramp and institutional trust accelerated adoption significantly',
        'Base\'s TVL is primarily from Coinbase corporate treasury, not user deposits',
        'Base surpassed Ethereum mainnet TVL within its first year',
      ],
      correct: 1,
      hint: 'What does 100M existing Coinbase users plus a one-tap on-ramp do to TVL growth rate?',
      explanation: 'Base accumulated $8B+ in TVL faster than any L2 before it. The Coinbase user base provided an immediate potential audience of 100M people already holding crypto on Coinbase — any of whom could move funds to Base in one tap. Combined with institutional confidence from Coinbase\'s regulatory standing, Base attracted both retail and institutional capital faster than L2s that relied entirely on crypto-native users bridging from Ethereum.',
    },
    {
      question: 'What is the key difference between using funds on Coinbase exchange versus funds on Base?',
      options: [
        'There is no difference — Base and Coinbase exchange are the same system',
        'Coinbase exchange is custodial (Coinbase holds your keys). Base is self-custodial (you hold your keys via MetaMask or Coinbase Wallet). Moving to Base gives you DeFi access but removes Coinbase\'s custody protection',
        'Base funds earn higher interest rates than exchange funds',
        'Funds on Base are insured by FDIC, while exchange funds are not',
      ],
      correct: 1,
      hint: 'Who holds the private keys in each case?',
      explanation: 'Coinbase exchange: custodial — Coinbase holds your private keys. If you forget your password, Coinbase can recover your account. Base: self-custodial — your private key (in MetaMask or Coinbase Wallet) controls your funds. If you lose access to your wallet, funds are gone. Moving to Base gives you DeFi superpowers (access to all protocols) but removes the safety net of custodial recovery. This trade-off should be explicit to users making the move.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 152 — Bridging to Base: From Coinbase Exchange Directly
// ─────────────────────────────────────────────────────────────────────────────

const L152: IslandLevel = {
  id: 152, mechanic: 'memory', tier: 'pro',
  topic: 'Bridging to Base — From Coinbase Exchange Directly',

  explanation: `
In October 2023, a Coinbase user sent $5,000 from their exchange account to Base, swapped on Aerodrome, and earned 12% APY on their stablecoins — all within 15 minutes. Six months earlier, the same journey would have required 45 minutes, three apps, and two bridge transactions. Base changed the on-ramp.

There are three ways to get funds onto Base, each with different speed, cost, and security trade-offs.

The Coinbase direct route is the simplest. Inside the Coinbase mobile app or website, navigate to "Send" and select Base as the network. Your funds move from Coinbase's exchange wallet directly to your Base wallet address. Settlement: minutes. Cost: Coinbase's standard withdrawal fee (typically $0–$1). Security: Coinbase handles the bridge internally.

The canonical bridge at bridge.base.org is the most secure option for moving funds from Ethereum mainnet to Base. It uses the OP Stack's native bridge mechanism — proofs posted to Ethereum. Deposits (Ethereum → Base): ~1 minute. Withdrawals (Base → Ethereum): 7 days due to the optimistic rollup challenge period. Cost: L1 gas fees.

Third-party fast bridges — Across Protocol, Stargate, Hop Protocol — bypass the 7-day withdrawal window by using liquidity pools on both sides. You send Base ETH to the bridge; it gives you Ethereum ETH from its pool immediately; the canonical settlement happens in the background. Settlement: 2–30 minutes. Cost: bridge fee (0.05–0.3%). Security: trust the bridge protocol's liquidity and smart contracts.

The practical rule: for amounts under $10,000 moving frequently, third-party bridges. For large amounts where 7 days is acceptable, canonical bridge.
  `.trim(),

  fact: 'Three ways to reach Base: Coinbase direct (minutes, internal), canonical bridge.base.org (1-min deposit / 7-day withdrawal), and third-party fast bridges like Across (2–30 min both ways, small fee). Coinbase direct is unique to Base among all L2s.',
  plain: 'Getting money onto Base: easiest is directly from your Coinbase account. Alternatively, use the official bridge (slow withdrawals) or fast bridges like Across (quick both ways, small fee).',
  stars: [500, 615, 770], target: 770, coins: 44,
  simulatorLesson: 'bridge',

  examples: [
    {
      contextTag: '[First Base transaction]',
      scenario: 'Priya has $3,000 USDC on Coinbase and wants to try Aerodrome on Base. She has never used a self-custody wallet before.',
      outcome: 'Step 1: Download Coinbase Wallet app (separate from Coinbase app). Step 2: On Coinbase.com, click "Send" → select Base network → enter her Coinbase Wallet address → send $3,000 USDC. Arrives in ~2 minutes. Step 3: In Coinbase Wallet, she is now on Base with $3,000 USDC ready to use. Total time: 5 minutes. No MetaMask, no bridge interface, no gas confusion. This is the Coinbase user experience advantage.',
    },
    {
      contextTag: '[Fast bridge for withdrawal]',
      scenario: 'Marcus has $8,000 ETH on Base he wants back on Ethereum mainnet quickly. He checks his options.',
      outcome: 'Canonical bridge: 7 days. Not acceptable. Across Protocol: he deposits Base ETH, selects Ethereum mainnet as destination, receives ETH on Ethereum in ~4 minutes. Fee: 0.05% on $8,000 = $4. Total cost: $4 + ~$3 gas. For the $7 total fee, he gets instant settlement vs 7 days of waiting. He uses Across. The canonical bridge\'s 7-day period exists for fraud proofs — Across accepts that risk in exchange for providing immediate liquidity.',
    },
    {
      contextTag: '[Large amount, canonical bridge]',
      scenario: 'Keiko is moving $120,000 from Ethereum to Base for a long-term DeFi deployment. She evaluates bridge options.',
      outcome: 'Third-party bridge: 0.1% fee on $120,000 = $120. Canonical bridge: ~$15 in L1 gas, no protocol fee, 7-day withdrawal when needed. For a long-term deployment where she won\'t need to withdraw quickly, the canonical bridge saves her $105 in fees and eliminates third-party smart contract risk. She uses bridge.base.org, deposits arrive in ~2 minutes, and she sets a calendar reminder for the 7-day withdrawal window if she ever needs to exit.',
    },
  ],

  keyTakeaway: 'Three Base on-ramps: Coinbase direct (fastest, unique to Base users), canonical bridge (most secure, 7-day withdrawal), fast bridges like Across (2–30 min both ways, small fee). Match the method to the amount and urgency.',

  guidedPractice: [
    {
      question: 'Why does the canonical Base bridge require 7 days for withdrawals?',
      options: [
        'Coinbase manually reviews all withdrawal requests for fraud',
        'The 7-day challenge window allows fraud provers to submit evidence of invalid state transitions — ensuring only legitimate withdrawals execute on Ethereum',
        'ETH on-chain settlement takes 7 days by design',
        'The 7-day period allows Coinbase to earn interest on your funds during transit',
      ],
      correct: 1,
      hint: 'What is "optimistic" about an optimistic rollup? Who can challenge during the window?',
      explanation: 'Base is an optimistic rollup — it assumes all transactions are valid and publishes them to Ethereum, but allows a 7-day challenge period where fraud provers can submit evidence of invalid state. Only after 7 challenge-free days does the withdrawal finalise on Ethereum. This is the security mechanism: any invalid withdrawal attempt can be caught during the window. Fast bridges bypass this by using liquidity on the Ethereum side — accepting the bridge protocol risk in exchange for instant settlement.',
    },
    {
      question: 'You need $15,000 back on Ethereum from Base within 2 hours. Which bridge should you use?',
      options: [
        'Canonical bridge at bridge.base.org — most secure option',
        'A fast bridge like Across Protocol — provides liquidity on Ethereum immediately, settling the canonical bridge transaction in the background',
        'Coinbase exchange — send Base ETH to Coinbase then withdraw to Ethereum',
        'Wait 7 days and use the canonical bridge',
      ],
      correct: 1,
      hint: 'The canonical bridge takes 7 days. Coinbase withdrawal to Ethereum is also slow. What provides Ethereum-side liquidity immediately?',
      explanation: 'Fast bridges (Across, Stargate, Hop) maintain liquidity pools on both Base and Ethereum. When you deposit Base ETH, the bridge gives you Ethereum ETH from its existing Ethereum-side pool — immediate settlement. The bridge then processes the canonical settlement in the background over 7 days. You pay a small fee (0.05–0.3%) for this service. For $15,000 with 2-hour urgency, the ~$15–$45 bridge fee is well worth the instant settlement.',
    },
    {
      question: 'What is unique about the Coinbase-to-Base direct transfer compared to other L2 on-ramps?',
      options: [
        'It is the only free bridge to any L2 in existence',
        'It allows funds to move directly from a Coinbase exchange account to Base without using a separate bridge interface or self-custody wallet first',
        'It bypasses Ethereum entirely, using Coinbase\'s private blockchain for settlement',
        'It is only available for USDC, not ETH or other tokens',
      ],
      correct: 1,
      hint: 'What step does every other L2 require that Base + Coinbase eliminates?',
      explanation: 'Every other L2 requires: (1) withdraw from exchange to self-custody wallet, (2) configure L2 network in wallet, (3) go to bridge, (4) bridge to L2. Base with Coinbase: send directly from your Coinbase account to your Base wallet address. Steps 1–3 collapse into a single "Send" flow inside Coinbase. No other L2 has a direct exchange on-ramp of this quality because no other L2 is operated by a major centralised exchange.',
    },
    {
      question: 'A third-party bridge like Across charges 0.1% to bridge $50,000 from Base to Ethereum. What are you paying for?',
      options: [
        'The bridge\'s profit margin on the transaction',
        'The cost of providing immediate Ethereum-side liquidity — the bridge takes on the 7-day settlement risk and capital lockup cost so you don\'t have to wait',
        'Ethereum gas fees for the settlement transaction',
        'Insurance against smart contract failure',
      ],
      correct: 1,
      hint: 'What risk does the bridge take on that you are avoiding by using it?',
      explanation: 'The bridge provides you with Ethereum-side liquidity immediately from its existing pool. In exchange, it must wait 7 days for the canonical settlement to recover that liquidity. During those 7 days, the bridge has $50,000 locked up that it cannot redeploy. The 0.1% fee ($50) compensates for: capital opportunity cost over 7 days, the risk of the canonical settlement failing (rare but possible), and operational costs. You pay $50 to avoid 7 days of waiting — straightforward time-value exchange.',
    },
    {
      question: 'For a $200,000 long-term DeFi deployment from Ethereum to Base, which bridge method is most appropriate?',
      options: [
        'Fast bridge — faster is always better regardless of amount',
        'Canonical bridge at bridge.base.org — largest amounts justify the most secure path, and a 7-day future withdrawal is acceptable for long-term deployment',
        'Multiple Coinbase withdrawals split across days',
        'Any bridge is equivalent for amounts over $50,000',
      ],
      correct: 1,
      hint: 'What does 0.1% cost on $200,000? What does the canonical bridge cost? Which risk matters more at this size?',
      explanation: '0.1% fast bridge fee on $200,000 = $200. Canonical bridge: ~$20–$30 in L1 gas, no protocol fee. Saving $170–$180 is meaningful. More importantly: $200,000 concentrates significant smart contract risk in the fast bridge\'s liquidity contracts. The canonical bridge uses the OP Stack\'s native mechanism — audited by the OP Stack team and backed by Ethereum\'s security. For long-term deployment where withdrawal timing flexibility exists, the canonical bridge\'s lower cost and higher security both favour it.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 153 — cbBTC: Bitcoin on Base
// ─────────────────────────────────────────────────────────────────────────────

const L153: IslandLevel = {
  id: 153, mechanic: 'chain', tier: 'pro',
  topic: 'cbBTC — Bitcoin on Base',

  explanation: `
In September 2024, Coinbase launched cbBTC — a wrapped Bitcoin token on Base and Ethereum. Within three months, it held over $2 billion in BTC. This was not the first wrapped Bitcoin — wBTC had existed since 2019 — but cbBTC represented something different: Bitcoin in DeFi backed by a regulated, publicly listed custodian.

cbBTC works on a simple mechanism: deposit real Bitcoin with Coinbase, receive cbBTC 1:1 on Base or Ethereum. Redeem cbBTC to get Bitcoin back. The BTC backing is held in Coinbase's institutional custody — the same cold storage used for its exchange reserves, subject to SOC 2 audits and US regulatory oversight.

The trust model is explicit: you trust Coinbase to hold the BTC. This is "custodial wrapping" — the Bitcoin is not locked in a smart contract enforced by cryptography; it is held by a company. If Coinbase fails, halts operations, or is seized by regulators, your cbBTC could be affected. This is fundamentally different from native Bitcoin, which requires no trusted custodian.

Comparing cbBTC to wBTC: wBTC is custodied by BitGo (a licensed trust company). cbBTC is custodied by Coinbase. Both are regulated US entities. Coinbase is larger, more liquid, and NASDAQ-listed — many consider it marginally higher trust, though the fundamental model is identical.

The use case: cbBTC brings Bitcoin into Base DeFi. You can earn yield on cbBTC in Moonwell lending markets, provide liquidity in cbBTC/ETH Aerodrome pools, use it as collateral in borrowing protocols — without selling your BTC. For long-term Bitcoin holders who want to put idle BTC to work, cbBTC is the primary mechanism on Base.
  `.trim(),

  fact: 'cbBTC is Coinbase\'s 1:1 wrapped Bitcoin on Base and Ethereum — BTC held in Coinbase institutional custody, redeemable at any time. Enables Bitcoin holders to use Base DeFi without selling BTC exposure.',
  plain: 'cbBTC is Bitcoin you can use in DeFi. Deposit BTC with Coinbase, get cbBTC on Base 1:1, use it in lending or liquidity pools. You trust Coinbase to hold the real Bitcoin.',
  stars: [560, 690, 860], target: 860, coins: 48,
  simulatorLesson: 'cbBtcExplainer',

  examples: [
    {
      contextTag: '[Bitcoin holder, adding yield]',
      scenario: 'James holds 0.5 BTC ($35,000) in cold storage. It has earned nothing for 3 years. He learns about cbBTC and considers using it in Moonwell lending on Base.',
      outcome: 'He mints 0.5 cbBTC via Coinbase, receives it on Base, deposits into Moonwell as collateral earning ~2% APY. He borrows $10,000 USDC against it (50% LTV, safe from liquidation unless BTC drops 50%+) and deploys USDC into an Aerodrome stablecoin pool at 8% APY. Net: 0.5 BTC still his, earns ~2% on BTC value + 8% on the $10K USDC. He is comfortable with Coinbase as custodian given their regulatory standing.',
    },
    {
      contextTag: '[Trust model comparison]',
      scenario: 'Amara asks: "What is the difference between holding cbBTC and holding actual Bitcoin?" She wants to understand exactly what she is trusting.',
      outcome: 'Native BTC: held in your own wallet — only you can spend it, protected by cryptography. No counterparty risk. cbBTC: Coinbase holds the Bitcoin. You hold a token representing it. Coinbase risks: (1) insolvency — Coinbase goes bankrupt, creditors claim assets; (2) regulatory seizure — government orders Coinbase to freeze assets; (3) operational failure — smart contract bug. All are low probability given Coinbase\'s size and regulation — but categorically different from self-custody.',
    },
    {
      contextTag: '[DeFi yield on BTC]',
      scenario: 'Keiko has 1 cbBTC and wants to earn yield without selling BTC exposure. She evaluates Aerodrome cbBTC/USDC pool vs Moonwell cbBTC supply.',
      outcome: 'Moonwell cbBTC supply: ~2.5% APY, no IL risk, cbBTC stays cbBTC. Risk: Moonwell smart contract. Aerodrome cbBTC/USDC pool: ~8–12% APY (fees + AERO emissions) but IL risk if BTC price moves significantly vs USDC. Since she is a long-term BTC believer and does not want to lose BTC exposure through IL, she chooses Moonwell. Lower yield, no IL risk, simpler.',
    },
  ],

  keyTakeaway: 'cbBTC is 1:1 BTC wrapped by Coinbase institutional custody — enabling Bitcoin use in Base DeFi without selling. The trust model is custodial: you trust Coinbase, not cryptographic self-custody. Lower risk than most custodians, but categorically different from holding native BTC.',

  guidedPractice: [
    {
      question: 'What is the fundamental trust assumption of holding cbBTC?',
      options: [
        'You trust Ethereum\'s validators to secure the cbBTC smart contract',
        'You trust Coinbase to hold the underlying BTC in custody and honour redemptions — losing self-sovereign Bitcoin ownership in exchange for DeFi utility',
        'You trust the Base sequencer not to censor your cbBTC transactions',
        'cbBTC is trustless — it uses zero-knowledge proofs to verify BTC reserves without counterparty trust',
      ],
      correct: 1,
      hint: 'Who holds the real Bitcoin when you hold cbBTC?',
      explanation: 'Coinbase holds the real Bitcoin. Your cbBTC token is a claim on that Bitcoin — honoured as long as Coinbase operates normally. If Coinbase were to halt redemptions, become insolvent, or be subject to regulatory seizure, cbBTC holders could face delays or losses. This is custodial counterparty risk — fundamentally different from holding Bitcoin in self-custody where no third party can prevent you spending it.',
    },
    {
      question: 'What is the primary use case for cbBTC in Base DeFi?',
      options: [
        'Trading cbBTC for USDC on Aerodrome for short-term speculation',
        'Using Bitcoin\'s value in DeFi protocols — as lending collateral, LP, or yield-earning asset — without selling the underlying BTC exposure',
        'Locking cbBTC in veAERO for governance voting',
        'Using cbBTC as gas fees on Base instead of ETH',
      ],
      correct: 1,
      hint: 'What does a long-term Bitcoin holder want to do with idle BTC?',
      explanation: 'Long-term Bitcoin holders typically hold BTC as a savings asset — but Bitcoin natively earns no yield and cannot participate in DeFi. cbBTC brings BTC exposure into Base\'s DeFi ecosystem: supply to Moonwell to earn APY, provide cbBTC/ETH liquidity on Aerodrome, or borrow stablecoins against cbBTC collateral. All without selling BTC or losing Bitcoin price exposure. The BTC remains as backing; only the token moves into DeFi.',
    },
    {
      question: 'How does cbBTC differ from holding wBTC?',
      options: [
        'cbBTC is backed by Bitcoin; wBTC is backed by USDC',
        'Both are custodial wrapped Bitcoin — the difference is the custodian: Coinbase (cbBTC, NASDAQ-listed) vs BitGo (wBTC, licensed trust company). Both carry custodial counterparty risk',
        'cbBTC has a 1:1 backing; wBTC can be fractionally reserved',
        'wBTC uses a decentralised custody model; cbBTC is centralised',
      ],
      correct: 1,
      hint: 'What does each token use as the custodian of the underlying Bitcoin?',
      explanation: 'Both cbBTC and wBTC are custodial wrapped Bitcoin with 1:1 BTC backing — the mechanism is identical. The difference is the custodian: Coinbase (cbBTC) is a $10B+ market cap publicly listed US company with SEC oversight. BitGo (wBTC) is a licensed trust company. Both are regulated US entities — cbBTC is arguably marginally higher trust given Coinbase\'s size and public listing, but the fundamental risk model is the same. Neither is trustless in the way native Bitcoin is.',
    },
    {
      question: 'Why might providing cbBTC/USDC liquidity on Aerodrome be riskier than supplying cbBTC to Moonwell lending?',
      options: [
        'Aerodrome charges higher fees than Moonwell',
        'LP positions experience impermanent loss if BTC price moves significantly — if BTC rises 50%, your LP position converts partially to USDC, reducing your Bitcoin exposure',
        'Aerodrome does not accept cbBTC as a valid token',
        'Moonwell has higher smart contract security than Aerodrome',
      ],
      correct: 1,
      hint: 'What happens to a BTC/USDC LP position when BTC price increases significantly?',
      explanation: 'Impermanent loss (IL): in a BTC/USDC LP, when BTC price rises, the AMM rebalances by selling BTC and buying more USDC — reducing your BTC exposure and increasing USDC. If you are a long-term Bitcoin believer, this is a problem: a BTC pump results in you holding less BTC than you started with. Moonwell supply earns yield on your cbBTC without any IL — your cbBTC stays cbBTC regardless of price movements. The LP earns more fees but risks reducing your Bitcoin exposure during price appreciation.',
    },
    {
      question: 'You hold 0.1 cbBTC ($7,000) on Base. Coinbase announces it is suspending cbBTC redemptions for regulatory compliance. What happens?',
      options: [
        'cbBTC automatically converts to native BTC on your Base wallet',
        'You still hold cbBTC on Base and can still trade it on Aerodrome, but you cannot redeem it for native Bitcoin until Coinbase resumes redemptions — the DeFi token and the underlying BTC are temporarily disconnected',
        'Your cbBTC is automatically returned to Coinbase exchange as BTC',
        'The cbBTC smart contract prevents trading during suspension periods',
      ],
      correct: 1,
      hint: 'cbBTC is a token on Base. Coinbase holds the BTC. What can happen if Coinbase suspends redemptions?',
      explanation: 'A redemption suspension means Coinbase stops converting cbBTC → BTC. Your cbBTC token still exists on Base and can still be traded on Aerodrome or used in DeFi — but its value may deviate from Bitcoin\'s price if the market loses confidence in redemption. This is the core custodial risk: the token and its backing are separated by Coinbase\'s operational ability to honour redemptions. This risk is low probability given Coinbase\'s regulatory standing — but it is categorically real.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 154 — Aerodrome: Base's Leading DEX
// ─────────────────────────────────────────────────────────────────────────────

const L154: IslandLevel = {
  id: 154, mechanic: 'match3', tier: 'pro',
  topic: 'Aerodrome — Base\'s Leading DEX',

  explanation: `
In September 2023, Aerodrome launched on Base and became its dominant DEX within 60 days. By 2024, it was processing $500M+ in weekly volume — more than Uniswap on Base. Its secret: a tokenomics model called ve(3,3) that aligns liquidity providers, token holders, and the protocols that need deep liquidity.

Aerodrome uses the ve(3,3) model pioneered by Solidly and refined by Velodrome (its sister protocol on Optimism). The core idea: lock AERO tokens to receive veAERO (vote-escrow AERO), which gives you two powers — weekly votes on which pools receive AERO emissions, and the right to collect trading fees from the pools you vote for.

The flywheel: protocols need deep liquidity for their tokens. To get it, they need Aerodrome to direct emissions to their pool. To get emissions, they need veAERO holders to vote for their pool. To attract votes, protocols either buy AERO to lock (accumulating voting power) or bribe veAERO holders (paying them in their own token to vote for their pool). veAERO holders earn: fees from pools they voted for + any bribes from protocols. This creates self-sustaining, protocol-directed liquidity.

For regular users, Aerodrome has two simple interfaces. Swapping: find the best price across Aerodrome's pool types (stable pools for correlated assets like USDC/USDT at 0.01% fee, volatile pools for uncorrelated assets like ETH/USDC at 0.3%). Liquidity providing: deposit token pairs to earn trading fees + AERO emissions.

Pool choice matters: stable pools use a special curve optimised for pegged assets (minimal slippage). Volatile pools use the standard constant-product formula. Always check which pool type your swap routes through.
  `.trim(),

  fact: 'Aerodrome is Base\'s dominant DEX using ve(3,3) tokenomics: lock AERO → veAERO → vote on pool emissions → earn fees + bribes. Stable pools (0.01% fee) for pegged assets; volatile pools (0.3%) for uncorrelated pairs.',
  plain: 'Aerodrome is the biggest DEX on Base. Lock AERO tokens to vote on where rewards go — pools you vote for pay you their trading fees. For users: swap tokens or provide liquidity to earn fees and AERO rewards.',
  stars: [620, 763, 954], target: 954, coins: 52,
  simulatorLesson: 'aerodromeSwap',

  examples: [
    {
      contextTag: '[Simple user, swapping on Aerodrome]',
      scenario: 'Amara wants to swap $2,000 USDC for ETH on Base. She has used Uniswap before. She opens Aerodrome.',
      outcome: 'Aerodrome shows the best route: $2,000 USDC → ETH via the volatile USDC/ETH pool at 0.3% fee. Expected ETH received: 0.625 ETH (at $3,200/ETH). Gas: ~$0.05 on Base. Total fees: $6. She approves the transaction. Compare to Ethereum mainnet Uniswap: same swap would cost $5–$30 in gas. The user experience is nearly identical; only the cost differs dramatically.',
    },
    {
      contextTag: '[LP provider, understanding emissions]',
      scenario: 'Marcus provides $5,000 to the USDC/USDT stable pool on Aerodrome. He checks his APY: 4% fees + 8% AERO emissions = 12% total. He asks where the 8% AERO comes from.',
      outcome: 'Aerodrome emits new AERO tokens weekly to pools according to veAERO holder votes. The USDC/USDT pool received 8% of this week\'s emissions because veAERO holders voted for it (attracted by stablecoin utility). Marcus receives AERO tokens proportional to his share of the pool, on top of his 4% trading fee yield. If AERO emissions decrease or votes shift to other pools, his APY changes accordingly. Emissions are not guaranteed.',
    },
    {
      contextTag: '[Protocol, using ve(3,3) to get liquidity]',
      scenario: 'A new DeFi protocol on Base (NEWPROTOCOL) needs deep liquidity for its NEWTOKEN/ETH pair. They evaluate how to attract it on Aerodrome.',
      outcome: 'Option 1: Buy AERO, lock it as veAERO, vote for NEWTOKEN/ETH pool. Permanent voting power but requires capital. Option 2: Bribe veAERO holders — offer 1,000 NEWTOKEN per week to any veAERO holder who votes for their pool. veAERO holders compare bribe value to trading fee value to decide where to vote. The protocol with the most compelling economics (fees + bribes) attracts the most votes and therefore the most AERO emissions and liquidity. This is the ve(3,3) market for liquidity.',
    },
  ],

  keyTakeaway: 'Aerodrome\'s ve(3,3) model creates a market for liquidity: lock AERO → vote on emissions → earn fees + bribes. For users: stable pools (0.01%) for pegged assets, volatile pools (0.3%) for uncorrelated pairs. Emissions are protocol-directed and change weekly.',

  guidedPractice: [
    {
      question: 'What does "ve" stand for in veAERO and what does locking AERO give you?',
      options: [
        'Verified — your AERO is audited before locking',
        'Vote-escrow — locking AERO for a fixed time gives you veAERO, which grants weekly votes on pool emissions and the right to collect trading fees from pools you voted for',
        'Variable-emission — your AERO generates variable amounts of new tokens',
        'Vault-escrow — your AERO is stored in a secure vault earning fixed interest',
      ],
      correct: 1,
      hint: 'What two powers does veAERO grant that plain AERO does not?',
      explanation: 'Vote-escrow (ve) means locking tokens for a duration to receive governance power. veAERO is non-transferable and time-locked — you cannot sell it, but it gives you: (1) weekly votes on which pools receive AERO token emissions (directing liquidity incentives), and (2) the right to collect all trading fees from the pools you voted for. The longer you lock, the more veAERO you receive per AERO locked.',
    },
    {
      question: 'Why would a protocol pay bribes to veAERO holders?',
      options: [
        'Bribing is required by Aerodrome\'s smart contracts for new token listings',
        'Protocols need veAERO votes to direct AERO emissions to their token\'s pool — more emissions = deeper liquidity = less slippage = more users = more fee revenue',
        'Bribes are a form of dividend paid to governance participants',
        'Protocols bribe to prevent their tokens from being removed from Aerodrome',
      ],
      correct: 1,
      hint: 'What do AERO emissions give an LP pool? Why does a new protocol need this?',
      explanation: 'AERO emissions are additional token rewards for LPs in a pool. More emissions attract more liquidity providers. More liquidity = lower slippage for traders = more trading volume = more attractive for users. A protocol launching a new token needs deep liquidity on day one — otherwise large trades cause 20%+ slippage and users avoid it. By bribing veAERO holders (offering their own token as incentive to vote for their pool), they purchase deep Aerodrome liquidity without needing to own large amounts of AERO themselves.',
    },
    {
      question: 'You want to swap $10,000 USDC for USDT on Aerodrome. Which pool type should handle this swap?',
      options: [
        'Volatile pool (0.3% fee) — standard for all swaps',
        'Stable pool (0.01% fee) — optimised for correlated/pegged assets like USDC/USDT, offering minimal slippage and far lower fees',
        'Either pool — Aerodrome automatically routes to the cheapest option',
        'Stable pools only work for wrapped versions of the same token',
      ],
      correct: 1,
      hint: 'USDC and USDT are both $1 stablecoins. What curve is optimised for assets that should be at the same price?',
      explanation: 'USDC and USDT are both pegged to $1 — they are correlated assets. Stable pools use the Curve-style StableSwap invariant, which provides near-zero slippage for pegged assets and charges only 0.01% vs 0.3% for volatile pools. On a $10,000 swap: stable pool fee = $1, volatile pool fee = $30. The routing algorithm should automatically select the stable pool, but always verify the pool type and fee in the swap interface before confirming.',
    },
    {
      question: 'Aerodrome shows 18% APY for a pool: 5% from fees and 13% from AERO emissions. What risk applies to the 13% emissions component?',
      options: [
        'No risk — AERO emissions are guaranteed by the Aerodrome smart contract',
        'Emission APY is variable — it changes weekly based on veAERO votes. If votes shift to other pools, your pool receives fewer emissions and your APY decreases',
        'Emissions are only paid for the first month; after that only fees remain',
        'The 13% is paid in USDT, not AERO — stablecoin emission risk applies',
      ],
      correct: 1,
      hint: 'Who decides which pools receive AERO emissions? Can that change?',
      explanation: 'veAERO holders vote weekly on emission distribution. This week\'s 13% APY from emissions requires the pool to receive the same share of emissions next week — which requires the same votes from veAERO holders. Votes change based on: which bribes are most attractive, which pools have most trading fees, and strategic decisions by large veAERO holders. A pool receiving 13% emission APY today could receive 5% next week if votes shift. The fee component (5%) is more stable — it depends on trading volume, not votes.',
    },
    {
      question: 'A veAERO holder votes for Pool A (USDC/ETH) this week. What do they receive?',
      options: [
        'AERO emissions proportional to Pool A\'s share of total emissions',
        'All trading fees generated by Pool A during that week, proportional to their share of total veAERO votes on Pool A, plus any bribes offered by protocols for voting on Pool A',
        'A share of Pool A\'s LP positions in proportion to their voting power',
        'A portion of Aerodrome\'s platform revenue across all pools',
      ],
      correct: 1,
      hint: 've(3,3) gives voters the fees from the pools they vote for — not the emissions.',
      explanation: 'The ve(3,3) model: LPs receive AERO emissions. veAERO voters receive trading fees + bribes from the pools they vote for. This alignment is deliberate: voters are incentivised to vote for pools with high trading volume (more fees) and pools offering attractive bribes. LPs are incentivised to provide liquidity to pools receiving high emissions. The separation of voter rewards (fees) from LP rewards (emissions) prevents large token holders from voting for their own pools and extracting value unfairly.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 155 — Base DeFi Ecosystem: Moonwell, Seamless, ExtraFi
// ─────────────────────────────────────────────────────────────────────────────

const L155: IslandLevel = {
  id: 155, mechanic: 'memory', tier: 'pro',
  topic: 'Base DeFi Ecosystem — Moonwell, Seamless, ExtraFi',

  explanation: `
By mid-2024, Base had three mature lending protocols competing for the same stablecoin deposits. Understanding the differences — and why they matter — is the difference between earning 4% and earning 9% on the same USDC.

Moonwell is the largest lending protocol on Base by TVL ($400M+). It is a fork of Compound (the same code that runs Compound Finance on Ethereum, with modifications). Supply assets to earn interest; borrow against collateral. Supported assets: ETH, cbBTC, USDC, cbETH, and more. Supply rate for USDC: typically 4–7% APY. Moonwell is the most audited, most battle-tested option on Base — the conservative choice.

Seamless Protocol is a newer fork of Aave v3 with one key innovation: isolated lending markets. Isolated markets allow each collateral type to operate separately, limiting contagion if one asset fails. If cbBTC collateral loses value rapidly, the isolated market prevents it from draining the USDC pool. This makes Seamless slightly safer for depositors in volatile market conditions, though it also limits borrowing flexibility.

ExtraFi is a yield optimizer and farming aggregator rather than a pure lending protocol. It wraps positions in Aerodrome and other Base protocols into automated vaults — depositing into an LP, auto-compounding fees and emissions, and managing ranges for concentrated liquidity positions. ExtraFi APYs are higher (8–20%) but compound the risks of the underlying protocols (Aerodrome LP risk + ExtraFi smart contract risk).

The selection framework: for stable, conservative yield — Moonwell. For isolated market protection — Seamless. For maximised APY with more complexity — ExtraFi.
  `.trim(),

  fact: 'Base\'s three main lending protocols: Moonwell (Compound fork, most TVL, most audited), Seamless (Aave v3 fork, isolated markets for contagion protection), ExtraFi (yield optimizer wrapping Aerodrome positions, higher APY, more complexity).',
  plain: 'Moonwell: safe, boring, reliable lending. Seamless: safer isolated markets. ExtraFi: higher yields by automating Aerodrome LP strategies. Match the protocol to your risk tolerance.',
  stars: [680, 836, 1045], target: 1045, coins: 56,
  simulatorLesson: 'defi',

  examples: [
    {
      contextTag: '[Conservative yield seeker]',
      scenario: 'Priya has $20,000 USDC and wants the safest possible Base yield. She evaluates Moonwell vs Seamless vs ExtraFi.',
      outcome: 'Moonwell: 5.2% APY, Compound fork (4+ years of audit history), $400M TVL. Seamless: 5.8% APY, Aave v3 fork, isolated markets. ExtraFi: 11% APY via Aerodrome USDC/USDT vault. She chooses Moonwell: battle-tested Compound code, highest TVL (more liquidation depth), lowest smart contract risk for a first Base DeFi position. She plans to move to ExtraFi after 3 months once she understands Base better.',
    },
    {
      contextTag: '[Understanding isolated markets]',
      scenario: 'Marcus asks: "Why does Seamless isolated market lending matter? Isn\'t all lending the same?"',
      outcome: 'Traditional lending (Moonwell/Compound): all collateral types share one pool. If cbBTC crashes 80% faster than liquidators can act, bad debt spreads across the entire protocol — USDC depositors absorb losses. Seamless isolated market: cbBTC collateral is in its own market. If cbBTC crashes, only the cbBTC market has bad debt — USDC depositors in other markets are protected. This contagion isolation is especially valuable when the collateral includes volatile or newer tokens.',
    },
    {
      contextTag: '[Yield maximiser, ExtraFi]',
      scenario: 'Keiko wants 10%+ on her $10,000 USDC and is comfortable with some complexity. She evaluates ExtraFi.',
      outcome: 'ExtraFi offers an auto-compounding USDC/USDT Aerodrome vault: 11.5% APY from fees (4%) + AERO emissions (7.5%). ExtraFi automatically harvests AERO rewards and reinvests them — compound interest increases effective yield. Risks: (1) Aerodrome smart contract risk, (2) ExtraFi smart contract risk (two layers instead of one), (3) emission APY can change weekly based on veAERO votes. She deposits $5,000 (keeping $5,000 in Moonwell as a conservative base).',
    },
  ],

  keyTakeaway: 'Base\'s DeFi lending stack: Moonwell (Compound, safest, most TVL), Seamless (Aave v3, isolated market protection), ExtraFi (yield optimizer, highest APY, most complexity). Match protocol to risk appetite and USDC allocation size.',

  guidedPractice: [
    {
      question: 'What makes Moonwell the most conservative lending choice on Base?',
      options: [
        'Moonwell offers the highest interest rates for all assets',
        'It is a fork of Compound Finance — code with 4+ years of audit history and battle-testing on Ethereum mainnet with billions in TVL',
        'Moonwell is operated by Coinbase directly, inheriting Base\'s regulatory protection',
        'Moonwell uses isolated markets to prevent all possible contagion',
      ],
      correct: 1,
      hint: 'What makes a DeFi protocol "safe"? Years of use without exploits and deep audit coverage.',
      explanation: 'Moonwell uses Compound Finance\'s codebase — one of the most audited DeFi contracts in existence, with years of operation handling billions on Ethereum. Code that has operated without exploit at scale is the strongest safety signal in DeFi. A new protocol with novel code may offer higher yields but carries unknown vulnerability risk. Moonwell\'s conservatism comes from its heritage, not from being technically inferior.',
    },
    {
      question: 'How do isolated lending markets in Seamless protect USDC depositors?',
      options: [
        'Each user\'s position is isolated from other users — your liquidation does not affect others',
        'Each collateral type operates in its own market — bad debt from a volatile collateral crash is contained to that market, preventing contagion to USDC depositors using other collateral',
        'Seamless isolates deposits geographically by region for regulatory compliance',
        'Isolation prevents any market participant from borrowing more than 50% LTV',
      ],
      correct: 1,
      hint: 'If cbBTC crashes 80% in 10 minutes in a shared pool, what happens to USDC depositors?',
      explanation: 'In a shared pool: cbBTC crashes → liquidations too slow → bad debt accumulates → protocol socialises losses across all depositors including USDC suppliers. In Seamless isolated markets: cbBTC market and USDC market are separate. cbBTC bad debt stays in the cbBTC market. USDC depositors who collateralised with ETH (in a different market) are completely unaffected. Isolation is a form of compartmentalisation — limiting blast radius from single collateral failures.',
    },
    {
      question: 'ExtraFi offers 11% APY on USDC vs Moonwell\'s 5%. Why does this not mean ExtraFi is strictly better?',
      options: [
        'ExtraFi\'s APY is paid in their own token, not USDC',
        'ExtraFi\'s yield compounds two protocol risk layers (Aerodrome + ExtraFi) and variable emission APY — higher return with meaningfully higher smart contract risk and APY uncertainty',
        'ExtraFi locks your USDC for 90 days minimum',
        'ExtraFi\'s 11% is a promotional rate that drops to 5% after the first month',
      ],
      correct: 1,
      hint: 'Where does ExtraFi\'s 11% APY come from? What risks does that route introduce?',
      explanation: 'ExtraFi\'s yield comes from deploying USDC into Aerodrome LP positions and auto-compounding — meaning you have Aerodrome smart contract risk AND ExtraFi smart contract risk simultaneously. A bug in either could affect your funds. Additionally, 7% of the 11% APY comes from AERO emissions that change weekly based on veAERO votes. If emissions shift, APY drops. Moonwell\'s 5% is stable (based on supply/demand for borrowing), comes from one audited contract, and has no emission variability. Higher yield always means different risk — never strictly better.',
    },
    {
      question: 'You supply $30,000 USDC to Moonwell and borrow $15,000 ETH against it. What is your health factor and what happens if ETH price rises 40%?',
      options: [
        'Health factor: 2.0. If ETH rises 40%, your borrowed ETH is worth more and you are at liquidation risk',
        'Health factor: ~1.5. If ETH rises 40%, the ETH you borrowed becomes more expensive to repay — your collateral ratio worsens and you risk liquidation if ETH rises enough',
        'Health factor: undefined. Moonwell does not show health factors',
        'ETH price rising is irrelevant — only collateral price affects health factor',
      ],
      correct: 1,
      hint: 'If you borrowed ETH and ETH gets more expensive, what happens to your debt value vs collateral value?',
      explanation: 'When you borrow ETH, your debt is denominated in ETH — but measured in USD. If ETH rises 40%, your $15,000 ETH debt is now worth $21,000 in USD. Your USDC collateral stays at $30,000. Collateral-to-debt ratio: $30,000 / $21,000 = 1.43 — approaching the liquidation threshold (typically 1.2–1.3×). Borrowing volatile assets against stablecoin collateral creates this risk. The safe approach: borrow stablecoins against ETH collateral — if ETH rises, your collateral value increases and the loan becomes safer.',
    },
    {
      question: 'Comparing Base DeFi lending rates: Moonwell 5.5% USDC, Seamless 6.1% USDC, ExtraFi vault 12% USDC. How should a new Base DeFi user allocate $10,000?',
      options: [
        'All $10,000 to ExtraFi — highest yield maximises return',
        'Start conservatively: $7,000 Moonwell (learn the protocol, stable yield), $3,000 Seamless (slightly higher yield, isolated market safety). Explore ExtraFi after gaining confidence with both simpler protocols',
        'Split equally: $3,333 to each protocol for diversification',
        'All $10,000 to Seamless — isolated markets make it strictly superior to Moonwell',
      ],
      correct: 1,
      hint: 'A new user needs to learn. What is the cost of a mistake at each risk level?',
      explanation: 'For a new DeFi user, the learning cost matters. Starting with Moonwell (simpler, most audited) lets you understand supply/borrow mechanics without complex LP or emission dynamics. Adding Seamless exposes you to the isolated market concept at a higher yield. Jumping directly to ExtraFi introduces Aerodrome LP mechanics, auto-compounding, and emission variability simultaneously. Layering complexity progressively reduces the chance of a costly mistake from misunderstanding a mechanism.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 156 — Memecoins on Base: Culture and Risks
// ─────────────────────────────────────────────────────────────────────────────

const L156: IslandLevel = {
  id: 156, mechanic: 'chain', tier: 'pro',
  topic: 'Memecoins on Base — The Culture and the Risks',

  explanation: `
In early 2024, a memecoin called BRETT launched on Base and reached $1 billion in market cap — making it the largest Base-native token by far. It was followed by TOSHI (named after Coinbase CEO Brian Armstrong's cat) and dozens of others. Base had become a memecoin destination — but with a different demographic than Solana.

Base's memecoin culture is shaped by its user base: primarily Coinbase users who are more retail-mainstream and less DeFi-native than Solana's trading community. This creates characteristic patterns. Base memecoins move slower than Solana memecoins — Solana's sub-cent fees enable rapid speculation in small amounts; Base's slightly higher fees (still $0.01–$0.10) select for slightly larger position sizes. Base memecoins tend to have more sustained narrative arcs rather than pure pump-and-dump cycles.

The tooling differences matter. BaseScan (base.blockscout.com) is Base's block explorer — equivalent to Etherscan for Ethereum. DEXScreener with the Base filter shows live trading data for Base tokens. Token contract auditing uses the same GoPlus Security and TokenSniffer tools as Ethereum.

The memecoin analysis framework from Island 9 applies directly to Base: DEXScreener five-point checklist, bundle detection on BaseScan, LP lock verification, GoPlus contract scan, position sizing at 1–2% of portfolio. The only differences are the explorer (BaseScan vs Solscan) and the chain-specific tools (Aerodrome as the DEX, not Raydium).

Base-specific risk: because Base is connected to Coinbase's reputation, scammers frequently use Coinbase branding ("Official Coinbase Token," "Base Foundation Token") to create false legitimacy. Always verify — Coinbase does not endorse individual tokens on Base.
  `.trim(),

  fact: 'Base memecoins attract Coinbase\'s retail user base — slower price action than Solana but with sustained narratives. Tools: BaseScan (explorer), DEXScreener (Base filter), GoPlus Security (contract scan). Same analysis framework as Island 9 applies.',
  plain: 'Memecoins happen on Base too. The same checklist from Island 9 applies: check liquidity, holders, contract, LP lock. Base-specific scam: fake "Coinbase official" branding. Verify everything.',
  stars: [740, 910, 1138], target: 1138, coins: 60,
  simulatorLesson: 'baseMemeculture',

  examples: [
    {
      contextTag: '[BRETT as case study]',
      scenario: 'James researches BRETT — the first Base memecoin to reach $1B market cap. He traces its growth pattern.',
      outcome: 'BRETT launched February 2024 on Base, themed around a Pepe the Frog derivative. Grew from $0 to $1B in 6 months — much slower than Solana\'s 48-hour pumps. Base\'s slightly higher fees selected against micro-traders; larger holders with longer time horizons dominated. Community: Reddit-adjacent rather than CT-native. Lesson: Base memecoin culture produces slower, more sustained moves than Solana. The same position sizing rules apply (1–2%) but the average hold time is weeks rather than hours.',
    },
    {
      contextTag: '[Fake Coinbase branding scam]',
      scenario: 'Amara sees a token called "BASE OFFICIAL COINBASE TOKEN (BCOT)" with a blue logo similar to Coinbase\'s. The description claims it is "the official token of Base network."',
      outcome: 'Immediate red flags: Base has no official token (Coinbase explicitly chose not to issue one). No legitimate Coinbase announcement would use this name. GoPlus Security check: mint authority active, owner not renounced, honeypot detected. All three flags. The Coinbase branding is designed to trick retail users into trusting a rug pull. Rule: Coinbase does not endorse tokens on Base. Any token claiming official Coinbase status is fraudulent.',
    },
    {
      contextTag: '[Applying Island 9 framework on Base]',
      scenario: 'Marcus finds a new Base memecoin. He applies the DEXScreener checklist: $120,000 liquidity, 680 holders, 58% buy ratio, varied buy sizes, LP 3 hours old. He opens BaseScan.',
      outcome: 'BaseScan shows: top 10 holders own 18% combined (healthy), LP tokens locked 180 days on Team Finance (verifiable on BaseScan), mint authority revoked (in contract). GoPlus: no honeypot. All five DEXScreener points pass. Contract is clean. He notes one difference from Solana: BaseScan trace shows all top wallets funded from different MetaMask addresses over the past week — no bundle detected. He enters 1.5% of portfolio with a staged exit plan at 3× and 7×.',
    },
  ],

  keyTakeaway: 'Base memecoins use the same analysis framework as Island 9 — DEXScreener checklist, BaseScan for wallet tracing, GoPlus for contracts, LP lock on Team Finance. Base-specific: slower price action, Coinbase-branding scams, slightly higher fees select for larger positions.',

  guidedPractice: [
    {
      question: 'Why do Base memecoins tend to have slower price action than Solana memecoins?',
      options: [
        'Base has slower block times than Solana',
        'Base\'s slightly higher fees ($0.01–$0.10 per tx vs $0.00025 on Solana) and Coinbase\'s more mainstream retail user base select for larger position sizes and longer hold times',
        'Base\'s memecoin smart contracts have mandatory 24-hour holding periods',
        'Coinbase restricts rapid trading activity on Base tokens',
      ],
      correct: 1,
      hint: 'Who are the typical Base users? How do they differ from Solana\'s trading community?',
      explanation: 'Solana\'s sub-cent fees enable $5 trades at near-zero cost — enabling rapid speculation in tiny amounts and instant flipping. Base\'s $0.01–$0.10 fees per transaction are still cheap but select against micro-traders. Additionally, Base\'s user base comes primarily from Coinbase — mainstream retail investors with longer time horizons than Solana\'s CT-native traders. These demographic differences produce slower, more sustained price moves rather than Solana\'s characteristic rapid pump-and-dump cycles.',
    },
    {
      question: 'A token on Base calls itself "Official Coinbase Network Token." What does this signal?',
      options: [
        'This is likely Coinbase\'s official ecosystem token',
        'This is a scam — Base has no official token and Coinbase does not endorse individual tokens. "Official Coinbase" branding is a classic Base-specific rug pull tactic',
        'This token will likely be listed on Coinbase exchange soon',
        'Tokens with "official" in the name receive regulatory protection from Coinbase',
      ],
      correct: 1,
      hint: 'Coinbase deliberately chose not to issue a token. What does that mean for any "official Coinbase token"?',
      explanation: 'Coinbase publicly and explicitly chose not to issue a Base or Coinbase token. Any token claiming official Coinbase status is lying. The "Official Coinbase" branding exploits the trust Coinbase users have in the Coinbase brand — familiar logo colours, authoritative language, implied legitimacy. This is Base\'s most common memecoin scam vector because Base attracts non-crypto-native Coinbase users who may not know better. Always verify: go to coinbase.com directly and check for any official announcement.',
    },
    {
      question: 'Which block explorer do you use to trace wallet funding sources on Base?',
      options: [
        'Etherscan — Base uses the same explorer as Ethereum mainnet',
        'BaseScan (base.blockscout.com) — Base\'s dedicated block explorer, equivalent to Solscan for Solana or Etherscan for Ethereum',
        'Solscan — all EVM chains use the same explorer',
        'DEXScreener — it functions as both a price tracker and block explorer',
      ],
      correct: 1,
      hint: 'Each chain has its own block explorer. What is Base\'s?',
      explanation: 'BaseScan (base.blockscout.com) is Base\'s block explorer — showing every wallet\'s transaction history, token holdings, contract interactions, and LP lock status. For bundle detection on Base: open BaseScan, check each large early buyer wallet\'s funding source and creation date. The process is identical to Solscan on Solana — only the URL changes. GoPlus Security and TokenSniffer both support Base chain contract scanning using the token\'s Base contract address.',
    },
    {
      question: 'You find a Base memecoin with $150,000 liquidity on DEXScreener but BaseScan shows the LP tokens are held by an unverified contract. What should you do?',
      options: [
        'Invest — $150,000 liquidity is enough safety margin',
        'Verify the LP lock: check if the holding contract is a known, legitimate time-lock service (Team Finance, Streamflow). An unverified contract holding LP tokens could allow drain at any time',
        'DEXScreener shows LP lock status automatically — if it does not warn, it is safe',
        'Unverified contracts are standard on Base — it has not yet built the lock infrastructure',
      ],
      correct: 1,
      hint: 'Does it matter who holds the LP tokens? What can the holder do with them?',
      explanation: 'LP tokens represent ownership of the liquidity pool. If LP tokens are held by an unverified contract, you cannot confirm whether they are truly locked. It could be: (1) a legitimate time-lock with unverified source code, (2) the developer\'s own contract with backdoor withdrawal capability, or (3) a completely fake "lock" that releases immediately. Verification: check Team Finance\'s interface (teamfinance.io) or look up the contract on BaseScan to see if it matches known lock contract addresses. Unverified ≠ safe.',
    },
    {
      question: 'Applying the Island 9 position sizing framework, you want to trade Base memecoins with your $25,000 portfolio. What is the maximum per-position allocation and total memecoin exposure?',
      options: [
        '$2,500 per position, $12,500 total',
        '$500 per position (2%), $2,500 total (10%) — same rules apply on Base as on Solana',
        '$1,000 per position, $5,000 total',
        'No limit — Base memecoins are safer than Solana memecoins due to Coinbase backing',
      ],
      correct: 1,
      hint: 'The framework from Island 9: 1–3% per position, 5–10% total memecoin. Apply to $25,000.',
      explanation: '2% × $25,000 = $500 per position. 10% × $25,000 = $2,500 total memecoin allocation. These rules apply identically on Base as on Solana — the chain does not change the risk profile of memecoins. Coinbase building Base does not endorse or protect individual memecoins. A rug pull on Base is as devastating as one on Solana. The 1–2% rule exists because most memecoins go to zero; at 2% per position, a total loss costs 2% of portfolio — survivable.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 157 — AgentKit: Building Autonomous AI Agents on Base
// ─────────────────────────────────────────────────────────────────────────────

const L157: IslandLevel = {
  id: 157, mechanic: 'memory', tier: 'pro',
  topic: 'AgentKit — Building Autonomous AI Agents on Base',

  explanation: `
In December 2024, a Base developer deployed an AI agent that autonomously managed a DeFi portfolio — rebalancing between Aerodrome pools based on APY changes, harvesting and compounding AERO rewards, and adjusting collateral ratios in Moonwell without any human input. It ran continuously for 30 days and outperformed a static allocation by 3.2%. This was not science fiction — it used Coinbase's AgentKit.

AgentKit is an open-source SDK from Coinbase that gives AI models (Claude, GPT-4, Llama) the ability to take on-chain actions on Base. The architecture has three layers: an AI model (the brain that decides what to do), AgentKit (the API layer that translates AI decisions into blockchain transactions), and a Base wallet (the execution layer that signs and broadcasts transactions).

An AgentKit agent can: create new wallets, check token balances, execute swaps on Aerodrome, supply assets to Moonwell, bridge tokens to/from Base, deploy smart contracts, and monitor on-chain events. The AI makes decisions based on instructions you give it (a "system prompt") and real-time data it can query.

The practical applications range from simple (a DCA agent that buys ETH every week with USDC from your wallet) to complex (an autonomous treasury manager that optimises yield across Moonwell, Aerodrome, and ExtraFi based on real-time APY data).

The critical safety consideration: an agent with wallet access can do anything a human can — including losing all your funds to a bad decision. Spending limits (maximum transaction size), a kill switch (ability to revoke wallet permissions), and sandboxed test environments are essential before giving any agent real assets. Start with small amounts you can afford to lose entirely.
  `.trim(),

  fact: 'AgentKit is Coinbase\'s SDK giving AI models on-chain capabilities on Base: wallet creation, swaps, lending, bridging. The critical safety requirement: spending limits + kill switch before any agent touches real assets.',
  plain: 'AgentKit lets you build AI bots that can trade, lend, and bridge on Base autonomously. Powerful but risky — an AI with wallet access can lose your money as easily as earn it. Start small with strict limits.',
  stars: [800, 985, 1231], target: 1231, coins: 64,
  simulatorLesson: 'agentKitDemo',

  examples: [
    {
      contextTag: '[Simple DCA agent]',
      scenario: 'Marcus wants to DCA $200 of ETH every Monday morning from his USDC balance on Base. He builds an AgentKit agent.',
      outcome: 'System prompt: "Every Monday at 9am UTC, if my USDC balance is over $300, swap $200 USDC for ETH on Aerodrome. Maximum transaction: $250. Do not execute if ETH price is above $5,000." Safety limits: max single transaction $250, read-only access to balance check, swap-only permissions (cannot bridge or deploy contracts). He tests on Base Sepolia (testnet) for 3 weeks before funding with real money. The agent runs autonomously for 6 months without errors.',
    },
    {
      contextTag: '[Yield optimizer agent]',
      scenario: 'Keiko builds an agent that monitors Moonwell and Seamless APYs and moves her USDC to whichever offers a higher supply rate.',
      outcome: 'Agent checks APY data every 6 hours. If Moonwell USDC > Seamless USDC by 0.5%+: withdraw from Seamless, supply to Moonwell. If Seamless > Moonwell by 0.5%+: withdraw from Moonwell, supply to Seamless. Safety limits: max move per rebalance $10,000, must wait 24 hours between moves, kill switch removes all permissions immediately on command. Over 3 months, the agent generates 0.8% additional APY vs holding in one protocol. She estimates the gas costs were ~$15; the APY gain on $30,000 over 3 months was ~$60. Net positive.',
    },
    {
      contextTag: '[Safety failure scenario]',
      scenario: 'James gives an AgentKit agent wallet access without spending limits. He asks it to "maximise my yield on Base." The agent interprets this as taking maximum leverage.',
      outcome: 'The agent: deposits ETH to Moonwell, borrows USDC at 80% LTV, deploys USDC to Aerodrome LP, then uses LP tokens as collateral to borrow more. ETH drops 15%. Health factor falls below liquidation threshold. Agent cannot fix it fast enough. $12,000 liquidated. The lack of spending limits and leverage restrictions allowed the agent to pursue a valid yield strategy that James would never have approved. Clear constraints in the system prompt are not optional — they are the safety mechanism.',
    },
  ],

  keyTakeaway: 'AgentKit gives AI models on-chain capabilities on Base — useful for DCA, yield optimization, and automated strategies. Essential safety: spending limits, operation type restrictions, kill switch, and testnet validation before real assets.',

  guidedPractice: [
    {
      question: 'What are the three layers of an AgentKit autonomous agent?',
      options: [
        'Coinbase server, Base blockchain, and user interface',
        'AI model (decision making), AgentKit SDK (translates decisions to transactions), and a Base wallet (signs and executes transactions)',
        'Smart contract, liquidity pool, and oracle',
        'Frontend, backend, and database',
      ],
      correct: 1,
      hint: 'Who decides, who translates, and who acts?',
      explanation: 'AI model (Claude, GPT-4, Llama): receives data, makes decisions based on its system prompt. AgentKit SDK: translates the AI\'s decisions into specific blockchain transaction calls (Aerodrome swap, Moonwell supply, etc.) and handles the technical details. Base wallet: holds the private key that signs and broadcasts the resulting transactions to the blockchain. Separating these three layers allows the AI to focus on strategy while AgentKit handles the technical translation and the wallet handles execution.',
    },
    {
      question: 'Why is a spending limit the most important safety constraint for an AgentKit agent?',
      options: [
        'Spending limits are legally required for all automated trading bots',
        'Without a spending limit, an agent can execute transactions of unlimited size — a single misinterpretation of instructions could drain an entire wallet in one transaction',
        'Spending limits prevent the agent from paying gas fees',
        'Coinbase requires spending limits before AgentKit wallets can be funded',
      ],
      correct: 1,
      hint: 'What is the worst single transaction an unconstrained agent could execute?',
      explanation: 'An AI agent with no spending limit can execute any transaction size it deems appropriate. If the agent misinterprets "maximise yield" as "move all funds to the highest APY immediately," it could execute a $100,000 transaction in one operation. A spending limit of $1,000 per transaction means even a catastrophically bad decision results in at most $1,000 of unintended movement — survivable. Without limits, the worst case is total fund loss from one instruction misinterpretation.',
    },
    {
      question: 'You want to build an agent that rebalances between Moonwell and Seamless based on APY. What safety constraints should it have?',
      options: [
        'No constraints needed — rebalancing is a low-risk operation',
        'Maximum move per rebalance ($X), minimum time between moves (24h+), only supply/withdraw operations permitted (no leverage, no bridge), kill switch to revoke permissions immediately',
        'Only a spending limit — other constraints reduce the agent\'s effectiveness',
        'The agent should have full wallet access to handle any unexpected market condition',
      ],
      correct: 1,
      hint: 'What can go wrong with an unconstrained rebalancer? Rate, size, and operation type all matter.',
      explanation: 'Multiple constraints compound safety: (1) Maximum move per rebalance — prevents the agent from moving $100K when it should move $10K. (2) Minimum time between moves — prevents rapid back-and-forth trading that generates gas costs with no net benefit. (3) Operation type restrictions — a rebalancer needs only supply and withdraw; excluding bridge and leverage prevents the agent from entering risk categories you did not intend. (4) Kill switch — the human override that immediately revokes all agent permissions if anything goes wrong. All four work together.',
    },
    {
      question: 'Why should you test an AgentKit agent on Base Sepolia (testnet) before funding it with real assets?',
      options: [
        'Testing is required by Coinbase before mainnet AgentKit deployment',
        'Testnet allows you to observe the agent\'s actual behaviour — including edge cases and misinterpretations — at zero cost before any real money is at risk',
        'Testnet agents use a different version of AgentKit with more safety features',
        'Base Sepolia\'s tokens are worth a fraction of mainnet, limiting potential losses',
      ],
      correct: 1,
      hint: 'What can you learn on testnet that you cannot learn by reading the code?',
      explanation: 'Observing an agent\'s actual execution reveals emergent behaviours that are impossible to predict from reading its system prompt. The agent might interpret "maximise yield" in an unexpected way, fail to handle edge cases (empty pool, slippage limit hit), or execute correct logic with wrong timing. Testnet gives you 2–4 weeks of free observation to catch these issues. A bug discovered on testnet costs nothing. The same bug on mainnet could drain your wallet. There is no substitute for watching the agent run in real market conditions with fake money first.',
    },
    {
      question: 'An AgentKit agent successfully ran DCA for 6 months on Base Sepolia. You are ready to move it to mainnet. What is the correct first step?',
      options: [
        'Fund the mainnet wallet with your full intended allocation immediately',
        'Fund with 5–10% of the intended allocation first. Run for 2–4 weeks. Verify all transactions match expected behaviour before increasing to full allocation',
        'Mainnet uses the same conditions as testnet — the Sepolia performance guarantees mainnet performance',
        'Ask the AI model to confirm it is ready for mainnet before funding',
      ],
      correct: 1,
      hint: 'Testnet conditions and mainnet conditions differ. What can only be discovered with real money?',
      explanation: 'Testnet approximates mainnet but differs in key ways: real gas cost pressure, real slippage on real liquidity, real MEV considerations, and real price feeds. Starting at 5–10% of intended allocation on mainnet reveals issues that testnet may have masked — higher gas costs than estimated, different slippage on real pools, or edge cases that only appear at real market depths. Losing 5–10% of intended allocation to a bug is painful but survivable; losing 100% is catastrophic. Progressive mainnet deployment is the professional standard.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// LEVEL 158 — Coinbase Wallet on Base: Self-Custody vs Exchange Custody
// ─────────────────────────────────────────────────────────────────────────────

const L158: IslandLevel = {
  id: 158, mechanic: 'chain', tier: 'pro',
  topic: 'Coinbase Wallet on Base — Self-Custody vs Exchange Custody',

  explanation: `
In 2023, Coinbase had two products with nearly identical names that confused millions of users: Coinbase (the exchange app, custodial) and Coinbase Wallet (the self-custody app, non-custodial). The distinction between them is not cosmetic — it determines who controls your money and what happens when things go wrong.

Coinbase exchange is custodial. Coinbase holds your private keys. You access your funds through your Coinbase account login. If you forget your password: Coinbase can reset it. If Coinbase is hacked: Coinbase's insurance covers you. If you die: your heirs can claim through Coinbase's inheritance process. This is the traditional financial model applied to crypto.

Coinbase Wallet is self-custodial. You hold your own private key — stored on your device (secured by biometrics or PIN). Coinbase never has access. If you lose your phone and have not backed up your seed phrase: your funds are gone. No customer support can help. This is the "be your own bank" model.

ERC-4337 Smart Wallet — Coinbase's newest product — is a hybrid. It uses account abstraction (a mechanism where your "account" is actually a smart contract rather than a private key) to enable seedless wallet creation via passkeys. Your phone's biometric system (Face ID, fingerprint) IS your key — stored in the device's secure enclave. No seed phrase. Recoverable through multiple linked devices. The smart contract wallet enables: gasless transactions (a paymaster pays gas), batched transactions (approve + swap in one), and social recovery. This is the closest DeFi has come to a traditional app UX.

The decision framework: Coinbase exchange for trading and long-term custody where you want recovery options. Coinbase Wallet for DeFi access with self-custody control. Smart Wallet for consumer apps where mainstream UX matters more than full sovereignty.
  `.trim(),

  fact: 'Three Coinbase products: Exchange (custodial, Coinbase holds keys, recoverable), Coinbase Wallet (self-custodial, you hold keys, no recovery without seed phrase), Smart Wallet (ERC-4337, passkey-based, seedless, enables gasless + batched transactions).',
  plain: 'Coinbase Exchange: they hold your money, they can help you recover it. Coinbase Wallet: you hold your own keys, lose them and it\'s gone. Smart Wallet: new tech using your phone\'s fingerprint as the key — best UX for new users.',
  stars: [860, 1058, 1323], target: 1323, coins: 68,
  simulatorLesson: 'metamask',

  examples: [
    {
      contextTag: '[Choosing the right product]',
      scenario: 'Priya wants to: (1) hold $50,000 long-term savings, (2) use Aerodrome for DeFi, and (3) build a consumer app where users do not know what a seed phrase is. Which Coinbase product for each?',
      outcome: '(1) Long-term savings: Coinbase exchange (custodial, insured, recoverable for non-technical users) or hardware wallet for tech-savvy users. (2) Aerodrome DeFi: Coinbase Wallet (self-custodial, connects to all DeFi, full control). (3) Consumer app: Smart Wallet (ERC-4337, passkey-based UX users understand, no seed phrase confusion, gasless transactions via paymaster). Three different products for three different use cases.',
    },
    {
      contextTag: '[Seed phrase loss scenario]',
      scenario: 'Marcus drops his phone in the ocean. He had $8,000 in Coinbase Wallet with no seed phrase backup. He calls Coinbase support.',
      outcome: '"We\'re sorry — because Coinbase Wallet is self-custodial, we do not have access to your private key. Without your seed phrase backup, those funds cannot be recovered." $8,000 permanently gone. This is the non-negotiable trade-off of self-custody: you control the key, you bear the responsibility. Backing up the seed phrase to secure physical storage is not optional — it is the only recovery mechanism.',
    },
    {
      contextTag: '[Smart Wallet UX]',
      scenario: 'Keiko is building a consumer app where users tip creators in USDC. She wants users to sign up without any crypto knowledge. She evaluates Coinbase Smart Wallet.',
      outcome: 'Users sign up with their email + Face ID. A Smart Wallet is created automatically — their biometric IS their key. First transaction: the paymaster covers gas, so users never see ETH or gas concepts. Tipping a creator: one tap, Face ID confirmation, done. No "approve" then "send" — batched into one transaction. For her non-crypto audience, this feels like Venmo. Smart Wallet makes this possible on Base without sacrificing self-custody at the infrastructure level.',
    },
  ],

  keyTakeaway: 'Three custody models: Coinbase exchange (custodial, recoverable), Coinbase Wallet (self-custodial, seed phrase is the only recovery), Smart Wallet (ERC-4337 passkey, seedless, consumer-grade UX). Match custody model to user technical sophistication and recovery needs.',

  guidedPractice: [
    {
      question: 'What is the key difference between Coinbase exchange and Coinbase Wallet?',
      options: [
        'Coinbase Wallet supports more cryptocurrencies than the exchange',
        'Coinbase exchange is custodial — Coinbase holds your keys and can help with recovery. Coinbase Wallet is self-custodial — you hold your keys and Coinbase cannot help if you lose them',
        'Coinbase Wallet charges higher fees than the exchange',
        'They are the same product with different interface designs',
      ],
      correct: 1,
      hint: 'Who holds the private key in each case? What does that mean for recovery?',
      explanation: 'Custodial (exchange): Coinbase holds keys → Coinbase can reset passwords, recover accounts, and comply with inheritance requests. If Coinbase has a security incident, their insurance protects you. Self-custodial (Wallet): you hold keys → you and only you can access funds. No password reset, no account recovery, no help from Coinbase support. The trade-off: custodial = convenience + recovery, self-custodial = full control + full responsibility.',
    },
    {
      question: 'What is ERC-4337 account abstraction and what does it enable in Coinbase Smart Wallet?',
      options: [
        'A new token standard that allows wallets to hold unlimited asset types',
        'A mechanism where your "account" is a smart contract instead of a raw private key — enabling passkey-based authentication, gasless transactions, and batched operations',
        'A cross-chain bridge standard built into Base\'s protocol layer',
        'An Ethereum upgrade that reduced gas fees for all wallet types',
      ],
      correct: 1,
      hint: 'What problems with traditional crypto wallets does account abstraction solve?',
      explanation: 'Traditional wallets: private key = account. Lose the key = lose everything. Each transaction requires separate approval + gas payment in ETH. ERC-4337 account abstraction: your account is a smart contract. Authentication can use anything — passkeys (biometrics), multiple devices, or email. A paymaster contract can pay gas on your behalf (enabling gasless UX). Multiple operations can be batched into one transaction. Smart recovery via linked devices. This enables UX that matches consumer app expectations without compromising the self-custody model at the infrastructure level.',
    },
    {
      question: 'A user creates a Coinbase Smart Wallet using Face ID on their iPhone. Their iPhone is lost. How can they recover access?',
      options: [
        'They cannot recover — biometric keys cannot be backed up',
        'They can recover through linked devices (if multiple devices were added) or through Coinbase\'s social recovery mechanism — no seed phrase needed',
        'They must contact Coinbase support who holds a backup key',
        'They must wait 30 days for the smart contract to release funds automatically',
      ],
      correct: 1,
      hint: 'Smart Wallet recovery does not require a seed phrase. What mechanisms replace it?',
      explanation: 'ERC-4337 smart accounts enable multiple recovery paths without seed phrases: (1) Linked devices — if you added a second device (iPad, MacBook) with Face ID, that device can recover the account. (2) Social recovery — designate trusted contacts whose collective approval recovers your wallet. (3) Coinbase recovery — optionally, Coinbase can be added as a recovery agent (reintroducing some custodial element by choice). This multi-path recovery makes Smart Wallet significantly safer than traditional wallets for mainstream users who will inevitably lose devices.',
    },
    {
      question: 'Why are "gasless transactions" important for consumer app UX?',
      options: [
        'Gasless transactions are 100% free — the blockchain does not charge for them',
        'Users do not need to hold ETH to pay gas — a paymaster smart contract pays fees on their behalf, removing the "you need ETH for gas" confusion that blocks mainstream adoption',
        'Gasless transactions execute 10× faster because they skip the mempool',
        'Gasless means the transaction does not produce any environmental impact',
      ],
      correct: 1,
      hint: 'What is the most common confusion for non-crypto users trying to use a DeFi app for the first time?',
      explanation: '"Why do I need ETH to send USDC?" is the most common new user complaint in DeFi. Gas must be paid in ETH regardless of what token you are transacting. For a consumer app where users hold only USDC, this creates a confusing mandatory step. ERC-4337 paymasters allow a third party (the app developer, a sponsorship pool, or the user\'s USDC directly via ERC-20 paymaster) to pay the ETH gas. From the user\'s perspective: tap, Face ID, done — no ETH required, no gas concept visible.',
    },
    {
      question: 'For a user storing $100,000 in crypto long-term, which custody approach is most appropriate and why?',
      options: [
        'Coinbase Smart Wallet — newest technology is always most secure',
        'Hardware wallet (Ledger/Trezor) for cold storage of the majority, with a small amount in Coinbase Wallet for DeFi activity — maximising security for large amounts while maintaining DeFi access',
        'Coinbase exchange — their insurance covers losses so it is the safest option',
        'Equally split between all three Coinbase products for diversification',
      ],
      correct: 1,
      hint: 'What are the specific risks of each custody model at $100,000?',
      explanation: 'At $100,000: Smart Wallet is designed for consumer UX, not maximum security storage. Coinbase exchange concentration risk: Coinbase could have operational issues, regulatory seizure, or security incidents. Hardware wallet cold storage: private key never touches the internet, maximum security for large amounts. Small DeFi allocation in Coinbase Wallet: accept self-custody risk for DeFi access on a limited amount you can afford to lose. The professional answer for large amounts: hardware wallet for the majority, hot wallet for DeFi allocation, exchange only for trading amounts.',
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — Part A (L151–158)
// ─────────────────────────────────────────────────────────────────────────────

export const BASE_LEVELS_A: Record<number, IslandLevel> = {
  151: L151,
  152: L152,
  153: L153,
  154: L154,
  155: L155,
  156: L156,
  157: L157,
  158: L158,
};
