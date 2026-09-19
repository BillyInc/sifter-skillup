import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { CareerContextItem, CareerLearningResource } from "@/types/career";
import { ExternalLinkGuard } from "./ExternalLinkGuard";

type SourceReference = {
  id?: string;
  title?: string;
  url: string;
  region?: string | null;
  evidenceType?: string | null;
};

function validReference(reference: SourceReference): boolean {
  try {
    const url = new URL(reference.url);
    return (url.protocol === "https:" || url.protocol === "http:") && reference.url.trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Renders source evidence inside the item that it supports. Evidence links
 * are deliberately separate from a learning link: a source may support the
 * statement without being a course or documentation page for the item.
 */
export function ContextSourceLinks({
  item,
  resource,
  title = "Supporting sources",
}: {
  item?: CareerContextItem;
  resource?: CareerLearningResource;
  title?: string;
}) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const sources = useMemo(() => {
    const all: SourceReference[] = [
      ...(item?.sourceReferences ?? []),
      ...(item?.relationships ?? [])
        .filter((edge) => edge.relationshipStatus === "source_backed")
        .flatMap((edge) => edge.sourceReferences ?? []),
    ];
    if (resource?.sourceUrl) all.push({ title: `${resource.provider} source`, url: resource.sourceUrl });
    const seen = new Set<string>();
    return all.filter((reference) => {
      if (!validReference(reference) || seen.has(reference.url)) return false;
      seen.add(reference.url);
      return reference.url !== resource?.url;
    });
  }, [item, resource]);

  if (!sources.length) return null;
  const visible = expanded ? sources : sources.slice(0, 3);
  return (
    <View style={[styles.container, { borderTopColor: colors.borderRole.subtle }]}>
      <View style={styles.heading}>
        <Feather name="book-open" size={14} color={colors.textRole.muted} />
        <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>
      </View>
      <Text style={[styles.note, { color: colors.textRole.muted }]}>These links support the explanation or relationship shown here. They are not automatically learning requirements.</Text>
      <View style={styles.links}>
        {visible.map((source, index) => (
          <ExternalLinkGuard
            key={`${source.url}-${index}`}
            url={source.url}
            label={source.title || "Open supporting source"}
            description={`This opens the supporting source recorded for this item.`}
            textStyle={styles.link}
          />
        ))}
      </View>
      {sources.length > 3 ? (
        <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)}>
          <Text style={[styles.more, { color: colors.accentRole.action }]}>{expanded ? "Show fewer sources" : `See all ${sources.length} supporting sources`}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.xs },
  heading: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  title: { fontSize: FontSize.xs },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  links: { gap: 3 },
  link: { fontSize: FontSize.xs },
  more: { fontSize: FontSize.xs, fontWeight: "800" },
});

export default ContextSourceLinks;
