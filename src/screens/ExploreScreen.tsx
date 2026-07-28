/**
 * ExploreScreen — the core entry point (and the guest landing).
 *
 * This is where every user searches → sees the fields (domains), roles and
 * programmes their term maps to. The disambiguation search is the heart of the
 * screen: a student types "nursing" or "data scientist" and sees ALL their
 * options grouped — the domains that match, the roles that match (each listing
 * which domains it's reachable from, so they pick context), and the programmes
 * that match.
 *
 * When the query is empty (<2 chars) the screen falls back to the three SS3
 * "doors" and the browse links — the onboarding entry points.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  webContainer,
  type TierType,
} from "../theme";
import {
  DataStateView,
  LockedPill,
  TierBadgeView,
  InfoTooltip,
  CoachMark,
  FilterChip,
  ListRow,
  SearchBar,
  SectionLabel,
} from "../components/careerIntelligence";
import { SifterButton, SifterCard, PressableCard } from "../components/ui";
import { careerData } from "../lib/careerData";
import { exploreNav } from "../lib/exploreNav";
import { locked, type DataState, type CareerSearchResult } from "../types/career";
import { useAuth } from "../hooks/useAuth";

const DOORS = [
  {
    key: "know",
    icon: "🎯",
    title: "I know what & where",
    body: "Pick your programme and see the fields and jobs it unlocks.",
    live: true,
  },
  {
    key: "what",
    icon: "🏫",
    title: "I know what, not where",
    body: "See which institutions offer it, with JAMB & Post-UTME cut-offs.",
    live: true,
  },
  {
    key: "unsure",
    icon: "🧭",
    title: "I don't know yet",
    body: "Enter your strongest subjects and see the programmes you qualify for.",
    live: true,
  },
];

const MIN_QUERY = 2;
const TIERS: readonly TierType[] = ["entry", "mid", "senior"];
type ResultFilter = "all" | "domains" | "roles" | "programmes";
const asTier = (t?: string): TierType | undefined =>
  t && (TIERS as readonly string[]).includes(t) ? (t as TierType) : undefined;

const isEmptyResult = (r: CareerSearchResult): boolean =>
  r.domains.length === 0 && r.roles.length === 0 && r.programmes.length === 0;

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { user, signInGuest } = useAuth();
  const router = useRouter();
  const isGuest = !user || user.auth_provider === "guest";
  const hasSession = Boolean(user);

  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>(["Medicine", "Data analyst", "Law"]);
  // Only hold a result state once the term is searchable (>=2 chars), so the
  // three-door onboarding shows until the user has meaningfully typed.
  const [results, setResults] = useState<DataState<CareerSearchResult> | null>(
    null,
  );

  // Debounced disambiguation search — searchCareer returns all three groups
  // (domains, roles, programmes) wrapped in a DataState the view renders.
  useEffect(() => {
    const q = query.trim();
    setLoading(false);
    if (q.length < MIN_QUERY) {
      setResults(null);
      return;
    }
    if (!hasSession) {
      setResults(
        locked<CareerSearchResult>(
          "Start a guest session to search programmes, fields and roles.",
        ),
      );
      return;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const state = await careerData.searchCareer(q);
      if (active) {
        setResults(state);
        setLoading(false);
      }
    }, 275);
    return () => {
      active = false;
      clearTimeout(t);
      setLoading(false);
    };
  }, [hasSession, query]);

  const trimmed = query.trim();
  const searching = trimmed.length >= MIN_QUERY;
  const filters = useMemo(
    () => [
      { value: "all" as const, label: "All" },
      { value: "domains" as const, label: "Domains" },
      { value: "roles" as const, label: "Roles" },
      { value: "programmes" as const, label: "Programmes" },
    ],
    [],
  );

  const rememberSearch = () => {
    const q = query.trim();
    if (q.length < MIN_QUERY) return;
    setRecents((prev) => [q, ...prev.filter((item) => item.toLowerCase() !== q.toLowerCase())].slice(0, 5));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>
        EXPLORE
      </Text>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          Find your field, role{"\n"}or programme
        </Text>
        <InfoTooltip
          label="Field, role, programme"
          text="A field (domain) is an area of work. A role is a specific job within it. A programme is what you study. Search any of them — we'll show how they connect."
        />
      </View>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.surface.subtle,
              borderColor: colors.borderRole.subtle,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: colors.textRole.secondary }]}>
            You&apos;re browsing as a guest. Create an account to save matches and
            get alerts.
          </Text>
          {!hasSession ? (
            <SifterButton
              label="Continue as guest"
              onPress={() => void signInGuest()}
              variant="track"
              color={colors.accentRole.action}
              size="sm"
              fullWidth={false}
            />
          ) : null}
        </View>
      ) : null}

      {/* Disambiguation search */}
      <CoachMark
        storageKey="explore-intro-v1"
        text="Search a programme, field or job here — or scroll down and pick a starting point that fits where you are."
      >
        <SearchBar
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          scope={filters.find((item) => item.value === filter)?.label ?? "All"}
          placeholder="Search programmes, domains or roles"
          loading={loading}
          onSubmitEditing={rememberSearch}
        />
      </CoachMark>

      <View style={styles.filterRow}>
        {filters.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            active={filter === item.value}
            onPress={() => setFilter(item.value)}
          />
        ))}
      </View>

      {trimmed.length > 0 && trimmed.length < MIN_QUERY ? (
        <Text style={[styles.stateLine, { color: colors.textRole.muted }]}>
          Type at least {MIN_QUERY} characters to search the career map.
        </Text>
      ) : null}

      {!searching ? (
        <>
          <SearchIdleState
            recents={recents}
            onPick={(term) => {
              setQuery(term);
              searchRef.current?.focus();
            }}
          />
          <ExploreStartingPoints
            onFocusSearch={() => searchRef.current?.focus()}
            router={router}
          />
        </>
      ) : isGuest ? (
        <GuestLimitedSearch query={trimmed} onStartGuest={() => void signInGuest()} />
      ) : loading ? (
        <SearchLoadingRows />
      ) : searching && results ? (
        // ── Results mode ────────────────────────────────────────────
        <DataStateView
          state={results}
          empty={isEmptyResult}
          emptyTitle={`No matches for “${trimmed}”`}
          emptyBody="Try a broader term — a field, a job title, or a programme."
        >
          {(data) => (
            <View style={styles.results}>
              {/* Fields (domains) */}
              {(filter === "all" || filter === "domains") && data.domains.length ? (
                <View style={styles.group}>
                  <SectionLabel>Domains</SectionLabel>
                  {data.domains.map((d) => (
                    <ListRow
                      key={d.id}
                      onPress={() => exploreNav.domain(router, d.id)}
                      icon="compass"
                      title={d.name}
                      subtitle={d.cluster}
                      meta="Domain route"
                    />
                  ))}
                </View>
              ) : null}

              {/* Roles — each lists the domains it's reachable from */}
              {(filter === "all" || filter === "roles") && data.roles.length ? (
                <View style={styles.group}>
                  <SectionLabel>Roles</SectionLabel>
                  {data.roles.map((r, ri) => {
                    const single =
                      r.domains.length === 1 ? r.domains[0] : undefined;
                    const roleBody = (
                      <View>
                        <View style={styles.roleHead}>
                          <Text
                            style={[styles.rowTitle, { color: colors.textRole.primary }]}
                            numberOfLines={2}
                          >
                            {r.name}
                          </Text>
                          <TierBadgeView tier={asTier(r.tier)} />
                        </View>
                        {single ? (
                          <Text
                            style={[
                              styles.rowMeta,
                              { color: colors.textRole.muted },
                            ]}
                            numberOfLines={1}
                          >
                            in {single.domainName}
                          </Text>
                        ) : (
                          <View style={styles.chips}>
                            {r.domains.map((ctx) => (
                              <TouchableOpacity
                                key={ctx.roleKey}
                                activeOpacity={0.75}
                                onPress={() =>
                                  exploreNav.role(router, ctx.roleKey)
                                }
                                style={[
                                  styles.chip,
                                  {
                                    backgroundColor: colors.surface.subtle,
                                    borderColor: colors.borderRole.subtle,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.chipText,
                                    { color: colors.textRole.secondary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {ctx.domainName}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    );

                    // One domain → the whole row taps straight to that role.
                    return single ? (
                      <PressableCard
                        key={`${r.name}-${ri}`}
                        onPress={() => exploreNav.role(router, single.roleKey)}
                        glowColor={colors.accentRole.action}
                      >
                        {roleBody}
                      </PressableCard>
                    ) : (
                      <SifterCard key={`${r.name}-${ri}`}>{roleBody}</SifterCard>
                    );
                  })}
                </View>
              ) : null}

              {/* Programmes */}
              {(filter === "all" || filter === "programmes") && data.programmes.length ? (
                <View style={styles.group}>
                  <View style={styles.groupHead}>
                    <SectionLabel>Programmes</SectionLabel>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        exploreNav.compare(
                          router,
                          data.programmes.slice(0, 4).map((p) => p.id),
                        )
                      }
                      style={styles.compareLink}
                    >
                      <Text style={[styles.compareText, { color: colors.accentRole.action }]}>
                        Compare visible →
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {data.programmes.map((p) => {
                    const meta = p.discipline ?? p.institutionType;
                    return (
                      <ListRow
                        key={p.id}
                        onPress={() => exploreNav.programme(router, p.id)}
                        icon="book-open"
                        title={p.name}
                        subtitle={meta}
                        meta={p.institutionType ?? "Programme"}
                      />
                    );
                  })}
                </View>
              ) : null}
            </View>
          )}
        </DataStateView>
      ) : (
        <DataLimitedState />
      )}
    </ScrollView>
  );
}

function SearchIdleState({
  recents,
  onPick,
}: {
  recents: string[];
  onPick: (term: string) => void;
}) {
  const { colors } = useTheme();
  const suggestions = ["Nursing", "Software engineer", "Accounting", "Civil engineering"];
  return (
    <View style={styles.commandState}>
      <View style={styles.commandGroup}>
        <SectionLabel>Suggested searches</SectionLabel>
        <View style={styles.filterRow}>
          {suggestions.map((term) => (
            <FilterChip key={term} label={term} onPress={() => onPick(term)} />
          ))}
        </View>
      </View>
      {recents.length ? (
        <View style={styles.commandGroup}>
          <SectionLabel>Recent</SectionLabel>
          {recents.map((term) => (
            <ListRow
              key={term}
              title={term}
              subtitle="Search again"
              meta="Recent query"
              icon="clock"
              onPress={() => onPick(term)}
            />
          ))}
        </View>
      ) : null}
      <View
        style={[
          styles.dataNotice,
          { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
        ]}
      >
        <Text style={[styles.dataNoticeText, { color: colors.textRole.secondary }]}>
          Search is grouped by domains, roles and programmes. Guest previews stay limited.
        </Text>
      </View>
    </View>
  );
}

function SearchLoadingRows() {
  return (
    <View style={styles.results}>
      <SectionLabel>Searching</SectionLabel>
      <ListRow title="Loading domain matches" icon="search" loading />
      <ListRow title="Loading role matches" icon="briefcase" loading />
      <ListRow title="Loading programme matches" icon="book-open" loading />
    </View>
  );
}

function GuestLimitedSearch({
  query,
  onStartGuest,
}: {
  query: string;
  onStartGuest: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.guestPanel,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <SectionLabel>Guest preview</SectionLabel>
      <Text style={[styles.guestTitle, { color: colors.textRole.primary }]}>
        Limited results for &ldquo;{query}&rdquo;
      </Text>
      <Text style={[styles.guestBody, { color: colors.textRole.secondary }]}>
        Start a guest session to see preview rows. Create an account later to save,
        compare and unlock full browsing.
      </Text>
      <View style={styles.guestRows}>
        <ListRow title="Programme matches" subtitle="Preview available after guest session" meta="Limited" icon="book-open" locked />
        <ListRow title="Role matches" subtitle="Preview available after guest session" meta="Limited" icon="briefcase" locked />
      </View>
      <SifterButton
        label="Start guest preview"
        onPress={onStartGuest}
        variant="track"
        color={colors.accentRole.action}
        size="sm"
        fullWidth={false}
      />
    </View>
  );
}

function ExploreStartingPoints({
  onFocusSearch,
  router,
}: {
  onFocusSearch: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.commandGroup}>
      <SectionLabel>Starting points</SectionLabel>
      {DOORS.map((d) => (
        <TouchableOpacity
          key={d.key}
          activeOpacity={0.85}
          onPress={
            d.key === "know"
              ? onFocusSearch
              : d.key === "what"
                ? () =>
                    router.push(
                      "/(tabs)/explore/admission?mode=programme" as never,
                    )
                : () =>
                    router.push(
                      "/(tabs)/explore/admission?mode=subjects" as never,
                    )
          }
          style={[
            styles.card,
            { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
          ]}
        >
          <View style={[styles.cardIconBox, { backgroundColor: colors.surface.subtle }]}>
            <Text style={styles.cardIcon}>{d.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeadRow}>
              <Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>
                {d.title}
              </Text>
              {d.live ? null : <LockedPill />}
            </View>
            <Text style={[styles.cardBody, { color: colors.textRole.secondary }]}>
              {d.body}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.browseGrid}>
        <BrowseLink label="Browse all domains" onPress={() => exploreNav.domains(router)} />
        <BrowseLink label="Compare programmes" onPress={() => exploreNav.compare(router)} />
        <BrowseLink label="Explore elite pathways" onPress={() => exploreNav.elitePathways(router)} />
        <BrowseLink label="Special pathways" onPress={() => exploreNav.pathways(router)} />
      </View>

      <Text style={[styles.note, { color: colors.textRole.muted }]}>
        University and College of Education programmes come online first. Other
        institution types, opportunities and elite pathways are being populated.
      </Text>
    </View>
  );
}

function BrowseLink({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.76}
      onPress={onPress}
      style={[
        styles.browse,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={[styles.browseText, { color: colors.accentRole.action }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DataLimitedState() {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.dataNotice,
        { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
      ]}
    >
      <SectionLabel>Data-limited</SectionLabel>
      <Text style={[styles.dataNoticeText, { color: colors.textRole.secondary }]}>
        This query is valid, but the current data source did not return a visible group.
        Try a broader term or switch the result filter.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.display * 1.15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  banner: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.sm * 1.4,
  },
  stateLine: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    marginTop: -Spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  commandState: {
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  commandGroup: { gap: Spacing.sm },
  dataNotice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.md,
  },
  dataNoticeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.xs * 1.5,
  },
  guestPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  guestTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  guestBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  guestRows: { gap: Spacing.sm, marginTop: Spacing.xs },

  // ── Results ──────────────────────────────────────────────────
  results: { gap: Spacing.lg, marginTop: Spacing.xs },
  group: { gap: Spacing.sm },
  groupHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  compareLink: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: Spacing.xs,
  },
  compareText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    minHeight: 44,
  },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  rowMeta: { fontSize: FontSize.xs, marginTop: 2 },
  roleHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
  },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: "center",
    maxWidth: "100%",
  },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },

  // ── Onboarding ───────────────────────────────────────────────
  browse: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexGrow: 1,
    flexBasis: 180,
  },
  browseGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  browseText: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardIcon: { fontSize: 18 },
  cardHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  note: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    marginTop: Spacing.md,
  },
});
