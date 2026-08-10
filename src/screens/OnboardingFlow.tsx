/**
 * OnboardingFlow — Sifter LevelUp's 2-step starting-point capture.
 *
 *   Step 1  Setup (branches)        → JAMB / student / professional / skilled / graduate
 *   Step 2  Preferences             → regions, work types, notifications
 *
 * Persona is now selected upstream (AccountTypeGate). This screen receives
 * `initialPersona` and skips the "Who are you?" step.
 *
 * Finishing persists the starting-point profile (locally for now — see
 * src/lib/startingPoint.ts) and flips onboarding_completed via the existing
 * backend endpoint, then lands the user on Home. Selectors that need
 * CCMAS/NCE/IBASS data render "Live soon" until that data is imported.
 *
 * Semantic tokens + CompassFonts (BRIEF chrome).
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, CompassFonts } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { SifterButton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/lib/api";
import { saveStartingPoint } from "@/lib/startingPoint";
import type { StartingPointProfile, UserType } from "@/types/onboarding";
import {
  Stepper,
  ChoiceChips,
  ToggleRow,
} from "@/components/onboarding/primitives";
import { SeniorSecondaryExploreSetupForm } from "@/components/onboarding/SeniorSecondaryExploreSetupForm";
import { JambSetupForm } from "@/components/onboarding/JambSetupForm";
import { GraduateSetupForm } from "@/components/onboarding/GraduateSetupForm";
import { OnboardingBackGuard } from "@/components/onboarding/OnboardingBackGuard";
import { CurrentStudentSetupForm } from "@/components/onboarding/CurrentStudentSetupForm";
import { ProfessionalSetupForm } from "@/components/onboarding/ProfessionalSetupForm";
import { SkilledWorkerSetupForm } from "@/components/onboarding/SkilledWorkerSetupForm";

const REGIONS = [
  { label: "Nigeria (local)", value: "nigeria" },
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

function needsAdmissionResolution(profile: StartingPointProfile): boolean {
  if (profile.userType !== "jamb" && profile.userType !== "senior_secondary") {
    return false;
  }
  const programme =
    profile.intendedJambProgrammeId ||
    profile.intendedProgrammeId ||
    profile.intendedProgramme ||
    profile.programmeName;
  const school =
    profile.preferredSchoolId ||
    profile.preferredSchool;
  return !(programme && school);
}

export default function OnboardingFlow({
  initialPersona,
}: {
  initialPersona?: UserType;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const resp = useResponsive();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<StartingPointProfile>>({
    userType: initialPersona,
    notifications: Object.fromEntries(NOTIFS.map((n) => [n.key, n.default])),
  });
  const [finishing, setFinishing] = useState(false);

  const patch = (p: Partial<StartingPointProfile>) =>
    setProfile((prev) => ({ ...prev, ...p }));

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
      if (!needsAdmissionResolution(full)) {
        await API.completeOnboarding({});
        await refreshUser();
      }
    } catch {
      // Even if the network call fails, the local profile is saved; proceed.
    } finally {
      router.replace(nextHrefForStartingPoint(full) as never);
    }
  };

  const setupProps = {
    value: profile,
    onChange: patch,
    onContinue: () => setStep(2),
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, { paddingHorizontal: resp.isDesktop ? Spacing.xxl : Spacing.md }, resp.isDesktop && { maxWidth: 720, alignSelf: "center" }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingBackGuard />
      <Stepper step={step} total={2} onBack={step > 1 ? back : undefined} />

      {step === 1 ? (
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

      {step === 2 ? (
        <View style={{ gap: Spacing.xl }}>
          <View style={{ gap: Spacing.xs }}>
            <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
              Almost there.
            </Text>
            <Text style={[styles.sub, { color: colors.textRole.secondary }, CompassFonts.body]}>
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
            <Text style={[styles.fieldLabel, { color: colors.textRole.secondary }, CompassFonts.bodyBold]}>
              Notify me about
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
            color={colors.accentRole.action}
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
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  fieldLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.sm,
  },
});
