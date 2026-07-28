/**
 * TrendsScreen — demand trends over time for the institution's domains.
 * Calls adminData.getDomainRanking(scope) to show domain demand data, with
 * ScopeToggle for NG local/Global/NG remote scopes.
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
import type { DomainRankItem, RankScope } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { ScopeToggle } from "../../components/admin/ScopeToggle";
import type { ScopeOption } from "../../components/admin/ScopeToggle";

export function TrendsScreen() {
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
    <AdminShell title="Trends" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Demand trends over time
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            How demand for your domains is moving month over month — direction
            and momentum, aggregate only.
          </Text>

          <ScopeToggle
            value={scope as ScopeOption}
            onChange={(s) => setScope(s as RankScope)}
          />

          <ComingSoonPanel
            state={domains}
            empty={(items) => items.length === 0}
            emptyTitle="No trends yet"
            emptyBody="Demand trends over time are being populated."
          >
            {(items) => (
              <View style={{ gap: Spacing.md }}>
                {items.map((item) => (
                  <View
                    key={item.domainId}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.cardHead}>
                      <Text
                        style={[styles.domainName, CompassFonts.bodyBold, { color: colors.text }]}
                      >
                        {item.domainName}
                      </Text>
                      <Text
                        style={[
                          styles.trendValue,
                          CompassFonts.bodyBold,
                          {
                            color:
                              item.trendDirection === "down"
                                ? colors.red
                                : colors.green,
                          },
                        ]}
                      >
                        {item.trendDirection === "up"
                          ? "▲"
                          : item.trendDirection === "down"
                          ? "▼"
                          : "→"}{" "}
                        {item.trendPct != null
                          ? `${Math.abs(item.trendPct)}%`
                          : "—"}
                      </Text>
                    </View>
                    <Text
                      style={[styles.postings, { color: colors.textMuted }]}
                    >
                      {item.postingsPerMonth.toLocaleString()} postings / month
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ComingSoonPanel>
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
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  card: {
    borderWidth: 1,
    borderRadius: 11,
    padding: 14,
    gap: 6,
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  domainName: {
    fontSize: FontSize.md,
  },
  trendValue: {
    fontSize: FontSize.sm,
  },
  postings: {
    fontSize: FontSize.sm,
  },
});
