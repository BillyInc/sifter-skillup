import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { RoleWorkProfile } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { studentSafeUrl } from "@/lib/studentCareerBoundary";

type Props = { profile?: RoleWorkProfile | null };

const WEF_CATEGORY_LABELS: Record<string, string> = {
  fastest_growing_pct: "among the fastest-growing roles by percentage",
  fastest_declining_pct: "among the fastest-declining roles by percentage",
  largest_growth_absolute: "among roles with the largest projected growth in number",
  largest_decline_absolute: "among roles with the largest projected decline in number",
  emerging_tech_roles: "listed as an emerging technology role",
};

function FutureOfWorkSignals({ profile, labelColor, copyColor }: { profile: RoleWorkProfile; labelColor: string; copyColor: string }) {
  if (!profile.wefSignals.length) return null;
  const explanations = Array.from(new Set(profile.wefSignals.flatMap((signal) => signal.categories.map((category) => WEF_CATEGORY_LABELS[category] || category))));
  const sourceUrl = profile.wefSignals.map((signal) => studentSafeUrl(signal.sourceUrl)).find((url): url is string => Boolean(url));
  return (
    <View style={{ gap: Spacing.xs }}>
      <Text style={[styles.label, { color: labelColor }, CompassFonts.bodySemibold]}>Future-of-work signal</Text>
      <Text style={[styles.copy, { color: copyColor }]}>The World Economic Forum included “{profile.wefSignals[0].wefLabel}” in a global employer-survey trend list: {explanations.join("; ")}. This is a global projection, not Nigerian demand or a promise of employment.</Text>
      {sourceUrl ? <ExternalLinkGuard url={sourceUrl} label="Open the WEF source" description="This opens the source for the global future-of-work signal. It is not Nigerian demand data." /> : null}
    </View>
  );
}

/** Presents occupation evidence separately from a role's preparation path. */
export function RoleWorkEvidenceBlock({ profile }: Props) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  if (!profile) return null;

  if (profile.sourceRecordStatus === "not_available") {
    return <View style={{ gap: Spacing.sm }}><SectionLabel>Work evidence</SectionLabel><Text style={[styles.copy, { color: colors.textRole.muted }]}>A detailed occupation activity profile is not attached to this role yet. No duties or Nigerian demand have been inferred from the title alone.</Text></View>;
  }

  const activities = expanded ? profile.activities : profile.activities.slice(0, 5);
  const hiddenCount = Math.max(0, profile.activities.length - activities.length);
  const firstZone = profile.jobZones[0];
  const firstEducation = profile.educationSignals[0]?.label;
  const studentSourceLinks = profile.sourceLinks
    .map((source) => ({ ...source, url: studentSafeUrl(source.url) }))
    .filter((source): source is typeof source & { url: string } => Boolean(source.url));
  return (
    <View style={{ gap: Spacing.md }}>
      <View style={{ gap: Spacing.sm }}>
        <SectionLabel>What this work involves</SectionLabel>
        <Text style={[styles.copy, { color: colors.textRole.secondary }]}>These are source-reported activities for the mapped occupation. They help you picture the work before deciding what to learn.</Text>
        <View style={{ gap: Spacing.xs }}>{activities.map((activity, index) => <Text key={`${activity}-${index}`} style={[styles.item, { color: colors.textRole.primary }]}>• {activity}</Text>)}</View>
        {hiddenCount > 0 || expanded ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)} style={[styles.moreButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{expanded ? "Show fewer activities" : `See all ${profile.activities.length} activities`}</Text></TouchableOpacity> : null}
      </View>
      {(firstZone?.name || firstEducation) ? <View style={{ gap: Spacing.xs }}><Text style={[styles.label, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Preparation signals</Text>{firstZone?.name ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}><Text style={CompassFonts.bodySemibold}>Preparation signal: </Text>{firstZone.name.replace(/^Job Zone [^:]+:\s*/i, "")}</Text> : null}{firstEducation ? <Text style={[styles.copy, { color: colors.textRole.secondary }]}><Text style={CompassFonts.bodySemibold}>Education signal: </Text>{firstEducation}</Text> : null}</View> : null}
      {profile.relatedOccupations.length ? <View style={{ gap: Spacing.xs }}><Text style={[styles.label, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Related occupation examples</Text><Text style={[styles.copy, { color: colors.textRole.secondary }]}>{profile.relatedOccupations.join(" · ")}</Text></View> : null}
      <View style={{ gap: Spacing.xs }}><Text style={[styles.label, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>Evidence limits and further reading</Text>{profile.limitations.map((limitation, index) => <Text key={`${limitation}-${index}`} style={[styles.copy, { color: colors.textRole.muted }]}>• {limitation}</Text>)}{studentSourceLinks.length ? studentSourceLinks.map((source, index) => <ExternalLinkGuard key={`${source.url}-${index}`} url={source.url} label={source.label ? `Open ${source.label}` : "Open occupation source"} description="This opens the source used to explain the role activities." />) : <Text style={[styles.copy, { color: colors.textRole.muted }]}>No verified student link is attached to this work evidence yet.</Text>}</View>
      <FutureOfWorkSignals profile={profile} labelColor={colors.textRole.primary} copyColor={colors.textRole.secondary} />
    </View>
  );
}

const styles = {
  copy: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.45, ...CompassFonts.body },
  item: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.45, ...CompassFonts.body },
  label: { fontSize: FontSize.sm, letterSpacing: 0.6, textTransform: "uppercase" as const },
  moreButton: { alignSelf: "flex-start" as const, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  moreText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
};
