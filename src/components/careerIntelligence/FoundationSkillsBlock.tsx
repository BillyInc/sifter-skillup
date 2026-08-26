import React from "react";
import { View, Text, StyleSheet, Linking, type ViewStyle } from "react-native";
import { CompassFonts, useTheme, Spacing, FontSize, FontWeight } from "../../theme";
import type { FoundationSkillEnriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";

export interface FoundationSkillsBlockProps {
  skills: FoundationSkillEnriched[];
  title?: string;
  style?: ViewStyle;
}

/** Shows source-ranked field skills as a suggested route, never as a raw rank. */
export function FoundationSkillsBlock({
  skills,
  title = "Common skills in this domain",
  style,
}: FoundationSkillsBlockProps) {
  const { colors } = useTheme();
  if (!skills?.length) return null;

  const rows = [...skills].sort((a, b) => b.prevalence - a.prevalence);
  const startHere = rows.slice(0, 3);
  const buildNext = rows.slice(3);

  const SkillRows = ({ items }: { items: FoundationSkillEnriched[] }) => (
    <View style={styles.rows}>
      {items.map((skill, index) => {
        const openUri = () => {
          if (skill.uri) Linking.openURL(skill.uri).catch(() => {});
        };
        return (
          <View key={`${skill.skill}-${index}`} style={styles.row}>
            <Text
              style={[styles.skill, { color: colors.textRole.secondary }]}
              numberOfLines={2}
            >
              {skill.skill}
            </Text>
            {skill.uri ? (
              <Text
                onPress={openUri}
                style={[styles.link, { color: colors.accentRole.action }]}
                accessibilityRole="link"
              >
                Open
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>{title === "Common skills in this domain" ? "What to build first" : title}</SectionLabel>
      <Text style={[styles.caption, { color: colors.textRole.muted }]}>
        Start with the suggested foundation, then add the other capabilities as your direction becomes clearer. This is guidance, not a checklist.
      </Text>
      {startHere.length ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Suggested starting point</Text><SkillRows items={startHere} /></View> : null}
      {buildNext.length ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Other domain foundations</Text><SkillRows items={buildNext} /></View> : null}
    </View>
  );
}

export default FoundationSkillsBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  caption: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.45,
    marginTop: -Spacing.xs,
  },
  rows: { gap: Spacing.sm, marginTop: Spacing.xs },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 32,
  },
  group: { gap: Spacing.xs },
  groupLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.8 },
  skill: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.sm * 1.35,
  },
  link: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textDecorationLine: "underline",
  },
});
