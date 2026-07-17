/**
 * PhdPathwayScreen — the honest reframe of "a PhD means lecturing, full stop".
 *
 * It names the multiple non-academic routes a doctorate can open, then keeps
 * the route detail locked until each path has source metadata, Nigerian-user
 * coverage, bridge steps, costs, and proof-of-concept status.
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
            A PhD is a research credential, not a single-job ticket. The
            platform treats it as a route selector: first we identify your PhD
            signal, then we map the verified bridge into academic, policy,
            industry, consulting, finance, or venture paths.
          </Text>

          <View style={styles.section}>
            <SectionHeader title="Start with the signal" icon="🎓" />
            <View style={styles.startingPoints}>
              {PHD_STARTING_POINTS.map((point) => (
                <View
                  key={point.title}
                  style={[
                    styles.startCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={styles.startIcon}>{point.icon}</Text>
                  <Text style={[styles.startTitle, { color: colors.text }]}>
                    {point.title}
                  </Text>
                  <Text style={[styles.startBody, { color: colors.textSoft }]}>
                    {point.body}
                  </Text>
                  <Text style={[styles.startBridge, { color: Brand.primaryDeep }]}>
                    {point.bridge}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.routePreview}>
            <Text style={[styles.previewLabel, { color: colors.textMuted }]}>
              Non-academic routes this page will unlock:
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
            <SectionHeader title="Unlock rule" icon="🔒" />
            <View
              style={[
                styles.unlockCard,
                { backgroundColor: colors.bgSecondary, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.unlockTitle, { color: colors.text }]}>
                Route detail stays locked until it passes evidence checks
              </Text>
              <Text style={[styles.unlockBody, { color: colors.textSoft }]}>
                Each route must show the global standard, Nigerian qualification
                map, bridge inventory, timeline and cost, Nigerian entry point,
                and proof-of-concept status before it becomes actionable.
              </Text>
              <View style={styles.checks}>
                {PHD_UNLOCK_CHECKS.map((check) => (
                  <Text
                    key={check}
                    style={[styles.check, { color: colors.textSoft }]}
                  >
                    🔒 {check}
                  </Text>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Locked route detail" icon="🧭" />
            <DataStateView
              state={state}
              empty={(routes) => routes.length === 0}
              emptyTitle="Locked"
              emptyBody="The route map is ready; the step-by-step detail opens only after verification."
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

const PHD_STARTING_POINTS: {
  icon: string;
  title: string;
  body: string;
  bridge: string;
}[] = [
  {
    icon: "🧪",
    title: "Nigerian PhD, limited publications",
    body:
      "High effort, but the international signal may still be weak if the work has limited indexed publication or global collaboration.",
    bridge:
      "Best next step: publication drive, fellowship, institutional research role, or technical route where the interview can prove ability.",
  },
  {
    icon: "🌍",
    title: "Published or internationally trained PhD",
    body:
      "A stronger global signal for research roles, international organisations, specialist consulting, research science, and postdoc routes.",
    bridge:
      "Best next step: apply directly where eligible, then fill interview, network, and proof gaps route by route.",
  },
];

const PHD_UNLOCK_CHECKS: string[] = [
  "Named sources for specific claims",
  "Nigerian qualification gap is explicit",
  "Timeline and cost reality is included",
  "Entry institutions or employers are named",
  "Proof of concept is documented or honestly marked unknown",
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
        The quant route is a technical-screen path
      </Text>
      <Text style={[styles.calloutBody, { color: colors.textSoft }]}>
        Quant finance and data science deserve their own route because selection
        can depend heavily on demonstrated mathematics, coding, probability, and
        interview performance. The platform should not promise access from a CV
        alone; it should show the technical bar and the evidence needed to clear
        it.
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
  "Probability & stochastic calculus",
  "Python/C++ proof",
  "Trading-style technical interviews",
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
  startingPoints: { gap: Spacing.md },
  startCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  startIcon: { fontSize: 24 },
  startTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  startBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  startBridge: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    fontWeight: FontWeight.bold,
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
  unlockCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  unlockTitle: { fontSize: FontSize.md, fontWeight: FontWeight.black },
  unlockBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  checks: { gap: 4, marginTop: 2 },
  check: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
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
