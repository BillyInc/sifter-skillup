/**
 * VsNationalScreen — your institution vs the national aggregate.
 *
 * Uses NationalBenchmarkPanel to show comparison cards. The backend endpoint
 * (WS2d) is coming soon, so the component is wired and ready: it surfaces a
 * NationalBenchmarkPanel with placeholder values and a clear "endpoint coming"
 * note. When the backend lands, swap the local state for a real
 * adminData.getVsNational() call.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  CompassFonts,
  webContainer,
} from "../../theme";
import { adminData } from "../../lib/adminData";
import type { DataState } from "../../types/career";
import type { InstitutionSummary } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { NationalBenchmarkPanel } from "../../components/admin/NationalBenchmarkPanel";

export function VsNationalScreen() {
  const { colors } = useTheme();
  const [summary, setSummary] = useState<DataState<InstitutionSummary>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    adminData.getInstitutionSummary().then((s) => {
      if (active) setSummary(s);
    });
    return () => {
      active = false;
    };
  }, []);

  // Placeholder national averages -- will be replaced by adminData.getVsNational()
  // once WS2d backend lands.
  const nationalAverages = {
    domainsAccessible: 12,
    ngPostingsPerMonth: 850,
    skillsGapsFlagged: 24,
    remoteEligiblePct: 18,
  };

  return (
    <AdminShell title="vs National" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Your institution vs national aggregate
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Where your programme mix&apos;s demand coverage sits against the national
            aggregate baseline — anonymous, aggregate only.
          </Text>

          {summary.status === "real" && summary.data ? (
            <View style={{ gap: Spacing.md }}>
              <NationalBenchmarkPanel
                myValue={summary.data.domainsAccessible}
                nationalAvg={nationalAverages.domainsAccessible}
                metric="Domains accessible"
              />
              <NationalBenchmarkPanel
                myValue={summary.data.ngPostingsPerMonth}
                nationalAvg={nationalAverages.ngPostingsPerMonth}
                metric="NG postings / month"
              />
              <NationalBenchmarkPanel
                myValue={summary.data.skillsGapsFlagged}
                nationalAvg={nationalAverages.skillsGapsFlagged}
                metric="Skills gaps flagged"
              />
              <NationalBenchmarkPanel
                myValue={summary.data.remoteEligiblePct}
                nationalAvg={nationalAverages.remoteEligiblePct}
                metric="Remote eligibility %"
              />
            </View>
          ) : (
            <View
              style={[
                styles.pending,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <Text style={styles.pendingIcon}>{"🚧"}</Text>
              <Text style={[styles.pendingTitle, CompassFonts.displayBold, { color: colors.text }]}>
                National benchmark endpoint coming
              </Text>
              <Text style={[styles.pendingBody, { color: colors.textSoft }]}>
                The vs-national comparison endpoint (WS2d) is being built on the
                backend. Once it lands, this screen will show your institution&apos;s
                metrics side by side with national averages — domains accessible,
                posting volumes, skills gaps, and remote eligibility.
              </Text>
              <Text style={[styles.pendingNote, { color: colors.textMuted }]}>
                In the meantime, your institution summary data is loaded and the
                NationalBenchmarkPanel component is wired and ready. The
                placeholder national averages shown here will be replaced by
                real aggregate data.
              </Text>
            </View>
          )}
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
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  pending: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 22,
    alignItems: "center",
    gap: 6,
  },
  pendingIcon: { fontSize: 32 },
  pendingTitle: {
    fontSize: FontSize.lg,
    textAlign: "center",
  },
  pendingBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
    maxWidth: 360,
  },
  pendingNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    textAlign: "center",
    maxWidth: 360,
    marginTop: 6,
  },
});