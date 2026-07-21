/**
 * StatTile — the career intelligence data-context contract.
 *
 * The category research is unanimous: a metric without context is noise. Every
 * tile frames its value with meaning — a comparison (delta vs a prior period or
 * benchmark), scope (units / active range), and freshness (a timestamp that makes
 * stale data *look* stale). Numerals use the mono data face and count up on mount.
 *
 *   ┌──────────────────┐
 *   │ 240              │  value   (Spline Sans Mono, xxxl)
 *   │ JAMB aggregate   │  label   (body 600, sm)
 *   │ ▲ 12 vs 2024     │  delta   (semantic colour + arrow)
 *   │ 2025 · indicative│  scope + freshness (mono, muted, xs)
 *   └──────────────────┘
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedReaction,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import {
  useTheme, Spacing, Radius, FontSize, CompassFonts,
} from '../../theme';
import { Timing, useReducedMotion } from '../../theme/motion';

export type StatTrend = 'up' | 'down' | 'flat';

export interface StatTileProps {
  /** The number to show. When numeric, it counts up from 0 on mount. */
  value: number | string;
  label: string;
  /** Optional prefix/suffix around a numeric value (₦, %, etc.). */
  prefix?: string;
  suffix?: string;
  /** Delta vs a benchmark — e.g. { trend: 'up', text: '12 vs 2024' }. */
  delta?: { trend: StatTrend; text: string };
  /** Scope + freshness stamp, e.g. "2025 · indicative". */
  stamp?: string;
  /** Desaturate + flag when the datum is stale (> ~12 months). */
  stale?: boolean;
  /** Accent for the value (defaults to ink). */
  tone?: string;
  style?: ViewStyle;
}

export function StatTile({
  value, label, prefix, suffix, delta, stamp, stale, tone, style,
}: StatTileProps) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const isNum = typeof value === 'number';
  const target = isNum ? (value as number) : 0;

  const progress = useSharedValue(reduced || !isNum ? target : 0);
  const [shown, setShown] = useState(reduced || !isNum ? target : 0);

  useEffect(() => {
    if (!isNum) return;
    if (reduced) { setShown(target); return; }
    progress.value = 0;
    progress.value = withTiming(target, Timing.count);
  }, [target, isNum, reduced, progress]);

  useAnimatedReaction(
    () => progress.value,
    (v) => { runOnJS(setShown)(Math.round(v)); },
    [],
  );

  const display = isNum ? `${prefix ?? ''}${shown}${suffix ?? ''}` : `${value}`;
  const deltaColor =
    delta?.trend === 'up' ? colors.success
    : delta?.trend === 'down' ? colors.danger
    : colors.textMuted;
  const arrow = delta?.trend === 'up' ? '▲' : delta?.trend === 'down' ? '▼' : '▪';

  return (
    <View
      style={[
        styles.tile,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
        style,
      ]}
    >
      <Text
        style={[
          styles.value,
          CompassFonts.data,
          { color: stale ? colors.textRole.muted : (tone ?? colors.textRole.primary) },
        ]}
        numberOfLines={1}
      >
        {display}
      </Text>
      <Text style={[styles.label, { color: colors.textRole.secondary }]} numberOfLines={2}>
        {label}
      </Text>
      {delta ? (
        <Text style={[styles.delta, { color: deltaColor }]} numberOfLines={1}>
          {arrow} {delta.text}
        </Text>
      ) : null}
      {stamp ? (
        <Text
          style={[styles.stamp, CompassFonts.data, { color: colors.textRole.muted }]}
          numberOfLines={1}
        >
          {stale ? '⚑ ' : ''}{stamp}
        </Text>
      ) : null}
    </View>
  );
}

export default StatTile;

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    minWidth: 128,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 3,
  },
  value: { fontSize: FontSize.xxxl, letterSpacing: 0 },
  label: { fontSize: FontSize.sm, fontWeight: '600', marginTop: 2 },
  delta: { fontSize: FontSize.xs, fontWeight: '700', marginTop: 2 },
  stamp: { fontSize: FontSize.xs, marginTop: 2, letterSpacing: 0 },
});
