/**
 * ExpertDossierScreen — expert review dashboard for mapping feedback.
 *
 * Displays a list of mapping feedback items (programme-domain, domain-role, and
 * role-skill edge reviews) submitted by educators/domain experts. Each item
 * shows the edge details and feedback type.
 *
 * Wire plan:
 *  - GET /api/career/feedback returns MappingFeedback[] (coming_soon this phase)
 *  - POST /api/career/feedback submits a new feedback item
 *  - MappingFeedbackButton is a standalone component for embedding on detail screens
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, CompassFonts, webContainer } from "../../theme";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { careerData } from "../../lib/careerData";
import type { DataState, MappingFeedback, FeedbackType } from "../../types/career";

const FEEDBACK_COLORS: Record<FeedbackType, { bg: string; text: string; label: string }> = {
  confirm: { bg: "#d4edda", text: "#155724", label: "CONFIRMED" },
  flag: { bg: "#f8d7da", text: "#721c24", label: "FLAGGED" },
  suggest: { bg: "#cce5ff", text: "#004085", label: "SUGGESTION" },
};
// Unknown values (e.g. legacy rows) fall back to a neutral chip instead of crashing.
const FEEDBACK_FALLBACK = { bg: "#e2e3e5", text: "#383d41", label: "OTHER" };

function reviewAnchor(item: MappingFeedback): string {
  if (item.edgeType === "programme_domain") return item.targetId;
  if (item.edgeType === "domain_role") return item.sourceId;
  return "Role and skill reviews";
}

function edgeTitle(item: MappingFeedback): string {
  if (item.edgeType === "programme_domain") return "Programme → domain";
  if (item.edgeType === "domain_role") return "Domain → role";
  if (item.edgeType === "role_skill") return "Role → skill";
  return item.edgeType.replace(/_/g, " → ");
}

export function ExpertDossierScreen() {
  const { colors } = useTheme();
  const [feedback, setFeedback] = useState<DataState<MappingFeedback[]>>({
    status: "pending",
    data: null,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getFeedback();
      if (active) setFeedback(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const rows = feedback.data ?? [];
    const byAnchor = new Map<string, MappingFeedback[]>();
    for (const item of rows) {
      const anchor = reviewAnchor(item);
      byAnchor.set(anchor, [...(byAnchor.get(anchor) ?? []), item]);
    }
    return Array.from(byAnchor.entries()).map(([anchor, items]) => ({
      anchor,
      items,
      flags: items.filter((item) => item.feedbackType === "flag").length,
      suggestions: items.filter((item) => item.feedbackType === "suggest").length,
      confirmations: items.filter((item) => item.feedbackType === "confirm").length,
    }));
  }, [feedback.data]);

  return (
    <AdminShell title="Expert Dossier" eyebrow="Mapping review">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mapping feedback
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            Programme-domain, domain-role, and role-skill edge reviews submitted
            by domain experts and educators. Each item flags a mapping as
            correct, incorrect, unsure, or carries a suggestion.
          </Text>
          <ComingSoonPanel
            state={feedback}
            empty={(rows) => rows.length === 0}
            emptyTitle="No feedback yet"
            emptyBody="Mapping feedback appears here once educators begin reviewing edges."
          >
            {() => (
              <View style={styles.feedbackList}>
                <View style={styles.summaryGrid}>
                  <MetricCard label="Review groups" value={String(grouped.length)} colors={colors} />
                  <MetricCard
                    label="Flags"
                    value={String(grouped.reduce((sum, g) => sum + g.flags, 0))}
                    colors={colors}
                  />
                  <MetricCard
                    label="Suggestions"
                    value={String(grouped.reduce((sum, g) => sum + g.suggestions, 0))}
                    colors={colors}
                  />
                </View>

                {grouped.map((group) => (
                  <View
                    key={group.anchor}
                    style={[
                      styles.groupCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.groupHeader}>
                      <View>
                        <Text style={[styles.edgeType, { color: colors.textMuted }]}>
                          DOMAIN / REVIEW ANCHOR
                        </Text>
                        <Text style={[styles.groupTitle, { color: colors.text }]}>
                          {group.anchor}
                        </Text>
                      </View>
                      <Text style={[styles.meta, { color: colors.textMuted }]}>
                        {group.items.length} review{group.items.length === 1 ? "" : "s"}
                      </Text>
                    </View>

                    <View style={styles.groupStats}>
                      <Text style={[styles.meta, { color: colors.textMuted }]}>
                        {group.confirmations} confirmed · {group.flags} flagged · {group.suggestions} suggested
                      </Text>
                    </View>

                    {group.items.map((item) => (
                      <View
                        key={item.id}
                        style={[styles.feedbackCard, { borderColor: colors.border }]}
                      >
                        <View style={styles.cardTop}>
                          <Text style={[styles.edgeType, { color: colors.textMuted }]}>
                            {edgeTitle(item)}
                          </Text>
                          <View
                            style={[
                              styles.badge,
                              {
                                backgroundColor: (FEEDBACK_COLORS[item.feedbackType] ?? FEEDBACK_FALLBACK).bg,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                { color: (FEEDBACK_COLORS[item.feedbackType] ?? FEEDBACK_FALLBACK).text },
                              ]}
                            >
                              {(FEEDBACK_COLORS[item.feedbackType] ?? FEEDBACK_FALLBACK).label}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.edgeLabel, { color: colors.text }]}>
                          {item.sourceId} → {item.targetId}
                        </Text>
                        {item.notes ? (
                          <Text style={[styles.notes, { color: colors.textSoft }]}>
                            {item.notes}
                          </Text>
                        ) : null}
                        <Text style={[styles.meta, { color: colors.textMuted }]}>
                          Trust: {Math.round(item.trustWeight * 100)}% ·{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default ExpertDossierScreen;

function MetricCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: -Spacing.xs,
  },
  feedbackList: { gap: Spacing.md },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  metricCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minWidth: 130,
    flexGrow: 1,
  },
  metricValue: {
    fontSize: FontSize.xl,
  },
  metricLabel: {
    fontSize: FontSize.xs,
    textTransform: "uppercase",
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  groupTitle: {
    fontSize: FontSize.md,
  },
  groupStats: {
    marginTop: -Spacing.xs,
  },
  feedbackCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  edgeType: {
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    flex: 1,
  },
  badge: {
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  edgeLabel: {
    fontSize: FontSize.md,
  },
  notes: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
  },
  meta: {
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
