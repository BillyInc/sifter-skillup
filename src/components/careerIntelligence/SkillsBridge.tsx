/**
 * SkillsBridge — the two-layer (plus prerequisite) bridge-skills model.
 *
 * Per CCMAS v3.0 skills are layered: domain-level bridge skills (the set grows
 * with a looser domain match) then role-level bridge skills. Adjacent domains
 * add a "foundations first" sub-layer of conceptual prerequisites that must be
 * acquired before the role skills become relevant — shown distinctly (amber
 * left-border) and only when present. Each skill renders as a pill: a muted
 * "✓ covered" style when the programme already teaches it, or a gap otherwise.
 */
import React from "react";
import { View, Text, StyleSheet, type ViewStyle } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  getDomainBadge,
} from "../../theme";
import type { BridgeSkill, DomainMatchType } from "../../types/career";
import { SectionHeader } from "../ui";

export interface SkillsBridgeProps {
  /** Domain-level entry skills; size scales with the domain match type. */
  domainBridgeSkills: BridgeSkill[];
  /** Role-level ESCO essentials the programme doesn't cover. */
  roleBridgeSkills?: BridgeSkill[];
  /** Adjacent-only foundations; rendered first and only when non-empty. */
  conceptualPrerequisites?: BridgeSkill[];
  /** Drives the explanatory gap-size caption when provided. */
  matchType?: DomainMatchType;
  style?: ViewStyle;
}

const GAP_CAPTION: Record<DomainMatchType, string> = {
  direct:
    "Direct match — only a small bridge of skills stands between you and this domain.",
  functional:
    "Functional match — a moderate bridge of skills to cross into this domain.",
  adjacent:
    "Adjacent match — a larger bridge; learn the foundations first, then build up.",
};

function SkillPill({ skill }: { skill: BridgeSkill }) {
  const { colors } = useTheme();
  const covered = skill.covered === true;

  return (
    <View
      style={[
        styles.pill,
        covered
          ? { backgroundColor: colors.greenSoft, borderColor: colors.green }
          : { backgroundColor: colors.bgSecondary, borderColor: colors.border },
      ]}
    >
      <Text
        style={[
          styles.pillText,
          { color: covered ? colors.green : colors.textSoft },
        ]}
        numberOfLines={1}
      >
        {covered ? "✓ " : ""}
        {skill.name}
      </Text>
    </View>
  );
}

function SkillSection({
  title,
  skills,
  accentColor,
}: {
  title: string;
  skills: BridgeSkill[];
  accentColor?: string;
}) {
  const { colors } = useTheme();
  if (!skills.length) return null;

  return (
    <View
      style={[
        styles.section,
        accentColor
          ? {
              borderLeftWidth: 3,
              borderLeftColor: accentColor,
              paddingLeft: Spacing.md,
              backgroundColor: colors.bgSecondary,
              borderRadius: Radius.md,
              paddingVertical: Spacing.sm,
            }
          : null,
      ]}
    >
      <SectionHeader title={title} />
      <View style={styles.pillWrap}>
        {skills.map((s, i) => (
          <SkillPill key={`${s.name}-${i}`} skill={s} />
        ))}
      </View>
    </View>
  );
}

export function SkillsBridge({
  domainBridgeSkills,
  roleBridgeSkills,
  conceptualPrerequisites,
  matchType,
  style,
}: SkillsBridgeProps) {
  const { colors, isDark } = useTheme();
  const hasPrereqs = !!conceptualPrerequisites?.length;
  const prereqAccent = getDomainBadge("adjacent", isDark).text;

  return (
    <View style={[styles.container, style]}>
      {matchType ? (
        <Text style={[styles.caption, { color: colors.textMuted }]}>
          {GAP_CAPTION[matchType]}
        </Text>
      ) : null}

      {hasPrereqs ? (
        <SkillSection
          title="Foundations to learn first"
          skills={conceptualPrerequisites as BridgeSkill[]}
          accentColor={prereqAccent}
        />
      ) : null}

      <SkillSection title="Domain bridge skills" skills={domainBridgeSkills} />

      {roleBridgeSkills?.length ? (
        <SkillSection title="Role-specific skills" skills={roleBridgeSkills} />
      ) : null}
    </View>
  );
}

export default SkillsBridge;

const styles = StyleSheet.create({
  container: {
    gap: Spacing.lg,
  },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.5,
  },
  section: {
    gap: Spacing.sm,
  },
  pillWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  pill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
});
