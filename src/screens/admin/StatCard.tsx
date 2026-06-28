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
  FontWeight,
  Shadow,
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
        { backgroundColor: colors.card, borderColor: colors.border },
        Shadow.xs,
      ]}
    >
      <View style={styles.head}>
        <View
          style={[styles.iconWrap, { backgroundColor: colors.bgSecondary }]}
        >
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <Text
          style={[styles.label, { color: colors.textMuted }]}
          numberOfLines={2}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.value,
          { color: populated ? colors.text : colors.textMuted },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>

      {delta ? (
        <Text
          style={[
            styles.delta,
            { color: isUp ? colors.green : colors.textMuted },
          ]}
          numberOfLines={1}
        >
          {delta}
        </Text>
      ) : !populated ? (
        <Text
          style={[styles.delta, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          Coming soon
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
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
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
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.display * 1.1,
  },
  delta: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
});
