/**
 * DomainExplorerScreen — the context-free map of every domain across all
 * 37 clusters. Masonry/editorial grid: cluster colour accent bar at top,
 * Feather icon, domain name, subgroup count, demand meter (teal), elite
 * badge. Whole card is the tap target.
 *
 * Supports filter chips: "All", "In-Demand", "Elite", plus text search.
 * getDomainClusters currently returns a `coming_soon` envelope, so
 * DataStateView renders the graceful state; the populated branch is what
 * ships once the domain map lands.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  type DimensionValue,
} from "react-native";
import { useRouter } from "expo-router";
import {
  DataStateView,
  DomainIcon,
  FilterChip,
  SearchBar,
} from "@/components/careerIntelligence";
import { StaggerReveal } from "@/components/animations";
import { careerData, type DomainClusterGroup } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import { comingSoon, type DataState } from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
} from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

type FilterKey = "all" | "in_demand" | "elite" | string;

// ─── Cluster identity map (from shared source) ─────────────
import { getClusterColor, getClusterIcon } from "@/data/clusterMaps";

export function DomainExplorerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const resp = useResponsive();
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

  const clusterKeys = useMemo(() => {
    if (!state.data) return [];
    const seen = new Set<string>();
    for (const g of state.data) {
      if (g.cluster && !seen.has(g.cluster)) seen.add(g.cluster);
    }
    return Array.from(seen);
  }, [state]);

  const filtered = useMemo(() => {
    if (!state.data) return state;
    let data = state.data;

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
      data = data.filter((g) => g.cluster === activeFilter);
    }

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

  const clusterColWidth: DimensionValue = (resp.columns >= 2
    ? `${(100 / resp.columns) - 1.5}%`
    : "100%") as DimensionValue;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text
        style={[
          styles.eyebrow,
          CompassFonts.bodySemibold,
          { color: colors.textRole.muted },
        ]}
      >
        EXPLORE
      </Text>
      <Text
        style={[
          styles.title,
          CompassFonts.bodySemibold,
          { color: colors.textRole.primary },
        ]}
      >
        Domain Explorer
      </Text>
      <Text
        style={[
          styles.subtitle,
          CompassFonts.bodyMedium,
          { color: colors.textRole.secondary },
        ]}
      >
        168 domains across 37 clusters
      </Text>

      <SearchBar
        value={filter}
        onChangeText={setFilter}
        scope="Domains"
        placeholder="Filter domains"
      />

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

      <DataStateView state={filtered} empty={(g) => g.length === 0}>
        {(groups) => (
          <View style={styles.masonry}>
            {groups.map((g, idx) => {
              return (
                <StaggerReveal key={g.cluster} index={idx}>
                  <View
                    style={[
                      styles.clusterCol,
                      { width: clusterColWidth },
                    ]}
                  >
                    {/* Cluster header */}
                    <View style={styles.clusterHeader}>
                      <DomainIcon
                        cluster={g.cluster}
                        size={16}
                        rounded
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.clusterName,
                            CompassFonts.bodySemibold,
                            { color: colors.textRole.primary },
                          ]}
                          numberOfLines={1}
                        >
                          {g.cluster}
                        </Text>
                        <Text
                          style={[
                            styles.clusterCount,
                            CompassFonts.bodyMedium,
                            { color: colors.textRole.muted },
                          ]}
                        >
                          {g.domains.length} domains
                        </Text>
                      </View>
                    </View>

                    {/* Domain cards */}
                    <View style={styles.domainGrid}>
                      {g.domains.map((d) => (
                        <TouchableOpacity
                          key={d.id}
                          activeOpacity={0.85}
                          onPress={() => exploreNav.domain(router, d.id)}
                          style={[
                            styles.domainCard,
                            {
                              backgroundColor: colors.surface.raised,
                              borderColor: colors.borderRole.subtle,
                            },
                          ]}
                        >
                          {/* Colour accent bar */}
                          <View
                            style={[
                              styles.accentBar,
                              { backgroundColor: getClusterColor(g.cluster) },
                            ]}
                          />
                          <View style={styles.domainCardBody}>
                            <Text
                              style={[
                                styles.domainCardName,
                                CompassFonts.bodySemibold,
                                { color: colors.textRole.primary },
                              ]}
                              numberOfLines={2}
                            >
                              {d.name}
                            </Text>

                            {/* Demand meter */}
                            {(d.inDemandScore ?? 0) > 0 ? (
                              <View style={styles.demandRow}>
                                <View
                                  style={[
                                    styles.demandBar,
                                    {
                                      backgroundColor:
                                        colors.accentRole.success + "20",
                                    },
                                  ]}
                                >
                                  <View
                                    style={[
                                      styles.demandFill,
                                      {
                                        backgroundColor:
                                          colors.accentRole.success,
                                        width: `${Math.min(
                                          100,
                                          ((d.inDemandScore ?? 0) / 10) * 100,
                                        )}%`,
                                      },
                                    ]}
                                  />
                                </View>
                                <Text
                                  style={[
                                    styles.demandLabel,
                                    CompassFonts.bodySemibold,
                                    {
                                      color: colors.accentRole.success,
                                    },
                                  ]}
                                >
                                  Demand
                                </Text>
                              </View>
                            ) : null}

                            {d.eliteFlag ? (
                              <View
                                style={[
                                  styles.eliteBadge,
                                  {
                                    backgroundColor: colors.accentRole.warning + "15",
                                    borderColor: colors.accentRole.warning + "30",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.eliteText,
                                    CompassFonts.bodySemibold,
                                    { color: colors.accentRole.warning },
                                  ]}
                                >
                                  Elite
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </StaggerReveal>
              );
            })}
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
    letterSpacing: 0.9,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
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

  // Masonry grid
  masonry: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  clusterCol: {
    gap: Spacing.sm,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  clusterIconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterName: {
    fontSize: FontSize.sm,
  },
  clusterCount: {
    fontSize: FontSize.xs,
    marginTop: 1,
  },

  // Domain cards — 2-column within each cluster
  domainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  domainCard: {
    width: "48%",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  accentBar: {
    height: 3,
  },
  domainCardBody: {
    padding: Spacing.sm,
    gap: 4,
  },
  domainCardName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.3,
  },
  demandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  demandBar: {
    flex: 1,
    height: 3,
    borderRadius: 1.5,
    overflow: "hidden",
  },
  demandFill: {
    height: "100%",
    borderRadius: 1.5,
  },
  demandLabel: {
    fontSize: 9,
  },
  eliteBadge: {
    alignSelf: "flex-start",
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  eliteText: {
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
