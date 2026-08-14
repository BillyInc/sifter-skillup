/**
 * DomainReachAuditScreen — View A of the institutional side (spec §5.1).
 *
 * Curriculum portfolio planning: how many of the CCMAS domain universe this
 * institution's programme mix can reach, split direct / functional / adjacent,
 * which domains it does NOT reach (grouped by discipline cluster), a
 * programme-by-programme breakdown. Peer comparison is kept on its own
 * institution-scoped screen.
 *
 * HARD RULE (the whole point of §5.1): this is STRUCTURAL DATA ONLY — the NUC
 * CCMAS 2022–2023 programme→domain mapping. It is NOT market demand and must
 * never be read as Market Intelligence (§5.2). The warning banner below is
 * load-bearing, not decoration.
 *
 * Every read goes through adminData and is branched by ComingSoonPanel, so an
 * absent audit renders a graceful locked/pending state — never a fabricated
 * number.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import { comingSoon, type DataState } from "../../types/career";
import type {
  DomainReachAudit,
  ProgrammeDomainReachRow,
  UnreachedClusterRow,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { ColumnDef } from "@/components/admin/AdminDataTable";

/** Domains shown per cluster before the "show all" affordance. */
const CLUSTER_PREVIEW = 4;

type ProgrammeRankedRow = ProgrammeDomainReachRow & { rank: number };

const PROGRAMME_COLUMNS: ColumnDef[] = [
  { key: "programmeName", label: "Programme" },
  { key: "direct", label: "Direct", width: 70 },
  { key: "functional", label: "Func", width: 60 },
  { key: "adjacent", label: "Adj", width: 60 },
  { key: "total", label: "Total", width: 60 },
  {
    key: "rank",
    label: "Rank",
    width: 60,
    render: (val: number) => <RankCell rank={val} />,
  },
];

function RankCell({ rank }: { rank: number }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.cell, { color: colors.textRole.muted }]}>
      {rank != null ? `#${rank}` : "—"}
    </Text>
  );
}

export function DomainReachAuditScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [audit, setAudit] = useState<DataState<DomainReachAudit>>({
    status: "pending",
    data: null,
  });
  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id)
      .then((p) => {
        if (active) setInstitutionName(p?.organizationName ?? null);
      })
      .catch(() => {
        if (active) setInstitutionName(null);
      });
    adminData
      .getDomainReachAudit()
      .then((d) => {
        if (active) setAudit(d);
      })
      .catch(() => {
        if (active) {
          setAudit(
            comingSoon<DomainReachAudit>(
              "Your domain reach audit could not be loaded. Try again shortly.",
            ),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [user?.id]);

  return (
    <AdminShell
      title="Domain Reach Audit"
      eyebrow={institutionName ?? "Internal use only"}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Header ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text
            style={[
              styles.pageTitle,
              CompassFonts.displayBold,
              { color: colors.text },
            ]}
          >
            Programme domain reach audit
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            {institutionName ? `${institutionName} · ` : ""}Internal use only
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Based on NUC CCMAS 2022–2023 mapping
          </Text>

          {/* The load-bearing warning: structural, not market demand. */}
          <View
            style={[
              styles.callout,
              {
                backgroundColor: colors.warningSoft,
                borderColor: colors.warning,
              },
            ]}
          >
            <Text
              style={[
                styles.calloutTitle,
                CompassFonts.bodyBold,
                { color: colors.text },
              ]}
            >
              ⚠ Structural data only — not market demand
            </Text>
            <Text style={[styles.calloutBody, { color: colors.textSoft }]}>
              This view counts what your programme mix can reach under the CCMAS
              mapping. It says nothing about employer demand, salaries or
              hiring. For demand signals use Market Intelligence — never read
              these numbers as market data.
            </Text>
          </View>
        </View>

        {/* ─── Summary ────────────────────────────────────── */}
        <View style={styles.section}>
          <SectionHeading>Summary</SectionHeading>
          <ComingSoonPanel
            state={audit}
            emptyTitle="No audit yet"
            emptyBody="Your domain reach audit appears here once your programme list is mapped."
          >
            {(data) => <SummaryBlock audit={data} />}
          </ComingSoonPanel>
        </View>

        {/* ─── Unreached domains ──────────────────────────── */}
        <View style={styles.section}>
          <SectionHeading>Your unreached domains</SectionHeading>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Domains no current programme maps to.
          </Text>
          <ComingSoonPanel
            state={audit}
            empty={(d) => (d.unreachedByCluster?.length ?? 0) === 0}
            emptyTitle="Nothing unreached"
            emptyBody="Every mapped domain is reachable from your current programme mix — or the cluster breakdown is still being compiled."
          >
            {(data) => (
              <View style={styles.clusterList}>
                {(data.unreachedByCluster ?? []).map((cluster) => (
                  <UnreachedCluster key={cluster.cluster} cluster={cluster} />
                ))}
                <Text style={[styles.note, { color: colors.textMuted }]}>
                  ⚠ Some domains require new faculties to unlock. Others can be
                  reached by adding elective tracks to existing programmes.
                </Text>
              </View>
            )}
          </ComingSoonPanel>
        </View>

        {/* ─── Programme breakdown ────────────────────────── */}
        <View style={styles.section}>
          <SectionHeading>Programme breakdown</SectionHeading>
          <ComingSoonPanel
            state={audit}
            empty={(d) => (d.programmeBreakdown?.length ?? 0) === 0}
            emptyTitle="No programmes mapped"
            emptyBody="The per-programme breakdown appears once your programme list is linked to CCMAS."
          >
            {(data) => (
              <AdminDataTable
                columns={PROGRAMME_COLUMNS}
                data={rankProgrammes(data.programmeBreakdown ?? [])}
              />
            )}
          </ComingSoonPanel>
        </View>

        {/* ─── Footer ─────────────────────────────────────── */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            Source: NUC CCMAS 2022–2023 · JAMB IBASS 2025
          </Text>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            ⚠ Internal audit view — not visible to students
          </Text>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

// ─── Section pieces ───────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.sectionTitle,
        CompassFonts.bodyBold,
        { color: colors.textRole.muted },
      ]}
    >
      {String(children).toUpperCase()}
    </Text>
  );
}

function SummaryRow({
  label,
  value,
  indent,
  emphasis,
}: {
  label: string;
  value: string;
  indent?: boolean;
  emphasis?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          indent ? styles.summaryIndent : null,
          { color: indent ? colors.textMuted : colors.textSoft },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          emphasis ? CompassFonts.bodyBold : null,
          { color: colors.text },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SummaryBlock({ audit }: { audit: DomainReachAudit }) {
  const { colors } = useTheme();
  // Never a fabricated denominator: the ratio is shown only when the API
  // supplies the live domain universe, otherwise just the count.
  const universe = audit.domainUniverse;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
      ]}
    >
      <SummaryRow
        label="Total programmes offered"
        value={String(audit.programmeCount ?? 0)}
      />
      <SummaryRow
        label="Total domains reachable"
        value={
          universe != null
            ? `${audit.totalDomains ?? 0} of ${universe}`
            : String(audit.totalDomains ?? 0)
        }
        emphasis
      />
      <SummaryRow label="Direct" value={String(audit.directDomains ?? 0)} indent />
      <SummaryRow
        label="Functional"
        value={String(audit.functionalDomains ?? 0)}
        indent
      />
      <SummaryRow
        label="Adjacent"
        value={String(audit.adjacentDomains ?? 0)}
        indent
      />
      <SummaryRow
        label="Domains not reached"
        value={String(audit.unreachedDomains ?? 0)}
      />
    </View>
  );
}

function UnreachedCluster({ cluster }: { cluster: UnreachedClusterRow }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const domains = cluster.domains ?? [];
  const shown = expanded ? domains : domains.slice(0, CLUSTER_PREVIEW);
  const hidden = domains.length - shown.length;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
      ]}
    >
      <Text
        style={[
          styles.clusterTitle,
          CompassFonts.bodyBold,
          { color: colors.text },
        ]}
      >
        {cluster.cluster} gaps
      </Text>
      {shown.map((d) => (
        <View key={d.domainKey} style={styles.domainRow}>
          <Text style={[styles.domainKey, { color: colors.textMuted }]}>
            {d.domainKey}
          </Text>
          <Text style={[styles.domainName, { color: colors.textSoft }]}>
            {d.name}
          </Text>
        </View>
      ))}
      {hidden > 0 || expanded ? (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.7}
          accessibilityRole="button"
        >
          <Text style={[styles.showAll, { color: colors.accentRole.action }]}>
            {expanded ? "Show fewer" : `+ ${hidden} more · Show all`}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

/** Sort programmes by total reach (desc) and stamp a 1-based rank. */
function rankProgrammes(
  rows: ProgrammeDomainReachRow[],
): ProgrammeRankedRow[] {
  return [...rows]
    .sort((a, b) => (b.total ?? 0) - (a.total ?? 0))
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export default DomainReachAuditScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  pageTitle: { fontSize: FontSize.xl },
  sectionTitle: { fontSize: FontSize.xs, letterSpacing: 1 },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },

  callout: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  calloutTitle: { fontSize: FontSize.sm },
  calloutBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: Spacing.xs },

  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    minHeight: 26,
  },
  summaryLabel: { flex: 1, fontSize: FontSize.sm },
  summaryIndent: { paddingLeft: Spacing.md },
  summaryValue: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  clusterList: { gap: Spacing.md },
  clusterTitle: { fontSize: FontSize.md, paddingBottom: Spacing.xs },
  domainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 24,
  },
  domainKey: { fontSize: FontSize.xs, width: 56 },
  domainName: { flex: 1, fontSize: FontSize.sm },
  showAll: { fontSize: FontSize.sm, paddingTop: Spacing.xs },
  note: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
  },

  filterRow: {
    flexDirection: "row",
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  filterLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  cell: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },

  footer: { gap: Spacing.xs, paddingTop: Spacing.md },
  footerText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
  },
});
