import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { Brand, FontSize, Spacing, useTheme } from "@/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/lib/api";
import { saveStartingPoint } from "@/lib/startingPoint";
import {
  clearOnboardingDraft,
  getOnboardingDraft,
  patchOnboardingDraft,
} from "@/lib/onboardingDraft";
import type { StartingPointProfile, UserType } from "@/types/onboarding";
import { Stepper } from "@/components/onboarding/primitives";
import { SeniorSecondaryExploreSetupForm } from "@/components/onboarding/SeniorSecondaryExploreSetupForm";
import { JambSetupForm } from "@/components/onboarding/JambSetupForm";
import { CurrentStudentSetupForm } from "@/components/onboarding/CurrentStudentSetupForm";
import { OnboardingBackGuard } from "@/components/onboarding/OnboardingBackGuard";

function nextHrefForStartingPoint(profile: StartingPointProfile): string {
  const subjects = (profile.jambSubjects ?? []).filter(Boolean).join(",");
  const olevelSubjects = (profile.olevelSubjects ?? []).filter(Boolean).join(",");
  const programme =
    profile.intendedJambProgrammeId ||
    profile.intendedProgrammeId ||
    profile.intendedProgramme;

  if (profile.userType === "senior_secondary") {
    if (profile.exploreIntent?.includes("have_programme") && programme) {
      return `/(tabs)/explore/admission?mode=programme&q=${encodeURIComponent(programme)}&olevel_subjects=${encodeURIComponent(olevelSubjects)}&stream=${encodeURIComponent(profile.stream ?? "")}`;
    }
    if (olevelSubjects) {
      return `/(tabs)/explore/admission?mode=subjects&exam_type=olevel&olevel_subjects=${encodeURIComponent(olevelSubjects)}&stream=${encodeURIComponent(profile.stream ?? "")}`;
    }
    return "/(tabs)/explore/admission?mode=subjects&exam_type=olevel";
  }

  if (profile.userType === "jamb" || profile.userType === "ss3_secondary") {
    if (profile.ssDoor === "unsure") {
      return subjects
        ? `/(tabs)/explore/admission?mode=subjects&subjects=${encodeURIComponent(subjects)}&olevel_subjects=${encodeURIComponent(olevelSubjects)}&stream=${encodeURIComponent(profile.stream ?? "")}`
        : "/(tabs)/explore/admission?mode=subjects";
    }
    if (programme) {
      return `/(tabs)/explore/admission?mode=programme&q=${encodeURIComponent(programme)}&olevel_subjects=${encodeURIComponent(olevelSubjects)}&stream=${encodeURIComponent(profile.stream ?? "")}`;
    }
    return "/(tabs)/explore/admission?mode=programme";
  }

  return "/(tabs)/home";
}

function needsAdmissionResolution(profile: StartingPointProfile): boolean {
  if (
    profile.userType !== "jamb" &&
    profile.userType !== "ss3_secondary" &&
    profile.userType !== "senior_secondary"
  ) {
    return false;
  }

  const programme =
    profile.intendedJambProgrammeId ||
    profile.intendedProgrammeId ||
    profile.intendedProgramme ||
    profile.programmeName;
  const school = profile.preferredSchoolId || profile.preferredSchool;
  return !(programme && school);
}

export default function OnboardingFlow({
  initialPersona,
  initialProfile,
  onBackToChoices,
}: {
  initialPersona?: UserType;
  initialProfile?: Partial<StartingPointProfile>;
  onBackToChoices?: () => void;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const resp = useResponsive();
  const { refreshUser, user } = useAuth();
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState<Partial<StartingPointProfile>>({
    userType: initialPersona,
    ...(initialProfile ?? {}),
  });
  const [finishing, setFinishing] = useState(false);
  const draftLoaded = useRef(false);

  useEffect(() => {
    let active = true;
    getOnboardingDraft(user?.id).then((draft) => {
      if (!active) return;
      if (draft?.mode === "student") {
        if (draft.step) setStep(draft.step);
        if (draft.studentProfile) {
          const savedProfile = draft.studentProfile;
          const draftUserType = savedProfile.userType ?? initialPersona;
          if (!initialPersona || draftUserType === initialPersona) {
            setProfile((prev) => ({
              ...prev,
              ...(initialProfile ?? {}),
              ...savedProfile,
              userType: draftUserType ?? prev.userType,
            }));
          } else {
            setProfile({
              userType: initialPersona,
              ...(initialProfile ?? {}),
            });
          }
        }
      }
      draftLoaded.current = true;
    });
    return () => {
      active = false;
    };
  }, [initialPersona, initialProfile, user?.id]);

  useEffect(() => {
    if (!draftLoaded.current) return;
    patchOnboardingDraft(user?.id, {
      mode: "student",
      choice: (profile.userType ?? initialPersona) as UserType,
      step,
      studentProfile: profile,
    }).catch(() => {});
  }, [initialPersona, profile, step, user?.id]);

  const patch = (p: Partial<StartingPointProfile>) =>
    setProfile((prev) => ({ ...prev, ...p }));

  const finish = async () => {
    if (finishing) return;
    setFinishing(true);
    const full: StartingPointProfile = {
      userType: profile.userType ?? initialPersona ?? "student",
      ...profile,
      completedAt: new Date().toISOString(),
    };
    try {
      await saveStartingPoint(full, user?.id);
      // Initial guidance setup is complete once this form is saved. The
      // programme/university decision may continue in Discovery and must not
      // keep the account trapped behind the onboarding guard.
      await API.completeOnboarding({ account_type: "student" });
      await refreshUser();
      if (!needsAdmissionResolution(full)) {
        await clearOnboardingDraft(user?.id);
      }
    } finally {
      setFinishing(false);
      router.replace(nextHrefForStartingPoint(full) as never);
    }
  };

  const setupProps = {
    value: profile,
    onChange: patch,
    onContinue: finish,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[
        styles.scroll,
        { paddingHorizontal: resp.isDesktop ? Spacing.xxl : Spacing.md },
        resp.isDesktop && { maxWidth: 720, alignSelf: "center" },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <OnboardingBackGuard />
      {onBackToChoices ? (
        <TouchableOpacity
          activeOpacity={0.78}
          onPress={onBackToChoices}
          style={styles.choiceBack}
        >
          <Text style={styles.choiceBackText}>Back to user selection</Text>
        </TouchableOpacity>
      ) : null}
      <Stepper step={step} total={1} />

      <View>
        {profile.userType === "senior_secondary" ? (
          <SeniorSecondaryExploreSetupForm {...setupProps} />
        ) : null}
        {profile.userType === "jamb" || profile.userType === "ss3_secondary" ? (
          <JambSetupForm {...setupProps} />
        ) : null}
        {profile.userType === "student" ? (
          <CurrentStudentSetupForm {...setupProps} />
        ) : null}
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
  choiceBack: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  choiceBackText: {
    color: Brand.primaryDeep,
    fontSize: FontSize.sm,
    fontWeight: "800",
  },
});
