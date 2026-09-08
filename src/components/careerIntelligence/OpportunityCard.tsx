/**
 * OpportunityCard — an employment opportunity (internship → contract).
 *
 * Scope: employment only. There is no NYSC/PPA, IT placement or apprenticeship.
 * Shows organisation, type, scope, work mode, salary, application window,
 * visa route, institution-eligibility chips, a likelihood dot, and (when present)
 * a DataSourceBadge for provenance. `subscribeSlot` is rendered top-right for a
 * SubscribeButton dropped in later.
 */
import React, { type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  type ViewStyle,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../theme";
import type {
  Opportunity,
  OpportunityType,
  OpportunityScope,
  WorkMode,
  Likelihood,
  InstitutionType,
} from "../../types/career";
import { DataSourceBadge } from "./DataSourceBadge";
import { PressLift } from "../animations/PressLift";

export interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress?: () => void;
  /** A slot for a SubscribeButton (rendered top-right when provided). */
  subscribeSlot?: ReactNode;
  style?: ViewStyle;
}

const TYPE_LABEL: Record<OpportunityType, string> = {
  internship: "Internship",
  graduate_trainee: "Graduate Trainee",
  entry_level: "Entry-level",
  fellowship: "Fellowship",
  contract: "Contract",
  scholarship: "Scholarship",
};

const SCOPE_META: Record<OpportunityScope, { glyph: string; label: string }> = {
  local: { glyph: "🇳🇬", label: "Local" },
  global: { glyph: "✈️", label: "Global" },
  remote: { glyph: "💻", label: "Remote" },
};

const WORK_MODE_LABEL: Record<WorkMode, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
  field: "Field",
  shift: "Shift",
};

const INSTITUTION_LABEL: Record<InstitutionType, string> = {
  university: "University",
  college_of_education: "NCE",
  polytechnic: "Polytechnic",
  monotechnic: "Monotechnic",
  college_of_health: "College of Health",
  technical_college: "Technical College",
};

/** Compact naira formatting: 45000 → ₦45k, 1200000 → ₦1.2m. */
function formatNgn(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `₦${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `₦${value}`;
}

function salaryLabel(min?: number, max?: number): string | null {
  if (min != null && max != null) return `${formatNgn(min)}–${formatNgn(max)}`;
  if (min != null) return `${formatNgn(min)}+`;
  if (max != null) return `Up to ${formatNgn(max)}`;
  return null;
}

export function OpportunityCard({
  opportunity,
  onPress,
  subscribeSlot,
  style,
}: OpportunityCardProps) {
  const { colors } = useTheme();
  const o = opportunity;

  const likelihoodColor = (l?: Likelihood): string => {
    if (l === "high") return colors.green;
    if (l === "medium") return colors.gold;
    return colors.textMuted;
  };

  const scope = SCOPE_META[o.scope];
  const orgMeta = [o.organisation.sector, o.organisation.country]
    .filter(Boolean)
    .join(" · ");
  const salary = salaryLabel(o.salaryNgnMin, o.salaryNgnMax);
  const windowLabel = o.applicationWindow ?? o.applicationDeadline ?? null;
  const meta = o.meta;

  return (
    <PressLift
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        style,
      ]}
    >
      {/* Header: title block + subscribe slot */}
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={2}
          >
            {o.title}
          </Text>
          <Text
            style={[styles.org, { color: colors.textSoft }]}
            numberOfLines={1}
          >
            {o.organisation.name}
          </Text>
          {orgMeta ? (
            <Text
              style={[styles.orgMeta, { color: colors.textMuted }]}
              numberOfLines={1}
            >
              {orgMeta}
            </Text>
          ) : null}
        </View>
        <View style={styles.headerRight}>
          {subscribeSlot ?? null}
          <View style={styles.likelihoodWrap}>
            <View
              style={[
                styles.dot,
                { backgroundColor: likelihoodColor(o.likelihood) },
              ]}
            />
          </View>
        </View>
      </View>

      {/* Badge row: type, scope, work mode */}
      <View style={styles.badgeRow}>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.accentSoft, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.text }]}>
            {TYPE_LABEL[o.type]}
          </Text>
        </View>
        <View
          style={[
            styles.badge,
            { backgroundColor: colors.bgSecondary, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.badgeText, { color: colors.textSoft }]}>
            {scope.glyph} {scope.label}
          </Text>
        </View>
        {o.workMode ? (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.textSoft }]}>
              {WORK_MODE_LABEL[o.workMode]}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Detail rows */}
      <View style={styles.detailRows}>
        {salary ? (
          <Text
            style={[styles.detail, { color: colors.text }]}
            numberOfLines={1}
          >
            💰 {salary}
            <Text style={{ color: colors.textMuted }}> / month</Text>
          </Text>
        ) : null}
        {windowLabel ? (
          <Text
            style={[styles.detail, { color: colors.textSoft }]}
            numberOfLines={1}
          >
            🗓️ {windowLabel}
          </Text>
        ) : null}
        {o.visaRoute ? (
          <Text
            style={[styles.detail, { color: colors.textSoft }]}
            numberOfLines={1}
          >
            🛂 {o.visaRoute}
          </Text>
        ) : null}
      </View>

      {/* Eligible institution chips */}
      {o.eligibleInstitutionTypes.length ? (
        <View style={styles.chipRow}>
          {o.eligibleInstitutionTypes.map((t) => (
            <View
              key={t}
              style={[
                styles.chip,
                {
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.textMuted }]}>
                {INSTITUTION_LABEL[t]}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Provenance */}
      {meta ? (
        <DataSourceBadge
          verification={meta.verification}
          date={meta.dataDate}
          source={meta.sources?.[0]}
          style={styles.provenance}
        />
      ) : null}
    </PressLift>
  );
}

export default OpportunityCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.xs,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  headerText: { flex: 1, gap: 2 },
  headerRight: { alignItems: "flex-end", gap: Spacing.sm },
  likelihoodWrap: {
    minWidth: 12,
    minHeight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: { width: 10, height: 10, borderRadius: Radius.full },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.heavy,
    lineHeight: FontSize.lg * 1.25,
  },
  org: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  orgMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  badge: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  detailRows: { gap: Spacing.xs },
  detail: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  provenance: { marginTop: Spacing.xs },
});
