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
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
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
};

const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    key: "people",
    label: "People and society",
    description: "How people, groups, communities and institutions shape everyday life.",
  },
  {
    key: "foundations",
    label: "Ideas and foundations",
    description: "The key ideas, history, concepts and theories behind the programme.",
  },
  {
    key: "research",
    label: "Research and evidence",
    description: "How to ask questions, gather information and make sense of evidence.",
  },
  {
    key: "technology",
    label: "Technology and information",
    description: "The digital tools and information practices recorded in the curriculum.",
  },
  {
    key: "enterprise",
    label: "Enterprise and innovation",
    description: "Business, entrepreneurship, innovation and value-creation topics where recorded.",
  },
  {
    key: "practice",
    label: "Using what you learn",
    description: "Ways the curriculum asks students to apply, explain, present or create something.",
  },
  {
    key: "other",
    label: "Other programme topics",
    description: "Recorded topics that do not fit neatly into the wider reading themes.",
  },
];

const THEME_LOOKUP = new Map(THEME_DEFINITIONS.map((definition) => [definition.key, definition]));
const THEME_PREVIEW_COUNT = 2;
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

function sentenceCase(value: string): string {
  const text = value.trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
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
  const [expandedThemes, setExpandedThemes] = useState<Partial<Record<ThemeKey, boolean>>>({});
  const [showAll, setShowAll] = useState(false);

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

  const expandedCount = themes.reduce(
    (count, theme) => count + (expandedThemes[theme.key] || showAll ? theme.items.length : Math.min(THEME_PREVIEW_COUNT, theme.items.length)),
    0,
  );
  const hasHiddenThemes = themes.some((theme) => theme.items.length > THEME_PREVIEW_COUNT);
  const hasHiddenSupporting = supporting.length > SUPPORTING_PREVIEW_COUNT;

  const toggleTheme = (key: ThemeKey) => {
    setExpandedThemes((current) => ({ ...current, [key]: !current[key] }));
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
            const isOpen = Boolean(expandedThemes[theme.key] || showAll);
            const visibleItems = isOpen ? theme.items : theme.items.slice(0, THEME_PREVIEW_COUNT);
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
                <Text style={[styles.exampleLabel, { color: colors.textRole.muted }]}>Examples from this curriculum</Text>
                <View style={styles.list}>
                  {visibleItems.map((item, index) => (
                    <View
                      key={`${theme.key}-${normalized(item)}-${index}`}
                      style={[styles.row, { borderTopColor: colors.borderRole.subtle }]}
                    >
                      <Text style={[styles.bullet, { color: colors.accentRole.action }]}>•</Text>
                      <Text style={[styles.rowText, { color: colors.textRole.primary }]}>
                        {sentenceCase(item)}
                      </Text>
                    </View>
                  ))}
                </View>
                {theme.items.length > THEME_PREVIEW_COUNT ? (
                  <TouchableOpacity
                    onPress={() => toggleTheme(theme.key)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    style={styles.moreBtn}
                  >
                    <Text style={[styles.moreText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
                      {isOpen ? "Show fewer topics" : `See ${theme.items.length - THEME_PREVIEW_COUNT} more topics`}
                    </Text>
                  </TouchableOpacity>
                ) : null}
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

      {hasHiddenThemes ? (
        <TouchableOpacity onPress={() => setShowAll((current) => !current)} activeOpacity={0.75} accessibilityRole="button" accessibilityState={{ expanded: showAll }} style={styles.moreBtn}>
          <Text style={[styles.moreText, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>
            {showAll ? "Show the short learning profile" : "See all curriculum details"}
          </Text>
        </TouchableOpacity>
      ) : null}
      {!hasHiddenThemes && expandedCount < total ? (
        <Text style={[styles.note, { color: colors.textRole.muted }]}>Some source records may repeat a theme or be grouped under shared curriculum learning.</Text>
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
