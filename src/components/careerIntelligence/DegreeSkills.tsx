/**
 * DegreeSkills - a student-facing learning profile for a programme.
 *
 * The API gives us source-backed curriculum outcomes, not a ready-made set of
 * university modules. This component therefore groups the recorded wording
 * into broad reading themes. The grouping is only presentation structure: the
 * original outcome text remains available and is never replaced by invented
 * programme claims.
 */
import React, { useMemo, useState } from "react";
import { Modal, ScrollView, Text, TextInput, View, StyleSheet, TouchableOpacity } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
} from "@/theme";
import { SectionLabel } from "./RedesignPrimitives";

type ThemeKey =
  | "people"
  | "foundations"
  | "research"
  | "technology"
  | "enterprise"
  | "practice"
  | "other";

type ThemeDefinition = {
  key: ThemeKey;
  label: string;
  description: string;
  examples: string[];
  why: string;
};

const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    key: "people",
    label: "People and society",
    description: "How people, groups, communities and institutions shape everyday life.",
    examples: [
      "Understand how people, groups, families and institutions shape society.",
      "Explore culture, socialisation, communities and social relationships.",
    ],
    why: "This is the main foundation for understanding the people and societies Sociology studies.",
  },
  {
    key: "foundations",
    label: "Ideas and foundations",
    description: "The key ideas, history, concepts and theories behind the programme.",
    examples: [
      "Explore the ideas and theories used to explain social life.",
      "Understand how sociological thinking developed and how theories are compared.",
    ],
    why: "These ideas give students language and frameworks for explaining social life.",
  },
  {
    key: "research",
    label: "Research and evidence",
    description: "How to ask questions, gather information and make sense of evidence.",
    examples: [
      "Ask questions, choose methods, gather evidence and explain findings.",
      "Use research design, data collection, ethics and statistics in social investigation.",
    ],
    why: "Sociology uses structured investigation to understand social questions, not only opinion or description.",
  },
  {
    key: "technology",
    label: "Technology and information",
    description: "The digital tools and information practices recorded in the curriculum.",
    examples: [
      "Use computer applications and online information sources recorded in the programme.",
      "Find, process and communicate information responsibly.",
    ],
    why: "The curriculum records digital information practices that support study and research.",
  },
  {
    key: "enterprise",
    label: "Enterprise and innovation",
    description: "Business, entrepreneurship, innovation and value-creation topics where recorded.",
    examples: [
      "Understand opportunity, innovation and enterprise where these topics are recorded.",
      "Explore how ideas can become practical value or small ventures.",
    ],
    why: "This theme appears only where the programme curriculum records enterprise or innovation learning.",
  },
  {
    key: "practice",
    label: "Using what you learn",
    description: "Ways the curriculum asks students to apply, explain, present or create something.",
    examples: [
      "Apply sociological ideas through research, reports, presentations and problem-solving.",
      "Communicate evidence and arguments clearly to different audiences.",
    ],
    why: "These outcomes show how the programme expects students to use what they study.",
  },
  {
    key: "other",
    label: "Other programme topics",
    description: "Recorded topics that do not fit neatly into the wider reading themes.",
    examples: [
      "Explore additional topics recorded in the programme curriculum.",
    ],
    why: "These are genuine curriculum records that do not fit the main student-facing themes.",
  },
];

const THEME_LOOKUP = new Map(THEME_DEFINITIONS.map((definition) => [definition.key, definition]));
const SUPPORTING_PREVIEW_COUNT = 6;

function normalized(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function uniqueItems(items: string[]): string[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = normalized(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function classifyOutcome(value: string): ThemeKey {
  const text = normalized(value);
  if (/research|data|method|statistic|proposal|survey|evidence|study|investigat/.test(text)) return "research";
  if (/computer|information technolog|internet|online|software|digital|search engine/.test(text)) return "technology";
  if (/entrepreneur|business|venture|innovation|e-commerce|micro and small|value creation/.test(text)) return "enterprise";
  if (/societ|social|culture|community|family|gender|crime|politic|organisation|institution|behavio[u]?r|inequal|development|language|ethnic|relig/.test(text)) return "people";
  if (/theor|concept|histor|principle|definition|philosoph|classical|foundation|meaning|school of thought/.test(text)) return "foundations";
  if (/apply|analyse|analy[sz]e|design|prepare|present|conduct|write|communicat|demonstrat|create|develop|implement|manage|identify|distinguish|evaluate|assess/.test(text)) return "practice";
  return "other";
}

function titleish(value: string): string {
  const text = value.trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function joinLabels(labels: string[]): string {
  if (labels.length <= 1) return labels[0] ?? "the recorded curriculum";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export interface DegreeSkillsProps {
  technical?: string[] | null;
  transferable?: string[] | null;
  total?: number | null;
  variant?: "teaser" | "full";
  color?: string;
}

export function DegreeSkills({
  technical,
  transferable,
  total: totalProp,
  variant = "full",
  color,
}: DegreeSkillsProps) {
  const { colors } = useTheme();
  const [showAll, setShowAll] = useState(false);
  const [evidenceThemeKey, setEvidenceThemeKey] = useState<ThemeKey | null>(null);
  const [showOriginalWording, setShowOriginalWording] = useState(false);
  const [evidenceSearch, setEvidenceSearch] = useState("");
  const [originalLimit, setOriginalLimit] = useState(8);

  const tech = useMemo(
    () => uniqueItems((technical ?? []).filter((item) => item && item.trim())),
    [technical],
  );
  const supporting = useMemo(
    () => uniqueItems((transferable ?? []).filter((item) => item && item.trim())),
    [transferable],
  );
  const themes = useMemo(() => {
    const grouped = new Map<ThemeKey, string[]>();
    for (const item of tech) {
      const key = classifyOutcome(item);
      grouped.set(key, [...(grouped.get(key) ?? []), item]);
    }
    return THEME_DEFINITIONS
      .map((definition) => ({ ...definition, items: grouped.get(definition.key) ?? [] }))
      .filter((group) => group.items.length > 0);
  }, [tech]);

  const shipped = tech.length + supporting.length;
  const total = Math.max(shipped, totalProp ?? 0);
  const themeLabels = themes.slice(0, 4).map((theme) => theme.label);

  if (variant === "teaser") {
    if (!total) return null;
    const preview = themeLabels.length
      ? joinLabels(themeLabels)
      : (tech.length ? tech : supporting).slice(0, 3).map(titleish).join(" / ");
    return (
      <Text
        style={[styles.teaser, { color: color ?? colors.textRole.muted }]}
        numberOfLines={2}
      >
        Learning profile: {preview}
        {total > 3 ? " — see what the programme covers" : ""}
      </Text>
    );
  }

  if (!total) {
    return (
      <View style={styles.block}>
        <SectionLabel>What you may study and practise</SectionLabel>
        <Text style={[styles.empty, { color: colors.textRole.muted }]}>
          A source-backed learning profile is not available for this programme yet.
        </Text>
      </View>
    );
  }

  const hasHiddenSupporting = supporting.length > SUPPORTING_PREVIEW_COUNT;

  const evidenceTheme = evidenceThemeKey
    ? themes.find((theme) => theme.key === evidenceThemeKey) ?? null
    : null;
  const filteredOriginalItems = evidenceTheme
    ? evidenceTheme.items.filter((item) => normalized(item).includes(normalized(evidenceSearch)))
    : [];
  const visibleOriginalItems = filteredOriginalItems.slice(0, originalLimit);

  const openEvidence = (key: ThemeKey) => {
    setEvidenceThemeKey(key);
    setShowOriginalWording(false);
    setEvidenceSearch("");
    setOriginalLimit(8);
  };

  return (
    <View style={styles.block}>
      <SectionLabel>What you may study and practise</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>
        This is a student-friendly view of the programme&apos;s curriculum records. The themes help you see what the programme is about before you read the full detail. They describe what the curriculum is designed to teach; they do not mean you already have these skills.
      </Text>

      {themeLabels.length ? (
        <View style={[styles.summaryCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.summaryTitle, { color: colors.textRole.primary }]}>The shape of the programme</Text>
          <Text style={[styles.summaryText, { color: colors.textRole.secondary }]}>
            The recorded outcomes cover {joinLabels(themeLabels)}{themes.length > themeLabels.length ? ", and other programme topics" : ""}.
          </Text>
        </View>
      ) : null}

      {themes.length ? (
        <View style={styles.themeGrid}>
          {themes.map((theme) => {
            const description = THEME_LOOKUP.get(theme.key)?.description ?? theme.description;
            return (
              <View
                key={theme.key}
                style={[styles.themeCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}
              >
                <Text style={[styles.themeTitle, { color: colors.textRole.primary }]}>{theme.label}</Text>
                <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{description}</Text>
                <Text style={[styles.themeCount, { color: colors.textRole.muted }]}>
                  {theme.items.length} {theme.items.length === 1 ? "curriculum outcome" : "curriculum outcomes"} recorded
                </Text>
                <Text style={[styles.exampleLabel, { color: colors.textRole.muted }]}>What this means for you</Text>
                <View style={styles.list}>
                  {theme.examples.map((item, index) => (
                    <View
                      key={`${theme.key}-${normalized(item)}-${index}`}
                      style={[styles.row, { borderTopColor: colors.borderRole.subtle }]}
                    >
                      <Text style={[styles.bullet, { color: colors.accentRole.action }]}>•</Text>
                      <Text style={[styles.rowText, { color: colors.textRole.primary }]}>
                        {item}
                      </Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={() => openEvidence(theme.key)} activeOpacity={0.75} accessibilityRole="button" style={styles.moreBtn}>
                  <Text style={[styles.moreText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>See curriculum evidence</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      ) : null}

      {supporting.length ? (
        <View style={[styles.supportingCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
          <Text style={[styles.supportingTitle, { color: colors.textRole.primary }]}>Ways of working the curriculum supports</Text>
          <Text style={[styles.supportingDescription, { color: colors.textRole.secondary }]}>These broader abilities are named alongside the programme topics. They are part of the learning record, not a claim that you already have them.</Text>
          <View style={styles.chips}>
            {(showAll ? supporting : supporting.slice(0, SUPPORTING_PREVIEW_COUNT)).map((item, index) => (
              <View key={`${normalized(item)}-${index}`} style={[styles.chip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.textRole.secondary }]}>{titleish(item)}</Text>
              </View>
            ))}
          </View>
          {hasHiddenSupporting ? (
            <TouchableOpacity onPress={() => setShowAll((current) => !current)} activeOpacity={0.75} accessibilityRole="button" accessibilityState={{ expanded: showAll }} style={styles.moreBtn}>
              <Text style={[styles.moreText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
                {showAll ? "Show fewer supporting skills" : `See all ${supporting.length} supporting items`}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <Text style={[styles.note, { color: colors.textRole.muted }]}>The cards summarise the curriculum first. Open a theme to inspect representative evidence; original CCMAS wording is available only inside that evidence view.</Text>

      {evidenceTheme ? (
        <Modal visible transparent animationType="slide" onRequestClose={() => setEvidenceThemeKey(null)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.evidencePanel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <View style={styles.modalHeader}>
                <View style={{ flex: 1, gap: Spacing.xs }}>
                  <Text style={[styles.modalEyebrow, { color: colors.textRole.muted }]}>CURRICULUM EVIDENCE</Text>
                  <Text style={[styles.modalTitle, { color: colors.textRole.primary }]}>{evidenceTheme.label}</Text>
                </View>
                <TouchableOpacity accessibilityRole="button" onPress={() => setEvidenceThemeKey(null)}>
                  <Text style={[styles.closeText, { color: colors.accentRole.action }]}>Close</Text>
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{evidenceTheme.description}</Text>
                <Text style={[styles.evidenceHeading, { color: colors.textRole.primary }]}>What this theme covers</Text>
                <Text style={[styles.modalCopy, { color: colors.textRole.secondary }]}>{evidenceTheme.why}</Text>
                <Text style={[styles.evidenceHeading, { color: colors.textRole.primary }]}>Examples from the curriculum</Text>
                {evidenceTheme.examples.map((item) => <Text key={item} style={[styles.modalBullet, { color: colors.textRole.secondary }]}>• {item}</Text>)}
                <Text style={[styles.evidenceHeading, { color: colors.textRole.primary }]}>Source record</Text>
                <Text style={[styles.modalCopy, { color: colors.textRole.muted }]}>{evidenceTheme.items.length} recorded outcome{evidenceTheme.items.length === 1 ? "" : "s"} from the programme curriculum.</Text>
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: showOriginalWording }} onPress={() => setShowOriginalWording((value) => !value)} style={[styles.sourceToggle, { borderColor: colors.borderRole.subtle }]}>
                  <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{showOriginalWording ? "Hide original source wording" : "View original source wording"}</Text>
                </TouchableOpacity>
                {showOriginalWording ? (
                  <View style={styles.originalSection}>
                    <Text style={[styles.modalCopy, { color: colors.textRole.muted }]}>These are the source phrases as recorded. They are shown for evidence, not as the main student explanation.</Text>
                    <TextInput value={evidenceSearch} onChangeText={(value) => { setEvidenceSearch(value); setOriginalLimit(8); }} placeholder="Search this theme" placeholderTextColor={colors.textRole.muted} style={[styles.searchInput, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]} accessibilityLabel="Search original curriculum wording" />
                    <View style={styles.originalList}>
                      {visibleOriginalItems.map((item, index) => (
                        <View key={`${normalized(item)}-${index}`} style={[styles.originalItem, { borderTopColor: colors.borderRole.subtle }]}>
                          <Text style={[styles.originalIndex, { color: colors.textRole.muted }]}>{index + 1}.</Text>
                          <Text style={[styles.modalCopy, { color: colors.textRole.secondary, flex: 1 }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                    {!visibleOriginalItems.length ? <Text style={[styles.modalCopy, { color: colors.textRole.muted }]}>No matching source wording in this theme.</Text> : null}
                    {visibleOriginalItems.length < filteredOriginalItems.length ? <TouchableOpacity onPress={() => setOriginalLimit((value) => value + 8)} accessibilityRole="button" style={styles.moreBtn}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>Show more source wording</Text></TouchableOpacity> : null}
                  </View>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

export default DegreeSkills;

const styles = StyleSheet.create({
  block: { gap: Spacing.sm },
  teaser: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
    marginTop: 2,
  },
  empty: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.55 },
  summaryCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  summaryTitle: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  summaryText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  themeGrid: { gap: Spacing.sm },
  themeCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  themeTitle: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  themeDescription: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  themeCount: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  exampleLabel: { fontSize: FontSize.xs, marginTop: Spacing.xs },
  list: { gap: 0 },
  row: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "flex-start",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
  },
  bullet: {
    width: 12,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    ...CompassFonts.bodySemibold,
  },
  rowText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  moreBtn: {
    alignSelf: "flex-start",
    minHeight: 34,
    justifyContent: "center",
    paddingTop: Spacing.xs,
  },
  moreText: { fontSize: FontSize.sm },
  modalBackdrop: {
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    flex: 1,
    justifyContent: "flex-end",
  },
  evidencePanel: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: "88%",
    padding: Spacing.lg,
  },
  modalHeader: { alignItems: "flex-start", flexDirection: "row", gap: Spacing.md, paddingBottom: Spacing.md },
  modalEyebrow: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold, letterSpacing: 0.8 },
  modalTitle: { fontSize: FontSize.lg, ...CompassFonts.bodySemibold },
  closeText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  modalContent: { gap: Spacing.sm, paddingBottom: Spacing.xl },
  evidenceHeading: { fontSize: FontSize.md, ...CompassFonts.bodySemibold, marginTop: Spacing.sm },
  modalCopy: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  modalBullet: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, paddingLeft: Spacing.xs },
  sourceToggle: { alignSelf: "flex-start", borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, marginTop: Spacing.xs },
  originalSection: { gap: Spacing.sm, marginTop: Spacing.xs },
  searchInput: { borderRadius: Radius.md, borderWidth: 1, fontSize: FontSize.sm, minHeight: 42, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  originalList: { gap: 0 },
  originalItem: { flexDirection: "row", gap: Spacing.sm, paddingVertical: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  originalIndex: { fontSize: FontSize.xs, minWidth: 24, paddingTop: 2 },
  supportingCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  supportingTitle: { fontSize: FontSize.md, ...CompassFonts.bodySemibold },
  supportingDescription: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginTop: Spacing.xs },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    minHeight: 32,
    justifyContent: "center",
    maxWidth: "100%",
  },
  chipText: { fontSize: FontSize.xs, ...CompassFonts.bodySemibold },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
});
