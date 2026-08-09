/**
 * DegreeSkills — "what this degree teaches you".
 *
 * One component, used everywhere a programme is shown, so the answer reads the
 * same on a search result, a programme page and a comparison column.
 *
 * The data is `jamb_programmes.skills_technical` / `.skills_transferable`,
 * built by data/career-mapping/_aggregate_skills.py: technical is the union of
 * every CCMAS course's learning outcomes (the differentiating set),
 * transferable is the employability + 21st-century lists (the cross-cutting
 * one). 382 of 420 JAMB names carry a technical list.
 *
 * Two presentations from one source:
 *   - `variant="teaser"` — a single line for list rows and cards.
 *   - `variant="full"`   — the grouped section for a detail screen.
 *
 * Honest when empty: 38 JAMB names have no profile yet. Those render an
 * explicit "not mapped yet" line rather than an empty box that reads as "this
 * degree teaches nothing".
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

/** Technical outcomes are sentence-shaped ("explain the concept of…"); the
 *  first character is lower-case in the source, which reads as a typo in a
 *  bulleted list. */
function sentenceCase(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

/** Transferable skills are short noun phrases and belong in chips. */
function titleish(s: string): string {
  const t = s.trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : t;
}

const TEASER_MAX = 3;
const FULL_INITIAL = 8;

export interface DegreeSkillsProps {
  technical?: string[] | null;
  transferable?: string[] | null;
  variant?: "teaser" | "full";
  /** Overrides the muted colour, for use on an inverted/active card. */
  color?: string;
}

export function DegreeSkills({
  technical,
  transferable,
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
  const total = tech.length + soft.length;

  if (variant === "teaser") {
    if (!total) return null;
    const preview = (tech.length ? tech : soft)
      .slice(0, TEASER_MAX)
      .map(titleish)
      .join(" · ");
    return (
      <Text
        style={[styles.teaser, { color: color ?? colors.textRole.muted }]}
        numberOfLines={2}
      >
        Teaches: {preview}
        {total > TEASER_MAX ? ` +${total - TEASER_MAX} more` : ""}
      </Text>
    );
  }

  if (!total) {
    return (
      <View style={styles.block}>
        <SectionLabel>What this degree teaches</SectionLabel>
        <Text style={[styles.empty, { color: colors.textRole.muted }]}>
          The skills profile for this programme has not been mapped yet.
        </Text>
      </View>
    );
  }

  const shown = expanded ? tech : tech.slice(0, FULL_INITIAL);
  const hidden = tech.length - shown.length;

  return (
    <View style={styles.block}>
      <SectionLabel>What this degree teaches</SectionLabel>

      {tech.length ? (
        <View style={styles.list}>
          {shown.map((skill, i) => (
            <View
              key={`${skill}-${i}`}
              style={[styles.row, { borderTopColor: colors.borderRole.subtle }]}
            >
              <Text style={[styles.bullet, { color: colors.accentRole.action }]}>
                ▪
              </Text>
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
            Transferable skills
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
  list: { gap: 0 },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  bullet: { fontSize: FontSize.xs, lineHeight: FontSize.sm * 1.5 },
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
