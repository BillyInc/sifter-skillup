/**
 * StudentManagementScreen — the privacy centrepiece (the consent gate).
 *
 * Individual student visibility is locked BY DESIGN. We still call
 * adminData.getStudentRoster() to honour the contract, but it returns `locked`
 * (never coming_soon), and we render a deliberate, respectful lock state — never
 * a fabricated roster. Individual access requires a verified institution plus
 * student/guardian consent; until then this side is aggregate-only.
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
import { AdminShell } from "./AdminShell";

const REQUIREMENTS = [
  {
    icon: "🏛️",
    title: "Verified institution",
    body: "Your organisation must reach verified (Tier 2) status before any individual-level capability can be considered.",
  },
  {
    icon: "🧑‍🎓",
    title: "Student / guardian consent",
    body: "Each student — or their guardian, for minors — must explicitly grant consent. Consent is per-student and revocable.",
  },
  {
    icon: "📊",
    title: "Aggregate by default",
    body: "Everything the dashboard shows is k-anonymised aggregate intelligence. No names, no individual progress, ever, without consent.",
  },
];

export function StudentManagementScreen() {
  const { colors } = useTheme();
  const [roster, setRoster] = useState<DataState<never[]>>({
    status: "pending",
    data: null,
  });

  // Honour the read contract — this resolves to `locked`, by design.
  useEffect(() => {
    let active = true;
    adminData.getStudentRoster().then((r) => {
      if (active) setRoster(r);
    });
    return () => {
      active = false;
    };
  }, []);

  const notice =
    roster.meta?.notice ??
    "Individual student data stays private. Aggregate insights only — individual access requires verified consent.";

  return (
    <AdminShell title="Student management" eyebrow="Privacy-gated">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lock hero */}
        <View
          style={[
            styles.hero,
            { backgroundColor: colors.card, borderColor: colors.border },
            Shadow.xs,
          ]}
        >
          <View style={[styles.lockBadge, { backgroundColor: colors.bgSecondary }]}>
            <Text style={styles.lockGlyph}>🔒</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>
            Individual student data is private
          </Text>
          <Text style={[styles.heroBody, { color: colors.textSoft }]}>
            {notice}
          </Text>
        </View>

        {/* What it would take */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What individual visibility requires
          </Text>
          <View style={styles.cards}>
            {REQUIREMENTS.map((r) => (
              <View
                key={r.title}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={styles.cardIcon}>{r.icon}</Text>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {r.title}
                </Text>
                <Text style={[styles.cardBody, { color: colors.textMuted }]}>
                  {r.body}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          This is a design decision, not a missing feature. The institutional
          side is built to deliver labour-market intelligence in aggregate —
          individual records are never the default.
        </Text>
      </ScrollView>
    </AdminShell>
  );
}

export default StudentManagementScreen;

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
  lockBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  lockGlyph: { fontSize: 26 },
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
  footnote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.7,
    maxWidth: 560,
  },
});
