/**
 * DomainExplorerScreen — the context-free map of every domain, across every
 * cluster. Masonry/editorial grid: cluster colour accent bar at top, Feather
 * icon, domain name, structural cluster and elite badge. Whole card is the tap
 * target.
 *
 * Filter chips: "All", plus "Elite" when anything actually qualifies, plus one
 * per cluster and text search. Market-demand filters are intentionally absent.
 *
 * Counts and cluster names come from GET /api/career/domains. Nothing on this
 * screen is a literal: the header used to claim "168 domains across 37
 * clusters" while getDomainClusters was a stub and the grid was empty.
 */
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  GuidanceReportButton,
} from "@/components/careerIntelligence";
import { StaggerReveal } from "@/components/animations";
import { careerData, type DomainClusterGroup } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import { pending, type DataState } from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  hScroll,
} from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { getClusterColor } from "@/data/clusterMaps";
import CareerDisclaimer from "@/components/careerIntelligence/CareerDisclaimer";

type FilterKey = "all" | "elite" | string;

// ─── Cluster identity map (from shared source) ─────────────

export function DomainExplorerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const resp = useResponsive();
  const [filter, setFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [state, setState] = useState<DataState<DomainClusterGroup[]>>(() =>
    pending<DomainClusterGroup[]>("Loading domains..."),
  );

  const loadDomains = useCallback(() => {
    setState(pending<DomainClusterGroup[]>("Loading domains..."));
    let active = true;
    void (async () => {
      const result = await careerData.getDomainClusters();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => loadDomains(), [loadDomains]);

  const clusterKeys = useMemo(() => {
    if (!state.data) return [];
    const seen = new Set<string>();
    for (const g of state.data) {
      if (g.cluster && !seen.has(g.cluster)) seen.add(g.cluster);
    }
    return Array.from(seen);
  }, [state]);

  /**
   * Counted from the payload, never asserted. This line read "168 domains
   * across 37 clusters" as a literal while the list beneath it was empty and
   * the real figures were 160 and 35 — a hardcoded number that was wrong AND
   * described data the screen did not have.
   */
  const counts = useMemo(() => {
    if (!state.data) return "";
    const domains = state.data.reduce((n, g) => n + g.domains.length, 0);
    if (!domains) return "";
    return `${domains} domain${domains === 1 ? "" : "s"} across ${
      state.data.length
    } cluster${state.data.length === 1 ? "" : "s"}`;
  }, [state]);

  /**
   * Elite is hidden unless something is actually flagged. No domain currently
   * carries elite_domain, so the chip was a filter guaranteed to return an
   * empty screen.
   */
  const hasElite = useMemo(
    () => (state.data ?? []).some((g) => g.domains.some((d) => d.eliteFlag)),
    [state],
  );
  const filtered = useMemo(() => {
    if (!state.data) return state;
    let data = state.data;

    if (activeFilter === "elite") {
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

  const clusterColWidth: DimensionValue = (resp.isDesktop ? "48%" : "100%") as DimensionValue;

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
        {counts}
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
        style={hScroll}
        contentContainerStyle={styles.chipRow}
        keyboardShouldPersistTaps="handled"
      >
        <FilterChip
          label="All"
          active={activeFilter === "all"}
          onPress={() => setActiveFilter("all")}
        />
        {hasElite ? (
          <FilterChip
            label="Elite"
            active={activeFilter === "elite"}
            onPress={() => setActiveFilter("elite")}
          />
        ) : null}
        {clusterKeys.map((key) => (
          <FilterChip
            key={key}
            label={key}
            active={activeFilter === key}
            onPress={() => setActiveFilter(key)}
          />
        ))}
      </ScrollView>

      <DataStateView state={filtered} empty={(g) => g.length === 0} spinnerOnPending={!filtered.data} onRetry={loadDomains}>
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
                          {g.domains.length} domain
                          {g.domains.length === 1 ? "" : "s"}
                        </Text>
                      </View>
                    </View>

                    {/* Domain cards */}
                    <View style={styles.domainGrid}>
                      {g.domains.map((d) => (
                        <View key={d.id} style={{ gap: Spacing.xs }}>
                          <TouchableOpacity
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
                          <GuidanceReportButton
                            selection={{ kind: "domains", id: d.id, name: d.name }}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                </StaggerReveal>
              );
            })}
          </View>
        )}
      </DataStateView>
      <CareerDisclaimer variant="footer" />
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
    alignItems: "center",
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
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
    flexDirection: "column",
    gap: Spacing.sm,
  },
  domainCard: {
    width: "100%",
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
