/**
 * OpportunitiesScreen — the live Opportunities hub.
 *
 * Internships & jobs (local · global · remote) the user's domains/roles map to.
 * Scope is employment only: internship | graduate_trainee | entry_level |
 * fellowship | contract — never NYSC/PPA, IT placement or apprenticeship.
 *
 * The body calls careerData.getOpportunities(filter) into a DataState and lets
 * <DataStateView> render its graceful states. Semantic tokens + CompassFonts
 * (BRIEF chrome).
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  webContainer,
  type ColorPalette,
} from "../theme";
import { careerData } from "../lib/careerData";
import { opportunitiesNav } from "../lib/opportunitiesNav";
import {
  comingSoon,
  type DataState,
  type Opportunity,
  type OpportunityFilter,
  type OpportunityScope,
  type OpportunityType,
  type Likelihood,
} from "../types/career";
import {
  DataStateView,
  OpportunityCard,
  SubscribeButton,
  SearchBar,
  FilterChip,
} from "../components/careerIntelligence";

// ─── Filter chip option tables ────────────────────────────────
// `undefined` value = the "All" chip (clears that facet of the filter).
const SCOPE_OPTIONS: { label: string; value?: OpportunityScope }[] = [
  { label: "All" },
  { label: "🇳🇬 Local", value: "local" },
  { label: "✈️ Global", value: "global" },
  { label: "💻 Remote", value: "remote" },
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
  { label: "🟢 High", value: "high" },
  { label: "🟡 Medium", value: "medium" },
];

export function OpportunitiesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<OpportunityFilter>({});
  const [state, setState] = useState<DataState<Opportunity[]>>(() =>
    comingSoon<Opportunity[]>("Internships & jobs are being populated."),
  );

  // Re-run whenever the filter changes; getOpportunities returns coming_soon now.
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOpportunities({ ...filter, query: query.trim() || undefined });
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, [filter, query]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Opportunities
      </Text>
      <Text style={[styles.subtitle, { color: colors.textRole.secondary }, CompassFonts.body]}>
        Internships & jobs — local, global, remote
      </Text>

      {/* Quick links */}
      <View style={styles.quickLinks}>
        <QuickLink
          label="🎓 Scholarships →"
          onPress={() => opportunitiesNav.scholarships(router)}
          colors={colors}
        />
        <QuickLink
          label="📅 Application windows →"
          onPress={() => opportunitiesNav.windows(router)}
          colors={colors}
        />
      </View>

      {/* Search */}
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Search opportunities…"
      />

      {/* Filters */}
      <View style={styles.filters}>
        <ChipRow label="Scope">
          {SCOPE_OPTIONS.map((opt) => (
            <Chip
              key={opt.label}
              label={opt.label}
              active={filter.scope === opt.value}
              onPress={() => setFilter((f) => ({ ...f, scope: opt.value }))}
              colors={colors}
            />
          ))}
        </ChipRow>
        <ChipRow label="Type">
          {TYPE_OPTIONS.map((opt) => (
            <Chip
              key={opt.label}
              label={opt.label}
              active={filter.type === opt.value}
              onPress={() => setFilter((f) => ({ ...f, type: opt.value }))}
              colors={colors}
            />
          ))}
        </ChipRow>
        <ChipRow label="Likelihood">
          {LIKELIHOOD_OPTIONS.map((opt) => (
            <Chip
              key={opt.label}
              label={opt.label}
              active={filter.likelihood === opt.value}
              onPress={() =>
                setFilter((f) => ({ ...f, likelihood: opt.value }))
              }
              colors={colors}
            />
          ))}
        </ChipRow>
      </View>

      {/* Results */}
      <View style={styles.results}>
        <DataStateView state={state} empty={(d) => d.length === 0}>
          {(opportunities) => (
            <View style={styles.cards}>
              {opportunities.map((o) => (
                <OpportunityCard
                  key={o.id}
                  opportunity={o}
                  onPress={() => opportunitiesNav.opportunity(router, o.id)}
                  subscribeSlot={
                    <SubscribeButton target="opportunity" targetId={o.id} />
                  }
                />
              ))}
            </View>
          )}
        </DataStateView>
      </View>
    </ScrollView>
  );
}

export default OpportunitiesScreen;

// ─── Local building blocks ────────────────────────────────────

/** A labelled horizontal, non-wrapping row of filter chips. */
function ChipRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.chipRowWrap}>
      <Text style={[styles.chipRowLabel, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        {label}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRowContent}
      >
        {children}
      </ScrollView>
    </View>
  );
}

/** A single reusable filter chip. Touch target >= 44pt tall. */
function Chip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accentRole.action + "14" : colors.surface.raised,
          borderColor: active ? colors.accentRole.action : colors.borderRole.subtle,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.accentRole.action : colors.textRole.muted },
          CompassFonts.bodyBold,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/** A pill-style quick link to the secondary stacks. */
function QuickLink({
  label,
  onPress,
  colors,
}: {
  label: string;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="link"
      style={[
        styles.quickLink,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={[styles.quickLinkText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  heading: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  quickLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  quickLink: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
    justifyContent: "center",
  },
  quickLinkText: { fontSize: FontSize.sm },
  filters: { gap: Spacing.sm, marginTop: Spacing.xs },
  chipRowWrap: { gap: Spacing.xs },
  chipRowLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  chipRowContent: { gap: Spacing.sm, paddingRight: Spacing.md },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    minHeight: 44,
    justifyContent: "center",
  },
  chipText: { fontSize: FontSize.sm },
  results: { marginTop: Spacing.sm },
  cards: { gap: Spacing.md },
});
