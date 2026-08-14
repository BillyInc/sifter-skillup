/**
 * ElitePathwaysHubScreen — the hub for the elite domains: the
 * highest-selectivity global paths and how a Nigerian start reaches them.
 *
 * getElitePathways currently returns a `coming_soon` envelope, so DataStateView
 * renders the graceful state; the populated branch below is what ships once the
 * elite pathway data lands. Each card taps through to its detail via exploreNav.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { DataStateView, ElitePathwayCard } from "@/components/careerIntelligence";
import { careerData } from "@/lib/careerData";
import { useExploreNav } from "@/lib/exploreNav";
import { ELITE_DOMAIN_COUNT } from "@/lib/elitePathwayPolicy";
import {
  comingSoon,
  type DataState,
  type ElitePathwaySummary,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  FontSize,
  FontWeight,
  CompassFonts,
  webContainer,
} from "@/theme";
import CareerDisclaimer from "@/components/careerIntelligence/CareerDisclaimer";

export function ElitePathwaysHubScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const [state, setState] = useState<DataState<ElitePathwaySummary[]>>(() =>
    comingSoon<ElitePathwaySummary[]>("Elite pathways are being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getElitePathways();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Prefer the live count once real pathways land; fall back to the policy
  // constant while the envelope is still `coming_soon`.
  const domainCount =
    state.status === "real" && state.data?.length
      ? state.data.length
      : ELITE_DOMAIN_COUNT;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
        ELITE PATHWAYS
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        The {domainCount} elite domains
      </Text>
      <Text style={[styles.subtitle, { color: colors.textRole.secondary }, CompassFonts.body]}>
        The highest-selectivity global paths and how a Nigerian start reaches
        them.
      </Text>

      <Text style={[styles.note, { color: colors.textRole.muted }, CompassFonts.body]}>
        ⭐ Each path shows its Formation → Pinnacle progression and the honest
        bridge from a Nigerian start.
      </Text>

      <DataStateView state={state} empty={(p) => p.length === 0}>
        {(pathways) => (
          <View style={styles.cards}>
            {pathways.map((p) => (
              <ElitePathwayCard
                key={p.id}
                name={p.name}
                firms={p.firms}
                compensationLabel={p.compensationLabel}
                selectivityLabel={p.selectivityLabel}
                nigerianAdvantage={p.nigerianAdvantage}
                onPress={() => exploreNav.elitePathway(router, p.id)}
              />
            ))}
          </View>
        )}
      </DataStateView>
      <CareerDisclaimer variant="footer" />
    </ScrollView>
  );
}

export default ElitePathwaysHubScreen;

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
  subtitle: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.4,
  },
  note: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
  },
  cards: { gap: Spacing.md, marginTop: Spacing.xs },
});
