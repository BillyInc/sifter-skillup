/**
 * PeersScreen — peer-institution domain-coverage benchmark. Reads
 * adminData.getPeerComparison and renders PeerComparisonChart.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  FontWeight,
  webContainer,
} from "../../theme";
import { adminData } from "../../lib/adminData";
import type { DataState } from "../../types/career";
import type { PeerInstitutionRow } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { PeerComparisonChart } from "../../components/admin/PeerComparisonChart";

export function PeersScreen() {
  const { colors } = useTheme();
  const [peers, setPeers] = useState<DataState<PeerInstitutionRow[]>>({
    status: "pending",
    data: null,
  });
  const [myDomains, setMyDomains] = useState<number>(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const [p, s] = await Promise.all([
        adminData.getPeerComparison(),
        adminData.getInstitutionSummary(),
      ]);
      if (!active) return;
      setPeers(p);
      if (s.status === "real" && s.data) {
        setMyDomains(s.data.domainsAccessible);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell title="Peer Comparison" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Peer-institution benchmarks
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            How your programme mix's domain coverage compares with peer
            institutions — aggregate only, no peer-level student data.
          </Text>
          <ComingSoonPanel
            state={peers}
            empty={(rows) => rows.length === 0}
            emptyTitle="No peers yet"
            emptyBody="Peer benchmarks appear here once populated."
          >
            {(rows) => (
              <PeerComparisonChart
                myCount={myDomains}
                peers={rows.map((p) => ({
                  name: p.institutionName,
                  count: p.domainsAccessible,
                }))}
              />
            )}
          </ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default PeersScreen;

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
  },
});