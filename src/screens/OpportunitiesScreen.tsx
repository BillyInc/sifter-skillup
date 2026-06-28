/**
 * OpportunitiesScreen — the live Opportunities hub.
 *
 * Internships & jobs (local · global · remote) the user's domains/roles map to.
 * Scope is employment only: internship | graduate_trainee | entry_level |
 * fellowship | contract — never NYSC/PPA, IT placement or apprenticeship.
 *
 * The body calls careerData.getOpportunities(filter) into a DataState and lets
 * <DataStateView> render its graceful states. Today every call returns a
 * `coming_soon` envelope, so the hub shows the on-brand "Coming soon" panel
 * automatically — the filter chrome stays fully interactive. When the FastAPI
 * routes land and the client starts returning `real` rows, the same JSX maps
 * each opportunity to an <OpportunityCard> with no UI changes.
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
  FontWeight,
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
  const [filter, setFilter] = useState<OpportunityFilter>({});
  const [state, setState] = useState<DataState<Opportunity[]>>(() =>
    comingSoon<Opportunity[]>("Internships & jobs are being populated."),
  );

  // Re-run whenever the filter changes; getOpportunities returns coming_soon now.
  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOpportunities(filter);
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, [filter]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Opportunities
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSoft }]}>
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
      <Text style={[styles.chipRowLabel, { color: colors.textMuted }]}>
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
          backgroundColor: active ? colors.accentSoft : colors.bgSecondary,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: active ? colors.accent : colors.textMuted },
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
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.quickLinkText, { color: colors.text }]}>
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
    fontWeight: FontWeight.black,
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
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
  quickLinkText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  filters: { gap: Spacing.sm, marginTop: Spacing.xs },
  chipRowWrap: { gap: Spacing.xs },
  chipRowLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
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
  chipText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  results: { marginTop: Spacing.sm },
  cards: { gap: Spacing.md },
});
