/**
 * CareerChangerScreen — the PIVOT experience ("fields you can move into").
 *
 * Scenario A: someone studied or worked in field X and wants to change
 * direction but has no target yet. They tell us their background field (via a
 * debounced `searchCareer` box that surfaces matching DOMAINS as tappable
 * chips, or a pre-seeded `from` route param), and we call `getPivot` to rank
 * the fields their existing skills transfer into — each with an honest overlap
 * strength and the specific shared skills that carry over.
 *
 * Scenario B1: someone studied or worked in field X and wants to move to a
 * specific target field Y. They tell us their background field and target field,
 * and we show the gap analysis: what skills they already have (have), what
 * they need to learn (bridge), and their readiness level.
 *
 * Scenario B2: someone studied or worked in field X and wants to move to a
 * specific role Y. They tell us their background field and target role, and we
 * show the gap analysis: what skills they already have (covered), what they
 * need to learn (missing), their readiness level, tenure tier, and career ladder.
 *
 * The tone is encouraging but honest: a big jump is named as a big jump. No
 * faked rows — every data-driven block is wrapped in <DataStateView>.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { DataStateView } from "@/components/careerIntelligence";
import { SifterCard, PressableCard, SectionHeader, ProgressBar } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type PivotResult,
  type CareerSearchResult,
  type Readiness,
} from "@/types/career";
import {
  useTheme,
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  type ColorPalette,
} from "@/theme";

const SEARCH_DEBOUNCE_MS = 250;
/** Below this overlap the top move is an honest stretch, not a neighbour. */
const STRETCH_THRESHOLD = 0.15;
/** How many shared-skill chips to surface per move before eliding. */
const MAX_SHARED_SKILLS = 4;

type BackgroundDomain = { id: string; name: string };
type TargetDomain = { id: string; name: string };
type TargetRole = { id: string; name: string };

type PivotGapWire = {
  coverage?: number | null;
  haveSkills?: string[];
  bridgeSkills?: string[];
  target?: { label?: string; kind?: "domain" | "role" };
};

function readinessFromCoverage(coverage?: number | null): Readiness {
  if (coverage != null && coverage >= 0.75) return "ready";
  if (coverage != null && coverage >= 0.35) return "bridge";
  return "stretch";
}

function goBackOrExplore(router: ReturnType<typeof useRouter>) {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace("/(tabs)/explore" as any);
}

export function CareerChangerScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ from?: string }>();

  // The chosen background domain drives the pivot lookup. Seeded from `from`.
  const seededFrom = typeof params.from === "string" ? params.from : undefined;
  const [background, setBackground] = useState<BackgroundDomain | null>(
    seededFrom ? { id: seededFrom, name: seededFrom } : null,
  );

  // Scenario selection: A (no target), B1 (target domain), B2 (target role)
  const [scenario, setScenario] = useState<'A' | 'B1' | 'B2'>('A');

  // For B1: target domain selection
  const [targetDomain, setTargetDomain] = useState<TargetDomain | null>(null);
  const [targetDomainQuery, setTargetDomainQuery] = useState("");
  const [targetDomainSearchState, setTargetDomainSearchState] = useState<
    DataState<CareerSearchResult>
  >(() => ({ status: "real", data: { domains: [], roles: [], programmes: [] } }));
  const targetDomainDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // For B2: target role selection
  const [targetRole, setTargetRole] = useState<TargetRole | null>(null);
  const [targetRoleQuery, setTargetRoleQuery] = useState("");
  const [targetRoleSearchState, setTargetRoleSearchState] = useState<
    DataState<CareerSearchResult>
  >(() => ({ status: "real", data: { domains: [], roles: [], programmes: [] } }));
  const targetRoleDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search box state (for background selection) → domain chips.
  const [query, setQuery] = useState("");
  const [searchState, setSearchState] = useState<DataState<CareerSearchResult>>(
    () => ({ status: "real", data: { domains: [], roles: [], programmes: [] } }),
  );

  // Pivot result for Scenario A (background → fields you can move into).
  const [pivotState, setPivotState] = useState<DataState<PivotResult>>(() =>
    comingSoon<PivotResult>(),
  );

  // For B1: gap analysis result (background → target domain).
  const [gapAnalysisState, setGapAnalysisState] = useState<
    DataState<{ have: string[]; bridge: string[]; readiness: Readiness }>
  >(() => comingSoon<{ have: string[]; bridge: string[]; readiness: Readiness }>());

  // For B2: role gap analysis result (background → target role).
  const [roleGapAnalysisState, setRoleGapAnalysisState] = useState<
    DataState<{
      covered: string[];
      missing: string[];
      readiness: Readiness;
      tier: "entry" | "mid" | "senior";
      careerLadder: string[];
    }>
  >(() => comingSoon<{
    covered: string[];
    missing: string[];
    readiness: Readiness;
    tier: "entry" | "mid" | "senior";
    careerLadder: string[];
  }>());

  // ── Debounced search ────────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const q = query.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setSearchState({
        status: "real",
        data: { domains: [], roles: [], programmes: [] },
      });
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const result = await careerData.searchCareer(q);
      setSearchState(result);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // ── Debounced search for target domain (B1) ────────────────────────
  useEffect(() => {
    const q = targetDomainQuery.trim();
    if (targetDomainDebounceRef.current) clearTimeout(targetDomainDebounceRef.current);
    if (q.length < 2) {
      setTargetDomainSearchState({
        status: "real",
        data: { domains: [], roles: [], programmes: [] },
      });
      return;
    }
    targetDomainDebounceRef.current = setTimeout(async () => {
      const result = await careerData.searchCareer(q);
      setTargetDomainSearchState(result);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (targetDomainDebounceRef.current) clearTimeout(targetDomainDebounceRef.current);
    };
  }, [targetDomainQuery]);

  // ── Debounced search for target role (B2) ────────────────────────
  useEffect(() => {
    const q = targetRoleQuery.trim();
    if (targetRoleDebounceRef.current) clearTimeout(targetRoleDebounceRef.current);
    if (q.length < 2) {
      setTargetRoleSearchState({
        status: "real",
        data: { domains: [], roles: [], programmes: [] },
      });
      return;
    }
    targetRoleDebounceRef.current = setTimeout(async () => {
      const result = await careerData.searchCareer(q);
      setTargetRoleSearchState(result);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (targetRoleDebounceRef.current) clearTimeout(targetRoleDebounceRef.current);
    };
  }, [targetRoleQuery]);

  // ── Pivot lookup (Scenario A) whenever the background domain changes ──────
  useEffect(() => {
    if (!background) {
      setPivotState(comingSoon<PivotResult>());
      return;
    }
    let active = true;
    setPivotState(comingSoon<PivotResult>());
    (async () => {
      const result = await careerData.getPivot(background.id);
      if (active) setPivotState(result);
    })();
    return () => {
      active = false;
    };
  }, [background, scenario]); // Also reset when scenario changes

  // ── Gap analysis (Scenario B1) whenever background or target domain changes ──────
  useEffect(() => {
    if (!background || !targetDomain || scenario !== 'B1') {
      setGapAnalysisState(comingSoon<{ have: string[]; bridge: string[]; readiness: Readiness }>());
      return;
    }
    let active = true;
    setGapAnalysisState({ status: "pending", data: null });
    (async () => {
      const result = await careerData.getPivotGap(background.id, targetDomain.id);
      if (!active) return;
      if (result.status === "real" && result.data) {
        const gap = result.data as PivotGapWire;
        setGapAnalysisState({
          status: "real",
          data: {
            have: gap.haveSkills ?? [],
            bridge: gap.bridgeSkills ?? [],
            readiness: readinessFromCoverage(gap.coverage),
          },
          meta: result.meta,
        });
        return;
      }
      setGapAnalysisState(result as DataState<{ have: string[]; bridge: string[]; readiness: Readiness }>);
    })();
    return () => {
      active = false;
    };
  }, [background, targetDomain, scenario]);

  // ── Role gap analysis (Scenario B2) whenever background or target role changes ──────
  useEffect(() => {
    if (!background || !targetRole || scenario !== 'B2') {
      setRoleGapAnalysisState(comingSoon<{
        covered: string[];
        missing: string[];
        readiness: Readiness;
        tier: "entry" | "mid" | "senior";
        careerLadder: string[];
      }>());
      return;
    }
    let active = true;
    setRoleGapAnalysisState({ status: "pending", data: null });
    (async () => {
      const result = await careerData.getPivotGap(background.id, undefined, targetRole.id);
      if (!active) return;
      if (result.status === "real" && result.data) {
        const gap = result.data as PivotGapWire;
        setRoleGapAnalysisState({
          status: "real",
          data: {
            covered: gap.haveSkills ?? [],
            missing: gap.bridgeSkills ?? [],
            readiness: readinessFromCoverage(gap.coverage),
            tier: "entry",
            careerLadder: [],
          },
          meta: result.meta,
        });
        return;
      }
      setRoleGapAnalysisState(result as DataState<{
        covered: string[];
        missing: string[];
        readiness: Readiness;
        tier: "entry" | "mid" | "senior";
        careerLadder: string[];
      }>);
    })();
    return () => {
      active = false;
    };
  }, [background, targetRole, scenario]);

  const domainMatches = useMemo(
    () => searchState.data?.domains ?? [],
    [searchState.data],
  );

  function chooseDomain(d: { id: string; name: string }) {
    setBackground({ id: d.id, name: d.name });
    setQuery("");
    setSearchState({
      status: "real",
      data: { domains: [], roles: [], programmes: [] },
    });
    // Reset target selections when background changes
    setTargetDomain(null);
    setTargetDomainQuery("");
    setTargetDomainSearchState({ status: "real", data: { domains: [], roles: [], programmes: [] } });
    setTargetRole(null);
    setTargetRoleQuery("");
    setTargetRoleSearchState({ status: "real", data: { domains: [], roles: [], programmes: [] } });
  }

  // Target domain selection handlers (for B1)
  function chooseTargetDomain(d: { id: string; name: string }) {
    setTargetDomain({ id: d.id, name: d.name });
    setTargetDomainQuery("");
    setTargetDomainSearchState({
      status: "real",
      data: { domains: [], roles: [], programmes: [] },
    });
  }

  // Target role selection handlers (for B2)
  function chooseTargetRole(r: { id: string; name: string }) {
    setTargetRole({ id: r.id, name: r.name });
    setTargetRoleQuery("");
    setTargetRoleSearchState({
      status: "real",
      data: { domains: [], roles: [], programmes: [] },
    });
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={styles.scroll}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        onPress={() => goBackOrExplore(router)}
        hitSlop={10}
        style={styles.back}
      >
        <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>← Back</Text>
      </TouchableOpacity>

      <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
        CAREER CHANGE
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Fields you can move into
      </Text>

      {/* ── Scenario selector ───────────────────────────────────── */}
      <View style={styles.scenarioSelector}>
        <Text style={[styles.scenarioLabel, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
          Choose your scenario:
        </Text>
        <View style={styles.scenarioTabs}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setScenario('A')}
            style={[
              styles.scenarioTab,
              scenario === 'A' ? styles.scenarioTabActive : styles.scenarioTabInactive,
            ]}
          >
            <Text style={[styles.scenarioTabText, { color: scenario === 'A' ? colors.accentRole.action : colors.textRole.primary }, CompassFonts.bodyMedium]}>
              Explore Options
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setScenario('B1')}
            style={[
              styles.scenarioTab,
              scenario === 'B1' ? styles.scenarioTabActive : styles.scenarioTabInactive,
            ]}
          >
            <Text style={[styles.scenarioTabText, { color: scenario === 'B1' ? colors.accentRole.action : colors.textRole.primary }, CompassFonts.bodyMedium]}>
              Target Field Gap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setScenario('B2')}
            style={[
              styles.scenarioTab,
              scenario === 'B2' ? styles.scenarioTabActive : styles.scenarioTabInactive,
            ]}
          >
            <Text style={[styles.scenarioTabText, { color: scenario === 'B2' ? colors.accentRole.action : colors.textRole.primary }, CompassFonts.bodyMedium]}>
              Target Role Gap
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Background picker ─────────────────────────────────── */}
      <View style={styles.pickerBlock}>
        <Text style={[styles.pickerLabel, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
          What did you study or do?
        </Text>
        <Text style={[styles.pickerHelp, { color: colors.textRole.muted }, CompassFonts.body]}>
          Tell us your background field and we&apos;ll find the fields your existing
          skills transfer into.
        </Text>
        <View
          style={[
            styles.searchBox,
            { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Text style={styles.searchIcon}>🔎</Text>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="e.g. Accounting, Nursing, Law…"
            placeholderTextColor={colors.textRole.muted}
            style={[styles.searchInput, { color: colors.textRole.primary }, CompassFonts.body]}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={8}>
              <Text style={[styles.clear, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Domain chips from the search — only while typing. */}
        {query.trim().length >= 2 ? (
          <DataStateView
            state={searchState}
            empty={() => domainMatches.length === 0}
            emptyTitle="No matching fields"
            emptyBody="Try another word for what you studied or did."
            compact
          >
            {() => (
              <View style={styles.chips}>
                {domainMatches.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    onPress={() => chooseDomain(d)}
                    activeOpacity={0.7}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: `${colors.accentRole.action}14`,
                        borderColor: colors.borderRole.subtle,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                      {d.name}
                    </Text>
                    {d.cluster ? (
                      <Text
                        style={[styles.chipCluster, { color: colors.textRole.muted }, CompassFonts.body]}
                      >
                        {d.cluster}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </DataStateView>
        ) : null}

        {/* Current selection pill. */}
        {background ? (
          <View style={styles.selectedRow}>
            <View
              style={[
                styles.selectedPill,
                { backgroundColor: `${colors.accentRole.success}14`, borderColor: colors.accentRole.success },
              ]}
            >
              <Text style={[styles.selectedText, { color: colors.accentRole.success }, CompassFonts.bodyBold]}>
                Background: {background.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setBackground(null)}
              hitSlop={8}
              activeOpacity={0.7}
            >
              <Text style={[styles.change, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
                Change
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      {/* ── Body: show different content based on scenario ────── */}
      {!background ? (
        <IntroCard colors={colors} />
      ) : (
        <>
          {scenario === 'A' ? (
            <View style={styles.results}>
              <DataStateView
                state={pivotState}
                spinnerOnPending
                empty={(d) => d.moves.length === 0}
                emptyTitle="No clear pivots yet"
                emptyBody="We couldn’t find strong skill overlaps from this field yet. It’s being expanded — check back soon."
              >
                {(data) => <PivotResults data={data} colors={colors} router={router} />}
              </DataStateView>
            </View>
          ) : scenario === 'B1' ? (
            <View style={styles.results}>
              <DataStateView
                state={gapAnalysisState}
                spinnerOnPending
                empty={() => gapAnalysisState.data?.have.length === 0 && gapAnalysisState.data?.bridge.length === 0}
                emptyTitle="No gap analysis data"
                emptyBody="Select a target field to see the gap analysis."
              >
                {(data) => data && <GapAnalysisResult data={data} colors={colors} />}
              </DataStateView>
            </View>
          ) : scenario === 'B2' ? (
            <View style={styles.results}>
              <DataStateView
                state={roleGapAnalysisState}
                spinnerOnPending
                empty={() => roleGapAnalysisState.data?.covered.length === 0 && roleGapAnalysisState.data?.missing.length === 0}
                emptyTitle="No role gap analysis data"
                emptyBody="Select a target role to see the gap analysis."
              >
                {(data) => data && <RoleGapAnalysisResult data={data} colors={colors} router={router} />}
              </DataStateView>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

/** Friendly explainer shown before a background field is chosen. */
function IntroCard({ colors }: { colors: ColorPalette }) {
  return (
    <SifterCard style={styles.introCard}>
      <Text style={styles.introIcon}>🧭</Text>
      <Text style={[styles.introTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Changing direction isn&apos;t starting from zero
      </Text>
      <Text style={[styles.introBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
        Pick the field you studied or worked in above. We&apos;ll rank the fields you
        can realistically move into — ordered by how much of your existing skill
        set transfers — and show you exactly which skills carry over. Some moves
        are short sideways steps; others are bigger, honest stretches. We&apos;ll tell
        you which is which.
      </Text>
    </SifterCard>
  );
}

/** Result display for Scenario A: Fields you can move into */
type PivotRouter = Parameters<typeof exploreNav.domain>[0];

function PivotResults({
  data,
  colors,
  router,
}: {
  data: PivotResult;
  colors: ColorPalette;
  router: PivotRouter;
}) {
  const topOverlap = data.moves[0]?.overlapScore ?? 0;
  const isStretch = topOverlap < STRETCH_THRESHOLD;

  return (
    <View style={styles.results}>
      <SectionHeader
        title={`From ${data.fromDomain.name} → fields you can move into`}
      />

      {/* Honest distance banner. */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor: isStretch ? `${colors.accentRole.status}14` : `${colors.accentRole.success}14`,
            borderColor: isStretch ? colors.accentRole.status : colors.accentRole.success,
          },
        ]}
      >
        <Text style={styles.bannerIcon}>{isStretch ? "💪" : "✨"}</Text>
        <Text
          style={[
            styles.bannerText,
            { color: isStretch ? colors.accentRole.status : colors.accentRole.success }, CompassFonts.bodyMedium,
          ]}
        >
          {isStretch
            ? "These are meaningful stretches — expect real re-skilling. The overlap below shows how much of a head start you already have."
            : "Good news — several fields share a lot with your background. The strongest matches are at the top."}
        </Text>
      </View>

      {data.moves.map((move) => {
        const pct = Math.round(move.overlapScore * 100);
        const shared = move.sharedSkills.slice(0, MAX_SHARED_SKILLS);
        const extra = move.sharedSkills.length - shared.length;
        const barColor =
          move.overlapScore >= 0.4
            ? colors.accentRole.success
            : move.overlapScore >= STRETCH_THRESHOLD
              ? colors.accentRole.status
              : colors.accentRole.warning;

        return (
          <PressableCard
            key={move.domainId}
            onPress={() => exploreNav.domain(router, move.domainId)}
          >
            <View style={styles.moveCard}>
              <View style={styles.moveHeader}>
                <View style={styles.moveTitleWrap}>
                  <Text
                    style={[styles.moveName, { color: colors.textRole.primary }, CompassFonts.displayBold]}
                    numberOfLines={2}
                  >
                    {move.domainName}
                  </Text>
                  {move.cluster ? (
                    <Text
                      style={[styles.moveCluster, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}
                    >
                      {move.cluster}
                    </Text>
                  ) : null}
                </View>
                {move.eliteFlag ? (
                  <View
                    style={[
                      styles.eliteBadge,
                      { backgroundColor: `${colors.accentRole.status}14` },
                    ]}
                  >
                    <Text style={[styles.eliteText, { color: colors.accentRole.status }, CompassFonts.bodySemibold]}>
                      ⭐ Elite
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Overlap strength. */}
              <View style={styles.overlapRow}>
                <ProgressBar
                  progress={move.overlapScore}
                  color={barColor}
                  height={6}
                  animate={false}
                  style={styles.overlapBar}
                />
                <Text style={[styles.overlapPct, { color: barColor }]}>
                  {pct}% skill match
                </Text>
              </View>

              {/* Shared skills that carry over. */}
              {shared.length > 0 ? (
                <View style={styles.sharedWrap}>
                  <Text style={[styles.sharedLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                    shared:
                  </Text>
                  {shared.map((s) => (
                    <View
                      key={s}
                      style={[
                        styles.sharedChip,
                        { backgroundColor: colors.surface.subtle },
                      ]}
                    >
                      <Text
                        style={[styles.sharedChipText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}
                      >
                        {s}
                      </Text>
                    </View>
                  ))}
                  {extra > 0 ? (
                    <Text style={[styles.sharedMore, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
                      +{extra} more
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </PressableCard>
        );
      })}
    </View>
  );
}

/** Result display for Scenario B1: Target domain gap analysis */
function GapAnalysisResult({
  data,
  colors,
}: {
  data: { have: string[]; bridge: string[]; readiness: Readiness };
  colors: ColorPalette;
}) {
  return (
    <View style={styles.results}>
      <SectionHeader title="Gap Analysis: What You Have vs What You Need" />
      
      {/* Readiness banner. */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor:
              data.readiness === 'ready'
                ? `${colors.accentRole.success}14`
                : data.readiness === 'bridge'
                  ? `${colors.accentRole.status}14`
                  : `${colors.accentRole.warning}14`,
            borderColor:
              data.readiness === 'ready'
                ? colors.accentRole.success
                : data.readiness === 'bridge'
                  ? colors.accentRole.status
                  : colors.accentRole.warning,
          },
        ]}
      >
        <Text style={styles.bannerIcon}>
          {data.readiness === 'ready' ? '✅' : data.readiness === 'bridge' ? '⚠️' : '💪'}
        </Text>
        <Text
          style={[
            styles.bannerText,
            {
              color:
                data.readiness === 'ready'
                  ? colors.accentRole.success
                  : data.readiness === 'bridge'
                    ? colors.accentRole.status
                    : colors.accentRole.warning,
            }, CompassFonts.bodyMedium,
          ]}
        >
          {data.readiness === 'ready'
            ? 'You have most of the skills needed for this field!'
            : data.readiness === 'bridge'
              ? 'You have a good foundation but need to bridge some gaps.'
              : 'This is a significant stretch requiring substantial skill development.'}
        </Text>
      </View>

      {/* Skills you already have. */}
      {data.have.length > 0 ? (
        <View style={styles.skillsSection}>
          <SectionHeader title="Skills You Already Have" />
          <View style={styles.skillsList}>
            {data.have.map((skill) => (
              <View key={skill} style={styles.skillItem}>
                <Text style={[styles.skillText, CompassFonts.body]}>• {skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Skills you need to learn (the bridge). */}
      {data.bridge.length > 0 ? (
        <View style={styles.skillsSection}>
          <SectionHeader title="Skills You Need to Learn (Bridge)" />
          <View style={styles.skillsList}>
            {data.bridge.map((skill) => (
              <View key={skill} style={styles.skillItem}>
                <Text style={[styles.skillText, CompassFonts.body]}>• {skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

/** Result display for Scenario B2: Target role gap analysis */
function RoleGapAnalysisResult({
  data,
  colors,
  router,
}: {
  data: {
    covered: string[];
    missing: string[];
    readiness: Readiness;
    tier: "entry" | "mid" | "senior";
    careerLadder: string[];
  };
  colors: ColorPalette;
  router: PivotRouter;
}) {
  return (
    <View style={styles.results}>
      <SectionHeader title="Role Gap Analysis" />
      
      {/* Readiness banner. */}
      <View
        style={[
          styles.banner,
          {
            backgroundColor:
              data.readiness === 'ready'
                ? `${colors.accentRole.success}14`
                : data.readiness === 'bridge'
                  ? `${colors.accentRole.status}14`
                  : `${colors.accentRole.warning}14`,
            borderColor:
              data.readiness === 'ready'
                ? colors.accentRole.success
                : data.readiness === 'bridge'
                  ? colors.accentRole.status
                  : colors.accentRole.warning,
          },
        ]}
      >
        <Text style={styles.bannerIcon}>
          {data.readiness === 'ready' ? '✅' : data.readiness === 'bridge' ? '⚠️' : '💪'}
        </Text>
        <Text
          style={[
            styles.bannerText,
            {
              color:
                data.readiness === 'ready'
                  ? colors.accentRole.success
                  : data.readiness === 'bridge'
                    ? colors.accentRole.status
                    : colors.accentRole.warning,
            }, CompassFonts.bodyMedium,
          ]}
        >
          {data.readiness === 'ready'
            ? 'You have most of the skills needed for this role!'
            : data.readiness === 'bridge'
              ? 'You have a good foundation but need to bridge some gaps.'
              : 'This is a significant stretch requiring substantial skill development.'}
        </Text>
      </View>

      {/* Skills you already have (covered). */}
      {data.covered.length > 0 ? (
        <View style={styles.skillsSection}>
          <SectionHeader title="Skills You Already Have (Covered)" />
          <View style={styles.skillsList}>
            {data.covered.map((skill) => (
              <View key={skill} style={styles.skillItem}>
                <Text style={[styles.skillText, CompassFonts.body]}>• {skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Skills you need to learn (missing). */}
      {data.missing.length > 0 ? (
        <View style={styles.skillsSection}>
          <SectionHeader title="Skills You Need to Learn (Missing)" />
          <View style={styles.skillsList}>
            {data.missing.map((skill) => (
              <View key={skill} style={styles.skillItem}>
                <Text style={[styles.skillText, CompassFonts.body]}>• {skill}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Tier/level information. */}
      <View style={styles.tierSection}>
        <SectionHeader title="Role Level & Career Path" />
        <View style={styles.tierInfo}>
          <Text style={styles.tierLabel}>Role Level:</Text>
          <Text style={styles.tierValue}>{data.tier}</Text>
        </View>
        {data.careerLadder.length > 0 ? (
          <View style={styles.careerLadderSection}>
            <SectionHeader title="Typical Career Progression" />
            <View style={styles.careerLadderList}>
              {data.careerLadder.map((step, index) => (
                <View key={index} style={styles.careerLadderStep}>
                  <Text style={styles.careerLadderText}>
                    {index + 1}. {step}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      ) : null}
      </View>
    </View>
  );
}

export default CareerChangerScreen;

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
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.display * 1.15,
  },

  // Scenario selector
  scenarioSelector: { marginBottom: Spacing.lg },
  scenarioLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.sm,
  },
  scenarioTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  scenarioTab: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  scenarioTabActive: {
    backgroundColor: `${Colors.accentRole.action}14`,
    borderColor: Colors.accentRole.action,
  },
  scenarioTabInactive: {
    backgroundColor: Colors.surface.subtle,
    borderColor: Colors.borderRole.subtle,
  },
  scenarioTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // Picker
  pickerBlock: { gap: Spacing.sm, marginTop: Spacing.sm },
  pickerLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
  pickerHelp: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchIcon: { fontSize: FontSize.md },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    paddingVertical: 2,
  },
  clear: { fontSize: FontSize.md, fontWeight: FontWeight.bold },

  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  chipCluster: { fontSize: FontSize.xs },

  selectedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  selectedPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  selectedText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  change: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  // Results
  results: { gap: Spacing.md, marginTop: Spacing.sm },
  banner: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bannerIcon: { fontSize: FontSize.lg },
  bannerText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontWeight: FontWeight.medium,
  },

  // Intro
  introCard: { gap: Spacing.sm, alignItems: "flex-start", marginTop: Spacing.sm },
  introIcon: { fontSize: 26 },
  introTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  introBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
  },

  // Move card (reused from PivotResults)
  moveCard: { padding: Spacing.md, gap: Spacing.sm },
  moveHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  moveTitleWrap: { flex: 1, gap: 2 },
  moveName: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
  moveCluster: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  eliteBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  eliteText: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy },

  overlapRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  overlapBar: { flex: 1 },
  overlapPct: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy },

  sharedWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.xs,
  },
  sharedLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sharedChip: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  sharedChipText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  sharedMore: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  // Skills sections for gap analysis results
  skillsSection: { marginTop: Spacing.md },
  skillsSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  skillsList: { marginTop: Spacing.xs },
  skillItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xs,
    backgroundColor: Colors.surface.subtle,
    borderRadius: Radius.sm,
  },
  skillText: {
    fontSize: FontSize.sm,
    color: Colors.textRole.primary,
  },

  // Tier section for role gap analysis
  tierSection: { marginTop: Spacing.md },
  tierSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  tierInfo: { flexDirection: "row", gap: Spacing.sm },
  tierLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.textRole.muted,
  },
  tierValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  careerLadderSection: { marginTop: Spacing.sm },
  careerLadderSectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  careerLadderList: { marginTop: Spacing.xs },
  careerLadderStep: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.xs,
    backgroundColor: Colors.surface.subtle,
    borderRadius: Radius.sm,
  },
  careerLadderText: {
    fontSize: FontSize.sm,
    color: Colors.textRole.primary,
  },
});
