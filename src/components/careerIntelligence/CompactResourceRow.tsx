import React from "react";
import { StyleSheet, Text, View } from "react-native";
import type { CareerLearningResource } from "@/types/career";
import { FontSize, Radius, Spacing, useTheme } from "@/theme";
import { isStudentResource } from "./resourceLinks";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { RouteButton } from "./RouteButton";

export function resourceKind(resource: CareerLearningResource): string {
  switch (resource.resourceType) {
    case "programme_reading": return "Programme reference";
    case "domain_overview": return "Field reference";
    case "role_reference": return "Role reference";
    case "skill_learning": return "Learning resource";
    case "skill_reference": return "Skill reference";
    case "tool_learning": return "Tool guide";
    case "competency_reference": return "Competency reference";
    case "certification_exam": return "Qualification information";
    case "professional_body": return "Professional body";
    default: return "Reference";
  }
}

export function CompactResourceRow({ resource, contextLevel, onSave, saved = false }: {
  resource: CareerLearningResource;
  contextLevel?: "programme" | "domain" | "subgroup" | "role";
  onSave?: () => void;
  saved?: boolean;
}) {
  const { colors } = useTheme();
  const [savePlacement, setSavePlacement] = React.useState<"measure" | "inline" | "below">("measure");
  if (!resource.url || !isStudentResource(resource, contextLevel)) return null;
  const kind = resourceKind(resource);
  const title = resource.targetName || resource.provider;
  const saveFitsInline = Boolean(onSave && savePlacement === "inline");
  const access = resource.accessType === "free" ? "Free to access"
    : resource.accessType === "paid" ? "Paid; check provider" : "Check current details";
  return (
    <View testID="compact-resource-row-container" style={styles.container}>
      <View testID="compact-resource-row-line" style={[styles.row, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
        <View style={[styles.chip, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.chipText, { color: colors.textRole.secondary }]}>{kind}</Text>
        </View>
        <Text
          accessibilityLabel={title}
          numberOfLines={1}
          onLayout={(event) => {
            if (!onSave || savePlacement !== "measure") return;
            setSavePlacement(event.nativeEvent.layout.width >= MIN_INLINE_TITLE_WIDTH ? "inline" : "below");
          }}
          style={[styles.title, { color: colors.textRole.primary, minWidth: saveFitsInline ? MIN_INLINE_TITLE_WIDTH : 20 }]}
        >{title}</Text>
        <ExternalLinkGuard
          url={resource.url}
          label="Open"
          accessibilityLabel={`${kind}. ${title}. ${resource.provider}. ${access}. Open.`}
          description={`This opens ${kind.toLowerCase()}: ${title}, from ${resource.provider}. ${access}.`}
          controlRole="button"
          style={[styles.openButton, { borderColor: colors.accentRole.action }]}
          textStyle={styles.openButtonText}
        />
        {onSave && saveFitsInline ? <RouteButton label={saved ? "Saved" : "Save"} accessibilityLabel={saved ? `${title} saved` : `Save ${title}`} onPress={onSave} variant="quiet" /> : null}
      </View>
      {onSave && !saveFitsInline ? <RouteButton label={saved ? "Saved" : "Save"} accessibilityLabel={saved ? `${title} saved` : `Save ${title}`} onPress={onSave} variant="quiet" style={styles.saveBelow} /> : null}
    </View>
  );
}

const MIN_INLINE_TITLE_WIDTH = 120;

const styles = StyleSheet.create({
  container: { width: "100%", alignItems: "flex-start", gap: 8 },
  row: { width: "100%", minHeight: 44, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderRadius: Radius.md },
  saveBelow: { alignSelf: "flex-start" },
  chip: { minHeight: 22, justifyContent: "center", paddingHorizontal: 8, borderWidth: 1, borderRadius: Radius.full },
  chipText: { fontSize: 12, lineHeight: 16, fontWeight: "600" },
  title: { flex: 1, minWidth: 20, fontSize: 14, lineHeight: 18 },
  openButton: { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 16, borderWidth: 1, borderRadius: Radius.md },
  openButtonText: { fontSize: 16, lineHeight: 20, fontWeight: "600" },
});

export default CompactResourceRow;
