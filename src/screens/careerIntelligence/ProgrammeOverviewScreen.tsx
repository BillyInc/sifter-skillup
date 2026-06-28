/**
 * ProgrammeOverviewScreen — the entry point for a single programme's career
 * intelligence (CCMAS v3.0). It shows the domains a programme unlocks, grouped
 * by their match type (Direct → Functional → Adjacent) and ordered by the
 * in-demand signal within each tier, then a "Level Up" CTA into the learning app.
 *
 * Two tracks live behind a header tab switch: "Employment" (Track A, live) and
 * "Business" (Track B, entrepreneurship — coming soon). getProgramme currently
 * returns a `coming_soon` envelope, so DetailScaffold renders the graceful state
 * automatically; the populated branches below are what ship once data lands.
 */
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, type Router } from "expo-router";
import {
  DetailScaffold,
  DomainChip,
  DataSourceBadge,
  DomainMappingExplainer,
  NotesWidget,
  LevelUpCTA,
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type DataMeta,
  type Programme,
  type DomainLink,
  type DomainMatchType,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
  type ColorPalette,
} from "@/theme";

export interface ProgrammeOverviewScreenProps {
  programmeId: string;
}

type TrackTab = "employment" | "business";

// Section order is fixed by the model: Direct → Functional → Adjacent.
const DOMAIN_TIERS: { type: DomainMatchType; title: string }[] = [
  { type: "direct", title: "Direct domains" },
  { type: "functional", title: "Functional domains" },
  { type: "adjacent", title: "Adjacent domains" },
];

// Minimal Programme used only to satisfy the Business tab's `real` envelope —
// TrackBBusiness ignores its `data` entirely (it's a fixed coming-soon panel).
const PLACEHOLDER: Programme = {
  id: "",
  name: "Programme",
  institutionType: "university",
  discipline: "",
  domains: [],
};

/** Group domain links by match type, each tier sorted by inDemandScore DESC. */
function groupDomains(
  domains: DomainLink[],
): Record<DomainMatchType, DomainLink[]> {
  const by: Record<DomainMatchType, DomainLink[]> = {
    direct: [],
    functional: [],
    adjacent: [],
  };
  for (const link of domains) by[link.matchType].push(link);
  for (const type of Object.keys(by) as DomainMatchType[]) {
    by[type].sort((a, b) => (b.inDemandScore ?? 0) - (a.inDemandScore ?? 0));
  }
  return by;
}

export function ProgrammeOverviewScreen({
  programmeId,
}: ProgrammeOverviewScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [tab, setTab] = useState<TrackTab>("employment");
  const [state, setState] = useState<DataState<Programme>>(() =>
    comingSoon<Programme>("Programme intelligence is being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getProgramme(programmeId);
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, [programmeId]);

  const header = (
    <View style={styles.tabs}>
      <TrackTabButton
        label="💼 Employment"
        active={tab === "employment"}
        onPress={() => setTab("employment")}
      />
      <TrackTabButton
        label="🚀 Business"
        active={tab === "business"}
        onPress={() => setTab("business")}
      />
    </View>
  );

  // Track B (Business) is always coming-soon by scope, so it must render
  // regardless of the programme's data state — force a `real` envelope for it.
  // Track A (Employment) honours the real getProgramme state and so shows the
  // graceful Coming Soon panel until intelligence is populated.
  const scaffoldState: DataState<Programme> =
    tab === "business"
      ? { status: "real", data: state.data ?? PLACEHOLDER }
      : state;

  return (
    <DetailScaffold
      eyebrow="PROGRAMME"
      title={state.data?.displayName ?? state.data?.name ?? "Programme"}
      save={{ entityType: "programme", entityId: programmeId }}
      pdf
      state={scaffoldState}
      header={header}
    >
      {(data) =>
        tab === "employment" ? (
          <TrackAEmployment
            data={data}
            programmeId={programmeId}
            router={router}
            colors={colors}
            status={state.status}
            meta={state.meta}
          />
        ) : (
          <TrackBBusiness colors={colors} />
        )
      }
    </DetailScaffold>
  );
}

/**
 * IBASS naming is institution-specific. When a programme carries no verified
 * `displayName` — i.e. we're showing the standard national name as a fallback —
 * say so honestly rather than implying the name is institution-exact.
 */
function isIbassVerified(
  data: Programme,
  status: DataState<Programme>["status"],
  meta?: DataMeta,
): boolean {
  return (
    Boolean(data.displayName) &&
    status !== "fallback" &&
    (meta?.verification ?? "verified") === "verified"
  );
}

/** Track A — the live employment view: domains grouped by match type + CTA. */
function TrackAEmployment({
  data,
  programmeId,
  router,
  colors,
  status,
  meta,
}: {
  data: Programme;
  programmeId: string;
  router: Router;
  colors: ColorPalette;
  status: DataState<Programme>["status"];
  meta?: DataMeta;
}) {
  const [explainerOpen, setExplainerOpen] = useState(false);
  const grouped = useMemo(
    () => groupDomains(data.domains ?? []),
    [data.domains],
  );
  const ibassVerified = isIbassVerified(data, status, meta);

  return (
    <View style={styles.trackBody}>
      <View style={styles.leadRow}>
        <Text style={[styles.lead, { color: colors.textSoft }]}>
          🎯 The domains your programme unlocks — strongest matches first.
        </Text>
        <TouchableOpacity
          onPress={() => setExplainerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="How mapping works"
          hitSlop={8}
          style={[styles.howBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.howText, { color: Brand.primaryDeep }]}>
            ⓘ How mapping works
          </Text>
        </TouchableOpacity>
      </View>

      {/* Honest naming: standard national name shown until IBASS verifies the
          institution-specific one. */}
      {!ibassVerified ? (
        <View style={styles.provenance}>
          <DataSourceBadge
            verification="pending"
            source="Standard national naming"
          />
          <Text style={[styles.provenanceNote, { color: colors.textMuted }]}>
            Showing the standard programme name — your institution's exact naming
            is being verified.
          </Text>
        </View>
      ) : null}

      {DOMAIN_TIERS.map(({ type, title }) => {
        const links = grouped[type];
        if (!links.length) return null;
        return (
          <View key={type} style={styles.section}>
            <SectionHeader title={title} />
            <View style={styles.chips}>
              {links.map((link) => (
                <DomainChip
                  key={link.domainId}
                  label={link.domainName}
                  matchType={link.matchType}
                  elite={link.eliteFlag}
                  onPress={() => exploreNav.domain(router, link.domainId)}
                />
              ))}
            </View>
          </View>
        );
      })}

      <View style={styles.section}>
        <NotesWidget entityType="programme" entityId={programmeId} />
      </View>

      <LevelUpCTA
        title="Ready to close the gap?"
        body="Build the bridge skills these domains need — one level at a time."
      />

      <DomainMappingExplainer
        visible={explainerOpen}
        onClose={() => setExplainerOpen(false)}
      />
    </View>
  );
}

/** Track B — entrepreneurship paths. Coming soon per scope (inline panel). */
function TrackBBusiness({ colors }: { colors: ColorPalette }) {
  return (
    <View
      style={[
        styles.business,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.businessIcon}>🚀</Text>
      <Text style={[styles.businessEyebrow, { color: Brand.primaryDeep }]}>
        BUSINESS · TRACK B
      </Text>
      <Text style={[styles.businessTitle, { color: colors.text }]}>
        Entrepreneurship paths — coming soon
      </Text>
      <Text style={[styles.businessBody, { color: colors.textSoft }]}>
        Turn your programme into a venture: the business routes, starter
        playbooks and funding paths are being populated. Check back shortly.
      </Text>
    </View>
  );
}

function TrackTabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={[
        styles.tab,
        {
          backgroundColor: active ? colors.accentSoft : colors.bgSecondary,
          borderColor: active ? colors.accent : colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.tabLabel,
          { color: active ? colors.accent : colors.textMuted },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default ProgrammeOverviewScreen;

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  tab: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  tabLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  trackBody: {
    gap: Spacing.xl,
  },
  leadRow: {
    gap: Spacing.sm,
  },
  lead: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.md * 1.5,
  },
  howBtn: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: "center",
  },
  howText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  provenance: {
    gap: 4,
  },
  provenanceNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
  section: {
    gap: Spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  business: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "center",
  },
  businessIcon: { fontSize: 40 },
  businessEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
    marginTop: Spacing.xs,
  },
  businessTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    textAlign: "center",
  },
  businessBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
    maxWidth: 420,
  },
});
