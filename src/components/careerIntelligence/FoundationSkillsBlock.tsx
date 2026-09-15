import React, { useState } from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, type ViewStyle } from "react-native";
import { CompassFonts, useTheme, Spacing, FontSize, FontWeight } from "../../theme";
import type { CareerLearningResource, FoundationSkillEnriched } from "../../types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { hasInternetConnection, OFFLINE_LINK_NOTICE } from "@/lib/networkState";

export interface FoundationSkillsBlockProps {
  skills: FoundationSkillEnriched[];
  resources?: CareerLearningResource[];
  title?: string;
  style?: ViewStyle;
}

/** Shows source-ranked field skills as a suggested route, never as a raw rank. */
export function FoundationSkillsBlock({
  skills,
  resources,
  title = "Common skills in this domain",
  style,
}: FoundationSkillsBlockProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  if (!skills?.length) return null;

  const hasStages = skills.some((skill) => Boolean(skill.stage));
  const rows = [...skills].sort((a, b) => {
    if (hasStages) {
      const order = { start_here: 0, build_next: 1, choose_area: 2, prepare_for_role: 3 } as const;
      return (order[a.stage ?? "build_next"] ?? 1) - (order[b.stage ?? "build_next"] ?? 1);
    }
    return (b.prevalence ?? 0) - (a.prevalence ?? 0);
  });
  const startHere = hasStages ? rows.filter((item) => item.stage === "start_here") : rows.slice(0, 3);
  const buildNext = hasStages ? rows.filter((item) => item.stage === "build_next") : rows.slice(3);
  const chooseArea = hasStages ? rows.filter((item) => item.stage === "choose_area") : [];

  const SkillRows = ({ items }: { items: FoundationSkillEnriched[] }) => (
    <View style={styles.rows}>
      {items.map((skill, index) => {
        const resource = resources?.find((item) =>
          (item.resourceType === "skill_learning" || item.resourceType === "skill_reference")
          && item.targetName.trim().toLowerCase() === skill.skill.trim().toLowerCase(),
        );
        const url = skill.uri || resource?.url;
        const openUri = async () => {
          if (!url) return;
          setNotice(null);
          if (!(await hasInternetConnection())) {
            setNotice(OFFLINE_LINK_NOTICE);
            return;
          }
          const opened = await Linking.openURL(url).then(() => true).catch(() => false);
          if (!opened) setNotice("This source could not be opened. Try again when your connection is stable.");
        };
        return (
          <View key={`${skill.skill}-${index}`} style={styles.row}>
            <Text
              style={[styles.skill, { color: colors.textRole.secondary }]}
              numberOfLines={2}
            >
              {skill.skill}
            </Text>
            <Text style={[styles.note, { color: colors.textRole.muted }]} numberOfLines={2}>
              {resource?.description || skill.priorityReason || "Source-backed foundation item."}
            </Text>
            {skill.evidenceNote ? <Text style={[styles.note, { color: colors.textRole.muted }]} numberOfLines={3}>{skill.evidenceNote}</Text> : null}
            {url ? (
              <Text
                onPress={() => { void openUri(); }}
                style={[styles.link, { color: colors.accentRole.action }]}
                accessibilityRole="link"
              >
                Open
              </Text>
            ) : <Text style={[styles.note, { color: colors.textRole.muted }]}>No verified learning link attached yet.</Text>}
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
      {startHere.length ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Start here</Text><SkillRows items={startHere} /></View> : null}
      {buildNext.length && (expanded || !hasStages) ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Build next</Text><SkillRows items={buildNext} /></View> : null}
      {chooseArea.length && expanded ? <View style={styles.group}><Text style={[styles.groupLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Choose an area</Text><SkillRows items={chooseArea} /></View> : null}
      {buildNext.length || chooseArea.length ? (
        <TouchableOpacity
          onPress={() => setExpanded((value) => !value)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          style={styles.moreButton}
        >
          <Text style={[styles.moreText, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
            {expanded ? "Show fewer learning stages" : `See the full learning sequence`}
          </Text>
        </TouchableOpacity>
      ) : null}
      {notice ? <Text style={[styles.caption, { color: colors.textRole.muted }]}>{notice}</Text> : null}
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
    flexDirection: "column",
    alignItems: "stretch",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  group: { gap: Spacing.xs },
  groupLabel: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.8 },
  skill: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.sm * 1.35,
  },
  link: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textDecorationLine: "underline",
  },
  moreButton: {
    alignSelf: "flex-start",
    minHeight: 34,
    justifyContent: "center",
    paddingTop: Spacing.xs,
  },
  moreText: { fontSize: FontSize.sm },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
});
