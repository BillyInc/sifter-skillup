/**
 * ProgrammeCompareScreen — lightweight student comparison.
 *
 * This deliberately compares selected programmes only. It does not expose a
 * bulk programme/domain graph export; students search, pick up to four, and see
 * a side-by-side decision view.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DataStateView, DomainChip } from "@/components/careerIntelligence";
import { SifterButton, SifterCard, SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import {
  type AdmissionInsight,
  type DataState,
  type DomainMatchType,
  type Programme,
  type ProgrammeSearchResult,
} from "@/types/career";
import {
  Brand,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
  webContainer,
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
    return () => {
      active = false;
    };
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity onPress={goBack} hitSlop={10} style={styles.back}>
        <Text style={[styles.backText, { color: colors.accent }]}>← Back</Text>
      </TouchableOpacity>

      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>COMPARE</Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Compare programmes side by side
      </Text>
      <Text style={[styles.lede, { color: colors.textSoft }]}>
        Pick two to four programmes and compare the domains, admission signal and
        build paths they open. This is a decision view, not a database export.
      </Text>

      <View
        style={[
          styles.search,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🔍</Text>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={canAdd ? "Search programme to add" : "Remove one to add another"}
          placeholderTextColor={colors.textMuted}
          editable={canAdd}
          autoCorrect={false}
          returnKeyType="search"
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

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
                    style={[
                      styles.searchRow,
                      {
                        backgroundColor: colors.card,
                        borderColor: added ? Brand.primary : colors.border,
                        opacity: added ? 0.62 : 1,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.searchTitle, { color: colors.text }]}>
                        {row.name}
                      </Text>
                      <Text style={[styles.searchMeta, { color: colors.textMuted }]}>
                        {row.discipline ?? row.institutionType}
                      </Text>
                    </View>
                    <Text style={[styles.addText, { color: Brand.primaryDeep }]}>
                      {added ? "Added" : "Add"}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </DataStateView>
      ) : null}

      {selectedIds.length < 2 ? (
        <SifterCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>⚖️</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Add at least two programmes
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textSoft }]}>
            Search above to build a comparison. Guests can inspect the view, but
            saving comparisons belongs in an account.
          </Text>
        </SifterCard>
      ) : (
        <View style={styles.compareWrap}>
          {items.map((item) => (
            <ProgrammeCompareCard
              key={item.id}
              item={item}
              onRemove={() => removeProgramme(item.id)}
              colors={colors}
              router={router}
            />
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
  colors: ReturnType<typeof useTheme>["colors"];
  router: ReturnType<typeof useRouter>;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardUtility}>
        <Text style={[styles.cardUtilityText, { color: colors.textMuted }]}>
          Selected programme
        </Text>
        <TouchableOpacity onPress={onRemove} hitSlop={8}>
          <Text style={[styles.remove, { color: colors.textMuted }]}>Remove</Text>
        </TouchableOpacity>
      </View>
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
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {programme.displayName ?? programme.name}
                  </Text>
                  <Text style={[styles.cardMeta, { color: colors.textMuted }]}>
                    {[programme.qualification, programme.discipline, programme.institutionType]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </View>
              </View>

              <View style={styles.metrics}>
                <MiniMetric label="Direct" value={counts.direct} colors={colors} />
                <MiniMetric label="Functional" value={counts.functional} colors={colors} />
                <MiniMetric label="Adjacent" value={counts.adjacent} colors={colors} />
              </View>

              {topDomains.length ? (
                <View style={styles.domainSection}>
                  <SectionHeader title="Top linked domains" />
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

              <AdmissionLine state={item.admission} colors={colors} />

              <View style={styles.actions}>
                <SifterButton
                  label="Open programme"
                  onPress={() => exploreNav.programme(router, programme.id)}
                  variant="track"
                  color={Brand.primary}
                  size="sm"
                  fullWidth={false}
                />
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => exploreNav.entrepreneurship(router)}
                  style={styles.linkBtn}
                >
                  <Text style={[styles.linkText, { color: Brand.primaryDeep }]}>
                    Build path →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      </DataStateView>
    </View>
  );
}

function MiniMetric({
  label,
  value,
  colors,
}: {
  label: string;
  value: number;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.metric, { backgroundColor: colors.bgSecondary }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function AdmissionLine({
  state,
  colors,
}: {
  state: DataState<AdmissionInsight>;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  const text =
    state.status === "real" && state.data
      ? `${state.data.label} · ${state.data.programmeCount} cutoff row${state.data.programmeCount === 1 ? "" : "s"}`
      : state.meta?.notice ?? "Admission signal is being compiled.";
  return (
    <View style={[styles.admissionLine, { backgroundColor: colors.goldSoft }]}>
      <Text style={[styles.admissionText, { color: Brand.primaryDeep }]}>
        🎓 {text}
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
  backText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.xxl * 1.16,
  },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },
  searchResults: { gap: Spacing.sm },
  searchRow: {
    minHeight: 56,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  searchTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.heavy },
  searchMeta: { fontSize: FontSize.xs, marginTop: 2 },
  addText: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
  emptyCard: { alignItems: "center", gap: Spacing.xs },
  emptyIcon: { fontSize: 34 },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  emptyBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
  },
  compareWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    alignItems: "stretch",
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexBasis: 280,
    flexGrow: 1,
    maxWidth: 520,
  },
  cardContent: { gap: Spacing.md },
  cardUtility: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardUtilityText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  cardMeta: { fontSize: FontSize.xs, marginTop: 4 },
  remove: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  metrics: {
    flexDirection: "row",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  metric: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minWidth: 86,
  },
  metricValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  metricLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
  },
  domainSection: { gap: Spacing.sm },
  domainChips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  admissionLine: {
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  admissionText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.sm * 1.4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  linkBtn: { minHeight: 38, justifyContent: "center" },
  linkText: { fontSize: FontSize.sm, fontWeight: FontWeight.black },
});
