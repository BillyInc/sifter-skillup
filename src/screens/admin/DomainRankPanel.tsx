/**
 * DomainRankPanel — domains the institution's programmes route into, ranked by
 * posting volume, with an NG local / Global / NG remote scope toggle.
 *
 * The scope is lifted to the caller (the dashboard owns the active scope and
 * re-fetches adminData.getDomainRanking(scope)); this component only renders.
 * Data-gated through <ComingSoonPanel>, and every bar/figure is derived from
 * the row objects — no placeholder rankings.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
} from "../../theme";
import { ComingSoonPanel } from "./ComingSoonPanel";
import type { DataState } from "../../types/career";
import type { DomainRankItem, RankScope } from "../../types/institution";

const SCOPES: { value: RankScope; label: string }[] = [
  { value: "nigerian", label: "NG local" },
  { value: "global", label: "Global" },
  { value: "remote", label: "NG remote" },
];

export interface DomainRankPanelProps {
  state: DataState<DomainRankItem[]>;
  scope: RankScope;
  onScopeChange: (scope: RankScope) => void;
}

export function DomainRankPanel({
  state,
  scope,
  onScopeChange,
}: DomainRankPanelProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: Spacing.md }}>
      {/* Scope toggle */}
      <View style={[styles.toggle, { backgroundColor: colors.bgSecondary }]}>
        {SCOPES.map((s) => {
          const active = s.value === scope;
          return (
            <TouchableOpacity
              key={s.value}
              onPress={() => onScopeChange(s.value)}
              activeOpacity={0.8}
              style={[
                styles.toggleBtn,
                active && { backgroundColor: colors.card },
              ]}
            >
              <Text
                style={[
                  styles.toggleLabel,
                  { color: active ? colors.text : colors.textMuted },
                ]}
              >
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ComingSoonPanel
        state={state}
        empty={(items) => items.length === 0}
        emptyTitle="No ranked domains yet"
        emptyBody="Domain demand rankings appear once your programme mix is mapped."
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
                        style={[styles.rank, { color: colors.textMuted }]}
                      >
                        #{item.rank}
                      </Text>
                      <Text
                        style={[styles.domain, { color: colors.text }]}
                        numberOfLines={1}
                      >
                        {item.domainName}
                      </Text>
                      <Text style={[styles.count, { color: colors.text }]}>
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
                            backgroundColor: Brand.primary,
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
                  </View>
                );
              })}
            </View>
          );
        }}
      </ComingSoonPanel>
    </View>
  );
}

export default DomainRankPanel;

const styles = StyleSheet.create({
  toggle: {
    flexDirection: "row",
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  toggleLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  item: { gap: 4 },
  itemHead: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rank: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    minWidth: 22,
  },
  domain: { flex: 1, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  count: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy },
  barTrack: {
    height: 6,
    borderRadius: Radius.full,
    overflow: "hidden",
  },
  barFill: { height: 6, borderRadius: Radius.full },
  route: { fontSize: FontSize.xs },
});
