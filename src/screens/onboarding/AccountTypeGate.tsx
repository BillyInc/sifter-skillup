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
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { OnboardingBackGuard } from "@/components/onboarding/OnboardingBackGuard";
import OnboardingFlow from "@/screens/OnboardingFlow";
import EducatorOnboarding from "@/screens/admin/EducatorOnboarding";
import type { UserType } from "@/types/onboarding";
import { useAuth } from "@/hooks/useAuth";
import { getOnboardingDraft, saveOnboardingDraft } from "@/lib/onboardingDraft";
import type { StartingPointProfile } from "@/types/onboarding";

type Choice =
  | "ss1_secondary"
  | "ss2_secondary"
  | "ss3_secondary"
  | "jamb"
  | "student"
  | "educator";

const PERSONAS: {
  type: Choice;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  userType?: UserType;
  preset?: Partial<import("@/types/onboarding").StartingPointProfile>;
}[] = [
  {
    type: "ss1_secondary",
    icon: "map",
    title: "SS1 Student",
    subtitle: "Start broad: school, stream and early subject guidance",
    userType: "senior_secondary",
    preset: { userType: "senior_secondary", ssClass: "ss1" },
  },
  {
    type: "ss2_secondary",
    icon: "map",
    title: "SS2 Student",
    subtitle: "Narrow subjects before SS3 and UTME decisions",
    userType: "senior_secondary",
    preset: { userType: "senior_secondary", ssClass: "ss2" },
  },
  {
    type: "ss3_secondary",
    icon: "book",
    title: "SS3 Student",
    subtitle: "School-based admission guidance for final-year secondary students",
    userType: "ss3_secondary",
    preset: { userType: "ss3_secondary", ssClass: "ss3" },
  },
  {
    type: "jamb",
    icon: "book-open",
    title: "JAMB Candidate",
    subtitle: "Tutorial centre or self-taught UTME admission guidance",
    userType: "jamb",
    preset: { userType: "jamb" },
  },
  {
    type: "student",
    icon: "users",
    title: "Undergraduate Student",
    subtitle: "Start from your university and programme",
    userType: "student",
    preset: { userType: "student", institutionType: "university" },
  },
  {
    type: "educator",
    icon: "home",
    title: "Educator / Institution",
    subtitle: "Guide students from a school, university or tutorial centre",
  },
];

const ALLOWED_CHOICES = new Set<Choice>(PERSONAS.map((p) => p.type));

export default function AccountTypeGate() {
  const { colors } = useTheme();
  const resp = useResponsive();
  const { user } = useAuth();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<Partial<StartingPointProfile> | null>(null);

  useEffect(() => {
    let active = true;
    getOnboardingDraft(user?.id).then((draft) => {
      if (!active || !draft?.choice) return;
      if (ALLOWED_CHOICES.has(draft.choice as Choice)) {
        setChoice(draft.choice as Choice);
        setSelectedProfile(draft.studentProfile ?? null);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const choose = (next: Choice) => {
    const persona = PERSONAS.find((p) => p.type === next);
    const profile = persona?.preset ?? null;
    setChoice(next);
    setSelectedProfile(profile);
    saveOnboardingDraft({
      userId: user?.id,
      mode: next === "educator" ? "educator" : "student",
      choice: next,
      step: 1,
      studentProfile: profile ?? undefined,
    }).catch(() => {});
  };

  const backToChoices = () => {
    setChoice(null);
    setSelectedProfile(null);
    saveOnboardingDraft({
      userId: user?.id,
      step: 1,
    }).catch(() => {});
  };

  if (choice === "educator") return <EducatorOnboarding onBackToChoices={backToChoices} />;
  if (choice) {
    const persona = PERSONAS.find((p) => p.type === choice);
    return (
      <OnboardingFlow
        initialPersona={(persona?.userType ?? choice) as UserType}
        initialProfile={selectedProfile ?? persona?.preset}
        onBackToChoices={backToChoices}
      />
    );
  }

  const isGrid = resp.isDesktop;

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
          This decides which questions and guidance you will see next. Choose the
          option that describes you today.
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

