/**
 * OrganisationProfileScreen — an employer profile: sector/country, an optional
 * "🇳🇬 Nigeria office" pill, a likelihood badge, and the opportunities open at
 * this organisation.
 *
 * The profile comes from careerData.getOrganisation and the opportunities list
 * from careerData.getOrganisations' sibling careerData.getOpportunities — both
 * return `coming_soon` envelopes today, so DetailScaffold and the inner
 * <DataStateView> render their graceful states automatically. When the routes
 * are wired the same JSX populates with no UI changes.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, type Router } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  type ColorPalette,
} from "../../theme";
import { careerData } from "../../lib/careerData";
import { opportunitiesNav } from "../../lib/opportunitiesNav";
import {
  comingSoon,
  type DataState,
  type Organisation,
  type Opportunity,
  type Likelihood,
} from "../../types/career";
import {
  DetailScaffold,
  DataStateView,
  OpportunityCard,
  SubscribeButton,
} from "../../components/careerIntelligence";

export interface OrganisationProfileScreenProps {
  organisationId: string;
}

const LIKELIHOOD_LABEL: Record<Likelihood, string> = {
  high: "🟢 High likelihood",
  medium: "🟡 Medium likelihood",
  low: "Low likelihood",
};

export function OrganisationProfileScreen({
  organisationId,
}: OrganisationProfileScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [state, setState] = useState<DataState<Organisation>>(() =>
    comingSoon<Organisation>("This employer profile is being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOrganisation(organisationId);
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
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
}: {
  data: Organisation;
  organisationId: string;
  router: Router;
  colors: ColorPalette;
}) {
  const subline = [data.sector, data.country].filter(Boolean).join(" · ");

  return (
    <View style={styles.body}>
      {subline ? (
        <Text style={[styles.subline, { color: colors.textSoft }]}>
          {subline}
        </Text>
      ) : null}

      {/* Pills: Nigeria office + likelihood */}
      <View style={styles.pillRow}>
        {data.nigeriaOffice ? (
          <View
            style={[
              styles.pill,
              { backgroundColor: colors.greenSoft, borderColor: colors.green },
            ]}
          >
            <Text style={[styles.pillText, { color: colors.green }]}>
              🇳🇬 Nigeria office
            </Text>
          </View>
        ) : null}
        {data.likelihood ? (
          <View
            style={[
              styles.pill,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.pillText, { color: colors.textSoft }]}>
              {LIKELIHOOD_LABEL[data.likelihood]}
            </Text>
          </View>
        ) : null}
      </View>

      <SubscribeButton target="organisation" targetId={organisationId} />

      {/* Opportunities at this organisation */}
      <OrganisationOpportunities router={router} colors={colors} />
    </View>
  );
}

/** The opportunities-at-this-org section — its own DataState + DataStateView. */
function OrganisationOpportunities({
  router,
  colors,
}: {
  router: Router;
  colors: ColorPalette;
}) {
  const [state, setState] = useState<DataState<Opportunity[]>>(() =>
    comingSoon<Opportunity[]>("Internships & jobs are being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOpportunities({});
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Opportunities here
      </Text>
      <DataStateView state={state} empty={(d) => d.length === 0}>
        {(opportunities) => (
          <View style={styles.cards}>
            {opportunities.map((o) => (
              <OpportunityCard
                key={o.id}
                opportunity={o}
                onPress={() => opportunitiesNav.opportunity(router, o.id)}
                subscribeSlot={
                  <SubscribeButton target="opportunity" targetId={o.id} />
                }
              />
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
  subline: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
  cards: { gap: Spacing.md },
});
