/**
 * ProgrammeCompareScreen — side-by-side programme comparison.
 *
 * Students search, pick up to four programmes, and see a side-by-side
 * decision view: domain match counts, top linked domains, admission signal.
 *
 * Phase 10 redesign: editorial header, responsive card grid, responsive
 * 2-column desktop layout, section nav, all legacy tokens migrated.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  DataStateView,
  DomainChip,
  ListRow,
  SearchBar,
  SectionLabel,
  NotesWidget,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import { displayAward } from "@/lib/programmeAward";
import { useResponsive } from "@/hooks/useResponsive";
import {
  type AdmissionInsight,
  type DataState,
  type DomainMatchType,
  type Programme,
  type ProgrammeSearchResult,
} from "@/types/career";
import {
  CompassFonts,
  FontSize,
  Radius,
  Spacing,
  useTheme,
  type ColorPalette,
} from "@/theme";

const MAX_COMPARE = 4;
const MIN_QUERY = 2;

type ComparedProgramme = {
  id: string;
  programme: DataState<Programme>;
  admission: DataState<AdmissionInsight>;
};

function readIds(raw: string | string[] | undefined): string[] {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return [];
  return value
    .split(",")
    .map((id) => decodeURIComponent(id.trim()))
    .filter(Boolean)
    .slice(0, MAX_COMPARE);
}

function matchCounts(programme?: Programme | null): Record<DomainMatchType, number> {
  const counts: Record<DomainMatchType, number> = {
    direct: 0,
    functional: 0,
    adjacent: 0,
  };
  for (const link of programme?.domains ?? []) counts[link.matchType] += 1;
  return counts;
}

export default function ProgrammeCompareScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const resp = useResponsive();
  const params = useLocalSearchParams<{ ids?: string | string[] }>();
  const seeded = useMemo(() => readIds(params.ids), [params.ids]);
  const hydratedSeedRef = useRef(false);

  const [selectedIds, setSelectedIds] = useState<string[]>(seeded);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<DataState<ProgrammeSearchResult[]> | null>(null);
  const [items, setItems] = useState<ComparedProgramme[]>([]);

  useEffect(() => {
    if (hydratedSeedRef.current) return;
    hydratedSeedRef.current = true;
    setSelectedIds(seeded);
  }, [seeded]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setSearch(null);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      const result = await careerData.searchProgrammes(q);
      if (active) setSearch(result);
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    let active = true;
    (async () => {
      const rows = await Promise.all(
        selectedIds.map(async (id) => ({
          id,
          programme: await careerData.getProgramme(id),
          admission: await careerData.getAdmissionInsight(id),
        })),
      );
      if (active) setItems(rows);
    })();
    return () => { active = false; };
  }, [selectedIds]);

  const canAdd = selectedIds.length < MAX_COMPARE;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const addProgramme = (id: string) => {
    if (!canAdd || selectedSet.has(id)) return;
    setSelectedIds((ids) => [...ids, id].slice(0, MAX_COMPARE));
    setQuery("");
    setSearch(null);
  };

  const removeProgramme = (id: string) => {
    setSelectedIds((ids) => ids.filter((item) => item !== id));
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/(tabs)/explore" as any);
  };

  const isDesktop = resp.isDesktop && resp.isWeb;
  const isTablet = resp.isTablet;

  const cardWidth = isDesktop ? "23%" : isTablet ? "48%" : "100%";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Back link ────────────────────────────────────────── */}
      <TouchableOpacity onPress={goBack} hitSlop={10} style={styles.back}>
        <Text style={[styles.backText, { color: colors.textRole.secondary }, CompassFonts.bodySemibold]}>
          Explore / Compare
        </Text>
      </TouchableOpacity>

      {/* ── Editorial hero ───────────────────────────────────── */}
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
          COMPARE
        </Text>
        <Text style={[styles.title, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>
          Compare programmes side by side
        </Text>
        <Text style={[styles.lede, { color: colors.textRole.secondary }]}>
          Pick two to four programmes and compare the domains, admission signal and
          build paths they open. This is a decision view, not a database export.
        </Text>
      </View>

      {/* ── Search ───────────────────────────────────────────── */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        scope="Programmes"
        placeholder={canAdd ? "Search programme to add" : "Remove one to add another"}
        editable={canAdd}
      />

      {search ? (
        <DataStateView
          state={search}
          empty={(rows) => rows.length === 0}
          emptyTitle="No programme matches"
          emptyBody="Try the standard programme name, like Nursing or Computer Science."
          compact
        >
          {(rows) => (
            <View style={styles.searchResults}>
              {rows.slice(0, 8).map((row) => {
                const added = selectedSet.has(row.id);
                return (
                  <TouchableOpacity
                    key={row.id}
                    activeOpacity={0.8}
                    onPress={() => addProgramme(row.id)}
                    disabled={added || !canAdd}
                  >
                    <ListRow
                      title={row.name}
                      subtitle={row.discipline ?? row.institutionType}
                      meta={added ? "Added" : "Tap to add"}
                      icon="book-open"
                      selected={added}
                      locked={!canAdd && !added}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </DataStateView>
      ) : null}

      {/* ── Empty state ────────────────────────────────────── */}
      {selectedIds.length < 2 ? (
        <View style={[styles.emptyCard, { borderColor: colors.borderRole.subtle }]}>
          <Feather name="columns" size={24} color={colors.textRole.muted} />
          <Text style={[styles.emptyTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Add at least two programmes
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textRole.secondary }]}>
            Search above to build a comparison. Guests can inspect the view, but
            saving comparisons belongs in an account.
          </Text>
        </View>
      ) : (
        /* ── Side-by-side comparison grid ───────────────────── */
        <View style={styles.compareWrap}>
          {items.map((item) => (
            <View key={item.id} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle, width: cardWidth }]}>
              <ProgrammeCompareCard
                item={item}
                onRemove={() => removeProgramme(item.id)}
                colors={colors}
                router={router}
              />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function ProgrammeCompareCard({
  item,
  onRemove,
  colors,
  router,
}: {
  item: ComparedProgramme;
  onRemove: () => void;
  colors: ColorPalette;
  router: ReturnType<typeof useRouter>;
}) {
  const exploreNav = useExploreNav();
  return (
    <DataStateView
      state={item.programme}
      empty={(programme) => programme.domains.length === 0}
      emptyTitle="Programme mapping pending"
      emptyBody="This programme is selected, but its domain links are not populated yet."
    >
      {(programme) => {
        const counts = matchCounts(programme);
        const topDomains = programme.domains.slice(0, 5);
        return (
          <View style={styles.cardContent}>
            {/* Card header */}
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]} numberOfLines={2}>
                  {programme.displayName ?? programme.name}
                </Text>
                <Text style={[styles.cardMeta, { color: colors.textRole.muted }]} numberOfLines={1}>
                  {/* displayAward, not the raw column — otherwise comparing
                      MBBS against Computer Science shows "B.Sc" here and
                      "MBBS/MBChB" on the programme page for the same row. */}
                  {[
                    displayAward(programme.name, programme.qualification),
                    programme.discipline,
                    programme.institutionType,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
              <TouchableOpacity onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
                <Feather name="x" size={14} color={colors.textRole.muted} />
              </TouchableOpacity>
            </View>

            {/* Domain match metrics */}
            <View style={styles.metrics}>
              <MiniMetric label="Direct" value={counts.direct} colors={colors} accent={colors.accentRole.action} />
              <MiniMetric label="Functional" value={counts.functional} colors={colors} accent={colors.demand} />
              <MiniMetric label="Adjacent" value={counts.adjacent} colors={colors} accent={colors.textRole.muted} />
            </View>

            {/* Top linked domains */}
            {topDomains.length ? (
              <View style={styles.domainSection}>
                <SectionLabel>Top domains</SectionLabel>
                <View style={styles.domainChips}>
                  {topDomains.map((domain) => (
                    <DomainChip
                      key={domain.domainId}
                      label={domain.domainName}
                      matchType={domain.matchType}
                      elite={domain.eliteFlag}
                      onPress={() => exploreNav.domain(router, domain.domainId)}
                    />
                  ))}
                </View>
              </View>
            ) : null}

            {/* Admission signal */}
            <AdmissionLine state={item.admission} colors={colors} />

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => exploreNav.programme(router, programme.id)}
                style={[styles.actionBtn, { backgroundColor: colors.accentRole.action }]}
              >
                <Text style={styles.actionBtnText}>Open programme</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => exploreNav.entrepreneurship(router)}
              >
                <Text style={[styles.actionLink, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
                  Build path →
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }}
    </DataStateView>
  );
}

function MiniMetric({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: number;
  colors: ColorPalette;
  accent: string;
}) {
  return (
    <View style={[styles.metric, { backgroundColor: colors.surface.subtle }]}>
      <Text style={[styles.metricValue, CompassFonts.data, { color: accent }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>{label}</Text>
    </View>
  );
}

function AdmissionLine({
  state,
  colors,
}: {
  state: DataState<AdmissionInsight>;
  colors: ColorPalette;
}) {
  const text =
    state.status === "real" && state.data
      ? `${state.data.label} · ${state.data.programmeCount} cutoff row${state.data.programmeCount === 1 ? "" : "s"}`
      : state.meta?.notice ?? "Admission signal is being compiled.";
  return (
    <View style={[styles.admissionLine, { backgroundColor: colors.surface.subtle }]}>
      <Feather name="bar-chart-2" size={12} color={colors.textRole.muted} style={{ marginRight: Spacing.xs }} />
      <Text style={[styles.admissionText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  back: { paddingVertical: 4 },
  backText: { fontSize: FontSize.xs },

  // ── Hero ──────────────────────────────────────────────────
  hero: { gap: 4, marginBottom: Spacing.sm },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.9,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.16,
  },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 4,
  },

  // ── Search ────────────────────────────────────────────────
  searchResults: { gap: Spacing.sm },

  // ── Empty ─────────────────────────────────────────────────
  emptyCard: {
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.xxl,
    marginTop: Spacing.md,
  },
  emptyTitle: { fontSize: FontSize.lg, textAlign: "center" },
  emptyBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
    maxWidth: 400,
  },

  // ── Comparison grid ───────────────────────────────────────
  compareWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    alignItems: "stretch",
    marginTop: Spacing.md,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexGrow: 1,
    minWidth: 240,
  },
  cardContent: { gap: Spacing.md },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  cardTitle: { fontSize: FontSize.md },
  cardMeta: { fontSize: FontSize.xs, marginTop: 2 },
  removeBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Metrics ───────────────────────────────────────────────
  metrics: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  metric: {
    flex: 1,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    alignItems: "center",
    gap: 2,
  },
  metricValue: { fontSize: FontSize.lg },
  metricLabel: { fontSize: FontSize.xs },

  // ── Domains ───────────────────────────────────────────────
  domainSection: { gap: Spacing.xs },
  domainChips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },

  // ── Admission ─────────────────────────────────────────────
  admissionLine: {
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
  },
  admissionText: { fontSize: FontSize.xs, flex: 1, lineHeight: FontSize.xs * 1.4 },

  // ── Actions ───────────────────────────────────────────────
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  actionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: FontSize.sm,
    fontFamily: "HankenGrotesk_600SemiBold",
  },
  actionLink: { fontSize: FontSize.sm },
});
