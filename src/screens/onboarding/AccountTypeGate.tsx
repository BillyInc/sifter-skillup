/**
 * AccountTypeGate — the first fork in onboarding.
 *
 * 6 large selectable persona cards (BRIEF: "Account-type gate — 6 large
 * selectable persona cards with photography"). Student personas drop into
 * OnboardingFlow's setup steps. Educators get the institutional
 * EducatorOnboarding flow.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, CompassFonts, webContainer } from "../../theme";
import { OptionCard } from "../../components/onboarding/primitives";
import { OnboardingBackGuard } from "../../components/onboarding/OnboardingBackGuard";
import OnboardingFlow from "../OnboardingFlow";
import EducatorOnboarding from "../admin/EducatorOnboarding";
import type { UserType } from "../../types/onboarding";

type Choice =
  | "senior_secondary"
  | "jamb"
  | "student"
  | "graduate"
  | "skilled_worker"
  | "professional"
  | "educator";

const PERSONAS: {
  type: Choice;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    type: "senior_secondary",
    icon: "🌱",
    title: "Senior-Secondary Student",
    subtitle: "SS1–SS3 — exploring career & subject guidance",
  },
  {
    type: "jamb",
    icon: "📚",
    title: "JAMB Candidate",
    subtitle: "SS3 student / UTME candidate",
  },
  {
    type: "student",
    icon: "🎓",
    title: "Current University Student",
    subtitle: "University · Polytechnic · College of Education",
  },
  {
    type: "graduate",
    icon: "🌍",
    title: "Graduate",
    subtitle: "NYSC / job seeker / early career",
  },
  {
    type: "skilled_worker",
    icon: "🔧",
    title: "Skilled Worker / Professional",
    subtitle: "Trades, artisan work, vocational skills",
  },
  {
    type: "professional",
    icon: "💼",
    title: "Career Changer",
    subtitle: "Professional · White-collar · Blue-collar — changing direction",
  },
  {
    type: "educator",
    icon: "🏫",
    title: "Educator / Institution",
    subtitle: "School, university, tutorial centre — career intelligence dashboard",
  },
];

export default function AccountTypeGate() {
  const { colors } = useTheme();
  const [choice, setChoice] = useState<Choice | null>(null);

  if (choice === "educator") return <EducatorOnboarding />;
  if (choice) return <OnboardingFlow initialPersona={choice as UserType} />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingBackGuard />

      <View style={{ gap: Spacing.md }}>
        <Text
          style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}
        >
          Who&apos;s joining?
        </Text>
        <Text
          style={[styles.sub, { color: colors.textRole.secondary }, CompassFonts.body]}
        >
          This sets up the right experience for you. Pick the one that fits.
        </Text>

        {PERSONAS.map((p) => (
          <OptionCard
            key={p.type}
            icon={p.icon}
            title={p.title}
            subtitle={p.subtitle}
            onPress={() => setChoice(p.type)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
});
