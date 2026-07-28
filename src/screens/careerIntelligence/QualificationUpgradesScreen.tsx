/**
 * QualificationUpgradesScreen — the honest ladder of qualification upgrades.
 *
 * The model's spine is fixed editorial structure (always rendered): the
 * CORRECTED OND → Direct Entry → B.Sc route featured as the canonical model,
 * plus the alternative OND→HND→top-up and HND top-up / ELR routes named as
 * coverage. The per-route DETAIL (steps + requirements rows) is data and arrives
 * via the inner DataStateView — getQualificationUpgrades currently returns a
 * `coming_soon` envelope, so no routes are faked.
 *
 * The outer DetailScaffold is forced to a `real` envelope so the fixed editorial
 * cards render regardless of the data state; the inner DataStateView still shows
 * the graceful "being populated" state for the actual route rows.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { DetailScaffold, DataStateView } from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import {
  comingSoon,
  type DataState,
  type QualificationUpgrade,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  type ColorPalette,
} from "@/theme";

export function QualificationUpgradesScreen() {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<QualificationUpgrade[]>>(() =>
    comingSoon<QualificationUpgrade[]>(
      "Qualification-upgrade routes are being populated.",
    ),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getQualificationUpgrades();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DetailScaffold
      eyebrow="QUALIFICATION UPGRADES"
      title="Upgrade your qualification"
      pdf
      state={{ status: "real", data: state.data ?? [] }}
    >
      {() => (
        <View style={styles.body}>
          <Text style={[styles.lead, { color: colors.textRole.secondary }, CompassFonts.body]}>
            An OND or HND is not the ceiling — it&apos;s a rung. The routes below move
            you up the ladder honestly, naming the entry requirement and the real
            number of years each step takes, with no over-claiming.
          </Text>

          {/* The canonical model — fixed editorial card, always rendered. */}
          <OndDirectEntryModel colors={colors} />

          {/* Alternative routes named as coverage — fixed structure, not rows. */}
          <View
            style={[
              styles.alts,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.altsLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              Other routes covered
            </Text>
            {ALT_ROUTES.map((r) => (
              <Text
                key={r}
                style={[styles.altsItem, { color: colors.textRole.secondary }, CompassFonts.body]}
              >
                • {r}
              </Text>
            ))}
            <Text style={[styles.altsNote, { color: colors.textRole.muted }, CompassFonts.body]}>
              The step-by-step detail for these routes is being populated and
              appears below once it lands.
            </Text>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Route detail" icon="🪜" />
            <DataStateView
              state={state}
              empty={(routes) => routes.length === 0}
              emptyTitle="Route detail is being populated"
              emptyBody="The upgrade routes above are mapped — their step-by-step detail is being added and will appear here automatically."
            >
              {(routes) => (
                <View style={styles.routes}>
                  {routes.map((route) => (
                    <UpgradeCard
                      key={route.id}
                      route={route}
                      colors={colors}
                    />
                  ))}
                </View>
              )}
            </DataStateView>
          </View>
        </View>
      )}
    </DetailScaffold>
  );
}

/**
 * The corrected OND model route — the canonical example of an upgrade, so it is
 * fixed editorial structure (gold-accented) and always renders. This is the
 * model, NOT a data row.
 */
function OndDirectEntryModel({ colors }: { colors: ColorPalette }) {
  return (
    <View
      style={[
        styles.model,
        { backgroundColor: colors.goldSoft, borderColor: colors.gold },
      ]}
    >
      <Text style={[styles.modelEyebrow, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
        THE MODEL ROUTE
      </Text>
      <Text style={[styles.modelTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        OND → JAMB Direct Entry → 200L → B.Sc (3 yrs)
      </Text>
      <Text style={[styles.modelBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
        With an OND you apply through JAMB Direct Entry and enter the degree at
        200 level — completing the B.Sc in three years rather than starting again
        at 100 level.
      </Text>
      <Text style={[styles.modelReqLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
        What you need
      </Text>
      {OND_REQUIREMENTS.map((req) => (
        <Text key={req} style={[styles.modelReq, { color: colors.textRole.secondary }, CompassFonts.body]}>
          • {req}
        </Text>
      ))}
    </View>
  );
}

/** Entry requirements for the model OND route — fixed model facts, not data. */
const OND_REQUIREMENTS: string[] = [
  "Upper Credit in the OND",
  "OND in a field relevant to the degree",
  "The required O'level credits (incl. English & Maths where applicable)",
];

/** Alternative upgrade routes named as coverage — fixed structure, not rows. */
const ALT_ROUTES: string[] = [
  "OND → HND → degree top-up",
  "HND → B.Sc top-up programme",
  "ELR (Experience & Learning Route) for chartered/professional standing",
];

/** A single populated upgrade route — title, numbered steps, requirement bullets. */
function UpgradeCard({
  route,
  colors,
}: {
  route: QualificationUpgrade;
  colors: ColorPalette;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        {route.title}
      </Text>
      {route.body ? (
        <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
          {route.body}
        </Text>
      ) : null}

      {route.steps?.length ? (
        <View style={styles.steps}>
          {route.steps.map((step, i) => (
            <Text key={i} style={[styles.step, { color: colors.textRole.secondary }, CompassFonts.body]}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      ) : null}

      {route.requirements?.length ? (
        <View style={styles.reqs}>
          <Text style={[styles.reqLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
            Requirements
          </Text>
          {route.requirements.map((req, i) => (
            <Text key={i} style={[styles.req, { color: colors.textRole.secondary }, CompassFonts.body]}>
              • {req}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export default QualificationUpgradesScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.xl },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  model: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  modelEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
  },
  modelTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.xl * 1.2,
  },
  modelBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  modelReqLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  modelReq: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  alts: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  altsLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.5,
  },
  altsItem: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  altsNote: {
    fontSize: FontSize.xs,
    fontStyle: "italic",
    lineHeight: FontSize.xs * 1.5,
    marginTop: 4,
  },
  section: { gap: Spacing.sm },
  routes: { gap: Spacing.md },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  steps: { gap: 3, marginTop: 2 },
  step: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  reqs: { gap: 3, marginTop: Spacing.xs },
  reqLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  req: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
