/**
 * PhdPathwayScreen — the honest reframe of "a PhD means lecturing, full stop".
 *
 * It names the multiple non-academic routes a doctorate actually opens, then
 * gives the PhD-Quant route its own emphasised callout because that path is
 * selected on a technical interview, not a CV.
 *
 * getPhdRoutes currently returns a `coming_soon` envelope, so the per-route
 * cards render via DataStateView's graceful state — no routes are faked. The
 * lead copy and the PhD-Quant callout are FIXED editorial structure (not data),
 * so they always render; the populated route cards below are what ship once the
 * route data lands.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  DetailScaffold,
  DataStateView,
  BridgeView,
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import {
  comingSoon,
  type DataState,
  type PhdRoute,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
  type ColorPalette,
} from "@/theme";

export function PhdPathwayScreen() {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<PhdRoute[]>>(() =>
    comingSoon<PhdRoute[]>("PhD pathways are being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getPhdRoutes();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DetailScaffold
      eyebrow="PHD PATHWAYS"
      title="Beyond the lectureship"
      pdf
      state={{ status: "real", data: state.data ?? [] }}
    >
      {() => (
        <View style={styles.body}>
          <Text style={[styles.lead, { color: colors.textSoft }]}>
            A PhD does not mean "lecturer or nothing". The lectureship is one
            exit — and not the highest-paid one. A doctorate is a research
            credential, and research is bought across policy, industry,
            consulting and finance.
          </Text>

          <View style={styles.routePreview}>
            <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
              The non-academic routes covered:
            </Text>
            {NON_ACADEMIC_ROUTES.map((label) => (
              <Text
                key={label}
                style={[styles.previewItem, { color: colors.textSoft }]}
              >
                • {label}
              </Text>
            ))}
          </View>

          {/* PhD-Quant standalone — fixed editorial callout, always rendered. */}
          <PhdQuantCallout colors={colors} />

          <View style={styles.section}>
            <SectionHeader title="Route detail" icon="🧭" />
            <DataStateView
              state={state}
              empty={(routes) => routes.length === 0}
              emptyTitle="Route detail is being populated"
              emptyBody="The seven non-academic routes above are mapped — their step-by-step detail is being added and will appear here automatically."
            >
              {(routes) => (
                <View style={styles.routes}>
                  {routes.map((route) => (
                    <PhdRouteCard
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

/** The seven non-academic routes — fixed model labels, not data rows. */
const NON_ACADEMIC_ROUTES: string[] = [
  "Research & policy (think-tanks, government, multilaterals)",
  "International-organisation direct research",
  "Quant finance & data science",
  "MBB management-consulting specialist",
  "Corporate R&D (industry labs)",
  "Research entrepreneurship (spin-outs, deep tech)",
  "Executive leadership",
];

/**
 * PhD-Quant standalone — the route is selected on a technical interview, not a
 * CV. This is a fixed editorial section (gold-accented), so it always renders.
 */
function PhdQuantCallout({ colors }: { colors: ColorPalette }) {
  return (
    <View
      style={[
        styles.callout,
        { backgroundColor: colors.goldSoft, borderColor: colors.gold },
      ]}
    >
      <Text style={styles.calloutIcon}>📈</Text>
      <Text style={[styles.calloutEyebrow, { color: Brand.primaryDeep }]}>
        PHD-QUANT · STANDALONE
      </Text>
      <Text style={[styles.calloutTitle, { color: colors.text }]}>
        The quant route hires on a technical interview, not a CV
      </Text>
      <Text style={[styles.calloutBody, { color: colors.textSoft }]}>
        Quant finance and data science are the one PhD exit where the
        institution on your degree barely matters. The selection is a technical
        bar: stochastic calculus (Shreve), competitive programming (Codeforces),
        and a Jane-Street-style internship or trading interview. Clear the bar
        and the door opens — no academic pedigree required.
      </Text>
      <View style={styles.signalRow}>
        {PHD_QUANT_SIGNALS.map((signal) => (
          <View
            key={signal}
            style={[styles.signalPill, { borderColor: colors.gold }]}
          >
            <Text style={[styles.signalText, { color: Brand.primaryDeep }]}>
              {signal}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const PHD_QUANT_SIGNALS: string[] = [
  "Shreve",
  "Codeforces",
  "Jane-Street-style internship",
];

/** A single PhD route card — title, body, signals as bullets, optional bridge. */
function PhdRouteCard({
  route,
  colors,
}: {
  route: PhdRoute;
  colors: ColorPalette;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        {route.title}
      </Text>
      {route.body ? (
        <Text style={[styles.cardBody, { color: colors.textSoft }]}>
          {route.body}
        </Text>
      ) : null}
      {route.signals?.length ? (
        <View style={styles.signals}>
          {route.signals.map((signal, i) => (
            <Text key={i} style={[styles.signal, { color: colors.textSoft }]}>
              • {signal}
            </Text>
          ))}
        </View>
      ) : null}
      {route.bridgePlanId ? (
        <View style={styles.bridge}>
          <BridgeView
            caption="How a Nigerian start bridges into this route."
          />
        </View>
      ) : null}
    </View>
  );
}

export default PhdPathwayScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.xl },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  routePreview: { gap: 4 },
  previewLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  previewItem: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  callout: {
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  calloutIcon: { fontSize: 32 },
  calloutEyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
  },
  calloutTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.xl * 1.2,
  },
  calloutBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  signalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  signalPill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: "center",
  },
  signalText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
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
  signals: { gap: 3, marginTop: 2 },
  signal: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  bridge: { marginTop: Spacing.sm },
});
