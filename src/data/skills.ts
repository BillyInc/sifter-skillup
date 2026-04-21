// ⚡ Sifter Skill_Up — Career Skill Tracks (Phase 2)
// All tracks show as Coming Soon. Structure is final; tapping tracks will
// be logged for interest analytics to prioritise build order.

export type SkillCategory = 'trading' | 'research' | 'building' | 'earning' | 'content' | 'professional';
export type SkillDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface SkillModule {
  id: string;
  title: string;
  description: string;
}

export interface SkillTrack {
  id: string;
  category: SkillCategory;
  icon: string;
  name: string;
  tagline: string;
  description: string;
  difficulty: SkillDifficulty;
  color: string;
  estimatedHours: number;
  earningPotential: string;
  realWorldOutcomes: string[];
  modules: SkillModule[];
  comingSoon: true;
}

export const SKILL_CATEGORIES: Record<SkillCategory, { label: string; icon: string; color: string }> = {
  trading:      { label: 'Trading',      icon: '📈', color: '#f7931a' },
  research:     { label: 'Research',     icon: '🔬', color: '#6366f1' },
  building:     { label: 'Building',     icon: '🛠️', color: '#10b981' },
  earning:      { label: 'Earning',      icon: '💰', color: '#f59e0b' },
  content:      { label: 'Content',      icon: '🎙️', color: '#ef4444' },
  professional: { label: 'Professional', icon: '💼', color: '#8b5cf6' },
};

export const SKILL_TRACKS: SkillTrack[] = [
  // ── TRADING ──────────────────────────────────────────────────────────────
  { id: 'spot-trading', category: 'trading', icon: '💹', name: 'Spot Trading',
    tagline: 'Buy low, sell high — the right way',
    description: 'Order types, chart reading, entry/exit strategies, and position sizing on CEXs and DEXs.',
    difficulty: 'beginner', color: '#f7931a', estimatedHours: 20, earningPotential: 'Unlimited — skill-based',
    realWorldOutcomes: ['Execute disciplined entries and exits', 'Read candlestick charts confidently', 'Manage risk with stop-losses', 'Trade on CEXs and DEXs'],
    modules: [
      { id: 's1', title: 'Order Types', description: 'Market, limit, stop-limit, OCO' },
      { id: 's2', title: 'Chart Reading', description: 'Candlesticks, volume, support/resistance' },
      { id: 's3', title: 'Entry & Exit Strategy', description: 'R:R ratios, take profit laddering' },
      { id: 's4', title: 'Position Sizing', description: 'Risk per trade, fixed fractional sizing' },
      { id: 's5', title: 'CEX vs DEX Trading', description: 'Binance, Coinbase, Uniswap, Jupiter' },
      { id: 's6', title: 'Trading Psychology', description: 'FOMO, fear, revenge trading' },
    ], comingSoon: true },

  { id: 'memecoin-trading', category: 'trading', icon: '🐸', name: 'Memecoin Trading',
    tagline: 'Navigate the wild west profitably',
    description: 'Bonding curves, early entries, rug detection, exit liquidity, pump timing.',
    difficulty: 'intermediate', color: '#06b6d4', estimatedHours: 25, earningPotential: '$1,000–$50,000+/month',
    realWorldOutcomes: ['Identify early-stage opportunities on pump.fun', 'Detect rugs before they happen', 'Time entries around whale activity', 'Manage a high-risk portfolio'],
    modules: [
      { id: 'm1', title: 'Bonding Curves', description: 'How pump.fun and LaunchLab work' },
      { id: 'm2', title: 'Early Entry Signals', description: 'Smart money detection, wallet tracking' },
      { id: 'm3', title: 'Rug Detection', description: 'LP locks, mint authority, red flags' },
      { id: 'm4', title: 'Exit Liquidity', description: 'Understanding who is on the other side' },
      { id: 'm5', title: 'DEXScreener Mastery', description: 'Charts, volume, holder distribution' },
      { id: 'm6', title: 'Risk Management', description: 'Position sizing in volatile markets' },
    ], comingSoon: true },

  { id: 'futures-trading', category: 'trading', icon: '⚡', name: 'Futures & Perpetuals',
    tagline: 'Trade leverage without getting rekt',
    description: 'Perps, funding rates, liquidation mechanics, hedging, and leverage as a tool.',
    difficulty: 'advanced', color: '#ef4444', estimatedHours: 30, earningPotential: 'Unlimited — high risk/reward',
    realWorldOutcomes: ['Trade perps on Binance, Hyperliquid, GMX', 'Calculate liquidation prices', 'Use funding rates strategically', 'Hedge spot with perps'],
    modules: [
      { id: 'f1', title: 'How Perpetuals Work', description: 'Funding rates, mark price, index price' },
      { id: 'f2', title: 'Liquidation Mechanics', description: 'How to never get liquidated' },
      { id: 'f3', title: 'Leverage as a Tool', description: 'When to use it, when not to' },
      { id: 'f4', title: 'Hedging Strategies', description: 'Protecting spot with shorts' },
      { id: 'f5', title: 'Funding Rate Arbitrage', description: 'Earning yield from funding' },
      { id: 'f6', title: 'Advanced Orders', description: 'TWAP, iceberg, conditional orders' },
    ], comingSoon: true },

  { id: 'options-trading', category: 'trading', icon: '🎯', name: 'Options Trading',
    tagline: 'Defined risk, asymmetric upside',
    description: 'Calls, puts, spreads, Greeks, implied volatility on Deribit and on-chain.',
    difficulty: 'expert', color: '#8b5cf6', estimatedHours: 40, earningPotential: '$2,000–$20,000+/month',
    realWorldOutcomes: ['Trade options on Deribit', 'Understand the Greeks', 'Structure defined-risk trades', 'Sell premium for income'],
    modules: [
      { id: 'o1', title: 'Options Fundamentals', description: 'Calls, puts, strike, expiry, premium' },
      { id: 'o2', title: 'The Greeks', description: 'Delta, gamma, theta, vega' },
      { id: 'o3', title: 'Implied Volatility', description: 'IV crush, IV rank, trading volatility' },
      { id: 'o4', title: 'Basic Strategies', description: 'Covered calls, cash-secured puts, spreads' },
      { id: 'o5', title: 'Advanced Strategies', description: 'Straddles, condors, butterflies' },
      { id: 'o6', title: 'On-chain Options', description: 'Dopex, Lyra, Panoptic' },
    ], comingSoon: true },

  { id: 'quant-trading', category: 'trading', icon: '🤖', name: 'Quant Trading',
    tagline: 'Let data and code do the trading',
    description: 'Systematic, data-driven strategies. Backtesting, statistical edge, algorithmic execution.',
    difficulty: 'expert', color: '#0f3460', estimatedHours: 60, earningPotential: '$5,000–$100,000+/month',
    realWorldOutcomes: ['Design and backtest strategies', 'Build automated trading systems', 'Find statistical market edges', 'Work at a crypto prop firm'],
    modules: [
      { id: 'qt1', title: 'Quant Foundations', description: 'Statistics, probability, time series' },
      { id: 'qt2', title: 'Strategy Design', description: 'Hypothesis → signal → backtest pipeline' },
      { id: 'qt3', title: 'Backtesting', description: 'Avoiding overfitting, walk-forward testing' },
      { id: 'qt4', title: 'Statistical Arbitrage', description: 'Pairs trading, mean reversion' },
      { id: 'qt5', title: 'Execution Systems', description: 'Order management, slippage, latency' },
      { id: 'qt6', title: 'Live Deployment', description: 'Risk management, monitoring, kill switches' },
    ], comingSoon: true },

  { id: 'arbitrage-mev', category: 'trading', icon: '⚙️', name: 'Arbitrage & MEV',
    tagline: 'Extract value from market inefficiencies',
    description: 'DEX arb, sandwich attacks, liquidation bots, Jito bundles, Flashbots.',
    difficulty: 'expert', color: '#1a1a2e', estimatedHours: 50, earningPotential: '$10,000–$500,000+/month',
    realWorldOutcomes: ['Build a DEX arbitrage bot', 'Understand and defend against MEV', 'Submit Jito bundles on Solana', 'Compete in the MEV supply chain'],
    modules: [
      { id: 'mev1', title: 'What is MEV?', description: 'Validator extractable value explained' },
      { id: 'mev2', title: 'DEX Arbitrage', description: 'Price discrepancies across DEXs' },
      { id: 'mev3', title: 'Sandwich Attacks', description: 'How they work and how to avoid them' },
      { id: 'mev4', title: 'Liquidation Bots', description: 'Monitoring undercollateralised positions' },
      { id: 'mev5', title: 'Jito Bundles', description: 'Priority and atomic bundles on Solana' },
      { id: 'mev6', title: 'Flashbots', description: 'Private mempools on Ethereum' },
    ], comingSoon: true },

  // ── RESEARCH ──────────────────────────────────────────────────────────────
  { id: 'onchain-analysis', category: 'research', icon: '🔍', name: 'On-Chain Analysis',
    tagline: 'Read the blockchain like a professional',
    description: 'Wallet tracking, smart money identification, Dune Analytics, data → intelligence.',
    difficulty: 'intermediate', color: '#6366f1', estimatedHours: 30, earningPotential: '$2,000–$15,000/month',
    realWorldOutcomes: ['Track smart money wallets', 'Build Dune dashboards', 'Spot accumulation patterns', 'Freelance as an on-chain analyst'],
    modules: [
      { id: 'oc1', title: 'Block Explorer Mastery', description: 'Etherscan, Solscan, reading txs' },
      { id: 'oc2', title: 'Wallet Profiling', description: 'Smart money, whales, insiders' },
      { id: 'oc3', title: 'Dune Analytics', description: 'SQL queries for on-chain data' },
      { id: 'oc4', title: 'Token Flow Analysis', description: 'Following money between wallets' },
      { id: 'oc5', title: 'Exchange Flows', description: 'Inflows, outflows and what they signal' },
      { id: 'oc6', title: 'Reporting & Consulting', description: 'Delivering intelligence to clients' },
    ], comingSoon: true },

  { id: 'token-research', category: 'research', icon: '📋', name: 'Token Research',
    tagline: 'Know what you are buying before you buy it',
    description: 'Tokenomics, team evaluation, vesting, competitive landscape, red flag detection.',
    difficulty: 'intermediate', color: '#3b82f6', estimatedHours: 20, earningPotential: '$1,500–$8,000/month',
    realWorldOutcomes: ['Produce professional research reports', 'Evaluate any project objectively', 'Spot team red flags early', 'Work as a VC researcher'],
    modules: [
      { id: 'tr1', title: 'Tokenomics', description: 'Supply, distribution, inflation, vesting' },
      { id: 'tr2', title: 'Team Analysis', description: 'Doxxed vs anon, track record, VCs' },
      { id: 'tr3', title: 'Competitive Analysis', description: 'Market positioning and moat' },
      { id: 'tr4', title: 'Red Flag Detection', description: 'Common patterns of failing projects' },
      { id: 'tr5', title: 'Writing Reports', description: 'Structure, objectivity, publishing' },
      { id: 'tr6', title: 'VC Evaluation', description: 'How professional investors assess deals' },
    ], comingSoon: true },

  { id: 'defi-research', category: 'research', icon: '⟠', name: 'DeFi Research',
    tagline: 'Understand protocols at a deep level',
    description: 'AMMs, lending, liquid staking, yield aggregators — under the hood.',
    difficulty: 'advanced', color: '#10b981', estimatedHours: 35, earningPotential: '$3,000–$20,000/month',
    realWorldOutcomes: ['Evaluate DeFi protocol risk', 'Find high-yield opportunities early', 'Write published DeFi research', 'Consult on economic design'],
    modules: [
      { id: 'df1', title: 'AMM Mathematics', description: 'x*y=k, concentrated liquidity, curves' },
      { id: 'df2', title: 'Lending Protocols', description: 'Collateral ratios, liquidation cascades' },
      { id: 'df3', title: 'Liquid Staking', description: 'LSTs, restaking, Eigenlayer' },
      { id: 'df4', title: 'Yield Aggregators', description: 'Yearn, Beefy, auto-compounding' },
      { id: 'df5', title: 'Risk Assessment', description: 'Smart contract, economic, governance risk' },
      { id: 'df6', title: 'Alpha Generation', description: 'Turning research into thesis' },
    ], comingSoon: true },

  { id: 'quant-research', category: 'research', icon: '📊', name: 'Quant Research',
    tagline: 'Find edges with data and statistics',
    description: 'Statistical analysis, factor research, alpha signal generation for crypto markets.',
    difficulty: 'expert', color: '#6366f1', estimatedHours: 55, earningPotential: '$8,000–$50,000+/month',
    realWorldOutcomes: ['Build quantitative market models', 'Generate and validate alpha signals', 'Publish institutional-grade research', 'Work at a crypto quant fund'],
    modules: [
      { id: 'qr1', title: 'Statistical Foundations', description: 'Distributions, hypothesis testing' },
      { id: 'qr2', title: 'Time Series Analysis', description: 'Autocorrelation, stationarity, ARIMA' },
      { id: 'qr3', title: 'Factor Models', description: 'Risk premia in crypto markets' },
      { id: 'qr4', title: 'Signal Research', description: 'Hypothesis generation and validation' },
      { id: 'qr5', title: 'Machine Learning', description: 'Feature engineering, model selection' },
      { id: 'qr6', title: 'Research Communication', description: 'Papers and presentations for funds' },
    ], comingSoon: true },

  { id: 'data-analysis', category: 'research', icon: '📉', name: 'Data Analysis',
    tagline: 'Turn raw data into insight',
    description: 'SQL, Python, exchange APIs, on-chain data pipelines and dashboards.',
    difficulty: 'intermediate', color: '#0088cc', estimatedHours: 30, earningPotential: '$2,500–$10,000/month',
    realWorldOutcomes: ['Pull data from any crypto API', 'Build protocol dashboards', 'Freelance as a crypto analyst', 'Work in a data team at an exchange'],
    modules: [
      { id: 'da1', title: 'Python for Crypto', description: 'Pandas, requests, data wrangling' },
      { id: 'da2', title: 'SQL & Dune', description: 'On-chain queries and dashboards' },
      { id: 'da3', title: 'Exchange APIs', description: 'Binance, Coinbase, Jupiter data' },
      { id: 'da4', title: 'Visualisation', description: 'Matplotlib, Plotly, dashboards' },
      { id: 'da5', title: 'On-chain Pipelines', description: 'Indexing, subgraphs, event parsing' },
      { id: 'da6', title: 'Reporting for DAOs', description: 'Treasury analytics, governance metrics' },
    ], comingSoon: true },

  { id: 'data-science', category: 'research', icon: '🧬', name: 'Data Science',
    tagline: 'Predictive models for crypto markets',
    description: 'ML, NLP for sentiment, anomaly detection, wallet behaviour clustering.',
    difficulty: 'advanced', color: '#9945ff', estimatedHours: 50, earningPotential: '$5,000–$25,000/month',
    realWorldOutcomes: ['Build ML models for market analysis', 'Apply NLP to crypto sentiment', 'Cluster wallet behaviour patterns', 'Work as a data scientist at a crypto firm'],
    modules: [
      { id: 'ds1', title: 'ML Foundations', description: 'Supervised, unsupervised, RL' },
      { id: 'ds2', title: 'Price Prediction', description: 'Why it is hard and how to do it right' },
      { id: 'ds3', title: 'NLP & Sentiment', description: 'CT, news, and social signals' },
      { id: 'ds4', title: 'Wallet Clustering', description: 'K-means, DBSCAN on-chain' },
      { id: 'ds5', title: 'Anomaly Detection', description: 'Wash trading, bot activity, rugs' },
      { id: 'ds6', title: 'Model Deployment', description: 'Real-time crypto use cases' },
    ], comingSoon: true },

  { id: 'computational-science', category: 'research', icon: '🧮', name: 'Computational Science',
    tagline: 'Where cryptography meets computation',
    description: 'ZK proofs, cryptographic primitives, consensus mechanisms, blockchain foundations.',
    difficulty: 'expert', color: '#1a1a2e', estimatedHours: 70, earningPotential: '$15,000–$100,000+/month',
    realWorldOutcomes: ['Understand ZK proofs at implementation level', 'Contribute to cryptographic research', 'Work at a ZK company (Aztec, StarkWare)', 'Design consensus mechanisms'],
    modules: [
      { id: 'cs1', title: 'Cryptography Foundations', description: 'Hash functions, elliptic curves, signatures' },
      { id: 'cs2', title: 'Zero-Knowledge Proofs', description: 'SNARKs, STARKs, proof systems' },
      { id: 'cs3', title: 'Consensus Mechanisms', description: 'PoW, PoS, PoH, BFT variants' },
      { id: 'cs4', title: 'Formal Verification', description: 'Proving contracts correct mathematically' },
      { id: 'cs5', title: 'P2P Networking', description: 'Libp2p, gossip protocols, nodes' },
      { id: 'cs6', title: 'Research & Publication', description: 'Contributing to protocol research' },
    ], comingSoon: true },

  // ── BUILDING ──────────────────────────────────────────────────────────────
  { id: 'smart-contract-dev', category: 'building', icon: '📝', name: 'Smart Contract Dev',
    tagline: 'Write the code that holds real money',
    description: 'Solidity and Rust. Write, test, deploy, and secure contracts on Ethereum and Solana.',
    difficulty: 'advanced', color: '#10b981', estimatedHours: 60, earningPotential: '$8,000–$40,000+/month',
    realWorldOutcomes: ['Deploy contracts on Ethereum, Base, Solana', 'Write ERC-20, ERC-721, DeFi contracts', 'Test with Hardhat/Foundry', 'Freelance or join a protocol'],
    modules: [
      { id: 'sc1', title: 'Solidity Fundamentals', description: 'Types, functions, state, events' },
      { id: 'sc2', title: 'ERC Standards', description: 'ERC-20, ERC-721, ERC-1155, ERC-4626' },
      { id: 'sc3', title: 'DeFi Patterns', description: 'AMMs, lending, vaults from scratch' },
      { id: 'sc4', title: 'Testing & Deployment', description: 'Hardhat, Foundry, mainnet forks' },
      { id: 'sc5', title: 'Rust for Solana', description: 'Anchor framework, SPL tokens' },
      { id: 'sc6', title: 'Security Basics', description: 'Reentrancy, overflow, access control' },
    ], comingSoon: true },

  { id: 'dapp-development', category: 'building', icon: '🌐', name: 'dApp Development',
    tagline: 'Build the front end of Web3',
    description: 'Connect wallets, read contracts, build DeFi UIs in React and React Native.',
    difficulty: 'intermediate', color: '#3b82f6', estimatedHours: 40, earningPotential: '$5,000–$25,000/month',
    realWorldOutcomes: ['Build and deploy a working dApp', 'Connect MetaMask, Phantom, WalletConnect', 'Read and write contract state', 'Freelance as a Web3 frontend dev'],
    modules: [
      { id: 'dp1', title: 'Wallet Connection', description: 'WalletConnect, RainbowKit, Solana Adapter' },
      { id: 'dp2', title: 'Reading the Chain', description: 'ethers.js, viem, web3.js' },
      { id: 'dp3', title: 'Writing Transactions', description: 'Signing, sending, receipts' },
      { id: 'dp4', title: 'The Graph & Indexers', description: 'Querying historical chain data' },
      { id: 'dp5', title: 'Building DeFi UIs', description: 'Swap, stake, borrow interfaces' },
      { id: 'dp6', title: 'Deployment', description: 'IPFS, Vercel, decentralised hosting' },
    ], comingSoon: true },

  { id: 'bot-development', category: 'building', icon: '🦾', name: 'Bot Development',
    tagline: 'Automate the profitable parts of crypto',
    description: 'Trading bots, sniper bots, arb bots, Telegram bots — Python and TypeScript.',
    difficulty: 'advanced', color: '#f59e0b', estimatedHours: 45, earningPotential: '$3,000–$100,000+/month',
    realWorldOutcomes: ['Build and deploy a live trading bot', 'Create Telegram signal bots', 'Run automated DEX arbitrage', 'Sell bot subscriptions'],
    modules: [
      { id: 'bt1', title: 'Bot Architecture', description: 'Event loops, WebSockets, API polling' },
      { id: 'bt2', title: 'Solana Bot Basics', description: 'RPC, keypairs, signing in JS/Python' },
      { id: 'bt3', title: 'Sniper Bots', description: 'Mempool monitoring, fast execution' },
      { id: 'bt4', title: 'Telegram Bots', description: 'Signal bots, copy-trade alerts' },
      { id: 'bt5', title: 'Arbitrage Bots', description: 'DEX price monitoring and execution' },
      { id: 'bt6', title: 'Safety Systems', description: 'Kill switches, position limits' },
    ], comingSoon: true },

  { id: 'quant-developer', category: 'building', icon: '⚙️', name: 'Quant Developer',
    tagline: 'Build the infrastructure quants run on',
    description: 'High-performance trading systems, low-latency execution, backtesting engines.',
    difficulty: 'expert', color: '#0f3460', estimatedHours: 70, earningPotential: '$10,000–$60,000+/month',
    realWorldOutcomes: ['Build institutional trading infrastructure', 'Develop backtesting engines', 'Work at a crypto quant fund', 'Freelance for prop firms'],
    modules: [
      { id: 'qd1', title: 'High-Performance Python', description: 'Asyncio, Cython, Numpy, vectorisation' },
      { id: 'qd2', title: 'Data Infrastructure', description: 'Time series DBs, tick data, OHLCV' },
      { id: 'qd3', title: 'Backtesting Engines', description: 'Event-driven, realistic simulation' },
      { id: 'qd4', title: 'Low-Latency Execution', description: 'WebSocket, FIX protocol basics' },
      { id: 'qd5', title: 'Risk Systems', description: 'Real-time P&L, drawdown controls' },
      { id: 'qd6', title: 'System Reliability', description: 'Monitoring, alerting, failover' },
    ], comingSoon: true },

  { id: 'vibe-coding', category: 'building', icon: '✨', name: 'Vibe Coding',
    tagline: 'Build crypto tools without deep coding',
    description: 'AI tools, no-code platforms, and simple scripts to build useful crypto products fast.',
    difficulty: 'beginner', color: '#a855f7', estimatedHours: 15, earningPotential: '$500–$5,000/month',
    realWorldOutcomes: ['Deploy tokens without writing Solidity', 'Build crypto trackers with no-code', 'Create and sell simple tools', 'Use AI to build functional dApps'],
    modules: [
      { id: 'vc1', title: 'AI-Assisted Development', description: 'Using Claude/GPT to build fast' },
      { id: 'vc2', title: 'No-Code Token Launch', description: 'Tokens and NFTs without Solidity' },
      { id: 'vc3', title: 'Automation Tools', description: 'Zapier and Make for crypto workflows' },
      { id: 'vc4', title: 'Simple Python Scripts', description: 'Price alerts, portfolio trackers' },
      { id: 'vc5', title: 'No-Code Web3 Apps', description: 'Building dashboards visually' },
      { id: 'vc6', title: 'Selling Your Tools', description: 'Gumroad, subscriptions, communities' },
    ], comingSoon: true },

  // ── EARNING ───────────────────────────────────────────────────────────────
  { id: 'airdrop-farming', category: 'earning', icon: '🪂', name: 'Airdrop Farming',
    tagline: 'Earn free crypto by using protocols early',
    description: 'Identify high-probability airdrops, qualify systematically, avoid sybil detection.',
    difficulty: 'intermediate', color: '#8b5cf6', estimatedHours: 20, earningPotential: '$500–$50,000+ per cycle',
    realWorldOutcomes: ['Qualify for major protocol airdrops', 'Manage a multi-wallet operation safely', 'Estimate reward probability', 'Avoid disqualification'],
    modules: [
      { id: 'af1', title: 'Airdrop Types', description: 'Retroactive, announced, points-based' },
      { id: 'af2', title: 'Qualifying Activities', description: 'What interactions actually count' },
      { id: 'af3', title: 'Multi-Wallet Strategy', description: 'Managing wallets safely' },
      { id: 'af4', title: 'Sybil Avoidance', description: 'How protocols detect farmers' },
      { id: 'af5', title: 'Allocation Estimation', description: 'Estimating potential reward size' },
      { id: 'af6', title: 'Selling Airdrops', description: 'When to sell, market impact, tax' },
    ], comingSoon: true },

  { id: 'defi-yield', category: 'earning', icon: '🌾', name: 'Yield Farming',
    tagline: 'Put your crypto to work',
    description: 'Liquidity provision, lending, yield aggregators, staking, IL management.',
    difficulty: 'intermediate', color: '#10b981', estimatedHours: 25, earningPotential: '5–200% APY',
    realWorldOutcomes: ['Earn sustainable yield on holdings', 'Manage LP positions profitably', 'Compare DeFi opportunities objectively', 'Avoid common DeFi traps'],
    modules: [
      { id: 'dy1', title: 'Lending for Yield', description: 'Aave, Compound, rate dynamics' },
      { id: 'dy2', title: 'Liquidity Provision', description: 'AMM LPing, fee income, IL' },
      { id: 'dy3', title: 'Concentrated Liquidity', description: 'Uniswap v3, Orca, tick ranges' },
      { id: 'dy4', title: 'Yield Aggregators', description: 'Auto-compounding vault strategies' },
      { id: 'dy5', title: 'Liquid Staking', description: 'stETH, mSOL, restaking' },
      { id: 'dy6', title: 'Risk Management', description: 'Protocol risk, de-peg, exit strategies' },
    ], comingSoon: true },

  { id: 'bounty-hunting', category: 'earning', icon: '🎯', name: 'Bounty Hunting',
    tagline: 'Get paid to find bugs in smart contracts',
    description: 'Security research on Immunefi and Code4rena. $10k–$1M+ rewards.',
    difficulty: 'expert', color: '#ef4444', estimatedHours: 80, earningPotential: '$10,000–$1,000,000+ per bug',
    realWorldOutcomes: ['Find and report smart contract vulnerabilities', 'Submit on Immunefi and Code4rena', 'Build a security research reputation', 'Earn largest bug bounties in any industry'],
    modules: [
      { id: 'bh1', title: 'Smart Contract Vulnerabilities', description: 'Reentrancy, flash loans, oracle manipulation' },
      { id: 'bh2', title: 'Reading Audit Reports', description: 'Learn from how pros found past bugs' },
      { id: 'bh3', title: 'Fuzzing & Testing', description: 'Echidna, Foundry fuzzing' },
      { id: 'bh4', title: 'Immunefi Workflow', description: 'Scope, submission, triage, payout' },
      { id: 'bh5', title: 'Code4rena Contests', description: 'Audit contests and wardens community' },
      { id: 'bh6', title: 'Report Writing', description: 'Writing reports that get paid' },
    ], comingSoon: true },

  { id: 'contract-auditing', category: 'earning', icon: '🔒', name: 'Smart Contract Auditing',
    tagline: 'Professional security review for protocols',
    description: 'Conduct formal security audits. Deliver reports protocols rely on before launch.',
    difficulty: 'expert', color: '#1a1a2e', estimatedHours: 100, earningPotential: '$15,000–$100,000+/audit',
    realWorldOutcomes: ['Conduct independent security audits', 'Join a firm (Trail of Bits, OZ, Spearbit)', 'Build a solo auditing practice', 'Command premium specialist rates'],
    modules: [
      { id: 'ca1', title: 'Audit Methodology', description: 'Systematic approach to reviewing code' },
      { id: 'ca2', title: 'Vulnerability Classes', description: 'All major smart contract bug types' },
      { id: 'ca3', title: 'Static Analysis', description: 'Slither, Mythril, Aderyn' },
      { id: 'ca4', title: 'Manual Review', description: 'Call graph analysis, invariant checking' },
      { id: 'ca5', title: 'Formal Verification', description: 'Mathematical proof of correctness' },
      { id: 'ca6', title: 'Audit Reports', description: 'Professional report structure and severity' },
    ], comingSoon: true },

  // ── CONTENT ───────────────────────────────────────────────────────────────
  { id: 'content-creation', category: 'content', icon: '🎙️', name: 'Crypto Content Creation',
    tagline: 'Build an audience and monetise your knowledge',
    description: 'X threads, YouTube, TikTok, newsletters. Grow, establish authority, monetise.',
    difficulty: 'beginner', color: '#ef4444', estimatedHours: 20, earningPotential: '$500–$50,000+/month',
    realWorldOutcomes: ['Grow a crypto audience on X/YouTube/TikTok', 'Write viral threads and newsletters', 'Monetise via sponsorships and products', 'Get hired as a KOL by protocols'],
    modules: [
      { id: 'cc1', title: 'Finding Your Niche', description: 'What to cover, who you are for' },
      { id: 'cc2', title: 'Thread Writing', description: 'Structure of viral crypto threads' },
      { id: 'cc3', title: 'Video Content', description: 'YouTube/TikTok scripts, recording, editing' },
      { id: 'cc4', title: 'Newsletter Building', description: 'Substack, Paragraph, subscribers' },
      { id: 'cc5', title: 'Growing Your Audience', description: 'Consistency, engagement, collabs' },
      { id: 'cc6', title: 'Monetisation', description: 'Sponsorships, affiliates, products' },
    ], comingSoon: true },

  { id: 'community-management', category: 'content', icon: '💬', name: 'Community Management',
    tagline: 'Run and grow crypto communities professionally',
    description: 'Discord and Telegram moderation, scam detection, growth, and getting paid.',
    difficulty: 'beginner', color: '#5865f2', estimatedHours: 15, earningPotential: '$1,500–$8,000/month',
    realWorldOutcomes: ['Manage Discord or Telegram for a protocol', 'Detect and handle scammers', 'Design community engagement programmes', 'Get hired as a full-time community manager'],
    modules: [
      { id: 'cm1', title: 'Discord Mastery', description: 'Roles, bots, channels, moderation' },
      { id: 'cm2', title: 'Scam Detection', description: 'Common attacks and live response' },
      { id: 'cm3', title: 'Community Growth', description: 'Onboarding, retention, ambassadors' },
      { id: 'cm4', title: 'Engagement Programmes', description: 'Contests, AMAs, quest systems' },
      { id: 'cm5', title: 'Crisis Management', description: 'Hacks, FUD, crisis comms' },
      { id: 'cm6', title: 'Getting Hired', description: 'Portfolio, trial tasks, rates' },
    ], comingSoon: true },

  // ── PROFESSIONAL ──────────────────────────────────────────────────────────
  { id: 'dao-governance', category: 'professional', icon: '🏛️', name: 'DAO Governance',
    tagline: 'Participate in and shape decentralised organisations',
    description: 'Voting mechanisms, proposal writing, delegate strategy, earning from governance.',
    difficulty: 'intermediate', color: '#8b5cf6', estimatedHours: 20, earningPotential: '$1,000–$10,000/month',
    realWorldOutcomes: ['Write and pass governance proposals', 'Become a paid DAO delegate', 'Advise on governance architecture', 'Manage DAO treasury strategy'],
    modules: [
      { id: 'dg1', title: 'DAO Structures', description: 'Multisig, token voting, optimistic' },
      { id: 'dg2', title: 'Proposal Writing', description: 'How to write proposals that pass' },
      { id: 'dg3', title: 'Delegate Strategy', description: 'Building a delegate brand' },
      { id: 'dg4', title: 'Treasury Management', description: 'Diversification, runway, risk' },
      { id: 'dg5', title: 'Governance Attacks', description: 'Takeovers, vote buying, defence' },
      { id: 'dg6', title: 'Getting Compensated', description: 'Delegate programs, contributor paths' },
    ], comingSoon: true },

  { id: 'crypto-accounting', category: 'professional', icon: '🧾', name: 'Crypto Accounting & Tax',
    tagline: 'Keep more of what you earn',
    description: 'Cost basis, short/long term gains, DeFi tax treatment, jurisdiction rules.',
    difficulty: 'intermediate', color: '#f59e0b', estimatedHours: 20, earningPotential: '$2,000–$15,000/month (advisory)',
    realWorldOutcomes: ['Manage your own crypto tax liability', 'Advise other traders on tax strategy', 'Use Koinly, TokenTax, and CoinTracker', 'Understand DeFi and NFT tax treatment'],
    modules: [
      { id: 'ac1', title: 'Cost Basis Methods', description: 'FIFO, LIFO, HIFO explained' },
      { id: 'ac2', title: 'Capital Gains', description: 'Short-term vs long-term treatment' },
      { id: 'ac3', title: 'DeFi Tax Treatment', description: 'Swaps, LP, staking, airdrops' },
      { id: 'ac4', title: 'NFT & GameFi Tax', description: 'Minting, trading, P2E income' },
      { id: 'ac5', title: 'Crypto Tax Tools', description: 'Koinly, TokenTax, CoinTracker' },
      { id: 'ac6', title: 'Tax-Loss Harvesting', description: 'Reducing liability legally' },
    ], comingSoon: true },

  { id: 'web3-marketing', category: 'professional', icon: '📣', name: 'Web3 Marketing & Growth',
    tagline: 'Grow crypto projects from zero',
    description: 'Go-to-market strategy, community building, tokenomics for growth, KOL campaigns.',
    difficulty: 'intermediate', color: '#f97316', estimatedHours: 25, earningPotential: '$3,000–$20,000/month',
    realWorldOutcomes: ['Run go-to-market for a protocol launch', 'Design community growth strategies', 'Manage KOL and ambassador campaigns', 'Work as a growth lead at a crypto project'],
    modules: [
      { id: 'wm1', title: 'GTM Strategy', description: 'Protocol launches and community seeding' },
      { id: 'wm2', title: 'Community Growth', description: 'Discord, Twitter, Telegram funnels' },
      { id: 'wm3', title: 'KOL Campaigns', description: 'Finding, briefing, and measuring KOLs' },
      { id: 'wm4', title: 'Tokenomics for Growth', description: 'Incentive design and airdrops' },
      { id: 'wm5', title: 'Analytics', description: 'On-chain and off-chain growth metrics' },
      { id: 'wm6', title: 'Crisis Communications', description: 'Managing hacks and FUD publicly' },
    ], comingSoon: true },

  { id: 'crypto-compliance', category: 'professional', icon: '⚖️', name: 'Compliance & Regulation',
    tagline: 'Navigate the legal landscape of crypto',
    description: 'KYC/AML, MiCA, FinCEN, MSB licensing, securities law basics for crypto.',
    difficulty: 'advanced', color: '#374151', estimatedHours: 35, earningPotential: '$5,000–$30,000/month',
    realWorldOutcomes: ['Advise projects on regulatory compliance', 'Implement KYC/AML programmes', 'Navigate MiCA and US securities law', 'Work in compliance at an exchange'],
    modules: [
      { id: 'cr1', title: 'Crypto Regulatory Landscape', description: 'Global overview — US, EU, Asia' },
      { id: 'cr2', title: 'KYC & AML', description: 'Programmes, tools, and obligations' },
      { id: 'cr3', title: 'MiCA (EU)', description: 'Markets in Crypto-Assets regulation' },
      { id: 'cr4', title: 'US Securities Law', description: 'Howey test, SEC positions, safe harbours' },
      { id: 'cr5', title: 'MSB Licensing', description: 'FinCEN registration and obligations' },
      { id: 'cr6', title: 'DeFi Compliance', description: 'Grey areas and emerging frameworks' },
    ], comingSoon: true },

  { id: 'nft-creation', category: 'professional', icon: '🖼️', name: 'NFT Creation',
    tagline: 'Build and launch your own NFT collection',
    description: 'Collection design, rarity engineering, minting contracts, marketplace strategy.',
    difficulty: 'intermediate', color: '#3b82f6', estimatedHours: 30, earningPotential: '$1,000–$500,000+ (collection-dependent)',
    realWorldOutcomes: ['Launch an NFT collection on Ethereum or Solana', 'Design rarity and trait systems', 'Build community before and after launch', 'Earn from royalties and secondary sales'],
    modules: [
      { id: 'nf1', title: 'Collection Concept', description: 'Niche, identity, and story' },
      { id: 'nf2', title: 'Rarity Engineering', description: 'Trait design and distribution' },
      { id: 'nf3', title: 'Smart Contract Setup', description: 'ERC-721, Metaplex on Solana' },
      { id: 'nf4', title: 'Metadata & IPFS', description: 'Storing art and attributes on-chain' },
      { id: 'nf5', title: 'Launch Strategy', description: 'Allowlists, phases, pricing' },
      { id: 'nf6', title: 'Secondary Market', description: 'OpenSea, Magic Eden, royalties' },
    ], comingSoon: true },
];
