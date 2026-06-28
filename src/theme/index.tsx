/**
 * Sifter LevelUp — Design System v3
 * ─────────────────────────────────────────────────────────────
 * REPLACES: src/theme/index.ts
 *
 * Base token system aligned to the Sifter reference shell.
 * Backward-compatible: { Colors } still works everywhere.
 * New: Stitch palette, dark mode, FontWeight, useTheme hook,
 *      world themes, XP system, streak constants, track tools,
 *      animation presets, notification config, font stacks.
 *
 * Extra tokens added for Starknet:
 *   Colors.starknet = '#F59E0B' (amber, aligned to the audit refresh)
 */

import React, {
  createContext, useContext, useState, useEffect, type ReactNode,
} from 'react';
import { Platform } from 'react-native';
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
}

// ─── Light palette ────────────────────────────────────────────

export const LightColors: ColorPalette = {
  bg: '#F0F2F6', bgSecondary: '#F5F5F5', bgTertiary: '#E5E7EB',
  card: '#FFFFFF', cardElevated: '#FFFFFF', navy: '#111111',
  accent: '#111111', accentSoft: '#F5F5F5', accentDim: '#374151', accentDeep: '#000000',
  green: '#10B981', greenSoft: '#ECFDF5',
  red: '#EF4444', redSoft: '#FEF2F2',
  gold: '#F59E0B', goldSoft: '#FFF7ED',
  orange: '#F97316', orangeSoft: '#FFF7ED',
  text: '#111111', textSoft: '#374151', textMuted: '#6B7280', textInverse: '#FFFFFF',
  border: '#E5E7EB', borderDark: '#D1D5DB', borderFocus: '#111111',
  beginner: '#10B981', intermediate: '#F59E0B', pro: '#F59E0B',
  bitcoin: '#F7931A', ethereum: '#627EEA', defi: '#10B981', nft: '#8B5CF6',
  bridge: '#06B6D4', meme: '#EF4444', base: '#0052FF', ton: '#0088CC',
  bnb: '#F0B90B', solana: '#9945FF', starknet: '#F59E0B',
  tabBar: '#FFFFFF', tabBarBorder: '#E5E7EB', tabBarActive: '#111111',
  inputBg: '#F5F5F5', inputBorder: '#E5E7EB',
  overlay: 'rgba(17,17,17,0.46)', shimmer: '#F5F5F5', shimmerHighlight: '#E5E7EB',
  stitch: '#111111', stitchSoft: '#F5F5F5',
  levelBadge: '#FFF7ED', levelBadgeText: '#B45309',
  streakFire: '#F97316', xpGreen: '#10B981',
};

// ─── Dark palette ─────────────────────────────────────────────

export const DarkColors: ColorPalette = {
  bg: '#11141A', bgSecondary: '#171B22', bgTertiary: '#20252E',
  card: '#1A2029', cardElevated: '#202733', navy: '#F8FAFC',
  accent: '#E8EDF5', accentSoft: '#262D38', accentDim: '#B8C1CD', accentDeep: '#FFFFFF',
  green: '#34D399', greenSoft: '#102E27',
  red: '#F87171', redSoft: '#34181B',
  gold: '#F4B74A', goldSoft: '#342815',
  orange: '#FB923C', orangeSoft: '#392414',
  text: '#F4F7FB', textSoft: '#CBD5E1', textMuted: '#94A3B8', textInverse: '#11141A',
  border: '#2B3442', borderDark: '#3A4658', borderFocus: '#CBD5E1',
  beginner: '#34D399', intermediate: '#F4B74A', pro: '#F87171',
  bitcoin: '#F7931A', ethereum: '#7C96FF', defi: '#34D399', nft: '#A78BFA',
  bridge: '#22D3EE', meme: '#F87171', base: '#3B82F6', ton: '#38BDF8',
  bnb: '#FBB024', solana: '#B57AFF', starknet: '#F4B74A',
  tabBar: '#171B22', tabBarBorder: '#2B3442', tabBarActive: '#F4F7FB',
  inputBg: '#151A22', inputBorder: '#324051',
  overlay: 'rgba(6,10,16,0.76)', shimmer: '#1F2732', shimmerHighlight: '#2A3442',
  stitch: '#F4F7FB', stitchSoft: '#262D38',
  levelBadge: '#342815', levelBadgeText: '#F4B74A',
  streakFire: '#FB923C', xpGreen: '#34D399',
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

export const WEB_MAX_WIDTH = 1088;
export const webContainer = Platform.OS === 'web'
  ? { maxWidth: 1088, alignSelf: 'center' as const, width: '100%', paddingHorizontal: 14, paddingTop: 14 }
  : { paddingHorizontal: 14, paddingTop: 12 };

// ─── Brand ────────────────────────────────────────────────────
// Sifter LevelUp brand constants. The name is intentionally also the
// product's core call-to-action ("Level Up").

export const Brand = {
  name: 'Sifter LevelUp',
  short: 'LevelUp',
  tagline: 'See you at the top, fam.',
  promise: 'See the domains, roles and jobs your programme unlocks — local, global, remote.',
  // Accent used across brand surfaces (logo, splash, intro). Aligned to the
  // existing gold/amber accent so it never clashes with the neutral UI.
  primary: '#F59E0B',
  primaryDeep: '#B45309',
  onPrimary: '#FFFFFF',
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

// Data freshness / provenance, shown next to any data point.
export const DataFreshness = {
  verified: { icon: '✅', label: 'Verified', color: '#10B981' },
  inferred: { icon: '⚠️', label: 'Inferred', color: '#F59E0B' },
  pending:  { icon: '🕐', label: 'Pending',  color: '#6B7280' },
} as const;

// Storage key for the first-launch intro carousel.
export const INTRO_SEEN_KEY = '@sifter_levelup_intro_seen_v1';
