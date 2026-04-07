// ⚡ Sifter Skill_Up — Starknet DeFi Navigator
// Track metadata and configuration
// Field: Starknet Ecosystem (fieldId: 'starknet')
// Entry: starknet subfield → DeFi Navigator track

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR NETWORK CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
//
// ALL DeFi Navigator simulators use BOTH of the following:
//
//   1. STARKNET SEPOLIA — the live testnet on which all simulator transactions
//      are executed. Transactions generate real explorer-verifiable hashes.
//      Network ID: SN_SEPOLIA | Explorer: https://sepolia.voyager.online
//
//   2. STARKZAP SDK (starkzap-native) — the execution layer that powers every
//      wallet connection, swap, stake, lend, borrow, bridge, and DCA action
//      inside the simulators. The SDK abstracts Starknet account abstraction
//      so simulators work without seed phrases or browser extensions.
//
// These two are always paired. Starknet Sepolia is the WHERE; StarkZap is the HOW.
// Neither is used without the other in the DeFi Navigator simulator context.
//
// Demo mode: if starkzap-native is not installed, simulators fall back to
// MOCK mode (realistic delays, fake hashes). Install the SDK to enable live execution.
//
// ─────────────────────────────────────────────────────────────────────────────

export const NAVIGATOR_NETWORK_CONFIG = {
  /** Primary network for all DeFi Navigator simulator transactions */
  network: 'sepolia' as const,
  /** SDK used for all execution — must be installed: npm install starkzap-native */
  sdk: 'starkzap-native' as const,
  /** Explorer for verifying testnet transactions */
  explorerBase: 'https://sepolia.voyager.online/tx',
  /** Faucet for test STRK tokens */
  faucetUrl: 'https://faucet.starknet.io',
  /** Falls back to mock mode if SDK not installed */
  mockFallback: true,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TRACK DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export const NAVIGATOR_TRACK = {
  id: 'starknet-defi-navigator',
  name: 'Starknet DeFi Navigator',
  fieldId: 'starknet',
  worldThemeId: 'starknet-realm',

  /** Entry requirement: Starknet Islands (Island 19) boss level completed */
  entryRequirement: {
    islandId: 19,
    bossLevelCompleted: 310,
    description: 'Complete the Starknet Islands track (levels 291–310) before beginning the DeFi Navigator.',
  },

  levels: [
    { level: 'junior',       labs: [1, 2, 3, 4, 5],     entry: 'starknet-islands-complete' },
    { level: 'intermediate', labs: [6, 7, 8, 9],         entry: 'junior-certified' },
    { level: 'senior',       labs: [10, 11],              entry: 'intermediate-certified' },
  ],

  certification: {
    name: 'DeFi Navigator Certified',
    finalBoss: 'lab11',
    portfolioArtifact: 'managed-portfolio-30-day-log',
  },

  simulatorNetworks: NAVIGATOR_NETWORK_CONFIG,

  labCount: 11,
  estimatedHours: 80,
  portfolioPushLabs: [2, 4, 6, 9, 11],

  nextTracks: [
    // After DeFi Navigator certification, users can pursue:
    'defi-research-analyst',  // Full career track in Crypto/Web3 field
    'onchain-analyst',         // On-chain data and wallet tracking
  ],
} as const;

export type NavigatorLevel = 'junior' | 'intermediate' | 'senior';

export const LAB_LEVEL_MAP: Record<number, NavigatorLevel> = {
  1: 'junior', 2: 'junior', 3: 'junior', 4: 'junior', 5: 'junior',
  6: 'intermediate', 7: 'intermediate', 8: 'intermediate', 9: 'intermediate',
  10: 'senior', 11: 'senior',
};
