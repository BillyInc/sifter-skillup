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
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, Brand, FontWeight, webContainer } from "../../theme";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";
import { careerData } from "../../lib/careerData";
import type { DataState, MappingFeedback, FeedbackType } from "../../types/career";

const FEEDBACK_COLORS: Record<FeedbackType, { bg: string; text: string; label: string }> = {
  correct: { bg: "#d4edda", text: "#155724", label: "CORRECT" },
  incorrect: { bg: "#f8d7da", text: "#721c24", label: "INCORRECT" },
  unsure: { bg: "#fff3cd", text: "#856404", label: "UNSURE" },
  suggestion: { bg: "#cce5ff", text: "#004085", label: "SUGGESTION" },
};

export function ExpertDossierScreen() {
  const { colors, isDark } = useTheme();
  const [feedback, setFeedback] = useState<DataState<MappingFeedback[]>>({
    status: "pending",
    data: null,
  });

  const load = useCallback(async () => {
    const result = await careerData.getFeedback();
    setFeedback(result);
  }, []);

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
            {(items) => (
              <View style={styles.feedbackList}>
                {items.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.feedbackCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.cardTop}>
                      <Text style={[styles.edgeType, { color: colors.textMuted }]}>
                        {item.edgeType.replace(/_/g, " / ")}
                      </Text>
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: FEEDBACK_COLORS[item.feedbackType].bg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: FEEDBACK_COLORS[item.feedbackType].text },
                          ]}
                        >
                          {FEEDBACK_COLORS[item.feedbackType].label}
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
            )}
          </ComingSoonPanel>
        </View>
      </ScrollView>
    </AdminShell>
  );
}

export default ExpertDossierScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: -Spacing.xs,
  },
  feedbackList: { gap: Spacing.md },
  feedbackCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
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
    fontWeight: FontWeight.bold,
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
    fontWeight: FontWeight.black,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  edgeLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
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