import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

import { Brand, FontSize, Radius, Spacing, useTheme } from "@/theme";
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
import { studentAccountApi } from "@/lib/provisioningData";
import { setPendingPostAuthRedirect } from "@/lib/postAuthRedirect";
import {
  guidanceContextQuery,
  type GuidanceRouteContext,
} from "@/lib/guidanceRouteContext";

function guidanceHref(
  path: string,
  parameters: string[],
  context: GuidanceRouteContext,
): string {
  const query = [...parameters.filter(Boolean), guidanceContextQuery(context)].filter(Boolean).join("&");
  return query ? `${path}?${query}` : path;
}

function nextHrefForStartingPoint(profile: StartingPointProfile): string {
  const subjects = (profile.jambSubjects ?? []).filter(Boolean).join(",");
  const olevelSubjects = (profile.olevelSubjects ?? []).filter(Boolean).join(",");
  const programme = profile.intendedProgramme || profile.programmeName || "";
  const programmeId = profile.intendedProgrammeId || profile.intendedJambProgrammeId;
  const baseContext: GuidanceRouteContext = {
    programmeId,
    jambProgrammeId: profile.intendedJambProgrammeId,
    schoolId: profile.preferredSchoolId,
    userType: profile.userType,
    className: profile.ssClass,
    stream: profile.stream,
    entryPath: "/onboarding",
    focused: true,
  };

  if (profile.userType === "senior_secondary") {
    if (profile.exploreIntent?.includes("have_programme") && programme) {
      // The onboarding search already resolved the national JAMB identity.
      // Reopening the generic admission picker here caused the student to see
      // every variant and the programme/subject switch again. Go straight to
      // that identity's preview; its university list is the next decision.
      if (programmeId) {
        return guidanceHref(`/(tabs)/explore/programme/${encodeURIComponent(programmeId)}`, [], {
          ...baseContext,
          journeyMode: "programme_preview",
          resumeStage: "programme_preview",
        });
      }
      return guidanceHref("/(tabs)/explore/admission", [
        "mode=programme",
        `q=${encodeURIComponent(programme)}`,
      ], {
        ...baseContext,
        journeyMode: "programme_preview",
        resumeStage: "programme_preview",
      });
    }
    if (olevelSubjects) {
      return guidanceHref("/(tabs)/explore/admission", [
        "mode=subjects",
        "exam_type=olevel",
        `olevel_subjects=${encodeURIComponent(olevelSubjects)}`,
      ], {
        ...baseContext,
        journeyMode: "guided_subject_discovery",
        resumeStage: "setup",
      });
    }
    return guidanceHref("/(tabs)/explore/admission", ["mode=subjects", "exam_type=olevel"], {
      ...baseContext,
      journeyMode: "guided_subject_discovery",
      resumeStage: "setup",
    });
  }

  if (profile.userType === "jamb" || profile.userType === "ss3_secondary") {
    if (profile.ssDoor === "unsure") {
      return guidanceHref("/(tabs)/explore/admission", [
        "mode=subjects",
        ...(subjects ? [`subjects=${encodeURIComponent(subjects)}`] : []),
        ...(olevelSubjects ? [`olevel_subjects=${encodeURIComponent(olevelSubjects)}`] : []),
      ], {
        ...baseContext,
        journeyMode: "guided_subject_discovery",
        resumeStage: "setup",
      });
    }
    if (programme) {
      if (profile.intendedJambProgrammeId && profile.preferredSchoolId) {
        return guidanceHref(
          `/(tabs)/explore/programme/${encodeURIComponent(profile.intendedJambProgrammeId)}`,
          [],
          {
            ...baseContext,
            journeyMode: "programme_to_role",
            resumeStage: "university_context",
          },
        );
      }
      if (profile.intendedJambProgrammeId) {
        // "I know the programme" has already selected the exact JAMB
        // identity. Let the preview show its university offerings without
        // sending the candidate back through the generic search surface.
        return guidanceHref(
          `/(tabs)/explore/programme/${encodeURIComponent(profile.intendedJambProgrammeId)}`,
          [],
          {
            ...baseContext,
            journeyMode: "programme_preview",
            resumeStage: "programme_preview",
          },
        );
      }
      return guidanceHref("/(tabs)/explore/admission", [
        "mode=programme",
        `q=${encodeURIComponent(programme)}`,
        ...(profile.ssDoor === "know_where" && profile.preferredSchool
          ? [`school_name=${encodeURIComponent(profile.preferredSchool)}`]
          : []),
      ], {
        ...baseContext,
        journeyMode: "programme_preview",
        resumeStage: "programme_preview",
      });
    }
    return guidanceHref("/(tabs)/explore/admission", ["mode=programme"], {
      ...baseContext,
      journeyMode: "programme_preview",
      resumeStage: "setup",
    });
  }

  if (profile.userType === "student" && profile.preferredSchoolId) {
    const jambProgrammeId = profile.intendedJambProgrammeId;
    if (jambProgrammeId) {
      return guidanceHref(
        `/(tabs)/explore/programme/${encodeURIComponent(jambProgrammeId)}`,
        [],
        {
          ...baseContext,
          journeyMode: "undergraduate_career",
          resumeStage: "university_context",
        },
      );
    }
    return guidanceHref("/(tabs)/explore/admission", [
      "mode=school",
      `school_name=${encodeURIComponent(profile.preferredSchool ?? profile.schoolName ?? "")}`,
      `programme=${encodeURIComponent(programme)}`,
    ], {
      ...baseContext,
      journeyMode: "undergraduate_career",
      resumeStage: "setup",
    });
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
  const [schoolCode, setSchoolCode] = useState("");
  const [schoolCodeOpen, setSchoolCodeOpen] = useState(Boolean(initialProfile?.schoolCode));
  const [schoolCodeBusy, setSchoolCodeBusy] = useState(false);
  const [schoolCodeMessage, setSchoolCodeMessage] = useState<string | null>(null);
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
            setSchoolCode(savedProfile.schoolCode ?? "");
            setSchoolCodeOpen(Boolean(savedProfile.schoolCode));
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
      // AuthLayout sees the completed account during refreshUser and may
      // redirect immediately. Queue the journey destination first so that
      // completing onboarding never falls back to generic Home.
      setPendingPostAuthRedirect(nextHrefForStartingPoint(full), user?.id);
      await refreshUser();
      if (!needsAdmissionResolution(full)) {
        await clearOnboardingDraft(user?.id);
      }
    } finally {
      setFinishing(false);
      router.replace(nextHrefForStartingPoint(full) as never);
    }
  };

  const linkSchool = async () => {
    const code = schoolCode.trim();
    if (!code || schoolCodeBusy) return;
    setSchoolCodeBusy(true);
    setSchoolCodeMessage(null);
    try {
      const result = await studentAccountApi.affiliate(code);
      setSchoolCodeMessage(`Linked to ${result.schoolName ?? "your school"}.`);
    } catch (e) {
      setSchoolCodeMessage((e as Error)?.message ?? "That school code could not be linked yet.");
    } finally {
      setSchoolCodeBusy(false);
    }
  };

  const setupProps = {
    value: profile,
    onChange: patch,
    onContinue: finish,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface.base }}>
      <ScrollView
        pointerEvents={finishing ? "none" : "auto"}
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

      {schoolCodeOpen ? (
        <View style={[styles.schoolCodeCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
          <View style={styles.schoolCodeHeader}>
            <View style={{ flex: 1, gap: Spacing.xs }}>
              <Text style={[styles.schoolCodeTitle, { color: colors.textRole.primary }]}>Have a school code?</Text>
              <Text style={[styles.schoolCodeHint, { color: colors.textRole.muted }]}>Enter it now or leave this for later. It only links your account to the school; it does not expose your progress.</Text>
            </View>
            <TouchableOpacity
              onPress={() => setSchoolCodeOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="Hide school code"
              hitSlop={8}
            >
              <Text style={[styles.schoolCodeClose, { color: colors.textRole.muted }]}>×</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.schoolCodeRow}>
            <TextInput
              value={schoolCode}
              onChangeText={(value) => { const next = value.toUpperCase(); setSchoolCode(next); patch({ schoolCode: next }); setSchoolCodeMessage(null); }}
              autoCapitalize="characters"
              placeholder="SCHOOL-XXXXXXXX"
              placeholderTextColor={colors.textRole.muted}
              style={[styles.schoolCodeInput, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.base }]}
            />
            <TouchableOpacity onPress={linkSchool} disabled={schoolCodeBusy} style={[styles.schoolCodeButton, { backgroundColor: colors.textRole.primary, opacity: schoolCodeBusy ? 0.6 : 1 }]}>
              {schoolCodeBusy ? <ActivityIndicator color={colors.surface.inverse} /> : <Text style={{ color: colors.surface.inverse, fontWeight: "800" }}>Link</Text>}
            </TouchableOpacity>
          </View>
          {schoolCodeMessage ? <Text style={[styles.schoolCodeHint, { color: colors.accentRole.success }]}>{schoolCodeMessage}</Text> : null}
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => setSchoolCodeOpen(true)}
          accessibilityRole="button"
          style={[styles.schoolCodeCollapsed, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
        >
          <Text style={[styles.schoolCodeCollapsedText, { color: colors.textRole.secondary }]}>Have a school code? Add it (optional)</Text>
          <Text style={[styles.schoolCodeReveal, { color: colors.accentRole.action }]}>Show</Text>
        </TouchableOpacity>
      )}

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
      {finishing ? (
        <View style={styles.finishingOverlay} accessibilityRole="progressbar">
          <ActivityIndicator size="large" color={Brand.primaryDeep} />
          <Text style={[styles.finishingTitle, { color: colors.textRole.primary }]}>Opening your guidance</Text>
          <Text style={[styles.finishingHint, { color: colors.textRole.secondary }]}>Your choices are being saved. This screen is locked for a moment.</Text>
        </View>
      ) : null}
    </View>
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
  schoolCodeCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  schoolCodeHeader: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  schoolCodeTitle: { fontSize: FontSize.md, fontWeight: "800" },
  schoolCodeHint: { fontSize: FontSize.xs, lineHeight: 17 },
  schoolCodeClose: { fontSize: 24, lineHeight: 24 },
  schoolCodeCollapsed: { borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  schoolCodeCollapsedText: { fontSize: FontSize.sm, fontWeight: "700" },
  schoolCodeReveal: { fontSize: FontSize.sm, fontWeight: "800" },
  schoolCodeRow: { flexDirection: "row", gap: Spacing.sm, alignItems: "center" },
  schoolCodeInput: { flex: 1, minHeight: 46, borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md },
  schoolCodeButton: { minHeight: 46, minWidth: 72, borderRadius: Radius.sm, alignItems: "center", justifyContent: "center" },
  finishingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
    gap: Spacing.sm,
    backgroundColor: "rgba(255,255,255,0.86)",
  },
  finishingTitle: { fontSize: FontSize.lg, fontWeight: "900", textAlign: "center" },
  finishingHint: { maxWidth: 320, fontSize: FontSize.sm, lineHeight: 20, textAlign: "center" },
});
