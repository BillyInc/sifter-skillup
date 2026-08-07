/**
 * GeneralDashboardScreen — the university admin home (spec §5.0).
 *
 * A SUMMARY of every other admin view, each with a "view all" link. It is
 * explicitly NOT a replacement for the dedicated views (Domain Reach Audit
 * §5.1, Market Intelligence §5.2, Skills Gap §5.3, Students §5.5) — every
 * block here is a preview that hands off to the real screen.
 *
 * Composition only. Every figure comes out of an adminData {@link DataState}
 * envelope and is branched through <ComingSoonPanel> / <StatCard>, so an
 * unpopulated area renders a graceful state — never a fabricated number.
 *
 * Sections, in spec order:
 *   - Header: institution name, admin role, Export affordance (AdminShell)
 *   - Stat row: programmes · domains/168 + national rank · demand score + YoY ·
 *     skills gaps · remote-eligible %, plus the "data as of" line
 *   - Intelligence alerts
 *   - Two panels side by side (stacking on narrow): Programme → Domain →
 *     Demand, and Market Intelligence, each with [View all →]
 *   - Domain Reach Audit preview: direct/functional/adjacent/unreached +
 *     national rank, with [Open full audit →]
 *   - Student Intelligence: affiliated / self-signed-up / provisioned counts
 *     and top domains, with [Open Students →]
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { PdfExportButton } from "@/components/careerIntelligence/PdfExportButton";
import { adminData } from "@/lib/adminData";
import { adminNav, type Nav } from "@/lib/adminNav";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { comingSoon, type DataState } from "../../types/career";
import type {
  InstitutionSummary,
  ProgrammeDemandRow,
  DomainRankItem,
  IntelligenceAlert,
  EducatorProfile,
  DomainReachAudit,
  StudentIntelligenceSummary,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { StatCard } from "./StatCard";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { IntelligenceAlerts } from "./IntelligenceAlerts";

const TOTAL_DOMAINS = 168; // the fixed national domain taxonomy size (§5.1)
const PREVIEW_ROWS = 5; // a home-screen preview, never the full table

/**
 * The §5.1 and §5.5 payload types are the canonical ones from
 * src/types/institution.ts, matched to the backend's camelCase alias generator.
 *
 * They were local hand-written view shapes, read through an unchecked
 * `as T` cast. Four field names did not match what the API actually sends
 * (provisioned/unclaimedProvisioned/domainId/domainName vs
 * provisionedByYou/unclaimedCodes/domainKey/label), and because the cast hid it
 * from the compiler the screen simply rendered blanks forever — the very
 * "degrade to — rather than invent a number" property that was supposed to be a
 * safety net is what made the bug silent. Using the real types means tsc
 * catches the next one.
 */
/** Narrow an untyped envelope payload to the fields this screen reads. */
function view<T>(data: unknown): T {
  return (data ?? {}) as T;
}

function loadingState<T>(): DataState<T> {
  return { status: "pending", data: null };
}

const fmtInt = (n?: number) => (n == null ? "—" : n.toLocaleString());
const fmtPct = (n?: number) => (n == null ? "—" : `${Math.round(n)}%`);
const fmtSigned = (n: number) => `${n >= 0 ? "+" : ""}${Math.round(n)}`;

export function GeneralDashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  const [profile, setProfile] = useState<EducatorProfile | null>(null);

  const [summary, setSummary] =
    useState<DataState<InstitutionSummary>>(loadingState);
  const [programmes, setProgrammes] =
    useState<DataState<ProgrammeDemandRow[]>>(loadingState);
  const [alerts, setAlerts] =
    useState<DataState<IntelligenceAlert[]>>(loadingState);
  const [domains, setDomains] =
    useState<DataState<DomainRankItem[]>>(loadingState);
  const [reach, setReach] = useState<DataState<unknown>>(loadingState);
  const [students, setStudents] = useState<DataState<unknown>>(loadingState);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, []);

  // All aggregate (no PII). Each read settles INDEPENDENTLY so one unpopulated
  // or failing area never blanks the rest of the page.
  //
  // This used to be a single Promise.all, which contradicted that comment twice
  // over: one rejection rejected the whole batch, so none of the six setState
  // calls ran and every section stayed pending forever with an unhandled
  // rejection in the log; and every section waited on the slowest read, which
  // is the reach audit — the heaviest endpoint in the feature.
  useEffect(() => {
    let active = true;
    const settle =
      <T,>(set: (v: DataState<T>) => void, notice: string) =>
      (p: Promise<DataState<T>>) => {
        p.then(
          (v) => {
            if (active) set(v);
          },
          () => {
            // adminData already converts most failures into a coming_soon
            // envelope; this catches the rest so a section can never be
            // stranded on `pending`.
            if (active) set(comingSoon<T>(notice));
          },
        );
      };

    settle(setSummary, "Institution intelligence is being populated.")(
      adminData.getInstitutionSummary(),
    );
    settle(setProgrammes, "Programme-domain-demand data is being populated.")(
      adminData.getProgrammeDemand(),
    );
    settle(setAlerts, "Intelligence alerts are being populated.")(
      adminData.getIntelligenceAlerts(),
    );
    settle(setDomains, "Domain demand rankings are being populated.")(
      adminData.getDomainRanking("nigerian"),
    );
    settle(setReach, "Your domain reach audit is being compiled.")(
      adminData.getDomainReachAudit(),
    );
    settle(setStudents, "Student intelligence is being compiled.")(
      adminData.getStudentIntelligenceSummary(),
    );
    return () => {
      active = false;
    };
  }, []);

  const reachView = view<DomainReachAudit>(
    reach.status === "real" ? reach.data : null,
  );
  const orgName =
    (summary.status === "real" ? summary.data?.institutionName : null) ||
    profile?.organizationName ||
    "Your institution";

  return (
    <AdminShell
      title="General dashboard"
      eyebrow={orgName}
      actions={<PdfExportButton title="Export" />}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header line: institution + admin role ── */}
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
          {profile?.role ? (
            <Text
              style={[
                styles.headerRole,
                CompassFonts.bodySemibold,
                { color: colors.textMuted },
              ]}
            >
              Admin: {profile.role}
            </Text>
          ) : null}
        </View>

        {/* ── Stat row (§5.0) ── */}
        <View style={styles.stats}>
          <StatCard
            icon="🎓"
            label="Programmes"
            state={summary}
            select={(d) => fmtInt(d.activeProgrammes)}
          />
          <StatCard
            icon="🧭"
            label={`Domains reached / ${TOTAL_DOMAINS}`}
            state={summary}
            select={(d) => `${fmtInt(d.domainsAccessible)}/${TOTAL_DOMAINS}`}
            selectDelta={() =>
              reachView.nationalRank != null
                ? `#${reachView.nationalRank} nationally`
                : undefined
            }
            deltaPositive={() => true}
          />
          <StatCard
            icon="📊"
            label="Demand score"
            state={summary}
            select={(d) => fmtInt(d.ngPostingsPerMonth)}
            selectDelta={(d) =>
              d.ngPostingsYoyPct != null
                ? `${fmtSigned(d.ngPostingsYoyPct)}% YoY`
                : undefined
            }
            deltaPositive={(d) => (d.ngPostingsYoyPct ?? 0) >= 0}
          />
          <StatCard
            icon="🧩"
            label="Skills gaps"
            state={summary}
            select={(d) => fmtInt(d.skillsGapsFlagged)}
            selectDelta={(d) =>
              d.skillsGapProgrammes != null
                ? `across ${d.skillsGapProgrammes} programmes`
                : undefined
            }
            deltaPositive={() => false}
          />
          <StatCard
            icon="🌍"
            label="Remote-eligible"
            state={summary}
            select={(d) => fmtPct(d.remoteEligiblePct)}
            selectDelta={(d) =>
              d.remoteEligiblePrevPct != null
                ? `was ${fmtPct(d.remoteEligiblePrevPct)}`
                : undefined
            }
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

        {/* ── Intelligence alerts ── */}
        <Section title="Intelligence alerts">
          <IntelligenceAlerts state={alerts} />
        </Section>

        {/* ── Two-panel row: programme demand + market intelligence ── */}
        <View style={[styles.grid, wide && styles.gridWide]}>
          <View style={wide ? styles.gridCell : undefined}>
            <Panel
              title="Programme → domain → demand"
              linkLabel="View all"
              onPress={() => adminNav.marketIntelligence(router as Nav)}
            >
              <ComingSoonPanel
                state={programmes}
                empty={(rows) => rows.length === 0}
                emptyTitle="No programmes yet"
                emptyBody="Your programme mix and its demand appear here once mapped."
              >
                {(rows) => (
                  <View style={styles.list}>
                    {rows.slice(0, PREVIEW_ROWS).map((row) => (
                      <PreviewRow
                        key={row.id}
                        label={row.programmeName}
                        sub={
                          row.domains?.length
                            ? row.domains
                                .slice(0, 2)
                                .map((d) => d.shortLabel)
                                .join(" · ")
                            : undefined
                        }
                        value={`${fmtInt(row.ngPostingsPerMonth)}/mo`}
                      />
                    ))}
                  </View>
                )}
              </ComingSoonPanel>
            </Panel>
          </View>

          <View style={wide ? styles.gridCell : undefined}>
            <Panel
              title="Market intelligence"
              linkLabel="View all"
              onPress={() => adminNav.marketIntelligence(router as Nav)}
            >
              <ComingSoonPanel
                state={domains}
                empty={(rows) => rows.length === 0}
                emptyTitle="No domain ranking yet"
                emptyBody="Top domains and roles by Nigerian demand appear here once populated."
              >
                {(rows) => (
                  <View style={styles.list}>
                    {rows.slice(0, PREVIEW_ROWS).map((row) => (
                      <PreviewRow
                        key={row.domainId}
                        label={`${row.rank}. ${row.domainName}`}
                        sub={row.routeNote}
                        value={`${fmtInt(row.postingsPerMonth)}/mo`}
                      />
                    ))}
                  </View>
                )}
              </ComingSoonPanel>
            </Panel>
          </View>
        </View>

        {/* ── Domain Reach Audit preview (View A, §5.1) ── */}
        <Panel
          title="Domain reach audit"
          linkLabel="Open full audit"
          onPress={() => adminNav.domainReach(router as Nav)}
        >
          <Text style={[styles.panelNote, { color: colors.textMuted }]}>
            Structural CCMAS mapping only — not market demand.
          </Text>
          <ComingSoonPanel
            state={reach}
            emptyTitle="Reach audit not compiled yet"
            emptyBody="Direct, functional and adjacent domain coverage appears here once your programme mix is mapped."
          >
            {(data) => {
              const r = view<DomainReachAudit>(data);
              return (
                <View style={styles.reach}>
                  <View style={styles.reachRow}>
                    <MiniStat label="Direct" value={fmtInt(r.directDomains)} />
                    <MiniStat
                      label="Functional"
                      value={fmtInt(r.functionalDomains)}
                    />
                    <MiniStat
                      label="Adjacent"
                      value={fmtInt(r.adjacentDomains)}
                    />
                    <MiniStat
                      label="Unreached"
                      value={fmtInt(r.unreachedDomains)}
                    />
                  </View>
                  {r.nationalRank != null ? (
                    <Text
                      style={[
                        styles.panelNote,
                        CompassFonts.bodySemibold,
                        { color: colors.text },
                      ]}
                    >
                      National rank #{r.nationalRank}
                      {r.totalInstitutions != null
                        ? ` of ${fmtInt(r.totalInstitutions)}`
                        : ""}
                    </Text>
                  ) : null}
                </View>
              );
            }}
          </ComingSoonPanel>
        </Panel>

        {/* ── Student intelligence (aggregate, §5.5) ── */}
        <Panel
          title="Student intelligence"
          linkLabel="Open Students"
          onPress={() => adminNav.students(router as Nav)}
        >
          <Text style={[styles.panelNote, { color: colors.textMuted }]}>
            Aggregate and k-anonymised — no individual record is shown here.
          </Text>
          <ComingSoonPanel
            state={students}
            emptyTitle="No affiliated students yet"
            emptyBody="Affiliation, provisioning and aggregate domain interest appear here once students join."
          >
            {(data) => {
              const s = view<StudentIntelligenceSummary>(data);
              const top = (s.topDomains ?? []).filter((d) => d.label);
              return (
                <View style={styles.reach}>
                  <View style={styles.reachRow}>
                    <MiniStat
                      label="Affiliated"
                      value={fmtInt(s.totalAffiliated)}
                    />
                    <MiniStat
                      label="Self-signed-up"
                      value={fmtInt(s.selfSignedUp)}
                    />
                    <MiniStat
                      label="Provisioned by you"
                      value={fmtInt(s.provisionedByYou)}
                    />
                    {s.unclaimedCodes != null ? (
                      <MiniStat
                        label="Unclaimed codes"
                        value={fmtInt(s.unclaimedCodes)}
                      />
                    ) : null}
                  </View>
                  {top.length ? (
                    <Text
                      style={[styles.panelNote, { color: colors.textSoft }]}
                    >
                      Top domains among your students:{" "}
                      {top
                        .slice(0, 3)
                        .map(
                          (d) =>
                            `${d.label}${
                              d.pct != null ? ` ${fmtPct(d.pct)}` : ""
                            }`,
                        )
                        .join(" · ")}
                    </Text>
                  ) : null}
                </View>
              );
            }}
          </ComingSoonPanel>
        </Panel>

        <Text style={[styles.footNote, { color: colors.textMuted }]}>
          This is a summary of every admin view. Open a section for the full
          working surface.
        </Text>
      </ScrollView>
    </AdminShell>
  );
}

/** A titled block; used for the plain (link-less) sections. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
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
    </View>
  );
}

/** A bordered summary panel with a "view all" hand-off to the real screen. */
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

function PreviewRow({
  label,
  sub,
  value,
}: {
  label: string;
  sub?: string;
  value: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.previewRow, { borderTopColor: colors.border }]}>
      <View style={styles.previewMain}>
        <Text
          style={[
            styles.previewLabel,
            CompassFonts.bodySemibold,
            { color: colors.text },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        {sub ? (
          <Text
            style={[styles.previewSub, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {sub}
          </Text>
        ) : null}
      </View>
      <Text
        style={[
          styles.previewValue,
          CompassFonts.data,
          { color: colors.textSoft },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.miniStat, { borderColor: colors.border }]}>
      <Text
        style={[styles.miniValue, CompassFonts.data, { color: colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.miniLabel,
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

export default GeneralDashboardScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  header: { gap: Spacing.xs },
  headerTitle: { fontSize: FontSize.xxl },
  headerRole: { fontSize: FontSize.xs, textTransform: "uppercase" },
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
  list: { gap: 0 },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  previewMain: { flex: 1, gap: 2 },
  previewLabel: { fontSize: FontSize.sm },
  previewSub: { fontSize: FontSize.xs },
  previewValue: { fontSize: FontSize.sm },
  reach: { gap: Spacing.sm },
  reachRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  miniStat: {
    flex: 1,
    minWidth: 110,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  miniValue: { fontSize: FontSize.xl, letterSpacing: 0 },
  miniLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  link: { alignSelf: "flex-start", paddingTop: Spacing.xs },
  linkText: { fontSize: FontSize.sm },
  footNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
});
