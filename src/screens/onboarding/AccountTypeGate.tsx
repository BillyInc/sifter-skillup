/**
 * AccountTypeGate - the first fork in onboarding.
 *
 * 6 large selectable persona cards (BRIEF: "Account-type gate - 6 large
 * selectable persona cards with photography"). Student personas drop into
 * OnboardingFlow's setup steps. Educators get the institutional
 * EducatorOnboarding flow.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { OnboardingBackGuard } from "@/components/onboarding/OnboardingBackGuard";
import OnboardingFlow from "@/screens/OnboardingFlow";
import EducatorOnboarding from "@/screens/admin/EducatorOnboarding";
import type { UserType } from "@/types/onboarding";
import { useAuth } from "@/hooks/useAuth";
import { getOnboardingDraft, patchOnboardingDraft } from "@/lib/onboardingDraft";

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
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
}[] = [
  {
    type: "senior_secondary",
    icon: "map",
    title: "Senior-Secondary Student",
    subtitle: "SS1-SS3 - exploring career and subject guidance",
  },
  {
    type: "jamb",
    icon: "book-open",
    title: "JAMB Candidate",
    subtitle: "SS3 student / UTME candidate",
  },
  {
    type: "student",
    icon: "users",
    title: "Current University Student",
    subtitle: "University / Polytechnic / College of Education",
  },
  {
    type: "graduate",
    icon: "globe",
    title: "Graduate",
    subtitle: "NYSC / job seeker / early career",
  },
  {
    type: "skilled_worker",
    icon: "tool",
    title: "Skilled Worker / Professional",
    subtitle: "Trades, artisan work, vocational skills",
  },
  {
    type: "professional",
    icon: "briefcase",
    title: "Career Changer",
    subtitle: "Professional / white-collar / blue-collar - changing direction",
  },
  {
    type: "educator",
    icon: "home",
    title: "Educator / Institution",
    subtitle: "School, university, tutorial centre - career intelligence dashboard",
  },
];

export default function AccountTypeGate() {
  const { colors } = useTheme();
  const router = useRouter();
  const resp = useResponsive();
  const { user } = useAuth();
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    let active = true;
    getOnboardingDraft(user?.id).then((draft) => {
      if (!active || !draft?.choice) return;
      setChoice(draft.choice as Choice);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const choose = (next: Choice) => {
    setChoice(next);
    patchOnboardingDraft(user?.id, {
      mode: next === "educator" ? "educator" : "student",
      choice: next,
      step: 1,
    }).catch(() => {});
  };

  if (choice === "educator") return <EducatorOnboarding />;
  if (choice) return <OnboardingFlow initialPersona={choice as UserType} />;

  const isGrid = resp.isDesktop;
  const columns = isGrid ? 2 : 1;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={styles.scroll}
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

        <View style={[styles.cardGrid, isGrid && styles.cardGridDesktop]}>
          {PERSONAS.map((p) => (
            <TouchableOpacity
              key={p.type}
              activeOpacity={0.85}
              onPress={() => choose(p.type)}
              style={[
                styles.card,
                { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
              ]}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.surface.subtle }]}>
                <Feather name={p.icon} size={22} color={colors.accentRole.action} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                  {p.title}
                </Text>
                <Text style={[styles.cardSub, { color: colors.textRole.secondary }]}>
                  {p.subtitle}
                </Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
            </TouchableOpacity>
          ))}
        </View>
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
  cardGrid: { gap: Spacing.sm },
  cardGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 64,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: { fontSize: FontSize.md },
  cardSub: { fontSize: FontSize.xs, marginTop: 2, lineHeight: FontSize.xs * 1.5 },
});

