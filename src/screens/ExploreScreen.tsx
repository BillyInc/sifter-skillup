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
import React, { useEffect, useRef, useState } from "react";
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
  Brand,
  webContainer,
  type TierType,
} from "../theme";
import {
  DataStateView,
  LockedPill,
  TierBadgeView,
  InfoTooltip,
  CoachMark,
} from "../components/careerIntelligence";
import { SifterCard, PressableCard, SectionHeader } from "../components/ui";
import { careerData } from "../lib/careerData";
import { exploreNav } from "../lib/exploreNav";
import { type DataState, type CareerSearchResult } from "../types/career";
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
const asTier = (t?: string): TierType | undefined =>
  t && (TIERS as readonly string[]).includes(t) ? (t as TierType) : undefined;

const isEmptyResult = (r: CareerSearchResult): boolean =>
  r.domains.length === 0 && r.roles.length === 0 && r.programmes.length === 0;

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const isGuest = user?.auth_provider === "guest";

  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  // Only hold a result state once the term is searchable (>=2 chars), so the
  // three-door onboarding shows until the user has meaningfully typed.
  const [results, setResults] = useState<DataState<CareerSearchResult> | null>(
    null,
  );

  // Debounced disambiguation search — searchCareer returns all three groups
  // (domains, roles, programmes) wrapped in a DataState the view renders.
  useEffect(() => {
    const q = query.trim();
    if (q.length < MIN_QUERY) {
      setResults(null);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      const state = await careerData.searchCareer(q);
      if (active) setResults(state);
    }, 275);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  const trimmed = query.trim();
  const searching = trimmed.length >= MIN_QUERY;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>
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
              backgroundColor: colors.goldSoft,
              borderColor: `${Brand.primary}40`,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: Brand.primaryDeep }]}>
            You're browsing as a guest. Create an account to save matches and
            get alerts.
          </Text>
        </View>
      ) : null}

      {/* Disambiguation search */}
      <CoachMark
        storageKey="explore-intro-v1"
        text="Search a programme, field or job here — or scroll down and pick a starting point that fits where you are."
      >
        <View
          style={[
            styles.search,
            { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
          ]}
        >
          <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🔍</Text>
          <TextInput
            ref={searchRef}
            value={query}
            onChangeText={setQuery}
            placeholder="Search a field, role or programme — e.g. nursing, data scientist"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>
      </CoachMark>

      {searching && results ? (
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
              {data.domains.length ? (
                <View style={styles.group}>
                  <SectionHeader title="Fields" icon="🧭" />
                  {data.domains.map((d) => (
                    <PressableCard
                      key={d.id}
                      onPress={() => exploreNav.domain(router, d.id)}
                      glowColor={Brand.primary}
                    >
                      <View style={styles.row}>
                        <View style={styles.rowMain}>
                          <Text
                            style={[styles.rowTitle, { color: colors.text }]}
                            numberOfLines={1}
                          >
                            {d.name}
                          </Text>
                          {d.cluster ? (
                            <Text
                              style={[
                                styles.rowMeta,
                                { color: colors.textMuted },
                              ]}
                              numberOfLines={1}
                            >
                              {d.cluster}
                            </Text>
                          ) : null}
                        </View>
                        <Text
                          style={[
                            styles.chevron,
                            { color: colors.textMuted },
                          ]}
                        >
                          →
                        </Text>
                      </View>
                    </PressableCard>
                  ))}
                </View>
              ) : null}

              {/* Roles — each lists the domains it's reachable from */}
              {data.roles.length ? (
                <View style={styles.group}>
                  <SectionHeader title="Roles" icon="💼" />
                  {data.roles.map((r, ri) => {
                    const single =
                      r.domains.length === 1 ? r.domains[0] : undefined;
                    const roleBody = (
                      <View>
                        <View style={styles.roleHead}>
                          <Text
                            style={[styles.rowTitle, { color: colors.text }]}
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
                              { color: colors.textMuted },
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
                                    backgroundColor: colors.bgSecondary,
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.chipText,
                                    { color: colors.textSoft },
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
                        glowColor={Brand.primary}
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
              {data.programmes.length ? (
                <View style={styles.group}>
                  <SectionHeader title="Programmes" icon="🎓" />
                  {data.programmes.map((p) => {
                    const meta = p.discipline ?? p.institutionType;
                    return (
                      <PressableCard
                        key={p.id}
                        onPress={() => exploreNav.programme(router, p.id)}
                        glowColor={Brand.primary}
                      >
                        <View style={styles.row}>
                          <View style={styles.rowMain}>
                            <Text
                              style={[styles.rowTitle, { color: colors.text }]}
                              numberOfLines={2}
                            >
                              {p.name}
                            </Text>
                            {meta ? (
                              <Text
                                style={[
                                  styles.rowMeta,
                                  { color: colors.textMuted },
                                ]}
                                numberOfLines={1}
                              >
                                {meta}
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            style={[
                              styles.chevron,
                              { color: colors.textMuted },
                            ]}
                          >
                            →
                          </Text>
                        </View>
                      </PressableCard>
                    );
                  })}
                </View>
              ) : null}
            </View>
          )}
        </DataStateView>
      ) : (
        // ── Default onboarding mode (three doors + browse links) ─────
        <>
          <Text style={[styles.section, { color: colors.textSoft }]}>
            Where are you starting from?
          </Text>

          {DOORS.map((d) => (
            <TouchableOpacity
              key={d.key}
              activeOpacity={0.85}
              onPress={
                d.key === "know"
                  ? () => searchRef.current?.focus()
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
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={styles.cardIcon}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.cardHeadRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    {d.title}
                  </Text>
                  {d.live ? null : <LockedPill />}
                </View>
                <Text style={[styles.cardBody, { color: colors.textSoft }]}>
                  {d.body}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Browse the full domain map (context-free explorer). */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => exploreNav.domains(router)}
            style={styles.browse}
          >
            <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
              🧭 Browse all domains →
            </Text>
          </TouchableOpacity>

          {/* Aspirational + every-starting-point routes (Phase 7). */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => exploreNav.elitePathways(router)}
            style={styles.browse}
          >
            <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
              ⭐ Explore elite pathways →
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => exploreNav.pathways(router)}
            style={styles.browse}
          >
            <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
              🚪 Special pathways — PhD · career change · upgrades · credentials
              →
            </Text>
          </TouchableOpacity>

          <Text style={[styles.note, { color: colors.textMuted }]}>
            University and College of Education programmes come online first.
            Other institution types, opportunities and elite pathways are being
            populated.
          </Text>
        </>
      )}
    </ScrollView>
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
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.display * 1.15,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  banner: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.sm * 1.4,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    marginTop: Spacing.xs,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },

  // ── Results ──────────────────────────────────────────────────
  results: { gap: Spacing.lg, marginTop: Spacing.xs },
  group: { gap: Spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    minHeight: 44,
  },
  rowMain: { flex: 1 },
  rowTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  rowMeta: { fontSize: FontSize.xs, marginTop: 2 },
  chevron: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
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
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: "center",
    maxWidth: "100%",
  },
  chipText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  // ── Onboarding ───────────────────────────────────────────────
  browse: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: Spacing.xs,
  },
  browseText: { fontSize: FontSize.sm, fontWeight: FontWeight.heavy },
  section: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    textTransform: "uppercase",
  },
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  cardIcon: { fontSize: 26 },
  cardHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
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
