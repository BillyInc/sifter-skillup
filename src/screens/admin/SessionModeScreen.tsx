/**
 * SessionModeScreen - provider-led guidance for tutorial centres and JAMB cafes.
 *
 * Providers can run the same admission guidance flow used by students without
 * creating a student account or storing personal data for a walk-in session.
 */
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

import {
  CompassFonts,
  FontSize,
  Radius,
  Shadow,
  Spacing,
  useTheme,
  webContainer,
} from "@/theme";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { guidanceContextQuery } from "@/lib/guidanceRouteContext";
import { useAuth } from "@/hooks/useAuth";
import type { EducatorProfile } from "../../types/institution";
import { AdminShell } from "./AdminShell";

const SESSION_STEPS = [
  {
    icon: "1",
    title: "Sit with the student",
    body: "A walk-in student sits with you. No account creation, no roster entry, and no personal data stored.",
  },
  {
    icon: "2",
    title: "Run the guidance flow",
    body: "Step through subjects, programmes, universities, domains, and roles as a provider-led conversation.",
  },
  {
    icon: "3",
    title: "End the session",
    body: "When the session ends, nothing about the student is saved. The session is for guidance, not record-keeping.",
  },
];

type SessionJourney = "full" | "programme_to_role" | "utme_only" | "olevel_only" | "universities_only";

const SESSION_JOURNEYS: { value: SessionJourney; title: string; body: string }[] = [
  {
    value: "full",
    title: "Full guidance flow",
    body: "Start with UTME and O-level subjects, then move through programme, university, domain, subgroup and role.",
  },
  {
    value: "programme_to_role",
    title: "Programme to career route",
    body: "Start with a programme, review universities and requirements, then continue into domains, subgroups and roles.",
  },
  {
    value: "utme_only",
    title: "UTME-only check",
    body: "Check UTME subjects alone. This remains incomplete until the relevant O-level requirements are reviewed.",
  },
  {
    value: "olevel_only",
    title: "O-level-only check",
    body: "Check O-level subjects alone. This does not confirm the UTME subject gate.",
  },
  {
    value: "universities_only",
    title: "University options only",
    body: "Inspect universities, addresses, requirements and notes without entering career guidance.",
  },
];

export function SessionModeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [journey, setJourney] = useState<SessionJourney>("full");

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((p) => {
      if (!active) return;
      setProfile(p);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  const isProvider =
    profile?.providerSessionOnly === true ||
    profile?.organizationType === "tutorial_centre" ||
    profile?.organizationType === "jamb_cafe";

  const startJourney = (value: SessionJourney) => {
    if (!profile) return;
    setJourney(value);
    const mode = value === "full" || value === "utme_only" || value === "olevel_only" ? "subjects" : "programme";
    const examType = value === "utme_only" ? "utme" : value === "olevel_only" ? "olevel" : value === "full" ? "combined" : "";
    const guidanceContext = guidanceContextQuery({
      className: "JAMB",
      userType: "jamb",
      journeyMode: value,
      guidanceTarget: "provider_session",
      resumeStage: "setup",
      entryPath: "/admin/session",
      focused: true,
    });
    const params = [
      `mode=${mode}`,
      "admin=1",
      `admin_type=${encodeURIComponent(profile.organizationType ?? "")}`,
      `journey=${encodeURIComponent(value)}`,
      examType ? `exam_type=${examType}` : "",
      guidanceContext,
    ].filter(Boolean).join("&");
    router.push(`/(admin)/workspace-explore/admission?${params}` as never);
  };

  return (
    <AdminShell title="Session / Provider mode" eyebrow="Provider">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {!loaded ? null : isProvider ? (
          <>
            <View
              style={[
                styles.hero,
                { backgroundColor: colors.card, borderColor: colors.border },
                Shadow.xs,
              ]}
            >
              <Text style={[styles.heroIcon, { color: colors.textMuted }]}>GUIDE</Text>
              <Text style={[styles.heroTitle, CompassFonts.displayBold, { color: colors.text }]}>
                Run a guidance session
              </Text>
              <Text style={[styles.heroBody, { color: colors.textSoft }]}>
                Use the admission guidance flow with a student sitting beside
                you. The session uses subjects, programmes and universities
                without saving personal student data.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
                How a session works
              </Text>
              <View style={styles.cards}>
                {SESSION_STEPS.map((s) => (
                  <View
                    key={s.title}
                    style={[
                      styles.card,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.cardIcon, { color: colors.textMuted }]}>{s.icon}</Text>
                    <Text style={[styles.cardTitle, CompassFonts.bodyBold, { color: colors.text }]}>
                      {s.title}
                    </Text>
                    <Text style={[styles.cardBody, { color: colors.textMuted }]}>
                      {s.body}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>Choose how to guide</Text>
              <Text style={[styles.cardBody, { color: colors.textMuted }]}>Choose the smallest journey that answers the student&apos;s question. You can return and run a fuller flow later.</Text>
              <View style={styles.actions}>
                {SESSION_JOURNEYS.map((option) => {
                  const active = journey === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      activeOpacity={0.82}
                      onPress={() => startJourney(option.value)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.action, { backgroundColor: active ? colors.accent : colors.card, borderColor: active ? colors.accent : colors.border }]}
                    >
                      <Text style={[styles.actionTitle, { color: active ? colors.textInverse : colors.text }]}>{option.title}</Text>
                      <Text style={[styles.actionBody, { color: active ? colors.textInverse : colors.textMuted }]}>{option.body}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ) : (
          <View
            style={[
              styles.hero,
              { backgroundColor: colors.card, borderColor: colors.border },
              Shadow.xs,
            ]}
          >
            <Text style={[styles.heroIcon, { color: colors.textMuted }]}>INFO</Text>
            <Text style={[styles.heroTitle, CompassFonts.displayBold, { color: colors.text }]}>
              Session mode is for providers
            </Text>
            <Text style={[styles.heroBody, { color: colors.textSoft }]}>
              Session mode is designed for tutorial centres and JAMB cafes that
              run one-off guidance sessions with walk-in students. Your
              organisation works from the aggregate dashboard instead.
            </Text>
          </View>
        )}
      </ScrollView>
    </AdminShell>
  );
}

export default SessionModeScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  hero: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.xxxl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  heroIcon: { fontSize: FontSize.xs, fontWeight: "900", letterSpacing: 1 },
  heroTitle: {
    fontSize: FontSize.xxl,
    textAlign: "center",
  },
  heroBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
    textAlign: "center",
    maxWidth: 520,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  card: {
    flex: 1,
    minWidth: 220,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  cardIcon: { fontSize: FontSize.sm, fontWeight: "900" },
  cardTitle: { fontSize: FontSize.md },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  action: {
    flex: 1,
    minWidth: 240,
    borderWidth: 1,
    borderRadius: Radius.sm,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  actionTitle: { fontSize: FontSize.md, fontWeight: "800" },
  actionBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
});
