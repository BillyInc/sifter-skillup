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

/** Shows source-ranked field skills as learning priorities, not raw percentages. */
export function FoundationSkillsBlock({
  skills,
  title = "Common skills in this field",
  style,
}: FoundationSkillsBlockProps) {
  const { colors } = useTheme();
  if (!skills?.length) return null;

  const rows = [...skills].sort((a, b) => b.prevalence - a.prevalence);

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>{title === "Common skills in this field" ? "What to build first" : title}</SectionLabel>
      <Text style={[styles.caption, { color: colors.textRole.muted }]}>
        Start with the first skills, then add the others as your direction becomes clearer.
      </Text>
      <View style={styles.rows}>
        {rows.map((skill, index) => {
          const openUri = () => {
            if (skill.uri) Linking.openURL(skill.uri).catch(() => {});
          };
          return (
            <View key={`${skill.skill}-${index}`} style={styles.row}>
              <Text style={[styles.rank, { color: colors.accentRole.action }, CompassFonts.data]}>
                {index + 1}
              </Text>
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
  rank: {
    width: 22,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textAlign: "center",
  },
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
