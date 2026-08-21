/**
 * DegreeSkills - "what this programme helps you build".
 *
 * The data comes from `jamb_programmes.skills_technical` and
 * `jamb_programmes.skills_transferable`, built from the saved CCMAS/JAMB
 * mapping pipeline. This component keeps the source honest while presenting it
 * as guidance instead of a raw technical dump.
 */
import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
} from "@/theme";
import { SectionLabel } from "./RedesignPrimitives";

function sentenceCase(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

function titleish(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

const TEASER_MAX = 3;
const FULL_INITIAL = 8;

export interface DegreeSkillsProps {
  technical?: string[] | null;
  transferable?: string[] | null;
  total?: number | null;
  variant?: "teaser" | "full";
  color?: string;
}

export function DegreeSkills({
  technical,
  transferable,
  total: totalProp,
  variant = "full",
  color,
}: DegreeSkillsProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const tech = useMemo(
    () => (technical ?? []).filter((s) => s && s.trim()),
    [technical],
  );
  const soft = useMemo(
    () => (transferable ?? []).filter((s) => s && s.trim()),
    [transferable],
  );
  const shipped = tech.length + soft.length;
  const total = Math.max(shipped, totalProp ?? 0);

  if (variant === "teaser") {
    if (!total) return null;
    const preview = (tech.length ? tech : soft)
      .slice(0, TEASER_MAX)
      .map(titleish)
      .join(" / ");
    return (
      <Text
        style={[styles.teaser, { color: color ?? colors.textRole.muted }]}
        numberOfLines={2}
      >
        You may study: {preview}
        {total > TEASER_MAX ? ` +${total - TEASER_MAX} more` : ""}
      </Text>
    );
  }

  if (!total) {
    return (
      <View style={styles.block}>
        <SectionLabel>What this programme helps you build</SectionLabel>
        <Text style={[styles.empty, { color: colors.textRole.muted }]}>
          We do not have a verified skills profile for this programme yet.
        </Text>
      </View>
    );
  }

  const shown = expanded ? tech : tech.slice(0, FULL_INITIAL);
  const hidden = tech.length - shown.length;

  return (
    <View style={styles.block}>
      <SectionLabel>What this programme helps you build</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>
        These are source-backed learning outcomes connected to this programme.
        They describe the direction of study, not a promise of proficiency.
      </Text>

      {tech.length ? (
        <View style={styles.list}>
          {shown.map((skill, i) => (
            <View
              key={`${skill}-${i}`}
              style={[styles.row, { borderTopColor: colors.borderRole.subtle }]}
            >
              <Text style={[styles.bullet, { color: colors.accentRole.action }]}>•</Text>
              <Text style={[styles.rowText, { color: colors.textRole.primary }]}>
                {sentenceCase(skill)}
              </Text>
            </View>
          ))}
          {hidden > 0 || expanded ? (
            <TouchableOpacity
              onPress={() => setExpanded((v) => !v)}
              activeOpacity={0.75}
              accessibilityRole="button"
              style={styles.moreBtn}
            >
              <Text
                style={[
                  styles.moreText,
                  CompassFonts.bodySemibold,
                  { color: colors.accentRole.action },
                ]}
              >
                {expanded ? "Show fewer" : `Show all ${tech.length}`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {soft.length ? (
        <View style={styles.softBlock}>
          <Text
            style={[
              styles.softLabel,
              CompassFonts.bodySemibold,
              { color: colors.textRole.muted },
            ]}
          >
            Skills useful beyond this programme
          </Text>
          <View style={styles.chips}>
            {soft.map((skill, i) => (
              <View
                key={`${skill}-${i}`}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surface.subtle,
                    borderColor: colors.borderRole.subtle,
                  },
                ]}
              >
                <Text
                  style={[styles.chipText, { color: colors.textRole.secondary }]}
                  numberOfLines={1}
                >
                  {titleish(skill)}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

export default DegreeSkills;

const styles = StyleSheet.create({
  block: { gap: Spacing.sm },
  teaser: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    marginTop: 2,
  },
  empty: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  list: { gap: 0 },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  bullet: {
    width: 38,
    fontSize: FontSize.xs,
    lineHeight: FontSize.sm * 1.5,
    ...CompassFonts.bodySemibold,
  },
  rowText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  moreBtn: {
    alignSelf: "flex-start",
    minHeight: 34,
    justifyContent: "center",
    paddingTop: Spacing.xs,
  },
  moreText: { fontSize: FontSize.sm },
  softBlock: { gap: Spacing.xs, marginTop: Spacing.sm },
  softLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: "center",
    maxWidth: "100%",
  },
  chipText: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
});
