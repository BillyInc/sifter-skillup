/**
 * AffiliationScreen — the school-code page.
 *
 * Students self-report their institution by entering its school code. That code
 * powers AGGREGATE attribution only — k-anonymised, with no PII and no
 * individual visibility. No real code or count ships this phase:
 * getAffiliationStats() and getMyOrganization() both return `coming_soon`, so we
 * render a styled code placeholder ("available after verification") with a
 * disabled copy affordance and explicit aggregate-only framing — never a fake
 * code or number.
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
import { adminData } from "../../lib/adminData";
import type { DataState } from "../../types/career";
import type { AffiliationStats, Organization } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

const PRIVACY_POINTS = [
  {
    icon: "📊",
    title: "Aggregate attribution only",
    body: "The code links students to your institution for counting purposes — never for individual visibility.",
  },
  {
    icon: "🛡️",
    title: "K-anonymised",
    body: "Counts are suppressed below a minimum threshold, so no individual can be re-identified from an aggregate.",
  },
  {
    icon: "🙅",
    title: "No PII",
    body: "Self-reported affiliation carries no names or contact details into your dashboard.",
  },
];

export function AffiliationScreen() {
  const { colors } = useTheme();
  const [stats, setStats] = useState<DataState<AffiliationStats>>({
    status: "pending",
    data: null,
  });
  const [org, setOrg] = useState<DataState<Organization>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    Promise.all([
      adminData.getAffiliationStats(),
      adminData.getMyOrganization(),
    ]).then(([s, o]) => {
      if (!active) return;
      setStats(s);
      setOrg(o);
    });
    return () => {
      active = false;
    };
  }, []);

  // Only show a real code if the org read is actually populated; otherwise the
  // styled placeholder makes clear the code is not yet available.
  const code =
    org.status === "real" && org.data
      ? // Organization has no schoolCode; affiliation stats carry it when live.
        (stats.status === "real" && stats.data?.schoolCode) || null
      : null;

  return (
    <AdminShell title="Affiliation" eyebrow="School code">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {/* Explainer */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your institution's school code
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Share this code with your students. When they enter it, they
            self-report their affiliation — which powers aggregate, k-anonymised
            attribution for your dashboard. It never grants access to any
            individual student's data.
          </Text>
        </View>

        {/* Code card */}
        <View
          style={[
            styles.codeCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            Shadow.xs,
          ]}
        >
          <Text style={[styles.codeLabel, { color: colors.textMuted }]}>
            SCHOOL CODE
          </Text>
          {code ? (
            <Text style={[styles.codeValue, { color: colors.text }]}>
              {code}
            </Text>
          ) : (
            <Text
              style={[
                styles.codePlaceholder,
                {
                  color: colors.textMuted,
                  backgroundColor: colors.bgSecondary,
                  borderColor: colors.border,
                },
              ]}
            >
              • • • • • •
            </Text>
          )}
          <View
            style={[
              styles.copyBtnDisabled,
              { backgroundColor: colors.bgSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.copyBtnText, { color: colors.textMuted }]}>
              {code ? "Copy code" : "Available after verification"}
            </Text>
          </View>
          <Text style={[styles.codeNote, { color: colors.textMuted }]}>
            Your code becomes active once your institution is verified and the
            school-code rollout is online.
          </Text>
        </View>

        {/* Aggregate count */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Affiliated students (aggregate)
          </Text>
          <ComingSoonPanel state={stats}>{() => null}</ComingSoonPanel>
        </View>

        {/* Privacy framing */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How affiliation respects privacy
          </Text>
          <View style={styles.cards}>
            {PRIVACY_POINTS.map((p) => (
              <View
                key={p.title}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={styles.cardIcon}>{p.icon}</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {p.title}
                </Text>
                <Text style={[styles.cardBody, { color: colors.textMuted }]}>
                  {p.body}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default AffiliationScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: -Spacing.xs,
  },
  codeCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.md,
  },
  codeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
  },
  codeValue: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.black,
    letterSpacing: 4,
  },
  codePlaceholder: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    letterSpacing: 8,
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    overflow: "hidden",
  },
  copyBtnDisabled: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    opacity: 0.7,
  },
  copyBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  codeNote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    textAlign: "center",
    maxWidth: 420,
  },
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
