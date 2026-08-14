/**
 * MarketIntelligenceScreen — View B (spec §5.2).
 *
 * THE MERGE POINT. In v1 this was six separate admin screens, five of which
 * read from only two endpoints and three of which rendered a single column of
 * data that already existed elsewhere:
 *
 *   Domain intelligence → the ranked domain bar list (By Domain/Role mode)
 *   Role demand         → the full role table (drill-down + domain expand)
 *   Trends              → trend is now a number beside every figure
 *   Remote              → "Remote %" is now a column on the role row
 *   Salary              → "Salary" is now a column on the role row
 *
 * §5.2 collapses them into ONE screen with two entry modes over the same data:
 *   • By Programme (default) — your programmes ranked by demand, drill into
 *     domain → role, with the §5.3 skills-gap report nested in the drill-down.
 *   • By Domain/Role (§5.2.1) — the same demand data entered from the market
 *     side: an expandable domain table with its roles underneath.
 *
 * Trend is ALWAYS a number beside the figure (▲12% / ▼3%), never a separate
 * chart or screen. Remote % and salary are ALWAYS columns on the role row.
 *
 * Data comes only from adminData (getProgrammeDemand, getDomainRanking,
 * getRoleDemand, getSkillsGapReport) plus the existing
 * GET /api/institutions/me/vs-national read that the retired vs-national
 * screen owned.
 * Every block branches through ComingSoonPanel — nothing is ever fabricated.
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { Badge } from "@/components/ui";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import type { ColumnDef } from "@/components/admin/AdminDataTable";
import { ScopeToggle } from "@/components/admin/ScopeToggle";
import type { ScopeOption } from "@/components/admin/ScopeToggle";
import { SparklineBar } from "@/components/admin/SparklineBar";
import { comingSoon, type DataState } from "../../types/career";
import type {
  DomainRankItem,
  ProgrammeDemandRow,
  RankScope,
  RoleDemandRow,
  SkillGapRow,
  TrendDirection,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

// ─── vs-national (carried from the retired vs-national screen) ───
/**
 * One row of GET /api/institutions/me/vs-national. The route serialises with
 * `by_alias=True`, so the wire keys are snake_case; older builds emitted
 * camelCase. Both are accepted and normalised — never guessed at.
 */
// ─── Formatters (carried from Role/Salary/Remote/Trends) ─────────
function trendGlyph(d?: TrendDirection | null): string {
  if (d === "up") return "▲";
  if (d === "down") return "▼";
  return "→";
}

function directionFor(
  pct?: number | null,
  explicit?: TrendDirection | null,
): TrendDirection {
  if (explicit) return explicit;
  if (pct == null) return "flat";
  if (pct > 0) return "up";
  if (pct < 0) return "down";
  return "flat";
}

/** Trend as a number beside the figure — §5.2: never a separate screen. */
function TrendChip({
  pct,
  direction,
}: {
  pct?: number | null;
  direction?: TrendDirection | null;
}) {
  const { colors } = useTheme();
  if (pct == null) {
    return (
      <Text style={[styles.trend, { color: colors.textMuted }]}>—</Text>
    );
  }
  const dir = directionFor(pct, direction);
  return (
    <Text
      style={[
        styles.trend,
        CompassFonts.bodyBold,
        { color: dir === "down" ? colors.red : colors.green },
      ]}
    >
      {trendGlyph(dir)} {Math.abs(pct)}%
    </Text>
  );
}

/** Salary band — carried verbatim from the retired salary screen. */
function formatSalary(min?: number | null, max?: number | null): string {
  if (min != null && max != null) {
    return `₦${(min / 1000).toFixed(0)}k–₦${(max / 1000).toFixed(0)}k`;
  }
  if (min != null) return `From ₦${(min / 1000).toFixed(0)}k`;
  if (max != null) return `Up to ₦${(max / 1000).toFixed(0)}k`;
  return "—";
}

/** Market quadrant wording — carried verbatim from the retired role screen. */
function marketLabel(row: RoleDemandRow): string {
  if (row.interpretation) return row.interpretation;
  switch (row.quadrant) {
    case "high_demand_high_value":
      return "Broad demand, strong upside";
    case "high_demand_lower_value":
      return "Broad entry, lower ceiling";
    case "low_demand_high_value":
      return "Elite pathway, selective entry";
    case "low_demand_low_value":
      return "Limited signal";
    case "emerging_high_growth":
      return "Growing fast";
    default:
      return "Insufficient data";
  }
}

/**
 * The role row columns. Every column that used to be its own screen lives
 * here: NG postings + Global (role demand), Remote % (remote), Salary
 * (salary), Trend (trends), Market signal.
 */
const ROLE_COLUMNS: ColumnDef[] = [
  { key: "roleName", label: "Role" },
  { key: "domainName", label: "Domain", width: 120 },
  {
    key: "ngPostings",
    label: "NG postings",
    width: 90,
    render: (val: number) => (val != null ? val.toLocaleString() : "—"),
  },
  {
    key: "globalPostings",
    label: "Global",
    width: 80,
    render: (val: number) => (val != null ? val.toLocaleString() : "—"),
  },
  {
    key: "remotePct",
    label: "Remote %",
    width: 80,
    render: (val: number) => (val != null ? `${Math.round(val)}%` : "—"),
  },
  {
    key: "salary",
    label: "Salary (NGN)",
    width: 130,
    render: (_: unknown, row: RoleDemandRow) =>
      formatSalary(row.salaryMin, row.salaryMax),
  },
  {
    key: "trendPct",
    label: "Trend",
    width: 74,
    render: (_: unknown, row: RoleDemandRow) => (
      <TrendChip pct={row.trendPct} />
    ),
  },
  {
    key: "market",
    label: "Market signal",
    width: 170,
    render: (_: unknown, row: RoleDemandRow) => marketLabel(row),
  },
];

// ─── Small chrome primitives ─────────────────────────────────────
function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.bgSecondary }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            onPress={() => onChange(o.value)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            style={[styles.segment, active && { backgroundColor: colors.card }]}
          >
            <Text
              style={[
                styles.segmentLabel,
                CompassFonts.bodySemibold,
                { color: active ? colors.text : colors.textMuted },
              ]}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SectionHeading({ title, note }: { title: string; note?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <Text
        style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}
      >
        {title}
      </Text>
      {note ? (
        <Text style={[styles.lede, { color: colors.textMuted }]}>{note}</Text>
      ) : null}
    </View>
  );
}

function Notice({ children }: { children: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.notice, { color: colors.textMuted }]}>{children}</Text>
  );
}

// ─── Skills gap report (§5.3, nested in the drill-down) ──────────
const SKILL_GAP_COLUMNS: ColumnDef[] = [
  { key: "skill", label: "Skill" },
  { key: "domainName", label: "Domain", width: 130 },
  {
    key: "demandPct",
    label: "In % of postings",
    width: 110,
    render: (val: number) => (val != null ? `${Math.round(val)}%` : "—"),
  },
  {
    key: "inCurriculum",
    label: "In CCMAS?",
    width: 100,
    render: (val: boolean) => (
      <Badge
        label={val ? "Covered" : "Gap"}
        variant={val ? "success" : "warning"}
        size="sm"
      />
    ),
  },
];

/**
 * §5.3: "the full report nested inside a programme's drill-down in View B".
 * One report, two entry points — this reads the same getSkillsGapReport()
 * the standalone Skills Gap screen reads, filtered to this programme.
 */
function SkillsGapReport({
  state,
  programmeName,
}: {
  state: DataState<SkillGapRow[]>;
  programmeName: string;
}) {
  const { colors } = useTheme();
  const scoped: DataState<SkillGapRow[]> =
    state.status === "real" && state.data
      ? {
          ...state,
          data: state.data.filter(
            (r) =>
              (r.programmeName ?? "").toLowerCase() ===
              programmeName.toLowerCase(),
          ),
        }
      : state;

  return (
    <View style={{ gap: Spacing.sm }}>
      <Text
        style={[styles.detailTitle, CompassFonts.bodyBold, { color: colors.textMuted }]}
      >
        SKILLS GAP REPORT
      </Text>
      <Text style={[styles.detailNote, { color: colors.textMuted }]}>
        What CCMAS teaches vs what employers ask for.
      </Text>
      <ComingSoonPanel
        state={scoped}
        compact
        empty={(rows) => rows.length === 0}
        emptyTitle="No gaps recorded"
        emptyBody="The skills-gap report for this programme is being populated."
      >
        {(rows) => <AdminDataTable columns={SKILL_GAP_COLUMNS} data={rows} />}
      </ComingSoonPanel>
      <Text style={[styles.warn, { color: colors.textMuted }]}>
        ⚠ The CCMAS curriculum is identical for this programme at every
        accredited university. A gap here is a national finding, not unique to
        your institution — addressing it needs curriculum-committee action or
        student-facing certification guidance.
      </Text>
    </View>
  );
}

function DetailGroup({ title, items }: { title: string; items: string[] }) {
  const { colors } = useTheme();
  if (!items.length) return null;
  return (
    <View style={{ gap: 3 }}>
      <Text
        style={[styles.detailTitle, CompassFonts.bodyBold, { color: colors.textMuted }]}
      >
        {title.toUpperCase()}
      </Text>
      <Text style={[styles.detailBody, { color: colors.textSoft }]}>
        {items.join(" · ")}
      </Text>
    </View>
  );
}

// ─── By Programme mode ───────────────────────────────────────────
type ProgrammeSort = "demand" | "trend" | "name";

/** Roles shown inside a programme drill-down. The remainder is counted, not
 *  silently dropped — see the module comment. */
const ROLE_DRILLDOWN_LIMIT = 10;

function ProgrammeRow({
  row,
  domains,
  roles,
  skillsGap,
}: {
  row: ProgrammeDemandRow;
  domains: DomainRankItem[];
  roles: DataState<RoleDemandRow[]>;
  skillsGap: DataState<SkillGapRow[]>;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  // Join the programme's mapped domains onto the ranked domain data so the
  // drill-down can show postings + trend per domain (was DomainIntelligence).
  const domainRows = useMemo(() => {
    const byId = new Map(domains.map((d) => [d.domainId, d]));
    return row.domains.map((badge) => ({
      ...badge,
      rank: byId.get(badge.domainId),
    }));
  }, [row.domains, domains]);

  const domainNames = useMemo(
    () =>
      new Set(
        domainRows
          .map((d) => d.rank?.domainName?.toLowerCase())
          .filter((n): n is string => Boolean(n)),
      ),
    [domainRows],
  );

  // Roles reachable through this programme's domains — remote % and salary
  // inline as columns, exactly as §5.2 requires.
  const matchedRoles =
    roles.status === "real" && roles.data
      ? roles.data.filter((r) =>
          r.domainName ? domainNames.has(r.domainName.toLowerCase()) : false,
        )
      : [];
  const roleState: DataState<RoleDemandRow[]> =
    roles.status === "real" && roles.data
      ? { ...roles, data: matchedRoles.slice(0, ROLE_DRILLDOWN_LIMIT) }
      : roles;
  const hiddenRoleCount = Math.max(
    0,
    matchedRoles.length - ROLE_DRILLDOWN_LIMIT,
  );

  const band = formatSalary(row.entrySalaryMin, row.entrySalaryMax);

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
        style={styles.cardHead}
      >
        <View style={{ flex: 1, gap: 5 }}>
          <View style={styles.titleLine}>
            <Text
              style={[styles.rowTitle, CompassFonts.bodyBold, { color: colors.text }]}
              numberOfLines={1}
            >
              {row.programmeName}
            </Text>
            <Badge
              label={row.mappingSource === "ccmas" ? "CCMAS" : "CUSTOM"}
              variant={row.mappingSource === "ccmas" ? "info" : "default"}
              size="sm"
            />
          </View>
          <View style={styles.badgeWrap}>
            {row.domains.map((d) => (
              <Badge key={d.domainId} label={d.shortLabel} variant="track" size="sm" />
            ))}
            {row.domainOverflow ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                +{row.domainOverflow} more
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metrics}>
          {row.sparkline && row.sparkline.length > 0 ? (
            <SparklineBar data={row.sparkline} height={24} />
          ) : null}
          <Text
            style={[styles.figure, CompassFonts.displayBold, { color: colors.text }]}
          >
            {row.ngPostingsPerMonth.toLocaleString()}
          </Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>/mo</Text>
          <TrendChip pct={row.trendPct} direction={row.trendDirection} />
        </View>
      </TouchableOpacity>

      <View style={styles.subLine}>
        {band !== "—" ? (
          <Text style={[styles.meta, CompassFonts.bodySemibold, { color: colors.textSoft }]}>
            Entry {band}
          </Text>
        ) : null}
        {row.skillsGapCount > 0 ? (
          <Badge
            label={`${row.skillsGapCount} skill gap${row.skillsGapCount === 1 ? "" : "s"}`}
            variant="warning"
            size="sm"
          />
        ) : (
          <Badge label="No gaps" variant="success" size="sm" />
        )}
        <Text style={[styles.meta, CompassFonts.bodyBold, { color: colors.accent }]}>
          {open ? "Hide detail ▲" : "Detail ▼"}
        </Text>
      </View>

      {open ? (
        <View
          style={[
            styles.detail,
            { backgroundColor: colors.bgSecondary, borderColor: colors.border },
          ]}
        >
          {/* By Domain — was the standalone domain-intelligence screen */}
          <View style={{ gap: 4 }}>
            <Text
              style={[styles.detailTitle, CompassFonts.bodyBold, { color: colors.textMuted }]}
            >
              BY DOMAIN
            </Text>
            {domainRows.map((d) => (
              <View key={d.domainId} style={styles.domainLine}>
                <Text
                  style={[styles.domainName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {d.rank?.domainName ?? d.shortLabel}
                </Text>
                <Text style={[styles.meta, { color: colors.textSoft }]}>
                  {d.rank
                    ? `${d.rank.postingsPerMonth.toLocaleString()}/mo`
                    : "—"}
                </Text>
                <TrendChip
                  pct={d.rank?.trendPct}
                  direction={d.rank?.trendDirection}
                />
                <Badge label={d.matchType} variant="track" size="sm" />
              </View>
            ))}
          </View>

          {/* By Role — was role-demand + remote + salary, now three columns */}
          <View style={{ gap: 4 }}>
            <Text
              style={[styles.detailTitle, CompassFonts.bodyBold, { color: colors.textMuted }]}
            >
              BY ROLE — REMOTE % AND SALARY INLINE
            </Text>
            <ComingSoonPanel
              state={roleState}
              compact
              empty={(rows) => rows.length === 0}
              emptyTitle="No roles yet"
              emptyBody="Role-level demand for these domains is being populated."
            >
              {(rows) => <AdminDataTable columns={ROLE_COLUMNS} data={rows} />}
            </ComingSoonPanel>
            {hiddenRoleCount > 0 ? (
              <Text style={[styles.detailNote, { color: colors.textMuted }]}>
                Showing the top {ROLE_DRILLDOWN_LIMIT} of{" "}
                {matchedRoles.length} roles · {hiddenRoleCount} more not shown.
              </Text>
            ) : null}
          </View>

          {row.detail ? (
            <>
              <DetailGroup
                title="Top skills"
                items={row.detail.topSkills.map(
                  (s) => `${s.name}${s.inCurriculum ? "" : " (gap)"}`,
                )}
              />
              <DetailGroup
                title="Top certifications"
                items={row.detail.topCertifications.map((c) => c.name)}
              />
              <DetailGroup title="Top employers" items={row.detail.topEmployers} />
            </>
          ) : (
            <Text style={[styles.detailNote, { color: colors.textMuted }]}>
              🚧 Detailed skills, certifications and employers are being
              populated for this programme.
            </Text>
          )}

          {/* §5.3 — the full report, nested here as well as on the dashboard */}
          <SkillsGapReport state={skillsGap} programmeName={row.programmeName} />
        </View>
      ) : null}
    </View>
  );
}

/** Advisory signals — derived only from rows the API actually returned. */
function AdvisorySignals({ rows }: { rows: ProgrammeDemandRow[] }) {
  const { colors } = useTheme();
  if (rows.length === 0) return null;

  const byDemand = [...rows].sort(
    (a, b) => b.ngPostingsPerMonth - a.ngPostingsPerMonth,
  );
  const withTrend = rows.filter((r) => r.trendPct != null);
  // A "fastest growing" claim requires actual growth — the highest trend can be
  // negative when every programme is declining, which would otherwise label a
  // declining programme as growing AND list it under "Declining programmes".
  const fastest = [...withTrend]
    .filter((r) => (r.trendPct ?? 0) > 0)
    .sort((a, b) => (b.trendPct ?? 0) - (a.trendPct ?? 0))[0];
  const declining = withTrend.filter((r) => (r.trendPct ?? 0) < 0);
  const top = byDemand[0];

  return (
    <View style={{ gap: 5 }}>
      <SectionHeading title="Advisory signals" />
      <Text style={[styles.signal, { color: colors.textSoft }]}>
        ⚡ Highest demand programme: {top.programmeName} (
        {top.ngPostingsPerMonth.toLocaleString()}/mo)
      </Text>
      {fastest && fastest.trendPct != null ? (
        <Text style={[styles.signal, { color: colors.textSoft }]}>
          ⚡ Fastest growing: {fastest.programmeName} ({fastest.trendPct}% YoY)
        </Text>
      ) : null}
      <Text style={[styles.signal, { color: colors.textSoft }]}>
        {declining.length > 0
          ? `⚠ Declining programmes: ${declining
              .map((r) => `${r.programmeName} (${r.trendPct}%)`)
              .join(", ")}`
          : "⚠ Declining programmes: none"}
      </Text>
    </View>
  );
}

// ─── By Domain/Role mode (§5.2.1) ────────────────────────────────
type MarketSort = "volume" | "value" | "trend";

function valueRank(item: DomainRankItem): number {
  switch (item.valueBand) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}

function DomainRow({
  item,
  roles,
  max,
}: {
  item: DomainRankItem;
  roles: DataState<RoleDemandRow[]>;
  max: number;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const ratio =
    item.barRatio != null ? item.barRatio : (item.postingsPerMonth || 0) / max;

  const roleState: DataState<RoleDemandRow[]> =
    roles.status === "real" && roles.data
      ? {
          ...roles,
          data: roles.data.filter(
            (r) =>
              (r.domainName ?? "").toLowerCase() ===
              item.domainName.toLowerCase(),
          ),
        }
      : roles;

  return (
    <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
        style={{ gap: 4 }}
      >
        <View style={styles.titleLine}>
          <Text style={[styles.meta, CompassFonts.displayBold, { color: colors.textMuted }]}>
            {open ? "▾" : "▸"} #{item.rank}
          </Text>
          <Text
            style={[styles.rowTitle, CompassFonts.bodyBold, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.domainName}
          </Text>
          <Text style={[styles.figure, CompassFonts.bodyBold, { color: colors.text }]}>
            {item.postingsPerMonth.toLocaleString()}/mo
          </Text>
          <TrendChip pct={item.trendPct} direction={item.trendDirection} />
        </View>

        <View style={[styles.barTrack, { backgroundColor: colors.bgSecondary }]}>
          <View
            style={[
              styles.barFill,
              {
                backgroundColor: colors.accentRole.action,
                width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`,
              },
            ]}
          />
        </View>

        {item.routeNote ? (
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={2}>
            {item.routeNote}
          </Text>
        ) : null}
        {item.interpretation ? (
          <Text
            style={[styles.meta, { color: colors.accentRole.action }]}
            numberOfLines={2}
          >
            {item.interpretation}
          </Text>
        ) : null}
      </TouchableOpacity>

      {open ? (
        <View
          style={[
            styles.detail,
            { backgroundColor: colors.bgSecondary, borderColor: colors.border },
          ]}
        >
          <ComingSoonPanel
            state={roleState}
            compact
            empty={(rows) => rows.length === 0}
            emptyTitle="No roles yet"
            emptyBody="Role-level demand for this domain is being populated."
          >
            {(rows) => <AdminDataTable columns={ROLE_COLUMNS} data={rows} />}
          </ComingSoonPanel>
        </View>
      ) : null}
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────
export function MarketIntelligenceScreen() {
  const { colors } = useTheme();
  const [mode, setMode] = useState<"programme" | "market">("programme");
  const [scope, setScope] = useState<RankScope>("nigerian");
  const [programmeSort, setProgrammeSort] = useState<ProgrammeSort>("demand");
  const [marketSort, setMarketSort] = useState<MarketSort>("volume");
  const [query, setQuery] = useState("");

  const [programmes, setProgrammes] = useState<DataState<ProgrammeDemandRow[]>>({
    status: "pending",
    data: null,
  });
  const [domains, setDomains] = useState<DataState<DomainRankItem[]>>({
    status: "pending",
    data: null,
  });
  const [roles, setRoles] = useState<DataState<RoleDemandRow[]>>({
    status: "pending",
    data: null,
  });
  const [skillsGap, setSkillsGap] = useState<DataState<SkillGapRow[]>>({
    status: "pending",
    data: null,
  });
  // Scope-independent reads.
  useEffect(() => {
    let active = true;
    adminData
      .getProgrammeDemand({})
      .then((d) => {
        if (active) setProgrammes(d);
      })
      .catch(() => {
        if (active) {
          setProgrammes(
            comingSoon<ProgrammeDemandRow[]>(
              "Programme demand could not be loaded. Try again shortly.",
            ),
          );
        }
      });
    adminData
      .getRoleDemand()
      .then((d) => {
        if (active) setRoles(d);
      })
      .catch(() => {
        if (active) {
          setRoles(
            comingSoon<RoleDemandRow[]>(
              "Role-level demand could not be loaded. Try again shortly.",
            ),
          );
        }
      });
    adminData
      .getSkillsGapReport()
      .then((d) => {
        if (active) setSkillsGap(d);
      })
      .catch(() => {
        if (active) {
          setSkillsGap(
            comingSoon<SkillGapRow[]>(
              "The skills-gap report could not be loaded. Try again shortly.",
            ),
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Scope-driven reads — the lens is never collapsed into one score.
  useEffect(() => {
    let active = true;
    setDomains({ status: "pending", data: null });
    adminData
      .getDomainRanking(scope)
      .then((d) => {
        if (active) setDomains(d);
      })
      .catch(() => {
        if (active) {
          setDomains(
            comingSoon<DomainRankItem[]>(
              "Domain demand rankings could not be loaded. Try again shortly.",
            ),
          );
        }
      });
    return () => {
      active = false;
    };
  }, [scope]);

  const domainList = useMemo(
    () => (domains.status === "real" ? (domains.data ?? []) : []),
    [domains],
  );

  const sortedProgrammes: DataState<ProgrammeDemandRow[]> = useMemo(() => {
    if (programmes.status !== "real" || !programmes.data) return programmes;
    const rows = [...programmes.data];
    rows.sort((a, b) => {
      if (programmeSort === "name") {
        return a.programmeName.localeCompare(b.programmeName);
      }
      if (programmeSort === "trend") {
        return (b.trendPct ?? 0) - (a.trendPct ?? 0);
      }
      return b.ngPostingsPerMonth - a.ngPostingsPerMonth;
    });
    return { ...programmes, data: rows };
  }, [programmes, programmeSort]);

  const marketDomains: DataState<DomainRankItem[]> = useMemo(() => {
    if (domains.status !== "real" || !domains.data) return domains;
    const q = query.trim().toLowerCase();
    const roleRows = roles.status === "real" ? (roles.data ?? []) : [];
    const matchingDomainNames = new Set(
      roleRows
        .filter((r) => q && r.roleName.toLowerCase().includes(q))
        .map((r) => (r.domainName ?? "").toLowerCase()),
    );
    const rows = domains.data.filter((d) => {
      if (!q) return true;
      return (
        d.domainName.toLowerCase().includes(q) ||
        matchingDomainNames.has(d.domainName.toLowerCase())
      );
    });
    rows.sort((a, b) => {
      if (marketSort === "value") return valueRank(b) - valueRank(a);
      if (marketSort === "trend") return (b.trendPct ?? 0) - (a.trendPct ?? 0);
      return b.postingsPerMonth - a.postingsPerMonth;
    });
    return { ...domains, data: rows };
  }, [domains, roles, query, marketSort]);

  /** Roles whose domain isn't in the ranked list — never silently dropped. */
  const unmappedRoles: DataState<RoleDemandRow[]> = useMemo(() => {
    if (roles.status !== "real" || !roles.data) return roles;
    const known = new Set(domainList.map((d) => d.domainName.toLowerCase()));
    const q = query.trim().toLowerCase();
    const rows = roles.data.filter((r) => {
      const inKnown = known.has((r.domainName ?? "").toLowerCase());
      if (inKnown) return false;
      if (!q) return true;
      return (
        r.roleName.toLowerCase().includes(q) ||
        (r.domainName ?? "").toLowerCase().includes(q)
      );
    });
    return { ...roles, data: rows };
  }, [roles, domainList, query]);

  return (
    <AdminShell title="Market Intelligence" eyebrow="Advisory · aggregate only">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <SectionHeading
            title="Programme market intelligence"
            note="Which of your programmes lead to real jobs. Advisory only — Nigerian local, global and Nigerian remote demand stay separate lenses, never averaged into one score. No individual student data."
          />

          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "programme", label: "By Programme" },
              { value: "market", label: "By Domain/Role" },
            ]}
          />

          <ScopeToggle
            value={scope as ScopeOption}
            onChange={(s) => setScope(s as RankScope)}
          />

          <Notice>
            ⚠ Only one month of demand data is currently seeded. Trend figures
            activate as the ingestion pipeline runs — trend is shown as a number
            beside each figure, never as a separate chart.
          </Notice>
        </View>

        {mode === "programme" ? (
          <>
            <View style={styles.section}>
              <View style={styles.controlRow}>
                <Text style={[styles.meta, { color: colors.textMuted }]}>Sort</Text>
                <Segmented
                  value={programmeSort}
                  onChange={setProgrammeSort}
                  options={[
                    { value: "demand", label: "Demand" },
                    { value: "trend", label: "YoY growth" },
                    { value: "name", label: "Name" },
                  ]}
                />
              </View>

              <ComingSoonPanel
                state={sortedProgrammes}
                empty={(rows) => rows.length === 0}
                emptyTitle="No programmes yet"
                emptyBody="Your programme demand table appears here once populated."
              >
                {(rows) => (
                  <View style={{ gap: Spacing.sm }}>
                    {rows.map((row) => (
                      <ProgrammeRow
                        key={row.id}
                        row={row}
                        domains={domainList}
                        roles={roles}
                        skillsGap={skillsGap}
                      />
                    ))}
                  </View>
                )}
              </ComingSoonPanel>
            </View>

            <View style={styles.section}>
              <ComingSoonPanel
                state={programmes}
                compact
                empty={(rows) => rows.length === 0}
                emptyTitle="No signals yet"
                emptyBody="Advisory signals appear once programme demand is populated."
              >
                {(rows) => <AdvisorySignals rows={rows} />}
              </ComingSoonPanel>
            </View>
          </>
        ) : (
          <View style={styles.section}>
            <SectionHeading
              title="By domain / role"
              note="The same demand data entered from the market side instead of your current offering. Expand a domain for its roles — remote share and salary are columns on the role row."
            />

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search domain or role…"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.search,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <View style={styles.controlRow}>
              <Text style={[styles.meta, { color: colors.textMuted }]}>Sort</Text>
              <Segmented
                value={marketSort}
                onChange={setMarketSort}
                options={[
                  { value: "volume", label: "Volume" },
                  { value: "value", label: "Value" },
                  { value: "trend", label: "Trend" },
                ]}
              />
            </View>

            <ComingSoonPanel
              state={marketDomains}
              empty={(rows) => rows.length === 0}
              emptyTitle="No domains yet"
              emptyBody="Domain demand rankings appear here once populated."
            >
              {(items) => {
                const max = Math.max(
                  1,
                  ...items.map((i) => i.postingsPerMonth || 0),
                );
                return (
                  <View style={{ gap: Spacing.sm }}>
                    {items.map((item) => (
                      <DomainRow
                        key={item.domainId}
                        item={item}
                        roles={roles}
                        max={max}
                      />
                    ))}
                  </View>
                );
              }}
            </ComingSoonPanel>

            {/* Roles outside the ranked domains still have to be reachable.
                Rendered only when real rows exist — a state panel here would be
                a stray empty box under the domain list. */}
            {unmappedRoles.status === "real" &&
            (unmappedRoles.data?.length ?? 0) > 0 ? (
              <View style={{ gap: Spacing.xs }}>
                <Text
                  style={[
                    styles.detailTitle,
                    CompassFonts.bodyBold,
                    { color: colors.textMuted },
                  ]}
                >
                  OTHER ROLES
                </Text>
                <AdminDataTable
                  columns={ROLE_COLUMNS}
                  data={unmappedRoles.data ?? []}
                />
              </View>
            ) : null}
          </View>
        )}

        <View style={styles.section}>
          <Notice>
            Source: JSearch API · NBS NLFS · Glassdoor NG. Domain mapping: NUC
            CCMAS 2022–2023. Demand data is a single-month seed; a multi-year
            trend requires the live ingestion pipeline.
          </Notice>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default MarketIntelligenceScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  lede: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  notice: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
  warn: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },

  segmented: {
    flexDirection: "row",
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  segmentLabel: { fontSize: FontSize.sm },
  controlRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },

  search: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    minHeight: 40,
  },

  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHead: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  titleLine: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  rowTitle: { flex: 1, fontSize: FontSize.md },
  badgeWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.xs,
  },
  metrics: { alignItems: "flex-end", gap: 2 },
  figure: { fontSize: FontSize.md },
  meta: { fontSize: FontSize.xs },
  trend: { fontSize: FontSize.xs },
  subLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },

  detail: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  detailTitle: { fontSize: 9, letterSpacing: 1 },
  detailBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },
  detailNote: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.6 },

  domainLine: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  domainName: { flex: 1, fontSize: FontSize.sm },

  barTrack: { height: 6, borderRadius: Radius.full, overflow: "hidden" },
  barFill: { height: 6, borderRadius: Radius.full },

  signal: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
