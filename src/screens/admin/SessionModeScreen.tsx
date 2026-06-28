/**
 * SessionModeScreen — "Session / Provider mode" for tutorial centres & JAMB
 * registration cafés.
 *
 * These providers don't hold a student roster — they run a career-guidance
 * session WITH a walk-in student (provider-led, no stored PII). We read the
 * local educator profile: if providerSessionOnly is set (tutorial_centre /
 * jamb_cafe), we explain this is their mode and offer a disabled
 * "Start guidance session" CTA backed by a `coming_soon` envelope. Any other
 * org type sees a note that session mode is scoped to providers. No mock
 * sessions are ever rendered.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  webContainer,
} from "../../theme";
import { getEducatorProfile } from "../../lib/educatorProfile";
import { comingSoon } from "../../types/career";
import type { EducatorProfile } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

const SESSION_STEPS = [
  {
    icon: "🪑",
    title: "Sit with the student",
    body: "A walk-in student sits with you — no account creation, no roster entry, nothing stored about them.",
  },
  {
    icon: "🧭",
    title: "Run the guidance flow",
    body: "Step through programmes, domains and the roles they unlock, live, as a provider-led conversation.",
  },
  {
    icon: "🗑️",
    title: "Nothing persists",
    body: "When the session ends, nothing about the student is saved. The session is for guidance, not record-keeping.",
  },
];

export function SessionModeScreen() {
  const { colors } = useTheme();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((p) => {
      if (!active) return;
      setProfile(p);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const isProvider =
    profile?.providerSessionOnly === true ||
    profile?.organizationType === "tutorial_centre" ||
    profile?.organizationType === "jamb_cafe";

  const ctaState = comingSoon<never>(
    "Guidance sessions come online with the provider rollout.",
  );

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
              <Text style={styles.heroIcon}>🎯</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Run a career-guidance session
              </Text>
              <Text style={[styles.heroBody, { color: colors.textSoft }]}>
                This is your mode. As a tutorial centre / JAMB café you guide
                students one session at a time — provider-led, with no roster and
                no personal data stored.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                How a session works
              </Text>
              <View style={styles.cards}>
                {SESSION_STEPS.map((s) => (
                  <View
                    key={s.title}
                    style={[
                      styles.card,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={styles.cardIcon}>{s.icon}</Text>
                    <Text style={[styles.cardTitle, { color: colors.text }]}>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Start guidance session
              </Text>
              <ComingSoonPanel state={ctaState}>{() => null}</ComingSoonPanel>
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
            <Text style={styles.heroIcon}>ℹ️</Text>
            <Text style={[styles.heroTitle, { color: colors.text }]}>
              Session mode is for providers
            </Text>
            <Text style={[styles.heroBody, { color: colors.textSoft }]}>
              Session / provider mode is designed for tutorial centres and JAMB
              registration cafés, who run one-off career-guidance sessions with
              walk-in students. Your organisation works from the aggregate
              dashboard instead.
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
    borderRadius: Radius.xl,
    padding: Spacing.xxxl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  heroIcon: { fontSize: 30, marginBottom: Spacing.xs },
  heroTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.black,
    textAlign: "center",
  },
  heroBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.6,
    textAlign: "center",
    maxWidth: 460,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  cards: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  card: {
    flex: 1,
    minWidth: 220,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  cardIcon: { fontSize: 22 },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
