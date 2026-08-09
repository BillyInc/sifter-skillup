/**
 * PathwaysHubScreen — the special-flows hub. It links the four dedicated
 * starting-point / pivot flows (PhD · Career change · Qualification upgrades ·
 * Chartership & credentials · Entrepreneurship) under one roof.
 *
 * This hub carries no data of its own — the four cards are fixed editorial
 * structure that always render and route via exploreNav. Each downstream screen
 * handles its own `coming_soon` data envelope.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter, type Router } from "expo-router";
import { useExploreNav, type ExploreNav } from "@/lib/exploreNav";
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

type Nav = Pick<Router, "push" | "replace" | "back">;

// The special flows — fixed structure, always rendered. Each navigates via
// exploreNav so the route strings stay centralised. `go` takes the navigator
// as an argument rather than closing over the module-level one: this list is
// built at import time, but which stack it should route into (student tabs vs
// the admin shell) is only known at render.
const PATHWAYS: {
  icon: string;
  title: string;
  body: string;
  go: (router: Nav, nav: ExploreNav) => void;
}[] = [
  {
    icon: "🎓",
    title: "PhD — beyond the lectureship",
    body: "The non-academic routes a doctorate actually opens, including the PhD-quant standalone.",
    go: (router, nav) => nav.phd(router),
  },
  {
    icon: "🔄",
    title: "Career change",
    body: "Translate what you already have — job switch, adjacent pivot, significant or forced change.",
    go: (router, nav) => nav.careerChange(router),
  },
  {
    icon: "⬆️",
    title: "Qualification upgrades",
    body: "Move up the ladder — OND → Direct Entry → B.Sc, HND top-ups and ELR routes.",
    go: (router, nav) => nav.qualificationUpgrades(router),
  },
  {
    icon: "◆",
    title: "Chartership & credentials",
    body: "Chartered routes and the credentials that travel — CEng/COREN, CFA, ICAN/ACCA, PLAB, SQE.",
    go: (router, nav) => nav.charterships(router),
  },
  {
    icon: "▦",
    title: "Build a business",
    body: "For students and founders who want to turn a skill, market problem or programme into a venture path.",
    go: (router, nav) => nav.entrepreneurship(router),
  },
];

export function PathwaysHubScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
        PATHWAYS
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Special pathways
      </Text>
      <Text style={[styles.lead, { color: colors.textRole.secondary }, CompassFonts.body]}>
        Routes for every starting point and pivot.
      </Text>

      <View style={styles.cards}>
        {PATHWAYS.map((p) => (
          <PathwayCard
            key={p.title}
            icon={p.icon}
            title={p.title}
            body={p.body}
            onPress={() => p.go(router, exploreNav)}
            colors={colors}
          />
        ))}
      </View>
    </ScrollView>
  );
}

/** A large tappable card linking to one of the four special flows. */
function PathwayCard({
  icon,
  title,
  body,
  onPress,
  colors,
}: {
  icon: string;
  title: string;
  body: string;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.card,
        { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text>
        <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>
          {body}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textRole.muted }, CompassFonts.body]}>›</Text>
    </TouchableOpacity>
  );
}

export default PathwaysHubScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
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
    lineHeight: FontSize.md * 1.4,
  },
  cards: { gap: Spacing.md, marginTop: Spacing.sm },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 44,
  },
  cardIcon: { fontSize: 32 },
  cardText: { flex: 1, gap: 4 },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.black,
  },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  chevron: { fontSize: 28, fontWeight: FontWeight.bold },
});
