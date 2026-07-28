/**
 * ProgrammeOverviewScreen — the entry point for a single programme's career
 * intelligence (CCMAS v3.0). It shows the domains a programme unlocks, grouped
 * by their match type (Direct → Functional → Adjacent) and ordered by the
 * in-demand signal within each tier, then a "Level Up" CTA into the learning app.
 *
 * Three tracks live behind a header tab switch: "Employment" (Track A),
 * "Entrepreneurship" (Track B), and "Admission" (Track C). getProgramme currently
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
  SectionLabel,
  TextTabs,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { exploreNav } from "@/lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type DataMeta,
  type Programme,
  type DomainLink,
  type DomainMatchType,
  type AdmissionInsight,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  type ColorPalette,
} from "@/theme";

export interface ProgrammeOverviewScreenProps {
  programmeId: string;
}

type TrackTab = "employment" | "entrepreneurship" | "admission";

// Section order is fixed by the model: Direct → Functional → Adjacent.
const DOMAIN_TIERS: { type: DomainMatchType; title: string }[] = [
  { type: "direct", title: "Direct domains" },
  { type: "functional", title: "Functional domains" },
  { type: "adjacent", title: "Adjacent domains" },
];

// Minimal Programme used only to satisfy Track B's `real` envelope.
// TrackBEntrepreneurship ignores its `data` entirely (fixed pathway entry panel).
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
  const [admissionState, setAdmissionState] = useState<DataState<AdmissionInsight>>(
    () => comingSoon<AdmissionInsight>("Admission data is being compiled."),
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

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getAdmissionInsight(programmeId);
      if (active) setAdmissionState(result);
    })();
    return () => {
      active = false;
    };
  }, [programmeId]);

  const header = (
    <TextTabs
      value={tab}
      onChange={setTab}
      tabs={[
        { value: "employment", label: "Employment" },
        { value: "entrepreneurship", label: "Entrepreneurship" },
        { value: "admission", label: "Admission" },
      ]}
      style={styles.tabs}
    />
  );

  // Track B (Entrepreneurship) is a designed pathway entry, so it must render
  // regardless of the programme's data state — force a `real` envelope for it.
  // Track A (Employment) honours the real getProgramme state and so shows the
  // graceful Coming Soon panel until intelligence is populated.
  // Track C (Admission) uses admissionState which has its own data envelope.
  const scaffoldState: DataState<Programme> =
    tab === "entrepreneurship"
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
        ) : tab === "entrepreneurship" ? (
          <TrackBEntrepreneurship colors={colors} router={router} />
        ) : (
          <TrackCAdmission
            programmeId={programmeId}
            colors={colors}
            admissionState={admissionState}
            router={router}
          />
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
        <Text style={[styles.lead, { color: colors.textRole.secondary }]}>
          The domains your programme unlocks, strongest matches first.
        </Text>
        <TouchableOpacity
          onPress={() => setExplainerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="How mapping works"
          hitSlop={8}
          style={[styles.howBtn, { borderColor: colors.borderRole.subtle }]}
        >
          <Text style={[styles.howText, { color: colors.accentRole.action }]}>
            How mapping works
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
            Showing the standard programme name — your institution&apos;s exact naming
            is being verified.
          </Text>
        </View>
      ) : null}

      {DOMAIN_TIERS.map(({ type, title }) => {
        const links = grouped[type];
        if (!links.length) return null;
        return (
          <View key={type} style={styles.section}>
            <SectionLabel>{title}</SectionLabel>
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

/** Track B — entrepreneurship as the build path beside employment. */
function TrackBEntrepreneurship({
  colors,
  router,
}: {
  colors: ColorPalette;
  router: Router;
}) {
  return (
    <View
      style={[
        styles.business,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={[styles.businessEyebrow, { color: colors.textRole.muted }]}>
        ENTREPRENEURSHIP · TRACK B
      </Text>
      <Text style={[styles.businessTitle, { color: colors.textRole.primary }]}>
        Build from this programme
      </Text>
      <Text style={[styles.businessBody, { color: colors.textRole.secondary }]}>
        Employment is one path. Track B shows the ventures, creator routes,
        service models and scalable business archetypes a field can support.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => exploreNav.entrepreneurship(router)}
        style={[styles.admissionCTA, { backgroundColor: colors.accentRole.action }]}
      >
        <Text style={styles.admissionCTAText}>
          Open entrepreneurship pathway
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/** Track C — Admission Intelligence (standalone card, no nested DetailScaffold). */
function TrackCAdmission({
  programmeId,
  colors,
  admissionState,
  router,
}: {
  programmeId: string;
  colors: ColorPalette;
  admissionState: DataState<AdmissionInsight>;
  router: Router;
}) {
  return (
    <View
      style={[
        styles.business,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={[styles.businessEyebrow, { color: colors.textRole.muted }]}>
        ADMISSION · TRACK C
      </Text>
      <View style={styles.admissionContent}>
        {admissionState.status === "real" && admissionState.data ? (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }]}>
              Cut-offs & Formula ({admissionState.data.year})
            </Text>
            <Text style={[styles.admissionLabel, { color: colors.textRole.secondary }]}>
              {admissionState.data.label}
            </Text>
            <Text style={[styles.admissionLabel, { color: colors.textRole.muted }]}>
              {admissionState.data.programmeCount} programme(s) with cut-off data
            </Text>
            <Text style={[styles.admissionNote, { color: colors.textRole.muted }]}>
              Data is indicative — based on the {admissionState.data.year} admission cycle.
            </Text>
          </>
        ) : admissionState.status === "fallback" ? (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }]}>
              Admission data (fallback)
            </Text>
            <Text style={[styles.admissionNote, { color: colors.textRole.secondary }]}>
              {admissionState.meta?.notice}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }]}>
              University Admission Intelligence
            </Text>
            <Text style={[styles.admissionBody, { color: colors.textRole.secondary }]}>
              Annual Dec/Jan compile of JAMB cut-offs, aggregate formulas, and
              national competitiveness. Data will appear here once compiled.
            </Text>
            <Text style={[styles.admissionNote, { color: colors.textRole.muted }]}>
              {admissionState.meta?.notice}
            </Text>
          </>
        )}

        {/* Full admission intelligence: cut-offs, formula, floor, competitiveness. */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => exploreNav.admission(router, programmeId)}
          accessibilityRole="button"
          style={[styles.admissionCTA, { backgroundColor: colors.accentRole.action }]}
        >
          <Text style={styles.admissionCTAText}>
            View full admission insight
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ProgrammeOverviewScreen;

const styles = StyleSheet.create({
  tabs: {
    marginTop: Spacing.md,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: "center",
  },
  howText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "center",
  },
  businessEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.9,
    marginTop: Spacing.xs,
  },
  businessTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    textAlign: "center",
  },
  businessBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
    maxWidth: 420,
  },
  admissionContent: {
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  admissionLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.md * 1.5,
  },
  admissionYear: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  admissionCTA: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  admissionCTAText: {
    color: "#fff",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  admissionLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  admissionNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
  admissionBody: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    textAlign: "center",
    maxWidth: 420,
  },
});
