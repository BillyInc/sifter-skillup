/**
 * OrganisationProfileScreen — an employer profile: sector/country, Nigeria
 * office badge, likelihood indicator, and open opportunities.
 *
 * Phase 10 redesign: editorial layout, Feather icons, semantic tokens,
 * CompassFonts, responsive layout.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, type Router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  type ColorPalette,
} from "@/theme";
import { careerData } from "@/lib/careerData";
import { opportunitiesNav } from "@/lib/opportunitiesNav";
import { useResponsive } from "@/hooks/useResponsive";
import {
  comingSoon,
  type DataState,
  type Organisation,
  type Opportunity,
} from "@/types/career";
import {
  DetailScaffold,
  DataStateView,
  OpportunityCard,
  SubscribeButton,
} from "@/components/careerIntelligence";

export interface OrganisationProfileScreenProps {
  organisationId: string;
}

export function OrganisationProfileScreen({
  organisationId,
}: OrganisationProfileScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const resp = useResponsive();
  const [state, setState] = useState<DataState<Organisation>>(() =>
    comingSoon<Organisation>("This employer profile is being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOrganisation(organisationId);
      if (active) setState(result);
    })();
    return () => { active = false; };
  }, [organisationId]);

  return (
    <DetailScaffold
      eyebrow="EMPLOYER"
      title={state.data?.name ?? "Organisation"}
      save={{ entityType: "organisation", entityId: organisationId }}
      pdf
      state={state}
    >
      {(data) => (
        <OrganisationBody
          data={data}
          organisationId={organisationId}
          router={router}
          colors={colors}
          resp={resp}
        />
      )}
    </DetailScaffold>
  );
}

function OrganisationBody({
  data,
  organisationId,
  router,
  colors,
  resp,
}: {
  data: Organisation;
  organisationId: string;
  router: Router;
  colors: ColorPalette;
  resp: ReturnType<typeof useResponsive>;
}) {
  const subline = [data.sector, data.country].filter(Boolean).join(" · ");

  return (
    <View style={styles.body}>
      {/* Organisation header */}
      <View style={styles.orgHeader}>
        <View style={[styles.orgIcon, { backgroundColor: colors.surface.subtle }]}>
          <Feather name="briefcase" size={28} color={colors.accentRole.action} />
        </View>
        <View style={styles.orgInfo}>
          {subline ? (
            <Text style={[styles.subline, { color: colors.textRole.secondary }]}>
              {subline}
            </Text>
          ) : null}
          {/* Pills: Nigeria office + likelihood */}
          <View style={styles.pillRow}>
            {data.nigeriaOffice ? (
              <View style={[styles.pill, { backgroundColor: colors.successSoft, borderColor: colors.success }]}>
                <Feather name="map-pin" size={10} color={colors.success} style={{ marginRight: 4 }} />
                <Text style={[styles.pillText, { color: colors.success }, CompassFonts.bodyMedium]}>
                  Nigeria office
                </Text>
              </View>
            ) : null}
            {data.likelihood ? (
              <View style={[styles.pill, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <View style={[styles.likelihoodDot, { backgroundColor: data.likelihood === "high" ? colors.success : data.likelihood === "medium" ? colors.warning : colors.textRole.muted }]} />
                <Text style={[styles.pillText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
                  {data.likelihood === "high" ? "High likelihood" : data.likelihood === "medium" ? "Medium likelihood" : "Low likelihood"}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <SubscribeButton target="organisation" targetId={organisationId} />

      <OrganisationOpportunities router={router} colors={colors} resp={resp} />
    </View>
  );
}

function OrganisationOpportunities({
  router,
  colors,
  resp,
}: {
  router: Router;
  colors: ColorPalette;
  resp: ReturnType<typeof useResponsive>;
}) {
  const [state, setState] = useState<DataState<Opportunity[]>>(() =>
    comingSoon<Opportunity[]>("Verified Opportunities are being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOpportunities({});
      if (active) setState(result);
    })();
    return () => { active = false; };
  }, []);

  const isGrid = (resp.isDesktop || resp.isTablet) && resp.isWeb;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
        Opportunities here
      </Text>
      <DataStateView state={state} empty={(d) => d.length === 0}>
        {(opportunities) => (
          <View style={isGrid ? styles.cardsGrid : styles.cards}>
            {opportunities.map((o) => (
              <View key={o.id} style={isGrid ? styles.cardWrap : undefined}>
                <OpportunityCard
                  opportunity={o}
                  onPress={() => opportunitiesNav.opportunity(router, o.id)}
                  subscribeSlot={
                    <SubscribeButton target="opportunity" targetId={o.id} />
                  }
                />
              </View>
            ))}
          </View>
        )}
      </DataStateView>
    </View>
  );
}

export default OrganisationProfileScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.lg },
  orgHeader: {
    flexDirection: "row",
    gap: Spacing.lg,
    alignItems: "flex-start",
  },
  orgIcon: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  orgInfo: { flex: 1, gap: Spacing.sm },
  subline: { fontSize: FontSize.md },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  pillText: { fontSize: FontSize.xs },
  likelihoodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md },
  cards: { gap: Spacing.md },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  cardWrap: {
    flexBasis: 320,
    flexGrow: 1,
    minWidth: 280,
  },
});
