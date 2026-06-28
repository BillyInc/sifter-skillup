/**
 * DomainIntelligenceScreen — aggregate domain-level demand intelligence for the
 * institution. Composition only: the ranking comes from
 * adminData.getDomainRanking (a `coming_soon` envelope this phase), so the body
 * renders a graceful state via ComingSoonPanel — never a mock number.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, FontWeight, webContainer } from "../../theme";
import { adminData } from "../../lib/adminData";
import type { DataState } from "../../types/career";
import type { DomainRankItem } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

export function DomainIntelligenceScreen() {
  const { colors } = useTheme();
  const [domains, setDomains] = useState<DataState<DomainRankItem[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    adminData.getDomainRanking("nigerian").then((d) => {
      if (active) setDomains(d);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AdminShell title="Domain Intelligence" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Domain demand intelligence
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Which labour-market domains your programme mix routes into, ranked by
            aggregate demand — no individual student data.
          </Text>
          <ComingSoonPanel
            state={domains}
            empty={(rows) => rows.length === 0}
            emptyTitle="No domains yet"
            emptyBody="Domain demand rankings appear here once populated."
          >
            {() => null}
          </ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default DomainIntelligenceScreen;

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
