import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import type { ProgrammeDomainConnection } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";

/** Keeps the source-reviewed programme themes and outcomes available as
 * inherited context at the domain handoff without turning them into new
 * learning requirements or exposing university-specific course codes. */
export function ProgrammeCurriculumCarryForward({ connection, fieldName = "this field" }: { connection: ProgrammeDomainConnection; fieldName?: string }) {
  const { colors } = useTheme();
  const [expandedThemes, setExpandedThemes] = React.useState<Record<string, boolean>>({});
  const themes = connection.programmeCurriculumThemes ?? [];
  if (!themes.length) return null;

  return (
    <View style={[styles.container, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={styles.headingBlock}>
        <SectionLabel>Programme learning carried into this field</SectionLabel>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>
          These are themes and outcomes from your selected programme. They are shown as learning you have covered or are studying—not as new domain requirements. The domain path below explains what to build next.
        </Text>
      </View>
      <View style={styles.themeList}>
        {themes.map((theme) => {
          const themeExpanded = Boolean(expandedThemes[theme.themeKey]);
          const matchedOutcomeIds = new Set(theme.matchedOutcomeIds ?? []);
          const matchedOutcomes = theme.programmeOutcomes.filter((outcome) => outcome.outcomeId && matchedOutcomeIds.has(outcome.outcomeId));
          const matchedOutcomeCourseTitles = new Set(matchedOutcomes.map((outcome) => outcome.courseTitle?.trim().toLocaleLowerCase()).filter(Boolean));
          const matchedCourseTitles = Array.from(new Set((theme.matchedCourseAnchors ?? [])
            .map((course) => course.courseTitle?.trim())
            .filter((title): title is string => typeof title === "string" && title.length > 0 && !matchedOutcomeCourseTitles.has(title.toLocaleLowerCase()))));
          const hasSpecificTransfer = theme.directTransferEvidenceStatus === "matched";
          const otherOutcomes = hasSpecificTransfer
            ? theme.programmeOutcomes.filter((outcome) => !outcome.outcomeId || !matchedOutcomeIds.has(outcome.outcomeId))
            : theme.programmeOutcomes;

          return (
            <View key={theme.themeKey} style={[styles.theme, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
              <Text style={[styles.themeTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{theme.title}</Text>
              {theme.narration ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{theme.narration}</Text> : null}
              <View style={styles.detail}>
                <Text style={[styles.detailTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                  {hasSpecificTransfer ? `What carries into ${fieldName}` : `How this theme relates to ${fieldName}`}
                </Text>
                {hasSpecificTransfer ? (
                  <>
                    <Text style={[styles.copy, { color: colors.textRole.secondary }]}>
                      The reviewed programme-to-field evidence links this theme to {fieldName}. That gives you a starting point from your studies; it does not mean your programme covers every task or later learning option in the field.
                    </Text>
                    {matchedCourseTitles.length ? <Text style={[styles.courseTitle, { color: colors.textRole.primary }]}>Course evidence: {matchedCourseTitles.join("; ")}</Text> : null}
                    {matchedOutcomes.map((outcome, index) => (
                      <View key={outcome.outcomeId ?? `${theme.themeKey}:matched:${index}`} style={styles.outcome}>
                        {outcome.courseTitle ? <Text style={[styles.courseTitle, { color: colors.textRole.primary }]}>{outcome.courseTitle}</Text> : null}
                        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{outcome.studentText}</Text>
                      </View>
                    ))}
                    {!matchedCourseTitles.length && !matchedOutcomes.length ? <Text style={[styles.copy, { color: colors.textRole.muted }]}>The route records a theme-level connection, but does not identify a particular course outcome as the transfer evidence.</Text> : null}
                  </>
                ) : (
                  <Text style={[styles.copy, { color: colors.textRole.secondary }]}>
                    This remains part of what you study in {connection.programmeName || "your selected programme"}. The reviewed evidence does not point to a specific course outcome here that explains how this theme connects to {fieldName}, so we show it as programme context—not as proof that you already have a particular field skill or as an extra domain requirement.
                  </Text>
                )}
              </View>
              <View style={styles.detail}>
                <Text style={[styles.detailTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{hasSpecificTransfer ? "Other programme outcomes in this theme" : "Programme outcomes in this theme"}</Text>
                {themeExpanded ? (
                  otherOutcomes.length ? otherOutcomes.map((outcome, index) => (
                    <View key={outcome.outcomeId || `${theme.themeKey}:outcome:${index}`} style={styles.outcome}>
                      {outcome.courseTitle ? <Text style={[styles.courseTitle, { color: colors.textRole.primary }]}>{outcome.courseTitle}</Text> : null}
                      <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{outcome.studentText}</Text>
                    </View>
                  )) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>{hasSpecificTransfer ? "No other reviewed course outcomes are attached to this theme." : "No learner-friendly outcomes are attached to this theme in the current programme record."}</Text>
                ) : (
                  <Text style={[styles.copy, { color: colors.textRole.muted }]}>{otherOutcomes.length === 0 ? "No other reviewed course outcomes are attached to this theme." : `${otherOutcomes.length} additional reviewed course outcome${otherOutcomes.length === 1 ? " is" : "s are"} available in this theme.`}</Text>
                )}
                {otherOutcomes.length ? <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`${themeExpanded ? "Hide" : "See"} programme outcomes for ${theme.title}`}
                    accessibilityState={{ expanded: themeExpanded }}
                    onPress={() => setExpandedThemes((current) => ({ ...current, [theme.themeKey]: !themeExpanded }))}
                    style={styles.toggle}
                  >
                    <Text style={[styles.toggleText, { color: colors.accentRole.action }]}>{themeExpanded ? "Hide other outcomes" : `See ${otherOutcomes.length} other outcome${otherOutcomes.length === 1 ? "" : "s"} in ${theme.title}`}</Text>
                  </TouchableOpacity> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/**
 * At area/role stops, carry only the reviewed programme outcomes tied to the
 * programme→domain connection. This is explanatory context, not a claim that
 * Sociology directly teaches every area or role capability.
 */
export function ProgrammeOutcomeBridge({
  connection,
  nextLayer,
}: {
  connection: ProgrammeDomainConnection;
  nextLayer: "area" | "role";
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = React.useState(false);
  const outcomes = connection.curriculumOutcomes ?? [];
  if (!connection.transferableLearningNarrative?.trim() && !outcomes.length) return null;
  const visibleOutcomes = expanded ? outcomes : outcomes.slice(0, 3);

  return (
    <View style={[styles.container, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={styles.headingBlock}>
        <SectionLabel>{`Programme learning context for this ${nextLayer}`}</SectionLabel>
        {connection.transferableLearningNarrative ? (
          <Text style={[styles.copy, { color: colors.textRole.secondary }]}>
            {connection.transferableLearningNarrative}
          </Text>
        ) : null}
        <Text style={[styles.copy, { color: colors.textRole.muted }]}>
          This evidence shows what your programme has covered that can help you understand the wider field. It does not mean the programme teaches every area or role task shown next.
        </Text>
      </View>
      {outcomes.length ? (
        <View style={styles.theme}>
          <Text style={[styles.detailTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Programme outcomes connected to this field
          </Text>
          {visibleOutcomes.map((outcome, index) => (
            <View key={outcome.outcomeId ?? `${outcome.courseTitle ?? "outcome"}:${index}`} style={styles.outcome}>
              {outcome.courseTitle ? <Text style={[styles.courseTitle, { color: colors.textRole.primary }]}>{outcome.courseTitle}</Text> : null}
              <Text style={[styles.copy, { color: colors.textRole.secondary }]}>{outcome.studentText}</Text>
            </View>
          ))}
          {outcomes.length > 3 ? (
            <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={styles.toggle}>
              <Text style={[styles.toggleText, { color: colors.accentRole.action }]}>{expanded ? "Show fewer outcomes" : `See all ${outcomes.length} connected outcomes`}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  headingBlock: { gap: Spacing.xs },
  themeList: { gap: Spacing.sm },
  theme: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  themeTitle: { fontSize: 20, lineHeight: 27 },
  detail: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "rgba(128,128,128,0.35)", paddingTop: Spacing.sm, gap: Spacing.sm },
  detailTitle: { fontSize: 18, lineHeight: 25 },
  outcome: { gap: 2, paddingLeft: Spacing.sm },
  courseTitle: { fontSize: 16, lineHeight: 24, fontWeight: "700" },
  copy: { fontSize: 16, lineHeight: 24 },
  toggle: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center" },
  toggleText: { fontSize: 16, lineHeight: 23, ...CompassFonts.bodySemibold },
});

export default ProgrammeCurriculumCarryForward;
