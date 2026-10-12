import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SkillDiscoveryPanel } from "@/components/careerIntelligence/SkillDiscoveryPanel";
import { useTheme, CompassFonts, FontSize, Spacing } from "@/theme";

type SkillsMatcherAdminType =
  | "secondary_school"
  | "tutorial_centre"
  | "jamb_cafe"
  | "university"
  | null;

function readParam(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

/**
 * The skills matcher has a narrower audience contract than the general
 * admission guidance surface. Secondary schools can choose SS1–SS3 and
 * tutorial/JAMB-café staff can choose JAMB. University admin uses the
 * general matcher view here, with no learner-stage selector.
 */
function resolveMatcherAdminType(value: string | null): SkillsMatcherAdminType {
  switch (value) {
    case "secondary_school":
    case "tutorial_centre":
    case "jamb_cafe":
      return value;
    case "university":
      return null;
    default:
      return null;
  }
}

export default function SkillsMatcherScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ admin_type?: string | string[] }>();
  const requestedAdminType = readParam(params.admin_type);
  const adminType = resolveMatcherAdminType(requestedAdminType);
  const universityAdminView = requestedAdminType === "university";

  return (
    <ScrollView
      style={[styles.screen, { backgroundColor: colors.surface.base }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.intro}>
        <Text style={[styles.eyebrow, { color: colors.accentRole.action }]}>SKILLS EXPLORER</Text>
        <Text style={[CompassFonts.displaySemi, styles.title, { color: colors.textRole.primary }]}>Skills Matcher</Text>
        <Text style={[styles.description, { color: colors.textRole.secondary }]}>Search a skill you have or want to learn, then follow the possible domains, subgroups and roles alongside what you would need to build next.</Text>
        {universityAdminView ? (
          <View style={[styles.scopeNote, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.scopeTitle, { color: colors.textRole.primary }]}>University admin view</Text>
            <Text style={[styles.scopeBody, { color: colors.textRole.secondary }]}>The skills matcher is for secondary-school and JAMB guidance. University admins do not have a learner-guidance matcher here.</Text>
          </View>
        ) : null}
      </View>

      {!universityAdminView ? <SkillDiscoveryPanel adminType={adminType} /> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
  intro: {
    gap: Spacing.sm,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  title: {
    fontSize: FontSize.hero,
  },
  description: {
    maxWidth: 760,
    fontSize: FontSize.md,
    lineHeight: 20,
  },
  scopeNote: {
    alignSelf: "flex-start",
    maxWidth: 620,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  scopeTitle: {
    fontSize: FontSize.sm,
    fontWeight: "800",
  },
  scopeBody: {
    fontSize: FontSize.sm,
    lineHeight: 18,
  },
});
