/**
 * OpportunitiesScreen — the live Opportunities hub.
 *
 * Verified opportunities (local · global · remote) the user's domains/roles map to.
 *
 * Phase 10 redesign: editorial header, FilterChip rail, responsive card grid,
 * all legacy tokens migrated.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/hooks/useAuth";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
} from "@/theme";
import { careerData } from "@/lib/careerData";
import { opportunitiesNav } from "@/lib/opportunitiesNav";
import { useResponsive } from "@/hooks/useResponsive";
import {
  pending,
  type DataState,
  type Opportunity,
  type OpportunityFilter,
  type OpportunityScope,
  type OpportunityType,
  type Likelihood,
} from "@/types/career";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import {
  DataStateView,
  OpportunityCard,
  SubscribeButton,
  SearchBar,
  FilterChip,
} from "@/components/careerIntelligence";

const SCOPE_OPTIONS: { label: string; value?: OpportunityScope }[] = [
  { label: "All" },
  { label: "Local", value: "local" },
  { label: "Global", value: "global" },
  { label: "Remote", value: "remote" },
];

const TYPE_OPTIONS: { label: string; value?: OpportunityType }[] = [
  { label: "All" },
  { label: "Internship", value: "internship" },
  { label: "Graduate Trainee", value: "graduate_trainee" },
  { label: "Entry-level", value: "entry_level" },
  { label: "Fellowship", value: "fellowship" },
  { label: "Contract", value: "contract" },
];

const LIKELIHOOD_OPTIONS: { label: string; value?: Likelihood }[] = [
  { label: "All" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
];

export function OpportunitiesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const resp = useResponsive();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === "guest";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OpportunityFilter>({});
  const [state, setState] = useState<DataState<Opportunity[]>>(() =>
    pending<Opportunity[]>("Loading verified Opportunities..."),
  );

  const loadOpportunities = useCallback(() => {
    setState(pending<Opportunity[]>("Loading verified Opportunities..."));
    if (isGuest) return () => undefined;
    let active = true;
    void (async () => {
      const result = await careerData.getOpportunities({ ...filter, query: query.trim() || undefined });
      if (active) setState(result);
    })();
    return () => { active = false; };
  }, [filter, isGuest, query]);

  useEffect(() => loadOpportunities(), [loadOpportunities]);

  const isDesktop = resp.isDesktop && resp.isWeb;
  const isTablet = resp.isTablet;

  if (isGuest) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.surface.base }} contentContainerStyle={styles.guestScroll}>
        <View style={[styles.guestCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <View style={[styles.guestIcon, { backgroundColor: colors.accentRole.action + "14" }]}>
            <Feather name="briefcase" size={22} color={colors.accentRole.action} />
          </View>
          <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>OPPORTUNITIES</Text>
          <Text style={[styles.guestTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Opportunities are for your saved direction</Text>
          <Text style={[styles.guestBody, { color: colors.textRole.secondary }]}>Create an account to see opportunities connected to your programmes, domains and roles, and to save the ones you want to revisit.</Text>
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
    >
      {/* ── Editorial hero ───────────────────────────────────── */}
      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
          OPPORTUNITIES
        </Text>
        <Text style={[styles.heading, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
          Opportunities
        </Text>
        <Text style={[styles.subtitle, { color: colors.textRole.secondary }]}>
          Verified opportunities — local, global, remote
        </Text>
      </View>

      {/* ── Quick links ────────────────────────────────────── */}
      <View style={styles.quickLinks}>
        <TouchableOpacity
          onPress={() => opportunitiesNav.scholarships(router)}
          activeOpacity={0.85}
          style={[styles.quickLink, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
        >
          <Feather name="award" size={14} color={colors.accentRole.status} style={{ marginRight: Spacing.xs }} />
          <Text style={[styles.quickLinkText, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Scholarships
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => opportunitiesNav.windows(router)}
          activeOpacity={0.85}
          style={[styles.quickLink, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
        >
          <Feather name="calendar" size={14} color={colors.accentRole.action} style={{ marginRight: Spacing.xs }} />
          <Text style={[styles.quickLinkText, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Application windows
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Search ──────────────────────────────────────────── */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search opportunities…"
      />

      {/* ── Filter chips ────────────────────────────────────── */}
      <View style={styles.filterRail}>
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
            Scope
          </Text>
          <View style={styles.chipRow}>
            {SCOPE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.label}
                label={opt.label}
                active={filter.scope === opt.value}
                onPress={() => setFilter((f) => ({ ...f, scope: opt.value }))}
              />
            ))}
          </View>
        </View>
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
            Type
          </Text>
          <View style={styles.chipRow}>
            {TYPE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.label}
                label={opt.label}
                active={filter.type === opt.value}
                onPress={() => setFilter((f) => ({ ...f, type: opt.value }))}
              />
            ))}
          </View>
        </View>
        <View style={styles.filterGroup}>
          <Text style={[styles.filterLabel, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
            Likelihood
          </Text>
          <View style={styles.chipRow}>
            {LIKELIHOOD_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.label}
                label={opt.label}
                active={filter.likelihood === opt.value}
                onPress={() => setFilter((f) => ({ ...f, likelihood: opt.value }))}
              />
            ))}
          </View>
        </View>
      </View>

      {/* ── Results ─────────────────────────────────────────── */}
      <View style={styles.results}>
        <DataStateView state={state} empty={(d) => d.length === 0} spinnerOnPending={!state.data} onRetry={loadOpportunities}>
          {(opportunities) => (
            <View style={[styles.cards, (isDesktop || isTablet) ? styles.cardsGrid : undefined]}>
              {opportunities.map((o, i) => (
                <View key={o.id} style={(isDesktop || isTablet) ? styles.cardWrap : undefined}>
                  <StaggerReveal index={i}>
                    <OpportunityCard
                      opportunity={o}
                      onPress={() => opportunitiesNav.opportunity(router, o.id)}
                      subscribeSlot={
                        <SubscribeButton target="opportunity" targetId={o.id} />
                      }
                    />
                  </StaggerReveal>
                </View>
              ))}
            </View>
          )}
        </DataStateView>
      </View>
    </ScrollView>
  );
}

export default OpportunitiesScreen;

const styles = StyleSheet.create({
  guestScroll: { flexGrow: 1, padding: Spacing.xl, justifyContent: "center" },
  guestCard: { width: "100%", maxWidth: 680, alignSelf: "center", borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.sm },
  guestIcon: { width: 52, height: 52, borderRadius: Radius.md, alignItems: "center", justifyContent: "center", marginBottom: Spacing.xs },
  guestTitle: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.18 },
  guestBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, marginBottom: Spacing.sm },
  guestAction: { alignSelf: "flex-start", paddingVertical: Spacing.xs },
  guestActionText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  hero: { gap: 4, marginBottom: Spacing.xs },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  heading: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
    marginTop: 4,
  },

  // ── Quick links ──────────────────────────────────────────
  quickLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    minHeight: 36,
  },
  quickLinkText: { fontSize: FontSize.sm },

  // ── Filter rail ──────────────────────────────────────────
  filterRail: {
    gap: Spacing.sm,
  },
  filterGroup: {
    gap: Spacing.xs,
  },
  filterLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  // ── Results ──────────────────────────────────────────────
  results: { marginTop: Spacing.xs },
  cards: { gap: Spacing.sm },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  cardWrap: {
    flexBasis: 320,
    flexGrow: 1,
    minWidth: 280,
  },
});
