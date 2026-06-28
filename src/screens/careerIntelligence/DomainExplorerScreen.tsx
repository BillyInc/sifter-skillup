/**
 * DomainExplorerScreen — the context-free map of every domain across all
 * clusters. Unlike the programme view, there is no user programme here, so
 * domains render as neutral chips (no Direct/Functional/Adjacent label).
 *
 * getDomainClusters currently returns a `coming_soon` envelope, so DataStateView
 * renders the graceful state; the populated branch below is what ships once the
 * domain map lands. Each chip taps through to its domain detail via exploreNav.
 */
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { DataStateView, DomainChip } from "@/components/careerIntelligence";
import { careerData, type DomainClusterGroup } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import { comingSoon, type DataState } from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  webContainer,
} from "@/theme";

export function DomainExplorerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [state, setState] = useState<DataState<DomainClusterGroup[]>>(() =>
    comingSoon<DomainClusterGroup[]>(),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getDomainClusters();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Local filter across cluster + domain names; drops empty clusters.
  const filtered = useMemo(() => {
    if (!state.data) return state;
    const q = filter.trim().toLowerCase();
    if (!q) return state;
    const data = state.data
      .map((g) => ({
        ...g,
        domains: g.domains.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            g.cluster.toLowerCase().includes(q),
        ),
      }))
      .filter((g) => g.domains.length > 0);
    return { ...state, data };
  }, [state, filter]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>
        EXPLORE
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Domain Explorer
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSoft }]}>
        Explore domains across every cluster
      </Text>

      {/* Local filter */}
      <View
        style={[
          styles.search,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🔍</Text>
        <TextInput
          value={filter}
          onChangeText={setFilter}
          placeholder="Filter domains…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <Text style={[styles.note, { color: colors.textMuted }]}>
        🧭 The full domain map comes online with University & College of
        Education first.
      </Text>

      <DataStateView state={filtered} empty={(g) => g.length === 0}>
        {(groups) => (
          <View style={styles.clusters}>
            {groups.map((g) => (
              <View key={g.cluster} style={styles.cluster}>
                <Text style={[styles.clusterTitle, { color: colors.text }]}>
                  {g.cluster}
                </Text>
                <View style={styles.chips}>
                  {g.domains.map((d) => (
                    <DomainChip
                      key={d.id}
                      label={d.name}
                      matchType="direct"
                      showType={false}
                      onPress={() => exploreNav.domain(router, d.id)}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </DataStateView>
    </ScrollView>
  );
}

export default DomainExplorerScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    marginTop: Spacing.xs,
    minHeight: 44,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },
  note: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
  },
  clusters: { gap: Spacing.lg, marginTop: Spacing.xs },
  cluster: { gap: Spacing.sm },
  clusterTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
