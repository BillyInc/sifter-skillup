import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { isAdminAccount, needsLegacyTypeSelection, useEffectiveAccountType } from "../src/lib/accountType";
import { getEducatorProfile } from "../src/lib/educatorProfile";
import { adminHomeForProfile } from "../src/lib/adminAudience";
import { getAdminResume } from "../src/lib/adminResume";
import { resolvePostAuthHref } from "../src/lib/resumeNavigation";
import type { EducatorProfile } from "../src/types/institution";
import {
  Brand,
  Spacing,
  useTheme,
  INTRO_SEEN_KEY,
} from "../src/theme";
import { LevelUpLogo } from "../src/components/brand/LevelUpLogo";
import { IntroCarousel } from "../src/components/brand/IntroCarousel";
import { hasExplicitLogout } from "../src/lib/logoutState";
import AuthScreen from "../src/screens/AuthScreen";

export default function LandingPage() {
  const { colors } = useTheme();
  const { user, loading } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [adminResumeHref, setAdminResumeHref] = useState<string | null>(null);
  const [adminResumeHydrated, setAdminResumeHydrated] = useState(false);
  const [introState, setIntroState] = useState<"loading" | "show" | "done" | "logged_out">("loading");

  useEffect(() => {
    Promise.all([hasExplicitLogout(), AsyncStorage.getItem(INTRO_SEEN_KEY)])
      .then(([loggedOut, introSeen]) => setIntroState(loggedOut ? "logged_out" : introSeen === "1" ? "done" : "show"))
      .catch(() => setIntroState("show"));
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setEducatorProfile(null);
      setProfileHydrated(true);
      setAdminResumeHref(null);
      setAdminResumeHydrated(true);
      return;
    }

    let active = true;
    getEducatorProfile(user.id).then(
      (profile) => {
        if (!active) return;
        setEducatorProfile(profile);
        setProfileHydrated(true);
      },
      () => {
        if (!active) return;
        setEducatorProfile(null);
        setProfileHydrated(true);
      },
    );
    setAdminResumeHydrated(false);
    getAdminResume(user.id).then((resume) => {
      if (active) {
        setAdminResumeHref(resume?.href ?? null);
        setAdminResumeHydrated(true);
      }
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const signedInHref = useMemo(() => {
    if (!user) return null;
    if (user.auth_provider === "guest") return "/(tabs)/explore";
    if (needsLegacyTypeSelection(user)) return "/(auth)/onboarding?restart=1";
    if (!user.onboarding_completed) return "/(auth)/onboarding";
    if (isAdminAccount(accountType)) return adminResumeHref ?? adminHomeForProfile(educatorProfile);
    return resolvePostAuthHref(user);
  }, [accountType, adminResumeHref, educatorProfile, user]);

  if (introState === "loading" || loading || (user && (!hydrated || !profileHydrated || !adminResumeHydrated))) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.bg }]}>
        <LevelUpLogo size={96} animated />
        <ActivityIndicator color={Brand.primary} />
      </View>
    );
  }

  if (!user && introState === "show") {
    return <IntroCarousel onDone={() => setIntroState("done")} />;
  }

  if (!user && introState === "logged_out") {
    return <AuthScreen initialMode="welcome" />;
  }

  if (signedInHref) {
    return <Redirect href={signedInHref as any} />;
  }

  // There is one public auth entry point. The old centred landing page with
  // audience copy duplicated this flow and made browser back navigation land
  // in a different auth experience.
  return <AuthScreen initialMode="welcome" />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
});
