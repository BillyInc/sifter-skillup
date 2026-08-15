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
import { useAuth } from "@/hooks/useAuth";
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
}

interface LearnerIntelligenceView {
  totalAffiliated?: number;
  selfSignedUp?: number;
  provisioned?: number;
  unclaimedProvisioned?: number;
  domainsRepresented?: number;
  topDomains?: LearnerDomainShareView[];
}

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
  const { user } = useAuth();

  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [summary, setSummary] =
    useState<DataState<InstitutionSummary>>(loadingState);
  const [alerts, setAlerts] =
    useState<DataState<IntelligenceAlert[]>>(loadingState);
  const [learners, setLearners] = useState<DataState<unknown>>(loadingState);

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

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
  // NOT "General dashboard". An advisory organisation's home is Explore (see
  // adminHomeForProfile) — this is one view among several, and calling it a
  // general dashboard is what made it read as a second, worse copy of the
  // catalogue. It is the cohort: who your learners are, in aggregate.
  const title = providerOnly ? "Guidance sessions" : "Cohort";
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
            Who your learners are, in aggregate. Programme and university
            lookup lives in Explore. Aggregate only — you never see an
            individual learner&apos;s choices unless they explicitly link their
            account.
          </Text>
        </View>

        {/* ── Aggregate learner stats ── */}
        <View style={styles.guidanceActions}>
          {!providerOnly ? (
            <TouchableOpacity
              onPress={() => adminNav.students(router as Nav)}
              style={[styles.guidanceAction, { borderColor: colors.border }]}
            >
              <Text style={[styles.guidanceActionTitle, { color: colors.text }, CompassFonts.bodySemibold]}>
                Create student accounts
              </Text>
              <Text style={[styles.guidanceActionBody, { color: colors.textMuted }]}>
                Provision learners and print claim cards.
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            onPress={() =>
              providerOnly
                ? adminNav.session(router as Nav)
                : adminNav.explore(router as Nav)
            }
            style={[styles.guidanceAction, { borderColor: colors.border }]}
          >
            <Text style={[styles.guidanceActionTitle, { color: colors.text }, CompassFonts.bodySemibold]}>
              Skip to guidance
            </Text>
            <Text style={[styles.guidanceActionBody, { color: colors.textMuted }]}>
              Open the catalogue without creating a student account.
            </Text>
          </TouchableOpacity>
        </View>

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
        </View>

        {/* ── Alerts ── */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              CompassFonts.displayBold,
              { color: colors.text },
            ]}
          >
            Guidance signals (optional)
          </Text>
          <Text style={[styles.panelNote, { color: colors.textMuted }]}>These are aggregate market or curriculum signals for planning guidance work. They never describe an individual learner, and the section can remain empty when no verified signal has been ingested.</Text>
          <IntelligenceAlerts state={alerts} />
        </View>

        {/* ── Two panels: lookup hand-off + guidance market intelligence ── */}
        <View style={[styles.grid, wide && styles.gridWide]}>
          <View style={wide ? styles.gridCell : undefined}>
            <Panel
              title="Advising a learner?"
              linkLabel="Open Explore"
              onPress={() => adminNav.explore(router as Nav)}
            >
              <Text style={[styles.panelNote, { color: colors.textMuted }]}>
                Programmes, universities, requirements and cut-offs are in
                Explore — your home page. This screen answers a different
                question: who your learners are, taken together.
              </Text>
            </Panel>
          </View>

          <View style={wide ? styles.gridCell : undefined}>
            <Panel
              title="Guidance market intelligence"
              linkLabel="View all"
              onPress={() => adminNav.marketIntelligence(router as Nav)}
            >
              <Text style={[styles.panelNote, { color: colors.textMuted }]}>
                Labour-market demand, remote share, salary and trend signals are
                not available until source-backed ingestion is added. This panel
                will not substitute taxonomy baselines for market evidence.
              </Text>
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
            : "Secondary schools do not have a programme mix to audit. Use guidance and peer context to support learner decisions."}
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
  guidanceActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  guidanceAction: {
    flex: 1,
    minWidth: 220,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  guidanceActionTitle: { fontSize: FontSize.sm },
  guidanceActionBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
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
