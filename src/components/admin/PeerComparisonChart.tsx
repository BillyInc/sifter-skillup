/**
 * PeerComparisonChart — side-by-side bars comparing an institution's domain
 * count against peer institutions. Used in PeersScreen to give a quick visual
 * benchmark. The first bar is always "You" (the current institution), and
 * subsequent bars are peer institutions.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
} from "../../theme";

export interface PeerComparisonChartProps {
  myCount: number;
  peers: { name: string; count: number }[];
}

export function PeerComparisonChart({
  myCount,
  peers,
}: PeerComparisonChartProps) {
  const { colors } = useTheme();
  const allCounts = [myCount, ...peers.map((p) => p.count)];
  const max = Math.max(1, ...allCounts);

  return (
    <View style={styles.container}>
      {/* My institution bar */}
      <View style={styles.barRow}>
        <View style={styles.barCol}>
          <Text
            style={[styles.barLabel, { color: colors.text }]}
            numberOfLines={1}
          >
            You
          </Text>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${Math.round((myCount / max) * 100)}%`,
                backgroundColor: Brand.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.barCount, { color: colors.text }]}>
          {myCount}
        </Text>
      </View>

      {/* Peer bars */}
      {peers.map((peer, i) => (
        <View key={i} style={styles.barRow}>
          <View style={styles.barCol}>
            <Text
              style={[styles.barLabel, { color: colors.textSoft }]}
              numberOfLines={1}
            >
              {peer.name}
            </Text>
          </View>
          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${Math.round((peer.count / max) * 100)}%`,
                  backgroundColor: colors.accentDim,
                },
              ]}
            />
          </View>
          <Text style={[styles.barCount, { color: colors.textSoft }]}>
            {peer.count}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default PeerComparisonChart;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  barCol: {
    width: 100,
  },
  barLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  barTrack: {
    flex: 1,
    height: 22,
    borderRadius: Radius.sm,
    overflow: "hidden",
  },
  barFill: {
    height: 22,
    borderRadius: Radius.sm,
    minWidth: 4,
  },
  barCount: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.heavy,
    minWidth: 36,
    textAlign: "right",
  },
});