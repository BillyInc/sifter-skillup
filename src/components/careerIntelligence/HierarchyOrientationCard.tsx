import React from "react";
import { Feather } from "@expo/vector-icons";
import { Text, View, StyleSheet } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { DomainStudentOrientation } from "@/types/career";

export interface HierarchyOrientationCardProps {
  level: "area" | "role";
  title: string;
  parentLabel: string;
  summary?: string | null;
  workContext?: Array<{ name: string; frequency?: string; share?: number }>;
  activities?: string[];
  orientation?: DomainStudentOrientation;
}

/** Shared, source-grounded orientation for subgroup and role routes. */
export function HierarchyOrientationCard({
  level,
  title,
  parentLabel,
  summary,
  activities = [],
  orientation,
}: HierarchyOrientationCardProps) {
  const { colors } = useTheme();
  const cleanActivities = Array.from(new Set(activities.map((item) => item.trim()).filter(Boolean))).slice(0, 4);
  const questions = Array.from(new Set((orientation?.questions ?? []).map((item) => item.trim()).filter(Boolean))).slice(0, 4);
  const outputs = Array.from(new Set((orientation?.outputs ?? []).map((item) => item.trim()).filter(Boolean))).slice(0, 4);
  const workSequence = Array.from(new Set((orientation?.howWorkHappens ?? []).map((item) => item.trim()).filter(Boolean))).slice(0, 5);
  const hasDetails = Boolean(cleanActivities.length || questions.length || outputs.length || workSequence.length);
  const area = level === "area";

  return (
    <View style={[styles.card, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
      <View style={styles.heading}>
        <View style={[styles.icon, { backgroundColor: colors.accentRole.action + "18" }]}>
          <Feather name={area ? "grid" : "user"} size={18} color={colors.accentRole.action} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={[styles.label, { color: colors.textRole.muted }]}>{area ? "UNDERSTAND THIS AREA" : "UNDERSTAND THIS ROLE"}</Text>
          <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>
        </View>
      </View>

      <Text style={[styles.copy, { color: colors.textRole.secondary }]}>
        {summary || `${title} is a focused route inside ${parentLabel}. Open the learning path below to see the capabilities, tools and qualifications recorded for it.`}
      </Text>
      {area ? <Text style={[styles.note, { color: colors.textRole.muted }]}>This area keeps the foundation of {parentLabel} and adds a more focused way to study or work. Roles belong inside this area.</Text> : null}

      {orientation?.whatItStudies ? <Subsection title={area ? "What this area focuses on" : "What this role focuses on"} colors={colors}><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{orientation.whatItStudies}</Text></Subsection> : null}
      {orientation?.whatPeopleDo ? <Subsection title={area ? "What people do in this area" : "What people do in this role"} colors={colors}><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{orientation.whatPeopleDo}</Text></Subsection> : null}

      {questions.length ? <Subsection title="Questions this path can help answer" colors={colors}>{questions.map((question) => <View key={question} style={styles.row}><Feather name="help-circle" size={14} color={colors.accentRole.action} /><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{question}</Text></View>)}</Subsection> : null}
      {outputs.length ? <Subsection title="What the work can produce" colors={colors}>{outputs.map((output) => <View key={output} style={styles.row}><Feather name="file-text" size={14} color={colors.accentRole.action} /><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{output}</Text></View>)}</Subsection> : null}
      {workSequence.length ? <Subsection title="How the work usually happens" colors={colors}>{workSequence.map((step, index) => <View key={step} style={styles.row}><View style={[styles.stepNumber, { backgroundColor: colors.accentRole.action }]}><Text style={styles.stepNumberText}>{index + 1}</Text></View><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{step}</Text></View>)}</Subsection> : null}
      {cleanActivities.length ? <Subsection title="Work activities recorded for this role" colors={colors}>{cleanActivities.map((activity) => <View key={activity} style={styles.row}><Feather name="check" size={14} color={colors.accentRole.action} /><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{activity}</Text></View>)}</Subsection> : null}
      {orientation?.whereProgrammeFits ? <View style={styles.highlight}><Text style={[styles.subheading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How it connects to your programme</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{orientation.whereProgrammeFits}</Text></View> : null}
      {orientation?.decisionGuide ? <Subsection title="Could this path suit you?" colors={colors}><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{orientation.decisionGuide}</Text></Subsection> : null}
      {!hasDetails && !orientation?.whatItStudies && !orientation?.whatPeopleDo && level === "role" ? <Text style={[styles.note, { color: colors.textRole.muted }]}>The role's attached work evidence will appear below when it is available.</Text> : null}
      {orientation?.sourceNote ? <Text style={[styles.note, { color: colors.textRole.muted }]}>Reference basis: {orientation.sourceNote}</Text> : null}
    </View>
  );
}

function Subsection({ title, colors, children }: { title: string; colors: ReturnType<typeof useTheme>["colors"]; children: React.ReactNode }) {
  return <View style={styles.subsection}><Text style={[styles.subheading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  heading: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  icon: { width: 38, height: 38, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  headingCopy: { flex: 1, gap: 2 },
  label: { fontSize: FontSize.xs, letterSpacing: 0.75, fontWeight: "800" },
  title: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.3 },
  copy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  subsection: { gap: Spacing.xs, paddingTop: Spacing.xs },
  subheading: { fontSize: FontSize.sm },
  row: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  stepNumber: { width: 22, height: 22, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  stepNumberText: { color: "#FFFFFF", fontSize: FontSize.xs, fontWeight: "800" },
  highlight: { borderLeftWidth: 3, paddingLeft: Spacing.sm, gap: Spacing.xs },
});

export default HierarchyOrientationCard;
