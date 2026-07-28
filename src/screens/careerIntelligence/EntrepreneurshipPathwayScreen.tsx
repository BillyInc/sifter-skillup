/**
 * EntrepreneurshipPathwayScreen — first-class "build a business" route.
 *
 * Entrepreneurship is not just a JAMB programme match. It is a venture pathway
 * that can start from a skill, a domain, a market problem or a school project.
 * This page gives it a dedicated product surface while the enrichment graph
 * catches up with venture-specific skills, tools and demand signals.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  webContainer,
  type ColorPalette,
} from "@/theme";

const STARTING_POINTS = [
  {
    title: "I have an idea",
    body: "Test the customer, problem, price and channel before choosing what to build.",
  },
  {
    title: "I have a skill",
    body: "Turn design, food, coding, repair, tutoring, sales or craft skill into a service or product path.",
  },
  {
    title: "I know my programme",
    body: "Map your course to venture routes, useful domains and the practical skills you still need.",
  },
  {
    title: "I see a market problem",
    body: "Start from demand: who pays, how often, what substitute exists, and what proof you can collect.",
  },
];

const BUSINESS_CAPABILITIES = [
  "Customer discovery",
  "Sales and distribution",
  "Pricing and unit economics",
  "Bookkeeping and tax readiness",
  "Operations and supply chains",
  "Digital marketing",
  "Product design",
  "Regulation and compliance",
];

const DOMAIN_LINKS = [
  "Accounting and finance",
  "Marketing and growth",
  "Operations management",
  "Product and design",
  "Software and automation",
  "Supply chain and logistics",
  "Legal and compliance",
  "Data and market research",
];

export function EntrepreneurshipPathwayScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/explore/pathways" as any);
        }}
        style={[styles.backButton, { borderColor: colors.borderRole.subtle }]}
      >
        <Text style={[styles.backText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
        ENTREPRENEURSHIP PATHWAY
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Build a business
      </Text>
      <Text style={[styles.lead, { color: colors.textRole.secondary }, CompassFonts.body]}>
        A venture path for students, graduates and early founders. Start from
        what you know, what you can make, or the market problem you want to
        solve.
      </Text>

      <View style={styles.grid}>
        {STARTING_POINTS.map((item) => (
          <InfoCard key={item.title} title={item.title} body={item.body} colors={colors} />
        ))}
      </View>

      <Section title="What the graph will track" colors={colors}>
        <Text style={[styles.copy, { color: colors.textRole.muted }, CompassFonts.body]}>
          Entrepreneurship needs a different readiness model from employment.
          LevelUp will track capability, evidence and market access: customer
          proof, revenue model, route to market, operating costs, compliance
          risk, tools, and the domains that strengthen the venture.
        </Text>
      </Section>

      <Section title="Core capabilities" colors={colors}>
        <View style={styles.chips}>
          {BUSINESS_CAPABILITIES.map((item) => (
            <Text
              key={item}
              style={[
                styles.chip,
                { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }, CompassFonts.bodyBold,
              ]}
            >
              {item}
            </Text>
          ))}
        </View>
      </Section>

      <Section title="Useful domain lenses" colors={colors}>
        <View style={styles.chips}>
          {DOMAIN_LINKS.map((item) => (
            <Text
              key={item}
              style={[
                styles.chip,
                { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }, CompassFonts.bodyBold,
              ]}
            >
              {item}
            </Text>
          ))}
        </View>
      </Section>

      <View
        style={[
          styles.note,
          { backgroundColor: colors.accentRole.action + "0A", borderColor: colors.accentRole.action },
        ]}
      >
        <Text style={[styles.noteTitle, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
          Product decision
        </Text>
        <Text style={[styles.noteBody, { color: colors.textRole.primary }, CompassFonts.body]}>
          Entrepreneurship stays inside LevelUp as a pathway, but it is not
          forced into the same job-posting rank as employed roles. It will use
          business-readiness evidence plus adjacent domain skills and tools.
        </Text>
      </View>
    </ScrollView>
  );
}

function Section({
  title,
  children,
  colors,
}: {
  title: string;
  children: React.ReactNode;
  colors: ColorPalette;
}) {
  return (
    <View style={[styles.section, { borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoCard({
  title,
  body,
  colors,
}: {
  title: string;
  body: string;
  colors: ColorPalette;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text>
      <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>{body}</Text>
    </View>
  );
}

export default EntrepreneurshipPathwayScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    justifyContent: "center",
  },
  backText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.display * 1.15,
  },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.45,
    maxWidth: 780,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    minWidth: 240,
    flex: 1,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  section: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
  },
  copy: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.55,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  note: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  noteTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
  },
  noteBody: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
});
