/**
 * ExploreScreen — the core entry point (and the guest landing).
 *
 * Editorial front page with:
 *  1. Scoped disambiguation search across the public career catalogue
 *  2. Hero cluster carousel (8 signature clusters with signature colours)
 *  3. Browse clusters / pathways / admission intelligence / elite pathways
 *  4. Typed search results grouped by domain → role → programme
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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
  hScroll,
} from "@/theme";
import {
  DataStateView,
  LockedPill,
  TierBadgeView,
  ExploreGuide,
  FilterChip,
  ListRow,
  SearchResultsGroup,
  SectionLabel,
} from "@/components/careerIntelligence";
import { SifterButton, SifterCard, PressableCard } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import { useExploreNav, type ExploreNav } from "@/lib/exploreNav";
import { locked, type DataState, type CareerSearchResult, type SearchResult } from "@/types/career";
import { useAuth } from "@/hooks/useAuth";
import { useResponsive } from "@/hooks/useResponsive";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import { SkillDiscoveryPanel } from "@/components/careerIntelligence/SkillDiscoveryPanel";
import { CareerDisclaimer } from "@/components/careerIntelligence/CareerDisclaimer";
import { getStartingPoint } from "@/lib/startingPoint";
import { useSearchLauncher } from "@/components/shell/searchLauncher";

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

const MIN_QUERY = 2;
const TIERS: readonly TierType[] = ["entry", "mid", "senior"];
type ResultFilter = "all" | "programmes" | "universities" | "domains" | "subgroups" | "roles" | "skills" | "tools" | "certifications" | "opportunities";
const asTier = (t?: string): TierType | undefined =>
  t && (TIERS as readonly string[]).includes(t) ? (t as TierType) : undefined;

const isEmptyResult = (r: CareerSearchResult): boolean =>
  r.domains.length === 0 &&
  r.roles.length === 0 &&
  r.programmes.length === 0 &&
  (r.universities?.length ?? 0) === 0 &&
  (r.subgroups?.length ?? 0) === 0 &&
  (r.skills?.length ?? 0) === 0 &&
  (r.tools?.length ?? 0) === 0 &&
  (r.certifications?.length ?? 0) === 0 &&
  (r.opportunities?.length ?? 0) === 0;

export interface ExploreScreenProps {
  /**
   * Seeds the search box. Used by the admin dashboard's search entry point so
   * a hand-off arrives on results rather than on an empty landing.
   */
  initialQuery?: string;
  /**
   * Rendered between the header and the search box. The admin stack passes an
   * audience-specific explainer here; the student stack passes nothing.
   */
  intro?: React.ReactNode;
  /** Overrides the student-facing headline for other audiences. */
  heading?: string;
  /** Uses an audience-specific admin landing instead of student entry cards. */
  adminAudience?: "school" | "university";
  /** Exact organisation type for the skill-discovery lens. */
  adminType?: string | null;
}

export default function ExploreScreen({
  initialQuery = "",
  intro,
  heading,
  adminAudience,
  adminType,
}: ExploreScreenProps = {}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const responsive = useResponsive();
  const openSearch = useSearchLauncher();
  const launchSearch = (term?: string) => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("sifter:open-global-search", { detail: term ?? "" }));
    }
    openSearch(term);
  };
  const isGuest = !user || user.auth_provider === "guest";
  const hasSession = Boolean(user);
  const [searchUserType, setSearchUserType] = useState<string | null>(null);
  const [searchSchoolId, setSearchSchoolId] = useState<string | null>(null);

  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<ResultFilter>("all");
  const [loading, setLoading] = useState(false);
  // Starts EMPTY. This was seeded with ["Medicine", "Data analyst", "Law"] and
  // labelled "Recent" — three searches the user had never run, presented as
  // their own history. In a product whose stated rule is "degrade to '—'
  // rather than invent a number", inventing history is the same defect with a
  // friendlier face. Suggested searches below are honestly labelled as such.
  const [recents, setRecents] = useState<string[]>([]);
  const [results, setResults] = useState<DataState<CareerSearchResult> | null>(
    null,
  );

  useEffect(() => {
    let active = true;
    if (!user?.id || isGuest) {
      setSearchUserType(null);
      setSearchSchoolId(null);
      return () => { active = false; };
    }
    void getStartingPoint(user.id).then((profile) => {
      if (!active) return;
      setSearchUserType(profile?.userType ?? null);
      setSearchSchoolId(profile?.preferredSchoolId ?? null);
    });
    return () => { active = false; };
  }, [isGuest, user?.id]);

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
          "Start a guest session to search programmes, domains and roles.",
        ),
      );
      return;
    }
    let active = true;
    setLoading(true);
    const t = setTimeout(async () => {
      const state = await careerData.searchCareer(q, undefined, searchUserType, searchSchoolId);
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
  }, [hasSession, isGuest, query, searchSchoolId, searchUserType]);

  const trimmed = query.trim();
  const searching = trimmed.length >= MIN_QUERY;
  const filters = useMemo(
    () => [
      { value: "all" as const, label: "All" },
      { value: "programmes" as const, label: "Programmes" },
      { value: "universities" as const, label: "Universities" },
      { value: "domains" as const, label: "Domains" },
      { value: "subgroups" as const, label: "Subgroups" },
      { value: "roles" as const, label: "Roles" },
      { value: "skills" as const, label: "Skills" },
      { value: "tools" as const, label: "Tools" },
      { value: "certifications" as const, label: "Credentials" },
      { value: "opportunities" as const, label: "Opportunities" },
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
          {heading ?? `Find your domain, role\nor programme`}
        </Text>
      </View>

      {!adminAudience ? <ExploreGuide isGuest={isGuest} /> : null}

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
        </View>
      ) : null}

      {intro}

      {/* ── Search ────────────────────────────────────────────── */}
      <Text style={[styles.stateLine, { color: colors.textRole.muted }]}>Use Search in the workspace header to find programmes, universities, domains, roles or skills. The filters below narrow the results shown here.</Text>

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

      {/* Skills Match is an independent optional tool. Keep the main search
          primary and expose this flipped-discovery route after its scope. */}
      <SkillDiscoveryPanel adminType={adminType ?? adminAudience ?? null} />

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
          nav={exploreNav}
          onPick={(term) => {
            setQuery(term);
            launchSearch(term);
          }}
          onFocusSearch={launchSearch}
          adminAudience={adminAudience}
          adminType={adminType}
        />
      ) : !hasSession ? (
        // Gate on "no session at all", NOT on isGuest. A guest IS a session:
        // gating on isGuest made this branch permanent for every guest, so the
        // "Start guest preview" button re-created a guest profile and rendered
        // the same panel again — search results were unreachable for guests,
        // even though the fetch had already succeeded. Every other gate in this
        // file (the search effect at 135, the banner CTA at 219) already uses
        // hasSession; this was the one that drifted.
        <GuestLimitedSearch query={trimmed} />
      ) : loading ? (
        <SearchLoadingRows />
      ) : searching && results ? (
        <DataStateView
          state={results}
          empty={isEmptyResult}
          emptyTitle={`No matches for \u201c${trimmed}\u201d`}
          emptyBody="Try a broader term — a domain, a role title, or a programme."
        >
          {(data) => (
            <View style={styles.results}>
              {(filter === "all" || filter === "domains") && data.domains.length ? (
                <View style={styles.group}>
                  <SectionLabel>Domains</SectionLabel>
                  {(isGuest ? data.domains.slice(0, 2) : data.domains).map((d, i) => (
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
                  {(isGuest ? data.roles.slice(0, 2) : data.roles).map((r, ri) => {
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
                    {!isGuest ? <TouchableOpacity
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
                    </TouchableOpacity> : (
                      <Text style={[styles.compareText, { color: colors.textRole.muted }]}>Sign in to compare</Text>
                    )}
                  </View>
                  {(isGuest ? data.programmes.slice(0, 2) : data.programmes).map((p, i) => {
                    const meta = p.discipline ?? p.institutionType;
                    return (
                      <StaggerReveal key={p.id} index={i}>
                        <ListRow
                          onPress={() => exploreNav.programme(router, p.id, searchUserType === "student"
                            ? { userType: "student", schoolId: searchSchoolId ?? undefined, journeyMode: "undergraduate_career" }
                            : undefined)}
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
              {isGuest && (
                data.domains.length > 2 || data.roles.length > 2 || data.programmes.length > 2 ||
                (data.universities?.length ?? 0) > 2 || (data.subgroups?.length ?? 0) > 2 ||
                (data.skills?.length ?? 0) > 2 || (data.tools?.length ?? 0) > 2 ||
                (data.certifications?.length ?? 0) > 2 || (data.opportunities?.length ?? 0) > 2
              ) ? <GuestSearchPrompt onSignIn={() => router.push("/(auth)/sign-in" as any)} /> : null}
              {buildExtendedSearchGroups(data, exploreNav.base)
                .filter((group) => filter === "all" || filter === group.scope)
                .map((group) => (
                  <SearchResultsGroup
                    key={group.label}
                    label={group.label}
                    results={group.items}
                    query={trimmed}
                    onResultPress={(item) => {
                      if (item.href) router.push(item.href as any);
                    }}
                    onMorePress={isGuest ? () => router.push("/(auth)/sign-in" as any) : undefined}
                    maxRows={isGuest ? 2 : undefined}
                  />
                ))}
            </View>
          )}
        </DataStateView>
      ) : (
        <DataLimitedState />
      )}
      <CareerDisclaimer variant="footer" />
    </ScrollView>
  );
}

// ─── Idle state (editorial front page) ───────────────────────────

function ExploreIdle({
  recents,
  isGuest,
  router,
  nav,
  onPick,
  onFocusSearch,
  adminAudience,
  adminType,
}: {
  recents: string[];
  isGuest: boolean;
  router: ReturnType<typeof useRouter>;
  /** Base-aware: the same cards route into whichever stack is mounted. */
  nav: ExploreNav;
  onPick: (term: string) => void;
  onFocusSearch: () => void;
  adminAudience?: "school" | "university";
  adminType?: string | null;
}) {
  const { colors } = useTheme();
  const { isMobile, columns } = useResponsive();
  return (
    <View style={styles.idle}>
      {/* ── Hero cluster carousel ──────────────────────────────── */}
      <View style={styles.section}>
        <SectionLabel>Explore by domain</SectionLabel>
        {isMobile ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={hScroll}
            contentContainerStyle={styles.clusterCarousel}
            decelerationRate="fast"
            snapToInterval={CLUSTER_CARD_W + Spacing.sm}
            snapToAlignment="start"
          >
            {CLUSTER_HEROES.map((c, i) => (
              <StaggerReveal key={c.id} index={i}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => nav.domains(router)}
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
                    onPress={() => nav.domains(router)}
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
          onPress={() => nav.domains(router)}
          style={styles.seeAllLink}
        >
          <Text style={[styles.seeAllText, { color: colors.accentRole.action }]}>
            {/* No count. "37 clusters" was a literal, and the real figure is
                35 — the Domain Explorer states its own totals from the data it
                actually loaded. */}
            Browse all clusters →
          </Text>
        </TouchableOpacity>
      </View>

      {adminAudience ? (
        <AdminExploreActions audience={adminAudience} adminType={adminType} router={router} nav={nav} />
      ) : null}

      {/* ── Pathways strip ────────────────────────────────────── */}
      {!adminAudience ? <View style={styles.section}>
        <SectionLabel>Pathways</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={hScroll}
          contentContainerStyle={styles.pathwayCarousel}
        >
          <StaggerReveal index={0}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => nav.pathways(router)}
              style={[
                styles.pathwayCard,
                styles.unifiedPathwayCard,
                {
                  backgroundColor: colors.surface.raised,
                  borderColor: colors.borderRole.subtle,
                },
              ]}
            >
              <Feather name="map" size={16} color={colors.accentRole.action} />
              <View style={styles.unifiedPathwayCopy}>
                <Text style={[styles.pathwayLabel, { color: colors.textRole.primary }]}>Career pathways</Text>
                <Text style={[styles.unifiedPathwayBody, { color: colors.textRole.secondary }]}>Explore one guided product for research, career change, credentials, qualification upgrades and entrepreneurship.</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
            </TouchableOpacity>
          </StaggerReveal>
        </ScrollView>
      </View> : null}

      {/* ── Admission intelligence card ────────────────────────── */}
      {!adminAudience ? <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => nav.admissionHub(router, "programme")}
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
            Programmes, universities{"\n"}& requirements
          </Text>
        </View>
        <View style={[styles.admissionNumeral, { backgroundColor: colors.accentRole.action + "10" }]}>
          <Text style={[styles.admissionNumeralText, { color: colors.accentRole.action }]}>
            JAMB
          </Text>
          <Text style={[styles.admissionNumeralUnit, { color: colors.textRole.muted }]}>
            cycle data
          </Text>
        </View>
      </TouchableOpacity> : null}

      {/* ── Elite pathways gold strip ─────────────────────────── */}
      {/* ── Suggested searches ─────────────────────────────────── */}
      {!adminAudience ? <View style={styles.section}>
        <SectionLabel>Suggested searches</SectionLabel>
        <View style={styles.filterRow}>
          {["Nursing", "Software engineer", "Accounting", "Civil engineering"].map(
            (term) => (
              <FilterChip key={term} label={term} onPress={() => onPick(term)} />
            ),
          )}
        </View>
      </View> : null}

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
      {!adminAudience ? (
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
                      ? () => nav.admissionHub(router, "programme")
                      : () => nav.admissionHub(router, "subjects")
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
      ) : null}

      {!adminAudience ? <Text style={[styles.note, { color: colors.textRole.muted }]}>
        University and College of Education programmes come online first.
      </Text> : null}
    </View>
  );
}

function AdminExploreActions({
  audience,
  adminType,
  router,
  nav,
}: {
  audience: "school" | "university";
  adminType?: string | null;
  router: ReturnType<typeof useRouter>;
  nav: ExploreNav;
}) {
  const { colors } = useTheme();
  const items = audience === "university"
    ? [
        { title: "Review your programme mix", body: "Review programmes and connected domains in the institution dashboard.", onPress: () => router.push("/(admin)/dashboard" as never), icon: "bar-chart-2" as const },
        { title: "Compare peer universities", body: "Compare your programme and domain coverage with other universities.", onPress: () => router.push("/(admin)/peers" as never), icon: "users" as const },
        { title: "Audit domain reach", body: "Review direct, functional and adjacent domain connections.", onPress: () => router.push("/(admin)/domain-reach" as never), icon: "map" as const },
      ]
    : [
        { title: "Compare university options", body: "Review the universities that offer a student's programme and explain the differences.", onPress: () => nav.admissionHub(router, "programme", adminType), icon: "users" as const },
        { title: "Guide from a student's choice", body: "Start with subjects or a programme idea and explain the available routes.", onPress: () => nav.admissionHub(router, "subjects", adminType), icon: "compass" as const },
        { title: "Review your students", body: "Open the cohort view for accounts, sessions and shared guidance signals.", onPress: () => router.push("/(admin)/guidance" as never), icon: "book-open" as const },
      ];

  return (
    <View style={styles.section}>
      <SectionLabel>{audience === "university" ? "Institution planning" : "Guidance tools"}</SectionLabel>
      <View style={styles.adminActionGrid}>
        {items.map((item) => (
          <TouchableOpacity key={item.title} activeOpacity={0.82} onPress={item.onPress} style={[styles.adminAction, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Feather name={item.icon} size={18} color={colors.accentRole.action} />
            <Text style={[styles.adminActionTitle, { color: colors.textRole.primary }]}>{item.title}</Text>
            <Text style={[styles.adminActionBody, { color: colors.textRole.secondary }]}>{item.body}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────

const DOORS = [
  {
    key: "know",
    icon: "\uD83C\uDFAF",
    title: "I know what & where",
    body: "Pick your programme and see the domains and roles it connects to.",
    live: true,
  },
  {
    key: "what",
    icon: "\uD83C\uDFEB",
    title: "I know what, not where",
    body: "See which institutions offer it, then review cycle-labelled requirements.",
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
}: {
  query: string;
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
        Search is available from a guest session or an account. Create an account
        later to save, compare and unlock full guidance.
      </Text>
      <View style={styles.guestRows}>
        <ListRow title="Programme matches" subtitle="Preview available after guest session" meta="Limited" icon="book-open" locked />
        <ListRow title="Role matches" subtitle="Preview available after guest session" meta="Limited" icon="briefcase" locked />
      </View>
    </View>
  );
}

function GuestSearchPrompt({ onSignIn }: { onSignIn: () => void }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.guestPanel, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <SectionLabel>Continue your search</SectionLabel>
      <Text style={[styles.guestBody, { color: colors.textRole.secondary }]}>
        You are seeing a short public preview. Create an account to see all matches, follow the full guidance route, and save your direction.
      </Text>
      <SifterButton
        label="Sign in or create account"
        onPress={onSignIn}
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

function buildExtendedSearchGroups(
  data: CareerSearchResult,
  base: string,
): { label: string; scope: ResultFilter; items: SearchResult[] }[] {
  const basePath = base || "/(tabs)/explore";
  const undergraduate = data.userType === "student";
  return [
    {
      label: "Universities",
      scope: "universities" as const,
      items: (data.universities ?? []).map((item) => ({
        id: item.id,
        type: "university" as const,
        title: item.name,
        subtitle: [item.city, item.state].filter(Boolean).join(", ") || "University",
        meta: undergraduate ? "Explore programmes" : "View programmes and requirements",
        actionLabel: undergraduate ? "Explore university programmes" : "Check university requirements",
        contextHint: undergraduate
          ? "Open a programme to follow its domains, subgroups, roles, and next skills."
          : "Review this university's programmes and admission requirements.",
        href: undergraduate
          ? `${basePath}/admission?mode=school&school_id=${encodeURIComponent(item.id)}&user_type=student&journey=undergraduate_programmes`
          : `${basePath}/admission?mode=school&school_id=${encodeURIComponent(item.id)}`,
        icon: "building",
      })),
    },
    {
      label: "Subgroups",
      scope: "subgroups" as const,
      items: (data.subgroups ?? []).map((item) => ({
        id: item.id,
        type: "subgroup" as const,
        title: item.name,
        subtitle: item.domainName ? `In ${item.domainName}` : "Subgroup",
        href: item.domainId ? `${basePath}/domain/${encodeURIComponent(item.domainId)}/subgroup/${encodeURIComponent(item.id)}` : undefined,
        icon: "layers",
      })),
    },
    {
      label: "Skills",
      scope: "skills" as const,
      items: (data.skills ?? []).map((item) => ({
        id: item.id,
        type: "skill" as const,
        title: item.name,
        subtitle: item.domainName ? `Used in ${item.domainName}` : "Career skill",
        meta: item.context,
        href: item.domainId ? `${basePath}/domain/${encodeURIComponent(item.domainId)}` : undefined,
        icon: "zap",
      })),
    },
    {
      label: "Tools",
      scope: "tools" as const,
      items: (data.tools ?? []).map((item) => ({
        id: item.id,
        type: "tool" as const,
        title: item.name,
        subtitle: item.domainName ? `Used in ${item.domainName}` : "Career tool",
        meta: item.group,
        href: item.domainId ? `${basePath}/domain/${encodeURIComponent(item.domainId)}` : undefined,
        icon: "tool",
      })),
    },
    {
      label: "Credentials",
      scope: "certifications" as const,
      items: (data.certifications ?? []).map((item) => ({
        id: item.id,
        type: "certification" as const,
        title: item.name,
        subtitle: item.domainName ? `Relevant to ${item.domainName}` : "Career credential",
        meta: [item.region, item.level].filter(Boolean).join(" · ") || undefined,
        href: item.domainId ? `${basePath}/domain/${encodeURIComponent(item.domainId)}` : undefined,
        icon: "award",
      })),
    },
    {
      label: "Opportunities",
      scope: "opportunities" as const,
      items: (data.opportunities ?? []).map((item) => ({
        id: item.id,
        type: "opportunity" as const,
        title: item.title,
        subtitle: [item.type, item.scope].filter(Boolean).join(" · ") || "Opportunity",
        meta: item.region ?? undefined,
        href: `/(tabs)/opportunities/opportunity/${encodeURIComponent(item.id)}`,
        icon: "star",
      })),
    },
  ];
}

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
  adminActionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  adminAction: {
    flex: 1,
    minWidth: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  adminActionTitle: {
    fontSize: FontSize.sm,
    ...CompassFonts.bodySemibold,
  },
  adminActionBody: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },

  // Cluster carousel
  clusterCarousel: {
    alignItems: "center",
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
    alignItems: "center",
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
  unifiedPathwayCard: {
    borderRadius: Radius.md,
    flex: 1,
  },
  unifiedPathwayCopy: {
    flex: 1,
    gap: 3,
  },
  unifiedPathwayBody: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.45,
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
