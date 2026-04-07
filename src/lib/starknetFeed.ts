/**
 * Sifter Skill_Up — Starknet Feed Config
 * NEW FILE: src/lib/starknetFeed.ts
 *
 * All Twitter/X accounts and news sources relevant to Starknet.
 * Used by FeedScreen when user is on the Starknet field/track.
 * Also used by the backend (feed_routes.py) for RSS ingestion.
 */

export interface StarknetTwitterAccount {
  handle:      string;
  displayName: string;
  category:    'core' | 'defi' | 'wallet' | 'tooling' | 'community' | 'research';
  description: string;
  url:         string;
  priority:    1 | 2 | 3;   // 1 = must-follow, 2 = recommended, 3 = optional
}

export const STARKNET_TWITTER_ACCOUNTS: StarknetTwitterAccount[] = [
  // ── Core Protocol ─────────────────────────────────────────
  { handle: 'Starknet',       displayName: 'Starknet',            category: 'core',      description: 'Official Starknet network account. Protocol updates, governance, ecosystem news.', url: 'https://twitter.com/Starknet',       priority: 1 },
  { handle: 'StarkWareLtd',   displayName: 'StarkWare',           category: 'core',      description: 'The team that built STARK proofs and Cairo. ZK research and Starknet core updates.', url: 'https://twitter.com/StarkWareLtd',   priority: 1 },
  { handle: 'StarknetFndn',   displayName: 'Starknet Foundation', category: 'core',      description: 'Ecosystem grants, community programs, governance proposals.', url: 'https://twitter.com/StarknetFndn',   priority: 1 },
  { handle: 'eli5_stark',     displayName: 'Eli Ben-Sasson',      category: 'core',      description: 'StarkWare co-founder. Deep ZK math and the long-term vision for verifiable computation.', url: 'https://twitter.com/eli5_stark',     priority: 1 },
  { handle: 'uriklarman',     displayName: 'Uri Kolodny',         category: 'core',      description: 'StarkWare CEO. Business strategy, ecosystem partnerships.', url: 'https://twitter.com/uriklarman',     priority: 2 },

  // ── DeFi Protocols ────────────────────────────────────────
  { handle: 'EkuboProtocol',  displayName: 'Ekubo Protocol',      category: 'defi',      description: 'Concentrated liquidity DEX on Starknet. Pool data, governance, new pairs.', url: 'https://twitter.com/EkuboProtocol',  priority: 1 },
  { handle: 'avnu_fi',        displayName: 'AVNU',                 category: 'defi',      description: 'DEX aggregator — routes swaps across Ekubo, Haiko, and other Starknet DEXs.', url: 'https://twitter.com/avnu_fi',        priority: 1 },
  { handle: 'VesuFinance',    displayName: 'Vesu Finance',         category: 'defi',      description: 'Lending and borrowing on Starknet. APY updates, new markets, liquidations.', url: 'https://twitter.com/VesuFinance',    priority: 1 },
  { handle: 'nostrafinance',  displayName: 'Nostra',               category: 'defi',      description: 'Money market protocol on Starknet. Lending, leveraged yield, and nimbora.', url: 'https://twitter.com/nostrafinance',  priority: 1 },
  { handle: 'HaikoFinance',   displayName: 'Haiko Finance',        category: 'defi',      description: 'Automated market maker focused on Starknet liquidity efficiency.', url: 'https://twitter.com/HaikoFinance',   priority: 2 },
  { handle: 'zkLend',         displayName: 'zkLend',               category: 'defi',      description: 'Permissionless money market on Starknet with undercollateralised loans.', url: 'https://twitter.com/zkLend',         priority: 2 },
  { handle: 'MySwap_xyz',     displayName: 'mySwap',               category: 'defi',      description: 'Classic AMM on Starknet. Simpler swap interface for beginners.', url: 'https://twitter.com/MySwap_xyz',     priority: 3 },

  // ── Wallets ───────────────────────────────────────────────
  { handle: 'argentHQ',       displayName: 'Argent',               category: 'wallet',    description: 'Smart wallet for Starknet with account abstraction, guardian recovery, and biometric auth.', url: 'https://twitter.com/argentHQ',       priority: 1 },
  { handle: 'Braavos_wallet', displayName: 'Braavos',              category: 'wallet',    description: 'Hardware signer wallet on Starknet. Native account abstraction with biometric signing.', url: 'https://twitter.com/Braavos_wallet', priority: 1 },
  { handle: 'CartridgeGG',    displayName: 'Cartridge',            category: 'wallet',    description: 'Gaming-focused controller wallet. Keychain for on-chain games on Starknet.', url: 'https://twitter.com/CartridgeGG',    priority: 2 },

  // ── Tooling & Infrastructure ──────────────────────────────
  { handle: 'NethermindEth',  displayName: 'Nethermind',           category: 'tooling',   description: 'Juno full node client for Starknet. Also builds Papyrus and Cairo tooling.', url: 'https://twitter.com/NethermindEth',  priority: 1 },
  { handle: 'PragmaOracle',   displayName: 'Pragma Oracle',        category: 'tooling',   description: 'Native oracle on Starknet. Price feeds for DeFi protocols.', url: 'https://twitter.com/PragmaOracle',   priority: 2 },
  { handle: 'starknet_id',    displayName: 'Starknet ID',          category: 'tooling',   description: 'On-chain identity and naming system. .stark domain names.', url: 'https://twitter.com/starknet_id',    priority: 2 },
  { handle: 'StarkzapHQ',     displayName: 'StarkZap',             category: 'tooling',   description: 'SDK powering Sifter Skill_Up Starknet lessons. Account abstraction made easy.', url: 'https://twitter.com/StarkzapHQ',     priority: 1 },
  { handle: 'Voyager_online', displayName: 'Voyager Explorer',     category: 'tooling',   description: 'Block explorer for Starknet mainnet and Sepolia. Tx tracking, contract verification.', url: 'https://twitter.com/Voyager_online', priority: 2 },

  // ── Research & Community ──────────────────────────────────
  { handle: 'StarknetEco',    displayName: 'Starknet Ecosystem',   category: 'community', description: 'Ecosystem news aggregator. Project launches, grant recipients, events.', url: 'https://twitter.com/StarknetEco',    priority: 2 },
  { handle: 'Starknet_OG',    displayName: 'Starknet OGs',         category: 'community', description: 'Community news, STRK price discussion, protocol comparisons.', url: 'https://twitter.com/Starknet_OG',    priority: 3 },
  { handle: 'l2beat',         displayName: 'L2BEAT',               category: 'research',  description: 'Independent L2 research. TVL data, risk scores, upgrade analysis across all L2s.', url: 'https://twitter.com/l2beat',         priority: 1 },
  { handle: '0xAbdelhakim',   displayName: 'Abdelhakim Senhaji',   category: 'research',  description: 'Cairo developer and Starknet ecosystem contributor. In-depth technical threads.', url: 'https://twitter.com/0xAbdelhakim',   priority: 3 },
];

// ── News sources for feed ingestion ───────────────────────────

export interface StarknetNewsSource {
  name:     string;
  url:      string;
  rssUrl:   string | null;
  category: string;
  priority: 1 | 2 | 3;
}

export const STARKNET_NEWS_SOURCES: StarknetNewsSource[] = [
  { name: 'Starknet Blog',       url: 'https://starknet.io/blog',    rssUrl: 'https://starknet.io/rss.xml',                  category: 'official',  priority: 1 },
  { name: 'StarkWare Blog',      url: 'https://starkware.co/blog',   rssUrl: 'https://starkware.co/feed',                    category: 'official',  priority: 1 },
  { name: 'L2BEAT Research',     url: 'https://l2beat.com',          rssUrl: null,                                           category: 'research',  priority: 1 },
  { name: 'DeFiLlama Starknet',  url: 'https://defillama.com/chain/Starknet', rssUrl: null,                                  category: 'data',      priority: 1 },
  { name: 'The Defiant',         url: 'https://thedefiant.io',       rssUrl: 'https://thedefiant.io/feed',                   category: 'news',      priority: 2 },
  { name: 'Bankless',            url: 'https://bankless.com',        rssUrl: 'https://bankless.com/feed',                    category: 'news',      priority: 2 },
  { name: 'Decrypt',             url: 'https://decrypt.co',          rssUrl: 'https://decrypt.co/feed',                     category: 'news',      priority: 2 },
  { name: 'Starknet Discourse',  url: 'https://community.starknet.io', rssUrl: 'https://community.starknet.io/posts.rss',  category: 'governance',priority: 2 },
  { name: 'Voyager (Sepolia TXs)', url: 'https://sepolia.voyager.online', rssUrl: null,                                      category: 'data',      priority: 3 },
];

// ── Feed config object for trackFeedConfig.ts ─────────────────

export const STARKNET_TRACK_FEED_CONFIG = {
  trackIds: ['starknet-islands', 'starknet-defi-navigator'],
  fieldId:  'starknet',
  twitterAccounts: STARKNET_TWITTER_ACCOUNTS
    .filter(a => a.priority <= 2)
    .map(a => a.handle),
  newsSources: STARKNET_NEWS_SOURCES
    .filter(s => s.rssUrl && s.priority <= 2)
    .map(s => ({ name: s.name, rssUrl: s.rssUrl!, category: s.category })),
  refreshIntervalMinutes: 60,
  maxItemsPerSource: 10,
  highlightedAccounts: ['Starknet', 'StarkWareLtd', 'EkuboProtocol', 'avnu_fi', 'VesuFinance'],
};
