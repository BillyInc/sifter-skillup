/**
 * ProgrammeOverviewScreen — the student-facing view of a programme.
 *
 * Primary identifier: JAMB programme name (what the university calls it).
 * CCMAS programme details (standard name, duration, qualification) are in the
 * background as canonical metadata.
 *
 * Sections:
 * 1. Hero — JAMB name, institution type, CCMAS metadata card
 * 2. Entry requirements — O-Level + UTME subject combos (from JAMB schools)
 * 3. Schools — universities offering this programme
 * 4. Career outcomes — 3-tab layout: Employment, Entrepreneurship, Admission
 *
 * Responsive: 2-column on desktop (section nav left + content), single on mobile.
 */
import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, type Router } from "expo-router";
import { Feather } from "@expo/vector-icons";
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
import { careerData, type JambProgrammeSuggestion, type JambProgrammeSchool } from "@/lib/careerData";
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
  CompassFonts,
  type ColorPalette,
} from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";

export interface ProgrammeOverviewScreenProps {
  programmeId: string;
}

type TrackTab = "employment" | "entrepreneurship" | "admission";

const DOMAIN_TIERS: { type: DomainMatchType; title: string }[] = [
  { type: "direct", title: "Direct domains" },
  { type: "functional", title: "Functional domains" },
  { type: "adjacent", title: "Adjacent domains" },
];

const PLACEHOLDER: Programme = {
  id: "",
  name: "Programme",
  institutionType: "university",
  discipline: "",
  domains: [],
};

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "requirements", label: "Requirements" },
  { key: "schools", label: "Schools" },
  { key: "careers", label: "Careers" },
] as const;

const CHROME_OFFSET = 104;

function groupDomains(domains: DomainLink[]): Record<DomainMatchType, DomainLink[]> {
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

export function ProgrammeOverviewScreen({ programmeId }: ProgrammeOverviewScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const resp = useResponsive();
  const [tab, setTab] = useState<TrackTab>("employment");

  const [state, setState] = useState<DataState<Programme>>(() =>
    comingSoon<Programme>("Programme intelligence is being populated."),
  );
  const [admissionState, setAdmissionState] = useState<DataState<AdmissionInsight>>(
    () => comingSoon<AdmissionInsight>("Admission data is being compiled."),
  );
  const [jambSuggestions, setJambSuggestions] = useState<JambProgrammeSuggestion[]>([]);
  const [jambSchools, setJambSchools] = useState<JambProgrammeSchool[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getProgramme(programmeId);
      if (active) setState(result);
    })();
    return () => { active = false; };
  }, [programmeId]);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getAdmissionInsight(programmeId);
      if (active) setAdmissionState(result);
    })();
    return () => { active = false; };
  }, [programmeId]);

  useEffect(() => {
    if (state.status !== "real" || !state.data) return;
    let active = true;
    (async () => {
      const result = await careerData.searchJambProgrammes(state.data!.name);
      if (active && result.status === "real" && result.data) {
        setJambSuggestions(result.data);
        const firstJamb = result.data[0];
        if (firstJamb) {
          const schoolsRes = await careerData.getJambProgrammeSchools(firstJamb.jambProgrammeId);
          if (active && schoolsRes.status === "real" && schoolsRes.data) {
            setJambSchools(schoolsRes.data);
          }
        }
      }
    })();
    return () => { active = false; };
  }, [state.status, state.data]);

  const programme = state.data;
  const jambName = jambSuggestions[0]?.jambName ?? programme?.displayName ?? programme?.name ?? "Programme";

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

  const scaffoldState: DataState<Programme> =
    tab === "entrepreneurship"
      ? { status: "real", data: state.data ?? PLACEHOLDER }
      : state;

  return (
    <DetailScaffold
      eyebrow="PROGRAMME"
      title={jambName}
      save={{ entityType: "programme", entityId: programmeId }}
      pdf
      state={scaffoldState}
      header={header}
    >
      {(data) => (
        <ProgrammeBody
          data={data}
          programmeId={programmeId}
          router={router}
          colors={colors}
          status={state.status}
          meta={state.meta}
          tab={tab}
          admissionState={admissionState}
          resp={resp}
          jambSuggestions={jambSuggestions}
          jambSchools={jambSchools}
        />
      )}
    </DetailScaffold>
  );
}

function ProgrammeBody({
  data,
  programmeId,
  router,
  colors,
  status,
  meta,
  tab,
  admissionState,
  resp,
  jambSuggestions,
  jambSchools,
}: {
  data: Programme;
  programmeId: string;
  router: Router;
  colors: ColorPalette;
  status: DataState<Programme>["status"];
  meta?: DataMeta;
  tab: TrackTab;
  admissionState: DataState<AdmissionInsight>;
  resp: ReturnType<typeof useResponsive>;
  jambSuggestions: JambProgrammeSuggestion[];
  jambSchools: JambProgrammeSchool[];
}) {
  const isDesktop = resp.isDesktop && resp.isWeb;

  if (tab === "entrepreneurship") {
    return <TrackBEntrepreneurship colors={colors} router={router} />;
  }

  if (tab === "admission") {
    return (
      <TrackCAdmission
        programmeId={programmeId}
        colors={colors}
        admissionState={admissionState}
        router={router}
      />
    );
  }

  // ── Section positions for nav scrolling ──────────────────────
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const scrollRef = useRef<ScrollView>(null);

  const onSectionLayout = useCallback((key: string, y: number) => {
    if (sectionY.current[key] === undefined) {
      sectionY.current[key] = CHROME_OFFSET + y;
    }
  }, []);

  const scrollTo = useCallback((key: string) => {
    const y = sectionY.current[key];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 20), animated: true });
    }
    setActiveSection(key);
  }, []);

  // ── Employment (Track A) content ──────────────────────────────
  const grouped = useMemo(() => groupDomains(data.domains ?? []), [data.domains]);
  const ibassVerified = isIbassVerified(data, status, meta);

  // Build aggregated requirements from JAMB schools
  const uniqueRequirements = useMemo(() => {
    const seen = new Set<string>();
    return jambSchools
      .map((s) => s.schoolRequirements)
      .filter((r): r is NonNullable<typeof r> => r != null && r.olevelRequirement != null)
      .filter((r) => {
        const key = r.olevelRequirement!.slice(0, 80);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 3);
  }, [jambSchools]);

  const uniqueUtme = useMemo(() => {
    const seen = new Set<string>();
    return jambSchools
      .map((s) => s.schoolRequirements)
      .filter((r): r is NonNullable<typeof r> => r != null && r.utmeSubjects != null)
      .filter((r) => {
        const key = r.utmeSubjects!.slice(0, 80);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 3);
  }, [jambSchools]);

  const content = (
    <>
      {/* ── Overview: programme metadata ──────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("overview", e.nativeEvent.layout.y)} />
        <View style={styles.programmeMeta}>
          {/* CCMAS canonical name + metadata */}
          <View style={[styles.metaCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.metaLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              CCMAS programme details
            </Text>
            <View style={styles.metaRows}>
              {data.name ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textRole.secondary }]}>Standard name</Text>
                  <Text style={[styles.metaVal, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{data.name}</Text>
                </View>
              ) : null}
              {data.qualification ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textRole.secondary }]}>Qualification</Text>
                  <Text style={[styles.metaVal, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{data.qualification}</Text>
                </View>
              ) : null}
              {data.durationYears ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textRole.secondary }]}>Duration</Text>
                  <Text style={[styles.metaVal, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{data.durationYears} years</Text>
                </View>
              ) : null}
              {data.discipline ? (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaKey, { color: colors.textRole.secondary }]}>Discipline</Text>
                  <Text style={[styles.metaVal, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{data.discipline}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* JAMB name variations */}
          {jambSuggestions.length > 1 ? (
            <View style={styles.jambNames}>
              <Text style={[styles.metaLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                Also known as
              </Text>
              <View style={styles.jambChips}>
                {jambSuggestions.slice(1, 6).map((j) => (
                  <View key={j.jambProgrammeId} style={[styles.jambChip, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                    <Text style={[styles.jambChipText, { color: colors.textRole.secondary }]} numberOfLines={1}>{j.jambName}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {/* Naming provenance */}
          {!ibassVerified ? (
            <View style={styles.provenance}>
              <DataSourceBadge
                verification="pending"
                source="Standard national naming"
              />
              <Text style={[styles.provenanceNote, { color: colors.textRole.muted }]}>
                Showing the standard programme name — your institution&apos;s exact naming is being verified.
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* ── Entry requirements ────────────────────────────── */}
      {(uniqueRequirements.length > 0 || uniqueUtme.length > 0) && (
        <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
          <View onLayout={(e) => onSectionLayout("requirements", e.nativeEvent.layout.y)} />
          <View style={{ gap: Spacing.sm }}>
            <SectionLabel>Entry requirements</SectionLabel>
            {uniqueUtme.length > 0 ? (
              <View style={[styles.reqCard, { borderColor: colors.borderRole.subtle }]}>
                <View style={styles.reqHeader}>
                  <Feather name="edit-3" size={14} color={colors.accentRole.action} />
                  <Text style={[styles.reqLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                    UTME subject combination
                  </Text>
                </View>
                {uniqueUtme.map((r, i) => (
                  <Text key={i} style={[styles.reqText, { color: colors.textRole.secondary }]}>
                    {r.utmeSubjects}
                  </Text>
                ))}
              </View>
            ) : null}
            {uniqueRequirements.length > 0 ? (
              <View style={[styles.reqCard, { borderColor: colors.borderRole.subtle }]}>
                <View style={styles.reqHeader}>
                  <Feather name="book" size={14} color={colors.accentRole.status} />
                  <Text style={[styles.reqLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                    O-Level requirements
                  </Text>
                </View>
                {uniqueRequirements.map((r, i) => (
                  <Text key={i} style={[styles.reqText, { color: colors.textRole.secondary }]}>
                    {r.olevelRequirement}
                  </Text>
                ))}
              </View>
            ) : null}
            <DataSourceBadge
              verification="inferred"
              source="JAMB brochure"
              style={{ alignSelf: "flex-start" }}
            />
          </View>
        </View>
      )}

      {/* ── Schools ────────────────────────────────────────── */}
      {jambSchools.length > 0 && (
        <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
          <View onLayout={(e) => onSectionLayout("schools", e.nativeEvent.layout.y)} />
          <View style={{ gap: Spacing.sm }}>
            <SectionLabel>Schools offering this programme</SectionLabel>
            <View style={resp.isDesktop ? styles.schoolGrid : styles.schoolList}>
              {jambSchools.slice(0, 8).map((s) => (
                <View key={s.schoolId} style={[styles.schoolCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                  <View style={styles.schoolIcon}>
                    <Feather name="home" size={16} color={colors.textRole.secondary} />
                  </View>
                  <View style={styles.schoolInfo}>
                    <Text style={[styles.schoolName, { color: colors.textRole.primary }, CompassFonts.bodySemibold]} numberOfLines={1}>
                      {s.schoolName}
                    </Text>
                    {s.form ? (
                      <Text style={[styles.schoolMeta, { color: colors.textRole.muted }]}>
                        {s.form === "UTME" ? "UTME" : "Direct Entry"}
                        {s.aggregateCutoff ? ` · Cut-off: ${s.aggregateCutoff}` : ""}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
            {jambSchools.length > 8 ? (
              <Text style={[styles.schoolsMore, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
                +{jambSchools.length - 8} more schools
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* ── Career domains ────────────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("careers", e.nativeEvent.layout.y)} />
        <View style={styles.leadRow}>
          <Text style={[styles.lead, { color: colors.textRole.secondary }]}>
            The domains your programme unlocks, strongest matches first.
          </Text>
        </View>

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
      </View>
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopRow}>
        <View style={styles.navColumn}>
          <View style={[styles.navSticky, { borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.navTitle, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              On this page
            </Text>
            {SECTIONS.map((s) => (
              <TouchableOpacity
                key={s.key}
                onPress={() => scrollTo(s.key)}
                style={[styles.navItem, activeSection === s.key && { backgroundColor: colors.surface.subtle }]}
                activeOpacity={0.6}
              >
                <View style={[styles.navDot, { backgroundColor: activeSection === s.key ? colors.accentRole.action : colors.borderRole.subtle }]} />
                <Text style={[styles.navLabel, { color: activeSection === s.key ? colors.textRole.primary : colors.textRole.secondary }, CompassFonts.bodyMedium]} numberOfLines={1}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <ScrollView ref={scrollRef} style={styles.mainScroll} showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
          <View style={{ gap: Spacing.lg }}>{content}</View>
        </ScrollView>
      </View>
    );
  }

  return <View style={{ gap: Spacing.lg }}>{content}</View>;
}

function TrackBEntrepreneurship({ colors, router }: { colors: ColorPalette; router: Router }) {
  return (
    <View style={[styles.business, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.businessEyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
        ENTREPRENEURSHIP · TRACK B
      </Text>
      <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
        Build from this programme
      </Text>
      <Text style={[styles.businessBody, { color: colors.textRole.secondary }]}>
        Employment is one path. Track B shows the ventures, creator routes, service models and scalable business archetypes a field can support.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => exploreNav.entrepreneurship(router)}
        style={[styles.admissionCTA, { backgroundColor: colors.accentRole.action }]}
      >
        <Text style={[styles.admissionCTAText, CompassFonts.bodySemibold]}>
          Open entrepreneurship pathway
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function TrackCAdmission({
  programmeId, colors, admissionState, router,
}: {
  programmeId: string; colors: ColorPalette; admissionState: DataState<AdmissionInsight>; router: Router;
}) {
  return (
    <View style={[styles.business, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.businessEyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
        ADMISSION · TRACK C
      </Text>
      <View style={styles.admissionContent}>
        {admissionState.status === "real" && admissionState.data ? (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
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
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
              Admission data (fallback)
            </Text>
            <Text style={[styles.admissionNote, { color: colors.textRole.secondary }]}>
              {admissionState.meta?.notice}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
              University Admission Intelligence
            </Text>
            <Text style={[styles.admissionBody, { color: colors.textRole.secondary }]}>
              Annual Dec/Jan compile of JAMB cut-offs, aggregate formulas, and national competitiveness. Data will appear here once compiled.
            </Text>
            <Text style={[styles.admissionNote, { color: colors.textRole.muted }]}>
              {admissionState.meta?.notice}
            </Text>
          </>
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => exploreNav.admission(router, programmeId)}
          style={[styles.admissionCTA, { backgroundColor: colors.accentRole.action }]}
        >
          <Text style={[styles.admissionCTAText, CompassFonts.bodySemibold]}>
            View full admission insight
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default ProgrammeOverviewScreen;

const styles = StyleSheet.create({
  tabs: { marginTop: Spacing.md },

  // ── Overview ──────────────────────────────────────────────
  programmeMeta: { gap: Spacing.md },
  metaCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  metaLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  metaRows: { gap: Spacing.sm },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaKey: { fontSize: FontSize.sm },
  metaVal: { fontSize: FontSize.sm, textAlign: "right", flex: 1, marginLeft: Spacing.md },

  // JAMB variations
  jambNames: { gap: Spacing.sm },
  jambChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  jambChip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  jambChipText: { fontSize: FontSize.sm },

  // Provenance
  provenance: { gap: 4 },
  provenanceNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },

  // ── Requirements ──────────────────────────────────────────
  reqCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  reqHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  reqLabel: { fontSize: FontSize.sm },
  reqText: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },

  // ── Schools ───────────────────────────────────────────────
  schoolList: { gap: Spacing.sm },
  schoolGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  schoolCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flex: 1,
    minWidth: 200,
  },
  schoolIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  schoolInfo: { flex: 1, gap: 2 },
  schoolName: { fontSize: FontSize.sm },
  schoolMeta: { fontSize: FontSize.xs },
  schoolsMore: { fontSize: FontSize.sm, textAlign: "center" },

  // ── Employment (Track A) ──────────────────────────────────
  leadRow: { gap: Spacing.sm },
  lead: {
    fontSize: FontSize.md,
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
  howText: { fontSize: FontSize.sm },
  section: { gap: Spacing.sm },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  sectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.lg,
  },

  // ── Track B & C ───────────────────────────────────────────
  business: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "center",
  },
  businessEyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.9,
    marginTop: Spacing.xs,
  },
  businessTitle: {
    fontSize: FontSize.xl,
    textAlign: "center",
  },
  businessBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    textAlign: "center",
    maxWidth: 420,
  },
  admissionContent: { gap: Spacing.md, paddingHorizontal: Spacing.md },
  admissionLabel: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  admissionYear: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
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
  },
  admissionLink: { fontSize: FontSize.sm },
  admissionNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  admissionBody: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    textAlign: "center",
    maxWidth: 420,
  },

  // ── Desktop layout ────────────────────────────────────────
  desktopRow: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xxl,
  },
  navColumn: { width: 180, flexShrink: 0 },
  navSticky: {
    borderRightWidth: StyleSheet.hairlineWidth,
    paddingRight: Spacing.lg,
    gap: Spacing.xs,
  },
  navTitle: {
    fontSize: FontSize.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  navDot: { width: 6, height: 6, borderRadius: 3 },
  navLabel: { fontSize: FontSize.sm },
  mainScroll: { flex: 1 },
});
