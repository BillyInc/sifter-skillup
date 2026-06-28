/**
 * ElitePathwayDetailScreen — a single elite pathway: its Formation → Pinnacle
 * progression, the honest 6-layer bridge from a Nigerian start, and a short
 * self-check ("Is elite right for me?").
 *
 * getElitePathway / getEliteReadiness currently return `coming_soon` envelopes,
 * so DetailScaffold renders the graceful state automatically and the readiness
 * panel reads "coming soon" — no questions are faked. The populated body below is
 * what ships once elite data lands; the bridge layer TITLES always render (the
 * model's spine) via BridgeView even before a per-domain plan exists.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  DetailScaffold,
  BridgeView,
  LevelUpCTA,
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import {
  comingSoon,
  type DataState,
  type ElitePathway,
  type EliteStage,
  type BridgePlan,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  type ColorPalette,
} from "@/theme";

export interface ElitePathwayDetailScreenProps {
  pathwayId: string;
}

export function ElitePathwayDetailScreen({
  pathwayId,
}: ElitePathwayDetailScreenProps) {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<ElitePathway>>(() =>
    comingSoon<ElitePathway>("This elite pathway is being populated."),
  );
  const [bridge, setBridge] = useState<DataState<BridgePlan> | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getElitePathway(pathwayId);
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, [pathwayId]);

  // Load the per-domain 6-layer bridge plan once the pathway names one. Until
  // then BridgeView renders the canonical layer outline with no plan.
  const bridgePlanId = state.data?.bridgePlanId;
  useEffect(() => {
    if (!bridgePlanId) {
      setBridge(null);
      return;
    }
    let active = true;
    (async () => {
      const result = await careerData.getBridgePlan(bridgePlanId);
      if (active) setBridge(result);
    })();
    return () => {
      active = false;
    };
  }, [bridgePlanId]);

  return (
    <DetailScaffold
      eyebrow="ELITE PATHWAY"
      title={state.data?.name ?? "Elite pathway"}
      save={{ entityType: "elite_pathway", entityId: pathwayId }}
      pdf
      state={state}
    >
      {(data) => (
        <View style={styles.body}>
          {data.description ? (
            <Text style={[styles.lead, { color: colors.textSoft }]}>
              {data.description}
            </Text>
          ) : null}

          <View style={styles.section}>
            <SectionHeader title="Formation" icon="🌱" />
            <Text style={[styles.sectionNote, { color: colors.textMuted }]}>
              How you build toward this path from a Nigerian start.
            </Text>
            <StageList stages={data.formation} colors={colors} />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Pinnacle" icon="🏔️" />
            <Text style={[styles.sectionNote, { color: colors.textMuted }]}>
              What the top of this path looks like.
            </Text>
            <StageList stages={data.pinnacle} colors={colors} />
          </View>

          <View style={styles.section}>
            <SectionHeader title="The bridge" icon="🌉" />
            <BridgeView
              plan={bridge?.data ?? null}
              caption="How a Nigerian start bridges to this path."
            />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Is elite right for me?" icon="🧭" />
            <ReadinessPanel colors={colors} />
          </View>

          <LevelUpCTA
            title="Build toward this pathway"
            body="The elite path is a climb — start closing the gap in your world."
          />
        </View>
      )}
    </DetailScaffold>
  );
}

/** Render a Formation/Pinnacle stage list, or an honest pending line. */
function StageList({
  stages,
  colors,
}: {
  stages?: EliteStage[];
  colors: ColorPalette;
}) {
  if (!stages?.length) {
    return (
      <Text style={[styles.pending, { color: colors.textMuted }]}>
        🕐 Being populated
      </Text>
    );
  }
  return (
    <View style={styles.stages}>
      {stages.map((stage, i) => (
        <View
          key={`${stage.title}-${i}`}
          style={[
            styles.stage,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.stageTitle, { color: colors.text }]}>
            {stage.title}
          </Text>
          {stage.body ? (
            <Text style={[styles.stageBody, { color: colors.textSoft }]}>
              {stage.body}
            </Text>
          ) : null}
          {stage.milestones?.length ? (
            <View style={styles.milestones}>
              {stage.milestones.map((m, j) => (
                <Text
                  key={j}
                  style={[styles.milestone, { color: colors.textSoft }]}
                >
                  • {m}
                </Text>
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

/**
 * The self-check panel. getEliteReadiness returns `coming_soon` for now, so this
 * renders a tasteful structured "being populated" state — it explains what the
 * check is (a short honest self-check, NOT a personality test) without faking
 * any questions.
 */
function ReadinessPanel({ colors }: { colors: ColorPalette }) {
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getEliteReadiness();
      if (active) setReady((result.data?.length ?? 0) > 0);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Once questions land this branch would render the live check. For now it
  // stays null and the structured coming-soon panel below shows instead.
  if (ready) return null;

  return (
    <View
      style={[
        styles.readiness,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={styles.readinessIcon}>🧭</Text>
      <Text style={[styles.readinessTitle, { color: colors.text }]}>
        A short, honest self-check — coming soon
      </Text>
      <Text style={[styles.readinessBody, { color: colors.textSoft }]}>
        This is a few honest questions about fit and trade-offs — not a
        personality test, and there are no wrong answers. It's being populated
        so it can point you to where you'd realistically start.
      </Text>
    </View>
  );
}

export default ElitePathwayDetailScreen;

const styles = StyleSheet.create({
  body: {
    gap: Spacing.xl,
  },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionNote: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  pending: { fontSize: FontSize.sm, fontStyle: "italic" },
  stages: { gap: Spacing.md },
  stage: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  stageTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  stageBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  milestones: { gap: 3, marginTop: 2 },
  milestone: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  readiness: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.xs,
    alignItems: "flex-start",
  },
  readinessIcon: { fontSize: 28 },
  readinessTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  readinessBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
