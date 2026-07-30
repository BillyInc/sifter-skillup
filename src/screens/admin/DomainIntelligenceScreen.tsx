/**
 * DomainIntelligenceScreen — aggregate domain-level demand intelligence for the
 * institution. Composition only: the ranking comes from
 * adminData.getDomainRanking. Uses ScopeToggle to switch between Nigerian,
 * Global, and Remote scope. Renders a bar-ratio list for each domain.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  Brand,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import type { DataState } from "../../types/career";
import type { DomainRankItem, RankScope } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { ScopeToggle } from "@/components/admin/ScopeToggle";
import type { ScopeOption } from "@/components/admin/ScopeToggle";

export function DomainIntelligenceScreen() {
  const { colors } = useTheme();
  const [domains, setDomains] = useState<DataState<DomainRankItem[]>>({
    status: "pending",
    data: null,
  });
  const [scope, setScope] = useState<RankScope>("nigerian");

  useEffect(() => {
    let active = true;
    setDomains({ status: "pending", data: null });
    adminData.getDomainRanking(scope).then((d) => {
      if (active) setDomains(d);
    });
    return () => {
      active = false;
    };
  }, [scope]);

  return (
    <AdminShell title="Domain Intelligence" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Domain demand intelligence
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Which labour-market domains your programme mix routes into, ranked by
            the selected market lens. Global, Nigerian local and Nigerian remote
            demand stay separate — no averaged score, no individual student data.
          </Text>

          <ScopeToggle
            value={scope as ScopeOption}
            onChange={(s) => setScope(s as RankScope)}
          />

          <ComingSoonPanel
            state={domains}
            empty={(rows) => rows.length === 0}
            emptyTitle="No domains yet"
            emptyBody="Domain demand rankings appear here once populated."
          >
            {(items) => {
              const max = Math.max(
                1,
                ...items.map((i) => i.postingsPerMonth || 0),
              );
              return (
                <View style={{ gap: Spacing.sm }}>
                  {items.map((item) => {
                    const ratio =
                      item.barRatio != null
                        ? item.barRatio
                        : (item.postingsPerMonth || 0) / max;
                    return (
                      <View key={item.domainId} style={styles.item}>
                        <View style={styles.itemHead}>
                          <Text
                            style={[styles.rank, CompassFonts.displayBold, { color: colors.textMuted }]}
                          >
                            #{item.rank}
                          </Text>
                          <Text
                            style={[styles.domain, CompassFonts.bodyBold, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {item.domainName}
                          </Text>
                          <Text style={[styles.count, CompassFonts.bodyBold, { color: colors.text }]}>
                            {item.postingsPerMonth.toLocaleString()}/mo
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.barTrack,
                            { backgroundColor: colors.bgSecondary },
                          ]}
                        >
                          <View
                            style={[
                              styles.barFill,
                              {
                                backgroundColor: colors.accentRole.action,
                                width: `${Math.round(
                                  Math.min(1, Math.max(0, ratio)) * 100,
                                )}%`,
                              },
                            ]}
                          />
                        </View>

                        {item.routeNote ? (
                          <Text
                            style={[styles.route, { color: colors.textMuted }]}
                            numberOfLines={1}
                          >
                            {item.routeNote}
                          </Text>
                        ) : null}
                        {item.interpretation ? (
                          <Text
                            style={[styles.route, { color: colors.accentRole.action }]}
                            numberOfLines={1}
                          >
                            {item.interpretation}
                          </Text>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              );
            }}
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
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  item: { gap: 4 },
  itemHead: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rank: {
    fontSize: FontSize.xs,
    minWidth: 22,
  },
  domain: { flex: 1, fontSize: FontSize.sm },
  count: { fontSize: FontSize.xs },
  barTrack: {
    height: 6,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: Radius.full },
  route: { fontSize: FontSize.xs },
});
