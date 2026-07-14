/**
 * OnboardingFlow — Sifter LevelUp's 3-step starting-point capture (Mockup Part 1).
 *
 *   Step 1  Who are you?            → one of five front doors
 *   Step 2  Setup (branches)        → JAMB / student / professional / skilled / graduate
 *   Step 3  Preferences             → regions, work types, notifications
 *
 * Finishing persists the starting-point profile (locally for now — see
 * src/lib/startingPoint.ts) and flips onboarding_completed via the existing
 * backend endpoint, then lands the user on Home. Selectors that need
 * CCMAS/NCE/IBASS data render "Live soon" until that data is imported.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, Brand, webContainer } from "../theme";
import { SifterButton } from "../components/ui";
import { useAuth } from "../hooks/useAuth";
import { API } from "../lib/api";
import { saveStartingPoint } from "../lib/startingPoint";
import type { StartingPointProfile, UserType } from "../types/onboarding";
import {
  Stepper,
  OptionCard,
  ChoiceChips,
  ToggleRow,
} from "../components/onboarding/primitives";
import { SeniorSecondaryExploreSetupForm } from "../components/onboarding/SeniorSecondaryExploreSetupForm";
import { JambSetupForm } from "../components/onboarding/JambSetupForm";
import { GraduateSetupForm } from "../components/onboarding/GraduateSetupForm";
import { CurrentStudentSetupForm } from "../components/onboarding/CurrentStudentSetupForm";
import { ProfessionalSetupForm } from "../components/onboarding/ProfessionalSetupForm";
import { SkilledWorkerSetupForm } from "../components/onboarding/SkilledWorkerSetupForm";

const WHO: { type: UserType; icon: string; title: string; subtitle: string }[] =
  [
    {
      type: "senior_secondary",
      icon: "🌱",
      title: "I'm in SS1 or SS2",
      subtitle: "Exploring — career & subject guidance",
    },
    {
      type: "jamb",
      icon: "📚",
      title: "I'm preparing for JAMB",
      subtitle: "SS3 student / UTME candidate",
    },
    {
      type: "student",
      icon: "🎓",
      title: "I'm currently in a programme",
      subtitle:
        "University · Polytechnic · Monotechnic · College of Education · College of Health · Technical College",
    },
    {
      type: "skilled_worker",
      icon: "🔧",
      title: "I'm a skilled worker / artisan",
      subtitle: "Understand my domain and grow",
    },
    {
      type: "professional",
      icon: "💼",
      title: "I'm working / changing direction",
      subtitle: "Professional · White-collar · Blue-collar",
    },
    {
      type: "graduate",
      icon: "🌍",
      title: "I'm a graduate",
      subtitle: "NYSC / job seeker / early career",
    },
  ];

const REGIONS = [
  { label: "🇳🇬 Nigeria (local)", value: "nigeria" },
  { label: "Africa (other)", value: "africa" },
  { label: "Europe", value: "europe" },
  { label: "North America", value: "north_america" },
  { label: "Asia-Pacific", value: "apac" },
  { label: "Middle East", value: "middle_east" },
  { label: "Open to anywhere", value: "anywhere" },
];

const WORK_TYPES = [
  { label: "Employment (get a job)", value: "employment" },
  { label: "Build a business", value: "business" },
  { label: "Freelance / Consulting", value: "freelance" },
  { label: "Remote work", value: "remote" },
  { label: "Research / Academia", value: "research" },
  { label: "Still exploring", value: "exploring" },
];

const NOTIFS: { key: string; label: string; default: boolean }[] = [
  { key: "internships", label: "Internship openings", default: true },
  {
    key: "graduate_deadlines",
    label: "Graduate programme deadlines",
    default: true,
  },
  { key: "scholarships", label: "Scholarship alerts", default: true },
  { key: "weekly_tips", label: "Weekly career tips", default: false },
];

function nextHrefForStartingPoint(profile: StartingPointProfile): string {
  const subjects = (profile.jambSubjects ?? []).filter(Boolean).join(",");
  const programme = profile.intendedJambProgrammeId
    || profile.intendedProgrammeId
    || profile.intendedProgramme;

  if (profile.userType === "senior_secondary") {
    if (profile.exploreIntent?.includes("have_programme") && programme) {
      return `/(tabs)/explore/admission?mode=programme&q=${encodeURIComponent(programme)}`;
    }
    if (subjects) {
      return `/(tabs)/explore/admission?mode=subjects&subjects=${encodeURIComponent(subjects)}&stream=${encodeURIComponent(profile.stream ?? "")}`;
    }
    return "/(tabs)/explore/admission?mode=subjects";
  }

  if (profile.userType === "jamb") {
    if (profile.ssDoor === "unsure") {
      return subjects
        ? `/(tabs)/explore/admission?mode=subjects&subjects=${encodeURIComponent(subjects)}&stream=${encodeURIComponent(profile.stream ?? "")}`
        : "/(tabs)/explore/admission?mode=subjects";
    }
    if (programme) {
      return `/(tabs)/explore/admission?mode=programme&q=${encodeURIComponent(programme)}`;
    }
    return "/(tabs)/explore/admission?mode=programme";
  }

  return "/(tabs)/home";
}

export default function OnboardingFlow() {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<StartingPointProfile>>({
    notifications: Object.fromEntries(NOTIFS.map((n) => [n.key, n.default])),
  });
  const [finishing, setFinishing] = useState(false);

  const patch = (p: Partial<StartingPointProfile>) =>
    setProfile((prev) => ({ ...prev, ...p }));

  const pickType = (type: UserType) => {
    patch({ userType: type });
    setStep(2);
  };

  const back = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    setFinishing(true);
    const full: StartingPointProfile = {
      userType: profile.userType ?? "graduate",
      ...profile,
      completedAt: new Date().toISOString(),
    };
    try {
      await saveStartingPoint(full);
      await API.completeOnboarding({});
      await refreshUser();
    } catch {
      // Even if the network call fails, the local profile is saved; proceed.
    } finally {
      router.replace(nextHrefForStartingPoint(full) as never);
    }
  };

  const setupProps = {
    value: profile,
    onChange: patch,
    onContinue: () => setStep(3),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Stepper step={step} total={3} onBack={step > 1 ? back : undefined} />

      {step === 1 ? (
        <View style={{ gap: Spacing.md }}>
          <Text style={[styles.title, { color: colors.text }]}>
            First, where are you right now?
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            This shapes everything we show you — programmes, domains, roles and
            the jobs they unlock.
          </Text>
          {WHO.map((w) => (
            <OptionCard
              key={w.type}
              icon={w.icon}
              title={w.title}
              subtitle={w.subtitle}
              selected={profile.userType === w.type}
              onPress={() => pickType(w.type)}
            />
          ))}
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          {profile.userType === "senior_secondary" ? (
            <SeniorSecondaryExploreSetupForm {...setupProps} />
          ) : null}
          {profile.userType === "jamb" ? (
            <JambSetupForm {...setupProps} />
          ) : null}
          {profile.userType === "student" ? (
            <CurrentStudentSetupForm {...setupProps} />
          ) : null}
          {profile.userType === "professional" ? (
            <ProfessionalSetupForm {...setupProps} />
          ) : null}
          {profile.userType === "skilled_worker" ? (
            <SkilledWorkerSetupForm {...setupProps} />
          ) : null}
          {profile.userType === "graduate" ? (
            <GraduateSetupForm {...setupProps} />
          ) : null}
        </View>
      ) : null}

      {step === 3 ? (
        <View style={{ gap: Spacing.xl }}>
          <View style={{ gap: Spacing.xs }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Almost there.
            </Text>
            <Text style={[styles.sub, { color: colors.textSoft }]}>
              These personalise what we show you. You can change them anytime.
            </Text>
          </View>

          <ChoiceChips
            label="Where do you want to work? (select all that apply)"
            options={REGIONS}
            value={profile.regions}
            onChange={(v) => patch({ regions: v })}
            multi
          />

          <ChoiceChips
            label="What kind of work interests you?"
            options={WORK_TYPES}
            value={profile.workTypes}
            onChange={(v) => patch({ workTypes: v })}
            multi
          />

          <View style={{ gap: 2 }}>
            <Text style={[styles.fieldLabel, { color: colors.textSoft }]}>
              🔔 Notify me about
            </Text>
            {NOTIFS.map((n) => (
              <ToggleRow
                key={n.key}
                label={n.label}
                value={profile.notifications?.[n.key] ?? n.default}
                onValueChange={(val) =>
                  patch({
                    notifications: {
                      ...(profile.notifications ?? {}),
                      [n.key]: val,
                    },
                  })
                }
              />
            ))}
          </View>

          <SifterButton
            label="Enter My Dashboard →"
            onPress={finish}
            loading={finishing}
            variant="track"
            color={Brand.primary}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}
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
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
});
