/**
 * VsNationalScreen — your institution vs the national aggregate. No data ships
 * this phase: a local `coming_soon` envelope drives ComingSoonPanel so the
 * comparison reads as an intentional placeholder, never a fabricated delta.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight, webContainer } from "../../theme";
import { comingSoon } from "../../types/career";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

export function VsNationalScreen() {
  const { colors } = useTheme();
  const state = comingSoon<never[]>(
    "Your institution vs national aggregate is being populated.",
  );

  return (
    <AdminShell title="vs National" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your institution vs national aggregate
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Where your programme mix's demand coverage sits against the national
            aggregate baseline — anonymous, aggregate only.
          </Text>
          <ComingSoonPanel state={state}>{() => null}</ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default VsNationalScreen;

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
