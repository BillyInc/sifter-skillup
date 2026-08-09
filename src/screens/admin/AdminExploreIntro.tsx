/**
 * AdminExploreIntro — the framing block above the search box on
 * `/(admin)/workspace-explore`.
 *
 * Explore mounts the student screen unmodified (§5.4: "do not build new
 * screens"), and the student framing is wrong for an admin in two different
 * ways depending on who they are:
 *
 *  - A UNIVERSITY admin needs the scope boundary stated. Everything on this
 *    page is the NATIONAL catalogue — every university, every programme — not
 *    their institution. Their own position lives in Domain Reach Audit (§5.1).
 *    Without that line, a national count read here looks like an institutional
 *    one, which is the §5.1 structural-vs-market confusion in a new place.
 *
 *  - An ADVISORY admin (secondary school, tutorial centre, JAMB café) is
 *    landing here, because lookup IS their job. They get the three-step
 *    advisory workflow that used to sit on the guidance dashboard as a static
 *    panel next to no way of acting on it, and a link to their cohort
 *    aggregates — the one thing this page genuinely cannot show.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
} from "@/theme";
import { adminNav, type Nav } from "@/lib/adminNav";
import type { AdminAudience } from "@/lib/adminAudience";

/**
 * The advisory workflow. Lifted verbatim from SchoolGuidanceDashboardScreen's
 * WORKFLOW_STEPS, where it described what to do on a page that could not do
 * it. Here the search box is directly underneath.
 */
const WORKFLOW_STEPS: readonly string[] = [
  "Pick a domain with the student.",
  "Compare universities that offer programmes feeding it.",
  "Shortlist roles and check their demand signal.",
];

export function AdminExploreIntro({
  audience,
  providerSessionOnly = false,
}: {
  audience: AdminAudience;
  providerSessionOnly?: boolean;
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const advisory = audience !== "university";
  const learnerNoun = providerSessionOnly ? "session" : "cohort";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text
        style={[styles.eyebrow, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}
      >
        {advisory ? "ADVISORY WORKSPACE" : "NATIONAL CATALOGUE"}
      </Text>

      <Text style={[styles.body, { color: colors.textRole.secondary }]}>
        {advisory
          ? "Every university, programme, domain, role, requirement and cut-off in the national map. Search it with a student in front of you — or start from a field below."
          : "Every university, programme, domain, role, requirement and cut-off in the national map — not your institution. For your own programme mix and where it ranks, open the Domain reach audit."}
      </Text>

      {advisory ? (
        <View style={styles.steps}>
          {WORKFLOW_STEPS.map((step, i) => (
            <View key={step} style={[styles.step, { borderTopColor: colors.borderRole.subtle }]}>
              <Text
                style={[styles.stepIndex, CompassFonts.data, { color: colors.textRole.muted }]}
              >
                {i + 1}
              </Text>
              <Text style={[styles.stepBody, { color: colors.textRole.primary }]}>
                {step}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <TouchableOpacity
        onPress={() =>
          advisory
            ? adminNav.guidanceDashboard(router as Nav)
            : adminNav.domainReach(router as Nav)
        }
        activeOpacity={0.75}
        accessibilityRole="button"
        style={styles.link}
      >
        <Text
          style={[styles.linkText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}
        >
          {advisory
            ? `Open your ${learnerNoun} →`
            : "Open Domain reach audit →"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default AdminExploreIntro;

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 0.9 },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, maxWidth: 720 },
  steps: { marginTop: Spacing.xs },
  step: {
    flexDirection: "row",
    gap: Spacing.md,
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  stepIndex: { fontSize: FontSize.sm, letterSpacing: 0, minWidth: 16 },
  stepBody: { flex: 1, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  link: { alignSelf: "flex-start", minHeight: 34, justifyContent: "center" },
  linkText: { fontSize: FontSize.sm },
});
