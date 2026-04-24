/**
 * Sifter Skill_Up — Design System v3
 * ─────────────────────────────────────────────────────────────
 * REPLACES: src/theme/index.ts
 *
 * Stitch + Duolingo hybrid token system.
 * Backward-compatible: { Colors } still works everywhere.
 * New: Stitch palette, dark mode, FontWeight, useTheme hook,
 *      world themes, XP system, streak constants, track tools,
 *      animation presets, notification config, font stacks.
 *
 * Extra tokens added for Starknet:
 *   Colors.starknet = '#EC4899' (pink, matches Island 18 orbit)
 */

import React, {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react';
import { Appearance, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Spacing ──────────────────────────────────────────────────

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48,
} as const;

// ─── Radius ───────────────────────────────────────────────────

export const Radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40, full: 99,
} as const;

// ─── Typography ───────────────────────────────────────────────

export const FontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 28,
  display: 36, hero: 44,
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
  xs: { shadowColor: '#64748b', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  sm: { shadowColor: '#475569', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  md: { shadowColor: '#334155', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  lg: { shadowColor: '#1e293b', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 8 },
  glow:      { shadowColor: '#5b5fcf', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4,  shadowRadius: 16, elevation: 8 },
  glowGold:  { shadowColor: '#f59e0b', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 20, elevation: 10 },
  glowGreen: { shadowColor: '#22c55e', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4,  shadowRadius: 16, elevation: 8 },
  glowPink:  { shadowColor: '#ec4899', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.45, shadowRadius: 20, elevation: 10 },
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
}

// ─── Light palette ────────────────────────────────────────────

export const LightColors: ColorPalette = {
  bg: '#F5F5FA', bgSecondary: '#EBEBF5', bgTertiary: '#E0E0F0',
  card: '#FFFFFF', cardElevated: '#FFFFFF', navy: '#1A1A2E',
  accent: '#5B5FCF', accentSoft: '#EBEBFF', accentDim: '#8B8FE8', accentDeep: '#3D40A0',
  green: '#58CC02', greenSoft: '#D7F7C2',
  red: '#FF4B4B', redSoft: '#FFE5E5',
  gold: '#F59E0B', goldSoft: '#FFF7E0',
  orange: '#FF9600', orangeSoft: '#FFF3E0',
  text: '#1A1A2E', textSoft: '#4A4A6A', textMuted: '#8888A8', textInverse: '#FFFFFF',
  border: '#E0E0F0', borderDark: '#C8C8E8', borderFocus: '#5B5FCF',
  beginner: '#58CC02', intermediate: '#F59E0B', pro: '#5B5FCF',
  bitcoin: '#F7931A', ethereum: '#627EEA', defi: '#10B981', nft: '#8B5CF6',
  bridge: '#06B6D4', meme: '#EF4444', base: '#0052FF', ton: '#0088CC',
  bnb: '#F0B90B', solana: '#9945FF', starknet: '#EC4899',
  tabBar: '#FFFFFF', tabBarBorder: '#E0E0F0', tabBarActive: '#5B5FCF',
  inputBg: '#FFFFFF', inputBorder: '#E0E0F0',
  overlay: 'rgba(26,26,46,0.5)', shimmer: '#F0F0F8', shimmerHighlight: '#E0E0F0',
  stitch: '#5B5FCF', stitchSoft: '#F0F0FF',
  levelBadge: '#FFF0C2', levelBadgeText: '#B7791F',
  streakFire: '#FF9600', xpGreen: '#58CC02',
};

// ─── Dark palette ─────────────────────────────────────────────

export const DarkColors: ColorPalette = {
  bg: '#0D0D1A', bgSecondary: '#13132B', bgTertiary: '#1A1A38',
  card: '#1A1A30', cardElevated: '#222245', navy: '#E8E8F8',
  accent: '#8B8FFF', accentSoft: '#1E1E4B', accentDim: '#6366F1', accentDeep: '#A8ABFF',
  green: '#58CC02', greenSoft: '#0D2E00',
  red: '#FF4B4B', redSoft: '#2D0D0D',
  gold: '#FBB024', goldSoft: '#2D1F00',
  orange: '#FF9600', orangeSoft: '#2D1A00',
  text: '#F0F0FF', textSoft: '#A8A8C8', textMuted: '#6666AA', textInverse: '#0D0D1A',
  border: '#222248', borderDark: '#333368', borderFocus: '#8B8FFF',
  beginner: '#58CC02', intermediate: '#FBB024', pro: '#8B8FFF',
  bitcoin: '#F7931A', ethereum: '#7C96FF', defi: '#34D399', nft: '#A78BFA',
  bridge: '#22D3EE', meme: '#F87171', base: '#3B82F6', ton: '#38BDF8',
  bnb: '#FBB024', solana: '#B57AFF', starknet: '#F472B6',
  tabBar: '#0D0D1A', tabBarBorder: '#222248', tabBarActive: '#8B8FFF',
  inputBg: '#1A1A30', inputBorder: '#333368',
  overlay: 'rgba(0,0,0,0.75)', shimmer: '#1A1A30', shimmerHighlight: '#222248',
  stitch: '#8B8FFF', stitchSoft: '#1E1E4B',
  levelBadge: '#2D2000', levelBadgeText: '#FBB024',
  streakFire: '#FF9600', xpGreen: '#58CC02',
};

// Backward-compatible static export — existing code `import { Colors }` still works
export const Colors = LightColors;

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
  mode: 'system', isDark: false, colors: LightColors,
  setMode: () => {}, toggle: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => {
      if (v === 'light' || v === 'dark' || v === 'system') setModeState(v as ThemeMode);
    }).catch(() => {});
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m).catch(() => {});
  };

  const systemDark = Appearance.getColorScheme() === 'dark';
  const isDark = mode === 'dark' || (mode === 'system' && systemDark);
  const colors = isDark ? DarkColors : LightColors;
  const toggle = () => setMode(isDark ? 'light' : 'dark');

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
  'quant-quarter':          { id: 'quant-quarter',          name: 'Quant Quarter',          primaryColor: '#5B5FCF', secondaryColor: '#8B8FFF', bgGradient: ['#0a0a1f', '#1a1040'], glowColor: 'rgba(91,95,207,0.4)',    particleColor: '#8B8FFF', emoji: '🏛️' },
  'blockchain-borough':     { id: 'blockchain-borough',     name: 'Blockchain Borough',     primaryColor: '#F7931A', secondaryColor: '#FBB024', bgGradient: ['#0f0a00', '#1f1200'], glowColor: 'rgba(247,147,26,0.4)',   particleColor: '#F7931A', emoji: '🔮' },
  'neural-nexus':           { id: 'neural-nexus',           name: 'Neural Nexus',           primaryColor: '#8B5CF6', secondaryColor: '#A78BFA', bgGradient: ['#0d0018', '#1a0030'], glowColor: 'rgba(139,92,246,0.45)', particleColor: '#A78BFA', emoji: '🧠' },
  'code-citadel':           { id: 'code-citadel',           name: 'Code Citadel',           primaryColor: '#0EA5E9', secondaryColor: '#38BDF8', bgGradient: ['#00101f', '#002040'], glowColor: 'rgba(14,165,233,0.4)',  particleColor: '#38BDF8', emoji: '🏰' },
  'shadow-vault':           { id: 'shadow-vault',           name: 'Shadow Vault',           primaryColor: '#EF4444', secondaryColor: '#F87171', bgGradient: ['#0f0000', '#200000'], glowColor: 'rgba(239,68,68,0.4)',   particleColor: '#F87171', emoji: '🛡️' },
  'logistics-labyrinth':    { id: 'logistics-labyrinth',    name: 'Logistics Labyrinth',    primaryColor: '#0EA5E9', secondaryColor: '#38BDF8', bgGradient: ['#000d1a', '#001f40'], glowColor: 'rgba(14,165,233,0.4)',  particleColor: '#38BDF8', emoji: '🔗' },
  'starknet-realm':         { id: 'starknet-realm',         name: 'Starknet Realm',         primaryColor: '#EC4899', secondaryColor: '#F472B6', bgGradient: ['#0a0015', '#1a0030'], glowColor: 'rgba(236,72,153,0.45)', particleColor: '#F472B6', emoji: '⚡' },
  'default':                { id: 'default',                name: 'Sifter World',           primaryColor: '#5B5FCF', secondaryColor: '#8B8FFF', bgGradient: ['#0a0a1f', '#111130'], glowColor: 'rgba(91,95,207,0.35)', particleColor: '#8B8FFF', emoji: '⚡' },
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
  'quant':                { color: '#5B5FCF', toolEmoji: '📊', screenLabel: 'Bloomberg Terminal',      deskItems: ['python-ide', 'probability-tree', 'backtest'] },
  'supply-chain':         { color: '#0EA5E9', toolEmoji: '🔗', screenLabel: 'Logistics Dashboard',     deskItems: ['sap-screen', 'shipping-map', 'inventory'] },
  'defi-research':        { color: '#10B981', toolEmoji: '🌊', screenLabel: 'DeFi Protocol Monitor',   deskItems: ['yield-curve', 'tvl-chart', 'liquidation'] },
  'starknet':             { color: '#EC4899', toolEmoji: '⚡', screenLabel: 'Cairo Dev Terminal',      deskItems: ['zk-proof', 'contract-editor', 'tx-feed'] },
  'starknet-defi-navigator': { color: '#EC4899', toolEmoji: '🧭', screenLabel: 'DeFi Navigator',      deskItems: ['pool-depth', 'yield-monitor', 'starkzap'] },
  'options-trading':      { color: '#8B5CF6', toolEmoji: '🎯', screenLabel: 'Options Chain',           deskItems: ['greeks-chart', 'vol-surface', 'expiry-cal'] },
  'ai-ml':                { color: '#06B6D4', toolEmoji: '🤖', screenLabel: 'Model Training Monitor', deskItems: ['gpu-rig', 'loss-curve', 'neural-net'] },
  'default':              { color: '#5B5FCF', toolEmoji: '💼', screenLabel: 'Analyst Workstation',     deskItems: ['spreadsheet', 'notepad', 'coffee'] },
};

export function getTrackTools(trackId: string) {
  return TRACK_TOOLS[trackId] ?? TRACK_TOOLS['default'];
}

// ─── Notification config ──────────────────────────────────────

export const NOTIFICATION_CONFIG = {
  provider:         'resend' as const,
  fromEmail:        'learn@sifter.app',
  fromName:         'Sifter Skill_Up',
  minIntervalHours: 4,
  weeklyDigestDay:  0,
  weeklyDigestHour: 9,
} as const;

// ─── Font stacks ──────────────────────────────────────────────

const _EMOJI_FONTS = [
  'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji', 'EmojiOne Color', 'Android Emoji', 'Twemoji Mozilla',
].join(', ');

const _SYSTEM_UI = Platform.select({
  web:     `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif, ${_EMOJI_FONTS}`,
  default: undefined,
});

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
