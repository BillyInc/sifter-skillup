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

export function SessionModeScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

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
                without saving personal learner data.
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
              <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
                Start guidance
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() =>
                    router.push(`/(admin)/workspace-explore/admission?mode=subjects&admin=1&admin_type=${encodeURIComponent(profile?.organizationType ?? "")}&class_name=JAMB` as never)
                  }
                  style={[
                    styles.action,
                    { backgroundColor: colors.accent, borderColor: colors.accent },
                  ]}
                >
                  <Text style={[styles.actionTitle, { color: colors.textInverse }]}>
                    Start from subjects
                  </Text>
                  <Text style={[styles.actionBody, { color: colors.textInverse }]}>
                    Check UTME and O-level subjects together before discussing
                    programme options.
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() =>
                    router.push(`/(admin)/workspace-explore/admission?mode=programme&admin=1&admin_type=${encodeURIComponent(profile?.organizationType ?? "")}&class_name=JAMB` as never)
                  }
                  style={[
                    styles.action,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.actionTitle, { color: colors.text }]}>
                    Start from programme
                  </Text>
                  <Text style={[styles.actionBody, { color: colors.textMuted }]}>
                    Search the course first, then check schools, variants and
                    requirements.
                  </Text>
                </TouchableOpacity>
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
