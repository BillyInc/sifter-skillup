/**
 * TrendsScreen — demand trends over time for the institution's domains. No
 * data ships this phase: a local `coming_soon` envelope drives ComingSoonPanel
 * so the page reads as an intentional, populated-later surface, not a blank.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight, webContainer } from "../../theme";
import { comingSoon } from "../../types/career";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

export function TrendsScreen() {
  const { colors } = useTheme();
  const state = comingSoon<never[]>("Demand trends over time are being populated.");

  return (
    <AdminShell title="Trends" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Demand trends over time
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            How demand for your domains is moving month over month — direction
            and momentum, aggregate only.
          </Text>
          <ComingSoonPanel state={state}>{() => null}</ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default TrendsScreen;

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
