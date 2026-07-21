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
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import {
  DataStateView,
  DomainChip,
  FilterChip,
  SearchBar,
  SectionLabel,
} from "@/components/careerIntelligence";
import { careerData, type DomainClusterGroup } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import { comingSoon, type DataState } from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
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
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>
        EXPLORE
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }]}>
        Domain Explorer
      </Text>
      <Text style={[styles.subtitle, { color: colors.textRole.secondary }]}>
        Explore domains across every cluster
      </Text>

      <SearchBar
        value={filter}
        onChangeText={setFilter}
        scope="Domains"
        placeholder="Filter domains"
      />

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

      <Text style={[styles.note, { color: colors.textRole.muted }]}>
        The full domain map comes online with University and College of
        Education programmes first.
      </Text>

      <DataStateView state={filtered} empty={(g) => g.length === 0}>
        {(groups) => (
          <View style={styles.clusters}>
            {groups.map((g) => (
              <View key={g.cluster} style={styles.cluster}>
                <SectionLabel>{g.cluster}</SectionLabel>
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
    fontWeight: "600",
    letterSpacing: 0.9,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "600",
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  chipRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  note: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
  },
  clusters: { gap: Spacing.lg, marginTop: Spacing.xs },
  cluster: { gap: Spacing.sm },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
});
