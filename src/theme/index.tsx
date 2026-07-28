/**
 * Sifter LevelUp — Design System v3
 * ─────────────────────────────────────────────────────────────
 * REPLACES: src/theme/index.ts
 *
 * Base token system aligned to the calm career intelligence shell.
 * Backward-compatible: { Colors } still works everywhere.
 * New: Semantic surface/text/border/accent/state tokens, dark mode, FontWeight, useTheme hook,
 *      world themes, XP system, streak constants, track tools,
 *      animation presets, notification config, font stacks.
 *
 * Extra tokens added for Starknet:
 *   Colors.starknet = '#F59E0B' (amber, aligned to the audit refresh)
 */

import React, {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react';
import { Platform, type DimensionValue } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Spacing ──────────────────────────────────────────────────

export const Spacing = {
  xs: 3, sm: 6, md: 10, lg: 14, xl: 18, xxl: 22, xxxl: 28, huge: 40,
} as const;

// ─── Radius ───────────────────────────────────────────────────

export const Radius = {
  sm: 6, md: 9, lg: 11, xl: 14, xxl: 18, xxxl: 24, full: 99,
} as const;

// ─── Typography ───────────────────────────────────────────────

export const FontSize = {
  xs: 9, sm: 11, md: 13, lg: 15, xl: 17, xxl: 19, xxxl: 22,
  display: 26, hero: 30,
} as const;

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  heavy:    '800' as const,
  black:    '900' as const,
} as const;

export const LineHeight = {
  tight: 1.2, normal: 1.5, relaxed: 1.7,
} as const;

// ─── Shadows ──────────────────────────────────────────────────

export const Shadow = {
  xs: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  sm: { shadowColor: '#000000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#000000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.09, shadowRadius: 16, elevation: 4 },
  lg: { shadowColor: '#000000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
  glow:      { shadowColor: '#000000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.12, shadowRadius: 14, elevation: 6 },
  glowGold:  { shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 16, elevation: 8 },
  glowGreen: { shadowColor: '#10b981', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.22, shadowRadius: 14, elevation: 6 },
  glowAmber: { shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 16, elevation: 8 },
  glowPink:  { shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.24, shadowRadius: 16, elevation: 8 },
} as const;

// ─── Color palette interface ───────────────────────────────────

export interface ColorPalette {
  bg: string; bgSecondary: string; bgTertiary: string;
  card: string; cardElevated: string; navy: string;
  accent: string; accentSoft: string; accentDim: string; accentDeep: string;
  green: string; greenSoft: string;
  red: string; redSoft: string;
  gold: string; goldSoft: string;
  orange: string; orangeSoft: string;
  text: string; textSoft: string; textMuted: string; textInverse: string;
  border: string; borderDark: string; borderFocus: string;
  beginner: string; intermediate: string; pro: string;
  bitcoin: string; ethereum: string; defi: string; nft: string;
  bridge: string; meme: string; base: string; ton: string; bnb: string;
  solana: string; starknet: string;
  tabBar: string; tabBarBorder: string; tabBarActive: string;
  inputBg: string; inputBorder: string;
  overlay: string; shimmer: string; shimmerHighlight: string;
  stitch: string; stitchSoft: string;
  levelBadge: string; levelBadgeText: string;
  streakFire: string; xpGreen: string;
  // ── Redesign semantic tokens ───────────────────────────────
  surface: {
    base: string;
    raised: string;
    subtle: string;
    sunken: string;
    inverse: string;
  };
  textRole: {
    primary: string;
    secondary: string;
    muted: string;
    placeholder: string;
    inverse: string;
  };
  borderRole: {
    subtle: string;
    strong: string;
    focus: string;
  };
  accentRole: {
    action: string;
    status: string;
    warning: string;
    danger: string;
    success: string;
  };
  state: {
    locked: string;
    lockedSoft: string;
    pending: string;
    pendingSoft: string;
    verified: string;
    verifiedSoft: string;
    live: string;
    liveSoft: string;
  };
  // Legacy COMPASS aliases retained so old screens keep rendering while the
  // redesign migrates to the semantic groups above.
  cobalt: string; cobaltDeep: string; cobaltWash: string;
  apricot: string; apricotWash: string;
  bgSunken: string;
  // Semantic depth (frame every metric with meaning).
  success: string; successSoft: string;
  warning: string; warningSoft: string;
  danger: string;  dangerSoft: string;
  info: string;    infoSoft: string;
  demand: string;  demandSoft: string;
  elite: string;   eliteSoft: string;
  // Route-line station + edge colours.
  routeLine: string; routeNode: string; routeNodeMuted: string;
}

// ─── Light palette ────────────────────────────────────────────

export const LightColors: ColorPalette = {
  bg: '#F7F7F8', bgSecondary: '#FFFFFF', bgTertiary: '#EFEFF1',
  card: '#FFFFFF', cardElevated: '#FFFFFF', navy: '#111214',
  accent: '#1F5EFF', accentSoft: '#EEF4FF', accentDim: '#4266A6', accentDeep: '#123AAE',
  green: '#159A63', greenSoft: '#EAF7F0',
  red: '#D92D20', redSoft: '#FDECEC',
  gold: '#B8860B', goldSoft: '#FBF3DD',
  orange: '#B45309', orangeSoft: '#FBF0E2',
  text: '#111214', textSoft: '#4B5563', textMuted: '#7C8490', textInverse: '#FFFFFF',
  border: '#E3E5E8', borderDark: '#C9CDD3', borderFocus: '#1F5EFF',
  beginner: '#10B981', intermediate: '#F59E0B', pro: '#F59E0B',
  bitcoin: '#F7931A', ethereum: '#627EEA', defi: '#10B981', nft: '#8B5CF6',
  bridge: '#06B6D4', meme: '#EF4444', base: '#0052FF', ton: '#0088CC',
  bnb: '#F0B90B', solana: '#9945FF', starknet: '#F59E0B',
  tabBar: '#FFFFFF', tabBarBorder: '#E3E5E8', tabBarActive: '#111214',
  inputBg: '#FFFFFF', inputBorder: '#D9DDE3',
  overlay: 'rgba(17,18,20,0.46)', shimmer: '#EEEFF1', shimmerHighlight: '#F8F8F9',
  stitch: '#111214', stitchSoft: '#F1F2F4',
  levelBadge: '#F6F7F8', levelBadgeText: '#4B5563',
  streakFire: '#B45309', xpGreen: '#159A63',
  surface: {
    base: '#F7F7F8',
    raised: '#FFFFFF',
    subtle: '#F1F2F4',
    sunken: '#ECEEF1',
    inverse: '#111214',
  },
  textRole: {
    primary: '#111214',
    secondary: '#4B5563',
    muted: '#7C8490',
    placeholder: '#9AA1AA',
    inverse: '#FFFFFF',
  },
  borderRole: {
    subtle: '#E3E5E8',
    strong: '#C9CDD3',
    focus: '#1F5EFF',
  },
  accentRole: {
    action: '#1F5EFF',
    status: '#2563EB',
    warning: '#B45309',
    danger: '#D92D20',
    success: '#159A63',
  },
  state: {
    locked: '#6B7280',
    lockedSoft: '#F1F2F4',
    pending: '#B45309',
    pendingSoft: '#FBF0E2',
    verified: '#159A63',
    verifiedSoft: '#EAF7F0',
    live: '#159A63',
    liveSoft: '#EAF7F0',
  },
  // ── Legacy aliases ──
  cobalt: '#1F5EFF', cobaltDeep: '#123AAE', cobaltWash: '#EEF4FF',
  apricot: '#B45309', apricotWash: '#FBF0E2',
  bgSunken: '#ECEEF1',
  success: '#159A63', successSoft: '#EAF7F0',
  warning: '#B45309', warningSoft: '#FBF0E2',
  danger: '#D92D20', dangerSoft: '#FDECEC',
  info: '#2563EB', infoSoft: '#EEF4FF',
  demand: '#0D9488', demandSoft: '#E2F5F2',
  elite: '#B8860B', eliteSoft: '#FBF3DD',
  routeLine: '#C9D6F2', routeNode: '#1F5EFF', routeNodeMuted: '#C4C8D4',
};

// ─── Dark palette ─────────────────────────────────────────────

export const DarkColors: ColorPalette = {
  bg: '#151618', bgSecondary: '#1B1D20', bgTertiary: '#24272B',
  card: '#1B1D20', cardElevated: '#22252A', navy: '#F4F5F6',
  accent: '#7EA6FF', accentSoft: '#18233A', accentDim: '#AEB7C6', accentDeep: '#C9DAFF',
  green: '#34D399', greenSoft: '#102E27',
  red: '#F87171', redSoft: '#34181B',
  gold: '#F4B74A', goldSoft: '#342815',
  orange: '#FB923C', orangeSoft: '#392414',
  text: '#F4F5F6', textSoft: '#C7CCD3', textMuted: '#8E959F', textInverse: '#111214',
  border: '#30343A', borderDark: '#444A53', borderFocus: '#7EA6FF',
  beginner: '#34D399', intermediate: '#F4B74A', pro: '#F87171',
  bitcoin: '#F7931A', ethereum: '#7C96FF', defi: '#34D399', nft: '#A78BFA',
  bridge: '#22D3EE', meme: '#F87171', base: '#3B82F6', ton: '#38BDF8',
  bnb: '#FBB024', solana: '#B57AFF', starknet: '#F4B74A',
  tabBar: '#1B1D20', tabBarBorder: '#30343A', tabBarActive: '#F4F5F6',
  inputBg: '#1B1D20', inputBorder: '#383D45',
  overlay: 'rgba(8,9,10,0.76)', shimmer: '#24272B', shimmerHighlight: '#30343A',
  stitch: '#F4F5F6', stitchSoft: '#24272B',
  levelBadge: '#342815', levelBadgeText: '#F4B74A',
  streakFire: '#FB923C', xpGreen: '#34D399',
  surface: {
    base: '#151618',
    raised: '#1B1D20',
    subtle: '#22252A',
    sunken: '#101113',
    inverse: '#F4F5F6',
  },
  textRole: {
    primary: '#F4F5F6',
    secondary: '#C7CCD3',
    muted: '#8E959F',
    placeholder: '#767E89',
    inverse: '#111214',
  },
  borderRole: {
    subtle: '#30343A',
    strong: '#444A53',
    focus: '#7EA6FF',
  },
  accentRole: {
    action: '#7EA6FF',
    status: '#7EA6FF',
    warning: '#F4B74A',
    danger: '#F87171',
    success: '#34D399',
  },
  state: {
    locked: '#8E959F',
    lockedSoft: '#24272B',
    pending: '#F4B74A',
    pendingSoft: '#2A2110',
    verified: '#34D399',
    verifiedSoft: '#0E2A22',
    live: '#34D399',
    liveSoft: '#0E2A22',
  },
  // ── Legacy aliases ──
  cobalt: '#7EA6FF', cobaltDeep: '#4C78E6', cobaltWash: '#18233A',
  apricot: '#F4B74A', apricotWash: '#2A2110',
  bgSunken: '#101113',
  success: '#34D399', successSoft: '#0E2A22',
  warning: '#F4B74A', warningSoft: '#2A2110',
  danger: '#F87171', dangerSoft: '#341A1C',
  info: '#7EA6FF', infoSoft: '#18233A',
  demand: '#2DD4BF', demandSoft: '#0C2A28',
  elite: '#E9C46A', eliteSoft: '#2A230F',
  routeLine: '#2B3A59', routeNode: '#7EA6FF', routeNodeMuted: '#444A53',
};

// Backward-compatible static export — existing code `import { Colors }` still works
export const Colors: ColorPalette = { ...LightColors };

// ─── Theme context ────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: ColorPalette;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = '@sifter_theme_mode_v3';

const ThemeCtx = createContext<ThemeContextValue>({
  mode: 'light', isDark: false, colors: LightColors,
  setMode: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v === 'light' || v === 'dark') {
        setModeState(v);
        return;
      }
      if (v === 'system') {
        setModeState('light');
        AsyncStorage.setItem(STORAGE_KEY, 'light').catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const setMode = (m: ThemeMode) => {
    const nextMode = m === 'system' ? 'light' : m;
    setModeState(nextMode);
    AsyncStorage.setItem(STORAGE_KEY, nextMode).catch(() => {});
  };

  const isDark = mode === 'dark';
  const colors = isDark ? DarkColors : LightColors;
  const toggle = () => setMode(isDark ? 'light' : 'dark');

  useEffect(() => {
    Object.assign(Colors, colors);
  }, [colors]);

  return (
    <ThemeCtx.Provider value={{ mode, isDark, colors, setMode, toggle }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeCtx);
}

// ─── World themes ─────────────────────────────────────────────

export interface WorldTheme {
  id: string; name: string;
  primaryColor: string; secondaryColor: string;
  bgGradient: [string, string];
  glowColor: string; particleColor: string; emoji: string;
}

export const WORLD_THEMES: Record<string, WorldTheme> = {
  'quant-quarter':          { id: 'quant-quarter',          name: 'Quant Quarter',          primaryColor: '#1D4ED8', secondaryColor: '#2563EB', bgGradient: ['#030712', '#0f172a'], glowColor: 'rgba(29,78,216,0.35)',   particleColor: '#3B82F6', emoji: '🏛️' },
  'blockchain-borough':     { id: 'blockchain-borough',     name: 'Blockchain Borough',     primaryColor: '#F7931A', secondaryColor: '#FBB024', bgGradient: ['#0f0a00', '#1f1200'], glowColor: 'rgba(247,147,26,0.4)',   particleColor: '#F7931A', emoji: '🔮' },
  'neural-nexus':           { id: 'neural-nexus',           name: 'Neural Nexus',           primaryColor: '#8B5CF6', secondaryColor: '#A78BFA', bgGradient: ['#0d0018', '#1a0030'], glowColor: 'rgba(139,92,246,0.45)', particleColor: '#A78BFA', emoji: '🧠' },
  'code-citadel':           { id: 'code-citadel',           name: 'Code Citadel',           primaryColor: '#0EA5E9', secondaryColor: '#38BDF8', bgGradient: ['#00101f', '#002040'], glowColor: 'rgba(14,165,233,0.4)',  particleColor: '#38BDF8', emoji: '🏰' },
  'shadow-vault':           { id: 'shadow-vault',           name: 'Shadow Vault',           primaryColor: '#EF4444', secondaryColor: '#F87171', bgGradient: ['#0f0000', '#200000'], glowColor: 'rgba(239,68,68,0.4)',   particleColor: '#F87171', emoji: '🛡️' },
  'logistics-labyrinth':    { id: 'logistics-labyrinth',    name: 'Logistics Labyrinth',    primaryColor: '#0EA5E9', secondaryColor: '#38BDF8', bgGradient: ['#000d1a', '#001f40'], glowColor: 'rgba(14,165,233,0.4)',  particleColor: '#38BDF8', emoji: '🔗' },
  'starknet-realm':         { id: 'starknet-realm',         name: 'Starknet Realm',         primaryColor: '#F59E0B', secondaryColor: '#FBBF24', bgGradient: ['#120b00', '#251600'], glowColor: 'rgba(245,158,11,0.38)', particleColor: '#FBBF24', emoji: '⚡' },
  'default':                { id: 'default',                name: 'Sifter World',           primaryColor: '#111111', secondaryColor: '#374151', bgGradient: ['#0a0a0a', '#111111'], glowColor: 'rgba(0,0,0,0.25)',      particleColor: '#F59E0B', emoji: '⚡' },
};

export function getWorldTheme(id: string): WorldTheme {
  return WORLD_THEMES[id] ?? WORLD_THEMES['default'];
}

// ─── Animation presets ────────────────────────────────────────

export const AnimPreset = {
  tap:          { duration: 100, useNativeDriver: true },
  standard:     { duration: 250, useNativeDriver: true },
  enter:        { duration: 380, useNativeDriver: true },
  reveal:       { duration: 500, useNativeDriver: true },
  pulse:        { duration: 1400, useNativeDriver: true },
  float:        { duration: 2400, useNativeDriver: true },
  celebrate:    { duration: 600, useNativeDriver: true },
  spring:       { tension: 140, friction: 8,  useNativeDriver: true },
  springGentle: { tension: 80,  friction: 10, useNativeDriver: true },
} as const;

// ─── XP System ────────────────────────────────────────────────

export const XP_VALUES = {
  lessonComplete:      10,
  lessonPerfect:       15,
  labComplete:         20,
  bossLevel:           30,
  dailyStreakBonus:     5,
  firstLessonOfDay:    5,
  helpGuildMember:     5,
  communityPost:       3,
  communityComment:    1,
  achievementUnlock:   10,
  starknetTransaction: 20,
} as const;

export const XP_DAILY_GOALS = {
  casual:  { label: 'Casual',  xp: 10, emoji: '🌱' },
  regular: { label: 'Regular', xp: 20, emoji: '⚡' },
  intense: { label: 'Intense', xp: 30, emoji: '🔥' },
  insane:  { label: 'Insane',  xp: 50, emoji: '💎' },
} as const;

export const XP_STAGES = [
  { stage: 1, name: 'Raw Recruit',     minXp: 0,    maxXp: 50,   description: 'Just starting out. Empty desk, full potential.' },
  { stage: 2, name: 'Junior Analyst',  minXp: 51,   maxXp: 150,  description: 'First tools on the desk. Track identity forming.' },
  { stage: 3, name: 'Associate',       minXp: 151,  maxXp: 300,  description: 'Smart casual. Dual monitors. Getting serious.' },
  { stage: 4, name: 'Specialist',      minXp: 301,  maxXp: 500,  description: 'Full workstation. Track-specific data feeds live.' },
  { stage: 5, name: 'Senior Analyst',  minXp: 501,  maxXp: 800,  description: 'Standing desk. Multiple screens. People notice.' },
  { stage: 6, name: 'Lead',            minXp: 801,  maxXp: 1200, description: 'Glass office. Team visible behind you.' },
  { stage: 7, name: 'Director',        minXp: 1201, maxXp: 1800, description: 'Command center. Everything at your fingertips.' },
  { stage: 8, name: 'Industry Expert', minXp: 1801, maxXp: 9999, description: 'Speaking stage. Your own brand. Legendary status.' },
] as const;

export function getStageForXp(xp: number) {
  return XP_STAGES.find(s => xp >= s.minXp && xp <= s.maxXp) ?? XP_STAGES[0];
}
export function getXpToNextStage(xp: number): number {
  const s = getStageForXp(xp); return Math.max(0, s.maxXp - xp + 1);
}
export function getXpProgress(xp: number): number {
  const s = getStageForXp(xp);
  return Math.min(1, (xp - s.minXp) / (s.maxXp - s.minXp));
}

// ─── Streak ───────────────────────────────────────────────────

export const STREAK = {
  graceHours: 24, warningHours: 4,
  freezeItem: 'streak_freeze', storageKey: '@sifter_streak_v1',
} as const;

// ─── Track tools ──────────────────────────────────────────────

export const TRACK_TOOLS: Record<string, {
  color: string; toolEmoji: string; screenLabel: string; deskItems: string[];
}> = {
  'crypto':               { color: '#F7931A', toolEmoji: '₿',  screenLabel: 'On-Chain Terminal',      deskItems: ['wallet', 'price-feed', 'defi-dashboard'] },
  'quant':                { color: '#1D4ED8', toolEmoji: '📊', screenLabel: 'Bloomberg Terminal',      deskItems: ['python-ide', 'probability-tree', 'backtest'] },
  'supply-chain':         { color: '#0EA5E9', toolEmoji: '🔗', screenLabel: 'Logistics Dashboard',     deskItems: ['sap-screen', 'shipping-map', 'inventory'] },
  'defi-research':        { color: '#10B981', toolEmoji: '🌊', screenLabel: 'DeFi Protocol Monitor',   deskItems: ['yield-curve', 'tvl-chart', 'liquidation'] },
  'starknet':             { color: '#F59E0B', toolEmoji: '⚡', screenLabel: 'Cairo Dev Terminal',      deskItems: ['zk-proof', 'contract-editor', 'tx-feed'] },
  'starknet-defi-navigator': { color: '#F59E0B', toolEmoji: '🧭', screenLabel: 'DeFi Navigator',      deskItems: ['pool-depth', 'yield-monitor', 'starkzap'] },
  'options-trading':      { color: '#0369A1', toolEmoji: '🎯', screenLabel: 'Options Chain',           deskItems: ['greeks-chart', 'vol-surface', 'expiry-cal'] },
  'ai-ml':                { color: '#06B6D4', toolEmoji: '🤖', screenLabel: 'Model Training Monitor', deskItems: ['gpu-rig', 'loss-curve', 'neural-net'] },
  'default':              { color: '#111111', toolEmoji: '💼', screenLabel: 'Analyst Workstation',     deskItems: ['spreadsheet', 'notepad', 'coffee'] },
};

export function getTrackTools(trackId: string) {
  return TRACK_TOOLS[trackId] ?? TRACK_TOOLS['default'];
}

// ─── Notification config ──────────────────────────────────────

export const NOTIFICATION_CONFIG = {
  provider:         'resend' as const,
  fromEmail:        'learn@sifter.app',
  fromName:         'Sifter LevelUp',
  minIntervalHours: 4,
  weeklyDigestDay:  0,
  weeklyDigestHour: 9,
} as const;

// ─── Font stacks ──────────────────────────────────────────────
// COMPASS typography — re-exported from ./fonts so screens import font roles
// (display / body / data …) from '@/theme'. `mono` aliases `data` for any legacy
// caller. See theme/fonts.ts for the loader + graceful system fallback.

export {
  Fonts as CompassFonts,
  useCompassFonts,
  COMPASS_FONTS_AVAILABLE,
} from './fonts';
export * as Motion from './motion';
export {
  Timing, Spring, STAGGER, FADE_ONLY, useReducedMotion, motion,
} from './motion';

const _EMOJI_FONTS = [
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji', 'EmojiOne Color', 'Android Emoji', 'Twemoji Mozilla',
].join(', ');

const _SYSTEM_UI = Platform.select({
  web:     `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, ${_EMOJI_FONTS}`,
  default: undefined,
});

// Legacy Fonts shape (emoji/body/mono) kept for backward compatibility. New code
// should prefer CompassFonts (display / body / data / …).
export const Fonts = {
  emoji: _SYSTEM_UI ? { fontFamily: _SYSTEM_UI } : {},
  body:  _SYSTEM_UI ? { fontFamily: _SYSTEM_UI } : {},
  mono: {
    fontFamily: Platform.select({
      web:     `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace, ${_EMOJI_FONTS}`,
      ios:     'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
};

// ─── Rewards (export * from './rewards' equivalent) ───────────────────────────
// Inline the rewards tokens so we don't need a separate file import

export const REWARD_TIERS = {
  bronze: { label: 'Bronze', color: '#CD7F32', minXp: 0 },
  silver: { label: 'Silver', color: '#A8A9AD', minXp: 300 },
  gold:   { label: 'Gold',   color: '#FFD700', minXp: 800 },
  elite:  { label: 'Elite',  color: '#9B59B6', minXp: 1800 },
} as const;

export type RewardTier = keyof typeof REWARD_TIERS;

export function getRewardTier(xp: number): RewardTier {
  if (xp >= 1800) return 'elite';
  if (xp >= 800)  return 'gold';
  if (xp >= 300)  return 'silver';
  return 'bronze';
}

export const WEB_MAX_WIDTH = 1088;
export const webContainer: { maxWidth?: number; alignSelf?: 'center'; width?: DimensionValue; paddingHorizontal: number; paddingTop: number } = Platform.OS === 'web'
  ? { maxWidth: 1088, alignSelf: 'center', width: '100%' as DimensionValue, paddingHorizontal: 14, paddingTop: 14 }
  : { paddingHorizontal: 14, paddingTop: 12 };

// ─── Brand ────────────────────────────────────────────────────
// Sifter LevelUp brand constants. The name is intentionally also the
// product's core call-to-action ("Level Up").

export const Brand = {
  name: 'Sifter LevelUp',
  short: 'LevelUp',
  tagline: 'Be the best you can be.',
  promise: 'See the domains, roles and jobs your programme unlocks — local, global, remote.',
  // Accent used across brand surfaces (logo, splash, intro). Aligned to the
  // existing gold/amber accent so it never clashes with the neutral UI.
  primary: '#F59E0B',
  primaryDeep: '#B45309',
  onPrimary: '#FFFFFF',
  primaryLight: '#FDE68A',
  primarySoft: '#FFFBEB',
  warning: '#F97316',
  danger: '#EF4444',
} as const;

// ─── Career Intelligence tokens ───────────────────────────────
// Domain match type (CCMAS v3.0): every programme→domain link is one of
// Direct / Functional / Adjacent. Roles within a matched domain are scored
// separately as Match / Adjacent by ESCO coverage. These colours are kept
// deliberately distinct from the XP / level / streak colours above so the
// two systems never visually collide.

export type DomainMatchType = 'direct' | 'functional' | 'adjacent';
export type RoleMatchType = 'match' | 'adjacent';

export interface CareerBadgeStyle {
  bg: string;
  border: string;
  text: string;
  label: string;
}

// Light-mode badge styles. Green = Direct, Blue = Functional, Amber = Adjacent.
export const DomainBadge: Record<DomainMatchType, CareerBadgeStyle> = {
  direct:     { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', label: 'Direct' },
  functional: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', label: 'Functional' },
  adjacent:   { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'Adjacent' },
};

export const DomainBadgeDark: Record<DomainMatchType, CareerBadgeStyle> = {
  direct:     { bg: '#0C2A22', border: '#1E5345', text: '#34D399', label: 'Direct' },
  functional: { bg: '#0E1E3A', border: '#244B85', text: '#7C96FF', label: 'Functional' },
  adjacent:   { bg: '#2A2008', border: '#5C4715', text: '#F4B74A', label: 'Adjacent' },
};

// Role match label: "Match" (>=50% ESCO coverage) or "Adjacent" (20-49%).
export const RoleBadge: Record<RoleMatchType, CareerBadgeStyle> = {
  match:    { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', label: 'Match' },
  adjacent: { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'Adjacent' },
};

export const RoleBadgeDark: Record<RoleMatchType, CareerBadgeStyle> = {
  match:    { bg: '#0C2A22', border: '#1E5345', text: '#34D399', label: 'Match' },
  adjacent: { bg: '#2A2008', border: '#5C4715', text: '#F4B74A', label: 'Adjacent' },
};

export function getDomainBadge(type: DomainMatchType, isDark = false): CareerBadgeStyle {
  return (isDark ? DomainBadgeDark : DomainBadge)[type];
}

export function getRoleBadge(type: RoleMatchType, isDark = false): CareerBadgeStyle {
  return (isDark ? RoleBadgeDark : RoleBadge)[type];
}

// ─── Readiness badges (v2 taxonomy) ───────────────────────────
// Readiness = agent-verified domain match_type × role tier (NOT token coverage).
//   ready  → green  ("Ready" — you can step in with little to bridge)
//   bridge → amber  ("Bridge" — a moderate skills bridge to cross)
//   stretch→ blue   ("Stretch" — reachable, but a larger reach)
// Kept in the same {bg,border,text,label} shape as DomainBadge so screens can
// theme readiness pills identically.

export type ReadinessType = 'ready' | 'bridge' | 'stretch';

export const ReadinessBadge: Record<ReadinessType, CareerBadgeStyle> = {
  ready:   { bg: '#ECFDF5', border: '#A7F3D0', text: '#047857', label: 'Ready' },
  bridge:  { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', label: 'Bridge' },
  stretch: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8', label: 'Stretch' },
};

export const ReadinessBadgeDark: Record<ReadinessType, CareerBadgeStyle> = {
  ready:   { bg: '#0C2A22', border: '#1E5345', text: '#34D399', label: 'Ready' },
  bridge:  { bg: '#2A2008', border: '#5C4715', text: '#F4B74A', label: 'Bridge' },
  stretch: { bg: '#0E1E3A', border: '#244B85', text: '#7C96FF', label: 'Stretch' },
};

export function getReadinessBadge(type: ReadinessType, isDark = false): CareerBadgeStyle {
  return (isDark ? ReadinessBadgeDark : ReadinessBadge)[type];
}

// ─── Tier badges (role seniority) ─────────────────────────────
// entry / mid / senior. Subtle, neutral styling — tier is context, not a
// primary signal, so it stays quieter than the readiness/domain badges.

export type TierType = 'entry' | 'mid' | 'senior';

export const TierBadge: Record<TierType, CareerBadgeStyle> = {
  entry:  { bg: '#F5F5F5', border: '#E5E7EB', text: '#6B7280', label: 'Entry' },
  mid:    { bg: '#EFF6FF', border: '#DBEAFE', text: '#2563EB', label: 'Mid' },
  senior: { bg: '#F5F3FF', border: '#DDD6FE', text: '#7C3AED', label: 'Senior' },
};

export const TierBadgeDark: Record<TierType, CareerBadgeStyle> = {
  entry:  { bg: '#20252E', border: '#2B3442', text: '#94A3B8', label: 'Entry' },
  mid:    { bg: '#0E1E3A', border: '#244B85', text: '#7C96FF', label: 'Mid' },
  senior: { bg: '#1C1633', border: '#3A2F5C', text: '#A78BFA', label: 'Senior' },
};

export function getTierBadge(type: TierType, isDark = false): CareerBadgeStyle {
  return (isDark ? TierBadgeDark : TierBadge)[type];
}

// Data freshness / provenance, shown next to any data point.
export const DataFreshness = {
  verified: { icon: '✅', label: 'Verified', color: '#10B981' },
  inferred: { icon: '⚠️', label: 'Inferred', color: '#F59E0B' },
  pending:  { icon: '🕐', label: 'Pending',  color: '#6B7280' },
} as const;

// Storage key for the first-launch intro carousel.
export const INTRO_SEEN_KEY = '@sifter_levelup_intro_seen_v1';
