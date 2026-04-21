/**
 * Sifter Skill_Up — Base Component Library
 * Stitch visual language + Duolingo energy
 *
 * Components:
 *   SifterCard        — primary card shell (all variants)
 *   SifterButton      — primary / ghost / danger / track-coloured
 *   Badge             — pill badges (level, track, status, XP)
 *   LevelBadge        — the ⚡ LVL24 gold badge from Stitch header
 *   ProgressBar       — animated fill bar (XP, lesson, track progress)
 *   StatChip          — icon + number + label grid cell
 *   StatGrid          — 2x2 or 2x1 grid of StatChips
 *   SectionHeader     — title + optional right action
 *   Divider           — themed horizontal rule
 *   Tag               — small category pill (Scholar, Project Win, etc.)
 *   SkillBar          — named skill with percentage and animated fill
 *   AvatarBadge       — circular avatar with level ring
 *   EmptyStateCard    — illustrated empty state
 *   PressableCard     — card with press animation (scale + shadow)
 *
 * All components:
 *   - useTheme() for dark/light
 *   - spring-physics press animations via Animated
 *   - respond to touch with micro-interactions
 *   - Notion-meets-professional illustration aesthetic
 */

import React, { useRef, useEffect, type ReactNode } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ViewStyle, TextStyle, type StyleProp,
} from 'react-native';
import {
  useTheme, Spacing, Radius, FontSize, FontWeight,
  Shadow, AnimPreset,
} from '../../theme';

// ─── SifterCard ────────────────────────────────────────────────────────────────
// The primary surface unit. All content lives inside cards.

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;    // higher shadow tier
  accent?: string;       // left border accent colour
  noPadding?: boolean;
  onPress?: () => void;
}

export function SifterCard({
  children, style, elevated, accent, noPadding, onPress,
}: CardProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => onPress && Animated.spring(scale, { toValue: 0.98, ...AnimPreset.spring }).start();
  const onPressOut = () => onPress && Animated.spring(scale, { toValue: 1,    ...AnimPreset.spring }).start();

  const cardStyle: ViewStyle = {
    backgroundColor: elevated ? colors.cardElevated : colors.card,
    borderRadius: Radius.xl,
    padding: noPadding ? 0 : Spacing.lg,
    ...(elevated ? Shadow.md : Shadow.sm),
    ...(accent ? { borderLeftWidth: 3, borderLeftColor: accent } : {}),
    borderWidth: accent ? 0 : 1,
    borderColor: colors.border,
  };

  if (onPress) {
    return (
      <Animated.View style={[cardStyle, style, { transform: [{ scale }] }]}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          activeOpacity={1}
          style={{ flex: 1 }}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
}

// ─── PressableCard ─────────────────────────────────────────────────────────────
// Card with full press animation — scale + glow edge on press

interface PressableCardProps {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  glowColor?: string;
  disabled?: boolean;
}

export function PressableCard({
  children, onPress, style, glowColor, disabled,
}: PressableCardProps) {
  const { colors } = useTheme();
  const scale   = useRef(new Animated.Value(1)).current;
  const glow    = useRef(new Animated.Value(0)).current;

  const onPressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, ...AnimPreset.spring }),
      Animated.timing(glow,  { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();
  };
  const onPressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, ...AnimPreset.springGentle }),
      Animated.timing(glow,  { toValue: 0, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const borderColor = glowColor
    ? glow.interpolate({ inputRange: [0,1], outputRange: [colors.border, glowColor] })
    : colors.border;

  return (
    <Animated.View style={[
      {
        backgroundColor: colors.card,
        borderRadius: Radius.xl,
        borderWidth: 1.5,
        borderColor,
        ...Shadow.sm,
        transform: [{ scale }],
        overflow: 'hidden',
      },
      style,
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── SifterButton ──────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'success' | 'track';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  color?: string;       // overrides for 'track' variant
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function SifterButton({
  label, onPress, variant = 'primary', color,
  loading, disabled, icon, size = 'md', fullWidth = true, style,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn  = () => Animated.spring(scale, { toValue: 0.96, ...AnimPreset.spring }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1,    ...AnimPreset.springGentle }).start();

  const bg = variant === 'primary'  ? (color ?? colors.accent)
    : variant === 'danger'          ? colors.red
    : variant === 'success'         ? colors.xpGreen
    : variant === 'track'           ? (color ?? colors.accent)
    : 'transparent';

  const borderColor = variant === 'ghost' ? colors.accent : 'transparent';
  const txtColor    = variant === 'ghost' ? colors.accent : '#fff';

  const paddingV = size === 'sm' ? Spacing.sm : size === 'lg' ? Spacing.xl : Spacing.lg;
  const fontSize = size === 'sm' ? FontSize.sm : size === 'lg' ? FontSize.lg : FontSize.md;

  return (
    <Animated.View style={[
      fullWidth && { width: '100%' },
      { transform: [{ scale }] },
      style,
    ]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={loading || disabled}
        activeOpacity={1}
        style={{
          backgroundColor: bg,
          borderWidth: variant === 'ghost' ? 2 : 0,
          borderColor,
          borderRadius: Radius.xl,
          paddingVertical: paddingV,
          paddingHorizontal: Spacing.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
          opacity: (loading || disabled) ? 0.5 : 1,
          ...Shadow.sm,
        }}
      >
        {icon && <Text style={{ fontSize: fontSize + 2 }}>{icon}</Text>}
        <Text style={{
          color: txtColor,
          fontSize,
          fontWeight: FontWeight.heavy,
          letterSpacing: 0.2,
        }}>
          {loading ? '…' : label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Badge ─────────────────────────────────────────────────────────────────────
// Small pill for status, type, category

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'track' | 'scholar' | 'xp';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  icon?: string;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'default', color, icon, size = 'md' }: BadgeProps) {
  const { colors } = useTheme();

  const config: Record<BadgeVariant, { bg: string; text: string }> = {
    default:  { bg: colors.bgSecondary, text: colors.textSoft },
    success:  { bg: colors.greenSoft,   text: colors.green },
    warning:  { bg: colors.goldSoft,    text: colors.gold },
    danger:   { bg: colors.redSoft,     text: colors.red },
    info:     { bg: colors.accentSoft,  text: colors.accent },
    track:    { bg: color ? color + '20' : colors.accentSoft, text: color ?? colors.accent },
    scholar:  { bg: '#EDE9FF', text: '#5B21B6' },
    xp:       { bg: colors.greenSoft,   text: colors.xpGreen },
  };

  const { bg, text } = config[variant];
  const pad = size === 'sm' ? { paddingHorizontal: 6, paddingVertical: 2 } : { paddingHorizontal: Spacing.sm, paddingVertical: 3 };
  const fs  = size === 'sm' ? FontSize.xs : FontSize.sm;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: bg, borderRadius: Radius.full }, pad]}>
      {icon && <Text style={{ fontSize: fs }}>{icon}</Text>}
      <Text style={{ fontSize: fs, fontWeight: FontWeight.bold, color: text }}>{label}</Text>
    </View>
  );
}

// ─── LevelBadge ────────────────────────────────────────────────────────────────
// The gold ⚡ LVL24 badge from the Stitch header

interface LevelBadgeProps {
  level: number;
  style?: StyleProp<ViewStyle>;
}

export function LevelBadge({ level, style }: LevelBadgeProps) {
  const { colors } = useTheme();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[
      {
        backgroundColor: colors.levelBadge,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        ...Shadow.glowGold,
        transform: [{ scale: pulseAnim }],
      },
      style,
    ]}>
      <Text style={{ fontSize: FontSize.xs }}>⚡</Text>
      <Text style={{
        fontSize: FontSize.sm,
        fontWeight: FontWeight.black,
        color: colors.levelBadgeText,
        letterSpacing: 0.3,
      }}>
        LVL{level}
      </Text>
    </Animated.View>
  );
}

// ─── ProgressBar ───────────────────────────────────────────────────────────────
// Animated fill bar — snaps to value with spring, bounces slightly

interface ProgressBarProps {
  progress: number;          // 0–1
  color?: string;
  trackColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  progress, color, trackColor, height = 8,
  showLabel, label, animate = true, style,
}: ProgressBarProps) {
  const { colors } = useTheme();
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clipped   = Math.min(1, Math.max(0, progress));

  useEffect(() => {
    if (!animate) { widthAnim.setValue(clipped); return; }
    Animated.spring(widthAnim, {
      toValue: clipped,
      tension: 60,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [clipped]);

  return (
    <View style={[{ gap: Spacing.xs }, style]}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: colors.textSoft }}>
            {label ?? ''}
          </Text>
          <Text style={{ fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: color ?? colors.accent }}>
            {Math.round(clipped * 100)}%
          </Text>
        </View>
      )}
      <View style={{
        height,
        backgroundColor: trackColor ?? colors.bgSecondary,
        borderRadius: Radius.full,
        overflow: 'hidden',
      }}>
        <Animated.View style={{
          height,
          backgroundColor: color ?? colors.accent,
          borderRadius: Radius.full,
          width: widthAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
          }),
        }} />
      </View>
    </View>
  );
}

// ─── StatChip ──────────────────────────────────────────────────────────────────
// Single stat cell — icon, large number, label below

interface StatChipProps {
  icon: string;
  value: string | number;
  label: string;
  valueColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatChip({ icon, value, label, valueColor, style }: StatChipProps) {
  const { colors } = useTheme();
  return (
    <View style={[{
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      alignItems: 'flex-start',
      gap: Spacing.sm,
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      ...Shadow.xs,
    }, style]}>
      <View style={{
        width: 40, height: 40, borderRadius: Radius.lg,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
      </View>
      <Text style={{
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.black,
        color: valueColor ?? colors.text,
        lineHeight: FontSize.xxl * 1.2,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: FontSize.xs,
        fontWeight: FontWeight.semibold,
        color: colors.textMuted,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
      }}>
        {label}
      </Text>
    </View>
  );
}

// ─── StatGrid ──────────────────────────────────────────────────────────────────
// 2x2 grid of StatChips — used on HomeScreen and ProfileScreen

interface StatGridProps {
  stats: Array<{ icon: string; value: string | number; label: string; valueColor?: string }>;
  style?: StyleProp<ViewStyle>;
}

export function StatGrid({ stats, style }: StatGridProps) {
  const rows: typeof stats[] = [];
  for (let i = 0; i < stats.length; i += 2) rows.push(stats.slice(i, i + 2));

  return (
    <View style={[{ gap: Spacing.sm }, style]}>
      {rows.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {row.map((s, si) => (
            <StatChip key={si} {...s} />
          ))}
        </View>
      ))}
    </View>
  );
}

// ─── SectionHeader ─────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  icon?: string;
  action?: { label: string; onPress: () => void };
  style?: StyleProp<ViewStyle>;
}

export function SectionHeader({ title, icon, action, style }: SectionHeaderProps) {
  const { colors } = useTheme();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
        {icon && <Text style={{ fontSize: FontSize.lg }}>{icon}</Text>}
        <Text style={{
          fontSize: FontSize.lg,
          fontWeight: FontWeight.black,
          color: colors.text,
        }}>
          {title}
        </Text>
      </View>
      {action && (
        <TouchableOpacity onPress={action.onPress} activeOpacity={0.7}>
          <Text style={{
            fontSize: FontSize.sm,
            fontWeight: FontWeight.bold,
            color: colors.accent,
          }}>
            {action.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────

interface DividerProps {
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function Divider({ label, style }: DividerProps) {
  const { colors } = useTheme();
  if (label) return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }, style]}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <Text style={{ fontSize: FontSize.xs, color: colors.textMuted, fontWeight: FontWeight.medium }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
    </View>
  );
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

// ─── Tag ───────────────────────────────────────────────────────────────────────
// Small category pills — "Scholar Discussion", "Project Win", field tags

interface TagProps {
  label: string;
  color?: string;
  onPress?: () => void;
  active?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Tag({ label, color, onPress, active, style }: TagProps) {
  const { colors } = useTheme();
  const bg   = active
    ? (color ?? colors.accent)
    : (color ? color + '18' : colors.bgSecondary);
  const text = active ? '#fff' : (color ?? colors.textSoft);

  const inner = (
    <View style={[{
      backgroundColor: bg,
      borderRadius: Radius.full,
      paddingHorizontal: Spacing.md,
      paddingVertical: 6,
      borderWidth: active ? 0 : 1.5,
      borderColor: color ? color + '40' : colors.border,
    }, style]}>
      <Text style={{
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: text,
      }}>
        {label}
      </Text>
    </View>
  );

  if (onPress) return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>;
  return inner;
}

// ─── SkillBar ──────────────────────────────────────────────────────────────────
// Named skill with percentage — used in Portfolio screen

interface SkillBarProps {
  name: string;
  percent: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function SkillBar({ name, percent, color, style }: SkillBarProps) {
  const { colors } = useTheme();
  return (
    <View style={[{ gap: Spacing.xs }, style]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.bold,
          color: colors.text,
          letterSpacing: 0.3,
          textTransform: 'uppercase',
        }}>
          {name}
        </Text>
        <Text style={{
          fontSize: FontSize.sm,
          fontWeight: FontWeight.heavy,
          color: color ?? colors.accent,
        }}>
          {percent}%
        </Text>
      </View>
      <ProgressBar
        progress={percent / 100}
        color={color ?? colors.accent}
        height={6}
      />
    </View>
  );
}

// ─── AvatarBadge ───────────────────────────────────────────────────────────────
// Circular avatar with XP level ring

interface AvatarBadgeProps {
  emoji?: string;
  level?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
  ringColor?: string;
}

export function AvatarBadge({
  emoji = '👤', level, size = 44, style, ringColor,
}: AvatarBadgeProps) {
  const { colors } = useTheme();
  const ringAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ringAnim, { toValue: 1, duration: 2000, useNativeDriver: false }),
        Animated.timing(ringAnim, { toValue: 0, duration: 2000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const ring = ringColor ?? colors.accent;

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View style={{
        width: size + 6,
        height: size + 6,
        borderRadius: (size + 6) / 2,
        borderWidth: 2.5,
        borderColor: ringAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [ring + '80', ring],
        }),
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: colors.bgSecondary,
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
        </View>
      </Animated.View>
      {level != null && (
        <View style={{
          position: 'absolute', bottom: -4, right: -4,
          backgroundColor: colors.levelBadge,
          borderRadius: Radius.full,
          paddingHorizontal: 5, paddingVertical: 1,
          borderWidth: 1.5, borderColor: colors.card,
        }}>
          <Text style={{
            fontSize: 9, fontWeight: FontWeight.black,
            color: colors.levelBadgeText,
          }}>
            {level}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── EmptyStateCard ────────────────────────────────────────────────────────────

interface EmptyStateCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: { label: string; onPress: () => void };
}

export function EmptyStateCard({ icon, title, subtitle, action }: EmptyStateCardProps) {
  const { colors } = useTheme();
  return (
    <View style={{
      alignItems: 'center',
      padding: Spacing.xxxl,
      gap: Spacing.md,
    }}>
      <Text style={{ fontSize: 48 }}>{icon}</Text>
      <Text style={{
        fontSize: FontSize.lg,
        fontWeight: FontWeight.heavy,
        color: colors.text,
        textAlign: 'center',
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          fontSize: FontSize.sm,
          color: colors.textSoft,
          textAlign: 'center',
          lineHeight: FontSize.sm * 1.6,
        }}>
          {subtitle}
        </Text>
      )}
      {action && (
        <SifterButton
          label={action.label}
          onPress={action.onPress}
          size="sm"
          fullWidth={false}
          style={{ marginTop: Spacing.sm }}
        />
      )}
    </View>
  );
}

// ─── XPToast ───────────────────────────────────────────────────────────────────
// The "+10 XP" floating toast that appears after earning XP

interface XPToastProps {
  xp: number;
  visible: boolean;
  onHide: () => void;
}

export function XPToast({ xp, visible, onHide }: XPToastProps) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    translateY.setValue(0);
    opacity.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.spring(translateY, { toValue: -40, ...AnimPreset.spring }),
        Animated.timing(opacity,   { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
      Animated.delay(800),
      Animated.parallel([
        Animated.timing(translateY, { toValue: -60, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity,    { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]),
    ]).start(onHide);
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        alignSelf: 'center',
        backgroundColor: colors.xpGreen,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        opacity,
        transform: [{ translateY }],
        ...Shadow.glowGreen,
        zIndex: 999,
      }}
    >
      <Text style={{
        color: '#fff',
        fontSize: FontSize.md,
        fontWeight: FontWeight.black,
      }}>
        +{xp} XP
      </Text>
    </Animated.View>
  );
}

// ─── StreakBadge ───────────────────────────────────────────────────────────────
// The flame streak badge — pulses when at risk

interface StreakBadgeProps {
  streak: number;
  atRisk?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function StreakBadge({ streak, atRisk, style }: StreakBadgeProps) {
  const { colors } = useTheme();
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!atRisk) return;
    // Shake + pulse to signal urgency
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 3,  duration: 80,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -3, duration: 80,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 2,  duration: 60,  useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 60,  useNativeDriver: true }),
        Animated.delay(2000),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1,   duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, [atRisk]);

  const bg = atRisk ? colors.redSoft : colors.orangeSoft;
  const textColor = atRisk ? colors.red : colors.streakFire;

  return (
    <Animated.View style={[
      {
        backgroundColor: bg,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        transform: [
          { translateX: shakeAnim },
          { scale: scaleAnim },
        ],
      },
      style,
    ]}>
      <Text style={{ fontSize: FontSize.md }}>
        {atRisk ? '⚠️' : '🔥'}
      </Text>
      <Text style={{
        fontSize: FontSize.sm,
        fontWeight: FontWeight.black,
        color: textColor,
      }}>
        {streak}
      </Text>
    </Animated.View>
  );
}

// ─── TrackProgressCard ─────────────────────────────────────────────────────────
// The "Current Track" card from the Home screen — track name, progress, CTA

interface TrackProgressCardProps {
  trackName: string;
  progress: number;   // 0–1
  color: string;
  onContinue: () => void;
  label?: string;
}

export function TrackProgressCard({
  trackName, progress, color, onContinue, label,
}: TrackProgressCardProps) {
  const { colors } = useTheme();
  return (
    <SifterCard elevated style={{ gap: Spacing.md }}>
      <Text style={{
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: color,
        letterSpacing: 1,
        textTransform: 'uppercase',
      }}>
        {label ?? 'CURRENT TRACK'}
      </Text>
      <Text style={{
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.black,
        color: colors.text,
        lineHeight: FontSize.xxl * 1.2,
      }}>
        {trackName}
      </Text>
      <ProgressBar
        progress={progress}
        color={color}
        showLabel
        label="Progress"
      />
      <SifterButton
        label="Continue Learning →"
        onPress={onContinue}
        color={color}
        variant="track"
      />
    </SifterCard>
  );
}
