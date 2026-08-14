/**
 * DomainMappingExplainer — a mobile bottom-sheet that explains, in plain
 * language, how one programme can map to several domains and roles.
 *
 * It replaces any notion of "school/programme variations" with the honest
 * model: a programme links to domains by match strength (Direct / Functional /
 * Adjacent), and within a matched domain each role is a Match or Adjacent fit by
 * skill coverage. This is *why* the same programme appears under more than one
 * domain — surfaced as an "ⓘ How mapping works" affordance, never as fake data.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight, Brand } from "../../theme";

export interface DomainMappingExplainerProps {
  visible: boolean;
  onClose: () => void;
}

const DOMAIN_ROWS: { dot: string; title: string; body: string }[] = [
  {
    dot: "🎯",
    title: "Direct",
    body: "The programme's stated purpose IS the domain's core function. The most natural fit.",
  },
  {
    dot: "🔁",
    title: "Functional",
    body: "The curriculum content maps into the domain even though the title points elsewhere.",
  },
  {
    dot: "🧭",
    title: "Adjacent",
    body: "Foundational or transferable overlap only — a real switch that needs bridging skills first.",
  },
];

const ROLE_ROWS: { dot: string; title: string; body: string }[] = [
  {
    dot: "✅",
    title: "Match",
    body: "You already cover most of the role's essential skills — a direct, ready fit.",
  },
  {
    dot: "➕",
    title: "Adjacent",
    body: "A partial fit; the mapping shows the additional skills to review.",
  },
];

export function DomainMappingExplainer({
  visible,
  onClose,
}: DomainMappingExplainerProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={[
            styles.sheet,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: colors.border }]} />

          <ScrollView
            style={{ maxHeight: 460 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.title, { color: colors.text }]}>
              How mapping works
            </Text>
            <Text style={[styles.intro, { color: colors.textSoft }]}>
              One programme can open several career domains. We rank them by how
              strongly the programme maps in — so you see the closest fits first.
            </Text>

            <Text style={[styles.groupLabel, { color: Brand.primaryDeep }]}>
              DOMAINS — by match strength
            </Text>
            {DOMAIN_ROWS.map((r) => (
              <ExplainerRow key={r.title} {...r} colors={colors} />
            ))}

            <Text
              style={[
                styles.groupLabel,
                { color: Brand.primaryDeep, marginTop: Spacing.lg },
              ]}
            >
              ROLES — within a matched domain
            </Text>
            {ROLE_ROWS.map((r) => (
              <ExplainerRow key={r.title} {...r} colors={colors} />
            ))}

            <Text style={[styles.footnote, { color: colors.textMuted }]}>
              The subjects you enter only decide which programmes you can be
              admitted to — your programme alone determines the domains and roles
              it unlocks.
            </Text>
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={[styles.closeBtn, { backgroundColor: Brand.primary }]}
          >
            <Text style={[styles.closeText, { color: Brand.onPrimary }]}>
              Got it
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function ExplainerRow({
  dot,
  title,
  body,
  colors,
}: {
  dot: string;
  title: string;
  body: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowDot}>{dot}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: colors.textSoft }]}>{body}</Text>
      </View>
    </View>
  );
}

export default DomainMappingExplainer;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.black,
    marginBottom: Spacing.xs,
  },
  intro: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginBottom: Spacing.md,
  },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
    alignItems: "flex-start",
  },
  rowDot: { fontSize: 18, width: 24, textAlign: "center" },
  rowTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  rowBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
    marginTop: 1,
  },
  footnote: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    marginTop: Spacing.lg,
  },
  closeBtn: {
    minHeight: 48,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  closeText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
});
