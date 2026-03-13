// ⚡ Sifter Skill_Up — Island Definitions (18 islands)
export type Tier = 'beginner' | 'intermediate' | 'pro';

export interface Island {
  id: number; tier: Tier; name: string; description: string;
  icon: string; color: string; start: number; end: number;
  bossLevel: number; requiredLevel: number;
}

export const ISLANDS: Island[] = [
  { id: 1, tier: 'beginner', name: "Bitcoin Bay",
    description: "Start your journey with the OG \u2014 Bitcoin, wallets, keys, and why crypto exists.", icon: '₿', color: '#f7931a',
    start: 1, end: 15, bossLevel: 15, requiredLevel: 0 },
  { id: 2, tier: 'beginner', name: "Ethereum Essentials",
    description: "Hot wallets, cold wallets, seed phrases, hardware wallets \u2014 securing your crypto.", icon: '👛', color: '#10b981',
    start: 16, end: 30, bossLevel: 30, requiredLevel: 15 },
  { id: 3, tier: 'beginner', name: "Wallet & Security",
    description: "Phishing, rug pulls, fake projects \u2014 learn to recognise every type of crypto scam.", icon: '🦈', color: '#ef4444',
    start: 31, end: 45, bossLevel: 45, requiredLevel: 30 },
  { id: 4, tier: 'intermediate', name: "DeFi Universe",
    description: "Smart contracts, gas, DApps, ERC-20 tokens \u2014 how Ethereum actually works.", icon: '⟠', color: '#627eea',
    start: 46, end: 60, bossLevel: 60, requiredLevel: 45 },
  { id: 5, tier: 'intermediate', name: "BNB Chain",
    description: "PancakeSwap \u00b7 Launchpool \u00b7 Binance Alpha \u00b7 Binance Earn \u00b7 BSC DeFi \u00b7 BNB Staking \u00b7 Memecoins \u00b7 Risks", icon: '🟡', color: '#f0b90b',
    start: 241, end: 255, bossLevel: 255, requiredLevel: 60 },
  { id: 6, tier: 'intermediate', name: "Solana Deep Dive",
    description: "Proof of History \u00b7 SPL tokens \u00b7 pump.fun \u00b7 Raydium \u00b7 Jupiter \u00b7 NFTs \u00b7 Liquid staking \u00b7 Firedancer \u00b7 Trade-offs vs Ethereum", icon: '◎', color: '#9945ff',
    start: 256, end: 270, bossLevel: 270, requiredLevel: 60 },
  { id: 7, tier: 'intermediate', name: "NFT World",
    description: "Minting, marketplaces, royalties, OpenSea, Magic Eden \u2014 the complete NFT picture.", icon: '🖼️', color: '#3b82f6',
    start: 61, end: 75, bossLevel: 75, requiredLevel: 60 },
  { id: 8, tier: 'intermediate', name: "Bridges & L2s",
    description: "Layer 2s, bridges, cross-chain swaps \u2014 how to move between blockchains safely.", icon: '🌉', color: '#8b5cf6',
    start: 76, end: 90, bossLevel: 90, requiredLevel: 75 },
  { id: 9, tier: 'pro', name: "Memecoin Markets",
    description: "Market cap \u00b7 FDV \u00b7 LP locks \u00b7 bonding curves \u00b7 rug detection \u00b7 DEXScreener \u00b7 pump.fun \u2014 navigate the wild west safely.", icon: '🐸', color: '#06b6d4',
    start: 91, end: 105, bossLevel: 105, requiredLevel: 90 },
  { id: 10, tier: 'pro', name: "Airdrop Archipelago",
    description: "Free crypto for early users \u2014 how protocols give back, how to qualify, and how not to get caught.", icon: '🪂', color: '#8b5cf6',
    start: 106, end: 120, bossLevel: 120, requiredLevel: 105 },
  { id: 11, tier: 'pro', name: "Memecoin Madness",
    description: "Market cap, FDV, LP locks, mint authority, bonding curves \u2014 navigate the wild west safely.", icon: '🐸', color: '#f97316',
    start: 136, end: 150, bossLevel: 150, requiredLevel: 120 },
  { id: 12, tier: 'pro', name: "Base Ecosystem",
    description: "Coinbase\\", icon: '🔵', color: '#0052ff',
    start: 151, end: 165, bossLevel: 165, requiredLevel: 150 },
  { id: 13, tier: 'pro', name: "TON & Telegram",
    description: "900M potential users via Telegram \u2014 TON Space, Mini Apps, Fragment, play-to-airdrop.", icon: '💎', color: '#0088cc',
    start: 166, end: 180, bossLevel: 180, requiredLevel: 165 },
  { id: 14, tier: 'pro', name: "Alt-Chain Ecosystems",
    description: "Polygon, Arbitrum, Optimism, Avalanche, Abstract \u2014 each chain\\", icon: '🔗', color: '#7c3aed',
    start: 211, end: 230, bossLevel: 226, requiredLevel: 180 },
  { id: 15, tier: 'pro', name: "Coinbase Deep Dive",
    description: "The regulated on-ramp \u2014 Advanced Trade, cbBTC, CDP, AgentKit, institutional custody.", icon: '🏦', color: '#1652f0',
    start: 181, end: 195, bossLevel: 195, requiredLevel: 180 },
  { id: 16, tier: 'pro', name: "Final Frontier",
    description: "ZK proofs, RWA, AI \u00d7 Crypto, DePIN, CBDCs \u2014 the cutting edge of what\\", icon: '🚀', color: '#a855f7',
    start: 196, end: 210, bossLevel: 210, requiredLevel: 195 },
  { id: 17, tier: 'pro', name: "Security & Research",
    description: "Address poisoning, MEV sandwich attacks, Flashbots protection, Discord/Twitter research, and crypto OPSEC.", icon: '🛡️', color: '#ef4444',
    start: 231, end: 240, bossLevel: 240, requiredLevel: 210 },
  { id: 18, tier: 'pro', name: "Advanced Crypto",
    description: "ZK proofs \u00b7 Web3 Identity \u00b7 DAO Governance \u00b7 Stablecoins \u00b7 DeFi Yield Strategies \u00b7 On-Chain Analysis \u00b7 Tokenomics \u00b7 RWA \u00b7 AI \u00d7 Crypto \u00b7 Account Abstraction \u00b7 Final Boss", icon: '⚡', color: '#6366f1',
    start: 121, end: 135, bossLevel: 135, requiredLevel: 120 },
];

export const getIsland = (id: number) => ISLANDS.find(i => i.id === id);
export const getIslandForLevel = (lvl: number) => ISLANDS.find(i => lvl >= i.start && lvl <= i.end);
export const isIslandUnlocked = (island: Island, completed: number[]) =>
  island.requiredLevel === 0 || completed.includes(island.requiredLevel);
