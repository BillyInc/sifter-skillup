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
import { Feather } from "@expo/vector-icons";
import {
  DataStateView,
  DomainIcon,
  FilterChip,
  SearchBar,
  GuidanceReportButton,
} from "@/components/careerIntelligence";
import { StaggerReveal } from "@/components/animations";
import { careerData, type DomainClusterGroup } from "@/lib/careerData";
import { studentSummary } from "@/lib/careerLabels";
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
import { useAuth } from "@/hooks/useAuth";

type FilterKey = "all" | "elite" | string;

// ─── Cluster identity map (from shared source) ─────────────

export function DomainExplorerScreen({ intent = "explore" }: { intent?: "explore" | "build" }) {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const resp = useResponsive();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === "guest";
  const [filter, setFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [state, setState] = useState<DataState<DomainClusterGroup[]>>(() =>
    pending<DomainClusterGroup[]>("Loading domains..."),
  );

  const loadDomains = useCallback(() => {
    setState(pending<DomainClusterGroup[]>("Loading domains..."));
    if (isGuest) return () => undefined;
    let active = true;
    void (async () => {
      const result = await careerData.getDomainClusters();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, [isGuest]);

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

  if (isGuest) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.surface.base }} contentContainerStyle={styles.guestScroll}>
        <View style={[styles.guestCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <View style={[styles.guestIcon, { backgroundColor: colors.accentRole.action + "14" }]}>
            <DomainIcon cluster="Technology" size={22} rounded />
          </View>
          <Text style={[styles.eyebrow, { color: colors.accentRole.action }]}>CAREER MAP</Text>
          <Text style={[styles.guestTitle, { color: colors.textRole.primary }]}>{intent === "build" ? "Things you can build in each domain" : "Explore fields, domains and roles"}</Text>
          <Text style={[styles.guestBody, { color: colors.textRole.secondary }]}>{intent === "build" ? "Create an account to explore project, service and venture ideas connected to each field." : "Create an account to browse the full field map and save the domains, subgroups and roles that interest you."}</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/signup" as never)} style={styles.guestAction}>
            <Text style={[styles.guestActionText, { color: colors.accentRole.action }]}>Create account to start →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

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
        {intent === "build" ? "Things you can build in each domain" : "Choose a field to explore"}
      </Text>
      <Text
        style={[
          styles.subtitle,
          CompassFonts.bodyMedium,
          { color: colors.textRole.secondary },
        ]}
      >
        {intent === "build" ? "Choose a domain to explore projects, services and ventures that could grow from its work." : "Explore the domains, skills and roles inside each field."} {counts}
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
                <StaggerReveal key={g.cluster} index={idx} style={{ width: clusterColWidth, flexShrink: 0 }}>
                  <View
                    style={[
                      styles.clusterCol,
                      { width: "100%", borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised },
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
                        <Text style={[styles.clusterDescription, { color: colors.textRole.secondary }]}>Explore the domains, skills and roles inside this field.</Text>
                      </View>
                    </View>

                    {/* Domain cards */}
                    <View style={styles.domainGrid}>
                       {g.domains.map((d) => (
                        <View key={d.id} style={[styles.domainItem, { width: resp.isMobile ? "100%" : "48%" }]}>
                          <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={() => intent === "build"
                            ? exploreNav.entrepreneurship(router, { domainId: d.id })
                            : exploreNav.domain(router, d.id)}
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
                            <View style={styles.domainCardTop}>
                              <View style={[styles.domainIcon, { backgroundColor: getClusterColor(g.cluster) + "14" }]}>
                                <Feather name="compass" size={16} color={getClusterColor(g.cluster)} />
                              </View>
                              <Text style={[styles.domainCardAction, { color: colors.textRole.muted }]}>{intent === "build" ? "Build in this domain" : "Explore field"} <Feather name="arrow-up-right" size={13} color={colors.textRole.muted} /></Text>
                            </View>
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
                              <Text style={[styles.domainCardSummary, { color: colors.textRole.secondary }]} numberOfLines={3}>
                                {studentSummary({
                                  shortIntro: d.studentOrientation?.shortIntro,
                                  short_intro: d.studentOrientation?.short_intro,
                                  whatPeopleDo: d.studentOrientation?.whatPeopleDo,
                                  what_people_do: d.studentOrientation?.what_people_do,
                                  whatItStudies: d.studentOrientation?.whatItStudies,
                                  what_it_studies: d.studentOrientation?.what_it_studies,
                                  description: d.description,
                                  fallback: "A student-friendly summary is not available yet.",
                                })}
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
  guestScroll: {
    padding: Spacing.xl,
    flexGrow: 1,
    justifyContent: "center",
  },
  guestCard: {
    maxWidth: 680,
    alignSelf: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  guestIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  guestTitle: {
    fontSize: FontSize.xl,
    lineHeight: FontSize.xl * 1.18,
    ...CompassFonts.displaySemi,
  },
  guestBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.sm,
  },
  guestAction: { alignSelf: "flex-start", paddingVertical: Spacing.xs },
  guestActionText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
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
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  clusterCol: {
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  clusterHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(100, 116, 139, 0.18)",
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
  clusterDescription: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.4,
    marginTop: Spacing.xs,
  },

  // Domain cards — 2-column within each cluster
  domainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  domainItem: { gap: Spacing.xs },
  domainCard: {
    width: "100%",
    minHeight: 132,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    overflow: "hidden",
  },
  accentBar: {
    height: 5,
  },
    domainCardBody: {
    padding: Spacing.md,
    gap: Spacing.sm,
    minHeight: 112,
    justifyContent: "space-between",
      alignItems: "center",
    },
    domainCardSummary: {
      fontSize: FontSize.sm,
      lineHeight: 20,
      textAlign: "center",
    },
  domainCardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  domainIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  domainCardAction: {
    fontSize: FontSize.xs,
    ...CompassFonts.bodySemibold,
  },
  domainCardName: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.3,
    textAlign: "center",
  },
  eliteBadge: {
    alignSelf: "center",
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
