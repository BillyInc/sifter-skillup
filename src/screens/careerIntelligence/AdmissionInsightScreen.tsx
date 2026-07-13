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
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
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
  Brand,
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
          <View style={[styles.banner, { backgroundColor: colors.card }]}>
            <Text style={[styles.bannerLabel, { color: colors.text }]}>
              {activeLabel}
            </Text>
            <DataSourceBadge
              verification={data?.meta?.verification ?? "pending"}
              source={data?.meta?.sources?.[0] ?? "Manual annual compile"}
            />
          </View>

          {/* National JAMB Floor */}
          <View style={styles.section}>
            <SectionHeader title="National JAMB Floor" />
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              {floorState.status === "real" && floorState.data ? (
                <View>
                  <Text style={[styles.floorScore, { color: colors.text }]}>
                    {floorState.data.floorScore}
                  </Text>
                  <Text style={[styles.floorNote, { color: colors.textMuted }]}>
                    {floorState.data.contextNote ?? "University minimum floor"}
                  </Text>
                  <Text style={[styles.floorSource, { color: colors.textMuted }]}>
                    Source: {floorState.data.sourceUrl ?? "JAMB"}
                  </Text>
                </View>
              ) : floorState.status === "fallback" ? (
                <Text style={[styles.floorScore, { color: Brand.warning }]}>
                  ~150 (indicative)
                </Text>
              ) : (
                <Text style={{ color: colors.textMuted }}>Loading floor score…</Text>
              )}
            </View>
          </View>

          {/* Cut-offs */}
          <View style={styles.section}>
            <SectionHeader
              title={
                programmeId
                  ? "This Programme's Cut-offs"
                  : schoolId
                  ? "This School's Cut-offs"
                  : "Cut-offs (select a programme or school)"
              }
            />
            {cutoffsState.status === "real" && cutoffsState.data?.length ? (
              <View style={{ gap: Spacing.sm }}>
                {cutoffsState.data.map((c) => (
                  <CutoffCard key={c.id} cutoff={c} colors={colors} />
                ))}
              </View>
            ) : cutoffsState.status === "fallback" ? (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textMuted }}>
                  No cut-off data for this selection in {year}.
                </Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textMuted }}>Loading cut-offs…</Text>
              </View>
            )}
          </View>

          {/* School Aggregate Formula */}
          <View style={styles.section}>
            <SectionHeader title="How This School Calculates Aggregate" />
            {formulaState.status === "real" && formulaState.data ? (
              <FormulaCard formula={formulaState.data} colors={colors} />
            ) : formulaState.status === "fallback" ? (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textMuted }}>
                  No aggregate formula published for this school in {year}.
                </Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textMuted }}>Loading formula…</Text>
              </View>
            )}
          </View>

          {/* National Competitiveness */}
          <View style={styles.section}>
            <SectionHeader title="National Competitiveness (Broad Course)" />
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
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textMuted }}>
                  No competitiveness data for {year}.
                </Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={{ color: colors.textMuted }}>Loading competitiveness…</Text>
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
      style={[styles.card, { backgroundColor: colors.card }]}
      hitSlop={8}
    >
      <View style={styles.cutoffHeader}>
        <Text style={[styles.cutoffSchool, { color: colors.text }]}>
          {cutoff.schoolName}
        </Text>
        <Text style={[styles.cutoffForm, { color: colors.textMuted }]}>
          {cutoff.form}
        </Text>
      </View>
      <Text style={[styles.cutoffProgramme, { color: colors.textSoft }]}>
        {cutoff.programmeName}
      </Text>
      <View style={styles.cutoffScores}>
        {cutoff.aggregateCutoff != null && (
          <View style={styles.scorePill}>
            <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
              Aggregate
            </Text>
            <Text style={[styles.scoreValue, { color: colors.text }]}>
              {cutoff.aggregateCutoff}
            </Text>
          </View>
        )}
        {cutoff.jambCutoff != null && (
          <View style={styles.scorePill}>
            <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
              JAMB
            </Text>
            <Text style={[styles.scoreValue, { color: colors.text }]}>
              {cutoff.jambCutoff}
            </Text>
          </View>
        )}
        {cutoff.postUtmeCutoff != null && (
          <View style={styles.scorePill}>
            <Text style={[styles.scoreLabel, { color: colors.textMuted }]}>
              Post-UTME
            </Text>
            <Text style={[styles.scoreValue, { color: colors.text }]}>
              {cutoff.postUtmeCutoff}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.cutoffSource, { color: colors.textMuted }]}>
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
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.formulaRow}>
        <FormulaPill label="JAMB" weight={formula.jambWeight} colors={colors} />
        <FormulaPill label="Post-UTME" weight={formula.postUtmeWeight} colors={colors} />
        <FormulaPill label="O'level" weight={formula.olevelWeight} colors={colors} />
      </View>
      {formula.description && (
        <Text style={[styles.formulaDesc, { color: colors.textMuted }]}>
          {formula.description}
        </Text>
      )}
      <Text style={[styles.formulaTotal, { color: colors.textMuted }]}>
        Total: {Math.round(total * 100)}%
      </Text>
      {formula.sourceUrl && (
        <Text style={[styles.formulaSource, { color: colors.textMuted }]}>
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
      <Text style={[styles.formulaPillLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.formulaPillValue, { color: colors.text }]}>
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
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.compHeader}>
        <Text style={[styles.compCourse, { color: colors.text }]}>
          {data.broadCourse}
        </Text>
        <Text style={[styles.compYear, { color: colors.textMuted }]}>
          {year}
        </Text>
      </View>
      {data.applied != null && data.admitted != null && (
        <View style={styles.compStats}>
          <View style={styles.compStat}>
            <Text style={[styles.compStatValue, { color: colors.text }]}>
              {data.applied.toLocaleString()}
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textMuted }]}>
              Applied
            </Text>
          </View>
          <View style={styles.compStat}>
            <Text style={[styles.compStatValue, { color: colors.text }]}>
              {data.admitted.toLocaleString()}
            </Text>
            <Text style={[styles.compStatLabel, { color: colors.textMuted }]}>
              Admitted
            </Text>
          </View>
          {data.ratio != null && (
            <View style={styles.compStat}>
              <Text style={[styles.compStatValue, { color: Brand.primaryDeep }]}>
                {Math.round(data.ratio * 10000) / 100}%
              </Text>
              <Text style={[styles.compStatLabel, { color: colors.textMuted }]}>
                Ratio
              </Text>
            </View>
          )}
        </View>
      )}
      {data.note && (
        <Text style={[styles.compNote, { color: colors.textMuted }]}>
          {data.note}
        </Text>
      )}
      {data.source && (
        <Text style={[styles.compSource, { color: colors.textMuted }]}>
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  bannerLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  section: { gap: Spacing.sm },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  floorScore: { fontSize: FontSize.xxxl, fontWeight: FontWeight.black },
  floorNote: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  floorSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  cutoffHeader: { flexDirection: "row", justifyContent: "space-between" },
  cutoffSchool: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cutoffForm: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  cutoffProgramme: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  cutoffScores: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  scorePill: {
    backgroundColor: Brand.primarySoft,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: 2,
  },
  scoreLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  scoreValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  cutoffSource: { fontSize: FontSize.xs, marginTop: Spacing.sm },
  formulaRow: { flexDirection: "row", gap: Spacing.sm },
  formulaPill: {
    flex: 1,
    backgroundColor: Brand.primarySoft,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: "center",
    gap: 2,
  },
  formulaPillLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  formulaPillValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  formulaDesc: { fontSize: FontSize.sm, marginTop: Spacing.sm },
  formulaTotal: { fontSize: FontSize.sm, marginTop: Spacing.xs },
  formulaSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  compHeader: { flexDirection: "row", justifyContent: "space-between" },
  compCourse: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  compYear: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  compStats: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm },
  compStat: { flex: 1 },
  compStatValue: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  compStatLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  compNote: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  compSource: { fontSize: FontSize.xs, marginTop: Spacing.xs },
});

