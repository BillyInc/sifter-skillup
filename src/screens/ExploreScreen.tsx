/**
 * ExploreScreen — the core entry point (and the guest landing).
 *
 * Editorial front page with:
 *  1. Scoped disambiguation search (domains, roles, programmes)
 *  2. Hero cluster carousel (8 signature clusters with signature colours)
 *  3. Browse clusters / pathways / admission intelligence / elite pathways
 *  4. Typed search results grouped by domain → role → programme
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
import { Feather } from "@expo/vector-icons";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  type TierType,
} from "@/theme";
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
} from "@/components/careerIntelligence";
import { SifterButton, SifterCard, PressableCard } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import { locked, type DataState, type CareerSearchResult } from "@/types/career";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";
import { StaggerReveal } from "@/components/animations/StaggerReveal";

// ─── Cluster hero data ───────────────────────────────────────────
// The 8 signature clusters from BUILD_PLAN.md with their defined
// colours and Feather icon mappings. The full 37 clusters live on
// the DomainExplorerScreen.
const CLUSTER_HEROES: {
  id: string;
  name: string;
  color: string;
  icon: keyof typeof Feather.glyphMap;
  route: string;
}[] = [
  { id: "ict",     name: "Technology",       color: "#3B3AC4", icon: "code",          route: "ICT" },
  { id: "health",  name: "Health",           color: "#0E9F6E", icon: "heart",         route: "Health" },
  { id: "eng",     name: "Engineering",      color: "#D97706", icon: "tool",          route: "Engineering" },
  { id: "finance", name: "Finance",          color: "#0D9488", icon: "trending-up",   route: "Financial Services" },
  { id: "legal",   name: "Legal",            color: "#111111", icon: "shield",        route: "Legal" },
  { id: "agri",    name: "Agriculture",      color: "#F5A65B", icon: "sun",           route: "Agriculture" },
  { id: "edu",     name: "Education",        color: "#2563EB", icon: "book-open",     route: "Education" },
  { id: "creative",name: "Creative",         color: "#F5A65B", icon: "star",          route: "Creative" },
];

const PATHWAYS = [
  { key: "phd",     label: "PhD & Research",   icon: "book" as const },
  { key: "change",  label: "Career Change",     icon: "repeat" as const },
  { key: "creds",   label: "Credentials",       icon: "award" as const },
  { key: "upgrade", label: "Qualification Upgrades", icon: "arrow-up" as const },
  { key: "entre",   label: "Entrepreneurship",  icon: "briefcase" as const },
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
  const responsive = useResponsive();
  const isGuest = !user || user.auth_provider === "guest";
  const hasSession = Boolean(user);

  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [loading, setLoading] = useState(false);
  const [recents, setRecents] = useState<string[]>(["Medicine", "Data analyst", "Law"]);
  const [results, setResults] = useState<DataState<CareerSearchResult> | null>(
    null,
  );

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

  const padH = responsive.isWide ? Spacing.xxl : responsive.isDesktop ? Spacing.xl : Spacing.lg;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[
        styles.scroll,
        { paddingHorizontal: padH },
        responsive.isWeb ? { maxWidth: 1088, width: "100%", alignSelf: "center" } : null,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>
        EXPLORE
      </Text>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.textRole.primary }]}>
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

      {/* ── Search ────────────────────────────────────────────── */}
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

      {/* ── Idle / Search / Results ────────────────────────────── */}
      {!searching ? (
        <ExploreIdle
          recents={recents}
          isGuest={isGuest}
          router={router}
          onPick={(term) => {
            setQuery(term);
            searchRef.current?.focus();
          }}
          onFocusSearch={() => searchRef.current?.focus()}
        />
      ) : isGuest ? (
        <GuestLimitedSearch query={trimmed} onStartGuest={() => void signInGuest()} />
      ) : loading ? (
        <SearchLoadingRows />
      ) : searching && results ? (
        <DataStateView
          state={results}
          empty={isEmptyResult}
          emptyTitle={`No matches for \u201c${trimmed}\u201d`}
          emptyBody="Try a broader term — a field, a job title, or a programme."
        >
          {(data) => (
            <View style={styles.results}>
              {(filter === "all" || filter === "domains") && data.domains.length ? (
                <View style={styles.group}>
                  <SectionLabel>Domains</SectionLabel>
                  {data.domains.map((d, i) => (
                    <StaggerReveal key={d.id} index={i}>
                      <ListRow
                        onPress={() => exploreNav.domain(router, d.id)}
                        icon="compass"
                        title={d.name}
                        subtitle={d.cluster}
                        meta="Domain route"
                      />
                    </StaggerReveal>
                  ))}
                </View>
              ) : null}

              {(filter === "all" || filter === "roles") && data.roles.length ? (
                <View style={styles.group}>
                  <SectionLabel>Roles</SectionLabel>
                  {data.roles.map((r, ri) => {
                    const single = r.domains.length === 1 ? r.domains[0] : undefined;
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
                            style={[styles.rowMeta, { color: colors.textRole.muted }]}
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
                                onPress={() => exploreNav.role(router, ctx.roleKey)}
                                style={[
                                  styles.chip,
                                  {
                                    backgroundColor: colors.surface.subtle,
                                    borderColor: colors.borderRole.subtle,
                                  },
                                ]}
                              >
                                <Text
                                  style={[styles.chipText, { color: colors.textRole.secondary }]}
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
                    return (
                      <StaggerReveal key={`${r.name}-${ri}`} index={ri}>
                        {single ? (
                          <PressableCard
                            onPress={() => exploreNav.role(router, single.roleKey)}
                            glowColor={colors.accentRole.action}
                          >
                            {roleBody}
                          </PressableCard>
                        ) : (
                          <SifterCard>{roleBody}</SifterCard>
                        )}
                      </StaggerReveal>
                    );
                  })}
                </View>
              ) : null}

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
                  {data.programmes.map((p, i) => {
                    const meta = p.discipline ?? p.institutionType;
                    return (
                      <StaggerReveal key={p.id} index={i}>
                        <ListRow
                          onPress={() => exploreNav.programme(router, p.id)}
                          icon="book-open"
                          title={p.name}
                          subtitle={meta}
                          meta={p.institutionType ?? "Programme"}
                        />
                      </StaggerReveal>
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

// ─── Idle state (editorial front page) ───────────────────────────

function ExploreIdle({
  recents,
  isGuest,
  router,
  onPick,
  onFocusSearch,
}: {
  recents: string[];
  isGuest: boolean;
  router: ReturnType<typeof useRouter>;
  onPick: (term: string) => void;
  onFocusSearch: () => void;
}) {
  const { colors } = useTheme();
  const { isMobile, columns } = useResponsive();
  return (
    <View style={styles.idle}>
      {/* ── Hero cluster carousel ──────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Explore by field</SectionLabel>
        {isMobile ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.clusterCarousel}
            decelerationRate="fast"
            snapToInterval={CLUSTER_CARD_W + Spacing.sm}
            snapToAlignment="start"
          >
            {CLUSTER_HEROES.map((c, i) => (
              <StaggerReveal key={c.id} index={i}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    router.push("/(tabs)/explore/domains" as never);
                  }}
                  style={[styles.clusterCard, { borderColor: c.color + "30" }]}
                >
                  <View style={[styles.clusterIconWrap, { backgroundColor: c.color + "12" }]}>
                    <Feather name={c.icon} size={22} color={c.color} />
                  </View>
                  <Text style={[styles.clusterCardName, { color: colors.textRole.primary }]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              </StaggerReveal>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.clusterGrid}>
            {CLUSTER_HEROES.map((c, i) => {
              const cardW = columns === 2 ? "48%" : columns === 3 ? "30%" : "22%";
              return (
                <StaggerReveal key={c.id} index={i}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => {
                      router.push("/(tabs)/explore/domains" as never);
                    }}
                    style={[
                      styles.clusterGridCard,
                      { borderColor: c.color + "30", width: cardW },
                    ]}
                  >
                    <View style={[styles.clusterIconWrap, { backgroundColor: c.color + "12" }]}>
                      <Feather name={c.icon} size={22} color={c.color} />
                    </View>
                    <Text style={[styles.clusterCardName, { color: colors.textRole.primary }]}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                </StaggerReveal>
              );
            })}
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => exploreNav.domains(router)}
          style={styles.seeAllLink}
        >
          <Text style={[styles.seeAllText, { color: colors.accentRole.action }]}>
            Browse all 37 clusters →
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Pathways strip ────────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Pathways</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pathwayCarousel}
        >
          {PATHWAYS.map((p, i) => (
            <StaggerReveal key={p.key} index={i}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => exploreNav.pathways(router)}
                style={[
                  styles.pathwayCard,
                  {
                    backgroundColor: colors.surface.raised,
                    borderColor: colors.borderRole.subtle,
                  },
                ]}
              >
                <Feather name={p.icon} size={16} color={colors.accentRole.action} />
                <Text style={[styles.pathwayLabel, { color: colors.textRole.primary }]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            </StaggerReveal>
          ))}
        </ScrollView>
      </View>

      {/* ── Admission intelligence card ────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push("/(tabs)/explore/admission?mode=programme" as never)
        }
        style={[
          styles.admissionCard,
          {
            backgroundColor: colors.surface.raised,
            borderColor: colors.borderRole.subtle,
          },
        ]}
      >
        <View style={styles.admissionLeft}>
          <Text style={[styles.admissionEyebrow, { color: colors.textRole.muted }]}>
            ADMISSION INTELLIGENCE
          </Text>
          <Text style={[styles.admissionTitle, { color: colors.textRole.primary }]}>
            Programme cut-offs,{"\n"}requirements &amp; competition
          </Text>
        </View>
        <View style={[styles.admissionNumeral, { backgroundColor: colors.accentRole.action + "10" }]}>
          <Text style={[styles.admissionNumeralText, { color: colors.accentRole.action }]}>
            280
          </Text>
          <Text style={[styles.admissionNumeralUnit, { color: colors.textRole.muted }]}>
            JAMB
          </Text>
        </View>
      </TouchableOpacity>

      {/* ── Elite pathways gold strip ─────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => exploreNav.elitePathways(router)}
        style={[styles.eliteStrip, { backgroundColor: "#B8860B10", borderColor: "#B8860B30" }]}
      >
        <Feather name="award" size={18} color="#B8860B" />
        <View style={{ flex: 1 }}>
          <Text style={[styles.eliteTitle, { color: "#B8860B" }]}>
            Elite pathways
          </Text>
          <Text style={[styles.eliteSub, { color: colors.textRole.muted }]}>
            The 1% routes — medicine, law, engineering &amp; finance
          </Text>
        </View>
        <Feather name="chevron-right" size={16} color="#B8860B" />
      </TouchableOpacity>

      {/* ── Suggested searches ─────────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Suggested searches</SectionLabel>
        <View style={styles.filterRow}>
          {["Nursing", "Software engineer", "Accounting", "Civil engineering"].map(
            (term) => (
              <FilterChip key={term} label={term} onPress={() => onPick(term)} />
            ),
          )}
        </View>
      </View>

      {/* ── Recents ────────────────────────────────────────────── */}
      {recents.length ? (
        <View style={styles.section}>
          <SectionLabel>Recent</SectionLabel>
          {recents.map((term, i) => (
            <StaggerReveal key={term} index={i}>
              <ListRow
                title={term}
                subtitle="Search again"
                meta="Recent query"
                icon="clock"
                onPress={() => onPick(term)}
              />
            </StaggerReveal>
          ))}
        </View>
      ) : null}

      {/* ── Starting points (3 doors) ─────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Starting points</SectionLabel>
        {DOORS.map((d, i) => (
          <StaggerReveal key={d.key} index={i}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={
                d.key === "know"
                  ? onFocusSearch
                  : d.key === "what"
                    ? () => router.push("/(tabs)/explore/admission?mode=programme" as never)
                    : () => router.push("/(tabs)/explore/admission?mode=subjects" as never)
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
          </StaggerReveal>
        ))}
      </View>

      <Text style={[styles.note, { color: colors.textRole.muted }]}>
        University and College of Education programmes come online first. Other
        institution types, opportunities and elite pathways are being populated.
      </Text>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

const DOORS = [
  {
    key: "know",
    icon: "\uD83C\uDFAF",
    title: "I know what & where",
    body: "Pick your programme and see the fields and jobs it unlocks.",
    live: true,
  },
  {
    key: "what",
    icon: "\uD83C\uDFEB",
    title: "I know what, not where",
    body: "See which institutions offer it, with JAMB cut-offs.",
    live: true,
  },
  {
    key: "unsure",
    icon: "\uD83E\uDDED",
    title: "I don't know yet",
    body: "Enter your strongest subjects and see the programmes you qualify for.",
    live: true,
  },
];

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

// ─── Styles ──────────────────────────────────────────────────────

const CLUSTER_CARD_W = 120;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    ...CompassFonts.bodySemibold,
    letterSpacing: 0.9,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    ...CompassFonts.displaySemi,
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
    ...CompassFonts.bodySemibold,
    lineHeight: FontSize.sm * 1.4,
  },
  stateLine: {
    fontSize: FontSize.xs,
    ...CompassFonts.bodySemibold,
    marginTop: -Spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },

  // ── Idle ─────────────────────────────────────────────────────
  idle: {
    gap: Spacing.lg,
    marginTop: Spacing.xs,
  },
  section: {
    gap: Spacing.sm,
  },

  // Cluster carousel
  clusterCarousel: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  clusterCard: {
    width: CLUSTER_CARD_W,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  clusterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  clusterGridCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
    gap: Spacing.sm,
  },
  clusterIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  clusterCardName: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodySemibold,
    lineHeight: FontSize.sm * 1.2,
  },
  seeAllLink: {
    paddingVertical: Spacing.xs,
  },
  seeAllText: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodySemibold,
  },

  // Pathways strip
  pathwayCarousel: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  pathwayCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pathwayLabel: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodySemibold,
  },

  // Admission card
  admissionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  admissionLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  admissionEyebrow: {
    fontSize: FontSize.xs,
    ...CompassFonts.bodySemibold,
    letterSpacing: 0.8,
  },
  admissionTitle: {
    fontSize: FontSize.md,
    ...CompassFonts.bodySemibold,
    lineHeight: FontSize.md * 1.3,
  },
  admissionNumeral: {
    width: 72,
    height: 72,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  admissionNumeralText: {
    fontSize: 28,
    ...CompassFonts.displayBold,
    lineHeight: 30,
  },
  admissionNumeralUnit: {
    fontSize: 9,
    ...CompassFonts.bodySemibold,
    letterSpacing: 0.5,
    marginTop: 1,
  },

  // Elite strip
  eliteStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  eliteTitle: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodySemibold,
  },
  eliteSub: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },

  // Doors
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
  cardTitle: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
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
  compareText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  rowTitle: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
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
  chipText: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },

  // Guest / data-limited
  guestPanel: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  guestTitle: {
    fontSize: FontSize.lg,
    ...CompassFonts.bodySemibold,
  },
  guestBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  guestRows: { gap: Spacing.sm, marginTop: Spacing.xs },
  dataNotice: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  dataNoticeText: {
    fontSize: FontSize.xs,
    ...CompassFonts.bodySemibold,
    lineHeight: FontSize.xs * 1.5,
  },
});
