/**
 * ProgrammeDashboardScreen — the institutional home: the boardroom view of an
 * institution's programme → domain → demand intelligence.
 *
 * Composition only — every figure comes from adminData (which returns
 * `coming_soon` envelopes this phase), so the screen renders graceful states,
 * never mock numbers:
 *   - Structural programme/domain StatCards (the institution summary)
 *   - IntelligenceAlerts (auto-surfaced aggregate signals)
 *   - ProgrammeDemandTable and DomainRankPanel, both data-gated until demand
 *     ingestion is source-backed
 *
 * All wrapped in <AdminShell>, which owns the responsive sidebar↔drawer chrome
 * and the privacy-locked Student-management entry.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { PdfExportButton } from "@/components/careerIntelligence/PdfExportButton";
import { adminData } from "@/lib/adminData";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import type { DataState } from "../../types/career";
import type {
  InstitutionSummary,
  ProgrammeDemandRow,
  DomainRankItem,
  IntelligenceAlert,
  RankScope,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { StatCard } from "./StatCard";
import { ProgrammeDemandTable } from "./ProgrammeDemandTable";
import { DomainRankPanel } from "./DomainRankPanel";
import { IntelligenceAlerts } from "./IntelligenceAlerts";

const STAT_PENDING = "Institution intelligence is being populated.";

function loadingState<T>(): DataState<T> {
  return { status: "pending", data: null };
}

export function ProgrammeDashboardScreen() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const wide = width >= 900;
  const { user } = useAuth();

  const [orgName, setOrgName] = useState<string>("");

  const [summary, setSummary] =
    useState<DataState<InstitutionSummary>>(loadingState);
  const [programmes, setProgrammes] =
    useState<DataState<ProgrammeDemandRow[]>>(loadingState);
  const [alerts, setAlerts] =
    useState<DataState<IntelligenceAlert[]>>(loadingState);
  const [domains, setDomains] =
    useState<DataState<DomainRankItem[]>>(loadingState);
  const [scope, setScope] = useState<RankScope>("nigerian");

  // Pull the institution name for the header from the local educator profile.
  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((p) => {
      if (active && p?.organizationName) setOrgName(p.organizationName);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  // Aggregate reads (no PII). All resolve to coming_soon this phase.
  useEffect(() => {
    let active = true;
    (async () => {
      const [s, p, a] = await Promise.all([
        adminData.getInstitutionSummary(),
        adminData.getProgrammeDemand(),
        adminData.getIntelligenceAlerts(),
      ]);
      if (!active) return;
      setSummary(s);
      setProgrammes(p);
      setAlerts(a);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Domain ranking re-fetches whenever the scope toggle changes.
  useEffect(() => {
    let active = true;
    setDomains(loadingState());
    adminData.getDomainRanking(scope).then((d) => {
      if (active) setDomains(d);
    });
    return () => {
      active = false;
    };
  }, [scope]);

  const fmtInt = (n: number) => n.toLocaleString();

  return (
    <AdminShell
      title="Programme dashboard"
      eyebrow={orgName || "Your institution"}
      actions={<PdfExportButton title="Export" />}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Stat cards ── */}
        <View style={styles.stats}>
          <StatCard
            icon="🎓"
            label="Active programmes"
            state={summary}
            select={(d) => fmtInt(d.activeProgrammes)}
          />
          <StatCard
            icon="🧭"
            label="Domains accessible"
            state={summary}
            select={(d) => fmtInt(d.domainsAccessible)}
            selectDelta={(d) =>
              d.domainsDelta != null
                ? `${d.domainsDelta >= 0 ? "+" : ""}${d.domainsDelta} vs last`
                : undefined
            }
            deltaPositive={(d) => (d.domainsDelta ?? 0) >= 0}
          />
        </View>

        {summary.status !== "real" ? (
          <Text style={[styles.dataNote, CompassFonts.bodySemibold, { color: colors.textMuted }]}>
            {summary.meta?.notice ?? STAT_PENDING}
          </Text>
        ) : summary.data?.dataAsOf ? (
          <Text style={[styles.dataNote, CompassFonts.bodySemibold, { color: colors.textMuted }]}>
            Market data as of {summary.data.dataAsOf}.
          </Text>
        ) : null}

        {/* ── Alerts ── */}
        <Section title="Intelligence alerts" colors={colors}>
          <IntelligenceAlerts state={alerts} />
        </Section>

        {/* ── Main grid: table + domain rank ── */}
        <View style={[styles.grid, wide && styles.gridWide]}>
          <View style={wide ? styles.gridMain : undefined}>
            <Section title="Programme → domain mapping" colors={colors}>
              <ProgrammeDemandTable state={programmes} />
            </Section>
          </View>

          <View style={wide ? styles.gridSide : undefined}>
            <Section title="Domain mapping" colors={colors}>
              <DomainRankPanel
                state={domains}
                scope={scope}
                onScopeChange={setScope}
              />
            </Section>
          </View>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ReturnType<typeof useTheme>["colors"];
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

export default ProgrammeDashboardScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  stats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  dataNote: {
    fontSize: FontSize.xs,
    marginTop: -Spacing.md,
  },
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: FontSize.lg,
  },
  grid: { gap: Spacing.xl },
  gridWide: { flexDirection: "row", alignItems: "flex-start" },
  gridMain: { flex: 2 },
  gridSide: { flex: 1, minWidth: 260 },
});
