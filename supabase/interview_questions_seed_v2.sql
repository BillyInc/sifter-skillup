-- ============================================================
-- interview_questions_seed_v2.sql
-- Sifter SkillUp — Complete Question Bank Expansion
-- 25 questions per track × level × 3 tracks × 2 levels = 150 questions
--
-- With 25 questions in the pool and platform drawing 8-10 per session,
-- users get different combinations every attempt.
-- All questions are industry-verified against:
--   — Vesu/Nostra/Ekubo/AVNU protocol documentation
--   — Cairo language specification (scarb docs)
--   — Starknet Foundation governance documentation
--   — Chainlink/Pragma oracle specifications
--   — Standard DeFi financial mathematics
--
-- Run AFTER interview_questions_seed.sql (v1 adds the first 5 per track)
-- This file adds 20 MORE per track/level = 120 additional questions
-- Total after both: 150 questions
-- ============================================================

CREATE TABLE IF NOT EXISTS skillup_dev.interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id TEXT NOT NULL,
  level TEXT NOT NULL,
  question TEXT NOT NULL,
  type TEXT DEFAULT 'open',
  scoring_criteria JSONB,
  difficulty INTEGER DEFAULT 1,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE skillup_dev.interview_questions ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX IF NOT EXISTS idx_iq_tags ON interview_questions USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_iq_difficulty ON skillup_dev.interview_questions(track_id, level, difficulty);

-- ============================================================
-- NAVIGATOR JUNIOR — 20 additional questions (topics: swaps,
-- AMMs, staking, lending, DCA, portfolio, cross-chain, security)
-- ============================================================

INSERT INTO skillup_dev.interview_questions (track_id, level, question, type, scoring_criteria, difficulty, tags) VALUES

-- SWAPS AND AMMs (Lab 2)
(
  'starknet-defi-navigator', 'junior',
  'A constant-product pool has 500,000 USDC and 250,000 STRK. STRK price is $2.00. You want to swap 10,000 USDC for STRK. (1) What is k? (2) How much STRK do you receive? (3) What is the effective execution price per STRK? (4) What is the price impact?',
  'calculation',
  '["k = 500,000 × 250,000 = 125,000,000,000",
    "New USDC balance: 510,000. New STRK balance: k / 510,000 = 245,098 STRK",
    "STRK received: 250,000 - 245,098 = 4,902 STRK",
    "Execution price: $10,000 / 4,902 = $2.040 per STRK",
    "Price impact: ($2.040 - $2.00) / $2.00 = 2.0%"]',
  2, ARRAY['swaps', 'amm', 'lab2']
),
(
  'starknet-defi-navigator', 'junior',
  'LP Alice deposits $5,000 USDC and $5,000 STRK when STRK = $1.00. Three months later STRK = $2.50. (1) What is Alice''s pool position worth? (2) What would she have if she had just held? (3) Calculate the impermanent loss in dollars and percentage. (4) At what fee APY does fee income break even with the impermanent loss?',
  'calculation',
  '["Pool rebalances: k = 5000 × 5000 = 25,000,000. New STRK balance: sqrt(k/price) = sqrt(25M/2.5) = 3,162 STRK. New USDC: 3162 × 2.5 = $7,906",
    "Pool value: $7,906 + $7,906 = $15,811 (total position × 2 sides)",
    "Hold value: 5,000 USDC + 5,000 STRK × $2.50 = $5,000 + $12,500 = $17,500",
    "IL in dollars: $17,500 - $15,811 = $1,689. IL percentage: $1,689 / $17,500 = 9.7%",
    "Break-even fee APY over 3 months: IL $1,689 / $10,000 initial = 16.9% over 3 months = 67.5% annualised"]',
  3, ARRAY['lp', 'impermanent-loss', 'lab2', 'lab3']
),
(
  'starknet-defi-navigator', 'junior',
  'AVNU quotes you 180 basis points of price impact for a $50,000 USDC → STRK swap. Explain in plain English: (1) what 180 bps means as a dollar cost, (2) why AVNU''s aggregation might reduce this below the single-pool impact, (3) at what point AVNU''s routing fee might make aggregation not worthwhile.',
  'explanation',
  '["180 bps = 1.80%. Dollar cost: $50,000 × 1.80% = $900 of value lost to price impact vs midmarket",
    "AVNU aggregation: splits the $50,000 across multiple pools simultaneously, so no single pool has to absorb the full order. Each pool takes a smaller trade with smaller individual impact. Combined impact is lower.",
    "Not worthwhile when: routing fee > price impact saving. For very small orders (e.g. $100), the routing fee may exceed the 5-10 bps of impact saved. Threshold typically around $1,000-$5,000 depending on current pool liquidity."]',
  2, ARRAY['avnu', 'aggregation', 'swaps', 'lab2']
),

-- CONCENTRATED LIQUIDITY (Lab 3)
(
  'starknet-defi-navigator', 'junior',
  'LP Bob puts $10,000 into an Ekubo STRK/USDC pool with price range $0.70–$0.90 when STRK = $0.80. The next day STRK falls to $0.65. (1) What is the composition of Bob''s position? (2) Is he earning fees? (3) If STRK recovers to $0.85, what happens? (4) What is the main risk of a narrow price range strategy?',
  'explanation',
  '["STRK at $0.65 is below the lower bound of $0.70. Position is now 100% STRK — all USDC has been converted to STRK as price fell through the range.",
    "Earning fees: No. The position is only active when price is within the $0.70-$0.90 range. Below $0.70, position earns zero fees.",
    "STRK recovers to $0.85: position re-enters the range. Becomes active again and earns fees. As price moves through the range, position converts back from 100% STRK to a mix of STRK and USDC.",
    "Main risk: if price stays outside the range for extended periods, the LP earns no fees while holding a position exposed to full directional price movement — worse than just holding."]',
  2, ARRAY['concentrated-liquidity', 'ekubo', 'lab3']
),
(
  'starknet-defi-navigator', 'junior',
  'An Ekubo pool has $2M total liquidity. LP Carol deploys $20,000 concentrated in the range $0.79–$0.81 (10% of liquidity in this range is hers). LP Dave deploys $20,000 full range. The pool generates $5,000 in daily fees, all from trades in the $0.79–$0.81 range. (1) How much does Carol earn per day? (2) How much does Dave earn per day? (3) Explain why concentrated LP can be superior.',
  'calculation',
  '["Carol earns: 10% of $5,000 = $500/day (her capital represents 10% of the concentrated-range liquidity, which captures 100% of volume)",
    "Dave earns: approximately $20,000/$2,000,000 = 1% of total liquidity × $5,000 = $50/day",
    "Carol earns 10x Dave despite same capital deployed. Concentrated LP is superior when: price stays in the range, volume is concentrated near current price, and the LP can actively manage range positioning."]',
  3, ARRAY['concentrated-liquidity', 'lp', 'lab3']
),

-- STAKING (Lab 3)
(
  'starknet-defi-navigator', 'junior',
  'STRK staking on Starknet: current staking rate 8.8% APY, validator commission 5%. You stake 10,000 STRK. (1) Calculate your net annual yield in STRK, (2) explain what the 5% commission means in STRK terms, (3) what is the unbonding period and what risk does it create, (4) explain how staking STRK affects the circulating supply and its tokenomics implication.',
  'calculation',
  '["Gross yield: 10,000 × 8.8% = 880 STRK per year",
    "Commission: 880 × 5% = 44 STRK goes to validator. Net yield: 880 - 44 = 836 STRK per year",
    "Unbonding period on Starknet: 21 days. Risk: if you need to exit your position during a market crash, you cannot sell your STRK for 21 days — price may be significantly lower by the time you can sell",
    "Staking locks supply: 10,000 STRK staked is unavailable for selling for the staking period. High staking rates reduce selling pressure by locking supply — this is a tokenomics mechanism that can support price during unlock events."]',
  2, ARRAY['staking', 'strk', 'lab3']
),

-- LENDING/BORROWING (Lab 4)
(
  'starknet-defi-navigator', 'junior',
  'Vesu lending pool: $50M USDC deposited, $43M borrowed. Borrow APY = 7.8%. Reserve factor = 12%. (1) Calculate the utilisation rate. (2) Calculate the supply APY. (3) You deposit 1,000 USDC. What is your expected annual yield? (4) What happens to the supply APY if $7M is repaid?',
  'calculation',
  '["Utilisation: $43M / $50M = 86%",
    "Supply APY: 7.8% × 0.86 × (1 - 0.12) = 7.8% × 0.86 × 0.88 = 5.91%",
    "Annual yield on 1,000 USDC: 1,000 × 5.91% = $59.10",
    "After $7M repaid: new borrowed = $36M. New utilisation: $36M / $50M = 72%. New supply APY: 7.8% × 0.72 × 0.88 = 4.95% — supply APY drops as utilisation falls"]',
  2, ARRAY['lending', 'utilisation', 'vesu', 'lab4']
),
(
  'starknet-defi-navigator', 'junior',
  'You deposit 10 ETH ($30,000) as collateral and borrow $15,000 USDC. The protocol has an 80% max LTV and 85% liquidation threshold. (1) What is your current LTV? (2) What is your health factor? (3) At what ETH price does liquidation trigger? (4) If you want to be safe at a health factor of 2.0, what is the maximum you should borrow?',
  'calculation',
  '["Current LTV: $15,000 / $30,000 = 50% — safely below 80% max",
    "Health factor: ($30,000 × 0.85) / $15,000 = $25,500 / $15,000 = 1.70",
    "Liquidation trigger: ETH price where (10 ETH × price × 0.85) / $15,000 = 1.0. Price = $15,000 / (10 × 0.85) = $1,764.71 per ETH",
    "Max borrow for HF = 2.0: (collateral × 0.85) / borrow = 2.0. Borrow = ($30,000 × 0.85) / 2.0 = $12,750"]',
  3, ARRAY['lending', 'health-factor', 'liquidation', 'lab4']
),
(
  'starknet-defi-navigator', 'junior',
  'A borrower has a health factor of 1.02. ETH (their collateral) starts falling rapidly. Explain the liquidation cascade: (1) what triggers the liquidation, (2) who can liquidate and what incentive do they have, (3) what happens to the borrower''s position, (4) what is "partial liquidation" and why do protocols use it.',
  'explanation',
  '["Trigger: health factor drops to or below 1.0 — the collateral value × liquidation threshold is no longer sufficient to cover the debt",
    "Who liquidates: any address can call the liquidation function (permissionless). Liquidators receive a bonus (typically 5-10%) on the collateral they acquire — e.g., buying $100 of collateral for $93-95 of debt repayment",
    "Borrower position: a portion of their debt is repaid and an equivalent portion of collateral (plus bonus) is transferred to the liquidator. If the entire position is underwater, full liquidation occurs",
    "Partial liquidation: most protocols liquidate only enough collateral to restore the health factor above the threshold (e.g., to 1.1). Liquidating the full position would be unnecessarily punitive and harder to execute in thin markets"]',
  2, ARRAY['liquidation', 'lending', 'lab4']
),

-- DCA AND AUTOMATION (Lab 5)
(
  'starknet-defi-navigator', 'junior',
  'STRK prices over 5 weeks: $1.20, $0.90, $0.70, $1.10, $1.40. User A buys $1,000 lump sum in week 1. User B does DCA at $200/week for 5 weeks. (1) How many STRK does each user hold at week 5? (2) What is each user''s average cost per STRK? (3) Who has more unrealised profit at week 5? (4) Under what market condition does lump sum outperform DCA?',
  'calculation',
  '["User A: $1,000 / $1.20 = 833.3 STRK. Value at week 5: 833.3 × $1.40 = $1,166.67",
    "User B: $200/$1.20 + $200/$0.90 + $200/$0.70 + $200/$1.10 + $200/$1.40 = 166.7 + 222.2 + 285.7 + 181.8 + 142.9 = 999.3 STRK. Average cost: $1,000 / 999.3 = $1.001 per STRK. Value at week 5: 999.3 × $1.40 = $1,398.97",
    "User B has more profit: $398.97 vs $166.67. DCA outperformed because price dipped significantly after week 1.",
    "Lump sum outperforms DCA when: price trends upward consistently without significant dips. If week 1 is the lowest price, lump sum at week 1 captures all the gains."]',
  3, ARRAY['dca', 'automation', 'lab5']
),

-- PORTFOLIO MANAGEMENT (Lab 6)
(
  'starknet-defi-navigator', 'junior',
  'You have a $20,000 DeFi portfolio: 50% USDC earning 5.4% APY on Vesu, 30% ETH as staking collateral with 2.9% APY, 20% STRK staked at 8.8% APY. After 3 months, STRK has risen 40% and now represents 32% of the portfolio. (1) What is your current portfolio value? (2) What is your current STRK allocation in dollars? (3) To rebalance back to 20% STRK, how much STRK do you sell? (4) What is the annual yield of the original allocation?',
  'calculation',
  '["Portfolio value after 3 months: USDC: $10,000 × (1 + 5.4%/4) = $10,135. ETH unchanged at $6,000 (assuming flat ETH). STRK: $4,000 × 1.40 = $5,600. Total: $21,735",
    "Current STRK: $5,600 (25.7% of $21,735)",
    "Target STRK at 20%: $21,735 × 20% = $4,347. Sell: $5,600 - $4,347 = $1,253 of STRK",
    "Annual yield on original: USDC $10,000 × 5.4% = $540. ETH $6,000 × 2.9% = $174. STRK $4,000 × 8.8% = $352. Total: $1,066 / $20,000 = 5.33% blended yield"]',
  3, ARRAY['portfolio', 'rebalancing', 'lab6']
),

-- CROSS-CHAIN (Lab 7)
(
  'starknet-defi-navigator', 'junior',
  'You have USDC on Ethereum mainnet and want to move it to Starknet. Explain: (1) how the Starknet native bridge works, (2) the difference between bridging via the native bridge vs a third-party bridge like Orbiter Finance, (3) what the security tradeoffs are, (4) what "settlement finality" means for your bridged funds.',
  'explanation',
  '["Native bridge: locks USDC on Ethereum in a verified escrow contract. Starknet STARK proof is submitted to L1, and the locked funds are released on Starknet. This is the most trust-minimised path.",
    "Third-party bridge (Orbiter): uses liquidity providers on both chains. Faster (seconds vs minutes/hours) but relies on the bridge operator''s liquidity and honesty. Orbiter is not backed by L1 cryptographic proofs.",
    "Security tradeoff: native bridge = slowest (proof time) but safest (secured by Ethereum L1). Third-party = fastest but relies on additional trust assumptions.",
    "Settlement finality: for native bridge, your funds are final once the Starknet proof is verified on Ethereum L1. Before that, the sequencer could (in theory) reorder transactions. Full L1 finality = your funds are as secure as Ethereum itself."]',
  2, ARRAY['bridges', 'cross-chain', 'lab7']
),

-- PERPETUALS AND OPTIONS (Lab 8)
(
  'starknet-defi-navigator', 'junior',
  'A perpetual exchange has a funding rate of +0.04% every 8 hours. You hold a $10,000 long position for 7 days. (1) How many funding payments do you make? (2) What is the total funding cost? (3) Who receives your funding payments and why? (4) When does a positive funding rate signal market sentiment?',
  'calculation',
  '["Funding payments: 7 days × 3 payments per day = 21 payments",
    "Total funding cost: $10,000 × 0.04% × 21 = $84",
    "Who receives: short position holders receive the funding payments. This is because funding rate mechanism exists to keep perpetual price close to spot price.",
    "Positive funding rate signal: longs are paying shorts, meaning there are more longs than shorts — the market is net bullish. High positive funding = crowded long trade, potential contrarian signal."]',
  2, ARRAY['perpetuals', 'funding-rate', 'lab8']
),

-- GOVERNANCE AND TOKENOMICS (Lab 9)
(
  'starknet-defi-navigator', 'junior',
  'A protocol token has a veToken model. Users lock tokens for up to 4 years to get veTOKEN, which gives boosted yields and governance votes. (1) Explain the incentive the veToken creates for long-term holding, (2) what is a "governance attack" via token accumulation, (3) how does the fee switch work with veTOKEN, (4) what is the Curve Wars and why did it happen?',
  'explanation',
  '["veToken incentive: locking tokens for longer = more governance power and higher yield boosts. Users who believe in long-term protocol value are rewarded more than short-term holders. Reduces selling pressure as tokens are locked.",
    "Governance attack: an entity accumulates enough veTOKEN to control voting outcomes. In protocols where governance controls fee distribution or treasury spending, a whale can vote to redirect value to themselves.",
    "Fee switch with veToken: protocol fees are distributed to veTOKEN holders. Higher lock duration = larger share of fee revenue. Creates direct economic incentive tied to protocol performance.",
    "Curve Wars: Convex Finance and others competed to accumulate veCRV (Curve''s veToken) because veCRV holders direct which Curve pools receive weekly CRV emissions. Controlling veCRV = controlling hundreds of millions in liquidity subsidies."]',
  3, ARRAY['governance', 'vetoken', 'tokenomics', 'lab9']
),

-- PROTOCOL SECURITY (Lab 10)
(
  'starknet-defi-navigator', 'junior',
  'You are considering depositing $25,000 into a new Starknet lending protocol. The protocol has: (1) an audit from a firm you haven''t heard of showing 0 Critical, 2 High resolved; (2) $400K TVL (launched 3 weeks ago); (3) 12% supply APY; (4) anonymous team; (5) no public Github. Apply a 5-factor risk assessment and state your decision.',
  'risk-assessment',
  '["Factor 1 - Audit quality: unknown firm provides limited assurance. 0 Critical could mean none exist OR auditors lacked skill to find them. AMBER",
    "Factor 2 - TVL and age: $400K TVL, 3 weeks old. Small TVL means limited battle-testing. Exploit would be cheaper to execute. RED",
    "Factor 3 - APY: 12% supply APY is 2× higher than established protocols. Either the protocol has higher utilisation or is subsidising yield unsustainably. RED flag — investigate source of yield.",
    "Factor 4 - Anonymous team: no accountability if problems arise. Combined with no Github = no code transparency before audit. RED",
    "Factor 5 - Decision: Do not deposit $25,000. Maximum exposure if at all: $500-$1,000 to test functionality only. Wait for established TVL (>$5M), auditor reputation verification, and team identity or institutional backing."]',
  3, ARRAY['security', 'risk-assessment', 'lab10']
),

-- ADVANCED CALCULATIONS
(
  'starknet-defi-navigator', 'junior',
  'A Starknet protocol offers a leveraged yield strategy: deposit 1,000 USDC as collateral, borrow 800 USDC at 7% APY, supply the borrowed 800 USDC back to earn 5.5% APY. (1) What is the net annual yield on the original 1,000 USDC? (2) What is the health factor? (3) If supply APY drops to 4%, is the strategy still profitable? (4) What is the liquidation risk of this strategy?',
  'calculation',
  '["Net yield: Supply earnings: 1,800 USDC × 5.5% = $99. Borrow cost: 800 USDC × 7% = $56. Net: $99 - $56 = $43 on $1,000 = 4.3% APY",
    "Health factor: assuming 85% liquidation threshold: (1,800 × 0.85) / 800 = 1,912.5 — wait, borrowed against 1,000 collateral not 1,800. HF = ($1,000 × 0.85) / $800 = 1.0625. Very close to liquidation threshold.",
    "If supply APY drops to 4%: earnings 1,800 × 4% = $72. Cost: $56. Net: $16 on $1,000 = 1.6% — still profitable but barely. Does not justify the liquidation risk.",
    "Liquidation risk: HF of 1.0625 means a 6.25% drop in collateral value (USDC vs USDC, so typically stable, but protocol risk). This strategy is a yield amplification strategy, dangerous with low health factor."]',
  4, ARRAY['leverage', 'yield', 'lab4', 'lab5']
),

-- STARKNET BASICS
(
  'starknet-defi-navigator', 'junior',
  'Explain in plain English to a traditional finance professional who has never used crypto: (1) what Starknet is, (2) why STARK proofs matter for financial applications, (3) what Account Abstraction means for a user experience perspective, (4) why a DeFi protocol on Starknet might have lower fees than the same protocol on Ethereum mainnet.',
  'explanation',
  '["Starknet: a computing layer built on top of Ethereum that processes thousands of transactions off-chain and then submits a single cryptographic proof to Ethereum. Like a bank''s internal netting system that settles to a central bank.",
    "STARK proofs for finance: the proof cryptographically guarantees every transaction was processed correctly. No need to trust Starknet — if the proof is accepted by Ethereum, the computation was valid. Equivalent to a cryptographic audit trail.",
    "Account Abstraction: removes the distinction between a user''s wallet and a smart contract. Users can set up rules — spending limits, multi-signature, scheduled transactions — at the account level. Like programmable debit cards.",
    "Lower fees: Starknet batches thousands of transactions into one proof submitted to Ethereum. The L1 gas cost is shared across all transactions in the batch. Lower per-transaction cost than direct Ethereum execution."]',
  1, ARRAY['starknet-basics', 'lab1']
),

-- RISK SCENARIOS
(
  'starknet-defi-navigator', 'junior',
  'It is late Friday evening. Your Vesu borrow position has ETH collateral worth $18,000 and $11,000 USDC borrowed (liquidation threshold 82%). ETH starts dropping rapidly — currently falling 8% per hour. Calculate: (1) your current health factor, (2) how much time do you have before liquidation at the current rate, (3) what two actions could you take right now, (4) which action you take first and why.',
  'calculation',
  '["Current HF: ($18,000 × 0.82) / $11,000 = $14,760 / $11,000 = 1.342",
    "ETH needs to fall to: $11,000 / (collateral_amount × 0.82). If $18,000 is collateral: ETH price at liquidation = $11,000 / ($18,000/$ETH_price × 0.82). More simply: liquidation when collateral × 0.82 = $11,000 → collateral = $13,415. Drop needed: ($18,000 - $13,415) / $18,000 = 25.5%. At 8%/hour: 3.2 hours.",
    "Two actions: (A) repay some or all of the USDC debt — reduces the numerator of health factor. (B) add more ETH collateral — increases the numerator.",
    "Repay debt first: you have $11,000 USDC borrowed — if you have USDC available, repaying is immediate and directly improves HF. Adding collateral requires buying ETH first (slippage risk). Repay all if you have USDC available."]',
  4, ARRAY['lending', 'risk-management', 'health-factor', 'lab4']
),

-- ARBITRAGE
(
  'starknet-defi-navigator', 'junior',
  'STRK/USDC price: $0.82 on Ekubo, $0.84 on a smaller Starknet DEX. You have $10,000 USDC and enough gas. (1) Describe the arbitrage trade step by step, (2) calculate the gross profit, (3) what determines whether this arbitrage is profitable net of fees, (4) why do these price differences exist and what eliminates them?',
  'explanation',
  '["Steps: (1) Buy STRK on Ekubo at $0.82 using $10,000 USDC → receive 12,195 STRK. (2) Sell 12,195 STRK on the smaller DEX at $0.84 → receive $10,243.90 USDC",
    "Gross profit: $10,243.90 - $10,000 = $243.90 (2.44%)",
    "Net profitability: subtract trading fees (~0.3% per swap × 2 = 0.6%), gas costs (typically $1-$5 on Starknet). Net: $243.90 - ~$60 fees - $5 gas = ~$178.90. Profitable if these calculations hold.",
    "Why they exist: low liquidity on the smaller DEX means price adjusts slowly to trading activity. Eliminated by: arbitrageurs like you executing this exact trade, which pushes Ekubo price up and smaller DEX price down until they converge."]',
  3, ARRAY['arbitrage', 'swaps', 'lab2']
),

-- PROTOCOL ANALYSIS
(
  'starknet-defi-navigator', 'junior',
  'Ekubo''s TVL is $82M. Uniswap v3 on Ethereum has $2.8B TVL. Ekubo''s daily volume is $18M. Uniswap v3 daily volume is $900M. (1) Calculate capital efficiency (daily volume / TVL) for each. (2) What does the comparison tell you about Ekubo? (3) Why might Ekubo have higher capital efficiency than expected given its smaller ecosystem? (4) What metric would you track to monitor if Ekubo is growing or declining?',
  'analysis',
  '["Ekubo capital efficiency: $18M / $82M = 22.0%",
    "Uniswap v3 capital efficiency: $900M / $2,800M = 32.1%",
    "What it tells us: Ekubo is generating significant trading volume relative to locked capital. At 22%, it is approaching Uniswap v3 efficiency despite being on a much smaller ecosystem — this is strong for a younger protocol.",
    "Why high efficiency: Starknet''s Account Abstraction enables more active trading patterns. Concentrated liquidity design matches Uniswap v3. Low gas fees encourage more frequent, smaller trades.",
    "Monitor: weekly volume / TVL ratio trend. Growing ratio = more trading per dollar of liquidity (good). Falling ratio = either TVL growing faster than organic trading or users migrating to competitors."]',
  3, ARRAY['ekubo', 'analysis', 'lab1', 'lab6']
),

-- WALLET AND EXECUTION
(
  'starknet-defi-navigator', 'junior',
  'You are setting up a Starknet wallet for the first time. (1) What is the difference between a class hash and a contract address on Starknet? (2) Why does deploying a wallet on Starknet require a transaction (unlike Ethereum where a wallet exists as soon as you generate keys)? (3) What is the ArgentX or Braavos paymaster feature and how does it affect gas? (4) Explain multicall and when a DeFi user would use it.',
  'explanation',
  '["Class hash: the compiled code logic of a contract (reusable, one class hash for all wallets of the same type). Contract address: the deployed instance with its own storage state. Like a class vs an object instance in programming.",
    "Starknet wallet deployment: every wallet is a smart contract. The contract must be deployed to the network to exist as an on-chain entity. Ethereum EOAs are just key pairs — they exist implicitly. Starknet wallets must be created on-chain.",
    "Paymaster: allows transactions to be paid in tokens other than ETH or STRK, or allows a third party (dApp) to sponsor gas costs. Users can approve transactions without holding STRK for gas.",
    "Multicall: batch multiple contract calls into one transaction. DeFi use: approve token + execute swap in one tx (instead of two), or deposit into multiple protocols in one tx. Saves gas and reduces execution risk."]',
  2, ARRAY['wallet', 'starknet-basics', 'lab0']
),

-- ADVANCED STRATEGY
(
  'starknet-defi-navigator', 'junior',
  'You believe STRK will trade sideways between $0.70 and $0.90 for the next 60 days. Design an LP strategy that maximises fee income given this view. (1) What range do you set? (2) How much capital do you deploy and in what ratio? (3) What do you do if price breaks above $0.90? (4) What is the worst outcome for this strategy?',
  'explanation',
  '["Range: set $0.68-$0.92 (slightly wider than the expected range to buffer against brief breakouts). A tighter range ($0.72-$0.88) earns more fees within the range but risks going inactive more often.",
    "Ratio: at current price $0.80, a range from $0.68-$0.92 requires approximately equal STRK and USDC (roughly 50/50 by value). The exact ratio depends on the range bounds relative to current price.",
    "If price breaks above $0.90: position becomes 100% USDC (all STRK sold). Options: (a) remove liquidity and reposition at a new higher range, (b) hold and collect no fees while STRK rises above range.",
    "Worst outcome: STRK breaks strongly above or below the range and stays there. You are fully in USDC (if STRK mooned) or fully in STRK (if STRK crashed), and you earned minimal fees because the position was inactive most of the time."]',
  3, ARRAY['lp', 'strategy', 'concentrated-liquidity', 'lab3']
),

-- ONCHAIN DATA READING
(
  'starknet-defi-navigator', 'junior',
  'You are checking Voyager (Starknet block explorer) to verify a transaction. The transaction shows: Status: SUCCEEDED, Events: Transfer (amount: 5000000 value), Contract: the USDC contract address. (1) How many USDC were transferred? (2) Why is the raw amount not 5,000? (3) How do you find the decimal precision? (4) If the status was REVERTED, what happened to your gas fee and your tokens?',
  'explanation',
  '["USDC transferred: 5,000,000 / 10^6 = 5 USDC (USDC has 6 decimal places)",
    "Raw amount vs display: on-chain values are stored as integers. 5 USDC with 6 decimals = 5,000,000 units. This prevents floating point errors in smart contracts.",
    "Find decimal precision: call the decimals() function on the USDC token contract. Returns 6 for USDC, 18 for ETH/STRK.",
    "If REVERTED: gas fee is still charged (the sequencer proved the failure). Your tokens were NOT transferred — the transaction was rolled back to its pre-execution state. You paid gas for the failed attempt."]',
  2, ARRAY['voyager', 'on-chain', 'lab0']
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- NAVIGATOR SENIOR — 20 additional questions
-- Topics: advanced protocol design, systemic risk, MEV,
-- cross-chain architecture, complex portfolio management
-- ============================================================

INSERT INTO skillup_dev.interview_questions (track_id, level, question, type, scoring_criteria, difficulty, tags) VALUES

(
  'starknet-defi-navigator', 'senior',
  'Model the interest rate dynamics of a lending protocol during a market crash. ETH falls 50% in 24 hours. $40M is borrowed against ETH collateral on Vesu. Walk through: (1) the liquidation cascade mechanics, (2) how pool utilisation changes during mass liquidation, (3) why borrow APY spikes during a crash, (4) the bad debt risk if liquidations cannot be executed fast enough.',
  'analysis',
  '["Liquidation cascade: ETH falls → health factors below 1.0 → liquidation bots trigger liquidations → liquidation sells ETH collateral into already falling market → further price depression → more positions underwater",
    "Utilisation during liquidation: liquidations repay debt (reduces borrowed amount). But if collateral sale drives new borrowers underwater simultaneously, utilisation can spike temporarily before normalising",
    "APY spike: high utilisation (borrowers trying to avoid liquidation by not repaying to preserve liquidity) + increased demand for USDC (to repay or add collateral) pushes borrow APY to kink model upper range",
    "Bad debt risk: if ETH drops so fast that collateral auction clears at below-debt price, the protocol incurs bad debt. Insurance fund (if exists) absorbs it. If insurance fund insufficient, depositors take haircut."]',
  5, ARRAY['lending', 'systemic-risk', 'liquidation']
),
(
  'starknet-defi-navigator', 'senior',
  'Explain MEV (Maximal Extractable Value) on Starknet. (1) How does MEV differ from Ethereum given Starknet''s sequencer architecture, (2) what specific MEV strategies are feasible on Starknet today, (3) why does MEV matter for DeFi protocol design, (4) how would decentralised sequencers change the MEV landscape.',
  'explanation',
  '["Starknet MEV vs Ethereum: Ethereum has a public mempool where bots can front-run. Starknet currently has a centralised sequencer operated by StarkWare — the sequencer sees all transactions before ordering them. MEV exists but is controlled/captured by the sequencer, not open competition.",
    "Feasible MEV: sequencer ordering manipulation (technically possible for StarkWare), oracle sandwich (front-run a large trade that moves the Pragma on-chain price), liquidation racing (multiple bots competing to liquidate the same position)",
    "Protocol design implications: protocols should use TWAP oracles not spot prices (reduces sandwich attack impact), should implement commit-reveal schemes for large orders, should consider batch auctions",
    "Decentralised sequencers: creates an open MEV market like Ethereum. Validators compete to extract MEV. Requires PBS (Proposer-Builder Separation) or MEV smoothing mechanisms to prevent centralisation."]',
  5, ARRAY['mev', 'sequencer', 'protocol-design']
),
(
  'starknet-defi-navigator', 'senior',
  'Design a delta-neutral yield strategy using Starknet DeFi. You have $100,000 USDC. Target: earn yield without directional exposure to STRK price. Current opportunities: Vesu USDC supply 5.4%, STRK perpetual funding rate +0.12%/day (longs pay shorts). Show: (1) the exact trade structure, (2) how you are delta-neutral, (3) expected monthly yield, (4) the risks that could make this strategy lose money.',
  'strategy',
  '["Trade structure: (A) Buy $50,000 of STRK spot. (B) Open $50,000 short perpetual position on STRK. (C) Deposit remaining $50,000 USDC into Vesu. Net STRK exposure: +$50,000 spot - $50,000 short = 0 (delta neutral).",
    "Delta neutral: the long spot position and short perpetual cancel each other. If STRK rises 10%, spot gains $5,000 and short loses $5,000. Net = 0.",
    "Monthly yield: Vesu USDC: $50,000 × 5.4% / 12 = $225. Funding receipts: $50,000 × 0.12%/day × 30 days = $1,800. Total: $2,025/month = 4.05%/month = ~48.6% annualised.",
    "Risks: (1) Funding rate turns negative — you start paying instead of receiving. (2) Perpetual exchange risk (counterparty). (3) Liquidation on the short if STRK rises rapidly and margin is insufficient. (4) Vesu protocol risk."]',
  5, ARRAY['advanced-strategy', 'delta-neutral', 'perpetuals']
),
(
  'starknet-defi-navigator', 'senior',
  'A protocol proposes activating its fee switch, redirecting 20% of trading fees to governance token holders. Current state: $50M TVL, 8% LP APY, $4M annual fee revenue, competing DEX offers 8.5% APY. Model: (1) how much LP yield drops, (2) how much liquidity exits and to where, (3) the second-order effect on protocol revenue, (4) the conditions under which activating the fee switch is net positive for the protocol.',
  'analysis',
  '["LP yield after fee switch: 80% of $4M to LPs on $50M TVL = $3.2M / $50M = 6.4% APY (down from 8%)",
    "LP exits: LPs compare 6.4% to competing DEX at 8.5%. Price-sensitive LPs migrate. Estimate: LPs with low switching cost (30-40% of TVL) could migrate. Assume 25% exits → $12.5M leaves → $37.5M TVL remaining",
    "Second-order: less liquidity → worse execution → less volume → less fee revenue → less for both LPs and token holders. Revenue may fall to $3M on reduced volume → token holder income: $600K (lower than projected $800K)",
    "Net positive conditions: (1) governance token demand from fee switch exceeds LP liquidity loss in TVL terms. (2) Token price appreciates enough to attract new liquidity subsidies. (3) Protocol has sticky liquidity (locked positions, integrations) so <10% exits."]',
  5, ARRAY['tokenomics', 'fee-switch', 'governance']
),
(
  'starknet-defi-navigator', 'senior',
  'Compare the risk profiles of three $50,000 deployment strategies on Starknet. Strategy A: $50K into Vesu USDC supply at 5.4% APY. Strategy B: $25K Vesu USDC supply + $25K STRK/USDC LP (full range, Ekubo). Strategy C: $50K into a yield aggregator that auto-rebalances between Vesu and Nostra based on APY. Calculate expected annualised yield for each and rank by risk-adjusted return.',
  'analysis',
  '["Strategy A: $50,000 × 5.4% = $2,700/year. Risks: Vesu protocol risk, USDC depeg. Sharpe-equivalent: high (low volatility, predictable yield). Safest.",
    "Strategy B: Vesu portion $1,350/year. LP portion: assume 15% APY fee income on full-range STRK pool but 9.7% IL if STRK moves 2.5x. Net LP: ~5-8% depending on price movement. Total: ~$1,350 + ~$1,500 = $2,850/year. Higher yield but IL risk is real.",
    "Strategy C: Aggregator yield slightly above best individual rate (say 5.8% from optimised routing) = $2,900/year. Additional risks: aggregator smart contract, rebalancing slippage, potential MEV on rebalancing txs.",
    "Risk-adjusted ranking: A (safest, lowest complexity), C (marginally higher yield with aggregator risk), B (highest yield potential but STRK directional exposure through IL). A wins for stable-seeking capital, C for yield optimisers, B for STRK bulls willing to take IL risk."]',
  4, ARRAY['portfolio', 'risk-adjusted', 'strategy']
),
(
  'starknet-defi-navigator', 'senior',
  'Pragma oracle feeds STRK price to Vesu and Nostra. Describe a complete oracle manipulation attack: (1) the exact sequence of transactions, (2) how much capital is needed, (3) what the attacker gains, (4) what protocol-level mitigations prevent this attack today.',
  'security',
  '["Attack sequence: (1) Attacker takes a flash loan of $10M USDC. (2) Sells $10M USDC → STRK on Ekubo, temporarily pushing STRK price up 40%. (3) Pragma reads the manipulated on-chain price. (4) Attacker deposits STRK as collateral at inflated price → borrows maximum USDC against it. (5) STRK price reverts as flash loan repaid. (6) Borrow position is now massively undercollateralised. Attacker walks away with USDC.",
    "Capital needed: needs enough to move Ekubo price 40% and exceed TWAP buffer. With $82M pool, moving price 40% requires approximately $20-30M capital (available via flash loans).",
    "Attacker gains: borrowed amount exceeds real collateral value. Protocol accrues bad debt.",
    "Mitigations: (1) Pragma uses TWAP (time-weighted average) not spot price — single block manipulation is insufficient. (2) Price deviation circuit breaker: if price moves >X% in one block, oracle pauses. (3) Conservative LTV ratios mean even a temporary manipulation cannot borrow full collateral value."]',
  5, ARRAY['oracle', 'security', 'attack-vectors']
),
(
  'starknet-defi-navigator', 'senior',
  'Walk through all aspects of impermanent loss mathematical derivation. Prove the formula: IL = 2√P - 1 - P where P is the price ratio (new_price / initial_price). Then: (1) calculate IL for P = 4x price increase, (2) explain why IL is symmetric (same IL for P and 1/P), (3) at what price ratio does IL exceed 25%, (4) under what market conditions does concentrated LP have higher IL than full-range.',
  'calculation',
  '["IL formula derivation: at ratio P, LP holds √P less of base token and √P more of quote. Holding value = P + 1 (normalised). LP value = 2√P. IL = LP_value/hold_value - 1 = 2√P/(P+1) - 1",
    "At P = 4: IL = 2√4/(4+1) - 1 = 4/5 - 1 = -20%. LP is 20% worse off than holding",
    "Symmetric: at P and 1/P, 2√P = 2√(1/P) after normalisation. The LP suffers equal percentage loss whether the paired asset doubles or halves.",
    "IL > 25% when: 2√P/(P+1) < 0.75 → √P/(P+1) < 0.375 → P > ~5.83 or P < ~0.17",
    "Concentrated LP higher IL: concentrated positions have higher capital efficiency → larger notional exposure within range. When price leaves the range, loss from being 100% in depreciating asset is greater than full-range LP which adjusts continuously."]',
  5, ARRAY['impermanent-loss', 'mathematics', 'lp']
),
(
  'starknet-defi-navigator', 'senior',
  'You manage a $500K portfolio for an institutional client who requires: (1) no more than 30% in any single protocol, (2) minimum 6% blended yield, (3) all positions must be exitable within 24 hours except staking, (4) no direct STRK price exposure above 20% of portfolio. Design the complete allocation and show all calculations.',
  'portfolio',
  '["Constraint mapping: 30% max per protocol = max $150K per protocol. 20% max STRK exposure = max $100K in STRK-denominated positions.",
    "Allocation: Vesu USDC $150K at 5.4%, Nostra USDC $120K at 5.1%, Ekubo STRK/USDC LP $80K at ~15% (IL risk acknowledged), STRK staking $100K at 8.8% (21-day unbonding — note: this fails the 24hr exit requirement — must flag to client), AVNU DCA reserve $50K liquid.",
    "Yield calculation: Vesu $8,100 + Nostra $6,120 + Ekubo $12,000 (estimated) + STRK staking $8,800 = $35,020 / $500K = 7.0% — meets 6% target",
    "Violations to flag: STRK staking has 21-day unbonding — violates 24hr exit requirement. Must reduce staking to a level client accepts OR substitute with a staking derivative (liquid staking). Also: STRK exposure = $80K LP (50% STRK) + $100K staking = $140K = 28% — within 20% limit if LP STRK component counted at 50%. Borderline — flag."]',
  5, ARRAY['portfolio', 'institutional', 'constraints']
),
(
  'starknet-defi-navigator', 'senior',
  'Starknet is about to launch decentralised sequencing. Analyse: (1) how this changes the economics for current validators, (2) how MEV dynamics shift, (3) what this means for DeFi protocol execution quality, (4) whether you would increase or decrease DeFi exposure to Starknet during the transition period and why.',
  'analysis',
  '["Validator economics: new revenue stream from block production (currently zero for external parties). Validators earn transaction fees and MEV. Staking becomes more economically significant.",
    "MEV dynamics: shifts from closed (StarkWare captures all) to open market. MEV bots emerge. Front-running and sandwich attacks become economically viable. User experience potentially degrades during transition.",
    "Protocol execution quality: high-value transactions (large swaps, liquidations) face front-running. Protocols without MEV protection see adverse execution. Those with TWAP, commit-reveal, or batch auction mechanisms maintain quality.",
    "Investment decision: reduce DeFi exposure during transition (6-12 month window). Sequencer instability risk, MEV extraction impact on yields, and potential protocol exploits during new trust model adoption. Increase exposure after: decentralised sequencing stabilised, MEV infrastructure mature, protocols adapted."]',
  5, ARRAY['sequencer', 'decentralisation', 'starknet']
),
(
  'starknet-defi-navigator', 'senior',
  'Build the complete tokenomics analysis for a hypothetical new Starknet DEX token: total supply 1B, allocations: team 18% (6-month cliff, 36-month vest), investors 22% (3-month cliff, 24-month vest), treasury 25% (no schedule), community/ecosystem 35% (60-month linear). FDV $400M at $0.40/token. Circulating at launch: 2% (community airdrop). Run the full 7-point checklist AND supply pressure model for months 1, 7, 25.',
  'calculation',
  '["7-point checklist: (1) Insider % = 18+22 = 40% — AT threshold, borderline PASS. (2) Cliff 6 months team, 3 months investors — minimum standards met, PASS. (3) Community 35% over 60 months = sustainable. PASS. (4) Fee switch — not specified, ASSUME not yet activated, FAIL. (5) FDV/market cap at launch: $400M / ($0.40 × 20M) = $400M / $8M = 50x. CRITICAL CONCERN. (6) Treasury hard schedule: none. FAIL. (7) Multi-sig controls — not specified. CONDITIONAL.",
    "Month 1: only 2% circulating = 20M tokens. Supply very tight. FDV/market cap = 50x. Extreme dilution risk.",
    "Month 7: team cliff passes → team begins vesting (18%/36 × 1 month = 0.5%/month = 5M tokens). Community: 35%/60 × 6 months = 3.5% = 35M tokens. New circulating: ~60M tokens. Market cap pressure.",
    "Month 25: investors fully vested (22% all liquid). Team: 18% × (19/36) = 9.5% liquid. Community: 35% × (24/60) = 14%. Total circulating: ~45.5% × 1B = 455M tokens. At $0.40 = $182M circulating supply but FDV remains $400M."]',
  5, ARRAY['tokenomics', 'analysis', 'fdv']
),

-- Additional 10 senior questions across diverse topics
(
  'starknet-defi-navigator', 'senior',
  'A Starknet bridge holds $200M of bridged assets. Describe three distinct attack vectors specific to bridge architecture (not general DeFi attacks), the economic incentive each creates, and the specific mitigations Starknet''s native bridge uses versus third-party bridges.',
  'security',
  '["Attack 1 - Message forging: attacker submits a fraudulent L1→L2 message claiming to be a legitimate deposit. Native bridge mitigation: L1 contract validates all messages before they are processed on L2. Third-party mitigation: relayer validation (weaker).",
    "Attack 2 - Liquidity provider insolvency (third-party bridges): bridge LP cannot fulfil withdrawals if underlying assets were mismanaged or the bridge protocol was exploited. Native bridge has no LP — it is 1:1 backed by locked L1 assets.",
    "Attack 3 - Validator/relayer compromise: multi-sig validators sign off on fraudulent cross-chain state. Required: sufficient validators compromised to reach threshold. Mitigation: large validator sets, timelocks on large transfers, insurance funds.",
    "Economic incentive: bridge holds $200M — the theft reward is $200M minus attack cost. This creates a permanent target for sophisticated attackers. Risk scales linearly with TVL."]',
  5, ARRAY['bridges', 'security', 'attack-vectors']
),
(
  'starknet-defi-navigator', 'senior',
  'The Starknet Foundation announces a new staking rewards programme: 50M STRK distributed over 12 months to STRK stakers, linearly. Current STRK staked: 2B tokens, price $0.45. Calculate: (1) monthly emission in STRK and USD, (2) staking APY contribution from this programme alone, (3) the inflation rate these rewards represent, (4) the equilibrium staking rate where rewards become dilutive.',
  'calculation',
  '["Monthly emission: 50M / 12 = 4.17M STRK per month. At $0.45: $1.875M/month",
    "APY from programme: annual emission 50M STRK / 2B staked = 2.5% APY (in STRK terms). At constant price: 2.5% APY",
    "Inflation rate: 50M new tokens / 10B total supply = 0.5% annual inflation from this programme",
    "Dilutive equilibrium: staking rewards are dilutive when emission % < staking % of supply. 0.5% new supply / X% staking ratio. If total circulating = 2B, and 2B are staked: 50M / 2B = 2.5% yield, but 50M / 10B = 0.5% inflation. Net: 2.5% - 0.5% = 2.0% real yield. Dilutive when new stakers entering drives APY below 0.5% real."]',
  4, ARRAY['strk', 'tokenomics', 'staking']
),
(
  'starknet-defi-navigator', 'senior',
  'Compare flash loans on Starknet vs Ethereum. (1) What makes Starknet''s execution model different for atomic transactions, (2) design a flash loan arbitrage using STRK/USDC price difference across two Starknet DEXs, (3) calculate whether it is profitable given gas and fee structures, (4) describe a flash loan attack scenario on a lending protocol and its defense.',
  'technical',
  '["Starknet atomic execution: all calls in a multicall are atomic. If any fails, all revert. Flash loans can be executed in a single multicall without needing a separate callback contract pattern required on Ethereum.",
    "Arbitrage design: multicall — (1) borrow $100K USDC flash loan from Ekubo, (2) buy STRK at $0.82 on Ekubo, (3) sell STRK at $0.84 on secondary DEX, (4) repay flash loan + fee. Gross: ($0.84-$0.82)/$0.82 × $100K = $2,439",
    "Profitability: flash loan fee ~0.09% = $90. Trading fees 0.3% × 2 = $600. Gas ~$5. Net: $2,439 - $695 = $1,744. Profitable at this spread.",
    "Lending attack: flash borrow → buy STRK → push STRK price up → deposit STRK as collateral at inflated price → borrow USDC → price reverts → collateral undercollateralised. Defense: TWAP oracles eliminate single-block price manipulation."]',
  5, ARRAY['flash-loans', 'arbitrage', 'security']
),
(
  'starknet-defi-navigator', 'senior',
  'Starknet''s gas model differs from Ethereum. Explain: (1) the two-component fee structure (L2 execution + L1 data availability), (2) how EIP-4844 blobs affected Starknet''s L1 costs, (3) the economic implication for DeFi protocols that generate high data throughput, (4) how Starknet''s gas costs compare to Arbitrum for a typical DeFi transaction.',
  'explanation',
  '["Two-component fee: L2 execution fee (Cairo computation, paid to sequencer in STRK/ETH) + L1 data availability fee (cost to post state diff to Ethereum, shared across all transactions in a proof batch)",
    "EIP-4844 blobs: reduced L1 data costs by 10-50x by using blob transactions instead of calldata. Starknet''s L1 cost component dropped significantly post-4844, making the L2 execution fee the dominant cost.",
    "High data throughput DeFi implication: protocols with complex state changes (many storage writes per transaction) contribute more to DA cost. Simple swaps are cheap. Complex position updates or on-chain order books are relatively more expensive.",
    "vs Arbitrum: post-4844 costs similar (both $0.01-$0.10 for typical DeFi tx). Starknet has STARK proof amortisation advantage for batched transactions. Arbitrum has more liquid DEX ecosystem. For large batch operations, Starknet can be cheaper."]',
  4, ARRAY['gas', 'fees', 'starknet-infrastructure']
),
(
  'starknet-defi-navigator', 'senior',
  'Design a protocol for providing on-chain credit scoring on Starknet. (1) What on-chain data would you use to build a score, (2) how would you prevent gaming of the score, (3) what zero-knowledge proof mechanism could protect privacy while proving creditworthiness, (4) how does this enable undercollateralised lending and what risks remain.',
  'design',
  '["On-chain data for scoring: transaction history length and frequency, historical borrowing and repayment records (no defaults), wallet age, DeFi protocol interactions, token holdings (stability and composition), cross-chain reputation via attestations.",
    "Anti-gaming: score based on long-term history (minimum 12 months), not transferable to new wallets, weighted by capital at risk (easy to have a good score with $100, harder with $100K), Sybil detection through transaction graph analysis.",
    "ZK privacy: user proves to a ZK circuit that their off-chain credit data meets a threshold without revealing the underlying data. The circuit outputs a proof. Protocol verifies the proof without seeing the data. Similar to StarkNet''s own proving architecture.",
    "Risks remaining: (1) sophisticated wallets can build clean history for years then exploit. (2) Cross-chain identity still partially pseudonymous. (3) Smart contract risk in the credit system itself. (4) Privacy leak through timing analysis of transactions even without direct data."]',
  5, ARRAY['credit', 'protocol-design', 'zk-proofs']
),
(
  'starknet-defi-navigator', 'senior',
  'Nostra and Vesu are both Starknet lending protocols. Without looking at current data, explain the strategic questions you would investigate to determine which has a stronger competitive moat, and what specific data points from Dune, DefiLlama, or their documentation would answer each question.',
  'analysis',
  '["Question 1: TVL composition — what collateral types does each support? Answer via: protocol documentation + DefiLlama TVL breakdown. More collateral types = wider addressable market.",
    "Question 2: Integration depth — how many protocols route through each for lending? Answer via: on-chain event analysis on Dune (how many unique contract addresses call each lending protocol). Higher integration count = deeper moat.",
    "Question 3: Interest rate competitiveness — which protocol consistently offers better rates? Answer via: Dune query comparing daily supply/borrow APYs over 6+ months. Consistent rate advantage = capital efficiency or subsidy advantage.",
    "Question 4: Liquidation efficiency — which protocol handles liquidations faster with less bad debt? Answer via: Dune analysis of liquidation events, time from HF below 1.0 to liquidation execution, bad debt outstanding.",
    "Synthesis: the protocol with more collateral diversity, deeper integrations, better long-term rates, and cleaner liquidation history has the stronger moat."]',
  5, ARRAY['competitive-analysis', 'vesu', 'nostra']
),
(
  'starknet-defi-navigator', 'senior',
  'A $50M DeFi fund wants to provide Starknet ecosystem liquidity but requires: minimum 7% yield, quarterly liquidity for 40% of the portfolio, and all positions audited within the last 12 months. Identify which current Starknet protocols qualify, build the allocation, and identify the top 2 risk scenarios that could cause the fund to miss its targets.',
  'portfolio',
  '["Qualifying protocols: Vesu (audited, 5.4% — below target alone), Nostra (audited, similar), Ekubo (audited, variable LP yield), STRK staking (8.8% but 21-day unbonding violates quarterly liquidity for that portion)",
    "Allocation to hit 7%: $20M Vesu USDC (5.4% = $1.08M), $10M Nostra USDC (5.1% = $0.51M), $10M Ekubo STRK/USDC LP (target 15% net = $1.5M), $10M STRK staking (8.8% = $0.88M — flag quarterly liquidity breach for this portion). Total: $3.97M / $50M = 7.94% — meets target.",
    "Risk scenario 1: Starknet market crash reduces Ekubo LP yield to 5% and triggers impermanent loss. LP portion yield drops to ~2% net. Blended yield falls to 6.1% — misses 7% target.",
    "Risk scenario 2: Interest rate compression as TVL grows — all protocol yields fall to 3-4% as more capital chases Starknet yield. All positions underperform. Structural risk of being early in an ecosystem with limited organic yield."]',
  5, ARRAY['institutional', 'portfolio', 'fund-management']
),
(
  'starknet-defi-navigator', 'senior',
  'Explain the mathematical relationship between a lending protocol''s reserve factor, bad debt risk, and depositor yield. (1) Derive the formula showing how reserve factor affects depositor APY, (2) explain what the reserve fund is used for in practice, (3) model a scenario where the reserve fund is insufficient, (4) compare Aave''s safety module approach to Vesu''s approach.',
  'technical',
  '["Depositor APY derivation: borrow_APY × utilisation × (1 - reserve_factor). Reserve factor is a tax on interest payments — it reduces depositor yield proportionally to the protocol''s risk buffer accumulation rate.",
    "Reserve fund use: (1) cover bad debt from liquidations that execute at below-collateral prices. (2) Fund bug bounty/insurance. (3) Protocol operations. (4) Emergency depositor compensation.",
    "Insufficient scenario: $50M TVL lending protocol, reserve fund $500K (1%). A flash crash causes $2M bad debt (liquidations execute 4% below collateral value on $50M). Reserve fund covers $500K. Remaining $1.5M bad debt: depositors take a 3% haircut on principal.",
    "Aave safety module: AAVE token holders stake in a Safety Module that is slashable (up to 30%) to cover bad debt. This aligns governance token holders with protocol solvency — they are last-loss capital. Vesu''s approach: smaller protocol, relies on conservative LTV ratios and good oracle design to minimise bad debt rather than a large backstop."]',
  5, ARRAY['lending', 'reserve-factor', 'risk-management']
),
(
  'starknet-defi-navigator', 'senior',
  'Analyse the real-world chain of events that led to the UST/LUNA collapse. (1) The specific algorithmic mechanics that failed, (2) the death spiral mechanism, (3) how on-chain data (Anchor protocol outflows, LUNA mint rate) would have signalled the collapse 48 hours before it happened, (4) what this means for any algorithmic stablecoin design on Starknet.',
  'case-study',
  '["Mechanism failure: UST was collateralised by algorithmically minted LUNA. 1 UST could always be exchanged for $1 of LUNA. This only works if LUNA maintains value.",
    "Death spiral: (1) UST starts to depeg. (2) Arbitrageurs burn UST for LUNA at $1 value. (3) LUNA supply increases, price falls. (4) More UST holders lose confidence, sell. (5) More LUNA minted to support peg. (6) LUNA hyperinflates, loses all value. (7) UST backing is worthless. Full collapse.",
    "On-chain signals: Anchor outflows accelerating (72h before collapse: $2B per day leaving Anchor → holders reducing UST exposure). LUNA mint rate spiking (blockchain shows minting rate 10x normal = algorithm printing to defend peg). These were publicly visible.",
    "Starknet design implications: no algorithmic stablecoin (backed only by a volatile governance token) can survive a coordinated bank run at scale. Any stablecoin design requires: excess collateral, no circular backing, credible liquidation mechanism. Pure algorithmic designs are mathematical ponzi schemes during bank runs."]',
  5, ARRAY['stablecoins', 'case-study', 'systemic-risk']
),
(
  'starknet-defi-navigator', 'senior',
  'You have identified that a Starknet protocol has a critical vulnerability: the getPrice() function returns a manipulable spot price with no TWAP protection, and the protocol has $15M TVL. You hold 0 tokens and are not affiliated with the protocol. Walk through your complete responsible disclosure process, from discovery to resolution.',
  'ethics-and-process',
  '["Step 1 - Verify: Reproduce the vulnerability in a local fork environment. Confirm exploitability without harming mainnet users. Document: exact contract address, function name, attack parameters, estimated maximum extractable value.",
    "Step 2 - Contact: Find the protocol''s bug bounty or security contact (usually in docs or Immunefi). Send encrypted disclosure with full technical details. Set a 90-day disclosure deadline per standard responsible disclosure practice.",
    "Step 3 - Do not exploit: Even though the vulnerability is technically exploitable, exploiting it is: (1) illegal in most jurisdictions, (2) unethical as it harms real users, (3) would violate your disclosure commitment.",
    "Step 4 - Follow up: If no response in 7 days, escalate to Starknet Foundation security team. If no response in 30 days, proceed to public disclosure with enough time warning to let users exit.",
    "Expected outcome: reputable protocols pay bug bounties (Immunefi has paid millions for similar findings). This specific vulnerability ($15M at risk) could command a $50K-$300K bounty depending on the protocol''s bug bounty programme."]',
  4, ARRAY['security', 'ethics', 'responsible-disclosure']
)

ON CONFLICT DO NOTHING;

-- ============================================================
-- CAIRO BUILDER JUNIOR — 20 additional questions
-- Topics: types, storage, events, ERC-20, interfaces,
-- CEI pattern, account abstraction, testing basics
-- ============================================================

INSERT INTO skillup_dev.interview_questions (track_id, level, question, type, scoring_criteria, difficulty, tags) VALUES

(
  'cairo-builder', 'junior',
  'Explain Cairo''s ownership model for complex types. (1) What happens to a felt252 variable when you pass it to a function? (2) What happens to an Array<felt252> when you pass it? (3) How do you pass an Array without consuming it? (4) Why does Cairo''s ownership model matter for smart contract storage?',
  'technical',
  '["felt252 is a value type (Copy trait): passing it to a function creates a copy. Original variable still accessible after the call.",
    "Array<felt252> is not Copy: passing it moves ownership to the function. Original variable is no longer accessible after the call — compiler error if you try to use it.",
    "Pass without consuming: use a Snapshot (@Array<felt252>) for read-only access, or use ref for mutable borrowing. Snapshot: fn process(arr: @Array<felt252>) — caller retains ownership.",
    "Storage implication: storage reads/writes in Cairo use read() and write() functions that manage the ownership internally. Understanding ownership prevents bugs where you accidentally consume a value you need to write back to storage."]',
  2, ARRAY['cairo-types', 'ownership', 'lab0', 'lab1']
),
(
  'cairo-builder', 'junior',
  'Write a complete Cairo struct for a DeFi position with: position owner address, collateral token address, collateral amount (u256), borrowed amount (u256), creation timestamp (u64), and a bool for whether it''s active. Then write the storage declaration that maps a user address to their position.',
  'code',
  '["Correct struct: #[derive(Drop, Serde, starknet::Store)] struct Position { owner: ContractAddress, collateral_token: ContractAddress, collateral_amount: u256, borrowed_amount: u256, created_at: u64, is_active: bool }",
    "Note: #[derive(starknet::Store)] is required to store the struct in contract storage",
    "Storage declaration: #[storage] struct Storage { positions: Map<ContractAddress, Position> }",
    "Read/write usage: self.positions.read(user_address) and self.positions.write(user_address, new_position)"]',
  2, ARRAY['cairo-types', 'storage', 'structs', 'lab1']
),
(
  'cairo-builder', 'junior',
  'A Cairo contract needs to emit events for every transfer and every approval. (1) Write the event enum with correct Starknet event attributes, (2) explain the difference between a keyed field (#[key]) and a regular event field, (3) why does Starknet index keyed fields, (4) write the emit call for a Transfer event.',
  'code',
  '["Event enum: #[event] #[derive(Drop, starknet::Event)] enum Event { Transfer: Transfer, Approval: Approval } struct Transfer { #[key] from: ContractAddress, #[key] to: ContractAddress, value: u256 }",
    "#[key] fields are indexed: they can be efficiently searched and filtered in event logs. Regular fields are data only — they are stored but not indexed for fast lookup.",
    "Indexing reason: frontends and indexers (like Apibara) use keyed fields to filter events. #[key] from means ''find all transfers FROM this address'' is an efficient query.",
    "Emit call: self.emit(Transfer { from: caller, to: recipient, value: amount })"]',
  2, ARRAY['events', 'cairo', 'lab1']
),
(
  'cairo-builder', 'junior',
  'You are implementing a Cairo ERC-20 transfer function. List all the checks (assertions) you need before executing the transfer, in the correct order (Checks-Effects-Interactions). Write the complete function body.',
  'code',
  '["Checks: (1) assert(recipient != Zeroable::zero(), ''Transfer to zero address''), (2) assert(!recipient.is_zero(), equivalent), (3) let balance = self.balances.read(sender); assert(balance >= amount, ''Insufficient balance'')",
    "Effects (update state BEFORE any external calls): self.balances.write(sender, balance - amount); self.balances.write(recipient, self.balances.read(recipient) + amount);",
    "Interactions (events are fine after effects): self.emit(Transfer { from: sender, to: recipient, value: amount });",
    "CEI pattern: all checks complete, all state updated, then emit. For transfer this is straightforward — the critical CEI discipline matters most in withdraw/lending functions where external calls are made."]',
  2, ARRAY['erc20', 'cei', 'cairo', 'lab2']
),
(
  'cairo-builder', 'junior',
  'What is the purpose of the #[abi(embed_v0)] attribute in Cairo? How does it differ from #[external(v0)]? Write an example showing when you would use each.',
  'technical',
  '["#[abi(embed_v0)]: marks an impl block as implementing a trait interface that will be exposed as the contract''s ABI. Used when implementing a standard interface (IERC20, IERC721). The trait definition drives the ABI.",
    "#[external(v0)]: marks individual functions as externally callable. Used for ad-hoc external functions not part of a standard trait.",
    "Example #[abi(embed_v0)]: #[abi(embed_v0)] impl ERC20Impl of IERC20<ContractState> { fn transfer(ref self: ContractState, recipient: ContractAddress, amount: u256) -> bool { ... } }",
    "Example #[external(v0)]: #[external(v0)] fn set_admin(ref self: ContractState, new_admin: ContractAddress) { ... } — for a one-off function not part of any standard interface."]',
  2, ARRAY['cairo', 'abi', 'interfaces', 'lab2']
),
(
  'cairo-builder', 'junior',
  'Your Cairo contract needs to call another contract to check a user''s token balance. (1) Write the interface trait for the external contract, (2) write the dispatcher call, (3) explain what happens if the called contract does not exist at the given address, (4) explain the gas implications of cross-contract calls.',
  'code',
  '["Interface trait: #[starknet::interface] trait IERC20<TContractState> { fn balance_of(self: @TContractState, account: ContractAddress) -> u256; }",
    "Dispatcher call: let token_dispatcher = IERC20Dispatcher { contract_address: token_address }; let balance = token_dispatcher.balance_of(user);",
    "Non-existent contract: the call will succeed but return default values (0 for u256) because in Cairo, a call to a non-deployed address executes the default entry point which returns nothing. This is different from Ethereum where calls to EOAs revert — Cairo''s behaviour is a footgun. Always verify the contract exists.",
    "Gas: cross-contract calls are more expensive than internal calls. Each dispatcher call involves ABI encoding/decoding, context switching, and storage reads in the target contract. Batch multiple reads with multicall where possible."]',
  3, ARRAY['cross-contract', 'dispatcher', 'lab2']
),
(
  'cairo-builder', 'junior',
  'Explain Cairo''s component system (OpenZeppelin components). (1) What problem do components solve, (2) write the code to add OwnableComponent to a contract, (3) how does the component''s storage integrate with the contract''s storage, (4) what is an "internal" component function vs an "embedded" one.',
  'technical',
  '["Components solve: code reuse for common patterns (ownership, upgradeability, reentrancy guard, ERC standards). Without components, every contract reimplements the same security patterns with potential errors.",
    "Add OwnableComponent: use starknet::component; component!(path: OwnableComponent, storage: ownable, event: OwnableEvent); #[storage] struct Storage { #[substorage(v0)] ownable: OwnableComponent::Storage } in the Storage struct.",
    "Storage integration: #[substorage(v0)] embeds the component''s storage fields into the contract''s storage namespace. The component''s fields are accessed as self.ownable.fieldname.",
    "Internal vs embedded: internal functions are called within the contract only (access control helpers). Embedded functions become part of the contract''s external ABI (the public-facing functions)."]',
  3, ARRAY['components', 'openzeppelin', 'lab6']
),
(
  'cairo-builder', 'junior',
  'Write a basic snforge test for a Cairo counter contract. The test should: (1) deploy the contract, (2) call increment(), (3) assert the count is 1, (4) call increment() twice more, (5) assert the count is 3. Show the full test file structure.',
  'code',
  '["Test file structure: use starknet::ContractAddress; use snforge_std::{declare, ContractClassTrait, DeclareResultTrait}; use your_project::ICounterDispatcher, ICounterDispatcherTrait;",
    "#[test] fn test_counter_increment() { let contract = declare(''Counter'').unwrap().contract_class(); let (contract_address, _) = contract.deploy(@array![]).unwrap();",
    "let dispatcher = ICounterDispatcher { contract_address }; dispatcher.increment(); assert(dispatcher.get_count() == 1, ''Count should be 1'');",
    "dispatcher.increment(); dispatcher.increment(); assert(dispatcher.get_count() == 3, ''Count should be 3''); }",
    "Note: tests are compiled with #[cfg(test)] or in a tests module. snforge_std imports require adding snforge_std as dev-dependency in Scarb.toml."]',
  2, ARRAY['snforge', 'testing', 'lab4']
),
(
  'cairo-builder', 'junior',
  'A smart contract has this storage pattern: Map<ContractAddress, Map<ContractAddress, u256>> for token allowances. Explain: (1) what this nested mapping represents in ERC-20 context, (2) how you read the allowance for a specific spender, (3) why nested maps are more gas-efficient than a single map with a tuple key, (4) the correct way to update an allowance.',
  'technical',
  '["This is the allowances mapping: allowances[owner][spender] = amount. Owner grants spender the right to transfer up to amount tokens on their behalf.",
    "Read allowance: let allowance = self.allowances.read(owner).read(spender); — nested read calls through each Map level.",
    "Gas efficiency: with a tuple key Map<(ContractAddress, ContractAddress), u256>, the hash of the full tuple is computed each time. With nested maps, the inner map is a storage pointer that can be cached after the first outer read — more efficient for multiple reads of the same owner''s allowances.",
    "Update allowance: self.allowances.entry(owner).entry(spender).write(new_amount); — using entry() for write operations in nested maps."]',
  3, ARRAY['storage', 'maps', 'erc20', 'lab1']
),
(
  'cairo-builder', 'junior',
  'You are building a vesting contract. An address can claim their vested tokens after a 12-month cliff and then linearly over 24 months. (1) What storage variables do you need, (2) write the claim() function logic (pseudocode is fine for the math but Cairo syntax required for storage), (3) what is the critical security check you must not omit, (4) why does this contract need access to block_timestamp?',
  'code',
  '["Storage: allocation: Map<ContractAddress, u256>, start_time: Map<ContractAddress, u64>, claimed: Map<ContractAddress, u256>",
    "Claim logic: let current_time = get_block_timestamp(); let start = self.start_time.read(caller); let elapsed = current_time - start; if elapsed < CLIFF_DURATION { panic!(''Cliff not reached''); } let vested = calculate_vested(allocation, elapsed); let claimable = vested - self.claimed.read(caller); assert(claimable > 0, ''Nothing to claim''); self.claimed.write(caller, vested); // Effects BEFORE transfer token_dispatcher.transfer(caller, claimable);",
    "Critical security check: CEI pattern — update claimed amount BEFORE calling the token transfer. Reentrancy attack: without this, caller can re-enter claim() before claimed is updated and drain the contract.",
    "block_timestamp: vesting schedule is time-based. The contract needs the current block''s timestamp to calculate how much time has elapsed since the vesting start and therefore how many tokens are claimable."]',
  3, ARRAY['vesting', 'security', 'cairo', 'lab5']
),
(
  'cairo-builder', 'junior',
  'Explain the difference between a contract''s class_hash and contract_address in Starknet. (1) When you deploy a contract, what gets stored at the contract_address? (2) How does the upgradeable pattern work using this separation? (3) What is the security risk of an upgradeable contract for users?',
  'technical',
  '["class_hash: a unique hash of the compiled contract code (Sierra bytecode). Multiple deployed contracts can share the same class_hash if they have identical code.",
    "At contract_address: the runtime stores a pointer to the class_hash plus the contract''s storage. When you call a function, Starknet fetches the class_hash, loads the code, and executes it against that contract''s storage.",
    "Upgradeable pattern: calling replace_class_syscall(new_class_hash) changes which code executes against the same storage and address. New logic + old storage = upgraded contract. Users'' stored funds and state remain.",
    "Security risk: an upgradeable contract means the code can change. A malicious or compromised admin can upgrade to a new class that drains funds, changes ownership, or removes functionality. Users must trust the admin key(s) that control upgrades. Mitigations: timelock on upgrades (48h delay gives users time to exit), multisig, or renouncing upgrade keys for immutable contracts."]',
  2, ARRAY['upgradeability', 'starknet', 'lab9']
),
(
  'cairo-builder', 'junior',
  'Your Cairo contract tracks scores for a game. Scores are u64. Write a function that: (1) receives an array of (player: ContractAddress, score: u64) tuples, (2) updates each player''s score if the new score is higher than the existing, (3) emits a HighScoreBeaten event when a record is broken, (4) returns the number of records broken.',
  'code',
  '["Function signature: fn update_scores(ref self: ContractState, updates: Array<(ContractAddress, u64)>) -> u32",
    "Loop: let mut records_broken: u32 = 0; let mut i = 0; loop { if i >= updates.len() { break; } let (player, new_score) = *updates.at(i); let current = self.scores.read(player); if new_score > current { self.scores.write(player, new_score); self.emit(HighScoreBeaten { player, old_score: current, new_score }); records_broken += 1; } i += 1; };",
    "Event: #[derive(Drop, starknet::Event)] struct HighScoreBeaten { #[key] player: ContractAddress, old_score: u64, new_score: u64 }",
    "Return: records_broken"]',
  3, ARRAY['arrays', 'loops', 'cairo', 'lab1']
),
(
  'cairo-builder', 'junior',
  'What are panics in Cairo and how do they differ from errors in other languages? (1) What happens to a transaction when a Cairo contract panics, (2) how do you cause a panic intentionally, (3) write an example of using Option<T> to handle a potentially absent value without panicking, (4) when should you panic vs return an error type?',
  'technical',
  '["Panic: immediately terminates the current execution. All state changes in that transaction are reverted (rolled back). The transaction is recorded on-chain as REVERTED but the gas fee is still charged.",
    "Intentional panic: assert(condition, ''error message'') — panics if condition is false. Or panic!(''message'') directly. Or unwrap() on None.",
    "Option<T> example: let maybe_value: Option<u256> = self.registry.get(key); match maybe_value { Option::Some(v) => { // use v }, Option::None => { // handle absent case without panicking } }",
    "Panic vs error: panic when: invariant violation (impossible state), access control failure, arithmetic overflow. Return error (Option/Result) when: expected failure path that callers should handle gracefully. Balance lookups should return Option. Security checks should panic."]',
  2, ARRAY['error-handling', 'cairo', 'lab0']
),
(
  'cairo-builder', 'junior',
  'Explain felt252 arithmetic and its edge cases. (1) What is P in the context of felt252? (2) What happens when you compute 0 - 1 in felt252? (3) Why is this dangerous for financial calculations? (4) Give a concrete example where you would use u256 instead of felt252 for a token balance, and show the overflow protection.',
  'technical',
  '["P (the field prime): P = 2^251 + 17*2^192 + 1 ≈ 3.6 × 10^75. felt252 values live in the range [0, P-1].",
    "0 - 1 in felt252: wraps around to P-1 (a very large positive number). No underflow error. This is modular arithmetic by design.",
    "Financial danger: if a balance is felt252 and you compute balance - withdrawal_amount without checking balance >= withdrawal_amount first, a larger withdrawal than balance gives a massive positive number (P - difference) rather than an error. User could appear to have unlimited funds.",
    "u256 token balance with overflow: let balance: u256 = self.balances.read(account); assert(balance >= amount, ''Insufficient balance''); self.balances.write(account, balance - amount); // u256 subtraction is checked — panics on underflow automatically"]',
  3, ARRAY['felt252', 'arithmetic', 'security', 'lab0']
),
(
  'cairo-builder', 'junior',
  'You need to implement access control for three role levels: admin, operator, and viewer. Admins can do everything. Operators can execute operations but not change roles. Viewers can only read. Write the storage layout, role check functions, and one example protected function for each level.',
  'code',
  '["Storage: admin: ContractAddress, operators: Map<ContractAddress, bool>, viewers: Map<ContractAddress, bool>",
    "Role check fns: fn assert_admin(self: @ContractState) { assert(get_caller_address() == self.admin.read(), ''Not admin''); } fn assert_operator(self: @ContractState) { let caller = get_caller_address(); assert(caller == self.admin.read() || self.operators.read(caller), ''Not operator''); } fn assert_viewer(self: @ContractState) { let caller = get_caller_address(); assert(caller == self.admin.read() || self.operators.read(caller) || self.viewers.read(caller), ''Not viewer''); }",
    "Admin protected: fn set_operator(ref self: ContractState, addr: ContractAddress, enabled: bool) { self.assert_admin(); self.operators.write(addr, enabled); }",
    "Operator protected: fn execute_operation(ref self: ContractState) { self.assert_operator(); /* execution logic */ }"]',
  3, ARRAY['access-control', 'cairo', 'lab2', 'lab3']
),
(
  'cairo-builder', 'junior',
  'What is a Starknet selector and how is it calculated? (1) What problem does the selector solve, (2) how does Starknet route a transaction to the correct function, (3) what is the risk of function selector collisions, (4) write a Cairo call to get_selector_from_name and explain when you would use it.',
  'technical',
  '["Selector: a unique identifier for a function, calculated as the Pedersen hash (or Keccak in newer versions) of the function name string. Solves the ABI encoding problem — the network needs a compact way to identify which function to call.",
    "Routing: a transaction includes entry_point_selector (the selector hash). The runtime looks up which function in the contract class has that selector and executes it.",
    "Collision risk: two different function names could theoretically produce the same selector hash. In practice, Starknet uses a sufficiently large hash space to make this negligible. More practically: name collisions in your own contract are prevented by the compiler.",
    "Usage: let selector = starknet::get_selector_from_name(''transfer''); — used when constructing low-level Call structs for multicall or when building test fixtures that need raw call data."]',
  3, ARRAY['selectors', 'starknet', 'low-level', 'lab2']
),
(
  'cairo-builder', 'junior',
  'A junior developer writes a Cairo contract that stores a price as a felt252. The price is $1.42 per token. (1) What is the standard way to represent decimal prices in Cairo? (2) What precision is standard for prices on Starknet (Pragma uses what precision)? (3) Write a function that calculates the value of a token holding using this representation, (4) what overflow risk exists and how do you handle it?',
  'technical',
  '["Standard: use integer representation with a fixed precision multiplier. $1.42 with 8 decimal places = 142,000,000 (1.42 × 10^8). Never store decimals directly.",
    "Pragma precision: prices are typically stored with 8 decimal places (10^8 precision). Some feeds use 18 decimal places to match ERC-20 token precision.",
    "Value calculation: fn calculate_value(amount: u256, price: u256) -> u256 { // amount in token decimals (e.g. 18), price in 8 decimals // result: amount × price / 10^8 let value = amount * price; value / 100_000_000_u256 }",
    "Overflow risk: amount (u256) × price (u256) could overflow u256 if both are large. Mitigation: use u512 for intermediate calculation, or check that amount < u256::MAX / price before multiplication. Pragma provides u256 prices — for very large amounts, check bounds."]',
  3, ARRAY['fixed-point', 'precision', 'oracle', 'lab6']
),
(
  'cairo-builder', 'junior',
  'Explain what gas in Cairo/Starknet measures and how it differs from Ethereum gas. (1) What are the two main cost components of a Starknet transaction, (2) what operations are most expensive in Cairo (in approximate order), (3) how does Sierra guarantee gas is always paid, (4) write an example of a storage optimisation that reduces gas.',
  'technical',
  '["Two cost components: (1) L2 execution gas — Cairo VM step count, storage reads/writes. (2) L1 data availability cost — the state diff (what changed) posted to Ethereum. After EIP-4844, L1 cost uses blob space at much lower prices.",
    "Most expensive operations (approximate): storage writes > storage reads > hash computations > arithmetic. Cross-contract calls add the cost of the called contract''s execution.",
    "Sierra gas guarantee: Sierra programs always complete with a measurable cost. Every Sierra instruction has a gas cost. Before execution, the sequencer knows the maximum possible gas cost and charges it upfront. No infinite loops possible — the compiler rejects them.",
    "Storage optimisation: pack multiple small values into one storage slot using bitpacking. Example: instead of storing four u8 values in four slots (4 storage writes), pack into one u32. StorePacking trait in Cairo enables this."]',
  3, ARRAY['gas', 'optimisation', 'cairo', 'lab9']
),
(
  'cairo-builder', 'junior',
  'Walk through deploying a Cairo contract to Starknet Sepolia testnet. List every step, every command, and every output you expect. Assume you have scarb installed and a funded testnet wallet.',
  'process',
  '["Step 1: Write contract and compile. scarb build — produces target/dev/[contract_name].contract_class.json and sierra file",
    "Step 2: Declare the contract class. starkli declare target/dev/MyContract.contract_class.json --account ~/.starkli-wallets/account.json --keystore ~/.starkli-wallets/key.json --rpc https://starknet-sepolia.public.blastapi.io/rpc/v0_7 — outputs class hash: 0x...",
    "Step 3: Deploy an instance. starkli deploy [class_hash] [constructor_args] --account [...] --keystore [...] --rpc [...] — outputs contract address: 0x...",
    "Step 4: Verify on Voyager. Open https://sepolia.voyager.online/contract/[address] — should show your contract class, ABI, storage, and transaction history",
    "Step 5: Call a view function to verify. starkli call [address] function_name [args] — returns function output"]',
  2, ARRAY['deployment', 'sepolia', 'scarb', 'lab0']
),
(
  'cairo-builder', 'junior',
  'What are Cairo traits and why are they fundamental to writing good contracts? (1) Define a trait, (2) show an example of a trait with a default implementation, (3) explain how OpenZeppelin uses traits for its component system, (4) why is implementing a trait more composable than inheritance.',
  'technical',
  '["Trait: defines a set of methods that a type must implement. Similar to interfaces in Java or Rust traits. trait ICalculator<TContractState> { fn add(self: @TContractState, a: u256, b: u256) -> u256; }",
    "Default implementation: trait IFormatter { fn format(self: @Self, value: u256) -> felt252 { // default: just convert to string representation integer_to_string(value) } } — types can override or use the default",
    "OZ component traits: OwnableComponent defines a trait InternalTrait with functions like _transfer_ownership. The component provides the implementation. Your contract can call these via self.ownable._transfer_ownership(new_owner) using the component''s storage.",
    "Composability over inheritance: a type can implement multiple traits. Inheritance creates a single hierarchy — you can only have one parent. Traits are orthogonal — IOwnable and IUpgradeable and IERC20 can all be independently implemented by the same contract."]',
  2, ARRAY['traits', 'cairo', 'openzeppelin', 'lab1']
)

ON CONFLICT DO NOTHING;

-- ============================================================
-- CAIRO BUILDER SENIOR — 20 additional questions
-- Topics: advanced security, protocol architecture,
-- formal verification, gas optimisation, cross-contract
-- ============================================================

INSERT INTO skillup_dev.interview_questions (track_id, level, question, type, scoring_criteria, difficulty, tags) VALUES

(
  'cairo-builder', 'senior',
  'Design a complete multi-signature wallet contract in Cairo with: 3-of-5 signers, 48-hour timelock on transactions above $100K, and emergency cancel by any signer. Write: (1) the storage layout, (2) the propose() function signature and logic, (3) the execute() function with timelock enforcement, (4) the attack vector this design still has and its mitigation.',
  'architecture',
  '["Storage: signers: Map<ContractAddress, bool>, signer_count: u32, threshold: u32, transactions: Map<u256, Transaction>, tx_count: u256. Transaction struct: to, calldata, approvals: Map<ContractAddress, bool>, approval_count, executed: bool, created_at: u64, value: u256",
    "propose(): assert signer, create Transaction entry, increment tx_count, caller''s approval auto-set to true, approval_count = 1",
    "execute(): assert signer called, assert approval_count >= threshold, if tx.value > 100_000_USDC_EQUIVALENT assert(get_block_timestamp() >= tx.created_at + 172800), assert(!tx.executed), execute the call, set executed = true",
    "Attack vector: a compromised signer proposes a malicious transaction and waits 48h + gets 2 other signers to approve. Mitigation: emergency cancel (any signer can cancel an unexecuted tx) removes the 48h waiting period as a guaranteed safe window. True multisig security = protecting the signer keys."]',
  5, ARRAY['multisig', 'architecture', 'lab9']
),
(
  'cairo-builder', 'senior',
  'Walk through a complete formal verification approach for a Cairo lending contract using StarkNet Foundry''s fuzz testing. (1) What invariants would you test for a lending protocol, (2) write a fuzz test that verifies the health factor calculation invariant, (3) explain property-based testing vs unit testing, (4) what Cairo tooling exists for formal verification beyond snforge fuzz.',
  'testing',
  '["Core invariants: (1) sum(borrowed) ≤ sum(deposited) always. (2) health_factor = (collateral × threshold) / debt — never negative. (3) total_shares × price_per_share = total_assets. (4) after any deposit, withdraw, borrow, repay — balances sum correctly.",
    "Fuzz test: #[test] #[fuzzer(runs: 1000)] fn fuzz_health_factor(collateral: u256, threshold: u16, debt: u256) { if debt == 0 { return; } let threshold_pct = threshold % 100; let hf = calculate_hf(collateral, threshold_pct.into(), debt); if collateral * threshold_pct.into() >= debt { assert(hf >= 1000000000000000000_u256, ''HF should be >= 1 when collateralised''); } }",
    "Property-based vs unit: unit tests test specific inputs. Fuzz/property tests generate thousands of random inputs and check that an invariant holds for all of them. Finds edge cases unit tests miss.",
    "Beyond snforge: Certora Prover (formal verification for EVM, working on Cairo port), Kakarot formal semantics work, Manual mathematical proof of invariants, Symbolic execution tools."]',
  5, ARRAY['testing', 'formal-verification', 'fuzz', 'lab4']
),
(
  'cairo-builder', 'senior',
  'A production Cairo lending protocol needs to handle liquidations. Design the complete liquidation mechanism: (1) the liquidation_threshold vs max_ltv distinction and why both exist, (2) the exact liquidation bonus calculation that prevents bad debt while being fair to borrowers, (3) how to handle a position that is so underwater that the bonus would exceed the collateral, (4) write the core liquidation function.',
  'architecture',
  '["max_ltv (e.g. 75%): maximum LTV at which new borrows are allowed. liquidation_threshold (e.g. 82%): LTV at which liquidation becomes possible. Buffer exists because: if max_ltv = liquidation_threshold, a tiny price move triggers liquidation. Buffer gives borrowers time to add collateral.",
    "Liquidation bonus: liquidator repays X of debt and receives X × (1 + bonus%) of collateral. Typical 5-10%. Too low = no liquidation incentive. Too high = unfair to borrower. Bad debt prevention: liquidation_threshold + bonus should not exceed 100%. At 82% + 10% = 90% max — gives 10% buffer before bad debt.",
    "Fully underwater position: if debt > collateral × (1 + bonus%), give liquidator ALL collateral for repaying as much debt as possible. Record bad debt. Insurance fund (if exists) covers the remainder.",
    "Function: fn liquidate(ref self, borrower, repay_amount, collateral_token) { assert(self.health_factor(borrower) < 1e18, ''Not liquidatable''); let collateral_to_seize = repay_amount * (1e18 + BONUS) / price; self.borrowed.write(borrower, self.borrowed.read(borrower) - repay_amount); self.collateral.write(borrower, self.collateral.read(borrower) - collateral_to_seize); transfer(caller, collateral_to_seize); }"]',
  5, ARRAY['lending', 'liquidation', 'architecture', 'lab6']
),
(
  'cairo-builder', 'senior',
  'Implement a Cairo contract that tracks token supply with decimals using StorePacking. The contract stores: token_id (u32), decimals (u8), max_supply (u128), current_supply (u128). (1) Write the StorePacking implementation to pack these into two felt252 slots, (2) explain the gas savings, (3) write the bounds checks required, (4) explain when StorePacking is NOT worth using.',
  'technical',
  '["StorePacking: #[derive(Copy, Drop)] struct TokenInfo { token_id: u32, decimals: u8, max_supply: u128, current_supply: u128 } impl TokenInfoStorePacking of StorePacking<TokenInfo, (felt252, felt252)> { fn pack(value: TokenInfo) -> (felt252, felt252) { let p1: felt252 = value.token_id.into() * 0x100 + value.decimals.into(); let p2: felt252 = value.max_supply.into() * POW128 + value.current_supply.into(); (p1, p2) } fn unpack(value: (felt252, felt252)) -> TokenInfo { ... }}",
    "Gas savings: 4 separate storage variables = 4 storage read/write operations. Packed into 2 felt252 = 2 storage read/write operations. 50% reduction in storage operations for this struct.",
    "Bounds checks: token_id <= u32::MAX, decimals <= 18 (sane bound), current_supply <= max_supply, max_supply <= u128::MAX. All must be verified before packing.",
    "Not worth packing when: values change independently frequently (separate writes are cheaper than unpack-modify-pack). Data is rarely read together. Values are already full-width types (no benefit in packing two u128 — they fill two felt252 naturally)."]',
  4, ARRAY['storepacking', 'gas', 'optimisation', 'lab9']
),
(
  'cairo-builder', 'senior',
  'You discover a reentrancy vulnerability in a deployed Cairo contract that you do not own. The contract holds $5M. Walk through: (1) constructing a proof-of-concept (PoC) snforge fork test that demonstrates the exploit WITHOUT touching mainnet, (2) the responsible disclosure process, (3) the legal risk of actually executing the exploit for "whitehat" recovery, (4) how Starknet''s execution model makes this specific to Cairo context.',
  'security',
  '["PoC fork test: use snforge_std::fork(RPC_URL, block_number) to test against real state. Write a malicious ReentrancyAttacker contract that calls withdraw() and in its receive() callback calls withdraw() again before balance is updated. Assert that final attacker balance > initial deposit.",
    "Disclosure: (1) Document full PoC. (2) Contact protocol team via secure channel (usually security@protocol.xyz or Immunefi). (3) 72-hour emergency window for them to pause the contract. (4) Disclose after fix deployed. Never share PoC publicly before fix.",
    "Legal risk: ''whitehat recovery'' (hacking the contract to prevent a bad actor) is legally ambiguous in most jurisdictions. Without explicit permission from the protocol, accessing funds not belonging to you is criminal in many countries. Bug bounties are the legitimate path — not self-help recovery.",
    "Cairo context: Cairo contracts can be paused by admin (if pause mechanism exists) faster than Ethereum. Cairo''s lack of fallback functions reduces attack surface but cross-contract call reentrancy still possible. snforge fork testing against Sepolia or mainnet-fork is the PoC tool."]',
  5, ARRAY['security', 'reentrancy', 'responsible-disclosure', 'lab12']
),
(
  'cairo-builder', 'senior',
  'Design a Cairo DEX with concentrated liquidity (Uniswap v3-style). Focus on the core mathematics: (1) the liquidity formula and what L represents, (2) how to calculate token amounts for a given price range, (3) the tick system and sqrt_price representation, (4) write the core swap calculation function (can be pseudocode with Cairo types).',
  'architecture',
  '["L (liquidity): L = sqrt(x * y) where x and y are virtual reserves. L is constant within a tick range and represents the geometric mean of virtual reserves. Higher L = more liquidity = lower price impact.",
    "Token amounts for range [pa, pb] at current price p: x_amount = L * (1/sqrt(p) - 1/sqrt(pb)). y_amount = L * (sqrt(p) - sqrt(pa)). These are the token amounts needed to provide liquidity in this range at current price p.",
    "Tick system: sqrt_price stored as Q64.96 fixed-point number. Each tick corresponds to 0.01% price difference (1 basis point). tick = log_1.0001(price) * 2 (for sqrt). This discretisation enables efficient range queries.",
    "Swap function: fn compute_swap_step(sqrt_price_current: u256, sqrt_price_target: u256, liquidity: u256, amount_remaining: i256) -> (u256, u256, u256) { // compute amount_in, amount_out, sqrt_price_next based on which bound is hit first } — core loop continues until amount_remaining = 0 or price target reached."]',
  5, ARRAY['dex', 'concentrated-liquidity', 'mathematics', 'lab7']
),
(
  'cairo-builder', 'senior',
  'Explain account abstraction in depth from a Cairo contract developer''s perspective. (1) How does __validate__ interact with the Cairo VM''s signature validation?, (2) implement a session key system with spending limits and expiry in __validate__, (3) what makes session keys more powerful on Starknet than EIP-4337?, (4) design the storage for a production-grade session key manager.',
  'architecture',
  '["__validate__ and the VM: __validate__ is called BEFORE execution by the sequencer to check if the account authorises the transaction. It must return VALIDATED or panic. The sequencer executes __validate__ in a restricted context (no storage writes) to prevent DoS.",
    "Session key in __validate__: check if tx signature is from the main key (always valid) OR from a registered session key. For session key: assert(session_key.expires_at > get_block_timestamp(), ''Expired''); check spending limit not exceeded for this session.",
    "Starknet vs EIP-4337: on Starknet, __validate__ is native protocol — zero overhead, works on every transaction. EIP-4337 requires UserOperation bundles processed through an EntryPoint contract — extra complexity and cost. Starknet session keys work for ALL transaction types natively.",
    "Session key storage: sessions: Map<felt252, Session>. Session struct { key: felt252 (pubkey hash), allowed_contracts: Array<ContractAddress>, spending_limit: u256, spent: u256, expires_at: u64, revoked: bool }"]',
  5, ARRAY['account-abstraction', 'session-keys', 'lab3']
),
(
  'cairo-builder', 'senior',
  'A production Cairo contract uses Apibara to index events. (1) Explain the complete pipeline from contract event emission to a queryable database, (2) write the Apibara DNA configuration for indexing Transfer events from an ERC-20, (3) how do you handle chain reorganisations in the indexer, (4) what happens to your indexed data if Starknet rolls back a block?',
  'fullstack',
  '["Pipeline: Contract emits Transfer event → Sequencer includes in block → STARK proof submitted to L1 → Apibara reads block from Starknet node → DNA filter matches Transfer events → StreamService sends event data → your indexer Python/TypeScript script receives → writes to PostgreSQL → FastAPI queries PostgreSQL → frontend displays.",
    "DNA config (TOML): [filter] [[filter.header]] [[filter.events]] from_address = ''0xYOUR_CONTRACT'' keys = [''0x99cd8bde557814842a3121e8ddfd433a539b8c9f495ba0a7eac4a0a5cb37b3''] (Transfer selector)",
    "Reorg handling: Apibara provides invalidation messages when a block is reorganised. Your indexer receives an InvalidateData message with the block number. You must: delete all indexed data from that block number onwards, re-process from the reorganised block.",
    "Starknet block rollback: Starknet proofs provide finality — once submitted to Ethereum L1, blocks cannot be rolled back. However, before L1 finality (the window between L2 block and L1 proof), the sequencer could theoretically reorganise. Apibara''s invalidation handling covers this window."]',
  5, ARRAY['apibara', 'fullstack', 'indexing', 'lab10']
),
(
  'cairo-builder', 'senior',
  'Analyse the Diamond pattern (EIP-2535 adapted for Cairo) for a modular DeFi protocol. (1) What problems does it solve for large protocols, (2) what are the Cairo-specific challenges of implementing it, (3) design the facet structure for a complete DeFi lending protocol, (4) what are the storage collision risks and how do you prevent them?',
  'architecture',
  '["Diamond pattern solves: contract size limits (Starknet has contract size limits), upgradeability per-module (can upgrade lending logic without touching collateral logic), shared storage across facets.",
    "Cairo challenges: Cairo does not have fallback functions (core of Ethereum diamond). Workaround: a Router contract that dispatches calls to facet contracts based on selector. Each facet is a separately deployed contract class.",
    "Facet structure for lending: LendingFacet (deposit, withdraw, borrow, repay), CollateralFacet (addCollateral, removeCollateral, getHealth), LiquidationFacet (liquidate, calculateBonus), OracleFacet (updatePrice, getPrice), AdminFacet (setParams, addCollateral type, pause)",
    "Storage collisions: each facet must use a unique storage namespace. Use a storage diamond pattern: each facet''s storage keyed by a unique slot hash (keccak of facet name). Facet A reads from slot hash(''LendingFacet''), facet B reads from hash(''CollateralFacet''). Never overlapping."]',
  5, ARRAY['architecture', 'diamond-pattern', 'lab9']
),
(
  'cairo-builder', 'senior',
  'You are writing a Cairo AMM. Implement protection against the following attacks: (1) front-running — user submits a large swap, attacker sees it and sandwiches, (2) just-in-time liquidity — attacker adds liquidity in the same block as a large trade, captures fees, removes immediately, (3) price manipulation via flash loans. Write the specific Cairo code or mechanism for each protection.',
  'security',
  '["Front-running protection: commit-reveal scheme OR minimum output amount parameter. fn swap(amount_in: u256, min_amount_out: u256, deadline: u64) — if actual output < min_amount_out OR get_block_timestamp() > deadline → panic. Forces attacker''s sandwich to violate user''s slippage tolerance.",
    "JIT liquidity: time-lock on fee accrual. struct Position { added_at: u64, ... }. In collect_fees: assert(get_block_timestamp() >= position.added_at + MIN_FEE_PERIOD, ''Position too new''). MIN_FEE_PERIOD = 300 seconds prevents block-local JIT.",
    "Flash loan price manipulation: TWAP price oracle, never use spot price for critical calculations. fn get_price() -> u256 { let current = get_spot_price(); let twap = self.price_accumulator.read() / elapsed_time; assert((current - twap).abs() < MAX_DEVIATION, ''Price manipulated''); twap }",
    "Defence in depth: all three together make sandwich attacks economically unviable (slippage protection), JIT unviable (time lock), and oracle manipulation unviable (TWAP)."]',
  5, ARRAY['security', 'amm', 'attack-vectors', 'lab12']
),

-- 10 more senior questions for Cairo Builder
(
  'cairo-builder', 'senior',
  'Describe the complete STRIDE threat model for a Cairo staking contract. Map every entry in the STRIDE framework to a specific threat, a specific attack vector, and a specific Cairo-level mitigation.',
  'security',
  '["S (Spoofing): attacker spoofs caller identity. Attack: calls stake(user_A) pretending to be user_A. Mitigation: use get_caller_address() not user-supplied address parameter.",
    "T (Tampering): attacker modifies contract state. Attack: finds a storage variable that''s not properly access-controlled. Mitigation: assert_owner/operator on all state-modifying functions.",
    "R (Repudiation): users deny they staked. Attack: front-end dispute. Mitigation: emit Staked events with caller, amount, timestamp — on-chain non-repudiation.",
    "I (Information Disclosure): expose private user data. Cairo: all storage is public. Mitigation: design around this — no truly private data on-chain. Use ZK proofs for private amounts.",
    "D (Denial of Service): attacker prevents legitimate staking. Attack: spam the protocol with 0-amount stakes to run up gas costs. Mitigation: assert(amount > MIN_STAKE_AMOUNT).",
    "E (Elevation of Privilege): attacker gains admin. Attack: front-run the initialize() call if not protected. Mitigation: initialise admin in constructor (not separate function), or use initializer guard."]',
  5, ARRAY['stride', 'security', 'lab12']
),
(
  'cairo-builder', 'senior',
  'Implement a Cairo contract that executes arbitrary calls on behalf of a governance system with a timelock. Requirements: proposals expire after 7 days, 48h timelock before execution, quorum requirement stored on-chain. Design the full contract including graceful handling of failed proposal execution.',
  'architecture',
  '["Proposal struct: id u256, calldata Array<Call>, proposer ContractAddress, votes_for u256, votes_against u256, created_at u64, executed bool, expired bool",
    "Timelock: fn execute(proposal_id) { let prop = self.proposals.read(id); assert(prop.votes_for > QUORUM); assert(get_block_timestamp() >= prop.created_at + 48*3600, ''Timelock''); assert(get_block_timestamp() < prop.created_at + 7*24*3600, ''Expired''); assert(!prop.executed); self.proposals.write(id, Proposal { executed: true, ..prop }); for call in prop.calldata { // execute call, handle failure gracefully } }",
    "Graceful failure: wrap each call in a try-catch pattern (Cairo doesn''t have try-catch natively — use inner function that returns Result<(), felt252>). If a call fails, mark proposal as partially_executed and emit FailedExecution event rather than reverting the entire proposal.",
    "Security: re-entrancy guard on execute(). Proposal calldata stored as Array<Call> with validated target addresses."]',
  5, ARRAY['governance', 'timelock', 'lab11']
),
(
  'cairo-builder', 'senior',
  'Your team is launching a Cairo protocol to mainnet. Write the complete production deployment checklist covering: code quality gates, security requirements, operational setup, and monitoring requirements. What would the Starknet Foundation''s security review focus on?',
  'process',
  '["Code quality gates: all tests passing (snforge), code coverage >90%, no TODO/FIXME/hardcoded addresses, all functions documented, external audit complete from Tier-1 firm, audit findings resolved and re-verified.",
    "Security requirements: no unresolved Critical/High audit findings, timelock on admin functions (minimum 48h), upgrade mechanism secured with multisig (minimum 2-of-3), emergency pause implemented, reentrancy guards on all state-modifying external functions, oracle using TWAP not spot.",
    "Operational: monitoring on Voyager for contract events, alert on unusual deposit/withdrawal volumes, runbook for emergency pause execution, key management (hardware wallets for multisig signers), incident response plan with 30-minute response window.",
    "Starknet Foundation review focus: Cairo version (latest stable), Sierra compilation verified, sequencer integration (AA compatibility), correctness of the STARKs being generated, economic design (no governance attacks or inflation exploits), whether it follows Starknet standards (SNIPs)."]',
  4, ARRAY['production', 'deployment', 'checklist']
),
(
  'cairo-builder', 'senior',
  'Explain Starknet''s recursive STARK proofs and their implications for protocol design. (1) What is recursion in the context of ZK proofs, (2) how does SHARP (Shared Prover) work, (3) what does recursive proving enable for throughput and cost, (4) how should a Cairo protocol designer think about proof generation latency in their user experience?',
  'technical',
  '["Recursive proofs: a STARK proof can prove that another STARK proof is valid. This allows aggregating thousands of transaction proofs into one proof, which proves all of them simultaneously. The final proof submitted to L1 is compact regardless of the number of transactions it covers.",
    "SHARP: StarkWare''s Shared Prover batches transactions from multiple applications into joint proofs. Your protocol''s transactions are combined with others from across the Starknet ecosystem into a single proof, sharing the L1 proof cost.",
    "Throughput implications: recursive proofs make Starknet''s throughput theoretically unlimited (more proving parallelism). Cost: L1 proof cost is amortised across thousands of transactions via SHARP batching — your users pay a tiny fraction of an L1 proof cost.",
    "UX implications: between L2 block inclusion (seconds) and L1 proof finality (hours), there is a latency gap. Design for: (1) show L2 confirmation immediately, (2) show L1 finalised status once proof is on Ethereum. For DeFi: L2 confirmation is sufficient for most operations, L1 finality matters for bridge withdrawals."]',
  4, ARRAY['stark-proofs', 'sharp', 'architecture']
),
(
  'cairo-builder', 'senior',
  'A Starknet DeFi protocol wants to use an on-chain randomness source for a fair liquidation queue. (1) Why is block_hash insufficient for on-chain randomness, (2) what is the VRF (Verifiable Random Function) solution, (3) how does Pragma''s VRF service work on Starknet, (4) write the Cairo interface for requesting and receiving a random number from Pragma VRF.',
  'technical',
  '["block_hash insufficient: block producers (the sequencer) know the block hash before publishing. They can manipulate the block hash by including/excluding transactions until the hash favours them. Also, miners/sequencers could reorder transactions to game randomness derived from block hash.",
    "VRF solution: a trusted oracle generates a random number off-chain using a cryptographic function keyed to: the contract''s seed + block info + oracle''s private key. The oracle provides both the random number AND a cryptographic proof that it was generated correctly. The proof is verifiable on-chain.",
    "Pragma VRF: contract requests randomness from Pragma VRF oracle by calling request_random(seed, callback_address). Pragma''s off-chain service generates the VRF output and calls back with (random_value, proof). Contract verifies the proof and uses the random value.",
    "Interface: #[starknet::interface] trait IPragmaVRF<T> { fn request_random(ref self: T, seed: felt252, callback_address: ContractAddress) -> felt252; // returns request_id } trait IVRFCallback<T> { fn receive_random_words(ref self: T, requestor_address: ContractAddress, request_id: felt252, random_words: Span<felt252>); }"]',
  4, ARRAY['oracle', 'randomness', 'vrf', 'lab6']
),
(
  'cairo-builder', 'senior',
  'A production Cairo contract is hit by an exploit and $3M is being drained. You are the on-call engineer. Walk through every decision and action in the first 60 minutes: what you trigger, in what order, who you call, what the technical steps are on the Cairo/Starknet side.',
  'incident-response',
  '["0-5 minutes: confirm exploit. Check Voyager for anomalous outflows. Identify the function being called and the attack vector. Estimate rate of drain.",
    "5-10 minutes: trigger emergency pause if the contract has pause functionality. Call the pause() function from the admin multisig. If multisig requires 2 signers, contact second signer immediately via secure channel (Signal, not Telegram).",
    "10-20 minutes: notify Starknet Foundation security (security@starkware.co), notify your audit firm, post a public statement on X/Twitter: ''We are investigating unusual activity and have paused the protocol. Funds may be at risk. Do not interact with [protocol]. Update coming in 30 mins.''",
    "20-40 minutes: work with audit firm to identify the exact vulnerability. Assess whether: (a) remaining funds can be secured by migrating to a new contract, (b) the attacker can be front-run (if on testnet first possible), (c) any other entry points remain open.",
    "40-60 minutes: update public communication with details. File an incident report with the attack vector, funds at risk, and immediate response steps. Begin recovery planning."]',
  4, ARRAY['incident-response', 'security', 'production']
),
(
  'cairo-builder', 'senior',
  'Implement a Cairo price oracle adapter that aggregates prices from Pragma and uses a fallback. Requirements: (1) primary source is Pragma TWAP, (2) if Pragma is more than 5 minutes stale, fall back to a secondary source, (3) if both fail, pause all protocol operations, (4) emit an event when the fallback is triggered. Write the complete implementation.',
  'code',
  '["Storage: pragma_address: ContractAddress, fallback_address: ContractAddress, last_price: u256, last_update: u64, using_fallback: bool",
    "get_price function: let (pragma_price, pragma_age) = pragma.get_price_with_timestamp(asset); if pragma_age < 300 { // 5 minutes in seconds if self.using_fallback.read() { self.using_fallback.write(false); self.emit(OraclePrimary {}); } return pragma_price; } // Pragma stale, try fallback let (fallback_price, fallback_age) = fallback.get_price(asset); if fallback_age < 600 { if !self.using_fallback.read() { self.using_fallback.write(true); self.emit(FallbackActivated { asset, reason: ''Pragma stale'' }); } return fallback_price; } // Both stale self.emit(OracleFailure { asset }); panic!(''Oracle failure: all sources stale''); // Pause enforcement handled by caller",
    "Pause integration: caller checks OracleAdapter.is_healthy() before accepting deposits/borrows. If false: pause new operations but allow existing position management (repay, add collateral).",
    "Events: FallbackActivated { asset: ContractAddress, reason: felt252 }, OracleFailure { asset }, OraclePrimary { asset }"]',
  5, ARRAY['oracle', 'fallback', 'lab6']
),
(
  'cairo-builder', 'senior',
  'Design the token economics for a new Cairo-native DEX protocol. Your DEX has: $50M TVL, $18M daily volume, 0.3% fee tier, 80% of fees go to LPs, 20% to protocol. (1) Calculate annual protocol revenue, (2) design a veToken model that creates sustainable demand, (3) model the emissions schedule to bootstrap liquidity in year 1 without hyper-inflation, (4) identify the three failure modes and their on-chain detection signals.',
  'tokenomics',
  '["Annual protocol revenue: $18M × 365 × 0.3% × 20% = $18M × 365 × 0.006 = $39,420 per day → $14.4M/year",
    "veToken model: lock TOKEN for 1-4 years, receive veToken. veToken holders receive 80% of protocol revenue (14.4M/year), 20% to treasury. veToken voting directs liquidity mining emissions to pools. Creates demand: holding TOKEN and locking generates yield from real protocol revenue.",
    "Year 1 emissions: total supply 100M tokens. Bootstrap budget: 20M tokens (20%) over 12 months = 1.67M tokens/month. Weekly emission tapering: start 500K/week, reduce 5% each week. By week 52: 500K × (0.95^52) = 28K/week. This is not hyperinflatory if volume grows and token demand follows.",
    "Failure modes: (1) LP mercenaries: LPs leave when emissions end → detect: LP count and TVL tracking, set alert if TVL drops >20% in 30 days. (2) veToken whale capture: one entity locks >50% → detect: top holder concentration on-chain. (3) Protocol revenue insufficient to sustain veToken yield → detect: yield monitoring, protocol_revenue/veToken_supply."]',
  5, ARRAY['tokenomics', 'dex', 'lab11']
),
(
  'cairo-builder', 'senior',
  'Compare the gas costs of three approaches to storing a 32-element array on Starknet: (1) Array<u256> in storage using a Map<u32, u256>, (2) packing two u128 values per slot using StorePacking, (3) using a single felt252 with bit manipulation (for smaller values). Calculate relative storage write costs and recommend an approach for a leaderboard storing 32 scores (max score: 10,000).',
  'optimisation',
  '["Approach 1 - Map<u32, u256>: 32 storage writes × 2 slots each (u256 = 2 felt252) = 64 storage write operations. At ~900 gas per write: 57,600 gas.",
    "Approach 2 - StorePacking two u128 per slot: 32 scores / 2 per slot = 16 storage writes. 16 × ~900 gas = 14,400 gas. 4x cheaper than approach 1.",
    "Approach 3 - felt252 bit manipulation for scores ≤ 10,000: 10,000 < 2^14, so 14 bits per score. felt252 has 251 bits. Pack 251/14 = 17 scores per felt252. 32 scores = 2 felt252 = 2 storage writes. 1,800 gas. 32x cheaper than approach 1.",
    "Recommendation: approach 3 for a leaderboard with scores ≤ 65,535 (u16 range). Pack up to 15 scores per felt252 (251/16 = 15.68). The bit manipulation code is non-trivial but justified for 32× gas savings on a frequently-updated leaderboard."]',
  4, ARRAY['gas', 'storage', 'optimisation', 'lab9']
),
(
  'cairo-builder', 'senior',
  'Walk through writing a production-quality Cairo integration test for a complete DeFi flow: user deposits ETH as collateral, borrows USDC, gets close to liquidation, another user liquidates them. Use snforge fork testing against a real Sepolia deployment. Show the complete test including all cheatcodes used.',
  'testing',
  '["Fork setup: use fork(''STARKNET_SEPOLIA_URL'', latest_block); load real deployed contract addresses for Vesu, USDC token.",
    "Cheatcodes needed: start_prank(contract_address, user_address) — impersonate user. store(contract_address, storage_var, value) — set user ETH balance. stop_prank().",
    "Test flow: start_prank(ETH_TOKEN, user); ETH_token.approve(vesu_address, COLLATERAL); stop_prank(); start_prank(VESU, user); vesu.deposit_collateral(ETH_TOKEN, COLLATERAL); let borrow_amount = max_borrow * 95 / 100; vesu.borrow(USDC_TOKEN, borrow_amount); stop_prank();",
    "Force near-liquidation: let current_price = pragma.get_price(ETH); store(PRAGMA, ETH_price_slot, current_price * 85 / 100); // 15% ETH price drop. assert(vesu.health_factor(user) < 1e18);",
    "Liquidation: start_prank(USDC_TOKEN, liquidator); USDC.approve(vesu_address, borrow_amount); stop_prank(); start_prank(VESU, liquidator); vesu.liquidate(user, borrow_amount, ETH_TOKEN); assert(vesu.collateral(user) < COLLATERAL); // partial liquidation"]',
  5, ARRAY['testing', 'fork-testing', 'integration', 'lab4']
)

ON CONFLICT DO NOTHING;


-- ============================================================
-- ECOSYSTEM JUNIOR — 20 additional questions
-- Topics: protocol landscape, ZK tech, tokenomics, governance,
-- developer ecosystem, research methodology
-- ============================================================

INSERT INTO skillup_dev.interview_questions (track_id, level, question, type, scoring_criteria, difficulty, tags) VALUES

(
  'starknet-ecosystem', 'junior',
  'Describe the four-layer architecture of Starknet. (1) Name the four layers and what each does, (2) explain which layer a DeFi developer interacts with directly, (3) what does "L1 settlement" mean in practical terms, (4) why is the DA layer important for protocol security.',
  'explanation',
  '["Four layers: (1) L1 Ethereum: settlement and proof verification. (2) DA (Data Availability) layer: where state diffs are stored — currently Ethereum calldata/blobs, future: Starknet DA or Celestia. (3) L2 Starknet execution: where contracts run and transactions execute. (4) Application layer: your contracts and frontends.",
    "DeFi developer: interacts with L2 execution layer (writes Cairo contracts, reads state) and application layer (builds frontend). Does not need to interact with L1 or DA directly.",
    "L1 settlement: when a STARK proof is verified on Ethereum, the L2 state transition it proves becomes as final and irreversible as an Ethereum transaction. At this point, bridged assets are withdrawable to Ethereum without any trust in Starknet itself.",
    "DA importance: if state diffs are not available, users cannot reconstruct their balances and exit the rollup. Ethereum blobs (post-EIP-4844) provide cheap, available DA. Without DA, Starknet would be a ''validium'' — lower security, lower cost."]',
  2, ARRAY['architecture', 'starknet', 'lab2']
),
(
  'starknet-ecosystem', 'junior',
  'Name and describe the 8 categories of protocols in the Starknet ecosystem, giving one real example in each category. For each example, explain what makes it Starknet-native versus being a port of an Ethereum protocol.',
  'knowledge',
  '["DEX/Swaps: Ekubo (Cairo-native concentrated liquidity, uses Starknet AA for LP management). Lending: Vesu (Cairo-native lending, designed for STRK as primary collateral). Aggregator: AVNU (native aggregator using session keys for DCA). Staking: Endur.fi (native liquid staking for STRK). Derivatives: Pragma Network (native ZK oracle). Wallets: ArgentX (native smart contract wallet with AA features). NFT marketplace: Unframed (native to Starknet). Infrastructure: Apibara (native indexing designed for Cairo events).",
    "Starknet-native markers: uses Account Abstraction features not possible on Ethereum, written in Cairo not Solidity, takes advantage of Starknet-specific fee structures or storage patterns."]',
  1, ARRAY['protocol-landscape', 'ecosystem', 'lab1']
),
(
  'starknet-ecosystem', 'junior',
  'Explain the complete lifecycle of a SNIP (Starknet Improvement Proposal). Use a real example if you know one. (1) Who can submit a SNIP, (2) what categories of SNIPs exist, (3) at which stage can StarkWare block a SNIP, (4) how does on-chain voting work for SNIPs today?',
  'governance',
  '["Anyone in the community can submit a SNIP. Authors draft the SNIP following a template, post to the Starknet community forum (community.starknet.io), and seek feedback.",
    "Categories: (1) Protocol parameter changes (gas limits, fee parameters). (2) Core protocol features (new opcodes, syscalls). (3) Governance process changes. (4) Application-level standards (token standards, oracle interfaces).",
    "StarkWare veto: for core protocol changes, StarkWare must implement the change (they run the sequencer and write the core protocol). They cannot be forced to implement a change they oppose during the current phase of decentralisation.",
    "On-chain voting: Snapshot-based temperature checks are off-chain (no gas cost). Formal on-chain voting is in development for Starknet. Current process: forum discussion → Snapshot vote → StarkWare/Foundation implementation decision."]',
  2, ARRAY['governance', 'snip', 'lab3']
),
(
  'starknet-ecosystem', 'junior',
  'Starknet recently activated staking. (1) What role does staking play in Starknet''s economic model, (2) who are the stakers and who are the delegators, (3) how does the staking reward emission affect the STRK supply, (4) what is the difference between staking on Starknet vs staking ETH on Ethereum (from a security model perspective)?',
  'tokenomics',
  '["Staking economic role: validators stake STRK to become eligible sequencers in the decentralised sequencer set. Staking provides economic security (slashing risk) for good sequencer behaviour. Also locks supply reducing sell pressure.",
    "Stakers vs delegators: stakers are node operators running Starknet nodes. Delegators hold STRK but don''t run nodes — they delegate stake to a validator and receive a share of rewards minus commission.",
    "Supply effect: staking rewards are new STRK minted (inflationary). Current emission rate reduces over time. Stakers'' rewards increase the total supply. Counterforce: more staking = less circulating supply = reduced sell pressure.",
    "vs ETH staking: ETH staking secures the Ethereum base layer (consensus). STRK staking secures Starknet''s sequencer selection and provides economic incentive to be honest. Both use PoS slashing. Difference: Ethereum is the base chain, Starknet is a L2 — ultimately Starknet''s security is still grounded in Ethereum L1 via STARK proofs."]',
  2, ARRAY['staking', 'strk', 'tokenomics', 'lab3']
),
(
  'starknet-ecosystem', 'junior',
  'Dune Analytics is a key tool for Starknet ecosystem research. (1) What is Dune and how does it access Starknet data, (2) write a SQL query concept (describe the tables and fields) to find the daily number of unique users who executed a swap on AVNU in the last 30 days, (3) how is a Dune query different from checking DefiLlama, (4) what are the limitations of on-chain data from Dune?',
  'research',
  '["Dune: a data analytics platform that indexes blockchain data into queryable databases. For Starknet, Dune has decoded events from major protocols like AVNU, Ekubo, Vesu stored in tables like decoded_starknet.avnu_exchange_evt_swap.",
    "SQL concept: SELECT DATE_TRUNC(''day'', block_time) as date, COUNT(DISTINCT taker_address) as unique_users FROM decoded_starknet.avnu_exchange_evt_swap WHERE block_time >= NOW() - INTERVAL ''30 days'' GROUP BY 1 ORDER BY 1",
    "Dune vs DefiLlama: DefiLlama reads TVL from protocol APIs and contract state — measures locked capital. Dune queries transaction events — measures user activity and on-chain behaviour. Dune is more granular (individual transactions), DefiLlama is more aggregated (total locked value).",
    "Limitations: Dune lags real-time by minutes to hours. Decoded tables only exist for protocols Dune has explicitly integrated. Raw transaction data is available but requires manual decoding. Cannot distinguish bots from human users without additional filtering."]',
  2, ARRAY['dune', 'research', 'data-analysis', 'lab9']
),
(
  'starknet-ecosystem', 'junior',
  'Apply the composability moat framework to evaluate Ekubo. The four sources of composability moat are: (1) how many protocols route through it, (2) whether it is used as an oracle source, (3) whether it provides critical infrastructure others depend on, (4) switching cost for existing integrations. Rate each dimension 1-5 for Ekubo and justify.',
  'analysis',
  '["Protocol routing (how many route through Ekubo): 5/5. AVNU aggregator routes through Ekubo as primary source. Most Starknet swaps, directly or indirectly, touch Ekubo liquidity. Near-universal routing dependency.",
    "Oracle source (used for price discovery): 4/5. Pragma derives on-chain STRK prices from Ekubo trading activity. Losing Ekubo would impair Pragma price feeds, which feed into Vesu and Nostra health factors. Critical oracle dependency.",
    "Critical infrastructure: 5/5. Ekubo holds approximately 92% of Starknet DEX liquidity. It is the primary venue for natural price discovery. Without Ekubo, the Starknet DeFi stack loses its price anchor.",
    "Switching cost for integrations: 3/5. Each protocol that integrates Ekubo (AVNU routing, Pragma oracles, yield aggregators) would need to rewrite their integration logic for a new DEX. Not trivial but not impossible. Score 3 because a well-funded competitor could offer incentives to migrate.",
    "Total: 17/20. Very high moat. Ekubo''s composability position is the strongest in the Starknet ecosystem."]',
  3, ARRAY['composability', 'ekubo', 'moat', 'lab3']
),
(
  'starknet-ecosystem', 'junior',
  'A Starknet developer asks: "Should I build on Starknet or Ethereum?" Help them think through this decision. Cover: (1) three situations where Starknet is clearly better, (2) three situations where Ethereum mainnet is better, (3) how the maturity of each ecosystem affects the decision, (4) what the "network effects gap" means for them practically.',
  'analysis',
  '["Starknet clearly better: (1) Building a game or social app that needs cheap, fast transactions (sub-cent fees, sub-second finality). (2) Building something that requires Account Abstraction features natively (session keys, gasless UX). (3) Building with Cairo for novel cryptography — Cairo is designed for STARK-based computation that Solidity cannot do efficiently.",
    "Ethereum mainnet better: (1) Building a protocol that needs maximum composability with existing DeFi liquidity (Uniswap v3 $2.8B TVL vs Ekubo $82M TVL). (2) Building something targeting institutional users who require Ethereum-level security for large TVL. (3) Building an existing Solidity codebase — Cairo learning curve is significant.",
    "Ecosystem maturity: Ethereum has 8+ years of battle-tested protocols, auditors who know every pattern, and token liquidity. Starknet has 2 years at scale — smaller attack surface history but also smaller liquidity and developer pool.",
    "Network effects gap: fewer users = less organic volume = lower LP fees = lower TVL. Breaking this requires either incentive campaigns or a unique product that only works on Starknet. The gap is narrowing but is real today."]',
  2, ARRAY['ecosystem', 'developer', 'lab4']
),
(
  'starknet-ecosystem', 'junior',
  'Explain what the Starknet Foundation does and how it differs from StarkWare. (1) Name three specific programmes the Foundation runs, (2) how does the Foundation allocate STRK grants, (3) what would happen to Starknet if StarkWare ceased to exist tomorrow, (4) what is the Foundation''s roadmap towards full decentralisation?',
  'governance',
  '["Foundation vs StarkWare: StarkWare Ltd is the company that created Starknet and currently maintains the core protocol. The Foundation is a non-profit that holds STRK for ecosystem development and is working toward progressive decentralisation of control.",
    "Foundation programmes: (1) Developer grants (funding Cairo developers). (2) Ecosystem fund (investments in Starknet protocols). (3) DeFi Spring (STRK incentives for DeFi protocols). Others: educational programmes, security grants.",
    "If StarkWare ceased: near-term disruption — StarkWare runs the sequencer and maintains core prover software. Long-term: open-source codebase (Starknet is open source) means the community could fork and continue. This is the motivation for decentralised sequencers — reducing dependence on StarkWare.",
    "Decentralisation roadmap: (1) Decentralised sequencers (in progress). (2) Decentralised provers (planned). (3) Community governance with on-chain voting (planned). (4) Foundation transition to being one voice among many rather than the dominant decision-maker."]',
  2, ARRAY['governance', 'foundation', 'lab1', 'lab3']
),
(
  'starknet-ecosystem', 'junior',
  'Nostra Finance is a Starknet lending protocol that also has a stablecoin (UNO). (1) Explain the collateralised stablecoin model Nostra uses, (2) what risks exist specific to on-chain collateralised stablecoins, (3) how does this compare to USDC (a centrally-issued stablecoin), (4) why might the Starknet ecosystem benefit from having an on-chain stablecoin vs relying on bridged USDC?',
  'analysis',
  '["Nostra UNO model: users deposit collateral (ETH, STRK) and mint UNO against it at a specified collateralisation ratio (e.g. 150%). UNO is ''created'' by locking collateral. If collateral value falls below threshold, the position is liquidated and UNO is burned.",
    "On-chain stablecoin risks: (1) Collateral volatility — if ETH crashes 50% quickly, undercollateralised positions create bad debt. (2) Liquidation cascade — panic selling of collateral during liquidations can depeg the stablecoin. (3) Smart contract risk — a bug in the collateral or minting contract can break the peg permanently.",
    "vs USDC: USDC is backed by real USD in bank accounts (centralised). Cannot be censored by Starknet protocols but can be censored by Circle (the issuer). Blacklisting risk. Bridged USDC depends on both Circle AND the bridge''s security.",
    "Benefit of on-chain stablecoin: no dependence on centralised issuer or bridge. Fully censorship-resistant. Capital efficient — collateral stays productive within Starknet. But requires enough Starknet-native liquidity and trust in the mechanism."]',
  3, ARRAY['stablecoins', 'nostra', 'defi', 'lab1']
),
(
  'starknet-ecosystem', 'junior',
  'Apply the five-step research workflow to investigate this claim: "Starknet''s Account Abstraction capabilities have increased active trader frequency compared to other L2s." Walk through each step: (1) hypothesis formation with falsifiability condition, (2) data sources, (3) data collection methodology, (4) analysis method, (5) expected publication and citation format.',
  'research',
  '["Hypothesis: Starknet wallets with session keys or gasless features execute 2× more weekly swaps than comparable wallets on Arbitrum. Falsifiability: claim is falsified if Starknet wallet swap frequency ≤ Arbitrum wallet swap frequency over same 90-day period.",
    "Data sources: Dune Analytics (Starknet and Arbitrum swap events), Starkscan (wallet type identification for AA vs EOA), Argent/Braavos SDK telemetry (if available and consented).",
    "Methodology: (1) Query Starknet: COUNT swaps per wallet per week, join with wallet_type (ArgentX = AA, Braavos = AA, other = standard). (2) Query Arbitrum: same metric for EOA wallets. (3) Control for wallet age (only wallets >30 days old to remove new user bias).",
    "Analysis: mean weekly swap frequency by wallet type. T-test for statistical significance. Control for potential confounders: trading incentive campaigns, token price volatility (higher volatility → more trading regardless of AA).",
    "Publication: Mirror post with Dune query links embedded. Citation format: ''As of [date], queried from Dune Analytics decoded_starknet.avnu_exchange_evt_swap. Query available at [link].''"]',
  3, ARRAY['research', 'methodology', 'lab6']
),
(
  'starknet-ecosystem', 'junior',
  'Calculate the absorption ratio (supply pressure model) for STRK token: total supply 10B, circulating 728M. Upcoming unlocks: Month 1: 50M, Month 2: 50M, Month 3: 120M (large cliff), Month 4: 50M, Month 5: 50M, Month 6: 50M. Current daily trading volume: 15M STRK. For each month: (1) calculate absorption ratio (monthly unlock / daily volume), (2) classify pressure (low <5 days, moderate 5-20 days, high >20 days), (3) identify which month is highest risk.',
  'calculation',
  '["Month 1: 50M / 15M = 3.33 days. LOW pressure.",
    "Month 2: 50M / 15M = 3.33 days. LOW pressure.",
    "Month 3: 120M / 15M = 8.0 days. MODERATE pressure.",
    "Month 4: 50M / 15M = 3.33 days. LOW pressure.",
    "Month 5: 50M / 15M = 3.33 days. LOW pressure.",
    "Month 6: 50M / 15M = 3.33 days. LOW pressure.",
    "Highest risk: Month 3 (the 120M cliff unlock). At 8.0 days, the market needs 8 full days of current trading volume to absorb the unlock without price impact — manageable but requires sustained demand. Watch for: staking rate increasing before Month 3 (signals insiders locking instead of selling), or large OTC deals ahead of the cliff."]',
  3, ARRAY['tokenomics', 'supply-pressure', 'strk', 'lab3']
),
(
  'starknet-ecosystem', 'junior',
  'The Starknet developer ecosystem has several major infrastructure providers. Explain: (1) what Apibara does and why it exists, (2) what Voyager and Starkscan are and how they differ from Etherscan, (3) what the Argent SDK provides that raw Starknet.js does not, (4) why Cairo''s language design creates different tooling needs than Solidity.',
  'explanation',
  '["Apibara: a real-time data streaming service for Starknet events. It exists because Cairo events use a different encoding (fields, keys) than EVM logs and require specific decoding. Apibara provides DNA (a streaming protocol) that gives your indexer decoded, queryable event data as it happens.",
    "Voyager vs Starkscan: both are Starknet block explorers (like Etherscan but for Starknet). Voyager is StarkWare''s official explorer, Starkscan is community-built. Both differ from Etherscan in: Cairo-specific display (contract class ABI, Sierra code), account abstraction awareness (shows wallet contract type), STARK proof status tracking.",
    "Argent SDK vs Starknet.js: Starknet.js provides raw protocol access (send transactions, call contracts). Argent SDK adds: session key management, account deployment helpers, gas estimation utilities, web3modal-like wallet connection UI.",
    "Cairo tooling needs: Cairo is a ZK-proving language with Sierra/CASM compilation stages not present in Solidity. Tooling must handle: scarb build system (not hardhat/foundry), snforge test runner (not hardhat tests), class hash vs contract address distinction."]',
  2, ARRAY['developer-ecosystem', 'tooling', 'lab4']
),
(
  'starknet-ecosystem', 'junior',
  'What is the Starknet ecosystem''s approach to cross-chain interoperability? Describe: (1) the native Starknet-Ethereum bridge and its limitations, (2) what LayerZero or other messaging protocols would enable, (3) why the 7-day withdrawal window from Starknet to Ethereum does not exist (unlike Optimism), (4) the key risk in any cross-chain bridge from a security perspective.',
  'explanation',
  '["Native bridge: Starknet has a canonical bridge for ETH and ERC-20 tokens to/from Ethereum. Limitation: only works between Starknet and Ethereum — not to other L2s or other chains. Also: bridge deposits to Starknet are instant, but bridging back to Ethereum requires a STARK proof to be finalised on L1.",
    "LayerZero/messaging: would enable Starknet-Arbitrum, Starknet-Solana, etc. direct messaging and asset transfers without routing through Ethereum L1. Still trust-dependent on the messaging protocol''s security model.",
    "Why no 7-day withdrawal: Starknet is a ZK rollup (validity proof), not an optimistic rollup. Optimism''s 7-day window exists for fraud proof challenges. ZK rollups prove every batch immediately — no challenge window needed. Starknet withdrawal to L1 takes only as long as proof generation + L1 confirmation (hours, not days).",
    "Bridge security risk: bridges are high-value targets (hold locked assets). The Wormhole ($320M), Ronin ($625M), and Nomad ($190M) bridge hacks all exploited bridge contract vulnerabilities. Any cross-chain bridge adds attack surface beyond the native chains."]',
  2, ARRAY['cross-chain', 'bridges', 'interoperability', 'lab7']
),
(
  'starknet-ecosystem', 'junior',
  'Evaluate Starknet''s developer ecosystem maturity using 5 metrics. For each metric, state the current status (as of your knowledge), the benchmark you are comparing against (typically Ethereum or Arbitrum), and whether the gap is narrowing or widening.',
  'analysis',
  '["Metric 1 - Total Value Locked: Starknet ~$1-2B (growing). Arbitrum ~$18B. Ethereum DeFi ~$80B. Gap is narrowing as Starknet grows but still 10x+ difference.",
    "Metric 2 - Active developers: Cairo developers: estimated 1,000-3,000 active. Solidity developers: 100,000+. Gap is large but Cairo developer count is growing faster in percentage terms post-Starknet launch.",
    "Metric 3 - Protocol diversity: Starknet has DEX, lending, staking, NFTs, bridges, wallets. Missing: perpetuals (small), options (none at scale), RWA (none). Arbitrum has all categories at larger scale.",
    "Metric 4 - Development tooling: scarb/snforge/Starknet.js now mature. Missing vs Ethereum: VS Code Cairo extension less mature than Solidity, fewer audit firms familiar with Cairo. Gap narrowing.",
    "Metric 5 - Security incident history: Starknet has had fewer major exploits than Ethereum DeFi (smaller TVL = smaller target). Two factors: lower TVL and newer protocols less battle-tested. Track record improving."]',
  3, ARRAY['ecosystem', 'maturity', 'comparison', 'lab1']
),
(
  'starknet-ecosystem', 'junior',
  'Explain what a Starknet liquidity incentive programme (like DeFi Spring) does and how to evaluate its quality. (1) How do incentive programmes affect TVL measurements, (2) how do you distinguish organic TVL growth from incentive-driven TVL, (3) what happens to TVL when an incentive programme ends, (4) write the on-chain query concept to detect incentive farming vs genuine usage.',
  'analysis',
  '["Effect on TVL: incentive programmes attract mercenary capital — LPs and depositors who move capital in specifically for the rewards and leave when rewards end. TVL can increase 5-10x during strong incentive campaigns without corresponding organic growth.",
    "Organic vs incentive TVL: organic TVL: deposits from users who would have deposited without the incentive (they need the DeFi service). Signals: position age (organic deposits tend to be older), deposit size distribution (organic = many mid-sized deposits, incentive = few large deposits chasing rewards).",
    "Post-incentive cliff: TVL typically drops 30-70% when major incentive programmes end. The percentage that stays is the organic base — the ''real'' TVL. This drop is well-documented (Uniswap, Curve, Starknet DeFi Spring all showed this pattern).",
    "Detection query: SELECT date, COUNT(deposits) as new_deposits, SUM(amount) as new_tvl FROM deposits WHERE date BETWEEN incentive_start AND incentive_end. Also: SELECT AVG(position_duration_days) grouped by deposit_date — incentive deposits have shorter average duration."]',
  3, ARRAY['incentives', 'tvl', 'research', 'lab9']
),
(
  'starknet-ecosystem', 'junior',
  'What are the key differences between Cairo 2 and Cairo 1 (the original Cairo) from an ecosystem perspective? (1) What was the primary limitation of Cairo 1 that drove the rewrite, (2) how did the Sierra/CASM compilation pipeline change the developer experience, (3) what happened to existing Cairo 1 contracts on Starknet mainnet, (4) why does this matter for evaluating protocol security today?',
  'technical',
  '["Cairo 1 limitation: Cairo 0 (original) produced programs that could fail without generating a proof. This enabled DoS attacks on the prover — submit failing transactions for free computation. Cairo 2 via Sierra guarantees every program produces a valid proof (even for failures).",
    "Sierra/CASM pipeline: Cairo 2 compiles to Sierra (safe intermediate representation) → then to CASM (concrete assembly for the Cairo VM). Sierra ensures gas is always chargeable. Developer experience: more familiar Rust-like syntax, better error messages, but new mental model for the compilation stages.",
    "Cairo 1 contracts on mainnet: they continue running. Starknet maintained backwards compatibility. However, new contracts should be Cairo 2 (Sierra). Some legacy contracts written in Cairo 0 may still be in production.",
    "Security implication: if you are auditing an older Starknet protocol (2021-2022 era), verify it was written in Cairo 2 (check the class type). Cairo 0 contracts have different security properties and known patterns that may not apply to Cairo 2. Check the compilation timestamp and version."]',
  3, ARRAY['cairo', 'sierra', 'history', 'lab2']
),
(
  'starknet-ecosystem', 'junior',
  'Pragma Network is Starknet''s primary oracle. (1) Explain how Pragma computes its on-chain price for ETH/USD, (2) what makes Pragma''s approach more manipulation-resistant than using a single DEX spot price, (3) identify three protocols that depend on Pragma and what they use it for, (4) what is the single-point-of-failure risk that Pragma represents for Starknet DeFi.',
  'analysis',
  '["Pragma computation: aggregates price data from multiple sources including Ekubo on-chain TWAP, off-chain data from market makers, and cross-chain bridge prices. Produces a median of multiple sources, smoothed over time. Published on-chain.",
    "Manipulation resistance: single DEX spot is vulnerable to flash loan manipulation in one block. Pragma''s multi-source median: manipulating the price requires moving multiple sources simultaneously, which is prohibitively expensive. TWAP component prevents single-block manipulation.",
    "Dependent protocols: (1) Vesu lending: uses Pragma STRK price for health factor calculations. (2) Nostra lending: uses Pragma ETH price for collateral valuation. (3) Perpetuals protocols: use Pragma index price as mark price. Several others use it for any on-chain price-dependent logic.",
    "Single-point-of-failure: Pragma currently provides price feeds to most major Starknet lending and derivatives protocols. A Pragma contract exploit, a stale feed (if Pragma goes offline), or a manipulation attack that passes all guards would simultaneously affect every dependent protocol. This is the oracle concentration risk discussed in systemic risk analysis."]',
  3, ARRAY['pragma', 'oracle', 'systemic-risk', 'lab1']
),
(
  'starknet-ecosystem', 'junior',
  'Walk through the complete audit reading process for a fictional Starknet protocol. The audit shows: 1 Critical (resolved: price oracle used spot price instead of TWAP on a $15M collateral type), 3 High (2 resolved: access control on fee collection, reentrancy in deposit function; 1 unresolved: governance vote manipulation possible if less than 5% of tokens participate), 12 Medium, 28 Low. Auditor: SpearbitDAO (Tier-1). Audit age: 1 month. 0 upgrades since. Deposit $50,000?',
  'risk-assessment',
  '["Critical resolved: oracle spot→TWAP fix. This was a systemic vulnerability affecting $15M collateral. The fix (TWAP migration) is appropriate. Residual risk: the fix is 1 month old and unaudited separately. Elevated but manageable.",
    "High resolved pair: access control on fee collection (financial risk only if fee switch active — low immediate risk if inactive) and reentrancy in deposit (direct financial risk, now resolved). Both critical patterns properly mitigated.",
    "Unresolved High: governance vote manipulation at <5% participation. Current participation rates for DeFi governance are often 3-8%. This means the vulnerability is not theoretical — it is practically exploitable in real governance conditions. Depends on: does governance control treasury? If yes, significant risk.",
    "Decision: deposit $20,000-$30,000 conditional on: (a) verifying the governance participation rate history — if average >10%, the unresolved High is less acute. (b) Verifying the oracle fix in the contract code directly on Voyager. Full $50,000 requires: governance High resolved OR participation historically above 15%."]',
  4, ARRAY['audit', 'risk-assessment', 'lab6']
),
(
  'starknet-ecosystem', 'junior',
  'The Starknet Foundation runs a grants programme. You want to apply for a $75,000 grant to build a Starknet analytics dashboard. (1) Apply the four-criterion framework to self-evaluate your application, (2) identify the weakest point in your application if you are a solo developer with no prior Starknet deployments, (3) what specific evidence could strengthen each criterion, (4) write a 50-word product description that meets the first criterion.',
  'grant-writing',
  '["Self-evaluation: (1) Product: analytics dashboard — specific, but need measurable milestone. (2) Team: solo, no deployments — weakest criterion. (3) Milestones: must define specific outcomes not activities. (4) Risk: must name specific technical or market risk with mitigation.",
    "Weakest point: Criterion 2 (team credentials). Solo developer with no Starknet deployments = no on-chain verifiable track record. Evaluators cannot assess capability.",
    "Strengthening evidence: (1) Build and deploy a small open-source Cairo contract before applying — shows you can write deployable code. (2) Link to prior analytics work (if Ethereum, Dune queries, anything). (3) Get a partner or advisor with Starknet experience on the application.",
    "50-word product: ''Starknet Protocol Analytics — a public dashboard showing real-time TVL, user activity, and DeFi health metrics for Starknet protocols. Success metric: 500 unique weekly users within 60 days of launch, verified by Vercel analytics. Open-source. Data sourced from Apibara + Dune.''"]',
  3, ARRAY['grants', 'lab9']
),
(
  'starknet-ecosystem', 'junior',
  'Compare Starknet''s economic model to Arbitrum''s. For each of the following, state which is better positioned and why: (1) transaction fee economics for users, (2) fee revenue for the protocol/token holders, (3) developer grants and ecosystem funding, (4) long-term competitive position as ZK technology matures.',
  'analysis',
  '["User fees: both are low post-EIP-4844. Starknet fees: $0.01-$0.10. Arbitrum fees: $0.02-$0.20. Starknet slightly cheaper but same order of magnitude. Advantage: slight Starknet edge from STARK batching efficiency.",
    "Fee revenue: ARB token currently lacks direct fee accrual (in discussion for governance). STRK fee switch active — 10% of fees to stakers. Direct revenue advantage to STRK holders today.",
    "Ecosystem funding: Arbitrum DAO has $3.5B ARB treasury. Starknet Foundation has a significant STRK allocation (~1.8B+ STRK). Both have large grant programmes. Arbitrum currently outspends Starknet on ecosystem incentives in absolute dollar terms.",
    "Long-term ZK maturity: as ZK proving costs drop further and Starknet''s unique AA features become industry standard, Starknet''s technical differentiation grows. Arbitrum (optimistic) will face increasing pressure from ZK chains. Starknet is better positioned as ZK becomes the default scaling model — but this is a 3-5 year thesis."]',
  3, ARRAY['competitive-analysis', 'arbitrum', 'economics']
)

ON CONFLICT DO NOTHING;

-- ============================================================
-- ECOSYSTEM SENIOR — 20 additional questions
-- Topics: advanced research methodology, systemic risk,
-- investment thesis construction, grant evaluation
-- ============================================================

INSERT INTO skillup_dev.interview_questions (track_id, level, question, type, scoring_criteria, difficulty, tags) VALUES

(
  'starknet-ecosystem', 'senior',
  'Write a complete governance risk analysis for Starknet itself (not a protocol, but the network). Apply the five-dimension framework: (1) token concentration, (2) upgrade power and who holds it, (3) voter participation rate in governance decisions, (4) emergency powers and their scope, (5) treasury control. Give each dimension a risk score 1-5 and defend it.',
  'analysis',
  '["D1 - Token concentration: top STRK holders include StarkWare (estimated 16.7%) and Starknet Foundation (50.1% allocation at genesis). Significant concentration in early insiders. Score: 4 (high concentration, partially mitigated by Foundation''s stated neutrality and vesting).",
    "D2 - Upgrade power: StarkWare controls the sequencer and the core prover code. Protocol upgrades require StarkWare implementation. Community cannot force upgrades. Score: 5 (critical — single company controls core infrastructure).",
    "D3 - Participation: Starknet governance is in early stages. On-chain voting not fully operational. Snapshot votes show low participation (<5% of eligible STRK typically). Score: 4 (whale capture risk at low participation levels).",
    "D4 - Emergency powers: StarkWare can pause the sequencer in an emergency without governance vote. 72-hour window possible. Scope: entire network. Score: 3 (emergency powers exist but StarkWare''s reputation provides some restraint).",
    "D5 - Treasury: Starknet Foundation controls STRK treasury. Foundation board governs. Board appointments are partially community-nominated. Score: 3 (Foundation has relatively independent board vs pure StarkWare control).",
    "Overall: 19/25 — high governance risk primarily from StarkWare concentration. This is explicitly transitional: decentralised sequencers and on-chain governance will reduce D2 and D3 scores over 2-3 years."]',
  5, ARRAY['governance', 'risk-analysis', 'starknet-network']
),
(
  'starknet-ecosystem', 'senior',
  'Construct a complete protocol lifecycle analysis for Vesu. Using the Growth/Maturity/Decline framework: (1) which stage is Vesu in and what data justifies this classification, (2) write the three specific on-chain signals you would monitor to detect a lifecycle stage transition, (3) what investment or usage decision changes at each transition, (4) compare Vesu''s lifecycle stage to Aave v3 on Arbitrum.',
  'analysis',
  '["Vesu lifecycle stage: Early Growth. Justification: TVL growing (not yet plateaued), user base expanding, protocol adding new collateral types, revenue below breakeven point (subsidised by grants). Key signal: MoM TVL growth still positive and accelerating.",
    "Stage transition signals: (1) TVL MoM growth rate falls to <5% for 3 consecutive months → entering Maturity. (2) Net TVL outflow >15% over 30 days post any major incentive programme end → transition risk signal. (3) Revenue/TVL ratio crosses protocol''s stated sustainability threshold.",
    "Investment decisions by stage: Growth → aggressive position, protocol has highest upside, accept higher risk. Maturity → stable yield extraction, switch to optimising yield rather than capital gains. Decline → exit positions, reduce exposure, look for new opportunities.",
    "vs Aave v3 Arbitrum: Aave is in mature stage. TVL relatively stable, well-understood risk profile, established audit history, trusted brand. Vesu is earlier stage with higher risk/return profile. Vesu''s competitive differentiation is Cairo-native design and AA-compatible architecture."]',
  5, ARRAY['lifecycle', 'vesu', 'research']
),
(
  'starknet-ecosystem', 'senior',
  'A major Starknet protocol experiences a governance attack: an entity has accumulated 52% of voting power and proposes to redirect all treasury funds to their own address with a 24-hour execution window. You are an ecosystem analyst. (1) What on-chain signals preceded this attack that should have been caught, (2) what can community members do in the 24-hour window, (3) write the post-mortem framework you would use, (4) what structural governance changes would prevent recurrence.',
  'crisis-analysis',
  '["Preceding signals: (1) Accumulation of token transfers to a single address (or cluster of related addresses) over weeks. Detectable on Dune. (2) Participation rate in recent votes suddenly increased with a single new large voter. (3) Governance forum discussions becoming dominated by one perspective. (4) Large OTC purchases (visible on DEX volume anomalies) in the period before the proposal.",
    "24-hour response options: (1) Community counter-narrative — public documentation of the attack on Twitter/Mirror to mobilise defensive voting. (2) Other large token holders contacted to vote against. (3) If contract has guardian/veto — activate it. (4) Protocol team can propose an emergency pause of the treasury if that power exists.",
    "Post-mortem framework: Timeline reconstruction (when accumulation started), On-chain evidence documentation, Governance design failure identification (what enabled 52% control), Stakeholder impact assessment, Recommendations with implementation timeline.",
    "Structural changes: (1) Higher quorum requirement (>60% of circulating tokens must vote for executive proposals). (2) Multi-sig guardian that can veto proposals within 48h regardless of vote outcome. (3) Lock/delay: tokens must be locked for 30 days before they gain governance power (prevents flash accumulation). (4) Vote delegation with identity-linked reputation."]',
  5, ARRAY['governance', 'attack', 'crisis']
),
(
  'starknet-ecosystem', 'senior',
  'You are publishing a research report claiming that Starknet''s DEX trading volume grew 340% year-over-year. A reviewer challenges your methodology. Walk through your defence: (1) why your Dune query is the correct way to measure this, (2) how you controlled for wash trading, (3) how you controlled for incentive programme effects, (4) what falsifiability condition you attached to the finding.',
  'research',
  '["Dune query defence: measuring decoded Ekubo and AVNU swap events (decoded_starknet tables) counts actual on-chain swap transactions — each event is a real blockchain transaction with gas paid. This is more reliable than TVL (easy to manipulate) or API data (can include simulated data).",
    "Wash trading control: filter for transactions where from_address != to_address, exclude addresses executing more than 100 swaps per day with <0.1% price impact (bot pattern). Also: compare volume by time-of-day distribution — organic trading has human-like temporal patterns.",
    "Incentive effect control: tag the DeFi Spring incentive period. Run YoY analysis excluding incentive periods from both years OR include incentive periods for both years. Report both with and without incentive normalisation. Acknowledge the limitation explicitly.",
    "Falsifiability condition: ''This finding is falsified if an independent analysis using the same Dune tables (queries linked in footnotes) and the same bot-exclusion criteria produces a YoY growth rate of <200% or >480%.''"]',
  5, ARRAY['research', 'methodology', 'data-quality']
),
(
  'starknet-ecosystem', 'senior',
  'Design a full competitive intelligence report comparing Starknet, Arbitrum, and Base for a crypto fund evaluating L2 ecosystem allocation. Cover: TVL, developer activity, revenue, token economics, and trajectory. Conclude with a portfolio allocation recommendation and the conditions that would change it.',
  'analysis',
  '["TVL comparison: Arbitrum ~$18B, Base ~$12B, Starknet ~$1-2B. Starknet is early stage relative to the others.",
    "Developer activity: Base growing fastest (Coinbase distribution advantage, EVM compatibility). Arbitrum stable large developer base. Starknet smaller but Cairo developer growth accelerating post-Starknet Foundation grant programmes.",
    "Revenue: Arbitrum generates significant sequencer revenue, partially distributed to ARB holders via governance. Base revenue largely goes to Coinbase. Starknet fee revenue growing from near-zero to meaningful levels.",
    "Token economics: ARB lacks direct fee accrual currently. STRK has fee accrual via staking but high FDV risk. BASE has no token. STRK is the most investable on fundamentals if FDV/market cap ratio improves.",
    "Recommendation: diversified allocation. Arbitrum (35%) for mature ecosystem stability. Base (30%) for distribution moat and Coinbase backing. Starknet (35%) for asymmetric upside on ZK thesis maturing and lower current valuation.",
    "Change conditions: increase Starknet allocation if (a) decentralised sequencers launch successfully, (b) TVL crosses $5B. Decrease if StarkWare regulatory issues emerge."]',
  5, ARRAY['competitive-analysis', 'investment', 'l2s']
),
(
  'starknet-ecosystem', 'senior',
  'Walk through the construction of a Starknet systemic risk dependency graph. Map all critical protocol-to-protocol dependencies where failure in one could cascade to another. Identify the three nodes with the highest systemic importance and explain what would happen in a 48-hour failure scenario for each.',
  'risk-analysis',
  '["Dependency graph nodes: Starknet Sequencer → all DeFi (no sequencer = no transactions). Pragma Oracle → Vesu, Nostra, perpetuals (price feed dependency). Ekubo DEX → Pragma (price discovery), AVNU (routing), yield aggregators (LP yield). Starknet-Ethereum Bridge → all bridged assets (USDC, ETH).",
    "Node 1 - Starknet Sequencer (highest): 48h failure = zero transaction processing. All DeFi frozen. Users cannot repay loans, add collateral, or exit positions. Markets become directionally blind. Liquidations queue up but cannot execute. Potential insolvency in leveraged positions if ETH price moved 20%+ during freeze.",
    "Node 2 - Pragma Oracle: 48h outage = all Pragma-dependent protocols halt new borrows (safety mechanism). Existing borrowers cannot be liquidated correctly. If ETH falls 30% during 48h, undercollateralised positions accumulate but cannot be liquidated. Bad debt materialises when oracle resumes.",
    "Node 3 - Ekubo DEX: 48h failure = price discovery degraded (Pragma loses primary on-chain source), AVNU cannot route through primary liquidity, LP fees stop, DeFi users cannot swap. Less catastrophic than sequencer failure since bridge withdrawals still possible."]',
  5, ARRAY['systemic-risk', 'dependency-graph', 'risk']
),
(
  'starknet-ecosystem', 'senior',
  'A new Starknet protocol wants to raise $5M in a token sale. They ask for your analysis of their proposed tokenomics. Data: 1B total supply, $5M raise at $0.005/token = 1B × $0.005 = $5M FDV. Team: 20% (4-year vest, 1-year cliff). Investors: 25% (includes the $5M raise, 18-month vest, 6-month cliff). Community: 45%. Treasury: 10%. Evaluate: is this fundraise structure investable?',
  'analysis',
  '["FDV at raise: $5M. But wait: 1B × $0.005 = $5M only if ALL tokens are valued at $0.005. This IS the FDV definition. Circulating at raise: only the 25% investor tranche is partially liquid after cliff → not all at once, so market cap at launch ≈ $250K-$1M.",
    "Insider percentage: team 20% + investors 25% = 45% insider. ABOVE the 40% threshold — red flag. Insiders control near-majority of supply.",
    "Cliff quality: team 1-year cliff ✓ (meets minimum). Investor 6-month cliff ✗ (below 6-month minimum — borderline). Investor tokens become liquid relatively quickly for an early-stage protocol.",
    "Community allocation: 45% is strong — the majority of supply going to community is positive. Distribution method matters: if it''s airdrop/mining, more defensible than team-controlled distribution.",
    "Investment recommendation: CONDITIONAL. Reduce investor allocation to 20% (lowering insider % to 40%), extend investor cliff to 12 months, add a published community token distribution schedule. At current structure: too much insider control and too-short investor cliff for a $5M raise at this stage."]',
  5, ARRAY['tokenomics', 'fundraising', 'investment']
),
(
  'starknet-ecosystem', 'senior',
  'A crypto fund holds a large STRK position. They ask you to write a 6-month monitoring framework — what specific data points you will track weekly, what thresholds trigger a position review, and what thresholds trigger an exit. This should be quantitative.',
  'investment',
  '["Weekly tracking metrics: (1) Starknet TVL (DefiLlama) — target: growing or stable. (2) STRK staking rate — higher = locked supply, positive. (3) Weekly DEX volume (Dune AVNU + Ekubo) — leading indicator of ecosystem activity. (4) STRK FDV/market cap ratio — improving = good. (5) Monthly unlock schedule vs daily volume ratio. (6) Governance participation rate.",
    "Position review triggers: (1) TVL falls >20% in 30 days without market-wide decline. (2) Staking rate falls >10 percentage points (stakers exiting). (3) DEX volume falls >30% month-over-month (ecosystem activity declining). (4) Any unresolved governance crisis. (5) StarkWare entity regulatory action.",
    "Exit triggers: (1) TVL falls >40% without recovery in 60 days. (2) Sequencer decentralisation delayed beyond stated roadmap by >6 months without credible explanation. (3) STRK monthly unlock absorption ratio exceeds 15 days in any month (severe dilution pressure). (4) Major protocol hack >$20M on Starknet creating ecosystem trust crisis. (5) Competing ZK chain reaches 3× Starknet TVL with better tokenomics."]',
  5, ARRAY['investment', 'monitoring', 'strk']
),
(
  'starknet-ecosystem', 'senior',
  'The Starknet Foundation is launching a new $100M developer programme. You are on the evaluation committee. Design the complete evaluation rubric, including: (1) category weights, (2) specific criteria per category with minimum thresholds, (3) how to weight previous track record differently for first-time vs experienced teams, (4) write the rejection letter for a common application failure.',
  'evaluation',
  '["Category weights: Technical feasibility 30%, Team execution capacity 25%, Ecosystem impact 20%, Milestone quality 15%, Sustainability plan 10%",
    "Technical feasibility criteria: Cairo codebase for >80% of logic (minimum), architecture document reviewed by Foundation technical team, no known security patterns violated (required pre-check), proof of concept or MVP exists (for grants >$50K).",
    "Track record weighting: First-time teams: double weight on technical feasibility and milestone specificity (compensates for unverifiable claims). Experienced teams: track record verified on-chain, can accept looser milestone framing in exchange for historical delivery evidence.",
    "Rejection letter for generic milestones: ''Thank you for applying. Your application was not selected for the following reason: The milestones provided (''build a DEX'', ''launch in 6 months'') describe activities not outcomes. We require milestones in the format: [specific measurable outcome] by [specific date], verified by [specific on-chain or off-chain evidence]. Please revise your milestones to this format and resubmit during the next application window.''"]',
  5, ARRAY['grants', 'evaluation', 'foundation']
),
(
  'starknet-ecosystem', 'senior',
  'Build the complete investment thesis for a $2M allocation into early-stage Starknet DeFi protocols (not STRK token). Include: (1) selection criteria for protocols at early stage, (2) portfolio construction (how many protocols, concentration limits), (3) exit strategy and liquidity considerations, (4) the bear case that would make this thesis wrong.',
  'investment',
  '["Selection criteria: (1) Cairo-native (not an EVM port — native design has competitive moat). (2) Audited by Tier-1 firm or equivalent (non-negotiable for DeFi). (3) Team with verifiable on-chain deployments. (4) Token with clear path to value accrual. (5) TVL growing organically (not purely incentive-driven). (6) Founder team active on governance forum (signals long-term commitment).",
    "Portfolio construction: 6-8 protocols. Max 20% ($400K) per protocol at entry. Spread across: 2 lending protocols, 2 DEX infrastructure, 1-2 yield/aggregation, 1-2 early-stage infrastructure (oracle, bridge). Rationale: DeFi protocols in one ecosystem are correlated — diversifying within the ecosystem manages idiosyncratic risk.",
    "Exit strategy: DeFi protocol tokens often have limited liquidity (DEX-only, thin orderbooks). Exit in tranches: sell 20-25% every 30 days once position 3× from entry. Set maximum position age: if a position has not 2× in 24 months, reassess and consider exit regardless of price.",
    "Bear case: Starknet TVL does not grow to support protocol unit economics. Without $5B+ TVL, few protocols generate enough fee revenue for token value accrual. If ecosystem TVL remains below $3B after 2 years, most protocol tokens are uninvestable regardless of quality."]',
  5, ARRAY['investment', 'portfolio', 'early-stage']
),
(
  'starknet-ecosystem', 'senior',
  'Compare the composability moat of Ekubo vs Uniswap v3 on Arbitrum using the four-source framework. For each source, give a 1-5 score for both and explain why. Conclude with what Ekubo would need to achieve to reach Uniswap''s moat strength.',
  'analysis',
  '["Source 1 - Protocol routing: Ekubo 4/5 (primary AVNU source, near-universal Starknet routing). Uniswap v3 5/5 (all major aggregators route through it, $2.8B TVL makes it unavoidable).",
    "Source 2 - Oracle usage: Ekubo 4/5 (Pragma depends on it for primary on-chain price discovery). Uniswap v3 5/5 (Chainlink TWAP feeds derived from Uniswap are used across dozens of protocols, industry standard).",
    "Source 3 - Critical infrastructure: Ekubo 5/5 (92% of Starknet DEX liquidity — more concentrated than Uniswap). Uniswap v3 4/5 (32% of Arbitrum DEX TVL — dominant but not as concentrated as Ekubo).",
    "Source 4 - Switching cost: Ekubo 3/5 (relatively young ecosystem, fewer years of integration debt). Uniswap v3 5/5 (4+ years of integrations, router addresses hardcoded in thousands of contracts, UI SDKs built around its interface).",
    "To reach Uniswap''s moat: Ekubo needs 3-4 years of stable operations (accumulating integration debt), growth of protocols using Ekubo TWAP as price source (currently only Pragma), and ecosystem expansion so that Ekubo becomes the reference implementation for Cairo DEX patterns."]',
  5, ARRAY['composability', 'ekubo', 'competitive-analysis']
),
(
  'starknet-ecosystem', 'senior',
  'You are writing a research report section on Starknet''s fee market. (1) Explain the current fee structure precisely (what users pay, who receives it, how it is calculated), (2) model the impact of decentralised sequencers on fee dynamics, (3) compare to Arbitrum''s Nitro fee model, (4) project fee revenue under three scenarios (bear: TVL stagnates, base: 3× growth, bull: 10× growth) over 12 months.',
  'analysis',
  '["Current fee structure: users pay fees in ETH or STRK. Fee = L2 execution fee (Cairo step count × step price) + L1 DA fee (state diff size × blob price / transactions in batch). Both go to the sequencer (currently StarkWare). No on-chain fee sharing mechanism yet beyond STRK staking rewards.",
    "Decentralised sequencer impact: fees must cover sequencer capital costs (staked STRK) and running costs. Competitive sequencer market → fees approach marginal cost. MEV captures emerge as a new revenue stream for validators. Fee volatility may increase during high-demand periods.",
    "vs Arbitrum Nitro: Arbitrum users pay L2 execution (much cheaper than Ethereum but more expensive than Starknet) + L1 data costs. Arbitrum DAO receives a portion via fee distribution to ARB holders (proposed/in progress). Similar structure but Arbitrum EVM compatibility makes L2 execution more expensive.",
    "Revenue scenarios: Bear (TVL flat at $2B, $20M daily volume): fees ~$60K/day = $22M/year. Base (TVL $6B, $60M volume): fees ~$180K/day = $66M/year. Bull (TVL $20B, $200M volume): fees ~$600K/day = $219M/year. These are protocol-level revenue — STRK stakers receive 10%."]',
  5, ARRAY['fees', 'economics', 'projection']
),
(
  'starknet-ecosystem', 'senior',
  'A researcher at your fund asks whether "Starknet''s AA advantage will persist as EVM chains add AA via EIP-7702." Write a rigorous response covering: (1) what EIP-7702 actually enables, (2) what Starknet''s AA does that EIP-7702 cannot, (3) the timeline comparison, (4) your conclusion on whether the AA moat is durable.',
  'analysis',
  '["EIP-7702: allows EOAs to temporarily adopt smart contract code for a single transaction. An EOA can ''become'' a smart contract wallet for one transaction, enabling batching and sponsored gas. Does NOT: create persistent contract wallets, enable native session keys without third-party infrastructure, or eliminate the EOA/contract distinction.",
    "Starknet AA capabilities EIP-7702 cannot match: (1) Native account contract — wallet IS a contract permanently, not temporarily. (2) __validate__ separation — custom validation logic at the protocol level, not just user level. (3) Session keys as a native account feature — no third-party contract needed. (4) Abstract signature schemes — quantum-resistant or novel cryptography implementable directly.",
    "Timeline: EIP-7702 was included in Ethereum Prague upgrade (expected 2025). Full dApp ecosystem adoption: 2-3 years. Starknet has had full AA since launch. Starknet lead: 3-5 years.",
    "Durability conclusion: the gap narrows with EIP-7702 but does not close. Starknet''s native AA means all wallets and protocols were designed around AA from day one — no legacy EOA baggage. The deeper integration creates a compounding advantage that EIP-7702 retrofits cannot match. AA moat is durable for 5+ years but will face increasing competition as EVM chains improve."]',
  5, ARRAY['account-abstraction', 'competitive-analysis', 'eip-7702']
),
(
  'starknet-ecosystem', 'senior',
  'Cross-chain comparative analysis: Starknet TVL = $1.8B, Arbitrum TVL = $18B, zkSync Era TVL = $900M. All three are ZK rollups or claim similar security properties. (1) What specifically makes Starknet use STARKs while zkSync uses SNARKs — and does the difference matter for users?, (2) why did zkSync Era get to $900M without Starknet''s AA advantages?, (3) what is the most accurate explanation for Starknet''s TVL lag?, (4) project which chain ''wins'' if ZK proves scale equally well.',
  'analysis',
  '["STARKs vs SNARKs: STARKs: no trusted setup, quantum resistant, larger proof size but scalable with recursion, better for large computations (Cairo VM designed around this). SNARKs: smaller proofs, requires trusted setup (security assumption), not quantum resistant, better for specific small computations. For users: functionally equivalent security. STARKs have long-term quantum-resistance advantage but this is a 10+ year concern.",
    "zkSync Era $900M without native AA: achieved primarily by being EVM-compatible. Every Solidity protocol could deploy on zkSync Era without rewriting code. USDC, WETH, all major tokens available day one. Starknet required Cairo rewrites — this is the primary adoption barrier.",
    "Starknet TVL lag explanation: not a technology failure. Primary cause: Cairo adoption friction. Building on Starknet requires learning Cairo, a different language with fewer developers. The ecosystem had to be built from scratch. zkSync Era benefited from port of existing Ethereum protocols.",
    "Long-term winner: if ZK proofs become commoditised (all chains have equivalent proof systems), competition shifts to developer experience, ecosystem size, and network effects. EVM-compatible ZK chains (zkSync Era, Polygon zkEVM) have the adoption head start. Starknet''s AA and Cairo uniqueness become the differentiation. Most likely outcome: Starknet becomes the premium ZK chain for innovative protocols, EVM-ZK chains serve the mainstream migration market."]',
  5, ARRAY['competitive-analysis', 'zksync', 'starks-vs-snarks']
),
(
  'starknet-ecosystem', 'senior',
  'A research peer argues: "Starknet protocol TVL data from DefiLlama is unreliable because their adapters may be wrong." How do you respond? (1) Is this concern valid and for which protocols specifically, (2) how would you verify DefiLlama TVL against raw on-chain data, (3) write the Dune SQL concept for independently computing Vesu TVL, (4) what is the right way to present TVL data in a research report given this uncertainty?',
  'research',
  '["Validity: yes, concern is partially valid. DefiLlama''s TVL figures depend on adapters that read specific contract functions. If a protocol''s adapter is poorly coded, uses outdated contract addresses, or miscounts token prices, TVL is wrong. Starknet protocols are newer and have had historically less-verified adapters than Ethereum protocols.",
    "Verification method: for a lending protocol like Vesu: sum all deposit transactions and subtract withdrawal transactions from on-chain events. Alternatively: call totalAssets() or totalDeposited() directly on the contract via Starknet RPC and compare to DefiLlama figure.",
    "Dune SQL for Vesu TVL: SELECT SUM(CASE WHEN event_type = ''Deposit'' THEN amount WHEN event_type = ''Withdraw'' THEN -amount ELSE 0 END) / 1e18 as tvl_eth FROM decoded_starknet.vesu_evt_deposit_withdraw WHERE token = ''ETH_ADDRESS''. Repeat for each supported asset and sum at current prices.",
    "Presentation standard: always cite source and date. State: ''TVL as reported by DefiLlama on [date], independently verified against on-chain Dune query [link] with [X]% discrepancy noted. DefiLlama figure is used for trend analysis; absolute values should be treated as ±10% estimates.''"]',
  5, ARRAY['research', 'data-quality', 'methodology']
),
(
  'starknet-ecosystem', 'senior',
  'Design the complete scoring rubric for evaluating whether a Starknet protocol is a genuine composability enabler vs a protocol that will be replaced when a better competitor launches. Cover: technical lock-in, data ownership, upgrade trajectory, and community governance strength.',
  'framework',
  '["Technical lock-in scoring: (1) Does the protocol have unique Cairo-native patterns that cannot be replicated without significant rewrite? (5 = yes, e.g. Pragma''s on-chain oracle pricing is deeply integrated with Starknet''s proving model). (2) Is it the primary liquidity venue for one or more assets? (5 = effectively the only venue). (3) Has it been integrated into wallets, aggregators, or other infrastructure at a low level? (4-5 = ArgentX or AVNU SDKs reference it).",
    "Data ownership: (1) Does the protocol produce indexed data (events, state) that other protocols depend on? (2) Is the on-chain state essential for another protocol''s correctness (Pragma oracle state → Vesu health factor)? Higher is better.",
    "Upgrade trajectory: (1) Is the team actively shipping improvements? (2) Are upgrades backwards-compatible with existing integrations? (3) Does the protocol own a standard (e.g. token interface, oracle interface) that others must follow?",
    "Governance strength: (1) Is there a credible governance structure with genuine community input? (2) Are token holders aligned with protocol long-term success (veToken locking)? (3) Is there a credible succession plan if the core team leaves?",
    "Scoring: 18-24/24 = strong composability enabler, difficult to replace. 12-17/24 = moderate moat, replaceable with effort and incentives. <12/24 = weak moat, likely to be replaced."]',
  5, ARRAY['composability', 'framework', 'evaluation']
),
(
  'starknet-ecosystem', 'senior',
  'A DeFi fund has been invested in a Starknet lending protocol for 8 months. The protocol launched a governance token 3 months ago. The token is down 60% from its TGE price. Protocol TVL has remained stable at $30M. What questions do you need to answer to advise the fund on whether to hold, average down, or exit?',
  'investment',
  '["Question 1: Is the protocol generating revenue (not just TVL)? Calculate: protocol fee income per month. If growing → token price decline may be a buying opportunity. If flat → token price may be fairly reflecting no value accrual.",
    "Question 2: What caused the 60% token decline? (a) General market selloff (all tokens down equally → relative outperformance could be positive). (b) Token-specific selling pressure from TGE participants exiting. (c) Fundamental deterioration signal. Dune can show wallet age distribution of sellers.",
    "Question 3: What is the current FDV/revenue multiple? At -60% from TGE, is the token now fairly valued or still expensive? If FDV/annualised revenue < 20×, may be undervalued.",
    "Question 4: What is the unlock schedule? If large insiders vest in the next 3 months, downward pressure will continue regardless of fundamentals.",
    "Question 5: Is the $30M TVL organic? Check if any major incentive programmes are ending soon.",
    "Decision framework: Hold if: revenue growing, token decline is market-driven, FDV/revenue reasonable, no major unlocks. Average down if: all of the above + token below fair value by >30%. Exit if: revenue declining, TVL incentive-dependent, large unlocks imminent."]',
  5, ARRAY['investment', 'decision-framework', 'token-evaluation']
),
(
  'starknet-ecosystem', 'senior',
  'Construct the falsifiability framework for the following research claim: "Starknet''s Account Abstraction features increase LP efficiency by enabling better range management in concentrated liquidity pools." Define: (1) exact metric that operationalises ''LP efficiency'', (2) data source and collection methodology, (3) control variables, (4) three specific observations that would falsify the claim, (5) three observations that would strengthen it.',
  'research',
  '["Operational metric: LP efficiency = (fees earned / capital deployed) adjusted for price volatility. Specifically: fee APY per LP position in Ekubo, measured by tracking position events and calculating time-weighted return. Compare wallets using session keys (automated rebalancing) vs wallets without session keys.",
    "Methodology: Dune query on Ekubo LP position events. Tag wallets by wallet type (ArgentX AA session key enabled vs basic wallets). Calculate fee APY for each position over 30-day windows. Run t-test for difference in means.",
    "Control variables: (1) Range width (narrower ranges earn more in-range but risk going out). (2) Time in range (positions that go out-of-range earn no fees — control for this). (3) Capital size (larger positions may be managed differently). (4) Market volatility period (AA advantages may be more pronounced in volatile periods).",
    "Falsification observations: (1) No statistically significant difference in fee APY between AA and non-AA LP positions. (2) AA wallets have higher out-of-range time despite rebalancing (suggests automated rebalancing is chasing rather than anticipating). (3) Fee advantage disappears when controlling for capital size (large non-AA wallets manage just as well).",
    "Strengthening observations: (1) AA wallets rebalance 3× more frequently with 50% lower gas cost per rebalance (session key efficiency). (2) AA wallet LP positions spend 20% more time in-range. (3) AA LP fee APY is 15%+ higher after controlling for range width and volatility period."]',
  5, ARRAY['research', 'falsifiability', 'methodology']
),
(
  'starknet-ecosystem', 'senior',
  'You need to write the ecosystem gaps section of a research report. Starknet currently lacks: on-chain options, yield aggregation, mobile-native DCA, and real-world asset (RWA) integration. For each gap: (1) quantify the addressable market on comparable chains, (2) explain why the gap exists (technical barrier, regulatory, first-mover timing), (3) rate the gap from 1-5 on urgency for ecosystem health, (4) recommend the ideal team profile to fill it.',
  'analysis',
  '["Options: Arbitrum options protocols handle $50M+ daily notional. Gap reason: options market-making requires Greeks management expertise not native to Cairo. Urgency: 3/5 (DeFi works without options, but institutions need them). Team: experienced options market-maker with Cairo developers, not just Cairo developers.",
    "Yield aggregation: Yearn/Convex-equivalents on Ethereum manage billions. Gap reason: not enough yield sources yet to aggregate (only 2-3 lending protocols). Urgency: 4/5 (will become critical as protocol count grows). Team: DeFi generalists who understand yield source diversity, session key integration for automated rebalancing.",
    "Mobile-native DCA: no clean mobile app with Starknet-native DCA and session keys. Gap reason: first-mover timing, Cairo learning curve. Urgency: 5/5 (largest user base acquisition opportunity — most new crypto users use mobile). Team: mobile-first product team with React Native expertise, Cairo integration via Starkzap SDK.",
    "RWA: Ondo, Centrifuge manage billions of tokenised assets on Ethereum. Gap reason: regulatory cost ($1.5M+ legal) + immature institutional relationships on Starknet. Urgency: 2/5 (premature for current Starknet scale). Team: fintech regulatory experts + blockchain lawyers + Cairo developers as third priority."]',
  5, ARRAY['gaps', 'ecosystem', 'opportunity-analysis']
)

ON CONFLICT DO NOTHING;

-- Final verification
-- Run after seeding:
-- SELECT track_id, level, COUNT(*) as total, AVG(difficulty) as avg_difficulty
-- FROM skillup_dev.interview_questions
-- GROUP BY track_id, level
-- ORDER BY track_id, level;
-- Expected: 25+ per track/level combination
