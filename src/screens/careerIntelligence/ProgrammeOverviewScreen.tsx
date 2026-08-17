/**
 * ProgrammeOverviewScreen — the student-facing view of a programme.
 *
 * Primary identifier: JAMB programme name (what the university calls it).
 * CCMAS stays in the background entirely: it is the substrate that resolves a
 * JAMB name to domains and roles, and is never shown as a programme fact.
 *
 * Sections:
 * 1. Hero — JAMB name, institution type, and what the degree teaches
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
  DataSourceBadge,
  DegreeSkills,
  SectionLabel,
  TextTabs,
  invalidateGuidancePathCache,
} from "@/components/careerIntelligence";
import {
  careerData,
  type JambProgrammeSchool,
  type JambProgrammeRequirements,
} from "@/lib/careerData";
import {
  sanitizeRequirementText,
  requirementFallbackText,
  type RequirementField,
} from "@/lib/sanitizeRequirementText";
import { useExploreNav } from "@/lib/exploreNav";
import { awardLine } from "@/lib/programmeAward";
import {
  comingSoon,
  type DataState,
  type DataMeta,
  type Programme,
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
] as const;

const CHROME_OFFSET = 104;

export function ProgrammeOverviewScreen({ programmeId }: ProgrammeOverviewScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const resp = useResponsive();
  const [tab, setTab] = useState<TrackTab>("employment");

  const [state, setState] = useState<DataState<Programme>>(() =>
    comingSoon<Programme>("Loading programme details..."),
  );
  const [admissionState, setAdmissionState] = useState<DataState<AdmissionInsight>>(
    () => comingSoon<AdmissionInsight>("Admission requirements are not available for this programme yet."),
  );
  const [jambSchools, setJambSchools] = useState<JambProgrammeSchool[]>([]);
  const [jambRequirements, setJambRequirements] =
    useState<JambProgrammeRequirements | null>(null);

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
    setJambRequirements(null);
    if (state.status !== "real" || !state.data) return;
    let active = true;
    (async () => {
      const result = await careerData.searchJambProgrammes(state.data!.name);
      if (active && result.status === "real" && result.data) {
        const firstJamb = result.data[0];
        if (firstJamb) {
          const [detailRes, schoolsRes] = await Promise.all([
            careerData.getJambProgramme(firstJamb.jambProgrammeId),
            careerData.getJambProgrammeSchools(firstJamb.jambProgrammeId),
          ]);
          if (active) {
            setJambRequirements(detailRes.data?.requirements ?? null);
          }
          if (active && schoolsRes.status === "real" && schoolsRes.data) {
            setJambSchools(schoolsRes.data);
          }
        }
      }
    })();
    return () => { active = false; };
  }, [state.status, state.data]);

  const programme = state.data;
  // The programme endpoint is the authoritative name source. Search results
  // are only used to find a JAMB requirements row; their first result must not
  // replace the mapped student-facing name.
  const jambName =
    programme?.studentName ??
    programme?.studentNames?.[0] ??
    programme?.name ??
    "Programme name unavailable";

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
      pdfPath="/api/student/report.html"
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
          jambSchools={jambSchools}
          jambRequirements={jambRequirements}
        />
      )}
    </DetailScaffold>
  );
}

/** Spec rule for requirement text: never blank, never garbled. Displayable
 *  text renders cleaned; anything else renders the field's fallback guidance. */
function requirementDisplay(
  field: RequirementField,
  text: string | null | undefined,
): string {
  const result = sanitizeRequirementText(text ?? null);
  return result.displayable ? result.cleaned : requirementFallbackText(field);
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
  jambSchools,
  jambRequirements,
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
  jambSchools: JambProgrammeSchool[];
  jambRequirements: JambProgrammeRequirements | null;
}) {
  const isDesktop = resp.isDesktop && resp.isWeb;

  // Keep hook order stable when the user changes tabs.
  const sectionY = useRef<Record<string, number>>({});
  const [activeSection, setActiveSection] = useState("overview");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [schoolSaving, setSchoolSaving] = useState<string | null>(null);
  const [schoolNotice, setSchoolNotice] = useState<string | null>(null);
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
  const studentProgrammeName =
    data.studentName ??
    data.studentNames?.[0] ??
    data.name ??
    "Programme name unavailable";
  const requirementCards = useMemo(
    () => [
      {
        field: "utme_subjects" as RequirementField,
        label: "UTME subject combination",
        icon: "edit-3" as const,
        iconColor: colors.accentRole.action,
        text: requirementDisplay("utme_subjects", jambRequirements?.utmeSubjects),
      },
      {
        field: "olevel_requirement" as RequirementField,
        label: "O-Level requirements",
        icon: "book" as const,
        iconColor: colors.accentRole.status,
        text: requirementDisplay(
          "olevel_requirement",
          jambRequirements?.olevelRequirement,
        ),
      },
      {
        field: "direct_entry" as RequirementField,
        label: "Direct Entry",
        icon: "log-in" as const,
        iconColor: colors.info,
        text: requirementDisplay("direct_entry", jambRequirements?.directEntry),
      },
    ],
    [jambRequirements, colors],
  );

  const chooseUniversity = useCallback(async (school: JambProgrammeSchool) => {
    if (schoolSaving) return;
    setSchoolSaving(school.schoolId);
    setSchoolNotice(null);
    try {
      const current = await careerData.getGuidancePath();
      const existingPath = current.status === "real" && current.data ? current.data.path : {};
      const saved = await careerData.saveGuidancePath({
        source: "explore",
        path: {
          ...existingPath,
          programme: {
            id: programmeId,
            name: school.studentName ?? school.jambName ?? studentProgrammeName,
            sourceName: school.jambName ?? studentProgrammeName,
          },
          university: { id: school.schoolId, name: school.schoolName },
          // A closed interface has no index signature, so it is not
          // structurally assignable to Record<string, unknown>. Widening
          // is sound here: every field is a known, serialisable property.
          requirements: (jambRequirements ?? {}) as Record<string, unknown>,
        },
      });
      if (saved.status === "real") {
        invalidateGuidancePathCache();
        setSelectedSchoolId(school.schoolId);
        setSchoolNotice("University selected for your guidance path.");
      } else {
        setSchoolNotice(saved.meta?.notice ?? "Create an account to save this guidance path.");
      }
    } catch {
      setSchoolNotice("Create an account to save this guidance path.");
    } finally {
      setSchoolSaving(null);
    }
  }, [jambRequirements, programmeId, schoolSaving, studentProgrammeName]);

  if (tab === "entrepreneurship") {
    return <TrackBEntrepreneurship colors={colors} router={router} programmeName={studentProgrammeName} programmeId={programmeId} />;
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
  // ── Employment (Track A) content ──────────────────────────────
  // Programme-level requirements (programme_subject_requirements via
  // GET /jamb-programmes/{id}). Each field is guarded so garbled or missing
  // brochure text renders guidance instead of blanks.
  const content = (
    <>
      {/* ── Overview: programme metadata ──────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("overview", e.nativeEvent.layout.y)} />
        <View style={styles.programmeMeta}>
          {/* The CCMAS details card used to sit here: standard name,
              qualification, duration, discipline. CCMAS is the substrate that
              maps a JAMB name to domains and roles — it is not a fact a
              student needs to read, and leading the page with it made the
              course they applied for look like an alias of something else.
              The heading is already the JAMB name their school uses; what
              belongs underneath is what the degree teaches.

              Qualification and duration survive as a single plain line — they
              are answers to real student questions ("is it a B.Sc?", "how many
              years?") and are not CCMAS vocabulary. */}
          {awardLine(studentProgrammeName, data.qualification, data.durationYears) ? (
            <Text style={[styles.awardLine, { color: colors.textRole.secondary }]}>
              {awardLine(studentProgrammeName, data.qualification, data.durationYears)}
            </Text>
          ) : null}

          {/* From the programme itself, not jambSuggestions[0]. The suggestion
              list is a name-search result — it is empty whenever the student
              arrived by any route other than typing a JAMB name, and it now
              carries only a 3-item preview. The programme endpoint resolves the
              full profile through programme_mapping. */}
          <DegreeSkills
            technical={data.skillsTechnical}
            transferable={data.skillsTransferable}
            total={data.skillsCount}
          />

          {/* JAMB name variations */}
          {jambSchools.length > 0 ? (
            <View style={styles.jambNames}>
              <Text style={[styles.metaLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                University offerings
              </Text>
              <Text style={[styles.provenanceNote, { color: colors.textRole.muted }]}>
                The university name tells you which programme name and requirements you are looking at.
              </Text>
              <View style={styles.jambChips}>
                {jambSchools.slice(0, 6).map((school) => (
                  <View key={`${school.schoolId}-${school.jambProgrammeId ?? "offering"}`} style={[styles.jambChip, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                    <Text style={[styles.jambChipText, { color: colors.textRole.secondary }]} numberOfLines={2}>{school.schoolName}: {school.studentName ?? school.jambName}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

        </View>
      </View>

      {/* ── Entry requirements ────────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("requirements", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Entry requirements</SectionLabel>
          {jambRequirements?.variesByInstitution ? (
            <Text style={[styles.reqVariesNote, { color: colors.textRole.muted }]}>
              Requirements for this programme vary by institution — confirm the
              exact combination with your chosen school.
            </Text>
          ) : null}
          {requirementCards.map((card) => (
            <View
              key={card.field}
              style={[styles.reqCard, { borderColor: colors.borderRole.subtle }]}
            >
              <View style={styles.reqHeader}>
                <Feather name={card.icon} size={14} color={card.iconColor} />
                <Text style={[styles.reqLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                  {card.label}
                </Text>
              </View>
              <Text style={[styles.reqText, { color: colors.textRole.secondary }]}>
                {card.text}
              </Text>
            </View>
          ))}
          <DataSourceBadge
            verification="inferred"
            source="JAMB brochure"
            style={{ alignSelf: "flex-start" }}
          />
        </View>
      </View>

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
                        {s.form === "UTME" ? "UTME" : "Direct Entry"} - cycle details only where published
                      </Text>
                    ) : null}
                    {s.studentName || s.jambName ? (
                      <Text style={[styles.schoolMeta, { color: colors.textRole.secondary }]} numberOfLines={2}>
                        Programme name: {s.studentName ?? s.jambName}
                      </Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => void chooseUniversity(s)}
                    disabled={schoolSaving !== null}
                    style={[styles.schoolAction, { borderColor: selectedSchoolId === s.schoolId ? colors.accentRole.success : colors.borderRole.subtle }]}>
                    <Text style={[styles.schoolActionText, { color: selectedSchoolId === s.schoolId ? colors.accentRole.success : colors.textRole.primary }]}>
                      {schoolSaving === s.schoolId ? "Saving..." : selectedSchoolId === s.schoolId ? "Selected" : "Use this university"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            {schoolNotice ? <Text style={[styles.schoolsMore, { color: colors.textRole.muted }]}>{schoolNotice}</Text> : null}
            {jambSchools.length > 8 ? (
              <Text style={[styles.schoolsMore, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
                +{jambSchools.length - 8} more schools
              </Text>
            ) : null}
          </View>
        </View>
      )}

      {/* ── Career domains ────────────────────────────────── */}
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

function TrackBEntrepreneurship({ colors, router, programmeName, programmeId }: { colors: ColorPalette; router: Router; programmeName: string; programmeId: string }) {
  const exploreNav = useExploreNav();
  return (
    <View style={[styles.business, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.businessEyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
        ENTREPRENEURSHIP · TRACK B
      </Text>
      <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
        Build from this programme
      </Text>
      <Text style={[styles.businessBody, { color: colors.textRole.secondary }]}>
          Employment is one path. Build maps entrepreneurial roles, venture modes, capability requirements, and evidence for this programme.
      </Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => exploreNav.entrepreneurship(router, {
          // The prop, not ProgrammeBody's local: studentProgrammeName is out of
          // scope here. The call site already passes the same value in.
          programmeName,
          domainId: programmeId,
        })}
        style={[styles.admissionCTA, { backgroundColor: colors.accentRole.action }]}
      >
        <Text style={[styles.admissionCTAText, CompassFonts.bodySemibold]}>
          Open Build in Pathways
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
  const exploreNav = useExploreNav();
  return (
    <View style={[styles.business, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.businessEyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
        ADMISSION · TRACK C
      </Text>
      <View style={styles.admissionContent}>
        {admissionState.status === "real" && admissionState.data ? (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
              Schools & admission ({admissionState.data.year})
            </Text>
            <Text style={[styles.admissionLabel, { color: colors.textRole.secondary }]}>
              {admissionState.data.label}
            </Text>
            <Text style={[styles.admissionLabel, { color: colors.textRole.muted }]}>
              {admissionState.data.programmeCount} programme admission row(s) in the dataset
            </Text>
            <Text style={[styles.admissionNote, { color: colors.textRole.muted }]}>
              Use this with the published JAMB cycle and the university&apos;s current admission notice.
            </Text>
          </>
        ) : admissionState.status === "fallback" ? (
          <>
            <Text style={[styles.businessTitle, { color: colors.textRole.primary }, CompassFonts.displaySemi]}>
              Admission data unavailable
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
              Annual admission-cycle requirements, universal JAMB floor where published, and national competitiveness context appear here once compiled.
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
  awardLine: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  metaLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

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
  reqVariesNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
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
  schoolAction: {
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  schoolActionText: { fontSize: FontSize.xs, fontWeight: "700" },
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
