/**
 * DegreeSkills - the source-backed learning profile for a programme.
 *
 * The data comes from `jamb_programmes.skills_technical` and
 * `jamb_programmes.skills_transferable`, built from the saved CCMAS/JAMB
 * mapping pipeline. This component keeps the source honest while presenting it
 * as guidance instead of claiming that curriculum outcomes are already-held
 * skills. The current CCMAS/JAMB fields contain learning outcomes, so the
 * student-facing label must say what they will study.
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
const FULL_INITIAL = 5;

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
        Study preview: {preview}
        {total > TEASER_MAX ? ` and more in the programme details` : ""}
      </Text>
    );
  }

  if (!total) {
    return (
      <View style={styles.block}>
        <SectionLabel>What you&apos;ll study</SectionLabel>
        <Text style={[styles.empty, { color: colors.textRole.muted }]}>
          We do not have a verified skills profile for this programme yet.
        </Text>
      </View>
    );
  }

  const shownTech = expanded ? tech : tech.slice(0, FULL_INITIAL);
  const shownSoft = expanded ? soft : soft.slice(0, FULL_INITIAL);
  const hidden = Math.max(0, tech.length - shownTech.length) + Math.max(0, soft.length - shownSoft.length);

  return (
    <View style={styles.block}>
      <SectionLabel>What you&apos;ll learn</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>
        This is a source-backed summary of the programme curriculum. It shows
        the main topics and ways of working you may meet; it does not mean you
        already have these skills.
      </Text>

      {tech.length ? (
        <View style={styles.topicBlock}>
          <Text style={[styles.groupLabel, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>Main study areas</Text>
          <View style={styles.list}>
          {shownTech.map((skill, i) => (
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
          </View>
        </View>
      ) : null}

      {soft.length ? (
        <View style={styles.topicBlock}>
          <Text
            style={[
              styles.groupLabel,
              CompassFonts.bodySemibold,
              { color: colors.textRole.muted },
            ]}
          >
            Ways you&apos;ll work
          </Text>
          <View style={styles.chips}>
            {shownSoft.map((skill, i) => (
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
      {hidden > 0 || expanded ? (
        <TouchableOpacity
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={styles.moreBtn}
        >
          <Text style={[styles.moreText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
            {expanded ? "Show fewer study details" : `See the full study profile (${total})`}
          </Text>
        </TouchableOpacity>
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
  topicBlock: { gap: Spacing.xs, marginTop: Spacing.sm },
  groupLabel: {
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
