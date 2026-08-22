import React, { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../src/hooks/useAuth";
import { isAdminAccount, needsLegacyTypeSelection, useEffectiveAccountType } from "../src/lib/accountType";
import { getEducatorProfile } from "../src/lib/educatorProfile";
import { adminHomeForProfile } from "../src/lib/adminAudience";
import { getAdminResume } from "../src/lib/adminResume";
import { resolvePostAuthHref } from "../src/lib/resumeNavigation";
import type { EducatorProfile } from "../src/types/institution";
import {
  Brand,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
  webContainer,
  INTRO_SEEN_KEY,
} from "../src/theme";
import { LevelUpLogo } from "../src/components/brand/LevelUpLogo";
import { IntroCarousel } from "../src/components/brand/IntroCarousel";
import { hasExplicitLogout } from "../src/lib/logoutState";

export default function LandingPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, loading, signInGuest } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type, user?.id);
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [adminResumeHref, setAdminResumeHref] = useState<string | null>(null);
  const [adminResumeHydrated, setAdminResumeHydrated] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
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
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (signedInHref) {
    return <Redirect href={signedInHref as any} />;
  }

  const handleGuest = async () => {
    if (guestBusy) return;
    setGuestError(null);
    setGuestBusy(true);
    try {
      await signInGuest();
    } catch (e: any) {
      setGuestError(e?.message || "Could not open guest mode.");
    } finally {
      setGuestBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
    >
      <View style={styles.hero}>
        <LevelUpLogo size={112} animated />
        <Text style={[styles.title, { color: colors.text }]}>Sifter LevelUp</Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Career paths for students, programme intelligence for universities,
          and practical guidance tools for schools and tutorial centres.
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/sign-in" as any)}
          style={[styles.primaryBtn, { backgroundColor: Brand.primary }]}
        >
          <Text style={styles.primaryText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.replace("/(auth)/signup" as any)}
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.secondaryText, { color: colors.text }]}>
            Create account
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleGuest}
        disabled={guestBusy}
        style={styles.browse}
      >
        <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
          {guestBusy ? "Opening guest mode..." : "Browse as guest"}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          AsyncStorage.removeItem(INTRO_SEEN_KEY).catch(() => {});
          setIntroState("show");
        }}
        style={styles.viewIntro}
      >
        <Text style={[styles.browseText, { color: colors.textMuted }]}>View intro again</Text>
      </TouchableOpacity>
      {guestError ? (
        <Text style={[styles.errorText, { color: colors.red }]}>
          {guestError}
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.lg },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
  },
  hero: { alignItems: "center", gap: Spacing.md },
  title: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    textAlign: "center",
  },
  sub: {
    maxWidth: 680,
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  primaryBtn: {
    minWidth: 180,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontSize: FontSize.md, fontWeight: FontWeight.bold },
  secondaryBtn: {
    minWidth: 180,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  secondaryText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  browse: { alignSelf: "center", padding: Spacing.sm },
  browseText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  viewIntro: { alignSelf: "center", padding: Spacing.xs },
  errorText: {
    alignSelf: "center",
    maxWidth: 420,
    textAlign: "center",
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
