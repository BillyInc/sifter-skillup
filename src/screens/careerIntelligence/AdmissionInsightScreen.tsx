/**
 * AdmissionInsightScreen — standalone screen for admission intelligence
 * (SS → University cut-offs, formulas, competitiveness).
 * Reachable from ProgrammeOverviewScreen Admission tab, DomainDetailScreen,
 * and JAMB-name → domains flow.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, type Router } from "expo-router";
import {
  DetailScaffold,
  DataSourceBadge,
  NotesWidget,
  SectionLabel,
} from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import {
  type DataState,
  type ProgrammeSchoolCutoff,
  type SchoolAggregateFormula,
  type CourseCompetitiveness,
  type AdmissionSnapshotVersion,
  comingSoon,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  type ColorPalette,
} from "@/theme";

export interface AdmissionInsightScreenProps {
  programmeId?: string;
  schoolId?: string;
  domainId?: string;
  /** Course / JAMB name when reached from the Explore "what, not where" door. */
  jambName?: string;
}

export function AdmissionInsightScreen({
  programmeId,
  schoolId,
  domainId,
  jambName,
}: AdmissionInsightScreenProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const [snapshotState, setSnapshotState] = useState<
    DataState<AdmissionSnapshotVersion>
  >(() => comingSoon<AdmissionSnapshotVersion>("Snapshot version not yet loaded."));
  const [cutoffsState, setCutoffsState] = useState<DataState<ProgrammeSchoolCutoff[]>>(
    () => comingSoon<ProgrammeSchoolCutoff[]>("Cut-offs not yet loaded."),
  );
  const [formulaState, setFormulaState] = useState<DataState<SchoolAggregateFormula | null>>(
    () => comingSoon<SchoolAggregateFormula | null>("Formula not yet loaded."),
  );
  const [competitivenessState, setCompetitivenessState] = useState<DataState<CourseCompetitiveness[]>>(
    () => comingSoon<CourseCompetitiveness[]>("Competitiveness not yet loaded."),
  );
  const [floorState, setFloorState] = useState<DataState<any>>(
    () => comingSoon<any>("JAMB floor not yet loaded."),
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
          setFloorState(comingSoon<any>("JAMB floor unavailable."));
        }
      }
    })();
    return () => {
      active = false;
    };
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
        if (active) setCutoffsState(comingSoon<ProgrammeSchoolCutoff[]>("Cut-offs unavailable."));
      }
    })();
    return () => {
      active = false;
    };
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
    return () => {
      active = false;
    };
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
    return () => {
      active = false;
    };
  }, [snapshotState.data?.year, jambName]);

  const year = snapshotState.data?.year ?? new Date().getFullYear();
  const activeLabel = snapshotState.data?.label ?? `${year}/${year + 1} Cycle — compiling`;

  return (
    <DetailScaffold
      eyebrow="ADMISSION"
      title={jambName ? `${jambName} — Admission` : "Admission Intelligence"}
      pdf
      save={programmeId ? { entityType: "programme", entityId: programmeId } : undefined}
      state={snapshotState}
    >
      {(data) => (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Snapshot banner */}
          <View
            style={[
              styles.banner,
              { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
            ]}
          >
            <Text style={[styles.bannerLabel, { color: colors.textRole.primary }]}>
              {activeLabel}
            </Text>
            <DataSourceBadge
              verification={data?.meta?.verification ?? "pending"}
              source={data?.meta?.sources?.[0] ?? "Manual annual compile"}
            />
          </View>

          {/* National JAMB Floor */}
          <View style={styles.section}>
            <SectionLabel>National JAMB floor</SectionLabel>
            <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              {floorState.status === "real" && floorState.data ? (
                <View>
                  <Text style={[styles.floorScore, CompassFonts.data, { color: colors.textRole.primary }]}>
                    {floorState.data.floorScore}
                  </Text>
                  <Text style={[styles.floorNote, { color: colors.textRole.secondary }]}>
                    {floorState.data.contextNote ?? "University minimum floor"}
                  </Text>
                  <Text style={[styles.floorSource, { color: colors.textRole.muted }]}>
                    Source: {floorState.data.sourceUrl ?? "JAMB"}
                  </Text>
                </View>
              ) : floorState.status === "fallback" ? (
                <Text style={[styles.floorScore, CompassFonts.data, { color: colors.warning }]}>
                  ~150 (indicative)
                </Text>
              ) : (
                <Text style={{ color: colors.textRole.muted }}>Loading floor score...</Text>
              )}
            </View>
          </View>

          {/* Cut-offs */}
          <View style={styles.section}>
            <SectionLabel>
              {
                programmeId
                  ? "This Programme's Cut-offs"
                  : schoolId
                  ? "This School's Cut-offs"
                  : "Cut-offs (select a programme or school)"
              }
            </SectionLabel>
            {cutoffsState.status === "real" && cutoffsState.data?.length ? (
              <View style={{ gap: Spacing.sm }}>
                {cutoffsState.data.map((c) => (
                  <CutoffCard key={c.id} cutoff={c} colors={colors} />
                ))}
              </View>
            ) : cutoffsState.status === "fallback" ? (
              <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <Text style={{ color: colors.textRole.muted }}>
                  No cut-off data for this selection in {year}.
                </Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <Text style={{ color: colors.textRole.muted }}>Loading cut-offs...</Text>
              </View>
            )}
          </View>

          {/* School Aggregate Formula */}
          <View style={styles.section}>
            <SectionLabel>Aggregate formula</SectionLabel>
            {formulaState.status === "real" && formulaState.data ? (
              <FormulaCard formula={formulaState.data} colors={colors} />
            ) : formulaState.status === "fallback" ? (
              <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <Text style={{ color: colors.textRole.muted }}>
                  No aggregate formula published for this school in {year}.
                </Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
                <Text style={{ color: colors.textRole.muted }}>Loading formula...</Text>
              </View>
            )}
          </View>

          {/* National Competitiveness */}
          <View style={styles.section}>
            <SectionLabel>National competitiveness</SectionLabel>
            {competitivenessState.status === "real" &&
            competitivenessState.data?.length ? (
              <View style={{ gap: Spacing.sm }}>
                {competitivenessState.data.map((c) => (
                  <CompetitivenessCard
                    key={c.id}
                    data={c}
                    colors={colors}
                    year={year}
                  />
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
                <Text style={{ color: colors.textRole.muted }}>Loading competitiveness...</Text>
              </View>
            )}
          </View>

          <NotesWidget
            entityType="programme"
            entityId={programmeId ?? "admission"}
          />
        </ScrollView>
      )}
    </DetailScaffold>
  );
}

function CutoffCard({
  cutoff,
  colors,
}: {
  cutoff: ProgrammeSchoolCutoff;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
      hitSlop={8}
    >
      <View style={styles.cutoffHeader}>
        <Text style={[styles.cutoffSchool, { color: colors.textRole.primary }]}>
          {cutoff.schoolName}
        </Text>
        <Text style={[styles.cutoffForm, { color: colors.textRole.muted }]}>
          {cutoff.form}
        </Text>
      </View>
      <Text style={[styles.cutoffProgramme, { color: colors.textRole.secondary }]}>
        {cutoff.programmeName}
      </Text>
      <View style={styles.cutoffScores}>
        {cutoff.aggregateCutoff != null && (
          <View style={styles.scorePill}>
            <Text style={[styles.scoreLabel, { color: colors.textRole.muted }]}>
              Aggregate
            </Text>
            <Text style={[styles.scoreValue, CompassFonts.data, { color: colors.textRole.primary }]}>
              {cutoff.aggregateCutoff}
            </Text>
          </View>
        )}
        {cutoff.jambCutoff != null && (
          <View style={styles.scorePill}>
            <Text style={[styles.scoreLabel, { color: colors.textRole.muted }]}>
              JAMB
            </Text>
            <Text style={[styles.scoreValue, CompassFonts.data, { color: colors.textRole.primary }]}>
              {cutoff.jambCutoff}
            </Text>
          </View>
        )}
        {cutoff.postUtmeCutoff != null && (
          <View style={styles.scorePill}>
            <Text style={[styles.scoreLabel, { color: colors.textRole.muted }]}>
              Post-UTME
            </Text>
            <Text style={[styles.scoreValue, CompassFonts.data, { color: colors.textRole.primary }]}>
              {cutoff.postUtmeCutoff}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.cutoffSource, { color: colors.textRole.muted }]}>
        Source: {cutoff.sourceUrl}
      </Text>
    </TouchableOpacity>
  );
}

function FormulaCard({
  formula,
  colors,
}: {
  formula: SchoolAggregateFormula;
  colors: ColorPalette;
}) {
  const total = formula.jambWeight + formula.postUtmeWeight + formula.olevelWeight;
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <View style={styles.formulaRow}>
        <FormulaPill label="JAMB" weight={formula.jambWeight} colors={colors} />
        <FormulaPill label="Post-UTME" weight={formula.postUtmeWeight} colors={colors} />
        <FormulaPill label="O'level" weight={formula.olevelWeight} colors={colors} />
      </View>
      {formula.description && (
        <Text style={[styles.formulaDesc, { color: colors.textRole.secondary }]}>
          {formula.description}
        </Text>
      )}
      <Text style={[styles.formulaTotal, { color: colors.textRole.muted }]}>
        Total: {Math.round(total * 100)}%
      </Text>
      {formula.sourceUrl && (
        <Text style={[styles.formulaSource, { color: colors.textRole.muted }]}>
          Source: {formula.sourceUrl}
        </Text>
      )}
    </View>
  );
}

function FormulaPill({
  label,
  weight,
  colors,
}: {
  label: string;
  weight: number;
  colors: ColorPalette;
}) {
  const pct = Math.round(weight * 100);
  return (
    <View style={styles.formulaPill}>
      <Text style={[styles.formulaPillLabel, { color: colors.textRole.muted }]}>
        {label}
      </Text>
      <Text style={[styles.formulaPillValue, CompassFonts.data, { color: colors.textRole.primary }]}>
        {pct}%
      </Text>
    </View>
  );
}

function CompetitivenessCard({
  data,
  colors,
  year,
}: {
  data: CourseCompetitiveness;
  colors: ColorPalette;
  year: number;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <View style={styles.compHeader}>
        <Text style={[styles.compCourse, { color: colors.textRole.primary }]}>
          {data.broadCourse}
        </Text>
        <Text style={[styles.compYear, { color: colors.textRole.muted }]}>
          {year}
        </Text>
      </View>
      {data.applied != null && data.admitted != null && (
        <View style={styles.compStats}>
          <View style={styles.compStat}>
            <Text style={[styles.compStatValue, CompassFonts.data, { color: colors.textRole.primary }]}>
              {data.applied.toLocaleString()}
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textRole.muted }]}>
              Applied
            </Text>
          </View>
          <View style={styles.compStat}>
            <Text style={[styles.compStatValue, CompassFonts.data, { color: colors.textRole.primary }]}>
              {data.admitted.toLocaleString()}
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textRole.muted }]}>
              Admitted
            </Text>
          </View>
          {data.ratio != null && (
            <View style={styles.compStat}>
              <Text style={[styles.compStatValue, CompassFonts.data, { color: colors.accentRole.action }]}>
                {Math.round(data.ratio * 10000) / 100}%
              </Text>
              <Text style={[styles.compStatLabel, { color: colors.textRole.muted }]}>
                Ratio
              </Text>
            </View>
          )}
        </View>
      )}
      {data.note && (
        <Text style={[styles.compNote, { color: colors.textRole.secondary }]}>
          {data.note}
        </Text>
      )}
      {data.source && (
        <Text style={[styles.compSource, { color: colors.textRole.muted }]}>
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
  banner: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  bannerLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  section: { gap: Spacing.sm },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  floorScore: { fontSize: FontSize.xxxl, fontWeight: FontWeight.semibold },
  floorNote: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  floorSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  cutoffHeader: { flexDirection: "row", justifyContent: "space-between" },
  cutoffSchool: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  cutoffForm: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  cutoffProgramme: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  cutoffScores: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  scorePill: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  scoreLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  scoreValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  cutoffSource: { fontSize: FontSize.xs, marginTop: Spacing.sm },
  formulaRow: { flexDirection: "row", gap: Spacing.sm },
  formulaPill: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: 2,
  },
  formulaPillLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  formulaPillValue: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  formulaDesc: { fontSize: FontSize.sm, marginTop: Spacing.sm },
  formulaTotal: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  formulaSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  compHeader: { flexDirection: "row", justifyContent: "space-between" },
  compCourse: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  compYear: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  compStats: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm },
  compStat: { flex: 1 },
  compStatValue: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  compStatLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  compNote: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  compSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },
});

