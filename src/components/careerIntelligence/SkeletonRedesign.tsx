import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Radius, Spacing, useTheme } from "../../theme";

// ── Skeleton shimmer primitives ────────────────────────────────
// Replaces the legacy opacity-pulse Skeleton with a proper shimmer set.

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

/** Base shimmer bar. */
export function Skeleton({
  width = "100%",
  height = 14,
  borderRadius = Radius.sm,
  style,
}: SkeletonProps) {
  const { colors } = useTheme();
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 200,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  return (
    <View
      style={[
        styles.bar,
        {
          width: width as number,
          height,
          borderRadius,
          backgroundColor: colors.shimmer,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            backgroundColor: colors.shimmerHighlight,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

// ── Preset skeletons ───────────────────────────────────────────

/** Single-line text skeleton. */
export function SkeletonText({ width = "60%", style }: { width?: number | string; style?: StyleProp<ViewStyle> }) {
  return <Skeleton width={width} height={12} style={style} />;
}

/** Avatar circle skeleton. */
export function SkeletonAvatar({ size = 40, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />;
}

/** Card skeleton — icon + two text lines. */
export function SkeletonCard({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, style]}>
      <Skeleton width={36} height={36} borderRadius={Radius.sm} />
      <View style={styles.cardLines}>
        <Skeleton width="55%" height={12} />
        <Skeleton width="35%" height={10} />
        <Skeleton width="25%" height={9} />
      </View>
    </View>
  );
}

/** List row skeleton — icon + two text lines + meta. */
export function SkeletonRow({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, style]}>
      <Skeleton width={32} height={32} borderRadius={Radius.sm} />
      <View style={styles.rowLines}>
        <Skeleton width="50%" height={12} />
        <Skeleton width="30%" height={9} />
      </View>
    </View>
  );
}

/** Stat tile skeleton — label + big number + delta. */
export function SkeletonStat({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, style]}>
      <Skeleton width={60} height={9} />
      <Skeleton width={80} height={20} style={{ marginTop: 6 }} />
      <Skeleton width={50} height={9} style={{ marginTop: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "relative",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 100,
    height: "100%",
    opacity: 0.5,
  },
  card: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  cardLines: {
    flex: 1,
    gap: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  rowLines: {
    flex: 1,
    gap: 5,
  },
  stat: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 2,
  },
});
