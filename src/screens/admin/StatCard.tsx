/**
 * StatCard — one boardroom stat for the Programme Dashboard header row.
 *
 * Renders a label, an icon, a big value and an optional delta. The value is
 * never hand-typed: callers pass a {@link DataState} so an unpopulated stat
 * reads a dim "—" placeholder with the coming-soon notice rather than a fake
 * number. When real data lands, `select` pulls the figure out of the envelope.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
} from "../../theme";
import type { DataState } from "../../types/career";

export interface StatCardProps<T> {
  icon: string;
  label: string;
  /** The envelope the figure comes from. */
  state: DataState<T>;
  /** Pull the display value out of populated data. */
  select: (data: T) => string;
  /** Optional secondary delta line (e.g. "+12% YoY"), populated-only. */
  selectDelta?: (data: T) => string | undefined;
  /** Tint for the delta line; defaults to green for up, muted otherwise. */
  deltaPositive?: (data: T) => boolean;
}

export function StatCard<T>({
  icon,
  label,
  state,
  select,
  selectDelta,
  deltaPositive,
}: StatCardProps<T>) {
  const { colors } = useTheme();

  const populated = state.status === "real" && state.data != null;
  const value = populated ? select(state.data as T) : "—";
  const delta = populated && selectDelta ? selectDelta(state.data as T) : undefined;
  const isUp = populated && deltaPositive ? deltaPositive(state.data as T) : true;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <View style={styles.head}>
        <View
          style={[styles.iconWrap, { backgroundColor: colors.surface.subtle }]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text
          style={[styles.label, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          CompassFonts.data,
          { color: populated ? colors.textRole.primary : colors.textRole.muted },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      {delta ? (
        <Text
            style={[
              styles.delta,
              CompassFonts.bodySemibold,
              { color: isUp ? colors.success : colors.textRole.muted },
            ]}
          numberOfLines={1}
        >
          {delta}
        </Text>
      ) : !populated ? (
        <Text
          style={[styles.delta, CompassFonts.bodySemibold, { color: colors.state.locked }]}
          numberOfLines={1}
        >
          Locked
        </Text>
      ) : null}
    </View>
  );
}

export default StatCard;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  head: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 15 },
  label: {
    flex: 1,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  value: {
    fontSize: FontSize.display,
    letterSpacing: 0,
    lineHeight: FontSize.display * 1.1,
  },
  delta: { fontSize: FontSize.xs },
});
