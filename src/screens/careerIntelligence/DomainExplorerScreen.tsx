/**
 * DomainExplorerScreen — the context-free map of every domain across all
 * clusters. Unlike the programme view, there is no user programme here, so
 * domains render as neutral chips (no Direct/Functional/Adjacent label).
 *
 * Supports filter chips: "All", "In-Demand", "Elite", plus one per cluster.
 * getDomainClusters currently returns a `coming_soon` envelope, so DataStateView
 * renders the graceful state; the populated branch below is what ships once the
 * domain map lands. Each chip taps through to its domain detail via exploreNav.
 */
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
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

type FilterKey = "all" | "in_demand" | "elite" | string; // cluster name for cluster chips

export function DomainExplorerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [filter, setFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
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

  // Derive unique cluster names from the data for cluster chips.
  const clusterKeys = useMemo(() => {
    if (!state.data) return [];
    const seen = new Set<string>();
    for (const g of state.data) {
      if (g.cluster && !seen.has(g.cluster)) seen.add(g.cluster);
    }
    return Array.from(seen);
  }, [state]);

  // Local filter across cluster + domain names; drops empty clusters.
  const filtered = useMemo(() => {
    if (!state.data) return state;
    let data = state.data;

    // Apply chip filter first
    if (activeFilter === "in_demand") {
      data = data
        .map((g) => ({
          ...g,
          domains: g.domains.filter((d) => (d.inDemandScore ?? 0) > 0),
        }))
        .filter((g) => g.domains.length > 0);
    } else if (activeFilter === "elite") {
      data = data
        .map((g) => ({
          ...g,
          domains: g.domains.filter((d) => d.eliteFlag),
        }))
        .filter((g) => g.domains.length > 0);
    } else if (activeFilter !== "all") {
      // Cluster filter: show only the cluster matching the selected name
      data = data.filter((g) => g.cluster === activeFilter);
    }

    // Apply text search on top of chip filter
    const q = filter.trim().toLowerCase();
    if (q) {
      data = data
        .map((g) => ({
          ...g,
          domains: g.domains.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              g.cluster.toLowerCase().includes(q),
          ),
        }))
        .filter((g) => g.domains.length > 0);
    }

    return { ...state, data };
  }, [state, filter, activeFilter]);

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

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        <FilterChip
          label="All"
          active={activeFilter === "all"}
          onPress={() => setActiveFilter("all")}
        />
        <FilterChip
          label="In-Demand"
          active={activeFilter === "in_demand"}
          onPress={() => setActiveFilter("in_demand")}
        />
        <FilterChip
          label="Elite"
          active={activeFilter === "elite"}
          onPress={() => setActiveFilter("elite")}
        />
        {clusterKeys.map((key) => (
          <FilterChip
            key={key}
            label={key}
            active={activeFilter === key}
            onPress={() => setActiveFilter(key)}
          />
        ))}
      </ScrollView>

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
                      elite={d.eliteFlag}
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

/** Inline filter chip — a small pill-shaped toggle. */
function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.filterChip,
        {
          backgroundColor: active ? Brand.primary : colors.card,
          borderColor: active ? Brand.primary : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.filterChipLabel,
          { color: active ? "#fff" : colors.textSoft },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
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
  chipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  filterChipLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
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