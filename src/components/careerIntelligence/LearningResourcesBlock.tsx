import React, { useEffect, useMemo } from "react";
import { Linking, Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { CompassFonts, FontSize, FontWeight, Radius, Spacing, useTheme } from "../../theme";
import type { CareerLearningResource } from "../../types/career";
import { careerData } from "../../lib/careerData";
import { hasInternetConnection, OFFLINE_LINK_NOTICE } from "../../lib/networkState";
import { SectionLabel } from "./RedesignPrimitives";

export interface LearningResourcesBlockProps {
  resources?: CareerLearningResource[];
  title?: string;
  style?: ViewStyle;
}

const GROUPS: {
  types: CareerLearningResource["resourceType"][];
  label: string;
}[] = [
  { types: ["domain_overview", "role_reference"], label: "Understand the work" },
  { types: ["skill_learning", "skill_reference"], label: "Build the skills" },
  { types: ["tool_learning"], label: "Learn the tools" },
  { types: ["competency_reference"], label: "Build the competencies" },
  { types: ["certification_exam", "professional_body"], label: "Professional exams and bodies" },
];

function accessLabel(resource: CareerLearningResource): string {
  if (resource.price != null && resource.currency) {
    const period = resource.pricePeriod ? ` (${resource.pricePeriod})` : "";
    return `${resource.currency} ${resource.price}${period}`;
  }
  if (resource.accessType === "free") return "Free to access";
  if (resource.accessType === "paid") return "Paid; check provider";
  if (resource.accessType === "mixed") return "Free and paid options";
  return "Check current details";
}

function resourceTitle(resource: CareerLearningResource): string {
  return resource.targetName || resource.provider;
}

function openLabel(resource: CareerLearningResource): string {
  switch (resource.resourceType) {
    case "skill_reference":
      return "Open skill reference";
    case "skill_learning":
      return "Open learning link";
    case "tool_learning":
      return "Open tool guide";
    case "certification_exam":
    case "professional_body":
      return "Open qualification information";
    default:
      return "Open resource";
  }
}

export function LearningResourcesBlock({
  resources,
  title = "Where to learn and go next",
  style,
}: LearningResourcesBlockProps) {
  const { colors } = useTheme();
  const [saved, setSaved] = React.useState<Record<string, boolean>>({});
  const [saving, setSaving] = React.useState<Record<string, boolean>>({});
  const [saveNotice, setSaveNotice] = React.useState<string | null>(null);
  const [expanded, setExpanded] = React.useState(false);
  const grouped = useMemo(() => {
    const unique = new Map<string, CareerLearningResource>();
    for (const resource of resources ?? []) {
      if (!resource.url) continue;
      unique.set(`${resource.resourceType}|${resource.targetName}|${resource.provider}`, resource);
    }
    return GROUPS.map((group) => ({
      ...group,
      resources: Array.from(unique.values())
        .filter((resource) => group.types.includes(resource.resourceType))
        ,
    })).filter((group) => group.resources.length > 0);
  }, [resources]);

  // Hydrate from the account-owned saved-items collection so the bookmark
  // state survives navigation, refreshes, and the mobile/web handoff. Guests
  // receive a locked envelope and simply retain the honest save prompt.
  useEffect(() => {
    let active = true;
    void careerData.getSavedItems().then((result) => {
      if (!active || result.status !== "real" || !result.data) return;
      const resourceKeys = result.data
        .filter((item) => item.entityType === "resource")
        .reduce<Record<string, boolean>>((acc, item) => {
          acc[item.entityId] = true;
          return acc;
        }, {});
      setSaved(resourceKeys);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!grouped.length) return null;

  const openResource = async (url: string) => {
    if (!(await hasInternetConnection())) {
      setSaveNotice(OFFLINE_LINK_NOTICE);
      return;
    }
    const opened = await Linking.openURL(url).then(() => true).catch(() => false);
    if (!opened) setSaveNotice("This link could not be opened. Try again when your connection is stable.");
  };

  return (
    <View style={[styles.container, style]}>
      <SectionLabel>{title}</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.muted }]}>
        Use these links to understand the domain, build the most useful skills, and check professional requirements.
      </Text>
       {grouped.map((group) => {
         const visibleResources = expanded ? group.resources : group.resources.slice(0, 8);
         return (
         <View key={group.label} style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.textRole.muted }]}>
            {group.label}
          </Text>
           {visibleResources.map((resource) => (
            <Pressable
              key={`${resource.resourceType}|${resource.targetName}|${resource.provider}`}
              accessibilityRole="link"
               onPress={() => { void openResource(resource.url); }}
              style={({ pressed }) => [
                styles.resource,
                {
                  backgroundColor: pressed ? colors.surface.subtle : colors.surface.raised,
                  borderColor: colors.borderRole.subtle,
                },
              ]}
            >
              <View style={styles.copy}>
                <Text style={[styles.name, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
                  {resourceTitle(resource)}
                </Text>
                <Text style={[styles.meta, { color: colors.textRole.muted }]}>
                  {resource.provider} | {accessLabel(resource)}
                </Text>
                {resource.description ? (
                  <Text style={[styles.description, { color: colors.textRole.secondary }]} numberOfLines={2}>
                    {resource.description}
                  </Text>
                ) : null}
              </View>
              <View style={styles.actions}>
                <Text style={[styles.open, { color: colors.accentRole.action }]}>{openLabel(resource)}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={async (event) => {
                    event.stopPropagation();
                    const key = resource.url;
                    if (saved[key] || saving[key]) return;
                    setSaving((current) => ({ ...current, [key]: true }));
                    try {
                      const result = await careerData.saveItem("resource", key, resourceTitle(resource));
                      if (result.status === "real") {
                        setSaved((current) => ({ ...current, [key]: true }));
                        setSaveNotice("Saved to My World");
                      } else {
                        setSaveNotice(result.meta?.notice ?? "Sign in to save resources to My World.");
                      }
                    } catch {
                      setSaveNotice("Could not save this resource yet. Try again.");
                    } finally {
                      setSaving((current) => ({ ...current, [key]: false }));
                    }
                  }}
                  accessibilityLabel={saved[resource.url] ? "Resource saved" : "Save resource"}
                  accessibilityState={{ disabled: Boolean(saved[resource.url] || saving[resource.url]) }}
                  style={styles.saveButton}
                >
                  <Text style={[styles.saveText, { color: colors.accentRole.action }]}>{saving[resource.url] ? "Saving…" : saved[resource.url] ? "Saved" : "Save"}</Text>
                </Pressable>
              </View>
            </Pressable>
           ))}
           {group.resources.length > 8 ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{expanded ? "Show fewer resources" : `See all ${group.resources.length} resources`}</Text></Pressable> : null}
         </View>
         );
       })}
      {saveNotice ? <Text style={[styles.saveNotice, { color: colors.textRole.muted }]}>{saveNotice}</Text> : null}
    </View>
  );
}

export default LearningResourcesBlock;

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  intro: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.45,
    marginTop: -Spacing.xs,
  },
  group: { gap: Spacing.sm },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  resource: {
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: Spacing.sm,
    minHeight: 58,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  copy: { flex: 1, gap: 2 },
  actions: { alignItems: "flex-end", gap: Spacing.xs },
  name: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.3 },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.3 },
  description: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  open: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, textDecorationLine: "underline" },
  saveButton: { paddingVertical: 3, paddingHorizontal: 2 },
  saveText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  saveNotice: { fontSize: FontSize.xs },
  moreButton: { alignSelf: "flex-start", borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
});
