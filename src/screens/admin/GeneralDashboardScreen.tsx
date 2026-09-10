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
 *   - Stat row: programmes and domains reached. Labour-market figures stay
 *     absent until source-backed demand ingestion exists.
 *   - Intelligence alerts
 *   - Two panels side by side (stacking on narrow): programme/domain mapping
 *     and Market Intelligence, each with [View all →]
 *   - Domain Reach Audit preview: direct/functional/adjacent/unreached +
 *     [Open full audit →]
 *   - Student Intelligence: affiliated / self-signed-up / provisioned counts
 *     and top domains, with [Open Students →]
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
import { adminData } from "@/lib/adminData";
import { adminNav, type Nav } from "@/lib/adminNav";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import { comingSoon, type DataState } from "../../types/career";
import type {
  InstitutionSummary,
  ProgrammeIntelligenceRow,
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
function loadingState<T>(): DataState<T> {
  return { status: "pending", data: null };
}

const fmtInt = (n?: number) => (n == null ? "—" : n.toLocaleString());
const fmtPct = (n?: number) => (n == null ? "—" : `${Math.round(n)}%`);

export function GeneralDashboardScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const { user } = useAuth();

  const [profile, setProfile] = useState<EducatorProfile | null>(null);

  const [summary, setSummary] =
    useState<DataState<InstitutionSummary>>(loadingState);
  const [programmes, setProgrammes] =
    useState<DataState<ProgrammeIntelligenceRow[]>>(loadingState);
  const [alerts, setAlerts] =
    useState<DataState<IntelligenceAlert[]>>(loadingState);
  const [domains, setDomains] =
    useState<DataState<DomainRankItem[]>>(loadingState);
  const [reach, setReach] = useState<DataState<DomainReachAudit>>(loadingState);
  const [students, setStudents] = useState<DataState<StudentIntelligenceSummary>>(loadingState);

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then(
      (p) => {
        if (active) setProfile(p);
      },
      () => {
        // Chrome only (the institution name) — a failure must not surface as an
        // unhandled rejection, matching the settle() pattern in the effect below.
        if (active) setProfile(null);
      },
    );
    return () => {
      active = false;
    };
  }, [user?.id]);

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
    settle(setProgrammes, "Programme intelligence is being populated.")(
      adminData.getProgrammeIntelligence(),
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

  // Typed, not cast: `reach` is DataState<DomainReachAudit>, so a field-name
  // drift against the API is a compile error rather than a silent blank.
  const reachView: Partial<DomainReachAudit> =
    (reach.status === "real" ? reach.data : null) ?? {};
  const orgName =
    (summary.status === "real" ? summary.data?.institutionName : null) ||
    profile?.organizationName ||
    "Your institution";

  return (
    <AdminShell
      title="General dashboard"
      eyebrow={orgName}
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

        {/* ── Search entry point → Explore ──
            The dashboard is institution-scoped and glanceable; Explore is the
            national catalogue and is reached by asking it something. Rather
            than merge two different scopes onto one surface, this is a single
            row that carries the question across. */}
        <ExploreSearchEntry
          onSubmit={(q) => adminNav.explore(router as Nav, q)}
        />

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
            label="Domains reached"
            state={summary}
            select={(d) =>
              // The LIVE universe from the reach audit, never a constant: the
              // audit screen dropped its hardcoded 168 and these two must not
              // disagree about the same denominator.
              reachView.domainUniverse != null
                ? `${fmtInt(d.domainsAccessible)}/${fmtInt(reachView.domainUniverse)}`
                : fmtInt(d.domainsAccessible)
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
              title="Programme intelligence"
              linkLabel="Review curriculum"
              onPress={() => adminNav.skillsGap(router as Nav)}
            >
              <ComingSoonPanel
                state={programmes}
                empty={(rows) => rows.length === 0}
                emptyTitle="No programmes yet"
                emptyBody="Programme/domain mapping appears when your institution's recorded programme list is linked to the CCMAS mapping."
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
                        value="Mapped domains"
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
                emptyBody="Labour-market demand is unavailable until source-backed ingestion is added."
              >
                {(rows) => (
                  <View style={styles.list}>
                    {rows.slice(0, PREVIEW_ROWS).map((row) => (
                      <PreviewRow
                        key={row.domainId}
                        label={`${row.rank}. ${row.domainName}`}
                        sub={row.routeNote}
                        value="Demand unavailable"
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
              const r = data;
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
                </View>
              );
            }}
          </ComingSoonPanel>
        </Panel>

        {/* ── Student intelligence (aggregate, §5.5) ── */}
        <Panel
          title="Student intelligence"
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
              const s = data;
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

/**
 * A one-row hand-off into Explore (§5.4).
 *
 * Deliberately NOT an inline results panel: Explore is the national catalogue
 * with its own navigation stack, and embedding it would nest a whole
 * back-history inside a summary page while putting national figures next to
 * institution-scoped ones. Submitting navigates, carrying the query.
 */
function ExploreSearchEntry({ onSubmit }: { onSubmit: (q: string) => void }) {
  const { colors } = useTheme();
  const [term, setTerm] = useState("");
  const go = () => {
    const q = term.trim();
    if (q.length < 2) return;
    onSubmit(q);
  };
  return (
    <View
      style={[
        styles.searchRow,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.searchIcon}>🔎</Text>
      <TextInput
        value={term}
        onChangeText={setTerm}
        onSubmitEditing={go}
        returnKeyType="search"
        placeholder="Search any programme, domain or role nationally"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel="Search the national programme map"
        style={[styles.searchInput, { color: colors.text }]}
      />
      <TouchableOpacity
        onPress={go}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel="Open Explore with this search"
        style={styles.link}
      >
        <Text
          style={[
            styles.linkText,
            CompassFonts.bodySemibold,
            { color: colors.accent },
          ]}
        >
          Explore →
        </Text>
      </TouchableOpacity>
    </View>
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

/** A bordered summary panel with an optional hand-off to the real screen. */
function Panel({
  title,
  linkLabel,
  onPress,
  children,
}: {
  title: string;
  linkLabel?: string;
  onPress?: () => void;
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
      {linkLabel && onPress ? <TouchableOpacity
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
      </TouchableOpacity> : null}
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 52,
  },
  searchIcon: { fontSize: FontSize.md },
  searchInput: { flex: 1, fontSize: FontSize.sm, minHeight: 40 },
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
