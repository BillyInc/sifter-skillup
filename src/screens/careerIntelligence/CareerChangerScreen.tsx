/**
 * CareerChangerScreen — an honest model for changing direction. The FOUR change
 * types (job switch · adjacent pivot · significant change · forced change) are
 * the model's spine, so their headers always render. Each is filled with its
 * CareerChangerPath body and a skills-translation matrix (from → to, with the
 * bridge credential as a pill) when data lands.
 *
 * getCareerChangerPaths currently returns a `coming_soon` envelope, so each
 * change-type block shows an honest "being populated" line instead of any faked
 * translation rows. The four headers and the intro are fixed structure and
 * always render; the matrices below are what ship once the path data lands.
 */
import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { DetailScaffold } from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import {
  comingSoon,
  type DataState,
  type CareerChangeType,
  type CareerChangerPath,
  type SkillsTranslation,
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

// The four change types are the model spine — fixed order, always rendered.
const CHANGE_TYPES: { type: CareerChangeType; title: string; icon: string }[] = [
  { type: "job_switch", title: "Job switch", icon: "🔁" },
  { type: "adjacent_pivot", title: "Adjacent pivot", icon: "↗️" },
  { type: "significant_change", title: "Significant change", icon: "🧭" },
  { type: "forced_change", title: "Forced change", icon: "🛟" },
];

// Honest one-liners describing each change type until path bodies are populated.
const CHANGE_TYPE_HINTS: Record<CareerChangeType, string> = {
  job_switch: "Same field, new employer or role — your skills carry over.",
  adjacent_pivot: "A neighbouring field — most of your skills still count.",
  significant_change: "A real domain change — a deliberate bridge is needed.",
  forced_change: "Redundancy or a sector collapse — rebuilding with what you have.",
};

export function CareerChangerScreen() {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<CareerChangerPath[]>>(() =>
    comingSoon<CareerChangerPath[]>("Career-change pathways are being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getCareerChangerPaths();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Index any populated paths by change type so each fixed block can fill in.
  const byType = useMemo(() => {
    const map = new Map<CareerChangeType, CareerChangerPath>();
    for (const path of state.data ?? []) map.set(path.type, path);
    return map;
  }, [state.data]);

  return (
    <DetailScaffold
      eyebrow="CAREER CHANGE"
      title="Change direction, honestly"
      pdf
      state={{ status: "real", data: state.data ?? [] }}
    >
      {() => (
        <View style={styles.body}>
          <Text style={[styles.lead, { color: colors.textSoft }]}>
            Changing career is not starting from zero — it's translating what you
            already have. The four blocks below cover every kind of move, from a
            sideways job switch to a forced reset. Each one maps your current
            skills to the new field and names the bridge credential that makes
            the jump credible.
          </Text>

          <View
            style={[
              styles.examples,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.examplesLabel, { color: colors.textMuted }]}>
              Examples of the pivots covered
            </Text>
            {EXAMPLE_PIVOTS.map((ex) => (
              <Text
                key={ex}
                style={[styles.examplesItem, { color: colors.textSoft }]}
              >
                • {ex}
              </Text>
            ))}
            <Text style={[styles.examplesNote, { color: colors.textMuted }]}>
              Illustrative of the coverage — the live matrices below are being
              populated.
            </Text>
          </View>

          {CHANGE_TYPES.map(({ type, title, icon }) => (
            <ChangeTypeBlock
              key={type}
              title={title}
              icon={icon}
              hint={CHANGE_TYPE_HINTS[type]}
              path={byType.get(type)}
              colors={colors}
            />
          ))}
        </View>
      )}
    </DetailScaffold>
  );
}

/** The priority Nigerian pivots — illustrative examples of coverage, not rows. */
const EXAMPLE_PIVOTS: string[] = [
  "Banking ↔ fintech",
  "Engineer → Product Manager (PMP)",
  "Teacher → L&D (CIPD)",
  "Nurse → Global Health (MPH)",
  "Accountant → Investment Analyst (CFA)",
];

/** One of the four fixed change-type blocks. Header always renders; body and
 *  the skills-translation matrix fill in when the path data is present. */
function ChangeTypeBlock({
  title,
  icon,
  hint,
  path,
  colors,
}: {
  title: string;
  icon: string;
  hint: string;
  path?: CareerChangerPath;
  colors: ColorPalette;
}) {
  const translations = path?.translations ?? [];
  return (
    <View style={styles.section}>
      <SectionHeader title={title} icon={icon} />
      <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>

      {path?.body ? (
        <Text style={[styles.blockBody, { color: colors.textSoft }]}>
          {path.body}
        </Text>
      ) : null}

      {translations.length ? (
        <View style={styles.matrix}>
          {translations.map((t) => (
            <TranslationRow key={t.id} translation={t} colors={colors} />
          ))}
        </View>
      ) : (
        <Text style={[styles.pending, { color: colors.textMuted }]}>
          🕐 This skills-translation matrix is being populated.
        </Text>
      )}
    </View>
  );
}

/** A from → to translation, with the bridge credential as a pill. */
function TranslationRow({
  translation,
  colors,
}: {
  translation: SkillsTranslation;
  colors: ColorPalette;
}) {
  return (
    <View
      style={[
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View style={styles.routeLine}>
        <Text style={[styles.from, { color: colors.text }]}>
          {translation.from}
        </Text>
        <Text style={[styles.arrow, { color: colors.textMuted }]}>→</Text>
        <Text style={[styles.to, { color: colors.text }]}>{translation.to}</Text>
      </View>
      {translation.bridgeCredential ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.credentialRow}
        >
          <View style={[styles.credentialPill, { backgroundColor: colors.goldSoft }]}>
            <Text style={[styles.credentialText, { color: Brand.primaryDeep }]}>
              {translation.bridgeCredential}
            </Text>
          </View>
        </ScrollView>
      ) : null}
      {translation.notes ? (
        <Text style={[styles.notes, { color: colors.textSoft }]}>
          {translation.notes}
        </Text>
      ) : null}
    </View>
  );
}

export default CareerChangerScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.xl },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  examples: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  examplesLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.5,
  },
  examplesItem: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  examplesNote: {
    fontSize: FontSize.xs,
    fontStyle: "italic",
    lineHeight: FontSize.xs * 1.5,
    marginTop: 4,
  },
  section: { gap: Spacing.sm },
  hint: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  blockBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  matrix: { gap: Spacing.sm },
  pending: { fontSize: FontSize.sm, fontStyle: "italic" },
  row: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  routeLine: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  from: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  arrow: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  to: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  credentialRow: { gap: Spacing.sm },
  credentialPill: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: "center",
  },
  credentialText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  notes: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
});
