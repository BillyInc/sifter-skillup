/**
 * FoundationSkillsBlock — a domain's COMMON skills, with honest prevalence.
 *
 * These are the skills that recur across a field's roles — common, NOT
 * universal. Each row shows the skill, a slim prevalence bar, and a right-
 * aligned "NN%" (share of the field's roles whose essentials include it). A 34%
 * skill still appears AND reads 34%, so common-but-not-universal skills aren't
 * hidden or over-claimed. When a skill has an ESCO `uri`, a small "↗" opens its
 * canonical definition. Renders nothing when there are no skills.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  type ViewStyle,
} from "react-native";
import { CompassFonts, useTheme, Spacing, FontSize, FontWeight } from "../../theme";
import type { FoundationSkillEnriched } from "../../types/career";
import { ProgressBar } from "../ui";
import { SectionLabel } from "./RedesignPrimitives";

export interface FoundationSkillsBlockProps {
  skills: FoundationSkillEnriched[];
  title?: string;
  style?: ViewStyle;
}

export function FoundationSkillsBlock({
  skills,
  title = "Common skills in this field",
  style,
}: FoundationSkillsBlockProps) {
  const { colors } = useTheme();
  if (!skills?.length) return null;

  // Assume already sorted, but be safe (prevalence desc).
  const rows = [...skills].sort((a, b) => b.prevalence - a.prevalence);

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>{title}</SectionLabel>
      <Text style={[styles.caption, { color: colors.textRole.muted }]}>
        Common across roles here — not required for every one.
      </Text>
      <View style={styles.rows}>
        {rows.map((s, i) => {
          const pct = Math.round(s.prevalence * 100);
          const openUri = () => {
            if (s.uri) Linking.openURL(s.uri).catch(() => {});
          };
          return (
            <View key={`${s.skill}-${i}`} style={styles.row}>
              <View style={styles.rowHead}>
                <Text
                  style={[styles.skill, { color: colors.textRole.secondary }]}
                  numberOfLines={1}
                >
                  {s.skill}
                </Text>
                {s.uri ? (
                  <Text
                    onPress={openUri}
                    style={[styles.link, { color: colors.accentRole.action }]}
                    accessibilityRole="link"
                  >
                    ↗
                  </Text>
                ) : null}
                <Text style={[styles.pct, CompassFonts.data, { color: colors.textRole.muted }]}>
                  {pct}%
                </Text>
              </View>
              <ProgressBar
                progress={s.prevalence}
                color={colors.accentRole.action}
                trackColor={colors.surface.subtle}
                height={5}
              />
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
    marginTop: -Spacing.xs,
  },
  rows: { gap: Spacing.md, marginTop: Spacing.xs },
  row: { gap: Spacing.xs },
  rowHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  skill: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  link: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  pct: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    fontVariant: ["tabular-nums"],
  },
});
