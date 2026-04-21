/**
 * Track registry — all available learning tracks.
 * Lazy-loaded to keep the initial bundle small.
 */

export interface TrackInfo {
  id: string;
  name: string;
  description: string;
  fieldId: string;
  accentColor: string;
  route: string;
  loader: () => Promise<any>;
}

const tracks: TrackInfo[] = [
  {
    id: 'starknet-island',
    name: 'Starknet World',
    description: 'Account abstraction · Gasless transactions · STRK swaps · Staking · Lending · DCA · Powered by StarkZap SDK.',
    fieldId: 'starknet',
    accentColor: '#ec4899',
    route: '/world',
    loader: () => import('./starknet_ecosystem/island/levels'),
  },
  {
    id: 'starknet-defi-navigator',
    name: 'Starknet DeFi Navigator',
    description: 'Execute real swaps, staking, lending, and DCA on Starknet Sepolia via Starkzap.',
    fieldId: 'starknet',
    accentColor: '#EC4899',
    route: '/starknet-track',
    loader: () => import('./starknet_ecosystem/navigator/navigatorTrack'),
  },
  {
    id: 'starknet-ecosystem-deep-dive',
    name: 'Starknet Ecosystem Deep Dive',
    description: 'Research protocols, analyse on-chain data, publish findings, and write grant proposals.',
    fieldId: 'starknet',
    accentColor: '#6366F1',
    route: '/ecosystem-track',
    loader: () => import('./starknet_ecosystem/ecosystem/ecosystemTrack'),
  },
  {
    id: 'cairo-builder',
    name: 'Cairo Builder',
    description: 'Write, test, and deploy Cairo smart contracts to Starknet Sepolia with snforge.',
    fieldId: 'starknet',
    accentColor: '#F97316',
    route: '/cairo-builder-track',
    loader: () => import('./starknet_ecosystem/builder/builderLessons'),
  },
  {
    id: 'futures-trading',
    name: 'Futures & Perpetuals Trading',
    description: 'Master futures, perpetuals, funding rates, and liquidation mechanics.',
    fieldId: 'trading',
    accentColor: '#10B981',
    route: '/world',
    loader: () => import('./futuresTradingTrack'),
  },
  {
    id: 'onchain-sleuth',
    name: 'On-Chain Sleuth',
    description: 'Blockchain forensics, wallet tracking, and on-chain investigation.',
    fieldId: 'crypto',
    accentColor: '#8B5CF6',
    route: '/world',
    loader: () => import('./onchainSleuthTrack'),
  },
  {
    id: 'memecoin-trader',
    name: 'Memecoin Trader',
    description: 'Rug detection, bundle analysis, bonding curves, and exit strategies.',
    fieldId: 'crypto',
    accentColor: '#F59E0B',
    route: '/world',
    loader: () => import('./memecoinsTraderTrack'),
  },
];

export function getTrackById(id: string): TrackInfo | undefined {
  return tracks.find(t => t.id === id);
}

export function getAllTracks(): TrackInfo[] {
  return tracks;
}

export function getTracksByField(fieldId: string): TrackInfo[] {
  return tracks.filter(t => t.fieldId === fieldId);
}

export function getStarknetTracks(): TrackInfo[] {
  return getTracksByField('starknet');
}
