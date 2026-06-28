/**
 * AccountTypeGate — the first fork in onboarding.
 *
 * Before anything else, ask whether the person is a student or an educator /
 * institution. Students drop into the existing OnboardingFlow untouched.
 * Educators get the institutional EducatorOnboarding flow, which lands them on
 * the administrator side (/(admin)). Until a choice is made, only the two cards
 * show. Matches OnboardingFlow's ScrollView + theme styling.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTheme, Spacing, FontSize, webContainer } from "../../theme";
import { OptionCard } from "../../components/onboarding/primitives";
import OnboardingFlow from "../OnboardingFlow";
import EducatorOnboarding from "../admin/EducatorOnboarding";

type Choice = "student" | "educator";

export default function AccountTypeGate() {
  const { colors } = useTheme();
  const [choice, setChoice] = useState<Choice | null>(null);

  if (choice === "student") return <OnboardingFlow />;
  if (choice === "educator") return <EducatorOnboarding />;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={{ gap: Spacing.md }}>
        <Text style={[styles.title, { color: colors.text }]}>
          Welcome — who's joining?
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          This sets up the right experience for you. You can't undo it from here,
          so pick the one that fits.
        </Text>

        <OptionCard
          icon="🎓"
          title="I'm a student"
          subtitle="Explore programmes, domains and the jobs they unlock"
          onPress={() => setChoice("student")}
        />

        <OptionCard
          icon="🏫"
          title="I'm an educator / institution"
          subtitle="School, university, tutorial centre — career intelligence dashboard"
          onPress={() => setChoice("educator")}
        />
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
    fontWeight: "900",
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
});
