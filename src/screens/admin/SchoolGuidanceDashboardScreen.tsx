import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
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
import type { EducatorProfile } from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { StaggerReveal } from "@/components/animations/StaggerReveal";

type GuidanceCard = {
  label: string;
  value: string;
  note: string;
};

const CARDS: GuidanceCard[] = [
  {
    label: "Domains by university",
    value: "University paths",
    note: "Which institutions offer programmes that feed each career domain.",
  },
  {
    label: "Roles by university",
    value: "Role routes",
    note: "Which university programmes can lead toward specific roles.",
  },
  {
    label: "School comparison",
    value: "Compare two schools",
    note: "Check two universities or programmes side by side for student guidance.",
  },
];

const PATHWAY_ROWS = [
  ["Pick a domain", "Start from Science, Art or Commercial interests."],
  ["Compare universities", "Check two schools or programmes; this is not a peer benchmark of your own school."],
  ["Shortlist roles", "Connect programmes to roles and demand signals."],
];

export function SchoolGuidanceDashboardScreen() {
  const { colors } = useTheme();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);

  useEffect(() => {
    let active = true;
    getEducatorProfile().then((p) => {
      if (active) setProfile(p);
    });
    return () => {
      active = false;
    };
  }, []);

  const providerOnly = Boolean(profile?.providerSessionOnly);
  const title = providerOnly ? "Guidance sessions" : "School guidance";
  const orgName = profile?.organizationName || "Your organisation";

  return (
    <AdminShell title={title} eyebrow={orgName}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.heroTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Student pathway guidance
          </Text>
          <Text style={[styles.heroSub, { color: colors.textMuted }]}>
            Use university, domain and role intelligence from the student side of
            the graph, then move into roster or session work when needed.
          </Text>
        </View>

        <View style={styles.cardGrid}>
          {CARDS.map((card, i) => (<StaggerReveal key={card.label} index={i}>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                Shadow.xs,
              ]}
            >
              <Text style={[styles.cardLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
                {card.label}
              </Text>
              <Text style={[styles.cardValue, CompassFonts.displayBold, { color: colors.text }]}>
                {card.value}
              </Text>
              <Text style={[styles.cardNote, { color: colors.textMuted }]}>
                {card.note}
              </Text>
            </View>
          </StaggerReveal>))}
        </View>

        <View
          style={[
            styles.panel,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Guidance workflow
          </Text>
          {PATHWAY_ROWS.map(([label, detail], i) => (<StaggerReveal key={label} index={i}>
            <View
              style={[styles.row, { borderTopColor: colors.border }]}
            >
              <Text style={[styles.rowLabel, CompassFonts.bodyBold, { color: colors.text }]}>
                {label}
              </Text>
              <Text style={[styles.rowDetail, { color: colors.textMuted }]}>
                {detail}
              </Text>
            </View>
          </StaggerReveal>))}
        </View>

        <View
          style={[
            styles.panel,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Workspace
          </Text>
          <Text style={[styles.cardNote, { color: colors.textMuted }]}>
            {providerOnly
              ? "Tutorial centres use session guidance without claiming a school roster."
              : "Secondary schools can manage provisioned student accounts from Students."}
          </Text>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default SchoolGuidanceDashboardScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  hero: { gap: Spacing.xs },
  heroTitle: { fontSize: FontSize.xxl },
  heroSub: {
    maxWidth: 760,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  cardGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  card: {
    flex: 1,
    minWidth: 220,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  cardLabel: {
    fontSize: FontSize.xs,
    textTransform: "uppercase",
  },
  cardValue: { fontSize: FontSize.lg },
  cardNote: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  panel: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: { fontSize: FontSize.lg },
  row: {
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
    gap: 2,
  },
  rowLabel: { fontSize: FontSize.md },
  rowDetail: { fontSize: FontSize.sm },
});
