import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import { adminNav, type Nav } from "@/lib/adminNav";
import type { AdminAudience } from "@/lib/adminAudience";

const WORKFLOW_STEPS: readonly string[] = [
  "Start with the student's subjects or programme idea.",
  "Compare universities with the relevant programme.",
  "Explain requirements and connected domains together.",
];

export function AdminExploreIntro({
  audience,
}: {
  audience: AdminAudience;
  providerSessionOnly?: boolean;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const advisory = audience !== "university";

  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.eyebrow, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>
        {advisory ? "STUDENT GUIDANCE" : "UNIVERSITY PLANNING"}
      </Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>
        {advisory
          ? "Search the programme and university catalogue with a student. Use the results to explain subject fit, requirements and connected career domains."
          : "Search the shared programme and domain catalogue. Use the planning actions below for your institution's programme mix, domain reach and peer view."}
      </Text>

      {advisory ? (
        <View style={styles.steps}>
          {WORKFLOW_STEPS.map((step, index) => (
            <View key={step} style={[styles.step, { borderTopColor: colors.borderRole.subtle }]}>
              <Text style={[styles.stepIndex, CompassFonts.data, { color: colors.textRole.muted }]}>{index + 1}</Text>
              <Text style={[styles.stepBody, { color: colors.textRole.primary }]}>{step}</Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={() => (advisory ? adminNav.guidanceDashboard(router as Nav) : adminNav.peers(router as Nav))}
        activeOpacity={0.75}
        accessibilityRole="button"
        style={styles.link}
      >
        <Text style={[styles.linkText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
          {advisory ? "Open guidance workspace ->" : "Open peer comparison ->"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => adminNav.guidanceStart(router as Nav)}
        activeOpacity={0.75}
        accessibilityRole="button"
        style={styles.link}
      >
        <Text style={[styles.linkText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
          Start a guided check -&gt;
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default AdminExploreIntro;

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.sm },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 0.9 },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, maxWidth: 720 },
  steps: { marginTop: Spacing.xs },
  step: { flexDirection: "row", gap: Spacing.md, alignItems: "flex-start", borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, marginTop: Spacing.sm },
  stepIndex: { fontSize: FontSize.sm, letterSpacing: 0, minWidth: 16 },
  stepBody: { flex: 1, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  link: { alignSelf: "flex-start", minHeight: 34, justifyContent: "center" },
  linkText: { fontSize: FontSize.sm },
});
