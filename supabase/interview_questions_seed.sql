-- ============================================================
-- interview_questions_seed.sql
-- Sifter SkillUp — Final Boss Question Banks
-- All 3 Starknet tracks × Junior + Senior levels
--
-- Run in Supabase SQL Editor ONCE to populate the question bank.
-- Safe to re-run: uses INSERT ... ON CONFLICT DO NOTHING
--
-- After running, verify with:
--   SELECT track_id, level, COUNT(*) FROM interview_questions GROUP BY track_id, level;
-- Expected:
--   starknet-defi-navigator  | junior  | 5
--   starknet-defi-navigator  | senior  | 5
--   cairo-builder            | junior  | 5
--   cairo-builder            | senior  | 5
--   starknet-ecosystem       | junior  | 5
--   starknet-ecosystem       | senior  | 5
-- ============================================================

-- ─── Create table if not exists ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS skillup_dev.interview_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id TEXT NOT NULL,
  level TEXT NOT NULL,
  question TEXT NOT NULL,
  type TEXT DEFAULT 'open',
  scoring_criteria JSONB,
  difficulty INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iq_tl
  ON skillup_dev.interview_questions(track_id, level);

-- Also update interview_sessions to track scoring fields
ALTER TABLE skillup_dev.interview_sessions
  ADD COLUMN IF NOT EXISTS overall_passed BOOLEAN,
  ADD COLUMN IF NOT EXISTS questions_passed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0;


-- ============================================================
-- TRACK 1: STARKNET DEFI NAVIGATOR
-- ============================================================

-- ── Junior Level ──────────────────────────────────────────────

INSERT INTO skillup_dev.interview_questions
  (track_id, level, question, type, scoring_criteria, difficulty)
VALUES
(
  'starknet-defi-navigator', 'junior',
  'A USDC pool on Vesu has $8M deposited and $6.72M borrowed. Borrow APY is 9.2%. Reserve factor is 14%. Calculate: (1) the utilisation rate, (2) the supply APY for depositors, (3) what happens to borrow APY if $2M more USDC is deposited. Show your working.',
  'calculation',
  '["Utilisation: $6.72M / $8M = 84%",
    "Supply APY: 9.2% x 0.84 x (1 - 0.14) = 9.2% x 0.84 x 0.86 = 6.65%",
    "New utilisation after $2M deposit: $6.72M / $10M = 67.2%",
    "Correct direction: utilisation drops below kink, borrow APY falls significantly from 9.2%"]',
  2
),
(
  'starknet-defi-navigator', 'junior',
  'You have 5 ETH worth $18,500. You want to borrow $8,000 USDC on a lending protocol with 75% max LTV and 82% liquidation threshold. (1) Can you borrow $8,000? (2) At what ETH price does liquidation trigger? (3) What is your health factor at the time of borrowing?',
  'calculation',
  '["Max borrow: $18,500 x 0.75 = $13,875. Yes, $8,000 is borrowable.",
    "Liquidation price: $8,000 / (5 ETH x 0.82) = $1,951.22 per ETH",
    "Health factor: ($18,500 x 0.82) / $8,000 = 1.897",
    "Correct understanding: health factor above 1.0 means safe, below 1.0 means liquidated"]',
  3
),
(
  'starknet-defi-navigator', 'junior',
  'A pool starts with 1,000,000 STRK and 1,000,000 USDC (k = 1,000,000,000,000). You buy 100,000 STRK. Calculate: (1) the new pool balances after your purchase, (2) how much USDC you paid, (3) the effective execution price per STRK, (4) the price impact percentage compared to the spot price before your trade.',
  'calculation',
  '["New STRK balance: 1,000,000 - 100,000 = 900,000 STRK",
    "New USDC balance: k / 900,000 = 1,111,111 USDC",
    "USDC paid: 1,111,111 - 1,000,000 = 111,111 USDC",
    "Execution price: $111,111 / 100,000 STRK = $1.111 per STRK",
    "Price impact: ($1.111 - $1.000) / $1.000 = 11.1%"]',
  3
),
(
  'starknet-defi-navigator', 'junior',
  'An audit report for a Starknet lending protocol shows: 1 CRITICAL (resolved — oracle price manipulation path), 2 HIGH (1 resolved, 1 unresolved — access control on fee collection function, fee switch currently inactive), 8 MEDIUM (all resolved). Protocol TVL: $15M. Audit date: 3 months ago, no contract upgrades since. Would you deposit $50,000? Give a structured risk assessment.',
  'judgment',
  '["Critical resolved with oracle fix correctly assessed as significant risk mitigated",
    "Unresolved HIGH correctly assessed: access control on inactive fee switch — low immediate financial risk but known attack surface",
    "Audit freshness correctly noted: 3 months, no upgrades since — low staleness risk",
    "Conclusion is evidence-based not binary: reasonable to deposit with monitoring, identifies specific condition that would change the assessment",
    "Position sizing relative to $15M TVL mentioned or implied — $50K is 0.33% of TVL, reasonable concentration"]',
  3
),
(
  'starknet-defi-navigator', 'junior',
  'What is AVNU and why would a DeFi user use it instead of trading directly on Ekubo? Give a specific numerical example showing the difference in output for a 10,000 STRK swap.',
  'explanation',
  '["Correctly identifies AVNU as a DEX aggregator that splits orders across multiple liquidity sources simultaneously",
    "Explains the benefit: reduces price impact by splitting and finding optimal routing",
    "Provides a concrete example with numbers: e.g. direct Ekubo = $X received, AVNU multi-route = $Y received where Y > X",
    "Notes the practical threshold: aggregation saves more than routing fee cost only above a certain order size"]',
  2
)
ON CONFLICT DO NOTHING;


-- ── Senior Level ──────────────────────────────────────────────

INSERT INTO skillup_dev.interview_questions
  (track_id, level, question, type, scoring_criteria, difficulty)
VALUES
(
  'starknet-defi-navigator', 'senior',
  'Walk through the full interest rate model for a lending protocol with a kink model. Explain: (1) the two-segment formula, (2) why the kink exists at a specific utilisation level, (3) how the reserve factor affects equilibrium yield for depositors, (4) under what conditions would a rational depositor exit the pool.',
  'explanation',
  '["Correctly explains two-segment: below kink — base rate + slope1 * utilisation, above kink — larger slope2 kicks in sharply",
    "Kink purpose: creates strong incentive for borrowers to repay as utilisation approaches the kink, preventing pool from being fully drained",
    "Reserve factor effect: depositor APY = borrow APY x utilisation x (1 - reserve_factor) — reserve factor is a tax that reduces depositor return",
    "Exit condition: when risk-adjusted alternative yield (e.g. staking STRK) exceeds pool supply APY plus liquidity risk compensation"]',
  4
),
(
  'starknet-defi-navigator', 'senior',
  'A concentrated liquidity LP positions $50,000 in a STRK/USDC range of $0.75–$0.85 when STRK = $0.80. The pool generates $20,000 in daily volume with a 0.3% fee. Total liquidity in the pool is $2M across all ranges, but your range captures 40% of all volume due to being around the current price. STRK falls to $0.60. (1) What is your position composition now? (2) What was your fee income before the price left your range? (3) What are your options?',
  'calculation',
  '["Position composition: 100% STRK (all USDC has been exchanged for STRK as price fell through the range to the lower bound)",
    "Fee income calculation: $20,000 daily volume x 0.3% = $60 daily fees to pool. Your share: 40% volume capture x your liquidity proportion. Must show working.",
    "Options correctly identified: (1) hold and collect no fees until price re-enters range, (2) remove liquidity and reposition at new range around $0.60, (3) hold as a directional bet on price recovery"]',
  4
),
(
  'starknet-defi-navigator', 'senior',
  'A Starknet DeFi protocol has $40M TVL and generates $2.8M annual protocol revenue. The governance token has a $120M FDV, 15% circulating, and the fee switch is active — 10% of revenue goes to stakers. Analyse: (1) the revenue sustainability, (2) the implied yield to stakers at current prices, (3) the dilution risk, (4) whether you would take a long position and with what conditions.',
  'analysis',
  '["Revenue sustainability: $2.8M / $40M TVL = 7% revenue yield on TVL — healthy for a DeFi protocol in growth phase",
    "Staker yield: 10% of $2.8M = $280K annual. Circulating market cap: $120M x 0.15 = $18M. Staker yield: $280K / $18M = 1.56% APY — below risk-free rate, insufficient as standalone yield",
    "Dilution risk: FDV/market cap = $120M / $18M = 6.67x. 85% of supply still to unlock. High dilution pressure unless demand grows proportionally.",
    "Investment thesis: long conditions stated specifically — e.g. if TVL grows to $100M+ (achievable) revenue grows to $7M+, staker yield becomes 5%+ which attracts demand that can absorb unlock pressure"]',
  5
),
(
  'starknet-defi-navigator', 'senior',
  'Starknet has a sequencer currently operated by StarkWare. Explain: (1) what a sequencer does and why sequencer centralisation is a systemic DeFi risk, (2) the specific attack vector that a malicious sequencer could execute, (3) what protocol-level mitigations currently exist on Starknet, (4) how this risk profile compares to an optimistic rollup with a centralised sequencer.',
  'explanation',
  '["Sequencer role: orders and executes transactions before batching to L1. Centralisation risk: single point of failure for liveness and censorship.",
    "Attack vector: sequencer can front-run transactions (sees mempool before ordering), censor specific addresses, or cause liveness failure by going offline — all damage DeFi protocol users",
    "Starknet mitigations: L1 settlement means sequencer cannot steal funds (proof system prevents invalid state), but liveness and MEV are not protected by current architecture",
    "Comparison to optimistic: both have liveness risk from centralised sequencer. Starknet has no theft risk (validity proof). Optimistic has 7-day withdrawal delay for additional L1 security. Neither fully solves MEV."]',
  4
),
(
  'starknet-defi-navigator', 'senior',
  'You manage a $500,000 DeFi portfolio on Starknet. Design a position that targets 12% APY while maintaining health factors above 2.0 on all borrow positions. Current rates: USDC supply 5.4%, ETH supply 2.9%, USDC borrow 7.1%, STRK staking 8.8%. Show: (1) specific allocation amounts, (2) all calculations, (3) net yield after borrowing costs, (4) what ETH price triggers action and what action you take.',
  'portfolio',
  '["Allocation sums to $500,000. Must show each position explicitly.",
    "All APY calculations shown — not just conclusions. Net yield derived from each position.",
    "Target 12% achievable with a combination: e.g. STRK staking + leveraged supply strategy or multi-protocol allocation",
    "Health factor calculation shown for any borrow positions: collateral value x liquidation threshold / debt > 2.0",
    "Specific trigger price calculated: at what ETH price does HF = 2.0? Action: partial repayment or collateral top-up identified with amounts"]',
  5
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- TRACK 2: CAIRO BUILDER
-- ============================================================

-- ── Junior Level ──────────────────────────────────────────────

INSERT INTO skillup_dev.interview_questions
  (track_id, level, question, type, scoring_criteria, difficulty)
VALUES
(
  'cairo-builder', 'junior',
  'What is the difference between felt252 and u256 in Cairo? Give a specific example of a storage variable declaration for each, and explain when you would choose u256 over felt252 for a token balance.',
  'technical',
  '["felt252: native field element, range 0 to P-1 (P is a large prime), used for hashes, addresses, identifiers — compact and cheap",
    "u256: two felt252 fields (low + high 128-bit), used for token amounts, arithmetic-safe for large numbers",
    "Storage example: #[storage] struct Storage { id: felt252, balance: u256 } — correct syntax",
    "Reason for u256 for balances: arithmetic operations need overflow protection. u256 checks overflow. felt252 wraps silently — unsafe for financial calculations."]',
  2
),
(
  'cairo-builder', 'junior',
  'Write a Cairo function that checks whether the caller is the contract owner stored in storage before executing a privileged action. Show: (1) the #[storage] struct declaration, (2) the ownership check, (3) what happens if the check fails.',
  'code',
  '["Correct #[storage] struct with owner: ContractAddress field",
    "get_caller_address() used to retrieve the message sender",
    "Comparison and assertion: assert(caller == self.owner.read(), ''Caller is not owner'') or equivalent panic",
    "#[external(v0)] or #[abi(embed_v0)] on the function — demonstrates understanding of external function declaration"]',
  2
),
(
  'cairo-builder', 'junior',
  'Explain the Checks-Effects-Interactions (CEI) pattern in Cairo smart contract development. (1) Define each step, (2) give a concrete example of a vulnerable withdraw function that violates it, (3) show the corrected version, (4) explain why Cairo''s architecture reduces but does not eliminate reentrancy risk.',
  'explanation',
  '["Checks: validate all preconditions (ownership, balance, amounts) before any state change",
    "Effects: update all state (subtract balance, mark as processed) BEFORE any external calls",
    "Interactions: make external calls LAST, after state is fully updated",
    "Vulnerable example shown: external call before balance update — allows recursive callback before balance is deducted",
    "Cairo mitigation: ABI-based dispatch and no fallback functions reduce attack surface — but cross-contract calls still allow reentrancy"]',
  3
),
(
  'cairo-builder', 'junior',
  'A developer writes a Cairo ERC-20 contract. Their transfer() function does not check for zero-address recipients. Explain: (1) what happens to tokens sent to address 0x0 on Starknet, (2) why this is dangerous, (3) the exact Cairo code to add the zero-address guard.',
  'technical',
  '["0x0 on Starknet: address zero is not a null address like Ethereum — it is a valid address controlled by no one. Tokens sent there are permanently locked.",
    "Dangerous: tokens are irretrievably burned — users lose funds with no recovery mechanism",
    "Zero-address guard: assert(recipient != contract_address_const::<0>(), ''Transfer to zero address'') or equivalent",
    "Correct import: use_contract_address_const from starknet library — not a hardcoded literal"]',
  2
),
(
  'cairo-builder', 'junior',
  'Write the complete skeleton of a Cairo ERC-20 contract with: (1) the required storage fields, (2) the IERC20 trait with the correct function signatures, (3) one fully implemented function (your choice). You do not need to implement all functions — demonstrate structure and Cairo syntax.',
  'code',
  '["Storage struct contains: name felt252, symbol felt252, decimals u8, total_supply u256, balances Map<ContractAddress, u256>, allowances Map<(ContractAddress, ContractAddress), u256>",
    "IERC20 trait declares: total_supply, balance_of, allowance, transfer, transfer_from, approve — correct return types",
    "Implemented function uses correct self pattern: view functions use @ContractState, mutating use ref self: ContractState",
    "Event emission present in at least one function: self.emit(Transfer { from, to, value })"]',
  3
)
ON CONFLICT DO NOTHING;


-- ── Senior Level ──────────────────────────────────────────────

INSERT INTO skillup_dev.interview_questions
  (track_id, level, question, type, scoring_criteria, difficulty)
VALUES
(
  'cairo-builder', 'senior',
  'Design a flash loan contract in Cairo. (1) Describe the complete execution flow with re-entrancy protection, (2) identify the specific Cairo types that make the fee accounting safe, (3) write the critical section (flash_loan function signature + the three key assertions), (4) explain one protocol-level attack that flash loans enable and the smart contract guard that prevents it.',
  'architecture',
  '["Execution flow: transfer asset to borrower -> borrower callback -> assert repayment -> distribute fee",
    "Re-entrancy guard: storage bool locked field, assert(!self.locked.read()) at entry, set to true before callback, set to false after",
    "Safe fee accounting: u256 arithmetic for amounts (no overflow on large sums). Correct balance difference check.",
    "Function signature includes: flash_loan(ref self, amount: u256, callback: ContractAddress, calldata: Array<felt252>)",
    "Attack example: price oracle manipulation using borrowed capital. Guard: read oracle price before lending, not during callback"]',
  5
),
(
  'cairo-builder', 'senior',
  'Explain Sierra (Safe Intermediate Representation) and its significance for Starknet security. (1) What problem did Sierra solve that Cairo 0 had, (2) how does Sierra prevent DOS attacks on the prover, (3) what does "gas always paid" mean at the Sierra level, (4) what are the practical implications for smart contract developers.',
  'explanation',
  '["Cairo 0 problem: failed transactions produced no proof — prover could be forced to work on invalid computation without being paid, enabling DOS attacks",
    "Sierra solution: every Sierra program is provably safe — the compiler guarantees a proof can always be generated, even for failing transactions",
    "Gas always paid: even reverted transactions consume gas because the sequencer proved the failure. Attackers cannot submit unlimited failing transactions for free.",
    "Developer implications: panic!() generates a valid proof of failure. Infinite loops are caught at Sierra compilation — not at runtime. All transactions incur gas cost."]',
  4
),
(
  'cairo-builder', 'senior',
  'You are reviewing a Cairo vault contract and find this code: the withdraw function reads the user balance, makes an external call to transfer tokens, then updates the balance to zero. (1) Identify all vulnerabilities, (2) write a STRIDE threat model entry for the most critical finding, (3) write an snforge fork test that demonstrates the exploit.',
  'security',
  '["Vulnerability 1: Reentrancy — balance update after external call allows attacker to re-enter withdraw before balance is zeroed",
    "Vulnerability 2: Missing zero-amount guard — withdraw(0) may succeed consuming gas with no effect",
    "STRIDE entry: Elevation of Privilege. Attacker deploys a contract that re-enters withdraw. PoC: recursive call extracts full vault balance. Severity: CRITICAL. Mitigation: CEI pattern — set balance = 0 before transfer.",
    "snforge fork test: uses snforge_std::spy_events or cheatcodes to simulate reentrancy callback. Test verifies vault balance after attack is lower than expected without protection."]',
  5
),
(
  'cairo-builder', 'senior',
  'Compare Account Abstraction as implemented on Starknet versus EIP-4337 on Ethereum. (1) What is fundamentally different about Starknet''s AA model, (2) why does native AA enable more powerful session keys, (3) write the __validate__ and __execute__ function signatures for a Starknet account contract, (4) what attack does the fee abstraction in AA create that does not exist with EOAs.',
  'comparison',
  '["Starknet AA: every account is a contract at the protocol level — no EOAs. Ethereum EIP-4337: AA is a workaround layer on top of existing EOA infrastructure using a UserOperation mempool.",
    "Session keys: native AA means session keys can be implemented as contract logic with custom validation — spending limits, time bounds, contract allowlists. EIP-4337 requires a separate Paymaster infrastructure.",
    "Signatures: __validate__ takes (calls: Array<Call>) -> felt252. __execute__ takes (calls: Array<Call>) -> Array<Span<felt252>>. Both are #[external(v0)].",
    "Fee abstraction attack: Paymaster pre-authorization can be used to front-run or deny service. If paymaster validates before execution, an attacker can cause validation to pass but execution to fail, wasting paymaster gas."]',
  5
),
(
  'cairo-builder', 'senior',
  'You are building a production lending protocol on Starknet. Describe your complete smart contract architecture: (1) the contracts you would deploy and their separation of concerns, (2) which OpenZeppelin components you would use and why, (3) your oracle strategy and the specific manipulation resistance you build in, (4) your upgrade strategy and the tradeoffs.',
  'architecture',
  '["Contract separation: LendingPool (core logic), InterestRateModel (separate for upgradeability), CollateralManager (separate for adding collateral types), Oracle adapter (thin wrapper for flexibility). Not one monolithic contract.",
    "OZ components: OwnableComponent for admin, UpgradeableComponent for upgrades, ReentrancyGuardComponent to prevent re-entrancy. Named specifically — not vague reference.",
    "Oracle strategy: Pragma as primary. TWAP over 30+ blocks to prevent single-block manipulation. Emergency pause if Pragma deviation > 5% in single block.",
    "Upgrade strategy tradeoff correctly stated: proxy pattern allows fixing bugs but introduces admin key risk. Time-locked upgrades (48-hour minimum) give users exit window before changes take effect."]',
  5
)
ON CONFLICT DO NOTHING;


-- ============================================================
-- TRACK 3: STARKNET ECOSYSTEM
-- ============================================================

-- ── Junior Level ──────────────────────────────────────────────

INSERT INTO skillup_dev.interview_questions
  (track_id, level, question, type, scoring_criteria, difficulty)
VALUES
(
  'starknet-ecosystem', 'junior',
  'STRK token data: total supply 10 billion, current circulating supply 728 million (7.28%), current price $0.38, FDV $3.8B. Insider allocation 33.3% with 12-month cliff and 36-month linear vest. Fee switch active — 10% of protocol fees go to STRK stakers. Score this against the seven-point tokenomics checklist and give your overall risk assessment.',
  'analysis',
  '["Point 1: insider allocation 33.3% — below 40% threshold. PASS",
    "Point 2: cliff 12 months — above 6-month minimum. PASS",
    "FDV/market cap ratio: $3.8B / ($0.38 x 728M) = $3.8B / $276.6M = 13.7x — HIGH dilution concern, above 10x threshold. Flag as risk.",
    "Fee switch active = value accrual to stakers exists. PASS",
    "Overall assessment: 4-5 of 7 points pass. Significant dilution risk at 13.7x FDV ratio requires strong demand growth narrative to be investable."]',
  3
),
(
  'starknet-ecosystem', 'junior',
  'What is a STARK proof and why does it give Starknet stronger security guarantees than an optimistic rollup? Compare specifically: (1) how each handles transaction validity, (2) how long withdrawals take to L1 and why, (3) what the tradeoff is in computational cost.',
  'explanation',
  '["STARK proof: cryptographic proof that a computation was executed correctly, verified by L1 Ethereum. Starknet only submits valid state transitions — L1 cannot be fooled.",
    "Optimistic: assumes transactions valid, requires 7-day challenge window for fraud proofs. Trust-then-verify vs verify-then-accept.",
    "Withdrawal speed: ZK rollup (Starknet) — minutes to hours once proof verified on L1. Optimistic — 7-day wait for challenge period to expire.",
    "Tradeoff: STARK proof generation is computationally expensive (GPU proving). Optimistic is cheaper operationally but slower for finality."]',
  2
),
(
  'starknet-ecosystem', 'junior',
  'Ekubo is Starknet''s dominant DEX. Explain: (1) how its concentrated liquidity model works, (2) why Ekubo''s market dominance is both a strength and a systemic risk for Starknet DeFi, (3) what specific data you would check on Starkscan or DefiLlama to assess its health.',
  'explanation',
  '["Concentrated liquidity: LPs specify price ranges, capital deployed only within that range. More capital efficient than constant-product pools for stable pairs.",
    "Strength: deep liquidity improves execution quality for all Starknet DEX users and oracle price feeds",
    "Systemic risk: Ekubo holds ~92% of Starknet DEX liquidity — an outage or exploit affects all protocols that depend on on-chain price discovery via Pragma oracle",
    "Health metrics: TVL trend on DefiLlama, daily volume on Starkscan, volume/TVL ratio (capital efficiency), number of active LPs, fee revenue."]',
  2
),
(
  'starknet-ecosystem', 'junior',
  'Walk through the complete flow of a Starknet governance proposal from idea to implementation. Use SNIP-18 (gas price reduction) as a real example if you know it, or describe the general process. At which step does StarkWare retain veto power, and why?',
  'explanation',
  '["Flow: community discussion on forum -> SNIP draft -> temperature check on Snapshot -> formal vote -> implementation by StarkWare",
    "StarkWare veto: protocol-level changes require StarkWare technical implementation. Community can vote yes but StarkWare can delay or decline implementation during current decentralisation phase",
    "Reason for current veto: Starknet is still in controlled decentralisation — StarkWare maintains technical responsibility for network safety during this phase",
    "This is documented in Starknet Foundation governance documentation as temporary constraint until decentralisation milestones are met"]',
  2
),
(
  'starknet-ecosystem', 'junior',
  'A new Starknet DeFi protocol token has: 45% team + investor allocation, 1-month cliff, 24-month vesting, no published post-vesting emission schedule, treasury held by 2-of-3 multisig where all three signers are co-founders. Apply the four red flags framework and rate the overall tokenomics risk.',
  'analysis',
  '["Red flag 1: insider allocation 45% — above 40% threshold. FLAGGED. Risk: majority of supply controlled by insiders.",
    "Red flag 2: cliff 1 month — below 6-month minimum. FLAGGED. Risk: insiders can sell within 1 month of token launch.",
    "Red flag 3: no post-vesting emission schedule. FLAGGED. Risk: unknown future supply inflation.",
    "Red flag 4: 2-of-3 multisig all co-founders — no independent signers. FLAGGED. Risk: coordinated rug without external check.",
    "Overall: 4 of 4 red flags triggered. HIGH RISK. Avoid or require substantial evidence of changed governance before investing."]',
  3
)
ON CONFLICT DO NOTHING;


-- ── Senior Level ──────────────────────────────────────────────

INSERT INTO skillup_dev.interview_questions
  (track_id, level, question, type, scoring_criteria, difficulty)
VALUES
(
  'starknet-ecosystem', 'senior',
  'From your ecosystem research: Starknet''s DEX capital efficiency (daily volume / TVL) is approximately 18%, comparable to Arbitrum. Identify the most important condition that would cause this efficiency advantage to disappear, and give a specific timeline estimate with reasoning.',
  'analysis',
  '["Core risk: an EVM-compatible ZK-rollup (zkSync Era, Polygon zkEVM) achieving equivalent Account Abstraction support would remove Starknet''s unique AA-driven efficiency advantage",
    "Why AA drives efficiency: session keys and gasless transactions reduce friction for active trading. More active traders = higher volume/TVL ratio.",
    "Timeline: 12-24 months for ZKSync or Polygon zkEVM to implement native AA equivalent — these teams have stated roadmaps for AA features",
    "Starknet retention condition: Cairo developer ecosystem must grow faster than EVM-ZK developer migration rate. If Cairo tooling improves faster than EVM-ZK AA features ship, advantage persists."]',
  5
),
(
  'starknet-ecosystem', 'senior',
  'Map the single most dangerous systemic risk in Starknet DeFi. Walk me through a specific step-by-step contagion chain with causal connections between each step. Identify at which step the failure becomes terminal versus recoverable.',
  'risk-analysis',
  '["Risk identified: oracle concentration (Pragma depends on Ekubo for on-chain price data) or sequencer centralisation — both valid, oracle preferred",
    "Contagion chain (oracle path): Ekubo outage or exploit -> Pragma loses 92% of price discovery input -> remaining 8% of DEX liquidity produces manipulable price -> Vesu and Nostra use distorted STRK price -> health factors miscalculated -> missed liquidations or incorrect liquidations -> bad debt accumulates in lending protocols",
    "Terminal vs recoverable: failure becomes terminal if Pragma price distortion exceeds 10-15% and persists >2 hours in high-volatility conditions — bad debt accumulates beyond protocol insurance funds",
    "Recoverable: if restoration happens within 30 minutes and LTV ratios are conservative, simultaneous liquidations are manageable without insolvency"]',
  5
),
(
  'starknet-ecosystem', 'senior',
  'You are evaluating a $1M investment into Starknet ecosystem opportunity. The four gaps identified in ecosystem research are: options protocol, yield aggregator, RWA integration, and mobile-native DCA. Rank these by expected return on capital using probability of execution × market size framework. Defend your top choice.',
  'investment',
  '["Framework applied correctly: expected return = market size × probability of execution × time to revenue",
    "Yield aggregator ranked 1st or 2nd: high infrastructure readiness (Vesu, Nostra, AVNU already deployed as yield destinations), no specialist expertise required, self-sustaining revenue model from day one",
    "Options ranked lower: requires specialist options market-making expertise (Greek management under thin liquidity) — rare talent profile reduces execution probability",
    "RWA ranked lower: $1-2M legal cost before any code written — $1M total budget insufficient",
    "Position sizing or fund structure consideration: yield aggregator team can be assembled from existing DeFi developers, $1M sufficient for MVP + 12 months runway"]',
  5
),
(
  'starknet-ecosystem', 'senior',
  'A Starknet protocol is applying for a Starknet Foundation developer grant. Their application: $200K STRK grant, building a perpetuals DEX, team of 2, no prior mainnet deployments, milestone: "launch perpetuals DEX in 6 months", risk: "market may not be ready". Evaluate this application against the four-criterion grant framework and state your decision.',
  'evaluation',
  '["Criterion 1 (clear product with measurable metric): FAIL — milestone is activity not outcome. Missing: specific TVL target, user count, or volume metric with verification method.",
    "Criterion 2 (verifiable team credentials): FAIL — no prior mainnet deployments, team of 2 with no stated expertise in perpetuals market-making or options/derivatives. Insufficient credibility for $200K.",
    "Criterion 3 (milestone format): FAIL — single milestone with no intermediate checkpoints. $200K front-loaded with no deliverable gates.",
    "Criterion 4 (specific risk with mitigation): FAIL — ''market not ready'' is not a risk with a mitigation plan. Specific risk: thin liquidity causing bad execution that drives users away. Missing mitigation.",
    "Decision: REJECT with specific feedback on each criterion. Resubmission should define outcome metrics, staged milestones, and specific risks with mitigations."]',
  4
),
(
  'starknet-ecosystem', 'senior',
  'Vesu protocol has: $45M TVL, $3.2M annual protocol revenue, fee switch sending 15% to STRK stakers. Ekubo has: $82M TVL, $8.1M annual protocol revenue from fees, no fee switch. Nostra has: $28M TVL, $1.9M annual revenue. You are writing an ecosystem competitiveness brief for a DeFi fund. Compare these three protocols across: revenue efficiency, value capture, and growth sustainability. Which one is the most investable and why?',
  'analysis',
  '["Revenue efficiency: Vesu $3.2M / $45M = 7.1%. Ekubo $8.1M / $82M = 9.9%. Nostra $1.9M / $28M = 6.8%. Ekubo highest capital efficiency.",
    "Value capture: only Vesu (via STRK fee share) and Ekubo (via future fee switch potential) have value accrual paths. Nostra unclear.",
    "Growth sustainability: all three dependent on Starknet ecosystem growth. Ekubo most leveraged to ecosystem growth as the primary DEX infrastructure.",
    "Investment case: Ekubo strongest revenue efficiency and infrastructure moat, but no native governance token for direct exposure. STRK staking as proxy for Vesu revenue. Direct Nostra/Vesu token access required for direct exposure.",
    "Honest conclusion: investability depends on access — Ekubo indirect via STRK. Vesu or Nostra tokens if available with reasonable tokenomics."]',
  5
)
ON CONFLICT DO NOTHING;


-- ─── Verification query ───────────────────────────────────────────────────────
-- Run this after seeding to confirm:

-- SELECT track_id, level, COUNT(*) as question_count
-- FROM interview_questions
-- GROUP BY track_id, level
-- ORDER BY track_id, level;
