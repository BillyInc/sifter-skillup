/**
 * PathwaysHubScreen — the special-flows hub. It links the four dedicated
 * starting-point / pivot flows (PhD · Career change · Qualification upgrades ·
 * Chartership & credentials) under one roof.
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
import { exploreNav } from "@/lib/exploreNav";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
  webContainer,
  type ColorPalette,
} from "@/theme";

type Nav = Pick<Router, "push" | "replace" | "back">;

// The four special flows — fixed structure, always rendered. Each navigates via
// exploreNav so the route strings stay centralised.
const PATHWAYS: {
  icon: string;
  title: string;
  body: string;
  go: (router: Nav) => void;
}[] = [
  {
    icon: "🎓",
    title: "PhD — beyond the lectureship",
    body: "The non-academic routes a doctorate actually opens, including the PhD-quant standalone.",
    go: (router) => exploreNav.phd(router),
  },
  {
    icon: "🔄",
    title: "Career change",
    body: "Translate what you already have — job switch, adjacent pivot, significant or forced change.",
    go: (router) => exploreNav.careerChange(router),
  },
  {
    icon: "⬆️",
    title: "Qualification upgrades",
    body: "Move up the ladder — OND → Direct Entry → B.Sc, HND top-ups and ELR routes.",
    go: (router) => exploreNav.qualificationUpgrades(router),
  },
  {
    icon: "📜",
    title: "Chartership & credentials",
    body: "Chartered routes and the credentials that travel — CEng/COREN, CFA, ICAN/ACCA, PLAB, SQE.",
    go: (router) => exploreNav.charterships(router),
  },
];

export function PathwaysHubScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>
        PATHWAYS
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        Special pathways
      </Text>
      <Text style={[styles.lead, { color: colors.textSoft }]}>
        Routes for every starting point and pivot.
      </Text>

      <View style={styles.cards}>
        {PATHWAYS.map((p) => (
          <PathwayCard
            key={p.title}
            icon={p.icon}
            title={p.title}
            body={p.body}
            onPress={() => p.go(router)}
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
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardText}>
        <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.cardBody, { color: colors.textMuted }]}>
          {body}
        </Text>
      </View>
      <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
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
