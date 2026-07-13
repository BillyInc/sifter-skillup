/**
 * ProgrammeDemandTable — the Programme × Domain × Demand matrix.
 *
 * The core of the institutional dashboard: each row is one of the institution's
 * programmes with its mapped domains, monthly NG posting volume, trend, entry
 * salary band and a skills-gap count. Tapping a row expands the lazily-loaded
 * detail (top skills / certifications / employers).
 *
 * Data-gated: the whole table is wrapped in <ComingSoonPanel>, so until
 * adminData.getProgrammeDemand() returns `real` rows this renders the
 * coming-soon panel — never mock programmes. All figures come from the row
 * objects; nothing is hard-coded here.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
} from "../../theme";
import { Badge } from "../../components/ui";
import { SparklineBar } from "../../components/admin/SparklineBar";
import { ComingSoonPanel } from "./ComingSoonPanel";
import type { DataState } from "../../types/career";
import type {
  ProgrammeDemandRow,
  TrendDirection,
} from "../../types/institution";

function trendGlyph(d?: TrendDirection): string {
  if (d === "up") return "▲";
  if (d === "down") return "▼";
  return "→";
}

function salaryBand(row: ProgrammeDemandRow): string | null {
  if (row.entrySalaryMin == null && row.entrySalaryMax == null) return null;
  const fmt = (n?: number) =>
    n == null ? "?" : `₦${Math.round(n / 1000)}k`;
  return `${fmt(row.entrySalaryMin)}–${fmt(row.entrySalaryMax)}`;
}

function Row({ row }: { row: ProgrammeDemandRow }) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const band = salaryBand(row);

  return (
    <View style={[styles.row, { borderColor: colors.border }]}>
      <TouchableOpacity
        onPress={() => setOpen((o) => !o)}
        activeOpacity={0.7}
        style={styles.rowHead}
      >
        <View style={styles.rowMain}>
          <View style={styles.rowTitleLine}>
            <Text
              style={[styles.programme, { color: colors.text }]}
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

          {/* Domain badges */}
          <View style={styles.domains}>
            {row.domains.map((d) => (
              <Badge
                key={d.domainId}
                label={d.shortLabel}
                variant="track"
                size="sm"
              />
            ))}
            {row.domainOverflow ? (
              <Text style={[styles.overflow, { color: colors.textMuted }]}>
                +{row.domainOverflow} more
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.rowMetrics}>
          {row.sparkline && row.sparkline.length > 0 ? (
            <SparklineBar data={row.sparkline} height={24} />
          ) : null}
          <Text style={[styles.postings, { color: colors.text }]}>
            {row.ngPostingsPerMonth.toLocaleString()}
          </Text>
          <Text style={[styles.postingsLabel, { color: colors.textMuted }]}>
            /mo
          </Text>
          {row.trendPct != null ? (
            <Text
              style={[
                styles.trend,
                {
                  color:
                    row.trendDirection === "down" ? colors.red : colors.green,
                },
              ]}
            >
              {trendGlyph(row.trendDirection)} {Math.abs(row.trendPct)}%
            </Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Sub-line: salary band + gaps + expand affordance */}
      <View style={styles.subLine}>
        {band ? (
          <Text style={[styles.subMeta, { color: colors.textSoft }]}>
            Entry {band}
          </Text>
        ) : null}
        {row.skillsGapCount > 0 ? (
          <Badge
            label={`${row.skillsGapCount} skill gap${
              row.skillsGapCount === 1 ? "" : "s"
            }`}
            variant="warning"
            size="sm"
          />
        ) : (
          <Badge label="No gaps" variant="success" size="sm" />
        )}
        <Text style={[styles.expand, { color: colors.accent }]}>
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
            <Text style={[styles.detailPending, { color: colors.textMuted }]}>
              🚧 Detailed skills, certifications and employers are being
              populated for this programme.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

function DetailGroup({ title, items }: { title: string; items: string[] }) {
  const { colors } = useTheme();
  if (!items.length) return null;
  return (
    <View style={styles.detailGroup}>
      <Text style={[styles.detailTitle, { color: colors.textMuted }]}>
        {title}
      </Text>
      <Text style={[styles.detailItems, { color: colors.text }]}>
        {items.join(" · ")}
      </Text>
    </View>
  );
}

export function ProgrammeDemandTable({
  state,
}: {
  state: DataState<ProgrammeDemandRow[]>;
}) {
  return (
    <ComingSoonPanel
      state={state}
      empty={(rows) => rows.length === 0}
      emptyTitle="No programmes mapped yet"
      emptyBody="Add or verify your programme mix to see its domain demand."
    >
      {(rows) => (
        <View style={styles.table}>
          {rows.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </View>
      )}
    </ComingSoonPanel>
  );
}

export default ProgrammeDemandTable;

const styles = StyleSheet.create({
  table: { gap: Spacing.sm },
  row: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  rowHead: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  rowMain: { flex: 1, gap: Spacing.xs },
  rowTitleLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  programme: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.heavy,
    flexShrink: 1,
  },
  domains: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    alignItems: "center",
  },
  overflow: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  rowMetrics: { alignItems: "flex-end", minWidth: 64 },
  postings: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  postingsLabel: { fontSize: FontSize.xs },
  trend: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, marginTop: 2 },
  subLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  subMeta: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  expand: {
    marginLeft: "auto",
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  detail: {
    borderTopWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    marginTop: 2,
  },
  detailGroup: { gap: 2 },
  detailTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailItems: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  detailPending: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
