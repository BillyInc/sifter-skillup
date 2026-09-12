import React, { useState } from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View, type ViewStyle } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "../../theme";
import { SectionLabel } from "./RedesignPrimitives";
import { hasInternetConnection, OFFLINE_LINK_NOTICE } from "@/lib/networkState";

type ContextItem = {
  name?: unknown;
  priority?: unknown;
  source_ids?: unknown;
  evidence?: unknown;
  limitation?: unknown;
  evidence_limitation?: unknown;
};

type ContextRecord = Record<string, unknown>;

const SOURCE_LINKS: Record<string, { name: string; url: string }> = {
  global_esco: { name: "ESCO occupations and skills", url: "https://esco.ec.europa.eu/en/use-esco" },
  global_onet: { name: "O*NET OnLine", url: "https://www.onetcenter.org/database.html" },
  qt_cfqt: { name: "European Competence Framework for Quantum Technologies", url: "https://qt.eu/media/pdf/Competence_Framework_for_QT_v3.0_2025_official-version.pdf" },
  jff_xr: { name: "Jobs for the Future XR career pathways", url: "https://www.jff.org/idea/immersive-learning-xr-technology-skills-and-careers/" },
  global_xr: { name: "Khronos Group open standards", url: "https://www.khronos.org/" },
  global_game_dev: { name: "International Game Developers Association resources", url: "https://igda.org/resources/" },
  global_esports: { name: "Hitmarker esports and gaming jobs", url: "https://hitmarker.net/" },
  ng_cpn: { name: "Computer Professionals Registration Council of Nigeria", url: "https://www.cpn.gov.ng/" },
  ng_cpn_syllabus_2021: { name: "CPN 2021 Examination Syllabus", url: "https://www.cpn.gov.ng/download/2021_CPN_Examination_Syllabus%28Reviewed%29.pdf" },
  ng_nitda_ndpc_2024_2026: { name: "NITDA and NDPC digital-regulation sources", url: "https://ndpc.gov.ng/" },
  ng_nbte_nos_2026: { name: "NBTE National Occupational Standards", url: "https://www.digitalnbte.nbte.gov.ng/Public/PUCNOS" },
  ng_jobberman: { name: "Jobberman Nigeria jobs", url: "https://www.jobberman.com/jobs" },
  ng_myjobmag: { name: "MyJobMag Nigeria feeds", url: "https://www.myjobmag.com/feeds" },
};

export interface NigerianContextBlockProps {
  context?: Record<string, unknown>;
  level: "domain" | "subgroup" | "role";
  style?: ViewStyle;
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "skills", label: "Skills" },
  { key: "tools", label: "Tools" },
  { key: "competencies", label: "Competencies" },
  { key: "certifications", label: "Certifications" },
  { key: "regulatory_requirements", label: "Applicable rules" },
  { key: "role_names", label: "Role terminology" },
];

function record(value: unknown): ContextRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ContextRecord : {};
}

function items(value: unknown): ContextItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") return [{ name: item }];
    if (item && typeof item === "object" && !Array.isArray(item) && "name" in item) return [item as ContextItem];
    return [];
  });
}

function nameOf(item: ContextItem): string {
  return typeof item.name === "string" ? item.name.trim() : "";
}

function uniqueItems(values: ContextItem[]): ContextItem[] {
  const seen = new Set<string>();
  return values.filter((item) => {
    const name = nameOf(item).toLowerCase();
    if (!name || seen.has(name)) return false;
    seen.add(name);
    return true;
  });
}

function priorityLabel(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (value === "core") return "Core";
  if (value === "required_when_applicable" || value === "required_when_activity_applies") return "When applicable";
  if (value === "optional" || value === "specialisation") return "Optional";
  return value.replaceAll("_", " ");
}

function sourceRows(context: ContextRecord): { name: string; url?: string }[] {
  const summaries = Array.isArray(context.source_summaries) ? context.source_summaries : [];
  const rows = summaries.flatMap((value) => {
    const source = record(value);
    const name = typeof source.name === "string" ? source.name : typeof source.id === "string" ? source.id : "";
    const urls = Array.isArray(source.urls) ? source.urls.filter((url): url is string => typeof url === "string") : [];
    return name ? [{ name, url: urls[0] }] : [];
  });
  const seen = new Set(rows.map((row) => row.name.toLowerCase()));
  const ids = [
    ...(Array.isArray(context.source_ids) ? context.source_ids : []),
  ];
  for (const value of ids) {
    if (typeof value !== "string") continue;
    const fallback = SOURCE_LINKS[value];
    if (!fallback || seen.has(fallback.name.toLowerCase())) continue;
    rows.push(fallback);
    seen.add(fallback.name.toLowerCase());
  }
  return rows;
}

function Layer({ label, source, expanded }: { label: string; source: unknown; expanded: boolean }) {
  const { colors } = useTheme();
  const sourceRecord = record(source);
  const groups = CATEGORIES.map((category) => ({ ...category, items: uniqueItems(items(sourceRecord[category.key])) }))
    .filter((group) => group.items.length);
  if (!groups.length) return null;

  return (
    <View style={styles.layer}>
      <Text style={[styles.layerLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>{label}</Text>
      {groups.map((group) => (
        <View key={group.key} style={styles.category}>
          <Text style={[styles.categoryLabel, { color: colors.textRole.muted }]}>{group.label}</Text>
          {(expanded ? group.items : group.items.slice(0, 6)).map((item, index) => {
            const priority = priorityLabel(item.priority);
            const evidence = typeof item.evidence === "string" ? item.evidence.trim() : "";
            const limitation = typeof item.limitation === "string"
              ? item.limitation.trim()
              : typeof item.evidence_limitation === "string"
                ? item.evidence_limitation.trim()
                : "";
            return (
              <View key={`${group.key}-${nameOf(item)}-${index}`} style={styles.itemBlock}>
                <View style={styles.itemRow}>
                  <Text style={[styles.itemName, { color: colors.textRole.secondary }]}>{nameOf(item)}</Text>
                  {priority ? <Text style={[styles.priority, { color: colors.accentRole.action }]}>{priority}</Text> : null}
                </View>
                {evidence ? <Text style={[styles.itemExplanation, { color: colors.textRole.muted }]}>Why it appears: {evidence}</Text> : null}
                {limitation ? <Text style={[styles.itemExplanation, { color: colors.textRole.muted }]}>Evidence limit: {limitation}</Text> : null}
              </View>
            );
          })}
          {!expanded && group.items.length > 6 ? <Text style={[styles.moreHint, { color: colors.textRole.muted }]}>+ {group.items.length - 6} more in this category</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** Shows the source-backed context attached to an entity. */
export function NigerianContextBlock({ context, level, style }: NigerianContextBlockProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const data = record(context);
  const priority = record(data.priority_metadata);
  const starterKeys = level === "domain"
    ? ["recommended_portable_foundation", "recommended_domain_foundation"]
    : ["portable_domain_foundation", "recommended_portable_foundation", "recommended_domain_foundation", "recommended_next"];
  const starterItems = uniqueItems(starterKeys.flatMap((key) => items(priority[key]))).slice(0, 5);
  const actual = record(data.actual_enrichment);
  const fieldContext = record(data.domain_context_enrichment);
  const hasLayers = CATEGORIES.some((category) => items(actual[category.key]).length)
    || CATEGORIES.some((category) => items(fieldContext[category.key]).length);
  const sources = sourceRows(data);

  if (!starterItems.length && !hasLayers && !sources.length) return null;

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>Context that supports this guidance</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>
        These are source-backed context items attached to this {level}. Start with the suggested items, then review the fuller context if you need it. A listed item is not automatically required for every employer or route.
      </Text>
      {starterItems.length ? (
        <View style={[styles.startCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.startLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Suggested starting set</Text>
          {starterItems.map((item, index) => <Text key={`${nameOf(item)}-${index}`} style={[styles.startItem, { color: colors.textRole.primary }]}>{nameOf(item)}</Text>)}
        </View>
      ) : null}
      {expanded ? <>
        <Layer label="Local evidence" source={actual} expanded />
        <Layer label="Field context" source={fieldContext} expanded />
      </> : null}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}
      >
        <Text style={[styles.moreText, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>{expanded ? "Show fewer context items" : "See all context items"}</Text>
      </TouchableOpacity>
      {data.evidence_limit ? <Text style={[styles.limit, { color: colors.textRole.muted }]}>{String(data.evidence_limit)}</Text> : null}
      {sources.length ? (
        <View style={styles.sources}>
          <Text style={[styles.sourceLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Sources checked</Text>
          {sources.slice(0, expanded ? sources.length : 4).map((source, index) => (
            <TouchableOpacity key={`${source.name}-${index}`} disabled={!source.url} onPress={async () => { if (!source.url) return; if (!(await hasInternetConnection())) { setNotice(OFFLINE_LINK_NOTICE); return; } const opened = await Linking.openURL(source.url).then(() => true).catch(() => false); if (!opened) setNotice("This source could not be opened. Try again when your connection is stable."); }} accessibilityRole={source.url ? "link" : undefined}>
              <Text style={[styles.source, { color: source.url ? colors.accentRole.action : colors.textRole.secondary }]}>{source.name}{source.url ? " ↗" : ""}</Text>
            </TouchableOpacity>
          ))}
          {!expanded && sources.length > 4 ? <Text style={[styles.moreHint, { color: colors.textRole.muted }]}>+ {sources.length - 4} more source references</Text> : null}
          {notice ? <Text style={[styles.moreHint, { color: colors.textRole.muted }]}>{notice}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

export default NigerianContextBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  startCard: { gap: Spacing.xs, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md },
  startLabel: { fontSize: FontSize.xs, letterSpacing: 0.7, textTransform: "uppercase" },
  startItem: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.35 },
  layer: { gap: Spacing.sm },
  layerLabel: { fontSize: FontSize.xs, letterSpacing: 0.7, textTransform: "uppercase" },
  category: { gap: 4 },
  categoryLabel: { fontSize: FontSize.xs, fontWeight: "700" },
  itemBlock: { gap: 2 },
  itemRow: { flexDirection: "row", alignItems: "baseline", gap: Spacing.sm },
  itemName: { flex: 1, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.35 },
  priority: { fontSize: FontSize.xs, textTransform: "capitalize" },
  itemExplanation: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  moreHint: { fontSize: FontSize.xs },
  moreButton: { alignSelf: "flex-start", borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: FontSize.sm },
  limit: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  sources: { gap: 4 },
  sourceLabel: { fontSize: FontSize.xs, letterSpacing: 0.7, textTransform: "uppercase" },
  source: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
});
