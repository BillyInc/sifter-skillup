// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// Track metadata and configuration
// Field: Starknet Ecosystem (fieldId: 'starknet')
// Sits alongside: starknet-defi-navigator
// Entry: Starknet Islands complete (boss level 310) — same gate as DeFi Navigator

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR NETWORK CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
//
// Ecosystem Deep Dive simulators use a mixed network model:
//
//   READ-ONLY SIMULATORS (Labs 1–8):
//     starkzap-ecosystem-read — reads live DefiLlama, Dune API, and Voyager.
//     No transactions. No gas. No wallet required.
//     Demo mode: pre-loaded mock Starknet dataset.
//
//   WRITE SIMULATORS (Lab 9 SQL Primer + L9.x):
//     sandbox-sql — Dune API connection for live Starknet on-chain queries.
//     Demo mode: mock 90-day Starknet dataset (Oct–Dec 2024).
//     Real mode: requires Dune API key in app Settings.
//
//   RESEARCH SIMULATORS (Labs 6, 7, 9):
//     sandbox-research-writer — in-app writing environment, no network required.
//     Mirror publish (optional): requires wallet connection for on-chain post.
//
//   MAINNET PUSH (Portfolio artifact submission):
//     starkzap-mainnet-push — used for the "How to Push to Mainnet" skill module only.
//     Requires real STRK. Amount-limited ($5 equivalent max). Network: mainnet.
//
// ─────────────────────────────────────────────────────────────────────────────

export const ECOSYSTEM_NETWORK_CONFIG = {
  /** Primary network for read simulators */
  network: 'mainnet-read-only' as const,
  /** SDK for ecosystem read queries */
  sdk: 'starkzap-native' as const,
  /** Dune API endpoint for SQL sandbox */
  duneApiEndpoint: 'https://api.dune.com/api/v1',
  /** Explorer for transaction verification */
  explorerBase: 'https://voyager.online/tx',
  /** Demo mode — no API key required */
  demoMode: true,
  /** Mock dataset covers Oct–Dec 2024 for SQL Primer and Lab 9 demo queries */
  mockDatasetRange: { start: '2024-10-01', end: '2024-12-31' },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TRACK DEFINITION
// ─────────────────────────────────────────────────────────────────────────────

export const ECOSYSTEM_TRACK = {
  id: 'starknet-ecosystem-deep-dive',
  name: 'Starknet Ecosystem Deep Dive',
  subtitle: 'Research, Analysis & Strategic Intelligence',
  fieldId: 'starknet',
  worldThemeId: 'starknet-realm',

  /**
   * Shown on the post-islands track selection screen alongside DeFi Navigator.
   * This is a PARALLEL track — not a prerequisite for DeFi Navigator.
   * Users can choose either or both after completing Starknet Islands.
   */
  trackCardConfig: {
    icon: '🔭',
    accentColor: '#6366F1',  // indigo — distinct from Navigator's pink #EC4899
    tagline: 'Understand the ecosystem. Publish real research. Write grants.',
    difficultyLabel: 'Research-Focused',
    estimatedHours: '3–5 months',
    trackType: 'analyst' as const,   // vs Navigator's 'practitioner'
  },

  /**
   * Entry requirement: same as DeFi Navigator — Starknet Islands boss complete.
   * The two tracks are offered as parallel choices on the same selection screen.
   */
  entryRequirement: {
    islandId: 19,
    bossLevelCompleted: 310,
    description: 'Complete the Starknet Islands track (levels 291–310) to unlock both Starknet tracks.',
  },

  levels: [
    {
      level: 'junior',
      labs: [1, 2, 3, 4, 5],
      entry: 'starknet-islands-complete',
      description: 'Protocol landscape, STARK technology, tokenomics, developer tools, ZK vision.',
    },
    {
      level: 'intermediate',
      labs: [6, 7, 8],
      entry: 'junior-certified',
      description: 'Research methodology, cross-chain competitive analysis, ecosystem gap analysis.',
    },
    {
      level: 'senior',
      labs: [9],
      entry: 'intermediate-certified',
      description: 'SQL on-chain intelligence, systemic risk mapping, publishing research, grant writing.',
    },
  ],

  certification: {
    name: 'Starknet Ecosystem Analyst — Senior Certified',
    finalBoss: 'lab9-final-boss',
    portfolioArtifact: 'starknet-ecosystem-deep-dive',
    badgeColor: '#6366F1',
  },

  simulatorNetworks: ECOSYSTEM_NETWORK_CONFIG,

  labCount: 9,
  estimatedHours: 120,   // 3–5 months at 1–2 hours/day

  /**
   * Labs that trigger a portfolio push on Phase 2 Boss completion.
   * All labs have a Boss Battle. Only these push to GitHub.
   */
  portfolioPushLabs: [1, 2, 3, 4, 5, 6, 7, 8, 9],

  /**
   * Boss level IDs registered in the database on boss completion.
   * Ecosystem track uses 4001-4009 range (Navigator uses 3001-3011).
   */
  bossLevelIds: {
    lab1: 4001, lab2: 4002, lab3: 4003, lab4: 4004, lab5: 4005,
    lab6: 4006, lab7: 4007, lab8: 4008, lab9: 4009,
  },

  /**
   * New simulator types this track introduces.
   * All must be registered in the SimulatorRegistry.
   */
  newSimulatorTypes: [
    'starkzap-ecosystem-read',
    'sandbox-sql',
    'sandbox-research-writer',
    'starkzap-mainnet-push',
    'starkzap-package-install',
  ],

  nextTracks: [
    // After Ecosystem Deep Dive certification, users can pursue:
    'onchain-analyst',            // On-chain data and wallet tracking
    'defi-research-analyst',      // Full career track in Crypto/Web3
    'starknet-defi-navigator',    // If not already taken — the practitioner track
  ],

  /** Cross-track reference: DeFi Navigator skills that complement this track */
  complementaryTrack: {
    id: 'starknet-defi-navigator',
    note: 'DeFi Navigator teaches execution (swaps, staking, lending). Ecosystem Deep Dive teaches analysis (why protocols work, how to research them, how to publish findings).',
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// LAB MANIFEST — used by EcosystemTrackScreen
// ─────────────────────────────────────────────────────────────────────────────

export interface EcosystemLabDef {
  id: string;
  number: number;
  title: string;
  lessonCount: number;
  level: 'junior' | 'intermediate' | 'senior';
  estimatedH: number;
  /** Boss level ID registered in DB on completion. null = Primer (no boss) */
  requiresLevelId: number | null;
  /** Has a Phase 2 portfolio push */
  portfolioPush: boolean;
  /** Primary simulator types used — shown as chips on the card */
  simulatorTypes: string[];
  /** SQL Primer required before this lab unlocks (Lab 9 only) */
  sqlPrimerRequired?: boolean;
}

export const ECOSYSTEM_LABS: EcosystemLabDef[] = [
  {
    id: 'primer',
    number: 0,
    title: 'Before You Begin (Primer Module)',
    lessonCount: 3,
    level: 'junior',
    estimatedH: 1,
    requiresLevelId: null,   // Unlocked on track entry
    portfolioPush: false,
    simulatorTypes: [],
  },
  {
    id: 'lab1',
    number: 1,
    title: 'Protocol Landscape',
    lessonCount: 5,
    level: 'junior',
    estimatedH: 4,
    requiresLevelId: null,   // Unlocked after Primer complete
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'judgment-dataInterpret', 'judgment-communication'],
  },
  {
    id: 'lab2',
    number: 2,
    title: 'STARK Technology & ZK Fundamentals',
    lessonCount: 5,
    level: 'junior',
    estimatedH: 4,
    requiresLevelId: 4001,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'judgment-riskAssess', 'judgment-communication'],
  },
  {
    id: 'lab3',
    number: 3,
    title: 'Tokenomics & Governance',
    lessonCount: 5,
    level: 'junior',
    estimatedH: 4,
    requiresLevelId: 4002,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'judgment-dataInterpret', 'judgment-riskAssess'],
  },
  {
    id: 'lab4',
    number: 4,
    title: 'Developer Ecosystem & Tooling',
    lessonCount: 5,
    level: 'junior',
    estimatedH: 4,
    requiresLevelId: 4003,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'starkzap-package-install', 'judgment-communication'],
  },
  {
    id: 'lab5',
    number: 5,
    title: "Starknet's ZK Vision & Roadmap",
    lessonCount: 5,
    level: 'junior',
    estimatedH: 4,
    requiresLevelId: 4004,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'judgment-riskAssess', 'judgment-dataInterpret'],
  },
  {
    id: 'lab6',
    number: 6,
    title: 'Protocol Research Methodology',
    lessonCount: 5,
    level: 'intermediate',
    estimatedH: 6,
    requiresLevelId: 4005,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'sandbox-research-writer', 'judgment-dataInterpret'],
  },
  {
    id: 'lab7',
    number: 7,
    title: 'Cross-Chain Competitive Analysis',
    lessonCount: 5,
    level: 'intermediate',
    estimatedH: 6,
    requiresLevelId: 4006,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'sandbox-research-writer', 'judgment-dataInterpret'],
  },
  {
    id: 'lab8',
    number: 8,
    title: 'Ecosystem Gaps & Opportunity Analysis',
    lessonCount: 5,
    level: 'intermediate',
    estimatedH: 6,
    requiresLevelId: 4007,
    portfolioPush: true,
    simulatorTypes: ['starkzap-ecosystem-read', 'sandbox-research-writer', 'judgment-riskAssess'],
  },
  {
    id: 'lab9',
    number: 9,
    title: 'Strategic Ecosystem Analysis',
    lessonCount: 9,  // 4 SQL Primer micro-lessons + 5 main lessons
    level: 'senior',
    estimatedH: 14,
    requiresLevelId: 4008,
    portfolioPush: true,
    simulatorTypes: ['sandbox-sql', 'sandbox-research-writer', 'judgment-dataInterpret'],
    sqlPrimerRequired: true,
  },
];

export type EcosystemLevel = 'junior' | 'intermediate' | 'senior';

export const ECOSYSTEM_LAB_LEVEL_MAP: Record<number, EcosystemLevel> = {
  0: 'junior',
  1: 'junior', 2: 'junior', 3: 'junior', 4: 'junior', 5: 'junior',
  6: 'intermediate', 7: 'intermediate', 8: 'intermediate',
  9: 'senior',
};

export const ECOSYSTEM_LEVEL_COLORS: Record<EcosystemLevel, string> = {
  junior:       '#58CC02',
  intermediate: '#F59E0B',
  senior:       '#6366F1',
};
