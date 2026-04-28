/**
 * Sifter Skill_Up — Island Definitions (19 islands)
 * REPLACES: src/data/islands.ts
 *
 * New numbering per README:
 *   I11 = Base Ecosystem (was I12)
 *   I12 = TON & Telegram (was I13)
 *   I13 = Coinbase Deep Dive (was I15)
 *   I14 = Final Frontier (was I16)
 *   I15 = Alt-Chain Ecosystems (was I14)
 *   I16 = Security & Research (was I17)
 *   I17 = Advanced Crypto (was I18)
 *   I18 = Starknet Islands (was I19) — unlocks after I17 (L135)
 * Old Island 11 (Memecoin Madness) DELETED — merged into I9
 */

export type Tier = 'beginner' | 'intermediate' | 'pro';

export interface Island {
  id: number;
  tier: Tier;
  name: string;
  description: string;
  icon: string;
  color: string;
  start: number;
  end: number;
  bossLevel: number;
  requiredLevel: number;
  /** Track IDs unlocked after completing this island */
  nextTracks?: string[];
  /** testnet chain for simulator wallet */
  chain?: string;
}

export const ISLANDS: Island[] = [
  {
    id: 1, tier: 'beginner', name: 'Bitcoin Bay',
    description: 'Start your journey with the OG — Bitcoin, wallets, keys, and why crypto exists.',
    icon: '₿', color: '#f7931a', start: 1, end: 15, bossLevel: 15, requiredLevel: 0,
    chain: 'bitcoin-testnet4',
  },
  {
    id: 2, tier: 'beginner', name: 'Ethereum Essentials',
    description: 'Hot wallets, cold wallets, seed phrases, hardware wallets — securing your crypto.',
    icon: '👛', color: '#10b981', start: 16, end: 30, bossLevel: 30, requiredLevel: 15,
    chain: 'ethereum-sepolia',
  },
  {
    id: 3, tier: 'beginner', name: 'Wallet & Security',
    description: 'Phishing, rug pulls, fake projects — learn to recognise every type of crypto scam.',
    icon: '🦈', color: '#ef4444', start: 31, end: 45, bossLevel: 45, requiredLevel: 30,
    chain: 'ethereum-sepolia',
  },
  {
    id: 4, tier: 'intermediate', name: 'DeFi Universe',
    description: 'Smart contracts, gas, DApps, ERC-20 tokens — how Ethereum actually works.',
    icon: '⟠', color: '#627eea', start: 46, end: 60, bossLevel: 60, requiredLevel: 45,
    chain: 'ethereum-sepolia',
  },
  {
    id: 5, tier: 'intermediate', name: 'BNB Chain',
    description: 'PancakeSwap · Launchpool · Binance Alpha · Binance Earn · BSC DeFi · BNB Staking · Memecoins · Risks',
    icon: '🟡', color: '#f0b90b', start: 241, end: 255, bossLevel: 255, requiredLevel: 60,
    chain: 'bnb-testnet',
  },
  {
    id: 6, tier: 'intermediate', name: 'Solana Deep Dive',
    description: 'Proof of History · SPL tokens · pump.fun · Raydium · Jupiter · NFTs · Liquid staking · Firedancer · Trade-offs vs Ethereum',
    icon: '◎', color: '#9945ff', start: 256, end: 270, bossLevel: 270, requiredLevel: 60,
    chain: 'solana-devnet',
  },
  {
    id: 7, tier: 'intermediate', name: 'NFT World',
    description: 'Minting, marketplaces, royalties, OpenSea, Magic Eden — the complete NFT picture.',
    icon: '🖼️', color: '#3b82f6', start: 61, end: 75, bossLevel: 75, requiredLevel: 60,
    chain: 'ethereum-sepolia',
  },
  {
    id: 8, tier: 'intermediate', name: 'Bridges & L2s',
    description: 'Layer 2s, bridges, cross-chain swaps — how to move between blockchains safely.',
    icon: '🌉', color: '#8b5cf6', start: 76, end: 90, bossLevel: 90, requiredLevel: 75,
    chain: 'arbitrum-sepolia',
  },
  {
    id: 9, tier: 'pro', name: 'Memecoin Markets',
    description: 'Market cap · FDV · LP locks · bonding curves · rug detection · DEXScreener · pump.fun — navigate the wild west safely.',
    icon: '🐸', color: '#06b6d4', start: 91, end: 105, bossLevel: 105, requiredLevel: 90,
    chain: 'solana-devnet',
  },
  {
    id: 10, tier: 'pro', name: 'Airdrop Archipelago',
    description: 'Free crypto for early users — how protocols give back, how to qualify, and how not to get caught.',
    icon: '🪂', color: '#8b5cf6', start: 106, end: 120, bossLevel: 120, requiredLevel: 105,
    chain: 'arbitrum-sepolia',
  },
  {
    id: 11, tier: 'pro', name: 'Base Ecosystem',
    description: 'Coinbase\'s L2 · cbBTC · Aerodrome · AgentKit · Base Meme culture · Smart Wallets · Paymaster',
    icon: '🔵', color: '#0052ff', start: 151, end: 165, bossLevel: 165, requiredLevel: 120,
    chain: 'base-sepolia',
  },
  {
    id: 12, tier: 'pro', name: 'TON & Telegram',
    description: '900M potential users via Telegram — TON Space, Mini Apps, Fragment, play-to-airdrop.',
    icon: '💎', color: '#0088cc', start: 166, end: 180, bossLevel: 180, requiredLevel: 165,
    chain: 'ton-testnet',
  },
  {
    id: 13, tier: 'pro', name: 'Coinbase Deep Dive',
    description: 'The regulated on-ramp — Advanced Trade, cbBTC, CDP, AgentKit, institutional custody.',
    icon: '🏦', color: '#1652f0', start: 181, end: 195, bossLevel: 195, requiredLevel: 180,
    chain: 'base-sepolia',
  },
  {
    id: 14, tier: 'pro', name: 'Final Frontier',
    description: 'ZK proofs, RWA, AI × Crypto, DePIN, CBDCs — the cutting edge of what\'s next.',
    icon: '🚀', color: '#a855f7', start: 196, end: 210, bossLevel: 210, requiredLevel: 195,
    chain: 'ethereum-sepolia',
  },
  {
    id: 15, tier: 'pro', name: 'Alt-Chain Ecosystems',
    description: 'Polygon, Arbitrum, Optimism, Avalanche, Abstract — each chain\'s unique edge.',
    icon: '🔗', color: '#7c3aed', start: 211, end: 230, bossLevel: 226, requiredLevel: 210,
    chain: 'arbitrum-sepolia',
  },
  {
    id: 16, tier: 'pro', name: 'Security & Research',
    description: 'Address poisoning, MEV sandwich attacks, Flashbots protection, Discord/Twitter research, and crypto OPSEC.',
    icon: '🛡️', color: '#ef4444', start: 231, end: 240, bossLevel: 240, requiredLevel: 230,
    chain: 'ethereum-sepolia',
  },
  {
    id: 17, tier: 'pro', name: 'Advanced Crypto',
    description: 'ZK proofs · Web3 Identity · DAO Governance · Stablecoins · DeFi Yield · On-Chain Analysis · Tokenomics · RWA · AI × Crypto · Account Abstraction · Final Boss',
    icon: '⚡', color: '#6366f1', start: 121, end: 135, bossLevel: 135, requiredLevel: 240,
  },
  {
    id: 18, tier: 'pro', name: 'Starknet Islands',
    description: 'Account abstraction · Gasless transactions · STRK swaps · Staking · Lending · DCA · Powered by StarkZap SDK. Execute real Sepolia transactions as you learn.',
    icon: '⚡', color: '#f59e0b', start: 291, end: 310, bossLevel: 310, requiredLevel: 135,
    chain: 'starknet-sepolia',
    nextTracks: ['starknet-defi-navigator', 'starknet-ecosystem-deep-dive', 'cairo-builder'],
  },
];

// ─── Helpers ──────────────────────────────────────────────────

export const getIsland = (id: number) => ISLANDS.find(i => i.id === id);

export const getIslandForLevel = (levelId: number): number => {
  const island = ISLANDS.find(i => levelId >= i.start && levelId <= i.end);
  return island?.id ?? 1;
};

export const getIslandObj = (levelId: number): Island | undefined =>
  ISLANDS.find(i => levelId >= i.start && levelId <= i.end);

export const isIslandUnlocked = (island: Island, completedLevels: number[]): boolean => {
  if (island.id === 18) {
    return true;
  }
  void completedLevels;
  return false;
};

export const getNextIsland = (currentIslandId: number): Island | undefined => {
  const islandIndex = ISLANDS.findIndex((island) => island.id === currentIslandId);
  if (islandIndex < 0) return undefined;
  return ISLANDS[islandIndex + 1];
};
