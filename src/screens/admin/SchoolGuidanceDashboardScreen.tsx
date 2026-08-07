/**
 * SchoolGuidanceDashboardScreen — the educator home for secondary schools,
 * tutorial centres and JAMB cafés (spec §6.0 / §6.1; bug §7.10).
 *
 * §7.10: this screen previously rendered hardcoded `CARDS` and `PATHWAY_ROWS`
 * arrays and never called adminData, so every school saw identical static
 * content regardless of its data. Those arrays are gone. Every number now
 * comes out of an adminData {@link DataState} envelope and is branched through
 * <ComingSoonPanel> / <StatCard> — an unpopulated area renders an honest empty
 * state, never an invented figure.
 *
 * §6 boundary — educators get NO national institution leaderboard, NO peer
 * comparison and NO Domain Reach Audit: a secondary school has no programme
 * mix of its own to audit or benchmark. Those surfaces are university-only
 * (§0.6) and are deliberately absent here. Learner data is aggregate-only.
 *
 * Sections, per §6.0:
 *   - Header: school name, school type, admin role
 *   - Learner counts (aggregate) + domains represented
 *   - Intelligence alerts
 *   - Two panels side by side (stacking narrow): Guidance workflow, and
 *     Guidance market intelligence with [View all →]
 *   - Your learners' interests (aggregate, no PII) with [Open Learners →]
 */
import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  CompassFonts,
  FontSize,
  Radius,
  Spacing,
  useTheme,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { adminNav, type Nav } from "@/lib/adminNav";
import { getEducatorProfile } from "@/lib/educatorProfile";
import type { DataState } from "../../types/career";
import type {
  EducatorProfile,
  InstitutionSummary,
  IntelligenceAlert,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { StatCard } from "./StatCard";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { IntelligenceAlerts } from "./IntelligenceAlerts";

/**
 * Field-level view of the `getStudentIntelligenceSummary()` payload. Its
 * canonical type (`StudentIntelligenceSummary`) is referenced by adminData.ts
 * but does not yet exist in src/types/institution.ts, which this screen does
 * not own. Every field is optional and read defensively, so nothing renders
 * unless the payload carries it.
 *
 * TODO(types): import the canonical `StudentIntelligenceSummary` once it lands
 * in src/types/institution.ts and delete this local shape.
 */
interface LearnerDomainShareView {
  domainId?: string;
  domainName?: string;
  pct?: number;
  /** Points above/below the national learner mix, when computed (§6.0). */
  vsNationalPts?: number;
}

interface LearnerIntelligenceView {
  totalAffiliated?: number;
  selfSignedUp?: number;
  provisioned?: number;
  unclaimedProvisioned?: number;
  domainsRepresented?: number;
  topDomains?: LearnerDomainShareView[];
}

/** The workflow steps are static copy, not data — §6.0's numbered guidance. */
const WORKFLOW_STEPS: readonly string[] = [
  "Pick a domain with the student.",
  "Compare universities that offer programmes feeding it.",
  "Shortlist roles and check their demand signal.",
];

function loadingState<T>(): DataState<T> {
  return { status: "pending", data: null };
}

function view<T>(data: unknown): T {
  return (data ?? {}) as T;
}

const fmtInt = (n?: number) => (n == null ? "—" : n.toLocaleString());
const fmtPct = (n?: number) => (n == null ? "—" : `${Math.round(n)}%`);

export function SchoolGuidanceDashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [summary, setSummary] =
    useState<DataState<InstitutionSummary>>(loadingState);
  const [alerts, setAlerts] =
    useState<DataState<IntelligenceAlert[]>>(loadingState);
  const [learners, setLearners] = useState<DataState<unknown>>(loadingState);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, []);

  // Aggregate reads only — educators never receive individual learner rows.
  useEffect(() => {
    let active = true;
    (async () => {
      const [s, a, li] = await Promise.all([
        adminData.getInstitutionSummary(),
        adminData.getIntelligenceAlerts(),
        adminData.getStudentIntelligenceSummary(),
      ]);
      if (!active) return;
      setSummary(s);
      setAlerts(a);
      setLearners(li as DataState<unknown>);
    })();
    return () => {
      active = false;
    };
  }, []);

  const providerOnly = Boolean(profile?.providerSessionOnly);
  const learnerNoun = providerOnly ? "Sessions" : "Learners";
  const title = providerOnly ? "Guidance sessions" : "General dashboard";
  const orgName =
    (summary.status === "real" ? summary.data?.institutionName : null) ||
    profile?.organizationName ||
    "Your organisation";

  const learnerState: DataState<unknown> = learners;

  return (
    <AdminShell title={title} eyebrow={orgName}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header: school name · school type · role ── */}
        <View style={styles.header}>
          <Text
            style={[
              styles.headerTitle,
              CompassFonts.displayBold,
              { color: colors.text },
            ]}
            numberOfLines={2}
          >
            {orgName}
          </Text>
          <Text
            style={[
              styles.headerMeta,
              CompassFonts.bodySemibold,
              { color: colors.textMuted },
            ]}
          >
            {[
              profile?.organizationType?.replace(/_/g, " "),
              profile?.role ? `Admin: ${profile.role}` : null,
            ]
              .filter(Boolean)
              .join("  ·  ")}
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Programme and career advisory for your learners: which JAMB
            programmes have real Nigerian demand, and which universities offer
            them. Aggregate only — you never see an individual learner's
            choices unless they explicitly link their account.
          </Text>
        </View>

        {/* ── Aggregate learner stats ── */}
        <View style={styles.stats}>
          <StatCard
            icon="👥"
            label={providerOnly ? "Session learners" : "Learners"}
            state={learnerState}
            select={(d) => fmtInt(view<LearnerIntelligenceView>(d).totalAffiliated)}
            selectDelta={(d) => {
              const v = view<LearnerIntelligenceView>(d);
              return v.selfSignedUp != null || v.provisioned != null
                ? `${fmtInt(v.selfSignedUp)} self · ${fmtInt(v.provisioned)} you added`
                : undefined;
            }}
            deltaPositive={() => true}
          />
          <StatCard
            icon="🎟️"
            label="Unclaimed codes"
            state={learnerState}
            select={(d) =>
              fmtInt(view<LearnerIntelligenceView>(d).unclaimedProvisioned)
            }
          />
          <StatCard
            icon="🧭"
            label="Domains represented"
            state={learnerState}
            select={(d) =>
              fmtInt(view<LearnerIntelligenceView>(d).domainsRepresented)
            }
          />
          <StatCard
            icon="📊"
            label="NG postings / month"
            state={summary}
            select={(d) => fmtInt(d.ngPostingsPerMonth)}
            selectDelta={(d) =>
              d.ngPostingsYoyPct != null
                ? `${d.ngPostingsYoyPct >= 0 ? "+" : ""}${Math.round(
                    d.ngPostingsYoyPct,
                  )}% YoY`
                : undefined
            }
            deltaPositive={(d) => (d.ngPostingsYoyPct ?? 0) >= 0}
          />
        </View>

        {summary.status === "real" && summary.data?.dataAsOf ? (
          <Text
            style={[
              styles.dataNote,
              CompassFonts.bodySemibold,
              { color: colors.textMuted },
            ]}
          >
            Data as of {summary.data.dataAsOf}.
          </Text>
        ) : summary.status !== "real" && summary.meta?.notice ? (
          <Text
            style={[
              styles.dataNote,
              CompassFonts.bodySemibold,
              { color: colors.textMuted },
            ]}
          >
            {summary.meta.notice}
          </Text>
        ) : null}

        {/* ── Alerts ── */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              CompassFonts.displayBold,
              { color: colors.text },
            ]}
          >
            Guidance alerts
          </Text>
          <IntelligenceAlerts state={alerts} />
        </View>

        {/* ── Two panels: workflow + guidance market intelligence ── */}
        <View style={[styles.grid, wide && styles.gridWide]}>
          <View style={wide ? styles.gridCell : undefined}>
            <Panel
              title="Guidance workflow"
              linkLabel="Open compare"
              // §6.3 University Comparison is not built yet (PART 6 educator
              // views are out of scope for this change). Market Intelligence is
              // the honest destination until it lands — it is the same data,
              // without the educator-specific comparison framing.
              onPress={() => adminNav.marketIntelligence(router as Nav)}
            >
              {WORKFLOW_STEPS.map((step, i) => (
                <View
                  key={step}
                  style={[styles.step, { borderTopColor: colors.border }]}
                >
                  <Text
                    style={[
                      styles.stepIndex,
                      CompassFonts.data,
                      { color: colors.textMuted },
                    ]}
                  >
                    {i + 1}
                  </Text>
                  <Text style={[styles.stepBody, { color: colors.text }]}>
                    {step}
                  </Text>
                </View>
              ))}
            </Panel>
          </View>

          <View style={wide ? styles.gridCell : undefined}>
            <Panel
              title="Guidance market intelligence"
              linkLabel="View all"
              onPress={() => adminNav.marketIntelligence(router as Nav)}
            >
              <Text style={[styles.panelNote, { color: colors.textMuted }]}>
                Programme and role demand across all JAMB programmes — no
                "your programmes" filter, because a school has no programme
                list of its own.
              </Text>
              <ComingSoonPanel
                state={summary}
                emptyTitle="No market summary yet"
                emptyBody="Nigerian demand figures appear here once the market data lands."
              >
                {(s) => (
                  <View style={styles.factRow}>
                    <Fact
                      label="Domains accessible"
                      value={fmtInt(s.domainsAccessible)}
                    />
                    <Fact
                      label="Remote-eligible"
                      value={fmtPct(s.remoteEligiblePct)}
                    />
                    <Fact
                      label="Learning gaps flagged"
                      value={fmtInt(s.skillsGapsFlagged)}
                    />
                  </View>
                )}
              </ComingSoonPanel>
            </Panel>
          </View>
        </View>

        {/* ── Learners' interests (aggregate, no PII) ── */}
        <Panel
          title={`Your ${learnerNoun.toLowerCase()}' interests`}
          linkLabel={`Open ${learnerNoun}`}
          onPress={() =>
            providerOnly
              ? adminNav.session(router as Nav)
              : adminNav.students(router as Nav)
          }
        >
          <Text style={[styles.panelNote, { color: colors.textMuted }]}>
            Aggregate and k-anonymised. No individual learner, and no record of
            which learner chose which programme.
          </Text>
          <ComingSoonPanel
            state={learnerState}
            emptyTitle="No learner interests yet"
            emptyBody="Once learners link their accounts, their aggregate domain mix appears here."
          >
            {(data) => {
              const v = view<LearnerIntelligenceView>(data);
              const top = (v.topDomains ?? []).filter((d) => d.domainName);
              if (!top.length) {
                return (
                  <Text style={[styles.panelNote, { color: colors.textMuted }]}>
                    No domain mix to show yet.
                  </Text>
                );
              }
              return (
                <View style={styles.list}>
                  {top.slice(0, 5).map((d, i) => (
                    <View
                      key={d.domainId ?? `${d.domainName}-${i}`}
                      style={[
                        styles.interestRow,
                        { borderTopColor: colors.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.interestName,
                          CompassFonts.bodySemibold,
                          { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {d.domainName}
                      </Text>
                      {d.vsNationalPts != null ? (
                        <Text
                          style={[
                            styles.interestDelta,
                            { color: colors.textMuted },
                          ]}
                          numberOfLines={1}
                        >
                          {d.vsNationalPts >= 0 ? "+" : ""}
                          {Math.round(d.vsNationalPts)}pts vs national
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.interestPct,
                          CompassFonts.data,
                          { color: colors.textSoft },
                        ]}
                      >
                        {fmtPct(d.pct)}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            }}
          </ComingSoonPanel>
        </Panel>

        <Text style={[styles.footNote, { color: colors.textMuted }]}>
          {providerOnly
            ? "Tutorial centres and JAMB cafés advise per session — there is no persistent roster to benchmark."
            : "Secondary schools have no programme mix of their own, so there is no reach audit, peer benchmark or national leaderboard here."}
        </Text>
      </ScrollView>
    </AdminShell>
  );
}

function Panel({
  title,
  linkLabel,
  onPress,
  children,
}: {
  title: string;
  linkLabel: string;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text
        style={[
          styles.sectionTitle,
          CompassFonts.displayBold,
          { color: colors.text },
        ]}
      >
        {title}
      </Text>
      {children}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`${linkLabel}: ${title}`}
        style={styles.link}
      >
        <Text
          style={[
            styles.linkText,
            CompassFonts.bodySemibold,
            { color: colors.accent },
          ]}
        >
          {linkLabel} →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.fact, { borderColor: colors.border }]}>
      <Text
        style={[styles.factValue, CompassFonts.data, { color: colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.factLabel,
          CompassFonts.bodySemibold,
          { color: colors.textMuted },
        ]}
        numberOfLines={2}
      >
        {label}
      </Text>
    </View>
  );
}

export default SchoolGuidanceDashboardScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  header: { gap: Spacing.xs },
  headerTitle: { fontSize: FontSize.xxl },
  headerMeta: { fontSize: FontSize.xs, textTransform: "uppercase" },
  lede: {
    maxWidth: 760,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  stats: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  dataNote: { fontSize: FontSize.xs, marginTop: -Spacing.md },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  grid: { gap: Spacing.lg },
  gridWide: { flexDirection: "row", alignItems: "flex-start" },
  gridCell: { flex: 1, minWidth: 260 },
  panel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  panelNote: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  step: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  stepIndex: { fontSize: FontSize.sm, letterSpacing: 0, minWidth: 16 },
  stepBody: { flex: 1, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  factRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  fact: {
    flex: 1,
    minWidth: 110,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  factValue: { fontSize: FontSize.xl, letterSpacing: 0 },
  factLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  list: { gap: 0 },
  interestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  interestName: { flex: 1, fontSize: FontSize.sm },
  interestDelta: { fontSize: FontSize.xs },
  interestPct: { fontSize: FontSize.sm, letterSpacing: 0 },
  link: { alignSelf: "flex-start", paddingTop: Spacing.xs },
  linkText: { fontSize: FontSize.sm },
  footNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
});
