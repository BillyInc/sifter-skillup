import { getAllFieldDetails, getFieldDetail, type FieldDetail, type FieldSkillTrack } from '../data/fieldDetails';
import { getField } from '../data/fields';

type UserLike = {
  activeFieldId?: string;
  currentTrackId?: string;
  currentTrackName?: string;
  active_field_id?: string;
  current_track_id?: string;
  current_track_name?: string;
  starknet_auth?: boolean;
  starknet_address?: string;
};

type TrackContextOptions = {
  trackId?: string | null;
  trackName?: string | null;
  hasStarknetWallet?: boolean;
};

type TrackMetric = {
  label: string;
  value: string;
  tone?: string;
};

export type TrackContext = {
  mode: 'overview' | 'track';
  fieldId: string | null;
  trackId: string | null;
  trackName: string;
  worldName: string;
  tagline: string;
  description: string;
  color: string;
  emoji: string;
  artFieldId: string;
  continueHref: string;
  continueLabel: string;
  shellTitle: string;
  shellSubtitle: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSummary: string;
  searchPlaceholder: string;
  stats: TrackMetric[];
  focusAreas: string[];
  challengeTitle: string;
  challengeSummary: string;
  chartValues: number[];
};

type TrackLookup = FieldSkillTrack & {
  fieldId: string;
  worldName: string;
};

const DEFAULT_CHART = [22, 36, 31, 48, 54, 68, 72];
const FALLBACK_FIELD_THEME: Record<string, { color: string; emoji: string }> = {
  starknet: { color: '#ec4899', emoji: '⚡' },
};

function getTrackCatalog(): TrackLookup[] {
  const details = getAllFieldDetails();
  return details.flatMap((detail) =>
    [...detail.generalTracks, ...detail.specificTracks].map((track) => ({
      ...track,
      fieldId: detail.fieldId,
      worldName: detail.worldName,
    })),
  );
}

function getUserFieldId(user: UserLike | null | undefined): string | null {
  return user?.activeFieldId ?? user?.active_field_id ?? null;
}

function getUserTrackId(user: UserLike | null | undefined): string | null {
  return user?.currentTrackId ?? user?.current_track_id ?? null;
}

function getUserTrackName(user: UserLike | null | undefined): string | null {
  return user?.currentTrackName ?? user?.current_track_name ?? null;
}

function buildWorldHref(track: TrackLookup): string {
  const params = new URLSearchParams({
    worldId: track.worldThemeId,
    trackId: track.id,
    fieldId: track.fieldId,
    trackName: track.name,
    live: String(track.status === 'live'),
  });
  return `/world?${params.toString()}`;
}

export function getTrackHref(track: Pick<TrackLookup, 'id' | 'fieldId' | 'worldThemeId' | 'name' | 'status' | 'navigateTo'>): string {
  if (track.id.startsWith('quant')) return '/skills/quant-map';
  if (track.id === 'starknet-defi-navigator') return '/starknet-track';
  if (track.id === 'starknet-ecosystem-deep-dive') return '/ecosystem-track';
  if (track.id === 'cairo-builder') return '/cairo-builder-track';
  if (track.id === 'starknet-islands') return '/(tabs)/map/island?initialIsland=18';
  if (track.navigateTo === 'CryptoMap' || track.navigateTo === 'IslandMap') return '/(tabs)/map/island';
  if (track.navigateTo === 'Quant') return '/skills/quant-map';
  if (track.navigateTo === 'StarknetTrack') return '/starknet-track';
  return buildWorldHref(track as TrackLookup);
}

export function findTrackById(trackId: string | null | undefined): TrackLookup | null {
  if (!trackId) return null;
  return getTrackCatalog().find((track) => track.id === trackId) ?? null;
}

function findFallbackTrack(fieldId: string | null, hasStarknetWallet: boolean): TrackLookup | null {
  if (!fieldId) return null;

  if (fieldId === 'starknet') {
    return findTrackById(hasStarknetWallet ? 'starknet-islands' : 'starknet-defi-navigator');
  }

  const detail = getFieldDetail(fieldId);
  if (!detail) return null;

  const liveTrack = [...detail.generalTracks, ...detail.specificTracks].find((track) => track.status === 'live');
  return liveTrack ? ({ ...liveTrack, fieldId: detail.fieldId, worldName: detail.worldName }) : null;
}

function buildOverviewContext(): TrackContext {
  return {
    mode: 'overview',
    fieldId: null,
    trackId: null,
    trackName: 'Dashboard',
    worldName: 'Sifter Skill_Up',
    tagline: 'Choose a live track and step into its world.',
    description: 'Browse your active islands, track options, guilds, streaks, and portfolio from one reference-style dashboard.',
    color: '#111111',
    emoji: '⚡',
    artFieldId: 'crypto',
    continueHref: '/(tabs)/fields',
    continueLabel: 'Explore Tracks',
    shellTitle: 'Dashboard',
    shellSubtitle: 'Reference-style overview',
    heroEyebrow: 'Overview',
    heroTitle: 'Choose the world you want to continue.',
    heroSummary: 'New users can browse tracks here. Returning users without a saved track can pick one and jump in.',
    searchPlaceholder: 'Search tracks, islands, lessons, and guilds...',
    stats: [
      { label: 'Live Tracks', value: '6' },
      { label: 'Career Fields', value: '29' },
      { label: 'Island Worlds', value: '18' },
      { label: 'Focus', value: 'Track-first UX' },
    ],
    focusAreas: ['Pick a track', 'Resume live lessons', 'Grow portfolio artifacts'],
    challengeTitle: 'Career Tracks Overview',
    challengeSummary: 'Quant, Supply Chain, Onchain, and Starknet now open into their own contextual dashboards.',
    chartValues: DEFAULT_CHART,
  };
}

function buildStats(fieldId: string, trackName: string): TrackMetric[] {
  switch (fieldId) {
    case 'quant':
      return [
        { label: 'Desk', value: trackName.replace('Quant ', '') || 'Market' },
        { label: 'Focus', value: 'Signals' },
        { label: 'Mode', value: 'Track view' },
        { label: 'State', value: 'Ready' },
      ];
    case 'supply-chain':
      return [
        { label: 'Network', value: 'Live' },
        { label: 'Focus', value: 'Flow' },
        { label: 'Mode', value: 'Track view' },
        { label: 'State', value: 'Ready' },
      ];
    case 'starknet':
      return [
        { label: 'Wallet', value: 'Connected' },
        { label: 'Focus', value: 'Sepolia' },
        { label: 'Mode', value: 'Track view' },
        { label: 'State', value: 'Ready' },
      ];
    case 'crypto':
      return [
        { label: 'Signal', value: 'On-chain' },
        { label: 'Focus', value: 'Protocols' },
        { label: 'Mode', value: 'Track view' },
        { label: 'State', value: 'Ready' },
      ];
    default:
      return [
        { label: 'Field', value: trackName.split(' ')[0] || 'Live' },
        { label: 'Focus', value: 'Active' },
        { label: 'Mode', value: 'Track view' },
        { label: 'State', value: 'Ready' },
      ];
  }
}

function buildFocusAreas(fieldId: string, trackName: string): string[] {
  switch (fieldId) {
    case 'quant':
      return ['Strategy labs', 'Backtests', 'Market structure'];
    case 'supply-chain':
      return ['Forecasting', 'Inventory', 'Operations flow'];
    case 'starknet':
      return ['Wallet actions', 'Labs', 'On-chain practice'];
    case 'crypto':
      return trackName.includes('On-Chain')
        ? ['Wallet flows', 'Smart-money moves', 'Protocol intelligence']
        : ['Protocol research', 'Yield systems', 'Risk mapping'];
    default:
      return ['Track progress', 'Guild challenges', 'Portfolio growth'];
  }
}

function buildChartValues(fieldId: string): number[] {
  switch (fieldId) {
    case 'quant':
      return [112, 120, 116, 126, 134, 129, 141];
    case 'supply-chain':
      return [18, 25, 31, 39, 47, 54, 61];
    case 'starknet':
      return [8, 16, 22, 31, 44, 53, 67];
    case 'crypto':
      return [14, 21, 28, 36, 45, 53, 61];
    default:
      return DEFAULT_CHART;
  }
}

function buildChallenge(fieldId: string, trackName: string): { title: string; summary: string } {
  switch (fieldId) {
    case 'quant':
      return {
        title: 'Quant Portfolio & Model Metrics',
        summary: 'Stay inside the selected quant track. No alternate desk appears until you switch tracks.',
      };
    case 'supply-chain':
      return {
        title: 'Operations Flow Board',
        summary: 'Your supply chain dashboard should focus on route health, planning decisions, and the next operational lesson.',
      };
    case 'starknet':
      return {
        title: 'Starknet Track Console',
        summary: 'Returning Starknet users should come back to Starknet visuals, wallet status, and continue actions for their live track.',
      };
    case 'crypto':
      return {
        title: trackName.includes('On-Chain') ? 'On-Chain Intelligence Board' : 'Protocol Research Board',
        summary: 'The dashboard adapts to the selected crypto role instead of showing another field’s visuals.',
      };
    default:
      return {
        title: `${trackName} Workspace`,
        summary: 'Continue from the track you selected with matching visuals, cards, and action paths.',
      };
  }
}

export function resolveTrackContext(
  user: UserLike | null | undefined,
  options?: TrackContextOptions,
): TrackContext {
  const activeFieldId = getUserFieldId(user);
  const currentTrackId = options?.trackId ?? getUserTrackId(user);
  const currentTrackName = options?.trackName ?? getUserTrackName(user);
  const starknetFallback = options?.hasStarknetWallet ?? Boolean(user?.starknet_auth || user?.starknet_address);

  const exactTrack = findTrackById(currentTrackId);
  const fallbackTrack = exactTrack ?? findFallbackTrack(activeFieldId, starknetFallback);

  if (!fallbackTrack) {
    return buildOverviewContext();
  }

  const field = getField(fallbackTrack.fieldId);
  const detail = getFieldDetail(fallbackTrack.fieldId) as FieldDetail | undefined;
  const trackName = currentTrackName || fallbackTrack.name;
  const challenge = buildChallenge(fallbackTrack.fieldId, trackName);
  const fallbackTheme = FALLBACK_FIELD_THEME[fallbackTrack.fieldId];
  const color = field?.color ?? fallbackTheme?.color ?? '#111111';
  const emoji = field?.emoji ?? fallbackTheme?.emoji ?? '⚡';

  return {
    mode: 'track',
    fieldId: fallbackTrack.fieldId,
    trackId: fallbackTrack.id,
    trackName,
    worldName: fallbackTrack.worldName || detail?.worldName || field?.name || 'Track World',
    tagline: fallbackTrack.tagline,
    description: fallbackTrack.description,
    color,
    emoji,
    artFieldId: fallbackTrack.fieldId === 'starknet' ? 'crypto' : fallbackTrack.fieldId,
    continueHref: getTrackHref(fallbackTrack),
    continueLabel: `Continue ${trackName}`,
    shellTitle: trackName,
    shellSubtitle: fallbackTrack.worldLabel,
    heroEyebrow: detail?.worldName ?? 'Active Track',
    heroTitle: trackName,
    heroSummary: fallbackTrack.description,
    searchPlaceholder: `Search inside ${trackName}...`,
    stats: buildStats(fallbackTrack.fieldId, trackName),
    focusAreas: buildFocusAreas(fallbackTrack.fieldId, trackName),
    challengeTitle: challenge.title,
    challengeSummary: challenge.summary,
    chartValues: buildChartValues(fallbackTrack.fieldId),
  };
}
