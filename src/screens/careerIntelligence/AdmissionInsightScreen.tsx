/**
 * AdmissionInsightScreen — standalone screen for admission intelligence
 * (SS → University requirements, cycle data, and competitiveness context).
 *
 * Phase 10 redesign: editorial hero, mono equation formula block,
 * competitiveness bands (success/warning/danger washes), responsive
 * 2-column desktop layout with section nav, all legacy tokens migrated.
 */
import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, type Router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  DetailScaffold,
  DataSourceBadge,
  NotesWidget,
  SectionLabel,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { useResponsive } from "@/hooks/useResponsive";
import {
  type DataState,
  type ProgrammeSchoolCutoff,
  type SchoolAggregateFormula,
  type CourseCompetitiveness,
  type AdmissionSnapshotVersion,
  type NationalJambFloor,
  comingSoon,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  type ColorPalette,
} from "@/theme";

export interface AdmissionInsightScreenProps {
  programmeId?: string;
  schoolId?: string;
  domainId?: string;
  jambName?: string;
}

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "floor", label: "JAMB Floor" },
  { key: "formula", label: "Formula" },
  { key: "admission", label: "Schools & admission" },
  { key: "competitiveness", label: "Competitiveness" },
] as const;

const CHROME_OFFSET = 104;

function competitivenessBand(ratio: number): { color: string; soft: string; label: string } {
  if (ratio > 0.5) return { color: "", soft: "", label: "Low" };
  if (ratio > 0.25) return { color: "", soft: "", label: "Medium" };
  return { color: "", soft: "", label: "High" };
}

export function AdmissionInsightScreen({
  programmeId,
  schoolId,
  domainId,
  jambName,
}: AdmissionInsightScreenProps) {
  const { colors } = useTheme();
  const resp = useResponsive();
  const [snapshotState, setSnapshotState] = useState<
    DataState<AdmissionSnapshotVersion>
  >(() => comingSoon<AdmissionSnapshotVersion>("Snapshot version not yet loaded."));
  const [cutoffsState, setCutoffsState] = useState<DataState<ProgrammeSchoolCutoff[]>>(
    () => comingSoon<ProgrammeSchoolCutoff[]>("Admission rows not yet loaded."),
  );
  const [formulaState, setFormulaState] = useState<DataState<SchoolAggregateFormula | null>>(
    () => comingSoon<SchoolAggregateFormula | null>("Formula not yet loaded."),
  );
  const [competitivenessState, setCompetitivenessState] = useState<DataState<CourseCompetitiveness[]>>(
    () => comingSoon<CourseCompetitiveness[]>("Competitiveness not yet loaded."),
  );
  const [floorState, setFloorState] = useState<DataState<NationalJambFloor>>(
    () => comingSoon<NationalJambFloor>("JAMB floor not yet loaded."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [snapRes, floorRes] = await Promise.all([
          careerData.getAdmissionSnapshot(),
          careerData.getJambFloor(),
        ]);
        if (active) {
          setSnapshotState(snapRes);
          setFloorState(floorRes);
        }
      } catch {
        if (active) {
          setSnapshotState(comingSoon<AdmissionSnapshotVersion>("Snapshot unavailable."));
          setFloorState(comingSoon<NationalJambFloor>("JAMB floor unavailable."));
        }
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!programmeId && !schoolId) return;
    let active = true;
    (async () => {
      try {
        const year = snapshotState.data?.year;
        const res = await careerData.getCutoffs({ programmeId, schoolId, year });
        if (active) setCutoffsState(res);
      } catch {
        if (active) setCutoffsState(comingSoon<ProgrammeSchoolCutoff[]>("Admission rows unavailable."));
      }
    })();
    return () => { active = false; };
  }, [programmeId, schoolId, snapshotState.data?.year]);

  useEffect(() => {
    if (!schoolId) return;
    let active = true;
    (async () => {
      try {
        const year = snapshotState.data?.year;
        const res = await careerData.getSchoolFormula(schoolId, year);
        if (active) setFormulaState(res);
      } catch {
        if (active) setFormulaState(comingSoon<SchoolAggregateFormula | null>("Formula unavailable."));
      }
    })();
    return () => { active = false; };
  }, [schoolId, snapshotState.data?.year]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const year = snapshotState.data?.year;
        const res = await careerData.getCompetitiveness(year, jambName);
        if (active) setCompetitivenessState(res);
      } catch {
        if (active) setCompetitivenessState(comingSoon<CourseCompetitiveness[]>("Competitiveness unavailable."));
      }
    })();
    return () => { active = false; };
  }, [snapshotState.data?.year, jambName]);

  const year = snapshotState.data?.year ?? new Date().getFullYear();
  const activeLabel = snapshotState.data?.label ?? `${year}/${year + 1} Cycle — compiling`;

  const isDesktop = resp.isDesktop && resp.isWeb;

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

  const content = (
    <>
      {/* ── Overview: editorial hero ─────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("overview", e.nativeEvent.layout.y)} />
        <View style={[styles.heroCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <View style={styles.heroIconWrap}>
            <Feather name="bar-chart-2" size={28} color={colors.accentRole.action} />
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={[styles.heroEyebrow, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>
              {activeLabel}
            </Text>
            <Text style={[styles.heroTitle, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>
              Admission Intelligence
            </Text>
            <Text style={[styles.heroDesc, { color: colors.textRole.secondary }]}>
              Cycle-labelled requirements, universal JAMB floor where published, and competitiveness context compiled from
              JAMB, university admissions offices, and national datasets.
            </Text>
          </View>
          <DataSourceBadge
            verification={snapshotState.meta?.verification ?? "pending"}
            source={snapshotState.meta?.sources?.[0] ?? "JAMB · NUC · University admissions"}
            date={String(year)}
          />
        </View>
      </View>

      {/* ── National JAMB Floor ──────────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("floor", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>National JAMB floor</SectionLabel>
          <View style={[styles.floorCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            {floorState.status === "real" && floorState.data ? (
              <View style={styles.floorInner}>
                <Text style={[styles.floorScore, CompassFonts.data, { color: colors.accentRole.action }]}>
                  {floorState.data.floorScore}
                </Text>
                <View style={styles.floorMeta}>
                  <Text style={[styles.floorLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                    Minimum score
                  </Text>
                  <Text style={[styles.floorNote, { color: colors.textRole.secondary }]}>
                    {floorState.data.contextNote ?? "University minimum floor for this cycle"}
                  </Text>
                  <Text style={[styles.floorSource, { color: colors.textRole.muted }]}>
                    Source: {floorState.data.sourceUrl ?? "JAMB"}
                  </Text>
                </View>
              </View>
            ) : floorState.status === "fallback" ? (
              <View style={styles.floorInner}>
                <Text style={[styles.floorScore, CompassFonts.data, { color: colors.warning }]}>
                  —
                </Text>
                <View style={styles.floorMeta}>
                  <Text style={[styles.floorLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                    Floor unavailable
                  </Text>
                  <Text style={[styles.floorNote, { color: colors.textRole.secondary }]}>
                    Universal JAMB floor is not published in this dataset yet.
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.floorInner}>
                <Text style={[styles.floorScore, CompassFonts.data, { color: colors.textRole.muted }]}>
                  —
                </Text>
                <View style={styles.floorMeta}>
                  <Text style={[styles.floorLabel, { color: colors.textRole.muted }]}>
                    Loading floor score...
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* ── Aggregate Formula ────────────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("formula", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>Aggregate formula</SectionLabel>
          {formulaState.status === "real" && formulaState.data ? (
            <FormulaExplainCard formula={formulaState.data} colors={colors} />
          ) : formulaState.status === "fallback" ? (
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={{ color: colors.textRole.muted }}>
                No aggregate formula published for this school in {year}.
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={{ color: colors.textRole.muted }}>
                {schoolId
                  ? "Loading formula\u2026"
                  : "Pick a university to see how it weights JAMB and O\u2019level."}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Schools & admission ─────────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("admission", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>
            {programmeId
              ? "Schools & admission"
              : schoolId
              ? "Programme admission rows"
              : "Admission rows by programme and school"}
          </SectionLabel>
          {cutoffsState.status === "real" && cutoffsState.data?.length ? (
            <View style={resp.isDesktop ? styles.cutoffGrid : { gap: Spacing.sm }}>
              {cutoffsState.data.map((c) => (
                <CutoffCard key={c.id} cutoff={c} colors={colors} />
              ))}
            </View>
          ) : cutoffsState.status === "fallback" ? (
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={{ color: colors.textRole.muted }}>
                No admission rows for this selection in {year}.
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={{ color: colors.textRole.muted }}>
                {programmeId || schoolId
                  ? "Loading admission rows\u2026"
                  : "Pick a programme or university to see cut-offs for this cycle."}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── National Competitiveness ──────────────────────────── */}
      <View style={[styles.sectionBlock, { borderTopColor: colors.borderRole.subtle }]}>
        <View onLayout={(e) => onSectionLayout("competitiveness", e.nativeEvent.layout.y)} />
        <View style={{ gap: Spacing.sm }}>
          <SectionLabel>National competitiveness</SectionLabel>
          {competitivenessState.status === "real" && competitivenessState.data?.length ? (
            <View style={resp.isDesktop ? styles.compGrid : { gap: Spacing.sm }}>
              {competitivenessState.data.map((c) => (
                <CompetitivenessCard key={c.id} data={c} colors={colors} year={year} />
              ))}
            </View>
          ) : competitivenessState.status === "fallback" ? (
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={{ color: colors.textRole.muted }}>
                No competitiveness data for {year}.
              </Text>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={{ color: colors.textRole.muted }}>
                {competitivenessState.status === "real"
                  ? `No national competitiveness figures for this course in ${year}.`
                  : "Loading competitiveness\u2026"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <NotesWidget entityType="programme" entityId={programmeId ?? "admission"} />
    </>
  );

  if (isDesktop) {
    return (
      <DetailScaffold
        eyebrow="ADMISSION"
        title={jambName ? `${jambName} — Admission` : "Admission Intelligence"}
        pdf
        save={programmeId ? { entityType: "programme", entityId: programmeId } : undefined}
        state={snapshotState}
      >
        {() => (
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
        )}
      </DetailScaffold>
    );
  }

  return (
    <DetailScaffold
      eyebrow="ADMISSION"
      title={jambName ? `${jambName} — Admission` : "Admission Intelligence"}
      pdf
      save={programmeId ? { entityType: "programme", entityId: programmeId } : undefined}
      state={snapshotState}
    >
      {() => (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {content}
        </ScrollView>
      )}
    </DetailScaffold>
  );
}

/* ── Formula Explain Card ─────────────────────────────────── */

function FormulaExplainCard({
  formula,
  colors,
}: {
  formula: SchoolAggregateFormula;
  colors: ColorPalette;
}) {
  const jambPct = Math.round(formula.jambWeight * 100);
  const olevelPct = Math.round(formula.olevelWeight * 100);
  const total = jambPct + olevelPct;

  const schoolName = formula.schoolName ?? "this university";
  const equationParts: string[] = [];
  if (formula.jambWeight > 0) equationParts.push(`UTME/${Math.round(1 / formula.jambWeight)}`);
  if (formula.olevelWeight > 0) equationParts.push(`O'Level/${Math.round(1 / formula.olevelWeight)}`);
  const equation = equationParts.length
    ? `Aggregate = ${equationParts.join(" + ")}`
    : "";

  return (
    <View style={[styles.formulaCard, { backgroundColor: colors.surface.raised, borderColor: colors.accentRole.action + "30" }]}>
      <View style={[styles.formulaAccent, { backgroundColor: colors.accentRole.action }]} />
      <View style={styles.formulaBody}>
        <Text style={[styles.formulaHeading, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>
          How {schoolName} computes aggregate
        </Text>

        {equation ? (
          <View style={[styles.equationBlock, { backgroundColor: colors.surface.sunken, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.equationText, CompassFonts.data, { color: colors.textRole.primary }]}>
              {equation}
            </Text>
          </View>
        ) : null}

        <View style={styles.weightRow}>
          {formula.jambWeight > 0 && (
            <View style={[styles.weightPill, { backgroundColor: colors.accentSoft }]}>
              <Text style={[styles.weightPillLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                JAMB
              </Text>
              <Text style={[styles.weightPillValue, CompassFonts.data, { color: colors.accentRole.action }]}>
                {jambPct}%
              </Text>
            </View>
          )}
          {formula.olevelWeight > 0 && (
            <View style={[styles.weightPill, { backgroundColor: colors.successSoft }]}>
              <Text style={[styles.weightPillLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
                O&apos;Level
              </Text>
              <Text style={[styles.weightPillValue, CompassFonts.data, { color: colors.success }]}>
                {olevelPct}%
              </Text>
            </View>
          )}
        </View>

        {formula.description ? (
          <Text style={[styles.formulaDesc, { color: colors.textRole.secondary }]}>
            {formula.description}
          </Text>
        ) : null}

        <View style={styles.formulaFooter}>
          <Text style={[styles.formulaTotal, { color: colors.textRole.muted }, CompassFonts.data]}>
            Total: {total}%
          </Text>
          {formula.sourceUrl && (
            <Text style={[styles.formulaSource, { color: colors.textRole.muted }]}>
              Source: {formula.sourceUrl}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

/* ── CutoffCard ───────────────────────────────────────────── */

function CutoffCard({
  cutoff,
  colors,
}: {
  cutoff: ProgrammeSchoolCutoff;
  colors: ColorPalette;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <View style={styles.cutoffHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.cutoffSchool, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            {cutoff.schoolName}
          </Text>
          <Text style={[styles.cutoffProgramme, { color: colors.textRole.secondary }]}>
            {cutoff.programmeName}
          </Text>
        </View>
        <Text style={[styles.cutoffForm, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
          {cutoff.form === "UTME" ? "UTME" : "Direct Entry"}
        </Text>
      </View>

      <View style={styles.cutoffScores}>
        <View style={[styles.scorePill, { backgroundColor: colors.accentSoft }]}>
          <Text style={[styles.scoreLabel, { color: colors.textRole.muted }]}>
            Published cycle
          </Text>
          <Text style={[styles.scoreValue, CompassFonts.data, { color: colors.accentRole.action }]}>
            {cutoff.year}
          </Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: colors.infoSoft }]}>
          <Text style={[styles.scoreLabel, { color: colors.textRole.muted }]}>
            Score detail
          </Text>
          <Text style={[styles.scoreValue, CompassFonts.data, { color: colors.info }]}>
            Not shown
          </Text>
        </View>
      </View>

      <View style={styles.cutoffMeta}>
        <Text style={[styles.cutoffSource, { color: colors.textRole.muted }]}>
          Source: {cutoff.sourceUrl}
        </Text>
      </View>
    </View>
  );
}

/* ── CompetitivenessCard ───────────────────────────────────── */

function CompetitivenessCard({
  data,
  colors,
  year,
}: {
  data: CourseCompetitiveness;
  colors: ColorPalette;
  year: number;
}) {
  const ratio = data.ratio ?? 0;
  let bandColor: string;
  let bandSoft: string;
  let bandLabel: string;

  if (ratio > 0.5) {
    bandColor = colors.success;
    bandSoft = colors.successSoft;
    bandLabel = "Low competition";
  } else if (ratio > 0.25) {
    bandColor = colors.warning;
    bandSoft = colors.warningSoft;
    bandLabel = "Medium competition";
  } else {
    bandColor = colors.danger;
    bandSoft = colors.dangerSoft;
    bandLabel = "High competition";
  }

  return (
    <View style={[styles.compCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <View style={styles.compHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.compCourse, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            {data.broadCourse}
          </Text>
          <Text style={[styles.compYear, { color: colors.textRole.muted }]}>
            {year} · {bandLabel}
          </Text>
        </View>
        <View style={[styles.compBand, { backgroundColor: bandSoft, borderColor: bandColor }]}>
          <View style={[styles.compBandDot, { backgroundColor: bandColor }]} />
          <Text style={[styles.compBandLabel, { color: bandColor }, CompassFonts.bodyMedium]}>
            {bandLabel}
          </Text>
        </View>
      </View>

      {data.applied != null && data.admitted != null && (
        <View style={styles.compStats}>
          <View style={[styles.compStat, { backgroundColor: bandSoft }]}>
            <Text style={[styles.compStatValue, CompassFonts.data, { color: bandColor }]}>
              {data.applied.toLocaleString()}
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textRole.muted }]}>
              Applied
            </Text>
          </View>
          <View style={[styles.compStat, { backgroundColor: bandSoft }]}>
            <Text style={[styles.compStatValue, CompassFonts.data, { color: bandColor }]}>
              {data.admitted.toLocaleString()}
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textRole.muted }]}>
              Admitted
            </Text>
          </View>
          <View style={[styles.compStat, { backgroundColor: bandSoft }]}>
            <Text style={[styles.compStatValue, CompassFonts.data, { color: bandColor }]}>
              {Math.round(ratio * 10000) / 100}%
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textRole.muted }]}>
              Ratio
            </Text>
          </View>
        </View>
      )}

      {data.note && (
        <Text style={[styles.compNote, { color: colors.textRole.secondary }]}>
          {data.note}
        </Text>
      )}
      {data.source && (
        <Text style={[styles.cutoffSource, { color: colors.textRole.muted }]}>
          Source: {data.source}
        </Text>
      )}
    </View>
  );
}

export default AdmissionInsightScreen;

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { gap: Spacing.xl, paddingBottom: Spacing.xxl },
  sectionBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.lg,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },

  // ── Hero ──────────────────────────────────────────────────
  heroCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  heroTextBlock: { gap: 4 },
  heroEyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: FontSize.xxl,
  },
  heroDesc: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
    marginTop: 2,
  },

  // ── Floor ─────────────────────────────────────────────────
  floorCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
  },
  floorInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  floorScore: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.1,
    minWidth: 100,
  },
  floorMeta: { flex: 1, gap: 2 },
  floorLabel: { fontSize: FontSize.md },
  floorNote: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  floorSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },

  // ── Formula explain card ──────────────────────────────────
  formulaCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: "hidden",
    flexDirection: "row",
  },
  formulaAccent: {
    width: 4,
  },
  formulaBody: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  formulaHeading: {
    fontSize: FontSize.md,
  },
  equationBlock: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
  },
  equationText: {
    fontSize: FontSize.md,
    letterSpacing: 0.3,
  },
  weightRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  weightPill: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: 4,
  },
  weightPillLabel: {
    fontSize: FontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  weightPillValue: {
    fontSize: FontSize.lg,
  },
  formulaDesc: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  formulaFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formulaTotal: {
    fontSize: FontSize.xs,
  },
  formulaSource: {
    fontSize: FontSize.xs,
  },

  // ── Cut-offs ──────────────────────────────────────────────
  cutoffGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  cutoffHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cutoffSchool: { fontSize: FontSize.md },
  cutoffProgramme: { fontSize: FontSize.sm, marginTop: 2 },
  cutoffForm: { fontSize: FontSize.xs },
  cutoffScores: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  scorePill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 2,
    alignItems: "center",
  },
  scoreLabel: { fontSize: FontSize.xs },
  scoreValue: { fontSize: FontSize.sm },
  cutoffMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.sm,
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  cutoffSource: { fontSize: FontSize.xs },

  // ── Competitiveness ───────────────────────────────────────
  compGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  compCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minWidth: 280,
    flex: 1,
  },
  compHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  compCourse: { fontSize: FontSize.md },
  compYear: { fontSize: FontSize.xs, marginTop: 2 },
  compBand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  compBandDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compBandLabel: { fontSize: FontSize.xs },
  compStats: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  compStat: {
    flex: 1,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: 2,
    alignItems: "center",
  },
  compStatValue: { fontSize: FontSize.md },
  compStatLabel: { fontSize: FontSize.xs },
  compNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    marginTop: Spacing.sm,
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
