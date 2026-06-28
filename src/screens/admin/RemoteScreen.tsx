/**
 * RemoteScreen — remote-eligibility analysis for the institution's domains. No
 * data ships this phase: a local `coming_soon` envelope drives ComingSoonPanel,
 * so the page reads as an intentional placeholder, never a fake percentage.
 */
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight, webContainer } from "../../theme";
import { comingSoon } from "../../types/career";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

export function RemoteScreen() {
  const { colors } = useTheme();
  const state = comingSoon<never[]>("Remote-eligibility analysis is being populated.");

  return (
    <AdminShell title="Remote Eligibility" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Remote-eligibility analysis
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            What share of the roles your programmes unlock can be worked remotely
            — including globally remote opportunities.
          </Text>
          <ComingSoonPanel state={state}>{() => null}</ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default RemoteScreen;

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
