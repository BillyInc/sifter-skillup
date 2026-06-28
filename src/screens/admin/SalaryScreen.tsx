/**
 * SalaryScreen — salary benchmarks by domain. No data ships this phase: a local
 * `coming_soon` envelope drives ComingSoonPanel, so the surface reads as an
 * intentional placeholder rather than a fabricated benchmark.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight, webContainer } from "../../theme";
import { comingSoon } from "../../types/career";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

export function SalaryScreen() {
  const { colors } = useTheme();
  const state = comingSoon<never[]>("Salary benchmarks by domain are being populated.");

  return (
    <AdminShell title="Salary Benchmarks" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Salary benchmarks by domain
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Entry and mid-level pay ranges for the domains your programmes reach
            — sourced from aggregate market data.
          </Text>
          <ComingSoonPanel state={state}>{() => null}</ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default SalaryScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: -Spacing.xs,
  },
});
