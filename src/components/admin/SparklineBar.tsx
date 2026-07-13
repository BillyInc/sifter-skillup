/**
 * SparklineBar — a small, left-to-right bar chart rendered from a number[]
 * (the sparkline from ProgrammeDemandRow). Compact enough to sit inside a table
 * cell, using themed colours. Values are normalised to the max of the data set.
 */
import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme, Radius, Brand } from "../../theme";

export interface SparklineBarProps {
  data: number[];
  height?: number;
  color?: string;
}

export function SparklineBar({
  data,
  height = 24,
  color,
}: SparklineBarProps) {
  if (!data || data.length === 0) return null;

  const barColor = color ?? Brand.primary;
  const max = Math.max(1, ...data);
  const barWidth = Math.max(3, Math.floor(100 / data.length) - 1);

  return (
    <View style={[styles.container, { height }]}>
      {data.map((v, i) => {
        const ratio = Math.max(0.02, v / max);
        return (
          <View
            key={i}
            style={[
              styles.bar,
              {
                height: `${Math.round(ratio * 100)}%` as any,
                width: barWidth,
                backgroundColor: barColor,
                borderTopLeftRadius: Radius.sm,
                borderTopRightRadius: Radius.sm,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default SparklineBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },
  bar: {
    minHeight: 2,
  },
});