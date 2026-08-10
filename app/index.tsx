import React, { useEffect, useMemo, useState } from "react";
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
import { isAdminAccount, useEffectiveAccountType } from "../src/lib/accountType";
import { getEducatorProfile } from "../src/lib/educatorProfile";
import { adminHomeForProfile } from "../src/lib/adminAudience";
import { resolvePostAuthHref } from "../src/lib/resumeNavigation";
import type { EducatorProfile } from "../src/types/institution";
import {
  Brand,
  FontSize,
  FontWeight,
  Radius,
  Shadow,
  Spacing,
  useTheme,
  webContainer,
} from "../src/theme";
import { LevelUpLogo } from "../src/components/brand/LevelUpLogo";
import { IntroCarousel } from "../src/components/brand/IntroCarousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { INTRO_SEEN_KEY } from "../src/theme";

export default function LandingPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, loading, signInGuest } = useAuth();
  const { accountType, hydrated } = useEffectiveAccountType(user?.account_type);
  const [educatorProfile, setEducatorProfile] = useState<EducatorProfile | null>(null);
  const [profileHydrated, setProfileHydrated] = useState(false);
  const [guestBusy, setGuestBusy] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);
  const [introState, setIntroState] = useState<"loading" | "show" | "done">("loading");

  useEffect(() => {
    AsyncStorage.getItem(INTRO_SEEN_KEY)
      .then((value) => setIntroState(value ? "done" : "show"))
      .catch(() => setIntroState("show"));
  }, []);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((profile) => {
      if (!active) return;
      setEducatorProfile(profile);
      setProfileHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const signedInHref = useMemo(() => {
    if (!user) return null;
    if (user.auth_provider === "guest") return "/(tabs)/explore";
    if (!user.onboarding_completed) return "/(auth)/onboarding";
    if (isAdminAccount(accountType)) return adminHomeForProfile(educatorProfile);
    return resolvePostAuthHref(user);
  }, [accountType, educatorProfile, user]);

  if (introState === "loading" || loading || (user && (!hydrated || !profileHydrated))) {
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
          onPress={() => router.push("/(auth)/sign-in" as any)}
          style={[styles.primaryBtn, { backgroundColor: Brand.primary }]}
        >
          <Text style={styles.primaryText}>Sign in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/signup" as any)}
          style={[styles.secondaryBtn, { borderColor: colors.border }]}
        >
          <Text style={[styles.secondaryText, { color: colors.text }]}>
            Create account
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        {[
          ["Students", "Resume lessons, explore domains, and compare role signals."],
          ["Universities", "See programme-to-domain demand and skills gaps."],
          ["Schools & tutorials", "Guide SS students outward across universities and roles."],
        ].map(([title, body]) => (
          <View
            key={title}
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
              Shadow.xs,
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.cardBody, { color: colors.textMuted }]}>{body}</Text>
          </View>
        ))}
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
  grid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  card: {
    flex: 1,
    minWidth: 220,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  browse: { alignSelf: "center", padding: Spacing.sm },
  browseText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  errorText: {
    alignSelf: "center",
    maxWidth: 420,
    textAlign: "center",
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
});
